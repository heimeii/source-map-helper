const chalk = require('chalk');
const { SourceMapConsumer } = require('source-map');
const { checkNull, getSourceMap } = require('./util');

class SourceMapHelper {
    constructor(sourceMapConsumer) {
        this.sourceMapConsumer = sourceMapConsumer;
    }

    set(key, value) {
        if (value) {
            this[key] = value;
        }
    }

    setLine(value) {
        this.set('line', value);
        return this;
    }

    setColumn(value) {
        this.set('column', value);
        return this;
    }

    setContnetLine(value) {
        this.set('contentLine', value);
        return this;
    }

    setConfig({ line, column, contentLine = 3 }) {
        this.setLine(line);
        this.setColumn(column);
        this.setContnetLine(contentLine);
        return this;
    }

    setOrigin(config) {
        config && this.setConfig(config);
        checkNull(this.line, 'line is null');
        checkNull(this.column, 'column is null');
        this.origin = this.sourceMapConsumer.originalPositionFor({
            line: this.line,
            column: this.column,
        });
        this.sourceList.forEach((source) => {
            if (source.sourceName === this.origin.source) {
                this.origin.content = source.sourceContent;
            };
        });
        return this;
    }

    setTitle(fn) {
        !this.origin && this.setOrigin();
        this.result = fn({
            fileUrl: this.origin.source,
            line: this.origin.line,
            column: this.origin.column,
        });
        return this;
    }

    getResult(config) {
        config && this.setConfig(config) && this.setOrigin();
        !this.origin && this.setOrigin();
        this.result = this.result ? '\r\n' + this.result + '\r\n\r\n' : chalk`\r\n{bgRed ErrorFile: ${this.origin.source}(${this.origin.line}:${this.origin.column})}\r\n\r\n`;
        this.origin.content.split('\r\n').map((lineContent, lineIndex) => {
            if ((lineIndex >= this.minLine) && (lineIndex <= this.maxLine)) {
                const line = `${lineIndex + 1}: ${lineContent}\r\n`;
                this.result += (lineIndex + 1) === this.origin.line ? chalk.red(line) : line;
            }
        });
        return this.result;
    }

    get minLine() {
        return this.origin.line - this.contentLine - 1;
    }

    get maxLine() {
        return this.origin.line + this.contentLine - 1;
    }

    get sourceList() {
        return this.sourceMapConsumer.sources.map(sourceName => {
            const sourceContent = this.sourceMapConsumer.sourceContentFor(sourceName);
            return {
                sourceName,
                sourceContent,
            };
        });
    }
}

module.exports = function(sourceMapUrl) {
    return new Promise((resolve, reject) => {
        const sourceMap = getSourceMap(sourceMapUrl);
        new SourceMapConsumer(sourceMap).then((sourceMapConsumer) => {
            const sourceMapHelper = new SourceMapHelper(sourceMapConsumer);
            resolve(sourceMapHelper);
        })
    });
}
