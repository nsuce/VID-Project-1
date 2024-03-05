class Histogram {
  constructor(_config, _data, _selectedDataType) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth ||   500,
      containerHeight: _config.containerHeight ||   500,
      margin: { top:   20, right:   100, bottom:   50, left:   50 }
    };

    this.data = _data;
    this.color = _config.color || 'steelblue';
    this.selectedDataType = _selectedDataType;

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

  initVis() {
    let vis = this;

    // Calculate the width and height of the SVG drawing area
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Create the SVG element and append it to the parent element
    vis.svg = d3.select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight)
      .append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
    
    // Define the scales for the histogram
    vis.xScale = d3.scaleLinear()
      .domain([0, d3.max(vis.data, d => d.x1)])
      .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
      .domain([0, d3.max(vis.data, d => d.length) ||   0])
      .range([vis.height,   0]);
    
    // Define the brush for selection
    vis.brush = d3.brushX()
      .extent([[0, 0], [vis.width, vis.height]])
      .on("brush", brushed);
    
    // Append the bars to the SVG
    vis.svg.append("g")
      .attr("class", "brush")
      .call(vis.brush);

    vis.svg.selectAll('.bar')
      .data(vis.data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => vis.xScale(d.x0))
      .attr('width', d => vis.xScale(d.x1) - vis.xScale(d.x0) -   1)
      .attr('y', d => vis.yScale(d.length))
      .attr('height', d => vis.height - vis.yScale(d.length))
      .attr('fill', vis.color)
      .on('mouseover', function(event, d) {
        d3.select(this)
            .attr('stroke', 'black') 
            .attr('stroke-width', '2px');
          vis.tooltip.transition()
            .duration(200)
            .style('opacity', .9);
          const dataTypeLabel = vis.dataTypeLabels[vis.selectedDataType];
          vis.tooltip.html(`<div class="tooltip-content">
                          <div>${dataTypeLabel}: ${d.x0} - ${d.x1}</div>
                          <div>Count: ${d.length}</div>
                      </div>`)
            .attr('transform', `translate(${vis.xScale(d.x0) + 10}, ${vis.yScale(d.length) - 28})`);
     })
     .on('mouseout', function() {
        d3.select(this)
          .attr('stroke', 'none');
        vis.tooltip.transition()
          .duration(500)
          .style('opacity', 0);
     });

    // Append the x-axis to the SVG
    vis.svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${vis.height})`)
      .call(d3.axisBottom(vis.xScale));

    // Append the y-axis to the SVG
    vis.svg.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(vis.yScale));

    // Append the axis labels to the SVG
    vis.svg.append('text')
      .attr('class', 'x-axis-label')
      .attr('transform', `translate(${vis.width / 2}, ${vis.height + vis.config.margin.bottom/ 1.25})`)
      .style('text-anchor', 'middle')
      .text(vis.dataTypeLabels[vis.selectedDataType]);
  
    vis.svg.append('text')
      .attr('class', 'y-axis-label')
      .attr('transform', `rotate(-90) translate(-${vis.height / 2}, -${vis.config.margin.left / 1.25})`)
      .style('text-anchor', 'middle')
      .text('Count'); 
    
    
    vis.tooltip = vis.svg.append('foreignObject')
      .attr('class', 'tooltip')
      .attr('width', 250)
      .attr('height', 100)
      .style('opacity', 0)
      .html('<div class="tooltip-content"></div>');

      // Define the brushed event handler
      function brushed(event, d) {
        if (event.selection) {
           const [x0, x1] = event.selection;
           const selectedData = vis.data.filter(d => x0 <= vis.xScale(d.x0) && vis.xScale(d.x1) <= x1);
           // Highlight the selected bars
           vis.svg.selectAll(".bar")
             .attr("fill", d => selectedData.includes(d) ? "red" : vis.color);
            if (vis.config.parentElement === '#histogram1') {
            highlightedData1 = vis.data.filter(d => x0 <= vis.xScale(d.x0) && vis.xScale(d.x1) <= x1).flat();
            } else if (vis.config.parentElement === '#histogram2') {
            highlightedData2 = vis.data.filter(d => x0 <= vis.xScale(d.x0) && vis.xScale(d.x1) <= x1).flat();
            }
        } else {
           // If no selection, reset the bars to their original color
           vis.svg.selectAll(".bar")
             .attr("fill", vis.color);
          
          if (this.config.parentElement === '#histogram1') {
              highlightedData = [];
          } else if (this.config.parentElement === '#histogram2') {
              highlightedData2 = [];
          }
        }
        //Highlight the other graphs
        scatterplot.highlightVis();
        map1.highlightVis();
        map2.highlightVis();
       }
  }

  updateVis() {
    let vis = this;
  
    // Update the scales based on the new data
    vis.xScale.domain([0, d3.max(vis.data, d => d.x1)]);
    vis.yScale.domain([0, d3.max(vis.data, d => d.length) ||   0]);
  
    // Bind the new data to the bars, using a key function to ensure unique identification
    let bars = vis.svg.selectAll('.bar')
      .data(vis.data, d => d.x0 + '-' + d.x1); // Assuming x0 and x1 together uniquely identify a bar
  
    // Remove bars that no longer have data
    bars.exit().remove();
  
    // Update existing bars
    bars.transition()
      .duration(1000)
      .attr('x', d => vis.xScale(d.x0))
      .attr('width', d => vis.xScale(d.x1) - vis.xScale(d.x0) -   1)
      .attr('y', d => vis.yScale(d.length))
      .attr('height', d => vis.height - vis.yScale(d.length))
      .attr('fill', d => d.highlighted ? 'red' : vis.color);
  
    // Enter new bars
    bars.enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => vis.xScale(d.x0))
      .attr('width', d => vis.xScale(d.x1) - vis.xScale(d.x0) - 1)
      .attr('y', vis.height)
      .attr('height', 0)
      .attr('fill', vis.color)
      .on('mouseover', function(event, d) {
        console.log('Mouseover event triggered');
        d3.select(this)
            .attr('stroke', 'black') 
            .attr('stroke-width', '2px');
          vis.tooltip.transition()
            .duration(200)
            .style('opacity', .9);
          const dataTypeLabel = vis.dataTypeLabels[vis.selectedDataType];
          vis.tooltip.html(`<div class="tooltip-content">
                          <div>${dataTypeLabel}: ${d.x0} - ${d.x1}</div>
                          <div>Count: ${d.length}</div>
                      </div>`)
            .attr('transform', `translate(${vis.xScale(d.x0) + 10}, ${vis.yScale(d.length) - 28})`);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke', 'none');
          vis.tooltip.transition()
            .duration(500)
            .style('opacity', 0);
      })
      .transition()
      .duration(1000)
      .attr('y', d => vis.yScale(d.length))
      .attr('height', d => vis.height - vis.yScale(d.length));
  
    // Update the x-axis
    vis.svg.select('.x-axis')
      .transition()
      .duration(1000)
      .call(d3.axisBottom(vis.xScale));
  
    // Update the y-axis
    vis.svg.select('.y-axis')
      .transition()
      .duration(1000)
      .call(d3.axisLeft(vis.yScale));
    
    vis.svg.select('.x-axis-label')
      .text(vis.dataTypeLabels[vis.selectedDataType]);

    vis.brush.extent([[0, 0], [vis.width, vis.height]]);
    
    vis.tooltip.raise();
  }
}