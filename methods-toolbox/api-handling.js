window.API_HANDLING = window.API_HANDLING || {};

window.API_HANDLING.send_requests = async function (coords_gite) {

    const coords_in_cache = await window.CACHE_HANDLING.get_cached_location(coords_gite)

    if (coords_in_cache !== undefined)
        return coords_in_cache.time

    try {
        const PRIVATE_DATA = await HELPER_METHODS.load_json("./private/data.json");
        const CONSTANTS = await HELPER_METHODS.load_json("./constants.json");
        const locations = await window.LOCATION_HANDLING.load_locations();

        const requests = locations.map(async(location) => window.API_HANDLING.call_api(location, coords_gite,PRIVATE_DATA.API_KEY, CONSTANTS.MAPS.CORS_PROXY));

        const times = await Promise.all(requests);
        await window.CACHE_HANDLING.cache_timings(coords_gite, times);
        return times;
    } catch (error) {
        console.error("Error in send_requests:", error);
        throw error;
    }
};

window.API_HANDLING.call_api = async (location,coords_gite,api_key,cors_proxy) => {
    const coords_depart = `${location.x},${location.y}`;
    const url = `${cors_proxy}https://maps.googleapis.com/maps/api/directions/json?origin=${coords_depart}&destination=${coords_gite}&mode=driving&key=${api_key}`;

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
};