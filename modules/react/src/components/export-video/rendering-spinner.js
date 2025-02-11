import {WithKeplerUI} from '../inject-kepler';
import React, {useEffect, useState} from 'react';

import {LoaderWrapper, RenderingFeedbackContainer} from './styled-components';

/**
 * @typedef {Object} RenderingSpinnerProps
 * @property {boolean} rendering whether a video is currently rendering or not
 * @property {number} width width of container
 * @property {number} height height of container
 * @property {Object} adapter Hubble Deck adapter
 * @property {number} durationMs duration of animation set by user
 */

/**
 * @param {RenderingSpinnerProps} props
 * @returns {Object} React Component that gives user feedback after they click the "Render" button
 */
export function RenderingSpinner({rendering, width, height, adapter, durationMs}) {
  const percentRendered = Math.floor((adapter.videoCapture.timeMs / durationMs) * 100).toFixed(0);
  const showRenderingPercent = adapter.videoCapture._getNextTimeMs() < durationMs;
  const showSaving = adapter.videoCapture._getNextTimeMs() > durationMs;

  const [message, setMessage] = useState('Saving...');
  useEffect(() => {
    let waitTimeout;
    if (showSaving) {
      // Appears after "Saving..." message has been showing for at least 2s
      waitTimeout = setTimeout(() => setMessage('Saving...Hang Tight.'), 2000);
    } else {
      setMessage('Saving...');
      if (waitTimeout) clearTimeout(waitTimeout);
    }

    return () => {
      if (waitTimeout) clearTimeout(waitTimeout);
    };
  }, [showSaving]);

  return (
    <WithKeplerUI>
      {({LoadingSpinner}) => (
        <LoaderWrapper
          className="loader-wrapper"
          width={width}
          height={height}
          rendering={rendering}
        >
          <LoadingSpinner />
          <RenderingFeedbackContainer className="rendering-feedback-container" height={height}>
            {showRenderingPercent && <div className="rendering-percent">{percentRendered} %</div>}
            {showSaving && <div className="saving-message">{message}</div>}
          </RenderingFeedbackContainer>
        </LoaderWrapper>
      )}
    </WithKeplerUI>
  );
}
