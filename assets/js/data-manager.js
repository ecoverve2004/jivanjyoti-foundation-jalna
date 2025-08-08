// Data Management System for Local Storage
class DataManager {
    constructor() {
        this.storagePrefix = 'jivanjyoti_';
        this.init();
    }

    init() {
        this.initializeCollections();
        this.loadSampleData();
    }

    // Initialize all data collections
    initializeCollections() {
        const collections = {
            users: [],
            volunteers: [],
            contacts: [],
            donations: [],
            newsletter_subscribers: [],
            projects: [],
            events: [],
            blog_posts: [],
            gallery_images: [],
            testimonials: [],
            statistics: {
                trees_planted: 50000,
                people_reached: 100000,
                projects_completed: 150,
                volunteers: 5000,
                donations_total: 250000,
                newsletter_subscribers: 12000,
                years_active: 15
            },
            site_settings: {
                site_name: 'Jivan-Jyoti Foundation',
                contact_email: 'contact@jivanjyoti.org',
                contact_phone: '+1-555-0123',
                address: '123 Green Street, Eco City, EC 12345',
                social_media: {
                    facebook: 'https://facebook.com/jivanjyoti',
                    twitter: 'https://twitter.com/jivanjyoti',
                    instagram: 'https://instagram.com/jivanjyoti',
                    linkedin: 'https://linkedin.com/company/jivanjyoti'
                }
            }
        };

        Object.keys(collections).forEach(key => {
            if (!this.getCollection(key)) {
                this.setCollection(key, collections[key]);
            }
        });
    }

    // Collection management
    getCollection(name) {
        const data = localStorage.getItem(this.storagePrefix + name);
        return data ? JSON.parse(data) : null;
    }

    setCollection(name, data) {
        localStorage.setItem(this.storagePrefix + name, JSON.stringify(data));
        return data;
    }

