(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  function init() {
    var toggleButton = document.querySelector(".mobile-menu-toggle");
    var mobileMenu = document.querySelector(".mobile-menu");
    var desktopLinks = Array.from(document.querySelectorAll(".nav-link"));
    var mobileLinks = Array.from(document.querySelectorAll(".mobile-nav-link"));
    var trackedIds = ["inicio", "sobre", "cardapio", "happy-hour", "contato"];
    var sections = trackedIds
      .map(function (id) {
        return document.getElementById(id);
      })
      .filter(Boolean);

    initMobileMenu(toggleButton, mobileMenu, mobileLinks);
    initActiveNavigation(sections, desktopLinks, mobileLinks);
  }

  function initMobileMenu(toggleButton, mobileMenu, mobileLinks) {
    if (!toggleButton || !mobileMenu) {
      return;
    }

    var desktopMediaQuery = window.matchMedia("(min-width: 56rem)");

    function setMenuState(isOpen) {
      toggleButton.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
      toggleButton.setAttribute("aria-expanded", String(isOpen));
      mobileMenu.setAttribute("aria-hidden", String(!isOpen));
      mobileMenu.classList.toggle("is-open", isOpen);
    }

    function closeMenu() {
      setMenuState(false);
    }

    function toggleMenu() {
      var isExpanded = toggleButton.getAttribute("aria-expanded") === "true";
      setMenuState(!isExpanded);
    }

    setMenuState(false);

    toggleButton.addEventListener("click", toggleMenu);

    mobileLinks.forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    function handleDesktopChange(event) {
      if (event.matches) {
        closeMenu();
      }
    }

    if (typeof desktopMediaQuery.addEventListener === "function") {
      desktopMediaQuery.addEventListener("change", handleDesktopChange);
    } else if (typeof desktopMediaQuery.addListener === "function") {
      desktopMediaQuery.addListener(handleDesktopChange);
    }

    window.addEventListener("resize", function () {
      if (desktopMediaQuery.matches) {
        closeMenu();
      }
    });
  }

  function initActiveNavigation(sections, desktopLinks, mobileLinks) {
    if (!sections.length) {
      return;
    }

    var allLinks = desktopLinks.concat(mobileLinks);
    var currentActiveId = "";

    function setActiveLink(sectionId) {
      if (!sectionId || currentActiveId === sectionId) {
        return;
      }

      currentActiveId = sectionId;

      allLinks.forEach(function (link) {
        var isMatch = getHashId(link.getAttribute("href")) === sectionId;
        link.classList.toggle("is-active", isMatch);

        if (isMatch) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    function updateFromScroll() {
      var bestSection = getMostVisibleSection(sections);

      if (bestSection) {
        setActiveLink(bestSection.id);
      }
    }

    if ("IntersectionObserver" in window) {
      initIntersectionObserver(sections, setActiveLink);
    } else {
      window.addEventListener("scroll", updateFromScroll, { passive: true });
      window.addEventListener("resize", updateFromScroll);
    }

    window.addEventListener("hashchange", function () {
      var hashId = getHashId(window.location.hash);

      if (hashId) {
        setActiveLink(hashId);
      }
    });

    updateFromScroll();
  }

  function initIntersectionObserver(sections, setActiveLink) {
    var visibleEntries = new Map();
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            visibleEntries.set(entry.target.id, entry.intersectionRatio);
          } else {
            visibleEntries.delete(entry.target.id);
          }
        });

        var activeId = getBestVisibleId(sections, visibleEntries);

        if (activeId) {
          setActiveLink(activeId);
        }
      },
      {
        root: null,
        rootMargin: "-35% 0px -45% 0px",
        threshold: [0.2, 0.35, 0.5, 0.7]
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function getBestVisibleId(sections, visibleEntries) {
    var bestId = "";
    var bestRatio = -1;

    sections.forEach(function (section) {
      var ratio = visibleEntries.get(section.id);

      if (typeof ratio === "number" && ratio > bestRatio) {
        bestRatio = ratio;
        bestId = section.id;
      }
    });

    return bestId || (sections[0] && sections[0].id) || "";
  }

  function getMostVisibleSection(sections) {
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    var bestSection = null;
    var bestVisibleArea = -1;

    sections.forEach(function (section) {
      var rect = section.getBoundingClientRect();
      var visibleTop = Math.max(rect.top, 0);
      var visibleBottom = Math.min(rect.bottom, viewportHeight);
      var visibleArea = Math.max(0, visibleBottom - visibleTop);

      if (visibleArea > bestVisibleArea) {
        bestVisibleArea = visibleArea;
        bestSection = section;
      }
    });

    return bestSection;
  }

  function getHashId(value) {
    if (!value || value.charAt(0) !== "#") {
      return "";
    }

    return value.slice(1);
  }

  onReady(init);
})();
