function changePage(page) {
    model.app.currentPage = page;
    model.app.message = '';
    updateView();
}

function showError(message) {
    model.app.message = message;
    updateView();
}

function searchItems(text) {
    model.viewState.itemsPage.searchText = text;
    updateView();
}

function editItem(itemId) {
    const item = findObjectById(model.items, itemId);
    if (item === null) return;
    const draft = model.viewState.editItemPage;
    draft.itemId = item.id;
    draft.name = item.name;
    draft.categoryId = item.categoryId;
    draft.description = item.description;
    changePage('editItemPage');
}

function saveItem() {
    const draft = model.viewState.editItemPage;
    const item = findObjectById(model.items, draft.itemId);
    if (item === null) return showError('Utstyret finnes ikke.');
    if (draft.name.trim() === '') return showError('Skriv inn navn på utstyret.');
    if (findObjectById(model.categories, draft.categoryId) === null) {
        return showError('Velg en kategori.');
    }
    item.name = draft.name.trim();
    item.categoryId = draft.categoryId;
    item.description = draft.description.trim();
    changePage('itemsPage');
}

function newPerson() {
    model.viewState.newPersonPage.name = '';
    model.viewState.newPersonPage.email = '';
    changePage('newPersonPage');
}

function savePerson() {
    const draft = model.viewState.newPersonPage;
    const name = draft.name.trim();
    const email = draft.email.trim();
    if (name === '') return showError('Skriv inn navn.');
    const atIndex = email.indexOf('@');
    const dotIndex = email.indexOf('.', atIndex + 1);
    if (atIndex < 1 || dotIndex < atIndex + 2 || dotIndex === email.length - 1
        || email.includes(' ') || email.indexOf('@', atIndex + 1) !== -1) {
        return showError('Skriv inn en gyldig e-postadresse.');
    }
    for (const person of model.people) {
        if (person.email.toLowerCase() === email.toLowerCase()) {
            return showError('E-postadressen er allerede registrert.');
        }
    }
    const person = {
        id: getNextId(model.people),
        name: name,
        email: email,
    };
    model.people.push(person);
    changePage('peoplePage');
}

function startLoan(itemId) {
    if (findObjectById(model.items, itemId) === null) return showError('Utstyret finnes ikke.');
    if (getActiveLoan(itemId) !== null) return showError('Utstyret er allerede utlånt.');
    const draft = model.viewState.loanPage;
    draft.itemId = itemId;
    draft.personId = null;
    draft.loanDate = getToday();
    changePage('loanPage');
}

function registerLoan() {
    const draft = model.viewState.loanPage;
    if (findObjectById(model.items, draft.itemId) === null) return showError('Velg utstyr.');
    if (getActiveLoan(draft.itemId) !== null) return showError('Utstyret er allerede utlånt.');
    if (findObjectById(model.people, draft.personId) === null) return showError('Velg en person.');
    if (!isValidDate(draft.loanDate) || draft.loanDate > getToday()) {
        return showError('Velg en gyldig utlånsdato som ikke er i fremtiden.');
    }
    for (const loan of model.loans) {
        if (loan.itemId === draft.itemId && loan.returnedDate > draft.loanDate) {
            return showError('Utstyret var ikke levert tilbake på denne datoen.');
        }
    }
    const loan = {
        id: getNextId(model.loans),
        personId: draft.personId,
        itemId: draft.itemId,
        loanDate: draft.loanDate,
        returnedDate: null,
    };
    model.loans.push(loan);
    changePage('loansPage');
}

function returnLoan(loanId) {
    const loan = findObjectById(model.loans, loanId);
    if (loan === null || loan.returnedDate !== null) return;
    const date = getToday();
    if (date < loan.loanDate) return showError('Utlånsdatoen er i fremtiden.');
    loan.returnedDate = date;
    model.app.message = '';
    updateView();
}
