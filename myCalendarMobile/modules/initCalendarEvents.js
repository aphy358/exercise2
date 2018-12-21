define(['buildOneMonthDOM'], function(buildOneMonthDOM){

	// 重新设置日历 title 区域的年份和月份
	function reSetCalendarTitle(elem, year, month){
		var yearObj = elem.find('.calendar-title-year')
		var monthObj = elem.find('.calendar-title-month')

		yearObj.attr('data-year', year).html(year + '年')
		monthObj.attr('data-month', month).html(month + '月')
	}

	function getTwelveMonthDOMForOneYear(){

		var totalStr = ''

		for (var i = 1; i < 13; i++) {
			totalStr += `<div class="calendar-month-item" data-month="${i}">${i}月</div>`
		}

		return totalStr;
	}

	function getTwelveYearDOM(year){
		year = +year - 5

		var totalStr = ''

		for (var i = 1; i < 13; i++, year++) {
			totalStr += `<div class="calendar-year-item" data-year="${year}">${year}年</div>`
		}

		return  totalStr;
	}

	// 初次获取三个 swiper 片区的年份 DOM
	function f_getSwiperYearDOM(year){
		return `
			<div class="swiper-container-year">
				<div class="swiper-wrapper">
					<div class="swiper-slide">
						${getTwelveYearDOM(+year - 12)}
					</div>
					<div class="swiper-slide">
						${getTwelveYearDOM(+year)}
					</div>
					<div class="swiper-slide">
						${getTwelveYearDOM(+year + 12)}
					</div>
				</div>
			</div>`
	}

	// 初始化日历主体部分的 Swiper
	function initCalendarBodySwiper(myCalendarMobile){
		var elem = myCalendarMobile.elem

		myCalendarMobile.swiper0 = new Swiper(elem.find('.swiper-container-calendar-body'), {
			initialSlide: 1,
			spaceBetween: 80,
			on: {
				slideNextTransitionStart: function(){
					if(this.snapIndex > 0){
						var currentMonth = $(this.$wrapperEl[0]).find('.swiper-slide-active')
						var dataArr = currentMonth.attr('data-month').split('/')
						var year = +dataArr[0]
						var month = +dataArr[1]

						// 执行切换月份之后的回调函数
						myCalendarMobile.callbackAfterMonthChanged(currentMonth)

						reSetCalendarTitle(elem, year, month)

						// 当滑动到最后一个片区时，再在最后面生成一个片区插入
						if(this.isEnd){
							if(++month > 12){
								++year
								month = 1
							}

							this.appendSlide(`${buildOneMonthDOM(year, month, myCalendarMobile)}`);
						}
					}
				},
				slidePrevTransitionStart: function(){
					var currentMonth = $(this.$wrapperEl[0]).find('.swiper-slide-active')
					var dataArr = currentMonth.attr('data-month').split('/')
					var year = +dataArr[0]
					var month = +dataArr[1]

					// 执行切换月份之后的回调函数
					myCalendarMobile.callbackAfterMonthChanged(currentMonth)

					reSetCalendarTitle(elem, year, month)

					// 当滑动到第一个片区时，再在最最前面生成一个片区插入
					if(this.isBeginning){
						var _this = this
						if(--month < 1){
							--year
							month = 12
						}

						setTimeout(function(){
							_this.prependSlide(`${buildOneMonthDOM(year, month, myCalendarMobile)}`);
						}, 100)
					}
				},
			},
		});

	}

	// 初始化日历年份部分的 Swiper
	function initCalendarYearSwiper(myCalendarMobile){
		var elem = myCalendarMobile.elem

		myCalendarMobile.swiper1 = new Swiper(elem.find('.swiper-container-year'), {
			initialSlide: 1,
			spaceBetween: 80,
			on: {
				slideNextTransitionStart: function(){
					// 当滑动到最后一个片区时，再在最后面生成一个片区插入
					if(this.snapIndex && this.isEnd){
						var year = $(this.$wrapperEl[0]).find('.swiper-slide-active').find('.calendar-year-item').attr('data-year')
						this.appendSlide(`<div class="swiper-slide">${getTwelveYearDOM(+year + 17)}`);
					}
				},
				slidePrevTransitionStart: function(){
					// 当滑动到第一个片区时，再在最最前面生成一个片区插入
					if(this.isBeginning){
						var _this = this
						setTimeout(function(){
							var year = $(_this.$wrapperEl[0]).find('.swiper-slide-active').find('.calendar-year-item').attr('data-year')
							if(year > 100){
								_this.prependSlide(`<div class="swiper-slide">${getTwelveYearDOM(+year - 7)}</div>`);
							}
						}, 100)
					}
				},
			},
		});
	}

	// 设置初始选中日期
	function setInitDate(myCalendarMobile){
		var initDateStr = myCalendarMobile.initDate.Format('yyyy/MM/dd')
		myCalendarMobile.setCheckedDateStatus(initDateStr)
		myCalendarMobile.setTargetVal(initDateStr)
	}

	return function initEvents(myCalendarMobile){

		setInitDate(myCalendarMobile)

		initCalendarBodySwiper(myCalendarMobile)

		var calendar = myCalendarMobile.elem
		var slideBar = calendar.find('.month-switch-bar-wrap')
		var yearObj = calendar.find('.calendar-title-year')
		var monthObj = calendar.find('.calendar-title-month')
		var bodyOuter = calendar.find('.calendar-body-outer')
		var yearOuter = calendar.find('.calendar-year-outer')
		var monthOuter = calendar.find('.calendar-month-outer')
		var swiper0 = myCalendarMobile.swiper0

		// 点击 title 栏的月份
		calendar.delegate('.calendar-title-month', 'click', function(){
			bodyOuter.slideUp('fast')
			yearOuter.slideUp('fast')
			slideBar.hide()
			monthOuter.html( getTwelveMonthDOMForOneYear() ).slideDown('fast')
		})

		// 选择某月
		calendar.delegate('.calendar-month-item', 'click', function(){
			var year = +yearObj.attr('data-year')
			var month = +$(this).attr('data-month')

			myCalendarMobile.resetCalendarBody(year, month)

			// 用于标记已经点击了月份，如果后续没有点击某个日期，那么后面再次显示该日历控件的时候，就要清空日历主体，重新生成了
			myCalendarMobile.checkedMonth = true
		})

		// 点击 title 栏的年份
		calendar.delegate('.calendar-title-year', 'click', function(){
			bodyOuter.slideUp('fast')
			monthOuter.slideUp('fast')
			slideBar.show()
			yearOuter.html( f_getSwiperYearDOM(yearObj.attr('data-year')) ).slideDown('fast')

			initCalendarYearSwiper(myCalendarMobile)
		})

		// 选择某年
		calendar.delegate('.calendar-year-item', 'click', function(){
			var year = $(this).attr('data-year')
			yearObj.attr('data-year', year).html(year + '年')

			bodyOuter.slideUp('fast')
			yearOuter.slideUp('fast')
			slideBar.hide()
			monthOuter.html( getTwelveMonthDOMForOneYear() ).slideDown('fast')
		})

		// 点击某一天
		calendar.delegate('.calendar-td-inner', 'click', function(){
			var _this = $(this)
			if(_this.hasClass('disable'))	return;

			calendar.find('.checked').removeClass('checked')
			_this.addClass('checked')

			var val = _this.attr('data-day')
			myCalendarMobile.setTargetVal(val)
			myCalendarMobile.setCheckedDateStatus(val)
			myCalendarMobile.hide()

			// 用于标记已经点击了月份，如果后续没有点击某个日期，那么后面再次显示该日历控件的时候，就要清空日历主体，重新生成了
			myCalendarMobile.checkedMonth = false
		})

		// 向左切换一个 swiper-slide
		calendar.delegate('.month-switch-bar.month-left', 'click', function(){
			if(calendar.find(".calendar-body-outer").css('display') === 'block'){
				myCalendarMobile.swiper0.slidePrev()
			}else if(calendar.find(".calendar-year-outer").css('display') === 'block'){
				myCalendarMobile.swiper1.slidePrev()
			}
		})

		// 向右切换一个 swiper-slide
		calendar.delegate('.month-switch-bar.month-right', 'click', function(){
			if(calendar.find(".calendar-body-outer").css('display') === 'block'){
				myCalendarMobile.swiper0.slideNext()
			}else if(calendar.find(".calendar-year-outer").css('display') === 'block'){
				myCalendarMobile.swiper1.slideNext()
			}
		})

		$(document).on('touchstart', function(e){

			var event = window.event || e
			var target = event.target || event.srcElement
			var hasTarget = $(target).closest(myCalendarMobile.targetOuter)[0] === myCalendarMobile.target


			// 兼容IE，当点击到滚动条时，chrome下的target显示为document，而IE8下显示是根节点<html>标签，而IE9下是对象{...}
			// 但是移动端是 'HTML'，所以移动端不能做这个判断
			// var isScrollBar = target.tagName === 'HTML' || !target.tagName

			// 当点击的位置既不是该组件，也不是该组件对应的目标元素，也不是滚动条时，则隐藏该组件
			if( !$(target).closest('.calendar-wrap').length && target !== myCalendarMobile.target && !hasTarget){
				myCalendarMobile.hide();
			}
		})

	}
})
