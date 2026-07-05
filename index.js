const form = document.getElementById('contact-form');
const responseMessage = document.getElementById('form-response');
const cartButton = document.getElementById('openCartButton');
const closeCartButton = document.getElementById('closeCartButton');
const cartPanel = document.getElementById('cartPanel');
const cartCount = document.getElementById('cartCount');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalText = document.getElementById('cartTotal');
const checkoutButton = document.getElementById('checkoutButton');
const cartSummary = document.getElementById('cartSummary');
const checkoutScreen = document.getElementById('checkoutScreen');
const paymentForm = document.getElementById('paymentForm');
const backToCartButton = document.getElementById('backToCartButton');
const paymentResponse = document.getElementById('paymentResponse');
const checkoutSuccess = document.getElementById('checkoutSuccess');
const closeSuccessButton = document.getElementById('closeSuccessButton');
const orderSummaryList = document.getElementById('orderSummaryList');
const orderSummaryTotal = document.getElementById('orderSummaryTotal');
const successSummary = document.getElementById('successSummary');
const menuSearch = document.getElementById('menuSearch');
const filterButtons = document.querySelectorAll('.filter-btn');
const menuItems = Array.from(document.querySelectorAll('.menu-item-row'));

let cart = [];
let activeFilter = 'all';

function updateCartCount() {
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
}

function formatPrice(value) {
    return `${value.toLocaleString('ar-EG')} ج.م`;
}

function renderCart() {
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">السلة فارغة. اضغط على "أضف إلى السلة" لبدء الطلب.</p>';
        cartTotalText.textContent = formatPrice(0);
        updateCartCount();
        return;
    }

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-top">
                <strong>${item.name}</strong>
                <button type="button" class="remove-item" data-name="${item.name}" aria-label="إزالة ${item.name}">✕</button>
            </div>
            <div class="cart-item-details">
                <span>${formatPrice(item.price)}</span>
                <div class="cart-item-controls">
                    <button type="button" class="qty-btn" data-action="decrease" data-name="${item.name}">−</button>
                    <span>${item.quantity}</span>
                    <button type="button" class="qty-btn" data-action="increase" data-name="${item.name}">+</button>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotalText.textContent = formatPrice(total);
    updateCartCount();
    saveCart();
}

function saveCart() {
    localStorage.setItem('billCafeCart', JSON.stringify(cart));
}

function loadCart() {
    const storedCart = localStorage.getItem('billCafeCart');
    if (!storedCart) return;

    try {
        const parsed = JSON.parse(storedCart);
        if (Array.isArray(parsed)) {
            cart = parsed;
        }
    } catch (error) {
        console.warn('تعذر تحميل السلة من التخزين المحلي:', error);
    }
}

function openCheckout() {
    if (cart.length === 0) {
        alert('السلة فارغة، أضف منتجاً أولاً.');
        return;
    }
    cartSummary.classList.add('hide');
    cartItemsContainer.classList.add('hide');
    checkoutSuccess.classList.remove('active');
    checkoutSuccess.setAttribute('aria-hidden', 'true');
    checkoutScreen.classList.add('active');
    checkoutScreen.setAttribute('aria-hidden', 'false');
    renderOrderSummary();
}

function closeCheckout() {
    cartSummary.classList.remove('hide');
    cartItemsContainer.classList.remove('hide');
    checkoutScreen.classList.remove('active');
    checkoutSuccess.classList.remove('active');
    checkoutScreen.setAttribute('aria-hidden', 'true');
    checkoutSuccess.setAttribute('aria-hidden', 'true');
    paymentResponse.textContent = '';
}

