'use babel';

// https://github.com/atom/autocomplete-plus/wiki/Provider-API
export default class AutocompleteCobol {

  constructor() {
    this.autocompletes = [
      {
        //text: 'someText',
        snippet: 'MOVE ${1} TO WME-SUB.\nPERFORM EXIBE-MENSAGEM.',
        displayText: 'EXIBE-MENSAGEM',// # (optional)
        //replacementPrefix: 'so', //# (optional)
        type: 'function', //# (optional)
        rightLabel: 'PROTEMSG.CPY',/* # (optional)
        leftLabelHTML: '' # (optional)*/
        //rightLabel: '',// # (optional)
        /*
        rightLabelHTML: '' # (optional)*/
        //className: 'PROTEMSG.CPY',
        /*iconHTML: '' # (optional)*/
        description: 'Exibe uma mensagem para o usuário', // # (optional)
        descriptionMoreURL: 'http://192.168.0.254/htdocs/wiki/index.php/Rotina_de_mensagem' //# (optional)*/
      }
    ];
  }

  provideAutocomplete() {
    var autocompletes = this.autocompletes;
    return {
      selector: '.source.cobol',
      getSuggestions: function({editor, bufferPosition, scopeDescriptor, prefix}) {
        return new Promise((resolve) => {
          completes = [];
          if (prefix != "") {
            for (var i in autocompletes) {
              var entry = autocompletes[i];
              if (entry.displayText.toLowerCase().startsWith(prefix.toLowerCase())) {
                completes.push(entry);
              }
            }
          }
          resolve(completes);
        });
      }
    };
  }

};
