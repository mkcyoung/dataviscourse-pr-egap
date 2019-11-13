/** Loading the data */
// d3.json('data/district_eg_le.json').then( data => {
    
//     console.log(data);

//     //Section for line chart instantiation


    
//     //Section for scatter chart instantiation
//     this.activeYear = 1980;
//     this.activeState = "Alabama";
//     let bubbleChart = new BubbleChart(data, this.activeYear, this.activeState);
//     let timeBar = new TimeBar(this.activeYear);

    

// });

// d3.json('data/line.json').then( data => {

//     /**I added this specific json to make the line chart easier to make.*/

//     console.log(data)
    
//     //Section for line chart instantiation
//     //console.log("line json",data);
//     this.activeState = "Alabama"
//     this.activeYvar = 'le'
//     let linePlot = new LinePlot(data, this.activeState, this.activeYvar);

// });




/** Loading map data */
Promise.all([
    //Map data
    d3.json('data/map_data/states.json'), //topoJSON state data
    d3.json('data/district_eg_le.json'), //District data -- at some point we should migrate all of our data loading into the same function
    d3.json('data/map_data/districts_proj.json'),

    // Scatterplot data
    d3.json('data/district_eg_le.json'),

    // Line chart data
    d3.json('data/line.json')
    
]).then(function(files){

    console.log("files", files);
    
    //Active variables
    this.activeYear = 1976;
    this.activeState = "Alabama";
    this.activeYvar = 'le';
   
    
    /** Map stuff */

    //console.log("topo",files[0].objects.districts093.geometries)
    //console.log("state",files[1])
    // console.log("pre-proj",files[2])
   // console.log("pre-projected files: ", files[2][this.activeYear].objects.districts.geometries)

    let that = this;
    

    //Efficiency gap data
    this.gapData = Object.values(files[1]); 
    //console.log(this.gapData.slice(1,5));

    //Filtering data by year
    this.egYear = this.gapData.filter( f => f.year == this.activeYear);
    //console.log("eg year",this.egYear)

    //Combining district map data with eg_le data, for every year
    //This curious syntax I have maintains object structure instead of converting to array
    Object.keys(files[2]).forEach(function(key){
            //console.log(files[2][key])
            //Key of object also acts as year
            let egYear = that.gapData.filter( f => f.year == key);
            //console.log(egYear)
            files[2][key].objects.districts.geometries.forEach(d => {
                //console.log(d.properties.STATENAME,d.properties.DISTRICT,d)
                //Something funky going on where vermont's distrtict is 0.
                if (d.properties.DISTRICT == 0){
                    d.properties.DISTRICT = 1;
                }
                
                // adds eg and le to properties
                let current = egYear.filter( f => (f.state.replace(/\s/g, '') == d.properties.STATENAME.replace(/\s/g, '')) && (f.district == d.properties.DISTRICT))[0]
                //console.log(current)

                //Throws error for district of columbia after 1982 - I'll just disregard for now
                if (current){
                    d.properties["r_eg"] = current.r_eg;
                    d.properties["d_eg"] = current.d_eg;
                    d.properties["le"] = current.le;
                    d.properties["candidate"] = current.candidate;
                    d.properties["party"] = current.party;
    
                }
            });
    });

    //I also want to combine useful data with state map for tooltip
    files[0].objects.states.geometries.forEach(d => {
        //console.log(d)
        // adds eg and le to properties
        let current = that.egYear.filter( f => (f.state.replace(/\s/g, '') == d.properties.name.replace(/\s/g, '')))
        //console.log(current)
        let current_r = current.filter(f => f.party == "republican");
        let current_d = current.filter(f => f.party == "democrat");
        let le_state = current.map( m=> (m.le != null) ? m.le : 0); //May want to calc differently
        //console.log(d3.mean(le_state));
        d.properties["r_eg_state"] = null;
        d.properties["d_eg_state"] = null;
        d.properties["le_state"] = d3.mean(le_state);
        d.properties["num_districts"] = current.length;
        d.properties["r_districts"] = current_r.length;
        d.properties["d_districts"] = current_d.length;
        d.properties["representatives"] = current;

    })

    // District topojson with properties added
    let districtData = files[2];  //[this.activeYear];
    //State topojson with properties added
    let stateData = files[0];

    let map = new Map(districtData,stateData,this.gapData,this.activeYear);
    map.drawMap()

    /** End of map stuff */


    /** Bubble chart */
    let bubbleChart = new BubbleChart(files[3], this.activeYear, this.activeState);

    /** Time bar */
    let timeBar = new TimeBar(this.activeYear,map);
    
    /**Line chart */
    let linePlot = new LinePlot(files[4], this.activeState, this.activeYvar);

    

});