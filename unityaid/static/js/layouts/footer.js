$(document).ready(function() {
    // Set current year dynamically
    var currentYearSpan = document.getElementById("current-year");
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    $("#newsletter-form").on("submit", function(e) {
        e.preventDefault();
        var $form = $(this);
        var $input = $form.find("input[name='email']");
        var $toast = $("#newsletter-toast");
        var email = $input.val();

        $.ajax({
            url: "/newsletter/subscribe/", // Backend endpoint
            method: "POST",
            data: { email: email },
            dataType: "json",
            success: function(response) {
                $toast.removeClass().addClass("toast-success").text(response.message || "Subscribed successfully!").fadeIn(300).delay(3000).fadeOut(300);
                $input.val('');
            },
            error: function(xhr) {
                $toast.removeClass().addClass("toast-error").text(xhr.responseJSON?.message || "Subscription failed.").fadeIn(300).delay(3000).fadeOut(300);
            }
        });
    });
});