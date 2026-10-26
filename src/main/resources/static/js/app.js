/**
 * ============================================================================
 * SOMEP — SOCIEDAD MEXICANA DE PÉPTIDOS
 * Aplicación Web Educativa e Interactiva — Catálogo de Péptidos y Moléculas
 * Vanilla JavaScript ES6+ — Consumo de API REST, Filtros y Accesibilidad
 * ============================================================================
 */

(() => {
  'use strict';

  // Configuración de Endpoints
  const API_BASE = '/api/peptidos';

  // Estado de la Aplicación
  const state = {
    allPeptidos: [],
    filteredPeptidos: [],
    categories: [],
    activeCategory: 'Todos',
    searchQuery: '',
    selectedPeptido: null,
    lastFocusedElement: null,
    isLoading: false
  };

  // Referencias a Elementos del DOM
  const DOM = {
    // Entradas y Filtros
    searchInput: document.getElementById('search-input'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    categoryChips: document.getElementById('category-chips'),
    resultsCount: document.getElementById('results-count'),
    resetAllBtn: document.getElementById('reset-all-btn'),
    clearFiltersBtn: document.getElementById('clear-filters-btn'),
    retryBtn: document.getElementById('retry-btn'),

    // Estadísticas
    statTotal: document.getElementById('stat-total'),
    statCategories: document.getElementById('stat-categories'),

    // Contenedores y Estados
    cardsGrid: document.getElementById('cards-grid'),
    statusContainer: document.getElementById('status-container'),
    loadingState: document.getElementById('loading-state'),
    errorState: document.getElementById('error-state'),
    errorMessage: document.getElementById('error-message'),
    emptyState: document.getElementById('empty-state'),

    // Modal de Detalle
    modal: document.getElementById('detail-modal'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalBottomCloseBtn: document.getElementById('modal-bottom-close-btn'),
    modalCategory: document.getElementById('modal-category'),
    modalTitle: document.getElementById('modal-title'),
    modalSubtitle: document.getElementById('modal-subtitle'),
    modalQueEs: document.getElementById('modal-que-es'),
    modalQueHace: document.getElementById('modal-que-hace'),
    modalUsoMedico: document.getElementById('modal-uso-medico'),
    modalUsoSection: document.getElementById('modal-uso-section'),
    modalClave: document.getElementById('modal-clave'),
    modalFuente: document.getElementById('modal-fuente'),
    modalInfographicImg: document.getElementById('modal-infographic-img'),
    tabDataBtn: document.getElementById('tab-data-btn'),
    tabInfographicBtn: document.getElementById('tab-infographic-btn'),
    modalDataPane: document.getElementById('modal-data-pane'),
    modalInfographicPane: document.getElementById('modal-infographic-pane')
  };

  /**
   * Inicialización al cargar el documento
   */
  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    fetchInitialData();
  });

  /**
   * Configuración de eventos de la interfaz
   */
  function setupEventListeners() {
    // Buscador en tiempo real con debounce
    let searchTimeout;
    DOM.searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const val = e.target.value.trim();
      DOM.clearSearchBtn.hidden = val.length === 0;
      
      searchTimeout = setTimeout(() => {
        state.searchQuery = val;
        fetchCatalog();
      }, 250);
    });

    // Limpiar buscador
    DOM.clearSearchBtn.addEventListener('click', () => {
      DOM.searchInput.value = '';
      DOM.clearSearchBtn.hidden = true;
      state.searchQuery = '';
      DOM.searchInput.focus();
      fetchCatalog();
    });

    // Restablecer todos los filtros
    const resetFiltersHandler = () => {
      DOM.searchInput.value = '';
      DOM.clearSearchBtn.hidden = true;
      state.searchQuery = '';
      state.activeCategory = 'Todos';
      fetchCatalog();
    };

    DOM.resetAllBtn.addEventListener('click', resetFiltersHandler);
    DOM.clearFiltersBtn.addEventListener('click', resetFiltersHandler);
    DOM.retryBtn.addEventListener('click', () => fetchInitialData());

    // Eventos de Pestañas del Modal
    DOM.tabDataBtn.addEventListener('click', () => switchModalTab('data'));
    DOM.tabInfographicBtn.addEventListener('click', () => switchModalTab('infographic'));

    // Cierre de Modal
    DOM.modalCloseBtn.addEventListener('click', closeModal);
    DOM.modalBottomCloseBtn.addEventListener('click', closeModal);
    DOM.modal.addEventListener('click', (e) => {
      if (e.target === DOM.modal) {
        closeModal();
      }
    });

    // Accesibilidad por teclado: tecla Escape para cerrar modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !DOM.modal.hidden) {
        closeModal();
      }
    });
  }

  /**
   * Carga inicial simultánea de catálogo y categorías
   */
  async function fetchInitialData() {
    showLoading();
    try {
      // Peticiones paralelas
      const [peptidosRes, categoriasRes] = await Promise.all([
        fetch(API_BASE),
        fetch(`${API_BASE}/categorias`)
      ]);

      if (!peptidosRes.ok) {
        throw new Error(`Error en el servidor al consultar el catálogo (${peptidosRes.status})`);
      }

      state.allPeptidos = await peptidosRes.json();
      state.filteredPeptidos = [...state.allPeptidos];

      if (categoriasRes.ok) {
        state.categories = await categoriasRes.json();
      } else {
        // Fallback: extraer categorías únicas del catálogo
        const cats = new Set(state.allPeptidos.map(p => p.categoria));
        state.categories = Array.from(cats);
      }

      // Actualizar contadores y métricas institucionales
      DOM.statTotal.textContent = state.allPeptidos.length;
      DOM.statCategories.textContent = state.categories.length;

      // Renderizar interfaz
      renderCategoryChips();
      renderCatalog();
    } catch (err) {
      console.error('Error al iniciar SOMEP:', err);
      showError(err.message || 'No fue posible conectar con el servidor.');
    }
  }

  /**
   * Consulta el catálogo aplicando los filtros en el backend
   */
  async function fetchCatalog() {
    showLoading();
    try {
      const params = new URLSearchParams();
      if (state.activeCategory && state.activeCategory !== 'Todos') {
        params.append('categoria', state.activeCategory);
      }
      if (state.searchQuery && state.searchQuery.trim() !== '') {
        params.append('buscar', state.searchQuery.trim());
      }

      const url = params.toString() ? `${API_BASE}?${params.toString()}` : API_BASE;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error del servidor al filtrar catálogo (${response.status})`);
      }

      state.filteredPeptidos = await response.json();
      renderCatalog();
      renderCategoryChips(); // Actualiza conteos en chips
    } catch (err) {
      console.error('Error al filtrar catálogo:', err);
      showError(err.message);
    }
  }

  /**
   * Renderiza las fichas en la cuadrícula
   */
  function renderCatalog() {
    hideAllStates();
    DOM.cardsGrid.innerHTML = '';

    const list = state.filteredPeptidos;
    const total = list.length;

    // Resumen de resultados
    if (total === 1) {
      DOM.resultsCount.textContent = 'Mostrando 1 compuesto verificado';
    } else {
      DOM.resultsCount.textContent = `Mostrando ${total} compuestos verificados`;
    }

    const hasFilters = (state.activeCategory !== 'Todos') || (state.searchQuery.trim() !== '');
    DOM.resetAllBtn.hidden = !hasFilters;

    if (total === 0) {
      showEmpty();
      return;
    }

    // Creación segura de tarjetas DOM (sin innerHTML para datos no confiables)
    list.forEach(peptido => {
      const card = createCompoundCard(peptido);
      DOM.cardsGrid.appendChild(card);
    });
  }

  /**
   * Construye el nodo DOM de una tarjeta individual
   */
  function createCompoundCard(peptido) {
    const card = document.createElement('article');
    card.className = 'compound-card';
    card.setAttribute('aria-label', `Ficha de ${peptido.nombre}`);

    // Franja superior con degradado institucional
    const accent = document.createElement('div');
    accent.className = 'card-top-accent';
    card.appendChild(accent);

    const body = document.createElement('div');
    body.className = 'card-body';

    // Fila de categoría
    const catRow = document.createElement('div');
    catRow.className = 'card-category-row';

    const catBadge = document.createElement('span');
    catBadge.className = 'category-badge';
    catBadge.setAttribute('data-cat', peptido.categoria);
    catBadge.textContent = peptido.categoria;
    catRow.appendChild(catBadge);
    body.appendChild(catRow);

    // Título (Nombre)
    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = peptido.nombre;
    body.appendChild(title);

    // Subtítulo
    const sub = document.createElement('p');
    sub.className = 'card-subtitle';
    sub.textContent = peptido.subtitulo;
    body.appendChild(sub);

    // Definición rápida: ¿Qué es?
    const queEs = document.createElement('p');
    queEs.className = 'card-que-es';
    // Truncado prudente para visualización homogénea
    const maxLen = 145;
    queEs.textContent = peptido.queEs.length > maxLen 
      ? peptido.queEs.substring(0, maxLen).trim() + '…' 
      : peptido.queEs;
    body.appendChild(queEs);

    // Caja Clave destacada
    const claveBox = document.createElement('div');
    claveBox.className = 'card-clave-box';

    const claveHeader = document.createElement('div');
    claveHeader.className = 'clave-header';
    claveHeader.innerHTML = `
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
        <path d="M12 2L1 21h22L12 2zm1 14h-2v-2h2v2zm0-4h-2V8h2v4z"/>
      </svg>
      <span>Punto Clave</span>
    `;
    claveBox.appendChild(claveHeader);

    const claveText = document.createElement('p');
    claveText.className = 'clave-text';
    const maxClaveLen = 120;
    claveText.textContent = peptido.clave.length > maxClaveLen
      ? peptido.clave.substring(0, maxClaveLen).trim() + '…'
      : peptido.clave;
    claveBox.appendChild(claveText);
    body.appendChild(claveBox);

    // Pie de Tarjeta con Botón de Detalle
    const footer = document.createElement('div');
    footer.className = 'card-footer';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-card-detail';
    btn.innerHTML = `
      <span>Consultar Ficha Científica</span>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
      </svg>
    `;
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.addEventListener('click', (e) => {
      state.lastFocusedElement = e.currentTarget;
      openModal(peptido);
    });

    footer.appendChild(btn);
    body.appendChild(footer);
    card.appendChild(body);

    return card;
  }

  /**
   * Renderiza los botones de selección por categoría
   */
  function renderCategoryChips() {
    DOM.categoryChips.innerHTML = '';

    const createChip = (name, count) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `chip-btn ${state.activeCategory === name ? 'active' : ''}`;
      chip.setAttribute('role', 'radio');
      chip.setAttribute('aria-checked', state.activeCategory === name ? 'true' : 'false');

      const label = document.createElement('span');
      label.textContent = name;
      chip.appendChild(label);

      if (typeof count === 'number') {
        const badge = document.createElement('span');
        badge.className = 'chip-badge';
        badge.textContent = count;
        chip.appendChild(badge);
      }

      chip.addEventListener('click', () => {
        if (state.activeCategory === name) return;
        state.activeCategory = name;
        fetchCatalog();
      });

      return chip;
    };

    // Chip general: "Todos"
    const totalCount = state.allPeptidos.length;
    DOM.categoryChips.appendChild(createChip('Todos', totalCount));

    // Chips específicos
    state.categories.forEach(cat => {
      const count = state.allPeptidos.filter(p => p.categoria.toLowerCase() === cat.toLowerCase()).length;
      DOM.categoryChips.appendChild(createChip(cat, count));
    });
  }

  /**
   * Abre el modal de detalle con la información del compuesto
   */
  function openModal(peptido) {
    state.selectedPeptido = peptido;

    // Poblar textos de manera segura
    DOM.modalCategory.textContent = peptido.categoria;
    DOM.modalCategory.setAttribute('data-cat', peptido.categoria);
    DOM.modalTitle.textContent = peptido.nombre;
    DOM.modalSubtitle.textContent = peptido.subtitulo;

    DOM.modalQueEs.textContent = peptido.queEs;
    DOM.modalQueHace.textContent = peptido.queHaceOEstudia;

    if (peptido.usoMedico && peptido.usoMedico.trim() !== '') {
      DOM.modalUsoMedico.textContent = peptido.usoMedico;
      DOM.modalUsoSection.hidden = false;
    } else {
      DOM.modalUsoSection.hidden = true;
    }

    DOM.modalClave.textContent = peptido.clave;
    DOM.modalFuente.textContent = peptido.fuente || 'Información técnica institucional de SOMEP.';

    // Infografía gráfica
    if (peptido.imagenUrl) {
      DOM.modalInfographicImg.src = peptido.imagenUrl;
      DOM.modalInfographicImg.alt = `Infografía científica oficial de ${peptido.nombre}`;
      DOM.tabInfographicBtn.hidden = false;
    } else {
      DOM.tabInfographicBtn.hidden = true;
    }

    // Regresar a la primera pestaña
    switchModalTab('data');

    // Mostrar modal y bloquear scroll del body
    DOM.modal.hidden = false;
    document.body.classList.add('modal-open');

    // Dar foco accesible al botón de cierre
    DOM.modalCloseBtn.focus();
  }

  /**
   * Cierra el modal de detalle
   */
  function closeModal() {
    DOM.modal.hidden = true;
    document.body.classList.remove('modal-open');
    state.selectedPeptido = null;

    // Restaurar foco al elemento que activó el modal
    if (state.lastFocusedElement) {
      state.lastFocusedElement.focus();
    }
  }

  /**
   * Alterna entre pestañas del modal (Ficha Científica / Infografía)
   */
  function switchModalTab(tabName) {
    if (tabName === 'data') {
      DOM.tabDataBtn.classList.add('active');
      DOM.tabDataBtn.setAttribute('aria-selected', 'true');
      DOM.tabInfographicBtn.classList.remove('active');
      DOM.tabInfographicBtn.setAttribute('aria-selected', 'false');

      DOM.modalDataPane.classList.add('active');
      DOM.modalDataPane.hidden = false;
      DOM.modalInfographicPane.classList.remove('active');
      DOM.modalInfographicPane.hidden = true;
    } else {
      DOM.tabInfographicBtn.classList.add('active');
      DOM.tabInfographicBtn.setAttribute('aria-selected', 'true');
      DOM.tabDataBtn.classList.remove('active');
      DOM.tabDataBtn.setAttribute('aria-selected', 'false');

      DOM.modalInfographicPane.classList.add('active');
      DOM.modalInfographicPane.hidden = false;
      DOM.modalDataPane.classList.remove('active');
      DOM.modalDataPane.hidden = true;
    }
  }

  /**
   * Gestión visual de estados
   */
  function showLoading() {
    state.isLoading = true;
    DOM.loadingState.hidden = false;
    DOM.errorState.hidden = true;
    DOM.emptyState.hidden = true;
  }

  function hideAllStates() {
    state.isLoading = false;
    DOM.loadingState.hidden = true;
    DOM.errorState.hidden = true;
    DOM.emptyState.hidden = true;
  }

  function showError(msg) {
    state.isLoading = false;
    DOM.loadingState.hidden = true;
    DOM.errorState.hidden = false;
    DOM.emptyState.hidden = true;
    DOM.errorMessage.textContent = msg || 'Ocurrió un error al procesar la solicitud.';
    DOM.cardsGrid.innerHTML = '';
    DOM.resultsCount.textContent = 'Error de conexión';
  }

  function showEmpty() {
    state.isLoading = false;
    DOM.loadingState.hidden = true;
    DOM.errorState.hidden = true;
    DOM.emptyState.hidden = false;
    DOM.cardsGrid.innerHTML = '';
  }

})();
