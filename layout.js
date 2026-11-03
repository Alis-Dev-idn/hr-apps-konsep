/**
 * Upajiwa HRIS & Payroll SaaS - Shared Layout & Navigation Component
 * Tema Desain: "Living Forest Canvas" (Deep Emerald #0D6840, Sage Canvas #E8F4EC, Warm Ochre #D97706, Mint #10B981)
 * Sesuai referensi visual assets/Dashboard.png, assets/colors.png, dan assets/icon.png
 */

// Key Storage
const STORAGE_KEY_ROLE = 'upajiwa_active_role';
const STORAGE_KEY_EMPLOYEES = 'upajiwa_employees_data';
const STORAGE_KEY_PAYROLL_CUSTOM = 'upajiwa_payroll_custom_data';
const STORAGE_KEY_PAYROLL_LOCKED = 'upajiwa_payroll_is_locked';

// Helper get current active role
function getActiveRole() {
  return localStorage.getItem(STORAGE_KEY_ROLE) || 'admin';
}

function setActiveRole(role) {
  localStorage.setItem(STORAGE_KEY_ROLE, role);
}

// Inisialisasi data pegawai di localStorage jika belum ada
function initLocalEmployees() {
  const existing = localStorage.getItem(STORAGE_KEY_EMPLOYEES);
  if (!existing && typeof INITIAL_EMPLOYEES !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
  }
}

function getLocalEmployees() {
  initLocalEmployees();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_EMPLOYEES)) || [];
  } catch (e) {
    return typeof INITIAL_EMPLOYEES !== 'undefined' ? INITIAL_EMPLOYEES : [];
  }
}

function saveLocalEmployees(list) {
  localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(list));
}

// Helper Payroll Customization (Potongan & Tunjangan Dinamis)
function getPayrollCustomData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_PAYROLL_CUSTOM)) || {};
  } catch (e) {
    return {};
  }
}

function savePayrollCustomData(data) {
  localStorage.setItem(STORAGE_KEY_PAYROLL_CUSTOM, JSON.stringify(data));
}

function isPayrollLocked() {
  return localStorage.getItem(STORAGE_KEY_PAYROLL_LOCKED) === 'true';
}

function setPayrollLocked(locked) {
  localStorage.setItem(STORAGE_KEY_PAYROLL_LOCKED, locked ? 'true' : 'false');
}

