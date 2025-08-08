// Site Configuration
const config = {
    // Site Information
    siteName: 'JivanJyoti Foundation',
    siteTagline: 'Save Our Nature',
    siteUrl: process.env.SITE_URL || 'http://localhost:3000',
    
    // Database Configuration (for future MongoDB/MySQL integration)
    database: {
        host: process.env.DB_HOST || 'localhost',
        name: process.env.DB_NAME || 'jivanjyoti_foundation',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || ''
    },
    
    // Contact Information
    contact: {
        email: process.env.CONTACT_EMAIL || 'info@jivanjyoti.org',
        phone: process.env.CONTACT_PHONE || '+91-XXXX-XXXXXX',
        address: process.env.CONTACT_ADDRESS || 'JivanJyoti Foundation Office'
    },
    
    // Social Media Links
    social: {
        facebook: process.env.FACEBOOK_URL || '#',
        twitter: process.env.TWITTER_URL || '#',
        instagram: process.env.INSTAGRAM_URL || '#',
        linkedin: process.env.LINKEDIN_URL || '#'
    },
    
    // Path Constants
    paths: {
        assets: '/assets/',
        images: '/images/',
        css: '/assets/css/',
        js: '/assets/js/'
    },
    
    // Email Configuration
    email: {
        smtp: {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER || '',
                pass: process.env.SMTP_PASS || ''
            }
        },
        from: process.env.EMAIL_FROM || 'noreply@jivanjyoti.org'
    },
    
    // Team Members Data
    teamMembers: [
        {
            name: 'Mr. Prahlad Dhavale',
            position: 'Founder & CEO',
            image: '/images/pyarelal.jpeg',
            description: 'Prahlad is a visionary leader with over 5 years of experience in environmental conservation.'
        },
        {
            name: 'Dr. Kunal Udhan',
            position: 'Head of Programs',
            image: '/images/kunal.jpg',
            description: 'Kunal leads our program development and implementation initiatives.'
        },
        {
            name: 'Anurag Sonawane',
            position: 'Operations Manager',
            image: '/images/anurag.jpg',
            description: 'Anurag manages day-to-day operations and coordinates field activities.'
        },
        {
            name: 'Govind Pawar',
            position: 'Community Outreach Coordinator',
            image: '/images/govind.jpg',
            description: 'Govind works with local communities to build environmental awareness.'
        },
        {
            name: 'Kishor Jadhav',
            position: 'Project Manager',
            image: '/images/kishor.jpg',
            description: 'Kishor oversees project planning and execution across all initiatives.'
        },
        {
            name: 'Baliram Patil',
            position: 'Field Coordinator',
            image: '/images/Baliram.jpg',
            description: 'Baliram coordinates field activities and manages plantation drives.'
        },
        {
            name: 'Pushpa Devi',
            position: 'Women Empowerment Lead',
            image: '/images/pushpa .jpg',
            description: 'Pushpa leads initiatives for women empowerment in environmental conservation.'
        },
        {
            name: 'Rajendra Singh',
            position: 'Research Coordinator',
            image: '/images/Rajendra.jpg',
            description: 'Rajendra conducts research on sustainable environmental practices.'
        }
    ]
};

module.exports = config;