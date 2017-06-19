'use babel';
import Editor from './editor/editor';
import File from './commons/file';
import ParserCobol from './parser-cobol/parser-cobol';
import GeradorCobol from './autocomplete-cobol/gerador-cobol';

/**
 * Módulo responsável por macros de comentário
 */
export default class Comentarios {

  activate(rechModule) {
    rechModule.addCommands({
      'rech:insere-linha-comentario': () => this.insereLinhaComentario(),
      'rech:insere-separador': () => this.insereSeparador(),
      'rech:puxa-comentario': () => this.puxaComentario(),
    });
  }

  /**
   * Intere linha de comantário
   */
  insereSeparador() {
    var editor = new Editor();
    if (editor.isBat()) {
      editor.insertSnippetAboveCurrentLineNoIdent("rem --------------------------------------------------------------------------------------------------------------------")
    } else if (editor.isRuby()) {
      editor.insertSnippetAboveCurrentLineNoIdent("# ----------------------------------------------------------------------------------------------------------------------")
    } else {
      editor.insertSnippetAboveCurrentLineNoIdent("      *>--------------------------------------------------------------------------------------------------------------<*")
    }
    editor.moveDown();
  }

  /**
   * Intere linha de comantário
   */
  insereLinhaComentario() {
    var editor = new Editor();
    if (editor.isBat()) {
      editor.insertSnippetAboveCurrentLineNoIdent("rem ")
    } else if (editor.isRuby()) {
      editor.insertSnippetAboveCurrentLine("# ")
    } else {
      let gerador = new ParserCobol(editor);
      editor.insertSnippetAboveCurrentLineNoIdent("      *>-> ")
    }
  }

  /**
   * Puxa o comentário de uma variável / parágrafo / etc
   */
  puxaComentario() {
    let parser = new ParserCobol();
    let editor = new Editor();
    let gerador = new GeradorCobol(editor);
    // Se estiver em um copy
    if (parser.isLinhaCopy(editor.getCurrentLine())) {
      this.puxaComentarioCopy(parser, gerador, editor);
    } else if (true) {

    }
  }

  /**
   * Puxa o comentário de um copy
   */
  puxaComentarioCopy(parser, gerador, editor) {
    let nomeCopy = parser.getNomeCopy(editor.getCurrentLine());
    editor.findFilePath(nomeCopy).then((path) => {
      this.extraiComentarioCopy(parser, path.fullPath()).then((comentario) => {
        this.insereComentarioExtraido(parser, gerador, editor, comentario);
      });
    }).catch((exception) => {
      atom.notifications.addError(exception);
    });
  }

  /**
   * Insere o comentário recém extraído
   */
  insereComentarioExtraido(parser, gerador, editor, coment) {
    gerador.comment(comentario);
  }

