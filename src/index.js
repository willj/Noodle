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
    postsDir: "./posts/",
    removeOutputDir: true,
    removeFileExtFromUrls: true,
    useDateInPostUrls: true,
    postsPerPage: 10,
    postsPermalink: "index.html",
    postsPagingPath: "page"
};

module.exports = function(userSettings) {
    
    console.log("This is Noodle!");

    noodle.init(util.mergeSettings(userSettings, defaultSettings));

    noodle.run();

}