'use strict';

var utils = require('./utils');
var piece = require('./piece');
var PIECE_VALUES = utils.PIECE_VALUES;
var POS_VALUES = utils.POS_VALUES;
var RED = utils.RED;
var BLACK = utils.BLACK;
var copyBoard = utils.copyBoard;
var getAllMoves = piece.getAllMoves;
var getRawMoves = piece.getRawMoves;

function evaluateBoard(bd, color, diff) {
  var score = 0;
  for (var r = 0; r < 10; r++) {
    for (var c = 0; c < 9; c++) {
      var p = bd[r][c];
      if (!p) continue;
      var val = PIECE_VALUES[p.type] * 10;
      var upperType = p.type.toUpperCase();
      if (POS_VALUES[upperType]) {
        var posRow = p.color === RED ? r : 9 - r;
        val += POS_VALUES[upperType][posRow][c];
      }
      if (p.color === color) score += val;
      else score -= val;
    }
  }
  if (diff >= 2) {
    var mobility = 0;
    for (var r = 0; r < 10; r++) {
      for (var c = 0; c < 9; c++) {
        if (bd[r][c] && bd[r][c].color === color) {
          mobility += getRawMoves(r, c, bd).length;
        }
      }
    }
    score += mobility * 2;
  }
  return score;
}

function minimax(bd, depth, alpha, beta, maximizing, aiColor, diff) {
  if (depth === 0) return evaluateBoard(bd, aiColor, diff);

  var color = maximizing ? aiColor : (aiColor === RED ? BLACK : RED);
  var moves = getAllMoves(color, bd);

  if (moves.length === 0) return maximizing ? -99999 : 99999;

  // Move ordering: captures first
  moves.sort(function(a, b) {
    var capA = bd[a.to[0]][a.to[1]] ? PIECE_VALUES[bd[a.to[0]][a.to[1]].type] : 0;
    var capB = bd[b.to[0]][b.to[1]] ? PIECE_VALUES[bd[b.to[0]][b.to[1]].type] : 0;
    return capB - capA;
  });

  var i, move, tempBoard, ev;
  if (maximizing) {
    var maxEval = -Infinity;
    for (i = 0; i < moves.length; i++) {
      move = moves[i];
      tempBoard = copyBoard(bd);
      tempBoard[move.to[0]][move.to[1]] = tempBoard[move.from[0]][move.from[1]];
      tempBoard[move.from[0]][move.from[1]] = null;
      ev = minimax(tempBoard, depth - 1, alpha, beta, false, aiColor, diff);
      if (ev > maxEval) maxEval = ev;
      if (ev > alpha) alpha = ev;
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    var minEval = Infinity;
    for (i = 0; i < moves.length; i++) {
      move = moves[i];
      tempBoard = copyBoard(bd);
      tempBoard[move.to[0]][move.to[1]] = tempBoard[move.from[0]][move.from[1]];
      tempBoard[move.from[0]][move.from[1]] = null;
      ev = minimax(tempBoard, depth - 1, alpha, beta, true, aiColor, diff);
      if (ev < minEval) minEval = ev;
      if (ev < beta) beta = ev;
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function findBestMove(board, difficulty) {
  var depthMap = { 1: 2, 2: 3, 3: 4 };
  var depth = depthMap[difficulty];
  var moves = getAllMoves(BLACK, board);

  if (moves.length === 0) return null;

  if (difficulty === 1) {
    // Shuffle for randomness in easy mode
    for (var i = moves.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = moves[i];
      moves[i] = moves[j];
      moves[j] = temp;
    }
  }

  var bestMove = null;
  var bestScore = -Infinity;

  for (var i = 0; i < moves.length; i++) {
    var move = moves[i];
    var tempBoard = copyBoard(board);
    tempBoard[move.to[0]][move.to[1]] = tempBoard[move.from[0]][move.from[1]];
    tempBoard[move.from[0]][move.from[1]] = null;
    var score = minimax(tempBoard, depth - 1, -Infinity, Infinity, false, BLACK, difficulty);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

module.exports = {
  findBestMove: findBestMove
};
