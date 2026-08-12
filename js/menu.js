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

    filterContainer.innerHTML = categories.map(cat => {
        const count = cat === 'All' ? allMenuItems.length : allMenuItems.filter(i => i.category === cat).length;
        return `
        <button class="btn btn-sm me-2 mb-2 ${cat === currentCategory ? 'active-filter' : 'btn-outline-secondary'}" 
                style="${cat === currentCategory ? 'background-color: var(--ink); color: var(--paper); border: none;' : 'color: var(--ink); border-color: var(--ink);'}"
                onclick="handleCategoryClick('${cat}', this)">
            ${cat} <span class="badge rounded-pill bg-brass text-paper ms-1 opacity-75" style="font-size: 0.75em;">${count}</span>
        </button>
        `;
    }).join('');
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

    menuGrid.innerHTML = items.map(item => {
        const stockClass = item.available ? 'in-stock' : 'sold-out';
        const stockText = item.available ? 'In stock' : 'Sold out';
        const safeName = item.name.replace(/'/g, "&#39;");
        
        return `
        <div class="col-12 col-md-6 col-lg-4">
            <div class="ticket-wrapper">
                <div class="card ticket-card h-100">
                    <div class="category-stamp">${item.category}</div>
                    <div class="img-container">
                        <img src="${item.image_url}" class="card-img-top" alt="${safeName}" onerror="this.outerHTML='<div class=\\'img-fallback\\'>${safeName}</div>'">
                    </div>
                    <div class="card-body d-flex flex-column p-4 pt-4 pb-4">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title font-display mb-0 text-ink">${item.name}</h5>
                        </div>
                        <p class="card-text small flex-grow-1 font-body text-ink" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; opacity: 0.85;">${item.description || ''}</p>
                        
                        <div class="d-flex justify-content-between align-items-center mt-3 pt-3" style="border-top: 1px dashed rgba(43, 27, 18, 0.2);">
                            <div>
                                <span class="font-mono text-brass fw-bold fs-5 d-block">Rs. ${parseFloat(item.price).toFixed(2)}</span>
                                <span class="font-body text-ink opacity-75" style="font-size: 0.7rem;"><span class="availability-dot ${stockClass}"></span>${stockText}</span>
                            </div>
                            <button class="btn btn-brass add-to-cart-btn px-4" data-id="${item.id}" ${!item.available ? 'disabled' : ''}>
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}
