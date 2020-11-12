import FileBuffer from './file_buffer';

class Aiff {
  constructor(filePath) {
    this.fileBuffer = new FileBuffer(filePath);
    this.formChunk = {
      ckId: null,
      size: null,
      formType: null,
    };
  }

  async open() {
    return this.fileBuffer.open().then(() => {
      return this.readForm();
    });
  }

  async readForm() {
    return this.fileBuffer.readNext(12).then((data) => {
      const { buffer } = data;
      this.formChunk.ckId = buffer.toString('latin1', 0, 4);
      this.formChunk.size = buffer.readInt32BE(4);
      this.formChunk.formType = buffer.toString('latin1', 8, 12);

      if (this.formChunk.ckId !== 'FORM') {
        throw new Error('Cannot find FORM header in AIFF file');
      }

      if (this.formChunk.formType !== 'AIFF') {
        throw new Error('Cannot find AIFF type in AIFF file');
      }
    });
  }

  async close() {
    return this.fileBuffer.close();
  }
}

export default Aiff;
