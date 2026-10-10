// Inicializa Supabase con tus credenciales
const SUPABASE_URL = 'https://vijvrwsphwyczmmwrgvh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_WmYcNvPImWwB755-wdkJow_nfU0Q2P4';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const MAX_USUARIOS = 2;

// Si ya hay sesión, no pedimos login otra vez
if (localStorage.getItem('usuarioActivo')) {
    window.location.replace('index.html');
}

const form = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const errorMessage = document.getElementById('error-message');

form.addEventListener('submit', async function (event) {
    event.preventDefault();

    // Quita espacios al inicio/final y unifica espacios repetidos
    const valor = usernameInput.value.trim().replace(/\s+/g, ' ');
    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    if (valor === "") {
        mostrarError("Por favor, ingresa un nombre válido.");
        return;
    }

    if (!soloLetras.test(valor)) {
        mostrarError("⚠️ El nombre no puede contener números ni símbolos.");
        return;
    }

    errorMessage.style.display = 'none';
    usernameInput.classList.remove('is-invalid');

    try {
        // 1. Traemos los usuarios existentes
        const { data: usuarios, error } = await _supabase
            .from('user')
            .select('username')
            .order('id', { ascending: true });

        if (error) throw error;

        // 2. Buscamos ignorando mayúsculas/minúsculas
        const existente = usuarios.find(
            u => u.username.toLowerCase() === valor.toLowerCase()
        );

        let nombreFinal;

        if (existente) {
            // Usamos el nombre exacto guardado en la base de datos
            nombreFinal = existente.username;

        } else if (usuarios.length < MAX_USUARIOS) {
            // Hay lugar: se registra como usuario nuevo
            const { error: insertError } = await _supabase
                .from('user')
                .insert([{ username: valor, visit: 0 }]);

            if (insertError) throw insertError;
            nombreFinal = valor;

        } else {
            // Ya están los dos usuarios: no se crean más
            mostrarError("Ese usuario no existe. Revisa cómo escribiste tu nombre.");
            return;
        }

        // 3. Guardamos sesión y redirigimos
        localStorage.setItem('usuarioActivo', nombreFinal);
        window.location.replace('index.html');

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