$(document).ready(function () {
    "use strict";

    // Highlight current page link
    function highlightActiveLink(page) {
        $(".nav-link").removeClass("active");
        $(".nav-link").each(function() {
            if ($(this).text().toLowerCase() === page.toLowerCase()) {
                $(this).addClass("active");
            }
        });
    }

    // AJAX page navigation
    window.navigateTo = function(page) {
        $.ajax({
            url: `/ajax/${page}/`,  // your Django JSON view
            method: "GET",
            dataType: "json",
            success: function(response) {
                handleJSONResponse(response);
            },
            error: function(jqXHR) {
                showToast(jqXHR.responseJSON?.message || "Failed to load page", "error");
            }
        });
    };

    function handleJSONResponse(response) {
        if (!response || typeof response !== "object") {
            showToast("Invalid server response", "error");
            return;
        }

        if (response.status === "success") {
            $("#main-content").html(response.html || "");
            highlightActiveLink(response.current_page || "");
            showToast(response.message || "Page loaded successfully", "success");
        } else {
            showToast(response.message || "Error loading page", "error");
        }
    }

    // Scroll effect for navbar
    $(window).on("scroll", function() {
        if ($(this).scrollTop() > 20) {
            $(".custom-navbar").addClass("scrolled");
        } else {
            $(".custom-navbar").removeClass("scrolled");
        }
    });

    // Toast function
    window.showToast = function(message, type="info") {
        const $toast = $(`<div class="toast-custom toast-${type}">${message}</div>`);
        $("body").append($toast);
        $toast.fadeIn();

        setTimeout(() => {
            $toast.fadeOut(400, function() { $(this).remove(); });
        }, 3000);
    };
});
