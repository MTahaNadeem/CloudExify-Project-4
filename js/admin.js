// Admin dashboard logic

// Protect the admin page
async function requireAdminSession() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error || !session) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
        if (profileError || profile.role !== 'admin') {
            if (typeof window.showToast === 'function') {
                window.showToast('Access denied. Administrator privileges required.', 'error');
            }
            window.location.href = 'index.html';
        }
    } catch (err) {
        window.location.href = 'index.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    requireAdminSession();
});
