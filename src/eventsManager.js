import NetworkManager from "./networkManager";
import RequestsManager from "./requestsManager";
import { Dropdown } from 'bootstrap';
import Explicit_community from "./explicitCommunity";

export default class EventsManager {

    constructor() {
        this.requestManager = new RequestsManager();
        this.networkManager = new NetworkManager();

        this.initialSliderValue = 1.0;
        this.initialVariableWidthValue = false;

        this.dropdownInit();
    }

    /**
     * Get the number of available files from the database
     */
    dropdownInit() {
        this.requestManager.getAllFileNames()
            .then((file) => {
                file = JSON.parse(file);
                this.createDropdown(file)
            });
    }

    /** Create an option in a dropdown menu for each file to pen/close every network
    * 
    * @param {*} headersFile JSON file with all available files
    */
    createDropdown(headersFile) {
        const n = headersFile.files.length;

        const container = document.getElementById("algorithm_dropdown");

        //Create dropdown skeleton
        const topContainer = document.createElement("div");
        topContainer.className = "dropdown";
        container.append(topContainer);

        const mainButton = document.createElement("button");
        mainButton.id = "dropdownAlgoritmh";
        mainButton.innerText = "Select Algoritmh";
        mainButton.className = "btn btn-secondary dropdown-toggle";

        mainButton.setAttribute("data-bs-toggle", "dropdown");
        mainButton.setAttribute("aria-expanded", "false");

        //Dropdown closes by clicking outside it
        mainButton.setAttribute("data-bs-auto-close", "outside");

        topContainer.append(mainButton);

        const optionsContainer = document.createElement("ul");
        optionsContainer.className = "dropdown-menu dropdown-menu-dark";
        optionsContainer.setAttribute("aria-labelledby", "dropdownAlgoritmh");
        topContainer.append(optionsContainer);

        //Fill the dropdown with the options
        for (let i = 0; i < n; i++) {

            const key = headersFile.files[i].name;

            const newOptionContainer = document.createElement('li');

            const newOptionButton = document.createElement('a');
            newOptionButton.className = "dropdown-item";
            newOptionButton.innerHTML = key;
            newOptionButton.style.userSelect = "none";
            newOptionButton.onclick = () => this.optionClicked(newOptionButton, key);

            newOptionContainer.appendChild(newOptionButton);
            optionsContainer.appendChild(newOptionContainer);
        }

        const options = {}
        const drop = new Dropdown(mainButton, options);

        //Dropdown opens by clicking on the button
        mainButton.onclick = () => drop.show();
    }

    /** Show/hide the network based on the option clicked
     * 
     * @param {*} key Key of the network 
     */
    optionClicked(button, key) {
        const option = button;

        const isActive = option.className.split(" ").pop();
        if (isActive === "active") {
            option.className = "dropdown-item";
            this.networkManager.removeNetwork(key);

            if (this.networkManager.getNnetworks() === 0) {
                this.removeControlPanel();
            }
        } else {
            this.requestManager.getNetwork(key + ".json")
                .then((file) => {
                    this.createNetwork(key, file);

                });

            option.className = "dropdown-item active";
        }
    }

    /** Create the network and all the user configuration options 
     * 
     * @param {*} key Key of the netwprk
     * @param {*} file File with the network config data
     */
    createNetwork(key, file) {
        //Top Container that always exist
        const topContainer = document.getElementById("networksContainer");

        //Container that will be deleted when clearing the network
        const networkContainer = document.createElement("div");
        networkContainer.id = "network_" + key;
        networkContainer.className = "container";

        //Header with the name of the network
        const separator = document.createElement('hr');

        const titleContainer = document.createElement('div');
        titleContainer.className = "row";

        const title = document.createElement("h2");
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

        //Network

        topContainer.appendChild(networkContainer);

        const config = {
            edgeThreshold: this.initialSliderValue,
            variableEdge: this.initialVariableWidthValue,
            key: key
        };

        this.networkManager.addNetwork(file, columnLeftContainer, columnRightContainer, config)


        if (this.networkManager.getNnetworks() === 1) {
            this.addControlPanel(this.networkManager.getExplicitCommunities());
        }

    }

    /** Create a container with a slider that controls the minimum similarity Threshold for edges to be visible in the network
     * 
     * @returns Container with the slider
     */
    createThresholdSliderContainer(key) {
        const sliderContainer = document.createElement('div');
        sliderContainer.className = "middle";

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = "0.0";
        slider.max = "1.0";
        slider.step = "0.1";
        slider.value = this.initialSliderValue;
        slider.id = "thresholdSlider";

        slider.onchange = () => this.thresholdChange();
        slider.oninput = () => this.updateSliderText();

        const text = document.createElement('span');
        text.innerHTML = "Minimum Similarity: ";

        const value = document.createElement('span');
        value.id = "thresholdSliderValue";
        value.innerHTML = this.initialSliderValue;

        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(text);
        sliderContainer.appendChild(value);

        return sliderContainer;
    }

    /** Create a container with a checkbox that controls if the network edges width should vary with its similarity
     * 
     * @returns Container with the checkbox
     */
    createVariableEdgeCheckBoxContainer() {
        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = "middle";

        const text2 = document.createElement('span');
        text2.innerHTML = "Variable edge width: ";

        const checkBox = document.createElement('input');
        checkBox.type = 'checkbox';
        checkBox.checked = this.initialVariableWidthValue;
        checkBox.id = "thresholdVariableCheck";

        checkBox.onchange = () => this.variableEdgeChange();

        checkboxContainer.appendChild(text2);
        checkboxContainer.appendChild(checkBox);

        return checkboxContainer;
    }

    /** 
     *  Update all networks with the new threshold value. Updates the label with the value too
     */
    thresholdChange() {
        const slider = document.getElementById("thresholdSlider");
        let newValue = slider.value;

        this.networkManager.thresholdChangeALL(newValue);
    }

    updateSliderText() {
        const slider = document.getElementById("thresholdSlider");
        const value = document.getElementById("thresholdSliderValue");

        let newValue = slider.value;

        if (newValue === "0") newValue = "0.0";
        if (newValue === "1") newValue = "1.0";

        value.innerHTML = newValue;
    }
    /** 
     *  Update all networks with the new variableEdgeWidth value
     */
    variableEdgeChange() {
        const checkBox = document.getElementById("thresholdVariableCheck");

        this.networkManager.variableEdgeChangeALL(checkBox.checked);
    }


    addControlPanel(exp_communities) {
        const controlPanel = document.createElement("div");
        controlPanel.id = "controlPanel";
        controlPanel.className = "middle";

        const inputTitle = document.createElement("h5");
        inputTitle.innerHTML = "Control Panel";

        const sliderContainer = this.createThresholdSliderContainer();
        const checkboxContainer = this.createVariableEdgeCheckBoxContainer();
        const explicitContainer = this.createExplicitCommunityChooser(exp_communities);

        controlPanel.appendChild(inputTitle);
        controlPanel.appendChild(sliderContainer);
        controlPanel.appendChild(checkboxContainer);
        controlPanel.appendChild(explicitContainer);

        document.getElementById("controlPanelContainer").appendChild(controlPanel);
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

    removeControlPanel() {
        const controlPanel = document.getElementById("controlPanel");
        document.getElementById("controlPanelContainer").removeChild(controlPanel);

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