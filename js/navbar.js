document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch the navbar HTML using absolute path from root
        const response = await fetch('/partials/navbar.html');
        if (!response.ok) throw new Error('Failed to load navbar');
        const navbarHtml = await response.text();
        
        // Inject into the placeholder
        const headerPlaceholder = document.getElementById('site-navbar');
        if (headerPlaceholder) {
            headerPlaceholder.innerHTML = navbarHtml;
        }

        // Re-attach scroll listener for sticky nav
        const nav = document.getElementById('mainNav');
        if (nav) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }
            });
            // Initial check in case page is loaded already scrolled
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            }
        }

        // Re-attach logout listener since the button is newly injected
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn && typeof window.logoutUser === 'function') {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await window.logoutUser();
            });
        }

        // Update auth state in the navbar
        if (typeof window.updateNavbar === 'function') {
            await window.updateNavbar();
        }

    } catch (err) {
        console.error('Navbar injection failed:', err);
    }
});
