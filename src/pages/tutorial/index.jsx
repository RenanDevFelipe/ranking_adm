import { useState, useEffect } from 'react';
import { getTutoriais, deleteTutorial } from '../../services/api.ts';
import { logout } from '../../utils/auth.js';
import Sidebar from "../../components/sidebar/index.jsx";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaPlus } from 'react-icons/fa';
import DehazeIcon from '@mui/icons-material/Dehaze';

export default function Tutorial() {
    const [tutoriais, setTutoriais] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [darkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });
    const navigate = useNavigate();
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    // Aplica o tema ao body
    useEffect(() => {
        if (darkMode) {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
        }
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    useEffect(() => {
        let isMounted = true;
        const token = localStorage.getItem('access_token');

        const fetchData = async () => {
            try {
                const tutoriaisData = await getTutoriais(token);
                if (isMounted) {
                    setTutoriais(tutoriaisData);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    if (err.response?.status === 401) {
                        setError('Sessão expirada. Redirecionando para login...');
                        logout();
                    } else {
                        setError(err.message || 'Erro ao carregar tutoriais');
                    }
                    setLoading(false);
                }
                console.error("Erro ao buscar tutoriais:", err);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    const filteredTutoriais = tutoriais.filter(tutorial =>
        tutorial.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (id) => {
        navigate(`/Tutorial/${id}`);
    };

    const handleDelete = async (id, nome) => {
        const result = await Swal.fire({
            title: 'Tem certeza?',
            text: `Você está prestes a excluir o tutorial ${nome}. Esta ação não pode ser desfeita!`,
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
                await deleteTutorial(token, id);

                // Atualiza a lista de colaboradores após exclusão
                setTutoriais(tutoriais.filter(tutorial => tutorial.id !== id));

                Swal.fire(
                    'Excluído!',
                    'O Tutorial foi excluído com sucesso.',
                    'success'
                );
            } catch (err) {
                console.error("Erro ao excluir tutorial:", err);
                Swal.fire(
                    'Erro!',
                    'Ocorreu um erro ao tentar excluir o tutorial.',
                    'error'
                );
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando tutoriais...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">{error}</div>
                <button
                    className="retry-button"
                    onClick={() => window.location.reload()}
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className={`tutorial-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
            <Sidebar isVisible={isSidebarVisible} />
            <div className='main-content'>
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
                            placeholder="Pesquisar tutoriais..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        {/* <button 
                        onClick={() => setDarkMode(!darkMode)} 
                        className="theme-toggle"
                    >
                        {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                    </button> */}
                    </div>

                    {filteredTutoriais.length > 0 ? (
                        <div className="tutorials-grid">
                            {filteredTutoriais.map((tutorial) => (
                                <div key={tutorial.id} className="tutorial-card">
                                    <h3 className="tutorial-title">{tutorial.title}</h3>
                                    {tutorial.descricao && (
                                        <p className="tutorial-description">{tutorial.descricao}</p>
                                    )}
                                    <div className='container-link'>
                                        {tutorial.url_view && (
                                            <a
                                                href={tutorial.url_view}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="tutorial-link"
                                            >
                                                Acessar Tutorial
                                            </a>
                                        )}
                                        {tutorial.url_download && (
                                            <a
                                                href={tutorial.url_download}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="tutorial-link"
                                            >
                                                Baixar Tutorial
                                            </a>
                                        )}
                                    </div>
                                    <div className='container-actions'>
                                        <EditIcon onClick={() => handleEdit(tutorial.id)} />
                                        <DeleteIcon onClick={() => handleDelete(tutorial.id, tutorial.title)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : searchTerm ? (
                        <p className="no-results">Nenhum tutorial encontrado para "{searchTerm}"</p>
                    ) : (
                        <p className="no-results">Nenhum tutorial disponível</p>
                    )}
                </div>

            </div>
            {/* Botão flutuante para adicionar novo colaborador */}
            <button
                className="add-button"
                onClick={() => navigate('/tutorial/0')}
            >
                <FaPlus />
            </button>
        </div>
    );
}