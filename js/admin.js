window.requireAdmin();

document.addEventListener('DOMContentLoaded', () => {
    loadAllOrders();

    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('status-select')) {
            const orderId = e.target.getAttribute('data-order-id');
            const newStatus = e.target.value;
            if (orderId && newStatus) {
                updateOrderStatus(orderId, newStatus);
            }
        }
    });
});

async function loadAllOrders() {
    try {
        const { data: orders, error: ordersError } = await supabaseClient
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;
        
        // Try to fetch profiles for name matching
        let profileMap = {};
        try {
            const { data: profiles } = await supabaseClient
                .from('profiles')
                .select('id, full_name');
            if (profiles) {
                profiles.forEach(p => {
                    profileMap[p.id] = p.full_name;
                });
            }
        } catch (e) {
            console.error("Could not fetch profiles:", e);
        }

        const container = document.getElementById('ordersDashboard');
        if (!container) return;

        if (!orders || orders.length === 0) {
            container.innerHTML = '<p class="text-center font-mono opacity-50 my-5">No orders found.</p>';
            return;
        }

        let html = `
            <table class="table table-hover align-middle ticket-card border-0 mb-0">
                <thead class="bg-surface text-ink font-mono small opacity-75">
                    <tr>
                        <th class="border-0 rounded-start">Order ID</th>
                        <th class="border-0">Customer</th>
                        <th class="border-0">Items</th>
                        <th class="border-0">Total</th>
                        <th class="border-0">Time</th>
                        <th class="border-0 rounded-end">Status</th>
                    </tr>
                </thead>
                <tbody class="border-top-0">
        `;

        orders.forEach(order => {
            const customerName = profileMap[order.user_id] || 'Unknown Customer';
            const itemsSummary = (order.items || []).map(i => `${i.name} (x${i.qty})`).join(', ');
            const date = new Date(order.created_at).toLocaleString();
            const statuses = ['Pending', 'Preparing', 'Ready'];
            
            let statusOptions = statuses.map(s => {
                const selected = s === order.status ? 'selected' : '';
                return `<option value="${s}" ${selected}>${s}</option>`;
            }).join('');

            html += `
                <tr>
                    <td class="font-mono text-brass fw-bold">#${order.id.toString().slice(0,8)}</td>
                    <td class="font-body fw-bold text-ink">${customerName}</td>
                    <td class="font-body small opacity-75" style="max-width: 250px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${itemsSummary}">${itemsSummary}</td>
                    <td class="font-mono fw-bold">Rs. ${order.total.toFixed(2)}</td>
                    <td class="font-mono small opacity-75">${date}</td>
                    <td>
                        <select class="form-select form-select-sm status-select font-mono" data-order-id="${order.id}" style="width: 130px; border-color: var(--sage); color: var(--sage); cursor: pointer;">
                            ${statusOptions}
                        </select>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;

    } catch (err) {
        console.error("Error loading orders:", err);
        const container = document.getElementById('ordersDashboard');
        if (container) {
            container.innerHTML = '<p class="text-danger text-center">Failed to load orders.</p>';
        }
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        const { error } = await supabaseClient
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (error) throw error;
        
        if (typeof window.showToast === 'function') {
            window.showToast('Order status updated successfully.', 'success');
        }
        await loadAllOrders();
    } catch (err) {
        console.error("Error updating order status:", err);
        if (typeof window.showToast === 'function') {
            window.showToast('Failed to update status.', 'error');
        }
    }
}
