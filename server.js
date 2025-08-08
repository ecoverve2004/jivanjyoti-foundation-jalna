const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import configuration
const config = require('./config/config');

// Import routes
const routes = require('./routes');

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development
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

// Start server
app.listen(PORT, () => {
    console.log(`JivanJyoti Foundation server running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
});

module.exports = app;