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

    getTemplateName: function (filePath, pageAttributes, templates) {

        // if a template was specified, and it exists, use it
        if ("template" in pageAttributes){
            if (pageAttributes.template in templates){
                return pageAttributes.template;
            } else {
                console.warn("The template '" + pageAttributes.template + "' specified by '" + filePath  + "' does not exist.");
            }
        }

        // if a template name matches a filename, use that
        if (path.parse(filePath).name in templates){
            return path.parse(filePath).name;
        }

        // if the type property (page|post|custom..) was specified and a template name matches use that
        if ("type" in pageAttributes && pageAttributes.type in templates){
            return pageAttributes.type;
        }

        // otherwise index should be default
        if ("index" in templates){
            return "index";
        } else {
            console.error("No matching template can be found for " + filePath);
        }
    },

    getSlug: function(title){
        return title;   // TODO: This needs to create a usable slug
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