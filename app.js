/**
 * PROTESLA LABS // INTERACTIVE ENGINE & CYBER HUD
 * 100% Vanilla JavaScript. Zero external dependencies. High performance.
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. WEB AUDIO API SYNTHESIZER (HAPTIC SOUND EFFECTS)
  // =========================================================================
  let audioCtx = null;
  let sfxEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type, duration, gainLevel, slideTo) {
    if (!sfxEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(slideTo, audioCtx.currentTime + duration);
      }

      gain.gain.setValueAtTime(gainLevel || 0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  const SFX = {
    click: () => playTone(800, 'sine', 0.06, 0.05, 400),
    hover: () => playTone(1200, 'triangle', 0.03, 0.02, 1600),
    alert: () => {
      playTone(450, 'sawtooth', 0.12, 0.08, 900);
      setTimeout(() => playTone(900, 'sawtooth', 0.15, 0.08, 1200), 80);
    },
    terminal: () => playTone(1400, 'square', 0.03, 0.015, 700),
    matrix: () => playTone(300, 'sine', 0.25, 0.08, 1200)
  };

  // Sound toggle button
  const sfxToggleBtn = document.getElementById('sfx-toggle');
  if (sfxToggleBtn) {
    sfxToggleBtn.addEventListener('click', () => {
      sfxEnabled = !sfxEnabled;
      if (sfxEnabled) {
        sfxToggleBtn.classList.remove('sfx-muted');
        sfxToggleBtn.querySelector('.sfx-text').textContent = 'SFX: ВКЛ';
        SFX.click();
      } else {
        sfxToggleBtn.classList.add('sfx-muted');
        sfxToggleBtn.querySelector('.sfx-text').textContent = 'SFX: ВЫКЛ';
      }
    });
  }

  // Bind sound to elements
  document.addEventListener('click', (e) => {
    if (e.target.closest('.sound-click') || e.target.closest('.btn') || e.target.closest('.quick-btn') || e.target.closest('.preset-btn')) {
      SFX.click();
    }
  });

  // =========================================================================
  // 2. THEME SWITCHER
  // =========================================================================
  const themeDots = document.querySelectorAll('.theme-dot');
  const savedTheme = localStorage.getItem('protesla_theme') || 'emerald';

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('protesla_theme', theme);
    themeDots.forEach(dot => {
      dot.classList.toggle('active', dot.getAttribute('data-theme') === theme);
    });
    SFX.click();
  }

  setTheme(savedTheme);

  themeDots.forEach(dot => {
    dot.addEventListener('click', () => {
      setTheme(dot.getAttribute('data-theme'));
    });
  });

  // =========================================================================
  // 3. INTERACTIVE PARTICLE PHYSICS BACKGROUND (CANVAS 60 FPS)
  // =========================================================================
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = 65;
    const maxDistance = 140;

    let mouse = { x: -1000, y: -1000, radius: 160 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      const glow = document.getElementById('mouseGlow');
      if (glow) {
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
      }
    });

    window.addEventListener('click', (e) => {
      // Ripple shockwave on click
      particles.forEach(p => {
        const dx = p.x - e.clientX;
        const dy = p.y - e.clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 220 && dist > 0) {
          const force = (220 - dist) / 12;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      });
    });

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.radius = Math.random() * 2 + 1;
        this.baseRadius = this.radius;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Friction to recover from clicks
        this.vx *= 0.985;
        this.vy *= 0.985;

        // Maintain minimum velocity
        if (Math.abs(this.vx) < 0.2) this.vx += (Math.random() - 0.5) * 0.1;
        if (Math.abs(this.vy) < 0.2) this.vy += (Math.random() - 0.5) * 0.1;

        // Bounce from walls
        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;

        // Mouse interaction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.vx -= (dx / dist) * force * 0.5;
          this.vy -= (dy / dist) * force * 0.5;
        }
      }

      draw(accentRgb) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${accentRgb}, 0.6)`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function getAccentRgb() {
      const theme = document.documentElement.getAttribute('data-theme') || 'emerald';
      switch (theme) {
        case 'amber': return '245, 158, 11';
        case 'cyan': return '6, 182, 212';
        case 'violet': return '139, 92, 246';
        default: return '16, 185, 129';
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);
      const accentRgb = getAccentRgb();

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.22;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${accentRgb}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        p.update();
        p.draw(accentRgb);
      });

      requestAnimationFrame(animateParticles);
    }

    animateParticles();
  }

  // =========================================================================
  // 4. TEXT SCRAMBLE DECODER EFFECT
  // =========================================================================
  const glyphs = 'ABCDEF0123456789!<>-_\\/[]{}—=+*^?#';

  function scrambleText(element) {
    const final = element.getAttribute('data-text') || element.innerText;
    let iteration = 0;
    const interval = setInterval(() => {
      element.innerText = final
        .split('')
        .map((char, index) => {
          if (char === ' ' || char === '\n') return char;
          if (index < iteration) return final[index];
          return glyphs[Math.floor(Math.random() * glyphs.length)];
        })
        .join('');

      if (iteration >= final.length) {
        clearInterval(interval);
      }
      iteration += 1.2;
    }, 25);
  }

  const titleScramble = document.querySelector('.title-scramble');
  if (titleScramble) {
    scrambleText(titleScramble);
  }

  document.querySelectorAll('.scramble-link').forEach(link => {
    link.addEventListener('mouseenter', () => {
      SFX.hover();
    });
  });

  // =========================================================================
  // 5. LIVE TELEMETRY: MSK CLOCK & PING
  // =========================================================================
  function updateMskClock() {
    const clockEl = document.getElementById('live-msk-time');
    if (clockEl) {
      const now = new Date();
      const options = {
        timeZone: 'Europe/Moscow',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      clockEl.textContent = `${new Intl.DateTimeFormat('ru-RU', options).format(now)} MSK`;
    }
  }

  setInterval(updateMskClock, 1000);
  updateMskClock();

  // Subtle ping variance simulation
  const pingEl = document.getElementById('server-ping');
  setInterval(() => {
    if (pingEl) {
      const ping = Math.floor(22 + Math.random() * 8);
      pingEl.textContent = `${ping}ms`;
    }
  }, 4000);

  // =========================================================================
  // 6. 3D TILT EFFECT ON CARDS
  // =========================================================================
  const tiltCards = document.querySelectorAll('.card-tilt');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });

  // =========================================================================
  // 7. COUNTERS ANIMATION (INTERSECTION OBSERVER)
  // =========================================================================
  const counterElements = document.querySelectorAll('.counter');
  let countersAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersAnimated) {
        countersAnimated = true;
        counterElements.forEach(counter => {
          const target = parseFloat(counter.getAttribute('data-target'));
          const duration = 1600;
          const start = performance.now();

          function updateCount(time) {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            // EaseOutExpo
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = (ease * target).toFixed(target % 1 === 0 ? 0 : 1);
            counter.textContent = current;

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              counter.textContent = target;
            }
          }

          requestAnimationFrame(updateCount);
        });
      }
    });
  }, { threshold: 0.3 });

  const metricsSection = document.querySelector('.metrics-grid');
  if (metricsSection) {
    observer.observe(metricsSection);
  }

  // =========================================================================
  // 8. INTERACTIVE UEBA SIMULATOR & QUANTILE CALIBRATION ENGINE
  // =========================================================================
  const sliderEntropy = document.getElementById('slider-entropy');
  const sliderTime = document.getElementById('slider-time');
  const sliderSyscalls = document.getElementById('slider-syscalls');
  const toggleEscalation = document.getElementById('toggle-escalation');

  const valEntropy = document.getElementById('val-entropy');
  const valTime = document.getElementById('val-time');
  const valSyscalls = document.getElementById('val-syscalls');

  const gaugeFill = document.getElementById('gauge-fill');
  const scoreDisplay = document.getElementById('sim-score-display');
  const verdictCard = document.getElementById('sim-verdict-card');
  const verdictText = document.getElementById('verdict-text');
  const verdictDetail = document.getElementById('verdict-detail');
  const verdictDot = document.getElementById('verdict-dot');

  const telRawScore = document.getElementById('tel-raw-score');
  const telUserQ = document.getElementById('tel-user-q');
  const telRoleQ = document.getElementById('tel-role-q');
  const telStatus = document.getElementById('tel-engine-status');

  function calculateUEBA() {
    if (!sliderEntropy) return;

    const entropy = parseFloat(sliderEntropy.value);
    const time = parseFloat(sliderTime.value);
    const syscalls = parseFloat(sliderSyscalls.value);
    const isEscalation = toggleEscalation ? toggleEscalation.checked : false;

    valEntropy.textContent = entropy.toFixed(2);
    valTime.textContent = time.toFixed(2);
    valSyscalls.textContent = syscalls.toFixed(2);

    // Core formula: Multi-factor anomaly calculation
    let rawScore = (entropy * 0.35) + (time * 0.20) + (syscalls * 0.45);
    if (isEscalation) {
      rawScore += 0.42;
    }
    rawScore = Math.min(1.0, Math.max(0.02, rawScore));

    // Quantile calibration curve (Sigmoid mapping to calibrate tails)
    const calibrated = 1 / (1 + Math.exp(-9 * (rawScore - 0.45)));
    const finalScore = Math.min(0.99, Math.max(0.05, calibrated));

    // Update gauge SVG: stroke-dasharray is 251.2
    // 0 score => dashoffset 251.2; 1 score => dashoffset 0
    const totalLength = 251.2;
    const offset = totalLength - (finalScore * totalLength);
    if (gaugeFill) {
      gaugeFill.style.strokeDashoffset = offset.toFixed(1);
    }

    if (scoreDisplay) {
      scoreDisplay.textContent = finalScore.toFixed(2);
    }

    // Telemetry updates
    if (telRawScore) telRawScore.textContent = rawScore.toFixed(3);
    if (telUserQ) telUserQ.textContent = `${(finalScore * 98.4).toFixed(1)}%`;
    if (telRoleQ) telRoleQ.textContent = `${(Math.min(1, finalScore * 1.1) * 94.2).toFixed(1)}%`;

    // Verdict state
    if (finalScore < 0.35) {
      scoreDisplay.style.color = '#10b981';
      verdictDot.style.background = '#10b981';
      verdictDot.style.boxShadow = '0 0 10px #10b981';
      verdictText.textContent = 'ЛЕГИТИМНАЯ АКТИВНОСТЬ (NORMAL)';
      verdictText.style.color = '#10b981';
      verdictDetail.textContent = 'Сессия пользователя соответствует доверенному базовому профилю. Аномалии не зафиксированы.';
      telStatus.textContent = 'BASELINE VERIFIED';
      telStatus.className = 'tel-v highlight-green';
    } else if (finalScore < 0.70) {
      scoreDisplay.style.color = '#f59e0b';
      verdictDot.style.background = '#f59e0b';
      verdictDot.style.boxShadow = '0 0 10px #f59e0b';
      verdictText.textContent = 'ПОДОЗРИТЕЛЬНЫЙ ДРЕЙФ (SUSPICIOUS DRIFT)';
      verdictText.style.color = '#f59e0b';
      verdictDetail.textContent = 'Отклонение временных интервалов и системных команд. Включен режим динамической квантильной калибровки.';
      telStatus.textContent = 'CALIBRATION ACTIVE';
      telStatus.className = 'tel-v';
      telStatus.style.color = '#f59e0b';
    } else {
      scoreDisplay.style.color = '#ef4444';
      verdictDot.style.background = '#ef4444';
      verdictDot.style.boxShadow = '0 0 12px #ef4444';
      verdictText.textContent = 'КРИТИЧЕСКАЯ АНОМАЛИЯ (CRITICAL THREAT)';
      verdictText.style.color = '#ef4444';
      verdictDetail.textContent = 'Превышен 99-й ролевой квантиль! Признаки эскалации привилегий или компрометации учетной записи.';
      telStatus.textContent = 'ALERT TRIGGERED';
      telStatus.className = 'tel-v';
      telStatus.style.color = '#ef4444';
    }
  }

  [sliderEntropy, sliderTime, sliderSyscalls].forEach(slider => {
    if (slider) {
      slider.addEventListener('input', () => {
        calculateUEBA();
      });
    }
  });

  if (toggleEscalation) {
    toggleEscalation.addEventListener('change', () => {
      if (toggleEscalation.checked) {
        SFX.alert();
      } else {
        SFX.click();
      }
      calculateUEBA();
    });
  }

  // Presets
  const presets = {
    normal: { entropy: 0.18, time: 0.08, syscalls: 0.12, escalation: false },
    'dev-night': { entropy: 0.65, time: 0.88, syscalls: 0.35, escalation: false },
    apt: { entropy: 0.42, time: 0.25, syscalls: 0.78, escalation: false },
    brute: { entropy: 0.88, time: 0.92, syscalls: 0.95, escalation: true }
  };

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = presets[btn.getAttribute('data-preset')];
      if (p) {
        sliderEntropy.value = p.entropy;
        sliderTime.value = p.time;
        sliderSyscalls.value = p.syscalls;
        toggleEscalation.checked = p.escalation;
        calculateUEBA();
        if (p.escalation) {
          SFX.alert();
        }
      }
    });
  });

  calculateUEBA();

  // =========================================================================
  // 9. DEVELOPER HUD TERMINAL 2.0 (WITH MATRIX RAIN)
  // =========================================================================
  const termInput = document.getElementById('terminal-input');
  const termOutput = document.getElementById('terminal-output');
  const termBody = document.getElementById('terminal-body');
  const matrixCanvas = document.getElementById('matrix-canvas');
  const matrixBtn = document.getElementById('term-matrix-btn');
  const clearBtn = document.getElementById('term-clear-btn');

  let matrixRunning = false;
  let matrixInterval = null;

  function appendTermLine(text, className) {
    if (!termOutput) return;
    const div = document.createElement('div');
    div.className = `term-line ${className || ''}`;
    div.textContent = text;
    termOutput.appendChild(div);
    termBody.scrollTop = termBody.scrollHeight;
  }

  const termCommands = {
    help: () => {
      appendTermLine('Доступные команды:', 'success-text');
      appendTermLine('  projects     - Список открытых R&D репозиториев');
      appendTermLine('  patents      - Номера свидетельств государственной регистрации Роспатента');
      appendTermLine('  matrix       - Включить/выключить визуальный эффект Matrix Rain');
      appendTermLine('  neofetch     - Вывод телеметрии и спецификации сервера');
      appendTermLine('  skills       - Стек технологий и инженерные компетенции');
      appendTermLine('  whoami       - Краткая информация об авторе');
      appendTermLine('  theme <name> - Переключить тему (emerald, amber, cyan, violet)');
      appendTermLine('  clear        - Очистить вывод консоли');
    },

    projects: () => {
      appendTermLine('Флагманские R&D разработки:', 'success-text');
      appendTermLine('  1. ueba-seq-acgan          [PyTorch / LSTM / GAN]  https://github.com/NikolaCloud/ueba-seq-acgan');
      appendTermLine('  2. ueba-score-calibration  [Quantile / Bayes]      https://github.com/NikolaCloud/ueba-score-calibration');
      appendTermLine('  3. sentinel-siem           [Go / eBPF / Realtime]  https://github.com/NikolaCloud/sentinel-siem');
      appendTermLine('  4. omniparse-studio        [Python / AsyncIO]      https://github.com/NikolaCloud/omniparse-studio');
      appendTermLine('  5. datapulse-etl           [ClickHouse / Kafka]    https://github.com/NikolaCloud/datapulse-etl');
      appendTermLine('  6. net-recon-terminal      [Go / Network Audit]    https://github.com/NikolaCloud/net-recon-terminal');
      appendTermLine('  Всего репозиториев: 13. Смотрите раздел #projects на странице.');
    },

    patents: () => {
      appendTermLine('Официальная государственная регистрация (Роспатент):', 'success-text');
      appendTermLine('  №2026614488: Комплекс детекции аномалий поведения пользователей (UEBA Seq-ACGAN)');
      appendTermLine('  №2026614489: Модуль квантильной калибровки оценок аномальности');
    },

    neofetch: () => {
      appendTermLine('       _       OS: Ubuntu 24.04.4 LTS x86_64');
      appendTermLine('     /   \\     Host: ProTesla Cloud Sovereign Node');
      appendTermLine('    |  ⚡ |    Kernel: Linux 6.8.0-generic');
      appendTermLine('     \\ _ /     Uptime: Active 24/7');
      appendTermLine('               Web Engine: Nginx (Strict Hardening & CSP)');
      appendTermLine('               Firewall: UFW + Fail2ban (Active Jails: 3)');
      appendTermLine('               Primary Stack: PyTorch, Go, Python 3.11, Docker, ClickHouse');
    },

    skills: () => {
      appendTermLine('Инженерная матрица:', 'success-text');
      appendTermLine('  AI/ML:        PyTorch, WGAN-GP, Seq-ACGAN, Isolation Forest, Quantile Calibration');
      appendTermLine('  Languages:    Python, Golang, TypeScript, Bash, SQL');
      appendTermLine('  Data/Eng:     ClickHouse, Kafka, PostgreSQL, Redis Streams, DuckDB');
      appendTermLine('  Infra/Sec:    Docker, Nginx, eBPF, Fail2ban, UFW, gRPC, Linux Kernel');
    },

    whoami: () => {
      appendTermLine('NikolaCloud // Senior R&D Engineer & ML/Security Specialist.');
      appendTermLine('Автор запатентованных алгоритмов UEBA и архитектур отказоустойчивых распределенных платформ.');
    },

    clear: () => {
      if (termOutput) {
        termOutput.innerHTML = '';
      }
    },

    matrix: () => {
      toggleMatrixRain();
    }
  };

  function executeCommand(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return;

    SFX.terminal();
    appendTermLine(`nikola@protesla:~$ ${trimmed}`);

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const arg = parts[1];

    if (cmd === 'theme' && arg) {
      if (['emerald', 'amber', 'cyan', 'violet'].includes(arg)) {
        setTheme(arg);
        appendTermLine(`Цветовая тема успешно переключена на: ${arg}`, 'success-text');
      } else {
        appendTermLine('Неверное имя темы. Выберите: emerald, amber, cyan, violet', 'dim-text');
      }
    } else if (termCommands[cmd]) {
      termCommands[cmd]();
    } else {
      appendTermLine(`bash: ${cmd}: команда не найдена. Введите 'help' для списка.`, 'dim-text');
    }
  }

  if (termInput) {
    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = termInput.value;
        termInput.value = '';
        executeCommand(val);
      }
    });
  }

  // Quick buttons
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd');
      if (cmd) executeCommand(cmd);
    });
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      termCommands.clear();
      SFX.click();
    });
  }

  // Matrix Rain Canvas inside terminal
  function toggleMatrixRain() {
    if (!matrixCanvas) return;
    matrixRunning = !matrixRunning;

    if (matrixRunning) {
      matrixCanvas.classList.remove('hidden');
      matrixBtn.classList.add('active');
      appendTermLine('[SYSTEM] Режим Matrix Rain активирован.', 'success-text');
      SFX.matrix();

      const mCtx = matrixCanvas.getContext('2d');
      matrixCanvas.width = termBody.clientWidth;
      matrixCanvas.height = termBody.clientHeight;

      const chars = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈ';
      const fontSize = 14;
      const columns = Math.floor(matrixCanvas.width / fontSize);
      const drops = Array(columns).fill(1);

      matrixInterval = setInterval(() => {
        mCtx.fillStyle = 'rgba(6, 9, 14, 0.12)';
        mCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

        mCtx.fillStyle = '#00ff88';
        mCtx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          const text = chars[Math.floor(Math.random() * chars.length)];
          mCtx.fillText(text, i * fontSize, drops[i] * fontSize);

          if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      }, 40);
    } else {
      clearInterval(matrixInterval);
      matrixCanvas.classList.add('hidden');
      matrixBtn.classList.remove('active');
      appendTermLine('[SYSTEM] Режим Matrix Rain остановлен.', 'dim-text');
    }
  }

  if (matrixBtn) {
    matrixBtn.addEventListener('click', toggleMatrixRain);
  }

  // =========================================================================
  // 10. PROJECT FILTER (BENTO GRID)
  // =========================================================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const bentoCards = document.querySelectorAll('.bento-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      bentoCards.forEach(card => {
        const cat = card.getAttribute('data-cat');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.3s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // =========================================================================
  // 11. IMAGE MODAL ZOOM
  // =========================================================================
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  const modalCaption = document.getElementById('modal-caption');
  const modalClose = document.getElementById('modal-close-btn');

  document.querySelectorAll('.modal-zoomable').forEach(img => {
    img.addEventListener('click', () => {
      if (modal && modalImg) {
        modalImg.src = img.src;
        if (modalCaption) modalCaption.textContent = img.alt || '';
        modal.classList.remove('hidden');
        SFX.click();
      }
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  }

  // =========================================================================
  // 12. COMMAND PALETTE (CTRL+K / CMD+K)
  // =========================================================================
  const cmdPalette = document.getElementById('cmd-palette');
  const cmdInput = document.getElementById('cmd-palette-input');
  const cmdList = document.getElementById('cmd-palette-list');
  const cmdTrigger = document.getElementById('cmd-k-trigger');

  const paletteItems = [
    { title: 'UEBA Симулятор', type: 'РАЗДЕЛ', action: () => location.href = '#simulator' },
    { title: 'Флагманские R&D Проекты', type: 'РАЗДЕЛ', action: () => location.href = '#flagships' },
    { title: 'Интерактивный Терминал', type: 'РАЗДЕЛ', action: () => location.href = '#terminal-section' },
    { title: 'Каталог всех проектов', type: 'РАЗДЕЛ', action: () => location.href = '#projects' },
    { title: 'Патенты и свидетельства Роспатента', type: 'РАЗДЕЛ', action: () => location.href = '#patents' },
    { title: 'Контакты разработчика', type: 'РАЗДЕЛ', action: () => location.href = '#contact' },
    { title: 'UEBA Seq-ACGAN на GitHub', type: 'GITHUB', action: () => window.open('https://github.com/NikolaCloud/ueba-seq-acgan', '_blank') },
    { title: 'UEBA Score Calibration на GitHub', type: 'GITHUB', action: () => window.open('https://github.com/NikolaCloud/ueba-score-calibration', '_blank') },
    { title: 'Sentinel SIEM на GitHub', type: 'GITHUB', action: () => window.open('https://github.com/NikolaCloud/sentinel-siem', '_blank') },
    { title: 'Запустить Matrix Rain в консоли', type: 'ACTION', action: () => toggleMatrixRain() },
    { title: 'Тема: Cyber Emerald', type: 'THEME', action: () => setTheme('emerald') },
    { title: 'Тема: Tesla Amber', type: 'THEME', action: () => setTheme('amber') },
    { title: 'Тема: Cold Cyan', type: 'THEME', action: () => setTheme('cyan') },
    { title: 'Тема: Neural Violet', type: 'THEME', action: () => setTheme('violet') }
  ];

  function openPalette() {
    if (!cmdPalette) return;
    cmdPalette.classList.remove('hidden');
    cmdInput.value = '';
    renderPalette(paletteItems);
    setTimeout(() => cmdInput.focus(), 50);
    SFX.click();
  }

  function closePalette() {
    if (cmdPalette) cmdPalette.classList.add('hidden');
  }

  function renderPalette(items) {
    if (!cmdList) return;
    cmdList.innerHTML = '';
    items.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = `cmd-item ${index === 0 ? 'selected' : ''}`;
      div.innerHTML = `
        <span class="cmd-item-title">${item.title}</span>
        <span class="cmd-item-type">${item.type}</span>
      `;
      div.addEventListener('click', () => {
        closePalette();
        item.action();
      });
      cmdList.appendChild(div);
    });
  }

  if (cmdTrigger) cmdTrigger.addEventListener('click', openPalette);

  if (cmdInput) {
    cmdInput.addEventListener('input', () => {
      const val = cmdInput.value.toLowerCase();
      const filtered = paletteItems.filter(i => i.title.toLowerCase().includes(val) || i.type.toLowerCase().includes(val));
      renderPalette(filtered);
    });
  }

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (cmdPalette && !cmdPalette.classList.contains('hidden')) {
        closePalette();
      } else {
        openPalette();
      }
    }
    if (e.key === 'Escape') {
      closePalette();
      if (modal) modal.classList.add('hidden');
    }
  });

  if (cmdPalette) {
    cmdPalette.addEventListener('click', (e) => {
      if (e.target === cmdPalette) closePalette();
    });
  }

  // =========================================================================
  // 13. COPY EMAIL TO CLIPBOARD
  // =========================================================================
  const copyBtn = document.getElementById('copy-email-btn');
  const copyStatus = document.getElementById('copy-status');

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('dev@protesla.online').then(() => {
        if (copyStatus) copyStatus.textContent = '(скопировано!)';
        SFX.click();
        setTimeout(() => {
          if (copyStatus) copyStatus.textContent = '(копировать)';
        }, 2500);
      });
    });
  }

})();
