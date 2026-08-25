/* ==========================================================================
   DISASTER PREPAREDNESS PLATFORM - MAIN JAVASCRIPT (js/script.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initFaqAccordion();
  initTestimonialSlider();
  initDateConstraints();
  initChecklistProgress();
  initKitProgress();
  initDisasterTabs();
  initResourcesFilter();
  initFormValidations();
  initEmergencyPlanForm();
  initDashboardSidebar();
  initDashboardRoles();
});

/* ==========================================================================
   1. Sticky Header scroll effect
   ========================================================================== */
function initNavbar() {
  const header = document.querySelector('.header');
  if (!header) return;

  const isHomepage = window.location.pathname.endsWith('index.html') || 
                     window.location.pathname.endsWith('/') || 
                     (!window.location.pathname.includes('.html'));

  if (isHomepage) {
    header.classList.remove('scrolled'); // start transparent
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  } else {
    header.classList.add('scrolled'); // subpages solid by default
  }
}

/* ==========================================================================
   2. Mobile Side Navigation Drawer (Hamburger menu)
   ========================================================================== */
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const drawerClose = document.querySelector('.drawer-close');
  const navbar = document.querySelector('.navbar');
  const links = document.querySelectorAll('.nav-links a');

  if (!menuToggle || !navbar) return;

  const openDrawer = () => {
    navbar.classList.add('active');
    document.body.classList.add('menu-open');
    document.documentElement.classList.add('menu-open');
  };

  const closeDrawer = () => {
    navbar.classList.remove('active');
    document.body.classList.remove('menu-open');
    document.documentElement.classList.remove('menu-open');
  };

  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    openDrawer();
  });

  if (drawerClose) {
    drawerClose.addEventListener('click', closeDrawer);
  }

  // Close menu when clicking a link
  links.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // Click outside drawer to close
  document.addEventListener('click', (e) => {
    if (navbar.classList.contains('active') && 
        !navbar.contains(e.target) && 
        !menuToggle.contains(e.target)) {
      closeDrawer();
    }
  });

  // Escape key closes drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navbar.classList.contains('active')) {
      closeDrawer();
    }
  });
}

/* ==========================================================================
   3. FAQ Accordion Interaction (Smooth height transition)
   ========================================================================== */
function initFaqAccordion() {
  const faqHeaders = document.querySelectorAll('.faq-question');

  faqHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const faqItem = header.parentElement;
      const faqAnswer = faqItem.querySelector('.faq-answer');
      
      // Close other active items
      document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== faqItem && item.classList.contains('active')) {
          item.classList.remove('active');
          item.querySelector('.faq-answer').style.maxHeight = null;
        }
      });

      // Toggle current item
      faqItem.classList.toggle('active');
      if (faqItem.classList.contains('active')) {
        faqAnswer.style.maxHeight = faqAnswer.scrollHeight + 'px';
      } else {
        faqAnswer.style.maxHeight = null;
      }
    });
  });
}

/* ==========================================================================
   4. Testimonials Slider (Carousel)
   ========================================================================== */
function initTestimonialSlider() {
  const track = document.querySelector('.testimonial-track');
  const slides = document.querySelectorAll('.testimonial-slide');
  const dotsContainer = document.querySelector('.slider-dots');
  const prevBtn = document.querySelector('.slider-btn-prev');
  const nextBtn = document.querySelector('.slider-btn-next');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  let autoplayInterval;

  // Create dot indicators
  if (dotsContainer) {
    dotsContainer.innerHTML = ''; // clear existing
    slides.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.classList.add('slider-dot');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        goToSlide(index);
        stopAutoplay();
        startAutoplay();
      });
      dotsContainer.appendChild(dot);
    });
  }

  const dots = document.querySelectorAll('.slider-dot');

  function goToSlide(index) {
    currentIndex = index;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    // Update dots
    if (dots.length > 0) {
      dots.forEach(d => d.classList.remove('active'));
      dots[currentIndex].classList.add('active');
    }
  }

  const moveNext = () => {
    let nextIndex = (currentIndex + 1) % slides.length;
    goToSlide(nextIndex);
  };

  const movePrev = () => {
    let prevIndex = (currentIndex - 1 + slides.length) % slides.length;
    goToSlide(prevIndex);
  };

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      moveNext();
      stopAutoplay();
      startAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      movePrev();
      stopAutoplay();
      startAutoplay();
    });
  }

  function startAutoplay() {
    autoplayInterval = setInterval(moveNext, 6000);
  }

  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }

  // Autoplay control on hover
  const container = document.querySelector('.slider-container');
  if (container) {
    container.addEventListener('mouseenter', stopAutoplay);
    container.addEventListener('mouseleave', startAutoplay);
  }

  startAutoplay();
}

