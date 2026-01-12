chrome.runtime.onMessage.addListener(async (msg, _sender, _sendResponse) => {
    // If message is intended for something else than content (e.g. background), don't try and interpret it 
    if (msg.destination.toLowerCase() !== 'content') return;

    switch (msg.objective) {
        case 'REMOVE_LOCATION':
            window.LOCATION_HANDLING.remove_location(msg.data);
            break;
        case 'ADD_LOCATION':
            const location = window.LOCATION_HANDLING.parse_location_input(msg.data);
            await window.LOCATION_HANDLING.add_location(location);

            const coords = await window.COORDS_EXTRACTION.get_coords_in_page();
            const panel_content = await window.HELPER_METHODS.get_panel_content(coords);
            load_right_panel(panel_content)

            break;
        case 'ADJUST_PANEL_HEIGHT':
            const iframe = document.getElementById('my-panel');
            iframe.style.height = (msg.data /16) + 'em';
            break;
        default:
            console.log('Message not identified in "CousiGites" extension.');
            break;
    }
})