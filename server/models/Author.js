const mongoose = require('mongoose');
const slug = require('slug');

const authorSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    default: function defaultSlug() {
      return this.name ? slug(this.name, { lower: true }) : null;
    },
    lowercase: true,
    required: true,
    unique: true,
  },
  image: String,
  nationality: String,
  profession: String,
});

module.exports = mongoose.model('Author', authorSchema);
