'use strict';

const mongoose = require('mongoose');
const slugify = require('slug');

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    default: function defaultSlug() {
      return this.name ? slugify(this.name, { lower: true }) : null;
    },
    lowercase: true,
    required: true,
    trim: true,
    unique: true,
  },
});

categorySchema.query.bySlug = function findBySlug(slug) {
  return this.find({ slug });
};

module.exports = mongoose.model('Category', categorySchema);
