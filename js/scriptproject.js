const projects = {
    airport: {
        projectTitle: "Lae International Airport",
        projectHero: "/images/Lae International Airport.jpg",
        projectDescription: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        galleryProject: [
            // fill this with images if there are more to add
        ]
    },
    
    airportControl: {
        projectTitle: "Kagamuga Airport Control Tower",
        projectHero: "/images/Kagamuga Airport Control Tower.jpg",
        projectDescription: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        galleryProject: [
            // fill this with images if there are more to add
        ]
    },

    apartment: {
        projectTitle: "S&J Apartments",
        projectHero: "/images/S&J Apartments 1.jpg",
        projectDescription: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        galleryProject: [
            "/images/S&J Apartments 2.jpg",
            "/images/S&J Apartments 3.jpg",
        ]
    }
};

// GALLERY VARIABLES
let currentProjectId = null;
let currentImageIndex = 0;
let currentGalleryImages = [];

// OPEN PROJECT
function openProject(id) {
    console.log('Opening project:', id);
    
    const project = projects[id];
    
    if (!project) {
        console.error('Project not found:', id);
        return;
    }
    
    currentProjectId = id;
    
    // Get elements
    const projectView = document.getElementById('projectView');
    const projectGrid = document.getElementById('projectGrid');
    const titleEl = document.getElementById('projectTitle');
    const heroEl = document.getElementById('projectHero');
    const descEl = document.getElementById('projectDescription');
    const galleryEl = document.getElementById('galleryProject');
    
    // Set project details
    titleEl.textContent = project.projectTitle;
    heroEl.src = project.projectHero;
    heroEl.alt = project.projectTitle;
    descEl.textContent = project.projectDescription;
    
    // Build gallery
    galleryEl.innerHTML = '';
    
    if (project.galleryProject && project.galleryProject.length > 0) {
        currentGalleryImages = project.galleryProject;
        
        project.galleryProject.forEach((image, index) => {
            const img = document.createElement('img');
            img.src = image;
            img.alt = project.projectTitle + ' gallery image ' + (index + 1);
            img.loading = 'lazy';
            
            // Click to open image viewer
            img.onclick = function() {
                openImageViewer(index);
            };
            
            // Add error handling
            img.onerror = function() {
                console.error('Failed to load image:', image);
                this.src = 'https://via.placeholder.com/400x300/333/666?text=Image+Not+Found';
            };
            
            galleryEl.appendChild(img);
        });
    } else {
        galleryEl.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; color: #999; padding: 40px; background: #1a1a1a; border-radius: 10px;">
                <p>No additional images available for this project.</p>
            </div>
        `;
    }
    
    // Show project view
    projectView.style.display = 'block';
    projectView.classList.add('active');
    projectGrid.style.display = 'none';
}

// BACK TO PROJECTS
function backToProjects() {
    const projectView = document.getElementById('projectView');
    const projectGrid = document.getElementById('projectGrid');
    
    projectGrid.style.display = 'grid';
    projectView.style.display = 'none';
    projectView.classList.remove('active');
}

// IMAGE VIEWER (LIGHTBOX)
function openImageViewer(index) {
    currentImageIndex = index;
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const caption = document.getElementById('modalCaption');
    
    modal.style.display = 'flex';
    modalImg.src = currentGalleryImages[index];
    modalImg.alt = 'Gallery image ' + (index + 1);
    
    // Update caption
    const project = projects[currentProjectId];
    caption.textContent = project ? project.projectTitle + ' - Image ' + (index + 1) : 'Image ' + (index + 1);
    
    document.body.style.overflow = 'hidden';
}

function closeImageViewer() {
    document.getElementById('imageModal').style.display = 'none';
    document.body.style.overflow = '';
}

function prevImage() {
    if (currentImageIndex > 0) {
        openImageViewer(currentImageIndex - 1);
    } else {
        openImageViewer(currentGalleryImages.length - 1);
    }
}

function nextImage() {
    if (currentImageIndex < currentGalleryImages.length - 1) {
        openImageViewer(currentImageIndex + 1);
    } else {
        openImageViewer(0);
    }
}

// KEYBOARD CONTROLS
document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('imageModal');
    if (modal.style.display === 'flex') {
        if (e.key === 'Escape') closeImageViewer();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'ArrowRight') nextImage();
    }
});

// CLOSE MODAL ON CLICK OUTSIDE
document.getElementById('imageModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeImageViewer();
    }
});

console.log('Gallery JavaScript loaded!');
console.log('Projects available:', Object.keys(projects));