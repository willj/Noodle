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
    posts: {},
    postCount: 0,
    
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

        this.generatePostPages();
    },

    processPage: function(filePath, fileName){
        let docSourcePath = this.settings.sourceDir + filePath + fileName;
        let doc = fm(fs.readFileSync(docSourcePath, "utf8"));

        if (this.isInPostsDirectory(filePath)){
            doc.attributes.type = "post";
        }

        let model = this.settings;
        model.doc = doc.attributes;
        model.fileSource = docSourcePath;
        model.fileDestination = this.getFileDestination(filePath, fileName, doc.attributes);

        let templateName = util.getTemplateName(filePath + fileName, doc.attributes, this.templates);  

        if (templateName == undefined) return;

        if ("type" in model.doc && model.doc.type == "post"){
            this.indexPost(model);
        }

        let html = this.renderPage(this.templates[templateName], md.render(doc.body), model);

        if (model.fileDestination.path){
            util.createDir(this.settings.outputDir + model.fileDestination.path);
        }

        fs.writeFile(this.settings.outputDir + model.fileDestination.path + model.fileDestination.fileName, html, (err) => {
            if (err) return console.error(err);
        });
    },

    indexPost: function(post){
        let d = util.getPostDate(post.doc.date);

        // postCount ensures all posts have a unique key when getTime() is the same
        this.posts["p-" + d.getTime() + "-" + this.postCount] = {
            fileSource: post.fileSource,
            fileDestination: post.fileDestination,
            attributes: post.doc,
            postDate: d
        };
        
        this.postCount += 1;
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
            let d = util.getPostDate(pageAttributes.date);

            let postPathDate = (this.settings.useDateInPostUrls) ? d.getFullYear() + "/" + (d.getMonth() + 1) + "/" : "";

            if (this.settings.removeFileExtFromUrls){
                return {
                    path: postPathDate + util.getSlug(pageAttributes.title) + "/",
                    fileName: "index.html"
                }
            } else {
                return {
                    path: postPathDate,
                    fileName: util.getSlug(pageAttributes.title) + ".html"
                }
            }
        }

        // no permalink, and isn't a post
        if (this.settings.removeFileExtFromUrls){
            return {
                path: filePath + "/" + path.parse(fileName).name + "/",
                fileName: "index.html"
            }
        } else {
            return {
                path: filePath,
                fileName: path.parse(fileName).name + ".html"
            }
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

    getPostPagePaths: function(){
        /*
            TODO: work out blog paths
            if pp has dir or name and no extension, create dir, set pagingPath to dir/pagingPath
            if pp has no extension and no dir - then create dir from name, set pagingPath to dir/pagingPath
            if pp has extension and no dir do nothing, set pagingPath to pagingPath
            if pp has extension and dir, then create dir, set pagingPath to dir/pagingPath

            each page needs to create a /2/index.html
        */

        let pp = path.parse(this.settings.postsPermalink);

        if (pp.ext){

        }

        console.log(pp);
    },

    generatePostPages: function(){

        let postPaths = this.getPostPagePaths();

        let pageOfPosts = [];
        let pageNum = 1;

        Object.keys(this.posts).sort((a,b) => {
            // sort numerically after discarding prefix "p-" and postfix "-postCount"
            a = a.split("-");
            b = b.split("-");
            return a[1] - b[1];
        }).forEach((post) => {
            pageOfPosts.push(this.posts[post]);

            if (pageOfPosts.length >= this.settings.postsPerPage){
                this.generatePostPage(pageOfPosts, pageNum);
                pageOfPosts = [];
                pageNum += 1;
            }
        });

        // generate the last page of posts
        if (pageOfPosts.length > 0){
            this.generatePostPage(pageOfPosts, pageNum);
        }
    },

    generatePostPage: function(posts, pageNum){
        // console.log(pageNum);
        // console.log(posts);

        let model = this.settings;
        model.pageNum = pageNum;
        model.posts = posts;

        //console.log(posts);

        let templateName = util.getTemplateName(this.settings.postsPermalink, {type: "posts"}, this.templates);  

        if (templateName == undefined) return;

        let html = this.renderPage(this.templates[templateName], "", model);

        //console.log(html);

        let fileDestination = this.settings.outputDir + this.settings.postsPermalink;

        if (pageNum > 1){
            let fileDestination = this.settings.outputDir + pageNum + "/" + this.settings.postsPermalink;
        }

        

        fs.writeFile(fileDestination, html, (err) => {
            if (err) return console.error(err);
        });

        // let docSourcePath = this.settings.sourceDir + filePath + fileName;
        // let doc = fm(fs.readFileSync(docSourcePath, "utf8"));

        // if (this.isInPostsDirectory(filePath)){
        //     doc.attributes.type = "post";
        // }

        // let model = this.settings;
        // model.doc = doc.attributes;
        // model.fileSource = docSourcePath;
        // model.fileDestination = this.getFileDestination(filePath, fileName, doc.attributes);

        // let templateName = util.getTemplateName(filePath + fileName, doc.attributes, this.templates);  

        // if (templateName == undefined) return;

        // if ("type" in model.doc && model.doc.type == "post"){
        //     this.indexPost(model);
        // }

        // let html = this.renderPage(this.templates[templateName], md.render(doc.body), model);

        // if (model.fileDestination.path){
        //     util.createDir(this.settings.outputDir + model.fileDestination.path);
        // }

        // fs.writeFile(this.settings.outputDir + model.fileDestination.path + model.fileDestination.fileName, html, (err) => {
        //     if (err) return console.error(err);
        // });

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
    },

    isInPostsDirectory: function(dir){
        return (dir.indexOf(this.settings.postsDir.replace(/^\.\//, "")) === 0);
    }
};