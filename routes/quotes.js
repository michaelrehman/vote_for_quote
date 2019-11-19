const router = require('express').Router();
const path = require('path');
const { auth, db } = require('../server');

auth.onAuthStateChanged((user) => {
	if (user) {
		console.log('inside')
	} else {
		console.log('not in')
	}
});

router.get('/', (req, res) => {
	res.status(200).render(path.join('quotes', 'index'), { currUser: auth.currentUser });
});

router.get('/quotes', (req, res) => {
	res.status(200).render(path.join('quotes', 'quotes'), { currUser: auth.currentUser });
});

module.exports = router;