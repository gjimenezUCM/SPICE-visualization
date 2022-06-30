/**
 * @fileoverview This class change the node position in the network to group nodes with the same "group" value
 * and evade possible bounding box overlaps
 * @author Marco Expósito Pérez
 */

//Namespaces
import { nodes } from "../constants/nodes";
import { comms } from "../constants/communities";

export default class nodeLocationSetter {

    /**
     * Constructor of the class
     * @param {DataSet} nodes nodes whose position will change
     * @param {Integer} n number of node groups / number of areas to set nodes to
     */
    constructor(nodes, n) {
        this.setNodeLocation(nodes, n);
    }

    /**
     * Divide the network canvas in slices and set the node location to their correspondent slice
     * @param {DataSet} nodes nodes whose position will change
     * @param {Integer} n number of node groups / number of areas to set nodes to
     */
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

    /**
     * Divide the network canvas area in slices/angles/partitions to draw each group node in diferent areas
     * @param {Integer} nNodes number of total nodes used to increase the distance between the center of the partitions
     * @param {Integer} nAreas number of total areas in the canvas
     * @returns {Object[]} returns an array of objects with the partitions
     * Format-> { x: (Integer), y: (Integer) }
     */
    createNetworkPartitions(nNodes, nAreas) {
        const partitionsDistance = nodes.nodeGroupsBaseDistance * nNodes / 45;
        const partitions = {};

        //Separate the network area in as many angle slices as necesary
        const angleSlice = 360 / nAreas;
        let targetAngle = 0;

        //Increase the target angle for every group, and set the location of the partition
        for (let i = 0; targetAngle < 360; i++) {
            partitions[i] = {
                x: Math.cos(targetAngle * (Math.PI / 180)) * (partitionsDistance * nAreas),
                y: Math.sin(targetAngle * (Math.PI / 180)) * (partitionsDistance * nAreas)
            };

            targetAngle += angleSlice;
        }

        return partitions;
    }

    /**
     * Returns the node position of a node based on the node's nodeGroup
     * @param {Object} nodeGroup nodeGroup object of the edited node
     * Format -> { nodes: (Integer[]), partition: {center: { x: (Integer), y: (Integer) }, size: (Integer)}}
     * @param {Integer} nodeId id of the node to edit
     * @returns {Object} Returns the new position of the node
     * Format -> { x: (Integer), y: (Integer) }
     */
    getNodePos(nodeGroup, nodeId) {
        const size = nodeGroup.partition.size;
        const center = nodeGroup.partition.center;

        const angleSlice = 360 / size;
        let targetAngle = angleSlice * nodeGroup.nodes.indexOf(nodeId);

        const output = {
            x: center.x + Math.cos(targetAngle * (Math.PI / 180)) * size * nodes.nodeBetweenNodesDistance,
            y: center.y + Math.sin(targetAngle * (Math.PI / 180)) * size * nodes.nodeBetweenNodesDistance
        };

        return output;
    }
}