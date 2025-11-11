/**
 * @author: Jobet P. Casquejo
 * @description: JavaScript for handling AJAX interactions in the hero section.
 * @date: 2025-11-11
 * @version: 1.0.0
 */
$(document).ready(function() {

    /**
     * Get CSRF token from cookies
     * @param {string} name
     * @returns {string|null}
     */
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                cookie = cookie.trim();
                if (cookie.startsWith(name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    /**
     * Display AJAX response message in hero section
     * @param {string} type - "success" or "danger"
     * @param {string} message
     */
    function displayHeroResponse(type, message) {
        $('#hero-response').html(`<div class="alert alert-${type} mt-2">${message}</div>`);
    }

    /**
     * Handle AJAX hero button clicks
     * @param {jQuery} $button - the clicked button element
     * @param {string} btnType - "primary" or "secondary"
     * @param {string} btnLink - button href or data-href
     */
    function handleHeroClick($button, btnType, btnLink) {
        const originalHtml = $button.html(); // Save original button text
        $button.prop('disabled', true); // disable button
        $button.html(`<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Loading...`);

        $.ajax({
            url: '/hero-action',
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({ button: btnType, link: btnLink }),
            headers: { "X-CSRFToken": getCookie('csrftoken') },
            success: function(response) {
                displayHeroResponse('success', response.message);
            },
            error: function(xhr, status, error) {
                let errorMsg = `Status: ${status}, Error: ${error}`;
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMsg += `, Message: ${xhr.responseJSON.message}`;
                } else if (xhr.responseText) {
                    errorMsg += `, Response: ${xhr.responseText}`;
                }
                displayHeroResponse('danger', errorMsg);
            },
            complete: function() {
                // Restore button state
                $button.prop('disabled', false).html(originalHtml);
            }
        });
    }

    // Attach click listener to hero buttons
    $('.hero-btn').on('click', function(e) {
        e.preventDefault();
        const $btn = $(this);
        const btnType = $btn.data('btn'); // primary or secondary
        const btnLink = $btn.data('href') || $btn.attr('href'); // use data-href or fallback to href
        handleHeroClick($btn, btnType, btnLink);
    });

});
