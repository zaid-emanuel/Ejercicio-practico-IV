const datosTexto = JSON.parse(document.getElementById("texto-datos").textContent);

const contenedorTexto = document.getElementById("texto-prueba");
const entrada = document.getElementById("entrada-usuario");
const marcadorTiempo = document.getElementById("tiempo-restante");
const barraProgreso = document.getElementById("barra-progreso");
const pantallaResultado = document.getElementById("pantalla-resultado");
const valorWpm = document.getElementById("valor-wpm");

const DURACION_SEGUNDOS = 60;

// Primero se respetan los saltos de linea reales del texto (importante para el codigo).
// Si el texto no tiene saltos de linea (como los parrafos de texto plano), queda un solo segmento.
const segmentosReales = datosTexto
    .split("\n")
    .map((segmento) => segmento.trim())
    .filter(Boolean);

// Mide, dentro del propio contenedor visible, en donde el navegador corta cada
// segmento visualmente (segun el ancho real de la ventana) y regresa cuantas
// palabras entran en cada linea visual.
function medirSublineas(palabrasSegmento) {
    contenedorTexto.style.visibility = "hidden";
    contenedorTexto.innerHTML = palabrasSegmento
        .map((palabra) => `<span class="palabra-medicion">${palabra}</span>`)
        .join(" ");

    const conteos = [];
    let topActual = null;
    let contadorActual = 0;

    document.querySelectorAll(".palabra-medicion").forEach((elemento) => {
        const top = elemento.offsetTop;
        if (topActual === null || top !== topActual) {
            if (contadorActual > 0) {
                conteos.push(contadorActual);
            }
            contadorActual = 0;
            topActual = top;
        }
        contadorActual += 1;
    });
    if (contadorActual > 0) {
        conteos.push(contadorActual);
    }

    contenedorTexto.innerHTML = "";
    contenedorTexto.style.visibility = "visible";

    return conteos;
}

// Construye la lista global de palabras y los grupos de "una linea visual a la vez"
const palabras = [];
const lineas = [];

segmentosReales.forEach((segmento) => {
    const palabrasSegmento = segmento.split(/\s+/).filter(Boolean);
    const conteosPorSublinea = medirSublineas(palabrasSegmento);

    let cursor = 0;
    conteosPorSublinea.forEach((cantidad) => {
        const grupo = [];
        for (let i = 0; i < cantidad; i += 1) {
            grupo.push(palabras.length);
            palabras.push(palabrasSegmento[cursor]);
            cursor += 1;
        }
        lineas.push(grupo);
    });
});

// A que linea visual pertenece cada palabra, segun su indice global
const oracionPorPalabra = [];
lineas.forEach((grupo, indiceLinea) => {
    grupo.forEach((indiceGlobal) => {
        oracionPorPalabra[indiceGlobal] = indiceLinea;
    });
});

let indiceActual = 0;
let palabrasCorrectas = 0;
let tiempoRestante = DURACION_SEGUNDOS;
let intervalo = null;
let pruebaIniciada = false;
let pruebaTerminada = false;

// Dibuja solo la linea visual a la que pertenece la palabra actual
function dibujarTexto() {
    const indiceLineaActual = oracionPorPalabra[indiceActual] ?? lineas.length - 1;
    const lineaActual = lineas[indiceLineaActual];

    contenedorTexto.innerHTML = lineaActual
        .map((indiceGlobal) => {
            const palabra = palabras[indiceGlobal];
            const letras = palabra
                .split("")
                .map((letra) => `<span class="letra">${letra}</span>`)
                .join("");
            return `<span class="palabra" data-indice="${indiceGlobal}">${letras}</span>`;
        })
        .join(" ");
    marcarPalabraActual();
}

function marcarPalabraActual() {
    document.querySelectorAll(".palabra").forEach((elemento) => elemento.classList.remove("actual"));
    const elementoActual = document.querySelector(`.palabra[data-indice="${indiceActual}"]`);
    if (elementoActual) {
        elementoActual.classList.add("actual");
        elementoActual.scrollIntoView({ block: "center", behavior: "smooth" });
    }
}

// Colorea letra por letra la palabra que se esta escribiendo en este momento
function actualizarLetrasPalabraActual() {
    const elementoActual = document.querySelector(`.palabra[data-indice="${indiceActual}"]`);
    if (!elementoActual) {
        return;
    }

    const palabraObjetivo = palabras[indiceActual];
    const letras = elementoActual.querySelectorAll(".letra");
    const escrito = entrada.value;

    letras.forEach((letraElemento, indice) => {
        letraElemento.classList.remove("correcta", "incorrecta", "cursor");
        if (indice < escrito.length) {
            letraElemento.classList.add(escrito[indice] === palabraObjetivo[indice] ? "correcta" : "incorrecta");
        } else if (indice === escrito.length) {
            letraElemento.classList.add("cursor");
        }
    });
}

