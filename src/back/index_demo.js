import * as d3 from 'd3'
import datas from './datas'


const width = window.innerWidth - 17;
const height = window.innerHeight;

const graph = {
    nodes: datas.nodes,
    links: datas.links,
    scaleRate: 1,
    categoryKeys: ["案件", "人物", "关系", "事件", "属性"]
};

var colors = d3.schemeCategory10;


// graph.scaleRate = (width * height) / (1800 * 1800);




// console.log(graph)

// console.log(d3.values(graph.nodes))

graph.simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id((d) => d.id))
    .force('collision', d3.forceCollide().radius(30))
    // .force('link', d3.forceLink().distance(400).strength(0.4))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(width/2, height/2))
    .velocityDecay(0.8);

graph.simulation.nodes(graph.nodes).on('tick', () => {
    graph.nodess.attr("transform", d => `translate(${d.x},${d.y})`); //设置圆圈和文字的坐标
    graph.lines.attr('d', d => `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`);
    graph.linesText.attr('transform', function (d) {
        if (d.target.x < d.source.x) {
            let bbox = this.getBBox();
            let rx = bbox.x + bbox.width / 2;
            let ry = bbox.y + bbox.height / 2;
            return `rotate(180 ${rx} ${ry})`;
        } else {
            return 'rotate(0)';
        }
    });

    graph.nodesText.attr("transform", d => `translate(${d.x},${d.y+20})`); //顶点文字
});

graph.simulation.force('link').links(graph.links).distance(500).strength(0.4)

//定义缩放事件
let zoom = d3.zoom()
    .scaleExtent([1/8, 8])
    .on("zoom", zoomed);


function zoomed() {
    // console.log(d3.event)
    let e = d3.event.transform;
    // graph.container.attr("transform", `scale(${e.k})`);
    // graph.container.attr("transform", `translate(${e.x}, ${e.y})`)
    graph.container.attr("transform", e);

}

//定义拖拽事件
let dragstarted = (d) => {
    if (!d3.event.active) graph.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

let dragged=(d) => {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

let dragended = (d) => {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
    if (!d3.event.active) graph.simulation.alphaTarget(0.3).stop();
}

let drag = d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);

console.log('demo')


//移除已渲染
// d3.select(".map svg").remove();
//添加画布svg，对画布进行缩放
graph.svg = d3.select("#chart").append("svg")
    .attr('width', width)
    .attr('height', height)
    .call(zoom)


// console.log(width, height)
// graph.svg.call(zoom);

//添加捕获鼠标事件的背景
// graph.svg.append("rect")
//     .attr('width', width)
//     .attr('height', height)
    // .attr('class', 'map-background')


// console.log(`${width / 2}px ${height / 2}px 0px`)
//改变装图谱直接容器的缩放中心点，默认缩小到刚好显示完图谱
graph.container = graph.svg.append("g")
    .attr('transform-origin', `${width / 2}px ${height / 2}px 0px`)
    .attr('transform', `scale(${graph.scaleRate})`);




// console.log(graph.container)

//(1)创建箭头
graph.linesMarkers = graph.container.append("svg:defs").selectAll("marker")
    .data(graph.links)
    .enter().append("svg:marker")
    .attr('id',  d => `marker-${d.index}`)
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 28)
    .attr('refY', 0)
    .attr('markerWidth', 12)
    .attr('markerHeight', 12)
    .attr('orient', 'auto')
    .append("svg:path")
    .attr('d','M0,-5L10,0L0,5')
    .attr('fill', '#666');

//箭头颜色;
graph.defs = graph.container.append("svg:defs").selectAll("filter")
    .data(graph.links)
    .enter().append("svg:filter")
    .attr('filterUnits', 'userSpaceOnUse')
    .attr('id', d => `filter`)
    .attr('x', -12)
    .attr('y', -12)
    .attr('width', '160%')
    .attr('height', '160%')

graph.feGaussianBlur = graph.defs.append('feGaussianBlur')
    .attr('stdDeviation', 1);

