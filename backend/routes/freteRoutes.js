const express = require('express');

const router = express.Router();

router.post('/calcular-frete', async (req, res) => {
    console.log('Corpo da requisição recebido:', req.body); // Log para depuração

    const { destino } = req.body;

    if (!destino) {
        return res.status(400).json({ message: 'O campo "destino" é obrigatório.' });
    }

    try {
        // Frete fixo para Avenida Paulista
        const shippingOptions = [
            { name: 'Entrega Padrão', price: 15.00, delivery_time: 3 },
            { name: 'Entrega Expressa', price: 25.00, delivery_time: 1 },
        ];

        res.json(shippingOptions);
    } catch (error) {
        console.error('Erro ao calcular o frete:', error.message);
        res.status(500).json({ message: 'Erro ao calcular o frete.' });
    }
});

module.exports = router;
