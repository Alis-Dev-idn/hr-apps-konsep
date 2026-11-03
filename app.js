/**
 * Upajiwa HRIS & Payroll SaaS - Main Application Controller
 * Mengelola state client-side, localStorage persistence, view router,
 * modal dialogs, konfirmasi tindakan, parser CSV, cetak slip PDF,
 * export Excel dengan Freeze Panes, dan interaktivitas multi-role.
 */

// Key Storage Namespace
const STORAGE_KEYS = {
  ROLE: "upajiwa_active_role",
  EMPLOYEES: "upajiwa_employees",
  USER_PROFILE: "upajiwa_user_profile",
  USER_AVATAR: "upajiwa_user_avatar",
  ATTENDANCE_STATUS: "upajiwa_clockin_status"
};

// State Global Aplikasi
let appState = {
  currentRole: "admin", // 'admin' atau 'pegawai'
  currentView: "dashboard", // 'dashboard', 'pegawai', 'detail-pegawai', 'riwayat-slip-emp', 'absensi', 'payroll', 'laporan', 'import', 'pricing', 'settings'
  employees: [],
  selectedEmployeeForDetail: null,
  selectedEmployeeForSlip: null,
  selectedSlipMonth: null, // Objek bulan slip gaji terpilih
  analyticsRange: "30D",
  analyticsCategory: "employees",
  pricingPeriod: "annual", // 'monthly' atau 'annual'
  searchQuery: "",
  departmentFilter: "all",
  parsedCsvData: [],
  confirmCallback: null
};

// Helper Format Rupiah
function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(number);
}

// Helper Angka Terbilang Bahasa Indonesia
function angkaKeTerbilang(nilai) {
  nilai = Math.floor(Math.abs(nilai));
  const huruf = [
    "", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"
  ];

  if (nilai < 12) return huruf[nilai];
  if (nilai < 20) return angkaKeTerbilang(nilai - 10) + " Belas";
  if (nilai < 100) return angkaKeTerbilang(Math.floor(nilai / 10)) + " Puluh " + huruf[nilai % 10];
  if (nilai < 200) return "Seratus " + angkaKeTerbilang(nilai - 100);
  if (nilai < 1000) return angkaKeTerbilang(Math.floor(nilai / 100)) + " Ratus " + angkaKeTerbilang(nilai % 100);
  if (nilai < 2000) return "Seribu " + angkaKeTerbilang(nilai - 100);
  if (nilai < 1000000) return angkaKeTerbilang(Math.floor(nilai / 1000)) + " Ribu " + angkaKeTerbilang(nilai % 1000);
  if (nilai < 1000000000) return angkaKeTerbilang(Math.floor(nilai / 1000000)) + " Juta " + angkaKeTerbilang(nilai % 1000000);
  if (nilai < 1000000000000) return angkaKeTerbilang(Math.floor(nilai / 1000000000)) + " Miliar " + angkaKeTerbilang(nilai % 1000000000);
  return nilai.toString();
}

// Inisialisasi Data dari LocalStorage / Mock
function initDataStore() {
  const savedEmployees = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
  if (savedEmployees) {
    try {
      appState.employees = JSON.parse(savedEmployees);
    } catch (e) {
      console.warn("Gagal parse saved employees, memuat default.", e);
      appState.employees = [...INITIAL_EMPLOYEES];
      saveEmployees();
    }
  } else {
    appState.employees = [...INITIAL_EMPLOYEES];
    saveEmployees();
  }

  const savedRole = localStorage.getItem(STORAGE_KEYS.ROLE);
  if (savedRole && (savedRole === "admin" || savedRole === "pegawai")) {
    appState.currentRole = savedRole;
  } else {
    appState.currentRole = "admin";
    localStorage.setItem(STORAGE_KEYS.ROLE, "admin");
  }

  const savedProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  if (!savedProfile) {
    const defaultProfile = {
      nama: "Budi Santoso",
      nip: "UPJ-2023-014",
      jabatan: "Senior Software Engineer",
      departemen: "Engineering",
      email: "budi.santoso@upajiwa.id",
      telepon: "+62 812-3456-7890",
      alamat: "Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan"
    };
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(defaultProfile));
  }
}

function saveEmployees() {
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(appState.employees));
}

// Toast Notifikasi
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  const bgColors = {
    success: "bg-[#155E3B] text-white",
    warning: "bg-[#D97706] text-white",
    danger: "bg-[#E11D48] text-white",
    info: "bg-[#13231B] text-white"
  };

  const icons = {
    success: `<svg class="w-5 h-5 mr-2 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
    warning: `<svg class="w-5 h-5 mr-2 text-[#FEF3C7]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
    danger: `<svg class="w-5 h-5 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
    info: `<svg class="w-5 h-5 mr-2 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
  };

  toast.className = `flex items-center px-4 py-3 rounded-2xl shadow-xl transform transition-all duration-300 ease-out translate-y-3 opacity-0 text-sm font-medium ${bgColors[type] || bgColors.success}`;
  toast.innerHTML = `
    ${icons[type] || icons.success}
    <span>${message}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-3", "opacity-0");
  });

  setTimeout(() => {
    toast.classList.add("translate-y-3", "opacity-0");
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Modal Dialog Konfirmasi Reusable
function showConfirmDialog({ title, message, confirmText = "Konfirmasi", cancelText = "Batal", isDanger = false, onConfirm }) {
  const modal = document.getElementById("modal-confirm");
  const titleEl = document.getElementById("confirm-dialog-title");
  const msgEl = document.getElementById("confirm-dialog-message");
  const btnAction = document.getElementById("btn-confirm-action");
  const btnCancel = document.getElementById("btn-confirm-cancel");
  const iconBox = document.getElementById("confirm-dialog-icon-box");

  if (!modal) return;

  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.innerHTML = message;
  if (btnCancel) btnCancel.textContent = cancelText;

  if (btnAction) {
    btnAction.textContent = confirmText;
    if (isDanger) {
      btnAction.className = "px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-sm active:scale-95";
      if (iconBox) {
        iconBox.className = "w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-100 text-rose-600";
        iconBox.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`;
      }
    } else {
      btnAction.className = "px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#155E3B] hover:bg-[#0F462C] transition-all shadow-sm active:scale-95";
      if (iconBox) {
        iconBox.className = "w-12 h-12 rounded-2xl flex items-center justify-center bg-[#E9F5EF] text-[#155E3B]";
        iconBox.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
      }
    }

    btnAction.onclick = () => {
      closeConfirmDialog();
      if (typeof onConfirm === "function") onConfirm();
    };
  }

  modal.classList.remove("hidden");
}

function closeConfirmDialog() {
  const modal = document.getElementById("modal-confirm");
  if (modal) modal.classList.add("hidden");
}

