/**
 * @fileoverview This class creates a slider that changes the minimum similarity required for edges to be visible.
 * @author Marco Expósito Pérez
 */

//Namespaces
import { networkHTML } from "../constants/networkHTML";

export default class ThresholdSlider {

    /**
     * Constructor of the class
     * @param {HTMLElement} container html container where the slider will be appended
     * @param {NetworksGroup} networksGroup  group of all networks that will see their edges altered by the slider
     */
    constructor(container, networkGroup) {
        this.domParser = new DOMParser();
        this.networksGroups = networkGroup;
        this.value = networkHTML.sliderThresholdInitialValue;

        this.sliderId = "tresholdSlider";
        this.textId = "tresholdSliderText";

        const htmlString = this.thresholdSliderTemplate();
        const html = this.domParser.parseFromString(htmlString, "text/html").body.firstChild;

        container.append(html);

        this.addSliderOnchange();
    }

    /**
     * Function that returns a html string with the slider
     * @returns {String} returns the html string
     */
    thresholdSliderTemplate() {
        const html = `
        <div>
            <input type="range" min="0.0" max="1.0" step="0.1" value="${this.value}" id="${this.sliderId}"></input>
            <span class="unselectable"> Minimum Similarity: </span>
            <span class="unselectable" id="${this.textId}"> ${this.value} </span>
        </div>`;

        return html;
    }

    /**
     * Add onchange and oninput functions to the slider
     */
    addSliderOnchange() {
        const slider = document.getElementById(this.sliderId);
        const text = document.getElementById(this.textId);

        slider.onchange = () => this.thresholdChange(slider);
        slider.oninput = () => this.updateSliderText(slider, text);
    }



    /**
     * Returns the current value of the threshold Slider
     * @returns {Float} returns the value of the slider
     */
    getThreshold(){
        return this.value;
    }
}