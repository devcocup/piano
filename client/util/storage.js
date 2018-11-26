import localStorageDataAccess from './localStorageDataAccess';
import { PIANO_KEY } from '../constants/storageKeys';

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
    return localStorageDataAccess.load(PIANO_KEY);
  }

  saveGlobalData(key, data) {
    return this.loadGlobalData().then(result => {
      const updated = result || {};
      updated[key] = data;
      return localStorageDataAccess.save(PIANO_KEY, updated);
    });
  }
}

const storage = new Storage();
export default storage;
