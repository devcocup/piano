using System;
using System.Collections.Generic;
using System.Text;

namespace MidiSheetMusic
{
    public class Color
    {
        public int Red;
        public int Green;
        public int Blue;
        public int Alpha;

        public Color()
        {
            Alpha = 255;
        }

        public static Color FromArgb(int red, int green, int blue) {
            return FromArgb(255, red, green, blue);
        }

        public static Color FromArgb(int alpha, int red, int green, int blue)
        {
            return new Color
            {
                Alpha = alpha,
                Red = red,
                Green = green,
                Blue = blue
            };
        }

        public static Color Black { get { return new Color(); } }

        public static Color White { get { return FromArgb(255,255,255); } }

        public static Color LightGray { get { return FromArgb(0xd3,0xd3,0xd3); } }

        public int R { get { return Red; } }
        public int G { get { return Green; } }
        public int B { get { return Blue; } }

        public bool Equals(Color color)
        {
            return Red == color.Red && Green == color.Green && Blue == color.Blue && Alpha==color.Alpha;
        }
    }
}
