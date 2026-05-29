import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/sidebar/index.jsx';
import '../styles.css';
import {
    addIxcFinalizacaoConfig,
    getChecklistById,
    getChecklistAssuntos,
    getIxcFinalizacaoConfigById,
    updateIxcFinalizacaoConfig
} from '../../services/api.ts';
import { logout } from '../../utils/auth.js';
import Swal from 'sweetalert2';
import DehazeIcon from '@mui/icons-material/Dehaze';

const payloadPadrao = {
    id_resposta: null,
    id_proxima_tarefa: null,
    id_proxima_tarefa_aux: null,
    id_evento: null,
    id_su_diagnostico: null,
    id_evento_status: null
};

const emptyForm = {
    id_checklist_assunto: '',
    id_assunto_ixc: '',
    nome_assunto_ixc: '',
    id_item_condicao: '',
    resposta_tipo: 'sem_condicao',
    resposta_condicao: '',
    origem_mensagem: 'usuario',
    ordem_execucao: 1,
    ativo: true,
    finalizar_atendimento: 'N',
    payload: JSON.stringify(payloadPadrao, null, 2)
};

const getChecklistItens = (assunto) => assunto?.checklist?.itens || [];
const getChecklistId = (assunto) => assunto?.id_checklist || assunto?.checklist?.id_checklist || assunto?.checklist?.id;
const getChecklistNome = (assunto) => assunto?.checklist?.nome_checklist || 'Checklist nao informado';
const getAssuntoIxcId = (assunto) => assunto?.id_assunto_ixc ?? assunto?.assunto_ixc?.id ?? assunto?.config?.id_assunto_ixc ?? null;
const getAssuntoIxcNome = (assunto) => assunto?.nome_assunto_ixc ?? assunto?.assunto_ixc?.nome ?? assunto?.config?.nome_assunto_ixc ?? '';
const getAssuntoLabel = (assunto) => {
    const idIxc = assunto?.id_assunto_ixc ? `#${assunto.id_assunto_ixc} - ` : '';
    return `${idIxc}${assunto?.nome_assunto_ixc || 'Assunto sem nome'} | ${getChecklistNome(assunto)}`;
};

const getItemId = (item) => item.id_item || item.id;
const getItemLabel = (item) => item.pergunta || item.titulo || item.label || `Item #${getItemId(item)}`;

const inferirTipoResposta = (valor) => {
    if (valor === null || typeof valor === 'undefined') return 'sem_condicao';
    if (typeof valor === 'boolean') return valor ? 'boolean_true' : 'boolean_false';
    if (typeof valor === 'number') return 'numero';
    return 'texto';
};

const respostaCondicaoFromForm = (formData) => {
    if (formData.resposta_tipo === 'sem_condicao') return null;
    if (formData.resposta_tipo === 'boolean_true') return true;
    if (formData.resposta_tipo === 'boolean_false') return false;
    if (formData.resposta_tipo === 'numero') return Number(formData.resposta_condicao);
    return formData.resposta_condicao;
};

export default function IxcFinalizacaoConfigForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const configId = id && id !== 'undefined' && id !== 'null' ? id : '0';
    const isEditMode = configId !== '0';
    const [formData, setFormData] = useState(emptyForm);
    const [assuntos, setAssuntos] = useState([]);
    const [checklistItens, setChecklistItens] = useState([]);
    const [loadingItens, setLoadingItens] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [darkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode') || 'true'));

    useEffect(() => {
        let isMounted = true;
        const token = localStorage.getItem('access_token');

        const fetchData = async () => {
            try {
                const [assuntosData, configData] = await Promise.all([
                    getChecklistAssuntos(token),
                    isEditMode ? getIxcFinalizacaoConfigById(token, configId) : Promise.resolve(null)
                ]);

                if (!isMounted) return;

                setAssuntos(Array.isArray(assuntosData) ? assuntosData : []);

                if (configData) {
                    const respostaTipo = inferirTipoResposta(configData.resposta_condicao);
                    const assuntoBase = configData.checklist_assunto || configData.assunto || {};
                    const assuntoIxcId = configData.id_assunto_ixc ?? getAssuntoIxcId(assuntoBase) ?? '';
                    const assuntoIxcNome = configData.nome_assunto_ixc ?? getAssuntoIxcNome(assuntoBase) ?? '';

                    setFormData({
                        id_checklist_assunto: String(configData.id_checklist_assunto || ''),
                        id_assunto_ixc: assuntoIxcId ? String(assuntoIxcId) : '',
                        nome_assunto_ixc: String(assuntoIxcNome || ''),
                        id_item_condicao: configData.id_item_condicao ? String(configData.id_item_condicao) : '',
                        resposta_tipo: respostaTipo,
                        resposta_condicao: respostaTipo === 'texto' || respostaTipo === 'numero'
                            ? String(configData.resposta_condicao ?? '')
                            : '',
                        origem_mensagem: configData.origem_mensagem || 'usuario',
                        ordem_execucao: configData.ordem_execucao || 1,
                        ativo: Boolean(configData.ativo),
                        finalizar_atendimento: configData.finalizar_atendimento || 'N',
                        payload: JSON.stringify(configData.payload || payloadPadrao, null, 2)
                    });
                }
            } catch (err) {
                if (isMounted) {
                    if (err.response?.status === 401) {
                        logout();
                        navigate('/');
                        return;
                    }
                    setError(err.message || 'Erro ao carregar configuracao de finalizacao IXC');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [configId, isEditMode, navigate]);

    const assuntoSelecionado = useMemo(() => {
        return assuntos.find(assunto => String(assunto.id) === String(formData.id_checklist_assunto));
    }, [assuntos, formData.id_checklist_assunto]);

    useEffect(() => {
        if (assuntoSelecionado) {
            setFormData(prev => ({
                ...prev,
                id_assunto_ixc: prev.id_assunto_ixc || String(getAssuntoIxcId(assuntoSelecionado) || ''),
                nome_assunto_ixc: prev.nome_assunto_ixc || String(getAssuntoIxcNome(assuntoSelecionado) || '')
            }));
        }
    }, [assuntoSelecionado]);

    useEffect(() => {
        let isMounted = true;

        const carregarItensChecklist = async () => {
            if (!assuntoSelecionado) {
                setChecklistItens([]);
                return;
            }

            const itensDoVinculo = getChecklistItens(assuntoSelecionado);
            if (itensDoVinculo.length) {
                setChecklistItens(itensDoVinculo);
                return;
            }

            const checklistId = getChecklistId(assuntoSelecionado);
            if (!checklistId) {
                setChecklistItens([]);
                return;
            }

            setLoadingItens(true);
            try {
                const token = localStorage.getItem('access_token');
                const checklist = await getChecklistById(token, checklistId);
                if (isMounted) {
                    setChecklistItens(Array.isArray(checklist?.itens) ? checklist.itens : []);
                }
            } catch (err) {
                if (isMounted) {
                    setChecklistItens([]);
                    Swal.fire('Atencao!', err.message || 'Erro ao carregar itens do checklist.', 'warning');
                }
            } finally {
                if (isMounted) {
                    setLoadingItens(false);
                }
            }
        };

        carregarItensChecklist();

        return () => {
            isMounted = false;
        };
    }, [assuntoSelecionado]);

    const itensChecklist = checklistItens;

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            ...(name === 'resposta_tipo' && value === 'sem_condicao' ? { id_item_condicao: '', resposta_condicao: '' } : {})
        }));
    };

    const validateForm = () => {
        if (!formData.id_checklist_assunto) return 'Selecione o assunto vinculado ao checklist.';
        if (!String(formData.id_assunto_ixc || '').trim()) return 'Nao foi possivel identificar o ID do assunto IXC.';
        if (!String(formData.nome_assunto_ixc || '').trim()) return 'Nao foi possivel identificar o nome do assunto IXC.';
        if (formData.resposta_tipo !== 'sem_condicao' && !formData.id_item_condicao) return 'Selecione o item de condicao.';
        if (['texto', 'numero'].includes(formData.resposta_tipo) && String(formData.resposta_condicao).trim() === '') {
            return 'Informe a resposta da condicao.';
        }
        if (formData.resposta_tipo === 'numero' && Number.isNaN(Number(formData.resposta_condicao))) {
            return 'A resposta numerica da condicao e invalida.';
        }

        try {
            JSON.parse(formData.payload || '{}');
        } catch (err) {
            return 'O payload precisa ser um JSON valido.';
        }

        return null;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            Swal.fire('Atencao!', validationError, 'warning');
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            const respostaCondicao = respostaCondicaoFromForm(formData);
            const payload = {
                assuntos: [
                    {
                        id_checklist_assunto: Number(formData.id_checklist_assunto),
                        id_assunto_ixc: Number(formData.id_assunto_ixc),
                        nome_assunto_ixc: String(formData.nome_assunto_ixc || '').trim()
                    }
                ],
                id_item_condicao: formData.resposta_tipo === 'sem_condicao' ? null : Number(formData.id_item_condicao),
                resposta_condicao: respostaCondicao,
                origem_mensagem: formData.origem_mensagem,
                ordem_execucao: Number(formData.ordem_execucao || 1),
                ativo: Boolean(formData.ativo),
                finalizar_atendimento: formData.finalizar_atendimento,
                payload: JSON.parse(formData.payload || '{}')
            };

            if (isEditMode) {
                await updateIxcFinalizacaoConfig(token, configId, payload);
            } else {
                await addIxcFinalizacaoConfig(token, payload);
            }

            Swal.fire(
                'Sucesso!',
                isEditMode ? 'Configuracao atualizada com sucesso.' : 'Configuracao criada com sucesso.',
                'success'
            ).then(() => navigate('/ixc-finalizacao-configs'));
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
        <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
            <Sidebar isVisible={isSidebarVisible} />
            <main className="main-content-assunto">
                <div className="subject-page finalizacao-form-page">
                    <header className="subject-header">
                        <button
                            className={`sidebar-toggle ${darkMode ? 'dark' : 'light'}`}
                            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                        >
                            {isSidebarVisible ? <DehazeIcon /> : '>'}
                        </button>
                        <div>
                            <h1>{isEditMode ? 'Editar finalizacao IXC' : 'Adicionar finalizacao IXC'}</h1>
                            <p>Defina a condicao e o payload enviado ao IXC no fechamento do atendimento</p>
                        </div>
                    </header>

                    <form onSubmit={handleSubmit} className="subject-form finalizacao-form">
                        <section className="subject-panel">
                            <div className="finalizacao-form-grid">
                                <label className="finalizacao-wide-field">
                                    Assunto vinculado ao checklist
                                    <select
                                        name="id_checklist_assunto"
                                        value={formData.id_checklist_assunto}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Selecione um assunto</option>
                                        {assuntos.map((assunto) => (
                                            <option key={assunto.id} value={assunto.id}>
                                                {getAssuntoLabel(assunto)}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label>
                                    Tipo de condicao
                                    <select name="resposta_tipo" value={formData.resposta_tipo} onChange={handleInputChange}>
                                        <option value="sem_condicao">Sem condicao</option>
                                        <option value="boolean_true">Resposta true</option>
                                        <option value="boolean_false">Resposta false</option>
                                        <option value="numero">Numero</option>
                                        <option value="texto">Texto</option>
                                    </select>
                                </label>

                                <label>
                                    Item condicional
                                    <select
                                        name="id_item_condicao"
                                        value={formData.id_item_condicao}
                                        onChange={handleInputChange}
                                        disabled={formData.resposta_tipo === 'sem_condicao' || loadingItens}
                                    >
                                        <option value="">
                                            {loadingItens ? 'Carregando itens...' : 'Selecione um item'}
                                        </option>
                                        {itensChecklist.map((item) => (
                                            <option key={getItemId(item)} value={getItemId(item)}>
                                                {getItemLabel(item)}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                {['texto', 'numero'].includes(formData.resposta_tipo) && (
                                    <label>
                                        Resposta da condicao
                                        <input
                                            type={formData.resposta_tipo === 'numero' ? 'number' : 'text'}
                                            name="resposta_condicao"
                                            value={formData.resposta_condicao}
                                            onChange={handleInputChange}
                                        />
                                    </label>
                                )}

                                <label>
                                    ID do Assunto IXC
                                    <input
                                        type="number"
                                        name="id_assunto_ixc"
                                        value={formData.id_assunto_ixc || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </label>

                                <label>
                                    Nome do Assunto IXC
                                    <input
                                        type="text"
                                        name="nome_assunto_ixc"
                                        value={formData.nome_assunto_ixc || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </label>

                                <label>
                                    Origem da mensagem
                                    <select name="origem_mensagem" value={formData.origem_mensagem} onChange={handleInputChange}>
                                        <option value="usuario">Usuario</option>
                                        <option value="checklist">Checklist</option>
                                        <option value="payload">Payload</option>
                                    </select>
                                </label>

                                <label>
                                    Ordem
                                    <input
                                        type="number"
                                        min="1"
                                        name="ordem_execucao"
                                        value={formData.ordem_execucao}
                                        onChange={handleInputChange}
                                    />
                                </label>

                                <label>
                                    Finalizar atendimento
                                    <select name="finalizar_atendimento" value={formData.finalizar_atendimento} onChange={handleInputChange}>
                                        <option value="N">N</option>
                                        <option value="S">S</option>
                                    </select>
                                </label>

                                <label className="checklist-editor-active">
                                    <input
                                        type="checkbox"
                                        name="ativo"
                                        checked={formData.ativo}
                                        onChange={handleInputChange}
                                    />
                                    Ativo
                                </label>

                                <label className="finalizacao-wide-field">
                                    Payload IXC
                                    <textarea
                                        name="payload"
                                        value={formData.payload}
                                        onChange={handleInputChange}
                                        rows={10}
                                        spellCheck={false}
                                    />
                                </label>
                            </div>
                        </section>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() => navigate('/ixc-finalizacao-configs')}
                            >
                                Cancelar
                            </button>
                            <button type="submit" className="submit-button-tutorial">
                                {isEditMode ? 'Atualizar' : 'Adicionar'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
