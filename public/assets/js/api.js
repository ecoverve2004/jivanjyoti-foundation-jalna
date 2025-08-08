// JavaScript API Interface - Simulates Backend REST API
class APIClient {
    constructor() {
        this.baseURL = '/api/v1';
        this.timeout = 5000;
        this.retryAttempts = 3;
        this.init();
    }

    init() {
        // Simulate network delay for realistic experience
        this.simulateNetworkDelay = true;
        this.defaultDelay = 500; // 500ms default delay
    }

    // Simulate HTTP requests with localStorage as database
    async request(method, endpoint, data = null, options = {}) {
        const requestId = this.generateRequestId();
        const startTime = Date.now();

        try {
            // Simulate network delay
            if (this.simulateNetworkDelay) {
                await this.delay(options.delay || this.defaultDelay);
            }

            // Route the request
            const response = await this.routeRequest(method, endpoint, data, options);
            
            // Log request for debugging
            this.logRequest(requestId, method, endpoint, data, response, Date.now() - startTime);
            
            return response;
        } catch (error) {
            this.logError(requestId, method, endpoint, error);
            throw error;
        }
    }

    // HTTP Method shortcuts
    async get(endpoint, options = {}) {
        return this.request('GET', endpoint, null, options);
    }

    async post(endpoint, data, options = {}) {
        return this.request('POST', endpoint, data, options);
    }

    async put(endpoint, data, options = {}) {
        return this.request('PUT', endpoint, data, options);
    }

    async delete(endpoint, options = {}) {
        return this.request('DELETE', endpoint, null, options);
    }

    // Request routing
    async routeRequest(method, endpoint, data, options) {
        const [collection, id, action] = endpoint.split('/').filter(Boolean);

        switch (collection) {
            case 'auth':
                return this.handleAuth(method, id, data);
            case 'volunteers':
                return this.handleVolunteers(method, id, data, action);
            case 'contacts':
                return this.handleContacts(method, id, data);
            case 'donations':
                return this.handleDonations(method, id, data);
            case 'newsletter':
                return this.handleNewsletter(method, id, data);
            case 'projects':
                return this.handleProjects(method, id, data);
            case 'events':
                return this.handleEvents(method, id, data);
            case 'blog':
                return this.handleBlog(method, id, data);
            case 'gallery':
                return this.handleGallery(method, id, data);
            case 'statistics':
                return this.handleStatistics(method, id, data);
            case 'settings':
                return this.handleSettings(method, id, data);
            default:
                throw new Error(`Unknown endpoint: ${endpoint}`);
        }
    }

    // Authentication endpoints
    async handleAuth(method, action, data) {
        switch (method) {
            case 'POST':
                if (action === 'login') {
                    return this.authenticateUser(data);
                } else if (action === 'register') {
                    return this.registerUser(data);
                } else if (action === 'logout') {
                    return this.logoutUser();
                } else if (action === 'forgot-password') {
                    return this.forgotPassword(data);
                }
                break;
            case 'GET':
                if (action === 'me') {
                    return this.getCurrentUser();
                }
                break;
        }
        throw new Error('Invalid auth endpoint');
    }

    // Volunteer endpoints
    async handleVolunteers(method, id, data, action) {
        switch (method) {
            case 'GET':
                if (id) {
                    return { data: dataManager.read('volunteers', id) };
                } else {
                    const volunteers = dataManager.read('volunteers');
                    return { 
                        data: volunteers,
                        total: volunteers.length,
                        page: 1,
                        per_page: volunteers.length
                    };
                }
            case 'POST':
                const result = backend.registerVolunteer(data);
                if (result.success) {
                    return { data: result.data, message: result.message };
                } else {
                    throw new Error(result.message);
                }
            case 'PUT':
                if (id && action === 'status') {
                    const updated = dataManager.update('volunteers', id, { status: data.status });
                    return { data: updated };
                }
                break;
            case 'DELETE':
                if (id) {
                    dataManager.delete('volunteers', id);
                    return { message: 'Volunteer deleted successfully' };
                }
                break;
        }
        throw new Error('Invalid volunteer endpoint');
    }

