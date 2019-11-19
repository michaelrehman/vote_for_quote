const router = require('express').Router();
const path = require('path');
const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/firestore');

// Firebase configs are considered public; therefore,
// define security rules to protect any data/files.
// https://firebase.google.com/docs/projects/learn-more?authuser=0#config-files-objects
const firebaseConfig = JSON.parse(`{
	"apiKey":"AIzaSyD_7XHQ01t1rczjfTfeTrduTYuBqHcTvw8",
	"authDomain":"vote-for-quote.firebaseapp.com",
	"databaseURL":"https://vote-for-quote.firebaseio.com",
	"projectId":"vote-for-quote",
	"storageBucket":"vote-for-quote.appspot.com",
	"messagingSenderId":"57143933951",
	"appId":"1:57143933951:web:2ab07163f80e986f9a05ca",
	"measurementId":"G-R7S23CQ19S"
}`);
firebase.initializeApp(firebaseConfig);

// https://stackoverflow.com/questions/46155
const isValidEmail = (email) => {
	const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

// Profile page
router.get('/profile/:name', (req, res) => {
	const { name } = req.params;
	res.render(path.join('users', 'profile'), { name });
});

// Sign up page
router.get('/signup', (req, res) => {
	res.render(path.join('users', 'signup'));
});

// Create account
router.post('/signup', async (req, res) => {
	const { username, email, password } = req.body;
	// Validate inputs
	// TODO: check for uniqueness of username & email
	const errors = JSON.parse('{"username":"","password":"","email":""}');
	if (!isValidEmail(email)) { errors.email = 'Invalid email.'; }
	if (password.length < 6) { errors.password = 'Password must be at least 6 characters.' }
	if (errors.username || errors.email || errors.password) {
		return res.status(200).render(path.join('users', 'signup'), {
			errors, username, email, password
		});
	}
	// Create account
	try {
		await firebase.auth().createUserWithEmailAndPassword(email, password);
		await firebase.auth().signInWithEmailAndPassword(email, password);
		await firebase.auth().currentUser.updateProfile({ displayName: username });
	} catch (err) {
		console.err(`${err.code}: ${err.message}`);
		let statusCode = 500;
		let errorMsg = 'Something went wrong.';
		if (err.code === 'auth/email-already-in-use') {
			statusCode = 200;
			errorMsg = 'An account with this email already exists.';
		}
		return res.status(statusCode).render(path.join('users', 'signin'), {
			errorMsg
		});
	}
	return res.status(200).render(path.join('quotes', 'index'));
});

// Sign in page
router.get('/signin', (req, res) => {
	res.render(path.join('users', 'signin'));
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
		const user = await firebase.auth().signInWithEmailAndPassword(email, password);
		if (user) {
			return res.status(200).render(path.join('quotes', 'index'));
		}
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

firebase.auth().onAuthStateChanged((user) => {
	if (user) {
		console.log(user.displayName);
	}
});

module.exports = router;