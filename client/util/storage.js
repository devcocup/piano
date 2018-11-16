import localStorageDataAccess from './localStorageDataAccess';

class Storage {
  fileKey(filename) {
    return `file_${filename}`;
  }

  loadFileData(filename) {
    return localStorageDataAccess.load(this.fileKey(filename));
  }

  saveFileData(filename, key, data) {
    return this.loadFileData(filename).then(result => {
      const updated = result || {};
      updated[key] = data;
      return localStorageDataAccess.save(this.fileKey(filename), updated);
    });
  }

  loadGlobalData() {
    return localStorageDataAccess.load('piano');
  }

  saveGlobalData(data) {
    return localStorageDataAccess.save('piano', data);
  }
}

const storage = new Storage();
export default storage;
