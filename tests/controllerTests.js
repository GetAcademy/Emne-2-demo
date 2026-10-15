// Viewet er erstattet av en tom funksjon: disse testene undersøker modellen.
function updateView() {
}

function resetModel() {
    model.app.currentPage = 'itemsPage';
    model.app.message = '';
    model.viewState.itemsPage = { searchText: '' };
    model.viewState.loanPage = { itemId: null, personId: null, loanDate: '' };
    model.viewState.editItemPage = { itemId: null, name: '', categoryId: null, description: '' };
    model.viewState.newPersonPage = { name: '', email: '' };
    model.categories = [{ id: 5, name: 'Lyd' }, { id: 9, name: 'Video' }];
    // ID-ene er med vilje forskjellige fra array-indeksene, og ikke sortert.
    model.items = [
        { id: 30, name: 'Headset', categoryId: 5, description: 'USB' },
        { id: 10, name: 'Kamera', categoryId: 9, description: 'HD' },
    ];
    model.people = [
        { id: 20, name: 'Anna', email: 'anna@example.com' },
        { id: 7, name: 'Jonas', email: 'jonas@example.com' },
    ];
    model.loans = [
        { id: 50, itemId: 10, personId: 20, loanDate: '2020-01-01', returnedDate: null },
        { id: 12, itemId: 30, personId: 7, loanDate: '2020-01-01', returnedDate: '2020-01-03' },
    ];
}

function prepareLoan() {
    startLoan(30);
    model.viewState.loanPage.personId = 7;
    model.viewState.loanPage.loanDate = '2020-01-04';
}

QUnit.module('Controller-logikk', { beforeEach: resetModel });

QUnit.test('Navigasjon endrer side og fjerner gammel melding', function (assert) {
    model.app.message = 'Gammel melding';
    changePage('peoplePage');
    assert.strictEqual(model.app.currentPage, 'peoplePage');
    assert.strictEqual(model.app.message, '');
});

QUnit.test('Søk bruker view state og endrer ikke utstyrslisten', function (assert) {
    searchItems('  HEAD  ');
    const items = getMatchingItems();
    assert.strictEqual(model.viewState.itemsPage.searchText, '  HEAD  ');
    assert.strictEqual(items.length, 1);
    assert.strictEqual(items[0].id, 30);
    assert.strictEqual(model.items.length, 2);
    searchItems('finnes ikke');
    assert.strictEqual(getMatchingItems().length, 0);
    searchItems('');
    assert.strictEqual(getMatchingItems().length, 2);
});

QUnit.test('Redigering lager et arbeidsutkast, og avbryt beholder domenedata', function (assert) {
    editItem(30);
    assert.strictEqual(model.app.currentPage, 'editItemPage');
    assert.strictEqual(model.viewState.editItemPage.name, 'Headset');
    model.viewState.editItemPage.name = 'Endret';
    changePage('itemsPage');
    assert.strictEqual(findObjectById(model.items, 30).name, 'Headset');
    editItem(30);
    assert.strictEqual(model.viewState.editItemPage.name, 'Headset');
});

QUnit.test('Lagring oppdaterer riktig utstyr ved ID', function (assert) {
    editItem(30);
    model.viewState.editItemPage.name = '  Nytt headset  ';
    model.viewState.editItemPage.categoryId = 9;
    model.viewState.editItemPage.description = '  Beskrivelse  ';
    saveItem();
    assert.deepEqual(findObjectById(model.items, 30), {
        id: 30, name: 'Nytt headset', categoryId: 9, description: 'Beskrivelse',
    });
    assert.strictEqual(findObjectById(model.items, 10).name, 'Kamera');
    assert.strictEqual(model.app.currentPage, 'itemsPage');
});

