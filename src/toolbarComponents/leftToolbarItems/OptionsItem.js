
export default class OptionsItem {

    /**
     * Constructor of the class

     */
    constructor(toolbar) {
        this.toolbar = toolbar;

        const sliderValue = 0.5;
        this.htmlString = `                    
        <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" data-bs-auto-close="outside" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Options
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                <li><a class="dropdown-item unselectable" id="hideNodeLabels">Hide node labels</a></li>
                <li><a class="dropdown-item unselectable" id="hideUnselectedEdges">Hide unselected Edges</a></li>
                <li><hr class="dropdown-divider"></li>
                <li>
                    <div style="margin-left: 13px">          
                        Minimum Similarity:
                        <span class="unselectable" id="thresholdValue"> ${sliderValue} </span>
                    </div>
                    <div style="margin-left: 30px"> 
                        <input type="range" min="0.0" max="1.0" step="0.1" value="${sliderValue}" id="thresholdSlider"></input>
                    </div>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item unselectable" id="variableEdgeWidth">Variable edge width</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item unselectable" id="thirdDimension">Third dimension</a></li>
            </ul>
        </li>`;

    }

    /**
     * Create the events related with the File Source dropdown
     */
    createEvents() {
        const hideNodeLabels = document.getElementById("hideNodeLabels");
        hideNodeLabels.onclick = () => this.toggleNodeLabels(hideNodeLabels);

        const hideUnselectedEdges = document.getElementById("hideUnselectedEdges");
        hideUnselectedEdges.onclick = () => this.toggleUnselectedEdges(hideUnselectedEdges);

        const variableEdgeWidth = document.getElementById("variableEdgeWidth");
        variableEdgeWidth.onclick = () => this.toggleVariableEdgeWidth(variableEdgeWidth);

        const thirdDimension = document.getElementById("thirdDimension");
        thirdDimension.onclick = () => this.toggleThirdDimension(thirdDimension);

        const thresholdValue = document.getElementById("thresholdValue");
        const thresholdSlider = document.getElementById("thresholdSlider");

        thresholdSlider.onchange = () => this.thresholdChange(thresholdSlider.value);
        thresholdSlider.oninput = () => this.updateSliderText(thresholdSlider.value, thresholdValue);
    }

    /**
     * Function executed when hideNodeLabels option is clicked. Toggle node labels visibility
     * @param {HTMLElement} button button clicked
     */
    toggleNodeLabels(button) {
        let active = this.toolbar.toggleDropdownItemState(button);

        //this.toolbar.networksGroup.nodeLabelVisibilityChangeALL(active);

        console.log(`toggle node labels ${active}`);
    }

    /**
     * Function executed when hideUnselectedEdges option is clicked. Toggle the visibility of the unselected edges
     * @param {HTMLElement} button button clicked
     */
    toggleUnselectedEdges(button) {
        let active = this.toolbar.toggleDropdownItemState(button);

        //this.toolbar.networksGroup.hideUnselectedEdgesALL(active);

        console.log(`toggle unselected edges ${active}`);
    }

    /**
     * Function executed when variableEdgeWidth option is clicked. Toggle the edges's options to change the width based on their similarity
     * @param {HTMLElement} button button clicked
     */
    toggleVariableEdgeWidth(button) {
        let active = this.toolbar.toggleDropdownItemState(button);

        //this.toolbar.networksGroup.variableEdgeChangeALL(active);

        console.log(`toggle variableEdgeWidth ${active}`);
    }

    /**
     * Function executed when thirdDimension option is clicked. Toggle the node's thirdDimension to change the border color based on their 3rd explicit community value
     * @param {HTMLElement} button button clicked
     */
    toggleThirdDimension(button) {
        let active = this.toolbar.toggleDropdownItemState(button);

        //this.toolbar.networksGroup.variableEdgeChangeALL(active);

        console.log(`toggle thirdDimension ${active}`);
    }

    /**
     * Update all networks with the slider value
     * @param {Integer} value value of the slider
     */
    thresholdChange(value) {
        console.log(value)

        //this.toolbar.networksGroup.thresholdChangeALL(value);
    }

    /**
     * Update the slider text to show the new values
     * @param {Integer} value value to update to
     * @param {HTMLElement} text text to be updated
     */
    updateSliderText(value, text) {

        if (value === "0")
            value = "0.0";
        else if (value === "1")
            value = "1.0";

        text.innerHTML = value;
    }

}