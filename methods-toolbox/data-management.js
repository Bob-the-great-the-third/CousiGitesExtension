window.DATA_MANAGEMENT = window.DATA_MANAGEMENT || {};

window.DATA_MANAGEMENT.save_extension_data = ( last_save = false ) => {
  try{
    chrome.runtime.sendMessage({
      destination:"background",
      objective:"save_data",
      last_save: last_save,
      data: window.DATA_MANAGEMENT.data
    })
  }catch(e){
    throw Error("Extension data couldn't be saved properly!" + e);
  }
}

window.DATA_MANAGEMENT.load_extension_data = async () => {

  const STATE_WAS_PROPERLY_SAVED = await chrome.storage.local.get(["extension_was_properly_closed"])

  if (!STATE_WAS_PROPERLY_SAVED)
    throw Error("The extension wasn't closed properly! Extension data may be corrupted!")

  await chrome.storage.local.set({ extension_was_properly_closed: false })

  const store = await new Promise((resolve) => chrome.storage.local.get(['data'], res => resolve(res)));
  let extension_data = store ? store.data : undefined;

  const DATA_TEMPLATE = window.DATA_MANAGEMENT.create_data_template();

  const new_data_template_filled = window.DATA_MANAGEMENT.hydrateNewWithOldStructure(extension_data, DATA_TEMPLATE);

  console.log("new_data_template_filled")
  console.log(new_data_template_filled)

  if (!new_data_template_filled) {
    console.log("HERE???")
    window.DATA_MANAGEMENT.data = DATA_TEMPLATE;
    return DATA_TEMPLATE;
  }

  window.DATA_MANAGEMENT.data = await window.DATA_MANAGEMENT.remove_expired_data(new_data_template_filled);

  console.log("window.DATA_MANAGEMENT.data")
  console.log(window.DATA_MANAGEMENT.data)

  return window.DATA_MANAGEMENT.data
};

window.DATA_MANAGEMENT.create_data_template = ()=>{
    return {
        request_counter: [],
        total_requests_counter: 0
    }
}

/**
 * Remove expired data nodes defined in constants and persist updated root.
 * extension_data is the raw object stored under storage key 'data'.
 */
window.DATA_MANAGEMENT.remove_expired_data = async (extension_data) => {
  // Load constants.json (must contain EXPIRABLE_DATA)
  const OVERALL_CONSTANTS = await window.HELPER_METHODS.load_json("../constants.json");

  const expirables = OVERALL_CONSTANTS.EXPIRABLE_DATA || [];
  // support both array and object map
  const entries = Array.isArray(expirables)
    ? expirables
    : Object.values(expirables);

  for (const expirable of entries) {
    try {
      // Try to get existing node; skip if path doesn't exist
      let node;
      try {
        node = window.HELPER_METHODS.get_object(expirable.data_path, extension_data);
      } catch (e) {
        // path doesn't exist -> nothing to clean
        continue;
      }

      const updatedNode = window.DATA_MANAGEMENT.filter_expired(node, expirable);

      // If filter_expired returned the same reference (mutated in-place), no need to set.
      // But if it returned a new object/array, write it back.
      const isSameReference = node === updatedNode;
      if (!isSameReference) {
        window.HELPER_METHODS.set_object(expirable.data_path, updatedNode, extension_data);
      }
    } catch (e) {
      console.error("Error: extension couldn't properly clean data, some non-updated data could be shown! " + e.message);
    }
  }

  return extension_data;
};

/**
 * Remove expired entries from a node according to the expirable specification.
 * - data can be an array (filtered) or an object (possibly replaced with {}).
 * - expirable: { lifespan: number, attr?: string }
 */
