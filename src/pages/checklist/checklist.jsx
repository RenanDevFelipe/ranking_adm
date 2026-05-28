import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/sidebar/index.jsx';
import '../styles.css';
import {
    addChecklist,
    addChecklistItem,
    deleteChecklistItem,
    getChecklistById,
    updateChecklist,
    updateChecklistItem
} from '../../services/api.ts';
import { logout } from '../../utils/auth.js';
import Swal from 'sweetalert2';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DehazeIcon from '@mui/icons-material/Dehaze';

const createEmptyItem = (ordem) => ({
    pergunta: '',
    tipo_resposta: 'sim_nao',
    peso: 1,
    obrigatorio: true,
    ordem
});

const reorderItems = (items) => items.map((item, index) => ({
    ...item,
    ordem: index + 1
}));

export default function ChecklistForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const checklistId = id && id !== 'undefined' && id !== 'null' ? id : '0';
    const isEditMode = checklistId !== '0';
    const [loading, setLoading] = useState(Boolean(isEditMode));
    const [error, setError] = useState(null);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [darkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });
    const [formData, setFormData] = useState({
        nome_checklist: '',
        ativo: true,
        itens: [createEmptyItem(1)]
    });
    const [deletedItemIds, setDeletedItemIds] = useState([]);

    useEffect(() => {
        if (!isEditMode) return;

        let isMounted = true;
        const token = localStorage.getItem('access_token');

        const fetchChecklist = async () => {
            try {
                const data = await getChecklistById(token, checklistId);
                if (isMounted) {
                    setFormData({
                        nome_checklist: data.nome_checklist || '',
                        ativo: Boolean(data.ativo),
                        itens: reorderItems((data.itens || []).slice().sort((a, b) => Number(a.ordem) - Number(b.ordem)))
                    });
                    setDeletedItemIds([]);
                }
            } catch (err) {
                if (isMounted) {
                    if (err.response?.status === 401) {
                        logout();
                        navigate('/');
                        return;
                    }
                    setError(err.message || 'Erro ao carregar checklist');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchChecklist();

        return () => {
            isMounted = false;
        };
    }, [checklistId, isEditMode, navigate]);

    const handleChecklistChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleItemChange = (index, field, value) => {
        setFormData(prev => {
            const itens = [...prev.itens];
            itens[index] = {
                ...itens[index],
                [field]: field === 'obrigatorio' ? Boolean(value) : value
            };

            return {
                ...prev,
                itens
            };
        });
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            itens: [...prev.itens, createEmptyItem(prev.itens.length + 1)]
        }));
    };

    const removeItem = (index) => {
        setFormData(prev => {
            if (prev.itens.length === 1) return prev;
            const itemToRemove = prev.itens[index];

            if (itemToRemove?.id_item) {
                setDeletedItemIds(ids => [...ids, itemToRemove.id_item]);
            }

            return {
                ...prev,
                itens: reorderItems(prev.itens.filter((_, itemIndex) => itemIndex !== index))
            };
        });
    };

    const handleDrop = (targetIndex) => {
        if (draggedIndex === null || draggedIndex === targetIndex) return;

        setFormData(prev => {
            const itens = [...prev.itens];
            const [draggedItem] = itens.splice(draggedIndex, 1);
            itens.splice(targetIndex, 0, draggedItem);

            return {
                ...prev,
                itens: reorderItems(itens)
            };
        });

        setDraggedIndex(null);
    };

    const validateForm = () => {
        if (!formData.nome_checklist.trim()) {
            return 'Informe o nome do checklist.';
        }

        if (!formData.itens.length) {
            return 'Adicione pelo menos um item.';
        }

        const invalidItem = formData.itens.find(item => !item.pergunta.trim());
        if (invalidItem) {
            return 'Todos os itens precisam ter uma pergunta.';
        }

        return null;
    };

    const itemPayload = (item, index) => ({
        id_checklist: Number(checklistId),
        pergunta: item.pergunta.trim(),
        tipo_resposta: item.tipo_resposta,
        peso: Number(item.peso || 0),
        obrigatorio: Boolean(item.obrigatorio),
        ordem: index + 1
    });

    const syncChecklistItems = async (token, items) => {
        await Promise.all(deletedItemIds.map(itemId => deleteChecklistItem(token, itemId)));

        await Promise.all(items.map((item, index) => {
            const payload = itemPayload(item, index);

            if (item.id_item) {
                return updateChecklistItem(token, item.id_item, payload);
            }

            return addChecklistItem(token, payload);
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            Swal.fire('Atenção!', validationError, 'warning');
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            const itensOrdenados = reorderItems(formData.itens);

            if (isEditMode) {
                await updateChecklist(token, checklistId, {
                    nome_checklist: formData.nome_checklist,
                    ativo: formData.ativo
                });
                await syncChecklistItems(token, itensOrdenados);
            } else {
                await addChecklist(token, {
                    ...formData,
                    itens: itensOrdenados
                });
            }

            Swal.fire(
                'Sucesso!',
                isEditMode ? 'Checklist atualizado com sucesso.' : 'Checklist criado com sucesso.',
                'success'
            ).then(() => navigate('/checklists'));
        } catch (err) {
            Swal.fire('Erro!', err.message || 'Erro ao salvar checklist.', 'error');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando checklist...</p>
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
        <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
            <Sidebar isVisible={isSidebarVisible} />
            <main className="main-content-checklist">
                <div className="checklist-editor-page">
                    <header className="checklist-admin-header">
                        <button
                            className={`sidebar-toggle ${darkMode ? 'dark' : 'light'}`}
                            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                        >
                            {isSidebarVisible ? <DehazeIcon /> : '>'}
                        </button>
                        <div>
                            <h1>{isEditMode ? 'Editar checklist' : 'Adicionar checklist'}</h1>
                            <p>Arraste os itens para gerenciar a ordem de exibicao</p>
                        </div>
                    </header>

                    <form onSubmit={handleSubmit} className="checklist-editor-form">
                        <section className="checklist-editor-panel">
                            <div className="checklist-editor-grid">
                                <label>
                                    Nome do checklist
                                    <input
                                        type="text"
                                        name="nome_checklist"
                                        value={formData.nome_checklist}
                                        onChange={handleChecklistChange}
                                        required
                                    />
                                </label>

                                <label className="checklist-editor-active">
                                    <input
                                        type="checkbox"
                                        name="ativo"
                                        checked={formData.ativo}
                                        onChange={handleChecklistChange}
                                    />
                                    Ativo
                                </label>
                            </div>
                        </section>

                        <section className="checklist-editor-panel">
                            <div className="checklist-items-header">
                                <div>
                                    <h2>Itens do checklist</h2>
                                    <span>{formData.itens.length} item(ns)</span>
                                </div>
                                <button type="button" className="checklist-add-item-button" onClick={addItem}>
                                    <AddIcon />
                                    Adicionar item
                                </button>
                            </div>

                            <div className="checklist-items-list">
                                {formData.itens.map((item, index) => (
                                    <article
                                        key={`${item.id_item || 'new'}-${index}`}
                                        className={`checklist-item-editor ${draggedIndex === index ? 'dragging' : ''}`}
                                        draggable
                                        onDragStart={() => setDraggedIndex(index)}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={() => handleDrop(index)}
                                        onDragEnd={() => setDraggedIndex(null)}
                                    >
                                        <div className="checklist-drag-handle" title="Arrastar item">
                                            <DragIndicatorIcon />
                                            <strong>{item.ordem}</strong>
                                        </div>

                                        <div className="checklist-item-fields">
                                            <label className="checklist-question-field">
                                                Pergunta
                                                <input
                                                    type="text"
                                                    value={item.pergunta}
                                                    onChange={(e) => handleItemChange(index, 'pergunta', e.target.value)}
                                                    required
                                                />
                                            </label>

                                            <label>
                                                Tipo
                                                <select
                                                    value={item.tipo_resposta}
                                                    onChange={(e) => handleItemChange(index, 'tipo_resposta', e.target.value)}
                                                >
                                                    <option value="sim_nao">Sim/Não</option>
                                                    <option value="nota">Nota</option>
                                                    <option value="texto">Texto</option>
                                                </select>
                                            </label>

                                            <label>
                                                Peso
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.peso}
                                                    onChange={(e) => handleItemChange(index, 'peso', e.target.value)}
                                                />
                                            </label>

                                            <label className="checklist-required-field">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(item.obrigatorio)}
                                                    onChange={(e) => handleItemChange(index, 'obrigatorio', e.target.checked)}
                                                />
                                                Obrigatorio
                                            </label>
                                        </div>

                                        <button
                                            type="button"
                                            className="checklist-remove-item-button"
                                            onClick={() => removeItem(index)}
                                            disabled={formData.itens.length === 1}
                                            title="Remover item"
                                        >
                                            <DeleteIcon />
                                        </button>
                                    </article>
                                ))}
                            </div>
                        </section>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() => navigate('/checklists')}
                            >
                                Cancelar
                            </button>
                            <button type="submit" className="submit-button-tutorial">
                                {isEditMode ? 'Atualizar' : 'Adicionar'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
