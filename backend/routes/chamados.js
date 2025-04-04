const express = require('express');
const router = express.Router();
const pool = require('../database');

// Listar todos os chamados
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.nome as solicitante_nome
      FROM chamados c
      LEFT JOIN usuarios u ON c.solicitante_id = u.id
      ORDER BY c.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar chamados:', error);
    res.status(500).json({ message: 'Erro ao listar chamados' });
  }
});

// Criar novo chamado
router.post('/', async (req, res) => {
  const { titulo, descricao, solicitante_id, status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO chamados (titulo, descricao, solicitante_id, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [titulo, descricao, solicitante_id, status || 'aberto']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar chamado:', error);
    res.status(500).json({ message: 'Erro ao criar chamado' });
  }
});

// Atualizar chamado
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE chamados
       SET titulo = $1, descricao = $2, status = $3
       WHERE id = $4
       RETURNING *`,
      [titulo, descricao, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Chamado não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar chamado:', error);
    res.status(500).json({ message: 'Erro ao atualizar chamado' });
  }
});

// Excluir chamado
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM chamados WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Chamado não encontrado' });
    }
    res.json({ message: 'Chamado excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir chamado:', error);
    res.status(500).json({ message: 'Erro ao excluir chamado' });
  }
});

module.exports = router; 