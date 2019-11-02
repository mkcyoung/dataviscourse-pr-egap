
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
                           .scale([1500]);          // scale things down so see entire US
         

        //this.updateCountry = updateCountry;
    }

    /**
     * Renders the map
     * @param world the topojson data with the shape of all countries and a string for the activeYear
     */
    drawMap(mapdata){

        //Creating svg selection
        let mapSVG = d3.select(".view1").append("svg")
            .attr("id","mapSVG")
            .attr("height",this.height)
            .attr("width",this.width)
            .attr("transform",`translate(${this.margin.left}, ${this.margin.top})`);

        //Converting topo to geo
        let geojson = topojson.feature(mapdata, mapdata.objects.districts093);
        console.log("geojson in map",geojson)

        // This converts the projected lat/lon coordinates into an SVG path string
        let path = d3.geoPath()
            .projection(this.projection);

        // Bind data and create one path per GeoJSON feature
        d3.select("#mapSVG").selectAll("path")
            .data(geojson.features)
            .join("path")
            .attr("d", path);
    }





}