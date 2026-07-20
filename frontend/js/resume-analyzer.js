/**
 * NextHire — Resume Analyzer Logic
 */

(function() {
    'use strict';
    requireAuth();

    const btnAnalyze = document.getElementById('btn-analyze');
    
    // UI States
    const emptyState = document.getElementById('empty-state');
    const loadingState = document.getElementById('loading-state');
    const resultsContent = document.getElementById('results-content');
    const scoreContainer = document.getElementById('score-container');
    const atsScoreValue = document.getElementById('ats-score-value');
    
    let currentAbortController = null;

    btnAnalyze.addEventListener('click', async () => {
        const jdText = document.getElementById('jd-text').value.trim();
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
            scoreContainer.classList.add('hidden');
            loadingState.classList.remove('hidden');
            btnAnalyze.disabled = true;
            btnAnalyze.innerHTML = '<div class="spinner"></div> Processing...';
            atsScoreValue.textContent = '--';

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
            
            // 2. Fetch ATS Score Non-Streaming (if JD is provided)
            if (jdText) {
                scoreContainer.classList.remove('hidden');
                apiFetch('/api/analysis/ats-score', {
                    method: 'POST',
                    body: JSON.stringify({ resume_text: resumeText, job_description: jdText })
                }).then(data => {
                    if (data && data.score) {
                        animateScore(data.score);
                    }
                }).catch(err => {
                    console.error("Failed to get ATS score:", err);
                    atsScoreValue.textContent = 'Err';
                });
            }

            // 3. Start Streaming Analysis Request
            currentAbortController = window.startStreamingResponse({
                endpoint: '/api/analysis/resume',
                body: { resume_text: resumeText, job_description: jdText || "Not provided" },
                containerId: 'analysis-text',
                indicatorId: 'typing-indicator',
                onComplete: (fullText) => {
                    btnAnalyze.disabled = false;
                    btnAnalyze.innerHTML = '✨ Analyze Again';
                    
                    // Save to history
                    const score = atsScoreValue.textContent !== '--' && atsScoreValue.textContent !== 'Err' ? parseInt(atsScoreValue.textContent) : null;
                    apiFetch('/api/history/', {
                        method: 'POST',
                        body: JSON.stringify({
                            tool_name: 'resume-analyzer',
                            content: fullText,
                            job_title: 'Resume Analysis',
                            score: score
                        })
                    }).catch(console.warn);
                },
                onError: (err) => {
                    Toast.error("Analysis failed: " + err.message);
                    btnAnalyze.disabled = false;
                    btnAnalyze.innerHTML = '✨ Retry Analysis';
                }
            });

        } catch (error) {
            Toast.error(error.message);
            loadingState.classList.add('hidden');
            emptyState.classList.remove('hidden');
            btnAnalyze.disabled = false;
            btnAnalyze.innerHTML = '✨ Analyze Resume';
        }
    });
    
    // Quick score animation helper
    function animateScore(targetScoreText) {
        const target = parseInt(targetScoreText, 10);
        if (isNaN(target)) {
            atsScoreValue.textContent = targetScoreText;
            return;
        }
        
        let current = 0;
        const duration = 1500; // ms
        const steps = 30;
        const increment = target / steps;
        const intervalTime = duration / steps;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
                
                // Colorize based on score
                if (target >= 80) atsScoreValue.style.color = 'var(--color-success-light)';
                else if (target >= 50) atsScoreValue.style.color = 'var(--color-warning-light)';
                else atsScoreValue.style.color = 'var(--color-error-light)';
            }
            atsScoreValue.textContent = Math.round(current);
        }, intervalTime);
    }
})();