/* ==========================================================================
   5. Date constraints
   ========================================================================== */
function initDateConstraints() {
  const dateInputs = document.querySelectorAll('input[type="date"]');
  const today = new Date().toISOString().split('T')[0];
  dateInputs.forEach(input => {
    input.setAttribute('min', today);
  });
}

/* ==========================================================================
   6. Interactive Checklist progress calculation
   ========================================================================== */
function initChecklistProgress() {
  const checklistCheckboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
  const progressBar = document.querySelector('.progress-bar');
  const progressText = document.querySelector('.progress-percentage');
  const localStorageChecklistKey = 'disaster_prep_checklist';

  if (checklistCheckboxes.length === 0) return;

  // Load saved state
  let savedState = JSON.parse(localStorage.getItem(localStorageChecklistKey)) || {};

  checklistCheckboxes.forEach(checkbox => {
    const itemText = checkbox.nextElementSibling.innerText.trim();
    const parentCard = checkbox.closest('.checklist-item');
    if (savedState[itemText]) {
      checkbox.checked = true;
      if (parentCard) parentCard.classList.add('checked');
    }

    checkbox.addEventListener('change', () => {
      const isChecked = checkbox.checked;
      savedState[itemText] = isChecked;
      localStorage.setItem(localStorageChecklistKey, JSON.stringify(savedState));
      
      if (parentCard) {
        if (isChecked) parentCard.classList.add('checked');
        else parentCard.classList.remove('checked');
      }
      calculateChecklistProgress();
    });
  });

  function calculateChecklistProgress() {
    const total = checklistCheckboxes.length;
    const checked = document.querySelectorAll('.checklist-item input[type="checkbox"]:checked').length;
    const percent = total > 0 ? Math.round((checked / total) * 100) : 0;
    
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressText) progressText.innerText = `${percent}%`;

    // Update Dashboard metrics if they exist
    const scoreValue = document.querySelector('.dashboard-score-value');
    const scoreText = document.querySelector('.dashboard-score-text');
    if (scoreValue) scoreValue.innerText = `${percent}%`;
  }

  calculateChecklistProgress();
}

/* ==========================================================================
   7. Emergency Kit Builder math
   ========================================================================== */
