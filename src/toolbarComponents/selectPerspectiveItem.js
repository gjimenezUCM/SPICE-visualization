/**
 * @fileoverview This class creates a dropdown Menu that allows the user to pick between diferent
 * perspectives to see/hide them
 * @package Requires bootstrap package to be able to use the dropdown. 
 * @author Marco Expósito Pérez
 */

import { Tooltip } from "bootstrap";

export default class SelectPerspectiveItem {
    
    /**
     * Constructor of the class
     * @param {ToolBar} toolbar toolbar owner of this item
     */
    constructor(toolbar) {
        this.toolbar = toolbar;

        this.htmlString = `
        <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle btn-secondary unselectable" data-bs-auto-close="outside" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Select Perspective
            </a>
            <ul class="dropdown-menu" id="dropdownPerspectivesOptionsMenu" aria-labelledby="navbarDropdown">
            </ul>
        </li>`;
    }

    /**
     * Create the events related with the Select perspective dropdown
     */
    createEvents(){

        const htmlString = this.createDropdownMenu();

        const html = this.toolbar.domParser.parseFromString(htmlString, "text/html").body.firstChild;
        document.getElementById("dropdownPerspectivesOptionsMenu").append(html);

        const perspectiveOptions = document.querySelectorAll("a[name='dropdownPerspectivesOptions']");
        this.perspectiveOptionsMap = new Map();
        if(this.toolbar.usingAPI){

            for(const option of perspectiveOptions){
                let id = option.getAttribute("key");
                this.perspectiveOptionsMap.set(id, option);

                option.onclick = () => this.selectPerspectiveOnclick(option);
                option.onmouseover = () => this.selectPerspectiveOnmouseover(option, this.perspectiveInfo.get(id))
                option.onmouseout = () => this.selectPerspectiveOnmouseout(option, this.perspectiveInfo.get(id))
            }

        }else{
            for(const option of perspectiveOptions){
                let id = option.getAttribute("key");
                this.perspectiveOptionsMap.set(id, option);

                option.onclick = () => this.selectPerspectiveOnclick(option);
            }
        }

    }
    
    /**
     * Creates the dropdown html structure based on the number of files available
     * @returns {String} returns the html string with the structure
     */
    createDropdownMenu(){
        this.restart();

        const file = this.toolbar.allPerspectivesFile;
        
        const n = file.length;
        let content = "<div>";
        
        if(this.toolbar.usingAPI){
            for (let i = 0; i < n; i++) {
                this.perspectiveInfo.set(file[i].perspective.id, file[i].perspective);
                content += this.dropdownRowTemplate(file[i].perspective.name, file[i].perspective.id);
            }
        }else{
            for (let i = 0; i < n; i++) {
                const key = file[i].name;
                content += this.dropdownRowTemplate(key);
            }
        }

        content += "</div>"
        return content;
    }

    /**
     * Function executed when a Select perspective option is clicked. Add/Hide the network perspective selected
     * @param {HTMLElement} button button clicked
     */
    selectPerspectiveOnclick(button){
        const active = this.toolbar.toggleDropdownItemState(button);
        let key = button.getAttribute("key");

        if(this.toolbar.usingAPI){
            //THIS SHOULD BE REMOVED WHEN POSSIBLE, THE PERSPECTIVE SHOULD BE ACCESED BY THE KEY/ID
            key = this.perspectiveInfo.get(key).name;
        }

        this.toolbar.togglePerspective(active, key);
    }

    selectPerspectiveOnmouseover(option, info){
        if(this.tooltip !== null)
            this.tooltip.hide();

        const tooltipOptions = {
            title: this.getTooltipContent(info),
            placement: "right",
            trigger: "manual",
            fallbackPlacements: ["right"],
            template: this.getTooltipTemplate(),
            html: true,
        };
        this.tooltip = new Tooltip(option, tooltipOptions);
        this.tooltip.show();
    }

    getTooltipContent(info){
        let parameters = "";

        const paramKeys = Object.keys(info.algorithm.params)
        for(let i = 0; i < paramKeys.length; i++){
            if(i === paramKeys.length-1){
                parameters += `${info.algorithm.params[paramKeys[i]]}`;
            }else{
                parameters += `${info.algorithm.params[paramKeys[i]]}, `;
            }
            
        }
        const htmlString = `
            <div class="row selectPerspective"> 
                Algorithm: ${info.algorithm.name}. 
            </div>
            <div class="row selectPerspective">
                Parameters used: ${parameters}
            </div>`;
           
        return htmlString;
    }

    getTooltipTemplate(){
        const htmlString=`
        <div class="tooltip" role="tooltip">
            <div class="tooltip-arrow"></div>
            <div class="tooltip-inner selectPerspective"></div>
        </div>`;

        return htmlString;
    }

    selectPerspectiveOnmouseout(){
        this.tooltip.hide();
        this.tooltip = null;
    }
    /**
     * Template of a row of the dropdown
     * @param {String} name key of this option
     * @param {String} id id of this option
     * @returns {String} returns the html string with the template
     */
    dropdownRowTemplate(name, id = null){
        return `
        <li>
            <a class="dropdown-item unselectable" name="dropdownPerspectivesOptions" key="${id === null ? name : id}" id="dropdownPerspectivesOptions${id === null ? name : id}">
                ${name}
            </a>
        </li>`;
    }



    setConfiguration(){}

    /**
     * Clear the dropdown menu options
     */
    restart(){
        this.perspectiveInfo = new Map();
        this.tooltip = null;

        const dropdownContainer = document.getElementById("dropdownPerspectivesOptionsMenu");
        if(dropdownContainer !== null)
            dropdownContainer.innerHTML = "";
    }

    disactivateOption(key){
        const button = this.perspectiveOptionsMap.get(key);
        this.toolbar.toggleDropdownItemState(button);
    }
}