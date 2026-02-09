// --- KONFIGURASI DATA GAME ---
const categories = {
    "Hewan": ["GAJAH", "HARIMAU", "KANGURU", "DOLPHIN", "ELANG", "JERAPAH", "KOMODO"],
    "Buah": ["ANGGUR", "DURIAN", "MANGGIS", "RAMBUTAN", "ALPUKAT", "STRAWBERRY"],
    "Teknologi": ["INTERNET", "ROBOTIK", "ALGORITMA", "DATABASE", "PROGRAMMER", "HARDWARE"],
    "Negara": ["INDONESIA", "JEPANG", "JERMAN", "PALESTINA", "BRAZIL", "KANADA"]
};

// --- VARIABEL STATE ---
let currentWord = "";
let currentCategory = "";
let guessedLetters = [];
let lives = 5;
let score = 0;
let gameActive = false;

// --- DOM ELEMENTS ---
const wordDisplay = document.getElementById('word-display');
const keyboardDiv = document.getElementById('keyboard');
const livesCount = document.getElementById('lives-count');
const livesBar = document.getElementById('lives-bar');
const scoreText = document.getElementById('score-text');
const categoryText = document.getElementById('category-text');
const modalWin = document.getElementById('modal-win');
const modalLose = document.getElementById('modal-lose');
const themeToggle = document.getElementById('theme-toggle');
const gameContainer = document.querySelector('.container');

// --- INIT SYSTEM ---
document.addEventListener('DOMContentLoaded', () => {
    loadScore();
    initGame();
    setupEvents();
});

// --- FUNGSI UTAMA GAME ---

function initGame() {
    // 1. Reset State
    gameActive = true;
    lives = 5;
    guessedLetters = [];
    updateLivesUI();
    
    // 2. Pilih Kategori & Kata Acak
    const categoryKeys = Object.keys(categories);
    currentCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
    const words = categories[currentCategory];
    currentWord = words[Math.floor(Math.random() * words.length)];

    // 3. Update UI Header
    categoryText.textContent = currentCategory;
    
    // 4. Render Kata & Keyboard
    renderWord();
    renderKeyboard();
    
    // 5. Hide Modals
    modalWin.classList.add('hidden');
    modalLose.classList.add('hidden');
}

function renderWord() {
    wordDisplay.innerHTML = '';
    currentWord.split('').forEach(letter => {
        const letterBox = document.createElement('div');
        letterBox.classList.add('letter-box');
        
        if (guessedLetters.includes(letter)) {
            letterBox.textContent = letter;
            letterBox.classList.add('revealed');
        } else {
            letterBox.textContent = '';
        }
        wordDisplay.appendChild(letterBox);
    });
}

function renderKeyboard() {
    keyboardDiv.innerHTML = '';
    for (let i = 65; i <= 90; i++) { // ASCII A-Z
        const letter = String.fromCharCode(i);
        const btn = document.createElement('button');
        btn.textContent = letter;
        btn.classList.add('key-btn');
        btn.setAttribute('data-letter', letter);
        
        // Disable jika sudah ditebak
        if (guessedLetters.includes(letter)) {
            btn.disabled = true;
            if (currentWord.includes(letter)) {
                btn.classList.add('correct');
            } else {
                btn.classList.add('wrong');
            }
        }
        
        btn.addEventListener('click', () => handleGuess(letter));
        keyboardDiv.appendChild(btn);
    }
}

function handleGuess(letter) {
    if (!gameActive || guessedLetters.includes(letter)) return;

    guessedLetters.push(letter);
    const btn = document.querySelector(`button[data-letter="${letter}"]`);
    btn.disabled = true;

    // AUDIO EFFECT (Simple Web Audio API Beep)
    playTone(400, 'sine', 0.1); 

    if (currentWord.includes(letter)) {
        // TEBAKAN BENAR
        btn.classList.add('correct');
        renderWord();
        playTone(600, 'triangle', 0.1); // Success beep
        checkWin();
    } else {
        // TEBAKAN SALAH
        btn.classList.add('wrong');
        lives--;
        updateLivesUI();
        triggerShake();
        playTone(150, 'sawtooth', 0.2); // Error buzz
        checkLoss();
    }
}

