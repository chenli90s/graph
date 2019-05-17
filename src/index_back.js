import * as d3 from 'd3'
import D from './D.js'

import datas from './datas'
import * as THREE from "three";



const d = new D();
// d.addObjs()

// d.createNode({x:100,y:85,z:0});
// d.createNode({x:30,y:50,z:0});
let a = {}
d.createLink({});




datas.nodes.forEach(node=>{
    d.createNode(node)
});

datas.links.forEach(link=>{
    d.createLink(link)
});

const simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id((d) => d.id))
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(80, 40));

simulation
    .nodes(datas.nodes)
    .on('tick', ticked);

simulation.force('link')
    .links(datas.links);


function z(x,y) {
    let m = (x*y)/200;
    // console.log(m);
    // if(Math.abs(m)>50){
    //     return (x/y);
    // }
    //
    // if(Math.abs(m)<50){
    //     return (x-y)/30;
    // }
    return m
}

function ticked () {

    datas.nodes.forEach((node) => {
        const { x, y, circle } = node;
        circle.position.set(x-80, y-50, z(x,y))
    });

    datas.links.forEach((link) => {
        const { source, target, line } = link;
        // console.log(new THREE.Vector3(source.x-100, source.y-60, (source.x*source.y)/300))
        link.geometry.verticesNeedUpdate = true;
        // link.geometry.vertices[0] = new THREE.Vector3(source.x-100, source.y-60, (source.x*source.y)/300);
        link.geometry.vertices[0].set(source.x-80, source.y-50, z(source.x,source.y));
        // link.geometry.vertices[1] = new THREE.Vector3(target.x-100, target.y-60, (target.x*target.y)/300);
        link.geometry.vertices[1].set(target.x-80, target.y-50, z(target.x,target.y));
    });
}









