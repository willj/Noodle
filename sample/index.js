"use strict";

const noodle = require("../src");

const settings = {
    siteTitle: "Sample noodle site",
    somethingElse: "123",
    removeFileExtFromUrls: true,
    useDateInPostUrls: true,
    postsPerPage: 10
};

noodle(settings);