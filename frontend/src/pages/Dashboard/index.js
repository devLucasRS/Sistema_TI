import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { 
    Computer, 
    Assignment, 
    People, 
    Build, 
    Warning, 
    CheckCircle,
    TrendingUp,
    TrendingDown
} from '@mui/icons-material';
import api from '../../services/api';
import './styles.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        equipamentos: [],
        chamados: [],
        usuarios: []
    });

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) {
            navigate('/login');
            return;
        }
        setUser(userData);
        fetchDashboardData();
    }, [navigate]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Buscar dados do inventário
            const equipamentosRes = await api.get('/inventario');
            console.log('Dados do inventário:', equipamentosRes.data);

            // Buscar dados dos chamados
            const chamadosRes = await api.get('/chamados');
            console.log('Dados dos chamados:', chamadosRes.data);

            // Buscar dados dos usuários (apenas para admin)
            let usuariosRes = { data: [] };
            if (user?.tipo === 'admin') {
                usuariosRes = await api.get('/usuarios');
                console.log('Dados dos usuários:', usuariosRes.data);
            }

            setDashboardData({
                equipamentos: equipamentosRes.data || [],
                chamados: chamadosRes.data || [],
                usuarios: usuariosRes.data || []
            });
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
            // Definir dados vazios em caso de erro
            setDashboardData({
                equipamentos: [],
                chamados: [],
                usuarios: []
            });
        } finally {
            setLoading(false);
        }
    };

    const getEquipamentosEmUso = () => {
        return dashboardData.equipamentos.filter(eq => eq.portador_id !== null).length;
    };

    const getEquipamentosDisponiveis = () => {
        return dashboardData.equipamentos.filter(eq => eq.portador_id === null).length;
    };

    const getChamadosAbertos = () => {
        return dashboardData.chamados.filter(ch => ch.status === 'aberto').length;
    };

    const getChamadosFechados = () => {
        return dashboardData.chamados.filter(ch => ch.status === 'fechado').length;
    };

    if (loading) {
        return (
            <div className="app-container">
                <div className="main-wrapper">
                    <div className="content-wrapper">
                        <div className="loading">Carregando dashboard...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            <Sidebar user={user} />
            <div className="main-wrapper">
                <Navbar 
                    user={user}
                    pageTitle="Dashboard"
                    breadcrumbs={[
                        { label: 'Home', path: '/dashboard' }
                    ]}
                />
                <div className="content-wrapper">
                    <div className="dashboard-header">
                        <h1>Bem-vindo, {user?.nome}</h1>
                        <p>Este é o seu painel de controle</p>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">
                                <Computer />
                            </div>
                            <div className="stat-info">
                                <h3>Equipamentos</h3>
                                <p>Total: {dashboardData.equipamentos.length}</p>
                                <div className="stat-details">
                                    <span className="stat-up">
                                        <TrendingUp /> {getEquipamentosEmUso()} em uso
                                    </span>
                                    <span className="stat-down">
                                        <TrendingDown /> {getEquipamentosDisponiveis()} disponíveis
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">
                                <Assignment />
                            </div>
                            <div className="stat-info">
                                <h3>Chamados</h3>
                                <p>Total: {dashboardData.chamados.length}</p>
                                <div className="stat-details">
                                    <span className="stat-warning">
                                        <Warning /> {getChamadosAbertos()} abertos
                                    </span>
                                    <span className="stat-success">
                                        <CheckCircle /> {getChamadosFechados()} fechados
                                    </span>
                                </div>
                            </div>
                        </div>

                        {user?.tipo === 'admin' && (
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <People />
                                </div>
                                <div className="stat-info">
                                    <h3>Usuários</h3>
                                    <p>Total: {dashboardData.usuarios.length}</p>
                                    <div className="stat-details">
                                        <span className="stat-up">
                                            <TrendingUp /> {dashboardData.usuarios.filter(u => u.tipo === 'admin').length} administradores
                                        </span>
                                        <span className="stat-down">
                                            <TrendingDown /> {dashboardData.usuarios.filter(u => u.tipo === 'tecnico').length} técnicos
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="dashboard-grid">
                        <div className="dashboard-card">
                            <h2>Chamados Recentes</h2>
                            <div className="list-container">
                                {dashboardData.chamados.slice(0, 5).map(chamado => (
                                    <div key={chamado.id} className="list-item">
                                        <div className="list-item-main">
                                            <span className="list-item-title">{chamado.titulo}</span>
                                            <span className={`status-badge ${chamado.status}`}>
                                                {chamado.status === 'aberto' ? 'Aberto' : 'Fechado'}
                                            </span>
                                        </div>
                                        <div className="list-item-details">
                                            <span>{chamado.solicitante}</span>
                                            <span>{new Date(chamado.data_criacao).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <h2>Equipamentos Recentes</h2>
                            <div className="list-container">
                                {dashboardData.equipamentos.slice(0, 5).map(equipamento => (
                                    <div key={equipamento.id} className="list-item">
                                        <div className="list-item-main">
                                            <span className="list-item-title">{equipamento.equipamento}</span>
                                            <span className={`status-badge ${equipamento.portador_id ? 'em-uso' : 'disponivel'}`}>
                                                {equipamento.portador_id ? 'Em uso' : 'Disponível'}
                                            </span>
                                        </div>
                                        <div className="list-item-details">
                                            <span>{equipamento.portador_nome || '-'}</span>
                                            <span>{new Date(equipamento.data_cadastro).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 