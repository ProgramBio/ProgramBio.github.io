// ============================================================================
// 1. AUTO-DETECT GITHUB USERNAME & DYNAMIC REPOSITORY FETCHER
// ============================================================================
const canvas = document.getElementById("cosmos-canvas");
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

// ตรวจจับชื่อบัญชี GitHub จาก URL <username>.github.io อัตโนมัติ (หากรันในเครื่องจะใช้ค่าเริ่มต้น ProgramBio)
function detectGitHubUser() {
    const host = window.location.hostname;
    if (host.endsWith(".github.io")) {
        return host.split(".")[0];
    }
    return "ProgramBio";
}
const GITHUB_USER = detectGitHubUser();
const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USER}`;
const GITHUB_REPOS_URL = `https://github.com/${GITHUB_USER}?tab=repositories`;

// อัปเดตลิงก์ GitHub ทั้งหมดในหน้าเว็บให้ตรงกับ Username จริงของคุณทันที
document.querySelectorAll("#gh-top-link, #gh-credit-link").forEach(el => el.href = GITHUB_PROFILE_URL);
document.querySelectorAll("#gh-hud-btn, #gh-main-btn, .gh-link-target").forEach(el => el.href = GITHUB_REPOS_URL);

// คลังข้อมูลผลงานทั้ง 6 หมวด (สำหรับสุ่มปลดล็อกเมื่อเหวี่ยงดาวทำลายผลึกเรขาคณิต!)
const portfolioArchives = [
    {
        tag: "GITHUB REPO // ALGORITHMS",
        title: "Python & C Core Structures",
        desc: "อัลกอริทึมจัดเรียงข้อมูล, Singly Linked List และตรรกะหมากรุก checkmate.py",
        url: GITHUB_REPOS_URL,
        btnText: "ดู Repo",
        icon: "fab fa-github",
        accent: "#a855f7"
    },
    {
        tag: "GITHUB REPO // WEBGL & JS",
        title: "Interactive 3D & Physics Lab",
        desc: "ซอร์สโค้ดระบบฟิสิกส์ Canvas, Three.js 3D Scene และ Web App LocalStorage",
        url: GITHUB_REPOS_URL,
        btnText: "เปิดโค้ด",
        icon: "fas fa-code-branch",
        accent: "#38bdf8"
    },
    {
        tag: "GAME DEV // LUAU SCRIPT",
        title: "Combat & Parry Mechanics",
        desc: "ระบบคำนวณจังหวะปัดป้องระดับเสี้ยววินาทีและพาร์ทิเคิลเอฟเฟกต์ในเกม",
        url: GITHUB_REPOS_URL,
        btnText: "สำรวจ",
        icon: "fas fa-gamepad",
        accent: "#34d399"
    },
    {
        tag: "HARDWARE IOT // PHYSICAL COMP",
        title: "Microcontroller Roguelike",
        desc: "โปรเจกต์เชื่อมต่อเซนเซอร์ Ultrasonic, Keypad และ 7-Segment เข้ากับเว็บเกม",
        url: GITHUB_REPOS_URL,
        btnText: "ดูโปรเจกต์",
        icon: "fas fa-microchip",
        accent: "#f59e0b"
    },
    {
        tag: "VFX & COLOR // SHOWREEL",
        title: "Motion & DaVinci LUT Nodes",
        desc: "งานคอมโพสิตภาพ After Effects, CC Particle World และโหนดสีภาพยนตร์",
        url: "https://www.youtube.com/@ProgramBio",
        btnText: "ดูงานภาพ",
        icon: "fas fa-film",
        accent: "#ec4899"
    },
    {
        tag: "YOUTUBE // VIDEO ESSAY",
        title: "Existential Game Lore Analysis",
        desc: "วิเคราะห์จิตวิทยาตัวละคร เจตจำนงเสรี และปรัชญาด้านมืดในช่อง @ProgramBio",
        url: "https://www.youtube.com/@ProgramBio/videos",
        btnText: "ดูคลิป",
        icon: "fab fa-youtube",
        accent: "#ff0033"
    }
];

// ดึงรายชื่อ Repository จริงจาก GitHub API มาเติมในคลังและหน้าต่าง Modal อัตโนมัติ
async function fetchLiveGitHubRepos() {
    const repoListEl = document.getElementById("live-repo-list");
    try {
        const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=6`);
        if (!res.ok) throw new Error("API limit or user not found");
        const repos = await res.json();

        if (Array.isArray(repos) && repos.length > 0) {
            repoListEl.innerHTML = "";
            repos.forEach(repo => {
                // สร้างปุ่มลิงก์ไปที่แต่ละ Repo ในหน้าต่าง Modal
                const a = document.createElement("a");
                a.href = repo.html_url;
                a.target = "_blank";
                a.rel = "noopener noreferrer";
                a.className = "repo-pill";
                a.innerHTML = `<i class="fas fa-book-bookmark"></i> ${repo.name}`;
                repoListEl.appendChild(a);

                // เพิ่ม Repo จริงเข้าไปในคลังผลึกเวลาผู้เล่นยิงผลึกแตก!
                portfolioArchives.unshift({
                    tag: `GITHUB REPO // ${(repo.language || "CODE").toUpperCase()}`,
                    title: repo.name,
                    desc: repo.description || `คลังซอร์สโค้ดโปรเจกต์ ${repo.name} บน GitHub`,
                    url: repo.html_url,
                    btnText: "เปิด Repo",
                    icon: "fab fa-github",
                    accent: "#a855f7"
                });
            });
            return;
        }
    } catch (_) {
        // กรณีออฟไลน์หรือยังไม่มี Repo สาธารณะ แสดงลิงก์มาตรฐานแทน
    }
    repoListEl.innerHTML = `
        <a href="${GITHUB_REPOS_URL}" target="_blank" class="repo-pill"><i class="fab fa-github"></i> ${GITHUB_USER}.github.io</a>
        <a href="${GITHUB_REPOS_URL}" target="_blank" class="repo-pill"><i class="fas fa-terminal"></i> Python-C-Algorithms</a>
        <a href="${GITHUB_REPOS_URL}" target="_blank" class="repo-pill"><i class="fas fa-cube"></i> WebGL-Physics-Lab</a>
        <a href="https://www.youtube.com/@ProgramBio" target="_blank" class="repo-pill"><i class="fab fa-youtube"></i> @ProgramBio</a>
    `;
}
fetchLiveGitHubRepos();