// Router & Navigasi
function setView(viewName) {
  appState.currentView = viewName;

  // View Containers
  const views = [
    "view-login",
    "view-dashboard-admin",
    "view-dashboard-pegawai",
    "view-pegawai",
    "view-detail-pegawai",
    "view-riwayat-slip-emp",
    "view-absensi",
    "view-payroll",
    "view-laporan",
    "view-import",
    "view-pricing",
    "view-settings"
  ];

  views.forEach((v) => {
    const el = document.getElementById(v);
    if (el) el.classList.add("hidden");
  });

  const appLayout = document.getElementById("app-layout");
  const loginLayout = document.getElementById("view-login");

  if (viewName === "login") {
    if (appLayout) appLayout.classList.add("hidden");
    if (loginLayout) loginLayout.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  // Tampilkan container app
  if (loginLayout) loginLayout.classList.add("hidden");
  if (appLayout) appLayout.classList.remove("hidden");

  // Routing View Utama
  if (viewName === "dashboard") {
    const target = appState.currentRole === "admin" ? "view-dashboard-admin" : "view-dashboard-pegawai";
    const el = document.getElementById(target);
    if (el) el.classList.remove("hidden");
    if (appState.currentRole === "admin") {
      renderAdminDashboard();
    } else {
      renderPegawaiDashboard();
    }
  } else {
    const targetId = `view-${viewName}`;
    const el = document.getElementById(targetId);
    if (el) el.classList.remove("hidden");

    if (viewName === "pegawai") renderEmployeeTable();
    if (viewName === "absensi") renderAbsensiTable();
    if (viewName === "payroll") renderPayrollTable();
    if (viewName === "laporan") {
      renderLaporanMatrix();
      renderLaporanChart();
    }
    if (viewName === "riwayat-slip-emp") renderRiwayatSlipEmp();
    if (viewName === "settings") loadSettingsForm();
    if (viewName === "pricing") updatePricingDisplay();
  }

  updateSidebarActiveItem();
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Sembunyikan sidebar di mobile setelah navigasi
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (sidebar && backdrop && !backdrop.classList.contains("hidden")) {
    toggleMobileSidebar();
  }
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (!sidebar || !backdrop) return;

  const isClosed = sidebar.classList.contains("-translate-x-full");
  if (isClosed) {
    sidebar.classList.remove("-translate-x-full");
    backdrop.classList.remove("hidden");
  } else {
    sidebar.classList.add("-translate-x-full");
    backdrop.classList.add("hidden");
  }
}

function updateSidebarActiveItem() {
  const navItems = document.querySelectorAll("[data-nav-view]");
  navItems.forEach((btn) => {
    const target = btn.getAttribute("data-nav-view");
    const isActive = target === appState.currentView;
    if (isActive) {
      btn.className = "w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-[#E9F5EF] text-[#155E3B] font-semibold text-sm transition-all shadow-sm border border-[#155E3B]/10";
      const icon = btn.querySelector("svg");
      if (icon) icon.classList.add("text-[#155E3B]");
    } else {
      btn.className = "w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[#526B5E] hover:text-[#13231B] hover:bg-[#F4F9F5] font-medium text-sm transition-all";
      const icon = btn.querySelector("svg");
      if (icon) icon.classList.remove("text-[#155E3B]");
    }
  });
}

// Simulasi Role Switcher
function switchRole(newRole) {
  if (newRole !== "admin" && newRole !== "pegawai") return;
  appState.currentRole = newRole;
  localStorage.setItem(STORAGE_KEYS.ROLE, newRole);

  updateRoleUI();
  showToast(`Beralih peran ke: ${newRole === "admin" ? "Admin (Sarah Jenkins)" : "Pegawai (Budi Santoso)"}`, "info");

  // Arahkan ke dashboard peran bersangkutan
  setView("dashboard");
}

function updateRoleUI() {
  const isAdmin = appState.currentRole === "admin";

  // Elemen khusus admin
  const adminOnlyElements = document.querySelectorAll(".admin-only");
  adminOnlyElements.forEach((el) => {
    if (isAdmin) {
      el.classList.remove("hidden");
    } else {
      el.classList.add("hidden");
    }
  });

  // Elemen khusus pegawai
  const pegawaiOnlyElements = document.querySelectorAll(".pegawai-only");
  pegawaiOnlyElements.forEach((el) => {
    if (!isAdmin) {
      el.classList.remove("hidden");
    } else {
      el.classList.add("hidden");
    }
  });

  // Badge role aktif di topbar
  const roleBadge = document.getElementById("topbar-role-badge");
  const roleText = document.getElementById("topbar-user-name");
  const roleSub = document.getElementById("topbar-user-role");
  const roleAvatar = document.getElementById("topbar-user-avatar");
  const roleSwitchLabel = document.getElementById("topbar-role-switch-label");

  if (roleSwitchLabel) {
    roleSwitchLabel.textContent = isAdmin ? "Pegawai" : "Admin";
  }

  const customAvatar = localStorage.getItem(STORAGE_KEYS.USER_AVATAR);

  if (isAdmin) {
    if (roleBadge) {
      roleBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span> Mode Admin HR`;
      roleBadge.className = "hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E9F5EF] text-[#155E3B] border border-[#155E3B]/20";
    }
    if (roleText) roleText.textContent = "Sarah Jenkins";
    if (roleSub) roleSub.textContent = "Head of People & Culture";
    if (roleAvatar) roleAvatar.src = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80";
  } else {
    if (roleBadge) {
      roleBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#D97706]"></span> Mode Pegawai Mandiri`;
      roleBadge.className = "hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#D97706] border border-[#D97706]/30";
    }
    if (roleText) roleText.textContent = "Budi Santoso";
    if (roleSub) roleSub.textContent = "Senior Software Engineer";
    if (roleAvatar) roleAvatar.src = customAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
  }
}

// -------------------------------------------------------------
// DASHBOARD ADMIN & CHART HEADCOUNT
// -------------------------------------------------------------
function renderAdminDashboard() {
  const totalEmployees = appState.employees.length;
  const presentEmployees = appState.employees.filter((e) => e.statusKehadiran === "Hadir").length;
  const absentEmployees = appState.employees.filter((e) => e.statusKehadiran !== "Hadir").length;

  const attendancePercent = totalEmployees > 0 ? Math.round((presentEmployees / totalEmployees) * 100) : 92;

  // Update metrik hero
  const totalEl = document.getElementById("metric-total-employees");
  const presentEl = document.getElementById("metric-present-employees");
  const absentEl = document.getElementById("metric-absent-employees");
  const progressBar = document.getElementById("metric-attendance-progress");
  const progressBadge = document.getElementById("metric-attendance-percent-badge");

  if (totalEl) totalEl.textContent = `${totalEmployees} Orang`;
  if (presentEl) presentEl.textContent = `${presentEmployees} Orang`;
  if (absentEl) absentEl.textContent = `${absentEmployees} Orang`;
  if (progressBar) progressBar.style.width = `${attendancePercent}%`;
  if (progressBadge) progressBadge.textContent = `${attendancePercent}% Kehadiran`;

  // Render SVG Chart Headcount
  renderHeadcountChart();
}

function renderHeadcountChart() {
  const chartContainer = document.getElementById("chart-svg-container");
  if (!chartContainer) return;

  const range = appState.analyticsRange;
  const category = appState.analyticsCategory;

  const dataset = ANALYTICS_DATA.categories[category][range] || ANALYTICS_DATA.categories.employees["30D"];
  const labels = ANALYTICS_DATA.labels[range] || [];

  const maxVal = Math.max(...dataset, 10);
  const minVal = Math.min(...dataset, 0);

  const svgWidth = 720;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 24;

  const points = dataset.map((val, idx) => {
    const x = paddingX + (idx / (dataset.length - 1)) * (svgWidth - paddingX * 2);
    const rangeHeight = maxVal - minVal || 1;
    const y = svgHeight - paddingY - ((val - minVal) / rangeHeight) * (svgHeight - paddingY * 2);
    return { x, y, val, label: labels[idx] || `P${idx + 1}` };
  });

  // Buat path kurva halus SVG (Bezier Curve)
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX1 = p0.x + (p1.x - p0.x) / 2;
    const cpY1 = p0.y;
    const cpX2 = p0.x + (p1.x - p0.x) / 2;
    const cpY2 = p1.y;
    pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
  }

  // Path Area Gradasi Bawah
  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  // Render SVG String
  chartContainer.innerHTML = `
    <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="w-full h-56 select-none overflow-visible">
      <defs>
        <linearGradient id="chartEmeraldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#155E3B" stop-opacity="0.28" />
          <stop offset="100%" stop-color="#155E3B" stop-opacity="0.0" />
        </linearGradient>
        <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#155E3B" flood-opacity="0.25" />
        </filter>
      </defs>

      <!-- Grid lines horizontal -->
      <line x1="${paddingX}" y1="${paddingY}" x2="${svgWidth - paddingX}" y2="${paddingY}" stroke="#E2ECE5" stroke-dasharray="4 4" />
      <line x1="${paddingX}" y1="${svgHeight / 2}" x2="${svgWidth - paddingX}" y2="${svgHeight / 2}" stroke="#E2ECE5" stroke-dasharray="4 4" />
      <line x1="${paddingX}" y1="${svgHeight - paddingY}" x2="${svgWidth - paddingX}" y2="${svgHeight - paddingY}" stroke="#E2ECE5" />

      <!-- Area fill -->
      <path d="${areaD}" fill="url(#chartEmeraldGrad)" />

      <!-- Line stroke -->
      <path d="${pathD}" fill="none" stroke="#155E3B" stroke-width="3.5" stroke-linecap="round" filter="url(#glowFilter)" />

      <!-- Dots & Tooltip trigger -->
      ${points
        .map(
          (p, i) => `
        <g class="chart-point-group cursor-pointer group" data-idx="${i}">
          <circle cx="${p.x}" cy="${p.y}" r="5" fill="#FFFFFF" stroke="#155E3B" stroke-width="3" class="transition-all duration-150 group-hover:r-7 group-hover:stroke-[#D97706]" />
          <text x="${p.x}" y="${svgHeight - 6}" font-size="11" font-weight="500" fill="#879B90" text-anchor="middle" font-family="Inter, sans-serif">${p.label}</text>
          
          <!-- Tooltip on hover -->
          <g class="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
            <rect x="${p.x - 36}" y="${p.y - 36}" width="72" height="26" rx="8" fill="#13231B" />
            <polygon points="${p.x - 5},${p.y - 11} ${p.x + 5},${p.y - 11} ${p.x},${p.y - 6}" fill="#13231B" />
            <text x="${p.x}" y="${p.y - 19}" fill="#FFFFFF" font-size="11" font-weight="700" text-anchor="middle" font-family="Plus Jakarta Sans">${p.val} Orang</text>
          </g>
        </g>
      `
        )
        .join("")}
    </svg>
  `;
}

// Event tab analitik
function setAnalyticsRange(range) {
  appState.analyticsRange = range;
  document.querySelectorAll("[data-range-btn]").forEach((btn) => {
    const r = btn.getAttribute("data-range-btn");
    if (r === range) {
      btn.className = "px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#155E3B] text-white shadow-sm transition-all";
    } else {
      btn.className = "px-3 py-1.5 rounded-xl text-xs font-semibold text-[#526B5E] hover:text-[#13231B] hover:bg-[#F4F9F5] transition-all";
    }
  });
  renderHeadcountChart();
}

function setAnalyticsCategory(cat) {
  appState.analyticsCategory = cat;
  document.querySelectorAll("[data-cat-btn]").forEach((btn) => {
    const c = btn.getAttribute("data-cat-btn");
    if (c === cat) {
      btn.className = "px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#155E3B] text-white shadow-sm transition-all";
    } else {
      btn.className = "px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#526B5E] hover:text-[#13231B] hover:bg-[#F4F9F5] transition-all";
    }
  });
  renderHeadcountChart();
}

// -------------------------------------------------------------
// DASHBOARD PEGAWAI (PORTAL MANDIRI)
// -------------------------------------------------------------
function renderPegawaiDashboard() {
  const budiData = appState.employees.find((e) => e.nip === "UPJ-2023-014") || appState.employees[0];
  const greetingEl = document.getElementById("pegawai-greeting-name");
  if (greetingEl && budiData) {
    greetingEl.textContent = `Halo, ${budiData.nama}!`;
  }

  // Update nominal slip bulan berjalan
  const slipAmountEl = document.getElementById("pegawai-latest-slip-amount");
  if (slipAmountEl && budiData) {
    const takeHomePay = budiData.gajiPokok + budiData.tunjanganJabatan + budiData.tunjanganMakanTransport - (budiData.bpjsKetenagakerjaan + budiData.bpjsKesehatan + budiData.pph21);
    slipAmountEl.textContent = formatRupiah(takeHomePay);
  }

  // Sisa cuti
  const sisaCutiEl = document.getElementById("pegawai-sisa-cuti");
  if (sisaCutiEl && budiData) {
    sisaCutiEl.textContent = `${budiData.sisaCuti || 8} Hari`;
  }
}

