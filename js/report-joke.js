/**
 * Report Joke Modal - Initialization
 * Runs after allModalsLoaded so elements exist in the DOM.
 */

document.addEventListener('allModalsLoaded', function () {
    const form = document.getElementById('report-joke-form');
    if (!form) return;

    const modal = document.getElementById('report-a-joke-modal');
    const anonymousCheckbox = document.getElementById('id_anonymous');
    const contactCheckbox = document.getElementById('id_post_review_contact_desired');
    const reporterFields = document.querySelectorAll('.reporter-fields input');
    const emailField = document.getElementById('id_reporter_email');
    const rationale = document.getElementById('id_rationale_for_review');
    const charCount = document.getElementById('char-count');
    const submitBtn = document.getElementById('submit-report');
    const alertContainer = document.getElementById('form-alerts');

    // Set of valid reference_id strings fetched from the API.
    // null  → API not yet loaded (or failed); skip set-membership check.
    // Set   → API succeeded; submitted value MUST be a member.

    // -------------------------------------------------------------------------
    // Populate reference ID dropdown from API
    // -------------------------------------------------------------------------
    let validReferenceIds = null;
    let referenceIdsCache = [];
    let autocompleteInitialized = false;

    const getReferenceIds = async () => {
        try {
            const response = await fetch('https://api.yo-momma.io/insults/reference-ids/');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            return Array.isArray(data.reference_ids) ? data.reference_ids : [];
        } catch (error) {
            console.warn('[ReportJoke] Could not load reference IDs:', error);
            return [];
        }
    };

    async function initializeReferenceIds() {
        if (autocompleteInitialized) return;
        try {
            const ids = await getReferenceIds();   // ids is now an array of strings
            validReferenceIds = new Set(ids);
            referenceIdsCache = Array.isArray(ids) ? ids : [];

            const autoCompleteInput = $('#id_insult_reference_id');
            if (!autoCompleteInput.length) {
                console.warn('[ReportJoke] Autocomplete input not found. Skipping autocomplete initialization.');
                return;
            }

            autoCompleteInput.autocomplete({
                source: function (request, response) {
                    const term = request.term.toLowerCase();
                    response(referenceIdsCache.filter(item => item.toLowerCase().includes(term)));

                },
                minLength: 1,
                delay: 100,
                appendTo: '#report-a-joke-modal'
            });
            console.log(`[ReportJoke] Autocomplete initialized with ${referenceIdsCache.length} reference IDs.`);
            autocompleteInitialized = true;
        } catch (error) {
            console.warn('[ReportJoke] Failed to initialize autocomplete:', error);
        }
    }
    $(document).on('shown.bs.modal', '#report-a-joke-modal', initializeReferenceIds);
    // -------------------------------------------------------------------------
    // Modal trigger
    // -------------------------------------------------------------------------
    const reportTrigger = document.getElementById('reportAJokeTrigger');
    if (reportTrigger) {
        reportTrigger.addEventListener('click', function (e) {
            e.preventDefault();
            const bootstrapModal = new bootstrap.Modal(modal, {
                backdrop: true,
                keyboard: true,
                focus: true
            });
            bootstrapModal.show();
        });
    }

    // -------------------------------------------------------------------------
    // Anonymous checkbox — toggle required state on name fields
    // -------------------------------------------------------------------------
    anonymousCheckbox.addEventListener('change', function () {
        const isAnonymous = this.checked;
        reporterFields.forEach(field => {
            if (isAnonymous) {
                field.removeAttribute('required');
                field.closest('.form-group').classList.add('text-muted');
            } else {
                field.setAttribute('required', 'required');
                field.closest('.form-group').classList.remove('text-muted');
            }
        });
        document.querySelectorAll('.required-asterisk').forEach(marker => {
            marker.style.display = isAnonymous ? 'none' : 'inline';
        });
    });

    // -------------------------------------------------------------------------
    // Contact checkbox — toggle required state on email field
    // -------------------------------------------------------------------------
    contactCheckbox.addEventListener('change', function () {
        const wantsContact = this.checked;
        const emailRequiredMarker = document.querySelector('.email-required-asterisk');
        if (wantsContact) {
            emailField.setAttribute('required', 'required');
            emailRequiredMarker.style.display = 'inline';
        } else {
            emailField.removeAttribute('required');
            emailRequiredMarker.style.display = 'none';
        }
    });

    // -------------------------------------------------------------------------
    // Character counter — updates on every keystroke
    // -------------------------------------------------------------------------
    rationale.addEventListener('input', function () {
        const count = this.value.length;
        charCount.textContent = count;
        if (count >= 70) {
            charCount.style.color = 'green';
        } else if (count >= 50) {
            charCount.style.color = 'orange';
        } else {
            charCount.style.color = 'red';
        }
    });

    // -------------------------------------------------------------------------
    // Form submission via DozensAPIClient.reportJoke
    // -------------------------------------------------------------------------
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        alertContainer.innerHTML = '';

        const spinner = submitBtn.querySelector('.spinner-border');
        spinner.style.display = 'inline-block';
        submitBtn.disabled = true;

        const data = Object.fromEntries(new FormData(form));
        const errors = validateForm(data);

        if (errors.length > 0) {
            showErrors(errors);
            resetSubmitButton();
            return;
        }

        try {
            const response = await window.dozensAPI.reportJoke(data);

            if (response.status === 'SUCCESS') {
                const githubUrl = response.github_url;
                resetSubmitButton();
                form.reset();
                charCount.textContent = '0';
                charCount.style.color = '';
                const modalInstance = bootstrap.Modal.getInstance(modal);
                modal.addEventListener('hidden.bs.modal', function onHidden() {
                    modal.removeEventListener('hidden.bs.modal', onHidden);
                    Swal.fire({
                        icon: 'success',
                        title: 'Report Submitted!',
                        html: `Your joke report has been submitted successfully.<br><br>
                               Track the status of your report:<br>
                               <a href="${githubUrl}" target="_blank" rel="noopener">${githubUrl}</a>`,
                        confirmButtonText: 'Got it',
                        confirmButtonColor: '#770071'
                    }).then(() => {
                        document.body.classList.remove('modal-open');
                        document.body.style.overflow = '';
                        document.body.style.paddingRight = '';
                        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                    });
                }, { once: true });
                if (modalInstance) modalInstance.hide();
            } else {
                throw new Error('Unexpected response status');
            }
        } catch (error) {
            console.error('[ReportJoke] Submission error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Submission Failed',
                text: 'Failed to submit your report. Please try again later.',
                confirmButtonColor: '#770071'
            });
            resetSubmitButton();
        }
    });

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------
    function validateForm(data) {
        const errors = [];

        const refId = data.insult_reference_id?.trim();
        if (!refId) {
            errors.push({ field: 'id_insult_reference_id', message: 'Insult Reference ID is required' });
        } else if (validReferenceIds !== null && !validReferenceIds.has(refId)) {
            errors.push({ field: 'id_insult_reference_id', message: 'That Reference ID was not found. Please select a valid ID from the list.' });
        }
        if (!data.review_type) {
            errors.push({ field: 'id_review_type', message: 'Please select a review type' });
        }

        const isAnonymous = data.anonymous === 'on';
        if (!isAnonymous) {
            if (!data.reporter_first_name?.trim()) {
                errors.push({ field: 'id_reporter_first_name', message: 'First name is required when not submitting anonymously' });
            }
            if (!data.reporter_last_name?.trim()) {
                errors.push({ field: 'id_reporter_last_name', message: 'Last name is required when not submitting anonymously' });
            }
        }

        if (data.post_review_contact_desired === 'on' && !data.reporter_email?.trim()) {
            errors.push({ field: 'id_reporter_email', message: 'Email address is required if you want to be contacted' });
        }

        if (data.rationale_for_review && data.rationale_for_review.length < 70) {
            errors.push({ field: 'id_rationale_for_review', message: 'Please ensure your review reason is 70 characters or more' });
        }

        return errors;
    }

    function showErrors(errors) {
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        errors.forEach(({ field, message }) => {
            const el = document.getElementById(field);
            if (el) {
                el.classList.add('is-invalid');
                const feedback = el.parentNode.querySelector('.invalid-feedback');
                if (feedback) feedback.textContent = message;
            }
        });
        showAlert('error', 'Please correct the errors below and try again.');
    }

    function showAlert(type, message) {
        const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
        const icon = type === 'success' ? '✓' : '⚠️';
        alertContainer.innerHTML = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                <strong>${icon}</strong> ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>`;
    }

    function resetSubmitButton() {
        submitBtn.querySelector('.spinner-border').style.display = 'none';
        submitBtn.disabled = false;
    }
});



console.log('[ReportJoke] Report Joke Modal script loaded');
