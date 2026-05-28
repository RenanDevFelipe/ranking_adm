import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/sidebar/index.jsx';
import '../styles.css';
import {
    deleteIxcFinalizacaoConfig,
    getIxcFinalizacaoConfigs
} from '../../services/api.ts';
import { logout } from '../../utils/auth.js';
import Swal from 'sweetalert2';
import { FaPlus } from 'react-icons/fa';
import DehazeIcon from '@mui/icons-material/Dehaze';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RuleIcon from '@mui/icons-material/Rule';

const getAssuntoLabel = (config) => {
    const assunto = config.checklist_assunto || config.assunto || {};
    const nome = assunto.nome_assunto_ixc || config.nome_assunto_ixc || 'Assunto nao informado';
    const idIxc = assunto.id_assunto_ixc || config.id_assunto_ixc;
    return idIxc ? `#${idIxc} - ${nome}` : nome;
};

const getCondicaoLabel = (config) => {
    if (!config.id_item_condicao) return 'Sem condicao';
    return `Item #${config.id_item_condicao}: ${String(config.resposta_condicao)}`;
};

export default function IxcFinalizacaoConfigs() {
    const navigate = useNavigate();
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [darkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode') || 'true'));

    const fetchConfigs = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        setLoading(true);
        setError(null);

        try {
            const data = await getIxcFinalizacaoConfigs(token);
            setConfigs(Array.isArray(data) ? data : []);
        } catch (err) {
            if (err.response?.status === 401) {
                logout();
                navigate('/');
                return;
            }
            setError(err.message || 'Erro ao carregar finalizacoes IXC');
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
            await deleteIxcFinalizacaoConfig(token, config.id);
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
                <p>Carregando finalizacoes IXC...</p>
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
                <section className="subject-page">
                    <header className="subject-header">
                        <button
                            className={`sidebar-toggle ${darkMode ? 'dark' : 'light'}`}
                            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                        >
                            {isSidebarVisible ? <DehazeIcon /> : '>'}
                        </button>
                        <div>
                            <h1>Finalizacao IXC</h1>
                            <p>Configure como o N3 fecha as OS abertas do atendimento</p>
                        </div>
                    </header>

                    <div className="subject-grid">
                        {configs.map(config => (
                            <article key={config.id} className="subject-card finalizacao-config-card">
                                <div className="subject-card-header">
                                    <div>
                                        <span>Configuracao #{config.id}</span>
                                        <h2>{getAssuntoLabel(config)}</h2>
                                    </div>
                                    <span className={config.ativo ? 'ranking-badge success' : 'ranking-badge muted'}>
                                        {config.ativo ? 'Ativa' : 'Inativa'}
                                    </span>
                                </div>

                                <div className="subject-card-link">
                                    <RuleIcon />
                                    <div>
                                        <span>Condicao</span>
                                        <strong>{getCondicaoLabel(config)}</strong>
                                        <small>Ordem {config.ordem_execucao || 1} - mensagem {config.origem_mensagem}</small>
                                    </div>
                                </div>

                                <div className="ranking-detail-grid">
                                    <div><span>Finaliza fluxo</span><strong>{config.finalizar_atendimento || 'N'}</strong></div>
                                    <div><span>Resposta IXC</span><strong>{config.payload?.id_resposta || '-'}</strong></div>
                                </div>

                                <div className="ixc-card-actions">
                                    <button title="Editar" onClick={() => navigate(`/ixc-finalizacao-config/${config.id}`)}>
                                        <EditIcon />
                                    </button>
                                    <button title="Excluir" onClick={() => handleDelete(config)}>
                                        <DeleteIcon />
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>

                    {!configs.length && (
                        <p className="no-results">Nenhuma configuracao cadastrada.</p>
                    )}
                </section>
            </main>

            <button className="add-button" onClick={() => navigate('/ixc-finalizacao-config/0')}>
                <FaPlus />
            </button>
        </div>
    );
}
