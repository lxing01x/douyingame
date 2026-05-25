'use strict';

const { screenWidth, screenHeight, pixelRatio } = tt.getSystemInfoSync();

const canvas = tt.createCanvas();
canvas.width = screenWidth * pixelRatio;
canvas.height = screenHeight * pixelRatio;

const ctx = canvas.getContext('2d');
ctx.scale(pixelRatio, pixelRatio);

require('./js/main')(canvas, ctx, screenWidth, screenHeight);
