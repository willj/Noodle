module.exports = {
    mergeSettings: function (settings, defaultSettings) {
        Object.keys(defaultSettings).forEach(function(key) {
            if (!settings[key]) {
                settings[key] = defaultSettings[key];
            }
        }, this);
    },

    getTemplateName: function (fileName, pageAttributes, templates) {
        /* 
            TODO:
            - look for a specified template
            - or use filename
            - or fallback to index/post/or similar
        */
        return "index";
    }
};