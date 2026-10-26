/**
 * SOMEP - Lógica de Autenticación de Acceso Administrativo
 * Vanilla JavaScript ES6+
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('admin-login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');
    const alertBox = document.getElementById('login-alert');
    const submitBtn = document.getElementById('btn-submit');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');

    // Manejo de parámetro ?logout=true
    const urlParams = new URLSearchParams(window.location.search);
    const esLogout = urlParams.get('logout') === 'true';

    if (esLogout) {
        alertBox.className = 'alert alert-success';
        alertBox.textContent = 'Has cerrado sesión exitosamente.';
        alertBox.style.display = 'block';
        document.cookie = 'JSESSIONID=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'XSRF-TOKEN=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    } else {
        // Solo verificar sesión previa si NO venimos de un logout voluntario
        verificarSesionPrevia();
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        limpiarErrores();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        let esValido = true;

        if (!username) {
            mostrarErrorCampo(usernameInput, usernameError, 'Ingresa tu usuario o correo electrónico.');
            esValido = false;
        }

        if (!password) {
            mostrarErrorCampo(passwordInput, passwordError, 'Ingresa tu contraseña.');
            esValido = false;
        }

        if (!esValido) return;

        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok && data.autenticado) {
                // Redirigir al panel administrativo tras éxito
                window.location.replace('/admin/index.html');
            } else {
                mostrarAlerta(data.mensaje || 'Credenciales incorrectas. Verifique sus datos.');
                setLoading(false);
            }
        } catch (error) {
            mostrarAlerta('No fue posible conectar con el servidor. Intente nuevamente más tarde.');
            setLoading(false);
        }
    });

    function mostrarErrorCampo(input, errorElement, mensaje) {
        input.classList.add('is-invalid');
        errorElement.textContent = mensaje;
        errorElement.style.display = 'block';
    }

    function limpiarErrores() {
        alertBox.style.display = 'none';
        alertBox.textContent = '';
        usernameInput.classList.remove('is-invalid');
        passwordInput.classList.remove('is-invalid');
        usernameError.style.display = 'none';
        passwordError.style.display = 'none';
    }

    function mostrarAlerta(mensaje) {
        alertBox.textContent = mensaje;
        alertBox.style.display = 'block';
    }

    function setLoading(cargando) {
        if (cargando) {
            submitBtn.disabled = true;
            btnText.textContent = 'Verificando...';
            btnSpinner.style.display = 'inline-block';
        } else {
            submitBtn.disabled = false;
            btnText.textContent = 'Iniciar sesión';
            btnSpinner.style.display = 'none';
        }
    }

    async function verificarSesionPrevia() {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                if (data.autenticado) {
                    window.location.replace('/admin/index.html');
                }
            }
        } catch (ignored) {
            // No hay sesión activa o servidor offline, permanecer en login
        }
    }
});