// ============================================================================
// 2. STACKING TOAST NOTIFICATION ENGINE (สูงสุด 4 อัน + หลอดเวลา + เก่าสุดขึ้นบนจางลง)
// ============================================================================
const toastContainer = document.getElementById("toast-stack-container");
const MAX_TOASTS = 4;
const TOAST_DURATION = 7500; // 7.5 วินาทีต่ออัน
let activeToasts = [];       // เรียงลำดับจาก [เก่าสุด (บนสุด), ..., ใหม่สุด (ล่างสุด)]
let archiveCursor = 0;

function updateToastStackHierarchy() {
    const total = activeToasts.length;
    activeToasts.forEach((item, index) => {
        // คำนวณอายุ: อันล่างสุด (index === total - 1) คือใหม่สุด (age = 0)
        // อันที่อยู่ถัดขึ้นไปข้างบนจะมี age = 1, 2, 3 ตามลำดับ และจางลงเรื่อยๆ
        const age = (total - 1) - index;
        item.el.setAttribute("data-age", age.toString());
    });
}

function removeToastItem(item) {
    const idx = activeToasts.indexOf(item);
    if (idx === -1) return;
    activeToasts.splice(idx, 1);
    item.el.classList.add("closing");
    updateToastStackHierarchy();
    setTimeout(() => {
        if (item.el.parentNode) item.el.parentNode.removeChild(item.el);
    }, 320);
}

function spawnArchiveToast(customItem = null) {
    const data = customItem || portfolioArchives[archiveCursor % portfolioArchives.length];
    archiveCursor++;

    // ถ้ามีครบ 4 อันอยู่แล้ว ให้ตัดอันที่เก่าที่สุด (อันบนสุด index 0) ออกทันทีเพื่อดันอันอื่นขึ้นไป
    if (activeToasts.length >= MAX_TOASTS) {
        removeToastItem(activeToasts[0]);
    }

    const toastEl = document.createElement("div");
    toastEl.className = "archive-toast";
    toastEl.style.borderLeftColor = data.accent;

    toastEl.innerHTML = `
        <div class="toast-icon-box" style="color: ${data.accent}">
            <i class="${data.icon}"></i>
        </div>
        <div class="toast-body">
            <div class="toast-meta">
                <span>${data.tag}</span>
                <span class="toast-time-left">7.5s</span>
            </div>
            <div class="toast-title">${data.title}</div>
            <div class="toast-desc">${data.desc}</div>
        </div>
        <a href="${data.url}" target="_blank" rel="noopener noreferrer" class="toast-action-btn">
            ${data.btnText} <i class="fas fa-external-link-alt"></i>
        </a>
        <button class="toast-dismiss" title="ปิด">&times;</button>
        <div class="toast-timer-track">
            <div class="toast-timer-bar" style="background: ${data.accent}"></div>
        </div>
    `;

    const timerBar = toastEl.querySelector(".toast-timer-bar");
    const timeLeftLabel = toastEl.querySelector(".toast-time-left");
    const dismissBtn = toastEl.querySelector(".toast-dismiss");

    const toastObj = {
        el: toastEl,
        remaining: TOAST_DURATION,
        duration: TOAST_DURATION,
        isHovered: false,
        timerBar,
        timeLeftLabel
    };

    // เอาเมาส์ชี้เพื่อหยุดเวลาชั่วคราว
    toastEl.addEventListener("mouseenter", () => { toastObj.isHovered = true; });
    toastEl.addEventListener("mouseleave", () => { toastObj.isHovered = false; });
    dismissBtn.addEventListener("click", () => removeToastItem(toastObj));

    // เพิ่งสร้างเสร็จจะต่อท้ายด้านล่างสุดของ Stack (ทำให้ดันอันเก่าขึ้นไปข้างบน)
    toastContainer.appendChild(toastEl);
    activeToasts.push(toastObj);
    updateToastStackHierarchy();
}

function updateActiveToasts(dtSeconds) {
    const dtMs = dtSeconds * 1000;
    for (let i = activeToasts.length - 1; i >= 0; i--) {
        const item = activeToasts[i];
        if (!item.isHovered) {
            item.remaining -= dtMs;
        }
        const pct = Math.max(0, (item.remaining / item.duration) * 100);
        item.timerBar.style.width = `${pct.toFixed(1)}%`;
        item.timeLeftLabel.textContent = `${Math.max(0, item.remaining / 1000).toFixed(1)}s`;

        if (item.remaining <= 0) {
            removeToastItem(item);
        }
    }
}

// ============================================================================
// 3. REALISTIC MASS-KINETIC GARGANTUA ENGINE (ชาร์จ 30 วินาที + ตัวนับดาว)
// ============================================================================
const mouse = {
    x: centerX,
    y: centerY,
    prevX: centerX,
    prevY: centerY,
    vx: 0,
    vy: 0,
    flingVx: 0,
    flingVy: 0,
    speed: 0,
    tiltAngle: -0.22,
    tiltAmount: 0,
    isLeftDown: false,
    isRightDown: false,
    charge: 0,         // 0.0 -> 1.0 (ใช้เวลา 30 วินาทีเต็ม)
    bhRadius: 10,
    capturedCount: 0,
    globalPhase: 0
};

let supernovaRebirthFrames = 0;

const geometryModes = [
    { id: "01_GARGANTUA_ORBIT", name: "Pure Starlight Accretion & Lensed Halo" },
    { id: "02_SATURN_CLOSE_RING", name: "Tight Planetary Star Rings" },
    { id: "03_HEXAGRAM_RESONANCE", name: "6-Fold Harmonic Star Field" },
    { id: "04_LORENZ_INFINITY", name: "Figure-8 Relativistic Vortex" }
];
let currentGeoIndex = 0;

