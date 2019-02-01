import React from 'react';
import '../../external/MidiSheetMusic/build/bridge';
import '../../external/MidiSheetMusic/build/MidiSheetMusicBridge';
import debounce from 'lodash/debounce';
import '../../bridgeUtil';
import Easing from 'easing';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import lerp from '../../util/lerp';
import {
  setSelection,
  setAutoScroll,
} from '../../actions/sheetMusicOutputActions';

import '../../style/iomodules/sheet-music-output';

class SheetMusicOutput extends React.Component {
  constructor(props) {
    super(props);

    this.SELECT_CONTROL_OFFSET_LEFT = 10;
    this.SELECT_CONTROL_OFFSET_TOP = 5;

    this.prevPlayerTimeMillis = 0;
    this.lastScrollPos = -1;

    this.state = { selectionControlPosition: null };
  }

  componentDidMount() {
    this.divCanvasScroll.addEventListener('scroll', debounce(this.scroll, 100));
    window.addEventListener('resize', debounce(this.initSheetMusicCanvas, 100));
    this.canvasScrollContents.addEventListener('click', this.click);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.parsedMidiFile !== prevProps.parsedMidiFile) {
      this.loadMidiFile().then(() => this.updateSelectionFromProps());
    }

    if (
      this.props.selectionStartMs !== prevProps.selectionStartMs ||
      this.props.selectionEndMs !== prevProps.selectionEndMs
    ) {
      this.updateSelectionFromProps();
    }

    if (
      this.trackSettingsDisplayChanged(
        this.props.trackSettings,
        prevProps.trackSettings,
      )
    ) {
      this.initSheetMusic();
    }

