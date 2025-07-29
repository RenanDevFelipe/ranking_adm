// src/components/OverviewCards.jsx
import React from 'react';

const OverviewCards = ({ viewType }) => {
  const cards = [
    {
      title: 'Total de Ordens',
      value: '1,248',
      icon: 'clipboard-list',
      color: 'blue',
      trend: 'up',
      trendValue: '12% desde o último mês'
    },
    {
      title: 'Em Andamento',
      value: '324',
      icon: 'spinner',
      color: 'yellow',
      trend: 'down',
      trendValue: '5% desde o último mês'
    },
    {
      title: 'Concluídas',
      value: '876',
      icon: 'check-circle',
      color: 'green',
      trend: 'up',
      trendValue: '18% desde o último mês'
    },
    {
      title: 'Atrasadas',
      value: '48',
      icon: 'exclamation-triangle',
      color: 'red',
      trend: 'up',
      trendValue: '3% desde o último mês'
    }
  ];

  return (
    <div className="grid-cards">
      {cards.map((card, index) => (
        <div key={index} className="card card-hover">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500">{card.title}</p>
              <h3 className="text-2xl font-bold mt-2">{card.value}</h3>
            </div>
            <div className={`card-icon icon-${card.color}`}>
              <i className={`fas fa-${card.icon} text-${card.color}-600`}></i>
            </div>
          </div>
          <div className={`mt-4 flex items-center text-sm text-${card.trend === 'up' ? 'green' : 'red'}-500`}>
            <i className={`fas fa-arrow-${card.trend} mr-1`}></i>
            <span>{card.trendValue}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OverviewCards;