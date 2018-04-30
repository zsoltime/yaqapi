'use strict';

const mongoose = require('mongoose');

const quoteSchema = mongoose.Schema(
  {
    quote: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Author',
      required: true,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    keywords: {
      type: Array,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

quoteSchema.statics.getRandom = function getRandom(limit = 1) {
  return this.aggregate([
    {
      $sample: { size: parseInt(limit, 10) },
    },
  ]);
};

quoteSchema.virtual('href').get(function getURL() {
  // TODO: Use site URL instead of the hardcoded one
  return `http://localhost:3002/api/quotes/${this._id}`;
});

quoteSchema.index({ quote: 'text' });

module.exports = mongoose.model('Quote', quoteSchema);
