class Scatterplot {
  constructor(_config, _data) {
    this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth ||   800,
        containerHeight: _config.containerHeight ||   500,
        margin: { top:   20, right:   20, bottom:   50, left:   80 }
    };

    this.data = _data;
    this.color = _config.color || 'steelblue';

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

    // Define the scales for the scatterplot
    vis.xScale = d3.scaleLinear()
      .domain(d3.extent(vis.data, d => d.x))
      .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
      .domain(d3.extent(vis.data, d => d.y))
      .range([vis.height,   0]);

    vis.tooltip = vis.svg.append('text')
      .attr('class', 'tooltip')
      .style('opacity', 0);
    
    // Define the brush for selection. Currently doesn't do anything besides highlight in the scatterplot
    vis.brush = d3.brush()
      .extent([[0, 0], [vis.width, vis.height]])
      .on("brush", brushed);

    vis.svg.append("g")
      .attr("class", "brush")
      .call(vis.brush);

    // Add the scatterplot
    vis.svg.selectAll('.dot')
      .data(vis.data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => vis.xScale(d.x))
      .attr('cy', d => vis.yScale(d.y))
      .attr('r',   5)
      .attr('fill', vis.color)
      //Mousover event listener
      .on('mouseover', function(event, d) {
        d3.select(this)
            .attr('stroke', 'black') 
            .attr('stroke-width', '2px');
        vis.tooltip.transition()
           .duration(200)
           .style('opacity', .9);
        const dataTypeLabel1 = vis.dataTypeLabels[selectedDataType1];
        const dataTypeLabel2 = vis.dataTypeLabels[selectedDataType2];
        vis.tooltip.html(`<div class="tooltip-content">
                          <div>County: ${d.countyName}</div>
                          <div>${dataTypeLabel1}: ${d.x}</div>
                          <div>${dataTypeLabel2}: ${d.y}</div>
                        </div>`)
           .attr('transform', `translate(${vis.xScale(d.x) + 10}, ${vis.yScale(d.y) - 28})`);
      })
      // Add mouseout event listener
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke', 'none');
        vis.tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    // Add axes
    vis.svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${vis.height})`)
      .call(d3.axisBottom(vis.xScale));

    vis.svg.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(vis.yScale));

    // Add axis labels to the SVG
    vis.svg.append('text')
      .attr('class', 'x-axis-label')
      .attr('transform', `translate(${vis.width / 2}, ${vis.height + vis.config.margin.bottom/ 1.25})`)
      .style('text-anchor', 'middle')
      .text(vis.dataTypeLabels[selectedDataType1]);
  
    // Append the tooltip to the SVG
    vis.svg.append('text')
        .attr('class', 'y-axis-label')
        .attr('transform', `rotate(-90) translate(-${vis.height / 2}, -${vis.config.margin.left/1.25})`)
        .style('text-anchor', 'middle')
        .text(vis.dataTypeLabels[selectedDataType2]); 
    
    vis.tooltip = vis.svg.append('foreignObject')
      .attr('class', 'tooltip')
      .attr('width', 250)
      .attr('height', 100)
      .style('opacity', 0)
      .html('<div class="tooltip-content"></div>');
    
    vis.tooltip.raise();

    // Define the brushed event handler. Currently doesn't do anything besides highlight in the scatterplot
    function brushed(event, d) {
      if (event.selection) {
         const [[x0, y0], [x1, y1]] = event.selection;
         const selectedData = vis.data.filter(d => x0 <= vis.xScale(d.x) && vis.xScale(d.x) <= x1 && y0 <= vis.yScale(d.y) && vis.yScale(d.y) <= y1);
         // Highlight the selected points
         vis.svg.selectAll(".dot")
           .attr("fill", d => selectedData.includes(d) ? "orange" : vis.color);
      } else {
         // If no selection, reset the points to their original color
         vis.svg.selectAll(".dot")
           .attr("fill", vis.color);
      }
     }
  }

  updateVis() {
    let vis = this;
  
    // Update the scales based on the new data
    vis.xScale.domain(d3.extent(vis.data, d => d.x));
    vis.yScale.domain(d3.extent(vis.data, d => d.y));
  
    // Bind the new data to the dots
    let dots = vis.svg.selectAll('.dot')
      .data(vis.data);
  
    // Remove dots that no longer have data
    dots.exit().remove();
  
    // Update existing dots
    dots.transition()
      .duration(1000)
      .attr('cx', d => vis.xScale(d.x))
      .attr('cy', d => vis.yScale(d.y));
  
    // Enter new dots
    dots.enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => vis.xScale(d.x))
      .attr('cy', d => vis.yScale(d.y))
      .attr('r',   5)
      .attr('fill', vis.color)
      .transition()
      .duration(1000)
      .attr('cx', d => vis.xScale(d.x))
      .attr('cy', d => vis.yScale(d.y));

    // Update the x-axis
    vis.svg.select('.x-axis')
      .transition()
      .duration(1000)
      .call(d3.axisBottom(vis.xScale));
    
    vis.brush.extent([[0, 0], [vis.width, vis.height]]);
    
    // Update the y-axis
    vis.svg.select('.y-axis')
      .transition()
      .duration(1000)
      .call(d3.axisLeft(vis.yScale));
    
    vis.svg.select('.x-axis-label')
      .text(vis.dataTypeLabels[selectedDataType1]);

    vis.svg.select('.y-axis-label')
      .text(vis.dataTypeLabels[selectedDataType2]);
    
    vis.tooltip.raise();
  }

  //Highlights based on the data selected from the histograms
  highlightVis(){
    let vis = this;

    let dots = vis.svg.selectAll('.dot')
      .data(vis.data);
      
    dots.transition()
      .duration(1000)
      .attr('cx', d => vis.xScale(d.x))
      .attr('cy', d => vis.yScale(d.y))
      .attr('fill', d => {
        // Check if the scatterplot data point is in the highlightedData arrays
        const isHighlighted1 = highlightedData1.includes(d.x) || (highlightedData1.length === 0 && highlightedData2.length !== 0);
        const isHighlighted2 = highlightedData2.includes(d.y) || (highlightedData2.length === 0 && highlightedData1.length !== 0); 
        return isHighlighted1 && isHighlighted2 ? 'orange' : vis.color;
     });
  }
}
