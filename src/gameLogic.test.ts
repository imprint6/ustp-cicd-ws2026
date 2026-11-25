import { describe, expect, it } from 'vitest';
import {
  COLUMNS,
  ROWS,
  SHAPES,
  calculateDropInterval,
  calculateScoreReward,
  clearCompletedRows,
  createBoard,
  createPiece,
  hasCollision,
  rotate,
  type PieceType,
} from './gameLogic';

describe('Tetris game logic', () => {
  it('creates an empty 20x10 board', () => {
    const board = createBoard();
    expect(board).toHaveLength(ROWS);
    expect(board.every((row) => row.length === COLUMNS && row.every((cell) => cell === null))).toBe(true);
  });

  it('spawns pieces horizontally centered at y = 0 without mutating SHAPES', () => {
    const pieceI = createPiece('I');
    expect(pieceI.x).toBe(3);
    expect(pieceI.y).toBe(0);

    const pieceO = createPiece('O');
    expect(pieceO.x).toBe(4);
    pieceO.matrix[0][0] = 0;
    expect(SHAPES.O[0][0]).toBe(1);
  });

  it('rotates matrices 90 degrees clockwise and restores original after 4 rotations', () => {
    expect(rotate(SHAPES.I)).toEqual([[1], [1], [1], [1]]);
    expect(rotate(SHAPES.T)).toEqual([
      [1, 0],
      [1, 1],
      [1, 0],
    ]);

    const allTypes = Object.keys(SHAPES) as PieceType[];
    for (const type of allTypes) {
      let matrix = SHAPES[type];
      for (let i = 0; i < 4; i++) matrix = rotate(matrix);
      expect(matrix).toEqual(SHAPES[type]);
    }
  });

  it('detects collisions with walls, floor, and occupied cells', () => {
    const board = createBoard();
    const piece = createPiece('O');

    expect(hasCollision(board, piece)).toBe(false);
    expect(hasCollision(board, { ...piece, x: 0 }, -1, 0)).toBe(true);
    expect(hasCollision(board, { ...piece, x: COLUMNS - 2 }, 1, 0)).toBe(true);
    expect(hasCollision(board, { ...piece, y: ROWS - 2 }, 0, 1)).toBe(true);

    board[5][4] = 'T';
    expect(hasCollision(board, { ...piece, x: 4, y: 3 }, 0, 0)).toBe(false);
    expect(hasCollision(board, { ...piece, x: 4, y: 3 }, 0, 1)).toBe(true);
  });

  it('clears completed rows and shifts remaining blocks down', () => {
    const board = createBoard();
    board[ROWS - 1].fill('L');
    board[ROWS - 2].fill('J');
    board[ROWS - 3][0] = 'I';

    const { board: nextBoard, cleared } = clearCompletedRows(board);
    expect(cleared).toBe(2);
    expect(nextBoard).toHaveLength(ROWS);
    expect(nextBoard[ROWS - 1][0]).toBe('I');
    expect(nextBoard[0].every((cell) => cell === null)).toBe(true);
  });

  it('calculates score rewards scaled by level', () => {
    expect(calculateScoreReward(0, 1)).toBe(0);
    expect(calculateScoreReward(1, 1)).toBe(100);
    expect(calculateScoreReward(2, 2)).toBe(600);
    expect(calculateScoreReward(3, 1)).toBe(500);
    expect(calculateScoreReward(4, 3)).toBe(2400);
  });

  it('calculates drop interval and clamps it to 90ms minimum', () => {
    expect(calculateDropInterval(1)).toBe(800);
    expect(calculateDropInterval(2)).toBe(735);
    expect(calculateDropInterval(20)).toBe(90);
  });
});