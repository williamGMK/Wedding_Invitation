// Create floating hearts
function createFloatingHearts() {
  const container = document.getElementById("floatingHearts");
  if (!container) return;

  const heartCount = 20;

  for (let i = 0; i < heartCount; i++) {
    const heart = document.createElement("div");
    heart.className = "floating-heart";
    heart.innerHTML = '<i class="fas fa-heart"></i>';

    // Random position
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const delay = Math.random() * 5;
    const duration = 8 + Math.random() * 6;

    heart.style.left = `${left}%`;
    heart.style.top = `${top}%`;
    heart.style.animationDelay = `${delay}s`;
    heart.style.animationDuration = `${duration}s`;

    container.appendChild(heart);
  }
}

// Create particle animation
function createParticles() {
  const container = document.getElementById("particlesContainer");
  if (!container) return;

  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";

    // Random properties
    const size = Math.random() * 10 + 5;
    const left = Math.random() * 100;
    const delay = Math.random() * 15;
    const duration = Math.random() * 10 + 10;

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${left}%`;
    particle.style.animationDelay = `${delay}s`;
    particle.style.animationDuration = `${duration}s`;
    particle.style.background = `rgba(255, 215, 0, ${
      Math.random() * 0.5 + 0.2
    })`;

    container.appendChild(particle);
  }
}

// Create confetti animation
function createConfetti() {
  const container = document.getElementById("confettiContainer");
  if (!container) return;

  container.style.display = "block";

  const colors = ["#FFD700", "#D4AF37", "#B8860B", "#C0C0C0"];
  const confettiCount = 150;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";

    // Random properties
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const size = Math.random() * 10 + 5;
    const duration = Math.random() * 3 + 3;
    const delay = Math.random() * 5;

    confetti.style.left = `${left}%`;
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size * 2}px`;
    confetti.style.background = color;
    confetti.style.animation = `fall ${duration}s ease-in ${delay}s forwards`;

    container.appendChild(confetti);
  }

  // Remove confetti after animation
  setTimeout(() => {
    container.innerHTML = "";
    container.style.display = "none";
  }, 8000);
}

// Enhanced Slider with Auto-play and Touch Support
class WeddingSlider {
  constructor() {
    this.slider = document.querySelector(".slider");
    if (!this.slider) return;

    this.slides = document.querySelectorAll(".slider img");
    this.dots = document.querySelectorAll(".dot");
    this.prevBtn = document.querySelector(".prev");
    this.nextBtn = document.querySelector(".next");
    this.currentIndex = 0;
    this.autoPlayInterval = null;
    this.touchStartX = 0;
    this.touchEndX = 0;

    this.init();
  }

  init() {
    // Event listeners
    if (this.prevBtn)
      this.prevBtn.addEventListener("click", () => this.prevSlide());
    if (this.nextBtn)
      this.nextBtn.addEventListener("click", () => this.nextSlide());

    // Dot navigation
    this.dots.forEach((dot, index) => {
      dot.addEventListener("click", () => this.goToSlide(index));
    });

    // Touch events
    this.slider.addEventListener("touchstart", (e) => this.handleTouchStart(e));
    this.slider.addEventListener("touchend", (e) => this.handleTouchEnd(e));

    // Auto-play
    this.startAutoPlay();

    // Pause on hover
    this.slider.parentElement.addEventListener("mouseenter", () =>
      this.stopAutoPlay()
    );
    this.slider.parentElement.addEventListener("mouseleave", () =>
      this.startAutoPlay()
    );
  }

  showSlide(index) {
    // Handle boundaries
    if (index >= this.slides.length) index = 0;
    if (index < 0) index = this.slides.length - 1;

    this.currentIndex = index;
    this.slider.style.transform = `translateX(${-index * 100}%)`;

    // Update dots
    this.dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
  }

  nextSlide() {
    this.showSlide(this.currentIndex + 1);
  }

  prevSlide() {
    this.showSlide(this.currentIndex - 1);
  }

