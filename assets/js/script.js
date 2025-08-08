// Firebase SDK imports (only for Firestore for contact/project feedback)
// Note: AuthService is loaded separately via script tag
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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

// Initialize Firebase (only for Firestore)
let app;
let db;

// Function to display custom messages instead of alert()
function showMessageBox(type, title, message) {
    const existingMessageBox = document.querySelector('.message-box');
    const existingBackdrop = document.querySelector('.message-backdrop');
    if (existingMessageBox) existingMessageBox.remove();
    if (existingBackdrop) existingBackdrop.remove();

    const backdrop = document.createElement('div');
    backdrop.className = 'message-backdrop';
    document.body.appendChild(backdrop);

    const messageBox = document.createElement('div');
    messageBox.className = `message-box ${type}`;
    messageBox.innerHTML = `
        <h3 class="text-green-800">${title}</h3>
        <p>${message}</p>
        <button class="${type === 'error' ? 'error-btn' : ''}">OK</button>
    `;
    document.body.appendChild(messageBox);

    messageBox.querySelector('button').addEventListener('click', () => {
        messageBox.remove();
        backdrop.remove();
    });
}

// Function to get current user info from AuthService or localStorage
function getCurrentUserInfo() {
    if (window.AuthService && window.AuthService.getCurrentUser) {
        const user = window.AuthService.getCurrentUser();
        return {
            currentUserId: user ? user.uid : null,
            currentUserEmail: user ? user.email : null
        };
    } else {
        // Fallback to localStorage
        return {
            currentUserId: localStorage.getItem('currentUserId') || null,
            currentUserEmail: localStorage.getItem('currentUserEmail') || null
        };
    }
}

