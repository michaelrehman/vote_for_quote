// Writing them this way makes them customizable
module.exports = {
	setAuthObserver: (auth, callback, errorCallback) => {
		return auth.onAuthStateChanged(callback, errorCallback)
	},
	setDbObserver: (docToWatch, callback, errorCallback) => {
		return docToWatch.onSnapshot(callback, errorCallback)
	}
};