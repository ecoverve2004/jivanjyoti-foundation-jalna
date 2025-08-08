// Import Firebase functions using CDN (module imports)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Configuration for authentication method
const USE_FIREBASE_AUTH = true; // Set to false to use PHP backend instead
const PHP_AUTH_URL = 'auth.php';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA8qayeaBlferVs6Rv8nL8OBifj6RNzBAQ",
    authDomain: "jivanjyoti-foundation.firebaseapp.com",
    projectId: "jivanjyoti-foundation",
    storageBucket: "jivanjyoti-foundation.firebasestorage.app",
    messagingSenderId: "238727951447",
    appId: "1:238727951447:web:106137d41bafd2a7c15f12",
    measurementId: "G-4Q37KC6SD0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Function to show messages
function showMessage(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = isError ? 'mt-4 text-center text-red-500' : 'mt-4 text-center text-green-500';
        element.classList.remove('hidden');
        
        // Hide message after 5 seconds
        setTimeout(() => {
            element.classList.add('hidden');
        }, 5000);
    }
}

// Function to validate email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Function to update UI based on authentication state
function updateAuthUI(user) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loggedInUserDisplay = document.getElementById('loggedInUserDisplay');
    const showLoginBtn = document.getElementById('showLoginBtn');
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    const userIdDisplay = document.getElementById('userIdDisplay');

    if (user) {
        // User is logged in
        if (loginForm) loginForm.classList.add('hidden');
        if (registerForm) registerForm.classList.add('hidden');
        if (showLoginBtn) showLoginBtn.classList.add('hidden');
        if (showRegisterBtn) showRegisterBtn.classList.add('hidden');
        if (loggedInUserDisplay) loggedInUserDisplay.classList.remove('hidden');
        if (userEmailDisplay) userEmailDisplay.textContent = user.email;
        if (userIdDisplay) userIdDisplay.textContent = user.uid;
        
        // Store user info in localStorage
        localStorage.setItem('currentUserId', user.uid);
        localStorage.setItem('currentUserEmail', user.email);
    } else {
        // User is not logged in
        if (loggedInUserDisplay) loggedInUserDisplay.classList.add('hidden');
        if (showLoginBtn) showLoginBtn.classList.remove('hidden');
        if (showRegisterBtn) showRegisterBtn.classList.remove('hidden');
        
        // Show login form by default
        if (loginForm && registerForm) {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            showLoginBtn.className = 'px-6 py-3 text-lg font-semibold rounded-l-lg bg-green-600 text-white shadow-md transition duration-300';
            showRegisterBtn.className = 'px-6 py-3 text-lg font-semibold rounded-r-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-300';
        }
        
        // Clear localStorage
        localStorage.removeItem('currentUserId');
        localStorage.removeItem('currentUserEmail');
    }
}

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Monitor authentication state
    if (USE_FIREBASE_AUTH) {
        onAuthStateChanged(auth, (user) => {
            updateAuthUI(user);
        });
    } else {
        // For PHP backend, check localStorage
        const storedUserId = localStorage.getItem('currentUserId');
        const storedUserEmail = localStorage.getItem('currentUserEmail');
        
        if (storedUserId && storedUserEmail) {
            const mockUser = {
                uid: storedUserId,
                email: storedUserEmail
            };
            updateAuthUI(mockUser);
        } else {
            updateAuthUI(null);
        }
    }

    // Get form elements
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showLoginBtn = document.getElementById('showLoginBtn');
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Form switching functionality
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', () => {
            if (loginForm) loginForm.classList.remove('hidden');
            if (registerForm) registerForm.classList.add('hidden');
            showLoginBtn.className = 'px-6 py-3 text-lg font-semibold rounded-l-lg bg-green-600 text-white shadow-md transition duration-300';
            if (showRegisterBtn) showRegisterBtn.className = 'px-6 py-3 text-lg font-semibold rounded-r-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-300';
        });
    }

    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', () => {
            if (registerForm) registerForm.classList.remove('hidden');
            if (loginForm) loginForm.classList.add('hidden');
            showRegisterBtn.className = 'px-6 py-3 text-lg font-semibold rounded-r-lg bg-green-600 text-white shadow-md transition duration-300';
            if (showLoginBtn) showLoginBtn.className = 'px-6 py-3 text-lg font-semibold rounded-l-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-300';
        });
    }

    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const emailError = document.getElementById('loginEmailError');
            const passwordError = document.getElementById('loginPasswordError');
            
            // Reset errors
            if (emailError) emailError.classList.add('hidden');
            if (passwordError) passwordError.classList.add('hidden');
            
            // Validate inputs
            let isValid = true;
            
            if (!validateEmail(email)) {
                if (emailError) emailError.classList.remove('hidden');
                isValid = false;
            }
            
            if (password.length === 0) {
                if (passwordError) passwordError.classList.remove('hidden');
                isValid = false;
            }
            
            if (!isValid) return;
            
            try {
                if (USE_FIREBASE_AUTH) {
                    // Firebase Authentication
                    const userCredential = await signInWithEmailAndPassword(auth, email, password);
                    showMessage('loginMessage', 'Login successful! Welcome back.', false);
                    loginForm.reset();
                } else {
                    // PHP Backend Authentication
                    const response = await fetch(PHP_AUTH_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                            action: 'login', 
                            email: email, 
                            password: password 
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        showMessage('loginMessage', data.message, false);
                        loginForm.reset();
                        
                        // Manually update UI for PHP backend
                        const mockUser = {
                            uid: data.userId,
                            email: data.userEmail
                        };
                        updateAuthUI(mockUser);
                    } else {
                        showMessage('loginMessage', data.message, true);
                    }
                }
            } catch (error) {
                console.error('Login error:', error);
                let errorMessage = 'Login failed. Please try again.';
                
                if (USE_FIREBASE_AUTH) {
                    switch (error.code) {
                        case 'auth/user-not-found':
                            errorMessage = 'No account found with this email.';
                            break;
                        case 'auth/wrong-password':
                            errorMessage = 'Incorrect password.';
                            break;
                        case 'auth/invalid-email':
                            errorMessage = 'Invalid email address.';
                            break;
                        case 'auth/too-many-requests':
                            errorMessage = 'Too many login attempts. Please try again later.';
                            break;
                    }
                } else {
                    errorMessage = `Login failed: ${error.message}`;
                }
                
                showMessage('loginMessage', errorMessage, true);
            }
        });
    }

    // Register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const emailError = document.getElementById('registerEmailError');
            const passwordError = document.getElementById('registerPasswordError');
            const confirmError = document.getElementById('confirmPasswordError');
            
            // Reset errors
            if (emailError) emailError.classList.add('hidden');
            if (passwordError) passwordError.classList.add('hidden');
            if (confirmError) confirmError.classList.add('hidden');
            
            // Validate inputs
            let isValid = true;
            
            if (!validateEmail(email)) {
                if (emailError) emailError.classList.remove('hidden');
                isValid = false;
            }
            
            if (password.length < 6) {
                if (passwordError) passwordError.classList.remove('hidden');
                isValid = false;
            }
            
            if (password !== confirmPassword) {
                if (confirmError) confirmError.classList.remove('hidden');
                isValid = false;
            }
            
            if (!isValid) return;
            
            try {
                if (USE_FIREBASE_AUTH) {
                    // Firebase Authentication
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    showMessage('registerMessage', 'Registration successful! Welcome to JivanJyoti Foundation.', false);
                    registerForm.reset();
                } else {
                    // PHP Backend Authentication
                    const response = await fetch(PHP_AUTH_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                            action: 'register', 
                            email: email, 
                            password: password 
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        showMessage('registerMessage', data.message, false);
                        registerForm.reset();
                        
                        // Manually update UI for PHP backend
                        const mockUser = {
                            uid: data.userId,
                            email: data.userEmail
                        };
                        updateAuthUI(mockUser);
                    } else {
                        showMessage('registerMessage', data.message, true);
                    }
                }
            } catch (error) {
                console.error('Registration error:', error);
                let errorMessage = 'Registration failed. Please try again.';
                
                if (USE_FIREBASE_AUTH) {
                    switch (error.code) {
                        case 'auth/email-already-in-use':
                            errorMessage = 'An account with this email already exists.';
                            break;
                        case 'auth/invalid-email':
                            errorMessage = 'Invalid email address.';
                            break;
                        case 'auth/weak-password':
                            errorMessage = 'Password is too weak. Please use at least 6 characters.';
                            break;
                    }
                } else {
                    errorMessage = `Registration failed: ${error.message}`;
                }
                
                showMessage('registerMessage', errorMessage, true);
            }
        });
    }

    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                if (USE_FIREBASE_AUTH) {
                    await signOut(auth);
                    showMessage('loginMessage', 'You have been logged out successfully.', false);
                } else {
                    // For PHP backend, just clear localStorage and update UI
                    localStorage.removeItem('currentUserId');
                    localStorage.removeItem('currentUserEmail');
                    updateAuthUI(null);
                    showMessage('loginMessage', 'You have been logged out successfully.', false);
                }
            } catch (error) {
                console.error('Logout error:', error);
                showMessage('loginMessage', 'Error logging out. Please try again.', true);
            }
        });
    }
});