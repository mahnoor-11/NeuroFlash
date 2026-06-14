// ===== GAME MODE =====
let playMode = 'all';
let scores = { game1: 0, game2: 0, game3: 0, game4: 0 };

// ===== SCREEN NAVIGATION =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
}

function playAll() {
  playMode = 'all';
  scores = { game1: 0, game2: 0, game3: 0, game4: 0 };
  showScreen('screen-game1');
  resetGame1();
}

function playSingle(game) {
  playMode = 'single';
  scores = { game1: 0, game2: 0, game3: 0, game4: 0 };
  if (game === 'game1') { showScreen('screen-game1'); resetGame1(); }
  if (game === 'game2') { showScreen('screen-game2'); startGame2(); }
  if (game === 'game3') { showScreen('screen-game3'); startGame3(); }
  if (game === 'game4') { showScreen('screen-game4'); startGame4(); }
}

// ===== COUNTDOWN SYSTEM =====
let countdownInterval = null;

function startCountdown(spanId, seconds, onEnd) {
  stopCountdown();
  let remaining = seconds;
  document.getElementById(spanId).textContent = remaining;
  countdownInterval = setInterval(() => {
    remaining--;
    document.getElementById(spanId).textContent = remaining;
    if (remaining <= 0) {
      stopCountdown();
      onEnd();
    }
  }, 1000);
}

function stopCountdown() {
  clearInterval(countdownInterval);
}

// ===== GAME 1: NUMBER MEMORY =====
let numberToRemember = '';
let game1Phase = 'start';
let game1Round = 0;
let game1Score = 0;

function resetGame1() {
  game1Phase = 'start';
  game1Round = 0;
  game1Score = 0;
  document.getElementById('number-display').textContent = '';
  document.getElementById('number-input').style.display = 'none';
  document.getElementById('number-input').value = '';
  document.getElementById('game1-btn').textContent = 'Start';
}

function startGame1() {
  const btn = document.getElementById('game1-btn');
  const display = document.getElementById('number-display');
  const input = document.getElementById('number-input');

  if (game1Phase === 'start') {
    game1Round++;
    const digits = 4 + game1Round;
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    numberToRemember = Math.floor(
      Math.random() * (max - min) + min
    ).toString();

    display.textContent = numberToRemember;
    input.style.display = 'none';
    btn.textContent = "I've got it!";
    game1Phase = 'memorize';

    startCountdown('cnum1', 5, () => {
      display.textContent = '?????';
      input.style.display = 'block';
      input.value = '';
      input.focus();
      btn.textContent = 'Submit Answer';
      game1Phase = 'answer';
    });

  } else if (game1Phase === 'memorize') {
    stopCountdown();
    display.textContent = '?????';
    input.style.display = 'block';
    input.value = '';
    input.focus();
    btn.textContent = 'Submit Answer';
    game1Phase = 'answer';

  } else if (game1Phase === 'answer') {
    stopCountdown();
    const userAnswer = input.value.trim();
    if (userAnswer === numberToRemember) {
      game1Score += 100;
      display.textContent = '✅ Correct!';
    } else {
      display.textContent = '❌ ' + numberToRemember;
    }

    if (game1Round < 3) {
      btn.textContent = 'Next Round →';
      game1Phase = 'start';
    } else {
      scores.game1 = Math.round(game1Score / 3);
      btn.textContent = playMode === 'all'
        ? 'Next Game →' : 'See Result →';
      game1Phase = 'done';
    }

  } else if (game1Phase === 'done') {
    if (playMode === 'all') {
      showScreen('screen-game2');
      startGame2();
    } else {
      showResult();
    }
  }
}

// ===== GAME 2: MEMORY CARDS =====
const cardEmojis = ['🍎','🍎','🌟','🌟','🎯','🎯',
                    '🔥','🔥','💡','💡','🎨','🎨',
                    '🧠','🧠','⚡','⚡'];
let flippedCards = [];
let matchedPairs = 0;
let totalPairs = 8;
let canFlip = true;

function startGame2() {
  matchedPairs = 0;
  flippedCards = [];
  canFlip = true;
  const grid = document.getElementById('cards-grid');
  grid.innerHTML = '';

  const shuffled = [...cardEmojis].sort(() => Math.random() - 0.5);
  shuffled.forEach((emoji, i) => {
    const card = document.createElement('button');
    card.className = 'mem-card hidden-face';
    card.dataset.emoji = emoji;
    card.dataset.index = i;
    card.textContent = '🧠';
    card.onclick = () => flipCard(card);
    grid.appendChild(card);
  });

  startCountdown('cnum2', 60, () => {
    scores.game2 = Math.round((matchedPairs / totalPairs) * 100);
    endGame2();
  });
}

