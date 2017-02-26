"use strict";

const noodle = require("../src");

const settings = {
    siteTitle: "Sample noodle site",
    somethingElse: "123",
    removeFileExtFromUrls: true,
    useDateInPostUrls: true,
    postsPerPage: 1,
    postsPermalink: "index.html"
};

noodle(settings);