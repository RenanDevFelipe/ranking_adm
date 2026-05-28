import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/sidebar/index.jsx';
import '../styles.css';
import { getRankingDiario, syncProducaoOs } from '../../services/api.ts';
import { logout } from '../../utils/auth.js';
import DehazeIcon from '@mui/icons-material/Dehaze';
import SyncIcon from '@mui/icons-material/Sync';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import DescriptionIcon from '@mui/icons-material/Description';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Swal from 'sweetalert2';

const today = new Date().toISOString().split('T')[0];

const formatNumber = (value, digits = 2) => Number(value || 0).toFixed(digits).replace('.', ',');

const formatDate = (value) => {
    if (!value) return '-';
    return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR');
};

const getTecnicoId = (item, index) => {
    return item.id_tecnico || item.id_ixc || item.id_colaborador || `${item.nome_tecnico || 'tecnico'}-${item.data || ''}-${index}`;
};

export default function RankingDiario() {
    const [rankingData, setRankingData] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});
    const [searchDate, setSearchDate] = useState(today);
    const [syncForm, setSyncForm] = useState({ data_inicio: today, data_fim: today, rp: 500 });
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState(null);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [darkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode') || 'true'));
    const isAdmin = Number(localStorage.getItem('user_role') || 0) === 1;

    const totals = useMemo(() => {
        return rankingData.reduce((acc, item) => {
            acc.totalOs += Number(item.producao?.total_os || 0);
            acc.totalPontos += Number(item.producao?.total_pontos || 0);
            acc.bateramMeta += item.producao?.bateu_meta ? 1 : 0;
            acc.mediaGeral += Number(item.ranking?.media_geral || 0);
            return acc;
        }, { totalOs: 0, totalPontos: 0, bateramMeta: 0, mediaGeral: 0 });
    }, [rankingData]);

    const fetchRanking = async (date) => {
        const token = localStorage.getItem('access_token');
        setLoading(true);
        setError(null);

        try {
            const data = await getRankingDiario(token, date);
            setRankingData(data);
        } catch (err) {
            if (err.response?.status === 401) {
                logout();
                return;
            }
            setError(err.message || 'Erro ao carregar ranking diario');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRanking(searchDate);
    }, [searchDate]);

    const handleSync = async (event) => {
        event.preventDefault();
        setSyncing(true);

        try {
            const token = localStorage.getItem('access_token');
            const response = await syncProducaoOs(token, syncForm);
            const total = response?.data?.total_sincronizadas ?? 0;
            await Swal.fire('Sincronizado!', `${total} registros sincronizados com sucesso.`, 'success');
            fetchRanking(searchDate);
        } catch (err) {
            Swal.fire('Erro!', err.message || 'Erro ao sincronizar producao.', 'error');
        } finally {
            setSyncing(false);
        }
    };

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
                            <h1>Ranking Diario</h1>
                            <p>Producao, qualidade e media geral por tecnico</p>
                        </div>
                    </header>

                    <div className={`ranking-top-controls ${isAdmin ? '' : 'single'}`}>
                        <div className="ranking-toolbar">
                            <label>
                                Data
                                <input
                                    type="date"
                                    value={searchDate}
                                    max={today}
                                    onChange={(event) => setSearchDate(event.target.value)}
                                />
                            </label>
                        </div>

                        {isAdmin && (
                            <form className="ranking-sync-panel ranking-sync-panel-featured" onSubmit={handleSync}>
                                <div className="ranking-sync-intro">
                                    <div className="ranking-sync-icon">
                                        <SyncIcon />
                                    </div>
                                    <div>
                                        <h2>Sincronizar producao</h2>
                                        <p>Atualize as OS finalizadas antes de consultar o ranking.</p>
                                        <button type="submit" disabled={syncing}>
                                            <SyncIcon />
                                            {syncing ? 'Sincronizando...' : 'Sincronizar'}
                                        </button>
                                    </div>
                                </div>
                                <label>
                                    Inicio
                                    <input
                                        type="date"
                                        value={syncForm.data_inicio}
                                        max={today}
                                        onChange={(event) => setSyncForm(prev => ({ ...prev, data_inicio: event.target.value }))}
                                        required
                                    />
                                </label>
                                <label>
                                    Fim
                                    <input
                                        type="date"
                                        value={syncForm.data_fim}
                                        max={today}
                                        onChange={(event) => setSyncForm(prev => ({ ...prev, data_fim: event.target.value }))}
                                        required
                                    />
                                </label>
                                <label>
                                    Limite
                                    <input
                                        type="number"
                                        min="1"
                                        value={syncForm.rp}
                                        onChange={(event) => setSyncForm(prev => ({ ...prev, rp: event.target.value }))}
                                        required
                                    />
                                </label>
                            </form>
                        )}
                    </div>

                    {rankingData.length > 0 && (
                        <section className="ranking-podium-section" aria-label="Podio do ranking diario">
                            <div className="ranking-podium-header">
                                <div>
                                    <h2><EmojiEventsIcon /> Top 3 - Ranking Geral</h2>
                                    <p>Os melhores desempenhos do periodo selecionado.</p>
                                </div>
                                <span><AutoAwesomeIcon /> Ranking atualizado</span>
                            </div>

                            <div className="ranking-podium">
                                {[
                                    { item: rankingData[1], position: 2 },
                                    { item: rankingData[0], position: 1 },
                                    { item: rankingData[2], position: 3 }
                                ].filter(slot => Boolean(slot.item)).map(({ item, position }) => {
                                    return (
                                        <article key={`${position}-${item.id_tecnico || item.id_colaborador || item.nome_tecnico}`} className={`ranking-podium-card place-${position}`}>
                                            <div className="ranking-podium-medal">
                                                <EmojiEventsIcon />
                                                <span>{position}</span>
                                            </div>
                                            <div className="ranking-podium-avatar">
                                                <PersonOutlineIcon />
                                            </div>
                                            <h2>{item.nome_tecnico}</h2>
                                            <div className="ranking-podium-score">{formatNumber(item.ranking?.media_geral)}</div>
                                            <p>{item.producao?.total_os || 0} OS - {item.producao?.total_pontos || 0} pts</p>
                                            <strong>{item.producao?.percentual_meta || 0}% meta</strong>
                                            <div className="ranking-podium-progress">
                                                <span style={{ width: `${Math.min(Number(item.producao?.percentual_meta || 0), 100)}%` }} />
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    <div className="ranking-summary-grid">
                        <div className="ranking-summary-card">
                            <div className="ranking-summary-icon people"><GroupsIcon /></div>
                            <div>
                                <span>Tecnicos</span>
                                <strong>{rankingData.length}</strong>
                            </div>
                        </div>
                        <div className="ranking-summary-card">
                            <div className="ranking-summary-icon orders"><DescriptionIcon /></div>
                            <div>
                                <span>Total de OS</span>
                                <strong>{totals.totalOs}</strong>
                            </div>
                        </div>
                        <div className="ranking-summary-card">
                            <div className="ranking-summary-icon points"><QueryStatsIcon /></div>
                            <div>
                                <span>Pontos producao</span>
                                <strong>{totals.totalPontos}</strong>
                            </div>
                        </div>
                        <div className="ranking-summary-card">
                            <div className="ranking-summary-icon target"><TrackChangesIcon /></div>
                            <div>
                                <span>Bateram meta</span>
                                <strong>{totals.bateramMeta}</strong>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-container ranking-loading">
                            <div className="spinner"></div>
                            <p>Carregando ranking...</p>
                        </div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : (
                        <div className="ranking-list">
                            {rankingData.map((item, index) => {
                                const tecnicoId = getTecnicoId(item, index);
                                const expanded = Boolean(expandedRows[tecnicoId]);
                                return (
                                    <article key={tecnicoId} className="ranking-card">
                                        <button
                                            className="ranking-card-main"
                                            onClick={() => setExpandedRows(prev => ({ ...prev, [tecnicoId]: !expanded }))}
                                        >
                                            <div className="ranking-position">{index + 1}</div>
                                            <div className="ranking-technician">
                                                <h2>{item.nome_tecnico}</h2>
                                                <span>IXC #{item.id_tecnico || item.id_ixc || '-'} - {formatDate(item.data)}</span>
                                            </div>
                                            <div className="ranking-metrics">
                                                <span><strong>{item.producao?.total_os || 0}</strong> OS</span>
                                                <span><strong>{item.producao?.total_pontos || 0}</strong> pts</span>
                                                <span><strong>{formatNumber(item.ranking?.media_geral)}</strong> media</span>
                                                <span className={item.producao?.bateu_meta ? 'ranking-badge success' : 'ranking-badge muted'}>
                                                    {item.producao?.percentual_meta || 0}% meta
                                                </span>
                                            </div>
                                            {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                        </button>

                                        {expanded && (
                                            <div className="ranking-card-details">
                                                <div className="ranking-detail-grid">
                                                    <div><span>Nota producao</span><strong>{formatNumber(item.ranking?.nota_producao)}</strong></div>
                                                    <div><span>Media qualidade</span><strong>{formatNumber(item.qualidade?.media_geral ?? item.ranking?.nota_qualidade)}</strong></div>
                                                    <div><span>Meta diaria</span><strong>{item.producao?.meta_diaria || 0} pts</strong></div>
                                                </div>

                                                <div className="ranking-quality-grid">
                                                    {Object.entries(item.qualidade?.por_setor || {}).map(([setor, value]) => (
                                                        <span key={setor}>{setor.toUpperCase()}: <strong>{formatNumber(value)}</strong></span>
                                                    ))}
                                                </div>

                                                <div className="ranking-detail-table">
                                                    <div className="ranking-detail-row header">
                                                        <span>OS</span>
                                                        <span>Assunto</span>
                                                        <span>Pontos</span>
                                                    </div>
                                                    {(item.producao?.detalhes || []).map(os => (
                                                        <div key={os.id_os} className="ranking-detail-row">
                                                            <span>#{os.id_os}</span>
                                                            <span>{os.id_assunto_ixc} - {os.nome_assunto_ixc || os.nome_assunto || 'Assunto nao informado'}</span>
                                                            <span>{os.pontos}</span>
                                                        </div>
                                                    ))}
                                                    {!item.producao?.detalhes?.length && (
                                                        <p className="ranking-empty">Nenhuma OS registrada nesta data.</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
