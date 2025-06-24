// ==UserScript==
// @name         Exportar Nota Penúltima
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Extrae nombre y penúltima nota del HTML y exporta como CSV. Elimina .00 (ej: 8.00 → 8). Si está vacío, pone 0.
// @author       Tú
// @match        https://educacionadistancia.juntadeandalucia.es/formacionprofesional/grade/report/learning/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function limpiarNota(notaTexto) {
        const texto = notaTexto.trim().replace(",", ".");
        if (!texto) return "0";

        const numero = parseFloat(texto);
        if (isNaN(numero)) return "0";

        const redondeado = Math.round(numero);
        return String(redondeado);
    }

    function exportarCSV(datos) {
        const contenido = datos.map(d => `${d.nombre};${d.nota}`).join("\n");
        const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const enlace = document.createElement("a");
        enlace.setAttribute("href", url);
        enlace.setAttribute("download", "notas_penultima.csv");
        enlace.style.display = "none";
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
    }

    function obtenerDatos() {
        const filas = document.querySelectorAll("tr");
        const resultados = [];

        filas.forEach(fila => {
            const nombreLink = fila.querySelector("td a[href*='user/view.php']");
            if (!nombreLink) return;

            const nombre = nombreLink.innerText.trim().replace(/"/g, "");
            const tds = fila.querySelectorAll("td");
            if (tds.length < 2) return;

            const penultimaCelda = tds[tds.length - 2]; // CAMBIO AQUÍ
            const nota = limpiarNota(penultimaCelda.innerText);

            resultados.push({ nombre, nota });
        });

        return resultados;
    }

    function crearBoton() {
        const btn = document.createElement("button");
        btn.textContent = "📥 Exportar CSV penúltima";
        btn.style.position = "fixed";
        btn.style.bottom = "90px";
        btn.style.right = "20px";
        btn.style.zIndex = 9999;
        btn.style.padding = "10px 15px";
        btn.style.fontSize = "14px";
        btn.style.backgroundColor = "#1976d2";
        btn.style.color = "white";
        btn.style.border = "none";
        btn.style.borderRadius = "5px";
        btn.style.cursor = "pointer";

        btn.addEventListener("click", () => {
            const datos = obtenerDatos();
            exportarCSV(datos);
        });

        document.body.appendChild(btn);
    }

    if (window.location.href.includes("/grade/report/learning/")) {
        window.addEventListener("load", () => {
            setTimeout(crearBoton, 1000);
        });
    }

})();