function initKitProgress() {
  const kitCheckboxes = document.querySelectorAll('.kit-item-checkbox input[type="checkbox"]');
  const kitScoreNumber = document.querySelector('.kit-score-number');
  const kitSummaryCount = document.querySelector('.kit-summary-count');
  const kitSummaryStatus = document.querySelector('.kit-summary-status');
  const localStorageKitKey = 'disaster_prep_kit';

  if (kitCheckboxes.length === 0) return;

  let savedKitState = JSON.parse(localStorage.getItem(localStorageKitKey)) || {};

  kitCheckboxes.forEach(checkbox => {
    const itemLabel = checkbox.nextElementSibling.innerText.trim();
    const parentLabel = checkbox.closest('.kit-item-checkbox');
    if (savedKitState[itemLabel]) {
      checkbox.checked = true;
      if (parentLabel) parentLabel.classList.add('checked');
    }

    checkbox.addEventListener('change', () => {
      const isChecked = checkbox.checked;
      savedKitState[itemLabel] = isChecked;
      localStorage.setItem(localStorageKitKey, JSON.stringify(savedKitState));

      if (parentLabel) {
        if (isChecked) parentLabel.classList.add('checked');
        else parentLabel.classList.remove('checked');
      }
      calculateKitProgress();
    });
  });

  function calculateKitProgress() {
    const total = kitCheckboxes.length;
    const checked = document.querySelectorAll('.kit-item-checkbox input[type="checkbox"]:checked').length;
    const percent = total > 0 ? Math.round((checked / total) * 100) : 0;

    if (kitScoreNumber) kitScoreNumber.innerText = `${percent}%`;
    if (kitSummaryCount) kitSummaryCount.innerText = `${checked} / ${total} Items`;
    if (kitSummaryStatus) {
      if (percent < 30) kitSummaryStatus.innerText = 'Vulnerable';
      else if (percent < 70) kitSummaryStatus.innerText = 'Partially Built';
      else kitSummaryStatus.innerText = 'Safe & Prepared';
    }

    const scoreCircle = document.querySelector('.kit-score-circle');
    if (scoreCircle) {
      scoreCircle.style.borderTopColor = percent > 60 ? '#10B981' : percent > 30 ? '#F59E0B' : '#EF4444';
    }
  }

  calculateKitProgress();
}

/* ==========================================================================
   8. Disaster Types - Tabs Filtering
   ========================================================================== */
function initDisasterTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const disasterDetails = document.querySelectorAll('.disaster-section-detail');

  if (tabButtons.length === 0 || disasterDetails.length === 0) return;

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      
      tabButtons.forEach(b => b.classList.remove('active'));
      disasterDetails.forEach(d => d.classList.remove('active'));

      btn.classList.add('active');
      const targetDetail = document.getElementById(targetId);
      if (targetDetail) {
        targetDetail.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   9. Resources Page Search and Filter
   ========================================================================== */
function initResourcesFilter() {
  const searchInput = document.getElementById('resourceSearch');
  const filterChips = document.querySelectorAll('.filter-chip');
  const resourceCards = document.querySelectorAll('.resource-card');

  if (resourceCards.length === 0) return;

  let currentCategory = 'all';
  let searchQuery = '';

  const filterResources = () => {
    resourceCards.forEach(card => {
      const title = card.querySelector('h3').innerText.toLowerCase();
      const text = card.querySelector('p').innerText.toLowerCase();
      const category = card.getAttribute('data-category');

      const matchesSearch = title.includes(searchQuery) || text.includes(searchQuery);
      const matchesCategory = currentCategory === 'all' || category === currentCategory;

      if (matchesSearch && matchesCategory) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  };

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      filterResources();
    });
  }

  if (filterChips.length > 0) {
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentCategory = chip.getAttribute('data-filter');
        filterResources();
      });
    });
  }
}

/* ==========================================================================
   10. Form Input Validations & redirects
   ========================================================================== */
