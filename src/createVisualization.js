/**
 * @fileoverview This Class creates a selector to choose what networks to show/hide. It also creates the basic
 * html structure for all the visualization and create the control panel and networks when necesary
 * @package It requires bootstrap to be able to create Dropdowns.
 * @author Marco Expósito Pérez
 */

//Namespaces
import { networkHTML } from "./constants/networkHTML.js";
//Packages
import { Dropdown } from 'bootstrap';
//Local classes
import NetworkGroupMan from "./groupNetwork.js";
import RequestManager from "./requestManager.js";
import ControlPanel from "./controlPanel.js";

export default class CreateVisualization {

    /**
     * Constructor of the class
     */
    constructor() {
        //TODO this should be editable
        const baseURL = "https://raw.githubusercontent.com/gjimenezUCM/SPICE-visualization/develop/data/";
        this.dataDirectory = "./";

        this.requestManager = new RequestManager(baseURL);
        this.networkManager = new NetworkGroupMan();
        this.controlPanel = new ControlPanel(this.networkManager);

        this.createHTMLSkeleton();
        this.getAllAvailableFiles();
    }

    /**
     * Create the basic HTML divs to support all aplication's parts
     */
    createHTMLSkeleton(){
        const dropDown = document.createElement("div");
        dropDown.className= "middle";
        dropDown.id= networkHTML.algorithmDropdownContainer;
        document.body.appendChild(dropDown);

        const controlPanel = document.createElement("div");
        controlPanel.className= "middle";
        controlPanel.id= networkHTML.controlPanelParentContainer;
        document.body.appendChild(controlPanel);

        const networks = document.createElement("div");
        networks.className= "middle";
        networks.id= networkHTML.networksParentContainer;
        document.body.appendChild(networks);

    }

    /**
     * Get the number of available files from the database
     */
    getAllAvailableFiles() {
        const name = "dataList.json";

        this.requestManager.getFile(name, this.dataDirectory)
            .then((file) => {
                file = JSON.parse(file);
                this.createDropdown(file)
            })
            .catch((error) => {
                console.log(error);
                alert("Error while getting the file with all file names");
            });
    }

    /** 
    * Create an option in a dropdown menu for each file to interact with every network
    * @param {JSON} headersFile JSON file with all available files
    */
    createDropdown(headersFile) {
        const n = headersFile.files.length;

        const container = document.getElementById(networkHTML.algorithmDropdownContainer);

        //Create dropdown skeleton
        const topContainer = document.createElement("div");
        topContainer.className = "dropdown";
        container.append(topContainer);

        const mainButton = document.createElement("button");
        mainButton.innerText = "Select Algoritmh";
        mainButton.className = "btn btn-secondary dropdown-toggle";

        mainButton.setAttribute("data-bs-toggle", "dropdown");
        mainButton.setAttribute("aria-expanded", "false");
        //Dropdown closes by clicking outside it
        mainButton.setAttribute("data-bs-auto-close", "outside");
        topContainer.append(mainButton);

        const optionsContainer = document.createElement("ul");
        optionsContainer.className = "dropdown-menu dropdown-menu-dark";

        topContainer.append(optionsContainer);

        //Fill the dropdown with the files
        for (let i = 0; i < n; i++) {

            const key = headersFile.files[i].name;
            const newFileContainer = document.createElement('li');

            const newFileButton = document.createElement('a');
            newFileButton.className = "dropdown-item";
            newFileButton.innerHTML = key;
            newFileButton.style.userSelect = "none";
            newFileButton.onclick = () => this.optionClicked(newFileButton, key);

            newFileContainer.appendChild(newFileButton);
            optionsContainer.appendChild(newFileContainer);
        }

        const options = {}
        new Dropdown(mainButton, options);
    }

    /**
     * show/Hides the network based on the state of the option
     * @param {HTMLElement} option dropdown option/button clicked
     * @param {String} key key of the network
     */
    optionClicked(option, key) {
        const isActive = option.className.split(" ").pop();

        if (isActive === "active") {
            //Turn the className into the Inactive class name
            option.className = "dropdown-item";
            this.networkManager.removeNetwork(key);

            if (this.networkManager.getNnetworks() === 0) {
                this.controlPanel.removeControlpanel();
            }
        } else {
            const name = key + ".json";

            this.requestManager.getFile(name, this.dataDirectory)
            .then((file) => {
                this.createNetwork(key, file);
                 //Turn the className into the active class name
                option.className = "dropdown-item active";
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
        //Top Container that always exist
        const topContainer = document.getElementById(networkHTML.networksParentContainer);
        
        //Container that will be deleted when clearing the network
        const networkContainer = document.createElement("div");
        networkContainer.id = networkHTML.topNetworkContainer + key;
        networkContainer.className = "container";

        //Header with the name of the network
        const separator = document.createElement('hr');

        const titleContainer = document.createElement('div');
        titleContainer.className = "title";

        const title = document.createElement("h2");
        title.className = "col-sm-1";
        title.innerHTML = key;

        titleContainer.appendChild(separator)
        titleContainer.appendChild(title);
        networkContainer.appendChild(titleContainer);

        //Row with the network to the left, and the data/input options to the right
        const rowContainer = document.createElement('div');
        rowContainer.className = "row";

        const columnLeftContainer = document.createElement('div');
        const columnRightContainer = document.createElement('div');
        columnLeftContainer.className = "col-sm-8 network";
        columnLeftContainer.id = "col_" + key;

        columnRightContainer.className = "col-sm-4";

        rowContainer.appendChild(columnLeftContainer);
        rowContainer.appendChild(columnRightContainer);
        networkContainer.appendChild(rowContainer);

        topContainer.appendChild(networkContainer);

        const config = {
            edgeThreshold: networkHTML.sliderThresholdInitialValue,
            variableEdge: networkHTML.variableEdgeInitialValue,
            key: key
        };

        this.networkManager.addNetwork(file, columnLeftContainer, columnRightContainer, config)
        
        this.controlPanel.createControlPanel()
    }
}