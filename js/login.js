// Inicializa Supabase con tus credenciales
const SUPABASE_URL = 'https://vijvrwsphwyczmmwrgvh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_WmYcNvPImWwB755-wdkJow_nfU0Q2P4';
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
        // 1. Consultamos correctamente si el usuario ya existe por su nombre
        const { data, error } = await _supabase
            .from('user')
            .select('*')
            .eq('username', valor);

        if (error) throw error;

        // 2. Si el usuario no está registrado en la base de datos, lo creamos con visit: 0
        if (data.length === 0) {
            const { error: insertError } = await _supabase
                .from('user')
                .insert([{ username: valor, visit: 0 }]);

            if (insertError) throw insertError;
        }

        // 3. Guardamos sesión y redirigimos
        localStorage.setItem('usuarioActivo', valor);
        window.location.href = 'index.html';


    } catch (err) {
        console.error("Error al conectar con Supabase:", err);
        mostrarError("Hubo un error al conectar con la base de datos.");
    }
});

function mostrarError(mensaje) {
    errorMessage.innerText = mensaje;
    errorMessage.style.display = 'block';
    usernameInput.classList.add('is-invalid');
}