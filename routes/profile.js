const router = require('express').Router();
const path = require('path');
const { auth, db } = require('../server.js');

// Profile page
router.get('/:name', (req, res) => {
	// If not signed in, redirect to sign in // TODO: send session error message (not signed in)
	if (!auth.currentUser) { return res.redirect('/users/signin'); }
	const { name } = req.params;
	res.render(path.join('users', 'profile'), { currUser: auth.currentUser, name });
});

module.exports = router;