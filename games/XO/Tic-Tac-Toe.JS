let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;

function startGame() {
  // إخفاء التعليمات
  document.getElementById('instructions').style.display = 'none';

  // عرض منطقة اللعبة
  document.getElementById('game-area').style.display = 'block';

  // إعادة تعيين اللعبة وتهيئتها
  resetGame();
}

function resetGame() {
  // إعادة تعيين المتغيرات
  board = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = 'X';
  gameActive = true;

  // إعادة إظهار منطقة اللعبة وإخفاء الأنيميشن
  document.getElementById('game-area').style.display = 'block';
  document.getElementById('winner-animation').style.display = 'none';
  document.getElementById('computer-lost-animation').style.display = 'none';

  // تحديث حالة النص
  document.getElementById('status').textContent = 'دور اللاعب X';

  // إعادة رسم اللوحة
  renderBoard();
}

function renderBoard() {
  const boardDiv = document.getElementById('board');
  boardDiv.innerHTML = '';
  board.forEach((cell, index) => {
    const cellDiv = document.createElement('div');
    cellDiv.classList.add('cell');
    cellDiv.textContent = cell;
    cellDiv.onclick = () => handleCellClick(index);
    boardDiv.appendChild(cellDiv);
  });
}

function handleCellClick(index) {
  if (!gameActive || board[index] !== '' || currentPlayer === 'O') return;

  board[index] = currentPlayer;
  renderBoard();

  if (checkWinner()) {
    showWinnerAnimation();
    return;
  }

  if (!board.includes('')) {
    document.getElementById('status').textContent = 'تعادل!';
    gameActive = false;
    return;
  }

  currentPlayer = 'O';
  document.getElementById('status').textContent = `دور الكمبيوتر ${currentPlayer}`;
  setTimeout(() => computerMove(), 500);
}

function computerMove() {
  const difficulty = document.getElementById('difficulty').value;

  let move;
  if (difficulty === 'easy') {
    move = getRandomMove();
  } else if (difficulty === 'medium') {
    move = getSmartMove();
  } else if (difficulty === 'hard') {
    move = getBestMove();
  }

  board[move] = currentPlayer;
  renderBoard();

  if (checkWinner()) {
    document.getElementById('status').textContent = `فاز اللاعب ${currentPlayer}`;
    gameActive = false;
    return;
  }

  if (!board.includes('')) {
    document.getElementById('status').textContent = 'تعادل!';
    gameActive = false;
    return;
  }

  currentPlayer = 'X';
  document.getElementById('status').textContent = `دور اللاعب ${currentPlayer}`;
}

function getRandomMove() {
  const availableMoves = board.map((cell, index) => (cell === '' ? index : null)).filter(index => index !== null);
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function getSmartMove() {
  for (let i = 0; i < board.length; i++) {
    if (board[i] === '') {
      board[i] = 'O';
      if (checkWinner()) {
        board[i] = '';
        return i;
      }
      board[i] = '';
    }
  }
  for (let i = 0; i < board.length; i++) {
    if (board[i] === '') {
      board[i] = 'X';
      if (checkWinner()) {
        board[i] = '';
        return i;
      }
      board[i] = '';
    }
  }
  return getRandomMove();
}

function getBestMove() {
  return minimax(board, 'O').index;
}

function minimax(newBoard, player) {
  const availableMoves = newBoard.map((cell, index) => (cell === '' ? index : null)).filter(index => index !== null);

  if (checkWinner(newBoard, 'X')) return { score: -10 };
  if (checkWinner(newBoard, 'O')) return { score: 10 };
  if (availableMoves.length === 0) return { score: 0 };

  const moves = [];

  for (let i = 0; i < availableMoves.length; i++) {
    const move = {};
    move.index = availableMoves[i];
    newBoard[availableMoves[i]] = player;

    if (player === 'O') {
      move.score = minimax(newBoard, 'X').score;
    } else {
      move.score = minimax(newBoard, 'O').score;
    }

    newBoard[availableMoves[i]] = '';
    moves.push(move);
  }

  let bestMove;
  if (player === 'O') {
    let bestScore = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
}

function checkWinner(boardToCheck = board, player = currentPlayer) {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  return winningCombinations.some(combination => {
    const [a, b, c] = combination;
    return (
      boardToCheck[a] === player &&
      boardToCheck[a] === boardToCheck[b] &&
      boardToCheck[a] === boardToCheck[c]
    );
  });
}

function showWinnerAnimation() {
  gameActive = false;
  document.getElementById('game-area').style.display = 'none';
  document.getElementById('winner-animation').style.display = 'flex';

  // بعد مدة قصيرة، تظهر الرسالة
  setTimeout(() => {
    const winnerMessage = document.createElement('p');
    winnerMessage.textContent = 'مبروك! لقد فزت!';
    document.getElementById('winner-animation').appendChild(winnerMessage);
  }, 1500); // تأخير 1.5 ثانية قبل الرسالة
}

function toggleTheme() {
  const currentTheme = document.body.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.body.setAttribute("data-theme", newTheme);
}

// Initialize
document.body.setAttribute("data-theme", "dark");
