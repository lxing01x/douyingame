'use strict';

var utils = require('./utils');
var pieceModule = require('./piece');
var ai = require('./ai');
var BoardRenderer = require('./board');

var RED = utils.RED;
var BLACK = utils.BLACK;
var createInitialBoard = utils.createInitialBoard;
var getValidMoves = pieceModule.getValidMoves;
var getAllMoves = pieceModule.getAllMoves;
var isInCheck = pieceModule.isInCheck;
var findBestMove = ai.findBestMove;

var SCENE_MENU = 0;
var SCENE_PLAYING = 1;

module.exports = function(canvas, ctx, screenWidth, screenHeight) {
  var scene = SCENE_MENU;
  var difficulty = 2;
  var board = null;
  var currentPlayer = RED;
  var selected = null;
  var validMoves = [];
  var gameOver = false;
  var aiThinking = false;
  var canUndo = false;
  var undoData = null;
  var lastMoveHighlight = null;
  var statusText = '';
  var renderer = new BoardRenderer(ctx, screenWidth, screenHeight);

  // Menu button areas
  var menuButtons = [];
  var gameButtons = [];

  function calcMenuButtons() {
    var btnW = 180;
    var btnH = 50;
    var centerX = screenWidth / 2;
    var startY = screenHeight / 2 - 40;
    var gap = 20;
    menuButtons = [
      { x: centerX - btnW / 2, y: startY, w: btnW, h: btnH, label: '简 单', diff: 1 },
      { x: centerX - btnW / 2, y: startY + btnH + gap, w: btnW, h: btnH, label: '中 等', diff: 2 },
      { x: centerX - btnW / 2, y: startY + (btnH + gap) * 2, w: btnW, h: btnH, label: '困 难', diff: 3 }
    ];
  }

  function calcGameButtons() {
    var btnW = 80;
    var btnH = 38;
    var gap = 12;
    var totalW = btnW * 3 + gap * 2;
    var startX = (screenWidth - totalW) / 2;
    var y = renderer.buttonsY;
    gameButtons = [
      { x: startX, y: y, w: btnW, h: btnH, label: '悔棋', action: 'undo' },
      { x: startX + btnW + gap, y: y, w: btnW, h: btnH, label: '重开', action: 'restart' },
      { x: startX + (btnW + gap) * 2, y: y, w: btnW, h: btnH, label: '菜单', action: 'menu' }
    ];
  }

  function startGame(diff) {
    difficulty = diff;
    board = createInitialBoard();
    currentPlayer = RED;
    selected = null;
    validMoves = [];
    gameOver = false;
    aiThinking = false;
    canUndo = false;
    undoData = null;
    lastMoveHighlight = null;
    statusText = '红方走棋';
    scene = SCENE_PLAYING;
    calcGameButtons();
  }

  function doUndo() {
    if (!canUndo || !undoData || gameOver) return;
    // Undo AI move
    if (undoData.aiFrom) {
      board[undoData.aiFrom[0]][undoData.aiFrom[1]] = undoData.aiPiece;
      board[undoData.aiTo[0]][undoData.aiTo[1]] = undoData.aiCaptured;
    }
    // Undo player move
    board[undoData.playerFrom[0]][undoData.playerFrom[1]] = undoData.playerPiece;
    board[undoData.playerTo[0]][undoData.playerTo[1]] = undoData.playerCaptured;
    currentPlayer = RED;
    canUndo = false;
    undoData = null;
    selected = null;
    validMoves = [];
    lastMoveHighlight = null;
    statusText = '红方走棋';
  }

  function handlePlayingTouch(x, y) {
    if (gameOver || aiThinking) return;
    if (currentPlayer !== RED) return;

    // Check game buttons
    for (var i = 0; i < gameButtons.length; i++) {
      var btn = gameButtons[i];
      if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
        if (btn.action === 'undo') doUndo();
        else if (btn.action === 'restart') startGame(difficulty);
        else if (btn.action === 'menu') { scene = SCENE_MENU; }
        return;
      }
    }

    // Board interaction — getGridPos subtracts offsetX/offsetY internally
    var pos = renderer.getGridPos(x, y);
    if (!pos) return;
    var row = pos[0], col = pos[1];

    if (selected) {
      var isValid = false;
      for (var i = 0; i < validMoves.length; i++) {
        if (validMoves[i][0] === row && validMoves[i][1] === col) {
          isValid = true;
          break;
        }
      }
      if (isValid) {
        // Execute player move
        var playerPiece = board[selected[0]][selected[1]];
        var playerCaptured = board[row][col];
        undoData = {
          playerFrom: [selected[0], selected[1]],
          playerTo: [row, col],
          playerPiece: playerPiece,
          playerCaptured: playerCaptured,
          aiFrom: null, aiTo: null, aiPiece: null, aiCaptured: null
        };

        board[row][col] = board[selected[0]][selected[1]];
        board[selected[0]][selected[1]] = null;
        lastMoveHighlight = { fromRow: selected[0], fromCol: selected[1], toRow: row, toCol: col };

        selected = null;
        validMoves = [];

        if (playerCaptured && playerCaptured.type === 'k') {
          gameOver = true;
          statusText = '红方胜利！';
          canUndo = false;
          tt.showModal({
            title: '游戏结束',
            content: '恭喜，红方胜利！',
            showCancel: false,
            confirmText: '确定'
          });
          return;
        }

        currentPlayer = BLACK;
        statusText = '电脑思考中...';
        aiThinking = true;

        setTimeout(function() { doAiMove(); }, 200);
      } else if (board[row][col] && board[row][col].color === RED) {
        selected = [row, col];
        validMoves = getValidMoves(row, col, board);
      } else {
        selected = null;
        validMoves = [];
      }
    } else {
      if (board[row][col] && board[row][col].color === RED) {
        selected = [row, col];
        validMoves = getValidMoves(row, col, board);
      }
    }
  }

  function doAiMove() {
    if (gameOver) return;

    var bestMove = findBestMove(board, difficulty);
    if (!bestMove) {
      gameOver = true;
      statusText = '红方胜利！';
      tt.showModal({
        title: '游戏结束',
        content: '恭喜，红方胜利！',
        showCancel: false,
        confirmText: '确定'
      });
      aiThinking = false;
      return;
    }

    var aiPiece = board[bestMove.from[0]][bestMove.from[1]];
    var aiCaptured = board[bestMove.to[0]][bestMove.to[1]];

    // Store for undo
    if (undoData) {
      undoData.aiFrom = bestMove.from;
      undoData.aiTo = bestMove.to;
      undoData.aiPiece = aiPiece;
      undoData.aiCaptured = aiCaptured;
    }

    board[bestMove.to[0]][bestMove.to[1]] = board[bestMove.from[0]][bestMove.from[1]];
    board[bestMove.from[0]][bestMove.from[1]] = null;
    lastMoveHighlight = { fromRow: bestMove.from[0], fromCol: bestMove.from[1], toRow: bestMove.to[0], toCol: bestMove.to[1] };

    canUndo = true;
    aiThinking = false;

    if (aiCaptured && aiCaptured.type === 'K') {
      gameOver = true;
      statusText = '黑方胜利！';
      canUndo = false;
      tt.showModal({
        title: '游戏结束',
        content: '很遗憾，黑方胜利！',
        showCancel: false,
        confirmText: '确定'
      });
      return;
    }

    currentPlayer = RED;
    var redMoves = getAllMoves(RED, board);
    if (redMoves.length === 0) {
      gameOver = true;
      statusText = '黑方胜利！';
      canUndo = false;
      tt.showModal({
        title: '游戏结束',
        content: '很遗憾，黑方胜利！',
        showCancel: false,
        confirmText: '确定'
      });
    } else if (isInCheck(RED, board)) {
      statusText = '将军！红方走棋';
    } else {
      statusText = '红方走棋';
    }
  }

  // --- Rendering ---

  function renderMenu() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, screenWidth, screenHeight);

    // Title
    ctx.fillStyle = '#f5c518';
    ctx.font = 'bold 36px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('中国象棋', screenWidth / 2, screenHeight / 2 - 130);

    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#aaa';
    ctx.fillText('人机对战', screenWidth / 2, screenHeight / 2 - 85);

    // Buttons
    for (var i = 0; i < menuButtons.length; i++) {
      var btn = menuButtons[i];
      ctx.strokeStyle = '#f5c518';
      ctx.lineWidth = 2;
      ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
      ctx.fillStyle = '#f5c518';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
    }
  }

  function renderPlaying() {
    renderer.draw(board, selected, validMoves, lastMoveHighlight);

    // Status bar
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(statusText, screenWidth / 2, renderer.statusY);

    // Game buttons
    for (var i = 0; i < gameButtons.length; i++) {
      var btn = gameButtons[i];
      var disabled = (btn.action === 'undo' && !canUndo);
      ctx.strokeStyle = disabled ? 'rgba(245,197,24,0.3)' : '#f5c518';
      ctx.lineWidth = 1;
      ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
      ctx.fillStyle = disabled ? 'rgba(245,197,24,0.3)' : '#f5c518';
      ctx.font = '15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
    }
  }

  function render() {
    if (scene === SCENE_MENU) renderMenu();
    else renderPlaying();
  }

  // --- Event handling ---

  tt.onTouchStart(function(res) {
    if (!res.touches || res.touches.length === 0) return;
    var touch = res.touches[0];
    var x = touch.clientX;
    var y = touch.clientY;

    if (scene === SCENE_MENU) {
      for (var i = 0; i < menuButtons.length; i++) {
        var btn = menuButtons[i];
        if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
          startGame(btn.diff);
          return;
        }
      }
    } else if (scene === SCENE_PLAYING) {
      handlePlayingTouch(x, y);
    }
  });

  // --- Game Loop ---

  calcMenuButtons();

  function loop() {
    render();
    requestAnimationFrame(loop);
  }
  loop();
};
