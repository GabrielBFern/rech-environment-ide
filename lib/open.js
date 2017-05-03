'use babel';
import Editor from './editor/editor';
import File from './commons/file';
import Path from './commons/path';
import WcVersao from './commons/wc-versao';

/**
 * Módulo responsável pelos scripts de abertura de arquivos
 */
export default class Open {

  activate(rechModule) {
    rechModule.addCommands({
      'rech:abre-fontes-wc': () => this.abreFontesWorkingCopy(),
      'rech:abre-fontes-consulta': () => this.abreFontesConsulta(),
      'rech:abre-bat': () => this.abreBat(),
      'rech:abre-cursor': () => this.abreArquivoCursor()
    });
  }

  /**
   * Abre no diretório do Working-Copy
   */
  abreFontesWorkingCopy() {
    new WcVersao().currentWc().then((wc) => {
      this.abreDiretorio("F:\\SIGER\\WC\\DES\\" + wc.name + "\\FON\\", [
         {name: 'Fontes Cobol', extensions: ['cpy', 'cbl', 'cpb', 'tpl']},
         {name: 'Programas Cobol', extensions: ['cbl']},
         {name: 'Copys Cobol', extensions: ['cpy', 'cpb']},
         {name: 'Templates', extensions: ['tpl']}
      ]);
    });
  }

  /**
   * Abre no diretório dos fontes de consulta
   */
  abreFontesConsulta() {
    this.abreDiretorio("F:\\FONTES\\", [
       {name: 'Fontes Cobol', extensions: ['cpy', 'cbl', 'cpb', 'tpl']},
       {name: 'Programas Cobol', extensions: ['cbl']},
       {name: 'Copys Cobol', extensions: ['cpy', 'cpb']},
       {name: 'Templates', extensions: ['tpl']}
    ]);
  }

  /**
   * Abre no diretório de bats
   */
  abreBat() {
    this.abreDiretorio("F:\\BAT\\", [
       {name: 'Scripts', extensions: ['bat', 'rb']},
       {name: 'Scripts Ruby', extensions: ['rb']},
       {name: 'Bats', extensions: ['bat']}
    ]);
  }

  /**
   * Executa o diálogo de abrir em um diretório
   */
  abreDiretorio(diretorio, filters) {
    dialog = require("electron").remote.dialog;
    var self = this;
    dialog.showOpenDialog({defaultPath: diretorio, filters: filters, properties:['openFile', 'multiSelections']}, function(filenames) {
      if (filenames != undefined) {
        self.abre(filenames)
      }
    });
  }

  /**
   * Abre o arquivo sobre o cursor
   */
  abreArquivoCursor() {
    editor = new Editor();
    if (editor.getSelectionBuffer() != "") {
      this.abre(editor.getSelectionBuffer());
      return;
    }
    // Tenta abrir um COPY
    match = /COPY\s+(.*)\./.exec(editor.getCurrentLine());
    if (match != undefined) {
      this.abre(match[1]);
      return;
    }
    // Tenta abrir um resultado do fongrep
    match = /(...*):(\d+):/.exec(editor.getCurrentLine());
    if (match != undefined) {
      this.abre(match[1], parseInt(match[2]));
      return;
    }
    // Tenta abrir um programa com CALL
    match = /CALL\s+\"(.*?)"/.exec(editor.getCurrentLine());
    if (match != undefined) {
      this.abre(match[1] + ".CBL");
      return;
    }
  }

  /**
   * Abre um ou mais arquivos no editor
   */
  abre(filenames, line) {
    if (!Array.isArray(filenames)) {
      filenames = [filenames];
    }
    for (var i in filenames) {
      var file = new File(filenames[i]);
      // Tenta abrir a via completa
      if (this.tentaAbrir(file.path, line)) {
        continue;
      }
      new WcVersao().currentWc().then((wc) => {
        // Se existe no Working-Copy
        if (this.tentaAbrir("F:\\SIGER\\WC\\DES\\" + wc.name + "\\FON\\" + file.path, line)) {
          return;
        }
        // Tenta abrir no F:\Fontes
        if (this.tentaAbrir("F:\\Fontes\\" + file.path, line)) {
          return;
        }
        // Tenta abrir no F:\Bat
        if (this.tentaAbrir("F:\\Bat\\" + file.path, line)) {
          return;
        }
        atom.notifications.addWarning("Arquivo " + file.path + " não encontrado!");
      });
    }
  }

  /**
   * Tenta abrir um arquivo
   */
  tentaAbrir(filename, line) {
    if (new File(filename).exists()) {
      atom.workspace.open(filename).then((editor) => {
        if (typeof(line) == "number") {
          editor.setCursorBufferPosition([line, 0]);
        }
      });
      return true;
    }
    return false;
  }

};
