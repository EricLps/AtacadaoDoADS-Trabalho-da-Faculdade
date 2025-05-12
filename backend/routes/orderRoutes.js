const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const generateCode = require('../utils/generateCode');

const router = express.Router();

// Criar pedido
router.post('/', async (req, res) => {
    const { userId, products } = req.body;

    try {
        // Verifica se o usuário existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'Usuário não encontrado' });
        }

        // Verifica se os produtos existem
        const productList = await Product.find({ '_id': { $in: products.map(p => p.product) } });
        if (productList.length !== products.length) {
            return res.status(400).json({ message: 'Um ou mais produtos não encontrados' });
        }

        // Calcula o valor total
        let totalAmount = 0;
        products.forEach(item => {
            const product = productList.find(p => p._id.toString() === item.product);
            totalAmount += product.promoPrice ? product.promoPrice * item.quantity : product.price * item.quantity;
        });

        // Cria o pedido
        const newOrder = new Order({
            user: user._id,
            products,
            totalAmount,
            status: 'pending',
            pickupCode: generateCode()
        });

        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar pedido' });
    }
});

// Criar pedido com frete
router.post('/create', async (req, res) => {
    const { userId, items, total, frete } = req.body;

    if (!frete || frete <= 0) {
        return res.status(400).json({ message: 'O valor do frete é obrigatório e deve ser maior que zero.' });
    }

    try {
        // Verificar e atualizar o estoque de cada produto
        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({ message: `Produto com ID ${item.productId} não encontrado.` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Estoque insuficiente para o produto: ${product.name}.` });
            }

            // Atualizar o estoque
            product.stock -= item.quantity;
            await product.save();
        }

        const order = new Order({
            user: userId,
            items,
            total: total + frete, // Adiciona o valor do frete ao total
            frete,
        });

        await order.save();
        res.status(201).json(order);
    } catch (error) {
        console.error('Erro ao criar pedido:', error.message);
        res.status(500).json({ message: 'Erro ao criar pedido.' });
    }
});

// Cancelar pedido
router.post('/cancel', async (req, res) => {
    const { orderId } = req.body;

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Pedido não encontrado.' });
        }

        // Restaurar o estoque dos produtos
        for (const item of order.items) {
            const product = await Product.findById(item.productId);

            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }

        // Atualizar o status do pedido
        order.status = 'cancelado';
        await order.save();

        res.status(200).json({ message: 'Pedido cancelado e estoque restaurado.', order });
    } catch (error) {
        console.error('Erro ao cancelar pedido:', error);
        res.status(500).json({ message: 'Erro ao cancelar pedido.', error: error.message });
    }
});

// Listar pedidos de um usuário
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const orders = await Order.find({ user: userId }).populate('products.product');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar pedidos' });
    }
});

module.exports = router;
