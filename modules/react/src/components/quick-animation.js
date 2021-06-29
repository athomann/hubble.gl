import React, {useState, useRef, useMemo} from 'react';
import DeckGL from '@deck.gl/react';
import ResolutionGuide from './resolution-guide';
import BasicControls from './basic-controls';
import {useDeckAdapter, useNextFrame} from '../hooks';

export const QuickAnimation = ({
  initialViewState,
  animation,
  timecode,
  dimension = {width: 640, height: 480},
  formatConfigs = {},
  deckProps = {}
}) => {
  const deckRef = useRef(null);
  const deck = useMemo(() => deckRef.current && deckRef.current.deck, [deckRef.current]);
  const [busy, setBusy] = useState(false);
  const onNextFrame = useNextFrame();
  const {adapter, layers, viewState, setViewState} = useDeckAdapter(animation, initialViewState);

  const mergedFormatConfigs = {
    webm: {
      quality: 0.8
    },
    jpeg: {
      quality: 0.8
    },
    gif: {
      sampleInterval: 1,
      width: dimension.width,
      height: dimension.height
    },
    ...formatConfigs
  };

  const mergedTimecode = {
    framerate: 30,
    start: 0,
    ...timecode
  };

  return (
    <div style={{position: 'relative'}}>
      <div style={{position: 'absolute'}}>
        <ResolutionGuide />
      </div>
      <DeckGL
        ref={deckRef}
        viewState={viewState}
        onViewStateChange={({viewState: vs}) => {
          setViewState(vs);
        }}
        controller={true}
        width={dimension.width}
        height={dimension.height}
        layers={layers}
        {...adapter.getProps({deck, onNextFrame, extraProps: deckProps})}
      />
      <div style={{position: 'absolute'}}>
        <BasicControls
          adapter={adapter}
          busy={busy}
          setBusy={setBusy}
          formatConfigs={mergedFormatConfigs}
          timecode={mergedTimecode}
        />
      </div>
    </div>
  );
};
