'use babel';
import Editor from '../editor/editor';
import Exec from '../commons/exec';
import File from '../commons/file';

/**
 * Módulo responsável pela identação de fontes Cobol
 */
export default class Identa {

  activate(rechModule) {
    rechModule.addCommands({
      'rech:cobol-identa-bloco': () => this.identaBloco(),
      'rech:cobol-identa-bloco-esquerda': () => this.identaBlocoEsquerda(),
      'rech:cobol-identa-bloco-direita': () => this.identaBlocoDireita()
    });
  }

  /**
   * Identa o bloco de comandos selecionado
   */
  identaBloco() {
    this.identaSelecao({});
  }

  /**
   * Identa o bloco de comandos selecionado para a esquerda
   */
  identaBlocoEsquerda() {
    this.identaSelecao({
      recuo: "decrementa"
    });
  }

  /**
   * Identa o bloco de comandos selecionado para a direita
   */
  identaBlocoDireita() {
    this.identaSelecao({
      recuo: "incrementa"
    });
  }

  /**
   * Identa o bloco de comandos selecionado
   */
  identaSelecao(options) {
    var editor = new Editor();
    this.identaBuffer(editor.getSelectionBuffer(), options, (identado) => {
      editor.replaceSelection(identado);
    }, (erro) => {
      atom.notifications.addError(erro);
    });
  }

  /**
   * Identa um buffer
   */
  identaBuffer(buffer, options, okCallback, errCallback) {
    options.tmpFileName = this.buildTmpFileName();
    new File(options.tmpFileName).saveBuffer(buffer);
    // Executa o identador
    new Exec().exec(this.buildCommandLine(options), (processData) => {
      var err = new File(options.tmpFileName + '.err');
      var ident = new File(options.tmpFileName + '.ident');
      if (err.exists()) {
        err.loadBuffer().then((buffer) => {
          errCallback(buffer);
        });
      } else {
        ident.loadBuffer().then((buffer) => {
          okCallback(buffer);
        });
      }
    });
  }

  /**
   * Monta o nome do arquivo temporário
   */
  buildTmpFileName() {
    // TODO: Montar um nomezinho melhor
    return 'c:\\tmp\\nicolas.cbl';
  }

  /**
   * Monta a linha de comando
   */
  buildCommandLine(options) {
    var cmd = "Identa.bat ";
    cmd += options.tmpFileName;
    cmd += ";SRIMSG.CBL;460;";
    switch (options.recuo) {
      case "incrementa":
        cmd += "D";
        break;
      case "decrementa":
        cmd += "E";
        break;
      default:
        cmd += "N";
        break;
    }
    cmd += ";F;S -lines:3"
    return cmd
  }

};