    // Contact endpoints
    async handleContacts(method, id, data) {
        switch (method) {
            case 'GET':
                if (id) {
                    return { data: dataManager.read('contacts', id) };
                } else {
                    const contacts = dataManager.read('contacts');
                    return { 
                        data: contacts,
                        total: contacts.length
                    };
                }
            case 'POST':
                const result = backend.submitContactForm(data);
                if (result.success) {
                    return { data: result.data, message: result.message };
                } else {
                    throw new Error(result.message);
                }
            case 'PUT':
                if (id) {
                    const updated = dataManager.update('contacts', id, data);
                    return { data: updated };
                }
                break;
            case 'DELETE':
                if (id) {
                    dataManager.delete('contacts', id);
                    return { message: 'Contact deleted successfully' };
                }
                break;
        }
        throw new Error('Invalid contact endpoint');
    }

    // Donation endpoints
    async handleDonations(method, id, data) {
        switch (method) {
            case 'GET':
                if (id) {
                    return { data: dataManager.read('donations', id) };
                } else {
                    const donations = dataManager.read('donations');
                    const totalAmount = donations.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
                    return { 
                        data: donations,
                        total: donations.length,
                        total_amount: totalAmount
                    };
                }
            case 'POST':
                const result = backend.processDonation(data);
                if (result.success) {
                    return { data: result.data, message: result.message };
                } else {
                    throw new Error(result.message);
                }
        }
        throw new Error('Invalid donation endpoint');
    }

    // Newsletter endpoints
    async handleNewsletter(method, action, data) {
        switch (method) {
            case 'POST':
                if (action === 'subscribe') {
                    const result = backend.subscribeToNewsletter(data.email, data.preferences);
                    if (result.success) {
                        return { data: result.data, message: result.message };
                    } else {
                        throw new Error(result.message);
                    }
                } else if (action === 'unsubscribe') {
                    const result = backend.unsubscribeFromNewsletter(data.email);
                    if (result.success) {
                        return { message: result.message };
                    } else {
                        throw new Error(result.message);
                    }
                }
                break;
            case 'GET':
                const subscribers = dataManager.filter('newsletter_subscribers', s => s.status === 'active');
                return { 
                    data: subscribers,
                    total: subscribers.length
                };
        }
        throw new Error('Invalid newsletter endpoint');
    }

    // Project endpoints
    async handleProjects(method, id, data) {
        switch (method) {
            case 'GET':
                if (id) {
                    return { data: dataManager.read('projects', id) };
                } else {
                    const projects = dataManager.read('projects');
                    return { 
                        data: projects,
                        total: projects.length
                    };
                }
            case 'POST':
                const project = dataManager.create('projects', {
                    ...data,
                    status: data.status || 'planning',
                    raised_amount: 0,
                    progress_percentage: 0
                });
                return { data: project, message: 'Project created successfully' };
            case 'PUT':
                if (id) {
                    const updated = dataManager.update('projects', id, data);
                    // Recalculate progress if needed
                    if (data.raised_amount !== undefined || data.goal_amount !== undefined) {
                        const progress = (updated.raised_amount / updated.goal_amount) * 100;
                        dataManager.update('projects', id, { progress_percentage: Math.min(progress, 100) });
                    }
                    return { data: updated };
                }
                break;
            case 'DELETE':
                if (id) {
                    dataManager.delete('projects', id);
                    return { message: 'Project deleted successfully' };
                }
                break;
        }
        throw new Error('Invalid project endpoint');
    }

