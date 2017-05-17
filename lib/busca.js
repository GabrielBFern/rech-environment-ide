'use babel';
import Dialog from './gui/dialog';
import Editor from './editor/editor';
import File from './commons/file';
import ParserCobol from './parser-cobol/parser-cobol';
import Path from './commons/path.js';
import Preproc from './commons/preproc.js';
import Scan from './commons/scan.js';

/**
 * Módulo responsável pelos scripts de busca
 */
export default class Busca {

  activate(rechModule) {
    rechModule.addCommands({
      'rech:cobol-posiciona-declaracao': () => this.posicionaDeclaracao(),
      'rech:fongrep': () => this.executaFongrep(),
      'rech:posiciona-linha-branco-frente': () => this.posicionaLinhaBrancoFrente(),
      'rech:posiciona-linha-branco-tras': () => this.posicionaLinhaBrancoTras(),
      'rech:seleciona-busca-frente': () => this.selecionaBuscaFrente(),
      'rech:seleciona-busca-tras': () => this.selecionaBuscaTras()
    });
  }

  /**
   * Posiciona na declaração de uma variável/parágrafo
   */
  posicionaDeclaracao() {
    var editor = new Editor();
    if (editor.getSelectionBuffer() == "") {
      editor.selectCurrentWord();
    }
    var busca = editor.getSelectionBuffer();
    if (busca.length < 3) {
      atom.notifications.addInfo("Busca muito curta. Selecione no mínimo 3 caracteres!");
    }
    this.encontraDeclaracao(busca, true, editor.getPath(), true).then((result) => {
      // TODO: Marcador
      editor.position(result);
    }).catch((e) => {
      if (e != undefined) {
        console.log(e);
        atom.notifications.addError(e.toString());
      } else {
        atom.notifications.addWarning(busca + " não encontrado");
      }
    });
  }

  /**
   * Encontra a declaração de um termo (Variável, parágrafo, etc)
   */
  encontraDeclaracao(termo, buscaPrimeiroNoEditor, nomeArquivo, podePreprocessar) {
    // TODO:
      /*
      'Se não está em maiúsculo ou não tem "-"
       if not Funcoes.isBatch() and (elemento <> UCase(elemento) or InStr(elemento, "-") <= 0 or InStr(elemento, "*") > 0 or InStr(elemento, ">") > 0 or InStr(elemento, ",") > 0 or InStr(elemento, ".") > 0 or InStr(elemento, " ") > 0 or InStr(elemento, Chr(34)) > 0) then
          resposta = MsgBox("'" & elemento & "' não parece ser uma variável, parágrafo ou classe. Deseja buscar a declaração mesmo assim?", vbYesNo + vbDefaultButton2, "")
         'Se confirmou
          if resposta <> vbYes then
             Exit Function
          end if
       end if
      */
      return new Promise((resolve, reject) => {
        // Se deve buscar primeiro no editor
        if (buscaPrimeiroNoEditor) {
          var result = this.encontraDeclaracaoBuffer(termo, nomeArquivo, new Editor().getEditorBuffer());
          if (result != null) {
            resolve(result);
            return;
          }
        }
        if (podePreprocessar) {
          this.encontraDeclaracaoPreproc(termo, nomeArquivo, "is", true).then((result) => {
            resolve(result);
          }).catch((e) => {
            reject(e);
          });
        } else {
          reject();
        }
      });
  }

  /**
   * Encontra a declaração dentro de um buffer
   */
  encontraDeclaracaoBuffer(termo, nomeArquivo, buffer) {
    var editor = new Editor();
    var parser = new ParserCobol();
    var result = null;
    new Scan(buffer).scan(new RegExp(termo, 'g'), (iterator) => {
      if (parser.isDeclaracao(termo, iterator.lineContent)) {
        result = [nomeArquivo, iterator.row, iterator.column];
        iterator.stop();
      }
    });
    return result;
  }

