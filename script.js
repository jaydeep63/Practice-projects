const statusText = document.getElementById('status');
const cells = Array.from(document.querySelectorAll('.cell'));
const resetButton = document.getElementById('resetButton');
const confettiContainer = document.getElementById('confetti');

const winningPatterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let boardState;
let currentPlayer;
let gameActive;
let audioContext;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

function playTone(frequency, duration, type = 'square') {
  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);

  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration + 0.02);
}

function playClickSound(player) {
  if (!window.AudioContext && !window.webkitAudioContext) {
    return;
  }

  const frequency = player === 'X' ? 440 : 660;
  playTone(frequency, 0.1, 'triangle');
}

function playBuzzerSound() {
  if (!window.AudioContext && !window.webkitAudioContext) {
    return;
  }

  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = 'sawtooth';
  oscillator.frequency.value = 120;
  gain.gain.setValueAtTime(0.01, context.currentTime);
  gain.gain.linearRampToValueAtTime(0.16, context.currentTime + 0.05);
  gain.gain.linearRampToValueAtTime(0.001, context.currentTime + 0.8);

  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.8);
}

function createConfettiPiece() {
  const piece = document.createElement('div');
  const colorSet = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa'];
  piece.className = 'confetti-piece';
  piece.style.color = colorSet[Math.floor(Math.random() * colorSet.length)];
  piece.style.left = `${Math.random() * 100}%`;
  piece.style.top = `${Math.random() * 20 + 10}%`;
  piece.style.transform = `translateX(${Math.random() * 20 - 10}px) rotate(${Math.random() * 360}deg)`;
  piece.style.animationDuration = `${0.9 + Math.random() * 0.4}s`;
  piece.style.animationDelay = `${Math.random() * 0.15}s`;
  return piece;
}

function createPopperPiece(x, y) {
  const piece = document.createElement('div');
  const colorSet = ['#f97316', '#facc15', '#22c55e', '#38bdf8', '#f472b6'];
  piece.className = 'popper-piece';
  piece.style.color = colorSet[Math.floor(Math.random() * colorSet.length)];
  piece.style.left = `${x}px`;
  piece.style.top = `${y}px`;
  piece.style.animationDuration = `${0.75 + Math.random() * 0.25}s`;
  piece.style.animationDelay = `${Math.random() * 0.05}s`;
  return piece;
}

function showPartyPoppers() {
  confettiContainer.innerHTML = '';

  for (let i = 0; i < 24; i += 1) {
    confettiContainer.appendChild(createConfettiPiece());
  }

  const rect = document.body.getBoundingClientRect();
  for (let i = 0; i < 16; i += 1) {
    const x = rect.width * 0.5 + (Math.random() * 220 - 110);
    const y = rect.height * 0.12 + (Math.random() * 40 - 20);
    confettiContainer.appendChild(createPopperPiece(x, y));
  }

  setTimeout(() => {
    confettiContainer.innerHTML = '';
  }, 1300);
}

function initializeGame() {
  boardState = Array(9).fill('');
  currentPlayer = 'X';
  gameActive = true;
  statusText.textContent = `Player ${currentPlayer}'s turn`;
  statusText.className = '';
  confettiContainer.innerHTML = '';

  cells.forEach((cell) => {
    cell.textContent = '';
    cell.disabled = false;
  });
}

function handleCellClick(event) {
  const cell = event.target;
  const index = Number(cell.dataset.index);

  if (!gameActive || boardState[index]) {
    return;
  }

  boardState[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.disabled = true;
  playClickSound(currentPlayer);

  if (checkForWinner()) {
    gameActive = false;
    statusText.textContent = `Player ${currentPlayer} wins!`;
    statusText.classList.add('status-win');
    playBuzzerSound();
    showPartyPoppers();
    return;
  }

  if (boardState.every((value) => value)) {
    gameActive = false;
    statusText.textContent = "It's a draw!";
    statusText.classList.add('status-draw');
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

function checkForWinner() {
  return winningPatterns.some((pattern) => {
    const [a, b, c] = pattern;
    return (
      boardState[a] &&
      boardState[a] === boardState[b] &&
      boardState[a] === boardState[c]
    );
  });
}

cells.forEach((cell) => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', initializeGame);

initializeGame();
