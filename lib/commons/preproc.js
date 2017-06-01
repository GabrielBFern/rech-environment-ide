'use babel';
import Exec from './exec';
import Path from './path';
import WcVersao from './wc-versao';

export default class Preproc {

  constructor() {
    this.options = [];
  }

  /**
   * Cria uma instância do préproc para atualização da base local
   */
  static localDatabaseUpdate() {
    let newPreproc = new Preproc();
    newPreproc.addOptions(["-bd", "-bdl", "-is", "-msi"]);
    return newPreproc;
  }

  /**
   * Define o caminho a pré-processar
   */
  setPath(path) {
    if (path instanceof Path) {
      this.path = path.fullPath();
    } else {
      this.path = path;
    }
    return this;
  }

  /**
   * Adiciona opções
   */
  addOptions(options) {
    this.options = this.options.concat(options);
    return this;
  }

  /**
   * Retorna os argumentos command-line para pré-processar
   */
  getCmdArgs() {
    return ['preproc.bat'].concat(this.options).concat([this.path]);
  }

  /**
   * Executa o pré-processador
   */
  exec() {
    return new Promise((resolve) => {
      new WcVersao().currentWc().then((wc) => {
        new Exec().exec(this.getCmdArgs().concat(this.getWcParams(wc)), (process) => {
          resolve();
        });
      });
    });
  }

  /**
   * Retorna os parâmetros do WC
   */
  getWcParams(wc) {
    return ['-dc=f:\\siger\\wc\\des\\'+wc.name+'\\fon\\;f:\\fontes\\'];
  }


}
