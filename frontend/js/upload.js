/**
 * NextHire — File Upload UI (upload.js)
 * Handles drag-and-drop, UI states for uploading, and paste text modes.
 */

(function() {
    'use strict';

    function initUploader() {
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('resume-file');
        const selectBtn = document.getElementById('btn-select-file');
        const uploadForm = document.getElementById('upload-form');
        const pasteForm = document.getElementById('paste-form');
        const tabUpload = document.getElementById('tab-upload');
        const tabPaste = document.getElementById('tab-paste');
        const fileInfo = document.getElementById('file-info');
        const fileName = document.getElementById('file-name');
        const btnRemove = document.getElementById('btn-remove-file');

        if (!dropZone) return; // Not on the analyzer page

        // ── Tabs Switching ──
        if (tabUpload && tabPaste) {
            tabUpload.addEventListener('click', () => {
                tabUpload.classList.add('active');
                tabPaste.classList.remove('active');
                uploadForm.classList.remove('hidden');
                pasteForm.classList.add('hidden');
            });

            tabPaste.addEventListener('click', () => {
                tabPaste.classList.add('active');
                tabUpload.classList.remove('active');
                pasteForm.classList.remove('hidden');
                uploadForm.classList.add('hidden');
            });
        }

        // ── File Selection ──
        if (selectBtn) {
            selectBtn.addEventListener('click', (e) => {
                e.preventDefault();
                fileInput.click();
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', () => {
                if (fileInput.files.length) {
                    handleFile(fileInput.files[0]);
                }
            });
        }

        // ── Drag and Drop Events ──
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, unhighlight, false);
        });

        function highlight(e) {
            dropZone.classList.add('dragover');
        }

        function unhighlight(e) {
            dropZone.classList.remove('dragover');
        }

        dropZone.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length) {
                fileInput.files = files; // Assign to input
                handleFile(files[0]);
            }
        }

        // ── Handle File Select/Drop ──
        function handleFile(file) {
            // Validate extension
            const validTypes = ['.pdf', '.docx'];
            const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            
            if (!validTypes.includes(ext)) {
                Toast.error('Invalid file type. Please upload a PDF or DOCX file.');
                fileInput.value = '';
                return;
            }
            
            // Validate size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                Toast.error('File is too large. Max size is 5MB.');
                fileInput.value = '';
                return;
            }

            // Update UI
            fileName.textContent = file.name;
            dropZone.style.display = 'none';
            fileInfo.classList.remove('hidden');
        }

        // ── Remove File ──
        if (btnRemove) {
            btnRemove.addEventListener('click', () => {
                fileInput.value = '';
                fileName.textContent = '';
                fileInfo.classList.add('hidden');
                dropZone.style.display = 'flex';
            });
        }
    }

    /**
     * Helper to perform the actual API upload call.
     * Exported to global scope to be used by the page's main JS (e.g. resume-analyzer.js)
     */
    window.uploadResumeToServer = async function(fileInputId) {
        const fileInput = document.getElementById(fileInputId);
        if (!fileInput || !fileInput.files.length) {
            throw new Error('Please select a resume file first.');
        }

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        return await apiUpload('/api/resume/upload', formData);
    };

    /**
     * Helper to submit pasted text.
     */
    window.submitResumeTextToServer = async function(textValue) {
        if (!textValue || textValue.trim().length < 10) {
            throw new Error('Please paste a valid resume text (at least a few words).');
        }

        return await apiFetch('/api/resume/text', {
            method: 'POST',
            body: JSON.stringify({ text: textValue })
        });
    };

    // Initialize on load
    document.addEventListener('DOMContentLoaded', initUploader);
})();
