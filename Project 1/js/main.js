console.log("Hello world");
// Load the CSV data
let highlightedData1 = [];
let highlightedData2 = [];
let histogram1;
let histogram2;
let scatterplot;
let map1;
let map2;
Promise.all([
  d3.json('data/counties-10m.json'),
  d3.csv('data/national_health_data.csv')
]).then(data => {
  const geoData = data[0]
  const healthData = data[1]

  //Add the health data to the geo data
  geoData.objects.counties.geometries.forEach(d => {
    for (let i = 0; i < healthData.length; i++) {
      if (d.id === healthData[i].cnty_fips) {
        d.properties.display_name = healthData[i].display_name.trim().replace(/"/g, '');
        d.properties.poverty_perc = +healthData[i].poverty_perc;
        d.properties.median_household_income = +healthData[i].median_household_income;
        d.properties.education_less_than_high_school_percent = +healthData[i].education_less_than_high_school_percent;
        d.properties.air_quality = +healthData[i].air_quality;
        d.properties.park_access = +healthData[i].park_access;
        d.properties.percent_inactive = +healthData[i].percent_inactive;
        d.properties.percent_smoking = +healthData[i].percent_smoking;
        d.properties.urban_rural_status = healthData[i].urban_rural_status;
        d.properties.elderly_percentage = +healthData[i].elderly_percentage;
        d.properties.number_of_hospitals = +healthData[i].number_of_hospitals;
        d.properties.number_of_primary_care_physicians = +healthData[i].number_of_primary_care_physicians;
        d.properties.percent_no_heath_insurance = +healthData[i].percent_no_heath_insurance;
        d.properties.percent_high_blood_pressure = +healthData[i].percent_high_blood_pressure;
        d.properties.percent_coronary_heart_disease = +healthData[i].percent_coronary_heart_disease;
        d.properties.percent_stroke = +healthData[i].percent_stroke;
        d.properties.percent_high_cholesterol = +healthData[i].percent_high_cholesterol;
      }
    }
  });

  selectedDataType1 = document.getElementById('dataType1').value;
  selectedDataType2 = document.getElementById('dataType2').value;

  // Create the histograms
  histogram1Data = d3.bin().domain([0, d3.max(healthData, d => +d[selectedDataType1])]).thresholds(20)(healthData.filter(d => +d[selectedDataType1] !== -1).map(d => +d[selectedDataType1]));
  histogram2Data = d3.bin().domain([0, d3.max(healthData, d => +d[selectedDataType2])]).thresholds(20)(healthData.filter(d => +d[selectedDataType2] !== -1).map(d => +d[selectedDataType2]));

  // Create histogram instances
  
  histogram1 = new Histogram({ parentElement: '#histogram1', color: 'steelblue' }, histogram1Data, selectedDataType1);
  histogram2 = new Histogram({ parentElement: '#histogram2', color: 'green' }, histogram2Data, selectedDataType2);
  console.log(healthData[2])
  // Process the data to create an array of objects for the scatterplot
  const scatterplotData = healthData.map(d => ({
    x: +d[selectedDataType1],
    y: +d[selectedDataType2],
    countyName: d.display_name.trim().replace(/"/g, '')
  })).filter(d => d.x !== -1 && d.y !== -1);;

  // Create the scatterplot instance
  scatterplot = new Scatterplot({ parentElement: '#scatterplot', color: 'purple' }, scatterplotData);

  map1 = new ChoroplethMap({ parentElement: '#map1'}, geoData, [selectedDataType1]);
  map2 = new ChoroplethMap({ parentElement: '#map2'}, geoData, [selectedDataType2]);
  
  document.getElementById('dataType1').addEventListener('change', updateGraphs);
  document.getElementById('dataType2').addEventListener('change', updateGraphs);

  function updateGraphs() {
    // Get the selected data types
    selectedDataType1 = document.getElementById('dataType1').value;
    selectedDataType2 = document.getElementById('dataType2').value;
   
    // Clear the highlighted data arrays
    highlightedData1 = [];
    highlightedData2 = [];
   
    // Update the histogram data
    const histogram1Data = d3.bin().domain([0, d3.max(healthData, d => +d[selectedDataType1])]).thresholds(20)(healthData.filter(d => +d[selectedDataType1] !== -1).map(d => +d[selectedDataType1]));
    const histogram2Data = d3.bin().domain([0, d3.max(healthData, d => +d[selectedDataType2])]).thresholds(20)(healthData.filter(d => +d[selectedDataType2] !== -1).map(d => +d[selectedDataType2]));
   
    // Update the data of the existing histogram instances
    histogram1.data = histogram1Data;
    histogram2.data = histogram2Data;
    histogram1.selectedDataType = selectedDataType1;
    histogram2.selectedDataType = selectedDataType2;
   
    // Redraw the histograms
    histogram1.updateVis();
    histogram2.updateVis();
   
    // Update the scatterplot data
    const scatterplotData = healthData.map(d => ({
       x: +d[selectedDataType1],
       y: +d[selectedDataType2],
       countyName: d.display_name
    })).filter(d => d.x !== -1 && d.y !== -1);
   
    // Update the scatterplot
    scatterplot.data = scatterplotData;
    scatterplot.updateVis();
   
    // Update the maps
    map1.propertyName = selectedDataType1;
    map2.propertyName = selectedDataType2;
    map1.updateVis();
    map2.updateVis();
   
    // Clear the highlighted data arrays to ensure they are reset
    highlightedData1 = [];
    highlightedData2 = [];

    //Reset the highlighted portions of the graphs
    scatterplot.highlightVis();
    map1.highlightVis();
    map2.highlightVis();
   }

}).catch(error => {
  console.error('Error loading the data:', error);
});
