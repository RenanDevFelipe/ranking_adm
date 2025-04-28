import { useState, useEffect } from 'react';
import { ChecklistGetFiltered, getAssuntos } from '../../services/api.ts';
import { logout } from '../../utils/auth';
import Sidebar from '../../components/sidebar/index.jsx';
import "../styles.css";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaPlus } from 'react-icons/fa';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function Checklists() {
    const [assuntos, setAssuntos] = useState([]);
    const [checklistFields, setChecklistFields] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingFields, setLoadingFields] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [selectedChecklist, setSelectedChecklist] = useState(null);
    const [darkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });
    const navigate = useNavigate();

    // Aplica o tema ao body
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    // Carrega a lista de assuntos
    useEffect(() => {
        let isMounted = true;
        const token = localStorage.getItem('access_token');

        const fetchAssuntos = async () => {
            try {
                const assuntosData = await getAssuntos(token);
                if (isMounted) {
                    setAssuntos(assuntosData);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    if (err.response?.status === 401) {
                        setError('Sessão expirada. Redirecionando para login...');
                        logout();
                    } else {
                        setError(err.message || 'Erro ao carregar assuntos');
                    }
                    setLoading(false);
                }
                console.error("Erro ao buscar assuntos:", err);
            }
        };

        fetchAssuntos();

        return () => {
            isMounted = false;
        };
    }, []);

    // Carrega os fields quando um modal é aberto
    const loadChecklistFields = async (checklistId) => {
        if (checklistFields[checklistId]) return;

        setLoadingFields(true);
        const token = localStorage.getItem('access_token');
        
        try {
            const response = await ChecklistGetFiltered(token, checklistId);
            setChecklistFields(prev => ({
                ...prev,
                [checklistId]: response.checklist || []
            }));
        } catch (err) {
            console.error("Erro ao carregar fields:", err);
            Swal.fire('Erro!', 'Não foi possível carregar os campos deste checklist.', 'error');
        } finally {
            setLoadingFields(false);
        }
    };

    const handleOpenModal = async (checklist) => {
        setSelectedChecklist(checklist);
        setOpenModal(true);
        await loadChecklistFields(checklist.id);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedChecklist(null);
    };

    const filteredAssuntos = assuntos.filter(assunto =>
        assunto.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (checklistId) => {
        navigate(`/checklist/${checklistId}`);
    };

    const handleDelete = async (checklistId, assuntoName) => {
        const result = await Swal.fire({
            title: 'Tem certeza?',
            text: `Você está prestes a excluir o checklist "${assuntoName}". Todos os campos associados serão removidos!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FF6200',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('access_token');
                // await deleteChecklist(token, checklistId);
                
                setAssuntos(assuntos.filter(a => a.id !== checklistId));
                setChecklistFields(prev => {
                    const newFields = {...prev};
                    delete newFields[checklistId];
                    return newFields;
                });
                
                Swal.fire('Excluído!', 'O Checklist foi excluído com sucesso.', 'success');
            } catch (err) {
                console.error("Erro ao excluir checklist:", err);
                Swal.fire('Erro!', err.response?.data?.message || 'Ocorreu um erro ao excluir o checklist.', 'error');
            }
        }
    };

    if (loading) {
        return (
            <div className="app-container">
                <Sidebar />
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Carregando checklists...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="app-container">
                <Sidebar />
                <div className="error-container">
                    <div className="error-message">{error}</div>
                    <button
                        className="retry-button"
                        onClick={() => window.location.reload()}
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
            <Sidebar />
            <div className='container-conteudo'>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Pesquisar checklists por assunto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                {filteredAssuntos.length > 0 ? (
                    <div className="checklists-grid">
                        {filteredAssuntos.map((assunto) => (
                            <div key={assunto.id} className="checklist-card" onClick={() => handleOpenModal(assunto)}>
                                <div className="card-content">
                                    <h3 className="card-title">{assunto.name}</h3>
                                    <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                                        <EditIcon 
                                            className="action-icon"
                                            onClick={() => handleEdit(assunto.id)} 
                                        />
                                        <DeleteIcon 
                                            className="action-icon"
                                            onClick={() => handleDelete(assunto.id, assunto.name)} 
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : searchTerm ? (
                    <p className="no-results">Nenhum checklist encontrado para "{searchTerm}"</p>
                ) : (
                    <p className="no-results">Nenhum checklist disponível</p>
                )}

                <button 
                    className="add-button"
                    onClick={() => navigate('/checklist/0')}
                >
                    <FaPlus />
                </button>

                {/* Modal para mostrar os campos */}
                <Dialog
                    open={openModal}
                    onClose={handleCloseModal}
                    fullWidth
                    maxWidth="md"
                    className="checklist-modal"
                >
                    <DialogTitle className="modal-header">
                        <Typography variant="h6" component="div">
                            {selectedChecklist?.name}
                        </Typography>
                        <IconButton
                            aria-label="close"
                            onClick={handleCloseModal}
                            className="close-button"
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent className="modal-content">
                        {loadingFields ? (
                            <div className="loading-fields">
                                <div className="spinner"></div>
                                <p>Carregando campos...</p>
                            </div>
                        ) : (
                            <div className="fields-container">
                                <h4 className="fields-title">Campos do Checklist</h4>
                                {checklistFields[selectedChecklist?.id]?.length > 0 ? (
                                    <div className="fields-grid">
                                        {checklistFields[selectedChecklist?.id].map((field) => (
                                            <div key={field.id} className="field-card">
                                                <div className="field-header">
                                                    <span className="field-label">{field.label}</span>
                                                </div>
                                                <div className="field-details">
                                                    <span className="field-type">Tipo: {field.type}</span>
                                                    <span className="field-value">Valor máximo: {field.max_score}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-fields">Nenhum campo encontrado para este checklist</p>
                                )}
                            </div>
                        )}
                    </DialogContent>
                    <DialogActions className="modal-actions">
                        <Button 
                            onClick={handleCloseModal}
                            className="close-modal-button"
                        >
                            Fechar
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
}