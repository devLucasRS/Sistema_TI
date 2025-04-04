const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/database');
const { auth } = require('../middleware/auth');

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determinar a pasta de destino baseado no tipo de upload
    let uploadPath = 'uploads/';
    if (req.baseUrl.includes('comentarios')) {
      uploadPath += 'comentarios/';
    } else {
      uploadPath += 'chamados/';
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Rota para listar todos os chamados
router.get('/', auth, async (req, res) => {
  try {
    const [chamados] = await db.query(`
      SELECT 
        c.*,
        u.nome as solicitante,
        CASE 
          WHEN c.status = 'Aberto' AND TIMESTAMPDIFF(HOUR, c.data_abertura, NOW()) > 24 THEN 1
          ELSE 0
        END as sla_estourado
      FROM chamados c
      JOIN usuarios u ON c.solicitante_id = u.id
      ORDER BY c.data_abertura DESC
    `);

    res.json(chamados);
  } catch (error) {
    console.error('Erro ao buscar chamados:', error);
    res.status(500).json({ message: 'Erro ao buscar chamados' });
  }
});

// Rota para buscar chamados do usuário logado
router.get('/meus', auth, async (req, res) => {
  try {
    const [chamados] = await db.query(
      `SELECT 
        c.*,
        u.nome as solicitante,
        CASE 
          WHEN c.status = 'Aberto' AND TIMESTAMPDIFF(HOUR, c.data_abertura, NOW()) > 24 THEN 1
          ELSE 0
        END as sla_estourado
      FROM chamados c
      JOIN usuarios u ON c.solicitante_id = u.id
      WHERE c.solicitante_id = ?
      ORDER BY c.data_abertura DESC`,
      [req.user.id]
    );

    res.json(chamados);
  } catch (error) {
    console.error('Erro ao buscar chamados:', error);
    res.status(500).json({ message: 'Erro ao buscar chamados' });
  }
});

// Rota para criar novo chamado
router.post('/', auth, upload.single('anexo'), async (req, res) => {
  try {
    const { assunto, categoria, descricao } = req.body;
    const solicitante_id = req.user.id;

    // Primeiro inserir o chamado
    const [result] = await db.query(
      'INSERT INTO chamados (solicitante_id, assunto, categoria, descricao, status) VALUES (?, ?, ?, ?, ?)',
      [solicitante_id, assunto, categoria, descricao, 'Aberto']
    );

    const chamadoId = result.insertId;

    // Se houver anexo, salvar na tabela de anexos
    if (req.file) {
      await db.query(
        `INSERT INTO anexos_chamados (chamado_id, nome_arquivo, caminho_arquivo, tipo_arquivo, tamanho_arquivo) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          chamadoId,
          req.file.originalname,
          req.file.path,
          req.file.mimetype,
          req.file.size
        ]
      );
    }

    // Buscar o chamado criado para retornar
    const [chamado] = await db.query(
      'SELECT * FROM chamados WHERE id = ?',
      [chamadoId]
    );

    res.status(201).json(chamado[0]);
  } catch (error) {
    console.error('Erro ao criar chamado:', error);
    res.status(500).json({ message: 'Erro ao criar chamado' });
  }
});

// Rota para gestão de chamados (apenas para técnicos e administradores)
router.get('/gestao', auth, async (req, res) => {
  try {
    // Verificar se o usuário é um técnico ou administrador
    if (req.user.cargo !== 'Técnico' && req.user.cargo !== 'Administrador') {
      return res.status(403).json({ message: 'Acesso não autorizado' });
    }

    const [chamados] = await db.query(`
      SELECT 
        c.*,
        u.nome as solicitante,
        IF(
          c.status = 'Aberto' AND TIMESTAMPDIFF(HOUR, c.data_abertura, NOW()) > 24,
          1,
          0
        ) as sla_estourado
      FROM chamados c 
      JOIN usuarios u ON c.solicitante_id = u.id 
      ORDER BY c.data_abertura DESC
    `);

    res.json(chamados);
  } catch (error) {
    console.error('Erro ao buscar chamados:', error);
    res.status(500).json({ message: 'Erro ao buscar chamados' });
  }
});

// Rota para buscar detalhes de um chamado específico
router.get('/:id', auth, async (req, res) => {
  try {
    // Buscar informações do chamado
    const [chamado] = await db.query(
      `SELECT 
        c.*,
        u.nome as solicitante,
        u.cargo as cargo_solicitante,
        t.nome as atendente,
        t.cargo as cargo_atendente,
        CASE 
          WHEN c.status = 'Aberto' AND TIMESTAMPDIFF(HOUR, c.data_abertura, NOW()) > 24 THEN 1
          ELSE 0
        END as sla_estourado
      FROM chamados c
      JOIN usuarios u ON c.solicitante_id = u.id
      LEFT JOIN usuarios t ON c.atendente_id = t.id
      WHERE c.id = ?`,
      [req.params.id]
    );

    if (!chamado[0]) {
      return res.status(404).json({ message: 'Chamado não encontrado' });
    }

    // Buscar anexos do chamado
    const [anexos] = await db.query(
      'SELECT * FROM anexos_chamados WHERE chamado_id = ?',
      [req.params.id]
    );

    // Buscar comentários do chamado
    const [comentarios] = await db.query(
      `SELECT 
        c.id,
        c.texto,
        u.nome as autor,
        u.cargo as cargo,
        DATE_FORMAT(c.data_comentario, '%Y-%m-%d %H:%i:%s') as data
      FROM comentarios_chamados c
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.chamado_id = ?
      ORDER BY c.data_comentario ASC`,
      [req.params.id]
    );

    // Buscar anexos dos comentários
    const [anexosComentarios] = await db.query(
      `SELECT 
        ac.*,
        ac.comentario_id
      FROM anexos_comentarios ac
      WHERE ac.comentario_id IN (
        SELECT id FROM comentarios_chamados WHERE chamado_id = ?
      )`,
      [req.params.id]
    );

    // Agrupar anexos por comentário
    const anexosPorComentario = anexosComentarios.reduce((acc, anexo) => {
      if (!acc[anexo.comentario_id]) {
        acc[anexo.comentario_id] = [];
      }
      acc[anexo.comentario_id].push({
        id: anexo.id,
        nome_arquivo: anexo.nome_arquivo,
        caminho_arquivo: anexo.caminho_arquivo,
        tipo_arquivo: anexo.tipo_arquivo,
        tamanho_arquivo: anexo.tamanho_arquivo
      });
      return acc;
    }, {});

    // Formatar os comentários para incluir a foto e os anexos
    const comentariosFormatados = comentarios.map(comentario => ({
      ...comentario,
      foto: `https://ui-avatars.com/api/?name=${comentario.autor.replace(' ', '+')}&background=random`,
      anexos: anexosPorComentario[comentario.id] || []
    }));

    // Formatar os dados para retornar
    const chamadoDetalhado = {
      ...chamado[0],
      atendente: chamado[0].atendente || 'Aguardando atendimento',
      cargo_atendente: chamado[0].cargo_atendente || '',
      anexos: anexos,
      comentarios: comentariosFormatados
    };

    res.json(chamadoDetalhado);
  } catch (error) {
    console.error('Erro ao buscar detalhes do chamado:', error);
    res.status(500).json({ message: 'Erro ao buscar detalhes do chamado' });
  }
});

