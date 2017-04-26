'use babel';
import CommandOutputView from './exec-view';
import Encoding from './encoding';
import React from 'react'
import ReactHelper from './react-helper';

/**
 * Classe para realizar o linter (Exibição de marcações de erros) em código Cobol
 */
export default class Exec {

  /**
   * Cria um executor
   */
  constructor(options) {
    if (options == undefined) {
      this.options = {};
    } else {
      this.options = options;
    }
    var objects = new ReactHelper().prepare(<CommandOutputView />);
    this.commandOutputView = objects.view;
    this.bottomPanel = atom.workspace.addBottomPanel({
      item: objects.element,
      visible: this.options.showOutput == true
    });
  }

  /**
   * Executa uma linha de comando
   */
  exec(cmd, onComplete, onStdOut, onStdErr) {
    if (typeof cmd == "string") {
      cmd = cmd.split(" ");
    }
    var commandOutputView = this.commandOutputView;
    var bottomPanel = this.bottomPanel;
    console.log("Exec: '" + cmd + "'");
    // Executa o processo
    var child_process = require('child_process');
    var process = child_process.spawn("cmd", ["/c"].concat(cmd), {
      cwd: this.options.cwd,
      encoding: 'ascii'
    });
    var stdout = '';
    var stderr = '';
    // Escuta por eventos de StdOut e StdErr
    process.stdout.on('data', function(data) {
      stdout += data;
      var lines = new Encoding().decodeWindows1252(data).split("\n");
      for (var i in lines) {
        if (onStdOut != undefined) {
          onStdOut(lines[i]);
        }
        commandOutputView.stdout(lines[i]);
      }
    });
    process.stderr.on('data', function(data) {
      stderr += data;
      var lines = new Encoding().decodeWindows1252(data).split("\n");
      for (var i in lines) {
        if (onStdErr != undefined) {
          onStdErr(lines[i]);
        }
        commandOutputView.stderr(lines[i]);
      }
    });
    // Quando finalizar
    process.stdout.on('close', function(data) {
      commandOutputView.finish(data);
      if (onComplete != undefined) {
        onComplete({
          stdout: stdout,
          stderr: stderr
        });
      }
    });
  }

};
