const router = require('express').Router();
const path = require('path');

router.get('/', (req, res) => {
	res.render(path.join('quotes', 'index'));
});

router.get('/quotes', (req, res) => {
	res.render(path.join('quotes', 'quotes'))
});

module.exports = router;