  /**
   * Extrai o comentário de um copy
   */
  extraiComentarioCopy(parser, nomeCopy) {
    return new File(nomeCopy).loadBuffer().then((buffer) => {
      let lines = buffer.split('\n');
      return parser.getTextoComentario(lines[1]);
    });
  }

/*
  'Se não tem texto selecionado
   if editor.selText = "" then
     'Marca a palavra atual
      Funcoes.marcaPalavraAtual
   end if
  'Texto a procurar
   procura = editor.selText
  'Se selecionou menos que 3 caracteres
   if Len(procura) < 3 then
      MsgBox "Busca muito curta. Selecione no mínimo 3 caracteres!"
      exit Sub
   end if
  'Busca o comentário
   coment = getComentario(editor.lineText, procura)
  'Se não tem comentário
   if coment = "" then
      MsgBox "Sem comentário vinculado!"
      exit Sub
   end if
  'Valor do novo comentário
   novoComent = Funcoes.removeLastLinebreak(FunInterp.getComentario(coment))
   replaceCurrentComent = false
  'Se for um MOVE ZEROS, SPACES ou LOW-VALUES, usa com INICIALIZA
   currentLine = Funcoes.getCurrentLine()
   if Funcoes.contains(currentLine, "ZEROS") or Funcoes.contains(currentLine, "SPACES") or Funcoes.contains(currentLine, "LOW-VALUES") then
      coment = "      *>-> Inicializa " & novoComent & Funcoes.enter()
   end if
  'Se a linha anterior já era um comentário
   if FunInterp.isComentario(Funcoes.getFromCurrentLine(-1)) then
     'Obtém o comentário atual
      comentAnterior = FunInterp.getComentario(Funcoes.getFromCurrentLine(-1))
     'Se o novo comentario começa com "Indica"
      if Funcoes.startsWith(novoComent, "Indica") then
        'Se o comentário atual começa com "Indica"
         if Funcoes.startsWith(comentAnterior, "Indica") then
           'Se for o mesmo comentário
            if comentAnterior = novoComent then
               coment = "      *>-> Presume " & Mid(novoComent, 8) & Funcoes.enter()
            end if
         end if
        'Se o comentário atual começa com "Presume"
         if Funcoes.startsWith(comentAnterior, "Presume") then
           'Se for o mesmo comentário
            if Mid(comentAnterior, 9) = Mid(novoComent, 8) then
               replaceCurrentComent = true
            end if
         end if
      end if
     'Se for o mesmo comentário
      if comentAnterior = novoComent or Replace(comentAnterior, "Inicializa ", "") = novoComent then
         replaceCurrentComent = true
      end if
   end if
  'Se está em uma tag de Rechdoc
   if FunInterp.isTagRechDoc(Funcoes.getCurrentLine()) then
      editor.command "ecLineEnd"
      editor.selText " " & novoComent
      Exit Sub
   end if
  'Guarda a posição original do cursor
   XCur = editor.caretX
   editor.caretX(1)
  'Se deve substituir o comentário
   if replaceCurrentComent then
      editor.command "ecSelUp"
      editor.command "ecDeleteChar"
   end if
  'Digita o comentário
   editor.selText coment
  'Volta para a posição original
   editor.caretX(XCur)
End Sub
' -------------------------------------------------------------------------------------------------------------------- '
Function getComentario(ByVal linhaUtilizacao, ByVal elemento)
  'Presume que deve preprocessar
   preproc = true
  'Se for batch não preprocessa
   if Funcoes.isBatch() then
      preproc = false
   end if
  'Realiza a busca pela declaração
   Dim local, localPreproc
   if FunBusca.encontraDeclaracao(elemento, true, getVarValue("%FullFileName%"), preproc, local, localPreproc) then
     'Carrega o buffer do arquivo encontrado
      buffer = FunArquivo.carregaBufferIntervalo(local.getFileName(), local.getLine() - 50, local.getLine() - 1)
     'Extrai o trecho de declaração
      declaracao = FunInterp.extraiDeclaracao(buffer, local)
     'Extrai somente o comentário
      getComentario = extraiComent(declaracao, local)
     'Se for um nível 88
      if Funcoes.isDeclaracao88(local.getLineText()) then
        'Ajusta o comentário de nível 88
         getComentario = ajustaComentario88(linhaUtilizacao, elemento, getComentario)
      end if
   else
      MsgBox elemento & " não encontrado"
   end if
End Function
' -------------------------------------------------------------------------------------------------------------------- '
'Ajusta o comentário de níveis 88
Function ajustaComentario88(ByVal linhaUso, ByVal variavel, ByVal comentario)
  'Remove o sinal do comentário
   comentario = Trim(Replace(comentario, "*>->", ""))
  'Se não tem comentário no 88
   if comentario = "" then
     'Variável pai do nível 88
      if Funcoes.startsWith(Right(variavel, 4), "-") then
         variavelOrigem = Mid(variavel, 1, Len(variavel) - 4)
      else
         variavelOrigem = Mid(variavel, 1, Len(variavel) - 3)
      end if
      if InStr(variavelOrigem, "-") < 1 then
         variavelOrigem = "W-" & variavelOrigem
      end if
     'Busca o comentário da variável pai
      comentarioPai = getComentario(linhaUso, variavelOrigem)
     'Remove o sinal do comentário
      comentarioPai = Trim(Replace(comentarioPai, "*>->", ""))
     'Se for um nível 88 de SIM ou NAO e não possui comentário específico
      if comentario = "" and (Funcoes.endsWith(Trim(variavel), "SIM") or Funcoes.endsWith(Trim(variavel), "NAO")) then
        'Presume o comentário da variável pai
         comentario = comentarioPai
      else
         comentarioPai = Replace(comentarioPai, Chr(13) & Chr(10), "")
        'Se começa com o comentário do Pai (Formato "Tipo de cadastro - Cliente")
         if Funcoes.startsWith(comentario, comentarioPai) and comentarioPai <> "" then
            comentario = Replace(comentario, comentarioPai & " - ", "")
         end if
      end if
   end if
  'Remove o "Indica que", se existir
   if Funcoes.startsWith(comentario, "Indica que") then
      comentario = Replace(comentario, "Indica que", "")
   end if
  'Remove o "Indica se", se existir
   if Funcoes.startsWith(comentario, "Indica se") then
      comentario = Replace(comentario, "Indica se", "")
   end if
  'Remove o "Indica", se existir
   if Funcoes.startsWith(comentario, "Indica") then
      comentario = Replace(comentario, "Indica", "")
   end if
  'Tira espaços do comentário
   comentario = Trim(comentario)
  'Se não tem comentário
   if comentario = "" then
      exit Function
   end if
  'Se só tem uma palavra
   if InStr(comentario, " ") < 1 then
     'Adiciona "é" à frente do comentário
      comentario = "é " & comentario
   end if
  'Se for nível 88 de NAO e ainda não tem a negação
   if Funcoes.endsWith(variavel, "NAO") and not Funcoes.startsWith(comentario, "não") then
     'Adiciona a negação ao comentário
      comentario = "não " & comentario
   end if
  'Se estiver usando em um SET
   if Funcoes.startsWith(Trim(linhaUso), "SET") then
     'Usa o "Indica que"
      comentario = "Indica que " & comentario
   else
     'Usa o "Se"
      comentario = "Se " & comentario
   end if
  'Comenta a linha
   comentario = "      *>-> " & comentario
  'Retorna
   ajustaComentario88 = comentario
End Function
' -------------------------------------------------------------------------------------------------------------------- '
'Extrai o comentário de uma variável / parágrafo........................................................................
Function extraiComent(ByVal buffer, ByRef local)
  'Quebra o texto em linhas
   lines = Split(buffer, Chr(13) & Chr(10))
  'Inicializa o retorno
   extraiComent = ""
  'Percorre as linhas
   for each line in lines
     'Se for um comentário e não for tag de FD
      if FunInterp.isComentario(line) and not Funcoes.startsWith(Trim(line), "*>((") then
        'Remove os pontos, se tiver
         line = Funcoes.removeCaracteresRepetidos(line, ".")
        'Concatena o comentário
         if extraiComent = "" then
           'Não põe se a primeira linha for vazia
            if FunInterp.getComentario(line) <> "" then
               extraiComent = line
            end if
         else
            extraiComent = extraiComent & Chr(13) & Chr(10) & line
         end if
      end if
   next
  'Se for RechDoc
   if FunInterp.isRechDoc(extraiComent) then
     'Pega somente a descrição
      extraiComent = FunInterp.comenta(FunInterp.RechDocGetDescricao(extraiComent))
   end if
  'Se não tem comentário
   if extraiComent = "" then
      exit Function
   end if
  'Adiciona quebra de linha final
   extraiComent = extraiComent & Chr(13) & Chr(10)
End Function
' -------------------------------------------------------------------------------------------------------------------- '

*/

};
