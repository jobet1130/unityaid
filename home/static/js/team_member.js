/**
 * team_member.js
 * ----------------------
 * Handles interactions, hover effects, and click events for individual team member cards.
 * Requires that the team cards are dynamically loaded.
 *
 * @fileOverview Manages team member card behaviors including hover effects, click tracking, and AJAX logging.
 * @author Jobet P. Casquejo
 * @date 11-12-2025
 * @version 1.1
 */

$(document).on("team:loaded", function () {
    console.log("Team members loaded — initializing interactions...");
  
    /**
     * Hover effect: elevate card and scale image on hover
     * Adds shadow and translates the card upward
     */
    $(".team-card").hover(
      /**
       * Mouse enter callback
       */
      function () {
        $(this).addClass("shadow-lg").css("transform", "translateY(-5px)");
      },
      /**
       * Mouse leave callback
       */
      function () {
        $(this).removeClass("shadow-lg").css("transform", "translateY(0)");
      }
    );
  
    /**
     * Click event: Track clicks for analytics or open modal
     * Sends member name to server via AJAX POST
     */
    $(".team-card").on("click", function () {
      const name = $(this).data("name");
      console.log("Clicked on team member:", name);
  
      /**
       * AJAX request to track click events
       * @type {jQuery.jqXHR}
       */
      $.ajax({
        url: "/api/track-click/",
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({ member: name }),
        /**
         * Success callback for click tracking
         * @param {Object} response - JSON response from server
         * @param {string} response.status - Status of the click tracking ('success', 'error')
         */
        success: function (response) {
          console.log(`Click tracked successfully for ${name}. Status: ${response.status}`);
        },
        /**
         * Error callback for click tracking
         * @param {jqXHR} xhr - jQuery XHR object
         * @param {string} status - Status text describing the type of error
         * @param {string} error - Optional exception object or error message
         */
        error: function (xhr, status, error) {
          console.error(`Failed to track click for ${name}. Status: ${status}`, xhr, error);
  
          // Optionally, show a user-friendly toast notification
          if (xhr.responseJSON && xhr.responseJSON.message) {
            alert(`Error: ${xhr.responseJSON.message}`);
          } else {
            alert("Failed to track click. Please try again.");
          }
        }
      });
    });
  });
  