function initFormValidations() {
  const validationForms = document.querySelectorAll('form[data-validate]');
  
  const nameRegex = /^[a-zA-Z\s]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^[0-9]+$/;

  const showInputError = (inputEl, message) => {
    const group = inputEl.closest('.form-group');
    if (group) {
      group.classList.add('error');
      const errorMsgEl = group.querySelector('.form-error-msg');
      if (errorMsgEl) errorMsgEl.innerText = message;
    }
  };

  const clearInputError = (inputEl) => {
    const group = inputEl.closest('.form-group');
    if (group) group.classList.remove('error');
  };

  // Bind password visibility eye icons toggle
  const passwordEyeIcons = document.querySelectorAll('.password-toggle');
  passwordEyeIcons.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const input = toggle.closest('.password-input-wrapper').querySelector('input');
      const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
      input.setAttribute('type', type);
      
      const eye = toggle.querySelector('i');
      if (eye) {
        if (type === 'text') {
          eye.classList.remove('fa-eye');
          eye.classList.add('fa-eye-slash');
        } else {
          eye.classList.remove('fa-eye-slash');
          eye.classList.add('fa-eye');
        }
      }
    });
  });

  validationForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      let isFormValid = true;

      // Validate Names
      const nameInputs = form.querySelectorAll('input[type="text"][data-validate-name]');
      nameInputs.forEach(input => {
        const val = input.value.trim();
        if (input.hasAttribute('required') && val === '') {
          showInputError(input, 'This field is required.');
          isFormValid = false;
        } else if (val !== '' && !nameRegex.test(val)) {
          showInputError(input, 'Numbers or special characters are not allowed.');
          isFormValid = false;
        } else {
          clearInputError(input);
        }
      });

      // Validate Emails
      const emailInputs = form.querySelectorAll('input[type="email"]');
      emailInputs.forEach(input => {
        const val = input.value.trim();
        if (input.hasAttribute('required') && val === '') {
          showInputError(input, 'Email is required.');
          isFormValid = false;
        } else if (val !== '' && !emailRegex.test(val)) {
          showInputError(input, 'Please enter a valid email address.');
          isFormValid = false;
        } else {
          clearInputError(input);
        }
      });

      // Validate Phone Numbers
      const mobileInputs = form.querySelectorAll('input[type="tel"]');
      mobileInputs.forEach(input => {
        const val = input.value.trim();
        if (input.hasAttribute('required') && val === '') {
          showInputError(input, 'Mobile number is required.');
          isFormValid = false;
        } else if (val !== '' && (!mobileRegex.test(val) || val.length < 8 || val.length > 15)) {
          showInputError(input, 'Please enter a valid mobile number (8-15 digits, numbers only).');
          isFormValid = false;
        } else {
          clearInputError(input);
        }
      });

      // Password checks on Register Form
      const passwordInput = form.querySelector('#regPassword');
      const confirmInput = form.querySelector('#regConfirmPassword');
      if (passwordInput && confirmInput) {
        if (confirmInput.value !== passwordInput.value) {
          showInputError(confirmInput, 'Passwords do not match.');
          isFormValid = false;
        } else {
          clearInputError(confirmInput);
        }
      }

      // Terms checkboxes
      const termsCheckbox = form.querySelector('#termsCheckbox');
      if (termsCheckbox) {
        if (termsCheckbox.hasAttribute('required') && !termsCheckbox.checked) {
          showInputError(termsCheckbox, 'You must accept the terms.');
          isFormValid = false;
        } else {
          clearInputError(termsCheckbox);
        }
      }

      if (!isFormValid) {
        e.preventDefault();
      } else {
        const redirectAttr = form.getAttribute('data-redirect');
        if (redirectAttr) {
          e.preventDefault();

          // Mock registration or login roles caching
          if (form.id === 'loginForm' || form.id === 'registerForm') {
            const emailInput = form.querySelector('input[type="email"]');
            const roleSelect = form.querySelector('select'); // dropdown role select
            const nameInput = form.querySelector('#regName') || form.querySelector('input[type="text"]');

            const email = emailInput ? emailInput.value : 'coordinator@safealert.org';
            const name = nameInput ? nameInput.value : email.split('@')[0];
            const role = roleSelect ? roleSelect.value : 'individual';

            localStorage.setItem('loggedInUserName', name.toUpperCase());
            localStorage.setItem('loggedInUserRole', role);
            localStorage.setItem('user_logged_in', 'true');
            localStorage.setItem('user_email', email);

            // Conditional Redirection: if role is coordinator, send to admin-dashboard.html, else user-dashboard.html
            const destination = (role === 'coordinator') 
                                ? 'admin-dashboard.html' 
                                : 'user-dashboard.html';

            const alertMsg = form.id === 'loginForm' 
                             ? 'Credentials Authorized! Redirecting to SafeAlert Command...' 
                             : 'Account Successfully Created! Setting up profile...';

            window.showCustomAlert(alertMsg, 'success');
            setTimeout(() => {
              window.location.href = destination;
            }, 1800);
          } else {
            window.showCustomAlert('Inquiry successfully sent! Returning to Home...', 'success');
            setTimeout(() => {
              window.location.href = redirectAttr;
            }, 1800);
          }
        }
      }
    });

    form.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('input', () => clearInputError(input));
    });
  });
}

