const SUPABASE_URL = 'https://vijvrwsphwyczmmwrgvh.supabase.co';
const SUPABASE_ANON_KEY = 'TU_CLAVE_PUBLICABLE';

const _supabase = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril',
    'Mayo', 'Junio', 'Julio', 'Agosto',
    'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

let usuarios = [];
let visitas = [];
let fechaSeleccionada = new Date();

function nombreMes(fecha) {
    return `${monthNames[fecha.getMonth()]} ${fecha.getFullYear()}`;
}

function fechaLocal(fecha) {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
}

async function cargarEstadisticas() {
    try {
        const { data: listaUsuarios, error: errorUsuarios } =
            await _supabase
                .from('user')
                .select('username')
                .order('id', { ascending: true });

        if (errorUsuarios) throw errorUsuarios;

        const { data: listaVisitas, error: errorVisitas } =
            await _supabase
                .from('visits')
                .select('username, created_at')
                .order('created_at', { ascending: true });

        if (errorVisitas) throw errorVisitas;

        usuarios = listaUsuarios || [];
        visitas = listaVisitas || [];

        renderMonthData();

    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        document.getElementById('current-month').textContent =
            'Error al cargar';
    }
}

function renderMonthData() {
    const inicio = new Date(
        fechaSeleccionada.getFullYear(),
        fechaSeleccionada.getMonth(),
        1
    );

    const fin = new Date(
        fechaSeleccionada.getFullYear(),
        fechaSeleccionada.getMonth() + 1,
        1
    );

    const visitasMes = visitas.filter(visita => {
        const fecha = new Date(visita.created_at);
        return fecha >= inicio && fecha < fin;
    });

    const nombres = usuarios.map(u => u.username);

    // Conteo mensual por usuario
    const conteos = {};
    nombres.forEach(nombre => conteos[nombre] = 0);

    visitasMes.forEach(visita => {
        conteos[visita.username] =
            (conteos[visita.username] || 0) + 1;
    });

    const usuario1 = nombres[0] || 'Usuario 1';
    const usuario2 = nombres[1] || 'Usuario 2';

    const total1 = conteos[usuario1] || 0;
    const total2 = conteos[usuario2] || 0;
    const total = total1 + total2;

    const porcentaje1 = total ? total1 / total * 100 : 50;
    const porcentaje2 = total ? total2 / total * 100 : 50;

    // Encabezado del mes
    document.getElementById('current-month').textContent =
        nombreMes(fechaSeleccionada);

    document.getElementById('winner-month').textContent =
        monthNames[fechaSeleccionada.getMonth()];

    // Nombres de los usuarios
    document.getElementById('label-sam').textContent = usuario1;
    document.getElementById('label-alex').textContent = usuario2;

    // Puntuaciones
    document.getElementById('score-sam').textContent = total1;
    document.getElementById('score-alex').textContent = total2;

    // Barras de progreso
    document.getElementById('bar-sam').style.width =
        `${porcentaje1}%`;

    document.getElementById('bar-alex').style.width =
        `${porcentaje2}%`;

    // Total y porcentajes
    document.getElementById('total-visits').textContent =
        `${total} visitas`;

    document.getElementById('percentage-text').textContent =
        `${porcentaje1.toFixed(1)}% vs ${porcentaje2.toFixed(1)}%`;

    // Ganador
    const diferencia = Math.abs(total1 - total2);
    let textoGanador;

    if (total1 === total2) {
        textoGanador = '¡Empate!';
    } else {
        const ganador = total1 > total2 ? usuario1 : usuario2;
        textoGanador = `${ganador} lidera el trono`;
    }

    document.getElementById('winner-text').textContent =
        textoGanador;

    document.getElementById('winner-diff').textContent =
        total1 === total2 ? '0' : `+${diferencia}`;

    // Récord: mayor número de visitas en un mismo día
    const conteoDiario = {};

    visitasMes.forEach(visita => {
        const dia = fechaLocal(new Date(visita.created_at));
        const clave = `${dia}|${visita.username}`;

        conteoDiario[clave] = (conteoDiario[clave] || 0) + 1;
    });

    let recordNombre = 'Sin registros';
    let recordVisitas = 0;
    let recordDia = '';

    Object.entries(conteoDiario).forEach(([clave, cantidad]) => {
        if (cantidad > recordVisitas) {
            const [dia, nombre] = clave.split('|');
            recordVisitas = cantidad;
            recordNombre = nombre;
            recordDia = dia;
        }
    });

    document.getElementById('record-text').textContent =
        recordVisitas > 0
            ? `${recordNombre}: ${recordVisitas} visitas (${recordDia})`
            : 'Sin visitas registradas este mes';
}

function changeMonth(direction) {
    fechaSeleccionada = new Date(
        fechaSeleccionada.getFullYear(),
        fechaSeleccionada.getMonth() + direction,
        1
    );

    renderMonthData();
}

document.addEventListener('DOMContentLoaded', cargarEstadisticas);
