import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from "../../../components/sidebar/index.jsx";
import "../../styles.css";
import { getColaboradorById, getHistoricoRH } from '../../../services/api.ts';
import { useTheme } from '../../../context/ThemeContext.js';
import DehazeIcon from '@mui/icons-material/Dehaze';

export default function Movimentacoes() {
    const { id } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialData = queryParams.get('data');
    const bd = queryParams.get('bd');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [historico, setHistorico] = useState([]);
    const [colaborador, setColaborador] = useState(null);
    const { darkMode } = useTheme();
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const exportToCSV = () => {
        if (!historico.registros || historico.registros.length === 0) return;

        const headers = [
            'Diferença',
            'Pontos Anteriores',
            'Pontos Atuais',
            'Observação',
            'Avaliador',
            'Data Infração',
            'Data avaliação'
        ];

        const rows = historico.registros.map(item => {
            const diferenca = item.pontuacao_atual - item.pontuacao_anterior;
            return [
                diferenca === 0 ? 'Sem Alterações' : (diferenca > 0 ? `+${diferenca}` : diferenca),
                item.pontuacao_anterior,
                item.pontuacao_atual,
                item.observacao || '-',
                item.nome_avaliador,
                item.data_infracao,
                item.data_avaliacao
            ];
        });

        const BOM = "\uFEFF";
        let csvContent = BOM + headers.join(';') + '\n'
            + rows.map(row => 
                row.map(field => {
                    if (typeof field === 'string' && (field.includes('\n') || field.includes(';') || field.includes(','))) {
                        return `"${field.replace(/"/g, '""')}"`;
                    }
                    return field;
                }).join(';')
            ).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute(
            'download', 
            `movimentacoes_${colaborador?.nome_colaborador || 'colaborador'}_${initialData || 'data'}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
    };

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            const [colaboradorData, historicoData] = await Promise.all([
                getColaboradorById(token, bd),
                getHistoricoRH(token, bd, initialData)
            ]);

            setColaborador(colaboradorData);
            setHistorico(historicoData || []);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }, [bd, initialData]);

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        // Navega para a mesma rota mas com a nova data
        navigate(`/rh/movimentacoes/${id}?bd=${bd}&data=${newDate}`);
    };

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/');
        } else {
            fetchData();
        }
    }, [fetchData, navigate]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando dados do colaborador...</p>
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
                        onClick={toggleSidebar}
                    >
                        {isSidebarVisible ? <DehazeIcon /> : '►'}
                    </button>

                    <h2>Movimentações do Colaborador: {colaborador?.nome_colaborador}</h2>
                    
                    <div className="date-filter">
                        <label htmlFor="dataFiltro">Filtrar por data:</label>
                        <input
                            type="date"
                            id="dataFiltro"
                            value={initialData}
                            onChange={handleDateChange}
                            className="date-input"
                        />
                        <button 
                            onClick={exportToCSV}
                            className="export-button"
                            disabled={!historico.registros || historico.registros.length === 0}
                        >
                            Exportar para CSV
                        </button>
                        <span className="export-hint">(Abrir com Excel)</span>
                    </div>

                    <div className="historico-container">
                        {historico.total > 0 ? (
                            <table className="historico-table">
                                <thead>
                                    <tr>
                                        <th>Diferença</th>
                                        <th>Pontos anteriores</th>
                                        <th>Pontos atuais</th>
                                        <th>Observação</th>
                                        <th>Avaliador</th>
                                        <th>Data Infração</th>
                                        <th>Data Avaliação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historico.registros.map((item, index) => (
                                        <tr key={index}>
                                            <td className={
                                                item.pontuacao_atual - item.pontuacao_anterior === 0 ? "no-change" :
                                                    item.pontuacao_atual - item.pontuacao_anterior > 0 ? "positive" : "negative"
                                            }>
                                                {item.pontuacao_atual - item.pontuacao_anterior === 0
                                                    ? "Sem Alterações"
                                                    : (item.pontuacao_atual - item.pontuacao_anterior > 0
                                                        ? `+${item.pontuacao_atual - item.pontuacao_anterior}`
                                                        : item.pontuacao_atual - item.pontuacao_anterior)
                                                }
                                            </td>
                                            <td>{item.pontuacao_anterior}</td>
                                            <td>{item.pontuacao_atual}</td>
                                            <td>{item.observacao || '-'}</td>
                                            <td>{item.nome_avaliador}</td>
                                            <td>{item.data_infracao}</td>
                                            <td>{item.data_avaliacao}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="no-data">Nenhuma movimentação encontrada para esta data.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}