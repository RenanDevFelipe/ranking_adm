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

    console.log(avaliacao.potencia.radio.sinal)

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
            // Filtra apenas os itens que são checkboxes
            const checkboxItems = checklistItems.filter(item => item.type === 'checkbox');
            const totalCheckboxes = checkboxItems.length;
            
            // Conta quantos checkboxes estão marcados
            const checkedCount = checkboxItems.reduce((count, item) => {
                return count + (formValues[item.id] ? 1 : 0);
            }, 0);
            
            // Calcula a nota (média de checkboxes marcados) em porcentagem
            const nota = totalCheckboxes > 0 
                ? (checkedCount * 10) / totalCheckboxes 
                : 0;
    
            // Calcula a soma total dos pontos (considerando checkboxes como 10 pontos)
            const totalScore = checklistItems.reduce((sum, item) => {
                const value = formValues[item.id];
                if (item.type === 'checkbox') {
                    return sum + (value ? 10 : 0);
                }
                const numericValue = parseFloat(value) || 0;
                return sum + numericValue;
            }, 0);
    
            // Formata o texto para clipboard
            const checklistText = checklistItems.map(item => {
                const value = formValues[item.id];
                if (item.type === 'checkbox') {
                    return `${item.label}?\nSim (${value ? 'X' : ' '}) Não (${value ? ' ' : 'X'})`;
                }
                return `${item.label}: ${value !== undefined ? value : 'Não preenchido'}`;
            }).join('\n\n');
    
            const fullText = `${checklistText}\n\nNota: ${nota}%\nOBS: ${document.querySelector('.checklist-observacao input').value || 'Nenhuma'}`;
    
            // Copia para área de transferência
            await navigator.clipboard.writeText(fullText).catch(err => {
                // Fallback para navegadores mais antigos
                const textarea = document.createElement('textarea');
                textarea.value = fullText;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            });
    
            // Dados para enviar para a API
            const payload = {
                avaliacao_id: avaliacao.id,
                checklist: formValues,
                total_score: totalScore,
                nota: nota,  // Adiciona a nota como porcentagem
                checked_count: checkedCount,  // Número de checkboxes marcados
                total_checkboxes: totalCheckboxes,  // Total de checkboxes
                observacoes: document.querySelector('.checklist-observacao input').value,
                troca: document.querySelector('.checklist-observacao select').value
            };
    
            console.log('Dados para enviar:', payload);
    
            // Exemplo de chamada à API:
            // await salvarAvaliacao(token, payload);
    
            setShowChecklist(false);
            alert(`Avaliação salva com sucesso!\nNota: ${nota}%`);
    
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
                                <p className={`rx ${(() => {
                                    const rxValue = parseFloat(avaliacao.potencia.fibra.rx);
                                    if (isNaN(rxValue)) return 'neutral'; // Se não for número, retorna neutro
                                    if (rxValue === 0) return 'neutral';   // 0 é neutro
                                    if (rxValue >= -25) return 'good';     // >= -25 é bom
                                    if (rxValue >= -27) return 'warning';  // entre -25 e -27 é aviso
                                    return 'bad';                          // abaixo de -27 é ruim
                                })()
                                    }`}>
                                    RX: {avaliacao.potencia.fibra.rx} dBm
                                </p>
                            )}

                            {/* Mostrar TX apenas se existir */}
                            {avaliacao.potencia.fibra?.tx != null && (
                                <p className={`tx ${(() => {
                                    const rxValue = parseFloat(avaliacao.potencia.fibra.tx);
                                    if (isNaN(rxValue)) return 'neutral'; // Se não for número, retorna neutro
                                    if (rxValue === 0) return 'neutral';   // 0 é neutro
                                    if (rxValue >= -25) return 'good';     // >= -25 é bom
                                    if (rxValue >= -27) return 'warning';  // entre -25 e -27 é aviso
                                    return 'bad';                          // abaixo de -27 é ruim
                                })()
                                    }`}>
                                    TX: {avaliacao.potencia.fibra.tx} dBm
                                </p>
                            )}
                        </div>
                    )}

                    {/* Mostrar CCQ apenas se existir */}
                    {(avaliacao.potencia.radio?.ccq != null || avaliacao.potencia.radio?.sinal != null) && (
                        <div className='potencia'>
                            <p className={`ccq ${
                                avaliacao.potencia.radio?.ccq != null ? (
                                    avaliacao.potencia.radio.ccq >= 90 ? 'good' :
                                        avaliacao.potencia.radio.ccq >= 80 ? 'warning' : 'bad'
                                ) : ''}
                            `}>
                                CCQ: {avaliacao.potencia.radio?.ccq}
                            </p>
                            <p className={`sinal ${
                                avaliacao.potencia.radio?.sinal != null ? (
                                    avaliacao.potencia.radio.sinal >= -60 ? 'good' :
                                        avaliacao.potencia.radio.sinal >= -70 ? 'warning' : 'bad'
                                ) : ''}
                            `}>
                                SINAL: {avaliacao.potencia.radio?.sinal}
                            </p>
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

                            <div className='checklist-observacao'>
                                <input type="text" placeholder='Observações' />
                                <select name="" id="">
                                    <option value="">Selecione uma opção</option>
                                    <option value="">Sem troca</option>
                                    <option value="">Com troca</option>
                                </select>
                            </div>

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