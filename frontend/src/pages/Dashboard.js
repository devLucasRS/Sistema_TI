import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { 
    Computer, 
    Assignment, 
    People, 
    Warning, 
    CheckCircle,
    TrendingUp,
    TrendingDown
} from '@mui/icons-material';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const [usuariosRes] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API_URL}/api/usuarios`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const usuarios = usuariosRes.data;

    
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="loading-container">
                <div className="loading">Carregando...</div>
            </div>
        );
    }



    return (
        <div className="app-container">
            <Sidebar user={user} />
            <div className="main-wrapper">
                <Navbar user={user} />
                <div className="content-wrapper">
                    <div className="dashboard-header">
                        <h1>Bem-vindo(a), {user.nome}!</h1>
                    </div>

                
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 