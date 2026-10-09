export const MAX_LENGTH = {
    REMITENTE: 15,
    CONSIGNATARIO: 100,
    TELEFONO: 15,
    BULTO: 500
};

export function limitLength(max) {
    return (e) => {
        if (e.target.value.length >= max && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
            e.preventDefault();
        }
    };
}

export function hardFilter(event) {
    const teclasPermitidas = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (!teclasPermitidas.includes(event.key) && !/[0-9]/.test(event.key)) {
        event.preventDefault();
    }
}

export function decimalFilter(event) {
    const teclasControl = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
    if (teclasControl.includes(event.key)) return;
    if (event.key === '.') {
        if (event.target.value.includes('.')) {
            event.preventDefault();
        }
        return;
    }
    if (!/^[0-9]$/.test(event.key)) {
        event.preventDefault();
    }
}

export function comillasFilter(event) {
    const teclasControl = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
    if (teclasControl.includes(event.key)) return;
    const caracteresProhibidos = ["'", '"', '`'];
    if (caracteresProhibidos.includes(event.key)) {
        event.preventDefault();
    }
}

export function strFecha() {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    return `${anio}-${mes}-${dia}`;
}

export function strFechaDMY() {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    return `${dia}/${mes}/${anio}`;
}

export function fechaISOToDMY(f) {
    if (!f) return '';
    const m = String(f).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return String(f);
    return `${m[3]}/${m[2]}/${m[1]}`;
}

export function fechaDMYToISO(f) {
    if (!f) return null;
    const m = String(f).trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return null;
    const d = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    const y = parseInt(m[3], 10);
    if (d < 1 || d > 31 || mo < 1 || mo > 12) return null;
    return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
