import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreatePaste from './components/CreatePaste';
import ViewPaste from './components/ViewPaste';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<CreatePaste />} />
          <Route path="/p/:id" element={<ViewPaste />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
