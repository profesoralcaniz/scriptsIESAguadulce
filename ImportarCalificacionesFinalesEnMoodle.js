// ==UserScript==
// @name         Importar Calificaciones desde CSV (Normalización)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Rellena inputs de calificaciones desde CSV, con comparación robusta de nombres (sin tildes, puntuación, y en minúsculas)
// @author       Tú
// @match        https://educacionadistancia.juntadeandalucia.es/formacionprofesional/grade/report/singleview/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function normalizarTexto(texto) {
        return texto
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Elimina tildes
            .replace(/[^\w\s]/gi, "") // Elimina puntuación
            .replace(/\s+/g, " ") // Elimina espacios extra
            .trim();
    }

    function parseCSV(texto) {
        const lineas = texto.trim().split("\n");
        const datos = {};
        lineas.forEach(linea => {
            const [nombre, nota] = linea.split(";");
            if (nombre && nota) {
                const nombreNormalizado = normalizarTexto(nombre);
                datos[nombreNormalizado] = nota.trim();
            }
        });
        return datos;
    }

    function rellenarNotas(csvData) {
        const mapa = parseCSV(csvData);

        document.querySelectorAll("tr").forEach(fila => {
            const nombreAnchor = fila.querySelector("a[href*='user/view.php']");
            const inputNota = fila.querySelector("input[name^='finalgrade_']");

            if (nombreAnchor && inputNota) {
                  const anchorClone = nombreAnchor.cloneNode(true);
anchorClone.querySelectorAll("span").forEach(s => s.remove());
const nombrePagina = normalizarTexto(anchorClone.textContent);
                                            if (mapa[nombrePagina] !== undefined) {
                    inputNota.value = mapa[nombrePagina];
                    inputNota.style.backgroundColor = "#c8e6c9";
                }
            }
        });
    }

    function crearBoton() {
        const boton = document.createElement("button");
        boton.textContent = "📤 Importar notas CSV";
        boton.style.position = "fixed";
        boton.style.bottom = "90px";
        boton.style.right = "20px";
        boton.style.zIndex = 9999;
        boton.style.padding = "10px 15px";
        boton.style.fontSize = "14px";
        boton.style.backgroundColor = "#43a047";
        boton.style.color = "white";
        boton.style.border = "none";
        boton.style.borderRadius = "5px";
        boton.style.cursor = "pointer";

        const inputArchivo = document.createElement("input");
        inputArchivo.type = "file";
        inputArchivo.accept = ".csv";
        inputArchivo.style.display = "none";

        inputArchivo.addEventListener("change", (e) => {
            const archivo = e.target.files[0];
            if (!archivo) return;

            const lector = new FileReader();
            lector.onload = function (evento) {
                rellenarNotas(evento.target.result);
            };
            lector.readAsText(archivo, "utf-8");
        });

        boton.addEventListener("click", () => inputArchivo.click());

        document.body.appendChild(boton);
        document.body.appendChild(inputArchivo);
    }

            setTimeout(crearBoton, 1000);

})();
