'use babel';
import React from 'react'
import ReactDOM from 'react-dom'

/**
 * Classe para facilitar a interação do React com o Atom e nossos Scripts
 */
export default class ReactHelper {

  prepare(jsx) {
    var element = document.createElement('div');
    var view = (ReactDOM.render(jsx, element));
    return {view: view, element: element};
  }

};
