// ============================================================================
// 1. SINGULARITY PHYSICS ENGINE (750 Orbital Stars + Black Hole Gravity Well)
// ============================================================================
const canvas = document.getElementById("singularity-canvas");
const ctx = canvas.getContext("2d");

let width, height, centerX, centerY;
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    centerX = width / 2;
    centerY = height / 2;
}
window.addEventListener("resize", resize);
resize();

// ตัวแปรสถานะเมาส์และฟิสิกส์หลุมดำ
const mouse = {
    x: centerX,
    y: centerY,
    prevX: centerX,
    prevY: centerY,
    vel: 0,
    isDown: false
};

// โทนสีตาม DaVinci LUT
const lutPalettes = {
    cyan: ["#ffffff", "#38bdf8", "#818cf8", "#fde68a"],
    amber: ["#ffffff", "#f59e0b", "#ea580c", "#fef3c7"],
    crimson: ["#ffffff", "#f43f5e", "#a855f7", "#fecdd3"],
    mono: ["#ffffff", "#cbd5e1", "#94a3b8", "#64748b"]
};
let currentPalette = lutPalettes.cyan;

// คลาสจำลองอนุภาคดวงดาวในสนามความโน้มถ่วง
class CosmicParticle {
    constructor() {
        this.reset(true);
    }

    reset(initial = false) {
        // สุ่มวงโคจรรอบจุดศูนย์กลางแบบ Spiral Galaxy
        const angle = Math.random() * Math.PI * 2;
        const radius = initial 
            ? Math.random() * Math.max(width, height) * 0.65 
            : Math.random() * 180 + 20;

        this.x = centerX + Math.cos(angle) * radius;
        this.y = centerY + Math.sin(angle) * radius;
        this.z = Math.random() * 2.5 + 0.5; // ความลึก
        this.size = Math.random() * 1.8 + 0.4;

        // ความเร็วโคจรตั้งฉากกับรัศมี (Tangential Orbital Velocity)
        const orbitalSpeed = (0.4 / Math.sqrt(radius + 50)) * this.z;
        this.vx = -Math.sin(angle) * orbitalSpeed;
        this.vy = Math.cos(angle) * orbitalSpeed;

        this.color = currentPalette[Math.floor(Math.random() * currentPalette.length)];
        this.alpha = Math.random() * 0.75 + 0.25;
    }

    update() {
        this.prevX = this.x;
        this.prevY = this.y;

        // จุดศูนย์กลางแรงดึงดูด (ถ้าคลิกซ้ายค้าง จะย้ายหลุมดำมาที่ตำแหน่งเมาส์!)
        const targetX = mouse.isDown ? mouse.x : centerX;
        const targetY = mouse.isDown ? mouse.y : centerY;

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distSq = dx * dx + dy * dy + 1200;
        const dist = Math.sqrt(distSq);

        if (mouse.isDown) {
            // ฟิสิกส์หลุมดำ (Black Hole Accretion Swirl)
            const pullForce = 2800 / distSq;
            const swirlForce = 6.5 / dist;

            // แรงดึงดูดเข้าศูนย์กลาง + แรงเหวี่ยงหมุนวนรอบขอบฟ้าเหตุการณ์
            this.vx += (dx / dist) * pullForce - (dy / dist) * swirlForce * 0.15;
            this.vy += (dy / dist) * pullForce + (dx / dist) * swirlForce * 0.15;

            // แรงหน่วง (Damping)
            this.vx *= 0.96;
            this.vy *= 0.96;
        } else {
            // โหมดปกติ: โคจรช้าๆ รอบจักรวาล + ถูกรบกวนเมื่อเมาส์วิ่งผ่าน
            const gentlePull = 80 / distSq;
            this.vx += (dx / dist) * gentlePull - (dy / dist) * 0.0015;
            this.vy += (dy / dist) * gentlePull + (dx / dist) * 0.0015;

            // เมาส์ผลักดาวเบาๆ พร้อมส่งเสียงโน้ตพิณอวกาศเมื่อวิ่งชนดาวดวงใหญ่
            const mDx = this.x - mouse.x;
            const mDy = this.y - mouse.y;
            const mDist = Math.hypot(mDx, mDy);
            if (mDist < 90) {
                const repel = (90 - mDist) / 90;
                this.vx += (mDx / mDist) * repel * 0.25;
                this.vy += (mDy / mDist) * repel * 0.25;

                if (mDist < 22 && this.size > 1.9 && Math.random() < 0.08) {
                    triggerStarChime(this.z);
                }
            }

            this.vx *= 0.992;
            this.vy *= 0.992;
        }

        this.x += this.vx;
        this.y += this.vy;

        // ถ้านอกจอไกลเกินไป ให้สุ่มเกิดใหม่
        if (this.x < -200 || this.x > width + 200 || this.y < -200 || this.y > height + 200) {
            this.reset(true);
        }
    }

