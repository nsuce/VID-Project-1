class ChoroplethMap {

  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, propertyName) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 900,
      containerHeight: _config.containerHeight || 500,
      margin: _config.margin || {top: 20, right: 20, bottom: 100, left: 20},
      tooltipPadding: 10,
      legendBottom: 50,
      legendLeft: 50,
      legendRectHeight: 12, 
      legendRectWidth: 150
    }
    this.data = _data;

    this.us = _data;

    this.propertyName = propertyName;

    this.active = d3.select(null);

    this.initVis();
  }
  
  // Labels for the different data types
  dataTypeLabels = {
    poverty_perc: 'Poverty Percentage',
    median_household_income: 'Median Household Income',
    education_less_than_high_school_percent: 'Education less than High School Percent',
    air_quality: 'Air Quality',
    park_access: 'Park Access',
    percent_inactive: 'Percent Inactive',
    percent_smoking: 'Percent Smokers',
    elderly_percentage: 'Elderly Percentage',
    number_of_hospitals: 'Number of Hospitals',
    number_of_primary_care_physicians: 'Number of Primary Care Physicians',
    percent_no_heath_insurance: 'Percent No Health Insurance',
    percent_high_blood_pressure: 'Percent High Blood Pressure',
    percent_coronary_heart_disease: 'Percent Coronary Heart Disease',
    percent_stroke: 'Percent Stroke',
    percent_high_cholesterol: 'Percent High Cholesterol'
 };
 
  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('class', 'center-container')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    vis.svg.append('rect')
            .attr('class', 'background center-container')
            .attr('height', vis.config.containerWidth )
            .attr('width', vis.config.containerHeight)
            .on('click', vis.clicked);

  
    vis.projection = d3.geoAlbersUsa()
            .translate([vis.width /2 , vis.height / 2])
            .scale(vis.width);

    vis.colorScale = d3.scaleLinear()
      .domain(d3.extent(vis.data.objects.counties.geometries, d => d.properties[this.propertyName]))
        .range(['#cfe2f2', '#0d306b'])
        .interpolate(d3.interpolateHcl);

    vis.tooltip = vis.svg.append('text')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    vis.path = d3.geoPath()
            .projection(vis.projection);

    vis.g = vis.svg.append("g")
            .attr('class', 'center-container center-items us-state')
            .attr('transform', 'translate('+vis.config.margin.left+','+vis.config.margin.top+')')
            .attr('width', vis.width + vis.config.margin.left + vis.config.margin.right)
            .attr('height', vis.height + vis.config.margin.top + vis.config.margin.bottom)


    vis.counties = vis.g.append("g")
                .attr("id", "counties")
                .selectAll("path")
                .data(topojson.feature(vis.us, vis.us.objects.counties).features)
                .enter().append("path")
                .attr("d", vis.path)
                .attr('fill', d => {
                      if (d.properties[vis.propertyName]) {
                        return vis.colorScale(d.properties[vis.propertyName]);
                      } else {
                        return 'url(#lightstripe)';
                      }
                })
                .on("mouseover", function(event, d) {
                  d3.select(this)
                  .attr('stroke', 'black') 
                  .attr('stroke-width', '2px');
                  vis.tooltip.transition()
                      .duration(200)
                      .style("opacity", .9);
                  vis.tooltip.html(`<div class="tooltip-content">
                                      <div>County: ${d.properties.display_name}</div>
                                      <div>${vis.dataTypeLabels[vis.propertyName]}: ${d.properties[vis.propertyName]}</div>
                                    </div>`)
              })
              .on("mouseout", function() {
                d3.select(this)
                  .attr('stroke', 'none');
                  vis.tooltip.transition()
                      .duration(500)
                      .style("opacity", 0);
              });

    vis.g.append("path")
                .datum(topojson.mesh(vis.us, vis.us.objects.states, function(a, b) { return a !== b; }))
                .attr("id", "state-borders")
                .attr("d", vis.path);

    vis.svg.append('text')
                .attr('class', 'map-label')
                .attr('transform', `translate(${vis.width / 2}, ${vis.height + vis.config.margin.bottom/1.25})`) 
                .style('text-anchor', 'middle')
                .text(vis.dataTypeLabels[vis.propertyName]);
    
    vis.tooltip = vis.svg.append('foreignObject')
                .attr('class', 'tooltip')
                .attr('width', 250) 
                .attr('height', 100) 
                .style('opacity', 0)
                .html('<div class="tooltip-content"></div>');

  }

  updateVis() {
    let vis = this;
  
    // Update the color scale based on the new property
    vis.colorScale.domain(d3.extent(vis.data.objects.counties.geometries, d => d.properties[this.propertyName]));
  
  
    // Update the map
    vis.svg.selectAll("path")
      .data(topojson.feature(vis.us, vis.us.objects.counties).features)
      .join("path")
      .attr("d", vis.path)
      .attr("fill", d => {
        if (d.properties[this.propertyName]) {
          return vis.colorScale(d.properties[this.propertyName]);
        } else {
          return 'url(#lightstripe)';
        }
      });
    
      vis.g.append("path")
      .datum(topojson.mesh(vis.us, vis.us.objects.states, function(a, b) { return a !== b; }))
      .attr("id", "state-borders")
      .attr("d", vis.path);

    vis.svg.select('.map-label')
      .text(vis.dataTypeLabels[vis.propertyName]);
      
  }

  //Highlights based on the data selected from the histograms
  highlightVis(){
    let vis = this;

    const highlightedData = (this.config.parentElement === '#map1') ? highlightedData1 : highlightedData2;

    // Update the map
    vis.svg.selectAll("path")
        .data(topojson.feature(vis.us, vis.us.objects.counties).features)
        .join("path")
        .attr("d", vis.path)
        .attr("fill", d => {
            // Check if the county is in the highlightedData array
            const isHighlighted = highlightedData.includes(d.properties[this.propertyName]);
            return isHighlighted ? 'orange' : vis.colorScale(d.properties[this.propertyName]);
        })
        .attr("stroke", d => {
            // Check if the county is in the highlightedData array
            const isHighlighted = highlightedData.includes(d.properties[this.propertyName]);
            return isHighlighted ? 'red' : 'none';
        });

        vis.g.append("path")
        .datum(topojson.mesh(vis.us, vis.us.objects.states, function(a, b) { return a !== b; }))
        .attr("id", "state-borders")
        .attr("d", vis.path);
  
    }

  
}