/* ==========================================================================
   11. Emergency Plan Form generation
   ========================================================================== */
function initEmergencyPlanForm() {
  const planForm = document.getElementById('emergencyPlanForm');
  const planModal = document.getElementById('planOutputModal');
  const closeModalBtn = document.querySelector('.close-modal');

  if (!planForm || !planModal) return;

  planForm.addEventListener('submit', (e) => {
    if (planForm.querySelectorAll('.form-group.error').length === 0) {
      e.preventDefault();

      const name = document.getElementById('planName').value;
      const groupName = document.getElementById('planGroupName').value;
      const primaryContact = document.getElementById('planContact').value;
      const secondaryContact = document.getElementById('planSecondaryContact').value;
      const meetingPoint = document.getElementById('planMeetingPoint').value;
      const evacuationLoc = document.getElementById('planEvacuation').value;
      const notes = document.getElementById('planNotes').value;

      // Populate Modal Fields
      document.getElementById('outName').innerText = name;
      document.getElementById('outGroupName').innerText = groupName;
      document.getElementById('outPrimary').innerText = primaryContact;
      document.getElementById('outSecondary').innerText = secondaryContact;
      document.getElementById('outMeeting').innerText = meetingPoint;
      document.getElementById('outEvacuation').innerText = evacuationLoc;
      document.getElementById('outNotes').innerText = notes || 'None added.';

      // Save blueprint state
      const planObj = { name, groupName, primaryContact, secondaryContact, meetingPoint, evacuationLoc, notes };
      localStorage.setItem('family_emergency_plan', JSON.stringify(planObj));

      planModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      planModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  }

  planModal.addEventListener('click', (e) => {
    if (e.target === planModal) {
      planModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });
}

/* ==========================================================================
   12. Collapsible Sidebar Drawers (For User and Admin Dashboards)
   ========================================================================== */
function initDashboardSidebar() {
  const dbToggle = document.querySelector('.db-toggle-btn') || document.querySelector('.db-hamburger');
  const sidebar = document.querySelector('.sidebar') || document.querySelector('.db-sidebar');
  const dbOverlay = document.querySelector('.db-sidebar-backdrop') || document.querySelector('.db-sidebar-overlay');
  const sidebarClose = document.querySelector('.db-sidebar-close');

  if (!dbToggle || !sidebar) return;

  const openSidebar = () => {
    sidebar.classList.add('active');
    if (dbOverlay) dbOverlay.classList.add('active');
    document.body.classList.add('menu-open');
    document.documentElement.classList.add('menu-open');
  };

  const closeSidebar = () => {
    sidebar.classList.remove('active');
    if (dbOverlay) dbOverlay.classList.remove('active');
    document.body.classList.remove('menu-open');
    document.documentElement.classList.remove('menu-open');
  };

  dbToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    openSidebar();
  });

  if (sidebarClose) {
    sidebarClose.addEventListener('click', closeSidebar);
  }

  if (dbOverlay) {
    dbOverlay.addEventListener('click', closeSidebar);
  }

  // Escape key closes drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
      closeSidebar();
    }
  });
}

/* ==========================================================================
   13. Dynamic Dashboard Roles Layout Update
   ========================================================================== */
function initDashboardRoles() {
  const role = localStorage.getItem('loggedInUserRole') || 'individual';
  const userName = localStorage.getItem('loggedInUserName') || 'USER ACCOUNT';

  // Update profile names in dashboards
  document.querySelectorAll('.user-name').forEach(el => {
    el.textContent = userName;
  });

  const initials = userName.substring(0, 2).toUpperCase();
  document.querySelectorAll('.user-avatar').forEach(el => {
    el.textContent = initials;
  });

  // Trigger charts animation
  const charts = document.querySelectorAll('.chart-bar');
  if (charts.length > 0) {
    setTimeout(() => {
      charts.forEach(bar => {
        const heightVal = bar.getAttribute('data-height') || '0%';
        bar.style.height = heightVal;
      });
    }, 300);
  }

  // Scroll Reveal Observer
  const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        } else {
          entry.target.classList.remove('active');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
      revealObserver.observe(el);
    });
  }
}

