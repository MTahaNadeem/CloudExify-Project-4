// Orders logic

async function placeOrder() {
    try {
        // 1. Get current user
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

        if (userError || !user) {
            if (typeof window.showToast === 'function') window.showToast('You must be logged in to place an order.', 'warning');
            else alert('You must be logged in to place an order.');
            window.location.href = 'login.html';
            return;
        }

        // 2. Check if cart is empty
        if (!cart || cart.length === 0) {
            if (typeof window.showToast === 'function') window.showToast('Your cart is empty!', 'warning');
            else alert('Your cart is empty!');
            return;
        }

        // Calculate total
        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

        // Disable button during processing
        const checkoutBtn = document.getElementById('checkoutBtn');
        let originalBtnText = 'Proceed to Checkout';
        if (checkoutBtn) {
            originalBtnText = checkoutBtn.innerText;
            checkoutBtn.innerText = 'Processing...';
            checkoutBtn.disabled = true;
        }

        // 3. Insert order
        const { data: orderData, error: orderError } = await supabaseClient
            .from('orders')
            .insert([{
                user_id: user.id,
                items: cart,
                total: total,
                status: 'Pending'
            }])
            .select();

        // Reset button
        if (checkoutBtn) {
            checkoutBtn.innerText = originalBtnText;
            checkoutBtn.disabled = false;
        }

        if (orderError) throw orderError;

        // 4. On success
        if (orderData && orderData.length > 0) {
            const orderId = orderData[0].id;

            // Clear the cart array
            cart.length = 0;

            // Clear sessionStorage
            sessionStorage.removeItem('cafeCart');

            // Re-render cart
            if (typeof renderCart === 'function') {
                renderCart();
            }
            
            // Reload order history so the new order appears
            if (typeof loadOrderHistory === 'function') {
                loadOrderHistory();
            }

            // Close offcanvas
            const cartOffcanvasEl = document.getElementById('cartOffcanvas');
            if (cartOffcanvasEl) {
                // If bootstrap is available globally
                if (typeof bootstrap !== 'undefined') {
                    const offcanvasInstance = bootstrap.Offcanvas.getInstance(cartOffcanvasEl);
                    if (offcanvasInstance) {
                        offcanvasInstance.hide();
                    }
                }
            }

            // Show success alert
            if (typeof window.showToast === 'function') {
                window.showToast(`Success! Your order #${orderId} has been placed.`, 'success');
            } else {
                alert(`Success! Your order #${orderId} has been placed.`);
            }
        }

    } catch (err) {
        // 5. On error
        console.error("Order placement error:", err);
        if (typeof window.showToast === 'function') {
            window.showToast(`Failed to place order: ${err.message}`, 'error');
        } else {
            alert(`Failed to place order: ${err.message}`);
        }
    }
}

// Ensure the function is globally available
window.placeOrder = placeOrder;

document.addEventListener('DOMContentLoaded', () => {
    loadOrderHistory();
});

async function loadOrderHistory() {
    const myOrdersContainer = document.getElementById('myOrders');
    if (!myOrdersContainer) return;
    
    try {
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !user) {
            return;
        }
        
        myOrdersContainer.innerHTML = `
            <div class="col-12 text-center py-4">
                <div class="spinner-border" role="status" style="color: var(--primary-color);">
                    <span class="visually-hidden">Loading orders...</span>
                </div>
            </div>
        `;
        
        const { data: orders, error } = await supabaseClient
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        if (!orders || orders.length === 0) {
            myOrdersContainer.innerHTML = `<div class="col-12 text-muted py-4">You haven't placed any orders yet.</div>`;
            return;
        }
        
        let html = '';
        orders.forEach(order => {
            const date = new Date(order.created_at).toLocaleString();
            
            let statusClass = 'bg-ink text-paper';
            if (order.status === 'Pending') statusClass = 'bg-brass text-paper';
            if (order.status === 'Preparing') statusClass = 'bg-ink text-paper';
            if (order.status === 'Ready') statusClass = 'bg-sage text-paper';
            
            let itemsHtml = '<ul class="list-unstyled mb-0">';
            order.items.forEach(item => {
                itemsHtml += `<li><span class="font-mono fw-bold">${item.qty}x</span> <span class="font-body">${item.name}</span> <span class="font-mono text-ink opacity-75 small">(Rs. ${item.price.toFixed(2)})</span></li>`;
            });
            itemsHtml += '</ul>';
            
            html += `
                <div class="col-12 col-md-6">
                    <div class="ticket-wrapper">
                        <div class="card ticket-card h-100">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <h6 class="card-title font-mono fw-bold mb-0 text-ink">Order #${order.id}</h6>
                                    <span class="badge ${statusClass}">${order.status}</span>
                                </div>
                                <div class="text-ink opacity-75 font-mono small mb-3 pb-3" style="border-bottom: 1px dashed rgba(43, 27, 18, 0.2);">${date}</div>
                                
                                <div class="mb-3 font-body">
                                    ${itemsHtml}
                                </div>
                                
                                <div class="d-flex justify-content-between align-items-center mt-3 pt-3" style="border-top: 1px dashed rgba(43, 27, 18, 0.2);">
                                    <strong class="font-display text-ink" style="font-size: var(--text-md);">Total</strong>
                                    <span class="font-mono fw-bold fs-5 text-brass">Rs. ${parseFloat(order.total).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        myOrdersContainer.innerHTML = html;
        
    } catch (err) {
        console.error('Error loading orders:', err);
        myOrdersContainer.innerHTML = `<div class="col-12 alert alert-danger">Failed to load order history: ${err.message}</div>`;
    }
}
window.loadOrderHistory = loadOrderHistory;
