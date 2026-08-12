// Menu rendering and interaction logic
let allMenuItems = []; // Store all fetched items for client-side filtering

document.addEventListener('DOMContentLoaded', () => {
    const menuGrid = document.getElementById('menuGrid');
    if (menuGrid) {
        loadMenu();

        // Setup search listener
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                filterAndRenderMenu(e.target.value.toLowerCase(), null);
            });
        }
        
        // Event delegation for Add to Cart buttons
        menuGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                const itemId = parseInt(e.target.getAttribute('data-id'));
                const itemData = allMenuItems.find(i => i.id === itemId);
                if (itemData && typeof window.addToCart === 'function') {
                    window.addToCart(itemData);
                }
            }
        });
    }
});

async function loadMenu() {
    const menuGrid = document.getElementById('menuGrid');

    // Show spinner
    menuGrid.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border" role="status" style="color: var(--primary-color);">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

    try {
        const { data, error } = await supabaseClient
            .from('menu_items')
            .select('*')
            .eq('available', true)
            .order('name');

        if (error) throw error;

        allMenuItems = data || [];

        // Extract distinct categories
        const categories = ['All', ...new Set(allMenuItems.map(item => item.category))];
        renderCategoryFilters(categories);

        // Initial render
        filterAndRenderMenu('', 'All');
    } catch (err) {
        menuGrid.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger text-center shadow-sm">Failed to load menu: ${err.message}</div>
            </div>
        `;
    }
}

// Current active filters
let currentCategory = 'All';
let currentSearch = '';

function filterAndRenderMenu(searchQuery, category) {
    if (category !== null) currentCategory = category;
    if (searchQuery !== null) currentSearch = searchQuery;

    const filteredItems = allMenuItems.filter(item => {
        const matchesCategory = currentCategory === 'All' || item.category === currentCategory;
        const matchesSearch = item.name.toLowerCase().includes(currentSearch) ||
            (item.description && item.description.toLowerCase().includes(currentSearch));
        return matchesCategory && matchesSearch;
    });

    renderMenuGrid(filteredItems);
}

function renderCategoryFilters(categories) {
    const filterContainer = document.getElementById('categoryFilters');
    if (!filterContainer) return;

    filterContainer.innerHTML = categories.map(cat => `
        <button class="btn btn-sm me-2 mb-2 ${cat === currentCategory ? 'active-filter' : 'btn-outline-secondary'}" 
                style="${cat === currentCategory ? 'background-color: var(--ink); color: var(--paper); border: none;' : 'color: var(--ink); border-color: var(--ink);'}"
                onclick="handleCategoryClick('${cat}', this)">
            ${cat}
        </button>
    `).join('');
}

window.handleCategoryClick = function (category, btnElement) {
    // Update active button styling
    const buttons = document.querySelectorAll('#categoryFilters button');
    buttons.forEach(btn => {
        btn.classList.remove('active-filter');
        btn.style = 'color: var(--ink); border-color: var(--ink);';
    });

    btnElement.classList.add('active-filter');
    btnElement.style = 'background-color: var(--ink); color: var(--paper); border: none;';

    filterAndRenderMenu(null, category);
};

function renderMenuGrid(items) {
    const menuGrid = document.getElementById('menuGrid');

    if (items.length === 0) {
        menuGrid.innerHTML = `<div class="col-12 text-center text-muted py-5">No items found matching your criteria.</div>`;
        return;
    }

    // Placeholder SVG for broken/missing images
    const fallbackImage = `data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22286%22%20height%3D%22180%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20286%20180%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23F2E3D0%22%3E%3C%2Frect%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20fill%3D%22%236F4E37%22%20dy%3D%22.3em%22%20style%3D%22font-size%3A1.5rem;font-weight%3Abold;text-anchor%3Amiddle%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E`;

    menuGrid.innerHTML = items.map(item => `
        <div class="col-12 col-md-6 col-lg-4">
            <div class="ticket-wrapper">
                <div class="card ticket-card h-100">
                    <div class="category-stamp">${item.category}</div>
                    <img src="${item.image_url}" class="card-img-top" alt="${item.name}" style="height: 200px; object-fit: cover;" onerror="this.src='${fallbackImage}'">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title font-display mb-0 text-ink">${item.name}</h5>
                        </div>
                        <p class="card-text small flex-grow-1 font-body text-ink" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; opacity: 0.85;">${item.description || ''}</p>
                        
                        <div class="d-flex justify-content-between align-items-center mt-3 pt-3" style="border-top: 1px dashed rgba(43, 27, 18, 0.2);">
                            <span class="font-mono text-brass fw-bold fs-5">Rs. ${parseFloat(item.price).toFixed(2)}</span>
                            <button class="btn btn-brass add-to-cart-btn px-4" data-id="${item.id}">
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}
