'use strict';

const mongoose = require('mongoose');
const slugify = require('slug');

const SlugModel = require('./Slug');

const authorSchema = mongoose.Schema(
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
    image: String,
    nationality: String,
    profession: String,
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

authorSchema.query.bySlug = function findBySlug(slug) {
  return this.find({ slug });
};

authorSchema.virtual('href').get(function getURL() {
  // TODO: Use site URL instead of the hardcoded one
  return `http://localhost:3002/api/authors/${this._id}`;
});

function ensureUniqueSlug(next) {
  mongoose.models.Author.count({ slug: this.slug })
    .exec()
    .then((res) => {
      if (res === 0) {
        return null;
      }
      return SlugModel.findOneAndUpdate(
        { slug: this.slug },
        { $inc: { count: 1 } },
        { upsert: true, new: true }
      ).exec();
    })
    .then((res) => {
      if (res) {
        this.slug = `${this.slug}-${res.count}`;
      }
      return next();
    });
}

authorSchema.pre('save', ensureUniqueSlug);

module.exports = mongoose.model('Author', authorSchema);
