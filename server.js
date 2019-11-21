const express = require('express');
const bodyParser = require('body-parser');
const layout = require('express-ejs-layouts');
const path = require('path');
const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/firestore');

// Firebase configs are considered public; therefore,
// define security rules to protect any data/files.
// https://firebase.google.com/docs/projects/learn-more?authuser=0#config-files-objects
// https://firebase.google.com/docs/rules/get-started?authuser=0
firebase.initializeApp(JSON.parse(`{
	"apiKey":"AIzaSyD_7XHQ01t1rczjfTfeTrduTYuBqHcTvw8",
	"authDomain":"vote-for-quote.firebaseapp.com",
	"databaseURL":"https://vote-for-quote.firebaseio.com",
	"projectId":"vote-for-quote",
	"storageBucket":"vote-for-quote.appspot.com",
	"messagingSenderId":"57143933951",
	"appId":"1:57143933951:web:2ab07163f80e986f9a05ca",
	"measurementId":"G-R7S23CQ19S"
}`));
const auth = firebase.auth();

module.exports = {
	auth,
	db: firebase.firestore(),
	FieldValue: firebase.firestore.FieldValue
};

// Initialize app and set template engine
const app = express();
app.set('view engine', 'ejs');
app.use(layout);

// Allow access to request.body
app.use(bodyParser.urlencoded(JSON.parse('{"extended":"true"}')));

// Static assets
if (process.env.NODE_ENV !== 'production') {
	app.use(express.static(path.join(__dirname, 'client')));
	console.log('using static assets from /client');
} else {
	app.use(express.static(path.join(__dirname, 'dist')));
	console.log('using static assets from /dist');
}

// Routes
app.use('/', require('./routes/quotes'));	// homepage, displaying quotes
app.use('/users', require('./routes/users'));	// creating and authenticating users
app.use('/users/profile', require('./routes/profile'));	// updating, deleting, displaying user details
app.get('*', (req, res) => res.status(404).render('404', { currUser: auth.currentUser }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Listening on port ${PORT}.`));