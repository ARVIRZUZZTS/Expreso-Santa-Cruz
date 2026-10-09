import { showToast, formatDate, formatCurrency, escapeHtml } from './api.js';

function createCard(options = {}) {
    const { title, badge, children, className = '' } = options;
    const card = document.createElement('div');
    card.className = `card ${className}`;

    if (title) {
        const header = document.createElement('div');
        header.className = 'card-header';
        header.innerHTML = `<h3 class="card-title">${escapeHtml(title)}</h3>`;
        if (badge) {
            header.innerHTML += `<span class="badge badge-${badge.type}">${escapeHtml(badge.text)}</span>`;
        }
        card.appendChild(header);
    }

    const body = document.createElement('div');
    body.className = 'card-body';
    if (typeof children === 'string') {
        body.innerHTML = children;
    } else if (children) {
        body.appendChild(children);
    }
    card.appendChild(body);

    return card;
}

function createButton(options = {}) {
    const { text, type = 'primary', size = '', icon = '', onClick, className = '' } = options;
    const btn = document.createElement('button');
    btn.className = `btn btn-${type} ${size ? 'btn-' + size : ''} ${className}`;
    btn.innerHTML = `${icon}<span>${escapeHtml(text)}</span>`;
    if (onClick) {
        btn.addEventListener('click', onClick);
    }
    return btn;
}

function createListItem(options = {}) {
    const { icon, title, subtitle, action, onClick } = options;
    const item = document.createElement('div');
    item.className = 'list-item';

    if (icon) {
        const iconEl = document.createElement('div');
        iconEl.className = 'list-item-icon';
        iconEl.innerHTML = icon;
        item.appendChild(iconEl);
    }

    const content = document.createElement('div');
    content.className = 'list-item-content';
    content.innerHTML = `
        <div class="list-item-title">${escapeHtml(title)}</div>
        ${subtitle ? `<div class="list-item-subtitle">${escapeHtml(subtitle)}</div>` : ''}
    `;
    item.appendChild(content);

    if (action) {
        const actionEl = document.createElement('div');
        actionEl.className = 'list-item-action';
        actionEl.innerHTML = action;
        item.appendChild(actionEl);
    }

    if (onClick) {
        item.addEventListener('click', onClick);
    }

    return item;
}

function createEmptyState(options = {}) {
    const { icon = '📭', title = 'Sin datos', text = 'No hay elementos para mostrar' } = options;
    const div = document.createElement('div');
    div.className = 'empty-state';
    div.innerHTML = `
        <div class="empty-state-icon">${icon}</div>
        <div class="empty-state-title">${escapeHtml(title)}</div>
        <div class="empty-state-text">${escapeHtml(text)}</div>
    `;
    return div;
}

function createLoading() {
    const div = document.createElement('div');
    div.className = 'loading';
    div.innerHTML = '<div class="spinner"></div>';
    return div;
}

function createModal(options = {}) {
    const { title, body, footer, onClose } = options;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';

    const header = document.createElement('div');
    header.className = 'modal-header';
    header.innerHTML = `
        <h3 class="modal-title">${escapeHtml(title)}</h3>
        <button class="modal-close">&times;</button>
    `;
    modal.appendChild(header);

    const bodyEl = document.createElement('div');
    bodyEl.className = 'modal-body';
    if (typeof body === 'string') {
        bodyEl.innerHTML = body;
    } else if (body) {
        bodyEl.appendChild(body);
    }
    modal.appendChild(bodyEl);

    if (footer) {
        const footerEl = document.createElement('div');
        footerEl.className = 'modal-footer';
        if (typeof footer === 'string') {
            footerEl.innerHTML = footer;
        } else if (footer) {
            footerEl.appendChild(footer);
        }
        modal.appendChild(footerEl);
    }

    overlay.appendChild(modal);

    const closeModal = () => {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
            if (onClose) onClose();
        }, 300);
    };

    header.querySelector('.modal-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 10);

    return { overlay, modal, closeModal };
}

function createCalendar(options = {}) {
    const { selectedDate, onSelect, hasData = () => false } = options;
    const container = document.createElement('div');
    container.className = 'calendar';

    const now = new Date();
    let currentMonth = selectedDate ? new Date(selectedDate) : new Date();
    currentMonth.setDate(1);

    function render() {
        container.innerHTML = '';

        const header = document.createElement('div');
        header.className = 'calendar-header';

        const prevBtn = document.createElement('button');
        prevBtn.className = 'calendar-nav';
        prevBtn.innerHTML = '‹';
        prevBtn.addEventListener('click', () => {
            currentMonth.setMonth(currentMonth.getMonth() - 1);
            render();
        });

        const title = document.createElement('div');
        title.className = 'calendar-title';
        title.textContent = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

        const nextBtn = document.createElement('button');
        nextBtn.className = 'calendar-nav';
        nextBtn.innerHTML = '›';
        nextBtn.addEventListener('click', () => {
            currentMonth.setMonth(currentMonth.getMonth() + 1);
            render();
        });

        header.appendChild(prevBtn);
        header.appendChild(title);
        header.appendChild(nextBtn);
        container.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'calendar-grid';

        const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        weekdays.forEach(day => {
            const el = document.createElement('div');
            el.className = 'calendar-weekday';
            el.textContent = day;
            grid.appendChild(el);
        });

        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            const day = daysInPrevMonth - firstDay + i + 1;
            const el = document.createElement('div');
            el.className = 'calendar-day other-month';
            el.textContent = day;
            grid.appendChild(el);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const el = document.createElement('div');
            el.className = 'calendar-day';
            el.textContent = day;

            if (date.getTime() === today.getTime()) {
                el.classList.add('today');
            }

            if (selectedDate) {
                const sel = new Date(selectedDate);
                sel.setHours(0, 0, 0, 0);
                if (date.getTime() === sel.getTime()) {
                    el.classList.add('selected');
                }
            }

            if (hasData(date)) {
                el.classList.add('has-data');
            }

            el.addEventListener('click', () => {
                onSelect(date);
                render();
            });

            grid.appendChild(el);
        }

        const totalCells = firstDay + daysInMonth;
        const remainingCells = 7 - (totalCells % 7);
        if (remainingCells < 7) {
            for (let i = 1; i <= remainingCells; i++) {
                const el = document.createElement('div');
                el.className = 'calendar-day other-month';
                el.textContent = i;
                grid.appendChild(el);
            }
        }

        container.appendChild(grid);
    }

    render();
    return container;
}

function createStatCard(value, label) {
    const div = document.createElement('div');
    div.className = 'stat-card';
    div.innerHTML = `
        <div class="stat-value">${escapeHtml(value)}</div>
        <div class="stat-label">${escapeHtml(label)}</div>
    `;
    return div;
}

function createBadge(text, type = 'info') {
    const span = document.createElement('span');
    span.className = `badge badge-${type}`;
    span.textContent = text;
    return span;
}

function createDivider() {
    const div = document.createElement('div');
    div.className = 'divider';
    return div;
}

function createAvatar(initial, size = '') {
    const div = document.createElement('div');
    div.className = `avatar ${size}`;
    div.textContent = initial;
    return div;
}

export {
    createCard,
    createButton,
    createListItem,
    createEmptyState,
    createLoading,
    createModal,
    createCalendar,
    createStatCard,
    createBadge,
    createDivider,
    createAvatar
};
