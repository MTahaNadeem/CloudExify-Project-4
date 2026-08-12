const SUPABASE_URL = 'https://nekmitkyuhkaicbcqwai.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_uvtp6SvNk38AlINUFbQPEg_3tk7YXQL';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Universal Toast System ---
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('toastContainer')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
});

window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return; // Fallback if called before DOM ready
    
    const toastEl = document.createElement('div');
    toastEl.className = 'toast align-items-center text-white border-0 shadow';
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    // Theme colors mapping
    let bgClass = 'bg-primary'; // Default fallback
    if (type === 'success') bgClass = 'bg-success';
    if (type === 'error' || type === 'danger') bgClass = 'bg-danger';
    if (type === 'warning') bgClass = 'bg-warning text-dark';
    if (type === 'info') bgClass = 'bg-info text-dark';

    // Cafe & Bakery theme overrides
    if (type === 'success') toastEl.style.backgroundColor = 'var(--primary-color)';
    else if (type === 'error' || type === 'danger') toastEl.style.backgroundColor = '#dc3545';
    else toastEl.classList.add(bgClass);

    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body fw-bold">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
    
    container.appendChild(toastEl);
    
    if (typeof bootstrap !== 'undefined') {
        const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
        toast.show();
        toastEl.addEventListener('hidden.bs.toast', () => {
            toastEl.remove();
        });
    } else {
        // Fallback if bootstrap JS is missing
        setTimeout(() => toastEl.remove(), 4000);
    }
};
