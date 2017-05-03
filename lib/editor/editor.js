'use babel';

/**
 * // TODO: Classe para realizar o linter (Exibição de marcações de erros) em código Cobol
 */
export default class Editor {

  /**
   * Retorna o caminho do arquivo em edição
   */
  getPath() {
    return this.getActiveEditor().getPath();
  }

  /**
   * Retorna o buffer completo do editor
   */
  getEditorBuffer() {
    return this.getActiveEditor().getText();
  }

  /**
   * Retorna o buffer da seleção no editor
   */
  getSelectionBuffer() {
    return this.getActiveEditor().getSelectedText();
  }

  /**
   * Troca o conteúdo da seleção
   */
  replaceSelection(buffer) {
    this.getActiveEditor().setTextInBufferRange(this.getActiveEditor().getSelectedBufferRange(), buffer);
  }

  /**
   * Retorna a seleção corrente ou a palavra sob o cursor
   */
  selectionOrCurrentWord() {
    if (this.getSelectionBuffer() != "") {
      return this.getSelectionBuffer();
    } else {
      return this.getCurrentWord();
    }
  }

  /**
   * Retorna a palavra corrente
   */
  getCurrentWord() {
    var editor = this.getActiveEditor();
    var cursor = editor.getCursorBufferPosition();
    var currentLine = editor.lineTextForBufferRow(cursor.row);
    // Pattern para encontrar "palavras" inteiras no Cobol
    var pattern = /([\w\-]|\(@\)|\(#\))+/g;
    let match = pattern.exec(currentLine);
    while (match !== null) {
      // Se o cursor está dentro do Match, usa essa match como seleção
      if (match.index <= cursor.column && pattern.lastIndex >= cursor.column) {
          return match[0];
      }
      match = pattern.exec(currentLine);
    }
    return "";
  }

  /**
   * Seleciona a palavra abaixo do cursor
   */
  selectCurrentWord() {
    var editor = this.getActiveEditor();
    var cursor = editor.getCursorBufferPosition();
    var currentLine = editor.lineTextForBufferRow(cursor.row);
    // Pattern para encontrar "palavras" inteiras no Cobol
    var pattern = /([\w\-]|\(@\)|\(#\))+/g;
    let match = pattern.exec(currentLine);
    while (match !== null) {
      // Se o cursor está dentro do Match, usa essa match como seleção
      if (match.index <= cursor.column && pattern.lastIndex >= cursor.column) {
          break;
      }
      match = pattern.exec(currentLine);
    }
    // Se achou algo
    if (match !== null) {
      editor.setSelectedBufferRange([[cursor.row, match.index], [cursor.row, pattern.lastIndex]]);
    }
  }

  /**
   * Retorna o conteúdo de uma linha no editor
   */
  getCurrentLine() {
    return this.getLine(this.getActiveEditor().getCursorBufferPosition().row);
  }

  /**
   * Retorna o conteúdo de uma linha no editor
   */
  getLine(lineIndex) {
    return this.getActiveEditor().lineTextForBufferRow(lineIndex);
  }

  /**
   * Define a posição do cursor
   */
  setCursor(cursor) {
    return this.getActiveEditor().setCursorBufferPosition(cursor);
  }

  /**
   * Define a posição do cursor
   */
  position(cursor) {
    atom.workspace.open(cursor[0]).then((textEditor) => {
      console.log(textEditor);
      textEditor.setCursorBufferPosition([cursor[1], cursor[2]]);
    });
  }

  /**
   * Retorna se o arquivo aberto atualmente é um Bat
   */
  isBat() {
    return this.getActiveEditor().getPath().toLowerCase().endsWith(".bat");
  }

  /**
   * Retorna se o arquivo aberto atualmente é um Bat
   */
  isRuby() {
    return this.getActiveEditor().getPath().toLowerCase().endsWith(".rb");
  }

  /**
   * Insere um snippet na linha acima. Funciona para mútiplos cursores
   */
  insertSnippetAboveCurrentLine(snippet) {
    var editor = this.getActiveEditor();
    // Insere uma linha acima do cursor
    editor.insertNewlineAbove();
    // Insere o snippet
    editor.insertText(snippet);
  }

  /**
   * Insere um snippet na linha acima. Funciona para mútiplos cursores
   */
  insertSnippetAboveCurrentLineNoIdent(snippet) {
    var editor = this.getActiveEditor();
    // Insere uma linha acima do cursor, deletando os espaços que o Atom adicionar
    editor.insertNewlineAbove();
    editor.deleteToBeginningOfLine();
    // Insere o snippet
    editor.insertText(snippet);
  }

  /**
   * Move o cursor para a linha anterior
   */
  moveDown() {
    this.getActiveEditor().moveDown();
  }

  /**
   * Executa uma busca no Buffer em edição
   */
  scan(regex, iterator) {
      this.getActiveEditor().scan(regex, iterator);
  }

  /**
   * Cola o conteúdo do clipboard no texto
   */
  paste() {
    this.getActiveEditor().pasteText();
  }

  /**
   * Vai para o início da linha
   */
  gotoLineStart() {
    this.getActiveEditor().moveToBeginningOfLine();
  }

  /**
   * Retorna o editor atual
   */
  getActiveEditor() {
    return atom.workspace.getActivePaneItem();
  }

};
