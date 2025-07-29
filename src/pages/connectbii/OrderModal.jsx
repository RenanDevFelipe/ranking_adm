// src/components/OrderModal.jsx
import React from 'react';

const OrderModal = ({ order, onClose }) => {
  if (!order) return null;

  const getStatusClass = (status) => {
    switch (status) {
      case 'Concluída':
        return 'status-completed';
      case 'Em Andamento':
        return 'status-in-progress';
      case 'Atrasada':
        return 'status-late';
      case 'Aberta':
        return 'status-open';
      default:
        return 'status-canceled';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Detalhes da Ordem de Serviço</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Informações Básicas</h4>
              <div className="space-y-2">
                <p><span className="font-medium">ID:</span> <span>{order.id}</span></p>
                <p><span className="font-medium">Setor:</span> <span>{order.sector}</span></p>
                <p><span className="font-medium">Prioridade:</span> <span className="status-badge status-late">Alta</span></p>
                <p><span className="font-medium">Data de Abertura:</span> <span>15/03/2023</span></p>
                <p><span className="font-medium">Prazo:</span> <span>22/03/2023</span></p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Atribuição</h4>
              <div className="space-y-2">
                <p><span className="font-medium">Técnico Responsável:</span> <span>{order.tech}</span></p>
                <p><span className="font-medium">Status:</span> <span className={`status-badge ${getStatusClass(order.status)}`}>{order.status}</span></p>
                <p><span className="font-medium">Última Atualização:</span> <span>18/03/2023 14:30</span></p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-2">Descrição do Problema</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>{order.description}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-2">Ações Realizadas</h4>
            <div className="space-y-4">
              <div className="border-l-2 border-blue-500 pl-4 py-1">
                <div className="flex justify-between">
                  <p className="font-medium">Verificação inicial</p>
                  <p className="text-sm text-gray-500">16/03/2023 09:15</p>
                </div>
                <p className="text-sm text-gray-600">Verificado o switch do setor e identificado problema no módulo de alimentação.</p>
              </div>
              <div className="border-l-2 border-blue-500 pl-4 py-1">
                <div className="flex justify-between">
                  <p className="font-medium">Substituição de peça</p>
                  <p className="text-sm text-gray-500">17/03/2023 14:30</p>
                </div>
                <p className="text-sm text-gray-600">Substituído o módulo de alimentação do switch. Testes iniciais mostraram melhoria, mas ainda há instabilidade.</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button className="px-4 py-2 border rounded-md hover:bg-gray-100">
              <i className="fas fa-print mr-2"></i> Imprimir
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <i className="fas fa-edit mr-2"></i> Editar Ordem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;