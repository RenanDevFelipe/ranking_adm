import React, { useState } from 'react';
import './styles.css';
import { ChecklistGetFiltered, addAvaliacao } from '../../services/api.ts';
import { FaSpinner } from 'react-icons/fa';
import Swal from 'sweetalert2';

const AvaliacaoCard = ({ avaliacao, retorno }) => {
    const [showChecklist, setShowChecklist] = useState(false);
    const [showDetalhes, setShowDetalhes] = useState(false);
    const [checklistItems, setChecklistItems] = useState([]);
    const [loadingChecklist, setLoadingChecklist] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formValues, setFormValues] = useState({});
    const [trocaSelecionada, setTrocaSelecionada] = useState("");
    const [observacaoTroca, setObservacaoTroca] = useState("");
    const token = localStorage.getItem('access_token');
    const usuario = localStorage.getItem('user_name');
    const id_ixc = localStorage.getItem('user_id');
    const setor = localStorage.getItem('user_setor');


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
    const acessoRemotoIp = async (ip) => {
        const portas = [80, 8080, 8888];
        let portaFuncionando = null;
        
        // Mostra loading enquanto testa as portas
        Swal.fire({
          title: 'Testando conexão...',
          html: 'Verificando portas disponíveis',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
      
        // Testa cada porta sequencialmente
        for (const porta of portas) {
          try {
            const teste = await testarPorta(ip, porta);
            if (teste) {
              portaFuncionando = porta;
              break;
            }
          } catch (e) {
            console.log(`Porta ${porta} falhou`, e);
          }
        }
      
        // Fecha o loading
        Swal.close();
      
        if (portaFuncionando) {
          // Se encontrou porta aberta, abre automaticamente
          abrirPorta(ip, portaFuncionando);
        } else {
          // Se nenhuma porta funcionou, mostra opções manuais
          mostrarOpcoesManuais(ip, portas);
        }
      };
      
      // Função para testar uma porta específica
      const testarPorta = (ip, porta) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = `http://${ip}:${porta}/favicon.ico?t=${Date.now()}`;
          
          // Timeout de 2 segundos por porta
          setTimeout(() => resolve(false), 2000);
        });
      };
      
      // Função para abrir a porta funcionando
      const abrirPorta = (ip, porta) => {
        const link = document.createElement('a');
        link.href = `http://${ip}:${porta}`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      
      // Função para mostrar opções quando nenhuma porta funciona
      const mostrarOpcoesManuais = (ip, portas) => {
        const botoes = portas.map(porta => (
          `<button class="swal2-porta-button" 
                  onclick="document.body.appendChild(Object.assign(document.createElement('a'), {
                    href: 'http://${ip}:${porta}',
                    target: '_blank'
                  })).click()">
            Tentar porta ${porta}
          </button>`
        )).join('');
      
        Swal.fire({
          title: 'Não foi possível conectar automaticamente',
          html: `Tente manualmente:<br><br>
                ${botoes}<br><br>
                Ou copie o IP:<br>
                <input type="text" id="ip-copy" value="${ip}" readonly>
                <button onclick="navigator.clipboard.writeText('${ip}')">
                  Copiar
                </button>`,
          icon: 'warning',
          showConfirmButton: false,
          showCloseButton: true
        });
      };
      
      // Adiciona estilo aos botões de porta (opcional)
      const style = document.createElement('style');
      style.textContent = `
        .swal2-porta-button {
          margin: 5px;
          padding: 8px 15px;
          background: #3085d6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .swal2-porta-button:hover {
          background: #286090;
        }
        #ip-copy {
          padding: 8px;
          margin-top: 10px;
          width: 100%;
        }
      `;
      document.head.appendChild(style);
      

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
        setIsSubmitting(true);
        try {
            // Filtra apenas os itens que são checkboxes
            const checkboxItems = checklistItems.filter(item => item.type === 'checkbox');
            const totalCheckboxes = checkboxItems.length;

            // Conta quantos checkboxes estão marcados
            const checkedCount = checkboxItems.reduce((count, item) => {
                return count + (formValues[item.id] ? 1 : 0);
            }, 0);

            // calculo de nota 
            const nota = totalCheckboxes > 0
                ? parseFloat(((checkedCount * 10) / totalCheckboxes).toFixed(2))
                : 0;

            // Calcula a soma total dos pontos
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

            const fullText = `${checklistText}\n\nOBS: ${document.querySelector('.checklist-observacao input').value || 'Nenhuma'}`;

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

            const currentDate = new Date().toISOString().split('T')[0];

            // Cria o FormData
            const formData = new FormData();

            // Adiciona todos os campos ao FormData
            formData.append('id_os', avaliacao.id);
            formData.append('id_ixc', id_ixc);
            formData.append('desc_os', avaliacao.mensagem);
            formData.append('pontuacao_os', totalScore.toString());
            formData.append('nota_os', nota.toString());
            formData.append('data_finalizacao_os', avaliacao.finalizacao);
            formData.append('data_finalizacao', currentDate);
            formData.append('id_tecnico', retorno.id_tecnico);
            formData.append('id_setor', setor);
            formData.append('avaliador', usuario);
            formData.append('check_list', fullText);
            formData.append('id_assunto', avaliacao.id_assunto);
            formData.append('observacao_troca', 'Sem troca');
            formData.append('id_atendimento', avaliacao.id_atendimento);

            // Adiciona os valores do checklist como JSON
            formData.append('checklist_values', JSON.stringify(formValues));

            if (trocaSelecionada === "152" && observacaoTroca) {
                formData.append('observacao_troca', observacaoTroca);
            }

            // Adiciona observações e troca se existirem
            const troca = document.querySelector('.checklist-observacao select').value;
            if (troca) formData.append('troca', troca);

            console.log('Dados para enviar:', Object.fromEntries(formData.entries()));

            // Chamada à API com FormData
            await addAvaliacao(token, formData);

            setShowChecklist(false);
            // Sucesso com SweetAlert
            await Swal.fire({
                title: 'Sucesso!',
                text: `Avaliação salva com sucesso!`,
                icon: 'success',
                confirmButtonText: 'OK'
            });

            // Recarrega a página após o sucesso
            window.location.reload();

        } catch (error) {
            console.error("Erro ao salvar avaliação:", error);
            // Erro com SweetAlert
            await Swal.fire({
                title: 'Erro!',
                text: 'Erro ao salvar avaliação: ' + error.message,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    console.log(retorno);
    console.log(avaliacao);
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
                            <p className={`ccq ${avaliacao.potencia.radio?.ccq != null ? (
                                avaliacao.potencia.radio.ccq >= 90 ? 'good' :
                                    avaliacao.potencia.radio.ccq >= 80 ? 'warning' : 'bad'
                            ) : ''}
                            `}>
                                CCQ: {avaliacao.potencia.radio?.ccq}
                            </p>
                            <p className={`sinal ${avaliacao.potencia.radio?.sinal != null ? (
                                avaliacao.potencia.radio.sinal >= -60 ? 'good' :
                                    avaliacao.potencia.radio.sinal >= -70 ? 'warning' : 'bad'
                            ) : ''}
                            `}>
                                SINAL: {avaliacao.potencia.radio?.sinal}
                            </p>
                        </div>
                    )}


                    <div className='buttons'>
                        <button
                            className="avaliacao-button"
                            onClick={() => abrirPopup(avaliacao.id_arquivo)}
                        >
                            Ver fotos
                        </button>

                        <button
                            className="avaliacao-button"
                            onClick={(e) => acessoRemotoIp(avaliacao.ip_login)}
                        >
                            Acessar
                        </button>
                        {(avaliacao.potencia.radio.ip !== null) && (
                            <button
                                className="avaliacao-button"
                                onClick={() => acessoRemotoIp(avaliacao.potencia.radio.ip)}
                            >
                                Acessar antena
                            </button>
                        )}
                    </div>
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
                                <input type="text" placeholder='Observações gerais' />
                                <select
                                    value={trocaSelecionada}
                                    onChange={(e) => setTrocaSelecionada(e.target.value)}
                                >
                                    <option value="">Selecione uma opção</option>
                                    <option value="91">Sem troca</option>
                                    <option value="152">Com troca</option>
                                </select>

                                {/* Mostra o campo de observação de troca apenas quando "Com troca" está selecionado */}
                                {trocaSelecionada === "152" && (
                                    <div className="observacao-troca" style={{ marginTop: '10px' }}>
                                        <input
                                            type="text"
                                            placeholder='Observações sobre a troca'
                                            value={observacaoTroca}
                                            onChange={(e) => setObservacaoTroca(e.target.value)}
                                        />
                                    </div>
                                )}
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
                                    disabled={isSubmitting || loadingChecklist}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <FaSpinner className="spinner-icon" /> Salvando...
                                        </>
                                    ) : (
                                        'Salvar Avaliação'
                                    )}
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