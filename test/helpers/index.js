'use strict';

module.exports.wipeCollections = models =>
  Promise.all(models.map(model => model.remove({})));
