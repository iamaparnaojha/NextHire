/**
 * NextHire — History Fetch & Display Logic
 */

(function() {
    'use strict';
    requireAuth();

    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const historyGrid = document.getElementById('history-grid');
    
    const historyModal = document.getElementById('history-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDate = document.getElementById('modal-date');
    const modalBody = document.getElementById('modal-body');

    let historyData = [];

    async function loadHistory() {
        try {
            const data = await apiFetch('/api/history/', { method: 'GET' });
            historyData = data;
            
            loadingState.classList.add('hidden');
            
            if (!historyData || historyData.length === 0) {
                emptyState.classList.remove('hidden');
            } else {
                historyGrid.classList.remove('hidden');
                renderHistoryCards(historyData);
            }
        } catch (err) {
            Toast.error("Failed to load history: " + err.message);
            loadingState.classList.add('hidden');
            emptyState.classList.remove('hidden');
            emptyState.innerHTML = `<p style="color:var(--color-error)">Error loading history.</p>`;
        }
    }

    function renderHistoryCards(items) {
        historyGrid.innerHTML = '';
        
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'history-card animate-fade-in-up';
            
            // Format nice title and content preview
            const niceToolName = item.tool_name.replace('-', ' ').toUpperCase();
            const dateObj = new Date(item.created_at);
            const dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            // Extract raw text from markdown for preview
            const previewText = item.content ? window.marked.parse(item.content).replace(/<[^>]+>/g, '').substring(0, 150) + '...' : 'No content';
            
            card.innerHTML = `
                <div class="history-card-header">
                    <span class="history-tool-badge">${niceToolName}</span>
                    <span class="history-date">${dateStr}</span>
                </div>
                ${item.job_title ? `<h4 style="margin-bottom: var(--sp-2);">${item.job_title}</h4>` : ''}
                <div class="history-content-preview">
                    ${previewText}
                </div>
                <div style="margin-top: auto; color: var(--color-accent); font-size: var(--fs-sm); font-weight: var(--fw-bold);">
                    View Details → 
                </div>
            `;
            
            card.addEventListener('click', () => openModal(item));
            historyGrid.appendChild(card);
        });
    }

    function openModal(item) {
        const niceToolName = item.tool_name.replace('-', ' ').toUpperCase();
        const dateObj = new Date(item.created_at);
        
        modalTitle.textContent = `${niceToolName} Results`;
        modalDate.textContent = dateObj.toLocaleString();
        
        modalBody.innerHTML = window.marked ? marked.parse(item.content) : `<pre>${item.content}</pre>`;
        
        historyModal.classList.remove('hidden');
    }

    btnCloseModal.addEventListener('click', () => {
        historyModal.classList.add('hidden');
    });
    
    // Close on outside click
    historyModal.addEventListener('click', (e) => {
        if(e.target === historyModal) {
            historyModal.classList.add('hidden');
        }
    });

    // Start load
    loadHistory();

})();

// ── Global Helper: Save to History ──
window.saveToHistory = async function(toolName, content, jobTitle = null, score = null) {
    try {
        await apiFetch('/api/history/', {
            method: 'POST',
            body: JSON.stringify({
                tool_name: toolName,
                content: content,
                job_title: jobTitle,
                score: score
            })
        });
    } catch (err) {
        console.warn("Failed to auto-save history:", err);
    }
};
