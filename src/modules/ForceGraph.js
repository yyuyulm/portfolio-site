import * as d3 from "d3";

function ForceGraph(svg, {
    nodes, // an iterable of node objects (typically [{id}, …])
    links // an iterable of link objects (typically [{source, target}, …])
}, {
    nodeId = d => d.id, // given d in nodes, returns a unique identifier (string)
    nodeGroup, // given d in nodes, returns an (ordinal) value for color
    nodeGroups, // an array of ordinal values representing the node groups
    nodeFill = "#fff", // node stroke fill (if not using a group color encoding)
    nodeStroke = "#fff", // node stroke color
    nodeStrokeWidth = 1, // node stroke width, in pixels
    nodeStrokeOpacity = 1, // node stroke opacity
    nodeWidth = d => d.size.width, // node radius, in pixels
    nodeHeight = d => d.size.height,
    nodeRadius = d => d.size.radius,
    nodeStrength,
    nodeTextSize = d => d.text.size,
    nodeFont = d => d.text.font,
    linkSource = ({source}) => source, // given d in links, returns a node identifier string
    linkTarget = ({target}) => target, // given d in links, returns a node identifier string
    linkType,
    linkStroke = "#999", // link stroke color
    linkStrokeOpacity = 0.6, // link stroke opacity
    linkStrokeWidth = l => Math.sqrt(l.value) * 0.1, // given d in links, returns a stroke width in pixels
    linkStrokeLinecap = "round", // link stroke linecap
    linkStrength,
    width = svgWidth, // outer width, in pixels
    height = svgHeight, // outer height, in pixels
    invalidation // when this promise resolves, stop the simulation
} = {}) {
    const N = d3.map(nodes, nodeId).map(intern);
    const LS = d3.map(links, linkSource).map(intern);
    const LT = d3.map(links, linkTarget).map(intern);
    const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);
    const W = typeof linkStrokeWidth !== "function" ? null : d3.map(links, linkStrokeWidth);
    const L = typeof linkStroke !== "function" ? null : d3.map(links, linkStroke);

    const sizeScale = d3.scaleOrdinal()
      .domain(["root", "tag", "project"])
      .range([{width: 120, height : 90, radius : 0},
        {width: 70, height : 70, radius : 35},
        {width: 80, height : 60, radius : 0}]);

    const textScale = d3.scaleOrdinal()
      .domain(["root", "tag", "project"])
      .range([{size: 24, font : null},{size: 16, font : null},{size: 16, font : null}]);

    nodes = d3.map(nodes, (_, i) => ({id: N[i],
      type: G[i],
      size: sizeScale(G[i]),
      text: textScale(G[i])}));
    links = d3.map(links, (_, i) => ({source: LS[i], target: LT[i]}));

    // Compute default domains.
    if (G && nodeGroups === undefined) nodeGroups = d3.sort(G);

    // Construct the forces.
    const forceNode = d3.forceManyBody()
      .strength(-450);

    const forceLink = d3.forceLink(links)
      .id(({index: i}) => N[i])
      .distance(80)
      .strength(0.05);
    if (nodeStrength !== undefined) forceNode.strength(nodeStrength);
    if (linkStrength !== undefined) forceLink.strength(linkStrength);

    const simulation = d3.forceSimulation(nodes)
        .force("link", forceLink)
        .force("charge", forceNode)
        .force("center",  d3.forceCenter())
        .on("tick", ticked);

    svg.selectAll("*").remove();
    
    svg.attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic; overflow: hidden");

    const backgroundText = svg.append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", 30)  
      .text("Hello, stranger.");

    const link = svg.append("g")
        .attr("stroke", typeof linkStroke !== "function" ? linkStroke : null)
        .attr("stroke-opacity", linkStrokeOpacity)
        .attr("stroke-width", typeof linkStrokeWidth !== "function" ? linkStrokeWidth : null)
        .attr("stroke-linecap", linkStrokeLinecap)
        .attr("data-zoom", true)
      .selectAll("line")
      .data(links)
      .join("line");

    const node = svg.append("g")
        .attr("fill", nodeFill)
        .attr("stroke", nodeStroke)
        .attr("stroke-opacity", nodeStrokeOpacity)
        .attr("stroke-width", nodeStrokeWidth)
        .attr("data-zoom", true)
      .selectAll("rect")
      .data(nodes)
      .join("rect")
        .attr("width", nodeWidth)
        .attr("height", nodeHeight)
        .attr("rx", nodeRadius)
        .call(drag(simulation));

    const text = svg.append("g")
        .attr("data-zoom", true)
      .selectAll("text")
      .data(nodes)
      .join("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", nodeTextSize)
        .attr("font-family", nodeFont)
        .call(drag(simulation))
        .text(nodeId);

  
    if (W) link.attr("stroke-width", ({index: i}) => W[i]);
    if (L) link.attr("stroke", ({index: i}) => L[i]);
    if (invalidation != null) invalidation.then(() => simulation.stop());
  
    function intern(value) {
      return value !== null && typeof value === "object" ? value.valueOf() : value;
    }
  
    function ticked() {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
  
      node
        .attr("x", d => d.x - d.size.width/2)
        .attr("y", d => d.y - d.size.height/2);

      text
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    }
  
    function drag(simulation) {    
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
    
    svg.call(d3.zoom().on("zoom", zoomed).transform, d3.zoomIdentity.translate(0,0).scale(4));

    svg.call(d3.zoom()
      .extent([[-width/2, -height/2], [width, height]])
      .scaleExtent([0.75, 8])
      .on("zoom", zoomed));
    
    function zoomed({transform}) {
      node.attr("transform", transform);
      text.attr("transform", transform);
      link.attr("transform", transform);
    }

    return Object.assign(svg.node());
}

export default ForceGraph;