const philosophies = {
    existentialism: {
        palette: ["#ffffff", "#38bdf8", "#bae6fd", "#fde68a"],
        coreGlow: "#38bdf8",
        diskGlow: "rgba(56, 189, 248, 0.28)",
        sub: "CODE REPOSITORIES // VISUAL ARTS // EXISTENTIAL PHILOSOPHY",
        quote: "“มนุษย์ถูกสาปให้มีอิสระ และต้องเป็นผู้กำหนดความหมายของทุกสิ่งที่สร้างขึ้นด้วยตัวเอง... ลองปั้นหลุมดำเหวี่ยงดาวทำลายผลึกเรขาคณิตเพื่อปลดล็อกคลัง GitHub Repositories, โปรเจกต์โค้ด และผลงานของ ProgramBio”"
    },
    nihilism: {
        palette: ["#ffffff", "#cbd5e1", "#94a3b8", "#e2e8f0"],
        coreGlow: "#94a3b8",
        diskGlow: "rgba(148, 163, 184, 0.25)",
        sub: "NIHILISM // ARCHIVES ON GITHUB & YOUTUBE",
        quote: "“เมื่อตระหนักว่าจักรวาลไร้ซึ่งแก่นสารมาตั้งแต่ต้น เราก็เป็นอิสระจากกรอบความคาดหวังจอมปลอมทั้งหมด... เหลือเพียงความเงียบสงบและการสร้างสรรค์ที่บริสุทธิ์”"
    },
    determinism: {
        palette: ["#ffffff", "#fde68a", "#f59e0b", "#ea580c"],
        coreGlow: "#f59e0b",
        diskGlow: "rgba(245, 158, 11, 0.32)",
        sub: "DETERMINISM // GARGANTUA SINGULARITY EQUATION",
        quote: "“ไม่มีสิ่งใดเกิดขึ้นโดยบังเอิญ พลังงานจลน์ของดาวแต่ละดวงแปรผันตรงกับมวลและความเร็วรอบที่สะสมไว้ ทุกการปะทะคือสมการฟิสิกส์ที่เที่ยงตรง”"
    },
    absurdism: {
        palette: ["#ffffff", "#fecdd3", "#f43f5e", "#a855f7"],
        coreGlow: "#f43f5e",
        diskGlow: "rgba(244, 63, 94, 0.3)",
        sub: "ABSURDISM // REBELLING AGAINST THE MEANINGLESS COSMOS",
        quote: "“การโหยหาความหมายในจักรวาลที่ว่างเปล่าคือความย้อนแย้งที่สุดแสนจะงดงาม... และคำตอบเดียวของนักสร้างสรรค์ คือการดื่มด่ำและปั้นผลงานชิ้นเอกท่ามกลางความไร้สาระนั้น”"
    }
};
let currentTheme = philosophies.existentialism;
let currentPalette = currentTheme.palette;

// ============================================================================
// 4. ANOMALY TARGETS (ยิงแตกเพื่อปลดล็อก Pop-up Repo & ผลงานซ้อนกันได้ 4 ชั้น!)
// ============================================================================
const shockwaves = [];
const sparks = [];
const floatingTexts = [];

class AnomalyTarget {
    constructor(idx) {
        this.idx = idx;
        this.spawn();
    }
    spawn() {
        const angle = (this.idx / 4) * Math.PI * 2 + Math.random() * 0.9;
        const distX = width * 0.34 + Math.random() * (width * 0.1);
        const distY = height * 0.31 + Math.random() * (height * 0.1);
        this.x = centerX + Math.cos(angle) * distX;
        this.y = centerY + Math.sin(angle) * distY;

        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.radius = 25;
        this.maxHp = 100;
        this.hp = this.maxHp;
        this.rot = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.025;
        this.hitFlash = 0;
        this.Sides = (this.idx % 3) + 4;
        // ผูกผลึกแต่ละก้อนเข้ากับข้อมูล Repo / ผลงาน
        this.archiveData = portfolioArchives[(archiveCursor + this.idx) % portfolioArchives.length];
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.992;
        this.vy *= 0.992;
        this.rot += this.rotSpeed + (this.hitFlash * 0.1);
        if (this.hitFlash > 0) this.hitFlash = Math.max(0, this.hitFlash - 0.08);

        const margin = 75;
        if (this.x < margin) { this.x = margin; this.vx *= -1; }
        if (this.x > width - margin) { this.x = width - margin; this.vx *= -1; }
        if (this.y < margin) { this.y = margin; this.vy *= -1; }
        if (this.y > height - margin) { this.y = height - margin; this.vy *= -1; }
    }
    hit(impactVx, impactVy, kineticDamage, starMass) {
        this.hp -= kineticDamage;
        this.hitFlash = Math.min(1.0, 0.3 + (kineticDamage / 10));

        const knockback = 0.015 * starMass;
        this.vx += impactVx * knockback;
        this.vy += impactVy * knockback;

        const sparkCount = Math.min(12, Math.max(2, Math.round(kineticDamage * 1.5)));
        spawnSparks(this.x, this.y, sparkCount, currentPalette[2], 3 + kineticDamage * 0.5);
        playCrystalHitSound(this.hp <= 0, starMass);

        if (this.hp <= 0) {
            shockwaves.push({
                x: this.x,
                y: this.y,
                r: 10,
                maxR: 210,
                alpha: 1.0,
                color: currentPalette[3]
            });
            spawnSparks(this.x, this.y, 48, currentPalette[3], 14);
            floatingTexts.push({
                x: this.x,
                y: this.y,
                text: `UNLOCKED: ${this.archiveData.title}`,
                alpha: 1.0,
                vy: -1.3,
                color: currentPalette[3]
            });

            // เด้ง Pop-up ผลงานพร้อมหลอดเวลา (ถ้ามีอันเก่าอยู่จะดันขึ้นข้างบนและจางลง สูงสุด 4 อัน!)
            spawnArchiveToast(this.archiveData);

            stars.forEach(s => {
                const dx = s.x - this.x;
                const dy = s.y - this.y;
                const d = Math.hypot(dx, dy) + 1;
                if (d < 230) {
                    const blast = ((230 - d) / 230) * (14 / Math.sqrt(s.mass));
                    s.vx += (dx / d) * blast;
                    s.vy += (dy / d) * blast;
                    s.isSlinging = true;
                }
            });

            this.spawn();
        }
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        const hpRatio = Math.max(0, this.hp / this.maxHp);
        ctx.strokeStyle = this.hitFlash > 0 ? "#ffffff" : currentPalette[1];
        ctx.globalAlpha = 0.35 + this.hitFlash * 0.6;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * hpRatio);
        ctx.stroke();

