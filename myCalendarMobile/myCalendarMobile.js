
define(['buildOneMonthDOM', 'buildCalendarDOM', 'initCalendarEvents'],
	function(buildOneMonthDOM, buildCalendarDOM, initCalendarEvents){


	var _default = {
		// 定义每个日期格子的高度，这样就可以保证日期控件高度始终一致
		contentStyle : null,

		// 最小可选日期
		minDate : null,

		// 最大可选日期
		maxDate : null,

		// 有时候 target 并不只是单纯的一个 DOM，而有可能是一个 div，在控制点击页面隐藏日历的时候，该属性有助于找到真正的 target
		targetOuter : null,
		format : 'yyyy-MM-dd',
		swiper0 : null,
		swiper1 : null,
		show : function(){
			var _this = this

			if(_this.elem.css('visibility') === 'hidden'){
				_this.elem.css('visibility', 'visible').addClass('open').removeClass('close')
			}

			_this.setTargetVal($(_this.target).attr('data-day'))
			_this.setCheckedDateStatus($(_this.target).attr('data-day'))
			_this.elem.prev('.my-calendar-mobile-mask').show()
			_this.elem.parent().addClass('active')
        },

        hide : function(){
			var _this = this

			_this.elem.removeClass('open').addClass('close')
			_this.elem.prev('.my-calendar-mobile-mask').hide()
			_this.elem.parent().removeClass('active')

			setTimeout(function(){
				_this.resetCalendarStatus()
			}, 200)
		},

		// 重新设置日历主体，将之前生成的月份全部清空，重新生成三个月份的 DOM 插入
		resetCalendarBody : function(year, month){
			var calendar = this.elem
			var slideBar = calendar.find('.month-switch-bar-wrap')
			var yearObj = calendar.find('.calendar-title-year')
			var monthObj = calendar.find('.calendar-title-month')
			var bodyOuter = calendar.find('.calendar-body-outer')
			var monthOuter = calendar.find('.calendar-month-outer')
			var swiper0 = this.swiper0

			swiper0.removeAllSlides()
			swiper0.appendSlide(`${buildOneMonthDOM(year, month - 1, this)}${buildOneMonthDOM(year, month, this)}${buildOneMonthDOM(year, month + 1, this)}`)
			swiper0.slideTo(1)

			bodyOuter.slideDown('fast')
			monthOuter.slideUp('fast')
			slideBar.show()
			monthObj.attr('data-month', month).html(month + '月')

			var currentMonth = $('.mcm-month-inner.swiper-slide-active')
			this.callbackAfterMonthChanged(currentMonth)
		},

		// 重置日历控件状态，即切换到当前选中日期的面板
		resetCalendarStatus : function(ifClear){
			var calendar = this.elem
			var slideBar = calendar.find('.month-switch-bar-wrap')
			var yearObj = calendar.find('.calendar-title-year')
			var monthObj = calendar.find('.calendar-title-month')
			var bodyOuter = calendar.find('.calendar-body-outer')
			var yearOuter = calendar.find('.calendar-year-outer')
			var monthOuter = calendar.find('.calendar-month-outer')
			var swiper0 = this.swiper0
			var activeYearMonth = $(this.target).attr('data-day').split('/')
			var year = +activeYearMonth[0]
			var month = +activeYearMonth[1]

			calendar.css('visibility', 'hidden')

			bodyOuter.slideDown('fast')
			monthOuter.slideUp('fast')
			yearOuter.slideUp('fast')
			slideBar.show()

			if(ifClear || this.checkedMonth){
				this.checkedMonth = false
				this.resetCalendarBody(year, month)
			}else{
				var valArr = calendar.find('.mcm-month-inner.swiper-slide-active').attr('data-month').split('/')
				var yearRemain = +valArr[0]
				var monthRemain = +valArr[1]
				if( year !== yearRemain || month !== +valArr[1] ){
					var monthGap = (year - yearRemain) * 12 + (month - monthRemain)
					swiper0.slideTo(swiper0.realIndex + monthGap)
					yearObj.attr('data-month', year).html(year + '年')
					monthObj.attr('data-month', month).html(month + '月')
				}
			}

			this.setCheckedDateStatus( $(this.target).attr('data-day') )
		},

		// 设置目标元素的显示
        setTargetVal : function(val){
			val = val.replace(/-/g, '/')

            if(this.target.tagName === 'INPUT'){
				this.target.value = new Date(val).Format(this.format)
			}else if($(this.target).hasClass('calendar-input')){
				$(this.target).html( new Date(val).Format(this.format) )
			}

			if($(this.target).attr('data-day') !== val){
				$(this.target)
					.attr('data-day', val)
					.trigger('valueChanged')
			}
		},

		// 设置被选中日期的状态
		setCheckedDateStatus : function(val){
			val = val.replace(/-/g, '/')
			var tdArr = this.elem.find('.calendar-td-inner').removeClass('checked')

			for (var i = 0; i < tdArr.length; i++) {
				var o = $(tdArr[i])
				if(val === new Date(o.attr('data-day')).Format('yyyy/MM/dd')){
					o.addClass('checked')
				}
			}
		},

        // 日期临时置灰（当选择了入住日期，则超过入住日期15天之后的日期全部置灰）
        setTmpGray : function(){

        },

        // 点击某一天
        dayClick : function( _this ){

		},

		// 点击 "上一月"
        switchLeft : function(){

        },

        // 点击 "下一月"
        switchRight : function(){

		},

		// 在切换到一个新的月份时，调用函数（该应用场景适用于在日历动态插入数据），进一步包装，判断之前是否已经执行过，避免重复执行
		callbackAfterMonthChanged : function(currentMonth){
			if(currentMonth.hasClass('callbacked'))	return;
			currentMonth.addClass('callbacked')
			this.monthChanged(currentMonth)
		},

		// 在切换到一个新的月份时，调用函数（该应用场景适用于在日历动态插入数据），该函数用于给用户自定义
		monthChanged : function(currentMonth){},
	}

	// 创建日历控件
	function buildCalendarElem(options){

		// 基准日期，后续将围绕该基准日期创建三个月的 DOM，分别是该基准日期所在月份的上一月、该基准日期所在月、下一月
		var targetVal = $(options.target).attr('data-day')

		var initDate =
			targetVal
				? new Date(targetVal)
				: new Date()

		options.initDate = initDate

		var year = initDate.getFullYear()
		var month = initDate.getMonth() + 1
		var calendarBody = `${buildOneMonthDOM(year, month - 1, options)}${buildOneMonthDOM(year, month, options)}${buildOneMonthDOM(year, month + 1, options)}`

		return $( buildCalendarDOM(year, month, calendarBody) )
	}

	function initCalendar(options){
		options = $.extend({}, _default, options)
		var elemOuter = buildCalendarElem(options)
		var elem = elemOuter.find('.calendar-wrap')
		var myCalendarMobile = $.extend({}, options, {elem: elem})
		elemOuter[0].target = options.target

		$("body").append(elemOuter)

		initCalendarEvents(myCalendarMobile)
		myCalendarMobile.show()

		return myCalendarMobile;
	}

	// 入口函数
	return function (options) {
		var event = window.event || arguments.callee.caller.arguments[0];

		if( !options ){
			options = {
				target : event.target || event.srcElement,
			}
		}

		if( !options.target ){
			options.target = event.target || event.srcElement;
		}

		// 如果找不到对应的日历对象，说明是第一次触发，则先为该目标元素创建一个对应的日历对象
		var target = options.target;
		if( !target.myCalendarMobile ){
			target.myCalendarMobile = initCalendar(options);
		}else{
			// 如果不是第一次点击，则直接让它对应的日历控件重新显示出来即可
			target.myCalendarMobile.show();
		}

		$.makeArray($(".my-calendar-outer")).forEach((n) => {
			var t = n.target.getBoundingClientRect()
			if(t.bottom === 0 && t.left === 0 && t.right === 0 && t.top === 0){
				$(n).remove()
			}
		})
	}
})

