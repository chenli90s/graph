import * as d3 from 'd3'


class Graph {

    drager = {
        dragstarted(d) {
            if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        },
        dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        },
        dragended(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
            if (!d3.event.active) this.simulation.alphaTarget(0.3).stop();
        },
    };

    drag = d3.drag().on('start', this.drager.dragstarted.bind(this))
        .on('drag', this.drager.dragged.bind(this))
        .on('end', this.drager.dragended.bind(this))

    constructor(element) {
        this.width = window.innerWidth
        this.height = window.innerHeight
        // 缩放比例
        this.scaleRate = 1
        this.initZoom()
        this.svg = d3.select(element).append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .call(this.zoom)

        this.simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id((d) => d.id))
            .force('collision', d3.forceCollide().radius(30))
            // .force('link', d3.forceLink().distance(400).strength(0.4))
            .force("x", d3.forceX())
            .force("y", d3.forceY())
            .force('charge', d3.forceManyBody())
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .velocityDecay(0.8);

        this.container = this.svg.append('g')
            .attr('transform-origin', `${this.width / 2}px ${this.height / 2}px 0px`)
            .attr('transform', `scale(${this.scaleRate})`);


    }


    initZoom() {
        let zoomed = () => {
            let e = d3.event.transform;
            this.container.attr("transform", e);
        };

        this.zoom = d3.zoom()
            .scaleExtent([1 / 8, 8])
            .on('zoom', zoomed)
    }

    createLineMarkers(links) {
        this.linesMarkers = this.container.append('svg:defs').selectAll('marker')
            .data(links)
            .enter().append("svg:marker")
            .attr('id', d => `marker-${d.index}`)
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 26)
            .attr('refY', 0)
            .attr('markerWidth', 12)
            .attr('markerHeight', 12)
            .attr('orient', 'auto')
            .append("svg:path")
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#666');

        this.defs = this.container.append("svg:defs").selectAll("filter")
            .data(links)
            .enter().append("svg:filter")
            .attr('filterUnits', 'userSpaceOnUse')
            .attr('id', d => `filter`)
            .attr('x', -12)
            .attr('y', -12)
            .attr('width', '160%')
            .attr('height', '160%')

        this.feGaussianBlur = this.defs.append('feGaussianBlur')
            .attr('stdDeviation', 1);

        this.feGaussianBlur.append('animate')
            .attr('id', 'filter-anim-in')
            .attr('attributeName', 'stdDeviation')
            .attr('attributeType', 'stdDeviation')
            .attr('begin', '0s')
            .attr('dur', '4s')
            .attr('fill', 'freeze')
            .attr('from', '6')
            .attr('to', '1')
            .attr('repeatCount', 'indefinite')
    }


    createLines(links) {
        this.lines = this.container
            .append("g")
            .selectAll("path")
            .data(d3.values(links))
            .enter().append("path")
            .attr('fill', '#666')
            .attr('stroke', '#666')
            .attr('id', (d, i) => `edgepath${i}`)
            .attr('marker-end', d => `url(#marker-${d.index})`)
    }

    setLinesText(links) {
        this.linesText = this.container
            .append("g")
            .selectAll(".edgelabel")
            .data(links)
            .enter()
            .append("text")
            .style("pointer-events", "none")
            .attr('class', 'edgelabel')
            .attr('id', (d, i) => `edgepath${i}`)
            .attr('dx', 100)
            .attr('dy', 0);

        this.linesText.append('textPath')
            .attr('xlink:href', (d, i) => `#edgepath${i}`)
            .style("pointer-events", "none")
            .text(d => d.value);
    }

    createNodes(nodes) {
        this.nodes = this.container.append("g").selectAll("circle")
            .data(nodes)
            .enter()
            .append("circle")
            .style("fill", '#9bdda3')
            .attr("r", 20)
            .classed("highlighted", d => d.isContradictionsPoint)
            .call(this.drag) //将当前选中的元素传到drag函数中，使顶点可以被拖动
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

        this.nodes.each(function (d) {
            d3.select(this)
                .append('title')
                .text(d => d.id)
        });
    }

    setNodesText(nodes) {
        this.nodesText = this.container.append("g").selectAll("text")
            .data(nodes)
            .enter()
            .append("text")
            .attr("dy", ".35em")
            .style('text-anchor', 'middle')
            .style('fill', '#203951')
            .style('font-size', 15)
            .attr('x', function (d) {
                // console.log(d.name+"---"+ d.name.length);
                d.name = d.id;
                d3.select(this).append('tspan')
                    .attr('x', 0)
                    .attr('y', 2)
                    .text(() => d.name)
                    .append('title')
                    .text(d => d.name);
            })
    }

    ticked = () => {
        this.nodes.attr("transform", d => `translate(${d.x},${d.y})`); //设置圆圈和文字的坐标
        this.lines.attr('d', d => `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`);
        // this.linesText.attr('transform', function (d) {
        //     if (d.target.x < d.source.x) {
        //         let bbox = this.getBBox();
        //         let rx = bbox.x + bbox.width / 2;
        //         let ry = bbox.y + bbox.height / 2;
        //         return `rotate(180 ${rx} ${ry})`;
        //     } else {
        //         return 'rotate(0)';
        //     }
        // });

        this.nodesText.attr("transform", d => `translate(${d.x},${d.y+20})`); //顶点文字
    };


    calcLayout(datas) {
        this.simulation.nodes(datas.nodes).on('tick', this.ticked);
        this.simulation.force('link').links(datas.links).distance(600).strength(0.4)
    }

    render(datas) {
        this.createLineMarkers(datas.links)
        this.createLines(datas.links)
        this.setLinesText(datas.links)
        this.createNodes(datas.nodes)
        this.setNodesText(datas.nodes)
        this.calcLayout(datas)
    }


}


export default Graph