    if (this.props.isPlaying !== prevProps.isPlaying) {
      this.setState({ selectionControlPosition: null });
    }
  }

  trackSettingsDisplayChanged = (trackSettings, prevTrackSettings) => {
    if (!trackSettings) {
      return false;
    }
    if (!prevTrackSettings) {
      return true;
    }
    return (
      trackSettings.length !== prevTrackSettings.length ||
      trackSettings.some(
        (_, i) => trackSettings[i].display !== prevTrackSettings[i].display,
      )
    );
  }

  init = () => {
    return window.bridgeUtil.image.preloadImages();
  }

  click = evt => {
    this.clearShadeNotes();
    this.currentPulseTime = this.sheetMusic.PulseTimeForPoint({
      X: evt.offsetX,
      Y: evt.offsetY,
    });
    this.prevPulseTime = this.currentPulseTime - this.measure;
    if (this.currentPulseTime > this.totalPulses) {
      this.currentPulseTime -= this.measure;
    }

    const lastClickMs = this.currentPulseTime / this.pulsesPerMs;
    this.props.callbacks.setCurrentMs(lastClickMs);
    const shadeRect = this.shadeNotes(
      this.currentPulseTime,
      this.prevPulseTime,
    );

    if (!shadeRect) {
      return;
    }
    this.setState({
      selectionControlPosition: {
        left: shadeRect.X + this.SELECT_CONTROL_OFFSET_LEFT,
        top: shadeRect.Y + shadeRect.Height + this.SELECT_CONTROL_OFFSET_TOP,
      },
      lastClickMs,
      lastClickPulse: this.currentPulseTime,
    });
  }

  initSheetMusicCanvas = () => {
    if (!this.sheetMusic) {
      return;
    }

    const canvasHeight =
      window.innerHeight - this.divCanvasScroll.getBoundingClientRect().top;
    this.canvasShadeNotes.width = this.sheetMusic.Width;
    this.canvasShadeNotes.height = canvasHeight;

    this.canvasMain.width = this.sheetMusic.Width;

    this.divCanvasScroll.style.width = this.sheetMusic.Width + 20 + 'px';
    this.divCanvasScroll.style.height = canvasHeight + 'px';
    this.canvasContainer.style.height = canvasHeight + 'px';
    this.canvasScrollContents.style.height = this.sheetMusic.Height + 'px';

    this.paintSheetMusic();
  }

  initSheetMusic = () => {
    return this.init().then(() => {
      if (!this.props.parsedMidiFile) {
        return;
      }

      this.sheetMusic = new MidiSheetMusic.SheetMusic.$ctor1(
        this.props.parsedMidiFile.getMidiFile(),
        this.props.parsedMidiFile.getMidiOptions(),
        this.props.parsedMidiFile.getDisplayTracks(),
      );
      this.sheetMusic.SetZoom(1.4);
      this.updateSelectionFromProps();
      this.initSheetMusicCanvas();
    });
  }

  loadMidiFile = () => {
    this.pulsesPerMs = this.props.parsedMidiFile.getPulsesPerMsec();
    this.totalPulses = this.props.parsedMidiFile.getTotalPulses();
    this.measure = this.props.parsedMidiFile.getMeasure();
    return this.initSheetMusic();
  }

  clearShadeNotes = () => {
    const ctx = this.canvasShadeNotes.getContext('2d');
    ctx.clearRect(
      0,
      0,
      this.canvasShadeNotes.width,
      this.canvasShadeNotes.height,
    );
  }

  getScrollOffset = () => {
    return this.divCanvasScroll.scrollTop;
  }

  paintSheetMusic = () => {
    if (!this.sheetMusic) {
      return;
    }

    this.canvasMain.height = this.sheetMusic.Height;
    const args = new MidiSheetMusic.PaintEventArgs();
    args.ClipRectangle = new MidiSheetMusic.Rectangle(
      0,
      0,
      this.sheetMusic.Width,
      this.sheetMusic.Height,
    );

    const ctx = this.canvasMain.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, this.canvasMain.width, this.canvasMain.height);

    this.sheetMusic.OnPaint(args);

    this.clearShadeNotes();
    this.shadeNotes(
      this.currentPulseTime,
      this.currentPulseTime - this.measure,
    );
  }

  scroll = () => {
    this.clearShadeNotes();
    this.shadeNotes(
      this.currentPulseTime,
      this.currentPulseTime - this.measure,
    );
    if (this.props.autoScroll && !this.isProgrammaticScrolling) {
      this.props.setAutoScroll(false);
    }
    this.isProgrammaticScrolling = false;
  }

  shadeNotes = (currentPulseTime, prevPulseTime) => {
    if (!this.sheetMusic) {
      return;
    }

    const offset = this.getScrollOffset();
    const ctx = this.canvasShadeNotes.getContext('2d');
    ctx.translate(0, -offset);
    const shadeRect = this.sheetMusic.ShadeNotes(
      currentPulseTime,
      prevPulseTime,
      true,
    );
    this.scrollTo(shadeRect.Y);
    ctx.translate(0, offset);
    return shadeRect;
  }

  scrollTo = scrollPos => {
    if (
      scrollPos >= 0 &&
      scrollPos !== this.lastScrollPos &&
      this.props.autoScroll
    ) {
      this.lastScrollPos = scrollPos;
      const start = this.divCanvasScroll.scrollTop;
      this.isScrolling = true;
      Easing.event(10, 'sinusoidal', { duration: 200 }).on('data', data => {
        this.isProgrammaticScrolling = true;
        this.divCanvasScroll.scrollTop = lerp(start, scrollPos, data);
      });
    }
  }

  animate = playerTimeMillis => {
    this.currentPulseTime = playerTimeMillis * this.pulsesPerMs;
    this.shadeNotes(this.currentPulseTime, this.prevPulseTime);
    this.prevPulseTime = this.currentPulseTime;
  }

  onNoteOff = () => {
    if (this.props.selectionStartMs >= 0 && this.props.selectionEndMs >= 0) {
      if (
        this.currentPulseTime / this.pulsesPerMs >
        this.props.selectionEndMs
      ) {
        this.props.callbacks.setCurrentMs(this.props.selectionStartMs);
      }
    }
  }

  setSelection = prop => {
    return () => {
      const currentSelection = {
        selectionStartMs: prop ? this.props.selectionStartMs : -1,
        selectionEndMs: prop ? this.props.selectionEndMs : -1,
        selectionStartPulse: prop ? this.props.selectionStartPulse : 0,
        selectionEndPulse: prop ? this.props.selectionEndPulse : 0,
      };
      if (prop) {
        currentSelection[`${prop}Ms`] = this.state.lastClickMs;
        currentSelection[`${prop}Pulse`] = this.state.lastClickPulse;
      }

      this.props.setSelection(currentSelection);

      this.setState({
        selectionControlPosition: null,
      });
    };
  }

  updateSelectionFromProps = () => {
    if (!this.sheetMusic) return;

    this.sheetMusic.SelectionStartPulse = this.props.selectionStartPulse;
    this.sheetMusic.SelectionEndPulse = this.props.selectionEndPulse;
    this.props.callbacks.setCurrentMs(this.props.selectionStartMs);

    const endSelectionRect = this.sheetMusic.ShadeNotes(
      this.sheetMusic.SelectionEndPulse,
      0,
      true,
    );

    this.setState({
      removeSelectionPosition: {
        left: endSelectionRect.X + this.SELECT_CONTROL_OFFSET_LEFT,
        top: endSelectionRect.Y + this.SELECT_CONTROL_OFFSET_TOP,
      },
    });

    this.paintSheetMusic();
  }

  handleAutoScrollClick = evt => {
    this.props.setAutoScroll(evt.target.checked);
  }

  render() {
    const defaultCanvasSize = { width: 1, height: 1 };
    return (
      <div className="sheet-music-output">
        <div className="sheet-music-controls">
          <label>
            <input
              type="checkbox"
              checked={!!this.props.autoScroll}
              onChange={this.handleAutoScrollClick}
            />{' '}
            Auto scroll
          </label>
        </div>

        <div
          className="canvas-container"
          ref={el => (this.canvasContainer = el)}
        >
          <div
            className="canvas-scroll"
            ref={el => (this.divCanvasScroll = el)}
          >
            <div
              className="canvas-scroll-contents"
              ref={el => (this.canvasScrollContents = el)}
            >
              <canvas
                className="canvas-main"
                ref={el => (this.canvasMain = el)}
                {...defaultCanvasSize}
              />
            </div>

            {this.state.selectionControlPosition && (
              <span
                className="selection-controls select-start-end"
                style={this.state.selectionControlPosition}
              >
                <button
                  type="button"
                  onClick={this.setSelection('selectionStart')}
                  title="Start selection"
                >
                  <i className="material-icons">last_page</i>
                </button>
                <button
                  type="button"
                  onClick={this.setSelection('selectionEnd')}
                  title="End selection"
                >
                  <i className="material-icons">first_page</i>
                </button>
              </span>
            )}
            {!this.props.isPlaying &&
              this.props.selectionStartPulse &&
              this.props.selectionEndPulse &&
              this.state.removeSelectionPosition && (
                <span
                  className="selection-controls"
                  style={this.state.removeSelectionPosition}
                >
                  <button
                    type="button"
                    onClick={this.setSelection(null)}
                    title="Clear selection"
                  >
                    <i className="material-icons">clear</i>
                  </button>
                </span>
              )}
          </div>
          <canvas
            style={{ zIndex: 1, pointerEvents: 'none' }}
            className="canvas-shadeNotes"
            ref={el => (this.canvasShadeNotes = el)}
            {...defaultCanvasSize}
          />
        </div>
      </div>
    );
  }
}

SheetMusicOutput.propTypes = {
  callbacks: PropTypes.object,
  parsedMidiFile: PropTypes.object,
  selectionStartMs: PropTypes.number,
  selectionEndMs: PropTypes.number,
  selectionStartPulse: PropTypes.number,
  selectionEndPulse: PropTypes.number,
  trackSettings: PropTypes.array,
  autoScroll: PropTypes.bool,
  setSelection: PropTypes.func,
  setAutoScroll: PropTypes.func,
};

const mapStateToProps = state => ({
  parsedMidiFile: state.parsedMidiFile,
  trackSettings: state.player.trackSettings,
  isPlaying: state.player.isPlaying,
  ...state.sheetMusicOutput,
});

const mapDispatchToProps = dispatch => ({
  setSelection: selection => dispatch(setSelection(selection)),
  setAutoScroll: autoScroll => dispatch(setAutoScroll(autoScroll)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { forwardRef: true },
)(SheetMusicOutput);
