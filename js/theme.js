(function () {
    const KEY = 'tema';
    const root = document.documentElement;

    function aplicar(tema) {
        root.setAttribute('data-theme', tema);
        root.setAttribute('data-bs-theme', tema); // Bootstrap 5.3 también se adapta
        const icono = document.querySelector('#theme-toggle i');
        if (icono) {
            icono.className = tema === 'dark'
                ? 'bi bi-sun-fill'
                : 'bi bi-moon-stars-fill';
        }
    }

    // Se aplica de inmediato (antes de pintar) para evitar un parpadeo
    const guardado = localStorage.getItem(KEY);
    const prefiereOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
    aplicar(guardado || (prefiereOscuro ? 'dark' : 'light'));

    function cambiarTema(evento) {
        const nuevo = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        localStorage.setItem(KEY, nuevo);

        const sinAnimacion =
            !document.startViewTransition ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (sinAnimacion) {
            aplicar(nuevo);
            return;
        }

        // Origen de la cortina: centro del botón
        const rect = evento.currentTarget.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const radio = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        const transicion = document.startViewTransition(() => aplicar(nuevo));

        transicion.ready.then(() => {
            root.animate(
                {
                    clipPath: [
                        `circle(0px at ${x}px ${y}px)`,
                        `circle(${radio}px at ${x}px ${y}px)`
                    ]
                },
                {
                    duration: 700,
                    easing: 'ease-in-out',
                    pseudoElement: '::view-transition-new(root)'
                }
            );
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const boton = document.getElementById('theme-toggle');
        if (!boton) return;
        aplicar(root.getAttribute('data-theme')); // sincroniza el icono
        boton.addEventListener('click', cambiarTema);
    });
})();