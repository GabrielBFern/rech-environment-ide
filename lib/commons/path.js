'use babel';

export default class Path {

  constructor(path) {
    if (typeof path == "string") {
      this.path = path;
    } else {
      this.path = path.toString();
    }
  }

  directory() {
    return this.path.substring(0, this.path.lastIndexOf('\\'));
  }

  fileName() {
    return this.path.substring(this.path.lastIndexOf('\\') + 1, this.path.length);
  }

  baseName() {
    var fileName = this.fileName();
    return fileName.substring(0, fileName.lastIndexOf('.'));
  }

  extension() {
    var fileName = this.fileName();
    return fileName.substring(fileName.lastIndexOf('.'));
  }

  fullPath() {
    return this.path;
  }

  toString() {
    return this.path;
  }

}
