var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var postSchema = new Schema({
  title: { type: String },
  content: { type: String }
  // leads: [{ type: Schema.Types.ObjectId, ref: 'Lead' }]
});

var Post = mongoose.model('Post', postSchema);

module.exports = Post;
