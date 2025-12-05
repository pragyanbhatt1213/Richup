import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TargetCursor from './components/animations/TargetCursor';
import Landing from './pages/Landing';
import Lobby from './pages/Lobby';
import Game from './pages/Game';

const App: React.FC = () => {
  return (
    <Router>
      <TargetCursor />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/game/:roomId" element={<Game />} />
      </Routes>
    </Router>
  );
};

export default App;
