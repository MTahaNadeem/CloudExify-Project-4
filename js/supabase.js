const SUPABASE_URL = 'https://nekmitkyuhkaicbcqwai.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_uvtp6SvNk38AlINUFbQPEg_3tk7YXQL';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Universal Toast System ---
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('toastContainer')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        // Positioned top-right, stacked above all offcanvas/modals
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3 mt-5';
        toastContainer.style.zIndex = '1060'; 
        document.body.appendChild(toastContainer);
    }
});

window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return; // Fallback if called before DOM ready
    
    const toastEl = document.createElement('div');
    toastEl.className = 'toast align-items-center border-0 shadow-lg';
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    // Solid background and text color based on type
    if (type === 'success') {
        toastEl.style.backgroundColor = 'var(--sage)';
        toastEl.style.color = 'var(--paper)';
    } else if (type === 'error' || type === 'danger') {
        toastEl.style.backgroundColor = 'var(--ink)';
        toastEl.style.color = 'var(--paper)';
    } else if (type === 'warning') {
        toastEl.style.backgroundColor = 'var(--brass)';
        toastEl.style.color = 'var(--paper)';
    } else {
        toastEl.style.backgroundColor = 'var(--surface)';
        toastEl.style.color = 'var(--ink)';
    }

    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body font-body fw-bold" style="font-size: var(--text-md);">
          ${message}
        </div>
        <button type="button" class="btn-close me-2 m-auto ${(type === 'success' || type === 'error' || type === 'danger' || type === 'warning') ? 'btn-close-white' : ''}" data-bs-dismiss="toast" aria-label="Close"></button>
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
