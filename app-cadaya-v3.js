(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const cfg = window.CADAYA_CONFIG || {};
  const company = cfg.company || {};
  const formCfg = cfg.form || {};

  const state = {
    submitting: false,
    deferredPrompt: null,
    formOpenedAt: Date.now(),
    attribution: null
  };

  const keys = {
    welcomeSeen: "cadayaWelcomeSeen",
    formDraft: "cadayaLeadDraftV19",
    pendingLead: "cadayaPendingLeadV19",
    attribution: "cadayaAttributionV19",
    lastLead: "cadayaLastLead"
  };

  const el = {};

  function cacheElements() {
    Object.assign(el, {
      introScreen: $("#introScreen"),
      welcomeModal: $("#welcomeModal"),
      welcomeClose: $("#welcomeClose"),
      welcomeExplore: $("#welcomeExplore"),
      welcomeVisit: $("#welcomeVisit"),
      visitForm: $("#visitForm"),
      submitLead: $("#submitLead"),
      formStatus: $("#formStatus"),
      successModal: $("#successModal"),
      successClose: $("#successClose"),
      leadReference: $("#leadReference"),
      networkBanner: $("#networkBanner"),
      updateBanner: $("#updateBanner"),
      reloadUpdate: $("#reloadUpdate"),
      pendingLeadNotice: $("#pendingLeadNotice"),
      retryPendingLead: $("#retryPendingLead"),
      installApp: $("#installApp"),
      iosInstallHelp: $("#iosInstallHelp"),
      iosInstallModal: $("#iosInstallModal"),
      iosInstallClose: $("#iosInstallClose"),
      iosInstallDone: $("#iosInstallDone"),
      interestError: $("#interestError")
    });
  }

  function setMobileViewportHeight() {
    document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
  }

  function showModal(modal) {
    if (!modal) return;
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function hideModal(modal) {
    if (!modal) return;
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    if (!$$(".welcome-modal.show, .success-modal.show, .ios-install-modal.show").length) {
      document.body.classList.remove("modal-open");
    }
  }

  function initIntro() {
    window.addEventListener("load", () => {
      window.setTimeout(() => el.introScreen?.classList.add("hide"), 1500);
    });
  }

  function initRevealAnimations() {
    if (!("IntersectionObserver" in window)) {
      $$(".reveal").forEach(node => node.classList.add("show"));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    $$(".reveal").forEach(node => observer.observe(node));
  }

  function initWelcome() {
    const close = () => {
      hideModal(el.welcomeModal);
      localStorage.setItem(keys.welcomeSeen, "1");
    };

    el.welcomeClose?.addEventListener("click", close);
    el.welcomeExplore?.addEventListener("click", close);
    el.welcomeVisit?.addEventListener("click", close);
    $(".welcome-backdrop", el.welcomeModal)?.addEventListener("click", close);

    window.addEventListener("load", () => {
      if (!localStorage.getItem(keys.welcomeSeen)) {
        window.setTimeout(() => showModal(el.welcomeModal), 1900);
      }
    });
  }

  function initExternalLinks() {
    $$('a[target="_blank"]').forEach(link => {
      const rel = new Set((link.getAttribute("rel") || "").split(/\s+/).filter(Boolean));
      rel.add("noopener");
      rel.add("noreferrer");
      link.setAttribute("rel", [...rel].join(" "));
    });
  }

  function initPWA() {
    let refreshing = false;
    let waitingWorker = null;
    const hideUpdateBanner = () => { if (el.updateBanner) el.updateBanner.hidden = true; };
    const showUpdateBanner = worker => {
      waitingWorker = worker || null;
      if (el.updateBanner) el.updateBanner.hidden = false;
    };

    hideUpdateBanner();

    window.addEventListener("beforeinstallprompt", event => {
      event.preventDefault();
      state.deferredPrompt = event;
      if (el.installApp) el.installApp.hidden = false;
    });

    el.installApp?.addEventListener("click", async () => {
      if (!state.deferredPrompt) return;
      state.deferredPrompt.prompt();
      await state.deferredPrompt.userChoice;
      state.deferredPrompt = null;
      el.installApp.hidden = true;
    });

    window.addEventListener("appinstalled", () => {
      if (el.installApp) el.installApp.hidden = true;
    });

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = window.navigator.standalone === true;
    if (el.iosInstallHelp && isIOS && !isStandalone) el.iosInstallHelp.hidden = false;

    const openIOS = () => showModal(el.iosInstallModal);
    const closeIOS = () => hideModal(el.iosInstallModal);
    el.iosInstallHelp?.addEventListener("click", openIOS);
    el.iosInstallClose?.addEventListener("click", closeIOS);
    el.iosInstallDone?.addEventListener("click", closeIOS);
    $(".ios-install-backdrop", el.iosInstallModal)?.addEventListener("click", closeIOS);

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", async () => {
        try {
          const registration = await navigator.serviceWorker.register("./sw.js");
          if (registration.waiting && navigator.serviceWorker.controller) {
            showUpdateBanner(registration.waiting);
          }
          registration.addEventListener("updatefound", () => {
            const worker = registration.installing;
            worker?.addEventListener("statechange", () => {
              if (worker.state === "installed" && navigator.serviceWorker.controller) {
                showUpdateBanner(registration.waiting || worker);
              }
            });
          });
          registration.update().catch(() => {});
        } catch (_) {}
      });

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        hideUpdateBanner();
        sessionStorage.setItem("cadayaJustUpdatedV20","1");
        window.location.reload();
      });
    }

    if (sessionStorage.getItem("cadayaJustUpdatedV20")==="1") {
      sessionStorage.removeItem("cadayaJustUpdatedV20");
      hideUpdateBanner();
    }

    el.reloadUpdate?.addEventListener("click", () => {
      hideUpdateBanner();
      if (waitingWorker) waitingWorker.postMessage({type:"SKIP_WAITING"});
      else {
        sessionStorage.setItem("cadayaJustUpdatedV20","1");
        window.location.reload();
      }
    });
  }

  function updateNetworkState() {
    const offline = !navigator.onLine;
    if (el.networkBanner) el.networkBanner.hidden = !offline;
    if (el.submitLead && !state.submitting) el.submitLead.disabled = offline;

    if (offline && el.formStatus) {
      el.formStatus.textContent = "Sin conexión. Tus datos permanecerán guardados en este dispositivo.";
    } else if (el.formStatus?.textContent?.startsWith("Sin conexión")) {
      el.formStatus.textContent = "";
    }
  }

  function initNetwork() {
    window.addEventListener("online", () => {
      updateNetworkState();
      retryStoredLead({ silent: true });
    });
    window.addEventListener("offline", updateNetworkState);
    updateNetworkState();
  }

  function selectedInterests() {
    return $$('input[name="Interes"]:checked').map(input => input.value);
  }

  function saveDraft() {
    if (!el.visitForm) return;
    const draft = {
      nombre: $("#nombre")?.value || "",
      empresa: $("#empresa")?.value || "",
      ciudad: $("#ciudad")?.value || "",
      cargo: $("#cargo")?.value || "",
      telefono: $("#telefono")?.value || "",
      correo: $("#correo")?.value || "",
      comentarios: $("#comentarios")?.value || "",
      intereses: selectedInterests()
    };
    sessionStorage.setItem(keys.formDraft, JSON.stringify(draft));
  }

  function restoreDraft() {
    if (!el.visitForm) return;
    try {
      const draft = JSON.parse(sessionStorage.getItem(keys.formDraft) || "null");
      if (!draft) return;

      ["nombre","empresa","ciudad","cargo","telefono","correo","comentarios"].forEach(id => {
        const field = document.getElementById(id);
        if (field && draft[id]) field.value = draft[id];
      });

      $$('input[name="Interes"]').forEach(input => {
        input.checked = Array.isArray(draft.intereses) && draft.intereses.includes(input.value);
      });
    } catch (_) {}
  }

  function initDraftPersistence() {
    el.visitForm?.addEventListener("input", saveDraft);
    el.visitForm?.addEventListener("change", saveDraft);
    restoreDraft();
  }

  function collectAttribution() {
    const params = new URLSearchParams(window.location.search);
    let stored = null;
    try {
      stored = JSON.parse(localStorage.getItem(keys.attribution) || "null");
    } catch (_) {}

    const current = {
      source: params.get("utm_source") || params.get("source") || stored?.source || "QR / acceso directo",
      medium: params.get("utm_medium") || stored?.medium || "landing",
      campaign: params.get("utm_campaign") || stored?.campaign || "cadaya-connect",
      content: params.get("utm_content") || stored?.content || "",
      firstSeenAt: stored?.firstSeenAt || new Date().toISOString(),
      referrer: document.referrer || stored?.referrer || "Sin referencia",
      landingUrl: window.location.href
    };

    localStorage.setItem(keys.attribution, JSON.stringify(current));
    return current;
  }

  function deviceSummary() {
    const ua = navigator.userAgent || "";
    let device = "Otro";
    if (/iPhone/i.test(ua)) device = "iPhone";
    else if (/iPad/i.test(ua)) device = "iPad";
    else if (/Android/i.test(ua)) device = "Android";
    else if (/Windows/i.test(ua)) device = "PC Windows";
    else if (/Macintosh/i.test(ua)) device = "Mac";
    return `${device} · ${window.innerWidth}x${window.innerHeight}`;
  }

  function generateLeadId() {
    return `CAD-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
  }

  function setSubmitting(active) {
    state.submitting = active;
    if (!el.submitLead) return;
    el.submitLead.disabled = active || !navigator.onLine;
    el.submitLead.classList.toggle("loading", active);
  }

  async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      window.clearTimeout(timer);
    }
  }

  async function sendLeadPayload(payload) {
    const endpoint = formCfg.endpoint || `https://formsubmit.co/ajax/${company.email || "gerentecomercial@grupocadayasas.com"}`;
    const response = await fetchWithTimeout(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("lead-send-failed");
    return response;
  }

  function savePendingLead(payload) {
    localStorage.setItem(keys.pendingLead, JSON.stringify({
      payload,
      savedAt: Date.now(),
      attempts: 0
    }));
    if (el.pendingLeadNotice) el.pendingLeadNotice.hidden = false;
  }

  function getPendingLead() {
    try {
      return JSON.parse(localStorage.getItem(keys.pendingLead) || "null");
    } catch (_) {
      return null;
    }
  }

  function clearPendingLead() {
    localStorage.removeItem(keys.pendingLead);
    if (el.pendingLeadNotice) el.pendingLeadNotice.hidden = true;
  }

  async function retryStoredLead({ silent = false } = {}) {
    const pending = getPendingLead();
    if (!pending || !navigator.onLine) {
      if (el.pendingLeadNotice) el.pendingLeadNotice.hidden = !pending;
      return false;
    }

    try {
      if (!silent && el.formStatus) el.formStatus.textContent = "Reintentando envío…";
      pending.attempts = (pending.attempts || 0) + 1;
      localStorage.setItem(keys.pendingLead, JSON.stringify(pending));
      await sendLeadPayload(pending.payload);
      clearPendingLead();
      if (el.formStatus) el.formStatus.textContent = "";
      if (el.leadReference) el.leadReference.textContent = pending.payload.Referencia || "CADAYA";
      showModal(el.successModal);
      return true;
    } catch (_) {
      if (!silent && el.formStatus) {
        el.formStatus.textContent = "La solicitud sigue guardada. La reintentaremos al recuperar una conexión estable.";
        el.formStatus.classList.add("error");
      }
      return false;
    }
  }

  function buildPayload(reference) {
    const attr = state.attribution;
    return {
      Referencia: reference,
      Fecha: new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" }),
      Nombre: $("#nombre").value.trim(),
      Empresa: $("#empresa").value.trim(),
      Ciudad: $("#ciudad").value.trim(),
      Cargo: $("#cargo").value.trim() || "No informado",
      Celular: $("#telefono").value.trim(),
      Correo: $("#correo").value.trim(),
      Interes: selectedInterests().join(", "),
      Comentarios: $("#comentarios").value.trim() || "Sin comentarios",
      Origen: attr.source,
      Medio: attr.medium,
      Campaña: attr.campaign,
      Contenido: attr.content || "No informado",
      ReferenciaWeb: attr.referrer,
      URL: attr.landingUrl,
      Dispositivo: deviceSummary(),
      _subject: `Nueva solicitud comercial ${reference} - CADAYA CONNECT`,
      _template: "table",
      _captcha: "false",
      _autoresponse: "Hemos recibido tu solicitud de visita comercial. Un asesor de GRUPO CADAYA SAS se comunicará contigo muy pronto. Productos selectos para clientes selectos."
    };
  }

  async function handleLeadSubmit(event) {
    event.preventDefault();
    if (state.submitting || !el.visitForm) return;

    el.formStatus.textContent = "";
    el.formStatus.classList.remove("error");

    if ($("#honeyField")?.value) return;

    if (!el.visitForm.checkValidity()) {
      el.visitForm.reportValidity();
      return;
    }

    if (!selectedInterests().length) {
      el.interestError.textContent = "Selecciona al menos una opción.";
      $(".interest-fieldset")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const minSeconds = formCfg.minimumCompletionSeconds || 3;
    if ((Date.now() - state.formOpenedAt) / 1000 < minSeconds) {
      el.formStatus.textContent = "Espera un momento y vuelve a enviar la solicitud.";
      el.formStatus.classList.add("error");
      return;
    }

    const phone = $("#telefono");
    phone.value = phone.value.replace(/[^0-9+\s()-]/g, "").trim();

    const reference = generateLeadId();
    const payload = buildPayload(reference);

    try {
      setSubmitting(true);
      el.formStatus.textContent = "Enviando solicitud…";
      await sendLeadPayload(payload);

      localStorage.setItem(keys.lastLead, JSON.stringify(payload));
      sessionStorage.removeItem(keys.formDraft);
      clearPendingLead();
      el.visitForm.reset();
      el.formStatus.textContent = "";
      el.leadReference.textContent = reference;
      showModal(el.successModal);
    } catch (_) {
      savePendingLead(payload);
      el.formStatus.innerHTML = `La solicitud quedó guardada y se enviará automáticamente al recuperar conexión. También puedes escribir a <a href="mailto:${company.email || "gerentecomercial@grupocadayasas.com"}">${company.email || "gerentecomercial@grupocadayasas.com"}</a>.`;
      el.formStatus.classList.add("error");
    } finally {
      setSubmitting(false);
    }
  }

  function initForm() {
    if (!el.visitForm) return;

    state.attribution = collectAttribution();

    el.visitForm.addEventListener("submit", handleLeadSubmit);
    el.retryPendingLead?.addEventListener("click", () => retryStoredLead());

    $$('input[name="Interes"]').forEach(input => {
      input.addEventListener("change", () => {
        if (selectedInterests().length) el.interestError.textContent = "";
      });
    });

    const closeSuccess = () => {
      hideModal(el.successModal);
      sessionStorage.removeItem(keys.formDraft);
    };

    el.successClose?.addEventListener("click", closeSuccess);
    $(".success-backdrop", el.successModal)?.addEventListener("click", closeSuccess);

    const pending = getPendingLead();
    if (el.pendingLeadNotice) el.pendingLeadNotice.hidden = !pending;
  }

  function initKeyboardShortcuts() {
    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      hideModal(el.welcomeModal);
      hideModal(el.successModal);
      hideModal(el.iosInstallModal);
    });
  }

  function initCurrentYear() {
    $$("[data-current-year]").forEach(node => {
      node.textContent = new Date().getFullYear();
    });
  }

  function init() {
    cacheElements();
    setMobileViewportHeight();
    window.addEventListener("resize", setMobileViewportHeight);
    window.addEventListener("orientationchange", setMobileViewportHeight);

    initIntro();
    initRevealAnimations();
    initWelcome();
    initExternalLinks();
    initPWA();
    initNetwork();
    initDraftPersistence();
    initForm();
    initKeyboardShortcuts();
    initCurrentYear();
    document.querySelector(".visit-banner")?.classList.add("pulse-conversion");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();