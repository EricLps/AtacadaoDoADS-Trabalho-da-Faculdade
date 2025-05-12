### 📦 Projeto Atacadão ADS - Documentação Oficial

Atacadão ADS é uma aplicação web desenvolvida para simular um sistema de e-commerce completo. O projeto abrange funcionalidades como exibição de produtos, promoções, carrinho de compras, cálculo de frete, integração com o Mercado Pago para pagamentos e geração de tokens para retirada de produtos na loja física.

---

## 🚀 Estrutura do Projeto

A estrutura do projeto está dividida em duas partes principais:

### Frontend

Localizado no diretório **frontend**, responsável pela interface do usuário, composto pelas seguintes páginas:

* **index.html:** Página inicial com promoções e destaques.
* **produtos.html:** Catálogo completo de produtos com filtros por categoria.
* **checkout.html:** Etapa de finalização da compra com resumo do carrinho, cálculo de frete e opções de pagamento.
* **sucesso.html:** Confirmação de pagamento bem-sucedido.
* **pendente.html:** Exibição de pagamento pendente.
* **erro.html:** Mensagem de erro no pagamento.

📂 Estrutura de Arquivos do Frontend:

```
frontend/
├── index.html
├── produtos.html
├── checkout.html
├── sucesso.html
├── pendente.html
├── erro.html
├── css/
│   └── styles.css
├── js/
│   ├── main.js
│   ├── promotions.js
│   └── checkout.js
```

### Backend

Localizado no diretório **backend**, responsável pela lógica do servidor, banco de dados e integração com APIs externas, incluindo Mercado Pago.

📂 Estrutura de Arquivos do Backend:

```
backend/
├── server.js
├── config/
│   └── db.js
├── controllers/
│   ├── productsController.js
│   ├── ordersController.js
│   └── paymentController.js
├── routes/
│   ├── productsRoutes.js
│   ├── ordersRoutes.js
│   └── paymentRoutes.js
├── utils/
│   └── calculateShipping.js
├── .env
├── package.json
└── README.md
```

---

## 🔥 Funcionalidades

### Frontend

* **Página Inicial (index.html):** Exibição de produtos em promoção com carrinho flutuante atualizado em tempo real.
* **Página de Produtos (produtos.html):** Catálogo completo de produtos, incluindo filtros por categoria e opções de adicionar ao carrinho.
* **Checkout (checkout.html):** Exibe o resumo do carrinho, permite o cálculo do frete e a escolha de retirada na loja com token gerado.
* **Páginas de Status:** Confirmação, pendência e erro no pagamento, com redirecionamento automático.

### Backend

* **Gerenciamento de Produtos:** Listagem de produtos, promoções e validação de estoque.
* **Gerenciamento de Pedidos:** Criação, cancelamento e restauração de estoque.
* **Cálculo de Frete:** Integração com APIs externas e opção de retirada na loja com taxa fixa.
* **Integração com Mercado Pago:** Criação de preferências de pagamento e redirecionamento para páginas de status.

---

## 🛠️ Tecnologias Utilizadas

### Frontend:

* HTML5, CSS3, JavaScript
* Estrutura modular com scripts e estilos organizados por página

### Backend:

* Node.js com Express.js
* MongoDB para armazenamento
* Mongoose para modelagem
* Axios para consumo de APIs
* Mercado Pago REST API para pagamentos
* dotenv para gerenciamento de variáveis de ambiente

---

## ⚙️ Configuração do Ambiente

### Pré-requisitos:

* Node.js instalado
* MongoDB configurado
* Conta no Mercado Pago para obtenção do access token

### Configuração do Backend:

1. Clone o repositório:

```
git clone <URL_DO_REPOSITORIO>
```

2. Instale as dependências:

```
cd backend
npm install
```

3. Configure o arquivo `.env`:

```
MONGO_URI=<URL_DO_MONGO>
MERCADO_PAGO_ACCESS_TOKEN=<SEU_ACCESS_TOKEN>
```

4. Inicie o servidor:

```
npm start
```

### Configuração do Frontend:

* Navegue até o diretório **frontend**.
* Abra o arquivo `index.html` no navegador ou utilize uma extensão como o **Live Server**.

---

## 🔗 Rotas do Backend

### Produtos:

* `GET /api/products`: Lista todos os produtos.
* `GET /api/products/promotions`: Lista produtos em promoção.
* `POST /api/products/validate-stock`: Valida o estoque dos produtos no carrinho.

### Pedidos:

* `POST /api/orders`: Cria um pedido.
* `POST /api/orders/cancel`: Cancela um pedido.

### Frete:

* `POST /api/shipping/calculate`: Calcula o frete com base no CEP.

### Pagamento:

* `POST /api/pagamento/mercado-pago`: Cria uma preferência de pagamento.

---

## 🚧 Melhorias Futuras

* Implementar autenticação de usuários e perfil com histórico de pedidos.
* Melhorar a responsividade do frontend.
* Implementar testes automatizados para rotas e funcionalidades.

---

## 🤝 Contribuição

1. Faça um fork do repositório.
2. Crie uma branch para sua feature:

```
git checkout -b minha-feature
```

3. Commit das suas alterações:

```
git commit -m "Implementa nova feature"
```

4. Envie para o repositório remoto:

```
git push origin minha-feature
```

5. Abra um Pull Request.

---

## 📝 Licença

Fique à vontade para utilizá-lo, modificá-lo e contribuir.
