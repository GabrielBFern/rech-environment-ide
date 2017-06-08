'use babel';
import Path from '../commons/path';
import File from '../commons/File';
import WcVersao from '../commons/wc-versao';


/**
 * Classe para manipulação do editor do Atom
 */
export default class Editor {

  /**
   * Retorna o caminho do arquivo em edição
   */
  getPath() {
    return new Path(this.getActiveEditor().getPath());
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
   * Retorna a seleção no editor
   */
  getSelectionRange() {
    return this.getActiveEditor().getSelectedBufferRange();
  }

  /**
   * Define a seleção no editor
   */
  setSelectionRange(range) {
    return this.getActiveEditor().setSelectedBufferRange(range);
  }

  /**
   * Retorna o buffer de um range
   */
  getRangeBuffer(range) {
    return this.getActiveEditor().getTextInBufferRange(range);
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
   * Retorna a seleção corrente ou seleciona a palavra corrente
   */
  selectionOrSelectCurrentWord() {
    if (this.getSelectionBuffer() == "") {
      this.selectCurrentWord();
    }
    return this.getSelectionBuffer();
  }

  /**
   * Faz com que a seleção atual contemple linhas inteiras
   */
  selectWholeLines() {
    var ranges = this.getActiveEditor().getSelectedBufferRanges();
    for (var i in ranges) {
      var range = ranges[i];
      if (range.end.column == 0 && range.start.row != range.end.row) {
        ranges[i] = [[range.start.row, 0], [range.end.row, 0]];
      } else {
        ranges[i] = [[range.start.row, 0], [range.end.row + 1, 0]];
      }
    }
    this.getActiveEditor().setSelectedBufferRanges(ranges);
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
   * Retorna a linha corrente
   */
  getCurrentRow() {
    var editor = this.getActiveEditor();
    var cursor = editor.getCursorBufferPosition();
    return cursor.row;
  }

  /**
   * Retorna o conteúdo de uma linha no editor
   */
  getCurrentLine() {
    return this.getLine(this.getActiveEditor().getCursorBufferPosition().row);
  }

  /**
   * Define o conteúdo da linha corrente
   */
  setCurrentLine(text) {
    let row = this.getCurrentRow();
    let cursor = this.getCursor();
    this.getActiveEditor().setTextInBufferRange([[row, 0], [row, this.getCurrentLine().length]], text);
    this.setCursor(cursor);
  }

  /**
   * Retorna o tamanho da linha corrente
   */
  getCurrentLineSize() {
    return this.getCurrentLine().replace(/ +$/, '').length;
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
   * Retorna a posição do cursor
   */
  getCursor() {
    return this.getActiveEditor().getCursorBufferPosition();
  }

  /**
   * Posiciona o cursor na coluna. Funciona com múltiplos cursores
   */
  gotoColumn(column) {
    let cursors = this.getActiveEditor().getCursorBufferPositions();
    let first = true;
    for (var i in cursors) {
      let size = this.getLine(cursors[i].row).length;
      let diff = column - size;
      if (diff > 0) {
        this.getActiveEditor().setTextInBufferRange([[cursors[i].row, size], [cursors[i].row, size]], " ".repeat(diff));
      }
      if (first) {
        this.getActiveEditor().setCursorBufferPosition([cursors[i].row, column]);
        first = false;
      } else {
        this.getActiveEditor().addCursorAtBufferPosition([cursors[i].row, column]);
      }
    }
  }

  /**
   * Define a posição do cursor
   */
  position(cursor) {
    atom.workspace.open(cursor[0]).then((textEditor) => {
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
   * Retorna uma promise com o Path de um arquivo relativo ao arquivo corrente
   */
  findFilePath(fileName) {
    // Função que retorna um Path se ele existe, ou dispara um erro
    returnIfExist = function(fullFile) {
      if (new File(fullFile).exists()) {
        return fullFile;
      }
      throw new Error("Could not find " + fullFile);
    }
    return new Promise((resolve, fail) => {
      let currentFile = this.getPath();
      try {
        // Tenta resolver com o arquivo do diretório corrente
        resolve(returnIfExist(currentFile.setFileName(fileName)));
      } catch(exception) {
        new WcVersao().currentWc().then((wc) => {
          try {
            // Tenta retornar o arquivo do diretório corrente
            return returnIfExist(wc.paths.fontes().setFileName(fileName));
          } catch(exception) {
            new WcVersao().des().then((versao) => {
              try {
                // Tenta retornar o arquivo do diretório corrente
                return returnIfExist(versao.paths.fontes().setFileName(fileName));
              } catch(exception) {
                fail("Copy não encontrado: " + fileName);
              }
            });
          }
        });
      }
    });
  }

  /**
   * Digita o texto no editor
   */
  type(text) {
    this.getActiveEditor().insertText(text);
  }

  /**
   * Insere um texto no editor
   */
  insertText(text) {
    this.getActiveEditor().insertText(text);
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
   * Move o cursor para a linha posterior
   */
  moveDown() {
    this.getActiveEditor().moveDown();
  }

  /**
   * Move o cursor para a linha anterior
   */
  moveUp() {
    this.getActiveEditor().moveUp();
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
  gotoLineStart(line) {
    if (line == undefined) {
      this.getActiveEditor().moveToBeginningOfLine();
    } else {
      // TODO: Trocar para buffer position
      this.getActiveEditor().setCursorScreenPosition([line, 0]);
    }
  }

  /**
   * Vai para o final da linha
   */
  gotoLineEnd() {
    this.getActiveEditor().moveToEndOfLine();
  }

  /**
   * Exibe o diálogo de busca e troca
   */
  showFindAndReplaceDialog() {
    atom.commands.dispatch(atom.views.getView(this.getActiveEditor()), 'find-and-replace:show');
  }

  /**
   * Busca o próximo resultado
   */
  findNext() {
    atom.commands.dispatch(atom.views.getView(this.getActiveEditor()), 'find-and-replace:find-next');
  }

  /**
   * Busca o próximo resultado
   */
  findPrevious() {
    atom.commands.dispatch(atom.views.getView(this.getActiveEditor()), 'find-and-replace:find-previous');
  }

  /**
   * Apaga primeiro conteúdo anterior ao cursor
   */
  backspace() {
    this.getActiveEditor().backspace();
  }

  /**
   * Substitui a linha corrente baseado em uma expressão regular
   */
  currentLineReplace(regex, replace) {
    let result = this.getCurrentLine().replace(regex, replace);
    this.setCurrentLine(result);
  }

  /**
   * Retorna o editor atual
   */
  getActiveEditor() {
    return atom.workspace.getActivePaneItem();
  }

};
