'use babel';
import Exec from '../commons/exec';
import Path from '../commons/path';

/**
 * Módulo responsável pela identação de fontes Cobol
 */
export default class Compiler {

  activate(rechModule) {
    rechModule.addCommands({
      'rech:cobol-compile': () => this.compila()
    });
  }

  /**
   * Compila o programa
   */
  compila() {
    editor = atom.workspace.getActivePaneItem();
    var file = new Path(editor.buffer.file.path);
    new Exec({
      showOutput: true,
      cwd: file.directory()
    }).exec(["PSCOMP.BAT", file.baseName(), file.extension()]);
  }

};
