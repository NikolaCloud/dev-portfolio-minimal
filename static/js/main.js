// Interactive Developer Terminal logic
const termOutput = document.getElementById("termOutput");
const termInput = document.getElementById("termInput");

const COMMANDS = {
  help: "Доступные команды: <span class='term-green'>skills</span>, <span class='term-green'>projects</span>, <span class='term-green'>contact</span>, <span class='term-green'>clear</span>",
  skills: "Стек: Python, FastAPI, CustomTkinter, SQLite, Docker, PostgreSQL, Pandas, Streamlit, Git",
  projects: "Проекты: OmniParse Studio (Скрапинг), Sentinel SIEM (Кибербезопасность), ShopFlow (Telegram E-Comm), DataPulse (ETL)",
  contact: "Связь: Telegram: @alex_dev | GitHub: github.com/username | Email: alex@dev.internal",
  clear: "CLEAR_ACTION"
};

if (termInput) {
  termInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const cmd = termInput.value.trim().toLowerCase();
      termInput.value = "";
      handleTerminalCommand(cmd);
    }
  });
}

function handleTerminalCommand(cmd) {
  if (!cmd) return;

  if (cmd === "clear") {
    termOutput.innerHTML = "";
    return;
  }

  const response = COMMANDS[cmd] || `Команда '${cmd}' не найдена. Введите <span class='term-green'>help</span> для списка доступных команд.`;

  const line = document.createElement("div");
  line.innerHTML = `<span class="term-blue">dev@portfolio:~$</span> ${cmd}<br>${response}`;
  termOutput.appendChild(line);
  termOutput.scrollTop = termOutput.scrollHeight;
}

// Contact form submission
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const btn = contactForm.querySelector("button");
    btn.innerText = "✓ Отправлено!";
    btn.style.background = "#10b981";
    setTimeout(() => {
      contactForm.reset();
      btn.innerText = "Отправить сообщение";
      btn.style.background = "#fff";
    }, 3000);
  });
}
