// Quiz Application JavaScript - Fixed and Updated Version

// Global variables
let currentUser = null;
let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = []; // Stores answers for the *current* quiz session
let questions = [];
let quizzes = [];
let jwtToken = null;

// API Base URL - Update this to your backend URL
const API_BASE_URL = 'http://localhost:8080';

// NEW: Leaderboard input elements (added here as global constants)
const quizNameInput = document.getElementById('quizNameInput');
const fetchLeaderboardBtn = document.getElementById('fetchLeaderboardBtn');
// Get references to the leaderboard-specific elements
const leaderboardTableBody = document.getElementById('leaderboardTable') ? document.getElementById('leaderboardTable').querySelector('tbody') : null;
const leaderboardQuizNameDisplay = document.getElementById('leaderboardQuizNameDisplay');


// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is already logged in
    const savedToken = localStorage.getItem('jwtToken');
    if (savedToken) {
        jwtToken = savedToken;
        await loadUserProfile(); // Await the profile loading
        if (currentUser) { // Only show logged in state if profile loaded successfully
            showLoggedInState();
            showSection('quiz-list'); // Redirect to quiz list or dashboard after auto-login
            showToast('Welcome back!', 'info');
        } else {
            // Token might be invalid or expired, proceed to logged out state
            logout(); // Clear token and show logged out UI
        }
    } else {
        // No token found, ensure logged out state is displayed
        showLoggedOutState();
        showSection('home');
    }
    
    // Add event listeners (moved after initial state setup)
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Question form
    const questionForm = document.getElementById('questionForm');
    if (questionForm) {
        questionForm.addEventListener('submit', handleAddQuestion);
    }
    
    // Create quiz form
    const createQuizForm = document.getElementById('createQuizForm');
    if (createQuizForm) {
        createQuizForm.addEventListener('submit', handleCreateQuiz);
    }

    // NEW: Leaderboard Fetch Button Event Listener
    if (fetchLeaderboardBtn) { // Check if the button element exists
        fetchLeaderboardBtn.addEventListener('click', () => {
            const quizName = quizNameInput.value.trim(); // Get the quiz name from the input
            if (quizName) {
                fetchQuizLeaderboard(quizName); // Fetch leaderboard for the entered quiz name
            } else {
                showToast('Please enter a quiz name to fetch the leaderboard.', 'warning');
                if (leaderboardTableBody) {
                    leaderboardTableBody.innerHTML = `<tr><td colspan="3" class="text-center">Please enter a quiz name.</td></tr>`;
                }
                if (leaderboardQuizNameDisplay) {
                    leaderboardQuizNameDisplay.textContent = 'N/A'; // Reset display if input is empty
                }
            }
        });
    }
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    
    const emailId = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ emailId, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            jwtToken = data.token;
            localStorage.setItem('jwtToken', jwtToken);
            
            // Load user profile after successful login
            await loadUserProfile();
            showLoggedInState();
            showSection('quiz-list');
            showToast('Login successful!', 'success');
        } else {
            const errorText = await response.text();
            showToast(errorText || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Network error. Please try again.', 'error');
    }
    
    hideLoading();
}

