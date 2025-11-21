// AI Academic Assistant for PBL Season 3 with Voice Features

class AIService {
    static async processCommand(command, currentUser) {
        const lowerCommand = command.toLowerCase();
        
        // Greetings
        if (this.isGreeting(lowerCommand)) {
            return `Hello ${currentUser?.fullName || 'there'}! I'm your wife. I can help you with academic queries, reminders, notices, and more. How can I assist you today?`;
        }
        
        // Time queries
        if (this.isTimeQuery(lowerCommand)) {
            const now = new Date();
            return `The current time is ${now.toLocaleTimeString()}. Today is ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
        }
        
        // Date queries
        if (this.isDateQuery(lowerCommand)) {
            return `Today's date is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
        }
        
        // Reminder commands
        if (this.isReminderCommand(lowerCommand)) {
            return this.processReminderCommand(command);
        }
        
        // Notice commands
        if (this.isNoticeCommand(lowerCommand)) {
            return await this.processNoticeCommand(command, currentUser);
        }
        
        // Assignment commands
        if (this.isAssignmentCommand(lowerCommand)) {
            return this.processAssignmentCommand(currentUser);
        }
        
        // Department queries
        if (this.isDepartmentQuery(lowerCommand)) {
            return this.processDepartmentQuery(command, currentUser);
        }
        
        // Help commands
        if (this.isHelpCommand(lowerCommand)) {
            return this.getHelpResponse();
        }

        // Study related queries
        if (this.isStudyQuery(lowerCommand)) {
            return this.processStudyQuery(command);
        }
        
        // Default response
        return "I'm not sure I understand. I can help with:\n• Reminders and schedules\n• Department notices\n• Assignment tracking\n• Study resources\n• Time and date\n• General academic questions\n\nTry saying 'help' for more options!";
    }

    static isGreeting(command) {
        const greetings = ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon'];
        return greetings.some(greet => command.includes(greet));
    }

    static isTimeQuery(command) {
        const timeWords = ['time', 'what time is it', 'current time', 'what is the time'];
        return timeWords.some(word => command.includes(word));
    }

    static isDateQuery(command) {
        const dateWords = ['date', 'what date is it', 'today\'s date', 'what day is it'];
        return dateWords.some(word => command.includes(word));
    }

    static isReminderCommand(command) {
        const reminderWords = ['reminder', 'remind me', 'set reminder', 'schedule', 'alert'];
        return reminderWords.some(word => command.includes(word));
    }

    static isNoticeCommand(command) {
        const noticeWords = ['notices', 'announcements', 'news', 'updates', 'department news'];
        return noticeWords.some(word => command.includes(word));
    }

    static isAssignmentCommand(command) {
        const assignmentWords = ['assignment', 'homework', 'due date', 'deadline', 'project', 'submission'];
        return assignmentWords.some(word => command.includes(word));
    }

    static isDepartmentQuery(command) {
        const departmentWords = ['department', 'cse', 'eee', 'civil', 'mechanical', 'english', 'bba'];
        return departmentWords.some(word => command.includes(word));
    }

    static isStudyQuery(command) {
        const studyWords = ['study', 'resource', 'material', 'book', 'reference', 'learn', 'tutorial'];
        return studyWords.some(word => command.includes(word));
    }

    static isHelpCommand(command) {
        const helpWords = ['help', 'what can you do', 'commands', 'features', 'assistance'];
        return helpWords.some(word => command.includes(word));
    }

    static processReminderCommand(command) {
        const timeMatch = command.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
        const taskMatch = command.match(/(?:for|about)\s+(.+)/i);
        
        if (timeMatch && taskMatch) {
            const time = timeMatch[1];
            const task = taskMatch[1];
            
            // Save reminder to localStorage
            this.saveReminder(task, time);
            
            return `✅ I've set a reminder for you:\n\n"${task}"\n⏰ ${time}\n\nI'll help you remember when the time comes!`;
        } else {
            return `I can help you set reminders! Try saying something like:\n\n• "Set reminder for tomorrow 10am study session"\n• "Remind me about assignment due Friday"\n• "Schedule meeting with group at 3pm"`;
        }
    }

    static async processNoticeCommand(command, currentUser) {
        const departmentMatch = command.match(/(CSE|EEE|Civil|Mechanical|English|BBA)/i);
        const department = departmentMatch ? departmentMatch[1] : currentUser?.department;
        
        // Get notices from the database
        const notices = await LocalDB.getNotices();
        const departmentNotices = notices.filter(notice => 
            notice.department === 'all' || notice.department === department
        ).slice(0, 5);
        
        if (departmentNotices.length === 0) {
            return `📭 No recent notices found for the ${department} department.\n\nCheck back later for updates!`;
        }
        
        let response = `📢 Latest notices from ${department} Department:\n\n`;
        departmentNotices.forEach((notice, index) => {
            const priorityIcon = notice.priority === 'high' ? '🚨 ' : '📌 ';
            response += `${index + 1}. ${priorityIcon}${notice.title}\n   📅 ${formatDate(notice.createdAt)}\n\n`;
        });
        response += `Visit the Notices page for complete details and older announcements.`;
        
        return response;
    }

