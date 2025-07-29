// src/components/ChartsSection.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const ChartsSection = ({ sectorData, statusData, onSectorClick }) => {
  const [chartType, setChartType] = useState('pie');
  const sectorChartRef = useRef(null);
  const statusChartRef = useRef(null);
  const sectorInstanceRef = useRef(null);
  const statusInstanceRef = useRef(null);

  useEffect(() => {
    // Initialize or update sector chart
    const sectorCtx = sectorChartRef.current.getContext('2d');
    
    if (sectorInstanceRef.current) {
      sectorInstanceRef.current.destroy();
    }

    sectorInstanceRef.current = new Chart(sectorCtx, {
      type: chartType,
      data: sectorData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (evt, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const sector = sectorData.labels[index];
            onSectorClick(sector);
          }
        },
        plugins: {
          legend: {
            position: 'right',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    // Initialize status chart
    const statusCtx = statusChartRef.current.getContext('2d');
    
    if (statusInstanceRef.current) {
      statusInstanceRef.current.destroy();
    }

    statusInstanceRef.current = new Chart(statusCtx, {
      type: 'bar',
      data: {
        labels: statusData.labels,
        datasets: [{
          label: 'Ordens por Status',
          data: statusData.datasets[0].data,
          backgroundColor: statusData.datasets[0].backgroundColor,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    return () => {
      if (sectorInstanceRef.current) {
        sectorInstanceRef.current.destroy();
      }
      if (statusInstanceRef.current) {
        statusInstanceRef.current.destroy();
      }
    };
  }, [chartType, sectorData, statusData, onSectorClick]);

  const handleChartTypeChange = (type) => {
    setChartType(type);
  };

  return (
    <div className="grid-charts">
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Distribuição por Setor</h3>
          <div className="flex space-x-2">
            <button 
              className={`px-3 py-1 rounded-md ${chartType === 'pie' ? 'tab-active' : ''}`}
              onClick={() => handleChartTypeChange('pie')}
            >
              <i className="fas fa-chart-pie"></i>
            </button>
            <button 
              className={`px-3 py-1 rounded-md ${chartType === 'bar' ? 'tab-active' : ''}`}
              onClick={() => handleChartTypeChange('bar')}
            >
              <i className="fas fa-chart-bar"></i>
            </button>
          </div>
        </div>
        <div className="chart-container">
          <canvas ref={sectorChartRef}></canvas>
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Status das Ordens</h3>
        <div className="chart-container">
          <canvas ref={statusChartRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;