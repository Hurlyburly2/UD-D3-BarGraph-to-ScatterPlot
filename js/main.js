let margin = { top: 10, right: 10, bottom: 200, left: 100 }
let flag = true
let transition = d3.transition().duration(750)

let canvasWidth = 600 - margin.right - margin.left;
let canvasHeight = 500 - margin.top - margin.bottom;

let svg = d3.select("#chart-area").append("svg")
  .attr("width", canvasWidth + margin.right + margin.left)
  .attr("height", canvasHeight + margin.top + margin.bottom)
  
let graphGroup = svg.append("g")
  .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")

graphGroup.append("text")
  .attr("class", "x-axis label")
  .attr("x", canvasWidth / 2)
  .attr("y", canvasHeight + 50)
  .style("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Month")
  
let yLabel = graphGroup.append("text")
  .attr("class", "y-axis label")
  .attr("x", -(canvasHeight / 2))
  .attr("y", -60)
  .attr("text-anchor", "middle")
  .style("font-size", "20px")
  .attr("transform", "rotate(-90)")
  .text("Revenue")

let yAxisGroup = graphGroup.append("g")
  .attr("class", "y-axis")

let y = d3.scaleLinear()
  .range([canvasHeight, 0])

let xAxisGroup = graphGroup.append("g")
  .attr("class", "x-axis")
  .attr("transform", "translate(0," + canvasHeight + ")")

let x = d3.scaleBand()
  .range([0, canvasWidth])
  .paddingInner(0.3)
  .paddingOuter(0.3)

d3.json("data/revenues.json").then(data => {
  
  data.forEach(month => {
    month.revenue = parseInt(month.revenue)
    month.profit = parseInt(month.profit)
  })
  
  d3.interval(() => {
    let newData = flag ? data : data.slice(1)
    
    update(newData)
    if (flag) { flag = false }
    else { flag = true }
  }, 1000)
  update(data)
  
}).catch(error => {
  console.log(error)
})

const update = (data) => {
  let value = flag ? "revenue" : "profit" 
  
  x.domain(data.map((month) => { return month.month }))
  y.domain([0, d3.max(data, (month) => { return month[value] })])
  
  let xAxisCall = d3.axisBottom(x)
  xAxisGroup.transition(transition).call(xAxisCall)
    
  let yAxisCall = d3.axisLeft(y) 
    .tickFormat((label) => {
      return ("$" + label)
    })
  yAxisGroup.transition(transition).call(yAxisCall)
  
  let colors = d3.scaleOrdinal()
    .domain([0, d3.max(data, (month) => { return month[value] })])
    .range(d3.schemeRdBu[data.length + 2])
  
  // JOIN NEW DATA WITH OLD ELEMENTS
  let rectangles = graphGroup.selectAll("circle")
    .data(data, (data) => { return data.month })
    // ^second is a arg that returns keys that d3 matches up
    
  // EXIT old elements not present in new data
  rectangles.exit()
    .attr("fill", "red")
    .transition(transition)
      .attr("y", y(0))
      .attr("height", 0)
      .remove()

  rectangles.enter()
    .append("circle")     // applied only on enter
      .attr("fill", (month) => { return colors(month.month) })
      .attr("cy", y(0))
      .attr("cx", (month) => { return x(month.month) + (x.bandwidth() / 2) })
      .attr('r', 5)
      .merge(rectangles)      // lets you get rid of update section (stuff after this is applied on ENTER and UPDATE)
      .transition(transition)
        .attr("cx", (month) => { return x(month.month) + (x.bandwidth() / 2) })
        .attr("cy", (month) => { return y(month[value]) })
      
  let label = flag ? "Revenue" : "Profit"
  yLabel.text(label)
}
