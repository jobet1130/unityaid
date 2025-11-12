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
            timeout: 5000,

            success: function (response, status, xhr) {
                console.group('Hero AJAX Response');
                console.log('HTTP Status:', xhr.status);
                console.log('Status Text:', status);
                console.log('Headers:', xhr.getAllResponseHeaders());
                console.log('Content-Type:', xhr.getResponseHeader('Content-Type'));
                console.log('Response Data:', response);
                console.groupEnd();

                // Validate Content-Type
                const contentType = xhr.getResponseHeader('Content-Type');
                if (contentType && !contentType.includes('application/json')) {
                    console.warn("Unexpected response format:", contentType);
                    displayHeroResponse('danger', 'Invalid response format from server.');
                    return;
                }

                // Validate response structure
                if (response && response.message) {
                    displayHeroResponse('success', response.message);
                } else if (response && response.error) {
                    displayHeroResponse('danger', response.error);
                } else {
                    console.warn("Unexpected JSON structure:", response);
                    console.warn("Expected: { \"message\": \"...\" } or { \"error\": \"...\" }");
                    displayHeroResponse('danger', 'Unexpected response from server.');
                }
            },

            error: function (xhr, status, error) {
                console.group('Hero AJAX Error');
                console.error('XHR Status:', xhr.status);
                console.error('Status Text:', status);
                console.error('Error Message:', error);
                console.error('Response Text:', xhr.responseText);
                console.error('Response JSON:', xhr.responseJSON);
                console.groupEnd();

                let errorMsg = `Status: ${status}, Error: ${error}`;
                
                // Check for JSON error response
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMsg = xhr.responseJSON.message;
                } else if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMsg = xhr.responseJSON.error;
                } else if (xhr.responseText) {
                    try {
                        const jsonResponse = JSON.parse(xhr.responseText);
                        if (jsonResponse.message) {
                            errorMsg = jsonResponse.message;
                        } else if (jsonResponse.error) {
                            errorMsg = jsonResponse.error;
                        }
                    } catch (e) {
                        // Not JSON, use response text
                        errorMsg += `, Response: ${xhr.responseText.substring(0, 100)}`;
                    }
                }
                
                displayHeroResponse('danger', errorMsg);
            },

            complete: function (xhr, status) {
                console.log('Hero AJAX Request Complete:', status);
                
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
