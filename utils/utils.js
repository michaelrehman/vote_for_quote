module.exports = {
	// https://stackoverflow.com/questions/46155
	isValidEmail: (email) => {
		const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	},
	usernameAlreadyExists: async (username, db) => {
		try {
			// All usernames stored in a single document instead of a multiple.
			// This keeps the amount of reads down.
			const usernamesDocRef = db.collection('usernames').doc('usernames');
			const usernamesDoc = await usernamesDocRef.get();
			if (usernamesDoc.exists) {
				// Should always execute but to be safe //TODO: handle when !exsits
				const usernames = usernamesDoc.data();
				return !!usernames[username];
			}
		} catch (err) {
			console.error('Could not retrieve document: ' + err);
		}
	},
	determineError: (err) => {
		console.error(`${err.code}: ${err.message}`);
		let statusCode = 200;	// default
		let errorMsg = '';
		if (err.code === 'auth/username-already-in-use') {	// custom
			errorMsg = 'This username is already taken.';
		} else if (err.code === 'auth/email-already-in-use') {
			errorMsg = 'An account with this email already exists.';
		} else if (err.code === 'auth/user-not-found') {
			errorMsg = 'This email is not associated with an account.';
		} else if (err.code === 'auth/wrong-password') {
			errorMsg = 'Incorrect password.';
		} else if (err.code === 'auth/too-many-requests') {
			statusCode = 400;
			errorMsg = 'Too many unsuccessful attempts. Try again shortly.';
		} else {
			statusCode = 500;
			errorMsg = 'Something went wrong.';	// default
		}
		return { statusCode, errorMsg };
	},
	// Using momentjs since Firebase doesn't have before/after date comparisons.
	parseTimestamp: (seconds, format='MMM Do YYYY, h:mm A') => {
		return require('moment').unix(seconds).format(format);
	},
	generateTimeStamp: () => {
		return require('moment')().unix();	// time in seconds
	}
};