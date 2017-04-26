'use babel';
import Exec from './exec';

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
    return ['preproc.bat', '-dc=f:\\fontes\\'].concat(this.options).concat([this.path]);
  }

  /**
   * Executa o pré-processador
   */
  exec() {
    return new Promise((resolve) => {
       new Exec().exec(this.getCmdArgs(), (process) => {
         resolve();
       });
     });
  }


}
