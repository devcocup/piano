using System;
using System.Text;

namespace MidiSheetMusic
{
    //adapted from https://www.codeproject.com/Articles/10613/%2FArticles%2F10613%2FC-RIFF-Parser
    //modified to use byte array instead of stream since this will be compiled to Javascript
    public class RiffParserException : Exception
    {
        public RiffParserException(string message)
            : base(message)
        {

        }
    }

    public class RiffFileInfo
    {
        public string Header { get; set; }
        public string FileType { get; set; }
        public int FileSize { get; set; }
    }

    public class BoundedByteArray
    {
        private int offset;
        private int count;
        private byte[] data;
        public BoundedByteArray(int offset, int count, byte[] data)
        {
            this.offset = offset;
            this.count = count;
            this.data = data;
        }

        public byte[] GetData()
        {
            byte[] slice = new byte[count];
            Array.Copy(data, offset, slice, 0, count);
            return slice;
        }
    }

    public delegate void ProcessElement(string type, bool isList, BoundedByteArray data);


    public class RiffParser
    {
        private const int WordSize = 4;
        private const string Riff4CC = "RIFF";
        private const string RifX4CC = "RIFX";
        private const string List4CC = "LIST";

        private byte[] data;
        private int position;

        public RiffFileInfo FileInfo { get; private set; }

        private static RiffFileInfo ReadHeader(byte[] data)
        {
            if (data.Length < WordSize * 3)
            {
                throw new RiffParserException("Read failed. File too small?");
            }

            string header;
            if (!IsRiffFile(data, out header))
            {
                throw new RiffParserException("Read failed. No RIFF header");
            }
            return new RiffFileInfo
            {
                Header = header,
                FileSize = BitConverter.ToInt32(data, WordSize),
                FileType = Encoding.ASCII.GetString(data, WordSize * 2, WordSize),
            };
        }

        private RiffParser() { }

        public static RiffParser ParseByteArray(byte[] data)
        {
            var riffParser = new RiffParser();
            riffParser.Init(data);
            return riffParser;
        }
        private void Init(byte[] data)
        {
            this.data = data;
            FileInfo = ReadHeader(data);
            position = WordSize * 3;
        }

        public static bool IsRiffFile(byte[] data, out string header)
        {
            var test = Encoding.ASCII.GetString(data, 0, WordSize);
            if (test == Riff4CC || test == RifX4CC)
            {
                header = test;
                return true;
            }
            header = null;
            return false;
        }

        public bool Read(ProcessElement processElement)
        {
            if (data.Length - position < WordSize * 2)
            {
                return false;
            }

            var type = Encoding.ASCII.GetString(data, position, WordSize);
            position += WordSize;
            var size = BitConverter.ToInt32(data, position);
            position += WordSize;

            if (data.Length - position < size)
            {
                throw new RiffParserException($"Element size mismatch for element {type} " +
                    $"need {size} but have only {FileInfo.FileSize - position}");
            }

            if (type == List4CC)
            {
                var listType = Encoding.ASCII.GetString(data, position, WordSize);
                processElement(listType, true, new BoundedByteArray(position + WordSize, size, data));
                position += size;
            }
            else
            {
                var paddedSize = size;
                if ((size & 1) != 0) paddedSize++;
                processElement(type, false, new BoundedByteArray(position, size, data));
                position += paddedSize;
            }
            return true;
        }
    }
}
