'use babel';
import Editor from './editor/editor';

/**
 * Módulo responsável por macros de comentário
 */
export default class Comentarios {

  activate(rechModule) {
    rechModule.addCommands({
      'rech:cobol-insere-linha-comentario': () => this.insereLinhaComentario()
    });
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
