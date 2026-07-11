window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("introScreen").classList.add("hide"), 1800);
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("show");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

document.getElementById("visitForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const data = {
    nombre: document.getElementById("nombre").value.trim(),
    empresa: document.getElementById("empresa").value.trim(),
    ciudad: document.getElementById("ciudad").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    correo: document.getElementById("correo").value.trim(),
    interes: document.getElementById("interes").value.trim()
  };

  const message = [
    "Hola GRUPO CADAYA SAS.",
    "",
    "Deseo solicitar una visita comercial.",
    "",
    `Nombre: ${data.nombre}`,
    `Empresa o establecimiento: ${data.empresa}`,
    `Ciudad: ${data.ciudad}`,
    `Teléfono: ${data.telefono}`,
    `Correo: ${data.correo || "No informado"}`,
    `Interés: ${data.interes || "No informado"}`,
    "",
    "Solicitud enviada desde CADAYA CONNECT."
  ].join("\n");

  window.open(`https://wa.me/573015748739?text=${encodeURIComponent(message)}`, "_blank", "noopener");
});

// Mejora de altura útil en navegadores móviles (Safari/Chrome).
function setMobileViewportHeight() {
  document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
}
setMobileViewportHeight();
window.addEventListener("resize", setMobileViewportHeight);
window.addEventListener("orientationchange", setMobileViewportHeight);


// CADAYA CONNECT PREMIUM — bienvenida de primera visita
const welcomeModal = document.getElementById("welcomeModal");
const welcomeClose = document.getElementById("welcomeClose");
const welcomeExplore = document.getElementById("welcomeExplore");
const welcomeVisit = document.getElementById("welcomeVisit");

function closeWelcome() {
  welcomeModal?.classList.remove("show");
  welcomeModal?.setAttribute("aria-hidden", "true");
  localStorage.setItem("cadayaWelcomeSeen", "1");
}

window.addEventListener("load", () => {
  if (!localStorage.getItem("cadayaWelcomeSeen")) {
    setTimeout(() => {
      welcomeModal?.classList.add("show");
      welcomeModal?.setAttribute("aria-hidden", "false");
    }, 2200);
  }
});

welcomeClose?.addEventListener("click", closeWelcome);
welcomeExplore?.addEventListener("click", closeWelcome);
welcomeVisit?.addEventListener("click", closeWelcome);
welcomeModal?.querySelector(".welcome-backdrop")?.addEventListener("click", closeWelcome);

// PWA
let deferredPrompt;
const installButton = document.getElementById("installApp");

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  if (installButton) installButton.hidden = false;
});

installButton?.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installButton.hidden = true;
});

window.addEventListener("appinstalled", () => {
  if (installButton) installButton.hidden = true;
});

// Service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

// Destacar CTA comercial sin saturar
document.querySelector(".visit-banner")?.classList.add("pulse-conversion");
