/**
 * NextHire — Impactful Introduction Logic
 */

(function() {
    'use strict';
    requireAuth();

    const btnGenerate = document.getElementById('btn-generate');
    
    // UI States
    const emptyState = document.getElementById('empty-state');
    const loadingState = document.getElementById('loading-state');
    const resultsContent = document.getElementById('results-content');
    
    let currentAbortController = null;

    btnGenerate.addEventListener('click', async () => {
        const tabUpload = document.getElementById('tab-upload');
        const isUploadMode = tabUpload && tabUpload.classList.contains('active');
        
        let resumeText = '';
        
        try {
            // Cancel any ongoing stream
            if (currentAbortController) {
                currentAbortController();
                currentAbortController = null;
            }

            // Set UI to loading
            emptyState.classList.add('hidden');
            resultsContent.classList.add('hidden');
            loadingState.classList.remove('hidden');
            btnGenerate.disabled = true;
            btnGenerate.innerHTML = '<div class="spinner"></div> Generating...';

            // 1. Get Resume Text
            if (isUploadMode) {
                const response = await window.uploadResumeToServer('resume-file');
                resumeText = response.text_content;
                Toast.success("Resume parsed successfully!");
            } else {
                const textInput = document.getElementById('resume-text').value;
                const response = await window.submitResumeTextToServer(textInput);
                resumeText = response.text_content;
            }

            // Move from "loading" state to "streaming" state
            loadingState.classList.add('hidden');
            resultsContent.classList.remove('hidden');
            
            // 2. Start Streaming Analysis Request
            currentAbortController = window.startStreamingResponse({
                endpoint: '/api/analysis/introduction',
                body: { resume_text: resumeText },
                containerId: 'analysis-text',
                indicatorId: 'typing-indicator',
                onComplete: (fullText) => {
                    btnGenerate.disabled = false;
                    btnGenerate.innerHTML = '✨ Generate Again';
                    
                    // Save to history
                    apiFetch('/api/history/', {
                        method: 'POST',
                        body: JSON.stringify({
                            tool_name: 'impactful-introduction',
                            content: fullText,
                            job_title: 'Personal Bio',
                            score: null
                        })
                    }).catch(console.warn);
                },
                onError: (err) => {
                    Toast.error("Generation failed: " + err.message);
                    btnGenerate.disabled = false;
                    btnGenerate.innerHTML = '✨ Retry Generation';
                }
            });

        } catch (error) {
            Toast.error(error.message);
            loadingState.classList.add('hidden');
            emptyState.classList.remove('hidden');
            btnGenerate.disabled = false;
            btnGenerate.innerHTML = '✨ Generate Bio';
        }
    });
})();
