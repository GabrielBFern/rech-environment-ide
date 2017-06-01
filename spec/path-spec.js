'use babel';

import Path from '../lib/commons/path';

describe('Path', () => {

  describe("Tests for constructor", () => {
    it('works with windows paths', () => {
      expect(new Path("C:\\tmp\\Test.txt").fullPath()).toBe("C:\\tmp\\Test.txt");
    });
    it('works with unix paths', () => {
      expect(new Path("C:/tmp/Test.txt").fullPath()).toBe("C:\\tmp\\Test.txt");
    });
    it('also works with mixed windows/unix paths', () => {
      expect(new Path("C:\\tmp/Test.txt").fullPath()).toBe("C:\\tmp\\Test.txt");
    });
  });

  describe("Tests for method 'directory()'", () => {
    it('works for files', () => {
      expect(new Path("C:\\tmp\\Test.txt").directory()).toBe("C:\\tmp\\");
      expect(new Path("F:\\SIGER\\DES\\FON\\Teste.txt").directory()).toBe("F:\\SIGER\\DES\\FON\\");
    });
    it('works for directories', () => {
      expect(new Path("C:\\tmp\\").directory()).toBe("C:\\tmp\\");
      expect(new Path("F:\\SIGER\\DES\\FON\\").directory()).toBe("F:\\SIGER\\DES\\FON\\");
    });
    it('returns the same case as the input', () => {
      expect(new Path("C:\\TMP\\Test.txt").directory()).toBe("C:\\TMP\\");
      expect(new Path("c:\\tmp\\Test.txt").directory()).toBe("c:\\tmp\\");
    });
  });

  describe("Tests for method 'setFileName()'", () => {
    it('works for files', () => {
      expect(new Path("C:\\tmp\\Test.txt").setFileName("Another.png").fullPath()).toBe("C:\\tmp\\Another.png");
    });
  });

});
