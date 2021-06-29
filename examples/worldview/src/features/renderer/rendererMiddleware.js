/* eslint-disable  max-statements */
import {
  WebMEncoder,
  JPEGSequenceEncoder,
  PNGSequenceEncoder,
  PreviewEncoder,
  GifEncoder
} from '@hubble.gl/core';
import {updateTimeCursor} from '../timeline/timelineSlice';

import {
  previewVideo,
  renderVideo,
  signalRendering,
  signalPreviewing,
  stopVideo,
  seekTime,
  attachAnimation,
  busySelector,
  timecodeSelector,
  filenameSelector,
  formatConfigsSelector,
  adapterSelector
} from './rendererSlice';

const ENCODERS = {
  gif: GifEncoder,
  webm: WebMEncoder,
  jpeg: JPEGSequenceEncoder,
  png: PNGSequenceEncoder
};

const formatSelector = state => state.hubbleGl.renderer.format;
const encoderSelector = state => ENCODERS[formatSelector(state)] || ENCODERS.webm;

export const rendererMiddleware = store => next => action => {
  switch (action.type) {
    case previewVideo.type: {
      const {onStop} = action.payload;
      const state = store.getState();
      store.dispatch(signalPreviewing(true));
      const innerOnStop = () => {
        store.dispatch(signalPreviewing(false));
        if (onStop) onStop();
      };
      const adapter = adapterSelector(state);
      adapter.render({
        Encoder: PreviewEncoder,
        formatConfigs: formatConfigsSelector(state),
        timecode: timecodeSelector(state),
        filename: filenameSelector(state),
        onStop: innerOnStop
      });
      break;
    }
    case renderVideo.type: {
      const {onStop} = action.payload;
      const state = store.getState();
      const Encoder = encoderSelector(state);

      store.dispatch(signalRendering(true));

      const innerOnStop = () => {
        store.dispatch(signalRendering(false));
        if (onStop) onStop();
      };
      const adapter = adapterSelector(state);
      adapter.render({
        Encoder,
        formatConfigs: formatConfigsSelector(state),
        timecode: timecodeSelector(state),
        filename: filenameSelector(state),
        onStop: innerOnStop
      });

      break;
    }
    case stopVideo.type: {
      const state = store.getState();
      if (busySelector(state)) {
        const adapter = adapterSelector(state);
        adapter.stop(() => {
          store.dispatch(signalRendering(false)); // equivalent to signalPreviewing(false)
        });
      }
      break;
    }
    case seekTime.type: {
      const state = store.getState();
      if (!busySelector(state)) {
        store.dispatch(updateTimeCursor(action.payload.timeMs));
        const adapter = adapterSelector(state);
        adapter.seek(action.payload);
      }
      break;
    }
    case attachAnimation.type: {
      const state = store.getState();
      if (!busySelector(state)) {
        const adapter = adapterSelector(state);
        adapter.animationManager.attachAnimation(action.payload);
      }
      break;
    }
    default: {
      break;
    }
  }

  next(action);
};
