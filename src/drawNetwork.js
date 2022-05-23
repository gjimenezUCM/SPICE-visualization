import { DataSet } from "vis-data/peer";
import { Network } from "vis-network/peer";

export default class DrawNetwork {


    constructor(jsonInput, container) {
        this.container = container;

        this.activateEdgeLabels = true;

        //Edges with value equal or below to this wont be drawn
        this.edgeValueThreshold = document.getElementById('edgeThreshold').value;

        //In case value key changes, this is what is compared while parsing edges json
        this.edgeValue = "value";

        //In case explicit_community key changes, this is what is compared while parsing nodes json
        this.groupColor_key = "explicit_community";

        this.groupColor = new Array();
        this.groupColor.push({color: "#6E6EFD", border: "#5C5CEB"}); //Blue
        this.groupColor.push({color: "#FF8284", border: "#E06467"}); //Red
        this.groupColor.push({color: "#000000", border: "#000000"}); //Black to track untracker groups

        //BOUNDING GROUPS BOXES
        //In case group key changes, this is what is compared while parsing nodes json
        this.boxGroup_key = "group";

        this.boxBorderWidth = 3;

        this.boxGroupColor = new Array();
        this.boxGroupColor.push({color: "#F8D4FB", border: "#F2A9F9"}); //Purple
        this.boxGroupColor.push({color: "#FFFFAA", border: "#FFDE78"}); //Yellow
        this.boxGroupColor.push({color: "#D3F5C0", border: "#A9DD8C"}); //Green
        this.boxGroupColor.push({color: "#FED4D5", border: "#FC999C"}); //Red
        this.boxGroupColor.push({color: "#DCEBFE", border: "#A8C9F8"}); //Blue


        this.parseJson(jsonInput);
        this.chooseOptions(jsonInput);

        this.drawNetwork();
    }



    parseJson(json) {
        //Get nodes from json
        const nodes = this.parseNodes(json);
        const edges = this.parseEdges(json);

        this.data = {
            nodes: nodes,
            edges: edges
        };
    }

    parseNodes(json) {
        for (const node of json.users) {

            //"BoxGroup" is the key we will use to track what nodes should be inside the same big bounding box
            node["boxGroup"] = parseInt(node[this.boxGroup_key]);

            //Vis uses "group" key to change the color of all nodes with the same key
            node["group"] = "group_" + node[this.groupColor_key]
            delete node[this.groupColor_key];
        }
        const nodes = new DataSet(json.users);
        return nodes;
    }

    parseEdges(json) {
        //Get edges from json
        for (const edge of json.similarity) {
            //Update targets to vis format
            edge["from"] = edge["u1"];
            edge["to"] = edge["u2"];

            delete edge["u1"];
            delete edge["u2"];

            //Vis use "value" key to change edges width. This way edges with higher similarity will be stronger
            edge["value"] = edge[this.edgeValue];
            if (this.edgeValue !== "value")
                delete edge[this.edgeValue];

            //Vis use "label" key to show text above each edge. We can use it to see the similarity of each edge
            if (this.activateEdgeLabels)
                edge["label"] = edge["value"].toString();

            edge["hidden"] = false;
        }
        const edges = new DataSet(json.similarity);

        return edges;
    }

    chooseOptions() {
        this.options = {
            edges: {
                scaling: {
                    min: 3,
                    max: 15,
                    label: {
                        enabled: false
                    }
                },
                font: {
                    strokeWidth: 0,
                    size: 20,
                    color: "#000000"
                }
            },
            nodes: {
                shape: 'circle',
                widthConstraint: 30,
                font: {
                    size: 20
                },
            },
            groups: {
                group_0: {
                    color: {
                        background: this.groupColor[0].color,
                        border: this.groupColor[0].border
                    }
                },
                group_1: {
                    color: {
                        background: this.groupColor[1].color,
                        border: this.groupColor[1].border
                    }
                },
                group_2: {
                    color: {
                        background: this.groupColor[2].color,
                        border: this.groupColor[2].border
                    }
                }
            },
            physics: {
                enabled: false
            }
        };
    }

    drawNetwork() {
        this.counter = 0;

        this.network = new Network(this.container, this.data, this.options);
        this.hideEdgesbelowThreshold();

    }

    //This event is executed for every node and edge
    preDrawEvent(ctx) {
        this.counter++;
        console.log("PreDraw Event" + this.counter);

        const bigBoundBoxes = new Array();
        bigBoundBoxes.push(null);
        bigBoundBoxes.push(null);
        bigBoundBoxes.push(null);
        bigBoundBoxes.push(null);
        bigBoundBoxes.push(null);


        //Obtain the bounding box of every boxGroup of nodes
        this.data.nodes.forEach((node) => {
            const group = node["boxGroup"];

            let bb = this.network.getBoundingBox(node.id)
            if (bigBoundBoxes[group] === null) {
                bigBoundBoxes[group] = bb;
            } else {
                if (bb.left < bigBoundBoxes[group].left) {
                    bigBoundBoxes[group].left = bb.left;
                }
                if (bb.top < bigBoundBoxes[group].top) {
                    bigBoundBoxes[group].top = bb.top;
                }
                if (bb.right > bigBoundBoxes[group].right) {
                    bigBoundBoxes[group].right = bb.right;
                }
                if (bb.bottom > bigBoundBoxes[group].bottom) {
                    bigBoundBoxes[group].bottom = bb.bottom;
                }

            }

        })
        //Draw the bounding box of all groups
        for(let i = 0; i < bigBoundBoxes.length; i++ ){
            if( bigBoundBoxes[i] !== null){
                const bb = bigBoundBoxes[i];

                ctx.fillStyle = this.boxGroupColor[i].border;
                ctx.fillRect(bb.left-this.boxBorderWidth, bb.top-this.boxBorderWidth, bb.right - bb.left +this.boxBorderWidth*2, bb.bottom - bb.top+this.boxBorderWidth*2);

                ctx.fillStyle = this.boxGroupColor[i].color;
                ctx.fillRect(bb.left, bb.top, bb.right - bb.left , bb.bottom - bb.top);
            }
        }
 
    }

    clearNetwork() {
        this.network.destroy();
    }


    hideEdgesbelowThreshold() {
        this.network.off("beforeDrawing");

        this.data.edges.forEach((edge) => {

            if (edge["value"] < this.edgeValueThreshold) {
                if (edge["hidden"] === false) {
                    edge["hidden"] = true;
                    this.data.edges.update(edge);
                }
            } else {
                if (edge["hidden"] === true) {
                    edge["hidden"] = false;
                    this.data.edges.update(edge);
                }
            }
        })

        this.network.on("beforeDrawing", (ctx) => this.preDrawEvent(ctx));
    }
}