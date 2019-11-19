const router = require('express').Router();
const path = require('path');
const { auth } = require('../server.js');

// https://stackoverflow.com/questions/46155
const isValidEmail = (email) => {
	const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

// Profile page
router.get('/profile/:name', (req, res) => {
	const { name } = req.params;
	res.render(path.join('users', 'profile'), { currUser: auth.currentUser, name });
});

// Sign up page
router.get('/signup', (req, res) => {
	if (auth.currentUser) { return res.redirect(200, '/'); }
	return res.status(200).render(path.join('users', 'signup'));
});

// Create account
router.post('/signup', async (req, res) => {
	const { username, email, password } = req.body;
	// Validate inputs
	// TODO: check for uniqueness of username
	const errors = JSON.parse('{"username":"","password":"","email":""}');
	if (!isValidEmail(email)) { errors.email = 'Invalid email.'; }
	if (password.length < 6) { errors.password = 'Password must be at least 6 characters.' }
	if (errors.username || errors.email || errors.password) {
		return res.status(200).render(path.join('users', 'signup'), {
			errors, username, email
		});
	}
	// Create account
	try {
		await auth.createUserWithEmailAndPassword(email, password);
		await auth.signInWithEmailAndPassword(email, password);
		await auth.currentUser.updateProfile({ displayName: username });
	} catch (err) {
		console.error(`${err.code}: ${err.message}`);
		let statusCode = 500;
		let errorMsg = 'Something went wrong.';
		if (err.code === 'auth/email-already-in-use') {
			statusCode = 200;
			errorMsg = 'An account with that email already exists.';
		}
		return res.status(statusCode).render(path.join('users', 'signup'), {
			errorMsg, username
		});
	}
	return res.redirect(200, '/');
});

// Sign in page
router.get('/signin', (req, res) => {
	if (auth.currentUser) { return res.redirect(200, '/'); }
	return res.status(200).render(path.join('users', 'signin'));
});

// Sign in to account
router.post('/signin', async (req, res) => {
	const { email, password } = req.body;
	// Validate inputs
	const errors = JSON.parse('{"password":"","email":""}');
	if (!isValidEmail(email)) { errors.email = 'Invalid email.'; }
	if (password.length === 0) { errors.password = 'Please input a password.' }
	if (errors.email || errors.password) {
		return res.status(200).render(path.join('users', 'signin'), {
			errors, email
		});
	}
	try {
		await auth.signInWithEmailAndPassword(email, password);
		return res.redirect(200, '/');
	} catch (err) {
		console.error(`${err.code}: ${err.message}`);
		let statusCode = 500;
		let errorMsg = 'Something went wrong.';
		if (err.code === 'auth/wrong-password') {
			statusCode = 200;
			errorMsg = 'Incorrect password.';
		} else if (err.code === 'auth/user-not-found') {
			statusCode = 200;
			errorMsg = 'This email is not associated with an account.';
		}
		return res.status(statusCode).render(path.join('users', 'signin'), {
			errorMsg
		});
	}
});

router.get('/signout', (req, res) => {
	auth.signOut();
	return res.redirect(200, '/users/signin');
});

module.exports = router;