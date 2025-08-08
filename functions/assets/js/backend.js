// JavaScript Backend System - Complete Foundation Management
class FoundationBackend {
    constructor() {
        this.apiBase = 'jivanjyoti_foundation';
        this.version = '1.0.0';
        this.init();
    }

    init() {
        this.initializeStorage();
        this.setupEventListeners();
        this.loadInitialData();
    }

    // Storage Management
    initializeStorage() {
        const keys = [
            'volunteers', 'contacts', 'donations', 'newsletter_subscribers',
            'projects', 'news', 'events', 'gallery_images', 'testimonials',
            'users', 'blog_posts', 'resources', 'statistics'
        ];

        keys.forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify([]));
            }
        });

        // Initialize statistics if not exists
        if (!localStorage.getItem('statistics')) {
            const defaultStats = {
                trees_planted: 50000,
                people_reached: 100000,
                projects_completed: 150,
                volunteers: 5000,
                donations_total: 250000,
                newsletter_subscribers: 12000,
                years_active: 15
            };
            localStorage.setItem('statistics', JSON.stringify(defaultStats));
        }
    }

    // Generic CRUD Operations
    create(collection, data) {
        const items = this.getAll(collection);
        const newItem = {
            id: this.generateId(),
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        items.push(newItem);
        localStorage.setItem(collection, JSON.stringify(items));
        return newItem;
    }

    getAll(collection, filter = null) {
        const items = JSON.parse(localStorage.getItem(collection) || '[]');
        if (filter) {
            return items.filter(filter);
        }
        return items;
    }

    getById(collection, id) {
        const items = this.getAll(collection);
        return items.find(item => item.id === id);
    }

    update(collection, id, updates) {
        const items = this.getAll(collection);
        const index = items.findIndex(item => item.id === id);
        
        if (index === -1) {
            throw new Error('Item not found');
        }

        items[index] = {
            ...items[index],
            ...updates,
            updated_at: new Date().toISOString()
        };

        localStorage.setItem(collection, JSON.stringify(items));
        return items[index];
    }

    delete(collection, id) {
        const items = this.getAll(collection);
        const filteredItems = items.filter(item => item.id !== id);
        localStorage.setItem(collection, JSON.stringify(filteredItems));
        return true;
    }

    // Volunteer Management
    registerVolunteer(volunteerData) {
        try {
            // Validate required fields
            const required = ['firstName', 'lastName', 'email', 'phone', 'age'];
            for (let field of required) {
                if (!volunteerData[field]) {
                    throw new Error(`${field} is required`);
                }
            }

            // Check for duplicate email
            const existingVolunteers = this.getAll('volunteers');
            if (existingVolunteers.find(v => v.email === volunteerData.email)) {
                throw new Error('A volunteer with this email already exists');
            }

            const volunteer = this.create('volunteers', {
                ...volunteerData,
                status: 'pending',
                skills: volunteerData.skills || [],
                interests: Array.isArray(volunteerData.interests) ? volunteerData.interests : [volunteerData.interests],
                application_date: new Date().toISOString()
            });

            // Update statistics
            this.updateStatistics('volunteers', 1);

            // Send welcome email (simulated)
            this.sendEmail('volunteer_welcome', volunteer.email, {
                name: `${volunteer.firstName} ${volunteer.lastName}`
            });

            return {
                success: true,
                message: 'Volunteer registration successful',
                data: volunteer
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    getVolunteers(status = null) {
        return this.getAll('volunteers', status ? v => v.status === status : null);
    }

    updateVolunteerStatus(id, status) {
        return this.update('volunteers', id, { status });
    }

    // Contact Management
    submitContactForm(contactData) {
        try {
            const required = ['name', 'email', 'subject', 'message'];
            for (let field of required) {
                if (!contactData[field]) {
                    throw new Error(`${field} is required`);
                }
            }

            const contact = this.create('contacts', {
                ...contactData,
                status: 'new',
                priority: contactData.priority || 'normal'
            });

            // Send auto-reply (simulated)
            this.sendEmail('contact_auto_reply', contact.email, {
                name: contact.name,
                ticket_id: contact.id
            });

            return {
                success: true,
                message: 'Message sent successfully',
                data: contact
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    getContacts(status = null) {
        return this.getAll('contacts', status ? c => c.status === status : null);
    }

    // Newsletter Management
    subscribeToNewsletter(email, preferences = {}) {
        try {
            if (!this.validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }

            const subscribers = this.getAll('newsletter_subscribers');
            const existing = subscribers.find(s => s.email === email);

            if (existing) {
                if (existing.status === 'active') {
                    return {
                        success: true,
                        message: 'You are already subscribed to our newsletter'
                    };
                } else {
                    // Reactivate subscription
                    this.update('newsletter_subscribers', existing.id, {
                        status: 'active',
                        preferences: { ...existing.preferences, ...preferences },
                        resubscribed_at: new Date().toISOString()
                    });
                    return {
                        success: true,
                        message: 'Your subscription has been reactivated'
                    };
                }
            }

            const subscriber = this.create('newsletter_subscribers', {
                email,
                status: 'active',
                preferences: {
                    frequency: 'weekly',
                    topics: ['environmental_tips', 'foundation_updates'],
                    ...preferences
                },
                source: 'website',
                ip_address: this.getClientIP()
            });

            // Update statistics
            this.updateStatistics('newsletter_subscribers', 1);

            // Send welcome email
            this.sendEmail('newsletter_welcome', email);

            return {
                success: true,
                message: 'Successfully subscribed to our newsletter',
                data: subscriber
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    unsubscribeFromNewsletter(email) {
        const subscribers = this.getAll('newsletter_subscribers');
        const subscriber = subscribers.find(s => s.email === email);

        if (subscriber) {
            this.update('newsletter_subscribers', subscriber.id, {
                status: 'unsubscribed',
                unsubscribed_at: new Date().toISOString()
            });
            return { success: true, message: 'Successfully unsubscribed' };
        }

        return { success: false, message: 'Email not found in our subscriber list' };
    }

    // Donation Management
    processDonation(donationData) {
        try {
            const required = ['name', 'email', 'amount', 'donationType'];
            for (let field of required) {
                if (!donationData[field]) {
                    throw new Error(`${field} is required`);
                }
            }

            if (donationData.amount <= 0) {
                throw new Error('Donation amount must be greater than 0');
            }

            const donation = this.create('donations', {
                ...donationData,
                status: 'completed', // In real app, this would be 'pending' until payment processed
                transaction_id: this.generateTransactionId(),
                payment_method: donationData.paymentMethod || 'online',
                currency: 'USD',
                anonymous: donationData.anonymous || false,
                tax_deductible: true,
                receipt_sent: false
            });

            // Update statistics
            this.updateStatistics('donations_total', parseFloat(donationData.amount));

            // Send receipt
            this.sendEmail('donation_receipt', donation.email, {
                name: donation.name,
                amount: donation.amount,
                transaction_id: donation.transaction_id
            });

            return {
                success: true,
                message: 'Donation processed successfully',
                data: donation
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    getDonations(period = null) {
        let donations = this.getAll('donations');
        
        if (period) {
            const now = new Date();
            const periodStart = new Date();
            
            switch (period) {
                case 'today':
                    periodStart.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    periodStart.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    periodStart.setMonth(now.getMonth() - 1);
                    break;
                case 'year':
                    periodStart.setFullYear(now.getFullYear() - 1);
                    break;
            }
            
            donations = donations.filter(d => new Date(d.created_at) >= periodStart);
        }
        
        return donations;
    }

    // Project Management
    createProject(projectData) {
        const project = this.create('projects', {
            ...projectData,
            status: projectData.status || 'planning',
            goal_amount: projectData.goal_amount || 0,
            raised_amount: 0,
            progress_percentage: 0,
            start_date: projectData.start_date || new Date().toISOString(),
            volunteers_needed: projectData.volunteers_needed || 0,
            volunteers_registered: 0
        });

        return {
            success: true,
            message: 'Project created successfully',
            data: project
        };
    }

    updateProjectProgress(projectId, updates) {
        try {
            const project = this.getById('projects', projectId);
            if (!project) {
                throw new Error('Project not found');
            }

            const updatedProject = this.update('projects', projectId, updates);

            // Recalculate progress percentage if goal and raised amounts are provided
            if (updates.raised_amount !== undefined || updates.goal_amount !== undefined) {
                const progressPercentage = (updatedProject.raised_amount / updatedProject.goal_amount) * 100;
                this.update('projects', projectId, { progress_percentage: Math.min(progressPercentage, 100) });
            }

            return {
                success: true,
                message: 'Project updated successfully',
                data: updatedProject
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    getProjects(status = null) {
        return this.getAll('projects', status ? p => p.status === status : null);
    }

    // Event Management
    createEvent(eventData) {
        const event = this.create('events', {
            ...eventData,
            status: 'upcoming',
            attendees: [],
            max_attendees: eventData.max_attendees || 100,
            registration_count: 0
        });

        return {
            success: true,
            message: 'Event created successfully',
            data: event
        };
    }

    registerForEvent(eventId, attendeeData) {
        try {
            const event = this.getById('events', eventId);
            if (!event) {
                throw new Error('Event not found');
            }

            if (event.registration_count >= event.max_attendees) {
                throw new Error('Event is fully booked');
            }

            const attendee = {
                id: this.generateId(),
                ...attendeeData,
                registered_at: new Date().toISOString()
            };

            event.attendees.push(attendee);
            event.registration_count = event.attendees.length;

            this.update('events', eventId, {
                attendees: event.attendees,
                registration_count: event.registration_count
            });

            // Send confirmation email
            this.sendEmail('event_registration', attendee.email, {
                name: attendee.name,
                event_title: event.title,
                event_date: event.date
            });

            return {
                success: true,
                message: 'Successfully registered for the event',
                data: attendee
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Blog Management
    createBlogPost(postData) {
        const post = this.create('blog_posts', {
            ...postData,
            status: postData.status || 'draft',
            published_at: postData.status === 'published' ? new Date().toISOString() : null,
            views: 0,
            likes: 0,
            comments: []
        });

        return {
            success: true,
            message: 'Blog post created successfully',
            data: post
        };
    }

    getBlogPosts(category = null, status = 'published') {
        return this.getAll('blog_posts', post => {
            const statusMatch = status ? post.status === status : true;
            const categoryMatch = category ? post.category === category : true;
            return statusMatch && categoryMatch;
        });
    }

    // Statistics Management
    getStatistics() {
        return JSON.parse(localStorage.getItem('statistics') || '{}');
    }

    updateStatistics(key, increment = 1) {
        const stats = this.getStatistics();
        stats[key] = (stats[key] || 0) + increment;
        localStorage.setItem('statistics', JSON.stringify(stats));
        return stats;
    }

    getDashboardData() {
        const stats = this.getStatistics();
        const recentDonations = this.getDonations('month');
        const recentVolunteers = this.getVolunteers().slice(-10);
        const activeProjects = this.getProjects('active');
        const pendingContacts = this.getContacts('new');

        return {
            statistics: stats,
            recent_donations: recentDonations,
            recent_volunteers: recentVolunteers,
            active_projects: activeProjects,
            pending_contacts: pendingContacts,
            total_donations_this_month: recentDonations.reduce((sum, d) => sum + parseFloat(d.amount), 0)
        };
    }

    // Email Simulation System
    sendEmail(template, recipient, data = {}) {
        const emailTemplates = {
            volunteer_welcome: {
                subject: 'Welcome to Jivan-Jyoti Foundation!',
                content: `Dear ${data.name}, thank you for volunteering with us!`
            },
            contact_auto_reply: {
                subject: 'We received your message',
                content: `Dear ${data.name}, we have received your message (Ticket #${data.ticket_id}). We'll respond within 24 hours.`
            },
            newsletter_welcome: {
                subject: 'Welcome to our Newsletter!',
                content: 'Thank you for subscribing to our newsletter. You\'ll receive weekly updates about our environmental initiatives.'
            },
            donation_receipt: {
                subject: 'Donation Receipt',
                content: `Dear ${data.name}, thank you for your donation of $${data.amount}. Transaction ID: ${data.transaction_id}`
            },
            event_registration: {
                subject: 'Event Registration Confirmation',
                content: `Dear ${data.name}, you're registered for ${data.event_title} on ${data.event_date}.`
            }
        };

        const template_data = emailTemplates[template];
        if (template_data) {
            // Simulate email sending with a delay
            setTimeout(() => {
                console.log(`Email sent to ${recipient}:`);
                console.log(`Subject: ${template_data.subject}`);
                console.log(`Content: ${template_data.content}`);
                
                // Store sent email record
                const sentEmails = JSON.parse(localStorage.getItem('sent_emails') || '[]');
                sentEmails.push({
                    id: this.generateId(),
                    template,
                    recipient,
                    subject: template_data.subject,
                    content: template_data.content,
                    sent_at: new Date().toISOString(),
                    data
                });
                localStorage.setItem('sent_emails', JSON.stringify(sentEmails));
            }, 1000);
        }
    }

    // Utility Methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generateTransactionId() {
        return 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8).toUpperCase();
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    getClientIP() {
        // In a real application, this would get the actual client IP
        return '192.168.1.' + Math.floor(Math.random() * 255);
    }

    // Search functionality
    search(collection, query, fields = []) {
        const items = this.getAll(collection);
        const lowercaseQuery = query.toLowerCase();
        
        return items.filter(item => {
            if (fields.length === 0) {
                // Search all string fields
                return Object.values(item).some(value => 
                    typeof value === 'string' && value.toLowerCase().includes(lowercaseQuery)
                );
            } else {
                // Search specific fields
                return fields.some(field => 
                    item[field] && typeof item[field] === 'string' && 
                    item[field].toLowerCase().includes(lowercaseQuery)
                );
            }
        });
    }

    // Data export/import for backup
    exportData() {
        const collections = [
            'volunteers', 'contacts', 'donations', 'newsletter_subscribers',
            'projects', 'news', 'events', 'gallery_images', 'testimonials',
            'users', 'blog_posts', 'resources', 'statistics'
        ];

        const data = {};
        collections.forEach(collection => {
            data[collection] = JSON.parse(localStorage.getItem(collection) || '[]');
        });

        return {
            data,
            exported_at: new Date().toISOString(),
            version: this.version
        };
    }

    importData(exportedData) {
        try {
            Object.keys(exportedData.data).forEach(collection => {
                localStorage.setItem(collection, JSON.stringify(exportedData.data[collection]));
            });
            return { success: true, message: 'Data imported successfully' };
        } catch (error) {
            return { success: false, message: 'Import failed: ' + error.message };
        }
    }

    // Load initial demo data
    loadInitialData() {
        // Load demo projects if none exist
        const projects = this.getAll('projects');
        if (projects.length === 0) {
            this.loadDemoProjects();
        }

        // Load demo events if none exist
        const events = this.getAll('events');
        if (events.length === 0) {
            this.loadDemoEvents();
        }

        // Load demo blog posts if none exist
        const blogPosts = this.getAll('blog_posts');
        if (blogPosts.length === 0) {
            this.loadDemoBlogPosts();
        }
    }

    loadDemoProjects() {
        const demoProjects = [
            {
                title: "Reforestation Drive 2024",
                description: "Plant 10,000 trees across degraded forest areas",
                status: "active",
                goal_amount: 50000,
                raised_amount: 32000,
                location: "Amazon Rainforest",
                start_date: "2024-01-01",
                end_date: "2024-12-31",
                image_url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            },
            {
                title: "Clean Water Initiative",
                description: "Provide clean drinking water to rural communities",
                status: "active",
                goal_amount: 30000,
                raised_amount: 18000,
                location: "Rural Villages",
                start_date: "2024-02-01",
                end_date: "2024-11-30",
                image_url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            }
        ];

        demoProjects.forEach(project => this.createProject(project));
    }

    loadDemoEvents() {
        const demoEvents = [
            {
                title: "Annual Environment Day Celebration",
                description: "Join us for a day of environmental awareness and tree planting",
                date: "2024-06-05",
                time: "09:00 AM",
                location: "Central Park",
                max_attendees: 200,
                event_type: "awareness"
            },
            {
                title: "Beach Cleanup Drive",
                description: "Help us clean our beautiful beaches",
                date: "2024-07-15",
                time: "07:00 AM",
                location: "Marina Beach",
                max_attendees: 150,
                event_type: "cleanup"
            }
        ];

        demoEvents.forEach(event => this.createEvent(event));
    }

    loadDemoBlogPosts() {
        const demoPosts = [
            {
                title: "10 Simple Ways to Reduce Your Carbon Footprint",
                content: "Discover practical steps you can take today to help the environment...",
                excerpt: "Learn simple daily changes that make a big environmental impact",
                category: "tips",
                author: "Environmental Team",
                featured_image: "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                status: "published"
            },
            {
                title: "The Importance of Biodiversity Conservation",
                content: "Understanding why biodiversity matters for our planet's future...",
                excerpt: "Explore the critical role of biodiversity in maintaining healthy ecosystems",
                category: "education",
                author: "Research Team",
                featured_image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                status: "published"
            }
        ];

        demoPosts.forEach(post => this.createBlogPost(post));
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Form submission handling
        document.addEventListener('submit', (e) => {
            const form = e.target;
            
            switch (form.id) {
                case 'volunteerForm':
                    e.preventDefault();
                    this.handleVolunteerForm(form);
                    break;
                case 'contactForm':
                    e.preventDefault();
                    this.handleContactForm(form);
                    break;
                case 'donationForm':
                    e.preventDefault();
                    this.handleDonationForm(form);
                    break;
                case 'newsletterForm':
                    e.preventDefault();
                    this.handleNewsletterForm(form);
                    break;
            }
        });
    }

    // Form Handlers
    handleVolunteerForm(form) {
        const formData = new FormData(form);
        const volunteerData = Object.fromEntries(formData.entries());
        
        // Handle multiple values for interests
        volunteerData.interests = formData.getAll('interests');
        
        const result = this.registerVolunteer(volunteerData);
        this.showFormResult(result, 'volunteerMessage');
        
        if (result.success) {
            form.reset();
        }
    }

    handleContactForm(form) {
        const formData = new FormData(form);
        const contactData = Object.fromEntries(formData.entries());
        
        const result = this.submitContactForm(contactData);
        this.showFormResult(result, 'contactMessage');
        
        if (result.success) {
            form.reset();
        }
    }

    handleDonationForm(form) {
        const formData = new FormData(form);
        const donationData = Object.fromEntries(formData.entries());
        
        const result = this.processDonation(donationData);
        this.showFormResult(result, 'donationMessage');
        
        if (result.success) {
            form.reset();
        }
    }

    handleNewsletterForm(form) {
        const formData = new FormData(form);
        const email = formData.get('email');
        
        const result = this.subscribeToNewsletter(email);
        this.showFormResult(result, 'newsletterMessage');
        
        if (result.success) {
            form.reset();
        }
    }

    showFormResult(result, messageElementId) {
        const messageElement = document.getElementById(messageElementId);
        if (messageElement) {
            messageElement.textContent = result.message;
            messageElement.className = result.success 
                ? 'text-green-600 font-semibold mt-4' 
                : 'text-red-600 font-semibold mt-4';
            messageElement.classList.remove('hidden');
            
            // Hide message after 5 seconds
            setTimeout(() => {
                messageElement.classList.add('hidden');
            }, 5000);
        } else {
            // Fallback: show alert
            alert(result.message);
        }
    }
}

// Initialize the backend system
const foundationBackend = new FoundationBackend();

// Make it globally available
window.FoundationBackend = FoundationBackend;
window.backend = foundationBackend;

// Export functions for direct use
window.registerVolunteer = (data) => foundationBackend.registerVolunteer(data);
window.submitContact = (data) => foundationBackend.submitContactForm(data);
window.processDonation = (data) => foundationBackend.processDonation(data);
window.subscribeNewsletter = (email) => foundationBackend.subscribeToNewsletter(email);
window.getStatistics = () => foundationBackend.getStatistics();
window.getDashboardData = () => foundationBackend.getDashboardData();