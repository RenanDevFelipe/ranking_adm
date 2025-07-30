import React, { useState, useEffect, useMemo } from 'react';
import { getSODepartament } from '../../services/api.ts';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import './style.css';
import Sidebar from '../../components/sidebar';
import DehazeIcon from '@mui/icons-material/Dehaze';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

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
  assunto?: string;
  dateObj?: Date;
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
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [darkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : true;
  });
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [selectedSector, setSelectedSector] = useState<string>('11');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Order; direction: 'ascending' | 'descending' } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

        if (selectedSector === 'all') {
          const osData: Record<string, OSData> = {};

          for (const sector of sectorsData) {
            try {
              const data = await getSODepartament(token, Number(sector.id_setor));
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
        } else {
          try {
            const data = await getSODepartament(token, Number(selectedSector));
            setSectorOSData({
              [selectedSector]: data
            });
          } catch (err) {
            console.error(`Erro ao carregar dados para setor ${selectedSector}:`, err);
            setSectorOSData({
              [selectedSector]: {
                total: 0,
                id_assunto_count: {},
                registros: {
                  aberta: { total: 0, services_ordem: [] }
                }
              }
            });
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError("Erro ao carregar dados. Tente novamente mais tarde.");
        setLoading(false);
      }
    };

    loadData();
  }, [selectedSector]);

  // Componente de Loading
  const LoadingOverlay = () => (
    <div className="global-loading-overlay">
      <div className="loading-content">
        <CircularProgress size={60} thickness={4} />
        <p>Carregando dados do setor...</p>
      </div>
    </div>
  );

  // Preparar dados para os gráficos de assuntos do setor selecionado
  const prepareSubjectChartData = (): ChartData => {
    const currentSectorData = sectorOSData[selectedSector];

    if (!currentSectorData?.id_assunto_count) {
      return {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          borderWidth: 1
        }]
      };
    }

    const labels = Object.keys(currentSectorData.id_assunto_count);
    const data = Object.values(currentSectorData.id_assunto_count);

    const backgroundColors = [
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

  // Preparar dados para os gráficos de status
  const prepareStatusChartData = (): ChartData => {
    let totalAbertas = 0;
    let totalAnalise = 0;
    let totalEncaminhada = 0;
    let totalAssumida = 0;
    let totalAgendada = 0;
    let totalDeslocamento = 0;
    let totalExecucao = 0;
    let totalReagendamento = 0;

    if (selectedSector === 'all') {
      for (const osData of Object.values(sectorOSData)) {
        totalAbertas += osData?.registros?.aberta?.total || 0;
        totalAnalise += osData?.registros?.analise?.total || 0;
        totalEncaminhada += osData?.registros?.encaminhada?.total || 0;
        totalAssumida += osData?.registros?.assumida?.total || 0;
        totalAgendada += osData?.registros?.agendada?.total || 0;
        totalDeslocamento += osData?.registros?.deslocamento?.total || 0;
        totalExecucao += osData?.registros?.execucao?.total || 0;
        totalReagendamento += osData?.registros?.reagendamento?.total || 0;
      }
    } else {
      const osData = sectorOSData[selectedSector];
      if (osData) {
        totalAbertas = osData?.registros?.aberta?.total || 0;
        totalAnalise = osData?.registros?.analise?.total || 0;
        totalEncaminhada = osData?.registros?.encaminhada?.total || 0;
        totalAssumida = osData?.registros?.assumida?.total || 0;
        totalAgendada = osData?.registros?.agendada?.total || 0;
        totalDeslocamento = osData?.registros?.deslocamento?.total || 0;
        totalExecucao = osData?.registros?.execucao?.total || 0;
        totalReagendamento = osData?.registros?.reagendamento?.total || 0;
      }
    }

    return {
      labels: ['Abertas', 'Em Analise', 'Encaminhadas', 'Assumidas', 'Agendadas', 'Em Deslocamento', 'Em Execução', 'Reagendamento'],
      datasets: [{
        data: [totalAbertas, totalAnalise, totalEncaminhada, totalAssumida, totalAgendada, totalDeslocamento, totalExecucao, totalReagendamento],
        backgroundColor: ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#3bf673ff', '#f6f33bff', '#e03bf6ff', '#3bf6edff'],
        borderWidth: 1,
      }]
    };
  };

  // Helper functions
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'A': return 'status-open';
      case 'AN': return 'status-in-progress';
      case 'EN': return 'status-in-progress';
      case 'AS': return 'status-in-progress';
      case 'AG': return 'status-scheduled';
      case 'DS': return 'status-in-progress';
      case 'EX': return 'status-in-progress';
      case 'RAG': return 'status-late';
      default: return 'status-default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'A': return 'Aberta';
      case 'AN': return 'Em Análise';
      case 'EN': return 'Encaminhada';
      case 'AS': return 'Assumida';
      case 'AG': return 'Agendada';
      case 'DS': return 'Em Deslocamento';
      case 'EX': return 'Em Execução';
      case 'RAG': return 'Reagendada';
      default: return status;
    }
  };

  const handleOrderClick = (orderId: string) => {
    const order = filteredOrders.find(o => o.id === orderId);
    setSelectedOrder(order || null);
    setShowModal(true);
  };

  const requestSort = (key: keyof Order) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Transformar os dados da API no formato esperado pela tabela
  const ordersData = useMemo(() => {
    const orders: Order[] = [];

    for (const [sectorId, osData] of Object.entries(sectorOSData)) {
      const sector = sectors.find(s => s.id_setor === sectorId);

      if (sector && osData?.registros) {
        // Processa ordens abertas
        if (osData.registros.aberta?.services_ordem) {
          osData.registros.aberta.services_ordem.forEach((os: any) => {
            const dateObj = os.data_abertura ? new Date(os.data_abertura) : new Date();
            orders.push({
              id: os.protocolo || os.id || 'N/A',
              sector: sector.descricao,
              description: os.mensagem || 'Sem descrição',
              tech: os.id_tecnico ? `Técnico ${os.id_tecnico}` : 'Não atribuído',
              status: os.status || 'A',
              date: dateObj.toLocaleDateString(),
              dateObj,
              assunto: os.id_assunto || 'Sem assunto'
            });
          });
        }

        // Processa outros status
        const statusTypes = ['analise', 'encaminhada', 'assumida', 'agendada', 'deslocamento', 'execucao', 'reagendamento'];

        statusTypes.forEach(statusType => {
          const statusData = osData.registros[statusType as keyof typeof osData.registros];
          if (statusData?.services_ordem) {
            statusData.services_ordem.forEach((os: any) => {
              const dateObj = os.data_abertura ? new Date(os.data_abertura) : new Date();
              orders.push({
                id: os.protocolo || os.id || 'N/A',
                sector: sector.descricao,
                description: os.mensagem || 'Sem descrição',
                tech: os.id_tecnico ? `Técnico ${os.id_tecnico}` : 'Não atribuído',
                status: os.status || statusType.toUpperCase().substring(0, 2),
                date: dateObj.toLocaleDateString(),
                dateObj,
                assunto: os.id_assunto_descricao || 'Sem assunto'
              });
            });
          }
        });
      }
    }

    return orders;
  }, [sectorOSData, sectors]);

  // Filtrar e ordenar as ordens
  const filteredOrders = useMemo(() => {
    let result = [...ordersData];

    // Aplicar filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order =>
        order.id.toLowerCase().includes(term) ||
        order.sector.toLowerCase().includes(term) ||
        order.description.toLowerCase().includes(term) ||
        order.tech.toLowerCase().includes(term) ||
        (order.assunto?.toLowerCase()?.includes(term) ?? false) ||
        getStatusLabel(order.status).toLowerCase().includes(term)
      );
    }

    // Aplicar filtro de status
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Aplicar ordenação
    if (sortConfig !== null) {
      result.sort((a, b) => {
        // Tratamento especial para datas
        if (sortConfig.key === 'date') {
          if (a.dateObj && b.dateObj) {
            if (a.dateObj < b.dateObj) {
              return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a.dateObj > b.dateObj) {
              return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
          }
        }

        // Ordenação padrão para outros campos
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === undefined || bValue === undefined) return 0;

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [ordersData, searchTerm, statusFilter, sortConfig]);

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

        <div className="sector-select-container">
          <select
            value={selectedSector}
            onChange={(e) => {
              setSelectedSector(e.target.value);
              setLoading(true);
            }}
            className="sector-select"
            disabled={loading}
          >
            <option value="all">Todos os Setores</option>
            {sectors.map(sector => (
              <option key={sector.id_setor} value={sector.id_setor}>
                {sector.descricao}
              </option>
            ))}
          </select>
        </div>

        <div className="update-date">
          Última atualização: <span>{new Date().toLocaleString()}</span>
        </div>
      </div>
    </header>
  );

  const OverviewCards = () => {
    const statusData = prepareStatusChartData();

    const totalOrdens = ordersData.length;
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
        icon: '🚀',
        trend: 'up',
        trendValue: '18% desde o último mês'
      },
      {
        title: 'Assumidas',
        value: assumida.toLocaleString(),
        icon: '🤲',
        trend: 'up',
        trendValue: '3% desde o último mês'
      },
      {
        title: 'Agendadas',
        value: agendada.toLocaleString(),
        icon: '⌚',
        trend: 'up',
        trendValue: '3% desde o último mês'
      },
      {
        title: 'Em Deslocamento',
        value: deslocamento.toLocaleString(),
        icon: '🚗',
        trend: 'up',
        trendValue: '3% desde o último mês'
      },
      {
        title: 'Em Execução',
        value: execucao.toLocaleString(),
        icon: '🛠️',
        trend: 'up',
        trendValue: '3% desde o último mês'
      },
      {
        title: 'Reagendamento',
        value: reagendamento.toLocaleString(),
        icon: '⏳',
        trend: 'up',
        trendValue: '3% desde o último mês'
      }
    ];

    return (
      <div className="overview-cards">
        {error ? (
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
              {/* <div className={`card-trend trend-${card.trend}`}>
                {card.trend === 'up' ? '↑' : '↓'} {card.trendValue}
              </div> */}
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

    const chartOptions = {
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
        {error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            {selectedSector === 'all' ? (
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
                    <Pie key={textColor} data={prepareSubjectChartData()} options={chartOptions} />
                  ) : (
                    <Bar
                      key={textColor}
                      data={{
                        labels: prepareSubjectChartData().labels,
                        datasets: [{
                          label: 'Ordens por Setor',
                          data: prepareSubjectChartData().datasets[0].data,
                          backgroundColor: prepareSubjectChartData().datasets[0].backgroundColor
                        }]
                      }}
                      options={statusChartOptions}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="chart-container">
                <div className="chart-header">
                  <h3>Assuntos do Setor</h3>
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
                    <Pie key={textColor} data={prepareSubjectChartData()} options={chartOptions} />
                  ) : (
                    <Bar
                      key={textColor}
                      data={{
                        labels: prepareSubjectChartData().labels,
                        datasets: [{
                          label: 'Ordens por Assunto',
                          data: prepareSubjectChartData().datasets[0].data,
                          backgroundColor: prepareSubjectChartData().datasets[0].backgroundColor
                        }]
                      }}
                      options={statusChartOptions}
                    />
                  )}
                </div>
              </div>
            )}

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

  const OrdersTable = () => {
    const statusOptions = [
      { value: 'all', label: 'Todos os Status' },
      { value: 'A', label: 'Abertas' },
      { value: 'AN', label: 'Em Análise' },
      { value: 'EN', label: 'Encaminhadas' },
      { value: 'AS', label: 'Assumidas' },
      { value: 'AG', label: 'Agendadas' },
      { value: 'DS', label: 'Em Deslocamento' },
      { value: 'EX', label: 'Em Execução' },
      { value: 'RAG', label: 'Reagendadas' }
    ];

    return (
      <div className="orders-table-container">
        <div className="table-header">
          <h3>Ordens de Serviço Recentes</h3>

          <div className="table-controls">
            <div className="search-container">
              <SearchIcon className="search-icon" />
              <input
                type="text"
                placeholder="Pesquisar ordens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-container">
              <FilterListIcon className="filter-icon" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-filter"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <table className="orders-table">
              <thead>
                <tr>
                  <th onClick={() => requestSort('id')}>
                    ID {sortConfig?.key === 'id' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => requestSort('sector')}>
                    Setor {sortConfig?.key === 'sector' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => requestSort('assunto')}>
                    Assunto {sortConfig?.key === 'assunto' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                  </th>
                  <th>Descrição</th>
                  <th onClick={() => requestSort('tech')}>
                    Técnico {sortConfig?.key === 'tech' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => requestSort('status')}>
                    Status {sortConfig?.key === 'status' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => requestSort('date')}>
                    Data {sortConfig?.key === 'date' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                  </th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(order => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.sector}</td>
                      <td>{order.assunto}</td>
                      <td className="description-cell">{order.description}</td>
                      <td>{order.tech}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(order.status)}`}>
                          {getStatusLabel(order.status)}
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
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="no-results">
                      Nenhuma ordem encontrada com os filtros aplicados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="pagination">
              <div className="pagination-info">
                Mostrando <span>1</span> a <span>{filteredOrders.length}</span> de <span>{filteredOrders.length}</span> ordens
              </div>
              <div className="pagination-controls">
                <button disabled>‹</button>
                <button className="active">1</button>
                <button disabled>›</button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

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
                  <p><strong>Assunto:</strong> <span>{order.assunto}</span></p>
                  <p><strong>Prioridade:</strong> <span className="status-badge status-late">Alta</span></p>
                  <p><strong>Data de Abertura:</strong> <span>{order.date}</span></p>
                </div>
              </div>
              <div>
                <h4>Atribuição</h4>
                <div className="info-group">
                  <p><strong>Técnico Responsável:</strong> <span>{order.tech}</span></p>
                  <p><strong>Status:</strong> <span className={`status-badge ${getStatusClass(order.status)}`}>{getStatusLabel(order.status)}</span></p>
                </div>
              </div>
            </div>

            <div className="modal-section">
              <h4>Descrição do Problema</h4>
              <div className="description-box">
                <p>{order.description}</p>
              </div>
            </div>

            {/* <div className="modal-actions">
              <button className="btn-secondary">
                <span>🖨️</span> Imprimir
              </button>
              <button className="btn-primary">
                <span>✏️</span> Editar Ordem
              </button>
            </div> */}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard">
      <Sidebar isVisible={isSidebarVisible} />
      <Header />

      {loading ? (
        <LoadingOverlay />
      ) : (
        <main className="dashboard-main">
          <OverviewCards />
          <ChartsSection />
          <OrdersTable />
        </main>
      )}

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