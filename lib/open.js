'use babel';
import Editor from './editor/editor';
import File from './commons/file';
import Path from './commons/path';
import Exec from './commons/exec';
import WcVersao from './commons/wc-versao';

/**
 * Módulo responsável pelos scripts de abertura de arquivos
 */
export default class Open {

  activate(rechModule) {
    rechModule.addCommands({
      'rech:abre-fontes-wc': () => this.abreFontesWorkingCopy(),
      'rech:abre-fontes-consulta': () => this.abreFontesConsulta(),
      'rech:abre-bat': () => this.abreBat()
    });
  }

  /**
   * Abre no diretório do Working-Copy
   */
  abreFontesWorkingCopy() {
    new WcVersao().currentWc().then((wc) => {
      this.abreDiretorio(wc.paths.fontes, [
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
    new WcVersao().des().then((versao) => {
      this.abreDiretorio(versao.paths.fontes, [
         {name: 'Fontes Cobol', extensions: ['cpy', 'cbl', 'cpb', 'tpl']},
         {name: 'Programas Cobol', extensions: ['cbl']},
         {name: 'Copys Cobol', extensions: ['cpy', 'cpb']},
         {name: 'Templates', extensions: ['tpl']}
      ]);
    });
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
    if (diretorio instanceof Path) {
      diretorio = diretorio.fullPath();
    }
    dialog = require("electron").remote.dialog;
    dialog.showOpenDialog({defaultPath: diretorio, filters: filters, properties:['openFile', 'multiSelections']}, (filenames) => {
      if (filenames != undefined) {
        this.abre(filenames)
      }
    });
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
