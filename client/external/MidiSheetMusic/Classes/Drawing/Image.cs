using Bridge;
using System;
using System.Collections.Generic;
using System.Text;

namespace MidiSheetMusic
{
    public class Image
    {
        public object DomImage;

        protected Image(Type type, string filename)
        {
            Script.Call("bridgeUtil.image.ctor", this, type, filename);
        }

        public int Width
        {
            get
            {
                return Script.Call<int>("bridgeUtil.image.getWidth", this);
            }
        }

        public int Height
        {
            get
            {
                return Script.Call<int>("bridgeUtil.image.getHeight", this);
            }
        }
    }
}
