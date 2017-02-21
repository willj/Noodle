/// <reference path="typings/node/node.d.ts" />

"use strict";

const fs = require("fs");
const path = require("path");

module.exports = {
    mergeSettings: function (userSettings, defaultSettings) {
        let mergedSettings = userSettings;
        
        Object.keys(defaultSettings).forEach((key) => {
            mergedSettings[key] = (key in userSettings) ? userSettings[key] : defaultSettings[key];
        });

        return mergedSettings;
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