const functions = require('firebase-functions');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();

// Import configuration
const config = require('./config/config');

// Import routes
const routes = require('./routes');

// Middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Make config available to all templates
app.use((req, res, next) => {
    res.locals.config = config;
    res.locals.currentPage = req.path;
    next();
});

// Routes
app.use('/', routes);

// 404 handler
app.use((req, res) => {
    res.status(404).render('404', {
        pageTitle: '404 - Page Not Found',
        currentPage: req.path
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        pageTitle: '500 - Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {},
        currentPage: req.path
    });
});

// Export the Express app as a Firebase Function
exports.app = functions.https.onRequest(app);