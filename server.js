const express = require('express');
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

module.exports = {
	auth,
	db: firebase.firestore()
};

// Initialize app and set template engine
const app = express();
app.set('view engine', 'ejs');
app.use(layout);

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

// Routes
app.use('/', require('./routes/quotes'));	// homepage, displaying quotes
app.use('/users', require('./routes/users'));	// creating and authenticating users
app.use('/users/profile', require('./routes/profile'));	// updating, deleting, displaying user details
app.get('*', (req, res) => res.status(404).render('404', { currUser: auth.currentUser }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Listening on port ${PORT}.`));