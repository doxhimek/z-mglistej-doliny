/* =========================================================
   Plik: script.js
   Menu, lightbox, automatyczny slajder i automatyczna galeria z lista.txt
   ========================================================= */

const mobileMenu = document.getElementById("mobileMenu");
const overlay = document.getElementById("overlay");

function openMenu(){
    if(mobileMenu) mobileMenu.classList.add("open");
    if(overlay) overlay.classList.add("show");
}

function closeMenu(){
    if(mobileMenu) mobileMenu.classList.remove("open");
    if(overlay) overlay.classList.remove("show");
}

if(overlay){
    overlay.addEventListener("click", closeMenu);
}

/* ===================== LIGHTBOX ===================== */

let currentImageIndex = 0;
let currentLightboxImages = [];

function getLightboxElements(){
    return {
        box: document.getElementById("lightbox"),
        img: document.getElementById("lightbox-img"),
        caption: document.getElementById("lightbox-caption"),
        counter: document.getElementById("lightbox-counter")
    };
}

function openLightbox(images, startIndex){
    const elements = getLightboxElements();

    if(!elements.box || !elements.img || !images || images.length === 0){
        return;
    }

    currentLightboxImages = images;
    currentImageIndex = startIndex || 0;

    elements.box.classList.add("show");
    updateLightbox();
}

function updateLightbox(){
    const elements = getLightboxElements();
    const image = currentLightboxImages[currentImageIndex];

    if(!elements.box || !elements.img || !image){
        return;
    }

    elements.img.src = image.src;
    elements.img.alt = image.alt || "";

    if(elements.caption){
        elements.caption.textContent = image.caption || image.alt || "";
    }

    if(elements.counter){
        elements.counter.textContent = (currentImageIndex + 1) + " / " + currentLightboxImages.length;
    }
}

function closeImage(){
    const elements = getLightboxElements();

    if(elements.box){
        elements.box.classList.remove("show");
    }
}

function nextImage(event){
    if(event) event.stopPropagation();

    if(currentLightboxImages.length === 0){
        return;
    }

    currentImageIndex++;

    if(currentImageIndex >= currentLightboxImages.length){
        currentImageIndex = 0;
    }

    updateLightbox();
}

function prevImage(event){
    if(event) event.stopPropagation();

    if(currentLightboxImages.length === 0){
        return;
    }

    currentImageIndex--;

    if(currentImageIndex < 0){
        currentImageIndex = currentLightboxImages.length - 1;
    }

    updateLightbox();
}

const lightbox = document.getElementById("lightbox");

if(lightbox){
    lightbox.addEventListener("click", closeImage);
}

const lightboxImage = document.getElementById("lightbox-img");

if(lightboxImage){
    lightboxImage.addEventListener("click", function(event){
        event.stopPropagation();
    });
}

document.addEventListener("keydown", function(event){
    const elements = getLightboxElements();

    if(!elements.box || !elements.box.classList.contains("show")){
        return;
    }

    if(event.key === "Escape") closeImage();
    if(event.key === "ArrowRight") nextImage(event);
    if(event.key === "ArrowLeft") prevImage(event);
});

/* ===================== POMOCNICZE: CZYTANIE lista.txt ===================== */

function parseImageList(text){
    return text
        .split("\n")
        .map(line => line.trim())
        .filter(line => line !== "" && !line.startsWith("#"))
        .map(line => {
            const parts = line.split("|");
            return {
                file: (parts[0] || "").trim(),
                caption: (parts[1] || "").trim()
            };
        })
        .filter(item => item.file !== "");
}

function readImageList(listPath){
    return fetch(listPath, {cache:"no-store"})
        .then(response => {
            if(!response.ok){
                throw new Error("Nie znaleziono pliku: " + listPath);
            }
            return response.text();
        })
        .then(parseImageList);
}

function joinPath(folder, file){
    return folder + file;
}

/* ===================== GALERIA ZAKŁADKI GALERIA ===================== */

function setupGalleryClicks(gallery){
    const items = Array.from(gallery.querySelectorAll(".gallery-item"));
    const images = items.map(item => {
        const img = item.querySelector("img");
        const caption = item.querySelector("figcaption");

        return {
            src: img.src,
            alt: img.alt || "",
            caption: caption ? caption.textContent : img.alt || ""
        };
    });

    items.forEach(function(item, index){
        const img = item.querySelector("img");
        if(!img) return;

        img.addEventListener("click", function(){
            openLightbox(images, index);
        });
    });
}

