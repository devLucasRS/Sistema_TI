import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Computer, 
    Search, 
    Edit, 
    Delete, 
    Add,
    FilterList,
    Visibility,
    Close,
    Save
} from '@mui/icons-material';
import api from '../../../services/api';
import Sidebar from '../../../components/Sidebar';
import Navbar from '../../../components/Navbar';
import './styles.css';

const GestaoInventario = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [equipamentos, setEquipamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEquipamento, setSelectedEquipamento] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [equipamentoEditando, setEquipamentoEditando] = useState(null);
    const [formData, setFormData] = useState({
        equipamento: '',
        modelo: '',
        numero_serie: '',
        estado: '',
        portador_id: null,
        observacao: ''
    });
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
        fetchEquipamentos();
        fetchUsers();
    }, []);

    const fetchEquipamentos = async () => {
        try {
            setLoading(true);
            const response = await api.get('/inventario');
            setEquipamentos(response.data);
            setError('');
        } catch (err) {
            setError('Erro ao carregar equipamentos');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);
            const response = await api.get('/usuarios');
            console.log('Usuários carregados:', response.data);
            setUsers(response.data);
        } catch (err) {
            console.error('Erro ao carregar usuários:', err);
            setError('Erro ao carregar lista de usuários');
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este equipamento?')) {
            try {
                await api.delete(`/inventario/${id}`);
                fetchEquipamentos();
            } catch (err) {
                setError('Erro ao excluir equipamento');
            }
        }
    };

    const filtrarEquipamentos = () => {
        return equipamentos.filter(equip => {
            const matchBusca = equip.equipamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             equip.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             equip.numero_serie.toLowerCase().includes(searchTerm.toLowerCase());
            
            const status = !equip.portador_id ? 'Disponível' : 'Em uso';
            const matchStatus = !statusFilter || status === statusFilter;

            return matchBusca && matchStatus;
        });
    };

    const getEstadoChipClass = (estado) => {
        switch (estado) {
            case 'Novo':
                return 'estado-chip novo';
            case 'Bom':
                return 'estado-chip bom';
            case 'Regular':
                return 'estado-chip regular';
            case 'Ruim':
                return 'estado-chip ruim';
            case 'Manutenção':
                return 'estado-chip manutencao';
            case 'Descartado':
                return 'estado-chip descartado';
            default:
                return 'estado-chip';
        }
    };

    const getStatusChipClass = (status) => {
        switch (status) {
            case 'Disponível':
                return 'status-chip disponivel';
            case 'Em uso':
                return 'status-chip em-uso';
            default:
                return 'status-chip';
        }
    };

    const getPortadorNome = (portador) => {
        if (!portador) return '-';
        
        if (typeof portador === 'number') return '-';
        
        if (portador.nome) return portador.nome;
        
        return '-';
    };

    const getPortadorStatus = (portador) => {
        return !portador ? 'Disponível' : 'Em uso';
    };

    const handleViewEquipamento = async (id) => {
        try {
            const response = await api.get(`/inventario/${id}`);
            console.log('Equipamento detalhes:', response.data);
            
            // Extrair o objeto equipamento da resposta
            const equipamentoData = response.data.equipamento;
            
            // Garantir que todos os campos são strings
            const equipamentoFormatado = {
                ...equipamentoData,
                data_cadastro: equipamentoData.data_cadastro ? new Date(equipamentoData.data_cadastro).toLocaleDateString() : '-',
                ultima_atualizacao: equipamentoData.ultima_atualizacao ? new Date(equipamentoData.ultima_atualizacao).toLocaleDateString() : '-',
                portador: equipamentoData.portador_id // Manter consistência com a lista
            };
            
            setSelectedEquipamento(equipamentoFormatado);
            setModalOpen(true);
        } catch (err) {
            console.error('Erro ao carregar detalhes:', err);
            setError('Erro ao carregar detalhes do equipamento');
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedEquipamento(null);
    };

    const handleEditEquipamento = async (id) => {
        try {
            const response = await api.get(`/inventario/${id}`);
            const equipamentoData = response.data.equipamento;
            console.log('Dados do equipamento para edição:', equipamentoData);
            
            setFormData({
                equipamento: equipamentoData.equipamento || '',
                modelo: equipamentoData.modelo || '',
                numero_serie: equipamentoData.numero_serie || '',
                estado: equipamentoData.estado || '',
                portador_id: equipamentoData.portador_id || null,
                observacao: equipamentoData.observacao || ''
            });
            
            setEquipamentoEditando(equipamentoData);
            setEditModalOpen(true);
        } catch (err) {
            console.error('Erro ao carregar dados para edição:', err);
            setError('Erro ao carregar dados do equipamento para edição');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/inventario/${equipamentoEditando.id}`, formData);
            setSuccess('Equipamento atualizado com sucesso!');
            setEditModalOpen(false);
            fetchEquipamentos();
        } catch (err) {
            console.error('Erro ao atualizar equipamento:', err);
            setError('Erro ao atualizar equipamento');
        }
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setEquipamentoEditando(null);
        setFormData({
            equipamento: '',
            modelo: '',
            numero_serie: '',
            estado: '',
            portador_id: null,
            observacao: ''
        });
    };

    if (!user) {
        return null;
    }

    return (
        <div className="app-container">
            <Sidebar user={user} />
            <div className="main-wrapper">
                <Navbar 
                    user={user}
                    pageTitle="Gestão de Inventário"
                    breadcrumbs={[
                        { label: 'Home', path: '/dashboard' },
                        { label: 'Inventário', path: '/inventario/gestao' }
                    ]}
                />
                <div className="content-wrapper">
                    <div className="page-header">
                        <Computer />
                        <div className="header-content">
                            <h1>Gestão de Inventário</h1>
                            <p className="subtitle">Gerencie os equipamentos do sistema</p>
                        </div>
                    </div>

                    <div className="filters-container">
                        <div className="filters-group">
                            <div className="search-field">
                                <Search />
                                <input
                                    type="text"
                                    placeholder="Buscar equipamento..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="filter-field">
                                <FilterList />
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                    <option value="">Todos os status</option>
                                    <option value="Disponível">Disponível</option>
                                    <option value="Em uso">Em uso</option>
                                </select>
                            </div>
                        </div>
                        <button className="btn-primary" onClick={() => navigate('/inventario/cadastrar')}>
                            <Add /> Novo Equipamento
                        </button>
                    </div>

                    {error && (
                        <div className="error-message">
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="success-message">
                            <span>{success}</span>
                        </div>
                    )}

                    {modalOpen && selectedEquipamento && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h2>Detalhes do Equipamento</h2>
                                    <button className="btn-icon" onClick={closeModal}>
                                        <Close />
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <label>Equipamento</label>
                                            <p>{selectedEquipamento.equipamento || '-'}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Modelo</label>
                                            <p>{selectedEquipamento.modelo || '-'}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Número de Série</label>
                                            <p>{selectedEquipamento.numero_serie || '-'}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Estado</label>
                                            <p>
                                                <span className={getEstadoChipClass(selectedEquipamento.estado)}>
                                                    {selectedEquipamento.estado || '-'}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Status</label>
                                            <p>
                                                <span className={getStatusChipClass(getPortadorStatus(selectedEquipamento.portador))}>
                                                    {getPortadorStatus(selectedEquipamento.portador)}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Portador</label>
                                            <p>{getPortadorNome(selectedEquipamento.portador)}</p>
                                        </div>
                                        <div className="detail-item full-width">
                                            <label>Observações</label>
                                            <p>{selectedEquipamento.observacao || '-'}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Data de Cadastro</label>
                                            <p>{selectedEquipamento.data_cadastro}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Última Atualização</label>
                                            <p>{selectedEquipamento.ultima_atualizacao}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="table-container">
                        {loading ? (
                            <div className="loading">Carregando...</div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Equipamento</th>
                                        <th>Modelo</th>
                                        <th>Número de Série</th>
                                        <th>Estado</th>
                                        <th>Status</th>
                                        <th>Portador</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtrarEquipamentos().map(equip => {
                                        console.log('Equipamento na lista:', equip);
                                        return (
                                            <tr key={equip.id}>
                                                <td>{equip.equipamento}</td>
                                                <td>{equip.modelo}</td>
                                                <td>{equip.numero_serie}</td>
                                                <td>
                                                    <span className={getEstadoChipClass(equip.estado)}>
                                                        {equip.estado}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={getStatusChipClass(getPortadorStatus(equip.portador))}>
                                                        {getPortadorStatus(equip.portador)}
                                                    </span>
                                                </td>
                                                <td>{getPortadorNome(equip.portador)}</td>
                                                <td className="actions">
                                                    <button 
                                                        className="btn-icon"
                                                        onClick={() => handleViewEquipamento(equip.id)}
                                                        title="Visualizar"
                                                    >
                                                        <Visibility />
                                                    </button>
                                                    <button 
                                                        className="btn-icon"
                                                        onClick={() => handleEditEquipamento(equip.id)}
                                                        title="Editar"
                                                    >
                                                        <Edit />
                                                    </button>
                                                    <button 
                                                        className="btn-icon delete"
                                                        onClick={() => handleDelete(equip.id)}
                                                        title="Excluir"
                                                    >
                                                        <Delete />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Edição */}
            {editModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Editar Equipamento</h2>
                            <button className="btn-icon" onClick={closeEditModal}>
                                <Close />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitEdit} className="modal-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Equipamento</label>
                                    <input
                                        type="text"
                                        name="equipamento"
                                        value={formData.equipamento}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Modelo</label>
                                    <input
                                        type="text"
                                        name="modelo"
                                        value={formData.modelo}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Número de Série</label>
                                    <input
                                        type="text"
                                        name="numero_serie"
                                        value={formData.numero_serie}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Estado</label>
                                    <select
                                        name="estado"
                                        value={formData.estado}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Selecione</option>
                                        <option value="Novo">Novo</option>
                                        <option value="Bom">Bom</option>
                                        <option value="Regular">Regular</option>
                                        <option value="Ruim">Ruim</option>
                                        <option value="Manutenção">Manutenção</option>
                                        <option value="Descartado">Descartado</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Portador</label>
                                    <select
                                        name="portador_id"
                                        value={formData.portador_id || ''}
                                        onChange={handleInputChange}
                                        disabled={loadingUsers}
                                    >
                                        <option value="">Nenhum</option>
                                        {loadingUsers ? (
                                            <option value="" disabled>Carregando usuários...</option>
                                        ) : (
                                            users.map(user => (
                                                <option key={user.id} value={user.id}>
                                                    {user.nome}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>
                                <div className="form-group full-width">
                                    <label>Observações</label>
                                    <textarea
                                        name="observacao"
                                        value={formData.observacao}
                                        onChange={handleInputChange}
                                        rows="3"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={closeEditModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    <Save /> Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestaoInventario; 