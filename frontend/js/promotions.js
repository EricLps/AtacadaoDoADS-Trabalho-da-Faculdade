document.addEventListener('DOMContentLoaded', () => {
    const promotionsContainer = document.getElementById('promotions-container');

    async function fetchPromotions() {
        try {
            const response = await fetch('http://localhost:5000/api/products/promotions'); // URL do endpoint
            const promotions = await response.json();

            promotionsContainer.innerHTML = promotions.map(product => {
                // Calcular o desconto
                const discount = product.promoPrice && product.promoPrice !== product.price
                    ? Math.round(((product.price - product.promoPrice) / product.price) * 100)
                    : null;

                return `
                    <div class="product-item">
                        <img src="${product.image}" alt="${product.name}" class="product-image">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <p>
                            <span class="original-price">De: R$ ${product.price.toFixed(2)}</span>
                            <span class="promo-price">Por: R$ ${product.promoPrice.toFixed(2)}</span>
                            ${
                                discount
                                    ? `<span class="discount-badge">-${discount}%</span>`
                                    : ''
                            }
                        </p>
                        <button class="add-to-cart-btn" data-id="${product._id}" data-name="${product.name}" data-price="${product.promoPrice}">
                            Adicionar ao Carrinho
                        </button>
                    </div>
                `;
            }).join('');

            attachAddToCartEvents(); // Vincular eventos de clique aos botões
        } catch (error) {
            console.error('Erro ao buscar promoções:', error.message);
        }
    }

    fetchPromotions();

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

    // Função para adicionar um produto ao carrinho
    function addToCart(productId, productName, productPrice) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        const existingProduct = cart.find(item => item.id === productId);

        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push({ id: productId, name: productName, price: productPrice, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`Produto "${productName}" adicionado ao carrinho!`);
    }
});