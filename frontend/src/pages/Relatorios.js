import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Relatorios/styles.css';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { 
    AccessTime,
    Category,
    People,
    TrendingUp,
    TrendingDown,
    Warning,
    CheckCircle,
    CalendarToday,
    Timeline,
    Search,
    FilterList
} from '@mui/icons-material';

const Relatorios = () => {
    const [user, setUser] = useState(null);
    const [tempoMedio, setTempoMedio] = useState(0);
    const [chamadosPorStatus, setChamadosPorStatus] = useState([]);
    const [chamadosPorDia, setChamadosPorDia] = useState([]);
    const [taxaResolucao, setTaxaResolucao] = useState(0);
    const [rankingCategorias, setRankingCategorias] = useState([]);
    const [rankingAtendentes, setRankingAtendentes] = useState([]);
    const [chamados, setChamados] = useState([]);
    const [filtros, setFiltros] = useState({
        status: '',
        categoria: '',
        dataInicio: '',
        dataFim: '',
        busca: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
        fetchData();
    }, []);

    const fetchData = async (filtrosAtuais = null) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const params = filtrosAtuais || filtros;

            const [
                tempoMedioRes,
                statusRes,
                diasRes,
                taxaRes,
                categoriasRes,
                atendentesRes,
                chamadosRes
            ] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API_URL}/api/relatorios/tempo-medio-atendimento`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params
                }),
                axios.get(`${process.env.REACT_APP_API_URL}/api/relatorios/chamados-por-status`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params
                }),
                axios.get(`${process.env.REACT_APP_API_URL}/api/relatorios/chamados-por-dia`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params
                }),
                axios.get(`${process.env.REACT_APP_API_URL}/api/relatorios/taxa-resolucao`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params
                }),
                axios.get(`${process.env.REACT_APP_API_URL}/api/relatorios/ranking-categorias`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params
                }),
                axios.get(`${process.env.REACT_APP_API_URL}/api/relatorios/ranking-atendentes`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params
                }),
                axios.get(`${process.env.REACT_APP_API_URL}/api/relatorios/chamados`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params
                })
            ]);

            setTempoMedio(Number(tempoMedioRes.data.tempo_medio) || 0);
            setChamadosPorStatus(statusRes.data || []);
            setChamadosPorDia(diasRes.data || []);
            setTaxaResolucao(Number(taxaRes.data.taxa_resolucao) || 0);
            setRankingCategorias(categoriasRes.data || []);
            setRankingAtendentes(atendentesRes.data || []);
            setChamados(chamadosRes.data || []);
            setError('');
        } catch (error) {
            setError('Erro ao carregar relatórios. Por favor, tente novamente.');
            console.error('Erro ao carregar relatórios:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFiltroSubmit = (e) => {
        e.preventDefault();
        fetchData(filtros);
    };

    const formatarData = (data) => {
        return new Date(data).toLocaleDateString('pt-BR');
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
                <Navbar 
                    user={user}
                    pageTitle="Relatórios"
                    breadcrumbs={[
                        { label: 'Home', path: '/dashboard' },
                        { label: 'Relatórios', path: '/relatorios' }
                    ]}
                />
                <div className="content-wrapper">
                    <div className="page-header">
                        <div className="header-content">
                            <h1>Relatórios</h1>
                            <p className="subtitle">Análise e métricas do sistema</p>
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            <Warning />
                            {error}
                        </div>
                    )}

                    <div className="filtros-container">
                        <form onSubmit={handleFiltroSubmit} className="filtros-form">
                            <div className="filtro-group">
                                <label htmlFor="status">Status</label>
                                <select 
                                    id="status" 
                                    name="status" 
                                    value={filtros.status}
                                    onChange={handleFiltroChange}
                                >
                                    <option value="">Todos</option>
                                    <option value="Aberto">Aberto</option>
                                    <option value="Em Andamento">Em Andamento</option>
                                    <option value="Fechado">Fechado</option>
                                </select>
                            </div>

                            <div className="filtro-group">
                                <label htmlFor="categoria">Categoria</label>
                                <select 
                                    id="categoria" 
                                    name="categoria" 
                                    value={filtros.categoria}
                                    onChange={handleFiltroChange}
                                >
                                    <option value="">Todas</option>
                                    {rankingCategorias.map((cat, index) => (
                                        <option key={index} value={cat.categoria}>
                                            {cat.categoria}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filtro-group">
                                <label htmlFor="dataInicio">Data Início</label>
                                <input 
                                    type="date" 
                                    id="dataInicio" 
                                    name="dataInicio" 
                                    value={filtros.dataInicio}
                                    onChange={handleFiltroChange}
                                />
                            </div>

                            <div className="filtro-group">
                                <label htmlFor="dataFim">Data Fim</label>
                                <input 
                                    type="date" 
                                    id="dataFim" 
                                    name="dataFim" 
                                    value={filtros.dataFim}
                                    onChange={handleFiltroChange}
                                />
                            </div>

                            <div className="filtro-group">
                                <label htmlFor="busca">Busca</label>
                                <div className="search-input">
                                    <input 
                                        type="text" 
                                        id="busca" 
                                        name="busca" 
                                        placeholder="Pesquisar..."
                                        value={filtros.busca}
                                        onChange={handleFiltroChange}
                                    />
                                    <Search className="search-icon" />
                                </div>
                            </div>

                            <button type="submit" className="filtro-button">
                                <FilterList />
                                Aplicar Filtros
                            </button>
                        </form>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="loading">Carregando relatórios...</div>
                        </div>
                    ) : (
                        <div className="relatorios-container">
                            <div className="stats-cards">
                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <AccessTime />
                                    </div>
                                    <div className="stat-info">
                                        <h3>Tempo Médio de Atendimento</h3>
                                        <span className="stat-value">
                                            {tempoMedio.toFixed(1)}h
                                        </span>
                                        <span className="stat-description">Tempo médio desde a abertura até o fechamento do chamado</span>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <CheckCircle />
                                    </div>
                                    <div className="stat-info">
                                        <h3>Taxa de Resolução</h3>
                                        <span className="stat-value">
                                            {taxaResolucao.toFixed(1)}%
                                        </span>
                                        <span className="stat-description">Percentual de chamados resolvidos</span>
                                    </div>
                                </div>
                            </div>

                            <div className="tables-container">
                                <div className="table-section">
                                    <h2 className="table-title">
                                        <Timeline className="table-icon" />
                                        Chamados por Status
                                    </h2>
                                    <div className="table-wrapper">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Status</th>
                                                    <th>Total de Chamados</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {chamadosPorStatus.length > 0 ? (
                                                    chamadosPorStatus.map((item, index) => (
                                                        <tr key={index}>
                                                            <td>{item.status}</td>
                                                            <td>{item.total}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="2" className="no-data">Nenhum dado disponível</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="table-section">
                                    <h2 className="table-title">
                                        <CalendarToday className="table-icon" />
                                        Chamados por Dia da Semana
                                    </h2>
                                    <div className="table-wrapper">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Dia da Semana</th>
                                                    <th>Total de Chamados</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {chamadosPorDia.length > 0 ? (
                                                    chamadosPorDia.map((item, index) => (
                                                        <tr key={index}>
                                                            <td>{item.dia_semana}</td>
                                                            <td>{item.total}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="2" className="no-data">Nenhum dado disponível</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="table-section chamados-table">
                                <h2 className="table-title">
                                    <Timeline className="table-icon" />
                                    Lista de Chamados
                                </h2>
                                <div className="table-wrapper">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Assunto</th>
                                                <th>Categoria</th>
                                                <th>Status</th>
                                                <th>Data Abertura</th>
                                                <th>Data Atualização</th>
                                                <th>Atendente</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {chamados.length > 0 ? (
                                                chamados.map((chamado) => (
                                                    <tr key={chamado.id}>
                                                        <td>{chamado.id}</td>
                                                        <td>{chamado.assunto}</td>
                                                        <td>{chamado.categoria}</td>
                                                        <td>
                                                            <span className={`status-badge status-${chamado.status.toLowerCase()}`}>
                                                                {chamado.status}
                                                            </span>
                                                        </td>
                                                        <td>{formatarData(chamado.data_abertura)}</td>
                                                        <td>{formatarData(chamado.data_atualizacao)}</td>
                                                        <td>{chamado.atendente || '-'}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="no-data">Nenhum chamado encontrado</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="stats-cards">
                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <Category />
                                    </div>
                                    <div className="stat-info">
                                        <h3>Ranking por Categoria</h3>
                                        <div className="ranking-list">
                                            {rankingCategorias.length > 0 ? (
                                                rankingCategorias.map((item, index) => (
                                                    <div key={index} className="ranking-item">
                                                        <span className="ranking-position">{index + 1}º</span>
                                                        <span className="ranking-name">{item.categoria}</span>
                                                        <span className="ranking-value">{item.total} chamados</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="no-data">Nenhum dado disponível</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <People />
                                    </div>
                                    <div className="stat-info">
                                        <h3>Ranking de Atendentes</h3>
                                        <div className="ranking-list">
                                            {rankingAtendentes.length > 0 ? (
                                                rankingAtendentes.map((item, index) => (
                                                    <div key={index} className="ranking-item">
                                                        <span className="ranking-position">{index + 1}º</span>
                                                        <span className="ranking-name">{item.atendente}</span>
                                                        <span className="ranking-value">{item.total_atendimentos} atendimentos</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="no-data">Nenhum dado disponível</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Relatorios; 