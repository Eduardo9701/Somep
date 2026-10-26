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

    // 1. Inicialización: Verificar sesión y cargar datos iniciales
    iniciarPanel();

    async function iniciarPanel() {
        const sesionValida = await verificarSesion();
        if (!sesionValida) return;

        await obtenerCsrfToken();
        await Promise.all([cargarEstadisticas(), cargarPeptidos(true)]);
        inicializarEventos();
    }

    // 2. Manejo de Seguridad y Sesión
    async function verificarSesion() {
        try {
            const res = await fetch('/api/auth/me');
            if (!res.ok) {
                window.location.replace('/admin/login.html');
                return false;
            }
            const data = await res.json();
            if (!data.autenticado) {
                window.location.replace('/admin/login.html');
                return false;
            }

            if (userDisplayName) userDisplayName.textContent = data.nombreCompleto || data.username;
            if (userDisplayRole) userDisplayRole.textContent = data.role === 'ROLE_ADMIN' ? 'Administrador General' : data.role;
            if (userAvatar) userAvatar.textContent = (data.nombreCompleto || data.username).charAt(0).toUpperCase();
            return true;
        } catch (error) {
            window.location.replace('/admin/login.html');
            return false;
        }
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

    async function obtenerCsrfToken() {
        const cookieToken = getCookie('XSRF-TOKEN');
        if (cookieToken) {
            csrfTokenCached = cookieToken;
            return cookieToken;
        }

        try {
            const res = await fetch('/api/auth/csrf');
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

    // 3. Cargar Estadísticas
    async function cargarEstadisticas() {
        try {
            const res = await fetch('/api/admin/peptidos/stats');
            if (res.ok) {
                const stats = await res.json();
                if (statTotalCompuestos) statTotalCompuestos.textContent = stats.totalCompuestos;
                if (statTotalCategorias) statTotalCategorias.textContent = stats.totalCategorias;
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

            const res = await fetch('/api/admin/peptidos');
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
            mostrarToast('Error al conectar con el servidor', 'danger');
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
            const token = await obtenerCsrfToken();
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/admin/peptidos/upload-imagen', {
                method: 'POST',
                headers: {
                    'X-XSRF-TOKEN': token || ''
                },
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
            mostrarToast('Error de red al intentar subir la imagen.', 'danger');
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
            const token = await obtenerCsrfToken();
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': token || ''
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
                    // Colocar el nuevo compuesto AL INICIO de la lista (arriba del todo)
                    todosLosPeptidos.unshift(data);
                }

                // Limpiar filtros para que el nuevo compuesto se muestre de inmediato en pantalla
                if (searchInput) searchInput.value = '';
                if (categoryFilter) categoryFilter.value = '';
                actualizarOpcionesCategorias();
                aplicarFiltros();

                // Resaltar la fila recién agregada o modificada
                resaltarFila(data.id || id);

                // Refrescar métricas y notificar a otras pestañas
                cargarEstadisticas();
                notificarSincronizacion(esEdicion ? 'UPDATE' : 'CREATE', data.id || id);
            } else {
                mostrarToast(data.mensaje || 'Error al guardar los datos.', 'danger');
            }
        } catch (error) {
            mostrarToast('Error de conexión con el servidor al guardar.', 'danger');
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
            const token = await obtenerCsrfToken();
            const idAEliminar = peptidoSeleccionadoParaEliminar;
            const res = await fetch(`/api/admin/peptidos/${idAEliminar}`, {
                method: 'DELETE',
                headers: {
                    'X-XSRF-TOKEN': token || ''
                }
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
            mostrarToast('Error de conexión con el servidor al eliminar.', 'danger');
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

        // Cerrar modales con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                cerrarModalFormulario();
                cerrarModalView();
                cerrarModalDelete();
            }
        });
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
