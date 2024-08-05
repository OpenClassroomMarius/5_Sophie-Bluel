document.addEventListener('DOMContentLoaded', function () {
    const filterProjects = document.getElementById('filter-projects');
    const gallery = document.getElementById('gallery');
    const galleryModal = document.getElementById('gallery-modal');
    const modal = document.getElementById('login-modal');
    const listLogout = document.getElementById('logout-list');
    const modifyOpenModal = document.getElementById('modify-open-modal');
    const closeButton = document.getElementById('close-button');
    const uploadForm = document.getElementById('upload-form');
    const imageUploadInput = document.getElementById('image-upload');
    const uploadIcon = document.getElementById('upload-icon');
    const uploadedImagePreview = document.getElementById('uploaded-image-preview');
    const arrowBackModal = document.getElementById('arrow-back-modal');
    const modalFirstPart = document.getElementById('modal-first-part');
    const modalSecondPart = document.getElementById('modal-second-part');
    const addPicture = document.getElementById('add-picture');

    let worksData = [];

    imageUploadInput.addEventListener('change', function (event) {
        const file = event.target.files[0];

        if (file) {
            if (file.size > 4 * 1024 * 1024) {
                alert('The image size should not exceed 4MB. Please select a smaller file.');
                imageUploadInput.value = '';
                uploadIcon.style.display = 'block';
                uploadedImagePreview.style.display = 'none';
                uploadedImagePreview.src = '';
                return;
            }

            const reader = new FileReader();

            reader.onload = function (e) {
                uploadIcon.style.display = 'none';
                uploadedImagePreview.src = e.target.result;
                uploadedImagePreview.style.display = 'block';
            };

            reader.readAsDataURL(file);
        }
    });

    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    } else {
        console.error('Close button not found');
    }
    function clearAllCookies() {
        const cookies = document.cookie.split(";");

        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          const eqPos = cookie.indexOf("=");
          let name;

          if (eqPos > -1) {
            name = cookie.substring(0, eqPos);
          } else {
            name = cookie;
          }
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        }
      }

    if (listLogout) {
        listLogout.addEventListener('click', function () {
            clearAllCookies();
            window.location.reload();
        });
    } else {
        console.error('Logout list element not found');
    }

    if (arrowBackModal) {
        arrowBackModal.addEventListener('click', function () {
            modalFirstPart.style.display = 'block';
            modalSecondPart.style.display = 'none';
        });
    } else {
        console.error('Arrow back modal element not found');
    }

    if (modifyOpenModal) {
        modifyOpenModal.addEventListener('click', showModal);
    } else {
        console.error('Modify open modal element not found');
    }

    if (addPicture) {
        addPicture.addEventListener('click', function () {
            modalFirstPart.style.display = 'none';
            modalSecondPart.style.display = 'block';
        });
    } else {
        console.error('Add picture element not found');
    }

    window.addEventListener('click', function (event) {
        if (event.target == modal) {
            closeModal();
        }
    });

    uploadForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(uploadForm);

        fetch('http://localhost:5678/api/works', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })
            .then(response => response.json())
            .then(data => {
                updateGallery();
                closeModal();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    });

    if (filterProjects && gallery) {
        fetchAndDisplayCategories();
        fetchAndStoreWorks();
    } else {
        console.error('Essential elements not found');
    }

    function getAuthToken() {
        const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='));
        return tokenCookie ? tokenCookie.split('=')[1] : null;
    }

    function createFilterHtml(categories) {
        let filterHtml = '<div class="afilter afilterselected" data-category-id="all"><p class="filtertxt">Tous</p></div>';
        categories.forEach(function (category) {
            filterHtml += `<div class="afilter" data-category-id="${category.id}"><p class="filtertxt">${category.name}</p></div>`;
        });
        return filterHtml;
    }

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

    function handleTrashClick(work, event) {
        event.stopPropagation();

        const token = getAuthToken();
        if (!token) {
            console.error('No authorization token found.');
            return;
        }

        fetch(`http://localhost:5678/api/works/${work.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete the work.');
                }
                worksData = worksData.filter(w => w.id !== work.id);
                updateGalleryModal();
                updateGallery();
            })
            .catch(error => {
                console.error('Error deleting work:', error);
            });
    }

    function createGalleryModal(works) {
        let galleryModalHtml = '';
        works.forEach(function (work, index) {
            galleryModalHtml += `
                <div class="modal-contain-image">
                    <img src="${work.imageUrl}" alt="${work.title}" class="modal-gallery-image">
                    <div class="trashContainer" data-index="${index}">
                        <i class="fa-solid fa-trash-can trash-color"></i>
                    </div>
                </div>
            `;
        });

        galleryModal.innerHTML = galleryModalHtml;

        const trashContainers = galleryModal.querySelectorAll('.trashContainer');
        trashContainers.forEach(function (trashContainer) {
            trashContainer.addEventListener('click', function (event) {
                const index = this.getAttribute('data-index');
                handleTrashClick(works[index], event);
            });
        });
    }

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
                    addFilterEventListeners();
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
        createGalleryModal(worksData);
    }

    function showModal() {
        if (modal) {
            modal.style.display = 'flex';
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

    function checkToken() {
        if (document.cookie.includes('token')) {
            const loggedInElements = document.getElementsByClassName('login-appears');
            const loggedOutElements = document.getElementsByClassName('logout-appears');
            for (let i = 0; i < loggedOutElements.length; i++) {
                loggedOutElements[i].style.display = 'none';
            }
            for (let i = 0; i < loggedInElements.length; i++) {
                loggedInElements[i].style.display = 'block';
            }
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
