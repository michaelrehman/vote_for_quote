const express = require('express');
const layout = require('express-ejs-layouts');
const path = require('path');
const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/firestore');

// Firebase configs are considered public; therefore,
// define security rules to protect any data/files.
// https://firebase.google.com/docs/projects/learn-more?authuser=0#config-files-objects
const firebaseConfig = JSON.parse(`{
	"apiKey": "AIzaSyD_7XHQ01t1rczjfTfeTrduTYuBqHcTvw8",
	"authDomain": "vote-for-quote.firebaseapp.com",
	"databaseURL": "https://vote-for-quote.firebaseio.com",
	"projectId": "vote-for-quote",
	"storageBucket": "vote-for-quote.appspot.com",
	"messagingSenderId": "57143933951",
	"appId": "1:57143933951:web:2ab07163f80e986f9a05ca",
	"measurementId": "G-R7S23CQ19S"
}`);
firebase.initializeApp(firebaseConfig);

// Initialize app and set template engine.
const app = express();
app.set('view engine', 'ejs');
app.use(layout);

// Routes
app.use('/', require('./routes/index.js'));

// Static assets
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Listening on port ${PORT}.`));