// Rota para adicionar comentário em um chamado
router.post('/:id/comentarios', auth, upload.array('anexos', 5), async (req, res) => {
    try {
        const { id } = req.params;
        const { texto } = req.body;
        const usuario_id = req.user.id;

        // Verifica se o chamado existe
        const [chamado] = await db.query(
            'SELECT * FROM chamados WHERE id = ?',
            [id]
        );

        if (!chamado[0]) {
            return res.status(404).json({ message: 'Chamado não encontrado' });
        }

        // Verifica se o usuário é o solicitante, atendente ou administrador
        const [permissoes] = await db.query(
            'SELECT * FROM chamados WHERE id = ? AND (solicitante_id = ? OR atendente_id = ? OR ? IN (SELECT id FROM usuarios WHERE cargo = "Administrador"))',
            [id, usuario_id, usuario_id, usuario_id]
        );

        if (permissoes.length === 0) {
            return res.status(403).json({ message: 'Você não tem permissão para comentar neste chamado' });
        }

        // Insere o comentário com a data atual
        const [result] = await db.query(
            'INSERT INTO comentarios_chamados (chamado_id, usuario_id, texto, data_comentario) VALUES (?, ?, ?, NOW())',
            [id, usuario_id, texto]
        );

        const comentarioId = result.insertId;

        // Se houver anexos, salvar na tabela de anexos
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                await db.query(
                    `INSERT INTO anexos_comentarios 
                    (comentario_id, nome_arquivo, caminho_arquivo, tipo_arquivo, tamanho_arquivo) 
                    VALUES (?, ?, ?, ?, ?)`,
                    [
                        comentarioId,
                        file.originalname,
                        file.path,
                        file.mimetype,
                        file.size
                    ]
                );
            }
        }

        // Busca o comentário inserido com os dados do usuário, formata a data e inclui os anexos
        const [comentario] = await db.query(
            `SELECT 
                c.id,
                c.texto,
                u.nome as autor,
                u.cargo as cargo,
                DATE_FORMAT(c.data_comentario, '%Y-%m-%d %H:%i:%s') as data
             FROM comentarios_chamados c 
             JOIN usuarios u ON c.usuario_id = u.id 
             WHERE c.id = ?`,
            [comentarioId]
        );

        // Busca os anexos do comentário
        const [anexos] = await db.query(
            `SELECT id, nome_arquivo, caminho_arquivo, tipo_arquivo
             FROM anexos_comentarios
             WHERE comentario_id = ?`,
            [comentarioId]
        );

        // Garante que o comentário foi encontrado
        if (!comentario[0]) {
            throw new Error('Erro ao recuperar o comentário criado');
        }

        // Adiciona a foto e os anexos ao comentário
        const comentarioFormatado = {
            ...comentario[0],
            foto: `https://ui-avatars.com/api/?name=${comentario[0].autor.replace(' ', '+')}&background=random`,
            anexos: anexos
        };

        res.status(201).json(comentarioFormatado);
    } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        res.status(500).json({ message: 'Erro ao adicionar comentário' });
    }
});

