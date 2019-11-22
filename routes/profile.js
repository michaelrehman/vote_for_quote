const router = require('express').Router();
const path = require('path');
const { auth, db } = require('../server');
const { determineError, generateQuoteObjects } = require('../utils/utils');

// Profile page
router.get('/:username', async (req, res) => {
	// If not signed in, redirect to sign in // TODO: send session error message (not signed in)
	if (!auth.currentUser) { return res.redirect('/users/signin'); }
	const profilePagePath = path.join('users', 'profile');
	const { username } = req.params;
	let userData;
	try {
		// Get the uid mapped to the username
		let uid;
		const userUidMap = await db.collection('usernames').doc('usernames').get();
		// if the document doesn't exist, then we have no users
		if (userUidMap.exists) {
			uid = userUidMap.data()[username];
		} else { return res.render(profilePagePath, { currUser: auth.currentUser }); }
		// Get the profile mapped to the uid (if no uid, that username does not exist)
		if (uid) {
			userData = (await db.collection('users').doc(uid).get()).data();
		} else { return res.render(profilePagePath, { currUser: auth.currentUser }); }
	} catch (err) {
		// TODO: alert user
		determineError(err);
	}
	// Push and sort the quotes if the user has any
	userData.quotes = generateQuoteObjects(userData.quotes, username);
	return res.render(profilePagePath, {
		currUser: auth.currentUser, profile: userData
	});
});

module.exports = router;