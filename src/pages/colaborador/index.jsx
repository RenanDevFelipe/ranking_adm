import { useState, useEffect } from 'react';
import Sidebar from '../../components/sidebar/index.jsx';
import "../styles.css";
import Card from '../../components/card';
import { getColaboradores, getSetores, deleteColaborador } from '../../services/api.ts';
import { logout } from '../../utils/auth.js';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import DehazeIcon from '@mui/icons-material/Dehaze';

export default function Colaborador() {
    const [colaboradores, setColaboradores] = useState([]);
    const [setores, setSetores] = useState([]);
    const [loading, setLoading] = useState({
        colaboradores: true,
        setores: true
    });
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
        } else {
            document.body.classList.add('light-mode');
        }
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    useEffect(() => {
        let isMounted = true;
        const token = localStorage.getItem('access_token');

        const fetchData = async () => {
            try {
                const [colabsData, setoresData] = await Promise.all([
                    getColaboradores(token),
                    getSetores(token)
                ]);

                if (isMounted) {
                    setColaboradores(colabsData);
                    setSetores(setoresData);
                }
            } catch (err) {
                if (isMounted) {
                    if (err.response?.status === 401) {
                        setError('Sessão expirada. Redirecionando para login...');
                        logout();
                    } else {
                        setError(err.message || 'Erro ao carregar dados');
                    }
                }
                console.error("Erro ao buscar dados:", err);
            } finally {
                if (isMounted) {
                    setLoading({
                        colaboradores: false,
                        setores: false
                    });
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    const getNomeSetor = (idSetor) => {
        const setor = setores.find(s => s.id_setor === idSetor);
        return setor ? setor.nome_setor : 'Setor não especificado';
    };

    const handleEdit = (id) => {
        navigate(`/Colaborador/${id}`);
    };

    const handleDelete = async (id, nome) => {
        const result = await Swal.fire({
            title: 'Tem certeza?',
            text: `Você está prestes a excluir o colaborador ${nome}. Esta ação não pode ser desfeita!`,
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
                await deleteColaborador(token, id);

                // Atualiza a lista de colaboradores após exclusão
                setColaboradores(colaboradores.filter(colab => colab.id_colaborador !== id));

                Swal.fire(
                    'Excluído!',
                    'O colaborador foi excluído com sucesso.',
                    'success'
                );
            } catch (err) {
                console.error("Erro ao excluir colaborador:", err);
                Swal.fire(
                    'Erro!',
                    'Ocorreu um erro ao tentar excluir o colaborador.',
                    'error'
                );
            }
        }
    };

    const filteredColaboradores = colaboradores.filter(colab =>
        colab.nome_colaborador.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isLoading = loading.colaboradores || loading.setores;

    if (isLoading) {
        return (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Carregando Dados...</p>
                </div>
        );
    }

    if (error) {
        return (
            <div className="app-container">
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
                    <div className='search-box'>
                        <button
                            className={`sidebar-toggle ${darkMode ? 'dark' : 'light'}`}
                            onClick={toggleSidebar}
                        >
                            {isSidebarVisible ? <DehazeIcon /> : '►'}
                        </button>
                        <input
                            placeholder='Pesquise pelo nome do técnico'
                            className="search"
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className='container-user'>
                        <div className="user-info">
                            {filteredColaboradores.length > 0 ? (
                                filteredColaboradores.map((colab) => (
                                    <div key={colab.id_colaborador} className="colaborador-card">
                                        <Card
                                            logo={'https://' + colab.url_image}
                                            name={colab.nome_colaborador}
                                            role={getNomeSetor(colab.setor_colaborador)}
                                        />
                                        <div className="action-buttons">
                                            <button
                                                className="edit-button"
                                                onClick={() => handleEdit(colab.id_colaborador)}
                                            >
                                                <FaEdit /> Editar
                                            </button>
                                            <button
                                                className="delete-button"
                                                onClick={() => handleDelete(colab.id_colaborador, colab.nome_colaborador)}
                                            >
                                                <FaTrash /> Excluir
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : searchTerm ? (
                                <p className="no-results">Nenhum colaborador encontrado para "{searchTerm}"</p>
                            ) : (
                                <p className="no-results">Nenhum colaborador disponível</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Botão flutuante para adicionar novo colaborador */}
                <button
                    className="add-button"
                    onClick={() => navigate('/colaborador/0')}
                >
                    <FaPlus />
                </button>
            </div>
        </div>
    );
}