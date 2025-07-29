// src/components/OrdersTable.jsx
import React from 'react';

const OrdersTable = ({ orders, totalOrders, onOrderClick }) => {
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
    <div className="card">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Ordens de Serviço Recentes</h3>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <i className="fas fa-plus mr-1"></i> Nova Ordem
          </button>
          <button className="px-3 py-1 border rounded-md hover:bg-gray-100">
            <i className="fas fa-filter mr-1"></i> Filtrar
          </button>
        </div>
      </div>
      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Setor</th>
              <th>Descrição</th>
              <th>Técnico</th>
              <th>Status</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="font-medium text-gray-900">{order.id}</td>
                <td className="text-gray-500">{order.sector}</td>
                <td className="text-gray-500">{order.description}</td>
                <td className="text-gray-500">{order.tech}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="text-gray-500">{order.date}</td>
                <td className="font-medium">
                  <button 
                    className="text-blue-600 hover:text-blue-900"
                    onClick={() => onOrderClick(order.id)}
                  >
                    Ver
                  </button>
                  <button className="ml-2 text-gray-600 hover:text-gray-900">
                    <i className="fas fa-ellipsis-v"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <div className="pagination-info">
          Mostrando <span>1</span> a <span>{orders.length}</span> de <span>{totalOrders}</span> ordens
        </div>
        <div className="pagination-controls">
          <button className="pagination-button">
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className="pagination-button active">1</button>
          <button className="pagination-button">2</button>
          <button className="pagination-button">3</button>
          <button className="pagination-button">
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersTable;