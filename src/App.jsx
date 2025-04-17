import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import './App.css';
import PrivateRoute from './routes/PrivateRoute';
import Tutorial from './pages/tutorial';
import Colaborador from './pages/colaborador/index.jsx';
import AddColaborador from './pages/colaborador/colaborador.jsx';

export default function App() {
  
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={
        <PrivateRoute>
          <Home />
        </PrivateRoute>
      } />
       <Route path='/tutoriais' element ={<Tutorial />} /> 
       <Route path='/colaboradores' element ={<Colaborador />} /> 
       <Route path='/colaborador/:id' element ={<AddColaborador />} /> 
    </Routes>
  );
}