    static processAssignmentCommand(currentUser) {
        const sampleAssignments = [
            { subject: 'Data Structures', task: 'Binary Tree Implementation', due: '2 days', priority: 'high' },
            { subject: 'Calculus', task: 'Chapter 5 Problems', due: '5 days', priority: 'medium' },
            { subject: 'Database Systems', task: 'ER Diagram Project', due: '1 week', priority: 'medium' }
        ];

        let response = `📚 Your Upcoming Assignments:\n\n`;
        sampleAssignments.forEach((assignment, index) => {
            const priorityIcon = assignment.priority === 'high' ? '🔴 ' : '🟡 ';
            response += `${index + 1}. ${priorityIcon}${assignment.subject}\n   📖 ${assignment.task}\n   ⏳ Due in: ${assignment.due}\n\n`;
        });
        response += `💡 Tip: Start with high-priority assignments and break them into smaller tasks!`;

        return response;
    }

    static processDepartmentQuery(command, currentUser) {
        const dept = currentUser?.department || 'your';
        const departmentInfo = {
            'CSE': 'Computer Science & Engineering - Focus on programming, algorithms, and software development.',
            'EEE': 'Electrical & Electronic Engineering - Focus on circuits, power systems, and electronics.',
            'Civil': 'Civil Engineering - Focus on construction, structures, and infrastructure.',
            'Mechanical': 'Mechanical Engineering - Focus on machines, thermodynamics, and manufacturing.',
            'English': 'English Literature & Language - Focus on literature, linguistics, and communication.',
            'BBA': 'Business Administration - Focus on management, marketing, and business operations.'
        };

        if (command.includes('department')) {
            return `🎓 You are in the ${dept} Department.\n\n${departmentInfo[dept] || 'Connect with your department peers and share resources!'}`;
        }

        return `🏫 Department Information:\n\n${Object.entries(departmentInfo).map(([dept, info]) => `${dept}: ${info}`).join('\n\n')}`;
    }

    static processStudyQuery(command) {
        const studyResources = {
            'programming': '• FreeCodeCamp.org\n• Codecademy\n• LeetCode for practice\n• GeeksforGeeks tutorials',
            'mathematics': '• Khan Academy\n• Paul\'s Online Math Notes\n• Wolfram Alpha\n• MIT OpenCourseWare',
            'engineering': '• Coursera engineering courses\n• edX technical programs\n• YouTube engineering channels\n• University lecture archives',
            'general': '• Coursera online courses\n• edX university programs\n• YouTube educational channels\n• Academic journals and papers'
        };

        if (command.includes('programming') || command.includes('code')) {
            return `💻 Programming Resources:\n\n${studyResources.programming}\n\n💡 Practice daily and work on projects to improve!`;
        } else if (command.includes('math') || command.includes('calculus')) {
            return `📐 Mathematics Resources:\n\n${studyResources.mathematics}\n\n💡 Practice problems regularly and understand concepts deeply!`;
        } else if (command.includes('engineering')) {
            return `⚙️ Engineering Resources:\n\n${studyResources.engineering}\n\n💡 Focus on practical applications and real-world problems!`;
        } else {
            return `📖 Study Resources Available:\n\n${studyResources.general}\n\n🔍 You can ask for specific subjects like programming, mathematics, or engineering!`;
        }
    }

    static getHelpResponse() {
        return `🤖 PBL Season 3 AI Assistant - Available Commands:

🎓 ACADEMIC HELP:
• "What assignments do I have?"
• "Show me study resources for [subject]"
• "What's my department information?"

📢 NOTICES & UPDATES:
• "Show latest notices"
• "Any updates from CSE department?"
• "What's new in my department?"

⏰ REMINDERS & SCHEDULING:
• "Set reminder for [time] [task]"
• "Remind me about [event]"
• "Schedule study session"

📅 GENERAL:
• "What time is it?"
• "What's today's date?"
• "Help" - Show this message

🎤 Voice commands also work! Click the microphone icon.`;
    }

    static saveReminder(task, time) {
        const reminders = JSON.parse(localStorage.getItem('pbl_reminders') || '[]');
        reminders.push({
            id: Date.now(),
            task,
            time,
            completed: false,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('pbl_reminders', JSON.stringify(reminders));
    }
}

// Voice recognition and speech synthesis
class VoiceService {
    constructor() {
        this.recognition = null;
        this.synthesis = null;
        this.isListening = false;
        
        this.initializeVoiceServices();
    }

    initializeVoiceServices() {
        // Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.onVoiceCommand(transcript);
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.addAIMessage('Sorry, I encountered an error with voice recognition. Please try typing instead.', 'ai');
                this.isListening = false;
                this.updateVoiceButton();
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.updateVoiceButton();
            };
        } else {
            console.warn('Speech recognition not supported in this browser');
        }

        // Speech Synthesis
        if ('speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis;
        }
    }

