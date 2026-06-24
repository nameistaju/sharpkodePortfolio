document.addEventListener("DOMContentLoaded", () => {
  const mobileBtn = document.querySelector("button.text-4xl.block.lg\\:hidden");
  const navMenu = document.querySelector("nav");
  const header = document.querySelector(".page-header");
  const progressBtn = document.getElementById("progress");
  const popup = document.getElementById("hiringPopup");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const cleanupSwipers = () => {
    document.querySelectorAll(".swiper").forEach((swiper) => {
      swiper.classList.remove(
        "swiper-initialized",
        "swiper-horizontal",
        "swiper-watch-progress",
        "swiper-backface-hidden",
        "swiper-3d",
        "swiper-creative",
        "swiper-flip"
      );
    });

    document.querySelectorAll(".swiper-slide").forEach((slide) => {
      slide.removeAttribute("style");
      slide.classList.remove(
        "swiper-slide-active",
        "swiper-slide-next",
        "swiper-slide-prev",
        "swiper-slide-visible",
        "swiper-slide-shadow-left",
        "swiper-slide-shadow-right",
        "swiper-slide-shadow-flip"
      );
    });

    document.querySelectorAll(".swiper-wrapper").forEach((wrapper) => {
      wrapper.removeAttribute("style");
    });
  };

  const setupMobileMenu = () => {
    if (!mobileBtn || !navMenu) {
      return;
    }

    // Create backdrop overlay dynamically if it doesn't exist
    let overlay = document.querySelector(".mobile-nav-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "mobile-nav-overlay fixed inset-0 bg-black/60 z-[40] transition-opacity duration-300 opacity-0 pointer-events-none";
      document.body.appendChild(overlay);
    }

    const openMenu = () => {
      navMenu.classList.remove("translate-x-full");
      navMenu.classList.add("translate-x-0");
      overlay.classList.remove("opacity-0", "pointer-events-none");
      overlay.classList.add("opacity-100", "pointer-events-auto");

      const svg = mobileBtn.querySelector("svg");
      if (svg) {
        svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>';
      }
      mobileBtn.classList.add("text-white");
      mobileBtn.classList.remove("text-black");
    };

    const closeMenu = () => {
      navMenu.classList.add("translate-x-full");
      navMenu.classList.remove("translate-x-0");
      overlay.classList.add("opacity-0", "pointer-events-none");
      overlay.classList.remove("opacity-100", "pointer-events-auto");

      const svg = mobileBtn.querySelector("svg");
      if (svg) {
        svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16m-7 6h7"></path>';
      }

      // Check if header is currently sticky
      const isSticky = header.classList.contains("is-sticky");
      if (isSticky) {
        mobileBtn.classList.add("text-black");
        mobileBtn.classList.remove("text-white");
      } else {
        mobileBtn.classList.add("text-white");
        mobileBtn.classList.remove("text-black");
      }
    };

    mobileBtn.addEventListener("click", () => {
      const isOpen = navMenu.classList.contains("translate-x-0");
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    overlay.addEventListener("click", closeMenu);

    // Close menu when links are clicked
    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", (e) => {
        // If it's a link pointing to another section/page, close mobile menu
        const href = link.getAttribute("href");
        if (href && !href.startsWith("#") && !link.nextElementSibling) {
          closeMenu();
        }
      });
    });
  };

  const setupMobileSubmenus = () => {
    if (!navMenu) return;
    const parentMenus = navMenu.querySelectorAll("li.group");
    parentMenus.forEach((li) => {
      const span = li.querySelector("span.cursor-pointer");
      const submenu = li.querySelector("ul");
      if (span && submenu) {
        // Initially set styles for mobile submenu transitioning
        submenu.style.transition = "max-height 0.3s ease-in-out, opacity 0.3s ease-in-out";
        submenu.style.overflow = "hidden";

        span.addEventListener("click", (e) => {
          if (window.innerWidth >= 1024) {
            return; // Use default CSS hover on desktop
          }
          e.stopPropagation();

          const isCollapsed = submenu.style.maxHeight === "0px" || !submenu.style.maxHeight;

          // Collapse other submenus
          parentMenus.forEach((otherLi) => {
            const otherSub = otherLi.querySelector("ul");
            if (otherSub && otherSub !== submenu) {
              otherSub.style.maxHeight = "0px";
              otherSub.style.opacity = "0";
              otherSub.style.visibility = "hidden";
              otherSub.classList.add("invisible");
            }
          });

          if (isCollapsed) {
            submenu.style.maxHeight = "500px";
            submenu.style.opacity = "1";
            submenu.style.visibility = "visible";
            submenu.classList.remove("invisible");
          } else {
            submenu.style.maxHeight = "0px";
            submenu.style.opacity = "0";
            submenu.style.visibility = "hidden";
            submenu.classList.add("invisible");
          }
        });
      }
    });
  };

  const setupSwipers = () => {
    if (typeof Swiper === "undefined") {
      return;
    }

    new Swiper(".heroSlider", {
      loop: true,
      effect: "fade",
      speed: 1000,
      allowTouchMove: true,
      autoplay: prefersReducedMotion
        ? false
        : {
            delay: 5000,
            disableOnInteraction: false,
          },
      navigation: {
        nextEl: ".heroSlider .absolute.right-10",
        prevEl: ".heroSlider .absolute.left-10",
      },
    });

    new Swiper("#our-clients .mySwiper", {
      loop: true,
      speed: 800,
      slidesPerView: 1.3,
      spaceBetween: 18,
      centeredSlides: false,
      autoplay: prefersReducedMotion
        ? false
        : {
            delay: 2200,
            disableOnInteraction: false,
          },
      breakpoints: {
        576: { slidesPerView: 2.1, spaceBetween: 20 },
        768: { slidesPerView: 3.2, spaceBetween: 22 },
        1024: { slidesPerView: 4.2, spaceBetween: 24 },
      },
    });

    new Swiper(".mySwiper2", {
      loop: true,
      speed: 900,
      slidesPerView: 1,
      spaceBetween: 20,
      autoplay: prefersReducedMotion
        ? false
        : {
            delay: 3600,
            disableOnInteraction: false,
          },
      breakpoints: {
        768: { slidesPerView: 2, spaceBetween: 24 },
        1024: { slidesPerView: 3, spaceBetween: 28 },
      },
      navigation: {
        nextEl: "#portfolio button:last-child",
        prevEl: "#portfolio button:first-child",
      },
    });

    new Swiper(".testimonialSwiper", {
      loop: true,
      speed: 850,
      slidesPerView: 1,
      autoHeight: true,
      spaceBetween: 24,
      autoplay: prefersReducedMotion
        ? false
        : {
            delay: 5000,
            disableOnInteraction: false,
          },
      pagination: {
        el: "#testimonial .swiper-pagination",
        clickable: true,
      },
    });
  };

  const setupAOS = () => {
    document.querySelectorAll("section > .container > div:first-child").forEach((el) => {
      el.setAttribute("data-aos", "fade-up");
    });

    document.querySelectorAll(".serviceItem").forEach((el, index) => {
      el.setAttribute("data-aos", "fade-up");
      el.setAttribute("data-aos-delay", String(index * 80));
    });

    document.querySelectorAll("#expertise .bg-white").forEach((el, index) => {
      el.setAttribute("data-aos", "zoom-in");
      el.setAttribute("data-aos-delay", String(index * 40));
    });

    document.querySelectorAll("#about ul > li").forEach((el, index) => {
      el.setAttribute("data-aos", "fade-left");
      el.setAttribute("data-aos-delay", String(index * 90));
    });

    document.querySelectorAll(".process li").forEach((el, index) => {
      el.setAttribute("data-aos", "fade-up");
      el.setAttribute("data-aos-delay", String(index * 90));
    });

    if (typeof AOS !== "undefined") {
      AOS.init({
        duration: 850,
        once: true,
        offset: 40,
      });
    }
  };

  const setupAccordion = () => {
    const accordions = document.querySelectorAll("#about ul > li");

    accordions.forEach((item, index) => {
      const headerRow = item.querySelector(".flex.items-center.justify-between");
      const content = item.querySelector(".ReactCollapse--collapse");
      const icon = headerRow ? headerRow.querySelector("svg") : null;

      if (!headerRow || !content) {
        return;
      }

      const setOpenState = (isOpen) => {
        content.style.overflow = "hidden";
        content.style.height = isOpen ? `${content.scrollHeight}px` : "0px";
        content.setAttribute("aria-hidden", isOpen ? "false" : "true");
        headerRow.classList.toggle("opacity-70", !isOpen);
        headerRow.classList.toggle("text-primary", isOpen);

        if (icon) {
          icon.innerHTML = isOpen
            ? '<polyline points="18 15 12 9 6 15"></polyline>'
            : '<polyline points="6 9 12 15 18 9"></polyline>';
        }
      };

      setOpenState(index === 0);

      headerRow.addEventListener("click", () => {
        const willOpen = content.getAttribute("aria-hidden") === "true";

        accordions.forEach((accordion) => {
          const otherHeader = accordion.querySelector(".flex.items-center.justify-between");
          const otherContent = accordion.querySelector(".ReactCollapse--collapse");
          const otherIcon = otherHeader ? otherHeader.querySelector("svg") : null;

          if (!otherHeader || !otherContent) {
            return;
          }

          otherContent.style.height = "0px";
          otherContent.style.overflow = "hidden";
          otherContent.setAttribute("aria-hidden", "true");
          otherHeader.classList.add("opacity-70");
          otherHeader.classList.remove("text-primary");

          if (otherIcon) {
            otherIcon.innerHTML = '<polyline points="6 9 12 15 18 9"></polyline>';
          }
        });

        if (willOpen) {
          setOpenState(true);
        }
      });
    });
  };

  const setupStickyHeader = () => {
    if (!header) {
      return;
    }

    const handleScroll = () => {
      const isSticky = window.scrollY > 50;
      if (isSticky) {
        header.classList.add("is-sticky");
        header.classList.remove("lg:bg-transparent", "text-white");
        if (mobileBtn && navMenu && navMenu.classList.contains("translate-x-full")) {
          mobileBtn.classList.add("text-black");
          mobileBtn.classList.remove("text-white");
        }
      } else {
        header.classList.remove("is-sticky");
        header.classList.add("lg:bg-transparent", "text-white");
        if (mobileBtn) {
          mobileBtn.classList.add("text-white");
          mobileBtn.classList.remove("text-black");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
  };

  const setupProgressButton = () => {
    if (!progressBtn) {
      return;
    }

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;

      progressBtn.style.background = `conic-gradient(rgb(49, 186, 169) ${progress}%, rgb(215, 215, 215) ${progress}%)`;
      progressBtn.classList.toggle("opacity-0", scrollTop < 80);
      progressBtn.classList.toggle("translate-y-3", scrollTop < 80);
      progressBtn.classList.toggle("pointer-events-none", scrollTop < 80);
    };

    progressBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", updateProgress);
    updateProgress();
  };

  const setupPopup = () => {
    if (!popup) {
      return;
    }

    const popupCard = popup.querySelector("[data-popup-card]");
    const closeBtn = document.getElementById("closePopup");
    const form = document.getElementById("hiringForm");
    const successMessage = document.getElementById("hiringSuccess");

    const openPopup = () => {
      popup.classList.remove("hidden");
      requestAnimationFrame(() => {
        popup.classList.remove("opacity-0");
        if (popupCard) {
          popupCard.style.transform = "translateY(0) scale(1)";
        }
      });
    };

    const closePopup = () => {
      popup.classList.add("opacity-0");
      if (popupCard) {
        popupCard.style.transform = "translateY(16px) scale(0.95)";
      }
      window.setTimeout(() => {
        popup.classList.add("hidden");
      }, 260);
    };

        const hasSeenPopup = sessionStorage.getItem("hiringPopupShown");
    if (!hasSeenPopup) {
      window.setTimeout(() => {
        openPopup();
        sessionStorage.setItem("hiringPopupShown", "true");
      }, 1400);
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", closePopup);
    }

    popup.addEventListener("click", (event) => {
      if (event.target === popup) {
        closePopup();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !popup.classList.contains("hidden")) {
        closePopup();
      }
    });

    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (successMessage) {
          successMessage.classList.remove("hidden");
          successMessage.textContent = "Application draft captured. We will reach out soon.";
        }

        form.reset();
        window.setTimeout(closePopup, 1200);
      });
    }
  };

  const setupTiltCards = () => {
    document.querySelectorAll(".serviceItem").forEach((card) => {
      card.addEventListener("mousemove", (event) => {
        if (window.innerWidth < 768) {
          return;
        }

        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rotateY = ((x / rect.width) - 0.5) * 14;
        const rotateX = (0.5 - (y / rect.height)) * 14;
        card.style.transform = `perspective(1400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(1400px) rotateX(0deg) rotateY(0deg) translateY(0)";
      });
    });
  };

  cleanupSwipers();
  setupMobileMenu();
  setupMobileSubmenus();
  setupSwipers();
  setupAOS();
  setupAccordion();
  setupStickyHeader();
  setupProgressButton();
  setupPopup();
  setupTiltCards();

  const setupFAQ = () => {
    const accordion = document.getElementById('faq-accordion');
    if (!accordion) return;

    const items = accordion.querySelectorAll('.faq-item');
    
    items.forEach((item) => {
      const trigger = item.querySelector('.faq-trigger');
      const body = item.querySelector('.faq-body');
      const icon = item.querySelector('.faq-icon i');

      if (!trigger || !body) return;

      trigger.addEventListener('click', () => {
        const isOpen = !body.classList.contains('hidden');

        // Close all
        items.forEach((otherItem) => {
          const otherBody = otherItem.querySelector('.faq-body');
          const otherIcon = otherItem.querySelector('.faq-icon i');
          const otherTrigger = otherItem.querySelector('.faq-trigger');
          if (otherBody && !otherBody.classList.contains('hidden')) {
            otherBody.classList.add('hidden');
            otherItem.classList.remove('border-primary/50');
            otherItem.classList.add('border-white/10');
            if (otherIcon && typeof lucide !== 'undefined') {
              otherIcon.setAttribute('data-lucide', 'plus');
              lucide.createIcons();
            }
          }
        });

        // Toggle current
        if (!isOpen) {
          body.classList.remove('hidden');
          item.classList.add('border-primary/50');
          item.classList.remove('border-white/10');
          if (icon && typeof lucide !== 'undefined') {
            icon.setAttribute('data-lucide', 'minus');
            lucide.createIcons();
          }
        }
      });
    });
  };

  setupFAQ();
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});
