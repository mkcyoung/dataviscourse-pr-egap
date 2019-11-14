
/** Class for the map view */
class Map{
    /**
     * Creates a Map Object
     *
     * @param data the full dataset
     * @param updateMap a callback function used to notify other parts of the program when the selected
     * country was updated (clicked) //may use this for something later
     */
    constructor(districtData,stateData,stateTopo,gapData,activeYear) {

        //Stores data
        this.dData = districtData; //My district geojson
        this.sData = stateData; //My state geojson
        this.sTopo = stateTopo; //My state topojson (for mesh)
        this.gapData = gapData; // efficiency and le data
        this.activeYear = activeYear; //Active year via timebar

        //initializing List of active states for select multiple
        this.activeStates = [];


        //Creating scales
        
        //Finding min and max
        let eg_maxR = d3.max(this.gapData.map( d=> d.r_eg));
        let eg_maxD = d3.max(this.gapData.map( d=> d.d_eg));

        //console.log(-eg_maxD,eg_maxR)

        //Color scale on diverging red blue axis
        this.color = d3.scaleDiverging([-eg_maxR, 0, eg_maxD], d3.interpolateRdBu)

        //Margins - the bostock way
        //Width and heigth correspond to CSS grid stuff
        this.margin = {top: 20, right: 20, bottom: 20, left: 20};
        this.width = 1600 - this.margin.left - this.margin.right;
        this.height = 800 - this.margin.top-this.margin.bottom;

        //My projection I'll  be using to make the map
        this.projection = d3.geoAlbersUsa()
                           .translate([(this.width+this.margin.left+this.margin.right)/2,
                             (this.height+this.margin.top+this.margin.bottom)/2])    // translate to center of screen
                           .scale([1500]);
        //Below is what I entered into the command line to project geojson
        // geoproject 'd3.geoAlbersUsa().scale(1500).translate([800,400])' < districts093.json > d093geo_proj.json
         
    
    }

    /**
     * Renders the map
     * @param world the topojson data with the shape of all countries and a string for the activeYear
     */
    drawMap(){

        let that = this;

        //variable to determine if multiple is checked
        this.multiple = false;

        //Creating svg selection
        let mapSVG = d3.select("#mapSVG")
            .attr("height",this.height)
            .attr("width",this.width)
            .attr("transform",`translate(${this.margin.left}, ${this.margin.top})`);

        //Created rect in background that when clicked resets view
        //Might need to adjust this for buttons?
        mapSVG.append("rect")
            .attr("class", "background")
            .attr("width", this.width)
            .attr("height", this.height);

        //Create text that shows active year
        mapSVG.append("text")
            .attr("class","year-text")
            .attr("x", "650px")
            .attr("y", "70px");

        //Selects button div
        let butDiv = d3.select("#button-div")
            .style("left","40px")
            .style("top","200px");

        //Inserts text for button div
        butDiv.append("text")
            .style("left","75px")
            .style("top", "60px")
            .text("select");

        butDiv.append("text")
            .style("left","65px")
            .style("top", "200px")
            .text("color by");

        //Select single button
        d3.select("#single-button")
            .on("click", function(){
                //console.log(document.getElementById("single-button").classList.value)
                //console.log("single clicked")
                that.multiple = false;

            });
        
        //Select multiple button
        d3.select("#multiple-button")
            .on("click", function(){
                //console.log("multiple clicked")
                that.multiple = true;
                //that.updateMap();
            });

        //"color by" button


        // This converts the projected lat/lon coordinates into an SVG path string - not neccessary with preproj
        this.path_States = d3.geoPath()
            .projection(this.projection);

        //For pre-projected
        this.path = d3.geoPath()
            .projection(null);

        //Create path group for districts + states
        let pathG = mapSVG.append("g")
            .attr("id","pathG")
            .attr("cursor", "pointer");
        
        //Create group for district paths nad features
        pathG.append("g")
            .attr("id","districts");

        // Creating group for state features
        pathG.append("g")
            .attr("id","states");
           
        //Creating group for state mesh to efficiently draw borders - this won't change
        //Maybe unneccessary
        pathG.append("path")
            .datum(topojson.mesh(this.sTopo, this.sTopo.objects.states)) //, (a, b) => a !== b))
            .attr("class", "state-border")
            .attr("d", this.path_States);

        //Legend
        let g = mapSVG.append("g")
            .attr("class","map-legend")
            .attr("transform", "translate(925,90)");

        this.legend(g,this);

         //make tooltip div -- this one may be redundant
        //  d3.select("#map-view")
        //     .append("div")
        //     .attr("id", "mtooltip")
        //     .style("opacity", 0);

        //make tooltip div - more detailed info to the side
        let tooltip2 = d3.select("#map-view")
            .append("div")
            .attr("id", "mtooltip2")
            .style("opacity", 0);

        //make tooltip div - more detailed info to the side
        let tooltipD = d3.select("#map-view")
            .append("div")
            .attr("id", "mtooltipD")
            .style("opacity", 0);

        //donut group inside of svg
        mapSVG.append("g")
            .attr("id","donutG")
            // .attr("height","200px")
            // .attr("width","325px" )
            .attr("transform",`translate(${1400}, ${600})`);

        //Coloring the map with data: https://observablehq.com/@d3/choropleth

        //Calls update map to get things started
        this.updateMap()
    }

