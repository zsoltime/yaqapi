'use strict';

const mongoose = require('mongoose');
const slugify = require('slug');

const categorySchema = mongoose.Schema(
  {
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
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

categorySchema.query.bySlug = function findBySlug(slug) {
  return this.find({ slug });
};

categorySchema.virtual('href').get(function getURL() {
  // TODO: Use site URL instead of the hardcoded one
  return `http://localhost:3002/api/categories/${this._id}`;
});

module.exports = mongoose.model('Category', categorySchema);
