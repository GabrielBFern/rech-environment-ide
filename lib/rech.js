'use babel';

import AutocompleteCobol from './autocomplete-cobol/autocomplete-cobol';
import LinterCobol from './linter-cobol/linter-cobol';
import { CompositeDisposable } from 'atom';
import Busca from './busca'
import Clipboard from './clipboard'
import Comentarios from './comentarios'
import Digitacoes from './digitacoes'
import Open from './open'
import Compiler from './compiler/compiler'
import Identa from './identa/identa'
import LocalHistory from './local-history'
import WcVersao from './commons/wc-versao';

export default {

  modules: [
    new Busca(),
    new Clipboard(),
    new Comentarios(),
    new Digitacoes(),
    new Compiler(),
    new Identa(),
    new Open(),
    new LocalHistory()
  ],
  subscriptions: null,

  activate(state) {
    require('atom-package-deps').install('rech-environment-ide');
    this.subscriptions = new CompositeDisposable();
    for (var x in this.modules) {
      this.modules[x].activate(this);
    }
  },

  /**
   * Registra comandos no Atom
   */
  addCommands(commands) {
    this.subscriptions.add(atom.commands.add('atom-workspace', commands));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  provideLinter() {
    return new LinterCobol().provideLinter();
  },

  provideAutocomplete() {
    return new AutocompleteCobol().provideAutocomplete();
  },

  providePathRechOpenThis() {
    return (path) => {
      return new Promise((resolve) => {
        new WcVersao().currentWc().then((wc) => {
          console.log(path);
          console.log(['f:\\siger\\wc\\des\\' + wc.name + '\\fon\\', 'f:\\fontes\\', 'f:\\bat'].concat(path));
          resolve(['f:\\siger\\wc\\des\\' + wc.name + '\\fon\\', 'f:\\fontes\\', 'f:\\bat'].concat(path));
        });
      });
    };
  }

};
