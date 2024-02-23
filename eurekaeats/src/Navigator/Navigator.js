import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LandingPage from '../LandingPage/LandingPage';
import LogIn from '../LogIn/LogIn';
import SignIn from '../SignIn/SignIn';

function Navigator() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LogIn />} />
      <Route path="/signin" element={<SignIn />} />
    </Routes>
  );
}

export default Navigator;