async function main() {
    await window.CACHE_HANDLING.restart_cache();

    const coords = await  window.COORDS_EXTRACTION.get_coords_in_page();

    const panel_content = await window.HELPER_METHODS.get_panel_content(coords);

    load_right_panel(panel_content)
    return;
}

main();

function load_right_panel(times) {
  let iframe = document.getElementById('my-left-panel');

  if (iframe){
    iframe.contentWindow.postMessage({ type: 'data', payload: times}, '*');
    return;
  }
  
  iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('panel/panel.html');
  iframe.id = 'my-left-panel';
  iframe.style.cssText = get_panel_css();
  document.body.appendChild(iframe);
  iframe.onload = () => {
    iframe.contentWindow.postMessage({ type: 'data', payload: times}, '*');
  };
}

function get_panel_css(){

  const COMMON_PART =  `
    position: fixed;
    border: none;
    z-index: 100000;
    box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  `;

  const hostname = window.location.hostname;
  const config = window.COORDS_EXTRACTION.SITE_CONFIGS[hostname];  
  
  // If config not set the default (Right) option will be selected
  switch(config?.borderPlacement?.toUpperCase()){
    case `TOP`:
      return COMMON_PART + `
        
      `
    case `LEFT`:
      return COMMON_PART + `
        border-radius: 0% 20px 0% 0%;
        width: 15vw;
        height: 95vh;
        top: 5vh;
        left: 0;
      `
    case `BOTTOM`:
      return COMMON_PART + `
        border-radius: 20px 20px 0% 0%;
        width: 90vw;
        height:20vh; 
        bottom: 0;
        left: 5vw;
      `
    case `RIGHT`: default:
      return COMMON_PART + `
        border-radius: 20px 0% 0% 0%;
        width: 15vw;
        height: 95vh;
        top: 5vh;
        right: 0;
      `
  }
}