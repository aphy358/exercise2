define([], function(){

	// 计算当年所有月份的天数，存入一个数组，先计算二月份的总天数，传入当下年份
	function getDaysForeachMonth(year) {
		return new Array(31, _leap(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
	}

	// 返回当下年份中二月份的天数，传入当下年份
	function _leap(year) {
		return 28 + ( ( year % 4 == 0 && year % 100 != 0 || year % 400 == 0 ) ? 1 : 0 );
	}

	// 返回一天的毫秒数
	function oneDayTime(){
		return 24 * 60 * 60 * 1000;
	}

	// 获取用户设置的样式
	function getContentStyle(options){
		var styleArr = ''
		var style = options.contentStyle

		if(style){
			for (var key in style) {
				var val = style[key].replace(/[\"\']/g, '');
				styleArr += `${key}:${val};`;
			}
		}

		return styleArr;
	}

	// 获取日历单行的 DOM 字符串，每一行有七格
	function getOneRowStr(i, tdArr, options){

		var totalStr = ''

		for(var j = 0; j < 7; j++){

			var td = tdArr[i * 7 + j];

			totalStr += `
				<div class="mcm-month-td${td.isWeekend ? ' weekend' : ''}">
					<div class="calendar-td-inner${td.isValidDay ? '' : ' day-grayed'}${td.isDisable ? ' disable' : ''}" data-day="${td.dayStr}" >
						<p class="calendar-day-num">${parseInt(td.dayStr.split('/')[2])}</p>
						<div class="calendar-td-addon-wrap${td.isValidDay ? '' : ' day-grayed'}" data-day="${td.dayStr}" style="${getContentStyle(options)}"></div>
					</div>
				</div>`
		}

		return totalStr;
	}
	
	// 获取一个月的内部的 DOM 字符串，每个月有六行
	function getOneMonthInnerDOM(tdArr, options) {

		var totalStr = ''

		for(var i = 0; i < 6; i++){
			totalStr += `
				<div class="mcm-month-row calendar-row">
					${getOneRowStr(i, tdArr, options)}
				</div>`
		}

		return totalStr;
	}

	/**
	 * @param {*} options 
	 * @param {*} dateType 如：'minDate'、'maxDate'
	 */
	function getBaseDate(options, dateType){
		var baseDate = null
		var addon = dateType === 'minDate' ? ' 00:00:00' : ' 23:59:59'

		if(options[dateType]){
            if(typeof options[dateType] === 'string'){
                options[dateType] = options[dateType].replace(/-/g, '/')
            }
            options[dateType] = new Date(options[dateType]).Format('yyyy/MM/dd') + addon
            baseDate = new Date(options[dateType])
		}
		return baseDate
	}

	// 生成一个月的相关 DOM （里面所有日期行）
	function getOneMonthDOM(y, m, dayCount, options) {

		// 该月的第一天（不一定是第一行的第一格）
		let	firstDay = new Date(y + '/' + m + '/1')
		
		// 计算该月前面要补充的天数，先计算该月第一天是星期几，就说明了第一行前面有几个空位，如果该月第一天是星期日，则补充天数为7天
		let	daysPrev = firstDay.getDay() || 7
		
		// 注意，这里的 firstDayTime 是指第一行第一格所处的日期的 dayTime
		let	firstDayTime = firstDay.getTime() - daysPrev * oneDayTime()
		
		// 计算该月末尾补充的天数，一个 "日历月" 一共有六行，42个TD，所以做一下减法就能算出
		let	daysAfter = 42 - daysPrev - dayCount

		let	i, tdArr = []
		
		// 该月月份字符串
		let	monthStr = y + '/' + m

		// 获取用户设置的最小可选日期（如果有的话）
		let baseMinDate = getBaseDate(options, 'minDate')

		// 获取用户设置的最大可选日期（如果有的话）
		let baseMaxDate = getBaseDate(options, 'maxDate')
		
		for (i = 0; i < 42; i++){
			let	dayStr = new Date( firstDayTime + i * oneDayTime() ).Format('yyyy/MM/dd')

			// 首尾两端补充的天数要设置成灰色
			let	isValidDay = (daysPrev <= i && i < (42 - daysAfter))

			let	isWeekend = (i % 7) === 0 || (i % 7) === 6
			
			tdArr.push({
				dayStr : dayStr,
				isValidDay : isValidDay,
				isDisable : (baseMinDate && new Date(dayStr) < baseMinDate) || (baseMaxDate && new Date(dayStr) > baseMaxDate),
				isWeekend : isWeekend
			});
		}

		return `
			<div class="mcm-month-inner swiper-slide" data-month="${monthStr}">
				${getOneMonthInnerDOM(tdArr, options)}
			</div>`
	}

	/**
	 * y：年份
	 * m：月份
	 * h：每格内容的高度
	 */
	return function (y, m, options){
		if(+m > 12){
			y = +y + 1
			m = 1
		}else if(+m < 1){
			y = +y - 1
			m = 12
		}

		var dayArr = getDaysForeachMonth(y);

		return getOneMonthDOM(y, m, dayArr[m - 1], options);
	}
})
