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
} from "../Strokes.js";
export const touchStart = ({ canvas, context, state }) => {
  canvas.addEventListener("touchstart", (event) => {
    onTouchStart(event, context, state);
  });
};
export const touchMove = (props) => {
  const { canvas } = props;
  canvas.addEventListener("touchmove", (event) => {
    onTouchMove(event, props);
  });
};
export const touchDone = (props) => {
  const { canvas } = props;
  canvas.addEventListener("touchend", (event) => onTouchDone(event, props));
  canvas.addEventListener("touchleave", (event) => onTouchDone(event, props));
  canvas.addEventListener("touchcancel", (event) => onTouchDone(event, props));
};
const onTouchStart = (event, context, state) => {
  event.preventDefault();
  console.log("Touch Start event fired.");
  if (event.touches.length == 1) {
    state.drawing = true;
    state.panning = false;
    const touch1X = event.touches[0].pageX;
    const touch1Y = event.touches[0].pageY;
    state.currentStroke.push([toTrueX(touch1X, state), toTrueY(touch1Y, state)]);
    state.lastTouches[0] = event.touches[0];
  } else if (event.touches.length >= 2) {
    state.panning = true;
    state.drawing = false;

    state.lastTouches[0] = event.touches[0];
    state.lastTouches[1] = event.touches[1];
  }
};
const onTouchMove = (event, { canvas, context, state, toolBar }) => {
  event.preventDefault();
  const touch1X = event.touches[0].pageX;
  const touch1Y = event.touches[0].pageY;
  const touch1Xprev = state.lastTouches[0].pageX;
  const touch1Yprev = state.lastTouches[0].pageY;

  if (state.panning) {
    // if panning there is more than 1 touch.
    // get the mid point of the first 2 touches

    const touch2X = event.touches[1].pageX;
    const touch2Y = event.touches[1].pageY;
    const midX = (touch1X + touch2X) / 2;
    const midY = (touch1Y + touch2Y) / 2;
    const hypot = Math.sqrt(Math.pow(touch1X - touch2X, 2) + Math.pow(touch1Y - touch2Y, 2));

    const touch2Xprev = state.lastTouches[1].pageX;
    const touch2Yprev = state.lastTouches[1].pageY;
    const midXprev = (touch1Xprev + touch2Xprev) / 2;
    const midYprev = (touch1Yprev + touch2Yprev) / 2;
    const hypotPrev = Math.sqrt(
      Math.pow(touch1Xprev - touch2Xprev, 2) + Math.pow(touch1Yprev - touch2Yprev, 2)
    );

    var zoomAmount = hypot / hypotPrev;
    const newScale = toThreeDecimals(state.scale * zoomAmount);
    if (newScale >= 0.35 && newScale <= 6) {
      state.scale = newScale;
      const scaleAmount = 1 - zoomAmount;

      // calc how many pixels the touches have moved in the x and y direction
      const panX = midX - midXprev;
      const panY = midY - midYprev;
      // scale this movement based on the zoom level
      state.offsetX += panX / state.scale;
      state.offsetY += panY / state.scale;

      // Get the relative position of the middle of the zoom.
      // 0, 0 would be top left.
      // 0, 1 would be top right etc.
      var zoomRatioX = midX / canvas.clientWidth;
      var zoomRatioY = midY / canvas.clientHeight;

      const unitsZoomedX = xUnitsScaled(canvas, state) * scaleAmount;
      const unitsZoomedY = yUnitsScaled(canvas, state) * scaleAmount;

      const unitsAddLeft = unitsZoomedX * zoomRatioX;
      const unitsAddTop = unitsZoomedY * zoomRatioY;

      state.offsetX += unitsAddLeft;
      state.offsetY += unitsAddTop;

      redraw({ canvas, context, state, toolBar });
    }
  } else if (state.drawing) {
    if (!state.erasing) {
      state.currentStroke.push([toTrueX(touch1X, state), toTrueY(touch1Y, state)]);
      drawLine(
        context,
        touch1Xprev,
        touch1Yprev,
        touch1X,
        touch1Y,
        state.penColour,
        state.lineWidth
      );
    } else {
      drawEraser(context, touch1Xprev, touch1Yprev, touch1X, touch1Y);
      findAndRemoveStrokeFromHistory(
        canvas,
        context,
        state,
        toolBar,
        toTrueX(touch1X, state),
        toTrueY(touch1Y, state)
      );
    }
  }

  state.lastTouches[0] = event.touches[0];
  state.lastTouches[1] = event.touches[1];
};
const onTouchDone = (event, { canvas, context, state, toolBar }) => {
  event.preventDefault();
  if (state.currentStroke.length > 1) {
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
  state.panning = false;
  state.drawing = false;
};