async function handleRegister(e) {
    e.preventDefault();
    
    const userName = document.getElementById('registerUsername').value;
    const emailId = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/registration`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userName, emailId, password })
        });
        
        if (response.ok) {
            showToast('Registration successful! Please login.', 'success');
            showSection('login');
        } else {
            const errorText = await response.text();
            showToast(errorText || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showToast('Network error. Please try again.', 'error');
    }
    
    hideLoading();
}

async function loadUserProfile() {
    if (!jwtToken) {
        currentUser = null; // Ensure currentUser is null if no token
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        
        if (response.ok) {
            currentUser = await response.json();
        } else {
            // Token might be expired or invalid, logout user
            logout();
        }
    } catch (error) {
        console.error('Load profile error:', error);
        logout(); // Force logout on network or other errors during profile load
    }
}

function logout() {
    currentUser = null;
    jwtToken = null;
    localStorage.removeItem('jwtToken');
    showLoggedOutState();
    showSection('home');
    showToast('Logged out successfully', 'info');
}

// UI State Management
function showLoggedInState() {
    const elements = {
        'quiz-link': document.getElementById('quiz-link'),
        'history-link': document.getElementById('history-link'),
        'profile-link': document.getElementById('profile-link'),
        'logout-link': document.getElementById('logout-link'),
        'admin-link': document.getElementById('admin-link'),
        'home-link': document.querySelector('.nav-menu a[onclick*="showSection(\'home\')"]') // Get home link to hide if logged in
    };
    
    // Hide login/register buttons on home if they are displayed
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) authButtons.style.display = 'none';

    // Hide home link if logged in
    if (elements['home-link']) elements['home-link'].style.display = 'none';

    // Show user elements
    if (elements['quiz-link']) elements['quiz-link'].style.display = 'block';
    if (elements['history-link']) elements['history-link'].style.display = 'block';
    if (elements['profile-link']) elements['profile-link'].style.display = 'block';
    if (elements['logout-link']) elements['logout-link'].style.display = 'block';
    
    // Show admin link only for admin users
    if (currentUser && currentUser.roles && currentUser.roles.includes('ADMIN')) {
        if (elements['admin-link']) elements['admin-link'].style.display = 'block';
    } else {
        if (elements['admin-link']) elements['admin-link'].style.display = 'none'; // Hide if not admin
    }
}

function showLoggedOutState() {
    const elementsToHide = ['quiz-link', 'history-link', 'admin-link', 'profile-link', 'logout-link'];
    elementsToHide.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });

    // Show login/register buttons on home
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) authButtons.style.display = 'flex'; // Ensure they are visible for logged-out

    // Show home link
    const homeLink = document.querySelector('.nav-menu a[onclick*="showSection(\'home\')"]');
    if (homeLink) homeLink.style.display = 'block';
}

// Section navigation
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Load section-specific data
    switch(sectionId) {
        case 'quiz-list':
            loadQuizzes();
            break;
        case 'history':
            loadHistory();
            break;
        case 'admin':
            // Check if user is admin before showing admin section
            if (currentUser && currentUser.roles && currentUser.roles.includes('ADMIN')) {
                // Default to questions tab when entering admin section, but check if the tab exists
                const defaultAdminTabBtn = document.querySelector('.admin-tabs .tab-btn.active');
                const defaultTabName = defaultAdminTabBtn ? defaultAdminTabBtn.dataset.tab : 'questions'; // Get current active or default
                showAdminTab(defaultTabName);
            } else {
                showToast('Access Denied: You do not have administrator privileges.', 'error');
                showSection('home'); // Redirect to home if not admin
            }
            break;
        case 'profile':
            displayProfile();
            break;
        case 'login':
        case 'register':
            // Do nothing specific, forms are static
            break;
        case 'home':
            // Ensure auth buttons are visible if home is shown and user is logged out
            if (!jwtToken || !currentUser) {
                const authButtons = document.querySelector('.auth-buttons');
                if (authButtons) authButtons.style.display = 'flex';
            }
            break;
    }
}

// Quiz functions
async function loadQuizzes() {
    if (!jwtToken) {
        showToast('Please log in to view quizzes.', 'info');
        showSection('login'); // Redirect to login if not logged in
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/user/get/quiz`, {
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        
        if (response.ok) {
            quizzes = await response.json();
            displayQuizzes();
        } else if (response.status === 401 || response.status === 403) {
            showToast('Session expired or unauthorized. Please log in again.', 'error');
            logout();
        } else {
            showToast('Failed to load quizzes', 'error');
        }
    } catch (error) {
        console.error('Load quizzes error:', error);
        showToast('Network error loading quizzes', 'error');
    }
    
    hideLoading();
}

function displayQuizzes() {
    const container = document.getElementById('quizListContent');
    if (!container) return;
    
    if (!quizzes || quizzes.length === 0) {
        container.innerHTML = '<p>No quizzes available</p>';
        return;
    }
    
    const isAdmin = currentUser && currentUser.roles && currentUser.roles.includes('ADMIN');
    
    const quizHTML = quizzes.map(quiz => `
        <div class="quiz-card">
            <h3>${quiz.name}</h3>
            <div class="quiz-actions">
                <button class="btn btn-primary" onclick="startQuiz(${quiz.id})">Start Quiz</button>
                ${isAdmin ? `<button class="btn btn-danger" onclick="deleteQuiz(${quiz.id})">Delete</button>` : ''}
            </div>
        </div>
    `).join('');
    
    container.innerHTML = quizHTML;
}

