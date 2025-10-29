window.HELPER_METHODS = window.HELPER_METHODS || {};

// Load a local JSON file from your extension directory
window.HELPER_METHODS.load_json = async function (path) {
    const response = await fetch(chrome.runtime.getURL(path));
    return await response.json();
};

window.HELPER_METHODS.get_panel_content = async (coords) =>{    
    if(coords)
        return await window.API_HANDLING.send_requests(coords);
    else
        return await window.LOCATION_HANDLING.load_locations();
};