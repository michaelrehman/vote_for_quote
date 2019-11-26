const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const layout = require('express-ejs-layouts');
const path = require('path');
const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/firestore');
require('dotenv').config();

firebase.initializeApp({
	apiKey: process.env.API_KEY,
	authDomain: process.env.AUTH_DOMAIN,
	databaseURL: process.env.DATABASE_URL,
	projectId: process.env.PROJECT_ID,
	storageBucket: process.env.STORAGE_ID,
	messagingSenderId: process.env.MESSAGE_SENDER_ID,
	appId: process.env.APP_ID,
	measurementId: process.env.MEAUSUREMENT_ID
});
const auth = firebase.auth();
const db = firebase.firestore();

module.exports = {
	auth, db, fv: firebase.firestore.FieldValue,
	usersColl: db.collection('users'),
	usernamesDoc: db.collection('usernames').doc('usernames')
};

// Initialize app and set template engine
const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(layout);

// gzip compression
app.use(compression());

// Allow access to request.body for html encoded bodies (forms) and json (apis like fetch)
app.use(bodyParser.urlencoded(JSON.parse('{"extended":"true"}')));
app.use(bodyParser.json());

// Static assets
if (process.env.NODE_ENV !== 'production') {
	app.use(express.static(path.join(__dirname, 'client')));
	console.log('using static assets from /client');
} else {
	app.use(express.static(path.join(__dirname, 'dist')));
	console.log('using static assets from /dist');
}

// Check if the user is logged in and prevent access to certain pages
app.use('/', (req, res, next) => {
	res.locals.currUser = auth.currentUser;
	const url = req.url.toLowerCase();
	if (res.locals.currUser === null) {
		// Prohibit quotes and profiles if not signed in.
		if (/\/quotes(\/?||\/[^\/]*)\/?$/.test(url)
				|| /\/users\/profiles(\/?||\/[^\/]*)\/?$/.test(url)) {
			return res.redirect(401, '/users/signin');
		}
	} else {
		// Prohibit sign in and sign up if signed in.
		if (/\/users\/signin\/?$/.test(url) || /\/users\/signup\/?$/.test(url)) {
			return res.redirect('/quotes');
		}
	}
	next();
});

// Routes
app.use('/', require('./routes/quotes'));	// homepage, displaying quotes
app.use('/users', require('./routes/users'));	// creating and authenticating users
app.use('/users/profiles', require('./routes/profile'));	// updating, deleting, displaying user details
app.get('*', (req, res) => res.status(404).render('404'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Listening on port ${PORT}.`));