require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes'); // Importar as rotas de produtos
const orderRoutes = require('./routes/orderRoutes');
const freteRoutes = require('./routes/freteRoutes');
const pagamentoRoutes = require('./routes/pagamentoRoutes'); // Importar as rotas de pagamento
const shippingRoutes = require('./routes/shippingRoutes'); // Importar as rotas de envio

const app = express();

app.use(cors());
app.use(express.json()); // Middleware para interpretar JSON
app.use(express.urlencoded({ extended: true })); // Middleware para interpretar dados de formulários

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

app.use('/api/auth', authRoutes);
// Registrar as rotas
app.use('/api/products', productRoutes); // Registrar as rotas de produtos
app.use('/api/orders', orderRoutes);
app.use('/api/frete', freteRoutes);
app.use('/api/pagamento', pagamentoRoutes); // Registrar as rotas de pagamento
app.use('/api/shipping', shippingRoutes); // Registrar as rotas de envio

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
