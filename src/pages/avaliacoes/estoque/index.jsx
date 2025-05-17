import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from "../../../components/sidebar/index.jsx";
import "../../styles.css";
import { getColaboradorById, addAvaliacaoEstoque } from '../../../services/api.ts';
import { useTheme } from '../../../context/ThemeContext.js';
import Swal from 'sweetalert2';
import DehazeIcon from '@mui/icons-material/Dehaze';

export default function Avaliar() {
    const { id } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const bd = queryParams.get('bd');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dataSelecionada, setDataSelecionada] = useState('');
    const [colaborador, setColaborador] = useState(null);
    const { darkMode } = useTheme();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [formValues, setFormValues] = useState({
        pedido_add: 0,
        pedido_sub: 0,
        prazo_add: 0,
        prazo_sub: 0,
        etiqueta_add: 0,
        etiqueta_sub: 0,
        baixa_mat_add: 0,
        baixa_mat_sub: 0,
        troca_equip_add: 0,
        troca_equip_sub: 0,
        transferencia_add: 0,
        transferencia_sub: 0,
        observacao: ""
    });

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const fetchColaborador = useCallback(async () => {
        try {
            const token = localStorage.getItem('access_token');
            const colaboradorData = await getColaboradorById(token, bd);
            setColaborador(colaboradorData);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }, [bd]);

    useEffect(() => {
        fetchColaborador();
    }, [id, fetchColaborador]);

    useEffect(() => {
        const currentDate = new Date();
        const day = currentDate.getDate().toString().padStart(2, '0');
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const year = currentDate.getFullYear();
        setDataSelecionada(`${year}-${month}-${day}`);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/');
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormValues({
            ...formValues,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
        });
    };

    const handleMovimentacoesClick = () => {
        navigate(`/estoque/movimentacoes/${id}?bd=${bd}&data=${dataSelecionada}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('access_token');
            const user_name = localStorage.getItem('user_name');

            const filteredValues = Object.fromEntries(
                Object.entries(formValues).filter(([key, value]) =>
                    (key.endsWith('_add') || key.endsWith('_sub')) ? value === 1 : true
                )
            );

            const formData = {
                ...filteredValues,
                data_requisicao: dataSelecionada,
                id_colaborador: bd,
                nome_tecnico: colaborador?.nome_colaborador || '',
                nome_avaliador: user_name || '',
            };

            const response = await addAvaliacaoEstoque(token, formData);

            if (response && response.status && response.message) {
                await Swal.fire({
                    title: (response.type || response.status) === 'success' ? 'Sucesso!' : 'Erro!',
                    text: response.message,
                    icon: response.status,
                    confirmButtonText: 'OK'
                });
            }

            if (response.type || response.status === 'success') {
                window.location.reload();
            }

        } catch (error) {
            console.error('Erro ao enviar avaliação:', error);
            setError('Erro ao enviar avaliação. Tente novamente.');
            let errorMessage = error.message;
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }

            await Swal.fire({
                title: 'Erro!',
                text: 'Erro ao salvar avaliação: ' + errorMessage,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando dados do colaborador...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Tentar novamente</button>
            </div>
        );
    }

    return (
        <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
            <Sidebar isVisible={isSidebarVisible} />
            <div className="main-content-avaliar">
                <div className="container-conteudo">
                    <button
                        className={`sidebar-toggle ${darkMode ? 'dark' : 'light'}`}
                        onClick={toggleSidebar}
                    >
                        {isSidebarVisible ? <DehazeIcon /> : '►'}
                    </button>
                    <h2>Avaliação do Colaborador {colaborador?.nome_colaborador}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group-n2">
                            <div className='data'>
                                <label>Data da Avaliação:</label>
                                <input
                                    type="date"
                                    value={dataSelecionada}
                                    onChange={(e) => setDataSelecionada(e.target.value)}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className='movimentacao'>
                                <button
                                    type="button"
                                    onClick={handleMovimentacoesClick}
                                >
                                    Movimentações
                                </button>
                            </div>
                        </div>

                        <div className='form-box'>
                            <div className="form-section">
                                <h3>Pedido</h3>
                                <div className="checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="pedido_add"
                                            checked={formValues.pedido_add === 1}
                                            onChange={handleInputChange}
                                        />
                                        Adicionar pontos
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="pedido_sub"
                                            checked={formValues.pedido_sub === 1}
                                            onChange={handleInputChange}
                                        />
                                        Retirar pontos
                                    </label>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Prazo</h3>
                                <div className="checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="prazo_add"
                                            checked={formValues.prazo_add === 1}
                                            onChange={handleInputChange}
                                        />
                                        Adicionar pontos
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="prazo_sub"
                                            checked={formValues.prazo_sub === 1}
                                            onChange={handleInputChange}
                                        />
                                        Retirar pontos
                                    </label>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Etiqueta</h3>
                                <div className="checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="etiqueta_add"
                                            checked={formValues.etiqueta_add === 1}
                                            onChange={handleInputChange}
                                        />
                                        Adicionar pontos
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="etiqueta_sub"
                                            checked={formValues.etiqueta_sub === 1}
                                            onChange={handleInputChange}
                                        />
                                        Retirar pontos
                                    </label>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Baixa de Material</h3>
                                <div className="checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="baixa_mat_add"
                                            checked={formValues.baixa_mat_add === 1}
                                            onChange={handleInputChange}
                                        />
                                        Adicionar pontos
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="baixa_mat_sub"
                                            checked={formValues.baixa_mat_sub === 1}
                                            onChange={handleInputChange}
                                        />
                                        Retirar pontos
                                    </label>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Troca de Equipamento</h3>
                                <div className="checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="troca_equip_add"
                                            checked={formValues.troca_equip_add === 1}
                                            onChange={handleInputChange}
                                        />
                                        Adicionar pontos
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="troca_equip_sub"
                                            checked={formValues.troca_equip_sub === 1}
                                            onChange={handleInputChange}
                                        />
                                        Retirar pontos
                                    </label>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Transferência</h3>
                                <div className="checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="transferencia_add"
                                            checked={formValues.transferencia_add === 1}
                                            onChange={handleInputChange}
                                        />
                                        Adicionar pontos
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="transferencia_sub"
                                            checked={formValues.transferencia_sub === 1}
                                            onChange={handleInputChange}
                                        />
                                        Retirar pontos
                                    </label>
                                </div>
                            </div>

                            <div className='obs'>
                                <label htmlFor="obs">Observação:</label>
                                <textarea 
                                    value={formValues.observacao} 
                                    name="observacao" 
                                    id="obs" 
                                    onChange={handleInputChange}
                                ></textarea>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-button"></span>
                                    Enviando...
                                </>
                            ) : (
                                "Enviar Avaliação"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}