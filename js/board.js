'use strict';

var utils = require('./utils');
var PIECE_NAMES = utils.PIECE_NAMES;
var RED = utils.RED;

function BoardRenderer(ctx, screenWidth, screenHeight) {
  this.ctx = ctx;
  this.screenWidth = screenWidth;
  this.screenHeight = screenHeight;
  this.calculate();
}

BoardRenderer.prototype.calculate = function() {
  var statusH = 36;
  var btnH = 38;
  var gap = 16;
  var totalMargin = statusH + gap + btnH + gap;
  var maxW = this.screenWidth - 20;
  var maxH = this.screenHeight - totalMargin - 40;
  this.cellSize = Math.min(Math.floor(maxW / 10), Math.floor(maxH / 11));
  this.padding = this.cellSize;
  this.pieceRadius = Math.floor(this.cellSize * 0.42);
  this.boardWidth = this.cellSize * 8 + this.padding * 2;
  this.boardHeight = this.cellSize * 9 + this.padding * 2;
  var totalContentH = statusH + this.boardHeight + gap + btnH;
  this.offsetX = (this.screenWidth - this.boardWidth) / 2;
  this.offsetY = (this.screenHeight - totalContentH) / 2 + statusH;
  this.statusY = this.offsetY - statusH / 2 - gap / 2;
  this.buttonsY = this.offsetY + this.boardHeight + gap;
};

BoardRenderer.prototype.getGridPos = function(touchX, touchY) {
  var x = touchX - this.offsetX;
  var y = touchY - this.offsetY;
  var col = Math.round((x - this.padding) / this.cellSize);
  var row = Math.round((y - this.padding) / this.cellSize);
  if (row >= 0 && row < 10 && col >= 0 && col < 9) return [row, col];
  return null;
};

BoardRenderer.prototype.draw = function(board, selected, validMoves, lastMoveInfo) {
  var ctx = this.ctx;
  var cell = this.cellSize;
  var pad = this.padding;
  var ox = this.offsetX;
  var oy = this.offsetY;

  // Clear background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);

  // Board background
  ctx.save();
  ctx.translate(ox, oy);

  ctx.fillStyle = '#d4a564';
  ctx.fillRect(0, 0, this.boardWidth, this.boardHeight);

  ctx.strokeStyle = '#4a3000';
  ctx.lineWidth = 1;

  // Horizontal lines
  for (var i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.moveTo(pad, pad + i * cell);
    ctx.lineTo(pad + 8 * cell, pad + i * cell);
    ctx.stroke();
  }
  // Vertical lines
  for (var j = 0; j < 9; j++) {
    ctx.beginPath();
    ctx.moveTo(pad + j * cell, pad);
    ctx.lineTo(pad + j * cell, pad + 4 * cell);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pad + j * cell, pad + 5 * cell);
    ctx.lineTo(pad + j * cell, pad + 9 * cell);
    ctx.stroke();
  }
  // River borders
  ctx.beginPath();
  ctx.moveTo(pad, pad + 4 * cell);
  ctx.lineTo(pad, pad + 5 * cell);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pad + 8 * cell, pad + 4 * cell);
  ctx.lineTo(pad + 8 * cell, pad + 5 * cell);
  ctx.stroke();

  // Palace diagonals
  ctx.beginPath();
  ctx.moveTo(pad + 3 * cell, pad);
  ctx.lineTo(pad + 5 * cell, pad + 2 * cell);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pad + 5 * cell, pad);
  ctx.lineTo(pad + 3 * cell, pad + 2 * cell);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pad + 3 * cell, pad + 7 * cell);
  ctx.lineTo(pad + 5 * cell, pad + 9 * cell);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pad + 5 * cell, pad + 7 * cell);
  ctx.lineTo(pad + 3 * cell, pad + 9 * cell);
  ctx.stroke();

  // River text
  ctx.fillStyle = '#4a3000';
  ctx.font = Math.floor(cell * 0.45) + 'px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('楚 河', pad + 2 * cell, pad + 4.5 * cell);
  ctx.fillText('汉 界', pad + 6 * cell, pad + 4.5 * cell);

  // Last move highlight
  if (lastMoveInfo) {
    ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(pad + lastMoveInfo.fromCol * cell, pad + lastMoveInfo.fromRow * cell, this.pieceRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(pad + lastMoveInfo.toCol * cell, pad + lastMoveInfo.toRow * cell, this.pieceRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Valid move indicators
  if (validMoves) {
    for (var i = 0; i < validMoves.length; i++) {
      var mr = validMoves[i][0], mc = validMoves[i][1];
      ctx.fillStyle = 'rgba(0, 200, 0, 0.4)';
      ctx.beginPath();
      ctx.arc(pad + mc * cell, pad + mr * cell, this.pieceRadius * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Pieces
  for (var r = 0; r < 10; r++) {
    for (var c = 0; c < 9; c++) {
      if (board[r][c]) {
        this.drawPiece(r, c, board[r][c], selected && selected[0] === r && selected[1] === c);
      }
    }
  }

  ctx.restore();
};

BoardRenderer.prototype.drawPiece = function(row, col, piece, isSelected) {
  var ctx = this.ctx;
  var cell = this.cellSize;
  var pad = this.padding;
  var radius = this.pieceRadius;
  var x = pad + col * cell;
  var y = pad + row * cell;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.arc(x + 2, y + 2, radius, 0, Math.PI * 2);
  ctx.fill();

  // Body gradient
  var grad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
  grad.addColorStop(0, '#fff8dc');
  grad.addColorStop(1, '#d2b48c');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Outer border
  ctx.strokeStyle = isSelected ? '#00ff00' : '#4a3000';
  ctx.lineWidth = isSelected ? 3 : 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Inner ring
  ctx.strokeStyle = piece.color === RED ? '#cc0000' : '#222222';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.78, 0, Math.PI * 2);
  ctx.stroke();

  // Text
  ctx.fillStyle = piece.color === RED ? '#cc0000' : '#222222';
  ctx.font = 'bold ' + Math.floor(radius * 1.1) + 'px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(PIECE_NAMES[piece.type], x, y + 1);
};

module.exports = BoardRenderer;