        ctx.rotate(this.rot);
        ctx.strokeStyle = this.hitFlash > 0 ? "#ffffff" : currentPalette[3];
        ctx.fillStyle = this.hitFlash > 0 ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.03)";
        ctx.globalAlpha = 0.78 + this.hitFlash * 0.22;
        ctx.lineWidth = 1.4;

        ctx.beginPath();
        for (let i = 0; i <= this.Sides; i++) {
            const a = (i / this.Sides) * Math.PI * 2;
            const px = Math.cos(a) * this.radius;
            const py = Math.sin(a) * this.radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = currentPalette[0];
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.rotate(-this.rot);
        ctx.font = "400 8.5px 'Fira Code', monospace";
        ctx.fillStyle = currentPalette[1];
        ctx.globalAlpha = 0.65;
        ctx.textAlign = "center";
        const shortTag = this.archiveData.tag.split("// ")[1] || "ARCHIVE";
        ctx.fillText(`${shortTag} [${Math.ceil(this.hp)}%]`, 0, this.radius + 19);

        ctx.restore();
    }
}

const anomalies = Array.from({ length: 4 }, (_, i) => new AnomalyTarget(i));

function spawnSparks(x, y, count, color, maxSpeed = 6) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * maxSpeed + 1.2;
        sparks.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1.0,
            decay: Math.random() * 0.025 + 0.015,
            size: Math.random() * 2 + 0.8,
            color
        });
    }
}

function updateAndDrawEffects() {
    for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.r += (sw.maxR - sw.r) * 0.12;
        sw.alpha -= 0.025;
        if (sw.alpha <= 0) {
            shockwaves.splice(i, 1);
            continue;
        }
        ctx.save();
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = sw.alpha;
        ctx.lineWidth = 2.2 * sw.alpha;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vx *= 0.95;
        sp.vy *= 0.95;
        sp.alpha -= sp.decay;
        if (sp.alpha <= 0) {
            sparks.splice(i, 1);
            continue;
        }
        ctx.save();
        ctx.strokeStyle = sp.color;
        ctx.globalAlpha = sp.alpha;
        ctx.lineWidth = sp.size;
        ctx.beginPath();
        ctx.moveTo(sp.x, sp.y);
        ctx.lineTo(sp.x - sp.vx * 2.2, sp.y - sp.vy * 2.2);
        ctx.stroke();
        ctx.restore();
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y += ft.vy;
        ft.alpha -= 0.02;
        if (ft.alpha <= 0) {
            floatingTexts.splice(i, 1);
            continue;
        }
        ctx.save();
        ctx.font = "500 10px 'Fira Code', monospace";
        ctx.fillStyle = ft.color || currentPalette[3];
        ctx.globalAlpha = ft.alpha;
        ctx.textAlign = "center";
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
    }
}

// ============================================================================
// 5. STAR CLASS WITH MASS PHYSICS
// ============================================================================
class Star {
    constructor(index) {
        this.index = index;
        this.role = (index % 4 !== 0) ? "disk" : "close_halo";
        this.orbitRatio = Math.pow((index % 20) / 20, 1.5);
        this.eccentricity = 0.14 + (index % 5) * 0.03;
        this.phaseOffset = (index * 0.17) % (Math.PI * 2);
        this.inFrontOfBlackHole = true;
        this.isInGravityWell = false;
        this.isSlinging = false;
        this.chargeAtRelease = 0;
        this.spawn(false);
    }

    spawn(fadeIn = false) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;

        const randTier = Math.random();
        if (randTier < 0.60) {
            this.size = Math.random() * 0.6 + 0.55;
            this.mass = 0.65;
        } else if (randTier < 0.88) {
            this.size = Math.random() * 0.6 + 1.25;
            this.mass = 1.45;
        } else {
            this.size = Math.random() * 0.8 + 1.95;
            this.mass = 2.85;
        }

        const driftScale = 0.35 / Math.sqrt(this.mass);
        this.driftVx = (Math.random() - 0.5) * driftScale;
        this.driftVy = (Math.random() - 0.5) * driftScale;
        this.vx = this.driftVx;
        this.vy = this.driftVy;

