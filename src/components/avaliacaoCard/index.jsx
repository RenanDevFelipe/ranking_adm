import React, { useState } from 'react';
import './styles.css';
import { ChecklistGetFiltered } from '../../services/api.ts';

const AvaliacaoCard = ({ avaliacao }) => {
    const [showChecklist, setShowChecklist] = useState(false);
    const [showDetalhes, setShowDetalhes] = useState(false);
    const [checklistItems, setChecklistItems] = useState([]);
    const [loadingChecklist, setLoadingChecklist] = useState(false);
    const [formValues, setFormValues] = useState({});
    const token = localStorage.getItem('access_token');



    const fetchChecklist = async () => {
        if (!avaliacao.id_assunto) return;

        setLoadingChecklist(true);
        try {
            const response = await ChecklistGetFiltered(token, avaliacao.id_assunto);
            setChecklistItems(response.checklist || []);

            // Inicializa os valores do formulário
            const initialValues = {};
            response.checklist.forEach(item => {
                initialValues[item.id] = '';
            });
            setFormValues(initialValues);
        } catch (error) {
            console.error("Erro ao carregar checklist:", error);
        } finally {
            setLoadingChecklist(false);
        }
    };


    const abrirPopup = (id) => {
        const url = `https://central.ticonnecte.com.br/aplicativo/su_oss_chamado_arquivos/rel_28009.php?id=${id}`;
        window.open(url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')
    }

    const handleAvaliarClick = () => {
        if (!showChecklist) {
            fetchChecklist();
        }
        setShowChecklist(!showChecklist);
    };

    const handleDetalhesClick = () => {
        setShowDetalhes(!showDetalhes);
    };

    const handleInputChange = (id, value) => {
        setFormValues(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Aqui você pode chamar a API para salvar a avaliação
            console.log('Dados do checklist para enviar:', {
                avaliacao_id: avaliacao.id,
                checklist: formValues
            });

            // Exemplo de chamada à API:
            // await salvarAvaliacao(token, {
            //     avaliacao_id: avaliacao.id,
            //     checklist: formValues
            // });

            // Fecha o checklist após salvar
            setShowChecklist(false);

            // Mostra mensagem de sucesso
            alert('Avaliação salva com sucesso!');

        } catch (error) {
            console.error("Erro ao salvar avaliação:", error);
            alert('Erro ao salvar avaliação');
        }
    };

    return (
        <div className={`avaliacao-card ${avaliacao.status === 'Finalizada' ? 'finalizada' : ''}`}>
            <div className="avaliacao-header">
                <span className="avaliacao-id">OS #{avaliacao.id_atendimento}</span>
                <span title={avaliacao.avaliador} className="avaliacao-status">{avaliacao.status}</span>
            </div>

            <div className="avaliacao-content">
                <div className="avaliacao-info">
                    <h3>{avaliacao.id_cliente} - {avaliacao.cliente}</h3>
                </div>

                <div className="avaliacao-actions">


                    <button
                        className="avaliacao-button"
                        onClick={handleDetalhesClick}
                    >
                        Detalhes
                    </button>

                    <button
                        className="avaliacao-button"
                        onClick={handleAvaliarClick}
                    >
                        {avaliacao.checklist === 'Não preenchido' ? 'Avaliar' : 'Editar Avaliação'}
                    </button>

                </div>
            </div>
            {showDetalhes && (
                <div className="checklist-container">
                    <p className="avaliacao-data">
                        ID: {avaliacao.id}
                    </p>
                    <p className="avaliacao-data">
                        Finalização: {avaliacao.finalizacaoFormatada || avaliacao.finalizacao}
                    </p>
                    <p className="avaliacao-assunto">Assunto: {avaliacao.id_assunto}</p>
                    <p>Descrição da OS:</p>
                    {avaliacao.mensagem && (
                        <div className="avaliacao-mensagem">
                            <p>{avaliacao.mensagem}</p>
                        </div>
                    )}

                    {/* Mostrar apenas se pelo menos um dos valores de fibra existir */}
                    {(avaliacao.potencia.fibra?.rx != null || avaliacao.potencia.fibra?.tx != null) && (
                        <div className='potencia'>
                            {/* Mostrar RX apenas se existir */}
                            {avaliacao.potencia.fibra?.rx != null && (
                                <p className={`rx ${avaliacao.potencia.fibra.rx >= -25 ? 'good' :
                                        avaliacao.potencia.fibra.rx >= -27 ? 'warning' : 'bad'
                                    }`}>
                                    RX: {avaliacao.potencia.fibra.rx} dBm
                                </p>
                            )}

                            {/* Mostrar TX apenas se existir */}
                            {avaliacao.potencia.fibra?.tx != null && (
                                <p className={`tx ${avaliacao.potencia.fibra.tx >= -25 ? 'good' :
                                        avaliacao.potencia.fibra.tx >= -27 ? 'warning' : 'bad'
                                    }`}>
                                    TX: {avaliacao.potencia.fibra.tx} dBm
                                </p>
                            )}
                        </div>
                    )}

                    {/* Mostrar CCQ apenas se existir */}
                    {avaliacao.potencia.radio?.ccq != null && (
                        <div className='potencia'>
                            <p>CCQ: {avaliacao.potencia.radio.ccq}</p>
                        </div>
                    )}

                    <button
                        className="avaliacao-button"
                        onClick={() => abrirPopup(avaliacao.id_arquivo)}
                    >
                        Ver fotos
                    </button>
                </div>
            )}

            {/* Seção do Checklist - aparece quando showChecklist é true */}
            {showChecklist && (
                <div className="checklist-container">
                    {loadingChecklist ? (
                        <div className="checklist-loading">
                            <p>Carregando checklist...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="checklist-form">
                            <h4>Checklist da OS</h4>
                            {checklistItems.map(item => (
                                <div key={item.id} className="checklist-item">
                                    {item.type === 'checkbox' ? (
                                        <input
                                            type="checkbox"
                                            checked={formValues[item.id] || false}
                                            onChange={(e) => handleInputChange(item.id, e.target.checked)}
                                        />
                                    ) : (
                                        <input
                                            type={item.type}
                                            value={formValues[item.id] || ''}
                                            onChange={(e) => handleInputChange(item.id, e.target.value)}
                                            max={item.max_score}
                                        />
                                    )}
                                    <label>
                                        {item.label}
                                    </label>

                                </div>
                            ))}
                            <div className="checklist-actions">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => setShowChecklist(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="submit-button"
                                >
                                    Salvar Avaliação
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};

export default AvaliacaoCard;