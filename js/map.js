
/** Class for the map view */
class Map{
    /**
     * Creates a Map Object
     *
     * @param data the full dataset
     * @param updateMap a callback function used to notify other parts of the program when the selected
     * country was updated (clicked) //may use this for something later
     */
    constructor(data) {
        //Stores data
        this.data = data;

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

                        //    d3.geoAlbersUsa()
                        //    .translate([(800,400)])
                        //    .scale([1500]);
         

        //this.updateCountry = updateCountry;
    }

    /**
     * Renders the map
     * @param world the topojson data with the shape of all countries and a string for the activeYear
     */
    drawMap(mapdata,states){

        let that = this;
        //For zooming feature
        let active = d3.select(null); 

        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", zoomed);

        //Creating svg selection
        let mapSVG = d3.select(".view1").append("svg")
            .attr("id","mapSVG")
            .attr("height",this.height)
            .attr("width",this.width)
            .attr("transform",`translate(${this.margin.left}, ${this.margin.top})`);

        //Created rect in background that when clicked resets view
        mapSVG.append("rect")
            .attr("class", "background")
            .attr("width", this.width)
            .attr("height", this.height)
            .on("click", reset);//Resets map

        //Converting topo to geo - not necessary with pre-projected
        let geojson = topojson.feature(mapdata, mapdata.objects.districts093);
        console.log("geojson in map",geojson)
        let geojsonStates = topojson.feature(states, states.objects.states);
        console.log("state geojson",geojsonStates)

        // This converts the projected lat/lon coordinates into an SVG path string
        let path = d3.geoPath()
            .projection(this.projection);

        //For pre-projected
        // let path = d3.geoPath()
        //     .projection(null);

        //Create path group for districts + states
        let pathG = mapSVG.append("g")
            .attr("cursor", "pointer");
        
        
        // Bind data and create one path per GeoJSON feature
        pathG.append("g")
            .attr("id","districts")
            .selectAll("path")
            .data(geojson.features)
            //.data(mapdata.features) //pre-projected
            .join("path")
            .attr("d", path)
            .attr("class","district")
            .attr("id", (d) => d.properties.STATENAME.replace(/\s/g, '')) //Removes spaces from states
            // .on("mouseover", function(d){
            //     pathG.selectAll(`#${d.properties.STATENAME.replace(/\s/g, '')}`)
            //         .style("fill-opacity","1");
            // })
            // .on("mouseout", function(d){
            //     pathG.selectAll(`#${d.properties.STATENAME.replace(/\s/g, '')}`)
            //         .style("fill-opacity","0.5");
            // });
            .on("click",reset);
            
        
        // This could potentially create state line mesh, I need that data though
        pathG.append("g")
            .attr("id","states")
            .selectAll("path")
            .data(geojsonStates.features)
            .join("path")
            .attr("d", path)
            .attr("class","state")
            .attr("id", (d) => d.properties.name.replace(/\s/g, ''))
            .on("click",clicked);


        pathG.append("path")
            .datum(topojson.mesh(states, states.objects.states, (a, b) => a !== b))
            .attr("class", "state-border")
            .attr("d", path);


        
        //Zoom by "zoom"

        //Uncomment to enable panning etc.
        // mapSVG.call(zoom);

        function reset() {
            
            mapSVG.transition().duration(750).call(
              zoom.transform,
              d3.zoomIdentity,
              d3.zoomTransform(mapSVG.node()).invert([that.width / 2, that.height / 2]),
            );

            active.classed("active", false);
            active = d3.select(null);
            return redraw()
        }

        function redraw(){
            setTimeout(function() {
                d3.selectAll(".hidden") //Selects everything hidden
                .classed("hidden",false);
            }, 700);
        }
        
        
        function clicked(d) {
            if (active.node() === this) return reset();
            active.classed("active", false);
            active = d3.select(this).classed("active", true);

            //Hides everything so zoom transition is smoother
            mapSVG.selectAll(`path:not(#${this.id})`) //Selects everything but active state
                .classed("hidden",true);

            const [[x0, y0], [x1, y1]] = path.bounds(d);
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
        
        function zoomed() {
            const {transform} = d3.event;
            pathG.attr("transform", transform);
            pathG.attr("stroke-width", 1 / transform.k);
        }

        //Zooms by translation

        // // Zooms in on click
        // function clicked(d) {
        //     if (active.node() === this) return reset();
        //     active.classed("active", false);
        //     active = d3.select(this).classed("active", true);
            
        //     var bounds = path.bounds(d),
        //         dx = bounds[1][0] - bounds[0][0],
        //         dy = bounds[1][1] - bounds[0][1],
        //         x = (bounds[0][0] + bounds[1][0]) / 2,
        //         y = (bounds[0][1] + bounds[1][1]) / 2,
        //         scale = .9 / Math.max(dx / that.width, dy / that.height),
        //         translate = [that.width / 2 - scale * x, that.height / 2 - scale * y];
            
        //     pathG.transition()
        //         .duration(1200)
        //         .style("stroke-width", 1.5 / scale + "px")
        //         .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
        //     }
            
        // //Zooms out on click
        // function reset() {
        //     active.classed("active", false);
        //     active = d3.select(null);
            
        //     pathG.transition()
        //         .duration(1200)
        //         .style("stroke-width", "1.5px")
        //         .attr("transform", "");
        //     }

    }





}