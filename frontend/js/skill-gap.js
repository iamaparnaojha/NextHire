/**
 * NextHire — Skill Gap Analysis Logic
 */

(function() {
    'use strict';
    requireAuth();

    const btnAnalyze = document.getElementById('btn-analyze');
    
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
        
        try {
            if (currentAbortController) {
                currentAbortController();
                currentAbortController = null;
            }

            emptyState.classList.add('hidden');
            resultsContent.classList.add('hidden');
            loadingState.classList.remove('hidden');
            btnAnalyze.disabled = true;
            btnAnalyze.innerHTML = '<div class="spinner"></div> Processing...';

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
                endpoint: '/api/analysis/skill-gap',
                body: { resume_text: resumeText, job_description: jdText },
                containerId: 'analysis-text',
                indicatorId: 'typing-indicator',
                onComplete: (fullText) => {
                    btnAnalyze.disabled = false;
                    btnAnalyze.innerHTML = '🔍 Find Skill Gaps Again';
                    
                    apiFetch('/api/history/', {
                        method: 'POST',
                        body: JSON.stringify({
                            tool_name: 'skill-gap',
                            content: fullText,
                            job_title: 'Skill Gap Analysis',
                            score: null
                        })
                    }).catch(console.warn);
                },
                onError: (err) => {
                    Toast.error("Analysis failed: " + err.message);
                    btnAnalyze.disabled = false;
                    btnAnalyze.innerHTML = '🔍 Retry Analysis';
                }
            });

        } catch (error) {
            Toast.error(error.message);
            loadingState.classList.add('hidden');
            emptyState.classList.remove('hidden');
            btnAnalyze.disabled = false;
            btnAnalyze.innerHTML = '🔍 Find Skill Gaps';
        }
    });
})();
