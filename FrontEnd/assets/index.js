document.addEventListener('DOMContentLoaded', function () {
	const filterProjects = document.getElementById('filter-projects');
	const gallery = document.getElementById('gallery');

	// Function to create filter HTML
	const createFilterHtml = (categories) => {
		let filterHtml = '<div class="afilter afilterselected"><p class="filtertxt">Tous</p></div>';
		categories.forEach(category => {
			filterHtml += `<div class="afilter" data-category-id="${category.id}"><p class="filtertxt">${category.name}</p></div>`;
		});
		return filterHtml;
	};

	// Function to create gallery HTML
	const createGalleryHtml = (works) => {
		return works.map(work => `
			<figure>
				<img src="${work.imageUrl}" alt="${work.title}">
				<figcaption>${work.title}</figcaption>
			</figure>
		`).join('');
	};

	// Fetch categories and update filter section
	fetch('http://localhost:5678/api/categories')
		.then(response => response.json())
		.then(categories => {
            console.log(categories);
			filterProjects.innerHTML = createFilterHtml(categories);
			// Add event listeners for filtering
			document.querySelectorAll('.afilter').forEach(filter => {
				filter.addEventListener('click', function () {
					const categoryId = this.getAttribute('data-category-id');
					filterProjects.querySelectorAll('.afilter').forEach(f => f.classList.remove('afilterselected'));
					this.classList.add('afilterselected');
					updateGallery(categoryId);
				});
			});
		});

	// Fetch works and update gallery section
	const updateGallery = (categoryId) => {
		fetch('http://localhost:5678/api/works')
			.then(response => response.json())
			.then(works => {
				if (categoryId) {
					works = works.filter(work => work.categoryId == categoryId);
				}
				gallery.innerHTML = createGalleryHtml(works);
			});
	};

	// Initial gallery load with all works
	updateGallery();
});