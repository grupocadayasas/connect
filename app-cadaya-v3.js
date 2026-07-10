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
