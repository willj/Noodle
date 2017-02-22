/// <reference path="typings/node/node.d.ts" />

"use strict";

const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const fm = require("front-matter");
const hbs = require("Handlebars");
const md = require("markdown-it")({ html: true });
const util = require("./util");

module.exports = {
    settings: null, 
    templates: null,
    
    init: function (settings){
        this.settings = settings;

        this.loadPartials(this.settings.partialsDir);
        this.templates = this.loadTemplates(this.settings.templateDir);
    },

    run: function(){
        if (this.settings.removeOutputDir){
            rimraf.sync(this.settings.outputDir);
        }

        util.createDir(this.settings.outputDir);

        this.processDirectory(this.settings.sourceDir, "");
    },

    processPage: function(filePath, fileName){
        let doc = fm(fs.readFileSync(this.settings.sourceDir + filePath + fileName, "utf8"));

        let model = this.settings;
        model.doc = doc.attributes;
        model.fileDestination = this.getFileDestination(filePath, fileName, doc.attributes);

        let templateName = util.getTemplateName(filePath + fileName, doc.attributes, this.templates);  

        if (templateName == undefined) return;

        let html = this.renderPage(this.templates[templateName], md.render(doc.body), model);

        if (model.fileDestination.path){
            util.createDir(this.settings.outputDir + model.fileDestination.path);
        }

        fs.writeFile(this.settings.outputDir + model.fileDestination.path + model.fileDestination.fileName, html, (err) => {
            if (err) return console.error(err);
        });
    },

    getFileDestination: function (filePath, fileName, pageAttributes){
        
        // if attributes have a permalink defined
        if ("permalink" in pageAttributes){
            let plink = path.parse(pageAttributes.permalink);

            if (plink.ext){
                return {
                    path: plink.dir + "/",
                    fileName: plink.name + plink.ext
                }
            } else {
                return {
                    path: plink.dir + "/" + plink.name + "/",
                    fileName: "index.html"
                }
            }
        }

        // if it's a post
        if (("type" in pageAttributes && pageAttributes.type == "post")){
            // TODO: should we have a global option to set this? whether to use .html, whether to use year/month
            // return {
            //     path: "year/month/",
            //     fileName: util.getSlug(pageAttributes.title) + ".html"  
            // }
        }

        return {
            path: filePath,
            fileName: path.parse(fileName).name + ".html"
        }

    },

    processDirectory: function(sourceRoot, currentPath){
        fs.readdirSync(sourceRoot + currentPath).forEach((file) => {

            let fileInfo = fs.statSync(sourceRoot + currentPath + file);

            if (fileInfo.isDirectory()){
                util.createDir(this.settings.outputDir + currentPath + file);
                this.processDirectory(sourceRoot, currentPath + file + "/");
            } else if (path.extname(file) === ".md") {
                this.processPage(currentPath, file);
            } else {
                fs.createReadStream(sourceRoot + currentPath + file)
                .pipe(fs.createWriteStream(this.settings.outputDir + currentPath + file));
            }
        });
    },

    renderPage: function (template, body, model) {

        hbs.registerPartial("body-content", body);

        return hbs.compile(template)(model);
    },

    loadTemplates: function(dir){
        let templates = [];

        fs.readdirSync(dir)
        .filter((file) => {
            return path.extname(file) === ".hbs";
        })
        .forEach((file) => {
            templates[path.parse(file).name] = fs.readFileSync(dir + file, "utf8");
        }, this);

        return templates;
    },

    loadPartials: function(dir){
        fs.readdirSync(dir)
        .filter((file) => {
            return path.extname(file) === ".hbs";
        })
        .forEach((file) => {
            this.regPartial(dir + file);
        }, this);
    },

    regPartial: function(file) {
        if (!fs.statSync(file).isFile()) {
            return console.error("Partial " + file + " not found!");
        }

        let partialContent = fs.readFileSync(file, "utf8");

        hbs.registerPartial(path.parse(file).name, partialContent);
    }
};