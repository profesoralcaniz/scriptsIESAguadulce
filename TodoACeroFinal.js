// ==UserScript==
// @name         AutoCalificar Con Rúbrica
// @namespace    http://tampermonkey.net/
// @match        https://educacionadistancia.juntadeandalucia.es/formacionprofesional/mod/assign/view.php?*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    window.addEventListener('load', () => {
        const btn = document.createElement('button');
        let notificacion = document.querySelector('input[name="sendstudentnotifications"]');

        btn.innerText = 'AutoCalificar con Rúbrica';
        btn.style.position = 'fixed';
        btn.style.bottom = '20px';
        btn.style.right = '20px';
        btn.style.zIndex = 9999;
        btn.style.padding = '10px 15px';
        btn.style.backgroundColor = '#0275d8';
        btn.style.color = '#fff';
        btn.style.border = 'none';
        btn.style.borderRadius = '5px';
        btn.style.cursor = 'pointer';

        document.body.appendChild(btn);

        btn.addEventListener('click', () => {
            autoCalificarYSiguiente();
        });

        function autoCalificarYSiguiente() {
            let div = document.querySelector('div.submissiongraded');
            let comentario = document.getElementById("id_assignfeedbackcomments_editoreditable");
            
            //deseleccionamos el checkbox de notificaciones
            notificacion.checked=false;
            if (!div) {
            //Poner comentario NO ENTREGADO
            if (comentario) {
                comentario.innerText = "no entregado";
            }
            let texto = document.querySelector('[data-region="user-count-summary"]').innerText;
            let [actual, total] = texto.match(/\d+/g).map(Number);

            // Poner 1 en los criterios
            let selects = document.querySelectorAll('select');
            selects.forEach(select => {
                if (select.id !== 'id_addattempt') {
                    const oneOption = Array.from(select.options).find(opt => opt.value === "1");
                    if (oneOption) {
                        select.value = "1";
                        select.dispatchEvent(new Event('change'));
                    }
                }
            });

            // Poner 0 en el campo de intentos
            const addAttempt = document.getElementById("id_addattempt");
            if (addAttempt) {
                addAttempt.value = "0";
                addAttempt.dispatchEvent(new Event('change'));
            }

            // Selccionar 0 puntos en los elementos de la rúbrica
            let criterios = document.querySelectorAll('tr[class*="criterion"]');
            criterios.forEach(tr => {
                let radioChecked = tr.querySelector('input[type="radio"]:checked');
                if (!radioChecked) {
                    // Si no hay ninguno marcado, seleccionar el primero disponible
                    radioChecked = tr.querySelector('input[type="radio"]');
                }
                if (radioChecked) {
                    radioChecked.checked = true;
                    radioChecked.dispatchEvent(new Event('change'));
                }
            });
        }
             if(actual != total) {
            // Guardar y pasar al siguiente alumno
            let btnGuardarSiguiente = document.querySelector('button[name="saveandshownext"], input[name="saveandshownext"]');
            let btnGuardar = document.querySelector('button[name="savechanges"], input[name="savechanges"]');

            if (btnGuardarSiguiente) {
                btnGuardarSiguiente.click();
                // Esperar y continuar automáticamente
                setTimeout(() => {
                    autoCalificarYSiguiente();
                }, 4000);
            } else {
                alert("No se encontró el botón 'Guardar y mostrar siguiente'.");
            }
        }else{
            alert("Has llegado al último alumno");
            btnGuardar.click();
        }
        }
    });
})();
