// ===== CONFIGURACIÓN =====
var ADMIN_PASSWORD = "ash090667";
var STORE_KEY = "ac_products";
const SOCIAL = {
  instagram: "https://www.instagram.com/ac_sport9",
  tiktok: "https://www.tiktok.com/@ac_sport9",
  whatsapp: "1809XXXXXXX"
};

var items = [], cat = "todo", admin = false, editId = null;
var $ = function (i) { return document.getElementById(i); };
var money = function (n) { return "RD$ " + Number(n || 0).toLocaleString("es-DO"); };
function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : s; return d.innerHTML; }

// ===== ICONOS Y REDES SOCIALES =====
var SOCIAL_ICONS = {
  instagram: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-2.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" clip-rule="evenodd"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.7 2h-3.4v13.1a2.8 2.8 0 1 1-2.4-2.77V8.87a6.2 6.2 0 1 0 5.8 6.18V8.9a8.4 8.4 0 0 0 4.9 1.56V7.08A5.08 5.08 0 0 1 16.7 2Z"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12.04 2a9.8 9.8 0 0 0-8.46 14.72L2 22l5.43-1.55A9.98 9.98 0 1 0 12.04 2Zm0 17.92c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.22.92.87-3.14-.2-.32a7.91 7.91 0 1 1 7.1 3.88Zm4.34-5.93c-.24-.12-1.41-.69-1.63-.77-.22-.08-.38-.12-.54.12-.16.24-.62.77-.76.93-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.02-.37.1-.49.1-.1.24-.26.36-.38.12-.12.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.47-.39-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.39 1.37.5.57.18 1.09.15 1.5.09.46-.07 1.41-.58 1.61-1.13.2-.56.2-1.03.14-1.13-.06-.1-.22-.16-.46-.28Z" clip-rule="evenodd"/></svg>'
};

function whatsappUrl() { return "https://wa.me/" + SOCIAL.whatsapp; }

function createSocialLink(name, label, url, icon) {
  var link = document.createElement("a");
  link.className = "social-link social-" + name;
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("aria-label", label);
  link.innerHTML = icon;
  return link;
}

function initSocialLinks() {
  var socialData = [
    { name: "instagram", label: "Instagram de AC Sports", url: SOCIAL.instagram, icon: SOCIAL_ICONS.instagram },
    { name: "tiktok", label: "TikTok de AC Sports", url: SOCIAL.tiktok, icon: SOCIAL_ICONS.tiktok },
    { name: "whatsapp", label: "WhatsApp de AC Sports", url: whatsappUrl(), icon: SOCIAL_ICONS.whatsapp }
  ];
  ["headerSocial", "footerSocial"].forEach(function (containerId) {
    var container = $(containerId);
    container.innerHTML = "";
    socialData.forEach(function (social) { container.appendChild(createSocialLink(social.name, social.label, social.url, social.icon)); });
  });
  $("whatsappFloat").href = whatsappUrl();
  $("whatsappFloatIcon").innerHTML = SOCIAL_ICONS.whatsapp;
}

function productWhatsappUrl(p) {
  var message = "Hola AC Sports, me interesa este artículo: " + p.name + " (" + money(p.price) + "). ¿Está disponible?";
  return whatsappUrl() + "?text=" + encodeURIComponent(message);
}

// ===== ALMACENAMIENTO (localStorage; cámbialo por tu API/base de datos si quieres compartir entre dispositivos) =====
function load() {
  try { items = JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch (e) { items = []; }
}
function persist() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(items)); }
  catch (e) { alert("No hay espacio para guardar. Usa fotos más pequeñas."); }
}

// ===== FOTO: reduce a 800px y guarda como texto =====
function readImage(file) {
  return new Promise(function (ok, fail) {
    var r = new FileReader();
    r.onerror = fail;
    r.onload = function () {
      var im = new Image();
      im.onerror = fail;
      im.onload = function () {
        var s = Math.min(1, 800 / Math.max(im.width, im.height));
        var c = document.createElement("canvas");
        c.width = im.width * s; c.height = im.height * s;
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        ok(c.toDataURL("image/jpeg", 0.8));
      };
      im.src = r.result;
    };
    r.readAsDataURL(file);
  });
}

// ===== RENDER =====
function render() {
  var list = items.filter(function (p) { return cat === "todo" || p.cat === cat; })
                  .sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
  $("title").textContent = cat === "mujer" ? "Ropa de mujer" : cat === "hombre" ? "Ropa de hombre" : "Colección";
  $("newBtn").style.display = admin ? "inline-block" : "none";
  $("adminBtn").textContent = admin ? "Salir de admin" : "Administrar";
  if (!list.length) {
    $("grid").innerHTML = '<div class="empty" style="grid-column:1/-1">Pronto habrá nuevos artículos.</div>';
    return;
  }
  $("grid").innerHTML = list.map(function (p) {
    var img = p.img ? '<img src="' + esc(p.img) + '" alt="' + esc(p.name) + '" loading="lazy">' : "<span>AC</span>";
    var sizes = Array.isArray(p.sizes) && p.sizes.length ? '<div class="card-sizes"><span>Tallas</span>' + p.sizes.map(function (size) { return '<b>' + esc(size) + '</b>'; }).join("") + '</div>' : "";
    var orderButton = p.sold
      ? '<button class="whatsapp-order" type="button" disabled>Agotado</button>'
      : '<a class="whatsapp-order" href="' + esc(productWhatsappUrl(p)) + '" target="_blank" rel="noopener noreferrer" aria-label="Pedir ' + esc(p.name) + ' por WhatsApp">Pedir por WhatsApp</a>';
    var a = admin ? '<div class="adm"><button data-a="edit" data-id="' + p.id + '">Editar</button>' +
      '<button data-a="sold" data-id="' + p.id + '">' + (p.sold ? "Disponible" : "Agotado") + "</button>" +
      '<button class="del" data-a="del" data-id="' + p.id + '">Eliminar</button></div>' : "";
    return '<article class="card"><div class="ph">' + img + "</div>" + (p.sold ? '<div class="sold">AGOTADO</div>' : "") +
      '<div class="info"><div class="cat">' + (p.cat === "mujer" ? "Mujer" : "Hombre") + '</div><div class="name">' + esc(p.name) + "</div>" +
      '<p class="desc">' + esc(p.desc) + '</p>' + sizes + '<div class="price">' + money(p.price) + "</div>" + orderButton + a + "</div></article>";
  }).join("");
}

