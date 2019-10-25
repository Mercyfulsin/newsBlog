const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const NoteSchema = new Schema({
  title:{type: String, required: true},
  body: {type: String, required: true}
});
const Comment = mongoose.model("Comment", NoteSchema);

module.exports = Comment;