// Toggle Presensi Clock-In/Clock-Out
function toggleClockInOut() {
  const statusKey = localStorage.getItem(STORAGE_KEYS.ATTENDANCE_STATUS) || "in";
  const btn = document.getElementById("btn-clockin-toggle");
  const badge = document.getElementById("clockin-status-badge");
  const timeText = document.getElementById("clockin-time-text");

  const now = new Date();
  const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";

  if (statusKey === "in") {
    // Clock-out
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE_STATUS, "out");
    if (badge) {
      badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#526B5E]"></span> Sudah Clock-Out Sore`;
      badge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600";
    }
    if (timeText) timeText.textContent = `Waktu Clock-Out: ${timeStr}`;
    if (btn) {
      btn.textContent = "Clock-In Masuk Pagi";
      btn.className = "w-full py-3 px-4 rounded-xl bg-[#155E3B] text-white font-semibold text-sm hover:bg-[#0F462C] transition-all shadow-sm active:scale-95";
    }
    showToast(`Presensi Clock-Out berhasil dicatat pada ${timeStr}`, "info");
  } else {
    // Clock-in
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE_STATUS, "in");
    if (badge) {
      badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span> SUDAH MASUK (ON TIME)`;
      badge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]";
    }
    if (timeText) timeText.textContent = `Waktu Clock-In: ${timeStr}`;
    if (btn) {
      btn.textContent = "Clock-Out Sore";
      btn.className = "w-full py-3 px-4 rounded-xl bg-[#FEF3C7] text-[#D97706] font-semibold text-sm hover:bg-[#FDE68A] transition-all shadow-sm active:scale-95 border border-[#D97706]/30";
    }
    showToast(`Presensi Masuk berhasil dicatat pada ${timeStr}`, "success");
  }
}

// -------------------------------------------------------------
// DATA PEGAWAI (TABEL, SEARCH, FILTER)
// -------------------------------------------------------------
function renderEmployeeTable() {
  const tbody = document.getElementById("employee-table-body");
  const countEl = document.getElementById("employee-count-label");
  const emptyState = document.getElementById("employee-empty-state");
  const tableContainer = document.getElementById("employee-table-container");

  if (!tbody) return;

  const query = appState.searchQuery.toLowerCase().trim();
  const dept = appState.departmentFilter;

  const filtered = appState.employees.filter((emp) => {
    const matchQuery =
      emp.nama.toLowerCase().includes(query) ||
      emp.nip.toLowerCase().includes(query) ||
      emp.jabatan.toLowerCase().includes(query) ||
      emp.departemen.toLowerCase().includes(query);

    const matchDept = dept === "all" || emp.departemen === dept;
    return matchQuery && matchDept;
  });

  if (countEl) {
    countEl.textContent = `Menampilkan ${filtered.length} dari ${appState.employees.length} Pegawai`;
  }

  if (filtered.length === 0) {
    if (tbody) tbody.innerHTML = "";
    if (tableContainer) tableContainer.classList.add("hidden");
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }

  if (tableContainer) tableContainer.classList.remove("hidden");
  if (emptyState) emptyState.classList.add("hidden");

  tbody.innerHTML = filtered
    .map((emp) => {
      // Badge status kehadiran
      const presenceBadge =
        emp.statusKehadiran === "Hadir"
          ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"><span class="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span> Hadir</span>`
          : emp.statusKehadiran === "Izin"
          ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">Izin</span>`
          : emp.statusKehadiran === "Sakit"
          ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF1F2] text-[#E11D48] border border-rose-200">Sakit</span>`
          : `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F0F9FF] text-[#0284C7] border border-sky-200">Cuti</span>`;

      // Badge status kepegawaian
      const contractBadge =
        emp.status === "Tetap"
          ? `<span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">Tetap</span>`
          : emp.status === "Kontrak"
          ? `<span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Kontrak</span>`
          : `<span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Probation</span>`;

      return `
        <tr class="border-b border-[#E2ECE5] hover:bg-[#F4F9F5]/70 transition-colors duration-150 cursor-pointer" onclick="openEmployeeDetailPage(${emp.id});">
          <td class="py-3.5 px-4">
            <div class="flex items-center gap-3">
              <img src="${emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}" alt="${emp.nama}" class="w-10 h-10 rounded-full object-cover ring-2 ring-[#155E3B]/10 shadow-sm" onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'" />
              <div>
                <p class="font-semibold text-[#13231B] text-sm hover:text-[#155E3B] transition-colors">${emp.nama}</p>
                <p class="text-xs text-[#526B5E]">${emp.email}</p>
              </div>
            </div>
          </td>
          <td class="py-3.5 px-4">
            <span class="font-mono text-xs font-semibold px-2 py-1 bg-slate-100 rounded-lg text-slate-700">${emp.nip}</span>
          </td>
          <td class="py-3.5 px-4 text-sm text-[#2D3F35]">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-[#E9F5EF] text-[#155E3B]">
              ${emp.departemen}
            </span>
          </td>
          <td class="py-3.5 px-4 text-sm text-[#2D3F35] font-medium">${emp.jabatan}</td>
          <td class="py-3.5 px-4">${contractBadge}</td>
          <td class="py-3.5 px-4">${presenceBadge}</td>
          <td class="py-3.5 px-4 text-right" onclick="event.stopPropagation();">
            <div class="flex items-center justify-end gap-1.5">
              <button onclick="openEmployeeDetailPage(${emp.id});" title="Buka Halaman Detail Penuh" class="p-2 rounded-xl text-[#155E3B] hover:bg-[#E9F5EF] transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </button>
              <button onclick="openPayslipModalById(${emp.id});" title="Buka Slip Gaji" class="p-2 rounded-xl text-[#D97706] hover:bg-[#FEF3C7] transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function handleEmployeeSearch(val) {
  appState.searchQuery = val;
  renderEmployeeTable();
}

function handleDepartmentFilter(dept) {
  appState.departmentFilter = dept;
  renderEmployeeTable();
}

// -------------------------------------------------------------
// HALAMAN PENUH: DETAIL PEGAWAI & RIWAYAT PAYROLL 12 BULAN (#view-detail-pegawai)
// -------------------------------------------------------------
function openEmployeeDetailPage(empId) {
  const emp = appState.employees.find((e) => e.id === empId);
  if (!emp) return;

  appState.selectedEmployeeForDetail = emp;

  // Isi data profil
  document.getElementById("detail-page-avatar").src = emp.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
  document.getElementById("detail-page-nama").textContent = emp.nama;
  document.getElementById("detail-page-jabatan").textContent = emp.jabatan;
  document.getElementById("detail-page-nip").textContent = emp.nip;
  document.getElementById("detail-page-dept").textContent = emp.departemen;
  document.getElementById("detail-page-tgl").textContent = `Masuk: ${emp.tanggalBergabung || "15 Jan 2023"}`;
  document.getElementById("detail-page-status-badge").textContent = `Karyawan ${emp.status} - Aktif`;

  document.getElementById("detail-page-email").textContent = emp.email;
  document.getElementById("detail-page-telp").textContent = emp.telepon;
  document.getElementById("detail-page-alamat").textContent = emp.alamat || "Jakarta, DKI Jakarta";
  document.getElementById("detail-page-gaji").textContent = formatRupiah(emp.gajiPokok);
  document.getElementById("detail-page-rekening").textContent = emp.rekening || "Bank Mandiri";
  document.getElementById("detail-page-ptkp").textContent = emp.ptkp || "TK/0";
  document.getElementById("detail-page-jam-masuk").textContent = emp.jamMasuk || "08:15 WIB";
  document.getElementById("detail-page-cuti").textContent = `${emp.sisaCuti || 8} Hari`;

  const presensiEl = document.getElementById("detail-page-presensi");
  if (presensiEl) {
    presensiEl.innerHTML =
      emp.statusKehadiran === "Hadir"
        ? `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#059669] border border-emerald-200">Hadir (Tepat Waktu)</span>`
        : `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#D97706] border border-amber-200">${emp.statusKehadiran}</span>`;
  }

  // Generate 12 Bulan Payroll untuk Pegawai Ini
  renderDetailEmployeePayrollHistory(emp);

  // Switch View ke detail pegawai
  setView("detail-pegawai");
}

function renderDetailEmployeePayrollHistory(emp) {
  const tbody = document.getElementById("detail-page-payroll-tbody");
  if (!tbody) return;

  const tunjangan = (emp.tunjanganJabatan || 0) + (emp.tunjanganMakanTransport || 0);
  const deductions = (emp.bpjsKetenagakerjaan || 0) + (emp.bpjsKesehatan || 0) + (emp.pph21 || 0);
  const takeHomePay = emp.gajiPokok + tunjangan - deductions;

  tbody.innerHTML = PAYROLL_MONTHS_12.map((m, idx) => `
    <tr class="border-b border-[#E2ECE5] hover:bg-[#F4F9F5]">
      <td class="py-3 px-3 font-semibold text-[#13231B]">${m.label}</td>
      <td class="py-3 px-3 text-right tabular-nums">${formatRupiah(emp.gajiPokok)}</td>
      <td class="py-3 px-3 text-right text-[#059669] tabular-nums">+${formatRupiah(tunjangan)}</td>
      <td class="py-3 px-3 text-right text-[#E11D48] tabular-nums">-${formatRupiah(deductions)}</td>
      <td class="py-3 px-3 text-right font-bold text-[#155E3B] tabular-nums">${formatRupiah(takeHomePay)}</td>
      <td class="py-3 px-3 text-center">
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
          LUNAS
        </span>
      </td>
      <td class="py-3 px-3 text-right">
        <button onclick="openPayslipModalByMonth(${emp.id}, '${m.key}');" class="px-3 py-1.5 rounded-xl bg-[#E9F5EF] text-[#155E3B] hover:bg-[#155E3B] hover:text-white font-semibold text-xs transition-all shadow-sm">
          Lihat Slip
        </button>
      </td>
    </tr>
  `).join("");
}

