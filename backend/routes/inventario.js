const express = require('express');
const router = express.Router();
const pool = require('../database');

// Listar todos os equipamentos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, u.nome as portador_nome
      FROM equipamentos e
      LEFT JOIN usuarios u ON e.portador_id = u.id
      ORDER BY e.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar equipamentos:', error);
    res.status(500).json({ message: 'Erro ao listar equipamentos' });
  }
});

// Criar novo equipamento
router.post('/', async (req, res) => {
  const { equipamento, modelo, numero_serie, portador_id, estado, observacao } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO equipamentos (equipamento, modelo, numero_serie, portador_id, estado, observacao)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [equipamento, modelo, numero_serie, portador_id || null, estado, observacao]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar equipamento:', error);
    res.status(500).json({ message: 'Erro ao criar equipamento' });
  }
});

// Atualizar equipamento
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { equipamento, modelo, numero_serie, portador_id, estado, observacao } = req.body;
  try {
    const result = await pool.query(
      `UPDATE equipamentos
       SET equipamento = $1, modelo = $2, numero_serie = $3, portador_id = $4, estado = $5, observacao = $6
       WHERE id = $7
       RETURNING *`,
      [equipamento, modelo, numero_serie, portador_id || null, estado, observacao, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Equipamento não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar equipamento:', error);
    res.status(500).json({ message: 'Erro ao atualizar equipamento' });
  }
});

// Excluir equipamento
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM equipamentos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Equipamento não encontrado' });
    }
    res.json({ message: 'Equipamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir equipamento:', error);
    res.status(500).json({ message: 'Erro ao excluir equipamento' });
  }
});

module.exports = router; 