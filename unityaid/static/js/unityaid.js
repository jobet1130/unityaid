/**
 * unityaid.global.js
 * =======================================================
 * Global JavaScript file for UnityAid front-end interactivity.
 *
 * Features:
 *  - Sticky navbar and smooth scrolling
 *  - AJAX utility with full JSON schema handling
 *  - Universal form handler with validation
 *  - Toast notification system
 *  - Dynamic modal content (AJAX optional)
 *  - Scroll enhancements (Back-to-Top button)
 *  - Centralized activity logging
 *
 * @author Jobet P. Casquejo
 * @version: 2.1
 * @date: 11-11-2025
 * =======================================================
 */

$(document).ready(function () {
    "use strict";

    logActivity("✅ UnityAid global script initialized.");

    // Initialize all site-wide components
    initNavbar();
    initSmoothScrolling();
    initFormHandling();
    initModalSystem();
    initScrollEnhancements();

    // Expose global utilities
    window.ajaxRequest = ajaxRequest;
    window.showToast = showToast;

    /* =======================================================
     * 1. Navbar Behavior
     * =======================================================
     */
    /**
     * Initializes sticky navbar and toggle menu behavior.
     */
    function initNavbar() {
        const $navToggle = $(".nav-toggle");
        const $navMenu = $(".nav-menu");
        const $navbar = $(".navbar");

        // Mobile nav toggle
        $navToggle.on("click", function () {
            $navMenu.toggleClass("open");
            logActivity("Navbar toggled");
        });

        // Sticky navbar effect
        $(window).on(
            "scroll",
            debounce(function () {
                const isSticky = $(this).scrollTop() > 50;
                $navbar.toggleClass("sticky", isSticky);
                logActivity(`Navbar sticky state: ${isSticky}`);
            }, 50)
        );
    }

    /* =======================================================
     * 2. Smooth Scrolling
     * =======================================================
     */
    /**
     * Enables smooth scrolling for anchor links.
     */
    function initSmoothScrolling() {
        $('a[href^="#"]').on("click", function (event) {
            const target = $(this).attr("href");
            if (target && $(target).length) {
                event.preventDefault();
                $("html, body").animate({ scrollTop: $(target).offset().top }, 800);
                logActivity(`Smooth scroll triggered to ${target}`);
            }
        });
    }

    /* =======================================================
     * 3. Global AJAX Utility
     * =======================================================
     */
    /**
     * Sends an AJAX request and handles structured JSON responses.
     *
     * @param {string} url - The endpoint URL.
     * @param {string} method - HTTP method (GET, POST, etc.)
     * @param {Object|string} data - Data payload for the request.
     * @param {function} successCallback - Callback on success.
     * @param {function} errorCallback - Callback on error.
     */
    function ajaxRequest(url, method, data, successCallback, errorCallback) {
        logActivity(`AJAX Request: ${method} ${url} | Data: ${JSON.stringify(data)}`);

        $.ajax({
            url: url,
            method: method,
            data: data,
            dataType: "json",

            success: function (response, status, xhr) {
                const contentType = xhr.getResponseHeader("Content-Type");
                logActivity(`AJAX Success [${xhr.status}] | Type: ${contentType}`);

                // Validate response format
                if (contentType && !contentType.includes("application/json")) {
                    showToast("Unexpected response format from server.", "warning");
                    logActivity(`Unexpected Content-Type: ${contentType}`);
                    return;
                }

                handleJSONResponse(response, successCallback);
            },

            error: function (xhr, status, errorThrown) {
                const serverMsg =
                    xhr.responseJSON?.message ||
                    xhr.responseText ||
                    "Server did not provide details.";

                logActivity(`AJAX Error [${xhr.status}] ${status} | ${errorThrown}`);
                showToast(serverMsg, "error");

                if (typeof errorCallback === "function") {
                    errorCallback(xhr, status, errorThrown);
                }
            },
        });
    }

    /**
     * Handles standardized JSON response from the backend.
     *
     * Expected JSON schema:
     * {
     *   "status": "success" | "error" | "warning",
     *   "message": "string",
     *   "data": { ... } | null,
     *   "redirect_url": "string" | null
     * }
     */
    function handleJSONResponse(response, successCallback) {
        logActivity(`Handling JSON Response: ${JSON.stringify(response)}`);

        if (!response || typeof response !== "object") {
            showToast("Invalid or empty server response.", "error");
            return;
        }

        const status = response.status || "unknown";
        const message = response.message || "No message provided.";

        switch (status) {
            case "success":
                showToast(message, "success");
                if (typeof successCallback === "function") successCallback(response.data || {});
                logActivity(`Success: ${message}`);
                break;

            case "error":
                showToast(message, "error");
                logActivity(`Error: ${message}`);
                break;

            case "warning":
                showToast(message, "warning");
                logActivity(`Warning: ${message}`);
                break;

            default:
                showToast("Unknown response status.", "error");
                logActivity(`Unknown response: ${JSON.stringify(response)}`);
        }

        // Optional redirect
        if (response.redirect_url) {
            logActivity(`Redirecting to: ${response.redirect_url}`);
            setTimeout(() => (window.location.href = response.redirect_url), 1500);
        }
    }

    /* =======================================================
     * 4. Global Form Handling
     * =======================================================
     */
    /**
     * Automatically handles forms with class `.ajax-form`.
     * Includes validation, AJAX submission, and message display.
     */
    function initFormHandling() {
        $(".ajax-form").each(function () {
            const $form = $(this);
            const $messageBox = $form.find(".form-message");

            $form.on("submit", function (event) {
                event.preventDefault();
                const formData = $form.serialize();
                const actionUrl = $form.attr("action");

                // Validate required fields
                const missingFields = $form
                    .find("[required]")
                    .filter(function () {
                        return !this.value.trim();
                    });

                if (missingFields.length) {
                    $messageBox
                        .text("Please fill out all required fields.")
                        .removeClass("success")
                        .addClass("error");
                    logActivity("Form validation failed (required fields missing)");
                    return;
                }

                ajaxRequest(
                    actionUrl,
                    "POST",
                    formData,
                    function (data) {
                        $messageBox
                            .text(data.message || "Form submitted successfully!")
                            .removeClass("error")
                            .addClass("success");

                        logActivity("Form submitted successfully: " + JSON.stringify(data));
                    },
                    function (xhr) {
                        const msg =
                            xhr.responseJSON?.message ||
                            "Submission failed. Please try again later.";
                        $messageBox.text(msg).removeClass("success").addClass("error");
                        logActivity("Form submission error: " + msg);
                    }
                );
            });
        });
    }

    /* =======================================================
     * 5. Toast / Notification System
     * =======================================================
     */
    /**
     * Displays a transient toast notification.
     *
     * @param {string} message - The message to display.
     * @param {"success"|"error"|"warning"|"info"} [type="info"] - Type of toast.
     */
    function showToast(message, type = "info") {
        logActivity(`Toast: ${message} | Type: ${type}`);

        const toastId = `toast-${Date.now()}`;
        const $toast = $(`
            <div id="${toastId}" class="toast toast-${type} fixed bottom-5 right-5 px-4 py-2 rounded-lg shadow-lg text-white text-sm z-50 opacity-0" role="alert" aria-live="polite">
                ${message}
            </div>
        `);

        $("body").append($toast);
        $toast.animate({ opacity: 1, bottom: "+=10" }, 200);

        setTimeout(() => {
            $toast.animate({ opacity: 0, bottom: "-=10" }, 300, () => $toast.remove());
        }, 3000);
    }

    /* =======================================================
     * 6. Modal System
     * =======================================================
     */
    /**
     * Initializes modal open/close logic with optional AJAX content loading.
     */
    function initModalSystem() {
        const $modals = $(".modal");

        $(".open-modal").on("click", function () {
            const targetSelector = $(this).data("target");
            const $modal = $(targetSelector);

            if (!$modal.length) return;

            $modal.fadeIn();
            logActivity(`🪟 Modal opened: ${targetSelector}`);

            const ajaxUrl = $(this).data("url");
            const useAjax = $(this).data("ajax");

            if (useAjax && ajaxUrl) {
                ajaxRequest(ajaxUrl, "GET", {}, function (data) {
                    $modal.find(".modal-content").html(data.html || "No content received.");
                    logActivity(`Modal content loaded from ${ajaxUrl}`);
                });
            }
        });

        $(".close-modal").on("click", function () {
            $(this).closest(".modal").fadeOut();
            logActivity("Modal closed");
        });

        // Close modal on backdrop click
        $modals.on("click", function (e) {
            if ($(e.target).hasClass("modal")) {
                $(this).fadeOut();
                logActivity("Modal closed via background click");
            }
        });
    }

    /* =======================================================
     * 7. Scroll Enhancements
     * =======================================================
     */
    /**
     * Adds back-to-top button functionality.
     */
    function initScrollEnhancements() {
        const $backToTop = $("#backToTop");
        if (!$backToTop.length) return;

        $backToTop.hide();

        $(window).on(
            "scroll",
            debounce(function () {
                const show = $(this).scrollTop() > 100;
                $backToTop.toggle(show);
                logActivity(`BackToTop visibility: ${show}`);
            }, 100)
        );

        $backToTop.on("click", function () {
            $("html, body").animate({ scrollTop: 0 }, 800);
            logActivity("🏁 BackToTop clicked: scrolling to top");
        });
    }

    /* =======================================================
     * 8. Utility Functions
     * =======================================================
     */
    function debounce(func, wait) {
        let timeout;
        return function () {
            const context = this,
                args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    /**
     * Logs messages to console in structured format.
     * @param {string} message
     */
    function logActivity(message) {
        if (window.console) {
            console.log(`[UnityAid] ${new Date().toISOString()} → ${message}`);
        }
    }
});
