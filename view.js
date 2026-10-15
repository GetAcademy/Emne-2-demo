function updateView() {
    if (model.app.currentPage === 'itemsPage') updateViewItemsPage();
    else if (model.app.currentPage === 'peoplePage') updateViewPeoplePage();
    else if (model.app.currentPage === 'loansPage') updateViewLoansPage();
    else if (model.app.currentPage === 'historyPage') updateViewHistoryPage();
    else if (model.app.currentPage === 'loanPage') updateViewLoanPage();
    else if (model.app.currentPage === 'editItemPage') updateViewEditItemPage();
    else if (model.app.currentPage === 'newPersonPage') updateViewNewPersonPage();
}

function showPage(content, selectedPage) {
    document.getElementById('app').innerHTML = /*HTML*/`
        <header><nav aria-label="Hovedmeny">
            ${createNavButton('itemsPage', 'Utstyr', selectedPage)}
            ${createNavButton('peoplePage', 'Personer', selectedPage)}
            ${createNavButton('loansPage', 'Utlån', selectedPage)}
            ${createNavButton('historyPage', 'Historikk', selectedPage)}
        </nav></header>
        <main>
            ${model.app.message ? '<p role="alert" class="message">' + escapeHtml(model.app.message) + '</p>' : ''}
            ${content}
        </main>`;
}

function createNavButton(page, text, selectedPage) {
    return /*HTML*/`<button onclick="changePage('${page}')"
        ${page === selectedPage ? 'aria-current="page"' : ''}>${text}</button>`;
}

function updateViewItemsPage() {
    let rows = '';
    for (const item of getMatchingItems()) rows += createItemRow(item);
    showPage(/*HTML*/`
        <h1>Utstyr</h1>
        <label for="search">Søk etter utstyr</label>
        <form class="search" onsubmit="searchItems(model.viewState.itemsPage.searchText); return false;">
            <input id="search" type="search" placeholder="Søk etter utstyr"
                value="${escapeHtml(model.viewState.itemsPage.searchText)}"
                oninput="model.viewState.itemsPage.searchText = this.value">
            <button type="submit">Søk</button>
        </form>
        <div class="table-wrap"><table>
            <thead><tr><th>Navn</th><th>Status</th><th>Handlinger</th></tr></thead>
            <tbody>${rows || '<tr><td colspan="3">Ingen utstyr funnet.</td></tr>'}</tbody>
        </table></div>`, 'itemsPage');
}

function createItemRow(item) {
    const isAvailable = getActiveLoan(item.id) === null;
    return /*HTML*/`<tr>
        <td>${escapeHtml(item.name)}</td>
        <td><span class="status ${isAvailable ? 'available' : 'unavailable'}">${isAvailable ? 'Tilgjengelig' : 'Utlånt'}</span></td>
        <td><div class="actions">
            ${isAvailable ? '<button onclick="startLoan(' + item.id + ')">Lån ut</button>' : ''}
            <button onclick="editItem(${item.id})">Rediger</button>
        </div></td>
    </tr>`;
}

function updateViewPeoplePage() {
    let rows = '';
    for (const person of model.people) {
        rows += /*HTML*/`<tr><td>${escapeHtml(person.name)}</td><td>${escapeHtml(person.email)}</td></tr>`;
    }
    showPage(/*HTML*/`<h1>Personer</h1>
        <div class="table-wrap"><table>
            <thead><tr><th>Navn</th><th>E-post</th></tr></thead>
            <tbody>${rows || '<tr><td colspan="2">Ingen personer registrert.</td></tr>'}</tbody>
        </table></div>
        <button class="primary below" onclick="newPerson()">Ny person</button>`, 'peoplePage');
}

function updateViewLoansPage() {
    let rows = '';
    for (const loan of model.loans) {
        if (loan.returnedDate !== null) continue;
        const person = findObjectById(model.people, loan.personId);
        const item = findObjectById(model.items, loan.itemId);
        rows += /*HTML*/`<tr><td>${escapeHtml(person.name)}</td><td>${escapeHtml(item.name)}</td>
            <td>${formatDate(loan.loanDate)}</td>
            <td><button onclick="returnLoan(${loan.id})">Levert tilbake</button></td></tr>`;
    }
    showPage(/*HTML*/`<h1>Aktive utlån</h1><div class="table-wrap"><table>
        <thead><tr><th>Person</th><th>Utstyr</th><th>Utlånsdato</th><th>Handlinger</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="4">Ingen aktive utlån.</td></tr>'}</tbody>
        </table></div>`, 'loansPage');
}

