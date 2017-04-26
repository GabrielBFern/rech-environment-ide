'use babel';

/**
 * Módulo responsável pelos scripts de busca
 */
export default class ParserCobol {

  /**
   * Retorna se a linha é a linha de declaração do elemento
   */
  isDeclaracao(elemento, line) {
    if (this.isComentario(line)) {
      return false;
    }
    if (this.equalsIgnoreReplacing(this.getDeclaracaoParagrafo(line), elemento)) {
      return true;
    }
    if (this.equalsIgnoreReplacing(this.getDeclaracaoVariavel(line), elemento)) {
      return true;
    }
    if (this.equalsIgnoreReplacing(this.getDeclaracaoSelect(line), elemento)) {
      return true;
    }
    if (this.equalsIgnoreReplacing(this.getDeclaracaoClasse(line), elemento)) {
      return true;
    }
    return false;
  }

  /**
   * Retorna se a linha é uma linha de comentário
   */
  isComentario(line) {
    return line.trim().startsWith("*>");
  }

  /**
   * Retorna o parágrafo declarado na linha ou null
   */
  getDeclaracaoParagrafo(line) {
    var match = /^\s+([\w\-]+)\.(\s*\*\>.*)?$/g.exec(line);
    if (match == null) {
      return null;
    }
    return match[1];
  }

  /**
   * Retorna a variável declarada na linha ou null
   */
  getDeclaracaoVariavel(line) {
    // Variáveis
    var match = /^\s+\d\d\s+([\w\-]+)(\s+|\.).*/g.exec(line);
    if (match == null) {
      // $SET CONSTANT
      match = /^\s+\$SET\s+CONSTANT\s+([\w\-]+)\s+.*/g.exec(line);
      if (match == null) {
        return null;
      }
    }
    return match[1];
  }

  /**
   * Retorna a select declarada na linha ou null
   */
  getDeclaracaoSelect(line) {
    var match = /^\s+SELECT ([\w\-]+)\s+ASSIGN.*/g.exec(line);
    if (match == null) {
      return null;
    }
    return match[1];
  }

  /**
   * Retorna a classe declarada declarada na linha ou null
   */
  getDeclaracaoClasse(line) {
    // Formato IS
    var match = /^\s+CLASS\s+([\w]+)\s+AS.*/g.exec(line);
    if (match == null) {
      // Formato MF
      match = /^\s+([\w]+)\s+IS\s+CLASS.*/g.exec(line);
      if (match == null) {
        return null;
      }
    }
    return match[1];
  }

  /**
   * Compara dois termos ignorando replacing
   */
  equalsIgnoreReplacing(termo1, termo2) {
    if (termo1 == null || termo2 == null) {
      return false;
    }
    if (termo1 == termo2) {
      return true;
    }
    if (termo1.indexOf("(") >= 0) {
      var removeReplaceRegexp = /\([^\(^\)]*\)/;
      var pattern = termo1.replace(/\(.*?\)/g, "(.*)");
      if (pattern.test(termo2)) {
        return true;
      }
    }
    if (termo2.indexOf("(") >= 0) {
      var removeReplaceRegexp = /\([^\(^\)]*\)/;
      var pattern = termo2.replace(/\(.*?\)/g, "(.*)");
      if (pattern.test(termo2)) {
        return true;
      }
    }
  }

};
