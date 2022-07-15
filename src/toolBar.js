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
import NetworksGroup from "./networksGroup.js";
import RequestManager from "./requestManager.js";
import LeftAlignedToolbarItems from "./toolbarComponents/leftAlignedToolbarItems.js";

export default class ToolBar {

    /**
     * Constructor of the class

     */
    constructor(initialOptions) {
        this.initialOptions = initialOptions;
        this.domParser = new DOMParser();

        this.requestManager = new RequestManager();
        this.networksGroup = new NetworksGroup();

        this.toolbarParts = new Array();

        this.leftAlignedItems = new LeftAlignedToolbarItems(this);
        this.toolbarParts.push(this.leftAlignedItems);

        this.value=0.5;

        const htmlString = `
        <nav class="navbar fixed-top navbar-expand-md navbar-light bg-light">
            <div class="container-fluid">
                    <! -- Left aligned items -->
                    ${this.leftAlignedItems.htmlString}  

                    <! -- Mid aligned items -->
                    <div class="d-flex col">
                        <ul class="navbar-nav">
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle btn-secondary" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Select Perspective
                                </a>
                                <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                                    <li><a class="dropdown-item unselectable" href="#">Perspective 1</a></li>
                                    <li><a class="dropdown-item unselectable" href="#">Perspective 2 action</a></li>
                                </ul>
                            </li>
                        </ul>
                    </div>

                    <! -- End aligned items -->
                    <div class="d-flex ms-auto">
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
        document.body.append(html);

        this.createEvents();
    }

    /**
     * Create all events for every item of the toolbar
     */
    createEvents(){
        for(const part of this.toolbarParts){
            part.createEvents();
        }
    }

    changeFileSourceURL(url){
        this.requestManager.changeBaseURL(url);

        //TODO: RESTART PROGRAM
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
    /**
     * Create the events related with the Options dropdown
     */
   
}   