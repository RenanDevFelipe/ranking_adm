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
import RankingDiario from './pages/ranking-diario/index.jsx'
import Checklists from './pages/checklist/index.jsx';
import AddAssunto from './pages/assunto/assunto.jsx';
import Assunto from './pages/assunto/index.jsx';
import Checklist from './pages/checklist/checklist.jsx'
import AvaliarN3 from './pages/avaliacoes/n3/index.jsx';
import AvaliarN2 from './pages/avaliacoes/n2/index.jsx';
import Movimentacoes from './pages/avaliacoes/n2/movimentacoes.jsx';
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
                <Route path="/ranking-diario" element={
                    <PrivateRoute>
                        <RankingDiario />
                    </PrivateRoute>
                } />
                <Route path="/checklists" element={
                    <PrivateRoute>
                        <Checklists />
                    </PrivateRoute>
                } />
                <Route path="/assuntos" element={
                    <PrivateRoute>
                        <Assunto />
                    </PrivateRoute>
                } />
                <Route path="/assunto/:id" element={
                    <PrivateRoute>
                        <AddAssunto />
                    </PrivateRoute>
                } />
                <Route path="/checklist/:id" element={
                    <PrivateRoute>
                        <Checklist />
                    </PrivateRoute>
                } />
                <Route path="/avaliar/N3/:id" element={
                    <PrivateRoute>
                        <AvaliarN3 />
                    </PrivateRoute>
                } />
                <Route path="/avaliar/N2/:id" element={
                    <PrivateRoute>
                        <AvaliarN2 />
                    </PrivateRoute>
                } />
                <Route path="/movimentacoes/:id" element={
                    <PrivateRoute>
                        <Movimentacoes />
                    </PrivateRoute>
                } />

            </Routes>
        </ThemeProvider>
    );
}