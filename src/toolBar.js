/**
 * @fileoverview This class creates a toolbar that holds all utilities of the visualization module.
 * Works as a controler between the UI items and the networks 
 * @author Marco Expósito Pérez
 */
//Namespaces
import { networkHTML } from "./constants/networkHTML.js";

//Local classes
import HorizontalLayout from "./layouts/horizontalLayout.js";
import VerticalLayout from "./layouts/verticalLayout.js";
import NetworksGroup from "./networksGroup.js";
import RequestManager from "./requestManager.js";
import FileSourceItem from "./toolbarComponents/FileSource.js";
import LayoutItem from "./toolbarComponents/LayoutItem.js";
import OptionsItem from "./toolbarComponents/OptionsItem.js";
//Components
import LeftAlignedToolbarItems from "./toolbarComponents/leftAlignedToolbarItems.js";
import SelectPerspectiveItem from "./toolbarComponents/selectPerspectiveItem.js";
import MidAlignedToolbarItems from "./toolbarComponents/midAlignedToolbarItems.js";
import LegendItem from "./toolbarComponents/legendItem.js";
import RightAlignedToolbarItems from "./toolbarComponents/rightAlignedToolbarItems.js";

export default class ToolBar {

    /**
     * Constructor of the class
     */
    constructor() {
        this.domParser = new DOMParser();

        this.requestManager = new RequestManager();
        this.networksGroup = new NetworksGroup();
        this.layout = new HorizontalLayout(this.networksGroup);

        this.initHTML();
        this.initToolbarParts();
        
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
                        ${this.rightAlignedItems.htmlString} 
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
        
        this.optionsItem = new OptionsItem(this);
        this.selectPerspectiveItem = new SelectPerspectiveItem(this);
        this.legendItem = new LegendItem(this);

        const leftItems = [
            new FileSourceItem(this),
            new LayoutItem(this),
            this.optionsItem
        ];
        this.leftAlignedItems = new LeftAlignedToolbarItems(leftItems);
        this.toolbarParts.push(this.leftAlignedItems);

        const midItems = [
            this.selectPerspectiveItem
        ]
        this.midAlignedItems = new MidAlignedToolbarItems(midItems);
        this.toolbarParts.push(this.midAlignedItems);

        const rightItems = [
            this.legendItem
        ]
        this.rightAlignedItems = new RightAlignedToolbarItems(rightItems);
        this.toolbarParts.push(this.rightAlignedItems);
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
        this.restartToolbar();
        
        if(layout === "Horizontal"){
            this.layout = new HorizontalLayout(this.networksGroup);
        }else{
            this.layout = new VerticalLayout(this.networksGroup);
        }

        
    }

    /**
     * Toggle a perspective/network visualization hiding/showing it depending of their active state
     * @param {Boolean} active value that decides the outcome
     * @param {String} key key of the perspective/network
     */
    togglePerspective(active, key){
        if (active) {
            this.activateNetwork(key);
        } else {
            this.removeNetwork(key);
        }
    }

    /**
     * Activate a network visualization
     * @param {String} key key of the network
     */
    activateNetwork(key){
        const name = key + ".json";

        this.requestManager.getFile(name)
            .then((file) => {

                const config = { };
                for(const part of this.toolbarParts){
                    part.setConfiguration(config);
                }
                config["key"] = key;

                console.log(config);
                this.layout.addNetwork(key, file, config);

                this.legendItem.networkNumberChange();
            })
            .catch((error) => {
                console.log(error);
                alert("Error while getting the selected file");
            });
    }

    /**
     * Remove a network visualization
     * @param {String} key key of the network
     */
    removeNetwork(key){
        this.networksGroup.removeNetwork(key);
        this.legendItem.networkNumberChange();
    }

    /**
     * Remove all networks and restart the toolbar with the current selected options 
     */
    restartToolbar(){
        this.networksGroup.removeAllnetworks();
        
        this.selectPerspectiveItem.restart();
        this.legendItem.restart();

        document.getElementById(networkHTML.networksParentContainer).innerHTML = "";
        
        this.requestAllFiles();
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