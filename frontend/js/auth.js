/**
 * NextHire — Auth Logic (auth.js)
 * Login/Register form handling, tab switching, password toggle.
 * Used on login.html.
 */

(function() {
    'use strict';

    // ── If already logged in, redirect away ──
    if (typeof redirectIfAuth === 'function') {
        redirectIfAuth();
    }

    // ── DOM Refs ──
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const toggleLogin = document.getElementById('auth-toggle-login');
    const toggleRegister = document.getElementById('auth-toggle-register');
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');

    // ── Check URL for mode=register ──
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'register') {
        showForm('register');
    }

    // ── Tab Switching ──
    function showForm(mode) {
        if (mode === 'register') {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            tabLogin.classList.remove('active');
            tabRegister.classList.add('active');
            toggleLogin.classList.add('hidden');
            toggleRegister.classList.remove('hidden');
            authTitle.textContent = 'Create Account';
            authSubtitle.textContent = 'Start your AI-powered placement preparation';
        } else {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
            toggleLogin.classList.remove('hidden');
            toggleRegister.classList.add('hidden');
            authTitle.textContent = 'Welcome Back';
            authSubtitle.textContent = 'Sign in to continue your preparation';
        }
    }

    tabLogin.addEventListener('click', () => showForm('login'));
    tabRegister.addEventListener('click', () => showForm('register'));
    switchToRegister.addEventListener('click', (e) => { e.preventDefault(); showForm('register'); });
    switchToLogin.addEventListener('click', (e) => { e.preventDefault(); showForm('login'); });

    // ── Login Handler ──
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('login-submit');
        const originalText = submitBtn.textContent;

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Signing in...';

        try {
            const response = await apiFetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: document.getElementById('login-email').value.trim(),
                    password: document.getElementById('login-password').value,
                }),
            });

            // Store token and user data
            localStorage.setItem('nexthire_token', response.token);
            localStorage.setItem('nexthire_user', JSON.stringify(response.user));

            Toast.success('Welcome back! Redirecting...');

            // Redirect
            setTimeout(() => {
                const redirect = typeof getRedirectUrl === 'function' ? getRedirectUrl() : '/dashboard';
                window.location.href = redirect;
            }, 800);

        } catch (error) {
            Toast.error(error.message || 'Login failed. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    // ── Register Handler ──
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('register-submit');
        const originalText = submitBtn.textContent;

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Creating Account...';

        try {
            const response = await apiFetch('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    name: document.getElementById('register-name').value.trim(),
                    email: document.getElementById('register-email').value.trim(),
                    password: document.getElementById('register-password').value,
                }),
            });

            // Store token and user data
            localStorage.setItem('nexthire_token', response.token);
            localStorage.setItem('nexthire_user', JSON.stringify(response.user));

            Toast.success('Account created! Welcome to NextHire!');

            // Redirect
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 800);

        } catch (error) {
            Toast.error(error.message || 'Registration failed. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
})();

// ── Password Visibility Toggle (global) ──
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁️';
    }
}
