const videoElement = document.getElementById('input_video');
const canvas = document.getElementById('output_canvas');
const ctx = canvas.getContext('2d');

const annotationCanvas = document.getElementById('annotation-canvas');
const aCtx = annotationCanvas.getContext('2d');
const slideDeck = document.getElementById('slide-deck');

// UI Elements
const splash = document.getElementById('splash-screen');
const startBtn = document.getElementById('start-btn');
const appContainer = document.getElementById('app-container');
const slides = document.querySelectorAll('.slide');
const laser = document.getElementById('laser-pointer');
const spotlight = document.getElementById('spotlight');
const hintNext = document.querySelector('.nav-hint.right');
const hintPrev = document.querySelector('.nav-hint.left');

// State
let currentSlide = 0;
let isLocked = false; 
let smoothedX = 0.5;
let smoothedY = 0.5;
const SMOOTHING = 0.2;
let lastX = null;
let lastDrawPoint = null;
let camera = null;
let audioCtx = null;

// --- Web Audio Feedback ---
function playSound(freq, type = 'sine', duration = 0.1) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

// --- MediaPipe Setup ---
const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 0,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

hands.onResults(onResults);

function initAnnotationCanvas() {
    annotationCanvas.width = window.innerWidth * (window.devicePixelRatio || 1);
    annotationCanvas.height = window.innerHeight * (window.devicePixelRatio || 1);
    aCtx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    aCtx.lineCap = 'round';
    aCtx.lineJoin = 'round';
    aCtx.strokeStyle = '#00FF80';
    aCtx.lineWidth = 5;
    aCtx.shadowBlur = 15;
    // State
    var currentSlide = 0;
    let isLocked = false; 
    ...
    function setSlide(index) {
        if (isLocked) return;
        isLocked = true;

        playSound(440, 'square', 0.05); // Transition sound
        aCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        slides[currentSlide].classList.remove('active');
        slides[currentSlide].classList.add('prev');

        currentSlide = (index + slides.length) % slides.length;

        slides[currentSlide].classList.remove('prev');
        slides[currentSlide].classList.add('active');

        setTimeout(() => {
            isLocked = false;
            slides.forEach((s, i) => { if (i !== currentSlide) s.classList.remove('prev'); });
        }, 800);
    }
    window.setSlide = setSlide;
    window.currentSlide = currentSlide;
function isIndexOnly(landmarks) {
    const iUp = landmarks[8].y < landmarks[6].y - 0.05;
    const mUp = landmarks[12].y < landmarks[10].y - 0.05;
    return iUp && !mUp;
}

function isVictory(landmarks) {
    const iUp = landmarks[8].y < landmarks[6].y - 0.05;
    const mUp = landmarks[12].y < landmarks[10].y - 0.05;
    const rUp = landmarks[16].y < landmarks[14].y - 0.05;
    return iUp && mUp && !rUp;
}

function onResults(results) {
  ctx.save();
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
  
  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    laser.style.display = 'none';
    spotlight.style.display = 'none';
    lastX = null;
    lastDrawPoint = null;
    return;
  }

  const landmarks = results.multiHandLandmarks[0];
  const indexTip = landmarks[8];
  const thumbTip = landmarks[4];

  smoothedX += (indexTip.x - smoothedX) * SMOOTHING;
  smoothedY += (indexTip.y - smoothedY) * SMOOTHING;

  const x = (1 - smoothedX) * window.innerWidth;
  const y = smoothedY * window.innerHeight;

  const pointing = isIndexOnly(landmarks);
  const victory = isVictory(landmarks);
  const dist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
  const pinching = dist < 0.04;

  if (pointing || victory) {
      laser.style.display = 'block';
      laser.style.left = `${x}px`;
      laser.style.top = `${y}px`;
      spotlight.style.display = 'block';
      spotlight.style.left = `${x}px`;
      spotlight.style.top = `${y}px`;
  } else {
      laser.style.display = 'none';
      spotlight.style.display = 'none';
  }

  if (victory) {
      if (lastDrawPoint) {
          aCtx.beginPath();
          aCtx.moveTo(lastDrawPoint.x, lastDrawPoint.y);
          aCtx.lineTo(x, y);
          aCtx.stroke();
      }
      if (!lastDrawPoint) playSound(880, 'sine', 0.02);
      lastDrawPoint = {x, y};
      laser.style.background = '#00FF80';
      laser.style.boxShadow = '0 0 20px #00FF80';
  } else {
      lastDrawPoint = null;
      laser.style.background = '#ff4444';
      laser.style.boxShadow = '0 0 15px #ff4444';
  }

  if (pinching && !isLocked) {
      setSlide(currentSlide + 1);
      playSound(660, 'sine', 0.1);
  }

  const currentX = (1 - indexTip.x);
  if (lastX !== null) {
      const deltaX = currentX - lastX;
      hintPrev.classList.toggle('active', currentX < 0.2);
      hintNext.classList.toggle('active', currentX > 0.8);
      if (deltaX < -0.1 && currentX < 0.3 && !isLocked) {
          setSlide(currentSlide - 1);
      }
  }
  lastX = currentX;

  const handSize = Math.hypot(landmarks[0].x - landmarks[9].x, landmarks[0].y - landmarks[9].y);
  if (handSize > 0.35) slideDeck.classList.add('zoomed');
  else if (handSize < 0.25) slideDeck.classList.remove('zoomed');

  ctx.fillStyle = victory ? "#00FF80" : (pointing ? "#ff4444" : "#fff");
  ctx.beginPath(); ctx.arc(indexTip.x * canvas.width, indexTip.y * canvas.height, 6, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

startBtn.addEventListener('click', () => {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    playSound(880, 'sine', 0.5);
    splash.style.transition = 'opacity 0.5s';
    splash.style.opacity = '0';
    setTimeout(() => {
        splash.style.display = 'none';
        appContainer.style.display = 'block';
        initAnnotationCanvas();
        camera = new Camera(videoElement, { onFrame: async () => { await hands.send({image: videoElement}); }, width: 640, height: 480 });
        camera.start();
    }, 500);
});

window.addEventListener('resize', () => {
    if (appContainer.style.display !== 'none') initAnnotationCanvas();
    canvas.width = 180 * (window.devicePixelRatio || 1);
    canvas.height = 135 * (window.devicePixelRatio || 1);
});
