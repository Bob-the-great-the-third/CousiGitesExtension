window.COORDS_EXTRACTION = window.COORDS_EXTRACTION || {};

window.COORDS_EXTRACTION.STRATEGIES = {

    'json-script-tag': async (config) => {
        // Extract from the script tag
        const scriptTag = document.querySelector(config.selectors.scriptTag);

        if(!scriptTag)
            return;

        console.log(scriptTag)

        const jsonText = scriptTag.textContent.trim().replace(/^<!--/, '').replace(/-->$/, '');

        const data = JSON.parse(jsonText);

        if(!data)
            return;
        
        let curr_value = data;

        for(let key of config.selectors.path.split(".")){
            curr_value = curr_value[key];
            if(!curr_value)
                return;
        }

        return curr_value.lat + ", " + curr_value.lng;
    },

    'element-attribute-by-id': async (config) => {
        const div = document.getElementById(config.selectors.divId);

        if (!div) {
            return;
        }

        return div.getAttribute(config.selectors.attribute);
    },

    'api-intercept': async (config) => { /* intercept network calls */ },
};