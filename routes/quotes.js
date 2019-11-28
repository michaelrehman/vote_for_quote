const router = require('express').Router();
const path = require('path');
const { auth, fv, usersColl, usernamesDoc } = require('../server');
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
		// TODO: pagination
		const allQuotes = [];	// array of quote objects
		allUserSnaps.forEach((userSnap) => {	// loops through all documents
			const { username, quotes } = userSnap.data();
			allQuotes.push(...generateQuoteObjects(quotes, username));
		});
		allQuotes.sort(require('../utils/models').Quote.sortDatesDescending);	// for rendering
		const userQuotes = allQuotes.filter((quote) => quote.author === auth.currentUser.displayName);	// for editing/deleting
		const nonUserQuotes	= allQuotes.filter((quote) => quote.author !== auth.currentUser.displayName);	// for voting
		return res.status(200).render(quotesPagePath, {
			allQuotes,
			userQuotes: JSON.stringify(userQuotes),
			nonUserQuotes: JSON.stringify(nonUserQuotes)
		});
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
		// Refresh the page in case others have posted new quotes.
		res.status(201).redirect('/quotes');	// NOTE: setting status like this with .redirect doesn't matter
	});

// Update quote
router.route('/quotes/:qid')
	// Votes, edit quote body
	.patch(async (req, res) => {
		try {
			// TODO: make it so users cannot upvote if they already upvote and same with downvotes
			// TODO: make it so users cannot vote on their own quotes
			res.setHeader('Accept', 'application/json');
			const { qid } = req.params;
			const { author, vote } = req.body;
			// get uid mapped to author
			const uid = (await usernamesDoc.get()).data()[author];
			// access the doc mapped to uid
			await usersColl.doc(uid).update({
				// update qid.votes
				[`quotes.${qid}.votes`]: (await usersColl.doc(uid).get()).data().quotes[qid].votes + vote
			});
			return res.sendStatus(204);
		} catch (err) {
			// TODO: actual error handling
			// TODO: alert user
			res.setHeader('Content-Type', 'text/plain');
			return res.sendStatus(500);
		}
	})
	// Quote
	.delete(async (req, res) => {
		// Security rules will prevent users from deleting quotes that aren't theirs
		// TODO: optimize this (spending two reads just to check if a single quote was deleted)
		res.setHeader('Content-Type', 'text/plain');
		const { qid } = req.params;
		try {
			// check if quote exists
			let quote = (await usersColl.doc(auth.currentUser.uid).get()).data().quotes[qid];
			if (quote) {
				// delete quote
				await usersColl.doc(auth.currentUser.uid).update({
					[`quotes.${qid}`]: fv.delete()
				});
				// check if it was deleted
				quote = (await usersColl.doc(auth.currentUser.uid).get()).data().quotes[qid];
				if (!quote) {
					// if it doesn't exist anymore, it was successfully deleted
					return res.sendStatus(204);
				} else {
					// the quote was not deleted
					return res.status(500).send('Could not delete quote.');
				}
			} else {
				// a quote is not associated with the qid
				return res.status(200).send('Quote does not exist.');
			}
		} catch (err) {
			determineError(err);	// TODO: delete this (temporary)
			return res.status(403).send('Can\'t delete quotes that aren\'t yours.');
		}
	});

module.exports = router;