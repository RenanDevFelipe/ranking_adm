import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/sidebar/index.jsx';
import '../styles.css';
import { getColaboradorById, getHistoricosPontuacao } from '../../services/api.ts';
import { useTheme } from '../../context/ThemeContext.js';
import DehazeIcon from '@mui/icons-material/Dehaze';

const hojeIso = () => new Date().toISOString().split('T')[0];
const getRegistros = (historico) => historico?.data || historico?.registros || [];

export default function HistoricoPontuacaoPage({ config }) {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const initialData = queryParams.get('data') || hojeIso();
    const bd = queryParams.get('bd');
    const idTecnico = bd || id;
    const { darkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [historico, setHistorico] = useState(null);
    const [colaborador, setColaborador] = useState(null);
    const [tipoMovimentacao, setTipoMovimentacao] = useState('');
    const [dataInicio, setDataInicio] = useState(initialData);
    const [dataFim, setDataFim] = useState(initialData);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            const params = {
                id_tecnico: idTecnico,
                tipo_movimentacao: tipoMovimentacao || undefined,
                data_inicio: dataInicio || undefined,
                data_fim: dataFim || undefined
            };

            const [colaboradorData, historicoData] = await Promise.all([
                getColaboradorById(token, idTecnico),
                getHistoricosPontuacao(token, config.modulo, params)
            ]);

            setColaborador(colaboradorData);
            setHistorico(historicoData);
        } catch (err) {
            setError(err.message || 'Erro ao carregar historico');
        } finally {
            setLoading(false);
        }
    }, [config.modulo, dataFim, dataInicio, idTecnico, tipoMovimentacao]);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/');
            return;
        }

        fetchData();
    }, [fetchData, navigate]);

    const registros = getRegistros(historico);

    const exportToCSV = () => {
        if (!registros.length) return;

        const headers = [
            'Campo',
            'Movimento',
            'Diferenca',
            'Pontos anteriores',
            'Pontos atuais',
            'Observacao',
            'Avaliador',
            'Data infracao',
            'Data avaliacao'
        ];

        const rows = registros.map(item => [
            item.campo || '-',
            item.tipo_movimentacao || '-',
            Number(item.valor_movimentado ?? ((item.pontuacao_atual - item.pontuacao_anterior) || 0)),
            item.pontuacao_anterior,
            item.pontuacao_atual,
            item.observacao || '-',
            item.nome_avaliador,
            item.data_infracao,
            item.data_avaliacao
        ]);

        const BOM = '\uFEFF';
        const csvContent = BOM + headers.join(';') + '\n' + rows.map(row =>
            row.map(field => {
                const value = String(field ?? '');
                return value.includes('\n') || value.includes(';') ? `"${value.replace(/"/g, '""')}"` : value;
            }).join(';')
        ).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `movimentacoes_${config.modulo}_${colaborador?.nome_colaborador || 'colaborador'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando movimentacoes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Tentar novamente</button>
            </div>
        );
    }

    return (
        <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
            <Sidebar isVisible={isSidebarVisible} />
            <div className="main-content-avaliar">
                <div className="container-conteudo">
                    <button
                        className={`sidebar-toggle ${darkMode ? 'dark' : 'light'}`}
                        onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                    >
                        {isSidebarVisible ? <DehazeIcon /> : '>'}
                    </button>

                    <h2>Movimentacoes {config.titulo}: {colaborador?.nome_colaborador}</h2>

                    <div className="history-filters">
                        <label>
                            Inicio
                            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
                        </label>
                        <label>
                            Fim
                            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
                        </label>
                        <label>
                            Movimento
                            <select value={tipoMovimentacao} onChange={(e) => setTipoMovimentacao(e.target.value)}>
                                <option value="">Todos</option>
                                <option value="REMOCAO">Remocao</option>
                                <option value="DEVOLUCAO">Devolucao</option>
                            </select>
                        </label>
                        <button type="button" className="avaliacao-button" onClick={fetchData}>
                            Filtrar
                        </button>
                        <button type="button" className="export-button" onClick={exportToCSV} disabled={!registros.length}>
                            Exportar CSV
                        </button>
                    </div>

                    <div className="historico-container">
                        {registros.length > 0 ? (
                            <table className="historico-table">
                                <thead>
                                    <tr>
                                        <th>Campo</th>
                                        <th>Movimento</th>
                                        <th>Diferenca</th>
                                        <th>Anterior</th>
                                        <th>Atual</th>
                                        <th>Observacao</th>
                                        <th>Avaliador</th>
                                        <th>Data infracao</th>
                                        <th>Data avaliacao</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registros.map((item) => {
                                        const diferenca = Number(item.valor_movimentado ?? ((item.pontuacao_atual - item.pontuacao_anterior) || 0));
                                        return (
                                            <tr key={item.id_historico}>
                                                <td>{item.campo || '-'}</td>
                                                <td>{item.tipo_movimentacao || '-'}</td>
                                                <td className={diferenca === 0 ? 'no-change' : diferenca > 0 ? 'positive' : 'negative'}>
                                                    {diferenca > 0 ? `+${diferenca}` : diferenca}
                                                </td>
                                                <td>{item.pontuacao_anterior}</td>
                                                <td>{item.pontuacao_atual}</td>
                                                <td>{item.observacao || '-'}</td>
                                                <td>{item.nome_avaliador}</td>
                                                <td>{item.data_infracao}</td>
                                                <td>{item.data_avaliacao}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <p className="no-data">Nenhuma movimentacao encontrada.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
