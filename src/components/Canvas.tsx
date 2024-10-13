import React, { useRef, useEffect, useState } from 'react';
import { DrawingTool, Point, ShapeType } from '../types';
import { detectShape } from '../utils/shapeDetection';

interface CanvasProps {
  currentTool: DrawingTool;
  color: string;
  lineWidth: number;
  backgroundColor: string;
}

const Canvas: React.FC<CanvasProps> = ({ currentTool, color, lineWidth, backgroundColor }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [shapeStartPoint, setShapeStartPoint] = useState<Point | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 保存初始状态用于撤销
    const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack([initialState]);
  }, [backgroundColor]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const point = getPointFromEvent(e);
    setLastPoint(point);

    if (currentTool === 'pen' || currentTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    }

    // 开始长按计时器用于形状检测
    const timer = setTimeout(() => {
      setShapeStartPoint(point);
    }, 1000);
    setLongPressTimer(timer);

    // 保存当前状态用于撤销
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack(prevStack => [...prevStack, currentState]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const point = getPointFromEvent(e);

    if (currentTool === 'pen' || currentTool === 'eraser') {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = currentTool === 'eraser' ? backgroundColor : color;
      ctx.lineWidth = lineWidth;

      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }

    setLastPoint(point);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);

    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    if (shapeStartPoint) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const endPoint = lastPoint;
      if (!endPoint) return;

      const shape = detectShape(shapeStartPoint, endPoint);
      drawDetectedShape(ctx, shape, shapeStartPoint, endPoint);

      setShapeStartPoint(null);
    }
  };

  const drawDetectedShape = (ctx: CanvasRenderingContext2D, shape: ShapeType, start: Point, end: Point) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    switch (shape) {
      case 'circle':
        const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)) / 2;
        const centerX = (start.x + end.x) / 2;
        const centerY = (start.y + end.y) / 2;
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        break;
      case 'rectangle':
        ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
        break;
      case 'line':
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        break;
    }

    ctx.stroke();
  };

  const getPointFromEvent = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      // 触摸事件
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // 鼠标事件
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) / scale - offset.x;
    const y = (clientY - rect.top) / scale - offset.y;

    return { x, y };
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prevScale => Math.min(Math.max(prevScale * delta, 0.1), 5));
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 保存清除后的状态用于撤销
    const clearedState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack(prevStack => [...prevStack, clearedState]);
  };

  const undo = () => {
    if (undoStack.length <= 1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previousState = undoStack[undoStack.length - 2];
    ctx.putImageData(previousState, 0, 0);

    setUndoStack(prevStack => prevStack.slice(0, -1));
  };

  const saveAsPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'drawing.png';
    link.click();
  };

  return (
    <div className="flex-grow relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
        onWheel={handleWheel}
        style={{
          transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`,
          transformOrigin: '0 0',
        }}
      />
      <div className="absolute bottom-4 right-4 space-x-2">
        <button onClick={clearCanvas} className="bg-red-500 text-white px-4 py-2 rounded">清除画布</button>
        <button onClick={undo} className="bg-blue-500 text-white px-4 py-2 rounded">撤销</button>
        <button onClick={saveAsPNG} className="bg-green-500 text-white px-4 py-2 rounded">保存为PNG</button>
      </div>
    </div>
  );
};

export default Canvas;