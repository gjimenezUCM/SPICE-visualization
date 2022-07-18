/**
 * @fileoverview This class creates a dropdown Menu that allows the user to choose what is the
 * source of the perspective files.
 * @package Requires bootstrap package to be able to use the dropdown. 
 * @author Marco Expósito Pérez
 * 
 */

export default class FileSourceItem {

    /**
     * Constructor of the class
     * @param {ToolBar} toolbar toolbar owner of this item
     */
    constructor(toolbar) {
        this.toolbar = toolbar;

        this.sourceURL = {
            githubMainOption: "https://raw.githubusercontent.com/gjimenezUCM/SPICE-visualization/main/data/",
            localOption: "../data/",
            githubDevOption: "https://raw.githubusercontent.com/gjimenezUCM/SPICE-visualization/develop/data/",
        }

        const isLocalhost = window.location.hostname === "localhost";
        const msg = isLocalhost ? "App running as localhost" : "App running in an external server: " + window.location.hostname;
        console.log(msg);

        this.toolbar.changeFileSourceURL(isLocalhost ? this.sourceURL.localOption: this.sourceURL.githubMainOption);

        this.htmlString = `
        <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle unselectable" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                File Source
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                <li><a class="dropdown-item unselectable ${!isLocalhost ? 'active"' : ""}" name="fileSource" id="githubMainOption">Github Main</a></li>
                <li><a class="dropdown-item unselectable ${isLocalhost ? 'active"' : ""}" name="fileSource" id="localOption" >Local</a></li>
                <li><a class="dropdown-item unselectable" name="fileSource" id="githubDevOption" >Github Develop</a></li>
            </ul>
        </li>`;

    }

    /**
     * Create the events related with the File Source dropdown
     */
     createEvents(){
        this.fileSourceArray = new Array();

        this.fileSourceOptions = document.querySelectorAll("a[name='fileSource']");

        for(const option of this.fileSourceOptions){
            option.onclick = () => this.fileSourceOnclick(option.id);
        }
    }

    /**
     * Function executed when a file source option is clicked. Changes the file source url and restart the aplication
     * @param {String} id id of the option clicked
     */
    fileSourceOnclick(id){
        let url = this.sourceURL[id];

        this.toolbar.changeFileSourceURL(url);

        for(const option of this.fileSourceOptions){
            if(option.id === id){
                option.className = "dropdown-item unselectable active";
            }else{
                option.className = "dropdown-item unselectable";
            }
        }
    }

    setConfiguration(config){}

}