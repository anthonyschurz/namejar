var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var leadSchema = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String },
  location: { type: String },
  linkedin: { type: String }
});

var Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;
