import { type Api, start } from './api';
import * as autoPieces from './autoPieces';
import { type Config, configure } from './config';
import * as events from './events';
import { render, renderResized, updateBounds } from './render';
import { defaults, type HeadlessState, type State } from './state';
import * as svg from './svg';
import * as util from './util';
import { renderWrap } from './wrap';

export function initModule({ el, config }: { el: HTMLElement; config?: Config }): Api {
  return Chessground(el, config);
}

export function Chessground(element: HTMLElement, config?: Config): Api {
  const maybeState: State | HeadlessState = defaults();

  configure(maybeState, config || {});

  function redrawAll(): State {
    const prevUnbind = 'dom' in maybeState ? maybeState.dom.unbind : undefined;
    // compute bounds from existing board element if possible
    // this allows non-square boards from CSS to be handled (for 3D)
    const elements = renderWrap(element, maybeState),
      bounds = util.memo(() => elements.board.getBoundingClientRect()),
      redrawNow = (skipSvg?: boolean): void => {
        render(state);
        if (elements.autoPieces) autoPieces.render(state, elements.autoPieces);
        if (!skipSvg && elements.shapes) svg.renderSvg(state, elements);
      },
      onResize = (): void => {
        updateBounds(state);
        renderResized(state);
        if (elements.autoPieces) autoPieces.renderResized(state);
      };
    const state = maybeState as State;
    state.dom = {
      elements,
      bounds,
      redraw: debounceRedraw(redrawNow),
      redrawNow,
      unbind: prevUnbind,
    };
    state.drawable.prevSvgHash = '';
    updateBounds(state);
    redrawNow(false);
    events.bindBoard(state);
    if (!prevUnbind) state.dom.unbind = events.bindDocument(state, onResize);
    state.events.insert?.(elements);
    return state;
  }

  return start(redrawAll(), redrawAll);
}

function debounceRedraw(redrawNow: (skipSvg?: boolean) => void): () => void {
  let redrawing = false;
  return () => {
    if (redrawing) return;
    redrawing = true;
    requestAnimationFrame(() => {
      redrawNow();
      redrawing = false;
    });
  };
}
