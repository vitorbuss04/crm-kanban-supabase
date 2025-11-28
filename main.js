import './style.css'
import { createClient } from '@supabase/supabase-js'

// Supabase Configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// State
let clients = []
let draggedClient = null
let user = null
let isSignUp = false

// DOM Elements
const authContainer = document.getElementById('auth-container')
const appContainer = document.getElementById('app-container')
const authForm = document.getElementById('auth-form')
const authEmailInput = document.getElementById('auth-email')
const authPasswordInput = document.getElementById('auth-password')
const authError = document.getElementById('auth-error')
const authToggleButton = document.getElementById('auth-toggle-link')
const authSubmitButton = authForm.querySelector('button')
const authToggleText = document.querySelector('.auth-toggle')
const btnLogout = document.getElementById('btn-logout')

const columns = {
    'Novo': document.getElementById('col-novo'),
    'Em Contato': document.getElementById('col-em-contato'),
    'Proposta': document.getElementById('col-proposta'),
    'Fechado': document.getElementById('col-fechado'),
    'Perdido': document.getElementById('col-perdido')
}

const btnNewClient = document.getElementById('btn-new-client')
const modalOverlay = document.getElementById('modal-overlay')
const btnCloseModal = document.getElementById('btn-close-modal')
const btnCancel = document.getElementById('btn-cancel')
const formNewClient = document.getElementById('form-new-client')
const alertModal = document.getElementById('alert-modal')
const alertTitle = document.getElementById('alert-title')
const alertMessage = document.getElementById('alert-message')
const btnAlertOk = document.getElementById('btn-alert-ok')
const btnAlertCancel = document.getElementById('btn-alert-cancel')
const searchInput = document.getElementById('search-input')

const STATUS_FLOW = ['Novo', 'Em Contato', 'Proposta', 'Fechado']

// --- AUTH FUNCTIONS ---

function toggleAuthMode() {
    isSignUp = !isSignUp
    authError.style.display = 'none'
    authForm.reset()
    if (isSignUp) {
        authSubmitButton.textContent = 'Cadastrar'
        authToggleText.innerHTML = 'Já tem uma conta? <a href="#" id="auth-toggle-link">Entre</a>'
    } else {
        authSubmitButton.textContent = 'Entrar'
        authToggleText.innerHTML = 'Não tem uma conta? <a href="#" id="auth-toggle-link">Cadastre-se</a>'
    }
    document.getElementById('auth-toggle-link').addEventListener('click', (e) => {
        e.preventDefault()
        toggleAuthMode()
    })
}

async function handleAuthSubmit(e) {
    e.preventDefault()
    const email = authEmailInput.value
    const password = authPasswordInput.value
    authError.style.display = 'none'

    try {
        let response
        if (isSignUp) {
            response = await supabase.auth.signUp({ email, password })
        } else {
            response = await supabase.auth.signInWithPassword({ email, password })
        }

        if (response.error) throw response.error

        if (isSignUp) {
            showAlert('Cadastro realizado! Verifique seu e-mail para confirmar a conta.', 'Sucesso')
            toggleAuthMode()
        }
    } catch (error) {
        console.error('Authentication error:', error.message)
        authError.textContent = error.message
        authError.style.display = 'block'
    }
}

async function handleLogout() {
    const { error } = await supabase.auth.signOut()
    if (error) {
        console.error('Error logging out:', error)
        showAlert('Erro ao sair.', 'Erro')
    }
}

// --- KANBAN/APP FUNCTIONS ---

function setupDragAndDrop() {
    const kanbanColumns = document.querySelectorAll('.kanban-column')
    kanbanColumns.forEach(column => {
        column.addEventListener('dragover', handleDragOver)
        column.addEventListener('drop', handleDrop)
        column.addEventListener('dragleave', (e) => {
            const column = e.target.closest('.kanban-column')
            if (column) {
                const dropZone = column.querySelector('.drop-zone')
                const indicator = column.querySelector('.target-indicator')
                if (dropZone) dropZone.classList.remove('active')
                if (indicator) indicator.classList.remove('active')
            }
        })
    })
}

