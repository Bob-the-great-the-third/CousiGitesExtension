window.CACHE_HANDLING = window.CACHE_HANDLING || {};

const MONTH_MILLIS = 1000 * 60 * 60 * 24 * 30;

window.CACHE_HANDLING.cache_timings = async function (coords, timings) {
    const result = await chrome.storage.local.get(["timings"]);

    let current = result.timings || {};

    current[coords] = {
        time: timings,
        date: Date.now()
    };

    await chrome.storage.local.set({ timings: current });
};

window.CACHE_HANDLING.get_cached_location = async function(coords) {
    const result = await chrome.storage.local.get(["timings"]);
    const timings = result.timings || {};
    console.log("timings cache");
    console.log(timings)
    const timings_in_cache = timings[coords];

    if (timings_in_cache !== undefined) {
        // Refresh timestamp
        timings[coords].date = Date.now();
        await chrome.storage.local.set({ timings });
    }

    return timings_in_cache;
};

window.CACHE_HANDLING.clear_cache = async function () {
    await chrome.storage.local.set({ timings: {} });
};

window.CACHE_HANDLING.remove_location = async (location) =>{
    const { timings = {} } = await chrome.storage.local.get(["timings"]);

    let revised_timings = {};
    for( let timing in timings ){

        const DATA_IS_EXPIRED = Date.now() > timings[timing].date + MONTH_MILLIS;
        if (DATA_IS_EXPIRED){
            delete timings[timing];
            continue;
        }

        const time = timings[timing].time.filter((cached_loc) =>
             !window.LOCATION_HANDLING.locations_are_equals(location, cached_loc.location)
        );

        revised_timings[timing] = {
            date: timings[timing].date,
            time: time
        }
    }

    await chrome.storage.local.set({ timings: revised_timings });
};

window.CACHE_HANDLING.restart_cache = async function () {
    const result = await chrome.storage.local.get(["timings"]);
    const cache = result.timings || {};

    let changed = false;

    for (let coords in cache) {
        const IS_EXPIRED = Date.now() > cache[coords].date + MONTH_MILLIS;
        if (IS_EXPIRED) {
            delete cache[coords];
            changed = true;
        }
    }

    if (changed) {
        await chrome.storage.local.set({ timings: cache });
    }
};