    // Generic CRUD operations
    create(collection, item) {
        const items = this.getCollection(collection) || [];
        const newItem = {
            id: this.generateId(),
            ...item,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        items.push(newItem);
        this.setCollection(collection, items);
        return newItem;
    }

    read(collection, id = null) {
        const items = this.getCollection(collection) || [];
        return id ? items.find(item => item.id === id) : items;
    }

    update(collection, id, updates) {
        const items = this.getCollection(collection) || [];
        const index = items.findIndex(item => item.id === id);
        
        if (index !== -1) {
            items[index] = {
                ...items[index],
                ...updates,
                updated_at: new Date().toISOString()
            };
            this.setCollection(collection, items);
            return items[index];
        }
        return null;
    }

    delete(collection, id) {
        const items = this.getCollection(collection) || [];
        const filteredItems = items.filter(item => item.id !== id);
        this.setCollection(collection, filteredItems);
        return filteredItems.length < items.length;
    }

    // Search functionality
    search(collection, query, fields = []) {
        const items = this.getCollection(collection) || [];
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

    // Filter functionality
    filter(collection, filterFn) {
        const items = this.getCollection(collection) || [];
        return items.filter(filterFn);
    }

    // Sort functionality
    sort(collection, sortField, direction = 'asc') {
        const items = this.getCollection(collection) || [];
        return items.sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];
            
            if (direction === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    }

    // Pagination
    paginate(collection, page = 1, perPage = 10, sortField = 'created_at', direction = 'desc') {
        const items = this.sort(collection, sortField, direction);
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        
        return {
            data: items.slice(startIndex, endIndex),
            pagination: {
                currentPage: page,
                perPage: perPage,
                total: items.length,
                totalPages: Math.ceil(items.length / perPage),
                hasNext: endIndex < items.length,
                hasPrev: page > 1
            }
        };
    }

    // Statistics management
    getStatistics() {
        return this.getCollection('statistics') || {};
    }

    updateStatistic(key, value, operation = 'set') {
        const stats = this.getStatistics();
        
        switch (operation) {
            case 'increment':
                stats[key] = (stats[key] || 0) + value;
                break;
            case 'decrement':
                stats[key] = (stats[key] || 0) - value;
                break;
            case 'set':
            default:
                stats[key] = value;
                break;
        }
        
        this.setCollection('statistics', stats);
        return stats;
    }

    // Data export/import
    exportData() {
        const data = {};
        const collections = [
            'users', 'volunteers', 'contacts', 'donations', 'newsletter_subscribers',
            'projects', 'events', 'blog_posts', 'gallery_images', 'testimonials',
            'statistics', 'site_settings'
        ];

        collections.forEach(collection => {
            data[collection] = this.getCollection(collection);
        });

        return {
            data,
            exported_at: new Date().toISOString(),
            version: '1.0.0'
        };
    }

    importData(exportedData) {
        try {
            Object.keys(exportedData.data).forEach(collection => {
                this.setCollection(collection, exportedData.data[collection]);
            });
            return { success: true, message: 'Data imported successfully' };
        } catch (error) {
            return { success: false, message: 'Import failed: ' + error.message };
        }
    }

    // Backup and restore
    createBackup() {
        const backup = this.exportData();
        const backupKey = `backup_${Date.now()}`;
        localStorage.setItem(this.storagePrefix + backupKey, JSON.stringify(backup));
        return backupKey;
    }

    restoreBackup(backupKey) {
        const backup = localStorage.getItem(this.storagePrefix + backupKey);
        if (backup) {
            return this.importData(JSON.parse(backup));
        }
        return { success: false, message: 'Backup not found' };
    }

    listBackups() {
        const backups = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.storagePrefix + 'backup_')) {
                const timestamp = key.replace(this.storagePrefix + 'backup_', '');
                backups.push({
                    key: key.replace(this.storagePrefix, ''),
                    timestamp: new Date(parseInt(timestamp)).toISOString(),
                    size: localStorage.getItem(key).length
                });
            }
        }
        return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePhone(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    sanitizeHtml(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }

    // Load sample data for demonstration
    loadSampleData() {
        // Load sample projects
        const projects = this.getCollection('projects') || [];
        if (projects.length === 0) {
            this.loadSampleProjects();
        }

        // Load sample blog posts
        const blogPosts = this.getCollection('blog_posts') || [];
        if (blogPosts.length === 0) {
            this.loadSampleBlogPosts();
        }

        // Load sample events
        const events = this.getCollection('events') || [];
        if (events.length === 0) {
            this.loadSampleEvents();
        }

        // Load sample testimonials
        const testimonials = this.getCollection('testimonials') || [];
        if (testimonials.length === 0) {
            this.loadSampleTestimonials();
        }

        // Load sample gallery images
        const galleryImages = this.getCollection('gallery_images') || [];
        if (galleryImages.length === 0) {
            this.loadSampleGalleryImages();
        }
    }

    loadSampleProjects() {
        const sampleProjects = [
            {
                title: "Amazon Reforestation Initiative",
                description: "Planting 50,000 trees in the Amazon rainforest to combat deforestation and support biodiversity.",
                status: "active",
                category: "reforestation",
                goal_amount: 100000,
                raised_amount: 67500,
                start_date: "2024-01-15",
                end_date: "2024-12-31",
                location: "Amazon Rainforest, Brazil",
                image_url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                volunteers_needed: 200,
                volunteers_registered: 145
            },
            {
                title: "Clean Water Access Project",
                description: "Building wells and water purification systems in rural communities to provide clean drinking water.",
                status: "active",
                category: "water",
                goal_amount: 75000,
                raised_amount: 42000,
                start_date: "2024-03-01",
                end_date: "2024-10-31",
                location: "Rural India",
                image_url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                volunteers_needed: 100,
                volunteers_registered: 78
            },
            {
                title: "Urban Gardens Network",
                description: "Creating community gardens in urban areas to promote sustainable agriculture and food security.",
                status: "completed",
                category: "agriculture",
                goal_amount: 50000,
                raised_amount: 52000,
                start_date: "2023-06-01",
                end_date: "2023-12-31",
                location: "Various Cities",
                image_url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                volunteers_needed: 150,
                volunteers_registered: 165
            }
        ];

        sampleProjects.forEach(project => {
            this.create('projects', project);
        });
    }

    loadSampleBlogPosts() {
        const samplePosts = [
            {
                title: "10 Simple Ways to Reduce Your Carbon Footprint",
                slug: "reduce-carbon-footprint",
                excerpt: "Discover practical steps you can take today to help fight climate change and protect our environment.",
                content: "Climate change is one of the most pressing challenges of our time, but every individual can make a difference...",
                category: "tips",
                tags: ["environment", "climate", "sustainability", "tips"],
                author: "Environmental Team",
                status: "published",
                featured_image: "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                published_at: "2024-12-01T10:00:00Z",
                views: 1250,
                likes: 89
            },
            {
                title: "The Importance of Biodiversity Conservation",
                slug: "biodiversity-conservation",
                excerpt: "Learn why protecting biodiversity is crucial for our planet's health and human survival.",
                content: "Biodiversity refers to the variety of life on Earth, including the diversity of species, genetic diversity...",
                category: "education",
                tags: ["biodiversity", "conservation", "ecosystem", "wildlife"],
                author: "Research Team",
                status: "published",
                featured_image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                published_at: "2024-11-28T14:30:00Z",
                views: 980,
                likes: 67
            },
            {
                title: "How to Start Composting at Home",
                slug: "home-composting-guide",
                excerpt: "A beginner's guide to turning kitchen scraps into nutrient-rich soil for your garden.",
                content: "Composting is one of the easiest ways to reduce household waste while creating valuable fertilizer...",
                category: "guides",
                tags: ["composting", "gardening", "waste-reduction", "diy"],
                author: "Sustainability Team",
                status: "published",
                featured_image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                published_at: "2024-11-25T09:15:00Z",
                views: 1540,
                likes: 112
            }
        ];

        samplePosts.forEach(post => {
            this.create('blog_posts', post);
        });
    }

    loadSampleEvents() {
        const sampleEvents = [
            {
                title: "World Environment Day Celebration",
                description: "Join us for a day of environmental awareness activities, tree planting, and community engagement.",
                date: "2024-06-05",
                time: "09:00 AM",
                location: "Central Park, New York",
                category: "awareness",
                max_attendees: 500,
                registration_fee: 0,
                image_url: "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                organizer: "Jivan-Jyoti Foundation",
                status: "upcoming",
                attendees: []
            },
            {
                title: "Beach Cleanup Drive",
                description: "Help us clean our beautiful coastlines and protect marine life from plastic pollution.",
                date: "2024-07-20",
                time: "07:00 AM",
                location: "Santa Monica Beach, CA",
                category: "cleanup",
                max_attendees: 200,
                registration_fee: 0,
                image_url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                organizer: "Jivan-Jyoti Foundation",
                status: "upcoming",
                attendees: []
            },
            {
                title: "Sustainable Living Workshop",
                description: "Learn practical tips for reducing waste, conserving energy, and living more sustainably.",
                date: "2024-08-15",
                time: "02:00 PM",
                location: "Community Center, Portland",
                category: "workshop",
                max_attendees: 50,
                registration_fee: 25,
                image_url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                organizer: "Jivan-Jyoti Foundation",
                status: "upcoming",
                attendees: []
            }
        ];

        sampleEvents.forEach(event => {
            this.create('events', event);
        });
    }

    loadSampleTestimonials() {
        const sampleTestimonials = [
            {
                name: "Sarah Johnson",
                role: "Environmental Scientist",
                message: "Jivan-Jyoti Foundation's work in reforestation has been truly inspiring. Their scientific approach and community engagement make a real difference.",
                rating: 5,
                image_url: "https://images.unsplash.com/photo-1494790108755-2616b75b5dc4?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
                project: "Amazon Reforestation Initiative",
                featured: true
            },
            {
                name: "Michael Chen",
                role: "Volunteer Coordinator",
                message: "Being part of the clean water project changed my perspective on environmental activism. The foundation's impact is measurable and meaningful.",
                rating: 5,
                image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
                project: "Clean Water Access Project",
                featured: true
            },
            {
                name: "Emily Rodriguez",
                role: "Community Leader",
                message: "The urban gardens project has transformed our neighborhood. Kids are learning about sustainable agriculture and families have access to fresh food.",
                rating: 5,
                image_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
                project: "Urban Gardens Network",
                featured: false
            }
        ];

        sampleTestimonials.forEach(testimonial => {
            this.create('testimonials', testimonial);
        });
    }

    loadSampleGalleryImages() {
        const sampleImages = [
            {
                title: "Tree Planting in Amazon",
                description: "Volunteers planting native species in the Amazon rainforest",
                url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                category: "reforestation",
                project: "Amazon Reforestation Initiative",
                photographer: "Foundation Team",
                featured: true
            },
            {
                title: "Clean Water Well Installation",
                description: "Installing a new water well in a rural community",
                url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                category: "water",
                project: "Clean Water Access Project",
                photographer: "Foundation Team",
                featured: true
            },
            {
                title: "Urban Garden Harvest",
                description: "Community members harvesting vegetables from urban garden",
                url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                category: "agriculture",
                project: "Urban Gardens Network",
                photographer: "Foundation Team",
                featured: false
            },
            {
                title: "Beach Cleanup Activity",
                description: "Volunteers collecting plastic waste from beach",
                url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                category: "cleanup",
                project: "Beach Cleanup Drive",
                photographer: "Foundation Team",
                featured: false
            },
            {
                title: "Wildlife Conservation",
                description: "Protecting endangered species in their natural habitat",
                url: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                category: "wildlife",
                project: "Wildlife Protection Program",
                photographer: "Foundation Team",
                featured: true
            },
            {
                title: "Solar Panel Installation",
                description: "Installing renewable energy systems in rural areas",
                url: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                category: "energy",
                project: "Renewable Energy Initiative",
                photographer: "Foundation Team",
                featured: false
            }
        ];

        sampleImages.forEach(image => {
            this.create('gallery_images', image);
        });
    }

    // Analytics and reporting
    getAnalytics() {
        return {
            volunteers: {
                total: this.getCollection('volunteers').length,
                active: this.filter('volunteers', v => v.status === 'active').length,
                pending: this.filter('volunteers', v => v.status === 'pending').length
            },
            donations: {
                total: this.getCollection('donations').length,
                totalAmount: this.getCollection('donations').reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0),
                thisMonth: this.filter('donations', d => {
                    const donationDate = new Date(d.created_at);
                    const now = new Date();
                    return donationDate.getMonth() === now.getMonth() && donationDate.getFullYear() === now.getFullYear();
                }).length
            },
            projects: {
                total: this.getCollection('projects').length,
                active: this.filter('projects', p => p.status === 'active').length,
                completed: this.filter('projects', p => p.status === 'completed').length
            },
            newsletter: {
                subscribers: this.filter('newsletter_subscribers', s => s.status === 'active').length,
                unsubscribed: this.filter('newsletter_subscribers', s => s.status === 'unsubscribed').length
            },
            contacts: {
                total: this.getCollection('contacts').length,
                pending: this.filter('contacts', c => c.status === 'new').length,
                resolved: this.filter('contacts', c => c.status === 'resolved').length
            }
        };
    }
}

// Initialize and export
const dataManager = new DataManager();
window.DataManager = DataManager;
window.dataManager = dataManager;