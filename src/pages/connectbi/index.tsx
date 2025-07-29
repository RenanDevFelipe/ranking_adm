import React, { useState } from 'react'
import './style.css'
import { Pie, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js'
import Sidebar from '../../components/sidebar'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

const ConnectBI: React.FC = () => {
  const [viewType, setViewType] = useState<'day' | 'month'>('day')
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie')
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };
  const handleViewOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    setSelectedOrder(order)
    
  }

  

  const handleCloseModal = () => setSelectedOrder(null)

  const cards = [
    { title: 'Total de Ordens', count: 1248, icon: 'clipboard-list', change: '↑12%', color: 'blue' },
    { title: 'Em Andamento', count: 324, icon: 'spinner', change: '↓5%', color: 'orange' },
    { title: 'Concluídas', count: 876, icon: 'check-circle', change: '↑18%', color: 'green' },
    { title: 'Atrasadas', count: 48, icon: 'exclamation-triangle', change: '↑3%', color: 'red' }
  ]

  const chartDataSet = {
    labels: ['TI', 'Manutenção', 'Produção', 'Logística'],
    datasets: [
      {
        label: 'Ordens por Setor',
        data: [12, 19, 3, 5],
        backgroundColor: ['#3B82F6', '#F59E0B', '#10B981', '#EF4444']
      }
    ]
  }

  const statusChartData = {
    labels: ['Aberta', 'Em Andamento', 'Concluída'],
    datasets: [
      {
        label: 'Status',
        data: [100, 200, 300],
        backgroundColor: ['#F87171', '#FBBF24', '#34D399']
      }
    ]
  }

  return (
    <div className="container">
      <Sidebar isVisible={isSidebarVisible} />
      <div className="header">
        <h1>Painel de Ordens de Serviço</h1>
        <div className="tabs">
          <button
            className={viewType === 'day' ? 'tab active' : 'tab'}
            onClick={() => setViewType('day')}
          >
            Visualizar por Dia
          </button>
          <button
            className={viewType === 'month' ? 'tab active' : 'tab'}
            onClick={() => setViewType('month')}
          >
            Visualizar por Mês
          </button>
        </div>
      </div>

      <div className="card-grid">
        {cards.map((card, idx) => (
          <div className="card" key={idx}>
            <div className="card-top">
              <div>
                <p className="card-title">{card.title}</p>
                <h3 className="card-count">{card.count}</h3>
              </div>
              <div className={`icon-circle ${card.color}`}>
                <i className={`fas fa-${card.icon}`}></i>
              </div>
            </div>
            <div className={`card-change ${card.change.includes('↓') ? 'down' : 'up'}`}>
              <i className={`fas fa-arrow-${card.change.includes('↓') ? 'down' : 'up'}`}></i>
              <span>{card.change} desde o último mês</span>
            </div>
          </div>
        ))}
      </div>

      <div className="charts">
        <div className="chart-box">
          <div className="chart-header">
            <h2>Ordens por Setor</h2>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as 'pie' | 'bar')}
            >
              <option value="pie">Pizza</option>
              <option value="bar">Barra</option>
            </select>
          </div>
          {chartType === 'pie' ? <Pie data={chartDataSet} /> : <Bar data={chartDataSet} />}
        </div>

        <div className="chart-box">
          <h2>Status das Ordens</h2>
          <Bar data={statusChartData} />
        </div>
      </div>

      <div className="table-box">
        <h2>Lista de Ordens</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Setor</th>
              <th>Data</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.sector}</td>
                <td>{order.date}</td>
                <td>{order.status}</td>
                <td>
                  <button onClick={() => handleViewOrder(order.id)}>Ver</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={handleCloseModal}>
              <i className="fas fa-times"></i>
            </button>
            <h2>Detalhes da Ordem</h2>
            <p><strong>ID:</strong> {selectedOrder.id}</p>
            <p><strong>Setor:</strong> {selectedOrder.sector}</p>
            <p><strong>Status:</strong> {selectedOrder.status}</p>
            <p><strong>Data:</strong> {selectedOrder.date}</p>
          </div>
        </div>
      )}
    </div>
  )
}

const orders = [
  { id: '001', sector: 'TI', status: 'Aberta', date: '2025-07-01' },
  { id: '002', sector: 'Manutenção', status: 'Em Andamento', date: '2025-07-02' },
  { id: '003', sector: 'Produção', status: 'Concluída', date: '2025-07-03' },
  { id: '004', sector: 'Logística', status: 'Atrasada', date: '2025-07-04' }
]

export default ConnectBI