// Dialog Konfirmasi Hapus Pegawai
function triggerDeleteEmployee() {
  const emp = appState.selectedEmployeeForDetail;
  if (!emp) return;

  showConfirmDialog({
    title: "Konfirmasi Penghapusan Pegawai",
    message: `Apakah Anda yakin ingin menghapus data pegawai <strong>${emp.nama}</strong> (NIP: ${emp.nip})? Tindakan ini bersifat permanen dan akan menghapus seluruh catatan profil, absensi, serta rekam jejak penggajian terkait.`,
    confirmText: "Ya, Hapus Pegawai",
    cancelText: "Batal",
    isDanger: true,
    onConfirm: () => {
      // Hapus dari state
      appState.employees = appState.employees.filter((e) => e.id !== emp.id);
      saveEmployees();

      showToast(`Pegawai ${emp.nama} (${emp.nip}) berhasil dihapus permanen.`, "danger");

      // Kembali ke tabel pegawai & perbarui dashboard
      setView("pegawai");
      if (appState.currentRole === "admin") {
        renderAdminDashboard();
      }
    }
  });
}

// Modal Edit Pegawai dari Halaman Detail
function openEditEmployeeModal() {
  const emp = appState.selectedEmployeeForDetail;
  if (!emp) return;

  const modal = document.getElementById("modal-edit-pegawai");
  if (!modal) return;

  document.getElementById("form-edit-id").value = emp.id;
  document.getElementById("form-edit-nama").value = emp.nama;
  document.getElementById("form-edit-nip").value = emp.nip;
  document.getElementById("form-edit-dept").value = emp.departemen;
  document.getElementById("form-edit-jabatan").value = emp.jabatan;
  document.getElementById("form-edit-status").value = emp.status;
  document.getElementById("form-edit-email").value = emp.email;
  document.getElementById("form-edit-telp").value = emp.telepon;
  document.getElementById("form-edit-gaji").value = emp.gajiPokok;

  modal.classList.remove("hidden");
}

function closeEditEmployeeModal() {
  const modal = document.getElementById("modal-edit-pegawai");
  if (modal) modal.classList.add("hidden");
}

function handleSaveEditEmployee(event) {
  event.preventDefault();

  const empId = parseInt(document.getElementById("form-edit-id").value, 10);
  const empIdx = appState.employees.findIndex((e) => e.id === empId);
  if (empIdx === -1) return;

  const nama = document.getElementById("form-edit-nama").value.trim();
  const departemen = document.getElementById("form-edit-dept").value;
  const jabatan = document.getElementById("form-edit-jabatan").value.trim();
  const status = document.getElementById("form-edit-status").value;
  const email = document.getElementById("form-edit-email").value.trim();
  const telepon = document.getElementById("form-edit-telp").value.trim();
  const gajiPokok = parseInt(document.getElementById("form-edit-gaji").value, 10) || 10000000;

  // Konfirmasi sebelum menyimpan edit data penting
  showConfirmDialog({
    title: "Konfirmasi Perubahan Data Pegawai",
    message: `Simpan pembaruan untuk pegawai <strong>${nama}</strong> dengan gaji pokok baru sebesar <strong>${formatRupiah(gajiPokok)}</strong>?`,
    confirmText: "Ya, Simpan Perubahan",
    cancelText: "Batal",
    isDanger: false,
    onConfirm: () => {
      appState.employees[empIdx].nama = nama;
      appState.employees[empIdx].departemen = departemen;
      appState.employees[empIdx].jabatan = jabatan;
      appState.employees[empIdx].status = status;
      appState.employees[empIdx].email = email;
      appState.employees[empIdx].telepon = telepon;
      appState.employees[empIdx].gajiPokok = gajiPokok;
      appState.employees[empIdx].tunjanganJabatan = Math.round(gajiPokok * 0.15);
      appState.employees[empIdx].bpjsKetenagakerjaan = Math.round(gajiPokok * 0.02);
      appState.employees[empIdx].bpjsKesehatan = Math.round(gajiPokok * 0.01);
      appState.employees[empIdx].pph21 = Math.round(gajiPokok * 0.08);

      saveEmployees();
      closeEditEmployeeModal();

      // Perbarui halaman detail aktif
      openEmployeeDetailPage(empId);
      showToast(`Perubahan data pegawai "${nama}" berhasil disimpan!`, "success");
    }
  });
}

// -------------------------------------------------------------
// HALAMAN RIWAYAT SLIP GAJI 12 BULAN PEGAWAI (#view-riwayat-slip-emp)
// -------------------------------------------------------------
function renderRiwayatSlipEmp() {
  const budi = appState.employees.find((e) => e.nip === "UPJ-2023-014") || appState.employees[0];
  if (!budi) return;

  const tunjangan = (budi.tunjanganJabatan || 0) + (budi.tunjanganMakanTransport || 0);
  const deductions = (budi.bpjsKetenagakerjaan || 0) + (budi.bpjsKesehatan || 0) + (budi.pph21 || 0);
  const monthlyTakeHome = budi.gajiPokok + tunjangan - deductions;

  const total12M = monthlyTakeHome * 12;

  const totalEl = document.getElementById("riwayat-total-12m");
  const avgEl = document.getElementById("riwayat-avg-12m");
  const tbody = document.getElementById("riwayat-slip-table-body");

  if (totalEl) totalEl.textContent = formatRupiah(total12M);
  if (avgEl) avgEl.textContent = `${formatRupiah(monthlyTakeHome)} / bln`;

  if (tbody) {
    tbody.innerHTML = PAYROLL_MONTHS_12.map((m) => `
      <tr class="border-b border-[#E2ECE5] hover:bg-[#F4F9F5]">
        <td class="py-3.5 px-4 font-semibold text-[#13231B]">${m.label}</td>
        <td class="py-3.5 px-4 text-right tabular-nums text-[#2D3F35]">${formatRupiah(budi.gajiPokok)}</td>
        <td class="py-3.5 px-4 text-right tabular-nums text-[#059669]">+${formatRupiah(tunjangan)}</td>
        <td class="py-3.5 px-4 text-right tabular-nums text-[#E11D48]">-${formatRupiah(deductions)}</td>
        <td class="py-3.5 px-4 text-right font-bold text-[#155E3B] tabular-nums">${formatRupiah(monthlyTakeHome)}</td>
        <td class="py-3.5 px-4 text-center">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            <span class="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span> LUNAS
          </span>
        </td>
        <td class="py-3.5 px-4 text-right">
          <button onclick="openPayslipModalByMonth(${budi.id}, '${m.key}');" class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#155E3B] text-white hover:bg-[#0F462C] font-semibold text-xs transition-all shadow-sm active:scale-95">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            <span>Buka Slip & Unduh PDF</span>
          </button>
        </td>
      </tr>
    `).join("");
  }
}

// -------------------------------------------------------------
// MODUL INPUT ABSENSI ADMIN (#view-absensi)
// -------------------------------------------------------------
function renderAbsensiTable() {
  const tbody = document.getElementById("absensi-table-body");
  if (!tbody) return;

  const total = appState.employees.length;
  const hadir = appState.employees.filter((e) => e.statusKehadiran === "Hadir").length;
  const izin = total - hadir;

  const cTotal = document.getElementById("absensi-count-total");
  const cHadir = document.getElementById("absensi-count-hadir");
  const cIzin = document.getElementById("absensi-count-izin");

  if (cTotal) cTotal.textContent = total;
  if (cHadir) cHadir.textContent = hadir;
  if (cIzin) cIzin.textContent = izin;

  tbody.innerHTML = appState.employees.map((emp) => `
    <tr class="border-b border-[#E2ECE5] hover:bg-[#F4F9F5]">
      <td class="py-3 px-4">
        <div class="flex items-center gap-3">
          <img src="${emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}" alt="${emp.nama}" class="w-8 h-8 rounded-full object-cover ring-1 ring-[#155E3B]/20" />
          <span class="font-semibold text-xs text-[#13231B]">${emp.nama}</span>
        </div>
      </td>
      <td class="py-3 px-4">
        <span class="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-700">${emp.nip}</span>
        <span class="text-xs text-[#526B5E] ml-2">${emp.departemen}</span>
      </td>
      <td class="py-3 px-4 text-center">
        <div class="inline-flex items-center p-1 bg-[#F4F9F5] rounded-xl border border-[#E2ECE5] gap-1">
          <button onclick="setEmployeeAttendance(${emp.id}, 'Hadir');" class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${emp.statusKehadiran === 'Hadir' ? 'bg-[#155E3B] text-white shadow-sm' : 'text-[#526B5E] hover:bg-white'}">Hadir</button>
          <button onclick="setEmployeeAttendance(${emp.id}, 'Izin');" class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${emp.statusKehadiran === 'Izin' ? 'bg-[#D97706] text-white shadow-sm' : 'text-[#526B5E] hover:bg-white'}">Izin</button>
          <button onclick="setEmployeeAttendance(${emp.id}, 'Sakit');" class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${emp.statusKehadiran === 'Sakit' ? 'bg-rose-600 text-white shadow-sm' : 'text-[#526B5E] hover:bg-white'}">Sakit</button>
          <button onclick="setEmployeeAttendance(${emp.id}, 'Alpha');" class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${emp.statusKehadiran === 'Alpha' ? 'bg-slate-700 text-white shadow-sm' : 'text-[#526B5E] hover:bg-white'}">Alpha</button>
        </div>
      </td>
      <td class="py-3 px-4">
        <span class="font-mono text-xs font-semibold text-[#155E3B]">${emp.statusKehadiran === 'Hadir' ? (emp.jamMasuk || '08:15 WIB') : '-'}</span>
      </td>
    </tr>
  `).join("");
}

