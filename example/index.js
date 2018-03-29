const SourceMapHelper = require('../lib/index');

SourceMapHelper('D:/gitrepo/source-map-helper/index.js.map').then((sourceMapHelper) => {
    console.log(sourceMapHelper.setConfig({
        line: 10274,
        column: 22,
    }).getResult());
})