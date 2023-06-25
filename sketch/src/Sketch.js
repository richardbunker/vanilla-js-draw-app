import { mouseDown, mouseMove, mouseUpOut, wheel } from "./listeners/Mouse.js";
import { touchDone, touchMove, touchStart } from "./listeners/Touch.js";
import { redraw, throttleSave, undoLast } from "./Strokes.js";
import { eraserOff, eraserOn, hidePenMenu, setColour, togglePenMenu } from "./ToolBar.js";

document.oncontextmenu = function () {
  return false;
};
export default class Sketch {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.config = initConfig(config);
    this.toolBar = initToolBar(this.canvas, this.context, config);
    const props = {
      canvas: this.canvas,
      context: this.context,
      state: this.config.state,
      toolBar: this.toolBar,
    };
    initListeners(props);
    redraw(props);
  }
}
const initConfig = (config) => {
  config = config || {};
  config.readOnly = config.readOnly || false;
  const strokes = initStrokes(config.strokes);
  config.state = initState(config);
  return config;
};
const initStrokes = (strokes) => {
  strokes = strokes || [];
  return strokes;
};
const initState = (config) => {
  const defaults = config.defaults || {};
  const state = {
    strokeHistory: config.strokes,
    actionHistory: [],
    currentStroke: [],
    cursorX: null,
    cursorY: null,
    cursorXprev: null,
    cursorYprev: null,
    lastTouches: [null, null],
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    eraseScale: 5,
    drawing: false,
    panning: false,
    rightMouseDown: false,
    erasing: false,
    penColour: defaults.penColour ? defaults.penColour : "#393939",
    lineWidth: defaults.lineWidth ? defaults.lineWidth : 2,
    prevPenState: {
      lineWidth: "",
      penColour: "",
    },
  };
  return state;
};
const initToolBar = (canvas, context, config) => {
  const sketch_menu = document.createElement("div");
  const sketch_style_head_tag = document.createElement("style");
  document.head.append(appendStyleTagToHead(sketch_style_head_tag));

  document.body.insertBefore(sketch_menu, canvas.nextSibling);
  appendMenu(sketch_menu);
  const toolBar = {};
  toolBar.state = {
    penMenuDisplayed: false,
  };
  toolBar.elements = {
    undoIcon: document.querySelector("#undoIcon"),
    penIcon: document.querySelector("#penIcon"),
    eraserIcon: document.querySelector("#eraserIcon"),
    penMenu: document.querySelector("#pen-menu"),
    colourBlack: document.querySelector("#colour-black"),
    colourWhite: document.querySelector("#colour-white"),
    colourRed: document.querySelector("#colour-red"),
    colourOrange: document.querySelector("#colour-orange"),
    colourYellow: document.querySelector("#colour-yellow"),
    colourGreen: document.querySelector("#colour-green"),
    colourBlue: document.querySelector("#colour-blue"),
    colourPurple: document.querySelector("#colour-purple"),
    colourPink: document.querySelector("#colour-pink"),
    pens: document.querySelector("#pens"),
    pen1: document.querySelector("#pen-1"),
    pen2: document.querySelector("#pen-2"),
    pen3: document.querySelector("#pen-3"),
    pen4: document.querySelector("#pen-4"),
    pen5: document.querySelector("#pen-5"),
    pen1Colour: document.querySelector("#pen-1-colour"),
    pen2Colour: document.querySelector("#pen-2-colour"),
    pen3Colour: document.querySelector("#pen-3-colour"),
    pen4Colour: document.querySelector("#pen-4-colour"),
    pen5Colour: document.querySelector("#pen-5-colour"),
    savingText: document.querySelector("#savingText"),
    saveIcon: document.querySelector("#save"),
  };
  toolBar.clickHandlers = {
    undoIcon: (toolBar.elements.undoIcon.onclick = function () {
      if (config.state.erasing) {
        eraserOff(toolBar.elements.eraserIcon, config.state);
      }
      undoLast({ canvas, context, state: config.state, toolBar });
    }),
    penIcon: (toolBar.elements.penIcon.onclick = function () {
      if (config.state.erasing) {
        eraserOff(toolBar.elements.eraserIcon, config.state);
      }
      togglePenMenu(toolBar);
    }),
    eraserIcon: (toolBar.elements.eraserIcon.onclick = function () {
      config.state.erasing
        ? eraserOff(toolBar.elements.eraserIcon, config.state)
        : eraserOn(toolBar.elements.eraserIcon, config.state);
      hidePenMenu(toolBar);
    }),
    colourBlack: (toolBar.elements.colourBlack.onclick = () => {
      if (config.state.erasing) {
        eraserOff(toolBar.elements.eraserIcon, config.state);
      }
      togglePenMenu(toolBar);
      setColour(toolBar, config.state, "#393939");
    }),
    colourWhite: (toolBar.elements.colourWhite.onclick = () => {
      if (config.state.erasing) {
        eraserOff(toolBar.elements.eraserIcon, config.state);
      }
      togglePenMenu(toolBar);
      setColour(toolBar, config.state, "#fff");
    }),
    colourRed: (toolBar.elements.colourRed.onclick = () => {
      if (config.state.erasing) {
        eraserOff(toolBar.elements.eraserIcon, config.state);
      }
      togglePenMenu(toolBar);
      setColour(toolBar, config.state, "#dc3545");
    }),
    colourOrange: (toolBar.elements.colourOrange.onclick = () => {
      if (config.state.erasing) {
        eraserOff(toolBar.elements.eraserIcon, config.state);
      }
      togglePenMenu(toolBar);
      setColour(toolBar, config.state, "#fd7e14");
    }),
    colourYellow: (toolBar.elements.colourYellow.onclick = () => {
      if (config.state.erasing) {
        eraserOff(toolBar.elements.eraserIcon, config.state);
      }
      togglePenMenu(toolBar);
      setColour(toolBar, config.state, "#ffc107");
    }),
    colourGreen: (toolBar.elements.colourGreen.onclick = () => {
      if (config.state.erasing) {
        eraserOff(toolBar.elements.eraserIcon, config.state);
      }
      togglePenMenu(toolBar);
      setColour(toolBar, config.state, "#28a745");
    }),
    colourBlue: (toolBar.elements.colourBlue.onclick = () => {
      if (config.state.erasing) {
        eraserOff(toolBar.elements.eraserIcon, config.state);
      }
      togglePenMenu(toolBar);
      setColour(toolBar, config.state, "#007bff");
    }),
    colourPurple: (toolBar.elements.colourPurple.onclick = () => {
      if (config.state.erasing) {
        eraserOff(toolBar.elements.eraserIcon, config.state);
      }
      togglePenMenu(toolBar);
      setColour(toolBar, config.state, "#6610f2");
    }),
    colourPink: (toolBar.elements.colourPink.onclick = () => {
      if (config.state.erasing) {
        eraserOff(toolBar.elements.eraserIcon, config.state);
      }
      togglePenMenu(toolBar);
      setColour(toolBar, config.state, "#dd00ff");
    }),
    pen1: (toolBar.elements.pen1.onclick = function () {
      if (config.state.erasing) {
        eraserOff(toolBar.elements.eraserIcon, config.state);
      }
      togglePenMenu(toolBar);
      config.state.lineWidth = 2;
    }),
    pen2: (toolBar.elements.pen2.onclick = function () {
      if (config.state.erasing) {
        eraserOff(toolBar.elements.eraserIcon, config.state);
      }
      togglePenMenu(toolBar);
      config.state.lineWidth = 3;
    }),
    pen3: (toolBar.elements.pen3.onclick = function () {
      if (config.state.erasing) {
        eraserOff(toolBar.elements.eraserIcon, config.state);
      }
      togglePenMenu(toolBar);
      config.state.lineWidth = 6;
    }),
    pen4: (toolBar.elements.pen4.onclick = function () {
      if (config.state.erasing) {
        eraserOff(toolBar.elements.eraserIcon, config.state);
      }
      togglePenMenu(toolBar);
      config.state.lineWidth = 10;
    }),
    pen5: (toolBar.elements.pen5.onclick = function () {
      if (config.state.erasing) {
        eraserOff(toolBar.elements.eraserIcon, config.state);
      }
      togglePenMenu(toolBar);
      config.state.lineWidth = 25;
    }),
    saveIcon: (toolBar.elements.saveIcon.onclick = function () {
      throttleSave(config.state.strokeHistory);
    }),
  };
  return toolBar;
};
const initListeners = (props) => {
  wheel(props);
  mouseDown(props);
  mouseMove(props);
  mouseUpOut(props);
  touchStart(props);
  touchMove(props);
  touchDone(props);
};
const appendStyleTagToHead = (el) => {
  el.innerHTML = `body, html
        {
        margin: 0;
        height: 100%;
        width: 100%;
        
        touch-action: none;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        }`;
  return el;
};
const appendMenu = (el) => {
  el.innerHTML = `<div class="absolute bg-blue-900 flex items-center justify-between left-0 py-2 top-0 w-full" role="toolbar">
        <a href="/" id="back" class="py-1 px-3 uppercase rounded text-xl text-white">
          <svg class="w-6 h-6 text-white fill-current" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z"/></svg>
        </a>
      <div class="space-x-6 flex">
          <div id="undoIcon" class="py-2 px-3 cursor-pointer uppercase rounded text-xl text-white">
            <svg class="w-6 h-6 text-white fill-current" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M17.026 22.957c10.957-11.421-2.326-20.865-10.384-13.309l2.464 2.352h-9.106v-8.947l2.232 2.229c14.794-13.203 31.51 7.051 14.794 17.675z"/></svg>
          </div>
          <div class="relative">
            <div id="penIcon" class="py-2 px-3 cursor-pointer uppercase rounded text-xl text-white">
              <svg class="w-6 h-6 text-white fill-current" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M18.363 8.464l1.433 1.431-12.67 12.669-7.125 1.436 1.439-7.127 12.665-12.668 1.431 1.431-12.255 12.224-.726 3.584 3.584-.723 12.224-12.257zm-.056-8.464l-2.815 2.817 5.691 5.692 2.817-2.821-5.693-5.688zm-12.318 18.718l11.313-11.316-.705-.707-11.313 11.314.705.709z"/></svg>
            </div>
            <div id="pen-menu" class="absolute top-0 left-0 mt-11 bg-gray-900 p-4 rounded space-y-4 hidden">
              <div class="grid grid-cols-3 grid-rows-2 gap-2" role="group">
                <button id="colour-black" type="button" class="h-10 w-10 rounded-full" style="background-color: #393939">&nbsp;</button>
                <button id="colour-white" type="button" class="h-10 w-10 rounded-full" style="background-color: #fff">&nbsp;</button>
                <button id="colour-red" type="button" class="h-10 w-10 rounded-full" style="background-color: #f02b3e">&nbsp;</button>
                <button id="colour-orange" type="button" class="h-10 w-10 rounded-full" style="background-color: #fd7e14">&nbsp;</button>
                <button id="colour-yellow" type="button" class="h-10 w-10 rounded-full" style="background-color: #ffc107">&nbsp;</button>
                <button id="colour-green" type="button" class="h-10 w-10 rounded-full" style="background-color: #28a745">&nbsp;</button>
                <button id="colour-blue" type="button" class="h-10 w-10 rounded-full" style="background-color: #007bff">&nbsp;</button>
                <button id="colour-purple" type="button" class="h-10 w-10 rounded-full" style="background-color: #6610f2">&nbsp;</button>
                <button id="colour-pink" type="button" class="h-10 w-10 rounded-full" style="background-color: #dd00ff">&nbsp;</button>
              </div>
              <div id="pens" style="background-color: #fff" class="h-10 flex items-center justify-between rounded px-2">
                <button id="pen-1" type="button" class="h-8 w-4 flex items-center justify-between">
                  <div id="pen-1-colour" style="background-color: #393939" class="h-1 w-1 rounded-full mx-auto"></div>
                </button>
                <button id="pen-2" type="button" class="h-8 w-6 flex items-center justify-between">
                  <div id="pen-2-colour" style="background-color: #393939" class="h-1.5 w-1.5 rounded-full mx-auto"></div>
                </button>
                <button id="pen-3" type="button" class="h-8 w-6 flex items-center justify-between">
                  <div id="pen-3-colour" style="background-color: #393939" class="h-2 w-2 rounded-full mx-auto"></div>
                </button>
                <button id="pen-4" type="button" class="h-8 w-6 flex items-center justify-between">
                  <div id="pen-4-colour" style="background-color: #393939" class="h-3 w-3 rounded-full mx-auto"></div>
                </button>
                <button id="pen-5" type="button" class="h-8 w-8 flex items-center justify-between">
                  <div id="pen-5-colour" style="background-color: #393939" class="h-6 w-6 rounded-full mx-auto"></div>
                </button>
              </div>
            </div>
          </div>
          <div id="eraserIcon" class="py-2 px-3 uppercase cursor-pointer rounded text-xl text-white">
            <svg class="w-6 h-6 text-white fill-current" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M5.662 23l-5.369-5.365c-.195-.195-.293-.45-.293-.707 0-.256.098-.512.293-.707l14.929-14.928c.195-.194.451-.293.707-.293.255 0 .512.099.707.293l7.071 7.073c.196.195.293.451.293.708 0 .256-.097.511-.293.707l-11.216 11.219h5.514v2h-12.343zm3.657-2l-5.486-5.486-1.419 1.414 4.076 4.072h2.829zm6.605-17.581l-10.677 10.68 5.658 5.659 10.676-10.682-5.657-5.657z"/></svg>
          </div>
        </div>
      <div class="flex items-center relative">
        <div id="savingText" class="absolute font-sans italic pr-2 right-10 text-right text-gray-300 text-xs w-56"></div>
        <div id="save" class="py-2 px-3 uppercase cursor-pointer rounded text-xl text-white">
          <svg class="w-6 h-6 text-white fill-current" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M13 3h2.996v5h-2.996v-5zm11 1v20h-24v-24h20l4 4zm-17 5h10v-7h-10v7zm15-4.171l-2.828-2.829h-.172v9h-14v-9h-3v20h20v-17.171z"/></svg>
        </div>
      </div>
    </div>`;
};

if (!localStorage.getItem("strokes")) {
  localStorage.setItem("strokes", JSON.stringify([]));
}
const canvas = document.getElementById("sketch");
const strokes = localStorage.getItem("strokes");
const mySketch = new Sketch(canvas, {
  strokes: JSON.parse(strokes),
  readOnly: false,
  defaults: {
    penColour: "#393939",
    lineWidth: 2,
  },
});