/* ==========================================================================
   14. Custom Alert Overlay System
   ========================================================================== */
window.showCustomAlert = function(message, type = 'success') {
  if (document.querySelector('.custom-alert-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'custom-alert-overlay';

  const modal = document.createElement('div');
  modal.className = 'custom-alert-modal glass-card';

  const iconClass = type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation';
  const iconColor = type === 'success' ? '#10b981' : '#f97316';

  modal.innerHTML = `
      <div class="custom-alert-icon" style="color: ${iconColor}; font-size: 3.5rem; margin-bottom: 1.5rem; text-align: center;">
          <i class="fa-solid ${iconClass}"></i>
      </div>
      <p class="custom-alert-message" style="color: var(--text-white); font-size: 1rem; line-height: 1.6; margin-bottom: 2rem; text-align: center;">${message}</p>
      <button class="custom-alert-btn btn btn-primary" style="width: 120px; margin: 0 auto; display: block;">OK</button>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  setTimeout(() => {
      overlay.classList.add('active');
  }, 10);

  const closeBtn = modal.querySelector('.custom-alert-btn');
  const closeAlert = () => {
      overlay.classList.remove('active');
      setTimeout(() => {
          overlay.remove();
      }, 300);
  };

  closeBtn.addEventListener('click', closeAlert);
  overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeAlert();
  });
};

/* ==========================================================================
   15. Interactive Hero Preparedness Tester
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const bookingForm = document.getElementById('bookingSearchForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const regionInput = document.getElementById('bookingDest');
      const hazardSelect = document.getElementById('bookingHazard');
      
      const region = regionInput ? regionInput.value.trim() : '';
      const hazard = hazardSelect ? hazardSelect.value : '';
      
      if (!region || !hazard) {
        window.showCustomAlert('Please enter your location and select a target hazard.', 'warning');
        return;
      }
      
      // Build a modal backdrop overlay for the threat scan
      const scanModal = document.createElement('div');
      scanModal.className = 'custom-alert-overlay active';
      scanModal.style.zIndex = '9999';
      scanModal.innerHTML = `
        <div class="glass-card reveal active" style="padding: 3rem 2.25rem; text-align: center; border: 1.5px solid var(--border-glass) !important; max-width: 480px; width: 90%;">
          <div style="margin-bottom: 2rem;">
            <i class="fa-solid fa-arrows-spin fa-spin" style="font-size: 4.5rem; color: var(--accent);"></i>
          </div>
          <h2 style="font-size: 1.75rem; margin-bottom: 0.5rem; color: #fff; font-family: var(--font-heading);">Threat Assessment</h2>
          <p class="scan-status" style="font-size: 0.9rem; color: var(--text-muted); min-height: 40px; margin-bottom: 0;">Accessing local warning node registers...</p>
        </div>
      `;
      document.body.appendChild(scanModal);
      
      // Cycle through status messages
      const statuses = [
        "Analyzing regional geological survey maps...",
        "Simulating local hazard vulnerability matrices...",
        "Compiling custom safety blueprints for " + region.toUpperCase() + "..."
      ];
      
      let step = 0;
      const statusInterval = setInterval(() => {
        if (step < statuses.length) {
          const statusEl = scanModal.querySelector('.scan-status');
          if (statusEl) statusEl.textContent = statuses[step];
          step++;
        }
      }, 700);
      
      // After 2.5s, replace with the results
      setTimeout(() => {
        clearInterval(statusInterval);
        
        // Generate risk scores based on hazard
        let riskColor = "var(--secondary)";
        let riskText = "LOW RISK";
        let rating = "Resilient (85/100)";
        let tips = [];
        
        if (hazard === 'flood') {
          riskColor = "var(--danger)";
          riskText = "HIGH RISK";
          rating = "Vulnerable (45/100)";
          tips = [
            "Keep sandbags and plywood sheets stored for quick runoff blocks.",
            "Verify the height of electric junction boxes and plug lines in your cellar.",
            "Plan an escape route to high-ground assembly zones."
          ];
        } else if (hazard === 'cyclone' || hazard === 'storm') {
          riskColor = "var(--danger)";
          riskText = "HIGH RISK";
          rating = "Vulnerable (50/100)";
          tips = [
            "Install structural window shutters and check tree limb clearances.",
            "Procure a backup battery bank for safety radio communications.",
            "Identify an interior shelter room containing no external glass windows."
          ];
        } else if (hazard === 'earthquake') {
          riskColor = "var(--warning)";
          riskText = "MODERATE RISK";
          rating = "Moderate (65/100)";
          tips = [
            "Latch tall bookcases and shelves securely to structural walls.",
            "Identify drop-and-cover furniture points in every major room.",
            "Locate and verify operation of primary gas mains shut-off valves."
          ];
        } else {
          riskColor = "var(--secondary)";
          riskText = "MODERATE RISK";
          rating = "Moderate (70/100)";
          tips = [
            "Establish household check-in codes to communicate during outrages.",
            "Maintain a 72-hour supply of drinking water (1 gallon per person per day).",
            "Register for regional alerts at Stackly local command node databases."
          ];
        }
        
        let tipsList = tips.map(tip => `
          <li style="display: flex; gap: 10px; text-align: left; font-size: 0.9rem; margin-bottom: 12px; color: #cbd5e1;">
            <i class="fa-solid fa-shield-halved" style="color: ${riskColor}; margin-top: 3px;"></i>
            <span>${tip}</span>
          </li>
        `).join('');
        
        scanModal.innerHTML = `
          <div class="glass-card reveal active" style="padding: 2.5rem 2rem; border: 1.5px solid var(--border-glass) !important; max-width: 520px; width: 90%; text-align: center;">
            <div style="margin-bottom: 1.5rem;">
              <span class="badge" style="background: rgba(255,255,255,0.05); color: #fff; margin-bottom: 8px;">Scanner Results</span>
              <h2 style="font-size: 1.8rem; margin: 0; color: #fff; font-family: var(--font-heading);">${region.toUpperCase()} Hazard Report</h2>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 2rem;">
              <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-glass);">
                <span style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-bottom: 4px;">LOCAL RISK LEVEL</span>
                <strong style="color: ${riskColor}; font-size: 1.15rem; letter-spacing: 0.5px;">${riskText}</strong>
              </div>
              <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-glass);">
                <span style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-bottom: 4px;">RESILIENCE GRADE</span>
                <strong style="color: #fff; font-size: 1.15rem;">${rating}</strong>
              </div>
            </div>
            
            <div style="text-align: left; margin-bottom: 2rem;">
              <h4 style="color: #fff; margin-bottom: 12px; font-size: 0.95rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 6px;">Critical Preparation Actions:</h4>
              <ul style="list-style: none; padding: 0; margin: 0;">
                ${tipsList}
              </ul>
            </div>
            
            <div style="display: flex; gap: 12px;">
              <button class="btn btn-secondary close-scan-btn" style="flex: 1; padding: 0.75rem; cursor: pointer;">Dismiss Report</button>
              <a href="login.html" class="btn btn-primary" style="flex: 1; padding: 0.75rem; display: flex; align-items: center; justify-content: center; text-decoration: none; text-shadow: none; background: var(--secondary) !important; border-color: var(--secondary) !important;">
                Save To Control Board
              </a>
            </div>
          </div>
        `;
        
        scanModal.querySelector('.close-scan-btn').addEventListener('click', () => {
          scanModal.remove();
        });
      }, 2500);
    });
  }
});

/* ==========================================================================
   16. Hero Portfolio Showcase Autoplay Slider
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.portfolio-slide');
  if (slides.length <= 1) return;
  
  let currentSlide = 0;
  setInterval(() => {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }, 4000);
});
