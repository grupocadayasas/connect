window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("introScreen").classList.add("hide"), 1800);
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("show");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));



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

const leadForm = document.getElementById("visitForm");
const submitLead = document.getElementById("submitLead");
const formStatus = document.getElementById("formStatus");
const successModal = document.getElementById("successModal");
const successClose = document.getElementById("successClose");
const leadReference = document.getElementById("leadReference");
const FORM_ENDPOINT = window.CADAYA_CONFIG?.form?.endpoint || "https://formsubmit.co/ajax/gerentecomercial@grupocadayasas.com";
const FORM_MIN_SECONDS = window.CADAYA_CONFIG?.form?.minimumCompletionSeconds || 3;
const formOpenedAt = Date.now();

function generateLeadId(){return `CAD-${Date.now().toString().slice(-6)}${Math.floor(Math.random()*90+10)}`;}
function selectedInterests(){return [...document.querySelectorAll('input[name="Interes"]:checked')].map(i=>i.value);}
function setSubmitting(v){submitLead.disabled=v;submitLead.classList.toggle("loading",v);}
function closeSuccess(){successModal.classList.remove("show");successModal.setAttribute("aria-hidden","true");}
successClose?.addEventListener("click",closeSuccess);
successModal?.querySelector(".success-backdrop")?.addEventListener("click",closeSuccess);

leadForm?.addEventListener("submit", async (event)=>{
  event.preventDefault();
  formStatus.textContent="";
  formStatus.classList.remove("error");
  if(document.getElementById("honeyField").value) return;
  const interests=selectedInterests();
  if(!leadForm.checkValidity()){leadForm.reportValidity();return;}
  if(!interests.length){document.getElementById("interestError").textContent="Selecciona al menos una opción.";return;}
  document.getElementById("interestError").textContent="";
  const elapsedSeconds = (Date.now() - formOpenedAt) / 1000;
  if (elapsedSeconds < FORM_MIN_SECONDS) {
    formStatus.textContent = "Espera un momento y vuelve a enviar la solicitud.";
    formStatus.classList.add("error");
    return;
  }

  const phoneInput = document.getElementById("telefono");
  phoneInput.value = phoneInput.value.replace(/[^0-9+\s()-]/g, "").trim();

  const ref=generateLeadId();
  const payload={
    Referencia:ref,
    Fecha:new Date().toLocaleString("es-CO",{timeZone:"America/Bogota"}),
    Nombre:document.getElementById("nombre").value.trim(),
    Empresa:document.getElementById("empresa").value.trim(),
    Ciudad:document.getElementById("ciudad").value.trim(),
    Cargo:document.getElementById("cargo").value.trim()||"No informado",
    Celular:document.getElementById("telefono").value.trim(),
    Correo:document.getElementById("correo").value.trim(),
    Interes:interests.join(", "),
    Comentarios:document.getElementById("comentarios").value.trim()||"Sin comentarios",
    _subject:`Nueva solicitud comercial ${ref} - CADAYA CONNECT`,
    _template:"table",
    _captcha:"false",
    _autoresponse:"Hemos recibido tu solicitud de visita comercial. Un asesor de GRUPO CADAYA SAS se comunicará contigo muy pronto. Productos selectos para clientes selectos.",
    Origen:"CADAYA CONNECT - Código QR"
  };
  try{
    setSubmitting(true);formStatus.textContent="Enviando solicitud…";
    const response=await fetch(FORM_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(payload)});
    if(!response.ok) throw new Error();
    localStorage.setItem("cadayaLastLead",JSON.stringify(payload));
    leadForm.reset();formStatus.textContent="";leadReference.textContent=ref;
    successModal.classList.add("show");successModal.setAttribute("aria-hidden","false");
  }catch(e){
    formStatus.innerHTML='No pudimos enviar la solicitud. Intenta nuevamente o escríbenos a <a href="mailto:gerentecomercial@grupocadayasas.com">gerentecomercial@grupocadayasas.com</a>.';
    formStatus.classList.add("error");
  }finally{setSubmitting(false);}
});


// V14 — accesibilidad y robustez
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (welcomeModal?.classList.contains("show")) {
    closeWelcome();
  }

  if (successModal?.classList.contains("show")) {
    closeSuccess();
  }
});

document.querySelectorAll('input[name="Interes"]').forEach((input) => {
  input.addEventListener("change", () => {
    const error = document.getElementById("interestError");
    if (selectedInterests().length && error) error.textContent = "";
  });
});

document.querySelectorAll('a[target="_blank"]').forEach((link) => {
  const current = link.getAttribute("rel") || "";
  if (!current.includes("noopener")) link.setAttribute("rel", `${current} noopener`.trim());
  if (!current.includes("noreferrer")) link.setAttribute("rel", `${link.getAttribute("rel")} noreferrer`.trim());
});


// V15 — configuración centralizada y mantenimiento
(function hydrateCompanyConfig() {
  const cfg = window.CADAYA_CONFIG?.company;
  if (!cfg) return;

  document.querySelectorAll('[data-current-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();

// Prevent accidental duplicate submissions caused by fast double taps
let lastSubmitAt = 0;
leadForm?.addEventListener("submit", (event) => {
  const now = Date.now();
  if (now - lastSubmitAt < 1500) {
    event.preventDefault();
    return;
  }
  lastSubmitAt = now;
}, true);
