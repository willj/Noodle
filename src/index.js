/// <reference path="typings/node/node.d.ts" />

"use strict";

const noodle = require("./noodle");
const util = require("./util");

const defaultSettings = {
    siteTitle: "A Noodle site",
    outputDir: "./docs/", 
    sourceDir: "./site/",
    templateDir: "./templates/",
    partialsDir: "./templates/partials/",
    blogDir: "./posts/",
    removeOutputDir: true,
    removeFileExtFromUrls: true
};

module.exports = function(userSettings) {
    
    console.log("This is Noodle!");

    noodle.init(util.mergeSettings(userSettings, defaultSettings));

    noodle.run();

}