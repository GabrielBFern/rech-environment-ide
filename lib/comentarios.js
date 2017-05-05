'use babel';
import Editor from './editor/editor';

/**
 * Módulo responsável por macros de comentário
 */
export default class Comentarios {

  activate(rechModule) {
    rechModule.addCommands({
      'rech:insere-linha-comentario': () => this.insereLinhaComentario(),
      'rech:insere-separador': () => this.insereSeparador()
    });
  }

  /**
   * Intere linha de comantário
   */
  insereSeparador() {
    var editor = new Editor();
    if (editor.isBat()) {
      editor.insertSnippetAboveCurrentLineNoIdent("rem --------------------------------------------------------------------------------------------------------------------")
    } else if (editor.isRuby()) {
      editor.insertSnippetAboveCurrentLineNoIdent("# ----------------------------------------------------------------------------------------------------------------------")
    } else {
      editor.insertSnippetAboveCurrentLineNoIdent("      *>--------------------------------------------------------------------------------------------------------------<*")
    }
    editor.moveDown();
  }

  /**
   * Intere linha de comantário
   */
  insereLinhaComentario() {
    var editor = new Editor();
    if (editor.isBat()) {
      editor.insertSnippetAboveCurrentLineNoIdent("rem ")
    } else if (editor.isRuby()) {
      editor.insertSnippetAboveCurrentLine("# ")
    } else {
      editor.insertSnippetAboveCurrentLineNoIdent("      *>-> ")
    }
  }

};
