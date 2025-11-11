/**
 * impact_statistics.js
 * ---------------------------------------------------
 * Handles dynamic stat animations and AJAX-based updates
 * for the Impact Statistics plugin section.
 *
 * Features:
 * - Animated number counters that trigger on scroll.
 * - AJAX refresh with xhr, status, and error handling.
 * - Uses xhr meaningfully for debugging and response validation.
 * ---------------------------------------------------
 * @author: Jobet P. Casquejo
 * @description: Handles dynamic stat animations and AJAX-based updates.
 * @date: 11-11-2025
 * @version: 1.0
 */

$(document).ready(function () {
    "use strict";

    /**
     * Animate numerical counters from 0 → data-count.
     */
    function animateStats() {
        $('.stat-number').each(function () {
            var $this = $(this);
            var countTo = parseInt($this.data('count'), 10) || 0;

            // Smooth counter animation
            $({ countNum: 0 }).animate(
                { countNum: countTo },
                {
                    duration: 2000,
                    easing: 'swing',
                    step: function () {
                        $this.text(Math.floor(this.countNum));
                    },
                    complete: function () {
                        $this.text(countTo);
                    }
                }
            );
        });
    }

    /**
     * Detect if an element is visible within the current viewport.
     */
    function isScrolledIntoView($elem) {
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();
        var elemTop = $elem.offset().top;
        var elemBottom = elemTop + $elem.height();
        return elemBottom <= docViewBottom && elemTop >= docViewTop;
    }

    /**
     * Check and trigger stats animation when in view.
     */
    function checkStatsInView() {
        $('.stat-number').each(function () {
            var $this = $(this);
            if (!$this.hasClass('animated') && isScrolledIntoView($this)) {
                $this.addClass('animated');
                animateStats();
            }
        });
    }

    // Run initially + on scroll
    $(window).on('scroll', checkStatsInView);
    checkStatsInView();

    /**
     * Dynamic AJAX stats update
     * Fetches new data and replays animations.
     *
     * @param {string} url - API endpoint returning JSON response
     * Example JSON:
     * {
     *   "stats": [
     *      { "label": "Projects Completed", "number": 120 },
     *      { "label": "Lives Impacted", "number": 4500 }
     *   ]
     * }
     */
    window.updateImpactStats = function (url) {
        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',

            success: function (response, status, xhr) {
                // Use xhr: check headers and status code meaningfully
                const contentType = xhr.getResponseHeader('Content-Type');
                const serverStatus = xhr.status;

                console.log(`AJAX Success [${serverStatus}]`);
                console.log(`Response Type: ${contentType}`);
                console.log("Status:", status);

                if (contentType && !contentType.includes('application/json')) {
                    console.warn("Unexpected response format:", contentType);
                    return;
                }

                // Update stats if valid JSON
                if (response.stats && Array.isArray(response.stats)) {
                    response.stats.forEach(function (stat, idx) {
                        var $stat = $('.stat-number').eq(idx);
                        $stat.data('count', stat.number);
                        $stat.text('0').removeClass('animated');
                    });
                    checkStatsInView();
                } else {
                    console.warn("No valid 'stats' field in response.");
                }
            },

            error: function (xhr, status, error) {
                // Use all three vars meaningfully
                const serverResponse = xhr.responseText || "No server response";
                const httpStatus = xhr.status;
                console.error(
                    `Impact Stats Fetch Failed: [${httpStatus}] ${status} - ${error}`
                );
                console.error("Server says:", serverResponse);
            }
        });
    };
});
