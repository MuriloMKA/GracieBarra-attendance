import React from 'react';
import { Header } from './Header';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Gracie Barra — Sistema de Gestão de Frequência
      </footer>
    </div>
  );
};
