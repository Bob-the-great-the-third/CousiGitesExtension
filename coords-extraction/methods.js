window.COORDS_EXTRACTION = window.COORDS_EXTRACTION || {};

window.COORDS_EXTRACTION.get_coords_in_page = async () => {
    const hostname = window.location.hostname;
    const config = window.COORDS_EXTRACTION.SITE_CONFIGS[hostname];

    if (!config || !config.strategy){
      console.error("L'extension ne sait pas extraire les coordonées de ce site");
      return;
    }

    return await window.COORDS_EXTRACTION.STRATEGIES[config.strategy](config);
}