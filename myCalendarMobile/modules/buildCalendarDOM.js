define([], function(){

	// 获取整个日历控件的 DOM 结构
	return function getCalendarDOM(year, month, body){
		return `
			<section class="my-calendar-outer">
				<div class="my-calendar-mobile-mask"></div>
				<div class="calendar-wrap" onselectstart="return false;">
					<div class="month-switch-bar-wrap">
						<div class="month-switch-bar month-left iconfont icon-left-thin"></div>
						<div class="month-switch-bar month-right iconfont icon-right-thin"></div>
					</div>
					<div class="calendar-title">
						<div class="calendar-title-inner">
							<div class="calendar-title-year" data-year="${year}">${year}年</div>
							<div class="calendar-title-month" data-month="${month}">${month}月</div>
						</div>
					</div>
					<div class="calendar-body-outer">
						<div class="calendar-title-week">
							<div class="weekend">日</div>
							<div>一</div>
							<div>二</div>
							<div>三</div>
							<div>四</div>
							<div>五</div>
							<div class="weekend">六</div>
						</div>
						<div class="calendar-body-inner swiper-container-calendar-body">
							<div class="swiper-wrapper">
								${body}
							</div>
						</div>
					</div>
					<div class="calendar-month-outer hide"></div>
					<div class="calendar-year-outer hide"></div>
				</div>
			</section>`
	}
})
