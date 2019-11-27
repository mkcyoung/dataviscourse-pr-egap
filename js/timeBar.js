/**
class for the time bar
*/
class TimeBar {

	constructor(activeYear, mapObj, bubbleChart) {
		
        this.activeYear = activeYear;
        /** Reference to mapObj */
        this.map = mapObj; 
        /** Reference to bubbleChart */
        this.bubbleChart = bubbleChart;

		this.drawYearBar();
	}

	updateYear(year) {
        this.activeYear = year;

        /** Pass active year to map object */
        this.map.activeYear = year;
        this.map.updateMap();
        //Updates state info box with year update
        if(this.map.activeState){
            d3.select("#mtooltipS").html(this.map.tooltipRender2(this.map.activeState));
        }

        console.log(this.map.activeState);
        console.log(this.map.activeStates);
        this.bubbleChart.updateChart(this.activeYear, this.map.activeState, this.map.activeStates);
        
	}

	/**
	Draw the year bar
	*/
	drawYearBar() {
		console.log("draw year bar.", this.activeYear);

		let that = this;

        //Slider to change the activeYear of the data

        let timeScale = d3.scaleLinear().domain([1976, 2014]).range([425, 1175]);

        let timeSlider = d3.select('#activeYear-bar')
            .append('div').classed('slider-wrap', true)
            .append('input').classed('slider', true)
            .attr('type', 'range')
            .attr('min', 1976)
            .attr('max', 2014) //I think the data is only through 2014 elections - or at least map data is
            .attr('step','2') //Elections happen every two years (i think)
            .attr('value', this.activeYear);

        // d3.select("#activeTime-bar").append("div");


        let sliderLabel = d3.select('.slider-wrap')
            .append('div').classed('slider-label', true)
            .append('svg');

        let sliderText = sliderLabel.append('text').text(this.activeYear);

        sliderText.attr('x', timeScale(this.activeYear));
        sliderText.attr('y', 20);

        timeSlider.on('input', function() {

            that.updateYear(this.value);

            sliderText.text(this.value)
                    .attr('x', timeScale(this.value));

            that.activeYear = this.value;

        });
	}
}