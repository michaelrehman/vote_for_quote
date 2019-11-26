const router = require('express').Router();
const path = require('path');
const { auth, fv, usersColl } = require('../server');
const { determineError, generateTimeStamp, generateQuoteObjects } = require('../utils/utils');

// Home page
router.get('/', (req, res) => {
	res.status(200).render(path.join('quotes', 'index'));
});

// Quotes page
router.route('/quotes')
	// Display quotes
	.get(async (req, res) => {
		const quotesPagePath = path.join('quotes', 'quotes');
		let allUserSnaps;
		try {
			// Get quotes from each user
			allUserSnaps = await usersColl.get();
			if (allUserSnaps.empty) {
				return res.status(200).render(quotesPagePath);
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
		// TODO: ignore improperly formatted quotes
		const displayQuotes = [];	// array of quote objects
		allUserSnaps.forEach((userSnap) => {	// loops through all documents
			const { username, quotes } = userSnap.data();
			displayQuotes.push(...generateQuoteObjects(quotes, username));
		});
		displayQuotes.sort(require('../utils/models').Quote.sortDatesDescending);
		console.log(displayQuotes.length)
		return res.status(200).render(quotesPagePath, { quotes: JSON.stringify(displayQuotes) });
	})
	// Create quote
	.post(async (req, res) => {
		let { quote } = req.body;
		quote = quote.trim();
		if (quote.length > 0 && quote.length <= 200) {	// submit only if length (0, 200]
			try {
				await usersColl.doc(auth.currentUser.uid).update({
					[`quotes.${require('shortid').generate()}`] : {
						body: quote, timestamp: generateTimeStamp(), votes: 0
					}
				});
			} catch (err) {
				// TODO: alert user
				determineError(err);
			}
		}
		// Typically, the alert messages are hangled on the backend, but
		// I did it on the frontend this time cause of the modal.
		// The if-statement exists in case someone submits a POST request
		// through an external application (i.e. Postman).
		// Refresh the page in case others have posted new quotes.
		res.status(201).redirect('/quotes');	// NOTE: setting status like this with .redirect doesn't matter
	});

// Update quote
router.route('/quotes/:qid')
	// Votes, quote body
	.post(async (req, res) => {
		// TODO: cannot vote on things that currently have a vote
		// TODO: cannot vote on their own quotes
		const { vote } = req.body;
	})
	// Quote
	.delete(async (req, res) => {
		// Security rules will prevent users from deleting quotes that aren't theirs
		const { qid } = req.params;
		res.setHeader('Content-Type', 'text/plain');
		try {
			await usersColl.doc(auth.currentUser.uid).update({
				[`quotes.${qid}`]: fv.delete()
			});
		} catch (err) {
			return res.status(403).send('Cannot delete quotes that are not your own.');
		}
		return res.sendStatus(200);
	});

module.exports = router;