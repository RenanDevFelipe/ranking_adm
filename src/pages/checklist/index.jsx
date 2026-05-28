import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/sidebar/index.jsx';
import '../styles.css';
import { deleteChecklist, getChecklists } from '../../services/api.ts';
import { logout } from '../../utils/auth.js';
import Swal from 'sweetalert2';
import { FaPlus } from 'react-icons/fa';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ChecklistIcon from '@mui/icons-material/Checklist';
import DehazeIcon from '@mui/icons-material/Dehaze';

const getChecklistId = (checklist) => checklist?.id ?? checklist?.id_checklist;

export default function Checklists() {
    const navigate = useNavigate();
    const [checklists, setChecklists] = useState([]);
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

        const fetchChecklists = async () => {
            try {
                const data = await getChecklists(token);
                if (isMounted) {
                    setChecklists(data);
                }
            } catch (err) {
                if (isMounted) {
                    if (err.response?.status === 401) {
                        logout();
                        navigate('/');
                        return;
                    }
                    setError(err.message || 'Erro ao carregar checklists');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchChecklists();

        return () => {
            isMounted = false;
        };
    }, [navigate]);

    const handleDelete = async (id, nome) => {
        if (!id) {
            Swal.fire('Erro!', 'Nao foi possivel identificar este checklist.', 'error');
            return;
        }

        const result = await Swal.fire({
            title: 'Tem certeza?',
            text: `Voce esta prestes a excluir o checklist ${nome}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FF6200',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        try {
            const token = localStorage.getItem('access_token');
            await deleteChecklist(token, id);
            setChecklists(checklists.filter(checklist => getChecklistId(checklist) !== id));
            Swal.fire('Excluido!', 'Checklist removido com sucesso.', 'success');
        } catch (err) {
            Swal.fire('Erro!', err.message || 'Erro ao remover checklist.', 'error');
        }
    };

    const handleEdit = (checklist) => {
        const checklistId = getChecklistId(checklist);

        if (!checklistId) {
            Swal.fire('Erro!', 'Nao foi possivel identificar este checklist.', 'error');
            return;
        }

        navigate(`/checklist/${checklistId}`);
    };

    const filteredChecklists = checklists.filter(checklist =>
        checklist.nome_checklist.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando checklists...</p>
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
            <main className="main-content-checklist">
                <div className="checklist-admin-page">
                    <header className="checklist-admin-header">
                        <button
                            className={`sidebar-toggle ${darkMode ? 'dark' : 'light'}`}
                            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                        >
                            {isSidebarVisible ? <DehazeIcon /> : '>'}
                        </button>
                        <div>
                            <h1>Checklists</h1>
                            <p>Gerencie perguntas, pesos e ordem de avaliacao</p>
                        </div>
                    </header>

                    <div className="checklist-admin-toolbar">
                        <div className="checklist-admin-search">
                            <ChecklistIcon />
                            <input
                                type="text"
                                placeholder="Pesquisar por nome do checklist"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {filteredChecklists.length > 0 ? (
                        <div className="checklist-admin-grid">
                            {filteredChecklists.map(checklist => {
                                const checklistId = getChecklistId(checklist);

                                return (
                                    <article key={checklistId || checklist.nome_checklist} className="checklist-admin-card">
                                        <div className="checklist-admin-card-header">
                                            <div>
                                                <h2>{checklist.nome_checklist}</h2>
                                                <span>{checklist.itens?.length || 0} itens</span>
                                            </div>
                                            <span className={`ixc-status ${checklist.ativo ? 'active' : 'inactive'}`}>
                                                {checklist.ativo ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </div>

                                        <div className="checklist-admin-items-preview">
                                            {(checklist.itens || [])
                                                .slice()
                                                .sort((a, b) => Number(a.ordem) - Number(b.ordem))
                                                .slice(0, 3)
                                                .map(item => (
                                                    <span key={item.id_item || item.ordem}>
                                                        {item.ordem}. {item.pergunta}
                                                    </span>
                                                ))}
                                        </div>

                                        <div className="ixc-card-actions">
                                            <button title="Editar" onClick={() => handleEdit(checklist)}>
                                                <EditIcon />
                                            </button>
                                            <button title="Excluir" onClick={() => handleDelete(checklistId, checklist.nome_checklist)}>
                                                <DeleteIcon />
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : searchTerm ? (
                        <p className="no-results">Nenhum checklist encontrado para "{searchTerm}"</p>
                    ) : (
                        <p className="no-results">Nenhum checklist disponivel</p>
                    )}
                </div>
            </main>

            <button className="add-button" onClick={() => navigate('/checklist/0')}>
                <FaPlus />
            </button>
        </div>
    );
}
