/**
 * Provide a function for creating a new Document in Node
 */

  const jsdom = require('jsdom')
  const { JSDOM } = jsdom
  const { window } = new JSDOM()

  var $ = require('jquery')(window);
  var document = window.document;
  global.document = document;
  global.$ = $;