  /**
   * Encontra a declaração
   */
  encontraDeclaracaoPreproc(termo, nomeArquivo, compilador, cache) {
    return new Promise((resolve, reject) => {
      var path = new Path(nomeArquivo);
      var cacheFileName = "c:\\tmp\\PREPROC\\" + path.fileName();
      // Se o arquivo de cache não existe, não tenta ler dele
      if (!new File(cacheFileName).exists()) {
        cache = false;
      }
      // Se deve usar o cache
      if (cache) {
        console.log("Buscando no cache " + cacheFileName);
        this.encontraDeclaracaoFilePreproc(termo, path, cacheFileName).then((result) => {

          // TODO: Verificar se ainda está lá

          resolve(result);
        }).catch((e) => {
          console.log("Não achei no cache, vou reprocessar");
          // Se não encontrou no cache, tenta repré-processar
          this.encontraDeclaracaoPreproc(termo, nomeArquivo, "is", false).then((result) => {
            resolve(result);
          }).catch((e) => {
            reject(e);
          });
        });
      } else {
        var preproc = new Preproc();
        preproc.setPath(nomeArquivo);
        preproc.addOptions(["-scc", "-sco", "-" + compilador, "-as=" + cacheFileName]);
        // Executa o pré-processador e carrega o Buffer da saída
        preproc.exec().then(() => {
          this.encontraDeclaracaoFilePreproc(termo, path, cacheFileName).then((result) => {
            resolve(result);
          }).catch((e) => {
            // Se ainda não tentou em MF
            if (compilador == "is") {
              console.log("Não achei em IS, vou tentar em MF");
              this.encontraDeclaracaoPreproc(termo, nomeArquivo, "mf", false).then((result) => {
                resolve(result);
              }).catch((e) => {
                reject(e);
              });
            } else {
              reject(e);
            }
          });
        });
      }
     });
  }

  /**
   * Encontra a declaração em um arquivo pré-processado
   */
  encontraDeclaracaoFilePreproc(termo, path, tmpFile) {
    var parser = new ParserCobol();
    return new Promise((resolve, reject) => {
      new File(tmpFile).loadBuffer().then((buffer) => {
        // Faz a busca no Buffer carregado, buscando por declarações
        var result = null;
        new Scan(buffer).scan(new RegExp(termo, 'g'), (iterator) => {
          if (parser.isDeclaracao(termo, iterator.lineContent)) {
            // Extrai as informações do sufixo da linha que o pré-proc adiciona
            var match = /.*\*\>\s+\d+\s+(\d+)(?:\s+(.+\....)\s+\(\d+\))?/.exec(iterator.lineContent);
            var file = path.fullPath();
            var row = parseInt(match[1]) - 1; // -1 Pois o préproc gera o número da linha com índice inicial 1, e o Atom trabalha com 0
            if (match[2] != undefined) {
              file = match[2];
            }
            // Monta o resultado
            result = [this.getFullPath(file, path.directory()), row, iterator.column];
            iterator.stop();
          }
        });
        if (result != null) {
          resolve(result);
        } else {
         reject();
        }
      }).catch((e) => {
        reject(e);
      });
    });
  }

  /**
   * Retorna o caminho completo para um arquivo
   */
  getFullPath(file, preferredDirectory) {
    if (new File(preferredDirectory + "\\" + file).exists()) {
      return preferredDirectory + "\\" + file;
    }
    return "F:\\SIGER\\DES\\FON\\" + file;
  }

/** ************************************************************************* */
/** FONTE A MIGRAR*/
// TODO:

/*
' -------------------------------------------------------------------------------------------------------------------- '
Function buscaComandoRelacionado(ByVal comando)
'Pega a referência ao editor ativo
 set editor = newEditor()
 editor.assignActiveEditor
'Posição em que se encontra o comando
 coluna = InStr(editor.lineText, comando)
'Busca comando relacionado
 select case comando
    case "IF"
       call buscaParaFrente("END-IF", coluna)
    case "ELSE"
       call buscaParaFrente("END-IF", coluna)
    case "PERFORM"
       call buscaParaFrente("END-PERFORM", coluna)
    case "EVALUATE"
       call buscaParaFrente("END-EVALUATE", coluna)
    case "END-IF"
       call buscaParaTras("IF", coluna)
    case "END-PERFORM"
       call buscaParaTras("PERFORM", coluna)
    case "END-EVALUATE"
       call buscaParaTras("EVALUATE", coluna)
 end select
 exit function
End Function
' -------------------------------------------------------------------------------------------------------------------- '
Function buscaParaFrente(ByVal comando, ByVal coluna)
'Pega a referência ao editor ativo
 set editor = newEditor()
 editor.assignActiveEditor
'Pega todo o texto do editor ativo e quebra em linhas
 allText  = editor.Text
 line = Split(allText, Chr(13) & Chr(10))
'Varre o texto
 for i = editor.caretY to editor.linescount - 1
   'Encerra se encontrou uma linha terminada por .
    if right(line(i), len(rtrim(line(i)))) = "." then
       exit for
    end if
   'Procura o texto selecionado na linha
    pos = InStr(line(i), comando)
   'Se está procurando por END-IF e não encontrou
    if comando = "END-IF" and pos = 0 then
      'Procura um 'ELSE'
       pos = InStr(line(i), "ELSE")
    end if
    if pos = coluna then
       editor.caretY(i + 1)
       editor.caretX(pos)
       exit for
    end if
 next
 exit function
End Function
' -------------------------------------------------------------------------------------------------------------------- '
Function buscaParaTras(ByVal comando, ByVal coluna)
'Pega a referência ao editor ativo
 set editor = newEditor()
 editor.assignActiveEditor
'Pega todo o texto do editor ativo e quebra em linhas
 allText  = editor.Text
 line = Split(allText, Chr(13) & Chr(10))
'Varre o texto
 for i = editor.caretY - 1 to 0 step -1
   'Encerra se encontrou uma linha terminada por .
    if right(line(i), len(rtrim(line(i)))) = "." then
       exit for
    end if
   'Procura o texto selecionado na linha
    pos = InStr(line(i), comando)
    if pos = coluna then
       editor.caretY(i + 1)
       editor.caretX(pos)
       exit for
    end if
 next
 exit function
End Function
' -------------------------------------------------------------------------------------------------------------------- '
Function isComandoCobol(ByVal procura)
 if procura = "ACCEPT" or procura = "ADD" or procura = "CANCEL" or _
    procura = "CANCEL" or procura = "CALL" or procura = "COMPUTE" or _
    procura = "CONTINUE" or procura = "ENTRY" or procura = "EVALUATE" or _
    procura = "EXIT" or procura = "GO" or procura = "IF" or _
    procura = "INITIALIZE" or procura = "NEXT" or procura = "MOVE" or _
    procura = "PERFORM" or procura = "SET" or procura = "STOP" or _
    procura = "SUBTRACT" or procura = "MULTIPLY" or procura = "DIVIDE" or _
    procura = "STRING" or procura = "INSPECT" or procura = "UNSTRING" or _
    procura = "INVOKE" or procura = "SEARCH" or procura = "SORT" or _
    procura = "CLOSE" or procura = "DELETE" or procura = "DISPLAY" or _
    procura = "OPEN" or procura = "READ" or procura = "REWRITE" or _
    procura = "START" or procura = "WRITE" or procura = "END-IF" or _
    procura = "ELSE" or procura = "END-PERFORM" or procura = "CYCLE" or _
    procura = "END-EVALUATE" or procura = "PARAGRAPH" then
    isComandoCobol = true
 else
    isComandoCobol = false
 end if
*/

