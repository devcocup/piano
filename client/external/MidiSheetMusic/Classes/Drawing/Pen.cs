using System;
using System.Collections.Generic;
using System.Text;

namespace MidiSheetMusic
{
    public class Pen
    {
        public Color Color;
        public int Width;
        public LineCap EndCap;

        public Pen(Color color, int width)
        {
            Color = color;
            Width = width;
        }
    }
}
