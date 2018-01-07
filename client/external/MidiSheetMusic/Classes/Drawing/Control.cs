using System;
using System.Collections.Generic;
using System.Text;

namespace MidiSheetMusic
{
    public class Control
    {
        public int Width;
        public int Height;

        public void Invalidate() { }

        public Graphics CreateGraphics(string name) { return new Graphics(name); }

        public Panel Parent { get { return new Panel(); } }

        public Color BackColor;
    }
}