graph.feGaussianBlur.append('animate')
    .attr('id', 'filter-anim-in')
    .attr('attributeName', 'stdDeviation')
    .attr('attributeType', 'stdDeviation')
    .attr('begin', '0s')
    .attr('dur', '4s')
    .attr('fill', 'freeze')
    .attr('from', '6')
    .attr('to', '1')
    .attr('repeatCount', 'indefinite')

//(2)根据连线类型,引用上面创建的标记
graph.lines = graph.container.append("g").selectAll("path")
    .data(d3.values(graph.links))
    .enter().append("path")
    .attr('fill', '#666')
    .attr('stroke', '#666')
    .attr('id', (d, i) => `edgepath${i}`)
    .attr('marker-end', d => `url(#marker-${d.index})`)

// (3)设置线条上的文字
graph.linesText = graph.container.append("g").selectAll(".edgelabel")
    .data(graph.links)
    .enter()
    .append("text")
    .style("pointer-events", "none")
    .attr('class', 'edgelabel')
    .attr('id', (d, i) => `edgepath${i}`)
    .attr('dx', 100)
    .attr('dy', 0);


graph.linesText.append('textPath')
    .attr('xlink:href', (d, i) => `#edgepath${i}`)
    .style("pointer-events", "none")
    .text(d => d.value);

//(4)圆圈节
graph.nodess = graph.container.append("g").selectAll("circle")
    .data(graph.nodes)
    .enter()
    .append("circle")
    .style("fill", '#9bdda3')
    .attr("r", 20)
    .classed("highlighted", d => d.isContradictionsPoint)
    .call(drag) //将当前选中的元素传到drag函数中，使顶点可以被拖动
    .on("dblclick", d => {
        d3.event.stopPropagation();
        // d.fixed = false;
    })
    .on('mouseover', d => {
        if (d.isContradictionsPoint) {
            // highlightObject(d);
        }
    })
    .on('mouseout', () => {
        // highlightObject(null);
    });

graph.nodess.each(function (d) {
    d3.select(this)
        .append('title')
        .text(d => d.id)
});

//(4)圆圈节点内文字
graph.nodesText = graph.container.append("g").selectAll("text")
    .data(graph.nodes)
    .enter()
    .append("text")
    .attr("dy", ".35em")
    .style('text-anchor', 'middle')
    .style('fill', '#203951')
    .style('font-size', 15)
    .attr('x', function (d) {
        // console.log(d.name+"---"+ d.name.length);
        d.name = d.id
        d3.select(this).append('tspan')
                .attr('x', 0)
                .attr('y', 2)
                .text(() => d.name)
                .append('title')
                .text(d => d.name);
        // 对文字做折行处理
        // if (d.name.length <= 4) {
        //     d3.select(this).append('tspan')
        //         .attr('x', 0)
        //         .attr('y', 2)
        //         .text(() => d.name)
        //         .append('title')
        //         .text(d => d.name);
        // } else {
        //     let top = d.name.substring(0, 4);
        //     d3.select(this).text(() => '');
        //     if (d.name.length > 4 && d.name.length <= 8) {
        //         d3.select(this).append('tspan')
        //             .attr('x', 0)
        //             .attr('y', '-0.5em')
        //             .text(() => top);
        //         let bot = d.name.substring(4, 8);
        //         d3.select(this).append('tspan')
        //             .attr('x', 0)
        //             .attr('y', '1em')
        //             .text(() => bot);
        //     } else {
        //         let bot = d.name.substring(4, 8);
        //         d3.select(this).append('tspan')
        //             .attr('x', 0)
        //             .attr('y', '-1em')
        //             .text(() => top);
        //         d3.select(this).append('tspan')
        //             .attr('x', 0)
        //             .attr('y', '0.6em')
        //             .text(() => bot);
        //         let bott = '...';
        //         d3.select(this).append('tspan')
        //             .attr('x', 0)
        //             .attr('y', '1.5em')
        //             .text(() => bott);
        //     }
        // }
    });