  goToSlide(index) {
    this.showSlide(index);
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => this.nextSlide(), 5000);
  }

  stopAutoPlay() {
    clearInterval(this.autoPlayInterval);
  }

  handleTouchStart(e) {
    this.touchStartX = e.changedTouches[0].screenX;
    this.stopAutoPlay();
  }

  handleTouchEnd(e) {
    this.touchEndX = e.changedTouches[0].screenX;
    this.handleSwipe();
    this.startAutoPlay();
  }

  handleSwipe() {
    const swipeThreshold = 50;
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        this.nextSlide();
      } else {
        this.prevSlide();
      }
    }
  }
}

// Scroll Animations
class ScrollAnimations {
  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");

            // Special animation for love meter
            if (entry.target.id === "us") {
              setTimeout(() => {
                const loveFill = document.getElementById("loveFill");
                const loveText = document.getElementById("loveText");
                if (loveFill && loveText) {
                  loveFill.style.width = "100%";
                  loveText.textContent = "Our Love: 25 Years & Growing!";
                }
              }, 500);
            }

            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    this.init();
  }

  init() {
    document
      .querySelectorAll(".fade-up, .fade-in, .bounce-in")
      .forEach((el) => {
        this.observer.observe(el);
      });
  }
}

// Countdown Timer
class CountdownTimer {
  constructor() {
    this.weddingDate = new Date("December 13, 2025 00:00:00").getTime();
    this.daysElement = document.getElementById("days");
    this.hoursElement = document.getElementById("hours");
    this.minutesElement = document.getElementById("minutes");
    this.secondsElement = document.getElementById("seconds");
    this.countdownInterval = null;

    if (this.daysElement) {
      this.init();
    }
  }

  init() {
    this.updateCountdown();
    this.countdownInterval = setInterval(() => this.updateCountdown(), 1000);
  }

  updateCountdown() {
    const now = Date.now();
    const distance = this.weddingDate - now;

    if (distance < 0) {
      if (this.daysElement) this.daysElement.textContent = "00";
      if (this.hoursElement) this.hoursElement.textContent = "00";
      if (this.minutesElement) this.minutesElement.textContent = "00";
      if (this.secondsElement) this.secondsElement.textContent = "00";
      clearInterval(this.countdownInterval);
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (this.daysElement)
      this.daysElement.textContent = days.toString().padStart(2, "0");
    if (this.hoursElement)
      this.hoursElement.textContent = hours.toString().padStart(2, "0");
    if (this.minutesElement)
      this.minutesElement.textContent = minutes.toString().padStart(2, "0");
    if (this.secondsElement)
      this.secondsElement.textContent = seconds.toString().padStart(2, "0");
  }
}

// Quote Carousel
class QuoteCarousel {
  constructor() {
    this.slides = document.querySelectorAll(".quote-slide");
    if (this.slides.length === 0) return;

    this.currentIndex = 0;

    this.init();
  }

  init() {
    // Auto-rotate quotes
    setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide() {
    this.slides[this.currentIndex].classList.remove("active");
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.slides[this.currentIndex].classList.add("active");
  }
}

// Photo Gallery with Lightbox
class PhotoGallery {
  constructor() {
    this.galleryItems = document.querySelectorAll(".gallery-item");
    if (this.galleryItems.length === 0) return;

    this.modal = document.getElementById("galleryModal");
    this.modalImage = document.getElementById("galleryImage");
    this.closeButton = document.getElementById("galleryClose");

    this.init();
  }

  init() {
    // Event listeners for gallery items
    this.galleryItems.forEach((item) => {
      item.addEventListener("click", () => {
        const imgSrc = item.querySelector("img").getAttribute("data-full");
        this.openModal(imgSrc);
      });
    });

    // Close modal
    if (this.closeButton) {
      this.closeButton.addEventListener("click", () => this.closeModal());
    }
    if (this.modal) {
      this.modal.addEventListener("click", (e) => {
        if (e.target === this.modal) this.closeModal();
      });
    }

    // Close with Escape key
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        this.modal &&
        this.modal.classList.contains("active")
      ) {
        this.closeModal();
      }
    });
  }

  openModal(imgSrc) {
    if (this.modalImage && this.modal) {
      this.modalImage.setAttribute("src", imgSrc);
      this.modal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  }
}

