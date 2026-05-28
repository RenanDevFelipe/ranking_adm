import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/sidebar/index.jsx';
import '../styles.css';
import {
    deleteIxcConfig,
    getIxcConfigs,
    testarConexaoIxc
} from '../../services/api.ts';
import { logout } from '../../utils/auth.js';
import Swal from 'sweetalert2';
import { FaPlus } from 'react-icons/fa';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CableIcon from '@mui/icons-material/Cable';
import DehazeIcon from '@mui/icons-material/Dehaze';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';

export default function IxcConfigs() {
    const navigate = useNavigate();
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [darkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });

    useEffect(() => {
        let isMounted = true;
        const token = localStorage.getItem('access_token');

        const fetchConfigs = async () => {
            try {
                const data = await getIxcConfigs(token);
                if (isMounted) {
                    setConfigs(data);
                }
            } catch (err) {
                if (isMounted) {
                    if (err.response?.status === 401) {
                        logout();
                        navigate('/');
                        return;
                    }
                    setError(err.message || 'Erro ao carregar configuracoes IXC');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchConfigs();

        return () => {
            isMounted = false;
        };
    }, [navigate]);

    const handleDelete = async (id, nome) => {
        const result = await Swal.fire({
            title: 'Tem certeza?',
            text: `Voce esta prestes a excluir a configuracao ${nome}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FF6200',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        try {
            const token = localStorage.getItem('access_token');
            await deleteIxcConfig(token, id);
            setConfigs(configs.filter(config => config.id !== id));
            Swal.fire('Excluido!', 'Configuracao IXC removida com sucesso.', 'success');
        } catch (err) {
            Swal.fire('Erro!', err.message || 'Erro ao remover configuracao IXC.', 'error');
        }
    };

    const handleTestConnection = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await testarConexaoIxc(token);
            const data = response.data;

            Swal.fire(
                response.success ? 'Conexao realizada!' : 'Falha na conexao',
                data?.nome ? `${response.message}<br/><br/>Config: ${data.nome}` : response.message,
                response.success ? 'success' : 'error'
            );
        } catch (err) {
            Swal.fire('Erro!', err.message || 'Erro ao testar conexao IXC.', 'error');
        }
    };

    const filteredConfigs = configs.filter(config =>
        config.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.base_url.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando configuracoes IXC...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">{error}</div>
                <button className="retry-button" onClick={() => window.location.reload()}>
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className={`tutorial-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
            <Sidebar isVisible={isSidebarVisible} />
            <main className="main-content-assunto">
                <div className="ixc-page">
                    <header className="ixc-page-header">
                        <button
                            className={`sidebar-toggle ${darkMode ? 'dark' : 'light'}`}
                            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                        >
                            {isSidebarVisible ? <DehazeIcon /> : '>'}
                        </button>
                        <div>
                            <h1>Integração IXC</h1>
                            <p>Configurações de conexão com o IXCSoft</p>
                        </div>
                    </header>

                    <div className="ixc-toolbar">
                        <div className="ixc-search">
                            <SettingsEthernetIcon />
                            <input
                                type="text"
                                placeholder="Pesquisar por nome ou URL"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="ixc-test-button" onClick={handleTestConnection}>
                            <CableIcon />
                            Testar conexão
                        </button>
                    </div>

                    {filteredConfigs.length > 0 ? (
                        <div className="ixc-config-grid">
                            {filteredConfigs.map(config => (
                                <article key={config.id} className="ixc-config-card">
                                    <div className="ixc-card-header">
                                        <div>
                                            <h2>{config.nome}</h2>
                                            <span>ID #{config.id}</span>
                                        </div>
                                        <span className={`ixc-status ${config.ativo ? 'active' : 'inactive'}`}>
                                            {config.ativo ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </div>

                                    <div className="ixc-url">{config.base_url}</div>

                                    <div className="ixc-card-actions">
                                        <button title="Editar" onClick={() => navigate(`/ixc-config/${config.id}`)}>
                                            <EditIcon />
                                        </button>
                                        <button title="Excluir" onClick={() => handleDelete(config.id, config.nome)}>
                                            <DeleteIcon />
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : searchTerm ? (
                        <p className="no-results">Nenhuma configuracao encontrada para "{searchTerm}"</p>
                    ) : (
                        <p className="no-results">Nenhuma configuracao IXC disponivel</p>
                    )}
                </div>
            </main>

            <button className="add-button" onClick={() => navigate('/ixc-config/0')}>
                <FaPlus />
            </button>
        </div>
    );
}
