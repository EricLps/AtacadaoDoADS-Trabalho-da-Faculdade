const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

// URL base da API REST do Mercado Pago
const MERCADO_PAGO_API = "https://api.mercadopago.com/checkout/preferences";

// Verificar se o token está sendo carregado corretamente
console.log("Access Token:", process.env.MERCADO_PAGO_ACCESS_TOKEN);

router.post('/mercado-pago', async (req, res) => {
    const { total, frete } = req.body;

    // Verificar se os valores obrigatórios foram fornecidos
    if (!total || !frete) {
        console.error('Erro: Total ou frete não fornecidos.');
        return res.status(400).json({ message: 'Total e frete são obrigatórios.' });
    }

    try {
        const preferenceData = {
            items: [
                {
                    title: 'Compra no Atacadão do ADS',
                    unit_price: parseFloat(total), // Certifique-se de que o valor é um número
                    quantity: 1,
                },
            ],
            back_urls: {
                success: 'http://127.0.0.1:3000/sucesso.html', // Página de sucesso
                failure: 'http://127.0.0.1:3000/erro.html',    // Página de erro
                pending: 'http://127.0.0.1:3000/pendente.html' // Página de pendente
            },
            auto_return: 'approved', // Retornar automaticamente para a URL de sucesso
        };

        console.log('Criando preferência com os dados:', preferenceData);

        // Enviar requisição para a API do Mercado Pago
        const response = await axios.post(MERCADO_PAGO_API, preferenceData, {
            headers: {
                Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });

        console.log('Resposta do Mercado Pago:', response.data);

        // Retornar o link de pagamento
        res.json({ init_point: response.data.init_point });
    } catch (error) {
        console.error('Erro ao criar preferência no Mercado Pago:', error.message);

        // Logar detalhes do erro, se disponíveis
        if (error.response) {
            console.error('Detalhes do erro:', error.response.data);
        }

        res.status(500).json({ message: 'Erro ao iniciar o pagamento.', error: error.message });
    }
});

router.get('/promotions', async (req, res) => {
    try {
        // Buscar produtos com promoções válidas (promoPrice menor que price)
        const products = await Product.find({ promoPrice: { $ne: null, $lt: '$price' } });
        res.status(200).json(products);
    } catch (error) {
        console.error('Erro ao listar produtos em promoção:', error.message);
        res.status(500).json({ message: 'Erro ao listar produtos em promoção.', error: error.message });
    }
});

module.exports = router;
