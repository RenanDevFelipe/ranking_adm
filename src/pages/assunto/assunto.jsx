import Sidebar from '../../components/sidebar/index.jsx';
import { addAssunto } from '../../services/api.ts';
import "../styles.css";
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { logout } from '../../utils/auth';
import Swal from 'sweetalert2';

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

    
    // Dados do formulário
    const [formData, setFormData] = useState({
        id: 0,
        name: '',
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
                // Se for modo de edição, carrega os dados do colaborador
                if (id && id !== "0") {
                    setIsEditMode(true);
                    // const assuntoData = await getAssuntoById(token, id);
                    // setFormData({
                    //     id: assuntoData.id || 0,
                    //     name: assuntoData.name || '',
                    //     action: assuntoData.action || ''
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');

        try {
            // Cria um FormData para enviar o arquivo
            const formDataToSend = new FormData();
            formDataToSend.append('id', formData.id);
            formDataToSend.append('name', formData.name);
            formDataToSend.append('action', isEditMode ? "update" : "create");

            if (isEditMode) {
                // await updateAssunto(token, formDataToSend);
                Swal.fire(
                    'Sucesso!',
                    'Assunto editado com sucesso.',
                    'success'
                );
            } else {
                console.log(formDataToSend);
                await addAssunto(token, formDataToSend);
                Swal.fire(
                    'Sucesso!',
                    'Assunto adicionado com sucesso.',
                    'success'
                );
            }
            navigate('/assuntos');
        } catch (err) {
            console.error("Erro ao criar ou editar o assunto:", err);
            Swal.fire(
                'Erro!',
                err.response?.data?.message || 'Ocorreu um erro ao criar ou editar o assunto.',
                'error'
            );
        }
    };

    if (loading) {
        return (
            <div className="app-container">
                <Sidebar />
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
            <Sidebar />
            <div className="main-content">
                <div className="sidebar-footer">
                    <div className="form-container">
                        <h1>{isEditMode ? 'Editar Assunto' : 'Adicionar Assunto'}</h1>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Nome do assunto</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
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

                            <div className="form-group">
                                <label htmlFor="id">ID do assunto</label>
                                <input
                                    type="text"
                                    id="id"
                                    name="id"
                                    value={formData.id}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => navigate('/assuntos')}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="submit-button"
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