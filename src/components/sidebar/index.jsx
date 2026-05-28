import React, { useState } from 'react';
import './style.css';
import { authService } from '../../services/authService.ts';
import { logout } from '../../utils/auth.js';
import { useNavigate } from 'react-router-dom';
import {
    Assessment as AvaliarIcon,
    Dashboard as DashboardIcon,
    Leaderboard as RankingSetorIcon,
    MenuBook as TutoriaisIcon,
    Settings as ConfiguracoesIcon,
    Timeline as RankingDiarioIcon,
    CalendarToday as RankingMensalIcon,
    Event as RankingAnualIcon,
    Person as UsuarioIcon,
    GroupWork as SetorIcon,
    People as ColaboradorIcon,
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon,
    ExitToApp as LogoutIcon,
    Computer as OSIcon,
    Rule as RuleIcon
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = ({ isVisible }) => {
    const { darkMode, toggleDarkMode } = useTheme();
    const [showRankingSubmenu, setShowRankingSubmenu] = useState(false);
    const [showSettingSubmenu, setShowSettingSubmenu] = useState(false);
    const [showChecklistSubmenu, setShowChecklistSubmenu] = useState(false);
    const navigate = useNavigate();

    const user = localStorage.getItem('user_name');
    const userRole = parseInt(localStorage.getItem('user_role') || '0');
    const userSetor = parseInt(localStorage.getItem('user_setor') || '0');

    const canSeeAssess = () => userSetor !== 25;
    const canSeeConfig = () => userRole === 1;
    const canSeeChecklist = () => ![6, 7, 25].includes(userSetor);
    const canSeeTutorials = () => ![6, 7, 25].includes(userSetor);

    const navegacao = (url) => () => navigate(url);

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }

        logout();
        navigate('/');
    };

    return (
        <div className={`sidebar ${darkMode ? 'dark' : 'light'} ${isVisible ? '' : 'hidden'}`}>
            <div className="sidebar-header">
                <h2>Ranking TI</h2>
            </div>

            <nav className="sidebar-menu">
                <ul>
                    <li className="menu-section">
                        <div className="menu-item" onClick={navegacao('/dashboard')}>
                            <DashboardIcon className="menu-icon" />
                            <span className="section-title clickable">Dashboard</span>
                        </div>

                        {canSeeAssess() && (
                            <div className="menu-item" onClick={navegacao('/home')}>
                                <AvaliarIcon className="menu-icon" />
                                <span className="section-title clickable">Avaliar</span>
                            </div>
                        )}

                        <div className="menu-item" onClick={() => setShowRankingSubmenu(!showRankingSubmenu)}>
                            <RankingSetorIcon className="menu-icon" />
                            <span className="section-title clickable">Ranking</span>
                            <span className={`arrow-icon ${showRankingSubmenu ? 'open' : ''}`}>▼</span>
                        </div>

                        {showRankingSubmenu && (
                            <ul className="submenu active">
                                <li onClick={navegacao('/ranking-diario')}>
                                    <RankingDiarioIcon className="submenu-icon" />
                                    Ranking Diario
                                </li>
                                <li onClick={navegacao('/ranking-mensal')}>
                                    <RankingMensalIcon className="submenu-icon" />
                                    Ranking Mensal
                                </li>
                                <li onClick={navegacao('/ranking-anual')}>
                                    <RankingAnualIcon className="submenu-icon" />
                                    Ranking Anual
                                </li>
                            </ul>
                        )}

                        {canSeeChecklist() && (
                            <>
                                <div className="menu-item" onClick={() => setShowChecklistSubmenu(!showChecklistSubmenu)}>
                                    <RankingDiarioIcon className="menu-icon" />
                                    <span className="section-title clickable">Checklists</span>
                                    <span className={`arrow-icon ${showChecklistSubmenu ? 'open' : ''}`}>▼</span>
                                </div>

                                {showChecklistSubmenu && (
                                    <ul className="submenu active">
                                        <li onClick={navegacao('/checklists')}>
                                            <RankingDiarioIcon className="submenu-icon" />
                                            Checklists
                                        </li>
                                        <li onClick={navegacao('/assuntos')}>
                                            <RankingMensalIcon className="submenu-icon" />
                                            Assuntos OS
                                        </li>
                                        <li onClick={navegacao('/checklist-scores')}>
                                            <RankingAnualIcon className="submenu-icon" />
                                            Pontuacoes
                                        </li>
                                        <li onClick={navegacao('/ixc-finalizacao-configs')}>
                                            <RuleIcon className="submenu-icon" />
                                            Finalizacao IXC
                                        </li>
                                    </ul>
                                )}
                            </>
                        )}

                        {canSeeTutorials() && (
                            <div className="menu-item" onClick={navegacao('/tutoriais')}>
                                <TutoriaisIcon className="menu-icon" />
                                <span className="section-title clickable">Guias e Tutoriais</span>
                            </div>
                        )}

                        {canSeeConfig() && (
                            <>
                                <div className="menu-item" onClick={() => setShowSettingSubmenu(!showSettingSubmenu)}>
                                    <ConfiguracoesIcon className="menu-icon" />
                                    <span className="section-title clickable">Configuracoes</span>
                                    <span className={`arrow-icon ${showSettingSubmenu ? 'open' : ''}`}>▼</span>
                                </div>

                                {showSettingSubmenu && (
                                    <ul className="submenu active">
                                        <li onClick={navegacao('/usuarios')}>
                                            <UsuarioIcon className="submenu-icon" />
                                            Usuario
                                        </li>
                                        <li onClick={navegacao('/setores')}>
                                            <SetorIcon className="submenu-icon" />
                                            Setor
                                        </li>
                                        <li onClick={navegacao('/colaboradores')}>
                                            <ColaboradorIcon className="submenu-icon" />
                                            Colaborador
                                        </li>
                                        <li onClick={navegacao('/ixc-configs')}>
                                            <OSIcon className="submenu-icon" />
                                            IXC
                                        </li>
                                        <li onClick={navegacao('/ranking-configuracoes')}>
                                            <RankingSetorIcon className="submenu-icon" />
                                            Ranking
                                        </li>
                                    </ul>
                                )}
                            </>
                        )}
                    </li>

                    <li className="perfil">
                        <div className="profile-info">
                            <span>{user}</span>
                        </div>

                        <div className="profile-actions">
                            <button
                                className="theme-toggle"
                                onClick={toggleDarkMode}
                                title={darkMode ? 'Modo claro' : 'Modo escuro'}
                            >
                                {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
                            </button>

                            <button className="logout-button" onClick={handleLogout} title="Sair">
                                <LogoutIcon />
                            </button>
                        </div>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
