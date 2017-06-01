'use babel';
import Path from '../commons/path';
import File from '../commons/File';
import Preproc from '../commons/preproc';

// https://github.com/atom/autocomplete-plus/wiki/Provider-API
export default class AutocompleteCobol {

  constructor() {
    this.preprocPromise = null;
    this.autocompletes = [];
  }

  provideAutocomplete() {
    return {
      selector: '.source.cobol',
      getSuggestions: ({editor, bufferPosition, scopeDescriptor, prefix}) => {
        var promises = [];
        // Se tem alguma busca
        if (prefix.length > 1) {
          // Adiciona promises de carga dos arquivos do préprocessador
          promises.push(this.loadVariablesPreproc(editor, bufferPosition, scopeDescriptor, prefix));
          promises.push(this.loadParagraphsPreproc(editor, bufferPosition, scopeDescriptor, prefix));
          // Executa o préprocessador de forma assíncrona para atualizar os dados para a próxima
          this.dispatchPreprocessadorIfNotRunning(editor.getPath());
        }
        // Quando todas promises terminarem, junta todos arrays de autocompletes retornados em um só
        return Promise.all(promises).then((arrayOfAutocompletes) => {
          return [].concat.apply([], arrayOfAutocompletes);
        });
      }
    };
  }

  /**
   * Dispara uma execução do préprocessador se não estiver rodando
   */
  dispatchPreprocessadorIfNotRunning(path) {
    if (this.preprocPromise == null) {
      this.preprocPromise = Preproc.localDatabaseUpdate().setPath(path).exec();
      this.preprocPromise.then(() => {
        this.preprocPromise = null;
      });
    }
  }

  /**
   * Carrega variáveis à partir do préprocessado
   */
  loadVariablesPreproc(editor, bufferPosition, scopeDescriptor, prefix) {
    return this.loadGenericPreproc(editor, bufferPosition, scopeDescriptor, prefix, 'WUSVAR', (fields) => {
      return {
        snippet: fields[1],
        displayText: fields[1],
        type: 'variable',
        rightLabel: fields[4],
        description: fields[8]
      };
    })
  }

  /**
   * Carrega parágrafos à partir do préprocessado
   */
  loadParagraphsPreproc(editor, bufferPosition, scopeDescriptor, prefix) {
    return this.loadGenericPreproc(editor, bufferPosition, scopeDescriptor, prefix, 'WUSPAR', (fields) => {
      var name = fields[1];
      if (name != undefined) {
        // Ajusta parágrafos com nome do tipo "MET-SRIGRA:PVIS-VALIDA"
        var index = name.indexOf(':');
        if (index > 0) {
          name = name.substr(index + 1);
        }
      }
      return {
        snippet: name,
        displayText: name,
        type: 'function',
        rightLabel: fields[4],
        description: fields[11]
      };
    })
  }

  /**
   * Carrega uma tabela genérica do préprocessador
   */
  loadGenericPreproc(editor, bufferPosition, scopeDescriptor, prefix, tableName, callback) {
    return new Promise((resolve) => {
      const path = editor.getPath();
      var tmpPath = new File("c:\\tmp\\preproc\\17.20a\\external\\I-" + path.baseName() + "-CBL-" + tableName + ".txt");
      var completes = [];
      if (tmpPath.exists()) {
        tmpPath.loadBuffer().then((buffer) => {
            let lines = buffer.split("<NR>");
            for (var i in lines) {
              let line = lines[i];
              let fields = line.split("<NF>");
              let autocomplete = callback(fields);
              if (prefix.length > 1 && autocomplete.displayText != undefined && autocomplete.displayText.toLowerCase().startsWith(prefix.toLowerCase())) {
                completes.push(autocomplete);
              }
            }
            resolve(completes);
        });
      } else {
        resolve(completes);
      }
    });
  }

};
