import logo from "./logo.svg";
import "./App.css";
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CampingDetail from "./pages/detail/CampingDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/campingDetail/:campgroundId" element={<CampingDetail/>}></Route>
      </Routes>
        
    </Router>
  );
}

export default App;
