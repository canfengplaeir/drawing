import { Point, ShapeType } from '../types';

export function detectShape(start: Point, end: Point): ShapeType {
  const dx = Math.abs(end.x - start.x);
  const dy = Math.abs(end.y - start.y);
  const ratio = Math.max(dx, dy) / Math.min(dx, dy);

  if (ratio < 1.2) {
    return 'circle';
  } else if (ratio > 2) {
    return 'line';
  } else {
    return 'rectangle';
  }
}