chrome.runtime.onMessage.addListener(async (msg, _sender, _sendResponse) => {
    // If message is intended for something else than background (e.g. content), don't try and interpret it 
    if (msg.destination.toLowerCase() !== 'background') return;

    switch(msg.objective){
        case "save_data":
            await save_extension_data(msg.data, msg.last_save);
            break;
        default:
            console.log('Message not identified in "CousiGites" extension.');
            break;
    }
})

async function save_extension_data(extension_data, final_save = false){
    // Persist the updated data into chrome.storage.local under key 'data'
    await new Promise((resolve) => {
      chrome.storage.local.set({ 
        data: extension_data, 
        extension_was_properly_closed:final_save 
    }, () => {
        if (chrome.runtime && chrome.runtime.lastError) {
          console.error("Failed to persist cleaned data:", chrome.runtime.lastError);
        }
        resolve();
      });
    });
}