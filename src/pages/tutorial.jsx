import { useState, useEffect } from 'react';
import { getTutoriais } from '../services/api.ts';
import { logout } from '../utils/auth'; // Certifique-se de ter esta função definida

export default function Tutorial() {
    const [tutoriais, setTutoriais] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [darkMode, setDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });

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
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Pesquisar tutoriais..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <button 
                    onClick={() => setDarkMode(!darkMode)} 
                    className="theme-toggle"
                >
                    {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
            </div>

            {filteredTutoriais.length > 0 ? (
                <div className="tutorials-grid">
                    {filteredTutoriais.map((tutorial) => (
                        <div key={tutorial.id} className="tutorial-card">
                            <h3 className="tutorial-title">{tutorial.title}</h3>
                            {tutorial.description && (
                                <p className="tutorial-description">{tutorial.description}</p>
                            )}
                            {tutorial.link && (
                                <a 
                                    href={tutorial.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="tutorial-link"
                                >
                                    Acessar Tutorial
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            ) : searchTerm ? (
                <p className="no-results">Nenhum tutorial encontrado para "{searchTerm}"</p>
            ) : (
                <p className="no-results">Nenhum tutorial disponível</p>
            )}
        </div>
    );
}