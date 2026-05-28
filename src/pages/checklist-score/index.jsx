import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/sidebar/index.jsx';
import '../styles.css';
import { deletePontuacaoAssunto, getPontuacoesAssunto } from '../../services/api.ts';
import { logout } from '../../utils/auth.js';
import Swal from 'sweetalert2';
import { FaPlus } from 'react-icons/fa';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ScoreIcon from '@mui/icons-material/Score';
import DehazeIcon from '@mui/icons-material/Dehaze';

const getAssunto = (score) => score?.assunto || {};
const getChecklist = (score) => getAssunto(score)?.checklist || {};
const getAssuntoNome = (score) => getAssunto(score).nome_assunto_ixc || 'Assunto nao informado';
const getChecklistNome = (score) => getChecklist(score).nome_checklist || 'Checklist nao informado';

export default function ChecklistScores() {
    const navigate = useNavigate();
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [darkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });

    useEffect(() => {
        let isMounted = true;
        const token = localStorage.getItem('access_token');

        const fetchScores = async () => {
            try {
                const data = await getPontuacoesAssunto(token);
                if (isMounted) {
                    setScores(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                if (isMounted) {
                    if (err.response?.status === 401) {
                        logout();
                        navigate('/');
                        return;
                    }
                    setError(err.message || 'Erro ao carregar pontuacoes');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchScores();

        return () => {
            isMounted = false;
        };
    }, [navigate]);

    const filteredScores = scores.filter((score) => {
        const term = searchTerm.toLowerCase();
        return [
            getAssuntoNome(score),
            getChecklistNome(score),
            String(getAssunto(score).id_assunto_ixc || ''),
            String(score.pontos || '')
        ].some(value => String(value || '').toLowerCase().includes(term));
    });

    const handleDelete = async (id, nome) => {
        if (!id) {
            Swal.fire('Erro!', 'Nao foi possivel identificar esta pontuacao.', 'error');
            return;
        }

        const result = await Swal.fire({
            title: 'Tem certeza?',
            text: `Voce esta prestes a remover a pontuacao de ${nome}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FF6200',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, remover!',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        try {
            const token = localStorage.getItem('access_token');
            await deletePontuacaoAssunto(token, id);
            setScores(prev => prev.filter(score => score.id !== id));
            Swal.fire('Removido!', 'Pontuacao removida com sucesso.', 'success');
        } catch (err) {
            Swal.fire('Erro!', err.message || 'Erro ao remover pontuacao.', 'error');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando pontuacoes...</p>
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
                <div className="score-page">
                    <header className="subject-header">
                        <button
                            className={`sidebar-toggle ${darkMode ? 'dark' : 'light'}`}
                            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                        >
                            {isSidebarVisible ? <DehazeIcon /> : '>'}
                        </button>
                        <div>
                            <h1>Pontuacao dos checklists</h1>
                            <p>Defina os pontos por assunto para o ranking de quantidade</p>
                        </div>
                    </header>

                    <div className="subject-toolbar">
                        <div className="subject-search">
                            <ScoreIcon />
                            <input
                                type="text"
                                placeholder="Pesquisar por assunto, checklist ou pontos"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {filteredScores.length > 0 ? (
                        <div className="subject-grid">
                            {filteredScores.map((score) => (
                                <article key={score.id} className="subject-card score-card">
                                    <div className="subject-card-header">
                                        <div>
                                            <span>Assunto IXC #{getAssunto(score).id_assunto_ixc || '-'}</span>
                                            <h2>{getAssuntoNome(score)}</h2>
                                        </div>
                                        <span className={`score-status ${score.ativo ? 'active' : 'inactive'}`}>
                                            {score.ativo ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </div>

                                    <div className="score-card-value">
                                        <strong>{Number(score.pontos || 0).toLocaleString('pt-BR')}</strong>
                                        <span>pontos por OS</span>
                                    </div>

                                    <div className="subject-card-link">
                                        <ScoreIcon />
                                        <div>
                                            <span>Checklist vinculado</span>
                                            <strong>{getChecklistNome(score)}</strong>
                                        </div>
                                    </div>

                                    <div className="ixc-card-actions">
                                        <button title="Editar" onClick={() => navigate(`/checklist-score/${score.id}`)}>
                                            <EditIcon />
                                        </button>
                                        <button title="Excluir" onClick={() => handleDelete(score.id, getAssuntoNome(score))}>
                                            <DeleteIcon />
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : searchTerm ? (
                        <p className="no-results">Nenhuma pontuacao encontrada para "{searchTerm}"</p>
                    ) : (
                        <p className="no-results">Nenhuma pontuacao cadastrada</p>
                    )}
                </div>
            </main>

            <button className="add-button" onClick={() => navigate('/checklist-score/0')}>
                <FaPlus />
            </button>
        </div>
    );
}
