/**
 * @fileoverview This File is the entry point of the application
 * @author Marco Expósito Pérez
 */
//Css
import bt_css from "../node_modules/bootstrap/dist/css/bootstrap.css";
import base_css from "../css/genericStyle.css";
import legend_css from "../css/legendStyle.css";
import layout_css from "../css/networkLayout.css";
import toolBar_css from "../css/toolBar.css";

//Local classes
import ToolBar from "./toolBar";

window.onload = function () {
	new ToolBar();
}


