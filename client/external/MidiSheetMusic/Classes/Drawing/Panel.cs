using System;
using System.Collections.Generic;
using System.Text;

namespace MidiSheetMusic
{
    public class Panel
    {
        private Point autoScrollPosition=new Point(0,0);
        public Point AutoScrollPosition { get { return autoScrollPosition; } set { autoScrollPosition = value; } }

        public int Width;
        public int Height;
    }
}
