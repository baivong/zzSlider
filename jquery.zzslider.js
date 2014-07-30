/*!
 * zzSLider v0.4 by Zzbaivong <http://devs.forumvi.com>
 *
 * Forked from Jlider v1.0 by Juskteez (vhuyphong@gmail.com)
 */
(function ($) {
	"use strict";

	$.fn.zzslider = function (options) {

		// Thông số mặc định
		var settings = $.extend({

			/**
			 * Hiệu ứng chuyển ảnh
			 * @value {string} left right up down zoomIn zoomOut skewLeft skewRight skewUp skewDown rotateLeft rotateRight
			 * 				   random
			 * Có thể dùng từng hiệu ứng riêng biệt, hoặc một nhóm các hiệu ứng (cách nhau bằng khoảng trắng).
			 * Dùng random để muốn chạy hiệu ứng ngẫu nhiên. Đây là thông số mặc định.
			 */
			effect: "random",

			width: 600,
			height: 400,
			maxWidth: "100%",
			maxHeight: "100%",
			minWidth: 200,
			minHeight: 200,

			/**
			 * Ẩn các nút/khối chức năng
			 * @value {string} play next prev paging full progress
			 * Có thể ẩn từng nút hoặc nhiều nút (cách nhau bằng khoảng trắng).
			 */
			hideControl: "",

			playSpeed: 3000, // miliseconds
			autoPlay: true, // boolean

			onPlay: function () {},
			onPause: function () {},
			onChange: function () {},
			onLoaded: function () {},
			onFullscreen: function () {},
			onExitfullscreen: function () {},
			helper: function () {}

		}, options);

		return this.each(function () { // Duyệt qua từng slide

			var $obj = $(this); // slide hiện tại

			/**
			 * Tạo các khối hoặc nút chức năng có cấu trúc giống nhau
			 * @param {string} class
			 * @param {string} text
			 */
			var createDiv = function (clazz, txt) {
				return $("<div>", {
					"class": "jlider_" + clazz,
					text: txt
				});
			};

			var $wrap = createDiv("wrap", ""); // Khung bao bên ngoài
			var $control = createDiv("control", ""); // Tạo hộp chức các nút chức năng
			var $play = createDiv("pause", "Pause"); // Nút play/pause
			var $full = createDiv("full", "Fullscreen"); // Nút fullscreen
			var $next = createDiv("next", "Next"); // Nút next
			var $prev = createDiv("prev", "Prev"); // Nút Prev
			var $paging = createDiv("paging", ""); // Hộp chứa số thứ tự ảnh
			var $progress = createDiv("progress", ""); // Thanh trạng thái

			$obj.addClass("jlider_list").wrap('<div class="jlider_wrap"></div>');

			var $wrap = $obj.parent();

			// Gắn các thiết lập kích thước slide
			$wrap.css({
				width: settings.width,
				height: settings.height,
				maxWidth: settings.maxWidth,
				maxHeight: settings.maxHeight,
				minWidth: settings.minWidth,
				minHeight: settings.minHeight
			});

			$play.add($full).add($next).add($prev).add($paging).appendTo($control);
			$control.add($progress).insertBefore($obj);

			// Tự động chuyển ảnh theo khoảng cách định sẵn
			var slideshow = function () {
				$progress.animate({
					"width": "100%"
				}, settings.playSpeed, "linear", function () {
					translate(mover(true));
					$progress.width(0);
					slideshow();
				});
			};

			// Dừng slide
			var pauser = function () {
				$progress.stop(true, false);
				$progress.width(0);
				settings.onPause.call($wrap, $("li.jactive > img", $obj));
			};

			// Chạy slide nếu nó được bật
			var player = function () {
				if ($play.text() == "Play") {
					slideshow();
					settings.onPlay.call($wrap, $("li.jactive > img", $obj));
				}
			};

			var $item = $("li", $obj);
			var itemLength = $item.length;
			var $number;

			/**
			 * Áp dụng hiệu ứng bằng cách thay class lên ảnh
			 * @param {number} Số index của ảnh cần hiển thị
			 */
			var translate = function (next) {
				var setClass = settings.effect;
				var listClass = "left right up down zoomIn zoomOut skewLeft skewRight skewUp skewDown rotateLeft rotateRight";
				$obj.removeClass("zz" + listClass.split(" ").join(" zz"));
				if (setClass == "random" || setClass.indexOf(" ") !== -1) {
					if (setClass == "random") {
						setClass = listClass;
					}
					setClass = setClass.split(" ")[Math.floor(Math.random() * setClass.split(" ").length)];
				}
				$obj.addClass("zz" + setClass);
				setTimeout(function () {
					$(".jactive", $obj).add($(".jactive", $paging)).removeClass("jactive");
					$item.eq(next).add($number.eq(next)).addClass("jactive");
					$next.attr("data-img", $("img", $obj).eq(next + 1).attr("src"));
					$prev.attr("data-img", $("img", $obj).eq(next - 1).attr("src"));

					// Hàm chạy khi chuyển ảnh
					settings.onChange.call($wrap, $("li.jactive > img", $obj));
				}, 100);
			};

			// Bao phủ toàn bộ slide bằng thanh progress
			$progress.css({
				height: "100%",
				width: "100%",
				background: "rgba(0, 0, 0, 0.69)"
			});

			// Tạo khung hiển thị số % tải ảnh
			var $precent = $("<div>", {
				"class": "jlider_percent",
				text: "0%"
			}).appendTo($wrap);

			var count = 1;

			/**
			 * Hiệu ứng cho quá trình tải ảnh
			 * @param {number} Số lượng ảnh đã tải xong
			 */
			var setLoaded = function (num) {

				var percent = Math.round(num / itemLength * 100); // số % đã tải

				$progress.animate({
					height: (100 - percent) + "%" // Giảm dần chiều cao thanh progress
				}, 70, "linear", function () {

					translate(num); // Hiển thị ảnh vừa tải xong

					$precent.text(percent + "%"); // Hiển thị số %

					if (num === itemLength) { // Khi tất cả ảnh đã tải xong

						$progress.removeAttr("style"); // Xóa hiệu ứng cho thanh progress

						$precent.addClass("zz100").fadeOut(200, function () {

							// Nếu thiết lập chạy slide tự động thì cho chạy
							if (settings.autoPlay) {
								$play.text("Play").addClass("jlider_play");
								player();
							}

							/**
							 * Rê chuột vào dừng slide
							 * Rê chuột ra chạy slide
							 */
							$wrap.hover(function () {
								if (!$wrap.hasClass("zzfullscreen") && !$wrap.hasClass("zzfullwindow")) {
									pauser();
								}
							}, function () {
								player();
							});

							$precent.remove(); // Xóa số %

							translate(0); // Hiển thị ảnh đầu tiên

							$paging.css("bottom", 0); // Hiển thị thanh paging

							// Hàm chạy khi tất cả ảnh đã tải xong
							settings.onLoaded.call($wrap, $("img", $obj).first());
						});
					}
				});
			};

			$item.each(function (index, ele) {

				// Xác định thời điểm ảnh tải xong
				var $img = $("img", this);
				if ($img[0].complete) { // Ảnh đã cache
					setLoaded(count++);
				} else {
					$img.load(function () { // Ảnh đã tải xong
						setLoaded(count++);
					}).error(function () { // Ảnh lỗi
						setLoaded(count++);
					});
				}

				// Thêm số thứ tự ảnh
				$paging.append($("<div>", {
					"class": "zzpage",
					"data-index": index,
					"data-img": $img.attr("src"),
					html: "<span>" + (index + 1) + "</span>"
				}));

			});

			$number = $(".zzpage", $paging); // Đặt biến cho số thứ tự ảnh vừa tạo

			// Căn giữa thanh paging
			var wrapWidth = $wrap.width();
			var pagingWidth = itemLength * $number.outerWidth(true);
			var halfPaging = pagingWidth / 2;
			$paging.css({
				width: pagingWidth,
				marginLeft: (-halfPaging) + "px"
			});

			if (pagingWidth > wrapWidth) { // Nếu thanh paging dài hơn chiều rộng slide
				pagingWidth = pagingWidth + 100; // Thêm vào khoảng đệm 100px
				halfPaging = pagingWidth / 2; // Tính lại vị trí căn giữa
				$paging.css({
					marginLeft: (-halfPaging) + "px",
					paddingLeft: 50,
					paddingRight: 50
				});

				var outHide = halfPaging - wrapWidth / 2; // Phần paging ẩn, nằm ngoài slide
				var firstOff, wrapOff;

				$paging.hover(function (event) {
					firstOff = event.pageX; // Tọa độ X của điểm rê chuột vào đầu tiên, dùng làm điểm mốc
					wrapOff = firstOff - $wrap.offset().left; // Khoảng cách từ điểm rê chuột đầu tiên đến mép trái slide
				}, function () {
					$paging.animate({
						marginLeft: (-halfPaging) + "px"
					}, 100); // Trả lại vị trí ban đầu
				}).mousemove(function (event) {
					if ($paging.width() > $wrap.width()) { // Kiểm tra do thay đổi kích thước ở chế độ toàn màn hình
						var goto = firstOff - event.pageX; // tọa độ X của chuột di chuyển tính từ điểm mốc
						if (goto > 0) { // rê chuột về bên trái
							$paging.css("marginLeft", (-(halfPaging - (goto * outHide / wrapOff))) + "px");
						} else if (goto < 0) { // rê chuột về bên phải
							$paging.css("marginLeft", (-halfPaging + (goto * outHide / (wrapWidth - wrapOff))) + "px");
						}
					}
				});
			}

			/**
			 * Tìm số index của ảnh phía trước hoặc sau
			 * @param {boolean} true            : Next
			 * 					false hoặc null : Prev
			 * @return {number}
			 */
			var mover = function (actions) {
				var currentIndex = parseInt($(".jactive", $paging).data("index"), 10); // current
				var nextIndex; // next hoặc prev

				if (actions) { // next
					nextIndex = currentIndex + 1;
					if (nextIndex == itemLength) {
						nextIndex = 0;
					}
				} else { // prev
					nextIndex = currentIndex - 1;
					if (nextIndex == -1) {
						nextIndex = itemLength - 1;
					}
				}

				return nextIndex;
			};


			$next.click(function () {
				translate(mover(true));
			});

			$prev.click(function () {
				translate(mover());
			});

			$number.click(function () {
				translate(parseInt($(this).data("index"), 10));
			});

			$play.click(function (event) {
				if ($play.text() == "Play") { // pause
					$play.text("Pause").removeClass("jlider_play");
					pauser();
				} else { // play
					$play.text("Play").addClass("jlider_play");
					player();
				}
			});

			var hideBtn = settings.hideControl;
			if (!!hideBtn && hideBtn.match(/\s*(.*)\s*/)[1] !== "") {
				$.each(hideBtn.split(" "), function (index, val) {
					if (/\b(play|pause|next|prev|paging|full|progress)\b/.test(val)) {
						if (val == "play") {
							val = "pause";
						}
						$wrap.find(".jlider_" + val).hide();
					}
				});
			}

			/**
			 * Bật chế độ fullscreen
			 * @param {object} đối tượng cần hiển thị fullscreen
			 */
			var enterFS = function (e) {
				if (e.requestFullscreen) {
					e.requestFullscreen();
				} else if (e.msRequestFullscreen) {
					e.msRequestFullscreen();
				} else if (e.mozRequestFullScreen) {
					e.mozRequestFullScreen();
				} else if (e.webkitRequestFullScreen) {
					e.webkitRequestFullScreen();
				}
			};

			// Thoát chế độ fullscreen
			var exitFS = function () {
				if (document.exitFullscreen) {
					document.exitFullscreen();
				} else if (document.msExitFullscreen) {
					document.msExitFullscreen();
				} else if (document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
				} else if (document.webkitCancelFullScreen) {
					document.webkitCancelFullScreen();
				}
			};

			// Chạy trong chế độ fullscreen
			var eventFS = function () {
				if ($play.text() == "Play") {
					player();
				}
				$next.add($prev).add($paging).hover(function () {
					pauser();
				}, function () {
					player();
				});

				// Chạy khi hiển thị toàn màn hình
				settings.onFullscreen.call($wrap, $("li.jactive > img", $obj));
			};

			$full.click(function () {

				// Nếu trình duyệt không hỗ trợ api fullscreen
				if (document.msFullscreenElement === undefined && document.fullscreenElement === undefined && document.mozFullScreenElement === undefined && document.webkitFullscreenElement === undefined) {
					$wrap.toggleClass(function () {
						if ($wrap.hasClass("zzfullwindow")) {
							eventFS();
						} else {

							// Chạy khi thoát toàn màn hình
							settings.onExitfullscreen.call($wrap, $("li.jactive > img", $obj));
						}
						return "zzfullwindow";
					});

				} else {

					// Nếu trình duyệt chưa ở trạng thái fullscreen
					if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
						enterFS($wrap[0]);
						eventFS();
					} else {
						exitFS();

						// Chạy khi thoát toàn màn hình
						settings.onExitfullscreen.call($wrap, $("li.jactive > img", $obj));
					}
				}
			});

			settings.helper.call($wrap[0], {
				control: {
					play: $play,
					full: $full,
					next: $next,
					prev: $prev,
					paging: $number
				},
				progress: $progress,
				list: $item
			}, settings);

		});
	};
})(jQuery);