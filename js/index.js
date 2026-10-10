const SUPABASE_URL = 'https://vijvrwsphwyczmmwrgvh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_WmYcNvPImWwB755-wdkJow_nfU0Q2P4';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
 
// ===== Sesión =====
const usuarioActivo = localStorage.getItem('usuarioActivo');
const headerUsername = document.getElementById('username');
 
// Si no hay sesión, al login
if (!usuarioActivo) {
    window.location.replace('login.html');
}
 
if (headerUsername && usuarioActivo) {
    headerUsername.innerText = usuarioActivo;
}
 
// ===== Referencias del DOM =====
 
// Tarjeta 1
const nombre1 = document.getElementById('nombre-user1');
const contador1 = document.getElementById('contador-user1');
const card1 = document.getElementById('card-1');
const bar1 = document.getElementById('bar-1');
const leyenda1 = document.getElementById('leyenda-user1');
const restar1 = document.getElementById('restar-1');
 
// Tarjeta 2
const nombre2 = document.getElementById('nombre-user2');
const contador2 = document.getElementById('contador-user2');
const card2 = document.getElementById('card-2');
const bar2 = document.getElementById('bar-2');
const leyenda2 = document.getElementById('leyenda-user2');
const restar2 = document.getElementById('restar-2');
 
const totalGeneral = document.getElementById('total-general');
 
// ===== Estado =====
let user1Name = "";
let user2Name = "";
let procesandoResta = false;
 
// ===== Utilidades =====
 
// Inicio del día actual en la hora local del dispositivo
function inicioDelDia() {
    const fecha = new Date();
    fecha.setHours(0, 0, 0, 0);
    return fecha;
}
 
// ===== Sumar visita =====
async function sumarPunto(username) {
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
 
// ===== Restar visita (solo del usuario activo) =====
async function deshacerVisita() {
    if (!usuarioActivo || procesandoResta) return;
    procesandoResta = true;
 
    try {
        const inicio = inicioDelDia();
        const fin = new Date(inicio);
        fin.setDate(fin.getDate() + 1);
 
        // Última visita de hoy SOLO del usuario activo
        const { data: ultima, error: errorUltima } = await _supabase
            .from('visits')
            .select('created_at')
            .eq('username', usuarioActivo)
            .gte('created_at', inicio.toISOString())
            .lt('created_at', fin.toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
 
        if (errorUltima) throw errorUltima;
        if (!ultima) return;
 
        // Borrar esa visita y comprobar que de verdad se borró
        const { data: borradas, error: errorBorrar } = await _supabase
            .from('visits')
            .delete()
            .eq('username', usuarioActivo)
            .eq('created_at', ultima.created_at)
            .select();
 
        if (errorBorrar) throw errorBorrar;
 
        if (!borradas || borradas.length === 0) {
            throw new Error(
                'No se borró ninguna visita (¿falta la política de DELETE en RLS?)'
            );
        }
 
        // Restar 1 al total acumulado
        const { data: usuario, error: errorUsuario } = await _supabase
            .from('user')
            .select('visit')
            .eq('username', usuarioActivo)
            .single();
 
        if (errorUsuario) throw errorUsuario;
 
        const nuevoTotal = Math.max(0, (Number(usuario.visit) || 0) - 1);
 
        const { error: errorActualizar } = await _supabase
            .from('user')
            .update({ visit: nuevoTotal })
            .eq('username', usuarioActivo);
 
        if (errorActualizar) throw errorActualizar;
 
    } catch (error) {
        console.error('Error al quitar la visita:', error);
    } finally {
        procesandoResta = false;
        await cargarTablero();
    }
}
 
// ===== Barra de progreso =====
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
 
// ===== Cargar visitas del día actual =====
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
 
        // El "−" solo aparece en TU tarjeta y si tienes visitas hoy
        if (restar1) restar1.style.display =
            (user1Name === usuarioActivo && v1 > 0) ? 'flex' : 'none';
        if (restar2) restar2.style.display =
            (user2Name === usuarioActivo && v2 > 0) ? 'flex' : 'none';
 
    } catch (error) {
        console.error('Error cargando visitas del día:', error);
    }
}
 
// ===== Eventos =====
 
// Cada uno solo puede sumar en su propia tarjeta
if (card1) card1.addEventListener('click', () => {
    if (user1Name === usuarioActivo) sumarPunto(user1Name);
});
 
if (card2) card2.addEventListener('click', () => {
    if (user2Name === usuarioActivo) sumarPunto(user2Name);
});
 
// Botón "−": stopPropagation evita que el toque también cuente como sumar
[restar1, restar2].forEach(btn => {
    if (btn) btn.addEventListener('click', (e) => {
        e.stopPropagation();
        deshacerVisita();
    });
});
 
// ===== Datos curiosos aleatorios (API) =====
async function obtenerDato() {
    const jokeText = document.getElementById('joke-text');
    if (!jokeText) return;
 
    jokeText.innerText = "Buscando sabiduría... 📜";
 
    try {
        // 1. Obtenemos el dato curioso (en inglés)
        const resFact = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random');
        const dataFact = await resFact.json();
        const textoIngles = dataFact.text;
 
        // 2. Lo traducimos al español con Google Translate
        const urlTraductor = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(textoIngles)}`;
        const resTrad = await fetch(urlTraductor);
        const dataTrad = await resTrad.json();
 
        // 3. Extraemos el texto traducido y lo mostramos
        jokeText.innerText = dataTrad[0][0][0];
 
    } catch (error) {
        console.error("Error al obtener o traducir el dato:", error);
        jokeText.innerText = "Ups, nos quedamos sin datos curiosos. 🧻";
    }
}
 
// ===== Iniciar al cargar la página =====
cargarTablero();
obtenerDato();
 