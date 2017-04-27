'use babel';
import Exec from './exec';
import WcVersao from './wc-versao';

export default class Preproc {

  constructor() {
    this.options = [];
  }

  /**
   * Define o caminho a pré-processar
   */
  setPath(path) {
    this.path = path;
  }

  /**
   * Adiciona opções
   */
  addOptions(options) {
    this.options = this.options.concat(options);
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
    return ['-dc=f:\\fontes\\;f:\\siger\\wc\\des\\'+wc+'\\fon\\'];
  }


}