  /**
   * Executa o fongrep
   */
  executaFongrep() {
    var text = new Editor().selectionOrCurrentWord();
    new Dialog().inputDialog({ title: "Busca", text: text}).then((text) => {
      if (text.length > 0) {
        atom.notifications.addInfo("Executando Fongrep...");
        var child_process = require('child_process');
        var process = child_process.spawn("cmd", ["/c", "Fongrep.bat", text]);
      }
    }).catch((e) => {});
  }

  /**
   * Posiciona na próxima linha em branco para frente
   */
  posicionaLinhaBrancoFrente() {
    var editor = new Editor();
    var buffer  = editor.getEditorBuffer();
    lines = buffer.split("\n");
    inicio = editor.getCurrentRow() + 1;
    linbco = -1;
    // Encontra a próxima linha em branco
    for (var i = inicio; i < lines.length; i++) {
      if (lines[i].trim().length == 0) {
        linbco = i;
        break;
      }
    }
    // Encontra a primeira linha com conteúdo depois da linha em branco
    if (linbco >= 0 && linbco < lines.length) {
      for (var i = linbco; i < lines.length; i++) {
        if (lines[i].trim().length > 0) {
          editor.gotoLineStart(i);
          break;
        }
      }
    }
  }

  /**
   * Posiciona na próxima linha em branco para tras
   */
  posicionaLinhaBrancoTras() {
    var editor = new Editor();
    var buffer  = editor.getEditorBuffer();
    lines = buffer.split("\n");
    inicio = editor.getCurrentRow() - 1;
    linbco = -1;
    // Encontra a próxima linha em branco
    for (var i = inicio; i >= 0; i--) {
      if (lines[i].trim().length == 0) {
        linbco = i;
        break;
      }
    }
    // Encontra a primeira linha com conteúdo depois da linha em branco
    if (linbco >= 0 && linbco < lines.length) {
      for (var i = linbco - 1; i >= 0; i--) {
        if (lines[i].trim().length > 0) {
          editor.gotoLineStart(i);
          break;
        }
      }
    }
  }

  /**
   * Seleciona a palavra corrente e busca para frente
   */
  selecionaBuscaFrente() {
    var editor = new Editor();
    editor.selectionOrSelectCurrentWord();
    editor.showFindAndReplaceDialog();
    editor.findNext();
  }

  /**
   * Seleciona a palavra corrente e busca para trás
   */
  selecionaBuscaTras() {
    var editor = new Editor();
    editor.selectionOrSelectCurrentWord();
    editor.showFindAndReplaceDialog();
    editor.findPrevious();
  }

};