async function startQuiz(quizId) {
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/user/get/${quizId}`, {
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        
        if (response.ok) {
            const quizData = await response.json();
            currentQuiz = { id: quizId };
            questions = quizData; // API returns array of questions directly
            currentQuestionIndex = 0;
            userAnswers = new Array(questions.length).fill(null); // Reset userAnswers for new quiz
            
            const quizTitleElement = document.getElementById('quizTitle');
            const totalQuestionsElement = document.getElementById('totalQuestions');
            
            if (quizTitleElement) quizTitleElement.textContent = `Quiz ${quizId}`; // Title might need to come from quiz metadata, not just ID
            if (totalQuestionsElement) totalQuestionsElement.textContent = `of ${questions.length}`;
            
            showSection('quiz-taking');
            displayQuestion();
        } else if (response.status === 401 || response.status === 403) {
            showToast('Session expired or unauthorized. Please log in again.', 'error');
            logout();
        } else {
            showToast('Failed to start quiz', 'error');
        }
    } catch (error) {
        console.error('Start quiz error:', error);
        showToast('Network error starting quiz', 'error');
    }
    
    hideLoading();
}

function displayQuestion() {
    if (!questions || questions.length === 0) return;
    
    const question = questions[currentQuestionIndex];
    const questionNumber = currentQuestionIndex + 1;
    
    const questionNumberElement = document.getElementById('questionNumber');
    if (questionNumberElement) {
        questionNumberElement.textContent = `Question ${questionNumber}`;
    }
    
    const quizTitleElement = document.getElementById('quizTitle');
    if (quizTitleElement) {
        // You might want to update the quiz title to something more descriptive if available
        // For now, it keeps "Quiz ID" or whatever was set in startQuiz.
    }

    const quizContent = document.getElementById('quizContent');
    if (quizContent) {
        quizContent.innerHTML = `
            <div class="question-container">
                <div class="question-text">${question.question}</div>
                <div class="options">
                    <div class="option" onclick="selectOption(this, '${question.option1.replace(/'/g, "\\'")}')">
                        ${question.option1}
                    </div>
                    <div class="option" onclick="selectOption(this, '${question.option2.replace(/'/g, "\\'")}')">
                        ${question.option2}
                    </div>
                    <div class="option" onclick="selectOption(this, '${question.option3.replace(/'/g, "\\'")}')">
                        ${question.option3}
                    </div>
                    <div class="option" onclick="selectOption(this, '${question.option4.replace(/'/g, "\\'")}')">
                        ${question.option4}
                    </div>
                </div>
            </div>
        `;
    }
    // Added .replace(/'/g, "\\'") to handle single quotes in options, preventing JS errors.
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    if (prevBtn) prevBtn.style.display = currentQuestionIndex > 0 ? 'block' : 'none';
    if (nextBtn) nextBtn.style.display = currentQuestionIndex < questions.length - 1 ? 'block' : 'none';
    if (submitBtn) submitBtn.style.display = currentQuestionIndex === questions.length - 1 ? 'block' : 'none';
    
    // Restore selected answer if exists
    if (userAnswers[currentQuestionIndex]) {
        // Find the option element that contains the stored answer text
        const selectedOption = Array.from(document.querySelectorAll('.option')).find(
            opt => opt.textContent.trim() === userAnswers[currentQuestionIndex].trim()
        );
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }
    }
}

function selectOption(element, option) {
    // Remove previous selection
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Add selection to clicked option
    element.classList.add('selected');
    
    // Store answer
    userAnswers[currentQuestionIndex] = option;
}

function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

async function submitQuiz() {
    // Check if all questions are answered
    if (userAnswers.includes(null)) {
        showToast('Please answer all questions before submitting', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        // --- API Call 1: Submit answers for score calculation ---
        const formattedAnswersForScore = questions.map((question, index) => ({
            id: question.id,
            rightAnswer: userAnswers[index] // Sending user's selected answer as 'rightAnswer'
        }));
        
        const scoreResponse = await fetch(`${API_BASE_URL}/user/submit/${currentQuiz.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify(formattedAnswersForScore)
        });
        
        if (scoreResponse.ok) {
            const scoreText = await scoreResponse.text(); // API returns string like "Score of the Quiz is : 8"
            showToast(scoreText, 'success');
            
            // --- API Call 2: Get correct answers for temporary review ---
            // The user's answers are sent again for the backend to compare and return
            // the combined CorrectAnswer objects.
            const answersReviewResponse = await fetch(`${API_BASE_URL}/user/getRightAnswer/${currentQuiz.id}`, {
                method: 'POST', // Backend expects POST with a body
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                },
                body: JSON.stringify(formattedAnswersForScore) // Send user's answers again
            });

            if (answersReviewResponse.ok) {
                const answersData = await answersReviewResponse.json();
                displayQuizAnswers(answersData, currentQuiz.id); // Display answers temporarily
                // Note: userAnswers is now cleared if starting a new quiz,
                // but for this specific review it's fine.
            } else {
                const errorText = await answersReviewResponse.text();
                console.error('Failed to load quiz answers for review:', errorText);
                showToast(errorText || 'Failed to load answers for review', 'error');
                showSection('quiz-list'); // Go back to quiz list if answers review fails
            }
            
            loadHistory(); // Refresh history (only score will be shown)
        } else if (scoreResponse.status === 401 || scoreResponse.status === 403) {
            showToast('Session expired or unauthorized. Please log in again.', 'error');
            logout();
        } else {
            const errorText = await scoreResponse.text();
            showToast(errorText || 'Failed to submit quiz', 'error');
            showSection('quiz-list'); // Go back to quiz list if score submission fails
        }
    } catch (error) {
        console.error('Submit quiz error:', error);
        showToast('Network error during quiz submission', 'error');
        showSection('quiz-list'); // Go back to quiz list on network error
    }
    
    hideLoading();
}

