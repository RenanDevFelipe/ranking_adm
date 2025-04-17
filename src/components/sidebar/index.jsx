import React, { useState } from 'react';
import './style.css';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const [showRankingSubmenu, setShowRankingSubmenu] = useState(false);
    const [showSettingSubmenu, setShowSettingSubmenu] = useState(false);
    let navigate = useNavigate();

    const toggleRankingSubmenu = () => {
        setShowRankingSubmenu(!showRankingSubmenu);
    };

    const toggleSettingSubmenu = () => {
        setShowSettingSubmenu(!showSettingSubmenu);
    }

    function navegacao(url){
        return () => navigate(url);
    }

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>TI Connect</h2>
            </div>
            
            <nav className="sidebar-menu">
                <ul>
                    <li className="menu-section">
                        <span className="section-title clickable">Avaliar</span>
                        <span className="section-title clickable">O.S Aberta</span>
                        <span className="section-title clickable">Ranking por Setor</span>
                        <span 
                            className="section-title clickable" 
                            onClick={toggleRankingSubmenu}
                        >
                            Ranking
                            <span className={`arrow-icon ${showRankingSubmenu ? 'open' : ''}`}>
                                ▼
                            </span>
                        </span>
                        {showRankingSubmenu && (
                            <ul className="submenu">
                                <li>Ranking Diario</li>
                                <li>Ranking Mensal</li>
                                <li>Ranking Anual</li>
                            </ul>
                        )}
                        <span className="section-title clickable">Guias e Tutoriais</span>
                        <span 
                            className="section-title clickable" 
                            onClick={toggleSettingSubmenu}
                        >
                            Configurações
                            <span className={`arrow-icon ${showSettingSubmenu ? 'open' : ''}`}>
                                ▼
                            </span>
                        </span>
                        {showSettingSubmenu && (
                            <ul className="submenu">
                                <li>Usuario</li>
                                <li>Setor</li>
                                <li onClick={navegacao("/colaboradores")}>Colaborador</li>
                            </ul>
                        )}
                        
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;