    //Updates the Map
    updateMap(){

        //console.log(this.activeYear)

        let that = this;

        //Geojson data
        let mapdata = this.dData[this.activeYear];
        let states = this.sData;
        //console.log(mapdata)
        
        //For zooming feature
        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", zoomed);

        let active = d3.select(null); 

        //Sets year text to active year
        d3.select(".year-text")
            .text(this.activeYear);

        //Reset when background is clicked
        d3.select(".background")
            .on("click", reset);//Resets map

        // Bind data and create one path per GeoJSON feature
        d3.select("#districts")
            .selectAll("path")
            .data(mapdata.features)
            //.data(mapdata.features) //pre-projected
            .join("path")
            .attr("fill", d =>
                //console.log(that.color(d.properties.r_eg))
                (d.properties.r_eg > 0) ? this.color(-d.properties.r_eg) : this.color(d.properties.d_eg)
            )
            .attr("d", this.path)
            .attr("class","district")
            .attr("id", (d) => d.properties.STATENAME.replace(/\s/g, '')+"_districts") //Removes spaces from states
            .on("mouseover", function(d){
                //District tooltip - rendered as infobox to the side
                d3.select("#mtooltipD").transition()
                    .duration(200)
                    .style("opacity", 1);
                d3.select("#mtooltipD").html(that.tooltipRenderD(d.properties))
                    .style("left","1025px") 
                    .style("top","250px"); 
            })
            .on("mouseout", function(d){    
                d3.select("#mtooltipD").transition()
                        .duration(500)
                        .style("opacity", 0);
                
            })
            .on("click",reset);

        //Bind data and create one path for states
        d3.select("#states")
            .selectAll("path")
            .data(states.features)
            .join("path")
            .attr("d", this.path_States)
            .attr("class","state")
            .attr("id", (d) => d.properties.name.replace(/\s/g, ''))
            .on("mouseover",function (d) {
                //Tooltip over state
                // d3.select("#mtooltip").transition()
                //     .duration(200)
                //     .style("opacity", 1);
                // d3.select("#mtooltip").html(that.tooltipRender(d.properties))
                //     .style("left",(d3.event.pageX+15) + "px")     //  "1300px") 
                //     .style("top", (d3.event.pageY+15) + "px");     // "500px"); 
                //Info box to the side
                d3.select("#mtooltip2").transition()
                    .duration(200)
                    .style("opacity", 1);
                d3.select("#mtooltip2").html(that.tooltipRender2(d.properties))
                    .style("left","1250px") 
                    .style("top", "425px"); 
                
            })
            .on("mouseout",function(d){
                d3.select("#mtooltip").transition()
                        .duration(500)
                        .style("opacity", 0);
                d3.select("#mtooltip2").transition()
                        .duration(500)
                        .style("opacity", 0);
                d3.select("#donutG")
                    .transition()
                    .duration(500)
                    .attr("opacity",0);
            })
            .on("click",clicked)
            //Adds little fill transition
            .transition()
            .duration(500)
            .attr("fill", d =>
                //console.log(d)
                (d.properties.r_eg_state[this.activeYear] > d.properties.d_eg_state[this.activeYear]) ? this.color(-d.properties.r_eg_state[this.activeYear]) : this.color(d.properties.d_eg_state[this.activeYear])
            );

        //On redraw, this keeps the selected states highlighted
        if(this.activeStates.length > 0){
            
            let mapSVG = d3.select("#mapSVG");
            //console.log(this.activeStates)

            this.activeStates.forEach(d => {
                //console.log("here")
                 mapSVG.select(`#${d.name}`)
                    .classed("selected-state",true);
            })
           
        }

        //Zooming functions

        //Zoom by "zoom" vs by translation

        //Uncomment to enable panning etc.
        // d3.select('#mapSVG').call(zoom);
        

        function reset() {
            console.log("in reset")
            let mapSVG = d3.select("#mapSVG");
            mapSVG.transition().duration(750).call(
              zoom.transform,
              d3.zoomIdentity,
              d3.zoomTransform(mapSVG.node()).invert([that.width / 2, that.height / 2]),
            );

            active.classed("active-state", false);
            active = d3.select(null);

            //deselects states and empties list
            mapSVG.selectAll(`.selected-state`)
                .classed("selected-state",false);
            that.activeStates = [];

            return redraw()
        }

        function redraw(){
            setTimeout(function() {
                d3.selectAll(".hidden") //Selects everything hidden
                .classed("hidden",false);
            }, 700);
        }
        
        
        function clicked(d) {

            let mapSVG = d3.select("#mapSVG");

            //If multiple is not selected, zooms like normal
            if(that.multiple == false){
                if (active.node() === this) return reset();
                active.classed("active-state", false);
                active = d3.select(this).classed("active-state", true);

                //Hides everything so zoom transition is smoother
                mapSVG.selectAll(`path:not(#${this.id}_districts)`) //Selects everything but active state districts
                    .classed("hidden",true);
                //hides button div
                d3.select("#button-div")
                    .classed("hidden",true);

                const [[x0, y0], [x1, y1]] = that.path_States.bounds(d);
                d3.event.stopPropagation();
                mapSVG.transition().duration(750).call(
                zoom.transform,
                d3.zoomIdentity
                    .translate(that.width / 2, that.height / 2)
                    .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / (that.width-600), (y1 - y0) / that.height)))
                    .translate((-(x0 + x1) / 2) - 50, -(y0 + y1) / 2),
                d3.mouse(mapSVG.node())
                );
            }
            //If multiple is selected, keep states highlighted and add to list that passes to other scripts
            else{
                //console.log(d)

                //Push selected state to list if it's not already in list
                if(!that.activeStates.includes(d.properties)){
                    that.activeStates.push(d.properties);
                }
                
                console.log(that.activeStates)

                //Pass list to other objects here


                //Keep Selected states highlighted
                mapSVG.select(`#${this.id}`)
                    .classed("selected-state",true);

               
            }


        }

        function zoomed() {
            let pathG = d3.select("#pathG");
            const {transform} = d3.event;
            pathG.attr("transform", transform);
            pathG.attr("stroke-width", 1 / transform.k);
        }

    }


    // /**
    //  * Returns html that can be used to render the tooltip for states
    //  * @param data
    //  * @returns {string}
    //  */
    // tooltipRender(data) {
    //     //console.log(data)
    //     let that = this;
    //     let text = null;
    //     text = "<h3>" + data.name + "</h3>";
    //     return text;
    // }

    /**
     * Returns html that can be used to render the tooltip for states -- more detailed on located in the side
     * Constains svg donut chart
     * @param data
     * @returns {string}
     */
    tooltipRender2(data) {
        let that = this;
        let text = null;
        //console.log(that.activeYear)
        //console.log(data)
       //console.log(data.le_state.filter(f => f.year == that.activeYear)[0].value)
        let {d_districts,r_districts} = data;
        //console.log(d_districts)
        let pie_Data = [{name: "democrats", value: d_districts[that.activeYear]},{name: "republicans", value: r_districts[that.activeYear]}];
        //console.log(pie_Data)
        let pie = d3.pie();
        // Here we tell the pie generator which attribute
        // of the object to use for the layout
        pie.value(function (d) {
            return d.value;
        });
        
        //Creating donut
        // color scale
        // A color scale for each of the slices
        let color = d3.scaleOrdinal()
            .range(['#2F88ED',
                    '#DB090C']);
        let g = d3.select("#donutG");
        g.transition().duration(200).attr("opacity",1);
        //console.log(g)
        let pied = pie(pie_Data);
        let arc = d3.arc(pied);
        // Let's tell it how large we want it
        arc.outerRadius(110);
        // We also need to give it an inner radius...
        arc.innerRadius(60);
        arc.padAngle(0.04);
        arc.cornerRadius(10);
        //Create groups
        let groups = g
            .selectAll("g")
            .data(pied);
        //Enter selection
        let groupsE = groups.enter().append('g');
        //Appending and initializing paths
        groupsE.append("path");
        groupsE.append("text");

        //Handle exits
        groups.exit().remove();
        //Merge
        groups = groups.merge(groupsE);
        // Add the path, and use the arc generator to convert the pie data to
        // an SVG shape
        groups.select("path")
            .attr("d", arc)
            // While we're at it, let's set the color of the slice using our color scale
            .style("fill", d => color(d.data.name));
        // Now let's add a label
        groups.select("text")
            .text(d => (d.data.value > 0) ? d.data.value : "")
            // We need to move the label to the middle of the slice. Our arc generator
            // is smart enough to know how to do this. Notice that arc.centroid gives us the center of the visible wedge. 
            .attr("transform", d => "translate(" + arc.centroid(d) + ")")
            // Finally some extra text styling to make it look nice:
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .style("fill","white")
            .style("font-size", "22px");

        

        text = "<h3>" + data.name + "</h3>";
        // //Adds in relevant data
        text = text + "<p>"+ data.num_districts[that.activeYear]+ " districts";
        text = text + "<p> average LE: "+ data.le_state[that.activeYear].toFixed(2)+"</p>";
        text = text + "<p> state EG: " + ((data.r_eg_state[that.activeYear] > data.d_eg_state[that.activeYear]) ? data.r_eg_state[that.activeYear].toFixed(2) : data.d_eg_state[that.activeYear].toFixed(2));
        return text;
    }

    /**
     * Returns html that can be used to render the tooltip for districts
     * @param data
     * @returns {string}
     */
    tooltipRenderD(data) {
        //console.log(data)
        let that = this;
        let text = null;
        text = "<h3>" + data.DISTRICT + "</h3>";
        return text;
    }


    // Legend Function from: https://observablehq.com/@mbostock/population-change-2017-2018
    legend (g,indic){
        let that = indic;
        const width = 300;
      
        g.append("image")
            .attr("width", width)
            .attr("height", 10)
            .attr("preserveAspectRatio", "none")
            .attr("xlink:href", that.ramp(that.color.interpolator()).toDataURL());
      
        g.append("text")
            .attr("class", "caption")
            .attr("y", -6)
            .attr("text-anchor", "start")
            .text("efficiency gap");
      
        g.call(d3.axisBottom(d3.scaleLinear(that.color.domain(), [0, width / 2, width]))
            .ticks(6)
            .tickFormat(d => `${d > 0 ? "+" : "+"}${Math.abs((d * 100).toFixed(0))}`)
            .tickSize(13))
          .select(".domain")
            .remove();
      }

    ramp(color, n = 512) {
        const {DOM, require} = new observablehq.Library;
        const canvas = DOM.canvas(n, 1); //This seems to be an issue
        const context = canvas.getContext("2d");
        canvas.style.margin = "0 -14px";
        canvas.style.width = "calc(100% + 28px)";
        canvas.style.height = "40px";
        canvas.style.imageRendering = "pixelated";
        for (let i = 0; i < n; ++i) {
          context.fillStyle = color(i / (n - 1));
          context.fillRect(i, 0, 1, 1);
        }
        return canvas;
    }

}