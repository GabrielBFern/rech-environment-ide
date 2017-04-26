'use babel';
import React from 'react'
import ReactHelper from '../commons/react-helper';
import ReactDOM from 'react-dom'

/**
 * Módulo para exibiçãod e diálogos
 */
export default class Dialog {

  /**
   * Diálogo de input para digitação
   */
  inputDialog(options) {
    return new Promise((resolve, reject) => {
      var objects = new ReactHelper().prepare(<atom-text-editor class="editor mini" mini="" data-grammar="text plain null-grammar" data-encoding="windows1252"></atom-text-editor>);
      var bottomPanel = atom.workspace.addModalPanel({
        item: objects.element
      });
      objects.view.getModel().setText(options.text);
      objects.view.focus();
      objects.view.getModel().scrollToCursorPosition()
      objects.view.onkeydown = (evt) => {
        if (evt.key == "Escape") {
          bottomPanel.destroy();
          reject("cancel");
        }
        if (evt.key == "Enter") {
          var text = objects.view.textContent;
          bottomPanel.destroy();
          resolve(text);
        }
      };
    });
  }

  /**
   * Abre diálogo de abrir
   */
  openDialog(diretorio, filters) {
    dialog = require("electron").remote.dialog;
    dialog.showOpenDialog({defaultPath: diretorio, filters: filters, properties:['openFile', 'multiSelections']}, function(filenames) {
      for (var i in filenames) {
        atom.workspace.open(filenames[i]);
      }
    });
  }

};
