/**
 * NextHire — Cover Letter Logic
 */

(function() {
    'use strict';
    requireAuth();

    const btnAnalyze = document.getElementById('btn-analyze');
    const btnCopy = document.getElementById('btn-copy');
    
    // UI States
    const emptyState = document.getElementById('empty-state');
    const loadingState = document.getElementById('loading-state');
    const resultsContent = document.getElementById('results-content');
    
    let currentAbortController = null;

    btnAnalyze.addEventListener('click', async () => {
        const jdText = document.getElementById('jd-text').value.trim();
        const tabUpload = document.getElementById('tab-upload');
        const isUploadMode = tabUpload && tabUpload.classList.contains('active');
        
        if (!jdText) {
            Toast.warning("Please provide a Job Description.");
            return;
        }

        let resumeText = '';
        btnCopy.classList.add('hidden'); // hide copy button initially
        
        try {
            if (currentAbortController) {
                currentAbortController();
                currentAbortController = null;
            }

            emptyState.classList.add('hidden');
            resultsContent.classList.add('hidden');
            loadingState.classList.remove('hidden');
            btnAnalyze.disabled = true;
            btnAnalyze.innerHTML = '<div class="spinner"></div> Generating...';

            if (isUploadMode) {
                const response = await window.uploadResumeToServer('resume-file');
                resumeText = response.text_content;
                Toast.success("Resume loaded!");
            } else {
                const textInput = document.getElementById('resume-text').value;
                const response = await window.submitResumeTextToServer(textInput);
                resumeText = response.text_content;
            }

            loadingState.classList.add('hidden');
            resultsContent.classList.remove('hidden');
            
            currentAbortController = window.startStreamingResponse({
                endpoint: '/api/cover-letter/generate',
                body: { resume_text: resumeText, job_description: jdText },
                containerId: 'analysis-text',
                indicatorId: 'typing-indicator',
                onComplete: (fullText) => {
                    btnAnalyze.disabled = false;
                    btnAnalyze.innerHTML = '✍️ Generate Again';
                    btnCopy.classList.remove('hidden'); // show copy button when done
                    
                    apiFetch('/api/history/', {
                        method: 'POST',
                        body: JSON.stringify({
                            tool_name: 'cover-letter',
                            content: fullText,
                            job_title: 'Cover Letter',
                            score: null
                        })
                    }).catch(console.warn);
                },
                onError: (err) => {
                    Toast.error("Generation failed: " + err.message);
                    btnAnalyze.disabled = false;
                    btnAnalyze.innerHTML = '✍️ Retry Generation';
                }
            });

        } catch (error) {
            Toast.error(error.message);
            loadingState.classList.add('hidden');
            emptyState.classList.remove('hidden');
            btnAnalyze.disabled = false;
            btnAnalyze.innerHTML = '✍️ Generate Cover Letter';
        }
    });

    btnCopy.addEventListener('click', () => {
        const textElement = document.getElementById('analysis-text');
        // Extract raw text from HTML
        const cleanText = typeof cleanupHTML === 'function' ? cleanupHTML(textElement.innerHTML) : textElement.innerText;
        
        navigator.clipboard.writeText(cleanText)
            .then(() => Toast.success("Cover letter copied to clipboard!"))
            .catch(err => Toast.error("Failed to copy!"));
    });
})();