// Delete Quiz by Admin
async function deleteQuiz(quizId) {
    if (!confirm('Are you sure you want to delete this quiz?')) {
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/delete/quiz/${quizId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        
        if (response.ok) {
            showToast('Quiz deleted successfully!', 'success');
            loadQuizzes(); // Refresh the quiz list
        } else if (response.status === 401 || response.status === 403) {
            showToast('Session expired or unauthorized to delete quiz. Please log in as admin.', 'error');
            logout();
        } else {
            const errorText = await response.text();
            showToast(errorText || 'Failed to delete quiz', 'error');
        }
    } catch (error) {
        console.error('Delete quiz error:', error);
        showToast('Network error deleting quiz', 'error');
    }
    
    hideLoading();
}


// History functions
async function loadHistory() {
    if (!jwtToken) {
        showToast('Please log in to view history.', 'info');
        showSection('login'); // Redirect to login if not logged in
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/user/get/history`, {
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        
        if (response.ok) {
            const history = await response.json();
            displayHistory(history);
        } else if (response.status === 401 || response.status === 403) {
            showToast('Session expired or unauthorized. Please log in again.', 'error');
            logout();
        } else {
            showToast('Failed to load history', 'error');
        }
    } catch (error) {
        console.error('Load history error:', error);
        showToast('Network error loading history', 'error');
    }
    
    hideLoading();
}

// UPDATED: Modify displayHistory function - REMOVE "View Answers" button
function displayHistory(history) {
    const container = document.getElementById('historyContent');
    if (!container) return;
    
    if (!history || history.length === 0) {
        container.innerHTML = '<p>No quiz history available</p>';
        return;
    }
    
    const historyHTML = `
        <div class="history-grid">
            ${history.map(record => `
                <div class="history-card">
                    <div class="history-info">
                        <h4>${record.quizName}</h4>
                        <p>Quiz ID: ${record.quizId}</p>
                    </div>
                    <div class="history-score">Score: ${record.score}</div>
                    <div class="history-date">${record.crntDate}</div>
                    </div>
            `).join('')}
        </div>
    `;
    
    container.innerHTML = historyHTML;
}

// NEW FUNCTION: Display Quiz Answers (now called after submission)
// This function will display the answers in the 'quiz-answers' section.
function displayQuizAnswers(answersData, quizId) {
    const container = document.getElementById('answersContent');
    if (!container) return;
    
    if (!answersData || answersData.length === 0) {
        container.innerHTML = '<p>No answer data available</p>';
        return;
    }
    
    const answersHTML = `
        <div class="answers-container">
            <h3>Quiz ${quizId} - Answer Review</h3>
            <div class="answers-list">
                ${answersData.map((item, index) => `
                    <div class="answer-item ${item.userAnswer === item.rightAnswer ? 'correct' : 'incorrect'}">
                        <div class="question-number">Question ${index + 1}</div>
                        <div class="question-text">${item.question}</div>
                        <div class="answer-details">
                            <div class="user-answer">
                                <strong>Your Answer:</strong> 
                                <span class="${item.userAnswer === item.rightAnswer ? 'correct-text' : 'incorrect-text'}">
                                    ${item.userAnswer || 'Not answered'}
                                </span>
                            </div>
                            <div class="correct-answer">
                                <strong>Correct Answer:</strong> 
                                <span class="correct-text">${item.rightAnswer}</span>
                            </div>
                            <div class="result-icon">
                                ${item.userAnswer === item.rightAnswer ? 
                                    '<i class="fas fa-check-circle correct-icon"></i>' : 
                                    '<i class="fas fa-times-circle incorrect-icon"></i>'
                                }
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="answers-actions">
                <button class="btn btn-secondary" onclick="showSection('quiz-list')">Back to Quizzes</button>
            </div>
        </div>
    `;
    
    container.innerHTML = answersHTML;
    showSection('quiz-answers'); // Show the answers section
}


// Profile functions
function displayProfile() {
    if (!currentUser) {
        showToast('User profile not loaded. Please log in.', 'error');
        showSection('login');
        return;
    }
    
    const profileHTML = `
        <div>
            <h3>${currentUser.userName || 'User'}</h3>
            <p><strong>Email:</strong> ${currentUser.emailId || 'N/A'}</p>
            <p><strong>Roles:</strong> ${currentUser.roles ? currentUser.roles.join(', ') : 'USER'}</p>
        </div>
    `;
    
    const profileContent = document.getElementById('profileContent');
    if (profileContent) {
        profileContent.innerHTML = profileHTML;
    }
}

// Admin functions
function showAdminTab(tabName) {
    // Hide all admin tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`admin-${tabName}`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked button (if event exists)
    // This part assumes the function is called directly from an onclick,
    // which populates window.event. In a modern approach, you'd pass 'this' or the event object.
    if (window.event && window.event.target) {
        window.event.target.classList.add('active');
    }
    
    // Perform specific actions based on the tab clicked
    if (tabName === 'questions') {
        loadQuestions();
    } else if (tabName === 'quiz-leaderboards') { // NEW: Handle the new leaderboard tab
        const defaultQuizName = 'springBoot quiz'; // Default quiz name to show initially
        if (quizNameInput) { // Check if element exists before accessing its value
            quizNameInput.value = defaultQuizName; // Pre-fill the input field
        }
        fetchQuizLeaderboard(defaultQuizName); // Fetch data for the default quiz
    }
    // No need for a 'default' case as `showSection` handles non-admin roles for 'admin' tab
}

async function loadQuestions() {
    if (!jwtToken || !currentUser || !currentUser.roles || !currentUser.roles.includes('ADMIN')) {
        showToast('Access Denied: You must be an administrator to view questions.', 'error');
        showSection('home'); // Redirect if not admin
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/getQuestions`, {
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        
        if (response.ok) {
            const questionsList = await response.json();
            displayQuestions(questionsList);
        } else if (response.status === 401 || response.status === 403) {
            showToast('Session expired or unauthorized. Please log in as admin.', 'error');
            logout();
        } else {
            showToast('Failed to load questions', 'error');
        }
    } catch (error) {
        console.error('Load questions error:', error);
        showToast('Network error loading questions', 'error');
    }
    
    hideLoading();
}

function displayQuestions(questionsList) {
    const container = document.getElementById('questionsContent');
    if (!container) return;
    
    if (!questionsList || questionsList.length === 0) {
        container.innerHTML = '<p>No questions available</p>';
        return;
    }
    
    const questionsHTML = `
        <table class="questions-table">
            <thead>
                <tr>
                    <th>Question</th>
                    <th>Category</th>
                    <th>Difficulty</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${questionsList.map(question => `
                    <tr>
                        <td>${question.question ? question.question.substring(0, 50) + '...' : 'N/A'}</td>
                        <td>${question.category || 'N/A'}</td>
                        <td>${question.difficult || 'N/A'}</td>
                        <td>
                            <button class="btn btn-danger" onclick="deleteQuestion(${question.id})">
                                Delete
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = questionsHTML;
}

function showAddQuestionForm() {
    const form = document.getElementById('addQuestionForm');
    if (form) {
        form.style.display = 'block';
    }
}

function hideAddQuestionForm() {
    const form = document.getElementById('addQuestionForm');
    const questionForm = document.getElementById('questionForm');
    
    if (form) form.style.display = 'none';
    if (questionForm) questionForm.reset();
}

async function handleAddQuestion(e) {
    e.preventDefault();
    
    const questionData = {
        question: document.getElementById('questionText').value,
        option1: document.getElementById('option1').value,
        option2: document.getElementById('option2').value,
        option3: document.getElementById('option3').value,
        option4: document.getElementById('option4').value,
        rightAnswer: document.getElementById('rightAnswer').value,
        category: document.getElementById('category').value,
        difficult: document.getElementById('difficulty').value
    };
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/addQuestion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify(questionData)
        });
        
        if (response.ok) {
            showToast('Question added successfully!', 'success');
            hideAddQuestionForm();
            loadQuestions();
        } else if (response.status === 401 || response.status === 403) {
            showToast('Session expired or unauthorized to add question. Please log in as admin.', 'error');
            logout();
        } else {
            const errorText = await response.text();
            showToast(errorText || 'Failed to add question', 'error');
        }
    } catch (error) {
        console.error('Add question error:', error);
        showToast('Network error adding question', 'error');
    }
    
    hideLoading();
}

async function deleteQuestion(questionId) {
    if (!confirm('Are you sure you want to delete this question?')) {
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/deleteQuestion/${questionId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        
        if (response.ok) {
            showToast('Question deleted successfully!', 'success');
            loadQuestions();
        } else if (response.status === 401 || response.status === 403) {
            showToast('Session expired or unauthorized to delete question. Please log in as admin.', 'error');
            logout();
        } else {
            showToast('Failed to delete question', 'error');
        }
    } catch (error) {
        console.error('Delete question error:', error);
        showToast('Network error deleting question', 'error');
    }
    
    hideLoading();
}

async function handleCreateQuiz(e) {
    e.preventDefault();
    
    const category = document.getElementById('quizCategory').value;
    const title = document.getElementById('quizTitleInput').value;
    const questionCount = document.getElementById('questionCount').value;
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/create?category=${encodeURIComponent(category)}&title=${encodeURIComponent(title)}&no=${questionCount}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        
        if (response.ok) {
            showToast('Quiz created successfully!', 'success');
            const createQuizForm = document.getElementById('createQuizForm');
            if (createQuizForm) createQuizForm.reset();
            loadQuizzes();
        } else if (response.status === 401 || response.status === 403) {
            showToast('Session expired or unauthorized to create quiz. Please log in as admin.', 'error');
            logout();
        } else {
            const errorText = await response.text();
            showToast(errorText || 'Failed to create quiz', 'error');
        }
    } catch (error) {
        console.error('Create quiz error:', error);
        showToast('Network error creating quiz', 'error');
    }
    
    hideLoading();
}

async function filterQuestions() {
    const category = document.getElementById('categoryFilter').value;
    
    if (!jwtToken || !currentUser || !currentUser.roles || !currentUser.roles.includes('ADMIN')) {
        showToast('Access Denied: You must be an administrator to filter questions.', 'error');
        showSection('home');
        return;
    }
    
    showLoading();
    
    try {
        let url = `${API_BASE_URL}/admin/getQuestions`;
        if (category && category !== 'all') {
            url = `${API_BASE_URL}/admin/getQuestionsByCategory/${encodeURIComponent(category)}`;
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        
        if (response.ok) {
            const questionsList = await response.json();
            displayQuestions(questionsList);
        } else if (response.status === 401 || response.status === 403) {
            showToast('Session expired or unauthorized. Please log in as admin.', 'error');
            logout();
        } else {
            showToast('Failed to filter questions', 'error');
        }
    } catch (error) {
        console.error('Filter questions error:', error);
        showToast('Network error filtering questions', 'error');
    }
    
    hideLoading();
}

// --- NEW SECTION: Quiz Leaderboard Functions ---

// Function to fetch and display leaderboard data
async function fetchQuizLeaderboard(quizName) {
    if (!jwtToken) {
        showToast('Please log in to view quiz leaderboards.', 'info');
        if (leaderboardTableBody) {
            leaderboardTableBody.innerHTML = `<tr><td colspan="3" class="text-center">Please log in to view leaderboards.</td></tr>`;
        }
        if (leaderboardQuizNameDisplay) {
            leaderboardQuizNameDisplay.textContent = 'N/A';
        }
        return;
    }

    if (!currentUser || !currentUser.roles || !currentUser.roles.includes('ADMIN')) {
        showToast('Access Denied: You must be an administrator to view leaderboards.', 'error');
        if (leaderboardTableBody) {
            leaderboardTableBody.innerHTML = `<tr><td colspan="3" class="text-center">Access Denied: Admin privileges required.</td></tr>`;
        }
        if (leaderboardQuizNameDisplay) {
            leaderboardQuizNameDisplay.textContent = 'N/A';
        }
        return;
    }

    showLoading(); // Show loading spinner
    if (leaderboardQuizNameDisplay) { // Check if element exists
        leaderboardQuizNameDisplay.textContent = quizName; // Update the displayed quiz name
    }

    try {
        const encodedQuizName = encodeURIComponent(quizName); // Encode the quiz name for URL safety
        // Construct the API URL using the provided endpoint
        const response = await fetch(`${API_BASE_URL}/admin/get/TopScorerOfEveryQuiz/${encodedQuizName}`, {
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });

        if (!response.ok) {
            // If the response is not OK (e.g., 404, 500), throw an error
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }

        const data = await response.json(); // Parse the JSON response
        displayLeaderboard(data, quizName); // Call function to display data
        showToast('Leaderboard loaded successfully!', 'success');
    } catch (error) {
        console.error('Error fetching quiz leaderboard:', error);
        showToast(`Error loading leaderboard: ${error.message}`, 'error');
        // Display an error message in the table body
        if (leaderboardTableBody) {
            leaderboardTableBody.innerHTML = `<tr><td colspan="3" class="text-center">Failed to load leaderboard data. ${error.message}</td></tr>`;
        }
    } finally {
        hideLoading(); // Hide loading spinner regardless of success or failure
    }
}

// Function to display leaderboard data in the table
function displayLeaderboard(data, quizName) {
    if (!leaderboardTableBody) return; // Ensure element exists

    leaderboardTableBody.innerHTML = ''; // Clear any existing data in the table body
    
    if (!data || data.length === 0) {
        // If no data is returned, display a message
        leaderboardTableBody.innerHTML = `<tr><td colspan="3" class="text-center">No top scorers found for "${quizName}" yet.</td></tr>`;
        return;
    }

    // Sort the data by score in descending order (highest score first)
    data.sort((a, b) => b.score - a.score);

    // Iterate over the sorted data and populate the table
    data.forEach((scorer, index) => {
        const row = leaderboardTableBody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td> <td>${scorer.userName}</td>
            <td>${scorer.score}</td>
        `;
    });
}

// Utility functions
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'flex';
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    } else {
        // Fallback to alert if toast element doesn't exist
        alert(message);
    }
}

// Error handling for network requests
window.addEventListener('online', () => {
    showToast('Connection restored', 'success');
});

window.addEventListener('offline', () => {
    showToast('Connection lost. Please check your internet.', 'warning');
});

// Prevent form submission on Enter key in quiz
document.addEventListener('keydown', (e) => {
    const quizTaking = document.getElementById('quiz-taking');
    if (e.key === 'Enter' && quizTaking && quizTaking.classList.contains('active')) {
        e.preventDefault();
    }
});

// Global functions for HTML onclick handlers
// (These ensure functions called directly from HTML onclick attributes are accessible)
window.showSection = showSection;
window.logout = logout;
window.startQuiz = startQuiz;
window.selectOption = selectOption;
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.submitQuiz = submitQuiz;
window.showAdminTab = showAdminTab;
window.showAddQuestionForm = showAddQuestionForm;
window.hideAddQuestionForm = hideAddQuestionForm;
window.deleteQuestion = deleteQuestion;
window.filterQuestions = filterQuestions;
window.deleteQuiz = deleteQuiz; // Still needed for admin delete
// No need to add fetchQuizLeaderboard or displayLeaderboard here, as they are called internally