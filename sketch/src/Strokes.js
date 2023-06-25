import { currentDateTime } from "./DateHelper.js";
import { hidePenMenu } from "./ToolBar";

export const redraw = ({ canvas, context, state, toolBar }) => {
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    state.strokeHistory.forEach((data) => {
        drawStroke(context, state, {
            vectors: data.vectors,
            colour: data.colour,
            lineWidth: (data.lineWidth * state.scale) / data.vectorScale,
        });
    });
    hidePenMenu(toolBar);
};
export const drawLine = (context, x0, y0, x1, y1, colour, lineWidth) => {
    context.lineJoin = "round";
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = colour;
    context.lineWidth = lineWidth;
    context.stroke();
};
export const drawEraser = (context, x0, y0, x1, y1) => {
    context.lineJoin = "round";
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = "#fff";
    context.lineWidth = 5;
    context.stroke();
};
export const drawStroke = (context, state, { vectors, colour, lineWidth }) => {
    if (!vectors[0]) return;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.strokeStyle = colour;
    context.fillStyle = colour;
    context.lineWidth = lineWidth;

    if (vectors.length <= 3) {
        context.beginPath();
        context.arc(
            toScreenX(vectors[0][0], state),
            toScreenY(vectors[0][1], state),
            context.lineWidth / 2,
            0,
            Math.PI * 2,
            !0
        );
        context.fill();
        return;
    }
    context.beginPath();
    context.moveTo(
        toScreenX(vectors[0][0], state),
        toScreenY(vectors[0][1], state)
    );
    for (let i = 1; i < vectors.length - 1; i++) {
        let x0 = toScreenX(vectors[i][0], state);
        let y0 = toScreenY(vectors[i][1], state);

        let x1 = toScreenX(vectors[i + 1][0], state);
        let y1 = toScreenY(vectors[i + 1][1], state);

        let xC = (x0 + x1) / 2;
        let yC = (y0 + y1) / 2;
        context.quadraticCurveTo(x0, y0, xC, yC);
    }
    context.stroke();
};

export const findAndRemoveStrokeFromHistory = (
    canvas,
    context,
    state,
    toolBar,
    x0,
    y0
) => {
    const eraserMatrix = [[x0, y0]];
    for (let index = 1; index <= 10; index++) {
        eraserMatrix.push([x0 - index, y0 - index], [x0 + index, y0 + index]);
    }
    let foundXY = false;
    let strokeIndex;
    for (let index = 0; index < state.strokeHistory.length; index++) {
        const stroke = state.strokeHistory[index];
        const strokeLength = stroke.vectors.length;

        if (strokeLength == 1) {
            foundXY = strokeVectorExistsInXY(stroke.vectors, x0, y0);
        }

        if (strokeLength > 1 && strokeLength < 16) {
            foundXY = xyExistsInStroke(stroke.vectors, x0, y0);
        }

        if (strokeLength >= 16) {
            foundXY = xyExistsInQuarteredStroke(stroke.vectors, x0, y0);
        }

        if (foundXY) {
            strokeIndex = index;
            break;
        }
    }
    if (foundXY) {
        state.actionHistory.push(
            removeFromStrokeHistory(state.strokeHistory, strokeIndex)
        );
        redraw({ canvas, context, state, toolBar });
        return;
    }
};
const createEraserMatrix = (x, y) => {
    const eraserMatrix = [[x, y]];
    for (let index = 1; index <= 10; index++) {
        eraserMatrix.push([x - index, y - index], [x + index, y + index]);
    }
    return [
        eraserMatrix.map((eraser) => eraser[0]).sort((a, b) => a - b),
        eraserMatrix.map((eraser) => eraser[1]).sort((a, b) => a - b),
    ];
};
const strokeVectorExistsInXY = (vectors, x, y) => {
    const eraserMatrix = createEraserMatrix(x, y);
    let foundStrokeX = false;
    let foundStrokeY = false;
    if (
        eraserMatrix[1][0] <= vectors[0][1] &&
        vectors[0][1] <= eraserMatrix[1][eraserMatrix[1].length - 1]
    ) {
        foundStrokeY = true;
    }
    if (
        eraserMatrix[0][0] <= vectors[0][0] &&
        vectors[0][0] <= eraserMatrix[0][eraserMatrix[0].length - 1]
    ) {
        foundStrokeX = true;
    }
    if (foundStrokeX && foundStrokeY) {
        return true;
    } else {
        return false;
    }
};
const xyExistsInStroke = (vectors, x, y) => {
    const eraserMatrix = createEraserMatrix(x, y);
    const vectorXs = vectors.map((vector) => vector[0]).sort((a, b) => a - b);
    const vectorYs = vectors.map((vector) => vector[1]).sort((a, b) => a - b);
    let foundStrokeX = false;
    let foundStrokeY = false;
    if (
        vectorYs[0] <= eraserMatrix[1][20] &&
        eraserMatrix[1][0] <= vectorYs[vectorYs.length - 1]
    ) {
        foundStrokeY = true;
    }
    if (
        vectorXs[0] <= eraserMatrix[0][20] &&
        eraserMatrix[0][0] <= vectorXs[vectorXs.length - 1]
    ) {
        foundStrokeX = true;
    }
    if (foundStrokeX && foundStrokeY) {
        return true;
    } else {
        return false;
    }
};
const xyExistsInQuarteredStroke = (vectors, x, y) => {
    const halvedVectors = halfableArray(vectors);
    const halfA = halfableArray(halvedVectors[0]);
    const halfB = halfableArray(halvedVectors[1]);
    const quarteredVectors = [halfA[0], halfA[1], halfB[0], halfB[1]];
    const eraserMatrix = createEraserMatrix(x, y);
    let foundXY = false;
    quarteredVectors.map((quarteredVector) => {
        let foundQuarteredStrokeX = false;
        let foundQuarteredStrokeY = false;
        const vectorXs = quarteredVector
            .map((vector) => vector[0])
            .sort((a, b) => a - b);
        const vectorYs = quarteredVector
            .map((vector) => vector[1])
            .sort((a, b) => a - b);
        if (
            vectorYs[0] <= eraserMatrix[1][20] &&
            eraserMatrix[1][0] <= vectorYs[vectorYs.length - 1]
        ) {
            foundQuarteredStrokeY = true;
        } else {
            foundQuarteredStrokeY = false;
        }
        if (
            vectorXs[0] <= eraserMatrix[0][20] &&
            eraserMatrix[0][0] <= vectorXs[vectorXs.length - 1]
        ) {
            foundQuarteredStrokeX = true;
        } else {
            foundQuarteredStrokeX = false;
        }
        if (foundQuarteredStrokeX && foundQuarteredStrokeY) {
            foundXY = true;
        }
    });
    return foundXY;
};
const halfableArray = (array) => {
    let length = array.length;
    if (length == 1) {
        return [array];
    }
    if (array.length % 2 != 0) {
        length -= 1;
    }
    const halfWayPoint = length / 2;
    const firstHalf = [];
    const secondHalf = [];
    for (let index = 0; index < length; index++) {
        index < halfWayPoint
            ? firstHalf.push(array[index])
            : secondHalf.push(array[index]);
    }
    return [firstHalf, secondHalf];
};
const vectorsEqual = (vectorA, vectorB) => {
    if (vectorA.length != vectorB.length) return;
    for (let i = 0; i < vectorA.length; i++) {
        const elementA = vectorA[i];
        const elementB = vectorB[i];
        if (elementA != elementB) return false;
    }
    return true;
};
export const xUnitsScaled = (canvas, state) => {
    return canvas.clientWidth / state.scale;
};
export const yUnitsScaled = (canvas, state) => {
    return canvas.clientHeight / state.scale;
};
export const toScreenX = (xTrue, { offsetX, scale }) => {
    return toThreeDecimals((xTrue + offsetX) * scale);
};