function handleDragStart(e) {
    draggedClient = e.target
    e.target.classList.add('dragging')
    e.dataTransfer.effectAllowed = 'move'
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging')
    draggedClient = null
    document.querySelectorAll('.drop-zone').forEach(zone => zone.classList.remove('active'))
    document.querySelectorAll('.target-indicator').forEach(indicator => indicator.classList.remove('active'))
}

function handleDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const column = e.target.closest('.kanban-column')
    if (!column || !draggedClient) return
    document.querySelectorAll('.kanban-column').forEach(col => {
        if (col !== column) {
            col.querySelector('.drop-zone')?.classList.remove('active')
            col.querySelector('.target-indicator')?.classList.remove('active')
        }
    })
    const content = column.querySelector('.column-content')
    const dropZone = content.querySelector('.drop-zone')
    const indicator = content.querySelector('.target-indicator')
    if (!dropZone || !indicator) return
    dropZone.classList.add('active')
    const rect = content.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    dropZone.style.setProperty('--mouse-x', x + '%')
    dropZone.style.setProperty('--mouse-y', y + '%')
    const afterElement = getDragAfterElement(content, e.clientY)
    if (afterElement.element) {
        const elemRect = afterElement.element.getBoundingClientRect()
        indicator.style.top = (elemRect.top - rect.top - 2) + 'px'
    } else {
        const cards = content.querySelectorAll('.client-card:not(.dragging)')
        if (cards.length > 0) {
            const lastCard = cards[cards.length - 1]
            const lastRect = lastCard.getBoundingClientRect()
            indicator.style.top = (lastRect.bottom - rect.top + 8) + 'px'
        } else {
            indicator.style.top = '8px'
        }
    }
    indicator.classList.add('active')
}

function showAlert(message, title = 'Aviso') {
    return new Promise((resolve) => {
        alertTitle.textContent = title
        alertMessage.textContent = message
        btnAlertCancel.classList.add('hidden')
        alertModal.classList.add('is-visible')
        btnAlertOk.onclick = () => {
            alertModal.classList.remove('is-visible')
            resolve(true)
        }
    })
}

function showConfirm(message, title = 'Confirmação') {
    return new Promise((resolve) => {
        alertTitle.textContent = title
        alertMessage.textContent = message
        btnAlertCancel.classList.remove('hidden')
        alertModal.classList.add('is-visible')
        btnAlertOk.onclick = () => {
            alertModal.classList.remove('is-visible')
            resolve(true)
        }
        btnAlertCancel.onclick = () => {
            alertModal.classList.remove('is-visible')
            resolve(false)
        }
    })
}

async function loadClients() {
    try {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('position', { ascending: true })
            .order('created_at', { ascending: false })
        if (error) throw error
        clients = data
        renderClients(clients)
    } catch (error) {
        console.error('Error loading clients:', error)
        showAlert('Erro ao carregar clientes. Verifique o console.', 'Erro')
    }
}

