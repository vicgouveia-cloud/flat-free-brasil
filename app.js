/* ==========================================================================
   FLAT FREE B2B - INTERACTIVE WEB APPLICATION LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme Management (Light / Dark Mode)
  initTheme();

  // 2. Navbar Scroll Effects & Active Navigation
  initNavbar();

  // 3. Interactive Fleet ROI Calculator
  initRoiCalculator();

  // 4. Interactive 3D Puncture Simulator Widget
  initPunctureSimulator();

  // 5. Contact & Proposal Form Handling
  initProposalForm();

  // 6. Smooth Scrolling for Anchor Links
  initSmoothScroll();
});

/* --------------------------------------------------------------------------
   1. Theme Management
   -------------------------------------------------------------------------- */
function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;
  
  // Check local storage or system preference
  const savedTheme = localStorage.getItem('flat_free_theme') || 'light';
  setTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
    });
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('flat_free_theme', theme);
    
    if (themeIcon) {
      if (theme === 'dark') {
        themeIcon.className = 'fas fa-sun';
      } else {
        themeIcon.className = 'fas fa-moon';
      }
    }
  }
}

/* --------------------------------------------------------------------------
   2. Navbar Scroll & Active State
   -------------------------------------------------------------------------- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    // Header shadow on scroll
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link highlighting
    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const navLinksList = document.querySelector('.nav-links');

  if (mobileToggle && navLinksList) {
    mobileToggle.addEventListener('click', () => {
      const isVisible = navLinksList.style.display === 'flex';
      navLinksList.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        navLinksList.style.flexDirection = 'column';
        navLinksList.style.position = 'absolute';
        navLinksList.style.top = '80px';
        navLinksList.style.left = '0';
        navLinksList.style.width = '100%';
        navLinksList.style.backgroundColor = 'var(--bg-surface)';
        navLinksList.style.padding = '1.5rem';
        navLinksList.style.boxShadow = 'var(--shadow-lg)';
      }
    });
  }
}

/* --------------------------------------------------------------------------
   3. Interactive Fleet ROI Calculator
   -------------------------------------------------------------------------- */
