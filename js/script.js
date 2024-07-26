document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.sorting__btn');
    const trainersContainer = document.querySelector('.trainers-cards__container');
    const filterForm = document.querySelector('.filters');
    let filteredData = DATA;
    const savedDirection = localStorage.getItem('selectedDirection') || 'all';
    const savedCategory = localStorage.getItem('selectedCategory') || 'all';
    const savedSort = localStorage.getItem('selectedSort') || 'default';
    const defaultSortButton = buttons[0];

    // Мапування, бо змінювати дані в 'index.js' неможна(?)
    const directionMapping = {
        'all': 'ВСІ',
        'gym': 'ТРЕНАЖЕРНИЙ ЗАЛ',
        'fight club': 'БІЙЦІВСЬКИЙ КЛУБ',
        'kids club': 'ДИТЯЧИЙ КЛУБ',
        'swimming pool': 'БАСЕЙН'
    };

    const categoryMapping = {
        'all': 'ВСІ',
        'master': 'МАЙСТЕР',
        'specialist': 'СПЕЦІАЛІСТ',
        'instructor': 'ІНСТРУКТОР'
    };

    const container = document.querySelector('.trainers-cards__container');
    
    DATA.forEach(trainer => {
        const card = createTrainerCard(trainer);
        container.appendChild(card);
    });
    document.querySelector('.sidebar').removeAttribute('hidden');
    document.querySelector('.sorting').removeAttribute('hidden');
   
    //атрибути, щоб відрізняти кнопки
    buttons[0].setAttribute('data-sort', 'default');
    buttons[1].setAttribute('data-sort', 'lastName');
    buttons[2].setAttribute('data-sort', 'experience');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const sortType = button.getAttribute('data-sort');
            localStorage.setItem('selectedSort', sortType);
            sortAndDisplayData(sortType);
            document.querySelector('.sorting__btn--active').classList.remove('sorting__btn--active');
            button.classList.add('sorting__btn--active');
        });
    });

    // сортування з локалки
    const savedSortButton = Array.from(buttons).find(button => button.getAttribute('data-sort') === savedSort);
    if (savedSortButton) {
        document.querySelector('.sorting__btn--active').classList.remove('sorting__btn--active');
        savedSortButton.classList.add('sorting__btn--active');
        sortAndDisplayData(savedSort);
    }

    if (savedDirection !== 'all') {
        document.querySelector(`input[name="direction"][value="${savedDirection}"]`).checked = true;
    }
    if (savedCategory !== 'all') {
        document.querySelector(`input[name="category"][value="${savedCategory}"]`).checked = true;
    }

    //фільтри
    document.addEventListener('submit', (event) => {
        event.preventDefault();
        applyFilters();
    });

    //тренери
    function createTrainerCard(trainer) {
        const li = document.createElement('li');
        li.className = 'trainer';

        li.innerHTML = `
            <img src="${trainer.photo}" alt="${trainer['first name']} ${trainer['last name']}" class="trainer__image">
            <h2 class="trainer__name">${trainer['first name']} ${trainer['last name']}</h2>
            <button class = "trainer__show-more">ПОКАЗАТИ</button>
        `;
        li.querySelector('.trainer__show-more').addEventListener('click', () => {
            showModal(trainer);
            document.body.style.overflow = 'hidden';
        });
        return li;
    }

    function applyFilters() {
        const direction = document.querySelector('input[name="direction"]:checked').value;
        const category = document.querySelector('input[name="category"]:checked').value;

        localStorage.setItem('selectedDirection', direction);
        localStorage.setItem('selectedCategory', category);

        filteredData = DATA.filter(trainer => {
            const trainerDirection = directionMapping[direction] || 'ВСІ';
            const trainerCategory = categoryMapping[category] || 'ВСІ';
            const matchesDirection = trainerDirection === 'ВСІ' || trainer.specialization.toLowerCase() === trainerDirection.toLowerCase();
            const matchesCategory = trainerCategory === 'ВСІ' || trainer.category.toLowerCase() === trainerCategory.toLowerCase();
            
            return matchesDirection && matchesCategory;
        });
        sortAndDisplayData(localStorage.getItem('selectedSort') || 'default');
    }

    function sortAndDisplayData(sortType) {
        let sortedData;

        switch (sortType) {
            case 'lastName':
                sortedData = [...filteredData].sort((a, b) => a['last name'].localeCompare(b['last name']));
                break;
            case 'experience':
                sortedData = [...filteredData].sort((a, b) => parseInt(b.experience) - parseInt(a.experience));
                break;
            default:
                sortedData = filteredData;
                break;
        }

        displayData(sortedData);
    }

    function displayData(data) {
        trainersContainer.innerHTML = '';

        data.forEach(trainer => {
            const template = document.getElementById('trainer-card').content.cloneNode(true);
            const trainerCard = template.querySelector('.trainer');
            
            trainerCard.querySelector('.trainer__img').src = trainer.photo;
            trainerCard.querySelector('.trainer__name').innerText = `${trainer['first name']} ${trainer['last name']}`;
            
            const detailButton = trainerCard.querySelector('.trainer__show-more');
            detailButton.addEventListener('click', () => showModal(trainer));

            trainersContainer.appendChild(template);
        });
    }
    applyFilters();
});

const showModal = (trainer) => {
    const template = document.getElementById('modal-template').content.cloneNode(true);
    const modal = template.querySelector('.modal');

    modal.querySelector('.modal__img').src = trainer.photo;
    modal.querySelector('.modal__name').innerText = `${trainer['first name']} ${trainer['last name']}`;
    modal.querySelector('.modal__point--category').innerText = `Категорія: ${trainer.category}`;
    modal.querySelector('.modal__point--experience').innerText = `Досвід: ${trainer.experience}`;
    modal.querySelector('.modal__point--specialization').innerText = `Напрям тренера: ${trainer.specialization}`;
    modal.querySelector('.modal__text').innerText = trainer.description;

    document.body.appendChild(template);

    modal.querySelector('.modal__close').onclick = () => {
        modal.remove();
        document.body.style.overflow = '';
    };
}
