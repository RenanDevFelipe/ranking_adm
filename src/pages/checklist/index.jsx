import { useState, useEffect } from 'react';
import { ChecklistGetFiltered, getAssuntos, addChecklist, updateChecklist, deleteChecklist } from '../../services/api.ts';
import { logout } from '../../utils/auth';
import Sidebar from '../../components/sidebar/index.jsx';
import "../styles.css";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Typography,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DehazeIcon from '@mui/icons-material/Dehaze';

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
    const [editingField, setEditingField] = useState(null);
    const [newField, setNewField] = useState({
        label: '',
        type: 'checkbox',
        max_score: ''
    });
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

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
        setEditingField(null);
        setNewField({
            label: '',
            type: 'checkbox',
            max_score: ''
        });
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedChecklist(null);
        setEditingField(null);
    };

    const handleAddField = async () => {
        // Validações
        // if (!newField.label || newField.label.trim() === '') {
        //     alert('O campo "Nome do campo" não pode estar vazio!');
        //     return;
        // }

        try {
            const token = localStorage.getItem('access_token');
            const formData = new FormData();
            formData.append('checklist_id', selectedChecklist.id);
            formData.append('label', newField.label.trim()); // Remove espaços extras
            formData.append('type', newField.type);
            formData.append('max_score', newField.max_score);
            formData.append('action', 'create');

            await addChecklist(token, formData);

            // Atualiza a lista de fields
            await loadChecklistFields(selectedChecklist.id);

            // Reseta o formulário
            setNewField({
                label: '',
                type: 'checkbox',
                max_score: ''
            });


        } catch (err) {
            console.error("Erro ao adicionar field:", err);
            alert(`Erro ao adicionar campo: ${err.message || 'Tente novamente mais tarde'}`);
        }
    };

    const handleEditField = (field) => {
        setEditingField({ ...field });
    };

    const handleUpdateField = async () => {

        try {
            const token = localStorage.getItem('access_token');
            const formData = new FormData();
            formData.append('checklist_id', selectedChecklist.id)
            formData.append('id', editingField.id);
            formData.append('label', editingField.label);
            formData.append('type', editingField.type);
            formData.append('max_score', editingField.max_score);
            formData.append('action', 'update');

            await updateChecklist(token, formData);

            // Atualiza a lista de fields
            await loadChecklistFields(selectedChecklist.id);

            // Sai do modo de edição
            setEditingField(null);

        } catch (err) {
            console.error("Erro ao atualizar field:", err);

        }
    };

    const handleCancelEdit = () => {
        setEditingField(null);
    };

    const handleDeleteField = async (fieldId) => {

        try {
            const token = localStorage.getItem('access_token');
            await deleteChecklist(token, fieldId);

            // Atualiza a lista de fields
            await loadChecklistFields(selectedChecklist.id);
            console.log("Deletado")
        } catch (err) {
            console.error("Erro ao excluir field:", err);
        }
    };

    const filteredAssuntos = assuntos.filter(assunto =>
        assunto.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Sidebar isVisible={isSidebarVisible} />
            <div className='main-content-checklist'>

                <div className='container-conteudo'>
                    <div className="search-container">
                        <button
                            className={`sidebar-toggle ${darkMode ? 'dark' : 'light'}`}
                            onClick={toggleSidebar}
                        >
                            {isSidebarVisible ? <DehazeIcon /> : '►'}
                        </button>
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : searchTerm ? (
                        <p className="no-results">Nenhum checklist encontrado para "{searchTerm}"</p>
                    ) : (
                        <p className="no-results">Nenhum checklist disponível</p>
                    )}

                    {/* Modal para mostrar e gerenciar os campos */}
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
                                <div className="fields-management-container">
                                    <h4 className="fields-title">Gerenciamento de Campos</h4>

                                    {/* Formulário para adicionar novo campo */}
                                    <div className="add-field-form">
                                        <h5>Adicionar Novo Campo</h5>
                                        <div className="form-row">
                                            <TextField
                                                label="Nome do Campo"
                                                value={newField.label}
                                                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                                                fullWidth
                                                margin="normal"
                                                required
                                            />
                                        </div>
                                        <div className="form-row">
                                            <FormControl fullWidth margin="normal">
                                                <InputLabel>Tipo do Campo</InputLabel>
                                                <Select
                                                    value={newField.type}
                                                    onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                                                    label="Tipo do Campo"
                                                >
                                                    <MenuItem value="checkbox">Checkbox</MenuItem>
                                                    <MenuItem value="text">Texto</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </div>
                                        <div className="form-row">
                                            <TextField
                                                label="Valor do Campo (0-10)"
                                                type="number"
                                                value={newField.max_score}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    // Permite campo vazio (para backspace) ou números entre 0 e 10
                                                    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 10)) {
                                                        setNewField({ ...newField, max_score: value });
                                                    }
                                                }}
                                                onBlur={(e) => {
                                                    // Se o campo estiver vazio ou com valor inválido, define um valor padrão
                                                    if (!e.target.value || parseInt(e.target.value) < 0) {
                                                        setNewField({ ...newField, max_score: '0' });
                                                    } else if (parseInt(e.target.value) > 10) {
                                                        setNewField({ ...newField, max_score: '10' });
                                                    }
                                                }}
                                                error={newField.max_score && (parseInt(newField.max_score) < 0 || parseInt(newField.max_score) > 10)}
                                                helperText={newField.max_score && (parseInt(newField.max_score) < 0 || parseInt(newField.max_score) > 10)
                                                    ? "O valor deve estar entre 1 e 10"
                                                    : ""}
                                                inputProps={{
                                                    min: 1,
                                                    max: 10,
                                                    step: 1
                                                }}
                                                fullWidth
                                                margin="normal"
                                            />
                                        </div>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<AddIcon />}
                                            onClick={handleAddField}
                                            className="add-field-button"
                                        >
                                            Adicionar Campo
                                        </Button>
                                    </div>

                                    {/* Lista de campos existentes */}
                                    <div className="fields-list">
                                        <h5>Campos Existentes</h5>
                                        {checklistFields[selectedChecklist?.id]?.length > 0 ? (
                                            <div className="fields-grid">
                                                {checklistFields[selectedChecklist?.id].map((field) => (
                                                    <div key={field.id} className="field-card">
                                                        {editingField?.id === field.id ? (
                                                            <div className="field-edit-form">
                                                                <TextField
                                                                    label="Nome do Campo"
                                                                    value={editingField.label}
                                                                    onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
                                                                    fullWidth
                                                                    margin="dense"
                                                                />
                                                                <FormControl fullWidth margin="dense">
                                                                    <InputLabel>Tipo do Campo</InputLabel>
                                                                    <Select
                                                                        value={editingField.type}
                                                                        onChange={(e) => setEditingField({ ...editingField, type: e.target.value })}
                                                                        label="Tipo do Campo"
                                                                    >
                                                                        <MenuItem value="checkbox">Checkbox</MenuItem>
                                                                        <MenuItem value="text">Texto</MenuItem>
                                                                    </Select>
                                                                </FormControl>
                                                                <TextField
                                                                    label="Valor do Campo (0-10)"
                                                                    type="number"
                                                                    value={editingField.max_score}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 10)) {
                                                                            setEditingField({ ...editingField, max_score: value });
                                                                        }
                                                                    }}
                                                                    inputProps={{
                                                                        min: 0,
                                                                        max: 10,
                                                                        step: 1
                                                                    }}
                                                                    fullWidth
                                                                    margin="dense"
                                                                />
                                                                <div className="edit-actions">
                                                                    <Button
                                                                        variant="contained"
                                                                        color="primary"
                                                                        startIcon={<SaveIcon />}
                                                                        onClick={handleUpdateField}
                                                                        size="small"
                                                                    >
                                                                        Salvar
                                                                    </Button>
                                                                    <Button
                                                                        variant="outlined"
                                                                        startIcon={<CancelIcon />}
                                                                        onClick={handleCancelEdit}
                                                                        size="small"
                                                                    >
                                                                        Cancelar
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <span className="field-label">{field.label}</span>
                                                                <div className="field-header">

                                                                    <div className="field-details">
                                                                        <span className="field-type">Tipo: {field.type}</span>
                                                                        <span className="field-value">Valor: {field.max_score}</span>
                                                                    </div>
                                                                    <div className="field-actions">
                                                                        <IconButton
                                                                            aria-label="edit"
                                                                            onClick={() => handleEditField(field)}
                                                                            size="small"
                                                                        >
                                                                            <EditIcon fontSize="small" />
                                                                        </IconButton>
                                                                        <IconButton
                                                                            aria-label="delete"
                                                                            onClick={() => handleDeleteField(field.id)}
                                                                            size="small"
                                                                        >
                                                                            <DeleteIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </div>
                                                                </div>

                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="no-fields">Nenhum campo encontrado para este checklist</p>
                                        )}
                                    </div>
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
        </div>
    );
}