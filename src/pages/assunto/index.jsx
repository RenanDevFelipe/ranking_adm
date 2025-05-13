import { useState, useEffect } from 'react';
import { getAssuntos, deleteAssunto } from '../../services/api.ts';
import { logout } from '../../utils/auth.js';
import Sidebar from "../../components/sidebar/index.jsx";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaPlus } from 'react-icons/fa';
import DehazeIcon from '@mui/icons-material/Dehaze';

export default function Assunto() {
    const [assuntos, setAssuntos] = useState([]);
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

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    const filteredAssuntos = assuntos.filter(assunto =>
        assunto.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (id) => {
        navigate(`/Assunto/${id}`);
    };

    const handleDelete = async (id, nome) => {
        const result = await Swal.fire({
            title: 'Tem certeza?',
            text: `Você está prestes a excluir o assunto ${nome}. Esta ação não pode ser desfeita!`,
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
                await deleteAssunto(token, id);

                // Atualiza a lista de colaboradores após exclusão
                setAssuntos(assuntos.filter(assunto => assunto.id !== id));

                Swal.fire(
                    'Excluído!',
                    'O Assunto foi excluído com sucesso.',
                    'success'
                );
            } catch (err) {
                console.error("Erro ao excluir tutorial:", err);
                Swal.fire(
                    'Erro!',
                    err,
                    'error'
                );
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando assuntos...</p>
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
            <div className='main-content-assunto'>
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
                            placeholder="Pesquisar assuntos..."
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

                    {filteredAssuntos.length > 0 ? (
                        <div className="tutorials-grid">
                            {filteredAssuntos.map((assunto) => (
                                <div key={assunto.id} className="tutorial-card">
                                    <h3 className="tutorial-title">{assunto.name}</h3>
                                    <div className='container-actions'>
                                        <EditIcon onClick={() => handleEdit(assunto.id)} />
                                        <DeleteIcon onClick={() => handleDelete(assunto.id, assunto.title)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : searchTerm ? (
                        <p className="no-results">Nenhum assunto encontrado para "{searchTerm}"</p>
                    ) : (
                        <p className="no-results">Nenhum assunto disponível</p>
                    )}
                </div>
            </div>
            {/* Botão flutuante para adicionar novo colaborador */}
            <button
                className="add-button"
                onClick={() => navigate('/assunto/0')}
            >
                <FaPlus />
            </button>
        </div>
    );
}