// Rota para iniciar atendimento de um chamado
router.post('/:id/iniciar-atendimento', auth, async (req, res) => {
  try {
    // Verificar se o usuário é um técnico ou administrador
    if (req.user.cargo !== 'Técnico' && req.user.cargo !== 'Administrador') {
      return res.status(403).json({ message: 'Apenas técnicos podem iniciar atendimentos' });
    }

    const chamadoId = req.params.id;
    const atendenteId = req.user.id;

    // Verificar se o chamado existe e está aberto
    const [chamado] = await db.query(
      'SELECT * FROM chamados WHERE id = ?',
      [chamadoId]
    );

    if (!chamado[0]) {
      return res.status(404).json({ message: 'Chamado não encontrado' });
    }

    if (chamado[0].status !== 'Aberto') {
      return res.status(400).json({ message: 'Este chamado não está disponível para atendimento' });
    }

    // Atualizar o chamado com o atendente e mudar o status para "Em Andamento"
    await db.query(
      'UPDATE chamados SET atendente_id = ?, status = ?, data_atualizacao = NOW() WHERE id = ?',
      [atendenteId, 'Em Andamento', chamadoId]
    );

    // Adicionar um comentário automático
    await db.query(
      'INSERT INTO comentarios_chamados (chamado_id, usuario_id, texto, data_comentario) VALUES (?, ?, ?, NOW())',
      [chamadoId, atendenteId, 'Atendimento iniciado']
    );

    res.json({ message: 'Atendimento iniciado com sucesso' });
  } catch (error) {
    console.error('Erro ao iniciar atendimento:', error);
    res.status(500).json({ message: 'Erro ao iniciar atendimento' });
  }
});

