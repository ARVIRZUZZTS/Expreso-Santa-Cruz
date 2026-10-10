import { initApi, requireAuth, showToast, formatDate } from './api.js';
import { initAuth, getUser } from './auth.js';
import { createCard, createButton, createEmptyState, createLoading, createCalendar, createStatCard } from './components.js';

let currentView = 'menu';
let selectedDate = new Date();
let sidebarOpen = false;

function init() {
    initApi();
    initAuth();

    if (document.body.dataset.public !== 'true' && !requireAuth()) {
        return;
    }

    setupNavigation();
    setupSidebar();
    loadView('menu');
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.bottom-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            if (view) {
                loadView(view);
            }
        });
    });

    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }

    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }
}

function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (sidebar && overlay) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        sidebarOpen = false;
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (sidebar && overlay) {
        sidebarOpen = !sidebarOpen;
        sidebar.classList.toggle('active', sidebarOpen);
        overlay.classList.toggle('active', sidebarOpen);
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (sidebar && overlay) {
        sidebarOpen = false;
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    }
}

function loadView(view) {
    currentView = view;

    document.querySelectorAll('.bottom-nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.view === view);
    });

    const views = {
        'menu': renderMenuView,
        'diario': renderDiarioView,
        'encomienda': renderEncomiendaView,
        'perfil': renderPerfilView
    };

    const renderFn = views[view];
    if (renderFn) {
        renderFn();
    }

    closeSidebar();
}

