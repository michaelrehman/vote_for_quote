const router = require('express').Router();
const path = require('path');
const { usersColl, usernamesDoc } = require('../server');
const { determineError, generateQuoteObjects } = require('../utils/utils');

router.get('/', (req, res) => res.send('profiles will go here'));

// Profile page
router.get('/:username', async (req, res) => {
	const profilePagePath = path.join('users', 'profile');
	const { username } = req.params;
	let userData;
	try {
		// Get the uid mapped to the username
		let uid;
		const userUidMap = await usernamesDoc.get();
		// if the document doesn't exist, then we have no users
		if (userUidMap.exists) {
			uid = userUidMap.data()[username];
			console.log(uid)
		} else { return res.render(profilePagePath); }
		// Get the profile mapped to the uid (if no uid, that username does not exist)
		if (uid) {
			userData = (await usersColl.doc(uid).get()).data();
		} else { return res.render(profilePagePath); }
	} catch (err) {
		// TODO: alert user
		determineError(err);
	}
	// Push and sort the quotes if the user has any
	// TODO: ignore improperly formatted quotes
	userData.quotes = generateQuoteObjects(userData.quotes, username, true);
	return res.render(profilePagePath, { profile: JSON.stringify(userData) });
});

module.exports = router;