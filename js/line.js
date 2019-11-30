class LinePlot {

    /** */
    
    constructor(data, activeState, activeYvar, activeStates) {

        this.margin = { top: 30, right: 20, bottom: 20, left: 80 };
        this.width = 700 - this.margin.left - this.margin.right;
        this.height = 530 - this.margin.top - this.margin.bottom;
        this.data = data;
        this.activeState = activeState;
        this.activeYvar = activeYvar;

        this.activeStates = null; //For multiple, this is changed in map.js when multiple states are selected

        this.data = data;
        this.drawPlot(data);
        this.updatePlot(this.activeState, this.activeYvar, this.activeStates);

    }

    /** */

    drawPlot(data) {

        d3.select('#line-view')
            .append('div')
            .attr("id", "line-tooltip")
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

    updatePlot(activeState, yVar, activeStates) {

        let lineSvg = d3.select('svg.line-plot-svg');
        lineSvg.selectAll('path').data([]).exit().remove()

        //console.log(this.data)

        //Filter data

        let stateName = 'US'

        if (activeState != null) {
            stateName = activeState['name']
        } 

        if (activeStates == null) { activeStates = [] }

        console.log(activeStates)

        let stateData = this.data.filter(function(d) { 
        return d['state']==stateName})
        
        /**
        if (activeStates.length > 0) {
            stateData = this.data.filter(function(d) { 
            return d['state'] in activeStates})
        }
        */
       
        console.log(stateData)

        let democraticStateData = stateData.filter(function(d) {
            return d['party']=='democrat'})

        let republicanStateData = stateData.filter(function(d) {
            return d['party']=='republican'})

        let yVarLabels = {'le': 'Legislative Effectiveness', 'eg': 'Efficiency Gap'}

        //Y axis label
        let axisYLabel = d3.select('.axis-label-y')
            .text(yVarLabels[yVar])
            .style("text-anchor", "middle")
            .attr('transform', 'translate(' + (this.margin.left / 2) + ', ' + (this.height / 2) + ') rotate(-90)')

        //Find the max for the X and Y data 

        function maxYfinder(data) {
            let maxY = eval(data[0]['axis_max'])[0][yVar]
            return maxY
        }

        function minYfinder(yVar) {
            let minY = 0;
            if (yVar=='eg') {
                minY = -0.5
            }
            return minY
        }

        let minX = 1976;
        let maxX = 2018;

        let minY = minYfinder(yVar);
        let maxY = maxYfinder(stateData);

        let xScale = d3.scaleLinear().range([0, this.width]).domain([minX, maxX]).nice();
        let yScale = d3.scaleLinear().range([(this.height - this.margin.bottom - this.margin.top), 0]).domain([minY, maxY]).nice();

        //Add the x and y axis
        let xAxis = d3.select('.line-x-axis')
            .call(d3.axisBottom(xScale).ticks(4).tickFormat(d3.format(".0f")))
            .attr('transform', 'translate(' + (this.margin.left) + ',' + (this.height - this.margin.bottom - this.margin.top) + ')');

        let yAxis = d3.select('.line-y-axis')
            .call(d3.axisLeft(yScale).ticks(4))
            .attr('transform', 'translate(' + (this.margin.left) + ', 0)');

        //Add the data

        let line = d3.line()
            .x(function(d) { return xScale(d['year']); })
            .y(function(d) { return yScale(d[yVar]); });

        console.log(democraticStateData)
        console.log(republicanStateData)

        for (let i = 0; i < democraticStateData.length; i++) {

            console.log(democraticStateData[i])

            lineSvg.append('path')
            .classed('democratic-path', true)
            .classed("district-" + democraticStateData[i].district, true)
            .attr('d', line(eval(democraticStateData[i][yVar])))              
            .attr('transform', 'translate(' + (this.margin.left) + ', 0)')
            .attr('id', i)
        
        }

        for (let i = 0; i < republicanStateData.length; i++) {

            lineSvg.append('path')
            .classed('republican-path', true)
            .classed("district-" + republicanStateData[i].district, true)
            .attr('d', line(eval(republicanStateData[i][yVar])))              
            .attr('transform', 'translate(' + (this.margin.left) + ', 0)')
            .attr('id', i)

        }

        let tooltip = d3.select("#line-tooltip")

        function textGenerator(pathObject, i) {
            if (pathObject.getAttribute('class')=='democratic-path') {
                
                let name = "<h6>" + democraticStateData[i]['name'] + "</h6>";
                let state = "<p>" + democraticStateData[i]['state'] + "</p>";
                let district = "<p>" + "District " + democraticStateData[i]['district'] + "</p>";

                return name + state + district

            } else {

                let name = "<h6>" + republicanStateData[i]['name'] + "</h6>";
                let state = "<p>" + republicanStateData[i]['state'] + "</p>";
                let district = "<p>" + "District " + republicanStateData[i]['district'] + "</p>";

                return name + state + district

            }
        }

        lineSvg.selectAll('path').on("mouseover", function() {
            
            //console.log(this)

            let i = this.getAttribute('id')

            let tooltiptext = textGenerator(this, i)

            //console.log(tooltiptext)

            tooltip.style("opacity", 0.8)
            .style("left", (d3.event.pageX + 20) + "px")
            .style("top", (d3.event.pageY + 20) + "px")
            .html(tooltiptext);
        })
        .on("mouseout", function(d) {
		tooltip.style("opacity", 0);})

    }
}