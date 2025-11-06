// Enhanced RSVP Modal with MongoDB Backend Integration
class RSVPModal {
  constructor() {
    this.modal = document.getElementById("rsvpModal");
    this.formContainer = document.getElementById("rsvpFormContainer");
    this.openButton = document.getElementById("openRsvp");
    this.closeButton = document.getElementById("closeModal");
    this.exitButton = document.getElementById("exitRsvp");
    this.form = document.getElementById("rsvpForm");
    this.toast = document.getElementById("toastNotification");
    this.baseURL = window.location.origin; // Your server URL

    if (this.openButton) {
      this.init();
    }
  }

  init() {
    // Event listeners
    this.openButton.addEventListener("click", () => this.openModal());
    if (this.closeButton)
      this.closeButton.addEventListener("click", () => this.closeModal());
    if (this.exitButton)
      this.exitButton.addEventListener("click", () => this.closeModal());
    if (this.modal) {
      this.modal.addEventListener("click", (e) => {
        if (e.target === this.modal) this.closeModal();
      });
    }
    if (this.form) {
      this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    }

    // Close modal with Escape key
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

  openModal() {
    if (this.modal) {
      this.modal.classList.add("active");
      document.body.style.overflow = "hidden";
      // Scroll to top when opening
      if (this.formContainer) {
        this.formContainer.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.remove("active");
      document.body.style.overflow = "auto";
      // Reset form when closing
      setTimeout(() => {
        if (this.form) {
          this.form.reset();
        }
      }, 300);
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    // Show loading animation
    const loader = document.getElementById("pageLoader");
    if (loader) loader.classList.add("show");

    // Collect form data
    const formData = this.collectFormData();

    // Validate form
    if (!this.validateForm(formData)) {
      if (loader) loader.classList.remove("show");
      return;
    }

    try {
      // Submit to MongoDB backend
      await this.submitToBackend(formData);
      if (loader) loader.classList.remove("show");
    } catch (error) {
      console.error("Error submitting RSVP:", error);
      if (loader) loader.classList.remove("show");
      this.showError(
        "There was an error submitting your RSVP. Please try again."
      );
    }
  }

  collectFormData() {
    return {
      name: document.getElementById("guestName")
        ? document.getElementById("guestName").value.trim()
        : "",
      email: document.getElementById("guestEmail")
        ? document.getElementById("guestEmail").value.trim().toLowerCase()
        : "",
      guests: document.getElementById("guestCount")
        ? parseInt(document.getElementById("guestCount").value) || 1
        : 1,
      attending: document.querySelector('input[name="attending"]:checked')
        ? document.querySelector('input[name="attending"]:checked').value
        : "",
      message: document.getElementById("guestMessage")
        ? document.getElementById("guestMessage").value.trim()
        : "",
      timestamp: new Date().toISOString(),
    };
  }

  validateForm(data) {
    // Basic validation
    if (!data.name || data.name.length < 2) {
      this.showError("Please enter a valid name (at least 2 characters)");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      this.showError("Please enter a valid email address");
      return false;
    }

    if (!data.guests || data.guests < 1) {
      this.showError("Please select number of guests");
      return false;
    }

    if (!data.attending) {
      this.showError("Please select whether you will be attending");
      return false;
    }

    return true;
  }

  async submitToBackend(data) {
    try {
      const response = await fetch(`${this.baseURL}/api/rsvp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit RSVP");
      }

      if (result.success) {
        // Show success message
        this.showSuccess();
        this.closeModal();
        if (this.form) this.form.reset();

        // Trigger confetti animation for successful submission
        createConfetti();

        console.log("RSVP submitted successfully:", result.data);
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (error) {
      console.error("Error submitting to backend:", error);

      // Fallback to localStorage if backend is unavailable
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        this.showWarning(
          "Connection issue. Saving locally. Your RSVP will be submitted when connection is restored."
        );
        this.saveToLocalStorage(data);
        this.closeModal();
        if (this.form) this.form.reset();
      } else {
        throw error; // Re-throw other errors
      }
    }
  }

  // Fallback method: Save to localStorage if backend is down
  saveToLocalStorage(data) {
    try {
      let pendingRsvps = JSON.parse(localStorage.getItem("pendingRsvps")) || [];

      // Add unique ID and pending status
      const pendingRsvp = {
        ...data,
        id:
          "pending_" +
          Date.now() +
          "_" +
          Math.random().toString(36).substr(2, 9),
        status: "pending",
        retryCount: 0,
      };

      pendingRsvps.push(pendingRsvp);
      localStorage.setItem("pendingRsvps", JSON.stringify(pendingRsvps));

      console.log("RSVP saved to localStorage (pending):", pendingRsvp);

      // Try to sync pending RSVPs in background
      this.syncPendingRsvps();
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  // Sync pending RSVPs with backend
  async syncPendingRsvps() {
    try {
      const pendingRsvps =
        JSON.parse(localStorage.getItem("pendingRsvps")) || [];

      if (pendingRsvps.length === 0) return;

      const successfulSubmissions = [];

      for (const rsvp of pendingRsvps) {
        try {
          const response = await fetch(`${this.baseURL}/api/rsvp`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(rsvp),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              successfulSubmissions.push(rsvp.id);
              console.log("Successfully synced pending RSVP:", rsvp.id);
            }
          }
        } catch (error) {
          console.log("Failed to sync RSVP, will retry later:", rsvp.id);
        }
      }

      // Remove successfully submitted RSVPs from pending
      if (successfulSubmissions.length > 0) {
        const updatedPending = pendingRsvps.filter(
          (rsvp) => !successfulSubmissions.includes(rsvp.id)
        );
        localStorage.setItem("pendingRsvps", JSON.stringify(updatedPending));
        console.log(`Synced ${successfulSubmissions.length} pending RSVPs`);
      }
    } catch (error) {
      console.error("Error syncing pending RSVPs:", error);
    }
  }

  showSuccess() {
    if (!this.toast) return;

    this.toast.querySelector(".toast-title").textContent = "Success!";
    this.toast.querySelector(".toast-message").textContent =
      "Your RSVP has been submitted successfully!";
    this.toast.querySelector("i").className = "fas fa-check-circle";
    this.toast.classList.add("show");

    setTimeout(() => {
      this.toast.classList.remove("show");
    }, 5000);
  }

  showError(message) {
    if (!this.toast) return;

    this.toast.querySelector(".toast-title").textContent = "Error";
    this.toast.querySelector(".toast-message").textContent = message;
    this.toast.querySelector("i").className = "fas fa-exclamation-circle";
    this.toast.classList.add("show");

    setTimeout(() => {
      this.toast.classList.remove("show");
    }, 5000);
  }

  showWarning(message) {
    if (!this.toast) return;

    this.toast.querySelector(".toast-title").textContent = "Notice";
    this.toast.querySelector(".toast-message").textContent = message;
    this.toast.querySelector("i").className = "fas fa-exclamation-triangle";
    this.toast.classList.add("show");

    setTimeout(() => {
      this.toast.classList.remove("show");
    }, 5000);
  }
}

// Auto-sync pending RSVPs on page load
async function initializeRSVPSync() {
  try {
    const pendingRsvps = JSON.parse(localStorage.getItem("pendingRsvps")) || [];

    if (pendingRsvps.length > 0) {
      console.log(
        `Found ${pendingRsvps.length} pending RSVPs, attempting to sync...`
      );

      // Create a temporary instance to use the sync method
      const rsvpHandler = new RSVPModal();
      await rsvpHandler.syncPendingRsvps();

      // Check if any remain after sync
      const remaining = JSON.parse(localStorage.getItem("pendingRsvps")) || [];
      if (remaining.length === 0) {
        console.log("All pending RSVPs synced successfully!");
      } else {
        console.log(`${remaining.length} RSVPs still pending sync`);
      }
    }
  } catch (error) {
    console.error("Error initializing RSVP sync:", error);
  }
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  createFloatingHearts();
  createParticles();
  new WeddingSlider();
  new ScrollAnimations();
  new CountdownTimer();
  new RSVPModal();
  new QuoteCarousel();
  new PhotoGallery();
  new MemoryTree();
  new PasswordProtection();

  // Initialize RSVP sync for pending submissions
  await initializeRSVPSync();

  // Scroll progress bar
  window.addEventListener("scroll", () => {
    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const scrollProgress = document.getElementById("scrollProgress");
    if (scrollProgress) {
      scrollProgress.style.width = scrolled + "%";
    }
  });

  // Music player
  const musicPlayer = document.getElementById("musicPlayer");
  const backgroundMusic = document.getElementById("backgroundMusic");
  let isPlaying = false;

  if (musicPlayer && backgroundMusic) {
    musicPlayer.addEventListener("click", () => {
      if (isPlaying) {
        backgroundMusic.pause();
        musicPlayer.innerHTML = '<i class="fas fa-music"></i>';
      } else {
        backgroundMusic.play();
        musicPlayer.innerHTML = '<i class="fas fa-pause"></i>';
      }
      isPlaying = !isPlaying;
    });
  }

  // Mobile navigation toggle (for smaller screens)
  const navbar = document.querySelector(".navbar");
  if (navbar && window.innerWidth <= 768) {
    navbar.classList.remove("w3-hide-small");
  }

  // Update navigation active state on scroll
  window.addEventListener("scroll", () => {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".navbar a");

    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollY >= sectionTop - 200) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href").substring(1) === current) {
        link.classList.add("active");
      }
    });
  });

  // Add loading animation on page load
  window.addEventListener("load", () => {
    const loader = document.getElementById("pageLoader");
    if (loader) {
      loader.classList.add("show");

      setTimeout(() => {
        loader.classList.remove("show");
      }, 1500);
    }
  });
});
