/**
 * @author: Jobet P. Casquejo
 * @description: JavaScript for handling footer interactions and AJAX newsletter subscription.
 * @date: 2025-11-11
 * @version: 1.0.0
 */
$(document).ready(function () {
    "use strict";

    /** ============================
     * SET CURRENT YEAR
     * ============================
     * Updates any element with ID 'current-year' to the current year dynamically.
     */
    const currentYearSpan = document.getElementById("current-year");
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    /** ============================
     * NEWSLETTER SUBSCRIPTION FORM
     * ============================
     * Handles AJAX submission of the newsletter form.
     * Sends email to the backend and shows success/error toast messages.
     */
    $("#newsletter-form").on("submit", function (e) {
        e.preventDefault(); // Prevent default form submission

        const $form = $(this);
        const $input = $form.find("input[name='email']");
        const $toast = $("#newsletter-toast");
        const email = $input.val(); // Get input value

        // Validate email format before sending
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            $toast
                .removeClass()
                .addClass("toast-error")
                .text("Please enter a valid email address.")
                .fadeIn(300)
                .delay(3000)
                .fadeOut(300);
            return;
        }

        // AJAX request to subscribe user
        $.ajax({
            url: "/newsletter/subscribe/", // Backend endpoint
            method: "POST",
            data: { email: email },
            dataType: "json",
            headers: { "X-CSRFToken": getCookie("csrftoken") }, // Django CSRF protection
            success: function (response) {
                // Handle successful subscription
                $toast
                    .removeClass()
                    .addClass("toast-success")
                    .text(response.message || "Subscribed successfully!")
                    .fadeIn(300)
                    .delay(3000)
                    .fadeOut(300);

                $input.val(""); // Clear the input field
            },
            error: function (xhr, status, error) {
                // Handle errors using xhr, status, error
                let errorMsg = xhr.responseJSON?.message || "Subscription failed.";
                errorMsg += ` (Status: ${status}, Error: ${error})`;

                $toast
                    .removeClass()
                    .addClass("toast-error")
                    .text(errorMsg)
                    .fadeIn(300)
                    .delay(3000)
                    .fadeOut(300);
            }
        });
    });

    /** ============================
     * HELPER FUNCTION: GET COOKIE
     * ============================
     * Retrieves the value of a named cookie.
     * Used for CSRF token retrieval in AJAX POST requests.
     * @param {string} name - The name of the cookie to retrieve.
     * @returns {string|null} - Cookie value or null if not found.
     */
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== "") {
            const cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === name + "=") {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
