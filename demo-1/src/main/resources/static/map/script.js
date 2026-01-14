$(document).ready(function () {
    $('.building').on('click', function () {
        const lat = $(this).data('lat');
        const lng = $(this).data('lng');

        // Google Maps URL
        const mapUrl = `https://www.google.com/maps?q=${lat},${lng}&hl=ko&z=16&output=embed`;

        // Set the iframe src to Google Maps URL
        $('#google-map').attr('src', mapUrl);

        // Show the popup
        $('#map-popup').fadeIn();
    });

    // Close the popup
    $('#close-popup').on('click', function () {
        $('#map-popup').fadeOut();
        $('#google-map').attr('src', ''); // Clear iframe to stop loading
    });
});