        this.twinklePhase = Math.random() * Math.PI * 2;
        this.twinkleSpeed = Math.random() * 0.025 + 0.008;
        this.color = currentPalette[this.index % currentPalette.length];
        this.targetAlpha = Math.random() * 0.6 + 0.35;
        this.fadeProgress = fadeIn ? 0.01 : 1.0;
        this.isInGravityWell = false;
        this.isSlinging = false;
    }

    update(domTargets) {
        this.twinklePhase += this.twinkleSpeed;
        if (this.fadeProgress < 1.0) {
            this.fadeProgress = Math.min(1.0, this.fadeProgress + 0.015);
        }

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy) + 0.1;

        if (mouse.isRightDown) {
            this.isInGravityWell = false;
            if (dist < 240) {
                const repel = (((240 - dist) / 240) * 1.4) / Math.sqrt(this.mass);
                this.vx -= (dx / dist) * repel;
                this.vy -= (dy / dist) * repel;
            }
            this.vx *= 0.95;
            this.vy *= 0.95;

        } else if (mouse.isLeftDown) {
            const nonLinearCharge = Math.pow(mouse.charge, 1.65);
            const baseCaptureReach = mouse.bhRadius + 26 + nonLinearCharge * 265;
            const effectiveReach = baseCaptureReach / Math.pow(this.mass, 0.28);

            if (!this.isInGravityWell) {
                if (dist < effectiveReach) {
                    this.isInGravityWell = true;
                    this.phaseOffset = Math.atan2(this.y - mouse.y, this.x - mouse.x);
                } else if (dist < effectiveReach * 1.55) {
                    const gravPull = ((0.015 + nonLinearCharge * 0.18) / this.mass) * (1 - dist / (effectiveReach * 1.55));
                    this.vx += (dx / dist) * gravPull;
                    this.vy += (dy / dist) * gravPull;
                }
            } else {
                const maxHoldDist = baseCaptureReach * (1.45 + mouse.charge * 0.5);
                if (dist > maxHoldDist) {
                    this.isInGravityWell = false;
                }
            }

            if (this.isInGravityWell) {
                this.isSlinging = false;
                mouse.capturedCount++;

                const followFactor = Math.min(0.92, (0.78 + mouse.charge * 0.16) / Math.pow(this.mass, 0.12));
                this.x += mouse.vx * followFactor;
                this.y += mouse.vy * followFactor;

                const spinSpeed = ((0.038 + mouse.charge * 0.095) / Math.pow(this.mass, 0.3)) * (1.3 - this.orbitRatio * 0.4);
                this.phaseOffset += spinSpeed;

                const diskTilt = mouse.speed > 0.5 ? mouse.tiltAngle : -0.22;
                const cosT = Math.cos(diskTilt);
                const sinT = Math.sin(diskTilt);
                const diskFlatten = Math.max(0.18, 0.30 - mouse.tiltAmount * 0.12);

                const periapsisDip = 1 - this.eccentricity * Math.cos(this.phaseOffset);
                const massCentrifugalOffset = (this.mass - 0.65) * (6 + mouse.charge * 12);
                const closeMargin = 2 + massCentrifugalOffset + this.orbitRatio * (22 + mouse.charge * 58);
                const orbitR = (mouse.bhRadius + closeMargin) * periapsisDip;

                let localX = 0;
                let localY = 0;

                if (currentGeoIndex === 0) {
                    if (this.role === "disk") {
                        localX = Math.cos(this.phaseOffset) * (orbitR * 1.22);
                        localY = Math.sin(this.phaseOffset) * (orbitR * 1.22) * diskFlatten;
                        this.inFrontOfBlackHole = Math.sin(this.phaseOffset) > -0.1;
                    } else {
                        const tightHaloR = mouse.bhRadius + 1.5 + (this.orbitRatio * (10 + mouse.charge * 20)) * periapsisDip;
                        localX = Math.cos(this.phaseOffset) * tightHaloR;
                        localY = Math.sin(this.phaseOffset) * tightHaloR;
                        this.inFrontOfBlackHole = false;
                    }
                } else if (currentGeoIndex === 1) {
                    localX = Math.cos(this.phaseOffset) * (orbitR * 1.18);
                    localY = Math.sin(this.phaseOffset) * (orbitR * 1.18) * 0.28;
                    this.inFrontOfBlackHole = Math.sin(this.phaseOffset) > 0;
                } else if (currentGeoIndex === 2) {
                    const petal = 1 + 0.22 * Math.cos(6 * this.phaseOffset);
                    localX = Math.cos(this.phaseOffset) * orbitR * petal;
                    localY = Math.sin(this.phaseOffset) * orbitR * petal * (1 - mouse.tiltAmount * 0.5);
                    this.inFrontOfBlackHole = true;
                } else {
                    const scale = orbitR * 1.25;
                    localX = Math.cos(this.phaseOffset) * scale;
                    localY = Math.sin(this.phaseOffset * 2) * (scale * 0.45);
                    this.inFrontOfBlackHole = true;
                }

                const targetX = mouse.x + (localX * cosT - localY * sinT);
                const targetY = mouse.y + (localX * sinT + localY * cosT);

                const pullTightness = (0.065 + mouse.charge * 0.14) / Math.pow(this.mass, 0.25);
                this.vx += (targetX - this.x) * pullTightness;
                this.vy += (targetY - this.y) * pullTightness;
                this.vx *= 0.78;
                this.vy *= 0.78;
            } else {
                this.inFrontOfBlackHole = true;
                this.vx += (this.driftVx - this.vx) * 0.03;
                this.vy += (this.driftVy - this.vy) * 0.03;
            }

        } else {
            this.isInGravityWell = false;
            this.inFrontOfBlackHole = true;

            const dragRate = 0.012 / Math.pow(this.mass, 0.35);
            this.vx += (this.driftVx - this.vx) * dragRate;
            this.vy += (this.driftVy - this.vy) * dragRate;

            const speed = Math.hypot(this.vx, this.vy);
            if (speed < 1.6) this.isSlinging = false;

            if (this.isSlinging && speed > 1.8) {
                this.checkCollisions(domTargets, speed);
            }

            if (dist < 65 && !this.isSlinging) {
                const push = (((65 - dist) / 65) * 0.1) / this.mass;
                this.vx -= (dx / dist) * push;
                this.vy -= (dy / dist) * push;
            }
        }

        const speed = Math.hypot(this.vx, this.vy);
        const maxSpeed = (supernovaRebirthFrames > 0 || this.isSlinging) ? 28 : 15;
        if (speed > maxSpeed) {
            this.vx = (this.vx / speed) * maxSpeed;
            this.vy = (this.vy / speed) * maxSpeed;
        }

        this.x += this.vx;
        this.y += this.vy;

        const isOut = (this.x < -20 || this.x > width + 20 || this.y < -20 || this.y > height + 20);
        if (isOut) {
            if (supernovaRebirthFrames > 0 || speed > 2.8) {
                this.spawn(true);
            } else {
                if (this.x < -20) this.x = width + 15;
                if (this.x > width + 20) this.x = -15;
                if (this.y < -20) this.y = height + 15;
                if (this.y > height + 20) this.y = -15;
                this.vx = this.driftVx;
                this.vy = this.driftVy;
            }
        }
    }

    checkCollisions(domTargets, currentSpeed) {
        for (let i = 0; i < anomalies.length; i++) {
            const a = anomalies[i];
            const d = Math.hypot(this.x - a.x, this.y - a.y);
            if (d < a.radius + this.size + 4) {
                const bhMultiplier = 0.25 + Math.pow(this.chargeAtRelease, 1.5) * 2.75;
                const kineticDmg = Number((this.mass * (currentSpeed / 9.5) * bhMultiplier).toFixed(1));

                a.hit(this.vx, this.vy, kineticDmg, this.mass);

                if (kineticDmg >= 1.2 && Math.random() < 0.45) {
                    floatingTexts.push({
                        x: this.x + (Math.random() - 0.5) * 16,
                        y: this.y - 8,
                        text: `-${kineticDmg.toFixed(1)}`,
                        alpha: 0.9,
                        vy: -0.9,
                        color: this.mass > 2.0 ? currentPalette[3] : currentPalette[1]
                    });
                }

                const bounceSpeed = (5.5 / Math.sqrt(this.mass));
                const nx = (this.x - a.x) / (d + 0.1);
                const ny = (this.y - a.y) / (d + 0.1);
                this.vx = nx * bounceSpeed + (Math.random() - 0.5) * 2.5;
                this.vy = ny * bounceSpeed + (Math.random() - 0.5) * 2.5;
                this.isSlinging = false;
                return;
            }
        }

        for (let i = 0; i < domTargets.length; i++) {
            const item = domTargets[i];
            const r = item.rect;
            if (this.x >= r.left && this.x <= r.right && this.y >= r.top && this.y <= r.bottom) {
                spawnSparks(this.x, this.y, Math.round(2 * this.mass), currentPalette[1], 5);

                const forceFactor = 0.22 * this.mass * (0.4 + this.chargeAtRelease);
                const kickX = Math.max(-12, Math.min(12, this.vx * forceFactor));
                const kickY = Math.max(-12, Math.min(12, this.vy * forceFactor));
                item.el.style.transform = `translate3d(${kickX.toFixed(1)}px, ${kickY.toFixed(1)}px, 0)`;
                clearTimeout(item.el._resetTimer);
                item.el._resetTimer = setTimeout(() => {
                    item.el.style.transform = "";
                }, 130);

                this.vy *= -0.7;
                this.vx *= 0.7;
                this.isSlinging = false;
                return;
            }
        }
    }

    draw(audioBoost = 0) {
        const speed = Math.hypot(this.vx, this.vy);
        const dopplerBoost = (mouse.isLeftDown && this.inFrontOfBlackHole) ? 0.28 : 0;
        const twinkle = this.targetAlpha + Math.sin(this.twinklePhase) * 0.2 + audioBoost * 0.2 + dopplerBoost;
        const alpha = Math.min(1, Math.max(0.08, twinkle)) * this.fadeProgress;

        ctx.fillStyle = this.color;

        if (speed > 0.7) {
            const tailLen = Math.min(speed * (3.2 + this.mass * 0.6), 42);
            const ux = this.vx / speed;
            const uy = this.vy / speed;

            ctx.strokeStyle = this.color;
            ctx.globalAlpha = alpha * 0.85;
            ctx.lineWidth = this.size * (mouse.isLeftDown ? 1.1 : 0.9);
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - ux * tailLen, this.y - uy * tailLen);
            ctx.stroke();
        }

        if (this.mass > 1.3) {
            ctx.globalAlpha = alpha * (this.mass > 2.0 ? 0.28 : 0.18);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

const STAR_COUNT = 460;
const stars = Array.from({ length: STAR_COUNT }, (_, i) => new Star(i));

// ============================================================================
// 6. PURE BLACK HOLE EVENT HORIZON & SPACETIME GRID
// ============================================================================
function drawBlackHoleVoid() {
    if (!mouse.isLeftDown) return;

    const r = mouse.bhRadius;
    const nonLinearCharge = Math.pow(mouse.charge, 1.65);
    const currentReach = r + 26 + nonLinearCharge * 265;

    ctx.save();
    ctx.translate(mouse.x, mouse.y);

    ctx.strokeStyle = currentPalette[1];
    ctx.globalAlpha = 0.12 + mouse.charge * 0.12;
    ctx.lineWidth = 0.8;
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, currentReach, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    const haloGrad = ctx.createRadialGradient(0, 0, r * 0.9, 0, 0, r * 1.9);
    haloGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
    haloGrad.addColorStop(0.2, currentTheme.diskGlow);
    haloGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#010204";
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawSpacetimeFabric() {
    ctx.save();
    ctx.strokeStyle = currentPalette[1];
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = mouse.isLeftDown ? (0.045 + mouse.charge * 0.08) : 0.04;

    const step = 95;
    const maxDist = mouse.isLeftDown ? (85 + Math.pow(mouse.charge, 1.4) * 280) : 160;

    function warpPoint(gx, gy) {
        const dx = gx - mouse.x;
        const dy = gy - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist >= maxDist || dist < 1) return { x: gx, y: gy };

        const t = 1 - dist / maxDist;
        const smooth = t * t * (3 - 2 * t);

        if (mouse.isRightDown) {
            return {
                x: gx + (dx / dist) * smooth * 35,
                y: gy + (dy / dist) * smooth * 35
            };
        } else if (mouse.isLeftDown) {
            const pullStrength = 8 + mouse.charge * 42;
            const pull = Math.min(dist * 0.65, smooth * pullStrength);
            return {
                x: gx - (dx / dist) * pull,
                y: gy - (dy / dist) * pull
            };
        } else {
            return {
                x: gx - (dx / dist) * smooth * 8,
                y: gy - (dy / dist) * smooth * 8
            };
        }
    }

    for (let y = step; y < height; y += step) {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 35) {
            const pt = warpPoint(x, y);
            if (x === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
    }

    for (let x = step; x < width; x += step) {
        ctx.beginPath();
        for (let y = 0; y <= height; y += 35) {
            const pt = warpPoint(x, y);
            if (y === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
    }
    ctx.restore();
}

// ============================================================================
// 7. AUDIO SYSTEM & MASS-BASED COLLISION SOUND FX
// ============================================================================
let audioCtx = null, masterGain = null, analyser = null, freqData = null, melodyTimer = null;
let isAudioPlaying = false;
const audioToggleBtn = document.getElementById("audio-toggle");
const spaceMelodyNotes = [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];

function playSingleSpaceNote() {
    if (!isAudioPlaying || !audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const noteGain = audioCtx.createGain();

    osc.type = "sine";
    const freq = spaceMelodyNotes[Math.floor(Math.random() * spaceMelodyNotes.length)];
    osc.frequency.setValueAtTime(freq, now);

    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.linearRampToValueAtTime(0.055, now + 0.15);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

    osc.connect(noteGain);
    noteGain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 3.6);
}

function playCrystalHitSound(isShatter = false, starMass = 1.0) {
    if (!isAudioPlaying || !audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = isShatter ? "triangle" : "sine";
    const pitchFactor = 1.6 / Math.sqrt(starMass);
    const baseFreq = isShatter ? 780 : spaceMelodyNotes[Math.floor(Math.random() * spaceMelodyNotes.length)] * pitchFactor;
    osc.frequency.setValueAtTime(baseFreq, now);
    if (isShatter) {
        osc.frequency.exponentialRampToValueAtTime(95, now + 0.65);
    }

    const vol = isShatter ? 0.2 : Math.min(0.1, 0.03 * starMass);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (isShatter ? 0.7 : 0.3));

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + (isShatter ? 0.75 : 0.35));
}

function initAudioSystem() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    freqData = new Uint8Array(analyser.frequencyBinCount);

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);

    const delay = audioCtx.createDelay();
    const feedback = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    delay.delayTime.setValueAtTime(0.48, audioCtx.currentTime);
    feedback.gain.setValueAtTime(0.45, audioCtx.currentTime);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1200, audioCtx.currentTime);

    masterGain.connect(analyser);
    masterGain.connect(delay);
    delay.connect(filter);
    filter.connect(feedback);
    feedback.connect(delay);
    filter.connect(analyser);
    analyser.connect(audioCtx.destination);

    [110.00, 164.81].forEach(freq => {
        const padOsc = audioCtx.createOscillator();
        const padGain = audioCtx.createGain();
        padOsc.type = "sine";
        padOsc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        padGain.gain.setValueAtTime(0.035, audioCtx.currentTime);
        padOsc.connect(padGain);
        padGain.connect(masterGain);
        padOsc.start();
    });
}

