document.addEventListener('DOMContentLoaded', function () {
    const filterProjects = document.getElementById('filter-projects');
    const gallery = document.getElementById('gallery');
    const galleryModal = document.getElementById('gallery-modal');
    const modal = document.getElementById('login-modal');
    const listLogout = document.getElementById('logout-list');
    const modifyOpenModal = document.getElementById('modify-open-modal');
    const closeButton = document.querySelector('.close-button');

    let worksData = [];

    // Function to create filter HTML
    function createFilterHtml(categories) {
        let filterHtml = '<div class="afilter afilterselected" data-category-id="all"><p class="filtertxt">Tous</p></div>';
        categories.forEach(function (category) {
            filterHtml += `<div class="afilter" data-category-id="${category.id}"><p class="filtertxt">${category.name}</p></div>`;
        });
        return filterHtml;
    }

    // Function to create gallery HTML
    function createGalleryHtml(works) {
        let galleryHtml = '';
        works.forEach(function (work) {
            galleryHtml += `
                <figure>
                    <img src="${work.imageUrl}" alt="${work.title}">
                    <figcaption>${work.title}</figcaption>
                </figure>
            `;
        });
        return galleryHtml;
    }

    function createGalleryModal(works) {
        let galleryModal = '';
        works.forEach(function (work) {
            galleryModal += `
                <div class="modal-contain-image">
                    <img src="${work.imageUrl}" alt="${work.title}" class="modal-gallery-image">
                    <div class="trashContainer">
                        <i class="fa-solid fa-trash-can trash-color"></i>
                    </div>
                </div>
            `;
        });
        return galleryModal;
    }

    // Function to add event listeners to filters
    function addFilterEventListeners() {
        document.querySelectorAll('.afilter').forEach(function (filter) {
            filter.addEventListener('click', function () {
                const categoryId = this.getAttribute('data-category-id');
                filterProjects.querySelectorAll('.afilter').forEach(function (f) { f.classList.remove('afilterselected'); });
                this.classList.add('afilterselected');
                updateGallery(categoryId);
            });
        });
    }

    function fetchAndDisplayCategories() {
        fetch('http://localhost:5678/api/categories')
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(function (categories) {
                if (Array.isArray(categories) && categories.length > 0) {
                    filterProjects.innerHTML = createFilterHtml(categories);
                    addFilterEventListeners();  // Add event listeners for filtering
                } else {
                    console.error('Categories data is invalid:', categories);
                }
            })
            .catch(function (error) {
                console.error('Fetch error:', error);
            });
    }

    function fetchAndStoreWorks() {
        fetch('http://localhost:5678/api/works')
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(function (works) {
                if (Array.isArray(works) && works.length > 0) {
                    worksData = works;
                    updateGallery();
                    updateGalleryModal();
                } else {
                    console.error('Works data is invalid:', works);
                }
            })
            .catch(function (error) {
                console.error('Fetch error:', error);
            });
    }

    function updateGallery(categoryId) {
        if (!Array.isArray(worksData) || worksData.length === 0) {
            console.error('No works data available');
            return;
        }
        let filteredWorks;
        if (categoryId && categoryId !== 'all') {
            filteredWorks = worksData.filter(function (work) { return work.categoryId == categoryId; });
        } else {
            filteredWorks = worksData;
        }
        gallery.innerHTML = createGalleryHtml(filteredWorks);
    }

    function updateGalleryModal() {
        if (!Array.isArray(worksData) || worksData.length === 0) {
            console.error('No works data available');
            return;
        }
        galleryModal.innerHTML = createGalleryModal(worksData);
    }

    function showModal() {
        if (modal) {
            modal.style.display = 'block';
        } else {
            console.error('Modal element not found');
        }
    }

    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
        } else {
            console.error('Modal element not found');
        }
    }

    if (closeButton) {
        closeButton.addEventListener('click', function () {
            closeModal();
        });
    } else {
        console.error('Close button not found');
    }

    if (listLogout) {
        listLogout.addEventListener('click', function () {
            document.cookie = "token= ; expires = Thu, 01 Jan 1970 00:00:00 GMT"
            window.location.reload();
        });
    } else {
        console.error('Logout list element not found');
    }

    if (modifyOpenModal) {
        modifyOpenModal.addEventListener('click', function () {
            showModal();
        });
    } else {
        console.error('Modify open modal element not found');
    }

    window.addEventListener('click', function (event) {
        if (event.target == modal) {
            closeModal();
        }
    });

    if (filterProjects && gallery) {
        fetchAndDisplayCategories();
        fetchAndStoreWorks();
    } else {
        console.error('Essential elements not found');
    }

    function checkToken() {
        if (document.cookie.includes('token')) {
            const loggedInElements = document.getElementsByClassName('login-appears');
            const loggedOutElements = document.getElementsByClassName('logout-appears');
            for (let i = 0; i < loggedOutElements.length; i++) {
                loggedOutElements[i].style.display = 'none';
            }
            for (let i = 0; i < loggedInElements.length; i++) {
                loggedInElements[i].style.display = 'block';
            };
        } else {
            const loggedOutElements = document.getElementsByClassName('logout-appears');
            const loggedInElements = document.getElementsByClassName('login-appears');
            for (let i = 0; i < loggedOutElements.length; i++) {
                loggedOutElements[i].style.display = 'block';
            }
            for (let i = 0; i < loggedInElements.length; i++) {
                loggedInElements[i].style.display = 'none';
            }
            const headerTopElements = document.getElementsByClassName('header-top');
            if (headerTopElements.length > 0) {
                headerTopElements[0].style.marginTop = '50px';
            }
        }
    }

    checkToken();
});