const fs = require('fs');
const path = require('path');
const http = require('http');

exports.checkNull = function(obj, str) {
    if (!obj) {
        throw new Error(str);
    }
}

exports.getSourceMap = function(sourceMap) {
    let sourceMapContent;
    switch(sourceMapType(sourceMap)) {
        case 'interUrl':
            break;
        case 'fileUrl':
            sourceMapContent = JSON.parse(fs.readFileSync(sourceMap, {
                encodeing: 'utf8',
            }));
            break;
        default:
            sourceMapContent = sourceMap;
            break;
    };
    return sourceMapContent;
}

function sourceMapType(value) {
    const typeMap = {
        'interUrl': '((https?|ftp)://)?(([a-zA-Z0-9\._-]+\.[a-zA-Z]{2,6})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))',
        'fileUrl': '^(((\.{1,2})?\/)|([A-Z]:\\\\))',
    };
    let type;
    Object.keys(typeMap).forEach((key) => {
        const regex = new RegExp(typeMap[key]);
        if (regex.test(value)) {
            type = key;
        }
    });
    return type;
}