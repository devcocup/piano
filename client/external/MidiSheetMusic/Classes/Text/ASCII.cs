using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MidiSheetMusicBridge.Text
{
    public class ASCII
    {
        public string GetString(byte[] data, int startIndex, int len)
        {
            var toReturn = "";
            for (var i = 0; i < len && i < data.Length; i++)
                toReturn += (char)data[i + startIndex];
            return toReturn;
        }
    }
}
