import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from "../../../components/sidebar/index.jsx";
import "../../styles.css";
import AvaliacaoCard from '../../../components/avaliacaoCard/index.jsx';
import { getAvaliacoes } from '../../../services/api.ts';
import { useTheme } from '../../../context/ThemeContext.js';
import DehazeIcon from '@mui/icons-material/Dehaze';

export default function Avaliar() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [retorno, setRetorno] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingCard, setLoadingCard] = useState(false);
    const [loadingCardId, setLoadingCardId] = useState(null);
    const [error, setError] = useState(null);
    const { darkMode } = useTheme();
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    // Recupera a data do localStorage ou usa a data atual
    const [dataSelecionada, setDataSelecionada] = useState(() => {
        const savedDate = localStorage.getItem('avaliacaoDataSelecionada');
        return savedDate || new Date().toISOString().split('T')[0];
    });

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        const fetchAvaliacoes = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('access_token');
                const response = await getAvaliacoes(token, id, dataSelecionada);
                setRetorno(response || {});
                setAvaliacoes(response.registros || []);

            } catch (err) {
                console.error("Erro ao buscar avaliações:", err);
                setError(err.message || 'Erro ao carregar avaliações');
            } finally {
                setLoading(false);
            }
        };

        if (id && dataSelecionada) {
            fetchAvaliacoes();
        }
    }, [id, dataSelecionada]);

    const handleDataChange = (e) => {
        const newDate = e.target.value;
        setDataSelecionada(newDate);
        // Armazena a data selecionada no localStorage
        localStorage.setItem('avaliacaoDataSelecionada', newDate);
    };

    // Função para recarregar as avaliações mantendo a data
    const handleAvaliacaoSuccess = (cardId) => {
        setLoadingCardId(cardId); // Ativa o loading apenas para este card
        const token = localStorage.getItem('access_token');

        getAvaliacoes(token, id, dataSelecionada)
            .then(response => {
                setRetorno(response || {});
                setAvaliacoes(response.registros || []);
            })
            .catch(err => {
                console.error("Erro ao recarregar avaliações:", err);
            })
            .finally(() => {
                setLoadingCardId(null); // Desativa o loading quando completo
                localStorage.removeItem('avaliacaoDataSelecionada');
            });
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

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando ordens de serviço...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="app-container">
                <Sidebar />
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
        <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
            <Sidebar isVisible={isSidebarVisible} />
            <div className="main-content-avaliar">
                <div className="container-conteudo">
                    <div className="avaliacao-header">
                        <h2>Avaliações do Colaborador {retorno.nome_tecnico}</h2>
                        <div className="date-filter">
                            <button
                                className={`sidebar-toggle ${darkMode ? 'dark' : 'light'}`}
                                onClick={toggleSidebar}
                            >
                                {isSidebarVisible ? <DehazeIcon /> : '►'}
                            </button>
                            <label htmlFor="dataFechamento">Filtrar por data:</label>
                            <input
                                type="date"
                                id="dataFechamento"
                                value={dataSelecionada}
                                onChange={handleDataChange}
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>

                    <div className="avaliacao-stats">
                        <div className="stat-card">
                            <span className="stat-value">{avaliacoes.length}</span>
                            <span className="stat-label">Total de OS</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">
                                {avaliacoes.filter(a => a.status === 'Finalizada').length}
                            </span>
                            <span className="stat-label">OS Finalizadas</span>
                        </div>
                    </div>

                    <div className="avaliacao-list">
                        {avaliacoes.length > 0 ? (
                            avaliacoes.map((avaliacao) => (
                                <AvaliacaoCard
                                    key={avaliacao.id}
                                    avaliacao={{
                                        ...avaliacao,
                                        finalizacaoFormatada: formatarData(avaliacao.finalizacao)
                                    }}
                                    retorno={{
                                        ...retorno,
                                        onAvaliacaoSuccess: () => handleAvaliacaoSuccess(avaliacao.id)
                                    }}
                                    isLoading={loadingCardId === avaliacao.id}
                                />
                            ))
                        ) : (
                            <div className="no-results">
                                Nenhuma avaliação encontrada para esta data
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}