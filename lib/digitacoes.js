'use babel';
import Editor from './editor/editor';
import GeradorCobol from './autocomplete-cobol/gerador-cobol';
import * as Colunas from './identa/colunas';

/**
 * Módulo responsável por macros de comentário
 */
export default class Digitacoes {

  activate(rechModule) {
    rechModule.addCommands({
      'rech:digita-move': () => this.digitaMove(),
      'rech:digita-spaces': () => this.digitaSpaces(),
      'rech:digita-zeros': () => this.digitaZeros(),
      'rech:digita-low-values': () => this.digitaLowValues(),
      'rech:digita-to': () => this.digitaTo(),
      'rech:pontos-ate-fim': () => this.pontosAteFim(),
    });
  }

  /**
   * Digita um MOVE
   */
  digitaMove() {
    var gerador = new GeradorCobol(new Editor());
    gerador.move();
  }

  /**
   * Digita Spaces
   */
  digitaSpaces() {
    new GeradorCobol(new Editor()).spaces();
  }

  /**
   * Digita Zeros
   */
  digitaZeros() {
    new GeradorCobol(new Editor()).zeros();
  }

  /**
   * Digita LowValues
   */
  digitaLowValues() {
    new GeradorCobol(new Editor()).lowvalues();
  }

  /**
   * Digita To
   */
  digitaTo() {
    new GeradorCobol(new Editor()).to();
  }

  /**
   * Digita pontos até o final da linha
   */
  pontosAteFim() {
    var editor = new Editor();
    var cursor = editor.getCurrentLineSize();
    let regex = /\.+$/
    if (cursor > Colunas.COLUNA_FIM && regex.exec(editor.getCurrentLine()) != undefined) {
      editor.setCurrentLine(editor.getCurrentLine().substr(0, Colunas.COLUNA_FIM));
    } else if (cursor == Colunas.COLUNA_FIM && regex.exec(editor.getCurrentLine()) != undefined) {
      editor.currentLineReplace(regex, "");
    } else {
      editor.currentLineReplace(/$/, ".".repeat(Colunas.COLUNA_FIM - cursor));
    }
  }

};