    // Event endpoints
    async handleEvents(method, id, data) {
        switch (method) {
            case 'GET':
                if (id) {
                    return { data: dataManager.read('events', id) };
                } else {
                    const events = dataManager.read('events');
                    return { 
                        data: events,
                        total: events.length
                    };
                }
            case 'POST':
                if (id && data.action === 'register') {
                    // Register for event
                    const event = dataManager.read('events', id);
                    if (!event) throw new Error('Event not found');
                    
                    if (event.attendees.length >= event.max_attendees) {
                        throw new Error('Event is fully booked');
                    }
                    
                    const attendee = {
                        id: dataManager.generateId(),
                        ...data.attendee,
                        registered_at: new Date().toISOString()
                    };
                    
                    event.attendees.push(attendee);
                    event.registration_count = event.attendees.length;
                    
                    const updated = dataManager.update('events', id, {
                        attendees: event.attendees,
                        registration_count: event.registration_count
                    });
                    
                    return { data: attendee, message: 'Successfully registered for event' };
                } else {
                    // Create new event
                    const event = dataManager.create('events', {
                        ...data,
                        status: 'upcoming',
                        attendees: [],
                        registration_count: 0
                    });
                    return { data: event, message: 'Event created successfully' };
                }
            case 'PUT':
                if (id) {
                    const updated = dataManager.update('events', id, data);
                    return { data: updated };
                }
                break;
            case 'DELETE':
                if (id) {
                    dataManager.delete('events', id);
                    return { message: 'Event deleted successfully' };
                }
                break;
        }
        throw new Error('Invalid event endpoint');
    }

    // Blog endpoints
    async handleBlog(method, id, data) {
        switch (method) {
            case 'GET':
                if (id) {
                    const post = dataManager.read('blog_posts', id);
                    if (post) {
                        // Increment view count
                        dataManager.update('blog_posts', id, { views: (post.views || 0) + 1 });
                    }
                    return { data: post };
                } else {
                    const posts = dataManager.filter('blog_posts', p => p.status === 'published');
                    return { 
                        data: posts,
                        total: posts.length
                    };
                }
            case 'POST':
                const post = dataManager.create('blog_posts', {
                    ...data,
                    status: data.status || 'draft',
                    views: 0,
                    likes: 0,
                    comments: []
                });
                return { data: post, message: 'Blog post created successfully' };
            case 'PUT':
                if (id) {
                    const updated = dataManager.update('blog_posts', id, data);
                    return { data: updated };
                }
                break;
            case 'DELETE':
                if (id) {
                    dataManager.delete('blog_posts', id);
                    return { message: 'Blog post deleted successfully' };
                }
                break;
        }
        throw new Error('Invalid blog endpoint');
    }

    // Gallery endpoints
    async handleGallery(method, id, data) {
        switch (method) {
            case 'GET':
                if (id) {
                    return { data: dataManager.read('gallery_images', id) };
                } else {
                    const images = dataManager.read('gallery_images');
                    return { 
                        data: images,
                        total: images.length
                    };
                }
            case 'POST':
                const image = dataManager.create('gallery_images', data);
                return { data: image, message: 'Image uploaded successfully' };
            case 'PUT':
                if (id) {
                    const updated = dataManager.update('gallery_images', id, data);
                    return { data: updated };
                }
                break;
            case 'DELETE':
                if (id) {
                    dataManager.delete('gallery_images', id);
                    return { message: 'Image deleted successfully' };
                }
                break;
        }
        throw new Error('Invalid gallery endpoint');
    }

    // Statistics endpoints
    async handleStatistics(method, id, data) {
        switch (method) {
            case 'GET':
                const stats = dataManager.getStatistics();
                const analytics = dataManager.getAnalytics();
                return { 
                    data: {
                        ...stats,
                        analytics
                    }
                };
            case 'PUT':
                if (id) {
                    const updated = dataManager.updateStatistic(id, data.value, data.operation);
                    return { data: updated };
                }
                break;
        }
        throw new Error('Invalid statistics endpoint');
    }

