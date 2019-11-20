const router = require('express').Router();
const path = require('path');
const { auth, db } = require('../server');
const { determineError, setDbObserver } = require('./utils/utils');

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
		const quotes = [];
		// TODO: Limit the documents read
		// Everytime a quote is added, we POST to /quotes, which redirects to GET /quotes
		const querySnapshot = await db.collection('users').get();
		querySnapshot.forEach((qDocSnap) => {
			const data = qDocSnap.data();
			Object.values(data.quotes).forEach((quote) => quotes.push({ quote, author: data.username }));
		});
		try {

		} catch (err) {
			const { statusCode, errorMsg } = determineError(err);
			return res.status(statusCode).render(path.join('quotes', 'quotes'), {
				errorMsg
			});
		}
		return res.status(200).render(path.join('quotes', 'quotes'), { currUser: auth.currentUser, quotes });
	})
	// Create quote
	.post(async (req, res) => {
		// If not signed in, redirect to homepage // TODO: send session error message (not signed in)
		if (!auth.currentUser) { return res.redirect('/users/signin'); }
		// TODO: input validation
		const { quote } = req.body;
		const timestamp = new Date().getTime();
		try {
			await db.collection('users').doc(auth.currentUser.uid).set(
				{ quotes: { [timestamp]: quote }},
				{ merge: true }
			);
		} catch (err) {
			console.error(`${err.code}: ${err.message}`);
		}
		res.redirect('/quotes');
	});

module.exports = router;