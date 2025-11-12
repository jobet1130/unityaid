/**
 * team_section.js
 * ----------------------
 * Handles fetching team members from the JSON API and rendering them into the team section.
 * Uses jQuery AJAX to fetch data and triggers custom events for further interaction.
 *
 * @fileOverview Handles dynamic rendering of team members via AJAX.
 * @author Jobet P. Casquejo
 * @date 11-12-2025
 * @version 1.0
 */

$(document).ready(function () {
    console.log("Team section initialized...");
  
    /**
     * Fetches team members from the JSON API and renders them in the team container.
     * 
     * @function fetchTeamMembers
     * @fires team:loaded
     */
    function fetchTeamMembers() {
      /**
       * AJAX request to retrieve team members.
       * @type {jQuery.jqXHR}
       */
      $.ajax({
        url: "/api/team/", // JSON endpoint
        type: "GET",
        dataType: "json",
        /**
         * Success callback for AJAX request
         * @param {Array<Object>} data - Array of team member objects
         * @param {string} data[].image - URL of the member's image
         * @param {string} data[].name - Full name of the member
         * @param {string} data[].role - Role or position of the member
         * @param {string} [data[].linkedIn] - Optional LinkedIn profile URL
         */
        success: function (data) {
          const container = $("#team-container");
          container.empty();
  
          data.forEach(member => {
            /**
             * HTML structure of a team member card
             * @type {string}
             */
            const card = `
              <div class="col-md-4 mb-4 team-member">
                <div class="card border-0 shadow team-card" data-name="${member.name}">
                  <div class="position-relative overflow-hidden">
                    <img src="${member.image}" class="card-img-top team-img" alt="${member.name}">
                    ${member.linkedIn ? `
                      <a href="${member.linkedIn}" target="_blank" class="btn btn-primary position-absolute top-0 end-0 m-3 linkedin-btn" aria-label="LinkedIn profile">
                        <i class="bi bi-linkedin"></i>
                      </a>` : ""}
                  </div>
                  <div class="card-body text-center">
                    <h5 class="card-title mb-1">${member.name}</h5>
                    <p class="card-text text-muted">${member.role}</p>
                  </div>
                </div>
              </div>
            `;
            container.append(card);
          });
  
          /**
           * Custom event triggered after all team members are rendered.
           * Other scripts (e.g., team_member.js) can listen to this event
           * to attach interactions such as hover effects or click handlers.
           *
           * @event team:loaded
           */
          $(document).trigger("team:loaded");
        },
        /**
         * Error callback for AJAX request
         * @param {jqXHR} xhr - jQuery XMLHttpRequest object
         * @param {string} status - Status string
         * @param {string} error - Error message
         */
        error: function (xhr, status, error) {
          console.error("Error loading team members:", error);
  
          $("#team-container").html(
            `<div class="col-12 text-center text-danger">Failed to load team members.</div>`
          );
        }
      });
    }
  
    // Call the fetch function when DOM is ready
    fetchTeamMembers();
  });
  