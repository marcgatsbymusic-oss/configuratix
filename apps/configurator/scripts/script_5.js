
    
        let movieGallery = null;
        function buttonMovie() {
            if (movieGallery === null) {
                const $dynamicGallery = document.getElementById('button-movie-hi');
                let props = getLightGaleryDefaultProps();
                props.dynamic = true;
                props.dynamicEl = [{
                    'video': {
                        "source": [
                            {"src": "/media/_upload/produkty/iglo-edge-slide/video/iglo_edge_slide-en-web.mp4", "type": "video/mp4"},
                            {"src": "/media/None", "type": "video/webm"}
                        ],
                        'attributes': {
                            'preload': false,
                            'controls': true
                        }

                    },
                    
                        'thumb': '/media/_upload/produkty/iglo-edge-slide/video/igloedgeslide-en-cover.jpg',
                    
                    'subHtml': 'IGLO EDGE SLIDE'
                }]
                movieGallery = lightGallery($dynamicGallery, props);
            }
            movieGallery.openGallery();
        }
    
