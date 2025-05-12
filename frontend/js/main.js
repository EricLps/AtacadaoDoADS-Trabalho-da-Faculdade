document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('products-container');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const categoryFilter = document.getElementById('category-filter');
    const checkoutBtn = document.getElementById('checkout-btn');
    let cart = loadCart(); // Carregar o carrinho do Local Storage
    let allProducts = []; // Armazena todos os produtos para facilitar o filtro

    // Função para buscar produtos do backend
    async function fetchProducts() {
        try {
            const response = await fetch('http://localhost:5000/api/products'); // URL do endpoint
            const products = await response.json();
            allProducts = products; // Armazenar todos os produtos

            if (productsContainer) {
                renderProducts(products); // Renderizar todos os produtos
                populateCategories(products); // Preencher o filtro de categorias
                attachAddToCartEvents(); // Vincular eventos de clique aos botões
            }
        } catch (error) {
            console.error('Erro ao buscar produtos:', error.message);
        }
    }

    // Função para renderizar os produtos
    function renderProducts(products) {
        productsContainer.innerHTML = products.map(product => {
            // Calcular o desconto, se houver
            const discount = product.promoPrice && product.promoPrice !== product.price
                ? Math.round(((product.price - product.promoPrice) / product.price) * 100)
                : null;

            return `
                <div class="product-item">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    ${
                        product.promoPrice && product.promoPrice !== product.price
                            ? `
                                <p>
                                    <strong>Preço:</strong> 
                                    <span class="original-price">R$ ${product.price.toFixed(2)}</span> 
                                    <span class="promo-price">R$ ${product.promoPrice.toFixed(2)}</span>
                                    <span class="discount-badge">-${discount}%</span>
                                </p>
                            `
                            : `<p><strong>Preço:</strong> R$ ${product.price.toFixed(2)}</p>`
                    }
                    <p class="product-stock">Estoque: ${product.stock > 0 ? `${product.stock} unidades` : '<span class="out-of-stock">Esgotado</span>'}</p>
                    <button 
                        class="add-to-cart-btn" 
                        data-id="${product._id}" 
                        data-name="${product.name}" 
                        data-price="${product.promoPrice || product.price}" 
                        ${product.stock <= 0 ? 'disabled' : ''}
                    >
                        ${product.stock > 0 ? 'Adicionar ao Carrinho' : 'Indisponível'}
                    </button>
                </div>
            `;
        }).join('');
    }

    // Função para preencher o filtro de categorias
    function populateCategories(products) {
        const categories = [...new Set(products.map(product => product.category))]; // Obter categorias únicas
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    // Evento para filtrar os produtos por categoria
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            const selectedCategory = categoryFilter.value;
            if (selectedCategory === 'all') {
                renderProducts(allProducts); // Mostrar todos os produtos
            } else {
                const filteredProducts = allProducts.filter(product => product.category === selectedCategory);
                renderProducts(filteredProducts); // Mostrar produtos filtrados
            }
            attachAddToCartEvents(); // Reatribuir eventos após o filtro
        });
    }

    // Função para adicionar um produto ao carrinho
    function addToCart(productId, productName, productPrice) {
        const existingProduct = cart.find(item => item.id === productId);

        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push({ id: productId, name: productName, price: productPrice, quantity: 1 });
        }

        saveCart(); // Salvar o carrinho no Local Storage
        updateCart(); // Atualizar o carrinho
    }

    // Função para atualizar o carrinho
    function updateCart() {
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = cart.map(item => `
                <li class="cart-item">
                    <span>${item.name}</span>
                    <div class="cart-controls">
                        <button class="quantity-btn decrease-btn" data-id="${item.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn increase-btn" data-id="${item.id}">+</button>
                        <span class="item-price">R$ ${(item.price * item.quantity).toFixed(2)}</span>
                        <button class="remove-btn" data-id="${item.id}">✖</button>
                    </div>
                </li>
            `).join('');
        }

        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        if (cartTotalElement) {
            cartTotalElement.innerHTML = `<strong>Total:</strong> R$ ${total.toFixed(2)}`;
        }

        // Vincular eventos de clique aos botões
        attachCartEvents();
    }

    // Função para vincular eventos de clique aos botões do carrinho
    function attachCartEvents() {
        const increaseButtons = document.querySelectorAll('.increase-btn');
        const decreaseButtons = document.querySelectorAll('.decrease-btn');
        const removeButtons = document.querySelectorAll('.remove-btn');

        increaseButtons.forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.getAttribute('data-id');
                increaseQuantity(productId);
            });
        });

        decreaseButtons.forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.getAttribute('data-id');
                decreaseQuantity(productId);
            });
        });

        removeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.getAttribute('data-id');
                removeFromCart(productId);
            });
        });
    }

    // Função para aumentar a quantidade de um item
    function increaseQuantity(productId) {
        const product = cart.find(item => item.id === productId);
        if (product) {
            product.quantity += 1;
            saveCart();
            updateCart();
        }
    }

    // Função para diminuir a quantidade de um item
    function decreaseQuantity(productId) {
        const product = cart.find(item => item.id === productId);
        if (product && product.quantity > 1) {
            product.quantity -= 1;
            saveCart();
            updateCart();
        } else if (product && product.quantity === 1) {
            removeFromCart(productId); // Remove o item se a quantidade for 1
        }
    }

    // Função para remover um item do carrinho
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCart();
    }

    // Função para salvar o carrinho no Local Storage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Função para carregar o carrinho do Local Storage
    function loadCart() {
        const storedCart = localStorage.getItem('cart');
        return storedCart ? JSON.parse(storedCart) : [];
    }

    // Função para vincular eventos de clique aos botões "Adicionar ao Carrinho"
    function attachAddToCartEvents() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.getAttribute('data-id');
                const productName = button.getAttribute('data-name');
                const productPrice = parseFloat(button.getAttribute('data-price'));
                addToCart(productId, productName, productPrice);
            });
        });
    }

    // Redirecionar para a página de checkout ao clicar no botão "Finalizar Compra"
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            localStorage.setItem('checkoutCart', JSON.stringify(cart)); // Salvar o carrinho no localStorage
            window.location.href = 'checkout.html'; // Redirecionar para a página de checkout
        });
    }

    // Chamar a função ao carregar a página
    fetchProducts();
    updateCart(); // Atualizar o carrinho ao carregar a página
});
