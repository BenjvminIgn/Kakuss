// Inicializa Supabase con tus credenciales
const SUPABASE_URL = 'TUS_CREDENCIALES_URL';
const SUPABASE_ANON_KEY = 'TUS_CREDENCIALES_ANON_KEY';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const errorMessage = document.getElementById('error-message');

form.addEventListener('submit', async function(event) {
    event.preventDefault(); 

    const valor = usernameInput.value.trim();
    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    if (valor === "") {
        mostrarError("Por favor, ingresa un nombre válido.");
        return;
    }

    if (!soloLetras.test(valor)) {
        mostrarError("⚠️ El nombre no puede contener números ni símbolos.");
        usernameInput.classList.add('is-invalid');
        return;
    }

    errorMessage.style.display = 'none';
    usernameInput.classList.remove('is-invalid');

    try {
        // Consultamos o insertamos el usuario en la base de datos de Supabase
        const { data, error } = await _supabase
            .from('usuarios')
            .select('*')
            .eq('nombre', valor);

        if (error) throw error;

        // Si el usuario no existe en la base de datos, lo podemos registrar automáticamente
        if (data.length === 0) {
            await _supabase
                .from('usuarios')
                .insert([{ nombre: valor, visitas: 0 }]);
        }

        // Guardamos el usuario actual en la sesión activa de la pestaña actual (opcional) 
        // o pasamos directo al index.html llevando el nombre por URL o variable de sesión segura
        sessionStorage.setItem('usuarioActivo', valor);

        // ¡Redirección a la app principal!
        window.location.href = 'index.html';

    } catch (err) {
        console.error("Error al conectar con Supabase:", err);
        mostrarError("Hubo un error de conexión con la base de datos.");
    }
});

function mostrarError(mensaje) {
    errorMessage.innerText = mensaje;
    errorMessage.style.display = 'block';
    usernameInput.classList.add('is-invalid');
}