function updateLivesUI() {
    livesCount.textContent = lives;
    const percentage = (lives / 5) * 100;
    livesBar.style.width = `${percentage}%`;
    
    // Ubah warna bar jika kritis
    if (lives <= 2) {
        livesBar.style.background = 'var(--accent-red)';
    } else {
        livesBar.style.background = 'linear-gradient(90deg, var(--accent-green), var(--accent-blue))';
    }
}

function triggerShake() {
    gameContainer.classList.add('shake');
    setTimeout(() => {
        gameContainer.classList.remove('shake');
    }, 500);
}

// --- WIN / LOSS LOGIC ---

function checkWin() {
    const isWon = currentWord.split('').every(l => guessedLetters.includes(l));
    if (isWon) {
        gameActive = false;
        score += 10;
        updateScore();
        setTimeout(() => {
            playWinSound(); // Suara menang
            showWinModal();
        }, 500);
    }
}

function checkLoss() {
    if (lives === 0) {
        gameActive = false;
        setTimeout(() => {
            showLoseModal();
        }, 500);
    }
}

// --- MODAL & SCORE SYSTEM ---

function showWinModal() {
    modalWin.classList.remove('hidden');
    startConfetti();
}

function showLoseModal() {
    document.getElementById('correct-answer-text').textContent = currentWord;
    modalLose.classList.remove('hidden');
}

function updateScore() {
    scoreText.textContent = score;
    localStorage.setItem('wordGuessScore', score);
}

function loadScore() {
    const savedScore = localStorage.getItem('wordGuessScore');
    if (savedScore) {
        score = parseInt(savedScore);
        scoreText.textContent = score;
    }
}

// --- UTILITIES & EVENTS ---

// --- UTILITIES & EVENTS ---

function setupEvents() {
    // MODIFIKASI: Tombol Reset Game sekarang mereset SKOR juga
    document.getElementById('reset-btn').addEventListener('click', () => {
        // 1. Reset Skor ke 0
        score = 0;
        scoreText.textContent = score;
        
        // 2. Hapus skor dari penyimpanan browser (localStorage)
        localStorage.setItem('wordGuessScore', 0);
        
        // 3. Mulai ulang game
        initGame();
        
        // (Opsional) Beri notifikasi kecil atau efek suara
        playTone(300, 'triangle', 0.1); 
    });

    // Tombol di Modal Kalah & Menang tetap melanjutkan game (Tanpa reset skor)
    document.getElementById('try-again-btn').addEventListener('click', initGame);
    document.getElementById('play-again-btn').addEventListener('click', initGame);

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
    });

    // Physical Keyboard Support
    document.addEventListener('keydown', (e) => {
        const letter = e.key.toUpperCase();
        if (letter >= 'A' && letter <= 'Z') {
            handleGuess(letter);
        }
    });
}
// --- AUDIO SYSTEM (Tanpa File Eksternal) ---
// Menggunakan Web Audio API untuk membuat suara sederhana
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playWinSound() {
    // Simple victory melody
    setTimeout(() => playTone(523.25, 'sine', 0.2), 0);
    setTimeout(() => playTone(659.25, 'sine', 0.2), 200);
    setTimeout(() => playTone(783.99, 'sine', 0.4), 400);
}

// --- CONFETTI EFFECT (Simple Custom JS) ---
function startConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const pieces = [];
    const colors = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f'];
    
    for(let i=0; i<100; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 10 + 5,
            h: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            drift: Math.random() * 2 - 1
        });
    }

    function animate() {
        if (modalWin.classList.contains('hidden')) return; // Stop if closed
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        pieces.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.w, p.h);
            p.y += p.speed;
            p.x += p.drift;
            
            if (p.y > canvas.height) p.y = -20;
        });
        requestAnimationFrame(animate);
    }
    animate();
}