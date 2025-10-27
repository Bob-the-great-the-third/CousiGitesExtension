window.HELPER_METHODS = window.HELPER_METHODS || {};

// Load a local JSON file from your extension directory
window.HELPER_METHODS.load_json = async function (path) {
    const response = await fetch(chrome.runtime.getURL(path));
    return await response.json();
};

window.HELPER_METHODS.send_requests = async function (coords_gite) {

    const coords_in_cache = await window.CACHE_HANDLING.get_cached_location(coords_gite)

    if (coords_in_cache!==undefined)
        return coords_in_cache.time

    try {
        const PRIVATE_DATA = await HELPER_METHODS.load_json("./private/data.json");
        const CONSTANTS = await HELPER_METHODS.load_json("./constants.json");
        const locations = await window.LOCATION_HANDLING.load_locations();

        const requests = locations.map(async (location) => {
            const coords_depart = `${location.x},${location.y}`;
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
        await window.CACHE_HANDLING.cache_timings(coords_gite, times);
        return times;
    } catch (error) {
        console.error("Error in send_requests:", error);
        throw error;
    }
};