function setEmployeeAttendance(empId, status) {
  const emp = appState.employees.find((e) => e.id === empId);
  if (!emp) return;

  emp.statusKehadiran = status;
  if (status === "Hadir" && (!emp.jamMasuk || emp.jamMasuk === "-")) {
    emp.jamMasuk = "08:15 WIB";
  }
  saveEmployees();
  renderAbsensiTable();
  if (appState.currentRole === "admin") renderAdminDashboard();
}

function markAllPresent() {
  appState.employees.forEach((e) => {
    e.statusKehadiran = "Hadir";
    e.jamMasuk = "08:15 WIB";
  });
  saveEmployees();
  renderAbsensiTable();
  if (appState.currentRole === "admin") renderAdminDashboard();
  showToast("Seluruh karyawan berhasil ditandai Hadir!", "success");
}

// -------------------------------------------------------------
// MODUL LAPORAN EKSEKUTIF & EXPORT EXCEL DENGAN FREEZE PANES
// -------------------------------------------------------------
function renderLaporanMatrix() {
  const tbody = document.getElementById("laporan-matrix-tbody");
  const tfoot = document.getElementById("laporan-matrix-tfoot");
  const deptFilter = document.getElementById("laporan-filter-dept") ? document.getElementById("laporan-filter-dept").value : "all";

  if (!tbody || !tfoot) return;

  const filtered = appState.employees.filter((e) => deptFilter === "all" || e.departemen === deptFilter);

  const monthlyTotals = new Array(12).fill(0);
  let grandTotalYTD = 0;

  const rowsHtml = filtered.map((emp, idx) => {
    const tunjangan = (emp.tunjanganJabatan || 0) + (emp.tunjanganMakanTransport || 0);
    const deductions = (emp.bpjsKetenagakerjaan || 0) + (emp.bpjsKesehatan || 0) + (emp.pph21 || 0);
    const takeHome = emp.gajiPokok + tunjangan - deductions;
    const ytd = takeHome * 12;

    grandTotalYTD += ytd;

    let cells = "";
    for (let m = 0; m < 12; m++) {
      monthlyTotals[m] += takeHome;
      cells += `<td class="py-2.5 px-3 text-right tabular-nums text-[#2D3F35]">${formatRupiah(takeHome)}</td>`;
    }

    return `
      <tr class="border-b border-[#E2ECE5] hover:bg-[#F4F9F5]">
        <td class="py-2.5 px-3 sticky left-0 z-10 bg-white border-r border-[#E2ECE5] font-mono">${idx + 1}</td>
        <td class="py-2.5 px-3 sticky left-[50px] z-10 bg-white border-r border-[#E2ECE5] font-mono font-semibold">${emp.nip}</td>
        <td class="py-2.5 px-3 sticky left-[160px] z-10 bg-white border-r-2 border-[#155E3B]/40 font-semibold text-[#13231B] shadow-sm">${emp.nama}</td>
        <td class="py-2.5 px-3 text-[#526B5E]">${emp.departemen}</td>
        ${cells}
        <td class="py-2.5 px-4 text-right font-bold text-[#155E3B] bg-[#E9F5EF]/60 tabular-nums">${formatRupiah(ytd)}</td>
      </tr>
    `;
  }).join("");

  tbody.innerHTML = rowsHtml;

  // Grand Total Row
  let totalCells = "";
  for (let m = 0; m < 12; m++) {
    totalCells += `<td class="py-3 px-3 text-right tabular-nums font-bold text-[#155E3B]">${formatRupiah(monthlyTotals[m])}</td>`;
  }

  tfoot.innerHTML = `
    <tr>
      <td colspan="4" class="py-3 px-4 uppercase tracking-wider font-extrabold text-[#155E3B] sticky left-0 z-10 bg-[#E9F5EF] border-r-2 border-[#155E3B]/40">
        TOTAL BEBAN PERUSAHAAN
      </td>
      ${totalCells}
      <td class="py-3 px-4 text-right font-black text-sm text-[#155E3B] bg-[#E9F5EF] tabular-nums">${formatRupiah(grandTotalYTD)}</td>
    </tr>
  `;
}

