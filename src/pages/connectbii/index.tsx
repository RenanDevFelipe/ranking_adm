import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import './style.css';
import Sidebar from '../../components/sidebar';
import DehazeIcon from '@mui/icons-material/Dehaze';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

interface Order {
  id: string;
  sector: string;
  description: string;
  tech: string;
  status: string;
  date: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderWidth?: number;
  }[];
}

const Connectbi = () => {
  const [viewType, setViewType] = useState('day');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filteredSector, setFilteredSector] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [darkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : true;
  });
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  // Aplica o tema ao body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Sample data
  const sectorData: ChartData = {
    labels: ['Redes', 'Telefonia', 'Infraestrutura', 'Atendimento', 'Outros'],
    datasets: [{
      data: [35, 25, 20, 15, 5],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#9CA3AF'],
      borderWidth: 1
    }]
  };

  const statusData: ChartData = {
    labels: ['Abertas', 'Em Andamento', 'Concluídas', 'Atrasadas', 'Canceladas'],
    datasets: [{
      data: [15, 25, 40, 10, 10],
      backgroundColor: ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#9CA3AF'],
      borderWidth: 1,
    }]
  };

  const ordersData: Order[] = [
    { id: 'OS-2023-00456', sector: 'Redes', description: 'Falha na conexão de rede - Setor Adm', tech: 'Carlos Silva', status: 'Em Andamento', date: '15/03/2023' },
    { id: 'OS-2023-00455', sector: 'Telefonia', description: 'Linha telefônica com ruído - Sala 203', tech: 'Ana Oliveira', status: 'Concluída', date: '14/03/2023' },
    { id: 'OS-2023-00454', sector: 'Infraestrutura', description: 'Instalação de novo rack - Data Center', tech: 'Roberto Almeida', status: 'Em Andamento', date: '14/03/2023' },
    { id: 'OS-2023-00453', sector: 'Atendimento', description: 'Atualização de software - Central', tech: 'Mariana Costa', status: 'Aberta', date: '13/03/2023' },
    { id: 'OS-2023-00452', sector: 'Redes', description: 'Configuração de VLAN - Setor Financeiro', tech: 'Carlos Silva', status: 'Concluída', date: '12/03/2023' },
    { id: 'OS-2023-00451', sector: 'Telefonia', description: 'Migração de ramais - Filial Centro', tech: 'Ana Oliveira', status: 'Atrasada', date: '10/03/2023' },
    { id: 'OS-2023-00450', sector: 'Infraestrutura', description: 'Manutenção preventiva - Nobreak', tech: 'Roberto Almeida', status: 'Concluída', date: '09/03/2023' },
    { id: 'OS-2023-00449', sector: 'Atendimento', description: 'Treinamento de novos operadores', tech: 'Mariana Costa', status: 'Concluída', date: '08/03/2023' },
    { id: 'OS-2023-00448', sector: 'Redes', description: 'Expansão de rede sem fio - Pátio', tech: 'Carlos Silva', status: 'Em Andamento', date: '07/03/2023' },
    { id: 'OS-2023-00447', sector: 'Telefonia', description: 'Configuração de chamada em grupo', tech: 'Ana Oliveira', status: 'Concluída', date: '06/03/2023' }
  ];

  // Helper functions
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Concluída': return 'status-completed';
      case 'Em Andamento': return 'status-in-progress';
      case 'Atrasada': return 'status-late';
      case 'Aberta': return 'status-open';
      default: return 'status-default';
    }
  };

  const handleViewChange = (type: string) => {
    setViewType(type);
  };

  const handleOrderClick = (orderId: string) => {
    const order = ordersData.find(o => o.id === orderId);
    setSelectedOrder(order || null);
    setShowModal(true);
  };

  const handleSectorFilter = (sector: string) => {
    setFilteredSector(sector === filteredSector ? null : sector);
  };

  const filteredOrders = filteredSector
    ? ordersData.filter(order => order.sector === filteredSector)
    : ordersData;

  // Components
  const Header = () => (
    <header className="dashboard-header">
      <div className="header-content">
        <button
          className={`sidebar-toggle ${darkMode ? 'dark' : 'light'}`}
          onClick={toggleSidebar}
        >
          {isSidebarVisible ? <DehazeIcon /> : '►'}
        </button>
        <h2>Dashboard de Ordens de Serviço</h2>
        <div className="update-date">
          Última atualização: <span>{new Date().toLocaleString()}</span>
        </div>
      </div>
    </header>
  );

  const OverviewCards = () => {
    const cards = [
      { title: 'Total de Ordens', value: '1,248', icon: '📋', trend: 'up', trendValue: '12% desde o último mês' },
      { title: 'Em Andamento', value: '324', icon: '🔄', trend: 'down', trendValue: '5% desde o último mês' },
      { title: 'Concluídas', value: '876', icon: '✅', trend: 'up', trendValue: '18% desde o último mês' },
      { title: 'Atrasadas', value: '48', icon: '⚠️', trend: 'up', trendValue: '3% desde o último mês' }
    ];

    return (
      <div className="overview-cards">
        {cards.map((card, index) => (
          <div key={index} className="card">
            <div className="card-content">
              <div>
                <p className="card-title">{card.title}</p>
                <h3 className="card-value">{card.value}</h3>
              </div>
              <div className="card-icon">{card.icon}</div>
            </div>
            <div className={`card-trend trend-${card.trend}`}>
              {card.trend === 'up' ? '↑' : '↓'} {card.trendValue}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const ChartsSection = () => {
    const [textColor, setTextColor] = useState(
      getComputedStyle(document.documentElement).getPropertyValue('--textColor')
    );

    // Atualiza a cor ao trocar o tema
    useEffect(() => {
      const updateTextColor = () => {
        const newColor = getComputedStyle(document.body).getPropertyValue('--textColor');
        setTextColor(newColor.trim());
        console.log(newColor);
        console.log(textColor)
      };

      // Observe as classes no body (dark-mode/light-mode)
      const observer = new MutationObserver(updateTextColor);
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class'],
      });

      // Atualiza imediatamente
      updateTextColor();

      return () => observer.disconnect();
    }, []);

    const sectorChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right' as const,
          labels: {
            color: textColor
          }
        },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    };

    const statusChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: textColor
          }
        },
        x: {
          ticks: {
            color: textColor
          }
        }
      },
      plugins: {
        legend: {
          display: false,
          labels: {
            color: textColor
          }
        }
      }
    };

    return (
      <div className="charts-section">
        <div className="chart-container">
          <div className="chart-header">
            <h3>Distribuição por Setor</h3>
            <div className="chart-toggles">
              <button
                className={`chart-toggle ${chartType === 'pie' ? 'active' : ''}`}
                onClick={() => setChartType('pie')}
              >
                Pizza
              </button>
              <button
                className={`chart-toggle ${chartType === 'bar' ? 'active' : ''}`}
                onClick={() => setChartType('bar')}
              >
                Barras
              </button>
            </div>
          </div>
          <div className="chart-wrapper">
            {chartType === 'pie' ? (
              <Pie key={textColor} data={sectorData} options={sectorChartOptions} />
            ) : (
              <Bar
                key={textColor}
                data={{
                  labels: sectorData.labels,
                  datasets: [{
                    label: 'Ordens por Setor',
                    data: sectorData.datasets[0].data,
                    backgroundColor: sectorData.datasets[0].backgroundColor
                  }]
                }}
                options={statusChartOptions}
              />
            )}
          </div>
        </div>

        <div className="chart-container">
          <h3>Status das Ordens</h3>
          <div className="chart-wrapper">
            <Bar
              data={{
                labels: statusData.labels,
                datasets: [{
                  label: 'Ordens por Status',
                  data: statusData.datasets[0].data,
                  backgroundColor: statusData.datasets[0].backgroundColor
                }]
              }}
              options={statusChartOptions}
            />
          </div>
        </div>
      </div>
    );
  };

  const OrdersTable = () => (
    <div className="orders-table-container">
      <div className="table-header">
        <h3>Ordens de Serviço Recentes</h3>
        <div className="table-actions">
          <button className="btn-primary">
            <span>+</span> Nova Ordem
          </button>
          <button className="btn-secondary">
            <span>🔍</span> Filtrar
          </button>
        </div>
      </div>

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
          {filteredOrders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.sector}</td>
              <td>{order.description}</td>
              <td>{order.tech}</td>
              <td>
                <span className={`status-badge ${getStatusClass(order.status)}`}>
                  {order.status}
                </span>
              </td>
              <td>{order.date}</td>
              <td>
                <button
                  className="view-btn"
                  onClick={() => handleOrderClick(order.id)}
                >
                  Ver
                </button>
                <button className="more-btn">⋯</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <div className="pagination-info">
          Mostrando <span>1</span> a <span>{filteredOrders.length}</span> de <span>{ordersData.length}</span> ordens
        </div>
        <div className="pagination-controls">
          <button>‹</button>
          <button className="active">1</button>
          <button>2</button>
          <button>3</button>
          <button>›</button>
        </div>
      </div>
    </div>
  );

  const OrderModal = ({ order, onClose }: { order: Order | null, onClose: () => void }) => {
    if (!order) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Detalhes da Ordem de Serviço</h3>
            <button onClick={onClose} className="close-btn">×</button>
          </div>
          <div className="modal-body">
            <div className="modal-grid">
              <div>
                <h4>Informações Básicas</h4>
                <div className="info-group">
                  <p><strong>ID:</strong> <span>{order.id}</span></p>
                  <p><strong>Setor:</strong> <span>{order.sector}</span></p>
                  <p><strong>Prioridade:</strong> <span className="status-badge status-late">Alta</span></p>
                  <p><strong>Data de Abertura:</strong> <span>15/03/2023</span></p>
                  <p><strong>Prazo:</strong> <span>22/03/2023</span></p>
                </div>
              </div>
              <div>
                <h4>Atribuição</h4>
                <div className="info-group">
                  <p><strong>Técnico Responsável:</strong> <span>{order.tech}</span></p>
                  <p><strong>Status:</strong> <span className={`status-badge ${getStatusClass(order.status)}`}>{order.status}</span></p>
                  <p><strong>Última Atualização:</strong> <span>18/03/2023 14:30</span></p>
                </div>
              </div>
            </div>

            <div className="modal-section">
              <h4>Descrição do Problema</h4>
              <div className="description-box">
                <p>{order.description}</p>
              </div>
            </div>

            <div className="modal-section">
              <h4>Ações Realizadas</h4>
              <div className="actions-list">
                <div className="action-item">
                  <div className="action-header">
                    <p className="action-title">Verificação inicial</p>
                    <p className="action-date">16/03/2023 09:15</p>
                  </div>
                  <p className="action-desc">Verificado o switch do setor e identificado problema no módulo de alimentação.</p>
                </div>
                <div className="action-item">
                  <div className="action-header">
                    <p className="action-title">Substituição de peça</p>
                    <p className="action-date">17/03/2023 14:30</p>
                  </div>
                  <p className="action-desc">Substituído o módulo de alimentação do switch. Testes iniciais mostraram melhoria, mas ainda há instabilidade.</p>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary">
                <span>🖨️</span> Imprimir
              </button>
              <button className="btn-primary">
                <span>✏️</span> Editar Ordem
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard">
      <Sidebar isVisible={isSidebarVisible} />
      <Header />

      <main className="dashboard-main">


        <OverviewCards />
        <ChartsSection />
        <OrdersTable />
      </main>

      {showModal && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Connectbi;