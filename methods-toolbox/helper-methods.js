window.HELPER_METHODS = window.HELPER_METHODS || {};

window.HELPER_METHODS.get_panel_content = async (coords) =>{    
    if(coords)
        return await window.API_HANDLING.send_requests(coords);
    else
        return await window.LOCATION_HANDLING.load_locations();
};

window.HELPER_METHODS.typeof = (obj) => {
  return Array.isArray(obj) ? 'array' : typeof obj;
};

/**
 * Safely get a nested object/array value by dot-path from a provided root object.
 * Throws if path is invalid.
 * Example: get_object("a.b.0.c", root)
 */
window.HELPER_METHODS.get_object = (path, json_obj) => {
  if (typeof path !== 'string' || path.length === 0) {
    throw new Error('get_object: path must be a non-empty string');
  }
  if (json_obj == null) throw new Error('get_object: json_obj must be provided');

  const keys = path.split('.');
  let curr = json_obj;

  for (const rawKey of keys) {
    if (curr == null) throw new Error('object path is invalid');

    if (Array.isArray(curr)) {
      const idx = parseInt(rawKey, 10);
      if (Number.isNaN(idx)) throw new Error(`get_object: expected array index but got "${rawKey}"`);
      curr = curr[idx];
    } else if (typeof curr === 'object') {
      curr = curr[rawKey];
    } else {
      throw new Error('object path is invalid');
    }
  }

  if (curr == null) throw new Error('object path is invalid');
  return curr;
};

/**
 * Set a nested value at dot-path on the provided root object.
 * Creates intermediate objects/arrays if they don't exist, choosing
 * array vs object based on whether the next path segment is an integer.
 *
 * Example: set_object("a.b.0.c", value, root)
 */
window.HELPER_METHODS.set_object = (path, value, json_obj) => {
  if (typeof path !== 'string' || path.length === 0) {
    throw new Error('set_object: path must be a non-empty string');
  }
  if (json_obj == null) throw new Error('set_object: json_obj (root) must be provided');

  const keys = path.split('.');
  let curr = json_obj;

  for (let i = 0; i < keys.length; i++) {
    const rawKey = keys[i];
    const isLast = i === keys.length - 1;

    if (Array.isArray(curr)) {
      const idx = parseInt(rawKey, 10);
      if (Number.isNaN(idx)) throw new Error(`set_object: expected array index but got "${rawKey}"`);

      if (isLast) {
        curr[idx] = value;
        return json_obj;
      }

      if (curr[idx] == null || (typeof curr[idx] !== 'object')) {
        const nextKey = keys[i + 1];
        curr[idx] = /^\d+$/.test(nextKey) ? [] : {};
      }
      curr = curr[idx];
    } else if (typeof curr === 'object') {
      if (isLast) {
        curr[rawKey] = value;
        return json_obj;
      }

      if (curr[rawKey] == null || (typeof curr[rawKey] !== 'object')) {
        const nextKey = keys[i + 1];
        curr[rawKey] = /^\d+$/.test(nextKey) ? [] : {};
      }
      curr = curr[rawKey];
    } else {
      throw new Error('set_object: cannot traverse non-object/non-array');
    }
  }

  return json_obj;
};

// Load a local JSON file from your extension directory
window.HELPER_METHODS.load_json = async function (path) {
    const response = await fetch(chrome.runtime.getURL(path));
    return await response.json();
};