function renderLaporanChart() {
  const container = document.getElementById("chart-laporan-svg");
  if (!container) return;

  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const expenses = [360, 362, 365, 368, 370, 372, 375, 378, 380, 385, 388, 390]; // dalam Juta Rp
  const headcount = [185, 186, 188, 190, 192, 194, 195, 197, 198, 200, 202, 205]; // orang

  const svgWidth = 800;
  const svgHeight = 220;
  const padX = 50;
  const padY = 30;

  const pointsExpense = expenses.map((val, idx) => {
    const x = padX + (idx / (expenses.length - 1)) * (svgWidth - padX * 2);
    const y = svgHeight - padY - ((val - 350) / (400 - 350)) * (svgHeight - padY * 2);
    return { x, y, val };
  });

  const pointsHc = headcount.map((val, idx) => {
    const x = padX + (idx / (headcount.length - 1)) * (svgWidth - padX * 2);
    const y = svgHeight - padY - ((val - 170) / (220 - 170)) * (svgHeight - padY * 2);
    return { x, y, val };
  });

  let pathExp = `M ${pointsExpense[0].x} ${pointsExpense[0].y}`;
  for (let i = 0; i < pointsExpense.length - 1; i++) {
    const p0 = pointsExpense[i];
    const p1 = pointsExpense[i + 1];
    pathExp += ` C ${p0.x + (p1.x - p0.x)/2} ${p0.y}, ${p0.x + (p1.x - p0.x)/2} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  let pathHc = `M ${pointsHc[0].x} ${pointsHc[0].y}`;
  for (let i = 0; i < pointsHc.length - 1; i++) {
    const p0 = pointsHc[i];
    const p1 = pointsHc[i + 1];
    pathHc += ` C ${p0.x + (p1.x - p0.x)/2} ${p0.y}, ${p0.x + (p1.x - p0.x)/2} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  container.innerHTML = `
    <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="w-full h-56 select-none overflow-visible">
      <!-- Grid -->
      <line x1="${padX}" y1="${padY}" x2="${svgWidth - padX}" y2="${padY}" stroke="#E2ECE5" stroke-dasharray="4 4" />
      <line x1="${padX}" y1="${svgHeight/2}" x2="${svgWidth - padX}" y2="${svgHeight/2}" stroke="#E2ECE5" stroke-dasharray="4 4" />
      <line x1="${padX}" y1="${svgHeight - padY}" x2="${svgWidth - padX}" y2="${svgHeight - padY}" stroke="#E2ECE5" />

      <!-- Expense line (Emerald) -->
      <path d="${pathExp}" fill="none" stroke="#155E3B" stroke-width="3.5" stroke-linecap="round" />

      <!-- Headcount line (Warm Amber) -->
      <path d="${pathHc}" fill="none" stroke="#D97706" stroke-width="2.5" stroke-dasharray="6 4" stroke-linecap="round" />

      <!-- Dots & labels -->
      ${pointsExpense.map((p, i) => `
        <circle cx="${p.x}" cy="${p.y}" r="4" fill="#FFFFFF" stroke="#155E3B" stroke-width="2.5" />
        <circle cx="${pointsHc[i].x}" cy="${pointsHc[i].y}" r="3.5" fill="#FFFFFF" stroke="#D97706" stroke-width="2" />
        <text x="${p.x}" y="${svgHeight - 10}" font-size="11" font-weight="500" fill="#879B90" text-anchor="middle">${months[i]}</text>
      `).join("")}
    </svg>
  `;
}

// Export Excel Menggunakan SheetJS dengan Freeze Panes
function exportLaporanToExcel() {
  if (typeof XLSX === "undefined") {
    showToast("Memuat engine spreadsheet... Coba sesaat lagi.", "warning");
    return;
  }

  const deptFilter = document.getElementById("laporan-filter-dept") ? document.getElementById("laporan-filter-dept").value : "all";
  const filtered = appState.employees.filter((e) => deptFilter === "all" || e.departemen === deptFilter);

  // Buat Data Matriks Excel
  const excelData = [
    ["PT UPAJIWA NUSANTARA TEKNOLOGI"],
    ["LAPORAN MATRIKS PENGGAJIAN & REKAPITULASI SDM TAHUNAN"],
    [`Tahun Anggaran: 2026 | Departemen: ${deptFilter === 'all' ? 'Seluruh Departemen' : deptFilter} | Diekspor: 03 November 2026`],
    [
      "No",
      "NIP",
      "Nama Karyawan",
      "Departemen",
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
      "Total YTD (IDR)"
    ]
  ];

  const monthlySums = new Array(12).fill(0);
  let totalGrandYTD = 0;

  filtered.forEach((emp, idx) => {
    const tunjangan = (emp.tunjanganJabatan || 0) + (emp.tunjanganMakanTransport || 0);
    const deductions = (emp.bpjsKetenagakerjaan || 0) + (emp.bpjsKesehatan || 0) + (emp.pph21 || 0);
    const takeHome = emp.gajiPokok + tunjangan - deductions;
    const ytd = takeHome * 12;

    totalGrandYTD += ytd;

    const row = [
      idx + 1,
      emp.nip,
      emp.nama,
      emp.departemen
    ];

    for (let m = 0; m < 12; m++) {
      monthlySums[m] += takeHome;
      row.push(takeHome);
    }
    row.push(ytd);

    excelData.push(row);
  });

  // Baris Total Bawah
  const totalRow = ["TOTAL", "", "TOTAL BEBAN PERUSAHAAN", ""];
  for (let m = 0; m < 12; m++) {
    totalRow.push(monthlySums[m]);
  }
  totalRow.push(totalGrandYTD);
  excelData.push(totalRow);

  // Buat Worksheet & Workbook
  const ws = XLSX.utils.aoa_to_sheet(excelData);

  // Lebar Kolom yang Rapi
  ws["!cols"] = [
    { wch: 6 },  // No
    { wch: 15 }, // NIP
    { wch: 26 }, // Nama
    { wch: 18 }, // Dept
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 18 }  // Total YTD
  ];

  // Atur Freeze Panes (Kunci Kolom A, B, C, D dan Baris 1-4)
  ws["!views"] = [
    {
      state: "frozen",
      xSplit: 4, // Freeze hingga kolom D
      ySplit: 4, // Freeze hingga baris ke-4
      topLeftCell: "E5",
      activePane: "bottomRight"
    }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Laporan_Payroll_Tahunan_2026");

  // Unduh Berkas
  XLSX.writeFile(wb, "Laporan_Payroll_Tahunan_Upajiwa_2026.xlsx");
  showToast("Berhasil mengekspor Laporan_Payroll_Tahunan_Upajiwa_2026.xlsx dengan Freeze Panes!", "success");
}

// -------------------------------------------------------------
// MODUL PAYROLL & SLIP GAJI RESMI
// -------------------------------------------------------------
function renderPayrollTable() {
  const tbody = document.getElementById("payroll-table-body");
  if (!tbody) return;

  let totalPayroll = 0;

  const rows = appState.employees.map((emp, idx) => {
    const gross = emp.gajiPokok + (emp.tunjanganJabatan || 0) + (emp.tunjanganMakanTransport || 0);
    const deductions = (emp.bpjsKetenagakerjaan || 0) + (emp.bpjsKesehatan || 0) + (emp.pph21 || 0);
    const takeHomePay = gross - deductions;

    totalPayroll += takeHomePay;

    return `
      <tr class="border-b border-[#E2ECE5] hover:bg-[#F4F9F5]/70 transition-colors">
        <td class="py-3.5 px-4 text-xs font-mono text-[#526B5E]">${idx + 1}</td>
        <td class="py-3.5 px-4">
          <div class="flex items-center gap-3">
            <img src="${emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}" alt="${emp.nama}" class="w-8 h-8 rounded-full object-cover ring-1 ring-[#155E3B]/20" />
            <div>
              <p class="font-semibold text-sm text-[#13231B]">${emp.nama}</p>
              <p class="text-xs text-[#526B5E] font-mono">${emp.nip}</p>
            </div>
          </div>
        </td>
        <td class="py-3.5 px-4 text-sm text-[#2D3F35]">${emp.jabatan}</td>
        <td class="py-3.5 px-4 text-sm font-semibold tabular-nums text-right text-[#13231B]">${formatRupiah(emp.gajiPokok)}</td>
        <td class="py-3.5 px-4 text-sm tabular-nums text-right text-[#059669]">+${formatRupiah((emp.tunjanganJabatan || 0) + (emp.tunjanganMakanTransport || 0))}</td>
        <td class="py-3.5 px-4 text-sm tabular-nums text-right text-[#E11D48]">-${formatRupiah(deductions)}</td>
        <td class="py-3.5 px-4 text-sm font-bold tabular-nums text-right text-[#155E3B]">${formatRupiah(takeHomePay)}</td>
        <td class="py-3.5 px-4 text-center">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            <span class="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span> LUNAS
          </span>
        </td>
        <td class="py-3.5 px-4 text-right">
          <button onclick="openPayslipModalById(${emp.id})" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E9F5EF] text-[#155E3B] hover:bg-[#155E3B] hover:text-white font-semibold text-xs transition-all shadow-sm">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Buka Slip
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = rows.join("");

  // Update total beban payroll
  const totalPayrollEl = document.getElementById("payroll-total-expense");
  const avgPayrollEl = document.getElementById("payroll-avg-takehome");

  if (totalPayrollEl) totalPayrollEl.textContent = formatRupiah(totalPayroll);
  if (avgPayrollEl && appState.employees.length > 0) {
    avgPayrollEl.textContent = formatRupiah(Math.round(totalPayroll / appState.employees.length));
  }
}

// Buka Modal Slip Gaji
function openPayslipModalById(empId) {
  const emp = appState.employees.find((e) => e.id === empId);
  if (!emp) return;

  appState.selectedEmployeeForSlip = emp;
  appState.selectedSlipMonth = PAYROLL_MONTHS_12[0]; // Default Oktober 2026

  renderPayslipContent(emp, appState.selectedSlipMonth);

  const modal = document.getElementById("modal-slip-gaji");
  if (modal) {
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
  }
}

function openPayslipModalByMonth(empId, monthKey) {
  const emp = appState.employees.find((e) => e.id === empId);
  if (!emp) return;

  const mObj = PAYROLL_MONTHS_12.find((m) => m.key === monthKey) || PAYROLL_MONTHS_12[0];

  appState.selectedEmployeeForSlip = emp;
  appState.selectedSlipMonth = mObj;

  renderPayslipContent(emp, mObj);

  const modal = document.getElementById("modal-slip-gaji");
  if (modal) {
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
  }
}

function openBudiPayslip() {
  const budi = appState.employees.find((e) => e.nip === "UPJ-2023-014") || appState.employees[0];
  if (budi) openPayslipModalById(budi.id);
}

function closePayslipModal() {
  const modal = document.getElementById("modal-slip-gaji");
  if (modal) modal.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
}

function renderPayslipContent(emp, monthObj) {
  const container = document.getElementById("printable-payslip");
  if (!container) return;

  const m = monthObj || PAYROLL_MONTHS_12[0];

  const tunjanganJabatan = emp.tunjanganJabatan || 0;
  const tunjanganMakan = emp.tunjanganMakanTransport || 0;
  const totalEarnings = emp.gajiPokok + tunjanganJabatan + tunjanganMakan;

  const bpjsKet = emp.bpjsKetenagakerjaan || 0;
  const bpjsKes = emp.bpjsKesehatan || 0;
  const pph21 = emp.pph21 || 0;
  const totalDeductions = bpjsKet + bpjsKes + pph21;

  const takeHomePay = totalEarnings - totalDeductions;
  const terbilangStr = angkaKeTerbilang(takeHomePay) + " Rupiah";

  const docNo = `UPJ/PAY/${m.key.replace("-", "/")}/${String(emp.id).padStart(4, "0")}`;

  container.innerHTML = `
    <div class="relative bg-white p-8 md:p-10 rounded-3xl border border-[#E2ECE5] shadow-xl text-[#13231B] print:p-0 print:border-none print:shadow-none">
      
      <!-- Watermark Cap Sah Diagonal -->
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none opacity-[0.07] z-0">
        <div class="transform -rotate-25 border-8 border-[#155E3B] text-[#155E3B] px-12 py-6 rounded-3xl text-6xl font-black uppercase tracking-widest text-center">
          TERBAYAR & SAH<br/><span class="text-3xl font-bold">PT UPAJIWA NUSANTARA</span>
        </div>
      </div>

      <div class="relative z-10">
        <!-- Kop Surat Faktur Resmi -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b-2 border-[#155E3B] gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-[#155E3B] flex items-center justify-center text-white shadow-md">
              <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v18m0-18C8 3 4 7 4 12c0 4 3 7 8 9m0-21c4 0 8 4 8 9 0 5-4 8-8 9" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold tracking-tight text-[#155E3B]">PT UPAJIWA NUSANTARA TEKNOLOGI</h2>
              <p class="text-xs text-[#526B5E]">Gedung Upajiwa Tower Lt. 18, SCBD Kav. 52-53, Jakarta Selatan</p>
              <p class="text-xs text-[#526B5E]">Telp: (021) 555-0826 · Email: payroll@upajiwa.id · www.upajiwa.id</p>
            </div>
          </div>
          <div class="text-left md:text-right">
            <span class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E9F5EF] text-[#155E3B] border border-[#155E3B]/20 mb-1">
              SLIP GAJI KARYAWAN / PAYSLIP
            </span>
            <p class="text-xs font-mono font-semibold text-[#526B5E]">No: ${docNo}</p>
            <p class="text-xs text-[#526B5E]">Periode: <strong class="text-[#13231B]">${m.label}</strong></p>
          </div>
        </div>

        <!-- Metadata Pegawai -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 py-5 border-b border-[#E2ECE5] text-xs">
          <div class="space-y-1.5">
            <div class="flex justify-between py-0.5"><span class="text-[#526B5E]">Nama Karyawan:</span><strong class="text-[#13231B] font-semibold">${emp.nama}</strong></div>
            <div class="flex justify-between py-0.5"><span class="text-[#526B5E]">NIP Resmi:</span><span class="font-mono font-semibold">${emp.nip}</span></div>
            <div class="flex justify-between py-0.5"><span class="text-[#526B5E]">Departemen:</span><span>${emp.departemen}</span></div>
            <div class="flex justify-between py-0.5"><span class="text-[#526B5E]">Jabatan:</span><span>${emp.jabatan}</span></div>
          </div>
          <div class="space-y-1.5 md:border-l md:border-[#E2ECE5] md:pl-6">
            <div class="flex justify-between py-0.5"><span class="text-[#526B5E]">Status Pajak (PTKP):</span><span>${emp.ptkp || 'TK/0'}</span></div>
            <div class="flex justify-between py-0.5"><span class="text-[#526B5E]">Rekening Transfer:</span><span class="font-mono">${emp.rekening || 'Bank Mandiri'}</span></div>
            <div class="flex justify-between py-0.5"><span class="text-[#526B5E]">Tanggal Pembayaran:</span><span>${m.date}</span></div>
            <div class="flex justify-between py-0.5"><span class="text-[#526B5E]">Status Pencairan:</span><span class="text-[#059669] font-bold">LUNAS / DITRANSFER</span></div>
          </div>
        </div>

        <!-- Tabel Rincian Komparatif 2 Kolom -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          
          <!-- Kolom Pendapatan -->
          <div class="bg-[#F4F9F5]/80 p-4 rounded-2xl border border-[#E2ECE5]">
            <h4 class="text-xs font-bold uppercase tracking-wider text-[#155E3B] pb-2 border-b border-[#E2ECE5] mb-3 flex justify-between items-center">
              <span>PENDAPATAN (EARNINGS)</span>
              <span class="text-[10px] text-[#526B5E]">NOMINAL (IDR)</span>
            </h4>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between items-center py-1 border-b border-dashed border-[#E2ECE5]">
                <span class="text-[#2D3F35]">Gaji Pokok</span>
                <span class="font-semibold tabular-nums">${formatRupiah(emp.gajiPokok)}</span>
              </div>
              <div class="flex justify-between items-center py-1 border-b border-dashed border-[#E2ECE5]">
                <span class="text-[#2D3F35]">Tunjangan Jabatan</span>
                <span class="font-semibold tabular-nums">${formatRupiah(tunjanganJabatan)}</span>
              </div>
              <div class="flex justify-between items-center py-1 border-b border-dashed border-[#E2ECE5]">
                <span class="text-[#2D3F35]">Tunjangan Transport & Makan</span>
                <span class="font-semibold tabular-nums">${formatRupiah(tunjanganMakan)}</span>
              </div>
              <div class="flex justify-between items-center pt-2 font-bold text-sm text-[#155E3B]">
                <span>Total Pendapatan Kotor</span>
                <span class="tabular-nums">${formatRupiah(totalEarnings)}</span>
              </div>
            </div>
          </div>

          <!-- Kolom Potongan -->
          <div class="bg-[#FFF1F2]/40 p-4 rounded-2xl border border-rose-100">
            <h4 class="text-xs font-bold uppercase tracking-wider text-[#E11D48] pb-2 border-b border-rose-100 mb-3 flex justify-between items-center">
              <span>POTONGAN (DEDUCTIONS)</span>
              <span class="text-[10px] text-[#526B5E]">NOMINAL (IDR)</span>
            </h4>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between items-center py-1 border-b border-dashed border-rose-100">
                <span class="text-[#2D3F35]">BPJS Ketenagakerjaan (2%)</span>
                <span class="font-semibold tabular-nums">${formatRupiah(bpjsKet)}</span>
              </div>
              <div class="flex justify-between items-center py-1 border-b border-dashed border-rose-100">
                <span class="text-[#2D3F35]">BPJS Kesehatan (1%)</span>
                <span class="font-semibold tabular-nums">${formatRupiah(bpjsKes)}</span>
              </div>
              <div class="flex justify-between items-center py-1 border-b border-dashed border-rose-100">
                <span class="text-[#2D3F35]">Pajak Penghasilan PPh 21</span>
                <span class="font-semibold tabular-nums">${formatRupiah(pph21)}</span>
              </div>
              <div class="flex justify-between items-center pt-2 font-bold text-sm text-[#E11D48]">
                <span>Total Potongan</span>
                <span class="tabular-nums">-${formatRupiah(totalDeductions)}</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Box Take Home Pay Bersih -->
        <div class="p-5 rounded-2xl bg-[#E9F5EF] border-2 border-[#155E3B] text-[#13231B] mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-[#155E3B]">GAJI BERSIH DITERIMA (TAKE HOME PAY)</p>
            <p class="text-xs italic text-[#526B5E] mt-0.5">Terbilang: ${terbilangStr}</p>
          </div>
          <div class="text-right">
            <p class="text-2xl md:text-3xl font-black text-[#155E3B] tabular-nums tracking-tight">
              ${formatRupiah(takeHomePay)}
            </p>
          </div>
        </div>

        <!-- Tanda Tangan & Footer -->
        <div class="grid grid-cols-2 gap-8 pt-6 border-t border-[#E2ECE5] text-xs text-center text-[#526B5E]">
          <div>
            <p class="mb-12">Disiapkan oleh Bagian Penggajian,<br/><strong class="text-[#13231B]">Finance & Payroll Dept</strong></p>
            <div class="inline-block border-b border-[#526B5E] w-40 mb-1"></div>
            <p class="font-medium text-[#13231B]">Dian Permata, S.E.</p>
            <p class="text-[10px]">Finance & Accounting Manager</p>
          </div>
          <div>
            <p class="mb-12">Disetujui dan Disahkan oleh,<br/><strong class="text-[#13231B]">Head of People & Culture</strong></p>
            <div class="inline-block border-b border-[#526B5E] w-40 mb-1"></div>
            <p class="font-medium text-[#13231B]">Sarah Jenkins, M.Psi.</p>
            <p class="text-[10px]">Head of People & Culture Upajiwa</p>
          </div>
        </div>

        <div class="mt-6 pt-3 border-t border-dashed border-[#E2ECE5] text-[10px] text-[#879B90] text-center">
          Dokumen ini diterbitkan secara otomatis oleh Upajiwa HRIS & Payroll Platform. Sah tanpa tanda tangan basah berdasarkan UU ITE No. 11/2008.
        </div>

      </div>
    </div>
  `;
}

function printPayslip() {
  window.print();
}

// -------------------------------------------------------------
// TAMBAH PEGAWAI MANUAL (#modal-tambah-pegawai)
// -------------------------------------------------------------
function openAddEmployeeModal() {
  const modal = document.getElementById("modal-tambah-pegawai");
  if (!modal) return;

  const nextNum = appState.employees.length + 1;
  const autoNip = `UPJ-2026-${String(nextNum).padStart(3, "0")}`;
  const nipInput = document.getElementById("form-add-nip");
  if (nipInput) nipInput.value = autoNip;

  modal.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
}

function closeAddEmployeeModal() {
  const modal = document.getElementById("modal-tambah-pegawai");
  if (modal) modal.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
}

function handleSaveNewEmployee(event) {
  event.preventDefault();

  const nama = document.getElementById("form-add-nama").value.trim();
  const nip = document.getElementById("form-add-nip").value.trim();
  const departemen = document.getElementById("form-add-dept").value;
  const jabatan = document.getElementById("form-add-jabatan").value.trim();
  const email = document.getElementById("form-add-email").value.trim();
  const telepon = document.getElementById("form-add-telp").value.trim();
  const gajiPokok = parseInt(document.getElementById("form-add-gaji").value, 10) || 10000000;
  const status = document.getElementById("form-add-status").value;

  if (!nama || !nip || !jabatan || !email) {
    showToast("Harap lengkapi semua field wajib!", "danger");
    return;
  }

  const tunjanganJabatan = Math.round(gajiPokok * 0.15);
  const tunjanganMakanTransport = 1000000;
  const bpjsKetenagakerjaan = Math.round(gajiPokok * 0.02);
  const bpjsKesehatan = Math.round(gajiPokok * 0.01);
  const pph21 = Math.round(gajiPokok * 0.08);

  const newEmp = {
    id: Date.now(),
    nip,
    nama,
    jabatan,
    departemen,
    email,
    telepon: telepon || "+62 812-0000-0000",
    alamat: "Jakarta, DKI Jakarta",
    tanggalBergabung: "03 November 2026",
    status,
    statusKehadiran: "Hadir",
    jamMasuk: "08:15 WIB",
    gajiPokok,
    tunjanganJabatan,
    tunjanganMakanTransport,
    bpjsKetenagakerjaan,
    bpjsKesehatan,
    pph21,
    rekening: `Bank Mandiri - 127000${Math.floor(1000000 + Math.random() * 9000000)} a.n ${nama}`,
    ptkp: "TK/0",
    sisaCuti: 12,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  };

  appState.employees.unshift(newEmp);
  saveEmployees();

  closeAddEmployeeModal();
  document.getElementById("form-add-employee").reset();

  renderEmployeeTable();
  if (appState.currentRole === "admin") {
    renderAdminDashboard();
  }

  showToast(`Pegawai baru "${nama}" berhasil disimpan! Total: ${appState.employees.length}`, "success");
}

// -------------------------------------------------------------
// IMPORT CSV DATA PEGAWAI & PAYROLL
// -------------------------------------------------------------
function handleCsvFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.name.endsWith(".csv")) {
    showToast("Format berkas harus berekstensi .csv!", "danger");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    parseAndPreviewCsv(text);
  };
  reader.readAsText(file);
}

function parseAndPreviewCsv(csvContent) {
  const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    showToast("Berkas CSV kosong atau tidak memiliki baris data!", "warning");
    return;
  }

  const parsed = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    if (cols.length >= 4) {
      const nama = cols[0] || `Pegawai Impor ${i}`;
      const nip = cols[1] || `UPJ-2026-${String(200 + i).padStart(3, "0")}`;
      const departemen = cols[2] || "Operations";
      const jabatan = cols[3] || "Staff";
      const email = cols[4] || `${nama.toLowerCase().replace(/\s+/g, ".")}@upajiwa.id`;
      const telepon = cols[5] || "+62 812-9988-1122";
      const gajiPokok = parseInt(cols[6], 10) || 9000000;
      const status = cols[7] || "Tetap";

      parsed.push({
        id: Date.now() + i,
        nama,
        nip,
        departemen,
        jabatan,
        email,
        telepon,
        gajiPokok,
        status,
        statusKehadiran: "Hadir",
        jamMasuk: "08:15 WIB",
        tunjanganJabatan: Math.round(gajiPokok * 0.15),
        tunjanganMakanTransport: 1000000,
        bpjsKetenagakerjaan: Math.round(gajiPokok * 0.02),
        bpjsKesehatan: Math.round(gajiPokok * 0.01),
        pph21: Math.round(gajiPokok * 0.08),
        rekening: `Bank Mandiri - 127000${Math.floor(1000000 + Math.random() * 9000000)} a.n ${nama}`,
        ptkp: "TK/0",
        sisaCuti: 12,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
      });
    }
  }

  appState.parsedCsvData = parsed;
  renderCsvPreviewTable(parsed);
}

function renderCsvPreviewTable(data) {
  const container = document.getElementById("csv-preview-container");
  const countBadge = document.getElementById("csv-valid-count-badge");
  const tbody = document.getElementById("csv-preview-tbody");
  const btnExecute = document.getElementById("btn-execute-csv-import");

  if (!container || !tbody) return;

  if (countBadge) countBadge.textContent = `${data.length} Baris Valid Siap Diimpor`;
  if (btnExecute) btnExecute.disabled = data.length === 0;

  tbody.innerHTML = data
    .slice(0, 6)
    .map(
      (row, idx) => `
      <tr class="border-b border-[#E2ECE5] hover:bg-[#F4F9F5]">
        <td class="py-2.5 px-3 text-xs text-[#526B5E]">${idx + 1}</td>
        <td class="py-2.5 px-3 text-xs font-semibold text-[#13231B]">${row.nama}</td>
        <td class="py-2.5 px-3 text-xs font-mono">${row.nip}</td>
        <td class="py-2.5 px-3 text-xs">${row.departemen}</td>
        <td class="py-2.5 px-3 text-xs">${row.jabatan}</td>
        <td class="py-2.5 px-3 text-xs font-semibold tabular-nums text-right text-[#155E3B]">${formatRupiah(row.gajiPokok)}</td>
      </tr>
    `
    )
    .join("");

  container.classList.remove("hidden");
  showToast(`Berhasil membaca ${data.length} baris dari berkas CSV!`, "info");
}

function executeCsvImport() {
  if (appState.parsedCsvData.length === 0) {
    showToast("Tidak ada data untuk diimpor!", "warning");
    return;
  }

  const count = appState.parsedCsvData.length;
  appState.employees = [...appState.parsedCsvData, ...appState.employees];
  saveEmployees();

  appState.parsedCsvData = [];
  const container = document.getElementById("csv-preview-container");
  if (container) container.classList.add("hidden");

  const fileInput = document.getElementById("csv-file-input");
  if (fileInput) fileInput.value = "";

  showToast(`Sukses mengimpor ${count} pegawai baru ke sistem!`, "success");

  setTimeout(() => {
    setView("pegawai");
  }, 700);
}

// -------------------------------------------------------------
// PENGATURAN PROFIL & UPLOAD AVATAR (USER SETTINGS)
// -------------------------------------------------------------
function loadSettingsForm() {
  const profileStr = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  let profile = null;
  try {
    profile = JSON.parse(profileStr);
  } catch (e) {
    profile = null;
  }

  if (!profile) {
    profile = {
      nama: "Budi Santoso",
      nip: "UPJ-2023-014",
      jabatan: "Senior Software Engineer",
      departemen: "Engineering",
      email: "budi.santoso@upajiwa.id",
      telepon: "+62 812-3456-7890",
      alamat: "Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan"
    };
  }

  const nameInput = document.getElementById("settings-nama");
  const emailInput = document.getElementById("settings-email");
  const telpInput = document.getElementById("settings-telp");
  const alamatInput = document.getElementById("settings-alamat");
  const nipInput = document.getElementById("settings-nip");
  const jabatanInput = document.getElementById("settings-jabatan");
  const previewImg = document.getElementById("settings-avatar-preview");

  if (nameInput) nameInput.value = profile.nama || "";
  if (emailInput) emailInput.value = profile.email || "";
  if (telpInput) telpInput.value = profile.telepon || "";
  if (alamatInput) alamatInput.value = profile.alamat || "";
  if (nipInput) nipInput.value = profile.nip || "UPJ-2023-014";
  if (jabatanInput) jabatanInput.value = profile.jabatan || "Senior Software Engineer";

  const savedAvatar = localStorage.getItem(STORAGE_KEYS.USER_AVATAR);
  if (previewImg) {
    previewImg.src = savedAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
  }
}

function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast("Berkas harus berupa gambar (PNG/JPG/WEBP)!", "danger");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const dataUrl = e.target.result;
    localStorage.setItem(STORAGE_KEYS.USER_AVATAR, dataUrl);

    const previewImg = document.getElementById("settings-avatar-preview");
    if (previewImg) previewImg.src = dataUrl;

    if (appState.currentRole === "pegawai") {
      const topbarAvatar = document.getElementById("topbar-user-avatar");
      if (topbarAvatar) topbarAvatar.src = dataUrl;
    }

    showToast("Foto profil baru berhasil diunggah & disimpan!", "success");
  };
  reader.readAsDataURL(file);
}

function handleSaveSettings(event) {
  event.preventDefault();

  const nama = document.getElementById("settings-nama").value.trim();
  const email = document.getElementById("settings-email").value.trim();
  const telepon = document.getElementById("settings-telp").value.trim();
  const alamat = document.getElementById("settings-alamat").value.trim();

  showConfirmDialog({
    title: "Konfirmasi Perubahan Profil",
    message: `Simpan pembaruan data kontak untuk akun <strong>${nama}</strong>?`,
    confirmText: "Ya, Simpan Profil",
    cancelText: "Batal",
    isDanger: false,
    onConfirm: () => {
      const profile = {
        nama,
        nip: "UPJ-2023-014",
        jabatan: "Senior Software Engineer",
        departemen: "Engineering",
        email,
        telepon,
        alamat
      };

      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));

      const budiIdx = appState.employees.findIndex((e) => e.nip === "UPJ-2023-014");
      if (budiIdx !== -1) {
        appState.employees[budiIdx].nama = nama;
        appState.employees[budiIdx].email = email;
        appState.employees[budiIdx].telepon = telepon;
        appState.employees[budiIdx].alamat = alamat;
        saveEmployees();
      }

      updateRoleUI();
      showToast("Pengaturan profil berhasil disimpan!", "success");
    }
  });
}

// -------------------------------------------------------------
// KATALOG PAKET BUNDLE SAAS (PRICING RP 12.500)
// -------------------------------------------------------------
function setPricingPeriod(period) {
  appState.pricingPeriod = period;
  updatePricingDisplay();
}

function updatePricingDisplay() {
  const isAnnual = appState.pricingPeriod === "annual";

  const btnAnnual = document.getElementById("btn-billing-annual");
  const btnMonthly = document.getElementById("btn-billing-monthly");

  if (btnAnnual && btnMonthly) {
    if (isAnnual) {
      btnAnnual.className = "px-4 py-2 rounded-xl text-xs font-bold bg-[#155E3B] text-white shadow-sm transition-all";
      btnMonthly.className = "px-4 py-2 rounded-xl text-xs font-semibold text-[#526B5E] hover:text-[#13231B] transition-all";
    } else {
      btnMonthly.className = "px-4 py-2 rounded-xl text-xs font-bold bg-[#155E3B] text-white shadow-sm transition-all";
      btnAnnual.className = "px-4 py-2 rounded-xl text-xs font-semibold text-[#526B5E] hover:text-[#13231B] transition-all";
    }
  }

  // Harga paket Pro Rp 12.500 / Rp 10.000
  const pricePro = document.getElementById("pricing-growth-amount");
  const periodPro = document.getElementById("pricing-growth-period");

  if (pricePro) {
    pricePro.textContent = isAnnual ? "Rp 10.000" : "Rp 12.500";
  }
  if (periodPro) {
    periodPro.textContent = isAnnual ? "/ karyawan / bulan (ditagih tahunan)" : "/ karyawan / bulan";
  }
}

function selectPricingPlan(planName) {
  showToast(`Simulasi memilih paket ${planName}! Fitur langganan siap diintegrasikan.`, "success");
}

// -------------------------------------------------------------
// INISIALISASI PADA SAAT DOKUMEN SIAP
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initDataStore();
  updateRoleUI();

  // Buka Dashboard langsung
  setView("dashboard");

  // Inisialisasi Event Listener Search
  const searchInput = document.getElementById("employee-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => handleEmployeeSearch(e.target.value));
  }

  // File Input CSV
  const csvInput = document.getElementById("csv-file-input");
  if (csvInput) {
    csvInput.addEventListener("change", handleCsvFileSelect);
  }

  // File Input Avatar
  const avatarInput = document.getElementById("settings-avatar-input");
  if (avatarInput) {
    avatarInput.addEventListener("change", handleAvatarUpload);
  }

  // Form Tambah Pegawai
  const formAdd = document.getElementById("form-add-employee");
  if (formAdd) {
    formAdd.addEventListener("submit", handleSaveNewEmployee);
  }

  // Form Edit Pegawai
  const formEdit = document.getElementById("form-edit-employee");
  if (formEdit) {
    formEdit.addEventListener("submit", handleSaveEditEmployee);
  }

  // Form Settings
  const formSettings = document.getElementById("form-settings");
  if (formSettings) {
    formSettings.addEventListener("submit", handleSaveSettings);
  }

  // Close modals on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeConfirmDialog();
      closeEditEmployeeModal();
      closeAddEmployeeModal();
      closePayslipModal();
    }
  });
});
