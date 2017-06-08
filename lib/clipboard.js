'use babel';
import Editor from './editor/editor';

/**
 * Módulo responsável por macros de comentário
 */
export default class Clipboard {

  activate(rechModule) {
    rechModule.addCommands({
      'rech:copiar-linha': () => this.copiarLinha(),
      'rech:colar-linha': () => this.colarLinha(),
      'rech:duplica-acima': () => this.duplicarAcima(),
      'rech:duplica-abaixo': () => this.duplicarAbaixo()
    });
  }

  /**
   * Copiar linha
   */
  copiarLinha() {
    var editor = new Editor();
    if (editor.getSelectionBuffer() != "") {
      this.setClipboardText(editor.getSelectionBuffer());
    } else {
      this.setClipboardText(editor.getCurrentLine() + "\n");
    }
  }

  /**
   * colar linha
   */
  colarLinha() {
    var editor = new Editor();
    if (this.getClipboardText().endsWith("\n")) {
      editor.gotoLineStart();
    }
    editor.paste();
  }

  /**
   * Define o texto do clipboard
   */
  setClipboardText(text) {
    clipboard = require('electron').clipboard;
    clipboard.writeText(text);
  }

  /**
   * Retorna o texto do clipboard
   */
  getClipboardText() {
    clipboard = require('electron').clipboard;
    return clipboard.readText();
  }

  /**
   * Duplica a linha acima
   */
  duplicarAcima() {
    let editor = new Editor();
    if (editor.getSelectionBuffer() == "") {
      let originalRange = editor.getCursor();
      editor.gotoLineStart();
      editor.insertText(editor.getCurrentLine() + '\n');
      editor.moveUp();
      editor.setCursor([editor.getCurrentRow(), originalRange.column]);
    } else {
      editor.selectWholeLines();
      let range = editor.getSelectionRange();
      let buffer = editor.getRangeBuffer(range);
      editor.setCursor(range.start);
      editor.insertText(buffer);
      editor.setSelectionRange([range.start, editor.getSelectionRange().end]);
    }
  }

  /**
   * Duplica a linha abaixo
   */
  duplicarAbaixo() {
    let editor = new Editor();
    if (editor.getSelectionBuffer() == "") {
      let originalRange = editor.getCursor();
      editor.gotoLineEnd();
      editor.insertText('\n' + editor.getCurrentLine());
      editor.setCursor([editor.getCurrentRow(), originalRange.column]);
    } else {
      editor.selectWholeLines();
      let range = editor.getSelectionRange();
      let buffer = editor.getRangeBuffer(range);
      editor.setCursor(range.end);
      editor.insertText(buffer);
      editor.setSelectionRange([range.end, editor.getSelectionRange().start]);
    }
  }

};
