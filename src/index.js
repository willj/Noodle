/// <reference path="typings/node/node.d.ts" />

"use strict";

const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const fm = require("front-matter");
const hbs = require("Handlebars");
const md = require("markdown-it")({ html: true });
const util = require("./util");

const defaultSettings = {
    name: "A Noodle site",
    outputDir: "./docs/", 
    sourceDir: "./site/",
    templateDir: "./templates/",
    partialsDir: "./templates/partials/",
    removeOutputDir: true
};

module.exports = function(settings) {
    
    console.log("This is Noodle!");

    util.mergeSettings(settings, defaultSettings);

    if (settings.removeOutputDir){
        rimraf.sync(settings.outputDir);
    }

    util.createDir(settings.outputDir);

    loadPartials(settings.partialsDir);

    let templates = loadTemplates(settings.templateDir);

    let pages = fs.readdirSync(settings.sourceDir).filter((file) => {
        return path.extname(file) === ".md";
    });

    pages.forEach((page) => {
        let doc = fm(fs.readFileSync(settings.sourceDir + page, "utf8"));

        let model = settings;
        model.doc = doc.attributes;

        let templateName = util.getTemplateName(page, doc, templates);

        let html = renderPage(templates[templateName], md.render(doc.body), model);

        util.createDir(settings.outputDir + "test/sub/dir/creation");

        fs.writeFile(settings.outputDir + path.parse(page).name + ".html", html, (err) => {
            if (err) return console.error(err);
        })

    });
}

function renderPage (template, body, model) {
    
    hbs.registerPartial("body-content", body);

    return hbs.compile(template)(model);
}

function loadTemplates(dir){
    let templates = [];

    fs.readdirSync(dir)
    .filter((file) => {
        return path.extname(file) === ".hbs";
    })
    .forEach((file) => {
        templates[path.parse(file).name] = fs.readFileSync(dir + file, "utf8");
    }, this);

    return templates;
}

function loadPartials(dir){
    fs.readdirSync(dir)
    .filter((file) => {
        return path.extname(file) === ".hbs";
    })
    .forEach((file) => {
        regPartial(dir + file);
    }, this);
}

function regPartial(file) {
    if (!fs.statSync(file).isFile()) {
        return console.error("Partial " + file + " not found!");
    }

    let partialContent = fs.readFileSync(file, "utf8");

    hbs.registerPartial(path.parse(file).name, partialContent);
}