function flipCard(card) {
  if (!canFlip) return;
  if (card.classList.contains('flipped')) return;
  if (card.classList.contains('matched')) return;

  card.classList.add('flipped');
  card.classList.remove('hidden-face');
  card.textContent = card.dataset.emoji;
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    canFlip = false;
    const [a, b] = flippedCards;
    if (a.dataset.emoji === b.dataset.emoji) {
      a.classList.add('matched');
      b.classList.add('matched');
      matchedPairs++;
      flippedCards = [];
      canFlip = true;
      if (matchedPairs === totalPairs) {
        stopCountdown();
        scores.game2 = 100;
        endGame2();
      }
    } else {
      setTimeout(() => {
        a.classList.remove('flipped');
        b.classList.remove('flipped');
        a.classList.add('hidden-face');
        b.classList.add('hidden-face');
        a.textContent = '🧠';
        b.textContent = '🧠';
        flippedCards = [];
        canFlip = true;
      }, 900);
    }
  }
}

function endGame2() {
  if (playMode === 'all') {
    setTimeout(() => {
      showScreen('screen-game3');
      startGame3();
    }, 800);
  } else {
    setTimeout(showResult, 800);
  }
}

// ===== GAME 3: COLOR MATCH =====
const colors = ['red','blue','green','orange','purple','pink'];
let game3Count = 0;
let game3Score = 0;
let correctAnswer3 = false;

function startGame3() {
  game3Count = 0;
  game3Score = 0;
  document.getElementById('game3-score').textContent = 'Round: 0/8';
  nextColorRound();
}

function nextColorRound() {
  if (game3Count >= 8) {
    stopCountdown();
    scores.game3 = Math.round((game3Score / 8) * 100);
    if (playMode === 'all') {
      setTimeout(() => {
        showScreen('screen-game4');
        startGame4();
      }, 500);
    } else {
      setTimeout(showResult, 500);
    }
    return;
  }

  const word = colors[Math.floor(Math.random() * colors.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  correctAnswer3 = (word === color);

  const display = document.getElementById('color-word');
  display.textContent = word.toUpperCase();
  display.style.color = color;
  game3Count++;

  document.getElementById('game3-score').textContent =
    'Round: ' + game3Count + '/8';

  startCountdown('cnum3', 5, () => {
    nextColorRound();
  });
}

function colorAnswer(userSaidYes) {
  stopCountdown();
  if (userSaidYes === correctAnswer3) game3Score++;
  nextColorRound();
}

// ===== GAME 4: WORD SCRAMBLE =====
const wordList = [
  'brain','flash','speed','think','smart','focus',
  'logic','swift','sharp','quick','power','grasp',
  'nerve','vivid','agile','alert','brisk','clever',
  'rapid','crisp','light','minds','pulse','spark',
  'trace','store','learn','solve','judge','build'
];
let currentWord = '';
let game4Score = 0;
let game4Count = 0;

function startGame4() {
  game4Score = 0;
  game4Count = 0;
  document.getElementById('game4-score').textContent = 'Score: 0/5';
  nextScramble();
}

function scrambleWord(word) {
  let s = word.split('').sort(() => Math.random() - 0.5).join('');
  while (s === word) {
    s = word.split('').sort(() => Math.random() - 0.5).join('');
  }
  return s;
}

function nextScramble() {
  if (game4Count >= 5) {
    stopCountdown();
    scores.game4 = Math.round((game4Score / 5) * 100);
    setTimeout(showResult, 500);
    return;
  }
  currentWord = wordList[Math.floor(Math.random() * wordList.length)];
  document.getElementById('scrambled-word').textContent =
    scrambleWord(currentWord).toUpperCase();
  document.getElementById('scramble-input').value = '';
  game4Count++;
  document.getElementById('game4-score').textContent =
    'Score: ' + game4Score + '/' + game4Count;

  startCountdown('cnum4', 10, () => {
    nextScramble();
  });
}

function checkScramble() {
  stopCountdown();
  const answer = document.getElementById('scramble-input')
    .value.toLowerCase().trim();
  if (answer === currentWord) game4Score++;
  nextScramble();
}

// ===== SHOW RESULT =====
function showResult() {
  showScreen('screen-result');

  const played = [scores.game1, scores.game2,
                  scores.game3, scores.game4];
  const total = played.reduce((a, b) => a + b, 0);
  const avg = Math.round(total / 4);

  let age, msg;
  if (avg >= 90) { age = '18'; msg = '🔥 Lightning fast brain!'; }
  else if (avg >= 75) { age = '22'; msg = '⚡ Sharp and quick!'; }
  else if (avg >= 60) { age = '28'; msg = '🧠 Solid brain power!'; }
  else if (avg >= 45) { age = '35'; msg = '💪 Good but room to grow!'; }
  else { age = '45'; msg = '😅 Keep practicing!'; }

  document.getElementById('result-age').textContent = age;
  document.getElementById('result-msg').textContent = msg;

  setTimeout(() => {
    fillBar('bar1', 'num1', scores.game1);
    fillBar('bar2', 'num2', scores.game2);
    fillBar('bar3', 'num3', scores.game3);
    fillBar('bar4', 'num4', scores.game4);
    fillBar('bar-overall', 'num-overall', avg);
  }, 400);
}

function fillBar(barId, numId, percent) {
  document.getElementById(barId).style.width = percent + '%';
  document.getElementById(numId).textContent = percent + '%';
}