module.exports = {
	// https://stackoverflow.com/questions/46155
	isValidEmail: (email) => {
		const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	},
	// For authentication and database errors
	determineError: (err) => {
		console.error(`${err.code}: ${err.message}`);
		let statusCode = 200;	// default
		let errorMsg = '';
		// TODO: after implementing unique usernames rule, modify this
		if (err.code === 'auth/username-already-in-use') {	// custom
			errorMsg = 'That username is already taken.';
		} else if (err.code === 'auth/email-already-in-use') {
			errorMsg = 'An account with that email already exists.';
		} else if (err.code === 'auth/user-not-found') {
			errorMsg = 'That email is not associated with an account.';
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
	},
	generateQuoteObjects(idQuotesMap, author, doSort) {
		const { Quote } = require('./models');
		const quoteObjects = [];
		for (const qid in idQuotesMap) {
			const { body, timestamp, votes } = idQuotesMap[qid];
			quoteObjects.push(new Quote(qid, author, body, timestamp, votes));
		}
		if (doSort) { quoteObjects.sort(require('./models').Quote.sortDatesDescending); }
		return quoteObjects;
	}
};