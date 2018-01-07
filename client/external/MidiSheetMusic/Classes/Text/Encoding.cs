using System;
using System.Collections.Generic;
using System.Text;

namespace MidiSheetMusic
{
    public static class Encoding
    {
        public static string GetUtf8String(byte[] value, int startIndex, int length) { return "not implemented!"; }

        public static string GetAsciiString(byte[] data, int startIndex, int len) 
        {
            var toReturn = "";
            for (var i = 0; i < len && i < data.Length; i++)
                toReturn += (char)data[i + startIndex];
            return toReturn;
        }

        public static byte[] GetAsciiBytes(string value) { return null; }
    }
}
