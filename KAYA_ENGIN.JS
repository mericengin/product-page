document.addEventListener('DOMContentLoaded', function () {
    const productUrl = 'https://gist.githubusercontent.com/sevindi/5765c5812bbc8238a38b3cf52f233651/raw/56261d81af8561bf0a7cf692fe572f9e1e91f372/products.json';

    // Fetch product data from localStorage or API
    const fetchProductData = async () => {
        let products = JSON.parse(localStorage.getItem('products'));

        if (!products) {
            try {
                const response = await fetch(productUrl);
                products = await response.json();
                localStorage.setItem('products', JSON.stringify(products));
            } catch (error) {
                console.error('Error fetching product data:', error);
            }
        }

        return products;
    };

    // Create the product carousel
    const createCarousel = (products) => {
        const container = document.querySelector('.product-detail');
        const carouselWrapper = document.createElement('div');
        carouselWrapper.classList.add('product-carousel');

        const title = document.createElement('h2');
        title.textContent = 'You Might Also Like';
        carouselWrapper.appendChild(title);

        const carouselInner = document.createElement('div');
        carouselInner.classList.add('carousel-inner');

        // Loop through products and create the carousel elements
        products.forEach((product, index) => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
            <a href="${product.url}" target="_blank">
                <img src="${product.img}" alt="${product.name}">
                <p>${product.name}</p>
                <p class="price">${product.price} TRY</p>
            </a>
                <button class="heart" data-id="${product.id}">&#x2764;</button>
            `;
            carouselInner.appendChild(productCard);
        });

        // Create and add arrows before adding them to DOM
        const leftArrow = document.createElement('button');
        leftArrow.classList.add('arrow', 'left');
        leftArrow.innerHTML = '&#8592;';
        
        const rightArrow = document.createElement('button');
        rightArrow.classList.add('arrow', 'right');
        rightArrow.innerHTML = '&#8594;';

        // Add event listeners
        leftArrow.addEventListener('click', () => slideCarousel('left', products, carouselInner));
        rightArrow.addEventListener('click', () => slideCarousel('right', products, carouselInner));

        // Add arrows to carousel wrapper
        carouselWrapper.appendChild(leftArrow);
        carouselWrapper.appendChild(carouselInner);
        carouselWrapper.appendChild(rightArrow);

        // Set initial visibility
        leftArrow.style.display = 'none';
        rightArrow.style.display = products.length <= 6.5 ? 'none' : 'block';

        container.appendChild(carouselWrapper);

        // Initialize the carousel view
        updateCarouselView(products, carouselInner);
    };

    let currentSlide = 0;
    let products = [];

    // Slide carousel left or right
    const slideCarousel = (direction, products, carouselInner) => {
        const totalProducts = products.length;
        const productCards = document.querySelectorAll('.product-card');
        
        // Adjust visible products based on screen width
        let visibleProducts;
        if (window.innerWidth <= 768) {
            visibleProducts = 2.5; // Mobile
        } else if (window.innerWidth <= 1024) {
            visibleProducts = 4.5; // Tablet
        } else {
            visibleProducts = 6.5; // Desktop
        }

        const maxSlide = totalProducts - visibleProducts;
        const slideWidth = productCards[0].offsetWidth + 20;

        if (direction === 'left' && currentSlide > 0) {
            currentSlide--;
        } else if (direction === 'right' && currentSlide < maxSlide) {
            currentSlide++;
        }

        // Update arrow visibility
        const leftArrow = document.querySelector('.arrow.left');
        const rightArrow = document.querySelector('.arrow.right');
        
        leftArrow.style.display = currentSlide === 0 ? 'none' : 'block';
        rightArrow.style.display = currentSlide >= maxSlide ? 'none' : 'block';

        carouselInner.style.transition = 'transform 0.5s ease';
        carouselInner.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
    };

    // Update carousel content based on the current slide index
    const updateCarouselView = (products, carouselInner) => {
        const productCards = document.querySelectorAll('.product-card');
        const slideWidth = productCards[0]?.offsetWidth + 20; // Including gap

        carouselInner.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
        
        // Remove the display none/block logic since we want all cards to be visible
        productCards.forEach(card => {
            card.style.display = 'block';
        });
    };

    // Toggle heart icon and favorite product storage
    const toggleFavorite = (productId) => {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        if (favorites.includes(productId)) {
            favorites = favorites.filter(id => id !== productId);
        } else {
            favorites.push(productId);
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateHeartIcons();
    };

    // Update heart icons based on favorites
    const updateHeartIcons = () => {
        const favoriteProducts = JSON.parse(localStorage.getItem('favorites')) || [];
        const heartIcons = document.querySelectorAll('.heart');
        heartIcons.forEach(icon => {
            const productId = icon.dataset.id;
            if (favoriteProducts.includes(productId)) {
                icon.style.color = 'blue';
            } else {
                icon.style.color = '';
            }
        });
    };

    // Add event listeners to heart buttons
    const addHeartEventListeners = () => {
        const heartButtons = document.querySelectorAll('.heart');
        heartButtons.forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.dataset.id;
                toggleFavorite(productId);
            });
        });
    };

    // Adjust the carousel when the window is resized
    const adjustCarousel = () => {
        const carouselInner = document.querySelector('.carousel-inner');
        const productCards = document.querySelectorAll('.product-card');
        const slideWidth = productCards[0]?.offsetWidth + 10;

        if (!productCards.length || !slideWidth) return;

        carouselInner.style.width = `${slideWidth * products.length}px`;
        carouselInner.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
    };

    // Initialize the application
    const init = async () => {
        products = await fetchProductData();

        if (!products || products.length === 0) {
            alert('No products available.');
            return;
        }

        createCarousel(products);
        updateHeartIcons();
        addHeartEventListeners();

        window.addEventListener('resize', adjustCarousel);
    };

    // Initialize the application
    window.addEventListener('load', () => {
        init();
    });
});