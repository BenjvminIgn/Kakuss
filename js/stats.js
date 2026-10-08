// Generar historial de meses dinámicamente hasta el mes actual
const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function generateMockDataUntilNow() {
    const data = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Generar datos desde hace 6 meses hasta el mes actual
    for (let i = 5; i >= 0; i--) {
        let d = new Date(currentYear, currentMonth - i, 1);
        let mName = monthNames[d.getMonth()];
        let y = d.getFullYear();
        
        // Simular datos de visitas para los meses pasados
        let samVisits = Math.floor(Math.random() * 40) + 110; 
        let alexVisits = Math.floor(Math.random() * 40) + 110;
        
        data.push({
            month: `${mName} ${y}`,
            sam: samVisits,
            alex: alexVisits,
            recordName: Math.random() > 0.5 ? "Sam" : "Alex",
            recordVisits: Math.floor(Math.random() * 4) + 8 
        });
    }
    return data;
}

const monthlyData = generateMockDataUntilNow();
let currentIndex = monthlyData.length - 1; // Inicia siempre en el último mes disponible (el mes actual)

function renderMonthData(index) {
    const data = monthlyData[index];
    
    // Asignar mes
    document.getElementById("current-month").innerText = data.month;
    const monthName = data.month.split(" ")[0];
    document.getElementById("winner-month").innerText = monthName;
    
    // Lógica para progreso idéntica a index.js
    const total = data.sam + data.alex;
    let samPercent = 50;
    let alexPercent = 50;
    
    if (total > 0) {
        samPercent = ((data.sam / total) * 100).toFixed(1);
        alexPercent = ((data.alex / total) * 100).toFixed(1);
    }
    
    // Calcular ganador y la diferencia (badge)
    const winnerName = data.sam >= data.alex ? "Sam" : "Alex";
    const diff = Math.abs(data.sam - data.alex);
    
    document.getElementById("winner-text").innerText = `${winnerName} lidera el trono`;
    document.getElementById("winner-diff").innerText = `+${diff}`;
    
    // Textos de las cards
    document.getElementById("score-sam").innerText = data.sam;
    document.getElementById("score-alex").innerText = data.alex;
    
    // Aplicar ancho de las barras de progreso
    document.getElementById("bar-sam").style.width = samPercent + '%';
    document.getElementById("bar-alex").style.width = alexPercent + '%';
    
    // Totales inferiores de la card principal
    document.getElementById("total-visits").innerText = `${total} visitas`;
    document.getElementById("percentage-text").innerText = `${samPercent}% vs ${alexPercent}%`;
    
    // Tarjeta del Récord
    document.getElementById("record-text").innerText = `${data.recordName} con ${data.recordVisits} visitas`;
}

// Función que se llama al tocar las flechas
function changeMonth(direction) {
    currentIndex += direction;
    
    // Evitar que se salga de los límites de los datos mockeados
    if (currentIndex < 0) {
        currentIndex = 0;
    }
    if (currentIndex >= monthlyData.length) {
        currentIndex = monthlyData.length - 1;
    }
    
    renderMonthData(currentIndex);
}

// Inicializar al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
    renderMonthData(currentIndex);
});
