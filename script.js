const video = document.getElementById("camera");
const tableBody = document.getElementById("tableBody");
const cameraContainer = document.getElementById("cameraContainer");

// Cargar datos almacenados al cargar la página
window.onload = function() {
    loadStoredData();
};

// Manejador de eventos para input de archivo
document.getElementById("qrInput").addEventListener("change", handleFile);

function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.src = event.target.result;
        img.onload = function() {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

            if (qrCode) {
                parseCURPData(qrCode.data);
            } else {
                alert("No QR code detected in the image.");
            }
        };
    };
    reader.readAsDataURL(file);
}

function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
            video.srcObject = stream;
            cameraContainer.style.display = "flex"; // Mostrar contenedor de cámara
            video.setAttribute("playsinline", true); // Compatibilidad con iOS
            video.play();
            requestAnimationFrame(scanQRCode);
        })
        .catch((err) => {
            alert("Camera access error: " + err);
        });
}

function scanQRCode() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

        if (qrCode) {
            parseCURPData(qrCode.data);
            stopCamera();
            return;
        }
    }
    requestAnimationFrame(scanQRCode);
}

function stopCamera() {
    const stream = video.srcObject;
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
    }
    cameraContainer.style.display = "none"; // Ocultar contenedor de cámara
    video.srcObject = null;
}

function parseCURPData(data) {
    console.log("Datos escaneados:", data); // Debug para ver los datos brutos
    const fields = data.split('|');
    
    if (fields.length < 9) {
        alert("Formato de CURP no reconocido.");
        return;
    }

    const [clave, curp, apellidoP, apellidoM, nombres, sexo, fechaNacimiento, entidad, homoclave] = fields;
    const curpData = {
        clave: clave || "", 
        curp: curp || "", 
        apellidoP: apellidoP || "", 
        apellidoM: apellidoM || "", 
        nombres: nombres || "", 
        sexo: sexo || "", 
        fechaNacimiento: fechaNacimiento || "", 
        entidad: entidad || "", 
        homoclave: homoclave || ""
    };

    console.log("Datos de CURP procesados:", curpData); // Debug para ver datos procesados

    // Guardar la CURP en localStorage sin verificar duplicados
    saveCurp(curpData);
    loadStoredData();
}

function saveCurp(curpData) {
    let curps = JSON.parse(localStorage.getItem("curps")) || [];

    // Verificar si el CURP ya está registrado
    const exists = curps.some(existingCurp => 
        existingCurp.clave === curpData.clave &&
        existingCurp.curp === curpData.curp &&
        existingCurp.apellidoP === curpData.apellidoP &&
        existingCurp.apellidoM === curpData.apellidoM &&
        existingCurp.nombres === curpData.nombres &&
        existingCurp.sexo === curpData.sexo &&
        existingCurp.fechaNacimiento === curpData.fechaNacimiento &&
        existingCurp.entidad === curpData.entidad &&
        existingCurp.homoclave === curpData.homoclave
    );

    if (exists) {
        // Mostrar mensaje en la página en lugar de una alerta
        showMessage("Este CURP ya está registrado.");
        return;
    }

    // Guardar el nuevo CURP si no está duplicado
    curps.push(curpData);
    localStorage.setItem("curps", JSON.stringify(curps));
}

function showMessage(message) {
    // Crear un contenedor de mensajes si no existe
    let messageContainer = document.getElementById("messageContainer");
    if (!messageContainer) {
        messageContainer = document.createElement("div");
        messageContainer.id = "messageContainer";
        document.body.appendChild(messageContainer);
    }

    // Mostrar el mensaje
    messageContainer.innerText = message;
    messageContainer.style.color = "red"; // Puedes personalizar el estilo del mensaje
}


function loadStoredData() {
    const storedCurps = localStorage.getItem("curps");
    tableBody.innerHTML = ""; // Limpiar la tabla

    if (storedCurps) {
        let curps = JSON.parse(storedCurps);
        curps = curps.filter(curpData => curpData && curpData.clave); // Filtrar vacíos
        curps.sort((a, b) => a.clave.localeCompare(b.clave)); // Ordenar alfabéticamente

        curps.forEach(curpData => displayData(curpData));
    }
}

function displayData(curpData) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td><input type="checkbox" class="select-row"></td>
        <td>${curpData.clave || ""}</td>
        <td>${curpData.curp || ""}</td>
        <td>${curpData.apellidoP || ""}</td>
        <td>${curpData.apellidoM || ""}</td>
        <td>${curpData.nombres || ""}</td>
        <td>${curpData.sexo || ""}</td>
        <td>${curpData.fechaNacimiento || ""}</td>
        <td>${curpData.entidad || ""}</td>
        <td>${curpData.homoclave || ""}</td>
    `;
    tableBody.appendChild(row);
}

function deleteSelectedRows() {
    const selectedCheckboxes = document.querySelectorAll('.select-row:checked');
    let curps = JSON.parse(localStorage.getItem('curps')) || [];
    selectedCheckboxes.forEach(checkbox => {
        const row = checkbox.parentElement.parentElement;
        const curp = row.children[2].textContent;
        curps = curps.filter(curpData => curpData.curp !== curp);
        row.remove();
    });
    localStorage.setItem('curps', JSON.stringify(curps));
}
