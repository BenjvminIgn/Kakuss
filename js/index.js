const SUPABASE_URL = 'https://vijvrwsphwyczmmwrgvh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_WmYcNvPImWwB755-wdkJow_nfU0Q2P4';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 1. Recuperamos el nombre del usuario que acaba de entrar
const usuarioActivo = localStorage.getItem('usuarioActivo');
const headerUsername = document.getElementById('username');

// Si no hay sesión, al login (ajusta el nombre del archivo)
if (!usuarioActivo) {
    window.location.replace('login.html');
}

if (headerUsername && usuarioActivo) {
    headerUsername.innerText = usuarioActivo;
}



// Referencias Tarjeta 1
const nombre1 = document.getElementById('nombre-user1');
const contador1 = document.getElementById('contador-user1');
const card1 = document.getElementById('card-1');
const bar1 = document.getElementById('bar-1');
const leyenda1 = document.getElementById('leyenda-user1');

// Referencias Tarjeta 2
const nombre2 = document.getElementById('nombre-user2');
const contador2 = document.getElementById('contador-user2');
const card2 = document.getElementById('card-2');
const bar2 = document.getElementById('bar-2');
const leyenda2 = document.getElementById('leyenda-user2');

const totalGeneral = document.getElementById('total-general');

let user1Name = "";
let user2Name = "";


async function sumarPunto(username, elementoContador) {
    if (!username) return;

    try {
        // 1. Registrar la visita en el historial
        const { error: errorVisita } = await _supabase
            .from('visits')
            .insert([{ username: username }]);

        if (errorVisita) throw errorVisita;

        // 2. Obtener el total acumulado del usuario
        const { data: usuario, error: errorConsulta } = await _supabase
            .from('user')
            .select('visit')
            .eq('username', username)
            .single();

        if (errorConsulta) throw errorConsulta;

        // 3. Incrementar el total acumulado
        const nuevoTotal = (Number(usuario.visit) || 0) + 1;

        const { error: errorActualizacion } = await _supabase
            .from('user')
            .update({ visit: nuevoTotal })
            .eq('username', username);

        if (errorActualizacion) throw errorActualizacion;

        // 4. Actualizar el tablero diario
        await cargarTablero();

        console.log(
            `Visita registrada para ${username}. Total acumulado: ${nuevoTotal}`
        );

    } catch (error) {
        console.error('Error al registrar la visita:', error);
    }
}


// 4. Lógica visual de la barra de progreso
function actualizarBarra(v1, v2) {
    const total = v1 + v2;
    if (totalGeneral) totalGeneral.innerText = total;

    if (total === 0) {
        if (bar1) bar1.style.width = '50%';
        if (bar2) bar2.style.width = '50%';
    } else {
        const pct1 = (v1 / total) * 100;
        const pct2 = (v2 / total) * 100;
        if (bar1) bar1.style.width = `${pct1}%`;
        if (bar2) bar2.style.width = `${pct2}%`;
    }
}

// 5. Asignar clics a las tarjetas
if (card1) card1.addEventListener('click', () => sumarPunto(user1Name, contador1));
if (card2) card2.addEventListener('click', () => sumarPunto(user2Name, contador2));

// Iniciar al cargar la página
cargarTablero();

// Inicio del día actual en la hora local del dispositivo
function inicioDelDia() {
    const fecha = new Date();
    fecha.setHours(0, 0, 0, 0);
    return fecha;
}

// Cargar visitas del día actual
async function cargarTablero() {
    try {
        const inicio = inicioDelDia();
        const fin = new Date(inicio);
        fin.setDate(fin.getDate() + 1);

        const { data: usuarios, error: errorUsuarios } =
            await _supabase
                .from('user')
                .select('username')
                .order('id', { ascending: true });

        if (errorUsuarios) throw errorUsuarios;

        const { data: visitas, error: errorVisitas } =
            await _supabase
                .from('visits')
                .select('username, created_at')
                .gte('created_at', inicio.toISOString())
                .lt('created_at', fin.toISOString());

        if (errorVisitas) throw errorVisitas;

        const conteo = {};

        usuarios.forEach(usuario => {
            conteo[usuario.username] = 0;
        });

        visitas.forEach(visita => {
            conteo[visita.username] =
                (conteo[visita.username] || 0) + 1;
        });

        user1Name = usuarios[0]?.username || '';
        user2Name = usuarios[1]?.username || '';

        const v1 = conteo[user1Name] || 0;
        const v2 = conteo[user2Name] || 0;

        if (nombre1) {
            nombre1.textContent =
                user1Name === usuarioActivo
                    ? `${user1Name} (Tú)`
                    : user1Name;
        }

        if (nombre2) {
            nombre2.textContent =
                user2Name === usuarioActivo
                    ? `${user2Name} (Tú)`
                    : user2Name;
        }

        if (contador1) contador1.textContent = v1;
        if (contador2) contador2.textContent = v2;

        if (leyenda1) leyenda1.textContent = user1Name;
        if (leyenda2) leyenda2.textContent = user2Name;

        actualizarBarra(v1, v2);

    } catch (error) {
        console.error('Error cargando visitas del día:', error);
    }
}

// ===== Datos curiosos aleatorios (API) =====
async function traducirAEspanol(texto) {
    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=en|es`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        return data.responseData.translatedText || texto;
    } catch {
        return texto; // si falla la traducción, se muestra en inglés
    }
}

async function obtenerDato() {
    const jokeText = document.getElementById('joke-text');
    if (!jokeText) return;

    jokeText.innerText = "Buscando sabiduría... 📜";

    try {
        // 1. Obtenemos el dato curioso (en inglés)
        const resFact = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random');
        const dataFact = await resFact.json();
        const textoIngles = dataFact.text;

        // 2. Lo traducimos al español al instante usando la API abierta de Google Translate
        const urlTraductor = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(textoIngles)}`;
        const resTrad = await fetch(urlTraductor);
        const dataTrad = await resTrad.json();

        // Extraemos el texto ya traducido
        const textoEspanol = dataTrad[0][0][0];

        // 3. Lo mostramos en pantalla
        jokeText.innerText = textoEspanol;

    } catch (error) {
        console.error("Error al obtener o traducir el dato:", error);
        jokeText.innerText = "Ups, nos quedamos sin datos curiosos. 🧻";
    }
}

// Ejecutar al cargar la página
obtenerDato();