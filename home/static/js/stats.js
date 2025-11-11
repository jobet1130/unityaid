/**
 * stats.js
 * ----------------------------------------------------
 * Handles:
 *   1. Number counting animations
 *   2. Scroll-based trigger
 *   3. AJAX-based live updates
 *   4. Full xhr, status, and error handling
 * ----------------------------------------------------
 * @author: Jobet P. Casquejo
 * @description: stats.js to handle stats animations
 * @date: 11-11-2025
 * @version: 1.0
 */

$(document).ready(function () {
    "use strict";

    /**
     * Animate a single stat number from 0 → target value
     * @param {HTMLElement} el - The stat number element
     */
    function animateStat(el) {
        const $el = $(el);
        const target = parseInt($el.data("count"), 10);

        if (isNaN(target)) {
            console.warn("Invalid stat number:", $el);
            return;
        }

        $({ countNum: 0 }).animate(
            { countNum: target },
            {
                duration: 2000,
                easing: "swing",
                step: function () {
                    $el.text(Math.floor(this.countNum));
                },
                complete: function () {
                    $el.text(target.toLocaleString());
                },
            }
        );
    }

    /**
     * Check if an element is visible in the viewport
     * @param {jQuery} $elem - jQuery-wrapped element
     * @returns {boolean} - true if visible
     */
    function isScrolledIntoView($elem) {
        const docViewTop = $(window).scrollTop();
        const docViewBottom = docViewTop + $(window).height();
        const elemTop = $elem.offset().top;
        const elemBottom = elemTop + $elem.height();

        return elemBottom <= docViewBottom && elemTop >= docViewTop;
    }

    /**
     * Trigger animations for visible stats
     */
    function checkStatsInView() {
        $(".stat-number").each(function () {
            const $this = $(this);
            if (!$this.hasClass("animated") && isScrolledIntoView($this)) {
                $this.addClass("animated");
                animateStat(this);
            }
        });
    }

    // Run checks on scroll and on page load
    $(window).on("scroll", checkStatsInView);
    checkStatsInView();

    /**
     * Update stats dynamically using AJAX
     * @param {string} url - API endpoint returning JSON stats
     * Expected Response:
     * {
     *   "stats": [
     *     {"label": "Lives Reached", "number": 50000},
     *     {"label": "Meals Served", "number": 250000}
     *   ]
     * }
     */
    window.updateStats = function (url) {
        $.ajax({
            url: url,
            method: "GET",
            dataType: "json",

            success: function (response, status, xhr) {
                console.group("Stats AJAX Response");
                console.log("HTTP Status:", xhr.status);
                console.log("Status Text:", status);
                console.log("Headers:", xhr.getAllResponseHeaders());
                console.log("Response Data:", response);
                console.groupEnd();

                if (response && Array.isArray(response.stats)) {
                    response.stats.forEach(function (stat, idx) {
                        const $stat = $(".stat-number").eq(idx);
                        $stat
                            .data("count", stat.number)
                            .text("0")
                            .removeClass("animated");
                    });
                    checkStatsInView(); // re-trigger animations
                } else {
                    console.warn("Unexpected JSON structure:", response);
                }
            },

            error: function (xhr, status, error) {
                console.group("Stats AJAX Error");
                console.error("XHR Status:", xhr.status);
                console.error("Status Text:", status);
                console.error("Error Message:", error);
                console.error("Response Text:", xhr.responseText);
                console.groupEnd();

                // Optional visual feedback
                const $toast = $("<div class='toast-error'>Failed to load stats. Please try again.</div>");
                $("body").append($toast);
                $toast.fadeIn(300).delay(2500).fadeOut(500, function () {
                    $(this).remove();
                });
            },
        });
    };
});