audioToggleBtn.addEventListener("click", () => {
    if (!audioCtx) initAudioSystem();
    if (audioCtx.state === "suspended") audioCtx.resume();

    const now = audioCtx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(Math.max(0.0001, masterGain.gain.value), now);

    if (!isAudioPlaying) {
        masterGain.gain.exponentialRampToValueAtTime(0.5, now + 1.2);
        isAudioPlaying = true;
        audioToggleBtn.innerHTML = `<i class="fas fa-volume-up"></i> AMBIENT: ON`;
        audioToggleBtn.classList.add("active");
        playSingleSpaceNote();
        melodyTimer = setInterval(playSingleSpaceNote, 1800);
    } else {
        masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        isAudioPlaying = false;
        clearInterval(melodyTimer);
        audioToggleBtn.innerHTML = `<i class="fas fa-volume-mute"></i> AMBIENT: OFF`;
        audioToggleBtn.classList.remove("active");
    }
});

function playSubBoom() {
    if (!isAudioPlaying || !audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 1.2);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 1.2);
}

// ปุ่มระเบิด Supernova
document.getElementById("supernova-btn").addEventListener("click", () => {
    supernovaRebirthFrames = 240;
    shockwaves.push({ x: centerX, y: centerY, r: 20, maxR: Math.max(width, height) * 0.7, alpha: 1.0, color: currentPalette[3] });
    stars.forEach(s => {
        const dx = s.x - centerX;
        const dy = s.y - centerY;
        const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.25;
        const speed = (Math.random() * 14 + 7) / Math.pow(s.mass, 0.25);
        s.vx = Math.cos(angle) * speed - Math.sin(angle) * (speed * 0.35);
        s.vy = Math.sin(angle) * speed + Math.cos(angle) * (speed * 0.35);
        s.isSlinging = true;
        s.chargeAtRelease = 0.5;
    });
    playSubBoom();
});

