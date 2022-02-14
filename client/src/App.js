import './App.css';
import { BrowserRouter as Router, Routes, Route, } from "react-router-dom";

import LandingPage from './components/views/LandingPage/LandingPage';
import LoginPage from './components/views/LoginPage/LoginPage';
import RegisterPage from './components/views/RegisterPage/RegisterPage';
import ShopsPage from './components/views/ShopsPage/ShopsPage';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route exact path="/" element={< LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/shops" element={<ShopsPage />} />
        </Routes>
      </div>
    </Router >
  );
}

export default App;