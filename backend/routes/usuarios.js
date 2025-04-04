const express = require('express');
const router = express.Router();
const pool = require('../database');

// Listar todos os usuários
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nome, email, tipo, data_cadastro
      FROM usuarios
      ORDER BY id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ message: 'Erro ao listar usuários' });
  }
});

// Criar novo usuário
router.post('/', async (req, res) => {
  const { nome, email, senha, tipo } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha, tipo)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nome, email, tipo, data_cadastro`,
      [nome, email, senha, tipo]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro ao criar usuário' });
  }
});

// Atualizar usuário
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, tipo } = req.body;
  try {
    const result = await pool.query(
      `UPDATE usuarios
       SET nome = $1, email = $2, tipo = $3
       WHERE id = $4
       RETURNING id, nome, email, tipo, data_cadastro`,
      [nome, email, tipo, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
});

// Excluir usuário
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ message: 'Erro ao excluir usuário' });
  }
});

module.exports = router; 