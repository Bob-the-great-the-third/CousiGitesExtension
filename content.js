async function main() {
    const HELPER_METHODS=window.HELPER_METHODS

    HELPER_METHODS.restart_cache()

    const CONSTANTS = await HELPER_METHODS.load_json("./general-constants.json");

    const div=document.getElementById(CONSTANTS.GRAND_GITES.FINDING_COORDS.DIV_ID)

    if(!div){
        const locations = await HELPER_METHODS.load_locations()
        load_right_panel(locations)
        return
    }

    const coords = div.getAttribute(CONSTANTS.GRAND_GITES.FINDING_COORDS.ATTRIBUTE);

    const times=await window.HELPER_METHODS.send_requests(coords)
    load_right_panel(times)
}

main();

function load_right_panel(times) {
  if (document.getElementById('my-left-panel')) return;

  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('panel/panel.html');
  iframe.id = 'my-left-panel';
  iframe.style.cssText = `
    position: fixed;
    top: 5vh;
    right: 0;
    width: 15vw;
    height: 95vh;
    border: none;
    z-index: 100000;
    box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  `;
  document.body.appendChild(iframe);

  // console.log(times)
  // console.log(tytimes)
  
  iframe.onload = () => {
    iframe.contentWindow.postMessage({ type: 'data', payload: times}, '*');
  };
}