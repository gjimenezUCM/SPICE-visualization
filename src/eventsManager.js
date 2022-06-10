import NetworkManager from "./networkManager";
import RequestManager from "./requestManager";
import { Dropdown } from 'bootstrap';
import { Popover } from 'bootstrap';

import Explicit_community from "./explicitCommunity";
import Utils from "./Utils";
import { networkHTML } from "./namespaces/networkHTML";
import ControlPanel from "./controlPanel";

export default class EventsManager {

    /**
     * Constructor of the class
     */
    constructor() {
        //TODO this should be editable
        const baseURL = "../";
        this.dataDirectory = "data/";

        this.requestManager = new RequestManager(baseURL);
        this.networkManager = new NetworkManager();

        this.controlPanel = new ControlPanel(this.networkManager);

        this.initialSliderValue = 1.0;
        this.initialVariableWidthValue = false;

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
                alert("Error while reading the file with all file names");
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
     * Open/Closes the network based on the state of the option
     * @param {Object} option option with active or inactive state
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
                alert("Error while reading the selected file");
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
        titleContainer.className = "row title";

        const title = document.createElement("h2");
        title.className = "col-sm-6";
        title.innerHTML = key;

        const legendButton = document.createElement("button");
        legendButton.className = "col-sm-2 btn btn-primary";
        legendButton.innerText = "Legend";

        titleContainer.appendChild(separator)
        titleContainer.appendChild(title);
        titleContainer.appendChild(legendButton);

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

        //Network
        topContainer.appendChild(networkContainer);

        const config = {
            edgeThreshold: networkHTML.sliderThresholdInitialValue,
            variableEdge: networkHTML.variableEdgeInitialValue,
            key: key
        };

        this.networkManager.addNetwork(file, columnLeftContainer, columnRightContainer, config)

        const networkCommunities = this.networkManager.getExplicitCommunities();
        
        //this.createLegend(legendButton, networkCommunities);

        this.controlPanel.createControlPanel(networkCommunities)
    }

    createLegend(button, communities) {
        const title = "";
        const content = this.getLegendContent(communities);

        const options = {
            trigger: "click",
            placement: "right",
            title: title,
            content: content,
            template: "<div class=\"popover legend\" role=\"tooltip\"><div class=\"popover-arrow\"></div><h3 class=\"popover-header\"></h3><div class=\"popover-body\"></div></div>",
            fallbackPlacements: ["right"],
            offset: [0, 10],
            html: true,
        };

        const tooltip = new Popover(button, options);
        return tooltip;
    }

    getLegendContent(communities) {
        let topContainer = document.createElement("div");

        for (let i = 0; i < communities.length; i++) {

            const titleContainer = document.createElement("h6");
            titleContainer.innerHTML = "<u>" + communities[i].key + "</u>";
            topContainer.append(titleContainer);

            for (let j = 0; j < communities[i].values.length; j++) {
                let value = communities[i].values[j];
                if (value == "") value = "\"\"";

                const rowContainer = document.createElement("div");
                rowContainer.className = "row align-items-left"
                topContainer.append(rowContainer);

                const leftContainer = document.createElement("div");
                leftContainer.className = "col value";
                leftContainer.innerText = value;
                rowContainer.append(leftContainer);

                const middleContainer = document.createElement("div");
                middleContainer.className = "col";
                middleContainer.innerText = "=>";
                rowContainer.append(middleContainer);

                const rightContainer = document.createElement("div");
                rightContainer.className = "col";
                this.getCommunityValueIndicator(rightContainer, i, j);
                rowContainer.append(rightContainer);

            }
        }

        return topContainer;
    }

    //background-color
    getCommunityValueIndicator(container, communityn, value) {
        const utils = new Utils();
        let output = document.createElement("div");

        switch (communityn) {
            case 0:
                output.className = "box";
                output.style.backgroundColor = utils.getCommunityCharacteristic(communityn, value);
                break;

            case 1:
                utils.getShapehtml(output, value);
                break;
        }

        container.append(output);
    }

    

   