    draw() {
        const speed = Math.hypot(this.vx, this.vy);
        ctx.save();
        ctx.globalAlpha = this.alpha;

        // ถ้าความเร็วสูง (ถูกหลุมดำดูด หรือระเบิด Supernova) ให้วาดเป็นเส้นแสง Spaghettification
        if (speed > 2.2) {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.size * 0.85;
            ctx.beginPath();
            ctx.moveTo(this.prevX, this.prevY);
            ctx.lineTo(this.x, this.y);
            ctx.stroke();
        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

const STAR_COUNT = 750;
const particles = Array.from({ length: STAR_COUNT }, () => new CosmicParticle());

// ฟังก์ชันระเบิด Supernova (ผลักดาวทุกดวงกระจายออกจากศูนย์กลางด้วยความเร็วสูง)
document.getElementById("supernova-btn").addEventListener("click", () => {
    particles.forEach(p => {
        const angle = Math.atan2(p.y - centerY, p.x - centerX);
        const blastPower = Math.random() * 28 + 10;
        p.vx = Math.cos(angle) * blastPower;
        p.vy = Math.sin(angle) * blastPower;
    });
    triggerSupernovaSound();
});

// ============================================================================
// 2. WEB AUDIO API SYNTHESIZER & FFT SPECTRUM VISUALIZER
// ============================================================================
let audioCtx = null;
let analyser = null;
let dataArray = null;
let droneOsc1 = null, droneOsc2 = null, droneGain = null;
let isAudioActive = false;

const audioToggleBtn = document.getElementById("audio-toggle");

function initAudioEngine() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        // สร้างคลื่นเสียง Drone ความถี่ต่ำสไตล์ Interstellar / Sci-Fi
        droneOsc1 = audioCtx.createOscillator();
        droneOsc2 = audioCtx.createOscillator();
        droneGain = audioCtx.createGain();

        droneOsc1.type = "sawtooth";
        droneOsc1.frequency.setValueAtTime(55, audioCtx.currentTime); // โน้ต A1

        droneOsc2.type = "sine";
        droneOsc2.frequency.setValueAtTime(110.2, audioCtx.currentTime); // โน้ต A2 (Detuned เล็กน้อยให้มีมิติ)

        // กรองความถี่สูงออกด้วย Lowpass Filter เพื่อให้ได้เสียงทุ้มลึกนุ่มนวล
        const filter = audioCtx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(240, audioCtx.currentTime);

        droneGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        droneGain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 1.5);

        droneOsc1.connect(filter);
        droneOsc2.connect(filter);
        filter.connect(droneGain);
        droneGain.connect(analyser);
        analyser.connect(audioCtx.destination);

        droneOsc1.start();
        droneOsc2.start();
        isAudioActive = true;
        audioToggleBtn.innerHTML = `<i class="fas fa-volume-up"></i> SYNTH: ONLINE`;
        audioToggleBtn.classList.add("active");
    } else if (isAudioActive) {
        droneGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
        setTimeout(() => {
            audioCtx.suspend();
        }, 800);
        isAudioActive = false;
        audioToggleBtn.innerHTML = `<i class="fas fa-volume-mute"></i> SYNTH: MUTED`;
    } else {
        audioCtx.resume();
        droneGain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.8);
        isAudioActive = true;
        audioToggleBtn.innerHTML = `<i class="fas fa-volume-up"></i> SYNTH: ONLINE`;
    }
}

audioToggleBtn.addEventListener("click", initAudioEngine);