function renderOrderSummary() {
    if (!orderSummaryList || !orderSummaryTotal) return;
    orderSummaryList.innerHTML = '';
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cart.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.quantity} × ${item.name} — ${formatPrice(item.price * item.quantity)}`;
        orderSummaryList.appendChild(listItem);
    });
    orderSummaryTotal.textContent = formatPrice(total);
}

function showSuccess(name, method, note) {
    if (!successSummary || !checkoutSuccess) return;
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const entries = cart.map(item => `${item.quantity} × ${item.name}`).join('، ');
    successSummary.innerHTML = `
        <h4>تفاصيل الطلب</h4>
        <ul>
            <li>الاسم: <strong>${name}</strong></li>
            <li>طريقة الدفع: <strong>${method === 'card' ? 'بطاقة' : 'نقداً'}</strong></li>
            <li>المبلغ: <strong>${formatPrice(total)}</strong></li>
            <li>الطلب: <strong>${entries}</strong></li>
            ${note ? `<li>ملاحظة: ${note}</li>` : ''}
        </ul>
    `;
    checkoutScreen.classList.remove('active');
    checkoutScreen.setAttribute('aria-hidden', 'true');
    checkoutSuccess.classList.add('active');
    checkoutSuccess.setAttribute('aria-hidden', 'false');
}

function resetPaymentForm() {
    if (!paymentForm) return;
    paymentForm.reset();
    paymentResponse.textContent = '';
}

function updateFilterButtons(filter) {
    filterButtons.forEach(button => {
        button.classList.toggle('active', button.dataset.filter === filter);
    });
}

function filterMenu(filter = activeFilter) {
    const query = menuSearch?.value.trim().toLowerCase() || '';
    menuItems.forEach(item => {
        const category = item.dataset.category || 'all';
        const matchesCategory = filter === 'all' || category === filter;
        const matchesSearch = item.textContent.toLowerCase().includes(query);
        item.style.display = matchesCategory && matchesSearch ? '' : 'none';
    });
}

function setActiveFilter(filter) {
    activeFilter = filter;
    updateFilterButtons(filter);
    filterMenu(filter);
}

function addToCart(name, price) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    renderCart();
}

function toggleCartPanel(show) {
    const isOpen = typeof show === 'boolean' ? show : !cartPanel.classList.contains('open');
    cartPanel.classList.toggle('open', isOpen);
    cartPanel.setAttribute('aria-hidden', !isOpen);
}

function handleMenuInteraction(event) {
    const detailButton = event.target.closest('.detail-toggle');
    const addCartButton = event.target.closest('.add-to-cart');
    const qtyButton = event.target.closest('.qty-btn');
    const removeButton = event.target.closest('.remove-item');

    if (detailButton) {
        const itemRow = detailButton.closest('.menu-item-row');
        const details = itemRow?.querySelector('.item-details');
        if (!details) return;
        const isOpen = details.classList.toggle('open');
        detailButton.setAttribute('aria-expanded', isOpen);
        detailButton.textContent = isOpen ? 'أخفِ التفاصيل' : 'التفاصيل';
        return;
    }

    if (addCartButton) {
        const itemRow = addCartButton.closest('.menu-item-row');
        const name = itemRow.querySelector('strong')?.textContent || 'منتج';
        const price = Number(itemRow.dataset.price || 0) || 0;
        addToCart(name, price);
        return;
    }

    if (qtyButton) {
        const name = qtyButton.dataset.name;
        const action = qtyButton.dataset.action;
        const item = cart.find(entry => entry.name === name);
        if (!item) return;
        if (action === 'increase') item.quantity += 1;
        if (action === 'decrease') item.quantity = Math.max(1, item.quantity - 1);
        renderCart();
        return;
    }

    if (removeButton) {
        const name = removeButton.dataset.name;
        cart = cart.filter(entry => entry.name !== name);
        renderCart();
        return;
    }

    if (event.target === cartButton) {
        toggleCartPanel(true);
        return;
    }

    if (event.target === closeCartButton) {
        toggleCartPanel(false);
        return;
    }
}

if (checkoutButton) {
    checkoutButton.addEventListener('click', openCheckout);
}

if (backToCartButton) {
    backToCartButton.addEventListener('click', closeCheckout);
}

if (closeSuccessButton) {
    closeSuccessButton.addEventListener('click', closeCheckout);
}

if (paymentForm) {
    paymentForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(paymentForm);
        const name = formData.get('customerName')?.toString().trim();
        const phone = formData.get('customerPhone')?.toString().trim();
        const address = formData.get('customerAddress')?.toString().trim();
        const method = formData.get('paymentMethod')?.toString() || 'cash';
        const note = formData.get('orderNote')?.toString().trim();

        if (!name || !phone || !address) {
            paymentResponse.textContent = 'يرجى ملء الحقول الأساسية لإكمال الطلب.';
            return;
        }

        const summary = cart.map(item => `${item.quantity} × ${item.name}`).join('، ');
        const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        showSuccess(name, method, note, summary, totalAmount);
        cart = [];
        saveCart();
        renderCart();
        paymentResponse.textContent = '';
        resetPaymentForm();
    });
}

if (menuSearch) {
    menuSearch.addEventListener('input', () => filterMenu(activeFilter));
}

filterButtons.forEach(button => {
    button.addEventListener('click', () => setActiveFilter(button.dataset.filter));
});

if (form) {
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        responseMessage.textContent = 'شكراً! تم استلام رسالتك وسنرد عليك قريباً.';
        form.reset();
    });
}

document.addEventListener('click', handleMenuInteraction);
window.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && cartPanel.classList.contains('open')) {
        toggleCartPanel(false);
    }
});

loadCart();
setActiveFilter(activeFilter);
renderCart();
