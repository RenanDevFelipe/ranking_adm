import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from "../../../components/sidebar/index.jsx";
import "../../styles.css";
import { getColaboradorById, addAvaliacaoN2 } from '../../../services/api.ts'; // Adicione esta importação
import { useTheme } from '../../../context/ThemeContext.js';
import Swal from 'sweetalert2';
import DehazeIcon from '@mui/icons-material/Dehaze';

export default function Avaliar() {
    const { id } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const bd = queryParams.get('bd'); // Isso vai capturar "19" corretamente
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dataSelecionada, setDataSelecionada] = useState('');
    const [colaborador, setColaborador] = useState(null); // Estado para armazenar dados do colaborador
    const { darkMode } = useTheme();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [formValues, setFormValues] = useState({
        finalizacao_os_add: 0,
        finalizacao_os_sub: 0,
        lavagem_carro_add: 0,
        lavagem_carro_sub: 0,
        organizacao_material_add: 0,
        organizacao_material_sub: 0,
        fardamento_add: 0,
        fardamento_sub: 0,
        observacao: ""
    });

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    // Busca dados do colaborador com useCallback
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

    // Efeito para buscar dados do colaborador
    useEffect(() => {
        fetchColaborador();
    }, [id, fetchColaborador]); // Adicionei fetchColaborador como dependência

    // Define a data inicial (hoje)
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
        navigate(`/movimentacoes/${id}?bd=${bd}&data=${dataSelecionada}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('access_token');
            const user_name = localStorage.getItem('user_name');

            // Cria um objeto com apenas os campos marcados (valor 1)
            const filteredValues = Object.fromEntries(
                Object.entries(formValues).filter(([key, value]) =>
                    (key.endsWith('_add') || key.endsWith('_sub')) ? value === 1 : true
                )
            );

            const formData = {
                ...filteredValues, // Usa apenas os valores filtrados
                data_requisicao: dataSelecionada,
                id_colaborador: bd,
                nome_tecnico: colaborador?.nome_colaborador || '',
                nome_avaliador: user_name || '',
            };

            // Chamada à API corretamente formatada
            const response = await addAvaliacaoN2(token, formData);

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
            setIsSubmitting(false); // Desativa o loading independente do resultado
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
                                <h3>Finalização de OS</h3>
                                <div className="checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="finalizacao_os_add"
                                            checked={formValues.finalizacao_os_add === 1}
                                            onChange={handleInputChange}
                                        />
                                        Adicionar 10 pontos
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="finalizacao_os_sub"
                                            checked={formValues.finalizacao_os_sub === 1}
                                            onChange={handleInputChange}
                                        />
                                        Retirar 10 pontos
                                    </label>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Lavagem de Carro</h3>
                                <div className="checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="lavagem_carro_add"
                                            checked={formValues.lavagem_carro_add === 1}
                                            onChange={handleInputChange}
                                        />
                                        Adicionar 10 pontos
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="lavagem_carro_sub"
                                            checked={formValues.lavagem_carro_sub === 1}
                                            onChange={handleInputChange}
                                        />
                                        Retirar 10 pontos
                                    </label>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Organização de Material</h3>
                                <div className="checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="organizacao_material_add"
                                            checked={formValues.organizacao_material_add === 1}
                                            onChange={handleInputChange}
                                        />
                                        Adicionar 10 pontos
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="organizacao_material_sub"
                                            checked={formValues.organizacao_material_sub === 1}
                                            onChange={handleInputChange}
                                        />
                                        Retirar 10 pontos
                                    </label>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Fardamento</h3>
                                <div className="checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="fardamento_add"
                                            checked={formValues.fardamento_add === 1}
                                            onChange={handleInputChange}
                                        />
                                        Adicionar 10 pontos
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="fardamento_sub"
                                            checked={formValues.fardamento_sub === 1}
                                            onChange={handleInputChange}
                                        />
                                        Retirar 10 pontos
                                    </label>
                                </div>
                            </div>
                            <div className='obs'>
                                <label htmlFor="obs">Observação:</label>
                                <textarea value={formValues.observacao} name="observacao" id="obs" onChange={handleInputChange}></textarea>
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