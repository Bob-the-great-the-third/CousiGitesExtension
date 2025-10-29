window.LOCATION_HANDLING = window.LOCATION_HANDLING || {};

window.LOCATION_HANDLING.load_locations = async function () {
    console.log("Loading the location...");
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
        const defaults = window.PRIVATE_METHODS.default_locations();
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

    console.log("Location loaded.");

    return result.locations; // always an array
};

window.LOCATION_HANDLING.add_location = async function (location) {
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

window.LOCATION_HANDLING.remove_location = async function (location) {
    const { locations = [] } = await chrome.storage.local.get(["locations"]);
    
    const filteredLocs = locations.filter((loc)=> !window.LOCATION_HANDLING.locations_are_equals(loc, location))

    console.log(filteredLocs)

    await chrome.storage.local.set({ locations: filteredLocs });
    
    await window.CACHE_HANDLING.remove_location(location);

    
}

window.LOCATION_HANDLING.locations_are_equals = function (locationA, locationB) {
    const SAME_NAME = locationA.location == locationB.location
    const SAME_X_COORD = locationA.x == locationB.x
    const SAME_Y_COORD = locationA.y == locationB.y

    return SAME_NAME && SAME_X_COORD && SAME_Y_COORD
}

chrome.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
    console.log("msg received!");
    window.LOCATION_HANDLING.remove_location(msg);
})