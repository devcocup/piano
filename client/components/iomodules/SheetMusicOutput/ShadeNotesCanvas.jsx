import React from 'react';
import PropTypes from 'prop-types';
import { SHADE_NOTE_TYPE_CURRENT, SHADE_NOTE_TYPE_SELECTION } from '../../../constants/shadeNoteTypes';

export default class ShadeNotesCanvas extends React.Component {
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    shadeNotesFunc: PropTypes.func,
    setCurrentNotePosition: PropTypes.func,
    setCurrentSelection: PropTypes.func,
    shadedNotes: PropTypes.arrayOf(PropTypes.shape({
      pulseTime: PropTypes.number,
      type: PropTypes.number,
    }))
  };

  constructor(props) {
    super(props);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.width) {
      this.canvasShadeNotes.width = this.props.width;
    }
    if (this.props.height) {
      this.canvasShadeNotes.height = this.props.height;
    }
    if (this.props.shadedNotes !== prevProps.shadedNotes) {
      this.props.shadedNotes.forEach(n => {
        const shadeRect = this.props.shadeNotesFunc && this.props.shadeNotesFunc(n.pulseTime, n.type);
        if (n.type === SHADE_NOTE_TYPE_CURRENT) {
          if (shadeRect) {
            this.props.setCurrentNotePosition && 
              this.props.setCurrentNotePosition(shadeRect.Y);
            this.props.setCurrentSelection &&
              this.props.setCurrentSelection(shadeRect);
          }
          
        } 
      });
    }

  }

  animate = scrollOffset => {
    this.clearShadeNotes();
    this.props.shadedNotes && this.props.shadedNotes.forEach(n => {
      const ctx = this.canvasShadeNotes.getContext('2d');
      ctx.translate(0, -scrollOffset);
      this.props.shadeNotesFunc && this.props.shadeNotesFunc(n.pulseTime, n.type);
      ctx.translate(0, scrollOffset);
    });
  }

  clearShadeNotes = () => {
    const ctx = this.canvasShadeNotes.getContext('2d');
    ctx.clearRect(
      0,
      0,
      this.canvasShadeNotes.width,
      this.canvasShadeNotes.height,
    );
  };

  render() {
    return (
      <canvas
        style={{ zIndex: 1, pointerEvents: 'none' }}
        className="canvas-shadeNotes"
        ref={el => (this.canvasShadeNotes = el)}
        width={1}
        height={1}
      />
    );
  }
}