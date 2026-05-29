import { useEffect, useState } from 'react';
import './styles.css';
import {
    addAvaliacaoN3,
    ChecklistGetFiltered,
    getAvaliacaoN3ById,
    getIxcFinalizacaoConfigs,
    updateAvaliacaoN3
} from '../../services/api.ts';
import { FaSpinner } from 'react-icons/fa';
import Swal from 'sweetalert2';

const hojeIso = () => new Date().toISOString().split('T')[0];

const normalizarData = (valor) => {
    if (!valor) return '';

    const valorComoTexto = String(valor).trim();
    if (!valorComoTexto) return '';

    const data = new Date(valorComoTexto.includes('T') ? valorComoTexto : `${valorComoTexto}T00:00:00`);

    if (Number.isNaN(data.getTime())) return valorComoTexto;

    return data.toISOString().split('T')[0];
};

const formatarData = (dataString) => {
    if (!dataString) return '-';
    const data = new Date(String(dataString).replace(' ', 'T'));
    if (Number.isNaN(data.getTime())) return dataString;

    return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getFotoId = (os) => {
    return os.arquivo_id || os.arquivo?.id || os.id_arquivo || os.raw?.arquivo_id || os.raw?.id_arquivo;
};

const abrirFotos = (os) => {
    const fotoId = getFotoId(os);

    if (!fotoId) {
        Swal.fire(
            'Fotos indisponiveis',
            'Esta OS nao retornou o identificador de arquivo usado pelo IXC para abrir as fotos.',
            'warning'
        );
        return;
    }

    const url = `https://central.ticonnecte.com.br/aplicativo/su_oss_chamado_arquivos/rel_28009.php?id=${fotoId}`;
    window.open(url, '_blank', 'width=900,height=650,scrollbars=yes,resizable=yes');
};

const getRespostaInicial = (item) => {
    if (item.tipo_resposta === 'nota') return '';
    if (item.tipo_resposta === 'texto') return '';
    return false;
};

const getItemId = (item) => item.id_item || item.id;
const getItemTitulo = (item) => item.pergunta || item.titulo || item.label;
const getRespostasAvaliacao = (avaliacao) => {
    if (Array.isArray(avaliacao?.respostas)) return avaliacao.respostas;
    if (Array.isArray(avaliacao?.check_list)) return avaliacao.check_list;
    if (Array.isArray(avaliacao?.checklist?.respostas)) return avaliacao.checklist.respostas;
    return [];
};

const getRespostaItemId = (resposta) => resposta.id_item || resposta.id;
const getChecklistAssuntoId = (vinculo) => vinculo?.id_checklist_assunto || vinculo?.id;
const getRespostaValor = (resposta, item) => {
    if (Object.prototype.hasOwnProperty.call(resposta, 'resposta')) {
        return resposta.resposta;
    }

    if (Object.prototype.hasOwnProperty.call(resposta, 'status')) {
        return resposta.status;
    }

    return getRespostaInicial(item);
};

const getMensagensFinalizacao = (avaliacao) => {
    if (Array.isArray(avaliacao?.mensagens_finalizacao)) return avaliacao.mensagens_finalizacao;
    if (Array.isArray(avaliacao?.finalizacoes)) return avaliacao.finalizacoes;
    return [];
};

const getConfiguracoesComMensagemUsuario = (configs, idChecklistAssunto) => {
    const ids = new Set();

    return configs
        .filter(config => String(config.id_checklist_assunto) === String(idChecklistAssunto))
        .filter(config => config.ativo !== false && config.origem_mensagem === 'usuario')
        .filter((config) => {
            const id = String(config.id_checklist_assunto);
            if (ids.has(id)) return false;
            ids.add(id);
            return true;
        })
        .sort((a, b) => Number(a.ordem_execucao || 0) - Number(b.ordem_execucao || 0));
};

export default function AvaliacaoN3Card({
    os,
    idTecnicoColaborador,
    idSetor = 5,
    avaliacaoVerificada,
    onSuccess
}) {
    const token = localStorage.getItem('access_token');
    const [showDetalhes, setShowDetalhes] = useState(false);
    const [showChecklist, setShowChecklist] = useState(false);
    const [loadingChecklist, setLoadingChecklist] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checklistItems, setChecklistItems] = useState([]);
    const [idChecklist, setIdChecklist] = useState(null);
    const [idChecklistAssunto, setIdChecklistAssunto] = useState(null);
    const [finalizacaoConfigs, setFinalizacaoConfigs] = useState([]);
    const [avaliacaoAtual, setAvaliacaoAtual] = useState(avaliacaoVerificada?.avaliacao || null);
    const [respostas, setRespostas] = useState({});
    const [mensagensFinalizacao, setMensagensFinalizacao] = useState({});

    useEffect(() => {
        setAvaliacaoAtual(avaliacaoVerificada?.avaliacao || null);
    }, [avaliacaoVerificada]);

    const isAvaliada = Boolean(avaliacaoAtual || avaliacaoVerificada?.avaliada);
    const assuntoId = os.assunto?.id || os.raw?.id_assunto;
    const dataFinalizacao = os.datas?.finalizacao || os.raw?.data_final || os.raw?.data_fechamento || os.raw?.data_finalizacao_os;
    const dataFinalizacaoOs = normalizarData(dataFinalizacao);
    const descOs = os.raw?.mensagem_resposta || os.mensagem || os.raw?.desc_os || '';

    const carregarChecklist = async () => {
        setLoadingChecklist(true);

        try {
            const checklistResponse = await ChecklistGetFiltered(token, assuntoId);
            const itens = checklistResponse.checklist || [];
            const checklistAssuntoId = getChecklistAssuntoId(checklistResponse.vinculo);
            let avaliacaoCompleta = avaliacaoAtual;

            if (isAvaliada && avaliacaoAtual?.id_avaliacao) {
                avaliacaoCompleta = await getAvaliacaoN3ById(token, avaliacaoAtual.id_avaliacao);
                setAvaliacaoAtual(avaliacaoCompleta);
            }

            const respostasSalvas = getRespostasAvaliacao(avaliacaoCompleta);
            const mensagensSalvas = getMensagensFinalizacao(avaliacaoCompleta);
            const configs = checklistAssuntoId
                ? await getIxcFinalizacaoConfigs(token, { id_checklist_assunto: checklistAssuntoId })
                : [];

            const valores = {};
            itens.forEach((item) => {
                const itemId = getItemId(item);
                const respostaSalva = respostasSalvas.find(resposta => String(getRespostaItemId(resposta)) === String(itemId));
                valores[itemId] = respostaSalva ? getRespostaValor(respostaSalva, item) : getRespostaInicial(item);
            });

            const mensagens = {};
            mensagensSalvas.forEach((mensagem) => {
                const chave = mensagem.id_checklist_assunto || mensagem.checklist_assunto?.id;
                if (chave) {
                    mensagens[chave] = mensagem.mensagem || '';
                }
            });

            setChecklistItems(itens);
            setIdChecklist(checklistResponse.id_checklist || null);
            setIdChecklistAssunto(checklistAssuntoId || null);
            setFinalizacaoConfigs(Array.isArray(configs) ? configs : []);
            setRespostas(valores);
            setMensagensFinalizacao(mensagens);
        } catch (error) {
            Swal.fire('Erro!', error.message || 'Erro ao carregar checklist da OS.', 'error');
        } finally {
            setLoadingChecklist(false);
        }
    };

    const toggleChecklist = async () => {
        if (!showChecklist && checklistItems.length === 0) {
            await carregarChecklist();
        }
        setShowChecklist(prev => !prev);
    };

    const handleRespostaChange = (item, value) => {
        setRespostas(prev => ({
            ...prev,
            [getItemId(item)]: value
        }));
    };

    const handleMensagemFinalizacaoChange = (id, value) => {
        setMensagensFinalizacao(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const montarRespostas = () => checklistItems.map((item) => {
        const itemId = getItemId(item);
        const resposta = respostas[itemId];
        const peso = Number(item.peso || item.max_score || 0);
        const pontuacao = item.tipo_resposta === 'nota'
            ? Math.min(Number(resposta || 0), 10) / 10 * peso
            : item.tipo_resposta === 'sim_nao' && resposta ? peso : 0;

        return {
            id_item: itemId,
            resposta,
            pontuacao
        };
    });

    const montarMensagensFinalizacao = () => getConfiguracoesComMensagemUsuario(finalizacaoConfigs, idChecklistAssunto)
        .map(config => ({
            id_checklist_assunto: Number(config.id_checklist_assunto),
            mensagem: String(mensagensFinalizacao[config.id_checklist_assunto] || '').trim()
        }))
        .filter(item => item.mensagem);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const respostasPayload = montarRespostas();
            const mensagensPayload = montarMensagensFinalizacao();
            const payloadBase = {
                id_os: Number(os.id_os),
                desc_os: descOs,
                id_assunto_ixc: Number(assuntoId),
                id_checklist: Number(idChecklist || 0),
                data_finalizacao_os: dataFinalizacaoOs,
                data_finalizacao: hojeIso(),
                id_tecnico: Number(idTecnicoColaborador || os.tecnico?.id || os.raw?.id_tecnico || 0),
                id_setor: Number(idSetor || 0),
                respostas: respostasPayload,
                mensagens_finalizacao: mensagensPayload
            };

            if (isAvaliada && avaliacaoAtual?.id_avaliacao) {
                await updateAvaliacaoN3(token, avaliacaoAtual.id_avaliacao, payloadBase);
            } else {
                await addAvaliacaoN3(token, payloadBase);
            }

            await Swal.fire('Sucesso!', 'Avaliacao N3 salva com sucesso.', 'success');
            setShowChecklist(false);
            onSuccess?.(os.id_os);
        } catch (error) {
            Swal.fire('Erro!', error.message || 'Erro ao salvar avaliacao N3.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <article className={`avaliacao-card n3-card ${isAvaliada ? 'finalizada' : ''}`}>
            <div className="avaliacao-header">
                <span className="avaliacao-id">OS #{os.id_os}</span>
                <span className="avaliacao-status">{isAvaliada ? 'Avaliada' : os.status?.nome || 'Pendente'}</span>
            </div>

            <div className="avaliacao-content">
                <div className="avaliacao-info">
                    <h3>{os.cliente?.id} - {os.cliente?.nome}</h3>
                </div>

                <div className="avaliacao-actions">
                    <button type="button" className="avaliacao-button" onClick={() => setShowDetalhes(prev => !prev)}>
                        Detalhes
                    </button>
                    <button type="button" className="avaliacao-button" onClick={() => abrirFotos(os)}>
                        Ver fotos
                    </button>
                    <button type="button" className="avaliacao-button" onClick={toggleChecklist}>
                        {isAvaliada ? 'Editar avaliacao' : 'Avaliar'}
                    </button>
                </div>
            </div>

            {showDetalhes && (
                <div className="checklist-container">
                    <p className="avaliacao-assunto">
                        Assunto: {assuntoId} - {os.assunto?.nome || 'Assunto nao informado'}
                    </p>
                    <p className="avaliacao-data">Finalizacao: {formatarData(dataFinalizacao)}</p>
                    <p>Descricao da OS:</p>
                    <div className="avaliacao-mensagem">
                        <p>{os.mensagem || 'Sem descricao informada.'}</p>
                    </div>
                    {os.raw?.mensagem_resposta && (
                        <>
                            <p>Resposta do tecnico:</p>
                            <div className="avaliacao-mensagem">
                                <p>{os.raw.mensagem_resposta}</p>
                            </div>
                        </>
                    )}
                </div>
            )}

            {showChecklist && (
                <div className="checklist-container">
                    {loadingChecklist ? (
                        <div className="checklist-loading">
                            <FaSpinner className="spinner-icon" />
                            <p>Carregando checklist...</p>
                        </div>
                    ) : checklistItems.length > 0 ? (
                        <form onSubmit={handleSubmit} className="checklist-form">
                            <h4>Checklist da OS</h4>
                            {checklistItems.map((item) => {
                                const itemId = getItemId(item);
                                const titulo = getItemTitulo(item);

                                return (
                                    <div key={itemId} className="checklist-item">
                                        {item.tipo_resposta === 'nota' ? (
                                            <>
                                                <label htmlFor={`nota-${itemId}`}>{titulo}</label>
                                                <input
                                                    id={`nota-${itemId}`}
                                                    type="number"
                                                    min="0"
                                                    max="10"
                                                    step="0.1"
                                                    value={respostas[itemId] || ''}
                                                    onChange={(e) => handleRespostaChange(item, e.target.value)}
                                                />
                                            </>
                                        ) : item.tipo_resposta === 'texto' ? (
                                            <>
                                                <label htmlFor={`texto-${itemId}`}>{titulo}</label>
                                                <input
                                                    id={`texto-${itemId}`}
                                                    type="text"
                                                    value={respostas[itemId] || ''}
                                                    onChange={(e) => handleRespostaChange(item, e.target.value)}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <input
                                                    id={`checkbox-${itemId}`}
                                                    type="checkbox"
                                                    checked={Boolean(respostas[itemId])}
                                                    onChange={(e) => handleRespostaChange(item, e.target.checked)}
                                                />
                                                <label htmlFor={`checkbox-${itemId}`}>{titulo}</label>
                                            </>
                                        )}
                                    </div>
                                );
                            })}

                            {getConfiguracoesComMensagemUsuario(finalizacaoConfigs, idChecklistAssunto).map((config) => (
                                <div key={config.id || config.id_checklist_assunto} className="n3-finalizacao-message">
                                    <label htmlFor={`mensagem-finalizacao-${config.id_checklist_assunto}`}>
                                        Mensagem de finalizacao IXC
                                        <span>
                                            Configuracao #{config.id || '-'} - ordem {config.ordem_execucao || 1}
                                        </span>
                                    </label>
                                    <textarea
                                        id={`mensagem-finalizacao-${config.id_checklist_assunto}`}
                                        value={mensagensFinalizacao[config.id_checklist_assunto] || ''}
                                        onChange={(e) => handleMensagemFinalizacaoChange(config.id_checklist_assunto, e.target.value)}
                                        placeholder="Digite a mensagem que sera enviada ao IXC no fechamento desta OS."
                                        rows={4}
                                    />
                                </div>
                            ))}

                            <div className="checklist-actions">
                                <button type="button" className="cancel-button" onClick={() => setShowChecklist(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="submit-button-tutorial" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <FaSpinner className="spinner-icon" /> Salvando...
                                        </>
                                    ) : 'Enviar avaliacao'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <p className="no-results">Nenhum checklist vinculado a este assunto.</p>
                    )}
                </div>
            )}
        </article>
    );
}
