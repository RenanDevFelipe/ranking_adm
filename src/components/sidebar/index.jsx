import React, { useState } from 'react';
import './style.css';

const Sidebar = () => {
    const [showRankingSubmenu, setShowRankingSubmenu] = useState(false);

    const toggleRankingSubmenu = () => {
        setShowRankingSubmenu(!showRankingSubmenu);
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>TI Connect</h2>
            </div>
            
            <nav className="sidebar-menu">
                <ul>
                    <li className="menu-section">
                        <span className="section-title">Avaliar</span>
                        <span className="section-title">O.S Aberta</span>
                        <span className="section-title">Ranking por Setor</span>
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
                        <span className="section-title">Guias e Tutoriais</span>
                    </li>
                    <li className="menu-item">Settings</li>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;