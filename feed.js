
let currentUser = JSON.parse(localStorage.getItem("bondlyUser"));
if (!currentUser) {
    alert("Please login first");
    window.location.href = "login.html";
}
// Sample posts data (in real app, this would come from a database)
let posts = [];

// DOM Elements
const postContent = document.getElementById('postContent');
const postBtn = document.getElementById('postBtn');
const postsContainer = document.getElementById('postsContainer');
const profileBtn = document.getElementById('profileBtn');
const logoutBtn = document.getElementById('logoutBtn');
const charCount = document.getElementById('charCount');
const popup = document.getElementById('popup');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    displayPosts();
});

// Character counter for textarea
postContent.addEventListener('input', () => {
    const count = postContent.value.length;
    charCount.textContent = `${count}/500`;
    
    if (count > 500) {
        charCount.style.color = '#f5576c';
    } else {
        charCount.style.color = '#666';
    }
});

// Create post
postBtn.addEventListener('click', () => {
    const content = postContent.value.trim();
    
    if (!content) {
        showPopup('Please write something before posting!', 'error');
        return;
    }
    
    if (content.length > 500) {
        showPopup('Post is too long! Maximum 500 characters.', 'error');
        return;
    }
    
    const post = {
        id: Date.now(),
        content: content,
        author: 'Current User', // In real app, get from logged-in user
        timestamp: new Date().toISOString(),
        likes: 0
    };
    
    posts.unshift(post);
    savePosts();
    displayPosts();
    postContent.value = '';
    charCount.textContent = '0/500';
    showPopup('Post created successfully!', 'success');
});

function displayPosts() {
    if (posts.length === 0) {
        postsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <div class="empty-state-text">No posts yet. Be the first to share something!</div>
            </div>
        `;
        return;
    }
    
    postsContainer.innerHTML = posts.map(post => `
        <div class="post" data-id="${post.id}">
            <div class="post-header">
                <span class="post-author">👤 ${post.author}</span>
                <span class="post-time">${formatTime(post.timestamp)}</span>
            </div>
            <div class="post-content">${escapeHtml(post.content)}</div>
            <div class="post-actions-bar">
                <button class="post-action-btn like-btn" onclick="likePost(${post.id})">
                    ❤️ <span>${post.likes || 0}</span>
                </button>
                <button class="post-action-btn delete" onclick="deletePost(${post.id})">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Like post
function likePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.likes = (post.likes || 0) + 1;
        savePosts();
        displayPosts();
        showPopup('Post liked!', 'success');
    }
}

function deletePost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
        posts = posts.filter(p => p.id !== postId);
        savePosts();
        displayPosts();
        showPopup('Post deleted successfully!', 'success');
    }
}

// Format timestamp
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show popup notification
function showPopup(message, type = 'success') {
    popup.textContent = message;
    popup.className = `popup show ${type}`;
    
    setTimeout(() => {
        popup.classList.remove('show');
    }, 3000);
}

// Save posts to localStorage
function savePosts() {
    localStorage.setItem('bondly_posts', JSON.stringify(posts));
}

// Load posts from localStorage
function loadPosts() {
    const savedPosts = localStorage.getItem('bondly_posts');
    if (savedPosts) {
        posts = JSON.parse(savedPosts);
    }
}

// Profile button
profileBtn.addEventListener('click', () => {
    showPopup('Profile page coming soon!', 'success');
    // In real app: window.location.href = 'profile.html';
});

// Logout button
logoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        showPopup('Logging out...', 'success');
        setTimeout(() => {
            // In real app: clear session and redirect to login
            // window.location.href = 'login.html';
            alert('Logout successful! (In real app, would redirect to login page)');
        }, 1000);
    }
});

// Enter key to post (Ctrl/Cmd + Enter)
postContent.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        postBtn.click();
    }
});
