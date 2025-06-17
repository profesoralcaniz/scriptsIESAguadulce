// ==UserScript==
// @name         Auto-puntuación desde CSV (nombre separado por coma)
// @namespace    http://tampermonkey.net/
// @match        https://seneca.juntadeandalucia.es/seneca/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
(function () {
    'use strict';

    function compararNombres(nombre1, apellido1, nombre2, apellido2) {
      function limpiarYSeparar(str) {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .split('')
    }

    function compararListas(l1, l2) {
        if (l1.length !== l2.length) return false;
        for (let i = 0; i < l1.length; i++) {
            if(/^[a-z]$/.test(l1[i]) && /^[a-z]$/.test(l2[i])){
                if (l1[i] !== l2[i]) return false;
            }
        }
        return true;
    }

    let nombreLimpio1 = limpiarYSeparar(nombre1);
    let nombreLimpio2 = limpiarYSeparar(nombre2);
    let apellidoLimpio1 = limpiarYSeparar(apellido1);
    let apellidoLimpio2 = limpiarYSeparar(apellido2);

    return compararListas(nombreLimpio1, nombreLimpio2) && compararListas(apellidoLimpio1, apellidoLimpio2);
}

    function insertarBotonSiNoExiste() {
        let contador=0;
        if (document.getElementById('file-csv-notas')) return; // Evitar duplicados

        let botonFichero = document.createElement('input');
        botonFichero.type = 'file';
        botonFichero.accept = '.csv';
        botonFichero.id = 'file-csv-notas';
        botonFichero.style.position = 'fixed';
        botonFichero.style.top = '20px';
        botonFichero.style.left = '100px';
        botonFichero.style.zIndex = 10000;
        botonFichero.style.backgroundColor = '#fff';

        document.body.appendChild(botonFichero);

        botonFichero.addEventListener('change', (event) => {
            let fichero = event.target.files[0];
            let opcion=prompt("Elige una opción: Vaciar todas las notas(0) o Rellenar(1))");
            if (!fichero) return;

            let lector = new FileReader();
            lector.onload = (e) => {
                let lineas = e.target.result.split('\n').map(l => l.trim()).filter(l => l.length);

                lineas.forEach(linea => {
                    let [apellidoNombre, notaStr] = linea.split(';');
                    if (!apellidoNombre || !notaStr) return;

                    let [apellidosCSV, nombreCSV] = apellidoNombre.split(',').map(x => x.trim());
                    let nota = notaStr.trim();
                    if(nota==0){
                        nota="NE";
                    }
                    if(opcion=="0"){
                        nota="";
                    }
                    document.querySelectorAll('tr.menuContextual').forEach(tr => {
                        let p = tr.querySelector('p.ml-2');
                        if (!p) return;

                        let nombreHTML = p.querySelector('b')?.textContent.trim();
                        let apellidosHTML = p.innerHTML.split('<br>')[1]?.trim();
                        if (compararNombres(nombreHTML, apellidosHTML, nombreCSV, apellidosCSV)) {
                            let input = tr.querySelector('input');
                            let label = tr.querySelector('label.media');
                            contador++;
                            if (input) {
                                input.value = nota;
                                input.dispatchEvent(new Event('input', { bubbles: true }));
                            } else if (label) {
                                label.textContent = nota;
                            }

                            tr.style.backgroundColor = '#d1ffd1';
                        }
                    });
                });
                console.log("Número de alumnos = "+contador);
                alert("Total de Alumno: "+contador);
                botonFichero.remove(); // elimina input actual
                    insertarBotonSiNoExiste();

            };

            lector.readAsText(fichero);
        });
    }


insertarBotonSiNoExiste();

})();