// ============================================================================
// 8. MAIN 60FPS RENDER LOOP & TOAST TIMER UPDATER
// ============================================================================
let lastTime = performance.now();
let prevFrameTime = performance.now();
let frames = 0;
const fpsEl = document.getElementById("fps-counter");
const flareStreak = document.getElementById("flare-streak");
const gravityStateEl = document.getElementById("gravity-state");
const rpmGaugeEl = document.getElementById("rpm-gauge");
const parallaxHeader = document.getElementById("parallax-header");
const cursorDot = document.getElementById("cursor-dot");
const cursorRing = document.getElementById("cursor-ring");
const domInteractiveBtns = Array.from(document.querySelectorAll(".cyber-cinema-btn"));

function renderLoop(now) {
    const dt = Math.min(0.1, (now - prevFrameTime) / 1000);
    prevFrameTime = now;

    frames++;
    if (now - lastTime >= 500) {
        fpsEl.textContent = `FPS: ${Math.min(60, Math.round((frames * 1000) / (now - lastTime)))}`;
        frames = 0;
        lastTime = now;
    }

    // อัปเดตหลอดเวลาของ Pop-up ทั้งหมดที่กำลังแสดงอยู่ใน Stack
    updateActiveToasts(dt);

    ctx.clearRect(0, 0, width, height);
    mouse.globalPhase += 0.025;
    if (supernovaRebirthFrames > 0) supernovaRebirthFrames--;

    const rawVx = mouse.x - mouse.prevX;
    const rawVy = mouse.y - mouse.prevY;
    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;

    mouse.vx += (rawVx - mouse.vx) * 0.25;
    mouse.vy += (rawVy - mouse.vy) * 0.25;
    mouse.speed = Math.hypot(mouse.vx, mouse.vy);

    if (mouse.speed > Math.hypot(mouse.flingVx, mouse.flingVy)) {
        mouse.flingVx = mouse.vx;
        mouse.flingVy = mouse.vy;
    } else {
        mouse.flingVx *= 0.92;
        mouse.flingVy *= 0.92;
    }

    mouse.tiltAmount = Math.min(1, mouse.speed / 28);
    if (mouse.speed > 0.5) {
        mouse.tiltAngle = Math.atan2(mouse.vy, mouse.vx);
    }

    const headerShiftX = mouse.vx * 0.8;
    const headerShiftY = mouse.vy * 0.6;
    const headerSkew = Math.max(-14, Math.min(14, -mouse.vx * 0.35));
    const headerRotate = Math.max(-4, Math.min(4, mouse.vx * 0.08));
    parallaxHeader.style.transform = `translate3d(${headerShiftX.toFixed(1)}px, ${headerShiftY.toFixed(1)}px, 0) skewX(${headerSkew.toFixed(2)}deg) rotate(${headerRotate.toFixed(2)}deg)`;

    if (mouse.isLeftDown) {
        mouse.charge = Math.min(1.0, mouse.charge + (dt / 30.0));
        mouse.bhRadius = 10 + mouse.charge * 62;
    } else {
        mouse.charge = Math.max(0, mouse.charge * 0.88);
        mouse.bhRadius += (14 - mouse.bhRadius) * 0.2;
    }

    const diameter = mouse.bhRadius * 2;
    cursorRing.style.width = `${diameter.toFixed(1)}px`;
    cursorRing.style.height = `${diameter.toFixed(1)}px`;
    cursorDot.style.transform = `translate3d(${mouse.x - 3}px, ${mouse.y - 3}px, 0)`;
    cursorRing.style.transform = `translate3d(${(mouse.x - mouse.bhRadius).toFixed(1)}px, ${(mouse.y - mouse.bhRadius).toFixed(1)}px, 0)`;

    drawSpacetimeFabric();
    anomalies.forEach(a => {
        a.update();
        a.draw();
    });

    let audioBoost = 0;
    if (isAudioPlaying && analyser) {
        analyser.getByteFrequencyData(freqData);
        audioBoost = (freqData[2] || 0) / 255;
        flareStreak.style.opacity = (0.55 + audioBoost * 0.45).toFixed(2);
    }

    const domRects = domInteractiveBtns.map(el => ({ el, rect: el.getBoundingClientRect() }));

    mouse.capturedCount = 0;

    for (let i = 0; i < stars.length; i++) {
        stars[i].update(domRects);
        if (!stars[i].inFrontOfBlackHole) {
            stars[i].draw(audioBoost);
        }
    }

    if (mouse.isLeftDown) {
        const powerPct = Math.floor(mouse.charge * 100);
        const rpm = Math.floor(800 + Math.pow(mouse.charge, 1.3) * 14200);
        gravityStateEl.textContent = `STARS: ${mouse.capturedCount} // MASS: ${powerPct}% [${rpm} RPM]`;
        rpmGaugeEl.textContent = `★ ${mouse.capturedCount} STARS | MASS ${powerPct}% | ${rpm} RPM`;
    }

    drawBlackHoleVoid();

    for (let i = 0; i < stars.length; i++) {
        if (stars[i].inFrontOfBlackHole) {
            stars[i].draw(audioBoost);
        }
    }

    updateAndDrawEffects();

    requestAnimationFrame(renderLoop);
}
requestAnimationFrame(renderLoop);