// ===== EVENTOS =====
$("tabs").onclick = function (e) {
  var b = e.target.closest("button"); if (!b) return;
  cat = b.dataset.c;
  [].forEach.call($("tabs").children, function (x) { x.classList.toggle("on", x === b); });
  render();
};

function openForm(p) {
  if (!admin) return;
  $("soldFormOption").hidden = false;
  editId = p ? p.id : null;
  $("formTitle").textContent = p ? "Editar artículo" : "Agregar artículo";
  $("fName").value = p ? p.name : ""; $("fCat").value = p ? p.cat : "mujer";
  $("fPrice").value = p ? p.price : ""; $("fDesc").value = p ? p.desc : ""; $("fImg").value = "";
  [].forEach.call($("fSizes").querySelectorAll('input[type="checkbox"]'), function (box) {
    box.checked = !!(p && Array.isArray(p.sizes) && p.sizes.indexOf(box.value) !== -1);
  });
  $("fSold").checked = !!(p && p.sold);
  $("msg").textContent = p && p.img ? "Deja la foto vacía para conservar la actual." : "";
  $("panel").classList.add("open");
  $("panel").scrollIntoView({ behavior: "smooth", block: "start" });
}
$("newBtn").onclick = function () { openForm(null); };
$("cancel").onclick = function () { $("panel").classList.remove("open"); $("soldFormOption").hidden = true; };

function openAdminModal() {
  $("adminPasswordError").textContent = "";
  $("adminPassword").value = "";
  $("adminModal").hidden = false;
  $("adminPassword").focus();
}
function closeAdminModal() {
  $("adminModal").hidden = true;
  $("adminPassword").value = "";
  $("adminPasswordError").textContent = "";
}
var logoClicks = 0;
var logoClickTimer;
function revealAdmin() {
  $("adminBtn").classList.remove("admin-hidden");
}
$("brandLogo").onclick = function () {
  logoClicks += 1;
  clearTimeout(logoClickTimer);
  logoClickTimer = setTimeout(function () { logoClicks = 0; }, 1200);
  if (logoClicks >= 2) {
    logoClicks = 0;
    revealAdmin();
  }
};
$("brandLogo").onkeydown = function (event) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    $("brandLogo").click();
  }
};
$("adminBtn").onclick = function () {
  if (admin) { admin = false; sessionStorage.removeItem("ac_admin"); $("panel").classList.remove("open"); $("soldFormOption").hidden = true; render(); return; }
  openAdminModal();
};
$("adminPasswordCancel").onclick = closeAdminModal;
$("adminPasswordSubmit").onclick = function () {
  if ($("adminPassword").value === ADMIN_PASSWORD) {
    admin = true;
    sessionStorage.setItem("ac_admin", "1");
    closeAdminModal();
    render();
  } else {
    $("adminPasswordError").textContent = "Contraseña incorrecta.";
    $("adminPassword").select();
  }
};
$("adminPassword").onkeydown = function (event) {
  if (event.key === "Enter") $("adminPasswordSubmit").click();
  if (event.key === "Escape") closeAdminModal();
};

$("save").onclick = async function () {
  var name = $("fName").value.trim();
  if (!name) { $("msg").textContent = "Escribe el nombre del artículo."; return; }
  $("save").disabled = true; $("msg").textContent = "Guardando…";
  try {
    var old = editId ? items.find(function (p) { return p.id === editId; }) : null;
    var img = old ? old.img || "" : "";
    var f = $("fImg").files[0];
    if (f) img = await readImage(f);
    var sizes = [].map.call($("fSizes").querySelectorAll('input[type="checkbox"]:checked'), function (box) { return box.value; });
    var data = { id: editId || "p" + Date.now().toString(36), name: name, cat: $("fCat").value,
      price: Number($("fPrice").value) || 0, desc: $("fDesc").value.trim(), sizes: sizes, img: img,
      sold: $("fSold").checked, t: old ? old.t : Date.now() };
    if (old) items[items.indexOf(old)] = data; else items.push(data);
    persist(); render();
    $("panel").classList.remove("open");
  } catch (e) { $("msg").textContent = "Error al guardar."; }
  $("save").disabled = false;
};

$("grid").onclick = function (e) {
  var b = e.target.closest("button[data-a]"); if (!b) return;
  var p = items.find(function (x) { return x.id === b.dataset.id; }); if (!p) return;
  if (b.dataset.a === "edit") openForm(p);
  else if (b.dataset.a === "sold") { p.sold = !p.sold; persist(); render(); }
  else if (b.dataset.a === "del" && confirm("¿Eliminar «" + p.name + "» del catálogo?")) {
    items = items.filter(function (x) { return x.id !== p.id; }); persist(); render();
  }
};

// ===== INICIO =====
admin = sessionStorage.getItem("ac_admin") === "1";
if (admin) revealAdmin();
initSocialLinks();
load(); render();