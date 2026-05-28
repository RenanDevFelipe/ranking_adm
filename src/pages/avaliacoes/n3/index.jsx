import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../../components/sidebar/index.jsx';
import AvaliacaoN3Card from '../../../components/avaliacaoN3Card/index.jsx';
import '../../styles.css';
import {
    getColaboradorById,
    getOrdensServicoFinalizadas,
    verificarAvaliacaoN3
} from '../../../services/api.ts';
import { useTheme } from '../../../context/ThemeContext.js';
import DehazeIcon from '@mui/icons-material/Dehaze';

const hojeIso = () => new Date().toISOString().split('T')[0];

export default function AvaliarN3() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const idTecnicoColaborador = queryParams.get('bd');
    const [ordens, setOrdens] = useState([]);
    const [verificacoes, setVerificacoes] = useState({});
    const [colaborador, setColaborador] = useState(null);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingCardId, setLoadingCardId] = useState(null);
    const [error, setError] = useState(null);
    const { darkMode } = useTheme();
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [dataSelecionada, setDataSelecionada] = useState(() => {
        const savedDate = localStorage.getItem('avaliacaoN3DataSelecionada');
        return savedDate || hojeIso();
    });

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/');
        }
    }, [navigate]);

    const fetchOrdens = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('access_token');
            const [response, colaboradorData] = await Promise.all([
                getOrdensServicoFinalizadas(token, id, dataSelecionada),
                idTecnicoColaborador ? getColaboradorById(token, idTecnicoColaborador).catch(() => null) : Promise.resolve(null)
            ]);
            const registros = response?.registros || [];

            const verificacoesEntries = await Promise.all(
                registros.map(async (ordem) => {
                    try {
                        const verificacao = await verificarAvaliacaoN3(token, ordem.id_os);
                        return [ordem.id_os, verificacao];
                    } catch (err) {
                        return [ordem.id_os, { avaliada: false, avaliacao: null }];
                    }
                })
            );

            setOrdens(registros);
            setTotal(response?.total ?? registros.length);
            setVerificacoes(Object.fromEntries(verificacoesEntries));
            setColaborador(colaboradorData);
        } catch (err) {
            setError(err.message || 'Erro ao carregar ordens de servico');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id && dataSelecionada) {
            fetchOrdens();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, dataSelecionada]);

    const handleDataChange = (e) => {
        const newDate = e.target.value;
        setDataSelecionada(newDate);
        localStorage.setItem('avaliacaoN3DataSelecionada', newDate);
    };

    const handleAvaliacaoSuccess = async (idOs) => {
        setLoadingCardId(idOs);
        const token = localStorage.getItem('access_token');

        try {
            const verificacao = await verificarAvaliacaoN3(token, idOs);
            setVerificacoes(prev => ({
                ...prev,
                [idOs]: verificacao
            }));
        } finally {
            setLoadingCardId(null);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando ordens de servico...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="app-container">
                <Sidebar />
                <div className="error-container">
                    <div className="error-message">{error}</div>
                    <button className="retry-button" onClick={fetchOrdens}>
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
            <Sidebar isVisible={isSidebarVisible} />
            <div className="main-content-avaliar">
                <div className="container-conteudo">
                    <div className="avaliacao-header">
                        <h2>Avaliacoes N3 de {colaborador?.nome_colaborador || `tecnico IXC ${id}`}</h2>
                        <div className="date-filter">
                            <button
                                className={`sidebar-toggle ${darkMode ? 'dark' : 'light'}`}
                                onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                            >
                                {isSidebarVisible ? <DehazeIcon /> : '>'}
                            </button>
                            <label htmlFor="dataFechamento">Data das OS:</label>
                            <input
                                type="date"
                                id="dataFechamento"
                                value={dataSelecionada}
                                onChange={handleDataChange}
                                max={hojeIso()}
                            />
                        </div>
                    </div>

                    <div className="avaliacao-stats">
                        <div className="stat-card">
                            <span className="stat-value">{total}</span>
                            <span className="stat-label">Total de OS</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">
                                {Object.values(verificacoes).filter(item => item?.avaliada).length}
                            </span>
                            <span className="stat-label">OS Avaliadas</span>
                        </div>
                    </div>

                    <div className="avaliacao-list">
                        {ordens.length > 0 ? (
                            ordens.map((ordem) => (
                                <AvaliacaoN3Card
                                    key={ordem.id_os}
                                    os={ordem}
                                    idTecnicoColaborador={idTecnicoColaborador}
                                    idSetor={5}
                                    avaliacaoVerificada={verificacoes[ordem.id_os]}
                                    onSuccess={handleAvaliacaoSuccess}
                                    isLoading={loadingCardId === ordem.id_os}
                                />
                            ))
                        ) : (
                            <div className="no-results">
                                Nenhuma OS finalizada encontrada para esta data
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
