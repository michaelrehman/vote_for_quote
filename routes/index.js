const router = require('express').Router();

router.get('/', (req, res) => res.render('index.ejs'));

router.get('/quotes', (req, res) => {
	res.render('quotes.ejs');
});

module.exports = router;