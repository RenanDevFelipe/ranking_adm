import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/sidebar';
import "../styles.css";
import { addChecklist, getAssuntos } from '../../services/api.ts';
import { logout } from '../../utils/auth';
import Swal from 'sweetalert2';
import {
    Select,
    MenuItem,
    InputLabel,
    FormControl
} from '@mui/material';

export default function Checklist() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [assuntos, setAssuntos] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [darkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });
    const [isSidebarVisible] = useState(true);

    // const toggleSidebar = () => {
    //     setIsSidebarVisible(!isSidebarVisible);
    // };

    // Dados do formulário
    const [formData, setFormData] = useState({
        checklist_id: id || 0,
        assunto_id: '',
        fields: [
            {
                label: '',
                type: 'checkbox',
                max_score: '',
                action: 'create'
            }
        ]
    });

    // Aplica o tema ao body
    useEffect(() => {
        if (darkMode) {
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
        }
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    // Carrega dados iniciais
    useEffect(() => {
        const token = localStorage.getItem('access_token');

        const fetchInitialData = async () => {
            try {
                // Carrega a lista de assuntos
                const assuntosData = await getAssuntos(token);
                setAssuntos(assuntosData);

                // Se for modo de edição, carrega os dados do checklist
                if (id && id !== '0') {
                    setIsEditMode(true);
                    // const checklistData = await getChecklistById(token, parseInt(id));
                    // setFormData({
                    //     ...checklistData,
                    //     fields: checklistData.fields || [{
                    //         label: '',
                    //         type: 'checkbox',
                    //         max_score: '',
                    //         action: 'update'
                    //     }]
                    // });
                }
            } catch (err) {
                console.error("Erro ao carregar dados:", err);
                if (err.response?.status === 401) {
                    setError('Sessão expirada. Redirecionando para login...');
                    logout();
                } else {
                    setError(err.message || 'Erro ao carregar dados');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFieldChange = (index, e) => {
        const { name, value } = e.target;
        const updatedFields = [...formData.fields];
        updatedFields[index] = {
            ...updatedFields[index],
            [name]: value
        };

        setFormData(prev => ({
            ...prev,
            fields: updatedFields
        }));
    };

    const addNewField = () => {
        setFormData(prev => ({
            ...prev,
            fields: [
                ...prev.fields,
                {
                    label: '',
                    type: 'checkbox',
                    max_score: '',
                    action: 'create'
                }
            ]
        }));
    };

    const removeField = (index) => {
        if (formData.fields.length > 1) {
            const updatedFields = [...formData.fields];
            updatedFields.splice(index, 1);

            setFormData(prev => ({
                ...prev,
                fields: updatedFields
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        setIsSubmitting(true);

        try {
            // Envia cada field individualmente
            for (const field of formData.fields) {
                const formDataToSend = new FormData();
                formDataToSend.append('checklist_id', formData.checklist_id.toString());
                formDataToSend.append('label', field.label);
                formDataToSend.append('type', field.type);
                formDataToSend.append('max_score', field.max_score);
                formDataToSend.append('action', field.action);

                if (isEditMode) {
                    // await updateChecklistField(token, formDataToSend);
                } else {
                    await addChecklist(token, formDataToSend);
                }
            }

            Swal.fire(
                'Sucesso!',
                `Checklist ${isEditMode ? 'atualizado' : 'adicionado'} com sucesso.`,
                'success'
            ).then(() => {
                navigate('/checklists');
            });
        } catch (err) {
            console.error("Erro ao salvar checklist:", err);
            Swal.fire(
                'Erro!',
                err.response?.data?.message || `Ocorreu um erro ao ${isEditMode ? 'atualizar' : 'adicionar'} o checklist.`,
                'error'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="app-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Carregando dados...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="app-container">
                <Sidebar isVisible={isSidebarVisible} />
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
        <div className="app-container">
            <Sidebar isVisible={isSidebarVisible} />
            <div className="main-content">
                <div className="sidebar-footer">
                    <div className="form-container">
                        <h1>{isEditMode ? 'Editar Checklist' : 'Adicionar Checklist'}</h1>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <FormControl fullWidth>
                                    <InputLabel id="assunto-label">Assunto</InputLabel>
                                    <Select
                                        labelId="assunto-label"
                                        id="checklist_id"
                                        name="checklist_id"
                                        value={formData.checklist_id}
                                        onChange={handleInputChange}
                                        required
                                        label="Assunto"
                                    >
                                        {assuntos.map((assunto) => (
                                            <MenuItem key={assunto.id} value={assunto.id}>
                                                {assunto.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>

                            {formData.fields.map((field, index) => (
                                <div key={index} className="field-group">
                                    <h3>Campo {index + 1}</h3>

                                    <div className="form-group">
                                        <label htmlFor={`label-${index}`}>Nome do campo</label>
                                        <input
                                            type="text"
                                            id={`label-${index}`}
                                            name="label"
                                            value={field.label}
                                            onChange={(e) => handleFieldChange(index, e)}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor={`type-${index}`}>Tipo do campo</label>
                                        <select
                                            id={`type-${index}`}
                                            name="type"
                                            value={field.type}
                                            onChange={(e) => handleFieldChange(index, e)}
                                            required
                                        >
                                            <option value="checkbox">Checkbox</option>
                                            <option value="text">Text</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor={`max_score-${index}`}>Valor do campo</label>
                                        <input
                                            type="number"
                                            id={`max_score-${index}`}
                                            name="max_score"
                                            value={field.max_score}
                                            onChange={(e) => handleFieldChange(index, e)}
                                            required
                                        />
                                    </div>

                                    <input
                                        type="hidden"
                                        name="action"
                                        value={field.action}
                                        onChange={(e) => handleFieldChange(index, e)}
                                    />

                                    {formData.fields.length > 1 && (
                                        <button
                                            type="button"
                                            className="remove-field-button"
                                            onClick={() => removeField(index)}
                                        >
                                            Remover Campo
                                        </button>
                                    )}
                                </div>
                            ))}

                            <button
                                type="button"
                                className="add-field-button"
                                onClick={addNewField}
                            >
                                Adicionar Novo Campo
                            </button>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => navigate('/checklists')}
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="submit-button"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Enviando...' : isEditMode ? 'Atualizar' : 'Adicionar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}