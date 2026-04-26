
    function changePresenterImage(button) {
        const imgSrc = button.data("color-img");
        var i = new Image();
        i.onload = function () {
            $("#color-presenter-image").attr('src', imgSrc);
            $(".product-loader").fadeTo(200, 0);
        }
        i.src = imgSrc;
    }
