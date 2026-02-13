"use strict";
// ----- Page switching -----
const passwordView = document.getElementById('passwordView');
const valentineView = document.getElementById('valentineView');
const pwInput = document.getElementById('pw');
const pwBtn = document.getElementById('pwBtn');
const pwErr = document.getElementById('pwErr');

function goValentine(){
    passwordView.classList.remove('active');
    valentineView.classList.add('active');
    // focus nothing; keep it cute and calm
}

function checkPassword(){
    const ok = (pwInput.value || '').trim() === 'bubu';
    pwErr.style.display = ok ? 'none' : 'inline-block';
    if(ok) goValentine();
}

pwBtn.addEventListener('click', checkPassword);
pwInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') checkPassword(); });

// ----- Valentine logic -----
const yesBtn = document.getElementById('yesBtn');
const noBtn  = document.getElementById('noBtn');
const noText = document.getElementById('noText');
const playArea = document.getElementById('playArea');
const successBlock = document.getElementById('successBlock');
const smallText = document.getElementById('smallText');

const noLines = [
    "Are you sure?",
    "Hmmm I don’t think thats the right answer.",
    "What the helly?",
    "Ey! What are you trying to do?",
    "Grrrrr you are testing my patience",
    "You can’t get out of this.",
    "Nnnno",
    "lololol",
    "bimbimbapu",
    "shimimallu",
    "abibu",
    "ammmbibu",
    "shimi shimi",
    "are you satisfied yet?",
    "good sir?"
];

let noClicks = 0;
let confettiOn = false;
let spawnedCount = 0;

function showSuccess(tookAWhile){
    // hide question area interactions (still visible, but success takes over)
    successBlock.classList.add('active');

    // hide the question section
    document.getElementById('bottomPanel').style.display = 'none';

    yesBtn.hidden = true
    noBtn.hidden = true

    document.querySelectorAll('.corner-rose')
  .forEach(r => r.style.opacity = '1');

    const base = "Thank you for being my valentine! I love you so much bubu. More gifts are on the way. Mmmmmmmmwah.";
    smallText.textContent = tookAWhile ? (base + " Well that took a while didn’t?") : base;

    startConfetti();
}

function handleYes(){
    const tookAWhile = (noClicks >= 15);
    showSuccess(tookAWhile);
}

yesBtn.addEventListener('click', handleYes);

// ----- No button behavior + spawning yes buttons -----
function rand(min, max){ return Math.random() * (max - min) + min; }

function spawnYesButton(){
    spawnedCount++;

    const btn = document.createElement('button');
    btn.className = 'spawned-yes btn-yes';
    btn.textContent = 'Yes';

    // random rotation within ±45deg
    const rot = rand(-45, 45);

    // place it randomly, but NOT over the bottom panel text/buttons zone
    // reserve bottom area height so we never cover noText / buttons
    const reserveBottom = Math.max(220, document.getElementById('bottomPanel').getBoundingClientRect().height + 20);

    const bounds = playArea.getBoundingClientRect();
    const maxX = Math.max(0, bounds.width - 110);
    const maxY = Math.max(0, bounds.height - reserveBottom - 60);

    const x = rand(12, Math.max(12, maxX));
    const y = rand(12, Math.max(12, maxY));

    btn.style.left = x + 'px';
    btn.style.top  = y + 'px';
    btn.style.transform = `rotate(${rot}deg)`;

    btn.addEventListener('click', handleYes);

    playArea.appendChild(btn);
}

noBtn.addEventListener('click', ()=>{
    noClicks++;

    if(noClicks <= 15){
    noText.textContent = noLines[noClicks - 1];
    }

    if(noClicks === 16){
    noText.textContent = "I’ve added another yes button because I think thats what you need.";
    spawnYesButton();
    } else if(noClicks > 16){
    spawnYesButton();
    }
});

// ----- Confetti (canvas) -----
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
let confettiPieces = [];
let rafId = null;

function resizeCanvas(){
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function makeConfettiPiece(){
    const shapes = ["rect","circle"];
    return {
    x: rand(0, window.innerWidth),
    y: rand(-window.innerHeight, 0),
    vy: rand(2.2, 5.2),
    vx: rand(-1.2, 1.2),
    size: rand(6, 12),
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.12, 0.12),
    shape: shapes[Math.floor(rand(0, shapes.length))],
    // keep it cute: pinks/purples/white
    color: ["#ff4fa8","#ff89c7","#ffffff","#caa0ff","#ffd1e4"][Math.floor(rand(0,5))]
    };
}

function startConfetti(){
    if(confettiOn) return;
    confettiOn = true;

    confettiPieces = Array.from({length: 180}, makeConfettiPiece);

    const tick = ()=>{
    ctx.clearRect(0,0,window.innerWidth, window.innerHeight);

    for(const p of confettiPieces){
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        if(p.y > window.innerHeight + 30){
        p.y = rand(-120, -20);
        p.x = rand(0, window.innerWidth);
        }
        if(p.x < -30) p.x = window.innerWidth + 30;
        if(p.x > window.innerWidth + 30) p.x = -30;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;

        if(p.shape === "circle"){
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
        ctx.fill();
        }else{
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.65);
        }
        ctx.restore();
    }

    rafId = requestAnimationFrame(tick);
    };

    tick();
}

// small UX: focus password box
pwInput.focus();