// Rota para reabrir um chamado fechado
router.post('/:id/reabrir', auth, async (req, res) => {
  try {
    const chamadoId = req.params.id;
    const usuarioId = req.user.id;

    // Verificar se o chamado existe e está fechado
    const [chamado] = await db.query(
      'SELECT * FROM chamados WHERE id = ?',
      [chamadoId]
    );

    if (!chamado[0]) {
      return res.status(404).json({ message: 'Chamado não encontrado' });
    }

    if (chamado[0].status !== 'Fechado') {
      return res.status(400).json({ message: 'Este chamado não está fechado' });
    }

    // Verificar se o usuário é o solicitante ou um administrador
    const [permissoes] = await db.query(
      'SELECT * FROM chamados WHERE id = ? AND (solicitante_id = ? OR ? IN (SELECT id FROM usuarios WHERE cargo = "Administrador"))',
      [chamadoId, usuarioId, usuarioId]
    );

    if (permissoes.length === 0) {
      return res.status(403).json({ message: 'Você não tem permissão para reabrir este chamado' });
    }

    // Atualizar o chamado para status "Aberto"
    await db.query(
      'UPDATE chamados SET status = ?, data_atualizacao = NOW() WHERE id = ?',
      ['Aberto', chamadoId]
    );

    // Adicionar um comentário automático
    await db.query(
      'INSERT INTO comentarios_chamados (chamado_id, usuario_id, texto, data_comentario) VALUES (?, ?, ?, NOW())',
      [chamadoId, usuarioId, 'Chamado reaberto']
    );

    res.json({ message: 'Chamado reaberto com sucesso' });
  } catch (error) {
    console.error('Erro ao reabrir chamado:', error);
    res.status(500).json({ message: 'Erro ao reabrir chamado' });
  }
});

// Rota para finalizar atendimento de um chamado
router.post('/:id/finalizar-atendimento', auth, async (req, res) => {
  try {
    const { acao_tomada } = req.body;

    if (!acao_tomada || !acao_tomada.trim()) {
      return res.status(400).json({ message: 'A ação tomada é obrigatória para finalizar o atendimento' });
    }

    // Verificar se o usuário é um técnico ou administrador
    if (req.user.cargo !== 'Técnico' && req.user.cargo !== 'Administrador') {
      return res.status(403).json({ message: 'Apenas técnicos podem finalizar atendimentos' });
    }

    const chamadoId = req.params.id;
    const atendenteId = req.user.id;

    // Verificar se o chamado existe e está em andamento
    const [chamado] = await db.query(
      'SELECT * FROM chamados WHERE id = ?',
      [chamadoId]
    );

    if (!chamado[0]) {
      return res.status(404).json({ message: 'Chamado não encontrado' });
    }

    if (chamado[0].status !== 'Em Andamento' && chamado[0].status !== 'em andamento') {
      return res.status(400).json({ message: 'Este chamado não está em andamento' });
    }

    // Verificar se o usuário é o atendente do chamado
    if (chamado[0].atendente_id !== atendenteId) {
      return res.status(403).json({ message: 'Apenas o atendente responsável pode finalizar este chamado' });
    }

    // Atualizar o chamado para status "Fechado"
    await db.query(
      'UPDATE chamados SET status = ?, data_atualizacao = NOW(), data_fechamento = NOW() WHERE id = ?',
      ['Fechado', chamadoId]
    );

    // Adicionar um comentário com a ação tomada
    await db.query(
      'INSERT INTO comentarios_chamados (chamado_id, usuario_id, texto, data_comentario) VALUES (?, ?, ?, NOW())',
      [chamadoId, atendenteId, `Atendimento finalizado. Ação tomada: ${acao_tomada}`]
    );

    res.json({ message: 'Atendimento finalizado com sucesso' });
  } catch (error) {
    console.error('Erro ao finalizar atendimento:', error);
    res.status(500).json({ message: 'Erro ao finalizar atendimento' });
  }
});

module.exports = router; 