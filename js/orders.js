// Orders logic

async function placeOrder() {
    try {
        // 1. Get current user
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        
        if (userError || !user) {
            alert('You must be logged in to place an order.');
            window.location.href = 'login.html';
            return;
        }
        
        // 2. Check if cart is empty
        if (!cart || cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        // Calculate total
        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        
        // Disable button during processing
        const checkoutBtn = document.getElementById('checkoutBtn');
        const originalBtnText = checkoutBtn.innerText;
        checkoutBtn.innerText = 'Processing...';
        checkoutBtn.disabled = true;
        
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
        checkoutBtn.innerText = originalBtnText;
        checkoutBtn.disabled = false;
            
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
            alert(`Success! Your order #${orderId} has been placed.`);
        }
        
    } catch (err) {
        // 5. On error
        console.error("Order placement error:", err);
        alert(`Failed to place order: ${err.message}`);
    }
}

// Ensure the function is globally available
window.placeOrder = placeOrder;
