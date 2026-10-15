const model = {
    app: {
        currentPage: 'itemsPage',
    },

    viewState: {
        itemsPage: {
            searchText: '',
        },

        loanPage: {
            itemId: null,
            personId: null,
            loanDate: '',
        },

        editItemPage: {
            itemId: null,
            name: '',
            categoryId: null,
            description: '',
        },

        newPersonPage: {
            name: '',
            email: '',
        },
    },

    categories: [
        {
            id: 1,
            name: 'Lyd',
        },
        {
            id: 2,
            name: 'Video',
        },
        {
            id: 3,
            name: 'Lader',
        },
    ],

    items: [
        {
            id: 1,
            name: 'USB-headset',
            categoryId: 1,
            description: 'Headset med USB-tilkobling.',
        },
        {
            id: 2,
            name: 'Webkamera',
            categoryId: 2,
            description: 'Webkamera for digitale møter.',
        },
        {
            id: 3,
            name: 'Laptoplader',
            categoryId: 3,
            description: 'Ekstra lader til laptop.',
        },
    ],

    people: [
        {
            id: 1,
            name: 'Anna Hansen',
            email: 'anna@example.com',
        },
        {
            id: 2,
            name: 'Jonas Berg',
            email: 'jonas@example.com',
        },
    ],

    loans: [
        {
            id: 1,
            personId: 1,
            itemId: 3,
            loanDate: '2026-10-10',
            returnedDate: '2026-10-12',
        },
        {
            id: 2,
            personId: 2,
            itemId: 1,
            loanDate: '2026-10-15',
            returnedDate: null,
        },
        {
            id: 3,
            personId: 1,
            itemId: 2,
            loanDate: '2026-10-14',
            returnedDate: null,
        },
    ],
};