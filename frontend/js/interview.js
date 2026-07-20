/**
 * NextHire — Interview Simulator Logic (Aru)
 *
 * State variables:
 *   isInterviewActive   — true once interview has started
 *   isStreaming         — true while Aru is generating/streaming a response
 *   isGeneratingReport  — true while the hiring report is being generated
 *   activeStreamAbort   — abort function for the current Aru stream (or null)
 */

(function () {
    'use strict';
    requireAuth();

    // ── DOM References ─────────────────────────────────────────────────────────
    const btnStart        = document.getElementById('btn-start-interview');
    const jdTextInput     = document.getElementById('jd-text');
    const chatMessages    = document.getElementById('chat-messages');
    const chatInputArea   = document.getElementById('chat-input-area');
    const chatInput       = document.getElementById('chat-input');
    const btnSend         = document.getElementById('btn-send');
    const hiddenResumeText= document.getElementById('resume-text-hidden');
    const btnEndInterview = document.getElementById('btn-end-interview');
    const reportModal     = document.getElementById('report-modal');
    const btnCloseModal   = document.getElementById('btn-close-modal');
    const reportContent   = document.getElementById('report-content');
    const reportLoading   = document.getElementById('report-loading');

    // ── State ──────────────────────────────────────────────────────────────────
    let chatHistory        = [];
    let isInterviewActive  = false;
    let isStreaming        = false;
    let isGeneratingReport = false;
    let activeStreamAbort  = null;   // Holds the abort() fn for the current Aru stream

    // ── Helpers ────────────────────────────────────────────────────────────────

    /** Disable all interaction controls after interview ends. */
    function lockChat() {
        chatInput.disabled    = true;
        btnSend.disabled      = true;
        btnEndInterview.disabled = true;
        chatInput.placeholder = 'Interview ended. Start a new interview to continue.';
    }

    /** Re-enable input after Aru finishes streaming (during an active interview). */
    function unlockChat() {
        if (!isInterviewActive) return; // Never re-enable after interview ended
        chatInput.disabled = false;
        btnSend.disabled   = false;
        chatInput.focus();
    }

    /**
     * Append a message bubble to the chat window.
     * @param {'aru'|'user'} role
     * @param {string}       text   — plain text or Markdown (for aru)
     * @returns {HTMLElement}       — the created div
     */
    function appendMessage(role, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role} markdown-body`;
        if (role === 'aru') {
            msgDiv.innerHTML = window.marked ? marked.parse(text) : `<p>${text}</p>`;
        } else {
            // User text is plain — sanitise by setting textContent
            const p = document.createElement('p');
            p.style.margin = '0';
            p.textContent  = text;
            msgDiv.appendChild(p);
        }
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTo(0, chatMessages.scrollHeight);
        return msgDiv;
    }

    // ── Start Interview ────────────────────────────────────────────────────────
    btnStart.addEventListener('click', async () => {
        if (isInterviewActive) return; // Guard: already running

        const jdText = jdTextInput.value.trim();
        if (!jdText) {
            Toast.warning('Target Job Description is required to generate relevant questions.');
            return;
        }

        let resumeText = hiddenResumeText.value;
        const fileInput = document.getElementById('resume-file');

        if (fileInput.files.length > 0 && !resumeText) {
            try {
                btnStart.disabled = true;
                btnStart.innerHTML = '<span class="spinner"></span> Reading Resume...';
                const res = await window.uploadResumeToServer('resume-file');
                resumeText = res.text_content;
                hiddenResumeText.value = resumeText;
            } catch (err) {
                Toast.error('Failed to read resume: ' + err.message);
                btnStart.disabled = false;
                btnStart.innerHTML = 'Start Interview 🚀';
                return;
            }
        }

        if (!resumeText) {
            resumeText = 'Not provided by candidate.';
            hiddenResumeText.value = resumeText;
        }

        // ── Transition to active state ──
        isInterviewActive = true;
        chatHistory       = [];

        btnStart.disabled       = true;
        btnStart.textContent    = 'Interview in Progress...';
        jdTextInput.disabled    = true;
        chatInputArea.classList.remove('hidden');
        btnEndInterview.classList.remove('hidden');
        chatMessages.innerHTML  = ''; // Clear welcome message

        await triggerAru();
    });

    // ── Trigger Aru to speak ───────────────────────────────────────────────────
    /**
     * Ask Aru for the next question/response.
     * Stores the stream's abort function in `activeStreamAbort`.
     */
    async function triggerAru() {
        if (!isInterviewActive) return;

        isStreaming         = true;
        chatInput.disabled  = true;
        btnSend.disabled    = true;

        const resumeText = hiddenResumeText.value || 'Not provided';
        const jdText     = jdTextInput.value;

        // Create Aru message bubble with typing indicator
        const aruMsg  = document.createElement('div');
        const msgId   = 'aru-msg-' + Date.now();
        aruMsg.id     = msgId;
        aruMsg.className = 'message aru markdown-body';
        aruMsg.innerHTML = '<span class="typing-indicator" style="display:inline-block;"><span></span><span></span><span></span></span>';
        chatMessages.appendChild(aruMsg);
        chatMessages.scrollTo(0, chatMessages.scrollHeight);

        activeStreamAbort = window.startStreamingResponse({
            endpoint    : '/api/interview/chat',
            body        : { resume_text: resumeText, job_description: jdText, history: chatHistory },
            containerId : msgId,
            indicatorId : null,
            onComplete  : (fullText) => {
                isStreaming       = false;
                activeStreamAbort = null;
                chatHistory.push({ role: 'aru', text: fullText });
                // Re-render with proper markdown
                aruMsg.innerHTML = window.marked ? marked.parse(fullText) : fullText;
                chatMessages.scrollTo(0, chatMessages.scrollHeight);
                unlockChat();
            },
            onError: (err) => {
                isStreaming       = false;
                activeStreamAbort = null;
                aruMsg.innerHTML  = `<span style="color:var(--color-error)">[Connection Error: ${err.message}]</span>`;
                unlockChat();
            },
        });
    }

    // ── Send user message ──────────────────────────────────────────────────────
    btnSend.addEventListener('click', async () => {
        if (!isInterviewActive || isStreaming || isGeneratingReport) return;

        const text = chatInput.value.trim();
        if (!text) return;

        appendMessage('user', text);
        chatHistory.push({ role: 'user', text });
        chatInput.value = '';

        await triggerAru();
    });

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            btnSend.click();
        }
    });

    // ── End Interview & Generate Report ───────────────────────────────────────
    btnEndInterview.addEventListener('click', () => {
        if (!isInterviewActive || isGeneratingReport) return; // Guard: already ending

        isGeneratingReport = true;
        isInterviewActive  = false; // Prevent any further chat interaction

        // 1. Abort any in-progress Aru stream cleanly
        if (isStreaming && activeStreamAbort) {
            activeStreamAbort();
            activeStreamAbort = null;
            isStreaming       = false;
            // Clean up any partial/empty Aru bubble that was being streamed
            const lastMsg = chatMessages.lastElementChild;
            if (lastMsg && lastMsg.classList.contains('aru')) {
                const content = lastMsg.textContent.trim();
                // If the bubble only has the typing indicator (no real text), remove it
                if (!content || lastMsg.querySelector('.typing-indicator')) {
                    chatMessages.removeChild(lastMsg);
                }
            }
        }

        // 2. Freeze the entire chat UI
        lockChat();

        // 3. Show the report modal with loading state
        reportModal.style.display    = 'flex';
        reportModal.classList.remove('hidden');
        reportContent.innerHTML      = '';
        reportContent.classList.add('hidden');
        reportLoading.classList.remove('hidden');

        const resumeText = hiddenResumeText.value || 'Not provided';
        const jdText     = jdTextInput.value.trim();

        // 4. Stream the report into the modal
        window.startStreamingResponse({
            endpoint    : '/api/interview/report',
            body        : { resume_text: resumeText, job_description: jdText, history: chatHistory },
            containerId : 'report-content',
            indicatorId : null,
            onComplete  : (fullText) => {
                reportLoading.classList.add('hidden');
                reportContent.classList.remove('hidden');

                // 5. Save report to history (fire-and-forget)
                apiFetch('/api/history/', {
                    method : 'POST',
                    body   : JSON.stringify({
                        tool_name : 'interview',
                        content   : fullText,
                        job_title : 'Interview Hiring Report',
                        score     : null,
                    }),
                }).catch((err) => console.warn('History save failed:', err));
            },
            onError: (err) => {
                isGeneratingReport = false; // Allow retry on error
                reportLoading.classList.add('hidden');
                reportContent.classList.remove('hidden');
                reportContent.innerHTML = `<span style="color:var(--color-error)">[Report Generation Error: ${err.message}]</span>`;
            },
        });
    });

    // ── Close Modal ────────────────────────────────────────────────────────────
    btnCloseModal.addEventListener('click', () => {
        reportModal.style.display = 'none';
        reportModal.classList.add('hidden');
        // Interview stays ended — user must click Start Interview to begin a new one.
        // The chat remains locked (lockChat already called above).
    });

    // Close modal on backdrop click
    reportModal.addEventListener('click', (e) => {
        if (e.target === reportModal) {
            btnCloseModal.click();
        }
    });

})();
