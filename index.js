/// <reference path="typings/node/node.d.ts" />

const fs = require("fs");
const fm = require("front-matter");
const hbs = require("Handlebars");
const md = require("markdown-it")({ html: true });

const defaultSettings = {
    name: "A Noodle site",
    root: "src/"
};

module.exports = function(settings){
    console.log("This is Noodle!");
}