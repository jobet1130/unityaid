/**
 * @author: Jobet P. Casquejo
 * @description: JavaScript for handling navbar interactions and AJAX page navigation.
 * @date: 2025-11-11
 * @version: 1.0.0
 */
$(document).ready(function () {
    "use strict";

    /** ============================
     * NAVBAR LINK HIGHLIGHT
     * ============================
     * Highlights the active navbar link based on the current page.
     * @param {string} page - The page name to highlight (e.g., 'home', 'about').
     */
    function highlightActiveLink(page) {
        $(".nav-link").removeClass("active"); // Remove all previous active states
        $(".nav-link").each(function() {
            const linkText = $(this).text().trim().toLowerCase();
            if (linkText === page.toLowerCase()) {
                $(this).addClass("active");
            }
        });
    }

    /** ============================
     * TOAST NOTIFICATION SYSTEM
     * ============================
     * Displays temporary toast notifications.
     * @param {string} message - The message to display.
     * @param {string} type - Type of toast: 'success', 'error', 'info'. Default: 'info'.
     */
    window.showToast = function(message, type = "info") {
        const $toast = $(`<div class="toast-custom toast-${type}">${message}</div>`);
        $("body").append($toast);
        $toast.fadeIn(200); // Fade in smoothly

        // Automatically remove after 3 seconds
        setTimeout(() => {
            $toast.fadeOut(400, function() {
                $(this).remove();
            });
        }, 3000);
    };

    /** ============================
     * HANDLE JSON RESPONSE
     * ============================
     * Processes JSON responses returned from AJAX requests.
     * @param {object} response - JSON response from server.
     */
    function handleJSONResponse(response) {
        // Validate response
        if (!response || typeof response !== "object") {
            showToast("Invalid server response", "error");
            return;
        }

        // Handle success or error
        if (response.status === "success") {
            $("#main-content").html(response.html || ""); // Inject HTML
            highlightActiveLink(response.current_page || ""); // Highlight active page link
            showToast(response.message || "Page loaded successfully", "success"); // Show success toast
        } else {
            showToast(response.message || "Error loading page", "error"); // Show error toast
        }
    }

    /** ============================
     * AJAX PAGE NAVIGATION
     * ============================
     * Loads page content dynamically using AJAX and updates the main content container.
     * @param {string} page - The page to navigate to (e.g., 'home', 'projects').
     */
    window.navigateTo = function(page) {
        $.ajax({
            url: `/ajax/${page}/`,        // Django JSON view endpoint
            method: "GET",
            dataType: "json",
            timeout: 5000,               // Timeout after 5 seconds
            success: function(response) {
                handleJSONResponse(response);
            },
            error: function(xhr, status, error) {
                // Detailed error handling using xhr, status, and error
                let errorMsg = `AJAX request failed. Status: ${status}, Error: ${error}`;
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMsg += `, Message: ${xhr.responseJSON.message}`;
                }
                showToast(errorMsg, "error");
            }
        });
    };

    /** ============================
     * NAVBAR SCROLL EFFECT
     * ============================
     * Adds or removes 'scrolled' class on the navbar when the page is scrolled.
     * Used to change background, shadow, or style when scrolling.
     */
    $(window).on("scroll", function() {
        const scrollTop = $(this).scrollTop();
        $(".custom-navbar").toggleClass("scrolled", scrollTop > 20);
    });

    /** ============================
     * INITIAL PAGE LOAD
     * ============================
     * Optional: Highlight the current page link on page load
     * by reading a data attribute from the <body> tag.
     * Example: <body data-current-page="home">
     */
    const currentPage = $("body").data("current-page");
    if (currentPage) {
        highlightActiveLink(currentPage);
    }

});
