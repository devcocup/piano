using System;
using System.Collections.Generic;
using System.Text;

namespace MidiSheetMusic
{
    public class Brush
    {
        public Color Color;

        public Brush(Color color)
        {
            Color = color;
        }

        public void Dispose() { }
    }
}
