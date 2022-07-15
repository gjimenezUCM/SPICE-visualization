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

export default class ToolBar {

    /**
     * Constructor of the class

     */
    constructor(initialOptions) {
        this.initialOptions = initialOptions;
        this.domParser = new DOMParser();

        const htmlString = `
        <nav class="navbar fixed-top navbar-expand-md navbar-light bg-light">
            <div class="container-fluid">
                        <! -- Left aligned items -->
                        <div class="d-flex col leftNavbarGroup">
                            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#collapseNavbar">
                                <span class="navbar-toggler-icon"></span>
                            </button>
                            <a class="navbar-brand abs" href="#"> Visualization module</a>

                            <div class="navbar-collapse collapse" id="collapseNavbar">
                                <ul class="navbar-nav">
                                    <li class="nav-item dropdown">
                                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            File Source
                                        </a>
                                        <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                                            <li><a class="dropdown-item unselectable" name="fileSource" id="githubMainOption">Github Main</a></li>
                                            <li><a class="dropdown-item unselectable" name="fileSource" id="LocalOption" >Local</a></li>
                                            <li><a class="dropdown-item unselectable" name="fileSource" id="githubDevOption" >Github Develop</a></li>
                                        </ul>
                                    </li>

                                    <li class="nav-item dropdown">
                                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            Options
                                        </a>
                                        <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                                            <li><a class="dropdown-item" href="#">Hide node labels</a></li>
                                            <li><a class="dropdown-item" href="#">Hide unselected Edges</a></li>
                                            <li><hr class="dropdown-divider"></li>
                                            <li><a class="dropdown-item" href="#">Variable edge width</a></li>
                                            <li><hr class="dropdown-divider"></li>
                                            <li><a class="dropdown-item" href="#">Allow third dimension</a></li>
                                        </ul>
                                    </li>

                                    <li class="nav-item dropdown">
                                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            Layout
                                        </a>
                                        <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                                            <li><a class="dropdown-item" href="#">Horizontal</a></li>
                                            <li><a class="dropdown-item" href="#">Vertical</a></li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                        </div>

                    <! -- Mid aligned items -->
                    <div class="d-flex col">
                        <ul class="navbar-nav">
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle btn-secondary" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Select Perspective
                                </a>
                                <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                                    <li><a class="dropdown-item" href="#">Perspective 1</a></li>
                                    <li><a class="dropdown-item" href="#">Perspective 2 action</a></li>
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
                                    <li><a class="dropdown-item" href="#">WIP</a></li>
                                    <li><a class="dropdown-item" href="#">WIP</a></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>`;

        const html = this.domParser.parseFromString(htmlString, "text/html").body.firstChild;
        document.body.append(html);

        this.createOnclickEvents();
    }

    createOnclickEvents(){
        this.fileSourceEvents();


    }


    fileSourceEvents(){
        this.fileSourceArray = new Array();

        const fileSourceOptions = document.querySelectorAll("a[name='fileSource']");

        for(const option of fileSourceOptions){
            option.onclick = () => this.fileSourceOnClick(option.id);
        }
    }

    fileSourceOnClick(id){
        let url;
        switch(id){
            case "githubMainOption":
                url = "https://raw.githubusercontent.com/gjimenezUCM/SPICE-visualization/main/data/"
                break;
            case "LocalOption":
                url = "../data/";
                break;
            case "githubDevOption":
                url = "https://raw.githubusercontent.com/gjimenezUCM/SPICE-visualization/develop/data/"
                break;
        }

        this.initialOptions.changeFileSourceURL(url);
    }

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

}   