function iniciarCuentaRegresiva() {
    intervalo = setInterval(() => {
        tiempoRestante -= 1;
        marcadorTiempo.textContent = tiempoRestante;
        if (tiempoRestante <= 0) {
            finalizarPrueba();
        }
    }, 1000);
}

function finalizarPrueba() {
    if (pruebaTerminada) {
        return;
    }
    pruebaTerminada = true;

    clearInterval(intervalo);
    entrada.disabled = true;

    const segundosUsados = DURACION_SEGUNDOS - tiempoRestante;
    const minutos = segundosUsados > 0 ? segundosUsados / 60 : 1 / 60;
    const palabrasPorMinuto = Math.round(palabrasCorrectas / minutos);

    valorWpm.textContent = palabrasPorMinuto;
    pantallaResultado.classList.add("visible");

    fetch("/guardar_resultado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ velocidad: palabrasPorMinuto }),
    });
}

// Se ejecuta cuando el usuario confirma una palabra con espacio o enter
function procesarPalabra() {
    const escrita = entrada.value.trim();
    const elementoActual = document.querySelector(`.palabra[data-indice="${indiceActual}"]`);
    const palabraObjetivo = palabras[indiceActual];

    if (elementoActual) {
        const letras = elementoActual.querySelectorAll(".letra");
        letras.forEach((letraElemento, indice) => {
            letraElemento.classList.remove("cursor");
            const correcta = indice < escrita.length && escrita[indice] === palabraObjetivo[indice];
            letraElemento.classList.toggle("correcta", correcta);
            letraElemento.classList.toggle("incorrecta", !correcta);
        });

        const esCorrecta = escrita === palabraObjetivo;
        elementoActual.classList.toggle("correcta", esCorrecta);
        elementoActual.classList.toggle("incorrecta", !esCorrecta);

        if (esCorrecta && !elementoActual.dataset.contada) {
            palabrasCorrectas += 1;
            elementoActual.dataset.contada = "1";
        }
    }

    const lineaAnterior = oracionPorPalabra[indiceActual];
    indiceActual += 1;
    entrada.value = "";
    barraProgreso.style.width = `${(indiceActual / palabras.length) * 100}%`;

    if (indiceActual >= palabras.length) {
        finalizarPrueba();
        return;
    }

    // Si la nueva palabra pertenece a otra linea visual, se dibuja automaticamente
    const lineaNueva = oracionPorPalabra[indiceActual];
    if (lineaNueva !== lineaAnterior) {
        dibujarTexto();
    } else {
        marcarPalabraActual();
    }
}

// Permite volver a la palabra anterior si quedo marcada como incorrecta
function retrocederPalabra() {
    const indicePrevio = indiceActual - 1;
    if (indicePrevio < 0) {
        return;
    }

    // Si la palabra anterior quedo en la linea previa (ya no esta dibujada), se
    // vuelve a mostrar esa linea antes de tocarla
    if (oracionPorPalabra[indicePrevio] !== oracionPorPalabra[indiceActual]) {
        indiceActual = indicePrevio;
        dibujarTexto();
        return;
    }

    const palabraAnterior = document.querySelector(`.palabra[data-indice="${indicePrevio}"]`);
    if (!palabraAnterior || !palabraAnterior.classList.contains("incorrecta")) {
        return;
    }

    indiceActual = indicePrevio;
    palabraAnterior.classList.remove("correcta", "incorrecta");
    palabraAnterior.querySelectorAll(".letra").forEach((letra) => {
        letra.classList.remove("correcta", "incorrecta", "cursor");
    });

    barraProgreso.style.width = `${(indiceActual / palabras.length) * 100}%`;
    marcarPalabraActual();
}

entrada.addEventListener("input", (evento) => {
    if (pruebaTerminada) {
        return;
    }

    if (!pruebaIniciada) {
        pruebaIniciada = true;
        iniciarCuentaRegresiva();
    }

    if (evento.target.value.endsWith(" ")) {
        procesarPalabra();
        return;
    }

    actualizarLetrasPalabraActual();
});

entrada.addEventListener("keydown", (evento) => {
    if (pruebaTerminada) {
        return;
    }

    if (evento.key === "Enter") {
        evento.preventDefault();
        if (entrada.value.trim().length > 0) {
            entrada.value += " ";
            entrada.dispatchEvent(new Event("input"));
        }
        return;
    }

    if (evento.key === "Backspace" && entrada.value.length === 0 && indiceActual > 0) {
        evento.preventDefault();
        retrocederPalabra();
    }
});

dibujarTexto();
entrada.focus();