// ============================================================================
// 9. MOUSE & MASS-PROPORTIONAL SLINGSHOT RELEASE
// ============================================================================
const coordsEl = document.getElementById("mouse-coords");
const geoBtn = document.getElementById("geometry-btn");

function cycleGeometryMode(dir = 1) {
    currentGeoIndex = (currentGeoIndex + dir + geometryModes.length) % geometryModes.length;
    const mode = geometryModes[currentGeoIndex];
    geoBtn.innerHTML = `<i class="fas fa-atom"></i> GEOMETRY: ${mode.id}`;
}

geoBtn.addEventListener("click", () => cycleGeometryMode(1));

window.addEventListener("wheel", (e) => {
    if (e.target.closest(".modal-glass")) return;
    cycleGeometryMode(e.deltaY > 0 ? 1 : -1);
});

window.addEventListener("contextmenu", (e) => e.preventDefault());

window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    const pad = (n) => Math.floor(n).toString().padStart(4, "0");
    coordsEl.textContent = `X:${pad(mouse.x)} Y:${pad(mouse.y)}`;
});

window.addEventListener("mousedown", (e) => {
    if (e.target.closest("button") || e.target.closest("a") || e.target.closest(".modal-glass") || e.target.closest(".archive-toast")) return;

    if (e.button === 2) {
        mouse.isRightDown = true;
        gravityStateEl.textContent = "DARK ENERGY REPULSOR";
        gravityStateEl.style.color = "#f43f5e";
    } else if (e.button === 0) {
        mouse.isLeftDown = true;
        mouse.charge = 0.001;
        mouse.bhRadius = 10;
        cursorRing.classList.add("pulling");
        gravityStateEl.style.color = "var(--accent-color)";
    }
});

window.addEventListener("mouseup", (e) => {
    if (e.button === 2) {
        mouse.isRightDown = false;
        gravityStateEl.textContent = "0 RPM [DRIFT]";
        gravityStateEl.style.color = "";
        return;
    }

    if (!mouse.isLeftDown) return;
    mouse.isLeftDown = false;
    cursorRing.classList.remove("pulling");
    rpmGaugeEl.textContent = "";

    const releasedCharge = mouse.charge;
    const releasedStars = mouse.capturedCount;
    const flingSpeed = Math.hypot(mouse.flingVx, mouse.flingVy);

    const blackHoleCentrifugal = 2.0 + Math.pow(releasedCharge, 1.4) * 18.0;
    const slingChargeFactor = 0.35 + Math.pow(releasedCharge, 1.2) * 1.85;

    stars.forEach(s => {
        if (s.isInGravityWell) {
            s.isInGravityWell = false;
            const dx = s.x - mouse.x;
            const dy = s.y - mouse.y;
            const d = Math.hypot(dx, dy) + 1;

            const tx = -dy / d;
            const ty = dx / d;
            const ox = dx / d;
            const oy = dy / d;

            const massVelocityFactor = 1.15 / Math.pow(s.mass, 0.28);

            if (flingSpeed > 1.6) {
                const aimDirX = mouse.flingVx / flingSpeed;
                const aimDirY = mouse.flingVy / flingSpeed;
                const rawVel = (flingSpeed * 0.85 * slingChargeFactor + blackHoleCentrifugal * 0.75) * massVelocityFactor;
                const totalVel = Math.min(28, rawVel);

                s.vx = (aimDirX * 0.78 + (tx * 0.12 + ox * 0.1)) * totalVel + (Math.random() - 0.5) * 1.4;
                s.vy = (aimDirY * 0.78 + (ty * 0.12 + oy * 0.1)) * totalVel + (Math.random() - 0.5) * 1.4;
            } else {
                const burstVel = blackHoleCentrifugal * massVelocityFactor;
                s.vx = (tx * 0.65 + ox * 0.55) * burstVel;
                s.vy = (ty * 0.65 + oy * 0.55) * burstVel;
            }

            s.isSlinging = true;
            s.chargeAtRelease = releasedCharge;
        }
    });

    gravityStateEl.textContent = `RELEASED ${releasedStars} STARS [MASS ${Math.floor(releasedCharge * 100)}%]`;
    setTimeout(() => {
        if (!mouse.isLeftDown) {
            gravityStateEl.textContent = "0 RPM [DRIFT]";
            gravityStateEl.style.color = "";
        }
    }, 1200);
});

// สลับโหมดปรัชญาทั้ง 4
const paradigmSub = document.getElementById("paradigm-sub");
const paradigmQuote = document.getElementById("paradigm-quote");

document.querySelectorAll(".philo-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".philo-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const themeKey = btn.getAttribute("data-theme");
        currentTheme = philosophies[themeKey];

        document.body.setAttribute("data-philosophy", themeKey);
        currentPalette = currentTheme.palette;
        paradigmSub.textContent = currentTheme.sub;
        paradigmQuote.textContent = currentTheme.quote;

        stars.forEach((s, idx) => {
            s.color = currentPalette[idx % currentPalette.length];
        });
    });
});

// ถอดรหัสข้อความตอนโหลดหน้าเว็บ
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

window.addEventListener("load", () => {
    document.querySelectorAll(".scramble-init").forEach(el => scrambleText(el));
});

// Timecode 03:00:00:00
const timecodeEl = document.getElementById("timecode");
let f = 0, s = 0, m = 0, h = 3;
setInterval(() => {
    f = (f + 1) % 24;
    if (f === 0) s = (s + 1) % 60;
    if (s === 0 && f === 0) m = (m + 1) % 60;
    const pad = (n) => n.toString().padStart(2, "0");
    timecodeEl.textContent = `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`;
}, 1000 / 24);

// เปิด-ปิด Modal
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