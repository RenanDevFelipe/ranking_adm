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
import AddUsuario from './pages/user/usuario.jsx';
import RankingMensal from './pages/ranking-mensal/index.jsx'
import RankingDiario from './pages/ranking-diario/index.jsx'
import RankingAnual from './pages/ranking-anual/index.jsx'
import RankingConfigs from './pages/ranking-config/index.jsx';
import RankingConfigForm from './pages/ranking-config/form.jsx';
import Checklists from './pages/checklist/index.jsx';
import AddAssunto from './pages/assunto/assunto.jsx';
import Assunto from './pages/assunto/index.jsx';
import Usuarios from './pages/user/index.jsx';
import Setores from './pages/setor/index.jsx';
import AddSetor from './pages/setor/setor.jsx';
import Checklist from './pages/checklist/checklist.jsx'
import ChecklistScores from './pages/checklist-score/index.jsx';
import ChecklistScoreForm from './pages/checklist-score/form.jsx';
import AvaliarN3 from './pages/avaliacoes/n3/index.jsx';
import AvaliarN2 from './pages/avaliacoes/n2/index.jsx';
import AvaliarEstoque from './pages/avaliacoes/estoque/index.jsx';
import AvaliarRH from './pages/avaliacoes/rh/index.jsx';
import Movimentacoes from './pages/avaliacoes/n2/movimentacoes.jsx';
import MovimentacoesEstoque from './pages/avaliacoes/estoque/movimentacoes.jsx';
import MovimentacoesRH from './pages/avaliacoes/rh/movimentacoes.jsx';
import { ThemeProvider } from './context/ThemeContext.js';
import Dashboard from './pages/dashboard/index.jsx';
import IxcConfigs from './pages/ixc-config/index.jsx';
import IxcConfigForm from './pages/ixc-config/form.jsx';
import IxcFinalizacaoConfigs from './pages/ixc-finalizacao-config/index.jsx';
import IxcFinalizacaoConfigForm from './pages/ixc-finalizacao-config/form.jsx';



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
                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <Dashboard />
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
                <Route path="/ranking-anual" element={
                    <PrivateRoute>
                        <RankingAnual />
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
                <Route path="/checklist-scores" element={
                    <PrivateRoute>
                        <ChecklistScores />
                    </PrivateRoute>
                } />
                <Route path="/checklist-score/:id" element={
                    <PrivateRoute>
                        <ChecklistScoreForm />
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
                <Route path="/avaliar/estoque/:id" element={
                    <PrivateRoute>
                        <AvaliarEstoque />
                    </PrivateRoute>
                } />
                <Route path="/estoque/movimentacoes/:id" element={
                    <PrivateRoute>
                        <MovimentacoesEstoque />
                    </PrivateRoute>
                } />
                <Route path="/avaliar/rh/:id" element={
                    <PrivateRoute>
                        <AvaliarRH />
                    </PrivateRoute>
                } />
                <Route path="/rh/movimentacoes/:id" element={
                    <PrivateRoute>
                        <MovimentacoesRH />
                    </PrivateRoute>
                } />
                <Route path="/usuarios" element={
                    <PrivateRoute>
                        <Usuarios />
                    </PrivateRoute>
                } />
                <Route path="/usuario/:id" element={
                    <PrivateRoute>
                        <AddUsuario />
                    </PrivateRoute>
                } />
                <Route path="/setores" element={
                    <PrivateRoute>
                        <Setores />
                    </PrivateRoute>
                } />

                <Route path="/setor/:id" element={
                    <PrivateRoute>
                        <AddSetor />
                    </PrivateRoute>
                } />

                <Route path="/ixc-configs" element={
                    <PrivateRoute>
                        <IxcConfigs />
                    </PrivateRoute>
                } />

                <Route path="/ixc-config/:id" element={
                    <PrivateRoute>
                        <IxcConfigForm />
                    </PrivateRoute>
                } />

                <Route path="/ixc-finalizacao-configs" element={
                    <PrivateRoute>
                        <IxcFinalizacaoConfigs />
                    </PrivateRoute>
                } />

                <Route path="/ixc-finalizacao-config/:id" element={
                    <PrivateRoute>
                        <IxcFinalizacaoConfigForm />
                    </PrivateRoute>
                } />

                <Route path="/ranking-configuracoes" element={
                    <PrivateRoute>
                        <RankingConfigs />
                    </PrivateRoute>
                } />

                <Route path="/ranking-configuracao/:id" element={
                    <PrivateRoute>
                        <RankingConfigForm />
                    </PrivateRoute>
                } />

            </Routes>
        </ThemeProvider>
    );
}
