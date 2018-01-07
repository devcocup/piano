using System;
using System.Collections.Generic;
using System.Text;

namespace MidiSheetMusic
{
    public class PaintEventArgs
    {
        public Rectangle ClipRectangle { get; set; }

        public Graphics Graphics() { return new Graphics("main"); }
    }
}
