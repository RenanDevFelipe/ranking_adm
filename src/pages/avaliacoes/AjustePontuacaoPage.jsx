import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/sidebar/index.jsx';
import '../styles.css';
import { ajustarPontuacao, getColaboradorById } from '../../services/api.ts';
import { useTheme } from '../../context/ThemeContext.js';
import Swal from 'sweetalert2';
import DehazeIcon from '@mui/icons-material/Dehaze';

const hojeIso = () => new Date().toISOString().split('T')[0];

export default function AjustePontuacaoPage({ config }) {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const bd = queryParams.get('bd');
    const idTecnico = bd || id;
    const { darkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [colaborador, setColaborador] = useState(null);
    const [dataSelecionada, setDataSelecionada] = useState(hojeIso());
    const [campoSelecionado, setCampoSelecionado] = useState(config.campos[0]?.campo || '');
    const [tipoMovimentacao, setTipoMovimentacao] = useState('REMOCAO');
    const [pontos, setPontos] = useState(config.campos[0]?.pontos || 0);
    const [observacao, setObservacao] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    const campoAtual = config.campos.find(item => item.campo === campoSelecionado);

    const fetchColaborador = useCallback(async () => {
        try {
            const token = localStorage.getItem('access_token');
            const colaboradorData = await getColaboradorById(token, idTecnico);
            setColaborador(colaboradorData);
        } catch (err) {
            setError(err.message || 'Erro ao carregar colaborador');
        } finally {
            setLoading(false);
        }
    }, [idTecnico]);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/');
            return;
        }

        fetchColaborador();
    }, [fetchColaborador, navigate]);

    useEffect(() => {
        if (campoAtual) {
            setPontos(campoAtual.pontos);
        }
    }, [campoAtual]);

    const handleCampoChange = (e) => {
        setCampoSelecionado(e.target.value);
    };

    const handleMovimentacoesClick = () => {
        navigate(`${config.movimentacoesPath}/${id}?bd=${bd || ''}&data=${dataSelecionada}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!observacao.trim()) {
            Swal.fire('Atencao!', 'Informe uma observacao para registrar o ajuste.', 'warning');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('access_token');
            const payload = {
                id_tecnico: Number(idTecnico),
                data_referencia: dataSelecionada,
                campo: campoSelecionado,
                pontos: Number(pontos),
                tipo_movimentacao: tipoMovimentacao,
                observacao: observacao.trim()
            };

            const response = await ajustarPontuacao(token, config.modulo, payload);

            await Swal.fire(
                'Sucesso!',
                response?.message || 'Pontuacao ajustada com sucesso.',
                'success'
            );

            setObservacao('');
        } catch (err) {
            Swal.fire('Erro!', err.message || 'Erro ao ajustar pontuacao.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                    >
                        {isSidebarVisible ? <DehazeIcon /> : '>'}
                    </button>

                    <div className="adjustment-page-header">
                        <div>
                            <h2>{config.titulo} de {colaborador?.nome_colaborador}</h2>
                            <p>Adicione ou remova pontos por campo do checklist.</p>
                        </div>
                        <button type="button" className="avaliacao-button" onClick={handleMovimentacoesClick}>
                            Movimentacoes
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="adjustment-form">
                        <section className="adjustment-panel">
                            <div className="adjustment-grid">
                                <label>
                                    Data de referencia
                                    <input
                                        type="date"
                                        value={dataSelecionada}
                                        onChange={(e) => setDataSelecionada(e.target.value)}
                                        required
                                    />
                                </label>

                                <label>
                                    Campo
                                    <select value={campoSelecionado} onChange={handleCampoChange} required>
                                        {config.campos.map(item => (
                                            <option key={item.campo} value={item.campo}>
                                                {item.titulo}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label>
                                    Movimento
                                    <select
                                        value={tipoMovimentacao}
                                        onChange={(e) => setTipoMovimentacao(e.target.value)}
                                        required
                                    >
                                        <option value="REMOCAO">Remover pontos</option>
                                        <option value="DEVOLUCAO">Adicionar pontos</option>
                                    </select>
                                </label>

                                <label>
                                    Pontos
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={pontos}
                                        onChange={(e) => setPontos(e.target.value)}
                                        required
                                    />
                                </label>
                            </div>

                            <label className="adjustment-observation">
                                Observacao
                                <textarea
                                    value={observacao}
                                    onChange={(e) => setObservacao(e.target.value)}
                                    placeholder="Descreva o motivo do ajuste"
                                    required
                                />
                            </label>
                        </section>

                        <button type="submit" className="submit-button" disabled={isSubmitting}>
                            {isSubmitting ? 'Enviando...' : 'Enviar ajuste'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
