// Authentication logic

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    // Only bind if the form exists on the current page
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent default page reload

            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const messageDiv = document.getElementById('registerMessage');

            // Disable button during request
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Registering...';
            }

            await registerUser(fullName, email, password);

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Register';
            }
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const messageDiv = document.getElementById('loginMessage');

            const submitBtn = loginForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Logging in...';
            }

            await loginUser(email, password);

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Login';
            }
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await logoutUser();
        });
    }

    updateNavbar();
});

async function registerUser(name, email, password) {
    try {
        // 1. Sign up the user via Supabase Auth
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
        });

        if (authError) throw authError;

        if (authData.user) {
            // 2. Insert into profiles table
            const { error: profileError } = await supabaseClient
                .from('profiles')
                .insert([
                    { id: authData.user.id, full_name: name, role: 'customer' }
                ]);

            if (profileError) throw profileError;

            // 3. Show success and redirect
            if (typeof window.showToast === 'function') window.showToast('Registration successful! Redirecting to login...', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    } catch (error) {
        // 4. Show error
        if (typeof window.showToast === 'function') window.showToast(error.message, 'error');
        else alert(error.message);
    }
}

async function loginUser(email, password) {
    try {
        const { error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        // On success, redirect to index
        window.location.href = 'index.html';
    } catch (error) {
        if (typeof window.showToast === 'function') window.showToast(error.message, 'error');
        else alert(error.message);
    }
}

async function requireUserSession() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error || !session) {
        window.location.href = 'login.html';
    }
}

async function updateNavbar() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const loggedInEls = document.querySelectorAll('.auth-in');
    const loggedOutEls = document.querySelectorAll('.auth-out');
    const adminEls = document.querySelectorAll('.admin-only');
    
    if (session) {
        loggedInEls.forEach(el => el.classList.remove('d-none'));
        loggedOutEls.forEach(el => el.classList.add('d-none'));
        
        // Hide admin elements by default
        adminEls.forEach(el => el.classList.add('d-none'));
        
        try {
            const { data: profile } = await supabaseClient
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();
                
            if (profile && profile.role === 'admin') {
                adminEls.forEach(el => el.classList.remove('d-none'));
            }
        } catch (err) {
            console.error("Error fetching role for navbar:", err);
        }
    } else {
        loggedInEls.forEach(el => el.classList.add('d-none'));
        loggedOutEls.forEach(el => el.classList.remove('d-none'));
    }
}

async function logoutUser() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) console.error("Logout error:", error.message);
    } catch (err) {
        console.error("Unexpected error during logout:", err);
    } finally {
        window.location.href = 'login.html';
    }
}
