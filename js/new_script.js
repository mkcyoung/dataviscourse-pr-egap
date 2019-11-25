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
    d3.json('data/district_eg_le.json'), //District eg and le data
    d3.json('data/map_data/districts_proj.json'), //pre-projected district data

    // Scatterplot data
    d3.json('data/district_eg_le.json'),

    // Line chart data
    d3.json('data/line2.json'),

    //State egap data
    d3.json('data/state_eg.csv')

    
]).then(function(files){

    console.log("files", files);
    
    //Active variables
    this.activeYear = 1976;
    this.activeState = null;
    this.activeStates = [];
    this.activeYvar = 'le';
   
    
    /** Map stuff */

    //console.log("state",files[1])
    // console.log("pre-proj",files[2])
   // console.log("pre-projected files: ", files[2][this.activeYear].objects.districts.geometries)

    let that = this;
    
    //May want to see if I can covert to geojson in here instead of doing it every time the timebar
    //is updated


    //Efficiency gap data
    this.gapData = Object.values(files[1]); 
    //console.log(this.gapData.slice(1,5));

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

            //convert to geojson
            //console.log(files[2][key])
            files[2][key] = topojson.feature(files[2][key], files[2][key].objects.districts)
    });

    //I also want to combine useful data with state map for tooltip
    //Will make key value pairs for the year and the state
    files[0].objects.states.geometries.forEach(d => {
        //console.log(d)
        // adds eg and le to properties
        // Iterates over each congress object, storing relevant values as key: value pairs bound to state objects

         d.properties["r_eg_state"] = {};
         d.properties["d_eg_state"] = {};
         d.properties["le_state"] = {};
         d.properties["num_districts"] = {};
         d.properties["r_districts"] = {};
         d.properties["d_districts"] = {};
         d.properties["representatives"] = {};

        Object.keys(files[2]).forEach(function(key){
           
            //selects current year for eg and le data
            let egYear = that.gapData.filter( f => f.year == key);
            //console.log(egYear)
            //Selects current state in that year
            let current = egYear.filter( f => (f.state.replace(/\s/g, '') == d.properties.name.replace(/\s/g, '')))
            //console.log("current state",current)
            //collects all of the republican or democtatic districts
            let current_r = current.filter(f => f.party == "republican");
            let current_d = current.filter(f => f.party == "democrat");
            let le_state = current.map( m=> (m.le != null) ? m.le : 0); //May want to calc differently
            //console.log(d3.mean(le_state));
            //selects state eg data
            let egStateYear = files[5].filter(f => f.year == key && (f.state.replace(/\s/g, '') == d.properties.name.replace(/\s/g, '')));
            //console.log(egStateYear[0])

            d.properties["r_eg_state"][key] = (egStateYear[0]) ? egStateYear[0].r_eg : null;
            d.properties["d_eg_state"][key] = (egStateYear[0]) ? egStateYear[0].d_eg : null;
            d.properties["le_state"][key] = d3.mean(le_state);
            d.properties["num_districts"][key] = current.length;
            d.properties["r_districts"][key] = current_r.length;
            d.properties["d_districts"][key] = current_d.length;
            d.properties["representatives"][key] = current;

        })

    })

    // District topojson with properties added converted to geojson
    let districtData = files[2];

    //State topojson with properties added converted to geojson
    let stateData = topojson.feature(files[0], files[0].objects.states);;

    /** End of map stuff */


    /** Bubble chart */
    let bubbleChart = new BubbleChart(files, this.activeYear, this.activeState, this.activeStates);

    /**Line chart */
    let linePlot = new LinePlot(files[4], this.activeState, this.activeYvar);
    
    /** Map */
    let map = new Map(districtData,stateData,files[0],this.gapData,this.activeYear,linePlot,bubbleChart);
    map.drawMap()

    /** Time bar */
    let timeBar = new TimeBar(this.activeYear,map,bubbleChart);

});