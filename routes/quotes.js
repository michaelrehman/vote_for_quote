const router = require('express').Router();
const path = require('path');
const { auth, db } = require('../server');
const { determineError, generateTimeStamp, generateQuoteObjects } = require('../utils/utils');

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
		const quotesPagePath = path.join('quotes', 'quotes');
		let allUserSnaps;
		try {
			// Get quotes from each user
			allUserSnaps = await db.collection('users').get();
			if (allUserSnaps.empty) {
				return res.status(200).render(quotesPagePath, { currUser: auth.currentUser });
			}
		} catch (err) {
			const { statusCode, errorMsg } = determineError(err);
			return res.status(statusCode).render(quotesPagePath, {
				errorMsg
			});
		}
		// TODO: see if you can find a way to combine the loops
		// Everytime a quote is added, we POST to /quotes, which redirects to GET /quotes
		// TODO: Instead reading all the quotes, only read the new/changed ones
		// TODO: Instead of storing the quotes in an array and rendering it, store them in the session
		// 		 so we can render the page without having to wait for the firestore.
		const displayQuotes = [];	// array of quote objects
		allUserSnaps.forEach((userSnap) => {	// loops through all documents
			const { username, quotes } = userSnap.data();
			displayQuotes.push(...generateQuoteObjects(quotes, username));
		});
		displayQuotes.sort(require('../utils/models').Quote.sortDatesDescending);
		return res.status(200).render(quotesPagePath, {
			currUser: auth.currentUser, quotes: displayQuotes
		});
	})
	// Create quote
	.post(async (req, res) => {
		// If not signed in, redirect to homepage // TODO: send session error message (not signed in)
		if (!auth.currentUser) { return res.redirect('/users/signin'); }
		let { quote } = req.body;
		quote = quote.trim();
		if (quote.length !== 0) {
			try {
				await db.collection('users').doc(auth.currentUser.uid).set({
					quotes: {
						[require('shortid').generate()]: {
							body: quote, timestamp: generateTimeStamp(), votes: 0
						}
					}
				}, { merge: true });
			} catch (err) {
				// TODO: alert user
				determineError(err);
			}
		}
		// Typically, the alert messages are hangled on the backend, but
		// I did it on the frontend this time cause of the modal.
		// The if-statement exists in case someone submits a POST request
		// through an external application (i.e. Postman).
		res.redirect('/quotes');
	});

module.exports = router;