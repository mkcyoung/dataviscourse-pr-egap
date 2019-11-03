/** Loading the data */


/** Loading map data */
Promise.all([
    //Map data
    d3.json('data/map_data/districts093_simp.json'), //topoJSON District data for 93rd congress
    d3.json('data/map_data/states.json')
    
]).then(function(files){
    //Can either convery to geojson here or in my map script -- Ask kiran which is better
    //Will start by converting in map

    //List of the properties. ID may be useful, so will STATENAME, DISTRICT, STARTCONG and ENDCONG
        // properties:
        //     BESTDEC: ""
        //     COUNTY: ""
        //     DISTRICT: "2"
        //     DISTRICTSI: ""
        //     ENDCONG: "97"
        //     FINALNOTE: ""
        //     FROMCOUNTY: false
        //     ID: "013093097002"
        //     LASTCHANGE: "2016-05-20 13:07:46.863044"
        //     LAW: ""
        //     NOTE: "{"Shape from shapes/Ftp_Upload/Georgia_93-97cc/93-97cc_2cd_Georgia.shp (87868 bytes, last modified on Thu Jul  1 12:00:15 2010)"}"
        //     PAGE: ""
        //     RNOTE: ""
        //     STARTCONG: "93"
        //     STATENAME: "Georgia"
    console.log("topo",files[0])
    console.log("state",files[1])

    
    let map = new Map(null);
    map.drawMap(files[0],files[1])

});