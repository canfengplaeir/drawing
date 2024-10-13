import React from 'react';
import { Pencil, Eraser, Trash2, Move, ZoomIn, Undo, Download } from 'lucide-react';
import { DrawingTool } from '../types';

interface ToolbarProps {
  currentTool: DrawingTool;
  setCurrentTool: (tool: DrawingTool) => void;
  color: string;
  setColor: (color: string) => void;
  lineWidth: number;
  setLineWidth: (width: number) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  setCurrentTool,
  color,
  setColor,
  lineWidth,
  setLineWidth,
  backgroundColor,
  setBackgroundColor,
}) => {
  return (
    <div className="bg-gray-200 p-4 flex flex-col space-y-4 md:w-64">
      <div className="space-y-2">
        <button
          onClick={() => setCurrentTool('pen')}
          className={`w-full flex items-center space-x-2 p-2 rounded ${
            currentTool === 'pen' ? 'bg-blue-500 text-white' : 'bg-white'
          }`}
        >
          <Pencil size={20} />
          <span>画笔</span>
        </button>
        <button
          onClick={() => setCurrentTool('eraser')}
          className={`w-full flex items-center space-x-2 p-2 rounded ${
            currentTool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-white'
          }`}
        >
          <Eraser size={20} />
          <span>橡皮擦</span>
        </button>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">画笔颜色</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full h-10 rounded"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">画笔粗细</label>
        <input
          type="range"
          min="1"
          max="50"
          value={lineWidth}
          onChange={(e) => setLineWidth(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">背景颜色</label>
        <input
          type="color"
          value={backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
          className="w-full h-10 rounded"
        />
      </div>
    </div>
  );
};

export default Toolbar;