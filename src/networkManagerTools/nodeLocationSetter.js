
import { nodes } from "../constants/nodes";
import { comms } from "../constants/communities";

export default class nodeLocationSetter {

    constructor(nodes, n) {
        this.setNodeLocation(nodes, n);
    }

    setNodeLocation(nodes, n) {
        const nAreas = n;

        const networkPartitions = this.createNetworkPartitions(nodes.length, nAreas);
        const nodesGrouped = {};

        for (let i = 0; i < n; i++) {
            nodesGrouped[i] = {
                nodes: new Array(),
                partition: {
                    center: networkPartitions[i],
                    size: 0
                }
            }
        }

        //Insert the nodes in each nodeGroup
        nodes.forEach((node) => {
            const group = node[comms.ImplUserNewKey];

            nodesGrouped[group].nodes.push(node.id);
            nodesGrouped[group].partition.size++;
        });

        //Set the location for all nodes
        nodes.forEach((node) => {

            const group = node[comms.ImplUserNewKey];
            const nodePos = this.getNodePos(nodesGrouped[group], node.id);

            node.x = nodePos.x;
            node.y = nodePos.y;
        });
    }

    //Divide the network total area in slices/Angles/partitions to draw each group node in diferent areas
    createNetworkPartitions(nNodes, nAreas) {
        const clusterDistance = nodes.nodeGroupsBaseDistance * nNodes / 45;
        const partitions = {};

        //Separate the network area in as many angle slices as necesary
        const angleSlice = 360 / nAreas;
        let targetAngle = 0;

        //Increase the target angle for every group, and set the location of the partition
        for (let i = 0; targetAngle < 360; i++) {
            partitions[i] = {
                x: Math.cos(targetAngle * (Math.PI / 180)) * (clusterDistance * nAreas),
                y: Math.sin(targetAngle * (Math.PI / 180)) * (clusterDistance * nAreas)
            };

            targetAngle += angleSlice;
        }

        return partitions;
    }

    getNodePos(nodeGroup, nodeId) {
        const size = nodeGroup.partition.size;
        const center = nodeGroup.partition.center;

        const angleSlice = 360 / size;
        let targetAngle = angleSlice * nodeGroup.nodes.indexOf(nodeId);
        const output = {
            x: center.x + Math.cos(targetAngle * (Math.PI / 180)) * size * 19,
            y: center.y + Math.sin(targetAngle * (Math.PI / 180)) * size * 10
        };

        return output;
    }
}