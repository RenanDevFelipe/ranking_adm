import { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar';
import "./styles.css";
import Card from '../components/card';
import { getColaboradores, getSetores } from '../services/api.ts';
import defaultAvatar from "../utils/img/jadson.png";
import { logout } from '../utils/auth';

export default function Home() {
    const [colaboradores, setColaboradores] = useState([]);
    const [setores, setSetores] = useState([]);
    const [loading, setLoading] = useState({
        colaboradores: true,
        setores: true
    });
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [darkMode, setDarkMode] = useState(() => {
        // Verifica se há preferência salva no localStorage
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : true; // Dark mode como padrão
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
    }, [logout]);

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
                    <div className='search-box'>
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
                                        logo={defaultAvatar} // Substitua por colab.foto se disponível
                                        name={colab.nome_colaborador}
                                        role={getNomeSetor(colab.setor_colaborador)}
                                        action="Avaliar"
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