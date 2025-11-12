/**
 * section_header.js
 * ----------------------------------------------------
 * Handles:
 *   1. Animated underline effect on scroll
 *   2. Dynamic subtitle text animations
 *   3. Responsive adjustments
 *   4. Intersection Observer for fade-in effects
 * ----------------------------------------------------
 * @author: Jobet P. Casquejo
 * @description: section_header.js to handle section header animations
 * @date: 11-11-2025
 * @version: 1.0
 */

$(document).ready(function () {
    "use strict";

    /**
     * Animate underline on scroll into view
     */
    function initializeUnderlineAnimation() {
        function isScrolledIntoView($elem) {
            const docViewTop = $(window).scrollTop();
            const docViewBottom = docViewTop + $(window).height();
            const elemTop = $elem.offset().top;
            const elemBottom = elemTop + $elem.height();

            return elemBottom <= docViewBottom && elemTop >= docViewTop - 100;
        }

        function animateUnderline() {
            $('.section-header').each(function () {
                const $header = $(this);
                const $underline = $header.find('.section-header-underline');

                if (!$header.hasClass('section-header-animated') && isScrolledIntoView($header)) {
                    $header.addClass('section-header-animated');

                    // Animate underline from left to right
                    $underline.css({
                        'width': '0',
                        'opacity': '0'
                    }).animate({
                        'width': '100%',
                        'opacity': '1'
                    }, {
                        duration: 800,
                        easing: 'swing'
                    });

                    // Animate title fade-in
                    $header.find('.section-header-title').css({
                        'opacity': '0',
                        'transform': 'translateY(-10px)'
                    }).animate({
                        'opacity': '1'
                    }, {
                        duration: 600,
                        step: function (now) {
                            $(this).css('transform', 'translateY(' + (-10 * (1 - now)) + 'px)');
                        },
                        complete: function () {
                            $(this).css('transform', 'translateY(0)');
                        }
                    });

                    // Animate subtitle fade-in
                    const $subtitle = $header.find('.section-header-subtitle');
                    if ($subtitle.length) {
                        $subtitle.css({
                            'opacity': '0',
                            'transform': 'translateY(10px)'
                        }).delay(200).animate({
                            'opacity': '1'
                        }, {
                            duration: 600,
                            step: function (now) {
                                $(this).css('transform', 'translateY(' + (10 * (1 - now)) + 'px)');
                            },
                            complete: function () {
                                $(this).css('transform', 'translateY(0)');
                            }
                        });
                    }
                }
            });
        }

        // Run on scroll and initially
        $(window).on('scroll', animateUnderline);
        animateUnderline();
    }

    /**
     * Initialize intersection observer for better performance (if available)
     */
    function initializeIntersectionObserver() {
        if (typeof IntersectionObserver !== 'undefined') {
            const observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        const $header = $(entry.target);
                        const $underline = $header.find('.section-header-underline');

                        if (!$header.hasClass('section-header-animated')) {
                            $header.addClass('section-header-animated');

                            // Animate underline
                            $underline.css({
                                'width': '0',
                                'opacity': '0'
                            }).animate({
                                'width': '100%',
                                'opacity': '1'
                            }, {
                                duration: 800,
                                easing: 'swing'
                            });

                            // Animate title
                            $header.find('.section-header-title').css({
                                'opacity': '0',
                                'transform': 'translateY(-10px)'
                            }).animate({
                                'opacity': '1'
                            }, {
                                duration: 600,
                                step: function (now) {
                                    $(this).css('transform', 'translateY(' + (-10 * (1 - now)) + 'px)');
                                },
                                complete: function () {
                                    $(this).css('transform', 'translateY(0)');
                                }
                            });

                            // Animate subtitle
                            const $subtitle = $header.find('.section-header-subtitle');
                            if ($subtitle.length) {
                                $subtitle.css({
                                    'opacity': '0',
                                    'transform': 'translateY(10px)'
                                }).delay(200).animate({
                                    'opacity': '1'
                                }, {
                                    duration: 600,
                                    step: function (now) {
                                        $(this).css('transform', 'translateY(' + (10 * (1 - now)) + 'px)');
                                    },
                                    complete: function () {
                                        $(this).css('transform', 'translateY(0)');
                                    }
                                });
                            }
                        }
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            });

            // Observe all section headers
            $('.section-header').each(function () {
                observer.observe(this);
            });
        }
    }

    /**
     * Handle responsive adjustments
     */
    function initializeResponsiveAdjustments() {
        function adjustForMobile() {
            if ($(window).width() <= 768) {
                $('.section-header').addClass('section-header-mobile');
            } else {
                $('.section-header').removeClass('section-header-mobile');
            }
        }

        $(window).on('resize', adjustForMobile);
        adjustForMobile();
    }

    /**
     * Update section headers dynamically using AJAX
     * @param {string} url - API endpoint returning JSON section headers
     * Expected Response:
     * {
     *   "headers": [
     *     {
     *       "title": "Section Title",
     *       "subtitle": "Section Subtitle",
     *       "centered": true
     *     }
     *   ]
     * }
     */
    window.updateSectionHeaders = function (url) {
        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            timeout: 5000,

            success: function (response, status, xhr) {
                console.group('Section Headers AJAX Response');
                console.log('HTTP Status:', xhr.status);
                console.log('Status Text:', status);
                console.log('Headers:', xhr.getAllResponseHeaders());
                console.log('Content-Type:', xhr.getResponseHeader('Content-Type'));
                console.log('Response Data:', response);
                console.groupEnd();

                // Validate response structure
                if (response && Array.isArray(response.headers)) {
                    response.headers.forEach(function (header, idx) {
                        const $header = $('.section-header').eq(idx);
                        
                        if ($header.length && header.title) {
                            // Update title
                            $header.find('.section-header-title').text(header.title);
                            
                            // Update subtitle
                            const $subtitle = $header.find('.section-header-subtitle');
                            if (header.subtitle) {
                                if ($subtitle.length) {
                                    $subtitle.text(header.subtitle).show();
                                } else {
                                    $header.append(`<p class="section-header-subtitle${header.centered ? ' mx-auto' : ''}">${header.subtitle}</p>`);
                                }
                            } else {
                                $subtitle.hide();
                            }
                            
                            // Update centered state
                            if (header.centered) {
                                $header.addClass('text-center');
                            } else {
                                $header.removeClass('text-center');
                            }
                            
                            // Re-animate if not already animated
                            if (!$header.hasClass('section-header-animated')) {
                                const $underline = $header.find('.section-header-underline');
                                $underline.css({
                                    'width': '0',
                                    'opacity': '0'
                                }).animate({
                                    'width': '100%',
                                    'opacity': '1'
                                }, {
                                    duration: 800,
                                    easing: 'swing'
                                });
                                $header.addClass('section-header-animated');
                            }
                        }
                    });
                } else {
                    console.warn('Unexpected JSON structure:', response);
                    console.warn('Expected: { "headers": [...] }');
                }
            },

            error: function (xhr, status, error) {
                console.group('Section Headers AJAX Error');
                console.error('XHR Status:', xhr.status);
                console.error('Status Text:', status);
                console.error('Error Message:', error);
                console.error('Response Text:', xhr.responseText);
                console.error('Response JSON:', xhr.responseJSON);
                console.groupEnd();

                // Visual feedback
                const $toast = $('<div class="alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-3" role="alert" style="z-index: 9999;">' +
                    '<strong>Error:</strong> Failed to load section headers. ' +
                    '<span class="small">Status: ' + xhr.status + ', ' + status + '</span>' +
                    '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
                    '</div>');
                $('body').append($toast);

                setTimeout(function () {
                    $toast.alert('close');
                }, 5000);
            },

            complete: function (xhr, status) {
                console.log('Section Headers AJAX Request Complete:', status);
            }
        });
    };

    /**
     * Initialize all section header functionality
     */
    function initialize() {
        // Use IntersectionObserver if available, otherwise fall back to scroll
        if (typeof IntersectionObserver !== 'undefined') {
            initializeIntersectionObserver();
        } else {
            initializeUnderlineAnimation();
        }

        initializeResponsiveAdjustments();
    }

    // Initialize on page load
    initialize();

    // Re-initialize for dynamically added headers
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(function (mutations) {
            let shouldReinit = false;

            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType === 1) { // Element node
                        if (node.classList && node.classList.contains('section-header')) {
                            shouldReinit = true;
                        } else if (node.querySelector && node.querySelector('.section-header')) {
                            shouldReinit = true;
                        }
                    }
                });
            });

            if (shouldReinit) {
                setTimeout(function () {
                    if (typeof IntersectionObserver !== 'undefined') {
                        initializeIntersectionObserver();
                    } else {
                        initializeUnderlineAnimation();
                    }
                }, 100);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
});

