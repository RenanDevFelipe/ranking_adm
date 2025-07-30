import React, { useState, useEffect, useMemo } from 'react';
import { getSODepartament } from '../../services/api.ts';
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

interface SectorData {
  id_setor: string;
  descricao: string;
  ativo: string;
}

interface OSData {
  total: number;
  id_assunto_count: Record<string, number>;
  registros: {
    aberta: {
      total: number;
      services_ordem: any[];
    };
    analise?: {
      total: number;
      services_ordem: any[];
    };
    encaminhada?: {
      total: number;
      services_ordem: any[];
    };
    assumida?: {
      total: number;
      services_ordem: any[];
    };
    agendada?: {
      total: number;
      services_ordem: any[];
    };
    deslocamento?: {
      total: number;
      services_ordem: any[];
    };
    execucao?: {
      total: number;
      services_ordem: any[];
    };
    reagendamento?: {
      total: number;
      services_ordem: any[];
    };
  };
}

const Connectbi = () => {
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [sectorOSData, setSectorOSData] = useState<Record<string, OSData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // Carrega os dados dos setores e OS
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Token de acesso não encontrado');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Definir os setores manualmente conforme as imagens fornecidas
        const sectorsData: SectorData[] = [
          { id_setor: '3', descricao: 'Manutenção', ativo: 'Sim' },
          { id_setor: '28', descricao: 'Marketing', ativo: 'Sim' },
          { id_setor: '37', descricao: 'PREFEITURA', ativo: 'Sim' },
          { id_setor: '26', descricao: 'Recursos Humanos', ativo: 'Sim' },
          { id_setor: '36', descricao: 'Sucesso do Cliente', ativo: 'Sim' },
          { id_setor: '22', descricao: 'Supervisão técnica', ativo: 'Sim' },
          { id_setor: '19', descricao: 'Suporte Nv. 1', ativo: 'Sim' },
          { id_setor: '11', descricao: 'Suporte Nv. 2', ativo: 'Sim' },
          { id_setor: '38', descricao: 'Suporte Nv. 2 SVA', ativo: 'Sim' },
          { id_setor: '7', descricao: 'Suporte Nv. 3', ativo: 'Sim' },
          { id_setor: '9', descricao: 'Suporte Nv. 4', ativo: 'Sim' },
          { id_setor: '32', descricao: 'Telefone IP', ativo: 'Sim' },
          { id_setor: '33', descricao: 'Armazenamento em nuvem', ativo: 'Sim' },
          { id_setor: '31', descricao: 'Cameras', ativo: 'Sim' },
          { id_setor: '20', descricao: 'Cancelamento', ativo: 'Sim' },
          { id_setor: '34', descricao: 'Casa inteligente', ativo: 'Sim' },
          { id_setor: '4', descricao: 'Cobrança', ativo: 'Sim' },
          { id_setor: '13', descricao: 'Comercial', ativo: 'Sim' },
          { id_setor: '25', descricao: 'Estoque', ativo: 'Sim' },
          { id_setor: '5', descricao: 'Faturamento', ativo: 'Sim' },
          { id_setor: '2', descricao: 'Financeiro', ativo: 'Sim' },
          { id_setor: '18', descricao: 'Gestores', ativo: 'Sim' },
          { id_setor: '30', descricao: 'GPS', ativo: 'Sim' },
          { id_setor: '16', descricao: 'Infraestrutura', ativo: 'Sim' },
          { id_setor: '35', descricao: 'IPTV', ativo: 'Sim' }
        ];

        setSectors(sectorsData);

        // Carregar dados de OS para cada setor
        const osData: Record<string, OSData> = {};
        
        for (const sector of sectorsData) {
          try {
            const data = await getSODepartament(token,Number(sector.id_setor));
            osData[sector.id_setor] = data;
          } catch (err) {
            console.error(`Erro ao carregar dados para setor ${sector.id_setor}:`, err);
            osData[sector.id_setor] = {
              total: 0,
              id_assunto_count: {},
              registros: {
                aberta: { total: 0, services_ordem: [] }
              }
            };
          }
        }

        setSectorOSData(osData);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError("Erro ao carregar dados. Tente novamente mais tarde.");
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Preparar dados para os gráficos
  const prepareSectorChartData = (): ChartData => {
    const labels: string[] = [];
    const data: number[] = [];
    
    for (const [sectorId, osData] of Object.entries(sectorOSData)) {
      const sector = sectors.find(s => s.id_setor === sectorId);
      if (sector && osData.total > 0) {
        labels.push(sector.descricao);
        data.push(osData.total);
      }
    }
    
    const backgroundColors = [
      '#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#9CA3AF',
      '#EC4899', '#8B5CF6', '#14B8A6', '#F97316', '#64748B',
      '#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#9CA3AF',
      '#EC4899', '#8B5CF6', '#14B8A6', '#F97316', '#64748B',
      '#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#9CA3AF'
    ];
    
    return {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors.slice(0, labels.length),
        borderWidth: 1
      }]
    };
  };

  const prepareStatusChartData = (): ChartData => {
    let totalAbertas = 0;
    let totalAnalise = 0;
    let totalEncaminhada = 0;
    let totalAssumida = 0;
    let totalAgendada = 0;
    let totalDeslocamento = 0;
    let totalExecucao = 0;
    let totalReagendamento = 0;
    
    for (const osData of Object.values(sectorOSData)) {
      totalAbertas += osData.registros.aberta?.total || 0;
      totalAnalise += osData.registros.analise?.total || 0;
      totalEncaminhada += osData.registros.encaminhada?.total || 0;
      totalAssumida += osData.registros.assumida?.total || 0;
      totalAgendada += osData.registros.agendada?.total || 0;
      totalDeslocamento += osData.registros.deslocamento?.total || 0;
      totalExecucao += osData.registros.execucao?.total || 0;
      totalReagendamento += osData.registros.reagendamento?.total || 0;
    }
    
    return {
      labels: ['Abertas', 'Em Analise', 'Encaminhadas', 'Assumidas','Agendadas','Em Deslocamento', 'Em Execução','Reagendamento'],
      datasets: [{
        data: [totalAbertas, totalAnalise, totalEncaminhada, totalAssumida,totalAgendada,totalDeslocamento,totalExecucao,totalReagendamento],
        backgroundColor: ['#3B82F6', '#F59E0B', '#10B981', '#EF4444','#3B82F6','#3B82F6','#3B82F6','#3B82F6'],
        borderWidth: 1,
      }]
    };
  };

  // Helper functions
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Concluída': return 'status-completed';
      case 'Em Andamento': return 'status-in-progress';
      case 'Atrasada': return 'status-late';
      case 'A': return 'status-open';
      case 'AN': return 'status-analysis';
      case 'EN': return 'status-forwarded';
      case 'AS': return 'status-assumed';
      case 'AG': return 'status-scheduled';
      case 'DS': return 'status-displacement';
      case 'EX': return 'status-execution';
      case 'RAG': return 'status-rescheduling';
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

  // Transformar os dados da API no formato esperado pela tabela
  const ordersData = useMemo(() => {
    const orders: Order[] = [];
    
    for (const [sectorId, osData] of Object.entries(sectorOSData)) {
      const sector = sectors.find(s => s.id_setor === sectorId);
      
      if (sector) {
        // Adicionar ordens abertas
        if (osData.registros.aberta?.services_ordem) {
          osData.registros.aberta.services_ordem.forEach((os: any) => {
            orders.push({
              id: os.protocolo || os.id || 'N/A',
              sector: sector.descricao,
              description: os.mensagem || 'Sem descrição',
              tech: os.id_tecnico ? `Técnico ${os.id_tecnico}` : 'Não atribuído',
              status: 'A',
              date: os.data_abertura ? new Date(os.data_abertura).toLocaleDateString() : 'Sem data'
            });
          });
        }
        
        // Adicionar ordens em andamento (se existirem)
        // if (osData.registros.em_andamento?.services_ordem) {
        //   osData.registros.em_andamento.services_ordem.forEach((os: any) => {
        //     orders.push({
        //       id: os.protocolo || os.id || 'N/A',
        //       sector: sector.descricao,
        //       description: os.mensagem || 'Sem descrição',
        //       tech: os.id_tecnico ? `Técnico ${os.id_tecnico}` : 'Não atribuído',
        //       status: 'Em Andamento',
        //       date: os.data_abertura ? new Date(os.data_abertura).toLocaleDateString() : 'Sem data'
        //     });
        //   });
        // }
      }
    }
    
    return orders;
  }, [sectorOSData, sectors]);

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
    const sectorData = prepareSectorChartData();
    const statusData = prepareStatusChartData();
    
    const totalOrdens = sectorData.datasets[0].data.reduce((a, b) => a + b, 0);
    const emAnalise = statusData.datasets[0].data[1];
    const encaminhada = statusData.datasets[0].data[2];
    const assumida = statusData.datasets[0].data[3];
    const agendada = statusData.datasets[0].data[4];
    const deslocamento = statusData.datasets[0].data[5];
    const execucao = statusData.datasets[0].data[6];
    const reagendamento = statusData.datasets[0].data[7];

    const cards = [
      { 
        title: 'Total de Ordens', 
        value: totalOrdens.toLocaleString(), 
        icon: '📋', 
        trend: 'up', 
        trendValue: '12% desde o último mês' 
      },
      { 
        title: 'Em Analise', 
        value: emAnalise.toLocaleString(), 
        icon: '🔄', 
        trend: 'down', 
        trendValue: '5% desde o último mês' 
      },
      { 
        title: 'Encaminhadas', 
        value: encaminhada.toLocaleString(), 
        icon: '​🚀​', 
        trend: 'up', 
        trendValue: '18% desde o último mês' 
      },
      { 
        title: 'Assumidas', 
        value: assumida.toLocaleString(), 
        icon: '​🤲​', 
        trend: 'up', 
        trendValue: '3% desde o último mês' 
      },
      { 
        title: 'Agendadas', 
        value: agendada.toLocaleString(), 
        icon: '​​⌚​', 
        trend: 'up', 
        trendValue: '3% desde o último mês' 
      },
      { 
        title: 'Em Deslocamento', 
        value: deslocamento.toLocaleString(), 
        icon: '​​🚗​', 
        trend: 'up', 
        trendValue: '3% desde o último mês' 
      },
      { 
        title: 'Em Execucao', 
        value: execucao.toLocaleString(), 
        icon: '​​🛠️​', 
        trend: 'up', 
        trendValue: '3% desde o último mês' 
      },
      { 
        title: 'Em Reagendamento', 
        value: reagendamento.toLocaleString(), 
        icon: '​​⌛​', 
        trend: 'up', 
        trendValue: '3% desde o último mês' 
      }
    ];

    return (
      <div className="overview-cards">
        {loading ? (
          <div className="loading-overlay">Carregando dados...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          cards.map((card, index) => (
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
          ))
        )}
      </div>
    );
  };

  const ChartsSection = () => {
    const [textColor, setTextColor] = useState(
      getComputedStyle(document.documentElement).getPropertyValue('--textColor')
    );

    useEffect(() => {
      const updateTextColor = () => {
        const newColor = getComputedStyle(document.body).getPropertyValue('--textColor');
        setTextColor(newColor.trim());
      };

      const observer = new MutationObserver(updateTextColor);
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class'],
      });

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
        {loading ? (
          <div className="loading-overlay">Carregando dados...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
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
                  <Pie key={textColor} data={prepareSectorChartData()} options={sectorChartOptions} />
                ) : (
                  <Bar
                    key={textColor}
                    data={{
                      labels: prepareSectorChartData().labels,
                      datasets: [{
                        label: 'Ordens por Setor',
                        data: prepareSectorChartData().datasets[0].data,
                        backgroundColor: prepareSectorChartData().datasets[0].backgroundColor
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
                    labels: prepareStatusChartData().labels,
                    datasets: [{
                      label: 'Ordens por Status',
                      data: prepareStatusChartData().datasets[0].data,
                      backgroundColor: prepareStatusChartData().datasets[0].backgroundColor
                    }]
                  }}
                  options={statusChartOptions}
                />
              </div>
            </div>
          </>
        )}
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

      {loading ? (
        <div className="loading-overlay">Carregando dados...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
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
        </>
      )}
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
                  <p><strong>Data de Abertura:</strong> <span>{order.date}</span></p>
                  <p><strong>Prazo:</strong> <span>{order.date}</span></p>
                </div>
              </div>
              <div>
                <h4>Atribuição</h4>
                <div className="info-group">
                  <p><strong>Técnico Responsável:</strong> <span>{order.tech}</span></p>
                  <p><strong>Status:</strong> <span className={`status-badge ${getStatusClass(order.status)}`}>{order.status}</span></p>
                  <p><strong>Última Atualização:</strong> <span>{order.date}</span></p>
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
                    <p className="action-date">{order.date}</p>
                  </div>
                  <p className="action-desc">Problema identificado e em processo de resolução.</p>
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