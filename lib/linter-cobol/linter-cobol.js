'use babel';

import Path from '../commons/path';
import File from '../commons/file';
import Preproc from '../commons/preproc';
import WcVersao from '../commons/wc-versao';
import type { Range, Point, TextEditor } from 'atom'

const regex = /\*\*\* (Warning): \[W(\d+)\] (.*);( file = (.+))?[$|,]( line = (\d+))?( \((Erro)\))?/g;

/**
 * Classe para realizar o linter (Exibição de marcações de erros) em código Cobol
 */
export default class LinterCobol {

  /**
   * Provê o Linter para o código Cobol
   */
  provideLinter() {
    this.promisePreproc = null;
    const helpers = require('atom-linter');
    return this.providePreprocLinter(helpers);
  }

  /**
   * Provê o Linter utilizando o pré-processador
   */
  providePreprocLinter(helpers) {
    return {
      name: 'Pré-processador',
      grammarScopes: ['source.cobol', 'source.cobol.rech'],
      scope: 'file',
      lintOnFly: true,
      lint: (textEditor) => {
        return this.lintPreproc(helpers, textEditor);
      },
    };
  }

  /**
   * Executa o Linter do pré-processador
   */
  lintPreproc(helpers, textEditor) {
    const path = new Path(textEditor.getPath());
    const content = textEditor.getText();
    const cwd = path.directory();
    const showAll = this.enableNotice;
    var tmpPath = "C:/TMP/" + path.fileName();
    if (this.promisePreproc == null) {
      this.promisePreproc = new File(tmpPath).saveBuffer(content).then(function() {
        var preproc = new Preproc();
        preproc.addOptions(['-cpn', '-msi', '-war', '-wes', '-wop=w077;w078;w079']);
        preproc.setPath(tmpPath);
        return new Promise((resolve, reject) => {
          const messages = [];
          new WcVersao().currentWc().then((wc) => {
            const parameters = [].concat(['/c']).concat(preproc.getCmdArgs().concat(preproc.getWcParams(wc)));
            const options = { cwd, ignoreExitCode: true, encoding: 'ascii' };
            this.executablePath = 'cmd';

            var proc = require('child_process')
            var process = proc.spawn('cmd', parameters, {
              cwd: cwd,
              encoding: 'ascii'
            });
            process.on('close', function(output) {
              resolve(messages);
            });
            process.stdout.on('data', function(output) {
              if (textEditor.getText() !== content) {
                return null;
              }
              var iconv = require('iconv-lite');
              output = iconv.decode(output, 'iso-8859-1')
              lines = output.split('\n');
              for (var x in lines) {
                var line = lines[x];
                let match = regex.exec(line);
                while (match !== null) {
                  const errorCode = match[2];
                  var message = match[3];
                  // Se o warning não for no fonte em edição
                  if (match[5] != undefined && path.toString().indexOf(match[5]) < 0) {
                    match = regex.exec(line);
                    continue;
                  }

                  const file = match[5] == undefined ? path : cwd +'\\'+ match[5];
                  const line = match[7] == undefined ? 0 : parseInt(match[7]) - 1;
                  const severity = match[9] == 'Erro' ? 'error' : 'warning';
                  const col = 0;
                  const fullMessage = "<a href=\"http://192.168.0.254/htdocs/wiki/index.php/PreProcessador_Rech#.5BW" + errorCode + ".5D\">W" + errorCode + "</a>: " + message;



                  messages.push({
                    type: severity,
                    filePath: file,
                    range: helpers.rangeFromLineNumber(textEditor, line, 0),
                    html: fullMessage,
                  });
                  match = regex.exec(line);
                }
              }
            });
            return messages;
          });
        });
      });
      this.promisePreproc.then(() => {
        this.promisePreproc = null;
      });
    }
    return this.promisePreproc;
  }


};
