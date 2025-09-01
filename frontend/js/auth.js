// Authentication utilities
class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.setupHeaderScroll();
    }

    checkAuthStatus() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        
        if (token && user) {
            this.showUserDropdown(user);
        } else {
            this.showLoginLink();
        }
    }

    showUserDropdown(user) {
        const loginLink = document.querySelector('nav a[href="login.html"]');
        if (loginLink) {
            const li = loginLink.parentElement;
            li.innerHTML = `
                <div class="user-dropdown">
                    <button class="user-btn" onclick="authManager.toggleDropdown()">
                        <span class="user-icon">👤</span>
                        <span class="user-name">Hi, ${user.firstName}</span>
                        <span class="dropdown-arrow">▼</span>
                    </button>
                    <div class="dropdown-menu" id="userDropdown">
                        <div class="dropdown-header">
                            <span class="user-full-name">${user.firstName} ${user.lastName}</span>
                            <span class="user-email">${user.email}</span>
                        </div>
                        <div class="dropdown-divider"></div>
                        <a href="view-bookings.html" class="dropdown-item">
                            <span class="bookings-icon">📋</span>
                            View My Bookings
                        </a>
                        <div class="dropdown-divider"></div>
                        <a href="#" class="dropdown-item" onclick="authManager.logout()">
                            <span class="logout-icon">🚪</span>
                            Logout
                        </a>
                    </div>
                </div>
            `;
        }
    }

    showLoginLink() {
        const userDropdown = document.querySelector('.user-dropdown');
        if (userDropdown) {
            const li = userDropdown.parentElement;
            li.innerHTML = '<a href="login.html">Login</a>';
        }
    }

    toggleDropdown() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    }

    setupHeaderScroll() {
        window.addEventListener('scroll', function() {
            const header = document.querySelector('header');
            if (header) {
                if (window.scrollY > 100) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            }
        });
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const userDropdown = document.querySelector('.user-dropdown');
    if (userDropdown && !userDropdown.contains(event.target)) {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    }
});

// Initialize auth manager
const authManager = new AuthManager();
