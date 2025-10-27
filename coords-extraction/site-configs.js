window.COORDS_EXTRACTION = window.COORDS_EXTRACTION || {};

window.COORDS_EXTRACTION.SITE_CONFIGS = {
    'www.gites.fr': {
        borderPlacement: "Left",
        strategy: 'json-script-tag',
        selectors: {
            scriptTag: 'script[data-key="initial-state"]',
            path: 'detailPage.apartment.location'
        }
    },
    "www.grandsgites.com":{
        borderPlacement: "Right",
        strategy: 'element-attribute-by-id',
        selectors:{
            divId:"ma_carte",
            attribute:"data-search"
        }
    }
};