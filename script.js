const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gameInterval;
let greenBlockRemovalInterval;

const player = {
    x: 180,
    y: 550,
    width: 30,
    height: 30,
    color: 'blue',
    velocity: 2,
    canJump: false,
    speedBoost: false,
    invincible: false,
    greenBlocks: 0,
    points: 0
};

const blocks = [];
let blockInterval = 2000;
let blockSpeed = 2;
let modoInfinito = false;
let modoMonedas = false;
let vidas = 5;
let contador = 0;
let startTime;

function startGame(dificultad) {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('additionalInfo1').style.display = 'block';
    document.getElementById('additionalInfo2').style.display = 'block';
    canvas.style.display = 'block';
    document.getElementById('stats').style.display = 'flex';
    player.greenBlocks = 0;
    player.points = 0;
    contador = 0;
    startTime = new Date();

    if (dificultad === 'facil') {
        blockInterval = 2000;
        blockSpeed = 1;
        vidas = 7;
        setGreenBlockRemovalInterval(20000);
    } else if (dificultad === 'normal') {
        blockInterval = 1500;
        blockSpeed = 2;
        vidas = 5;
        setGreenBlockRemovalInterval(15000);
    } else if (dificultad === 'dificil') {
        blockInterval = 1200;
        blockSpeed = 3;
        vidas = 3;
        setGreenBlockRemovalInterval(10000);
    } else if (dificultad === 'extremo') {
        blockInterval = 1000;
        blockSpeed = 4;
        vidas = 1;
        setGreenBlockRemovalInterval(5000);
    }

    modoInfinito = document.getElementById('infinito').checked;
    modoMonedas = document.getElementById('monedas').checked;
    document.getElementById('points').style.display = modoMonedas ? 'block' : 'none';

    clearInterval(gameInterval);
    gameInterval = setInterval(createBlock, blockInterval);
    gameLoop();
}

function setGreenBlockRemovalInterval(interval) {
    clearInterval(greenBlockRemovalInterval);
    greenBlockRemovalInterval = setInterval(() => {
        if (player.greenBlocks > 0) {
            player.greenBlocks--;
        }
    }, interval);
}

function createBlock() {
    let blockColor;
    if (modoMonedas) {
        blockColor = Math.random() < 0.4 ? 'red' : (Math.random() < 0.8 ? 'green' : 'blue');
        if (Math.random() < 0.1) {
            blockColor = 'gold';
        }
    } else {
        blockColor = Math.random() < 0.5 ? 'red' : (Math.random() < 0.8 ? 'green' : 'blue');
    }

    const block = {
        x: Math.floor(Math.random() * 10) * 40,
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

        if (block.y + block.height > canvas.height) {
            block.y = 0;
            block.x = Math.floor(Math.random() * 10) * 40;
        }

        if (block.color === 'gold') {
            player.points++;
            blocks.splice(index, 1);
        } else if (!player.invincible && block.y + block.height >= player.y && block.y + block.height * 0.75 <= player.y + player.height && block.x <= player.x + player.width && block.x + block.width >= player.x) {
            if (block.color === 'red') {
                vidas--;
                if (vidas <= 0) {
                    alert("Juego terminado. Has perdido todas tus vidas.");
                    resetGame();
                } else {
                    player.x = (canvas.width - player.width) / 2;
                    player.y = canvas.height - player.height - 10;
                    player.invincible = true;
                    setTimeout(() => player.invincible = false, 2000);
                }
            } else if (block.color === 'green') {
                player.greenBlocks++;
                blocks.splice(index, 1);
            } else if (block.color === 'blue') {
                player.speedBoost = true;
                player.invincible = true;
                blocks.splice(index, 1);
                setTimeout(() => player.speedBoost = false, 5000);
                setTimeout(() => player.invincible = false, 2000);
            }
        } else if (block.color === 'green' && block.y + block.height >= player.y && block.y + block.height * 0.75 <= player.y + player.height && block.x <= player.x + player.width && block.x + block.width >= player.x) {
            player.greenBlocks++;
            blocks.splice(index, 1);
        }

        if (block.color === 'red' && block.y + block.height >= player.y && player.y + player.height === block.y) {
            player.y -= blockSpeed;
        }
    });

    if (player.y <= (blockSpeed >= 3 ? 10 : 80)) {
        alert("¡Felicidades! Has ganado el juego.");
        resetGame();
    }

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    if (player.y < 0) {
        if (modoInfinito) {
            player.y = 550;
        } else {
            player.y = 0;
        }
    }

    const now = new Date();
    contador = Math.floor((now - startTime) / 1000);

    // Actualizar los contadores en el HTML
    document.getElementById('lives').textContent = `${vidas}`;
    document.getElementById('greenBlocks').textContent = `${player.greenBlocks}`;
    document.getElementById('time').textContent = `${Math.floor(contador / 60)}:${contador % 60 < 10 ? '0' : ''}${contador % 60}`;
    if (modoMonedas) {
        document.getElementById('pointsValue').textContent = `${player.points}`;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.fillStyle = 'black';
    ctx.fillRect(0, canvas.height - 10, canvas.width, 10);

    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(0, blockSpeed >= 3 ? 10 : 80);
    ctx.lineTo(canvas.width, blockSpeed >= 3 ? 10 : 80);
    ctx.stroke();

    blocks.forEach(block => {
        if (block.color === 'gold') {
            ctx.fillStyle = 'gold';
            ctx.fillRect(block.x, block.y, block.width, block.height);
            ctx.strokeStyle = 'black';
            ctx.strokeRect(block.x, block.y, block.width, block.height);
        } else {
            ctx.fillStyle = block.color;
            ctx.fillRect(block.x, block.y, block.width, block.height);
        }
    });
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    clearInterval(gameInterval);
    clearInterval(greenBlockRemovalInterval);
    blocks.length = 0;
    player.x = 180;
    player.y = 550;
    player.canJump = false;
    player.speedBoost = false;
    player.invincible = false;
    player.greenBlocks = 0;
    player.points = 0;
    document.getElementById('infinito').checked = false;
    document.getElementById('monedas').checked = false;
    document.getElementById('menu').style.display = 'block';
    document.getElementById('stats').style.display = 'none';
    document.getElementById('additionalInfo1').style.display = 'none';
    document.getElementById('additionalInfo2').style.display = 'none';
}

window.addEventListener('keydown', function(event) {
    const movementSpeed = player.speedBoost ? 20 : 10;
    if (event.key === 'ArrowLeft' || event.key === 'a') player.x -= movementSpeed;
    if (event.key === 'ArrowRight' || event.key === 'd') player.x += movementSpeed;
    if (event.key === 'ArrowUp' || event.key === 'w') {
        if (player.greenBlocks > 0) {
            player.y -= 60;
            player.greenBlocks--;
        }
    }
});