function renderMenuView() {
    const container = document.getElementById('appContent');
    if (!container) return;

    container.innerHTML = '';

    const user = getUser();
    const welcomeCard = createCard({
        title: `Hola, ${user?.email || 'Usuario'}`,
        children: `
            <p class="text-center mb-2">¿Qué deseas hacer hoy?</p>
        `
    });
    container.appendChild(welcomeCard);

    const grid = document.createElement('div');
    grid.className = 'menu-grid';

    const menuItems = [
        { icon: '📅', title: 'Ver Diario', view: 'diario' },
        { icon: '📦', title: 'Nueva Encomienda', view: 'encomienda' },
        { icon: '📊', title: 'Estadísticas', view: 'menu' },
        { icon: '⚙️', title: 'Configuración', view: 'perfil' }
    ];

    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <div class="menu-item-icon">${item.icon}</div>
            <div class="menu-item-title">${item.title}</div>
        `;
        menuItem.addEventListener('click', () => loadView(item.view));
        grid.appendChild(menuItem);
    });

    container.appendChild(grid);

    const statsContainer = document.createElement('div');
    statsContainer.className = 'stats';
    statsContainer.appendChild(createStatCard('0', 'Encomiendas Hoy'));
    statsContainer.appendChild(createStatCard('0', 'Pendientes'));
    statsContainer.appendChild(createStatCard('Bs 0.00', 'Total Hoy'));
    statsContainer.appendChild(createStatCard('0', 'Sincronizadas'));
    container.appendChild(statsContainer);
}

function renderDiarioView() {
    const container = document.getElementById('appContent');
    if (!container) return;

    container.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'card-header';
    header.innerHTML = `
        <h3 class="card-title">Diario - ${formatDate(selectedDate)}</h3>
        <button class="btn btn-primary btn-sm" id="changeDateBtn">Cambiar Fecha</button>
    `;
    container.appendChild(header);

    const calendarContainer = document.createElement('div');
    calendarContainer.className = 'mb-2';
    const calendar = createCalendar({
        selectedDate: selectedDate,
        onSelect: (date) => {
            selectedDate = date;
            renderDiarioView();
        }
    });
    calendarContainer.appendChild(calendar);
    container.appendChild(calendarContainer);

    const listContainer = document.createElement('div');
    listContainer.id = 'diarioList';
    listContainer.className = 'diario-list';
    container.appendChild(listContainer);

    loadDiarioData();
}

async function loadDiarioData() {
    const listContainer = document.getElementById('diarioList');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    listContainer.appendChild(createLoading());

    try {
        const user = getUser();
        const registrador = user?.email || 'desconocido';
        const encomiendas = await getEncomiendas(formatDate(selectedDate), registrador);

        listContainer.innerHTML = '';

        if (!encomiendas || encomiendas.length === 0) {
            listContainer.appendChild(createEmptyState({
                icon: '📭',
                title: 'Sin encomiendas',
                text: 'No hay encomiendas registradas para esta fecha'
            }));
            return;
        }

        encomiendas.forEach(enc => {
            const card = createCard({
                title: enc.conEnc,
                badge: { text: enc.sincronizado ? 'Sincronizado' : 'Pendiente', type: enc.sincronizado ? 'success' : 'warning' },
                children: `
                    <div class="diario-card-row">
                        <span class="diario-card-label">Remitente:</span>
                        <span class="diario-card-value">${escapeHtml(enc.remitente || '-')}</span>
                    </div>
                    <div class="diario-card-row">
                        <span class="diario-card-label">Consignatario:</span>
                        <span class="diario-card-value">${escapeHtml(enc.consignatario || '-')}</span>
                    </div>
                    <div class="diario-card-row">
                        <span class="diario-card-label">Destino:</span>
                        <span class="diario-card-value">${escapeHtml(enc.destino || '-')}</span>
                    </div>
                    <div class="diario-card-row">
                        <span class="diario-card-label">Total:</span>
                        <span class="diario-card-value">${formatCurrency(enc.total || 0)}</span>
                    </div>
                `
            });
            listContainer.appendChild(card);
        });
    } catch (error) {
        listContainer.innerHTML = '';
        listContainer.appendChild(createEmptyState({
            icon: '⚠️',
            title: 'Error',
            text: error.message || 'No se pudieron cargar las encomiendas'
        }));
    }
}

function renderEncomiendaView() {
    const container = document.getElementById('appContent');
    if (!container) return;

    container.innerHTML = '';

    const form = document.createElement('form');
    form.id = 'encomiendaForm';
    form.className = 'encomienda-form';
    form.innerHTML = `
        <div class="encomienda-section">
            <h4 class="encomienda-section-title">Datos del Remitente</h4>
            <div class="form-group">
                <label class="form-label">Remitente</label>
                <input type="text" class="form-input" id="remitente" maxlength="100" placeholder="Nombre del remitente" required>
            </div>
            <div class="form-group">
                <label class="form-label">Teléfono Remitente</label>
                <input type="tel" class="form-input" id="remTelf" maxlength="15" placeholder="Teléfono">
            </div>
        </div>

        <div class="encomienda-section">
            <h4 class="encomienda-section-title">Datos del Consignatario</h4>
            <div class="form-group">
                <label class="form-label">Consignatario</label>
                <input type="text" class="form-input" id="consignatario" maxlength="100" placeholder="Nombre del consignatario" required>
            </div>
            <div class="form-group">
                <label class="form-label">Teléfono Consignatario</label>
                <input type="tel" class="form-input" id="conTelf" maxlength="15" placeholder="Teléfono">
            </div>
        </div>

        <div class="encomienda-section">
            <h4 class="encomienda-section-title">Detalles del Envío</h4>
            <div class="form-group">
                <label class="form-label">Bultos / Contenido</label>
                <textarea class="form-textarea" id="bulto" maxlength="500" placeholder="Descripción del contenido"></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Destino</label>
                <select class="form-select" id="destino" required>
                    <option value="">Seleccione destino</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Valor Declarado</label>
                <select class="form-select" id="valDeclarado">
                    <option value="No">No</option>
                    <option value="Si">Si</option>
                </select>
            </div>
        </div>

        <div class="encomienda-section">
            <h4 class="encomienda-section-title">Pago</h4>
            <div class="form-group">
                <label class="form-label">Estado de Pago</label>
                <select class="form-select" id="estadoPaga">
                    <option value="1">Cancelado</option>
                    <option value="2">Por Pagar</option>
                    <option value="3">Medio Tramo</option>
                    <option value="4">Tramo Completo</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Total (Bs)</label>
                <input type="number" class="form-input" id="total" placeholder="0.00" step="0.01">
            </div>
        </div>

        <div class="d-flex gap-2">
            <button type="button" class="btn btn-cancel flex-1" onclick="window.location.href='menu.html'">Cancelar</button>
            <button type="submit" class="btn btn-primary flex-1">Guardar Encomienda</button>
        </div>
    `;

    container.appendChild(form);

    loadZonas();

    form.addEventListener('submit', handleEncomiendaSubmit);
}

async function loadZonas() {
    try {
        const zonas = await getZonas();
        const select = document.getElementById('destino');
        if (select && zonas) {
            zonas.forEach(zona => {
                const option = document.createElement('option');
                option.value = zona.nombreZona;
                option.textContent = zona.nombreZona;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading zonas:', error);
    }
}

async function handleEncomiendaSubmit(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';

    try {
        const user = getUser();
        const data = {
            remitente: document.getElementById('remitente').value.trim(),
            remTelf: document.getElementById('remTelf').value.trim(),
            consignatario: document.getElementById('consignatario').value.trim(),
            conTelf: document.getElementById('conTelf').value.trim(),
            bulto: document.getElementById('bulto').value.trim(),
            destino: document.getElementById('destino').value,
            valDeclarado: document.getElementById('valDeclarado').value,
            estadoPaga: parseInt(document.getElementById('estadoPaga').value),
            total: parseFloat(document.getElementById('total').value) || 0,
            fecha: formatDate(selectedDate),
            origen: 'Santa Cruz',
            registrador: user?.email || 'desconocido'
        };

        await createEncomienda(data);
        showToast('Encomienda guardada correctamente');
        window.location.href = 'diario.html';
    } catch (error) {
        showToast(error.message || 'Error al guardar', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Guardar Encomienda';
    }
}

function renderPerfilView() {
    const container = document.getElementById('appContent');
    if (!container) return;

    container.innerHTML = '';

    const user = getUser();

    const profileCard = createCard({
        title: 'Perfil de Usuario',
        children: `
            <div class="d-flex align-items-center gap-2 mb-2">
                <div class="avatar avatar-lg">${(user?.email || 'U').charAt(0).toUpperCase()}</div>
                <div>
                    <div class="list-item-title">${escapeHtml(user?.email || 'Usuario')}</div>
                    <div class="list-item-subtitle">Usuario móvil</div>
                </div>
            </div>
        `
    });
    container.appendChild(profileCard);

    const configCard = createCard({
        title: 'Configuración',
        children: `
            <div class="list-item" id="syncBtn">
                <div class="list-item-icon">🔄</div>
                <div class="list-item-content">
                    <div class="list-item-title">Sincronizar ahora</div>
                    <div class="list-item-subtitle">Forzar sincronización con el servidor</div>
                </div>
            </div>
            <div class="list-item" id="clearDataBtn">
                <div class="list-item-icon">🗑️</div>
                <div class="list-item-content">
                    <div class="list-item-title">Limpiar datos locales</div>
                    <div class="list-item-subtitle">Eliminar datos caché</div>
                </div>
            </div>
        `
    });
    container.appendChild(configCard);

    const logoutBtn = createButton({
        text: 'Cerrar Sesión',
        type: 'danger',
        size: 'lg',
        className: 'mt-2'
    });
    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });
    container.appendChild(logoutBtn);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', init);

export {
    init,
    loadView,
    toggleSidebar,
    closeSidebar
};
