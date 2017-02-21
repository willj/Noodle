/// <reference path="typings/node/node.d.ts" />

'use strict'

const fs = require("fs");
const path = require("path");

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
    },

    createDir: function (path) {

        let createdPath = "";

        path.split("/").forEach((dir) => {
            if (dir == "." || dir == "") {
                return true;
            } 
            
            try {
                fs.mkdirSync(createdPath + dir);
            } catch (error) { }

            createdPath += dir + "/";
        });
    }
};