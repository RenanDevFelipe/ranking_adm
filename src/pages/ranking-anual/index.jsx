import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/sidebar/index.jsx';
import '../styles.css';
import { getRankingAnual } from '../../services/api.ts';
import { logout } from '../../utils/auth.js';
import DehazeIcon from '@mui/icons-material/Dehaze';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import DescriptionIcon from '@mui/icons-material/Description';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const currentYear = new Date().getFullYear();
const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const formatNumber = (value, digits = 2) => {
    const number = Number(value || 0);
    return Number.isFinite(number) ? number.toFixed(digits).replace('.', ',') : '0,00';
};

const getMetaPercentual = (item) => {
    const mesesMeta = Number(item.meses_bateu_meta || 0);
    const minimo = Number(item.meses_minimos_meta_anual || 0);
    return minimo > 0 ? Math.min((mesesMeta / minimo) * 100, 100) : 0;
};

export default function RankingAnual() {
    const [rankingData, setRankingData] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});
    const [year, setYear] = useState(currentYear);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [darkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode') || 'true'));

    const totals = useMemo(() => {
        return rankingData.reduce((acc, item) => {
            acc.totalOs += Number(item.total_os || 0);
            acc.totalPontos += Number(item.total_pontos_producao || 0);
            acc.metas += Number(item.meses_bateu_meta || 0);
            return acc;
        }, { totalOs: 0, totalPontos: 0, metas: 0 });
    }, [rankingData]);

    useEffect(() => {
        const fetchRanking = async () => {
            const token = localStorage.getItem('access_token');
            setLoading(true);
            setError(null);

            try {
                const data = await getRankingAnual(token, year);
                setRankingData(data);
            } catch (err) {
                if (err.response?.status === 401) {
                    logout();
                    return;
                }
                setError(err.message || 'Erro ao carregar ranking anual');
            } finally {
                setLoading(false);
            }
        };

        fetchRanking();
    }, [year]);

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
                            <h1>Ranking Anual</h1>
                            <p>Resultado acumulado por ano e desempenho mensal</p>
                        </div>
                    </header>

                    <div className="ranking-toolbar">
                        <label>
                            Ano
                            <input
                                type="number"
                                min="2020"
                                max={currentYear}
                                value={year}
                                onChange={(event) => setYear(event.target.value)}
                            />
                        </label>
                    </div>

                    {rankingData.length > 0 && (
                        <section className="ranking-podium-section" aria-label="Podio do ranking anual">
                            <div className="ranking-podium-header">
                                <div>
                                    <h2><EmojiEventsIcon /> Top 3 - Ranking Geral</h2>
                                    <p>Os melhores desempenhos do ano selecionado.</p>
                                </div>
                                <span><AutoAwesomeIcon /> Ranking atualizado</span>
                            </div>

                            <div className="ranking-podium">
                                {[
                                    { item: rankingData[1], position: 2 },
                                    { item: rankingData[0], position: 1 },
                                    { item: rankingData[2], position: 3 }
                                ].filter(slot => Boolean(slot.item)).map(({ item, position }) => {
                                    const metaPercentual = getMetaPercentual(item);

                                    return (
                                        <article key={`${position}-${item.id_colaborador || item.id_ixc || item.nome_tecnico}`} className={`ranking-podium-card place-${position}`}>
                                            <div className="ranking-podium-medal">
                                                <EmojiEventsIcon />
                                                <span>{position}</span>
                                            </div>
                                            <div className="ranking-podium-avatar">
                                                <PersonOutlineIcon />
                                            </div>
                                            <h2>{item.nome_tecnico}</h2>
                                            <div className="ranking-podium-score">{formatNumber(item.media_geral_anual)}</div>
                                            <p>{item.total_os || 0} OS - {item.total_pontos_producao || 0} pts</p>
                                            <strong>{item.meses_bateu_meta || 0}/{item.meses_minimos_meta_anual || 0} meses com meta</strong>
                                            <div className="ranking-podium-progress">
                                                <span style={{ width: `${metaPercentual}%` }} />
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
                                <span>Meses com meta</span>
                                <strong>{totals.metas}</strong>
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
                                const id = item.id_colaborador || item.id_ixc || index;
                                const expanded = Boolean(expandedRows[id]);
                                return (
                                    <article key={`${id}-${index}`} className="ranking-card">
                                        <button
                                            className="ranking-card-main"
                                            onClick={() => setExpandedRows(prev => ({ ...prev, [id]: !expanded }))}
                                        >
                                            <div className="ranking-position">{index + 1}</div>
                                            <div className="ranking-technician">
                                                <h2>{item.nome_tecnico}</h2>
                                                <span>IXC #{item.id_ixc} - {item.ano}</span>
                                            </div>
                                            <div className="ranking-metrics">
                                                <span><strong>{item.total_os || 0}</strong> OS</span>
                                                <span><strong>{item.total_pontos_producao || 0}</strong> pts</span>
                                                <span><strong>{formatNumber(item.media_geral_anual)}</strong> media</span>
                                                <span className={item.bateu_meta_anual ? 'ranking-badge success' : 'ranking-badge muted'}>
                                                    {item.meses_bateu_meta || 0}/{item.meses_minimos_meta_anual || 0} meses
                                                </span>
                                            </div>
                                            {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                        </button>

                                        {expanded && (
                                            <div className="ranking-card-details">
                                                <div className="ranking-month-grid">
                                                    {(item.meses || []).map(month => (
                                                        <div key={month.mes} className={month.bateu_meta_mensal ? 'ranking-month success' : 'ranking-month'}>
                                                            <span>{monthNames[Number(month.mes) - 1] || month.mes}</span>
                                                            <strong>{formatNumber(month.media_geral_mensal)}</strong>
                                                            <small>{month.total_os} OS - {month.total_pontos_producao} pts</small>
                                                            <small>Qualidade {formatNumber(month.qualidade_media_mensal)}</small>
                                                        </div>
                                                    ))}
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
