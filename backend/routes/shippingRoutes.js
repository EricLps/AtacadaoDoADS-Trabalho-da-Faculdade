require('dotenv').config(); // Carregar variáveis de ambiente

const express = require('express');
const axios = require('axios');

const router = express.Router();

// Rota para calcular o frete
router.post('/calculate', async (req, res) => {
    const { from, to, products } = req.body;

    try {
        const response = await axios.post(
            'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate',
            {
                from,
                to,
                products,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.MELHOR_ENVIO_API_KEY}`, // Usar a chave do .env
                },
            }
        );

        // Filtrar apenas as opções válidas (sem erros)
        const validOptions = response.data.filter(option => !option.error);

        res.status(200).json(validOptions);
    } catch (error) {
        console.error('Erro ao consultar opções de frete:', error.response?.data || error.message);
        res.status(500).json({ message: 'Erro ao consultar opções de frete.', error: error.message });
    }
});

module.exports = router;