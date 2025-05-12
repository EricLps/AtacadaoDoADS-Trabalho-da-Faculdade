document.addEventListener('DOMContentLoaded', async () => {
    const API_BASE_URL = 'http://localhost:5000'; // Endereço do backend

    const cepInput = document.getElementById('cep-input');
    const calculateShippingBtn = document.getElementById('calculate-shipping-btn');
    const shippingStep = document.getElementById('shipping-step');
    const shippingOptions = document.getElementById('shipping-options');
    const subtotalElement = document.getElementById('subtotal');
    const shippingCostElement = document.getElementById('shipping-cost');
    const totalCostElement = document.getElementById('total-cost');
    const payBtn = document.getElementById('pay-btn');
    const cartSummaryContainer = document.getElementById('cart-summary');
    let subtotal = 0;
    let shippingCost = 0;
    let pickupToken = null;

    // Carregar os produtos do carrinho do localStorage
    const cart = JSON.parse(localStorage.getItem('checkoutCart')) || [];

    // Exibir os produtos no resumo
    function renderCartSummary() {
        cartSummaryContainer.innerHTML = cart.map(item => `
            <div class="summary-item">
                <span>${item.name} (x${item.quantity})</span>
                <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        // Calcular o subtotal
        subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        subtotalElement.textContent = `R$ ${subtotal.toFixed(2)}`;
        totalCostElement.textContent = `R$ ${(subtotal + shippingCost).toFixed(2)}`;
    }

    renderCartSummary();

    // Função para buscar opções de frete
    async function fetchShippingOptions(cep) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/shipping/calculate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: {
                        postal_code: '01001-000', // CEP de origem
                    },
                    to: {
                        postal_code: cep,
                    },
                    products: cart.map(item => ({
                        id: item.id,
                        width: 20, // Substitua com as dimensões reais do produto
                        height: 10,
                        length: 15,
                        weight: 1,
                        insurance_value: item.price * item.quantity,
                        quantity: item.quantity,
                    })),
                }),
            });

            const shippingOptionsData = await response.json();

            // Adicionar a opção de retirada na loja
            shippingOptionsData.push({
                name: 'Retirada na Loja',
                price: 20.00, // Taxa fixa de separação
                delivery_time: 0, // Sem tempo de entrega
            });

            // Preencher as opções de frete no select
            shippingOptions.innerHTML = shippingOptionsData.map(option => `
                <option value="${option.price}" data-delivery-time="${option.delivery_time}" data-pickup="${option.name === 'Retirada na Loja'}">
                    ${option.name} - R$ ${parseFloat(option.price).toFixed(2)} ${option.delivery_time > 0 ? `(Entrega em ${option.delivery_time} dias)` : ''}
                </option>
            `).join('');

            // Exibir a seção de escolha do frete
            shippingStep.classList.remove('hidden');
        } catch (error) {
            console.error('Erro ao buscar opções de frete:', error.message);
            alert('Erro ao buscar opções de frete. Tente novamente mais tarde.');
        }
    }

    // Evento para calcular o frete ao clicar no botão
    calculateShippingBtn.addEventListener('click', () => {
        const cep = cepInput.value.trim();

        if (!cep || cep.length < 8) {
            alert('Por favor, insira um CEP válido.');
            return;
        }

        fetchShippingOptions(cep);
    });

    // Calcular o frete ao selecionar uma opção
    shippingOptions.addEventListener('change', () => {
        const selectedOption = shippingOptions.options[shippingOptions.selectedIndex];
        shippingCost = parseFloat(selectedOption.value) || 0;
        const deliveryTime = selectedOption.getAttribute('data-delivery-time');
        const isPickup = selectedOption.getAttribute('data-pickup') === 'true';

        shippingCostElement.textContent = isPickup
            ? `R$ ${shippingCost.toFixed(2)} (Retirada na Loja)`
            : `R$ ${shippingCost.toFixed(2)} (Entrega em ${deliveryTime} dias)`;

        totalCostElement.textContent = `R$ ${(subtotal + shippingCost).toFixed(2)}`;

        // Gerar token de retirada se for retirada na loja
        if (isPickup) {
            pickupToken = generatePickupToken();
            alert(`Seu token para retirada na loja é: ${pickupToken}. Salve este token para apresentar na loja.`);
        } else {
            pickupToken = null; // Resetar o token se não for retirada na loja
        }
    });

    // Função para gerar o token de retirada
    function generatePickupToken() {
        return Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    async function validateStock(cart) {
        try {
            const response = await fetch('http://localhost:5000/api/products/validate-stock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cart: cart.map(item => ({
                        productId: item.id, // Certifique-se de que o campo `id` está correto
                        quantity: item.quantity,
                    })),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || 'Erro ao validar o estoque.');
                return false;
            }

            return true;
        } catch (error) {
            console.error('Erro ao validar o estoque:', error);
            alert('Erro ao validar o estoque. Tente novamente mais tarde.');
            return false;
        }
    }

    // Prosseguir para o pagamento
    payBtn.addEventListener('click', async () => {
        const isStockValid = await validateStock(cart);

        if (!isStockValid) {
            return;
        }

        const selectedOption = shippingOptions.options[shippingOptions.selectedIndex];
        const frete = parseFloat(selectedOption.value);

        if (!frete || frete <= 0) {
            alert('Por favor, selecione uma opção de frete válida.');
            return;
        }

        const totalCost = subtotal + frete;

        try {
            const response = await fetch('http://localhost:5000/api/pagamento/mercado-pago', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    total: totalCost,
                    frete,
                    pickupToken, // Enviar o token de retirada, se existir
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Redirecionar para o link de pagamento do Mercado Pago
                window.location.href = data.init_point;
            } else {
                alert(data.message || 'Erro ao iniciar o pagamento.');
            }
        } catch (error) {
            console.error('Erro ao iniciar o pagamento:', error);
            alert('Erro ao conectar ao servidor.');
        }
    });
});

router.post('/mercado-pago', async (req, res) => {
    const { total, frete } = req.body;

    if (!total || !frete) {
        console.error('Erro: Total ou frete não fornecidos.');
        return res.status(400).json({ message: 'Total e frete são obrigatórios.' });
    }

    console.log('Access Token:', mercadopago.accessToken); // Log do access_token
    console.log('Dados recebidos:', { total, frete }); // Log dos dados recebidos

    try {
        const preference = {
            items: [
                {
                    title: 'Compra na Minha Loja',
                    unit_price: parseFloat(total),
                    quantity: 1,
                },
            ],
            back_urls: {
                success: 'http://127.0.0.1:3000/sucesso.html', // Página de sucesso
                failure: 'http://127.0.0.1:3000/erro.html',    // Página de erro
                pending: 'http://127.0.0.1:3000/pendente.html' // Página de pendente
            },
            auto_return: 'approved',
        };

        console.log('Preferência criada:', preference); // Log da preferência

        const response = await mercadopago.preferences.create(preference);
        console.log('Resposta do Mercado Pago:', response.body); // Log da resposta do Mercado Pago
        res.json({ init_point: response.body.init_point });
    } catch (error) {
        console.error('Erro ao criar preferência no Mercado Pago:', error.message); // Log do erro completo
        res.status(500).json({ message: 'Erro ao iniciar o pagamento.', error: error.message });
    }
});