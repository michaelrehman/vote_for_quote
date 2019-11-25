const router = require('express').Router();
const path = require('path');
const { auth, db } = require('../server');
const { isValidEmail, determineError } = require('../utils/utils');
const { setAuthObserver, usernameAlreadyExists } = require('../utils/firebase');

setAuthObserver(auth, (user) => {
	if (user) { console.log('signed in'); }
	else { console.log('signed out'); }
}, (err) => console.error(`${err.code}: ${err.message}`));

// Sign up
router.route('/signup')
	// Display sign up page
	.get((req, res) => {
		return res.status(200).render(path.join('users', 'signup'));
	})
	// Create account
	.post(async (req, res) => {
		let { username, email, password } = req.body;
		// Validate inputs (no spaces)
		const errors = { username: [], email: '', password: [] };
		// username
		if (!username) { errors.username.push('Please input a username.'); }
		else if (username.includes(' ')) { errors.username.push('Username cannot contain spaces.'); }
		// email
		if (!isValidEmail(email)) { errors.email = 'Invalid email.'; }
		// password
		if (password.includes(' ')) { errors.password.push('Password cannot contain spaces.'); }
		if (password.length < 6) { errors.password.push('Password must be at least 6 characters.'); }
		// Rerender page w/ form validation errors if they exist
		if (errors.username.length !== 0 || errors.email || errors.password.length !== 0) {
			return res.status(200).render(path.join('users', 'signup'), {
				errors, username, email
			});
		}
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
		return res.status(200).render(path.join('users', 'signin'));
	})
	// Sign in to account
	.post(async (req, res) => {
		let { email, password } = req.body;
		// Validate inputs (email and password entered)
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