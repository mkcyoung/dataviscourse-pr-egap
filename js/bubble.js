/**
class for bubble chart
*/
class BubbleChart {

	constructor(data, activeYear, activeState) {

		this.data = Object.values(data);
		this.activeYear = activeYear;
		this.activeState = activeState;
		
		this.activeStates = null; //For multiple, this is changed in map.js when multiple states are selected

		this.margin = { top: 30, right: 20, bottom: 20, left: 80 };
        this.width = 700 - this.margin.left - this.margin.right;
        this.height = 500 - this.margin.top - this.margin.bottom;

		console.log("In bubblechart");
		console.log(Object.values(this.data)[0]);
		console.log(this.activeYear);
		console.log(this.activeState);

		this.drawChart();
		this.updateChart(this.activeYear, this.activeState);

	}

	drawChart() {

		d3.select("#scat-view")
			.append('svg').attr("id", "bubbleSVG")
	            .attr("width", this.width + this.margin.left + this.margin.right)
	            .attr("height", this.height + this.margin.top + this.margin.bottom);

	    let bubbleSVG = d3.select("#bubbleSVG");

	    // Set up the groups for axes
	    bubbleSVG.append("g")
            .classed("axis", true)
            .attr("id", "xaxis")
            .attr("transform", "translate(50, 450)");

        bubbleSVG.append("g")
            .classed("axis", true)
            .attr("id", "yaxis")
            .attr("transform", "translate(350, 30)");

        // Set up the group for activeYear text
        bubbleSVG.append("g")
        	.classed("activeYear-background", true)
        	.append("text");

        // Axis legend
		let yLegend = bubbleSVG.append("text").text("Legislative Effectiveness");
		yLegend.classed("legend", true)
				.attr("transform", "translate(330, 300) rotate(270)")
				// .attr("transform", "translate(60, 30)");

		let xLegend = bubbleSVG.append("text").text("Efficiency Gap");
		xLegend.classed("legend", true)
				.attr("transform", "translate(350, 490)")
				.attr("text-anchor", "middle");

        // tooltip
        d3.select("#scat-view").append("div")
        	.attr("id", "bubbleTooltip")
				.style("opacity", 0);
				// .style("background-color", "#fad9a7");

	}

	updateChart(activeYear, activeStates) {

		console.log("In updateChart");
		// Create a subset of the data to plot
		let subsetData = [];
		this.data.map(entry => {

			if (activeStates.includes(entry.state) && entry.year === activeYear) {
				subsetData.push(entry);
			};
		});
		console.log(subsetData);

		// x axis is efficiency gap
		let endVal = function() {
			if (Math.abs(d3.max(subsetData.map(d => +d.r_eg)))
					>= Math.abs(d3.min(subsetData.map(d => +d.r_eg)))) {
				return Math.abs(d3.max(subsetData.map(d => +d.r_eg)))
			} else {
				return Math.abs(d3.min(subsetData.map(d => +d.r_eg)))
			}
		}

		let xScale = d3.scaleLinear()
						.domain([-endVal(), endVal()])
						.range([0, this.width])
						.nice();

		// y axis is legislative effectiveness
		let yScale = d3.scaleLinear()
						.domain([
							d3.max(subsetData.map(d => +d.le)),
							d3.min(subsetData.map(d => +d.le))
						])
						.range([0, this.height-30])
						.nice();

		// Draw the axes
		let xAxis = d3.axisBottom();
		xAxis.scale(xScale);
		d3.select("#xaxis").call(xAxis);

		let yAxis = d3.axisRight();
		yAxis.scale(yScale);
		d3.select("#yaxis").call(yAxis);

		// Draw the bubbles
		let bubbleSVG = d3.select("#bubbleSVG");
		let bubbles = bubbleSVG.selectAll("circle").data(subsetData).join("circle");

		bubbles.classed("bubbles", true);

		bubbles.attr("r", 10)
				.attr("cx", d => xScale(d.r_eg))
				.attr("cy", d => yScale(d.le))
				.attr("transform", "translate(50, 30)")
				.style("fill", d => {
					if (d.party === "republican") {
						return "#D21105"
					} else {
						return "#3484EA"
					}
				});

		// bubbles.append("title").text(d => d.r_eg + " " + d.le + " " + d.party);

		// Year text
		let activeYLabel = bubbleSVG.select(".activeYear-background").select("text").text(activeYear);
		activeYLabel.attr("transform", "translate(450, 100)");

		// tooltip
		// bubbleSVG.append("div")
  //       	.attr("id", "bubbleTooltip")
		let bTooltip = d3.select("#bubbleTooltip");

		bubbles.on("mouseover", function(d) {

			let tooltipText = function() {

				let state = "<h6>" + d.state + "</h6>";
				let candidate = "<p>Candidate: <strong>" + d.candidate + "</strong></p>";
				let le = "<p>Legislative Effectiveness: " + d.le.toFixed(2) + "</p>";

				let egap = ""
				if (d.r_eg >= 0) {
					egap = "<p>Efficiency Gap: <span style='color: red;'>R+ </span>" + (d.r_eg*100).toFixed(2) + "%</p>"
				} else {
					egap = "<p>Efficiency Gap: <span style='color: blue;'>D- </span>" + (-d.r_eg*100).toFixed(2) + "%</p>"
				}
				

				return state + candidate + le + egap
			}
			// console.log(d.candidate);

			bTooltip.html(tooltipText)
					.style("opacity", 0.8)
					.style("left", (d3.event.pageX + 20) + "px")
					.style("top", (d3.event.pageY + 20) + "px");

		}).on("mouseout", function(d) {
			bTooltip.style("opacity", 0);
		});
	}

}