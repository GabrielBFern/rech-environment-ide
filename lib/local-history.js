'use babel';
import Editor from './editor/editor';
import File from './commons/file';
import Path from './commons/path';

/**
 * Módulo responsável pela geração do PSPadBK
 */
export default class LocalHistory {

  /** Extensões que devem gerar PSPadBk */
  PSPADBK_EXTENSIONS = [".BAT", ".CBL", ".CFG", ".CPY", ".DEF", ".DIV", ".HTM", ".INI", ".MER", ".RUL", ".TPL", ".VBS", ".XML"];

  activate(rechModule) {
    atom.workspace.observeActivePaneItem((pane) => {
      if (this.oldPaneDisposable != undefined) {
        this.oldPaneDisposable.dispose();
      }
      if (pane != undefined && pane.onDidSave != undefined) {
        this.oldPaneDisposable = pane.onDidSave((evt) => {
          this.createLocalHistory(evt.path)
        });
      }
    });
  }

  /**
   * Cria o histórico local
   */
  createLocalHistory(filename) {
    var path = new Path(filename);
    if (this.mustCreatePspadbk(path)) {
      this.createPspadbk(path);
    }
  }

  /**
   * Verifica se deve criar PSPadBk
   */
  mustCreatePspadbk(path) {
    var ext = path.extension().toUpperCase();
    return this.PSPADBK_EXTENSIONS.indexOf(ext) > 0;
  }

  /**
   * Cria o PSPadBk
   */
  createPspadbk(origin) {
    // Monta e cria o diretório de PSPadBk
    var bkPath = origin.directory() + "\\PSPadBk";
    new File(bkPath).mkdir();
    // Monta o nome do arquivo e copia ele pra lá
    var bkFileName = this.createBkFileName(bkPath, origin);
    new File(origin).copy(bkFileName);
  }

  /**
   * Monta o nome do arquivo de backup
   */
  createBkFileName(bkPath, origin) {
    var timeStamp = require('moment')().format("YYYYMMDD[_]hhmmssSSS");
    return `${bkPath}\\${origin.baseName()}_${timeStamp}_${process.env['USER']}${origin.extension()}.bk`;
  }

};
