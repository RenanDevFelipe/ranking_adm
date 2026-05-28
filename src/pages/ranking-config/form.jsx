import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/sidebar/index.jsx';
import '../styles.css';
import {
    addRankingConfiguracao,
    getRankingConfiguracaoById,
    updateRankingConfiguracao
} from '../../services/api.ts';
import { logout } from '../../utils/auth.js';
import Swal from 'sweetalert2';
import DehazeIcon from '@mui/icons-material/Dehaze';

const emptyForm = {
    meta_pontos_os_diaria: 100,
    meta_media_avaliacoes: 10,
    dias_minimos_meta_mensal: 13,
    meses_minimos_meta_anual: 10,
    ativo: true
};

export default function RankingConfigForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = id && id !== '0';
    const [formData, setFormData] = useState(emptyForm);
    const [loading, setLoading] = useState(Boolean(isEditMode));
    const [error, setError] = useState(null);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [darkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode') || 'true'));

    useEffect(() => {
        if (!isEditMode) return;

        const fetchConfig = async () => {
            const token = localStorage.getItem('access_token');

            try {
                const data = await getRankingConfiguracaoById(token, id);
                setFormData({
                    meta_pontos_os_diaria: data.meta_pontos_os_diaria || 0,
                    meta_media_avaliacoes: data.meta_media_avaliacoes || 0,
                    dias_minimos_meta_mensal: data.dias_minimos_meta_mensal || 0,
                    meses_minimos_meta_anual: data.meses_minimos_meta_anual || 0,
                    ativo: Boolean(data.ativo)
                });
            } catch (err) {
                if (err.response?.status === 401) {
                    logout();
                    navigate('/');
                    return;
                }
                setError(err.message || 'Erro ao carregar configuracao do ranking');
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, [id, isEditMode, navigate]);

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const token = localStorage.getItem('access_token');
            if (isEditMode) {
                await updateRankingConfiguracao(token, id, formData);
            } else {
                await addRankingConfiguracao(token, formData);
            }

            Swal.fire(
                'Sucesso!',
                isEditMode ? 'Configuracao atualizada com sucesso.' : 'Configuracao criada com sucesso.',
                'success'
            ).then(() => navigate('/ranking-configuracoes'));
        } catch (err) {
            Swal.fire('Erro!', err.message || 'Erro ao salvar configuracao.', 'error');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando configuracao...</p>
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
                        <h1>{isEditMode ? 'Editar Ranking' : 'Adicionar Ranking'}</h1>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="meta_pontos_os_diaria">Meta diaria de pontos OS</label>
                                <input
                                    type="number"
                                    id="meta_pontos_os_diaria"
                                    name="meta_pontos_os_diaria"
                                    min="0"
                                    value={formData.meta_pontos_os_diaria}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="meta_media_avaliacoes">Meta media de avaliacoes</label>
                                <input
                                    type="number"
                                    id="meta_media_avaliacoes"
                                    name="meta_media_avaliacoes"
                                    min="0"
                                    step="0.01"
                                    value={formData.meta_media_avaliacoes}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="dias_minimos_meta_mensal">Dias minimos para meta mensal</label>
                                <input
                                    type="number"
                                    id="dias_minimos_meta_mensal"
                                    name="dias_minimos_meta_mensal"
                                    min="0"
                                    value={formData.dias_minimos_meta_mensal}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="meses_minimos_meta_anual">Meses minimos para meta anual</label>
                                <input
                                    type="number"
                                    id="meses_minimos_meta_anual"
                                    name="meses_minimos_meta_anual"
                                    min="0"
                                    max="12"
                                    value={formData.meses_minimos_meta_anual}
                                    onChange={handleInputChange}
                                    required
                                />
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
                                    onClick={() => navigate('/ranking-configuracoes')}
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
