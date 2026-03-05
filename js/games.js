/* =============================================
   GAMES.JS
   Memory Match, Typing Speed Test, Snake, Quiz
   ============================================= */

// =============================================
// GAME TABS
// =============================================
function initGameTabs() {
  const tabs = document.querySelectorAll('.game-tab');
  const panels = document.querySelectorAll('.game-panel');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      const id = 'game-' + tab.dataset.game;
      document.getElementById(id).classList.add('active');
    });
  });
}

// =============================================
// MEMORY MATCH GAME
// =============================================
const MEMORY_ICONS = ['⚡', '🔌', '💡', '🔧', '📡', '🖥️', '🔬', '🧲'];

function initMemoryGame() {
  let cards = [];
  let flipped = [];
  let matched = 0;
  let moves = 0;
  let locked = false;

  const board = document.getElementById('memoryBoard');
  const movesEl = document.getElementById('memoryMoves');
  const matchesEl = document.getElementById('memoryMatches');
  const winEl = document.getElementById('memoryWin');
  const winMovesEl = document.getElementById('winMoves');

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildBoard() {
    cards = [];
    flipped = [];
    matched = 0;
    moves = 0;
    locked = false;
    movesEl.textContent = '0';
    matchesEl.textContent = '0';
    winEl.classList.add('hidden');
    board.innerHTML = '';

    const pairs = shuffle([...MEMORY_ICONS, ...MEMORY_ICONS]);
    pairs.forEach((icon, idx) => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.dataset.icon = icon;
      card.dataset.idx = idx;
      card.innerHTML = `<span class="card-front">${icon}</span><span class="card-back">?</span>`;
      card.addEventListener('click', () => handleCardClick(card));
      board.appendChild(card);
      cards.push(card);
    });
  }

  function handleCardClick(card) {
    if (locked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
    card.classList.add('flipped');
    flipped.push(card);
    if (flipped.length === 2) {
      locked = true;
      moves++;
      movesEl.textContent = moves;
      checkMatch();
    }
  }

  function checkMatch() {
    const [a, b] = flipped;
    if (a.dataset.icon === b.dataset.icon) {
      a.classList.add('matched');
      b.classList.add('matched');
      matched++;
      matchesEl.textContent = matched;
      flipped = [];
      locked = false;
      if (matched === MEMORY_ICONS.length) {
        winMovesEl.textContent = moves;
        winEl.classList.remove('hidden');
      }
    } else {
      setTimeout(() => {
        a.classList.remove('flipped');
        b.classList.remove('flipped');
        flipped = [];
        locked = false;
      }, 900);
    }
  }

  document.getElementById('memoryRestart').addEventListener('click', buildBoard);
  document.getElementById('memoryPlayAgain').addEventListener('click', buildBoard);
  buildBoard();
}

// =============================================
// TYPING SPEED TEST
// =============================================
const TYPING_PHRASES = [
  'verilog module clock reset signal output input wire register always posedge negedge',
  'int main void return array pointer struct function class template namespace include',
  'fpga synthesis timing constraint flip flop multiplexer decoder encoder latch buffer',
  'resistor capacitor inductor transistor diode op-amp oscillator filter amplifier rectifier',
  'digital analog binary decimal hexadecimal boolean logic gate circuit breadboard solder',
  'embedded microcontroller uart spi i2c interrupt timer pwm adc dac protocol bus',
];