function createClientCard(client) {
    const card = document.createElement('div');
    card.className = 'client-card';
    card.draggable = true;
    card.dataset.id = client.id;

    // Client Header
    const clientHeader = document.createElement('div');
    clientHeader.className = 'client-header';
    const clientName = document.createElement('div');
    clientName.className = 'client-name';
    clientName.textContent = client.name;
    clientHeader.appendChild(clientName);

    // Client Info (Phone)
    const clientInfo = document.createElement('div');
    clientInfo.className = 'client-info';
    clientInfo.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 16.92V19.92C22.0011 20.1986 21.9441 20.4742 21.8325 20.7294C21.7209 20.9846 21.5573 21.2137 21.3521 21.4019C21.1468 21.5901 20.9046 21.733 20.6411 21.8212C20.3776 21.9093 20.0987 21.9409 19.823 21.913C16.7667 21.5816 13.8291 20.5361 11.23 18.86C8.81665 17.3276 6.78643 15.3216 5.23 12.94C3.53501 10.3167 2.48391 7.35128 2.16 4.28C2.13222 4.0036 2.16434 3.72369 2.25424 3.45906C2.34413 3.19443 2.48974 2.95123 2.68134 2.74591C2.87293 2.54059 3.10609 2.37789 3.36531 2.26868C3.62453 2.15947 3.90387 2.10623 4.185 2.11H7.185C7.68334 2.10667 8.16462 2.28994 8.53677 2.62464C8.90892 2.95934 9.14856 3.42436 9.21 3.92C9.32356 4.83994 9.55169 5.74306 9.89 6.61C10.0381 6.98764 10.0703 7.40071 9.98256 7.79782C9.89481 8.19493 9.69106 8.55837 9.397 8.842L8.127 10.112C9.55166 12.6178 11.6292 14.6954 14.135 16.12L15.405 14.85C15.6886 14.5559 16.0521 14.3522 16.4492 14.2644C16.8463 14.1767 17.2594 14.2089 17.637 14.357C18.5039 14.6953 19.4071 14.9234 20.327 15.037C20.8266 15.0993 21.2942 15.3432 21.6296 15.7196C21.965 16.096 22.1462 16.5807 22.14 17.08V16.92Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    clientInfo.appendChild(document.createTextNode(client.phone || 'Sem telefone'));

    // Client Notes
    const clientNotes = document.createElement('div');
    clientNotes.className = 'client-notes';
    clientNotes.textContent = client.notes || '';

    // Card Actions
    const cardActions = document.createElement('div');
    cardActions.className = 'card-actions';

    const currentStatusIndex = STATUS_FLOW.indexOf(client.status || 'Novo');
    const nextStatus = currentStatusIndex !== -1 && currentStatusIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentStatusIndex + 1] : null;
    const prevStatus = currentStatusIndex > 0 ? STATUS_FLOW[currentStatusIndex - 1] : null;

    if (prevStatus) {
        const prevButton = document.createElement('button');
        prevButton.className = 'btn-action prev';
        prevButton.title = `Voltar para ${prevStatus}`;
        prevButton.dataset.action = 'prev';
        prevButton.dataset.id = client.id;
        prevButton.dataset.status = client.status || 'Novo';
        prevButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        cardActions.appendChild(prevButton);
    }

    if (nextStatus) {
        const nextButton = document.createElement('button');
        nextButton.className = 'btn-action next';
        nextButton.title = `Mover para ${nextStatus}`;
        nextButton.dataset.action = 'next';
        nextButton.dataset.id = client.id;
        nextButton.dataset.status = client.status || 'Novo';
        nextButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 5L19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        cardActions.appendChild(nextButton);
    }

    const editButton = document.createElement('button');
    editButton.className = 'btn-action edit';
    editButton.title = 'Editar';
    editButton.dataset.action = 'edit';
    editButton.dataset.id = client.id;
    editButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    cardActions.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn-action delete';
    deleteButton.title = 'Excluir';
    deleteButton.dataset.action = 'delete';
    deleteButton.dataset.id = client.id;
    deleteButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    cardActions.appendChild(deleteButton);

    // Append all parts to card
    card.appendChild(clientHeader);
    card.appendChild(clientInfo);
    card.appendChild(clientNotes);
    card.appendChild(cardActions);

    const actions = card.querySelectorAll('.btn-action');
    actions.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.dataset.action;
            const id = btn.dataset.id;
            if (action === 'edit') { window.editClient(id); }
            else if (action === 'delete') { window.deleteClient(id); }
            else if (action === 'next' || action === 'prev') {
                const status = btn.dataset.status;
                window.moveClientStatus(id, status, action);
            }
        });
    });
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    return card;
}

