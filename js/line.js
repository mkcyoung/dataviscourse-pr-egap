class LinePlot {

    /** */
    
    constructor(data) {

        this.margin = { top: 20, right: 20, bottom: 20, left: 80 };
        this.width = 700 - this.margin.left - this.margin.right;
        this.height = 400 - this.margin.top - this.margin.bottom;

        this.data = data;

        this.drawPlot(data);

        this.updatePlot(data);

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

        svgGroup.append('text').classed('activeYear-background', true)
            .attr('transform', 'translate(100, 100)');

        svgGroup.append("g")
            .classed("line-x-axis", true)
            .attr("transform", "translate(0," + this.height + ")");

        svgGroup.append('text').classed('axis-label-x', true);

        svgGroup.append("g")
            .attr("class", "line-y-axis");

        svgGroup.append('text').classed('axis-label-y', true);

    }

    updatePlot(data) {

        //Find the max for the X and Y data 
        let minX = 1976;
        let maxX = 2018;

        let minY = 0;
        let maxY = 500;

        let xScale = d3.scaleLinear().range([0, this.width]).domain([minX, maxX]).nice();
        let yScale = d3.scaleLinear().range([this.height, 0]).domain([minY, maxY]).nice();

        //Add the x and y axis
        let xAxis = d3.select('.line-x-axis')
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")));//I don't know why TF all the ticks are 1969

        let yAxis = d3.select('.line-y-axis')
            .call(d3.axisLeft(yScale));

        //Add the data

        let lines = d3.select('.line-plot-svg').selectAll('path');

        console.log(data.length)

        lines
        .data(eval(data[0]['eg']))
        .enter()
        .append("path")
        .attr("fill", "steelblue")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function(d) { 
                console.log(Object.keys(d))
                return x(Object.keys(d)) })
            .y(function(d) { 
                console.log(d['year'])
                return y(d['year']) })
            )

    }
}