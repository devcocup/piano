using Bridge;
using System;
using System.Collections.Generic;
using System.Text;

namespace MidiSheetMusic
{
    public class Graphics
    {
        public Graphics(string name)
        {
            Name = name;
            Script.Call("bridgeUtil.graphics.initGraphics", this);
        }

        public string Name;

        public object Context;

        public void TranslateTransform(int x, int y) {
            Script.Call("bridgeUtil.graphics.translateTransform", this, x, y);
        }

        public void DrawImage(Image image, int x, int y, int width, int height) {
            Script.Call("bridgeUtil.graphics.drawImage", this, image, x, y, width, height);
        }

        public void DrawString(string text, Font font, Brush brush, int x, int y) {
            Script.Call("bridgeUtil.graphics.drawString", this, text, font, brush, x, y);
        }

        public void DrawLine(Pen pen, int xStart, int yStart, int xEnd, int yEnd) {
            Script.Call("bridgeUtil.graphics.drawLine", this, pen, xStart, yStart, xEnd, yEnd);
        }

        public void DrawBezier(Pen pen, int x1, int y1, int x2, int y2, int x3, int y3, int x4, int y4) {
            Script.Call("bridgeUtil.graphics.drawBezier", this, pen, x1, y1, x2, y2, x3, y3, x4, y4);
        }

        public void ScaleTransform(float x, float y) {
            Script.Call("bridgeUtil.graphics.scaleTransform", this, x, y);
        }

        public void FillRectangle(Brush brush, int x, int y, int width, int height) {
            Script.Call("bridgeUtil.graphics.fillRectangle", this, brush, x, y, width, height);
        }

        public void ClearRectangle(int x, int y, int width, int height) {
            Script.Call("bridgeUtil.graphics.clearRectangle", this, x, y, width, height);
        }

        public void FillEllipse(Brush brush, int x, int y, int width, int height) {
            Script.Call("bridgeUtil.graphics.fillEllipse", this, brush, x, y, width, height);
        }

        public void DrawEllipse(Pen pen, int x, int y, int width, int height) {
            Script.Call("bridgeUtil.graphics.drawEllipse", this, pen, x, y, width, height);
        }

        public void RotateTransform(float angleDeg) {
            Script.Call("bridgeUtil.graphics.rotateTransform", this, angleDeg);
        }

        public SmoothingMode SmoothingMode { get; set; }

        public Rectangle VisibleClipBounds { get; set; }

        public float PageScale { get; set; }

        public void Dispose() { }
    }
}
