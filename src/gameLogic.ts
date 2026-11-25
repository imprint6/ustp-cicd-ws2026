export const COLUMNS = 10;
export const ROWS = 20;

export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
export type Matrix = number[][];
export type Piece = { type: PieceType; matrix: Matrix; x: number; y: number };
export type Board = (PieceType | null)[][];

export const SHAPES: Record<PieceType, Matrix> = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
};

export function createBoard(): Board {
  return Array.from({ length: ROWS }, () => Array<PieceType | null>(COLUMNS).fill(null));
}

export function createPiece(type: PieceType): Piece {
  const matrix = SHAPES[type].map((row) => [...row]);
  return { type, matrix, x: Math.floor((COLUMNS - matrix[0].length) / 2), y: 0 };
}

export function rotate(matrix: Matrix): Matrix {
  return matrix[0].map((_, column) => matrix.map((row) => row[column]).reverse());
}

export function hasCollision(board: Board, piece: Piece, dx = 0, dy = 0, matrix = piece.matrix): boolean {
  return matrix.some((row, rowIndex) =>
    row.some((value, columnIndex) => {
      if (!value) return false;
      const x = piece.x + columnIndex + dx;
      const y = piece.y + rowIndex + dy;
      return x < 0 || x >= COLUMNS || y >= ROWS || (y >= 0 && board[y][x] !== null);
    }),
  );
}

export function clearCompletedRows(board: Board): { board: Board; cleared: number } {
  let cleared = 0;
  const remaining = board.filter((row) => {
    if (row.every((cell) => cell !== null)) {
      cleared += 1;
      return false;
    }
    return true;
  });
  while (remaining.length < ROWS) {
    remaining.unshift(Array<PieceType | null>(COLUMNS).fill(null));
  }
  return { board: remaining, cleared };
}

export function calculateScoreReward(cleared: number, level: number): number {
  const rewards = [0, 100, 300, 500, 800];
  if (cleared <= 0) return 0;
  return (rewards[cleared] ?? 800) * level;
}

export function calculateDropInterval(level: number): number {
  return Math.max(90, 800 - (level - 1) * 65);
}