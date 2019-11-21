const router = require('express').Router();
const path = require('path');
const { auth, db } = require('../server.js');
const { isValidEmail, usernameAlreadyExists, determineError } = require('../utils/utils');

require('../utils/obervers')
	.setAuthObserver(auth, (user) => {
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
		const { username, email, password } = req.body;
		// Validate inputs
		// TODO: add security rule for unique usernames and adjust code (https://stackoverflow.com/questions/35243492)
		const errors = JSON.parse('{"username":"","password":"","email":""}');
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
			await db.collection('usernames').doc('usernames').set(
				{ [username]: auth.currentUser.uid },
				{ merge: true }
			);
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
		const { email, password } = req.body;
		// Validate inputs
		const errors = JSON.parse('{"password":"","email":""}');
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