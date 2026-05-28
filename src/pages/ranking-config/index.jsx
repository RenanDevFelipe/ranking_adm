import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/sidebar/index.jsx';
import '../styles.css';
import {
    deleteRankingConfiguracao,
    getRankingConfiguracaoAtiva,
    getRankingConfiguracoes
} from '../../services/api.ts';
import { logout } from '../../utils/auth.js';
import Swal from 'sweetalert2';
import { FaPlus } from 'react-icons/fa';
import DehazeIcon from '@mui/icons-material/Dehaze';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function RankingConfigs() {
    const navigate = useNavigate();
    const [configs, setConfigs] = useState([]);
    const [activeConfig, setActiveConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [darkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode') || 'true'));

    const fetchConfigs = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        setLoading(true);
        setError(null);

        try {
            const [configsData, activeData] = await Promise.all([
                getRankingConfiguracoes(token),
                getRankingConfiguracaoAtiva(token).catch(() => null)
            ]);
            setConfigs(configsData);
            setActiveConfig(activeData);
        } catch (err) {
            if (err.response?.status === 401) {
                logout();
                navigate('/');
                return;
            }
            setError(err.message || 'Erro ao carregar configuracoes do ranking');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchConfigs();
    }, [fetchConfigs]);

    const handleDelete = async (config) => {
        const result = await Swal.fire({
            title: 'Excluir configuracao?',
            text: `Configuracao #${config.id} sera removida.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FF6200',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        try {
            const token = localStorage.getItem('access_token');
            await deleteRankingConfiguracao(token, config.id);
            Swal.fire('Removida!', 'Configuracao removida com sucesso.', 'success');
            fetchConfigs();
        } catch (err) {
            Swal.fire('Erro!', err.message || 'Erro ao remover configuracao.', 'error');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando configuracoes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">{error}</div>
                <button className="retry-button" onClick={() => window.location.reload()}>
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className={`tutorial-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
            <Sidebar isVisible={isSidebarVisible} />
            <main className="main-content-assunto">
                <section className="ranking-page">
                    <header className="ranking-page-header">
                        <button
                            className={`sidebar-toggle ${darkMode ? 'dark' : 'light'}`}
                            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                        >
                            {isSidebarVisible ? <DehazeIcon /> : '>'}
                        </button>
                        <div>
                            <h1>Configuracoes do Ranking</h1>
                            <p>Metas usadas nos calculos diario, mensal e anual</p>
                        </div>
                    </header>

                    {activeConfig && (
                        <div className="ranking-active-config">
                            <span>Configuracao ativa</span>
                            <strong>#{activeConfig.id}</strong>
                            <p>{activeConfig.meta_pontos_os_diaria} pontos diarios, media {activeConfig.meta_media_avaliacoes}</p>
                        </div>
                    )}

                    <div className="ranking-config-grid">
                        {configs.map(config => (
                            <article key={config.id} className="ranking-config-card">
                                <div className="ranking-config-header">
                                    <div>
                                        <h2>Configuracao #{config.id}</h2>
                                        <span className={config.ativo ? 'ranking-badge success' : 'ranking-badge muted'}>
                                            {config.ativo ? 'Ativa' : 'Inativa'}
                                        </span>
                                    </div>
                                    <div className="ranking-config-actions">
                                        <button title="Editar" onClick={() => navigate(`/ranking-configuracao/${config.id}`)}>
                                            <EditIcon />
                                        </button>
                                        <button title="Excluir" onClick={() => handleDelete(config)}>
                                            <DeleteIcon />
                                        </button>
                                    </div>
                                </div>

                                <div className="ranking-detail-grid">
                                    <div><span>Meta diaria</span><strong>{config.meta_pontos_os_diaria} pts</strong></div>
                                    <div><span>Media avaliacoes</span><strong>{config.meta_media_avaliacoes}</strong></div>
                                    <div><span>Dias meta mensal</span><strong>{config.dias_minimos_meta_mensal}</strong></div>
                                    <div><span>Meses meta anual</span><strong>{config.meses_minimos_meta_anual}</strong></div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {!configs.length && (
                        <p className="no-results">Nenhuma configuracao cadastrada.</p>
                    )}
                </section>
            </main>

            <button className="add-button" onClick={() => navigate('/ranking-configuracao/0')}>
                <FaPlus />
            </button>
        </div>
    );
}
