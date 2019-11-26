// Writing them this way makes them customizable
module.exports = {
	setAuthObserver: (auth, callback, errorCallback) => {
		return auth.onAuthStateChanged(callback, errorCallback)
	},
	setDbObserver: (docToWatch, callback, errorCallback) => {
		return docToWatch.onSnapshot(callback, errorCallback)
	},
	// TODO: remove this and ensure unique usernames with a database rule
	usernameAlreadyExists: async (username) => {
		try {
			// All usernames stored in a single document
			const usernamesDocSnap = await require('../server').usernamesDoc.get();
			if (usernamesDocSnap.exists) {
				const usernames = usernamesDocSnap.data();
				return !!usernames[username];
			} else { return false; }
		} catch (err) {
			console.error('Could not retrieve document: ' + err);
		}
	}
};