// Memory Tree Interaction
class MemoryTree {
  constructor() {
    this.branches = document.querySelectorAll(".tree-branch");
    this.details = document.getElementById("memoryDetails");

    if (this.branches.length === 0) return;

    this.memories = {
      2000: "The year we met and fell in love. It was a beautiful summer that changed our lives forever.",
      2005: "Welcomed our first child, a beautiful daughter who brought so much joy to our lives.",
      2008: "Our family grew again with the arrival of our son, completing our beautiful family.",
      2015: "Celebrated 15 years together with a romantic trip to Paris, the city of love.",
      2020: "Twenty years of marriage! We renewed our vows in an intimate ceremony with close family.",
    };

    this.init();
  }

  init() {
    this.branches.forEach((branch) => {
      branch.addEventListener("click", () => {
        const year = branch.getAttribute("data-year");
        this.showMemory(year);

        // Add animation effect
        branch.style.transform = "scale(1.3) rotate(15deg)";
        setTimeout(() => {
          branch.style.transform = "scale(1.2) rotate(15deg)";
        }, 300);
      });
    });
  }

  showMemory(year) {
    if (this.details) {
      this.details.textContent = this.memories[year];
      this.details.style.opacity = 0;

      setTimeout(() => {
        this.details.style.transition = "opacity 0.5s ease";
        this.details.style.opacity = 1;
      }, 10);
    }
  }
}

// Password Protection
class PasswordProtection {
  constructor() {
    this.dashboardLink = document.getElementById("dashboardLink");
    this.passwordModal = document.getElementById("passwordModal");
    this.passwordForm = document.getElementById("passwordForm");
    this.dashboardPassword = document.getElementById("dashboardPassword");
    this.passwordError = document.getElementById("passwordError");
    this.exitPassword = document.getElementById("exitPassword");
    this.correctPassword = "Aziza@Eric25An";

    if (this.dashboardLink) {
      this.init();
    }
  }

  init() {
    // Open password modal when dashboard link is clicked
    if (this.dashboardLink) {
      this.dashboardLink.addEventListener("click", (e) => {
        e.preventDefault();
        if (this.passwordModal) {
          this.passwordModal.classList.add("active");
        }
        if (this.dashboardPassword) {
          this.dashboardPassword.focus();
        }
      });
    }

    // Handle password form submission
    if (this.passwordForm) {
      this.passwordForm.addEventListener("submit", (e) => {
        e.preventDefault();

        if (
          this.dashboardPassword &&
          this.dashboardPassword.value === this.correctPassword
        ) {
          // Password is correct - redirect to dashboard
          window.location.href = "dashboard.html";
        } else {
          // Password is incorrect - show error
          if (this.passwordError) {
            this.passwordError.classList.add("show");
          }
          if (this.dashboardPassword) {
            this.dashboardPassword.focus();
          }
        }
      });
    }

    // Close password modal
    if (this.exitPassword) {
      this.exitPassword.addEventListener("click", () => {
        if (this.passwordModal) {
          this.passwordModal.classList.remove("active");
        }
        if (this.passwordForm) {
          this.passwordForm.reset();
        }
        if (this.passwordError) {
          this.passwordError.classList.remove("show");
        }
      });
    }

    // Close modal when clicking outside
    if (this.passwordModal) {
      this.passwordModal.addEventListener("click", (e) => {
        if (e.target === this.passwordModal) {
          this.passwordModal.classList.remove("active");
          if (this.passwordForm) {
            this.passwordForm.reset();
          }
          if (this.passwordError) {
            this.passwordError.classList.remove("show");
          }
        }
      });
    }
  }
}
