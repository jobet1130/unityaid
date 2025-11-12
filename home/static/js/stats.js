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
        const $numberValue = $el.find('.stat-number-value');
        const target = parseInt($el.data("count"), 10);

        if (isNaN(target)) {
            console.warn("Invalid stat number:", $el);
            return;
        }

        // If no .stat-number-value span exists, fall back to updating the element itself
        const $targetEl = $numberValue.length > 0 ? $numberValue : $el;

        $({ countNum: 0 }).animate(
            { countNum: target },
            {
                duration: 2000,
                easing: "swing",
                step: function () {
                    $targetEl.text(Math.floor(this.countNum).toLocaleString());
                },
                complete: function () {
                    $targetEl.text(target.toLocaleString());
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
     *     {"label": "Lives Reached", "number": 50000, "suffix": "+"},
     *     {"label": "Meals Served", "number": 250000}
     *   ]
     * }
     */
    window.updateStats = function (url) {
        $.ajax({
            url: url,
            method: "GET",
            dataType: "json",
            timeout: 5000,

            success: function (response, status, xhr) {
                console.group("Stats AJAX Response");
                console.log("HTTP Status:", xhr.status);
                console.log("Status Text:", status);
                console.log("Headers:", xhr.getAllResponseHeaders());
                console.log("Content-Type:", xhr.getResponseHeader('Content-Type'));
                console.log("Response Data:", response);
                console.groupEnd();

                // Validate Content-Type
                const contentType = xhr.getResponseHeader('Content-Type');
                if (contentType && !contentType.includes('application/json')) {
                    console.warn("Unexpected response format:", contentType);
                    return;
                }

                // Validate response structure
                if (response && Array.isArray(response.stats)) {
                    response.stats.forEach(function (stat, idx) {
                        const $stat = $(".stat-number").eq(idx);
                        
                        if ($stat.length) {
                            const $numberValue = $stat.find('.stat-number-value');
                            const $targetEl = $numberValue.length > 0 ? $numberValue : $stat;
                            
                            // Update data attributes
                            $stat.data("count", stat.number || 0);
                            
                            // Update suffix if provided
                            if (stat.suffix !== undefined) {
                                const $suffix = $stat.find('.stat-suffix');
                                if (stat.suffix) {
                                    if ($suffix.length) {
                                        $suffix.text(stat.suffix);
                                    } else {
                                        $stat.append('<span class="stat-suffix">' + stat.suffix + '</span>');
                                    }
                                } else {
                                    $suffix.remove();
                                }
                            }
                            
                            // Update label if provided
                            if (stat.label) {
                                const $label = $stat.closest('.stat-card').find('.stat-label');
                                if ($label.length) {
                                    $label.text(stat.label);
                                }
                            }
                            
                            // Reset animation
                            $stat.removeClass("animated");
                            $targetEl.text("0");
                        }
                    });
                    
                    // Re-trigger animations
                    checkStatsInView();
                } else {
                    console.warn("Unexpected JSON structure:", response);
                    console.warn("Expected: { \"stats\": [...] }");
                }
            },

            error: function (xhr, status, error) {
                console.group("Stats AJAX Error");
                console.error("XHR Status:", xhr.status);
                console.error("Status Text:", status);
                console.error("Error Message:", error);
                console.error("Response Text:", xhr.responseText);
                console.error("Response JSON:", xhr.responseJSON);
                console.groupEnd();

                // Visual feedback with Bootstrap alert
                const $toast = $('<div class="alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-3" role="alert" style="z-index: 9999;">' +
                    '<strong>Error:</strong> Failed to load stats. ' +
                    '<span class="small">Status: ' + xhr.status + ', ' + status + '</span>' +
                    '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
                    '</div>');
                $('body').append($toast);

                setTimeout(function () {
                    $toast.alert('close');
                }, 5000);
            },

            complete: function (xhr, status) {
                console.log("Stats AJAX Request Complete:", status);
            }
        });
    };
});
