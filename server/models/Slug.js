'use strict';

const mongoose = require('mongoose');

const slugSchema = mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  count: {
    type: Number,
    default: 1,
  },
});

module.exports = mongoose.model('Slug', slugSchema);
