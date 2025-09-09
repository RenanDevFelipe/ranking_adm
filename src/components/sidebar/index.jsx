import React, { useState, useEffect } from 'react';
import './style.css';
import { getAvaliacoesN3, getAvaliacoesN3Mensal } from '../../services/api.ts';
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
    Close as CloseIcon
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';

const Sidebar = ({ isVisible }) => {
    const { darkMode, toggleDarkMode } = useTheme();
    const [showRankingSubmenu, setShowRankingSubmenu] = useState(false);
    const [showSettingSubmenu, setShowSettingSubmenu] = useState(false);
    const [showChecklistSubmenu, setShowChecklistSubmenu] = useState(false);
    const [osData, setOsData] = useState({ total: 0, registros: [] });
    const [osDataMes, setOsDataMes] = useState({ total: 0, registros: [] });
    const [loadingOS, setLoadingOS] = useState(true);
    const [loadingOSMes, setLoadingOSMes] = useState(true);
    const [showOSModal, setShowOSModal] = useState(false);
    const [showOSModalMes, setShowOSModalMes] = useState(false);
    const [dataSelecionadaDia, setDataSelecionadaDia] = useState(new Date().toISOString().split('T')[0]);
    const [dataSelecionadaMes, setDataSelecionadaMes] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    let navigate = useNavigate();

    // Extrair informações do usuário
    const user = localStorage.getItem('user_name');
    const userRole = parseInt(localStorage.getItem('user_role') || '0');
    const userSetor = parseInt(localStorage.getItem('user_setor') || '0');
    const userIdIxc = localStorage.getItem('user_id');

    // Funções para verificar permissões
    const canSeeAssess = () => userSetor !== 25;
    const canSeeConfig = () => userRole === 1;
    const canSeeConnectBi = () => userRole === 3 || 1;
    const canSeeChecklist = () => ![6, 7, 25].includes(userSetor);
    const canSeeTutorials = () => ![6, 7, 25].includes(userSetor);
    const canSeeFinOS = () => userSetor == 5;
    // Buscar OS finalizadas diárias
    const fetchOSFinalizadasDia = async (data) => {
        if (!userIdIxc) {
            setLoadingOS(false);
            return;
        }

        setLoadingOS(true);
        try {
            const token = localStorage.getItem('access_token');
            console.log('Buscando OS diárias para data:', data);

            const response = await getAvaliacoesN3(token, userIdIxc, data);
            console.log('Resposta da API (diário):', response);

            setOsData({
                total: response.total || 0,
                registros: response.registros || []
            });
        } catch (error) {
            console.error("Erro ao buscar OS finalizadas (diário):", error);
            setOsData({ total: 0, registros: [] });
        } finally {
            setLoadingOS(false);
        }
    };

    // Buscar OS finalizadas mensais
    const fetchOSFinalizadasMes = async (dataMes) => {
        if (!userIdIxc) {
            setLoadingOSMes(false);
            return;
        }

        setLoadingOSMes(true);
        try {
            const token = localStorage.getItem('access_token');
            console.log('Buscando OS mensais para mês:', dataMes);

            // Converte YYYY-MM para YYYY-MM-DD (último dia do mês)
            const [ano, mes] = dataMes.split('-');
            const ultimoDia = new Date(ano, mes, 0).getDate();
            const dataCompleta = `${dataMes}-${ultimoDia.toString().padStart(2, '0')}`;

            const response = await getAvaliacoesN3Mensal(token, userIdIxc, dataCompleta);
            console.log('Resposta da API (mensal):', response);

            setOsDataMes({
                total: response.total || 0,
                registros: response.registros || []
            });
        } catch (error) {
            console.error("Erro ao buscar OS finalizadas (mensal):", error);
            setOsDataMes({ total: 0, registros: [] });
        } finally {
            setLoadingOSMes(false);
        }
    };

    // Buscar OS do dia atual quando o componente carrega
    useEffect(() => {
        console.log('Sidebar montado, buscando OS...');
        fetchOSFinalizadasDia(dataSelecionadaDia);
        fetchOSFinalizadasMes(dataSelecionadaMes);
    }, []);

    // Buscar OS quando o modal diário é aberto ou data muda
    useEffect(() => {
        if (showOSModal) {
            console.log('Modal diário aberto, buscando OS para data:', dataSelecionadaDia);
            fetchOSFinalizadasDia(dataSelecionadaDia);
        }
    }, [showOSModal, dataSelecionadaDia]);

    // Buscar OS quando o modal mensal é aberto ou data muda
    useEffect(() => {
        if (showOSModalMes) {
            console.log('Modal mensal aberto, buscando OS para mês:', dataSelecionadaMes);
            fetchOSFinalizadasMes(dataSelecionadaMes);
        }
    }, [showOSModalMes, dataSelecionadaMes]);

    const toggleRankingSubmenu = () => {
        setShowRankingSubmenu(!showRankingSubmenu);
    };

    const toggleSettingSubmenu = () => {
        setShowSettingSubmenu(!showSettingSubmenu);
    };

    const toggleChecklistSubmenu = () => {
        setShowChecklistSubmenu(!showChecklistSubmenu);
    };

    function navegacao(url) {
        return () => navigate(url);
    }

    const handleLogout = () => {
        localStorage.removeItem('user_name');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id_ixc');
        navigate('/');
    }

    const handleOpenOSModalMes = () => {
        setShowOSModalMes(true);
    };

    const handleCloseOSModalMes = () => {
        setShowOSModalMes(false);
    };

    const handleOpenOSModal = () => {
        setShowOSModal(true);
    };

    const handleCloseOSModal = () => {
        setShowOSModal(false);
    };

    const handleDataChangeDia = (e) => {
        const novaData = e.target.value;
        setDataSelecionadaDia(novaData);
    };

    const handleDataChangeMes = (e) => {
        const novoMes = e.target.value;
        setDataSelecionadaMes(novoMes);
    };

    // Função para formatar a data no estilo pt-BR
    const formatarData = (dataString) => {
        if (!dataString) return '';

        const data = new Date(dataString);
        return data.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Formatar data para exibição (ex: "01/01/2023")
    const formatarDataExibicao = (dataString) => {
        if (!dataString) return '';

        const data = new Date(dataString + 'T00:00:00-03:00');
        return data.toLocaleDateString('pt-BR');
    };

    // Formatar mês para exibição (ex: "Setembro/2023")
    const formatarMesExibicao = (mesString) => {
        if (!mesString) return '';

        const [ano, mes] = mesString.split('-');
        const data = new Date(ano, mes - 1, 1);
        return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    };

    // Estilos para o modal
    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        maxWidth: '90vw',
        maxHeight: '80vh',
        bgcolor: darkMode ? '#2a2a2a' : 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 3,
        borderRadius: '8px',
        color: darkMode ? 'white' : 'inherit',
        overflow: 'auto'
    };

    return (
        <div className={`sidebar ${darkMode ? 'dark' : 'light'} ${isVisible ? '' : 'hidden'}`}>
            <div className="sidebar-header">
                <h2>Ranking TI</h2>
            </div>

            <nav className="sidebar-menu">
                <ul>
                    <li className="menu-section">
                        {canSeeAssess() && (
                            <>
                                <div className="menu-item" onClick={navegacao("/home")}>
                                    <AvaliarIcon className="menu-icon" />
                                    <span className="section-title clickable">Avaliar</span>
                                </div>
                            </>
                        )}
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
                                <li onClick={navegacao("/ranking-diario")}>
                                    <RankingDiarioIcon className="submenu-icon" />
                                    Ranking Diário
                                </li>
                                <li onClick={navegacao("/ranking-mensal")}>
                                    <RankingMensalIcon className="submenu-icon" />
                                    Ranking Mensal
                                </li>
                                <li>
                                    <RankingAnualIcon className="submenu-icon" />
                                    Ranking Anual
                                </li>
                            </ul>
                        )}

                        {canSeeChecklist() && (
                            <>
                                <div
                                    className="menu-item"
                                    onClick={toggleChecklistSubmenu}
                                >
                                    <RankingDiarioIcon className="menu-icon" />
                                    <span className="section-title clickable">Checklists</span>
                                    <span className={`arrow-icon ${showChecklistSubmenu ? 'open' : ''}`}>
                                        ▼
                                    </span>
                                </div>

                                {showChecklistSubmenu && (
                                    <ul className="submenu">
                                        <li onClick={navegacao("/checklists")}>
                                            <RankingDiarioIcon className="submenu-icon" />
                                            Checklists
                                        </li>
                                        <li onClick={navegacao("/assuntos")}>
                                            <RankingMensalIcon className="submenu-icon" />
                                            Assuntos OS
                                        </li>
                                    </ul>
                                )}
                            </>
                        )}

                        {canSeeTutorials() && (
                            <div className="menu-item" onClick={navegacao("/tutoriais")}>
                                <TutoriaisIcon className="menu-icon" />
                                <span className="section-title clickable">Guias e Tutoriais</span>
                            </div>
                        )}

                        {canSeeConfig() && (
                            <>
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
                                        <li onClick={navegacao("/usuarios")}>
                                            <UsuarioIcon className="submenu-icon" />
                                            Usuário
                                        </li>
                                        <li onClick={navegacao("/setores")}>
                                            <SetorIcon className="submenu-icon" />
                                            Setor
                                        </li>
                                        <li onClick={navegacao("/colaboradores")}>
                                            <ColaboradorIcon className="submenu-icon" />
                                            Colaborador
                                        </li>
                                    </ul>
                                )}
                            </>
                        )}

                        {canSeeConnectBi() && (
                            <>
                                <div className="menu-item" onClick={navegacao("/connectbi")}>
                                    <DashboardIcon className="menu-icon" />
                                    <span className="section-title clickable">ConnectBi</span>
                                </div>
                            </>
                        )}
                    </li>

                    {canSeeFinOS() && (
                        <>
                            <li className='finOS clickable' onClick={handleOpenOSModalMes}>
                                <div className="os-section-header">
                                    <OSIcon className="os-icon" />
                                    <span>OS do Mês</span>
                                </div>
                                <div className="os-preview">
                                    {loadingOSMes ? (
                                        <div className="os-loading-small">Carregando...</div>
                                    ) : (
                                        <>
                                            <div className="os-total">{osDataMes.total} OS</div>
                                            <small>Clique para ver detalhes</small>
                                        </>
                                    )}
                                </div>
                            </li>

                            {/* Seção finOS com total de OS do dia */}
                            <li className='finOS clickable' onClick={handleOpenOSModal}>
                                <div className="os-section-header">
                                    <OSIcon className="os-icon" />
                                    <span>OS do Dia</span>
                                </div>
                                <div className="os-preview">
                                    {loadingOS ? (
                                        <div className="os-loading-small">Carregando...</div>
                                    ) : (
                                        <>
                                            <div className="os-total">{osData.total} OS</div>
                                            <small>Clique para ver detalhes</small>
                                        </>
                                    )}
                                </div>
                            </li>
                        </>
                    )}

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

            {/* Modal para visualizar OS finalizadas do mês */}
            <Modal
                open={showOSModalMes}
                onClose={handleCloseOSModalMes}
                aria-labelledby="os-modal-title-mes"
                aria-describedby="os-modal-description-mes"
            >
                <Box sx={modalStyle}>
                    <div className="modal-header">
                        <h2 id="os-modal-title-mes">O.S Finalizadas do Mês</h2>
                        <button className="modal-close" onClick={handleCloseOSModalMes}>
                            <CloseIcon />
                        </button>
                    </div>

                    <div className="modal-content">
                        <div className="date-filter">
                            <label htmlFor="dataFechamentoMes">Selecione o mês:</label>
                            <input
                                type="month"
                                id="dataFechamentoMes"
                                value={dataSelecionadaMes}
                                onChange={handleDataChangeMes}
                                max={new Date().toISOString().slice(0, 7)}
                            />
                        </div>

                        {loadingOSMes ? (
                            <div className="os-loading">Carregando O.S...</div>
                        ) : (
                            <>
                                <div className="os-count">
                                    {osDataMes.total} O.S finalizada(s) em {formatarMesExibicao(dataSelecionadaMes)}
                                </div>

                                {osDataMes.registros.length > 0 ? (
                                    <div className="os-list-modal">
                                        {osDataMes.registros.map(os => (
                                            <div key={os.id} className="os-item-modal">
                                                <div className="os-header">
                                                    <span className="os-number">OS #{os.id}</span>
                                                    <span className="os-status">{os.status}</span>
                                                </div>
                                                <div className="os-client">{os.nome_cliente}</div>
                                                <div className="os-time">{formatarData(os.data_fechamento)}</div>
                                                <div className="os-assunto">Id do assunto: {os.id_assunto}</div>
                                                <div className="os-cliente">Id do cliente: {os.id_cliente}</div>
                                                <div className="os-cliente">Mensagem: <br /> {os.mensagem}</div>
                                                <div className="os-cliente">Mensagem resposta: <br /> {os.mensagem_resposta}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-os">Nenhuma O.S finalizada neste mês</div>
                                )}
                            </>
                        )}
                    </div>
                </Box>
            </Modal>

            {/* Modal para visualizar OS finalizadas do dia */}
            <Modal
                open={showOSModal}
                onClose={handleCloseOSModal}
                aria-labelledby="os-modal-title-dia"
                aria-describedby="os-modal-description-dia"
            >
                <Box sx={modalStyle}>
                    <div className="modal-header">
                        <h2 id="os-modal-title-dia">O.S Finalizadas do Dia</h2>
                        <button className="modal-close" onClick={handleCloseOSModal}>
                            <CloseIcon />
                        </button>
                    </div>

                    <div className="modal-content">
                        <div className="date-filter">
                            <label htmlFor="dataFechamentoDia">Selecione a data:</label>
                            <input
                                type="date"
                                id="dataFechamentoDia"
                                value={dataSelecionadaDia}
                                onChange={handleDataChangeDia}
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        {loadingOS ? (
                            <div className="os-loading">Carregando O.S...</div>
                        ) : (
                            <>
                                <div className="os-count">
                                    {osData.total} O.S finalizada(s) em {formatarDataExibicao(dataSelecionadaDia)}
                                </div>

                                {osData.registros.length > 0 ? (
                                    <div className="os-list-modal">
                                        {osData.registros.map(os => (
                                            <div key={os.id} className="os-item-modal">
                                                <div className="os-header">
                                                    <span className="os-number">OS #{os.id}</span>
                                                    <span className="os-status">{os.status}</span>
                                                </div>
                                                <div className="os-client">{os.nome_cliente}</div>
                                                <div className="os-time">{formatarData(os.data_fechamento)}</div>
                                                <div className="os-assunto">Id do assunto: {os.id_assunto}</div>
                                                <div className="os-cliente">Id do cliente: {os.id_cliente}</div>
                                                <div className="os-cliente">Mensagem: <br /> {os.mensagem}</div>
                                                <div className="os-cliente">Mensagem resposta: <br /> {os.mensagem_resposta}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-os">Nenhuma O.S finalizada nesta data</div>
                                )}
                            </>
                        )}
                    </div>
                </Box>
            </Modal>
        </div>
    );
};

export default Sidebar;