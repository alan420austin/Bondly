
// Enhanced Authentication for PBL Season 3 with Department Support

class AuthService {
    static getCurrentUser() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
    }

    static setCurrentUser(user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }

    static logout() {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        window.location.href = 'login.html';
    }

    static async login(email, password) {
        try {
            const user = await LocalDB.findUserByEmail(email);
            
            if (!user) {
                throw new Error('No account found with this email');
            }

            if (user.password !== password) {
                throw new Error('Invalid password');
            }

            // Remove password from user object before storing
            const { password: _, ...userWithoutPassword } = user;
            this.setCurrentUser(userWithoutPassword);
            
            return { success: true, user: userWithoutPassword };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    static async signup(userData) {
        try {
            const { fullName, email, password, department } = userData;

            // Check if user already exists
            const existingUser = await LocalDB.findUserByEmail(email);
            if (existingUser) {
                throw new Error('User already exists with this email');
            }

            // Create new user with department
            const newUser = {
                id: Date.now(),
                fullName,
                email,
                password,
                department,
                avatar: this.generateAvatar(fullName),
                createdAt: new Date().toISOString()
            };

            await LocalDB.saveUser(newUser);

            // Remove password before storing current user
            const { password: _, ...userWithoutPassword } = newUser;
            this.setCurrentUser(userWithoutPassword);

            return { success: true, user: userWithoutPassword };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    static generateAvatar(name) {
        const avatars = ['👨‍💻', '👩‍💻', '👨‍🎓', '👩‍🎓', '👨‍🔬', '👩‍🔬', '👨‍🏫', '👩‍🏫'];
        return avatars[name.length % avatars.length];
    }

    static requireAuth() {
        const user = this.getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return null;
        }
        return user;
    }

    static isAuthenticated() {
        return !!this.getCurrentUser();
    }

    static isAdmin() {
        const user = this.getCurrentUser();
        return user && user.isAdmin;
    }
}

// Theme Management for PBL Season 3
function initializeTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    document.body.className = savedTheme + '-theme';
    updateThemeButton(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.body.classList.remove(currentTheme + '-theme');
    document.body.classList.add(newTheme + '-theme');
    
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.textContent = theme === 'light' ? '🌙' : '☀️';
    }
}

// Enhanced Form Handling for PBL Season 3
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    
    // Add theme toggle event listener
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Enhanced Login form handling
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const messageDiv = document.getElementById('loginMessage');

            const result = await AuthService.login(email, password);
            
            if (result.success) {
                showMessage('Login successful! Redirecting...', 'success', messageDiv);
                setTimeout(() => {
                    window.location.href = 'feed.html';
                }, 1000);
            } else {
                showMessage(result.error, 'error', messageDiv);
            }
        });
    }

    // Enhanced Signup form handling with Department
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        // Add department dropdown if it doesn't exist
        if (!document.getElementById('department')) {
            const passwordGroup = document.querySelector('.form-group:has(#password)');
            if (passwordGroup) {
                const departmentHtml = `
                    <div class="form-group">
                        <label for="department">Department</label>
                        <select id="department" required>
                            <option value="">Select Your Department</option>
                            ${DEPARTMENTS.map(dept => `<option value="${dept}">${dept}</option>`).join('')}
                        </select>
                    </div>
                `;
                passwordGroup.insertAdjacentHTML('beforebegin', departmentHtml);
            }
        }

        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const fullName = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const department = document.getElementById('department').value;
            const password = document.getElementById('password').value;
            const messageDiv = document.getElementById('signupMessage');

            if (!department) {
                showMessage('Please select your department', 'error', messageDiv);
                return;
            }

            const result = await AuthService.signup({
                fullName,
                email,
                password,
                department
            });
            
            if (result.success) {
                showMessage('Account created successfully! Welcome to Bondly 🎓', 'success', messageDiv);
                setTimeout(() => {
                    window.location.href = 'feed.html';
                }, 1500);
            } else {
                showMessage(result.error, 'error', messageDiv);
            }
        });
    }

    // Update UI with current user info for authenticated pages
    const user = AuthService.getCurrentUser();
    if (user) {
        const userDepartmentElement = document.getElementById('userDepartment');
        if (userDepartmentElement) {
            userDepartmentElement.textContent = user.department;
            userDepartmentElement.style.display = 'inline-block';
        }

        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = user.fullName;
        }
    }

    // Add logout button listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                AuthService.logout();
            }
        });
    }

    // Redirect authenticated users away from auth pages
    if ((window.location.pathname.includes('login.html') || 
         window.location.pathname.includes('signup.html')) &&
        AuthService.isAuthenticated()) {
        window.location.href = 'feed.html';
    }
});

// Utility function to show messages
function showMessage(message, type, element) {
    if (element) {
        element.textContent = message;
        element.className = `message ${type}`;
    } else {
        // Create popup for other pages
        const popup = document.createElement('div');
        popup.className = `popup show ${type}`;
        popup.textContent = message;
        document.body.appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 3000);
    }
}