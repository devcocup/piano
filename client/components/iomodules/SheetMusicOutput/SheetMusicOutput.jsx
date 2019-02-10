import React from 'react';
import '../../../external/MidiSheetMusic/build/bridge';
import '../../../external/MidiSheetMusic/build/MidiSheetMusicBridge';
import debounce from 'lodash/debounce';
import '../../../bridgeUtil';
import Easing from 'easing';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import lerp from '../../../util/lerp';
import ShadeNotesCanvas from './ShadeNotesCanvas';
import {
  setSelection,
  setAutoScroll,
} from '../../../actions/sheetMusicOutputActions';

import '../../../style/iomodules/sheet-music-output';
import { 
  SHADE_NOTE_TYPE_CURRENT,
  SHADE_NOTE_TYPE_SELECTION,
  SHADE_NOTE_TYPE_HIT,
  SHADE_NOTE_TYPE_MISS, 
} from '../../../constants/shadeNoteTypes';


class SheetMusicOutput extends React.Component {
  constructor(props) {
    super(props);

    this.SELECT_CONTROL_OFFSET_LEFT = 10;
    this.SELECT_CONTROL_OFFSET_TOP = 5;

    this.prevPlayerTimeMillis = 0;
    this.lastScrollPos = -1;

    this.state = { selectionControlPosition: null, shadedNotes: [] };
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
  };

  init = () => {
    return window.bridgeUtil.image.preloadImages();
  };

  click = evt => {
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
    
    this.setState({
      lastClickMs,
      lastClickPulse: this.currentPulseTime,
      shadedNotes: this.getShadedNotes(),
    });
  };

  getShadedNotes = () => {
    const notes = [];
    if (this.currentPulseTime > 0) {
      notes.push({
        pulseTime: this.currentPulseTime,
        type: SHADE_NOTE_TYPE_CURRENT,
      });
    }
    return notes;
  }

  initSheetMusicCanvas = () => {
    if (!this.sheetMusic) {
      return;
    }

    const canvasHeight = window.innerHeight - 
      this.divCanvasScroll.getBoundingClientRect().top;

    this.canvasMain.width = this.sheetMusic.Width;

    this.divCanvasScroll.style.width = this.sheetMusic.Width + 20 + 'px';
    this.divCanvasScroll.style.height = canvasHeight + 'px';
    this.canvasContainer.style.height = canvasHeight + 'px';
    this.canvasScrollContents.style.height = this.sheetMusic.Height + 'px';

    this.paintSheetMusic();
  };

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
  };

  loadMidiFile = () => {
    this.pulsesPerMs = this.props.parsedMidiFile.getPulsesPerMsec();
    this.totalPulses = this.props.parsedMidiFile.getTotalPulses();
    this.measure = this.props.parsedMidiFile.getMeasure();
    return this.initSheetMusic();
  };

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
  };

  scroll = () => {
    if (this.props.autoScroll && !this.isProgrammaticScrolling) {
      this.props.setAutoScroll(false);
    }
    this.isProgrammaticScrolling = false;
  };

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
  };

  animate = playerTimeMillis => {
    this.currentPulseTime = playerTimeMillis * this.pulsesPerMs;
    this.prevPulseTime = this.currentPulseTime;
    this.shadeNotesCanvas && this.shadeNotesCanvas.animate(this.divCanvasScroll.scrollTop);
  };

  onNoteOff = () => {
    if (this.props.selectionEndMs > 0) {
      if (
        this.currentPulseTime / this.pulsesPerMs >
        this.props.selectionEndMs
      ) {
        this.props.callbacks.setCurrentMs(this.props.selectionStartMs);
      }
    }
  };

  onNoteOn = () => {
    this.setState({
      shadedNotes: this.getShadedNotes(),
    });
  }

  setSelection = prop => {
    return () => {
      const currentSelection = {
        selectionStartMs: prop ? this.props.selectionStartMs : 0,
        selectionEndMs: prop ? this.props.selectionEndMs : 0,
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
  };

  updateSelectionFromProps = () => {
    if (!this.sheetMusic) return;

    this.sheetMusic.SelectionStartPulse = this.props.selectionStartPulse;
    this.sheetMusic.SelectionEndPulse = this.props.selectionEndPulse;
    this.props.callbacks.setCurrentMs(this.props.selectionStartMs);

    this.paintSheetMusic();
  };

  handleAutoScrollClick = evt => {
    this.props.setAutoScroll(evt.target.checked);
  };

  handleSetCurrentNotePosition = y => {
    this.scrollTo(y);
  };

  handleSetCurrentSelection = rect => {
    this.setState({
      selectionControlPosition: {
        left: rect.X + this.SELECT_CONTROL_OFFSET_LEFT,
        top: rect.Y + rect.Height + this.SELECT_CONTROL_OFFSET_TOP,
      },
      removeSelectionPosition: {
        left: rect.X + this.SELECT_CONTROL_OFFSET_LEFT,
        top: rect.Y + this.SELECT_CONTROL_OFFSET_TOP,
      },
    });
  }

  generateBrush = noteType => {
    return new MidiSheetMusic.SolidBrush(MidiSheetMusic.Color.FromArgb(128, 0, 128, 200));
  }

  render() {
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
                width={1}
                height={1}
              />
            </div>

            {!this.props.isPlaying && this.state.selectionControlPosition && (
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
              this.props.selectionEndMs &&
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
          <ShadeNotesCanvas
            width={this.sheetMusic ? this.sheetMusic.Width : 0}
            height={window.innerHeight - (this.divCanvasScroll ? this.divCanvasScroll.getBoundingClientRect().top : 0)}
            shadedNotes={this.state.shadedNotes}
            shadeNotesFunc={this.sheetMusic && ((pulseTime, type) => this.sheetMusic.ShadeNotes(pulseTime, 0, true, this.generateBrush(type)))}
            setCurrentNotePosition={this.handleSetCurrentNotePosition}
            setCurrentSelection={this.handleSetCurrentSelection}
            ref={el => this.shadeNotesCanvas = el}
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
