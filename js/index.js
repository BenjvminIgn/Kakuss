// Obtener fecha actual en formato YYYY-MM-DD
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

// Inicializar contadores y verificar reinicio diario
let today = getTodayDate();
let storedDate = localStorage.getItem('kakus_date');

if (storedDate !== today) {
    // Si la fecha guardada es diferente a hoy (o no existe), resetear a 0
    localStorage.setItem('kakus_countUser1', 0);
    localStorage.setItem('kakus_countUser2', 0);
    localStorage.setItem('kakus_date', today);
}

let countUser1 = parseInt(localStorage.getItem('kakus_countUser1')) || 0;
let countUser2 = parseInt(localStorage.getItem('kakus_countUser2')) || 0;

// Actualizar valores iniciales en la vista
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('contador-user1').innerText = countUser1;
    document.getElementById('contador-user2').innerText = countUser2;
    actualizaBarra(); // para que muestre el progreso inicial al cargar
});

const card1 = document.getElementById('card-1');
const card2 = document.getElementById('card-2');

card1.addEventListener('click', function(){
    countUser1++;
    localStorage.setItem('kakus_countUser1', countUser1); // Guarda al hacer click
    document.getElementById('contador-user1').innerText = countUser1;
    actualizaBarra();
}); 

card2.addEventListener('click', function(){
    countUser2++;
    localStorage.setItem('kakus_countUser2', countUser2); // Guarda al hacer click
    document.getElementById('contador-user2').innerText = countUser2;
    actualizaBarra();
});

//fin//


//Actualizar barra//

function actualizaBarra(){
    let total = countUser1 + countUser2;
    document.getElementById('total-general').innerText = total;
    
    let porcUser1 = 50;
    let porcUser2 = 50;

    if (total > 0) {
        porcUser1 = (countUser1 / total) * 100
        porcUser2 = (countUser2 / total) * 100
    }
    
    document.getElementById('bar-1').style.width = porcUser1 + '%';
    document.getElementById('bar-2').style.width = porcUser2 + '%';
}


//API datos curiosos//

// Función para consumir una API de datos curiosos genuinos y traducirlos
function obtenerDato() {
    const jokeElement = document.getElementById('joke-text');
    jokeElement.innerText = "Buscando un dato interesante...";

    // 1. Obtenemos un dato curioso en inglés (ya que las mejores APIs de datos son en inglés)
    fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en')
        .then(response => response.json())
        .then(data => {
            const englishFact = data.text;
            
            // 2. Usamos una API de traducción gratuita (MyMemory) para pasarlo a español
            return fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(englishFact)}&langpair=en|es`);
        })
        .then(response => response.json())
        .then(translateData => {
            if (translateData && translateData.responseData && translateData.responseData.translatedText) {
                jokeElement.innerText = translateData.responseData.translatedText;
            } else {
                jokeElement.innerText = "Los delfines duermen con un ojo abierto para estar alertas.";
            }
        })
        .catch(error => {
            // Plan B por si falla alguna de las APIs
            jokeElement.innerText = "¿Sabías que los pulpos tienen tres corazones y su sangre es azul?";
        });
}

// Ejecutar automáticamente al cargar la página para que aparezca un dato de entrada
obtenerDato();