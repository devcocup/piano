class LocalStorageDataAccess {
	save(key, data) {
		window.localStorage.setItem(key, JSON.stringify(data));
		return Promise.resolve();
	}

	load(key) {
		let data;
		try {
			data = JSON.parse(window.localStorage.getItem(key));
		} catch (ex) {
			data = null;
		}
		return Promise.resolve(data);
	}
}

const localStorageDataAccess = new LocalStorageDataAccess();
export default localStorageDataAccess;