import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import { 
  Visibility,
  Subject,
  Category,
  AccessTime,
  Update,
  Description,
  CheckCircleOutline,
  Close,
  Person,
  Send,
  SupportAgent,
  AttachFile,
  Chat,
  Schedule,
  Image,
  PictureAsPdf,
  VideoLibrary
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './styles.css';

const MeusChamados = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState(null);
  const [novoComentario, setNovoComentario] = useState('');
  const [comentarios, setComentarios] = useState([]);
  const [loadingComentarios, setLoadingComentarios] = useState(false);
  const [anexosSelecionados, setAnexosSelecionados] = useState([]);
  const fileInputRef = useRef(null);

  // Dados mockados do atendente (será substituído pela integração com backend)
  const atendente = {
    nome: "João Silva",
    cargo: "Suporte Técnico",
    foto: "https://ui-avatars.com/api/?name=João+Silva&background=random"
  };

  useEffect(() => {
    fetchMeusChamados();
  }, []);

  const fetchMeusChamados = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/chamados/meus`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setChamados(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
      setError('Não foi possível carregar seus chamados. Por favor, tente novamente.');
      setLoading(false);
    }
  };

  const formatarData = (data) => {
    if (!data) return 'Data inválida';
    try {
        // Converte a string de data para objeto Date
        const date = new Date(data);
        
        // Verifica se a data é válida
        if (isNaN(date.getTime())) {
            return 'Data inválida';
        }

        // Formata a data e hora no padrão brasileiro
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(date);
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return 'Data inválida';
    }
  };

  const handleViewChamado = async (chamado) => {
    setChamadoSelecionado(chamado);
    setModalOpen(true);
    setLoadingComentarios(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/chamados/${chamado.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setChamadoSelecionado(response.data);
      setComentarios(response.data.comentarios || []);
    } catch (error) {
      console.error('Erro ao buscar detalhes do chamado:', error);
      setError('Não foi possível carregar os detalhes do chamado');
    } finally {
      setLoadingComentarios(false);
    }
  };

  const abrirModal = (chamado) => {
    setChamadoSelecionado(chamado);
    setModalOpen(true);
    // Mock de comentários (será substituído pela integração com backend)
    setComentarios([
      {
        id: 1,
        autor: "João Silva",
        cargo: "Suporte Técnico",
        texto: "Iniciando análise do seu chamado.",
        data: new Date(2024, 3, 3, 14, 30),
        foto: "https://ui-avatars.com/api/?name=João+Silva&background=random"
      }
    ]);
  };

  const fecharModal = () => {
    setModalOpen(false);
    setChamadoSelecionado(null);
    setNovoComentario('');
    setComentarios([]);
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setAnexosSelecionados(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index) => {
    setAnexosSelecionados(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image />;
    if (type.startsWith('video/')) return <VideoLibrary />;
    if (type === 'application/pdf') return <PictureAsPdf />;
    return <AttachFile />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleAdicionarComentario = async () => {
    if (!novoComentario.trim() && anexosSelecionados.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('texto', novoComentario);
      
      // Adiciona os anexos ao FormData
      anexosSelecionados.forEach(file => {
        formData.append('anexos', file);
      });

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/chamados/${chamadoSelecionado.id}/comentarios`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Adiciona o novo comentário à lista
      setComentarios(prev => [...prev, response.data]);
      setNovoComentario('');
      setAnexosSelecionados([]);
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      if (error.response?.status === 403) {
        alert('Você não tem permissão para comentar neste chamado.');
      } else {
        alert('Erro ao adicionar comentário. Tente novamente.');
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'aberto':
        return <CheckCircleOutline style={{ fontSize: 18 }} />;
      case 'em-andamento':
        return <Update style={{ fontSize: 18 }} />;
      case 'fechado':
        return <Close style={{ fontSize: 18 }} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <Sidebar user={user} />
      <div className="main-wrapper">
        <Navbar user={user} />
        <div className="content-wrapper">
          <div className="meus-chamados-container">
            <div className="meus-chamados-header">
              <h1>Meus Chamados</h1>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
              <div className="loading-message">Carregando chamados...</div>
            ) : chamados.length === 0 ? (
              <div className="empty-message">
                Você ainda não possui chamados abertos.
              </div>
            ) : (
              <div className="chamados-table-container">
                <table className="chamados-table">
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Assunto</th>
                      <th>Categoria</th>
                      <th>Status</th>
                      <th>Data de Abertura</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chamados.map((chamado) => (
                      <tr key={chamado.id}>
                        <td>#{chamado.id.toString().padStart(5, '0')}</td>
                        <td>{chamado.assunto}</td>
                        <td>{chamado.categoria}</td>
                        <td>
                          <span className={`status-badge ${chamado.status.toLowerCase()}`}>
                            {getStatusIcon(chamado.status)}
                            {chamado.status}
                          </span>
                        </td>
                        <td>{formatarData(chamado.data_abertura)}</td>
                        <td>
                          <button 
                            className="view-button"
                            onClick={() => handleViewChamado(chamado)}
                            title="Ver detalhes"
                          >
                            <Visibility />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {modalOpen && chamadoSelecionado && (
              <div className="modal-overlay" onClick={() => {
                setModalOpen(false);
                setNovoComentario('');
                setComentarios([]);
                setAnexosSelecionados([]);
              }}>
                <div className="modal-content zendesk-style" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <div className="modal-title">
                      <h2>
                        <span>Chamado #{chamadoSelecionado.id.toString().padStart(5, '0')}</span>
                      </h2>
                      <span className={`status-badge ${chamadoSelecionado.status.toLowerCase()}`}>
                        {getStatusIcon(chamadoSelecionado.status)}
                        {chamadoSelecionado.status}
                      </span>
                    </div>
                    <button className="close-button" onClick={() => {
                      setModalOpen(false);
                      setNovoComentario('');
                      setComentarios([]);
                      setAnexosSelecionados([]);
                    }}>&times;</button>
                  </div>

                  <div className="modal-body">
                    <div className="modal-sidebar">
                      <div className="ticket-details">
                        <h3>Detalhes do Chamado</h3>
                        <div className="detail-item">
                          <Subject className="detail-icon" />
                          <div>
                            <label>Assunto</label>
                            <span>{chamadoSelecionado.assunto}</span>
                          </div>
                        </div>
                        <div className="detail-item">
                          <Category className="detail-icon" />
                          <div>
                            <label>Categoria</label>
                            <span>{chamadoSelecionado.categoria}</span>
                          </div>
                        </div>
                        <div className="detail-item">
                          <AccessTime className="detail-icon" />
                          <div>
                            <label>Aberto em</label>
                            <span>{format(new Date(chamadoSelecionado.data_abertura), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                          </div>
                        </div>
                        <div className="detail-item">
                          <Person className="detail-icon" />
                          <div>
                            <label>Solicitante</label>
                            <span>{chamadoSelecionado.solicitante}</span>
                          </div>
                        </div>
                        <div className="detail-item">
                          <SupportAgent className="detail-icon" />
                          <div>
                            <label>Atendente</label>
                            <div className="atendente-info">
                              {chamadoSelecionado.atendente && chamadoSelecionado.atendente !== 'Aguardando atendimento' ? (
                                <>
                                  <img 
                                    src={`https://ui-avatars.com/api/?name=${chamadoSelecionado.atendente.replace(' ', '+')}&background=random`} 
                                    alt={chamadoSelecionado.atendente} 
                                    className="avatar" 
                                  />
                                  <div>
                                    <span className="nome">{chamadoSelecionado.atendente}</span>
                                    <span className="cargo">{chamadoSelecionado.cargo_atendente}</span>
                                  </div>
                                </>
                              ) : (
                                <div>
                                  <span className="nome">Aguardando atendimento</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="modal-main">
                      <div className="ticket-description">
                        <h3>Descrição</h3>
                        <p>{chamadoSelecionado.descricao}</p>
                      </div>

                      {chamadoSelecionado.anexos && chamadoSelecionado.anexos.length > 0 && (
                        <div className="anexos-section">
                          <h3>Anexos do Chamado</h3>
                          <div className="anexos-list">
                            {chamadoSelecionado.anexos.map((anexo) => (
                              <a 
                                key={anexo.id}
                                href={`${process.env.REACT_APP_API_URL}/${anexo.caminho_arquivo}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="anexo-item"
                              >
                                {getFileIcon(anexo.tipo_arquivo)}
                                <span>{anexo.nome_arquivo}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="ticket-comments">
                        <h3>
                          <Chat style={{ fontSize: 20, marginRight: 8, verticalAlign: 'middle' }} />
                          Comentários
                        </h3>
                        <div className="comments-list">
                          {loadingComentarios ? (
                            <div className="loading">Carregando comentários...</div>
                          ) : (
                            <>
                              {comentarios.map((comentario) => (
                                <div key={comentario.id} className="comment">
                                  <img src={comentario.foto} alt={comentario.autor} className="avatar" />
                                  <div className="comment-content">
                                    <div className="comment-header">
                                      <div>
                                        <span className="author">{comentario.autor}</span>
                                        <span className="role">{comentario.cargo}</span>
                                      </div>
                                      <span className="date">
                                        <Schedule style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }} />
                                        {format(new Date(comentario.data), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                      </span>
                                    </div>
                                    <div className="comment-text">{comentario.texto}</div>
                                    {comentario.anexos && comentario.anexos.length > 0 && (
                                      <div className="comment-attachments">
                                        {comentario.anexos.map((anexo, index) => (
                                          <a 
                                            key={anexo.id || index}
                                            href={`${process.env.REACT_APP_API_URL}/${anexo.caminho_arquivo}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="attachment-item"
                                          >
                                            {getFileIcon(anexo.tipo_arquivo)}
                                            <span className="attachment-name">{anexo.nome_arquivo}</span>
                                          </a>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                              
                              <div className="novo-comentario">
                                <textarea
                                  value={novoComentario}
                                  onChange={(e) => setNovoComentario(e.target.value)}
                                  placeholder="Digite seu comentário..."
                                  rows="3"
                                />
                                <div className="comment-actions">
                                  <div className="selected-files">
                                    {anexosSelecionados.map((file, index) => (
                                      <div key={index} className="selected-file">
                                        {getFileIcon(file.type)}
                                        <span className="file-name">{file.name}</span>
                                        <span className="file-size">({formatFileSize(file.size)})</span>
                                        <button onClick={() => handleRemoveFile(index)} className="remove-file">
                                          &times;
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="comment-buttons">
                                    <button 
                                      className="attach-button"
                                      onClick={() => fileInputRef.current.click()}
                                      title="Anexar arquivos"
                                    >
                                      <AttachFile />
                                    </button>
                                    <input
                                      type="file"
                                      ref={fileInputRef}
                                      onChange={handleFileSelect}
                                      multiple
                                      style={{ display: 'none' }}
                                    />
                                    <button 
                                      className="send-button"
                                      onClick={handleAdicionarComentario}
                                      disabled={!novoComentario.trim() && anexosSelecionados.length === 0}
                                    >
                                      <Send />
                                      Enviar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeusChamados; 