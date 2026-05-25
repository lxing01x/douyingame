'use strict';

const RED = 'red';
const BLACK = 'black';

const PIECE_NAMES = {
  k: '将', K: '帅',
  a: '士', A: '仕',
  b: '象', B: '相',
  n: '马', N: '馬',
  r: '车', R: '車',
  c: '炮', C: '砲',
  p: '卒', P: '兵'
};

const PIECE_VALUES = {
  k: 10000, K: 10000,
  a: 20, A: 20,
  b: 20, B: 20,
  n: 40, N: 40,
  r: 90, R: 90,
  c: 45, C: 45,
  p: 10, P: 10
};

const POS_VALUES = {
  P: [
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [2,4,6,8,10,8,6,4,2],
    [4,6,10,14,16,14,10,6,4],
    [6,10,16,20,22,20,16,10,6],
    [10,16,22,28,30,28,22,16,10],
    [14,20,28,34,36,34,28,20,14],
    [18,24,32,38,40,38,32,24,18],
    [0,0,0,0,0,0,0,0,0]
  ],
  N: [
    [0,2,4,4,0,4,4,2,0],
    [2,8,12,12,12,12,12,8,2],
    [4,10,16,16,16,16,16,10,4],
    [4,12,16,18,18,18,16,12,4],
    [4,12,16,18,20,18,16,12,4],
    [4,12,16,18,20,18,16,12,4],
    [4,12,16,18,18,18,16,12,4],
    [4,10,16,16,16,16,16,10,4],
    [2,8,12,12,12,12,12,8,2],
    [0,2,4,4,0,4,4,2,0]
  ],
  R: [
    [14,14,14,16,18,16,14,14,14],
    [16,18,18,20,22,20,18,18,16],
    [14,16,16,18,20,18,16,16,14],
    [14,16,16,18,20,18,16,16,14],
    [14,16,16,18,20,18,16,16,14],
    [14,16,16,18,20,18,16,16,14],
    [14,16,16,18,20,18,16,16,14],
    [14,16,16,18,20,18,16,16,14],
    [16,18,18,20,22,20,18,18,16],
    [14,14,14,16,18,16,14,14,14]
  ],
  C: [
    [6,6,6,10,12,10,6,6,6],
    [6,8,8,10,12,10,8,8,6],
    [6,8,10,12,14,12,10,8,6],
    [8,10,12,14,16,14,12,10,8],
    [8,10,12,14,16,14,12,10,8],
    [8,10,12,14,16,14,12,10,8],
    [8,10,12,14,16,14,12,10,8],
    [6,8,10,12,14,12,10,8,6],
    [6,8,8,10,12,10,8,8,6],
    [6,6,6,10,12,10,6,6,6]
  ]
};

function copyBoard(board) {
  return board.map(function(row) { return row.slice(); });
}

function createInitialBoard() {
  var board = [];
  for (var i = 0; i < 10; i++) {
    board.push(new Array(9).fill(null));
  }
  board[0] = [
    {type:'r',color:BLACK},{type:'n',color:BLACK},{type:'b',color:BLACK},
    {type:'a',color:BLACK},{type:'k',color:BLACK},{type:'a',color:BLACK},
    {type:'b',color:BLACK},{type:'n',color:BLACK},{type:'r',color:BLACK}
  ];
  board[2][1] = {type:'c',color:BLACK};
  board[2][7] = {type:'c',color:BLACK};
  board[3][0] = {type:'p',color:BLACK};
  board[3][2] = {type:'p',color:BLACK};
  board[3][4] = {type:'p',color:BLACK};
  board[3][6] = {type:'p',color:BLACK};
  board[3][8] = {type:'p',color:BLACK};

  board[9] = [
    {type:'R',color:RED},{type:'N',color:RED},{type:'B',color:RED},
    {type:'A',color:RED},{type:'K',color:RED},{type:'A',color:RED},
    {type:'B',color:RED},{type:'N',color:RED},{type:'R',color:RED}
  ];
  board[7][1] = {type:'C',color:RED};
  board[7][7] = {type:'C',color:RED};
  board[6][0] = {type:'P',color:RED};
  board[6][2] = {type:'P',color:RED};
  board[6][4] = {type:'P',color:RED};
  board[6][6] = {type:'P',color:RED};
  board[6][8] = {type:'P',color:RED};

  return board;
}

module.exports = {
  RED: RED,
  BLACK: BLACK,
  PIECE_NAMES: PIECE_NAMES,
  PIECE_VALUES: PIECE_VALUES,
  POS_VALUES: POS_VALUES,
  copyBoard: copyBoard,
  createInitialBoard: createInitialBoard
};
