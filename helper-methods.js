window.HELPER_METHODS = window.HELPER_METHODS || {};

// Load a local JSON file from your extension directory
window.HELPER_METHODS.load_json = async function (path) {
    const response = await fetch(chrome.runtime.getURL(path));
    return await response.json();
};

window.HELPER_METHODS.load_locations = async function () {
    let result;
    try {
        // get() resolves to { locations: … }
        result = await chrome.storage.local.get(["locations"]);
    } catch (e) {
        console.error(`issue in load_locations (get): ${e}`);
        result = { locations: undefined };
    }

    if (!result.locations) {
        // If nothing stored yet, fall back to defaults
        const PRIVATE_DATA = await HELPER_METHODS.load_json("./private/data.json");
        const defaults = PRIVATE_DATA.DEFAULT_LOCATIONS;
        console.log("loading default locations");
        try {
            await chrome.storage.local.set({ locations: defaults });
            result.locations = defaults;
        } catch (e) {
            console.error(`issue in load_locations (set): ${e}`);
            // Even if set() fails, return the defaults so the app can keep working
            result.locations = defaults;
        }
    }

    return result.locations; // always an array
};

window.HELPER_METHODS.add_location = async function (location) {
    // Example stub—if you want to add and immediately persist:
    try {
        const { locations = [] } = await chrome.storage.local.get(["locations"]);
        locations.push(location);
        await chrome.storage.local.set({ locations });
        return locations;
    } catch (e) {
        console.error(`issue in add_location: ${e}`);
        throw e;
    }
};

window.HELPER_METHODS.send_requests = async function (coords_gite) {

    const coords_in_cache = await window.HELPER_METHODS.get_cached_location(coords_gite)

    if (coords_in_cache!==undefined)
        return coords_in_cache.time

    try {
        const PRIVATE_DATA = await HELPER_METHODS.load_json("./private/data.json");
        const CONSTANTS = await HELPER_METHODS.load_json("./general-constants.json");
        const locations = await window.HELPER_METHODS.load_locations();

        console.log(locations)
        console.log(coords_gite)

        const requests = locations.map(async (location) => {
            const coords_depart = `${location.x},${location.y}`;
            console.log(coords_depart)
            const url = `${CONSTANTS.MAPS.CORS_PROXY}https://maps.googleapis.com/maps/api/directions/json?origin=${coords_depart}&destination=${coords_gite}&mode=driving&key=${PRIVATE_DATA.API_KEY}`;

            // console.log(`request sent ${location.location}`)

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            if (data.routes.length > 0 && data.routes[0].legs.length > 0) {
                return {
                    location: location,
                    duration: data.routes[0].legs[0].duration,
                };
            } else {
                throw new Error(`Aucun Itinéraire ou étapes trouvés`);
            }
        });

        const times = await Promise.all(requests);
        await window.HELPER_METHODS.cache_timings(coords_gite, times);
        return times;
    } catch (error) {
        console.error("Error in send_requests:", error);
        throw error;
    }
};


const MONTH_MILLIS = 1000 * 60 * 60 * 24 * 30;

window.HELPER_METHODS.cache_timings = async function (coords, timings) {
    const result = await chrome.storage.local.get(["timings"]);
    let current = result.timings || {};

    current[coords] = {
        time: timings,
        date: Date.now()
    };

    await chrome.storage.local.set({ timings: current });
};

window.HELPER_METHODS.get_cached_location = async function(coords) {
    const result = await chrome.storage.local.get(["timings"]);
    const timings = result.timings || {};
    const timings_in_cache = timings[coords];

    if (timings_in_cache !== undefined) {
        // Refresh timestamp
        timings[coords].date = Date.now();
        await chrome.storage.local.set({ timings });
    }

    return timings_in_cache;
};

window.HELPER_METHODS.clear_cache = async function () {
    await chrome.storage.local.set({ timings: {} });
};

window.HELPER_METHODS.restart_cache = async function () {
    const result = await chrome.storage.local.get(["timings"]);
    const cache = result.timings || {};

    let changed = false;

    for (let coords in cache) {
        const is_expired = Date.now() > cache[coords].date + MONTH_MILLIS;
        if (is_expired) {
            delete cache[coords];
            changed = true;
        }
    }

    if (changed) {
        await chrome.storage.local.set({ timings: cache });
    }
};
