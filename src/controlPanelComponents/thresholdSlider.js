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
            <input type="range" min="0.0" max="1.0" step="0.1" value="${networkHTML.sliderThresholdInitialValue}" id="${this.sliderId}"></input>
            <span> Minimum Similarity: </span>
            <span id="${this.textId}"> ${networkHTML.sliderThresholdInitialValue} </span>
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
     *  Update all networks with the new threshold value.
     */
    thresholdChange(slider) {
        let newValue = slider.value;

        this.networksGroups.thresholdChangeALL(newValue);
    }

    /**
     * Update the slider text to show the new values
     */
    updateSliderText(slider, text) {
        let newValue = slider.value;

        if (newValue === "0") newValue = "0.0";
        if (newValue === "1") newValue = "1.0";

        text.innerHTML = newValue;
    }
}