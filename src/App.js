import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Aggiungi from './components/Aggiungi';

function App() {
  return (
    <Router basename="/cantireact"> 
      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/aggiungi" element={<Aggiungi />} />
      </Routes>
    </Router>
  );
}

export default App;