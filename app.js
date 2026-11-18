/**
 * PROTESLA LABS // INTERACTIVE ENGINE & CYBER HUD 2.0
 * Rock-solid stability. Zero jitter. Web Audio synthesizer.
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. WEB AUDIO API SYNTHESIZER (TACTILE HAPTIC SOUNDS)
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
        sfxToggleBtn.querySelector('.sfx-text').textContent = 'ЗВУК: ВКЛ';
        SFX.click();
      } else {
        sfxToggleBtn.classList.add('sfx-muted');
        sfxToggleBtn.querySelector('.sfx-text').textContent = 'ЗВУК: ВЫКЛ';
      }
    });
  }

  // Global sound click listener
  document.addEventListener('click', (e) => {
    if (e.target.closest('.sound-click') || e.target.closest('.btn') || e.target.closest('.quick-btn') || e.target.closest('.preset-btn') || e.target.closest('.arch-tab')) {
      SFX.click();
    }
  });

  // =========================================================================
  // 2. UNIFIED FLOATING TOOLTIP ENGINE
  // =========================================================================
  const tooltipEl = document.getElementById('floating-tooltip');

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (target && tooltipEl) {
      const text = target.getAttribute('data-tooltip');
      if (text) {
        tooltipEl.textContent = text;
        tooltipEl.classList.remove('hidden');
      }
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (tooltipEl && !tooltipEl.classList.contains('hidden')) {
      const offset = 14;
      let left = e.clientX + offset;
      let top = e.clientY + offset;

      // Viewport collision bounds
      if (left + 280 > window.innerWidth) {
        left = e.clientX - 290;
      }
      if (top + 60 > window.innerHeight) {
        top = e.clientY - 60;
      }

      tooltipEl.style.left = `${Math.max(10, left)}px`;
      tooltipEl.style.top = `${Math.max(10, top)}px`;
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (target && tooltipEl) {
      tooltipEl.classList.add('hidden');
    }
  });

  // =========================================================================
  // 3. THEME SWITCHER
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
  // 4. INTERACTIVE PARTICLE PHYSICS BACKGROUND (CANVAS 60 FPS)
  // =========================================================================
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = 60;
    const maxDistance = 140;

    let mouse = { x: -1000, y: -1000, radius: 150 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
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
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        this.vx *= 0.985;
        this.vy *= 0.985;

        if (Math.abs(this.vx) < 0.2) this.vx += (Math.random() - 0.5) * 0.1;
        if (Math.abs(this.vy) < 0.2) this.vy += (Math.random() - 0.5) * 0.1;

        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.vx -= (dx / dist) * force * 0.45;
          this.vy -= (dy / dist) * force * 0.45;
        }
      }

      draw(accentRgb) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${accentRgb}, 0.55)`;
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
  // 5. TEXT SCRAMBLE DECODER EFFECT
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

  // =========================================================================
  // 6. LIVE TELEMETRY: MSK CLOCK
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

    let rawScore = (entropy * 0.35) + (time * 0.20) + (syscalls * 0.45);
    if (isEscalation) {
      rawScore += 0.42;
    }
    rawScore = Math.min(1.0, Math.max(0.02, rawScore));

    const calibrated = 1 / (1 + Math.exp(-9 * (rawScore - 0.45)));
    const finalScore = Math.min(0.99, Math.max(0.05, calibrated));

    const totalLength = 251.2;
    const offset = totalLength - (finalScore * totalLength);
    if (gaugeFill) {
      gaugeFill.style.strokeDashoffset = offset.toFixed(1);
    }

    if (scoreDisplay) {
      scoreDisplay.textContent = finalScore.toFixed(2);
    }

    if (telRawScore) telRawScore.textContent = rawScore.toFixed(3);
    if (telUserQ) telUserQ.textContent = `${(finalScore * 98.4).toFixed(1)}%`;
    if (telRoleQ) telRoleQ.textContent = `${(Math.min(1, finalScore * 1.1) * 94.2).toFixed(1)}%`;

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
      slider.addEventListener('input', calculateUEBA);
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
  // 9. ARCHITECTURE EXPLORER TABS & CODE COPY
  // =========================================================================
  const archDescriptions = {
    generator: '<strong>LSTM Генератор (G):</strong> Принимает латентный вектор z ∈ ℝ¹²⁸ и вектор роли c ∈ ℝᵏ. Воссоздает последовательности длины T=50 с сохранением временных зависимостей через Residual LSTM ячейки.',
    discriminator: '<strong>WGAN-GP Дискриминатор (D):</strong> Оценивает степень правдоподобия с использованием штрафа за градиент (Wasserstein Gradient Penalty) и спектральной нормализации весов, предотвращая схлопывание мод (mode collapse).',
    classifier: '<strong>Вспомогательный классификатор (Auxiliary C):</strong> Решает задачу мультиклассовой классификации ролевых категорий, направляя генератор синтезировать строго ролевые профили активности.'
  };

  document.querySelectorAll('.arch-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.arch-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const key = tab.getAttribute('data-arch');
      const box = document.getElementById('arch-detail-box');
      if (box && archDescriptions[key]) {
        box.innerHTML = archDescriptions[key];
      }
    });
  });

  const copyCodeBtn = document.getElementById('copy-code-btn');
  if (copyCodeBtn) {
    copyCodeBtn.addEventListener('click', () => {
      const code = `def calibrate_anomaly_score(s_raw, user_quantiles, role_quantiles, n_user, n_thresh=30):\n    p_u = np.searchsorted(user_quantiles, s_raw) / len(user_quantiles)\n    p_r = np.searchsorted(role_quantiles, s_raw) / len(role_quantiles)\n    alpha = min(1.0, float(n_user) / n_thresh)\n    return alpha * p_u + (1.0 - alpha) * p_r`;
      navigator.clipboard.writeText(code).then(() => {
        copyCodeBtn.textContent = 'Скопировано!';
        SFX.click();
        setTimeout(() => {
          copyCodeBtn.textContent = 'Копировать код';
        }, 2200);
      });
    });
  }

  // =========================================================================
  // 10. DEVELOPER HUD TERMINAL 2.0 (STABLE WINDOW & MATRIX RAIN)
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
      appendTermLine('     /   \\     Host: ProTesla Sovereign Node');
      appendTermLine('    |  🛡️ |    Kernel: Linux 6.8.0-generic');
      appendTermLine('     \\ _ /     Web Engine: Nginx (SSL Let\'s Encrypt ECDSA & HTTP/2)');
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
  // 11. SKILLS MATRIX FILTER
  // =========================================================================
  const skillTabs = document.querySelectorAll('.skill-tab');
  const skillCards = document.querySelectorAll('.skill-pill-card');

  skillTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      skillTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const cat = tab.getAttribute('data-skill-cat');
      skillCards.forEach(card => {
        const itemCat = card.getAttribute('data-cat');
        if (cat === 'all' || itemCat === cat) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // =========================================================================
  // 12. PROJECT FILTER (BENTO GRID)
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
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // =========================================================================
  // 13. IMAGE MODAL ZOOM
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
  // 14. COMMAND PALETTE (CTRL+K / CMD+K)
  // =========================================================================
  const cmdPalette = document.getElementById('cmd-palette');
  const cmdInput = document.getElementById('cmd-palette-input');
  const cmdList = document.getElementById('cmd-palette-list');
  const cmdTrigger = document.getElementById('cmd-k-trigger');

  const paletteItems = [
    { title: 'UEBA Симулятор', type: 'РАЗДЕЛ', action: () => location.href = '#simulator' },
    { title: 'SOC Схватка (Атака vs Детектор)', type: 'РАЗДЕЛ', action: () => location.href = '#soc-battle' },
    { title: 'Топологический граф нейросети', type: 'РАЗДЕЛ', action: () => location.href = '#neural-graph' },
    { title: 'Флагманские R&D Проекты', type: 'РАЗДЕЛ', action: () => location.href = '#flagships' },
    { title: 'Интерактивный Терминал', type: 'РАЗДЕЛ', action: () => location.href = '#terminal-section' },
    { title: 'Матрица компетенций', type: 'РАЗДЕЛ', action: () => location.href = '#skills-matrix' },
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
  // 16. SOC BATTLE STATION ENGINE (MULTI-STAGE RADAR & CYBER RANGE 3.0)
  // =========================================================================
  function initSOCBattle() {
    const attackPills = document.querySelectorAll('.attack-pill');
    const runBtn = document.getElementById('btn-run-attack');
    const stepBtn = document.getElementById('btn-step-attack');
    const resetBtn = document.getElementById('btn-reset-attack');
    const statusBadge = document.getElementById('soc-defense-status');
    const liveLed = document.querySelector('.soc-live-led');
    const logConsole = document.getElementById('soc-log-stream');

    const reactionEl = document.getElementById('soc-reaction-time');
    const driftEl = document.getElementById('soc-drift-score');
    const calibEl = document.getElementById('soc-calibrated-q');
    const verdictEl = document.getElementById('soc-action-verdict');

    const payloadProto = document.getElementById('payload-proto');
    const payloadCode = document.getElementById('payload-code');
    const activeMitre = document.getElementById('soc-active-mitre');
    const pipelineSteps = document.querySelectorAll('.pipeline-step');
    const radarCanvas = document.getElementById('soc-radar-canvas');

    const threatTag = document.getElementById('radar-threat-level');
    const packetRateEl = document.getElementById('radar-packet-rate');
    const shieldStatusEl = document.getElementById('radar-shield-status');

    if (!runBtn || !logConsole) return;

    // --- A. RADAR CANVAS 60 FPS RENDERER ---
    let radarCtx = radarCanvas ? radarCanvas.getContext('2d') : null;
    let attackState = 'idle'; // 'idle', 'attacking', 'intercepted', 'quarantined'
    let attackPackets = [];
    let sparkParticles = [];
    let shockwaves = [];
    let radarSweepAngle = 0;
    let shieldPulseAngle = 0;

    const rWidth = 460;
    const rHeight = 230;
    if (radarCanvas) {
      radarCanvas.width = rWidth;
      radarCanvas.height = rHeight;
    }

    function renderRadar() {
      if (!radarCtx) return;
      radarCtx.clearRect(0, 0, rWidth, rHeight);

      // 1. Radar Background Cybergrid
      radarCtx.fillStyle = '#020408';
      radarCtx.fillRect(0, 0, rWidth, rHeight);

      // Radar Concentric Range Rings
      const centerX = rWidth / 2;
      const centerY = rHeight / 2;
      radarCtx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
      radarCtx.lineWidth = 1;

      [40, 80, 130, 180].forEach(rad => {
        radarCtx.beginPath();
        radarCtx.arc(centerX, centerY, rad, 0, Math.PI * 2);
        radarCtx.stroke();
      });

      // Axis Crosshairs
      radarCtx.beginPath();
      radarCtx.moveTo(0, centerY);
      radarCtx.lineTo(rWidth, centerY);
      radarCtx.moveTo(centerX, 0);
      radarCtx.lineTo(centerX, rHeight);
      radarCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      radarCtx.stroke();

      // Sweeping Radar Line
      radarSweepAngle += 0.025;
      const sweepX = centerX + Math.cos(radarSweepAngle) * 190;
      const sweepY = centerY + Math.sin(radarSweepAngle) * 190;
      radarCtx.beginPath();
      radarCtx.moveTo(centerX, centerY);
      radarCtx.lineTo(sweepX, sweepY);
      radarCtx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
      radarCtx.lineWidth = 1.5;
      radarCtx.stroke();

      // Nodes Coordinates
      const attackerX = 65, attackerY = centerY;
      const shieldX = centerX, shieldY = centerY;
      const targetX = rWidth - 65, targetY = centerY;

      // 2. Attacker Node
      radarCtx.beginPath();
      radarCtx.arc(attackerX, attackerY, 14, 0, Math.PI * 2);
      radarCtx.fillStyle = attackState === 'quarantined' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(239, 68, 68, 0.25)';
      radarCtx.strokeStyle = attackState === 'quarantined' ? '#38bdf8' : '#ef4444';
      radarCtx.lineWidth = 2;
      radarCtx.stroke();
      radarCtx.fill();

      // Attacker Pulsing Ring
      if (attackState === 'attacking') {
        const pulse = (Date.now() % 1000) / 1000;
        radarCtx.beginPath();
        radarCtx.arc(attackerX, attackerY, 14 + pulse * 16, 0, Math.PI * 2);
        radarCtx.strokeStyle = `rgba(239, 68, 68, ${1 - pulse})`;
        radarCtx.lineWidth = 1.5;
        radarCtx.stroke();
      }

      radarCtx.font = '9px "SF Mono", monospace';
      radarCtx.fillStyle = attackState === 'quarantined' ? '#38bdf8' : '#f87171';
      radarCtx.textAlign = 'center';
      radarCtx.fillText(attackState === 'quarantined' ? '[QUARANTINE]' : 'HOSTILE: 185.220', attackerX, attackerY + 26);

      // 3. Target Node (Core)
      radarCtx.beginPath();
      radarCtx.arc(targetX, targetY, 14, 0, Math.PI * 2);
      radarCtx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      radarCtx.strokeStyle = '#10b981';
      radarCtx.lineWidth = 2;
      radarCtx.stroke();
      radarCtx.fill();

      radarCtx.fillStyle = '#6ee7b7';
      radarCtx.fillText('DC01.CORE', targetX, targetY + 26);

      // 4. Central Adaptive Shield (Seq-ACGAN force field)
      shieldPulseAngle += 0.04;
      const shieldRadius = 32 + Math.sin(shieldPulseAngle) * 3;

      // Forcefield Arc
      radarCtx.beginPath();
      radarCtx.arc(shieldX, shieldY, shieldRadius, -Math.PI * 0.45, Math.PI * 0.45);
      if (attackState === 'intercepted' || attackState === 'quarantined') {
        radarCtx.strokeStyle = '#34d399';
        radarCtx.lineWidth = 3.5;
        radarCtx.shadowColor = '#10b981';
        radarCtx.shadowBlur = 15;
      } else if (attackState === 'attacking') {
        radarCtx.strokeStyle = '#f59e0b';
        radarCtx.lineWidth = 3;
        radarCtx.shadowColor = '#f59e0b';
        radarCtx.shadowBlur = 12;
      } else {
        radarCtx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        radarCtx.lineWidth = 2;
        radarCtx.shadowBlur = 0;
      }
      radarCtx.stroke();
      radarCtx.shadowBlur = 0;

      // Shield Core Marker
      radarCtx.beginPath();
      radarCtx.arc(shieldX, shieldY, 4, 0, Math.PI * 2);
      radarCtx.fillStyle = '#38bdf8';
      radarCtx.fill();

      // 5. In-flight Attack Packets
      for (let i = attackPackets.length - 1; i >= 0; i--) {
        const p = attackPackets[i];
        p.x += p.vx;
        p.y += (p.targetY - p.y) * 0.02;

        // Collision with shield boundary
        if (p.x >= shieldX - 16) {
          // Burst sparks
          for (let s = 0; s < 7; s++) {
            sparkParticles.push({
              x: shieldX - 10,
              y: p.y,
              vx: -(Math.random() * 4 + 1),
              vy: (Math.random() - 0.5) * 5,
              life: 1
            });
          }
          // Spawn Shockwave
          shockwaves.push({ x: shieldX - 10, y: p.y, r: 4, life: 1 });
          attackPackets.splice(i, 1);
          continue;
        }

        // Draw projectile with tail
        radarCtx.beginPath();
        radarCtx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        radarCtx.fillStyle = '#ef4444';
        radarCtx.shadowColor = '#ef4444';
        radarCtx.shadowBlur = 8;
        radarCtx.fill();
        radarCtx.shadowBlur = 0;

        radarCtx.beginPath();
        radarCtx.moveTo(p.x, p.y);
        radarCtx.lineTo(p.x - 14, p.y);
        radarCtx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
        radarCtx.lineWidth = 1.5;
        radarCtx.stroke();
      }

      // 6. Shockwave Rings
      for (let w = shockwaves.length - 1; w >= 0; w--) {
        const sw = shockwaves[w];
        sw.r += 1.8;
        sw.life -= 0.05;
        if (sw.life <= 0) {
          shockwaves.splice(w, 1);
          continue;
        }
        radarCtx.beginPath();
        radarCtx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
        radarCtx.strokeStyle = `rgba(52, 211, 153, ${sw.life * 0.6})`;
        radarCtx.lineWidth = 1.5;
        radarCtx.stroke();
      }

      // 7. Sparks
      for (let s = sparkParticles.length - 1; s >= 0; s--) {
        const sp = sparkParticles[s];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.life -= 0.04;
        if (sp.life <= 0) {
          sparkParticles.splice(s, 1);
          continue;
        }
        radarCtx.beginPath();
        radarCtx.arc(sp.x, sp.y, 1.5, 0, Math.PI * 2);
        radarCtx.fillStyle = `rgba(52, 211, 153, ${sp.life})`;
        radarCtx.fill();
      }

      // 8. Laser Containment Cage on Quarantine
      if (attackState === 'quarantined') {
        radarCtx.strokeStyle = '#38bdf8';
        radarCtx.lineWidth = 1.2;
        radarCtx.strokeRect(attackerX - 25, attackerY - 22, 50, 44);

        // Corner Crosshair Brackets
        const cS = 5;
        radarCtx.strokeStyle = '#34d399';
        radarCtx.lineWidth = 2;
        // Top Left
        radarCtx.beginPath();
        radarCtx.moveTo(attackerX - 25, attackerY - 22 + cS);
        radarCtx.lineTo(attackerX - 25, attackerY - 22);
        radarCtx.lineTo(attackerX - 25 + cS, attackerY - 22);
        radarCtx.stroke();
        // Top Right
        radarCtx.beginPath();
        radarCtx.moveTo(attackerX + 25 - cS, attackerY - 22);
        radarCtx.lineTo(attackerX + 25, attackerY - 22);
        radarCtx.lineTo(attackerX + 25, attackerY - 22 + cS);
        radarCtx.stroke();

        // Laser link to shield
        radarCtx.beginPath();
        radarCtx.moveTo(attackerX + 25, attackerY);
        radarCtx.lineTo(shieldX - 15, shieldY);
        radarCtx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        radarCtx.setLineDash([3, 3]);
        radarCtx.stroke();
        radarCtx.setLineDash([]);
      }

      requestAnimationFrame(renderRadar);
    }
    renderRadar();

    // --- B. 6 EXPANDED REALISTIC ATTACK SCENARIOS ---
    const scenarios = {
      'pass-the-hash': {
        name: 'Pass-the-Hash & Lateral Movement',
        mitre: 'MITRE T1550.002',
        proto: 'SMB2 / RPC (Port 445)',
        payload: 'SMB2_TREE_CONNECT: \\\\DC01.corp\\IPC$ | NTLMSSP_AUTH: buh_lead [NTLM: 3291f0a8d7e41b90c1]',
        steps: [
          { stepIdx: 1, text: '[01. ВНЕДРЕНИЕ] NTLM-хэш "buh_lead" перехвачен в ОЗУ. Попытка скрытой аутентификации к \\\\DC01\\IPC$.', cls: 'crit-log', status: 'Внедрение хэша' },
          { stepIdx: 2, text: '[02. eBPF СТЕК] Драйвер перехватил sys_connect(10.0.0.1:445) из подсети бухгалтерии в ядро сети.', cls: 'seq-log', status: 'eBPF перехват 445' },
          { stepIdx: 3, text: '[03. SEQ-ACGAN] Дрейф пространства эмбеддингов W = +4.82σ. Роль "Бухгалтер" не имеет прав на RPC DC01.', cls: 'calib-log', status: 'Дрейф роли +4.82σ' },
          { stepIdx: 4, text: '[04. КВАНТИЛИ EVT] Хвостовой квантиль риска: p_calibrated = 0.984 (> критического порога τ 0.95).', cls: 'crit-log', status: 'Риск: 98.4%' },
          { stepIdx: 5, text: '[05. ИЗОЛЯЦИЯ] LATERAL_MOVEMENT_DROP. Сокет заблокирован в ядре через TC-eBPF, хост помещен в карантин.', cls: 'defense-log', status: 'ХОСТ ИЗОЛИРОВАН' }
        ],
        metrics: { time: '18 мс', drift: '+4.82σ', calib: '98.4%', action: 'BPF_SOCKET_DROP' }
      },

      'dirty-pipe': {
        name: 'Dirty Pipe Kernel PrivEsc (CVE-2022-0847)',
        mitre: 'MITRE T1068',
        proto: 'Linux Ring-0 Syscall',
        payload: 'splice(fd_in, NULL, pipefd[1], NULL, 1, SPLICE_F_GIFT) -> Overwrite /etc/passwd [root::0:0]',
        steps: [
          { stepIdx: 1, text: '[01. ВНЕДРЕНИЕ] Локальный непривилегированный процесс (UID 1004) выполняет эксплойт Dirty Pipe в page cache.', cls: 'crit-log', status: 'Ring-0 эксплойт' },
          { stepIdx: 2, text: '[02. eBPF СТЕК] kprobe перехватывает вызов splice() с флагом SPLICE_F_GIFT на read-only файл /etc/passwd.', cls: 'seq-log', status: 'kprobe splice()' },
          { stepIdx: 3, text: '[03. SEQ-ACGAN] Модель выявляет аномальную последовательность сисколов: S_seq = 0.994 (+6.14σ к норме).', cls: 'calib-log', status: 'Аномалия +6.14σ' },
          { stepIdx: 4, text: '[04. КВАНТИЛИ EVT] Экстремальный квантиль: p_calibrated = 0.999 (Критическая угроза захвата прав суперпользователя).', cls: 'crit-log', status: 'Риск: 99.9% (Root)' },
          { stepIdx: 5, text: '[05. ИЗОЛЯЦИЯ] KERNEL_EXPLOIT_ABORT. Процесс мгновенно уничтожен через SIGKILL, page cache защищен.', cls: 'defense-log', status: 'SIGKILL ВЫПОЛНЕН' }
        ],
        metrics: { time: '11 мс', drift: '+6.14σ', calib: '99.9%', action: 'SIGKILL_PID_FREEZE' }
      },

      'ransomware-burst': {
        name: 'Ransomware High-IOPS Crypto Burst',
        mitre: 'MITRE T1486',
        proto: 'VFS / Storage IOPS',
        payload: 'AES-256-GCM loop: 12,400 files/sec | rename(*.locked) -> unlink(ShadowCopy.vss)',
        steps: [
          { stepIdx: 1, text: '[01. ВНЕДРЕНИЕ] Запущен многопоточный шифровальщик: 12 400 операций rename/write в секунду.', cls: 'crit-log', status: 'Массовое шифрование' },
          { stepIdx: 2, text: '[02. eBPF СТЕК] eBPF VFS-проба фиксирует взрывной рост энтропии дисковых блоков H > 7.98 bit/byte.', cls: 'seq-log', status: 'Энтропия VFS H=7.98' },
          { stepIdx: 3, text: '[03. SEQ-ACGAN] Генеративный детектор выявляет нечеловеческую частоту I/O: отклонение +5.40σ от профиля.', cls: 'calib-log', status: 'Дрейф I/O +5.40σ' },
          { stepIdx: 4, text: '[04. КВАНТИЛИ EVT] Экстремальный квантиль атаки: p_calibrated = 0.992 (Массовая деструкция данных).', cls: 'crit-log', status: 'Риск: 99.2%' },
          { stepIdx: 5, text: '[05. ИЗОЛЯЦИЯ] RANSOMWARE_DEFENSE. Cgroup v2 freeze: процесс заморожен, теневые копии сохранены.', cls: 'defense-log', status: 'CGROUP ЗАМОРОЖЕН' }
        ],
        metrics: { time: '15 мс', drift: '+5.40σ', calib: '99.2%', action: 'CGROUP_IO_FREEZE' }
      },

      'dns-exfil': {
        name: 'Stealth DNS Tunneling Exfiltration',
        mitre: 'MITRE T1071.004',
        proto: 'DNS (UDP 53)',
        payload: 'QUERY: dXNlcl9kYmFfZHVtcA==.chunk-44.c2-exfil.net IN A (Base64 SQL Dump fragment)',
        steps: [
          { stepIdx: 1, text: '[01. ВНЕДРЕНИЕ] Скрытная выгрузка: серия DNS-запросов с фрагментами базы пользователей в Base64.', cls: 'crit-log', status: 'Скрытный канал DNS' },
          { stepIdx: 2, text: '[02. eBPF СТЕК] eBPF перехватывает нестандартный сокет UDP 53 в обход локального DNS-резолвера.', cls: 'seq-log', status: 'UDP 53 перехвачен' },
          { stepIdx: 3, text: '[03. SEQ-ACGAN] Энтропия Шеннона доменных меток H = 4.95 (норма < 2.8). Дрейф вектора +4.95σ.', cls: 'calib-log', status: 'Энтропия H=4.95' },
          { stepIdx: 4, text: '[04. КВАНТИЛИ EVT] Вероятность скрытого туннелирования данных: p_calibrated = 0.989 (> τ 0.95).', cls: 'crit-log', status: 'Риск: 98.9%' },
          { stepIdx: 5, text: '[05. ИЗОЛЯЦИЯ] DNS_SINKHOLE_ACTIVE. DNS-ответ спуфлен на 0.0.0.0, процесс добавлен в черный список.', cls: 'defense-log', status: 'SINKHOLE АКТИВЕН' }
        ],
        metrics: { time: '19 мс', drift: '+4.95σ', calib: '98.9%', action: 'DNS_SINKHOLE_DROP' }
      },

      'adversarial-ai': {
        name: 'Adversarial AI Model Evasion Attack',
        mitre: 'MITRE T1565.002',
        proto: 'Seq-ACGAN Latent Space',
        payload: 'FGSM Gradient Perturbation: eps=0.045 | Synthetic jitter added to mimic normal Sysadmin keystrokes',
        steps: [
          { stepIdx: 1, text: '[01. ВНЕДРЕНИЕ] Атака на нейросеть: подмешивание градиентного шума FGSM для сокрытия команд в логах.', cls: 'crit-log', status: 'Градиентный шум FGSM' },
          { stepIdx: 2, text: '[02. eBPF СТЕК] Зафиксированы искусственные микропаузы Δt с распределением Гаусса (попытка обмана LSTM).', cls: 'seq-log', status: 'Аномальный Δt джиттер' },
          { stepIdx: 3, text: '[03. SEQ-ACGAN] WGAN-GP Дискриминатор с градиентным штрафом распознает состязательную выборку (+3.85σ).', cls: 'calib-log', status: 'Состязательный дрейф +3.85σ' },
          { stepIdx: 4, text: '[04. КВАНТИЛИ EVT] Двухуровневый квантильный фильтр калибрует риск: p_calibrated = 0.967.', cls: 'crit-log', status: 'Риск: 96.7%' },
          { stepIdx: 5, text: '[05. ИЗОЛЯЦИЯ] ADVERSARIAL_TRIPWIRE. Активирован защитный конформный ансамбль, атака нейтрализована.', cls: 'defense-log', status: 'АНСАМБЛЬ ЗАЩИЩЕН' }
        ],
        metrics: { time: '24 мс', drift: '+3.85σ', calib: '96.7%', action: 'CLIP_GRADIENTS_ALERT' }
      },

      'cloud-ssrf': {
        name: 'Cloud IAM IMDSv2 Token Exfil (SSRF)',
        mitre: 'MITRE T1552.005',
        proto: 'HTTP / IMDSv2 (169.254.169.254)',
        payload: 'PUT /latest/api/token -> GET /latest/meta-data/iam/security-credentials/k8s-prod-role',
        steps: [
          { stepIdx: 1, text: '[01. ВНЕДРЕНИЕ] Эксплуатация SSRF в микросервисе: попытка кражи временного IAM-токена кластера K8s.', cls: 'crit-log', status: 'SSRF зондирование' },
          { stepIdx: 2, text: '[02. eBPF СТЕК] eBPF сетевой фильтр перехватывает TCP-пакет на локальный адрес метаданных 169.254.169.254.', cls: 'seq-log', status: 'IMDSv2 зонд перехвачен' },
          { stepIdx: 3, text: '[03. SEQ-ACGAN] Профиль пода не имеет права на обращение к сервису метаданных: аномалия +5.20σ.', cls: 'calib-log', status: 'Дрейф профиля +5.20σ' },
          { stepIdx: 4, text: '[04. КВАНТИЛИ EVT] Квантильный риск утечки облачных привилегий: p_calibrated = 0.996.', cls: 'crit-log', status: 'Риск: 99.6%' },
          { stepIdx: 5, text: '[05. ИЗОЛЯЦИЯ] IMDS_ACCESS_BLOCKED. TCP RST немедленно отправлен в ядре, токен AWS/K8s защищен.', cls: 'defense-log', status: 'TCP RST ОТПРАВЛЕН' }
        ],
        metrics: { time: '9 мс', drift: '+5.20σ', calib: '99.6%', action: 'TCP_RST_TOKEN_SAFE' }
      }
    };

    function updateScenarioView(key) {
      const s = scenarios[key];
      if (!s) return;
      if (payloadProto) payloadProto.textContent = s.proto;
      if (payloadCode) payloadCode.textContent = s.payload;
      if (activeMitre) activeMitre.textContent = s.mitre;
    }

    attackPills.forEach(pill => {
      pill.addEventListener('click', () => {
        attackPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const key = pill.getAttribute('data-scenario') || 'pass-the-hash';
        updateScenarioView(key);
        SFX.click();
      });
    });

    // Default Scenario
    updateScenarioView('pass-the-hash');

    let battleRunning = false;
    let stepCurrentIndex = 0;

    function resetPipelineUI() {
      pipelineSteps.forEach(s => {
        s.className = 'pipeline-step';
        const st = s.querySelector('.step-status');
        if (st) st.textContent = 'Ожидание';
      });
    }

    function setPipelineStepState(stepNum, state, statusText) {
      pipelineSteps.forEach(s => {
        const num = parseInt(s.getAttribute('data-step'));
        if (num < stepNum) {
          s.className = 'pipeline-step complete';
        } else if (num === stepNum) {
          s.className = `pipeline-step ${state}`;
          const st = s.querySelector('.step-status');
          if (st && statusText) st.textContent = statusText;
        } else {
          s.className = 'pipeline-step';
        }
      });
    }

    function launchPackets() {
      for (let i = 0; i < 9; i++) {
        setTimeout(() => {
          attackPackets.push({
            x: 75,
            y: (rHeight / 2) + (Math.random() - 0.5) * 16,
            targetY: (rHeight / 2) + (Math.random() - 0.5) * 24,
            vx: 5.5 + Math.random() * 2
          });
        }, i * 90);
      }
    }

    // --- AUTO BATTLE ---
    runBtn.addEventListener('click', () => {
      if (battleRunning) return;
      battleRunning = true;
      runBtn.disabled = true;
      if (stepBtn) stepBtn.disabled = true;

      const activePill = document.querySelector('.attack-pill.active');
      const key = activePill ? activePill.getAttribute('data-scenario') : 'pass-the-hash';
      const scenario = scenarios[key];

      SFX.click();
      logConsole.innerHTML = '';
      resetPipelineUI();

      attackState = 'attacking';
      launchPackets();

      statusBadge.textContent = 'АТАКА ЗАФИКСИРОВАНА';
      statusBadge.className = 'soc-defense-badge threat';
      if (liveLed) liveLed.className = 'soc-live-led alert';
      if (threatTag) threatTag.textContent = 'УГРОЗА: КРИТИЧЕСКАЯ';
      if (packetRateEl) packetRateEl.textContent = '140 pkt/s';
      if (shieldStatusEl) shieldStatusEl.textContent = 'DEFLECTION (100%)';

      reactionEl.textContent = 'вычисление...';
      driftEl.textContent = 'расчет...';
      calibEl.textContent = 'калибровка...';
      verdictEl.textContent = 'PROCESSING';
      verdictEl.className = 'soc-m-v highlight-green';

      scenario.steps.forEach((step, idx) => {
        const delay = (idx + 1) * 520;
        setTimeout(() => {
          // Add Log Line
          const div = document.createElement('div');
          div.className = `soc-log-line ${step.cls}`;
          div.textContent = step.text;
          logConsole.appendChild(div);
          logConsole.scrollTop = logConsole.scrollHeight;

          // Pipeline
          setPipelineStepState(step.stepIdx, idx === scenario.steps.length - 1 ? 'complete' : 'active', step.status);

          // Audio & Visual transitions
          if (idx === 0) {
            SFX.alert();
          }
          if (idx === 2) {
            SFX.terminal();
            attackState = 'intercepted';
            statusBadge.textContent = 'SEQ-ACGAN АНАЛИЗ';
            statusBadge.className = 'soc-defense-badge analyzing';
          }
          if (idx === scenario.steps.length - 1) {
            // Final Containment
            attackState = 'quarantined';
            SFX.alert();

            statusBadge.textContent = 'УГРОЗА ИЗОЛИРОВАНА';
            statusBadge.className = 'soc-defense-badge';
            statusBadge.style.borderColor = '#10b981';
            statusBadge.style.color = '#10b981';
            if (liveLed) liveLed.className = 'soc-live-led';
            if (threatTag) threatTag.textContent = 'УГРОЗА: НЕЙТРАЛИЗОВАНА';
            if (packetRateEl) packetRateEl.textContent = '0 pkt/s';
            if (shieldStatusEl) shieldStatusEl.textContent = 'SECURE (0 BREACH)';

            reactionEl.textContent = scenario.metrics.time;
            driftEl.textContent = scenario.metrics.drift;
            calibEl.textContent = scenario.metrics.calib;
            verdictEl.textContent = scenario.metrics.action;
            verdictEl.className = 'soc-m-v highlight-green';

            battleRunning = false;
            runBtn.disabled = false;
            if (stepBtn) stepBtn.disabled = false;
          }
        }, delay);
      });
    });

    // --- STEP-BY-STEP MODE ---
    if (stepBtn) {
      stepBtn.addEventListener('click', () => {
        if (battleRunning) return;

        const activePill = document.querySelector('.attack-pill.active');
        const key = activePill ? activePill.getAttribute('data-scenario') : 'pass-the-hash';
        const scenario = scenarios[key];

        if (stepCurrentIndex === 0) {
          logConsole.innerHTML = '';
          resetPipelineUI();
          attackState = 'attacking';
          launchPackets();
          statusBadge.textContent = 'ПОШАГОВЫЙ ТАКТ...';
          statusBadge.className = 'soc-defense-badge analyzing';
          if (liveLed) liveLed.className = 'soc-live-led alert';
          if (threatTag) threatTag.textContent = 'УГРОЗА: ТАКТ 1';
          if (packetRateEl) packetRateEl.textContent = '140 pkt/s';
        }

        if (stepCurrentIndex < scenario.steps.length) {
          const step = scenario.steps[stepCurrentIndex];
          const div = document.createElement('div');
          div.className = `soc-log-line ${step.cls}`;
          div.textContent = step.text;
          logConsole.appendChild(div);
          logConsole.scrollTop = logConsole.scrollHeight;

          setPipelineStepState(step.stepIdx, stepCurrentIndex === scenario.steps.length - 1 ? 'complete' : 'active', step.status);
          SFX.terminal();

          if (stepCurrentIndex === 2) {
            attackState = 'intercepted';
          }

          if (stepCurrentIndex === scenario.steps.length - 1) {
            attackState = 'quarantined';
            SFX.alert();
            statusBadge.textContent = 'УГРОЗА ИЗОЛИРОВАНА';
            statusBadge.className = 'soc-defense-badge';
            statusBadge.style.borderColor = '#10b981';
            statusBadge.style.color = '#10b981';
            if (liveLed) liveLed.className = 'soc-live-led';
            if (threatTag) threatTag.textContent = 'УГРОЗА: НЕЙТРАЛИЗОВАНА';
            if (packetRateEl) packetRateEl.textContent = '0 pkt/s';

            reactionEl.textContent = scenario.metrics.time;
            driftEl.textContent = scenario.metrics.drift;
            calibEl.textContent = scenario.metrics.calib;
            verdictEl.textContent = scenario.metrics.action;

            stepBtn.innerHTML = '<span>↺ Заново</span>';
            stepCurrentIndex++;
            return;
          }

          stepCurrentIndex++;
          stepBtn.innerHTML = `<span>Такт ${stepCurrentIndex + 1}/5 →</span>`;
        } else {
          stepCurrentIndex = 0;
          stepBtn.innerHTML = '<span class="btn-icon">⏯️</span><span>Шаг за шагом</span>';
          resetBtn.click();
        }
      });
    }

    // --- RESET ---
    resetBtn.addEventListener('click', () => {
      SFX.click();
      attackState = 'idle';
      attackPackets = [];
      sparkParticles = [];
      shockwaves = [];
      stepCurrentIndex = 0;
      if (stepBtn) stepBtn.innerHTML = '<span class="btn-icon">⏯️</span><span>Шаг за шагом</span>';

      logConsole.innerHTML = `
        <div class="soc-log-line dim-log">[SOC READY] Защитный контур ProTesla Labs активен. Служба eBPF мониторит системные вызовы ядра.</div>
        <div class="soc-log-line dim-log">[ИНСТРУКЦИЯ] Выберите 1 из 6 сценариев слева и нажмите «Боевой пуск» или «Шаг за шагом».</div>
      `;
      statusBadge.textContent = 'МОНИТОРИНГ ОНЛАЙН';
      statusBadge.className = 'soc-defense-badge';
      statusBadge.style.borderColor = '';
      statusBadge.style.color = '';
      if (liveLed) liveLed.className = 'soc-live-led';
      if (threatTag) threatTag.textContent = 'МОНИТОРИНГ';
      if (packetRateEl) packetRateEl.textContent = '0 pkt/s';
      if (shieldStatusEl) shieldStatusEl.textContent = 'READY (100%)';

      resetPipelineUI();

      reactionEl.textContent = '—';
      driftEl.textContent = '—';
      calibEl.textContent = '—';
      verdictEl.textContent = 'PASSIVE_LISTEN';
      verdictEl.className = 'soc-m-v highlight-green';

      runBtn.disabled = false;
      if (stepBtn) stepBtn.disabled = false;
      battleRunning = false;
    });
  }

  initSOCBattle();

  // =========================================================================
  // 17. NEURAL TOPOLOGY CANVAS ENGINE (SEQ-ACGAN ARCHITECTURE GRAPH)
  // =========================================================================
  function initNeuralTopology() {
    const canvas = document.getElementById('neural-topology-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const inspectorName = document.getElementById('inspector-name');
    const inspectorDesc = document.getElementById('inspector-desc');
    const inspectorMath = document.getElementById('inspector-math');

    const btnForward = document.getElementById('btn-pulse-forward');
    const btnBackprop = document.getElementById('btn-pulse-backprop');

    let width = canvas.width;
    let height = canvas.height;

    // Topology Nodes Model
    const layers = [
      // Layer 0: Input (x-coordinates approx 80)
      [
        { id: 'in_dt', label: 'Δt (Интервал)', color: '#38bdf8', dim: 'ℝ¹', act: 'Linear Norm', desc: 'Временной интервал между смежными командами. Выявляет сверхбыстрые скрипты и аномальные паузы.' },
        { id: 'in_h', label: 'H (Энтропия)', color: '#38bdf8', dim: 'ℝ¹', act: 'Shannon Entropy', desc: 'Статистическая энтропия распределения вызовов системных библиотек и бинарных файлов.' },
        { id: 'in_c', label: 'c (Вектор роли)', color: '#38bdf8', dim: 'ℝ⁸', act: 'One-Hot Embed', desc: 'Кодирование ролевой принадлежности учетной записи (SysAdmin, Dev, Finance, SecOps).' },
        { id: 'in_z', label: 'z (Шум GAN)', color: '#38bdf8', dim: 'ℝ¹²⁸', act: 'Gaussian 𝒩(0, I)', desc: 'Латентный шум генератора для моделирования вариативности естественного человеческого поведения.' }
      ],

      // Layer 1: Dense Projections (x-coordinates approx 280)
      [
        { id: 'dense_proj', label: 'Linear Projection', color: '#60a5fa', dim: 'ℝ⁶⁴', act: 'LeakyReLU(0.2)', desc: 'Проекция объединенного вектора признаков и ролевого контекста в единое скрытое пространство.' },
        { id: 'dense_role', label: 'Role Embedding', color: '#60a5fa', dim: 'ℝ³²', act: 'Dense Embedding', desc: 'Обучаемое плотное представление прав доступа для кондиционирования генератора (AC-GAN).' },
        { id: 'dense_spec', label: 'Spectral Norm W', color: '#60a5fa', dim: 'ℝ⁶⁴', act: 'Lipschitz Matrix', desc: 'Спектральная нормализация весов для стабилизации состязательного обучения WGAN-GP.' }
      ],

      // Layer 2: LSTM Core & Temporal Memory (x-coordinates approx 520)
      [
        { id: 'lstm_1', label: 'LSTM Cell 1', color: '#a78bfa', dim: 'ℝ¹²⁸', act: 'Tanh / Sigmoid', desc: 'Первый рекуррентный блок, захватывающий локальные последовательности (длина окна T=50).' },
        { id: 'lstm_2', label: 'LSTM Cell 2', color: '#a78bfa', dim: 'ℝ¹²⁸', act: 'Hidden State h_t', desc: 'Второй рекуррентный уровень, моделирующий долгосрочные сессионные паттерны действий.' },
        { id: 'lstm_res', label: 'Residual Jump', color: '#a78bfa', dim: 'ℝ¹²⁸', act: 'Add & Norm', desc: 'Сквозное соединение (Skip Connection) для беспрепятственного градиентного потока.' },
        { id: 'lstm_att', label: 'Temporal Attention', color: '#a78bfa', dim: 'ℝ¹²⁸', act: 'Softmax Weights', desc: 'Механизм внимания к ключевым аномальным моментам в цепочке действий пользователя.' }
      ],

      // Layer 3: Adversarial Critic & Auxiliary Classifier (x-coordinates approx 780)
      [
        { id: 'wgan_val', label: 'Critic Value D(x)', color: '#f59e0b', dim: 'ℝ¹', act: 'Linear Critic', desc: 'Оценка степени реалистичности последовательности в метрике расстояния Вассерштейна.' },
        { id: 'wgan_gp', label: 'Grad Penalty ∇D', color: '#f59e0b', dim: 'ℝ¹', act: '||∇D||₂ Constraint', desc: 'Штраф за отклонение нормы градиента от единицы. Гарантирует 1-Липшицевость критика.' },
        { id: 'aux_cls', label: 'Auxiliary Class C(x)', color: '#f59e0b', dim: 'ℝ⁸', act: 'Softmax Multi-Class', desc: 'Вспомогательный классификатор, проверяющий соответствие сессии заявленной роли сотрудника.' }
      ],

      // Layer 4: Calibrated Risk Verdict (x-coordinates approx 1000)
      [
        { id: 'out_p', label: 'p_calib (Risk Score)', color: '#10b981', dim: 'ℝ¹ ∈ [0, 1]', act: 'Bayesian Quantile', desc: 'Итоговая калиброванная оценка риска с учетом пользовательских и ролевых квантилей.' },
        { id: 'out_match', label: 'Role Alignment %', color: '#10b981', dim: 'ℝ¹ %', act: 'Confidence Metric', desc: 'Степень доверия: подтверждение того, что сессия принадлежит легитимному владельцу учетки.' }
      ]
    ];

    // Compute coordinates
    const nodes = [];
    const synapses = [];
    const pulses = [];

    const xCols = [90, 300, 540, 780, 990];

    layers.forEach((layer, lIdx) => {
      const colX = xCols[lIdx];
      const count = layer.length;
      const stepY = (height - 80) / (count + 1);

      layer.forEach((node, nIdx) => {
        node.x = colX;
        node.y = 40 + stepY * (nIdx + 1);
        node.radius = 11;
        node.layerIdx = lIdx;
        nodes.push(node);
      });
    });

    // Create synapses between adjacent layers
    for (let l = 0; l < layers.length - 1; l++) {
      const curr = layers[l];
      const next = layers[l + 1];
      curr.forEach(n1 => {
        next.forEach(n2 => {
          synapses.push({ from: n1, to: n2 });
        });
      });
    }

    let hoveredNode = null;

    function getThemeAccent() {
      const t = document.documentElement.getAttribute('data-theme') || 'emerald';
      switch (t) {
        case 'amber': return '#f59e0b';
        case 'cyan': return '#06b6d4';
        case 'violet': return '#8b5cf6';
        default: return '#10b981';
      }
    }

    function spawnPulse(from, to, reverse = false, color = null) {
      pulses.push({
        from: reverse ? to : from,
        to: reverse ? from : to,
        progress: 0,
        speed: 0.018 + Math.random() * 0.012,
        color: color || (reverse ? '#f59e0b' : '#34d399')
      });
    }

    function triggerCascade(reverse = false) {
      const accent = getThemeAccent();
      for (let i = 0; i < 28; i++) {
        setTimeout(() => {
          const syn = synapses[Math.floor(Math.random() * synapses.length)];
          spawnPulse(syn.from, syn.to, reverse, reverse ? '#f59e0b' : accent);
        }, i * 35);
      }
    }

    if (btnForward) {
      btnForward.addEventListener('click', () => {
        triggerCascade(false);
        SFX.click();
      });
    }

    if (btnBackprop) {
      btnBackprop.addEventListener('click', () => {
        triggerCascade(true);
        SFX.matrix();
      });
    }

    // Auto ambient pulses
    setInterval(() => {
      if (pulses.length < 18) {
        const syn = synapses[Math.floor(Math.random() * synapses.length)];
        spawnPulse(syn.from, syn.to, false);
      }
    }, 450);

    // Canvas interactivity
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;

      let nearest = null;
      let minDist = 26;

      nodes.forEach(n => {
        const dx = n.x - mx;
        const dy = n.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          nearest = n;
          minDist = dist;
        }
      });

      if (nearest !== hoveredNode) {
        hoveredNode = nearest;
        if (hoveredNode) {
          inspectorName.textContent = `Узел: ${hoveredNode.label} [Слой ${hoveredNode.layerIdx}]`;
          inspectorDesc.textContent = hoveredNode.desc;
          inspectorMath.textContent = `Размерность: ${hoveredNode.dim} | Функция: ${hoveredNode.act}`;
          SFX.hover();
        }
      }
    });

    canvas.addEventListener('click', () => {
      if (hoveredNode) {
        SFX.click();
        // Fire pulses from this node
        synapses.filter(s => s.from === hoveredNode).forEach(s => spawnPulse(s.from, s.to));
        synapses.filter(s => s.to === hoveredNode).forEach(s => spawnPulse(s.from, s.to, true));
      }
    });

    // 60 FPS Render Loop
    function renderTopology() {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Synapses
      synapses.forEach(s => {
        const isHovered = hoveredNode && (s.from === hoveredNode || s.to === hoveredNode);
        ctx.beginPath();
        ctx.moveTo(s.from.x, s.from.y);
        ctx.lineTo(s.to.x, s.to.y);

        if (isHovered) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 1.6;
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
          ctx.lineWidth = 0.8;
        }
        ctx.stroke();
      });

      // 2. Draw & Update Pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.progress += p.speed;

        if (p.progress >= 1) {
          pulses.splice(i, 1);
          continue;
        }

        const currX = p.from.x + (p.to.x - p.from.x) * p.progress;
        const currY = p.from.y + (p.to.y - p.from.y) * p.progress;

        ctx.beginPath();
        ctx.arc(currX, currY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 3. Draw Nodes
      nodes.forEach(n => {
        const isHovered = (n === hoveredNode);

        // Outer glow on hover
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.strokeStyle = n.color;
          ctx.lineWidth = 1.8;
          ctx.stroke();
          ctx.fill();
        }

        // Main node body
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#06090e';
        ctx.strokeStyle = n.color;
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();

        // Node Label
        ctx.font = '10px "SF Mono", Consolas, monospace';
        ctx.fillStyle = isHovered ? '#ffffff' : '#94a3b8';
        ctx.textAlign = 'left';
        ctx.fillText(n.label, n.x + 16, n.y + 3.5);
      });

      requestAnimationFrame(renderTopology);
    }

    renderTopology();
  }

  initNeuralTopology();

  // =========================================================================
  // 15. COPY EMAIL TO CLIPBOARD
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

  // =========================================================================
  // 18. PRESENTATION VIDEO MODAL CONTROLLER
  // =========================================================================
  function initVideoModal() {
    const videoModal = document.getElementById('video-modal');
    const videoPlayer = document.getElementById('presentation-video');
    const closeBtn = document.getElementById('video-modal-close-btn');
    const openHeroBtn = document.getElementById('btn-hero-watch-video');
    const openNavBtn = document.getElementById('nav-open-video');

    if (!videoModal || !videoPlayer) return;

    function openModal() {
      videoModal.classList.remove('hidden');
      videoPlayer.currentTime = 0;
      videoPlayer.play().catch(() => {});
      SFX.click();
    }

    function closeModal() {
      videoPlayer.pause();
      videoModal.classList.add('hidden');
      SFX.click();
    }

    if (openHeroBtn) openHeroBtn.addEventListener('click', openModal);
    if (openNavBtn) openNavBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !videoModal.classList.contains('hidden')) {
        closeModal();
      }
    });
  }
  initVideoModal();

})();
