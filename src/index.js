import * as d3 from 'd3'
import datas from 'datas'


const simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id((d) => d.id))
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(80, 40));