function renderClients(clientsToRender) {
    Object.values(columns).forEach(col => {
        const content = col.querySelector('.column-content') || col;
        content.innerHTML = '';
        if (!content.querySelector('.drop-zone')) {
            const dropZone = document.createElement('div');
            dropZone.className = 'drop-zone';
            content.appendChild(dropZone);
        }
        if (!content.querySelector('.target-indicator')) {
            const indicator = document.createElement('div');
            indicator.className = 'target-indicator';
            content.appendChild(indicator);
        }
    });
    clientsToRender.forEach(client => {
        const card = createClientCard(client)
        const status = client.status || 'Novo'
        if (columns[status]) {
            const content = columns[status].querySelector('.column-content') || columns[status];
            content.appendChild(card)
        }
    })
}

async function handleDrop(e) {
    e.preventDefault()
    const column = e.target.closest('.kanban-column')
    if (column && draggedClient) {
        const newStatus = column.dataset.status
        const clientId = draggedClient.dataset.id
        const content = column.querySelector('.column-content')
        const afterElementResult = getDragAfterElement(content, e.clientY)
        const afterElement = afterElementResult.element
        let newPosition
        if (afterElement) {
            const nextCardId = afterElement.dataset.id
            const nextClient = clients.find(c => c.id === nextCardId)
            const nextPos = nextClient?.position || 0
            const prevCard = afterElement.previousElementSibling
            let prevPos = 0
            if (prevCard && prevCard !== draggedClient) {
                const prevCardId = prevCard.dataset.id
                const prevClient = clients.find(c => c.id === prevCardId)
                prevPos = prevClient?.position || 0
            } else if (!prevCard) {
                prevPos = nextPos - 2000
            }
            newPosition = (prevPos + nextPos) / 2
            content.insertBefore(draggedClient, afterElement)
        } else {
            const cards = Array.from(content.querySelectorAll('.client-card:not(.dragging)'))
            if (cards.length > 0) {
                const lastCard = cards[cards.length - 1]
                const lastCardId = lastCard.dataset.id
                const lastClient = clients.find(c => c.id === lastCardId)
                newPosition = (lastClient?.position || 0) + 1000
            } else {
                newPosition = 1000
            }
            content.appendChild(draggedClient)
        }
        try {
            const { error } = await supabase.from('clients').update({ status: newStatus, position: newPosition }).eq('id', clientId)
            if (error) throw error
            const client = clients.find(c => c.id === clientId)
            if (client) {
                client.status = newStatus
                client.position = newPosition
            }
            clients.sort((a, b) => (a.position || 0) - (b.position || 0))
            handleSearch()
        } catch (error) {
            console.error('Error updating status/position:', error)
            showAlert('Erro ao atualizar. Recarregando...', 'Erro')
            loadClients()
        }
    }
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.client-card:not(.dragging)')]
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = y - box.top - box.height / 2
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child }
        } else {
            return closest
        }
    }, { offset: Number.NEGATIVE_INFINITY })
}

function toggleModal(show, client = null) {
    if (show) {
        modalOverlay.classList.add('is-visible')
        if (client) {
            document.getElementById('modal-title').textContent = 'Editar Cliente'
            document.getElementById('client-name').value = client.name
            document.getElementById('client-phone').value = client.phone || ''
            document.getElementById('client-status').value = client.status || 'Novo'
            document.getElementById('client-notes').value = client.notes || ''
            formNewClient.dataset.id = client.id
            document.getElementById('btn-submit').textContent = 'Atualizar Cliente'
        } else {
            document.getElementById('modal-title').textContent = 'Novo Cliente'
            formNewClient.reset()
            delete formNewClient.dataset.id
            document.getElementById('btn-submit').textContent = 'Adicionar Cliente'
        }
    } else {
        modalOverlay.classList.remove('is-visible')
        formNewClient.reset()
        delete formNewClient.dataset.id
    }
}