// เสียงโน้ตพิณอวกาศเมื่อเมาส์สัมผัสกับดวงดาว (Pentatonic Scale)
const pentatonicFreqs = [220, 261.63, 293.66, 329.63, 392.00, 440, 523.25, 659.25];
function triggerStarChime() {
    if (!isAudioActive || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    const freq = pentatonicFreqs[Math.floor(Math.random() * pentatonicFreqs.length)];
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(analyser);
    osc.start();
    osc.stop(audioCtx.currentTime + 1.2);
}

// เสียงระเบิดคลื่นความถี่ต่ำเมื่อกดปุ่ม Supernova
function triggerSupernovaSound() {
    if (!isAudioActive || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(160, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(28, audioCtx.currentTime + 1.5);

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);

    osc.connect(gain);
    gain.connect(analyser);
    osc.start();
    osc.stop(audioCtx.currentTime + 1.5);
}

// วาดวงแหวนคลื่นความถี่เสียง (FFT Circular Audio Visualizer) และเส้นโครงข่ายตรรกะ
function drawAudioAndNodeOverlay() {
    const hubX = mouse.isDown ? mouse.x : centerX;
    const hubY = mouse.isDown ? mouse.y : centerY;

    // 1. วาดวงแหวนขอบฟ้าเหตุการณ์เมื่อคลิกค้างหรือเปิดเสียง
    if (isAudioActive && analyser) {
        analyser.getByteFrequencyData(dataArray);
        const radius = mouse.isDown ? 65 : 140;

        ctx.save();
        ctx.strokeStyle = currentPalette[1];
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.35;

        ctx.beginPath();
        const bars = 40;
        for (let i = 0; i < bars; i++) {
            const val = dataArray[i] || 0;
            const angle = (i / bars) * Math.PI * 2;
            const r1 = radius;
            const r2 = radius + (val / 255) * 65;

            ctx.moveTo(hubX + Math.cos(angle) * r1, hubY + Math.sin(angle) * r1);
            ctx.lineTo(hubX + Math.cos(angle) * r2, hubY + Math.sin(angle) * r2);
        }
        ctx.stroke();
        ctx.restore();
    }

    // 2. ลากเส้นเรขาคณิตวิเคราะห์ดวงดาวรอบเมาส์ (Node Constellation)
    ctx.save();
    let connected = 0;
    for (let i = 0; i < particles.length; i++) {
        if (connected > 14) break;
        const p = particles[i];
        const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (d < 130) {
            ctx.strokeStyle = currentPalette[1];
            ctx.globalAlpha = (1 - d / 130) * 0.28;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            connected++;
        }
    }
    ctx.restore();
}

// ============================================================================
// 3. MAIN RENDER LOOP & FPS TELEMETRY
// ============================================================================
let lastTime = performance.now();
let frameCount = 0;
const fpsEl = document.getElementById("fps-counter");

function animateSingularity(now) {
    // คำนวณ FPS จริง
    frameCount++;
    if (now - lastTime >= 500) {
        fpsEl.textContent = `FPS: ${Math.min(60, Math.round((frameCount * 1000) / (now - lastTime)))}`;
        frameCount = 0;
        lastTime = now;
    }

    // ถ้าคลิกค้างให้ทิ้งรอยหางแสง (Motion Blur Trails)
    ctx.fillStyle = mouse.isDown ? "rgba(2, 3, 6, 0.18)" : "rgba(2, 3, 6, 0.42)";
    ctx.fillRect(0, 0, width, height);

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    drawAudioAndNodeOverlay();

    requestAnimationFrame(animateSingularity);
}
requestAnimationFrame(animateSingularity);

// ============================================================================
// 4. 3D PERSPECTIVE TILT, CUSTOM RETICLE & BLACK HOLE CONTROLS
// ============================================================================
const cursorCore = document.getElementById("cursor-core");
const cursorRing = document.getElementById("cursor-ring");
const cursorVel = document.getElementById("cursor-vel");
const coordsEl = document.getElementById("mouse-coords");
const gravityStateEl = document.getElementById("gravity-state");
const stage3D = document.getElementById("stage-3d");

window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    // คำนวณความเร็วเมาส์ (Velocity)
    const v = Math.hypot(mouse.x - mouse.prevX, mouse.y - mouse.prevY);
    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;

    // อัปเดตตำแหน่ง Custom Cursor
    cursorCore.style.left = `${mouse.x}px`;
    cursorCore.style.top = `${mouse.y}px`;
    cursorRing.style.left = `${mouse.x}px`;
    cursorRing.style.top = `${mouse.y}px`;
    cursorVel.textContent = `V:${v.toFixed(1)}`;

    // อัปเดตพิกัดบน HUD
    const pad = (n) => Math.floor(n).toString().padStart(4, "0");
    coordsEl.textContent = `X:${pad(mouse.x)} Y:${pad(mouse.y)}`;

    // เอียงเวที 3D ตามตำแหน่งเมาส์
    const rotY = ((mouse.x - centerX) / centerX) * 7;
    const rotX = -((mouse.y - centerY) / centerY) * 7;
    stage3D.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
});

