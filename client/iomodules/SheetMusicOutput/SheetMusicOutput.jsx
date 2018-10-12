import React from 'react';
import '../../external/MidiSheetMusic/build/bridge';
import '../../external/MidiSheetMusic/build/MidiSheetMusicBridge'; 
import throttle from 'lodash/throttle';
import '../../bridgeUtil';
import ParsedMidiFile from '../../util/ParsedMidiFile';

import '../../style/iomodules/sheet-music-output';

export default class SheetMusicOutput extends React.Component {
  constructor(props) {
    super(props);

    this.initSheetMusic = this.initSheetMusic.bind(this);
    this.paintSheetMusic = this.paintSheetMusic.bind(this);
    this.clearShadeNotes = this.clearShadeNotes.bind(this);
    this.getOffset = this.getOffset.bind(this);
    this.paintSheetMusic = this.paintSheetMusic.bind(this);
    this.shadeNotes = this.shadeNotes.bind(this);
    this.loadMidiFile = this.loadMidiFile.bind(this);
    this.click = this.click.bind(this);
    this.setSelection = this.setSelection.bind(this);

    this.state = {
      selectionStartMs: -1,
      selectionEndMs: -1,
      selectionStartPulse: 0,
      selectionEndPulse: 0,
    };

    this.prevPlayerTimeMillis = 0;
  }

  componentDidMount() {
    this.divCanvasScroll.addEventListener('scroll', throttle(() => this.paintSheetMusic(), 100));
    window.addEventListener('resize', throttle(this.initSheetMusic, 100));
    this.canvasScrollContents.addEventListener('click', this.click)
  }

  click(evt) {
    this.clearShadeNotes();
    this.currentPulseTime = this.sheetMusic.PulseTimeForPoint({ X: evt.offsetX, Y: evt.offsetY });
    this.prevPulseTime = this.currentPulseTime - this.measure; 
    if (this.currentPulseTime > this.totalPulses) {
        this.currentPulseTime -= this.measure;
    }
    
    const lastClickMs = this.currentPulseTime / this.pulsesPerMs;
    this.props.setCurrentMs && this.props.setCurrentMs(lastClickMs);
    this.shadeNotes(this.currentPulseTime, this.prevPulseTime);
    this.setState({
      isSelecting: true,
      lastClickMs,
      lastClickPulse: this.currentPulseTime,
    });
  }

  initSheetMusic() {
    if (!this.sheetMusic) {
      return;
    }
    
    const canvasHeight = 800;
    [ this.canvasMain, this.canvasShadeNotes ].forEach(canvas => {
      canvas.width = this.sheetMusic.Width;
      canvas.height = canvasHeight;
    });

    this.divCanvasScroll.style.width = this.sheetMusic.Width + 20 + 'px';
    this.divCanvasScroll.style.height = canvasHeight + 'px';
    this.canvasContainer.style.height = canvasHeight + 'px';
    this.canvasScrollContents.style.height = this.sheetMusic.Height + 'px';

    this.paintSheetMusic();
  }

  loadMidiFile(file, fileName) {
    window.bridgeUtil.image.preloadImages().then(() => {
      const fileArray = new Uint8Array(file);
      const midiFile = new MidiSheetMusic.MidiFile(fileArray, fileName);
      const midiOptions = new MidiSheetMusic.MidiOptions.$ctor1(midiFile);
      this.pulsesPerMs = new ParsedMidiFile(file, fileName).getPulsesPerMsec();
      this.totalPulses = midiFile.TotalPulses;
      this.measure = midiFile.Time.Measure;
      midiOptions.twoStaffs = true;
      this.sheetMusic = new MidiSheetMusic.SheetMusic(midiFile, midiOptions);
      this.sheetMusic.SetZoom(1.4);
      this.initSheetMusic();
    });
  }

  clearShadeNotes() {
    const ctx = this.canvasShadeNotes.getContext('2d');
    ctx.clearRect(0,0, this.canvasShadeNotes.width, this.canvasShadeNotes.height);
  }

  getOffset() {
    return this.divCanvasScroll.scrollTop;
  }

  paintSheetMusic(clipRectangle) {
    if (!this.sheetMusic) {
      return;
    }

    this.clearShadeNotes();
    const offset = this.getOffset();
    const args = new MidiSheetMusic.PaintEventArgs();
    clipRectangle = clipRectangle || [0, offset, this.sheetMusic.Width, this.sheetMusic.Height];
    args.ClipRectangle = new MidiSheetMusic.Rectangle(...clipRectangle);
    const ctx = this.canvasMain.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0,0, this.canvasMain.width, this.canvasMain.height);
    ctx.translate(0, -offset);
    this.sheetMusic.OnPaint(args);
    ctx.translate(0, offset);

    this.shadeNotes(this.currentPulseTime, this.currentPulseTime - this.measure);
  }

  shadeNotes(currentPulseTime, prevPulseTime) {
    if (!this.sheetMusic) {
      return;
    }

    const offset = this.getOffset();
    const ctx = this.canvasShadeNotes.getContext('2d');
    ctx.translate(0, -offset);
    this.sheetMusic.ShadeNotes(currentPulseTime, prevPulseTime, true);
    ctx.translate(0, offset);
  }

  animate(playerTimeMillis, parsedMidiFile) {
    this.currentPulseTime = playerTimeMillis * this.pulsesPerMs;
    this.shadeNotes(this.currentPulseTime, this.prevPulseTime);
    this.prevPulseTime = this.currentPulseTime;
  }

  noteOff() {
    if (this.state.selectionStartMs >= 0 && 
      this.state.selectionEndMs >= 0) {
      if (this.currentPulseTime / this.pulsesPerMs > this.state.selectionEndMs) {
        this.props.setCurrentMs && this.props.setCurrentMs(this.state.selectionStartMs);
      }
    }
  }

  setSelection(isEnd) {
    return () => {
      const currentSelection = {
        selectionStartMs: this.state.selectionStartMs,
        selectionEndMs: this.state.selectionEndMs,
        selectionStartPulse: this.state.selectionStartPulse,
        selectionEndPulse: this.state.selectionEndPulse,
      };
      currentSelection[isEnd ? 'selectionEndMs' : 'selectionStartMs'] =
        this.state.lastClickMs;
      currentSelection[isEnd ? 'selectionEndPulse' : 'selectionStartPulse'] =
        this.state.lastClickPulse;

      this.sheetMusic.SelectionStartPulse = currentSelection.selectionStartPulse;
      this.sheetMusic.SelectionEndPulse = currentSelection.selectionEndPulse;
      this.paintSheetMusic();
      this.setState(currentSelection);
    };
  }

  render() {
    const defaultCanvasSize = { width: 1, height: 1 };
    return (
      <div className="sheet-music-output">
        { this.state.isSelecting && 
          <div className="sheet-music-controls">
            <button type="button" onClick={ this.setSelection(false) }>
              Selection start
            </button>
            <button type="button" onClick={ this.setSelection(true) }>
              Selection end
            </button>
          </div>
        }
        <div className="canvas-container" ref={ el => this.canvasContainer = el }>
          <div className="canvas-scroll" ref={ el => this.divCanvasScroll = el }>
            <div 
              className="canvas-scroll-contents" 
              ref={ el => this.canvasScrollContents = el } 
            />
          </div>
          <canvas 
            className="canvas-main"
            ref={ el => this.canvasMain = el } 
            {...defaultCanvasSize}
          />
          <canvas
            className="canvas-shadeNotes"
            ref={ el => this.canvasShadeNotes = el } 
            {...defaultCanvasSize}
          />
        </div>
      </div>
    );
  }
}