function updateViewHistoryPage() {
    let rows = '';
    for (const loan of model.loans) {
        const person = findObjectById(model.people, loan.personId);
        const item = findObjectById(model.items, loan.itemId);
        const end = loan.returnedDate === null ? 'Aktiv' : formatDate(loan.returnedDate);
        rows += /*HTML*/`<tr><td>${escapeHtml(person.name)}</td><td>${escapeHtml(item.name)}</td>
            <td>${formatDate(loan.loanDate)} → ${end}</td></tr>`;
    }
    showPage(/*HTML*/`<h1>Utlånshistorikk</h1><div class="table-wrap"><table>
        <thead><tr><th>Person</th><th>Utstyr</th><th>Periode</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="3">Ingen utlån registrert.</td></tr>'}</tbody>
        </table></div>`, 'historyPage');
}

function updateViewLoanPage() {
    const draft = model.viewState.loanPage;
    const item = findObjectById(model.items, draft.itemId);
    let options = '<option value="">Velg person</option>';
    for (const person of model.people) {
        options += /*HTML*/`<option value="${person.id}" ${person.id === draft.personId ? 'selected' : ''}>${escapeHtml(person.name)}</option>`;
    }
    showPage(/*HTML*/`<h1>Lån ut ${escapeHtml(item.name)}</h1>
        <form onsubmit="registerLoan(); return false;">
            <label for="person">Person:</label>
            <select id="person" required onchange="model.viewState.loanPage.personId = Number(this.value)">${options}</select>
            <label for="date">Utlånsdato:</label>
            <input id="date" type="date" required value="${escapeHtml(draft.loanDate)}" max="${getToday()}"
                oninput="model.viewState.loanPage.loanDate = this.value">
            ${createFormButtons('Registrer utlån', 'itemsPage')}
        </form>`, 'loansPage');
}

function updateViewEditItemPage() {
    const draft = model.viewState.editItemPage;
    let options = '';
    for (const category of model.categories) {
        options += /*HTML*/`<option value="${category.id}" ${category.id === draft.categoryId ? 'selected' : ''}>${escapeHtml(category.name)}</option>`;
    }
    showPage(/*HTML*/`<h1>Rediger utstyr</h1>
        <form onsubmit="saveItem(); return false;">
            <label for="name">Navn:</label>
            <input id="name" required value="${escapeHtml(draft.name)}"
                oninput="model.viewState.editItemPage.name = this.value">
            <label for="category">Kategori:</label>
            <select id="category" onchange="model.viewState.editItemPage.categoryId = Number(this.value)">${options}</select>
            <label for="description">Beskrivelse:</label>
            <textarea id="description" oninput="model.viewState.editItemPage.description = this.value">${escapeHtml(draft.description)}</textarea>
            ${createFormButtons('Lagre', 'itemsPage')}
        </form>`, 'itemsPage');
}

function updateViewNewPersonPage() {
    const draft = model.viewState.newPersonPage;
    showPage(/*HTML*/`<h1>Ny person</h1>
        <form onsubmit="savePerson(); return false;">
            <label for="name">Navn:</label>
            <input id="name" required value="${escapeHtml(draft.name)}"
                oninput="model.viewState.newPersonPage.name = this.value">
            <label for="email">E-post:</label>
            <input id="email" type="email" required value="${escapeHtml(draft.email)}"
                oninput="model.viewState.newPersonPage.email = this.value">
            ${createFormButtons('Lagre', 'peoplePage')}
        </form>`, 'peoplePage');
}

function createFormButtons(saveText, cancelPage) {
    return /*HTML*/`<div class="form-actions">
        <button class="primary" type="submit">${saveText}</button>
        <button type="button" onclick="changePage('${cancelPage}')">Avbryt</button>
    </div>`;
}
