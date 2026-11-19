/**
 * SOMEP - Módulo de Gestión Administrativa y Operaciones CRUD
 * Vanilla JavaScript ES6+
 * Sincronización en tiempo real sin recargar página & Carga de imágenes locales
 */

document.addEventListener('DOMContentLoaded', () => {
    // Canal de sincronización en tiempo real entre pestañas y catálogo público
    const somepSyncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('somep_catalog_channel') : null;

    // Estado en memoria
    let todosLosPeptidos = [];
    let peptidoSeleccionadoParaEliminar = null;
    let csrfTokenCached = null;

    // Elementos del DOM
    const userDisplayName = document.getElementById('user-display-name');
    const userDisplayRole = document.getElementById('user-display-role');
    const userAvatar = document.getElementById('user-avatar');
    const btnLogout = document.getElementById('btn-logout');

    const statTotalCompuestos = document.getElementById('stat-total-compuestos');
    const statTotalCategorias = document.getElementById('stat-total-categorias');
    const statUltimaAct = document.getElementById('stat-ultima-act');

    const searchInput = document.getElementById('admin-search-input');
    const categoryFilter = document.getElementById('admin-category-filter');
    const tableBody = document.getElementById('table-body');
    const btnOpenCreateModal = document.getElementById('btn-open-create-modal');

    // Modales y Formulario
    const modalFormOverlay = document.getElementById('modal-form-overlay');
    const formModalTitle = document.getElementById('form-modal-title');
    const peptidoForm = document.getElementById('peptido-form');
    const formPeptidoId = document.getElementById('form-peptido-id');
    const formImagen = document.getElementById('form-imagen');
    const formImagenFile = document.getElementById('form-imagen-file');
    const dropzoneArea = document.getElementById('dropzone-area');
    const dropzoneEmptyState = document.getElementById('dropzone-empty-state');
    const btnChangeImage = document.getElementById('btn-change-image');
    const uploadStatus = document.getElementById('upload-status');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreviewImg = document.getElementById('image-preview-img');
    const imagePreviewName = document.getElementById('image-preview-name');
    const btnRemovePreview = document.getElementById('btn-remove-preview');

    const btnSavePeptido = document.getElementById('btn-save-peptido');
    const saveBtnText = document.getElementById('save-btn-text');
    const saveBtnSpinner = document.getElementById('save-btn-spinner');
    const btnCloseFormModal = document.getElementById('btn-close-form-modal');
    const btnCancelForm = document.getElementById('btn-cancel-form');

    const modalViewOverlay = document.getElementById('modal-view-overlay');
    const viewModalBody = document.getElementById('view-modal-body');
    const btnCloseViewModal = document.getElementById('btn-close-view-modal');
    const btnCloseView = document.getElementById('btn-close-view');

    const modalDeleteOverlay = document.getElementById('modal-delete-overlay');
    const deleteCompoundName = document.getElementById('delete-compound-name');
    const deleteCompoundId = document.getElementById('delete-compound-id');
    const btnConfirmDelete = document.getElementById('btn-confirm-delete');
    const delBtnText = document.getElementById('del-btn-text');
    const delBtnSpinner = document.getElementById('del-btn-spinner');
    const btnCloseDeleteModal = document.getElementById('btn-close-delete-modal');
    const btnCancelDelete = document.getElementById('btn-cancel-delete');

    const toastContainer = document.getElementById('toast-container');

    // Estado de control de redirección
    let redirigiendoALogin = false;

    function redirigirALoginExpirado(mensaje) {
        if (redirigiendoALogin) return;
        redirigiendoALogin = true;

        mostrarToast(mensaje || 'Tu sesión ha expirado o el servidor se reinició. Redirigiendo a inicio de sesión...', 'danger');
        cerrarModalFormulario();
        cerrarModalDelete();

        setTimeout(() => {
            window.location.replace('/admin/login.html?expired=true');
        }, 1200);
    }

    // 1. Inicialización: Verificar sesión y cargar datos iniciales
    iniciarPanel();

    async function iniciarPanel() {
        const sesionValida = await verificarSesion();
        if (!sesionValida) return;

        await obtenerCsrfToken();
        await Promise.all([cargarEstadisticas(), cargarPeptidos(true), cargarCursos(true)]);
        inicializarEventos();
    }

    // 2. Manejo de Seguridad y Sesión
    async function verificarSesion() {
        try {
            const res = await fetch('/api/auth/me', {
                credentials: 'same-origin',
                cache: 'no-store',
                headers: { 'Accept': 'application/json' }
            });

            if (!res.ok) {
                redirigirALoginExpirado();
                return false;
            }
            const data = await res.json();
            if (!data.autenticado || data.role !== 'ROLE_ADMIN') {
                redirigirALoginExpirado();
                return false;
            }

            if (userDisplayName) userDisplayName.textContent = data.nombreCompleto || data.username;
            if (userDisplayRole) userDisplayRole.textContent = data.role === 'ROLE_ADMIN' ? 'Administrador General' : data.role;
            if (userAvatar) userAvatar.textContent = (data.nombreCompleto || data.username).charAt(0).toUpperCase();
            return true;
        } catch (error) {
            redirigirALoginExpirado();
            return false;
        }
    }

    // Cliente HTTP centralizado con manejo automático de CSRF, cookies y caducidad de sesión
    async function authFetch(url, options = {}, esReintento = false) {
        options.credentials = 'same-origin';
        options.headers = options.headers || {};

        if (options.body && typeof options.body === 'string' && !options.headers['Content-Type']) {
            options.headers['Content-Type'] = 'application/json';
        }
        if (!options.headers['Accept']) {
            options.headers['Accept'] = 'application/json';
        }

        const metodo = (options.method || 'GET').toUpperCase();
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(metodo)) {
            const token = await obtenerCsrfToken(esReintento);
            if (token) {
                options.headers['X-XSRF-TOKEN'] = token;
            }
        }

        const res = await fetch(url, options);

        if (res.status === 401) {
            redirigirALoginExpirado('Tu sesión ha expirado o el servidor se reinició. Redirigiendo a inicio de sesión...');
            throw new Error('Sesión no autorizada o expirada');
        }

        // Si devuelve 403 Forbidden en operaciones de modificación, intentar revalidar CSRF una sola vez
        if (res.status === 403 && !esReintento && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(metodo)) {
            csrfTokenCached = null;
            return authFetch(url, options, true);
        }

        return res;
    }

    async function cerrarSesion() {
        if (btnLogout) {
            btnLogout.disabled = true;
            btnLogout.innerHTML = '<span class="spinner" style="border-top-color: var(--primary); width: 0.9rem; height: 0.9rem;"></span> <span>Saliendo...</span>';
        }

        try {
            const token = await obtenerCsrfToken();
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': token || ''
                }
            });
        } catch (ignored) {
        } finally {
            document.cookie = 'JSESSIONID=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            document.cookie = 'XSRF-TOKEN=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            window.location.href = '/admin/login.html?logout=true';
        }
    }

    async function obtenerCsrfToken(forzarRefresco = false) {
        if (!forzarRefresco) {
            const cookieToken = getCookie('XSRF-TOKEN');
            if (cookieToken) {
                csrfTokenCached = cookieToken;
                return cookieToken;
            }
        }

        try {
            const res = await fetch('/api/auth/csrf', {
                credentials: 'same-origin',
                cache: 'no-store'
            });
            if (res.ok) {
                const data = await res.json();
                if (data.token) {
                    csrfTokenCached = data.token;
                    return data.token;
                }
            }
        } catch (ignored) {}

        return csrfTokenCached;
    }

    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return match ? decodeURIComponent(match[3]) : null;
    }

    // Notificación en tiempo real sin recargar página
    function notificarSincronizacion(accion, id) {
        const payload = { action: 'catalog_updated', eventType: accion, id, timestamp: Date.now() };
        if (somepSyncChannel) {
            somepSyncChannel.postMessage(payload);
        }
        try {
            localStorage.setItem('somep_catalog_last_sync', JSON.stringify(payload));
        } catch (ignored) {}
    }

    function notificarSincronizacionCursos(accion, id) {
        const payload = { action: 'courses_updated', eventType: accion, id, timestamp: Date.now() };
        if (somepSyncChannel) {
            somepSyncChannel.postMessage(payload);
        }
        try {
            localStorage.setItem('somep_catalog_last_sync', JSON.stringify(payload));
        } catch (ignored) {}
    }

    // 3. Cargar Estadísticas
    async function cargarEstadisticas() {
        try {
            const res = await authFetch('/api/admin/peptidos/stats');
            if (res.ok) {
                const stats = await res.json();
                if (statTotalCompuestos) statTotalCompuestos.textContent = stats.totalCompuestos;
                if (statTotalCategorias) statTotalCategorias.textContent = stats.totalCategorias;
                const statTotalCursos = document.getElementById('stat-total-cursos');
                if (statTotalCursos) statTotalCursos.textContent = stats.totalCursos !== undefined ? stats.totalCursos : 0;
                if (statUltimaAct) {
                    if (stats.ultimaActualizacion) {
                        const fecha = new Date(stats.ultimaActualizacion);
                        statUltimaAct.textContent = fecha.toLocaleString('es-MX', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        });
                    } else {
                        statUltimaAct.textContent = 'Al día';
                    }
                }
            }
        } catch (e) {
            if (statTotalCompuestos) statTotalCompuestos.textContent = '—';
            if (statTotalCategorias) statTotalCategorias.textContent = '—';
            if (statUltimaAct) statUltimaAct.textContent = '—';
        }
    }

    // 4. Cargar y Renderizar Catálogo en vivo
    async function cargarPeptidos(mostrarSpinner = false) {
        try {
            if (mostrarSpinner && (!todosLosPeptidos || todosLosPeptidos.length === 0)) {
                tableBody.innerHTML = `
                    <tr>
                      <td colspan="6" class="empty-state">
                        <div class="spinner" style="border-top-color: var(--primary); width: 2rem; height: 2rem;"></div>
                        <p style="margin-top: 1rem;">Cargando registros...</p>
                      </td>
                    </tr>
                `;
            }

            const res = await authFetch('/api/admin/peptidos');
            if (!res.ok) throw new Error('Error al consultar el catálogo');

            todosLosPeptidos = await res.json();
            // Ordenar siempre por ID descendente para que los recién creados aparezcan de primero arriba
            todosLosPeptidos.sort((a, b) => (b.id || 0) - (a.id || 0));
            actualizarOpcionesCategorias();
            aplicarFiltros();
        } catch (error) {
            if (mostrarSpinner && (!todosLosPeptidos || todosLosPeptidos.length === 0)) {
                tableBody.innerHTML = `
                    <tr>
                      <td colspan="6" class="empty-state">
                        <div class="empty-state-icon">⚠️</div>
                        <p>No fue posible cargar el catálogo. Por favor verifique la conexión.</p>
                      </td>
                    </tr>
                `;
            }
            if (error.message !== 'Sesión no autorizada o expirada') {
                mostrarToast('Error al conectar con el servidor', 'danger');
            }
        }
    }

    function actualizarOpcionesCategorias() {
        if (!categoryFilter) return;
        const categoriaActual = categoryFilter.value;
        const categorias = Array.from(new Set(todosLosPeptidos.map(p => p.categoria).filter(Boolean))).sort();

        categoryFilter.innerHTML = '<option value="">Todas las categorías</option>';
        categorias.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            if (cat === categoriaActual) opt.selected = true;
            categoryFilter.appendChild(opt);
        });
    }

    function renderizarTabla(peptidos) {
        if (!peptidos || peptidos.length === 0) {
            tableBody.innerHTML = `
                <tr>
                  <td colspan="6" class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <p>No se encontraron compuestos que coincidan con la búsqueda.</p>
                  </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = peptidos.map(p => {
            const fecha = p.fechaActualizacion ? new Date(p.fechaActualizacion).toLocaleDateString('es-MX', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            }) : '—';

            return `
                <tr data-id="${p.id}">
                  <td style="font-weight: 600; color: var(--text-muted);">#${p.id}</td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                      ${p.imagenUrl ? `<img src="${p.imagenUrl}" alt="" style="width: 28px; height: 28px; border-radius: 4px; object-fit: cover;" onerror="this.style.display='none'">` : ''}
                      <strong>${escapeHtml(p.nombre)}</strong>
                    </div>
                  </td>
                  <td><span class="badge-cat">${escapeHtml(p.categoria)}</span></td>
                  <td style="color: var(--text-muted); max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${escapeHtml(p.subtitulo)}
                  </td>
                  <td>${fecha}</td>
                  <td style="text-align: right;">
                    <div class="action-buttons" style="justify-content: flex-end;">
                      <button class="btn-action btn-view" onclick="verDetallePeptido(${p.id})" title="Ver detalles">
                        👁️ Ver
                      </button>
                      <button class="btn-action btn-edit" onclick="abrirEditarPeptido(${p.id})" title="Modificar">
                        ✏️ Editar
                      </button>
                      <button class="btn-action btn-delete" onclick="abrirEliminarPeptido(${p.id}, '${escapeHtml(p.nombre)}')" title="Eliminar">
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
            `;
        }).join('');
    }

    // 5. Filtros y Búsqueda
    function aplicarFiltros() {
        const texto = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const cat = categoryFilter ? categoryFilter.value : '';

        const filtrados = todosLosPeptidos.filter(p => {
            const coincideTexto = !texto ||
                (p.nombre && p.nombre.toLowerCase().includes(texto)) ||
                (p.subtitulo && p.subtitulo.toLowerCase().includes(texto)) ||
                (p.categoria && p.categoria.toLowerCase().includes(texto));

            const coincideCat = !cat || p.categoria === cat;

            return coincideTexto && coincideCat;
        });

        renderizarTabla(filtrados);
    }

    // 6. Formulario Crear / Editar con subida de imagen local
    function abrirModalCrear() {
        limpiarFormulario();
        formModalTitle.textContent = 'Agregar nuevo compuesto';
        formPeptidoId.value = '';
        saveBtnText.textContent = 'Guardar compuesto';
        modalFormOverlay.classList.add('active');
        document.getElementById('form-nombre').focus();
    }

    window.abrirEditarPeptido = function(id) {
        const peptido = todosLosPeptidos.find(p => p.id === id);
        if (!peptido) return;

        limpiarFormulario();
        formModalTitle.textContent = `Editar compuesto: ${peptido.nombre}`;
        formPeptidoId.value = peptido.id;
        saveBtnText.textContent = 'Actualizar compuesto';

        document.getElementById('form-nombre').value = peptido.nombre || '';
        document.getElementById('form-categoria').value = peptido.categoria || '';
        document.getElementById('form-subtitulo').value = peptido.subtitulo || '';
        document.getElementById('form-que-es').value = peptido.queEs || '';
        document.getElementById('form-que-hace').value = peptido.queHaceOEstudia || '';
        document.getElementById('form-uso-medico').value = peptido.usoMedico || '';
        document.getElementById('form-clave').value = peptido.clave || '';
        document.getElementById('form-fuente').value = peptido.fuente || '';
        if (formImagen) formImagen.value = peptido.imagenUrl || '';

        if (peptido.imagenUrl) {
            mostrarPreviewImagen(peptido.imagenUrl, peptido.nombre);
        }

        modalFormOverlay.classList.add('active');
        document.getElementById('form-nombre').focus();
    };

    function mostrarPreviewImagen(url, nombre) {
        if (!imagePreviewContainer || !imagePreviewImg) return;
        imagePreviewImg.src = url;
        if (imagePreviewName) imagePreviewName.textContent = nombre || 'Imagen del compuesto';
        imagePreviewContainer.style.display = 'flex';
        if (dropzoneEmptyState) dropzoneEmptyState.style.display = 'none';
        if (uploadStatus) uploadStatus.style.display = 'none';
    }

    function ocultarPreviewImagen() {
        if (imagePreviewImg) imagePreviewImg.src = '';
        if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';
        if (dropzoneEmptyState) dropzoneEmptyState.style.display = 'block';
        if (uploadStatus) uploadStatus.style.display = 'none';
        if (formImagen) formImagen.value = '';
        if (formImagenFile) formImagenFile.value = '';
    }

    // Subida de imagen directa desde el dispositivo
    async function subirImagenDesdeDispositivo(event) {
        const file = event.target ? (event.target.files ? event.target.files[0] : null) : (event.files ? event.files[0] : null);
        if (!file) return;

        if (!file.type || !file.type.startsWith('image/')) {
            mostrarToast('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP, SVG o GIF).', 'danger');
            if (formImagenFile) formImagenFile.value = '';
            return;
        }

        if (file.size > 15 * 1024 * 1024) {
            mostrarToast('La imagen supera el límite permitido de 15 MB.', 'danger');
            if (formImagenFile) formImagenFile.value = '';
            return;
        }

        if (uploadStatus) uploadStatus.style.display = 'flex';
        if (dropzoneEmptyState) dropzoneEmptyState.style.display = 'none';
        if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await authFetch('/api/admin/peptidos/upload-imagen', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (res.ok && data.url) {
                if (formImagen) formImagen.value = data.url;
                mostrarPreviewImagen(data.url, file.name);
                mostrarToast('Imagen subida exitosamente desde tu dispositivo.', 'success');
            } else {
                ocultarPreviewImagen();
                mostrarToast(data.mensaje || 'Error al subir la imagen al servidor.', 'danger');
            }
        } catch (error) {
            ocultarPreviewImagen();
            if (error.message !== 'Sesión no autorizada o expirada') {
                mostrarToast('Error de red al intentar subir la imagen.', 'danger');
            }
        } finally {
            if (uploadStatus) uploadStatus.style.display = 'none';
        }
    }

    async function guardarPeptido() {
        limpiarErroresFormulario();

        const id = formPeptidoId.value;
        const nombre = document.getElementById('form-nombre').value.trim();
        const categoria = document.getElementById('form-categoria').value.trim();
        const subtitulo = document.getElementById('form-subtitulo').value.trim();
        const queEs = document.getElementById('form-que-es').value.trim();
        const queHaceOEstudia = document.getElementById('form-que-hace').value.trim();
        const usoMedico = document.getElementById('form-uso-medico').value.trim();
        const clave = document.getElementById('form-clave').value.trim();
        const fuente = document.getElementById('form-fuente').value.trim();
        const imagenUrl = formImagen ? formImagen.value.trim() : '';

        let valido = true;

        if (!nombre) { mostrarErrorCampo('form-nombre', 'err-nombre', 'El nombre es obligatorio.'); valido = false; }
        if (!categoria) { mostrarErrorCampo('form-categoria', 'err-categoria', 'La categoría es obligatoria.'); valido = false; }
        if (!subtitulo) { mostrarErrorCampo('form-subtitulo', 'err-subtitulo', 'El subtítulo es obligatorio.'); valido = false; }
        if (!queEs) { mostrarErrorCampo('form-que-es', 'err-que-es', 'La definición es obligatoria.'); valido = false; }
        if (!queHaceOEstudia) { mostrarErrorCampo('form-que-hace', 'err-que-hace', 'El mecanismo o estudio es obligatorio.'); valido = false; }
        if (!clave) { mostrarErrorCampo('form-clave', 'err-clave', 'La advertencia/mensaje clave es obligatoria.'); valido = false; }

        if (!valido) return;

        setLoadingGuardar(true);

        const payload = {
            nombre,
            subtitulo,
            categoria,
            queEs,
            queHaceOEstudia,
            usoMedico: usoMedico || null,
            clave,
            fuente: fuente || null,
            imagenUrl: imagenUrl || null
        };

        const esEdicion = !!id;
        const url = esEdicion ? `/api/admin/peptidos/${id}` : '/api/admin/peptidos';
        const method = esEdicion ? 'PUT' : 'POST';

        try {
            const res = await authFetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                cerrarModalFormulario();
                mostrarToast(esEdicion ? 'Compuesto actualizado correctamente.' : 'Compuesto registrado exitosamente.', 'success');
                
                // INSERCIÓN INMEDIATA EN MEMORIA Y RENDERIZADO AL INSTANTE
                if (esEdicion) {
                    const idx = todosLosPeptidos.findIndex(p => p.id === data.id);
                    if (idx !== -1) {
                        todosLosPeptidos[idx] = data;
                    }
                } else {
                    todosLosPeptidos.unshift(data);
                }

                if (searchInput) searchInput.value = '';
                if (categoryFilter) categoryFilter.value = '';
                actualizarOpcionesCategorias();
                aplicarFiltros();

                resaltarFila(data.id || id);

                cargarEstadisticas();
                notificarSincronizacion(esEdicion ? 'UPDATE' : 'CREATE', data.id || id);
            } else {
                mostrarToast(data.mensaje || 'Error al guardar los datos.', 'danger');
            }
        } catch (error) {
            if (error.message !== 'Sesión no autorizada o expirada') {
                mostrarToast('Error de conexión con el servidor al guardar.', 'danger');
            }
        } finally {
            setLoadingGuardar(false);
        }
    }

    function resaltarFila(id) {
        setTimeout(() => {
            const tr = document.querySelector(`tr[data-id="${id}"]`);
            if (tr) {
                tr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                tr.style.transition = 'background-color 0.4s ease';
                tr.style.backgroundColor = 'rgba(197, 160, 89, 0.35)';
                setTimeout(() => {
                    tr.style.backgroundColor = '';
                }, 2500);
            }
        }, 80);
    }

    function mostrarErrorCampo(inputId, errorId, mensaje) {
        const input = document.getElementById(inputId);
        const err = document.getElementById(errorId);
        if (input) input.classList.add('is-invalid');
        if (err) {
            err.textContent = mensaje;
            err.style.display = 'block';
        }
    }

    function limpiarErroresFormulario() {
        const inputs = peptidoForm.querySelectorAll('.form-input, .form-textarea');
        inputs.forEach(i => i.classList.remove('is-invalid'));
        const errors = peptidoForm.querySelectorAll('.field-error');
        errors.forEach(e => { e.style.display = 'none'; e.textContent = ''; });
    }

    function limpiarFormulario() {
        peptidoForm.reset();
        formPeptidoId.value = '';
        ocultarPreviewImagen();
        limpiarErroresFormulario();
    }

    function cerrarModalFormulario() {
        modalFormOverlay.classList.remove('active');
        limpiarFormulario();
    }

    function setLoadingGuardar(cargando) {
        btnSavePeptido.disabled = cargando;
        saveBtnSpinner.style.display = cargando ? 'inline-block' : 'none';
        if (cargando) {
            saveBtnText.textContent = 'Guardando en MySQL...';
        } else {
            saveBtnText.textContent = formPeptidoId.value ? 'Actualizar compuesto' : 'Guardar compuesto';
        }
    }

    // 7. Ver Detalle
    window.verDetallePeptido = function(id) {
        const p = todosLosPeptidos.find(item => item.id === id);
        if (!p) return;

        viewModalBody.innerHTML = `
            <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                ${p.imagenUrl ? `<img src="${p.imagenUrl}" alt="${escapeHtml(p.nombre)}" style="width: 70px; height: 70px; object-fit: cover; border-radius: var(--radius-sm);" onerror="this.style.display='none'">` : ''}
                <div>
                    <h2 style="color: var(--primary); font-size: 1.4rem;">${escapeHtml(p.nombre)}</h2>
                    <span class="badge-cat" style="margin-top: 0.25rem;">${escapeHtml(p.categoria)}</span>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.25rem;">${escapeHtml(p.subtitulo)}</p>
                </div>
            </div>

            <div class="detail-item">
                <div class="detail-label">¿Qué es?</div>
                <div class="detail-value">${escapeHtml(p.queEs)}</div>
            </div>

            <div class="detail-item">
                <div class="detail-label">¿Qué hace o qué se estudia?</div>
                <div class="detail-value">${escapeHtml(p.queHaceOEstudia)}</div>
            </div>

            <div class="detail-item">
                <div class="detail-label">Uso médico o contexto de investigación</div>
                <div class="detail-value">${p.usoMedico ? escapeHtml(p.usoMedico) : '<em style="color: var(--text-muted);">Sin indicación registrada</em>'}</div>
            </div>

            <div class="detail-item">
                <div class="detail-label">Advertencia o mensaje clave</div>
                <div class="detail-value detail-box-warning">⚠️ ${escapeHtml(p.clave)}</div>
            </div>

            <div class="detail-item">
                <div class="detail-label">Fuentes científicas y regulatorias</div>
                <div class="detail-value" style="font-size: 0.85rem; color: var(--text-muted);">${p.fuente ? escapeHtml(p.fuente) : 'No especificadas'}</div>
            </div>

            <div style="margin-top: 1rem; font-size: 0.8rem; color: var(--text-muted); border-top: 1px solid var(--border-color); padding-top: 0.75rem;">
                Registro creado: ${p.fechaCreacion ? new Date(p.fechaCreacion).toLocaleString('es-MX') : '—'} · Última actualización: ${p.fechaActualizacion ? new Date(p.fechaActualizacion).toLocaleString('es-MX') : '—'}
            </div>
        `;

        modalViewOverlay.classList.add('active');
    };

    function cerrarModalView() {
        modalViewOverlay.classList.remove('active');
    }

    // 8. Eliminar Compuesto
    window.abrirEliminarPeptido = function(id, nombre) {
        peptidoSeleccionadoParaEliminar = id;
        deleteCompoundId.textContent = id;
        deleteCompoundName.textContent = nombre;
        modalDeleteOverlay.classList.add('active');
    };

    function cerrarModalDelete() {
        modalDeleteOverlay.classList.remove('active');
        peptidoSeleccionadoParaEliminar = null;
    }

    async function confirmarEliminar() {
        if (!peptidoSeleccionadoParaEliminar) return;

        setLoadingEliminar(true);

        try {
            const idAEliminar = peptidoSeleccionadoParaEliminar;
            const res = await authFetch(`/api/admin/peptidos/${idAEliminar}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                cerrarModalDelete();
                mostrarToast('Compuesto eliminado correctamente de la base de datos.', 'success');
                
                // Actualización inmediata sin recargar la página
                todosLosPeptidos = todosLosPeptidos.filter(p => p.id !== idAEliminar);
                actualizarOpcionesCategorias();
                aplicarFiltros();

                cargarEstadisticas();
                notificarSincronizacion('DELETE', idAEliminar);
            } else {
                const data = await res.json();
                mostrarToast(data.mensaje || 'Error al eliminar el registro.', 'danger');
            }
        } catch (error) {
            if (error.message !== 'Sesión no autorizada o expirada') {
                mostrarToast('Error de conexión con el servidor al eliminar.', 'danger');
            }
        } finally {
            setLoadingEliminar(false);
        }
    }

    function setLoadingEliminar(cargando) {
        btnConfirmDelete.disabled = cargando;
        delBtnSpinner.style.display = cargando ? 'inline-block' : 'none';
        delBtnText.textContent = cargando ? 'Eliminando...' : 'Eliminar definitivamente';
    }

    // 9. Toast Notificaciones
    function mostrarToast(mensaje, tipo = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        toast.innerHTML = `
            <span style="font-size: 1.25rem;">${tipo === 'success' ? '✅' : '❌'}</span>
            <span style="font-size: 0.9rem; font-weight: 500;">${escapeHtml(mensaje)}</span>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // 10. Listeners y Eventos con protección de existencia de elementos (Defensive DOM)
    function inicializarEventos() {
        if (btnLogout) btnLogout.addEventListener('click', cerrarSesion);

        if (searchInput) searchInput.addEventListener('input', aplicarFiltros);
        if (categoryFilter) categoryFilter.addEventListener('change', aplicarFiltros);

        if (btnOpenCreateModal) btnOpenCreateModal.addEventListener('click', abrirModalCrear);
        if (btnCloseFormModal) btnCloseFormModal.addEventListener('click', cerrarModalFormulario);
        if (btnCancelForm) btnCancelForm.addEventListener('click', cerrarModalFormulario);
        if (btnSavePeptido) btnSavePeptido.addEventListener('click', guardarPeptido);

        // Control interactivo de subida de imagen desde el dispositivo
        if (dropzoneArea && formImagenFile) {
            dropzoneArea.addEventListener('click', (e) => {
                if (!e.target.closest('#btn-remove-preview') && !e.target.closest('#btn-change-image')) {
                    formImagenFile.click();
                }
            });

            // Soporte Drag & Drop
            dropzoneArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropzoneArea.style.borderColor = 'var(--primary)';
                dropzoneArea.style.backgroundColor = '#F5EFEB';
            });
            dropzoneArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                dropzoneArea.style.borderColor = '#C5A059';
                dropzoneArea.style.backgroundColor = '#FAF8F5';
            });
            dropzoneArea.addEventListener('drop', (e) => {
                e.preventDefault();
                dropzoneArea.style.borderColor = '#C5A059';
                dropzoneArea.style.backgroundColor = '#FAF8F5';
                if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    formImagenFile.files = e.dataTransfer.files;
                    subirImagenDesdeDispositivo({ target: formImagenFile });
                }
            });
        }

        if (btnChangeImage && formImagenFile) {
            btnChangeImage.addEventListener('click', (e) => {
                e.stopPropagation();
                formImagenFile.click();
            });
        }

        if (formImagenFile) {
            formImagenFile.addEventListener('change', subirImagenDesdeDispositivo);
        }

        if (btnRemovePreview) {
            btnRemovePreview.addEventListener('click', (e) => {
                e.stopPropagation();
                ocultarPreviewImagen();
            });
        }

        if (btnCloseViewModal) btnCloseViewModal.addEventListener('click', cerrarModalView);
        if (btnCloseView) btnCloseView.addEventListener('click', cerrarModalView);

        if (btnCloseDeleteModal) btnCloseDeleteModal.addEventListener('click', cerrarModalDelete);
        if (btnCancelDelete) btnCancelDelete.addEventListener('click', cerrarModalDelete);
        if (btnConfirmDelete) btnConfirmDelete.addEventListener('click', confirmarEliminar);

        // ====================================================================
        // Eventos del Módulo de Cursos y Formación Académica
        // ====================================================================
        const tabNavPeptidos = document.getElementById('tab-nav-peptidos');
        const tabNavCursos = document.getElementById('tab-nav-cursos');
        const panelPeptidos = document.getElementById('panel-peptidos');
        const panelCursos = document.getElementById('panel-cursos');

        if (tabNavPeptidos && tabNavCursos) {
            tabNavPeptidos.addEventListener('click', () => {
                tabNavPeptidos.classList.add('active');
                tabNavPeptidos.setAttribute('aria-selected', 'true');
                tabNavCursos.classList.remove('active');
                tabNavCursos.setAttribute('aria-selected', 'false');

                if (panelPeptidos) panelPeptidos.style.display = 'block';
                if (panelCursos) panelCursos.style.display = 'none';
            });

            tabNavCursos.addEventListener('click', () => {
                tabNavCursos.classList.add('active');
                tabNavCursos.setAttribute('aria-selected', 'true');
                tabNavPeptidos.classList.remove('active');
                tabNavPeptidos.setAttribute('aria-selected', 'false');

                if (panelCursos) panelCursos.style.display = 'block';
                if (panelPeptidos) panelPeptidos.style.display = 'none';
                cargarCursos();
            });
        }

        const cursosSearchInput = document.getElementById('admin-cursos-search-input');
        const cursosTypeFilter = document.getElementById('admin-cursos-type-filter');
        if (cursosSearchInput) cursosSearchInput.addEventListener('input', aplicarFiltrosCursos);
        if (cursosTypeFilter) cursosTypeFilter.addEventListener('change', aplicarFiltrosCursos);

        const btnOpenCreateCursoModal = document.getElementById('btn-open-create-curso-modal');
        const btnCloseCursoFormModal = document.getElementById('btn-close-curso-form-modal');
        const btnCancelCursoForm = document.getElementById('btn-cancel-curso-form');
        const btnSaveCurso = document.getElementById('btn-save-curso');

        if (btnOpenCreateCursoModal) btnOpenCreateCursoModal.addEventListener('click', () => abrirModalCursoForm(null));
        if (btnCloseCursoFormModal) btnCloseCursoFormModal.addEventListener('click', cerrarModalCursoForm);
        if (btnCancelCursoForm) btnCancelCursoForm.addEventListener('click', cerrarModalCursoForm);
        if (btnSaveCurso) btnSaveCurso.addEventListener('click', guardarCurso);

        // Dropzone de Imagen de Cursos
        const dropzoneCursoArea = document.getElementById('dropzone-curso-area');
        const formCursoImagenFile = document.getElementById('form-curso-imagen-file');
        const btnRemoveCursoPreview = document.getElementById('btn-remove-curso-preview');
        const btnChangeCursoImage = document.getElementById('btn-change-curso-image');

        if (dropzoneCursoArea && formCursoImagenFile) {
            dropzoneCursoArea.addEventListener('click', (e) => {
                if (!e.target.closest('#btn-remove-curso-preview') && !e.target.closest('#btn-change-curso-image')) {
                    formCursoImagenFile.click();
                }
            });

            ['dragenter', 'dragover'].forEach(eventName => {
                dropzoneCursoArea.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropzoneCursoArea.style.borderColor = 'var(--secondary)';
                    dropzoneCursoArea.style.backgroundColor = '#EBF5F0';
                }, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropzoneCursoArea.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropzoneCursoArea.style.borderColor = '#006847';
                    dropzoneCursoArea.style.backgroundColor = '#F4F9F6';
                }, false);
            });

            dropzoneCursoArea.addEventListener('drop', (e) => {
                const dt = e.dataTransfer;
                if (dt.files && dt.files.length > 0) {
                    subirImagenCursoDesdeDispositivo({ target: { files: dt.files } });
                }
            });
        }

        if (formCursoImagenFile) {
            formCursoImagenFile.addEventListener('change', subirImagenCursoDesdeDispositivo);
        }

        if (btnChangeCursoImage && formCursoImagenFile) {
            btnChangeCursoImage.addEventListener('click', (e) => {
                e.stopPropagation();
                formCursoImagenFile.click();
            });
        }

        if (btnRemoveCursoPreview) {
            btnRemoveCursoPreview.addEventListener('click', (e) => {
                e.stopPropagation();
                ocultarPreviewImagenCurso();
            });
        }

        const btnCloseCursoViewModal = document.getElementById('btn-close-curso-view-modal');
        const btnCloseCursoView = document.getElementById('btn-close-curso-view');
        if (btnCloseCursoViewModal) btnCloseCursoViewModal.addEventListener('click', cerrarModalCursoView);
        if (btnCloseCursoView) btnCloseCursoView.addEventListener('click', cerrarModalCursoView);

        const btnCloseCursoDeleteModal = document.getElementById('btn-close-curso-delete-modal');
        const btnCancelCursoDelete = document.getElementById('btn-cancel-curso-delete');
        const btnConfirmCursoDelete = document.getElementById('btn-confirm-curso-delete');

        if (btnCloseCursoDeleteModal) btnCloseCursoDeleteModal.addEventListener('click', cerrarModalCursoDelete);
        if (btnCancelCursoDelete) btnCancelCursoDelete.addEventListener('click', cerrarModalCursoDelete);
        if (btnConfirmCursoDelete) btnConfirmCursoDelete.addEventListener('click', confirmarEliminarCurso);

        // Cerrar modales al hacer clic en el fondo oscuro exterior
        [
            modalFormOverlay, 
            modalViewOverlay, 
            modalDeleteOverlay,
            document.getElementById('modal-curso-form-overlay'),
            document.getElementById('modal-curso-view-overlay'),
            document.getElementById('modal-curso-delete-overlay')
        ].forEach(overlay => {
            if (overlay) {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        cerrarModalFormulario();
                        cerrarModalView();
                        cerrarModalDelete();
                        cerrarModalCursoForm();
                        cerrarModalCursoView();
                        cerrarModalCursoDelete();
                    }
                });
            }
        });

        // Cerrar modales con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                cerrarModalFormulario();
                cerrarModalView();
                cerrarModalDelete();
                cerrarModalCursoForm();
                cerrarModalCursoView();
                cerrarModalCursoDelete();
            }
        });
    }

    // ====================================================================
    // 11. Módulo CRUD de Cursos, Diplomados, Seminarios y Conferencias
    // ====================================================================
    let todosLosCursos = [];
    let cursoSeleccionadoParaEliminar = null;

    async function cargarCursos(silent = false) {
        const cursosTableBody = document.getElementById('cursos-table-body');
        if (!silent && cursosTableBody) {
            cursosTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <div class="spinner" style="border-top-color: var(--secondary); width: 2rem; height: 2rem;"></div>
                        <p style="margin-top: 1rem;">Actualizando programas académicos...</p>
                    </td>
                </tr>
            `;
        }

        try {
            const res = await authFetch('/api/admin/cursos');
            if (res.ok) {
                todosLosCursos = await res.json();
                renderizarTablaCursos(todosLosCursos);
            } else {
                if (cursosTableBody) {
                    cursosTableBody.innerHTML = `
                        <tr>
                            <td colspan="7" class="empty-state">
                                <p style="color: var(--danger);">No fue posible cargar los cursos.</p>
                            </td>
                        </tr>
                    `;
                }
            }
        } catch (error) {
            if (error.message !== 'Sesión no autorizada o expirada') {
                mostrarToast('Error al conectar con el servidor para obtener los cursos.', 'danger');
            }
        }
    }

    function renderizarTablaCursos(cursos) {
        const cursosTableBody = document.getElementById('cursos-table-body');
        if (!cursosTableBody) return;

        if (!cursos || cursos.length === 0) {
            cursosTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <p>No se encontraron programas académicos registrados.</p>
                        <button type="button" class="btn btn-secondary" style="margin-top: 0.75rem;" onclick="document.getElementById('btn-open-create-curso-modal').click()">
                            + Registrar el primer programa
                        </button>
                    </td>
                </tr>
            `;
            return;
        }

        cursosTableBody.innerHTML = '';
        cursos.forEach(curso => {
            const tr = document.createElement('tr');
            tr.id = `curso-row-${curso.id}`;
            tr.setAttribute('data-id', curso.id);
            tr.setAttribute('data-curso-id', curso.id);

            let badgeTipoClass = 'badge-tipo-curso';
            const t = (curso.tipo || '').toLowerCase();
            if (t === 'seminario') badgeTipoClass = 'badge-tipo-seminario';
            else if (t === 'conferencia' || t === 'simposio') badgeTipoClass = 'badge-tipo-conferencia';

            tr.innerHTML = `
                <td style="font-weight: 700; color: var(--text-muted); font-size: 0.82rem;">#${curso.id}</td>
                <td>
                    <img src="${escapeHtml(curso.imagenUrl || '/assets/images/curso-peptidos.jpg')}" 
                         alt="${escapeHtml(curso.titulo)}" 
                         style="width: 50px; height: 50px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-color);" 
                         onerror="this.src='/assets/images/curso-peptidos.jpg'">
                </td>
                <td>
                    <div style="font-weight: 700; color: var(--primary); font-size: 0.95rem; line-height: 1.3; margin-bottom: 0.2rem;">
                        ${escapeHtml(curso.titulo)}
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-muted); max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${escapeHtml(curso.descripcion)}
                    </div>
                </td>
                <td>
                    <span class="badge-cat ${badgeTipoClass}">
                        ${escapeHtml(curso.badgeTipo || curso.tipo)}
                    </span>
                </td>
                <td>
                    <span class="badge-estado">
                        ${escapeHtml(curso.estado || 'Activo')}
                    </span>
                </td>
                <td style="font-size: 0.82rem; color: var(--text-muted);">
                    <div><strong>${escapeHtml(curso.meta1 || '—')}</strong></div>
                    <div style="font-size: 0.76rem;">${escapeHtml(curso.meta2 || '')}</div>
                </td>
                <td style="text-align: right;">
                    <div class="action-buttons" style="justify-content: flex-end;">
                        <button class="btn-action btn-view" data-curso-id="${curso.id}" title="Ver ficha">
                            👁️ Ver
                        </button>
                        <button class="btn-action btn-edit" data-curso-id="${curso.id}" title="Editar">
                            ✏️ Editar
                        </button>
                        <button class="btn-action btn-delete" data-curso-id="${curso.id}" title="Eliminar">
                            🗑️
                        </button>
                    </div>
                </td>
            `;

            tr.querySelector('.btn-view').addEventListener('click', () => abrirModalVerCurso(curso.id));
            tr.querySelector('.btn-edit').addEventListener('click', () => abrirModalCursoForm(curso));
            tr.querySelector('.btn-delete').addEventListener('click', () => abrirModalEliminarCurso(curso));

            cursosTableBody.appendChild(tr);
        });
    }

    function resaltarFilaCurso(id) {
        setTimeout(() => {
            const tr = document.getElementById(`curso-row-${id}`) || document.querySelector(`tr[data-curso-id="${id}"]`);
            if (tr) {
                tr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                tr.style.transition = 'background-color 0.4s ease';
                tr.style.backgroundColor = 'rgba(0, 104, 71, 0.22)';
                setTimeout(() => {
                    tr.style.backgroundColor = '';
                }, 2500);
            }
        }, 80);
    }

    function aplicarFiltrosCursos() {
        const cursosSearchInput = document.getElementById('admin-cursos-search-input');
        const cursosTypeFilter = document.getElementById('admin-cursos-type-filter');

        const busqueda = (cursosSearchInput ? cursosSearchInput.value : '').toLowerCase().trim();
        const tipoFiltro = (cursosTypeFilter ? cursosTypeFilter.value : '').toLowerCase().trim();

        const filtrados = todosLosCursos.filter(c => {
            const coincideTipo = !tipoFiltro || 
                                 (c.tipo && (c.tipo.toLowerCase() === tipoFiltro || (tipoFiltro === 'curso' && c.tipo.toLowerCase() === 'diplomado')));
            const coincideBusqueda = !busqueda || 
                                     (c.titulo && c.titulo.toLowerCase().includes(busqueda)) ||
                                     (c.descripcion && c.descripcion.toLowerCase().includes(busqueda)) ||
                                     (c.meta1 && c.meta1.toLowerCase().includes(busqueda)) ||
                                     (c.badgeTipo && c.badgeTipo.toLowerCase().includes(busqueda));

            return coincideTipo && coincideBusqueda;
        });

        renderizarTablaCursos(filtrados);
    }

    function abrirModalCursoForm(curso = null) {
        const modal = document.getElementById('modal-curso-form-overlay');
        const modalTitle = document.getElementById('curso-form-modal-title');
        const form = document.getElementById('curso-form');
        if (!modal || !form) return;

        form.reset();
        document.querySelectorAll('.field-error').forEach(e => e.style.display = 'none');

        const formId = document.getElementById('form-curso-id');
        const formTitulo = document.getElementById('form-curso-titulo');
        const formTipo = document.getElementById('form-curso-tipo');
        const formBadge = document.getElementById('form-curso-badge');
        const formEstado = document.getElementById('form-curso-estado');
        const formMeta1 = document.getElementById('form-curso-meta1');
        const formMeta2 = document.getElementById('form-curso-meta2');
        const formDescripcion = document.getElementById('form-curso-descripcion');
        const formAcreditacion = document.getElementById('form-curso-acreditacion');
        const formWhatsapp = document.getElementById('form-curso-whatsapp');
        const formBtnText = document.getElementById('form-curso-btn-text');
        const formImagen = document.getElementById('form-curso-imagen');

        if (curso) {
            modalTitle.textContent = `Editar programa: ${curso.titulo}`;
            formId.value = curso.id;
            formTitulo.value = curso.titulo || '';
            formTipo.value = (curso.tipo || 'curso').toLowerCase();
            formBadge.value = curso.badgeTipo || '';
            formEstado.value = curso.estado || '';
            formMeta1.value = curso.meta1 || '';
            formMeta2.value = curso.meta2 || '';
            formDescripcion.value = curso.descripcion || '';
            formAcreditacion.value = curso.acreditacion || '';
            formWhatsapp.value = curso.enlaceWhatsapp || '';
            formBtnText.value = curso.textoBoton || 'Solicitar Programa e Inscripción';
            formImagen.value = curso.imagenUrl || '';

            if (curso.imagenUrl) {
                mostrarPreviewImagenCurso(curso.imagenUrl, 'Imagen vinculada');
            } else {
                ocultarPreviewImagenCurso();
            }
        } else {
            modalTitle.textContent = 'Agregar nuevo programa académico';
            formId.value = '';
            formTipo.value = 'curso';
            formBadge.value = 'Curso con Constancia';
            formEstado.value = 'Inscripciones Abiertas';
            formBtnText.value = 'Solicitar Programa e Inscripción';
            formWhatsapp.value = 'https://wa.me/525579247494';
            formImagen.value = '/assets/images/curso-peptidos.jpg';
            ocultarPreviewImagenCurso();
        }

        modal.classList.add('active');
        if (formTitulo) formTitulo.focus();
    }

    function cerrarModalCursoForm() {
        const modal = document.getElementById('modal-curso-form-overlay');
        if (modal) modal.classList.remove('active');
        ocultarPreviewImagenCurso();
    }

    async function guardarCurso() {
        const formId = document.getElementById('form-curso-id');
        const formTitulo = document.getElementById('form-curso-titulo');
        const formTipo = document.getElementById('form-curso-tipo');
        const formBadge = document.getElementById('form-curso-badge');
        const formEstado = document.getElementById('form-curso-estado');
        const formMeta1 = document.getElementById('form-curso-meta1');
        const formMeta2 = document.getElementById('form-curso-meta2');
        const formDescripcion = document.getElementById('form-curso-descripcion');
        const formAcreditacion = document.getElementById('form-curso-acreditacion');
        const formWhatsapp = document.getElementById('form-curso-whatsapp');
        const formBtnText = document.getElementById('form-curso-btn-text');
        const formImagen = document.getElementById('form-curso-imagen');

        let valido = true;

        if (!formTitulo.value.trim()) {
            document.getElementById('err-curso-titulo').style.display = 'block';
            valido = false;
        } else {
            document.getElementById('err-curso-titulo').style.display = 'none';
        }

        if (!formBadge.value.trim()) {
            document.getElementById('err-curso-badge').style.display = 'block';
            valido = false;
        } else {
            document.getElementById('err-curso-badge').style.display = 'none';
        }

        if (!formEstado.value.trim()) {
            document.getElementById('err-curso-estado').style.display = 'block';
            valido = false;
        } else {
            document.getElementById('err-curso-estado').style.display = 'none';
        }

        if (!formDescripcion.value.trim()) {
            document.getElementById('err-curso-descripcion').style.display = 'block';
            valido = false;
        } else {
            document.getElementById('err-curso-descripcion').style.display = 'none';
        }

        if (!valido) {
            mostrarToast('Por favor completa todos los campos obligatorios del programa.', 'danger');
            return;
        }

        const payload = {
            titulo: formTitulo.value.trim(),
            tipo: formTipo.value.trim(),
            badgeTipo: formBadge.value.trim(),
            estado: formEstado.value.trim(),
            meta1: formMeta1.value.trim(),
            meta2: formMeta2.value.trim(),
            descripcion: formDescripcion.value.trim(),
            acreditacion: formAcreditacion.value.trim(),
            enlaceWhatsapp: formWhatsapp.value.trim() || 'https://wa.me/525579247494',
            textoBoton: formBtnText.value.trim() || 'Solicitar Programa e Inscripción',
            imagenUrl: formImagen.value.trim() || '/assets/images/curso-peptidos.jpg',
            orden: 1,
            activo: true
        };

        const id = formId.value;
        const esEdicion = !!id;
        const url = esEdicion ? `/api/admin/cursos/${id}` : '/api/admin/cursos';
        const method = esEdicion ? 'PUT' : 'POST';

        const saveBtnText = document.getElementById('save-curso-btn-text');
        const saveBtnSpinner = document.getElementById('save-curso-btn-spinner');
        const btnSaveCurso = document.getElementById('btn-save-curso');

        if (saveBtnText) saveBtnText.textContent = esEdicion ? 'Actualizando...' : 'Guardando...';
        if (saveBtnSpinner) saveBtnSpinner.style.display = 'inline-block';
        if (btnSaveCurso) btnSaveCurso.disabled = true;

        try {
            const res = await authFetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                cerrarModalCursoForm();
                mostrarToast(esEdicion ? 'Programa actualizado exitosamente.' : 'Programa registrado exitosamente.', 'success');

                // INSERCIÓN / ACTUALIZACIÓN INMEDIATA EN MEMORIA Y RENDERIZADO AL INSTANTE
                if (esEdicion) {
                    const idx = todosLosCursos.findIndex(c => c.id == data.id);
                    if (idx !== -1) {
                        todosLosCursos[idx] = data;
                    }
                } else {
                    todosLosCursos.unshift(data);
                }

                // Limpiar filtros activos para mostrar el nuevo curso inmediatamente
                const cursosSearchInput = document.getElementById('admin-cursos-search-input');
                const cursosTypeFilter = document.getElementById('admin-cursos-type-filter');
                if (cursosSearchInput) cursosSearchInput.value = '';
                if (cursosTypeFilter) cursosTypeFilter.value = '';

                renderizarTablaCursos(todosLosCursos);
                resaltarFilaCurso(data.id || id);

                // Cargar estadísticas actualizadas
                cargarEstadisticas();

                // Notificar en tiempo real al portal público y otras pestañas
                notificarSincronizacionCursos(esEdicion ? 'UPDATE' : 'CREATE', data.id || id);

                // Sincronizar silenciosamente con el servidor
                cargarCursos(true);
            } else {
                const errorMsg = data.mensaje || data.message || data.error || 'Error al guardar el programa.';
                mostrarToast(errorMsg, 'danger');
            }
        } catch (error) {
            if (error.message !== 'Sesión no autorizada o expirada') {
                mostrarToast('Error de conexión con el servidor al guardar el programa: ' + (error.message || ''), 'danger');
            }
        } finally {
            if (saveBtnText) saveBtnText.textContent = 'Guardar programa';
            if (saveBtnSpinner) saveBtnSpinner.style.display = 'none';
            if (btnSaveCurso) btnSaveCurso.disabled = false;
        }
    }

    function abrirModalVerCurso(id) {
        const curso = todosLosCursos.find(c => c.id == id);
        if (!curso) return;

        const modal = document.getElementById('modal-curso-view-overlay');
        const body = document.getElementById('curso-view-modal-body');
        if (!modal || !body) return;

        body.innerHTML = `
            <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
                <img src="${escapeHtml(curso.imagenUrl || '/assets/images/curso-peptidos.jpg')}" 
                     alt="${escapeHtml(curso.titulo)}" 
                     style="width: 160px; height: 160px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--border-color);"
                     onerror="this.src='/assets/images/curso-peptidos.jpg'">
                <div style="flex: 1; min-width: 250px;">
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;">
                        <span class="badge-cat badge-tipo-${(curso.tipo || 'curso').toLowerCase()}">${escapeHtml(curso.badgeTipo || curso.tipo)}</span>
                        <span class="badge-estado">${escapeHtml(curso.estado)}</span>
                    </div>
                    <h2 style="font-size: 1.35rem; color: var(--primary); margin-bottom: 0.5rem; line-height: 1.3;">${escapeHtml(curso.titulo)}</h2>
                    <p style="font-size: 0.88rem; color: var(--secondary); font-weight: 600;">
                        ⏱️ ${escapeHtml(curso.meta1 || '')} &nbsp;|&nbsp; 💻 ${escapeHtml(curso.meta2 || '')}
                    </p>
                </div>
            </div>

            <div style="margin-bottom: 1.25rem;">
                <h4 style="font-size: 0.95rem; color: var(--primary); margin-bottom: 0.35rem;">Descripción Científica</h4>
                <p style="font-size: 0.92rem; line-height: 1.6; color: var(--text-dark);">${escapeHtml(curso.descripcion)}</p>
            </div>

            ${curso.acreditacion ? `
                <div style="background-color: #FAF5E8; border: 1px solid #DFC89A; border-radius: var(--radius-sm); padding: 1rem; margin-bottom: 1.25rem;">
                    <h4 style="font-size: 0.9rem; color: #7A5711; margin-bottom: 0.25rem;">✓ Acreditación Oficial SOMEP</h4>
                    <p style="font-size: 0.88rem; color: #4A3B18; line-height: 1.5;">${escapeHtml(curso.acreditacion)}</p>
                </div>
            ` : ''}

            <div style="background-color: #F8FAFC; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.85rem 1rem;">
                <p style="font-size: 0.84rem; color: var(--text-muted); margin-bottom: 0.25rem;">
                    <strong>Enlace a WhatsApp configurado:</strong>
                </p>
                <a href="${escapeHtml(curso.enlaceWhatsapp || 'https://wa.me/525579247494')}" target="_blank" rel="noopener noreferrer" style="font-size: 0.84rem; color: var(--secondary); word-break: break-all;">
                    ${escapeHtml(curso.enlaceWhatsapp || 'https://wa.me/525579247494')}
                </a>
            </div>
        `;

        modal.classList.add('active');
    }

    function cerrarModalCursoView() {
        const modal = document.getElementById('modal-curso-view-overlay');
        if (modal) modal.classList.remove('active');
    }

    function abrirModalEliminarCurso(curso) {
        cursoSeleccionadoParaEliminar = curso;
        const modal = document.getElementById('modal-curso-delete-overlay');
        const nameEl = document.getElementById('delete-curso-name');
        const idEl = document.getElementById('delete-curso-id');
        if (!modal) return;

        if (nameEl) nameEl.textContent = curso.titulo;
        if (idEl) idEl.textContent = curso.id;

        modal.classList.add('active');
    }

    function cerrarModalCursoDelete() {
        const modal = document.getElementById('modal-curso-delete-overlay');
        if (modal) modal.classList.remove('active');
        cursoSeleccionadoParaEliminar = null;
    }

    async function confirmarEliminarCurso() {
        if (!cursoSeleccionadoParaEliminar) return;

        const idAEliminar = cursoSeleccionadoParaEliminar.id;
        const btnConfirm = document.getElementById('btn-confirm-curso-delete');
        const delBtnSpinner = document.getElementById('del-curso-btn-spinner');
        const delBtnText = document.getElementById('del-curso-btn-text');

        if (btnConfirm) btnConfirm.disabled = true;
        if (delBtnSpinner) delBtnSpinner.style.display = 'inline-block';
        if (delBtnText) delBtnText.textContent = 'Eliminando...';

        try {
            const res = await authFetch(`/api/admin/cursos/${idAEliminar}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json' }
            });

            if (res.ok) {
                cerrarModalCursoDelete();
                mostrarToast('Programa académico eliminado exitosamente.', 'success');

                // 1. Animación visual y eliminación inmediata de la fila en el DOM
                const fila = document.getElementById(`curso-row-${idAEliminar}`) || document.querySelector(`tr[data-curso-id="${idAEliminar}"]`);
                if (fila) {
                    fila.style.transition = 'all 0.35s ease';
                    fila.style.opacity = '0';
                    fila.style.transform = 'translateX(35px)';
                    setTimeout(() => {
                        if (fila.parentNode) fila.remove();
                        if (todosLosCursos.length === 0) {
                            renderizarTablaCursos([]);
                        }
                    }, 300);
                }

                // 2. Eliminación inmediata de la lista en memoria
                todosLosCursos = todosLosCursos.filter(c => c.id != idAEliminar);

                // 3. Re-aplicar filtros vigentes para sincronizar la vista al instante
                aplicarFiltrosCursos();

                // 4. Actualizar contadores del panel
                cargarEstadisticas();

                // 5. Notificar en tiempo real al portal público y otras pestañas
                notificarSincronizacionCursos('DELETE', idAEliminar);
            } else {
                const data = await res.json().catch(() => ({}));
                const errorMsg = data.mensaje || data.message || data.error || 'Error al eliminar el programa.';
                mostrarToast(errorMsg, 'danger');
            }
        } catch (error) {
            if (error.message !== 'Sesión no autorizada o expirada') {
                mostrarToast('Error de conexión con el servidor al eliminar.', 'danger');
            }
        } finally {
            if (btnConfirm) btnConfirm.disabled = false;
            if (delBtnSpinner) delBtnSpinner.style.display = 'none';
            if (delBtnText) delBtnText.textContent = 'Eliminar definitivamente';
        }
    }

    async function subirImagenCursoDesdeDispositivo(e) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        if (!file.type.startsWith('image/')) {
            mostrarToast('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).', 'danger');
            return;
        }

        const uploadStatus = document.getElementById('upload-curso-status');
        const emptyState = document.getElementById('dropzone-curso-empty-state');
        const previewContainer = document.getElementById('image-curso-preview-container');

        if (uploadStatus) uploadStatus.style.display = 'flex';
        if (emptyState) emptyState.style.display = 'none';
        if (previewContainer) previewContainer.style.display = 'none';

        const formData = new FormData();
        formData.append('file', file);

        try {
            await obtenerCsrfToken();
            const headers = { 'Accept': 'application/json' };
            if (csrfTokenCached) headers['X-XSRF-TOKEN'] = csrfTokenCached;

            const res = await fetch('/api/admin/peptidos/upload-imagen', {
                method: 'POST',
                credentials: 'same-origin',
                headers: headers,
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                document.getElementById('form-curso-imagen').value = data.url;
                mostrarPreviewImagenCurso(data.url, data.nombre || file.name);
                mostrarToast('Imagen del programa subida correctamente.');
            } else {
                const errorData = await res.json();
                mostrarToast(errorData.mensaje || 'Error al subir la imagen.', 'danger');
                ocultarPreviewImagenCurso();
            }
        } catch (err) {
            mostrarToast('Error de red al subir la imagen.', 'danger');
            ocultarPreviewImagenCurso();
        } finally {
            if (uploadStatus) uploadStatus.style.display = 'none';
        }
    }

    function mostrarPreviewImagenCurso(url, nombre = 'curso.jpg') {
        const emptyState = document.getElementById('dropzone-curso-empty-state');
        const previewContainer = document.getElementById('image-curso-preview-container');
        const previewImg = document.getElementById('image-curso-preview-img');
        const previewName = document.getElementById('image-curso-preview-name');

        if (emptyState) emptyState.style.display = 'none';
        if (previewContainer) previewContainer.style.display = 'flex';
        if (previewImg) previewImg.src = url;
        if (previewName) previewName.textContent = nombre;
    }

    function ocultarPreviewImagenCurso() {
        const emptyState = document.getElementById('dropzone-curso-empty-state');
        const previewContainer = document.getElementById('image-curso-preview-container');
        const formCursoImagen = document.getElementById('form-curso-imagen');
        const formCursoImagenFile = document.getElementById('form-curso-imagen-file');

        if (emptyState) emptyState.style.display = 'block';
        if (previewContainer) previewContainer.style.display = 'none';
        if (formCursoImagen) formCursoImagen.value = '';
        if (formCursoImagenFile) formCursoImagenFile.value = '';
    }

    function escapeHtml(text) {
        if (!text) return '';
        return text
            .toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});
