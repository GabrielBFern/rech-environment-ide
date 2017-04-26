'use babel';

/**
 * Classe para manipulação de codificação
 */
export default class Encoding {

  decodeWindows1252(buffer) {
    return this.decode(buffer, 'iso-8859-1');
  }

  decode(buffer, encoding) {
    var iconv = require('iconv-lite');
    return iconv.decode(buffer, encoding);
  }

};
