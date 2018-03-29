const fs = require('fs');
const readline = require('readline');
const chalk = require('chalk');
const argv = require('yargs').argv;
const { SourceMapConsumer } = require('source-map');

class SourceMapHelper {
    constructor(sourceMapConsumer) {
        this.sourceMapConsumer = sourceMapConsumer;
    }

    getOriginPosition({
        line = 1,
        column = 1,
    }) {
        const original = this.sourceMapConsumer.originalPositionFor({
            line,
            column,
        });
        return original;
    }

    getOriginContent({
        line = 1,
        column = 1,
        content = 3,
    }) {
        const original = this.getOriginPosition({
            line,
            column,
        });
        let originContent = chalk`\r\n{bgRed ErrorFile: ${original.source}}\r\n\r\n`;
        this.sourceList.forEach((source) => {
            if (source.sourceName === original.source) {
                source.sourceContent.split('\r\n').map((lineContent, lineIndex) => {
                    if ((lineIndex + 1 >= original.line - content) && (lineIndex + 1 <= original.line + content)) {
                        const line = `${lineIndex + 1}: ${lineContent}\r\n`;
                        originContent += (lineIndex + 1) === original.line ? chalk.red(line) : line;
                    }
                })
            };
        })
        return originContent;
    }

    get sourceList() {
        const sourceList = this.sourceMapConsumer.sources.map(sourceName => {
            let sourceContent = this.sourceMapConsumer.sourceContentFor(sourceName);
            return {
                sourceName,
                sourceContent,
            };
        });
        return sourceList;
    }
}

const sourceMap = JSON.parse(fs.readFileSync('./build/index.js.map', {
    encodeing: 'utf8',
}));
const sourceMapConsumer = new SourceMapConsumer(sourceMap);
sourceMapConsumer.then((result) => {
    const sourceMapHelper = new SourceMapHelper(result);
    console.log(sourceMapHelper.getOriginContent({
        line: 10567,
        column: 22,
    }));
})