function initTypingGame() {
  let startTime = null;
  let timerInterval = null;
  let timeLeft = 30;
  let phrase = '';
  let started = false;

  const promptEl = document.getElementById('typingPrompt');
  const inputEl = document.getElementById('typingInput');
  const wpmEl = document.getElementById('typingWpm');
  const accEl = document.getElementById('typingAccuracy');
  const timerEl = document.getElementById('typingTimer');
  const resultEl = document.getElementById('typingResult');
  const finalWpmEl = document.getElementById('typingFinalWpm');
  const finalAccEl = document.getElementById('typingFinalAcc');

  function pickPhrase() {
    return TYPING_PHRASES[Math.floor(Math.random() * TYPING_PHRASES.length)];
  }

  function renderPrompt(typed) {
    const words = phrase.split(' ');
    const typedWords = typed.split(' ');
    let html = '';
    words.forEach((word, wi) => {
      const typedWord = typedWords[wi] || '';
      let wordHtml = '';
      if (wi < typedWords.length - 1) {
        // finished word
        for (let ci = 0; ci < word.length; ci++) {
          const ch = word[ci];
          const tch = typedWord[ci];
          if (tch === undefined) wordHtml += `<span class="incorrect">${ch}</span>`;
          else if (tch === ch) wordHtml += `<span class="correct">${ch}</span>`;
          else wordHtml += `<span class="incorrect">${ch}</span>`;
        }
      } else if (wi === typedWords.length - 1) {
        // current word
        for (let ci = 0; ci < word.length; ci++) {
          const ch = word[ci];
          const tch = typedWord[ci];
          if (ci === typedWord.length) wordHtml += `<span class="current">${ch}</span>`;
          else if (tch === undefined) wordHtml += `<span>${ch}</span>`;
          else if (tch === ch) wordHtml += `<span class="correct">${ch}</span>`;
          else wordHtml += `<span class="incorrect">${ch}</span>`;
        }
      } else {
        wordHtml = word;
      }
      html += wordHtml + ' ';
    });
    promptEl.innerHTML = html;
  }

  function calcStats(typed) {
    const elapsed = (30 - timeLeft) || 1;
    const wordsTyped = typed.trim().split(/\s+/).filter(Boolean).length;
    const wpm = Math.round((wordsTyped / elapsed) * 60);

    let correct = 0, total = 0;
    const typedChars = typed.split('');
    const phraseChars = phrase.split('');
    typedChars.forEach((ch, i) => {
      total++;
      if (ch === phraseChars[i]) correct++;
    });
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;
    return { wpm, accuracy };
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      timeLeft--;
      timerEl.textContent = timeLeft;
      const stats = calcStats(inputEl.value);
      wpmEl.textContent = stats.wpm;
      accEl.textContent = stats.accuracy + '%';
      if (timeLeft <= 0) finish();
    }, 1000);
  }

  function finish() {
    clearInterval(timerInterval);
    inputEl.disabled = true;
    const stats = calcStats(inputEl.value);
    finalWpmEl.textContent = stats.wpm + ' WPM';
    finalAccEl.textContent = stats.accuracy + '%';
    resultEl.classList.remove('hidden');
  }

  function reset() {
    clearInterval(timerInterval);
    timeLeft = 30;
    started = false;
    phrase = pickPhrase();
    inputEl.value = '';
    inputEl.disabled = false;
    promptEl.textContent = phrase;
    wpmEl.textContent = '0';
    accEl.textContent = '100%';
    timerEl.textContent = '30';
    resultEl.classList.add('hidden');
    renderPrompt('');
  }

  inputEl.addEventListener('input', (e) => {
    if (!started) {
      started = true;
      startTime = Date.now();
      startTimer();
    }
    renderPrompt(e.target.value);
    if (e.target.value.trimEnd() === phrase) finish();
  });

  document.getElementById('typingRestart').addEventListener('click', reset);
  document.getElementById('typingPlayAgain').addEventListener('click', reset);
  reset();
}

