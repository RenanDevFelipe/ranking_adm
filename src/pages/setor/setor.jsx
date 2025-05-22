import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/sidebar';
import "../styles.css";
import { getUsuarioById, getSetores, addUsuario, updateUsuario } from '../../services/api.ts';
import { logout } from '../../utils/auth';
import Swal from 'sweetalert2';
import DehazeIcon from '@mui/icons-material/Dehaze';
import { FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function AddUsuario() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [setores, setSetores] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [darkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : true;
    });

    // Estado para erros de validação por campo
    const [fieldErrors, setFieldErrors] = useState({
        nome_user: '',
        email_user: '',
        senha_user: '',
        setor_user: '',
        role: '',
        id_ixc_user: ''
    });

    // Estado para campos que devem pulsar
    const [pulsingFields, setPulsingFields] = useState({
        nome_user: false,
        email_user: false,
        senha_user: false,
        setor_user: false,
        role: false,
        id_ixc_user: false
    });

    // Dados do formulário
    const [formData, setFormData] = useState({
        id_user: 0,
        id_ixc_user: 0,
        nome_user: '',
        email_user: '',
        senha_user: '',
        setor_user: null,
        role: null,
        action: '',
    });

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

    // Carrega dados iniciais
    useEffect(() => {
        const token = localStorage.getItem('access_token');

        const fetchInitialData = async () => {
            try {
                // Carrega lista de setores
                const setoresData = await getSetores(token);
                setSetores(setoresData);

                // Se for modo de edição, carrega os dados do colaborador
                if (id && id !== '0') {
                    setIsEditMode(true);
                    const colaboradorData = await getUsuarioById(token, id);
                    setFormData({
                        id_user: colaboradorData.id_user || 0,
                        id_ixc_user: colaboradorData.id_ixc_user || 0,
                        nome_user: colaboradorData.nome_user || '',
                        email_user: colaboradorData.email_user || '',
                        senha_user: '', // Não carrega a senha por segurança
                        setor_user: colaboradorData.setor_user || null,
                        role: colaboradorData.role || null,
                        action: colaboradorData.action || ''
                    });
                }
            } catch (err) {
                console.error("Erro ao carregar dados:", err);
                if (err.response?.status === 401) {
                    setError('Sessão expirada. Redirecionando para login...');
                    logout();
                } else {
                    setError(err.message || 'Erro ao carregar dados');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [id]);

    // Função para ativar o efeito de pulsação em um campo
    const pulseField = (fieldName) => {
        setPulsingFields(prev => ({ ...prev, [fieldName]: true }));
        setTimeout(() => {
            setPulsingFields(prev => ({ ...prev, [fieldName]: false }));
        }, 1000);
    };

    // Funções de validação
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validatePassword = (password) => {
        const errors = [];

        // Mínimo 8 caracteres
        if (password.length < 8) {
            errors.push('Mínimo 8 caracteres');
        }

        // Pelo menos uma letra maiúscula
        if (!/[A-Z]/.test(password)) {
            errors.push('1 letra maiúscula');
        }

        // Pelo menos uma letra minúscula
        if (!/[a-z]/.test(password)) {
            errors.push('1 letra minúscula');
        }

        // Pelo menos um caractere especial
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('1 caractere especial');
        }

        // Não pode ter sequência numérica de 3 ou mais
        if (/(012|123|234|345|456|567|678|789|890)/.test(password) ||
            /(987|876|765|654|543|432|321|210)/.test(password)) {
            errors.push('Sem sequências numéricas');
        }

        return errors.length > 0 ? errors.join(', ') : '';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Atualiza o valor do campo
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Validação em tempo real
        if (name === 'email_user') {
            setFieldErrors(prev => ({
                ...prev,
                email_user: validateEmail(value) ? '' : 'Email inválido'
            }));
        }

        // Valida senha apenas se não estiver vazia (ou se for create)
        if (name === 'senha_user') {
            if ((!isEditMode || value) && value) {
                setFieldErrors(prev => ({
                    ...prev,
                    senha_user: validatePassword(value)
                }));
            } else {
                // Limpa o erro se estiver vazio no update
                setFieldErrors(prev => ({
                    ...prev,
                    senha_user: ''
                }));
            }
        }

        if (name === 'id_ixc_user') {
            setFieldErrors(prev => ({
                ...prev,
                id_ixc_user: value > 0 ? '' : 'ID IXC deve ser maior que 0'
            }));
        }

        // Validação básica de campo obrigatório
        if (['nome_user', 'setor_user', 'role'].includes(name)) {
            setFieldErrors(prev => ({
                ...prev,
                [name]: value ? '' : 'Campo obrigatório'
            }));
        }
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = { ...fieldErrors };
        const fieldsToPulse = [];

        // Validação de campos obrigatórios
        if (!formData.nome_user) {
            newErrors.nome_user = 'Campo obrigatório';
            fieldsToPulse.push('nome_user');
            isValid = false;
        }

        if (!formData.email_user) {
            newErrors.email_user = 'Campo obrigatório';
            fieldsToPulse.push('email_user');
            isValid = false;
        } else if (!validateEmail(formData.email_user)) {
            newErrors.email_user = 'Email inválido';
            fieldsToPulse.push('email_user');
            isValid = false;
        }

        // Validação de senha - obrigatória no create, opcional no update
        if (!isEditMode && !formData.senha_user) {
            newErrors.senha_user = 'Campo obrigatório';
            fieldsToPulse.push('senha_user');
            isValid = false;
        }

        // Valida formato da senha apenas se não estiver vazia (e no create)
        if ((!isEditMode || formData.senha_user) && formData.senha_user) {
            const passwordError = validatePassword(formData.senha_user);
            if (passwordError) {
                newErrors.senha_user = passwordError;
                fieldsToPulse.push('senha_user');
                isValid = false;
            }
        }

        if (!formData.setor_user) {
            newErrors.setor_user = 'Campo obrigatório';
            fieldsToPulse.push('setor_user');
            isValid = false;
        }

        if (!formData.role) {
            newErrors.role = 'Campo obrigatório';
            fieldsToPulse.push('role');
            isValid = false;
        }

        if (formData.id_ixc_user <= 0) {
            newErrors.id_ixc_user = 'ID IXC deve ser maior que 0';
            fieldsToPulse.push('id_ixc_user');
            isValid = false;
        }

        setFieldErrors(newErrors);

        // Ativa o efeito de pulsação nos campos inválidos
        fieldsToPulse.forEach(field => pulseField(field));

        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        const token = localStorage.getItem('access_token');

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('id_user', formData.id_user || '');
            formDataToSend.append('nome_user', formData.nome_user || '');
            formDataToSend.append('setor_user', formData.setor_user || '');
            formDataToSend.append('email_user', formData.email_user || '');
            formDataToSend.append('senha_user', formData.senha_user || ''); // Pode ser vazio no update
            formDataToSend.append('role', formData.role || '');
            formDataToSend.append('id_ixc_user', formData.id_ixc_user || '');
            formDataToSend.append('action', isEditMode ? "update" : "create");

            let response;
            if (isEditMode) {
                response = await updateUsuario(token, formDataToSend);
            } else {
                response = await addUsuario(token, formDataToSend);
            }

            if (response.status === 'error') {
                throw new Error(response.message || 'Erro ao processar a requisição');
            }

            Swal.fire(
                'Sucesso!',
                isEditMode ? 'Usuario editado com sucesso.' : 'Usuario adicionado com sucesso.',
                'success'
            ).then(() => {
                navigate('/usuarios');
            });
        } catch (err) {
            console.error("Erro ao salvar usuario:", err);
            Swal.fire(
                'Erro!',
                err.message || 'Ocorreu um erro ao salvar o usuario.',
                'error'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
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
            <div className="main-content-colaborador">
                <div className="sidebar-footer">
                    <button
                        className={`sidebar-toggle ${darkMode ? 'dark' : 'light'}`}
                        onClick={toggleSidebar}
                    >
                        {isSidebarVisible ? <DehazeIcon /> : '►'}
                    </button>
                    <div className="form-container">
                        <h1>{isEditMode ? 'Editar usuario' : 'Adicionar usuario'}</h1>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="nome_user">Nome do usuario</label>
                                <input
                                    type="text"
                                    id="nome_user"
                                    name="nome_user"
                                    value={formData.nome_user}
                                    onChange={handleInputChange}
                                    required
                                    className={pulsingFields.nome_user ? 'pulse' : ''}
                                />
                                {fieldErrors.nome_user && (
                                    <div className="error-message">{fieldErrors.nome_user}</div>
                                )}
                                <input
                                    type="hidden"
                                    id='action'
                                    name='action'
                                    value={formData.action}
                                    onChange={handleInputChange}
                                />
                                <input
                                    type="hidden"
                                    id='id_user'
                                    name='id_user'
                                    value={formData.id_user}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email_user">Email do usuario</label>
                                <input
                                    type="email"
                                    id="email_user"
                                    name="email_user"
                                    value={formData.email_user}
                                    onChange={handleInputChange}
                                    required
                                    className={pulsingFields.email_user ? 'pulse' : ''}
                                />
                                {fieldErrors.email_user && (
                                    <div className="error-message">{fieldErrors.email_user}</div>
                                )}
                            </div>

                            <div className="form-group password-container">
                                <label htmlFor="senha_user">Senha do usuario</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="senha_user"
                                        name="senha_user"
                                        value={formData.senha_user}
                                        onChange={handleInputChange}
                                        required={!isEditMode} // Só obrigatório se não for edição
                                        className={pulsingFields.senha_user ? 'pulse' : ''}
                                        placeholder={isEditMode ? "Deixe em branco para manter a senha atual" : ""}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {fieldErrors.senha_user && (
                                    <div className="error-message">
                                        {fieldErrors.senha_user}
                                    </div>
                                )}
                                {!fieldErrors.senha_user && formData.senha_user && (
                                    <div className="success-message">Senha válida</div>
                                )}
                                {isEditMode && !formData.senha_user && !fieldErrors.senha_user && (
                                    <div className="info-message">
                                        Deixe em branco para manter a senha atual
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="setor_user">Setor</label>
                                <select
                                    id="setor_user"
                                    name="setor_user"
                                    value={formData.setor_user || ''}
                                    onChange={handleInputChange}
                                    required
                                    className={pulsingFields.setor_user ? 'pulse' : ''}
                                >
                                    <option value="">Selecione um setor</option>
                                    {setores.map(setor => (
                                        <option key={setor.id_setor} value={setor.id_setor}>
                                            {setor.nome_setor}
                                        </option>
                                    ))}
                                </select>
                                {fieldErrors.setor_user && (
                                    <div className="error-message">{fieldErrors.setor_user}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="id_ixc_user">ID IXC</label>
                                <input
                                    type="number"
                                    id="id_ixc_user"
                                    name="id_ixc_user"
                                    value={formData.id_ixc_user}
                                    onChange={handleInputChange}
                                    min="1"
                                    className={pulsingFields.id_ixc_user ? 'pulse' : ''}
                                />
                                {fieldErrors.id_ixc_user && (
                                    <div className="error-message">{fieldErrors.id_ixc_user}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="role">Nível de Acesso</label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role || ''}
                                    onChange={handleInputChange}
                                    required
                                    className={pulsingFields.role ? 'pulse' : ''}
                                >
                                    <option value="">Selecione um nível</option>
                                    <option value="1">Administrador</option>
                                    <option value="2">Colaborador</option>
                                </select>
                                {fieldErrors.role && (
                                    <div className="error-message">{fieldErrors.role}</div>
                                )}
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => navigate('/usuarios')}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="submit-button-tutorial"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <FaSpinner className="spinner-icon" />
                                            {isEditMode ? 'Atualizando...' : 'Adicionando...'}
                                        </>
                                    ) : (
                                        isEditMode ? 'Atualizar' : 'Adicionar'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}