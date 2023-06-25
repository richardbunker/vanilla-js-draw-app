import {
    drawEraser,
    drawLine,
    findAndRemoveStrokeFromHistory,
    redraw,
    slimifyStroke,
    toThreeDecimals,
    toTrueX,
    toTrueY,
    updateStrokeHistory,
    xUnitsScaled,
    yUnitsScaled,
} from "../Strokes";

export const wheel = ({ canvas, context, state, toolBar }) => {
    document.addEventListener("wheel", (event) => {
        const deltaY = event.deltaY;
        const scaleAmount = -deltaY / 500;
        const newScale = toThreeDecimals(state.scale * (1 + scaleAmount));
        if (newScale >= 0.35 && newScale <= 6) {
            state.scale = newScale;
            var distX = event.pageX / canvas.clientWidth;
            var distY = event.pageY / canvas.clientHeight;

            const unitsZoomedX = xUnitsScaled(canvas, state) * scaleAmount;
            const unitsZoomedY = yUnitsScaled(canvas, state) * scaleAmount;

            const unitsAddLeft = unitsZoomedX * distX;
            const unitsAddTop = unitsZoomedY * distY;

            state.offsetX -= unitsAddLeft;
            state.offsetY -= unitsAddTop;
            redraw({ canvas, context, state, toolBar });
        }
    });
};
export const mouseDown = ({ canvas, state }) => {
    canvas.addEventListener(
        "mousedown",
        (event) => onMouseDown(event, state),
        false
    );
};
export const mouseMove = ({ canvas, context, state, toolBar }) => {
    canvas.addEventListener(
        "mousemove",
        (event) => onMouseMove(event, canvas, context, state, toolBar),
        false
    );
};
export const mouseUpOut = ({ canvas, context, state, toolBar }) => {
    canvas.addEventListener(
        "mouseup",
        () => onMouseUp(canvas, context, state, toolBar),
        false
    );
    canvas.addEventListener(
        "mouseout",
        () => onMouseUp(canvas, context, state, toolBar),
        false
    );
};
const onMouseDown = (event, state) => {
    if (event.button == 2) {
        state.rightMouseDown = true;
    } else {
        state.rightMouseDown = false;
    }

    state.cursorX = event.pageX;
    state.cursorY = event.pageY;
    state.cursorXprev = event.pageX;
    state.cursorYprev = event.pageY;

    if (state.shiftDown || state.rightMouseDown) {
        canvas.style.cursor = "grabbing";
        state.drawing = false;
        state.panning = true;
    } else {
        state.panning = false;
        state.drawing = true;
        if (!state.erasing) {
            state.currentStroke.push([
                toThreeDecimals(state.cursorX / state.scale - state.offsetX),
                toThreeDecimals(state.cursorY / state.scale - state.offsetY),
            ]);
        }
    }
};
const onMouseMove = (event, canvas, context, state, toolBar) => {
    state.cursorX = event.pageX;
    state.cursorY = event.pageY;

    if (state.panning) {
        state.offsetX += (state.cursorX - state.cursorXprev) / state.scale;
        state.offsetY += (state.cursorY - state.cursorYprev) / state.scale;
        redraw({ canvas, context, state, toolBar });
    } else if (state.drawing) {
        if (!state.erasing) {
            state.currentStroke.push([
                toTrueX(state.cursorX, state),
                toTrueY(state.cursorY, state),
            ]);
            drawLine(
                context,
                state.cursorXprev,
                state.cursorYprev,
                state.cursorX,
                state.cursorY,
                state.penColour,
                state.lineWidth
            );
        } else {
            drawEraser(
                context,
                state.cursorXprev,
                state.cursorYprev,
                state.cursorX,
                state.cursorY
            );
            findAndRemoveStrokeFromHistory(
                canvas,
                context,
                state,
                toolBar,
                toTrueX(state.cursorX, state),
                toTrueY(state.cursorY, state)
            );
        }
    }
    state.cursorXprev = state.cursorX;
    state.cursorYprev = state.cursorY;
};
const onMouseUp = (canvas, context, state, toolBar) => {
    if (state.drawing && !state.erasing) {
        updateStrokeHistory(
            state.strokeHistory,
            state.currentStroke,
            state.penColour,
            state.lineWidth,
            state.scale
        );
        state.actionHistory.push(slimifyStroke(state.currentStroke));
    }
    state.currentStroke = [];
    redraw({ canvas, context, state, toolBar });
    canvas.style.cursor = "crosshair";
    state.rightMouseDown = false;
    state.panning = false;
    state.drawing = false;
};
