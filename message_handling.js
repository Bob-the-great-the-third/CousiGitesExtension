chrome.runtime.onMessage.addListener(async (msg, _sender, _sendResponse) => {
    switch(msg.objective){
        case 'REMOVE_LOCATION':
            window.LOCATION_HANDLING.remove_location(msg.data);
            break;
        case 'ADD_LOCATION':
            const location = window.LOCATION_HANDLING.parse_location_input(msg.data);
            await window.LOCATION_HANDLING.add_location(location);
            break;
        default:
            console.log('Message not identified in "CousiGites" extension.');
            break;
    }
})