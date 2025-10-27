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

window.CACHE_HANDLING.restart_cache = async function () {
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