// Render Global Sidebar & Topbar Shell
function initAppShell(activePage) {
  initLocalEmployees();
  const currentRole = getActiveRole();

  const mobileDrawer = document.getElementById('mobile-drawer');
  const desktopSidebar = document.getElementById('desktop-sidebar');
  const topbar = document.getElementById('topbar');

  const navItemsAdmin = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', href: 'dashboard.html' },
    { id: 'pegawai', label: 'Employees', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', href: 'pegawai.html' },
    { id: 'absensi', label: 'Attendance', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', href: 'absensi.html' },
    { id: 'payroll', label: 'Payroll', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', href: 'payroll.html' },
    { id: 'laporan', label: 'Reports & Audit', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', href: 'laporan.html' },
    { id: 'pricing', label: 'Subscription Plans', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', href: 'pricing.html' },
    { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z', href: 'settings.html' }
  ];

  const navItemsEmployee = [
    { id: 'dashboard', label: 'My Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', href: 'dashboard.html' },
    { id: 'absensi', label: 'My Attendance', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', href: 'absensi.html' },
    { id: 'settings', label: 'Profile Settings', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', href: 'settings.html' }
  ];

  const navItems = currentRole === 'admin' ? navItemsAdmin : navItemsEmployee;

  const renderNavLinks = () => {
    return navItems.map(item => {
      const isActive = activePage === item.id;
      return `
        <a href="${item.href}" class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
          isActive 
            ? 'bg-[#DDF2E4] text-[#0D6840] shadow-sm font-bold' 
            : 'text-white/80 hover:text-white hover:bg-white/10'
        }">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="${item.icon}"/>
          </svg>
          <span class="truncate">${item.label}</span>
        </a>
      `;
    }).join('');
  };

  // Content Desktop Sidebar (Deep Emerald #0D6840)
  if (desktopSidebar) {
    desktopSidebar.innerHTML = `
      <div class="h-full flex flex-col justify-between p-5 bg-[#0D6840] text-white select-none">
        <div>
          <!-- Brand Logo & Header sesuai assets/Dashboard.png -->
          <div class="flex items-center gap-3.5 px-2 py-3 mb-6">
            <div class="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center p-1.5 flex-shrink-0">
              <img src="assets/icon.png" alt="Upajiwa Logo" class="w-full h-full object-contain">
            </div>
            <div>
              <div class="font-heading font-extrabold text-xl text-white tracking-tight leading-none">Upajiwa</div>
              <div class="text-[11px] text-emerald-200/90 font-medium tracking-wide mt-1">Enterprise Workspace</div>
            </div>
          </div>

          <!-- Mode Indicator Pill -->
          <div class="mb-5 px-3.5 py-2.5 bg-[#094F30] rounded-2xl border border-white/10 flex items-center justify-between">
            <span class="text-xs text-emerald-200 font-medium">Mode:</span>
            <span class="text-xs font-bold px-2.5 py-1 rounded-xl ${currentRole === 'admin' ? 'bg-[#DDF2E4] text-[#0D6840]' : 'bg-amber-400 text-slate-900'}">
              ${currentRole === 'admin' ? 'HR Administrator' : 'Karyawan (ESS)'}
            </span>
          </div>

          <!-- Nav Menu List -->
          <nav class="space-y-2" id="desktop-nav-list">
            ${renderNavLinks()}
          </nav>
        </div>

        <!-- User Quick Switch & Logout -->
        <div class="pt-4 border-t border-white/15 space-y-3">
          <div class="p-3 bg-[#094F30] rounded-2xl border border-white/10 flex items-center gap-3">
            <div class="w-10 h-10 rounded-full ${currentRole === 'admin' ? 'bg-[#155E3B]' : 'bg-amber-600'} flex items-center justify-center font-bold text-white text-xs ring-2 ring-white/20">
              ${currentRole === 'admin' ? 'SJ' : 'BS'}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-white truncate">${currentRole === 'admin' ? 'Sarah Jenkins' : 'Budi Santoso'}</p>
              <p class="text-[11px] text-emerald-200/80 truncate">${currentRole === 'admin' ? 'Head of People & Culture' : 'Senior Frontend Engineer'}</p>
            </div>
          </div>
          <a href="index.html" class="flex items-center justify-center gap-2 w-full py-2.5 px-3 text-xs font-bold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Keluar Sesi
          </a>
        </div>
      </div>
    `;
  }

  // Content Mobile Drawer
  if (mobileDrawer) {
    mobileDrawer.innerHTML = `
      <div id="mobile-drawer-backdrop" onclick="toggleMobileDrawer(false)" class="fixed inset-0 bg-[#13231B]/60 backdrop-blur-xs z-40 hidden transition-opacity"></div>
      <div id="mobile-drawer-panel" class="fixed top-0 bottom-0 left-0 w-72 bg-[#0D6840] text-white z-50 transform -translate-x-full transition-transform duration-300 ease-in-out flex flex-col justify-between p-5 shadow-2xl">
        <div>
          <!-- Mobile Drawer Header -->
          <div class="flex items-center justify-between px-2 py-3 mb-6 border-b border-white/15">
            <div class="flex items-center gap-3">
              <img src="assets/icon.png" alt="Upajiwa Logo" class="w-8 h-8 object-contain">
              <div>
                <span class="font-heading font-extrabold text-lg text-white">Upajiwa</span>
                <span class="block text-[10px] text-emerald-200 font-medium">Enterprise Workspace</span>
              </div>
            </div>
            <button onclick="toggleMobileDrawer(false)" class="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Role Indicator Pill Mobile -->
          <div class="mb-4 px-3 py-2 bg-[#094F30] rounded-xl border border-white/10 flex items-center justify-between">
            <span class="text-xs text-emerald-200">Mode:</span>
            <span class="text-xs font-bold px-2 py-0.5 rounded-lg ${currentRole === 'admin' ? 'bg-[#DDF2E4] text-[#0D6840]' : 'bg-amber-400 text-slate-900'}">
              ${currentRole === 'admin' ? 'HR Administrator' : 'Karyawan (ESS)'}
            </span>
          </div>

          <!-- Nav Menu Mobile -->
          <nav class="space-y-1.5">
            ${renderNavLinks()}
          </nav>
        </div>

        <div class="pt-4 border-t border-white/15">
          <a href="index.html" class="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 rounded-xl">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Keluar Sesi
          </a>
        </div>
      </div>
    `;
  }

  // Content Topbar (Floating Emerald Header Bar)
  if (topbar) {
    topbar.innerHTML = `
      <div class="px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div class="flex items-center justify-between gap-4">
          <!-- Left: Hamburger (Mobile) & Title Eyebrow -->
          <div class="flex items-center gap-3">
            <button onclick="toggleMobileDrawer(true)" class="p-2.5 md:hidden bg-white text-[#0D6840] hover:bg-[#DDF2E4] rounded-2xl shadow-sm border border-[#D5E7DC] transition-colors" aria-label="Buka Menu">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <div class="hidden sm:block">
              <span class="text-xs font-semibold text-[#567364] tracking-wide uppercase">Workspace &bull; PT Maju Bersama Sejahtera</span>
            </div>
          </div>

          <!-- Right: Floating Emerald Pill (Persis kanan atas Dashboard.png) -->
          <div class="bg-[#0D6840] text-white px-4 py-2 rounded-2xl sm:rounded-full shadow-lg shadow-[#0D6840]/20 flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
            <!-- Search Input Field (Kapsul Mint Putih) -->
            <div class="relative hidden lg:block w-72">
              <input type="text" placeholder="Search employees, reports, documents..." class="w-full pl-9 pr-3 py-1.5 bg-[#EAF5EF] text-[#13231B] placeholder-[#567364] text-xs font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-300">
              <svg class="w-4 h-4 text-[#567364] absolute left-3 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>

            <!-- Role Switcher -->
            <div class="flex items-center bg-[#094F30] p-1 rounded-xl">
              <button onclick="switchRole('admin')" class="px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                currentRole === 'admin' ? 'bg-[#DDF2E4] text-[#0D6840] shadow-xs' : 'text-white/80 hover:text-white'
              }">Admin</button>
              <button onclick="switchRole('employee')" class="px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                currentRole === 'employee' ? 'bg-amber-400 text-slate-900 shadow-xs' : 'text-white/80 hover:text-white'
              }">Karyawan</button>
            </div>

            <!-- Profile Info & Notification Bell -->
            <div class="flex items-center gap-2.5 border-l border-white/20 pl-3">
              <div class="hidden sm:block text-right">
                <p class="text-xs font-bold leading-tight text-white">${currentRole === 'admin' ? 'Sarah Jenkins' : 'Budi Santoso'}</p>
                <p class="text-[10px] text-emerald-200 leading-tight">${currentRole === 'admin' ? 'Head of People & Culture' : 'Senior Frontend Engineer'}</p>
              </div>
              <a href="settings.html" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-xs font-extrabold text-white ring-2 ring-white/30 transition-all">
                ${currentRole === 'admin' ? 'SJ' : 'BS'}
              </a>
              <button class="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors" title="Notifikasi">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  injectModalsContainer();
}

function toggleMobileDrawer(open) {
  const backdrop = document.getElementById('mobile-drawer-backdrop');
  const panel = document.getElementById('mobile-drawer-panel');
  if (!backdrop || !panel) return;

  if (open) {
    backdrop.classList.remove('hidden');
    setTimeout(() => {
      panel.classList.remove('-translate-x-full');
    }, 10);
  } else {
    panel.classList.add('-translate-x-full');
    setTimeout(() => {
      backdrop.classList.add('hidden');
    }, 300);
  }
}

function switchRole(role) {
  if (role === getActiveRole()) return;
  setActiveRole(role);
  window.location.reload();
}

// Modal Konfirmasi Reusable
let confirmCallback = null;
function showConfirmDialog(title, message, confirmBtnText = 'Ya, Lanjutkan', isDanger = false, callback) {
  const modal = document.getElementById('global-confirm-modal');
  const titleEl = document.getElementById('confirm-modal-title');
  const msgEl = document.getElementById('confirm-modal-message');
  const btnEl = document.getElementById('confirm-modal-btn');
  
  if (!modal || !titleEl || !msgEl || !btnEl) return;

  titleEl.textContent = title;
  msgEl.textContent = message;
  btnEl.textContent = confirmBtnText;

  if (isDanger) {
    btnEl.className = 'px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md';
  } else {
    btnEl.className = 'px-4 py-2 bg-[#0D6840] hover:bg-[#094F30] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md';
  }

  confirmCallback = callback;
  modal.classList.remove('hidden');
}

function closeConfirmDialog() {
  const modal = document.getElementById('global-confirm-modal');
  if (modal) modal.classList.add('hidden');
  confirmCallback = null;
}

function executeConfirmAction() {
  if (typeof confirmCallback === 'function') {
    confirmCallback();
  }
  closeConfirmDialog();
}

// Toast Notifikasi Reusable
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-[#0D6840] text-white' : type === 'error' ? 'bg-rose-600 text-white' : 'bg-[#13231B] text-white';
  const iconSvg = type === 'success' 
    ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>' 
    : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>';

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-semibold transform transition-all duration-300 translate-y-2 opacity-0 ${bgColor} border border-white/10`;
  toast.innerHTML = `
    <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">${iconSvg}</svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Injeksi Container Modal Global
function injectModalsContainer() {
  if (document.getElementById('global-confirm-modal')) return;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <!-- Modal Konfirmasi Reusable -->
    <div id="global-confirm-modal" class="fixed inset-0 bg-[#13231B]/70 backdrop-blur-xs z-50 hidden flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#D5E7DC] transform transition-all">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-2xl bg-amber-50 text-[#D97706] border border-amber-200 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <div>
            <h3 id="confirm-modal-title" class="font-heading font-black text-lg text-[#13231B]">Konfirmasi Tindakan</h3>
            <p id="confirm-modal-message" class="text-xs sm:text-sm text-[#4A6356] mt-1 leading-relaxed">Apakah Anda yakin ingin melanjutkan tindakan ini?</p>
          </div>
        </div>
        <div class="mt-6 flex items-center justify-end gap-3">
          <button onclick="closeConfirmDialog()" class="px-4 py-2 border border-[#D5E7DC] hover:bg-[#E8F4EC] text-[#334D40] font-semibold text-xs sm:text-sm rounded-xl transition-colors">Batal</button>
          <button id="confirm-modal-btn" onclick="executeConfirmAction()" class="px-4 py-2 bg-[#0D6840] hover:bg-[#094F30] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md">Ya, Lanjutkan</button>
        </div>
      </div>
    </div>

    <!-- Modal Slip Gaji Resmi Standar Kertas A4 (Print-Ready) -->
    <div id="modal-slip-gaji" class="fixed inset-0 bg-[#13231B]/75 backdrop-blur-xs z-50 hidden overflow-y-auto p-2 sm:p-6 flex items-start justify-center">
      <div class="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full shadow-2xl border border-[#D5E7DC] my-3 sm:my-8 overflow-hidden relative">
        
        <!-- Header Modal Slip (Sticky di Layar, 100% Sembunyi Saat Print) -->
        <div class="sticky top-0 z-20 flex items-center justify-between px-3.5 py-3 sm:px-6 sm:py-4 border-b border-[#D5E7DC] bg-[#E8F4EC] no-print shadow-xs">
          <div class="flex items-center gap-2 sm:gap-2.5 min-w-0 pr-2">
            <div class="w-7 h-7 rounded-lg bg-[#0D6840] flex items-center justify-center p-1 flex-shrink-0">
              <img src="assets/icon.png" class="w-full h-full object-contain">
            </div>
            <span class="font-heading font-bold text-[#13231B] text-xs sm:text-base truncate">Pratinjau Slip Gaji A4</span>
          </div>
          <div class="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button onclick="window.print()" class="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#0D6840] hover:bg-[#094F30] text-white rounded-xl text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-colors shadow-sm">
              <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
              </svg>
              <span>Cetak<span class="hidden sm:inline"> / Simpan PDF</span></span>
            </button>
            <button onclick="closePayslipModal()" class="p-1.5 sm:p-2 text-[#567364] hover:text-[#13231B] rounded-xl hover:bg-[#DDF2E4]">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Printable Document Lembar Kertas A4 Utuh -->
        <div id="printable-payslip" class="p-4 sm:p-10 bg-white text-[#13231B] text-xs sm:text-sm">
          <!-- Dynamic Slip Content Generated via openPayslipModalById -->
        </div>
      </div>
    </div>

    <!-- Toast Container -->
    <div id="toast-container" class="fixed bottom-5 right-5 z-50 space-y-2 max-w-sm pointer-events-none"></div>
  `;
  document.body.appendChild(wrapper);
}

// Buka Slip Gaji A4 yang membaca komponen penyesuaian potongan dinamis
function openPayslipModalById(empId, monthLabel = 'Oktober 2026') {
  const employees = getLocalEmployees();
  const emp = employees.find(e => e.id === empId) || employees[0] || {
    id: 'UP-001',
    nama: 'Budi Santoso',
    jabatan: 'Senior Frontend Engineer',
    departemen: 'Teknologi',
    gajiPokok: 15000000,
    tunjangan: 3000000,
    potongan: 450000
  };

  // Baca penyesuaian kustom dari localStorage jika ada
  const customMap = getPayrollCustomData();
  const custom = customMap[emp.id] || null;

  const gajiPokok = custom ? custom.gajiPokok : (emp.gajiPokok || 15000000);
  const tunjangan = custom ? custom.tunjangan : (emp.tunjangan || 3000000);
  
  // Rincian potongan default atau kustom
  let potonganItems = [];
  if (custom && custom.potonganItems && custom.potonganItems.length > 0) {
    potonganItems = custom.potonganItems;
  } else {
    const defaultPotongan = emp.potongan || 450000;
    potonganItems = [
      { nama: 'BPJS Ketenagakerjaan (JHT + JP)', nominal: Math.round(defaultPotongan * 0.45) },
      { nama: 'BPJS Kesehatan (1%)', nominal: Math.round(defaultPotongan * 0.25) },
      { nama: 'PPh 21 (Pajak Penghasilan)', nominal: Math.round(defaultPotongan * 0.30) }
    ];
  }

  const totalPotongan = potonganItems.reduce((acc, cur) => acc + (parseInt(cur.nominal, 10) || 0), 0);
  const takeHomePay = gajiPokok + tunjangan - totalPotongan;

  const printable = document.getElementById('printable-payslip');
  if (!printable) return;

  // Render HTML Slip Gaji Standar 1 Lembar A4
  printable.innerHTML = `
    <!-- Header Dokumen Cetak (Kop Surat) -->
    <div class="print-row-header border-b-2 border-[#13231B] pb-3 sm:pb-4 mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-0">
      <div>
        <div class="flex items-center gap-2 sm:gap-2.5 mb-1">
          <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0D6840] flex items-center justify-center p-1 flex-shrink-0">
            <img src="assets/icon.png" class="w-full h-full object-contain">
          </div>
          <span class="font-heading font-black text-base sm:text-xl text-[#13231B] tracking-tight">PT MAJU BERSAMA SEJAHTERA</span>
        </div>
        <p class="text-[11px] sm:text-xs text-[#567364]">Gedung Bursa Efek Indonesia Tower II Lt. 17, SCBD Jakarta Selatan</p>
        <p class="text-[11px] sm:text-xs text-[#567364]">NPWP: 01.345.678.9-012.000 | Telp: (021) 515-0888</p>
      </div>
      <div class="print-text-right text-left sm:text-right flex sm:block items-center justify-between sm:justify-start gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-dashed border-[#D5E7DC]">
        <span class="inline-block px-2.5 py-1 bg-[#E8F4EC] border border-[#D5E7DC] font-heading font-bold text-[10px] sm:text-xs uppercase tracking-wider text-[#0D6840] rounded-lg">
          SLIP GAJI KARYAWAN
        </span>
        <div class="text-right sm:text-right">
          <p class="text-xs text-[#334D40] mt-0.5 sm:mt-1 font-medium">Periode: <strong class="text-[#13231B]">${monthLabel}</strong></p>
          <p class="text-[10px] sm:text-[11px] text-[#567364]">ID Slip: SLP-${emp.id}-202610</p>
        </div>
      </div>
    </div>

    <!-- Metadata Pegawai Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 bg-[#F4F9F5] p-3 sm:p-3.5 rounded-2xl border border-[#D5E7DC] mb-4 sm:mb-5 text-xs">
      <div>
        <table class="w-full">
          <tr><td class="text-[#567364] py-0.5 w-24">Nomor Induk</td><td class="font-semibold text-[#13231B]">: ${emp.id}</td></tr>
          <tr><td class="text-[#567364] py-0.5">Nama Pegawai</td><td class="font-semibold text-[#13231B]">: ${emp.nama}</td></tr>
          <tr><td class="text-[#567364] py-0.5">Jabatan</td><td class="font-semibold text-[#13231B]">: ${emp.jabatan}</td></tr>
        </table>
      </div>
      <div>
        <table class="w-full">
          <tr><td class="text-[#567364] py-0.5 w-24">Departemen</td><td class="font-semibold text-[#13231B]">: ${emp.departemen}</td></tr>
          <tr><td class="text-[#567364] py-0.5">Status Kerja</td><td class="font-semibold text-[#13231B]">: Karyawan Tetap (PKWTT)</td></tr>
          <tr><td class="text-[#567364] py-0.5">Tanggal Transfer</td><td class="font-semibold text-[#13231B]">: 28 ${monthLabel}</td></tr>
        </table>
      </div>
    </div>

    <!-- Rincian Penghasilan & Potongan 2 Kolom (1 Kolom di Mobile, 2 Kolom di Desktop & Print A4) -->
    <div class="print-grid-2 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5 mb-4 sm:mb-5">
      <!-- Kolom Pendapatan -->
      <div class="border border-[#D5E7DC] rounded-2xl p-3.5 sm:p-4 bg-white flex flex-col justify-between">
        <div>
          <h4 class="font-heading font-bold text-xs uppercase tracking-wider text-[#0D6840] border-b border-[#D5E7DC] pb-2 mb-2 flex items-center justify-between">
            <span>A. Komponen Pendapatan</span>
            <span>Jumlah</span>
          </h4>
          <div class="space-y-1.5 text-xs">
            <div class="flex justify-between text-[#334D40]">
              <span>Gaji Pokok</span>
              <span class="font-mono font-medium">Rp ${gajiPokok.toLocaleString('id-ID')}</span>
            </div>
            <div class="flex justify-between text-[#334D40]">
              <span>Tunjangan Operasional & Transport</span>
              <span class="font-mono font-medium">Rp ${Math.round(tunjangan * 0.5).toLocaleString('id-ID')}</span>
            </div>
            <div class="flex justify-between text-[#334D40]">
              <span>Tunjangan Komunikasi & Makan</span>
              <span class="font-mono font-medium">Rp ${Math.round(tunjangan * 0.5).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
        <div class="border-t border-dashed border-[#D5E7DC] pt-2 flex justify-between font-bold text-[#13231B] mt-3 text-xs">
          <span>Total Pendapatan Kotor</span>
          <span class="font-mono text-[#0D6840]">Rp ${(gajiPokok + tunjangan).toLocaleString('id-ID')}</span>
        </div>
      </div>

      <!-- Kolom Potongan (Dinamis: Mendukung Potongan Tambahan) -->
      <div class="border border-[#D5E7DC] rounded-2xl p-3.5 sm:p-4 bg-white flex flex-col justify-between">
        <div>
          <h4 class="font-heading font-bold text-xs uppercase tracking-wider text-rose-800 border-b border-[#D5E7DC] pb-2 mb-2 flex items-center justify-between">
            <span>B. Komponen Potongan</span>
            <span>Jumlah</span>
          </h4>
          <div class="space-y-1.5 text-xs">
            ${potonganItems.map(item => `
              <div class="flex justify-between text-[#334D40]">
                <span>${item.nama}</span>
                <span class="font-mono font-medium">Rp ${parseInt(item.nominal, 10).toLocaleString('id-ID')}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="border-t border-dashed border-[#D5E7DC] pt-2 flex justify-between font-bold text-[#13231B] mt-3 text-xs">
          <span>Total Potongan</span>
          <span class="font-mono text-rose-700">Rp ${totalPotongan.toLocaleString('id-ID')}</span>
        </div>
      </div>
    </div>

    <!-- Take Home Pay Card Highlight -->
    <div class="bg-[#DDF2E4] border border-[#0D6840]/30 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-5 sm:mb-6">
      <div>
        <span class="text-xs font-bold text-[#0D6840] uppercase tracking-wide">Penerimaan Bersih (Take Home Pay)</span>
        <p class="text-[10px] sm:text-[11px] text-[#4A6356] italic mt-0.5">Terbilang: #${terbilang(takeHomePay)} Rupiah#</p>
      </div>
      <div class="text-left sm:text-right">
        <span class="font-heading font-black text-xl sm:text-2xl text-[#0D6840] font-mono tracking-tight">Rp ${takeHomePay.toLocaleString('id-ID')}</span>
      </div>
    </div>

    <!-- Legal & Signature Footer -->
    <div class="grid grid-cols-2 gap-4 sm:gap-8 text-center text-[11px] sm:text-xs pt-3 border-t border-[#D5E7DC]">
      <div>
        <p class="text-[#567364] mb-8 sm:mb-10">Penerima (Karyawan),</p>
        <p class="font-bold text-[#13231B] border-b border-[#D5E7DC] pb-1 mx-2 sm:mx-8">${emp.nama}</p>
        <p class="text-[10px] text-[#567364] mt-1">NIP: ${emp.id}</p>
      </div>
      <div>
        <p class="text-[#567364] mb-8 sm:mb-10">Jakarta, 28 ${monthLabel}<br>Finance & Payroll Department,</p>
        <p class="font-bold text-[#13231B] border-b border-[#D5E7DC] pb-1 mx-2 sm:mx-8">Hendra Wijaya, S.E.</p>
        <p class="text-[10px] text-[#567364] mt-1">HR & Finance Director</p>
      </div>
    </div>
    
    <div class="mt-4 sm:mt-6 text-center text-[9px] sm:text-[10px] text-[#567364] border-t border-dashed border-[#D5E7DC] pt-2">
      Dokumen ini digenerate secara otomatis oleh sistem Upajiwa SaaS HRIS & Payroll. Sah tanpa tanda tangan basah bila diverifikasi melalui QR / Digital Hash.
    </div>
  `;

  const modal = document.getElementById('modal-slip-gaji');
  if (modal) modal.classList.remove('hidden');
}

function closePayslipModal() {
  const modal = document.getElementById('modal-slip-gaji');
  if (modal) modal.classList.add('hidden');
}

// Terbilang Rupiah Helper
function terbilang(angka) {
  const bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  if (angka < 12) return bilangan[angka];
  if (angka < 20) return terbilang(angka - 10) + ' Belas';
  if (angka < 100) return terbilang(Math.floor(angka / 10)) + ' Puluh ' + terbilang(angka % 10);
  if (angka < 200) return 'Seratus ' + terbilang(angka - 100);
  if (angka < 1000) return terbilang(Math.floor(angka / 100)) + ' Ratus ' + terbilang(angka % 100);
  if (angka < 2000) return 'Seribu ' + terbilang(angka - 1000);
  if (angka < 1000000) return terbilang(Math.floor(angka / 1000)) + ' Ribu ' + terbilang(angka % 1000);
  if (angka < 1000000000) return terbilang(Math.floor(angka / 1000000)) + ' Juta ' + terbilang(angka % 1000000);
  return 'Lebih dari Satu Miliar';
}
