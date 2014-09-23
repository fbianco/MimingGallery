// Copyright © 2014 François Bianco <francois.bianco@skadi.ch>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
// See COPYING file for the full license.

(function($) {

    $.fn.extend({

        MimingGallery: function(options) {
            var defaults = {
            compressed: false,
            };
            var settings = $.extend( {}, defaults, options );
            var compressed = settings.compressed;

            var loading;
            var help;
            var message;
            var img;
            var thumbnails;
            var menu;
            var menubutton;
            var images; // list of images
            var index = 0; // current image index

            $( document ).ajaxError(function( event, request, settings ) {
                message.html("<div class='error'>An ajax error occured</div>");
                message.slideDown();
            });

            function MenuButton (svg, text, click) {
                var button = $("<li />");
                var icon;
                if (compressed) {
                    icon = $("#icon_"+svg);
                } else {
                    icon = $("<img src='svg/"+svg+".svg' class='icon' />");
                }
                button.append(icon);
                button.append("<span>"+text+"</span>");
                button.click(click);
                button.mouseover(function() {icon.css("opacity",1);});
                button.mouseout(function() {icon.css("opacity",0.5);});
                return button;
            }

            function toggleHelp () {
                help.slideToggle();
            }

            function toggleMessage () {
                message.slideToggle();
            }

            function toggleMenu () {
                menu.slideToggle();
                menubutton.fadeToggle();
                help.slideUp();
                message.slideUp();
            }

            function getZip () {
                message.html("Generating zip file, this might take a while.\
                              <br />Download will start automatically when the\
                              file is ready.");
                message.slideDown();
                $.ajax("#", {
                        "data":{"createzip":true},
                        "type":"POST",
                        success: function(data) { // PHP send back a JSON string with ZIP tempfile name
                            message.slideUp();
                            window.location.replace("?zip="+data.zip);
                            },
                        error: function() {
                                message.html("<div class='error'>Impossible to create zip file.</div>");
                                message.slideDown(0);
                                },
                        });
            }

            function Menu () {
                if (compressed) {
                    menubutton = $("#icon_menu").clone();
                    menubutton.attr("id","menubutton"); // avoid id duplication
                } else {
                    menubutton = $("<img src='svg/menu.svg' class='icon' />");
                }
                menubutton.click(toggleMenu);
                menubutton.css({
                    "position":"absolute",
                    "top":"0",
                    "left":"0",
                    "color":"grey",
                    "z-index":"0",
                    "cursor":"pointer",
                    "padding":"0.5em",
                    });
                $("body").prepend(menubutton);
                menubutton.fadeOut(0);

                var menucontainer = $("<div />").attr("id","menucontainer");
                var menu = $("<ul />").attr("id","menu");
                menubuttons = [
                    // [svg icon name, text, click]
                    ["menu","Hide menu", toggleMenu],
                    ["left","Previous", setpreviousimage],
                    ["thumbnails","Thumbnails", toggleThumbnails],
                    ["download","Download", function() {window.location.replace("?image="+images[index]);}],
                    ["zip","Download all", getZip],
                    ["fullscreen","Fullscreen", function() {$(document).toggleFullScreen();}],
                    ["help","Help", toggleHelp],
                    ["right","Next", setnextimage],
                ];
                var button;
                $.each(menubuttons, function(key, button) {
                    button = MenuButton(button[0],button[1],button[2]);
                    menu.append(button);
                     if (key===0) {
                        button.css("border-left","1px solid grey"); // Hack to get left border only on 1st item
                    }
                });
                menucontainer.append(menu);
                return menucontainer;
            }

            function resizeimage () {
                // Reset CSS to get access to the natural image size
                img.css({"height":"auto","width":"auto","margin":"auto"});
                var iw = img.width();
                var ih = img.height();
                var ww = $(window).width();
                var wh = $(window).height();
                var cssw, cssh;
                if (ww/wh>=iw/ih) {
                    cssw = Math.round(iw*wh/ih);
                    cssh = wh;
                } else {
                    cssw = ww;
                    cssh = Math.round(ih*ww/iw);
                }
                var ml = Math.max(0, Math.round((ww-cssw)/2));
                var mt = Math.max(0, Math.round((wh-cssh)/2));
                img.css({
                    "height":cssh+"px",
                    "width":cssw+"px",
                    "margin-top":mt+"px",
                    "margin-left":ml+"px",
                    });
                }

            function setimage (i) {
                index = i;
                loading.show();
                var w = $(window).width();
                var h = $(window).height();
                img.fadeOut({
                    "complete":function() {
                        img.css({"height":"auto","width":"auto"}); // to get access to the natural image size
                        img.attr("src", "?img="+images[index]+"&w="+w+"&h="+h);
                    },
                });
            }

            function createthumb () {
                var w = $(window).width();
                $.each(images, function(key, value) {
                    var thumb = $("<li />");
                    thumbnails.append(thumb);
                    // Show a bouncing square while loading, from loading.io
                    thumb.append("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40' preserveAspectRatio='xMidYMid'>\
                        <rect x='0' y='0' width='40' height='40' fill='none'></rect><g transform='translate(25 25)'>\
                        <rect x='-20' y='-20' width='40' height='40' fill='#a1a1a1' opacity='0.9' class='cube'>\
                        <animateTransform attributeName='transform' type='scale' from='1.5' to='1' repeatCount='indefinite' begin='0s' dur='1s' calcMode='spline' keySplines='0.2 0.8 0.2 0.8' keyTimes='0;1'></animateTransform>\
                        </rect></g></svg>");
                    var timg = $("<img />");
                    timg.attr("src", "?thumb="+value).load(function() {
                        thumb.html(timg);
                    });

                    timg.click(function() {
                        setimage(key);
                    });
                });

            }

            // modulo to stay within bounds
            function setnextimage () {
                setimage((index+1)%images.length);
            }

            function setpreviousimage () {
                setimage((images.length+index-1)%images.length);
            }

            function toggleThumbnails () {
                if ($(window).width()<1024) {
                    img.fadeToggle();
                }
                thumbnails.fadeToggle();
            }

            return this.each(function() {
                // Show a loading box on ajax requests
                // SVG idea & code from loading.io
                loading = $("<div id='loading'><svg width='10%' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='xMidYMid'><rect x='0' y='0' width='100' height='100' fill='none'></rect><g transform='translate(25 25)'><rect x='-20' y='-20' width='40' height='40' fill='#a1a1a1' opacity='0.9'><animateTransform attributeName='transform' type='scale' from='1.5' to='1' repeatCount='indefinite' begin='0s' dur='1s' calcMode='spline' keySplines='0.2 0.8 0.2 0.8' keyTimes='0;1'></animateTransform></rect></g><g transform='translate(75 25)'><rect x='-20' y='-20' width='40' height='40' fill='#a1a1a1' opacity='0.8'><animateTransform attributeName='transform' type='scale' from='1.5' to='1' repeatCount='indefinite' begin='0.1s' dur='1s' calcMode='spline' keySplines='0.2 0.8 0.2 0.8' keyTimes='0;1'></animateTransform></rect></g><g transform='translate(25 75)'><rect x='-20' y='-20' width='40' height='40' fill='#a1a1a1' opacity='0.7'>\
                            <animateTransform attributeName='transform' type='scale' from='1.5' to='1' repeatCount='indefinite' begin='0.3s' dur='1s' calcMode='spline' keySplines='0.2 0.8 0.2 0.8' keyTimes='0;1'></animateTransform></rect></g><g transform='translate(75 75)'><rect x='-20' y='-20' width='40' height='40' fill='#a1a1a1' opacity='0.6'><animateTransform attributeName='transform' type='scale' from='1.5' to='1' repeatCount='indefinite' begin='0.2s' dur='1s' calcMode='spline' keySplines='0.2 0.8 0.2 0.8' keyTimes='0;1'></animateTransform></rect></g></svg></div>");
                $(this).append(loading);
                loading.show();

                // Menu
                menu = Menu();
                $(this).append(menu);

                // Gallery main image
                var gallery = $("<div />").attr("id","gallery");
                img = $("<img />");
                img.load(function() {
                    resizeimage();
                    loading.hide();
                    if ($(window).width()<1024) {
                        thumbnails.fadeOut();
                    }
                    img.fadeIn();
                });
                gallery.append(img);
                $(this).append(gallery);

                // Thumbnails
                thumbnails = $("<ul />").attr("id","thumbs");
                $(this).append(thumbnails);

                // Footer
                var footer = $("<div />").attr("id","footer").html("<a href='https://github.com/fbianco/MimingGallery'>Powered by Miming Gallery</a>");
                $(this).append(footer);

                $(window).resize(function() {
                    if ($(window).width()<1024) {
                        // Hide thumbnails and show image only if both were visible !='none'
                        if (img.css("display")!='none' && thumbnails.css("display")!='none') {
                            thumbnails.fadeOut(0);
                        }
                    } else {
                        // make sure image is visible
                        img.fadeIn(0);
                    }
                    resizeimage();
                });

                // Help
                help = $("<ul />").attr("id","help");
                $.each({
                        "Previous image":"l, p, Backspace, Swipe right",
                        "Next image":"r, n, Spacebar, Swipe left",
                        "Fullscreen":"f",
                        "Hide menu":"m",
                        "Show this help":"h",
                       }, function(key, value) {
                            help.append("<li><em>"+key+":</em> "+value+"</li>");
                       });
                help.click(toggleHelp);
                $(this).append(help);
                help.slideUp(0);

                // Message
                message = $("<div />").attr("id","message");
                message.click(toggleMessage);
                $(this).append(message);
                message.slideUp(0);

                // Key events for navigation & shortcuts
                $(document).keypress(function( event ) {
                    switch (event.which) {
                        case 112: // p
                        case 108: // l
                        case 8: // Backspace:
                            setpreviousimage();
                            break;
                        case 110: // n
                        case 114: // r
                        case 032: // Spacebar:
                            setnextimage();
                            break;
                        case 102: // f:
                            $(document).toggleFullScreen();
                            break;
                        case 109: // m
                            toggleMenu();
                            break;
                        case 104: // h
                            toggleHelp();
                            break;
                        default:
                            break;
                    }
                });

                // Mobile events
                $(document).on("swipeleft",function() {
                    setnextimage();
                });
                $(document).on("swiperight",function() {
                    setpreviousimage();
                });
                img.click(function() {
                    toggleThumbnails();
                });

                // Now let's ask PHP about available images
                // and then create thumbnails
                $.getJSON( "?images", function(j) {
                    images = j;
                }).done( function() {
                    if (images.length>0) {
                        setimage(0); // init first image in gallery
                        createthumb();
                    } else {
                        loading.hide();
                        message.html("<div class='error'>Error: No images found.</div>");
                        message.slideDown();
                    }
                });
            });
        }, // * End of MimingGallery element
    });
})(jQuery);