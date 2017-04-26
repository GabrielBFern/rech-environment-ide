'use babel';

/**
 * Classe para fazer busca em buffers
 */
export default class Scan {

  constructor(buffer) {
    this.buffer = buffer;
    this.lastLine = {
      row: 0,
      index: 0
    };
  }

  /**
   * Faz a busca
   */
  scan(regexp, iterator) {
    var match = regexp.exec(this.buffer);
    var interrupt = false;
    while (match != null && !interrupt) {
      // Chama o callback de iteração
      iterator({
        match: match,
        row: this.countLinesTo(match.index),
        column: match.index - this.lastLine.index,
        lineContent: this.buffer.substring(this.lastLine.index, this.buffer.indexOf('\n', this.lastLine.index)).replace("\r", ""),
        stop: function() {
          interrupt = true;
        }
      });
      match = regexp.exec(this.buffer);
    }
  }

  /**
   * Conta as linhas até o índice especificado
   */
  countLinesTo(index) {
    var notProcessed = this.buffer.substring(this.lastLine.index);
    var patt = /\n/g;
    var match = patt.exec(notProcessed);
    var lastIndex = this.lastLine.index;
    while (match != null) {
      if (this.lastLine.index + match.index > index) {
        break;
      }
      this.lastLine.row++;
      lastIndex = this.lastLine.index + match.index + 1;
      match = patt.exec(notProcessed);
    }
    this.lastLine.index = lastIndex;
    return this.lastLine.row;
  }

}
