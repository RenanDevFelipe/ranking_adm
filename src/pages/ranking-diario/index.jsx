import { useState, useEffect } from 'react';
import Sidebar from '../../components/sidebar/index.jsx';
import "../styles.css";
import { getRankingDiario, getColaboradores } from '../../services/api.ts';
import { logout } from '../../utils/auth.js';
import {
    Avatar,
    Collapse,
    IconButton,
    TextField,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import DehazeIcon from '@mui/icons-material/Dehaze';

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

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
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
                                        <IconButton size="small">
                                            {expandedRows[index] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                        </IconButton>
                                    </div>
                                    
                                    <Collapse in={expandedRows[index]} timeout="auto" unmountOnExit>
                                        <div className="pt px-6 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {row.media_setor.map((setor) => (
                                                <div
                                                    key={setor.id_setor}
                                                    className="ps bg-blue-50 p-3 rounded-lg"
                                                    style={{ backgroundColor: getRandomLightColor() }}
                                                >
                                                    <p className="text-sm font-medium text-blue-700">{setor.setor}</p>
                                                    <p className="text-lg font-bold">{setor.media_diaria}</p>
                                                    <p className="text-xs text-gray-500">{setor.total_registros} avaliações</p>
                                                    <p className="text-xs text-gray-500">{setor.soma_pontuacao} total</p>
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
        </div>
    );
}