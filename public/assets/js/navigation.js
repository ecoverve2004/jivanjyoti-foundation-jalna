// Dedicated Navigation Script for JivanJyoti Foundation
// This handles mobile and desktop navigation functionality

console.log('Navigation script loaded');

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing navigation...');
    initializeNavigation();
});

function initializeNavigation() {
    // Mobile Navigation Elements
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    console.log('Navigation elements:', {
        hamburgerBtn: !!hamburgerBtn,
        mobileMenu: !!mobileMenu,
        mobileMenuOverlay: !!mobileMenuOverlay,
        mobileNavLinks: mobileNavLinks.length
    });

    // Hamburger button click event
    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Hamburger clicked');
            toggleMobileMenu();
        });
    } else {
        console.warn('Hamburger button or mobile menu not found');
    }

    // Mobile menu overlay click event
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', function() {
            console.log('Overlay clicked - closing menu');
            closeMobileMenu();
        });
    }

    // Mobile navigation links click events
    mobileNavLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            console.log('Mobile nav link clicked');
            closeMobileMenu();
        });
    });

    // Close mobile menu on window resize (when switching to desktop)
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768) { // md breakpoint in Tailwind
            closeMobileMenu();
        }
    });

    // ESC key to close mobile menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (!mobileMenu) {
        console.error('Mobile menu element not found');
        return;
    }

    console.log('Toggling menu. Current classes:', mobileMenu.classList.toString());

    if (mobileMenu.classList.contains('mobile-menu-hidden')) {
        openMobileMenu();
    } else {
        closeMobileMenu();
    }
}

function openMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

    console.log('Opening mobile menu');

    if (mobileMenu) {
        mobileMenu.classList.remove('mobile-menu-hidden');
        mobileMenu.classList.add('mobile-menu-visible');
    }

    if (hamburgerBtn) {
        hamburgerBtn.classList.add('hamburger-active');
    }

    if (mobileMenuOverlay) {
        mobileMenuOverlay.classList.remove('hidden');
    }

    // Prevent body scrolling when menu is open
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

    console.log('Closing mobile menu');

    if (mobileMenu) {
        mobileMenu.classList.remove('mobile-menu-visible');
        mobileMenu.classList.add('mobile-menu-hidden');
    }

    if (hamburgerBtn) {
        hamburgerBtn.classList.remove('hamburger-active');
    }

    if (mobileMenuOverlay) {
        mobileMenuOverlay.classList.add('hidden');
    }

    // Re-enable body scrolling
    document.body.style.overflow = '';
}

// Export functions for global access
window.NavigationUtils = {
    toggleMobileMenu,
    openMobileMenu,
    closeMobileMenu,
    initializeNavigation
};