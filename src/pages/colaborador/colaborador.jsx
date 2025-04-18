import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/sidebar';
import "../styles.css";
import { getColaboradorById, getSetores, addColaborador, updateColaborador } from '../../services/api.ts';
import { logout } from '../../utils/auth';
import Swal from 'sweetalert2';

export default function AddColaborador() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [setores, setSetores] = useState([]);
    const [darkMode, setDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // Dados do formulário
    const [formData, setFormData] = useState({
        id_colaborador: 0,
        id_ixc: 0,
        nome_colaborador: '',
        setor_colaborador: null,
        imagem: '',
        action: '',
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
                // Carrega lista de setores
                const setoresData = await getSetores(token);
                setSetores(setoresData);

                // Se for modo de edição, carrega os dados do colaborador
                if (id && id !== '0') {
                    setIsEditMode(true);
                    const colaboradorData = await getColaboradorById(token, id);
                    setFormData({
                        id_colaborador: colaboradorData.id_colaborador || 0,
                        id_ixc: colaboradorData.id_ixc || 0,
                        nome_colaborador: colaboradorData.nome_colaborador,
                        setor_colaborador: colaboradorData.setor_colaborador,
                        imagem: colaboradorData.imagem || '',
                        action: colaboradorData.action || ''
                    });
                    
                    // Se já existir uma imagem, mostra o preview
                    if (colaboradorData.imagem) {
                        setPreviewImage(colaboradorData.imagem);
                    }
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            
            // Cria um preview da imagem
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');

        try {
            // Cria um FormData para enviar o arquivo
            const formDataToSend = new FormData();
            formDataToSend.append('id_colaborador', formData.id_colaborador);
            formDataToSend.append('nome_colaborador', formData.nome_colaborador);
            formDataToSend.append('setor_colaborador', formData.setor_colaborador);
            formDataToSend.append('id_ixc', formData.id_ixc);
            formDataToSend.append('action', isEditMode   ? "update" : "create");
            
            if (selectedFile) {
                formDataToSend.append('imagem', selectedFile);
            }

            if (isEditMode) {
                await updateColaborador(token, formDataToSend);
                Swal.fire(
                    'Sucesso!',
                    'Colaborador editado com sucesso.',
                    'success'
                );
            } else{
                await addColaborador(token, formDataToSend);
                Swal.fire(
                    'Sucesso!',
                    'Colaborador adicionado com sucesso.',
                    'success'
                );
            }
            navigate('/colaboradores');
        } catch (err) {
            console.error("Erro ao salvar colaborador:", err);
            Swal.fire(
                'Erro!',
                err.response?.data?.message || 'Ocorreu um erro ao salvar o colaborador.',
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
                        <h1>{isEditMode ? 'Editar Colaborador' : 'Adicionar Colaborador'}</h1>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="nome_colaborador">Nome do Colaborador</label>
                                <input
                                    type="text"
                                    id="nome_colaborador"
                                    name="nome_colaborador"
                                    value={formData.nome_colaborador}
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
                                <input 
                                    type="hidden"
                                    id='id_colaborador'
                                    name='id_colaborador'
                                    value={formData.id_colaborador}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="setor_colaborador">Setor</label>
                                <select
                                    id="setor_colaborador"
                                    name="setor_colaborador"
                                    value={formData.setor_colaborador || ''}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Selecione um setor</option>
                                    {setores.map(setor => (
                                        <option key={setor.id_setor} value={setor.id_setor}>
                                            {setor.nome_setor}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="id_ixc">ID IXC (opcional)</label>
                                <input
                                    type="number"
                                    id="id_ixc"
                                    name="id_ixc"
                                    value={formData.id_ixc}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="image">Imagem do Colaborador</label>
                                <input
                                    type="file"
                                    id="image"
                                    name="imagem"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                {previewImage && (
                                    <div className="image-preview">
                                        <img 
                                            src={previewImage} 
                                            alt="Preview" 
                                            style={{ 
                                                maxWidth: '200px', 
                                                maxHeight: '200px',
                                                marginTop: '10px',
                                                borderRadius: '5px'
                                            }} 
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    className="cancel-button"
                                    onClick={() => navigate('/colaboradores')}
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