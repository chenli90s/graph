import * as vis from 'vis'
import 'vis/dist/vis-network.min.css'
import './assets/iconfont.css'



export default class Graph{

    constructor(selector){
        this.container = document.getElementById(selector);
        this.container.style.backgroundColor = "#dddddd";
        this.options = {
            groups: {
                '公司': {
                    shape: 'icon',
                    icon: {
                        face: 'iconfont',
                        code: '\ue660',
                        size: 50,
                        color: '#407349'
                    },
                },
                '工作经历': {
                    shape: 'icon',
                    icon: {
                        face: 'iconfont',
                        code: '\ue660',
                        size: 50,
                        color: '#736749'
                    }
                },
                '投资机构': {
                    shape: 'icon',
                    icon: {
                        face: 'iconfont',
                        code: '\ue6ef',
                        size: 50,
                        color: '#4d4973'
                    }
                },
                '创投人物': {
                    shape: 'icon',
                    icon: {
                        face: 'iconfont',
                        code: '\ue749',
                        size: 50,
                        color: '#91585d'
                    }
                },
                '城市': {
                    shape: 'icon',
                    icon: {
                        face: 'iconfont',
                        code: '\ue7dc',
                        size: 50,
                        color: '#417494'
                    }
                },
                '标签': {
                    shape: 'icon',
                    icon: {
                        face: 'iconfont',
                        code: '\ue63e',
                        size: 50,
                        color: '#407349'
                    }
                }
            },
            nodes: {
                borderWidthSelected:3,
                shapeProperties: {
                    borderRadius: 6
                },
                chosen: {
                    node: (values, id, selected, hovering)=>{
                        values.shadowSize = 30;
                    }
                }
            },
            edges: {
                arrows: 'to',
                smooth: {
                    type: 'continuous',
                    roundness: 1
                },
                label:'',
                color: {
                    color: '#848484',
                    highlight: '#3b4a84',
                    hover: '#565684',
                    inherit: 'from',
                    opacity: 1.0
                },
                hoverWidth: 2
            },
            layout: {
                randomSeed: 1,
                improvedLayout: true,
                hierarchical: {
                    enabled: false,
                    levelSeparation: 150,
                    nodeSpacing: 100,
                    treeSpacing: 100,
                    blockShifting: true,
                    edgeMinimization: true,
                    parentCentralization: true,
                    direction: 'UD',        // UD, DU, LR, RL
                    sortMethod: 'hubsize'   // hubsize, directed
                }
            },
            physics: {
                timestep: 0.1,
                // adaptiveTimestep: false,
                stabilization: {
                    // enabled: true,
                    // onlyDynamicEdges: true
                    fit: false
                },
                barnesHut: {
                    gravitationalConstant: -2000,
                    centralGravity: 0.01,
                    springLength: 300,
                    springConstant: 0.001,
                    damping: 1,
                    avoidOverlap: 1
                },
            },
            interaction: {
                hover: true,
                // multiselect: true
                navigationButtons: true,
                keyboard: true
            }
        }
    }

    render(data){
        this.data = data;
        data.nodes = new vis.DataSet(data.nodes);
        data.edges = new vis.DataSet(data.edges);
        this.networker = new vis.Network(this.container, data, this.options);
    }

    addNode(node){
        this.data.nodes.add(node)
    }

    addEdge(edge){
        this.data.edges.add(edge)
    }

    addTree(datas){
        datas.nodes.forEach(item=>{
            this.addNode(item)
        });

        datas.edges.forEach(item=>{
            this.addEdge(item)
        })
    }



}