// Initialize Firebase (Firestore)
window.onload = async function () {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);

        // Wait for AuthService to initialize
        if (!window.AuthService) {
            console.warn('AuthService not available, authentication features may not work');
        }

    } catch (error) {
        console.error("Error initializing Firebase Firestore:", error);
        showMessageBox('error', 'Firebase Error', `Failed to initialize Firestore: ${error.message}`);
    }

    // --- Form Handling and Event Listeners ---

    // Donation Form (donate.html)
    const donationForm = document.getElementById('donationForm');
    if (donationForm) {
        donationForm.addEventListener('submit', function (event) {
            event.preventDefault();
            let isValid = true;

            const amountInput = document.getElementById('amount');
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');

            const amountError = document.getElementById('amountError');
            const nameError = document.getElementById('nameError');
            const emailError = document.getElementById('emailError');

            // Reset errors
            amountError.classList.add('hidden');
            nameError.classList.add('hidden');
            emailError.classList.add('hidden');

            // Validate amount
            if (parseFloat(amountInput.value) <= 0 || isNaN(parseFloat(amountInput.value))) {
                amountError.classList.remove('hidden');
                isValid = false;
            }

            // Validate name
            if (nameInput.value.trim() === '') {
                nameError.classList.remove('hidden');
                isValid = false;
            }

            // Validate email
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
                emailError.classList.remove('hidden');
                isValid = false;
            }

            if (isValid) {
                // Simulate donation processing (in a real app, this would go to a payment gateway)
                console.log('Donation submitted:', {
                    amount: amountInput.value,
                    name: nameInput.value,
                    email: emailInput.value,
                    anonymous: document.getElementById('anonymous').checked
                });

                document.getElementById('donationSuccessMessage').classList.remove('hidden');
                document.getElementById('donationErrorMessage').classList.add('hidden');
                donationForm.reset();
            } else {
                document.getElementById('donationErrorMessage').classList.remove('hidden');
                document.getElementById('donationSuccessMessage').classList.add('hidden');
            }
        });
    }

    // Contact Form (contact.html)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            let isValid = true;

            const nameInput = document.getElementById('contactName');
            const emailInput = document.getElementById('contactEmail');
            const subjectInput = document.getElementById('contactSubject');
            const messageInput = document.getElementById('contactMessage');

            const nameError = document.getElementById('contactNameError');
            const emailError = document.getElementById('contactEmailError');
            const subjectError = document.getElementById('contactSubjectError');
            const messageError = document.getElementById('contactMessageError');

            // Reset errors
            nameError.classList.add('hidden');
            emailError.classList.add('hidden');
            subjectError.classList.add('hidden');
            messageError.classList.add('hidden');

            // Validate fields
            if (nameInput.value.trim() === '') { nameError.classList.remove('hidden'); isValid = false; }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) { emailError.classList.remove('hidden'); isValid = false; }
            if (subjectInput.value.trim() === '') { subjectError.classList.remove('hidden'); isValid = false; }
            if (messageInput.value.trim() === '') { messageError.classList.remove('hidden'); isValid = false; }

            if (isValid) {
                try {
                    // Get current user info
                    const { currentUserId, currentUserEmail } = getCurrentUserInfo();
                    
                    // Save contact message to Firestore
                    const appId = 'jivanjyoti-foundation';
                    const collectionPath = currentUserId ? `artifacts/${appId}/users/${currentUserId}/contact_messages` : `artifacts/${appId}/public/data/contact_messages`;
                    await addDoc(collection(db, collectionPath), {
                        name: nameInput.value,
                        email: emailInput.value,
                        subject: subjectInput.value,
                        message: messageInput.value,
                        timestamp: serverTimestamp(),
                        userId: currentUserId // Will be null if not logged in
                    });
                    console.log("Contact message sent and saved to Firestore!");
                    document.getElementById('contactSuccessMessage').classList.remove('hidden');
                    document.getElementById('contactErrorMessage').classList.add('hidden');
                    contactForm.reset();
                } catch (error) {
                    console.error("Error sending contact message:", error);
                    document.getElementById('contactErrorMessage').classList.remove('hidden');
                    document.getElementById('contactSuccessMessage').classList.add('hidden');
                    showMessageBox('error', 'Submission Failed', `Error sending message: ${error.message}`);
                }
            }
        });
    }

    // Project Feedback Form (project-detail.html)
    const projectFeedbackForm = document.getElementById('projectFeedbackForm');
    if (projectFeedbackForm) {
        projectFeedbackForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            let isValid = true;

            const ratingInput = document.getElementById('feedbackRating');
            const nameInput = document.getElementById('feedbackName');
            const emailInput = document.getElementById('feedbackEmail');
            const commentInput = document.getElementById('feedbackComment');

            const ratingError = document.getElementById('feedbackRatingError');
            const nameError = document.getElementById('feedbackNameError');
            const emailError = document.getElementById('feedbackEmailError');
            const commentError = document.getElementById('feedbackCommentError');

            // Reset errors
            ratingError.classList.add('hidden');
            nameError.classList.add('hidden');
            emailError.classList.add('hidden');
            commentError.classList.add('hidden');

            // Validate fields
            const rating = parseFloat(ratingInput.value);
            if (isNaN(rating) || rating < 1 || rating > 5) {
                ratingError.classList.remove('hidden');
                isValid = false;
            }
            if (nameInput.value.trim() === '') { nameError.classList.remove('hidden'); isValid = false; }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) { emailError.classList.remove('hidden'); isValid = false; }
            if (commentInput.value.trim() === '') { commentError.classList.remove('hidden'); isValid = false; }

            if (isValid) {
                try {
                    // Get project ID from URL (example for dynamic content)
                    const urlParams = new URLSearchParams(window.location.search);
                    const projectId = urlParams.get('id') || 'unknown-project'; // Fallback if no ID

                    // Get current user info
                    const { currentUserId, currentUserEmail } = getCurrentUserInfo();
                    
                    // Save project feedback to Firestore
                    const appId = 'jivanjyoti-foundation';
                    const collectionPath = currentUserId ? `artifacts/${appId}/users/${currentUserId}/project_feedback` : `artifacts/${appId}/public/data/project_feedback`;
                    await addDoc(collection(db, collectionPath), {
                        projectId: projectId,
                        rating: rating,
                        name: nameInput.value,
                        email: emailInput.value,
                        comment: commentInput.value,
                        timestamp: serverTimestamp(),
                        userId: currentUserId // Will be null if not logged in
                    });
                    console.log("Project feedback sent and saved to Firestore!");
                    document.getElementById('feedbackSuccessMessage').classList.remove('hidden');
                    document.getElementById('feedbackErrorMessage').classList.add('hidden');
                    projectFeedbackForm.reset();
                } catch (error) {
                    console.error("Error sending project feedback:", error);
                    document.getElementById('feedbackErrorMessage').classList.remove('hidden');
                    document.getElementById('feedbackSuccessMessage').classList.add('hidden');
                    showMessageBox('error', 'Submission Failed', `Error sending feedback: ${error.message}`);
                }
            }
        });
    }

    // Note: Login/Register Forms are now handled by login.js on login.html page
    // Note: Mobile Navigation is now handled by navigation.js
};
