import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/sidebar';
import "../styles.css";
import { getTutorialById, addTutorial, updateTutorial } from '../../services/api.ts';
import { logout } from '../../utils/auth';
import Swal from 'sweetalert2';
import {
    PictureAsPdf as PictureAsPdfIcon,
    OndemandVideo as OndemandVideoIcon,
    Link as LinkIcon,
    Description as DescriptionIcon
} from '@mui/icons-material';
import {
    Select,
    MenuItem,
    ListItemIcon,
    ListItemText,
    InputLabel,
    FormControl
} from '@mui/material';
import DehazeIcon from '@mui/icons-material/Dehaze';



export default function AddTutorial() {
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
        id: 0,
        title: '',
        descricao: '',
        url_view: '',
        url_download: '',
        criado_por: localStorage.getItem('user_name'),
        name_icon: 'picture_as_pdf',
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
                // Se for modo de edição, carrega os dados do tutorial
                if (id && id !== '0') {
                    setIsEditMode(true);
                    const tutorialData = await getTutorialById(token, parseInt(id));
                    setFormData({
                        id: tutorialData.id || 0,
                        title: tutorialData.title || '',
                        descricao: tutorialData.descricao || '',
                        url_view: tutorialData.url_view || '',
                        url_download: tutorialData.url_download || '',
                        criado_por: tutorialData.criado_por || '',
                        name_icon: tutorialData.icon_name || 'picture_as_pdf',
                    });
                } else {
                    setFormData(prev => ({
                        ...prev,
                    }));
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

    const [urlErrors, setUrlErrors] = useState({
        url_view: false,
        url_download: false
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Validação em tempo real apenas para URLs
        if (name === 'url_view' || name === 'url_download') {
            const isValid = value ? validateGoogleDriveUrl(value) : false;
            setUrlErrors(prev => ({
                ...prev,
                [name]: !isValid
            }));
        }
    };

    const validateGoogleDriveUrl = (url) => {
        if (!url) return false; // Retorna false se estiver vazio

        // Padrões aceitos para visualização
        const viewPatterns = [
            /^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)(\/view|\/preview)?(\?[\w=&]*)?$/,
            /^https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)$/
        ];

        // Padrões aceitos para download
        const downloadPatterns = [
            /^https:\/\/(drive\.google\.com\/u\/\d+\/uc\?id=|drive\.usercontent\.google\.com\/u\/\d+\/uc\?id=|drive\.google\.com\/uc\?id=)([a-zA-Z0-9_-]+)&export=download$/
        ];

        // Verifica se corresponde a algum padrão
        return [...viewPatterns, ...downloadPatterns].some(regex => regex.test(url));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');

        // Verifica erros antes de enviar
        if (urlErrors.url_view || urlErrors.url_download) {
            Swal.fire(
                'Erro!',
                'Por favor, corrija os erros nos campos de URL antes de enviar.',
                'error'
            );
            return;
        }
        try {
            // Cria um FormData para enviar os dados
            const formDataToSend = new FormData();
            formDataToSend.append('id', formData.id.toString());
            formDataToSend.append('title', formData.title);
            formDataToSend.append('descricao', formData.descricao);
            formDataToSend.append('url_view', formData.url_view);
            formDataToSend.append('url_download', formData.url_download);
            formDataToSend.append('criado_por', formData.criado_por);
            formDataToSend.append('name_icon', formData.name_icon);

            if (isEditMode) {
                await updateTutorial(token, formDataToSend);
                Swal.fire(
                    'Sucesso!',
                    'Tutorial atualizado com sucesso.',
                    'success'
                );
            } else {
                await addTutorial(token, formDataToSend);
                Swal.fire(
                    'Sucesso!',
                    'Tutorial adicionado com sucesso.',
                    'success'
                );
            }
            navigate('/tutoriais');
        } catch (err) {
            console.error("Erro ao salvar tutorial:", err);
            Swal.fire(
                'Erro!',
                err.response?.data?.message || 'Ocorreu um erro ao salvar o tutorial.',
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
                    <button
                        className={`sidebar-toggle ${darkMode ? 'dark' : 'light'}`}
                        onClick={toggleSidebar}
                    >
                        {isSidebarVisible ? <DehazeIcon /> : '►'}
                    </button>
                    <div className="form-container">
                        <h1>{isEditMode ? 'Editar Tutorial' : 'Adicionar Tutorial'}</h1>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="title">Título do Tutorial</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="descricao">Descrição</label>
                                <input
                                    id="descricao"
                                    name="descricao"
                                    value={formData.descricao}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="url_view">URL para Visualização</label>
                                <input
                                    type="url"
                                    id="url_view"
                                    name="url_view"
                                    value={formData.url_view}
                                    onChange={handleInputChange}
                                    className={urlErrors.url_view ? 'input-error' : ''}
                                    required
                                />
                                {urlErrors.url_view && formData.url_view && (
                                    <p className="error-message">
                                        Link inválido. Formatos aceitos:
                                        <br />- https://drive.google.com/file/d/ID_DO_ARQUIVO/view
                                        <br />- https://drive.google.com/open?id=ID_DO_ARQUIVO
                                    </p>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="url_download">URL para Download</label>
                                <input
                                    type="url"
                                    id="url_download"
                                    name="url_download"
                                    value={formData.url_download}
                                    onChange={handleInputChange}
                                    className={urlErrors.url_download ? 'input-error' : ''}
                                    required
                                />
                                {urlErrors.url_download && formData.url_download && (
                                    <p className="error-message">
                                        Link inválido. Formato aceito:
                                        <br />- https://drive.google.com/uc?id=ID_DO_ARQUIVO&export=download
                                        <br />- https://drive.usercontent.google.com/... (links similares)
                                    </p>
                                )}
                            </div>

                            <div className="form-group">
                                <input
                                    type="hidden"
                                    id="criador"
                                    name="criador"
                                    value={formData.criado_por}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <FormControl fullWidth >
                                    <InputLabel id="icon-select-label">Ícone</InputLabel>
                                    <Select
                                        labelId="icon-select-label"
                                        id="name_icon"
                                        name="name_icon"
                                        value={formData.name_icon}
                                        onChange={handleInputChange}
                                        label="Ícone"
                                        required
                                    >
                                        <MenuItem value="picture_as_pdf">
                                            <ListItemIcon>
                                                <PictureAsPdfIcon />
                                            </ListItemIcon>
                                            <ListItemText primary="PDF" />
                                        </MenuItem>
                                        <MenuItem value="video_library">
                                            <ListItemIcon>
                                                <OndemandVideoIcon />
                                            </ListItemIcon>
                                            <ListItemText primary="Vídeo" />
                                        </MenuItem>
                                        <MenuItem value="link">
                                            <ListItemIcon>
                                                <LinkIcon />
                                            </ListItemIcon>
                                            <ListItemText primary="Link" />
                                        </MenuItem>
                                        <MenuItem value="description">
                                            <ListItemIcon>
                                                <DescriptionIcon />
                                            </ListItemIcon>
                                            <ListItemText primary="Documento" />
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </div>

                            <input
                                type="hidden"
                                id='id'
                                name='id'
                                value={formData.id}
                                onChange={handleInputChange}
                            />

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => navigate('/tutoriais')}
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