async function handleNewClient(e) {
    e.preventDefault()
    const formData = new FormData(formNewClient)
    const id = formNewClient.dataset.id
    const clientData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        status: formData.get('status'),
        notes: formData.get('notes')
    }
    try {
        let error
        if (id) {
            const response = await supabase.from('clients').update(clientData).eq('id', id)
            error = response.error
        } else {
            const { data: maxPosData } = await supabase.from('clients').select('position').order('position', { ascending: false }).limit(1)
            const maxPos = maxPosData && maxPosData.length > 0 ? maxPosData[0].position : 0
            clientData.position = maxPos + 1000
            clientData.user_id = user.id
            const response = await supabase.from('clients').insert([clientData])
            error = response.error
        }
        if (error) throw error
        loadClients()
        toggleModal(false)
    } catch (error) {
        console.error('Error saving client:', error)
        showAlert('Erro ao salvar cliente. Tente novamente.', 'Erro')
    }
}

function setupAppEventListeners() {
    btnNewClient.addEventListener('click', () => toggleModal(true))
    btnCloseModal.addEventListener('click', () => toggleModal(false))
    btnCancel.addEventListener('click', () => toggleModal(false))
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            toggleModal(false)
        }
    })
    formNewClient.addEventListener('submit', handleNewClient)
    searchInput.addEventListener('input', handleSearch)
}

function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim()
    if (!searchTerm) {
        renderClients(clients)
        return
    }
    const filteredClients = clients.filter(client => {
        const name = client.name?.toLowerCase() || ''
        const phone = client.phone?.toLowerCase() || ''
        const notes = client.notes?.toLowerCase() || ''
        return name.includes(searchTerm) || phone.includes(searchTerm) || notes.includes(searchTerm)
    })
    renderClients(filteredClients)
}

window.deleteClient = async (id) => {
    const confirmed = await showConfirm('Tem certeza que deseja excluir este cliente?')
    if (confirmed) {
        const card = document.querySelector(`.client-card[data-id="${id}"]`);
        if (card) {
            card.classList.add('card-exiting');
            card.addEventListener('transitionend', () => card.remove(), { once: true });
        }
        try {
            const { error } = await supabase.from('clients').delete().eq('id', id)
            if (error) throw error;
            clients = clients.filter(c => c.id !== id);
        } catch (error) {
            console.error('Error deleting client:', error)
            showAlert('Erro ao excluir cliente.', 'Erro')
            loadClients();
        }
    }
}

window.editClient = (id) => {
    const client = clients.find(c => c.id === id)
    if (client) {
        toggleModal(true, client)
    }
}

window.moveClientStatus = async (id, currentStatus, direction) => {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus)
    let nextStatus = null
    if (direction === 'next' && currentIndex < STATUS_FLOW.length - 1) {
        nextStatus = STATUS_FLOW[currentIndex + 1]
    } else if (direction === 'prev' && currentIndex > 0) {
        nextStatus = STATUS_FLOW[currentIndex - 1]
    }
    if (nextStatus) {
        try {
            const { error } = await supabase.from('clients').update({ status: nextStatus }).eq('id', id)
            if (error) throw error
            const client = clients.find(c => c.id === id)
            if (client) client.status = nextStatus
            handleSearch()
        } catch (error) {
            console.error('Error moving status:', error)
            showAlert('Erro ao mover status.', 'Erro')
        }
    }
}

// --- INITIALIZATION & UI MANAGEMENT ---

function initApp() {
    loadClients()
    setupAppEventListeners()
    setupDragAndDrop()
}

function clearApp() {
    Object.values(columns).forEach(col => {
        const content = col.querySelector('.column-content') || col;
        content.innerHTML = '';
    });
    clients = [];
}

async function checkUserAndSetupUI() {
    const { data: { session } } = await supabase.auth.getSession();
    user = session?.user;

    if (user) {
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        initApp();
    } else {
        appContainer.classList.add('hidden');
        authContainer.classList.remove('hidden');
        clearApp();
    }
}

// --- ENTRY POINT ---

document.addEventListener('DOMContentLoaded', () => {
    authToggleButton.addEventListener('click', (e) => {
        e.preventDefault()
        toggleAuthMode()
    })
    authForm.addEventListener('submit', handleAuthSubmit)
    btnLogout.addEventListener('click', handleLogout)

    supabase.auth.onAuthStateChange((_event, session) => {
        user = session?.user
        checkUserAndSetupUI()
    })

    checkUserAndSetupUI()
})