// คลิกซ้ายค้างเพื่อเปิดหลุมดำ (Singularity Event Horizon)
window.addEventListener("mousedown", (e) => {
    if (e.target.closest("button") || e.target.closest(".modal-glass")) return;
    mouse.isDown = true;
    cursorRing.classList.add("active-well");
    gravityStateEl.textContent = "SINGULARITY COLLAPSE";
    gravityStateEl.style.color = "#fde68a";

    // ดันความถี่เสียง Drone ให้สูงขึ้นเมื่อเปิดหลุมดำ
    if (isAudioActive && droneOsc1) {
        droneOsc1.frequency.exponentialRampToValueAtTime(95, audioCtx.currentTime + 0.6);
    }
});

window.addEventListener("mouseup", () => {
    mouse.isDown = false;
    cursorRing.classList.remove("active-well");
    gravityStateEl.textContent = "NORMAL ORBIT";
    gravityStateEl.style.color = "";

    if (isAudioActive && droneOsc1) {
        droneOsc1.frequency.exponentialRampToValueAtTime(55, audioCtx.currentTime + 0.6);
    }
});

// ============================================================================
// 5. DAVINCI RESOLVE LUT NODE SWITCHER & CRYPTOGRAPHIC DECODER
// ============================================================================
document.querySelectorAll(".lut-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".lut-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const theme = btn.getAttribute("data-theme");
        document.body.setAttribute("data-lut", theme);
        currentPalette = lutPalettes[theme];
        particles.forEach(p => {
            p.color = currentPalette[Math.floor(Math.random() * currentPalette.length)];
        });
    });
});

// เอฟเฟกต์ถอดรหัสตัวอักษร (Cryptographic Scramble Reveal)
const cipherChars = "01#$%&*+<>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function scrambleText(element) {
    const original = element.getAttribute("data-value");
    let iteration = 0;
    const interval = setInterval(() => {
        element.innerText = original
            .split("")
            .map((char, index) => {
                if (char === " ") return " ";
                if (index < iteration) return original[index];
                return cipherChars[Math.floor(Math.random() * cipherChars.length)];
            })
            .join("");

        if (iteration >= original.length) clearInterval(interval);
        iteration += 1 / 2;
    }, 30);
}

// รันเอฟเฟกต์ถอดรหัสตอนเปิดหน้าเว็บ
window.addEventListener("load", () => {
    document.querySelectorAll(".scramble-init").forEach(el => scrambleText(el));
});

// รัน टाइमโค้ด 03:00:00:00
const timecodeEl = document.getElementById("timecode");
let f = 0, s = 0, m = 0, h = 3;
setInterval(() => {
    f = (f + 1) % 24;
    if (f === 0) s = (s + 1) % 60;
    if (s === 0 && f === 0) m = (m + 1) % 60;
    const pad = (n) => n.toString().padStart(2, "0");
    timecodeEl.textContent = `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`;
}, 1000 / 24);

// จัดการเปิด/ปิด Modal
const nodesModal = document.getElementById("nodes-modal");
const philoModal = document.getElementById("philo-modal");

document.getElementById("open-nodes-btn").addEventListener("click", () => nodesModal.classList.add("active"));
document.getElementById("open-philosophy-btn").addEventListener("click", () => philoModal.classList.add("active"));

document.querySelectorAll(".close-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        nodesModal.classList.remove("active");
        philoModal.classList.remove("active");
    });
});