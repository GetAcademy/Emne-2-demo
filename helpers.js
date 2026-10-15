function findObjectById(array, id) {
    for (const object of array) {
        if (object.id === id) return object;
    }
    return null;
}

function getNextId(array) {
    let highestId = 0;
    for (const object of array) {
        if (object.id > highestId) highestId = object.id;
    }
    return highestId + 1;
}

function getActiveLoan(itemId) {
    for (const loan of model.loans) {
        if (loan.itemId === itemId && loan.returnedDate === null) return loan;
    }
    return null;
}

function getMatchingItems() {
    const result = [];
    const search = model.viewState.itemsPage.searchText.trim().toLowerCase();
    for (const item of model.items) {
        if (item.name.toLowerCase().includes(search)) result.push(item);
    }
    return result;
}

function getToday() {
    const date = new Date();
    return date.getFullYear() + '-' + twoDigits(date.getMonth() + 1) + '-' + twoDigits(date.getDate());
}

function twoDigits(number) {
    return number < 10 ? '0' + number : '' + number;
}

function isValidDate(text) {
    if (text.length !== 10) return false;
    const date = new Date(text + 'T12:00:00');
    const formatted = date.getFullYear() + '-' + twoDigits(date.getMonth() + 1) + '-' + twoDigits(date.getDate());
    return text === formatted;
}

function formatDate(text) {
    return text.substring(8, 10) + '.' + text.substring(5, 7) + '.' + text.substring(0, 4);
}

// Brukerens tekst skal vises som tekst, også når den inneholder HTML-tegn.
function escapeHtml(text) {
    let result = '';
    for (const character of text) {
        if (character === '&') result += '&amp;';
        else if (character === '<') result += '&lt;';
        else if (character === '>') result += '&gt;';
        else if (character === '"') result += '&quot;';
        else if (character === "'") result += '&#39;';
        else result += character;
    }
    return result;
}
