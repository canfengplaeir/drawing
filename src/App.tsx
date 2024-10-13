import React, { useState } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import { DrawingTool, ShapeType } from './types';

function App() {
  const [currentTool, setCurrentTool] = useState<DrawingTool>('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <h1 className="text-3xl font-bold text-center py-4">绘图应用程序</h1>
      <div className="flex-grow flex flex-col md:flex-row">
        <Toolbar
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
          color={color}
          setColor={setColor}
          lineWidth={lineWidth}
          setLineWidth={setLineWidth}
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
        />
        <Canvas
          currentTool={currentTool}
          color={color}
          lineWidth={lineWidth}
          backgroundColor={backgroundColor}
        />
      </div>
    </div>
  );
}

export default App;