window.DATA_MANAGEMENT.filter_expired = (data, expirable) => {
  if (data == null) throw new Error("Data corrupted");

  const data_is_expired = (timestamp) => {
    if (timestamp == null || typeof timestamp !== "number") throw new Error("Data corrupted!");
    return Date.now() > timestamp + expirable.lifespan;
  };

  const t = window.HELPER_METHODS.typeof(data);
  switch (t) {
    case "array":
      if (!expirable.attr) {
        // Assume array of timestamps
        return data.filter(item => {
          if (typeof item === 'number') return !data_is_expired(item);
          // If item is object without attr, keep it (or throw depending on your shape)
          return true;
        });
      }
      return data.filter(elt => !data_is_expired(elt[expirable.attr]));
    case "object": {
      let timestamp = expirable.attr ? data[expirable.attr] : data.timestamp;
      if (timestamp == null) throw new Error("Data corrupted");
      if (data_is_expired(timestamp)) return {};
      return data;
    }
    default:
      throw new Error("Data corrupted!");
  }
}

/**
 * Merge oldStruct into newStruct according to the keys/shape defined by oldStruct.
 * - Returns a merged copy of newStruct with values from oldStruct applied where compatible.
 * - Returns undefined if newStruct does not contain required keys/structure from oldStruct.
 *
 * Signature: hydrateNewWithOldStructure(oldStruct, newStruct, opts = {})
 * opts.arrayCompare: 'element' (default) | 'index'
 */
window.DATA_MANAGEMENT.hydrateNewWithOldStructure = function(oldStruct, newStruct, opts = {}) {
  const mode = opts.arrayCompare || 'element';
  const ta = window.HELPER_METHODS.typeof(oldStruct);
  const tb = window.HELPER_METHODS.typeof(newStruct);

  if (ta !== 'object' && ta !== 'array') {
    return newStruct;
  }

  // Types must match for nested merging
  if (ta !== tb) return newStruct;

  // Merge objects: every key in oldStruct must exist in newStruct
  if (ta === 'object') {
    if (typeof newStruct !== 'object' || newStruct === null || Array.isArray(newStruct)) return undefined;
    // Start with a shallow copy of newStruct so we preserve new-only keys
    const merged = Object.assign({}, newStruct);

    for (const k of Object.keys(oldStruct)) {
      if (!(k in newStruct)) return undefined; // required key missing
      const mergedChild = window.DATA_MANAGEMENT.hydrateNewWithOldStructure(oldStruct[k], newStruct[k], opts);
      if (typeof mergedChild === 'undefined') return undefined;
      merged[k] = mergedChild;
    }
    return merged;
  }

  // Merge arrays
  if (ta === 'array') {
    if (!Array.isArray(newStruct)) return undefined;

    // index mode: match indices one-by-one; require newStruct length >= oldStruct length
    if (mode === 'index') {
      if (newStruct.length < oldStruct.length) return undefined;
      const merged = newStruct.slice(); // copy
      for (let i = 0; i < oldStruct.length; i++) {
        const mergedChild = window.DATA_MANAGEMENT.hydrateNewWithOldStructure(oldStruct[i], newStruct[i], opts);
        if (typeof mergedChild === 'undefined') return undefined;
        merged[i] = mergedChild;
      }
      // keep any extra elements in newStruct as-is
      return merged;
    }

    // element mode (default): arrays treated as homogeneous templates
    // require newStruct to have at least one element if old has elements
    if (newStruct.length === 0) {
      // if old is empty too, return empty array; otherwise incompatible
      return oldStruct.length === 0 ? [] : undefined;
    }

    const merged = newStruct.slice(); // start from new template values
    const templateForMissing = newStruct[0];

    for (let i = 0; i < oldStruct.length; i++) {
      // Choose a matching template element:
      // - prefer newStruct[i] if it exists; otherwise use newStruct[0] as the template
      const template = (i < newStruct.length) ? newStruct[i] : templateForMissing;
      const mergedChild = window.DATA_MANAGEMENT.hydrateNewWithOldStructure(oldStruct[i], template, opts);
      if (typeof mergedChild === 'undefined') return undefined;
      merged[i] = mergedChild;
    }

    // If newStruct had more elements than old, preserve them as-is (we started from newStruct.slice()).
    return merged;
  }

  // Fallback (shouldn't happen)
  return undefined;
};