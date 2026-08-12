// Shopping cart logic

let cart = [];

document.addEventListener('DOMContentLoaded', () => {
    // Restore cart from session storage
    const storedCart = sessionStorage.getItem('cafeCart');
    if (storedCart) {
        try {
            cart = JSON.parse(storedCart);
        } catch (e) {
            cart = [];
        }
    }
    
    // Initial render
    renderCart();
});

function saveCart() {
    sessionStorage.setItem('cafeCart', JSON.stringify(cart));
}

window.addToCart = function(itemData) {
    const existingItem = cart.find(i => i.id === itemData.id);
    
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({
            id: itemData.id,
            name: itemData.name,
            price: parseFloat(itemData.price),
            qty: 1
        });
    }
    
    saveCart();
    renderCart();
    
    // Visual feedback on the button
    const btn = document.querySelector(`button[data-id="${itemData.id}"]`);
    if (btn) {
        const originalText = btn.innerHTML;
        btn.textContent = 'Added!';
        btn.style.opacity = '0.8';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.opacity = '1';
        }, 1000);
    }
};

window.removeFromCart = function(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
};

window.updateQty = function(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    
    item.qty += delta;
    if (item.qty <= 0) {
        removeFromCart(id);
    } else {
        saveCart();
        renderCart();
    }
};

function renderCart() {
    const container = document.getElementById('cartItemsContainer');
    const totalEl = document.getElementById('cartTotal');
    const badge = document.getElementById('cartCountBadge');
    
    if (!container || !totalEl || !badge) return;
    
    // Update badge
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    badge.textContent = totalItems;
    if (totalItems > 0) {
        badge.classList.remove('d-none');
    } else {
        badge.classList.add('d-none');
    }
    
    // Render items
    if (cart.length === 0) {
        container.innerHTML = `<p class="text-muted text-center mt-4">Your cart is empty.</p>`;
        totalEl.textContent = 'Rs. 0.00';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach(item => {
        const lineTotal = item.price * item.qty;
        total += lineTotal;
        
        html += `
            <div class="d-flex justify-content-between align-items-center mb-3 p-2 rounded" style="background-color: white; border: 1px solid rgba(111, 78, 55, 0.1);">
                <div class="flex-grow-1" style="min-width: 0;">
                    <h6 class="mb-0 fw-bold text-truncate" style="color: var(--primary-color);">${item.name}</h6>
                    <div class="text-muted small">Rs. ${item.price.toFixed(2)}</div>
                </div>
                
                <div class="d-flex align-items-center mx-2">
                    <button class="btn btn-sm btn-outline-secondary px-2 py-0 fw-bold" onclick="updateQty(${item.id}, -1)">-</button>
                    <span class="mx-2 fw-bold" style="color: var(--primary-color);">${item.qty}</span>
                    <button class="btn btn-sm btn-outline-secondary px-2 py-0 fw-bold" onclick="updateQty(${item.id}, 1)">+</button>
                </div>
                
                <div class="text-end d-flex flex-column align-items-end" style="width: 70px;">
                    <div class="fw-bold" style="color: var(--primary-color);">Rs. ${lineTotal.toFixed(2)}</div>
                    <button class="btn btn-sm text-danger p-0 mt-1" style="font-size: 0.8rem;" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    totalEl.textContent = `Rs. ${total.toFixed(2)}`;
}
