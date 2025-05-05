import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/sidebar';
import "./styles.css";
import Card from '../components/card';
import { getColaboradores, getSetores } from '../services/api.ts';
import { logout } from '../utils/auth';
import { useTheme } from '../context/ThemeContext.js';
import DehazeIcon from '@mui/icons-material/Dehaze';


export default function Home() {
    const navigate = useNavigate();
    const [colaboradores, setColaboradores] = useState([]);
    const [setores, setSetores] = useState([]);
    const [loading, setLoading] = useState({
        colaboradores: true,
        setores: true
    });
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { darkMode } = useTheme();
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    // Verifica se o usuário está logado ao carregar a página
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/'); // Redireciona para a página de login se não houver token
        }
    }, [navigate]);


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
                // Busca colaboradores e setores em paralelo
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
                        navigate('/');
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
    }, [navigate]);

    // Encontra o nome do setor pelo ID
    const getNomeSetor = (idSetor) => {
        const setor = setores.find(s => s.id_setor === idSetor);
        return setor ? setor.nome_setor : 'Setor não especificado';
    };

    const filteredColaboradores = colaboradores.filter(colab =>
        colab.nome_colaborador.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isLoading = loading.colaboradores || loading.setores;

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando dados...</p>
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
            <div className="main-content">
                <div className="sidebar-footer">
                    <div className='search-box'>
                        <button
                            className={`sidebar-toggle ${darkMode ? 'dark' : 'light'}`}
                            onClick={toggleSidebar}
                        >
                            {isSidebarVisible ? <DehazeIcon/> : '►'}
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
                                    <Card
                                        key={colab.id_colaborador}
                                        logo={'https://' + colab.url_image}
                                        name={colab.nome_colaborador}
                                        role={getNomeSetor(colab.setor_colaborador)}
                                        action="Avaliar"
                                        onClick={() => navigate(`/avaliar/${colab.id_ixc}`)}
                                    />
                                ))
                            ) : searchTerm ? (
                                <p className="no-results">Nenhum colaborador encontrado para "{searchTerm}"</p>
                            ) : (
                                <p className="no-results">Nenhum colaborador disponível</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}