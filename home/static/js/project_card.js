/**
 * project_card.js
 * ----------------------------------------------------
 * Handles:
 *   1. Project card click interactions
 *   2. Keyboard accessibility (Enter/Space keys)
 *   3. Hover effect enhancements
 *   4. Filtering by status (optional)
 *   5. AJAX-based dynamic updates (optional)
 *   6. Smooth animations and transitions
 * ----------------------------------------------------
 * @author: Jobet P. Casquejo
 * @description: project_card.js to handle project card interactions
 * @date: 11-11-2025
 * @version: 1.0
 */

$(document).ready(function () {
    "use strict";

    /**
     * Handle project card click
     * @param {jQuery} $card - The project card element
     */
    function handleCardClick($card) {
        const link = $card.data('link') || $card.find('.project-card-link').attr('href');
        
        if (link) {
            // Add loading state
            $card.addClass('project-card-loading');
            
            // Navigate to link
            window.location.href = link;
        }
    }

    /**
     * Initialize project card click handlers
     */
    function initializeCardClicks() {
        // Use event delegation to handle dynamically added cards
        $(document).off('click', '.project-card-clickable').on('click', '.project-card-clickable', function (e) {
            // Don't trigger if clicking on a link inside the card
            if ($(e.target).closest('.project-card-link').length === 0) {
                const $card = $(this);
                handleCardClick($card);
            }
        });

        // Handle "Learn more" link clicks
        $(document).off('click', '.project-card-link').on('click', '.project-card-link', function (e) {
            e.stopPropagation(); // Prevent card click
            const $card = $(this).closest('.project-card');
            if ($card.length) {
                handleCardClick($card);
            }
        });
    }

    /**
     * Initialize keyboard accessibility
     * Allows users to activate cards using Enter or Space keys
     */
    function initializeKeyboardAccessibility() {
        // Set tabindex for cards that don't have it
        $('.project-card-clickable').each(function () {
            if (!$(this).attr('tabindex')) {
                $(this).attr('tabindex', '0');
            }
        });

        // Use event delegation for keyboard events
        $(document).off('keydown', '.project-card-clickable').on('keydown', '.project-card-clickable', function (e) {
            // Enter or Space key
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const $card = $(this);
                handleCardClick($card);
            }
        });

        // Add focus styles
        $(document).off('focus blur', '.project-card-clickable')
            .on('focus', '.project-card-clickable', function () {
                $(this).addClass('project-card-focused');
            })
            .on('blur', '.project-card-clickable', function () {
                $(this).removeClass('project-card-focused');
            });
    }

    /**
     * Enhance hover effects with smooth transitions
     */
    function initializeHoverEffects() {
        $('.project-card').each(function () {
            const $card = $(this);
            const $image = $card.find('.project-card-image');
            const $link = $card.find('.project-card-link');
            const $arrow = $link.find('i');

            // Enhanced image hover effect
            $card.on('mouseenter', function () {
                if ($image.length) {
                    $image.css('transform', 'scale(1.1)');
                }
            }).on('mouseleave', function () {
                if ($image.length) {
                    $image.css('transform', 'scale(1)');
                }
            });

            // Enhanced link arrow animation
            if ($link.length && $arrow.length) {
                $card.on('mouseenter', function () {
                    $arrow.css('transform', 'translateX(4px)');
                }).on('mouseleave', function () {
                    $arrow.css('transform', 'translateX(0)');
                });
            }
        });
    }

    /**
     * Filter projects by status
     * @param {string} status - Status to filter by ('active', 'ongoing', 'completed', or 'all')
     */
    window.filterProjectsByStatus = function (status) {
        const $cards = $('.project-card');
        
        if (status === 'all') {
            $cards.fadeIn(300);
            return;
        }

        $cards.each(function () {
            const $card = $(this);
            const cardStatus = $card.find('.badge').text().toLowerCase().trim();
            
            if (cardStatus === status.toLowerCase()) {
                $card.fadeIn(300);
            } else {
                $card.fadeOut(300);
            }
        });
    };

    /**
     * Animate project cards on scroll (fade in effect)
     */
    function initializeScrollAnimation() {
        function isScrolledIntoView($elem) {
            const docViewTop = $(window).scrollTop();
            const docViewBottom = docViewTop + $(window).height();
            const elemTop = $elem.offset().top;
            const elemBottom = elemTop + $elem.height();

            return elemBottom <= docViewBottom && elemTop >= docViewTop - 100;
        }

        function checkCardsInView() {
            $('.project-card').each(function () {
                const $card = $(this);
                
                if (!$card.hasClass('project-card-animated') && isScrolledIntoView($card)) {
                    $card.addClass('project-card-animated');
                    $card.css({
                        'opacity': '0',
                        'transform': 'translateY(20px)'
                    }).animate({
                        'opacity': '1'
                    }, {
                        duration: 600,
                        step: function (now) {
                            $(this).css('transform', 'translateY(' + (20 * (1 - now)) + 'px)');
                        },
                        complete: function () {
                            $(this).css('transform', 'translateY(0)');
                        }
                    });
                }
            });
        }

        // Run on scroll and initially
        $(window).on('scroll', checkCardsInView);
        checkCardsInView();
    }

    /**
     * Update project cards dynamically using AJAX
     * @param {string} url - API endpoint returning JSON projects
     * Expected Response:
     * {
     *   "projects": [
     *     {
     *       "title": "Project Title",
     *       "location": "Location",
     *       "description": "Description",
     *       "status": "Active",
     *       "image": "image-url",
     *       "link": "project-link"
     *     }
     *   ]
     * }
     */
    window.updateProjectCards = function (url) {
        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            timeout: 5000,

            success: function (response, status, xhr) {
                console.group('Project Cards AJAX Response');
                console.log('HTTP Status:', xhr.status);
                console.log('Status Text:', status);
                console.log('Headers:', xhr.getAllResponseHeaders());
                console.log('Content-Type:', xhr.getResponseHeader('Content-Type'));
                console.log('Response Data:', response);
                console.groupEnd();

                // Validate Content-Type
                const contentType = xhr.getResponseHeader('Content-Type');
                if (contentType && !contentType.includes('application/json')) {
                    console.warn("Unexpected response format:", contentType);
                    console.warn("Expected: application/json");
                    return;
                }

                // Validate response structure
                if (response && Array.isArray(response.projects)) {
                    const $container = $('.project-cards-container');
                    
                    if ($container.length) {
                        // Clear existing cards
                        $container.empty();
                        
                        // Render new cards
                        response.projects.forEach(function (project) {
                            if (project.title && project.image) {
                                const statusClass = 'project-status-' + (project.status || 'active').toLowerCase();
                                const cardHtml = `
                                    <div class="card shadow-sm h-100 project-card project-card-clickable" data-link="${project.link || '#'}">
                                        <div class="position-relative overflow-hidden project-card-image-container">
                                            <img src="${project.image}" alt="${project.title}" class="card-img-top w-100 h-100 project-card-image" />
                                            <span class="badge rounded-pill position-absolute top-0 end-0 m-3 ${statusClass}">
                                                ${project.status || 'Active'}
                                            </span>
                                        </div>
                                        <div class="card-body d-flex flex-column">
                                            <div class="d-flex align-items-center text-secondary mb-2 small">
                                                <i class="bi bi-geo-alt-fill me-1"></i>
                                                <span>${project.location || ''}</span>
                                            </div>
                                            <h5 class="card-title mb-3 fw-bold">${project.title}</h5>
                                            <p class="card-text text-secondary mb-4 flex-grow-1 project-card-description">${project.description || ''}</p>
                                            ${project.link ? '<div class="d-flex align-items-center project-card-link"><span class="me-2">Learn more</span><i class="bi bi-arrow-right"></i></div>' : ''}
                                        </div>
                                    </div>
                                `;
                                $container.append(cardHtml);
                            }
                        });
                        
                        // Re-initialize for new cards
                        setTimeout(function () {
                            initializeCardClicks();
                            initializeKeyboardAccessibility();
                            initializeHoverEffects();
                            initializeScrollAnimation();
                        }, 100);
                    } else {
                        console.warn('Project cards container not found (.project-cards-container)');
                    }
                } else {
                    console.warn('Unexpected JSON structure:', response);
                    console.warn('Expected: { "projects": [...] }');
                }
            },

            error: function (xhr, status, error) {
                console.group('Project Cards AJAX Error');
                console.error('XHR Status:', xhr.status);
                console.error('Status Text:', status);
                console.error('Error Message:', error);
                console.error('Response Text:', xhr.responseText);
                console.error('Response JSON:', xhr.responseJSON);
                console.groupEnd();

                // Visual feedback
                const $toast = $('<div class="alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-3" role="alert" style="z-index: 9999;">' +
                    '<strong>Error:</strong> Failed to load projects. ' +
                    '<span class="small">Status: ' + xhr.status + ', ' + status + '</span>' +
                    '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
                    '</div>');
                $('body').append($toast);

                setTimeout(function () {
                    $toast.alert('close');
                }, 5000);
            },

            complete: function (xhr, status) {
                console.log('Project Cards AJAX Request Complete:', status);
            }
        });
    };

    /**
     * Initialize all project card functionality
     */
    function initialize() {
        initializeCardClicks();
        initializeKeyboardAccessibility();
        initializeHoverEffects();
        initializeScrollAnimation();
    }

    // Initialize on page load
    initialize();

    // Re-initialize for dynamically added cards using MutationObserver
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(function (mutations) {
            let shouldReinit = false;
            
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType === 1) { // Element node
                        if (node.classList && node.classList.contains('project-card')) {
                            shouldReinit = true;
                        } else if (node.querySelector && node.querySelector('.project-card')) {
                            shouldReinit = true;
                        }
                    }
                });
            });
            
            if (shouldReinit) {
                // Small delay to ensure DOM is ready
                setTimeout(function () {
                    initializeCardClicks();
                    initializeKeyboardAccessibility();
                    initializeHoverEffects();
                }, 100);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
});

