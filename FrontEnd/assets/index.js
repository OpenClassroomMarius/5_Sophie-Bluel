document.addEventListener('DOMContentLoaded', function () {
    const filterProjects = document.getElementById('filter-projects');
    const gallery = document.getElementById('gallery');
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
            .then(function (response) { return response.json(); })
            .then(function (categories) {
                console.log(categories);
                filterProjects.innerHTML = createFilterHtml(categories);
                addFilterEventListeners();  // Add event listeners for filtering
            });
    }

    function fetchAndStoreWorks() {
        fetch('http://localhost:5678/api/works')
            .then(function (response) { return response.json(); })
            .then(function (works) {
                worksData = works;
                updateGallery();  // Display all works initially
            });
    }

    function updateGallery(categoryId) {
        let filteredWorks;
        if (categoryId && categoryId !== 'all') {
            filteredWorks = worksData.filter(function (work) { return work.categoryId == categoryId; });
        } else {
            filteredWorks = worksData;
        }
        gallery.innerHTML = createGalleryHtml(filteredWorks);
    }

    fetchAndDisplayCategories();
    fetchAndStoreWorks();
});