QUnit.test('Tomt utstyrsnavn og ukjent kategori avvises', function (assert) {
    editItem(30);
    model.viewState.editItemPage.name = '  ';
    saveItem();
    assert.strictEqual(findObjectById(model.items, 30).name, 'Headset');
    assert.strictEqual(model.app.currentPage, 'editItemPage');
    assert.ok(model.app.message);
    model.viewState.editItemPage.name = 'Nytt navn';
    model.viewState.editItemPage.categoryId = 999;
    saveItem();
    assert.strictEqual(findObjectById(model.items, 30).categoryId, 5);
    assert.strictEqual(findObjectById(model.items, 30).name, 'Headset');
});

QUnit.test('Ny person nullstiller et gammelt utkast', function (assert) {
    model.viewState.newPersonPage.name = 'Gammelt';
    model.viewState.newPersonPage.email = 'gammelt@example.com';
    newPerson();
    assert.deepEqual(model.viewState.newPersonPage, { name: '', email: '' });
    assert.strictEqual(model.app.currentPage, 'newPersonPage');
});

QUnit.test('Ny person får unik ID og eget objekt', function (assert) {
    newPerson();
    model.viewState.newPersonPage.name = '  Kari  ';
    model.viewState.newPersonPage.email = '  kari@example.com  ';
    savePerson();
    const person = findObjectById(model.people, 21);
    assert.deepEqual(person, { id: 21, name: 'Kari', email: 'kari@example.com' });
    assert.notStrictEqual(person, model.viewState.newPersonPage);
    model.viewState.newPersonPage.name = 'Annet navn';
    assert.strictEqual(person.name, 'Kari');
    assert.strictEqual(model.app.currentPage, 'peoplePage');
});

QUnit.test('Person uten navn eller med ugyldig e-post avvises', function (assert) {
    newPerson();
    model.viewState.newPersonPage.name = ' ';
    model.viewState.newPersonPage.email = 'kari@example.com';
    savePerson();
    assert.strictEqual(model.people.length, 2);
    model.viewState.newPersonPage.name = 'Kari';
    model.viewState.newPersonPage.email = 'ugyldig';
    savePerson();
    assert.strictEqual(model.people.length, 2);
    assert.strictEqual(model.app.currentPage, 'newPersonPage');
    assert.ok(model.app.message);
});

QUnit.test('Duplikat e-post avvises uavhengig av store bokstaver', function (assert) {
    newPerson();
    model.viewState.newPersonPage.name = 'Ny Anna';
    model.viewState.newPersonPage.email = 'ANNA@example.com';
    savePerson();
    assert.strictEqual(model.people.length, 2);
    assert.ok(model.app.message);
});

QUnit.test('Avbryt ny person legger ikke til domenedata', function (assert) {
    newPerson();
    model.viewState.newPersonPage.name = 'Utkast';
    changePage('peoplePage');
    assert.strictEqual(model.people.length, 2);
});

QUnit.test('Start utlån klargjør utkast uten å opprette et utlån', function (assert) {
    startLoan(30);
    assert.deepEqual(model.viewState.loanPage, { itemId: 30, personId: null, loanDate: getToday() });
    assert.strictEqual(model.app.currentPage, 'loanPage');
    assert.strictEqual(model.loans.length, 2);
});

QUnit.test('Start utlån av utlånt eller ukjent utstyr avvises', function (assert) {
    startLoan(10);
    assert.strictEqual(model.app.currentPage, 'itemsPage');
    assert.ok(model.app.message);
    startLoan(999);
    assert.strictEqual(model.app.currentPage, 'itemsPage');
    assert.strictEqual(model.loans.length, 2);
});

QUnit.test('Registrering oppretter utlån med ID-relasjoner og eget objekt', function (assert) {
    prepareLoan();
    registerLoan();
    const loan = findObjectById(model.loans, 51);
    assert.deepEqual(loan, { id: 51, itemId: 30, personId: 7, loanDate: '2020-01-04', returnedDate: null });
    assert.notStrictEqual(loan, model.viewState.loanPage);
    model.viewState.loanPage.personId = 20;
    assert.strictEqual(loan.personId, 7);
    assert.strictEqual(model.app.currentPage, 'loansPage');
    assert.strictEqual(getActiveLoan(30), loan);
});

