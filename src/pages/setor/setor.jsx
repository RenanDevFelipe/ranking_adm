import Sidebar from '../../components/sidebar/index.jsx';
import { addSetor, getSetorById, updateSetor } from '../../services/api.ts';
import "../styles.css";
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { logout } from '../../utils/auth';
import Swal from 'sweetalert2';
import DehazeIcon from '@mui/icons-material/Dehaze';

export default function AddAssunto() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [darkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };


    // Dados do formulário
    const [formData, setFormData] = useState({
        id_setor: '',
        nome_setor: '',
        action: ''
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

                if (id && id !== "0") {
                    setIsEditMode(true);
                    const setorData = await getSetorById(token, id);
                    setFormData({
                        id_setor: setorData.id_setor || '',
                        nome_setor: setorData.nome_setor || '',
                        action: setorData.action || ''
                    });

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');

        try {
            // Cria um FormData para enviar o arquivo
            const formDataToSend = new FormData();
            formDataToSend.append('id_setor', formData.id_setor);
            formDataToSend.append('nome_setor', formData.nome_setor);
            formDataToSend.append('action', isEditMode ? "update" : "create");

            if (isEditMode) {
                await updateSetor(token, formDataToSend);
                Swal.fire(
                    'Sucesso!',
                    'Setor editado com sucesso.',
                    'success'
                );
            } else {
                console.log(formDataToSend);
                await addSetor(token, formDataToSend);
                Swal.fire(
                    'Sucesso!',
                    'Setor adicionado com sucesso.',
                    'success'
                );
            }
            navigate('/setores');
        } catch (err) {
            console.error("Erro ao criar ou editar o setor:", err);
            Swal.fire(
                'Erro!',
                err.response?.data?.message || 'Ocorreu um erro ao criar ou editar o setor.',
                'error'
            );
        }
    };

    if (loading) {
        return (
            <div className="app-container">
                <Sidebar isVisible={isSidebarVisible} />
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
        <div className="app-container">
            <Sidebar isVisible={isSidebarVisible} />
            <div className="main-content-form">
                <div className="sidebar-footer">
                    <button
                        className={`sidebar-toggle ${darkMode ? 'dark' : 'light'}`}
                        onClick={toggleSidebar}
                    >
                        {isSidebarVisible ? <DehazeIcon /> : '►'}
                    </button>
                    <div className="form-container">
                        <h1>{isEditMode ? 'Editar setor' : 'Adicionar setor'}</h1>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="nome_setor">Nome do setor</label>
                                <input
                                    type="hidden"
                                    id="id_setor"
                                    name="id_setor"
                                    value={formData.id_setor}
                                    required
                                />
                                <input
                                    type="text"
                                    id="nome_setor"
                                    name="nome_setor"
                                    value={formData.nome_setor}
                                    onChange={handleInputChange}
                                    required
                                />
                                <input
                                    type="hidden"
                                    id='action'
                                    name='action'
                                    value={formData.action}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => navigate('/setores')}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="submit-button-tutorial"
                                >
                                    {isEditMode ? 'Atualizar' : 'Adicionar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>



        </div>
    );
}