/*! 
 * zzSLider v0.1 by Zzbaivong <devs.forumvi.com>
 *
 * Forked from Jlider v1.0 by Juskteez (vhuyphong@gmail.com)
 */
(function($) {
    $.fn.zzSlider = function(options) {

        // Thông số mặc định
        var settings = $.extend({

            effect: "random",
            // random|fade|left|right|top|bottom|scaleIn|scaleOut|skewXY|skewYX|rotateX|rotateY|rotateXY|rotateYX

            width: 600,
            height: 400,
            maxWidth: "100%",
            maxHeight: "100%",
            minWidth: 300,
            minHeight: 200,

            hideControl: null, // ["play", "next", "prev", "paging", "progress"]

            speed: 3000,
            autoPlay: true

        }, options);


        return this.each(function() { // Dùng để áp dụng cho nhiều slide cùng lúc

            var $obj = $(this); // slide hiện tại

            var createDiv = function(clazz, txt) {
                return $("<div>", {
                    "class": "jlider_" + clazz,
                    text: txt
                });
            };

            var $wrap = createDiv("wrap", ""); // Khung bao bên ngoài
            var $control = createDiv("control", ""); // Tạo hộp điều khiển
            var $play = createDiv("play", "Pause"); // Nút play
            var $next = createDiv("next", "Next"); // Nút next
            var $prev = createDiv("prev", "Prev"); // nút Prev
            var $paging = createDiv("paging", ""); // Hộp số thứ tự
            var $progress = createDiv("progress", ""); // Thanh trạng thái

            $obj.addClass("jlider_list").wrap('<div class="jlider_wrap"></div>');

            var $wrap = $obj.parent();
            $wrap.css({
                width: settings.width,
                height: settings.height,
                maxWidth: settings.maxWidth,
                maxHeight: settings.maxHeight,
                minWidth: settings.minWidth,
                minHeight: settings.minHeight
            });

            $play.add($next).add($prev).add($paging).appendTo($control); // Thêm nút chức năng vào hộp điều khiển
            $control.add($progress).insertBefore($obj); // Chèn hộp điều khiển và Thanh trạng thái vào sau slide

            var $item = $("li", $obj);

            $item.each(function(index, ele) {
                $paging.append($("<span>", {
                    "data-index": index,
                    text: (index + 1)
                }));
            });
            var $number = $("span", $paging);


            $item.first().add($number.first()).addClass('jactive');

            var last_img = $item.length;
            var mover = function(actions) {

                var currentIndex = parseInt($(".jactive", $paging).data("index"), 10); // Ví trị hiện tại
                var nextIndex; // Vị trí tiếp theo

                if (actions) {
                    nextIndex = currentIndex + 1;
                    if (nextIndex == last_img) {
                        nextIndex = 0;
                    }
                } else {
                    nextIndex = currentIndex - 1;
                    if (nextIndex == -1) {
                        nextIndex = last_img - 1;
                    }
                }

                translate(nextIndex);

            };


            var translate = function(next) {
                var setClass = settings.effect;
                if (setClass == "random") {
                    // $obj.removeClass("zzfade zzleft zzright zztop zzbottom zzscaleIn zzscaleOut zzskewXY zzskewYX zzrotateX zzrotateY zzrotateXY zzrotateYX");
                    var arr = "fade|left|right|top|bottom|scaleIn|scaleOut|skewXY|skewYX|rotateX|rotateY|rotateXY|rotateYX".split("|");
                    $obj.removeClass("zz" + arr.join(" zz"));
                    setClass = arr[Math.floor(Math.random() * arr.length)];
                }
                $obj.addClass("zz" + setClass);
                setTimeout(function() {
                    $(".jactive", $obj).add($(".jactive", $paging)).removeClass("jactive");
                    $item.eq(next).add($number.eq(next)).addClass("jactive");
                }, 100);
            };


            // Tự động chuyển ảnh theo khoảng cách định sẵn
            var slideshow = function() {
                $progress.animate({
                    "width": "100%"
                }, settings.speed, "linear", function() {
                    mover(true);
                    $progress.width(0);
                    slideshow();
                });
            };

            var pauser = function() {
                $progress.stop(true, false);
                $progress.width(0);
            };
            var player = function() {
                if ($play.text() == "Play") { // Nếu text là play thì mới chạy                    
                    slideshow();
                }
            };

            if (settings.autoPlay) {
                $play.text("Play");
                player();
            }

            // Chắc năng cho nút Next
            $next.click(function() {
                mover(true);
            });
            $prev.click(function() {
                mover();
            });

            // Chức năng cho nút tắt
            $number.click(function() {
                translate(parseInt($(this).data("index"), 10));
            });

            // Chức năng cho nút play/pause
            $play.click(function(event) {
                if ($play.text() == "Play") {
                    $play.text("Pause");
                    $play.addClass("jlider_pause");
                    pauser();
                } else {
                    $play.text("Play");
                    $play.removeClass("jlider_pause");
                    player();
                }
            });

            $wrap.hover(function() {
                pauser();
            }, function() {
                player();
            });

            if(settings.hideControl && settings.hideControl.length) {
                $.each(settings.hideControl, function(index, val) {
                    $wrap.find(".jlider_" + val).hide();
                });
            }

        });
    };
})(jQuery);