import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import ChooseShop from "../src/components/views/ChooseShopPage/ChooseShop";
import CreateRoom from "../src/components/views/CreateRoomPage/CreateRoom.jsx";
import LandingPage from "./components/views/LandingPage/LandingPage";
import LoginPage from "./components/views/LoginPage/LoginPage";
import RegisterPage from "./components/views/RegisterPage/RegisterPage";
import Room from "../src/components/views/RoomPage/Room";
import InvitedPage from "../src/components/views/InvitedPage/InvitedPage";

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

function App() {
  document.body.style.backgroundColor = "black";
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/createroom" exact element={<CreateRoom />} />
          <Route path="/chooseshop" element={<ChooseShop />} />
          <Route path="/room/:roomID" element={<Room />} />
          <Route path="/invited" element={<InvitedPage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
