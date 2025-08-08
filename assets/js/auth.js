// Authentication System - JavaScript Only
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('users') || '[]');
        this.init();
    }

    init() {
        this.checkExistingSession();
        this.initializeEventListeners();
        this.initializeSocialAuth();
    }

    // User Management
    registerUser(userData) {
        // Check if user already exists
        const existingUser = this.users.find(user => user.email === userData.email);
        if (existingUser) {
            throw new Error('User already exists with this email');
        }

        // Create new user
        const newUser = {
            id: this.generateUserId(),
            ...userData,
            createdAt: new Date().toISOString(),
            isActive: true,
            lastLogin: null
        };

        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));
        return newUser;
    }

    loginUser(email, password) {
        const user = this.users.find(u => u.email === email);
        if (!user) {
            throw new Error('User not found');
        }

        if (user.password !== this.hashPassword(password)) {
            throw new Error('Invalid password');
        }

        user.lastLogin = new Date().toISOString();
        this.currentUser = user;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('users', JSON.stringify(this.users));
        
        return user;
    }

    socialLogin(provider, userData) {
        // Check if user exists with this social account
        let user = this.users.find(u => u.socialAccounts && u.socialAccounts[provider] === userData.id);
        
        if (!user) {
            // Check if user exists with same email
            user = this.users.find(u => u.email === userData.email);
            
            if (user) {
                // Link social account to existing user
                user.socialAccounts = user.socialAccounts || {};
                user.socialAccounts[provider] = userData.id;
            } else {
                // Create new user
                user = {
                    id: this.generateUserId(),
                    name: userData.name,
                    email: userData.email,
                    socialAccounts: {
                        [provider]: userData.id
                    },
                    createdAt: new Date().toISOString(),
                    isActive: true,
                    lastLogin: new Date().toISOString()
                };
                this.users.push(user);
            }
        }

        user.lastLogin = new Date().toISOString();
        this.currentUser = user;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('users', JSON.stringify(this.users));
        
        return user;
    }

    logout() {
        this.currentUser = null;
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('rememberedUser');
        this.dispatchEvent('logout');
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Utility Methods
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    hashPassword(password) {
        // Simple hash function for demo (use proper hashing in production)
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePassword(password) {
        return {
            isValid: password.length >= 6,
            strength: this.calculatePasswordStrength(password),
            message: password.length < 6 ? 'Password must be at least 6 characters' : ''
        };
    }

    calculatePasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return Math.min(strength, 5);
    }

    // Session Management
    checkExistingSession() {
        const savedUser = sessionStorage.getItem('currentUser') || localStorage.getItem('rememberedUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.dispatchEvent('login', this.currentUser);
        }
    }

    rememberUser(user) {
        localStorage.setItem('rememberedUser', JSON.stringify(user));
    }

    // Event System
    dispatchEvent(eventName, data = null) {
        const event = new CustomEvent(`auth:${eventName}`, { detail: data });
        document.dispatchEvent(event);
    }

    // Social Authentication Initialization
    initializeSocialAuth() {
        this.initializeGoogle();
        this.initializeFacebook();
        this.initializeTwitter();
        this.initializeLinkedIn();
    }

    initializeGoogle() {
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.initialize({
                client_id: 'your_google_client_id', // Replace with actual client ID
                callback: (response) => this.handleGoogleCallback(response)
            });
        }
    }

    initializeFacebook() {
        window.fbAsyncInit = () => {
            FB.init({
                appId: 'your_facebook_app_id', // Replace with actual app ID
                cookie: true,
                xfbml: true,
                version: 'v18.0'
            });
        };
    }

    initializeTwitter() {
        // Twitter OAuth 2.0 would be implemented here
        // For demo purposes, we'll simulate the response
    }

    initializeLinkedIn() {
        // LinkedIn OAuth would be implemented here
        // For demo purposes, we'll simulate the response
    }

    // Social Login Handlers
    handleGoogleCallback(response) {
        try {
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            const userData = {
                id: payload.sub,
                name: payload.name,
                email: payload.email,
                picture: payload.picture
            };
            
            const user = this.socialLogin('google', userData);
            this.dispatchEvent('socialLogin', { provider: 'google', user });
        } catch (error) {
            this.dispatchEvent('error', { message: 'Google login failed', error });
        }
    }

    handleFacebookLogin() {
        FB.login((response) => {
            if (response.authResponse) {
                FB.api('/me', { fields: 'name,email,picture' }, (userData) => {
                    try {
                        const user = this.socialLogin('facebook', {
                            id: userData.id,
                            name: userData.name,
                            email: userData.email,
                            picture: userData.picture.data.url
                        });
                        this.dispatchEvent('socialLogin', { provider: 'facebook', user });
                    } catch (error) {
                        this.dispatchEvent('error', { message: 'Facebook login failed', error });
                    }
                });
            } else {
                this.dispatchEvent('error', { message: 'Facebook login cancelled' });
            }
        }, { scope: 'email' });
    }

    // Simulated social logins for demo
    simulateSocialLogin(provider) {
        const userData = {
            google: {
                id: 'google_' + Date.now(),
                name: 'John Doe',
                email: 'john.doe@gmail.com'
            },
            facebook: {
                id: 'facebook_' + Date.now(),
                name: 'Jane Smith',
                email: 'jane.smith@facebook.com'
            },
            twitter: {
                id: 'twitter_' + Date.now(),
                name: 'Twitter User',
                email: 'user@twitter.com'
            },
            linkedin: {
                id: 'linkedin_' + Date.now(),
                name: 'LinkedIn Professional',
                email: 'professional@linkedin.com'
            }
        };

        try {
            const user = this.socialLogin(provider, userData[provider]);
            this.dispatchEvent('socialLogin', { provider, user });
        } catch (error) {
            this.dispatchEvent('error', { message: `${provider} login failed`, error });
        }
    }

    // Event Listeners Setup
    initializeEventListeners() {
        // Listen for form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'emailLoginForm') {
                e.preventDefault();
                this.handleEmailLogin(e.target);
            } else if (e.target.id === 'emailRegisterForm') {
                e.preventDefault();
                this.handleEmailRegister(e.target);
            }
        });

        // Listen for social login buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-social-login]')) {
                const provider = e.target.closest('[data-social-login]').dataset.socialLogin;
                this.handleSocialLoginClick(provider);
            }
        });
    }

    handleEmailLogin(form) {
        const formData = new FormData(form);
        const email = formData.get('loginEmail');
        const password = formData.get('loginPassword');
        const rememberMe = formData.get('rememberMe');

        try {
            if (!this.validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }

            const user = this.loginUser(email, password);
            
            if (rememberMe) {
                this.rememberUser(user);
            }

            this.dispatchEvent('login', user);
        } catch (error) {
            this.dispatchEvent('error', { message: error.message });
        }
    }

    handleEmailRegister(form) {
        const formData = new FormData(form);
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const email = formData.get('registerEmail');
        const password = formData.get('registerPassword');
        const confirmPassword = formData.get('confirmPassword');

        try {
            if (!this.validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }

            const passwordValidation = this.validatePassword(password);
            if (!passwordValidation.isValid) {
                throw new Error(passwordValidation.message);
            }

            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            const userData = {
                name: `${firstName} ${lastName}`,
                email: email,
                password: this.hashPassword(password),
                firstName: firstName,
                lastName: lastName
            };

            const user = this.registerUser(userData);
            this.currentUser = user;
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            
            this.dispatchEvent('register', user);
        } catch (error) {
            this.dispatchEvent('error', { message: error.message });
        }
    }

    handleSocialLoginClick(provider) {
        switch (provider) {
            case 'google':
                if (typeof google !== 'undefined' && google.accounts) {
                    google.accounts.id.prompt();
                } else {
                    this.simulateSocialLogin('google');
                }
                break;
            case 'facebook':
                if (typeof FB !== 'undefined') {
                    this.handleFacebookLogin();
                } else {
                    this.simulateSocialLogin('facebook');
                }
                break;
            case 'twitter':
                this.simulateSocialLogin('twitter');
                break;
            case 'linkedin':
                this.simulateSocialLogin('linkedin');
                break;
            default:
                this.dispatchEvent('error', { message: 'Unknown social provider' });
        }
    }

    // Password Reset
    requestPasswordReset(email) {
        const user = this.users.find(u => u.email === email);
        if (!user) {
            throw new Error('No account found with this email address');
        }

        // In a real application, you would send an email
        // For demo purposes, we'll just generate a reset token
        const resetToken = this.generateResetToken();
        user.resetToken = resetToken;
        user.resetTokenExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour
        
        localStorage.setItem('users', JSON.stringify(this.users));
        
        // Simulate email sending
        console.log(`Password reset link: /reset-password?token=${resetToken}`);
        return true;
    }

    generateResetToken() {
        return 'reset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
    }

    // User Profile Management
    updateProfile(userId, updates) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            throw new Error('User not found');
        }

        this.users[userIndex] = { ...this.users[userIndex], ...updates };
        localStorage.setItem('users', JSON.stringify(this.users));

        if (this.currentUser && this.currentUser.id === userId) {
            this.currentUser = this.users[userIndex];
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }

        return this.users[userIndex];
    }

    // Data Export/Import for Demo
    exportUserData() {
        return {
            users: this.users,
            currentUser: this.currentUser
        };
    }

    importUserData(data) {
        this.users = data.users || [];
        localStorage.setItem('users', JSON.stringify(this.users));
        
        if (data.currentUser) {
            this.currentUser = data.currentUser;
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
    }

    // Initialize demo data
    initializeDemoData() {
        if (this.users.length === 0) {
            const demoUsers = [
                {
                    id: 'demo_user_1',
                    name: 'Demo User',
                    email: 'demo@example.com',
                    password: this.hashPassword('demo123'),
                    firstName: 'Demo',
                    lastName: 'User',
                    createdAt: new Date().toISOString(),
                    isActive: true,
                    lastLogin: null
                }
            ];
            
            this.users = demoUsers;
            localStorage.setItem('users', JSON.stringify(this.users));
        }
    }
}

// Initialize authentication system
const auth = new AuthSystem();

// Initialize demo data
auth.initializeDemoData();

// Export for global use
window.AuthSystem = AuthSystem;
window.auth = auth;