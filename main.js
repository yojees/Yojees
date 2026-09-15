(() => {
  // ── 0. Prevent Automatic Browser Scroll Restoration & Enforce HOME on Startup ──
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  const enforceHomeOnInitialLoad = () => {
    // If the browser loaded with a lingering sub-section hash (e.g., #certifications), strip it
    if (window.location.hash && window.location.hash !== "#" && window.location.hash !== "#home") {
      try {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      } catch (_) {}
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  };

  enforceHomeOnInitialLoad();
  window.addEventListener("load", enforceHomeOnInitialLoad);
  window.addEventListener("pageshow", enforceHomeOnInitialLoad);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── 1. Reusable Typing Engine ──
  const typeText = (containerEl, targetText, speed = 55) => {
    return new Promise((resolve) => {
      let currentIdx = 0;
      containerEl.textContent = "";

      const cursor = document.createElement("span");
      cursor.className = "typing-cursor";
      cursor.textContent = "_";
      cursor.setAttribute("aria-hidden", "true");
      containerEl.appendChild(cursor);

      if (reduceMotion) {
        containerEl.textContent = targetText;
        containerEl.appendChild(cursor);
        resolve();
        return;
      }

      const typeNextChar = () => {
        if (currentIdx < targetText.length) {
          const textNode = document.createTextNode(targetText.charAt(currentIdx));
          containerEl.insertBefore(textNode, cursor);
          currentIdx++;
          // Randomize typing speed slightly for natural feel (45 - 75ms)
          const jitter = Math.floor(Math.random() * 20) - 10;
          setTimeout(typeNextChar, Math.max(30, speed + jitter));
        } else {
          resolve();
        }
      };

      typeNextChar();
    });
  };

  const observeTypingElements = () => {
    const typingElements = document.querySelectorAll("[data-typing]");
    if (!typingElements.length) return;

    if (reduceMotion) {
      typingElements.forEach((el) => {
        const text = el.getAttribute("data-typing") || "";
        el.textContent = text;
        const cursor = document.createElement("span");
        cursor.className = "typing-cursor";
        cursor.textContent = "_";
        el.appendChild(cursor);
      });
      return;
    }

    const typingObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            if (el.dataset.typed) return;
            el.dataset.typed = "true";

            const textToType = el.getAttribute("data-typing");
            if (textToType) {
              typeText(el, textToType, 50);
            }
            obs.unobserve(el);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    typingElements.forEach((el) => typingObserver.observe(el));
  };

  // ── 2. Scroll Reveal Engine ──
  const revealOnScroll = () => {
    const animScrollEls = document.querySelectorAll(".anim-scroll");

    if (reduceMotion) {
      animScrollEls.forEach((el) => el.classList.add("in-view"));
      return;
    }

    const scrollObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    animScrollEls.forEach((el) => scrollObserver.observe(el));

    // Special observer for Vision trio staggered words
    const visionTrio = document.getElementById("vision-trio");
    if (visionTrio) {
      const trioObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              visionTrio.classList.add("in-view");
              obs.unobserve(visionTrio);
            }
          });
        },
        { threshold: 0.25 }
      );
      trioObserver.observe(visionTrio);
    }
  };

  // ── 3. Interactive Terminal Sequence & CLI ──
  const initTerminal = () => {
    const terminalWindow = document.getElementById("terminal-window");
    const terminalOutput = document.getElementById("terminal-output");
    const cliForm = document.getElementById("terminal-cli-form");
    const cliInput = document.getElementById("terminal-cli-input");
    const chips = document.querySelectorAll(".term-chip");

    if (!terminalWindow) return;

    const appendTerminalLine = (text, isCommand = false, isStatus = false) => {
      if (!terminalOutput) return;
      const line = document.createElement("div");
      line.className = "term-line revealed";
      if (isStatus) line.classList.add("status-line");
      line.textContent = isCommand ? `yojees@portfolio:~$ ${text}` : `> ${text}`;
      terminalOutput.appendChild(line);
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    };

    const handleCommand = (rawCmd) => {
      const cmd = (rawCmd || "").trim().toLowerCase();
      if (!cmd) return;

      appendTerminalLine(cmd, true);

      switch (cmd) {
        case "whoami":
          appendTerminalLine(
            "Yojees R — First-Year Student exploring Artificial Intelligence, Cloud Infrastructure & Modern Software Engineering."
          );
          break;

        case "currently":
          appendTerminalLine(
            "Currently learning Cloud computing, Linux systems, and building practical student tools like StudentSpend."
          );
          break;

        case "focus":
          appendTerminalLine(
            "Core focus: mastering engineering fundamentals, generative AI integrations, containerized architectures, and real-world projects."
          );
          break;

        case "status":
          appendTerminalLine(
            "STILL BUILDING. STILL LEARNING. NEVER WAITING TO BE READY.",
            false,
            true
          );
          break;

        case "about":
          appendTerminalLine("Navigating to About Me section...");
          document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
          break;

        case "projects":
          appendTerminalLine("Navigating to Things I've Built...");
          document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
          break;

        case "skills":
        case "learning":
          appendTerminalLine("Navigating to Currently Learning skills...");
          document.getElementById("learning")?.scrollIntoView({ behavior: "smooth" });
          break;

        case "contact":
          appendTerminalLine("Navigating to Let's Connect...");
          document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
          break;

        case "help":
          appendTerminalLine("Available commands: whoami, currently, focus, status, about, projects, skills, contact, clear");
          break;

        case "clear":
          if (terminalOutput) {
            terminalOutput.innerHTML = "";
            appendTerminalLine("Terminal cleared. Ready for input.");
          }
          break;

        default:
          appendTerminalLine(
            `bash: command not found: '${cmd}'. Type 'help' to see valid commands.`
          );
          break;
      }
    };

    // Form submit
    cliForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!cliInput) return;
      const val = cliInput.value;
      cliInput.value = "";
      handleCommand(val);
    });

    // Quick chip buttons
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const cmd = chip.getAttribute("data-cmd");
        if (cmd) {
          handleCommand(cmd);
          cliInput?.focus();
        }
      });
    });
  };

  // ── 3.5. Modals & Easter Egg Listener ──
  const initModals = () => {
    // Resume Modal
    const resumeModal = document.getElementById("resume-modal");
    const resumeCloseBtn = document.getElementById("resume-modal-close");
    const resumeTriggers = [
      document.getElementById("resume-btn"),
      document.getElementById("header-resume-btn"),
      document.getElementById("mobile-nav-resume"),
    ].filter(Boolean);

    const openResumeModal = () => {
      if (!resumeModal) return;
      resumeModal.hidden = false;
      requestAnimationFrame(() => {
        resumeModal.classList.add("modal-open");
      });
    };

    const closeResumeModal = () => {
      if (!resumeModal) return;
      resumeModal.classList.remove("modal-open");
      setTimeout(() => {
        resumeModal.hidden = true;
      }, 300);
    };

    resumeTriggers.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openResumeModal();
      });
    });

    resumeCloseBtn?.addEventListener("click", closeResumeModal);
    resumeModal?.addEventListener("click", (e) => {
      if (e.target === resumeModal) closeResumeModal();
    });

    // Easter Egg Modal (5 clicks on YOJEES.R)
    const easterEggModal = document.getElementById("easter-egg-modal");
    const easterEggCloseBtn = document.getElementById("easter-egg-close");
    const brandTriggers = [
      document.getElementById("header-name"),
      document.getElementById("brand-logo"),
    ].filter(Boolean);

    let clickCount = 0;
    let clickTimer = null;

    const openEasterEgg = () => {
      if (!easterEggModal) return;
      easterEggModal.hidden = false;
      requestAnimationFrame(() => {
        easterEggModal.classList.add("modal-open");
      });
    };

    const closeEasterEgg = () => {
      if (!easterEggModal) return;
      easterEggModal.classList.remove("modal-open");
      setTimeout(() => {
        easterEggModal.hidden = true;
      }, 300);
    };

    brandTriggers.forEach((el) => {
      el.style.cursor = "pointer";
      el.addEventListener("click", (e) => {
        clickCount++;
        clearTimeout(clickTimer);

        if (clickCount >= 5) {
          e.preventDefault();
          clickCount = 0;
          openEasterEgg();
        } else {
          clickTimer = setTimeout(() => {
            clickCount = 0;
          }, 3500);
        }
      });
    });

    easterEggCloseBtn?.addEventListener("click", closeEasterEgg);
    easterEggModal?.addEventListener("click", (e) => {
      if (e.target === easterEggModal) closeEasterEgg();
    });

    // Back to top button
    const backToTopBtn = document.getElementById("back-to-top-btn");
    backToTopBtn?.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Global escape key for modals
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeResumeModal();
        closeEasterEgg();
      }
    });
  };

  // ── 4. Metric Count-Up Logic ──
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const animateCount = (el, target, decimals, prefix, suffix, duration) => {
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const val = Math.round(target * easeOutCubic(t));
      el.textContent = prefix + val.toFixed(decimals) + suffix;
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = prefix + target.toFixed(decimals) + suffix;
      }
    };
    requestAnimationFrame(tick);
  };

  const initCounters = () => {
    const counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;

    if (reduceMotion) {
      counters.forEach((el) => {
        const target = Number(el.dataset.count);
        const decimals = Number(el.dataset.decimals || 0);
        const prefix = el.dataset.prefix || "";
        const suffix = el.dataset.suffix || "";
        el.textContent = prefix + target.toFixed(decimals) + suffix;
      });
      return;
    }

    const statsObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          if (el.dataset.done) return;
          el.dataset.done = "1";

          const i = Number(el.dataset.i || 0);
          const target = Number(el.dataset.count);
          const decimals = Number(el.dataset.decimals || 0);
          const prefix = el.dataset.prefix || "";
          const suffix = el.dataset.suffix || "";

          setTimeout(() => {
            animateCount(el, target, decimals, prefix, suffix, 1400 + i * 100);
          }, 400 + i * 90);

          obs.unobserve(el);
        });
      },
      { threshold: 0.25 }
    );

    counters.forEach((el) => statsObserver.observe(el));
  };

  // ── 5. Subtle Cinematic Parallax on Background Video ──
  const initParallax = () => {
    if (reduceMotion) return;
    const bgVideo = document.getElementById("bg-video");
    if (!bgVideo) return;

    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          // Very subtle parallax translation clamped to avoid gap
          const offset = Math.min(60, scrollY * 0.05);
          bgVideo.style.transform = `translateY(${offset}px) scale(1.04)`;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
  };

  // ── 6. Mobile Drawer Navigation ──
  const initMobileMenu = () => {
    const burger = document.getElementById("burger-btn");
    const overlay = document.getElementById("mobile-overlay");
    const menu = document.getElementById("mobile-menu");
    const menuLinks = menu ? menu.querySelectorAll("a") : [];

    const setMenu = (open) => {
      document.body.classList.toggle("menu-open", open);
      if (burger) {
        burger.setAttribute("aria-expanded", String(open));
        burger.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
      }
      if (overlay) overlay.hidden = !open;
      if (menu) menu.hidden = !open;
    };

    burger?.addEventListener("click", () => {
      setMenu(!document.body.classList.contains("menu-open"));
    });

    overlay?.addEventListener("click", () => setMenu(false));

    menuLinks.forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenu(false);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 720) setMenu(false);
    });
  };

  // ── 7. Active Navigation Highlighting ──
  const initActiveNav = () => {
    const sections = [
      document.getElementById("home"),
      document.getElementById("about"),
      document.getElementById("journey"),
      document.getElementById("projects"),
      document.getElementById("certifications"),
      document.getElementById("contact"),
    ].filter(Boolean);

    const navLinks = document.querySelectorAll(
      "#primary-nav a, #mobile-menu a:not(.mobile-resume)"
    );

    const updateActiveNav = () => {
      let currentSectionId = "home";
      const scrollY = window.scrollY;

      // When near the top, HOME is strictly active
      if (scrollY > 100) {
        const scrollCheck = scrollY + 180;
        for (const section of sections) {
          const top = section.offsetTop;
          const height = section.offsetHeight;
          if (scrollCheck >= top && scrollCheck < top + height) {
            currentSectionId = section.id;
            break;
          }
        }
      }

      navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (href === `#${currentSectionId}`) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      });
    };

    window.addEventListener("scroll", updateActiveNav, { passive: true });
    updateActiveNav();
  };

  // ── 7.5. Smooth In-Page Anchors (Preserves clean URL on reload) ──
  const initSmoothAnchors = () => {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (!href || href === "#") return;
        const targetId = href.substring(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          e.preventDefault();
          if (targetId === "home") {
            window.scrollTo({
              top: 0,
              behavior: reduceMotion ? "auto" : "smooth",
            });
          } else {
            targetEl.scrollIntoView({
              behavior: reduceMotion ? "auto" : "smooth",
            });
          }
        }
      });
    });
  };

  // ── 8. Initialize Everything on DOM Ready ──
  const initApp = () => {
    enforceHomeOnInitialLoad();
    observeTypingElements();
    revealOnScroll();
    initTerminal();
    initModals();
    initCounters();
    initParallax();
    initMobileMenu();
    initActiveNav();
    initSmoothAnchors();

    // Enable smooth scrolling and strictly anchor HOME on first viewport paint
    requestAnimationFrame(() => {
      enforceHomeOnInitialLoad();
      document.documentElement.classList.add("is-loaded");
    });
    setTimeout(enforceHomeOnInitialLoad, 80);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
})();
