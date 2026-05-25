'use strict';

var utils = require('./utils');
var RED = utils.RED;
var BLACK = utils.BLACK;
var copyBoard = utils.copyBoard;

function getKingMoves(row, col, color, bd) {
  var moves = [];
  var dirs = [[0,1],[0,-1],[1,0],[-1,0]];
  var rowMin = color === BLACK ? 0 : 7;
  var rowMax = color === BLACK ? 2 : 9;
  for (var i = 0; i < dirs.length; i++) {
    var nr = row + dirs[i][0], nc = col + dirs[i][1];
    if (nr >= rowMin && nr <= rowMax && nc >= 3 && nc <= 5) {
      if (!bd[nr][nc] || bd[nr][nc].color !== color) moves.push([nr, nc]);
    }
  }
  // Flying general rule
  var otherKingType = color === RED ? 'k' : 'K';
  var step = color === RED ? -1 : 1;
  var r = row + step;
  while (r >= 0 && r <= 9) {
    if (bd[r][col]) {
      if (bd[r][col].type === otherKingType) moves.push([r, col]);
      break;
    }
    r += step;
  }
  return moves;
}

function getAdvisorMoves(row, col, color, bd) {
  var moves = [];
  var dirs = [[1,1],[1,-1],[-1,1],[-1,-1]];
  var rowMin = color === BLACK ? 0 : 7;
  var rowMax = color === BLACK ? 2 : 9;
  for (var i = 0; i < dirs.length; i++) {
    var nr = row + dirs[i][0], nc = col + dirs[i][1];
    if (nr >= rowMin && nr <= rowMax && nc >= 3 && nc <= 5) {
      if (!bd[nr][nc] || bd[nr][nc].color !== color) moves.push([nr, nc]);
    }
  }
  return moves;
}

function getBishopMoves(row, col, color, bd) {
  var moves = [];
  var dirs = [[2,2],[2,-2],[-2,2],[-2,-2]];
  var rowMin = color === BLACK ? 0 : 5;
  var rowMax = color === BLACK ? 4 : 9;
  for (var i = 0; i < dirs.length; i++) {
    var dr = dirs[i][0], dc = dirs[i][1];
    var nr = row + dr, nc = col + dc;
    var br = row + dr / 2, bc = col + dc / 2;
    if (nr >= rowMin && nr <= rowMax && nc >= 0 && nc <= 8) {
      if (!bd[br][bc] && (!bd[nr][nc] || bd[nr][nc].color !== color)) {
        moves.push([nr, nc]);
      }
    }
  }
  return moves;
}

function getKnightMoves(row, col, color, bd) {
  var moves = [];
  var jumps = [[-2,-1],[-2,1],[2,-1],[2,1],[-1,-2],[-1,2],[1,-2],[1,2]];
  var blocks = [[-1,0],[-1,0],[1,0],[1,0],[0,-1],[0,1],[0,-1],[0,1]];
  for (var i = 0; i < jumps.length; i++) {
    var nr = row + jumps[i][0], nc = col + jumps[i][1];
    var br = row + blocks[i][0], bc = col + blocks[i][1];
    if (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 8) {
      if (!bd[br][bc] && (!bd[nr][nc] || bd[nr][nc].color !== color)) {
        moves.push([nr, nc]);
      }
    }
  }
  return moves;
}

function getRookMoves(row, col, color, bd) {
  var moves = [];
  var dirs = [[0,1],[0,-1],[1,0],[-1,0]];
  for (var d = 0; d < dirs.length; d++) {
    var dr = dirs[d][0], dc = dirs[d][1];
    var nr = row + dr, nc = col + dc;
    while (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 8) {
      if (!bd[nr][nc]) {
        moves.push([nr, nc]);
      } else {
        if (bd[nr][nc].color !== color) moves.push([nr, nc]);
        break;
      }
      nr += dr;
      nc += dc;
    }
  }
  return moves;
}