// =============================================
// SNAKE GAME
// =============================================
function initSnakeGame() {
  const canvas = document.getElementById('snakeCanvas');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('snakeOverlay');
  const scoreEl = document.getElementById('snakeScore');
  const highEl = document.getElementById('snakeHigh');
  const startBtn = document.getElementById('snakeStartBtn');
  const restartBtn = document.getElementById('snakeStart');

  const CELL = 20;
  const COLS = canvas.width / CELL;
  const ROWS = canvas.height / CELL;
  const COLORS = {
    head: '#4f8ef7',
    body: '#93c5fd',
    food: '#f97316',
    grid: '#e2e8f0',
    bg: '#f8f9fb',
  };

  let snake, dir, nextDir, food, score, highScore, gameLoop, running;

  highScore = parseInt(localStorage.getItem('snakeHigh') || '0');
  highEl.textContent = highScore;

  function randomCell(exclude) {
    let cell;
    do {
      cell = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (exclude.some((s) => s.x === cell.x && s.y === cell.y));
    return cell;
  }

  function drawGrid() {
    // Draw dark theme aware grid
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.strokeStyle = isDark ? '#2d3748' : COLORS.grid;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= canvas.width; x += CELL) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += CELL) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
  }

  function drawSnake() {
    snake.forEach((seg, i) => {
      const isHead = i === 0;
      const grad = ctx.createLinearGradient(seg.x * CELL, seg.y * CELL, (seg.x + 1) * CELL, (seg.y + 1) * CELL);
      grad.addColorStop(0, isHead ? COLORS.head : COLORS.body);
      grad.addColorStop(1, isHead ? '#3b6fd4' : '#60a5fa');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, 4);
      ctx.fill();
    });
  }

  function drawFood() {
    ctx.fillStyle = COLORS.food;
    ctx.beginPath();
    ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    // Glow effect
    ctx.beginPath();
    ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 + 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.3)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  function render() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.fillStyle = isDark ? '#1e2433' : COLORS.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    if (food) drawFood();
    if (snake) drawSnake();
  }

  function step() {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // Wall collision
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
      return endGame();
    }
    // Self collision
    if (snake.some((s) => s.x === head.x && s.y === head.y)) {
      return endGame();
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score++;
      scoreEl.textContent = score;
      if (score > highScore) {
        highScore = score;
        highEl.textContent = highScore;
        localStorage.setItem('snakeHigh', highScore);
      }
      food = randomCell(snake);
    } else {
      snake.pop();
    }
    render();
  }

  function endGame() {
    clearInterval(gameLoop);
    running = false;
    // Flash effect
    ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over! Score: ' + score, canvas.width / 2, canvas.height / 2);
    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Click Start to play again', canvas.width / 2, canvas.height / 2 + 28);
    overlay.style.display = 'none';
  }

  function startGame() {
    snake = [{ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) }];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    food = randomCell(snake);
    score = 0;
    scoreEl.textContent = '0';
    running = true;
    overlay.style.display = 'none';
    clearInterval(gameLoop);
    gameLoop = setInterval(step, 140);
    render();
  }

  const keyMap = {
    ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
  };

  document.addEventListener('keydown', (e) => {
    if (!running) return;
    const nd = keyMap[e.key];
    if (!nd) return;
    // Prevent reversing direction
    if (nd.x !== -dir.x || nd.y !== -dir.y) nextDir = nd;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
  });

  // Touch / swipe support
  let touchStart = null;
  canvas.addEventListener('touchstart', (e) => {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  canvas.addEventListener('touchend', (e) => {
    if (!touchStart || !running) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    let nd = null;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 20) nd = keyMap.ArrowRight;
      else if (dx < -20) nd = keyMap.ArrowLeft;
    } else {
      if (dy > 20) nd = keyMap.ArrowDown;
      else if (dy < -20) nd = keyMap.ArrowUp;
    }
    if (nd && (nd.x !== -dir.x || nd.y !== -dir.y)) nextDir = nd;
    touchStart = null;
  }, { passive: true });

  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', startGame);
  render();
}

