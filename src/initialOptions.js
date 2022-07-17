/**
 * @fileoverview This class create the initial options of the visualization application. It allows the user to select
 * a source of perspectives and choose perspectives to view
 * @package It requires bootstrap to be able to create Dropdowns.
 * @author Marco Expósito Pérez
 */

//Namespaces
import { networkHTML } from "./constants/networkHTML.js";
//Packages
import { Dropdown } from 'bootstrap';
//Local classes
import NetworksGroup from "./networksGroup.js";
import RequestManager from "./requestManager.js";
import ControlPanel from "./controlPanel.js";
import VerticalLayout from "./layouts/verticalLayout.js";
import HorizontalLayout from "./layouts/horizontalLayout.js";
import ToolBar from "./toolBar.js";

export default class InitialOptions {

    /**
     * Constructor of the class
     * @param {Boolean} isLocalhost check if the App is running in localhost
     */
    constructor(isLocalhost) {
    }


    /**
     * Remove all networks, remove the control panel, remove the dropdown and creates the dropdown again
     */
    restartInitialOptions() {
        this.networkManager.removeAllnetworks();
        this.controlPanel.removeControlpanel();

        //remove dropdown
        const parent = document.getElementById(networkHTML.algorithmDropdownContainer);
        let child = parent.firstChild;

        while (child) {
            child.remove();
            child = parent.firstChild;
        }

        document.getElementById(networkHTML.networksParentContainer).innerHTML = "";
        

        this.requestAllFiles();
    }
}