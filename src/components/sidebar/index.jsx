import React, { useState } from 'react';
import './style.css';
import { useNavigate } from 'react-router-dom';
import Logo from '../../utils/img/eliel.jpg';
import { 
    Assessment as AvaliarIcon,
    Assignment as OsIcon,
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
    ExitToApp as LogoutIcon
  } from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = () => {
    const { darkMode, toggleDarkMode } = useTheme();
    const [showRankingSubmenu, setShowRankingSubmenu] = useState(false);
    const [showSettingSubmenu, setShowSettingSubmenu] = useState(false);
    let navigate = useNavigate();

    const user = localStorage.getItem('user_name');

    const toggleRankingSubmenu = () => {
        setShowRankingSubmenu(!showRankingSubmenu);
    };

    const toggleSettingSubmenu = () => {
        setShowSettingSubmenu(!showSettingSubmenu);
    }

    function navegacao(url) {
        return () => navigate(url);
    }

    const handleLogout = () => {
        localStorage.removeItem('user_name');
        localStorage.removeItem('access_token');
        navigate('/');
    }

    return (
        <div className={`sidebar ${darkMode ? 'dark' : 'light'}`}>
            <div className="sidebar-header">
                <h2>TI Connect</h2>
            </div>
            
            <nav className="sidebar-menu">
                <ul>
                    <li className="menu-section">
                        <div className="menu-item" onClick={navegacao("/home")}>
                            <AvaliarIcon className="menu-icon" />
                            <span className="section-title clickable">Avaliar</span>
                        </div>
                        
                        <div className="menu-item" onClick={navegacao("/os-aberta")}>
                            <OsIcon className="menu-icon" />
                            <span className="section-title clickable">O.S Aberta</span>
                        </div>
                        
                        <div className="menu-item" onClick={navegacao("/ranking-setor")}>
                            <RankingSetorIcon className="menu-icon" />
                            <span className="section-title clickable">Ranking por Setor</span>
                        </div>
                        
                        <div 
                            className="menu-item" 
                            onClick={toggleRankingSubmenu}
                        >
                            <RankingSetorIcon className="menu-icon" />
                            <span className="section-title clickable">Ranking</span>
                            <span className={`arrow-icon ${showRankingSubmenu ? 'open' : ''}`}>
                                ▼
                            </span>
                        </div>
                        
                        {showRankingSubmenu && (
                            <ul className="submenu">
                                <li>
                                    <RankingDiarioIcon className="submenu-icon" />
                                    Ranking Diário
                                </li>
                                <li>
                                    <RankingMensalIcon className="submenu-icon" />
                                    Ranking Mensal
                                </li>
                                <li>
                                    <RankingAnualIcon className="submenu-icon" />
                                    Ranking Anual
                                </li>
                            </ul>
                        )}
                        
                        <div className="menu-item" onClick={navegacao("/tutoriais")}>
                            <TutoriaisIcon className="menu-icon" />
                            <span className="section-title clickable">Guias e Tutoriais</span>
                        </div>
                        
                        <div 
                            className="menu-item" 
                            onClick={toggleSettingSubmenu}
                        >
                            <ConfiguracoesIcon className="menu-icon" />
                            <span className="section-title clickable">Configurações</span>
                            <span className={`arrow-icon ${showSettingSubmenu ? 'open' : ''}`}>
                                ▼
                            </span>
                        </div>
                        
                        {showSettingSubmenu && (
                            <ul className="submenu">
                                <li>
                                    <UsuarioIcon className="submenu-icon" />
                                    Usuário
                                </li>
                                <li>
                                    <SetorIcon className="submenu-icon" />
                                    Setor
                                </li>
                                <li onClick={navegacao("/colaboradores")}>
                                    <ColaboradorIcon className="submenu-icon" />
                                    Colaborador
                                </li>
                            </ul>
                        )}
                    </li>
                    
                    <li className="perfil">
                        <div className="profile-info">
                            <img width={50} src={Logo} alt="User profile" />
                            <span>{user}</span>
                        </div>
                        
                        <div className="profile-actions">
                            <button 
                                className="theme-toggle"
                                onClick={toggleDarkMode}
                                title={darkMode ? 'Modo claro' : 'Modo escuro'}
                            >
                                {darkMode ? <DarkModeIcon /> : <LightModeIcon /> }
                            </button>
                            
                            <button 
                                className="logout-button"
                                onClick={handleLogout}
                                title="Sair"
                            >
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