// =============================================
// QUIZ GAME
// =============================================
const QUIZ_QUESTIONS = [
  {
    q: 'What does VLSI stand for?',
    opts: ['Very Large Scale Integration', 'Variable Length Signal Interface', 'Very Low Signal Input', 'Verified Logic System Integration'],
    ans: 0,
  },
  {
    q: 'What is the purpose of a flip-flop in digital circuits?',
    opts: ['To filter noise', 'To store a single bit of data', 'To amplify signals', 'To convert analog to digital'],
    ans: 1,
  },
  {
    q: 'Which programming language is most commonly used for hardware description?',
    opts: ['Python', 'Java', 'Verilog', 'C++'],
    ans: 2,
  },
  {
    q: 'What does FPGA stand for?',
    opts: ['Frequency Programmable Gate Array', 'Field Programmable Gate Array', 'Fast Processing Graphics Architecture', 'Flexible Protocol Gateway Adapter'],
    ans: 1,
  },
  {
    q: 'In a PCB, what does the term "via" refer to?',
    opts: ['A type of component', 'A hole that connects copper layers', 'A ground plane', 'A solder joint'],
    ans: 1,
  },
  {
    q: 'What is the output of an AND gate when inputs are 1 and 0?',
    opts: ['1', '0', 'X (undefined)', 'Z (high impedance)'],
    ans: 1,
  },
  {
    q: 'Which microcontroller is used in the "Farm Quest" project?',
    opts: ['Arduino Uno', 'ESP8266', 'ESP32', 'Raspberry Pi'],
    ans: 2,
  },
  {
    q: 'What algorithm is used in a Discrete Fourier Transform for efficiency?',
    opts: ['Binary Search', 'FFT (Fast Fourier Transform)', 'Bubble Sort', 'Dijkstra\'s Algorithm'],
    ans: 1,
  },
  {
    q: 'What does PCB stand for?',
    opts: ['Programmable Circuit Board', 'Printed Circuit Board', 'Processed Component Base', 'Power Control Bus'],
    ans: 1,
  },
  {
    q: 'Which communication protocol uses a clock and data line (2-wire)?',
    opts: ['UART', 'SPI', 'I2C', 'CAN'],
    ans: 2,
  },
];

function initQuizGame() {
  let currentQ = 0;
  let score = 0;
  let questions = [];

  const questionEl = document.getElementById('quizQuestion');
  const optionsEl = document.getElementById('quizOptions');
  const numEl = document.getElementById('quizNum');
  const scoreEl = document.getElementById('quizScore');
  const resultEl = document.getElementById('quizResult');
  const finalScoreEl = document.getElementById('quizFinalScore');

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startQuiz() {
    questions = shuffle(QUIZ_QUESTIONS).slice(0, 10);
    currentQ = 0;
    score = 0;
    scoreEl.textContent = '0';
    resultEl.classList.add('hidden');
    document.getElementById('quizContainer').style.display = '';
    showQuestion();
  }

  function showQuestion() {
    const q = questions[currentQ];
    numEl.textContent = currentQ + 1;
    questionEl.textContent = q.q;
    optionsEl.innerHTML = '';
    q.opts.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt';
      btn.textContent = opt;
      btn.addEventListener('click', () => selectAnswer(i, q.ans, btn));
      optionsEl.appendChild(btn);
    });
  }

  function selectAnswer(selected, correct, btn) {
    // Disable all options
    optionsEl.querySelectorAll('.quiz-opt').forEach((b) => { b.disabled = true; });
    if (selected === correct) {
      btn.classList.add('correct');
      score++;
      scoreEl.textContent = score;
    } else {
      btn.classList.add('wrong');
      optionsEl.querySelectorAll('.quiz-opt')[correct].classList.add('correct');
    }
    setTimeout(() => {
      currentQ++;
      if (currentQ >= questions.length) {
        showResult();
      } else {
        showQuestion();
      }
    }, 1100);
  }

  function showResult() {
    document.getElementById('quizContainer').style.display = 'none';
    finalScoreEl.textContent = score;
    resultEl.classList.remove('hidden');
  }

  document.getElementById('quizRestart').addEventListener('click', startQuiz);
  document.getElementById('quizPlayAgain').addEventListener('click', startQuiz);
  startQuiz();
}

// =============================================
// INIT ALL GAMES
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  initGameTabs();
  initMemoryGame();
  initTypingGame();
  initSnakeGame();
  initQuizGame();
});
