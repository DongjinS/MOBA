import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import ChooseShop from '../src/components/views/ChooseShopPage/ChooseShop';
import CreateRoom from '../src/components/views/CreateRoomPage/CreateRoom.jsx';
import LandingPage from './components/views/LandingPage/LandingPage';
import LoginPage from './components/views/LoginPage/LoginPage';
import RegisterPage from './components/views/RegisterPage/RegisterPage';
import Room from '../src/components/views/RoomPage/Room';
import InvitedPage from '../src/components/views/InvitedPage/InvitedPage';

import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import DressRoom from './components/views/DressRoomPage/DressRoom';
import Vote from './components/views/VotePage/Vote';
import VoteResult from './components/views/VoteResultPage/VoteResult';
import { useEffect } from 'react';
import SimpleSlider from './components/SimpleSlider/SimpleSlider';

function App() {
  document.body.style.backgroundColor = 'white';
  useEffect(() => {
    window.Kakao.init('c45ed7c54965b8803ada1b6e2f293f4f');
  }, []);
  return (
    <Router>
      <div id="routerDiv">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/createroom" exact element={<CreateRoom />} />
          <Route path="/chooseshop" element={<ChooseShop />} />
          <Route path="/room/:roomID" element={<Room />} />
          <Route path="/invited" element={<InvitedPage />} />
          <Route path="/dressroom/:roomID" element={<DressRoom />} />
          <Route path="/vote/:roomID" element={<Vote />} />
          <Route path="/voteresult" element={<VoteResult />} />
          <Route path="/SimpleSlider" element={<SimpleSlider />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
