import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/sidebar/index.jsx';
import '../styles.css';
import {
    addPontuacaoAssunto,
    getChecklistAssuntos,
    getPontuacaoAssuntoById,
    updatePontuacaoAssunto
} from '../../services/api.ts';
import { logout } from '../../utils/auth.js';
import Swal from 'sweetalert2';
import DehazeIcon from '@mui/icons-material/Dehaze';

const initialFormData = {
    id_checklist_assunto: '',
    pontos: '',
    ativo: true
};

const getChecklistNome = (assunto) => assunto?.checklist?.nome_checklist || 'Checklist nao informado';
const getAssuntoLabel = (assunto) => {
    const idIxc = assunto?.id_assunto_ixc ? `#${assunto.id_assunto_ixc} - ` : '';
    return `${idIxc}${assunto?.nome_assunto_ixc || 'Assunto sem nome'} | ${getChecklistNome(assunto)}`;
};

export default function ChecklistScoreForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const scoreId = id && id !== 'undefined' && id !== 'null' ? id : '0';
    const isEditMode = scoreId !== '0';
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [assuntos, setAssuntos] = useState([]);
    const [formData, setFormData] = useState(initialFormData);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [darkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });

    useEffect(() => {
        let isMounted = true;
        const token = localStorage.getItem('access_token');

        const fetchData = async () => {
            try {
                const [assuntosData, scoreData] = await Promise.all([
                    getChecklistAssuntos(token),
                    isEditMode ? getPontuacaoAssuntoById(token, scoreId) : Promise.resolve(null)
                ]);

                if (isMounted) {
                    setAssuntos(Array.isArray(assuntosData) ? assuntosData : []);

                    if (scoreData) {
                        setFormData({
                            id_checklist_assunto: String(scoreData.id_checklist_assunto || scoreData.assunto?.id || ''),
                            pontos: String(scoreData.pontos ?? ''),
                            ativo: Boolean(scoreData.ativo)
                        });
                    }
                }
            } catch (err) {
                if (isMounted) {
                    if (err.response?.status === 401) {
                        logout();
                        navigate('/');
                        return;
                    }
                    setError(err.message || 'Erro ao carregar pontuacao');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [isEditMode, navigate, scoreId]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateForm = () => {
        if (!formData.id_checklist_assunto) return 'Selecione um assunto vinculado.';
        if (formData.pontos === '') return 'Informe a pontuacao.';
        if (Number(formData.pontos) < 0) return 'A pontuacao nao pode ser negativa.';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            Swal.fire('Atencao!', validationError, 'warning');
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            const payload = {
                id_checklist_assunto: Number(formData.id_checklist_assunto),
                pontos: Number(formData.pontos),
                ativo: Boolean(formData.ativo)
            };

            if (isEditMode) {
                await updatePontuacaoAssunto(token, scoreId, payload);
            } else {
                await addPontuacaoAssunto(token, payload);
            }

            Swal.fire(
                'Sucesso!',
                isEditMode ? 'Pontuacao atualizada com sucesso.' : 'Pontuacao cadastrada com sucesso.',
                'success'
            ).then(() => navigate('/checklist-scores'));
        } catch (err) {
            Swal.fire('Erro!', err.message || 'Erro ao salvar pontuacao.', 'error');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando pontuacao...</p>
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
            <main className="main-content-assunto">
                <div className="score-page score-form-page">
                    <header className="subject-header">
                        <button
                            className={`sidebar-toggle ${darkMode ? 'dark' : 'light'}`}
                            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                        >
                            {isSidebarVisible ? <DehazeIcon /> : '>'}
                        </button>
                        <div>
                            <h1>{isEditMode ? 'Editar pontuacao' : 'Adicionar pontuacao'}</h1>
                            <p>Defina os pontos do assunto para o ranking de quantidade</p>
                        </div>
                    </header>

                    <form onSubmit={handleSubmit} className="subject-form">
                        <section className="subject-panel">
                            <div className="score-form-grid">
                                <label className="score-subject-field">
                                    Assunto vinculado ao checklist
                                    <select
                                        name="id_checklist_assunto"
                                        value={formData.id_checklist_assunto}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Selecione um assunto</option>
                                        {assuntos.map((assunto) => (
                                            <option key={assunto.id} value={assunto.id}>
                                                {getAssuntoLabel(assunto)}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label>
                                    Pontos
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        name="pontos"
                                        value={formData.pontos}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </label>

                                <label className="checklist-editor-active">
                                    <input
                                        type="checkbox"
                                        name="ativo"
                                        checked={formData.ativo}
                                        onChange={handleInputChange}
                                    />
                                    Ativo
                                </label>
                            </div>
                        </section>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() => navigate('/checklist-scores')}
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
