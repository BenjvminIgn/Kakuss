// Cargar modo oscuro de inmediato para evitar parpadeos blancos
const theme = localStorage.getItem('kakus_theme');
if (theme === 'dark') {
    document.documentElement.classList.add('dark-mode');
}

document.addEventListener("DOMContentLoaded", () => {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // Efecto Fade-In al cargar la página
    requestAnimationFrame(() => {
        document.body.classList.add('loaded');
    });

    // Efecto Fade-Out al cambiar de página en el navbar
    document.querySelectorAll('.bottom-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetUrl = this.getAttribute('href');
            if(!targetUrl || targetUrl === '#' || targetUrl.startsWith('javascript')) return;
            
            // Comprobar si es la misma página
            const currentPath = window.location.pathname.split('/').pop() || 'index.html';
            const targetPath = targetUrl.split('/').pop();
            
            if(currentPath === targetPath) {
                e.preventDefault(); 
                return;
            }

            e.preventDefault();
            // Disparar fade out
            document.body.classList.remove('loaded');
            document.body.classList.add('fade-out');
            
            // Navegar tras terminar la animación
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 250);
        });
    });
});
