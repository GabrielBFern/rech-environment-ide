'use babel';
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
   *
   */
  abreDiretorio(diretorio, filters) {
    dialog = require("electron").remote.dialog;
    dialog.showOpenDialog({defaultPath: diretorio, filters: filters, properties:['openFile', 'multiSelections']}, function(filenames) {
      for (var i in filenames) {
        atom.workspace.open(filenames[i]);
      }
    });
  }

};
