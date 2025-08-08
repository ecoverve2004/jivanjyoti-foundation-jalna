const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const config = require('../config/config');

// Helper function to create email transporter
const createTransporter = () => {
    return nodemailer.createTransporter(config.email.smtp);
};

// Home Page
router.get('/', (req, res) => {
    res.render('index', {
        pageTitle: 'JivanJyoti Foundation - Save Our Nature'
    });
});

// About Page
router.get('/about', (req, res) => {
    res.render('about', {
        pageTitle: 'About Us - JivanJyoti Foundation'
    });
});

// Team Page
router.get('/team', (req, res) => {
    res.render('team', {
        pageTitle: 'Our Team - JivanJyoti Foundation',
        teamMembers: config.teamMembers
    });
});

// Contact Page
router.get('/contact', (req, res) => {
    res.render('contact', {
        pageTitle: 'Contact Us - JivanJyoti Foundation'
    });
});

// Contact Form Handler
router.post('/contact', async (req, res) => {
    try {
        const { Name, Email, Subject, msg } = req.body;
        
        // Basic validation
        if (!Name || !Email || !Subject || !msg) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(Email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please enter a valid email address' 
            });
        }
        
        // Create email transporter
        const transporter = createTransporter();
        
        // Email options
        const mailOptions = {
            from: config.email.from,
            to: config.contact.email,
            subject: `Contact Form: ${Subject}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${Name}</p>
                <p><strong>Email:</strong> ${Email}</p>
                <p><strong>Subject:</strong> ${Subject}</p>
                <p><strong>Message:</strong></p>
                <p>${msg.replace(/\n/g, '<br>')}</p>
            `
        };
        
        // Send email
        await transporter.sendMail(mailOptions);
        
        res.json({ 
            success: true, 
            message: 'Your message has been sent successfully! We will get back to you soon.' 
        });
        
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'There was an error sending your message. Please try again later.' 
        });
    }
});

// Donate Page
router.get('/donate', (req, res) => {
    res.render('donate', {
        pageTitle: 'Donate - JivanJyoti Foundation'
    });
});

// Donation Form Handler
router.post('/donate', async (req, res) => {
    try {
        const { amount, name, email, phone, anonymous } = req.body;
        
        // Basic validation
        if (!amount || !name || !email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Amount, name, and email are required' 
            });
        }
        
        // Amount validation
        if (isNaN(amount) || parseFloat(amount) <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please enter a valid donation amount' 
            });
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please enter a valid email address' 
            });
        }
        
        // Create email transporter
        const transporter = createTransporter();
        
        // Email to organization
        const orgMailOptions = {
            from: config.email.from,
            to: config.contact.email,
            subject: 'New Donation Request',
            html: `
                <h2>New Donation Request</h2>
                <p><strong>Amount:</strong> ₹${amount}</p>
                <p><strong>Name:</strong> ${anonymous ? 'Anonymous' : name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Anonymous:</strong> ${anonymous ? 'Yes' : 'No'}</p>
            `
        };
        
        // Email to donor
        const donorMailOptions = {
            from: config.email.from,
            to: email,
            subject: 'Thank you for your donation - JivanJyoti Foundation',
            html: `
                <h2>Thank you for your generous donation!</h2>
                <p>Dear ${name},</p>
                <p>Thank you for your donation of ₹${amount} to JivanJyoti Foundation. Your support makes a real difference in our mission to protect and preserve our environment.</p>
                <p>We will process your donation and get back to you with payment details soon.</p>
                <p>Best regards,<br>JivanJyoti Foundation Team</p>
            `
        };
        
        // Send emails
        await transporter.sendMail(orgMailOptions);
        await transporter.sendMail(donorMailOptions);
        
        res.json({ 
            success: true, 
            message: 'Thank you for your generous donation! Your support makes a real difference.' 
        });
        
    } catch (error) {
        console.error('Donation form error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'There was an error processing your donation. Please try again later.' 
        });
    }
});

// Login Page (if using authentication)
router.get('/login', (req, res) => {
    res.render('login', {
        pageTitle: 'Login - JivanJyoti Foundation'
    });
});

// Additional routes for other pages
router.get('/projects', (req, res) => {
    res.render('projects', {
        pageTitle: 'Projects - JivanJyoti Foundation'
    });
});

router.get('/news', (req, res) => {
    res.render('news', {
        pageTitle: 'News - JivanJyoti Foundation'
    });
});

router.get('/privacy', (req, res) => {
    res.render('privacy', {
        pageTitle: 'Privacy Policy - JivanJyoti Foundation'
    });
});

router.get('/terms', (req, res) => {
    res.render('terms', {
        pageTitle: 'Terms of Service - JivanJyoti Foundation'
    });
});

module.exports = router;