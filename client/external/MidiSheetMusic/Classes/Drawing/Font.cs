using System;
using System.Collections.Generic;
using System.Text;

namespace MidiSheetMusic
{
    public class Font
    {
        public string Name;
        public int Size;
        public FontStyle Style;

        public Font(string name, int size, FontStyle style)
        {
            Name = name;
            Size = size;
            Style = style;
        }

        public float GetHeight() { return 0; }

        public void Dispose() { }
    }
}
