const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('@aws-sdk/client-s3'); // Usando AWS SDK v3
const Product = require('../models/Product'); // Modelo do produto

const router = express.Router();

// Configurar o AWS S3
const s3 = new AWS.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Configurar o multer para usar o S3
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'mercadoads-img', // Substitua pelo nome do seu bucket
        acl: 'public-read', // Permitir acesso público às imagens
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`); // Nome único para o arquivo
        },
    }),
});

// Rota para criar um produto com upload de imagem
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, promoPrice, category } = req.body;

        const product = new Product({
            name,
            description,
            price,
            promoPrice,
            category,
            image: req.file.location, // URL da imagem no S3
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error('Erro ao criar produto:', error.message);
        res.status(500).json({ message: 'Erro ao criar produto.', error: error.message });
    }
});

// Rota para criar um novo produto
router.post('/', async (req, res) => {
    try {
        const { name, description, price, category, stock, promoPrice, image } = req.body;

        // Validar os dados
        if (!name || !price || !stock || !image) {
            return res.status(400).json({ message: 'Nome, preço, estoque e imagem são obrigatórios.' });
        }

        // Verificar se o preço promocional é igual ao preço original
        const finalPromoPrice = promoPrice && promoPrice !== price ? promoPrice : null;

        // Criar o produto
        const product = new Product({ name, description, price, category, stock, promoPrice: finalPromoPrice, image });
        await product.save();

        res.status(201).json(product);
    } catch (error) {
        console.error('Erro ao criar produto:', error.message);
        res.status(500).json({ message: 'Erro ao criar produto.', error: error.message });
    }
});

// Rota para listar produtos em promoção
router.get('/promotions', async (req, res) => {
    try {
        // Buscar produtos com promoPrice menor que price
        const products = await Product.find({
            $expr: { $lt: ['$promoPrice', '$price'] }, // Comparar promoPrice com price
            promoPrice: { $ne: null }, // Garantir que promoPrice não seja nulo
        });
        res.status(200).json(products);
    } catch (error) {
        console.error('Erro ao listar produtos em promoção:', error.message);
        res.status(500).json({ message: 'Erro ao listar produtos em promoção.', error: error.message });
    }
});

// Rota para listar todos os produtos
router.get('/', async (req, res) => {
    try {
        const products = await Product.find(); // Buscar todos os produtos no banco de dados
        res.status(200).json(products);
    } catch (error) {
        console.error('Erro ao listar produtos:', error.message);
        res.status(500).json({ message: 'Erro ao listar produtos.', error: error.message });
    }
});

// Rota para validar o estoque
router.post('/validate-stock', async (req, res) => {
    const { cart } = req.body;

    try {
        for (const item of cart) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({ message: `Produto com ID ${item.productId} não encontrado.` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Estoque insuficiente para o produto: ${product.name}.` });
            }
        }

        res.status(200).json({ message: 'Estoque validado com sucesso.' });
    } catch (error) {
        console.error('Erro ao validar estoque:', error);
        res.status(500).json({ message: 'Erro ao validar estoque.', error: error.message });
    }
});

module.exports = router;
