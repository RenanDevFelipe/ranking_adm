import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import './App.css';
import PrivateRoute from './routes/PrivateRoute';
import Tutorial from './pages/tutorial/';
import AddTutorial from './pages/tutorial/tutorial.jsx';
import Colaborador from './pages/colaborador/index.jsx';
import AddColaborador from './pages/colaborador/colaborador.jsx';
import RankingMensal from './pages/ranking-mensal/index.jsx'
import { ThemeProvider } from './context/ThemeContext.js';

export default function App() {
    return (
        <ThemeProvider>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/home" element={
                    <PrivateRoute>
                        <Home />
                    </PrivateRoute>
                } />
                <Route path="/tutoriais" element={
                    <PrivateRoute>
                        <Tutorial />
                    </PrivateRoute>
                } />
                <Route path="/tutorial/:id" element={
                    <PrivateRoute>
                        <AddTutorial />
                    </PrivateRoute>
                } />
                <Route path="/colaboradores" element={
                    <PrivateRoute>
                        <Colaborador />
                    </PrivateRoute>
                } />
                <Route path="/colaborador/:id" element={
                    <PrivateRoute>
                        <AddColaborador />
                    </PrivateRoute>
                } />
                <Route path="/ranking-mensal" element={
                    <PrivateRoute>
                        <RankingMensal />
                    </PrivateRoute>
                } />
            </Routes>
        </ThemeProvider>
    );
}