function getCannonMoves(row, col, color, bd) {
  var moves = [];
  var dirs = [[0,1],[0,-1],[1,0],[-1,0]];
  for (var d = 0; d < dirs.length; d++) {
    var dr = dirs[d][0], dc = dirs[d][1];
    var nr = row + dr, nc = col + dc;
    var jumped = false;
    while (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 8) {
      if (!bd[nr][nc]) {
        if (!jumped) moves.push([nr, nc]);
      } else {
        if (!jumped) {
          jumped = true;
        } else {
          if (bd[nr][nc].color !== color) moves.push([nr, nc]);
          break;
        }
      }
      nr += dr;
      nc += dc;
    }
  }
  return moves;
}

function getPawnMoves(row, col, color, bd) {
  var moves = [];
  if (color === RED) {
    if (row - 1 >= 0 && (!bd[row - 1][col] || bd[row - 1][col].color !== color))
      moves.push([row - 1, col]);
    if (row <= 4) {
      if (col - 1 >= 0 && (!bd[row][col - 1] || bd[row][col - 1].color !== color))
        moves.push([row, col - 1]);
      if (col + 1 <= 8 && (!bd[row][col + 1] || bd[row][col + 1].color !== color))
        moves.push([row, col + 1]);
    }
  } else {
    if (row + 1 <= 9 && (!bd[row + 1][col] || bd[row + 1][col].color !== color))
      moves.push([row + 1, col]);
    if (row >= 5) {
      if (col - 1 >= 0 && (!bd[row][col - 1] || bd[row][col - 1].color !== color))
        moves.push([row, col - 1]);
      if (col + 1 <= 8 && (!bd[row][col + 1] || bd[row][col + 1].color !== color))
        moves.push([row, col + 1]);
    }
  }
  return moves;
}

function getRawMoves(row, col, bd) {
  var piece = bd[row][col];
  if (!piece) return [];
  var type = piece.type.toLowerCase();
  var color = piece.color;
  switch (type) {
    case 'k': return getKingMoves(row, col, color, bd);
    case 'a': return getAdvisorMoves(row, col, color, bd);
    case 'b': return getBishopMoves(row, col, color, bd);
    case 'n': return getKnightMoves(row, col, color, bd);
    case 'r': return getRookMoves(row, col, color, bd);
    case 'c': return getCannonMoves(row, col, color, bd);
    case 'p': return getPawnMoves(row, col, color, bd);
  }
  return [];
}

function isInCheck(color, bd) {
  var kingPos = null;
  for (var r = 0; r < 10; r++) {
    for (var c = 0; c < 9; c++) {
      if (bd[r][c] && bd[r][c].color === color && bd[r][c].type.toLowerCase() === 'k') {
        kingPos = [r, c];
        break;
      }
    }
    if (kingPos) break;
  }
  if (!kingPos) return true;

  for (var r = 0; r < 10; r++) {
    for (var c = 0; c < 9; c++) {
      if (bd[r][c] && bd[r][c].color !== color) {
        var rawMoves = getRawMoves(r, c, bd);
        for (var i = 0; i < rawMoves.length; i++) {
          if (rawMoves[i][0] === kingPos[0] && rawMoves[i][1] === kingPos[1]) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

function getValidMoves(row, col, bd) {
  var piece = bd[row][col];
  if (!piece) return [];
  var rawMoves = getRawMoves(row, col, bd);
  var color = piece.color;
  var valid = [];
  for (var i = 0; i < rawMoves.length; i++) {
    var mr = rawMoves[i][0], mc = rawMoves[i][1];
    var tempBoard = copyBoard(bd);
    tempBoard[mr][mc] = tempBoard[row][col];
    tempBoard[row][col] = null;
    if (!isInCheck(color, tempBoard)) {
      valid.push([mr, mc]);
    }
  }
  return valid;
}

function getAllMoves(color, bd) {
  var moves = [];
  for (var r = 0; r < 10; r++) {
    for (var c = 0; c < 9; c++) {
      if (bd[r][c] && bd[r][c].color === color) {
        var pieceMoves = getValidMoves(r, c, bd);
        for (var i = 0; i < pieceMoves.length; i++) {
          moves.push({ from: [r, c], to: pieceMoves[i] });
        }
      }
    }
  }
  return moves;
}

module.exports = {
  getValidMoves: getValidMoves,
  getAllMoves: getAllMoves,
  isInCheck: isInCheck,
  getRawMoves: getRawMoves
};
