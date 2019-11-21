const router = require('express').Router();
const path = require('path');
const { auth, db, FieldValue } = require('../server');
const { determineError, parseTimestamp, generateTimeStamp } = require('../utils/utils');
const Quote = require('../utils/Quote');

// Home page
router.get('/', (req, res) => {
	res.status(200).render(path.join('quotes', 'index'), { currUser: auth.currentUser });
});

// Quotes page
router.route('/quotes')
	// Display quotes
	.get(async (req, res) => {
		// If not signed in, redirect to homepage // TODO: send session error message (not signed in)
		if (!auth.currentUser) { return res.redirect('/users/signin'); }
		let data = {};
		try {
			// Get quotes
			const quoteDocSnapshot = await db.collection('quotes').doc('quotes').get();
			if (quoteDocSnapshot.exists) {
				data = quoteDocSnapshot.data();
			}
		} catch (err) {
			const { statusCode, errorMsg } = determineError(err);
			return res.status(statusCode).render(path.join('quotes', 'quotes'), {
				errorMsg
			});
		}
		// TODO: see if you can find a way to combine the loops
		// Everytime a quote is added, we POST to /quotes, which redirects to GET /quotes
		// TODO: Instead reading all the quotes, only read the new/changed ones
		// TODO: Instead of storing the quotes in an array and rendering it, store them in the session
		// 		 so we can render the page without having to wait for the firestore.
		const quotes = [];	// array of quote objects
		for (const username in data) {
			const userQuotes = data[username];
			userQuotes.forEach((quoteData) => {
				const { body, timestamp, votes } = quoteData;
				quotes.push((new Quote(username, body, timestamp, votes)));
			});
		}
		// Sort quotes into descending order
		if (quotes.length !== 0) {
			quotes.sort(Quote.sortDatesDescending);
		} else {
			// TODO: output message when no quotes
		}
		return res.status(200).render(path.join('quotes', 'quotes'), { currUser: auth.currentUser, quotes });
	})
	// Create quote
	.post(async (req, res) => {
		// If not signed in, redirect to homepage // TODO: send session error message (not signed in)
		if (!auth.currentUser) { return res.redirect('/users/signin'); }
		// TODO: input validation
		const { quote } = req.body;
		const timestamp = generateTimeStamp();
		try {
			await db.collection('quotes').doc('quotes').update({
				[auth.currentUser.displayName]: FieldValue.arrayUnion({
					body: quote, timestamp, votes: 0
				})
			});
		} catch (err) {
			// TODO: alert user
			determineError(err);
		}
		res.redirect('/quotes');
	});

module.exports = router;