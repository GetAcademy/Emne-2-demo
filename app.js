const storageKey = 'utstyrsutlaan-v1';
const app = document.getElementById('app');
const navigation = document.getElementById('navigation');
const notice = document.getElementById('notice');
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const today = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const formatDate = value => value ? value.split('-').reverse().join('.') : '';
const activeLoan = itemId => model.loans.find(loan => loan.itemId === itemId && !loan.returnedDate);
const nextId = list => Math.max(0, ...list.map(entry => entry.id)) + 1;
const itemName = id => model.items.find(item => item.id === id)?.name ?? 'Ukjent utstyr';
const personName = id => model.people.find(person => person.id === id)?.name ?? 'Ukjent person';

try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && ['items', 'people', 'loans', 'categories'].every(key => Array.isArray(saved[key]))) {
        for (const key of ['items', 'people', 'loans', 'categories']) model[key] = saved[key];
    }
} catch { notice.textContent = 'Lagrede data kunne ikke leses. Eksempeldata vises.'; }

function save(message) {
    try {
        localStorage.setItem(storageKey, JSON.stringify({ items: model.items, people: model.people, loans: model.loans, categories: model.categories }));
        notice.textContent = message;
    } catch { notice.textContent = `${message} Nettleseren kunne ikke lagre endringen. Den beholdes bare så lenge siden er åpen.`; }
}

function table(headers, rows) {
    return `<div class="table-wrap"><table><thead><tr>${headers.map(title => `<th scope="col">${title}</th>`).join('')}</tr></thead><tbody>${rows || `<tr><td colspan="${headers.length}" class="empty">Ingen treff.</td></tr>`}</tbody></table></div>`;
}

function go(page) {
    model.app.currentPage = page;
    notice.textContent = '';
    render();
}

function render() {
    const page = model.app.currentPage;
    const selected = ({ loanPage: 'loansPage', editItemPage: 'itemsPage', newPersonPage: 'peoplePage' })[page] || page;
    navigation.innerHTML = [['itemsPage', 'Utstyr'], ['peoplePage', 'Personer'], ['loansPage', 'Utlån'], ['historyPage', 'Historikk']].map(([key, name]) => `<button data-page="${key}" ${selected === key ? 'aria-current="page"' : ''}>${name}</button>`).join('');
    if (page === 'itemsPage') {
        app.innerHTML = `<h1>Utstyr</h1><label class="search"><span>Søk etter utstyr</span><input id="search" type="search" placeholder="Søk etter utstyr" value="${escapeHtml(model.viewState.itemsPage.searchText)}"></label><div id="items-table"></div>`;
        renderItems();
    } else if (page === 'peoplePage') {
        app.innerHTML = `<h1>Personer</h1>${table(['Navn', 'E-post'], model.people.map(person => `<tr><td>${escapeHtml(person.name)}</td><td>${escapeHtml(person.email)}</td></tr>`).join(''))}<button class="primary below-table" data-action="new-person">Ny person</button>`;
    } else if (page === 'loansPage') {
        app.innerHTML = `<h1>Aktive utlån</h1>${table(['Person', 'Utstyr', 'Utlånsdato', 'Handlinger'], model.loans.filter(loan => !loan.returnedDate).map(loan => `<tr><td>${escapeHtml(personName(loan.personId))}</td><td>${escapeHtml(itemName(loan.itemId))}</td><td>${formatDate(loan.loanDate)}</td><td><button data-action="return" data-id="${loan.id}">Levert tilbake</button></td></tr>`).join(''))}`;
    } else if (page === 'historyPage') {
        app.innerHTML = `<h1>Utlånshistorikk</h1>${table(['Person', 'Utstyr', 'Periode'], model.loans.map(loan => `<tr><td>${escapeHtml(personName(loan.personId))}</td><td>${escapeHtml(itemName(loan.itemId))}</td><td>${formatDate(loan.loanDate)} → ${loan.returnedDate ? formatDate(loan.returnedDate) : 'Aktiv'}</td></tr>`).join(''))}`;
    } else if (page === 'loanPage') {
        const state = model.viewState.loanPage;
        app.innerHTML = `<h1>Lån ut ${escapeHtml(itemName(state.itemId))}</h1><form id="loan-form"><label class="field"><span>Person:</span><select name="personId" required><option value="">Velg person</option>${model.people.map(person => `<option value="${person.id}" ${state.personId === person.id ? 'selected' : ''}>${escapeHtml(person.name)}</option>`).join('')}</select></label><label class="field"><span>Utlånsdato:</span><input name="loanDate" type="date" required max="${today()}" value="${state.loanDate}"></label>${formActions('Registrer utlån', 'itemsPage')}</form>`;
    } else if (page === 'editItemPage') {
        const state = model.viewState.editItemPage;
        app.innerHTML = `<h1>Rediger utstyr</h1><form id="edit-form"><label class="field"><span>Navn:</span><input name="name" required maxlength="100" value="${escapeHtml(state.name)}"></label><label class="field"><span>Kategori:</span><select name="categoryId" required>${model.categories.map(category => `<option value="${category.id}" ${category.id === state.categoryId ? 'selected' : ''}>${escapeHtml(category.name)}</option>`).join('')}</select></label><label class="field"><span>Beskrivelse:</span><textarea name="description" maxlength="1000">${escapeHtml(state.description)}</textarea></label>${formActions('Lagre', 'itemsPage')}</form>`;
    } else if (page === 'newPersonPage') {
        const state = model.viewState.newPersonPage;
        app.innerHTML = `<h1>Ny person</h1><form id="person-form"><label class="field"><span>Navn:</span><input name="name" required maxlength="100" autocomplete="name" value="${escapeHtml(state.name)}"></label><label class="field"><span>E-post:</span><input name="email" type="email" required maxlength="254" autocomplete="email" value="${escapeHtml(state.email)}"></label>${formActions('Lagre', 'peoplePage')}</form>`;
    }
}

