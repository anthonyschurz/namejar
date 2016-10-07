var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/synapse");

module.exports.Lead = require("./lead.js");
module.exports.Post = require("./post.js");
module.exports.Post = require("./user.js");
