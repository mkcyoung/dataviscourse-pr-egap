class LinePlot {

    /** */
    
    constructor(data) {

        this.margin = { top: 20, right: 20, bottom: 20, left: 80 };
        this.width = 700 - this.margin.left - this.margin.right;
        this.height = 400 - this.margin.top - this.margin.bottom;

        this.data = data;

        this.drawPlot(data);

        this.updatePlot(data, 'California', 'le');

    }

    /** */

    drawPlot(data) {

        d3.select('#line-view')
            .append('div')
            .attr("class", "line-tooltip")
            .style("opacity", 0);

        d3.select('#line-view')
            .append('svg').classed('line-plot-svg', true)
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        let svgGroup = d3.select('#line-view')
            .select('.line-plot-svg')
            .append('g')
            .classed('line-wrapper-group', true);

        svgGroup.append("g")
            .classed("line-x-axis", true)
            .attr("transform", "translate(0," + this.height + ")");

        svgGroup.append('text').classed('axis-label-x', true);

        svgGroup.append("g")
            .attr("class", "line-y-axis");

        svgGroup.append('text').classed('axis-label-y', true);

        let axisXLabel = d3.select('.axis-label-x')
            .text('Year')
            .style("text-anchor", "middle")
            .attr('transform', 'translate(' + (this.width/2 + this.margin.left) + ',' + (this.height + 15) + ')')

    }

    updatePlot(data, activeState, yVar) {

        //Will adjust later
        //let yVar = 'le'

        //Filter data

        let stateData = data.filter(function(d) { 
            return d['state']==activeState})

        console.log(stateData)

        let yVarLabels = {'le': 'Legislative Effectiveness', 'eg': 'Efficiency Gap'}

        //Y axis label
        let axisYLabel = d3.select('.axis-label-y')
            .text(yVarLabels[yVar])
            .style("text-anchor", "middle")
            .attr('transform', 'translate(' + (this.margin.left / 2) + ', ' + (this.height / 2) + ') rotate(-90)')

        //Find the max for the X and Y data 
        let minX = 1976;
        let maxX = 2014;

        let minY = 0;
        let maxY = 18;

        let xScale = d3.scaleLinear().range([0, this.width]).domain([minX, maxX]).nice();
        let yScale = d3.scaleLinear().range([(this.height - this.margin.bottom), 0]).domain([minY, maxY]).nice();

        //Add the x and y axis
        let xAxis = d3.select('.line-x-axis')
            .call(d3.axisBottom(xScale).ticks(4))
            .attr('transform', 'translate(' + (this.margin.left) + ',' + (this.height - this.margin.bottom) + ')');

        //tickFormat(d3.timeFormat("%Y"))

        let yAxis = d3.select('.line-y-axis')
            .call(d3.axisLeft(yScale).ticks(3))
            .attr('transform', 'translate(' + (this.margin.left) + ', 0)');

        //Add the data

        let lineSvg = d3.select('svg.line-plot-svg');

        let line = d3.line()
            .x(function(d) { return xScale(d['year']); })
            .y(function(d) { return yScale(d[yVar]); });

        for (let i = 0; i < stateData.length; i++) {

            lineSvg.append('path')
            .classed('unselected-path', true)
            .attr('d', line(eval(stateData[i][yVar])))              
            .attr('transform', 'translate(' + (this.margin.left) + ', 0)')
        
            }

        

    }
}