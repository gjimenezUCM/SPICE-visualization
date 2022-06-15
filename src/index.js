/**
 * @fileoverview This Class is just the entry point of the application
 * @author Marco Expósito Pérez
 */
//Css
import bt_css from "../node_modules/bootstrap/dist/css/bootstrap.css";
import css from "../css/base.css";
//Local classes
import CreateVisualization from "./createVisualization.js";

window.onload = function () {
	new CreateVisualization();
}


