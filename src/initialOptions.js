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
        this.layout = 0;
        this.secondNetworkTag = "secondary";
        this.needPairKeys = new Array();

        this.realToOnUseKeyMap = new Map();
        this.OnUseToRealKeymap = new Map();

        this.localURL = "../data/";
        this.githubURL = "https://raw.githubusercontent.com/gjimenezUCM/SPICE-visualization/main/data/";

        let currentURL = isLocalhost ? this.localURL : this.githubURL;

        this.domParser = new DOMParser();
        this.toolBar = new ToolBar(this, isLocalhost);
        //this.requestManager = new RequestManager(currentURL);
        this.networkManager = new NetworksGroup(this);
        this.controlPanel = new ControlPanel(this.networkManager, this);

        const radioButtons = this.createRadioOptions(isLocalhost);
        this.createHTMLSkeleton(radioButtons);
        this.addRadioOnclick();
        
        this.layoutManager = new VerticalLayout(this.networkManager);

        //this.requestAllFiles();
    }

    /**
     * Create a html string with radio buttons to choose the baseURL of the request manager
     * @param {Boolean} isLocalhost check if the App is running in localhost
     * @returns {String} returns the html string
     */
    createRadioOptions(isLocalhost) {
        const html = `
        <div>
            <input type="radio" name="source" value="local" ${isLocalhost ? 'checked="true"' : ""} id="radioLocal">
            <label class="unselectable" for="radioLocal">Local files </label>
        </div>
        <div>
            <input type="radio" name="source" value="githubMain" ${!isLocalhost ? 'checked="true"' : ""} id="radioGithubMain">
            <label class="unselectable" for="radioGithubMain"> Github Main </label>
        </div>`;
        return html;
    }

    /**
     * Create the basic HTML divs to support all aplication's parts
     */
    createHTMLSkeleton(radioButtons) {
        const htmlString = `
        <div class="container">
            <div class="row"> 
                <div class="col-sm-5"> </div>
                <div class="col-sm-1"> 
                    ${radioButtons}
                </div>
                <div class="col" id="${networkHTML.algorithmDropdownContainer}"> 
                </div>
            </div>
            <div class="align-center" id="${networkHTML.controlPanelParentContainer}"> </div>
            <div class="align-center" id="${networkHTML.networksParentContainer}"> </div>
        </div>`;

        const html = this.domParser.parseFromString(htmlString, "text/html").body.firstChild;

        document.body.appendChild(html);
    }

    /**
     * Add onclick function to the radiobuttons
     */
    addRadioOnclick() {
        const radioButtons = document.querySelectorAll('input[name="source"]');

        for (const radioButton of radioButtons) {
            radioButton.onchange = () => this.radioButtonClick(radioButton);
        }
    }

    /**
     * Function executed when a radiobutton is clicked. Changes the requestmanager BaseURL and restart this class
     * @param {HTMLElement} radioButton radiobutton clicked
     */
    radioButtonClick(radioButton) {
        if (radioButton.checked) {

            if (radioButton.value == "local") {
                this.requestManager.changeBaseURL(this.localURL);
            } else {
                this.requestManager.changeBaseURL(this.githubURL);
            }

            this.restartInitialOptions();
        }
    }

    changeFileSourceURL(url){
        this.requestManager.changeBaseURL(url);

        this.restartInitialOptions();
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

    /**
     * Get the number of available files from the database
     */


    /** 
    * Create an option in a dropdown menu for each file to interact with every network
    * @param {JSON} headersFile JSON file with all available files
    */
    createDropdown(headersFile) {
        const n = headersFile.files.length;
        let content = "";
        for (let i = 0; i < n; i++) {
            const key = headersFile.files[i].name;
            content += `
                <li>
                    <a class="dropdown-item unselectable" id="dropdownOption${key}">
                        ${key}
                    </a>
                </li>`;
        }

        const htmlString = this.dropdownTemplate(content);
        const html = this.domParser.parseFromString(htmlString, "text/html").body.firstChild;

        const container = document.getElementById(networkHTML.algorithmDropdownContainer);
        container.append(html);

        for (let i = 0; i < n; i++) {
            const key = headersFile.files[i].name;

            const dropdownOption = document.getElementById(`dropdownOption${key}`);
            dropdownOption.onclick = () => this.optionClicked(dropdownOption, key);
        }
    }

    /**
     * Returns a html string of a dropdown based on a template
     * @param {String} dropdownContent html string of the content of the dropdown
     * @returns {String} returns the html string
     */
    dropdownTemplate(dropdownContent) {
        const html = `
            <div class="dropdown">
                <button class="btn btn-secondary dropdown-toggle" type="button" id="perspectiveDropdownButton" 
                data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                    Select Perspective
                </button>
                <ul class="dropdown-menu" aria-labelledby="perspectiveDropdownButton">
                    ${dropdownContent}
                </ul>
            </div>`;

        return html;
    }


    /**
     * show/Hides the network based on the state of the option
     * @param {HTMLElement} dropdownOption dropdown option/button clicked
     * @param {String} key key of the network
     */
    optionClicked(dropdownOption, key) {
        const isActive = dropdownOption.className.split(" ").pop();

        if (isActive === "active") {
            //Turn the className into the Inactive class name
            dropdownOption.className = "dropdown-item unselectable";
            
            this.networkManager.removeNetwork(key);

            if (this.networkManager.getNnetworks() === 0) {
                this.controlPanel.removeControlpanel();
            }
        } else {
            const name = key + ".json";

            this.requestManager.getFile(name)
                .then((file) => {
                    this.createNetwork(key, file);
                    //Turn the className into the active class name
                    dropdownOption.className = "dropdown-item unselectable active";
                })
                .catch((error) => {
                    console.log(error);
                    alert("Error while getting the selected file");
                });
        }
    }

    /** 
     * Create the network and the control panel if it doesnt exist 
     * @param {String} key Key of the netwprk
     * @param {JSON} file File with the network config data
     */
    createNetwork(key, file) {

        const config = {
            edgeThreshold: this.controlPanel.getSliderThreshold(),
            variableEdge: this.controlPanel.getVariableEdgeValue(),
            hideUnselected: this.controlPanel.getUnselectedEdgesValue(),
            valuesToHide: this.controlPanel.getValuesToHide(),
            allowThirdDimension: this.controlPanel.getThirdDimensionValue(),
            showNodeLabels: this.controlPanel.getShowNodeLabelValue(),
            key: key
        };

        this.layoutManager.addNetwork(key, file, config);

        this.controlPanel.createControlPanel()
    }


    disactivateDropdownOption(key){
        const realkey = this.OnUseToRealKeymap.get(key);

        const dropdownOption = document.getElementById(`dropdownOption${realkey}`);
        dropdownOption.className = "dropdown-item unselectable";

    }
}