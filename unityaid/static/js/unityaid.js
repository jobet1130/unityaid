$(document).ready(function () {
    "use strict";

    // Initialization
    logActivity("UnityAid global script initialized.");

    // Initialize all global behaviors
    initNavbar();
    initSmoothScrolling();
    initFormHandling();
    initModalSystem();
    initScrollEnhancements();

    // Expose global utilities
    window.ajaxRequest = ajaxRequest;
    window.showToast = showToast;

    /**
     * =============================
     * 1. Navbar Behavior
     * =============================
     */
    function initNavbar() {
        const $navToggle = $(".nav-toggle");
        const $navMenu = $(".nav-menu");
        const $navbar = $(".navbar");

        $navToggle.on("click", function () {
            $navMenu.toggleClass("open");
            logActivity("Navbar toggled");
        });

        $(window).on(
            "scroll",
            debounce(function () {
                const isSticky = $(this).scrollTop() > 50;
                $navbar.toggleClass("sticky", isSticky);
                logActivity(`Navbar sticky state: ${isSticky}`);
            }, 50)
        );
    }

    /**
     * =============================
     * 2. Smooth Scrolling
     * =============================
     */
    function initSmoothScrolling() {
        $('a[href^="#"]').on("click", function (event) {
            const target = $(this).attr("href");
            if (target.length && $(target).length) {
                event.preventDefault();
                $("html, body").animate(
                    { scrollTop: $(target).offset().top },
                    800
                );
                logActivity(`Smooth scroll triggered to ${target}`);
            }
        });
    }

    /**
     * =============================
     * 3. Global AJAX Utility
     * =============================
     */
    function ajaxRequest(url, method, data, successCallback, errorCallback) {
        logActivity(`AJAX Request: ${method} ${url} | Data: ${JSON.stringify(data)}`);
        $.ajax({
            url: url,
            method: method,
            data: data,
            dataType: "json",
            success: function (response) {
                logActivity(`AJAX Success: ${JSON.stringify(response)}`);
                handleJSONResponse(response, successCallback);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                logActivity(`AJAX Error: ${textStatus} | ${errorThrown}`);
                if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                    showToast(jqXHR.responseJSON.message, "error");
                } else {
                    showToast("An unexpected error occurred.", "error");
                }

                if (typeof errorCallback === "function") {
                    errorCallback(jqXHR, textStatus, errorThrown);
                }
            },
        });
    }

    function handleJSONResponse(response, successCallback) {
        logActivity(`Handling JSON Response: ${JSON.stringify(response)}`);
        if (!response || typeof response !== "object") {
            showToast("Invalid server response.", "error");
            return;
        }

        if (response.status === "success") {
            if (typeof successCallback === "function") successCallback(response.data || {});
            showToast(response.message || "Success!", "success");
            logActivity(`JSON Response success: ${response.message}`);
        } else if (response.status === "error") {
            showToast(response.message || "An error occurred.", "error");
            logActivity(`JSON Response error: ${response.message}`);
        } else if (response.status === "warning") {
            showToast(response.message || "Warning from server.", "info");
            logActivity(`JSON Response warning: ${response.message}`);
        } else {
            showToast("Unknown response from server.", "error");
            logActivity(`JSON Response unknown: ${JSON.stringify(response)}`);
        }
    }

    /**
     * =============================
     * 4. Global Form Handling
     * =============================
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
                const $required = $form.find("[required]").filter(function () {
                    return !this.value.trim();
                });

                if ($required.length) {
                    $messageBox.text("Please fill out all required fields.").removeClass("success").addClass("error");
                    logActivity("Form validation failed: required fields missing");
                    return;
                }

                ajaxRequest(
                    actionUrl,
                    "POST",
                    formData,
                    function (data) {
                        $messageBox.text(data.message || "Form submitted successfully!").removeClass("error").addClass("success");
                        logActivity("Form submitted successfully: " + JSON.stringify(data));

                        if (data.redirect_url) {
                            logActivity(`Redirecting to: ${data.redirect_url}`);
                            setTimeout(function () {
                                window.location.href = data.redirect_url;
                            }, 1500);
                        }
                    },
                    function (jqXHR) {
                        const msg = jqXHR.responseJSON && jqXHR.responseJSON.message
                            ? jqXHR.responseJSON.message
                            : "Submission failed. Please retry.";
                        $messageBox.text(msg).removeClass("success").addClass("error");
                        logActivity("Form submission error: " + msg);
                    }
                );
            });
        });
    }

    /**
     * =============================
     * 5. Toast / Notification System
     * =============================
     */
    function showToast(message, type) {
        logActivity(`Toast displayed: ${message} | Type: ${type}`);
        const toastId = "toast-" + Date.now();
        const $toast = $(`
            <div id="${toastId}" class="toast ${type} fixed bottom-5 right-5 px-4 py-2 rounded-lg shadow-lg text-white text-sm z-50 opacity-0" role="alert" aria-live="polite">
                ${message}
            </div>
        `);

        $("body").append($toast);
        $toast.animate({ opacity: 1, bottom: "+=10" }, 200);

        setTimeout(function () {
            $toast.animate({ opacity: 0, bottom: "-=10" }, 300, function () {
                $toast.remove();
                logActivity(`Toast removed: ${message}`);
            });
        }, 3000);
    }

    /**
     * =============================
     * 6. Modal System
     * =============================
     */
    function initModalSystem() {
        const $modals = $(".modal");

        $(".open-modal").on("click", function () {
            const targetSelector = $(this).data("target");
            const $targetModal = $(targetSelector);

            if (!$targetModal.length) return;

            $targetModal.fadeIn();
            logActivity(`Modal opened: ${targetSelector}`);

            const ajaxUrl = $(this).data("url");
            const isAjax = $(this).data("ajax");

            if (isAjax && ajaxUrl) {
                ajaxRequest(ajaxUrl, "GET", {}, function (data) {
                    $targetModal.find(".modal-content").html(data.html || JSON.stringify(data));
                    logActivity(`Modal content loaded via AJAX: ${ajaxUrl}`);
                });
            }
        });

        $(".close-modal").on("click", function () {
            const $modal = $(this).closest(".modal");
            $modal.fadeOut();
            logActivity(`Modal closed`);
        });

        $modals.on("click", function (e) {
            if ($(e.target).hasClass("modal")) {
                $(this).fadeOut();
                logActivity(`Modal closed by background click`);
            }
        });
    }

    /**
     * =============================
     * 7. Scroll Enhancements
     * =============================
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
            logActivity("BackToTop clicked, scrolling to top");
        });
    }

    /**
     * =============================
     * 8. Utility Functions
     * =============================
     */
    function debounce(func, wait) {
        let timeout;
        return function () {
            const context = this,
                args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                func.apply(context, args);
            }, wait);
        };
    }

    function logActivity(message) {
        if (window.console) {
            console.log("UnityAid Log:", message);
        }
    }
});
