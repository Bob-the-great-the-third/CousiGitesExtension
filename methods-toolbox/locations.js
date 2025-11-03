window.LOCATION_HANDLING = window.LOCATION_HANDLING || {};

window.LOCATION_HANDLING.load_locations = async function () {
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

    await chrome.storage.local.set({ locations: filteredLocs });
    
    await window.CACHE_HANDLING.remove_location(location);
}

window.LOCATION_HANDLING.locations_are_equals = function (locationA, locationB) {
    const SAME_NAME = locationA.location == locationB.location
    const SAME_X_COORD = locationA.x == locationB.x
    const SAME_Y_COORD = locationA.y == locationB.y

    return SAME_NAME && SAME_X_COORD && SAME_Y_COORD
}

window.LOCATION_HANDLING.parse_location_input = function (loc_input){
    try{
        let resulting_loc = { location: loc_input.location!="" ? loc_input.location : "Sans nom" };

        if(!loc_input.y || !loc_input.x){
            const coords_to_parse = loc_input.x ? loc_input.x : loc_input.y;

            const split_coords = coords_to_parse.split(",");
            if (split_coords.length<2)
                throw Error("Only one value(latitude/longitude) could be identified");

            loc_input.x=split_coords[0];
            loc_input.y=split_coords[1];
        }

        resulting_loc["x"]=window.LOCATION_HANDLING.parse_singular_coord(loc_input.x.trim());
        resulting_loc["y"]=window.LOCATION_HANDLING.parse_singular_coord(loc_input.y.trim());

        return resulting_loc;
    }catch(e){
        throw Error(`Added coordinates couldn't be parsed, ${e.message}`) 
    } 
}

window.LOCATION_HANDLING.parse_singular_coord = function (coord_value){
    const REGEX = {
        DMS:  /^(?<degrees>180|1[0-7]\d|[1-9]?\d)°\s*(?<minutes>[0-5]?\d)'\s*(?<seconds>[0-5]?\d(?:\.\d+)?)"\s*(?<direction>[NSEW])?$/i,
        DDD: /^-?(?:180|1[0-7]\d|[1-9]?\d)(?:\.\d+)?$/
    }

    if (REGEX.DDD.test(coord_value))
        return coord_value;

    const DMS_REGEX_EVAL = coord_value.match(REGEX.DMS)

    if (!DMS_REGEX_EVAL)
        throw Error("Not DDD nor DMS coordinates \
        Sorry other coordinates systems are yet to be implemented! You may want to look into a converter online")
    
    const null_matches = DMS_REGEX_EVAL.filter((match) => match)

    if (null_matches.length!=DMS_REGEX_EVAL.length)
        throw Error("DMS lacks a key (a number(° or ' or \") or the direction(NSEW))\n\
        Sorry other coordinates systems are yet to be implemented! You may want to look into a converter online")
    
    const sign = DMS_REGEX_EVAL.groups.direction.toLowerCase() in ["s", "w"] ? -1 : 1;

    const coord_ddd = (parseInt(DMS_REGEX_EVAL.groups.degrees) +
                    parseInt(DMS_REGEX_EVAL.groups.minutes) / 60 + 
                    parseFloat(DMS_REGEX_EVAL.groups.seconds) / 3600)

    return sign * coord_ddd
}