/**
 * @fileoverview This class creates a single control panel for all networks. The control panel is made of a slider
 * that updates the minimum edge value threshold, a checkbox that change if edges width relates to the edge value
 * and a legend that also allows the user to hide nodes that meet some attribute values.
 * @author Marco Expósito Pérez
 */
//Namespaces
import { networkHTML } from "./constants/networkHTML.js";
import AllowThirdDimensionCheckbox from "./controlPanelComponents/allowThirdDimensionCheckbox.js";
import ChangeNodeLabelVisibilityCheckbox from "./controlPanelComponents/changeNodeLabelVisibilityCheckbox.js";
import layoutChange from "./controlPanelComponents/layoutChangeCheckbox.js";
//Local classes
import Legend from "./controlPanelComponents/legend.js";
import ThresholdSlider from "./controlPanelComponents/thresholdSlider.js";
import UnselectedEdgesCheckbox from "./controlPanelComponents/unselectedEdgesCheckbox.js";
import VariableEdgeCheckbox from "./controlPanelComponents/variableEdgeCheckbox.js";
import HorizontalLayout from "./layouts/horizontalLayout.js";
import VerticalLayout from "./layouts/verticalLayout.js";
import NetworksGroup from "./networksGroup.js";
import RequestManager from "./requestManager.js";
import LeftAlignedToolbarItems from "./toolbarComponents/leftAlignedToolbarItems.js";
import MidAlignedToolbarItems from "./toolbarComponents/midAlignedToolbarItems.js";

export default class ToolBar {

    /**
     * Constructor of the class

     */
    constructor() {
        this.domParser = new DOMParser();

        this.requestManager = new RequestManager();
        this.networksGroup = new NetworksGroup();
        this.layout = new VerticalLayout(this.networksGroup);

        this.initToolbarParts();
        this.initHTML();
        const htmlString = `
        <nav class="navbar fixed-top navbar-expand-md navbar-light bg-light">
            <div class="container-fluid">
                    <! -- Left aligned items -->
                    <div class="d-flex col justify-content-start">
                        ${this.leftAlignedItems.htmlString}  
                    </div>
                    <! -- Mid aligned items -->
                    <div class="d-flex col justify-content-center">
                        ${this.midAlignedItems.htmlString} 
                    </div>

                    <! -- End aligned items -->
                    <div class="d-flex col flex-row-reverse">
                        <ul class="navbar-nav">
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle btn-secondary" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Legend WIP
                                </a>
                                <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                                    <li><a class="dropdown-item unselectable" href="#">WIP</a></li>
                                    <li><a class="dropdown-item unselectable" href="#">WIP</a></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>`;

        const html = this.domParser.parseFromString(htmlString, "text/html").body.firstChild;
        document.getElementById(networkHTML.toolBarParentContainer).append(html);

        this.requestAllFiles();
    }

    /**
     * Init all parts of the toolbar
     */
     initToolbarParts(){
        this.toolbarParts = new Array();

        this.leftAlignedItems = new LeftAlignedToolbarItems(this);
        this.toolbarParts.push(this.leftAlignedItems);

        this.midAlignedItems = new MidAlignedToolbarItems(this);
        this.toolbarParts.push(this.midAlignedItems);
     }

    /**
     * Create the basic HTML divs to support all aplication's parts
     */
    initHTML() {
        const htmlString = `
        <div class="container">
            <div class="align-center" id="${networkHTML.toolBarParentContainer}"> </div>
            <h1 style="margin-top: 60px;"> Visualization testing </h1>
            <div class="align-center" id="${networkHTML.networksParentContainer}"> </div>
        </div>`;

        const html = this.domParser.parseFromString(htmlString, "text/html").body.firstChild;

        document.body.appendChild(html);
    }

     /**
      * Request the name of all available perspective files
      */
     requestAllFiles() {
        const name = "dataList.json";

        this.requestManager.getFile(name)
            .then((file) => {
                this.file = JSON.parse(file).files;
                this.createEvents()
            })
            .catch((error) => {
                console.log(error);
                alert("Error while getting the file with all file names");
            });
    }

    /**
     * Create all events for every item of the toolbar
     */
    createEvents(){
        for(const part of this.toolbarParts){
            part.createEvents();
        }
    }

    /**
     * Change the source URL of the perspective files
     * @param {String} url new url to be used
     */
    changeFileSourceURL(url){
        this.requestManager.changeBaseURL(url);

        this.restartToolbar();
    }

    /**
     * Change the current layout of the aplication
     * @param {String} layout key of the layout
     */
    changeLayout(layout){
        if(layout === "Horizontal"){
            this.layout = new HorizontalLayout(this.networksGroup);
        }else{
            this.layout = new VerticalLayout(this.networksGroup);
        }

        this.restartToolbar();
    }

    togglePerspective(active, key){
        if (active) {
            this.activateNetwork(key);
        } else {
            this.disactivateNetwork(key);
        }
    }

    activateNetwork(key){
        const name = key + ".json";

        this.requestManager.getFile(name)
            .then((file) => {

                const config = { };
                for(const part of this.toolbarParts){
                    part.setConfiguration(config);
                }
                config["key"] = key;

                this.layout.addNetwork(key, file, config);

            })
            .catch((error) => {
                console.log(error);
                alert("Error while getting the selected file");
            });
    }

    disactivateNetwork(key){
        this.networksGroup.removeNetwork(key);
    }

    /**
     * Remove all networks and restart the toolbar with the current selected options 
     */
    restartToolbar(){
        //TODO
    }

    /**
     * Toggle the state of a dropdown item
     * @param {HTMLElement} item element that is going to be toggled
     * @returns {Boolean} returns the new state of the item
     */
    toggleDropdownItemState(item){
        let active = false;
        if(item.className === "dropdown-item unselectable"){
            item.className = "dropdown-item unselectable active";
            active = true;
        }else{
            item.className = "dropdown-item unselectable";
        }

        return active;
    }

   
}   