QUnit.test('Registrering kontrollerer dobbeltutlån selv etter åpning av skjema', function (assert) {
    prepareLoan();
    registerLoan();
    registerLoan();
    assert.strictEqual(model.loans.length, 3);
    assert.ok(model.app.message);
});

QUnit.test('Manglende og ukjent person avvises', function (assert) {
    startLoan(30);
    registerLoan();
    assert.strictEqual(model.loans.length, 2);
    model.viewState.loanPage.personId = 999;
    registerLoan();
    assert.strictEqual(model.loans.length, 2);
    assert.strictEqual(model.app.currentPage, 'loanPage');
});

QUnit.test('Ukjent utstyr ved registrering avvises', function (assert) {
    prepareLoan();
    model.viewState.loanPage.itemId = 999;
    registerLoan();
    assert.strictEqual(model.loans.length, 2);
    assert.ok(model.app.message);
});

QUnit.test('Tom, ugyldig og fremtidig utlånsdato avvises', function (assert) {
    prepareLoan();
    const dates = ['', '2020-02-30', 'ikke en dato', '9999-12-31'];
    for (const date of dates) {
        model.viewState.loanPage.loanDate = date;
        registerLoan();
        assert.strictEqual(model.loans.length, 2, 'Avviser: ' + date);
    }
});

QUnit.test('Utlån før forrige innlevering avvises', function (assert) {
    prepareLoan();
    model.viewState.loanPage.loanDate = '2020-01-02';
    registerLoan();
    assert.strictEqual(model.loans.length, 2);
    assert.ok(model.app.message);
});

QUnit.test('Utlån på forrige innleveringsdato er tillatt', function (assert) {
    prepareLoan();
    model.viewState.loanPage.loanDate = '2020-01-03';
    registerLoan();
    assert.strictEqual(model.loans.length, 3);
});

QUnit.test('Avbryt utlån oppretter ingen lån', function (assert) {
    prepareLoan();
    changePage('itemsPage');
    assert.strictEqual(model.loans.length, 2);
    assert.strictEqual(getActiveLoan(30), null);
});

QUnit.test('Innlevering oppdaterer riktig lån og bevarer historikken', function (assert) {
    returnLoan(50);
    const loan = findObjectById(model.loans, 50);
    assert.strictEqual(loan.returnedDate, getToday());
    assert.strictEqual(loan.loanDate, '2020-01-01');
    assert.strictEqual(model.loans.length, 2);
    assert.strictEqual(getActiveLoan(10), null);
    assert.strictEqual(findObjectById(model.loans, 12).returnedDate, '2020-01-03');
});

QUnit.test('Innlevering på nytt eller med ukjent ID endrer ikke historikk', function (assert) {
    returnLoan(12);
    returnLoan(999);
    assert.strictEqual(findObjectById(model.loans, 12).returnedDate, '2020-01-03');
    assert.strictEqual(model.loans.length, 2);
});

QUnit.test('Innlevering før utlånsdato avvises', function (assert) {
    findObjectById(model.loans, 50).loanDate = '9999-12-31';
    returnLoan(50);
    assert.strictEqual(findObjectById(model.loans, 50).returnedDate, null);
    assert.ok(model.app.message);
});

QUnit.test('Innlevert utstyr kan lånes ut igjen', function (assert) {
    returnLoan(50);
    startLoan(10);
    model.viewState.loanPage.personId = 7;
    registerLoan();
    assert.strictEqual(model.loans.length, 3);
    assert.strictEqual(getActiveLoan(10).personId, 7);
    assert.strictEqual(findObjectById(model.loans, 50).returnedDate, getToday());
});

QUnit.test('ID-funksjonen håndterer tom og usortert liste', function (assert) {
    assert.strictEqual(getNextId([]), 1);
    assert.strictEqual(getNextId(model.people), 21);
});
