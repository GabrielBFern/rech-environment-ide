'use babel';
import Editor from '../editor/editor';
import * as Colunas from '../identa/colunas';

export default class GeradorCobol {

  constructor(editor) {
    this.editor = editor;
  }

  /**
   * Digita um comando MOVE
   */
  move() {
    this.type("MOVE");
    this.gotoCol(Colunas.COLUNA_A);
  }

  /**
   * Digita Spaces
   */
  spaces() {
    this.type("SPACES");
  }

  /**
   * Digita Zeros
   */
  zeros() {
    this.type("ZEROS");
  }

  /**
   * Digita LowValues
   */
  lowvalues() {
    this.type("LOWVALUES");
  }

  /**
   * Digita To
   */
  to() {
    this.gotoColTo();
    this.type("TO");
    this.gotoCol(Colunas.COLUNA_C);
  }

  /**
   * Digita um texto
   */
  type(text) {
    this.editor.type(text);
  }

  /**
   * Vai para a coluna do TO
   */
  gotoColTo() {
    console.log(this.editor.getCurrentLineSize());
    if (this.editor.getCurrentLineSize() < Colunas.COLUNA_B) {
      this.gotoCol(Colunas.COLUNA_B);
    } else {
      if (this.editor.getCurrentLineSize() >= 31) {
        this.gotoCol(Colunas.COLUNA_C);
      } else {
        this.editor.type(" ");
      }
    }
  }

  /**
   * Vai para uma coluna
   */
  gotoCol(coluna) {
    if (this.editor.getCurrentLineSize() < coluna) {
      this.editor.gotoColumn(coluna - 1);
    } else {
      this.editor.type(" ");
    }
  }

};
