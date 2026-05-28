import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/sidebar/index.jsx';
import '../styles.css';
import {
    getDashboardProducaoPorDia,
    getDashboardResumo,
    getDashboardTopAssuntos
} from '../../services/api.ts';
import { logout } from '../../utils/auth.js';
import { useTheme } from '../../context/ThemeContext.js';
import DehazeIcon from '@mui/icons-material/Dehaze';

// Datas enviadas para a API no formato ISO: YYYY-MM-DD.
const formatarDataInput = (data) => {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
};

const ontem = () => {
    const data = new Date();
    data.setDate(data.getDate() - 1);
    return formatarDataInput(data);
};

const inicioDoMes = () => {
    const data = new Date();
    data.setDate(1);
    const primeiroDia = formatarDataInput(data);
    return primeiroDia > ontem() ? ontem() : primeiroDia;
};

const formatarNumero = (valor) => Number(valor || 0).toLocaleString('pt-BR');

const formatarPontos = (valor) => Number(valor || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

const formatarData = (valor) => {
    if (!valor) return '';
    return new Date(valor).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

const ordenarProducaoMaisRecente = (producao = []) => {
    return producao.slice().sort((a, b) => {
        return new Date(b.data_finalizacao) - new Date(a.data_finalizacao);
    });
};

export default function Dashboard() {
    const navigate = useNavigate();
    const { darkMode } = useTheme();
    const dataMaxima = ontem();
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [dataResumo, setDataResumo] = useState(dataMaxima);
    const [dataInicio, setDataInicio] = useState(inicioDoMes());
    const [dataFim, setDataFim] = useState(dataMaxima);
    const [resumo, setResumo] = useState(null);
    const [topAssuntos, setTopAssuntos] = useState([]);
    const [producaoPorDia, setProducaoPorDia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Mantem as barras proporcionais mesmo quando a API retorna valores zerados.
    const maiorTotalOs = useMemo(() => {
        return Math.max(...topAssuntos.map((assunto) => Number(assunto.total_os || 0)), 1);
    }, [topAssuntos]);

    const maiorProducao = useMemo(() => {
        return Math.max(...producaoPorDia.map((dia) => Number(dia.total_pontos || 0)), 1);
    }, [producaoPorDia]);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        let isMounted = true;
        const token = localStorage.getItem('access_token');

        const carregarDashboard = async () => {
            try {
                setLoading(true);
                setError(null);

                // As secoes do dashboard sao independentes, entao carregam em paralelo.
                const [resumoData, assuntosData, producaoData] = await Promise.all([
                    getDashboardResumo(dataResumo),
                    getDashboardTopAssuntos(dataInicio, dataFim, 50),
                    getDashboardProducaoPorDia(dataInicio, dataFim, 50)
                ]);

                if (isMounted) {
                    setResumo(resumoData || {});
                    setTopAssuntos(assuntosData || []);
                    setProducaoPorDia(ordenarProducaoMaisRecente(producaoData || []));
                }
            } catch (err) {
                if (isMounted) {
                    if (err.response?.status === 401) {
                        logout();
                        navigate('/');
                        return;
                    }
                    setError(err.message || 'Erro ao carregar dashboard');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (token && dataResumo && dataInicio && dataFim) {
            carregarDashboard();
        }

        return () => {
            isMounted = false;
        };
    }, [dataResumo, dataInicio, dataFim, navigate]);

    const cards = [
        { label: 'Tecnicos ativos', value: resumo?.tecnicos_ativos },
        { label: 'OS finalizadas', value: resumo?.os_finalizadas },
        { label: 'Pontos producao', value: resumo?.pontos_producao, formatter: formatarPontos },
        { label: 'Media qualidade', value: resumo?.media_qualidade, formatter: formatarPontos },
        { label: 'Bateram meta', value: resumo?.tecnicos_bateram_meta },
        { label: 'Meta diaria', value: resumo?.meta_diaria, formatter: formatarPontos }
    ];

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
                <Sidebar isVisible={isSidebarVisible} />
                <div className="error-container">
                    <div className="error-message">{error}</div>
                    <button className="retry-button" onClick={() => window.location.reload()}>
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
            <Sidebar isVisible={isSidebarVisible} />
            <main className="main-content-dashboard">
                <button
                    className={`sidebar-toggle ${darkMode ? 'dark' : 'light'}`}
                    onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                    title="Alternar menu"
                >
                    {isSidebarVisible ? <DehazeIcon /> : '>'}
                </button>

                <div className="dashboard-page">
                    <header className="dashboard-page-header">
                        <div>
                            <h1>Dashboard</h1>
                            <p>Resumo operacional de {formatarData(resumo?.data || dataResumo)}</p>
                        </div>
                        <div className="dashboard-filters dashboard-filters-single">
                            <label>
                                Data do resumo
                                <input
                                    type="date"
                                    value={dataResumo}
                                    max={dataMaxima}
                                    onChange={(e) => setDataResumo(e.target.value)}
                                />
                            </label>
                        </div>
                    </header>

                    <div className="dashboard-section-heading">
                        <div>
                            <h2>Resumo</h2>
                            <span>Indicadores consolidados por data</span>
                        </div>
                    </div>

                    <section className="dashboard-summary-grid">
                        {cards.map((card) => (
                            <article className="dashboard-summary-card" key={card.label}>
                                <span>{card.label}</span>
                                <strong>{card.formatter ? card.formatter(card.value) : formatarNumero(card.value)}</strong>
                            </article>
                        ))}
                    </section>

                    <div className="dashboard-section-heading dashboard-chart-heading">
                        <div>
                            <h2>Graficos</h2>
                            <span>Top assuntos e producao por dia no periodo</span>
                        </div>
                        <div className="dashboard-filters">
                            <label>
                                Inicio
                                <input
                                    type="date"
                                    value={dataInicio}
                                    max={dataFim}
                                    onChange={(e) => setDataInicio(e.target.value)}
                                />
                            </label>
                            <label>
                                Fim
                                <input
                                    type="date"
                                    value={dataFim}
                                    min={dataInicio}
                                    max={dataMaxima}
                                    onChange={(e) => setDataFim(e.target.value)}
                                />
                            </label>
                        </div>
                    </div>

                    <section className="dashboard-panels">
                        <div className="dashboard-panel">
                            <div className="dashboard-panel-header">
                                <h2>Top assuntos</h2>
                                <span>{topAssuntos.length} registros</span>
                            </div>

                            <div className="dashboard-bars">
                                {topAssuntos.length > 0 ? topAssuntos.slice(0, 12).map((assunto) => (
                                    <div className="dashboard-bar-row" key={assunto.id_assunto_ixc}>
                                        <div className="dashboard-bar-title">
                                            <span>{assunto.nome_assunto_ixc}</span>
                                            <strong>{formatarNumero(assunto.total_os)} OS</strong>
                                        </div>
                                        <div className="dashboard-bar-track">
                                            <div
                                                className="dashboard-bar-fill"
                                                style={{ width: `${(Number(assunto.total_os || 0) / maiorTotalOs) * 100}%` }}
                                            />
                                        </div>
                                        <small>{formatarPontos(assunto.total_pontos)} pontos</small>
                                    </div>
                                )) : (
                                    <p className="no-results">Nenhum assunto encontrado no periodo</p>
                                )}
                            </div>
                        </div>

                        <div className="dashboard-panel">
                            <div className="dashboard-panel-header">
                                <h2>Producao por dia</h2>
                                <span>{producaoPorDia.length} dias</span>
                            </div>

                            <div className="dashboard-production-list">
                                {producaoPorDia.length > 0 ? producaoPorDia.map((dia) => (
                                    <div className="dashboard-production-item" key={dia.data_finalizacao}>
                                        <div>
                                            <strong>{formatarData(dia.data_finalizacao)}</strong>
                                            <span>{formatarNumero(dia.total_os)} OS</span>
                                        </div>
                                        <div className="dashboard-production-track">
                                            <div
                                                className="dashboard-production-fill"
                                                style={{ width: `${(Number(dia.total_pontos || 0) / maiorProducao) * 100}%` }}
                                            />
                                        </div>
                                        <strong>{formatarPontos(dia.total_pontos)}</strong>
                                    </div>
                                )) : (
                                    <p className="no-results">Nenhuma producao encontrada no periodo</p>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
