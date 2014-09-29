var assert = Java.type('org.junit.Assert');
var xslt = require('view/xslt');
var view = resolve('view/test.xsl');

var html = xslt.render(view, '<input/>', {});

assert.assertEquals('<div>Hello</div>', html);
