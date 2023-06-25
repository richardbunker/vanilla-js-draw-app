export const hidePenMenu = (toolBar) => {
    if (toolBar.state.penMenuDisplayed) {
        toolBar.elements.penMenu.classList.add("hidden");
        toolBar.elements.penIcon.classList.remove("bg-gray-900");
    }
};
export const togglePenMenu = (toolBar) => {
    if (!toolBar.state.penMenuDisplayed) {
        toolBar.elements.penMenu.classList.remove("hidden");
        toolBar.elements.penIcon.classList.add("bg-gray-900");
        toolBar.state.penMenuDisplayed = true;
    } else {
        toolBar.elements.penMenu.classList.add("hidden");
        toolBar.elements.penIcon.classList.remove("bg-gray-900");
        toolBar.state.penMenuDisplayed = false;
    }
};
export const eraserOff = (eraserIcon, state) => {
    eraserIcon.classList.remove("bg-gray-400");
    state.erasing = false;
    state.penColour = state.prevPenState.penColour;
    state.lineWidth = state.prevPenState.lineWidth;
};
export const eraserOn = (eraserIcon, state) => {
    state.erasing = true;
    eraserIcon.classList.add("bg-gray-400");
    state.prevPenState.penColour = state.penColour;
    state.prevPenState.lineWidth = state.lineWidth;
    state.penColour = "#fff";
    state.lineWidth = 10 / state.scale;
};
export const setColour = (toolBar, state, newColour) => {
    state.penColour = newColour;
    if (newColour === "#fff") {
        toolBar.elements.pens.style.backgroundColor = "#393939";
    } else {
        toolBar.elements.pens.style.backgroundColor = "#fff";
    }
    toolBar.elements.pen1Colour.style.backgroundColor = newColour;
    toolBar.elements.pen2Colour.style.backgroundColor = newColour;
    toolBar.elements.pen3Colour.style.backgroundColor = newColour;
    toolBar.elements.pen4Colour.style.backgroundColor = newColour;
    toolBar.elements.pen5Colour.style.backgroundColor = newColour;
};
