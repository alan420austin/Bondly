// Configuration for PBL Season 3 - Department System
const DB_CONFIG = {
    baseURL: 'http://localhost:3001',
    endpoints: {
        users: '/users',
        posts: '/posts',
        chats: '/chats',
        notices: '/notices'
    }
};

// Department list for PBL Season 3
const DEPARTMENTS = [
    'CSE', 'EEE', 'Civil', 'Mechanical', 'English', 'BBA'
];

// Local Storage keys
const STORAGE_KEYS = {
    USERS: 'pbl_users',
    POSTS: 'pbl_posts',
    CHATS: 'pbl_chats',
    NOTICES: 'pbl_notices',
    CURRENT_USER: 'pbl_current_user',
    THEME: 'pbl_theme'
};

// API functions for local database
class LocalDB {
    // Users
    static async getUsers() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    }

    static async saveUser(user) {
        const users = await this.getUsers();
        users.push(user);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        return user;
    }

    static async findUserByEmail(email) {
        const users = await this.getUsers();
        return users.find(u => u.email === email);
    }

    static async getUserById(id) {
        const users = await this.getUsers();
        return users.find(u => u.id === id);
    }

    // Posts
    static async getPosts() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
    }

    static async savePost(post) {
        const posts = await this.getPosts();
        posts.unshift(post);
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
        return post;
    }

    // Chats
    static async getChats() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS) || '[]');
    }

    static async saveChat(chat) {
        const chats = await this.getChats();
        chats.push(chat);
        localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
        return chat;
    }

    // Notices
    static async getNotices() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTICES) || '[]');
    }

    static async saveNotice(notice) {
        const notices = await this.getNotices();
        notices.unshift(notice);
        localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
        return notice;
    }

    // Initialize sample data for PBL Season 3
    static async initializeSampleData() {
        const existingUsers = await this.getUsers();
        if (existingUsers.length === 0) {
            // Create sample users for different departments
            const sampleUsers = [
                {
                    id: 1,
                    fullName: 'John Smith',
                    email: 'john@university.edu',
                    password: 'password123',
                    department: 'CSE',
                    avatar: '👨‍💻',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    fullName: 'Sarah Johnson',
                    email: 'sarah@university.edu',
                    password: 'password123',
                    department: 'EEE',
                    avatar: '👩‍🔬',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 3,
                    fullName: 'Mike Chen',
                    email: 'mike@university.edu',
                    password: 'password123',
                    department: 'Civil',
                    avatar: '👨‍🔧',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 4,
                    fullName: 'Emily Davis',
                    email: 'emily@university.edu',
                    password: 'password123',
                    department: 'Mechanical',
                    avatar: '👩‍🏭',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 5,
                    fullName: 'Admin User',
                    email: 'admin@university.edu',
                    password: 'admin123',
                    department: 'CSE',
                    avatar: '👨‍💼',
                    isAdmin: true,
                    createdAt: new Date().toISOString()
                }
            ];

            for (const user of sampleUsers) {
                await this.saveUser(user);
            }

            // Create sample notices
            const sampleNotices = [
                {
                    id: 1,
                    title: 'Welcome to PBL Season 3 - University Social Platform',
                    content: 'Welcome all students to our new university social platform! Connect with your department, share resources, and collaborate with fellow students.',
                    department: 'all',
                    author: 'University Administration',
                    priority: 'high',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    title: 'CSE Department - Lab Schedule Update',
                    content: 'Computer lab schedules for CSE students have been updated for this semester. Please check the department notice board for your lab timings and room allocations.',
                    department: 'CSE',
                    author: 'CSE Department Head',
                    priority: 'medium',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 3,
                    title: 'EEE Workshop on Renewable Energy Systems',
                    content: 'There will be a workshop on renewable energy systems next Friday at 3 PM in the main auditorium. All EEE students are encouraged to attend.',
                    department: 'EEE',
                    author: 'EEE Department',
                    priority: 'medium',
                    createdAt: new Date().toISOString()
                }
            ];

            for (const notice of sampleNotices) {
                await this.saveNotice(notice);
            }

            console.log('PBL Season 3 sample data initialized');
        }
    }
}

// Initialize sample data when the app starts
document.addEventListener('DOMContentLoaded', () => {
    LocalDB.initializeSampleData();
});