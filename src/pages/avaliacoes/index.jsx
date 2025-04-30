import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from "../../components/sidebar";
import "../styles.css";
import AvaliacaoCard from '../../components/avaliacaoCard';
import { getAvaliacoes } from '../../services/api.ts';
import { useTheme } from '../../context/ThemeContext';

export default function Avaliar() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dataSelecionada, setDataSelecionada] = useState('');
    const { darkMode } = useTheme();

    // Define a data inicial (hoje)
    useEffect(() => {
        const currentDate = new Date();
        const day = currentDate.getDate().toString().padStart(2, '0');
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const year = currentDate.getFullYear();
        setDataSelecionada(`${year}-${month}-${day}`);
    }, []);

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

                setAvaliacoes(response || []);
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
        setDataSelecionada(e.target.value);
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
            <Sidebar />
            <div className="main-content">
                <div className="container-conteudo">
                    <div className="avaliacao-header">
                        <h2>Avaliações do Colaborador</h2>
                        <div className="date-filter">
                            <label htmlFor="dataFechamento">Filtrar por data:</label>
                            <input
                                type="date"
                                id="dataFechamento"
                                value={dataSelecionada}
                                onChange={handleDataChange}
                                max={new Date().toISOString().split('T')[0]} // Limita até hoje
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