function loadAutoGallery(){
    const gallery = document.getElementById("galleryList");

    if(!gallery){
        document.querySelectorAll(".gallery").forEach(setupGalleryClicks);
        return;
    }

    const folder = gallery.dataset.folder || "assets/img/galeria/";
    const list = gallery.dataset.list || "assets/img/galeria/lista.txt";

    readImageList(list)
        .then(items => {
            items.reverse();
            gallery.innerHTML = "";

            if(items.length === 0){
                gallery.innerHTML = '<p class="empty-gallery-message">Brak zdjęć w galerii.</p>';
                return;
            }

            items.forEach(item => {
                const figure = document.createElement("figure");
                figure.className = "gallery-item";

                const img = document.createElement("img");
                img.src = joinPath(folder, item.file);
                img.alt = item.caption || "Zdjęcie hodowli";

                const caption = document.createElement("figcaption");
                caption.textContent = item.caption || "Zdjęcie hodowli";

                figure.appendChild(img);
                figure.appendChild(caption);
                gallery.appendChild(figure);
            });

            setupGalleryClicks(gallery);
        })
        .catch(() => {
            gallery.innerHTML = '<p class="empty-gallery-message">Dodaj zdjęcia do folderu galeria i wpisz je w lista.txt.</p>';
        });
}

/* ===================== MINI GALERIE PSÓW I SZCZENIAKÓW ===================== */

function setupDogGalleries(){
    document.querySelectorAll(".dog-gallery").forEach(function(gallery){
        if(gallery.dataset.ready === "true") return;

        const mainPhoto = gallery.querySelector(".dog-main-photo");
        const hiddenImages = Array.from(gallery.querySelectorAll(".dog-gallery-images img"));

        if(!mainPhoto || hiddenImages.length === 0) return;

        gallery.dataset.ready = "true";

        mainPhoto.addEventListener("click", function(){
            const images = hiddenImages.map(img => ({
                src: img.src,
                alt: img.alt || "",
                caption: img.alt || ""
            }));

            openLightbox(images, 0);
        });
    });
}

function loadPuppyGallery(){
    const gallery = document.getElementById("puppyGallery");

    if(!gallery){
        setupDogGalleries();
        return;
    }

    const folder = gallery.dataset.folder || "assets/img/szczeniaki/";
    const list = gallery.dataset.list || "assets/img/szczeniaki/lista.txt";
    const mainPhoto = gallery.querySelector(".dog-main-photo");
    const hiddenBox = gallery.querySelector(".dog-gallery-images");

    readImageList(list)
        .then(items => {
            items.reverse();

            if(!mainPhoto || !hiddenBox || items.length === 0){
                setupDogGalleries();
                return;
            }

            const first = items[0];
            mainPhoto.src = joinPath(folder, first.file);
            mainPhoto.alt = first.caption || "Szczeniaki";

            hiddenBox.innerHTML = "";

            items.forEach(item => {
                const img = document.createElement("img");
                img.src = joinPath(folder, item.file);
                img.alt = item.caption || "Szczeniaki";
                hiddenBox.appendChild(img);
            });

            gallery.dataset.ready = "false";
            setupDogGalleries();
        })
        .catch(() => {
            setupDogGalleries();
        });
}

/* ===================== SLAJDER NA STRONIE GŁÓWNEJ ===================== */

function loadHomeSlideshow(){
    const slideshow = document.getElementById("homeSlideshow");

    if(!slideshow) return;

    const folder = "assets/img/slajder/";
    const list = "assets/img/slajder/lista.txt";

    readImageList(list)
        .then(items => {
            slideshow.innerHTML = "";

            if(items.length === 0){
                slideshow.innerHTML = '<p class="empty-gallery-message">Dodaj zdjęcia do slajdera.</p>';
                return;
            }

            items.forEach(function(item, index){
                const img = document.createElement("img");
                img.src = joinPath(folder, item.file);
                img.alt = item.caption || "Zdjęcie hodowli";
                img.className = "slide";

                if(index === 0){
                    img.classList.add("active");
                }

                slideshow.appendChild(img);
            });

            const slides = slideshow.querySelectorAll(".slide");
            let slideIndex = 0;

            if(slides.length <= 1) return;

            setInterval(function(){
                slides[slideIndex].classList.remove("active");

                slideIndex++;

                if(slideIndex >= slides.length){
                    slideIndex = 0;
                }

                slides[slideIndex].classList.add("active");
            }, 5000);
        })
        .catch(() => {
            slideshow.innerHTML = '<p class="empty-gallery-message">Dodaj plik assets/img/slajder/lista.txt.</p>';
        });
}

/* ===================== START ===================== */

loadAutoGallery();
loadPuppyGallery();
loadHomeSlideshow();