function initRoiCalculator() {
  const fleetSizeInput = document.getElementById('calcFleetSize');
  const fleetSizeVal = document.getElementById('calcFleetSizeVal');

  const mileageInput = document.getElementById('calcMileage');
  const mileageVal = document.getElementById('calcMileageVal');

  const tireCostInput = document.getElementById('calcTireCost');
  const tireCostVal = document.getElementById('calcTireCostVal');

  const vehicleTypeSelect = document.getElementById('calcVehicleType');

  // Outputs
  const outputTotal = document.getElementById('calcOutputTotal');
  const outputFuel = document.getElementById('calcOutputFuel');
  const outputTires = document.getElementById('calcOutputTires');
  const outputDowntime = document.getElementById('calcOutputDowntime');
  const outputPayback = document.getElementById('calcOutputPayback');

  const applyRoiBtn = document.getElementById('applyRoiToFormBtn');

  if (!fleetSizeInput || !outputTotal) return;

  function calculateROI() {
    const fleetSize = parseInt(fleetSizeInput.value, 10) || 20;
    const monthlyKm = parseInt(mileageInput.value, 10) || 8000;
    const tireCost = parseFloat(tireCostInput.value) || 2200;
    const vehicleType = vehicleTypeSelect ? vehicleTypeSelect.value : 'heavy_truck';

    // Update UI text labels
    fleetSizeVal.textContent = `${fleetSize} veículos`;
    mileageVal.textContent = `${monthlyKm.toLocaleString('pt-BR')} km/mês`;
    tireCostVal.textContent = `R$ ${tireCost.toLocaleString('pt-BR')}`;

    // Vehicle multiplication factors
    let tiresPerVehicle = 6;
    let avgKmPerLiter = 2.5; // diesel km/l

    if (vehicleType === 'urban_vuc') {
      tiresPerVehicle = 6;
      avgKmPerLiter = 4.5;
    } else if (vehicleType === 'bus') {
      tiresPerVehicle = 6;
      avgKmPerLiter = 3.0;
    } else if (vehicleType === 'heavy_truck') {
      tiresPerVehicle = 10;
      avgKmPerLiter = 2.2;
    } else if (vehicleType === 'off_road') {
      tiresPerVehicle = 8;
      avgKmPerLiter = 1.5;
    }

    const dieselPricePerLiter = 6.20; // R$/L

    // 1. Fuel Economy (3.5% avg reduction due to constant ideal pressure)
    const monthlyLitersPerVehicle = monthlyKm / avgKmPerLiter;
    const monthlyFuelCostPerVehicle = monthlyLitersPerVehicle * dieselPricePerLiter;
    const annualFuelSavingsTotal = fleetSize * (monthlyFuelCostPerVehicle * 12) * 0.038;

    // 2. Tire Longevity Savings (+20% extended life on tires)
    const totalTiresInFleet = fleetSize * tiresPerVehicle;
    const annualTireReplacementCost = (totalTiresInFleet * tireCost) * 0.5; // normal annual rotation
    const annualTireSavingsTotal = annualTireReplacementCost * 0.20;

    // 3. Downtime & Emergency Callout Savings (avg 2 punctures avoided per vehicle per year at R$ 550 avg cost)
    const annualDowntimeSavingsTotal = fleetSize * 2 * 650;

    // Grand Total Annual Savings
    const grandTotalSavings = annualFuelSavingsTotal + annualTireSavingsTotal + annualDowntimeSavingsTotal;

    // Investment cost estimate (Flat Free treatment per tire ~ R$ 180)
    const totalInvestment = totalTiresInFleet * 180;
    const paybackMonths = (totalInvestment / (grandTotalSavings / 12)).toFixed(1);

    // Update UI Results with smooth formatting
    outputTotal.textContent = `R$ ${Math.round(grandTotalSavings).toLocaleString('pt-BR')}`;
    outputFuel.textContent = `R$ ${Math.round(annualFuelSavingsTotal).toLocaleString('pt-BR')}`;
    outputTires.textContent = `R$ ${Math.round(annualTireSavingsTotal).toLocaleString('pt-BR')}`;
    outputDowntime.textContent = `R$ ${Math.round(annualDowntimeSavingsTotal).toLocaleString('pt-BR')}`;
    outputPayback.textContent = `${paybackMonths} meses`;
  }

  // Event Listeners for Live Updates
  fleetSizeInput.addEventListener('input', calculateROI);
  mileageInput.addEventListener('input', calculateROI);
  tireCostInput.addEventListener('input', calculateROI);
  if (vehicleTypeSelect) vehicleTypeSelect.addEventListener('change', calculateROI);

  // Initial calculation
  calculateROI();

  // Apply ROI values to Proposal Form
  if (applyRoiBtn) {
    applyRoiBtn.addEventListener('click', () => {
      const fleetSize = fleetSizeInput.value;
      const calculatedSavings = outputTotal.textContent;

      const proposalFleetSelect = document.getElementById('formFleetSize');
      const proposalMsg = document.getElementById('formMessage');

      if (proposalFleetSelect) {
        if (fleetSize <= 10) proposalFleetSelect.value = '1-10';
        else if (fleetSize <= 50) proposalFleetSelect.value = '11-50';
        else if (fleetSize <= 200) proposalFleetSelect.value = '51-200';
        else proposalFleetSelect.value = '200+';
      }

      if (proposalMsg) {
        proposalMsg.value = `Gostaria de solicitar uma proposta técnica para minha frota de ${fleetSize} veículos.\nUtilizei a calculadora de ROI e obtive uma economia estimativa de ${calculatedSavings}/ano.`;
      }

      const contactSection = document.getElementById('contato');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

/* --------------------------------------------------------------------------
   4. Interactive 3D Puncture Simulator Widget
   -------------------------------------------------------------------------- */
function initPunctureSimulator() {
  const canvas = document.getElementById('punctureCanvas');
  const simulateBtn = document.getElementById('btnSimulatePuncture');
  const resetBtn = document.getElementById('btnResetSimulator');
  const simStatus = document.getElementById('simStatusText');

  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationId = null;
  let state = 'idle'; // 'idle', 'punctured', 'sealing', 'sealed'
  let nailY = -40;
  let sealantPulse = 0;

  function drawTireCrossSection() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    // Background Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Outer Tire Rubber Arc / Band
    ctx.fillStyle = '#1e293b'; // Outer rubber
    ctx.fillRect(40, 140, w - 80, 50);

    // Steel Belts Reinforcement Layer
    ctx.fillStyle = '#475569';
    ctx.fillRect(40, 175, w - 80, 10);
    ctx.fillStyle = '#ff5c00';
    for (let i = 50; i < w - 50; i += 20) {
      ctx.fillRect(i, 177, 10, 6);
    }

    // Inner Fluid Sealant Layer (Flat Free Blue Gel)
    ctx.fillStyle = 'rgba(0, 150, 255, 0.75)';
    ctx.fillRect(45, 185, w - 90, 18);

    // Internal Air Chamber
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(45, 203, w - 90, 45);

    // Chamber Label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Montserrat';
    ctx.fillText('CÂMARA DE AR INTERNA (PRESSÃO 110 PSI)', 100, 230);

    // Draw Sealant Particles
    ctx.fillStyle = '#60a5fa';
    for (let i = 0; i < 15; i++) {
      const px = 60 + i * 25 + Math.sin(Date.now() * 0.003 + i) * 5;
      ctx.beginPath();
      ctx.arc(px, 194, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // State Rendering
    if (state === 'puncturing' || state === 'punctured' || state === 'sealing' || state === 'sealed') {
      // Draw Steel Nail
      const nailX = w / 2;

      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(nailX - 6, nailY);
      ctx.lineTo(nailX + 6, nailY);
      ctx.lineTo(nailX + 3, nailY + 90);
      ctx.lineTo(nailX - 3, nailY + 90);
      ctx.closePath();
      ctx.fill();

      // Puncture hole
      if (nailY > 80) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(nailX - 4, 140, 8, 50);
      }

      // Air leak bubbles if puncturing
      if (state === 'puncturing') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(nailX - 10, 130 - Math.random() * 20, 4, 0, Math.PI * 2);
        ctx.arc(nailX + 12, 120 - Math.random() * 20, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Blue Gel Active Seal
      if (state === 'sealing' || state === 'sealed') {
        sealantPulse += 0.05;
        const glowRadius = Math.min(18, 8 + Math.sin(sealantPulse) * 4);

        ctx.fillStyle = '#009668'; // Sealant locked!
        ctx.beginPath();
        ctx.arc(nailX, 175, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 12px Inter';
        ctx.fillText('✓ VEDAÇÃO COMPACTA 6MM ATIVA', nailX - 100, 110);
      }
    }
  }

  function animate() {
    if (state === 'puncturing') {
      nailY += 4;
      if (nailY >= 95) {
        state = 'sealing';
        if (simStatus) simStatus.textContent = 'Selante Reagindo: Fibras e micro-polímeros fluindo para a perfuração...';
        setTimeout(() => {
          state = 'sealed';
          if (simStatus) simStatus.innerHTML = '<span style="color:#009668">✓ Perfuração Veda Instantaneamente! Pressão mantida em 110 PSI.</span>';
        }, 1200);
      }
    }
    drawTireCrossSection();
    animationId = requestAnimationFrame(animate);
  }

  drawTireCrossSection();

  if (simulateBtn) {
    simulateBtn.addEventListener('click', () => {
      if (state === 'idle') {
        state = 'puncturing';
        nailY = 0;
        if (simStatus) simStatus.textContent = 'Perfurando pneu com prego de aço 6mm...';
        cancelAnimationFrame(animationId);
        animate();
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state = 'idle';
      nailY = -40;
      if (simStatus) simStatus.textContent = 'Clique para simular furo de prego 6mm em tempo real.';
      cancelAnimationFrame(animationId);
      drawTireCrossSection();
    });
  }
}

/* --------------------------------------------------------------------------
   5. Contact & Proposal Form Handling
   -------------------------------------------------------------------------- */
function initProposalForm() {
  const proposalForm = document.getElementById('proposalForm');
  const modalOverlay = document.getElementById('successModal');
  const closeModalBtn = document.getElementById('closeModalBtn');

  if (!proposalForm) return;

  proposalForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Perform basic validation
    const name = document.getElementById('formName').value.trim();
    const company = document.getElementById('formCompany').value.trim();
    const email = document.getElementById('formEmail').value.trim();
    const fleet = document.getElementById('formFleetSize').value;
    const message = document.getElementById('formMessage').value.trim();

    if (!name || !email || !company) {
      alert('Por favor, preencha os campos obrigatórios (Nome, E-mail Corporativo e Empresa).');
      return;
    }

    const submitBtn = proposalForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando solicitação...';

    try {
      const response = await fetch('https://formsubmit.co/ajax/vicgouveia@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: '[FLAT FREE B2B] Nova Solicitação de Orçamento',
          _template: 'table',
          Nome: name,
          Empresa: company,
          Email: email,
          Tamanho_da_Frota: fleet,
          Mensagem_e_Detalhes: message || 'Nenhuma mensagem adicional fornecida.'
        })
      });

      if (response.ok) {
        if (modalOverlay) {
          modalOverlay.classList.add('active');
        }
        proposalForm.reset();
      } else {
        // Fallback standard submit
        proposalForm.submit();
      }
    } catch (err) {
      console.warn('AJAX submit failed, falling back to direct submit:', err);
      proposalForm.submit();
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });

  if (closeModalBtn && modalOverlay) {
    closeModalBtn.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });
  }
}

/* --------------------------------------------------------------------------
   6. Smooth Scroll
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElem = document.querySelector(targetId);
      if (targetElem) {
        e.preventDefault();
        targetElem.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}
