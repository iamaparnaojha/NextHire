/**
 * NextHire — Interview Simulator Logic (Aru)
 */

(function() {
    'use strict';
    requireAuth();

    const btnStart = document.getElementById('btn-start-interview');
    const jdTextInput = document.getElementById('jd-text');
    const chatMessages = document.getElementById('chat-messages');
    const chatInputArea = document.getElementById('chat-input-area');
    const chatInput = document.getElementById('chat-input');
    const btnSend = document.getElementById('btn-send');
    const hiddenResumeText = document.getElementById('resume-text-hidden');
    const btnEndInterview = document.getElementById('btn-end-interview');
    const reportModal = document.getElementById('report-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const reportContent = document.getElementById('report-content');
    const reportLoading = document.getElementById('report-loading');

    let chatHistory = [];
    let isInterviewActive = false;

    // ── Pre-flight constraints ──
    btnStart.addEventListener('click', async () => {
        const jdText = jdTextInput.value.trim();
        
        if (!jdText) {
            Toast.warning("Target Job Description is required to generate relevant questions.");
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
                Toast.error("Failed to read resume: " + err.message);
                btnStart.disabled = false;
                btnStart.innerHTML = 'Start Interview 🚀';
                return;
            }
        }

        if (!resumeText) {
            resumeText = "Not provided by candidate.";
        }

        // Initialize session
        isInterviewActive = true;
        btnStart.disabled = true;
        btnStart.textContent = 'Interview in progress...';
        jdTextInput.disabled = true;
        
        chatInputArea.classList.remove('hidden');
        btnEndInterview.classList.remove('hidden');
        chatMessages.innerHTML = ''; // clear welcome message
        
        // Start the first prompt
        await triggerAru();
    });

    // ── Generate Hiring Report ──
    btnEndInterview.addEventListener('click', () => {
        const jdText = jdTextInput.value.trim();
        const resumeText = hiddenResumeText.value || "Not provided";

        // Show modal
        reportModal.style.display = 'flex';
        reportModal.classList.remove('hidden');
        reportContent.innerHTML = '';
        reportContent.classList.add('hidden');
        reportLoading.classList.remove('hidden');
        
        window.startStreamingResponse({
            endpoint: '/api/interview/report',
            body: {
                resume_text: resumeText,
                job_description: jdText,
                history: chatHistory
            },
            containerId: 'report-content',
            indicatorId: null,
            onComplete: (fullText) => {
                reportLoading.classList.add('hidden');
                reportContent.classList.remove('hidden');
                
                apiFetch('/api/history/', {
                    method: 'POST',
                    body: JSON.stringify({
                        tool_name: 'interview',
                        content: fullText,
                        job_title: 'Interview Hiring Report',
                        score: null
                    })
                }).catch(console.warn);
            },
            onError: (err) => {
                reportLoading.classList.add('hidden');
                reportContent.classList.remove('hidden');
                reportContent.innerHTML = `<span style="color:var(--color-error)">[Generation Error: ${err.message}]</span>`;
            }
        });
    });

    btnCloseModal.addEventListener('click', () => {
        reportModal.style.display = 'none';
        reportModal.classList.add('hidden');
    });

    // ── Chat logic ──
    
    function appendMessage(role, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role}`;
        
        if (role === 'aru') {
            msgDiv.innerHTML = window.marked ? marked.parse(text) : `<p>${text}</p>`;
        } else {
            msgDiv.textContent = text; // user text raw
        }
        
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTo(0, chatMessages.scrollHeight);
        return msgDiv; // Return element so we can update it if streaming
    }

    async function triggerAru() {
        // Disable input while Aru is thinking
        chatInput.disabled = true;
        btnSend.disabled = true;
        
        const resumeText = hiddenResumeText.value || "Not provided";
        const jdText = jdTextInput.value;

        // Create empty aru message block for streaming
        const aruMsg = document.createElement('div');
        aruMsg.className = 'message aru markdown-body';
        aruMsg.innerHTML = '<span class="typing-indicator" style="display:inline-block;"><span></span><span></span><span></span></span>';
        chatMessages.appendChild(aruMsg);
        chatMessages.scrollTo(0, chatMessages.scrollHeight);

        const typingIndicatorId = 'temp-typing-' + Date.now();
        aruMsg.id = typingIndicatorId;

        window.startStreamingResponse({
            endpoint: '/api/interview/chat',
            body: {
                resume_text: resumeText,
                job_description: jdText,
                history: chatHistory
            },
            containerId: typingIndicatorId,
            indicatorId: null, // Custom handling above
            onComplete: (fullText) => {
                chatHistory.push({ role: 'aru', text: fullText });
                aruMsg.innerHTML = window.marked ? marked.parse(fullText) : fullText;
                
                chatInput.disabled = false;
                btnSend.disabled = false;
                chatInput.focus();
                chatMessages.scrollTo(0, chatMessages.scrollHeight);
            },
            onError: (err) => {
                aruMsg.innerHTML = `<span style="color:var(--color-error)">[Connection Error: ${err.message}]</span>`;
                chatInput.disabled = false;
                btnSend.disabled = false;
            }
        });
    }

    btnSend.addEventListener('click', async () => {
        const text = chatInput.value.trim();
        if (!text) return;
        
        // Append user message
        appendMessage('user', text);
        chatHistory.push({ role: 'user', text: text });
        chatInput.value = '';
        
        await triggerAru();
    });

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            btnSend.click();
        }
    });

})();