    createExplicitCommunityChooser(exp_communities) {
        this.selectedCommunities = new Array();

        const n = exp_communities.length;
        //Create dropdown skeleton
        const topContainer = document.createElement("div");
        topContainer.className = "dropdown";

        const mainButton = document.createElement("button");
        mainButton.id = "dropdownButtonCommunities";
        mainButton.innerText = "Highlight Community";
        mainButton.className = "btn btn-secondary dropdown-toggle";

        mainButton.setAttribute("data-bs-toggle", "dropdown");
        mainButton.setAttribute("aria-expanded", "false");
        //Dropdown closes by clicking outside it
        mainButton.setAttribute("data-bs-auto-close", "outside");

        topContainer.append(mainButton);

        const optionsContainer = document.createElement("ul");
        optionsContainer.className = "dropdown-menu dropdown-menu-dark";
        optionsContainer.setAttribute("aria-labelledby", "dropdownButtonCommunities");
        topContainer.append(optionsContainer);

        //Fill the dropdown with the options
        for (let i = 0; i < n; i++) {

            const key = exp_communities[i].key;

            const newOptionContainer = document.createElement('li');
            optionsContainer.appendChild(newOptionContainer);

            const newOptionButton = document.createElement('a');
            newOptionButton.className = "dropdown-item";
            newOptionButton.innerHTML = key;
            newOptionButton.style.userSelect = "none";
            newOptionContainer.appendChild(newOptionButton);

            const dropRight = this.createSecondaryDropRight(newOptionButton, exp_communities[i]);

            newOptionButton.onmouseover = () => this.showCommunities(dropRight.menu);

            newOptionContainer.appendChild(dropRight.container);

        }
        //Dropdown closes by clicking outside it
        const options = {};

        const drop = new Dropdown(mainButton, options);

        //Dropdown opens by clicking on the button
        mainButton.onclick = () => drop.show();

        return topContainer;
    }

    showCommunities(dropdown) {
        if (this.droprightActive !== undefined)
            this.droprightActive.hide();

        this.droprightActive = dropdown;
        this.droprightActive.show();
    }

    createSecondaryDropRight(mainButton, exp_community) {
        const n = exp_community.values.length;

        //Create dropdown skeleton
        const topContainer = document.createElement("div");
        topContainer.className = "dropend";

        mainButton.id = "dropRight_" + exp_community.key;
        mainButton.className += " dropdown-toggle";

        mainButton.setAttribute("data-bs-toggle", "dropdown");
        mainButton.setAttribute("aria-expanded", "false");

        //Dropdown closes by clicking outside it
        mainButton.setAttribute("data-bs-auto-close", "outside");

        topContainer.append(mainButton);

        const optionsContainer = document.createElement("ul");
        optionsContainer.className = "dropdown-menu dropdown-menu-dark";
        optionsContainer.setAttribute("aria-labelledby", "dropRight_" + exp_community.key);
        topContainer.append(optionsContainer);

        //Fill the dropdown with the options
        for (let i = 0; i < n; i++) {

            let key = exp_community.values[i];
            if (key === "") {
                key = "\"\"";
            }
            const newOptionContainer = document.createElement('li');

            const newOptionButton = document.createElement('a');
            newOptionButton.className = "dropdown-item";
            newOptionButton.innerHTML = key;
            newOptionButton.style.userSelect = "none";

            newOptionButton.onclick = () => this.highlightCommunity(newOptionButton, exp_community.key, key);

            newOptionContainer.appendChild(newOptionButton);
            optionsContainer.appendChild(newOptionContainer);
        }

        const options = {}
        const drop = new Dropdown(mainButton, options);

        return { container: topContainer, menu: drop };
    }

    highlightCommunity(button, key, value) {
        if (value === "\"\"") {
            value = "";
        }

        const isActive = button.className.split(" ").pop() === "active";
        if (isActive) {
            button.className = "dropdown-item";


            for (let i = 0; i < this.selectedCommunities.length; i++) {
                if (this.selectedCommunities[i].key === key) {

                    const index = this.selectedCommunities[i].values.indexOf(value);
                    this.selectedCommunities[i].values.splice(index, 1);

                    if (this.selectedCommunities[i].values.length === 0) {
                        this.selectedCommunities = this.selectedCommunities.filter(data => data.key !== key);
                    }
                }
            }



        } else {
            button.className = "dropdown-item active";

            let newCommunity = true;
            for (let i = 0; i < this.selectedCommunities.length; i++) {
                if (this.selectedCommunities[i].key === key) {
                    this.selectedCommunities[i].values.push(value);
                    newCommunity = false;
                }
            }

            if (newCommunity) {
                this.selectedCommunities.push(new Explicit_community(key, new Array(value)));
            }

        }

        this.networkManager.highlightCommunityALL(this.selectedCommunities);
    }

}