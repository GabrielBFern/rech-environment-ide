'use babel';
import CommandOutputView from './exec-view';
import Encoding from './encoding';
import React from 'react'
import ReactHelper from './react-helper';

/**
 * Utilitários de WC e versão
 */
export default class WcVersao {

  /**
   * Retorna uma promise para o WC corrente
   */
  currentWc() {
    return new Promise((resolve, reject) => {
      // Execut o Wc /show para descobrir o WC
      var child_process = require('child_process');
      var process = child_process.spawn("cmd", ["/c", "Wc.bat", "/show"]);
      // Quando receber a saída, interpreta
      process.stdout.on('data', function(data) {
        match = /USE_VALRET=(.*)/g.exec(data);
        // Se achou o valor, resolve a promise
        if (match !== null) {
          resolve(montaWc(match[1]));
        } else {
          reject();
        }
      });
    });
  }

};

/**
 * Monta o objeto do WC à partir do nome
 */
function montaWc(name) {
  return {
    name: name
  };
}
