const router = require('express').Router();
const path = require('path');
const { auth, db } = require('../server');
const { isValidEmail, determineError, trim } = require('../utils/utils');
const { setAuthObserver, usernameAlreadyExists } = require('../utils/firebase');

setAuthObserver(auth, (user) => {
	// TODO: store user in session so the currUser doesn't have to be passed in with every render
	if (user) { console.log('signed in'); }
	else { console.log('signed out'); }
}, (err) => console.error(`${err.code}: ${err.message}`));

// Sign up
router.route('/signup')
	// Display sign up page
	.get((req, res) => {
		// If currently logged in, redirect to quotes
		if (auth.currentUser) { return res.redirect('/quotes'); }
		return res.status(200).render(path.join('users', 'signup'));
	})
	// Create account
	.post(async (req, res) => {
		let { username, email, password } = req.body;
		[username, email, password] = trim(username, email, password);
		// Validate inputs
		const errors = {};
		if (!username) { errors.username = 'Please input a username.'; }
		if (!isValidEmail(email)) { errors.email = 'Invalid email.'; }
		if (password.length < 6) { errors.password = 'Password must be at least 6 characters.' }
		if (errors.username || errors.email || errors.password) {
			// Rerender page w/ form validation errors
			return res.status(200).render(path.join('users', 'signup'), {
				errors, username, email
			});
		}
		// Create account
		try {
			// TODO: add security rule for unique usernames and remove this (https://stackoverflow.com/questions/35243492)
			if (await usernameAlreadyExists(username, db)) {
				throw {
					code: 'auth/username-already-in-use',
					message: 'This username is already taken.'
				};
			}
			// Authenticate
			await auth.createUserWithEmailAndPassword(email, password);
			await auth.currentUser.updateProfile({ displayName: username });
			// Firestore
			await db.collection('users').doc(auth.currentUser.uid).set({ email, username });
			await db.collection('usernames').doc('usernames').update({
				[username]: auth.currentUser.uid
			});
		} catch (err) {
			const { statusCode, errorMsg } = determineError(err);
			// Rerender page with registration errors
			return res.status(statusCode).render(path.join('users', 'signup'), {
				errorMsg, username, email
			});
		}
		return res.redirect('/quotes');
	});

// Sign in
router.route('/signin')
	// Display sign in page
	.get((req, res) => {
		// If currently logged in, redirect to quotes page
		if (auth.currentUser) { return res.redirect('/quotes'); }
		return res.status(200).render(path.join('users', 'signin'));
	})
	// Sign in to account
	.post(async (req, res) => {
		let { email, password } = req.body;
		[email, password] = trim(email, password);
		// Validate inputs
		const errors = {};
		if (!isValidEmail(email)) { errors.email = 'Invalid email.'; }
		if (password.length === 0) { errors.password = 'Please input a password.' }
		if (errors.email || errors.password) {
			// Rerender page w/ form validation errors
			return res.status(200).render(path.join('users', 'signin'), {
				errors, email
			});
		}
		try {
			await auth.signInWithEmailAndPassword(email, password);
		} catch (err) {
			const { statusCode, errorMsg } = determineError(err);
			// Rerender page with authentication errors
			return res.status(statusCode).render(path.join('users', 'signin'), {
				errorMsg, email
			});
		}
		return res.redirect('/quotes');
	});

router.get('/signout', (req, res) => {
	auth.signOut();
	return res.redirect('/users/signin');
});

module.exports = router;