    startListening() {
        if (!this.recognition) {
            this.addAIMessage('Voice recognition is not supported in your browser. Please use Chrome or Edge for voice features.', 'ai');
            return;
        }

        if (this.isListening) {
            this.stopListening();
            return;
        }

        try {
            this.recognition.start();
            this.isListening = true;
            this.updateVoiceButton();
            this.addAIMessage('🎤 Listening... Speak now!', 'ai');
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            this.addAIMessage('Error starting voice recognition. Please check microphone permissions.', 'ai');
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        this.isListening = false;
        this.updateVoiceButton();
    }

    onVoiceCommand(transcript) {
        this.addAIMessage(transcript, 'user');
        this.processAICommand(transcript);
    }

    async processAICommand(command) {
        const currentUser = AuthService.getCurrentUser();
        const response = await AIService.processCommand(command, currentUser);
        this.addAIMessage(response, 'ai');
        this.speakResponse(response);
    }

    speakResponse(text) {
        if (!this.synthesis) return;

        // Clean text for speech (remove emojis and formatting)
        const cleanText = text.replace(/[^\w\s.,!?;:()-]/g, '').replace(/\n/g, '. ');

        // Cancel any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
        };

        this.synthesis.speak(utterance);
    }

    addAIMessage(text, sender) {
        const chatContainer = document.getElementById('aiChat');
        if (!chatContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${sender === 'user' ? 'user-message' : 'ai-response'}`;
        
        // Format response with line breaks
        const formattedText = text.replace(/\n/g, '<br>');
        messageDiv.innerHTML = formattedText;
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    updateVoiceButton() {
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn) {
            if (this.isListening) {
                voiceBtn.innerHTML = '🔴 Stop';
                voiceBtn.style.background = 'var(--danger-color)';
            } else {
                voiceBtn.innerHTML = '🎤 Voice';
                voiceBtn.style.background = '';
            }
        }
    }
}

// Global voice service instance
let voiceService = null;

// AI Assistant UI Management
function openAIAssistant() {
    const modal = document.getElementById('aiModal');
    if (modal) {
        modal.style.display = 'block';
        
        // Initialize voice service if not already
        if (!voiceService) {
            voiceService = new VoiceService();
        }
    }
}

function closeAIAssistant() {
    const modal = document.getElementById('aiModal');
    if (modal) {
        modal.style.display = 'none';
        
        // Stop listening if active
        if (voiceService && voiceService.isListening) {
            voiceService.stopListening();
        }
    }
}

function toggleVoiceRecognition() {
    if (!voiceService) {
        voiceService = new VoiceService();
    }
    voiceService.startListening();
}

function sendAIMessage() {
    const input = document.getElementById('aiInput');
    const text = input.value.trim();
    
    if (!text) return;

    if (!voiceService) {
        voiceService = new VoiceService();
    }

    voiceService.addAIMessage(text, 'user');
    voiceService.processAICommand(text);
    
    input.value = '';
}

// Quick AI commands for buttons
function quickAICommand(type) {
    let command = '';
    
    switch (type) {
        case 'reminder':
            command = 'set reminder for tomorrow 10am study session';
            break;
        case 'notices':
            command = 'show latest notices from my department';
            break;
        case 'assignments':
            command = 'what assignments do I have this week';
            break;
        case 'help':
            command = 'help';
            break;
    }
    
    if (command) {
        openAIAssistant();
        setTimeout(() => {
            if (!voiceService) {
                voiceService = new VoiceService();
            }
            voiceService.addAIMessage(command, 'user');
            voiceService.processAICommand(command);
        }, 500);
    }
}

function readNoticesAloud() {
    if (!voiceService) {
        voiceService = new VoiceService();
    }

    const currentUser = AuthService.getCurrentUser();
    const message = `Reading latest notices from ${currentUser?.department || 'your'} department. Check the notices page for complete details.`;
    
    voiceService.addAIMessage(message, 'ai');
    voiceService.speakResponse(message);
}

// Utility function for date formatting
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Set up AI input enter key
    const aiInput = document.getElementById('aiInput');
    if (aiInput) {
        aiInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendAIMessage();
            }
        });
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('aiModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAIAssistant();
            }
        });
    }

    // Add quick AI command buttons if they exist
    const quickActions = document.querySelector('.ai-quick-actions');
    if (quickActions && !quickActions.hasAttribute('data-initialized')) {
        quickActions.setAttribute('data-initialized', 'true');
        // Buttons will be handled by the onclick attributes in HTML
    }

});
