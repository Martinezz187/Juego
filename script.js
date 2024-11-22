const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gameInterval;

const player = {
    x: 180,
    y: 550,
    width: 30, // Reducir el tamaño del jugador
    height: 30, // Reducir el tamaño del jugador
    color: 'blue',
    velocity: 2,
    canJump: false,
    speedBoost: false,
    invincible: false,
    greenBlocks: 0 // Contador de bloques verdes
};

const blocks = [];
let blockInterval = 2000;  // Bloques caen cada 2 segundos
let blockSpeed = 2;
let modoInfinito = false;
let vidas = 5; // Iniciaremos con 5 vidas
let contador = 0; // Contador general en segundos
let startTime; // Tiempo de inicio del juego

function startGame(dificultad) {
    document.getElementById('menu').style.display = 'none';
    canvas.style.display = 'block';
    player.greenBlocks = 0; // Reiniciar el contador de bloques verdes al empezar el juego
    contador = 0; // Reiniciar el contador general
    startTime = new Date(); // Establecer tiempo de inicio

    if (dificultad === 'facil') {
        blockInterval = 2000; // 2 segundos entre bloques
        blockSpeed = 1;
        vidas = 7;
    } else if (dificultad === 'normal') {
        blockInterval = 1500; // 1.5 segundos entre bloques
        blockSpeed = 2;
        vidas = 5;
    } else if (dificultad === 'dificil') {
        blockInterval = 1200; // 1.2 segundos entre bloques
        blockSpeed = 3;
        vidas = 3;
    } else if (dificultad === 'extremo') {
        blockInterval = 1000; // 1 segundo entre bloques
        blockSpeed = 4;
        vidas = 1;
    }

    modoInfinito = document.getElementById('infinito').checked;

    clearInterval(gameInterval); // Asegurarse de no tener múltiples intervalos activos
    gameInterval = setInterval(createBlock, blockInterval);
    gameLoop();
}

function createBlock() {
    const blockColor = Math.random() < 0.5 ? 'red' : (Math.random() < 0.8 ? 'green' : 'blue'); // 50% rojos, 40% verdes, 10% azules
    const block = {
        x: Math.floor(Math.random() * 10) * 40,  // Ancho del bloque es 40, así que x puede ser entre 0 y 360 en incrementos de 40
        y: 0,
        width: 40,
        height: 40,
        color: blockColor
    };
    blocks.push(block);
}

function update() {
    blocks.forEach((block, index) => {
        block.y += blockSpeed;

        // Mantener bloques dentro del canvas y resetear su posición cuando tocan el suelo
        if (block.y + block.height > canvas.height) {
            block.y = 0;
            block.x = Math.floor(Math.random() * 10) * 40; // Reposicionar el bloque de forma aleatoria
        }

        // Colisión con el jugador
        if (!player.invincible && block.y + block.height >= player.y && block.y + block.height * 0.75 <= player.y + player.height && block.x <= player.x + player.width && block.x + block.width >= player.x) {
            if (block.color === 'red') {
                vidas--; // Perder una vida
                if (vidas <= 0) {
                    alert("Juego terminado. Has perdido todas tus vidas.");
                    resetGame(); // Redirigir al menú
                } else {
                    // Teletransportar al jugador al centro del piso
                    player.x = (canvas.width - player.width) / 2;
                    player.y = canvas.height - player.height - 10;
                    player.invincible = true; // Dar invencibilidad al jugador
                    setTimeout(() => player.invincible = false, 2000); // Duración de la invencibilidad
                }
            } else if (block.color === 'green') {
                player.greenBlocks++; // Incrementar contador de bloques verdes
                blocks.splice(index, 1); // Eliminar el bloque verde
            } else if (block.color === 'blue') {
                player.speedBoost = true; // Aumentar velocidad del jugador
                blocks.splice(index, 1); // Eliminar el bloque azul
                setTimeout(() => player.speedBoost = false, 5000); // Duración del aumento de velocidad
            }
        }

        // Subir jugador con bloques
        if (block.color === 'red' && block.y + block.height >= player.y && player.y + player.height === block.y) {
            player.y -= blockSpeed;
        }
    });

    // Detectar si el jugador ha llegado a la cima
    if (player.y <= 80) { // Ajustar la altura de la línea de meta dos bloques hacia abajo
        alert("¡Felicidades! Has ganado el juego.");
        resetGame(); // Redirigir al menú
    }

    // Mantener al jugador dentro del canvas
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    if (player.y < 0) {
        if (modoInfinito) {
            player.y = 550; // Transporta al jugador al fondo del canvas
        } else {
            player.y = 0;  // Prevenir que el jugador se salga del canvas por arriba
        }
    }

    // Calcular el tiempo transcurrido
    const now = new Date();
    contador = Math.floor((now - startTime) / 1000); // Convertir a segundos
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Dibujar el piso
    ctx.fillStyle = 'black';
    ctx.fillRect(0, canvas.height - 10, canvas.width, 10);

    // Dibujar la línea de meta
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(0, 80); // Ajustar la altura de la línea de meta
    ctx.lineTo(canvas.width, 80);
    ctx.stroke();

    // Mostrar vidas restantes
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Vidas: ${vidas}`, 10, 30);

    // Mostrar contador de bloques verdes y contador general en minutos:segundos
    const minutes = Math.floor(contador / 60);
    const seconds = contador % 60;
    const timeString = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    ctx.fillText(`Bloques verdes: ${player.greenBlocks}`, 10, 60);
    ctx.fillText(`Tiempo: ${timeString}`, 10, 90);

    blocks.forEach(block => {
        ctx.fillStyle = block.color;
        ctx.fillRect(block.x, block.y, block.width, block.height);
    });
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    clearInterval(gameInterval);
    blocks.length = 0;
    player.x = 180;
    player.y = 550;
    player.canJump = false;
    player.speedBoost = false;
    player.invincible = false;
    player.greenBlocks = 0; // Reiniciar el contador de bloques verdes
    document.getElementById('menu').style.display = 'block';
    canvas.style.display = 'none';
}

window.addEventListener('keydown', function(event) {
    const movementSpeed = player.speedBoost ? 20 : 10; // Duplicar la velocidad si hay aumento
    if (event.key === 'ArrowLeft' || event.key === 'a') player.x -= movementSpeed;
    if (event.key === 'ArrowRight' || event.key === 'd') player.x += movementSpeed;
    if (event.key === 'ArrowUp' || event.key === 'w') {
        if (player.greenBlocks > 0) {
            player.y -= 60; // El jugador salta
            player.greenBlocks--; // Decrementar contador de bloques verdes
        }
    }
});
