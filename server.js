const express = require('express');
const bodyParser = require('body-parser');
const layout = require('express-ejs-layouts');
const path = require('path');

// Initialize app and set template engine
const app = express();
app.set('view engine', 'ejs');
app.use(layout);

// Allow access to request.body
app.use(bodyParser.urlencoded(JSON.parse('{"extended":"true"}')));

// Static assets
app.use(express.static(path.join(__dirname, 'dist')));

// Routes
app.use('/', require('./routes/quotes'));
app.use('/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Listening on port ${PORT}.`));