'use babel';
import Editor from './editor/editor';

/**
 * Módulo responsável por macros de comentário
 */
export default class Clipboard {

  activate(rechModule) {
    rechModule.addCommands({
      'rech:copiar-linha': () => this.copiarLinha(),
      'rech:colar-linha': () => this.colarLinha()
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

};
