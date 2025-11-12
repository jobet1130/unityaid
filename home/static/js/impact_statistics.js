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
     *      { "label": "Projects Completed", "number": 120, "suffix": "+" },
     *      { "label": "Lives Impacted", "number": 4500 }
     *   ]
     * }
     */
    window.updateImpactStats = function (url) {
        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            timeout: 5000,

            success: function (response, status, xhr) {
                console.group('Impact Statistics AJAX Response');
                console.log('HTTP Status:', xhr.status);
                console.log('Status Text:', status);
                console.log('Headers:', xhr.getAllResponseHeaders());
                console.log('Content-Type:', xhr.getResponseHeader('Content-Type'));
                console.log('Response Data:', response);
                console.groupEnd();

                // Use xhr: check headers and status code meaningfully
                const contentType = xhr.getResponseHeader('Content-Type');
                const serverStatus = xhr.status;

                if (contentType && !contentType.includes('application/json')) {
                    console.warn("Unexpected response format:", contentType);
                    console.warn("Expected: application/json");
                    return;
                }

                // Update stats if valid JSON
                if (response && response.stats && Array.isArray(response.stats)) {
                    response.stats.forEach(function (stat, idx) {
                        var $stat = $('.stat-number').eq(idx);
                        
                        if ($stat.length) {
                            const $numberValue = $stat.find('.stat-number-value');
                            const $targetEl = $numberValue.length > 0 ? $numberValue : $stat;
                            
                            // Update data attributes
                            $stat.data('count', stat.number || 0);
                            
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
                            $targetEl.text('0');
                            $stat.removeClass('animated');
                        }
                    });
                    
                    // Re-trigger animations
                    checkStatsInView();
                } else {
                    console.warn("No valid 'stats' field in response.");
                    console.warn("Expected: { \"stats\": [...] }");
                    console.warn("Received:", response);
                }
            },

            error: function (xhr, status, error) {
                console.group('Impact Statistics AJAX Error');
                console.error('XHR Status:', xhr.status);
                console.error('Status Text:', status);
                console.error('Error Message:', error);
                console.error('Response Text:', xhr.responseText);
                console.error('Response JSON:', xhr.responseJSON);
                console.groupEnd();

                // Use all three vars meaningfully
                const serverResponse = xhr.responseText || "No server response";
                const httpStatus = xhr.status;
                
                // Visual feedback
                const $toast = $('<div class="alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-3" role="alert" style="z-index: 9999;">' +
                    '<strong>Error:</strong> Failed to load impact statistics. ' +
                    '<span class="small">Status: ' + httpStatus + ', ' + status + '</span>' +
                    '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
                    '</div>');
                $('body').append($toast);

                setTimeout(function () {
                    $toast.alert('close');
                }, 5000);
            },

            complete: function (xhr, status) {
                console.log('Impact Statistics AJAX Request Complete:', status);
            }
        });
    };
});
