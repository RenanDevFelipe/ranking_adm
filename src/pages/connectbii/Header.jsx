// src/components/Header.jsx
import React from 'react';

const Header = () => {
  return (
    <header className="header bg-white shadow-sm p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Dashboard de Ordens de Serviço</h2>
        <div className="text-sm text-gray-500">
          Última atualização: <span>{new Date().toLocaleString()}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;