    // Settings endpoints
    async handleSettings(method, id, data) {
        switch (method) {
            case 'GET':
                const settings = dataManager.getCollection('site_settings');
                return { data: settings };
            case 'PUT':
                const updated = dataManager.setCollection('site_settings', { ...dataManager.getCollection('site_settings'), ...data });
                return { data: updated, message: 'Settings updated successfully' };
        }
        throw new Error('Invalid settings endpoint');
    }

    // Authentication helpers
    async authenticateUser(credentials) {
        try {
            const user = auth.loginUser(credentials.email, credentials.password);
            return {
                data: {
                    user: this.sanitizeUser(user),
                    token: this.generateToken(user)
                },
                message: 'Login successful'
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async registerUser(userData) {
        try {
            const user = auth.registerUser(userData);
            return {
                data: {
                    user: this.sanitizeUser(user),
                    token: this.generateToken(user)
                },
                message: 'Registration successful'
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async logoutUser() {
        auth.logout();
        return { message: 'Logout successful' };
    }

    async forgotPassword(data) {
        try {
            auth.requestPasswordReset(data.email);
            return { message: 'Password reset link sent to your email' };
        } catch (error) {
            throw new Error(error.message);
        }
    }

    getCurrentUser() {
        const user = auth.getCurrentUser();
        if (user) {
            return { data: this.sanitizeUser(user) };
        } else {
            throw new Error('Not authenticated');
        }
    }

    // Utility methods
    sanitizeUser(user) {
        const { password, resetToken, ...sanitized } = user;
        return sanitized;
    }

    generateToken(user) {
        // In a real app, this would be a JWT token
        return btoa(JSON.stringify({
            userId: user.id,
            email: user.email,
            timestamp: Date.now()
        }));
    }

    generateRequestId() {
        return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    logRequest(id, method, endpoint, data, response, duration) {
        if (window.DEBUG_API) {
            console.log(`[API] ${id} ${method} ${endpoint}`, {
                request: data,
                response,
                duration: `${duration}ms`
            });
        }
    }

    logError(id, method, endpoint, error) {
        console.error(`[API Error] ${id} ${method} ${endpoint}`, error);
    }

    // Batch operations
    async batch(requests) {
        const results = [];
        for (const request of requests) {
            try {
                const result = await this.request(request.method, request.endpoint, request.data, request.options);
                results.push({ success: true, data: result });
            } catch (error) {
                results.push({ success: false, error: error.message });
            }
        }
        return { data: results };
    }

    // File upload simulation
    async uploadFile(file, options = {}) {
        // Simulate file upload
        await this.delay(1000 + Math.random() * 2000); // 1-3 second upload time
        
        const fileName = file.name || 'upload_' + Date.now();
        const fileUrl = `https://example.com/uploads/${fileName}`;
        
        return {
            data: {
                filename: fileName,
                url: fileUrl,
                size: file.size || 0,
                type: file.type || 'application/octet-stream',
                uploaded_at: new Date().toISOString()
            }
        };
    }

    // Search across collections
    async search(query, collections = [], options = {}) {
        const results = {};
        
        const searchCollections = collections.length > 0 ? collections : 
            ['volunteers', 'contacts', 'donations', 'projects', 'events', 'blog_posts'];
        
        for (const collection of searchCollections) {
            const items = dataManager.search(collection, query, options.fields);
            if (items.length > 0) {
                results[collection] = items.slice(0, options.limit || 10);
            }
        }
        
        return { data: results, query };
    }
}

// Initialize API client
const api = new APIClient();

// Make it globally available
window.APIClient = APIClient;
window.api = api;

// Enable debug mode in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.DEBUG_API = true;
}

// Export common API methods for easy access
window.apiGet = (endpoint, options) => api.get(endpoint, options);
window.apiPost = (endpoint, data, options) => api.post(endpoint, data, options);
window.apiPut = (endpoint, data, options) => api.put(endpoint, data, options);
window.apiDelete = (endpoint, options) => api.delete(endpoint, options);