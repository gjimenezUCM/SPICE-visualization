/**
 * @fileoverview This class changes the visualization layout be pairs in a vertical way. 
 * If u add a single network, the network will be seen as a normal-big network, if u add a second it will be paired with the first one and both will shrink and 
 * be placed one on top of the other for easier visualization. If u keep adding more networks, they will try to be paired, if cant be paired, a normal-big network unpaired will appear
 * @author Marco Expósito Pérez
 */
//Namespaces
import { networkHTML } from "../constants/networkHTML";
//Local classes


export default class VerticalLayout {

    /**
     * Constructor of the class
     * @param {NetworksGroup} networksGroup group of networks that will be controled by this panel
     */
    constructor(networksGroup, controlPanel) {
        this.controlPanel = controlPanel;
        this.networksGroup = networksGroup;

        this.domParser = new DOMParser();
        this.unpairedRows = new Array();
        this.networkKeyToRow = new Map();
        this.nRows = 0;
        
        this.networksGroup.setLayout(this);
    }

    verticalLayoutTemplate(nRow) {
        const htmlString = `
        <div id="networkContainer_${nRow}">
            <div class="row" id="topRow_${nRow}">
                ${this.networkTemplate(`${this.nRows}_first`)}
            </div>
            <div class="row" id="bottomRow_${nRow}">
                ${this.networkTemplate(`${this.nRows}_second`)}
            </div>
        </div>`;

        return htmlString;
    }

    networkTemplate(key) {
        const htmlString = `
        <div id="${networkHTML.topNetworkContainer}${key}">
            <div class="row" id="">
                <div class="col-sm-8" id="leftCol_${key}"> </div>
                <div class="col-sm-4" id="rightCol_${key}"> </div>
            </div>
        </div>`;

        return htmlString;
    }

    addNetwork(key, file){
        
        const unpairedRow = this.unpairedRows.pop();

        const config = {
            edgeThreshold: this.controlPanel.getSliderThreshold(),
            variableEdge: this.controlPanel.getVariableEdgeValue(),
            hideUnselected: this.controlPanel.getUnselectedEdgesValue(),
            valuesToHide: this.controlPanel.getValuesToHide(),
            allowThirdDimension: this.controlPanel.getThirdDimensionValue(),
            showNodeLabels: this.controlPanel.getShowNodeLabelValue(),
            key: key
        };

        if(unpairedRow === undefined){
            //Create the new ro Layout
            const htmlString = this.verticalLayoutTemplate(this.nRows);
            const html = this.domParser.parseFromString(htmlString, "text/html").body.firstChild;

            const allNetworksContainer = document.getElementById(networkHTML.networksParentContainer);
            allNetworksContainer.append(html);

            this.makeSingleNetworkRow(this.nRows, 0);

            //Create the networkContainers
            const leftContainer = document.getElementById(`leftCol_${this.nRows}_first`);
            const rightContainer = document.getElementById(`rightCol_${this.nRows}_first`);
            
            const htmlTittleString = this.networkTittleTemplate(key);
            const htmlTittle = this.domParser.parseFromString(htmlTittleString, "text/html").body.firstChild;

            rightContainer.append(htmlTittle);

            //Create the network
            this.networksGroup.addNetwork(file, leftContainer, rightContainer, config)

            this.networkKeyToRow.set(key, `${this.nRows}_first`);
            this.unpairedRows.push({nRow: this.nRows, location: "second"});
            this.nRows++;

        }else{
            this.makePairNetworkRow(unpairedRow.nRow);

            //Create the networkContainers
            const leftContainer = document.getElementById(`leftCol_${unpairedRow.nRow}_${unpairedRow.location}`);
            const rightContainer = document.getElementById(`rightCol_${unpairedRow.nRow}_${unpairedRow.location}`);

            const htmlTittleString = this.networkTittleTemplate(key);
            const htmlTittle = this.domParser.parseFromString(htmlTittleString, "text/html").body.firstChild;

            rightContainer.append(htmlTittle);

            //Create the network
            this.networksGroup.addNetwork(file, leftContainer, rightContainer, config)

            this.networkKeyToRow.set(key, `${unpairedRow.nRow}_${unpairedRow.location}`);
        }

        this.controlPanel.createControlPanel()
    }


    makeSingleNetworkRow(nRow, position){
        //Make the current network single
        let rowId = position === 0 ? "topRow" : "bottomRow";
        let container = document.getElementById(`${rowId}_${nRow}`);

        container.className = "row singleNetworkContainer";

        //Fix the other network position
        rowId = position === 1 ? "topRow" : "bottomRow";
        container = document.getElementById(`${rowId}_${nRow}`);

        container.className = "row";
    }

    makePairNetworkRow(nRow){
        const topContainer = document.getElementById(`topRow_${nRow}`);
        const bottomContainer = document.getElementById(`bottomRow_${nRow}`);

        topContainer.className = "row pairNetworkVertical";
        bottomContainer.className = "row pairNetworkVertical";
    }

    networkTittleTemplate(name){
        const htmlString = `
        <div class="row">
            <h2 class="text-start">
                ${name}
            </h2>
            <hr>
        </div>`;
        return htmlString;
    }


    deleteNetwork(key){
        const networkRowid = this.networkKeyToRow.get(key).split("_");

        const nRow = networkRowid[0];
        const location = networkRowid[1];
        
        document.getElementById(`leftCol_${nRow}_${location}`).innerHTML = "";
        document.getElementById(`rightCol_${nRow}_${location}`).innerHTML = "";

        let isUnpaired = false;

        for(let i = 0; i < this.unpairedRows.length; i++){
            const unpairedRow = this.unpairedRows[i];

            if(unpairedRow.nRow === nRow){
                isUnpaired = true;
                this.unpairedRows = this.unpairedRows.splice(0, i);
            }
        }
        if(isUnpaired){

            const rowContainer = document.getElementById(`networkContainer_${nRow}`); 
            document.getElementById(networkHTML.networksParentContainer).removeChild(rowContainer);

        }else{
            if(location === "second"){
                this.makeSingleNetworkRow(nRow, 0);
            }else{
                this.makeSingleNetworkRow(nRow, 1);
            }

            this.unpairedRows.push({nRow: nRow, location: location});
        }
    }

}   