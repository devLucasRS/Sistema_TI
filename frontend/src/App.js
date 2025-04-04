import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import PrivateRoute from './components/PrivateRoute';
import NovoChamado from './pages/Chamados/NovoChamado';
import MeusChamados from './pages/Chamados/MeusChamados';
import GestaoChamados from './pages/Chamados/GestaoChamados';
import Relatorios from './pages/Relatorios';
import CadastrarEquipamento from './pages/Inventario/CadastrarEquipamento';
import GestaoInventario from './pages/Inventario/GestaoInventario';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <PrivateRoute>
                <Users />
              </PrivateRoute>
            }
          />
          <Route
            path="/chamados/novo"
            element={
              <PrivateRoute>
                <NovoChamado />
              </PrivateRoute>
            }
          />
          <Route
            path="/chamados/meus"
            element={
              <PrivateRoute>
                <MeusChamados />
              </PrivateRoute>
            }
          />
          <Route
            path="/chamados/gestao"
            element={
              <PrivateRoute>
                <GestaoChamados />
              </PrivateRoute>
            }
          />
          <Route
            path="/relatorios"
            element={
              <PrivateRoute>
                <Relatorios />
              </PrivateRoute>
            }
          />
          <Route
            path="/inventario/cadastrar"
            element={
              <PrivateRoute>
                <CadastrarEquipamento />
              </PrivateRoute>
            }
          />
          <Route
            path="/inventario/gestao"
            element={
              <PrivateRoute>
                <GestaoInventario />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 