export const toScreenY = (yTrue, { offsetY, scale }) => {
    return toThreeDecimals((yTrue + offsetY) * scale);
};

export const toTrueX = (xScreen, { offsetX, scale }) => {
    return toThreeDecimals(xScreen / scale - offsetX);
};

export const toTrueY = (yScreen, { offsetY, scale }) => {
    return toThreeDecimals(yScreen / scale - offsetY);
};

export const toThreeDecimals = (number) => {
    return Number(number.toFixed(3));
};
const strokesEqual = (strokeAVectors, strokeBVectors) => {
    if (strokeAVectors.length != strokeBVectors.length) return false;
    for (let i = 0; i < strokeAVectors.length; i++) {
        const strokeAVector = strokeAVectors[i];
        const strokeBVector = strokeBVectors[i];
        if (!vectorsEqual(strokeAVector, strokeBVector)) return false;
    }
    return true;
};
export const slimifyStroke = (path) => {
    if (path.length < 4) {
        return path;
    }
    const lastPoint = path[path.length - 1];
    let slimmed = path
        .filter((value, index) => {
            return index % 2 == 0;
        })
        .map((point) => {
            return [point[0], point[1]];
        });
    slimmed.push(lastPoint);
    return slimmed;
};
export const undoLast = (props) => {
    if (props.state.actionHistory.length == 0) return;
    const toUndo = props.state.actionHistory.pop();
    if (Array.isArray(toUndo)) {
        removeFromHistory(toUndo, props);
    } else {
        returnStrokeToStrokeHistory(toUndo, props.state.strokeHistory);
        drawStroke(props.context, props.state, toUndo);
        redraw(props);
    }
};
const removeFromHistory = (stroke, props) => {
    for (let i = props.state.strokeHistory.length - 1; i >= 0; i--) {
        const historyElement = props.state.strokeHistory[i];
        if (strokesEqual(historyElement.vectors, stroke)) {
            removeFromStrokeHistory(props.state.strokeHistory, i);
            redraw(props);
            return;
        }
    }
};
const removeFromStrokeHistory = (strokeHistory, strokeIndex) => {
    const removed = strokeHistory.splice(strokeIndex, 1)[0];
    debouncedSave(strokeHistory);
    return removed;
};
const returnStrokeToStrokeHistory = (
    { vectors, colour, lineWidth, vectorScale },
    strokeHistory
) => {
    strokeHistory.push({
        vectors,
        colour,
        lineWidth,
        vectorScale,
    });
    debouncedSave(strokeHistory);
};
export const updateStrokeHistory = (
    strokeHistory,
    currentStroke,
    penColour,
    lineWidth,
    scale
) => {
    strokeHistory.push({
        vectors: slimifyStroke(currentStroke),
        colour: penColour,
        lineWidth: lineWidth,
        vectorScale: scale,
    });
    debouncedSave(strokeHistory);
};
const save = (strokes) => {
    savingText.innerHTML = "Saving...";
    localStorage.setItem("strokes", JSON.stringify(strokes));
    debouncedText();
};
const updatedText = () => {
    savingText.innerHTML = "Saved " + currentDateTime();
};
const debouncedSave = _.debounce((strokes) => save(strokes), 2000);
const debouncedText = _.debounce(updatedText, 2000);
export const throttleSave = _.throttle((strokes) => save(strokes), 2000);
