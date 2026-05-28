import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/sidebar/index.jsx';
import '../styles.css';
import {
    addIxcConfig,
    getIxcConfigById,
    updateIxcConfig
} from '../../services/api.ts';
import { logout } from '../../utils/auth.js';
import Swal from 'sweetalert2';
import DehazeIcon from '@mui/icons-material/Dehaze';

export default function IxcConfigForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = id && id !== '0';
    const [loading, setLoading] = useState(Boolean(isEditMode));
    const [error, setError] = useState(null);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [darkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });
    const [formData, setFormData] = useState({
        id: '',
        nome: '',
        base_url: '',
        token: '',
        ativo: true
    });

    useEffect(() => {
        if (!isEditMode) return;

        let isMounted = true;
        const token = localStorage.getItem('access_token');

        const fetchConfig = async () => {
            try {
                const data = await getIxcConfigById(token, id);
                if (isMounted) {
                    setFormData({
                        id: data.id || '',
                        nome: data.nome || '',
                        base_url: data.base_url || '',
                        token: '',
                        ativo: Boolean(data.ativo)
                    });
                }
            } catch (err) {
                if (isMounted) {
                    if (err.response?.status === 401) {
                        logout();
                        navigate('/');
                        return;
                    }
                    setError(err.message || 'Erro ao carregar configuracao IXC');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchConfig();

        return () => {
            isMounted = false;
        };
    }, [id, isEditMode, navigate]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('access_token');
            const formDataToSend = new FormData();
            formDataToSend.append('id', formData.id || id || '');
            formDataToSend.append('nome', formData.nome);
            formDataToSend.append('base_url', formData.base_url);
            formDataToSend.append('token', formData.token);
            formDataToSend.append('ativo', String(formData.ativo));

            if (isEditMode) {
                await updateIxcConfig(token, formDataToSend);
            } else {
                await addIxcConfig(token, formDataToSend);
            }

            Swal.fire(
                'Sucesso!',
                isEditMode ? 'Configuracao IXC atualizada com sucesso.' : 'Configuracao IXC criada com sucesso.',
                'success'
            ).then(() => navigate('/ixc-configs'));
        } catch (err) {
            Swal.fire('Erro!', err.message || 'Erro ao salvar configuracao IXC.', 'error');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando configuracao IXC...</p>
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
        <div className="app-container">
            <Sidebar isVisible={isSidebarVisible} />
            <div className="main-content-form">
                <div className="sidebar-footer">
                    <button
                        className={`sidebar-toggle ${darkMode ? 'dark' : 'light'}`}
                        onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                    >
                        {isSidebarVisible ? <DehazeIcon /> : '>'}
                    </button>

                    <div className="form-container">
                        <h1>{isEditMode ? 'Editar IXC' : 'Adicionar IXC'}</h1>

                        <form onSubmit={handleSubmit}>
                            <input type="hidden" name="id" value={formData.id} />

                            <div className="form-group">
                                <label htmlFor="nome">Nome</label>
                                <input
                                    type="text"
                                    id="nome"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="base_url">Base URL</label>
                                <input
                                    type="url"
                                    id="base_url"
                                    name="base_url"
                                    value={formData.base_url}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="token">Token</label>
                                <input
                                    type="password"
                                    id="token"
                                    name="token"
                                    value={formData.token}
                                    onChange={handleInputChange}
                                    placeholder={isEditMode ? 'Deixe em branco para manter o token atual' : ''}
                                    required={!isEditMode}
                                />
                                {isEditMode && (
                                    <div className="info-message">
                                        Deixe em branco para manter o token atual
                                    </div>
                                )}
                            </div>

                            <div className="form-group ixc-active-field">
                                <label htmlFor="ativo">Ativo</label>
                                <input
                                    type="checkbox"
                                    id="ativo"
                                    name="ativo"
                                    checked={formData.ativo}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => navigate('/ixc-configs')}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="submit-button-tutorial">
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
