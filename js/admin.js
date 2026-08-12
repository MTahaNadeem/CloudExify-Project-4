window.requireAdmin();

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    setInterval(loadDashboardStats, 30000);
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

    // Menu Management
    loadMenuItems();

    const menuForm = document.getElementById('menuForm');
    if (menuForm) {
        menuForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                id: document.getElementById('menuItemId').value,
                name: document.getElementById('menuItemName').value,
                description: document.getElementById('menuItemDesc').value,
                price: parseFloat(document.getElementById('menuItemPrice').value),
                category: document.getElementById('menuItemCategory').value,
                image_url: document.getElementById('menuItemImage').value,
                available: document.getElementById('menuItemAvailable').checked
            };

            await saveMenuItem(formData);
        });
    }

    const menuFormCancel = document.getElementById('menuFormCancel');
    if (menuFormCancel) {
        menuFormCancel.addEventListener('click', () => {
            document.getElementById('menuForm').reset();
            document.getElementById('menuItemId').value = '';
            document.getElementById('menuFormTitle').innerText = 'Add New Item';
            menuFormCancel.classList.add('d-none');
        });
    }
});

// --- Dashboard Stats Functions ---
async function loadDashboardStats() {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // 1. Fetch today's orders
        const { data: todayOrders, error: todayError } = await supabaseClient
            .from('orders')
            .select('total')
            .gte('created_at', startOfDay.toISOString());

        if (todayError) throw todayError;

        const ordersToday = todayOrders.length;
        const revenueToday = todayOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);

        // 2. Fetch pending orders (count only)
        const { count: pendingCount, error: pendingError } = await supabaseClient
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'Pending');

        if (pendingError) throw pendingError;

        // 3. Fetch total menu items (count only)
        const { count: menuCount, error: menuError } = await supabaseClient
            .from('menu_items')
            .select('id', { count: 'exact', head: true });

        if (menuError) throw menuError;

        // Update DOM
        const elOrders = document.getElementById('statOrdersToday');
        const elRevenue = document.getElementById('statRevenueToday');
        const elPending = document.getElementById('statPendingOrders');
        const elMenuCount = document.getElementById('statMenuCount');

        if (elOrders) elOrders.innerText = ordersToday;
        if (elRevenue) elRevenue.innerText = `Rs. ${revenueToday.toFixed(0)}`;
        if (elPending) elPending.innerText = pendingCount || 0;
        if (elMenuCount) elMenuCount.innerText = menuCount || 0;

    } catch (err) {
        console.error("Error loading dashboard stats:", err);
        if (typeof window.showToast === 'function') {
            window.showToast(`Failed to load stats: ${err.message}`, 'error');
        }
    }
}

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
            const statuses = ['Pending', 'Preparing', 'Ready', 'Completed'];

            let statusOptions = statuses.map(s => {
                const selected = s === order.status ? 'selected' : '';
                return `<option value="${s}" ${selected}>${s}</option>`;
            }).join('');

            html += `
                <tr>
                    <td class="font-mono text-brass fw-bold">#${order.id.toString().slice(0, 8)}</td>
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
            container.innerHTML = `<p class="text-danger text-center">Failed to load orders: ${err.message}</p>`;
        }
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        const { data, error } = await supabaseClient
            .from('orders')
            .update({ status: newStatus })
            .eq('id', parseInt(orderId, 10))
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            throw new Error("No rows were updated. This is likely because Supabase Row Level Security (RLS) is blocking the update. You MUST run the SQL policies provided to allow admins to update orders!");
        }

        if (typeof window.showToast === 'function') {
            window.showToast('Order status updated successfully.', 'success');
        }
        await loadAllOrders();
    } catch (err) {
        console.error("Error updating order status:", err);
        if (typeof window.showToast === 'function') {
            window.showToast(`Failed to update status: ${err.message}`, 'error');
        } else {
            alert(`Failed to update status: ${err.message}`);
        }
    }
}

// --- Menu Management Functions ---

async function loadMenuItems() {
    const container = document.getElementById('menuItemsTableContainer');
    if (!container) return;

    try {
        container.innerHTML = '<div class="text-center p-4"><div class="spinner-border" style="color: var(--brass);"></div></div>';

        const { data: items, error } = await supabaseClient
            .from('menu_items')
            .select('*')
            .order('category')
            .order('name');

        if (error) throw error;

        if (!items || items.length === 0) {
            container.innerHTML = '<p class="text-muted text-center font-mono py-4">No menu items found.</p>';
            return;
        }

        window.currentMenuItems = items;

        let tableHtml = `
            <table class="table table-hover font-body bg-surface mb-0 align-middle">
                <thead style="border-bottom: 2px solid rgba(43, 27, 18, 0.1);">
                    <tr>
                        <th class="font-mono small text-uppercase text-ink border-0">Name</th>
                        <th class="font-mono small text-uppercase text-ink border-0">Category</th>
                        <th class="font-mono small text-uppercase text-ink border-0">Price</th>
                        <th class="font-mono small text-uppercase text-ink border-0">Status</th>
                        <th class="font-mono small text-uppercase text-ink border-0 text-end">Actions</th>
                    </tr>
                </thead>
                <tbody class="border-top-0">
        `;

        items.forEach(item => {
            const badgeClass = item.available ? 'bg-sage text-paper' : 'bg-berry text-paper';
            const badgeText = item.available ? 'Available' : 'Sold Out';

            tableHtml += `
                <tr>
                    <td class="fw-bold">${item.name}</td>
                    <td>${item.category}</td>
                    <td class="font-mono">Rs. ${parseFloat(item.price).toFixed(2)}</td>
                    <td><span class="badge ${badgeClass}">${badgeText}</span></td>
                    <td class="text-end" style="min-width: 140px;">
                        <button class="btn btn-sm btn-outline-ink edit-item-btn" data-id="${item.id}">Edit</button>
                        <button class="btn btn-sm btn-berry ms-1 delete-item-btn" data-id="${item.id}">Delete</button>
                    </td>
                </tr>
            `;
        });

        tableHtml += `</tbody></table>`;
        container.innerHTML = tableHtml;

        container.querySelectorAll('.edit-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => editMenuItem(e.target.getAttribute('data-id')));
        });

        container.querySelectorAll('.delete-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => deleteMenuItem(e.target.getAttribute('data-id')));
        });

    } catch (err) {
        console.error('Error loading menu items:', err);
        container.innerHTML = `<div class="alert alert-danger">Failed to load menu items: ${err.message}</div>`;
    }
}

async function saveMenuItem(data) {
    try {
        let error;
        const submitBtn = document.querySelector('#menuForm button[type="submit"]');
        if (submitBtn) submitBtn.innerText = 'Saving...';

        const payload = {
            name: data.name,
            description: data.description,
            price: data.price,
            category: data.category,
            image_url: data.image_url,
            available: data.available
        };

        if (data.id) {
            const response = await supabaseClient
                .from('menu_items')
                .update(payload)
                .eq('id', parseInt(data.id, 10))
                .select();

            error = response.error;
            if (!error && (!response.data || response.data.length === 0)) {
                throw new Error("No rows updated. Ensure you ran the RLS policies in Supabase.");
            }
        } else {
            const response = await supabaseClient
                .from('menu_items')
                .insert([payload])
                .select();
            error = response.error;
            if (!error && (!response.data || response.data.length === 0)) {
                throw new Error("Insert failed. Ensure you ran the RLS policies in Supabase.");
            }
        }

        if (error) throw error;

        if (typeof window.showToast === 'function') {
            window.showToast(`Item ${data.id ? 'updated' : 'created'} successfully!`, 'success');
        } else {
            alert(`Item ${data.id ? 'updated' : 'created'} successfully!`);
        }

        document.getElementById('menuForm').reset();
        document.getElementById('menuItemId').value = '';
        document.getElementById('menuFormTitle').innerText = 'Add New Item';
        const cancelBtn = document.getElementById('menuFormCancel');
        if (cancelBtn) cancelBtn.classList.add('d-none');

        loadMenuItems();

    } catch (err) {
        console.error('Error saving item:', err);
        if (typeof window.showToast === 'function') {
            window.showToast(`Error: ${err.message}`, 'error');
        } else {
            alert(`Error: ${err.message}`);
        }
    } finally {
        const submitBtn = document.querySelector('#menuForm button[type="submit"]');
        if (submitBtn) submitBtn.innerText = 'Save Item';
    }
}

window.editMenuItem = function (id) {
    if (!window.currentMenuItems) return;

    const item = window.currentMenuItems.find(i => i.id === parseInt(id, 10));
    if (!item) return;

    document.getElementById('menuItemId').value = item.id;
    document.getElementById('menuItemName').value = item.name;
    document.getElementById('menuItemDesc').value = item.description || '';
    document.getElementById('menuItemPrice').value = item.price;
    document.getElementById('menuItemCategory').value = item.category || '';
    document.getElementById('menuItemImage').value = item.image_url || '';
    document.getElementById('menuItemAvailable').checked = item.available;

    document.getElementById('menuFormTitle').innerText = 'Edit Item';
    document.getElementById('menuFormCancel').classList.remove('d-none');

    document.getElementById('menuFormTitle').scrollIntoView({ behavior: 'smooth', block: 'center' });
};

window.deleteMenuItem = async function (id) {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
        const { data, error } = await supabaseClient
            .from('menu_items')
            .delete()
            .eq('id', parseInt(id, 10))
            .select();

        if (error) throw error;
        if (!data || data.length === 0) {
            throw new Error("No rows deleted. Ensure you ran the RLS policies in Supabase.");
        }

        if (typeof window.showToast === 'function') {
            window.showToast('Item deleted successfully.', 'success');
        } else {
            alert('Item deleted successfully.');
        }

        loadMenuItems();
    } catch (err) {
        console.error('Error deleting item:', err);
        if (typeof window.showToast === 'function') {
            window.showToast(`Error deleting item: ${err.message}`, 'error');
        } else {
            alert(`Error deleting item: ${err.message}`);
        }
    }
};
