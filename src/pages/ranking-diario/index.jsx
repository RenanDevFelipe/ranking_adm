import { useState, useEffect } from 'react';
import Sidebar from '../../components/sidebar/index.jsx';
import "../styles.css";
import "./RankingDiario.css";
import { getRankingDiario, getColaboradores, getAvaliacoes, getHistoricoEstoque, getHistoricoRH, getHistorico } from '../../services/api.ts';
import { logout } from '../../utils/auth.js';
import {
    Avatar,
    Collapse,
    IconButton,
    TextField,
    Modal,
    Box,
    Typography,
    CircularProgress,
    Tabs,
    Tab
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, Close } from '@mui/icons-material';
import DehazeIcon from '@mui/icons-material/Dehaze';

// Estilo para o modal
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: 1000,
    maxHeight: '90vh',
    overflow: 'hidden',
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: '12px',
    outline: 'none'
};

const CustomCheckbox = ({ checked, label, variant = 'default' }) => (
    <label className={`checkbox-container ${variant}`}>
        <input type="checkbox" checked={checked} readOnly />
        <span className="checkmark"></span>
    </label>
);

export default function RankingDiario() {
    const [darkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rankingData, setRankingData] = useState([]);
    const [colaboradores, setColaboradores] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});
    const [searchDate, setSearchDate] = useState('');
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSetor, setSelectedSetor] = useState(null);
    const [avaliacoesData, setAvaliacoesData] = useState([]);
    const [historicoEstoqueData, setHistoricoEstoqueData] = useState([]);
    const [historicoRHData, setHistoricoRHData] = useState([]);
    const [historicoN2Data, setHistoricoN2Data] = useState([]);
    const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [expandedOS, setExpandedOS] = useState({});

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const handleOpenModal = (setor, tecnicoNome) => {
        const colaborador = colaboradores.find(colab =>
            colab.nome_colaborador && colab.nome_colaborador.toLowerCase() === tecnicoNome.toLowerCase()
        );

        if (colaborador) {
            setSelectedSetor({
                ...setor,
                tecnico: tecnicoNome,
                idIxc: colaborador.id_ixc,
                idColaborador: colaborador.id_colaborador
            });
            setModalOpen(true);

            if (setor.id_setor === 5) {
                fetchAvaliacoesData(colaborador.id_ixc, setor.id_setor);
            } else if (setor.id_setor === 6) {
                fetchHistoricoEstoqueData(colaborador.id_colaborador, setor.id_setor);
            } else if (setor.id_setor === 7) {
                fetchHistoricoRHData(colaborador.id_colaborador, setor.id_setor);
            } else if (setor.id_setor === 9 || setor.id_setor === 22) {
                fetchHistoricoN2Data(colaborador.id_colaborador, setor.id_setor);
            }
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedSetor(null);
        setAvaliacoesData([]);
        setHistoricoEstoqueData([]);
        setHistoricoRHData([]);
        setHistoricoN2Data([]);
        setActiveTab(0);
        setExpandedOS({});
    };

    const toggleOSDetails = (osId) => {
        setExpandedOS(prev => ({
            ...prev,
            [osId]: !prev[osId]
        }));
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    useEffect(() => {
        if (darkMode) {
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
        }
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    useEffect(() => {
        const currentDate = new Date();
        const day = currentDate.getDate().toString().padStart(2, '0');
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const year = currentDate.getFullYear();
        const formattedDate = `${year}-${month}-${day}`;
        setSearchDate(formattedDate);
    }, []);

    useEffect(() => {
        if (searchDate) {
            fetchData(searchDate);
        }
    }, [searchDate]);

    const fetchData = async (date) => {
        const token = localStorage.getItem('access_token');
        setLoading(true);

        try {
            const [ranking, colaboradoresData] = await Promise.all([
                getRankingDiario(token, date),
                getColaboradores(token)
            ]);

            setRankingData((ranking || []).filter(item => !item?.erro));
            setColaboradores(colaboradoresData || []);

        } catch (err) {
            console.error("Erro ao carregar dados:", err);
            if (err.response?.status === 401) {
                setError('Sessão expirada. Redirecionando para login...');
                logout();
            } else {
                setError(err.message || 'Erro ao carregar dados');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchAvaliacoesData = async (idIxc, idSetor) => {
        if (idSetor !== 5) return;

        const token = localStorage.getItem('access_token');
        setLoadingAvaliacoes(true);

        try {
            const query = idIxc.toString();
            const data_fechamento = searchDate;

            const avaliacoes = await getAvaliacoes(token, query, data_fechamento);
            setAvaliacoesData(avaliacoes || []);
        } catch (err) {
            console.error("Erro ao carregar avaliações:", err);
            setAvaliacoesData([]);
        } finally {
            setLoadingAvaliacoes(false);
        }
    };

    const fetchHistoricoEstoqueData = async (idColaborador, idSetor) => {
        if (idSetor !== 6) return;

        const token = localStorage.getItem('access_token');
        setLoadingAvaliacoes(true);

        try {
            const historico = await getHistoricoEstoque(token, idColaborador, searchDate);
            setHistoricoEstoqueData(historico.registros || []);
        } catch (err) {
            console.error("Erro ao carregar histórico de estoque:", err);
            setHistoricoEstoqueData([]);
        } finally {
            setLoadingAvaliacoes(false);
        }
    };

    const fetchHistoricoRHData = async (idColaborador, idSetor) => {
        if (idSetor !== 7) return;

        const token = localStorage.getItem('access_token');
        setLoadingAvaliacoes(true);

        try {
            const historico = await getHistoricoRH(token, idColaborador, searchDate);
            setHistoricoRHData(historico.registros || []);
        } catch (err) {
            console.error("Erro ao carregar histórico de RH:", err);
            setHistoricoRHData([]);
        } finally {
            setLoadingAvaliacoes(false);
        }
    };

    const fetchHistoricoN2Data = async (idColaborador, idSetor) => {
        if (idSetor !== 9 && idSetor !== 22) return;

        const token = localStorage.getItem('access_token');
        setLoadingAvaliacoes(true);

        try {
            const historico = await getHistorico(token, idColaborador, searchDate);
            setHistoricoN2Data(historico.registros || []);
        } catch (err) {
            console.error("Erro ao carregar histórico N2:", err);
            setHistoricoN2Data([]);
        } finally {
            setLoadingAvaliacoes(false);
        }
    };

    const handleDateChange = (e) => {
        setSearchDate(e.target.value);
    };

    const getColaboradorFoto = (nome) => {
        if (!nome || !colaboradores || colaboradores.length === 0) {
            return 'https://ticonnecte.com.br/ranking_api/api/uploads/default.png';
        }

        const colaborador = colaboradores.find(colab =>
            colab.nome_colaborador && colab.nome_colaborador.toLowerCase() === nome.toLowerCase()
        );

        const url = colaborador?.url_image || 'default.png';
        return url.startsWith('http') ? url : `https://${url}`;
    };

    const handleRowClick = (index) => {
        setExpandedRows(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const getPositionColor = (position) => {
        switch (position) {
            case 1: return 'bg-yellow-300';
            case 2: return 'bg-gray-300';
            case 3: return 'bg-amber-600';
            default: return 'bg-indigo-100';
        }
    };

    const getPositionTextColor = (position) => {
        switch (position) {
            case 1: return 'text-yellow-700';
            case 2: return 'text-gray-700';
            case 3: return 'text-amber-800';
            default: return 'text-indigo-700';
        }
    };

    const getCardBgColor = (position) => {
        switch (position) {
            case 1: return 'bg-yellow-200';
            case 2: return 'bg-gray-200';
            case 3: return 'bg-amber-500';
            default: return 'bg-white';
        }
    };

    function getRandomLightColor() {
        const lightness = Math.floor(Math.random() * 16) + 80;
        return `hsl(0, 0%, ${lightness}%)`;
    }

    const getSetorBorderColor = (idSetor) => {
        switch (idSetor) {
            case 5: return 'border-2 border-blue-500';
            case 6: return 'border-2 border-green-500';
            case 7: return 'border-2 border-purple-500';
            case 9: return 'border-2 border-red-500';
            default: return '';
        }
    };

    const getSetorHintText = (idSetor) => {
        switch (idSetor) {
            case 5: return 'Clique para ver detalhes das avaliações';
            case 6: return 'Clique para ver histórico de estoque';
            case 7: return 'Clique para ver histórico de RH';
            case 9: return 'Clique para ver histórico N2';
            default: return '';
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando Ranking...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="app-container">
                <Sidebar isVisible={isSidebarVisible} />
                <div className="error-container">
                    <div className="error-message">{error}</div>
                    <button
                        className="retry-button"
                        onClick={() => window.location.reload()}
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            <Sidebar isVisible={isSidebarVisible} />
            <div className="main-content-diario">
                <button
                    className={`sidebar-toggle ${darkMode ? 'dark' : 'light'}`}
                    onClick={toggleSidebar}
                >
                    {isSidebarVisible ? <DehazeIcon /> : '►'}
                </button>
                <div className="ranking-container">
                    <div className="flex flex-col md:flex-row justify-around items-center mb-8">
                        <h1 className="text-3xl font-bold text-center text-orange mb-4 md:mb-0">Ranking Diário</h1>
                        <TextField
                            className="input-date"
                            label="Data"
                            type="date"
                            value={searchDate}
                            onChange={handleDateChange}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                max: new Date().toISOString().split('T')[0],
                            }}
                            variant="outlined"
                            sx={{ mr: 2 }}
                        />
                    </div>

                    {/* Pódio */}
                    <div className="flex justify-center items-end h-64 mb-12 gap-4">
                        {/* Segundo lugar */}
                        {rankingData.length > 1 && (
                            <div className="podium-item flex flex-col w-1/5">
                                <div className={`${getPositionColor(2)} w-full rounded-t-lg flex items-center justify-center`} style={{ height: '60%' }}>
                                    <span className={`text-4xl font-bold ${getPositionTextColor(2)}`}>2</span>
                                </div>
                                <div className={`${getCardBgColor(2)} w-full p-3 rounded-b-lg text-center ${rankingData[1].colocacao === 3 ? 'text-white' : ''}`}>
                                    <Avatar
                                        src={getColaboradorFoto(rankingData[1].colaborador)}
                                        sx={{ width: 48, height: 48, margin: '0 auto 8px', border: '2px solid white' }}
                                    />
                                    <p className="font-semibold">{rankingData[1].colaborador}</p>
                                    <div className="text-xs">
                                        <p className={rankingData[1].colocacao === 3 ? 'text-amber-100' : 'text-gray-600'}>
                                            Média: <span className="font-medium">{rankingData[1].media_total}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Primeiro lugar */}
                        {rankingData.length > 0 && (
                            <div className="podium-item flex flex-col w-1/4">
                                <div className={`${getPositionColor(1)} w-full rounded-t-lg flex items-center justify-center`} style={{ height: '80%' }}>
                                    <span className={`text-4xl font-bold ${getPositionTextColor(1)}`}>1</span>
                                </div>
                                <div className={`${getCardBgColor(1)} w-full p-3 rounded-b-lg text-center`}>
                                    <Avatar
                                        src={getColaboradorFoto(rankingData[0].colaborador)}
                                        sx={{ width: 56, height: 56, margin: '0 auto 8px', border: '2px solid white' }}
                                    />
                                    <p className="font-semibold">{rankingData[0].colaborador}</p>
                                    <div className="text-xs">
                                        <p className="text-gray-600">
                                            Média: <span className="font-medium">{rankingData[0].media_total}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Terceiro lugar */}
                        {rankingData.length > 2 && (
                            <div className="podium-item flex flex-col w-1/5">
                                <div className={`${getPositionColor(3)} w-full rounded-t-lg flex items-center justify-center`} style={{ height: '40%' }}>
                                    <span className={`text-4xl font-bold ${getPositionTextColor(3)}`}>3</span>
                                </div>
                                <div className={`${getCardBgColor(3)} w-full p-3 rounded-b-lg text-center`}>
                                    <Avatar
                                        src={getColaboradorFoto(rankingData[2].colaborador)}
                                        sx={{ width: 48, height: 48, margin: '0 auto 8px', border: '2px solid white' }}
                                    />
                                    <p className="font-semibold text-white">{rankingData[2].colaborador}</p>
                                    <div className="text-xs">
                                        <p className="text-amber-100">
                                            Média: <span className="font-medium">{rankingData[2].media_total}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Lista de Técnicos */}
                    <div className="lista-tecnicos max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden mb-8">
                        <div className="bg-orange px-6 py-3">
                            <h2 className="text-xl font-semibold text-white">Lista de Técnicos</h2>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {rankingData.map((row, index) => (
                                <div key={row.colaborador} className="technician-item">
                                    <div
                                        className="flex items-center justify-between px-6 py-4 cursor-pointer technician-header"
                                        onClick={() => handleRowClick(index)}
                                    >
                                        <div className="flex items-center">
                                            <Avatar
                                                src={getColaboradorFoto(row.colaborador)}
                                                sx={{ width: 32, height: 32, marginRight: '16px', border: '2px solid white' }}
                                            />
                                            <div>
                                                <h3 className="font-medium">{row.colaborador}</h3>
                                                <div className="spans flex flex-wrap gap-4 gap-x-4 gap-y-1 text-xs">
                                                    <span className="text-gray-500">
                                                        Avaliações: <span className="font-medium">{row.total_registros}</span>
                                                    </span>
                                                    <span className="text-gray-500">
                                                        Média: <span className="font-medium">{row.media_total}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <IconButton className='chevron' size="small">
                                            {expandedRows[index] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                        </IconButton>
                                    </div>

                                    <Collapse in={expandedRows[index]} timeout="auto" unmountOnExit>
                                        <div className="pt px-6 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {row.media_setor.map((setor) => (
                                                <div
                                                    key={setor.id_setor}
                                                    className={`ps p-3 rounded-lg cursor-pointer ${getSetorBorderColor(setor.id_setor)}`}
                                                    style={{ backgroundColor: getRandomLightColor() }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (setor.id_setor === 5 || setor.id_setor === 6 || setor.id_setor === 7 || setor.id_setor === 9 || setor.id_setor === 22) {
                                                            handleOpenModal(setor, row.colaborador);
                                                        }
                                                    }}
                                                >
                                                    <p className="text-sm font-medium text-blue-700">{setor.setor}</p>
                                                    <p className="text-lg font-bold">{setor.media_diaria}</p>
                                                    <p className="text-xs text-gray-500">{setor.total_registros} avaliações</p>
                                                    <p className="text-xs text-gray-500">{setor.soma_pontuacao} total</p>
                                                    {(setor.id_setor === 5 || setor.id_setor === 6 || setor.id_setor === 7 || setor.id_setor === 9 || setor.id_setor === 22) && (
                                                        <p className={`text-xs mt-1 ${setor.id_setor === 5 ? 'text-blue-600' :
                                                            setor.id_setor === 6 ? 'text-green-600' :
                                                                setor.id_setor === 7 ? 'text-purple-600' :
                                                                    'text-red-600'
                                                            }`}>
                                                            {getSetorHintText(setor.id_setor)}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </Collapse>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                open={modalOpen}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={modalStyle}>
                    {selectedSetor?.id_setor === 5 ? (
                        <div className="os-modal-container">
                            <div className="os-modal-header">
                                <div>
                                    <h2 className="os-modal-title">Lista de Ordens de Serviço</h2>
                                    <p className="os-modal-subtitle">Visualize e gerencie múltiplas ordens de serviço</p>
                                </div>
                                <button onClick={handleCloseModal} className="os-modal-close-btn">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            
                            <div className="os-modal-content">
                                {loadingAvaliacoes ? (
                                    <div className="os-loading">
                                        <CircularProgress />
                                        <span>Carregando detalhes...</span>
                                    </div>
                                ) : (
                                    <div>
                                        {avaliacoesData.length === 0 || !avaliacoesData.registros || avaliacoesData.registros.length === 0 ? (
                                            <p className="os-no-data">Nenhum dado encontrado para este setor na data selecionada.</p>
                                        ) : (
                                            <div className="os-list-container">
                                                {/* <div className="os-search-filter">
                                                    <div className="os-search-container">
                                                        <i className="fas fa-search os-search-icon"></i>
                                                        <input 
                                                            type="text" 
                                                            placeholder="Buscar OS ou itens do checklist..." 
                                                            className="os-search-input"
                                                        />
                                                    </div>
                                                    <select className="os-filter-select">
                                                        <option>Todos os Status</option>
                                                        <option>Finalizada</option>
                                                        <option>Pendente</option>
                                                    </select>
                                                </div> */}
                                                
                                                <div className="os-items-list">
                                                    {avaliacoesData.registros.map((registro) => (
                                                        <div key={registro.id} className="os-item">
                                                            <div 
                                                                className="os-item-header"
                                                                onClick={() => toggleOSDetails(registro.id)}
                                                            >
                                                                <div className="os-item-info">
                                                                    <i className="fas fa-clipboard-list os-item-icon"></i>
                                                                    <div>
                                                                        <h3 className="os-item-title">OS #{registro.id} - {registro.cliente}</h3>
                                                                        <p className="os-item-details">ID Cliente: {registro.id_cliente} | Status: {registro.status}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="os-item-status">
                                                                    <span className={`os-item-note ${registro.nota_os >= 9  ? 'os-item-note-completed'  : registro.nota_os >= 7   ? 'os-item-note-yellow'   : 'os-item-note-pending' }`}>
                                                                        {registro.nota_os ? `Nota: ${registro.nota_os}` : 'Nota: -'}
                                                                    </span>
                                                                    <i className={`fas ${expandedOS[registro.id] ? 'fa-chevron-up' : 'fa-chevron-down'} os-item-arrow`}></i>
                                                                </div>
                                                            </div>
                                                            
                                                            {expandedOS[registro.id] && (
                                                                <div className="os-item-details-content">
                                                                    {registro.checklist && registro.checklist !== "Não preenchido" && (
                                                                        <div className="os-checklist">
                                                                            {registro.checklist.split('\r\n').map((line, i) => {
                                                                                if (line.includes('Sim (X)')) {
                                                                                    return (
                                                                                        <div key={i} className="checklist-item">
                                                                                            <span className="checklist-badge checklist-badge-yes">Sim</span>
                                                                                            {/* <span>{line.replace('Sim (X)', 'Sim').replace('Não ( )', 'Não')}</span> */}
                                                                                        </div>
                                                                                    );
                                                                                } else if (line.includes('Não (X)')) {
                                                                                    return (
                                                                                        <div key={i} className="checklist-item">
                                                                                            <span className="checklist-badge checklist-badge-no">Não</span>
                                                                                            {/* <span>{line.replace('Não (X)', 'Não').replace('Sim ( )', 'Sim')}</span> */}
                                                                                        </div>
                                                                                    );
                                                                                } else if (line.includes('Sim ( )')) {
                                                                                    return (
                                                                                        <div key={i} className="checklist-item">
                                                                                            <span className="checklist-badge checklist-badge-neutral">Sim</span>
                                                                                            {/* <span>{line.replace('Sim ( )', 'Sim').replace('Não ( )', 'Não')}</span> */}
                                                                                        </div>
                                                                                    );
                                                                                } else if (line.includes('Não ( )')) {
                                                                                    return (
                                                                                        <div key={i} className="checklist-item">
                                                                                            <span className="checklist-badge checklist-badge-neutral">Não</span>
                                                                                            {/* <span>{line.replace('Não ( )', 'Não').replace('Sim ( )', 'Sim')}</span> */}
                                                                                        </div>
                                                                                    );
                                                                                }
                                                                                return <p key={i} className="checklist-text">{line}</p>;
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                    
                                                                    <div className="os-observations">
                                                                        <div className="os-observations-header">
                                                                            <i className="fas fa-sticky-note os-observations-icon"></i>
                                                                            <h3 className="os-observations-title">Observações</h3>
                                                                        </div>
                                                                        <div className="os-observations-content">
                                                                            <p className="os-observations-text">{registro.observacoes || 'OBS: Nenhuma'}</p>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div className="os-completion-details">
                                                                        <p className="os-completion-text">Finalização: {new Date(registro.finalizacao).toLocaleString('pt-BR')}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            <div className="os-modal-footer">
                                <button onClick={handleCloseModal} className="os-modal-close-button">
                                    Fechar
                                </button>
                            </div>
                        </div>
                    ) : selectedSetor?.id_setor === 6 ? (
                        <div className="history-modal-container">
                            <div className="history-modal-header">
                                <div>
                                    <h2 className="history-modal-title">Histórico de Estoque</h2>
                                    <p className="history-modal-subtitle">Visualize o histórico de pontuações de estoque</p>
                                </div>
                                <button onClick={handleCloseModal} className="history-modal-close-btn">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            
                            <div className="history-modal-content">
                                {loadingAvaliacoes ? (
                                    <div className="history-loading">
                                        <CircularProgress />
                                        <span>Carregando histórico...</span>
                                    </div>
                                ) : (
                                    <div>
                                        {!historicoEstoqueData || historicoEstoqueData.length === 0 ? (
                                            <p className="history-no-data">Nenhum dado encontrado para o histórico de estoque na data selecionada.</p>
                                        ) : (
                                            <div className="history-list-container">
                                                <div className="history-stats-grid">
                                                    <div className="history-stat-card">
                                                        <div className="history-stat-label">Técnico</div>
                                                        <div className="history-stat-name">{selectedSetor?.tecnico}</div>
                                                    </div>
                                                    <div className="history-stat-card">
                                                        <div className="history-stat-label">Data</div>
                                                        <div className="history-stat-value">{searchDate}</div>
                                                    </div>
                                                    <div className="history-stat-card">
                                                        <div className="history-stat-label">Total de Itens</div>
                                                        <div className="history-stat-value">{historicoEstoqueData.length}</div>
                                                    </div>
                                                </div>
                                                
                                                <div className="history-items-list">
                                                    {historicoEstoqueData.map((item, index) => {
                                                        const diferenca = item.pontuacao_anterior - item.pontuacao_atual;
                                                        const sinal = diferenca > 0 ? '-' : '+';
                                                        const tipo = diferenca > 0 ? 'Diminuído' : 'Acrescentado';
                                                        const valorAbsoluto = Math.abs(diferenca);
                                                        const isPositive = diferenca <= 0;

                                                        return (
                                                            <div key={index} className="history-item">
                                                                <div className="history-item-header">
                                                                    <div className="history-item-info">
                                                                        <i className={`fas ${isPositive ? 'fa-arrow-up text-green-600' : 'fa-arrow-down text-red-600'}`}></i>
                                                                        <div>
                                                                            <h3 className="history-item-title">Registro #{index + 1}</h3>
                                                                            <p className="history-item-details">Avaliador: {item.nome_avaliador || 'N/A'}</p>
                                                                        </div>
                                                                    </div>
                                                                    <span className={`history-item-change ${isPositive ? 'history-item-change-positive' : 'history-item-change-negative'}`}>
                                                                        {sinal}{valorAbsoluto} pontos
                                                                    </span>
                                                                </div>
                                                                
                                                                <div className="history-item-details-content">
                                                                    <div className="history-details-grid">
                                                                        <div className="history-detail">
                                                                            <span className="history-detail-label">Data da Avaliação</span>
                                                                            <span className="history-detail-value">{item.data_avaliacao ? new Date(item.data_avaliacao).toLocaleString('pt-BR') : 'N/A'}</span>
                                                                        </div>
                                                                        <div className="history-detail">
                                                                            <span className="history-detail-label">Pontuação Anterior</span>
                                                                            <span className="history-detail-value">{item.pontuacao_anterior || 'N/A'}</span>
                                                                        </div>
                                                                        <div className="history-detail">
                                                                            <span className="history-detail-label">Pontuação Atual</span>
                                                                            <span className="history-detail-value">{item.pontuacao_atual || 'N/A'}</span>
                                                                        </div>
                                                                        <div className="history-detail">
                                                                            <span className="history-detail-label">Tipo</span>
                                                                            <span className="history-detail-value">{tipo}</span>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {item.observacao && (
                                                                        <div className="history-observations">
                                                                            <div className="history-observations-header">
                                                                                <i className="fas fa-sticky-note history-observations-icon"></i>
                                                                                <h3 className="history-observations-title">Observação</h3>
                                                                            </div>
                                                                            <div className="history-observations-content">
                                                                                <p className="history-observations-text">{item.observacao}</p>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            <div className="history-modal-footer">
                                <button onClick={handleCloseModal} className="history-modal-close-button">
                                    Fechar
                                </button>
                            </div>
                        </div>
                    ) : selectedSetor?.id_setor === 7 ? (
                        <div className="history-modal-container">
                            <div className="history-modal-header">
                                <div>
                                    <h2 className="history-modal-title">Histórico de RH</h2>
                                    <p className="history-modal-subtitle">Visualize o histórico de pontuações de RH</p>
                                </div>
                                <button onClick={handleCloseModal} className="history-modal-close-btn">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            
                            <div className="history-modal-content">
                                {loadingAvaliacoes ? (
                                    <div className="history-loading">
                                        <CircularProgress />
                                        <span>Carregando histórico...</span>
                                    </div>
                                ) : (
                                    <div>
                                        {!historicoRHData || historicoRHData.length === 0 ? (
                                            <p className="history-no-data">Nenhum dado encontrado para o histórico de RH na data selecionada.</p>
                                        ) : (
                                            <div className="history-list-container">
                                                <div className="history-stats-grid">
                                                    <div className="history-stat-card">
                                                        <div className="history-stat-label">Técnico</div>
                                                        <div className="history-stat-name">{selectedSetor?.tecnico}</div>
                                                    </div>
                                                    <div className="history-stat-card">
                                                        <div className="history-stat-label">Data</div>
                                                        <div className="history-stat-value">{searchDate}</div>
                                                    </div>
                                                    <div className="history-stat-card">
                                                        <div className="history-stat-label">Total de Itens</div>
                                                        <div className="history-stat-value">{historicoRHData.length}</div>
                                                    </div>
                                                </div>
                                                
                                                <div className="history-items-list">
                                                    {historicoRHData.map((item, index) => {
                                                        const diferenca = item.pontuacao_anterior - item.pontuacao_atual;
                                                        const sinal = diferenca > 0 ? '-' : '+';
                                                        const tipo = diferenca > 0 ? 'Diminuído' : 'Acrescentado';
                                                        const valorAbsoluto = Math.abs(diferenca);
                                                        const isPositive = diferenca <= 0;

                                                        return (
                                                            <div key={index} className="history-item">
                                                                <div className="history-item-header">
                                                                    <div className="history-item-info">
                                                                        <i className={`fas ${isPositive ? 'fa-arrow-up text-green-600' : 'fa-arrow-down text-red-600'}`}></i>
                                                                        <div>
                                                                            <h3 className="history-item-title">Registro #{index + 1}</h3>
                                                                            <p className="history-item-details">Avaliador: {item.nome_avaliador || 'N/A'}</p>
                                                                        </div>
                                                                    </div>
                                                                    <span className={`history-item-change ${isPositive ? 'history-item-change-positive' : 'history-item-change-negative'}`}>
                                                                        {sinal}{valorAbsoluto} pontos
                                                                    </span>
                                                                </div>
                                                                
                                                                <div className="history-item-details-content">
                                                                    <div className="history-details-grid">
                                                                        <div className="history-detail">
                                                                            <span className="history-detail-label">Data da Avaliação</span>
                                                                            <span className="history-detail-value">{item.data_avaliacao ? new Date(item.data_avaliacao).toLocaleString('pt-BR') : 'N/A'}</span>
                                                                        </div>
                                                                        <div className="history-detail">
                                                                            <span className="history-detail-label">Pontuação Anterior</span>
                                                                            <span className="history-detail-value">{item.pontuacao_anterior || 'N/A'}</span>
                                                                        </div>
                                                                        <div className="history-detail">
                                                                            <span className="history-detail-label">Pontuação Atual</span>
                                                                            <span className="history-detail-value">{item.pontuacao_atual || 'N/A'}</span>
                                                                        </div>
                                                                        <div className="history-detail">
                                                                            <span className="history-detail-label">Tipo</span>
                                                                            <span className="history-detail-value">{tipo}</span>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {item.observacao && (
                                                                        <div className="history-observations">
                                                                            <div className="history-observations-header">
                                                                                <i className="fas fa-sticky-note history-observations-icon"></i>
                                                                                <h3 className="history-observations-title">Observação</h3>
                                                                            </div>
                                                                            <div className="history-observations-content">
                                                                                <p className="history-observations-text">{item.observacao}</p>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            <div className="history-modal-footer">
                                <button onClick={handleCloseModal} className="history-modal-close-button">
                                    Fechar
                                </button>
                            </div>
                        </div>
                    ) : (selectedSetor?.id_setor === 9 || selectedSetor?.id_setor === 22) ? (
                        <div className="history-modal-container">
                            <div className="history-modal-header">
                                <div>
                                    <h2 className="history-modal-title">Histórico N2</h2>
                                    <p className="history-modal-subtitle">Visualize o histórico de pontuações N2</p>
                                </div>
                                <button onClick={handleCloseModal} className="history-modal-close-btn">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            
                            <div className="history-modal-content">
                                {loadingAvaliacoes ? (
                                    <div className="history-loading">
                                        <CircularProgress />
                                        <span>Carregando histórico...</span>
                                    </div>
                                ) : (
                                    <div>
                                        {!historicoN2Data || historicoN2Data.length === 0 ? (
                                            <p className="history-no-data">Nenhum dado encontrado para o histórico N2 na data selecionada.</p>
                                        ) : (
                                            <div className="history-list-container">
                                                <div className="history-stats-grid">
                                                    <div className="history-stat-card">
                                                        <div className="history-stat-label">Técnico</div>
                                                        <div className="history-stat-name">{selectedSetor?.tecnico}</div>
                                                    </div>
                                                    <div className="history-stat-card">
                                                        <div className="history-stat-label">Data</div>
                                                        <div className="history-stat-value">{searchDate}</div>
                                                    </div>
                                                    <div className="history-stat-card">
                                                        <div className="history-stat-label">Total de Itens</div>
                                                        <div className="history-stat-value">{historicoN2Data.length}</div>
                                                    </div>
                                                </div>
                                                
                                                <div className="history-items-list">
                                                    {historicoN2Data.map((item, index) => {
                                                        const diferenca = item.pontuacao_anterior - item.pontuacao_atual;
                                                        const sinal = diferenca > 0 ? '-' : '+';
                                                        const tipo = diferenca > 0 ? 'Diminuído' : 'Acrescentado';
                                                        const valorAbsoluto = Math.abs(diferenca);
                                                        const isPositive = diferenca <= 0;

                                                        return (
                                                            <div key={index} className="history-item">
                                                                <div className="history-item-header">
                                                                    <div className="history-item-info">
                                                                        <i className={`fas ${isPositive ? 'fa-arrow-up text-green-600' : 'fa-arrow-down text-red-600'}`}></i>
                                                                        <div>
                                                                            <h3 className="history-item-title">Registro #{index + 1}</h3>
                                                                            <p className="history-item-details">Avaliador: {item.nome_avaliador || 'N/A'}</p>
                                                                        </div>
                                                                    </div>
                                                                    <span className={`history-item-change ${isPositive ? 'history-item-change-positive' : 'history-item-change-negative'}`}>
                                                                        {sinal}{valorAbsoluto} pontos
                                                                    </span>
                                                                </div>
                                                                
                                                                <div className="history-item-details-content">
                                                                    <div className="history-details-grid">
                                                                        <div className="history-detail">
                                                                            <span className="history-detail-label">Data da Avaliação</span>
                                                                            <span className="history-detail-value">{item.data_avaliacao ? new Date(item.data_avaliacao).toLocaleString('pt-BR') : 'N/A'}</span>
                                                                        </div>
                                                                        <div className="history-detail">
                                                                            <span className="history-detail-label">Pontuação Anterior</span>
                                                                            <span className="history-detail-value">{item.pontuacao_anterior || 'N/A'}</span>
                                                                        </div>
                                                                        <div className="history-detail">
                                                                            <span className="history-detail-label">Pontuação Atual</span>
                                                                            <span className="history-detail-value">{item.pontuacao_atual || 'N/A'}</span>
                                                                        </div>
                                                                        <div className="history-detail">
                                                                            <span className="history-detail-label">Tipo</span>
                                                                            <span className="history-detail-value">{tipo}</span>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {item.observacao && (
                                                                        <div className="history-observations">
                                                                            <div className="history-observations-header">
                                                                                <i className="fas fa-sticky-note history-observations-icon"></i>
                                                                                <h3 className="history-observations-title">Observação</h3>
                                                                            </div>
                                                                            <div className="history-observations-content">
                                                                                <p className="history-observations-text">{item.observacao}</p>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            <div className="history-modal-footer">
                                <button onClick={handleCloseModal} className="history-modal-close-button">
                                    Fechar
                                </button>
                            </div>
                        </div>
                    ) : null}
                </Box>
            </Modal>
        </div>
    );
}