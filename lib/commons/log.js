'use babel';

/**
 * Classe para realizar o linter (Exibição de marcações de erros) em código Cobol
 */
export default class Log {

  exec(cmd, onComplete) {
    var child_process = require('child_process');
    console.log("Exec: '" + cmd + "'")
    var process = child_process.spawn("cmd", ["/c"].concat(cmd.split(" ")), {
      encoding: 'ascii'
    });
    var stdout = '';
    var stderr = '';
    process.stdout.on('data', function(data) {
      stdout += data;
    });
    process.stderr.on('data', function(data) {
      stderr += data;
    });
    process.stderr.on('close', function(data) {
      if (onComplete != undefined) {
        onComplete({
          stdout: stdout,
          stderr: stderr
        });
      }
    });
  }

};
