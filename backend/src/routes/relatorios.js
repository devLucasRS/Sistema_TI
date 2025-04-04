const express = require('express');
const router = express.Router();
const db = require('../../database/db');

// Tempo médio de atendimento
router.get('/tempo-medio-atendimento', async (req, res) => {
    try {
        const [result] = await db.query(`
            SELECT 
                COALESCE(CAST(AVG(TIMESTAMPDIFF(HOUR, data_abertura, data_atualizacao)) AS DECIMAL(10,2)), 0) as tempo_medio
            FROM chamados 
            WHERE status = 'Fechado'
            AND data_atualizacao > data_abertura
        `);
        res.json(result[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Total de chamados por status
router.get('/chamados-por-status', async (req, res) => {
    try {
        const [result] = await db.query(`
            SELECT 
                status,
                COUNT(*) as total
            FROM chamados
            GROUP BY status
            ORDER BY total DESC
        `);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Chamados por dia da semana
router.get('/chamados-por-dia', async (req, res) => {
    try {
        const query = `
            SELECT 
                CASE 
                    WHEN DAYOFWEEK(data_abertura) = 1 THEN 'Domingo'
                    WHEN DAYOFWEEK(data_abertura) = 2 THEN 'Segunda-feira'
                    WHEN DAYOFWEEK(data_abertura) = 3 THEN 'Terça-feira'
                    WHEN DAYOFWEEK(data_abertura) = 4 THEN 'Quarta-feira'
                    WHEN DAYOFWEEK(data_abertura) = 5 THEN 'Quinta-feira'
                    WHEN DAYOFWEEK(data_abertura) = 6 THEN 'Sexta-feira'
                    WHEN DAYOFWEEK(data_abertura) = 7 THEN 'Sábado'
                END as dia_semana,
                COUNT(*) as total
            FROM chamados
            GROUP BY DAYOFWEEK(data_abertura)
            ORDER BY DAYOFWEEK(data_abertura)
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar chamados por dia:', error);
        res.status(500).json({ error: 'Erro ao buscar chamados por dia' });
    }
});

// Taxa de resolução (chamados fechados / total de chamados)
router.get('/taxa-resolucao', async (req, res) => {
    try {
        const [result] = await db.query(`
            SELECT 
                ROUND(
                    (SELECT COUNT(*) FROM chamados WHERE status = 'Fechado') * 100.0 / 
                    (SELECT COUNT(*) FROM chamados)
                , 2) as taxa_resolucao
        `);
        res.json(result[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ranking por categoria
router.get('/ranking-categorias', async (req, res) => {
    try {
        const [result] = await db.query(`
            SELECT categoria, COUNT(*) as total
            FROM chamados
            GROUP BY categoria
            ORDER BY total DESC
        `);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ranking de atendentes
router.get('/ranking-atendentes', async (req, res) => {
    try {
        const [result] = await db.query(`
            SELECT 
                u.nome as atendente,
                COUNT(c.id) as total_atendimentos
            FROM chamados c
            JOIN usuarios u ON c.atendente_id = u.id
            WHERE c.status = 'Fechado'
            GROUP BY u.id, u.nome
            ORDER BY total_atendimentos DESC
        `);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para obter lista de chamados com filtros
router.get('/chamados', async (req, res) => {
    try {
        const { status, categoria, dataInicio, dataFim, busca } = req.query;
        let query = `
            SELECT 
                c.id,
                c.assunto,
                c.categoria,
                c.status,
                c.data_abertura,
                c.data_atualizacao,
                u.nome as atendente
            FROM chamados c
            LEFT JOIN usuarios u ON c.atendente_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND c.status = ?';
            params.push(status);
        }

        if (categoria) {
            query += ' AND c.categoria = ?';
            params.push(categoria);
        }

        if (dataInicio) {
            query += ' AND DATE(c.data_abertura) >= ?';
            params.push(dataInicio);
        }

        if (dataFim) {
            query += ' AND DATE(c.data_abertura) <= ?';
            params.push(dataFim);
        }

        if (busca) {
            query += ' AND (c.assunto LIKE ? OR c.descricao LIKE ?)';
            params.push(`%${busca}%`, `%${busca}%`);
        }

        query += ' ORDER BY c.data_abertura DESC';

        const [results] = await db.query(query, params);
        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar chamados:', error);
        res.status(500).json({ error: 'Erro ao buscar chamados' });
    }
});

module.exports = router; 