
    function initColorSelectorButtons() {
        $(".color-rec").click(function () {
            $(".color-rec").removeClass("active");
            $(this).addClass("active");

            const colorRec = $(this);

            $(".product-loader").fadeTo(200, 1, function () {
                $(".color-sample-background").css({"background-image": "url(" + colorRec.data("color-bg") + ")"});
                const colorName = colorRec.data("color-name");
                const colorCode = colorRec.data("color-code");
                changePresenterImage(colorRec); // define in right partial depends on type

                $(".color-sample-background>.color-name>.name").html(colorName);
                $(".color-sample-background>.color-name>.number").html(colorCode);
            });

            
            
            
            
            
            
            
            
            
            
            
            
            

        });

        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        
            
        

    }

    init_methods.push(initColorSelectorButtons);
