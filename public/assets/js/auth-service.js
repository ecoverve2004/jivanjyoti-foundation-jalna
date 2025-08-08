// Global Authentication Service
// This file provides authentication utilities across all pages

// Configuration
const USE_FIREBASE_AUTH = true; // Set to false to use PHP backend
const PHP_AUTH_URL = 'auth.php';

// Firebase configuration (if using Firebase)
const firebaseConfig = {
    apiKey: "AIzaSyA8qayeaBlferVs6Rv8nL8OBifj6RNzBAQ",
    authDomain: "jivanjyoti-foundation.firebaseapp.com",
    projectId: "jivanjyoti-foundation",
    storageBucket: "jivanjyoti-foundation.firebasestorage.app",
    messagingSenderId: "238727951447",
    appId: "1:238727951447:web:106137d41bafd2a7c15f12",
    measurementId: "G-4Q37KC6SD0"
};

// Global authentication state
window.AuthService = {
    currentUser: null,
    isLoggedIn: false,
    
    // Initialize authentication service
    async init() {
        if (USE_FIREBASE_AUTH) {
            // Import Firebase dynamically
            const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
            const { getAuth, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
            
            this.app = initializeApp(firebaseConfig);
            this.auth = getAuth(this.app);
            
            // Listen for auth state changes
            onAuthStateChanged(this.auth, (user) => {
                this.currentUser = user;
                this.isLoggedIn = !!user;
                this.updateUIElements();
                this.updateLocalStorage();
            });
        } else {
            // For PHP backend, check localStorage
            const userId = localStorage.getItem('currentUserId');
            const userEmail = localStorage.getItem('currentUserEmail');
            
            if (userId && userEmail) {
                this.currentUser = { uid: userId, email: userEmail };
                this.isLoggedIn = true;
            }
            this.updateUIElements();
        }
    },
    
    // Update localStorage based on current user
    updateLocalStorage() {
        if (this.currentUser) {
            localStorage.setItem('currentUserId', this.currentUser.uid);
            localStorage.setItem('currentUserEmail', this.currentUser.email);
        } else {
            localStorage.removeItem('currentUserId');
            localStorage.removeItem('currentUserEmail');
        }
    },
    
    // Update UI elements across all pages
    updateUIElements() {
        // Update navigation login links
        this.updateNavigation();
        
        // Update any user-specific content areas
        this.updateUserContent();
        
        // Show/hide login-required content
        this.updateProtectedContent();
    },
    
    // Update navigation based on login status
    updateNavigation() {
        // Only update login links, don't interfere with other navigation
        const loginLinks = document.querySelectorAll('a[href="login.html"]:not(.mobile-nav-link)');
        const mobileLoginLinks = document.querySelectorAll('a[href="login.html"].mobile-nav-link');
        
        // Update desktop navigation
        loginLinks.forEach(link => {
            if (this.isLoggedIn) {
                const parent = link.parentElement;
                if (parent && !parent.querySelector('.user-menu')) {
                    this.createUserMenu(parent, link);
                }
            } else {
                // Restore original login link if user menu exists
                const existingMenu = link.parentElement?.querySelector('.user-menu');
                if (existingMenu && link.style.display === 'none') {
                    link.style.display = '';
                    existingMenu.remove();
                }
            }
        });
        
        // Update mobile navigation
        mobileLoginLinks.forEach(link => {
            if (this.isLoggedIn) {
                link.innerHTML = `<i class="fas fa-user mr-2"></i>${this.currentUser.email.split('@')[0]}`;
                link.href = '#';
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            } else {
                link.innerHTML = `<i class="fas fa-sign-in-alt mr-2"></i>Login`;
                link.href = 'login.html';
            }
        });
    },
    
    // Create user menu in navigation
    createUserMenu(parent, loginLink) {
        // Simple approach: just hide login link and add user info
        loginLink.style.display = 'none';
        
        // Check if user info already exists
        let userInfo = parent.querySelector('.user-info');
        if (!userInfo) {
            userInfo = document.createElement('div');
            userInfo.className = 'user-info';
            userInfo.innerHTML = `
                <button class="hover:text-green-300 transition duration-300 p-2 rounded-md hover:bg-green-700 flex items-center text-sm">
                    <i class="fas fa-user mr-2"></i>
                    <span>${this.currentUser.email.split('@')[0]}</span>
                    <span class="ml-2 text-xs cursor-pointer logout-link" title="Logout">
                        <i class="fas fa-sign-out-alt"></i>
                    </span>
                </button>
            `;
            parent.appendChild(userInfo);
            
            // Add logout functionality
            const logoutLink = userInfo.querySelector('.logout-link');
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.logout();
            });
        }
    },
    
    // Update user-specific content
    updateUserContent() {
        const userElements = document.querySelectorAll('[data-auth-required]');
        const guestElements = document.querySelectorAll('[data-guest-only]');
        
        userElements.forEach(el => {
            if (this.isLoggedIn) {
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });
        
        guestElements.forEach(el => {
            if (this.isLoggedIn) {
                el.style.display = 'none';
            } else {
                el.style.display = '';
            }
        });
    },
    
    // Update protected content
    updateProtectedContent() {
        const protectedForms = document.querySelectorAll('.protected-form');
        
        protectedForms.forEach(form => {
            if (!this.isLoggedIn) {
                const overlay = document.createElement('div');
                overlay.className = 'auth-overlay absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center rounded-lg';
                overlay.innerHTML = `
                    <div class="text-center text-white p-4">
                        <i class="fas fa-lock text-4xl mb-4"></i>
                        <h3 class="text-xl font-bold mb-2">Login Required</h3>
                        <p class="mb-4">Please log in to access this feature.</p>
                        <a href="login.html" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                            Login Now
                        </a>
                    </div>
                `;
                
                // Make form container relative if not already
                const container = form.parentElement;
                if (container && !container.style.position) {
                    container.style.position = 'relative';
                }
                
                container.appendChild(overlay);
            }
        });
    },
    
    // Logout function
    async logout() {
        try {
            if (USE_FIREBASE_AUTH && this.auth) {
                const { signOut } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
                await signOut(this.auth);
            } else {
                // For PHP backend
                this.currentUser = null;
                this.isLoggedIn = false;
                this.updateUIElements();
                this.updateLocalStorage();
            }
            
            // Show success message
            this.showMessage('You have been logged out successfully.', 'success');
            
            // Reload page to reset state
            setTimeout(() => {
                window.location.reload();
            }, 1500);
            
        } catch (error) {
            console.error('Logout error:', error);
            this.showMessage('Error logging out. Please try again.', 'error');
        }
    },
    
    // Show message utility
    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessage = document.querySelector('.auth-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `auth-message fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        messageEl.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'} mr-2"></i>
                <span>${message}</span>
                <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(messageEl);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentElement) {
                messageEl.remove();
            }
        }, 5000);
    },
    
    // Check if user is logged in
    requireAuth() {
        if (!this.isLoggedIn) {
            this.showMessage('Please log in to access this feature.', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return false;
        }
        return true;
    },
    
    // Get current user info
    getCurrentUser() {
        return this.currentUser;
    }
};

// Initialize authentication service when DOM is loaded
// Use a slight delay to ensure other scripts load first
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.AuthService.init();
    }, 100);
});

// Export for use in other scripts
export default window.AuthService;