function formActions(label, cancelPage) {
    return `<div class="form-actions"><button type="submit" class="primary">${label}</button><button type="button" data-page="${cancelPage}">Avbryt</button></div>`;
}

function renderItems() {
    const search = model.viewState.itemsPage.searchText.trim().toLocaleLowerCase('nb');
    document.getElementById('items-table').innerHTML = table(['Navn', 'Status', 'Handlinger'], model.items.filter(item => item.name.toLocaleLowerCase('nb').includes(search)).map(item => {
        const isOut = Boolean(activeLoan(item.id));
        return `<tr><td>${escapeHtml(item.name)}</td><td><span class="badge ${isOut ? 'out' : ''}">${isOut ? 'Utlånt' : 'Tilgjengelig'}</span></td><td><div class="actions">${isOut ? '' : `<button data-action="loan" data-id="${item.id}">Lån ut</button>`}<button data-action="edit" data-id="${item.id}">Rediger</button></div></td></tr>`;
    }).join(''));
}

document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.page) return go(button.dataset.page);
    const id = Number(button.dataset.id);
    const action = button.dataset.action;
    if (action === 'loan' && !activeLoan(id)) {
        model.viewState.loanPage = { itemId: id, personId: null, loanDate: today() };
        go('loanPage');
    } else if (action === 'edit') {
        const item = model.items.find(entry => entry.id === id);
        model.viewState.editItemPage = { itemId: item.id, name: item.name, categoryId: item.categoryId, description: item.description };
        go('editItemPage');
    } else if (action === 'new-person') {
        model.viewState.newPersonPage = { name: '', email: '' };
        go('newPersonPage');
    } else if (action === 'return') {
        const loan = model.loans.find(entry => entry.id === id);
        if (!loan || loan.returnedDate) return;
        if (loan.loanDate > today()) { notice.textContent = 'Utlånsdatoen er i fremtiden. Innlevering kan ikke registreres ennå.'; return; }
        loan.returnedDate = today();
        save(`${itemName(loan.itemId)} er levert tilbake.`);
        render();
    }
});

app.addEventListener('input', event => {
    const input = event.target;
    input.setCustomValidity('');
    if (input.id === 'search') {
        model.viewState.itemsPage.searchText = input.value;
        renderItems();
    } else {
        const state = model.viewState[model.app.currentPage];
        if (state && input.name) state[input.name] = input.name.endsWith('Id') ? Number(input.value) || null : input.value;
    }
});

app.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const invalid = (name, message) => { form.elements[name].setCustomValidity(message); form.elements[name].reportValidity(); };
    if (form.id === 'loan-form') {
        const state = model.viewState.loanPage;
        if (activeLoan(state.itemId)) { notice.textContent = 'Utstyret er allerede utlånt.'; return; }
        const personId = Number(data.get('personId'));
        const loanDate = data.get('loanDate');
        if (!model.people.some(person => person.id === personId)) return invalid('personId', 'Velg en person.');
        if (!loanDate || loanDate > today()) return invalid('loanDate', 'Velg dagens dato eller en tidligere dato.');
        const overlaps = model.loans.some(loan => loan.itemId === state.itemId && (!loan.returnedDate || loan.returnedDate > loanDate));
        if (overlaps) return invalid('loanDate', 'Datoen overlapper et tidligere utlån. Velg datoen utstyret ble levert tilbake eller senere.');
        model.loans.push({ id: nextId(model.loans), personId, itemId: state.itemId, loanDate, returnedDate: null });
        model.app.currentPage = 'loansPage';
        save('Utlånet er registrert.');
    } else if (form.id === 'edit-form') {
        const name = data.get('name').trim();
        if (!name) return invalid('name', 'Skriv inn et navn.');
        const item = model.items.find(entry => entry.id === model.viewState.editItemPage.itemId);
        Object.assign(item, { name, categoryId: Number(data.get('categoryId')), description: data.get('description').trim() });
        model.app.currentPage = 'itemsPage';
        save('Utstyret er oppdatert.');
    } else if (form.id === 'person-form') {
        const name = data.get('name').trim();
        const email = data.get('email').trim();
        if (!name) return invalid('name', 'Skriv inn et navn.');
        if (model.people.some(person => person.email.toLowerCase() === email.toLowerCase())) return invalid('email', 'Det finnes allerede en person med denne e-postadressen.');
        model.people.push({ id: nextId(model.people), name, email });
        model.app.currentPage = 'peoplePage';
        save('Personen er registrert.');
    }
    render();
});

render();
