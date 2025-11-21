// Notices System for PBL Season 3 with Department Filtering

class NoticeService {
    static async getNotices(departmentFilter = 'all', searchTerm = '') {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) return [];

        let notices = await LocalDB.getNotices();
        
        // Filter by department
        if (departmentFilter === 'my') {
            notices = notices.filter(notice => 
                notice.department === 'all' || notice.department === currentUser.department
            );
        } else if (departmentFilter !== 'all') {
            notices = notices.filter(notice => 
                notice.department === 'all' || notice.department === departmentFilter
            );
        }
        
        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            notices = notices.filter(notice => 
                notice.title.toLowerCase().includes(term) || 
                notice.content.toLowerCase().includes(term) ||
                notice.author.toLowerCase().includes(term)
            );
        }
        
        return notices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    static async createNotice(noticeData) {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) throw new Error('User not authenticated');

        // Check if user is admin
        if (!this.isUserAdmin(currentUser)) {
            throw new Error('Only admin users can create notices');
        }

        const notice = {
            id: Date.now(),
            ...noticeData,
            author: currentUser.fullName,
            authorId: currentUser.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await LocalDB.saveNotice(notice);
        return notice;
    }

    static async deleteNotice(noticeId) {
        const currentUser = AuthService.getCurrentUser();
        if (!this.isUserAdmin(currentUser)) {
            throw new Error('Only admin users can delete notices');
        }

        const notices = await LocalDB.getNotices();
        const filteredNotices = notices.filter(notice => notice.id !== noticeId);
        localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(filteredNotices));
        return true;
    }

    static isUserAdmin(user) {
        return user && (user.isAdmin || user.email.includes('admin'));
    }

    static getDepartmentColor(department) {
        const colors = {
            'CSE': '#4361ee',
            'EEE': '#3a0ca3',
            'Civil': '#f72585',
            'Mechanical': '#4cc9f0',
            'English': '#f8961e',
            'BBA': '#4895ef',
            'all': '#666'
        };
        return colors[department] || '#666';
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    if (!document.getElementById('noticesContainer')) return;

    const currentUser = AuthService.requireAuth();
    if (!currentUser) return;

    // Initialize notices
    await initializeNotices();

    // Event listeners
    const departmentFilter = document.getElementById('departmentFilter');
    if (departmentFilter) {
        departmentFilter.addEventListener('change', loadNotices);
    }
    
    const searchNotices = document.getElementById('searchNotices');
    if (searchNotices) {
        searchNotices.addEventListener('input', handleSearch);
    }
    
    const noticeForm = document.getElementById('noticeForm');
    if (noticeForm) {
        noticeForm.addEventListener('submit', handleNoticeSubmit);
    }

    // Check admin status and show/hide admin form
    checkAdminStatus(currentUser);

    // Load initial notices
    await loadNotices();
});

async function initializeNotices() {
    // Set up search debouncing
    let searchTimeout;
    const searchInput = document.getElementById('searchNotices');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                loadNotices();
            }, 300);
        });
    }
}

function handleSearch() {
    loadNotices();
}

function checkAdminStatus(currentUser) {
    const adminForm = document.getElementById('adminNoticeForm');
    if (adminForm) {
        if (NoticeService.isUserAdmin(currentUser)) {
            adminForm.style.display = 'block';
        } else {
            adminForm.style.display = 'none';
        }
    }
}

async function loadNotices() {
    const departmentFilterElement = document.getElementById('departmentFilter');
    const departmentFilter = departmentFilterElement ? departmentFilterElement.value : 'all';
    const searchInput = document.getElementById('searchNotices');
    const searchTerm = searchInput ? searchInput.value : '';
    const noticesContainer = document.getElementById('noticesContainer');
    
    if (!noticesContainer) return;

    try {
        const notices = await NoticeService.getNotices(departmentFilter, searchTerm);
        displayNotices(notices);
    } catch (error) {
        console.error('Error loading notices:', error);
        noticesContainer.innerHTML = '<div class="loading">Error loading notices</div>';
    }
}

function displayNotices(notices) {
    const noticesContainer = document.getElementById('noticesContainer');
    if (!noticesContainer) return;

    if (notices.length === 0) {
        noticesContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <div class="empty-state-text">No notices found</div>
                <p style="color: var(--text-muted); margin-top: 10px;">
                    ${document.getElementById('searchNotices')?.value ? 
                        'Try different search terms' : 
                        'Check back later for new announcements'}
                </p>
            </div>
        `;
        return;
    }

    noticesContainer.innerHTML = notices.map(notice => {
        const departmentColor = NoticeService.getDepartmentColor(notice.department);
        const isHighPriority = notice.priority === 'high';
        
        return `
            <div class="notice-card" data-id="${notice.id}">
                <div class="notice-header">
                    <div style="flex: 1;">
                        <div class="notice-title">
                            ${isHighPriority ? '🚨 ' : ''}${escapeHtml(notice.title)}
                        </div>
                        <div class="notice-date">
                            📅 ${formatDate(notice.createdAt)} • 👤 By ${notice.author}
                        </div>
                    </div>
                    <div class="notice-department" style="background: ${departmentColor}">
                        ${notice.department === 'all' ? 'All Departments' : notice.department}
                    </div>
                </div>
                
                <div class="notice-content">
                    ${escapeHtml(notice.content)}
                </div>
                
                ${isHighPriority ? `
                    <div style="display: flex; align-items: center; gap: 8px; margin-top: 1rem; padding: 10px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                        <span style="font-size: 1.2em;">⚠️</span>
                        <span style="font-weight: 600; color: #856404;">Important Notice</span>
                    </div>
                ` : ''}
                
                ${NoticeService.isUserAdmin(AuthService.getCurrentUser()) ? `
                    <div style="margin-top: 1rem; text-align: right;">
                        <button onclick="deleteNotice(${notice.id})" class="btn-danger">
                            🗑️ Delete Notice
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

async function handleNoticeSubmit(event) {
    event.preventDefault();
    
    const title = document.getElementById('noticeTitle').value.trim();
    const content = document.getElementById('noticeContent').value.trim();
    const department = document.getElementById('noticeDepartment').value;
    const priority = document.getElementById('noticePriority')?.value || 'medium';
    
    if (!title || !content) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    if (title.length < 5) {
        showMessage('Notice title should be at least 5 characters long', 'error');
        return;
    }

    try {
        await NoticeService.createNotice({
            title,
            content,
            department,
            priority
        });
        
        // Reset form
        document.getElementById('noticeForm').reset();
        
        showMessage('Notice published successfully!', 'success');
        await loadNotices();
        
    } catch (error) {
        showMessage('Error creating notice: ' + error.message, 'error');
    }
}

async function deleteNotice(noticeId) {
    if (!confirm('Are you sure you want to delete this notice? This action cannot be undone.')) return;
    
    try {
        await NoticeService.deleteNotice(noticeId);
        await loadNotices();
        showMessage('Notice deleted successfully', 'success');
    } catch (error) {
        showMessage('Error deleting notice: ' + error.message, 'error');
    }
}

// Export notices function for AI assistant
function getDepartmentNotices(department) {
    return NoticeService.getNotices(department);
}

// Utility functions
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `popup show ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '100px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '1000';
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}