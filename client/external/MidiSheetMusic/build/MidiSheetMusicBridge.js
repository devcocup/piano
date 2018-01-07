/**
 * @version 1.0.0.0
 * @copyright Copyright ©  2017
 * @compiler Bridge.NET 16.6.0
 */
Bridge.assembly("MidiSheetMusicBridge", function ($asm, globals) {
    "use strict";

    Bridge.define("MidiSheetMusic.Accid", {
        $kind: "enum",
        statics: {
            fields: {
                None: 0,
                Sharp: 1,
                Flat: 2,
                Natural: 3
            }
        }
    });

    Bridge.define("MidiSheetMusic.MusicSymbol");

    Bridge.define("MidiSheetMusic.Adler", {
        statics: {
            fields: {
                BASE: 0,
                NMAX: 0
            },
            ctors: {
                init: function () {
                    this.BASE = 65521;
                    this.NMAX = 5552;
                }
            },
            methods: {
                Adler32: function (buf) {
                    var result = MidiSheetMusic.Adler.Adler32$1(0, null, 0, 0);
                    result = MidiSheetMusic.Adler.Adler32$1(result, buf, 0, buf.length);
                    return result;
                },
                Adler32$1: function (adler, buf, index, len) {
                    if (buf == null) {
                        return 1;
                    }

                    var s1 = ((adler & 65535) >>> 0);
                    var s2 = (((adler >>> 16) & 65535) >>> 0);

                    while (len > 0) {
                        var k = len < MidiSheetMusic.Adler.NMAX ? len : MidiSheetMusic.Adler.NMAX;
                        len = (len - k) | 0;
                        while (k >= 16) {
                            //s1 += (buf[index++] & 0xff); s2 += s1;
                            s1 = (s1 + buf[System.Array.index(Bridge.identity(index, (index = (index + 1) | 0)), buf)]) >>> 0;
                            s2 = (s2 + s1) >>> 0;
                            s1 = (s1 + buf[System.Array.index(Bridge.identity(index, (index = (index + 1) | 0)), buf)]) >>> 0;
                            s2 = (s2 + s1) >>> 0;
                            s1 = (s1 + buf[System.Array.index(Bridge.identity(index, (index = (index + 1) | 0)), buf)]) >>> 0;
                            s2 = (s2 + s1) >>> 0;
                            s1 = (s1 + buf[System.Array.index(Bridge.identity(index, (index = (index + 1) | 0)), buf)]) >>> 0;
                            s2 = (s2 + s1) >>> 0;
                            s1 = (s1 + buf[System.Array.index(Bridge.identity(index, (index = (index + 1) | 0)), buf)]) >>> 0;
                            s2 = (s2 + s1) >>> 0;
                            s1 = (s1 + buf[System.Array.index(Bridge.identity(index, (index = (index + 1) | 0)), buf)]) >>> 0;
                            s2 = (s2 + s1) >>> 0;
                            s1 = (s1 + buf[System.Array.index(Bridge.identity(index, (index = (index + 1) | 0)), buf)]) >>> 0;
                            s2 = (s2 + s1) >>> 0;
                            s1 = (s1 + buf[System.Array.index(Bridge.identity(index, (index = (index + 1) | 0)), buf)]) >>> 0;
                            s2 = (s2 + s1) >>> 0;
                            s1 = (s1 + buf[System.Array.index(Bridge.identity(index, (index = (index + 1) | 0)), buf)]) >>> 0;
                            s2 = (s2 + s1) >>> 0;
                            s1 = (s1 + buf[System.Array.index(Bridge.identity(index, (index = (index + 1) | 0)), buf)]) >>> 0;
                            s2 = (s2 + s1) >>> 0;
                            s1 = (s1 + buf[System.Array.index(Bridge.identity(index, (index = (index + 1) | 0)), buf)]) >>> 0;
                            s2 = (s2 + s1) >>> 0;
                            s1 = (s1 + buf[System.Array.index(Bridge.identity(index, (index = (index + 1) | 0)), buf)]) >>> 0;
                            s2 = (s2 + s1) >>> 0;
                            s1 = (s1 + buf[System.Array.index(Bridge.identity(index, (index = (index + 1) | 0)), buf)]) >>> 0;
                            s2 = (s2 + s1) >>> 0;
                            s1 = (s1 + buf[System.Array.index(Bridge.identity(index, (index = (index + 1) | 0)), buf)]) >>> 0;
                            s2 = (s2 + s1) >>> 0;
                            s1 = (s1 + buf[System.Array.index(Bridge.identity(index, (index = (index + 1) | 0)), buf)]) >>> 0;
                            s2 = (s2 + s1) >>> 0;
                            s1 = (s1 + buf[System.Array.index(Bridge.identity(index, (index = (index + 1) | 0)), buf)]) >>> 0;
                            s2 = (s2 + s1) >>> 0;
                            k = (k - 16) | 0;
                        }
                        if (k !== 0) {
                            do {
                                s1 = (s1 + buf[System.Array.index(Bridge.identity(index, (index = (index + 1) | 0)), buf)]) >>> 0;
                                s2 = (s2 + s1) >>> 0;
                            } while (((k = (k - 1) | 0)) !== 0);
                        }
                        s1 = s1 % MidiSheetMusic.Adler.BASE;
                        s2 = s2 % MidiSheetMusic.Adler.BASE;
                    }
                    return (((((s2 << 16) >>> 0)) | s1) >>> 0);
                }
            }
        }
    });

    Bridge.define("MidiSheetMusic.Image", {
        fields: {
            DomImage: null
        },
        props: {
            Width: {
                get: function () {
                    return bridgeUtil.image.getWidth(this);
                }
            },
            Height: {
                get: function () {
                    return bridgeUtil.image.getHeight(this);
                }
            }
        },
        ctors: {
            ctor: function (type, filename) {
                this.$initialize();
                bridgeUtil.image.ctor(this, type, filename);
            }
        }
    });

    Bridge.define("MidiSheetMusic.Brush", {
        fields: {
            Color: null
        },
        ctors: {
            ctor: function (color) {
                this.$initialize();
                this.Color = color;
            }
        },
        methods: {
            Dispose: function () { }
        }
    });

    Bridge.define("MidiSheetMusic.Brushes", {
        statics: {
            props: {
                Black: {
                    get: function () {
                        return new MidiSheetMusic.Brush(MidiSheetMusic.Color.Black);
                    }
                },
                White: {
                    get: function () {
                        return new MidiSheetMusic.Brush(MidiSheetMusic.Color.White);
                    }
                }
            }
        }
    });

    Bridge.define("MidiSheetMusic.Clef", {
        $kind: "enum",
        statics: {
            fields: {
                Treble: 0,
                Bass: 1
            }
        }
    });

    Bridge.define("MidiSheetMusic.ClefMeasures", {
        statics: {
            methods: {
                MainClef: function (notes) {
                    var $t;
                    var middleC = MidiSheetMusic.WhiteNote.MiddleC.Number();
                    var total = 0;
                    $t = Bridge.getEnumerator(notes);
                    try {
                        while ($t.moveNext()) {
                            var m = $t.Current;
                            total = (total + m.Number) | 0;
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }if (notes.Count === 0) {
                        return MidiSheetMusic.Clef.Treble;
                    } else if (((Bridge.Int.div(total, notes.Count)) | 0) >= middleC) {
                        return MidiSheetMusic.Clef.Treble;
                    } else {
                        return MidiSheetMusic.Clef.Bass;
                    }
                }
            }
        },
        fields: {
            clefs: null,
            measure: 0
        },
        ctors: {
            ctor: function (notes, measurelen) {
                this.$initialize();
                this.measure = measurelen;
                var mainclef = MidiSheetMusic.ClefMeasures.MainClef(notes);
                var nextmeasure = measurelen;
                var pos = 0;
                var clef = mainclef;

                this.clefs = new (System.Collections.Generic.List$1(MidiSheetMusic.Clef)).ctor();

                while (pos < notes.Count) {
                    /* Sum all the notes in the current measure */
                    var sumnotes = 0;
                    var notecount = 0;
                    while (pos < notes.Count && notes.getItem(pos).StartTime < nextmeasure) {
                        sumnotes = (sumnotes + notes.getItem(pos).Number) | 0;
                        notecount = (notecount + 1) | 0;
                        pos = (pos + 1) | 0;
                    }
                    if (notecount === 0) {
                        notecount = 1;
                    }

                    /* Calculate the "average" note in the measure */
                    var avgnote = (Bridge.Int.div(sumnotes, notecount)) | 0;
                    if (avgnote === 0) {
                        /* This measure doesn't contain any notes.
                          Keep the previous clef.
                        */
                    } else if (avgnote >= MidiSheetMusic.WhiteNote.BottomTreble.Number()) {
                        clef = MidiSheetMusic.Clef.Treble;
                    } else if (avgnote <= MidiSheetMusic.WhiteNote.TopBass.Number()) {
                        clef = MidiSheetMusic.Clef.Bass;
                    } else {
                        /* The average note is between G3 and F4. We can use either
                          the treble or bass clef.  Use the "main" clef, the clef
                          that appears most for this track.
                        */
                        clef = mainclef;
                    }

                    this.clefs.add(clef);
                    nextmeasure = (nextmeasure + measurelen) | 0;
                }
                this.clefs.add(clef);
            }
        },
        methods: {
            GetClef: function (starttime) {

                /* If the time exceeds the last measure, return the last measure */
                if (((Bridge.Int.div(starttime, this.measure)) | 0) >= this.clefs.Count) {
                    return this.clefs.getItem(((this.clefs.Count - 1) | 0));
                } else {
                    return this.clefs.getItem(((Bridge.Int.div(starttime, this.measure)) | 0));
                }
            }
        }
    });

    Bridge.define("MidiSheetMusic.Color", {
        statics: {
            props: {
                Black: {
                    get: function () {
                        return new MidiSheetMusic.Color();
                    }
                },
                White: {
                    get: function () {
                        return MidiSheetMusic.Color.FromArgb(255, 255, 255);
                    }
                },
                LightGray: {
                    get: function () {
                        return MidiSheetMusic.Color.FromArgb(211, 211, 211);
                    }
                }
            },
            methods: {
                FromArgb: function (red, green, blue) {
                    return MidiSheetMusic.Color.FromArgb$1(255, red, green, blue);
                },
                FromArgb$1: function (alpha, red, green, blue) {
                    var $t;
                    return ($t = new MidiSheetMusic.Color(), $t.Alpha = alpha, $t.Red = red, $t.Green = green, $t.Blue = blue, $t);
                }
            }
        },
        fields: {
            Red: 0,
            Green: 0,
            Blue: 0,
            Alpha: 0
        },
        props: {
            R: {
                get: function () {
                    return this.Red;
                }
            },
            G: {
                get: function () {
                    return this.Green;
                }
            },
            B: {
                get: function () {
                    return this.Blue;
                }
            }
        },
        ctors: {
            ctor: function () {
                this.$initialize();
                this.Alpha = 255;
            }
        },
        methods: {
            Equals: function (color) {
                return this.Red === color.Red && this.Green === color.Green && this.Blue === color.Blue && this.Alpha === color.Alpha;
            }
        }
    });

    Bridge.define("MidiSheetMusic.Control", {
        fields: {
            Width: 0,
            Height: 0,
            BackColor: null
        },
        props: {
            Parent: {
                get: function () {
                    return new MidiSheetMusic.Panel();
                }
            }
        },
        methods: {
            Invalidate: function () { },
            CreateGraphics: function (name) {
                return new MidiSheetMusic.Graphics(name);
            }
        }
    });

    Bridge.define("MidiSheetMusic.Encoding", {
        statics: {
            methods: {
                GetUtf8String: function (value, startIndex, length) {
                    return "not implemented!";
                },
                GetAsciiString: function (data, startIndex, len) {
                    var toReturn = "";
                    for (var i = 0; i < len && i < data.length; i = (i + 1) | 0) {
                        toReturn = (toReturn || "") + String.fromCharCode(data[System.Array.index(((i + startIndex) | 0), data)]);
                    }
                    return toReturn;
                },
                GetAsciiBytes: function (value) {
                    return null;
                }
            }
        }
    });

    Bridge.define("MidiSheetMusic.File");

    Bridge.define("MidiSheetMusic.FileMode", {
        $kind: "enum",
        statics: {
            fields: {
                Create: 0
            }
        }
    });

    Bridge.define("MidiSheetMusic.Stream", {
        methods: {
            Write: function (buffer, offset, count) { },
            Close: function () { }
        }
    });

    Bridge.define("MidiSheetMusic.Font", {
        fields: {
            Name: null,
            Size: 0,
            Style: 0
        },
        ctors: {
            ctor: function (name, size, style) {
                this.$initialize();
                this.Name = name;
                this.Size = size;
                this.Style = style;
            }
        },
        methods: {
            GetHeight: function () {
                return 0;
            },
            Dispose: function () { }
        }
    });

    Bridge.define("MidiSheetMusic.FontStyle", {
        $kind: "enum",
        statics: {
            fields: {
                Regular: 0,
                Bold: 1
            }
        }
    });

    Bridge.define("MidiSheetMusic.Graphics", {
        fields: {
            Name: null,
            Context: null,
            SmoothingMode: 0,
            VisibleClipBounds: null,
            PageScale: 0
        },
        ctors: {
            ctor: function (name) {
                this.$initialize();
                this.Name = name;
                bridgeUtil.graphics.initGraphics(this);
            }
        },
        methods: {
            TranslateTransform: function (x, y) {
                bridgeUtil.graphics.translateTransform(this, x, y);
            },
            DrawImage: function (image, x, y, width, height) {
                bridgeUtil.graphics.drawImage(this, image, x, y, width, height);
            },
            DrawString: function (text, font, brush, x, y) {
                bridgeUtil.graphics.drawString(this, text, font, brush, x, y);
            },
            DrawLine: function (pen, xStart, yStart, xEnd, yEnd) {
                bridgeUtil.graphics.drawLine(this, pen, xStart, yStart, xEnd, yEnd);
            },
            DrawBezier: function (pen, x1, y1, x2, y2, x3, y3, x4, y4) {
                bridgeUtil.graphics.drawBezier(this, pen, x1, y1, x2, y2, x3, y3, x4, y4);
            },
            ScaleTransform: function (x, y) {
                bridgeUtil.graphics.scaleTransform(this, x, y);
            },
            FillRectangle: function (brush, x, y, width, height) {
                bridgeUtil.graphics.fillRectangle(this, brush, x, y, width, height);
            },
            ClearRectangle: function (x, y, width, height) {
                bridgeUtil.graphics.clearRectangle(this, x, y, width, height);
            },
            FillEllipse: function (brush, x, y, width, height) {
                bridgeUtil.graphics.fillEllipse(this, brush, x, y, width, height);
            },
            DrawEllipse: function (pen, x, y, width, height) {
                bridgeUtil.graphics.drawEllipse(this, pen, x, y, width, height);
            },
            RotateTransform: function (angleDeg) {
                bridgeUtil.graphics.rotateTransform(this, angleDeg);
            },
            Dispose: function () { }
        }
    });

    Bridge.define("MidiSheetMusic.IOException", {
        inherits: [System.Exception]
    });

    Bridge.define("MidiSheetMusic.KeySignature", {
        statics: {
            fields: {
                C: 0,
                G: 0,
                D: 0,
                A: 0,
                E: 0,
                B: 0,
                F: 0,
                Bflat: 0,
                Eflat: 0,
                Aflat: 0,
                Dflat: 0,
                Gflat: 0,
                sharpkeys: null,
                flatkeys: null
            },
            ctors: {
                init: function () {
                    this.C = 0;
                    this.G = 1;
                    this.D = 2;
                    this.A = 3;
                    this.E = 4;
                    this.B = 5;
                    this.F = 1;
                    this.Bflat = 2;
                    this.Eflat = 3;
                    this.Aflat = 4;
                    this.Dflat = 5;
                    this.Gflat = 6;
                }
            },
            methods: {
                CreateAccidentalMaps: function () {
                    if (MidiSheetMusic.KeySignature.sharpkeys != null) {
                        return;
                    }

                    var map;
                    MidiSheetMusic.KeySignature.sharpkeys = System.Array.init(8, null, System.Array.type(MidiSheetMusic.Accid));
                    MidiSheetMusic.KeySignature.flatkeys = System.Array.init(8, null, System.Array.type(MidiSheetMusic.Accid));

                    for (var i = 0; i < 8; i = (i + 1) | 0) {
                        MidiSheetMusic.KeySignature.sharpkeys[System.Array.index(i, MidiSheetMusic.KeySignature.sharpkeys)] = System.Array.init(12, 0, MidiSheetMusic.Accid);
                        MidiSheetMusic.KeySignature.flatkeys[System.Array.index(i, MidiSheetMusic.KeySignature.flatkeys)] = System.Array.init(12, 0, MidiSheetMusic.Accid);
                    }

                    map = MidiSheetMusic.KeySignature.sharpkeys[System.Array.index(MidiSheetMusic.KeySignature.C, MidiSheetMusic.KeySignature.sharpkeys)];
                    map[System.Array.index(MidiSheetMusic.NoteScale.A, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Asharp, map)] = MidiSheetMusic.Accid.Flat;
                    map[System.Array.index(MidiSheetMusic.NoteScale.B, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.C, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Csharp, map)] = MidiSheetMusic.Accid.Sharp;
                    map[System.Array.index(MidiSheetMusic.NoteScale.D, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Dsharp, map)] = MidiSheetMusic.Accid.Sharp;
                    map[System.Array.index(MidiSheetMusic.NoteScale.E, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.F, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Fsharp, map)] = MidiSheetMusic.Accid.Sharp;
                    map[System.Array.index(MidiSheetMusic.NoteScale.G, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Gsharp, map)] = MidiSheetMusic.Accid.Sharp;

                    map = MidiSheetMusic.KeySignature.sharpkeys[System.Array.index(MidiSheetMusic.KeySignature.G, MidiSheetMusic.KeySignature.sharpkeys)];
                    map[System.Array.index(MidiSheetMusic.NoteScale.A, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Asharp, map)] = MidiSheetMusic.Accid.Flat;
                    map[System.Array.index(MidiSheetMusic.NoteScale.B, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.C, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Csharp, map)] = MidiSheetMusic.Accid.Sharp;
                    map[System.Array.index(MidiSheetMusic.NoteScale.D, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Dsharp, map)] = MidiSheetMusic.Accid.Sharp;
                    map[System.Array.index(MidiSheetMusic.NoteScale.E, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.F, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Fsharp, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.G, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Gsharp, map)] = MidiSheetMusic.Accid.Sharp;

                    map = MidiSheetMusic.KeySignature.sharpkeys[System.Array.index(MidiSheetMusic.KeySignature.D, MidiSheetMusic.KeySignature.sharpkeys)];
                    map[System.Array.index(MidiSheetMusic.NoteScale.A, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Asharp, map)] = MidiSheetMusic.Accid.Flat;
                    map[System.Array.index(MidiSheetMusic.NoteScale.B, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.C, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Csharp, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.D, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Dsharp, map)] = MidiSheetMusic.Accid.Sharp;
                    map[System.Array.index(MidiSheetMusic.NoteScale.E, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.F, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Fsharp, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.G, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Gsharp, map)] = MidiSheetMusic.Accid.Sharp;

                    map = MidiSheetMusic.KeySignature.sharpkeys[System.Array.index(MidiSheetMusic.KeySignature.A, MidiSheetMusic.KeySignature.sharpkeys)];
                    map[System.Array.index(MidiSheetMusic.NoteScale.A, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Asharp, map)] = MidiSheetMusic.Accid.Flat;
                    map[System.Array.index(MidiSheetMusic.NoteScale.B, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.C, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Csharp, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.D, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Dsharp, map)] = MidiSheetMusic.Accid.Sharp;
                    map[System.Array.index(MidiSheetMusic.NoteScale.E, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.F, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Fsharp, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.G, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Gsharp, map)] = MidiSheetMusic.Accid.None;

                    map = MidiSheetMusic.KeySignature.sharpkeys[System.Array.index(MidiSheetMusic.KeySignature.E, MidiSheetMusic.KeySignature.sharpkeys)];
                    map[System.Array.index(MidiSheetMusic.NoteScale.A, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Asharp, map)] = MidiSheetMusic.Accid.Flat;
                    map[System.Array.index(MidiSheetMusic.NoteScale.B, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.C, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Csharp, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.D, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Dsharp, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.E, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.F, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Fsharp, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.G, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Gsharp, map)] = MidiSheetMusic.Accid.None;

                    map = MidiSheetMusic.KeySignature.sharpkeys[System.Array.index(MidiSheetMusic.KeySignature.B, MidiSheetMusic.KeySignature.sharpkeys)];
                    map[System.Array.index(MidiSheetMusic.NoteScale.A, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Asharp, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.B, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.C, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Csharp, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.D, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Dsharp, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.E, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.F, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Fsharp, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.G, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Gsharp, map)] = MidiSheetMusic.Accid.None;

                    /* Flat keys */
                    map = MidiSheetMusic.KeySignature.flatkeys[System.Array.index(MidiSheetMusic.KeySignature.C, MidiSheetMusic.KeySignature.flatkeys)];
                    map[System.Array.index(MidiSheetMusic.NoteScale.A, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Asharp, map)] = MidiSheetMusic.Accid.Flat;
                    map[System.Array.index(MidiSheetMusic.NoteScale.B, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.C, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Csharp, map)] = MidiSheetMusic.Accid.Sharp;
                    map[System.Array.index(MidiSheetMusic.NoteScale.D, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Dsharp, map)] = MidiSheetMusic.Accid.Sharp;
                    map[System.Array.index(MidiSheetMusic.NoteScale.E, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.F, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Fsharp, map)] = MidiSheetMusic.Accid.Sharp;
                    map[System.Array.index(MidiSheetMusic.NoteScale.G, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Gsharp, map)] = MidiSheetMusic.Accid.Sharp;

                    map = MidiSheetMusic.KeySignature.flatkeys[System.Array.index(MidiSheetMusic.KeySignature.F, MidiSheetMusic.KeySignature.flatkeys)];
                    map[System.Array.index(MidiSheetMusic.NoteScale.A, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Bflat, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.B, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.C, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Csharp, map)] = MidiSheetMusic.Accid.Sharp;
                    map[System.Array.index(MidiSheetMusic.NoteScale.D, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Eflat, map)] = MidiSheetMusic.Accid.Flat;
                    map[System.Array.index(MidiSheetMusic.NoteScale.E, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.F, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Fsharp, map)] = MidiSheetMusic.Accid.Sharp;
                    map[System.Array.index(MidiSheetMusic.NoteScale.G, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Aflat, map)] = MidiSheetMusic.Accid.Flat;

                    map = MidiSheetMusic.KeySignature.flatkeys[System.Array.index(MidiSheetMusic.KeySignature.Bflat, MidiSheetMusic.KeySignature.flatkeys)];
                    map[System.Array.index(MidiSheetMusic.NoteScale.A, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Bflat, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.B, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.C, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Csharp, map)] = MidiSheetMusic.Accid.Sharp;
                    map[System.Array.index(MidiSheetMusic.NoteScale.D, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Eflat, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.E, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.F, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Fsharp, map)] = MidiSheetMusic.Accid.Sharp;
                    map[System.Array.index(MidiSheetMusic.NoteScale.G, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Aflat, map)] = MidiSheetMusic.Accid.Flat;

                    map = MidiSheetMusic.KeySignature.flatkeys[System.Array.index(MidiSheetMusic.KeySignature.Eflat, MidiSheetMusic.KeySignature.flatkeys)];
                    map[System.Array.index(MidiSheetMusic.NoteScale.A, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Bflat, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.B, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.C, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Dflat, map)] = MidiSheetMusic.Accid.Flat;
                    map[System.Array.index(MidiSheetMusic.NoteScale.D, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Eflat, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.E, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.F, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Fsharp, map)] = MidiSheetMusic.Accid.Sharp;
                    map[System.Array.index(MidiSheetMusic.NoteScale.G, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Aflat, map)] = MidiSheetMusic.Accid.None;

                    map = MidiSheetMusic.KeySignature.flatkeys[System.Array.index(MidiSheetMusic.KeySignature.Aflat, MidiSheetMusic.KeySignature.flatkeys)];
                    map[System.Array.index(MidiSheetMusic.NoteScale.A, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Bflat, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.B, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.C, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Dflat, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.D, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Eflat, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.E, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.F, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Fsharp, map)] = MidiSheetMusic.Accid.Sharp;
                    map[System.Array.index(MidiSheetMusic.NoteScale.G, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Aflat, map)] = MidiSheetMusic.Accid.None;

                    map = MidiSheetMusic.KeySignature.flatkeys[System.Array.index(MidiSheetMusic.KeySignature.Dflat, MidiSheetMusic.KeySignature.flatkeys)];
                    map[System.Array.index(MidiSheetMusic.NoteScale.A, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Bflat, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.B, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.C, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Dflat, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.D, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Eflat, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.E, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.F, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Gflat, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.G, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Aflat, map)] = MidiSheetMusic.Accid.None;

                    map = MidiSheetMusic.KeySignature.flatkeys[System.Array.index(MidiSheetMusic.KeySignature.Gflat, MidiSheetMusic.KeySignature.flatkeys)];
                    map[System.Array.index(MidiSheetMusic.NoteScale.A, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Bflat, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.B, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.C, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Dflat, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.D, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Eflat, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.E, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.F, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Gflat, map)] = MidiSheetMusic.Accid.None;
                    map[System.Array.index(MidiSheetMusic.NoteScale.G, map)] = MidiSheetMusic.Accid.Natural;
                    map[System.Array.index(MidiSheetMusic.NoteScale.Aflat, map)] = MidiSheetMusic.Accid.None;


                },
                Guess: function (notes) {
                    var $t, $t1;
                    MidiSheetMusic.KeySignature.CreateAccidentalMaps();

                    /* Get the frequency count of each note in the 12-note scale */
                    var notecount = System.Array.init(12, 0, System.Int32);
                    for (var i = 0; i < notes.Count; i = (i + 1) | 0) {
                        var notenumber = notes.getItem(i);
                        var notescale = (((notenumber + 3) | 0)) % 12;
                        notecount[System.Array.index(notescale, notecount)] = (notecount[System.Array.index(notescale, notecount)] + 1) | 0;
                    }

                    /* For each key signature, count the total number of accidentals
                      needed to display all the notes.  Choose the key signature
                      with the fewest accidentals.
                    */
                    var bestkey = 0;
                    var is_best_sharp = true;
                    var smallest_accid_count = notes.Count;
                    var key;

                    for (key = 0; key < 6; key = (key + 1) | 0) {
                        var accid_count = 0;
                        for (var n = 0; n < 12; n = (n + 1) | 0) {
                            if (($t = MidiSheetMusic.KeySignature.sharpkeys[System.Array.index(key, MidiSheetMusic.KeySignature.sharpkeys)])[System.Array.index(n, $t)] !== MidiSheetMusic.Accid.None) {
                                accid_count = (accid_count + notecount[System.Array.index(n, notecount)]) | 0;
                            }
                        }
                        if (accid_count < smallest_accid_count) {
                            smallest_accid_count = accid_count;
                            bestkey = key;
                            is_best_sharp = true;
                        }
                    }

                    for (key = 0; key < 7; key = (key + 1) | 0) {
                        var accid_count1 = 0;
                        for (var n1 = 0; n1 < 12; n1 = (n1 + 1) | 0) {
                            if (($t1 = MidiSheetMusic.KeySignature.flatkeys[System.Array.index(key, MidiSheetMusic.KeySignature.flatkeys)])[System.Array.index(n1, $t1)] !== MidiSheetMusic.Accid.None) {
                                accid_count1 = (accid_count1 + notecount[System.Array.index(n1, notecount)]) | 0;
                            }
                        }
                        if (accid_count1 < smallest_accid_count) {
                            smallest_accid_count = accid_count1;
                            bestkey = key;
                            is_best_sharp = false;
                        }
                    }
                    if (is_best_sharp) {
                        return new MidiSheetMusic.KeySignature.$ctor1(bestkey, 0);
                    } else {
                        return new MidiSheetMusic.KeySignature.$ctor1(0, bestkey);
                    }
                },
                KeyToString: function (notescale) {
                    switch (notescale) {
                        case MidiSheetMusic.NoteScale.A: 
                            return "A major, F# minor";
                        case MidiSheetMusic.NoteScale.Bflat: 
                            return "B-flat major, G minor";
                        case MidiSheetMusic.NoteScale.B: 
                            return "B major, A-flat minor";
                        case MidiSheetMusic.NoteScale.C: 
                            return "C major, A minor";
                        case MidiSheetMusic.NoteScale.Dflat: 
                            return "D-flat major, B-flat minor";
                        case MidiSheetMusic.NoteScale.D: 
                            return "D major, B minor";
                        case MidiSheetMusic.NoteScale.Eflat: 
                            return "E-flat major, C minor";
                        case MidiSheetMusic.NoteScale.E: 
                            return "E major, C# minor";
                        case MidiSheetMusic.NoteScale.F: 
                            return "F major, D minor";
                        case MidiSheetMusic.NoteScale.Gflat: 
                            return "G-flat major, E-flat minor";
                        case MidiSheetMusic.NoteScale.G: 
                            return "G major, E minor";
                        case MidiSheetMusic.NoteScale.Aflat: 
                            return "A-flat major, F minor";
                        default: 
                            return "";
                    }
                }
            }
        },
        fields: {
            num_flats: 0,
            num_sharps: 0,
            treble: null,
            bass: null,
            keymap: null,
            prevmeasure: 0
        },
        ctors: {
            $ctor1: function (num_sharps, num_flats) {
                this.$initialize();
                if (!(num_sharps === 0 || num_flats === 0)) {
                    throw new System.ArgumentException("Bad KeySigature args");
                }
                this.num_sharps = num_sharps;
                this.num_flats = num_flats;

                MidiSheetMusic.KeySignature.CreateAccidentalMaps();
                this.keymap = System.Array.init(160, 0, MidiSheetMusic.Accid);
                this.ResetKeyMap();
                this.CreateSymbols();
            },
            ctor: function (notescale) {
                this.$initialize();
                this.num_sharps = (this.num_flats = 0);
                switch (notescale) {
                    case MidiSheetMusic.NoteScale.A: 
                        this.num_sharps = 3;
                        break;
                    case MidiSheetMusic.NoteScale.Bflat: 
                        this.num_flats = 2;
                        break;
                    case MidiSheetMusic.NoteScale.B: 
                        this.num_sharps = 5;
                        break;
                    case MidiSheetMusic.NoteScale.C: 
                        break;
                    case MidiSheetMusic.NoteScale.Dflat: 
                        this.num_flats = 5;
                        break;
                    case MidiSheetMusic.NoteScale.D: 
                        this.num_sharps = 2;
                        break;
                    case MidiSheetMusic.NoteScale.Eflat: 
                        this.num_flats = 3;
                        break;
                    case MidiSheetMusic.NoteScale.E: 
                        this.num_sharps = 4;
                        break;
                    case MidiSheetMusic.NoteScale.F: 
                        this.num_flats = 1;
                        break;
                    case MidiSheetMusic.NoteScale.Gflat: 
                        this.num_flats = 6;
                        break;
                    case MidiSheetMusic.NoteScale.G: 
                        this.num_sharps = 1;
                        break;
                    case MidiSheetMusic.NoteScale.Aflat: 
                        this.num_flats = 4;
                        break;
                    default: 
                        break;
                }

                MidiSheetMusic.KeySignature.CreateAccidentalMaps();
                this.keymap = System.Array.init(160, 0, MidiSheetMusic.Accid);
                this.ResetKeyMap();
                this.CreateSymbols();
            }
        },
        methods: {
            ResetKeyMap: function () {
                var key;
                if (this.num_flats > 0) {
                    key = MidiSheetMusic.KeySignature.flatkeys[System.Array.index(this.num_flats, MidiSheetMusic.KeySignature.flatkeys)];
                } else {
                    key = MidiSheetMusic.KeySignature.sharpkeys[System.Array.index(this.num_sharps, MidiSheetMusic.KeySignature.sharpkeys)];
                }

                for (var notenumber = 0; notenumber < this.keymap.length; notenumber = (notenumber + 1) | 0) {
                    this.keymap[System.Array.index(notenumber, this.keymap)] = key[System.Array.index(MidiSheetMusic.NoteScale.FromNumber(notenumber), key)];
                }
            },
            CreateSymbols: function () {
                var count = Math.max(this.num_sharps, this.num_flats);
                this.treble = System.Array.init(count, null, MidiSheetMusic.AccidSymbol);
                this.bass = System.Array.init(count, null, MidiSheetMusic.AccidSymbol);

                if (count === 0) {
                    return;
                }

                var treblenotes = null;
                var bassnotes = null;

                if (this.num_sharps > 0) {
                    treblenotes = System.Array.init([new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.F, 5), new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.C, 5), new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.G, 5), new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.D, 5), new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.A, 6), new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.E, 5)], MidiSheetMusic.WhiteNote);
                    bassnotes = System.Array.init([new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.F, 3), new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.C, 3), new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.G, 3), new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.D, 3), new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.A, 4), new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.E, 3)], MidiSheetMusic.WhiteNote);
                } else if (this.num_flats > 0) {
                    treblenotes = System.Array.init([new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.B, 5), new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.E, 5), new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.A, 5), new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.D, 5), new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.G, 4), new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.C, 5)], MidiSheetMusic.WhiteNote);
                    bassnotes = System.Array.init([new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.B, 3), new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.E, 3), new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.A, 3), new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.D, 3), new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.G, 2), new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.C, 3)], MidiSheetMusic.WhiteNote);
                }

                var a = MidiSheetMusic.Accid.None;
                if (this.num_sharps > 0) {
                    a = MidiSheetMusic.Accid.Sharp;
                } else {
                    a = MidiSheetMusic.Accid.Flat;
                }

                for (var i = 0; i < count; i = (i + 1) | 0) {
                    this.treble[System.Array.index(i, this.treble)] = new MidiSheetMusic.AccidSymbol(a, treblenotes[System.Array.index(i, treblenotes)], MidiSheetMusic.Clef.Treble);
                    this.bass[System.Array.index(i, this.bass)] = new MidiSheetMusic.AccidSymbol(a, bassnotes[System.Array.index(i, bassnotes)], MidiSheetMusic.Clef.Bass);
                }
            },
            GetSymbols: function (clef) {
                if (clef === MidiSheetMusic.Clef.Treble) {
                    return this.treble;
                } else {
                    return this.bass;
                }
            },
            GetAccidental: function (notenumber, measure) {
                if (measure !== this.prevmeasure) {
                    this.ResetKeyMap();
                    this.prevmeasure = measure;
                }

                var result = this.keymap[System.Array.index(notenumber, this.keymap)];
                if (result === MidiSheetMusic.Accid.Sharp) {
                    this.keymap[System.Array.index(notenumber, this.keymap)] = MidiSheetMusic.Accid.None;
                    this.keymap[System.Array.index(((notenumber - 1) | 0), this.keymap)] = MidiSheetMusic.Accid.Natural;
                } else if (result === MidiSheetMusic.Accid.Flat) {
                    this.keymap[System.Array.index(notenumber, this.keymap)] = MidiSheetMusic.Accid.None;
                    this.keymap[System.Array.index(((notenumber + 1) | 0), this.keymap)] = MidiSheetMusic.Accid.Natural;
                } else if (result === MidiSheetMusic.Accid.Natural) {
                    this.keymap[System.Array.index(notenumber, this.keymap)] = MidiSheetMusic.Accid.None;
                    var nextkey = MidiSheetMusic.NoteScale.FromNumber(((notenumber + 1) | 0));
                    var prevkey = MidiSheetMusic.NoteScale.FromNumber(((notenumber - 1) | 0));

                    /* If we insert a natural, then either:
                      - the next key must go back to sharp,
                      - the previous key must go back to flat.
                    */
                    if (this.keymap[System.Array.index(((notenumber - 1) | 0), this.keymap)] === MidiSheetMusic.Accid.None && this.keymap[System.Array.index(((notenumber + 1) | 0), this.keymap)] === MidiSheetMusic.Accid.None && MidiSheetMusic.NoteScale.IsBlackKey(nextkey) && MidiSheetMusic.NoteScale.IsBlackKey(prevkey)) {

                        if (this.num_flats === 0) {
                            this.keymap[System.Array.index(((notenumber + 1) | 0), this.keymap)] = MidiSheetMusic.Accid.Sharp;
                        } else {
                            this.keymap[System.Array.index(((notenumber - 1) | 0), this.keymap)] = MidiSheetMusic.Accid.Flat;
                        }
                    } else if (this.keymap[System.Array.index(((notenumber - 1) | 0), this.keymap)] === MidiSheetMusic.Accid.None && MidiSheetMusic.NoteScale.IsBlackKey(prevkey)) {
                        this.keymap[System.Array.index(((notenumber - 1) | 0), this.keymap)] = MidiSheetMusic.Accid.Flat;
                    } else if (this.keymap[System.Array.index(((notenumber + 1) | 0), this.keymap)] === MidiSheetMusic.Accid.None && MidiSheetMusic.NoteScale.IsBlackKey(nextkey)) {
                        this.keymap[System.Array.index(((notenumber + 1) | 0), this.keymap)] = MidiSheetMusic.Accid.Sharp;
                    } else {
                        /* Shouldn't get here */
                    }
                }
                return result;
            },
            GetWhiteNote: function (notenumber) {
                var notescale = MidiSheetMusic.NoteScale.FromNumber(notenumber);
                var octave = (((Bridge.Int.div((((notenumber + 3) | 0)), 12)) | 0) - 1) | 0;
                var letter = 0;

                var whole_sharps = System.Array.init([
                    MidiSheetMusic.WhiteNote.A, 
                    MidiSheetMusic.WhiteNote.A, 
                    MidiSheetMusic.WhiteNote.B, 
                    MidiSheetMusic.WhiteNote.C, 
                    MidiSheetMusic.WhiteNote.C, 
                    MidiSheetMusic.WhiteNote.D, 
                    MidiSheetMusic.WhiteNote.D, 
                    MidiSheetMusic.WhiteNote.E, 
                    MidiSheetMusic.WhiteNote.F, 
                    MidiSheetMusic.WhiteNote.F, 
                    MidiSheetMusic.WhiteNote.G, 
                    MidiSheetMusic.WhiteNote.G
                ], System.Int32);

                var whole_flats = System.Array.init([
                    MidiSheetMusic.WhiteNote.A, 
                    MidiSheetMusic.WhiteNote.B, 
                    MidiSheetMusic.WhiteNote.B, 
                    MidiSheetMusic.WhiteNote.C, 
                    MidiSheetMusic.WhiteNote.D, 
                    MidiSheetMusic.WhiteNote.D, 
                    MidiSheetMusic.WhiteNote.E, 
                    MidiSheetMusic.WhiteNote.E, 
                    MidiSheetMusic.WhiteNote.F, 
                    MidiSheetMusic.WhiteNote.G, 
                    MidiSheetMusic.WhiteNote.G, 
                    MidiSheetMusic.WhiteNote.A
                ], System.Int32);

                var accid = this.keymap[System.Array.index(notenumber, this.keymap)];
                if (accid === MidiSheetMusic.Accid.Flat) {
                    letter = whole_flats[System.Array.index(notescale, whole_flats)];
                } else if (accid === MidiSheetMusic.Accid.Sharp) {
                    letter = whole_sharps[System.Array.index(notescale, whole_sharps)];
                } else if (accid === MidiSheetMusic.Accid.Natural) {
                    letter = whole_sharps[System.Array.index(notescale, whole_sharps)];
                } else if (accid === MidiSheetMusic.Accid.None) {
                    letter = whole_sharps[System.Array.index(notescale, whole_sharps)];

                    /* If the note number is a sharp/flat, and there's no accidental,
                      determine the white note by seeing whether the previous or next note
                      is a natural.
                    */
                    if (MidiSheetMusic.NoteScale.IsBlackKey(notescale)) {
                        if (this.keymap[System.Array.index(((notenumber - 1) | 0), this.keymap)] === MidiSheetMusic.Accid.Natural && this.keymap[System.Array.index(((notenumber + 1) | 0), this.keymap)] === MidiSheetMusic.Accid.Natural) {

                            if (this.num_flats > 0) {
                                letter = whole_flats[System.Array.index(notescale, whole_flats)];
                            } else {
                                letter = whole_sharps[System.Array.index(notescale, whole_sharps)];
                            }
                        } else if (this.keymap[System.Array.index(((notenumber - 1) | 0), this.keymap)] === MidiSheetMusic.Accid.Natural) {
                            letter = whole_sharps[System.Array.index(notescale, whole_sharps)];
                        } else if (this.keymap[System.Array.index(((notenumber + 1) | 0), this.keymap)] === MidiSheetMusic.Accid.Natural) {
                            letter = whole_flats[System.Array.index(notescale, whole_flats)];
                        }
                    }
                }

                /* The above algorithm doesn't quite work for G-flat major.
                  Handle it here.
                */
                if (this.num_flats === MidiSheetMusic.KeySignature.Gflat && notescale === MidiSheetMusic.NoteScale.B) {
                    letter = MidiSheetMusic.WhiteNote.C;
                }
                if (this.num_flats === MidiSheetMusic.KeySignature.Gflat && notescale === MidiSheetMusic.NoteScale.Bflat) {
                    letter = MidiSheetMusic.WhiteNote.B;
                }

                if (this.num_flats > 0 && notescale === MidiSheetMusic.NoteScale.Aflat) {
                    octave = (octave + 1) | 0;
                }

                return new MidiSheetMusic.WhiteNote(letter, octave);
            },
            Equals: function (k) {
                if (k.num_sharps === this.num_sharps && k.num_flats === this.num_flats) {
                    return true;
                } else {
                    return false;
                }
            },
            Notescale: function () {
                var flatmajor = System.Array.init([
                    MidiSheetMusic.NoteScale.C, 
                    MidiSheetMusic.NoteScale.F, 
                    MidiSheetMusic.NoteScale.Bflat, 
                    MidiSheetMusic.NoteScale.Eflat, 
                    MidiSheetMusic.NoteScale.Aflat, 
                    MidiSheetMusic.NoteScale.Dflat, 
                    MidiSheetMusic.NoteScale.Gflat, 
                    MidiSheetMusic.NoteScale.B
                ], System.Int32);

                var sharpmajor = System.Array.init([
                    MidiSheetMusic.NoteScale.C, 
                    MidiSheetMusic.NoteScale.G, 
                    MidiSheetMusic.NoteScale.D, 
                    MidiSheetMusic.NoteScale.A, 
                    MidiSheetMusic.NoteScale.E, 
                    MidiSheetMusic.NoteScale.B, 
                    MidiSheetMusic.NoteScale.Fsharp, 
                    MidiSheetMusic.NoteScale.Csharp, 
                    MidiSheetMusic.NoteScale.Gsharp, 
                    MidiSheetMusic.NoteScale.Dsharp
                ], System.Int32);
                if (this.num_flats > 0) {
                    return flatmajor[System.Array.index(this.num_flats, flatmajor)];
                } else {
                    return sharpmajor[System.Array.index(this.num_sharps, sharpmajor)];
                }
            },
            toString: function () {
                return MidiSheetMusic.KeySignature.KeyToString(this.Notescale());
            }
        }
    });

    Bridge.define("MidiSheetMusic.LineCap", {
        $kind: "enum",
        statics: {
            fields: {
                Flat: 0
            }
        }
    });

    Bridge.define("MidiSheetMusic.LyricSymbol", {
        fields: {
            starttime: 0,
            text: null,
            x: 0
        },
        props: {
            StartTime: {
                get: function () {
                    return this.starttime;
                },
                set: function (value) {
                    this.starttime = value;
                }
            },
            Text: {
                get: function () {
                    return this.text;
                },
                set: function (value) {
                    this.text = value;
                }
            },
            X: {
                get: function () {
                    return this.x;
                },
                set: function (value) {
                    this.x = value;
                }
            },
            MinWidth: {
                get: function () {
                    return this.minWidth();
                }
            }
        },
        ctors: {
            ctor: function (starttime, text) {
                this.$initialize();
                this.starttime = starttime;
                this.text = text;
            }
        },
        methods: {
            minWidth: function () {
                var widthPerChar = MidiSheetMusic.SheetMusic.LetterFont.GetHeight() * 2.0 / 3.0;
                var width = this.text.length * widthPerChar;
                if (System.String.indexOf(this.text, "i") >= 0) {
                    width -= widthPerChar / 2.0;
                }
                if (System.String.indexOf(this.text, "j") >= 0) {
                    width -= widthPerChar / 2.0;
                }
                if (System.String.indexOf(this.text, "l") >= 0) {
                    width -= widthPerChar / 2.0;
                }
                return Bridge.Int.clip32(width);
            },
            toString: function () {
                return System.String.format("Lyric start={0} x={1} text={2}", Bridge.box(this.starttime, System.Int32), Bridge.box(this.x, System.Int32), this.text);
            }
        }
    });

    Bridge.define("MidiSheetMusic.MidiEvent", {
        inherits: function () { return [System.Collections.Generic.IComparer$1(MidiSheetMusic.MidiEvent)]; },
        fields: {
            DeltaTime: 0,
            StartTime: 0,
            HasEventflag: false,
            EventFlag: 0,
            Channel: 0,
            Notenumber: 0,
            Velocity: 0,
            Instrument: 0,
            KeyPressure: 0,
            ChanPressure: 0,
            ControlNum: 0,
            ControlValue: 0,
            PitchBend: 0,
            Numerator: 0,
            Denominator: 0,
            Tempo: 0,
            Metaevent: 0,
            Metalength: 0,
            Value: null
        },
        alias: ["compare", ["System$Collections$Generic$IComparer$1$MidiSheetMusic$MidiEvent$compare", "System$Collections$Generic$IComparer$1$compare"]],
        ctors: {
            ctor: function () {
                this.$initialize();
            }
        },
        methods: {
            Clone: function () {
                var mevent = new MidiSheetMusic.MidiEvent();
                mevent.DeltaTime = this.DeltaTime;
                mevent.StartTime = this.StartTime;
                mevent.HasEventflag = this.HasEventflag;
                mevent.EventFlag = this.EventFlag;
                mevent.Channel = this.Channel;
                mevent.Notenumber = this.Notenumber;
                mevent.Velocity = this.Velocity;
                mevent.Instrument = this.Instrument;
                mevent.KeyPressure = this.KeyPressure;
                mevent.ChanPressure = this.ChanPressure;
                mevent.ControlNum = this.ControlNum;
                mevent.ControlValue = this.ControlValue;
                mevent.PitchBend = this.PitchBend;
                mevent.Numerator = this.Numerator;
                mevent.Denominator = this.Denominator;
                mevent.Tempo = this.Tempo;
                mevent.Metaevent = this.Metaevent;
                mevent.Metalength = this.Metalength;
                mevent.Value = this.Value;
                return mevent;
            },
            compare: function (x, y) {
                if (x.StartTime === y.StartTime) {
                    if (x.EventFlag === y.EventFlag) {
                        return ((x.Notenumber - y.Notenumber) | 0);
                    } else {
                        return ((x.EventFlag - y.EventFlag) | 0);
                    }
                } else {
                    return ((x.StartTime - y.StartTime) | 0);
                }
            }
        }
    });

    Bridge.define("MidiSheetMusic.MidiFile", {
        statics: {
            fields: {
                EventNoteOff: 0,
                EventNoteOn: 0,
                EventKeyPressure: 0,
                EventControlChange: 0,
                EventProgramChange: 0,
                EventChannelPressure: 0,
                EventPitchBend: 0,
                SysexEvent1: 0,
                SysexEvent2: 0,
                MetaEvent: 0,
                MetaEventSequence: 0,
                MetaEventText: 0,
                MetaEventCopyright: 0,
                MetaEventSequenceName: 0,
                MetaEventInstrument: 0,
                MetaEventLyric: 0,
                MetaEventMarker: 0,
                MetaEventEndOfTrack: 0,
                MetaEventTempo: 0,
                MetaEventSMPTEOffset: 0,
                MetaEventTimeSignature: 0,
                MetaEventKeySignature: 0,
                Instruments: null
            },
            ctors: {
                init: function () {
                    this.EventNoteOff = 128;
                    this.EventNoteOn = 144;
                    this.EventKeyPressure = 160;
                    this.EventControlChange = 176;
                    this.EventProgramChange = 192;
                    this.EventChannelPressure = 208;
                    this.EventPitchBend = 224;
                    this.SysexEvent1 = 240;
                    this.SysexEvent2 = 247;
                    this.MetaEvent = 255;
                    this.MetaEventSequence = 0;
                    this.MetaEventText = 1;
                    this.MetaEventCopyright = 2;
                    this.MetaEventSequenceName = 3;
                    this.MetaEventInstrument = 4;
                    this.MetaEventLyric = 5;
                    this.MetaEventMarker = 6;
                    this.MetaEventEndOfTrack = 47;
                    this.MetaEventTempo = 81;
                    this.MetaEventSMPTEOffset = 84;
                    this.MetaEventTimeSignature = 88;
                    this.MetaEventKeySignature = 89;
                    this.Instruments = System.Array.init([
                        "Acoustic Grand Piano", 
                        "Bright Acoustic Piano", 
                        "Electric Grand Piano", 
                        "Honky-tonk Piano", 
                        "Electric Piano 1", 
                        "Electric Piano 2", 
                        "Harpsichord", 
                        "Clavi", 
                        "Celesta", 
                        "Glockenspiel", 
                        "Music Box", 
                        "Vibraphone", 
                        "Marimba", 
                        "Xylophone", 
                        "Tubular Bells", 
                        "Dulcimer", 
                        "Drawbar Organ", 
                        "Percussive Organ", 
                        "Rock Organ", 
                        "Church Organ", 
                        "Reed Organ", 
                        "Accordion", 
                        "Harmonica", 
                        "Tango Accordion", 
                        "Acoustic Guitar (nylon)", 
                        "Acoustic Guitar (steel)", 
                        "Electric Guitar (jazz)", 
                        "Electric Guitar (clean)", 
                        "Electric Guitar (muted)", 
                        "Overdriven Guitar", 
                        "Distortion Guitar", 
                        "Guitar harmonics", 
                        "Acoustic Bass", 
                        "Electric Bass (finger)", 
                        "Electric Bass (pick)", 
                        "Fretless Bass", 
                        "Slap Bass 1", 
                        "Slap Bass 2", 
                        "Synth Bass 1", 
                        "Synth Bass 2", 
                        "Violin", 
                        "Viola", 
                        "Cello", 
                        "Contrabass", 
                        "Tremolo Strings", 
                        "Pizzicato Strings", 
                        "Orchestral Harp", 
                        "Timpani", 
                        "String Ensemble 1", 
                        "String Ensemble 2", 
                        "SynthStrings 1", 
                        "SynthStrings 2", 
                        "Choir Aahs", 
                        "Voice Oohs", 
                        "Synth Voice", 
                        "Orchestra Hit", 
                        "Trumpet", 
                        "Trombone", 
                        "Tuba", 
                        "Muted Trumpet", 
                        "French Horn", 
                        "Brass Section", 
                        "SynthBrass 1", 
                        "SynthBrass 2", 
                        "Soprano Sax", 
                        "Alto Sax", 
                        "Tenor Sax", 
                        "Baritone Sax", 
                        "Oboe", 
                        "English Horn", 
                        "Bassoon", 
                        "Clarinet", 
                        "Piccolo", 
                        "Flute", 
                        "Recorder", 
                        "Pan Flute", 
                        "Blown Bottle", 
                        "Shakuhachi", 
                        "Whistle", 
                        "Ocarina", 
                        "Lead 1 (square)", 
                        "Lead 2 (sawtooth)", 
                        "Lead 3 (calliope)", 
                        "Lead 4 (chiff)", 
                        "Lead 5 (charang)", 
                        "Lead 6 (voice)", 
                        "Lead 7 (fifths)", 
                        "Lead 8 (bass + lead)", 
                        "Pad 1 (new age)", 
                        "Pad 2 (warm)", 
                        "Pad 3 (polysynth)", 
                        "Pad 4 (choir)", 
                        "Pad 5 (bowed)", 
                        "Pad 6 (metallic)", 
                        "Pad 7 (halo)", 
                        "Pad 8 (sweep)", 
                        "FX 1 (rain)", 
                        "FX 2 (soundtrack)", 
                        "FX 3 (crystal)", 
                        "FX 4 (atmosphere)", 
                        "FX 5 (brightness)", 
                        "FX 6 (goblins)", 
                        "FX 7 (echoes)", 
                        "FX 8 (sci-fi)", 
                        "Sitar", 
                        "Banjo", 
                        "Shamisen", 
                        "Koto", 
                        "Kalimba", 
                        "Bag pipe", 
                        "Fiddle", 
                        "Shanai", 
                        "Tinkle Bell", 
                        "Agogo", 
                        "Steel Drums", 
                        "Woodblock", 
                        "Taiko Drum", 
                        "Melodic Tom", 
                        "Synth Drum", 
                        "Reverse Cymbal", 
                        "Guitar Fret Noise", 
                        "Breath Noise", 
                        "Seashore", 
                        "Bird Tweet", 
                        "Telephone Ring", 
                        "Helicopter", 
                        "Applause", 
                        "Gunshot", 
                        "Percussion"
                    ], System.String);
                }
            },
            methods: {
                HasMultipleChannels: function (track) {
                    var $t;
                    var channel = track.Notes.getItem(0).Channel;
                    $t = Bridge.getEnumerator(track.Notes);
                    try {
                        while ($t.moveNext()) {
                            var note = $t.Current;
                            if (note.Channel !== channel) {
                                return true;
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }return false;
                },
                VarlenToBytes: function (num, buf, offset) {
                    var b1 = ((num >> 21) & 127) & 255;
                    var b2 = ((num >> 14) & 127) & 255;
                    var b3 = ((num >> 7) & 127) & 255;
                    var b4 = (num & 127) & 255;

                    if (b1 > 0) {
                        buf[System.Array.index(offset, buf)] = (b1 | 128) & 255;
                        buf[System.Array.index(((offset + 1) | 0), buf)] = (b2 | 128) & 255;
                        buf[System.Array.index(((offset + 2) | 0), buf)] = (b3 | 128) & 255;
                        buf[System.Array.index(((offset + 3) | 0), buf)] = b4;
                        return 4;
                    } else if (b2 > 0) {
                        buf[System.Array.index(offset, buf)] = (b2 | 128) & 255;
                        buf[System.Array.index(((offset + 1) | 0), buf)] = (b3 | 128) & 255;
                        buf[System.Array.index(((offset + 2) | 0), buf)] = b4;
                        return 3;
                    } else if (b3 > 0) {
                        buf[System.Array.index(offset, buf)] = (b3 | 128) & 255;
                        buf[System.Array.index(((offset + 1) | 0), buf)] = b4;
                        return 2;
                    } else {
                        buf[System.Array.index(offset, buf)] = b4;
                        return 1;
                    }
                },
                IntToBytes: function (value, data, offset) {
                    data[System.Array.index(offset, data)] = ((value >> 24) & 255) & 255;
                    data[System.Array.index(((offset + 1) | 0), data)] = ((value >> 16) & 255) & 255;
                    data[System.Array.index(((offset + 2) | 0), data)] = ((value >> 8) & 255) & 255;
                    data[System.Array.index(((offset + 3) | 0), data)] = (value & 255) & 255;
                },
                GetTrackLength: function (events) {
                    var $t;
                    var len = 0;
                    var buf = System.Array.init(1024, 0, System.Byte);
                    $t = Bridge.getEnumerator(events);
                    try {
                        while ($t.moveNext()) {
                            var mevent = $t.Current;
                            len = (len + (MidiSheetMusic.MidiFile.VarlenToBytes(mevent.DeltaTime, buf, 0))) | 0;
                            len = (len + 1) | 0; /* for eventflag */
                            switch (mevent.EventFlag) {
                                case MidiSheetMusic.MidiFile.EventNoteOn: 
                                    len = (len + 2) | 0;
                                    break;
                                case MidiSheetMusic.MidiFile.EventNoteOff: 
                                    len = (len + 2) | 0;
                                    break;
                                case MidiSheetMusic.MidiFile.EventKeyPressure: 
                                    len = (len + 2) | 0;
                                    break;
                                case MidiSheetMusic.MidiFile.EventControlChange: 
                                    len = (len + 2) | 0;
                                    break;
                                case MidiSheetMusic.MidiFile.EventProgramChange: 
                                    len = (len + 1) | 0;
                                    break;
                                case MidiSheetMusic.MidiFile.EventChannelPressure: 
                                    len = (len + 1) | 0;
                                    break;
                                case MidiSheetMusic.MidiFile.EventPitchBend: 
                                    len = (len + 2) | 0;
                                    break;
                                case MidiSheetMusic.MidiFile.SysexEvent1: 
                                case MidiSheetMusic.MidiFile.SysexEvent2: 
                                    len = (len + (MidiSheetMusic.MidiFile.VarlenToBytes(mevent.Metalength, buf, 0))) | 0;
                                    len = (len + mevent.Metalength) | 0;
                                    break;
                                case MidiSheetMusic.MidiFile.MetaEvent: 
                                    len = (len + 1) | 0;
                                    len = (len + (MidiSheetMusic.MidiFile.VarlenToBytes(mevent.Metalength, buf, 0))) | 0;
                                    len = (len + mevent.Metalength) | 0;
                                    break;
                                default: 
                                    break;
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }return len;
                },
                WriteEvents: function (file, events, trackmode, quarter) {
                    var $t, $t1;
                    try {
                        var buf = System.Array.init(65536, 0, System.Byte);

                        /* Write the MThd, len = 6, track mode, number tracks, quarter note */
                        file.Write(System.Text.Encoding.ASCII.GetBytes$2("MThd"), 0, 4);
                        MidiSheetMusic.MidiFile.IntToBytes(6, buf, 0);
                        file.Write(buf, 0, 4);
                        buf[System.Array.index(0, buf)] = (trackmode >> 8) & 255;
                        buf[System.Array.index(1, buf)] = (trackmode & 255) & 255;
                        file.Write(buf, 0, 2);
                        buf[System.Array.index(0, buf)] = 0;
                        buf[System.Array.index(1, buf)] = (events.length) & 255;
                        file.Write(buf, 0, 2);
                        buf[System.Array.index(0, buf)] = (quarter >> 8) & 255;
                        buf[System.Array.index(1, buf)] = (quarter & 255) & 255;
                        file.Write(buf, 0, 2);

                        $t = Bridge.getEnumerator(events);
                        try {
                            while ($t.moveNext()) {
                                var list = $t.Current;
                                /* Write the MTrk header and track length */
                                file.Write(System.Text.Encoding.ASCII.GetBytes$2("MTrk"), 0, 4);
                                var len = MidiSheetMusic.MidiFile.GetTrackLength(list);
                                MidiSheetMusic.MidiFile.IntToBytes(len, buf, 0);
                                file.Write(buf, 0, 4);

                                $t1 = Bridge.getEnumerator(list);
                                try {
                                    while ($t1.moveNext()) {
                                        var mevent = $t1.Current;
                                        var varlen = MidiSheetMusic.MidiFile.VarlenToBytes(mevent.DeltaTime, buf, 0);
                                        file.Write(buf, 0, varlen);

                                        if (mevent.EventFlag === MidiSheetMusic.MidiFile.SysexEvent1 || mevent.EventFlag === MidiSheetMusic.MidiFile.SysexEvent2 || mevent.EventFlag === MidiSheetMusic.MidiFile.MetaEvent) {
                                            buf[System.Array.index(0, buf)] = mevent.EventFlag;
                                        } else {
                                            buf[System.Array.index(0, buf)] = (((mevent.EventFlag + mevent.Channel) | 0)) & 255;
                                        }
                                        file.Write(buf, 0, 1);

                                        if (mevent.EventFlag === MidiSheetMusic.MidiFile.EventNoteOn) {
                                            buf[System.Array.index(0, buf)] = mevent.Notenumber;
                                            buf[System.Array.index(1, buf)] = mevent.Velocity;
                                            file.Write(buf, 0, 2);
                                        } else if (mevent.EventFlag === MidiSheetMusic.MidiFile.EventNoteOff) {
                                            buf[System.Array.index(0, buf)] = mevent.Notenumber;
                                            buf[System.Array.index(1, buf)] = mevent.Velocity;
                                            file.Write(buf, 0, 2);
                                        } else if (mevent.EventFlag === MidiSheetMusic.MidiFile.EventKeyPressure) {
                                            buf[System.Array.index(0, buf)] = mevent.Notenumber;
                                            buf[System.Array.index(1, buf)] = mevent.KeyPressure;
                                            file.Write(buf, 0, 2);
                                        } else if (mevent.EventFlag === MidiSheetMusic.MidiFile.EventControlChange) {
                                            buf[System.Array.index(0, buf)] = mevent.ControlNum;
                                            buf[System.Array.index(1, buf)] = mevent.ControlValue;
                                            file.Write(buf, 0, 2);
                                        } else if (mevent.EventFlag === MidiSheetMusic.MidiFile.EventProgramChange) {
                                            buf[System.Array.index(0, buf)] = mevent.Instrument;
                                            file.Write(buf, 0, 1);
                                        } else if (mevent.EventFlag === MidiSheetMusic.MidiFile.EventChannelPressure) {
                                            buf[System.Array.index(0, buf)] = mevent.ChanPressure;
                                            file.Write(buf, 0, 1);
                                        } else if (mevent.EventFlag === MidiSheetMusic.MidiFile.EventPitchBend) {
                                            buf[System.Array.index(0, buf)] = (mevent.PitchBend >> 8) & 255;
                                            buf[System.Array.index(1, buf)] = (mevent.PitchBend & 255) & 255;
                                            file.Write(buf, 0, 2);
                                        } else if (mevent.EventFlag === MidiSheetMusic.MidiFile.SysexEvent1) {
                                            var offset = MidiSheetMusic.MidiFile.VarlenToBytes(mevent.Metalength, buf, 0);
                                            System.Array.copy(mevent.Value, 0, buf, offset, mevent.Value.length);
                                            file.Write(buf, 0, ((offset + mevent.Value.length) | 0));
                                        } else if (mevent.EventFlag === MidiSheetMusic.MidiFile.SysexEvent2) {
                                            var offset1 = MidiSheetMusic.MidiFile.VarlenToBytes(mevent.Metalength, buf, 0);
                                            System.Array.copy(mevent.Value, 0, buf, offset1, mevent.Value.length);
                                            file.Write(buf, 0, ((offset1 + mevent.Value.length) | 0));
                                        } else if (mevent.EventFlag === MidiSheetMusic.MidiFile.MetaEvent && mevent.Metaevent === MidiSheetMusic.MidiFile.MetaEventTempo) {
                                            buf[System.Array.index(0, buf)] = mevent.Metaevent;
                                            buf[System.Array.index(1, buf)] = 3;
                                            buf[System.Array.index(2, buf)] = ((mevent.Tempo >> 16) & 255) & 255;
                                            buf[System.Array.index(3, buf)] = ((mevent.Tempo >> 8) & 255) & 255;
                                            buf[System.Array.index(4, buf)] = (mevent.Tempo & 255) & 255;
                                            file.Write(buf, 0, 5);
                                        } else if (mevent.EventFlag === MidiSheetMusic.MidiFile.MetaEvent) {
                                            buf[System.Array.index(0, buf)] = mevent.Metaevent;
                                            var offset2 = (MidiSheetMusic.MidiFile.VarlenToBytes(mevent.Metalength, buf, 1) + 1) | 0;
                                            System.Array.copy(mevent.Value, 0, buf, offset2, mevent.Value.length);
                                            file.Write(buf, 0, ((offset2 + mevent.Value.length) | 0));
                                        }
                                    }
                                } finally {
                                    if (Bridge.is($t1, System.IDisposable)) {
                                        $t1.System$IDisposable$dispose();
                                    }
                                }
                            }
                        } finally {
                            if (Bridge.is($t, System.IDisposable)) {
                                $t.System$IDisposable$dispose();
                            }
                        }file.Close();
                        return true;
                    }
                    catch ($e1) {
                        $e1 = System.Exception.create($e1);
                        var e;
                        if (Bridge.is($e1, MidiSheetMusic.IOException)) {
                            e = $e1;
                            return false;
                        } else {
                            throw $e1;
                        }
                    }
                },
                CloneMidiEvents: function (origlist) {
                    var $t;
                    var newlist = System.Array.init(origlist.length, null, System.Collections.Generic.List$1(MidiSheetMusic.MidiEvent));
                    for (var tracknum = 0; tracknum < origlist.length; tracknum = (tracknum + 1) | 0) {
                        var origevents = origlist[System.Array.index(tracknum, origlist)];
                        var newevents = new (System.Collections.Generic.List$1(MidiSheetMusic.MidiEvent)).$ctor2(origevents.Count);
                        newlist[System.Array.index(tracknum, newlist)] = newevents;
                        $t = Bridge.getEnumerator(origevents);
                        try {
                            while ($t.moveNext()) {
                                var mevent = $t.Current;
                                newevents.add(mevent.Clone());
                            }
                        } finally {
                            if (Bridge.is($t, System.IDisposable)) {
                                $t.System$IDisposable$dispose();
                            }
                        }}
                    return newlist;
                },
                CreateTempoEvent: function (tempo) {
                    var mevent = new MidiSheetMusic.MidiEvent();
                    mevent.DeltaTime = 0;
                    mevent.StartTime = 0;
                    mevent.HasEventflag = true;
                    mevent.EventFlag = MidiSheetMusic.MidiFile.MetaEvent;
                    mevent.Metaevent = MidiSheetMusic.MidiFile.MetaEventTempo;
                    mevent.Metalength = 3;
                    mevent.Tempo = tempo;
                    return mevent;
                },
                UpdateControlChange: function (newevents, changeEvent) {
                    var $t;
                    $t = Bridge.getEnumerator(newevents);
                    try {
                        while ($t.moveNext()) {
                            var mevent = $t.Current;
                            if ((mevent.EventFlag === changeEvent.EventFlag) && (mevent.Channel === changeEvent.Channel) && (mevent.ControlNum === changeEvent.ControlNum)) {

                                mevent.ControlValue = changeEvent.ControlValue;
                                return;
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }newevents.add(changeEvent);
                },
                StartAtPauseTime: function (list, pauseTime) {
                    var $t;
                    var newlist = System.Array.init(list.length, null, System.Collections.Generic.List$1(MidiSheetMusic.MidiEvent));
                    for (var tracknum = 0; tracknum < list.length; tracknum = (tracknum + 1) | 0) {
                        var events = list[System.Array.index(tracknum, list)];
                        var newevents = new (System.Collections.Generic.List$1(MidiSheetMusic.MidiEvent)).$ctor2(events.Count);
                        newlist[System.Array.index(tracknum, newlist)] = newevents;

                        var foundEventAfterPause = false;
                        $t = Bridge.getEnumerator(events);
                        try {
                            while ($t.moveNext()) {
                                var mevent = $t.Current;

                                if (mevent.StartTime < pauseTime) {
                                    if (mevent.EventFlag === MidiSheetMusic.MidiFile.EventNoteOn || mevent.EventFlag === MidiSheetMusic.MidiFile.EventNoteOff) {

                                        /* Skip NoteOn/NoteOff event */
                                    } else if (mevent.EventFlag === MidiSheetMusic.MidiFile.EventControlChange) {
                                        mevent.DeltaTime = 0;
                                        MidiSheetMusic.MidiFile.UpdateControlChange(newevents, mevent);
                                    } else {
                                        mevent.DeltaTime = 0;
                                        newevents.add(mevent);
                                    }
                                } else if (!foundEventAfterPause) {
                                    mevent.DeltaTime = (((mevent.StartTime - pauseTime) | 0));
                                    newevents.add(mevent);
                                    foundEventAfterPause = true;
                                } else {
                                    newevents.add(mevent);
                                }
                            }
                        } finally {
                            if (Bridge.is($t, System.IDisposable)) {
                                $t.System$IDisposable$dispose();
                            }
                        }}
                    return newlist;
                },
                ShiftTime: function (tracks, amount) {
                    var $t, $t1;
                    $t = Bridge.getEnumerator(tracks);
                    try {
                        while ($t.moveNext()) {
                            var track = $t.Current;
                            $t1 = Bridge.getEnumerator(track.Notes);
                            try {
                                while ($t1.moveNext()) {
                                    var note = $t1.Current;
                                    note.StartTime = (note.StartTime + amount) | 0;
                                }
                            } finally {
                                if (Bridge.is($t1, System.IDisposable)) {
                                    $t1.System$IDisposable$dispose();
                                }
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }},
                Transpose: function (tracks, amount) {
                    var $t, $t1;
                    $t = Bridge.getEnumerator(tracks);
                    try {
                        while ($t.moveNext()) {
                            var track = $t.Current;
                            $t1 = Bridge.getEnumerator(track.Notes);
                            try {
                                while ($t1.moveNext()) {
                                    var note = $t1.Current;
                                    note.Number = (note.Number + amount) | 0;
                                    if (note.Number < 0) {
                                        note.Number = 0;
                                    }
                                }
                            } finally {
                                if (Bridge.is($t1, System.IDisposable)) {
                                    $t1.System$IDisposable$dispose();
                                }
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }},
                FindHighLowNotes: function (notes, measurelen, startindex, starttime, endtime, high, low) {

                    var i = startindex;
                    if (((starttime + measurelen) | 0) < endtime) {
                        endtime = (starttime + measurelen) | 0;
                    }

                    while (i < notes.Count && notes.getItem(i).StartTime < endtime) {
                        if (notes.getItem(i).EndTime < starttime) {
                            i = (i + 1) | 0;
                            continue;
                        }
                        if (((notes.getItem(i).StartTime + measurelen) | 0) < starttime) {
                            i = (i + 1) | 0;
                            continue;
                        }
                        if (high.v < notes.getItem(i).Number) {
                            high.v = notes.getItem(i).Number;
                        }
                        if (low.v > notes.getItem(i).Number) {
                            low.v = notes.getItem(i).Number;
                        }
                        i = (i + 1) | 0;
                    }
                },
                FindExactHighLowNotes: function (notes, startindex, starttime, high, low) {

                    var i = startindex;

                    while (notes.getItem(i).StartTime < starttime) {
                        i = (i + 1) | 0;
                    }

                    while (i < notes.Count && notes.getItem(i).StartTime === starttime) {
                        if (high.v < notes.getItem(i).Number) {
                            high.v = notes.getItem(i).Number;
                        }
                        if (low.v > notes.getItem(i).Number) {
                            low.v = notes.getItem(i).Number;
                        }
                        i = (i + 1) | 0;
                    }
                },
                SplitTrack: function (track, measurelen) {
                    var $t;
                    var notes = track.Notes;
                    var count = notes.Count;

                    var top = new MidiSheetMusic.MidiTrack.$ctor1(1);
                    var bottom = new MidiSheetMusic.MidiTrack.$ctor1(2);
                    var result = new (System.Collections.Generic.List$1(MidiSheetMusic.MidiTrack)).$ctor2(2);
                    result.add(top);
                    result.add(bottom);

                    if (count === 0) {
                        return result;
                    }

                    var prevhigh = 76; /* E5, top of treble staff */
                    var prevlow = 45; /* A3, bottom of bass staff */
                    var startindex = 0;

                    $t = Bridge.getEnumerator(notes);
                    try {
                        while ($t.moveNext()) {
                            var note = $t.Current;
                            var high = { }, low = { }, highExact = { }, lowExact = { };

                            var number = note.Number;
                            high.v = (low.v = (highExact.v = (lowExact.v = number)));

                            while (notes.getItem(startindex).EndTime < note.StartTime) {
                                startindex = (startindex + 1) | 0;
                            }

                            /* I've tried several algorithms for splitting a track in two,
                              and the one below seems to work the best:
                              - If this note is more than an octave from the high/low notes
                                (that start exactly at this start time), choose the closest one.
                              - If this note is more than an octave from the high/low notes
                                (in this note's time duration), choose the closest one.
                              - If the high and low notes (that start exactly at this starttime)
                                are more than an octave apart, choose the closest note.
                              - If the high and low notes (that overlap this starttime)
                                are more than an octave apart, choose the closest note.
                              - Else, look at the previous high/low notes that were more than an 
                                octave apart.  Choose the closeset note.
                            */
                            MidiSheetMusic.MidiFile.FindHighLowNotes(notes, measurelen, startindex, note.StartTime, note.EndTime, high, low);
                            MidiSheetMusic.MidiFile.FindExactHighLowNotes(notes, startindex, note.StartTime, highExact, lowExact);

                            if (((highExact.v - number) | 0) > 12 || ((number - lowExact.v) | 0) > 12) {
                                if (((highExact.v - number) | 0) <= ((number - lowExact.v) | 0)) {
                                    top.AddNote(note);
                                } else {
                                    bottom.AddNote(note);
                                }
                            } else if (((high.v - number) | 0) > 12 || ((number - low.v) | 0) > 12) {
                                if (((high.v - number) | 0) <= ((number - low.v) | 0)) {
                                    top.AddNote(note);
                                } else {
                                    bottom.AddNote(note);
                                }
                            } else if (((highExact.v - lowExact.v) | 0) > 12) {
                                if (((highExact.v - number) | 0) <= ((number - lowExact.v) | 0)) {
                                    top.AddNote(note);
                                } else {
                                    bottom.AddNote(note);
                                }
                            } else if (((high.v - low.v) | 0) > 12) {
                                if (((high.v - number) | 0) <= ((number - low.v) | 0)) {
                                    top.AddNote(note);
                                } else {
                                    bottom.AddNote(note);
                                }
                            } else {
                                if (((prevhigh - number) | 0) <= ((number - prevlow) | 0)) {
                                    top.AddNote(note);
                                } else {
                                    bottom.AddNote(note);
                                }
                            }

                            /* The prevhigh/prevlow are set to the last high/low
                              that are more than an octave apart.
                            */
                            if (((high.v - low.v) | 0) > 12) {
                                prevhigh = high.v;
                                prevlow = low.v;
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }
                    top.Notes.sort$1(track.Notes.getItem(0));
                    bottom.Notes.sort$1(track.Notes.getItem(0));

                    return result;
                },
                CombineToSingleTrack: function (tracks) {
                    var $t;
                    /* Add all notes into one track */
                    var result = new MidiSheetMusic.MidiTrack.$ctor1(1);

                    if (tracks.Count === 0) {
                        return result;
                    } else if (tracks.Count === 1) {
                        var track = tracks.getItem(0);
                        $t = Bridge.getEnumerator(track.Notes);
                        try {
                            while ($t.moveNext()) {
                                var note = $t.Current;
                                result.AddNote(note);
                            }
                        } finally {
                            if (Bridge.is($t, System.IDisposable)) {
                                $t.System$IDisposable$dispose();
                            }
                        }return result;
                    }

                    var noteindex = System.Array.init(64, 0, System.Int32);
                    var notecount = System.Array.init(64, 0, System.Int32);

                    for (var tracknum = 0; tracknum < tracks.Count; tracknum = (tracknum + 1) | 0) {
                        noteindex[System.Array.index(tracknum, noteindex)] = 0;
                        notecount[System.Array.index(tracknum, notecount)] = tracks.getItem(tracknum).Notes.Count;
                    }
                    var prevnote = null;
                    while (true) {
                        var lowestnote = null;
                        var lowestTrack = -1;
                        for (var tracknum1 = 0; tracknum1 < tracks.Count; tracknum1 = (tracknum1 + 1) | 0) {
                            var track1 = tracks.getItem(tracknum1);
                            if (noteindex[System.Array.index(tracknum1, noteindex)] >= notecount[System.Array.index(tracknum1, notecount)]) {
                                continue;
                            }
                            var note1 = track1.Notes.getItem(noteindex[System.Array.index(tracknum1, noteindex)]);
                            if (lowestnote == null) {
                                lowestnote = note1;
                                lowestTrack = tracknum1;
                            } else if (note1.StartTime < lowestnote.StartTime) {
                                lowestnote = note1;
                                lowestTrack = tracknum1;
                            } else if (note1.StartTime === lowestnote.StartTime && note1.Number < lowestnote.Number) {
                                lowestnote = note1;
                                lowestTrack = tracknum1;
                            }
                        }
                        if (lowestnote == null) {
                            /* We've finished the merge */
                            break;
                        }
                        noteindex[System.Array.index(lowestTrack, noteindex)] = (noteindex[System.Array.index(lowestTrack, noteindex)] + 1) | 0;
                        if ((prevnote != null) && (prevnote.StartTime === lowestnote.StartTime) && (prevnote.Number === lowestnote.Number)) {

                            /* Don't add duplicate notes, with the same start time and number */
                            if (lowestnote.Duration > prevnote.Duration) {
                                prevnote.Duration = lowestnote.Duration;
                            }
                        } else {
                            result.AddNote(lowestnote);
                            prevnote = lowestnote;
                        }
                    }

                    return result;
                },
                CombineToTwoTracks: function (tracks, measurelen) {
                    var $t;
                    var single = MidiSheetMusic.MidiFile.CombineToSingleTrack(tracks);
                    var result = MidiSheetMusic.MidiFile.SplitTrack(single, measurelen);

                    var lyrics = new (System.Collections.Generic.List$1(MidiSheetMusic.MidiEvent)).ctor();
                    $t = Bridge.getEnumerator(tracks);
                    try {
                        while ($t.moveNext()) {
                            var track = $t.Current;
                            if (track.Lyrics != null) {
                                lyrics.addRange(track.Lyrics);
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }if (lyrics.Count > 0) {
                        lyrics.sort$1(lyrics.getItem(0));
                        result.getItem(0).Lyrics = lyrics;
                    }

                    return result;
                },
                CheckStartTimes: function (tracks) {
                    var $t, $t1;
                    $t = Bridge.getEnumerator(tracks);
                    try {
                        while ($t.moveNext()) {
                            var track = $t.Current;
                            var prevtime = -1;
                            $t1 = Bridge.getEnumerator(track.Notes);
                            try {
                                while ($t1.moveNext()) {
                                    var note = $t1.Current;
                                    if (note.StartTime < prevtime) {
                                        throw new System.ArgumentException("start times not in increasing order");
                                    }
                                    prevtime = note.StartTime;
                                }
                            } finally {
                                if (Bridge.is($t1, System.IDisposable)) {
                                    $t1.System$IDisposable$dispose();
                                }
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }},
                RoundStartTimes: function (tracks, millisec, time) {
                    var $t, $t1, $t2, $t3;
                    /* Get all the starttimes in all tracks, in sorted order */
                    var starttimes = new (System.Collections.Generic.List$1(System.Int32)).ctor();
                    $t = Bridge.getEnumerator(tracks);
                    try {
                        while ($t.moveNext()) {
                            var track = $t.Current;
                            $t1 = Bridge.getEnumerator(track.Notes);
                            try {
                                while ($t1.moveNext()) {
                                    var note = $t1.Current;
                                    starttimes.add(note.StartTime);
                                }
                            } finally {
                                if (Bridge.is($t1, System.IDisposable)) {
                                    $t1.System$IDisposable$dispose();
                                }
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }starttimes.sort();

                    /* Notes within "millisec" milliseconds apart will be combined. */
                    var interval = (Bridge.Int.div(Bridge.Int.mul(Bridge.Int.mul(time.Quarter, millisec), 1000), time.Tempo)) | 0;

                    /* If two starttimes are within interval millisec, make them the same */
                    for (var i = 0; i < ((starttimes.Count - 1) | 0); i = (i + 1) | 0) {
                        if (((starttimes.getItem(((i + 1) | 0)) - starttimes.getItem(i)) | 0) <= interval) {
                            starttimes.setItem(((i + 1) | 0), starttimes.getItem(i));
                        }
                    }

                    MidiSheetMusic.MidiFile.CheckStartTimes(tracks);

                    /* Adjust the note starttimes, so that it matches one of the starttimes values */
                    $t2 = Bridge.getEnumerator(tracks);
                    try {
                        while ($t2.moveNext()) {
                            var track1 = $t2.Current;
                            var i1 = 0;

                            $t3 = Bridge.getEnumerator(track1.Notes);
                            try {
                                while ($t3.moveNext()) {
                                    var note1 = $t3.Current;
                                    while (i1 < starttimes.Count && ((note1.StartTime - interval) | 0) > starttimes.getItem(i1)) {
                                        i1 = (i1 + 1) | 0;
                                    }

                                    if (note1.StartTime > starttimes.getItem(i1) && ((note1.StartTime - starttimes.getItem(i1)) | 0) <= interval) {

                                        note1.StartTime = starttimes.getItem(i1);
                                    }
                                }
                            } finally {
                                if (Bridge.is($t3, System.IDisposable)) {
                                    $t3.System$IDisposable$dispose();
                                }
                            }track1.Notes.sort$1(track1.Notes.getItem(0));
                        }
                    } finally {
                        if (Bridge.is($t2, System.IDisposable)) {
                            $t2.System$IDisposable$dispose();
                        }
                    }},
                RoundDurations: function (tracks, quarternote) {
                    var $t;

                    $t = Bridge.getEnumerator(tracks);
                    try {
                        while ($t.moveNext()) {
                            var track = $t.Current;
                            var prevNote = null;
                            for (var i = 0; i < ((track.Notes.Count - 1) | 0); i = (i + 1) | 0) {
                                var note1 = track.Notes.getItem(i);
                                if (prevNote == null) {
                                    prevNote = note1;
                                }

                                /* Get the next note that has a different start time */
                                var note2 = note1;
                                for (var j = (i + 1) | 0; j < track.Notes.Count; j = (j + 1) | 0) {
                                    note2 = track.Notes.getItem(j);
                                    if (note1.StartTime < note2.StartTime) {
                                        break;
                                    }
                                }
                                var maxduration = (note2.StartTime - note1.StartTime) | 0;

                                var dur = 0;
                                if (quarternote <= maxduration) {
                                    dur = quarternote;
                                } else {
                                    if (((Bridge.Int.div(quarternote, 2)) | 0) <= maxduration) {
                                        dur = (Bridge.Int.div(quarternote, 2)) | 0;
                                    } else {
                                        if (((Bridge.Int.div(quarternote, 3)) | 0) <= maxduration) {
                                            dur = (Bridge.Int.div(quarternote, 3)) | 0;
                                        } else {
                                            if (((Bridge.Int.div(quarternote, 4)) | 0) <= maxduration) {
                                                dur = (Bridge.Int.div(quarternote, 4)) | 0;
                                            }
                                        }
                                    }
                                }


                                if (dur < note1.Duration) {
                                    dur = note1.Duration;
                                }

                                /* Special case: If the previous note's duration
                                  matches this note's duration, we can make a notepair.
                                  So don't expand the duration in that case.
                                */
                                if ((((prevNote.StartTime + prevNote.Duration) | 0) === note1.StartTime) && (prevNote.Duration === note1.Duration)) {

                                    dur = note1.Duration;
                                }
                                note1.Duration = dur;
                                if (track.Notes.getItem(((i + 1) | 0)).StartTime !== note1.StartTime) {
                                    prevNote = note1;
                                }
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }},
                SplitChannels: function (origtrack, events) {
                    var $t, $t1, $t2, $t3, $t4;

                    /* Find the instrument used for each channel */
                    var channelInstruments = System.Array.init(16, 0, System.Int32);
                    $t = Bridge.getEnumerator(events);
                    try {
                        while ($t.moveNext()) {
                            var mevent = $t.Current;
                            if (mevent.EventFlag === MidiSheetMusic.MidiFile.EventProgramChange) {
                                channelInstruments[System.Array.index(mevent.Channel, channelInstruments)] = mevent.Instrument;
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }channelInstruments[System.Array.index(9, channelInstruments)] = 128; /* Channel 9 = Percussion */

                    var result = new (System.Collections.Generic.List$1(MidiSheetMusic.MidiTrack)).ctor();
                    $t1 = Bridge.getEnumerator(origtrack.Notes);
                    try {
                        while ($t1.moveNext()) {
                            var note = $t1.Current;
                            var foundchannel = false;
                            $t2 = Bridge.getEnumerator(result);
                            try {
                                while ($t2.moveNext()) {
                                    var track = $t2.Current;
                                    if (note.Channel === track.Notes.getItem(0).Channel) {
                                        foundchannel = true;
                                        track.AddNote(note);
                                    }
                                }
                            } finally {
                                if (Bridge.is($t2, System.IDisposable)) {
                                    $t2.System$IDisposable$dispose();
                                }
                            }if (!foundchannel) {
                                var track1 = new MidiSheetMusic.MidiTrack.$ctor1(((result.Count + 1) | 0));
                                track1.AddNote(note);
                                track1.Instrument = channelInstruments[System.Array.index(note.Channel, channelInstruments)];
                                result.add(track1);
                            }
                        }
                    } finally {
                        if (Bridge.is($t1, System.IDisposable)) {
                            $t1.System$IDisposable$dispose();
                        }
                    }if (origtrack.Lyrics != null) {
                        $t3 = Bridge.getEnumerator(origtrack.Lyrics);
                        try {
                            while ($t3.moveNext()) {
                                var lyricEvent = $t3.Current;
                                $t4 = Bridge.getEnumerator(result);
                                try {
                                    while ($t4.moveNext()) {
                                        var track2 = $t4.Current;
                                        if (lyricEvent.Channel === track2.Notes.getItem(0).Channel) {
                                            track2.AddLyric(lyricEvent);
                                        }
                                    }
                                } finally {
                                    if (Bridge.is($t4, System.IDisposable)) {
                                        $t4.System$IDisposable$dispose();
                                    }
                                }
                            }
                        } finally {
                            if (Bridge.is($t3, System.IDisposable)) {
                                $t3.System$IDisposable$dispose();
                            }
                        }}
                    return result;
                }
            }
        },
        fields: {
            filename: null,
            events: null,
            tracks: null,
            trackmode: 0,
            timesig: null,
            quarternote: 0,
            totalpulses: 0,
            trackPerChannel: false
        },
        props: {
            Tracks: {
                get: function () {
                    return this.tracks;
                }
            },
            Time: {
                get: function () {
                    return this.timesig;
                }
            },
            FileName: {
                get: function () {
                    return this.filename;
                }
            },
            TotalPulses: {
                get: function () {
                    return this.totalpulses;
                }
            }
        },
        ctors: {
            ctor: function (data, title) {
                this.$initialize();
                var file = new MidiSheetMusic.MidiFileReader(data);
                if (title == null) {
                    title = "";
                }
                this.parse(file, title);
            }
        },
        methods: {
            EventName: function (ev) {
                if (ev >= MidiSheetMusic.MidiFile.EventNoteOff && ev < 144) {
                    return "NoteOff";
                } else {
                    if (ev >= MidiSheetMusic.MidiFile.EventNoteOn && ev < 160) {
                        return "NoteOn";
                    } else {
                        if (ev >= MidiSheetMusic.MidiFile.EventKeyPressure && ev < 176) {
                            return "KeyPressure";
                        } else {
                            if (ev >= MidiSheetMusic.MidiFile.EventControlChange && ev < 192) {
                                return "ControlChange";
                            } else {
                                if (ev >= MidiSheetMusic.MidiFile.EventProgramChange && ev < 208) {
                                    return "ProgramChange";
                                } else {
                                    if (ev >= MidiSheetMusic.MidiFile.EventChannelPressure && ev < 224) {
                                        return "ChannelPressure";
                                    } else {
                                        if (ev >= MidiSheetMusic.MidiFile.EventPitchBend && ev < 240) {
                                            return "PitchBend";
                                        } else {
                                            if (ev === MidiSheetMusic.MidiFile.MetaEvent) {
                                                return "MetaEvent";
                                            } else {
                                                if (ev === MidiSheetMusic.MidiFile.SysexEvent1 || ev === MidiSheetMusic.MidiFile.SysexEvent2) {
                                                    return "SysexEvent";
                                                } else {
                                                    return "Unknown";
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            MetaName: function (ev) {
                if (ev === MidiSheetMusic.MidiFile.MetaEventSequence) {
                    return "MetaEventSequence";
                } else {
                    if (ev === MidiSheetMusic.MidiFile.MetaEventText) {
                        return "MetaEventText";
                    } else {
                        if (ev === MidiSheetMusic.MidiFile.MetaEventCopyright) {
                            return "MetaEventCopyright";
                        } else {
                            if (ev === MidiSheetMusic.MidiFile.MetaEventSequenceName) {
                                return "MetaEventSequenceName";
                            } else {
                                if (ev === MidiSheetMusic.MidiFile.MetaEventInstrument) {
                                    return "MetaEventInstrument";
                                } else {
                                    if (ev === MidiSheetMusic.MidiFile.MetaEventLyric) {
                                        return "MetaEventLyric";
                                    } else {
                                        if (ev === MidiSheetMusic.MidiFile.MetaEventMarker) {
                                            return "MetaEventMarker";
                                        } else {
                                            if (ev === MidiSheetMusic.MidiFile.MetaEventEndOfTrack) {
                                                return "MetaEventEndOfTrack";
                                            } else {
                                                if (ev === MidiSheetMusic.MidiFile.MetaEventTempo) {
                                                    return "MetaEventTempo";
                                                } else {
                                                    if (ev === MidiSheetMusic.MidiFile.MetaEventSMPTEOffset) {
                                                        return "MetaEventSMPTEOffset";
                                                    } else {
                                                        if (ev === MidiSheetMusic.MidiFile.MetaEventTimeSignature) {
                                                            return "MetaEventTimeSignature";
                                                        } else {
                                                            if (ev === MidiSheetMusic.MidiFile.MetaEventKeySignature) {
                                                                return "MetaEventKeySignature";
                                                            } else {
                                                                return "Unknown";
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            parse: function (file, filename) {
                var $t, $t1, $t2;
                var id;
                var len;

                this.filename = filename;
                this.tracks = new (System.Collections.Generic.List$1(MidiSheetMusic.MidiTrack)).ctor();
                this.trackPerChannel = false;

                id = file.ReadAscii(4);
                if (!Bridge.referenceEquals(id, "MThd")) {
                    throw new MidiSheetMusic.MidiFileException("Doesn't start with MThd", 0);
                }
                len = file.ReadInt();
                if (len !== 6) {
                    throw new MidiSheetMusic.MidiFileException("Bad MThd header", 4);
                }
                this.trackmode = file.ReadShort();
                var num_tracks = file.ReadShort();
                this.quarternote = file.ReadShort();

                this.events = System.Array.init(num_tracks, null, System.Collections.Generic.List$1(MidiSheetMusic.MidiEvent));
                for (var tracknum = 0; tracknum < num_tracks; tracknum = (tracknum + 1) | 0) {
                    this.events[System.Array.index(tracknum, this.events)] = this.ReadTrack(file);
                    var track = new MidiSheetMusic.MidiTrack.ctor(this.events[System.Array.index(tracknum, this.events)], tracknum);
                    if (track.Notes.Count > 0 || track.Lyrics != null) {
                        this.tracks.add(track);
                    }
                }

                /* Get the length of the song in pulses */
                $t = Bridge.getEnumerator(this.tracks);
                try {
                    while ($t.moveNext()) {
                        var track1 = $t.Current;
                        var last = track1.Notes.getItem(((track1.Notes.Count - 1) | 0));
                        if (this.totalpulses < ((last.StartTime + last.Duration) | 0)) {
                            this.totalpulses = (last.StartTime + last.Duration) | 0;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }
                /* If we only have one track with multiple channels, then treat
                  each channel as a separate track.
                */
                if (this.tracks.Count === 1 && MidiSheetMusic.MidiFile.HasMultipleChannels(this.tracks.getItem(0))) {
                    this.tracks = MidiSheetMusic.MidiFile.SplitChannels(this.tracks.getItem(0), this.events[System.Array.index(this.tracks.getItem(0).Number, this.events)]);
                    this.trackPerChannel = true;
                }

                MidiSheetMusic.MidiFile.CheckStartTimes(this.tracks);

                /* Determine the time signature */
                var tempo = 0;
                var numer = 0;
                var denom = 0;
                $t1 = Bridge.getEnumerator(this.events);
                try {
                    while ($t1.moveNext()) {
                        var list = $t1.Current;
                        $t2 = Bridge.getEnumerator(list);
                        try {
                            while ($t2.moveNext()) {
                                var mevent = $t2.Current;
                                if (mevent.Metaevent === MidiSheetMusic.MidiFile.MetaEventTempo && tempo === 0) {
                                    tempo = mevent.Tempo;
                                }
                                if (mevent.Metaevent === MidiSheetMusic.MidiFile.MetaEventTimeSignature && numer === 0) {
                                    numer = mevent.Numerator;
                                    denom = mevent.Denominator;
                                }
                            }
                        } finally {
                            if (Bridge.is($t2, System.IDisposable)) {
                                $t2.System$IDisposable$dispose();
                            }
                        }
                    }
                } finally {
                    if (Bridge.is($t1, System.IDisposable)) {
                        $t1.System$IDisposable$dispose();
                    }
                }if (tempo === 0) {
                    tempo = 500000; /* 500,000 microseconds = 0.05 sec */
                }
                if (numer === 0) {
                    numer = 4;
                    denom = 4;
                }
                this.timesig = new MidiSheetMusic.TimeSignature(numer, denom, this.quarternote, tempo);
            },
            ReadTrack: function (file) {
                var result = new (System.Collections.Generic.List$1(MidiSheetMusic.MidiEvent)).$ctor2(20);
                var starttime = 0;
                var id = file.ReadAscii(4);

                if (!Bridge.referenceEquals(id, "MTrk")) {
                    throw new MidiSheetMusic.MidiFileException("Bad MTrk header", ((file.GetOffset() - 4) | 0));
                }
                var tracklen = file.ReadInt();
                var trackend = (tracklen + file.GetOffset()) | 0;

                var eventflag = 0;

                while (file.GetOffset() < trackend) {

                    // If the midi file is truncated here, we can still recover.
                    // Just return what we've parsed so far.

                    var startoffset, deltatime;
                    var peekevent;
                    try {
                        startoffset = file.GetOffset();
                        deltatime = file.ReadVarlen();
                        starttime = (starttime + deltatime) | 0;
                        peekevent = file.Peek();
                    }
                    catch ($e1) {
                        $e1 = System.Exception.create($e1);
                        var e;
                        if (Bridge.is($e1, MidiSheetMusic.MidiFileException)) {
                            e = $e1;
                            return result;
                        } else {
                            throw $e1;
                        }
                    }

                    var mevent = new MidiSheetMusic.MidiEvent();
                    result.add(mevent);
                    mevent.DeltaTime = deltatime;
                    mevent.StartTime = starttime;

                    if (peekevent >= MidiSheetMusic.MidiFile.EventNoteOff) {
                        mevent.HasEventflag = true;
                        eventflag = file.ReadByte();
                    }

                    // Console.WriteLine("offset {0}: event {1} {2} start {3} delta {4}", 
                    //                   startoffset, eventflag, EventName(eventflag), 
                    //                   starttime, mevent.DeltaTime);

                    if (eventflag >= MidiSheetMusic.MidiFile.EventNoteOn && eventflag < 160) {
                        mevent.EventFlag = MidiSheetMusic.MidiFile.EventNoteOn;
                        mevent.Channel = (((eventflag - MidiSheetMusic.MidiFile.EventNoteOn) | 0)) & 255;
                        mevent.Notenumber = file.ReadByte();
                        mevent.Velocity = file.ReadByte();
                    } else if (eventflag >= MidiSheetMusic.MidiFile.EventNoteOff && eventflag < 144) {
                        mevent.EventFlag = MidiSheetMusic.MidiFile.EventNoteOff;
                        mevent.Channel = (((eventflag - MidiSheetMusic.MidiFile.EventNoteOff) | 0)) & 255;
                        mevent.Notenumber = file.ReadByte();
                        mevent.Velocity = file.ReadByte();
                    } else if (eventflag >= MidiSheetMusic.MidiFile.EventKeyPressure && eventflag < 176) {
                        mevent.EventFlag = MidiSheetMusic.MidiFile.EventKeyPressure;
                        mevent.Channel = (((eventflag - MidiSheetMusic.MidiFile.EventKeyPressure) | 0)) & 255;
                        mevent.Notenumber = file.ReadByte();
                        mevent.KeyPressure = file.ReadByte();
                    } else if (eventflag >= MidiSheetMusic.MidiFile.EventControlChange && eventflag < 192) {
                        mevent.EventFlag = MidiSheetMusic.MidiFile.EventControlChange;
                        mevent.Channel = (((eventflag - MidiSheetMusic.MidiFile.EventControlChange) | 0)) & 255;
                        mevent.ControlNum = file.ReadByte();
                        mevent.ControlValue = file.ReadByte();
                    } else if (eventflag >= MidiSheetMusic.MidiFile.EventProgramChange && eventflag < 208) {
                        mevent.EventFlag = MidiSheetMusic.MidiFile.EventProgramChange;
                        mevent.Channel = (((eventflag - MidiSheetMusic.MidiFile.EventProgramChange) | 0)) & 255;
                        mevent.Instrument = file.ReadByte();
                    } else if (eventflag >= MidiSheetMusic.MidiFile.EventChannelPressure && eventflag < 224) {
                        mevent.EventFlag = MidiSheetMusic.MidiFile.EventChannelPressure;
                        mevent.Channel = (((eventflag - MidiSheetMusic.MidiFile.EventChannelPressure) | 0)) & 255;
                        mevent.ChanPressure = file.ReadByte();
                    } else if (eventflag >= MidiSheetMusic.MidiFile.EventPitchBend && eventflag < 240) {
                        mevent.EventFlag = MidiSheetMusic.MidiFile.EventPitchBend;
                        mevent.Channel = (((eventflag - MidiSheetMusic.MidiFile.EventPitchBend) | 0)) & 255;
                        mevent.PitchBend = file.ReadShort();
                    } else if (eventflag === MidiSheetMusic.MidiFile.SysexEvent1) {
                        mevent.EventFlag = MidiSheetMusic.MidiFile.SysexEvent1;
                        mevent.Metalength = file.ReadVarlen();
                        mevent.Value = file.ReadBytes(mevent.Metalength);
                    } else if (eventflag === MidiSheetMusic.MidiFile.SysexEvent2) {
                        mevent.EventFlag = MidiSheetMusic.MidiFile.SysexEvent2;
                        mevent.Metalength = file.ReadVarlen();
                        mevent.Value = file.ReadBytes(mevent.Metalength);
                    } else if (eventflag === MidiSheetMusic.MidiFile.MetaEvent) {
                        mevent.EventFlag = MidiSheetMusic.MidiFile.MetaEvent;
                        mevent.Metaevent = file.ReadByte();
                        mevent.Metalength = file.ReadVarlen();
                        mevent.Value = file.ReadBytes(mevent.Metalength);
                        if (mevent.Metaevent === MidiSheetMusic.MidiFile.MetaEventTimeSignature) {
                            if (mevent.Metalength < 2) {
                                // throw new MidiFileException(
                                //  "Meta Event Time Signature len == " + mevent.Metalength  + 
                                //  " != 4", file.GetOffset());
                                mevent.Numerator = 0;
                                mevent.Denominator = 4;
                            } else if (mevent.Metalength >= 2 && mevent.Metalength < 4) {
                                mevent.Numerator = mevent.Value[System.Array.index(0, mevent.Value)];
                                mevent.Denominator = Bridge.Int.clipu8(Math.pow(2, mevent.Value[System.Array.index(1, mevent.Value)]));
                            } else {
                                mevent.Numerator = mevent.Value[System.Array.index(0, mevent.Value)];
                                mevent.Denominator = Bridge.Int.clipu8(Math.pow(2, mevent.Value[System.Array.index(1, mevent.Value)]));
                            }
                        } else if (mevent.Metaevent === MidiSheetMusic.MidiFile.MetaEventTempo) {
                            if (mevent.Metalength !== 3) {
                                throw new MidiSheetMusic.MidiFileException("Meta Event Tempo len == " + mevent.Metalength + " != 3", file.GetOffset());
                            }
                            mevent.Tempo = ((mevent.Value[System.Array.index(0, mevent.Value)] << 16) | (mevent.Value[System.Array.index(1, mevent.Value)] << 8) | mevent.Value[System.Array.index(2, mevent.Value)]);
                        } else if (mevent.Metaevent === MidiSheetMusic.MidiFile.MetaEventEndOfTrack) {
                            /* break;  */
                        }
                    } else {
                        throw new MidiSheetMusic.MidiFileException("Unknown event " + mevent.EventFlag, ((file.GetOffset() - 1) | 0));
                    }
                }

                return result;
            },
            ChangeSound: function (destfile, options) {
                return this.Write$1(destfile, options);
            },
            Write$1: function (destfile, options) {
                try {
                    var stream;
                    stream = new MidiSheetMusic.FileStream(destfile, MidiSheetMusic.FileMode.Create);
                    var result = this.Write(stream, options);
                    stream.Close();
                    return result;
                }
                catch ($e1) {
                    $e1 = System.Exception.create($e1);
                    var e;
                    if (Bridge.is($e1, MidiSheetMusic.IOException)) {
                        e = $e1;
                        return false;
                    } else {
                        throw $e1;
                    }
                }
            },
            Write: function (stream, options) {
                var newevents = this.events;
                if (options != null) {
                    newevents = this.ApplyOptionsToEvents(options);
                }
                return MidiSheetMusic.MidiFile.WriteEvents(stream, newevents, this.trackmode, this.quarternote);
            },
            ApplyOptionsToEvents: function (options) {
                var $t;
                var i;
                if (this.trackPerChannel) {
                    return this.ApplyOptionsPerChannel(options);
                }

                /* A midifile can contain tracks with notes and tracks without notes.
                  The options.tracks and options.instruments are for tracks with notes.
                  So the track numbers in 'options' may not match correctly if the
                  midi file has tracks without notes. Re-compute the instruments, and 
                  tracks to keep.
                */
                var num_tracks = this.events.length;
                var instruments = System.Array.init(num_tracks, 0, System.Int32);
                var keeptracks = System.Array.init(num_tracks, false, System.Boolean);
                for (i = 0; i < num_tracks; i = (i + 1) | 0) {
                    instruments[System.Array.index(i, instruments)] = 0;
                    keeptracks[System.Array.index(i, keeptracks)] = true;
                }
                for (var tracknum = 0; tracknum < this.tracks.Count; tracknum = (tracknum + 1) | 0) {
                    var track = this.tracks.getItem(tracknum);
                    var realtrack = track.Number;
                    instruments[System.Array.index(realtrack, instruments)] = options.instruments[System.Array.index(tracknum, options.instruments)];
                    if (options.mute[System.Array.index(tracknum, options.mute)] === true) {
                        keeptracks[System.Array.index(realtrack, keeptracks)] = false;
                    }
                }

                var newevents = MidiSheetMusic.MidiFile.CloneMidiEvents(this.events);

                /* Set the tempo at the beginning of each track */
                for (var tracknum1 = 0; tracknum1 < newevents.length; tracknum1 = (tracknum1 + 1) | 0) {
                    var mevent = MidiSheetMusic.MidiFile.CreateTempoEvent(options.tempo);
                    newevents[System.Array.index(tracknum1, newevents)].insert(0, mevent);
                }

                /* Change the note number (transpose), instrument, and tempo */
                for (var tracknum2 = 0; tracknum2 < newevents.length; tracknum2 = (tracknum2 + 1) | 0) {
                    $t = Bridge.getEnumerator(newevents[System.Array.index(tracknum2, newevents)]);
                    try {
                        while ($t.moveNext()) {
                            var mevent1 = $t.Current;
                            var num = (mevent1.Notenumber + options.transpose) | 0;
                            if (num < 0) {
                                num = 0;
                            }
                            if (num > 127) {
                                num = 127;
                            }
                            mevent1.Notenumber = num & 255;
                            if (!options.useDefaultInstruments) {
                                mevent1.Instrument = (instruments[System.Array.index(tracknum2, instruments)]) & 255;
                            }
                            mevent1.Tempo = options.tempo;
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }}

                if (options.pauseTime !== 0) {
                    newevents = MidiSheetMusic.MidiFile.StartAtPauseTime(newevents, options.pauseTime);
                }

                /* Change the tracks to include */
                var count = 0;
                for (var tracknum3 = 0; tracknum3 < keeptracks.length; tracknum3 = (tracknum3 + 1) | 0) {
                    if (keeptracks[System.Array.index(tracknum3, keeptracks)]) {
                        count = (count + 1) | 0;
                    }
                }
                var result = System.Array.init(count, null, System.Collections.Generic.List$1(MidiSheetMusic.MidiEvent));
                i = 0;
                for (var tracknum4 = 0; tracknum4 < keeptracks.length; tracknum4 = (tracknum4 + 1) | 0) {
                    if (keeptracks[System.Array.index(tracknum4, keeptracks)]) {
                        result[System.Array.index(i, result)] = newevents[System.Array.index(tracknum4, newevents)];
                        i = (i + 1) | 0;
                    }
                }
                return result;
            },
            ApplyOptionsPerChannel: function (options) {
                var $t;
                /* Determine which channels to include/exclude.
                  Also, determine the instruments for each channel.
                */
                var instruments = System.Array.init(16, 0, System.Int32);
                var keepchannel = System.Array.init(16, false, System.Boolean);
                for (var i = 0; i < 16; i = (i + 1) | 0) {
                    instruments[System.Array.index(i, instruments)] = 0;
                    keepchannel[System.Array.index(i, keepchannel)] = true;
                }
                for (var tracknum = 0; tracknum < this.tracks.Count; tracknum = (tracknum + 1) | 0) {
                    var track = this.tracks.getItem(tracknum);
                    var channel = track.Notes.getItem(0).Channel;
                    instruments[System.Array.index(channel, instruments)] = options.instruments[System.Array.index(tracknum, options.instruments)];
                    if (options.mute[System.Array.index(tracknum, options.mute)] === true) {
                        keepchannel[System.Array.index(channel, keepchannel)] = false;
                    }
                }

                var newevents = MidiSheetMusic.MidiFile.CloneMidiEvents(this.events);

                /* Set the tempo at the beginning of each track */
                for (var tracknum1 = 0; tracknum1 < newevents.length; tracknum1 = (tracknum1 + 1) | 0) {
                    var mevent = MidiSheetMusic.MidiFile.CreateTempoEvent(options.tempo);
                    newevents[System.Array.index(tracknum1, newevents)].insert(0, mevent);
                }

                /* Change the note number (transpose), instrument, and tempo */
                for (var tracknum2 = 0; tracknum2 < newevents.length; tracknum2 = (tracknum2 + 1) | 0) {
                    $t = Bridge.getEnumerator(newevents[System.Array.index(tracknum2, newevents)]);
                    try {
                        while ($t.moveNext()) {
                            var mevent1 = $t.Current;
                            var num = (mevent1.Notenumber + options.transpose) | 0;
                            if (num < 0) {
                                num = 0;
                            }
                            if (num > 127) {
                                num = 127;
                            }
                            mevent1.Notenumber = num & 255;
                            if (!keepchannel[System.Array.index(mevent1.Channel, keepchannel)]) {
                                mevent1.Velocity = 0;
                            }
                            if (!options.useDefaultInstruments) {
                                mevent1.Instrument = (instruments[System.Array.index(mevent1.Channel, instruments)]) & 255;
                            }
                            mevent1.Tempo = options.tempo;
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }}
                if (options.pauseTime !== 0) {
                    newevents = MidiSheetMusic.MidiFile.StartAtPauseTime(newevents, options.pauseTime);
                }
                return newevents;
            },
            ChangeMidiNotes: function (options) {
                var newtracks = new (System.Collections.Generic.List$1(MidiSheetMusic.MidiTrack)).ctor();

                for (var track = 0; track < this.tracks.Count; track = (track + 1) | 0) {
                    if (options.tracks[System.Array.index(track, options.tracks)]) {
                        newtracks.add(this.tracks.getItem(track).Clone());
                    }
                }

                /* To make the sheet music look nicer, we round the start times
                  so that notes close together appear as a single chord.  We
                  also extend the note durations, so that we have longer notes
                  and fewer rest symbols.
                */
                var time = this.timesig;
                if (options.time != null) {
                    time = options.time;
                }
                MidiSheetMusic.MidiFile.RoundStartTimes(newtracks, options.combineInterval, this.timesig);
                MidiSheetMusic.MidiFile.RoundDurations(newtracks, time.Quarter);

                if (options.twoStaffs) {
                    newtracks = MidiSheetMusic.MidiFile.CombineToTwoTracks(newtracks, this.timesig.Measure);
                }
                if (options.shifttime !== 0) {
                    MidiSheetMusic.MidiFile.ShiftTime(newtracks, options.shifttime);
                }
                if (options.transpose !== 0) {
                    MidiSheetMusic.MidiFile.Transpose(newtracks, options.transpose);
                }

                return newtracks;
            },
            GuessMeasureLength: function () {
                var $t, $t1, $t2;
                var result = new (System.Collections.Generic.List$1(System.Int32)).ctor();

                var pulses_per_second = Bridge.Int.clip32(1000000.0 / this.timesig.Tempo * this.timesig.Quarter);
                var minmeasure = (Bridge.Int.div(pulses_per_second, 2)) | 0; /* The minimum measure length in pulses */
                var maxmeasure = Bridge.Int.mul(pulses_per_second, 4); /* The maximum measure length in pulses */

                /* Get the start time of the first note in the midi file. */
                var firstnote = Bridge.Int.mul(this.timesig.Measure, 5);
                $t = Bridge.getEnumerator(this.tracks);
                try {
                    while ($t.moveNext()) {
                        var track = $t.Current;
                        if (firstnote > track.Notes.getItem(0).StartTime) {
                            firstnote = track.Notes.getItem(0).StartTime;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }
                /* interval = 0.06 seconds, converted into pulses */
                var interval = (Bridge.Int.div(Bridge.Int.mul(this.timesig.Quarter, 60000), this.timesig.Tempo)) | 0;

                $t1 = Bridge.getEnumerator(this.tracks);
                try {
                    while ($t1.moveNext()) {
                        var track1 = $t1.Current;
                        var prevtime = 0;
                        $t2 = Bridge.getEnumerator(track1.Notes);
                        try {
                            while ($t2.moveNext()) {
                                var note = $t2.Current;
                                if (((note.StartTime - prevtime) | 0) <= interval) {
                                    continue;
                                }

                                prevtime = note.StartTime;

                                var time_from_firstnote = (note.StartTime - firstnote) | 0;

                                /* Round the time down to a multiple of 4 */
                                time_from_firstnote = Bridge.Int.mul(((Bridge.Int.div(time_from_firstnote, 4)) | 0), 4);
                                if (time_from_firstnote < minmeasure) {
                                    continue;
                                }
                                if (time_from_firstnote > maxmeasure) {
                                    break;
                                }

                                if (!result.contains(time_from_firstnote)) {
                                    result.add(time_from_firstnote);
                                }
                            }
                        } finally {
                            if (Bridge.is($t2, System.IDisposable)) {
                                $t2.System$IDisposable$dispose();
                            }
                        }
                    }
                } finally {
                    if (Bridge.is($t1, System.IDisposable)) {
                        $t1.System$IDisposable$dispose();
                    }
                }result.sort();
                return result;
            },
            EndTime: function () {
                var $t;
                var lastStart = 0;
                $t = Bridge.getEnumerator(this.tracks);
                try {
                    while ($t.moveNext()) {
                        var track = $t.Current;
                        if (track.Notes.Count === 0) {
                            continue;
                        }
                        var last = track.Notes.getItem(((track.Notes.Count - 1) | 0)).StartTime;
                        lastStart = Math.max(last, lastStart);
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }return lastStart;
            },
            HasLyrics: function () {
                var $t;
                $t = Bridge.getEnumerator(this.tracks);
                try {
                    while ($t.moveNext()) {
                        var track = $t.Current;
                        if (track.Lyrics != null) {
                            return true;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }return false;
            },
            toString: function () {
                var $t;
                var result = "Midi File tracks=" + this.tracks.Count + " quarter=" + this.quarternote + "\n";
                result = (result || "") + (((this.Time.toString() || "") + "\n") || "");
                $t = Bridge.getEnumerator(this.tracks);
                try {
                    while ($t.moveNext()) {
                        var track = $t.Current;
                        result = (result || "") + ((track.toString()) || "");
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }return result;
            }
        }
    });

    Bridge.define("MidiSheetMusic.MidiFileException", {
        inherits: [System.Exception],
        ctors: {
            ctor: function (s, offset) {
                this.$initialize();
                System.Exception.ctor.call(this, (s || "") + " at offset " + offset);
            }
        }
    });

    Bridge.define("MidiSheetMusic.MidiFileReader", {
        fields: {
            data: null,
            parse_offset: 0
        },
        ctors: {
            ctor: function (bytes) {
                this.$initialize();
                this.data = bytes;
                this.parse_offset = 0;
            }
        },
        methods: {
            checkRead: function (amount) {
                if (((this.parse_offset + amount) | 0) > this.data.length) {
                    throw new MidiSheetMusic.MidiFileException("File is truncated", this.parse_offset);
                }
            },
            Peek: function () {
                this.checkRead(1);
                return this.data[System.Array.index(this.parse_offset, this.data)];
            },
            ReadByte: function () {
                this.checkRead(1);
                var x = this.data[System.Array.index(this.parse_offset, this.data)];
                this.parse_offset = (this.parse_offset + 1) | 0;
                return x;
            },
            ReadBytes: function (amount) {
                this.checkRead(amount);
                var result = System.Array.init(amount, 0, System.Byte);
                for (var i = 0; i < amount; i = (i + 1) | 0) {
                    result[System.Array.index(i, result)] = this.data[System.Array.index(((i + this.parse_offset) | 0), this.data)];
                }
                this.parse_offset = (this.parse_offset + amount) | 0;
                return result;
            },
            ReadShort: function () {
                this.checkRead(2);
                var x = ((this.data[System.Array.index(this.parse_offset, this.data)] << 8) | this.data[System.Array.index(((this.parse_offset + 1) | 0), this.data)]) & 65535;
                this.parse_offset = (this.parse_offset + 2) | 0;
                return x;
            },
            ReadInt: function () {
                this.checkRead(4);
                var x = (this.data[System.Array.index(this.parse_offset, this.data)] << 24) | (this.data[System.Array.index(((this.parse_offset + 1) | 0), this.data)] << 16) | (this.data[System.Array.index(((this.parse_offset + 2) | 0), this.data)] << 8) | this.data[System.Array.index(((this.parse_offset + 3) | 0), this.data)];
                this.parse_offset = (this.parse_offset + 4) | 0;
                return x;
            },
            ReadAscii: function (len) {
                this.checkRead(len);
                var s = System.Text.Encoding.ASCII.GetString$1(this.data, this.parse_offset, len);
                this.parse_offset = (this.parse_offset + len) | 0;
                return s;
            },
            ReadVarlen: function () {
                var result = 0;
                var b;

                b = this.ReadByte();
                result = (b & 127) >>> 0;

                for (var i = 0; i < 3; i = (i + 1) | 0) {
                    if ((b & 128) !== 0) {
                        b = this.ReadByte();
                        result = System.Int64.clipu32(System.Int64((((result << 7) >>> 0))).add(System.Int64((b & 127))));
                    } else {
                        break;
                    }
                }
                return (result | 0);
            },
            Skip: function (amount) {
                this.checkRead(amount);
                this.parse_offset = (this.parse_offset + amount) | 0;
            },
            GetOffset: function () {
                return this.parse_offset;
            },
            GetData: function () {
                return this.data;
            }
        }
    });

    Bridge.define("MidiSheetMusic.MidiNote", {
        inherits: function () { return [System.Collections.Generic.IComparer$1(MidiSheetMusic.MidiNote)]; },
        fields: {
            starttime: 0,
            channel: 0,
            notenumber: 0,
            duration: 0
        },
        props: {
            StartTime: {
                get: function () {
                    return this.starttime;
                },
                set: function (value) {
                    this.starttime = value;
                }
            },
            EndTime: {
                get: function () {
                    return ((this.starttime + this.duration) | 0);
                }
            },
            Channel: {
                get: function () {
                    return this.channel;
                },
                set: function (value) {
                    this.channel = value;
                }
            },
            Number: {
                get: function () {
                    return this.notenumber;
                },
                set: function (value) {
                    this.notenumber = value;
                }
            },
            Duration: {
                get: function () {
                    return this.duration;
                },
                set: function (value) {
                    this.duration = value;
                }
            }
        },
        alias: ["compare", ["System$Collections$Generic$IComparer$1$MidiSheetMusic$MidiNote$compare", "System$Collections$Generic$IComparer$1$compare"]],
        ctors: {
            ctor: function (starttime, channel, notenumber, duration) {
                this.$initialize();
                this.starttime = starttime;
                this.channel = channel;
                this.notenumber = notenumber;
                this.duration = duration;
            }
        },
        methods: {
            NoteOff: function (endtime) {
                this.duration = (endtime - this.starttime) | 0;
            },
            compare: function (x, y) {
                if (x.StartTime === y.StartTime) {
                    return ((x.Number - y.Number) | 0);
                } else {
                    return ((x.StartTime - y.StartTime) | 0);
                }
            },
            Clone: function () {
                return new MidiSheetMusic.MidiNote(this.starttime, this.channel, this.notenumber, this.duration);
            },
            toString: function () {
                var scale = System.Array.init([
                    "A", 
                    "A#", 
                    "B", 
                    "C", 
                    "C#", 
                    "D", 
                    "D#", 
                    "E", 
                    "F", 
                    "F#", 
                    "G", 
                    "G#"
                ], System.String);
                return System.String.format("MidiNote channel={0} number={1} {2} start={3} duration={4}", Bridge.box(this.channel, System.Int32), Bridge.box(this.notenumber, System.Int32), scale[System.Array.index((((this.notenumber + 3) | 0)) % 12, scale)], Bridge.box(this.starttime, System.Int32), Bridge.box(this.duration, System.Int32));

            }
        }
    });

    Bridge.define("MidiSheetMusic.MidiOptions", {
        statics: {
            fields: {
                NoteNameNone: 0,
                NoteNameLetter: 0,
                NoteNameFixedDoReMi: 0,
                NoteNameMovableDoReMi: 0,
                NoteNameFixedNumber: 0,
                NoteNameMovableNumber: 0
            },
            ctors: {
                init: function () {
                    this.NoteNameNone = 0;
                    this.NoteNameLetter = 1;
                    this.NoteNameFixedDoReMi = 2;
                    this.NoteNameMovableDoReMi = 3;
                    this.NoteNameFixedNumber = 4;
                    this.NoteNameMovableNumber = 5;
                }
            },
            methods: {
                Join$1: function (values) {
                    var result = new System.Text.StringBuilder();
                    for (var i = 0; i < values.length; i = (i + 1) | 0) {
                        if (i > 0) {
                            result.append(",");
                        }
                        result.append(System.Boolean.toString(values[System.Array.index(i, values)]));
                    }
                    return result.toString();
                },
                Join$2: function (values) {
                    var result = new System.Text.StringBuilder();
                    for (var i = 0; i < values.length; i = (i + 1) | 0) {
                        if (i > 0) {
                            result.append(",");
                        }
                        result.append(values[System.Array.index(i, values)].toString());
                    }
                    return result.toString();
                },
                Join: function (values) {
                    var result = new System.Text.StringBuilder();
                    for (var i = 0; i < values.length; i = (i + 1) | 0) {
                        if (i > 0) {
                            result.append(",");
                        }
                        result.append(MidiSheetMusic.MidiOptions.ColorToString(values[System.Array.index(i, values)]));
                    }
                    return result.toString();
                },
                ColorToString: function (c) {
                    return "" + c.R + " " + c.G + " " + c.B;
                }
            }
        },
        fields: {
            filename: null,
            title: null,
            tracks: null,
            scrollVert: false,
            largeNoteSize: false,
            twoStaffs: false,
            showNoteLetters: 0,
            showLyrics: false,
            showMeasures: false,
            shifttime: 0,
            transpose: 0,
            key: 0,
            time: null,
            combineInterval: 0,
            colors: null,
            shadeColor: null,
            shade2Color: null,
            mute: null,
            tempo: 0,
            pauseTime: 0,
            instruments: null,
            useDefaultInstruments: false,
            playMeasuresInLoop: false,
            playMeasuresInLoopStart: 0,
            playMeasuresInLoopEnd: 0
        },
        ctors: {
            ctor: function () {
                this.$initialize();
            },
            $ctor1: function (midifile) {
                this.$initialize();
                this.filename = midifile.FileName;
                this.title = MidiSheetMusic.Path.GetFileName(midifile.FileName);
                var numtracks = midifile.Tracks.Count;
                this.tracks = System.Array.init(numtracks, false, System.Boolean);
                this.mute = System.Array.init(numtracks, false, System.Boolean);
                this.instruments = System.Array.init(numtracks, 0, System.Int32);
                for (var i = 0; i < this.tracks.length; i = (i + 1) | 0) {
                    this.tracks[System.Array.index(i, this.tracks)] = true;
                    this.mute[System.Array.index(i, this.mute)] = false;
                    this.instruments[System.Array.index(i, this.instruments)] = midifile.Tracks.getItem(i).Instrument;
                    if (Bridge.referenceEquals(midifile.Tracks.getItem(i).InstrumentName, "Percussion")) {
                        this.tracks[System.Array.index(i, this.tracks)] = false;
                        this.mute[System.Array.index(i, this.mute)] = true;
                    }
                }
                this.useDefaultInstruments = true;
                this.scrollVert = true;
                this.largeNoteSize = false;
                if (this.tracks.length === 1) {
                    this.twoStaffs = true;
                } else {
                    this.twoStaffs = false;
                }
                this.showNoteLetters = MidiSheetMusic.MidiOptions.NoteNameNone;
                this.showLyrics = true;
                this.showMeasures = false;
                this.shifttime = 0;
                this.transpose = 0;
                this.key = -1;
                this.time = midifile.Time;
                this.colors = null;
                this.shadeColor = MidiSheetMusic.Color.FromArgb(210, 205, 220);
                this.shade2Color = MidiSheetMusic.Color.FromArgb(80, 100, 250);
                this.combineInterval = 40;
                this.tempo = midifile.Time.Tempo;
                this.pauseTime = 0;
                this.playMeasuresInLoop = false;
                this.playMeasuresInLoopStart = 0;
                this.playMeasuresInLoopEnd = (Bridge.Int.div(midifile.EndTime(), midifile.Time.Measure)) | 0;
            }
        },
        methods: {
            Merge: function (saved) {
                if (saved.tracks != null && saved.tracks.length === this.tracks.length) {
                    for (var i = 0; i < this.tracks.length; i = (i + 1) | 0) {
                        this.tracks[System.Array.index(i, this.tracks)] = saved.tracks[System.Array.index(i, saved.tracks)];
                    }
                }
                if (saved.mute != null && saved.mute.length === this.mute.length) {
                    for (var i1 = 0; i1 < this.mute.length; i1 = (i1 + 1) | 0) {
                        this.mute[System.Array.index(i1, this.mute)] = saved.mute[System.Array.index(i1, saved.mute)];
                    }
                }
                if (saved.instruments != null && saved.instruments.length === this.instruments.length) {
                    for (var i2 = 0; i2 < this.instruments.length; i2 = (i2 + 1) | 0) {
                        this.instruments[System.Array.index(i2, this.instruments)] = saved.instruments[System.Array.index(i2, saved.instruments)];
                    }
                }
                if (saved.time != null) {
                    this.time = new MidiSheetMusic.TimeSignature(saved.time.Numerator, saved.time.Denominator, saved.time.Quarter, saved.time.Tempo);
                }
                this.useDefaultInstruments = saved.useDefaultInstruments;
                this.scrollVert = saved.scrollVert;
                this.largeNoteSize = saved.largeNoteSize;
                this.showLyrics = saved.showLyrics;
                this.twoStaffs = saved.twoStaffs;
                this.showNoteLetters = saved.showNoteLetters;
                this.transpose = saved.transpose;
                this.key = saved.key;
                this.combineInterval = saved.combineInterval;
                if (!Bridge.referenceEquals(saved.shadeColor, MidiSheetMusic.Color.White)) {
                    this.shadeColor = saved.shadeColor;
                }
                if (!Bridge.referenceEquals(saved.shade2Color, MidiSheetMusic.Color.White)) {
                    this.shade2Color = saved.shade2Color;
                }
                if (saved.colors != null) {
                    this.colors = saved.colors;
                }
                this.showMeasures = saved.showMeasures;
                this.playMeasuresInLoop = saved.playMeasuresInLoop;
                this.playMeasuresInLoopStart = saved.playMeasuresInLoopStart;
                this.playMeasuresInLoopEnd = saved.playMeasuresInLoopEnd;
            }
        }
    });

    Bridge.define("MidiSheetMusic.MidiTrack", {
        fields: {
            tracknum: 0,
            notes: null,
            instrument: 0,
            lyrics: null
        },
        props: {
            Number: {
                get: function () {
                    return this.tracknum;
                }
            },
            Notes: {
                get: function () {
                    return this.notes;
                }
            },
            Instrument: {
                get: function () {
                    return this.instrument;
                },
                set: function (value) {
                    this.instrument = value;
                }
            },
            InstrumentName: {
                get: function () {
                    if (this.instrument >= 0 && this.instrument <= 128) {
                        return MidiSheetMusic.MidiFile.Instruments[System.Array.index(this.instrument, MidiSheetMusic.MidiFile.Instruments)];
                    } else {
                        return "";
                    }
                }
            },
            Lyrics: {
                get: function () {
                    return this.lyrics;
                },
                set: function (value) {
                    this.lyrics = value;
                }
            }
        },
        ctors: {
            $ctor1: function (tracknum) {
                this.$initialize();
                this.tracknum = tracknum;
                this.notes = new (System.Collections.Generic.List$1(MidiSheetMusic.MidiNote)).$ctor2(20);
                this.instrument = 0;
            },
            ctor: function (events, tracknum) {
                var $t;
                this.$initialize();
                this.tracknum = tracknum;
                this.notes = new (System.Collections.Generic.List$1(MidiSheetMusic.MidiNote)).$ctor2(events.Count);
                this.instrument = 0;

                $t = Bridge.getEnumerator(events);
                try {
                    while ($t.moveNext()) {
                        var mevent = $t.Current;
                        if (mevent.EventFlag === MidiSheetMusic.MidiFile.EventNoteOn && mevent.Velocity > 0) {
                            var note = new MidiSheetMusic.MidiNote(mevent.StartTime, mevent.Channel, mevent.Notenumber, 0);
                            this.AddNote(note);
                        } else if (mevent.EventFlag === MidiSheetMusic.MidiFile.EventNoteOn && mevent.Velocity === 0) {
                            this.NoteOff(mevent.Channel, mevent.Notenumber, mevent.StartTime);
                        } else if (mevent.EventFlag === MidiSheetMusic.MidiFile.EventNoteOff) {
                            this.NoteOff(mevent.Channel, mevent.Notenumber, mevent.StartTime);
                        } else if (mevent.EventFlag === MidiSheetMusic.MidiFile.EventProgramChange) {
                            this.instrument = mevent.Instrument;
                        } else if (mevent.Metaevent === MidiSheetMusic.MidiFile.MetaEventLyric) {
                            this.AddLyric(mevent);
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }if (this.notes.Count > 0 && this.notes.getItem(0).Channel === 9) {
                    this.instrument = 128; /* Percussion */
                }
                var lyriccount = 0;
                if (this.lyrics != null) {
                    lyriccount = this.lyrics.Count;
                }
            }
        },
        methods: {
            AddNote: function (m) {
                this.notes.add(m);
            },
            NoteOff: function (channel, notenumber, endtime) {
                for (var i = (this.notes.Count - 1) | 0; i >= 0; i = (i - 1) | 0) {
                    var note = this.notes.getItem(i);
                    if (note.Channel === channel && note.Number === notenumber && note.Duration === 0) {
                        note.NoteOff(endtime);
                        return;
                    }
                }
            },
            AddLyric: function (mevent) {
                if (this.lyrics == null) {
                    this.lyrics = new (System.Collections.Generic.List$1(MidiSheetMusic.MidiEvent)).ctor();
                }
                this.lyrics.add(mevent);
            },
            Clone: function () {
                var $t, $t1;
                var track = new MidiSheetMusic.MidiTrack.$ctor1(this.Number);
                track.instrument = this.instrument;
                $t = Bridge.getEnumerator(this.notes);
                try {
                    while ($t.moveNext()) {
                        var note = $t.Current;
                        track.notes.add(note.Clone());
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }if (this.lyrics != null) {
                    track.lyrics = new (System.Collections.Generic.List$1(MidiSheetMusic.MidiEvent)).ctor();
                    $t1 = Bridge.getEnumerator(this.lyrics);
                    try {
                        while ($t1.moveNext()) {
                            var ev = $t1.Current;
                            track.lyrics.add(ev);
                        }
                    } finally {
                        if (Bridge.is($t1, System.IDisposable)) {
                            $t1.System$IDisposable$dispose();
                        }
                    }}
                return track;
            },
            toString: function () {
                var $t;
                var result = "Track number=" + this.tracknum + " instrument=" + this.instrument + "\n";
                $t = Bridge.getEnumerator(this.notes);
                try {
                    while ($t.moveNext()) {
                        var n = $t.Current;
                        result = System.String.concat(result, n) + "\n";
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }result = (result || "") + "End Track\n";
                return result;
            }
        }
    });

    Bridge.define("MidiSheetMusic.NoteData", {
        fields: {
            number: 0,
            whitenote: null,
            duration: 0,
            leftside: false,
            accid: 0
        }
    });

    Bridge.define("MidiSheetMusic.NoteDuration", {
        $kind: "enum",
        statics: {
            fields: {
                ThirtySecond: 0,
                Sixteenth: 1,
                Triplet: 2,
                Eighth: 3,
                DottedEighth: 4,
                Quarter: 5,
                DottedQuarter: 6,
                Half: 7,
                DottedHalf: 8,
                Whole: 9
            }
        }
    });

    Bridge.define("MidiSheetMusic.NoteScale", {
        statics: {
            fields: {
                A: 0,
                Asharp: 0,
                Bflat: 0,
                B: 0,
                C: 0,
                Csharp: 0,
                Dflat: 0,
                D: 0,
                Dsharp: 0,
                Eflat: 0,
                E: 0,
                F: 0,
                Fsharp: 0,
                Gflat: 0,
                G: 0,
                Gsharp: 0,
                Aflat: 0
            },
            ctors: {
                init: function () {
                    this.A = 0;
                    this.Asharp = 1;
                    this.Bflat = 1;
                    this.B = 2;
                    this.C = 3;
                    this.Csharp = 4;
                    this.Dflat = 4;
                    this.D = 5;
                    this.Dsharp = 6;
                    this.Eflat = 6;
                    this.E = 7;
                    this.F = 8;
                    this.Fsharp = 9;
                    this.Gflat = 9;
                    this.G = 10;
                    this.Gsharp = 11;
                    this.Aflat = 11;
                }
            },
            methods: {
                ToNumber: function (notescale, octave) {
                    return ((((9 + notescale) | 0) + Bridge.Int.mul(octave, 12)) | 0);
                },
                FromNumber: function (number) {
                    return (((number + 3) | 0)) % 12;
                },
                IsBlackKey: function (notescale) {
                    if (notescale === MidiSheetMusic.NoteScale.Asharp || notescale === MidiSheetMusic.NoteScale.Csharp || notescale === MidiSheetMusic.NoteScale.Dsharp || notescale === MidiSheetMusic.NoteScale.Fsharp || notescale === MidiSheetMusic.NoteScale.Gsharp) {

                        return true;
                    } else {
                        return false;
                    }
                }
            }
        }
    });

    Bridge.define("MidiSheetMusic.PaintEventArgs", {
        fields: {
            ClipRectangle: null
        },
        methods: {
            Graphics: function () {
                return new MidiSheetMusic.Graphics("main");
            }
        }
    });

    Bridge.define("MidiSheetMusic.Panel", {
        fields: {
            autoScrollPosition: null,
            Width: 0,
            Height: 0
        },
        props: {
            AutoScrollPosition: {
                get: function () {
                    return this.autoScrollPosition;
                },
                set: function (value) {
                    this.autoScrollPosition = value;
                }
            }
        },
        ctors: {
            init: function () {
                this.autoScrollPosition = new MidiSheetMusic.Point(0, 0);
            }
        }
    });

    Bridge.define("MidiSheetMusic.Path", {
        statics: {
            methods: {
                GetFileName: function (filename) {
                    return null;
                }
            }
        }
    });

    Bridge.define("MidiSheetMusic.Pen", {
        fields: {
            Color: null,
            Width: 0,
            EndCap: 0
        },
        ctors: {
            ctor: function (color, width) {
                this.$initialize();
                this.Color = color;
                this.Width = width;
            }
        }
    });

    Bridge.define("MidiSheetMusic.Point", {
        fields: {
            X: 0,
            Y: 0
        },
        ctors: {
            ctor: function (x, y) {
                this.$initialize();
                this.X = x;
                this.Y = y;
            }
        }
    });

    Bridge.define("MidiSheetMusic.Rectangle", {
        fields: {
            X: 0,
            Y: 0,
            Width: 0,
            Height: 0
        },
        ctors: {
            ctor: function (x, y, width, height) {
                this.$initialize();
                this.X = x;
                this.Y = y;
                this.Width = width;
                this.Height = height;
            }
        }
    });

    Bridge.define("MidiSheetMusic.SmoothingMode", {
        $kind: "enum",
        statics: {
            fields: {
                None: 0,
                AntiAlias: 1
            }
        }
    });

    Bridge.define("MidiSheetMusic.Staff", {
        fields: {
            symbols: null,
            lyrics: null,
            ytop: 0,
            clefsym: null,
            keys: null,
            showMeasures: false,
            keysigWidth: 0,
            width: 0,
            height: 0,
            tracknum: 0,
            totaltracks: 0,
            starttime: 0,
            endtime: 0,
            measureLength: 0
        },
        props: {
            Width: {
                get: function () {
                    return this.width;
                }
            },
            Height: {
                get: function () {
                    return this.height;
                }
            },
            Track: {
                get: function () {
                    return this.tracknum;
                }
            },
            StartTime: {
                get: function () {
                    return this.starttime;
                }
            },
            EndTime: {
                get: function () {
                    return this.endtime;
                },
                set: function (value) {
                    this.endtime = value;
                }
            }
        },
        ctors: {
            ctor: function (symbols, key, options, tracknum, totaltracks) {
                this.$initialize();

                this.keysigWidth = MidiSheetMusic.SheetMusic.KeySignatureWidth(key);
                this.tracknum = tracknum;
                this.totaltracks = totaltracks;
                this.showMeasures = (options.showMeasures && tracknum === 0);
                this.measureLength = options.time.Measure;
                var clef = this.FindClef(symbols);

                this.clefsym = new MidiSheetMusic.ClefSymbol(clef, 0, false);
                this.keys = key.GetSymbols(clef);
                this.symbols = symbols;
                this.CalculateWidth(options.scrollVert);
                this.CalculateHeight();
                this.CalculateStartEndTime();
                this.FullJustify();
            }
        },
        methods: {
            FindClef: function (list) {
                var $t;
                $t = Bridge.getEnumerator(list);
                try {
                    while ($t.moveNext()) {
                        var m = $t.Current;
                        if (Bridge.is(m, MidiSheetMusic.ChordSymbol)) {
                            var c = Bridge.cast(m, MidiSheetMusic.ChordSymbol);
                            return c.Clef;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }return MidiSheetMusic.Clef.Treble;
            },
            CalculateHeight: function () {
                var $t;
                var above = 0;
                var below = 0;

                $t = Bridge.getEnumerator(this.symbols);
                try {
                    while ($t.moveNext()) {
                        var s = $t.Current;
                        above = Math.max(above, s.AboveStaff);
                        below = Math.max(below, s.BelowStaff);
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }above = Math.max(above, this.clefsym.AboveStaff);
                below = Math.max(below, this.clefsym.BelowStaff);
                if (this.showMeasures) {
                    above = Math.max(above, Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 3));
                }
                this.ytop = (above + MidiSheetMusic.SheetMusic.NoteHeight) | 0;
                this.height = (((Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 5) + this.ytop) | 0) + below) | 0;
                if (this.lyrics != null) {
                    this.height = (this.height + 12) | 0;
                }

                /* Add some extra vertical space between the last track
                  and first track.
                */
                if (this.tracknum === ((this.totaltracks - 1) | 0)) {
                    this.height = (this.height + (Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 3))) | 0;
                }
            },
            CalculateWidth: function (scrollVert) {
                var $t;
                if (scrollVert) {
                    this.width = MidiSheetMusic.SheetMusic.PageWidth;
                    return;
                }
                this.width = this.keysigWidth;
                $t = Bridge.getEnumerator(this.symbols);
                try {
                    while ($t.moveNext()) {
                        var s = $t.Current;
                        this.width = (this.width + s.Width) | 0;
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }},
            CalculateStartEndTime: function () {
                var $t;
                this.starttime = (this.endtime = 0);
                if (this.symbols.Count === 0) {
                    return;
                }
                this.starttime = this.symbols.getItem(0).StartTime;
                $t = Bridge.getEnumerator(this.symbols);
                try {
                    while ($t.moveNext()) {
                        var m = $t.Current;
                        if (this.endtime < m.StartTime) {
                            this.endtime = m.StartTime;
                        }
                        if (Bridge.is(m, MidiSheetMusic.ChordSymbol)) {
                            var c = Bridge.cast(m, MidiSheetMusic.ChordSymbol);
                            if (this.endtime < c.EndTime) {
                                this.endtime = c.EndTime;
                            }
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }},
            FullJustify: function () {
                if (this.width !== MidiSheetMusic.SheetMusic.PageWidth) {
                    return;
                }

                var totalwidth = this.keysigWidth;
                var totalsymbols = 0;
                var i = 0;

                while (i < this.symbols.Count) {
                    var start = this.symbols.getItem(i).StartTime;
                    totalsymbols = (totalsymbols + 1) | 0;
                    totalwidth = (totalwidth + this.symbols.getItem(i).Width) | 0;
                    i = (i + 1) | 0;
                    while (i < this.symbols.Count && this.symbols.getItem(i).StartTime === start) {
                        totalwidth = (totalwidth + this.symbols.getItem(i).Width) | 0;
                        i = (i + 1) | 0;
                    }
                }

                var extrawidth = (Bridge.Int.div((((((MidiSheetMusic.SheetMusic.PageWidth - totalwidth) | 0) - 1) | 0)), totalsymbols)) | 0;
                if (extrawidth > Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 2)) {
                    extrawidth = Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 2);
                }
                i = 0;
                while (i < this.symbols.Count) {
                    var start1 = this.symbols.getItem(i).StartTime;
                    this.symbols.getItem(i).Width = (this.symbols.getItem(i).Width + extrawidth) | 0;
                    i = (i + 1) | 0;
                    while (i < this.symbols.Count && this.symbols.getItem(i).StartTime === start1) {
                        i = (i + 1) | 0;
                    }
                }
            },
            AddLyrics: function (tracklyrics) {
                var $t;
                if (tracklyrics == null) {
                    return;
                }
                this.lyrics = new (System.Collections.Generic.List$1(MidiSheetMusic.LyricSymbol)).ctor();
                var xpos = 0;
                var symbolindex = 0;
                $t = Bridge.getEnumerator(tracklyrics);
                try {
                    while ($t.moveNext()) {
                        var lyric = $t.Current;
                        if (lyric.StartTime < this.starttime) {
                            continue;
                        }
                        if (lyric.StartTime > this.endtime) {
                            break;
                        }
                        /* Get the x-position of this lyric */
                        while (symbolindex < this.symbols.Count && this.symbols.getItem(symbolindex).StartTime < lyric.StartTime) {
                            xpos = (xpos + this.symbols.getItem(symbolindex).Width) | 0;
                            symbolindex = (symbolindex + 1) | 0;
                        }
                        lyric.X = xpos;
                        if (symbolindex < this.symbols.Count && (Bridge.is(this.symbols.getItem(symbolindex), MidiSheetMusic.BarSymbol))) {
                            lyric.X = (lyric.X + MidiSheetMusic.SheetMusic.NoteWidth) | 0;
                        }
                        this.lyrics.add(lyric);
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }if (this.lyrics.Count === 0) {
                    this.lyrics = null;
                }
            },
            DrawLyrics: function (g, pen) {
                var $t;
                /* Skip the left side Clef symbol and key signature */
                var xpos = this.keysigWidth;
                var ypos = (this.height - 12) | 0;

                $t = Bridge.getEnumerator(this.lyrics);
                try {
                    while ($t.moveNext()) {
                        var lyric = $t.Current;
                        g.DrawString(lyric.Text, MidiSheetMusic.SheetMusic.LetterFont, MidiSheetMusic.Brushes.Black, ((xpos + lyric.X) | 0), ypos);
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }},
            DrawMeasureNumbers: function (g, pen) {
                var $t;

                /* Skip the left side Clef symbol and key signature */
                var xpos = this.keysigWidth;
                var ypos = (this.ytop - Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 3)) | 0;

                $t = Bridge.getEnumerator(this.symbols);
                try {
                    while ($t.moveNext()) {
                        var s = $t.Current;
                        if (Bridge.is(s, MidiSheetMusic.BarSymbol)) {
                            var measure = (1 + ((Bridge.Int.div(s.StartTime, this.measureLength)) | 0)) | 0;
                            g.DrawString("" + measure, MidiSheetMusic.SheetMusic.LetterFont, MidiSheetMusic.Brushes.Black, ((xpos + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.NoteWidth, 2)) | 0)) | 0), ypos);
                        }
                        xpos = (xpos + s.Width) | 0;
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }},
            DrawHorizLines: function (g, pen) {
                var line = 1;
                var y = (this.ytop - MidiSheetMusic.SheetMusic.LineWidth) | 0;
                pen.Width = 1;
                for (line = 1; line <= 5; line = (line + 1) | 0) {
                    g.DrawLine(pen, MidiSheetMusic.SheetMusic.LeftMargin, y, ((this.width - 1) | 0), y);
                    y = (y + (((MidiSheetMusic.SheetMusic.LineWidth + MidiSheetMusic.SheetMusic.LineSpace) | 0))) | 0;
                }
                pen.Color = MidiSheetMusic.Color.Black;

            },
            DrawEndLines: function (g, pen) {
                pen.Width = 1;

                /* Draw the vertical lines from 0 to the height of this staff,
                  including the space above and below the staff, with two exceptions:
                  - If this is the first track, don't start above the staff.
                    Start exactly at the top of the staff (ytop - LineWidth)
                  - If this is the last track, don't end below the staff.
                    End exactly at the bottom of the staff.
                */
                var ystart, yend;
                if (this.tracknum === 0) {
                    ystart = (this.ytop - MidiSheetMusic.SheetMusic.LineWidth) | 0;
                } else {
                    ystart = 0;
                }

                if (this.tracknum === (((this.totaltracks - 1) | 0))) {
                    yend = (this.ytop + Bridge.Int.mul(4, MidiSheetMusic.SheetMusic.NoteHeight)) | 0;
                } else {
                    yend = this.height;
                }

                g.DrawLine(pen, MidiSheetMusic.SheetMusic.LeftMargin, ystart, MidiSheetMusic.SheetMusic.LeftMargin, yend);

                g.DrawLine(pen, ((this.width - 1) | 0), ystart, ((this.width - 1) | 0), yend);

            },
            Draw: function (g, clip, pen) {
                var $t, $t1;
                var xpos = 9;

                /* Draw the left side Clef symbol */
                g.TranslateTransform(xpos, 0);
                this.clefsym.Draw(g, pen, this.ytop);
                g.TranslateTransform(((-xpos) | 0), 0);
                xpos = (xpos + this.clefsym.Width) | 0;

                /* Draw the key signature */
                $t = Bridge.getEnumerator(this.keys);
                try {
                    while ($t.moveNext()) {
                        var a = $t.Current;
                        g.TranslateTransform(xpos, 0);
                        a.Draw(g, pen, this.ytop);
                        g.TranslateTransform(((-xpos) | 0), 0);
                        xpos = (xpos + a.Width) | 0;
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }
                /* Draw the actual notes, rests, bars.  Draw the symbols one 
                  after another, using the symbol width to determine the
                  x position of the next symbol.

                  For fast performance, only draw symbols that are in the clip area.
                */
                $t1 = Bridge.getEnumerator(this.symbols);
                try {
                    while ($t1.moveNext()) {
                        var s = $t1.Current;
                        if ((xpos <= ((((clip.X + clip.Width) | 0) + 50) | 0)) && (((((xpos + s.Width) | 0) + 50) | 0) >= clip.X)) {
                            g.TranslateTransform(xpos, 0);
                            s.Draw(g, pen, this.ytop);
                            g.TranslateTransform(((-xpos) | 0), 0);
                        }
                        xpos = (xpos + s.Width) | 0;
                    }
                } finally {
                    if (Bridge.is($t1, System.IDisposable)) {
                        $t1.System$IDisposable$dispose();
                    }
                }this.DrawHorizLines(g, pen);
                this.DrawEndLines(g, pen);

                if (this.showMeasures) {
                    this.DrawMeasureNumbers(g, pen);
                }
                if (this.lyrics != null) {
                    this.DrawLyrics(g, pen);
                }

            },
            ShadeNotes: function (g, shadeBrush, pen, currentPulseTime, prevPulseTime, x_shade) {

                /* If there's nothing to unshade, or shade, return */
                if ((this.starttime > prevPulseTime || this.endtime < prevPulseTime) && (this.starttime > currentPulseTime || this.endtime < currentPulseTime)) {
                    return;
                }

                /* Skip the left side Clef symbol and key signature */
                var xpos = this.keysigWidth;

                var curr = null;
                var prevChord = null;
                var prev_xpos = 0;

                /* Loop through the symbols. 
                  Unshade symbols where start <= prevPulseTime < end
                  Shade symbols where start <= currentPulseTime < end
                */
                for (var i = 0; i < this.symbols.Count; i = (i + 1) | 0) {
                    curr = this.symbols.getItem(i);
                    if (Bridge.is(curr, MidiSheetMusic.BarSymbol)) {
                        xpos = (xpos + curr.Width) | 0;
                        continue;
                    }

                    var start = curr.StartTime;
                    var end = 0;
                    if (((i + 2) | 0) < this.symbols.Count && Bridge.is(this.symbols.getItem(((i + 1) | 0)), MidiSheetMusic.BarSymbol)) {
                        end = this.symbols.getItem(((i + 2) | 0)).StartTime;
                    } else if (((i + 1) | 0) < this.symbols.Count) {
                        end = this.symbols.getItem(((i + 1) | 0)).StartTime;
                    } else {
                        end = this.endtime;
                    }


                    /* If we've past the previous and current times, we're done. */
                    if ((start > prevPulseTime) && (start > currentPulseTime)) {
                        if (x_shade.v === 0) {
                            x_shade.v = xpos;
                        }

                        return;
                    }
                    /* If shaded notes are the same, we're done */
                    if ((start <= currentPulseTime) && (currentPulseTime < end) && (start <= prevPulseTime) && (prevPulseTime < end)) {

                        x_shade.v = xpos;
                        return;
                    }

                    var redrawLines = false;

                    /* If symbol is in the previous time, draw a white background */
                    if ((start <= prevPulseTime) && (prevPulseTime < end)) {
                        g.TranslateTransform(((xpos - 2) | 0), -2);
                        g.FillRectangle(MidiSheetMusic.Brushes.White, 0, 0, ((curr.Width + 4) | 0), ((this.Height + 4) | 0));
                        g.TranslateTransform(((-(((xpos - 2) | 0))) | 0), 2);
                        g.TranslateTransform(xpos, 0);
                        curr.Draw(g, pen, this.ytop);
                        g.TranslateTransform(((-xpos) | 0), 0);

                        redrawLines = true;
                    }

                    /* If symbol is in the current time, draw a shaded background */
                    if ((start <= currentPulseTime) && (currentPulseTime < end)) {
                        x_shade.v = xpos;
                        g.TranslateTransform(xpos, 0);
                        g.FillRectangle(shadeBrush, 0, 0, curr.Width, this.Height);
                        curr.Draw(g, pen, this.ytop);
                        g.TranslateTransform(((-xpos) | 0), 0);
                        redrawLines = true;
                    }

                    /* If either a gray or white background was drawn, we need to redraw
                      the horizontal staff lines, and redraw the stem of the previous chord.
                    */
                    if (redrawLines) {
                        var line = 1;
                        var y = (this.ytop - MidiSheetMusic.SheetMusic.LineWidth) | 0;
                        pen.Width = 1;
                        g.TranslateTransform(((xpos - 2) | 0), 0);
                        for (line = 1; line <= 5; line = (line + 1) | 0) {
                            g.DrawLine(pen, 0, y, ((curr.Width + 4) | 0), y);
                            y = (y + (((MidiSheetMusic.SheetMusic.LineWidth + MidiSheetMusic.SheetMusic.LineSpace) | 0))) | 0;
                        }
                        g.TranslateTransform(((-(((xpos - 2) | 0))) | 0), 0);

                        if (prevChord != null) {
                            g.TranslateTransform(prev_xpos, 0);
                            prevChord.Draw(g, pen, this.ytop);
                            g.TranslateTransform(((-prev_xpos) | 0), 0);
                        }
                        if (this.showMeasures) {
                            this.DrawMeasureNumbers(g, pen);
                        }
                        if (this.lyrics != null) {
                            this.DrawLyrics(g, pen);
                        }
                    }
                    if (Bridge.is(curr, MidiSheetMusic.ChordSymbol)) {
                        var chord = Bridge.cast(curr, MidiSheetMusic.ChordSymbol);
                        if (chord.Stem != null && !chord.Stem.Receiver) {
                            prevChord = Bridge.cast(curr, MidiSheetMusic.ChordSymbol);
                            prev_xpos = xpos;
                        }
                    }
                    xpos = (xpos + curr.Width) | 0;
                }
            },
            PulseTimeForPoint: function (point) {
                var $t;

                var xpos = this.keysigWidth;
                var pulseTime = this.starttime;
                $t = Bridge.getEnumerator(this.symbols);
                try {
                    while ($t.moveNext()) {
                        var sym = $t.Current;
                        pulseTime = sym.StartTime;
                        if (point.X <= ((xpos + sym.Width) | 0)) {
                            return pulseTime;
                        }
                        xpos = (xpos + sym.Width) | 0;
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }return pulseTime;
            },
            toString: function () {
                var $t, $t1, $t2;
                var result = "Staff clef=" + (this.clefsym.toString() || "") + "\n";
                result = (result || "") + "  Keys:\n";
                $t = Bridge.getEnumerator(this.keys);
                try {
                    while ($t.moveNext()) {
                        var a = $t.Current;
                        result = (result || "") + (("    " + (a.toString() || "") + "\n") || "");
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }result = (result || "") + "  Symbols:\n";
                $t1 = Bridge.getEnumerator(this.keys);
                try {
                    while ($t1.moveNext()) {
                        var s = Bridge.cast($t1.Current, MidiSheetMusic.MusicSymbol);
                        result = (result || "") + (("    " + (s.toString() || "") + "\n") || "");
                    }
                } finally {
                    if (Bridge.is($t1, System.IDisposable)) {
                        $t1.System$IDisposable$dispose();
                    }
                }$t2 = Bridge.getEnumerator(this.symbols);
                try {
                    while ($t2.moveNext()) {
                        var m = $t2.Current;
                        result = (result || "") + (("    " + (m.toString() || "") + "\n") || "");
                    }
                } finally {
                    if (Bridge.is($t2, System.IDisposable)) {
                        $t2.System$IDisposable$dispose();
                    }
                }result = (result || "") + "End Staff\n";
                return result;
            }
        }
    });

    Bridge.define("MidiSheetMusic.Stem", {
        statics: {
            fields: {
                Up: 0,
                Down: 0,
                LeftSide: 0,
                RightSide: 0
            },
            ctors: {
                init: function () {
                    this.Up = 1;
                    this.Down = 2;
                    this.LeftSide = 1;
                    this.RightSide = 2;
                }
            }
        },
        fields: {
            duration: 0,
            direction: 0,
            top: null,
            bottom: null,
            end: null,
            notesoverlap: false,
            side: 0,
            pair: null,
            width_to_pair: 0,
            receiver_in_pair: false
        },
        props: {
            Direction: {
                get: function () {
                    return this.direction;
                },
                set: function (value) {
                    this.ChangeDirection(value);
                }
            },
            Duration: {
                get: function () {
                    return this.duration;
                }
            },
            Top: {
                get: function () {
                    return this.top;
                }
            },
            Bottom: {
                get: function () {
                    return this.bottom;
                }
            },
            End: {
                get: function () {
                    return this.end;
                },
                set: function (value) {
                    this.end = value;
                }
            },
            Receiver: {
                get: function () {
                    return this.receiver_in_pair;
                },
                set: function (value) {
                    this.receiver_in_pair = value;
                }
            },
            isBeam: {
                get: function () {
                    return this.receiver_in_pair || (this.pair != null);
                }
            }
        },
        ctors: {
            ctor: function (bottom, top, duration, direction, overlap) {
                this.$initialize();

                this.top = top;
                this.bottom = bottom;
                this.duration = duration;
                this.direction = direction;
                this.notesoverlap = overlap;
                if (direction === MidiSheetMusic.Stem.Up || this.notesoverlap) {
                    this.side = MidiSheetMusic.Stem.RightSide;
                } else {
                    this.side = MidiSheetMusic.Stem.LeftSide;
                }
                this.end = this.CalculateEnd();
                this.pair = null;
                this.width_to_pair = 0;
                this.receiver_in_pair = false;
            }
        },
        methods: {
            CalculateEnd: function () {
                if (this.direction === MidiSheetMusic.Stem.Up) {
                    var w = this.top;
                    w = w.Add(6);
                    if (this.duration === MidiSheetMusic.NoteDuration.Sixteenth) {
                        w = w.Add(2);
                    } else if (this.duration === MidiSheetMusic.NoteDuration.ThirtySecond) {
                        w = w.Add(4);
                    }
                    return w;
                } else if (this.direction === MidiSheetMusic.Stem.Down) {
                    var w1 = this.bottom;
                    w1 = w1.Add(-6);
                    if (this.duration === MidiSheetMusic.NoteDuration.Sixteenth) {
                        w1 = w1.Add(-2);
                    } else if (this.duration === MidiSheetMusic.NoteDuration.ThirtySecond) {
                        w1 = w1.Add(-4);
                    }
                    return w1;
                } else {
                    return null; /* Shouldn't happen */
                }
            },
            ChangeDirection: function (newdirection) {
                this.direction = newdirection;
                if (this.direction === MidiSheetMusic.Stem.Up || this.notesoverlap) {
                    this.side = MidiSheetMusic.Stem.RightSide;
                } else {
                    this.side = MidiSheetMusic.Stem.LeftSide;
                }
                this.end = this.CalculateEnd();
            },
            SetPair: function (pair, width_to_pair) {
                this.pair = pair;
                this.width_to_pair = width_to_pair;
            },
            Draw: function (g, pen, ytop, topstaff) {
                if (this.duration === MidiSheetMusic.NoteDuration.Whole) {
                    return;
                }

                this.DrawVerticalLine(g, pen, ytop, topstaff);
                if (this.duration === MidiSheetMusic.NoteDuration.Quarter || this.duration === MidiSheetMusic.NoteDuration.DottedQuarter || this.duration === MidiSheetMusic.NoteDuration.Half || this.duration === MidiSheetMusic.NoteDuration.DottedHalf || this.receiver_in_pair) {

                    return;
                }

                if (this.pair != null) {
                    this.DrawHorizBarStem(g, pen, ytop, topstaff);
                } else {
                    this.DrawCurvyStem(g, pen, ytop, topstaff);
                }
            },
            DrawVerticalLine: function (g, pen, ytop, topstaff) {
                var xstart;
                if (this.side === MidiSheetMusic.Stem.LeftSide) {
                    xstart = (((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0) + 1) | 0;
                } else {
                    xstart = (((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0) + MidiSheetMusic.SheetMusic.NoteWidth) | 0;
                }

                if (this.direction === MidiSheetMusic.Stem.Up) {
                    var y1 = (((ytop + ((Bridge.Int.div(Bridge.Int.mul(topstaff.Dist(this.bottom), MidiSheetMusic.SheetMusic.NoteHeight), 2)) | 0)) | 0) + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.NoteHeight, 4)) | 0)) | 0;

                    var ystem = (ytop + ((Bridge.Int.div(Bridge.Int.mul(topstaff.Dist(this.end), MidiSheetMusic.SheetMusic.NoteHeight), 2)) | 0)) | 0;

                    g.DrawLine(pen, xstart, y1, xstart, ystem);
                } else if (this.direction === MidiSheetMusic.Stem.Down) {
                    var y11 = (((ytop + ((Bridge.Int.div(Bridge.Int.mul(topstaff.Dist(this.top), MidiSheetMusic.SheetMusic.NoteHeight), 2)) | 0)) | 0) + MidiSheetMusic.SheetMusic.NoteHeight) | 0;

                    if (this.side === MidiSheetMusic.Stem.LeftSide) {
                        y11 = (y11 - ((Bridge.Int.div(MidiSheetMusic.SheetMusic.NoteHeight, 4)) | 0)) | 0;
                    } else {
                        y11 = (y11 - ((Bridge.Int.div(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0)) | 0;
                    }

                    var ystem1 = (((ytop + ((Bridge.Int.div(Bridge.Int.mul(topstaff.Dist(this.end), MidiSheetMusic.SheetMusic.NoteHeight), 2)) | 0)) | 0) + MidiSheetMusic.SheetMusic.NoteHeight) | 0;

                    g.DrawLine(pen, xstart, y11, xstart, ystem1);
                }
            },
            DrawCurvyStem: function (g, pen, ytop, topstaff) {

                pen.Width = 2;

                var xstart = 0;
                if (this.side === MidiSheetMusic.Stem.LeftSide) {
                    xstart = (((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0) + 1) | 0;
                } else {
                    xstart = (((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0) + MidiSheetMusic.SheetMusic.NoteWidth) | 0;
                }

                if (this.direction === MidiSheetMusic.Stem.Up) {
                    var ystem = (ytop + ((Bridge.Int.div(Bridge.Int.mul(topstaff.Dist(this.end), MidiSheetMusic.SheetMusic.NoteHeight), 2)) | 0)) | 0;


                    if (this.duration === MidiSheetMusic.NoteDuration.Eighth || this.duration === MidiSheetMusic.NoteDuration.DottedEighth || this.duration === MidiSheetMusic.NoteDuration.Triplet || this.duration === MidiSheetMusic.NoteDuration.Sixteenth || this.duration === MidiSheetMusic.NoteDuration.ThirtySecond) {

                        g.DrawBezier(pen, xstart, ystem, xstart, ((ystem + ((Bridge.Int.div(Bridge.Int.mul(3, MidiSheetMusic.SheetMusic.LineSpace), 2)) | 0)) | 0), ((xstart + Bridge.Int.mul(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0), ((ystem + Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0), ((xstart + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0)) | 0), ((ystem + Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 3)) | 0));
                    }
                    ystem = (ystem + MidiSheetMusic.SheetMusic.NoteHeight) | 0;

                    if (this.duration === MidiSheetMusic.NoteDuration.Sixteenth || this.duration === MidiSheetMusic.NoteDuration.ThirtySecond) {

                        g.DrawBezier(pen, xstart, ystem, xstart, ((ystem + ((Bridge.Int.div(Bridge.Int.mul(3, MidiSheetMusic.SheetMusic.LineSpace), 2)) | 0)) | 0), ((xstart + Bridge.Int.mul(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0), ((ystem + Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0), ((xstart + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0)) | 0), ((ystem + Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 3)) | 0));
                    }

                    ystem = (ystem + MidiSheetMusic.SheetMusic.NoteHeight) | 0;
                    if (this.duration === MidiSheetMusic.NoteDuration.ThirtySecond) {
                        g.DrawBezier(pen, xstart, ystem, xstart, ((ystem + ((Bridge.Int.div(Bridge.Int.mul(3, MidiSheetMusic.SheetMusic.LineSpace), 2)) | 0)) | 0), ((xstart + Bridge.Int.mul(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0), ((ystem + Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0), ((xstart + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0)) | 0), ((ystem + Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 3)) | 0));
                    }

                } else if (this.direction === MidiSheetMusic.Stem.Down) {
                    var ystem1 = (((ytop + ((Bridge.Int.div(Bridge.Int.mul(topstaff.Dist(this.end), MidiSheetMusic.SheetMusic.NoteHeight), 2)) | 0)) | 0) + MidiSheetMusic.SheetMusic.NoteHeight) | 0;

                    if (this.duration === MidiSheetMusic.NoteDuration.Eighth || this.duration === MidiSheetMusic.NoteDuration.DottedEighth || this.duration === MidiSheetMusic.NoteDuration.Triplet || this.duration === MidiSheetMusic.NoteDuration.Sixteenth || this.duration === MidiSheetMusic.NoteDuration.ThirtySecond) {

                        g.DrawBezier(pen, xstart, ystem1, xstart, ((ystem1 - MidiSheetMusic.SheetMusic.LineSpace) | 0), ((xstart + Bridge.Int.mul(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0), ((ystem1 - Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0), ((xstart + MidiSheetMusic.SheetMusic.LineSpace) | 0), ((((ystem1 - Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0) - ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0)) | 0));
                    }
                    ystem1 = (ystem1 - MidiSheetMusic.SheetMusic.NoteHeight) | 0;

                    if (this.duration === MidiSheetMusic.NoteDuration.Sixteenth || this.duration === MidiSheetMusic.NoteDuration.ThirtySecond) {

                        g.DrawBezier(pen, xstart, ystem1, xstart, ((ystem1 - MidiSheetMusic.SheetMusic.LineSpace) | 0), ((xstart + Bridge.Int.mul(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0), ((ystem1 - Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0), ((xstart + MidiSheetMusic.SheetMusic.LineSpace) | 0), ((((ystem1 - Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0) - ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0)) | 0));
                    }

                    ystem1 = (ystem1 - MidiSheetMusic.SheetMusic.NoteHeight) | 0;
                    if (this.duration === MidiSheetMusic.NoteDuration.ThirtySecond) {
                        g.DrawBezier(pen, xstart, ystem1, xstart, ((ystem1 - MidiSheetMusic.SheetMusic.LineSpace) | 0), ((xstart + Bridge.Int.mul(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0), ((ystem1 - Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0), ((xstart + MidiSheetMusic.SheetMusic.LineSpace) | 0), ((((ystem1 - Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0) - ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0)) | 0));
                    }

                }
                pen.Width = 1;

            },
            DrawHorizBarStem: function (g, pen, ytop, topstaff) {
                pen.Width = (Bridge.Int.div(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0;

                var xstart = 0;
                var xstart2 = 0;

                if (this.side === MidiSheetMusic.Stem.LeftSide) {
                    xstart = (((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0) + 1) | 0;
                } else {
                    if (this.side === MidiSheetMusic.Stem.RightSide) {
                        xstart = (((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0) + MidiSheetMusic.SheetMusic.NoteWidth) | 0;
                    }
                }

                if (this.pair.side === MidiSheetMusic.Stem.LeftSide) {
                    xstart2 = (((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0) + 1) | 0;
                } else {
                    if (this.pair.side === MidiSheetMusic.Stem.RightSide) {
                        xstart2 = (((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0) + MidiSheetMusic.SheetMusic.NoteWidth) | 0;
                    }
                }


                if (this.direction === MidiSheetMusic.Stem.Up) {
                    var xend = (this.width_to_pair + xstart2) | 0;
                    var ystart = (ytop + ((Bridge.Int.div(Bridge.Int.mul(topstaff.Dist(this.end), MidiSheetMusic.SheetMusic.NoteHeight), 2)) | 0)) | 0;
                    var yend = (ytop + ((Bridge.Int.div(Bridge.Int.mul(topstaff.Dist(this.pair.end), MidiSheetMusic.SheetMusic.NoteHeight), 2)) | 0)) | 0;

                    if (this.duration === MidiSheetMusic.NoteDuration.Eighth || this.duration === MidiSheetMusic.NoteDuration.DottedEighth || this.duration === MidiSheetMusic.NoteDuration.Triplet || this.duration === MidiSheetMusic.NoteDuration.Sixteenth || this.duration === MidiSheetMusic.NoteDuration.ThirtySecond) {

                        g.DrawLine(pen, xstart, ystart, xend, yend);
                    }
                    ystart = (ystart + MidiSheetMusic.SheetMusic.NoteHeight) | 0;
                    yend = (yend + MidiSheetMusic.SheetMusic.NoteHeight) | 0;

                    /* A dotted eighth will connect to a 16th note. */
                    if (this.duration === MidiSheetMusic.NoteDuration.DottedEighth) {
                        var x = (xend - MidiSheetMusic.SheetMusic.NoteHeight) | 0;
                        var slope = (((yend - ystart) | 0)) * 1.0 / (((xend - xstart) | 0));
                        var y = Bridge.Int.clip32(slope * (((x - xend) | 0)) + yend);

                        g.DrawLine(pen, x, y, xend, yend);
                    }

                    if (this.duration === MidiSheetMusic.NoteDuration.Sixteenth || this.duration === MidiSheetMusic.NoteDuration.ThirtySecond) {

                        g.DrawLine(pen, xstart, ystart, xend, yend);
                    }
                    ystart = (ystart + MidiSheetMusic.SheetMusic.NoteHeight) | 0;
                    yend = (yend + MidiSheetMusic.SheetMusic.NoteHeight) | 0;

                    if (this.duration === MidiSheetMusic.NoteDuration.ThirtySecond) {
                        g.DrawLine(pen, xstart, ystart, xend, yend);
                    }
                } else {
                    var xend1 = (this.width_to_pair + xstart2) | 0;
                    var ystart1 = (((ytop + ((Bridge.Int.div(Bridge.Int.mul(topstaff.Dist(this.end), MidiSheetMusic.SheetMusic.NoteHeight), 2)) | 0)) | 0) + MidiSheetMusic.SheetMusic.NoteHeight) | 0;
                    var yend1 = (((ytop + ((Bridge.Int.div(Bridge.Int.mul(topstaff.Dist(this.pair.end), MidiSheetMusic.SheetMusic.NoteHeight), 2)) | 0)) | 0) + MidiSheetMusic.SheetMusic.NoteHeight) | 0;

                    if (this.duration === MidiSheetMusic.NoteDuration.Eighth || this.duration === MidiSheetMusic.NoteDuration.DottedEighth || this.duration === MidiSheetMusic.NoteDuration.Triplet || this.duration === MidiSheetMusic.NoteDuration.Sixteenth || this.duration === MidiSheetMusic.NoteDuration.ThirtySecond) {

                        g.DrawLine(pen, xstart, ystart1, xend1, yend1);
                    }
                    ystart1 = (ystart1 - MidiSheetMusic.SheetMusic.NoteHeight) | 0;
                    yend1 = (yend1 - MidiSheetMusic.SheetMusic.NoteHeight) | 0;

                    /* A dotted eighth will connect to a 16th note. */
                    if (this.duration === MidiSheetMusic.NoteDuration.DottedEighth) {
                        var x1 = (xend1 - MidiSheetMusic.SheetMusic.NoteHeight) | 0;
                        var slope1 = (((yend1 - ystart1) | 0)) * 1.0 / (((xend1 - xstart) | 0));
                        var y1 = Bridge.Int.clip32(slope1 * (((x1 - xend1) | 0)) + yend1);

                        g.DrawLine(pen, x1, y1, xend1, yend1);
                    }

                    if (this.duration === MidiSheetMusic.NoteDuration.Sixteenth || this.duration === MidiSheetMusic.NoteDuration.ThirtySecond) {

                        g.DrawLine(pen, xstart, ystart1, xend1, yend1);
                    }
                    ystart1 = (ystart1 - MidiSheetMusic.SheetMusic.NoteHeight) | 0;
                    yend1 = (yend1 - MidiSheetMusic.SheetMusic.NoteHeight) | 0;

                    if (this.duration === MidiSheetMusic.NoteDuration.ThirtySecond) {
                        g.DrawLine(pen, xstart, ystart1, xend1, yend1);
                    }
                }
                pen.Width = 1;
            },
            toString: function () {
                return System.String.format("Stem duration={0} direction={1} top={2} bottom={3} end={4} overlap={5} side={6} width_to_pair={7} receiver_in_pair={8}", Bridge.box(this.duration, MidiSheetMusic.NoteDuration, System.Enum.toStringFn(MidiSheetMusic.NoteDuration)), Bridge.box(this.direction, System.Int32), this.top.toString(), this.bottom.toString(), this.end.toString(), Bridge.box(this.notesoverlap, System.Boolean, System.Boolean.toString), Bridge.box(this.side, System.Int32), Bridge.box(this.width_to_pair, System.Int32), Bridge.box(this.receiver_in_pair, System.Boolean, System.Boolean.toString));
            }
        }
    });

    Bridge.define("MidiSheetMusic.StemDir", {
        $kind: "enum",
        statics: {
            fields: {
                Up: 0,
                Down: 1
            }
        }
    });

    Bridge.define("MidiSheetMusic.SymbolWidths", {
        statics: {
            methods: {
                GetTrackWidths: function (symbols) {
                    var $t;
                    var widths = new (System.Collections.Generic.Dictionary$2(System.Int32,System.Int32))();

                    $t = Bridge.getEnumerator(symbols);
                    try {
                        while ($t.moveNext()) {
                            var m = $t.Current;
                            var start = m.StartTime;
                            var w = m.MinWidth;

                            if (Bridge.is(m, MidiSheetMusic.BarSymbol)) {
                                continue;
                            } else if (widths.containsKey(start)) {
                                widths.set(start, (widths.get(start) + w) | 0);
                            } else {
                                widths.set(start, w);
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }return widths;
                }
            }
        },
        fields: {
            widths: null,
            maxwidths: null,
            starttimes: null
        },
        props: {
            StartTimes: {
                get: function () {
                    return this.starttimes;
                }
            }
        },
        ctors: {
            ctor: function (tracks, tracklyrics) {
                var $t, $t1, $t2, $t3;
                this.$initialize();

                /* Get the symbol widths for all the tracks */
                this.widths = System.Array.init(tracks.length, null, System.Collections.Generic.Dictionary$2(System.Int32,System.Int32));
                for (var track = 0; track < tracks.length; track = (track + 1) | 0) {
                    this.widths[System.Array.index(track, this.widths)] = MidiSheetMusic.SymbolWidths.GetTrackWidths(tracks[System.Array.index(track, tracks)]);
                }
                this.maxwidths = new (System.Collections.Generic.Dictionary$2(System.Int32,System.Int32))();

                /* Calculate the maximum symbol widths */
                $t = Bridge.getEnumerator(this.widths);
                try {
                    while ($t.moveNext()) {
                        var dict = $t.Current;
                        $t1 = Bridge.getEnumerator(dict.getKeys(), System.Int32);
                        try {
                            while ($t1.moveNext()) {
                                var time = $t1.Current;
                                if (!this.maxwidths.containsKey(time) || (this.maxwidths.get(time) < dict.get(time))) {

                                    this.maxwidths.set(time, dict.get(time));
                                }
                            }
                        } finally {
                            if (Bridge.is($t1, System.IDisposable)) {
                                $t1.System$IDisposable$dispose();
                            }
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }
                if (tracklyrics != null) {
                    $t2 = Bridge.getEnumerator(tracklyrics);
                    try {
                        while ($t2.moveNext()) {
                            var lyrics = $t2.Current;
                            if (lyrics == null) {
                                continue;
                            }
                            $t3 = Bridge.getEnumerator(lyrics);
                            try {
                                while ($t3.moveNext()) {
                                    var lyric = $t3.Current;
                                    var width = lyric.MinWidth;
                                    var time1 = lyric.StartTime;
                                    if (!this.maxwidths.containsKey(time1) || (this.maxwidths.get(time1) < width)) {

                                        this.maxwidths.set(time1, width);
                                    }
                                }
                            } finally {
                                if (Bridge.is($t3, System.IDisposable)) {
                                    $t3.System$IDisposable$dispose();
                                }
                            }
                        }
                    } finally {
                        if (Bridge.is($t2, System.IDisposable)) {
                            $t2.System$IDisposable$dispose();
                        }
                    }}

                /* Store all the start times to the starttime array */
                this.starttimes = System.Array.init(System.Array.getCount(this.maxwidths.getKeys(), System.Int32), 0, System.Int32);
                System.Array.copyTo(this.maxwidths.getKeys(), this.starttimes, 0, System.Int32);
                System.Array.sort(this.starttimes);
            }
        },
        methods: {
            GetExtraWidth: function (track, start) {
                if (!this.widths[System.Array.index(track, this.widths)].containsKey(start)) {
                    return this.maxwidths.get(start);
                } else {
                    return ((this.maxwidths.get(start) - this.widths[System.Array.index(track, this.widths)].get(start)) | 0);
                }
            }
        }
    });

    Bridge.define("MidiSheetMusic.TimeSignature", {
        statics: {
            methods: {
                GetStemDuration: function (dur) {
                    if (dur === MidiSheetMusic.NoteDuration.DottedHalf) {
                        return MidiSheetMusic.NoteDuration.Half;
                    } else {
                        if (dur === MidiSheetMusic.NoteDuration.DottedQuarter) {
                            return MidiSheetMusic.NoteDuration.Quarter;
                        } else {
                            if (dur === MidiSheetMusic.NoteDuration.DottedEighth) {
                                return MidiSheetMusic.NoteDuration.Eighth;
                            } else {
                                return dur;
                            }
                        }
                    }
                }
            }
        },
        fields: {
            numerator: 0,
            denominator: 0,
            quarternote: 0,
            measure: 0,
            tempo: 0
        },
        props: {
            Numerator: {
                get: function () {
                    return this.numerator;
                }
            },
            Denominator: {
                get: function () {
                    return this.denominator;
                }
            },
            Quarter: {
                get: function () {
                    return this.quarternote;
                }
            },
            Measure: {
                get: function () {
                    return this.measure;
                }
            },
            Tempo: {
                get: function () {
                    return this.tempo;
                }
            }
        },
        ctors: {
            ctor: function (numerator, denominator, quarternote, tempo) {
                this.$initialize();
                if (numerator <= 0 || denominator <= 0 || quarternote <= 0) {
                    throw new MidiSheetMusic.MidiFileException("Invalid time signature", 0);
                }

                /* Midi File gives wrong time signature sometimes */
                if (numerator === 5) {
                    numerator = 4;
                }

                this.numerator = numerator;
                this.denominator = denominator;
                this.quarternote = quarternote;
                this.tempo = tempo;

                var beat;
                if (denominator < 4) {
                    beat = Bridge.Int.mul(quarternote, 2);
                } else {
                    beat = (Bridge.Int.div(quarternote, (((Bridge.Int.div(denominator, 4)) | 0)))) | 0;
                }

                this.measure = Bridge.Int.mul(numerator, beat);
            }
        },
        methods: {
            GetMeasure: function (time) {
                return ((Bridge.Int.div(time, this.measure)) | 0);
            },
            GetNoteDuration: function (duration) {
                var whole = Bridge.Int.mul(this.quarternote, 4);


                if (duration >= ((Bridge.Int.div(Bridge.Int.mul(28, whole), 32)) | 0)) {
                    return MidiSheetMusic.NoteDuration.Whole;
                } else {
                    if (duration >= ((Bridge.Int.div(Bridge.Int.mul(20, whole), 32)) | 0)) {
                        return MidiSheetMusic.NoteDuration.DottedHalf;
                    } else {
                        if (duration >= ((Bridge.Int.div(Bridge.Int.mul(14, whole), 32)) | 0)) {
                            return MidiSheetMusic.NoteDuration.Half;
                        } else {
                            if (duration >= ((Bridge.Int.div(Bridge.Int.mul(10, whole), 32)) | 0)) {
                                return MidiSheetMusic.NoteDuration.DottedQuarter;
                            } else {
                                if (duration >= ((Bridge.Int.div(Bridge.Int.mul(7, whole), 32)) | 0)) {
                                    return MidiSheetMusic.NoteDuration.Quarter;
                                } else {
                                    if (duration >= ((Bridge.Int.div(Bridge.Int.mul(5, whole), 32)) | 0)) {
                                        return MidiSheetMusic.NoteDuration.DottedEighth;
                                    } else {
                                        if (duration >= ((Bridge.Int.div(Bridge.Int.mul(6, whole), 64)) | 0)) {
                                            return MidiSheetMusic.NoteDuration.Eighth;
                                        } else {
                                            if (duration >= ((Bridge.Int.div(Bridge.Int.mul(5, whole), 64)) | 0)) {
                                                return MidiSheetMusic.NoteDuration.Triplet;
                                            } else {
                                                if (duration >= ((Bridge.Int.div(Bridge.Int.mul(3, whole), 64)) | 0)) {
                                                    return MidiSheetMusic.NoteDuration.Sixteenth;
                                                } else {
                                                    return MidiSheetMusic.NoteDuration.ThirtySecond;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            DurationToTime: function (dur) {
                var eighth = (Bridge.Int.div(this.quarternote, 2)) | 0;
                var sixteenth = (Bridge.Int.div(eighth, 2)) | 0;

                switch (dur) {
                    case MidiSheetMusic.NoteDuration.Whole: 
                        return Bridge.Int.mul(this.quarternote, 4);
                    case MidiSheetMusic.NoteDuration.DottedHalf: 
                        return Bridge.Int.mul(this.quarternote, 3);
                    case MidiSheetMusic.NoteDuration.Half: 
                        return Bridge.Int.mul(this.quarternote, 2);
                    case MidiSheetMusic.NoteDuration.DottedQuarter: 
                        return Bridge.Int.mul(3, eighth);
                    case MidiSheetMusic.NoteDuration.Quarter: 
                        return this.quarternote;
                    case MidiSheetMusic.NoteDuration.DottedEighth: 
                        return Bridge.Int.mul(3, sixteenth);
                    case MidiSheetMusic.NoteDuration.Eighth: 
                        return eighth;
                    case MidiSheetMusic.NoteDuration.Triplet: 
                        return ((Bridge.Int.div(this.quarternote, 3)) | 0);
                    case MidiSheetMusic.NoteDuration.Sixteenth: 
                        return sixteenth;
                    case MidiSheetMusic.NoteDuration.ThirtySecond: 
                        return ((Bridge.Int.div(sixteenth, 2)) | 0);
                    default: 
                        return 0;
                }
            },
            toString: function () {
                return System.String.format("TimeSignature={0}/{1} quarter={2} tempo={3}", Bridge.box(this.numerator, System.Int32), Bridge.box(this.denominator, System.Int32), Bridge.box(this.quarternote, System.Int32), Bridge.box(this.tempo, System.Int32));
            }
        }
    });

    Bridge.define("MidiSheetMusic.WhiteNote", {
        inherits: function () { return [System.Collections.Generic.IComparer$1(MidiSheetMusic.WhiteNote)]; },
        statics: {
            fields: {
                A: 0,
                B: 0,
                C: 0,
                D: 0,
                E: 0,
                F: 0,
                G: 0,
                TopTreble: null,
                BottomTreble: null,
                TopBass: null,
                BottomBass: null,
                MiddleC: null
            },
            ctors: {
                init: function () {
                    this.A = 0;
                    this.B = 1;
                    this.C = 2;
                    this.D = 3;
                    this.E = 4;
                    this.F = 5;
                    this.G = 6;
                    this.TopTreble = new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.E, 5);
                    this.BottomTreble = new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.F, 4);
                    this.TopBass = new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.G, 3);
                    this.BottomBass = new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.A, 3);
                    this.MiddleC = new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.C, 4);
                }
            },
            methods: {
                Max: function (x, y) {
                    if (x.Dist(y) > 0) {
                        return x;
                    } else {
                        return y;
                    }
                },
                Min: function (x, y) {
                    if (x.Dist(y) < 0) {
                        return x;
                    } else {
                        return y;
                    }
                },
                Top: function (clef) {
                    if (clef === MidiSheetMusic.Clef.Treble) {
                        return MidiSheetMusic.WhiteNote.TopTreble;
                    } else {
                        return MidiSheetMusic.WhiteNote.TopBass;
                    }
                },
                Bottom: function (clef) {
                    if (clef === MidiSheetMusic.Clef.Treble) {
                        return MidiSheetMusic.WhiteNote.BottomTreble;
                    } else {
                        return MidiSheetMusic.WhiteNote.BottomBass;
                    }
                }
            }
        },
        fields: {
            letter: 0,
            octave: 0
        },
        props: {
            Letter: {
                get: function () {
                    return this.letter;
                }
            },
            Octave: {
                get: function () {
                    return this.octave;
                }
            }
        },
        alias: ["compare", ["System$Collections$Generic$IComparer$1$MidiSheetMusic$WhiteNote$compare", "System$Collections$Generic$IComparer$1$compare"]],
        ctors: {
            ctor: function (letter, octave) {
                this.$initialize();
                if (!(letter >= 0 && letter <= 6)) {
                    throw new System.ArgumentException("Letter " + letter + " is incorrect");
                }

                this.letter = letter;
                this.octave = octave;
            }
        },
        methods: {
            Dist: function (w) {
                return ((Bridge.Int.mul((((this.octave - w.octave) | 0)), 7) + (((this.letter - w.letter) | 0))) | 0);
            },
            Add: function (amount) {
                var num = (Bridge.Int.mul(this.octave, 7) + this.letter) | 0;
                num = (num + amount) | 0;
                if (num < 0) {
                    num = 0;
                }
                return new MidiSheetMusic.WhiteNote(num % 7, ((Bridge.Int.div(num, 7)) | 0));
            },
            Number: function () {
                var offset = 0;
                switch (this.letter) {
                    case MidiSheetMusic.WhiteNote.A: 
                        offset = MidiSheetMusic.NoteScale.A;
                        break;
                    case MidiSheetMusic.WhiteNote.B: 
                        offset = MidiSheetMusic.NoteScale.B;
                        break;
                    case MidiSheetMusic.WhiteNote.C: 
                        offset = MidiSheetMusic.NoteScale.C;
                        break;
                    case MidiSheetMusic.WhiteNote.D: 
                        offset = MidiSheetMusic.NoteScale.D;
                        break;
                    case MidiSheetMusic.WhiteNote.E: 
                        offset = MidiSheetMusic.NoteScale.E;
                        break;
                    case MidiSheetMusic.WhiteNote.F: 
                        offset = MidiSheetMusic.NoteScale.F;
                        break;
                    case MidiSheetMusic.WhiteNote.G: 
                        offset = MidiSheetMusic.NoteScale.G;
                        break;
                    default: 
                        offset = 0;
                        break;
                }
                return MidiSheetMusic.NoteScale.ToNumber(offset, this.octave);
            },
            compare: function (x, y) {
                return x.Dist(y);
            },
            toString: function () {
                var s = System.Array.init([
                    "A", 
                    "B", 
                    "C", 
                    "D", 
                    "E", 
                    "F", 
                    "G"
                ], System.String);
                return (s[System.Array.index(this.letter, s)] || "") + this.octave;
            }
        }
    });

    Bridge.define("MidiSheetMusic.AccidSymbol", {
        inherits: [MidiSheetMusic.MusicSymbol],
        fields: {
            accid: 0,
            whitenote: null,
            clef: 0,
            width: 0
        },
        props: {
            Note: {
                get: function () {
                    return this.whitenote;
                }
            },
            StartTime: {
                get: function () {
                    return -1;
                }
            },
            MinWidth: {
                get: function () {
                    return ((Bridge.Int.div(Bridge.Int.mul(3, MidiSheetMusic.SheetMusic.NoteHeight), 2)) | 0);
                }
            },
            Width: {
                get: function () {
                    return this.width;
                },
                set: function (value) {
                    this.width = value;
                }
            },
            AboveStaff: {
                get: function () {
                    return this.GetAboveStaff();
                }
            },
            BelowStaff: {
                get: function () {
                    return this.GetBelowStaff();
                }
            }
        },
        ctors: {
            ctor: function (accid, note, clef) {
                this.$initialize();
                MidiSheetMusic.MusicSymbol.ctor.call(this);
                this.accid = accid;
                this.whitenote = note;
                this.clef = clef;
                this.width = this.MinWidth;
            }
        },
        methods: {
            GetAboveStaff: function () {
                var dist = (Bridge.Int.div(Bridge.Int.mul(MidiSheetMusic.WhiteNote.Top(this.clef).Dist(this.whitenote), MidiSheetMusic.SheetMusic.NoteHeight), 2)) | 0;
                if (this.accid === MidiSheetMusic.Accid.Sharp || this.accid === MidiSheetMusic.Accid.Natural) {
                    dist = (dist - MidiSheetMusic.SheetMusic.NoteHeight) | 0;
                } else {
                    if (this.accid === MidiSheetMusic.Accid.Flat) {
                        dist = (dist - (((Bridge.Int.div(Bridge.Int.mul(3, MidiSheetMusic.SheetMusic.NoteHeight), 2)) | 0))) | 0;
                    }
                }

                if (dist < 0) {
                    return ((-dist) | 0);
                } else {
                    return 0;
                }
            },
            GetBelowStaff: function () {
                var dist = (((Bridge.Int.div(Bridge.Int.mul(MidiSheetMusic.WhiteNote.Bottom(this.clef).Dist(this.whitenote), MidiSheetMusic.SheetMusic.NoteHeight), 2)) | 0) + MidiSheetMusic.SheetMusic.NoteHeight) | 0;
                if (this.accid === MidiSheetMusic.Accid.Sharp || this.accid === MidiSheetMusic.Accid.Natural) {
                    dist = (dist + MidiSheetMusic.SheetMusic.NoteHeight) | 0;
                }

                if (dist > 0) {
                    return dist;
                } else {
                    return 0;
                }
            },
            Draw: function (g, pen, ytop) {
                /* Align the symbol to the right */
                g.TranslateTransform(((this.Width - this.MinWidth) | 0), 0);

                /* Store the y-pixel value of the top of the whitenote in ynote. */
                var ynote = (ytop + ((Bridge.Int.div(Bridge.Int.mul(MidiSheetMusic.WhiteNote.Top(this.clef).Dist(this.whitenote), MidiSheetMusic.SheetMusic.NoteHeight), 2)) | 0)) | 0;

                if (this.accid === MidiSheetMusic.Accid.Sharp) {
                    this.DrawSharp(g, pen, ynote);
                } else {
                    if (this.accid === MidiSheetMusic.Accid.Flat) {
                        this.DrawFlat(g, pen, ynote);
                    } else {
                        if (this.accid === MidiSheetMusic.Accid.Natural) {
                            this.DrawNatural(g, pen, ynote);
                        }
                    }
                }

                g.TranslateTransform(((-(((this.Width - this.MinWidth) | 0))) | 0), 0);
            },
            DrawSharp: function (g, pen, ynote) {

                /* Draw the two vertical lines */
                var ystart = (ynote - MidiSheetMusic.SheetMusic.NoteHeight) | 0;
                var yend = (ynote + Bridge.Int.mul(2, MidiSheetMusic.SheetMusic.NoteHeight)) | 0;
                var x = (Bridge.Int.div(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0;
                pen.Width = 1;
                g.DrawLine(pen, x, ((ystart + 2) | 0), x, yend);
                x = (x + (((Bridge.Int.div(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0))) | 0;
                g.DrawLine(pen, x, ystart, x, ((yend - 2) | 0));

                /* Draw the slightly upwards horizontal lines */
                var xstart = (((Bridge.Int.div(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0) - ((Bridge.Int.div(MidiSheetMusic.SheetMusic.NoteHeight, 4)) | 0)) | 0;
                var xend = (MidiSheetMusic.SheetMusic.NoteHeight + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.NoteHeight, 4)) | 0)) | 0;
                ystart = (ynote + MidiSheetMusic.SheetMusic.LineWidth) | 0;
                yend = (((ystart - MidiSheetMusic.SheetMusic.LineWidth) | 0) - ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0)) | 0;
                pen.Width = (Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0;
                g.DrawLine(pen, xstart, ystart, xend, yend);
                ystart = (ystart + MidiSheetMusic.SheetMusic.LineSpace) | 0;
                yend = (yend + MidiSheetMusic.SheetMusic.LineSpace) | 0;
                g.DrawLine(pen, xstart, ystart, xend, yend);
                pen.Width = 1;
            },
            DrawFlat: function (g, pen, ynote) {
                var x = (Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0;

                /* Draw the vertical line */
                pen.Width = 1;
                g.DrawLine(pen, x, ((((ynote - MidiSheetMusic.SheetMusic.NoteHeight) | 0) - ((Bridge.Int.div(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0)) | 0), x, ((ynote + MidiSheetMusic.SheetMusic.NoteHeight) | 0));

                /* Draw 3 bezier curves.
                  All 3 curves start and stop at the same points.
                  Each subsequent curve bulges more and more towards 
                  the topright corner, making the curve look thicker
                  towards the top-right.
                */
                g.DrawBezier(pen, x, ((ynote + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0)) | 0), ((x + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0)) | 0), ((ynote - ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0)) | 0), ((x + MidiSheetMusic.SheetMusic.LineSpace) | 0), ((ynote + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 3)) | 0)) | 0), x, ((((((ynote + MidiSheetMusic.SheetMusic.LineSpace) | 0) + MidiSheetMusic.SheetMusic.LineWidth) | 0) + 1) | 0));

                g.DrawBezier(pen, x, ((ynote + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0)) | 0), ((x + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0)) | 0), ((ynote - ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0)) | 0), ((((x + MidiSheetMusic.SheetMusic.LineSpace) | 0) + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0)) | 0), ((((ynote + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 3)) | 0)) | 0) - ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0)) | 0), x, ((((((ynote + MidiSheetMusic.SheetMusic.LineSpace) | 0) + MidiSheetMusic.SheetMusic.LineWidth) | 0) + 1) | 0));


                g.DrawBezier(pen, x, ((ynote + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0)) | 0), ((x + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0)) | 0), ((ynote - ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0)) | 0), ((((x + MidiSheetMusic.SheetMusic.LineSpace) | 0) + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0)) | 0), ((((ynote + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 3)) | 0)) | 0) - ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0)) | 0), x, ((((((ynote + MidiSheetMusic.SheetMusic.LineSpace) | 0) + MidiSheetMusic.SheetMusic.LineWidth) | 0) + 1) | 0));


            },
            DrawNatural: function (g, pen, ynote) {

                /* Draw the two vertical lines */
                var ystart = (((ynote - MidiSheetMusic.SheetMusic.LineSpace) | 0) - MidiSheetMusic.SheetMusic.LineWidth) | 0;
                var yend = (((ynote + MidiSheetMusic.SheetMusic.LineSpace) | 0) + MidiSheetMusic.SheetMusic.LineWidth) | 0;
                var x = (Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0;
                pen.Width = 1;
                g.DrawLine(pen, x, ystart, x, yend);
                x = (x + (((MidiSheetMusic.SheetMusic.LineSpace - ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0)) | 0))) | 0;
                ystart = (ynote - ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0)) | 0;
                yend = (((((ynote + Bridge.Int.mul(2, MidiSheetMusic.SheetMusic.LineSpace)) | 0) + MidiSheetMusic.SheetMusic.LineWidth) | 0) - ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0)) | 0;
                g.DrawLine(pen, x, ystart, x, yend);

                /* Draw the slightly upwards horizontal lines */
                var xstart = (Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0;
                var xend = (((xstart + MidiSheetMusic.SheetMusic.LineSpace) | 0) - ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0)) | 0;
                ystart = (ynote + MidiSheetMusic.SheetMusic.LineWidth) | 0;
                yend = (((ystart - MidiSheetMusic.SheetMusic.LineWidth) | 0) - ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0)) | 0;
                pen.Width = (Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0;
                g.DrawLine(pen, xstart, ystart, xend, yend);
                ystart = (ystart + MidiSheetMusic.SheetMusic.LineSpace) | 0;
                yend = (yend + MidiSheetMusic.SheetMusic.LineSpace) | 0;
                g.DrawLine(pen, xstart, ystart, xend, yend);
                pen.Width = 1;
            },
            toString: function () {
                return System.String.format("AccidSymbol accid={0} whitenote={1} clef={2} width={3}", Bridge.box(this.accid, MidiSheetMusic.Accid, System.Enum.toStringFn(MidiSheetMusic.Accid)), this.whitenote, Bridge.box(this.clef, MidiSheetMusic.Clef, System.Enum.toStringFn(MidiSheetMusic.Clef)), Bridge.box(this.width, System.Int32));
            }
        }
    });

    Bridge.define("MidiSheetMusic.BarSymbol", {
        inherits: [MidiSheetMusic.MusicSymbol],
        fields: {
            starttime: 0,
            width: 0
        },
        props: {
            StartTime: {
                get: function () {
                    return this.starttime;
                }
            },
            MinWidth: {
                get: function () {
                    return Bridge.Int.mul(2, MidiSheetMusic.SheetMusic.LineSpace);
                }
            },
            Width: {
                get: function () {
                    return this.width;
                },
                set: function (value) {
                    this.width = value;
                }
            },
            AboveStaff: {
                get: function () {
                    return 0;
                }
            },
            BelowStaff: {
                get: function () {
                    return 0;
                }
            }
        },
        ctors: {
            ctor: function (starttime) {
                this.$initialize();
                MidiSheetMusic.MusicSymbol.ctor.call(this);
                this.starttime = starttime;
                this.width = this.MinWidth;
            }
        },
        methods: {
            Draw: function (g, pen, ytop) {
                var y = ytop;
                var yend = (((y + Bridge.Int.mul(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0) + 4) | 0;
                pen.Width = 1;
                g.DrawLine(pen, ((Bridge.Int.div(MidiSheetMusic.SheetMusic.NoteWidth, 2)) | 0), y, ((Bridge.Int.div(MidiSheetMusic.SheetMusic.NoteWidth, 2)) | 0), yend);

            },
            toString: function () {
                return System.String.format("BarSymbol starttime={0} width={1}", Bridge.box(this.starttime, System.Int32), Bridge.box(this.width, System.Int32));
            }
        }
    });

    Bridge.define("MidiSheetMusic.Bitmap", {
        inherits: [MidiSheetMusic.Image],
        ctors: {
            ctor: function (type, filename) {
                this.$initialize();
                MidiSheetMusic.Image.ctor.call(this, type, filename);

            }
        }
    });

    Bridge.define("MidiSheetMusic.BlankSymbol", {
        inherits: [MidiSheetMusic.MusicSymbol],
        fields: {
            starttime: 0,
            width: 0
        },
        props: {
            StartTime: {
                get: function () {
                    return this.starttime;
                }
            },
            MinWidth: {
                get: function () {
                    return 0;
                }
            },
            Width: {
                get: function () {
                    return this.width;
                },
                set: function (value) {
                    this.width = value;
                }
            },
            AboveStaff: {
                get: function () {
                    return 0;
                }
            },
            BelowStaff: {
                get: function () {
                    return 0;
                }
            }
        },
        ctors: {
            ctor: function (starttime, width) {
                this.$initialize();
                MidiSheetMusic.MusicSymbol.ctor.call(this);
                this.starttime = starttime;
                this.width = width;
            }
        },
        methods: {
            Draw: function (g, pen, ytop) { },
            toString: function () {
                return System.String.format("BlankSymbol starttime={0} width={1}", Bridge.box(this.starttime, System.Int32), Bridge.box(this.width, System.Int32));
            }
        }
    });

    Bridge.define("MidiSheetMusic.ChordSymbol", {
        inherits: [MidiSheetMusic.MusicSymbol],
        statics: {
            methods: {
                CreateNoteData: function (midinotes, key, time) {

                    var len = midinotes.Count;
                    var notedata = System.Array.init(len, null, MidiSheetMusic.NoteData);

                    for (var i = 0; i < len; i = (i + 1) | 0) {
                        var midi = midinotes.getItem(i);
                        notedata[System.Array.index(i, notedata)] = new MidiSheetMusic.NoteData();
                        notedata[System.Array.index(i, notedata)].number = midi.Number;
                        notedata[System.Array.index(i, notedata)].leftside = true;
                        notedata[System.Array.index(i, notedata)].whitenote = key.GetWhiteNote(midi.Number);
                        notedata[System.Array.index(i, notedata)].duration = time.GetNoteDuration(((midi.EndTime - midi.StartTime) | 0));
                        notedata[System.Array.index(i, notedata)].accid = key.GetAccidental(midi.Number, ((Bridge.Int.div(midi.StartTime, time.Measure)) | 0));

                        if (i > 0 && (notedata[System.Array.index(i, notedata)].whitenote.Dist(notedata[System.Array.index(((i - 1) | 0), notedata)].whitenote) === 1)) {
                            /* This note (notedata[i]) overlaps with the previous note.
                              Change the side of this note.
                            */

                            if (notedata[System.Array.index(((i - 1) | 0), notedata)].leftside) {
                                notedata[System.Array.index(i, notedata)].leftside = false;
                            } else {
                                notedata[System.Array.index(i, notedata)].leftside = true;
                            }
                        } else {
                            notedata[System.Array.index(i, notedata)].leftside = true;
                        }
                    }
                    return notedata;
                },
                CreateAccidSymbols: function (notedata, clef) {
                    var $t, $t1;
                    var count = 0;
                    $t = Bridge.getEnumerator(notedata);
                    try {
                        while ($t.moveNext()) {
                            var n = $t.Current;
                            if (n.accid !== MidiSheetMusic.Accid.None) {
                                count = (count + 1) | 0;
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }var symbols = System.Array.init(count, null, MidiSheetMusic.AccidSymbol);
                    var i = 0;
                    $t1 = Bridge.getEnumerator(notedata);
                    try {
                        while ($t1.moveNext()) {
                            var n1 = $t1.Current;
                            if (n1.accid !== MidiSheetMusic.Accid.None) {
                                symbols[System.Array.index(i, symbols)] = new MidiSheetMusic.AccidSymbol(n1.accid, n1.whitenote, clef);
                                i = (i + 1) | 0;
                            }
                        }
                    } finally {
                        if (Bridge.is($t1, System.IDisposable)) {
                            $t1.System$IDisposable$dispose();
                        }
                    }return symbols;
                },
                StemDirection: function (bottom, top, clef) {
                    var middle;
                    if (clef === MidiSheetMusic.Clef.Treble) {
                        middle = new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.B, 5);
                    } else {
                        middle = new MidiSheetMusic.WhiteNote(MidiSheetMusic.WhiteNote.D, 3);
                    }

                    var dist = (middle.Dist(bottom) + middle.Dist(top)) | 0;
                    if (dist >= 0) {
                        return MidiSheetMusic.Stem.Up;
                    } else {
                        return MidiSheetMusic.Stem.Down;
                    }
                },
                NotesOverlap: function (notedata, start, end) {
                    for (var i = start; i < end; i = (i + 1) | 0) {
                        if (!notedata[System.Array.index(i, notedata)].leftside) {
                            return true;
                        }
                    }
                    return false;
                },
                CanCreateBeam: function (chords, time, startQuarter) {
                    var $t, $t1;
                    var numChords = chords.length;
                    var firstStem = chords[System.Array.index(0, chords)].Stem;
                    var lastStem = chords[System.Array.index(((chords.length - 1) | 0), chords)].Stem;
                    if (firstStem == null || lastStem == null) {
                        return false;
                    }
                    var measure = (Bridge.Int.div(chords[System.Array.index(0, chords)].StartTime, time.Measure)) | 0;
                    var dur = firstStem.Duration;
                    var dur2 = lastStem.Duration;

                    var dotted8_to_16 = false;
                    if (chords.length === 2 && dur === MidiSheetMusic.NoteDuration.DottedEighth && dur2 === MidiSheetMusic.NoteDuration.Sixteenth) {
                        dotted8_to_16 = true;
                    }

                    if (dur === MidiSheetMusic.NoteDuration.Whole || dur === MidiSheetMusic.NoteDuration.Half || dur === MidiSheetMusic.NoteDuration.DottedHalf || dur === MidiSheetMusic.NoteDuration.Quarter || dur === MidiSheetMusic.NoteDuration.DottedQuarter || (dur === MidiSheetMusic.NoteDuration.DottedEighth && !dotted8_to_16)) {

                        return false;
                    }

                    if (numChords === 6) {
                        if (dur !== MidiSheetMusic.NoteDuration.Eighth) {
                            return false;
                        }
                        var correctTime = ((time.Numerator === 3 && time.Denominator === 4) || (time.Numerator === 6 && time.Denominator === 8) || (time.Numerator === 6 && time.Denominator === 4));

                        if (!correctTime) {
                            return false;
                        }

                        if (time.Numerator === 6 && time.Denominator === 4) {
                            /* first chord must start at 1st or 4th quarter note */
                            var beat = Bridge.Int.mul(time.Quarter, 3);
                            if ((chords[System.Array.index(0, chords)].StartTime % beat) > ((Bridge.Int.div(time.Quarter, 6)) | 0)) {
                                return false;
                            }
                        }
                    } else if (numChords === 4) {
                        if (time.Numerator === 3 && time.Denominator === 8) {
                            return false;
                        }
                        var correctTime1 = (time.Numerator === 2 || time.Numerator === 4 || time.Numerator === 8);
                        if (!correctTime1 && dur !== MidiSheetMusic.NoteDuration.Sixteenth) {
                            return false;
                        }

                        /* chord must start on quarter note */
                        var beat1 = time.Quarter;
                        if (dur === MidiSheetMusic.NoteDuration.Eighth) {
                            /* 8th note chord must start on 1st or 3rd quarter note */
                            beat1 = Bridge.Int.mul(time.Quarter, 2);
                        } else if (dur === MidiSheetMusic.NoteDuration.ThirtySecond) {
                            /* 32nd note must start on an 8th beat */
                            beat1 = (Bridge.Int.div(time.Quarter, 2)) | 0;
                        }

                        if ((chords[System.Array.index(0, chords)].StartTime % beat1) > ((Bridge.Int.div(time.Quarter, 6)) | 0)) {
                            return false;
                        }
                    } else if (numChords === 3) {
                        var valid = (dur === MidiSheetMusic.NoteDuration.Triplet) || (dur === MidiSheetMusic.NoteDuration.Eighth && time.Numerator === 12 && time.Denominator === 8);
                        if (!valid) {
                            return false;
                        }

                        /* chord must start on quarter note */
                        var beat2 = time.Quarter;
                        if (time.Numerator === 12 && time.Denominator === 8) {
                            /* In 12/8 time, chord must start on 3*8th beat */
                            beat2 = Bridge.Int.mul(((Bridge.Int.div(time.Quarter, 2)) | 0), 3);
                        }
                        if ((chords[System.Array.index(0, chords)].StartTime % beat2) > ((Bridge.Int.div(time.Quarter, 6)) | 0)) {
                            return false;
                        }
                    } else if (numChords === 2) {
                        if (startQuarter) {
                            var beat3 = time.Quarter;
                            if ((chords[System.Array.index(0, chords)].StartTime % beat3) > ((Bridge.Int.div(time.Quarter, 6)) | 0)) {
                                return false;
                            }
                        }
                    }

                    $t = Bridge.getEnumerator(chords);
                    try {
                        while ($t.moveNext()) {
                            var chord = $t.Current;
                            if ((((Bridge.Int.div(chord.StartTime, time.Measure)) | 0)) !== measure) {
                                return false;
                            }
                            if (chord.Stem == null) {
                                return false;
                            }
                            if (chord.Stem.Duration !== dur && !dotted8_to_16) {
                                return false;
                            }
                            if (chord.Stem.isBeam) {
                                return false;
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }
                    /* Check that all stems can point in same direction */
                    var hasTwoStems = false;
                    var direction = MidiSheetMusic.Stem.Up;
                    $t1 = Bridge.getEnumerator(chords);
                    try {
                        while ($t1.moveNext()) {
                            var chord1 = $t1.Current;
                            if (chord1.HasTwoStems) {
                                if (hasTwoStems && chord1.Stem.Direction !== direction) {
                                    return false;
                                }
                                hasTwoStems = true;
                                direction = chord1.Stem.Direction;
                            }
                        }
                    } finally {
                        if (Bridge.is($t1, System.IDisposable)) {
                            $t1.System$IDisposable$dispose();
                        }
                    }
                    /* Get the final stem direction */
                    if (!hasTwoStems) {
                        var note1;
                        var note2;
                        note1 = (firstStem.Direction === MidiSheetMusic.Stem.Up ? firstStem.Top : firstStem.Bottom);
                        note2 = (lastStem.Direction === MidiSheetMusic.Stem.Up ? lastStem.Top : lastStem.Bottom);
                        direction = MidiSheetMusic.ChordSymbol.StemDirection(note1, note2, chords[System.Array.index(0, chords)].Clef);
                    }

                    /* If the notes are too far apart, don't use a beam */
                    if (direction === MidiSheetMusic.Stem.Up) {
                        if (Math.abs(firstStem.Top.Dist(lastStem.Top)) >= 11) {
                            return false;
                        }
                    } else {
                        if (Math.abs(firstStem.Bottom.Dist(lastStem.Bottom)) >= 11) {
                            return false;
                        }
                    }
                    return true;
                },
                CreateBeam: function (chords, spacing) {
                    var $t, $t1;
                    var firstStem = chords[System.Array.index(0, chords)].Stem;
                    var lastStem = chords[System.Array.index(((chords.length - 1) | 0), chords)].Stem;

                    /* Calculate the new stem direction */
                    var newdirection = -1;
                    $t = Bridge.getEnumerator(chords);
                    try {
                        while ($t.moveNext()) {
                            var chord = $t.Current;
                            if (chord.HasTwoStems) {
                                newdirection = chord.Stem.Direction;
                                break;
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }
                    if (newdirection === -1) {
                        var note1;
                        var note2;
                        note1 = (firstStem.Direction === MidiSheetMusic.Stem.Up ? firstStem.Top : firstStem.Bottom);
                        note2 = (lastStem.Direction === MidiSheetMusic.Stem.Up ? lastStem.Top : lastStem.Bottom);
                        newdirection = MidiSheetMusic.ChordSymbol.StemDirection(note1, note2, chords[System.Array.index(0, chords)].Clef);
                    }
                    $t1 = Bridge.getEnumerator(chords);
                    try {
                        while ($t1.moveNext()) {
                            var chord1 = $t1.Current;
                            chord1.Stem.Direction = newdirection;
                        }
                    } finally {
                        if (Bridge.is($t1, System.IDisposable)) {
                            $t1.System$IDisposable$dispose();
                        }
                    }
                    if (chords.length === 2) {
                        MidiSheetMusic.ChordSymbol.BringStemsCloser(chords);
                    } else {
                        MidiSheetMusic.ChordSymbol.LineUpStemEnds(chords);
                    }

                    firstStem.SetPair(lastStem, spacing);
                    for (var i = 1; i < chords.length; i = (i + 1) | 0) {
                        chords[System.Array.index(i, chords)].Stem.Receiver = true;
                    }
                },
                BringStemsCloser: function (chords) {
                    var firstStem = chords[System.Array.index(0, chords)].Stem;
                    var lastStem = chords[System.Array.index(1, chords)].Stem;

                    /* If we're connecting a dotted 8th to a 16th, increase
                      the stem end of the dotted eighth.
                    */
                    if (firstStem.Duration === MidiSheetMusic.NoteDuration.DottedEighth && lastStem.Duration === MidiSheetMusic.NoteDuration.Sixteenth) {
                        if (firstStem.Direction === MidiSheetMusic.Stem.Up) {
                            firstStem.End = firstStem.End.Add(2);
                        } else {
                            firstStem.End = firstStem.End.Add(-2);
                        }
                    }

                    /* Bring the stem ends closer together */
                    var distance = Math.abs(firstStem.End.Dist(lastStem.End));
                    if (firstStem.Direction === MidiSheetMusic.Stem.Up) {
                        if (Bridge.referenceEquals(MidiSheetMusic.WhiteNote.Max(firstStem.End, lastStem.End), firstStem.End)) {
                            lastStem.End = lastStem.End.Add(((Bridge.Int.div(distance, 2)) | 0));
                        } else {
                            firstStem.End = firstStem.End.Add(((Bridge.Int.div(distance, 2)) | 0));
                        }
                    } else {
                        if (Bridge.referenceEquals(MidiSheetMusic.WhiteNote.Min(firstStem.End, lastStem.End), firstStem.End)) {
                            lastStem.End = lastStem.End.Add(((Bridge.Int.div(((-distance) | 0), 2)) | 0));
                        } else {
                            firstStem.End = firstStem.End.Add(((Bridge.Int.div(((-distance) | 0), 2)) | 0));
                        }
                    }
                },
                LineUpStemEnds: function (chords) {
                    var $t, $t1;
                    var firstStem = chords[System.Array.index(0, chords)].Stem;
                    var lastStem = chords[System.Array.index(((chords.length - 1) | 0), chords)].Stem;
                    var middleStem = chords[System.Array.index(1, chords)].Stem;

                    if (firstStem.Direction === MidiSheetMusic.Stem.Up) {
                        /* Find the highest stem. The beam will either:
                          - Slant downwards (first stem is highest)
                          - Slant upwards (last stem is highest)
                          - Be straight (middle stem is highest)
                        */
                        var top = firstStem.End;
                        $t = Bridge.getEnumerator(chords);
                        try {
                            while ($t.moveNext()) {
                                var chord = $t.Current;
                                top = MidiSheetMusic.WhiteNote.Max(top, chord.Stem.End);
                            }
                        } finally {
                            if (Bridge.is($t, System.IDisposable)) {
                                $t.System$IDisposable$dispose();
                            }
                        }if (Bridge.referenceEquals(top, firstStem.End) && top.Dist(lastStem.End) >= 2) {
                            firstStem.End = top;
                            middleStem.End = top.Add(-1);
                            lastStem.End = top.Add(-2);
                        } else if (Bridge.referenceEquals(top, lastStem.End) && top.Dist(firstStem.End) >= 2) {
                            firstStem.End = top.Add(-2);
                            middleStem.End = top.Add(-1);
                            lastStem.End = top;
                        } else {
                            firstStem.End = top;
                            middleStem.End = top;
                            lastStem.End = top;
                        }
                    } else {
                        /* Find the bottommost stem. The beam will either:
                          - Slant upwards (first stem is lowest)
                          - Slant downwards (last stem is lowest)
                          - Be straight (middle stem is highest)
                        */
                        var bottom = firstStem.End;
                        $t1 = Bridge.getEnumerator(chords);
                        try {
                            while ($t1.moveNext()) {
                                var chord1 = $t1.Current;
                                bottom = MidiSheetMusic.WhiteNote.Min(bottom, chord1.Stem.End);
                            }
                        } finally {
                            if (Bridge.is($t1, System.IDisposable)) {
                                $t1.System$IDisposable$dispose();
                            }
                        }
                        if (Bridge.referenceEquals(bottom, firstStem.End) && lastStem.End.Dist(bottom) >= 2) {
                            middleStem.End = bottom.Add(1);
                            lastStem.End = bottom.Add(2);
                        } else if (Bridge.referenceEquals(bottom, lastStem.End) && firstStem.End.Dist(bottom) >= 2) {
                            middleStem.End = bottom.Add(1);
                            firstStem.End = bottom.Add(2);
                        } else {
                            firstStem.End = bottom;
                            middleStem.End = bottom;
                            lastStem.End = bottom;
                        }
                    }

                    /* All middle stems have the same end */
                    for (var i = 1; i < ((chords.length - 1) | 0); i = (i + 1) | 0) {
                        var stem = chords[System.Array.index(i, chords)].Stem;
                        stem.End = middleStem.End;
                    }
                }
            }
        },
        fields: {
            clef: 0,
            starttime: 0,
            endtime: 0,
            notedata: null,
            accidsymbols: null,
            width: 0,
            stem1: null,
            stem2: null,
            hastwostems: false,
            sheetmusic: null
        },
        props: {
            StartTime: {
                get: function () {
                    return this.starttime;
                }
            },
            EndTime: {
                get: function () {
                    return this.endtime;
                }
            },
            Clef: {
                get: function () {
                    return this.clef;
                }
            },
            HasTwoStems: {
                get: function () {
                    return this.hastwostems;
                }
            },
            Stem: {
                get: function () {
                    if (this.stem1 == null) {
                        return this.stem2;
                    } else if (this.stem2 == null) {
                        return this.stem1;
                    } else if (this.stem1.Duration < this.stem2.Duration) {
                        return this.stem1;
                    } else {
                        return this.stem2;
                    }
                }
            },
            Width: {
                get: function () {
                    return this.width;
                },
                set: function (value) {
                    this.width = value;
                }
            },
            MinWidth: {
                get: function () {
                    return this.GetMinWidth();
                }
            },
            AboveStaff: {
                get: function () {
                    return this.GetAboveStaff();
                }
            },
            BelowStaff: {
                get: function () {
                    return this.GetBelowStaff();
                }
            }
        },
        ctors: {
            ctor: function (midinotes, key, time, c, sheet) {
                this.$initialize();
                MidiSheetMusic.MusicSymbol.ctor.call(this);

                var len = midinotes.Count;
                var i;

                this.hastwostems = false;
                this.clef = c;
                this.sheetmusic = sheet;

                this.starttime = midinotes.getItem(0).StartTime;
                this.endtime = midinotes.getItem(0).EndTime;

                for (i = 0; i < midinotes.Count; i = (i + 1) | 0) {
                    if (i > 1) {
                        if (midinotes.getItem(i).Number < midinotes.getItem(((i - 1) | 0)).Number) {
                            throw new System.ArgumentException("Chord notes not in increasing order by number");
                        }
                    }
                    this.endtime = Math.max(this.endtime, midinotes.getItem(i).EndTime);
                }

                this.notedata = MidiSheetMusic.ChordSymbol.CreateNoteData(midinotes, key, time);
                this.accidsymbols = MidiSheetMusic.ChordSymbol.CreateAccidSymbols(this.notedata, this.clef);


                /* Find out how many stems we need (1 or 2) */
                var dur1 = this.notedata[System.Array.index(0, this.notedata)].duration;
                var dur2 = dur1;
                var change = -1;
                for (i = 0; i < this.notedata.length; i = (i + 1) | 0) {
                    dur2 = this.notedata[System.Array.index(i, this.notedata)].duration;
                    if (dur1 !== dur2) {
                        change = i;
                        break;
                    }
                }

                if (dur1 !== dur2) {
                    /* We have notes with different durations.  So we will need
                      two stems.  The first stem points down, and contains the
                      bottom note up to the note with the different duration.

                      The second stem points up, and contains the note with the
                      different duration up to the top note.
                    */
                    this.hastwostems = true;
                    this.stem1 = new MidiSheetMusic.Stem(this.notedata[System.Array.index(0, this.notedata)].whitenote, this.notedata[System.Array.index(((change - 1) | 0), this.notedata)].whitenote, dur1, MidiSheetMusic.Stem.Down, MidiSheetMusic.ChordSymbol.NotesOverlap(this.notedata, 0, change));

                    this.stem2 = new MidiSheetMusic.Stem(this.notedata[System.Array.index(change, this.notedata)].whitenote, this.notedata[System.Array.index(((this.notedata.length - 1) | 0), this.notedata)].whitenote, dur2, MidiSheetMusic.Stem.Up, MidiSheetMusic.ChordSymbol.NotesOverlap(this.notedata, change, this.notedata.length));
                } else {
                    /* All notes have the same duration, so we only need one stem. */
                    var direction = MidiSheetMusic.ChordSymbol.StemDirection(this.notedata[System.Array.index(0, this.notedata)].whitenote, this.notedata[System.Array.index(((this.notedata.length - 1) | 0), this.notedata)].whitenote, this.clef);

                    this.stem1 = new MidiSheetMusic.Stem(this.notedata[System.Array.index(0, this.notedata)].whitenote, this.notedata[System.Array.index(((this.notedata.length - 1) | 0), this.notedata)].whitenote, dur1, direction, MidiSheetMusic.ChordSymbol.NotesOverlap(this.notedata, 0, this.notedata.length));
                    this.stem2 = null;
                }

                /* For whole notes, no stem is drawn. */
                if (dur1 === MidiSheetMusic.NoteDuration.Whole) {
                    this.stem1 = null;
                }
                if (dur2 === MidiSheetMusic.NoteDuration.Whole) {
                    this.stem2 = null;
                }

                this.width = this.MinWidth;
            }
        },
        methods: {
            GetMinWidth: function () {
                /* The width needed for the note circles */
                var result = (Bridge.Int.mul(2, MidiSheetMusic.SheetMusic.NoteHeight) + ((Bridge.Int.div(Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 3), 4)) | 0)) | 0;

                if (this.accidsymbols.length > 0) {
                    result = (result + this.accidsymbols[System.Array.index(0, this.accidsymbols)].MinWidth) | 0;
                    for (var i = 1; i < this.accidsymbols.length; i = (i + 1) | 0) {
                        var accid = this.accidsymbols[System.Array.index(i, this.accidsymbols)];
                        var prev = this.accidsymbols[System.Array.index(((i - 1) | 0), this.accidsymbols)];
                        if (accid.Note.Dist(prev.Note) < 6) {
                            result = (result + accid.MinWidth) | 0;
                        }
                    }
                }
                if (this.sheetmusic != null && this.sheetmusic.ShowNoteLetters !== MidiSheetMusic.MidiOptions.NoteNameNone) {
                    result = (result + 8) | 0;
                }
                return result;
            },
            GetAboveStaff: function () {
                var $t;
                /* Find the topmost note in the chord */
                var topnote = this.notedata[System.Array.index(((this.notedata.length - 1) | 0), this.notedata)].whitenote;

                /* The stem.End is the note position where the stem ends.
                  Check if the stem end is higher than the top note.
                */
                if (this.stem1 != null) {
                    topnote = MidiSheetMusic.WhiteNote.Max(topnote, this.stem1.End);
                }
                if (this.stem2 != null) {
                    topnote = MidiSheetMusic.WhiteNote.Max(topnote, this.stem2.End);
                }

                var dist = (Bridge.Int.div(Bridge.Int.mul(topnote.Dist(MidiSheetMusic.WhiteNote.Top(this.clef)), MidiSheetMusic.SheetMusic.NoteHeight), 2)) | 0;
                var result = 0;
                if (dist > 0) {
                    result = dist;
                }

                /* Check if any accidental symbols extend above the staff */
                $t = Bridge.getEnumerator(this.accidsymbols);
                try {
                    while ($t.moveNext()) {
                        var symbol = $t.Current;
                        if (symbol.AboveStaff > result) {
                            result = symbol.AboveStaff;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }return result;
            },
            GetBelowStaff: function () {
                var $t;
                /* Find the bottom note in the chord */
                var bottomnote = this.notedata[System.Array.index(0, this.notedata)].whitenote;

                /* The stem.End is the note position where the stem ends.
                  Check if the stem end is lower than the bottom note.
                */
                if (this.stem1 != null) {
                    bottomnote = MidiSheetMusic.WhiteNote.Min(bottomnote, this.stem1.End);
                }
                if (this.stem2 != null) {
                    bottomnote = MidiSheetMusic.WhiteNote.Min(bottomnote, this.stem2.End);
                }

                var dist = (Bridge.Int.div(Bridge.Int.mul(MidiSheetMusic.WhiteNote.Bottom(this.clef).Dist(bottomnote), MidiSheetMusic.SheetMusic.NoteHeight), 2)) | 0;

                var result = 0;
                if (dist > 0) {
                    result = dist;
                }

                /* Check if any accidental symbols extend below the staff */
                $t = Bridge.getEnumerator(this.accidsymbols);
                try {
                    while ($t.moveNext()) {
                        var symbol = $t.Current;
                        if (symbol.BelowStaff > result) {
                            result = symbol.BelowStaff;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }return result;
            },
            NoteName: function (notenumber, whitenote) {
                if (this.sheetmusic.ShowNoteLetters === MidiSheetMusic.MidiOptions.NoteNameLetter) {
                    return this.Letter(notenumber, whitenote);
                } else if (this.sheetmusic.ShowNoteLetters === MidiSheetMusic.MidiOptions.NoteNameFixedDoReMi) {
                    var fixedDoReMi = System.Array.init([
                        "La", 
                        "Li", 
                        "Ti", 
                        "Do", 
                        "Di", 
                        "Re", 
                        "Ri", 
                        "Mi", 
                        "Fa", 
                        "Fi", 
                        "So", 
                        "Si"
                    ], System.String);
                    var notescale = MidiSheetMusic.NoteScale.FromNumber(notenumber);
                    return fixedDoReMi[System.Array.index(notescale, fixedDoReMi)];
                } else if (this.sheetmusic.ShowNoteLetters === MidiSheetMusic.MidiOptions.NoteNameMovableDoReMi) {
                    var fixedDoReMi1 = System.Array.init([
                        "La", 
                        "Li", 
                        "Ti", 
                        "Do", 
                        "Di", 
                        "Re", 
                        "Ri", 
                        "Mi", 
                        "Fa", 
                        "Fi", 
                        "So", 
                        "Si"
                    ], System.String);
                    var mainscale = this.sheetmusic.MainKey.Notescale();
                    var diff = (MidiSheetMusic.NoteScale.C - mainscale) | 0;
                    notenumber = (notenumber + diff) | 0;
                    if (notenumber < 0) {
                        notenumber = (notenumber + 12) | 0;
                    }
                    var notescale1 = MidiSheetMusic.NoteScale.FromNumber(notenumber);
                    return fixedDoReMi1[System.Array.index(notescale1, fixedDoReMi1)];
                } else if (this.sheetmusic.ShowNoteLetters === MidiSheetMusic.MidiOptions.NoteNameFixedNumber) {
                    var num = System.Array.init([
                        "10", 
                        "11", 
                        "12", 
                        "1", 
                        "2", 
                        "3", 
                        "4", 
                        "5", 
                        "6", 
                        "7", 
                        "8", 
                        "9"
                    ], System.String);
                    var notescale2 = MidiSheetMusic.NoteScale.FromNumber(notenumber);
                    return num[System.Array.index(notescale2, num)];
                } else if (this.sheetmusic.ShowNoteLetters === MidiSheetMusic.MidiOptions.NoteNameMovableNumber) {
                    var num1 = System.Array.init([
                        "10", 
                        "11", 
                        "12", 
                        "1", 
                        "2", 
                        "3", 
                        "4", 
                        "5", 
                        "6", 
                        "7", 
                        "8", 
                        "9"
                    ], System.String);
                    var mainscale1 = this.sheetmusic.MainKey.Notescale();
                    var diff1 = (MidiSheetMusic.NoteScale.C - mainscale1) | 0;
                    notenumber = (notenumber + diff1) | 0;
                    if (notenumber < 0) {
                        notenumber = (notenumber + 12) | 0;
                    }
                    var notescale3 = MidiSheetMusic.NoteScale.FromNumber(notenumber);
                    return num1[System.Array.index(notescale3, num1)];
                } else {
                    return "";
                }
            },
            Letter: function (notenumber, whitenote) {
                var notescale = MidiSheetMusic.NoteScale.FromNumber(notenumber);
                switch (notescale) {
                    case MidiSheetMusic.NoteScale.A: 
                        return "A";
                    case MidiSheetMusic.NoteScale.B: 
                        return "B";
                    case MidiSheetMusic.NoteScale.C: 
                        return "C";
                    case MidiSheetMusic.NoteScale.D: 
                        return "D";
                    case MidiSheetMusic.NoteScale.E: 
                        return "E";
                    case MidiSheetMusic.NoteScale.F: 
                        return "F";
                    case MidiSheetMusic.NoteScale.G: 
                        return "G";
                    case MidiSheetMusic.NoteScale.Asharp: 
                        if (whitenote.Letter === MidiSheetMusic.WhiteNote.A) {
                            return "A#";
                        } else {
                            return "Bb";
                        }
                    case MidiSheetMusic.NoteScale.Csharp: 
                        if (whitenote.Letter === MidiSheetMusic.WhiteNote.C) {
                            return "C#";
                        } else {
                            return "Db";
                        }
                    case MidiSheetMusic.NoteScale.Dsharp: 
                        if (whitenote.Letter === MidiSheetMusic.WhiteNote.D) {
                            return "D#";
                        } else {
                            return "Eb";
                        }
                    case MidiSheetMusic.NoteScale.Fsharp: 
                        if (whitenote.Letter === MidiSheetMusic.WhiteNote.F) {
                            return "F#";
                        } else {
                            return "Gb";
                        }
                    case MidiSheetMusic.NoteScale.Gsharp: 
                        if (whitenote.Letter === MidiSheetMusic.WhiteNote.G) {
                            return "G#";
                        } else {
                            return "Ab";
                        }
                    default: 
                        return "";
                }
            },
            Draw: function (g, pen, ytop) {
                /* Align the chord to the right */
                g.TranslateTransform(((this.Width - this.MinWidth) | 0), 0);

                /* Draw the accidentals. */
                var topstaff = MidiSheetMusic.WhiteNote.Top(this.clef);
                var xpos = this.DrawAccid(g, pen, ytop);

                /* Draw the notes */
                g.TranslateTransform(xpos, 0);
                this.DrawNotes(g, pen, ytop, topstaff);
                if (this.sheetmusic != null && this.sheetmusic.ShowNoteLetters !== 0) {
                    this.DrawNoteLetters(g, pen, ytop, topstaff);
                }

                /* Draw the stems */
                if (this.stem1 != null) {
                    this.stem1.Draw(g, pen, ytop, topstaff);
                }
                if (this.stem2 != null) {
                    this.stem2.Draw(g, pen, ytop, topstaff);
                }

                g.TranslateTransform(((-xpos) | 0), 0);
                g.TranslateTransform(((-(((this.Width - this.MinWidth) | 0))) | 0), 0);
            },
            DrawAccid: function (g, pen, ytop) {
                var $t;
                var xpos = 0;

                var prev = null;
                $t = Bridge.getEnumerator(this.accidsymbols);
                try {
                    while ($t.moveNext()) {
                        var symbol = $t.Current;
                        if (prev != null && symbol.Note.Dist(prev.Note) < 6) {
                            xpos = (xpos + symbol.Width) | 0;
                        }
                        g.TranslateTransform(xpos, 0);
                        symbol.Draw(g, pen, ytop);
                        g.TranslateTransform(((-xpos) | 0), 0);
                        prev = symbol;
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }if (prev != null) {
                    xpos = (xpos + prev.Width) | 0;
                }
                return xpos;
            },
            DrawNotes: function (g, pen, ytop, topstaff) {
                var $t;
                pen.Width = 1;
                $t = Bridge.getEnumerator(this.notedata);
                try {
                    while ($t.moveNext()) {
                        var note = $t.Current;
                        /* Get the x,y position to draw the note */
                        var ynote = (ytop + ((Bridge.Int.div(Bridge.Int.mul(topstaff.Dist(note.whitenote), MidiSheetMusic.SheetMusic.NoteHeight), 2)) | 0)) | 0;

                        var xnote = (Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0;
                        if (!note.leftside) {
                            xnote = (xnote + MidiSheetMusic.SheetMusic.NoteWidth) | 0;
                        }

                        /* Draw rotated ellipse.  You must first translate (0,0)
                          to the center of the ellipse.
                        */
                        g.TranslateTransform(((((xnote + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.NoteWidth, 2)) | 0)) | 0) + 1) | 0), ((((ynote - MidiSheetMusic.SheetMusic.LineWidth) | 0) + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0)) | 0));
                        g.RotateTransform(-45);

                        if (this.sheetmusic != null) {
                            pen.Color = this.sheetmusic.NoteColor(note.number);
                        } else {
                            pen.Color = MidiSheetMusic.Color.Black;
                        }

                        if (note.duration === MidiSheetMusic.NoteDuration.Whole || note.duration === MidiSheetMusic.NoteDuration.Half || note.duration === MidiSheetMusic.NoteDuration.DottedHalf) {

                            g.DrawEllipse(pen, ((Bridge.Int.div(((-MidiSheetMusic.SheetMusic.NoteWidth) | 0), 2)) | 0), ((Bridge.Int.div(((-MidiSheetMusic.SheetMusic.NoteHeight) | 0), 2)) | 0), MidiSheetMusic.SheetMusic.NoteWidth, ((MidiSheetMusic.SheetMusic.NoteHeight - 1) | 0));

                            g.DrawEllipse(pen, ((Bridge.Int.div(((-MidiSheetMusic.SheetMusic.NoteWidth) | 0), 2)) | 0), ((((Bridge.Int.div(((-MidiSheetMusic.SheetMusic.NoteHeight) | 0), 2)) | 0) + 1) | 0), MidiSheetMusic.SheetMusic.NoteWidth, ((MidiSheetMusic.SheetMusic.NoteHeight - 2) | 0));

                            g.DrawEllipse(pen, ((Bridge.Int.div(((-MidiSheetMusic.SheetMusic.NoteWidth) | 0), 2)) | 0), ((((Bridge.Int.div(((-MidiSheetMusic.SheetMusic.NoteHeight) | 0), 2)) | 0) + 1) | 0), MidiSheetMusic.SheetMusic.NoteWidth, ((MidiSheetMusic.SheetMusic.NoteHeight - 3) | 0));

                        } else {
                            var brush = MidiSheetMusic.Brushes.Black;
                            if (!Bridge.referenceEquals(pen.Color, MidiSheetMusic.Color.Black)) {
                                brush = new MidiSheetMusic.SolidBrush(pen.Color);
                            }
                            g.FillEllipse(brush, ((Bridge.Int.div(((-MidiSheetMusic.SheetMusic.NoteWidth) | 0), 2)) | 0), ((Bridge.Int.div(((-MidiSheetMusic.SheetMusic.NoteHeight) | 0), 2)) | 0), MidiSheetMusic.SheetMusic.NoteWidth, ((MidiSheetMusic.SheetMusic.NoteHeight - 1) | 0));
                            if (!Bridge.referenceEquals(pen.Color, MidiSheetMusic.Color.Black)) {
                                brush.Dispose();
                            }
                        }

                        pen.Color = MidiSheetMusic.Color.Black;
                        g.DrawEllipse(pen, ((Bridge.Int.div(((-MidiSheetMusic.SheetMusic.NoteWidth) | 0), 2)) | 0), ((Bridge.Int.div(((-MidiSheetMusic.SheetMusic.NoteHeight) | 0), 2)) | 0), MidiSheetMusic.SheetMusic.NoteWidth, ((MidiSheetMusic.SheetMusic.NoteHeight - 1) | 0));

                        g.RotateTransform(45);
                        g.TranslateTransform(((-(((((xnote + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.NoteWidth, 2)) | 0)) | 0) + 1) | 0))) | 0), ((-(((((ynote - MidiSheetMusic.SheetMusic.LineWidth) | 0) + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0)) | 0))) | 0));

                        /* Draw a dot if this is a dotted duration. */
                        if (note.duration === MidiSheetMusic.NoteDuration.DottedHalf || note.duration === MidiSheetMusic.NoteDuration.DottedQuarter || note.duration === MidiSheetMusic.NoteDuration.DottedEighth) {

                            g.FillEllipse(MidiSheetMusic.Brushes.Black, ((((xnote + MidiSheetMusic.SheetMusic.NoteWidth) | 0) + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 3)) | 0)) | 0), ((ynote + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 3)) | 0)) | 0), 4, 4);

                        }

                        /* Draw horizontal lines if note is above/below the staff */
                        var top = topstaff.Add(1);
                        var dist = note.whitenote.Dist(top);
                        var y = (ytop - MidiSheetMusic.SheetMusic.LineWidth) | 0;

                        if (dist >= 2) {
                            for (var i = 2; i <= dist; i = (i + 2) | 0) {
                                y = (y - MidiSheetMusic.SheetMusic.NoteHeight) | 0;
                                g.DrawLine(pen, ((xnote - ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0)) | 0), y, ((((xnote + MidiSheetMusic.SheetMusic.NoteWidth) | 0) + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0)) | 0), y);
                            }
                        }

                        var bottom = top.Add(-8);
                        y = (((ytop + Bridge.Int.mul((((MidiSheetMusic.SheetMusic.LineSpace + MidiSheetMusic.SheetMusic.LineWidth) | 0)), 4)) | 0) - 1) | 0;
                        dist = bottom.Dist(note.whitenote);
                        if (dist >= 2) {
                            for (var i1 = 2; i1 <= dist; i1 = (i1 + 2) | 0) {
                                y = (y + MidiSheetMusic.SheetMusic.NoteHeight) | 0;
                                g.DrawLine(pen, ((xnote - ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0)) | 0), y, ((((xnote + MidiSheetMusic.SheetMusic.NoteWidth) | 0) + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0)) | 0), y);
                            }
                        }
                        /* End drawing horizontal lines */

                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }},
            DrawNoteLetters: function (g, pen, ytop, topstaff) {
                var $t;
                var overlap = MidiSheetMusic.ChordSymbol.NotesOverlap(this.notedata, 0, this.notedata.length);
                pen.Width = 1;

                $t = Bridge.getEnumerator(this.notedata);
                try {
                    while ($t.moveNext()) {
                        var note = $t.Current;
                        if (!note.leftside) {
                            /* There's not enought pixel room to show the letter */
                            continue;
                        }

                        /* Get the x,y position to draw the note */
                        var ynote = (ytop + ((Bridge.Int.div(Bridge.Int.mul(topstaff.Dist(note.whitenote), MidiSheetMusic.SheetMusic.NoteHeight), 2)) | 0)) | 0;

                        /* Draw the letter to the right side of the note */
                        var xnote = (MidiSheetMusic.SheetMusic.NoteWidth + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 4)) | 0)) | 0;

                        if (note.duration === MidiSheetMusic.NoteDuration.DottedHalf || note.duration === MidiSheetMusic.NoteDuration.DottedQuarter || note.duration === MidiSheetMusic.NoteDuration.DottedEighth || overlap) {

                            xnote = (xnote + (((Bridge.Int.div(MidiSheetMusic.SheetMusic.NoteWidth, 2)) | 0))) | 0;
                        }
                        g.DrawString(this.NoteName(note.number, note.whitenote), MidiSheetMusic.SheetMusic.LetterFont, MidiSheetMusic.Brushes.Black, xnote, ((ynote - ((Bridge.Int.div(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0)) | 0));
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }},
            toString: function () {
                var $t, $t1;
                var result = System.String.format("ChordSymbol clef={0} start={1} end={2} width={3} hastwostems={4} ", Bridge.box(this.clef, MidiSheetMusic.Clef, System.Enum.toStringFn(MidiSheetMusic.Clef)), Bridge.box(this.StartTime, System.Int32), Bridge.box(this.EndTime, System.Int32), Bridge.box(this.Width, System.Int32), Bridge.box(this.hastwostems, System.Boolean, System.Boolean.toString));
                $t = Bridge.getEnumerator(this.accidsymbols);
                try {
                    while ($t.moveNext()) {
                        var symbol = $t.Current;
                        result = (result || "") + (((symbol.toString() || "") + " ") || "");
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }$t1 = Bridge.getEnumerator(this.notedata);
                try {
                    while ($t1.moveNext()) {
                        var note = $t1.Current;
                        result = (result || "") + ((System.String.format("Note whitenote={0} duration={1} leftside={2} ", note.whitenote, Bridge.box(note.duration, MidiSheetMusic.NoteDuration, System.Enum.toStringFn(MidiSheetMusic.NoteDuration)), Bridge.box(note.leftside, System.Boolean, System.Boolean.toString))) || "");
                    }
                } finally {
                    if (Bridge.is($t1, System.IDisposable)) {
                        $t1.System$IDisposable$dispose();
                    }
                }if (this.stem1 != null) {
                    result = (result || "") + (((this.stem1.toString() || "") + " ") || "");
                }
                if (this.stem2 != null) {
                    result = (result || "") + (((this.stem2.toString() || "") + " ") || "");
                }
                return result;
            }
        }
    });

    Bridge.define("MidiSheetMusic.ClefSymbol", {
        inherits: [MidiSheetMusic.MusicSymbol],
        statics: {
            fields: {
                treble: null,
                bass: null
            },
            methods: {
                LoadImages: function () {
                    if (MidiSheetMusic.ClefSymbol.treble == null) {
                        MidiSheetMusic.ClefSymbol.treble = new MidiSheetMusic.Bitmap(MidiSheetMusic.ClefSymbol, "Resources.Images.treble.png");
                    }

                    if (MidiSheetMusic.ClefSymbol.bass == null) {
                        MidiSheetMusic.ClefSymbol.bass = new MidiSheetMusic.Bitmap(MidiSheetMusic.ClefSymbol, "Resources.Images.bass.png");
                    }

                }
            }
        },
        fields: {
            starttime: 0,
            smallsize: false,
            clef: 0,
            width: 0
        },
        props: {
            StartTime: {
                get: function () {
                    return this.starttime;
                }
            },
            MinWidth: {
                get: function () {
                    if (this.smallsize) {
                        return Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteWidth, 2);
                    } else {
                        return Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteWidth, 3);
                    }
                }
            },
            Width: {
                get: function () {
                    return this.width;
                },
                set: function (value) {
                    this.width = value;
                }
            },
            AboveStaff: {
                get: function () {
                    if (this.clef === MidiSheetMusic.Clef.Treble && !this.smallsize) {
                        return Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 2);
                    } else {
                        return 0;
                    }
                }
            },
            BelowStaff: {
                get: function () {
                    if (this.clef === MidiSheetMusic.Clef.Treble && !this.smallsize) {
                        return Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 2);
                    } else {
                        if (this.clef === MidiSheetMusic.Clef.Treble && this.smallsize) {
                            return MidiSheetMusic.SheetMusic.NoteHeight;
                        } else {
                            return 0;
                        }
                    }
                }
            }
        },
        ctors: {
            ctor: function (clef, starttime, small) {
                this.$initialize();
                MidiSheetMusic.MusicSymbol.ctor.call(this);
                this.clef = clef;
                this.starttime = starttime;
                this.smallsize = small;
                MidiSheetMusic.ClefSymbol.LoadImages();
                this.width = this.MinWidth;
            }
        },
        methods: {
            Draw: function (g, pen, ytop) {
                g.TranslateTransform(((this.Width - this.MinWidth) | 0), 0);
                var y = ytop;
                var image;
                var height;

                /* Get the image, height, and top y pixel, depending on the clef
                  and the image size.
                */
                if (this.clef === MidiSheetMusic.Clef.Treble) {
                    image = MidiSheetMusic.ClefSymbol.treble;
                    if (this.smallsize) {
                        height = (MidiSheetMusic.SheetMusic.StaffHeight + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.StaffHeight, 4)) | 0)) | 0;
                    } else {
                        height = (((Bridge.Int.div(Bridge.Int.mul(3, MidiSheetMusic.SheetMusic.StaffHeight), 2)) | 0) + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0)) | 0;
                        y = (ytop - MidiSheetMusic.SheetMusic.NoteHeight) | 0;
                    }
                } else {
                    image = MidiSheetMusic.ClefSymbol.bass;
                    if (this.smallsize) {
                        height = (MidiSheetMusic.SheetMusic.StaffHeight - ((Bridge.Int.div(Bridge.Int.mul(3, MidiSheetMusic.SheetMusic.NoteHeight), 2)) | 0)) | 0;
                    } else {
                        height = (MidiSheetMusic.SheetMusic.StaffHeight - MidiSheetMusic.SheetMusic.NoteHeight) | 0;
                    }
                }

                /* Scale the image width to match the height */
                var imgwidth = (Bridge.Int.div(Bridge.Int.mul(image.Width, height), image.Height)) | 0;
                g.DrawImage(image, 0, y, imgwidth, height);
                g.TranslateTransform(((-(((this.Width - this.MinWidth) | 0))) | 0), 0);
            },
            toString: function () {
                return System.String.format("ClefSymbol clef={0} small={1} width={2}", Bridge.box(this.clef, MidiSheetMusic.Clef, System.Enum.toStringFn(MidiSheetMusic.Clef)), Bridge.box(this.smallsize, System.Boolean, System.Boolean.toString), Bridge.box(this.width, System.Int32));
            }
        }
    });

    Bridge.define("MidiSheetMusic.FileStream", {
        inherits: [MidiSheetMusic.Stream],
        ctors: {
            ctor: function (filename, mode) {
                this.$initialize();
                MidiSheetMusic.Stream.ctor.call(this);
            }
        }
    });

    Bridge.define("MidiSheetMusic.Piano", {
        inherits: [MidiSheetMusic.Control],
        statics: {
            fields: {
                KeysPerOctave: 0,
                MaxOctave: 0,
                WhiteKeyWidth: 0,
                WhiteKeyHeight: 0,
                BlackKeyWidth: 0,
                BlackKeyHeight: 0,
                margin: 0,
                BlackBorder: 0,
                blackKeyOffsets: null
            },
            ctors: {
                init: function () {
                    this.KeysPerOctave = 7;
                    this.MaxOctave = 7;
                }
            }
        },
        fields: {
            gray1Pen: null,
            gray2Pen: null,
            gray3Pen: null,
            gray1Brush: null,
            gray2Brush: null,
            shadeBrush: null,
            shade2Brush: null,
            useTwoColors: false,
            notes: null,
            maxShadeDuration: 0,
            showNoteLetters: 0,
            graphics: null
        },
        ctors: {
            ctor: function () {
                this.$initialize();
                MidiSheetMusic.Control.ctor.call(this);
                var screenwidth = 1024; //System.Windows.Forms.Screen.PrimaryScreen.Bounds.Width;
                if (screenwidth >= 3200) {
                    /* Linux/Mono is reporting width of 4 screens */
                    screenwidth = (Bridge.Int.div(screenwidth, 4)) | 0;
                }
                screenwidth = (Bridge.Int.div(Bridge.Int.mul(screenwidth, 95), 100)) | 0;
                MidiSheetMusic.Piano.WhiteKeyWidth = Bridge.Int.clip32(screenwidth / (51.0));
                if (MidiSheetMusic.Piano.WhiteKeyWidth % 2 !== 0) {
                    MidiSheetMusic.Piano.WhiteKeyWidth = (MidiSheetMusic.Piano.WhiteKeyWidth - 1) | 0;
                }
                MidiSheetMusic.Piano.margin = 0;
                MidiSheetMusic.Piano.BlackBorder = (Bridge.Int.div(MidiSheetMusic.Piano.WhiteKeyWidth, 2)) | 0;
                MidiSheetMusic.Piano.WhiteKeyHeight = Bridge.Int.mul(MidiSheetMusic.Piano.WhiteKeyWidth, 5);
                MidiSheetMusic.Piano.BlackKeyWidth = (Bridge.Int.div(MidiSheetMusic.Piano.WhiteKeyWidth, 2)) | 0;
                MidiSheetMusic.Piano.BlackKeyHeight = (Bridge.Int.div(Bridge.Int.mul(MidiSheetMusic.Piano.WhiteKeyHeight, 5), 9)) | 0;

                this.Width = (((Bridge.Int.mul(MidiSheetMusic.Piano.margin, 2) + Bridge.Int.mul(MidiSheetMusic.Piano.BlackBorder, 2)) | 0) + Bridge.Int.mul(Bridge.Int.mul(MidiSheetMusic.Piano.WhiteKeyWidth, MidiSheetMusic.Piano.KeysPerOctave), MidiSheetMusic.Piano.MaxOctave)) | 0;
                this.Height = (((Bridge.Int.mul(MidiSheetMusic.Piano.margin, 2) + Bridge.Int.mul(MidiSheetMusic.Piano.BlackBorder, 3)) | 0) + MidiSheetMusic.Piano.WhiteKeyHeight) | 0;
                if (MidiSheetMusic.Piano.blackKeyOffsets == null) {
                    MidiSheetMusic.Piano.blackKeyOffsets = System.Array.init([((((MidiSheetMusic.Piano.WhiteKeyWidth - ((Bridge.Int.div(MidiSheetMusic.Piano.BlackKeyWidth, 2)) | 0)) | 0) - 1) | 0), ((((MidiSheetMusic.Piano.WhiteKeyWidth + ((Bridge.Int.div(MidiSheetMusic.Piano.BlackKeyWidth, 2)) | 0)) | 0) - 1) | 0), ((Bridge.Int.mul(2, MidiSheetMusic.Piano.WhiteKeyWidth) - ((Bridge.Int.div(MidiSheetMusic.Piano.BlackKeyWidth, 2)) | 0)) | 0), ((Bridge.Int.mul(2, MidiSheetMusic.Piano.WhiteKeyWidth) + ((Bridge.Int.div(MidiSheetMusic.Piano.BlackKeyWidth, 2)) | 0)) | 0), ((((Bridge.Int.mul(4, MidiSheetMusic.Piano.WhiteKeyWidth) - ((Bridge.Int.div(MidiSheetMusic.Piano.BlackKeyWidth, 2)) | 0)) | 0) - 1) | 0), ((((Bridge.Int.mul(4, MidiSheetMusic.Piano.WhiteKeyWidth) + ((Bridge.Int.div(MidiSheetMusic.Piano.BlackKeyWidth, 2)) | 0)) | 0) - 1) | 0), ((Bridge.Int.mul(5, MidiSheetMusic.Piano.WhiteKeyWidth) - ((Bridge.Int.div(MidiSheetMusic.Piano.BlackKeyWidth, 2)) | 0)) | 0), ((Bridge.Int.mul(5, MidiSheetMusic.Piano.WhiteKeyWidth) + ((Bridge.Int.div(MidiSheetMusic.Piano.BlackKeyWidth, 2)) | 0)) | 0), ((Bridge.Int.mul(6, MidiSheetMusic.Piano.WhiteKeyWidth) - ((Bridge.Int.div(MidiSheetMusic.Piano.BlackKeyWidth, 2)) | 0)) | 0), ((Bridge.Int.mul(6, MidiSheetMusic.Piano.WhiteKeyWidth) + ((Bridge.Int.div(MidiSheetMusic.Piano.BlackKeyWidth, 2)) | 0)) | 0)], System.Int32);
                }
                var gray1 = MidiSheetMusic.Color.FromArgb(16, 16, 16);
                var gray2 = MidiSheetMusic.Color.FromArgb(90, 90, 90);
                var gray3 = MidiSheetMusic.Color.FromArgb(200, 200, 200);
                var shade1 = MidiSheetMusic.Color.FromArgb(210, 205, 220);
                var shade2 = MidiSheetMusic.Color.FromArgb(150, 200, 220);

                this.gray1Pen = new MidiSheetMusic.Pen(gray1, 1);
                this.gray2Pen = new MidiSheetMusic.Pen(gray2, 1);
                this.gray3Pen = new MidiSheetMusic.Pen(gray3, 1);

                this.gray1Brush = new MidiSheetMusic.SolidBrush(gray1);
                this.gray2Brush = new MidiSheetMusic.SolidBrush(gray2);
                this.shadeBrush = new MidiSheetMusic.SolidBrush(shade1);
                this.shade2Brush = new MidiSheetMusic.SolidBrush(shade2);
                this.showNoteLetters = MidiSheetMusic.MidiOptions.NoteNameNone;
                this.BackColor = MidiSheetMusic.Color.LightGray;
            }
        },
        methods: {
            SetMidiFile: function (midifile, options) {
                var $t;
                if (midifile == null) {
                    this.notes = null;
                    this.useTwoColors = false;
                    return;
                }

                var tracks = midifile.ChangeMidiNotes(options);
                var track = MidiSheetMusic.MidiFile.CombineToSingleTrack(tracks);
                this.notes = track.Notes;

                this.maxShadeDuration = Bridge.Int.mul(midifile.Time.Quarter, 2);

                /* We want to know which track the note came from.
                  Use the 'channel' field to store the track.
                */
                for (var tracknum = 0; tracknum < tracks.Count; tracknum = (tracknum + 1) | 0) {
                    $t = Bridge.getEnumerator(tracks.getItem(tracknum).Notes);
                    try {
                        while ($t.moveNext()) {
                            var note = $t.Current;
                            note.Channel = tracknum;
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }}

                /* When we have exactly two tracks, we assume this is a piano song,
                  and we use different colors for highlighting the left hand and
                  right hand notes.
                */
                this.useTwoColors = false;
                if (tracks.Count === 2) {
                    this.useTwoColors = true;
                }

                this.showNoteLetters = options.showNoteLetters;
                this.Invalidate();
            },
            SetShadeColors: function (c1, c2) {
                this.shadeBrush.Dispose();
                this.shade2Brush.Dispose();
                this.shadeBrush = new MidiSheetMusic.SolidBrush(c1);
                this.shade2Brush = new MidiSheetMusic.SolidBrush(c2);
            },
            DrawOctaveOutline: function (g) {
                var right = Bridge.Int.mul(MidiSheetMusic.Piano.WhiteKeyWidth, MidiSheetMusic.Piano.KeysPerOctave);

                // Draw the bounding rectangle, from C to B
                g.DrawLine(this.gray1Pen, 0, 0, 0, MidiSheetMusic.Piano.WhiteKeyHeight);
                g.DrawLine(this.gray1Pen, right, 0, right, MidiSheetMusic.Piano.WhiteKeyHeight);
                // g.DrawLine(gray1Pen, 0, 0, right, 0);
                g.DrawLine(this.gray1Pen, 0, MidiSheetMusic.Piano.WhiteKeyHeight, right, MidiSheetMusic.Piano.WhiteKeyHeight);
                g.DrawLine(this.gray3Pen, ((right - 1) | 0), 0, ((right - 1) | 0), MidiSheetMusic.Piano.WhiteKeyHeight);
                g.DrawLine(this.gray3Pen, 1, 0, 1, MidiSheetMusic.Piano.WhiteKeyHeight);

                // Draw the line between E and F
                g.DrawLine(this.gray1Pen, Bridge.Int.mul(3, MidiSheetMusic.Piano.WhiteKeyWidth), 0, Bridge.Int.mul(3, MidiSheetMusic.Piano.WhiteKeyWidth), MidiSheetMusic.Piano.WhiteKeyHeight);
                g.DrawLine(this.gray3Pen, ((Bridge.Int.mul(3, MidiSheetMusic.Piano.WhiteKeyWidth) - 1) | 0), 0, ((Bridge.Int.mul(3, MidiSheetMusic.Piano.WhiteKeyWidth) - 1) | 0), MidiSheetMusic.Piano.WhiteKeyHeight);
                g.DrawLine(this.gray3Pen, ((Bridge.Int.mul(3, MidiSheetMusic.Piano.WhiteKeyWidth) + 1) | 0), 0, ((Bridge.Int.mul(3, MidiSheetMusic.Piano.WhiteKeyWidth) + 1) | 0), MidiSheetMusic.Piano.WhiteKeyHeight);

                // Draw the sides/bottom of the black keys
                for (var i = 0; i < 10; i = (i + 2) | 0) {
                    var x1 = MidiSheetMusic.Piano.blackKeyOffsets[System.Array.index(i, MidiSheetMusic.Piano.blackKeyOffsets)];
                    var x2 = MidiSheetMusic.Piano.blackKeyOffsets[System.Array.index(((i + 1) | 0), MidiSheetMusic.Piano.blackKeyOffsets)];

                    g.DrawLine(this.gray1Pen, x1, 0, x1, MidiSheetMusic.Piano.BlackKeyHeight);
                    g.DrawLine(this.gray1Pen, x2, 0, x2, MidiSheetMusic.Piano.BlackKeyHeight);
                    g.DrawLine(this.gray1Pen, x1, MidiSheetMusic.Piano.BlackKeyHeight, x2, MidiSheetMusic.Piano.BlackKeyHeight);
                    g.DrawLine(this.gray2Pen, ((x1 - 1) | 0), 0, ((x1 - 1) | 0), ((MidiSheetMusic.Piano.BlackKeyHeight + 1) | 0));
                    g.DrawLine(this.gray2Pen, ((x2 + 1) | 0), 0, ((x2 + 1) | 0), ((MidiSheetMusic.Piano.BlackKeyHeight + 1) | 0));
                    g.DrawLine(this.gray2Pen, ((x1 - 1) | 0), ((MidiSheetMusic.Piano.BlackKeyHeight + 1) | 0), ((x2 + 1) | 0), ((MidiSheetMusic.Piano.BlackKeyHeight + 1) | 0));
                    g.DrawLine(this.gray3Pen, ((x1 - 2) | 0), 0, ((x1 - 2) | 0), ((MidiSheetMusic.Piano.BlackKeyHeight + 2) | 0));
                    g.DrawLine(this.gray3Pen, ((x2 + 2) | 0), 0, ((x2 + 2) | 0), ((MidiSheetMusic.Piano.BlackKeyHeight + 2) | 0));
                    g.DrawLine(this.gray3Pen, ((x1 - 2) | 0), ((MidiSheetMusic.Piano.BlackKeyHeight + 2) | 0), ((x2 + 2) | 0), ((MidiSheetMusic.Piano.BlackKeyHeight + 2) | 0));
                }

                // Draw the bottom-half of the white keys
                for (var i1 = 1; i1 < MidiSheetMusic.Piano.KeysPerOctave; i1 = (i1 + 1) | 0) {
                    if (i1 === 3) {
                        continue; // we draw the line between E and F above
                    }
                    g.DrawLine(this.gray1Pen, Bridge.Int.mul(i1, MidiSheetMusic.Piano.WhiteKeyWidth), MidiSheetMusic.Piano.BlackKeyHeight, Bridge.Int.mul(i1, MidiSheetMusic.Piano.WhiteKeyWidth), MidiSheetMusic.Piano.WhiteKeyHeight);
                    var pen1 = this.gray2Pen;
                    var pen2 = this.gray3Pen;
                    g.DrawLine(pen1, ((Bridge.Int.mul(i1, MidiSheetMusic.Piano.WhiteKeyWidth) - 1) | 0), ((MidiSheetMusic.Piano.BlackKeyHeight + 1) | 0), ((Bridge.Int.mul(i1, MidiSheetMusic.Piano.WhiteKeyWidth) - 1) | 0), MidiSheetMusic.Piano.WhiteKeyHeight);
                    g.DrawLine(pen2, ((Bridge.Int.mul(i1, MidiSheetMusic.Piano.WhiteKeyWidth) + 1) | 0), ((MidiSheetMusic.Piano.BlackKeyHeight + 1) | 0), ((Bridge.Int.mul(i1, MidiSheetMusic.Piano.WhiteKeyWidth) + 1) | 0), MidiSheetMusic.Piano.WhiteKeyHeight);
                }

            },
            DrawOutline: function (g) {
                for (var octave = 0; octave < MidiSheetMusic.Piano.MaxOctave; octave = (octave + 1) | 0) {
                    g.TranslateTransform(Bridge.Int.mul(Bridge.Int.mul(octave, MidiSheetMusic.Piano.WhiteKeyWidth), MidiSheetMusic.Piano.KeysPerOctave), 0);
                    this.DrawOctaveOutline(g);
                    g.TranslateTransform(((-(Bridge.Int.mul(Bridge.Int.mul(octave, MidiSheetMusic.Piano.WhiteKeyWidth), MidiSheetMusic.Piano.KeysPerOctave))) | 0), 0);
                }
            },
            DrawBlackKeys: function (g) {
                for (var octave = 0; octave < MidiSheetMusic.Piano.MaxOctave; octave = (octave + 1) | 0) {
                    g.TranslateTransform(Bridge.Int.mul(Bridge.Int.mul(octave, MidiSheetMusic.Piano.WhiteKeyWidth), MidiSheetMusic.Piano.KeysPerOctave), 0);
                    for (var i = 0; i < 10; i = (i + 2) | 0) {
                        var x1 = MidiSheetMusic.Piano.blackKeyOffsets[System.Array.index(i, MidiSheetMusic.Piano.blackKeyOffsets)];
                        var x2 = MidiSheetMusic.Piano.blackKeyOffsets[System.Array.index(((i + 1) | 0), MidiSheetMusic.Piano.blackKeyOffsets)];
                        g.FillRectangle(this.gray1Brush, x1, 0, MidiSheetMusic.Piano.BlackKeyWidth, MidiSheetMusic.Piano.BlackKeyHeight);
                        g.FillRectangle(this.gray2Brush, ((x1 + 1) | 0), ((MidiSheetMusic.Piano.BlackKeyHeight - ((Bridge.Int.div(MidiSheetMusic.Piano.BlackKeyHeight, 8)) | 0)) | 0), ((MidiSheetMusic.Piano.BlackKeyWidth - 2) | 0), ((Bridge.Int.div(MidiSheetMusic.Piano.BlackKeyHeight, 8)) | 0));
                    }
                    g.TranslateTransform(((-(Bridge.Int.mul(Bridge.Int.mul(octave, MidiSheetMusic.Piano.WhiteKeyWidth), MidiSheetMusic.Piano.KeysPerOctave))) | 0), 0);
                }
            },
            DrawBlackBorder: function (g) {
                var PianoWidth = Bridge.Int.mul(Bridge.Int.mul(MidiSheetMusic.Piano.WhiteKeyWidth, MidiSheetMusic.Piano.KeysPerOctave), MidiSheetMusic.Piano.MaxOctave);
                g.FillRectangle(this.gray1Brush, MidiSheetMusic.Piano.margin, MidiSheetMusic.Piano.margin, ((PianoWidth + Bridge.Int.mul(MidiSheetMusic.Piano.BlackBorder, 2)) | 0), ((MidiSheetMusic.Piano.BlackBorder - 2) | 0));
                g.FillRectangle(this.gray1Brush, MidiSheetMusic.Piano.margin, MidiSheetMusic.Piano.margin, MidiSheetMusic.Piano.BlackBorder, ((MidiSheetMusic.Piano.WhiteKeyHeight + Bridge.Int.mul(MidiSheetMusic.Piano.BlackBorder, 3)) | 0));
                g.FillRectangle(this.gray1Brush, MidiSheetMusic.Piano.margin, ((((MidiSheetMusic.Piano.margin + MidiSheetMusic.Piano.BlackBorder) | 0) + MidiSheetMusic.Piano.WhiteKeyHeight) | 0), ((Bridge.Int.mul(MidiSheetMusic.Piano.BlackBorder, 2) + PianoWidth) | 0), Bridge.Int.mul(MidiSheetMusic.Piano.BlackBorder, 2));
                g.FillRectangle(this.gray1Brush, ((((MidiSheetMusic.Piano.margin + MidiSheetMusic.Piano.BlackBorder) | 0) + PianoWidth) | 0), MidiSheetMusic.Piano.margin, MidiSheetMusic.Piano.BlackBorder, ((MidiSheetMusic.Piano.WhiteKeyHeight + Bridge.Int.mul(MidiSheetMusic.Piano.BlackBorder, 3)) | 0));

                g.DrawLine(this.gray2Pen, ((MidiSheetMusic.Piano.margin + MidiSheetMusic.Piano.BlackBorder) | 0), ((((MidiSheetMusic.Piano.margin + MidiSheetMusic.Piano.BlackBorder) | 0) - 1) | 0), ((((MidiSheetMusic.Piano.margin + MidiSheetMusic.Piano.BlackBorder) | 0) + PianoWidth) | 0), ((((MidiSheetMusic.Piano.margin + MidiSheetMusic.Piano.BlackBorder) | 0) - 1) | 0));

                g.TranslateTransform(((MidiSheetMusic.Piano.margin + MidiSheetMusic.Piano.BlackBorder) | 0), ((MidiSheetMusic.Piano.margin + MidiSheetMusic.Piano.BlackBorder) | 0));

                // Draw the gray bottoms of the white keys  
                for (var i = 0; i < 49; i = (i + 1) | 0) {
                    g.FillRectangle(this.gray2Brush, ((Bridge.Int.mul(i, MidiSheetMusic.Piano.WhiteKeyWidth) + 1) | 0), ((MidiSheetMusic.Piano.WhiteKeyHeight + 2) | 0), ((MidiSheetMusic.Piano.WhiteKeyWidth - 2) | 0), ((Bridge.Int.div(MidiSheetMusic.Piano.BlackBorder, 2)) | 0));
                }
                g.TranslateTransform(((-(((MidiSheetMusic.Piano.margin + MidiSheetMusic.Piano.BlackBorder) | 0))) | 0), ((-(((MidiSheetMusic.Piano.margin + MidiSheetMusic.Piano.BlackBorder) | 0))) | 0));
            },
            DrawNoteLetters: function (g) {
                var letters = System.Array.init([
                    "C", 
                    "D", 
                    "E", 
                    "F", 
                    "G", 
                    "A", 
                    "B"
                ], System.String);
                var numbers = System.Array.init([
                    "1", 
                    "3", 
                    "5", 
                    "6", 
                    "8", 
                    "10", 
                    "12"
                ], System.String);
                var names;
                if (this.showNoteLetters === MidiSheetMusic.MidiOptions.NoteNameLetter) {
                    names = letters;
                } else if (this.showNoteLetters === MidiSheetMusic.MidiOptions.NoteNameFixedNumber) {
                    names = numbers;
                } else {
                    return;
                }
                g.TranslateTransform(((MidiSheetMusic.Piano.margin + MidiSheetMusic.Piano.BlackBorder) | 0), ((MidiSheetMusic.Piano.margin + MidiSheetMusic.Piano.BlackBorder) | 0));
                for (var octave = 0; octave < MidiSheetMusic.Piano.MaxOctave; octave = (octave + 1) | 0) {
                    for (var i = 0; i < MidiSheetMusic.Piano.KeysPerOctave; i = (i + 1) | 0) {
                        g.DrawString(names[System.Array.index(i, names)], MidiSheetMusic.SheetMusic.LetterFont, MidiSheetMusic.Brushes.White, ((Bridge.Int.mul((((Bridge.Int.mul(octave, MidiSheetMusic.Piano.KeysPerOctave) + i) | 0)), MidiSheetMusic.Piano.WhiteKeyWidth) + ((Bridge.Int.div(MidiSheetMusic.Piano.WhiteKeyWidth, 3)) | 0)) | 0), ((MidiSheetMusic.Piano.WhiteKeyHeight + ((Bridge.Int.div(Bridge.Int.mul(MidiSheetMusic.Piano.BlackBorder, 3), 4)) | 0)) | 0));
                    }
                }
                g.TranslateTransform(((-(((MidiSheetMusic.Piano.margin + MidiSheetMusic.Piano.BlackBorder) | 0))) | 0), ((-(((MidiSheetMusic.Piano.margin + MidiSheetMusic.Piano.BlackBorder) | 0))) | 0));
            },
            OnPaint: function (e) {
                var g = e.Graphics();
                g.SmoothingMode = MidiSheetMusic.SmoothingMode.None;
                g.TranslateTransform(((MidiSheetMusic.Piano.margin + MidiSheetMusic.Piano.BlackBorder) | 0), ((MidiSheetMusic.Piano.margin + MidiSheetMusic.Piano.BlackBorder) | 0));
                g.FillRectangle(MidiSheetMusic.Brushes.White, 0, 0, Bridge.Int.mul(Bridge.Int.mul(MidiSheetMusic.Piano.WhiteKeyWidth, MidiSheetMusic.Piano.KeysPerOctave), MidiSheetMusic.Piano.MaxOctave), MidiSheetMusic.Piano.WhiteKeyHeight);
                this.DrawBlackKeys(g);
                this.DrawOutline(g);
                g.TranslateTransform(((-(((MidiSheetMusic.Piano.margin + MidiSheetMusic.Piano.BlackBorder) | 0))) | 0), ((-(((MidiSheetMusic.Piano.margin + MidiSheetMusic.Piano.BlackBorder) | 0))) | 0));
                this.DrawBlackBorder(g);
                if (this.showNoteLetters !== MidiSheetMusic.MidiOptions.NoteNameNone) {
                    this.DrawNoteLetters(g);
                }
                g.SmoothingMode = MidiSheetMusic.SmoothingMode.AntiAlias;
            },
            ShadeOneNote: function (g, notenumber, brush) {
                var octave = (Bridge.Int.div(notenumber, 12)) | 0;
                var notescale = notenumber % 12;

                octave = (octave - 2) | 0;
                if (octave < 0 || octave >= MidiSheetMusic.Piano.MaxOctave) {
                    return;
                }

                g.TranslateTransform(Bridge.Int.mul(Bridge.Int.mul(octave, MidiSheetMusic.Piano.WhiteKeyWidth), MidiSheetMusic.Piano.KeysPerOctave), 0);
                var x1, x2, x3;

                var bottomHalfHeight = (MidiSheetMusic.Piano.WhiteKeyHeight - (((MidiSheetMusic.Piano.BlackKeyHeight + 3) | 0))) | 0;

                /* notescale goes from 0 to 11, from C to B. */
                switch (notescale) {
                    case 0:  /* C */
                        x1 = 2;
                        x2 = (MidiSheetMusic.Piano.blackKeyOffsets[System.Array.index(0, MidiSheetMusic.Piano.blackKeyOffsets)] - 2) | 0;
                        g.FillRectangle(brush, x1, 0, ((x2 - x1) | 0), ((MidiSheetMusic.Piano.BlackKeyHeight + 3) | 0));
                        g.FillRectangle(brush, x1, ((MidiSheetMusic.Piano.BlackKeyHeight + 3) | 0), ((MidiSheetMusic.Piano.WhiteKeyWidth - 3) | 0), bottomHalfHeight);
                        break;
                    case 1:  /* C# */
                        x1 = MidiSheetMusic.Piano.blackKeyOffsets[System.Array.index(0, MidiSheetMusic.Piano.blackKeyOffsets)];
                        x2 = MidiSheetMusic.Piano.blackKeyOffsets[System.Array.index(1, MidiSheetMusic.Piano.blackKeyOffsets)];
                        g.FillRectangle(brush, x1, 0, ((x2 - x1) | 0), MidiSheetMusic.Piano.BlackKeyHeight);
                        if (Bridge.referenceEquals(brush, this.gray1Brush)) {
                            g.FillRectangle(this.gray2Brush, ((x1 + 1) | 0), ((MidiSheetMusic.Piano.BlackKeyHeight - ((Bridge.Int.div(MidiSheetMusic.Piano.BlackKeyHeight, 8)) | 0)) | 0), ((MidiSheetMusic.Piano.BlackKeyWidth - 2) | 0), ((Bridge.Int.div(MidiSheetMusic.Piano.BlackKeyHeight, 8)) | 0));
                        }
                        break;
                    case 2:  /* D */
                        x1 = (MidiSheetMusic.Piano.WhiteKeyWidth + 2) | 0;
                        x2 = (MidiSheetMusic.Piano.blackKeyOffsets[System.Array.index(1, MidiSheetMusic.Piano.blackKeyOffsets)] + 3) | 0;
                        x3 = (MidiSheetMusic.Piano.blackKeyOffsets[System.Array.index(2, MidiSheetMusic.Piano.blackKeyOffsets)] - 2) | 0;
                        g.FillRectangle(brush, x2, 0, ((x3 - x2) | 0), ((MidiSheetMusic.Piano.BlackKeyHeight + 3) | 0));
                        g.FillRectangle(brush, x1, ((MidiSheetMusic.Piano.BlackKeyHeight + 3) | 0), ((MidiSheetMusic.Piano.WhiteKeyWidth - 3) | 0), bottomHalfHeight);
                        break;
                    case 3:  /* D# */
                        x1 = MidiSheetMusic.Piano.blackKeyOffsets[System.Array.index(2, MidiSheetMusic.Piano.blackKeyOffsets)];
                        x2 = MidiSheetMusic.Piano.blackKeyOffsets[System.Array.index(3, MidiSheetMusic.Piano.blackKeyOffsets)];
                        g.FillRectangle(brush, x1, 0, MidiSheetMusic.Piano.BlackKeyWidth, MidiSheetMusic.Piano.BlackKeyHeight);
                        if (Bridge.referenceEquals(brush, this.gray1Brush)) {
                            g.FillRectangle(this.gray2Brush, ((x1 + 1) | 0), ((MidiSheetMusic.Piano.BlackKeyHeight - ((Bridge.Int.div(MidiSheetMusic.Piano.BlackKeyHeight, 8)) | 0)) | 0), ((MidiSheetMusic.Piano.BlackKeyWidth - 2) | 0), ((Bridge.Int.div(MidiSheetMusic.Piano.BlackKeyHeight, 8)) | 0));
                        }
                        break;
                    case 4:  /* E */
                        x1 = (Bridge.Int.mul(MidiSheetMusic.Piano.WhiteKeyWidth, 2) + 2) | 0;
                        x2 = (MidiSheetMusic.Piano.blackKeyOffsets[System.Array.index(3, MidiSheetMusic.Piano.blackKeyOffsets)] + 3) | 0;
                        x3 = (Bridge.Int.mul(MidiSheetMusic.Piano.WhiteKeyWidth, 3) - 1) | 0;
                        g.FillRectangle(brush, x2, 0, ((x3 - x2) | 0), ((MidiSheetMusic.Piano.BlackKeyHeight + 3) | 0));
                        g.FillRectangle(brush, x1, ((MidiSheetMusic.Piano.BlackKeyHeight + 3) | 0), ((MidiSheetMusic.Piano.WhiteKeyWidth - 3) | 0), bottomHalfHeight);
                        break;
                    case 5:  /* F */
                        x1 = (Bridge.Int.mul(MidiSheetMusic.Piano.WhiteKeyWidth, 3) + 2) | 0;
                        x2 = (MidiSheetMusic.Piano.blackKeyOffsets[System.Array.index(4, MidiSheetMusic.Piano.blackKeyOffsets)] - 2) | 0;
                        x3 = (Bridge.Int.mul(MidiSheetMusic.Piano.WhiteKeyWidth, 4) - 2) | 0;
                        g.FillRectangle(brush, x1, 0, ((x2 - x1) | 0), ((MidiSheetMusic.Piano.BlackKeyHeight + 3) | 0));
                        g.FillRectangle(brush, x1, ((MidiSheetMusic.Piano.BlackKeyHeight + 3) | 0), ((MidiSheetMusic.Piano.WhiteKeyWidth - 3) | 0), bottomHalfHeight);
                        break;
                    case 6:  /* F# */
                        x1 = MidiSheetMusic.Piano.blackKeyOffsets[System.Array.index(4, MidiSheetMusic.Piano.blackKeyOffsets)];
                        x2 = MidiSheetMusic.Piano.blackKeyOffsets[System.Array.index(5, MidiSheetMusic.Piano.blackKeyOffsets)];
                        g.FillRectangle(brush, x1, 0, MidiSheetMusic.Piano.BlackKeyWidth, MidiSheetMusic.Piano.BlackKeyHeight);
                        if (Bridge.referenceEquals(brush, this.gray1Brush)) {
                            g.FillRectangle(this.gray2Brush, ((x1 + 1) | 0), ((MidiSheetMusic.Piano.BlackKeyHeight - ((Bridge.Int.div(MidiSheetMusic.Piano.BlackKeyHeight, 8)) | 0)) | 0), ((MidiSheetMusic.Piano.BlackKeyWidth - 2) | 0), ((Bridge.Int.div(MidiSheetMusic.Piano.BlackKeyHeight, 8)) | 0));
                        }
                        break;
                    case 7:  /* G */
                        x1 = (Bridge.Int.mul(MidiSheetMusic.Piano.WhiteKeyWidth, 4) + 2) | 0;
                        x2 = (MidiSheetMusic.Piano.blackKeyOffsets[System.Array.index(5, MidiSheetMusic.Piano.blackKeyOffsets)] + 3) | 0;
                        x3 = (MidiSheetMusic.Piano.blackKeyOffsets[System.Array.index(6, MidiSheetMusic.Piano.blackKeyOffsets)] - 2) | 0;
                        g.FillRectangle(brush, x2, 0, ((x3 - x2) | 0), ((MidiSheetMusic.Piano.BlackKeyHeight + 3) | 0));
                        g.FillRectangle(brush, x1, ((MidiSheetMusic.Piano.BlackKeyHeight + 3) | 0), ((MidiSheetMusic.Piano.WhiteKeyWidth - 3) | 0), bottomHalfHeight);
                        break;
                    case 8:  /* G# */
                        x1 = MidiSheetMusic.Piano.blackKeyOffsets[System.Array.index(6, MidiSheetMusic.Piano.blackKeyOffsets)];
                        x2 = MidiSheetMusic.Piano.blackKeyOffsets[System.Array.index(7, MidiSheetMusic.Piano.blackKeyOffsets)];
                        g.FillRectangle(brush, x1, 0, MidiSheetMusic.Piano.BlackKeyWidth, MidiSheetMusic.Piano.BlackKeyHeight);
                        if (Bridge.referenceEquals(brush, this.gray1Brush)) {
                            g.FillRectangle(this.gray2Brush, ((x1 + 1) | 0), ((MidiSheetMusic.Piano.BlackKeyHeight - ((Bridge.Int.div(MidiSheetMusic.Piano.BlackKeyHeight, 8)) | 0)) | 0), ((MidiSheetMusic.Piano.BlackKeyWidth - 2) | 0), ((Bridge.Int.div(MidiSheetMusic.Piano.BlackKeyHeight, 8)) | 0));
                        }
                        break;
                    case 9:  /* A */
                        x1 = (Bridge.Int.mul(MidiSheetMusic.Piano.WhiteKeyWidth, 5) + 2) | 0;
                        x2 = (MidiSheetMusic.Piano.blackKeyOffsets[System.Array.index(7, MidiSheetMusic.Piano.blackKeyOffsets)] + 3) | 0;
                        x3 = (MidiSheetMusic.Piano.blackKeyOffsets[System.Array.index(8, MidiSheetMusic.Piano.blackKeyOffsets)] - 2) | 0;
                        g.FillRectangle(brush, x2, 0, ((x3 - x2) | 0), ((MidiSheetMusic.Piano.BlackKeyHeight + 3) | 0));
                        g.FillRectangle(brush, x1, ((MidiSheetMusic.Piano.BlackKeyHeight + 3) | 0), ((MidiSheetMusic.Piano.WhiteKeyWidth - 3) | 0), bottomHalfHeight);
                        break;
                    case 10:  /* A# */
                        x1 = MidiSheetMusic.Piano.blackKeyOffsets[System.Array.index(8, MidiSheetMusic.Piano.blackKeyOffsets)];
                        x2 = MidiSheetMusic.Piano.blackKeyOffsets[System.Array.index(9, MidiSheetMusic.Piano.blackKeyOffsets)];
                        g.FillRectangle(brush, x1, 0, MidiSheetMusic.Piano.BlackKeyWidth, MidiSheetMusic.Piano.BlackKeyHeight);
                        if (Bridge.referenceEquals(brush, this.gray1Brush)) {
                            g.FillRectangle(this.gray2Brush, ((x1 + 1) | 0), ((MidiSheetMusic.Piano.BlackKeyHeight - ((Bridge.Int.div(MidiSheetMusic.Piano.BlackKeyHeight, 8)) | 0)) | 0), ((MidiSheetMusic.Piano.BlackKeyWidth - 2) | 0), ((Bridge.Int.div(MidiSheetMusic.Piano.BlackKeyHeight, 8)) | 0));
                        }
                        break;
                    case 11:  /* B */
                        x1 = (Bridge.Int.mul(MidiSheetMusic.Piano.WhiteKeyWidth, 6) + 2) | 0;
                        x2 = (MidiSheetMusic.Piano.blackKeyOffsets[System.Array.index(9, MidiSheetMusic.Piano.blackKeyOffsets)] + 3) | 0;
                        x3 = (Bridge.Int.mul(MidiSheetMusic.Piano.WhiteKeyWidth, MidiSheetMusic.Piano.KeysPerOctave) - 1) | 0;
                        g.FillRectangle(brush, x2, 0, ((x3 - x2) | 0), ((MidiSheetMusic.Piano.BlackKeyHeight + 3) | 0));
                        g.FillRectangle(brush, x1, ((MidiSheetMusic.Piano.BlackKeyHeight + 3) | 0), ((MidiSheetMusic.Piano.WhiteKeyWidth - 3) | 0), bottomHalfHeight);
                        break;
                    default: 
                        break;
                }
                g.TranslateTransform(((-(Bridge.Int.mul(Bridge.Int.mul(octave, MidiSheetMusic.Piano.WhiteKeyWidth), MidiSheetMusic.Piano.KeysPerOctave))) | 0), 0);
            },
            FindClosestStartTime: function (pulseTime) {
                var left = 0;
                var right = (this.notes.Count - 1) | 0;

                while (((right - left) | 0) > 1) {
                    var i = (Bridge.Int.div((((right + left) | 0)), 2)) | 0;
                    if (this.notes.getItem(left).StartTime === pulseTime) {
                        break;
                    } else {
                        if (this.notes.getItem(i).StartTime <= pulseTime) {
                            left = i;
                        } else {
                            right = i;
                        }
                    }
                }
                while (left >= 1 && (this.notes.getItem(((left - 1) | 0)).StartTime === this.notes.getItem(left).StartTime)) {
                    left = (left - 1) | 0;
                }
                return left;
            },
            NextStartTimeSameTrack: function (i) {
                var start = this.notes.getItem(i).StartTime;
                var end = this.notes.getItem(i).EndTime;
                var track = this.notes.getItem(i).Channel;

                while (i < this.notes.Count) {
                    if (this.notes.getItem(i).Channel !== track) {
                        i = (i + 1) | 0;
                        continue;
                    }
                    if (this.notes.getItem(i).StartTime > start) {
                        return this.notes.getItem(i).StartTime;
                    }
                    end = Math.max(end, this.notes.getItem(i).EndTime);
                    i = (i + 1) | 0;
                }
                return end;
            },
            NextStartTime: function (i) {
                var start = this.notes.getItem(i).StartTime;
                var end = this.notes.getItem(i).EndTime;

                while (i < this.notes.Count) {
                    if (this.notes.getItem(i).StartTime > start) {
                        return this.notes.getItem(i).StartTime;
                    }
                    end = Math.max(end, this.notes.getItem(i).EndTime);
                    i = (i + 1) | 0;
                }
                return end;
            },
            ShadeNotes: function (currentPulseTime, prevPulseTime) {
                if (this.notes == null || this.notes.Count === 0) {
                    return;
                }
                if (this.graphics == null) {
                    this.graphics = this.CreateGraphics("shadeNotes_piano");
                }
                this.graphics.SmoothingMode = MidiSheetMusic.SmoothingMode.None;
                this.graphics.TranslateTransform(((MidiSheetMusic.Piano.margin + MidiSheetMusic.Piano.BlackBorder) | 0), ((MidiSheetMusic.Piano.margin + MidiSheetMusic.Piano.BlackBorder) | 0));

                /* Loop through the Midi notes.
                  Unshade notes where StartTime <= prevPulseTime < next StartTime
                  Shade notes where StartTime <= currentPulseTime < next StartTime
                */
                var lastShadedIndex = this.FindClosestStartTime(((prevPulseTime - Bridge.Int.mul(this.maxShadeDuration, 2)) | 0));
                for (var i = lastShadedIndex; i < this.notes.Count; i = (i + 1) | 0) {
                    var start = this.notes.getItem(i).StartTime;
                    var end = this.notes.getItem(i).EndTime;
                    var notenumber = this.notes.getItem(i).Number;
                    var nextStart = this.NextStartTime(i);
                    var nextStartTrack = this.NextStartTimeSameTrack(i);
                    end = Math.max(end, nextStartTrack);
                    end = Math.min(end, ((((start + this.maxShadeDuration) | 0) - 1) | 0));

                    /* If we've past the previous and current times, we're done. */
                    if ((start > prevPulseTime) && (start > currentPulseTime)) {
                        break;
                    }

                    /* If shaded notes are the same, we're done */
                    if ((start <= currentPulseTime) && (currentPulseTime < nextStart) && (currentPulseTime < end) && (start <= prevPulseTime) && (prevPulseTime < nextStart) && (prevPulseTime < end)) {
                        break;
                    }

                    /* If the note is in the current time, shade it */
                    if ((start <= currentPulseTime) && (currentPulseTime < end)) {
                        if (this.useTwoColors) {
                            if (this.notes.getItem(i).Channel === 1) {
                                this.ShadeOneNote(this.graphics, notenumber, this.shade2Brush);
                            } else {
                                this.ShadeOneNote(this.graphics, notenumber, this.shadeBrush);
                            }
                        } else {
                            this.ShadeOneNote(this.graphics, notenumber, this.shadeBrush);
                        }
                    } else if ((start <= prevPulseTime) && (prevPulseTime < end)) {
                        var num = notenumber % 12;
                        if (num === 1 || num === 3 || num === 6 || num === 8 || num === 10) {
                            this.ShadeOneNote(this.graphics, notenumber, this.gray1Brush);
                        } else {
                            this.ShadeOneNote(this.graphics, notenumber, MidiSheetMusic.Brushes.White);
                        }
                    }
                }
                this.graphics.TranslateTransform(((-(((MidiSheetMusic.Piano.margin + MidiSheetMusic.Piano.BlackBorder) | 0))) | 0), ((-(((MidiSheetMusic.Piano.margin + MidiSheetMusic.Piano.BlackBorder) | 0))) | 0));
                this.graphics.SmoothingMode = MidiSheetMusic.SmoothingMode.AntiAlias;
            }
        }
    });

    Bridge.define("MidiSheetMusic.RestSymbol", {
        inherits: [MidiSheetMusic.MusicSymbol],
        fields: {
            starttime: 0,
            duration: 0,
            width: 0
        },
        props: {
            StartTime: {
                get: function () {
                    return this.starttime;
                }
            },
            Width: {
                get: function () {
                    return this.width;
                },
                set: function (value) {
                    this.width = value;
                }
            },
            MinWidth: {
                get: function () {
                    return ((Bridge.Int.mul(2, MidiSheetMusic.SheetMusic.NoteHeight) + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0)) | 0);
                }
            },
            AboveStaff: {
                get: function () {
                    return 0;
                }
            },
            BelowStaff: {
                get: function () {
                    return 0;
                }
            }
        },
        ctors: {
            ctor: function (start, dur) {
                this.$initialize();
                MidiSheetMusic.MusicSymbol.ctor.call(this);
                this.starttime = start;
                this.duration = dur;
                this.width = this.MinWidth;
            }
        },
        methods: {
            Draw: function (g, pen, ytop) {
                /* Align the rest symbol to the right */
                g.TranslateTransform(((this.Width - this.MinWidth) | 0), 0);
                g.TranslateTransform(((Bridge.Int.div(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0), 0);

                if (this.duration === MidiSheetMusic.NoteDuration.Whole) {
                    this.DrawWhole(g, pen, ytop);
                } else if (this.duration === MidiSheetMusic.NoteDuration.Half) {
                    this.DrawHalf(g, pen, ytop);
                } else if (this.duration === MidiSheetMusic.NoteDuration.Quarter) {
                    this.DrawQuarter(g, pen, ytop);
                } else if (this.duration === MidiSheetMusic.NoteDuration.Eighth) {
                    this.DrawEighth(g, pen, ytop);
                }
                g.TranslateTransform(((Bridge.Int.div(((-MidiSheetMusic.SheetMusic.NoteHeight) | 0), 2)) | 0), 0);
                g.TranslateTransform(((-(((this.Width - this.MinWidth) | 0))) | 0), 0);
            },
            DrawWhole: function (g, pen, ytop) {
                var y = (ytop + MidiSheetMusic.SheetMusic.NoteHeight) | 0;

                g.FillRectangle(MidiSheetMusic.Brushes.Black, 0, y, MidiSheetMusic.SheetMusic.NoteWidth, ((Bridge.Int.div(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0));
            },
            DrawHalf: function (g, pen, ytop) {
                var y = (((ytop + MidiSheetMusic.SheetMusic.NoteHeight) | 0) + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0)) | 0;

                g.FillRectangle(MidiSheetMusic.Brushes.Black, 0, y, MidiSheetMusic.SheetMusic.NoteWidth, ((Bridge.Int.div(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0));
            },
            DrawQuarter: function (g, pen, ytop) {
                pen.EndCap = MidiSheetMusic.LineCap.Flat;

                var y = (ytop + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0)) | 0;
                var x = 2;
                var xend = (x + ((Bridge.Int.div(Bridge.Int.mul(2, MidiSheetMusic.SheetMusic.NoteHeight), 3)) | 0)) | 0;
                pen.Width = 1;
                g.DrawLine(pen, x, y, ((xend - 1) | 0), ((((y + MidiSheetMusic.SheetMusic.NoteHeight) | 0) - 1) | 0));

                pen.Width = (Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0;
                y = (((ytop + MidiSheetMusic.SheetMusic.NoteHeight) | 0) + 1) | 0;
                g.DrawLine(pen, ((xend - 2) | 0), y, x, ((y + MidiSheetMusic.SheetMusic.NoteHeight) | 0));

                pen.Width = 1;
                y = (((ytop + Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0) - 1) | 0;
                g.DrawLine(pen, 0, y, ((xend + 2) | 0), ((y + MidiSheetMusic.SheetMusic.NoteHeight) | 0));

                pen.Width = (Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0;
                if (MidiSheetMusic.SheetMusic.NoteHeight === 6) {
                    g.DrawLine(pen, xend, ((((y + 1) | 0) + ((Bridge.Int.div(Bridge.Int.mul(3, MidiSheetMusic.SheetMusic.NoteHeight), 4)) | 0)) | 0), ((Bridge.Int.div(x, 2)) | 0), ((((y + 1) | 0) + ((Bridge.Int.div(Bridge.Int.mul(3, MidiSheetMusic.SheetMusic.NoteHeight), 4)) | 0)) | 0));
                } else { /* NoteHeight == 8 */
                    g.DrawLine(pen, xend, ((y + ((Bridge.Int.div(Bridge.Int.mul(3, MidiSheetMusic.SheetMusic.NoteHeight), 4)) | 0)) | 0), ((Bridge.Int.div(x, 2)) | 0), ((y + ((Bridge.Int.div(Bridge.Int.mul(3, MidiSheetMusic.SheetMusic.NoteHeight), 4)) | 0)) | 0));
                }

                pen.Width = 1;
                g.DrawLine(pen, 0, ((((y + ((Bridge.Int.div(Bridge.Int.mul(2, MidiSheetMusic.SheetMusic.NoteHeight), 3)) | 0)) | 0) + 1) | 0), ((xend - 1) | 0), ((y + ((Bridge.Int.div(Bridge.Int.mul(3, MidiSheetMusic.SheetMusic.NoteHeight), 2)) | 0)) | 0));
            },
            DrawEighth: function (g, pen, ytop) {
                var y = (((ytop + MidiSheetMusic.SheetMusic.NoteHeight) | 0) - 1) | 0;
                g.FillEllipse(MidiSheetMusic.Brushes.Black, 0, ((y + 1) | 0), ((MidiSheetMusic.SheetMusic.LineSpace - 1) | 0), ((MidiSheetMusic.SheetMusic.LineSpace - 1) | 0));
                pen.Width = 1;
                g.DrawLine(pen, ((Bridge.Int.div((((MidiSheetMusic.SheetMusic.LineSpace - 2) | 0)), 2)) | 0), ((((y + MidiSheetMusic.SheetMusic.LineSpace) | 0) - 1) | 0), ((Bridge.Int.div(Bridge.Int.mul(3, MidiSheetMusic.SheetMusic.LineSpace), 2)) | 0), ((y + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0)) | 0));
                g.DrawLine(pen, ((Bridge.Int.div(Bridge.Int.mul(3, MidiSheetMusic.SheetMusic.LineSpace), 2)) | 0), ((y + ((Bridge.Int.div(MidiSheetMusic.SheetMusic.LineSpace, 2)) | 0)) | 0), ((Bridge.Int.div(Bridge.Int.mul(3, MidiSheetMusic.SheetMusic.LineSpace), 4)) | 0), ((y + Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0));
            },
            toString: function () {
                return System.String.format("RestSymbol starttime={0} duration={1} width={2}", Bridge.box(this.starttime, System.Int32), Bridge.box(this.duration, MidiSheetMusic.NoteDuration, System.Enum.toStringFn(MidiSheetMusic.NoteDuration)), Bridge.box(this.width, System.Int32));
            }
        }
    });

    Bridge.define("MidiSheetMusic.SheetMusic", {
        inherits: [MidiSheetMusic.Control],
        statics: {
            fields: {
                LineWidth: 0,
                LeftMargin: 0,
                TitleHeight: 0,
                LineSpace: 0,
                StaffHeight: 0,
                NoteHeight: 0,
                NoteWidth: 0,
                PageWidth: 0,
                PageHeight: 0,
                LetterFont: null
            },
            ctors: {
                init: function () {
                    this.LineWidth = 1;
                    this.LeftMargin = 4;
                    this.TitleHeight = 14;
                    this.PageWidth = 800;
                    this.PageHeight = 1050;
                },
                ctor: function () {
                    MidiSheetMusic.SheetMusic.SetNoteSize(false);
                }
            },
            methods: {
                IsChord: function (symbol) {
                    return Bridge.is(symbol, MidiSheetMusic.ChordSymbol);
                },
                FindConsecutiveChords: function (symbols, time, startIndex, chordIndexes, horizDistance) {

                    var i = startIndex;
                    var numChords = chordIndexes.length;

                    while (true) {
                        horizDistance.v = 0;

                        /* Find the starting chord */
                        while (i < ((symbols.Count - numChords) | 0)) {
                            if (Bridge.is(symbols.getItem(i), MidiSheetMusic.ChordSymbol)) {
                                var c = Bridge.cast(symbols.getItem(i), MidiSheetMusic.ChordSymbol);
                                if (c.Stem != null) {
                                    break;
                                }
                            }
                            i = (i + 1) | 0;
                        }
                        if (i >= ((symbols.Count - numChords) | 0)) {
                            chordIndexes[System.Array.index(0, chordIndexes)] = -1;
                            return false;
                        }
                        chordIndexes[System.Array.index(0, chordIndexes)] = i;
                        var foundChords = true;
                        for (var chordIndex = 1; chordIndex < numChords; chordIndex = (chordIndex + 1) | 0) {
                            i = (i + 1) | 0;
                            var remaining = (((numChords - 1) | 0) - chordIndex) | 0;
                            while ((i < ((symbols.Count - remaining) | 0)) && (Bridge.is(symbols.getItem(i), MidiSheetMusic.BlankSymbol))) {
                                horizDistance.v = (horizDistance.v + symbols.getItem(i).Width) | 0;
                                i = (i + 1) | 0;
                            }
                            if (i >= ((symbols.Count - remaining) | 0)) {
                                return false;
                            }
                            if (!(Bridge.is(symbols.getItem(i), MidiSheetMusic.ChordSymbol))) {
                                foundChords = false;
                                break;
                            }
                            chordIndexes[System.Array.index(chordIndex, chordIndexes)] = i;
                            horizDistance.v = (horizDistance.v + symbols.getItem(i).Width) | 0;
                        }
                        if (foundChords) {
                            return true;
                        }

                        /* Else, start searching again from index i */
                    }
                },
                CreateBeamedChords: function (allsymbols, time, numChords, startBeat) {
                    var $t;
                    var chordIndexes = System.Array.init(numChords, 0, System.Int32);
                    var chords = System.Array.init(numChords, null, MidiSheetMusic.ChordSymbol);

                    $t = Bridge.getEnumerator(allsymbols);
                    try {
                        while ($t.moveNext()) {
                            var symbols = $t.Current;
                            var startIndex = 0;
                            while (true) {
                                var horizDistance = { v : 0 };
                                var found = MidiSheetMusic.SheetMusic.FindConsecutiveChords(symbols, time, startIndex, chordIndexes, horizDistance);
                                if (!found) {
                                    break;
                                }
                                for (var i = 0; i < numChords; i = (i + 1) | 0) {
                                    chords[System.Array.index(i, chords)] = Bridge.cast(symbols.getItem(chordIndexes[System.Array.index(i, chordIndexes)]), MidiSheetMusic.ChordSymbol);
                                }

                                if (MidiSheetMusic.ChordSymbol.CanCreateBeam(chords, time, startBeat)) {
                                    MidiSheetMusic.ChordSymbol.CreateBeam(chords, horizDistance.v);
                                    startIndex = (chordIndexes[System.Array.index(((numChords - 1) | 0), chordIndexes)] + 1) | 0;
                                } else {
                                    startIndex = (chordIndexes[System.Array.index(0, chordIndexes)] + 1) | 0;
                                }

                                /* What is the value of startIndex here?
                                  If we created a beam, we start after the last chord.
                                  If we failed to create a beam, we start after the first chord.
                                */
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }},
                CreateAllBeamedChords: function (allsymbols, time) {
                    if ((time.Numerator === 3 && time.Denominator === 4) || (time.Numerator === 6 && time.Denominator === 8) || (time.Numerator === 6 && time.Denominator === 4)) {

                        MidiSheetMusic.SheetMusic.CreateBeamedChords(allsymbols, time, 6, true);
                    }
                    MidiSheetMusic.SheetMusic.CreateBeamedChords(allsymbols, time, 3, true);
                    MidiSheetMusic.SheetMusic.CreateBeamedChords(allsymbols, time, 4, true);
                    MidiSheetMusic.SheetMusic.CreateBeamedChords(allsymbols, time, 2, true);
                    MidiSheetMusic.SheetMusic.CreateBeamedChords(allsymbols, time, 2, false);
                },
                KeySignatureWidth: function (key) {
                    var $t;
                    var clefsym = new MidiSheetMusic.ClefSymbol(MidiSheetMusic.Clef.Treble, 0, false);
                    var result = clefsym.MinWidth;
                    var keys = key.GetSymbols(MidiSheetMusic.Clef.Treble);
                    $t = Bridge.getEnumerator(keys);
                    try {
                        while ($t.moveNext()) {
                            var symbol = $t.Current;
                            result = (result + symbol.MinWidth) | 0;
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }return ((((result + MidiSheetMusic.SheetMusic.LeftMargin) | 0) + 5) | 0);
                },
                GetLyrics: function (tracks) {
                    var $t;
                    var hasLyrics = false;
                    var result = System.Array.init(tracks.Count, null, System.Collections.Generic.List$1(MidiSheetMusic.LyricSymbol));
                    for (var tracknum = 0; tracknum < tracks.Count; tracknum = (tracknum + 1) | 0) {
                        var track = tracks.getItem(tracknum);
                        if (track.Lyrics == null) {
                            continue;
                        }
                        hasLyrics = true;
                        result[System.Array.index(tracknum, result)] = new (System.Collections.Generic.List$1(MidiSheetMusic.LyricSymbol)).ctor();
                        $t = Bridge.getEnumerator(track.Lyrics);
                        try {
                            while ($t.moveNext()) {
                                var ev = $t.Current;
                                var text = System.Text.Encoding.UTF8.GetString$1(ev.Value, 0, ev.Value.length);
                                var sym = new MidiSheetMusic.LyricSymbol(ev.StartTime, text);
                                result[System.Array.index(tracknum, result)].add(sym);
                            }
                        } finally {
                            if (Bridge.is($t, System.IDisposable)) {
                                $t.System$IDisposable$dispose();
                            }
                        }}
                    if (!hasLyrics) {
                        return null;
                    } else {
                        return result;
                    }
                },
                AddLyricsToStaffs: function (staffs, tracklyrics) {
                    var $t;
                    $t = Bridge.getEnumerator(staffs);
                    try {
                        while ($t.moveNext()) {
                            var staff = $t.Current;
                            var lyrics = tracklyrics[System.Array.index(staff.Track, tracklyrics)];
                            staff.AddLyrics(lyrics);
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }},
                SetNoteSize: function (largenotes) {
                    if (largenotes) {
                        MidiSheetMusic.SheetMusic.LineSpace = 7;
                    } else {
                        MidiSheetMusic.SheetMusic.LineSpace = 5;
                    }

                    MidiSheetMusic.SheetMusic.StaffHeight = (Bridge.Int.mul(MidiSheetMusic.SheetMusic.LineSpace, 4) + 5) | 0;
                    MidiSheetMusic.SheetMusic.NoteHeight = (MidiSheetMusic.SheetMusic.LineSpace + MidiSheetMusic.SheetMusic.LineWidth) | 0;
                    MidiSheetMusic.SheetMusic.NoteWidth = (Bridge.Int.div(Bridge.Int.mul(3, MidiSheetMusic.SheetMusic.LineSpace), 2)) | 0;
                    MidiSheetMusic.SheetMusic.LetterFont = new MidiSheetMusic.Font("Arial", 8, MidiSheetMusic.FontStyle.Regular);
                }
            }
        },
        fields: {
            staffs: null,
            mainkey: null,
            numtracks: 0,
            zoom: 0,
            scrollVert: false,
            filename: null,
            showNoteLetters: 0,
            NoteColors: null,
            shadeBrush: null,
            shade2Brush: null,
            pen: null
        },
        props: {
            ShadeBrush: {
                get: function () {
                    return this.shadeBrush;
                }
            },
            Shade2Brush: {
                get: function () {
                    return this.shade2Brush;
                }
            },
            ShowNoteLetters: {
                get: function () {
                    return this.showNoteLetters;
                }
            },
            MainKey: {
                get: function () {
                    return this.mainkey;
                }
            }
        },
        ctors: {
            ctor: function (file, options) {
                this.$initialize();
                MidiSheetMusic.Control.ctor.call(this);
                this.init(file, options);
            },
            $ctor1: function (data, title, options) {
                this.$initialize();
                MidiSheetMusic.Control.ctor.call(this);
                var file = new MidiSheetMusic.MidiFile(data, title);
                this.init(file, options);
            }
        },
        methods: {
            init: function (file, options) {
                var $t;
                if (options == null) {
                    options = new MidiSheetMusic.MidiOptions.$ctor1(file);
                }
                this.zoom = 1.0;
                this.filename = file.FileName;

                this.SetColors(options.colors, options.shadeColor, options.shade2Color);
                this.pen = new MidiSheetMusic.Pen(MidiSheetMusic.Color.Black, 1);

                var tracks = file.ChangeMidiNotes(options);
                MidiSheetMusic.SheetMusic.SetNoteSize(options.largeNoteSize);
                this.scrollVert = options.scrollVert;
                this.showNoteLetters = options.showNoteLetters;
                var time = file.Time;
                if (options.time != null) {
                    time = options.time;
                }
                if (options.key === -1) {
                    this.mainkey = this.GetKeySignature(tracks);
                } else {
                    this.mainkey = new MidiSheetMusic.KeySignature.ctor(options.key);
                }

                this.numtracks = tracks.Count;

                var lastStart = (file.EndTime() + options.shifttime) | 0;

                /* Create all the music symbols (notes, rests, vertical bars, and
                  clef changes).  The symbols variable contains a list of music 
                  symbols for each track.  The list does not include the left-side 
                  Clef and key signature symbols.  Those can only be calculated 
                  when we create the staffs.
                */
                var symbols = System.Array.init(this.numtracks, null, System.Collections.Generic.List$1(MidiSheetMusic.MusicSymbol));
                for (var tracknum = 0; tracknum < this.numtracks; tracknum = (tracknum + 1) | 0) {
                    var track = tracks.getItem(tracknum);
                    var clefs = new MidiSheetMusic.ClefMeasures(track.Notes, time.Measure);
                    var chords = this.CreateChords(track.Notes, this.mainkey, time, clefs);
                    symbols[System.Array.index(tracknum, symbols)] = this.CreateSymbols(chords, clefs, time, lastStart);
                }

                var lyrics = null;
                if (options.showLyrics) {
                    lyrics = MidiSheetMusic.SheetMusic.GetLyrics(tracks);
                }

                /* Vertically align the music symbols */
                var widths = new MidiSheetMusic.SymbolWidths(symbols, lyrics);
                this.AlignSymbols(symbols, widths, options);

                this.staffs = this.CreateStaffs(symbols, this.mainkey, options, time.Measure);
                MidiSheetMusic.SheetMusic.CreateAllBeamedChords(symbols, time);
                if (lyrics != null) {
                    MidiSheetMusic.SheetMusic.AddLyricsToStaffs(this.staffs, lyrics);
                }

                /* After making chord pairs, the stem directions can change,
                  which affects the staff height.  Re-calculate the staff height.
                */
                $t = Bridge.getEnumerator(this.staffs);
                try {
                    while ($t.moveNext()) {
                        var staff = $t.Current;
                        staff.CalculateHeight();
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }
                this.BackColor = MidiSheetMusic.Color.White;

                this.SetZoom(1.0);
            },
            GetKeySignature: function (tracks) {
                var $t, $t1;
                var notenums = new (System.Collections.Generic.List$1(System.Int32)).ctor();
                $t = Bridge.getEnumerator(tracks);
                try {
                    while ($t.moveNext()) {
                        var track = $t.Current;
                        $t1 = Bridge.getEnumerator(track.Notes);
                        try {
                            while ($t1.moveNext()) {
                                var note = $t1.Current;
                                notenums.add(note.Number);
                            }
                        } finally {
                            if (Bridge.is($t1, System.IDisposable)) {
                                $t1.System$IDisposable$dispose();
                            }
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }return MidiSheetMusic.KeySignature.Guess(notenums);
            },
            CreateChords: function (midinotes, key, time, clefs) {

                var i = 0;
                var chords = new (System.Collections.Generic.List$1(MidiSheetMusic.ChordSymbol)).ctor();
                var notegroup = new (System.Collections.Generic.List$1(MidiSheetMusic.MidiNote)).$ctor2(12);
                var len = midinotes.Count;

                while (i < len) {

                    var starttime = midinotes.getItem(i).StartTime;
                    var clef = clefs.GetClef(starttime);

                    /* Group all the midi notes with the same start time
                      into the notes list.
                    */
                    notegroup.clear();
                    notegroup.add(midinotes.getItem(i));
                    i = (i + 1) | 0;
                    while (i < len && midinotes.getItem(i).StartTime === starttime) {
                        notegroup.add(midinotes.getItem(i));
                        i = (i + 1) | 0;
                    }

                    /* Create a single chord from the group of midi notes with
                      the same start time.
                    */
                    var chord = new MidiSheetMusic.ChordSymbol(notegroup, key, time, clef, this);
                    chords.add(chord);
                }

                return chords;
            },
            CreateSymbols: function (chords, clefs, time, lastStart) {

                var symbols = new (System.Collections.Generic.List$1(MidiSheetMusic.MusicSymbol)).ctor();
                symbols = this.AddBars(chords, time, lastStart);
                symbols = this.AddRests(symbols, time);
                symbols = this.AddClefChanges(symbols, clefs, time);

                return symbols;
            },
            AddBars: function (chords, time, lastStart) {

                var symbols = new (System.Collections.Generic.List$1(MidiSheetMusic.MusicSymbol)).ctor();

                var timesig = new MidiSheetMusic.TimeSigSymbol(time.Numerator, time.Denominator);
                symbols.add(timesig);

                /* The starttime of the beginning of the measure */
                var measuretime = 0;

                var i = 0;
                while (i < chords.Count) {
                    if (measuretime <= chords.getItem(i).StartTime) {
                        symbols.add(new MidiSheetMusic.BarSymbol(measuretime));
                        measuretime = (measuretime + time.Measure) | 0;
                    } else {
                        symbols.add(chords.getItem(i));
                        i = (i + 1) | 0;
                    }
                }

                /* Keep adding bars until the last StartTime (the end of the song) */
                while (measuretime < lastStart) {
                    symbols.add(new MidiSheetMusic.BarSymbol(measuretime));
                    measuretime = (measuretime + time.Measure) | 0;
                }

                /* Add the final vertical bar to the last measure */
                symbols.add(new MidiSheetMusic.BarSymbol(measuretime));
                return symbols;
            },
            AddRests: function (symbols, time) {
                var $t, $t1;
                var prevtime = 0;

                var result = new (System.Collections.Generic.List$1(MidiSheetMusic.MusicSymbol)).$ctor2(symbols.Count);

                $t = Bridge.getEnumerator(symbols);
                try {
                    while ($t.moveNext()) {
                        var symbol = $t.Current;
                        var starttime = symbol.StartTime;
                        var rests = this.GetRests(time, prevtime, starttime);
                        if (rests != null) {
                            $t1 = Bridge.getEnumerator(rests);
                            try {
                                while ($t1.moveNext()) {
                                    var r = $t1.Current;
                                    result.add(r);
                                }
                            } finally {
                                if (Bridge.is($t1, System.IDisposable)) {
                                    $t1.System$IDisposable$dispose();
                                }
                            }}

                        result.add(symbol);

                        /* Set prevtime to the end time of the last note/symbol. */
                        if (Bridge.is(symbol, MidiSheetMusic.ChordSymbol)) {
                            var chord = Bridge.cast(symbol, MidiSheetMusic.ChordSymbol);
                            prevtime = Math.max(chord.EndTime, prevtime);
                        } else {
                            prevtime = Math.max(starttime, prevtime);
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }return result;
            },
            GetRests: function (time, start, end) {
                var result;
                var r1, r2;

                if (((end - start) | 0) < 0) {
                    return null;
                }

                var dur = time.GetNoteDuration(((end - start) | 0));
                switch (dur) {
                    case MidiSheetMusic.NoteDuration.Whole: 
                    case MidiSheetMusic.NoteDuration.Half: 
                    case MidiSheetMusic.NoteDuration.Quarter: 
                    case MidiSheetMusic.NoteDuration.Eighth: 
                        r1 = new MidiSheetMusic.RestSymbol(start, dur);
                        result = System.Array.init([r1], MidiSheetMusic.RestSymbol);
                        return result;
                    case MidiSheetMusic.NoteDuration.DottedHalf: 
                        r1 = new MidiSheetMusic.RestSymbol(start, MidiSheetMusic.NoteDuration.Half);
                        r2 = new MidiSheetMusic.RestSymbol(((start + Bridge.Int.mul(time.Quarter, 2)) | 0), MidiSheetMusic.NoteDuration.Quarter);
                        result = System.Array.init([r1, r2], MidiSheetMusic.RestSymbol);
                        return result;
                    case MidiSheetMusic.NoteDuration.DottedQuarter: 
                        r1 = new MidiSheetMusic.RestSymbol(start, MidiSheetMusic.NoteDuration.Quarter);
                        r2 = new MidiSheetMusic.RestSymbol(((start + time.Quarter) | 0), MidiSheetMusic.NoteDuration.Eighth);
                        result = System.Array.init([r1, r2], MidiSheetMusic.RestSymbol);
                        return result;
                    case MidiSheetMusic.NoteDuration.DottedEighth: 
                        r1 = new MidiSheetMusic.RestSymbol(start, MidiSheetMusic.NoteDuration.Eighth);
                        r2 = new MidiSheetMusic.RestSymbol(((start + ((Bridge.Int.div(time.Quarter, 2)) | 0)) | 0), MidiSheetMusic.NoteDuration.Sixteenth);
                        result = System.Array.init([r1, r2], MidiSheetMusic.RestSymbol);
                        return result;
                    default: 
                        return null;
                }
            },
            AddClefChanges: function (symbols, clefs, time) {
                var $t;

                var result = new (System.Collections.Generic.List$1(MidiSheetMusic.MusicSymbol)).$ctor2(symbols.Count);
                var prevclef = clefs.GetClef(0);
                $t = Bridge.getEnumerator(symbols);
                try {
                    while ($t.moveNext()) {
                        var symbol = $t.Current;
                        /* A BarSymbol indicates a new measure */
                        if (Bridge.is(symbol, MidiSheetMusic.BarSymbol)) {
                            var clef = clefs.GetClef(symbol.StartTime);
                            if (clef !== prevclef) {
                                result.add(new MidiSheetMusic.ClefSymbol(clef, ((symbol.StartTime - 1) | 0), true));
                            }
                            prevclef = clef;
                        }
                        result.add(symbol);
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }return result;
            },
            AlignSymbols: function (allsymbols, widths, options) {
                var $t, $t1;

                // If we show measure numbers, increase bar symbol width
                if (options.showMeasures) {
                    for (var track = 0; track < allsymbols.length; track = (track + 1) | 0) {
                        var symbols = allsymbols[System.Array.index(track, allsymbols)];
                        $t = Bridge.getEnumerator(symbols);
                        try {
                            while ($t.moveNext()) {
                                var sym = $t.Current;
                                if (Bridge.is(sym, MidiSheetMusic.BarSymbol)) {
                                    sym.Width = (sym.Width + MidiSheetMusic.SheetMusic.NoteWidth) | 0;
                                }
                            }
                        } finally {
                            if (Bridge.is($t, System.IDisposable)) {
                                $t.System$IDisposable$dispose();
                            }
                        }}
                }

                for (var track1 = 0; track1 < allsymbols.length; track1 = (track1 + 1) | 0) {
                    var symbols1 = allsymbols[System.Array.index(track1, allsymbols)];
                    var result = new (System.Collections.Generic.List$1(MidiSheetMusic.MusicSymbol)).ctor();

                    var i = 0;

                    /* If a track doesn't have a symbol for a starttime,
                      add a blank symbol.
                    */
                    $t1 = Bridge.getEnumerator(widths.StartTimes);
                    try {
                        while ($t1.moveNext()) {
                            var start = $t1.Current;

                            /* BarSymbols are not included in the SymbolWidths calculations */
                            while (i < symbols1.Count && (Bridge.is(symbols1.getItem(i), MidiSheetMusic.BarSymbol)) && symbols1.getItem(i).StartTime <= start) {
                                result.add(symbols1.getItem(i));
                                i = (i + 1) | 0;
                            }

                            if (i < symbols1.Count && symbols1.getItem(i).StartTime === start) {

                                while (i < symbols1.Count && symbols1.getItem(i).StartTime === start) {

                                    result.add(symbols1.getItem(i));
                                    i = (i + 1) | 0;
                                }
                            } else {
                                result.add(new MidiSheetMusic.BlankSymbol(start, 0));
                            }
                        }
                    } finally {
                        if (Bridge.is($t1, System.IDisposable)) {
                            $t1.System$IDisposable$dispose();
                        }
                    }
                    /* For each starttime, increase the symbol width by
                      SymbolWidths.GetExtraWidth().
                    */
                    i = 0;
                    while (i < result.Count) {
                        if (Bridge.is(result.getItem(i), MidiSheetMusic.BarSymbol)) {
                            i = (i + 1) | 0;
                            continue;
                        }
                        var start1 = result.getItem(i).StartTime;
                        var extra = widths.GetExtraWidth(track1, start1);
                        result.getItem(i).Width = (result.getItem(i).Width + extra) | 0;

                        /* Skip all remaining symbols with the same starttime. */
                        while (i < result.Count && result.getItem(i).StartTime === start1) {
                            i = (i + 1) | 0;
                        }
                    }
                    allsymbols[System.Array.index(track1, allsymbols)] = result;
                }
            },
            CreateStaffsForTrack: function (symbols, measurelen, key, options, track, totaltracks) {
                var keysigWidth = MidiSheetMusic.SheetMusic.KeySignatureWidth(key);
                var startindex = 0;
                var thestaffs = new (System.Collections.Generic.List$1(MidiSheetMusic.Staff)).$ctor2(((Bridge.Int.div(symbols.Count, 50)) | 0));

                while (startindex < symbols.Count) {
                    /* startindex is the index of the first symbol in the staff.
                      endindex is the index of the last symbol in the staff.
                    */
                    var endindex = startindex;
                    var width = keysigWidth;
                    var maxwidth;

                    /* If we're scrolling vertically, the maximum width is PageWidth. */
                    if (this.scrollVert) {
                        maxwidth = MidiSheetMusic.SheetMusic.PageWidth;
                    } else {
                        maxwidth = 2000000;
                    }

                    while (endindex < symbols.Count && ((width + symbols.getItem(endindex).Width) | 0) < maxwidth) {

                        width = (width + symbols.getItem(endindex).Width) | 0;
                        endindex = (endindex + 1) | 0;
                    }
                    endindex = (endindex - 1) | 0;

                    /* There's 3 possibilities at this point:
                      1. We have all the symbols in the track.
                         The endindex stays the same.

                      2. We have symbols for less than one measure.
                         The endindex stays the same.

                      3. We have symbols for 1 or more measures.
                         Since measures cannot span multiple staffs, we must
                         make sure endindex does not occur in the middle of a
                         measure.  We count backwards until we come to the end
                         of a measure.
                    */

                    if (endindex === ((symbols.Count - 1) | 0)) {
                        /* endindex stays the same */
                    } else if (((Bridge.Int.div(symbols.getItem(startindex).StartTime, measurelen)) | 0) === ((Bridge.Int.div(symbols.getItem(endindex).StartTime, measurelen)) | 0)) {
                        /* endindex stays the same */
                    } else {
                        var endmeasure = (Bridge.Int.div(symbols.getItem(((endindex + 1) | 0)).StartTime, measurelen)) | 0;
                        while (((Bridge.Int.div(symbols.getItem(endindex).StartTime, measurelen)) | 0) === endmeasure) {
                            endindex = (endindex - 1) | 0;
                        }
                    }
                    var range = (((endindex + 1) | 0) - startindex) | 0;
                    if (this.scrollVert) {
                        width = MidiSheetMusic.SheetMusic.PageWidth;
                    }
                    var staff = new MidiSheetMusic.Staff(symbols.getRange(startindex, range), key, options, track, totaltracks);
                    thestaffs.add(staff);
                    startindex = (endindex + 1) | 0;
                }
                return thestaffs;
            },
            CreateStaffs: function (allsymbols, key, options, measurelen) {
                var $t, $t1;

                var trackstaffs = System.Array.init(allsymbols.length, null, System.Collections.Generic.List$1(MidiSheetMusic.Staff));
                var totaltracks = trackstaffs.length;

                for (var track = 0; track < totaltracks; track = (track + 1) | 0) {
                    var symbols = allsymbols[System.Array.index(track, allsymbols)];
                    trackstaffs[System.Array.index(track, trackstaffs)] = this.CreateStaffsForTrack(symbols, measurelen, key, options, track, totaltracks);
                }

                /* Update the EndTime of each Staff. EndTime is used for playback */
                $t = Bridge.getEnumerator(trackstaffs);
                try {
                    while ($t.moveNext()) {
                        var list = $t.Current;
                        for (var i = 0; i < ((list.Count - 1) | 0); i = (i + 1) | 0) {
                            list.getItem(i).EndTime = list.getItem(((i + 1) | 0)).StartTime;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }
                /* Interleave the staffs of each track into the result array. */
                var maxstaffs = 0;
                for (var i1 = 0; i1 < trackstaffs.length; i1 = (i1 + 1) | 0) {
                    if (maxstaffs < trackstaffs[System.Array.index(i1, trackstaffs)].Count) {
                        maxstaffs = trackstaffs[System.Array.index(i1, trackstaffs)].Count;
                    }
                }
                var result = new (System.Collections.Generic.List$1(MidiSheetMusic.Staff)).$ctor2(Bridge.Int.mul(maxstaffs, trackstaffs.length));
                for (var i2 = 0; i2 < maxstaffs; i2 = (i2 + 1) | 0) {
                    $t1 = Bridge.getEnumerator(trackstaffs);
                    try {
                        while ($t1.moveNext()) {
                            var list1 = $t1.Current;
                            if (i2 < list1.Count) {
                                result.add(list1.getItem(i2));
                            }
                        }
                    } finally {
                        if (Bridge.is($t1, System.IDisposable)) {
                            $t1.System$IDisposable$dispose();
                        }
                    }}
                return result;
            },
            SetZoom: function (value) {
                var $t;
                this.zoom = value;
                var width = 0;
                var height = 0;
                $t = Bridge.getEnumerator(this.staffs);
                try {
                    while ($t.moveNext()) {
                        var staff = $t.Current;
                        width = Math.max(width, staff.Width * this.zoom);
                        height += (staff.Height * this.zoom);
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }this.Width = Bridge.Int.clip32(width + 2);
                this.Height = (Bridge.Int.clip32(height) + MidiSheetMusic.SheetMusic.LeftMargin) | 0;
                this.Invalidate();
            },
            SetColors: function (newcolors, newshade, newshade2) {
                if (this.NoteColors == null) {
                    this.NoteColors = System.Array.init(12, null, MidiSheetMusic.Color);
                    for (var i = 0; i < 12; i = (i + 1) | 0) {
                        this.NoteColors[System.Array.index(i, this.NoteColors)] = MidiSheetMusic.Color.Black;
                    }
                }
                if (newcolors != null) {
                    for (var i1 = 0; i1 < 12; i1 = (i1 + 1) | 0) {
                        this.NoteColors[System.Array.index(i1, this.NoteColors)] = newcolors[System.Array.index(i1, newcolors)];
                    }
                } else {
                    for (var i2 = 0; i2 < 12; i2 = (i2 + 1) | 0) {
                        this.NoteColors[System.Array.index(i2, this.NoteColors)] = MidiSheetMusic.Color.Black;
                    }
                }
                if (this.shadeBrush != null) {
                    this.shadeBrush.Dispose();
                    this.shade2Brush.Dispose();
                }
                this.shadeBrush = new MidiSheetMusic.SolidBrush(newshade);
                this.shade2Brush = new MidiSheetMusic.SolidBrush(newshade2);
            },
            NoteColor: function (number) {
                return this.NoteColors[System.Array.index(MidiSheetMusic.NoteScale.FromNumber(number), this.NoteColors)];
            },
            OnPaint: function (e) {
                var $t;
                var clip = new MidiSheetMusic.Rectangle(Bridge.Int.clip32(e.ClipRectangle.X / this.zoom), Bridge.Int.clip32(e.ClipRectangle.Y / this.zoom), Bridge.Int.clip32(e.ClipRectangle.Width / this.zoom), Bridge.Int.clip32(e.ClipRectangle.Height / this.zoom));

                var g = e.Graphics();
                g.ScaleTransform(this.zoom, this.zoom);
                /* g.PageScale = zoom; */
                g.SmoothingMode = MidiSheetMusic.SmoothingMode.AntiAlias;
                var ypos = 0;
                $t = Bridge.getEnumerator(this.staffs);
                try {
                    while ($t.moveNext()) {
                        var staff = $t.Current;
                        if ((((ypos + staff.Height) | 0) < clip.Y) || (ypos > ((clip.Y + clip.Height) | 0))) {
                            /* Staff is not in the clip, don't need to draw it */
                        } else {
                            g.TranslateTransform(0, ypos);
                            staff.Draw(g, clip, this.pen);
                            g.TranslateTransform(0, ((-ypos) | 0));
                        }

                        ypos = (ypos + staff.Height) | 0;
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }g.ScaleTransform(1.0 / this.zoom, 1.0 / this.zoom);
            },
            DrawTitle: function (g) {
                var leftmargin = 20;
                var topmargin = 20;
                var title = MidiSheetMusic.Path.GetFileName(this.filename);
                title = System.String.replaceAll(System.String.replaceAll(title, ".mid", ""), "_", " ");
                var font = new MidiSheetMusic.Font("Arial", 10, MidiSheetMusic.FontStyle.Bold);
                g.TranslateTransform(leftmargin, topmargin);
                g.DrawString(title, font, MidiSheetMusic.Brushes.Black, 0, 0);
                g.TranslateTransform(((-leftmargin) | 0), ((-topmargin) | 0));
                font.Dispose();
            },
            DoPrint: function (g, pagenumber) {
                var leftmargin = 20;
                var topmargin = 20;
                var rightmargin = 20;
                var bottommargin = 20;

                var scale = (Bridge.Int.div((((((g.VisibleClipBounds.Width - leftmargin) | 0) - rightmargin) | 0)), MidiSheetMusic.SheetMusic.PageWidth)) | 0;
                g.PageScale = scale;

                var viewPageHeight = Bridge.Int.clip32((((((g.VisibleClipBounds.Height - topmargin) | 0) - bottommargin) | 0)) / scale);

                g.SmoothingMode = MidiSheetMusic.SmoothingMode.AntiAlias;
                g.FillRectangle(MidiSheetMusic.Brushes.White, 0, 0, g.VisibleClipBounds.Width, g.VisibleClipBounds.Height);

                var clip = new MidiSheetMusic.Rectangle(0, 0, MidiSheetMusic.SheetMusic.PageWidth, MidiSheetMusic.SheetMusic.PageHeight);

                var ypos = MidiSheetMusic.SheetMusic.TitleHeight;
                var pagenum = 1;
                var staffnum = 0;

                if (this.numtracks === 2 && (this.staffs.Count % 2) === 0) {
                    /* Skip the staffs until we reach the given page number */
                    while (((staffnum + 1) | 0) < this.staffs.Count && pagenum < pagenumber) {
                        var heights = (this.staffs.getItem(staffnum).Height + this.staffs.getItem(((staffnum + 1) | 0)).Height) | 0;
                        if (((ypos + heights) | 0) >= viewPageHeight) {
                            pagenum = (pagenum + 1) | 0;
                            ypos = 0;
                        } else {
                            ypos = (ypos + heights) | 0;
                            staffnum = (staffnum + 2) | 0;
                        }
                    }
                    /* Print the staffs until the height reaches viewPageHeight */
                    if (pagenum === 1) {
                        this.DrawTitle(g);
                        ypos = MidiSheetMusic.SheetMusic.TitleHeight;
                    } else {
                        ypos = 0;
                    }
                    for (; ((staffnum + 1) | 0) < this.staffs.Count; staffnum = (staffnum + 2) | 0) {
                        var heights1 = (this.staffs.getItem(staffnum).Height + this.staffs.getItem(((staffnum + 1) | 0)).Height) | 0;

                        if (((ypos + heights1) | 0) >= viewPageHeight) {
                            break;
                        }

                        g.TranslateTransform(leftmargin, ((topmargin + ypos) | 0));
                        this.staffs.getItem(staffnum).Draw(g, clip, this.pen);
                        g.TranslateTransform(((-leftmargin) | 0), ((-(((topmargin + ypos) | 0))) | 0));
                        ypos = (ypos + this.staffs.getItem(staffnum).Height) | 0;
                        g.TranslateTransform(leftmargin, ((topmargin + ypos) | 0));
                        this.staffs.getItem(((staffnum + 1) | 0)).Draw(g, clip, this.pen);
                        g.TranslateTransform(((-leftmargin) | 0), ((-(((topmargin + ypos) | 0))) | 0));
                        ypos = (ypos + this.staffs.getItem(((staffnum + 1) | 0)).Height) | 0;
                    }
                } else {
                    /* Skip the staffs until we reach the given page number */
                    while (staffnum < this.staffs.Count && pagenum < pagenumber) {
                        if (((ypos + this.staffs.getItem(staffnum).Height) | 0) >= viewPageHeight) {
                            pagenum = (pagenum + 1) | 0;
                            ypos = 0;
                        } else {
                            ypos = (ypos + this.staffs.getItem(staffnum).Height) | 0;
                            staffnum = (staffnum + 1) | 0;
                        }
                    }

                    /* Print the staffs until the height reaches viewPageHeight */
                    if (pagenum === 1) {
                        this.DrawTitle(g);
                        ypos = MidiSheetMusic.SheetMusic.TitleHeight;
                    } else {
                        ypos = 0;
                    }
                    for (; staffnum < this.staffs.Count; staffnum = (staffnum + 1) | 0) {
                        if (((ypos + this.staffs.getItem(staffnum).Height) | 0) >= viewPageHeight) {
                            break;
                        }

                        g.TranslateTransform(leftmargin, ((topmargin + ypos) | 0));
                        this.staffs.getItem(staffnum).Draw(g, clip, this.pen);
                        g.TranslateTransform(((-leftmargin) | 0), ((-(((topmargin + ypos) | 0))) | 0));
                        ypos = (ypos + this.staffs.getItem(staffnum).Height) | 0;
                    }
                }

                /* Draw the page number */
                var font = new MidiSheetMusic.Font("Arial", 10, MidiSheetMusic.FontStyle.Bold);
                g.DrawString("" + pagenumber, font, MidiSheetMusic.Brushes.Black, ((MidiSheetMusic.SheetMusic.PageWidth - leftmargin) | 0), ((((topmargin + viewPageHeight) | 0) - 12) | 0));
                font.Dispose();
            },
            GetTotalPages: function () {
                var $t;
                var num = 1;
                var currheight = MidiSheetMusic.SheetMusic.TitleHeight;

                if (this.numtracks === 2 && (this.staffs.Count % 2) === 0) {
                    for (var i = 0; i < this.staffs.Count; i = (i + 2) | 0) {
                        var heights = (this.staffs.getItem(i).Height + this.staffs.getItem(((i + 1) | 0)).Height) | 0;
                        if (((currheight + heights) | 0) > MidiSheetMusic.SheetMusic.PageHeight) {
                            num = (num + 1) | 0;
                            currheight = heights;
                        } else {
                            currheight = (currheight + heights) | 0;
                        }
                    }
                } else {
                    $t = Bridge.getEnumerator(this.staffs);
                    try {
                        while ($t.moveNext()) {
                            var staff = $t.Current;
                            if (((currheight + staff.Height) | 0) > MidiSheetMusic.SheetMusic.PageHeight) {
                                num = (num + 1) | 0;
                                currheight = staff.Height;
                            } else {
                                currheight = (currheight + staff.Height) | 0;
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }}
                return num;
            },
            ShadeNotes: function (currentPulseTime, prevPulseTime, scrollGradually) {
                var $t;
                var g = this.CreateGraphics("shadeNotes");
                g.SmoothingMode = MidiSheetMusic.SmoothingMode.AntiAlias;
                g.ScaleTransform(this.zoom, this.zoom);
                var ypos = 0;

                var x_shade = { v : 0 };
                var y_shade = 0;

                $t = Bridge.getEnumerator(this.staffs);
                try {
                    while ($t.moveNext()) {
                        var staff = $t.Current;
                        g.TranslateTransform(0, ypos);
                        staff.ShadeNotes(g, this.shadeBrush, this.pen, currentPulseTime, prevPulseTime, x_shade);
                        g.TranslateTransform(0, ((-ypos) | 0));
                        ypos = (ypos + staff.Height) | 0;
                        if (currentPulseTime >= staff.EndTime) {
                            y_shade = (y_shade + staff.Height) | 0;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }g.ScaleTransform(1.0 / this.zoom, 1.0 / this.zoom);
                g.Dispose();
                x_shade.v = Bridge.Int.clip32(x_shade.v * this.zoom);
                y_shade = (y_shade - MidiSheetMusic.SheetMusic.NoteHeight) | 0;
                y_shade = Bridge.Int.clip32(y_shade * this.zoom);
                if (currentPulseTime >= 0) {
                    this.ScrollToShadedNotes(x_shade.v, y_shade, scrollGradually);
                }
            },
            ScrollToShadedNotes: function (x_shade, y_shade, scrollGradually) {
                var scrollview = this.Parent;
                var scrollPos = scrollview.AutoScrollPosition;

                /* The scroll position is in negative coordinates for some reason */
                scrollPos.X = (-scrollPos.X) | 0;
                scrollPos.Y = (-scrollPos.Y) | 0;
                var newPos = scrollPos;

                if (this.scrollVert) {
                    var scrollDist = ((y_shade - scrollPos.Y) | 0);

                    if (scrollGradually) {
                        if (scrollDist > (this.zoom * MidiSheetMusic.SheetMusic.StaffHeight * 8)) {
                            scrollDist = (Bridge.Int.div(scrollDist, 2)) | 0;
                        } else {
                            if (scrollDist > (Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 3) * this.zoom)) {
                                scrollDist = Bridge.Int.clip32(Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 3) * this.zoom);
                            }
                        }
                    }
                    newPos = new MidiSheetMusic.Point(scrollPos.X, ((scrollPos.Y + scrollDist) | 0));
                } else {
                    var x_view = (scrollPos.X + ((Bridge.Int.div(Bridge.Int.mul(40, scrollview.Width), 100)) | 0)) | 0;
                    var xmax = (scrollPos.X + ((Bridge.Int.div(Bridge.Int.mul(65, scrollview.Width), 100)) | 0)) | 0;
                    var scrollDist1 = (x_shade - x_view) | 0;

                    if (scrollGradually) {
                        if (x_shade > xmax) {
                            scrollDist1 = (Bridge.Int.div((((x_shade - x_view) | 0)), 3)) | 0;
                        } else {
                            if (x_shade > x_view) {
                                scrollDist1 = (Bridge.Int.div((((x_shade - x_view) | 0)), 6)) | 0;
                            }
                        }
                    }

                    newPos = new MidiSheetMusic.Point(((scrollPos.X + scrollDist1) | 0), scrollPos.Y);
                    if (newPos.X < 0) {
                        newPos.X = 0;
                    }
                }
                scrollview.AutoScrollPosition = newPos;
            },
            PulseTimeForPoint: function (point) {
                var $t;
                var scaledPoint = new MidiSheetMusic.Point(Bridge.Int.clip32(point.X / this.zoom), Bridge.Int.clip32(point.Y / this.zoom));
                var y = 0;
                $t = Bridge.getEnumerator(this.staffs);
                try {
                    while ($t.moveNext()) {
                        var staff = $t.Current;
                        if (scaledPoint.Y >= y && scaledPoint.Y <= ((y + staff.Height) | 0)) {
                            return staff.PulseTimeForPoint(scaledPoint);
                        }
                        y = (y + staff.Height) | 0;
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }return -1;
            },
            toString: function () {
                var $t;
                var result = "SheetMusic staffs=" + this.staffs.Count + "\n";
                $t = Bridge.getEnumerator(this.staffs);
                try {
                    while ($t.moveNext()) {
                        var staff = $t.Current;
                        result = (result || "") + ((staff.toString()) || "");
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }result = (result || "") + "End SheetMusic\n";
                return result;
            }
        }
    });

    Bridge.define("MidiSheetMusic.SolidBrush", {
        inherits: [MidiSheetMusic.Brush],
        ctors: {
            ctor: function (color) {
                this.$initialize();
                MidiSheetMusic.Brush.ctor.call(this, color);
            }
        }
    });

    Bridge.define("MidiSheetMusic.TimeSigSymbol", {
        inherits: [MidiSheetMusic.MusicSymbol],
        statics: {
            fields: {
                images: null
            },
            methods: {
                LoadImages: function () {
                    if (MidiSheetMusic.TimeSigSymbol.images == null) {
                        MidiSheetMusic.TimeSigSymbol.images = System.Array.init(13, null, MidiSheetMusic.Image);
                        for (var i = 0; i < 13; i = (i + 1) | 0) {
                            MidiSheetMusic.TimeSigSymbol.images[System.Array.index(i, MidiSheetMusic.TimeSigSymbol.images)] = null;
                        }
                        MidiSheetMusic.TimeSigSymbol.images[System.Array.index(2, MidiSheetMusic.TimeSigSymbol.images)] = new MidiSheetMusic.Bitmap(MidiSheetMusic.TimeSigSymbol, "Resources.Images.two.png");
                        MidiSheetMusic.TimeSigSymbol.images[System.Array.index(3, MidiSheetMusic.TimeSigSymbol.images)] = new MidiSheetMusic.Bitmap(MidiSheetMusic.TimeSigSymbol, "Resources.Images.three.png");
                        MidiSheetMusic.TimeSigSymbol.images[System.Array.index(4, MidiSheetMusic.TimeSigSymbol.images)] = new MidiSheetMusic.Bitmap(MidiSheetMusic.TimeSigSymbol, "Resources.Images.four.png");
                        MidiSheetMusic.TimeSigSymbol.images[System.Array.index(6, MidiSheetMusic.TimeSigSymbol.images)] = new MidiSheetMusic.Bitmap(MidiSheetMusic.TimeSigSymbol, "Resources.Images.six.png");
                        MidiSheetMusic.TimeSigSymbol.images[System.Array.index(8, MidiSheetMusic.TimeSigSymbol.images)] = new MidiSheetMusic.Bitmap(MidiSheetMusic.TimeSigSymbol, "Resources.Images.eight.png");
                        MidiSheetMusic.TimeSigSymbol.images[System.Array.index(9, MidiSheetMusic.TimeSigSymbol.images)] = new MidiSheetMusic.Bitmap(MidiSheetMusic.TimeSigSymbol, "Resources.Images.nine.png");
                        MidiSheetMusic.TimeSigSymbol.images[System.Array.index(12, MidiSheetMusic.TimeSigSymbol.images)] = new MidiSheetMusic.Bitmap(MidiSheetMusic.TimeSigSymbol, "Resources.Images.twelve.png");
                    }
                }
            }
        },
        fields: {
            numerator: 0,
            denominator: 0,
            width: 0,
            candraw: false
        },
        props: {
            StartTime: {
                get: function () {
                    return -1;
                }
            },
            MinWidth: {
                get: function () {
                    if (this.candraw) {
                        return ((Bridge.Int.div(Bridge.Int.mul(Bridge.Int.mul(MidiSheetMusic.TimeSigSymbol.images[System.Array.index(2, MidiSheetMusic.TimeSigSymbol.images)].Width, MidiSheetMusic.SheetMusic.NoteHeight), 2), MidiSheetMusic.TimeSigSymbol.images[System.Array.index(2, MidiSheetMusic.TimeSigSymbol.images)].Height)) | 0);
                    } else {
                        return 0;
                    }
                }
            },
            Width: {
                get: function () {
                    return this.width;
                },
                set: function (value) {
                    this.width = value;
                }
            },
            AboveStaff: {
                get: function () {
                    return 0;
                }
            },
            BelowStaff: {
                get: function () {
                    return 0;
                }
            }
        },
        ctors: {
            ctor: function (numer, denom) {
                this.$initialize();
                MidiSheetMusic.MusicSymbol.ctor.call(this);
                this.numerator = numer;
                this.denominator = denom;
                MidiSheetMusic.TimeSigSymbol.LoadImages();
                if (numer >= 0 && numer < MidiSheetMusic.TimeSigSymbol.images.length && MidiSheetMusic.TimeSigSymbol.images[System.Array.index(numer, MidiSheetMusic.TimeSigSymbol.images)] != null && denom >= 0 && denom < MidiSheetMusic.TimeSigSymbol.images.length && MidiSheetMusic.TimeSigSymbol.images[System.Array.index(numer, MidiSheetMusic.TimeSigSymbol.images)] != null) {
                    this.candraw = true;
                } else {
                    this.candraw = false;
                }
                this.width = this.MinWidth;
            }
        },
        methods: {
            Draw: function (g, pen, ytop) {
                if (!this.candraw) {
                    return;
                }

                g.TranslateTransform(((this.Width - this.MinWidth) | 0), 0);
                var numer = MidiSheetMusic.TimeSigSymbol.images[System.Array.index(this.numerator, MidiSheetMusic.TimeSigSymbol.images)];
                var denom = MidiSheetMusic.TimeSigSymbol.images[System.Array.index(this.denominator, MidiSheetMusic.TimeSigSymbol.images)];

                /* Scale the image width to match the height */
                var imgheight = Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 2);
                var imgwidth = (Bridge.Int.div(Bridge.Int.mul(numer.Width, imgheight), numer.Height)) | 0;
                g.DrawImage(numer, 0, ytop, imgwidth, imgheight);
                g.DrawImage(denom, 0, ((ytop + Bridge.Int.mul(MidiSheetMusic.SheetMusic.NoteHeight, 2)) | 0), imgwidth, imgheight);
                g.TranslateTransform(((-(((this.Width - this.MinWidth) | 0))) | 0), 0);
            },
            toString: function () {
                return System.String.format("TimeSigSymbol numerator={0} denominator={1}", Bridge.box(this.numerator, System.Int32), Bridge.box(this.denominator, System.Int32));
            }
        }
    });
});

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJNaWRpU2hlZXRNdXNpY0JyaWRnZS5qcyIsCiAgInNvdXJjZVJvb3QiOiAiIiwKICAic291cmNlcyI6IFsiQ2xhc3Nlcy9BZGxlci5jcyIsIkNsYXNzZXMvRHJhd2luZy9JbWFnZS5jcyIsIkNsYXNzZXMvRHJhd2luZy9CcnVzaC5jcyIsIkNsYXNzZXMvRHJhd2luZy9CcnVzaGVzLmNzIiwiQ2xhc3Nlcy9DbGVmTWVhc3VyZXMuY3MiLCJDbGFzc2VzL0RyYXdpbmcvQ29sb3IuY3MiLCJDbGFzc2VzL0RyYXdpbmcvQ29udHJvbC5jcyIsIkNsYXNzZXMvVGV4dC9FbmNvZGluZy5jcyIsIkNsYXNzZXMvSU8vU3RyZWFtLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL0ZvbnQuY3MiLCJDbGFzc2VzL0RyYXdpbmcvR3JhcGhpY3MuY3MiLCJDbGFzc2VzL0tleVNpZ25hdHVyZS5jcyIsIkNsYXNzZXMvTHlyaWNTeW1ib2wuY3MiLCJDbGFzc2VzL01pZGlFdmVudC5jcyIsIkNsYXNzZXMvTWlkaUZpbGUuY3MiLCJDbGFzc2VzL01pZGlGaWxlRXhjZXB0aW9uLmNzIiwiQ2xhc3Nlcy9NaWRpRmlsZVJlYWRlci5jcyIsIkNsYXNzZXMvTWlkaU5vdGUuY3MiLCJDbGFzc2VzL01pZGlPcHRpb25zLmNzIiwiQ2xhc3Nlcy9NaWRpVHJhY2suY3MiLCJDbGFzc2VzL1doaXRlTm90ZS5jcyIsIkNsYXNzZXMvRHJhd2luZy9QYWludEV2ZW50QXJncy5jcyIsIkNsYXNzZXMvRHJhd2luZy9QYW5lbC5jcyIsIkNsYXNzZXMvSU8vUGF0aC5jcyIsIkNsYXNzZXMvRHJhd2luZy9QZW4uY3MiLCJDbGFzc2VzL0RyYXdpbmcvUG9pbnQuY3MiLCJDbGFzc2VzL0RyYXdpbmcvUmVjdGFuZ2xlLmNzIiwiQ2xhc3Nlcy9TdGFmZi5jcyIsIkNsYXNzZXMvU3RlbS5jcyIsIkNsYXNzZXMvU3ltYm9sV2lkdGhzLmNzIiwiQ2xhc3Nlcy9UaW1lU2lnbmF0dXJlLmNzIiwiQ2xhc3Nlcy9BY2NpZFN5bWJvbC5jcyIsIkNsYXNzZXMvQmFyU3ltYm9sLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL0JpdG1hcC5jcyIsIkNsYXNzZXMvQmxhbmtTeW1ib2wuY3MiLCJDbGFzc2VzL0Nob3JkU3ltYm9sLmNzIiwiQ2xhc3Nlcy9DbGVmU3ltYm9sLmNzIiwiQ2xhc3Nlcy9JTy9GaWxlU3RyZWFtLmNzIiwiQ2xhc3Nlcy9QaWFuby5jcyIsIkNsYXNzZXMvUmVzdFN5bWJvbC5jcyIsIkNsYXNzZXMvU2hlZXRNdXNpYy5jcyIsIkNsYXNzZXMvRHJhd2luZy9Tb2xpZEJydXNoLmNzIiwiQ2xhc3Nlcy9UaW1lU2lnU3ltYm9sLmNzIl0sCiAgIm5hbWVzIjogWyIiXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQ0FtRCtCQTtvQkFDdkJBLGFBQWNBLGtDQUFXQTtvQkFDekJBLFNBQVNBLCtCQUFRQSxRQUFRQSxRQUFRQTtvQkFDakNBLE9BQU9BOztxQ0FHZ0JBLE9BQVlBLEtBQVlBLE9BQVdBO29CQUUxREEsSUFBSUEsT0FBT0E7d0JBQ1BBOzs7b0JBRUpBLFNBQVVBLEFBQU9BLEFBQUNBO29CQUNsQkEsU0FBVUEsQUFBT0EsQUFBQ0EsR0FBQ0E7O29CQUVuQkEsT0FBT0E7d0JBRUhBLFFBQVFBLE1BQU1BLDRCQUFPQSxNQUFNQTt3QkFDM0JBLGFBQU9BO3dCQUNQQSxPQUFPQTs7NEJBR0hBLFdBQU1BLHVDQUFJQSxtQ0FBSkE7NEJBQWNBLFdBQU1BOzRCQUMxQkEsV0FBTUEsdUNBQUlBLG1DQUFKQTs0QkFBY0EsV0FBTUE7NEJBQzFCQSxXQUFNQSx1Q0FBSUEsbUNBQUpBOzRCQUFjQSxXQUFNQTs0QkFDMUJBLFdBQU1BLHVDQUFJQSxtQ0FBSkE7NEJBQWNBLFdBQU1BOzRCQUMxQkEsV0FBTUEsdUNBQUlBLG1DQUFKQTs0QkFBY0EsV0FBTUE7NEJBQzFCQSxXQUFNQSx1Q0FBSUEsbUNBQUpBOzRCQUFjQSxXQUFNQTs0QkFDMUJBLFdBQU1BLHVDQUFJQSxtQ0FBSkE7NEJBQWNB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QUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBOztvQkFFMUJBLE1BQU1BLHlEQUFVQSwrQkFBVkE7b0JBQ05BLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTs7b0JBRTFCQSxNQUFNQSx5REFBVUEsK0JBQVZBO29CQUNOQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7OztvQkFHMUJBLE1BQU1BLHdEQUFTQSwrQkFBVEE7b0JBQ05BLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTs7b0JBRTFCQSxNQUFNQSx3REFBU0EsK0JBQVRBO29CQUNOQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7O29CQUUxQkEsTUFBTUEsd0RBQVNBLG1DQUFUQTtvQkFDTkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBOztvQkFFMUJBLE1BQU1BLHdEQUFTQSxtQ0FBVEE7b0JBQ05BLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTs7b0JBRTFCQSxNQUFNQSx3REFBU0EsbUNBQVRBO29CQUNOQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7O29CQUUxQkEsTUFBTUEsd0RBQVNBLG1DQUFUQTtvQkFDTkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBOztvQkFFMUJBLE1BQU1BLHdEQUFTQSxtQ0FBVEE7b0JBQ05BLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTs7OztpQ0FtUEdBOztvQkFDN0JBOzs7b0JBR0FBLGdCQUFrQkE7b0JBQ2xCQSxLQUFLQSxX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LHNCQUFPQSxBQUFPQTt3QkFDOUJBLGtHQUFZQSxJQUFJQSxzQkFBT0EsQUFBT0E7d0JBQzlCQSxrR0FBWUEsSUFBSUEsc0JBQU9BLEFBQU9BO3dCQUM5QkEsa0dBQVlBLElBQUlBLHNCQUFPQSxBQUFPQTt3QkFDOUJBLGtHQUFZQSxJQUFJQSxzQkFBT0EsQUFBT0E7d0JBQzlCQSxtR0FBYUEsSUFBSUEsc0JBQU9BLEFBQU9BOzs7Ozs7Ozs7Ozs7OztvQkFNN0JBLE9BQU9BOzs7OztvQkFLUEEsSUFBSUE7d0JBQ0FBLE9BQU9BLHNKQUFrQkEsMkNBQTJCQTs7d0JBRXBEQTs7Ozs7O29CQVFMQSxPQUFPQTs7O29CQUNQQSxhQUFRQTs7Ozs7b0JBT05BOzs7OztvQkFPREE7Ozs7OzRCQWhFV0EsT0FBV0E7OztnQkFDNUJBLGlCQUFZQTtnQkFDWkEsbUJBQWNBO2dCQUNkQTtnQkFDQUEsSUFBSUEsY0FBY0EsUUFBUUEsOENBQWlCQSx1REFBT0EsT0FBUEEseUNBQWlCQSxRQUN4REEsY0FBY0EsUUFBUUEsOENBQWlCQSx1REFBT0EsT0FBUEEseUNBQWlCQTtvQkFDeERBOztvQkFHQUE7O2dCQUVKQSxhQUFRQTs7Ozs0QkE0REZBLEdBQVlBLEtBQVNBO2dCQUMzQkEsSUFBSUEsQ0FBQ0E7b0JBQ0RBOzs7Z0JBRUpBLHFCQUFxQkEsZUFBUUE7Z0JBQzdCQSxZQUFjQSx1REFBT0EsZ0JBQVBBO2dCQUNkQSxZQUFjQSx1REFBT0Esa0JBQVBBOzs7Z0JBR2RBLGdCQUFnQkE7Z0JBQ2hCQSxlQUFlQSw0Q0FBY0EsWUFBWUE7Z0JBQ3pDQSxZQUFZQSxVQUFVQSxNQUFNQSxVQUFVQTtnQkFDdENBLFlBQVlBLFVBQVVBLFNBQU9BLCtEQUF5QkEsVUFBVUE7Z0JBQ2hFQSxxQkFBcUJBLEdBQUNBLENBQUNBLGVBQVFBOzs7Z0JBSS9CQSxPQUFPQSxvRUFDY0EsMENBQVdBIiwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vL1xuLy8gQ29weXJpZ2h0IChDKSAxOTk1LTIwMDQgSmVhbi1sb3VwIEdhaWxseSBhbmQgTWFyayBBZGxlclxuLy9cbi8vICAgVGhlIFpMSUIgc29mdHdhcmUgaXMgcHJvdmlkZWQgJ2FzLWlzJywgd2l0aG91dCBhbnkgZXhwcmVzcyBvciBpbXBsaWVkXG4vLyAgIHdhcnJhbnR5LiAgSW4gbm8gZXZlbnQgd2lsbCB0aGUgYXV0aG9ycyBiZSBoZWxkIGxpYWJsZSBmb3IgYW55IGRhbWFnZXNcbi8vICAgYXJpc2luZyBmcm9tIHRoZSB1c2Ugb2YgdGhpcyBzb2Z0d2FyZS5cbi8vXG4vLyAgIFBlcm1pc3Npb24gaXMgZ3JhbnRlZCB0byBhbnlvbmUgdG8gdXNlIHRoaXMgc29mdHdhcmUgZm9yIGFueSBwdXJwb3NlLFxuLy8gICBpbmNsdWRpbmcgY29tbWVyY2lhbCBhcHBsaWNhdGlvbnMsIGFuZCB0byBhbHRlciBpdCBhbmQgcmVkaXN0cmlidXRlIGl0XG4vLyAgIGZyZWVseSwgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIHJlc3RyaWN0aW9uczpcbi8vXG4vLyAgIDEuIFRoZSBvcmlnaW4gb2YgdGhpcyBzb2Z0d2FyZSBtdXN0IG5vdCBiZSBtaXNyZXByZXNlbnRlZDsgeW91IG11c3Qgbm90XG4vLyAgICAgIGNsYWltIHRoYXQgeW91IHdyb3RlIHRoZSBvcmlnaW5hbCBzb2Z0d2FyZS4gSWYgeW91IHVzZSB0aGlzIHNvZnR3YXJlXG4vLyAgICAgIGluIGEgcHJvZHVjdCwgYW4gYWNrbm93bGVkZ21lbnQgaW4gdGhlIHByb2R1Y3QgZG9jdW1lbnRhdGlvbiB3b3VsZCBiZVxuLy8gICAgICBhcHByZWNpYXRlZCBidXQgaXMgbm90IHJlcXVpcmVkLlxuLy8gICAyLiBBbHRlcmVkIHNvdXJjZSB2ZXJzaW9ucyBtdXN0IGJlIHBsYWlubHkgbWFya2VkIGFzIHN1Y2gsIGFuZCBtdXN0IG5vdCBiZVxuLy8gICAgICBtaXNyZXByZXNlbnRlZCBhcyBiZWluZyB0aGUgb3JpZ2luYWwgc29mdHdhcmUuXG4vLyAgIDMuIFRoaXMgbm90aWNlIG1heSBub3QgYmUgcmVtb3ZlZCBvciBhbHRlcmVkIGZyb20gYW55IHNvdXJjZSBkaXN0cmlidXRpb24uXG4vL1xuLy8gICBKZWFuLWxvdXAgR2FpbGx5IGpsb3VwQGd6aXAub3JnXG4vLyAgIE1hcmsgQWRsZXIgbWFkbGVyQGFsdW1uaS5jYWx0ZWNoLmVkdVxuLy9cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy9cbi8vIENvcHlyaWdodCAoYykgMjAwOS0yMDExIERpbm8gQ2hpZXNhIGFuZCBNaWNyb3NvZnQgQ29ycG9yYXRpb24uXG4vLyBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy9cbi8vIFRoaXMgY29kZSBtb2R1bGUgaXMgcGFydCBvZiBEb3ROZXRaaXAsIGEgemlwZmlsZSBjbGFzcyBsaWJyYXJ5LlxuLy9cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy9cbi8vIFRoaXMgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTWljcm9zb2Z0IFB1YmxpYyBMaWNlbnNlLlxuLy8gU2VlIHRoZSBmaWxlIExpY2Vuc2UudHh0IGZvciB0aGUgbGljZW5zZSBkZXRhaWxzLlxuLy8gTW9yZSBpbmZvIG9uOiBodHRwOi8vZG90bmV0emlwLmNvZGVwbGV4LmNvbVxuLy9cblxuXG51c2luZyBTeXN0ZW07XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbnB1YmxpYyBzZWFsZWQgY2xhc3MgQWRsZXJcbntcbiAgICAvLyBsYXJnZXN0IHByaW1lIHNtYWxsZXIgdGhhbiA2NTUzNlxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IHVpbnQgQkFTRSA9IDY1NTIxO1xuICAgIC8vIE5NQVggaXMgdGhlIGxhcmdlc3QgbiBzdWNoIHRoYXQgMjU1bihuKzEpLzIgKyAobisxKShCQVNFLTEpIDw9IDJeMzItMVxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IGludCBOTUFYID0gNTU1MjtcblxuICAgIHB1YmxpYyBzdGF0aWMgdWludCBBZGxlcjMyKGJ5dGVbXSBidWYpIHtcbiAgICAgICAgdWludCByZXN1bHQgPSBBZGxlcjMyKDAsIG51bGwsIDAsIDApO1xuICAgICAgICByZXN1bHQgPSBBZGxlcjMyKHJlc3VsdCwgYnVmLCAwLCBidWYuTGVuZ3RoKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHVpbnQgQWRsZXIzMih1aW50IGFkbGVyLCBieXRlW10gYnVmLCBpbnQgaW5kZXgsIGludCBsZW4pXG4gICAge1xuICAgICAgICBpZiAoYnVmID09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gMTtcblxuICAgICAgICB1aW50IHMxID0gKHVpbnQpIChhZGxlciAmIDB4ZmZmZik7XG4gICAgICAgIHVpbnQgczIgPSAodWludCkgKChhZGxlciA+PiAxNikgJiAweGZmZmYpO1xuXG4gICAgICAgIHdoaWxlIChsZW4gPiAwKVxuICAgICAgICB7XG4gICAgICAgICAgICBpbnQgayA9IGxlbiA8IE5NQVggPyBsZW4gOiBOTUFYO1xuICAgICAgICAgICAgbGVuIC09IGs7XG4gICAgICAgICAgICB3aGlsZSAoayA+PSAxNilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAvL3MxICs9IChidWZbaW5kZXgrK10gJiAweGZmKTsgczIgKz0gczE7XG4gICAgICAgICAgICAgICAgczEgKz0gYnVmW2luZGV4KytdOyBzMiArPSBzMTtcbiAgICAgICAgICAgICAgICBzMSArPSBidWZbaW5kZXgrK107IHMyICs9IHMxO1xuICAgICAgICAgICAgICAgIHMxICs9IGJ1ZltpbmRleCsrXTsgczIgKz0gczE7XG4gICAgICAgICAgICAgICAgczEgKz0gYnVmW2luZGV4KytdOyBzMiArPSBzMTtcbiAgICAgICAgICAgICAgICBzMSArPSBidWZbaW5kZXgrK107IHMyICs9IHMxO1xuICAgICAgICAgICAgICAgIHMxICs9IGJ1ZltpbmRleCsrXTsgczIgKz0gczE7XG4gICAgICAgICAgICAgICAgczEgKz0gYnVmW2luZGV4KytdOyBzMiArPSBzMTtcbiAgICAgICAgICAgICAgICBzMSArPSBidWZbaW5kZXgrK107IHMyICs9IHMxO1xuICAgICAgICAgICAgICAgIHMxICs9IGJ1ZltpbmRleCsrXTsgczIgKz0gczE7XG4gICAgICAgICAgICAgICAgczEgKz0gYnVmW2luZGV4KytdOyBzMiArPSBzMTtcbiAgICAgICAgICAgICAgICBzMSArPSBidWZbaW5kZXgrK107IHMyICs9IHMxO1xuICAgICAgICAgICAgICAgIHMxICs9IGJ1ZltpbmRleCsrXTsgczIgKz0gczE7XG4gICAgICAgICAgICAgICAgczEgKz0gYnVmW2luZGV4KytdOyBzMiArPSBzMTtcbiAgICAgICAgICAgICAgICBzMSArPSBidWZbaW5kZXgrK107IHMyICs9IHMxO1xuICAgICAgICAgICAgICAgIHMxICs9IGJ1ZltpbmRleCsrXTsgczIgKz0gczE7XG4gICAgICAgICAgICAgICAgczEgKz0gYnVmW2luZGV4KytdOyBzMiArPSBzMTtcbiAgICAgICAgICAgICAgICBrIC09IDE2O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGsgIT0gMClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBkb1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgczEgKz0gYnVmW2luZGV4KytdO1xuICAgICAgICAgICAgICAgICAgICBzMiArPSBzMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgd2hpbGUgKC0tayAhPSAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHMxICU9IEJBU0U7XG4gICAgICAgICAgICBzMiAlPSBCQVNFO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAodWludCkoKHMyIDw8IDE2KSB8IHMxKTtcbiAgICB9XG59XG5cblxufVxuIiwidXNpbmcgQnJpZGdlO1xyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgSW1hZ2VcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgb2JqZWN0IERvbUltYWdlO1xyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgSW1hZ2UoVHlwZSB0eXBlLCBzdHJpbmcgZmlsZW5hbWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuaW1hZ2UuY3RvclwiLCB0aGlzLCB0eXBlLCBmaWxlbmFtZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgaW50IFdpZHRoXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXRcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFNjcmlwdC5DYWxsPGludD4oXCJicmlkZ2VVdGlsLmltYWdlLmdldFdpZHRoXCIsIHRoaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgaW50IEhlaWdodFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBTY3JpcHQuQ2FsbDxpbnQ+KFwiYnJpZGdlVXRpbC5pbWFnZS5nZXRIZWlnaHRcIiwgdGhpcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEJydXNoXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIENvbG9yIENvbG9yO1xyXG5cclxuICAgICAgICBwdWJsaWMgQnJ1c2goQ29sb3IgY29sb3IpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBDb2xvciA9IGNvbG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgRGlzcG9zZSgpIHsgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBzdGF0aWMgY2xhc3MgQnJ1c2hlc1xyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQnJ1c2ggQmxhY2sgeyBnZXQgeyByZXR1cm4gbmV3IEJydXNoKENvbG9yLkJsYWNrKTsgfSB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBCcnVzaCBXaGl0ZSB7IGdldCB7IHJldHVybiBuZXcgQnJ1c2goQ29sb3IuV2hpdGUpOyB9IH1cclxuICAgIH1cclxufVxyXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMDggTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogQGNsYXNzIENsZWZNZWFzdXJlc1xuICogVGhlIENsZWZNZWFzdXJlcyBjbGFzcyBpcyB1c2VkIHRvIHJlcG9ydCB3aGF0IENsZWYgKFRyZWJsZSBvciBCYXNzKSBhXG4gKiBnaXZlbiBtZWFzdXJlIHVzZXMuXG4gKi9cbnB1YmxpYyBjbGFzcyBDbGVmTWVhc3VyZXMge1xuICAgIHByaXZhdGUgTGlzdDxDbGVmPiBjbGVmczsgIC8qKiBUaGUgY2xlZnMgdXNlZCBmb3IgZWFjaCBtZWFzdXJlIChmb3IgYSBzaW5nbGUgdHJhY2spICovXG4gICAgcHJpdmF0ZSBpbnQgbWVhc3VyZTsgICAgICAgLyoqIFRoZSBsZW5ndGggb2YgYSBtZWFzdXJlLCBpbiBwdWxzZXMgKi9cblxuIFxuICAgIC8qKiBHaXZlbiB0aGUgbm90ZXMgaW4gYSB0cmFjaywgY2FsY3VsYXRlIHRoZSBhcHByb3ByaWF0ZSBDbGVmIHRvIHVzZVxuICAgICAqIGZvciBlYWNoIG1lYXN1cmUuICBTdG9yZSB0aGUgcmVzdWx0IGluIHRoZSBjbGVmcyBsaXN0LlxuICAgICAqIEBwYXJhbSBub3RlcyAgVGhlIG1pZGkgbm90ZXNcbiAgICAgKiBAcGFyYW0gbWVhc3VyZWxlbiBUaGUgbGVuZ3RoIG9mIGEgbWVhc3VyZSwgaW4gcHVsc2VzXG4gICAgICovXG4gICAgcHVibGljIENsZWZNZWFzdXJlcyhMaXN0PE1pZGlOb3RlPiBub3RlcywgaW50IG1lYXN1cmVsZW4pIHtcbiAgICAgICAgbWVhc3VyZSA9IG1lYXN1cmVsZW47XG4gICAgICAgIENsZWYgbWFpbmNsZWYgPSBNYWluQ2xlZihub3Rlcyk7XG4gICAgICAgIGludCBuZXh0bWVhc3VyZSA9IG1lYXN1cmVsZW47XG4gICAgICAgIGludCBwb3MgPSAwO1xuICAgICAgICBDbGVmIGNsZWYgPSBtYWluY2xlZjtcblxuICAgICAgICBjbGVmcyA9IG5ldyBMaXN0PENsZWY+KCk7XG5cbiAgICAgICAgd2hpbGUgKHBvcyA8IG5vdGVzLkNvdW50KSB7XG4gICAgICAgICAgICAvKiBTdW0gYWxsIHRoZSBub3RlcyBpbiB0aGUgY3VycmVudCBtZWFzdXJlICovXG4gICAgICAgICAgICBpbnQgc3Vtbm90ZXMgPSAwO1xuICAgICAgICAgICAgaW50IG5vdGVjb3VudCA9IDA7XG4gICAgICAgICAgICB3aGlsZSAocG9zIDwgbm90ZXMuQ291bnQgJiYgbm90ZXNbcG9zXS5TdGFydFRpbWUgPCBuZXh0bWVhc3VyZSkge1xuICAgICAgICAgICAgICAgIHN1bW5vdGVzICs9IG5vdGVzW3Bvc10uTnVtYmVyO1xuICAgICAgICAgICAgICAgIG5vdGVjb3VudCsrO1xuICAgICAgICAgICAgICAgIHBvcysrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5vdGVjb3VudCA9PSAwKVxuICAgICAgICAgICAgICAgIG5vdGVjb3VudCA9IDE7XG5cbiAgICAgICAgICAgIC8qIENhbGN1bGF0ZSB0aGUgXCJhdmVyYWdlXCIgbm90ZSBpbiB0aGUgbWVhc3VyZSAqL1xuICAgICAgICAgICAgaW50IGF2Z25vdGUgPSBzdW1ub3RlcyAvIG5vdGVjb3VudDtcbiAgICAgICAgICAgIGlmIChhdmdub3RlID09IDApIHtcbiAgICAgICAgICAgICAgICAvKiBUaGlzIG1lYXN1cmUgZG9lc24ndCBjb250YWluIGFueSBub3Rlcy5cbiAgICAgICAgICAgICAgICAgKiBLZWVwIHRoZSBwcmV2aW91cyBjbGVmLlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoYXZnbm90ZSA+PSBXaGl0ZU5vdGUuQm90dG9tVHJlYmxlLk51bWJlcigpKSB7XG4gICAgICAgICAgICAgICAgY2xlZiA9IENsZWYuVHJlYmxlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoYXZnbm90ZSA8PSBXaGl0ZU5vdGUuVG9wQmFzcy5OdW1iZXIoKSkge1xuICAgICAgICAgICAgICAgIGNsZWYgPSBDbGVmLkJhc3M7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvKiBUaGUgYXZlcmFnZSBub3RlIGlzIGJldHdlZW4gRzMgYW5kIEY0LiBXZSBjYW4gdXNlIGVpdGhlclxuICAgICAgICAgICAgICAgICAqIHRoZSB0cmVibGUgb3IgYmFzcyBjbGVmLiAgVXNlIHRoZSBcIm1haW5cIiBjbGVmLCB0aGUgY2xlZlxuICAgICAgICAgICAgICAgICAqIHRoYXQgYXBwZWFycyBtb3N0IGZvciB0aGlzIHRyYWNrLlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGNsZWYgPSBtYWluY2xlZjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2xlZnMuQWRkKGNsZWYpO1xuICAgICAgICAgICAgbmV4dG1lYXN1cmUgKz0gbWVhc3VyZWxlbjtcbiAgICAgICAgfVxuICAgICAgICBjbGVmcy5BZGQoY2xlZik7XG4gICAgfVxuXG4gICAgLyoqIEdpdmVuIGEgdGltZSAoaW4gcHVsc2VzKSwgcmV0dXJuIHRoZSBjbGVmIHVzZWQgZm9yIHRoYXQgbWVhc3VyZS4gKi9cbiAgICBwdWJsaWMgQ2xlZiBHZXRDbGVmKGludCBzdGFydHRpbWUpIHtcblxuICAgICAgICAvKiBJZiB0aGUgdGltZSBleGNlZWRzIHRoZSBsYXN0IG1lYXN1cmUsIHJldHVybiB0aGUgbGFzdCBtZWFzdXJlICovXG4gICAgICAgIGlmIChzdGFydHRpbWUgLyBtZWFzdXJlID49IGNsZWZzLkNvdW50KSB7XG4gICAgICAgICAgICByZXR1cm4gY2xlZnNbIGNsZWZzLkNvdW50LTEgXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBjbGVmc1sgc3RhcnR0aW1lIC8gbWVhc3VyZSBdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIENhbGN1bGF0ZSB0aGUgYmVzdCBjbGVmIHRvIHVzZSBmb3IgdGhlIGdpdmVuIG5vdGVzLiAgSWYgdGhlXG4gICAgICogYXZlcmFnZSBub3RlIGlzIGJlbG93IE1pZGRsZSBDLCB1c2UgYSBiYXNzIGNsZWYuICBFbHNlLCB1c2UgYSB0cmVibGVcbiAgICAgKiBjbGVmLlxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIENsZWYgTWFpbkNsZWYoTGlzdDxNaWRpTm90ZT4gbm90ZXMpIHtcbiAgICAgICAgaW50IG1pZGRsZUMgPSBXaGl0ZU5vdGUuTWlkZGxlQy5OdW1iZXIoKTtcbiAgICAgICAgaW50IHRvdGFsID0gMDtcbiAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbSBpbiBub3Rlcykge1xuICAgICAgICAgICAgdG90YWwgKz0gbS5OdW1iZXI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vdGVzLkNvdW50ID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBDbGVmLlRyZWJsZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0b3RhbC9ub3Rlcy5Db3VudCA+PSBtaWRkbGVDKSB7XG4gICAgICAgICAgICByZXR1cm4gQ2xlZi5UcmVibGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gQ2xlZi5CYXNzO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbn1cblxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIENvbG9yXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIGludCBSZWQ7XHJcbiAgICAgICAgcHVibGljIGludCBHcmVlbjtcclxuICAgICAgICBwdWJsaWMgaW50IEJsdWU7XHJcbiAgICAgICAgcHVibGljIGludCBBbHBoYTtcclxuXHJcbiAgICAgICAgcHVibGljIENvbG9yKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIEFscGhhID0gMjU1O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBDb2xvciBGcm9tQXJnYihpbnQgcmVkLCBpbnQgZ3JlZW4sIGludCBibHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBGcm9tQXJnYigyNTUsIHJlZCwgZ3JlZW4sIGJsdWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBDb2xvciBGcm9tQXJnYihpbnQgYWxwaGEsIGludCByZWQsIGludCBncmVlbiwgaW50IGJsdWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IENvbG9yXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIEFscGhhID0gYWxwaGEsXHJcbiAgICAgICAgICAgICAgICBSZWQgPSByZWQsXHJcbiAgICAgICAgICAgICAgICBHcmVlbiA9IGdyZWVuLFxyXG4gICAgICAgICAgICAgICAgQmx1ZSA9IGJsdWVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQ29sb3IgQmxhY2sgeyBnZXQgeyByZXR1cm4gbmV3IENvbG9yKCk7IH0gfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIENvbG9yIFdoaXRlIHsgZ2V0IHsgcmV0dXJuIEZyb21BcmdiKDI1NSwyNTUsMjU1KTsgfSB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQ29sb3IgTGlnaHRHcmF5IHsgZ2V0IHsgcmV0dXJuIEZyb21BcmdiKDB4ZDMsMHhkMywweGQzKTsgfSB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBpbnQgUiB7IGdldCB7IHJldHVybiBSZWQ7IH0gfVxyXG4gICAgICAgIHB1YmxpYyBpbnQgRyB7IGdldCB7IHJldHVybiBHcmVlbjsgfSB9XHJcbiAgICAgICAgcHVibGljIGludCBCIHsgZ2V0IHsgcmV0dXJuIEJsdWU7IH0gfVxyXG5cclxuICAgICAgICBwdWJsaWMgYm9vbCBFcXVhbHMoQ29sb3IgY29sb3IpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gUmVkID09IGNvbG9yLlJlZCAmJiBHcmVlbiA9PSBjb2xvci5HcmVlbiAmJiBCbHVlID09IGNvbG9yLkJsdWUgJiYgQWxwaGE9PWNvbG9yLkFscGhhO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgQ29udHJvbFxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBpbnQgV2lkdGg7XHJcbiAgICAgICAgcHVibGljIGludCBIZWlnaHQ7XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIEludmFsaWRhdGUoKSB7IH1cclxuXHJcbiAgICAgICAgcHVibGljIEdyYXBoaWNzIENyZWF0ZUdyYXBoaWNzKHN0cmluZyBuYW1lKSB7IHJldHVybiBuZXcgR3JhcGhpY3MobmFtZSk7IH1cclxuXHJcbiAgICAgICAgcHVibGljIFBhbmVsIFBhcmVudCB7IGdldCB7IHJldHVybiBuZXcgUGFuZWwoKTsgfSB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBDb2xvciBCYWNrQ29sb3I7XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIHN0YXRpYyBjbGFzcyBFbmNvZGluZ1xyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgc3RyaW5nIEdldFV0ZjhTdHJpbmcoYnl0ZVtdIHZhbHVlLCBpbnQgc3RhcnRJbmRleCwgaW50IGxlbmd0aCkgeyByZXR1cm4gXCJub3QgaW1wbGVtZW50ZWQhXCI7IH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBzdHJpbmcgR2V0QXNjaWlTdHJpbmcoYnl0ZVtdIGRhdGEsIGludCBzdGFydEluZGV4LCBpbnQgbGVuKSBcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciB0b1JldHVybiA9IFwiXCI7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuICYmIGkgPCBkYXRhLkxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICAgICAgdG9SZXR1cm4gKz0gKGNoYXIpZGF0YVtpICsgc3RhcnRJbmRleF07XHJcbiAgICAgICAgICAgIHJldHVybiB0b1JldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgYnl0ZVtdIEdldEFzY2lpQnl0ZXMoc3RyaW5nIHZhbHVlKSB7IHJldHVybiBudWxsOyB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFN0cmVhbVxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyB2b2lkIFdyaXRlKGJ5dGVbXSBidWZmZXIsIGludCBvZmZzZXQsIGludCBjb3VudCkgeyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIENsb3NlKCkgeyB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEZvbnRcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgc3RyaW5nIE5hbWU7XHJcbiAgICAgICAgcHVibGljIGludCBTaXplO1xyXG4gICAgICAgIHB1YmxpYyBGb250U3R5bGUgU3R5bGU7XHJcblxyXG4gICAgICAgIHB1YmxpYyBGb250KHN0cmluZyBuYW1lLCBpbnQgc2l6ZSwgRm9udFN0eWxlIHN0eWxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgTmFtZSA9IG5hbWU7XHJcbiAgICAgICAgICAgIFNpemUgPSBzaXplO1xyXG4gICAgICAgICAgICBTdHlsZSA9IHN0eWxlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGZsb2F0IEdldEhlaWdodCgpIHsgcmV0dXJuIDA7IH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgRGlzcG9zZSgpIHsgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIEJyaWRnZTtcclxudXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEdyYXBoaWNzXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIEdyYXBoaWNzKHN0cmluZyBuYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgTmFtZSA9IG5hbWU7XHJcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy5pbml0R3JhcGhpY3NcIiwgdGhpcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RyaW5nIE5hbWU7XHJcblxyXG4gICAgICAgIHB1YmxpYyBvYmplY3QgQ29udGV4dDtcclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgVHJhbnNsYXRlVHJhbnNmb3JtKGludCB4LCBpbnQgeSkge1xyXG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3MudHJhbnNsYXRlVHJhbnNmb3JtXCIsIHRoaXMsIHgsIHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgRHJhd0ltYWdlKEltYWdlIGltYWdlLCBpbnQgeCwgaW50IHksIGludCB3aWR0aCwgaW50IGhlaWdodCkge1xyXG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3MuZHJhd0ltYWdlXCIsIHRoaXMsIGltYWdlLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIERyYXdTdHJpbmcoc3RyaW5nIHRleHQsIEZvbnQgZm9udCwgQnJ1c2ggYnJ1c2gsIGludCB4LCBpbnQgeSkge1xyXG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3MuZHJhd1N0cmluZ1wiLCB0aGlzLCB0ZXh0LCBmb250LCBicnVzaCwgeCwgeSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBEcmF3TGluZShQZW4gcGVuLCBpbnQgeFN0YXJ0LCBpbnQgeVN0YXJ0LCBpbnQgeEVuZCwgaW50IHlFbmQpIHtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLmRyYXdMaW5lXCIsIHRoaXMsIHBlbiwgeFN0YXJ0LCB5U3RhcnQsIHhFbmQsIHlFbmQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgRHJhd0JlemllcihQZW4gcGVuLCBpbnQgeDEsIGludCB5MSwgaW50IHgyLCBpbnQgeTIsIGludCB4MywgaW50IHkzLCBpbnQgeDQsIGludCB5NCkge1xyXG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3MuZHJhd0JlemllclwiLCB0aGlzLCBwZW4sIHgxLCB5MSwgeDIsIHkyLCB4MywgeTMsIHg0LCB5NCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBTY2FsZVRyYW5zZm9ybShmbG9hdCB4LCBmbG9hdCB5KSB7XHJcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy5zY2FsZVRyYW5zZm9ybVwiLCB0aGlzLCB4LCB5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIEZpbGxSZWN0YW5nbGUoQnJ1c2ggYnJ1c2gsIGludCB4LCBpbnQgeSwgaW50IHdpZHRoLCBpbnQgaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy5maWxsUmVjdGFuZ2xlXCIsIHRoaXMsIGJydXNoLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIENsZWFyUmVjdGFuZ2xlKGludCB4LCBpbnQgeSwgaW50IHdpZHRoLCBpbnQgaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy5jbGVhclJlY3RhbmdsZVwiLCB0aGlzLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIEZpbGxFbGxpcHNlKEJydXNoIGJydXNoLCBpbnQgeCwgaW50IHksIGludCB3aWR0aCwgaW50IGhlaWdodCkge1xyXG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3MuZmlsbEVsbGlwc2VcIiwgdGhpcywgYnJ1c2gsIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgRHJhd0VsbGlwc2UoUGVuIHBlbiwgaW50IHgsIGludCB5LCBpbnQgd2lkdGgsIGludCBoZWlnaHQpIHtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLmRyYXdFbGxpcHNlXCIsIHRoaXMsIHBlbiwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBSb3RhdGVUcmFuc2Zvcm0oZmxvYXQgYW5nbGVEZWcpIHtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLnJvdGF0ZVRyYW5zZm9ybVwiLCB0aGlzLCBhbmdsZURlZyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgU21vb3RoaW5nTW9kZSBTbW9vdGhpbmdNb2RlIHsgZ2V0OyBzZXQ7IH1cclxuXHJcbiAgICAgICAgcHVibGljIFJlY3RhbmdsZSBWaXNpYmxlQ2xpcEJvdW5kcyB7IGdldDsgc2V0OyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBmbG9hdCBQYWdlU2NhbGUgeyBnZXQ7IHNldDsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBEaXNwb3NlKCkgeyB9XHJcbiAgICB9XHJcbn1cclxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDEzIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG5cbi8qKiBAY2xhc3MgS2V5U2lnbmF0dXJlXG4gKiBUaGUgS2V5U2lnbmF0dXJlIGNsYXNzIHJlcHJlc2VudHMgYSBrZXkgc2lnbmF0dXJlLCBsaWtlIEcgTWFqb3JcbiAqIG9yIEItZmxhdCBNYWpvci4gIEZvciBzaGVldCBtdXNpYywgd2Ugb25seSBjYXJlIGFib3V0IHRoZSBudW1iZXJcbiAqIG9mIHNoYXJwcyBvciBmbGF0cyBpbiB0aGUga2V5IHNpZ25hdHVyZSwgbm90IHdoZXRoZXIgaXQgaXMgbWFqb3JcbiAqIG9yIG1pbm9yLlxuICpcbiAqIFRoZSBtYWluIG9wZXJhdGlvbnMgb2YgdGhpcyBjbGFzcyBhcmU6XG4gKiAtIEd1ZXNzaW5nIHRoZSBrZXkgc2lnbmF0dXJlLCBnaXZlbiB0aGUgbm90ZXMgaW4gYSBzb25nLlxuICogLSBHZW5lcmF0aW5nIHRoZSBhY2NpZGVudGFsIHN5bWJvbHMgZm9yIHRoZSBrZXkgc2lnbmF0dXJlLlxuICogLSBEZXRlcm1pbmluZyB3aGV0aGVyIGEgcGFydGljdWxhciBub3RlIHJlcXVpcmVzIGFuIGFjY2lkZW50YWxcbiAqICAgb3Igbm90LlxuICpcbiAqL1xuXG5wdWJsaWMgY2xhc3MgS2V5U2lnbmF0dXJlIHtcbiAgICAvKiogVGhlIG51bWJlciBvZiBzaGFycHMgaW4gZWFjaCBrZXkgc2lnbmF0dXJlICovXG4gICAgcHVibGljIGNvbnN0IGludCBDID0gMDtcbiAgICBwdWJsaWMgY29uc3QgaW50IEcgPSAxO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRCA9IDI7XG4gICAgcHVibGljIGNvbnN0IGludCBBID0gMztcbiAgICBwdWJsaWMgY29uc3QgaW50IEUgPSA0O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQiA9IDU7XG5cbiAgICAvKiogVGhlIG51bWJlciBvZiBmbGF0cyBpbiBlYWNoIGtleSBzaWduYXR1cmUgKi9cbiAgICBwdWJsaWMgY29uc3QgaW50IEYgPSAxO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQmZsYXQgPSAyO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRWZsYXQgPSAzO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQWZsYXQgPSA0O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRGZsYXQgPSA1O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgR2ZsYXQgPSA2O1xuXG4gICAgLyoqIFRoZSB0d28gYXJyYXlzIGJlbG93IGFyZSBrZXkgbWFwcy4gIFRoZXkgdGFrZSBhIG1ham9yIGtleVxuICAgICAqIChsaWtlIEcgbWFqb3IsIEItZmxhdCBtYWpvcikgYW5kIGEgbm90ZSBpbiB0aGUgc2NhbGUsIGFuZFxuICAgICAqIHJldHVybiB0aGUgQWNjaWRlbnRhbCByZXF1aXJlZCB0byBkaXNwbGF5IHRoYXQgbm90ZSBpbiB0aGVcbiAgICAgKiBnaXZlbiBrZXkuICBJbiBhIG51dHNoZWwsIHRoZSBtYXAgaXNcbiAgICAgKlxuICAgICAqICAgbWFwW0tleV1bTm90ZVNjYWxlXSAtPiBBY2NpZGVudGFsXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgQWNjaWRbXVtdIHNoYXJwa2V5cztcbiAgICBwcml2YXRlIHN0YXRpYyBBY2NpZFtdW10gZmxhdGtleXM7XG5cbiAgICBwcml2YXRlIGludCBudW1fZmxhdHM7ICAgLyoqIFRoZSBudW1iZXIgb2Ygc2hhcnBzIGluIHRoZSBrZXksIDAgdGhydSA2ICovXG4gICAgcHJpdmF0ZSBpbnQgbnVtX3NoYXJwczsgIC8qKiBUaGUgbnVtYmVyIG9mIGZsYXRzIGluIHRoZSBrZXksIDAgdGhydSA2ICovXG5cbiAgICAvKiogVGhlIGFjY2lkZW50YWwgc3ltYm9scyB0aGF0IGRlbm90ZSB0aGlzIGtleSwgaW4gYSB0cmVibGUgY2xlZiAqL1xuICAgIHByaXZhdGUgQWNjaWRTeW1ib2xbXSB0cmVibGU7XG5cbiAgICAvKiogVGhlIGFjY2lkZW50YWwgc3ltYm9scyB0aGF0IGRlbm90ZSB0aGlzIGtleSwgaW4gYSBiYXNzIGNsZWYgKi9cbiAgICBwcml2YXRlIEFjY2lkU3ltYm9sW10gYmFzcztcblxuICAgIC8qKiBUaGUga2V5IG1hcCBmb3IgdGhpcyBrZXkgc2lnbmF0dXJlOlxuICAgICAqICAga2V5bWFwW25vdGVudW1iZXJdIC0+IEFjY2lkZW50YWxcbiAgICAgKi9cbiAgICBwcml2YXRlIEFjY2lkW10ga2V5bWFwO1xuXG4gICAgLyoqIFRoZSBtZWFzdXJlIHVzZWQgaW4gdGhlIHByZXZpb3VzIGNhbGwgdG8gR2V0QWNjaWRlbnRhbCgpICovXG4gICAgcHJpdmF0ZSBpbnQgcHJldm1lYXN1cmU7IFxuXG5cbiAgICAvKiogQ3JlYXRlIG5ldyBrZXkgc2lnbmF0dXJlLCB3aXRoIHRoZSBnaXZlbiBudW1iZXIgb2ZcbiAgICAgKiBzaGFycHMgYW5kIGZsYXRzLiAgT25lIG9mIHRoZSB0d28gbXVzdCBiZSAwLCB5b3UgY2FuJ3RcbiAgICAgKiBoYXZlIGJvdGggc2hhcnBzIGFuZCBmbGF0cyBpbiB0aGUga2V5IHNpZ25hdHVyZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgS2V5U2lnbmF0dXJlKGludCBudW1fc2hhcnBzLCBpbnQgbnVtX2ZsYXRzKSB7XG4gICAgICAgIGlmICghKG51bV9zaGFycHMgPT0gMCB8fCBudW1fZmxhdHMgPT0gMCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBTeXN0ZW0uQXJndW1lbnRFeGNlcHRpb24oXCJCYWQgS2V5U2lnYXR1cmUgYXJnc1wiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm51bV9zaGFycHMgPSBudW1fc2hhcnBzO1xuICAgICAgICB0aGlzLm51bV9mbGF0cyA9IG51bV9mbGF0cztcblxuICAgICAgICBDcmVhdGVBY2NpZGVudGFsTWFwcygpO1xuICAgICAgICBrZXltYXAgPSBuZXcgQWNjaWRbMTYwXTtcbiAgICAgICAgUmVzZXRLZXlNYXAoKTtcbiAgICAgICAgQ3JlYXRlU3ltYm9scygpO1xuICAgIH1cblxuICAgIC8qKiBDcmVhdGUgbmV3IGtleSBzaWduYXR1cmUsIHdpdGggdGhlIGdpdmVuIG5vdGVzY2FsZS4gICovXG4gICAgcHVibGljIEtleVNpZ25hdHVyZShpbnQgbm90ZXNjYWxlKSB7XG4gICAgICAgIG51bV9zaGFycHMgPSBudW1fZmxhdHMgPSAwO1xuICAgICAgICBzd2l0Y2ggKG5vdGVzY2FsZSkge1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQTogICAgIG51bV9zaGFycHMgPSAzOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkJmbGF0OiBudW1fZmxhdHMgPSAyOyAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5COiAgICAgbnVtX3NoYXJwcyA9IDU7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQzogICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRGZsYXQ6IG51bV9mbGF0cyA9IDU7ICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkQ6ICAgICBudW1fc2hhcnBzID0gMjsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5FZmxhdDogbnVtX2ZsYXRzID0gMzsgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRTogICAgIG51bV9zaGFycHMgPSA0OyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkY6ICAgICBudW1fZmxhdHMgPSAxOyAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5HZmxhdDogbnVtX2ZsYXRzID0gNjsgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRzogICAgIG51bV9zaGFycHMgPSAxOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkFmbGF0OiBudW1fZmxhdHMgPSA0OyAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBDcmVhdGVBY2NpZGVudGFsTWFwcygpO1xuICAgICAgICBrZXltYXAgPSBuZXcgQWNjaWRbMTYwXTtcbiAgICAgICAgUmVzZXRLZXlNYXAoKTtcbiAgICAgICAgQ3JlYXRlU3ltYm9scygpO1xuICAgIH1cblxuXG4gICAgLyoqIEluaWl0YWxpemUgdGhlIHNoYXJwa2V5cyBhbmQgZmxhdGtleXMgbWFwcyAqL1xuICAgIHByaXZhdGUgc3RhdGljIHZvaWQgQ3JlYXRlQWNjaWRlbnRhbE1hcHMoKSB7XG4gICAgICAgIGlmIChzaGFycGtleXMgIT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybjsgXG5cbiAgICAgICAgQWNjaWRbXSBtYXA7XG4gICAgICAgIHNoYXJwa2V5cyA9IG5ldyBBY2NpZFs4XVtdO1xuICAgICAgICBmbGF0a2V5cyA9IG5ldyBBY2NpZFs4XVtdO1xuXG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgICAgICBzaGFycGtleXNbaV0gPSBuZXcgQWNjaWRbMTJdO1xuICAgICAgICAgICAgZmxhdGtleXNbaV0gPSBuZXcgQWNjaWRbMTJdO1xuICAgICAgICB9XG5cbiAgICAgICAgbWFwID0gc2hhcnBrZXlzW0NdO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkFzaGFycCBdID0gQWNjaWQuRmxhdDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkNzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRHNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuR3NoYXJwIF0gPSBBY2NpZC5TaGFycDtcblxuICAgICAgICBtYXAgPSBzaGFycGtleXNbR107XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQXNoYXJwIF0gPSBBY2NpZC5GbGF0O1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQ3NoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRCBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Ec2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRnNoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkdzaGFycCBdID0gQWNjaWQuU2hhcnA7XG5cbiAgICAgICAgbWFwID0gc2hhcnBrZXlzW0RdO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkFzaGFycCBdID0gQWNjaWQuRmxhdDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkNzaGFycCBdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRCBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Ec2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRnNoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkdzaGFycCBdID0gQWNjaWQuU2hhcnA7XG5cbiAgICAgICAgbWFwID0gc2hhcnBrZXlzW0FdO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkFzaGFycCBdID0gQWNjaWQuRmxhdDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkNzaGFycCBdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRCBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Ec2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRnNoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkdzaGFycCBdID0gQWNjaWQuTm9uZTtcblxuICAgICAgICBtYXAgPSBzaGFycGtleXNbRV07XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQXNoYXJwIF0gPSBBY2NpZC5GbGF0O1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQ3NoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRzaGFycCBdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Hc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG5cbiAgICAgICAgbWFwID0gc2hhcnBrZXlzW0JdO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkFzaGFycCBdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkNzaGFycCBdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRCBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Ec2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Gc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuR3NoYXJwIF0gPSBBY2NpZC5Ob25lO1xuXG4gICAgICAgIC8qIEZsYXQga2V5cyAqL1xuICAgICAgICBtYXAgPSBmbGF0a2V5c1tDXTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Bc2hhcnAgXSA9IEFjY2lkLkZsYXQ7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Dc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Gc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkdzaGFycCBdID0gQWNjaWQuU2hhcnA7XG5cbiAgICAgICAgbWFwID0gZmxhdGtleXNbRl07XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQmZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQ3NoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRCBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FZmxhdCBdICA9IEFjY2lkLkZsYXQ7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Gc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkFmbGF0IF0gID0gQWNjaWQuRmxhdDtcblxuICAgICAgICBtYXAgPSBmbGF0a2V5c1tCZmxhdF07XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQmZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQ3NoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRCBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Gc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkFmbGF0IF0gID0gQWNjaWQuRmxhdDtcblxuICAgICAgICBtYXAgPSBmbGF0a2V5c1tFZmxhdF07XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQmZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRGZsYXQgXSAgPSBBY2NpZC5GbGF0O1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkVmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQWZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuXG4gICAgICAgIG1hcCA9IGZsYXRrZXlzW0FmbGF0XTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRWZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRnNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BZmxhdCBdICA9IEFjY2lkLk5vbmU7XG5cbiAgICAgICAgbWFwID0gZmxhdGtleXNbRGZsYXRdO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkJmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRCBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQWZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuXG4gICAgICAgIG1hcCA9IGZsYXRrZXlzW0dmbGF0XTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRWZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuR2ZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkFmbGF0IF0gID0gQWNjaWQuTm9uZTtcblxuXG4gICAgfVxuXG4gICAgLyoqIFRoZSBrZXltYXAgdGVsbHMgd2hhdCBhY2NpZGVudGFsIHN5bWJvbCBpcyBuZWVkZWQgZm9yIGVhY2hcbiAgICAgKiAgbm90ZSBpbiB0aGUgc2NhbGUuICBSZXNldCB0aGUga2V5bWFwIHRvIHRoZSB2YWx1ZXMgb2YgdGhlXG4gICAgICogIGtleSBzaWduYXR1cmUuXG4gICAgICovXG4gICAgcHJpdmF0ZSB2b2lkIFJlc2V0S2V5TWFwKClcbiAgICB7XG4gICAgICAgIEFjY2lkW10ga2V5O1xuICAgICAgICBpZiAobnVtX2ZsYXRzID4gMClcbiAgICAgICAgICAgIGtleSA9IGZsYXRrZXlzW251bV9mbGF0c107XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGtleSA9IHNoYXJwa2V5c1tudW1fc2hhcnBzXTtcblxuICAgICAgICBmb3IgKGludCBub3RlbnVtYmVyID0gMDsgbm90ZW51bWJlciA8IGtleW1hcC5MZW5ndGg7IG5vdGVudW1iZXIrKykge1xuICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXJdID0ga2V5W05vdGVTY2FsZS5Gcm9tTnVtYmVyKG5vdGVudW1iZXIpXTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLyoqIENyZWF0ZSB0aGUgQWNjaWRlbnRhbCBzeW1ib2xzIGZvciB0aGlzIGtleSwgZm9yXG4gICAgICogdGhlIHRyZWJsZSBhbmQgYmFzcyBjbGVmcy5cbiAgICAgKi9cbiAgICBwcml2YXRlIHZvaWQgQ3JlYXRlU3ltYm9scygpIHtcbiAgICAgICAgaW50IGNvdW50ID0gTWF0aC5NYXgobnVtX3NoYXJwcywgbnVtX2ZsYXRzKTtcbiAgICAgICAgdHJlYmxlID0gbmV3IEFjY2lkU3ltYm9sW2NvdW50XTtcbiAgICAgICAgYmFzcyA9IG5ldyBBY2NpZFN5bWJvbFtjb3VudF07XG5cbiAgICAgICAgaWYgKGNvdW50ID09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIFdoaXRlTm90ZVtdIHRyZWJsZW5vdGVzID0gbnVsbDtcbiAgICAgICAgV2hpdGVOb3RlW10gYmFzc25vdGVzID0gbnVsbDtcblxuICAgICAgICBpZiAobnVtX3NoYXJwcyA+IDApICB7XG4gICAgICAgICAgICB0cmVibGVub3RlcyA9IG5ldyBXaGl0ZU5vdGVbXSB7XG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRiwgNSksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQywgNSksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRywgNSksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRCwgNSksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQSwgNiksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRSwgNSlcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBiYXNzbm90ZXMgPSBuZXcgV2hpdGVOb3RlW10ge1xuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkYsIDMpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkMsIDMpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkcsIDMpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkQsIDMpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkEsIDQpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkUsIDMpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG51bV9mbGF0cyA+IDApIHtcbiAgICAgICAgICAgIHRyZWJsZW5vdGVzID0gbmV3IFdoaXRlTm90ZVtdIHtcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5CLCA1KSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5FLCA1KSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5BLCA1KSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5ELCA1KSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5HLCA0KSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5DLCA1KVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGJhc3Nub3RlcyA9IG5ldyBXaGl0ZU5vdGVbXSB7XG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQiwgMyksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRSwgMyksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQSwgMyksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRCwgMyksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRywgMiksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQywgMylcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBBY2NpZCBhID0gQWNjaWQuTm9uZTtcbiAgICAgICAgaWYgKG51bV9zaGFycHMgPiAwKVxuICAgICAgICAgICAgYSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBhID0gQWNjaWQuRmxhdDtcblxuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIHRyZWJsZVtpXSA9IG5ldyBBY2NpZFN5bWJvbChhLCB0cmVibGVub3Rlc1tpXSwgQ2xlZi5UcmVibGUpO1xuICAgICAgICAgICAgYmFzc1tpXSA9IG5ldyBBY2NpZFN5bWJvbChhLCBiYXNzbm90ZXNbaV0sIENsZWYuQmFzcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBBY2NpZGVudGFsIHN5bWJvbHMgZm9yIGRpc3BsYXlpbmcgdGhpcyBrZXkgc2lnbmF0dXJlXG4gICAgICogZm9yIHRoZSBnaXZlbiBjbGVmLlxuICAgICAqL1xuICAgIHB1YmxpYyBBY2NpZFN5bWJvbFtdIEdldFN5bWJvbHMoQ2xlZiBjbGVmKSB7XG4gICAgICAgIGlmIChjbGVmID09IENsZWYuVHJlYmxlKVxuICAgICAgICAgICAgcmV0dXJuIHRyZWJsZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGJhc3M7XG4gICAgfVxuXG4gICAgLyoqIEdpdmVuIGEgbWlkaSBub3RlIG51bWJlciwgcmV0dXJuIHRoZSBhY2NpZGVudGFsIChpZiBhbnkpIFxuICAgICAqIHRoYXQgc2hvdWxkIGJlIHVzZWQgd2hlbiBkaXNwbGF5aW5nIHRoZSBub3RlIGluIHRoaXMga2V5IHNpZ25hdHVyZS5cbiAgICAgKlxuICAgICAqIFRoZSBjdXJyZW50IG1lYXN1cmUgaXMgYWxzbyByZXF1aXJlZC4gIE9uY2Ugd2UgcmV0dXJuIGFuXG4gICAgICogYWNjaWRlbnRhbCBmb3IgYSBtZWFzdXJlLCB0aGUgYWNjaWRlbnRhbCByZW1haW5zIGZvciB0aGVcbiAgICAgKiByZXN0IG9mIHRoZSBtZWFzdXJlLiBTbyB3ZSBtdXN0IHVwZGF0ZSB0aGUgY3VycmVudCBrZXltYXBcbiAgICAgKiB3aXRoIGFueSBuZXcgYWNjaWRlbnRhbHMgdGhhdCB3ZSByZXR1cm4uICBXaGVuIHdlIG1vdmUgdG8gYW5vdGhlclxuICAgICAqIG1lYXN1cmUsIHdlIHJlc2V0IHRoZSBrZXltYXAgYmFjayB0byB0aGUga2V5IHNpZ25hdHVyZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgQWNjaWQgR2V0QWNjaWRlbnRhbChpbnQgbm90ZW51bWJlciwgaW50IG1lYXN1cmUpIHtcbiAgICAgICAgaWYgKG1lYXN1cmUgIT0gcHJldm1lYXN1cmUpIHtcbiAgICAgICAgICAgIFJlc2V0S2V5TWFwKCk7XG4gICAgICAgICAgICBwcmV2bWVhc3VyZSA9IG1lYXN1cmU7XG4gICAgICAgIH1cblxuICAgICAgICBBY2NpZCByZXN1bHQgPSBrZXltYXBbbm90ZW51bWJlcl07XG4gICAgICAgIGlmIChyZXN1bHQgPT0gQWNjaWQuU2hhcnApIHtcbiAgICAgICAgICAgIGtleW1hcFtub3RlbnVtYmVyXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlci0xXSA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocmVzdWx0ID09IEFjY2lkLkZsYXQpIHtcbiAgICAgICAgICAgIGtleW1hcFtub3RlbnVtYmVyXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlcisxXSA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocmVzdWx0ID09IEFjY2lkLk5hdHVyYWwpIHtcbiAgICAgICAgICAgIGtleW1hcFtub3RlbnVtYmVyXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgICAgICBpbnQgbmV4dGtleSA9IE5vdGVTY2FsZS5Gcm9tTnVtYmVyKG5vdGVudW1iZXIrMSk7XG4gICAgICAgICAgICBpbnQgcHJldmtleSA9IE5vdGVTY2FsZS5Gcm9tTnVtYmVyKG5vdGVudW1iZXItMSk7XG5cbiAgICAgICAgICAgIC8qIElmIHdlIGluc2VydCBhIG5hdHVyYWwsIHRoZW4gZWl0aGVyOlxuICAgICAgICAgICAgICogLSB0aGUgbmV4dCBrZXkgbXVzdCBnbyBiYWNrIHRvIHNoYXJwLFxuICAgICAgICAgICAgICogLSB0aGUgcHJldmlvdXMga2V5IG11c3QgZ28gYmFjayB0byBmbGF0LlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAoa2V5bWFwW25vdGVudW1iZXItMV0gPT0gQWNjaWQuTm9uZSAmJiBrZXltYXBbbm90ZW51bWJlcisxXSA9PSBBY2NpZC5Ob25lICYmXG4gICAgICAgICAgICAgICAgTm90ZVNjYWxlLklzQmxhY2tLZXkobmV4dGtleSkgJiYgTm90ZVNjYWxlLklzQmxhY2tLZXkocHJldmtleSkgKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAobnVtX2ZsYXRzID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXIrMV0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGtleW1hcFtub3RlbnVtYmVyLTFdID0gQWNjaWQuRmxhdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChrZXltYXBbbm90ZW51bWJlci0xXSA9PSBBY2NpZC5Ob25lICYmIE5vdGVTY2FsZS5Jc0JsYWNrS2V5KHByZXZrZXkpKSB7XG4gICAgICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXItMV0gPSBBY2NpZC5GbGF0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5bWFwW25vdGVudW1iZXIrMV0gPT0gQWNjaWQuTm9uZSAmJiBOb3RlU2NhbGUuSXNCbGFja0tleShuZXh0a2V5KSkge1xuICAgICAgICAgICAgICAgIGtleW1hcFtub3RlbnVtYmVyKzFdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvKiBTaG91bGRuJ3QgZ2V0IGhlcmUgKi9cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuXG4gICAgLyoqIEdpdmVuIGEgbWlkaSBub3RlIG51bWJlciwgcmV0dXJuIHRoZSB3aGl0ZSBub3RlICh0aGVcbiAgICAgKiBub24tc2hhcnAvbm9uLWZsYXQgbm90ZSkgdGhhdCBzaG91bGQgYmUgdXNlZCB3aGVuIGRpc3BsYXlpbmdcbiAgICAgKiB0aGlzIG5vdGUgaW4gdGhpcyBrZXkgc2lnbmF0dXJlLiAgVGhpcyBzaG91bGQgYmUgY2FsbGVkXG4gICAgICogYmVmb3JlIGNhbGxpbmcgR2V0QWNjaWRlbnRhbCgpLlxuICAgICAqL1xuICAgIHB1YmxpYyBXaGl0ZU5vdGUgR2V0V2hpdGVOb3RlKGludCBub3RlbnVtYmVyKSB7XG4gICAgICAgIGludCBub3Rlc2NhbGUgPSBOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyKTtcbiAgICAgICAgaW50IG9jdGF2ZSA9IChub3RlbnVtYmVyICsgMykgLyAxMiAtIDE7XG4gICAgICAgIGludCBsZXR0ZXIgPSAwO1xuXG4gICAgICAgIGludFtdIHdob2xlX3NoYXJwcyA9IHsgXG4gICAgICAgICAgICBXaGl0ZU5vdGUuQSwgV2hpdGVOb3RlLkEsIFxuICAgICAgICAgICAgV2hpdGVOb3RlLkIsIFxuICAgICAgICAgICAgV2hpdGVOb3RlLkMsIFdoaXRlTm90ZS5DLFxuICAgICAgICAgICAgV2hpdGVOb3RlLkQsIFdoaXRlTm90ZS5ELFxuICAgICAgICAgICAgV2hpdGVOb3RlLkUsXG4gICAgICAgICAgICBXaGl0ZU5vdGUuRiwgV2hpdGVOb3RlLkYsXG4gICAgICAgICAgICBXaGl0ZU5vdGUuRywgV2hpdGVOb3RlLkdcbiAgICAgICAgfTtcblxuICAgICAgICBpbnRbXSB3aG9sZV9mbGF0cyA9IHtcbiAgICAgICAgICAgIFdoaXRlTm90ZS5BLCBcbiAgICAgICAgICAgIFdoaXRlTm90ZS5CLCBXaGl0ZU5vdGUuQixcbiAgICAgICAgICAgIFdoaXRlTm90ZS5DLFxuICAgICAgICAgICAgV2hpdGVOb3RlLkQsIFdoaXRlTm90ZS5ELFxuICAgICAgICAgICAgV2hpdGVOb3RlLkUsIFdoaXRlTm90ZS5FLFxuICAgICAgICAgICAgV2hpdGVOb3RlLkYsXG4gICAgICAgICAgICBXaGl0ZU5vdGUuRywgV2hpdGVOb3RlLkcsXG4gICAgICAgICAgICBXaGl0ZU5vdGUuQVxuICAgICAgICB9O1xuXG4gICAgICAgIEFjY2lkIGFjY2lkID0ga2V5bWFwW25vdGVudW1iZXJdO1xuICAgICAgICBpZiAoYWNjaWQgPT0gQWNjaWQuRmxhdCkge1xuICAgICAgICAgICAgbGV0dGVyID0gd2hvbGVfZmxhdHNbbm90ZXNjYWxlXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhY2NpZCA9PSBBY2NpZC5TaGFycCkge1xuICAgICAgICAgICAgbGV0dGVyID0gd2hvbGVfc2hhcnBzW25vdGVzY2FsZV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYWNjaWQgPT0gQWNjaWQuTmF0dXJhbCkge1xuICAgICAgICAgICAgbGV0dGVyID0gd2hvbGVfc2hhcnBzW25vdGVzY2FsZV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYWNjaWQgPT0gQWNjaWQuTm9uZSkge1xuICAgICAgICAgICAgbGV0dGVyID0gd2hvbGVfc2hhcnBzW25vdGVzY2FsZV07XG5cbiAgICAgICAgICAgIC8qIElmIHRoZSBub3RlIG51bWJlciBpcyBhIHNoYXJwL2ZsYXQsIGFuZCB0aGVyZSdzIG5vIGFjY2lkZW50YWwsXG4gICAgICAgICAgICAgKiBkZXRlcm1pbmUgdGhlIHdoaXRlIG5vdGUgYnkgc2VlaW5nIHdoZXRoZXIgdGhlIHByZXZpb3VzIG9yIG5leHQgbm90ZVxuICAgICAgICAgICAgICogaXMgYSBuYXR1cmFsLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAoTm90ZVNjYWxlLklzQmxhY2tLZXkobm90ZXNjYWxlKSkge1xuICAgICAgICAgICAgICAgIGlmIChrZXltYXBbbm90ZW51bWJlci0xXSA9PSBBY2NpZC5OYXR1cmFsICYmIFxuICAgICAgICAgICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlcisxXSA9PSBBY2NpZC5OYXR1cmFsKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG51bV9mbGF0cyA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldHRlciA9IHdob2xlX2ZsYXRzW25vdGVzY2FsZV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXR0ZXIgPSB3aG9sZV9zaGFycHNbbm90ZXNjYWxlXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChrZXltYXBbbm90ZW51bWJlci0xXSA9PSBBY2NpZC5OYXR1cmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldHRlciA9IHdob2xlX3NoYXJwc1tub3Rlc2NhbGVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChrZXltYXBbbm90ZW51bWJlcisxXSA9PSBBY2NpZC5OYXR1cmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldHRlciA9IHdob2xlX2ZsYXRzW25vdGVzY2FsZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyogVGhlIGFib3ZlIGFsZ29yaXRobSBkb2Vzbid0IHF1aXRlIHdvcmsgZm9yIEctZmxhdCBtYWpvci5cbiAgICAgICAgICogSGFuZGxlIGl0IGhlcmUuXG4gICAgICAgICAqL1xuICAgICAgICBpZiAobnVtX2ZsYXRzID09IEdmbGF0ICYmIG5vdGVzY2FsZSA9PSBOb3RlU2NhbGUuQikge1xuICAgICAgICAgICAgbGV0dGVyID0gV2hpdGVOb3RlLkM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG51bV9mbGF0cyA9PSBHZmxhdCAmJiBub3Rlc2NhbGUgPT0gTm90ZVNjYWxlLkJmbGF0KSB7XG4gICAgICAgICAgICBsZXR0ZXIgPSBXaGl0ZU5vdGUuQjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChudW1fZmxhdHMgPiAwICYmIG5vdGVzY2FsZSA9PSBOb3RlU2NhbGUuQWZsYXQpIHtcbiAgICAgICAgICAgIG9jdGF2ZSsrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBXaGl0ZU5vdGUobGV0dGVyLCBvY3RhdmUpO1xuICAgIH1cblxuXG4gICAgLyoqIEd1ZXNzIHRoZSBrZXkgc2lnbmF0dXJlLCBnaXZlbiB0aGUgbWlkaSBub3RlIG51bWJlcnMgdXNlZCBpblxuICAgICAqIHRoZSBzb25nLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgS2V5U2lnbmF0dXJlIEd1ZXNzKExpc3Q8aW50PiBub3Rlcykge1xuICAgICAgICBDcmVhdGVBY2NpZGVudGFsTWFwcygpO1xuXG4gICAgICAgIC8qIEdldCB0aGUgZnJlcXVlbmN5IGNvdW50IG9mIGVhY2ggbm90ZSBpbiB0aGUgMTItbm90ZSBzY2FsZSAqL1xuICAgICAgICBpbnRbXSBub3RlY291bnQgPSBuZXcgaW50WzEyXTtcbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBub3Rlcy5Db3VudDsgaSsrKSB7XG4gICAgICAgICAgICBpbnQgbm90ZW51bWJlciA9IG5vdGVzW2ldO1xuICAgICAgICAgICAgaW50IG5vdGVzY2FsZSA9IChub3RlbnVtYmVyICsgMykgJSAxMjtcbiAgICAgICAgICAgIG5vdGVjb3VudFtub3Rlc2NhbGVdICs9IDE7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBGb3IgZWFjaCBrZXkgc2lnbmF0dXJlLCBjb3VudCB0aGUgdG90YWwgbnVtYmVyIG9mIGFjY2lkZW50YWxzXG4gICAgICAgICAqIG5lZWRlZCB0byBkaXNwbGF5IGFsbCB0aGUgbm90ZXMuICBDaG9vc2UgdGhlIGtleSBzaWduYXR1cmVcbiAgICAgICAgICogd2l0aCB0aGUgZmV3ZXN0IGFjY2lkZW50YWxzLlxuICAgICAgICAgKi9cbiAgICAgICAgaW50IGJlc3RrZXkgPSAwO1xuICAgICAgICBib29sIGlzX2Jlc3Rfc2hhcnAgPSB0cnVlO1xuICAgICAgICBpbnQgc21hbGxlc3RfYWNjaWRfY291bnQgPSBub3Rlcy5Db3VudDtcbiAgICAgICAgaW50IGtleTtcblxuICAgICAgICBmb3IgKGtleSA9IDA7IGtleSA8IDY7IGtleSsrKSB7XG4gICAgICAgICAgICBpbnQgYWNjaWRfY291bnQgPSAwO1xuICAgICAgICAgICAgZm9yIChpbnQgbiA9IDA7IG4gPCAxMjsgbisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNoYXJwa2V5c1trZXldW25dICE9IEFjY2lkLk5vbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgYWNjaWRfY291bnQgKz0gbm90ZWNvdW50W25dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhY2NpZF9jb3VudCA8IHNtYWxsZXN0X2FjY2lkX2NvdW50KSB7XG4gICAgICAgICAgICAgICAgc21hbGxlc3RfYWNjaWRfY291bnQgPSBhY2NpZF9jb3VudDtcbiAgICAgICAgICAgICAgICBiZXN0a2V5ID0ga2V5O1xuICAgICAgICAgICAgICAgIGlzX2Jlc3Rfc2hhcnAgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChrZXkgPSAwOyBrZXkgPCA3OyBrZXkrKykge1xuICAgICAgICAgICAgaW50IGFjY2lkX2NvdW50ID0gMDtcbiAgICAgICAgICAgIGZvciAoaW50IG4gPSAwOyBuIDwgMTI7IG4rKykge1xuICAgICAgICAgICAgICAgIGlmIChmbGF0a2V5c1trZXldW25dICE9IEFjY2lkLk5vbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgYWNjaWRfY291bnQgKz0gbm90ZWNvdW50W25dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhY2NpZF9jb3VudCA8IHNtYWxsZXN0X2FjY2lkX2NvdW50KSB7XG4gICAgICAgICAgICAgICAgc21hbGxlc3RfYWNjaWRfY291bnQgPSBhY2NpZF9jb3VudDtcbiAgICAgICAgICAgICAgICBiZXN0a2V5ID0ga2V5O1xuICAgICAgICAgICAgICAgIGlzX2Jlc3Rfc2hhcnAgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNfYmVzdF9zaGFycCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBLZXlTaWduYXR1cmUoYmVzdGtleSwgMCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEtleVNpZ25hdHVyZSgwLCBiZXN0a2V5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGlzIGtleSBzaWduYXR1cmUgaXMgZXF1YWwgdG8ga2V5IHNpZ25hdHVyZSBrICovXG4gICAgcHVibGljIGJvb2wgRXF1YWxzKEtleVNpZ25hdHVyZSBrKSB7XG4gICAgICAgIGlmIChrLm51bV9zaGFycHMgPT0gbnVtX3NoYXJwcyAmJiBrLm51bV9mbGF0cyA9PSBudW1fZmxhdHMpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qIFJldHVybiB0aGUgTWFqb3IgS2V5IG9mIHRoaXMgS2V5IFNpZ25hdHVyZSAqL1xuICAgIHB1YmxpYyBpbnQgTm90ZXNjYWxlKCkge1xuICAgICAgICBpbnRbXSBmbGF0bWFqb3IgPSB7XG4gICAgICAgICAgICBOb3RlU2NhbGUuQywgTm90ZVNjYWxlLkYsIE5vdGVTY2FsZS5CZmxhdCwgTm90ZVNjYWxlLkVmbGF0LFxuICAgICAgICAgICAgTm90ZVNjYWxlLkFmbGF0LCBOb3RlU2NhbGUuRGZsYXQsIE5vdGVTY2FsZS5HZmxhdCwgTm90ZVNjYWxlLkIgXG4gICAgICAgIH07XG5cbiAgICAgICAgaW50W10gc2hhcnBtYWpvciA9IHtcbiAgICAgICAgICAgIE5vdGVTY2FsZS5DLCBOb3RlU2NhbGUuRywgTm90ZVNjYWxlLkQsIE5vdGVTY2FsZS5BLCBOb3RlU2NhbGUuRSxcbiAgICAgICAgICAgIE5vdGVTY2FsZS5CLCBOb3RlU2NhbGUuRnNoYXJwLCBOb3RlU2NhbGUuQ3NoYXJwLCBOb3RlU2NhbGUuR3NoYXJwLFxuICAgICAgICAgICAgTm90ZVNjYWxlLkRzaGFycFxuICAgICAgICB9O1xuICAgICAgICBpZiAobnVtX2ZsYXRzID4gMClcbiAgICAgICAgICAgIHJldHVybiBmbGF0bWFqb3JbbnVtX2ZsYXRzXTtcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIHJldHVybiBzaGFycG1ham9yW251bV9zaGFycHNdO1xuICAgIH1cblxuICAgIC8qIENvbnZlcnQgYSBNYWpvciBLZXkgaW50byBhIHN0cmluZyAqL1xuICAgIHB1YmxpYyBzdGF0aWMgc3RyaW5nIEtleVRvU3RyaW5nKGludCBub3Rlc2NhbGUpIHtcbiAgICAgICAgc3dpdGNoIChub3Rlc2NhbGUpIHtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkE6ICAgICByZXR1cm4gXCJBIG1ham9yLCBGIyBtaW5vclwiIDtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkJmbGF0OiByZXR1cm4gXCJCLWZsYXQgbWFqb3IsIEcgbWlub3JcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkI6ICAgICByZXR1cm4gXCJCIG1ham9yLCBBLWZsYXQgbWlub3JcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkM6ICAgICByZXR1cm4gXCJDIG1ham9yLCBBIG1pbm9yXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5EZmxhdDogcmV0dXJuIFwiRC1mbGF0IG1ham9yLCBCLWZsYXQgbWlub3JcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkQ6ICAgICByZXR1cm4gXCJEIG1ham9yLCBCIG1pbm9yXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5FZmxhdDogcmV0dXJuIFwiRS1mbGF0IG1ham9yLCBDIG1pbm9yXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5FOiAgICAgcmV0dXJuIFwiRSBtYWpvciwgQyMgbWlub3JcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkY6ICAgICByZXR1cm4gXCJGIG1ham9yLCBEIG1pbm9yXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5HZmxhdDogcmV0dXJuIFwiRy1mbGF0IG1ham9yLCBFLWZsYXQgbWlub3JcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkc6ICAgICByZXR1cm4gXCJHIG1ham9yLCBFIG1pbm9yXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5BZmxhdDogcmV0dXJuIFwiQS1mbGF0IG1ham9yLCBGIG1pbm9yXCI7XG4gICAgICAgICAgICBkZWZhdWx0OiAgICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhpcyBrZXkgc2lnbmF0dXJlLlxuICAgICAqIFdlIG9ubHkgcmV0dXJuIHRoZSBtYWpvciBrZXkgc2lnbmF0dXJlLCBub3QgdGhlIG1pbm9yIG9uZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gS2V5VG9TdHJpbmcoIE5vdGVzY2FsZSgpICk7XG4gICAgfVxuXG5cbn1cblxufVxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDEyIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbi8qKiBAY2xhc3MgTHlyaWNTeW1ib2xcbiAqICBBIGx5cmljIGNvbnRhaW5zIHRoZSBseXJpYyB0byBkaXNwbGF5LCB0aGUgc3RhcnQgdGltZSB0aGUgbHlyaWMgb2NjdXJzIGF0LFxuICogIHRoZSB0aGUgeC1jb29yZGluYXRlIHdoZXJlIGl0IHdpbGwgYmUgZGlzcGxheWVkLlxuICovXG5wdWJsaWMgY2xhc3MgTHlyaWNTeW1ib2wge1xuICAgIHByaXZhdGUgaW50IHN0YXJ0dGltZTsgICAvKiogVGhlIHN0YXJ0IHRpbWUsIGluIHB1bHNlcyAqL1xuICAgIHByaXZhdGUgc3RyaW5nIHRleHQ7ICAgICAvKiogVGhlIGx5cmljIHRleHQgKi9cbiAgICBwcml2YXRlIGludCB4OyAgICAgICAgICAgLyoqIFRoZSB4IChob3Jpem9udGFsKSBwb3NpdGlvbiB3aXRoaW4gdGhlIHN0YWZmICovXG5cbiAgICBwdWJsaWMgTHlyaWNTeW1ib2woaW50IHN0YXJ0dGltZSwgc3RyaW5nIHRleHQpIHtcbiAgICAgICAgdGhpcy5zdGFydHRpbWUgPSBzdGFydHRpbWU7IFxuICAgICAgICB0aGlzLnRleHQgPSB0ZXh0O1xuICAgIH1cbiAgICAgXG4gICAgcHVibGljIGludCBTdGFydFRpbWUge1xuICAgICAgICBnZXQgeyByZXR1cm4gc3RhcnR0aW1lOyB9XG4gICAgICAgIHNldCB7IHN0YXJ0dGltZSA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgcHVibGljIHN0cmluZyBUZXh0IHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHRleHQ7IH1cbiAgICAgICAgc2V0IHsgdGV4dCA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgcHVibGljIGludCBYIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHg7IH1cbiAgICAgICAgc2V0IHsgeCA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgcHVibGljIGludCBNaW5XaWR0aCB7XG4gICAgICAgIGdldCB7IHJldHVybiBtaW5XaWR0aCgpOyB9XG4gICAgfVxuXG4gICAgLyogUmV0dXJuIHRoZSBtaW5pbXVtIHdpZHRoIGluIHBpeGVscyBuZWVkZWQgdG8gZGlzcGxheSB0aGlzIGx5cmljLlxuICAgICAqIFRoaXMgaXMgYW4gZXN0aW1hdGlvbiwgbm90IGV4YWN0LlxuICAgICAqL1xuICAgIHByaXZhdGUgaW50IG1pbldpZHRoKCkgeyBcbiAgICAgICAgZmxvYXQgd2lkdGhQZXJDaGFyID0gU2hlZXRNdXNpYy5MZXR0ZXJGb250LkdldEhlaWdodCgpICogMi4wZi8zLjBmO1xuICAgICAgICBmbG9hdCB3aWR0aCA9IHRleHQuTGVuZ3RoICogd2lkdGhQZXJDaGFyO1xuICAgICAgICBpZiAodGV4dC5JbmRleE9mKFwiaVwiKSA+PSAwKSB7XG4gICAgICAgICAgICB3aWR0aCAtPSB3aWR0aFBlckNoYXIvMi4wZjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGV4dC5JbmRleE9mKFwialwiKSA+PSAwKSB7XG4gICAgICAgICAgICB3aWR0aCAtPSB3aWR0aFBlckNoYXIvMi4wZjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGV4dC5JbmRleE9mKFwibFwiKSA+PSAwKSB7XG4gICAgICAgICAgICB3aWR0aCAtPSB3aWR0aFBlckNoYXIvMi4wZjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKGludCl3aWR0aDtcbiAgICB9XG5cbiAgICBwdWJsaWMgb3ZlcnJpZGUgXG4gICAgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gc3RyaW5nLkZvcm1hdChcIkx5cmljIHN0YXJ0PXswfSB4PXsxfSB0ZXh0PXsyfVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydHRpbWUsIHgsIHRleHQpO1xuICAgIH1cblxufVxuXG5cbn1cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMiBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogQGNsYXNzIE1pZGlFdmVudFxuICogQSBNaWRpRXZlbnQgcmVwcmVzZW50cyBhIHNpbmdsZSBldmVudCAoc3VjaCBhcyBFdmVudE5vdGVPbikgaW4gdGhlXG4gKiBNaWRpIGZpbGUuIEl0IGluY2x1ZGVzIHRoZSBkZWx0YSB0aW1lIG9mIHRoZSBldmVudC5cbiAqL1xucHVibGljIGNsYXNzIE1pZGlFdmVudCA6IElDb21wYXJlcjxNaWRpRXZlbnQ+IHtcblxuICAgIHB1YmxpYyBpbnQgICAgRGVsdGFUaW1lOyAgICAgLyoqIFRoZSB0aW1lIGJldHdlZW4gdGhlIHByZXZpb3VzIGV2ZW50IGFuZCB0aGlzIG9uICovXG4gICAgcHVibGljIGludCAgICBTdGFydFRpbWU7ICAgICAvKiogVGhlIGFic29sdXRlIHRpbWUgdGhpcyBldmVudCBvY2N1cnMgKi9cbiAgICBwdWJsaWMgYm9vbCAgIEhhc0V2ZW50ZmxhZzsgIC8qKiBGYWxzZSBpZiB0aGlzIGlzIHVzaW5nIHRoZSBwcmV2aW91cyBldmVudGZsYWcgKi9cbiAgICBwdWJsaWMgYnl0ZSAgIEV2ZW50RmxhZzsgICAgIC8qKiBOb3RlT24sIE5vdGVPZmYsIGV0Yy4gIEZ1bGwgbGlzdCBpcyBpbiBjbGFzcyBNaWRpRmlsZSAqL1xuICAgIHB1YmxpYyBieXRlICAgQ2hhbm5lbDsgICAgICAgLyoqIFRoZSBjaGFubmVsIHRoaXMgZXZlbnQgb2NjdXJzIG9uICovIFxuXG4gICAgcHVibGljIGJ5dGUgICBOb3RlbnVtYmVyOyAgICAvKiogVGhlIG5vdGUgbnVtYmVyICAqL1xuICAgIHB1YmxpYyBieXRlICAgVmVsb2NpdHk7ICAgICAgLyoqIFRoZSB2b2x1bWUgb2YgdGhlIG5vdGUgKi9cbiAgICBwdWJsaWMgYnl0ZSAgIEluc3RydW1lbnQ7ICAgIC8qKiBUaGUgaW5zdHJ1bWVudCAqL1xuICAgIHB1YmxpYyBieXRlICAgS2V5UHJlc3N1cmU7ICAgLyoqIFRoZSBrZXkgcHJlc3N1cmUgKi9cbiAgICBwdWJsaWMgYnl0ZSAgIENoYW5QcmVzc3VyZTsgIC8qKiBUaGUgY2hhbm5lbCBwcmVzc3VyZSAqL1xuICAgIHB1YmxpYyBieXRlICAgQ29udHJvbE51bTsgICAgLyoqIFRoZSBjb250cm9sbGVyIG51bWJlciAqL1xuICAgIHB1YmxpYyBieXRlICAgQ29udHJvbFZhbHVlOyAgLyoqIFRoZSBjb250cm9sbGVyIHZhbHVlICovXG4gICAgcHVibGljIHVzaG9ydCBQaXRjaEJlbmQ7ICAgICAvKiogVGhlIHBpdGNoIGJlbmQgdmFsdWUgKi9cbiAgICBwdWJsaWMgYnl0ZSAgIE51bWVyYXRvcjsgICAgIC8qKiBUaGUgbnVtZXJhdG9yLCBmb3IgVGltZVNpZ25hdHVyZSBtZXRhIGV2ZW50cyAqL1xuICAgIHB1YmxpYyBieXRlICAgRGVub21pbmF0b3I7ICAgLyoqIFRoZSBkZW5vbWluYXRvciwgZm9yIFRpbWVTaWduYXR1cmUgbWV0YSBldmVudHMgKi9cbiAgICBwdWJsaWMgaW50ICAgIFRlbXBvOyAgICAgICAgIC8qKiBUaGUgdGVtcG8sIGZvciBUZW1wbyBtZXRhIGV2ZW50cyAqL1xuICAgIHB1YmxpYyBieXRlICAgTWV0YWV2ZW50OyAgICAgLyoqIFRoZSBtZXRhZXZlbnQsIHVzZWQgaWYgZXZlbnRmbGFnIGlzIE1ldGFFdmVudCAqL1xuICAgIHB1YmxpYyBpbnQgICAgTWV0YWxlbmd0aDsgICAgLyoqIFRoZSBtZXRhZXZlbnQgbGVuZ3RoICAqL1xuICAgIHB1YmxpYyBieXRlW10gVmFsdWU7ICAgICAgICAgLyoqIFRoZSByYXcgYnl0ZSB2YWx1ZSwgZm9yIFN5c2V4IGFuZCBtZXRhIGV2ZW50cyAqL1xuXG4gICAgcHVibGljIE1pZGlFdmVudCgpIHtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIGEgY29weSBvZiB0aGlzIGV2ZW50ICovXG4gICAgcHVibGljIE1pZGlFdmVudCBDbG9uZSgpIHtcbiAgICAgICAgTWlkaUV2ZW50IG1ldmVudD0gbmV3IE1pZGlFdmVudCgpO1xuICAgICAgICBtZXZlbnQuRGVsdGFUaW1lID0gRGVsdGFUaW1lO1xuICAgICAgICBtZXZlbnQuU3RhcnRUaW1lID0gU3RhcnRUaW1lO1xuICAgICAgICBtZXZlbnQuSGFzRXZlbnRmbGFnID0gSGFzRXZlbnRmbGFnO1xuICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gRXZlbnRGbGFnO1xuICAgICAgICBtZXZlbnQuQ2hhbm5lbCA9IENoYW5uZWw7XG4gICAgICAgIG1ldmVudC5Ob3RlbnVtYmVyID0gTm90ZW51bWJlcjtcbiAgICAgICAgbWV2ZW50LlZlbG9jaXR5ID0gVmVsb2NpdHk7XG4gICAgICAgIG1ldmVudC5JbnN0cnVtZW50ID0gSW5zdHJ1bWVudDtcbiAgICAgICAgbWV2ZW50LktleVByZXNzdXJlID0gS2V5UHJlc3N1cmU7XG4gICAgICAgIG1ldmVudC5DaGFuUHJlc3N1cmUgPSBDaGFuUHJlc3N1cmU7XG4gICAgICAgIG1ldmVudC5Db250cm9sTnVtID0gQ29udHJvbE51bTtcbiAgICAgICAgbWV2ZW50LkNvbnRyb2xWYWx1ZSA9IENvbnRyb2xWYWx1ZTtcbiAgICAgICAgbWV2ZW50LlBpdGNoQmVuZCA9IFBpdGNoQmVuZDtcbiAgICAgICAgbWV2ZW50Lk51bWVyYXRvciA9IE51bWVyYXRvcjtcbiAgICAgICAgbWV2ZW50LkRlbm9taW5hdG9yID0gRGVub21pbmF0b3I7XG4gICAgICAgIG1ldmVudC5UZW1wbyA9IFRlbXBvO1xuICAgICAgICBtZXZlbnQuTWV0YWV2ZW50ID0gTWV0YWV2ZW50O1xuICAgICAgICBtZXZlbnQuTWV0YWxlbmd0aCA9IE1ldGFsZW5ndGg7XG4gICAgICAgIG1ldmVudC5WYWx1ZSA9IFZhbHVlO1xuICAgICAgICByZXR1cm4gbWV2ZW50O1xuICAgIH1cblxuICAgIC8qKiBDb21wYXJlIHR3byBNaWRpRXZlbnRzIGJhc2VkIG9uIHRoZWlyIHN0YXJ0IHRpbWVzLiAqL1xuICAgIHB1YmxpYyBpbnQgQ29tcGFyZShNaWRpRXZlbnQgeCwgTWlkaUV2ZW50IHkpIHtcbiAgICAgICAgaWYgKHguU3RhcnRUaW1lID09IHkuU3RhcnRUaW1lKSB7XG4gICAgICAgICAgICBpZiAoeC5FdmVudEZsYWcgPT0geS5FdmVudEZsYWcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geC5Ob3RlbnVtYmVyIC0geS5Ob3RlbnVtYmVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHguRXZlbnRGbGFnIC0geS5FdmVudEZsYWc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4geC5TdGFydFRpbWUgLSB5LlN0YXJ0VGltZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxufSAgLyogRW5kIG5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyAqL1xuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTIgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyogVGhpcyBmaWxlIGNvbnRhaW5zIHRoZSBjbGFzc2VzIGZvciBwYXJzaW5nIGFuZCBtb2RpZnlpbmdcbiAqIE1JREkgbXVzaWMgZmlsZXMuXG4gKi9cblxuLyogTUlESSBmaWxlIGZvcm1hdC5cbiAqXG4gKiBUaGUgTWlkaSBGaWxlIGZvcm1hdCBpcyBkZXNjcmliZWQgYmVsb3cuICBUaGUgZGVzY3JpcHRpb24gdXNlc1xuICogdGhlIGZvbGxvd2luZyBhYmJyZXZpYXRpb25zLlxuICpcbiAqIHUxICAgICAtIE9uZSBieXRlXG4gKiB1MiAgICAgLSBUd28gYnl0ZXMgKGJpZyBlbmRpYW4pXG4gKiB1NCAgICAgLSBGb3VyIGJ5dGVzIChiaWcgZW5kaWFuKVxuICogdmFybGVuIC0gQSB2YXJpYWJsZSBsZW5ndGggaW50ZWdlciwgdGhhdCBjYW4gYmUgMSB0byA0IGJ5dGVzLiBUaGUgXG4gKiAgICAgICAgICBpbnRlZ2VyIGVuZHMgd2hlbiB5b3UgZW5jb3VudGVyIGEgYnl0ZSB0aGF0IGRvZXNuJ3QgaGF2ZSBcbiAqICAgICAgICAgIHRoZSA4dGggYml0IHNldCAoYSBieXRlIGxlc3MgdGhhbiAweDgwKS5cbiAqIGxlbj8gICAtIFRoZSBsZW5ndGggb2YgdGhlIGRhdGEgZGVwZW5kcyBvbiBzb21lIGNvZGVcbiAqICAgICAgICAgIFxuICpcbiAqIFRoZSBNaWRpIGZpbGVzIGJlZ2lucyB3aXRoIHRoZSBtYWluIE1pZGkgaGVhZGVyXG4gKiB1NCA9IFRoZSBmb3VyIGFzY2lpIGNoYXJhY3RlcnMgJ01UaGQnXG4gKiB1NCA9IFRoZSBsZW5ndGggb2YgdGhlIE1UaGQgaGVhZGVyID0gNiBieXRlc1xuICogdTIgPSAwIGlmIHRoZSBmaWxlIGNvbnRhaW5zIGEgc2luZ2xlIHRyYWNrXG4gKiAgICAgIDEgaWYgdGhlIGZpbGUgY29udGFpbnMgb25lIG9yIG1vcmUgc2ltdWx0YW5lb3VzIHRyYWNrc1xuICogICAgICAyIGlmIHRoZSBmaWxlIGNvbnRhaW5zIG9uZSBvciBtb3JlIGluZGVwZW5kZW50IHRyYWNrc1xuICogdTIgPSBudW1iZXIgb2YgdHJhY2tzXG4gKiB1MiA9IGlmID4gIDAsIHRoZSBudW1iZXIgb2YgcHVsc2VzIHBlciBxdWFydGVyIG5vdGVcbiAqICAgICAgaWYgPD0gMCwgdGhlbiA/Pz9cbiAqXG4gKiBOZXh0IGNvbWUgdGhlIGluZGl2aWR1YWwgTWlkaSB0cmFja3MuICBUaGUgdG90YWwgbnVtYmVyIG9mIE1pZGlcbiAqIHRyYWNrcyB3YXMgZ2l2ZW4gYWJvdmUsIGluIHRoZSBNVGhkIGhlYWRlci4gIEVhY2ggdHJhY2sgc3RhcnRzXG4gKiB3aXRoIGEgaGVhZGVyOlxuICpcbiAqIHU0ID0gVGhlIGZvdXIgYXNjaWkgY2hhcmFjdGVycyAnTVRyaydcbiAqIHU0ID0gQW1vdW50IG9mIHRyYWNrIGRhdGEsIGluIGJ5dGVzLlxuICogXG4gKiBUaGUgdHJhY2sgZGF0YSBjb25zaXN0cyBvZiBhIHNlcmllcyBvZiBNaWRpIGV2ZW50cy4gIEVhY2ggTWlkaSBldmVudFxuICogaGFzIHRoZSBmb2xsb3dpbmcgZm9ybWF0OlxuICpcbiAqIHZhcmxlbiAgLSBUaGUgdGltZSBiZXR3ZWVuIHRoZSBwcmV2aW91cyBldmVudCBhbmQgdGhpcyBldmVudCwgbWVhc3VyZWRcbiAqICAgICAgICAgICBpbiBcInB1bHNlc1wiLiAgVGhlIG51bWJlciBvZiBwdWxzZXMgcGVyIHF1YXJ0ZXIgbm90ZSBpcyBnaXZlblxuICogICAgICAgICAgIGluIHRoZSBNVGhkIGhlYWRlci5cbiAqIHUxICAgICAgLSBUaGUgRXZlbnQgY29kZSwgYWx3YXlzIGJldHdlZSAweDgwIGFuZCAweEZGXG4gKiBsZW4/ICAgIC0gVGhlIGV2ZW50IGRhdGEuICBUaGUgbGVuZ3RoIG9mIHRoaXMgZGF0YSBpcyBkZXRlcm1pbmVkIGJ5IHRoZVxuICogICAgICAgICAgIGV2ZW50IGNvZGUuICBUaGUgZmlyc3QgYnl0ZSBvZiB0aGUgZXZlbnQgZGF0YSBpcyBhbHdheXMgPCAweDgwLlxuICpcbiAqIFRoZSBldmVudCBjb2RlIGlzIG9wdGlvbmFsLiAgSWYgdGhlIGV2ZW50IGNvZGUgaXMgbWlzc2luZywgdGhlbiBpdFxuICogZGVmYXVsdHMgdG8gdGhlIHByZXZpb3VzIGV2ZW50IGNvZGUuICBGb3IgZXhhbXBsZTpcbiAqXG4gKiAgIHZhcmxlbiwgZXZlbnRjb2RlMSwgZXZlbnRkYXRhLFxuICogICB2YXJsZW4sIGV2ZW50Y29kZTIsIGV2ZW50ZGF0YSxcbiAqICAgdmFybGVuLCBldmVudGRhdGEsICAvLyBldmVudGNvZGUgaXMgZXZlbnRjb2RlMlxuICogICB2YXJsZW4sIGV2ZW50ZGF0YSwgIC8vIGV2ZW50Y29kZSBpcyBldmVudGNvZGUyXG4gKiAgIHZhcmxlbiwgZXZlbnRjb2RlMywgZXZlbnRkYXRhLFxuICogICAuLi4uXG4gKlxuICogICBIb3cgZG8geW91IGtub3cgaWYgdGhlIGV2ZW50Y29kZSBpcyB0aGVyZSBvciBtaXNzaW5nPyBXZWxsOlxuICogICAtIEFsbCBldmVudCBjb2RlcyBhcmUgYmV0d2VlbiAweDgwIGFuZCAweEZGXG4gKiAgIC0gVGhlIGZpcnN0IGJ5dGUgb2YgZXZlbnRkYXRhIGlzIGFsd2F5cyBsZXNzIHRoYW4gMHg4MC5cbiAqICAgU28sIGFmdGVyIHRoZSB2YXJsZW4gZGVsdGEgdGltZSwgaWYgdGhlIG5leHQgYnl0ZSBpcyBiZXR3ZWVuIDB4ODBcbiAqICAgYW5kIDB4RkYsIGl0cyBhbiBldmVudCBjb2RlLiAgT3RoZXJ3aXNlLCBpdHMgZXZlbnQgZGF0YS5cbiAqXG4gKiBUaGUgRXZlbnQgY29kZXMgYW5kIGV2ZW50IGRhdGEgZm9yIGVhY2ggZXZlbnQgY29kZSBhcmUgc2hvd24gYmVsb3cuXG4gKlxuICogQ29kZTogIHUxIC0gMHg4MCB0aHJ1IDB4OEYgLSBOb3RlIE9mZiBldmVudC5cbiAqICAgICAgICAgICAgIDB4ODAgaXMgZm9yIGNoYW5uZWwgMSwgMHg4RiBpcyBmb3IgY2hhbm5lbCAxNi5cbiAqIERhdGE6ICB1MSAtIFRoZSBub3RlIG51bWJlciwgMC0xMjcuICBNaWRkbGUgQyBpcyA2MCAoMHgzQylcbiAqICAgICAgICB1MSAtIFRoZSBub3RlIHZlbG9jaXR5LiAgVGhpcyBzaG91bGQgYmUgMFxuICogXG4gKiBDb2RlOiAgdTEgLSAweDkwIHRocnUgMHg5RiAtIE5vdGUgT24gZXZlbnQuXG4gKiAgICAgICAgICAgICAweDkwIGlzIGZvciBjaGFubmVsIDEsIDB4OUYgaXMgZm9yIGNoYW5uZWwgMTYuXG4gKiBEYXRhOiAgdTEgLSBUaGUgbm90ZSBudW1iZXIsIDAtMTI3LiAgTWlkZGxlIEMgaXMgNjAgKDB4M0MpXG4gKiAgICAgICAgdTEgLSBUaGUgbm90ZSB2ZWxvY2l0eSwgZnJvbSAwIChubyBzb3VuZCkgdG8gMTI3IChsb3VkKS5cbiAqICAgICAgICAgICAgIEEgdmFsdWUgb2YgMCBpcyBlcXVpdmFsZW50IHRvIGEgTm90ZSBPZmYuXG4gKlxuICogQ29kZTogIHUxIC0gMHhBMCB0aHJ1IDB4QUYgLSBLZXkgUHJlc3N1cmVcbiAqIERhdGE6ICB1MSAtIFRoZSBub3RlIG51bWJlciwgMC0xMjcuXG4gKiAgICAgICAgdTEgLSBUaGUgcHJlc3N1cmUuXG4gKlxuICogQ29kZTogIHUxIC0gMHhCMCB0aHJ1IDB4QkYgLSBDb250cm9sIENoYW5nZVxuICogRGF0YTogIHUxIC0gVGhlIGNvbnRyb2xsZXIgbnVtYmVyXG4gKiAgICAgICAgdTEgLSBUaGUgdmFsdWVcbiAqXG4gKiBDb2RlOiAgdTEgLSAweEMwIHRocnUgMHhDRiAtIFByb2dyYW0gQ2hhbmdlXG4gKiBEYXRhOiAgdTEgLSBUaGUgcHJvZ3JhbSBudW1iZXIuXG4gKlxuICogQ29kZTogIHUxIC0gMHhEMCB0aHJ1IDB4REYgLSBDaGFubmVsIFByZXNzdXJlXG4gKiAgICAgICAgdTEgLSBUaGUgcHJlc3N1cmUuXG4gKlxuICogQ29kZTogIHUxIC0gMHhFMCB0aHJ1IDB4RUYgLSBQaXRjaCBCZW5kXG4gKiBEYXRhOiAgdTIgLSBTb21lIGRhdGFcbiAqXG4gKiBDb2RlOiAgdTEgICAgIC0gMHhGRiAtIE1ldGEgRXZlbnRcbiAqIERhdGE6ICB1MSAgICAgLSBNZXRhY29kZVxuICogICAgICAgIHZhcmxlbiAtIExlbmd0aCBvZiBtZXRhIGV2ZW50XG4gKiAgICAgICAgdTFbdmFybGVuXSAtIE1ldGEgZXZlbnQgZGF0YS5cbiAqXG4gKlxuICogVGhlIE1ldGEgRXZlbnQgY29kZXMgYXJlIGxpc3RlZCBiZWxvdzpcbiAqXG4gKiBNZXRhY29kZTogdTEgICAgICAgICAtIDB4MCAgU2VxdWVuY2UgTnVtYmVyXG4gKiAgICAgICAgICAgdmFybGVuICAgICAtIDAgb3IgMlxuICogICAgICAgICAgIHUxW3Zhcmxlbl0gLSBTZXF1ZW5jZSBudW1iZXJcbiAqXG4gKiBNZXRhY29kZTogdTEgICAgICAgICAtIDB4MSAgVGV4dFxuICogICAgICAgICAgIHZhcmxlbiAgICAgLSBMZW5ndGggb2YgdGV4dFxuICogICAgICAgICAgIHUxW3Zhcmxlbl0gLSBUZXh0XG4gKlxuICogTWV0YWNvZGU6IHUxICAgICAgICAgLSAweDIgIENvcHlyaWdodFxuICogICAgICAgICAgIHZhcmxlbiAgICAgLSBMZW5ndGggb2YgdGV4dFxuICogICAgICAgICAgIHUxW3Zhcmxlbl0gLSBUZXh0XG4gKlxuICogTWV0YWNvZGU6IHUxICAgICAgICAgLSAweDMgIFRyYWNrIE5hbWVcbiAqICAgICAgICAgICB2YXJsZW4gICAgIC0gTGVuZ3RoIG9mIG5hbWVcbiAqICAgICAgICAgICB1MVt2YXJsZW5dIC0gVHJhY2sgTmFtZVxuICpcbiAqIE1ldGFjb2RlOiB1MSAgICAgICAgIC0gMHg1OCAgVGltZSBTaWduYXR1cmVcbiAqICAgICAgICAgICB2YXJsZW4gICAgIC0gNCBcbiAqICAgICAgICAgICB1MSAgICAgICAgIC0gbnVtZXJhdG9yXG4gKiAgICAgICAgICAgdTEgICAgICAgICAtIGxvZzIoZGVub21pbmF0b3IpXG4gKiAgICAgICAgICAgdTEgICAgICAgICAtIGNsb2NrcyBpbiBtZXRyb25vbWUgY2xpY2tcbiAqICAgICAgICAgICB1MSAgICAgICAgIC0gMzJuZCBub3RlcyBpbiBxdWFydGVyIG5vdGUgKHVzdWFsbHkgOClcbiAqXG4gKiBNZXRhY29kZTogdTEgICAgICAgICAtIDB4NTkgIEtleSBTaWduYXR1cmVcbiAqICAgICAgICAgICB2YXJsZW4gICAgIC0gMlxuICogICAgICAgICAgIHUxICAgICAgICAgLSBpZiA+PSAwLCB0aGVuIG51bWJlciBvZiBzaGFycHNcbiAqICAgICAgICAgICAgICAgICAgICAgICAgaWYgPCAwLCB0aGVuIG51bWJlciBvZiBmbGF0cyAqIC0xXG4gKiAgICAgICAgICAgdTEgICAgICAgICAtIDAgaWYgbWFqb3Iga2V5XG4gKiAgICAgICAgICAgICAgICAgICAgICAgIDEgaWYgbWlub3Iga2V5XG4gKlxuICogTWV0YWNvZGU6IHUxICAgICAgICAgLSAweDUxICBUZW1wb1xuICogICAgICAgICAgIHZhcmxlbiAgICAgLSAzICBcbiAqICAgICAgICAgICB1MyAgICAgICAgIC0gcXVhcnRlciBub3RlIGxlbmd0aCBpbiBtaWNyb3NlY29uZHNcbiAqL1xuXG5cbi8qKiBAY2xhc3MgTWlkaUZpbGVcbiAqXG4gKiBUaGUgTWlkaUZpbGUgY2xhc3MgY29udGFpbnMgdGhlIHBhcnNlZCBkYXRhIGZyb20gdGhlIE1pZGkgRmlsZS5cbiAqIEl0IGNvbnRhaW5zOlxuICogLSBBbGwgdGhlIHRyYWNrcyBpbiB0aGUgbWlkaSBmaWxlLCBpbmNsdWRpbmcgYWxsIE1pZGlOb3RlcyBwZXIgdHJhY2suXG4gKiAtIFRoZSB0aW1lIHNpZ25hdHVyZSAoZS5nLiA0LzQsIDMvNCwgNi84KVxuICogLSBUaGUgbnVtYmVyIG9mIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlLlxuICogLSBUaGUgdGVtcG8gKG51bWJlciBvZiBtaWNyb3NlY29uZHMgcGVyIHF1YXJ0ZXIgbm90ZSkuXG4gKlxuICogVGhlIGNvbnN0cnVjdG9yIHRha2VzIGEgZmlsZW5hbWUgYXMgaW5wdXQsIGFuZCB1cG9uIHJldHVybmluZyxcbiAqIGNvbnRhaW5zIHRoZSBwYXJzZWQgZGF0YSBmcm9tIHRoZSBtaWRpIGZpbGUuXG4gKlxuICogVGhlIG1ldGhvZHMgUmVhZFRyYWNrKCkgYW5kIFJlYWRNZXRhRXZlbnQoKSBhcmUgaGVscGVyIGZ1bmN0aW9ucyBjYWxsZWRcbiAqIGJ5IHRoZSBjb25zdHJ1Y3RvciBkdXJpbmcgdGhlIHBhcnNpbmcuXG4gKlxuICogQWZ0ZXIgdGhlIE1pZGlGaWxlIGlzIHBhcnNlZCBhbmQgY3JlYXRlZCwgdGhlIHVzZXIgY2FuIHJldHJpZXZlIHRoZSBcbiAqIHRyYWNrcyBhbmQgbm90ZXMgYnkgdXNpbmcgdGhlIHByb3BlcnR5IFRyYWNrcyBhbmQgVHJhY2tzLk5vdGVzLlxuICpcbiAqIFRoZXJlIGFyZSB0d28gbWV0aG9kcyBmb3IgbW9kaWZ5aW5nIHRoZSBtaWRpIGRhdGEgYmFzZWQgb24gdGhlIG1lbnVcbiAqIG9wdGlvbnMgc2VsZWN0ZWQ6XG4gKlxuICogLSBDaGFuZ2VNaWRpTm90ZXMoKVxuICogICBBcHBseSB0aGUgbWVudSBvcHRpb25zIHRvIHRoZSBwYXJzZWQgTWlkaUZpbGUuICBUaGlzIHVzZXMgdGhlIGhlbHBlciBmdW5jdGlvbnM6XG4gKiAgICAgU3BsaXRUcmFjaygpXG4gKiAgICAgQ29tYmluZVRvVHdvVHJhY2tzKClcbiAqICAgICBTaGlmdFRpbWUoKVxuICogICAgIFRyYW5zcG9zZSgpXG4gKiAgICAgUm91bmRTdGFydFRpbWVzKClcbiAqICAgICBSb3VuZER1cmF0aW9ucygpXG4gKlxuICogLSBDaGFuZ2VTb3VuZCgpXG4gKiAgIEFwcGx5IHRoZSBtZW51IG9wdGlvbnMgdG8gdGhlIE1JREkgbXVzaWMgZGF0YSwgYW5kIHNhdmUgdGhlIG1vZGlmaWVkIG1pZGkgZGF0YSBcbiAqICAgdG8gYSBmaWxlLCBmb3IgcGxheWJhY2suIFxuICogICBcbiAqL1xuXG5wdWJsaWMgY2xhc3MgTWlkaUZpbGUge1xuICAgIHByaXZhdGUgc3RyaW5nIGZpbGVuYW1lOyAgICAgICAgICAvKiogVGhlIE1pZGkgZmlsZSBuYW1lICovXG4gICAgcHJpdmF0ZSBMaXN0PE1pZGlFdmVudD5bXSBldmVudHM7IC8qKiBUaGUgcmF3IE1pZGlFdmVudHMsIG9uZSBsaXN0IHBlciB0cmFjayAqL1xuICAgIHByaXZhdGUgTGlzdDxNaWRpVHJhY2s+IHRyYWNrcyA7ICAvKiogVGhlIHRyYWNrcyBvZiB0aGUgbWlkaWZpbGUgdGhhdCBoYXZlIG5vdGVzICovXG4gICAgcHJpdmF0ZSB1c2hvcnQgdHJhY2ttb2RlOyAgICAgICAgIC8qKiAwIChzaW5nbGUgdHJhY2spLCAxIChzaW11bHRhbmVvdXMgdHJhY2tzKSAyIChpbmRlcGVuZGVudCB0cmFja3MpICovXG4gICAgcHJpdmF0ZSBUaW1lU2lnbmF0dXJlIHRpbWVzaWc7ICAgIC8qKiBUaGUgdGltZSBzaWduYXR1cmUgKi9cbiAgICBwcml2YXRlIGludCBxdWFydGVybm90ZTsgICAgICAgICAgLyoqIFRoZSBudW1iZXIgb2YgcHVsc2VzIHBlciBxdWFydGVyIG5vdGUgKi9cbiAgICBwcml2YXRlIGludCB0b3RhbHB1bHNlczsgICAgICAgICAgLyoqIFRoZSB0b3RhbCBsZW5ndGggb2YgdGhlIHNvbmcsIGluIHB1bHNlcyAqL1xuICAgIHByaXZhdGUgYm9vbCB0cmFja1BlckNoYW5uZWw7ICAgICAvKiogVHJ1ZSBpZiB3ZSd2ZSBzcGxpdCBlYWNoIGNoYW5uZWwgaW50byBhIHRyYWNrICovXG5cbiAgICAvKiBUaGUgbGlzdCBvZiBNaWRpIEV2ZW50cyAqL1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRXZlbnROb3RlT2ZmICAgICAgICAgPSAweDgwO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRXZlbnROb3RlT24gICAgICAgICAgPSAweDkwO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRXZlbnRLZXlQcmVzc3VyZSAgICAgPSAweEEwO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRXZlbnRDb250cm9sQ2hhbmdlICAgPSAweEIwO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRXZlbnRQcm9ncmFtQ2hhbmdlICAgPSAweEMwO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRXZlbnRDaGFubmVsUHJlc3N1cmUgPSAweEQwO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRXZlbnRQaXRjaEJlbmQgICAgICAgPSAweEUwO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgU3lzZXhFdmVudDEgICAgICAgICAgPSAweEYwO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgU3lzZXhFdmVudDIgICAgICAgICAgPSAweEY3O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50ICAgICAgICAgICAgPSAweEZGO1xuXG4gICAgLyogVGhlIGxpc3Qgb2YgTWV0YSBFdmVudHMgKi9cbiAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudFNlcXVlbmNlICAgICAgPSAweDA7XG4gICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRUZXh0ICAgICAgICAgID0gMHgxO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50Q29weXJpZ2h0ICAgICA9IDB4MjtcbiAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudFNlcXVlbmNlTmFtZSAgPSAweDM7XG4gICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRJbnN0cnVtZW50ICAgID0gMHg0O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50THlyaWMgICAgICAgICA9IDB4NTtcbiAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudE1hcmtlciAgICAgICAgPSAweDY7XG4gICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRFbmRPZlRyYWNrICAgID0gMHgyRjtcbiAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudFRlbXBvICAgICAgICAgPSAweDUxO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50U01QVEVPZmZzZXQgICA9IDB4NTQ7XG4gICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRUaW1lU2lnbmF0dXJlID0gMHg1ODtcbiAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudEtleVNpZ25hdHVyZSAgPSAweDU5O1xuXG4gICAgLyogVGhlIFByb2dyYW0gQ2hhbmdlIGV2ZW50IGdpdmVzIHRoZSBpbnN0cnVtZW50IHRoYXQgc2hvdWxkXG4gICAgICogYmUgdXNlZCBmb3IgYSBwYXJ0aWN1bGFyIGNoYW5uZWwuICBUaGUgZm9sbG93aW5nIHRhYmxlXG4gICAgICogbWFwcyBlYWNoIGluc3RydW1lbnQgbnVtYmVyICgwIHRocnUgMTI4KSB0byBhbiBpbnN0cnVtZW50XG4gICAgICogbmFtZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHN0cmluZ1tdIEluc3RydW1lbnRzID0ge1xuXG4gICAgICAgIFwiQWNvdXN0aWMgR3JhbmQgUGlhbm9cIixcbiAgICAgICAgXCJCcmlnaHQgQWNvdXN0aWMgUGlhbm9cIixcbiAgICAgICAgXCJFbGVjdHJpYyBHcmFuZCBQaWFub1wiLFxuICAgICAgICBcIkhvbmt5LXRvbmsgUGlhbm9cIixcbiAgICAgICAgXCJFbGVjdHJpYyBQaWFubyAxXCIsXG4gICAgICAgIFwiRWxlY3RyaWMgUGlhbm8gMlwiLFxuICAgICAgICBcIkhhcnBzaWNob3JkXCIsXG4gICAgICAgIFwiQ2xhdmlcIixcbiAgICAgICAgXCJDZWxlc3RhXCIsXG4gICAgICAgIFwiR2xvY2tlbnNwaWVsXCIsXG4gICAgICAgIFwiTXVzaWMgQm94XCIsXG4gICAgICAgIFwiVmlicmFwaG9uZVwiLFxuICAgICAgICBcIk1hcmltYmFcIixcbiAgICAgICAgXCJYeWxvcGhvbmVcIixcbiAgICAgICAgXCJUdWJ1bGFyIEJlbGxzXCIsXG4gICAgICAgIFwiRHVsY2ltZXJcIixcbiAgICAgICAgXCJEcmF3YmFyIE9yZ2FuXCIsXG4gICAgICAgIFwiUGVyY3Vzc2l2ZSBPcmdhblwiLFxuICAgICAgICBcIlJvY2sgT3JnYW5cIixcbiAgICAgICAgXCJDaHVyY2ggT3JnYW5cIixcbiAgICAgICAgXCJSZWVkIE9yZ2FuXCIsXG4gICAgICAgIFwiQWNjb3JkaW9uXCIsXG4gICAgICAgIFwiSGFybW9uaWNhXCIsXG4gICAgICAgIFwiVGFuZ28gQWNjb3JkaW9uXCIsXG4gICAgICAgIFwiQWNvdXN0aWMgR3VpdGFyIChueWxvbilcIixcbiAgICAgICAgXCJBY291c3RpYyBHdWl0YXIgKHN0ZWVsKVwiLFxuICAgICAgICBcIkVsZWN0cmljIEd1aXRhciAoamF6eilcIixcbiAgICAgICAgXCJFbGVjdHJpYyBHdWl0YXIgKGNsZWFuKVwiLFxuICAgICAgICBcIkVsZWN0cmljIEd1aXRhciAobXV0ZWQpXCIsXG4gICAgICAgIFwiT3ZlcmRyaXZlbiBHdWl0YXJcIixcbiAgICAgICAgXCJEaXN0b3J0aW9uIEd1aXRhclwiLFxuICAgICAgICBcIkd1aXRhciBoYXJtb25pY3NcIixcbiAgICAgICAgXCJBY291c3RpYyBCYXNzXCIsXG4gICAgICAgIFwiRWxlY3RyaWMgQmFzcyAoZmluZ2VyKVwiLFxuICAgICAgICBcIkVsZWN0cmljIEJhc3MgKHBpY2spXCIsXG4gICAgICAgIFwiRnJldGxlc3MgQmFzc1wiLFxuICAgICAgICBcIlNsYXAgQmFzcyAxXCIsXG4gICAgICAgIFwiU2xhcCBCYXNzIDJcIixcbiAgICAgICAgXCJTeW50aCBCYXNzIDFcIixcbiAgICAgICAgXCJTeW50aCBCYXNzIDJcIixcbiAgICAgICAgXCJWaW9saW5cIixcbiAgICAgICAgXCJWaW9sYVwiLFxuICAgICAgICBcIkNlbGxvXCIsXG4gICAgICAgIFwiQ29udHJhYmFzc1wiLFxuICAgICAgICBcIlRyZW1vbG8gU3RyaW5nc1wiLFxuICAgICAgICBcIlBpenppY2F0byBTdHJpbmdzXCIsXG4gICAgICAgIFwiT3JjaGVzdHJhbCBIYXJwXCIsXG4gICAgICAgIFwiVGltcGFuaVwiLFxuICAgICAgICBcIlN0cmluZyBFbnNlbWJsZSAxXCIsXG4gICAgICAgIFwiU3RyaW5nIEVuc2VtYmxlIDJcIixcbiAgICAgICAgXCJTeW50aFN0cmluZ3MgMVwiLFxuICAgICAgICBcIlN5bnRoU3RyaW5ncyAyXCIsXG4gICAgICAgIFwiQ2hvaXIgQWFoc1wiLFxuICAgICAgICBcIlZvaWNlIE9vaHNcIixcbiAgICAgICAgXCJTeW50aCBWb2ljZVwiLFxuICAgICAgICBcIk9yY2hlc3RyYSBIaXRcIixcbiAgICAgICAgXCJUcnVtcGV0XCIsXG4gICAgICAgIFwiVHJvbWJvbmVcIixcbiAgICAgICAgXCJUdWJhXCIsXG4gICAgICAgIFwiTXV0ZWQgVHJ1bXBldFwiLFxuICAgICAgICBcIkZyZW5jaCBIb3JuXCIsXG4gICAgICAgIFwiQnJhc3MgU2VjdGlvblwiLFxuICAgICAgICBcIlN5bnRoQnJhc3MgMVwiLFxuICAgICAgICBcIlN5bnRoQnJhc3MgMlwiLFxuICAgICAgICBcIlNvcHJhbm8gU2F4XCIsXG4gICAgICAgIFwiQWx0byBTYXhcIixcbiAgICAgICAgXCJUZW5vciBTYXhcIixcbiAgICAgICAgXCJCYXJpdG9uZSBTYXhcIixcbiAgICAgICAgXCJPYm9lXCIsXG4gICAgICAgIFwiRW5nbGlzaCBIb3JuXCIsXG4gICAgICAgIFwiQmFzc29vblwiLFxuICAgICAgICBcIkNsYXJpbmV0XCIsXG4gICAgICAgIFwiUGljY29sb1wiLFxuICAgICAgICBcIkZsdXRlXCIsXG4gICAgICAgIFwiUmVjb3JkZXJcIixcbiAgICAgICAgXCJQYW4gRmx1dGVcIixcbiAgICAgICAgXCJCbG93biBCb3R0bGVcIixcbiAgICAgICAgXCJTaGFrdWhhY2hpXCIsXG4gICAgICAgIFwiV2hpc3RsZVwiLFxuICAgICAgICBcIk9jYXJpbmFcIixcbiAgICAgICAgXCJMZWFkIDEgKHNxdWFyZSlcIixcbiAgICAgICAgXCJMZWFkIDIgKHNhd3Rvb3RoKVwiLFxuICAgICAgICBcIkxlYWQgMyAoY2FsbGlvcGUpXCIsXG4gICAgICAgIFwiTGVhZCA0IChjaGlmZilcIixcbiAgICAgICAgXCJMZWFkIDUgKGNoYXJhbmcpXCIsXG4gICAgICAgIFwiTGVhZCA2ICh2b2ljZSlcIixcbiAgICAgICAgXCJMZWFkIDcgKGZpZnRocylcIixcbiAgICAgICAgXCJMZWFkIDggKGJhc3MgKyBsZWFkKVwiLFxuICAgICAgICBcIlBhZCAxIChuZXcgYWdlKVwiLFxuICAgICAgICBcIlBhZCAyICh3YXJtKVwiLFxuICAgICAgICBcIlBhZCAzIChwb2x5c3ludGgpXCIsXG4gICAgICAgIFwiUGFkIDQgKGNob2lyKVwiLFxuICAgICAgICBcIlBhZCA1IChib3dlZClcIixcbiAgICAgICAgXCJQYWQgNiAobWV0YWxsaWMpXCIsXG4gICAgICAgIFwiUGFkIDcgKGhhbG8pXCIsXG4gICAgICAgIFwiUGFkIDggKHN3ZWVwKVwiLFxuICAgICAgICBcIkZYIDEgKHJhaW4pXCIsXG4gICAgICAgIFwiRlggMiAoc291bmR0cmFjaylcIixcbiAgICAgICAgXCJGWCAzIChjcnlzdGFsKVwiLFxuICAgICAgICBcIkZYIDQgKGF0bW9zcGhlcmUpXCIsXG4gICAgICAgIFwiRlggNSAoYnJpZ2h0bmVzcylcIixcbiAgICAgICAgXCJGWCA2IChnb2JsaW5zKVwiLFxuICAgICAgICBcIkZYIDcgKGVjaG9lcylcIixcbiAgICAgICAgXCJGWCA4IChzY2ktZmkpXCIsXG4gICAgICAgIFwiU2l0YXJcIixcbiAgICAgICAgXCJCYW5qb1wiLFxuICAgICAgICBcIlNoYW1pc2VuXCIsXG4gICAgICAgIFwiS290b1wiLFxuICAgICAgICBcIkthbGltYmFcIixcbiAgICAgICAgXCJCYWcgcGlwZVwiLFxuICAgICAgICBcIkZpZGRsZVwiLFxuICAgICAgICBcIlNoYW5haVwiLFxuICAgICAgICBcIlRpbmtsZSBCZWxsXCIsXG4gICAgICAgIFwiQWdvZ29cIixcbiAgICAgICAgXCJTdGVlbCBEcnVtc1wiLFxuICAgICAgICBcIldvb2RibG9ja1wiLFxuICAgICAgICBcIlRhaWtvIERydW1cIixcbiAgICAgICAgXCJNZWxvZGljIFRvbVwiLFxuICAgICAgICBcIlN5bnRoIERydW1cIixcbiAgICAgICAgXCJSZXZlcnNlIEN5bWJhbFwiLFxuICAgICAgICBcIkd1aXRhciBGcmV0IE5vaXNlXCIsXG4gICAgICAgIFwiQnJlYXRoIE5vaXNlXCIsXG4gICAgICAgIFwiU2Vhc2hvcmVcIixcbiAgICAgICAgXCJCaXJkIFR3ZWV0XCIsXG4gICAgICAgIFwiVGVsZXBob25lIFJpbmdcIixcbiAgICAgICAgXCJIZWxpY29wdGVyXCIsXG4gICAgICAgIFwiQXBwbGF1c2VcIixcbiAgICAgICAgXCJHdW5zaG90XCIsXG4gICAgICAgIFwiUGVyY3Vzc2lvblwiXG4gICAgfTtcbiAgICAvKiBFbmQgSW5zdHJ1bWVudHMgKi9cblxuICAgIC8qKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBNaWRpIGV2ZW50ICovXG4gICAgcHJpdmF0ZSBzdHJpbmcgRXZlbnROYW1lKGludCBldikge1xuICAgICAgICBpZiAoZXYgPj0gRXZlbnROb3RlT2ZmICYmIGV2IDwgRXZlbnROb3RlT2ZmICsgMTYpXG4gICAgICAgICAgICByZXR1cm4gXCJOb3RlT2ZmXCI7XG4gICAgICAgIGVsc2UgaWYgKGV2ID49IEV2ZW50Tm90ZU9uICYmIGV2IDwgRXZlbnROb3RlT24gKyAxNikgXG4gICAgICAgICAgICByZXR1cm4gXCJOb3RlT25cIjtcbiAgICAgICAgZWxzZSBpZiAoZXYgPj0gRXZlbnRLZXlQcmVzc3VyZSAmJiBldiA8IEV2ZW50S2V5UHJlc3N1cmUgKyAxNikgXG4gICAgICAgICAgICByZXR1cm4gXCJLZXlQcmVzc3VyZVwiO1xuICAgICAgICBlbHNlIGlmIChldiA+PSBFdmVudENvbnRyb2xDaGFuZ2UgJiYgZXYgPCBFdmVudENvbnRyb2xDaGFuZ2UgKyAxNikgXG4gICAgICAgICAgICByZXR1cm4gXCJDb250cm9sQ2hhbmdlXCI7XG4gICAgICAgIGVsc2UgaWYgKGV2ID49IEV2ZW50UHJvZ3JhbUNoYW5nZSAmJiBldiA8IEV2ZW50UHJvZ3JhbUNoYW5nZSArIDE2KSBcbiAgICAgICAgICAgIHJldHVybiBcIlByb2dyYW1DaGFuZ2VcIjtcbiAgICAgICAgZWxzZSBpZiAoZXYgPj0gRXZlbnRDaGFubmVsUHJlc3N1cmUgJiYgZXYgPCBFdmVudENoYW5uZWxQcmVzc3VyZSArIDE2KVxuICAgICAgICAgICAgcmV0dXJuIFwiQ2hhbm5lbFByZXNzdXJlXCI7XG4gICAgICAgIGVsc2UgaWYgKGV2ID49IEV2ZW50UGl0Y2hCZW5kICYmIGV2IDwgRXZlbnRQaXRjaEJlbmQgKyAxNilcbiAgICAgICAgICAgIHJldHVybiBcIlBpdGNoQmVuZFwiO1xuICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnQpXG4gICAgICAgICAgICByZXR1cm4gXCJNZXRhRXZlbnRcIjtcbiAgICAgICAgZWxzZSBpZiAoZXYgPT0gU3lzZXhFdmVudDEgfHwgZXYgPT0gU3lzZXhFdmVudDIpXG4gICAgICAgICAgICByZXR1cm4gXCJTeXNleEV2ZW50XCI7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBcIlVua25vd25cIjtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWV0YS1ldmVudCAqL1xuICAgIHByaXZhdGUgc3RyaW5nIE1ldGFOYW1lKGludCBldikge1xuICAgICAgICBpZiAoZXYgPT0gTWV0YUV2ZW50U2VxdWVuY2UpXG4gICAgICAgICAgICByZXR1cm4gXCJNZXRhRXZlbnRTZXF1ZW5jZVwiO1xuICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRUZXh0KVxuICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50VGV4dFwiO1xuICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRDb3B5cmlnaHQpXG4gICAgICAgICAgICByZXR1cm4gXCJNZXRhRXZlbnRDb3B5cmlnaHRcIjtcbiAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50U2VxdWVuY2VOYW1lKVxuICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50U2VxdWVuY2VOYW1lXCI7XG4gICAgICAgIGVsc2UgaWYgKGV2ID09IE1ldGFFdmVudEluc3RydW1lbnQpXG4gICAgICAgICAgICByZXR1cm4gXCJNZXRhRXZlbnRJbnN0cnVtZW50XCI7XG4gICAgICAgIGVsc2UgaWYgKGV2ID09IE1ldGFFdmVudEx5cmljKVxuICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50THlyaWNcIjtcbiAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50TWFya2VyKVxuICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50TWFya2VyXCI7XG4gICAgICAgIGVsc2UgaWYgKGV2ID09IE1ldGFFdmVudEVuZE9mVHJhY2spXG4gICAgICAgICAgICByZXR1cm4gXCJNZXRhRXZlbnRFbmRPZlRyYWNrXCI7XG4gICAgICAgIGVsc2UgaWYgKGV2ID09IE1ldGFFdmVudFRlbXBvKVxuICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50VGVtcG9cIjtcbiAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50U01QVEVPZmZzZXQpXG4gICAgICAgICAgICByZXR1cm4gXCJNZXRhRXZlbnRTTVBURU9mZnNldFwiO1xuICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRUaW1lU2lnbmF0dXJlKVxuICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50VGltZVNpZ25hdHVyZVwiO1xuICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRLZXlTaWduYXR1cmUpXG4gICAgICAgICAgICByZXR1cm4gXCJNZXRhRXZlbnRLZXlTaWduYXR1cmVcIjtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIFwiVW5rbm93blwiO1xuICAgIH1cblxuXG4gICAgLyoqIEdldCB0aGUgbGlzdCBvZiB0cmFja3MgKi9cbiAgICBwdWJsaWMgTGlzdDxNaWRpVHJhY2s+IFRyYWNrcyB7XG4gICAgICAgIGdldCB7IHJldHVybiB0cmFja3M7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSB0aW1lIHNpZ25hdHVyZSAqL1xuICAgIHB1YmxpYyBUaW1lU2lnbmF0dXJlIFRpbWUge1xuICAgICAgICBnZXQgeyByZXR1cm4gdGltZXNpZzsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIGZpbGUgbmFtZSAqL1xuICAgIHB1YmxpYyBzdHJpbmcgRmlsZU5hbWUge1xuICAgICAgICBnZXQgeyByZXR1cm4gZmlsZW5hbWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSB0b3RhbCBsZW5ndGggKGluIHB1bHNlcykgb2YgdGhlIHNvbmcgKi9cbiAgICBwdWJsaWMgaW50IFRvdGFsUHVsc2VzIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHRvdGFscHVsc2VzOyB9XG4gICAgfVxuXG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IE1pZGlGaWxlIGZyb20gdGhlIGZpbGUuICovXG4gICAgLy9wdWJsaWMgTWlkaUZpbGUoc3RyaW5nIGZpbGVuYW1lKSB7XG4gICAgLy8gICAgTWlkaUZpbGVSZWFkZXIgZmlsZSA9IG5ldyBNaWRpRmlsZVJlYWRlcihmaWxlbmFtZSk7XG4gICAgLy8gICAgcGFyc2UoZmlsZSwgZmlsZW5hbWUpO1xuICAgIC8vfVxuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBNaWRpRmlsZSBmcm9tIHRoZSBieXRlW10uICovXG4gICAgcHVibGljIE1pZGlGaWxlKGJ5dGVbXSBkYXRhLCBzdHJpbmcgdGl0bGUpIHtcbiAgICAgICAgTWlkaUZpbGVSZWFkZXIgZmlsZSA9IG5ldyBNaWRpRmlsZVJlYWRlcihkYXRhKTtcbiAgICAgICAgaWYgKHRpdGxlID09IG51bGwpXG4gICAgICAgICAgICB0aXRsZSA9IFwiXCI7XG4gICAgICAgIHBhcnNlKGZpbGUsIHRpdGxlKTtcbiAgICB9XG5cbiAgICAvKiogUGFyc2UgdGhlIGdpdmVuIE1pZGkgZmlsZSwgYW5kIHJldHVybiBhbiBpbnN0YW5jZSBvZiB0aGlzIE1pZGlGaWxlXG4gICAgICogY2xhc3MuICBBZnRlciByZWFkaW5nIHRoZSBtaWRpIGZpbGUsIHRoaXMgb2JqZWN0IHdpbGwgY29udGFpbjpcbiAgICAgKiAtIFRoZSByYXcgbGlzdCBvZiBtaWRpIGV2ZW50c1xuICAgICAqIC0gVGhlIFRpbWUgU2lnbmF0dXJlIG9mIHRoZSBzb25nXG4gICAgICogLSBBbGwgdGhlIHRyYWNrcyBpbiB0aGUgc29uZyB3aGljaCBjb250YWluIG5vdGVzLiBcbiAgICAgKiAtIFRoZSBudW1iZXIsIHN0YXJ0dGltZSwgYW5kIGR1cmF0aW9uIG9mIGVhY2ggbm90ZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBwYXJzZShNaWRpRmlsZVJlYWRlciBmaWxlLCBzdHJpbmcgZmlsZW5hbWUpIHtcbiAgICAgICAgc3RyaW5nIGlkO1xuICAgICAgICBpbnQgbGVuO1xuXG4gICAgICAgIHRoaXMuZmlsZW5hbWUgPSBmaWxlbmFtZTtcbiAgICAgICAgdHJhY2tzID0gbmV3IExpc3Q8TWlkaVRyYWNrPigpO1xuICAgICAgICB0cmFja1BlckNoYW5uZWwgPSBmYWxzZTtcblxuICAgICAgICBpZCA9IGZpbGUuUmVhZEFzY2lpKDQpO1xuICAgICAgICBpZiAoaWQgIT0gXCJNVGhkXCIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBNaWRpRmlsZUV4Y2VwdGlvbihcIkRvZXNuJ3Qgc3RhcnQgd2l0aCBNVGhkXCIsIDApO1xuICAgICAgICB9XG4gICAgICAgIGxlbiA9IGZpbGUuUmVhZEludCgpOyBcbiAgICAgICAgaWYgKGxlbiAhPSAgNikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IE1pZGlGaWxlRXhjZXB0aW9uKFwiQmFkIE1UaGQgaGVhZGVyXCIsIDQpO1xuICAgICAgICB9XG4gICAgICAgIHRyYWNrbW9kZSA9IGZpbGUuUmVhZFNob3J0KCk7XG4gICAgICAgIGludCBudW1fdHJhY2tzID0gZmlsZS5SZWFkU2hvcnQoKTtcbiAgICAgICAgcXVhcnRlcm5vdGUgPSBmaWxlLlJlYWRTaG9ydCgpOyBcblxuICAgICAgICBldmVudHMgPSBuZXcgTGlzdDxNaWRpRXZlbnQ+W251bV90cmFja3NdO1xuICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgbnVtX3RyYWNrczsgdHJhY2tudW0rKykge1xuICAgICAgICAgICAgZXZlbnRzW3RyYWNrbnVtXSA9IFJlYWRUcmFjayhmaWxlKTtcbiAgICAgICAgICAgIE1pZGlUcmFjayB0cmFjayA9IG5ldyBNaWRpVHJhY2soZXZlbnRzW3RyYWNrbnVtXSwgdHJhY2tudW0pO1xuICAgICAgICAgICAgaWYgKHRyYWNrLk5vdGVzLkNvdW50ID4gMCB8fCB0cmFjay5MeXJpY3MgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRyYWNrcy5BZGQodHJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyogR2V0IHRoZSBsZW5ndGggb2YgdGhlIHNvbmcgaW4gcHVsc2VzICovXG4gICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpIHtcbiAgICAgICAgICAgIE1pZGlOb3RlIGxhc3QgPSB0cmFjay5Ob3Rlc1t0cmFjay5Ob3Rlcy5Db3VudC0xXTtcbiAgICAgICAgICAgIGlmICh0aGlzLnRvdGFscHVsc2VzIDwgbGFzdC5TdGFydFRpbWUgKyBsYXN0LkR1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50b3RhbHB1bHNlcyA9IGxhc3QuU3RhcnRUaW1lICsgbGFzdC5EdXJhdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIElmIHdlIG9ubHkgaGF2ZSBvbmUgdHJhY2sgd2l0aCBtdWx0aXBsZSBjaGFubmVscywgdGhlbiB0cmVhdFxuICAgICAgICAgKiBlYWNoIGNoYW5uZWwgYXMgYSBzZXBhcmF0ZSB0cmFjay5cbiAgICAgICAgICovXG4gICAgICAgIGlmICh0cmFja3MuQ291bnQgPT0gMSAmJiBIYXNNdWx0aXBsZUNoYW5uZWxzKHRyYWNrc1swXSkpIHtcbiAgICAgICAgICAgIHRyYWNrcyA9IFNwbGl0Q2hhbm5lbHModHJhY2tzWzBdLCBldmVudHNbdHJhY2tzWzBdLk51bWJlcl0pO1xuICAgICAgICAgICAgdHJhY2tQZXJDaGFubmVsID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIENoZWNrU3RhcnRUaW1lcyh0cmFja3MpO1xuXG4gICAgICAgIC8qIERldGVybWluZSB0aGUgdGltZSBzaWduYXR1cmUgKi9cbiAgICAgICAgaW50IHRlbXBvID0gMDtcbiAgICAgICAgaW50IG51bWVyID0gMDtcbiAgICAgICAgaW50IGRlbm9tID0gMDtcbiAgICAgICAgZm9yZWFjaCAoTGlzdDxNaWRpRXZlbnQ+IGxpc3QgaW4gZXZlbnRzKSB7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbWV2ZW50IGluIGxpc3QpIHtcbiAgICAgICAgICAgICAgICBpZiAobWV2ZW50Lk1ldGFldmVudCA9PSBNZXRhRXZlbnRUZW1wbyAmJiB0ZW1wbyA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBvID0gbWV2ZW50LlRlbXBvO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobWV2ZW50Lk1ldGFldmVudCA9PSBNZXRhRXZlbnRUaW1lU2lnbmF0dXJlICYmIG51bWVyID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbnVtZXIgPSBtZXZlbnQuTnVtZXJhdG9yO1xuICAgICAgICAgICAgICAgICAgICBkZW5vbSA9IG1ldmVudC5EZW5vbWluYXRvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRlbXBvID09IDApIHtcbiAgICAgICAgICAgIHRlbXBvID0gNTAwMDAwOyAvKiA1MDAsMDAwIG1pY3Jvc2Vjb25kcyA9IDAuMDUgc2VjICovXG4gICAgICAgIH1cbiAgICAgICAgaWYgKG51bWVyID09IDApIHtcbiAgICAgICAgICAgIG51bWVyID0gNDsgZGVub20gPSA0O1xuICAgICAgICB9XG4gICAgICAgIHRpbWVzaWcgPSBuZXcgVGltZVNpZ25hdHVyZShudW1lciwgZGVub20sIHF1YXJ0ZXJub3RlLCB0ZW1wbyk7XG4gICAgfVxuXG4gICAgLyoqIFBhcnNlIGEgc2luZ2xlIE1pZGkgdHJhY2sgaW50byBhIGxpc3Qgb2YgTWlkaUV2ZW50cy5cbiAgICAgKiBFbnRlcmluZyB0aGlzIGZ1bmN0aW9uLCB0aGUgZmlsZSBvZmZzZXQgc2hvdWxkIGJlIGF0IHRoZSBzdGFydCBvZlxuICAgICAqIHRoZSBNVHJrIGhlYWRlci4gIFVwb24gZXhpdGluZywgdGhlIGZpbGUgb2Zmc2V0IHNob3VsZCBiZSBhdCB0aGVcbiAgICAgKiBzdGFydCBvZiB0aGUgbmV4dCBNVHJrIGhlYWRlci5cbiAgICAgKi9cbiAgICBwcml2YXRlIExpc3Q8TWlkaUV2ZW50PiBSZWFkVHJhY2soTWlkaUZpbGVSZWFkZXIgZmlsZSkge1xuICAgICAgICBMaXN0PE1pZGlFdmVudD4gcmVzdWx0ID0gbmV3IExpc3Q8TWlkaUV2ZW50PigyMCk7XG4gICAgICAgIGludCBzdGFydHRpbWUgPSAwO1xuICAgICAgICBzdHJpbmcgaWQgPSBmaWxlLlJlYWRBc2NpaSg0KTtcblxuICAgICAgICBpZiAoaWQgIT0gXCJNVHJrXCIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBNaWRpRmlsZUV4Y2VwdGlvbihcIkJhZCBNVHJrIGhlYWRlclwiLCBmaWxlLkdldE9mZnNldCgpIC0gNCk7XG4gICAgICAgIH1cbiAgICAgICAgaW50IHRyYWNrbGVuID0gZmlsZS5SZWFkSW50KCk7XG4gICAgICAgIGludCB0cmFja2VuZCA9IHRyYWNrbGVuICsgZmlsZS5HZXRPZmZzZXQoKTtcblxuICAgICAgICBpbnQgZXZlbnRmbGFnID0gMDtcblxuICAgICAgICB3aGlsZSAoZmlsZS5HZXRPZmZzZXQoKSA8IHRyYWNrZW5kKSB7XG5cbiAgICAgICAgICAgIC8vIElmIHRoZSBtaWRpIGZpbGUgaXMgdHJ1bmNhdGVkIGhlcmUsIHdlIGNhbiBzdGlsbCByZWNvdmVyLlxuICAgICAgICAgICAgLy8gSnVzdCByZXR1cm4gd2hhdCB3ZSd2ZSBwYXJzZWQgc28gZmFyLlxuXG4gICAgICAgICAgICBpbnQgc3RhcnRvZmZzZXQsIGRlbHRhdGltZTtcbiAgICAgICAgICAgIGJ5dGUgcGVla2V2ZW50O1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBzdGFydG9mZnNldCA9IGZpbGUuR2V0T2Zmc2V0KCk7XG4gICAgICAgICAgICAgICAgZGVsdGF0aW1lID0gZmlsZS5SZWFkVmFybGVuKCk7XG4gICAgICAgICAgICAgICAgc3RhcnR0aW1lICs9IGRlbHRhdGltZTtcbiAgICAgICAgICAgICAgICBwZWVrZXZlbnQgPSBmaWxlLlBlZWsoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChNaWRpRmlsZUV4Y2VwdGlvbiBlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgTWlkaUV2ZW50IG1ldmVudCA9IG5ldyBNaWRpRXZlbnQoKTtcbiAgICAgICAgICAgIHJlc3VsdC5BZGQobWV2ZW50KTtcbiAgICAgICAgICAgIG1ldmVudC5EZWx0YVRpbWUgPSBkZWx0YXRpbWU7XG4gICAgICAgICAgICBtZXZlbnQuU3RhcnRUaW1lID0gc3RhcnR0aW1lO1xuXG4gICAgICAgICAgICBpZiAocGVla2V2ZW50ID49IEV2ZW50Tm90ZU9mZikgeyBcbiAgICAgICAgICAgICAgICBtZXZlbnQuSGFzRXZlbnRmbGFnID0gdHJ1ZTsgXG4gICAgICAgICAgICAgICAgZXZlbnRmbGFnID0gZmlsZS5SZWFkQnl0ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDb25zb2xlLldyaXRlTGluZShcIm9mZnNldCB7MH06IGV2ZW50IHsxfSB7Mn0gc3RhcnQgezN9IGRlbHRhIHs0fVwiLCBcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgIHN0YXJ0b2Zmc2V0LCBldmVudGZsYWcsIEV2ZW50TmFtZShldmVudGZsYWcpLCBcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgIHN0YXJ0dGltZSwgbWV2ZW50LkRlbHRhVGltZSk7XG5cbiAgICAgICAgICAgIGlmIChldmVudGZsYWcgPj0gRXZlbnROb3RlT24gJiYgZXZlbnRmbGFnIDwgRXZlbnROb3RlT24gKyAxNikge1xuICAgICAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPSBFdmVudE5vdGVPbjtcbiAgICAgICAgICAgICAgICBtZXZlbnQuQ2hhbm5lbCA9IChieXRlKShldmVudGZsYWcgLSBFdmVudE5vdGVPbik7XG4gICAgICAgICAgICAgICAgbWV2ZW50Lk5vdGVudW1iZXIgPSBmaWxlLlJlYWRCeXRlKCk7XG4gICAgICAgICAgICAgICAgbWV2ZW50LlZlbG9jaXR5ID0gZmlsZS5SZWFkQnl0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZXZlbnRmbGFnID49IEV2ZW50Tm90ZU9mZiAmJiBldmVudGZsYWcgPCBFdmVudE5vdGVPZmYgKyAxNikge1xuICAgICAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPSBFdmVudE5vdGVPZmY7XG4gICAgICAgICAgICAgICAgbWV2ZW50LkNoYW5uZWwgPSAoYnl0ZSkoZXZlbnRmbGFnIC0gRXZlbnROb3RlT2ZmKTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuTm90ZW51bWJlciA9IGZpbGUuUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuVmVsb2NpdHkgPSBmaWxlLlJlYWRCeXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChldmVudGZsYWcgPj0gRXZlbnRLZXlQcmVzc3VyZSAmJiBcbiAgICAgICAgICAgICAgICAgICAgIGV2ZW50ZmxhZyA8IEV2ZW50S2V5UHJlc3N1cmUgKyAxNikge1xuICAgICAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPSBFdmVudEtleVByZXNzdXJlO1xuICAgICAgICAgICAgICAgIG1ldmVudC5DaGFubmVsID0gKGJ5dGUpKGV2ZW50ZmxhZyAtIEV2ZW50S2V5UHJlc3N1cmUpO1xuICAgICAgICAgICAgICAgIG1ldmVudC5Ob3RlbnVtYmVyID0gZmlsZS5SZWFkQnl0ZSgpO1xuICAgICAgICAgICAgICAgIG1ldmVudC5LZXlQcmVzc3VyZSA9IGZpbGUuUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ZW50ZmxhZyA+PSBFdmVudENvbnRyb2xDaGFuZ2UgJiYgXG4gICAgICAgICAgICAgICAgICAgICBldmVudGZsYWcgPCBFdmVudENvbnRyb2xDaGFuZ2UgKyAxNikge1xuICAgICAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPSBFdmVudENvbnRyb2xDaGFuZ2U7XG4gICAgICAgICAgICAgICAgbWV2ZW50LkNoYW5uZWwgPSAoYnl0ZSkoZXZlbnRmbGFnIC0gRXZlbnRDb250cm9sQ2hhbmdlKTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuQ29udHJvbE51bSA9IGZpbGUuUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuQ29udHJvbFZhbHVlID0gZmlsZS5SZWFkQnl0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZXZlbnRmbGFnID49IEV2ZW50UHJvZ3JhbUNoYW5nZSAmJiBcbiAgICAgICAgICAgICAgICAgICAgIGV2ZW50ZmxhZyA8IEV2ZW50UHJvZ3JhbUNoYW5nZSArIDE2KSB7XG4gICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IEV2ZW50UHJvZ3JhbUNoYW5nZTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuQ2hhbm5lbCA9IChieXRlKShldmVudGZsYWcgLSBFdmVudFByb2dyYW1DaGFuZ2UpO1xuICAgICAgICAgICAgICAgIG1ldmVudC5JbnN0cnVtZW50ID0gZmlsZS5SZWFkQnl0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZXZlbnRmbGFnID49IEV2ZW50Q2hhbm5lbFByZXNzdXJlICYmIFxuICAgICAgICAgICAgICAgICAgICAgZXZlbnRmbGFnIDwgRXZlbnRDaGFubmVsUHJlc3N1cmUgKyAxNikge1xuICAgICAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPSBFdmVudENoYW5uZWxQcmVzc3VyZTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuQ2hhbm5lbCA9IChieXRlKShldmVudGZsYWcgLSBFdmVudENoYW5uZWxQcmVzc3VyZSk7XG4gICAgICAgICAgICAgICAgbWV2ZW50LkNoYW5QcmVzc3VyZSA9IGZpbGUuUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ZW50ZmxhZyA+PSBFdmVudFBpdGNoQmVuZCAmJiBcbiAgICAgICAgICAgICAgICAgICAgIGV2ZW50ZmxhZyA8IEV2ZW50UGl0Y2hCZW5kICsgMTYpIHtcbiAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gRXZlbnRQaXRjaEJlbmQ7XG4gICAgICAgICAgICAgICAgbWV2ZW50LkNoYW5uZWwgPSAoYnl0ZSkoZXZlbnRmbGFnIC0gRXZlbnRQaXRjaEJlbmQpO1xuICAgICAgICAgICAgICAgIG1ldmVudC5QaXRjaEJlbmQgPSBmaWxlLlJlYWRTaG9ydCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZXZlbnRmbGFnID09IFN5c2V4RXZlbnQxKSB7XG4gICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IFN5c2V4RXZlbnQxO1xuICAgICAgICAgICAgICAgIG1ldmVudC5NZXRhbGVuZ3RoID0gZmlsZS5SZWFkVmFybGVuKCk7XG4gICAgICAgICAgICAgICAgbWV2ZW50LlZhbHVlID0gZmlsZS5SZWFkQnl0ZXMobWV2ZW50Lk1ldGFsZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZXZlbnRmbGFnID09IFN5c2V4RXZlbnQyKSB7XG4gICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IFN5c2V4RXZlbnQyO1xuICAgICAgICAgICAgICAgIG1ldmVudC5NZXRhbGVuZ3RoID0gZmlsZS5SZWFkVmFybGVuKCk7XG4gICAgICAgICAgICAgICAgbWV2ZW50LlZhbHVlID0gZmlsZS5SZWFkQnl0ZXMobWV2ZW50Lk1ldGFsZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZXZlbnRmbGFnID09IE1ldGFFdmVudCkge1xuICAgICAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPSBNZXRhRXZlbnQ7XG4gICAgICAgICAgICAgICAgbWV2ZW50Lk1ldGFldmVudCA9IGZpbGUuUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuTWV0YWxlbmd0aCA9IGZpbGUuUmVhZFZhcmxlbigpO1xuICAgICAgICAgICAgICAgIG1ldmVudC5WYWx1ZSA9IGZpbGUuUmVhZEJ5dGVzKG1ldmVudC5NZXRhbGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBpZiAobWV2ZW50Lk1ldGFldmVudCA9PSBNZXRhRXZlbnRUaW1lU2lnbmF0dXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXZlbnQuTWV0YWxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRocm93IG5ldyBNaWRpRmlsZUV4Y2VwdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICBcIk1ldGEgRXZlbnQgVGltZSBTaWduYXR1cmUgbGVuID09IFwiICsgbWV2ZW50Lk1ldGFsZW5ndGggICsgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgXCIgIT0gNFwiLCBmaWxlLkdldE9mZnNldCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5OdW1lcmF0b3IgPSAoYnl0ZSkwO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkRlbm9taW5hdG9yID0gKGJ5dGUpNDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuTWV0YWxlbmd0aCA+PSAyICYmIG1ldmVudC5NZXRhbGVuZ3RoIDwgNCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50Lk51bWVyYXRvciA9IChieXRlKW1ldmVudC5WYWx1ZVswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5EZW5vbWluYXRvciA9IChieXRlKVN5c3RlbS5NYXRoLlBvdygyLCBtZXZlbnQuVmFsdWVbMV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50Lk51bWVyYXRvciA9IChieXRlKW1ldmVudC5WYWx1ZVswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5EZW5vbWluYXRvciA9IChieXRlKVN5c3RlbS5NYXRoLlBvdygyLCBtZXZlbnQuVmFsdWVbMV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5NZXRhZXZlbnQgPT0gTWV0YUV2ZW50VGVtcG8pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1ldmVudC5NZXRhbGVuZ3RoICE9IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBNaWRpRmlsZUV4Y2VwdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJNZXRhIEV2ZW50IFRlbXBvIGxlbiA9PSBcIiArIG1ldmVudC5NZXRhbGVuZ3RoICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgIT0gM1wiLCBmaWxlLkdldE9mZnNldCgpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuVGVtcG8gPSAoIChtZXZlbnQuVmFsdWVbMF0gPDwgMTYpIHwgKG1ldmVudC5WYWx1ZVsxXSA8PCA4KSB8IG1ldmVudC5WYWx1ZVsyXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5NZXRhZXZlbnQgPT0gTWV0YUV2ZW50RW5kT2ZUcmFjaykge1xuICAgICAgICAgICAgICAgICAgICAvKiBicmVhazsgICovXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1pZGlGaWxlRXhjZXB0aW9uKFwiVW5rbm93biBldmVudCBcIiArIG1ldmVudC5FdmVudEZsYWcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLkdldE9mZnNldCgpLTEpOyBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0cnVlIGlmIHRoaXMgdHJhY2sgY29udGFpbnMgbXVsdGlwbGUgY2hhbm5lbHMuXG4gICAgICogSWYgYSBNaWRpRmlsZSBjb250YWlucyBvbmx5IG9uZSB0cmFjaywgYW5kIGl0IGhhcyBtdWx0aXBsZSBjaGFubmVscyxcbiAgICAgKiB0aGVuIHdlIHRyZWF0IGVhY2ggY2hhbm5lbCBhcyBhIHNlcGFyYXRlIHRyYWNrLlxuICAgICAqL1xuICAgIHN0YXRpYyBib29sIEhhc011bHRpcGxlQ2hhbm5lbHMoTWlkaVRyYWNrIHRyYWNrKSB7XG4gICAgICAgIGludCBjaGFubmVsID0gdHJhY2suTm90ZXNbMF0uQ2hhbm5lbDtcbiAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiB0cmFjay5Ob3Rlcykge1xuICAgICAgICAgICAgaWYgKG5vdGUuQ2hhbm5lbCAhPSBjaGFubmVsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKiBXcml0ZSBhIHZhcmlhYmxlIGxlbmd0aCBudW1iZXIgdG8gdGhlIGJ1ZmZlciBhdCB0aGUgZ2l2ZW4gb2Zmc2V0LlxuICAgICAqIFJldHVybiB0aGUgbnVtYmVyIG9mIGJ5dGVzIHdyaXR0ZW4uXG4gICAgICovXG4gICAgc3RhdGljIGludCBWYXJsZW5Ub0J5dGVzKGludCBudW0sIGJ5dGVbXSBidWYsIGludCBvZmZzZXQpIHtcbiAgICAgICAgYnl0ZSBiMSA9IChieXRlKSAoKG51bSA+PiAyMSkgJiAweDdGKTtcbiAgICAgICAgYnl0ZSBiMiA9IChieXRlKSAoKG51bSA+PiAxNCkgJiAweDdGKTtcbiAgICAgICAgYnl0ZSBiMyA9IChieXRlKSAoKG51bSA+PiAgNykgJiAweDdGKTtcbiAgICAgICAgYnl0ZSBiNCA9IChieXRlKSAobnVtICYgMHg3Rik7XG5cbiAgICAgICAgaWYgKGIxID4gMCkge1xuICAgICAgICAgICAgYnVmW29mZnNldF0gICA9IChieXRlKShiMSB8IDB4ODApO1xuICAgICAgICAgICAgYnVmW29mZnNldCsxXSA9IChieXRlKShiMiB8IDB4ODApO1xuICAgICAgICAgICAgYnVmW29mZnNldCsyXSA9IChieXRlKShiMyB8IDB4ODApO1xuICAgICAgICAgICAgYnVmW29mZnNldCszXSA9IGI0O1xuICAgICAgICAgICAgcmV0dXJuIDQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYjIgPiAwKSB7XG4gICAgICAgICAgICBidWZbb2Zmc2V0XSAgID0gKGJ5dGUpKGIyIHwgMHg4MCk7XG4gICAgICAgICAgICBidWZbb2Zmc2V0KzFdID0gKGJ5dGUpKGIzIHwgMHg4MCk7XG4gICAgICAgICAgICBidWZbb2Zmc2V0KzJdID0gYjQ7XG4gICAgICAgICAgICByZXR1cm4gMztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChiMyA+IDApIHtcbiAgICAgICAgICAgIGJ1ZltvZmZzZXRdICAgPSAoYnl0ZSkoYjMgfCAweDgwKTtcbiAgICAgICAgICAgIGJ1ZltvZmZzZXQrMV0gPSBiNDtcbiAgICAgICAgICAgIHJldHVybiAyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYnVmW29mZnNldF0gPSBiNDtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFdyaXRlIGEgNC1ieXRlIGludGVnZXIgdG8gZGF0YVtvZmZzZXQgOiBvZmZzZXQrNF0gKi9cbiAgICBwcml2YXRlIHN0YXRpYyB2b2lkIEludFRvQnl0ZXMoaW50IHZhbHVlLCBieXRlW10gZGF0YSwgaW50IG9mZnNldCkge1xuICAgICAgICBkYXRhW29mZnNldF0gPSAoYnl0ZSkoICh2YWx1ZSA+PiAyNCkgJiAweEZGICk7XG4gICAgICAgIGRhdGFbb2Zmc2V0KzFdID0gKGJ5dGUpKCAodmFsdWUgPj4gMTYpICYgMHhGRiApO1xuICAgICAgICBkYXRhW29mZnNldCsyXSA9IChieXRlKSggKHZhbHVlID4+IDgpICYgMHhGRiApO1xuICAgICAgICBkYXRhW29mZnNldCszXSA9IChieXRlKSggdmFsdWUgJiAweEZGICk7XG4gICAgfVxuXG4gICAgLyoqIENhbGN1bGF0ZSB0aGUgdHJhY2sgbGVuZ3RoIChpbiBieXRlcykgZ2l2ZW4gYSBsaXN0IG9mIE1pZGkgZXZlbnRzICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50IEdldFRyYWNrTGVuZ3RoKExpc3Q8TWlkaUV2ZW50PiBldmVudHMpIHtcbiAgICAgICAgaW50IGxlbiA9IDA7XG4gICAgICAgIGJ5dGVbXSBidWYgPSBuZXcgYnl0ZVsxMDI0XTtcbiAgICAgICAgZm9yZWFjaCAoTWlkaUV2ZW50IG1ldmVudCBpbiBldmVudHMpIHtcbiAgICAgICAgICAgIGxlbiArPSBWYXJsZW5Ub0J5dGVzKG1ldmVudC5EZWx0YVRpbWUsIGJ1ZiwgMCk7XG4gICAgICAgICAgICBsZW4gKz0gMTsgIC8qIGZvciBldmVudGZsYWcgKi9cbiAgICAgICAgICAgIHN3aXRjaCAobWV2ZW50LkV2ZW50RmxhZykge1xuICAgICAgICAgICAgICAgIGNhc2UgRXZlbnROb3RlT246IGxlbiArPSAyOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIEV2ZW50Tm90ZU9mZjogbGVuICs9IDI7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgRXZlbnRLZXlQcmVzc3VyZTogbGVuICs9IDI7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgRXZlbnRDb250cm9sQ2hhbmdlOiBsZW4gKz0gMjsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBFdmVudFByb2dyYW1DaGFuZ2U6IGxlbiArPSAxOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIEV2ZW50Q2hhbm5lbFByZXNzdXJlOiBsZW4gKz0gMTsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBFdmVudFBpdGNoQmVuZDogbGVuICs9IDI7IGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSBTeXNleEV2ZW50MTogXG4gICAgICAgICAgICAgICAgY2FzZSBTeXNleEV2ZW50MjpcbiAgICAgICAgICAgICAgICAgICAgbGVuICs9IFZhcmxlblRvQnl0ZXMobWV2ZW50Lk1ldGFsZW5ndGgsIGJ1ZiwgMCk7IFxuICAgICAgICAgICAgICAgICAgICBsZW4gKz0gbWV2ZW50Lk1ldGFsZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgTWV0YUV2ZW50OiBcbiAgICAgICAgICAgICAgICAgICAgbGVuICs9IDE7IFxuICAgICAgICAgICAgICAgICAgICBsZW4gKz0gVmFybGVuVG9CeXRlcyhtZXZlbnQuTWV0YWxlbmd0aCwgYnVmLCAwKTsgXG4gICAgICAgICAgICAgICAgICAgIGxlbiArPSBtZXZlbnQuTWV0YWxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDogYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxlbjtcbiAgICB9XG4gICAgICAgICAgICBcblxuICAgIC8qKiBXcml0ZSB0aGUgZ2l2ZW4gbGlzdCBvZiBNaWRpIGV2ZW50cyB0byBhIHN0cmVhbS9maWxlLlxuICAgICAqICBUaGlzIG1ldGhvZCBpcyB1c2VkIGZvciBzb3VuZCBwbGF5YmFjaywgZm9yIGNyZWF0aW5nIG5ldyBNaWRpIGZpbGVzXG4gICAgICogIHdpdGggdGhlIHRlbXBvLCB0cmFuc3Bvc2UsIGV0YyBjaGFuZ2VkLlxuICAgICAqXG4gICAgICogIFJldHVybiB0cnVlIG9uIHN1Y2Nlc3MsIGFuZCBmYWxzZSBvbiBlcnJvci5cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBib29sIFxuICAgIFdyaXRlRXZlbnRzKFN0cmVhbSBmaWxlLCBMaXN0PE1pZGlFdmVudD5bXSBldmVudHMsIGludCB0cmFja21vZGUsIGludCBxdWFydGVyKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBieXRlW10gYnVmID0gbmV3IGJ5dGVbNjU1MzZdO1xuXG4gICAgICAgICAgICAvKiBXcml0ZSB0aGUgTVRoZCwgbGVuID0gNiwgdHJhY2sgbW9kZSwgbnVtYmVyIHRyYWNrcywgcXVhcnRlciBub3RlICovXG4gICAgICAgICAgICBmaWxlLldyaXRlKEFTQ0lJRW5jb2RpbmcuQVNDSUkuR2V0Qnl0ZXMoXCJNVGhkXCIpLCAwLCA0KTtcbiAgICAgICAgICAgIEludFRvQnl0ZXMoNiwgYnVmLCAwKTtcbiAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCA0KTtcbiAgICAgICAgICAgIGJ1ZlswXSA9IChieXRlKSh0cmFja21vZGUgPj4gOCk7IFxuICAgICAgICAgICAgYnVmWzFdID0gKGJ5dGUpKHRyYWNrbW9kZSAmIDB4RkYpO1xuICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDIpO1xuICAgICAgICAgICAgYnVmWzBdID0gMDsgXG4gICAgICAgICAgICBidWZbMV0gPSAoYnl0ZSlldmVudHMuTGVuZ3RoO1xuICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDIpO1xuICAgICAgICAgICAgYnVmWzBdID0gKGJ5dGUpKHF1YXJ0ZXIgPj4gOCk7IFxuICAgICAgICAgICAgYnVmWzFdID0gKGJ5dGUpKHF1YXJ0ZXIgJiAweEZGKTtcbiAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCAyKTtcblxuICAgICAgICAgICAgZm9yZWFjaCAoTGlzdDxNaWRpRXZlbnQ+IGxpc3QgaW4gZXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgLyogV3JpdGUgdGhlIE1UcmsgaGVhZGVyIGFuZCB0cmFjayBsZW5ndGggKi9cbiAgICAgICAgICAgICAgICBmaWxlLldyaXRlKEFTQ0lJRW5jb2RpbmcuQVNDSUkuR2V0Qnl0ZXMoXCJNVHJrXCIpLCAwLCA0KTtcbiAgICAgICAgICAgICAgICBpbnQgbGVuID0gR2V0VHJhY2tMZW5ndGgobGlzdCk7XG4gICAgICAgICAgICAgICAgSW50VG9CeXRlcyhsZW4sIGJ1ZiwgMCk7XG4gICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDQpO1xuXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTWlkaUV2ZW50IG1ldmVudCBpbiBsaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGludCB2YXJsZW4gPSBWYXJsZW5Ub0J5dGVzKG1ldmVudC5EZWx0YVRpbWUsIGJ1ZiwgMCk7XG4gICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCB2YXJsZW4pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IFN5c2V4RXZlbnQxIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID09IFN5c2V4RXZlbnQyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID09IE1ldGFFdmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gbWV2ZW50LkV2ZW50RmxhZztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IChieXRlKShtZXZlbnQuRXZlbnRGbGFnICsgbWV2ZW50LkNoYW5uZWwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCAxKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudE5vdGVPbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gbWV2ZW50Lk5vdGVudW1iZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbMV0gPSBtZXZlbnQuVmVsb2NpdHk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgMik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudE5vdGVPZmYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IG1ldmVudC5Ob3RlbnVtYmVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzFdID0gbWV2ZW50LlZlbG9jaXR5O1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnRLZXlQcmVzc3VyZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gbWV2ZW50Lk5vdGVudW1iZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbMV0gPSBtZXZlbnQuS2V5UHJlc3N1cmU7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgMik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudENvbnRyb2xDaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IG1ldmVudC5Db250cm9sTnVtO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzFdID0gbWV2ZW50LkNvbnRyb2xWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IEV2ZW50UHJvZ3JhbUNoYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gbWV2ZW50Lkluc3RydW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudENoYW5uZWxQcmVzc3VyZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gbWV2ZW50LkNoYW5QcmVzc3VyZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IEV2ZW50UGl0Y2hCZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbMF0gPSAoYnl0ZSkobWV2ZW50LlBpdGNoQmVuZCA+PiA4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlsxXSA9IChieXRlKShtZXZlbnQuUGl0Y2hCZW5kICYgMHhGRik7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgMik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBTeXNleEV2ZW50MSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50IG9mZnNldCA9IFZhcmxlblRvQnl0ZXMobWV2ZW50Lk1ldGFsZW5ndGgsIGJ1ZiwgMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBBcnJheS5Db3B5KG1ldmVudC5WYWx1ZSwgMCwgYnVmLCBvZmZzZXQsIG1ldmVudC5WYWx1ZS5MZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIG9mZnNldCArIG1ldmVudC5WYWx1ZS5MZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gU3lzZXhFdmVudDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludCBvZmZzZXQgPSBWYXJsZW5Ub0J5dGVzKG1ldmVudC5NZXRhbGVuZ3RoLCBidWYsIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgQXJyYXkuQ29weShtZXZlbnQuVmFsdWUsIDAsIGJ1Ziwgb2Zmc2V0LCBtZXZlbnQuVmFsdWUuTGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCBvZmZzZXQgKyBtZXZlbnQuVmFsdWUuTGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IE1ldGFFdmVudCAmJiBtZXZlbnQuTWV0YWV2ZW50ID09IE1ldGFFdmVudFRlbXBvKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbMF0gPSBtZXZlbnQuTWV0YWV2ZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzFdID0gMztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlsyXSA9IChieXRlKSgobWV2ZW50LlRlbXBvID4+IDE2KSAmIDB4RkYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzNdID0gKGJ5dGUpKChtZXZlbnQuVGVtcG8gPj4gOCkgJiAweEZGKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1Zls0XSA9IChieXRlKShtZXZlbnQuVGVtcG8gJiAweEZGKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCA1KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IE1ldGFFdmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gbWV2ZW50Lk1ldGFldmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludCBvZmZzZXQgPSBWYXJsZW5Ub0J5dGVzKG1ldmVudC5NZXRhbGVuZ3RoLCBidWYsIDEpICsgMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LkNvcHkobWV2ZW50LlZhbHVlLCAwLCBidWYsIG9mZnNldCwgbWV2ZW50LlZhbHVlLkxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgb2Zmc2V0ICsgbWV2ZW50LlZhbHVlLkxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWxlLkNsb3NlKCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoSU9FeGNlcHRpb24gZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKiogQ2xvbmUgdGhlIGxpc3Qgb2YgTWlkaUV2ZW50cyAqL1xuICAgIHByaXZhdGUgc3RhdGljIExpc3Q8TWlkaUV2ZW50PltdIENsb25lTWlkaUV2ZW50cyhMaXN0PE1pZGlFdmVudD5bXSBvcmlnbGlzdCkge1xuICAgICAgICBMaXN0PE1pZGlFdmVudD5bXSBuZXdsaXN0ID0gbmV3IExpc3Q8TWlkaUV2ZW50Plsgb3JpZ2xpc3QuTGVuZ3RoXTtcbiAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IG9yaWdsaXN0Lkxlbmd0aDsgdHJhY2tudW0rKykge1xuICAgICAgICAgICAgTGlzdDxNaWRpRXZlbnQ+IG9yaWdldmVudHMgPSBvcmlnbGlzdFt0cmFja251bV07XG4gICAgICAgICAgICBMaXN0PE1pZGlFdmVudD4gbmV3ZXZlbnRzID0gbmV3IExpc3Q8TWlkaUV2ZW50PihvcmlnZXZlbnRzLkNvdW50KTtcbiAgICAgICAgICAgIG5ld2xpc3RbdHJhY2tudW1dID0gbmV3ZXZlbnRzO1xuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaUV2ZW50IG1ldmVudCBpbiBvcmlnZXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgbmV3ZXZlbnRzLkFkZCggbWV2ZW50LkNsb25lKCkgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3bGlzdDtcbiAgICB9XG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IE1pZGkgdGVtcG8gZXZlbnQsIHdpdGggdGhlIGdpdmVuIHRlbXBvICAqL1xuICAgIHByaXZhdGUgc3RhdGljIE1pZGlFdmVudCBDcmVhdGVUZW1wb0V2ZW50KGludCB0ZW1wbykge1xuICAgICAgICBNaWRpRXZlbnQgbWV2ZW50ID0gbmV3IE1pZGlFdmVudCgpO1xuICAgICAgICBtZXZlbnQuRGVsdGFUaW1lID0gMDtcbiAgICAgICAgbWV2ZW50LlN0YXJ0VGltZSA9IDA7XG4gICAgICAgIG1ldmVudC5IYXNFdmVudGZsYWcgPSB0cnVlO1xuICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gTWV0YUV2ZW50O1xuICAgICAgICBtZXZlbnQuTWV0YWV2ZW50ID0gTWV0YUV2ZW50VGVtcG87XG4gICAgICAgIG1ldmVudC5NZXRhbGVuZ3RoID0gMztcbiAgICAgICAgbWV2ZW50LlRlbXBvID0gdGVtcG87XG4gICAgICAgIHJldHVybiBtZXZlbnQ7XG4gICAgfVxuXG5cbiAgICAvKiogU2VhcmNoIHRoZSBldmVudHMgZm9yIGEgQ29udHJvbENoYW5nZSBldmVudCB3aXRoIHRoZSBzYW1lXG4gICAgICogIGNoYW5uZWwgYW5kIGNvbnRyb2wgbnVtYmVyLiAgSWYgYSBtYXRjaGluZyBldmVudCBpcyBmb3VuZCxcbiAgICAgKiAgIHVwZGF0ZSB0aGUgY29udHJvbCB2YWx1ZS4gIEVsc2UsIGFkZCBhIG5ldyBDb250cm9sQ2hhbmdlIGV2ZW50LlxuICAgICAqLyBcbiAgICBwcml2YXRlIHN0YXRpYyB2b2lkIFxuICAgIFVwZGF0ZUNvbnRyb2xDaGFuZ2UoTGlzdDxNaWRpRXZlbnQ+IG5ld2V2ZW50cywgTWlkaUV2ZW50IGNoYW5nZUV2ZW50KSB7XG4gICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBtZXZlbnQgaW4gbmV3ZXZlbnRzKSB7XG4gICAgICAgICAgICBpZiAoKG1ldmVudC5FdmVudEZsYWcgPT0gY2hhbmdlRXZlbnQuRXZlbnRGbGFnKSAmJlxuICAgICAgICAgICAgICAgIChtZXZlbnQuQ2hhbm5lbCA9PSBjaGFuZ2VFdmVudC5DaGFubmVsKSAmJlxuICAgICAgICAgICAgICAgIChtZXZlbnQuQ29udHJvbE51bSA9PSBjaGFuZ2VFdmVudC5Db250cm9sTnVtKSkge1xuXG4gICAgICAgICAgICAgICAgbWV2ZW50LkNvbnRyb2xWYWx1ZSA9IGNoYW5nZUV2ZW50LkNvbnRyb2xWYWx1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbmV3ZXZlbnRzLkFkZChjaGFuZ2VFdmVudCk7XG4gICAgfVxuXG4gICAgLyoqIFN0YXJ0IHRoZSBNaWRpIG11c2ljIGF0IHRoZSBnaXZlbiBwYXVzZSB0aW1lIChpbiBwdWxzZXMpLlxuICAgICAqICBSZW1vdmUgYW55IE5vdGVPbi9Ob3RlT2ZmIGV2ZW50cyB0aGF0IG9jY3VyIGJlZm9yZSB0aGUgcGF1c2UgdGltZS5cbiAgICAgKiAgRm9yIG90aGVyIGV2ZW50cywgY2hhbmdlIHRoZSBkZWx0YS10aW1lIHRvIDAgaWYgdGhleSBvY2N1clxuICAgICAqICBiZWZvcmUgdGhlIHBhdXNlIHRpbWUuICBSZXR1cm4gdGhlIG1vZGlmaWVkIE1pZGkgRXZlbnRzLlxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIExpc3Q8TWlkaUV2ZW50PltdIFxuICAgIFN0YXJ0QXRQYXVzZVRpbWUoTGlzdDxNaWRpRXZlbnQ+W10gbGlzdCwgaW50IHBhdXNlVGltZSkge1xuICAgICAgICBMaXN0PE1pZGlFdmVudD5bXSBuZXdsaXN0ID0gbmV3IExpc3Q8TWlkaUV2ZW50PlsgbGlzdC5MZW5ndGhdO1xuICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgbGlzdC5MZW5ndGg7IHRyYWNrbnVtKyspIHtcbiAgICAgICAgICAgIExpc3Q8TWlkaUV2ZW50PiBldmVudHMgPSBsaXN0W3RyYWNrbnVtXTtcbiAgICAgICAgICAgIExpc3Q8TWlkaUV2ZW50PiBuZXdldmVudHMgPSBuZXcgTGlzdDxNaWRpRXZlbnQ+KGV2ZW50cy5Db3VudCk7XG4gICAgICAgICAgICBuZXdsaXN0W3RyYWNrbnVtXSA9IG5ld2V2ZW50cztcblxuICAgICAgICAgICAgYm9vbCBmb3VuZEV2ZW50QWZ0ZXJQYXVzZSA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaUV2ZW50IG1ldmVudCBpbiBldmVudHMpIHtcblxuICAgICAgICAgICAgICAgIGlmIChtZXZlbnQuU3RhcnRUaW1lIDwgcGF1c2VUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IEV2ZW50Tm90ZU9uIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID09IEV2ZW50Tm90ZU9mZikge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBTa2lwIE5vdGVPbi9Ob3RlT2ZmIGV2ZW50ICovXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudENvbnRyb2xDaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5EZWx0YVRpbWUgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgVXBkYXRlQ29udHJvbENoYW5nZShuZXdldmVudHMsIG1ldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRGVsdGFUaW1lID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld2V2ZW50cy5BZGQobWV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICghZm91bmRFdmVudEFmdGVyUGF1c2UpIHtcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkRlbHRhVGltZSA9IChtZXZlbnQuU3RhcnRUaW1lIC0gcGF1c2VUaW1lKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3ZXZlbnRzLkFkZChtZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICBmb3VuZEV2ZW50QWZ0ZXJQYXVzZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBuZXdldmVudHMuQWRkKG1ldmVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXdsaXN0O1xuICAgIH1cblxuXG4gICAgLyoqIFdyaXRlIHRoaXMgTWlkaSBmaWxlIHRvIHRoZSBnaXZlbiBmaWxlbmFtZS5cbiAgICAgKiBJZiBvcHRpb25zIGlzIG5vdCBudWxsLCBhcHBseSB0aG9zZSBvcHRpb25zIHRvIHRoZSBtaWRpIGV2ZW50c1xuICAgICAqIGJlZm9yZSBwZXJmb3JtaW5nIHRoZSB3cml0ZS5cbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgZmlsZSB3YXMgc2F2ZWQgc3VjY2Vzc2Z1bGx5LCBlbHNlIGZhbHNlLlxuICAgICAqL1xuICAgIHB1YmxpYyBib29sIENoYW5nZVNvdW5kKHN0cmluZyBkZXN0ZmlsZSwgTWlkaU9wdGlvbnMgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gV3JpdGUoZGVzdGZpbGUsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHB1YmxpYyBib29sIFdyaXRlKHN0cmluZyBkZXN0ZmlsZSwgTWlkaU9wdGlvbnMgb3B0aW9ucykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgRmlsZVN0cmVhbSBzdHJlYW07XG4gICAgICAgICAgICBzdHJlYW0gPSBuZXcgRmlsZVN0cmVhbShkZXN0ZmlsZSwgRmlsZU1vZGUuQ3JlYXRlKTtcbiAgICAgICAgICAgIGJvb2wgcmVzdWx0ID0gV3JpdGUoc3RyZWFtLCBvcHRpb25zKTtcbiAgICAgICAgICAgIHN0cmVhbS5DbG9zZSgpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoSU9FeGNlcHRpb24gZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFdyaXRlIHRoaXMgTWlkaSBmaWxlIHRvIHRoZSBnaXZlbiBzdHJlYW0uXG4gICAgICogSWYgb3B0aW9ucyBpcyBub3QgbnVsbCwgYXBwbHkgdGhvc2Ugb3B0aW9ucyB0byB0aGUgbWlkaSBldmVudHNcbiAgICAgKiBiZWZvcmUgcGVyZm9ybWluZyB0aGUgd3JpdGUuXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIGZpbGUgd2FzIHNhdmVkIHN1Y2Nlc3NmdWxseSwgZWxzZSBmYWxzZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgYm9vbCBXcml0ZShTdHJlYW0gc3RyZWFtLCBNaWRpT3B0aW9ucyBvcHRpb25zKSB7XG4gICAgICAgIExpc3Q8TWlkaUV2ZW50PltdIG5ld2V2ZW50cyA9IGV2ZW50cztcbiAgICAgICAgaWYgKG9wdGlvbnMgIT0gbnVsbCkge1xuICAgICAgICAgICAgbmV3ZXZlbnRzID0gQXBwbHlPcHRpb25zVG9FdmVudHMob3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFdyaXRlRXZlbnRzKHN0cmVhbSwgbmV3ZXZlbnRzLCB0cmFja21vZGUsIHF1YXJ0ZXJub3RlKTtcbiAgICB9XG5cblxuICAgIC8qIEFwcGx5IHRoZSBmb2xsb3dpbmcgc291bmQgb3B0aW9ucyB0byB0aGUgbWlkaSBldmVudHM6XG4gICAgICogLSBUaGUgdGVtcG8gKHRoZSBtaWNyb3NlY29uZHMgcGVyIHB1bHNlKVxuICAgICAqIC0gVGhlIGluc3RydW1lbnRzIHBlciB0cmFja1xuICAgICAqIC0gVGhlIG5vdGUgbnVtYmVyICh0cmFuc3Bvc2UgdmFsdWUpXG4gICAgICogLSBUaGUgdHJhY2tzIHRvIGluY2x1ZGVcbiAgICAgKiBSZXR1cm4gdGhlIG1vZGlmaWVkIGxpc3Qgb2YgbWlkaSBldmVudHMuXG4gICAgICovXG4gICAgcHJpdmF0ZSBMaXN0PE1pZGlFdmVudD5bXVxuICAgIEFwcGx5T3B0aW9uc1RvRXZlbnRzKE1pZGlPcHRpb25zIG9wdGlvbnMpIHtcbiAgICAgICAgaW50IGk7XG4gICAgICAgIGlmICh0cmFja1BlckNoYW5uZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBBcHBseU9wdGlvbnNQZXJDaGFubmVsKG9wdGlvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogQSBtaWRpZmlsZSBjYW4gY29udGFpbiB0cmFja3Mgd2l0aCBub3RlcyBhbmQgdHJhY2tzIHdpdGhvdXQgbm90ZXMuXG4gICAgICAgICAqIFRoZSBvcHRpb25zLnRyYWNrcyBhbmQgb3B0aW9ucy5pbnN0cnVtZW50cyBhcmUgZm9yIHRyYWNrcyB3aXRoIG5vdGVzLlxuICAgICAgICAgKiBTbyB0aGUgdHJhY2sgbnVtYmVycyBpbiAnb3B0aW9ucycgbWF5IG5vdCBtYXRjaCBjb3JyZWN0bHkgaWYgdGhlXG4gICAgICAgICAqIG1pZGkgZmlsZSBoYXMgdHJhY2tzIHdpdGhvdXQgbm90ZXMuIFJlLWNvbXB1dGUgdGhlIGluc3RydW1lbnRzLCBhbmQgXG4gICAgICAgICAqIHRyYWNrcyB0byBrZWVwLlxuICAgICAgICAgKi9cbiAgICAgICAgaW50IG51bV90cmFja3MgPSBldmVudHMuTGVuZ3RoO1xuICAgICAgICBpbnRbXSBpbnN0cnVtZW50cyA9IG5ldyBpbnRbbnVtX3RyYWNrc107XG4gICAgICAgIGJvb2xbXSBrZWVwdHJhY2tzID0gbmV3IGJvb2xbbnVtX3RyYWNrc107XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBudW1fdHJhY2tzOyBpKyspIHtcbiAgICAgICAgICAgIGluc3RydW1lbnRzW2ldID0gMDtcbiAgICAgICAgICAgIGtlZXB0cmFja3NbaV0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCB0cmFja3MuQ291bnQ7IHRyYWNrbnVtKyspIHtcbiAgICAgICAgICAgIE1pZGlUcmFjayB0cmFjayA9IHRyYWNrc1t0cmFja251bV07XG4gICAgICAgICAgICBpbnQgcmVhbHRyYWNrID0gdHJhY2suTnVtYmVyO1xuICAgICAgICAgICAgaW5zdHJ1bWVudHNbcmVhbHRyYWNrXSA9IG9wdGlvbnMuaW5zdHJ1bWVudHNbdHJhY2tudW1dO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMubXV0ZVt0cmFja251bV0gPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGtlZXB0cmFja3NbcmVhbHRyYWNrXSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgTGlzdDxNaWRpRXZlbnQ+W10gbmV3ZXZlbnRzID0gQ2xvbmVNaWRpRXZlbnRzKGV2ZW50cyk7XG5cbiAgICAgICAgLyogU2V0IHRoZSB0ZW1wbyBhdCB0aGUgYmVnaW5uaW5nIG9mIGVhY2ggdHJhY2sgKi9cbiAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IG5ld2V2ZW50cy5MZW5ndGg7IHRyYWNrbnVtKyspIHtcbiAgICAgICAgICAgIE1pZGlFdmVudCBtZXZlbnQgPSBDcmVhdGVUZW1wb0V2ZW50KG9wdGlvbnMudGVtcG8pO1xuICAgICAgICAgICAgbmV3ZXZlbnRzW3RyYWNrbnVtXS5JbnNlcnQoMCwgbWV2ZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIENoYW5nZSB0aGUgbm90ZSBudW1iZXIgKHRyYW5zcG9zZSksIGluc3RydW1lbnQsIGFuZCB0ZW1wbyAqL1xuICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgbmV3ZXZlbnRzLkxlbmd0aDsgdHJhY2tudW0rKykge1xuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaUV2ZW50IG1ldmVudCBpbiBuZXdldmVudHNbdHJhY2tudW1dKSB7XG4gICAgICAgICAgICAgICAgaW50IG51bSA9IG1ldmVudC5Ob3RlbnVtYmVyICsgb3B0aW9ucy50cmFuc3Bvc2U7XG4gICAgICAgICAgICAgICAgaWYgKG51bSA8IDApXG4gICAgICAgICAgICAgICAgICAgIG51bSA9IDA7XG4gICAgICAgICAgICAgICAgaWYgKG51bSA+IDEyNylcbiAgICAgICAgICAgICAgICAgICAgbnVtID0gMTI3O1xuICAgICAgICAgICAgICAgIG1ldmVudC5Ob3RlbnVtYmVyID0gKGJ5dGUpbnVtO1xuICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy51c2VEZWZhdWx0SW5zdHJ1bWVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50Lkluc3RydW1lbnQgPSAoYnl0ZSlpbnN0cnVtZW50c1t0cmFja251bV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG1ldmVudC5UZW1wbyA9IG9wdGlvbnMudGVtcG87XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0aW9ucy5wYXVzZVRpbWUgIT0gMCkge1xuICAgICAgICAgICAgbmV3ZXZlbnRzID0gU3RhcnRBdFBhdXNlVGltZShuZXdldmVudHMsIG9wdGlvbnMucGF1c2VUaW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIENoYW5nZSB0aGUgdHJhY2tzIHRvIGluY2x1ZGUgKi9cbiAgICAgICAgaW50IGNvdW50ID0gMDtcbiAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IGtlZXB0cmFja3MuTGVuZ3RoOyB0cmFja251bSsrKSB7XG4gICAgICAgICAgICBpZiAoa2VlcHRyYWNrc1t0cmFja251bV0pIHtcbiAgICAgICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIExpc3Q8TWlkaUV2ZW50PltdIHJlc3VsdCA9IG5ldyBMaXN0PE1pZGlFdmVudD5bY291bnRdO1xuICAgICAgICBpID0gMDtcbiAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IGtlZXB0cmFja3MuTGVuZ3RoOyB0cmFja251bSsrKSB7XG4gICAgICAgICAgICBpZiAoa2VlcHRyYWNrc1t0cmFja251bV0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbaV0gPSBuZXdldmVudHNbdHJhY2tudW1dO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qIEFwcGx5IHRoZSBmb2xsb3dpbmcgc291bmQgb3B0aW9ucyB0byB0aGUgbWlkaSBldmVudHM6XG4gICAgICogLSBUaGUgdGVtcG8gKHRoZSBtaWNyb3NlY29uZHMgcGVyIHB1bHNlKVxuICAgICAqIC0gVGhlIGluc3RydW1lbnRzIHBlciB0cmFja1xuICAgICAqIC0gVGhlIG5vdGUgbnVtYmVyICh0cmFuc3Bvc2UgdmFsdWUpXG4gICAgICogLSBUaGUgdHJhY2tzIHRvIGluY2x1ZGVcbiAgICAgKiBSZXR1cm4gdGhlIG1vZGlmaWVkIGxpc3Qgb2YgbWlkaSBldmVudHMuXG4gICAgICpcbiAgICAgKiBUaGlzIE1pZGkgZmlsZSBvbmx5IGhhcyBvbmUgYWN0dWFsIHRyYWNrLCBidXQgd2UndmUgc3BsaXQgdGhhdFxuICAgICAqIGludG8gbXVsdGlwbGUgZmFrZSB0cmFja3MsIG9uZSBwZXIgY2hhbm5lbCwgYW5kIGRpc3BsYXllZCB0aGF0XG4gICAgICogdG8gdGhlIGVuZC11c2VyLiAgU28gY2hhbmdpbmcgdGhlIGluc3RydW1lbnQsIGFuZCB0cmFja3MgdG9cbiAgICAgKiBpbmNsdWRlLCBpcyBpbXBsZW1lbnRlZCBkaWZmZXJlbnRseSB0aGFuIEFwcGx5T3B0aW9uc1RvRXZlbnRzKCkuXG4gICAgICpcbiAgICAgKiAtIFdlIGNoYW5nZSB0aGUgaW5zdHJ1bWVudCBiYXNlZCBvbiB0aGUgY2hhbm5lbCwgbm90IHRoZSB0cmFjay5cbiAgICAgKiAtIFdlIGluY2x1ZGUvZXhjbHVkZSBjaGFubmVscywgbm90IHRyYWNrcy5cbiAgICAgKiAtIFdlIGV4Y2x1ZGUgYSBjaGFubmVsIGJ5IHNldHRpbmcgdGhlIG5vdGUgdm9sdW1lL3ZlbG9jaXR5IHRvIDAuXG4gICAgICovXG4gICAgcHJpdmF0ZSBMaXN0PE1pZGlFdmVudD5bXVxuICAgIEFwcGx5T3B0aW9uc1BlckNoYW5uZWwoTWlkaU9wdGlvbnMgb3B0aW9ucykge1xuICAgICAgICAvKiBEZXRlcm1pbmUgd2hpY2ggY2hhbm5lbHMgdG8gaW5jbHVkZS9leGNsdWRlLlxuICAgICAgICAgKiBBbHNvLCBkZXRlcm1pbmUgdGhlIGluc3RydW1lbnRzIGZvciBlYWNoIGNoYW5uZWwuXG4gICAgICAgICAqL1xuICAgICAgICBpbnRbXSBpbnN0cnVtZW50cyA9IG5ldyBpbnRbMTZdO1xuICAgICAgICBib29sW10ga2VlcGNoYW5uZWwgPSBuZXcgYm9vbFsxNl07XG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgMTY7IGkrKykge1xuICAgICAgICAgICAgaW5zdHJ1bWVudHNbaV0gPSAwO1xuICAgICAgICAgICAga2VlcGNoYW5uZWxbaV0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCB0cmFja3MuQ291bnQ7IHRyYWNrbnVtKyspIHtcbiAgICAgICAgICAgIE1pZGlUcmFjayB0cmFjayA9IHRyYWNrc1t0cmFja251bV07XG4gICAgICAgICAgICBpbnQgY2hhbm5lbCA9IHRyYWNrLk5vdGVzWzBdLkNoYW5uZWw7XG4gICAgICAgICAgICBpbnN0cnVtZW50c1tjaGFubmVsXSA9IG9wdGlvbnMuaW5zdHJ1bWVudHNbdHJhY2tudW1dO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMubXV0ZVt0cmFja251bV0gPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGtlZXBjaGFubmVsW2NoYW5uZWxdID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIExpc3Q8TWlkaUV2ZW50PltdIG5ld2V2ZW50cyA9IENsb25lTWlkaUV2ZW50cyhldmVudHMpO1xuXG4gICAgICAgIC8qIFNldCB0aGUgdGVtcG8gYXQgdGhlIGJlZ2lubmluZyBvZiBlYWNoIHRyYWNrICovXG4gICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCBuZXdldmVudHMuTGVuZ3RoOyB0cmFja251bSsrKSB7XG4gICAgICAgICAgICBNaWRpRXZlbnQgbWV2ZW50ID0gQ3JlYXRlVGVtcG9FdmVudChvcHRpb25zLnRlbXBvKTtcbiAgICAgICAgICAgIG5ld2V2ZW50c1t0cmFja251bV0uSW5zZXJ0KDAsIG1ldmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBDaGFuZ2UgdGhlIG5vdGUgbnVtYmVyICh0cmFuc3Bvc2UpLCBpbnN0cnVtZW50LCBhbmQgdGVtcG8gKi9cbiAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IG5ld2V2ZW50cy5MZW5ndGg7IHRyYWNrbnVtKyspIHtcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBtZXZlbnQgaW4gbmV3ZXZlbnRzW3RyYWNrbnVtXSkge1xuICAgICAgICAgICAgICAgIGludCBudW0gPSBtZXZlbnQuTm90ZW51bWJlciArIG9wdGlvbnMudHJhbnNwb3NlO1xuICAgICAgICAgICAgICAgIGlmIChudW0gPCAwKVxuICAgICAgICAgICAgICAgICAgICBudW0gPSAwO1xuICAgICAgICAgICAgICAgIGlmIChudW0gPiAxMjcpXG4gICAgICAgICAgICAgICAgICAgIG51bSA9IDEyNztcbiAgICAgICAgICAgICAgICBtZXZlbnQuTm90ZW51bWJlciA9IChieXRlKW51bTtcbiAgICAgICAgICAgICAgICBpZiAoIWtlZXBjaGFubmVsW21ldmVudC5DaGFubmVsXSkge1xuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuVmVsb2NpdHkgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbnMudXNlRGVmYXVsdEluc3RydW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5JbnN0cnVtZW50ID0gKGJ5dGUpaW5zdHJ1bWVudHNbbWV2ZW50LkNoYW5uZWxdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtZXZlbnQuVGVtcG8gPSBvcHRpb25zLnRlbXBvO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLnBhdXNlVGltZSAhPSAwKSB7XG4gICAgICAgICAgICBuZXdldmVudHMgPSBTdGFydEF0UGF1c2VUaW1lKG5ld2V2ZW50cywgb3B0aW9ucy5wYXVzZVRpbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXdldmVudHM7XG4gICAgfVxuXG5cbiAgICAvKiogQXBwbHkgdGhlIGdpdmVuIHNoZWV0IG11c2ljIG9wdGlvbnMgdG8gdGhlIE1pZGlOb3Rlcy5cbiAgICAgKiAgUmV0dXJuIHRoZSBtaWRpIHRyYWNrcyB3aXRoIHRoZSBjaGFuZ2VzIGFwcGxpZWQuXG4gICAgICovXG4gICAgcHVibGljIExpc3Q8TWlkaVRyYWNrPiBDaGFuZ2VNaWRpTm90ZXMoTWlkaU9wdGlvbnMgb3B0aW9ucykge1xuICAgICAgICBMaXN0PE1pZGlUcmFjaz4gbmV3dHJhY2tzID0gbmV3IExpc3Q8TWlkaVRyYWNrPigpO1xuXG4gICAgICAgIGZvciAoaW50IHRyYWNrID0gMDsgdHJhY2sgPCB0cmFja3MuQ291bnQ7IHRyYWNrKyspIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnRyYWNrc1t0cmFja10pIHtcbiAgICAgICAgICAgICAgICBuZXd0cmFja3MuQWRkKHRyYWNrc1t0cmFja10uQ2xvbmUoKSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyogVG8gbWFrZSB0aGUgc2hlZXQgbXVzaWMgbG9vayBuaWNlciwgd2Ugcm91bmQgdGhlIHN0YXJ0IHRpbWVzXG4gICAgICAgICAqIHNvIHRoYXQgbm90ZXMgY2xvc2UgdG9nZXRoZXIgYXBwZWFyIGFzIGEgc2luZ2xlIGNob3JkLiAgV2VcbiAgICAgICAgICogYWxzbyBleHRlbmQgdGhlIG5vdGUgZHVyYXRpb25zLCBzbyB0aGF0IHdlIGhhdmUgbG9uZ2VyIG5vdGVzXG4gICAgICAgICAqIGFuZCBmZXdlciByZXN0IHN5bWJvbHMuXG4gICAgICAgICAqL1xuICAgICAgICBUaW1lU2lnbmF0dXJlIHRpbWUgPSB0aW1lc2lnO1xuICAgICAgICBpZiAob3B0aW9ucy50aW1lICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRpbWUgPSBvcHRpb25zLnRpbWU7XG4gICAgICAgIH1cbiAgICAgICAgTWlkaUZpbGUuUm91bmRTdGFydFRpbWVzKG5ld3RyYWNrcywgb3B0aW9ucy5jb21iaW5lSW50ZXJ2YWwsIHRpbWVzaWcpO1xuICAgICAgICBNaWRpRmlsZS5Sb3VuZER1cmF0aW9ucyhuZXd0cmFja3MsIHRpbWUuUXVhcnRlcik7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMudHdvU3RhZmZzKSB7XG4gICAgICAgICAgICBuZXd0cmFja3MgPSBNaWRpRmlsZS5Db21iaW5lVG9Ud29UcmFja3MobmV3dHJhY2tzLCB0aW1lc2lnLk1lYXN1cmUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLnNoaWZ0dGltZSAhPSAwKSB7XG4gICAgICAgICAgICBNaWRpRmlsZS5TaGlmdFRpbWUobmV3dHJhY2tzLCBvcHRpb25zLnNoaWZ0dGltZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdGlvbnMudHJhbnNwb3NlICE9IDApIHtcbiAgICAgICAgICAgIE1pZGlGaWxlLlRyYW5zcG9zZShuZXd0cmFja3MsIG9wdGlvbnMudHJhbnNwb3NlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXd0cmFja3M7XG4gICAgfVxuXG5cbiAgICAvKiogU2hpZnQgdGhlIHN0YXJ0dGltZSBvZiB0aGUgbm90ZXMgYnkgdGhlIGdpdmVuIGFtb3VudC5cbiAgICAgKiBUaGlzIGlzIHVzZWQgYnkgdGhlIFNoaWZ0IE5vdGVzIG1lbnUgdG8gc2hpZnQgbm90ZXMgbGVmdC9yaWdodC5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHZvaWRcbiAgICBTaGlmdFRpbWUoTGlzdDxNaWRpVHJhY2s+IHRyYWNrcywgaW50IGFtb3VudClcbiAgICB7XG4gICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpIHtcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG5vdGUgaW4gdHJhY2suTm90ZXMpIHtcbiAgICAgICAgICAgICAgICBub3RlLlN0YXJ0VGltZSArPSBhbW91bnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogU2hpZnQgdGhlIG5vdGUga2V5cyB1cC9kb3duIGJ5IHRoZSBnaXZlbiBhbW91bnQgKi9cbiAgICBwdWJsaWMgc3RhdGljIHZvaWRcbiAgICBUcmFuc3Bvc2UoTGlzdDxNaWRpVHJhY2s+IHRyYWNrcywgaW50IGFtb3VudClcbiAgICB7XG4gICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpIHtcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG5vdGUgaW4gdHJhY2suTm90ZXMpIHtcbiAgICAgICAgICAgICAgICBub3RlLk51bWJlciArPSBhbW91bnQ7XG4gICAgICAgICAgICAgICAgaWYgKG5vdGUuTnVtYmVyIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICBub3RlLk51bWJlciA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICBcbiAgICAvKiBGaW5kIHRoZSBoaWdoZXN0IGFuZCBsb3dlc3Qgbm90ZXMgdGhhdCBvdmVybGFwIHRoaXMgaW50ZXJ2YWwgKHN0YXJ0dGltZSB0byBlbmR0aW1lKS5cbiAgICAgKiBUaGlzIG1ldGhvZCBpcyB1c2VkIGJ5IFNwbGl0VHJhY2sgdG8gZGV0ZXJtaW5lIHdoaWNoIHN0YWZmICh0b3Agb3IgYm90dG9tKSBhIG5vdGVcbiAgICAgKiBzaG91bGQgZ28gdG8uXG4gICAgICpcbiAgICAgKiBGb3IgbW9yZSBhY2N1cmF0ZSBTcGxpdFRyYWNrKCkgcmVzdWx0cywgd2UgbGltaXQgdGhlIGludGVydmFsL2R1cmF0aW9uIG9mIHRoaXMgbm90ZSBcbiAgICAgKiAoYW5kIG90aGVyIG5vdGVzKSB0byBvbmUgbWVhc3VyZS4gV2UgY2FyZSBvbmx5IGFib3V0IGhpZ2gvbG93IG5vdGVzIHRoYXQgYXJlXG4gICAgICogcmVhc29uYWJseSBjbG9zZSB0byB0aGlzIG5vdGUuXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgdm9pZFxuICAgIEZpbmRIaWdoTG93Tm90ZXMoTGlzdDxNaWRpTm90ZT4gbm90ZXMsIGludCBtZWFzdXJlbGVuLCBpbnQgc3RhcnRpbmRleCwgXG4gICAgICAgICAgICAgICAgICAgICBpbnQgc3RhcnR0aW1lLCBpbnQgZW5kdGltZSwgcmVmIGludCBoaWdoLCByZWYgaW50IGxvdykge1xuXG4gICAgICAgIGludCBpID0gc3RhcnRpbmRleDtcbiAgICAgICAgaWYgKHN0YXJ0dGltZSArIG1lYXN1cmVsZW4gPCBlbmR0aW1lKSB7XG4gICAgICAgICAgICBlbmR0aW1lID0gc3RhcnR0aW1lICsgbWVhc3VyZWxlbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlIChpIDwgbm90ZXMuQ291bnQgJiYgbm90ZXNbaV0uU3RhcnRUaW1lIDwgZW5kdGltZSkge1xuICAgICAgICAgICAgaWYgKG5vdGVzW2ldLkVuZFRpbWUgPCBzdGFydHRpbWUpIHtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm90ZXNbaV0uU3RhcnRUaW1lICsgbWVhc3VyZWxlbiA8IHN0YXJ0dGltZSkge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChoaWdoIDwgbm90ZXNbaV0uTnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgaGlnaCA9IG5vdGVzW2ldLk51bWJlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsb3cgPiBub3Rlc1tpXS5OdW1iZXIpIHtcbiAgICAgICAgICAgICAgICBsb3cgPSBub3Rlc1tpXS5OdW1iZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBGaW5kIHRoZSBoaWdoZXN0IGFuZCBsb3dlc3Qgbm90ZXMgdGhhdCBzdGFydCBhdCB0aGlzIGV4YWN0IHN0YXJ0IHRpbWUgKi9cbiAgICBwcml2YXRlIHN0YXRpYyB2b2lkXG4gICAgRmluZEV4YWN0SGlnaExvd05vdGVzKExpc3Q8TWlkaU5vdGU+IG5vdGVzLCBpbnQgc3RhcnRpbmRleCwgaW50IHN0YXJ0dGltZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmIGludCBoaWdoLCByZWYgaW50IGxvdykge1xuXG4gICAgICAgIGludCBpID0gc3RhcnRpbmRleDtcblxuICAgICAgICB3aGlsZSAobm90ZXNbaV0uU3RhcnRUaW1lIDwgc3RhcnR0aW1lKSB7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoaSA8IG5vdGVzLkNvdW50ICYmIG5vdGVzW2ldLlN0YXJ0VGltZSA9PSBzdGFydHRpbWUpIHtcbiAgICAgICAgICAgIGlmIChoaWdoIDwgbm90ZXNbaV0uTnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgaGlnaCA9IG5vdGVzW2ldLk51bWJlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsb3cgPiBub3Rlc1tpXS5OdW1iZXIpIHtcbiAgICAgICAgICAgICAgICBsb3cgPSBub3Rlc1tpXS5OdW1iZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICB9XG5cblxuIFxuICAgIC8qIFNwbGl0IHRoZSBnaXZlbiBNaWRpVHJhY2sgaW50byB0d28gdHJhY2tzLCB0b3AgYW5kIGJvdHRvbS5cbiAgICAgKiBUaGUgaGlnaGVzdCBub3RlcyB3aWxsIGdvIGludG8gdG9wLCB0aGUgbG93ZXN0IGludG8gYm90dG9tLlxuICAgICAqIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBzcGxpdCBwaWFubyBzb25ncyBpbnRvIGxlZnQtaGFuZCAoYm90dG9tKVxuICAgICAqIGFuZCByaWdodC1oYW5kICh0b3ApIHRyYWNrcy5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIExpc3Q8TWlkaVRyYWNrPiBTcGxpdFRyYWNrKE1pZGlUcmFjayB0cmFjaywgaW50IG1lYXN1cmVsZW4pIHtcbiAgICAgICAgTGlzdDxNaWRpTm90ZT4gbm90ZXMgPSB0cmFjay5Ob3RlcztcbiAgICAgICAgaW50IGNvdW50ID0gbm90ZXMuQ291bnQ7XG5cbiAgICAgICAgTWlkaVRyYWNrIHRvcCA9IG5ldyBNaWRpVHJhY2soMSk7XG4gICAgICAgIE1pZGlUcmFjayBib3R0b20gPSBuZXcgTWlkaVRyYWNrKDIpO1xuICAgICAgICBMaXN0PE1pZGlUcmFjaz4gcmVzdWx0ID0gbmV3IExpc3Q8TWlkaVRyYWNrPigyKTtcbiAgICAgICAgcmVzdWx0LkFkZCh0b3ApOyByZXN1bHQuQWRkKGJvdHRvbSk7XG5cbiAgICAgICAgaWYgKGNvdW50ID09IDApXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuXG4gICAgICAgIGludCBwcmV2aGlnaCAgPSA3NjsgLyogRTUsIHRvcCBvZiB0cmVibGUgc3RhZmYgKi9cbiAgICAgICAgaW50IHByZXZsb3cgICA9IDQ1OyAvKiBBMywgYm90dG9tIG9mIGJhc3Mgc3RhZmYgKi9cbiAgICAgICAgaW50IHN0YXJ0aW5kZXggPSAwO1xuXG4gICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG5vdGUgaW4gbm90ZXMpIHtcbiAgICAgICAgICAgIGludCBoaWdoLCBsb3csIGhpZ2hFeGFjdCwgbG93RXhhY3Q7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGludCBudW1iZXIgPSBub3RlLk51bWJlcjtcbiAgICAgICAgICAgIGhpZ2ggPSBsb3cgPSBoaWdoRXhhY3QgPSBsb3dFeGFjdCA9IG51bWJlcjtcblxuICAgICAgICAgICAgd2hpbGUgKG5vdGVzW3N0YXJ0aW5kZXhdLkVuZFRpbWUgPCBub3RlLlN0YXJ0VGltZSkge1xuICAgICAgICAgICAgICAgIHN0YXJ0aW5kZXgrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogSSd2ZSB0cmllZCBzZXZlcmFsIGFsZ29yaXRobXMgZm9yIHNwbGl0dGluZyBhIHRyYWNrIGluIHR3byxcbiAgICAgICAgICAgICAqIGFuZCB0aGUgb25lIGJlbG93IHNlZW1zIHRvIHdvcmsgdGhlIGJlc3Q6XG4gICAgICAgICAgICAgKiAtIElmIHRoaXMgbm90ZSBpcyBtb3JlIHRoYW4gYW4gb2N0YXZlIGZyb20gdGhlIGhpZ2gvbG93IG5vdGVzXG4gICAgICAgICAgICAgKiAgICh0aGF0IHN0YXJ0IGV4YWN0bHkgYXQgdGhpcyBzdGFydCB0aW1lKSwgY2hvb3NlIHRoZSBjbG9zZXN0IG9uZS5cbiAgICAgICAgICAgICAqIC0gSWYgdGhpcyBub3RlIGlzIG1vcmUgdGhhbiBhbiBvY3RhdmUgZnJvbSB0aGUgaGlnaC9sb3cgbm90ZXNcbiAgICAgICAgICAgICAqICAgKGluIHRoaXMgbm90ZSdzIHRpbWUgZHVyYXRpb24pLCBjaG9vc2UgdGhlIGNsb3Nlc3Qgb25lLlxuICAgICAgICAgICAgICogLSBJZiB0aGUgaGlnaCBhbmQgbG93IG5vdGVzICh0aGF0IHN0YXJ0IGV4YWN0bHkgYXQgdGhpcyBzdGFydHRpbWUpXG4gICAgICAgICAgICAgKiAgIGFyZSBtb3JlIHRoYW4gYW4gb2N0YXZlIGFwYXJ0LCBjaG9vc2UgdGhlIGNsb3Nlc3Qgbm90ZS5cbiAgICAgICAgICAgICAqIC0gSWYgdGhlIGhpZ2ggYW5kIGxvdyBub3RlcyAodGhhdCBvdmVybGFwIHRoaXMgc3RhcnR0aW1lKVxuICAgICAgICAgICAgICogICBhcmUgbW9yZSB0aGFuIGFuIG9jdGF2ZSBhcGFydCwgY2hvb3NlIHRoZSBjbG9zZXN0IG5vdGUuXG4gICAgICAgICAgICAgKiAtIEVsc2UsIGxvb2sgYXQgdGhlIHByZXZpb3VzIGhpZ2gvbG93IG5vdGVzIHRoYXQgd2VyZSBtb3JlIHRoYW4gYW4gXG4gICAgICAgICAgICAgKiAgIG9jdGF2ZSBhcGFydC4gIENob29zZSB0aGUgY2xvc2VzZXQgbm90ZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgRmluZEhpZ2hMb3dOb3Rlcyhub3RlcywgbWVhc3VyZWxlbiwgc3RhcnRpbmRleCwgbm90ZS5TdGFydFRpbWUsIG5vdGUuRW5kVGltZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZiBoaWdoLCByZWYgbG93KTtcbiAgICAgICAgICAgIEZpbmRFeGFjdEhpZ2hMb3dOb3Rlcyhub3Rlcywgc3RhcnRpbmRleCwgbm90ZS5TdGFydFRpbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmIGhpZ2hFeGFjdCwgcmVmIGxvd0V4YWN0KTtcblxuICAgICAgICAgICAgaWYgKGhpZ2hFeGFjdCAtIG51bWJlciA+IDEyIHx8IG51bWJlciAtIGxvd0V4YWN0ID4gMTIpIHtcbiAgICAgICAgICAgICAgICBpZiAoaGlnaEV4YWN0IC0gbnVtYmVyIDw9IG51bWJlciAtIGxvd0V4YWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRvcC5BZGROb3RlKG5vdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYm90dG9tLkFkZE5vdGUobm90ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIGVsc2UgaWYgKGhpZ2ggLSBudW1iZXIgPiAxMiB8fCBudW1iZXIgLSBsb3cgPiAxMikge1xuICAgICAgICAgICAgICAgIGlmIChoaWdoIC0gbnVtYmVyIDw9IG51bWJlciAtIGxvdykge1xuICAgICAgICAgICAgICAgICAgICB0b3AuQWRkTm90ZShub3RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJvdHRvbS5BZGROb3RlKG5vdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gXG4gICAgICAgICAgICBlbHNlIGlmIChoaWdoRXhhY3QgLSBsb3dFeGFjdCA+IDEyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGhpZ2hFeGFjdCAtIG51bWJlciA8PSBudW1iZXIgLSBsb3dFeGFjdCkge1xuICAgICAgICAgICAgICAgICAgICB0b3AuQWRkTm90ZShub3RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJvdHRvbS5BZGROb3RlKG5vdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGhpZ2ggLSBsb3cgPiAxMikge1xuICAgICAgICAgICAgICAgIGlmIChoaWdoIC0gbnVtYmVyIDw9IG51bWJlciAtIGxvdykge1xuICAgICAgICAgICAgICAgICAgICB0b3AuQWRkTm90ZShub3RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJvdHRvbS5BZGROb3RlKG5vdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChwcmV2aGlnaCAtIG51bWJlciA8PSBudW1iZXIgLSBwcmV2bG93KSB7XG4gICAgICAgICAgICAgICAgICAgIHRvcC5BZGROb3RlKG5vdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYm90dG9tLkFkZE5vdGUobm90ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBUaGUgcHJldmhpZ2gvcHJldmxvdyBhcmUgc2V0IHRvIHRoZSBsYXN0IGhpZ2gvbG93XG4gICAgICAgICAgICAgKiB0aGF0IGFyZSBtb3JlIHRoYW4gYW4gb2N0YXZlIGFwYXJ0LlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAoaGlnaCAtIGxvdyA+IDEyKSB7XG4gICAgICAgICAgICAgICAgcHJldmhpZ2ggPSBoaWdoO1xuICAgICAgICAgICAgICAgIHByZXZsb3cgPSBsb3c7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0b3AuTm90ZXMuU29ydCh0cmFjay5Ob3Rlc1swXSk7XG4gICAgICAgIGJvdHRvbS5Ob3Rlcy5Tb3J0KHRyYWNrLk5vdGVzWzBdKTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuXG4gICAgLyoqIENvbWJpbmUgdGhlIG5vdGVzIGluIHRoZSBnaXZlbiB0cmFja3MgaW50byBhIHNpbmdsZSBNaWRpVHJhY2suIFxuICAgICAqICBUaGUgaW5kaXZpZHVhbCB0cmFja3MgYXJlIGFscmVhZHkgc29ydGVkLiAgVG8gbWVyZ2UgdGhlbSwgd2VcbiAgICAgKiAgdXNlIGEgbWVyZ2Vzb3J0LWxpa2UgYWxnb3JpdGhtLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgTWlkaVRyYWNrIENvbWJpbmVUb1NpbmdsZVRyYWNrKExpc3Q8TWlkaVRyYWNrPiB0cmFja3MpXG4gICAge1xuICAgICAgICAvKiBBZGQgYWxsIG5vdGVzIGludG8gb25lIHRyYWNrICovXG4gICAgICAgIE1pZGlUcmFjayByZXN1bHQgPSBuZXcgTWlkaVRyYWNrKDEpO1xuXG4gICAgICAgIGlmICh0cmFja3MuQ291bnQgPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0cmFja3MuQ291bnQgPT0gMSkge1xuICAgICAgICAgICAgTWlkaVRyYWNrIHRyYWNrID0gdHJhY2tzWzBdO1xuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiB0cmFjay5Ob3Rlcykge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5BZGROb3RlKG5vdGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuXG4gICAgICAgIGludFtdIG5vdGVpbmRleCA9IG5ldyBpbnRbNjRdO1xuICAgICAgICBpbnRbXSBub3RlY291bnQgPSBuZXcgaW50WzY0XTtcblxuICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgdHJhY2tzLkNvdW50OyB0cmFja251bSsrKSB7XG4gICAgICAgICAgICBub3RlaW5kZXhbdHJhY2tudW1dID0gMDtcbiAgICAgICAgICAgIG5vdGVjb3VudFt0cmFja251bV0gPSB0cmFja3NbdHJhY2tudW1dLk5vdGVzLkNvdW50O1xuICAgICAgICB9XG4gICAgICAgIE1pZGlOb3RlIHByZXZub3RlID0gbnVsbDtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIE1pZGlOb3RlIGxvd2VzdG5vdGUgPSBudWxsO1xuICAgICAgICAgICAgaW50IGxvd2VzdFRyYWNrID0gLTE7XG4gICAgICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgdHJhY2tzLkNvdW50OyB0cmFja251bSsrKSB7XG4gICAgICAgICAgICAgICAgTWlkaVRyYWNrIHRyYWNrID0gdHJhY2tzW3RyYWNrbnVtXTtcbiAgICAgICAgICAgICAgICBpZiAobm90ZWluZGV4W3RyYWNrbnVtXSA+PSBub3RlY291bnRbdHJhY2tudW1dKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBNaWRpTm90ZSBub3RlID0gdHJhY2suTm90ZXNbIG5vdGVpbmRleFt0cmFja251bV0gXTtcbiAgICAgICAgICAgICAgICBpZiAobG93ZXN0bm90ZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvd2VzdG5vdGUgPSBub3RlO1xuICAgICAgICAgICAgICAgICAgICBsb3dlc3RUcmFjayA9IHRyYWNrbnVtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChub3RlLlN0YXJ0VGltZSA8IGxvd2VzdG5vdGUuU3RhcnRUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvd2VzdG5vdGUgPSBub3RlO1xuICAgICAgICAgICAgICAgICAgICBsb3dlc3RUcmFjayA9IHRyYWNrbnVtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChub3RlLlN0YXJ0VGltZSA9PSBsb3dlc3Rub3RlLlN0YXJ0VGltZSAmJiBub3RlLk51bWJlciA8IGxvd2VzdG5vdGUuTnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvd2VzdG5vdGUgPSBub3RlO1xuICAgICAgICAgICAgICAgICAgICBsb3dlc3RUcmFjayA9IHRyYWNrbnVtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsb3dlc3Rub3RlID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvKiBXZSd2ZSBmaW5pc2hlZCB0aGUgbWVyZ2UgKi9cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5vdGVpbmRleFtsb3dlc3RUcmFja10rKztcbiAgICAgICAgICAgIGlmICgocHJldm5vdGUgIT0gbnVsbCkgJiYgKHByZXZub3RlLlN0YXJ0VGltZSA9PSBsb3dlc3Rub3RlLlN0YXJ0VGltZSkgJiZcbiAgICAgICAgICAgICAgICAocHJldm5vdGUuTnVtYmVyID09IGxvd2VzdG5vdGUuTnVtYmVyKSApIHtcblxuICAgICAgICAgICAgICAgIC8qIERvbid0IGFkZCBkdXBsaWNhdGUgbm90ZXMsIHdpdGggdGhlIHNhbWUgc3RhcnQgdGltZSBhbmQgbnVtYmVyICovICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAobG93ZXN0bm90ZS5EdXJhdGlvbiA+IHByZXZub3RlLkR1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHByZXZub3RlLkR1cmF0aW9uID0gbG93ZXN0bm90ZS5EdXJhdGlvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHQuQWRkTm90ZShsb3dlc3Rub3RlKTtcbiAgICAgICAgICAgICAgICBwcmV2bm90ZSA9IGxvd2VzdG5vdGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cblxuICAgIC8qKiBDb21iaW5lIHRoZSBub3RlcyBpbiBhbGwgdGhlIHRyYWNrcyBnaXZlbiBpbnRvIHR3byBNaWRpVHJhY2tzLFxuICAgICAqIGFuZCByZXR1cm4gdGhlbS5cbiAgICAgKiBcbiAgICAgKiBUaGlzIGZ1bmN0aW9uIGlzIGludGVuZGVkIGZvciBwaWFubyBzb25ncywgd2hlbiB3ZSB3YW50IHRvIGRpc3BsYXlcbiAgICAgKiBhIGxlZnQtaGFuZCB0cmFjayBhbmQgYSByaWdodC1oYW5kIHRyYWNrLiAgVGhlIGxvd2VyIG5vdGVzIGdvIGludG8gXG4gICAgICogdGhlIGxlZnQtaGFuZCB0cmFjaywgYW5kIHRoZSBoaWdoZXIgbm90ZXMgZ28gaW50byB0aGUgcmlnaHQgaGFuZCBcbiAgICAgKiB0cmFjay5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIExpc3Q8TWlkaVRyYWNrPiBDb21iaW5lVG9Ud29UcmFja3MoTGlzdDxNaWRpVHJhY2s+IHRyYWNrcywgaW50IG1lYXN1cmVsZW4pXG4gICAge1xuICAgICAgICBNaWRpVHJhY2sgc2luZ2xlID0gQ29tYmluZVRvU2luZ2xlVHJhY2sodHJhY2tzKTtcbiAgICAgICAgTGlzdDxNaWRpVHJhY2s+IHJlc3VsdCA9IFNwbGl0VHJhY2soc2luZ2xlLCBtZWFzdXJlbGVuKTtcblxuICAgICAgICBMaXN0PE1pZGlFdmVudD4gbHlyaWNzID0gbmV3IExpc3Q8TWlkaUV2ZW50PigpO1xuICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKSB7XG4gICAgICAgICAgICBpZiAodHJhY2suTHlyaWNzICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBseXJpY3MuQWRkUmFuZ2UodHJhY2suTHlyaWNzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobHlyaWNzLkNvdW50ID4gMCkge1xuICAgICAgICAgICAgbHlyaWNzLlNvcnQobHlyaWNzWzBdKTtcbiAgICAgICAgICAgIHJlc3VsdFswXS5MeXJpY3MgPSBseXJpY3M7XG4gICAgICAgIH0gXG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cblxuICAgIC8qKiBDaGVjayB0aGF0IHRoZSBNaWRpTm90ZSBzdGFydCB0aW1lcyBhcmUgaW4gaW5jcmVhc2luZyBvcmRlci5cbiAgICAgKiBUaGlzIGlzIGZvciBkZWJ1Z2dpbmcgcHVycG9zZXMuXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBDaGVja1N0YXJ0VGltZXMoTGlzdDxNaWRpVHJhY2s+IHRyYWNrcykge1xuICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKSB7XG4gICAgICAgICAgICBpbnQgcHJldnRpbWUgPSAtMTtcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG5vdGUgaW4gdHJhY2suTm90ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAobm90ZS5TdGFydFRpbWUgPCBwcmV2dGltZSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgU3lzdGVtLkFyZ3VtZW50RXhjZXB0aW9uKFwic3RhcnQgdGltZXMgbm90IGluIGluY3JlYXNpbmcgb3JkZXJcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHByZXZ0aW1lID0gbm90ZS5TdGFydFRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIC8qKiBJbiBNaWRpIEZpbGVzLCB0aW1lIGlzIG1lYXN1cmVkIGluIHB1bHNlcy4gIE5vdGVzIHRoYXQgaGF2ZVxuICAgICAqIHB1bHNlIHRpbWVzIHRoYXQgYXJlIGNsb3NlIHRvZ2V0aGVyIChsaWtlIHdpdGhpbiAxMCBwdWxzZXMpXG4gICAgICogd2lsbCBzb3VuZCBsaWtlIHRoZXkncmUgdGhlIHNhbWUgY2hvcmQuICBXZSB3YW50IHRvIGRyYXdcbiAgICAgKiB0aGVzZSBub3RlcyBhcyBhIHNpbmdsZSBjaG9yZCwgaXQgbWFrZXMgdGhlIHNoZWV0IG11c2ljIG11Y2hcbiAgICAgKiBlYXNpZXIgdG8gcmVhZC4gIFdlIGRvbid0IHdhbnQgdG8gZHJhdyBub3RlcyB0aGF0IGFyZSBjbG9zZVxuICAgICAqIHRvZ2V0aGVyIGFzIHR3byBzZXBhcmF0ZSBjaG9yZHMuXG4gICAgICpcbiAgICAgKiBUaGUgU3ltYm9sU3BhY2luZyBjbGFzcyBvbmx5IGFsaWducyBub3RlcyB0aGF0IGhhdmUgZXhhY3RseSB0aGUgc2FtZVxuICAgICAqIHN0YXJ0IHRpbWVzLiAgTm90ZXMgd2l0aCBzbGlnaHRseSBkaWZmZXJlbnQgc3RhcnQgdGltZXMgd2lsbFxuICAgICAqIGFwcGVhciBpbiBzZXBhcmF0ZSB2ZXJ0aWNhbCBjb2x1bW5zLiAgVGhpcyBpc24ndCB3aGF0IHdlIHdhbnQuXG4gICAgICogV2Ugd2FudCB0byBhbGlnbiBub3RlcyB3aXRoIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgc3RhcnQgdGltZXMuXG4gICAgICogU28sIHRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBhc3NpZ24gdGhlIHNhbWUgc3RhcnR0aW1lIGZvciBub3Rlc1xuICAgICAqIHRoYXQgYXJlIGNsb3NlIHRvZ2V0aGVyICh0aW1ld2lzZSkuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyB2b2lkXG4gICAgUm91bmRTdGFydFRpbWVzKExpc3Q8TWlkaVRyYWNrPiB0cmFja3MsIGludCBtaWxsaXNlYywgVGltZVNpZ25hdHVyZSB0aW1lKSB7XG4gICAgICAgIC8qIEdldCBhbGwgdGhlIHN0YXJ0dGltZXMgaW4gYWxsIHRyYWNrcywgaW4gc29ydGVkIG9yZGVyICovXG4gICAgICAgIExpc3Q8aW50PiBzdGFydHRpbWVzID0gbmV3IExpc3Q8aW50PigpO1xuICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKSB7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrLk5vdGVzKSB7XG4gICAgICAgICAgICAgICAgc3RhcnR0aW1lcy5BZGQoIG5vdGUuU3RhcnRUaW1lICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3RhcnR0aW1lcy5Tb3J0KCk7XG5cbiAgICAgICAgLyogTm90ZXMgd2l0aGluIFwibWlsbGlzZWNcIiBtaWxsaXNlY29uZHMgYXBhcnQgd2lsbCBiZSBjb21iaW5lZC4gKi9cbiAgICAgICAgaW50IGludGVydmFsID0gdGltZS5RdWFydGVyICogbWlsbGlzZWMgKiAxMDAwIC8gdGltZS5UZW1wbztcblxuICAgICAgICAvKiBJZiB0d28gc3RhcnR0aW1lcyBhcmUgd2l0aGluIGludGVydmFsIG1pbGxpc2VjLCBtYWtlIHRoZW0gdGhlIHNhbWUgKi9cbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBzdGFydHRpbWVzLkNvdW50IC0gMTsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoc3RhcnR0aW1lc1tpKzFdIC0gc3RhcnR0aW1lc1tpXSA8PSBpbnRlcnZhbCkge1xuICAgICAgICAgICAgICAgIHN0YXJ0dGltZXNbaSsxXSA9IHN0YXJ0dGltZXNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBDaGVja1N0YXJ0VGltZXModHJhY2tzKTtcblxuICAgICAgICAvKiBBZGp1c3QgdGhlIG5vdGUgc3RhcnR0aW1lcywgc28gdGhhdCBpdCBtYXRjaGVzIG9uZSBvZiB0aGUgc3RhcnR0aW1lcyB2YWx1ZXMgKi9cbiAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcykge1xuICAgICAgICAgICAgaW50IGkgPSAwO1xuXG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrLk5vdGVzKSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGkgPCBzdGFydHRpbWVzLkNvdW50ICYmXG4gICAgICAgICAgICAgICAgICAgICAgIG5vdGUuU3RhcnRUaW1lIC0gaW50ZXJ2YWwgPiBzdGFydHRpbWVzW2ldKSB7XG4gICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobm90ZS5TdGFydFRpbWUgPiBzdGFydHRpbWVzW2ldICYmXG4gICAgICAgICAgICAgICAgICAgIG5vdGUuU3RhcnRUaW1lIC0gc3RhcnR0aW1lc1tpXSA8PSBpbnRlcnZhbCkge1xuXG4gICAgICAgICAgICAgICAgICAgIG5vdGUuU3RhcnRUaW1lID0gc3RhcnR0aW1lc1tpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cmFjay5Ob3Rlcy5Tb3J0KHRyYWNrLk5vdGVzWzBdKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLyoqIFdlIHdhbnQgbm90ZSBkdXJhdGlvbnMgdG8gc3BhbiB1cCB0byB0aGUgbmV4dCBub3RlIGluIGdlbmVyYWwuXG4gICAgICogVGhlIHNoZWV0IG11c2ljIGxvb2tzIG5pY2VyIHRoYXQgd2F5LiAgSW4gY29udHJhc3QsIHNoZWV0IG11c2ljXG4gICAgICogd2l0aCBsb3RzIG9mIDE2dGgvMzJuZCBub3RlcyBzZXBhcmF0ZWQgYnkgc21hbGwgcmVzdHMgZG9lc24ndFxuICAgICAqIGxvb2sgYXMgbmljZS4gIEhhdmluZyBuaWNlIGxvb2tpbmcgc2hlZXQgbXVzaWMgaXMgbW9yZSBpbXBvcnRhbnRcbiAgICAgKiB0aGFuIGZhaXRoZnVsbHkgcmVwcmVzZW50aW5nIHRoZSBNaWRpIEZpbGUgZGF0YS5cbiAgICAgKlxuICAgICAqIFRoZXJlZm9yZSwgdGhpcyBmdW5jdGlvbiByb3VuZHMgdGhlIGR1cmF0aW9uIG9mIE1pZGlOb3RlcyB1cCB0b1xuICAgICAqIHRoZSBuZXh0IG5vdGUgd2hlcmUgcG9zc2libGUuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyB2b2lkXG4gICAgUm91bmREdXJhdGlvbnMoTGlzdDxNaWRpVHJhY2s+IHRyYWNrcywgaW50IHF1YXJ0ZXJub3RlKSB7XG5cbiAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcyApIHtcbiAgICAgICAgICAgIE1pZGlOb3RlIHByZXZOb3RlID0gbnVsbDtcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgdHJhY2suTm90ZXMuQ291bnQtMTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgTWlkaU5vdGUgbm90ZTEgPSB0cmFjay5Ob3Rlc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAocHJldk5vdGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBwcmV2Tm90ZSA9IG5vdGUxO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8qIEdldCB0aGUgbmV4dCBub3RlIHRoYXQgaGFzIGEgZGlmZmVyZW50IHN0YXJ0IHRpbWUgKi9cbiAgICAgICAgICAgICAgICBNaWRpTm90ZSBub3RlMiA9IG5vdGUxO1xuICAgICAgICAgICAgICAgIGZvciAoaW50IGogPSBpKzE7IGogPCB0cmFjay5Ob3Rlcy5Db3VudDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vdGUyID0gdHJhY2suTm90ZXNbal07XG4gICAgICAgICAgICAgICAgICAgIGlmIChub3RlMS5TdGFydFRpbWUgPCBub3RlMi5TdGFydFRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGludCBtYXhkdXJhdGlvbiA9IG5vdGUyLlN0YXJ0VGltZSAtIG5vdGUxLlN0YXJ0VGltZTtcblxuICAgICAgICAgICAgICAgIGludCBkdXIgPSAwO1xuICAgICAgICAgICAgICAgIGlmIChxdWFydGVybm90ZSA8PSBtYXhkdXJhdGlvbilcbiAgICAgICAgICAgICAgICAgICAgZHVyID0gcXVhcnRlcm5vdGU7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocXVhcnRlcm5vdGUvMiA8PSBtYXhkdXJhdGlvbilcbiAgICAgICAgICAgICAgICAgICAgZHVyID0gcXVhcnRlcm5vdGUvMjtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChxdWFydGVybm90ZS8zIDw9IG1heGR1cmF0aW9uKVxuICAgICAgICAgICAgICAgICAgICBkdXIgPSBxdWFydGVybm90ZS8zO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHF1YXJ0ZXJub3RlLzQgPD0gbWF4ZHVyYXRpb24pXG4gICAgICAgICAgICAgICAgICAgIGR1ciA9IHF1YXJ0ZXJub3RlLzQ7XG5cblxuICAgICAgICAgICAgICAgIGlmIChkdXIgPCBub3RlMS5EdXJhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBkdXIgPSBub3RlMS5EdXJhdGlvbjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvKiBTcGVjaWFsIGNhc2U6IElmIHRoZSBwcmV2aW91cyBub3RlJ3MgZHVyYXRpb25cbiAgICAgICAgICAgICAgICAgKiBtYXRjaGVzIHRoaXMgbm90ZSdzIGR1cmF0aW9uLCB3ZSBjYW4gbWFrZSBhIG5vdGVwYWlyLlxuICAgICAgICAgICAgICAgICAqIFNvIGRvbid0IGV4cGFuZCB0aGUgZHVyYXRpb24gaW4gdGhhdCBjYXNlLlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmICgocHJldk5vdGUuU3RhcnRUaW1lICsgcHJldk5vdGUuRHVyYXRpb24gPT0gbm90ZTEuU3RhcnRUaW1lKSAmJlxuICAgICAgICAgICAgICAgICAgICAocHJldk5vdGUuRHVyYXRpb24gPT0gbm90ZTEuRHVyYXRpb24pKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZHVyID0gbm90ZTEuRHVyYXRpb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5vdGUxLkR1cmF0aW9uID0gZHVyO1xuICAgICAgICAgICAgICAgIGlmICh0cmFjay5Ob3Rlc1tpKzFdLlN0YXJ0VGltZSAhPSBub3RlMS5TdGFydFRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJldk5vdGUgPSBub3RlMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogU3BsaXQgdGhlIGdpdmVuIHRyYWNrIGludG8gbXVsdGlwbGUgdHJhY2tzLCBzZXBhcmF0aW5nIGVhY2hcbiAgICAgKiBjaGFubmVsIGludG8gYSBzZXBhcmF0ZSB0cmFjay5cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBMaXN0PE1pZGlUcmFjaz4gXG4gICAgU3BsaXRDaGFubmVscyhNaWRpVHJhY2sgb3JpZ3RyYWNrLCBMaXN0PE1pZGlFdmVudD4gZXZlbnRzKSB7XG5cbiAgICAgICAgLyogRmluZCB0aGUgaW5zdHJ1bWVudCB1c2VkIGZvciBlYWNoIGNoYW5uZWwgKi9cbiAgICAgICAgaW50W10gY2hhbm5lbEluc3RydW1lbnRzID0gbmV3IGludFsxNl07XG4gICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBtZXZlbnQgaW4gZXZlbnRzKSB7XG4gICAgICAgICAgICBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudFByb2dyYW1DaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICBjaGFubmVsSW5zdHJ1bWVudHNbbWV2ZW50LkNoYW5uZWxdID0gbWV2ZW50Lkluc3RydW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2hhbm5lbEluc3RydW1lbnRzWzldID0gMTI4OyAvKiBDaGFubmVsIDkgPSBQZXJjdXNzaW9uICovXG5cbiAgICAgICAgTGlzdDxNaWRpVHJhY2s+IHJlc3VsdCA9IG5ldyBMaXN0PE1pZGlUcmFjaz4oKTtcbiAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiBvcmlndHJhY2suTm90ZXMpIHtcbiAgICAgICAgICAgIGJvb2wgZm91bmRjaGFubmVsID0gZmFsc2U7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vdGUuQ2hhbm5lbCA9PSB0cmFjay5Ob3Rlc1swXS5DaGFubmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvdW5kY2hhbm5lbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRyYWNrLkFkZE5vdGUobm90ZSk7IFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghZm91bmRjaGFubmVsKSB7XG4gICAgICAgICAgICAgICAgTWlkaVRyYWNrIHRyYWNrID0gbmV3IE1pZGlUcmFjayhyZXN1bHQuQ291bnQgKyAxKTtcbiAgICAgICAgICAgICAgICB0cmFjay5BZGROb3RlKG5vdGUpO1xuICAgICAgICAgICAgICAgIHRyYWNrLkluc3RydW1lbnQgPSBjaGFubmVsSW5zdHJ1bWVudHNbbm90ZS5DaGFubmVsXTtcbiAgICAgICAgICAgICAgICByZXN1bHQuQWRkKHRyYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAob3JpZ3RyYWNrLkx5cmljcyAhPSBudWxsKSB7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbHlyaWNFdmVudCBpbiBvcmlndHJhY2suTHlyaWNzKSB7XG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobHlyaWNFdmVudC5DaGFubmVsID09IHRyYWNrLk5vdGVzWzBdLkNoYW5uZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYWNrLkFkZEx5cmljKGx5cmljRXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG5cbiAgICAvKiogR3Vlc3MgdGhlIG1lYXN1cmUgbGVuZ3RoLiAgV2UgYXNzdW1lIHRoYXQgdGhlIG1lYXN1cmVcbiAgICAgKiBsZW5ndGggbXVzdCBiZSBiZXR3ZWVuIDAuNSBzZWNvbmRzIGFuZCA0IHNlY29uZHMuXG4gICAgICogVGFrZSBhbGwgdGhlIG5vdGUgc3RhcnQgdGltZXMgdGhhdCBmYWxsIGJldHdlZW4gMC41IGFuZCBcbiAgICAgKiA0IHNlY29uZHMsIGFuZCByZXR1cm4gdGhlIHN0YXJ0dGltZXMuXG4gICAgICovXG4gICAgcHVibGljIExpc3Q8aW50PiBcbiAgICBHdWVzc01lYXN1cmVMZW5ndGgoKSB7XG4gICAgICAgIExpc3Q8aW50PiByZXN1bHQgPSBuZXcgTGlzdDxpbnQ+KCk7XG5cbiAgICAgICAgaW50IHB1bHNlc19wZXJfc2Vjb25kID0gKGludCkgKDEwMDAwMDAuMCAvIHRpbWVzaWcuVGVtcG8gKiB0aW1lc2lnLlF1YXJ0ZXIpO1xuICAgICAgICBpbnQgbWlubWVhc3VyZSA9IHB1bHNlc19wZXJfc2Vjb25kIC8gMjsgIC8qIFRoZSBtaW5pbXVtIG1lYXN1cmUgbGVuZ3RoIGluIHB1bHNlcyAqL1xuICAgICAgICBpbnQgbWF4bWVhc3VyZSA9IHB1bHNlc19wZXJfc2Vjb25kICogNDsgIC8qIFRoZSBtYXhpbXVtIG1lYXN1cmUgbGVuZ3RoIGluIHB1bHNlcyAqL1xuXG4gICAgICAgIC8qIEdldCB0aGUgc3RhcnQgdGltZSBvZiB0aGUgZmlyc3Qgbm90ZSBpbiB0aGUgbWlkaSBmaWxlLiAqL1xuICAgICAgICBpbnQgZmlyc3Rub3RlID0gdGltZXNpZy5NZWFzdXJlICogNTtcbiAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcykge1xuICAgICAgICAgICAgaWYgKGZpcnN0bm90ZSA+IHRyYWNrLk5vdGVzWzBdLlN0YXJ0VGltZSkge1xuICAgICAgICAgICAgICAgIGZpcnN0bm90ZSA9IHRyYWNrLk5vdGVzWzBdLlN0YXJ0VGltZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIGludGVydmFsID0gMC4wNiBzZWNvbmRzLCBjb252ZXJ0ZWQgaW50byBwdWxzZXMgKi9cbiAgICAgICAgaW50IGludGVydmFsID0gdGltZXNpZy5RdWFydGVyICogNjAwMDAgLyB0aW1lc2lnLlRlbXBvO1xuXG4gICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpIHtcbiAgICAgICAgICAgIGludCBwcmV2dGltZSA9IDA7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrLk5vdGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vdGUuU3RhcnRUaW1lIC0gcHJldnRpbWUgPD0gaW50ZXJ2YWwpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgcHJldnRpbWUgPSBub3RlLlN0YXJ0VGltZTtcblxuICAgICAgICAgICAgICAgIGludCB0aW1lX2Zyb21fZmlyc3Rub3RlID0gbm90ZS5TdGFydFRpbWUgLSBmaXJzdG5vdGU7XG5cbiAgICAgICAgICAgICAgICAvKiBSb3VuZCB0aGUgdGltZSBkb3duIHRvIGEgbXVsdGlwbGUgb2YgNCAqL1xuICAgICAgICAgICAgICAgIHRpbWVfZnJvbV9maXJzdG5vdGUgPSB0aW1lX2Zyb21fZmlyc3Rub3RlIC8gNCAqIDQ7XG4gICAgICAgICAgICAgICAgaWYgKHRpbWVfZnJvbV9maXJzdG5vdGUgPCBtaW5tZWFzdXJlKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBpZiAodGltZV9mcm9tX2ZpcnN0bm90ZSA+IG1heG1lYXN1cmUpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQuQ29udGFpbnModGltZV9mcm9tX2ZpcnN0bm90ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LkFkZCh0aW1lX2Zyb21fZmlyc3Rub3RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LlNvcnQoKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBsYXN0IHN0YXJ0IHRpbWUgKi9cbiAgICBwdWJsaWMgaW50IEVuZFRpbWUoKSB7XG4gICAgICAgIGludCBsYXN0U3RhcnQgPSAwO1xuICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKSB7XG4gICAgICAgICAgICBpZiAodHJhY2suTm90ZXMuQ291bnQgPT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW50IGxhc3QgPSB0cmFjay5Ob3Rlc1sgdHJhY2suTm90ZXMuQ291bnQtMSBdLlN0YXJ0VGltZTtcbiAgICAgICAgICAgIGxhc3RTdGFydCA9IE1hdGguTWF4KGxhc3QsIGxhc3RTdGFydCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxhc3RTdGFydDtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRydWUgaWYgdGhpcyBtaWRpIGZpbGUgaGFzIGx5cmljcyAqL1xuICAgIHB1YmxpYyBib29sIEhhc0x5cmljcygpIHtcbiAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcykge1xuICAgICAgICAgICAgaWYgKHRyYWNrLkx5cmljcyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHN0cmluZyByZXN1bHQgPSBcIk1pZGkgRmlsZSB0cmFja3M9XCIgKyB0cmFja3MuQ291bnQgKyBcIiBxdWFydGVyPVwiICsgcXVhcnRlcm5vdGUgKyBcIlxcblwiO1xuICAgICAgICByZXN1bHQgKz0gVGltZS5Ub1N0cmluZygpICsgXCJcXG5cIjtcbiAgICAgICAgZm9yZWFjaChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gdHJhY2suVG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qIENvbW1hbmQtbGluZSBwcm9ncmFtIHRvIHByaW50IG91dCBhIHBhcnNlZCBNaWRpIGZpbGUuIFVzZWQgZm9yIGRlYnVnZ2luZy5cbiAgICAgKiBUbyBydW46XG4gICAgICogLSBDaGFuZ2UgTWFpbjIgdG8gTWFpblxuICAgICAqIC0gY3NjIE1pZGlOb3RlLmNzIE1pZGlFdmVudC5jcyBNaWRpVHJhY2suY3MgTWlkaUZpbGVSZWFkZXIuY3MgTWlkaU9wdGlvbnMuY3NcbiAgICAgKiAgIE1pZGlGaWxlLmNzIE1pZGlGaWxlRXhjZXB0aW9uLmNzIFRpbWVTaWduYXR1cmUuY3MgQ29uZmlnSU5JLmNzXG4gICAgICogLSBNaWRpRmlsZS5leGUgZmlsZS5taWRcbiAgICAgKlxuICAgICAqL1xuICAgIC8vcHVibGljIHN0YXRpYyB2b2lkIE1haW4yKHN0cmluZ1tdIGFyZykge1xuICAgIC8vICAgIGlmIChhcmcuTGVuZ3RoID09IDApIHtcbiAgICAvLyAgICAgICAgQ29uc29sZS5Xcml0ZUxpbmUoXCJVc2FnZTogTWlkaUZpbGUgPGZpbGVuYW1lPlwiKTtcbiAgICAvLyAgICAgICAgcmV0dXJuO1xuICAgIC8vICAgIH1cblxuICAgIC8vICAgIE1pZGlGaWxlIGYgPSBuZXcgTWlkaUZpbGUoYXJnWzBdKTtcbiAgICAvLyAgICBDb25zb2xlLldyaXRlKGYuVG9TdHJpbmcoKSk7XG4gICAgLy99XG5cbn0gIC8qIEVuZCBjbGFzcyBNaWRpRmlsZSAqL1xuXG5cbn0gIC8qIEVuZCBuYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMgKi9cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDEyIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbi8qKiBAY2xhc3MgTWlkaUZpbGVFeGNlcHRpb25cbiAqIEEgTWlkaUZpbGVFeGNlcHRpb24gaXMgdGhyb3duIHdoZW4gYW4gZXJyb3Igb2NjdXJzXG4gKiB3aGlsZSBwYXJzaW5nIHRoZSBNaWRpIEZpbGUuICBUaGUgY29uc3RydWN0b3IgdGFrZXNcbiAqIHRoZSBmaWxlIG9mZnNldCAoaW4gYnl0ZXMpIHdoZXJlIHRoZSBlcnJvciBvY2N1cnJlZCxcbiAqIGFuZCBhIHN0cmluZyBkZXNjcmliaW5nIHRoZSBlcnJvci5cbiAqL1xucHVibGljIGNsYXNzIE1pZGlGaWxlRXhjZXB0aW9uIDogU3lzdGVtLkV4Y2VwdGlvbiB7XG4gICAgcHVibGljIE1pZGlGaWxlRXhjZXB0aW9uIChzdHJpbmcgcywgaW50IG9mZnNldCkgOlxuICAgICAgICBiYXNlKHMgKyBcIiBhdCBvZmZzZXQgXCIgKyBvZmZzZXQpIHtcbiAgICB9XG59XG5cbn1cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDEyIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cblxuLyoqIEBjbGFzcyBNaWRpRmlsZVJlYWRlclxuICogVGhlIE1pZGlGaWxlUmVhZGVyIGlzIHVzZWQgdG8gcmVhZCBsb3ctbGV2ZWwgYmluYXJ5IGRhdGEgZnJvbSBhIGZpbGUuXG4gKiBUaGlzIGNsYXNzIGNhbiBkbyB0aGUgZm9sbG93aW5nOlxuICpcbiAqIC0gUGVlayBhdCB0aGUgbmV4dCBieXRlIGluIHRoZSBmaWxlLlxuICogLSBSZWFkIGEgYnl0ZVxuICogLSBSZWFkIGEgMTYtYml0IGJpZyBlbmRpYW4gc2hvcnRcbiAqIC0gUmVhZCBhIDMyLWJpdCBiaWcgZW5kaWFuIGludFxuICogLSBSZWFkIGEgZml4ZWQgbGVuZ3RoIGFzY2lpIHN0cmluZyAobm90IG51bGwgdGVybWluYXRlZClcbiAqIC0gUmVhZCBhIFwidmFyaWFibGUgbGVuZ3RoXCIgaW50ZWdlci4gIFRoZSBmb3JtYXQgb2YgdGhlIHZhcmlhYmxlIGxlbmd0aFxuICogICBpbnQgaXMgZGVzY3JpYmVkIGF0IHRoZSB0b3Agb2YgdGhpcyBmaWxlLlxuICogLSBTa2lwIGFoZWFkIGEgZ2l2ZW4gbnVtYmVyIG9mIGJ5dGVzXG4gKiAtIFJldHVybiB0aGUgY3VycmVudCBvZmZzZXQuXG4gKi9cblxucHVibGljIGNsYXNzIE1pZGlGaWxlUmVhZGVyIHtcbiAgICBwcml2YXRlIGJ5dGVbXSBkYXRhOyAgICAgICAvKiogVGhlIGVudGlyZSBtaWRpIGZpbGUgZGF0YSAqL1xuICAgIHByaXZhdGUgaW50IHBhcnNlX29mZnNldDsgIC8qKiBUaGUgY3VycmVudCBvZmZzZXQgd2hpbGUgcGFyc2luZyAqL1xuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBNaWRpRmlsZVJlYWRlciBmb3IgdGhlIGdpdmVuIGZpbGVuYW1lICovXG4gICAgLy9wdWJsaWMgTWlkaUZpbGVSZWFkZXIoc3RyaW5nIGZpbGVuYW1lKSB7XG4gICAgLy8gICAgRmlsZUluZm8gaW5mbyA9IG5ldyBGaWxlSW5mbyhmaWxlbmFtZSk7XG4gICAgLy8gICAgaWYgKCFpbmZvLkV4aXN0cykge1xuICAgIC8vICAgICAgICB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXCJGaWxlIFwiICsgZmlsZW5hbWUgKyBcIiBkb2VzIG5vdCBleGlzdFwiLCAwKTtcbiAgICAvLyAgICB9XG4gICAgLy8gICAgaWYgKGluZm8uTGVuZ3RoID09IDApIHtcbiAgICAvLyAgICAgICAgdGhyb3cgbmV3IE1pZGlGaWxlRXhjZXB0aW9uKFwiRmlsZSBcIiArIGZpbGVuYW1lICsgXCIgaXMgZW1wdHkgKDAgYnl0ZXMpXCIsIDApO1xuICAgIC8vICAgIH1cbiAgICAvLyAgICBGaWxlU3RyZWFtIGZpbGUgPSBGaWxlLk9wZW4oZmlsZW5hbWUsIEZpbGVNb2RlLk9wZW4sIFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBGaWxlQWNjZXNzLlJlYWQsIEZpbGVTaGFyZS5SZWFkKTtcblxuICAgIC8vICAgIC8qIFJlYWQgdGhlIGVudGlyZSBmaWxlIGludG8gbWVtb3J5ICovXG4gICAgLy8gICAgZGF0YSA9IG5ldyBieXRlWyBpbmZvLkxlbmd0aCBdO1xuICAgIC8vICAgIGludCBvZmZzZXQgPSAwO1xuICAgIC8vICAgIGludCBsZW4gPSAoaW50KWluZm8uTGVuZ3RoO1xuICAgIC8vICAgIHdoaWxlICh0cnVlKSB7XG4gICAgLy8gICAgICAgIGlmIChvZmZzZXQgPT0gaW5mby5MZW5ndGgpXG4gICAgLy8gICAgICAgICAgICBicmVhaztcbiAgICAvLyAgICAgICAgaW50IG4gPSBmaWxlLlJlYWQoZGF0YSwgb2Zmc2V0LCAoaW50KShpbmZvLkxlbmd0aCAtIG9mZnNldCkpO1xuICAgIC8vICAgICAgICBpZiAobiA8PSAwKVxuICAgIC8vICAgICAgICAgICAgYnJlYWs7XG4gICAgLy8gICAgICAgIG9mZnNldCArPSBuO1xuICAgIC8vICAgIH1cbiAgICAvLyAgICBwYXJzZV9vZmZzZXQgPSAwO1xuICAgIC8vICAgIGZpbGUuQ2xvc2UoKTtcbiAgICAvL31cblxuICAgIC8qKiBDcmVhdGUgYSBuZXcgTWlkaUZpbGVSZWFkZXIgZnJvbSB0aGUgZ2l2ZW4gZGF0YSAqL1xuICAgIHB1YmxpYyBNaWRpRmlsZVJlYWRlcihieXRlW10gYnl0ZXMpIHtcbiAgICAgICAgZGF0YSA9IGJ5dGVzO1xuICAgICAgICBwYXJzZV9vZmZzZXQgPSAwO1xuICAgIH1cblxuICAgIC8qKiBDaGVjayB0aGF0IHRoZSBnaXZlbiBudW1iZXIgb2YgYnl0ZXMgZG9lc24ndCBleGNlZWQgdGhlIGZpbGUgc2l6ZSAqL1xuICAgIHByaXZhdGUgdm9pZCBjaGVja1JlYWQoaW50IGFtb3VudCkge1xuICAgICAgICBpZiAocGFyc2Vfb2Zmc2V0ICsgYW1vdW50ID4gZGF0YS5MZW5ndGgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBNaWRpRmlsZUV4Y2VwdGlvbihcIkZpbGUgaXMgdHJ1bmNhdGVkXCIsIHBhcnNlX29mZnNldCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogUmVhZCB0aGUgbmV4dCBieXRlIGluIHRoZSBmaWxlLCBidXQgZG9uJ3QgaW5jcmVtZW50IHRoZSBwYXJzZSBvZmZzZXQgKi9cbiAgICBwdWJsaWMgYnl0ZSBQZWVrKCkge1xuICAgICAgICBjaGVja1JlYWQoMSk7XG4gICAgICAgIHJldHVybiBkYXRhW3BhcnNlX29mZnNldF07XG4gICAgfVxuXG4gICAgLyoqIFJlYWQgYSBieXRlIGZyb20gdGhlIGZpbGUgKi9cbiAgICBwdWJsaWMgYnl0ZSBSZWFkQnl0ZSgpIHsgXG4gICAgICAgIGNoZWNrUmVhZCgxKTtcbiAgICAgICAgYnl0ZSB4ID0gZGF0YVtwYXJzZV9vZmZzZXRdO1xuICAgICAgICBwYXJzZV9vZmZzZXQrKztcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuXG4gICAgLyoqIFJlYWQgdGhlIGdpdmVuIG51bWJlciBvZiBieXRlcyBmcm9tIHRoZSBmaWxlICovXG4gICAgcHVibGljIGJ5dGVbXSBSZWFkQnl0ZXMoaW50IGFtb3VudCkge1xuICAgICAgICBjaGVja1JlYWQoYW1vdW50KTtcbiAgICAgICAgYnl0ZVtdIHJlc3VsdCA9IG5ldyBieXRlW2Ftb3VudF07XG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgYW1vdW50OyBpKyspIHtcbiAgICAgICAgICAgIHJlc3VsdFtpXSA9IGRhdGFbaSArIHBhcnNlX29mZnNldF07XG4gICAgICAgIH1cbiAgICAgICAgcGFyc2Vfb2Zmc2V0ICs9IGFtb3VudDtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKiogUmVhZCBhIDE2LWJpdCBzaG9ydCBmcm9tIHRoZSBmaWxlICovXG4gICAgcHVibGljIHVzaG9ydCBSZWFkU2hvcnQoKSB7XG4gICAgICAgIGNoZWNrUmVhZCgyKTtcbiAgICAgICAgdXNob3J0IHggPSAodXNob3J0KSAoIChkYXRhW3BhcnNlX29mZnNldF0gPDwgOCkgfCBkYXRhW3BhcnNlX29mZnNldCsxXSApO1xuICAgICAgICBwYXJzZV9vZmZzZXQgKz0gMjtcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuXG4gICAgLyoqIFJlYWQgYSAzMi1iaXQgaW50IGZyb20gdGhlIGZpbGUgKi9cbiAgICBwdWJsaWMgaW50IFJlYWRJbnQoKSB7XG4gICAgICAgIGNoZWNrUmVhZCg0KTtcbiAgICAgICAgaW50IHggPSAoaW50KSggKGRhdGFbcGFyc2Vfb2Zmc2V0XSA8PCAyNCkgfCAoZGF0YVtwYXJzZV9vZmZzZXQrMV0gPDwgMTYpIHxcbiAgICAgICAgICAgICAgICAgICAgICAgKGRhdGFbcGFyc2Vfb2Zmc2V0KzJdIDw8IDgpIHwgZGF0YVtwYXJzZV9vZmZzZXQrM10gKTtcbiAgICAgICAgcGFyc2Vfb2Zmc2V0ICs9IDQ7XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cblxuICAgIC8qKiBSZWFkIGFuIGFzY2lpIHN0cmluZyB3aXRoIHRoZSBnaXZlbiBsZW5ndGggKi9cbiAgICBwdWJsaWMgc3RyaW5nIFJlYWRBc2NpaShpbnQgbGVuKSB7XG4gICAgICAgIGNoZWNrUmVhZChsZW4pO1xuICAgICAgICBzdHJpbmcgcyA9IEFTQ0lJRW5jb2RpbmcuQVNDSUkuR2V0U3RyaW5nKGRhdGEsIHBhcnNlX29mZnNldCwgbGVuKTtcbiAgICAgICAgcGFyc2Vfb2Zmc2V0ICs9IGxlbjtcbiAgICAgICAgcmV0dXJuIHM7XG4gICAgfVxuXG4gICAgLyoqIFJlYWQgYSB2YXJpYWJsZS1sZW5ndGggaW50ZWdlciAoMSB0byA0IGJ5dGVzKS4gVGhlIGludGVnZXIgZW5kc1xuICAgICAqIHdoZW4geW91IGVuY291bnRlciBhIGJ5dGUgdGhhdCBkb2Vzbid0IGhhdmUgdGhlIDh0aCBiaXQgc2V0XG4gICAgICogKGEgYnl0ZSBsZXNzIHRoYW4gMHg4MCkuXG4gICAgICovXG4gICAgcHVibGljIGludCBSZWFkVmFybGVuKCkge1xuICAgICAgICB1aW50IHJlc3VsdCA9IDA7XG4gICAgICAgIGJ5dGUgYjtcblxuICAgICAgICBiID0gUmVhZEJ5dGUoKTtcbiAgICAgICAgcmVzdWx0ID0gKHVpbnQpKGIgJiAweDdmKTtcblxuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgICAgICAgaWYgKChiICYgMHg4MCkgIT0gMCkge1xuICAgICAgICAgICAgICAgIGIgPSBSZWFkQnl0ZSgpO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9ICh1aW50KSggKHJlc3VsdCA8PCA3KSArIChiICYgMHg3ZikgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoaW50KXJlc3VsdDtcbiAgICB9XG5cbiAgICAvKiogU2tpcCBvdmVyIHRoZSBnaXZlbiBudW1iZXIgb2YgYnl0ZXMgKi8gXG4gICAgcHVibGljIHZvaWQgU2tpcChpbnQgYW1vdW50KSB7XG4gICAgICAgIGNoZWNrUmVhZChhbW91bnQpO1xuICAgICAgICBwYXJzZV9vZmZzZXQgKz0gYW1vdW50O1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIGN1cnJlbnQgcGFyc2Ugb2Zmc2V0ICovXG4gICAgcHVibGljIGludCBHZXRPZmZzZXQoKSB7XG4gICAgICAgIHJldHVybiBwYXJzZV9vZmZzZXQ7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgcmF3IG1pZGkgZmlsZSBieXRlIGRhdGEgKi9cbiAgICBwdWJsaWMgYnl0ZVtdIEdldERhdGEoKSB7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbn1cblxufSBcblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDEyIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbi8qKiBAY2xhc3MgTWlkaU5vdGVcbiAqIEEgTWlkaU5vdGUgY29udGFpbnNcbiAqXG4gKiBzdGFydHRpbWUgLSBUaGUgdGltZSAobWVhc3VyZWQgaW4gcHVsc2VzKSB3aGVuIHRoZSBub3RlIGlzIHByZXNzZWQuXG4gKiBjaGFubmVsICAgLSBUaGUgY2hhbm5lbCB0aGUgbm90ZSBpcyBmcm9tLiAgVGhpcyBpcyB1c2VkIHdoZW4gbWF0Y2hpbmdcbiAqICAgICAgICAgICAgIE5vdGVPZmYgZXZlbnRzIHdpdGggdGhlIGNvcnJlc3BvbmRpbmcgTm90ZU9uIGV2ZW50LlxuICogICAgICAgICAgICAgVGhlIGNoYW5uZWxzIGZvciB0aGUgTm90ZU9uIGFuZCBOb3RlT2ZmIGV2ZW50cyBtdXN0IGJlXG4gKiAgICAgICAgICAgICB0aGUgc2FtZS5cbiAqIG5vdGVudW1iZXIgLSBUaGUgbm90ZSBudW1iZXIsIGZyb20gMCB0byAxMjcuICBNaWRkbGUgQyBpcyA2MC5cbiAqIGR1cmF0aW9uICAtIFRoZSB0aW1lIGR1cmF0aW9uIChtZWFzdXJlZCBpbiBwdWxzZXMpIGFmdGVyIHdoaWNoIHRoZSBcbiAqICAgICAgICAgICAgIG5vdGUgaXMgcmVsZWFzZWQuXG4gKlxuICogQSBNaWRpTm90ZSBpcyBjcmVhdGVkIHdoZW4gd2UgZW5jb3VudGVyIGEgTm90ZU9mZiBldmVudC4gIFRoZSBkdXJhdGlvblxuICogaXMgaW5pdGlhbGx5IHVua25vd24gKHNldCB0byAwKS4gIFdoZW4gdGhlIGNvcnJlc3BvbmRpbmcgTm90ZU9mZiBldmVudFxuICogaXMgZm91bmQsIHRoZSBkdXJhdGlvbiBpcyBzZXQgYnkgdGhlIG1ldGhvZCBOb3RlT2ZmKCkuXG4gKi9cbnB1YmxpYyBjbGFzcyBNaWRpTm90ZSA6IElDb21wYXJlcjxNaWRpTm90ZT4ge1xuICAgIHByaXZhdGUgaW50IHN0YXJ0dGltZTsgICAvKiogVGhlIHN0YXJ0IHRpbWUsIGluIHB1bHNlcyAqL1xuICAgIHByaXZhdGUgaW50IGNoYW5uZWw7ICAgICAvKiogVGhlIGNoYW5uZWwgKi9cbiAgICBwcml2YXRlIGludCBub3RlbnVtYmVyOyAgLyoqIFRoZSBub3RlLCBmcm9tIDAgdG8gMTI3LiBNaWRkbGUgQyBpcyA2MCAqL1xuICAgIHByaXZhdGUgaW50IGR1cmF0aW9uOyAgICAvKiogVGhlIGR1cmF0aW9uLCBpbiBwdWxzZXMgKi9cblxuXG4gICAgLyogQ3JlYXRlIGEgbmV3IE1pZGlOb3RlLiAgVGhpcyBpcyBjYWxsZWQgd2hlbiBhIE5vdGVPbiBldmVudCBpc1xuICAgICAqIGVuY291bnRlcmVkIGluIHRoZSBNaWRpRmlsZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgTWlkaU5vdGUoaW50IHN0YXJ0dGltZSwgaW50IGNoYW5uZWwsIGludCBub3RlbnVtYmVyLCBpbnQgZHVyYXRpb24pIHtcbiAgICAgICAgdGhpcy5zdGFydHRpbWUgPSBzdGFydHRpbWU7XG4gICAgICAgIHRoaXMuY2hhbm5lbCA9IGNoYW5uZWw7XG4gICAgICAgIHRoaXMubm90ZW51bWJlciA9IG5vdGVudW1iZXI7XG4gICAgICAgIHRoaXMuZHVyYXRpb24gPSBkdXJhdGlvbjtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBpbnQgU3RhcnRUaW1lIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHN0YXJ0dGltZTsgfVxuICAgICAgICBzZXQgeyBzdGFydHRpbWUgPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIHB1YmxpYyBpbnQgRW5kVGltZSB7XG4gICAgICAgIGdldCB7IHJldHVybiBzdGFydHRpbWUgKyBkdXJhdGlvbjsgfVxuICAgIH1cblxuICAgIHB1YmxpYyBpbnQgQ2hhbm5lbCB7XG4gICAgICAgIGdldCB7IHJldHVybiBjaGFubmVsOyB9XG4gICAgICAgIHNldCB7IGNoYW5uZWwgPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIHB1YmxpYyBpbnQgTnVtYmVyIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIG5vdGVudW1iZXI7IH1cbiAgICAgICAgc2V0IHsgbm90ZW51bWJlciA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgcHVibGljIGludCBEdXJhdGlvbiB7XG4gICAgICAgIGdldCB7IHJldHVybiBkdXJhdGlvbjsgfVxuICAgICAgICBzZXQgeyBkdXJhdGlvbiA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgLyogQSBOb3RlT2ZmIGV2ZW50IG9jY3VycyBmb3IgdGhpcyBub3RlIGF0IHRoZSBnaXZlbiB0aW1lLlxuICAgICAqIENhbGN1bGF0ZSB0aGUgbm90ZSBkdXJhdGlvbiBiYXNlZCBvbiB0aGUgbm90ZW9mZiBldmVudC5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBOb3RlT2ZmKGludCBlbmR0aW1lKSB7XG4gICAgICAgIGR1cmF0aW9uID0gZW5kdGltZSAtIHN0YXJ0dGltZTtcbiAgICB9XG5cbiAgICAvKiogQ29tcGFyZSB0d28gTWlkaU5vdGVzIGJhc2VkIG9uIHRoZWlyIHN0YXJ0IHRpbWVzLlxuICAgICAqICBJZiB0aGUgc3RhcnQgdGltZXMgYXJlIGVxdWFsLCBjb21wYXJlIGJ5IHRoZWlyIG51bWJlcnMuXG4gICAgICovXG4gICAgcHVibGljIGludCBDb21wYXJlKE1pZGlOb3RlIHgsIE1pZGlOb3RlIHkpIHtcbiAgICAgICAgaWYgKHguU3RhcnRUaW1lID09IHkuU3RhcnRUaW1lKVxuICAgICAgICAgICAgcmV0dXJuIHguTnVtYmVyIC0geS5OdW1iZXI7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB4LlN0YXJ0VGltZSAtIHkuU3RhcnRUaW1lO1xuICAgIH1cblxuXG4gICAgcHVibGljIE1pZGlOb3RlIENsb25lKCkge1xuICAgICAgICByZXR1cm4gbmV3IE1pZGlOb3RlKHN0YXJ0dGltZSwgY2hhbm5lbCwgbm90ZW51bWJlciwgZHVyYXRpb24pO1xuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBcbiAgICBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHN0cmluZ1tdIHNjYWxlID0geyBcIkFcIiwgXCJBI1wiLCBcIkJcIiwgXCJDXCIsIFwiQyNcIiwgXCJEXCIsIFwiRCNcIiwgXCJFXCIsIFwiRlwiLCBcIkYjXCIsIFwiR1wiLCBcIkcjXCIgfTtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJNaWRpTm90ZSBjaGFubmVsPXswfSBudW1iZXI9ezF9IHsyfSBzdGFydD17M30gZHVyYXRpb249ezR9XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5uZWwsIG5vdGVudW1iZXIsIHNjYWxlWyhub3RlbnVtYmVyICsgMykgJSAxMl0sIHN0YXJ0dGltZSwgZHVyYXRpb24pO1xuXG4gICAgfVxuXG59XG5cblxufSAgLyogRW5kIG5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyAqL1xuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTMgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbi8qKiBAY2xhc3MgTWlkaU9wdGlvbnNcbiAqXG4gKiBUaGUgTWlkaU9wdGlvbnMgY2xhc3MgY29udGFpbnMgdGhlIGF2YWlsYWJsZSBvcHRpb25zIGZvclxuICogbW9kaWZ5aW5nIHRoZSBzaGVldCBtdXNpYyBhbmQgc291bmQuICBUaGVzZSBvcHRpb25zIGFyZVxuICogY29sbGVjdGVkIGZyb20gdGhlIG1lbnUvZGlhbG9nIHNldHRpbmdzLCBhbmQgdGhlbiBhcmUgcGFzc2VkXG4gKiB0byB0aGUgU2hlZXRNdXNpYyBhbmQgTWlkaVBsYXllciBjbGFzc2VzLlxuICovXG5wdWJsaWMgY2xhc3MgTWlkaU9wdGlvbnMge1xuXG4gICAgLy8gVGhlIHBvc3NpYmxlIHZhbHVlcyBmb3Igc2hvd05vdGVMZXR0ZXJzXG4gICAgcHVibGljIGNvbnN0IGludCBOb3RlTmFtZU5vbmUgICAgICAgICAgID0gMDtcbiAgICBwdWJsaWMgY29uc3QgaW50IE5vdGVOYW1lTGV0dGVyICAgICAgICAgPSAxO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTm90ZU5hbWVGaXhlZERvUmVNaSAgICA9IDI7XG4gICAgcHVibGljIGNvbnN0IGludCBOb3RlTmFtZU1vdmFibGVEb1JlTWkgID0gMztcbiAgICBwdWJsaWMgY29uc3QgaW50IE5vdGVOYW1lRml4ZWROdW1iZXIgICAgPSA0O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTm90ZU5hbWVNb3ZhYmxlTnVtYmVyICA9IDU7XG5cbiAgICAvLyBTaGVldCBNdXNpYyBPcHRpb25zXG4gICAgcHVibGljIHN0cmluZyBmaWxlbmFtZTsgICAgICAgLyoqIFRoZSBmdWxsIE1pZGkgZmlsZW5hbWUgKi9cbiAgICBwdWJsaWMgc3RyaW5nIHRpdGxlOyAgICAgICAgICAvKiogVGhlIE1pZGkgc29uZyB0aXRsZSAqL1xuICAgIHB1YmxpYyBib29sW10gdHJhY2tzOyAgICAgICAgIC8qKiBXaGljaCB0cmFja3MgdG8gZGlzcGxheSAodHJ1ZSA9IGRpc3BsYXkpICovXG4gICAgcHVibGljIGJvb2wgc2Nyb2xsVmVydDsgICAgICAgLyoqIFdoZXRoZXIgdG8gc2Nyb2xsIHZlcnRpY2FsbHkgb3IgaG9yaXpvbnRhbGx5ICovXG4gICAgcHVibGljIGJvb2wgbGFyZ2VOb3RlU2l6ZTsgICAgLyoqIERpc3BsYXkgbGFyZ2Ugb3Igc21hbGwgbm90ZSBzaXplcyAqL1xuICAgIHB1YmxpYyBib29sIHR3b1N0YWZmczsgICAgICAgIC8qKiBDb21iaW5lIHRyYWNrcyBpbnRvIHR3byBzdGFmZnMgPyAqL1xuICAgIHB1YmxpYyBpbnQgc2hvd05vdGVMZXR0ZXJzOyAgICAgLyoqIFNob3cgdGhlIG5hbWUgKEEsIEEjLCBldGMpIG5leHQgdG8gdGhlIG5vdGVzICovXG4gICAgcHVibGljIGJvb2wgc2hvd0x5cmljczsgICAgICAgLyoqIFNob3cgdGhlIGx5cmljcyB1bmRlciBlYWNoIG5vdGUgKi9cbiAgICBwdWJsaWMgYm9vbCBzaG93TWVhc3VyZXM7ICAgICAvKiogU2hvdyB0aGUgbWVhc3VyZSBudW1iZXJzIGZvciBlYWNoIHN0YWZmICovXG4gICAgcHVibGljIGludCBzaGlmdHRpbWU7ICAgICAgICAgLyoqIFNoaWZ0IG5vdGUgc3RhcnR0aW1lcyBieSB0aGUgZ2l2ZW4gYW1vdW50ICovXG4gICAgcHVibGljIGludCB0cmFuc3Bvc2U7ICAgICAgICAgLyoqIFNoaWZ0IG5vdGUga2V5IHVwL2Rvd24gYnkgZ2l2ZW4gYW1vdW50ICovXG4gICAgcHVibGljIGludCBrZXk7ICAgICAgICAgICAgICAgLyoqIFVzZSB0aGUgZ2l2ZW4gS2V5U2lnbmF0dXJlIChub3Rlc2NhbGUpICovXG4gICAgcHVibGljIFRpbWVTaWduYXR1cmUgdGltZTsgICAgLyoqIFVzZSB0aGUgZ2l2ZW4gdGltZSBzaWduYXR1cmUgKi9cbiAgICBwdWJsaWMgaW50IGNvbWJpbmVJbnRlcnZhbDsgICAvKiogQ29tYmluZSBub3RlcyB3aXRoaW4gZ2l2ZW4gdGltZSBpbnRlcnZhbCAobXNlYykgKi9cbiAgICBwdWJsaWMgQ29sb3JbXSBjb2xvcnM7ICAgICAgICAvKiogVGhlIG5vdGUgY29sb3JzIHRvIHVzZSAqL1xuICAgIHB1YmxpYyBDb2xvciBzaGFkZUNvbG9yOyAgICAgIC8qKiBUaGUgY29sb3IgdG8gdXNlIGZvciBzaGFkaW5nLiAqL1xuICAgIHB1YmxpYyBDb2xvciBzaGFkZTJDb2xvcjsgICAgIC8qKiBUaGUgY29sb3IgdG8gdXNlIGZvciBzaGFkaW5nIHRoZSBsZWZ0IGhhbmQgcGlhbm8gKi9cblxuICAgIC8vIFNvdW5kIG9wdGlvbnNcbiAgICBwdWJsaWMgYm9vbCBbXW11dGU7ICAgICAgICAgICAgLyoqIFdoaWNoIHRyYWNrcyB0byBtdXRlICh0cnVlID0gbXV0ZSkgKi9cbiAgICBwdWJsaWMgaW50IHRlbXBvOyAgICAgICAgICAgICAgLyoqIFRoZSB0ZW1wbywgaW4gbWljcm9zZWNvbmRzIHBlciBxdWFydGVyIG5vdGUgKi9cbiAgICBwdWJsaWMgaW50IHBhdXNlVGltZTsgICAgICAgICAgLyoqIFN0YXJ0IHRoZSBtaWRpIG11c2ljIGF0IHRoZSBnaXZlbiBwYXVzZSB0aW1lICovXG4gICAgcHVibGljIGludFtdIGluc3RydW1lbnRzOyAgICAgIC8qKiBUaGUgaW5zdHJ1bWVudHMgdG8gdXNlIHBlciB0cmFjayAqL1xuICAgIHB1YmxpYyBib29sIHVzZURlZmF1bHRJbnN0cnVtZW50czsgIC8qKiBJZiB0cnVlLCBkb24ndCBjaGFuZ2UgaW5zdHJ1bWVudHMgKi9cbiAgICBwdWJsaWMgYm9vbCBwbGF5TWVhc3VyZXNJbkxvb3A7ICAgICAvKiogUGxheSB0aGUgc2VsZWN0ZWQgbWVhc3VyZXMgaW4gYSBsb29wICovXG4gICAgcHVibGljIGludCBwbGF5TWVhc3VyZXNJbkxvb3BTdGFydDsgLyoqIFN0YXJ0IG1lYXN1cmUgdG8gcGxheSBpbiBsb29wICovXG4gICAgcHVibGljIGludCBwbGF5TWVhc3VyZXNJbkxvb3BFbmQ7ICAgLyoqIEVuZCBtZWFzdXJlIHRvIHBsYXkgaW4gbG9vcCAqL1xuXG5cbiAgICBwdWJsaWMgTWlkaU9wdGlvbnMoKSB7XG4gICAgfVxuXG4gICAgcHVibGljIE1pZGlPcHRpb25zKE1pZGlGaWxlIG1pZGlmaWxlKSB7XG4gICAgICAgIGZpbGVuYW1lID0gbWlkaWZpbGUuRmlsZU5hbWU7XG4gICAgICAgIHRpdGxlID0gUGF0aC5HZXRGaWxlTmFtZShtaWRpZmlsZS5GaWxlTmFtZSk7XG4gICAgICAgIGludCBudW10cmFja3MgPSBtaWRpZmlsZS5UcmFja3MuQ291bnQ7XG4gICAgICAgIHRyYWNrcyA9IG5ldyBib29sW251bXRyYWNrc107XG4gICAgICAgIG11dGUgPSAgbmV3IGJvb2xbbnVtdHJhY2tzXTtcbiAgICAgICAgaW5zdHJ1bWVudHMgPSBuZXcgaW50W251bXRyYWNrc107XG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgdHJhY2tzLkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0cmFja3NbaV0gPSB0cnVlO1xuICAgICAgICAgICAgbXV0ZVtpXSA9IGZhbHNlO1xuICAgICAgICAgICAgaW5zdHJ1bWVudHNbaV0gPSBtaWRpZmlsZS5UcmFja3NbaV0uSW5zdHJ1bWVudDtcbiAgICAgICAgICAgIGlmIChtaWRpZmlsZS5UcmFja3NbaV0uSW5zdHJ1bWVudE5hbWUgPT0gXCJQZXJjdXNzaW9uXCIpIHtcbiAgICAgICAgICAgICAgICB0cmFja3NbaV0gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBtdXRlW2ldID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBcbiAgICAgICAgdXNlRGVmYXVsdEluc3RydW1lbnRzID0gdHJ1ZTtcbiAgICAgICAgc2Nyb2xsVmVydCA9IHRydWU7XG4gICAgICAgIGxhcmdlTm90ZVNpemUgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRyYWNrcy5MZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgdHdvU3RhZmZzID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHR3b1N0YWZmcyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHNob3dOb3RlTGV0dGVycyA9IE5vdGVOYW1lTm9uZTtcbiAgICAgICAgc2hvd0x5cmljcyA9IHRydWU7XG4gICAgICAgIHNob3dNZWFzdXJlcyA9IGZhbHNlO1xuICAgICAgICBzaGlmdHRpbWUgPSAwO1xuICAgICAgICB0cmFuc3Bvc2UgPSAwO1xuICAgICAgICBrZXkgPSAtMTtcbiAgICAgICAgdGltZSA9IG1pZGlmaWxlLlRpbWU7XG4gICAgICAgIGNvbG9ycyA9IG51bGw7XG4gICAgICAgIHNoYWRlQ29sb3IgPSBDb2xvci5Gcm9tQXJnYigyMTAsIDIwNSwgMjIwKTtcbiAgICAgICAgc2hhZGUyQ29sb3IgPSBDb2xvci5Gcm9tQXJnYig4MCwgMTAwLCAyNTApO1xuICAgICAgICBjb21iaW5lSW50ZXJ2YWwgPSA0MDtcbiAgICAgICAgdGVtcG8gPSBtaWRpZmlsZS5UaW1lLlRlbXBvO1xuICAgICAgICBwYXVzZVRpbWUgPSAwO1xuICAgICAgICBwbGF5TWVhc3VyZXNJbkxvb3AgPSBmYWxzZTsgXG4gICAgICAgIHBsYXlNZWFzdXJlc0luTG9vcFN0YXJ0ID0gMDtcbiAgICAgICAgcGxheU1lYXN1cmVzSW5Mb29wRW5kID0gbWlkaWZpbGUuRW5kVGltZSgpIC8gbWlkaWZpbGUuVGltZS5NZWFzdXJlO1xuICAgIH1cblxuICAgIC8qIEpvaW4gdGhlIGFycmF5IGludG8gYSBjb21tYSBzZXBhcmF0ZWQgc3RyaW5nICovXG4gICAgc3RhdGljIHN0cmluZyBKb2luKGJvb2xbXSB2YWx1ZXMpIHtcbiAgICAgICAgU3RyaW5nQnVpbGRlciByZXN1bHQgPSBuZXcgU3RyaW5nQnVpbGRlcigpO1xuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHZhbHVlcy5MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LkFwcGVuZChcIixcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHQuQXBwZW5kKHZhbHVlc1tpXS5Ub1N0cmluZygpKTsgXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdC5Ub1N0cmluZygpO1xuICAgIH1cblxuICAgIHN0YXRpYyBzdHJpbmcgSm9pbihpbnRbXSB2YWx1ZXMpIHtcbiAgICAgICAgU3RyaW5nQnVpbGRlciByZXN1bHQgPSBuZXcgU3RyaW5nQnVpbGRlcigpO1xuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHZhbHVlcy5MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LkFwcGVuZChcIixcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHQuQXBwZW5kKHZhbHVlc1tpXS5Ub1N0cmluZygpKTsgXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdC5Ub1N0cmluZygpO1xuICAgIH1cblxuICAgIHN0YXRpYyBzdHJpbmcgSm9pbihDb2xvcltdIHZhbHVlcykge1xuICAgICAgICBTdHJpbmdCdWlsZGVyIHJlc3VsdCA9IG5ldyBTdHJpbmdCdWlsZGVyKCk7XG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgdmFsdWVzLkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQuQXBwZW5kKFwiLFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdC5BcHBlbmQoQ29sb3JUb1N0cmluZyh2YWx1ZXNbaV0pKTsgXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdC5Ub1N0cmluZygpO1xuICAgIH1cblxuICAgIHN0YXRpYyBzdHJpbmcgQ29sb3JUb1N0cmluZyhDb2xvciBjKSB7XG4gICAgICAgIHJldHVybiBcIlwiICsgYy5SICsgXCIgXCIgKyBjLkcgKyBcIiBcIiArIGMuQjtcbiAgICB9XG5cbiAgICAvKiBDb252ZXJ0IHRoaXMgTWlkaU9wdGlvbnMgb2JqZWN0IGludG8gYSBJTkkgZm9ybWF0dGVkIHNlY3Rpb24uXG4gICAgICogW3RpdGxlXVxuICAgICAqIGZpbGVuYW1lPUM6L3BhdGgvdG8vZmlsZS5taWRcbiAgICAgKiB2ZXJzaW9uPTIuNVxuICAgICAqIHRyYWNrcz10cnVlLGZhbHNlLHRydWVcbiAgICAgKiBtdXRlPXRydWUsZmFsc2UsdHJ1ZVxuICAgICAqIGluc3RydW1lbnRzPTI0LDEsNTJcbiAgICAgKiB1c2VEZWZhdWx0SW5zdHJ1bWVudHM9dHJ1ZVxuICAgICAqIHRpbWU9Myw0LDcyMCwxMDAwMCAgICAvLyBudW1lcmF0b3IsZGVub21pbmF0b3IscXVhcnRlcix0ZW1wb1xuICAgICAqIHNjcm9sbFZlcnQ9dHJ1ZVxuICAgICAqIGxhcmdlTm90ZVNpemU9ZmFsc2VcbiAgICAgKiBzaG93THlyaWNzPXRydWVcbiAgICAgKiB0d29TdGFmZnM9dHJ1ZVxuICAgICAqIHNob3dOb3RlTGV0dGVycz10cnVlXG4gICAgICogdHJhbnNwb3NlPS0yXG4gICAgICoga2V5PTEgICAgICAgICAgICAgICAvLyBLZXkgc2lnbmF0dXJlIChOb3RlU2NhbGUuTilcbiAgICAgKiBjb21iaW5lSW50ZXJ2YWw9ODBcbiAgICAgKiBzaG93TWVhc3VyZXM9dHJ1ZVxuICAgICAqIHBsYXlNZWFzdXJlc0luTG9vcD1mYWxzZVxuICAgICAqIHBsYXlNZWFzdXJlc0luTG9vcFN0YXJ0PTJcbiAgICAgKiBwbGF5TWVhc3VyZXNJbkxvb3BFbmQ9MTBcbiAgICAgKiBzaGFkZUNvbG9yPTI0NCAxNTkgMjQgICAvLyBSIEcgQlxuICAgICAqIHNoYWRlMkNvbG9yPTI0NCAxNTkgMjQgICAvLyBSIEcgQlxuICAgICAqIGNvbG9ycz0yNDQgMTU5IDI0LCAyNTMgOTIgMTQzLCAuLi5cbiAgICAgKi9cbiAgICAvKnB1YmxpYyBTZWN0aW9uSU5JIFRvSU5JKCkge1xuICAgICAgICBTZWN0aW9uSU5JIHNlY3Rpb24gPSBuZXcgU2VjdGlvbklOSSgpO1xuICAgICAgICBzZWN0aW9uLlNlY3Rpb24gPSB0aXRsZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHNlY3Rpb24uUHJvcGVydGllc1tcImZpbGVuYW1lXCJdID0gZmlsZW5hbWU7XG4gICAgICAgICAgICBzZWN0aW9uLlByb3BlcnRpZXNbXCJ2ZXJzaW9uXCJdID0gXCIyLjYuMFwiO1xuICAgICAgICAgICAgc2VjdGlvbi5Qcm9wZXJ0aWVzW1widHJhY2tzXCJdID0gSm9pbih0cmFja3MpO1xuICAgICAgICAgICAgc2VjdGlvbi5Qcm9wZXJ0aWVzW1wibXV0ZVwiXSA9IEpvaW4obXV0ZSk7XG4gICAgICAgICAgICBzZWN0aW9uLlByb3BlcnRpZXNbXCJpbnN0cnVtZW50c1wiXSA9IEpvaW4oaW5zdHJ1bWVudHMpO1xuICAgICAgICAgICAgc2VjdGlvbi5Qcm9wZXJ0aWVzW1widXNlRGVmYXVsdEluc3RydW1lbnRzXCJdID0gdXNlRGVmYXVsdEluc3RydW1lbnRzLlRvU3RyaW5nKCk7XG4gICAgICAgICAgICBpZiAodGltZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaW50W10gdmFsdWVzID0geyB0aW1lLk51bWVyYXRvciwgdGltZS5EZW5vbWluYXRvciwgdGltZS5RdWFydGVyLCB0aW1lLlRlbXBvIH07XG4gICAgICAgICAgICAgICAgc2VjdGlvbi5Qcm9wZXJ0aWVzW1widGltZVwiXSA9IEpvaW4odmFsdWVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlY3Rpb24uUHJvcGVydGllc1tcInNjcm9sbFZlcnRcIl0gPSBzY3JvbGxWZXJ0LlRvU3RyaW5nKCk7XG4gICAgICAgICAgICBzZWN0aW9uLlByb3BlcnRpZXNbXCJsYXJnZU5vdGVTaXplXCJdID0gbGFyZ2VOb3RlU2l6ZS5Ub1N0cmluZygpO1xuICAgICAgICAgICAgc2VjdGlvbi5Qcm9wZXJ0aWVzW1wic2hvd0x5cmljc1wiXSA9IHNob3dMeXJpY3MuVG9TdHJpbmcoKTtcbiAgICAgICAgICAgIHNlY3Rpb24uUHJvcGVydGllc1tcInR3b1N0YWZmc1wiXSA9IHR3b1N0YWZmcy5Ub1N0cmluZygpO1xuICAgICAgICAgICAgc2VjdGlvbi5Qcm9wZXJ0aWVzW1wic2hvd05vdGVMZXR0ZXJzXCJdID0gc2hvd05vdGVMZXR0ZXJzLlRvU3RyaW5nKCk7XG4gICAgICAgICAgICBzZWN0aW9uLlByb3BlcnRpZXNbXCJ0cmFuc3Bvc2VcIl0gPSB0cmFuc3Bvc2UuVG9TdHJpbmcoKTtcbiAgICAgICAgICAgIHNlY3Rpb24uUHJvcGVydGllc1tcImtleVwiXSA9IGtleS5Ub1N0cmluZygpO1xuICAgICAgICAgICAgc2VjdGlvbi5Qcm9wZXJ0aWVzW1wiY29tYmluZUludGVydmFsXCJdID0gY29tYmluZUludGVydmFsLlRvU3RyaW5nKCk7XG4gICAgICAgICAgICBzZWN0aW9uLlByb3BlcnRpZXNbXCJzaGFkZUNvbG9yXCJdID0gQ29sb3JUb1N0cmluZyhzaGFkZUNvbG9yKTtcbiAgICAgICAgICAgIHNlY3Rpb24uUHJvcGVydGllc1tcInNoYWRlMkNvbG9yXCJdID0gQ29sb3JUb1N0cmluZyhzaGFkZTJDb2xvcik7XG4gICAgICAgICAgICBpZiAoY29sb3JzICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBzZWN0aW9uLlByb3BlcnRpZXNbXCJjb2xvcnNcIl0gPSBKb2luKGNvbG9ycyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWN0aW9uLlByb3BlcnRpZXNbXCJzaG93TWVhc3VyZXNcIl0gPSBzaG93TWVhc3VyZXMuVG9TdHJpbmcoKTtcbiAgICAgICAgICAgIHNlY3Rpb24uUHJvcGVydGllc1tcInBsYXlNZWFzdXJlc0luTG9vcFwiXSA9IHBsYXlNZWFzdXJlc0luTG9vcC5Ub1N0cmluZygpO1xuICAgICAgICAgICAgc2VjdGlvbi5Qcm9wZXJ0aWVzW1wicGxheU1lYXN1cmVzSW5Mb29wU3RhcnRcIl0gPSBwbGF5TWVhc3VyZXNJbkxvb3BTdGFydC5Ub1N0cmluZygpO1xuICAgICAgICAgICAgc2VjdGlvbi5Qcm9wZXJ0aWVzW1wicGxheU1lYXN1cmVzSW5Mb29wRW5kXCJdID0gcGxheU1lYXN1cmVzSW5Mb29wRW5kLlRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKEV4Y2VwdGlvbiBlKSB7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNlY3Rpb247XG4gICAgfSovXG5cblxuICAgIC8qIEluaXRpYWxpemUgYSBNaWRpT3B0aW9ucyBmcm9tIHRoZSBzZWN0aW9uIHByb3BlcnRpZXMgb2YgYW4gSU5JIHRleHQgZmlsZSAqL1xuICAgIC8qcHVibGljIE1pZGlPcHRpb25zKFNlY3Rpb25JTkkgc2VjdGlvbikge1xuICAgICAgICB0aXRsZSA9IHNlY3Rpb24uU2VjdGlvbjtcbiAgICAgICAgZmlsZW5hbWUgPSBzZWN0aW9uLkdldFN0cmluZyhcImZpbGVuYW1lXCIpO1xuICAgICAgICB0cmFja3MgPSBzZWN0aW9uLkdldEJvb2xBcnJheShcInRyYWNrc1wiKTtcbiAgICAgICAgbXV0ZSA9IHNlY3Rpb24uR2V0Qm9vbEFycmF5KFwibXV0ZVwiKTtcbiAgICAgICAgaWYgKG11dGUgICE9IG51bGwgJiYgc2VjdGlvbi5Qcm9wZXJ0aWVzW1widmVyc2lvblwiXSA9PSBcIjIuNS4wXCIpIHtcbiAgICAgICAgICAgIC8vIE1pZGlTaGVldE11c2ljIDIuNSBzdG9yZWQgdGhlIG11dGUgdmFsdWUgaW5jb3JyZWN0bHlcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgbXV0ZS5MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIG11dGVbaV0gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGluc3RydW1lbnRzID0gc2VjdGlvbi5HZXRJbnRBcnJheShcImluc3RydW1lbnRzXCIpO1xuICAgICAgICBpbnRbXSB0aW1lc2lnID0gc2VjdGlvbi5HZXRJbnRBcnJheShcInRpbWVcIik7XG4gICAgICAgIGlmICh0aW1lc2lnICE9IG51bGwgJiYgdGltZXNpZy5MZW5ndGggPT0gNCkge1xuICAgICAgICAgICAgdGltZSA9IG5ldyBUaW1lU2lnbmF0dXJlKHRpbWVzaWdbMF0sIHRpbWVzaWdbMV0sIHRpbWVzaWdbMl0sIHRpbWVzaWdbM10pO1xuICAgICAgICB9XG4gICAgICAgIHVzZURlZmF1bHRJbnN0cnVtZW50cyA9IHNlY3Rpb24uR2V0Qm9vbChcInVzZURlZmF1bHRJbnN0cnVtZW50c1wiKTtcbiAgICAgICAgc2Nyb2xsVmVydCA9IHNlY3Rpb24uR2V0Qm9vbChcInNjcm9sbFZlcnRcIik7XG4gICAgICAgIGxhcmdlTm90ZVNpemUgPSBzZWN0aW9uLkdldEJvb2woXCJsYXJnZU5vdGVTaXplXCIpO1xuICAgICAgICBzaG93THlyaWNzID0gc2VjdGlvbi5HZXRCb29sKFwic2hvd0x5cmljc1wiKTtcbiAgICAgICAgdHdvU3RhZmZzID0gc2VjdGlvbi5HZXRCb29sKFwidHdvU3RhZmZzXCIpO1xuICAgICAgICBzaG93Tm90ZUxldHRlcnMgPSBzZWN0aW9uLkdldEludChcInNob3dOb3RlTGV0dGVyc1wiKTtcbiAgICAgICAgdHJhbnNwb3NlID0gc2VjdGlvbi5HZXRJbnQoXCJ0cmFuc3Bvc2VcIik7XG4gICAgICAgIGtleSA9IHNlY3Rpb24uR2V0SW50KFwia2V5XCIpO1xuICAgICAgICBjb21iaW5lSW50ZXJ2YWwgPSBzZWN0aW9uLkdldEludChcImNvbWJpbmVJbnRlcnZhbFwiKTtcbiAgICAgICAgc2hvd01lYXN1cmVzID0gc2VjdGlvbi5HZXRCb29sKFwic2hvd01lYXN1cmVzXCIpO1xuICAgICAgICBwbGF5TWVhc3VyZXNJbkxvb3AgPSBzZWN0aW9uLkdldEJvb2woXCJwbGF5TWVhc3VyZXNJbkxvb3BcIik7XG4gICAgICAgIHBsYXlNZWFzdXJlc0luTG9vcFN0YXJ0ID0gc2VjdGlvbi5HZXRJbnQoXCJwbGF5TWVhc3VyZXNJbkxvb3BTdGFydFwiKTtcbiAgICAgICAgcGxheU1lYXN1cmVzSW5Mb29wRW5kID0gc2VjdGlvbi5HZXRJbnQoXCJwbGF5TWVhc3VyZXNJbkxvb3BFbmRcIik7XG5cbiAgICAgICAgQ29sb3IgY29sb3IgPSBzZWN0aW9uLkdldENvbG9yKFwic2hhZGVDb2xvclwiKTtcbiAgICAgICAgaWYgKGNvbG9yICE9IENvbG9yLldoaXRlKSB7XG4gICAgICAgICAgICBzaGFkZUNvbG9yID0gY29sb3I7XG4gICAgICAgIH1cbiAgICAgICAgY29sb3IgPSBzZWN0aW9uLkdldENvbG9yKFwic2hhZGUyQ29sb3JcIik7XG4gICAgICAgIGlmIChjb2xvciAhPSBDb2xvci5XaGl0ZSkge1xuICAgICAgICAgICAgc2hhZGUyQ29sb3IgPSBjb2xvcjtcbiAgICAgICAgfVxuICAgICAgICBjb2xvcnMgPSBzZWN0aW9uLkdldENvbG9yQXJyYXkoXCJjb2xvcnNcIik7XG4gICAgfSovXG5cbiAgICBcbiAgICAvKiBNZXJnZSBpbiB0aGUgc2F2ZWQgb3B0aW9ucyB0byB0aGlzIE1pZGlPcHRpb25zLiovXG4gICAgcHVibGljIHZvaWQgTWVyZ2UoTWlkaU9wdGlvbnMgc2F2ZWQpIHtcbiAgICAgICAgaWYgKHNhdmVkLnRyYWNrcyAhPSBudWxsICYmIHNhdmVkLnRyYWNrcy5MZW5ndGggPT0gdHJhY2tzLkxlbmd0aCkge1xuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCB0cmFja3MuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0cmFja3NbaV0gPSBzYXZlZC50cmFja3NbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNhdmVkLm11dGUgIT0gbnVsbCAmJiBzYXZlZC5tdXRlLkxlbmd0aCA9PSBtdXRlLkxlbmd0aCkge1xuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBtdXRlLkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbXV0ZVtpXSA9IHNhdmVkLm11dGVbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNhdmVkLmluc3RydW1lbnRzICE9IG51bGwgJiYgc2F2ZWQuaW5zdHJ1bWVudHMuTGVuZ3RoID09IGluc3RydW1lbnRzLkxlbmd0aCkge1xuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBpbnN0cnVtZW50cy5MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGluc3RydW1lbnRzW2ldID0gc2F2ZWQuaW5zdHJ1bWVudHNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNhdmVkLnRpbWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGltZSA9IG5ldyBUaW1lU2lnbmF0dXJlKHNhdmVkLnRpbWUuTnVtZXJhdG9yLCBzYXZlZC50aW1lLkRlbm9taW5hdG9yLFxuICAgICAgICAgICAgICAgICAgICBzYXZlZC50aW1lLlF1YXJ0ZXIsIHNhdmVkLnRpbWUuVGVtcG8pO1xuICAgICAgICB9XG4gICAgICAgIHVzZURlZmF1bHRJbnN0cnVtZW50cyA9IHNhdmVkLnVzZURlZmF1bHRJbnN0cnVtZW50cztcbiAgICAgICAgc2Nyb2xsVmVydCA9IHNhdmVkLnNjcm9sbFZlcnQ7XG4gICAgICAgIGxhcmdlTm90ZVNpemUgPSBzYXZlZC5sYXJnZU5vdGVTaXplO1xuICAgICAgICBzaG93THlyaWNzID0gc2F2ZWQuc2hvd0x5cmljcztcbiAgICAgICAgdHdvU3RhZmZzID0gc2F2ZWQudHdvU3RhZmZzO1xuICAgICAgICBzaG93Tm90ZUxldHRlcnMgPSBzYXZlZC5zaG93Tm90ZUxldHRlcnM7XG4gICAgICAgIHRyYW5zcG9zZSA9IHNhdmVkLnRyYW5zcG9zZTtcbiAgICAgICAga2V5ID0gc2F2ZWQua2V5O1xuICAgICAgICBjb21iaW5lSW50ZXJ2YWwgPSBzYXZlZC5jb21iaW5lSW50ZXJ2YWw7XG4gICAgICAgIGlmIChzYXZlZC5zaGFkZUNvbG9yICE9IENvbG9yLldoaXRlKSB7XG4gICAgICAgICAgICBzaGFkZUNvbG9yID0gc2F2ZWQuc2hhZGVDb2xvcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2F2ZWQuc2hhZGUyQ29sb3IgIT0gQ29sb3IuV2hpdGUpIHtcbiAgICAgICAgICAgIHNoYWRlMkNvbG9yID0gc2F2ZWQuc2hhZGUyQ29sb3I7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNhdmVkLmNvbG9ycyAhPSBudWxsKSB7XG4gICAgICAgICAgICBjb2xvcnMgPSBzYXZlZC5jb2xvcnM7XG4gICAgICAgIH1cbiAgICAgICAgc2hvd01lYXN1cmVzID0gc2F2ZWQuc2hvd01lYXN1cmVzO1xuICAgICAgICBwbGF5TWVhc3VyZXNJbkxvb3AgPSBzYXZlZC5wbGF5TWVhc3VyZXNJbkxvb3A7XG4gICAgICAgIHBsYXlNZWFzdXJlc0luTG9vcFN0YXJ0ID0gc2F2ZWQucGxheU1lYXN1cmVzSW5Mb29wU3RhcnQ7XG4gICAgICAgIHBsYXlNZWFzdXJlc0luTG9vcEVuZCA9IHNhdmVkLnBsYXlNZWFzdXJlc0luTG9vcEVuZDtcbiAgICB9XG59XG5cbn1cblxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTIgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIEBjbGFzcyBNaWRpVHJhY2tcbiAqIFRoZSBNaWRpVHJhY2sgdGFrZXMgYXMgaW5wdXQgdGhlIHJhdyBNaWRpRXZlbnRzIGZvciB0aGUgdHJhY2ssIGFuZCBnZXRzOlxuICogLSBUaGUgbGlzdCBvZiBtaWRpIG5vdGVzIGluIHRoZSB0cmFjay5cbiAqIC0gVGhlIGZpcnN0IGluc3RydW1lbnQgdXNlZCBpbiB0aGUgdHJhY2suXG4gKlxuICogRm9yIGVhY2ggTm90ZU9uIGV2ZW50IGluIHRoZSBtaWRpIGZpbGUsIGEgbmV3IE1pZGlOb3RlIGlzIGNyZWF0ZWRcbiAqIGFuZCBhZGRlZCB0byB0aGUgdHJhY2ssIHVzaW5nIHRoZSBBZGROb3RlKCkgbWV0aG9kLlxuICogXG4gKiBUaGUgTm90ZU9mZigpIG1ldGhvZCBpcyBjYWxsZWQgd2hlbiBhIE5vdGVPZmYgZXZlbnQgaXMgZW5jb3VudGVyZWQsXG4gKiBpbiBvcmRlciB0byB1cGRhdGUgdGhlIGR1cmF0aW9uIG9mIHRoZSBNaWRpTm90ZS5cbiAqLyBcbnB1YmxpYyBjbGFzcyBNaWRpVHJhY2sge1xuICAgIHByaXZhdGUgaW50IHRyYWNrbnVtOyAgICAgICAgICAgICAvKiogVGhlIHRyYWNrIG51bWJlciAqL1xuICAgIHByaXZhdGUgTGlzdDxNaWRpTm90ZT4gbm90ZXM7ICAgICAvKiogTGlzdCBvZiBNaWRpIG5vdGVzICovXG4gICAgcHJpdmF0ZSBpbnQgaW5zdHJ1bWVudDsgICAgICAgICAgIC8qKiBJbnN0cnVtZW50IGZvciB0aGlzIHRyYWNrICovXG4gICAgcHJpdmF0ZSBMaXN0PE1pZGlFdmVudD4gbHlyaWNzOyAgIC8qKiBUaGUgbHlyaWNzIGluIHRoaXMgdHJhY2sgKi9cblxuICAgIC8qKiBDcmVhdGUgYW4gZW1wdHkgTWlkaVRyYWNrLiAgVXNlZCBieSB0aGUgQ2xvbmUgbWV0aG9kICovXG4gICAgcHVibGljIE1pZGlUcmFjayhpbnQgdHJhY2tudW0pIHtcbiAgICAgICAgdGhpcy50cmFja251bSA9IHRyYWNrbnVtO1xuICAgICAgICBub3RlcyA9IG5ldyBMaXN0PE1pZGlOb3RlPigyMCk7XG4gICAgICAgIGluc3RydW1lbnQgPSAwO1xuICAgIH0gXG5cbiAgICAvKiogQ3JlYXRlIGEgTWlkaVRyYWNrIGJhc2VkIG9uIHRoZSBNaWRpIGV2ZW50cy4gIEV4dHJhY3QgdGhlIE5vdGVPbi9Ob3RlT2ZmXG4gICAgICogIGV2ZW50cyB0byBnYXRoZXIgdGhlIGxpc3Qgb2YgTWlkaU5vdGVzLlxuICAgICAqL1xuICAgIHB1YmxpYyBNaWRpVHJhY2soTGlzdDxNaWRpRXZlbnQ+IGV2ZW50cywgaW50IHRyYWNrbnVtKSB7XG4gICAgICAgIHRoaXMudHJhY2tudW0gPSB0cmFja251bTtcbiAgICAgICAgbm90ZXMgPSBuZXcgTGlzdDxNaWRpTm90ZT4oZXZlbnRzLkNvdW50KTtcbiAgICAgICAgaW5zdHJ1bWVudCA9IDA7XG4gXG4gICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBtZXZlbnQgaW4gZXZlbnRzKSB7XG4gICAgICAgICAgICBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBNaWRpRmlsZS5FdmVudE5vdGVPbiAmJiBtZXZlbnQuVmVsb2NpdHkgPiAwKSB7XG4gICAgICAgICAgICAgICAgTWlkaU5vdGUgbm90ZSA9IG5ldyBNaWRpTm90ZShtZXZlbnQuU3RhcnRUaW1lLCBtZXZlbnQuQ2hhbm5lbCwgbWV2ZW50Lk5vdGVudW1iZXIsIDApO1xuICAgICAgICAgICAgICAgIEFkZE5vdGUobm90ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IE1pZGlGaWxlLkV2ZW50Tm90ZU9uICYmIG1ldmVudC5WZWxvY2l0eSA9PSAwKSB7XG4gICAgICAgICAgICAgICAgTm90ZU9mZihtZXZlbnQuQ2hhbm5lbCwgbWV2ZW50Lk5vdGVudW1iZXIsIG1ldmVudC5TdGFydFRpbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBNaWRpRmlsZS5FdmVudE5vdGVPZmYpIHtcbiAgICAgICAgICAgICAgICBOb3RlT2ZmKG1ldmVudC5DaGFubmVsLCBtZXZlbnQuTm90ZW51bWJlciwgbWV2ZW50LlN0YXJ0VGltZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IE1pZGlGaWxlLkV2ZW50UHJvZ3JhbUNoYW5nZSkge1xuICAgICAgICAgICAgICAgIGluc3RydW1lbnQgPSBtZXZlbnQuSW5zdHJ1bWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5NZXRhZXZlbnQgPT0gTWlkaUZpbGUuTWV0YUV2ZW50THlyaWMpIHtcbiAgICAgICAgICAgICAgICBBZGRMeXJpYyhtZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChub3Rlcy5Db3VudCA+IDAgJiYgbm90ZXNbMF0uQ2hhbm5lbCA9PSA5KSAge1xuICAgICAgICAgICAgaW5zdHJ1bWVudCA9IDEyODsgIC8qIFBlcmN1c3Npb24gKi9cbiAgICAgICAgfVxuICAgICAgICBpbnQgbHlyaWNjb3VudCA9IDA7XG4gICAgICAgIGlmIChseXJpY3MgIT0gbnVsbCkgeyBseXJpY2NvdW50ID0gbHlyaWNzLkNvdW50OyB9XG4gICAgfVxuXG4gICAgcHVibGljIGludCBOdW1iZXIge1xuICAgICAgICBnZXQgeyByZXR1cm4gdHJhY2tudW07IH1cbiAgICB9XG5cbiAgICBwdWJsaWMgTGlzdDxNaWRpTm90ZT4gTm90ZXMge1xuICAgICAgICBnZXQgeyByZXR1cm4gbm90ZXM7IH1cbiAgICB9XG5cbiAgICBwdWJsaWMgaW50IEluc3RydW1lbnQge1xuICAgICAgICBnZXQgeyByZXR1cm4gaW5zdHJ1bWVudDsgfVxuICAgICAgICBzZXQgeyBpbnN0cnVtZW50ID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RyaW5nIEluc3RydW1lbnROYW1lIHtcbiAgICAgICAgZ2V0IHsgaWYgKGluc3RydW1lbnQgPj0gMCAmJiBpbnN0cnVtZW50IDw9IDEyOClcbiAgICAgICAgICAgICAgICAgIHJldHVybiBNaWRpRmlsZS5JbnN0cnVtZW50c1tpbnN0cnVtZW50XTtcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIExpc3Q8TWlkaUV2ZW50PiBMeXJpY3Mge1xuICAgICAgICBnZXQgeyByZXR1cm4gbHlyaWNzOyB9XG4gICAgICAgIHNldCB7IGx5cmljcyA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgLyoqIEFkZCBhIE1pZGlOb3RlIHRvIHRoaXMgdHJhY2suICBUaGlzIGlzIGNhbGxlZCBmb3IgZWFjaCBOb3RlT24gZXZlbnQgKi9cbiAgICBwdWJsaWMgdm9pZCBBZGROb3RlKE1pZGlOb3RlIG0pIHtcbiAgICAgICAgbm90ZXMuQWRkKG0pO1xuICAgIH1cblxuICAgIC8qKiBBIE5vdGVPZmYgZXZlbnQgb2NjdXJlZC4gIEZpbmQgdGhlIE1pZGlOb3RlIG9mIHRoZSBjb3JyZXNwb25kaW5nXG4gICAgICogTm90ZU9uIGV2ZW50LCBhbmQgdXBkYXRlIHRoZSBkdXJhdGlvbiBvZiB0aGUgTWlkaU5vdGUuXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgTm90ZU9mZihpbnQgY2hhbm5lbCwgaW50IG5vdGVudW1iZXIsIGludCBlbmR0aW1lKSB7XG4gICAgICAgIGZvciAoaW50IGkgPSBub3Rlcy5Db3VudC0xOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgTWlkaU5vdGUgbm90ZSA9IG5vdGVzW2ldO1xuICAgICAgICAgICAgaWYgKG5vdGUuQ2hhbm5lbCA9PSBjaGFubmVsICYmIG5vdGUuTnVtYmVyID09IG5vdGVudW1iZXIgJiZcbiAgICAgICAgICAgICAgICBub3RlLkR1cmF0aW9uID09IDApIHtcbiAgICAgICAgICAgICAgICBub3RlLk5vdGVPZmYoZW5kdGltZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEFkZCBhIEx5cmljIE1pZGlFdmVudCAqL1xuICAgIHB1YmxpYyB2b2lkIEFkZEx5cmljKE1pZGlFdmVudCBtZXZlbnQpIHtcbiAgICAgICAgaWYgKGx5cmljcyA9PSBudWxsKSB7XG4gICAgICAgICAgICBseXJpY3MgPSBuZXcgTGlzdDxNaWRpRXZlbnQ+KCk7XG4gICAgICAgIH0gXG4gICAgICAgIGx5cmljcy5BZGQobWV2ZW50KTtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIGEgZGVlcCBjb3B5IGNsb25lIG9mIHRoaXMgTWlkaVRyYWNrLiAqL1xuICAgIHB1YmxpYyBNaWRpVHJhY2sgQ2xvbmUoKSB7XG4gICAgICAgIE1pZGlUcmFjayB0cmFjayA9IG5ldyBNaWRpVHJhY2soTnVtYmVyKTtcbiAgICAgICAgdHJhY2suaW5zdHJ1bWVudCA9IGluc3RydW1lbnQ7XG4gICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG5vdGUgaW4gbm90ZXMpIHtcbiAgICAgICAgICAgIHRyYWNrLm5vdGVzLkFkZCggbm90ZS5DbG9uZSgpICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGx5cmljcyAhPSBudWxsKSB7XG4gICAgICAgICAgICB0cmFjay5seXJpY3MgPSBuZXcgTGlzdDxNaWRpRXZlbnQ+KCk7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgZXYgaW4gbHlyaWNzKSB7XG4gICAgICAgICAgICAgICAgdHJhY2subHlyaWNzLkFkZChldik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRyYWNrO1xuICAgIH1cbiAgICBwdWJsaWMgb3ZlcnJpZGUgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICBzdHJpbmcgcmVzdWx0ID0gXCJUcmFjayBudW1iZXI9XCIgKyB0cmFja251bSArIFwiIGluc3RydW1lbnQ9XCIgKyBpbnN0cnVtZW50ICsgXCJcXG5cIjtcbiAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbiBpbiBub3Rlcykge1xuICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgKyBuICsgXCJcXG5cIjtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgKz0gXCJFbmQgVHJhY2tcXG5cIjtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59XG5cbn1cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIEVudW1lcmF0aW9uIG9mIHRoZSBub3RlcyBpbiBhIHNjYWxlIChBLCBBIywgLi4uIEcjKSAqL1xucHVibGljIGNsYXNzIE5vdGVTY2FsZSB7XG4gICAgcHVibGljIGNvbnN0IGludCBBICAgICAgPSAwO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQXNoYXJwID0gMTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEJmbGF0ICA9IDE7XG4gICAgcHVibGljIGNvbnN0IGludCBCICAgICAgPSAyO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQyAgICAgID0gMztcbiAgICBwdWJsaWMgY29uc3QgaW50IENzaGFycCA9IDQ7XG4gICAgcHVibGljIGNvbnN0IGludCBEZmxhdCAgPSA0O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRCAgICAgID0gNTtcbiAgICBwdWJsaWMgY29uc3QgaW50IERzaGFycCA9IDY7XG4gICAgcHVibGljIGNvbnN0IGludCBFZmxhdCAgPSA2O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRSAgICAgID0gNztcbiAgICBwdWJsaWMgY29uc3QgaW50IEYgICAgICA9IDg7XG4gICAgcHVibGljIGNvbnN0IGludCBGc2hhcnAgPSA5O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgR2ZsYXQgID0gOTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEcgICAgICA9IDEwO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgR3NoYXJwID0gMTE7XG4gICAgcHVibGljIGNvbnN0IGludCBBZmxhdCAgPSAxMTtcblxuICAgIC8qKiBDb252ZXJ0IGEgbm90ZSAoQSwgQSMsIEIsIGV0YykgYW5kIG9jdGF2ZSBpbnRvIGFcbiAgICAgKiBNaWRpIE5vdGUgbnVtYmVyLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgaW50IFRvTnVtYmVyKGludCBub3Rlc2NhbGUsIGludCBvY3RhdmUpIHtcbiAgICAgICAgcmV0dXJuIDkgKyBub3Rlc2NhbGUgKyBvY3RhdmUgKiAxMjtcbiAgICB9XG5cbiAgICAvKiogQ29udmVydCBhIE1pZGkgbm90ZSBudW1iZXIgaW50byBhIG5vdGVzY2FsZSAoQSwgQSMsIEIpICovXG4gICAgcHVibGljIHN0YXRpYyBpbnQgRnJvbU51bWJlcihpbnQgbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiAobnVtYmVyICsgMykgJSAxMjtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRydWUgaWYgdGhpcyBub3Rlc2NhbGUgbnVtYmVyIGlzIGEgYmxhY2sga2V5ICovXG4gICAgcHVibGljIHN0YXRpYyBib29sIElzQmxhY2tLZXkoaW50IG5vdGVzY2FsZSkge1xuICAgICAgICBpZiAobm90ZXNjYWxlID09IEFzaGFycCB8fFxuICAgICAgICAgICAgbm90ZXNjYWxlID09IENzaGFycCB8fFxuICAgICAgICAgICAgbm90ZXNjYWxlID09IERzaGFycCB8fFxuICAgICAgICAgICAgbm90ZXNjYWxlID09IEZzaGFycCB8fFxuICAgICAgICAgICAgbm90ZXNjYWxlID09IEdzaGFycCkge1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG4vKiogQGNsYXNzIFdoaXRlTm90ZVxuICogVGhlIFdoaXRlTm90ZSBjbGFzcyByZXByZXNlbnRzIGEgd2hpdGUga2V5IG5vdGUsIGEgbm9uLXNoYXJwLFxuICogbm9uLWZsYXQgbm90ZS4gIFRvIGRpc3BsYXkgbWlkaSBub3RlcyBhcyBzaGVldCBtdXNpYywgdGhlIG5vdGVzXG4gKiBtdXN0IGJlIGNvbnZlcnRlZCB0byB3aGl0ZSBub3RlcyBhbmQgYWNjaWRlbnRhbHMuIFxuICpcbiAqIFdoaXRlIG5vdGVzIGNvbnNpc3Qgb2YgYSBsZXR0ZXIgKEEgdGhydSBHKSBhbmQgYW4gb2N0YXZlICgwIHRocnUgMTApLlxuICogVGhlIG9jdGF2ZSBjaGFuZ2VzIGZyb20gRyB0byBBLiAgQWZ0ZXIgRzIgY29tZXMgQTMuICBNaWRkbGUtQyBpcyBDNC5cbiAqXG4gKiBUaGUgbWFpbiBvcGVyYXRpb25zIGFyZSBjYWxjdWxhdGluZyBkaXN0YW5jZXMgYmV0d2VlbiBub3RlcywgYW5kIGNvbXBhcmluZyBub3Rlcy5cbiAqLyBcblxucHVibGljIGNsYXNzIFdoaXRlTm90ZSA6IElDb21wYXJlcjxXaGl0ZU5vdGU+IHtcblxuICAgIC8qIFRoZSBwb3NzaWJsZSBub3RlIGxldHRlcnMgKi9cbiAgICBwdWJsaWMgY29uc3QgaW50IEEgPSAwO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQiA9IDE7XG4gICAgcHVibGljIGNvbnN0IGludCBDID0gMjtcbiAgICBwdWJsaWMgY29uc3QgaW50IEQgPSAzO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRSA9IDQ7XG4gICAgcHVibGljIGNvbnN0IGludCBGID0gNTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEcgPSA2O1xuXG4gICAgLyogQ29tbW9uIHdoaXRlIG5vdGVzIHVzZWQgaW4gY2FsY3VsYXRpb25zICovXG4gICAgcHVibGljIHN0YXRpYyBXaGl0ZU5vdGUgVG9wVHJlYmxlID0gbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRSwgNSk7XG4gICAgcHVibGljIHN0YXRpYyBXaGl0ZU5vdGUgQm90dG9tVHJlYmxlID0gbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRiwgNCk7XG4gICAgcHVibGljIHN0YXRpYyBXaGl0ZU5vdGUgVG9wQmFzcyA9IG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkcsIDMpO1xuICAgIHB1YmxpYyBzdGF0aWMgV2hpdGVOb3RlIEJvdHRvbUJhc3MgPSBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5BLCAzKTtcbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBNaWRkbGVDID0gbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQywgNCk7XG5cbiAgICBwcml2YXRlIGludCBsZXR0ZXI7ICAvKiBUaGUgbGV0dGVyIG9mIHRoZSBub3RlLCBBIHRocnUgRyAqL1xuICAgIHByaXZhdGUgaW50IG9jdGF2ZTsgIC8qIFRoZSBvY3RhdmUsIDAgdGhydSAxMC4gKi9cblxuICAgIC8qIEdldCB0aGUgbGV0dGVyICovXG4gICAgcHVibGljIGludCBMZXR0ZXIge1xuICAgICAgICBnZXQgeyByZXR1cm4gbGV0dGVyOyB9XG4gICAgfVxuXG4gICAgLyogR2V0IHRoZSBvY3RhdmUgKi9cbiAgICBwdWJsaWMgaW50IE9jdGF2ZSB7XG4gICAgICAgIGdldCB7IHJldHVybiBvY3RhdmU7IH1cbiAgICB9XG5cblxuICAgIC8qKiBDcmVhdGUgYSBuZXcgbm90ZSB3aXRoIHRoZSBnaXZlbiBsZXR0ZXIgYW5kIG9jdGF2ZS4gKi9cbiAgICBwdWJsaWMgV2hpdGVOb3RlKGludCBsZXR0ZXIsIGludCBvY3RhdmUpIHtcbiAgICAgICAgaWYgKCEobGV0dGVyID49IDAgJiYgbGV0dGVyIDw9IDYpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgU3lzdGVtLkFyZ3VtZW50RXhjZXB0aW9uKFwiTGV0dGVyIFwiICsgbGV0dGVyICsgXCIgaXMgaW5jb3JyZWN0XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sZXR0ZXIgPSBsZXR0ZXI7XG4gICAgICAgIHRoaXMub2N0YXZlID0gb2N0YXZlO1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIGRpc3RhbmNlIChpbiB3aGl0ZSBub3RlcykgYmV0d2VlbiB0aGlzIG5vdGVcbiAgICAgKiBhbmQgbm90ZSB3LCBpLmUuICB0aGlzIC0gdy4gIEZvciBleGFtcGxlLCBDNCAtIEE0ID0gMixcbiAgICAgKi9cbiAgICBwdWJsaWMgaW50IERpc3QoV2hpdGVOb3RlIHcpIHtcbiAgICAgICAgcmV0dXJuIChvY3RhdmUgLSB3Lm9jdGF2ZSkgKiA3ICsgKGxldHRlciAtIHcubGV0dGVyKTtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoaXMgbm90ZSBwbHVzIHRoZSBnaXZlbiBhbW91bnQgKGluIHdoaXRlIG5vdGVzKS5cbiAgICAgKiBUaGUgYW1vdW50IG1heSBiZSBwb3NpdGl2ZSBvciBuZWdhdGl2ZS4gIEZvciBleGFtcGxlLFxuICAgICAqIEE0ICsgMiA9IEM0LCBhbmQgQzQgKyAoLTIpID0gQTQuXG4gICAgICovXG4gICAgcHVibGljIFdoaXRlTm90ZSBBZGQoaW50IGFtb3VudCkge1xuICAgICAgICBpbnQgbnVtID0gb2N0YXZlICogNyArIGxldHRlcjtcbiAgICAgICAgbnVtICs9IGFtb3VudDtcbiAgICAgICAgaWYgKG51bSA8IDApIHtcbiAgICAgICAgICAgIG51bSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBXaGl0ZU5vdGUobnVtICUgNywgbnVtIC8gNyk7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgbWlkaSBub3RlIG51bWJlciBjb3JyZXNwb25kaW5nIHRvIHRoaXMgd2hpdGUgbm90ZS5cbiAgICAgKiBUaGUgbWlkaSBub3RlIG51bWJlcnMgY292ZXIgYWxsIGtleXMsIGluY2x1ZGluZyBzaGFycHMvZmxhdHMsXG4gICAgICogc28gZWFjaCBvY3RhdmUgaXMgMTIgbm90ZXMuICBNaWRkbGUgQyAoQzQpIGlzIDYwLiAgU29tZSBleGFtcGxlXG4gICAgICogbnVtYmVycyBmb3IgdmFyaW91cyBub3RlczpcbiAgICAgKlxuICAgICAqICBBIDIgPSAzM1xuICAgICAqICBBIzIgPSAzNFxuICAgICAqICBHIDIgPSA0M1xuICAgICAqICBHIzIgPSA0NCBcbiAgICAgKiAgQSAzID0gNDVcbiAgICAgKiAgQSA0ID0gNTdcbiAgICAgKiAgQSM0ID0gNThcbiAgICAgKiAgQiA0ID0gNTlcbiAgICAgKiAgQyA0ID0gNjBcbiAgICAgKi9cblxuICAgIHB1YmxpYyBpbnQgTnVtYmVyKCkge1xuICAgICAgICBpbnQgb2Zmc2V0ID0gMDtcbiAgICAgICAgc3dpdGNoIChsZXR0ZXIpIHtcbiAgICAgICAgICAgIGNhc2UgQTogb2Zmc2V0ID0gTm90ZVNjYWxlLkE7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBCOiBvZmZzZXQgPSBOb3RlU2NhbGUuQjsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEM6IG9mZnNldCA9IE5vdGVTY2FsZS5DOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgRDogb2Zmc2V0ID0gTm90ZVNjYWxlLkQ7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBFOiBvZmZzZXQgPSBOb3RlU2NhbGUuRTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEY6IG9mZnNldCA9IE5vdGVTY2FsZS5GOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgRzogb2Zmc2V0ID0gTm90ZVNjYWxlLkc7IGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDogb2Zmc2V0ID0gMDsgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE5vdGVTY2FsZS5Ub051bWJlcihvZmZzZXQsIG9jdGF2ZSk7XG4gICAgfVxuXG4gICAgLyoqIENvbXBhcmUgdGhlIHR3byBub3Rlcy4gIFJldHVyblxuICAgICAqICA8IDAgIGlmIHggaXMgbGVzcyAobG93ZXIpIHRoYW4geVxuICAgICAqICAgIDAgIGlmIHggaXMgZXF1YWwgdG8geVxuICAgICAqICA+IDAgIGlmIHggaXMgZ3JlYXRlciAoaGlnaGVyKSB0aGFuIHlcbiAgICAgKi9cbiAgICBwdWJsaWMgaW50IENvbXBhcmUoV2hpdGVOb3RlIHgsIFdoaXRlTm90ZSB5KSB7XG4gICAgICAgIHJldHVybiB4LkRpc3QoeSk7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgaGlnaGVyIG5vdGUsIHggb3IgeSAqL1xuICAgIHB1YmxpYyBzdGF0aWMgV2hpdGVOb3RlIE1heChXaGl0ZU5vdGUgeCwgV2hpdGVOb3RlIHkpIHtcbiAgICAgICAgaWYgKHguRGlzdCh5KSA+IDApXG4gICAgICAgICAgICByZXR1cm4geDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHk7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgbG93ZXIgbm90ZSwgeCBvciB5ICovXG4gICAgcHVibGljIHN0YXRpYyBXaGl0ZU5vdGUgTWluKFdoaXRlTm90ZSB4LCBXaGl0ZU5vdGUgeSkge1xuICAgICAgICBpZiAoeC5EaXN0KHkpIDwgMClcbiAgICAgICAgICAgIHJldHVybiB4O1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4geTtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSB0b3Agbm90ZSBpbiB0aGUgc3RhZmYgb2YgdGhlIGdpdmVuIGNsZWYgKi9cbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBUb3AoQ2xlZiBjbGVmKSB7XG4gICAgICAgIGlmIChjbGVmID09IENsZWYuVHJlYmxlKVxuICAgICAgICAgICAgcmV0dXJuIFRvcFRyZWJsZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIFRvcEJhc3M7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgYm90dG9tIG5vdGUgaW4gdGhlIHN0YWZmIG9mIHRoZSBnaXZlbiBjbGVmICovXG4gICAgcHVibGljIHN0YXRpYyBXaGl0ZU5vdGUgQm90dG9tKENsZWYgY2xlZikge1xuICAgICAgICBpZiAoY2xlZiA9PSBDbGVmLlRyZWJsZSlcbiAgICAgICAgICAgIHJldHVybiBCb3R0b21UcmVibGU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBCb3R0b21CYXNzO1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIHN0cmluZyA8bGV0dGVyPjxvY3RhdmU+IGZvciB0aGlzIG5vdGUuICovXG4gICAgcHVibGljIG92ZXJyaWRlIFxuICAgIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgc3RyaW5nW10gcyA9IHsgXCJBXCIsIFwiQlwiLCBcIkNcIiwgXCJEXCIsIFwiRVwiLCBcIkZcIiwgXCJHXCIgfTtcbiAgICAgICAgcmV0dXJuIHNbbGV0dGVyXSArIG9jdGF2ZTtcbiAgICB9XG59XG5cblxuXG59XG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgUGFpbnRFdmVudEFyZ3NcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgUmVjdGFuZ2xlIENsaXBSZWN0YW5nbGUgeyBnZXQ7IHNldDsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgR3JhcGhpY3MgR3JhcGhpY3MoKSB7IHJldHVybiBuZXcgR3JhcGhpY3MoXCJtYWluXCIpOyB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFBhbmVsXHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSBQb2ludCBhdXRvU2Nyb2xsUG9zaXRpb249bmV3IFBvaW50KDAsMCk7XHJcbiAgICAgICAgcHVibGljIFBvaW50IEF1dG9TY3JvbGxQb3NpdGlvbiB7IGdldCB7IHJldHVybiBhdXRvU2Nyb2xsUG9zaXRpb247IH0gc2V0IHsgYXV0b1Njcm9sbFBvc2l0aW9uID0gdmFsdWU7IH0gfVxyXG5cclxuICAgICAgICBwdWJsaWMgaW50IFdpZHRoO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgSGVpZ2h0O1xyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBzdGF0aWMgY2xhc3MgUGF0aFxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgc3RyaW5nIEdldEZpbGVOYW1lKHN0cmluZyBmaWxlbmFtZSkgeyByZXR1cm4gbnVsbDsgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBQZW5cclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgQ29sb3IgQ29sb3I7XHJcbiAgICAgICAgcHVibGljIGludCBXaWR0aDtcclxuICAgICAgICBwdWJsaWMgTGluZUNhcCBFbmRDYXA7XHJcblxyXG4gICAgICAgIHB1YmxpYyBQZW4oQ29sb3IgY29sb3IsIGludCB3aWR0aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIENvbG9yID0gY29sb3I7XHJcbiAgICAgICAgICAgIFdpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBQb2ludFxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBpbnQgWDtcclxuICAgICAgICBwdWJsaWMgaW50IFk7XHJcblxyXG4gICAgICAgIHB1YmxpYyBQb2ludChpbnQgeCwgaW50IHkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBYID0geDtcclxuICAgICAgICAgICAgWSA9IHk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBSZWN0YW5nbGVcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgaW50IFg7XHJcbiAgICAgICAgcHVibGljIGludCBZO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgV2lkdGg7XHJcbiAgICAgICAgcHVibGljIGludCBIZWlnaHQ7XHJcblxyXG4gICAgICAgIHB1YmxpYyBSZWN0YW5nbGUoaW50IHgsIGludCB5LCBpbnQgd2lkdGgsIGludCBoZWlnaHQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBYID0geDtcclxuICAgICAgICAgICAgWSA9IHk7XHJcbiAgICAgICAgICAgIFdpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgICAgIEhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiBAY2xhc3MgU3RhZmZcbiAqIFRoZSBTdGFmZiBpcyB1c2VkIHRvIGRyYXcgYSBzaW5nbGUgU3RhZmYgKGEgcm93IG9mIG1lYXN1cmVzKSBpbiB0aGUgXG4gKiBTaGVldE11c2ljIENvbnRyb2wuIEEgU3RhZmYgbmVlZHMgdG8gZHJhd1xuICogLSBUaGUgQ2xlZlxuICogLSBUaGUga2V5IHNpZ25hdHVyZVxuICogLSBUaGUgaG9yaXpvbnRhbCBsaW5lc1xuICogLSBBIGxpc3Qgb2YgTXVzaWNTeW1ib2xzXG4gKiAtIFRoZSBsZWZ0IGFuZCByaWdodCB2ZXJ0aWNhbCBsaW5lc1xuICpcbiAqIFRoZSBoZWlnaHQgb2YgdGhlIFN0YWZmIGlzIGRldGVybWluZWQgYnkgdGhlIG51bWJlciBvZiBwaXhlbHMgZWFjaFxuICogTXVzaWNTeW1ib2wgZXh0ZW5kcyBhYm92ZSBhbmQgYmVsb3cgdGhlIHN0YWZmLlxuICpcbiAqIFRoZSB2ZXJ0aWNhbCBsaW5lcyAobGVmdCBhbmQgcmlnaHQgc2lkZXMpIG9mIHRoZSBzdGFmZiBhcmUgam9pbmVkXG4gKiB3aXRoIHRoZSBzdGFmZnMgYWJvdmUgYW5kIGJlbG93IGl0LCB3aXRoIG9uZSBleGNlcHRpb24uICBcbiAqIFRoZSBsYXN0IHRyYWNrIGlzIG5vdCBqb2luZWQgd2l0aCB0aGUgZmlyc3QgdHJhY2suXG4gKi9cblxucHVibGljIGNsYXNzIFN0YWZmIHtcbiAgICBwcml2YXRlIExpc3Q8TXVzaWNTeW1ib2w+IHN5bWJvbHM7ICAvKiogVGhlIG11c2ljIHN5bWJvbHMgaW4gdGhpcyBzdGFmZiAqL1xuICAgIHByaXZhdGUgTGlzdDxMeXJpY1N5bWJvbD4gbHlyaWNzOyAgIC8qKiBUaGUgbHlyaWNzIHRvIGRpc3BsYXkgKGNhbiBiZSBudWxsKSAqL1xuICAgIHByaXZhdGUgaW50IHl0b3A7ICAgICAgICAgICAgICAgICAgIC8qKiBUaGUgeSBwaXhlbCBvZiB0aGUgdG9wIG9mIHRoZSBzdGFmZiAqL1xuICAgIHByaXZhdGUgQ2xlZlN5bWJvbCBjbGVmc3ltOyAgICAgICAgIC8qKiBUaGUgbGVmdC1zaWRlIENsZWYgc3ltYm9sICovXG4gICAgcHJpdmF0ZSBBY2NpZFN5bWJvbFtdIGtleXM7ICAgICAgICAgLyoqIFRoZSBrZXkgc2lnbmF0dXJlIHN5bWJvbHMgKi9cbiAgICBwcml2YXRlIGJvb2wgc2hvd01lYXN1cmVzOyAgICAgICAgICAvKiogSWYgdHJ1ZSwgc2hvdyB0aGUgbWVhc3VyZSBudW1iZXJzICovXG4gICAgcHJpdmF0ZSBpbnQga2V5c2lnV2lkdGg7ICAgICAgICAgICAgLyoqIFRoZSB3aWR0aCBvZiB0aGUgY2xlZiBhbmQga2V5IHNpZ25hdHVyZSAqL1xuICAgIHByaXZhdGUgaW50IHdpZHRoOyAgICAgICAgICAgICAgICAgIC8qKiBUaGUgd2lkdGggb2YgdGhlIHN0YWZmIGluIHBpeGVscyAqL1xuICAgIHByaXZhdGUgaW50IGhlaWdodDsgICAgICAgICAgICAgICAgIC8qKiBUaGUgaGVpZ2h0IG9mIHRoZSBzdGFmZiBpbiBwaXhlbHMgKi9cbiAgICBwcml2YXRlIGludCB0cmFja251bTsgICAgICAgICAgICAgICAvKiogVGhlIHRyYWNrIHRoaXMgc3RhZmYgcmVwcmVzZW50cyAqL1xuICAgIHByaXZhdGUgaW50IHRvdGFsdHJhY2tzOyAgICAgICAgICAgIC8qKiBUaGUgdG90YWwgbnVtYmVyIG9mIHRyYWNrcyAqL1xuICAgIHByaXZhdGUgaW50IHN0YXJ0dGltZTsgICAgICAgICAgICAgIC8qKiBUaGUgdGltZSAoaW4gcHVsc2VzKSBvZiBmaXJzdCBzeW1ib2wgKi9cbiAgICBwcml2YXRlIGludCBlbmR0aW1lOyAgICAgICAgICAgICAgICAvKiogVGhlIHRpbWUgKGluIHB1bHNlcykgb2YgbGFzdCBzeW1ib2wgKi9cbiAgICBwcml2YXRlIGludCBtZWFzdXJlTGVuZ3RoOyAgICAgICAgICAvKiogVGhlIHRpbWUgKGluIHB1bHNlcykgb2YgYSBtZWFzdXJlICovXG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IHN0YWZmIHdpdGggdGhlIGdpdmVuIGxpc3Qgb2YgbXVzaWMgc3ltYm9scyxcbiAgICAgKiBhbmQgdGhlIGdpdmVuIGtleSBzaWduYXR1cmUuICBUaGUgY2xlZiBpcyBkZXRlcm1pbmVkIGJ5XG4gICAgICogdGhlIGNsZWYgb2YgdGhlIGZpcnN0IGNob3JkIHN5bWJvbC4gVGhlIHRyYWNrIG51bWJlciBpcyB1c2VkXG4gICAgICogdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdG8gam9pbiB0aGlzIGxlZnQvcmlnaHQgdmVydGljYWwgc2lkZXNcbiAgICAgKiB3aXRoIHRoZSBzdGFmZnMgYWJvdmUgYW5kIGJlbG93LiBUaGUgU2hlZXRNdXNpY09wdGlvbnMgYXJlIHVzZWRcbiAgICAgKiB0byBjaGVjayB3aGV0aGVyIHRvIGRpc3BsYXkgbWVhc3VyZSBudW1iZXJzIG9yIG5vdC5cbiAgICAgKi9cbiAgICBwdWJsaWMgU3RhZmYoTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scywgS2V5U2lnbmF0dXJlIGtleSwgXG4gICAgICAgICAgICAgICAgIE1pZGlPcHRpb25zIG9wdGlvbnMsXG4gICAgICAgICAgICAgICAgIGludCB0cmFja251bSwgaW50IHRvdGFsdHJhY2tzKSAge1xuXG4gICAgICAgIGtleXNpZ1dpZHRoID0gU2hlZXRNdXNpYy5LZXlTaWduYXR1cmVXaWR0aChrZXkpO1xuICAgICAgICB0aGlzLnRyYWNrbnVtID0gdHJhY2tudW07XG4gICAgICAgIHRoaXMudG90YWx0cmFja3MgPSB0b3RhbHRyYWNrcztcbiAgICAgICAgc2hvd01lYXN1cmVzID0gKG9wdGlvbnMuc2hvd01lYXN1cmVzICYmIHRyYWNrbnVtID09IDApO1xuICAgICAgICBtZWFzdXJlTGVuZ3RoID0gb3B0aW9ucy50aW1lLk1lYXN1cmU7XG4gICAgICAgIENsZWYgY2xlZiA9IEZpbmRDbGVmKHN5bWJvbHMpO1xuXG4gICAgICAgIGNsZWZzeW0gPSBuZXcgQ2xlZlN5bWJvbChjbGVmLCAwLCBmYWxzZSk7XG4gICAgICAgIGtleXMgPSBrZXkuR2V0U3ltYm9scyhjbGVmKTtcbiAgICAgICAgdGhpcy5zeW1ib2xzID0gc3ltYm9scztcbiAgICAgICAgQ2FsY3VsYXRlV2lkdGgob3B0aW9ucy5zY3JvbGxWZXJ0KTtcbiAgICAgICAgQ2FsY3VsYXRlSGVpZ2h0KCk7XG4gICAgICAgIENhbGN1bGF0ZVN0YXJ0RW5kVGltZSgpO1xuICAgICAgICBGdWxsSnVzdGlmeSgpO1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIHdpZHRoIG9mIHRoZSBzdGFmZiAqL1xuICAgIHB1YmxpYyBpbnQgV2lkdGgge1xuICAgICAgICBnZXQgeyByZXR1cm4gd2lkdGg7IH1cbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBoZWlnaHQgb2YgdGhlIHN0YWZmICovXG4gICAgcHVibGljIGludCBIZWlnaHQge1xuICAgICAgICBnZXQgeyByZXR1cm4gaGVpZ2h0OyB9XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgdHJhY2sgbnVtYmVyIG9mIHRoaXMgc3RhZmYgKHN0YXJ0aW5nIGZyb20gMCAqL1xuICAgIHB1YmxpYyBpbnQgVHJhY2sge1xuICAgICAgICBnZXQgeyByZXR1cm4gdHJhY2tudW07IH1cbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBzdGFydGluZyB0aW1lIG9mIHRoZSBzdGFmZiwgdGhlIHN0YXJ0IHRpbWUgb2ZcbiAgICAgKiAgdGhlIGZpcnN0IHN5bWJvbC4gIFRoaXMgaXMgdXNlZCBkdXJpbmcgcGxheWJhY2ssIHRvIFxuICAgICAqICBhdXRvbWF0aWNhbGx5IHNjcm9sbCB0aGUgbXVzaWMgd2hpbGUgcGxheWluZy5cbiAgICAgKi9cbiAgICBwdWJsaWMgaW50IFN0YXJ0VGltZSB7XG4gICAgICAgIGdldCB7IHJldHVybiBzdGFydHRpbWU7IH1cbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBlbmRpbmcgdGltZSBvZiB0aGUgc3RhZmYsIHRoZSBlbmR0aW1lIG9mXG4gICAgICogIHRoZSBsYXN0IHN5bWJvbC4gIFRoaXMgaXMgdXNlZCBkdXJpbmcgcGxheWJhY2ssIHRvIFxuICAgICAqICBhdXRvbWF0aWNhbGx5IHNjcm9sbCB0aGUgbXVzaWMgd2hpbGUgcGxheWluZy5cbiAgICAgKi9cbiAgICBwdWJsaWMgaW50IEVuZFRpbWUge1xuICAgICAgICBnZXQgeyByZXR1cm4gZW5kdGltZTsgfVxuICAgICAgICBzZXQgeyBlbmR0aW1lID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogRmluZCB0aGUgaW5pdGlhbCBjbGVmIHRvIHVzZSBmb3IgdGhpcyBzdGFmZi4gIFVzZSB0aGUgY2xlZiBvZlxuICAgICAqIHRoZSBmaXJzdCBDaG9yZFN5bWJvbC5cbiAgICAgKi9cbiAgICBwcml2YXRlIENsZWYgRmluZENsZWYoTGlzdDxNdXNpY1N5bWJvbD4gbGlzdCkge1xuICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBtIGluIGxpc3QpIHtcbiAgICAgICAgICAgIGlmIChtIGlzIENob3JkU3ltYm9sKSB7XG4gICAgICAgICAgICAgICAgQ2hvcmRTeW1ib2wgYyA9IChDaG9yZFN5bWJvbCkgbTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYy5DbGVmO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBDbGVmLlRyZWJsZTtcbiAgICB9XG5cbiAgICAvKiogQ2FsY3VsYXRlIHRoZSBoZWlnaHQgb2YgdGhpcyBzdGFmZi4gIEVhY2ggTXVzaWNTeW1ib2wgY29udGFpbnMgdGhlXG4gICAgICogbnVtYmVyIG9mIHBpeGVscyBpdCBuZWVkcyBhYm92ZSBhbmQgYmVsb3cgdGhlIHN0YWZmLiAgR2V0IHRoZSBtYXhpbXVtXG4gICAgICogdmFsdWVzIGFib3ZlIGFuZCBiZWxvdyB0aGUgc3RhZmYuXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgQ2FsY3VsYXRlSGVpZ2h0KCkge1xuICAgICAgICBpbnQgYWJvdmUgPSAwO1xuICAgICAgICBpbnQgYmVsb3cgPSAwO1xuXG4gICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHMgaW4gc3ltYm9scykge1xuICAgICAgICAgICAgYWJvdmUgPSBNYXRoLk1heChhYm92ZSwgcy5BYm92ZVN0YWZmKTtcbiAgICAgICAgICAgIGJlbG93ID0gTWF0aC5NYXgoYmVsb3csIHMuQmVsb3dTdGFmZik7XG4gICAgICAgIH1cbiAgICAgICAgYWJvdmUgPSBNYXRoLk1heChhYm92ZSwgY2xlZnN5bS5BYm92ZVN0YWZmKTtcbiAgICAgICAgYmVsb3cgPSBNYXRoLk1heChiZWxvdywgY2xlZnN5bS5CZWxvd1N0YWZmKTtcbiAgICAgICAgaWYgKHNob3dNZWFzdXJlcykge1xuICAgICAgICAgICAgYWJvdmUgPSBNYXRoLk1heChhYm92ZSwgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMyk7XG4gICAgICAgIH1cbiAgICAgICAgeXRvcCA9IGFib3ZlICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICBoZWlnaHQgPSBTaGVldE11c2ljLk5vdGVIZWlnaHQqNSArIHl0b3AgKyBiZWxvdztcbiAgICAgICAgaWYgKGx5cmljcyAhPSBudWxsKSB7XG4gICAgICAgICAgICBoZWlnaHQgKz0gMTI7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBBZGQgc29tZSBleHRyYSB2ZXJ0aWNhbCBzcGFjZSBiZXR3ZWVuIHRoZSBsYXN0IHRyYWNrXG4gICAgICAgICAqIGFuZCBmaXJzdCB0cmFjay5cbiAgICAgICAgICovXG4gICAgICAgIGlmICh0cmFja251bSA9PSB0b3RhbHRyYWNrcy0xKVxuICAgICAgICAgICAgaGVpZ2h0ICs9IFNoZWV0TXVzaWMuTm90ZUhlaWdodCAqIDM7XG4gICAgfVxuXG4gICAgLyoqIENhbGN1bGF0ZSB0aGUgd2lkdGggb2YgdGhpcyBzdGFmZiAqL1xuICAgIHByaXZhdGUgdm9pZCBDYWxjdWxhdGVXaWR0aChib29sIHNjcm9sbFZlcnQpIHtcbiAgICAgICAgaWYgKHNjcm9sbFZlcnQpIHtcbiAgICAgICAgICAgIHdpZHRoID0gU2hlZXRNdXNpYy5QYWdlV2lkdGg7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgd2lkdGggPSBrZXlzaWdXaWR0aDtcbiAgICAgICAgZm9yZWFjaCAoTXVzaWNTeW1ib2wgcyBpbiBzeW1ib2xzKSB7XG4gICAgICAgICAgICB3aWR0aCArPSBzLldpZHRoO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKiogQ2FsY3VsYXRlIHRoZSBzdGFydCBhbmQgZW5kIHRpbWUgb2YgdGhpcyBzdGFmZi4gKi9cbiAgICBwcml2YXRlIHZvaWQgQ2FsY3VsYXRlU3RhcnRFbmRUaW1lKCkge1xuICAgICAgICBzdGFydHRpbWUgPSBlbmR0aW1lID0gMDtcbiAgICAgICAgaWYgKHN5bWJvbHMuQ291bnQgPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHN0YXJ0dGltZSA9IHN5bWJvbHNbMF0uU3RhcnRUaW1lO1xuICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBtIGluIHN5bWJvbHMpIHtcbiAgICAgICAgICAgIGlmIChlbmR0aW1lIDwgbS5TdGFydFRpbWUpIHtcbiAgICAgICAgICAgICAgICBlbmR0aW1lID0gbS5TdGFydFRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobSBpcyBDaG9yZFN5bWJvbCkge1xuICAgICAgICAgICAgICAgIENob3JkU3ltYm9sIGMgPSAoQ2hvcmRTeW1ib2wpIG07XG4gICAgICAgICAgICAgICAgaWYgKGVuZHRpbWUgPCBjLkVuZFRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kdGltZSA9IGMuRW5kVGltZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIC8qKiBGdWxsLUp1c3RpZnkgdGhlIHN5bWJvbHMsIHNvIHRoYXQgdGhleSBleHBhbmQgdG8gZmlsbCB0aGUgd2hvbGUgc3RhZmYuICovXG4gICAgcHJpdmF0ZSB2b2lkIEZ1bGxKdXN0aWZ5KCkge1xuICAgICAgICBpZiAod2lkdGggIT0gU2hlZXRNdXNpYy5QYWdlV2lkdGgpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgaW50IHRvdGFsd2lkdGggPSBrZXlzaWdXaWR0aDtcbiAgICAgICAgaW50IHRvdGFsc3ltYm9scyA9IDA7XG4gICAgICAgIGludCBpID0gMDtcblxuICAgICAgICB3aGlsZSAoaSA8IHN5bWJvbHMuQ291bnQpIHtcbiAgICAgICAgICAgIGludCBzdGFydCA9IHN5bWJvbHNbaV0uU3RhcnRUaW1lO1xuICAgICAgICAgICAgdG90YWxzeW1ib2xzKys7XG4gICAgICAgICAgICB0b3RhbHdpZHRoICs9IHN5bWJvbHNbaV0uV2lkdGg7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB3aGlsZSAoaSA8IHN5bWJvbHMuQ291bnQgJiYgc3ltYm9sc1tpXS5TdGFydFRpbWUgPT0gc3RhcnQpIHtcbiAgICAgICAgICAgICAgICB0b3RhbHdpZHRoICs9IHN5bWJvbHNbaV0uV2lkdGg7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaW50IGV4dHJhd2lkdGggPSAoU2hlZXRNdXNpYy5QYWdlV2lkdGggLSB0b3RhbHdpZHRoIC0gMSkgLyB0b3RhbHN5bWJvbHM7XG4gICAgICAgIGlmIChleHRyYXdpZHRoID4gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIpIHtcbiAgICAgICAgICAgIGV4dHJhd2lkdGggPSBTaGVldE11c2ljLk5vdGVIZWlnaHQqMjtcbiAgICAgICAgfVxuICAgICAgICBpID0gMDtcbiAgICAgICAgd2hpbGUgKGkgPCBzeW1ib2xzLkNvdW50KSB7XG4gICAgICAgICAgICBpbnQgc3RhcnQgPSBzeW1ib2xzW2ldLlN0YXJ0VGltZTtcbiAgICAgICAgICAgIHN5bWJvbHNbaV0uV2lkdGggKz0gZXh0cmF3aWR0aDtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIHdoaWxlIChpIDwgc3ltYm9scy5Db3VudCAmJiBzeW1ib2xzW2ldLlN0YXJ0VGltZSA9PSBzdGFydCkge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLyoqIEFkZCB0aGUgbHlyaWMgc3ltYm9scyB0aGF0IG9jY3VyIHdpdGhpbiB0aGlzIHN0YWZmLlxuICAgICAqICBTZXQgdGhlIHgtcG9zaXRpb24gb2YgdGhlIGx5cmljIHN5bWJvbC4gXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgQWRkTHlyaWNzKExpc3Q8THlyaWNTeW1ib2w+IHRyYWNrbHlyaWNzKSB7XG4gICAgICAgIGlmICh0cmFja2x5cmljcyA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbHlyaWNzID0gbmV3IExpc3Q8THlyaWNTeW1ib2w+KCk7XG4gICAgICAgIGludCB4cG9zID0gMDtcbiAgICAgICAgaW50IHN5bWJvbGluZGV4ID0gMDtcbiAgICAgICAgZm9yZWFjaCAoTHlyaWNTeW1ib2wgbHlyaWMgaW4gdHJhY2tseXJpY3MpIHtcbiAgICAgICAgICAgIGlmIChseXJpYy5TdGFydFRpbWUgPCBzdGFydHRpbWUpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChseXJpYy5TdGFydFRpbWUgPiBlbmR0aW1lKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBHZXQgdGhlIHgtcG9zaXRpb24gb2YgdGhpcyBseXJpYyAqL1xuICAgICAgICAgICAgd2hpbGUgKHN5bWJvbGluZGV4IDwgc3ltYm9scy5Db3VudCAmJiBcbiAgICAgICAgICAgICAgICAgICBzeW1ib2xzW3N5bWJvbGluZGV4XS5TdGFydFRpbWUgPCBseXJpYy5TdGFydFRpbWUpIHtcbiAgICAgICAgICAgICAgICB4cG9zICs9IHN5bWJvbHNbc3ltYm9saW5kZXhdLldpZHRoO1xuICAgICAgICAgICAgICAgIHN5bWJvbGluZGV4Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBseXJpYy5YID0geHBvcztcbiAgICAgICAgICAgIGlmIChzeW1ib2xpbmRleCA8IHN5bWJvbHMuQ291bnQgJiZcbiAgICAgICAgICAgICAgICAoc3ltYm9sc1tzeW1ib2xpbmRleF0gaXMgQmFyU3ltYm9sKSkge1xuICAgICAgICAgICAgICAgIGx5cmljLlggKz0gU2hlZXRNdXNpYy5Ob3RlV2lkdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBseXJpY3MuQWRkKGx5cmljKTsgXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGx5cmljcy5Db3VudCA9PSAwKSB7XG4gICAgICAgICAgICBseXJpY3MgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKiogRHJhdyB0aGUgbHlyaWNzICovXG4gICAgcHJpdmF0ZSB2b2lkIERyYXdMeXJpY3MoR3JhcGhpY3MgZywgUGVuIHBlbikge1xuICAgICAgICAvKiBTa2lwIHRoZSBsZWZ0IHNpZGUgQ2xlZiBzeW1ib2wgYW5kIGtleSBzaWduYXR1cmUgKi9cbiAgICAgICAgaW50IHhwb3MgPSBrZXlzaWdXaWR0aDtcbiAgICAgICAgaW50IHlwb3MgPSBoZWlnaHQgLSAxMjtcblxuICAgICAgICBmb3JlYWNoIChMeXJpY1N5bWJvbCBseXJpYyBpbiBseXJpY3MpIHtcbiAgICAgICAgICAgIGcuRHJhd1N0cmluZyhseXJpYy5UZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGV0dGVyRm9udCxcbiAgICAgICAgICAgICAgICAgICAgICAgICBCcnVzaGVzLkJsYWNrLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICB4cG9zICsgbHlyaWMuWCwgeXBvcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgbWVhc3VyZSBudW1iZXJzIGZvciBlYWNoIG1lYXN1cmUgKi9cbiAgICBwcml2YXRlIHZvaWQgRHJhd01lYXN1cmVOdW1iZXJzKEdyYXBoaWNzIGcsIFBlbiBwZW4pIHtcblxuICAgICAgICAvKiBTa2lwIHRoZSBsZWZ0IHNpZGUgQ2xlZiBzeW1ib2wgYW5kIGtleSBzaWduYXR1cmUgKi9cbiAgICAgICAgaW50IHhwb3MgPSBrZXlzaWdXaWR0aDtcbiAgICAgICAgaW50IHlwb3MgPSB5dG9wIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMztcblxuICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBzIGluIHN5bWJvbHMpIHtcbiAgICAgICAgICAgIGlmIChzIGlzIEJhclN5bWJvbCkge1xuICAgICAgICAgICAgICAgIGludCBtZWFzdXJlID0gMSArIHMuU3RhcnRUaW1lIC8gbWVhc3VyZUxlbmd0aDtcbiAgICAgICAgICAgICAgICBnLkRyYXdTdHJpbmcoXCJcIiArIG1lYXN1cmUsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxldHRlckZvbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJydXNoZXMuQmxhY2ssIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4cG9zICsgU2hlZXRNdXNpYy5Ob3RlV2lkdGgvMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlwb3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeHBvcyArPSBzLldpZHRoO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIERyYXcgdGhlIGx5cmljcyAqL1xuXG5cbiAgICAvKiogRHJhdyB0aGUgZml2ZSBob3Jpem9udGFsIGxpbmVzIG9mIHRoZSBzdGFmZiAqL1xuICAgIHByaXZhdGUgdm9pZCBEcmF3SG9yaXpMaW5lcyhHcmFwaGljcyBnLCBQZW4gcGVuKSB7XG4gICAgICAgIGludCBsaW5lID0gMTtcbiAgICAgICAgaW50IHkgPSB5dG9wIC0gU2hlZXRNdXNpYy5MaW5lV2lkdGg7XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG4gICAgICAgIGZvciAobGluZSA9IDE7IGxpbmUgPD0gNTsgbGluZSsrKSB7XG4gICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgU2hlZXRNdXNpYy5MZWZ0TWFyZ2luLCB5LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aC0xLCB5KTtcbiAgICAgICAgICAgIHkgKz0gU2hlZXRNdXNpYy5MaW5lV2lkdGggKyBTaGVldE11c2ljLkxpbmVTcGFjZTtcbiAgICAgICAgfVxuICAgICAgICBwZW4uQ29sb3IgPSBDb2xvci5CbGFjaztcblxuICAgIH1cblxuICAgIC8qKiBEcmF3IHRoZSB2ZXJ0aWNhbCBsaW5lcyBhdCB0aGUgZmFyIGxlZnQgYW5kIGZhciByaWdodCBzaWRlcy4gKi9cbiAgICBwcml2YXRlIHZvaWQgRHJhd0VuZExpbmVzKEdyYXBoaWNzIGcsIFBlbiBwZW4pIHtcbiAgICAgICAgcGVuLldpZHRoID0gMTtcblxuICAgICAgICAvKiBEcmF3IHRoZSB2ZXJ0aWNhbCBsaW5lcyBmcm9tIDAgdG8gdGhlIGhlaWdodCBvZiB0aGlzIHN0YWZmLFxuICAgICAgICAgKiBpbmNsdWRpbmcgdGhlIHNwYWNlIGFib3ZlIGFuZCBiZWxvdyB0aGUgc3RhZmYsIHdpdGggdHdvIGV4Y2VwdGlvbnM6XG4gICAgICAgICAqIC0gSWYgdGhpcyBpcyB0aGUgZmlyc3QgdHJhY2ssIGRvbid0IHN0YXJ0IGFib3ZlIHRoZSBzdGFmZi5cbiAgICAgICAgICogICBTdGFydCBleGFjdGx5IGF0IHRoZSB0b3Agb2YgdGhlIHN0YWZmICh5dG9wIC0gTGluZVdpZHRoKVxuICAgICAgICAgKiAtIElmIHRoaXMgaXMgdGhlIGxhc3QgdHJhY2ssIGRvbid0IGVuZCBiZWxvdyB0aGUgc3RhZmYuXG4gICAgICAgICAqICAgRW5kIGV4YWN0bHkgYXQgdGhlIGJvdHRvbSBvZiB0aGUgc3RhZmYuXG4gICAgICAgICAqL1xuICAgICAgICBpbnQgeXN0YXJ0LCB5ZW5kO1xuICAgICAgICBpZiAodHJhY2tudW0gPT0gMClcbiAgICAgICAgICAgIHlzdGFydCA9IHl0b3AgLSBTaGVldE11c2ljLkxpbmVXaWR0aDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgeXN0YXJ0ID0gMDtcblxuICAgICAgICBpZiAodHJhY2tudW0gPT0gKHRvdGFsdHJhY2tzLTEpKVxuICAgICAgICAgICAgeWVuZCA9IHl0b3AgKyA0ICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB5ZW5kID0gaGVpZ2h0O1xuXG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCBTaGVldE11c2ljLkxlZnRNYXJnaW4sIHlzdGFydCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGVmdE1hcmdpbiwgeWVuZCk7XG5cbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHdpZHRoLTEsIHlzdGFydCwgd2lkdGgtMSwgeWVuZCk7XG5cbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGlzIHN0YWZmLiBPbmx5IGRyYXcgdGhlIHN5bWJvbHMgaW5zaWRlIHRoZSBjbGlwIGFyZWEgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFJlY3RhbmdsZSBjbGlwLCBQZW4gcGVuKSB7XG4gICAgICAgIGludCB4cG9zID0gU2hlZXRNdXNpYy5MZWZ0TWFyZ2luICsgNTtcblxuICAgICAgICAvKiBEcmF3IHRoZSBsZWZ0IHNpZGUgQ2xlZiBzeW1ib2wgKi9cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeHBvcywgMCk7XG4gICAgICAgIGNsZWZzeW0uRHJhdyhnLCBwZW4sIHl0b3ApO1xuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgteHBvcywgMCk7XG4gICAgICAgIHhwb3MgKz0gY2xlZnN5bS5XaWR0aDtcblxuICAgICAgICAvKiBEcmF3IHRoZSBrZXkgc2lnbmF0dXJlICovXG4gICAgICAgIGZvcmVhY2ggKEFjY2lkU3ltYm9sIGEgaW4ga2V5cykge1xuICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeHBvcywgMCk7XG4gICAgICAgICAgICBhLkRyYXcoZywgcGVuLCB5dG9wKTtcbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC14cG9zLCAwKTtcbiAgICAgICAgICAgIHhwb3MgKz0gYS5XaWR0aDtcbiAgICAgICAgfVxuICAgICAgIFxuICAgICAgICAvKiBEcmF3IHRoZSBhY3R1YWwgbm90ZXMsIHJlc3RzLCBiYXJzLiAgRHJhdyB0aGUgc3ltYm9scyBvbmUgXG4gICAgICAgICAqIGFmdGVyIGFub3RoZXIsIHVzaW5nIHRoZSBzeW1ib2wgd2lkdGggdG8gZGV0ZXJtaW5lIHRoZVxuICAgICAgICAgKiB4IHBvc2l0aW9uIG9mIHRoZSBuZXh0IHN5bWJvbC5cbiAgICAgICAgICpcbiAgICAgICAgICogRm9yIGZhc3QgcGVyZm9ybWFuY2UsIG9ubHkgZHJhdyBzeW1ib2xzIHRoYXQgYXJlIGluIHRoZSBjbGlwIGFyZWEuXG4gICAgICAgICAqL1xuICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBzIGluIHN5bWJvbHMpIHtcbiAgICAgICAgICAgIGlmICgoeHBvcyA8PSBjbGlwLlggKyBjbGlwLldpZHRoICsgNTApICYmICh4cG9zICsgcy5XaWR0aCArIDUwID49IGNsaXAuWCkpIHtcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSh4cG9zLCAwKTtcbiAgICAgICAgICAgICAgICBzLkRyYXcoZywgcGVuLCB5dG9wKTtcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgteHBvcywgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB4cG9zICs9IHMuV2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgRHJhd0hvcml6TGluZXMoZywgcGVuKTtcbiAgICAgICAgRHJhd0VuZExpbmVzKGcsIHBlbik7XG5cbiAgICAgICAgaWYgKHNob3dNZWFzdXJlcykge1xuICAgICAgICAgICAgRHJhd01lYXN1cmVOdW1iZXJzKGcsIHBlbik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGx5cmljcyAhPSBudWxsKSB7XG4gICAgICAgICAgICBEcmF3THlyaWNzKGcsIHBlbik7XG4gICAgICAgIH1cblxuICAgIH1cblxuXG4gICAgLyoqIFNoYWRlIGFsbCB0aGUgY2hvcmRzIHBsYXllZCBpbiB0aGUgZ2l2ZW4gdGltZS5cbiAgICAgKiAgVW4tc2hhZGUgYW55IGNob3JkcyBzaGFkZWQgaW4gdGhlIHByZXZpb3VzIHB1bHNlIHRpbWUuXG4gICAgICogIFN0b3JlIHRoZSB4IGNvb3JkaW5hdGUgbG9jYXRpb24gd2hlcmUgdGhlIHNoYWRlIHdhcyBkcmF3bi5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBTaGFkZU5vdGVzKEdyYXBoaWNzIGcsIFNvbGlkQnJ1c2ggc2hhZGVCcnVzaCwgUGVuIHBlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGludCBjdXJyZW50UHVsc2VUaW1lLCBpbnQgcHJldlB1bHNlVGltZSwgcmVmIGludCB4X3NoYWRlKSB7XG5cbiAgICAgICAgLyogSWYgdGhlcmUncyBub3RoaW5nIHRvIHVuc2hhZGUsIG9yIHNoYWRlLCByZXR1cm4gKi9cbiAgICAgICAgaWYgKChzdGFydHRpbWUgPiBwcmV2UHVsc2VUaW1lIHx8IGVuZHRpbWUgPCBwcmV2UHVsc2VUaW1lKSAmJlxuICAgICAgICAgICAgKHN0YXJ0dGltZSA+IGN1cnJlbnRQdWxzZVRpbWUgfHwgZW5kdGltZSA8IGN1cnJlbnRQdWxzZVRpbWUpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvKiBTa2lwIHRoZSBsZWZ0IHNpZGUgQ2xlZiBzeW1ib2wgYW5kIGtleSBzaWduYXR1cmUgKi9cbiAgICAgICAgaW50IHhwb3MgPSBrZXlzaWdXaWR0aDtcblxuICAgICAgICBNdXNpY1N5bWJvbCBjdXJyID0gbnVsbDtcbiAgICAgICAgQ2hvcmRTeW1ib2wgcHJldkNob3JkID0gbnVsbDtcbiAgICAgICAgaW50IHByZXZfeHBvcyA9IDA7XG5cbiAgICAgICAgLyogTG9vcCB0aHJvdWdoIHRoZSBzeW1ib2xzLiBcbiAgICAgICAgICogVW5zaGFkZSBzeW1ib2xzIHdoZXJlIHN0YXJ0IDw9IHByZXZQdWxzZVRpbWUgPCBlbmRcbiAgICAgICAgICogU2hhZGUgc3ltYm9scyB3aGVyZSBzdGFydCA8PSBjdXJyZW50UHVsc2VUaW1lIDwgZW5kXG4gICAgICAgICAqLyBcbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBzeW1ib2xzLkNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGN1cnIgPSBzeW1ib2xzW2ldO1xuICAgICAgICAgICAgaWYgKGN1cnIgaXMgQmFyU3ltYm9sKSB7XG4gICAgICAgICAgICAgICAgeHBvcyArPSBjdXJyLldpZHRoO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpbnQgc3RhcnQgPSBjdXJyLlN0YXJ0VGltZTtcbiAgICAgICAgICAgIGludCBlbmQgPSAwO1xuICAgICAgICAgICAgaWYgKGkrMiA8IHN5bWJvbHMuQ291bnQgJiYgc3ltYm9sc1tpKzFdIGlzIEJhclN5bWJvbCkge1xuICAgICAgICAgICAgICAgIGVuZCA9IHN5bWJvbHNbaSsyXS5TdGFydFRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpKzEgPCBzeW1ib2xzLkNvdW50KSB7XG4gICAgICAgICAgICAgICAgZW5kID0gc3ltYm9sc1tpKzFdLlN0YXJ0VGltZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGVuZCA9IGVuZHRpbWU7XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgLyogSWYgd2UndmUgcGFzdCB0aGUgcHJldmlvdXMgYW5kIGN1cnJlbnQgdGltZXMsIHdlJ3JlIGRvbmUuICovXG4gICAgICAgICAgICBpZiAoKHN0YXJ0ID4gcHJldlB1bHNlVGltZSkgJiYgKHN0YXJ0ID4gY3VycmVudFB1bHNlVGltZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoeF9zaGFkZSA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHhfc2hhZGUgPSB4cG9zO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIElmIHNoYWRlZCBub3RlcyBhcmUgdGhlIHNhbWUsIHdlJ3JlIGRvbmUgKi9cbiAgICAgICAgICAgIGlmICgoc3RhcnQgPD0gY3VycmVudFB1bHNlVGltZSkgJiYgKGN1cnJlbnRQdWxzZVRpbWUgPCBlbmQpICYmXG4gICAgICAgICAgICAgICAgKHN0YXJ0IDw9IHByZXZQdWxzZVRpbWUpICYmIChwcmV2UHVsc2VUaW1lIDwgZW5kKSkge1xuXG4gICAgICAgICAgICAgICAgeF9zaGFkZSA9IHhwb3M7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBib29sIHJlZHJhd0xpbmVzID0gZmFsc2U7XG5cbiAgICAgICAgICAgIC8qIElmIHN5bWJvbCBpcyBpbiB0aGUgcHJldmlvdXMgdGltZSwgZHJhdyBhIHdoaXRlIGJhY2tncm91bmQgKi9cbiAgICAgICAgICAgIGlmICgoc3RhcnQgPD0gcHJldlB1bHNlVGltZSkgJiYgKHByZXZQdWxzZVRpbWUgPCBlbmQpKSB7XG4gICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeHBvcy0yLCAtMik7XG4gICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKEJydXNoZXMuV2hpdGUsIDAsIDAsIGN1cnIuV2lkdGgrNCwgdGhpcy5IZWlnaHQrNCk7XG4gICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLSh4cG9zLTIpLCAyKTtcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSh4cG9zLCAwKTtcbiAgICAgICAgICAgICAgICBjdXJyLkRyYXcoZywgcGVuLCB5dG9wKTtcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgteHBvcywgMCk7XG5cbiAgICAgICAgICAgICAgICByZWRyYXdMaW5lcyA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIElmIHN5bWJvbCBpcyBpbiB0aGUgY3VycmVudCB0aW1lLCBkcmF3IGEgc2hhZGVkIGJhY2tncm91bmQgKi9cbiAgICAgICAgICAgIGlmICgoc3RhcnQgPD0gY3VycmVudFB1bHNlVGltZSkgJiYgKGN1cnJlbnRQdWxzZVRpbWUgPCBlbmQpKSB7XG4gICAgICAgICAgICAgICAgeF9zaGFkZSA9IHhwb3M7XG4gICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeHBvcywgMCk7XG4gICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKHNoYWRlQnJ1c2gsIDAsIDAsIGN1cnIuV2lkdGgsIHRoaXMuSGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBjdXJyLkRyYXcoZywgcGVuLCB5dG9wKTtcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgteHBvcywgMCk7XG4gICAgICAgICAgICAgICAgcmVkcmF3TGluZXMgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBJZiBlaXRoZXIgYSBncmF5IG9yIHdoaXRlIGJhY2tncm91bmQgd2FzIGRyYXduLCB3ZSBuZWVkIHRvIHJlZHJhd1xuICAgICAgICAgICAgICogdGhlIGhvcml6b250YWwgc3RhZmYgbGluZXMsIGFuZCByZWRyYXcgdGhlIHN0ZW0gb2YgdGhlIHByZXZpb3VzIGNob3JkLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAocmVkcmF3TGluZXMpIHtcbiAgICAgICAgICAgICAgICBpbnQgbGluZSA9IDE7XG4gICAgICAgICAgICAgICAgaW50IHkgPSB5dG9wIC0gU2hlZXRNdXNpYy5MaW5lV2lkdGg7XG4gICAgICAgICAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSh4cG9zLTIsIDApO1xuICAgICAgICAgICAgICAgIGZvciAobGluZSA9IDE7IGxpbmUgPD0gNTsgbGluZSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCAwLCB5LCBjdXJyLldpZHRoKzQsIHkpO1xuICAgICAgICAgICAgICAgICAgICB5ICs9IFNoZWV0TXVzaWMuTGluZVdpZHRoICsgU2hlZXRNdXNpYy5MaW5lU3BhY2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0oeHBvcy0yKSwgMCk7XG5cbiAgICAgICAgICAgICAgICBpZiAocHJldkNob3JkICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0ocHJldl94cG9zLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgcHJldkNob3JkLkRyYXcoZywgcGVuLCB5dG9wKTtcbiAgICAgICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLXByZXZfeHBvcywgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzaG93TWVhc3VyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgRHJhd01lYXN1cmVOdW1iZXJzKGcsIHBlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChseXJpY3MgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBEcmF3THlyaWNzKGcsIHBlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGN1cnIgaXMgQ2hvcmRTeW1ib2wpIHtcbiAgICAgICAgICAgICAgICBDaG9yZFN5bWJvbCBjaG9yZCA9IChDaG9yZFN5bWJvbCkgY3VycjtcbiAgICAgICAgICAgICAgICBpZiAoY2hvcmQuU3RlbSAhPSBudWxsICYmICFjaG9yZC5TdGVtLlJlY2VpdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHByZXZDaG9yZCA9IChDaG9yZFN5bWJvbCkgY3VycjtcbiAgICAgICAgICAgICAgICAgICAgcHJldl94cG9zID0geHBvcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB4cG9zICs9IGN1cnIuV2lkdGg7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBwdWxzZSB0aW1lIGNvcnJlc3BvbmRpbmcgdG8gdGhlIGdpdmVuIHBvaW50LlxuICAgICAqICBGaW5kIHRoZSBub3Rlcy9zeW1ib2xzIGNvcnJlc3BvbmRpbmcgdG8gdGhlIHggcG9zaXRpb24sXG4gICAgICogIGFuZCByZXR1cm4gdGhlIHN0YXJ0VGltZSAocHVsc2VUaW1lKSBvZiB0aGUgc3ltYm9sLlxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgUHVsc2VUaW1lRm9yUG9pbnQoUG9pbnQgcG9pbnQpIHtcblxuICAgICAgICBpbnQgeHBvcyA9IGtleXNpZ1dpZHRoO1xuICAgICAgICBpbnQgcHVsc2VUaW1lID0gc3RhcnR0aW1lO1xuICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBzeW0gaW4gc3ltYm9scykge1xuICAgICAgICAgICAgcHVsc2VUaW1lID0gc3ltLlN0YXJ0VGltZTtcbiAgICAgICAgICAgIGlmIChwb2ludC5YIDw9IHhwb3MgKyBzeW0uV2lkdGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHVsc2VUaW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeHBvcyArPSBzeW0uV2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHB1bHNlVGltZTtcbiAgICB9XG4gXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgc3RyaW5nIHJlc3VsdCA9IFwiU3RhZmYgY2xlZj1cIiArIGNsZWZzeW0uVG9TdHJpbmcoKSArIFwiXFxuXCI7XG4gICAgICAgIHJlc3VsdCArPSBcIiAgS2V5czpcXG5cIjtcbiAgICAgICAgZm9yZWFjaCAoQWNjaWRTeW1ib2wgYSBpbiBrZXlzKSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gXCIgICAgXCIgKyBhLlRvU3RyaW5nKCkgKyBcIlxcblwiO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCArPSBcIiAgU3ltYm9sczpcXG5cIjtcbiAgICAgICAgZm9yZWFjaCAoTXVzaWNTeW1ib2wgcyBpbiBrZXlzKSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gXCIgICAgXCIgKyBzLlRvU3RyaW5nKCkgKyBcIlxcblwiO1xuICAgICAgICB9XG4gICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIG0gaW4gc3ltYm9scykge1xuICAgICAgICAgICAgcmVzdWx0ICs9IFwiICAgIFwiICsgbS5Ub1N0cmluZygpICsgXCJcXG5cIjtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgKz0gXCJFbmQgU3RhZmZcXG5cIjtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbn1cblxufVxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbi8qKiBAY2xhc3MgU3RlbVxuICogVGhlIFN0ZW0gY2xhc3MgaXMgdXNlZCBieSBDaG9yZFN5bWJvbCB0byBkcmF3IHRoZSBzdGVtIHBvcnRpb24gb2ZcbiAqIHRoZSBjaG9yZC4gIFRoZSBzdGVtIGhhcyB0aGUgZm9sbG93aW5nIGZpZWxkczpcbiAqXG4gKiBkdXJhdGlvbiAgLSBUaGUgZHVyYXRpb24gb2YgdGhlIHN0ZW0uXG4gKiBkaXJlY3Rpb24gLSBFaXRoZXIgVXAgb3IgRG93blxuICogc2lkZSAgICAgIC0gRWl0aGVyIGxlZnQgb3IgcmlnaHRcbiAqIHRvcCAgICAgICAtIFRoZSB0b3Btb3N0IG5vdGUgaW4gdGhlIGNob3JkXG4gKiBib3R0b20gICAgLSBUaGUgYm90dG9tbW9zdCBub3RlIGluIHRoZSBjaG9yZFxuICogZW5kICAgICAgIC0gVGhlIG5vdGUgcG9zaXRpb24gd2hlcmUgdGhlIHN0ZW0gZW5kcy4gIFRoaXMgaXMgdXN1YWxseVxuICogICAgICAgICAgICAgc2l4IG5vdGVzIHBhc3QgdGhlIGxhc3Qgbm90ZSBpbiB0aGUgY2hvcmQuICBGb3IgOHRoLzE2dGhcbiAqICAgICAgICAgICAgIG5vdGVzLCB0aGUgc3RlbSBtdXN0IGV4dGVuZCBldmVuIG1vcmUuXG4gKlxuICogVGhlIFNoZWV0TXVzaWMgY2xhc3MgY2FuIGNoYW5nZSB0aGUgZGlyZWN0aW9uIG9mIGEgc3RlbSBhZnRlciBpdFxuICogaGFzIGJlZW4gY3JlYXRlZC4gIFRoZSBzaWRlIGFuZCBlbmQgZmllbGRzIG1heSBhbHNvIGNoYW5nZSBkdWUgdG9cbiAqIHRoZSBkaXJlY3Rpb24gY2hhbmdlLiAgQnV0IG90aGVyIGZpZWxkcyB3aWxsIG5vdCBjaGFuZ2UuXG4gKi9cbiBcbnB1YmxpYyBjbGFzcyBTdGVtIHtcbiAgICBwdWJsaWMgY29uc3QgaW50IFVwID0gICAxOyAgICAgIC8qIFRoZSBzdGVtIHBvaW50cyB1cCAqL1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRG93biA9IDI7ICAgICAgLyogVGhlIHN0ZW0gcG9pbnRzIGRvd24gKi9cbiAgICBwdWJsaWMgY29uc3QgaW50IExlZnRTaWRlID0gMTsgIC8qIFRoZSBzdGVtIGlzIHRvIHRoZSBsZWZ0IG9mIHRoZSBub3RlICovXG4gICAgcHVibGljIGNvbnN0IGludCBSaWdodFNpZGUgPSAyOyAvKiBUaGUgc3RlbSBpcyB0byB0aGUgcmlnaHQgb2YgdGhlIG5vdGUgKi9cblxuICAgIHByaXZhdGUgTm90ZUR1cmF0aW9uIGR1cmF0aW9uOyAvKiogRHVyYXRpb24gb2YgdGhlIHN0ZW0uICovXG4gICAgcHJpdmF0ZSBpbnQgZGlyZWN0aW9uOyAgICAgICAgIC8qKiBVcCwgRG93biwgb3IgTm9uZSAqL1xuICAgIHByaXZhdGUgV2hpdGVOb3RlIHRvcDsgICAgICAgICAvKiogVG9wbW9zdCBub3RlIGluIGNob3JkICovXG4gICAgcHJpdmF0ZSBXaGl0ZU5vdGUgYm90dG9tOyAgICAgIC8qKiBCb3R0b21tb3N0IG5vdGUgaW4gY2hvcmQgKi9cbiAgICBwcml2YXRlIFdoaXRlTm90ZSBlbmQ7ICAgICAgICAgLyoqIExvY2F0aW9uIG9mIGVuZCBvZiB0aGUgc3RlbSAqL1xuICAgIHByaXZhdGUgYm9vbCBub3Rlc292ZXJsYXA7ICAgICAvKiogRG8gdGhlIGNob3JkIG5vdGVzIG92ZXJsYXAgKi9cbiAgICBwcml2YXRlIGludCBzaWRlOyAgICAgICAgICAgICAgLyoqIExlZnQgc2lkZSBvciByaWdodCBzaWRlIG9mIG5vdGUgKi9cblxuICAgIHByaXZhdGUgU3RlbSBwYWlyOyAgICAgICAgICAgICAgLyoqIElmIHBhaXIgIT0gbnVsbCwgdGhpcyBpcyBhIGhvcml6b250YWwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBiZWFtIHN0ZW0gdG8gYW5vdGhlciBjaG9yZCAqL1xuICAgIHByaXZhdGUgaW50IHdpZHRoX3RvX3BhaXI7ICAgICAgLyoqIFRoZSB3aWR0aCAoaW4gcGl4ZWxzKSB0byB0aGUgY2hvcmQgcGFpciAqL1xuICAgIHByaXZhdGUgYm9vbCByZWNlaXZlcl9pbl9wYWlyOyAgLyoqIFRoaXMgc3RlbSBpcyB0aGUgcmVjZWl2ZXIgb2YgYSBob3Jpem9udGFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIGJlYW0gc3RlbSBmcm9tIGFub3RoZXIgY2hvcmQuICovXG5cbiAgICAvKiogR2V0L1NldCB0aGUgZGlyZWN0aW9uIG9mIHRoZSBzdGVtIChVcCBvciBEb3duKSAqL1xuICAgIHB1YmxpYyBpbnQgRGlyZWN0aW9uIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIGRpcmVjdGlvbjsgfVxuICAgICAgICBzZXQgeyBDaGFuZ2VEaXJlY3Rpb24odmFsdWUpOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgZHVyYXRpb24gb2YgdGhlIHN0ZW0gKEVpZ3RoLCBTaXh0ZWVudGgsIFRoaXJ0eVNlY29uZCkgKi9cbiAgICBwdWJsaWMgTm90ZUR1cmF0aW9uIER1cmF0aW9uIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIGR1cmF0aW9uOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgdG9wIG5vdGUgaW4gdGhlIGNob3JkLiBUaGlzIGlzIG5lZWRlZCB0byBkZXRlcm1pbmUgdGhlIHN0ZW0gZGlyZWN0aW9uICovXG4gICAgcHVibGljIFdoaXRlTm90ZSBUb3Age1xuICAgICAgICBnZXQgeyByZXR1cm4gdG9wOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgYm90dG9tIG5vdGUgaW4gdGhlIGNob3JkLiBUaGlzIGlzIG5lZWRlZCB0byBkZXRlcm1pbmUgdGhlIHN0ZW0gZGlyZWN0aW9uICovXG4gICAgcHVibGljIFdoaXRlTm90ZSBCb3R0b20ge1xuICAgICAgICBnZXQgeyByZXR1cm4gYm90dG9tOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldC9TZXQgdGhlIGxvY2F0aW9uIHdoZXJlIHRoZSBzdGVtIGVuZHMuICBUaGlzIGlzIHVzdWFsbHkgc2l4IG5vdGVzXG4gICAgICogcGFzdCB0aGUgbGFzdCBub3RlIGluIHRoZSBjaG9yZC4gU2VlIG1ldGhvZCBDYWxjdWxhdGVFbmQuXG4gICAgICovXG4gICAgcHVibGljIFdoaXRlTm90ZSBFbmQge1xuICAgICAgICBnZXQgeyByZXR1cm4gZW5kOyB9XG4gICAgICAgIHNldCB7IGVuZCA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgLyoqIFNldCB0aGlzIFN0ZW0gdG8gYmUgdGhlIHJlY2VpdmVyIG9mIGEgaG9yaXpvbnRhbCBiZWFtLCBhcyBwYXJ0XG4gICAgICogb2YgYSBjaG9yZCBwYWlyLiAgSW4gRHJhdygpLCBpZiB0aGlzIHN0ZW0gaXMgYSByZWNlaXZlciwgd2VcbiAgICAgKiBkb24ndCBkcmF3IGEgY3Vydnkgc3RlbSwgd2Ugb25seSBkcmF3IHRoZSB2ZXJ0aWNhbCBsaW5lLlxuICAgICAqL1xuICAgIHB1YmxpYyBib29sIFJlY2VpdmVyIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHJlY2VpdmVyX2luX3BhaXI7IH1cbiAgICAgICAgc2V0IHsgcmVjZWl2ZXJfaW5fcGFpciA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBzdGVtLiAgVGhlIHRvcCBub3RlLCBib3R0b20gbm90ZSwgYW5kIGRpcmVjdGlvbiBhcmUgXG4gICAgICogbmVlZGVkIGZvciBkcmF3aW5nIHRoZSB2ZXJ0aWNhbCBsaW5lIG9mIHRoZSBzdGVtLiAgVGhlIGR1cmF0aW9uIGlzIFxuICAgICAqIG5lZWRlZCB0byBkcmF3IHRoZSB0YWlsIG9mIHRoZSBzdGVtLiAgVGhlIG92ZXJsYXAgYm9vbGVhbiBpcyB0cnVlXG4gICAgICogaWYgdGhlIG5vdGVzIGluIHRoZSBjaG9yZCBvdmVybGFwLiAgSWYgdGhlIG5vdGVzIG92ZXJsYXAsIHRoZVxuICAgICAqIHN0ZW0gbXVzdCBiZSBkcmF3biBvbiB0aGUgcmlnaHQgc2lkZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgU3RlbShXaGl0ZU5vdGUgYm90dG9tLCBXaGl0ZU5vdGUgdG9wLCBcbiAgICAgICAgICAgICAgICBOb3RlRHVyYXRpb24gZHVyYXRpb24sIGludCBkaXJlY3Rpb24sIGJvb2wgb3ZlcmxhcCkge1xuXG4gICAgICAgIHRoaXMudG9wID0gdG9wO1xuICAgICAgICB0aGlzLmJvdHRvbSA9IGJvdHRvbTtcbiAgICAgICAgdGhpcy5kdXJhdGlvbiA9IGR1cmF0aW9uO1xuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgICAgICAgdGhpcy5ub3Rlc292ZXJsYXAgPSBvdmVybGFwO1xuICAgICAgICBpZiAoZGlyZWN0aW9uID09IFVwIHx8IG5vdGVzb3ZlcmxhcClcbiAgICAgICAgICAgIHNpZGUgPSBSaWdodFNpZGU7XG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICBzaWRlID0gTGVmdFNpZGU7XG4gICAgICAgIGVuZCA9IENhbGN1bGF0ZUVuZCgpO1xuICAgICAgICBwYWlyID0gbnVsbDtcbiAgICAgICAgd2lkdGhfdG9fcGFpciA9IDA7XG4gICAgICAgIHJlY2VpdmVyX2luX3BhaXIgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiogQ2FsY3VsYXRlIHRoZSB2ZXJ0aWNhbCBwb3NpdGlvbiAod2hpdGUgbm90ZSBrZXkpIHdoZXJlIFxuICAgICAqIHRoZSBzdGVtIGVuZHMgXG4gICAgICovXG4gICAgcHVibGljIFdoaXRlTm90ZSBDYWxjdWxhdGVFbmQoKSB7XG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT0gVXApIHtcbiAgICAgICAgICAgIFdoaXRlTm90ZSB3ID0gdG9wO1xuICAgICAgICAgICAgdyA9IHcuQWRkKDYpO1xuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGgpIHtcbiAgICAgICAgICAgICAgICB3ID0gdy5BZGQoMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG4gICAgICAgICAgICAgICAgdyA9IHcuQWRkKDQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGlyZWN0aW9uID09IERvd24pIHtcbiAgICAgICAgICAgIFdoaXRlTm90ZSB3ID0gYm90dG9tO1xuICAgICAgICAgICAgdyA9IHcuQWRkKC02KTtcbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uU2l4dGVlbnRoKSB7XG4gICAgICAgICAgICAgICAgdyA9IHcuQWRkKC0yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcbiAgICAgICAgICAgICAgICB3ID0gdy5BZGQoLTQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDsgIC8qIFNob3VsZG4ndCBoYXBwZW4gKi9cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBDaGFuZ2UgdGhlIGRpcmVjdGlvbiBvZiB0aGUgc3RlbS4gIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGJ5IFxuICAgICAqIENob3JkU3ltYm9sLk1ha2VQYWlyKCkuICBXaGVuIHR3byBjaG9yZHMgYXJlIGpvaW5lZCBieSBhIGhvcml6b250YWxcbiAgICAgKiBiZWFtLCB0aGVpciBzdGVtcyBtdXN0IHBvaW50IGluIHRoZSBzYW1lIGRpcmVjdGlvbiAodXAgb3IgZG93bikuXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgQ2hhbmdlRGlyZWN0aW9uKGludCBuZXdkaXJlY3Rpb24pIHtcbiAgICAgICAgZGlyZWN0aW9uID0gbmV3ZGlyZWN0aW9uO1xuICAgICAgICBpZiAoZGlyZWN0aW9uID09IFVwIHx8IG5vdGVzb3ZlcmxhcClcbiAgICAgICAgICAgIHNpZGUgPSBSaWdodFNpZGU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNpZGUgPSBMZWZ0U2lkZTtcbiAgICAgICAgZW5kID0gQ2FsY3VsYXRlRW5kKCk7XG4gICAgfVxuXG4gICAgLyoqIFBhaXIgdGhpcyBzdGVtIHdpdGggYW5vdGhlciBDaG9yZC4gIEluc3RlYWQgb2YgZHJhd2luZyBhIGN1cnZ5IHRhaWwsXG4gICAgICogdGhpcyBzdGVtIHdpbGwgbm93IGhhdmUgdG8gZHJhdyBhIGJlYW0gdG8gdGhlIGdpdmVuIHN0ZW0gcGFpci4gIFRoZVxuICAgICAqIHdpZHRoIChpbiBwaXhlbHMpIHRvIHRoaXMgc3RlbSBwYWlyIGlzIHBhc3NlZCBhcyBhcmd1bWVudC5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBTZXRQYWlyKFN0ZW0gcGFpciwgaW50IHdpZHRoX3RvX3BhaXIpIHtcbiAgICAgICAgdGhpcy5wYWlyID0gcGFpcjtcbiAgICAgICAgdGhpcy53aWR0aF90b19wYWlyID0gd2lkdGhfdG9fcGFpcjtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRydWUgaWYgdGhpcyBTdGVtIGlzIHBhcnQgb2YgYSBob3Jpem9udGFsIGJlYW0uICovXG4gICAgcHVibGljIGJvb2wgaXNCZWFtIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHJlY2VpdmVyX2luX3BhaXIgfHwgKHBhaXIgIT0gbnVsbCk7IH1cbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGlzIHN0ZW0uXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHkgbG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEBwYXJhbSB0b3BzdGFmZiAgVGhlIG5vdGUgYXQgdGhlIHRvcCBvZiB0aGUgc3RhZmYuXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgRHJhdyhHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCwgV2hpdGVOb3RlIHRvcHN0YWZmKSB7XG4gICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uV2hvbGUpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgRHJhd1ZlcnRpY2FsTGluZShnLCBwZW4sIHl0b3AsIHRvcHN0YWZmKTtcbiAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5RdWFydGVyIHx8IFxuICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZFF1YXJ0ZXIgfHwgXG4gICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uSGFsZiB8fFxuICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEhhbGYgfHxcbiAgICAgICAgICAgIHJlY2VpdmVyX2luX3BhaXIpIHtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhaXIgIT0gbnVsbClcbiAgICAgICAgICAgIERyYXdIb3JpekJhclN0ZW0oZywgcGVuLCB5dG9wLCB0b3BzdGFmZik7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIERyYXdDdXJ2eVN0ZW0oZywgcGVuLCB5dG9wLCB0b3BzdGFmZik7XG4gICAgfVxuXG4gICAgLyoqIERyYXcgdGhlIHZlcnRpY2FsIGxpbmUgb2YgdGhlIHN0ZW0gXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHkgbG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEBwYXJhbSB0b3BzdGFmZiAgVGhlIG5vdGUgYXQgdGhlIHRvcCBvZiB0aGUgc3RhZmYuXG4gICAgICovXG4gICAgcHJpdmF0ZSB2b2lkIERyYXdWZXJ0aWNhbExpbmUoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3AsIFdoaXRlTm90ZSB0b3BzdGFmZikge1xuICAgICAgICBpbnQgeHN0YXJ0O1xuICAgICAgICBpZiAoc2lkZSA9PSBMZWZ0U2lkZSlcbiAgICAgICAgICAgIHhzdGFydCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyAxO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB4c3RhcnQgPSBTaGVldE11c2ljLkxpbmVTcGFjZS80ICsgU2hlZXRNdXNpYy5Ob3RlV2lkdGg7XG5cbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PSBVcCkge1xuICAgICAgICAgICAgaW50IHkxID0geXRvcCArIHRvcHN0YWZmLkRpc3QoYm90dG9tKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yIFxuICAgICAgICAgICAgICAgICAgICAgICArIFNoZWV0TXVzaWMuTm90ZUhlaWdodC80O1xuXG4gICAgICAgICAgICBpbnQgeXN0ZW0gPSB5dG9wICsgdG9wc3RhZmYuRGlzdChlbmQpICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG5cbiAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHkxLCB4c3RhcnQsIHlzdGVtKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkaXJlY3Rpb24gPT0gRG93bikge1xuICAgICAgICAgICAgaW50IHkxID0geXRvcCArIHRvcHN0YWZmLkRpc3QodG9wKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yIFxuICAgICAgICAgICAgICAgICAgICAgICArIFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcblxuICAgICAgICAgICAgaWYgKHNpZGUgPT0gTGVmdFNpZGUpXG4gICAgICAgICAgICAgICAgeTEgPSB5MSAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodC80O1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHkxID0geTEgLSBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcblxuICAgICAgICAgICAgaW50IHlzdGVtID0geXRvcCArIHRvcHN0YWZmLkRpc3QoZW5kKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yIFxuICAgICAgICAgICAgICAgICAgICAgICAgICArIFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcblxuICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeTEsIHhzdGFydCwgeXN0ZW0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIERyYXcgYSBjdXJ2eSBzdGVtIHRhaWwuICBUaGlzIGlzIG9ubHkgdXNlZCBmb3Igc2luZ2xlIGNob3Jkcywgbm90IGNob3JkIHBhaXJzLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5IGxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKiBAcGFyYW0gdG9wc3RhZmYgIFRoZSBub3RlIGF0IHRoZSB0b3Agb2YgdGhlIHN0YWZmLlxuICAgICAqL1xuICAgIHByaXZhdGUgdm9pZCBEcmF3Q3VydnlTdGVtKEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wLCBXaGl0ZU5vdGUgdG9wc3RhZmYpIHtcblxuICAgICAgICBwZW4uV2lkdGggPSAyO1xuXG4gICAgICAgIGludCB4c3RhcnQgPSAwO1xuICAgICAgICBpZiAoc2lkZSA9PSBMZWZ0U2lkZSlcbiAgICAgICAgICAgIHhzdGFydCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyAxO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB4c3RhcnQgPSBTaGVldE11c2ljLkxpbmVTcGFjZS80ICsgU2hlZXRNdXNpYy5Ob3RlV2lkdGg7XG5cbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PSBVcCkge1xuICAgICAgICAgICAgaW50IHlzdGVtID0geXRvcCArIHRvcHN0YWZmLkRpc3QoZW5kKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG5cbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRWlnaHRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UcmlwbGV0IHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0JlemllcihwZW4sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIHlzdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSArIDMqU2hlZXRNdXNpYy5MaW5lU3BhY2UvMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UqMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCozKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHlzdGVtICs9IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcblxuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG5cbiAgICAgICAgICAgICAgICBnLkRyYXdCZXppZXIocGVuLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCB5c3RlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gKyAzKlNoZWV0TXVzaWMuTGluZVNwYWNlLzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlKjIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZS8yLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gKyBTaGVldE11c2ljLk5vdGVIZWlnaHQqMyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHlzdGVtICs9IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG4gICAgICAgICAgICAgICAgZy5EcmF3QmV6aWVyKHBlbiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgeXN0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtICsgMypTaGVldE11c2ljLkxpbmVTcGFjZS8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZSoyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gKyBTaGVldE11c2ljLk5vdGVIZWlnaHQqMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBlbHNlIGlmIChkaXJlY3Rpb24gPT0gRG93bikge1xuICAgICAgICAgICAgaW50IHlzdGVtID0geXRvcCArIHRvcHN0YWZmLkRpc3QoZW5kKSpTaGVldE11c2ljLk5vdGVIZWlnaHQvMiArXG4gICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG5cbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRWlnaHRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UcmlwbGV0IHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0JlemllcihwZW4sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIHlzdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZSoyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gLSBTaGVldE11c2ljLk5vdGVIZWlnaHQqMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyIC0gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB5c3RlbSAtPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG5cbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uU2l4dGVlbnRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRoaXJ0eVNlY29uZCkge1xuXG4gICAgICAgICAgICAgICAgZy5EcmF3QmV6aWVyKHBlbiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgeXN0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlKjIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIgLSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxpbmVTcGFjZS8yKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgeXN0ZW0gLT0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcbiAgICAgICAgICAgICAgICBnLkRyYXdCZXppZXIocGVuLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCB5c3RlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gLSBTaGVldE11c2ljLkxpbmVTcGFjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UqMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gLSBTaGVldE11c2ljLk5vdGVIZWlnaHQqMiAtIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICAgICAgcGVuLldpZHRoID0gMTtcblxuICAgIH1cblxuICAgIC8qIERyYXcgYSBob3Jpem9udGFsIGJlYW0gc3RlbSwgY29ubmVjdGluZyB0aGlzIHN0ZW0gd2l0aCB0aGUgU3RlbSBwYWlyLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5IGxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKiBAcGFyYW0gdG9wc3RhZmYgIFRoZSBub3RlIGF0IHRoZSB0b3Agb2YgdGhlIHN0YWZmLlxuICAgICAqL1xuICAgIHByaXZhdGUgdm9pZCBEcmF3SG9yaXpCYXJTdGVtKEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wLCBXaGl0ZU5vdGUgdG9wc3RhZmYpIHtcbiAgICAgICAgcGVuLldpZHRoID0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG5cbiAgICAgICAgaW50IHhzdGFydCA9IDA7XG4gICAgICAgIGludCB4c3RhcnQyID0gMDtcblxuICAgICAgICBpZiAoc2lkZSA9PSBMZWZ0U2lkZSlcbiAgICAgICAgICAgIHhzdGFydCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyAxO1xuICAgICAgICBlbHNlIGlmIChzaWRlID09IFJpZ2h0U2lkZSlcbiAgICAgICAgICAgIHhzdGFydCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyBTaGVldE11c2ljLk5vdGVXaWR0aDtcblxuICAgICAgICBpZiAocGFpci5zaWRlID09IExlZnRTaWRlKVxuICAgICAgICAgICAgeHN0YXJ0MiA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyAxO1xuICAgICAgICBlbHNlIGlmIChwYWlyLnNpZGUgPT0gUmlnaHRTaWRlKVxuICAgICAgICAgICAgeHN0YXJ0MiA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyBTaGVldE11c2ljLk5vdGVXaWR0aDtcblxuXG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT0gVXApIHtcbiAgICAgICAgICAgIGludCB4ZW5kID0gd2lkdGhfdG9fcGFpciArIHhzdGFydDI7XG4gICAgICAgICAgICBpbnQgeXN0YXJ0ID0geXRvcCArIHRvcHN0YWZmLkRpc3QoZW5kKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICAgICAgaW50IHllbmQgPSB5dG9wICsgdG9wc3RhZmYuRGlzdChwYWlyLmVuZCkgKiBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcblxuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5FaWdodGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoIHx8IFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UcmlwbGV0IHx8IFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG5cbiAgICAgICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5c3RhcnQsIHhlbmQsIHllbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeXN0YXJ0ICs9IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgIHllbmQgKz0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuXG4gICAgICAgICAgICAvKiBBIGRvdHRlZCBlaWdodGggd2lsbCBjb25uZWN0IHRvIGEgMTZ0aCBub3RlLiAqL1xuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGgpIHtcbiAgICAgICAgICAgICAgICBpbnQgeCA9IHhlbmQgLSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICAgICAgZG91YmxlIHNsb3BlID0gKHllbmQgLSB5c3RhcnQpICogMS4wIC8gKHhlbmQgLSB4c3RhcnQpO1xuICAgICAgICAgICAgICAgIGludCB5ID0gKGludCkoc2xvcGUgKiAoeCAtIHhlbmQpICsgeWVuZCk7IFxuXG4gICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHgsIHksIHhlbmQsIHllbmQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHlzdGFydCwgeGVuZCwgeWVuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB5c3RhcnQgKz0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgeWVuZCArPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG4gICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeXN0YXJ0LCB4ZW5kLCB5ZW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaW50IHhlbmQgPSB3aWR0aF90b19wYWlyICsgeHN0YXJ0MjtcbiAgICAgICAgICAgIGludCB5c3RhcnQgPSB5dG9wICsgdG9wc3RhZmYuRGlzdChlbmQpICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgKyBcbiAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICBpbnQgeWVuZCA9IHl0b3AgKyB0b3BzdGFmZi5EaXN0KHBhaXIuZW5kKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yIFxuICAgICAgICAgICAgICAgICAgICAgICAgICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuXG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkVpZ2h0aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVHJpcGxldCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG5cbiAgICAgICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5c3RhcnQsIHhlbmQsIHllbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeXN0YXJ0IC09IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgIHllbmQgLT0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuXG4gICAgICAgICAgICAvKiBBIGRvdHRlZCBlaWdodGggd2lsbCBjb25uZWN0IHRvIGEgMTZ0aCBub3RlLiAqL1xuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGgpIHtcbiAgICAgICAgICAgICAgICBpbnQgeCA9IHhlbmQgLSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICAgICAgZG91YmxlIHNsb3BlID0gKHllbmQgLSB5c3RhcnQpICogMS4wIC8gKHhlbmQgLSB4c3RhcnQpO1xuICAgICAgICAgICAgICAgIGludCB5ID0gKGludCkoc2xvcGUgKiAoeCAtIHhlbmQpICsgeWVuZCk7IFxuXG4gICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHgsIHksIHhlbmQsIHllbmQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHlzdGFydCwgeGVuZCwgeWVuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB5c3RhcnQgLT0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgeWVuZCAtPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG4gICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeXN0YXJ0LCB4ZW5kLCB5ZW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiU3RlbSBkdXJhdGlvbj17MH0gZGlyZWN0aW9uPXsxfSB0b3A9ezJ9IGJvdHRvbT17M30gZW5kPXs0fVwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgb3ZlcmxhcD17NX0gc2lkZT17Nn0gd2lkdGhfdG9fcGFpcj17N30gcmVjZWl2ZXJfaW5fcGFpcj17OH1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHVyYXRpb24sIGRpcmVjdGlvbiwgdG9wLlRvU3RyaW5nKCksIGJvdHRvbS5Ub1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmQuVG9TdHJpbmcoKSwgbm90ZXNvdmVybGFwLCBzaWRlLCB3aWR0aF90b19wYWlyLCByZWNlaXZlcl9pbl9wYWlyKTtcbiAgICB9XG5cbn0gXG5cblxufVxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogQGNsYXNzIFN5bWJvbFdpZHRoc1xuICogVGhlIFN5bWJvbFdpZHRocyBjbGFzcyBpcyB1c2VkIHRvIHZlcnRpY2FsbHkgYWxpZ24gbm90ZXMgaW4gZGlmZmVyZW50XG4gKiB0cmFja3MgdGhhdCBvY2N1ciBhdCB0aGUgc2FtZSB0aW1lICh0aGF0IGhhdmUgdGhlIHNhbWUgc3RhcnR0aW1lKS5cbiAqIFRoaXMgaXMgZG9uZSBieSB0aGUgZm9sbG93aW5nOlxuICogLSBTdG9yZSBhIGxpc3Qgb2YgYWxsIHRoZSBzdGFydCB0aW1lcy5cbiAqIC0gU3RvcmUgdGhlIHdpZHRoIG9mIHN5bWJvbHMgZm9yIGVhY2ggc3RhcnQgdGltZSwgZm9yIGVhY2ggdHJhY2suXG4gKiAtIFN0b3JlIHRoZSBtYXhpbXVtIHdpZHRoIGZvciBlYWNoIHN0YXJ0IHRpbWUsIGFjcm9zcyBhbGwgdHJhY2tzLlxuICogLSBHZXQgdGhlIGV4dHJhIHdpZHRoIG5lZWRlZCBmb3IgZWFjaCB0cmFjayB0byBtYXRjaCB0aGUgbWF4aW11bVxuICogICB3aWR0aCBmb3IgdGhhdCBzdGFydCB0aW1lLlxuICpcbiAqIFNlZSBtZXRob2QgU2hlZXRNdXNpYy5BbGlnblN5bWJvbHMoKSwgd2hpY2ggdXNlcyB0aGlzIGNsYXNzLlxuICovXG5cbnB1YmxpYyBjbGFzcyBTeW1ib2xXaWR0aHMge1xuXG4gICAgLyoqIEFycmF5IG9mIG1hcHMgKHN0YXJ0dGltZSAtPiBzeW1ib2wgd2lkdGgpLCBvbmUgcGVyIHRyYWNrICovXG4gICAgcHJpdmF0ZSBEaWN0aW9uYXJ5PGludCwgaW50PltdIHdpZHRocztcblxuICAgIC8qKiBNYXAgb2Ygc3RhcnR0aW1lIC0+IG1heGltdW0gc3ltYm9sIHdpZHRoICovXG4gICAgcHJpdmF0ZSBEaWN0aW9uYXJ5PGludCwgaW50PiBtYXh3aWR0aHM7XG5cbiAgICAvKiogQW4gYXJyYXkgb2YgYWxsIHRoZSBzdGFydHRpbWVzLCBpbiBhbGwgdHJhY2tzICovXG4gICAgcHJpdmF0ZSBpbnRbXSBzdGFydHRpbWVzO1xuXG5cbiAgICAvKiogSW5pdGlhbGl6ZSB0aGUgc3ltYm9sIHdpZHRoIG1hcHMsIGdpdmVuIGFsbCB0aGUgc3ltYm9scyBpblxuICAgICAqIGFsbCB0aGUgdHJhY2tzLCBwbHVzIHRoZSBseXJpY3MgaW4gYWxsIHRyYWNrcy5cbiAgICAgKi9cbiAgICBwdWJsaWMgU3ltYm9sV2lkdGhzKExpc3Q8TXVzaWNTeW1ib2w+W10gdHJhY2tzLFxuICAgICAgICAgICAgICAgICAgICAgICAgTGlzdDxMeXJpY1N5bWJvbD5bXSB0cmFja2x5cmljcykge1xuXG4gICAgICAgIC8qIEdldCB0aGUgc3ltYm9sIHdpZHRocyBmb3IgYWxsIHRoZSB0cmFja3MgKi9cbiAgICAgICAgd2lkdGhzID0gbmV3IERpY3Rpb25hcnk8aW50LGludD5bIHRyYWNrcy5MZW5ndGggXTtcbiAgICAgICAgZm9yIChpbnQgdHJhY2sgPSAwOyB0cmFjayA8IHRyYWNrcy5MZW5ndGg7IHRyYWNrKyspIHtcbiAgICAgICAgICAgIHdpZHRoc1t0cmFja10gPSBHZXRUcmFja1dpZHRocyh0cmFja3NbdHJhY2tdKTtcbiAgICAgICAgfVxuICAgICAgICBtYXh3aWR0aHMgPSBuZXcgRGljdGlvbmFyeTxpbnQsaW50PigpO1xuXG4gICAgICAgIC8qIENhbGN1bGF0ZSB0aGUgbWF4aW11bSBzeW1ib2wgd2lkdGhzICovXG4gICAgICAgIGZvcmVhY2ggKERpY3Rpb25hcnk8aW50LGludD4gZGljdCBpbiB3aWR0aHMpIHtcbiAgICAgICAgICAgIGZvcmVhY2ggKGludCB0aW1lIGluIGRpY3QuS2V5cykge1xuICAgICAgICAgICAgICAgIGlmICghbWF4d2lkdGhzLkNvbnRhaW5zS2V5KHRpbWUpIHx8XG4gICAgICAgICAgICAgICAgICAgIChtYXh3aWR0aHNbdGltZV0gPCBkaWN0W3RpbWVdKSApIHtcblxuICAgICAgICAgICAgICAgICAgICBtYXh3aWR0aHNbdGltZV0gPSBkaWN0W3RpbWVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0cmFja2x5cmljcyAhPSBudWxsKSB7XG4gICAgICAgICAgICBmb3JlYWNoIChMaXN0PEx5cmljU3ltYm9sPiBseXJpY3MgaW4gdHJhY2tseXJpY3MpIHtcbiAgICAgICAgICAgICAgICBpZiAobHlyaWNzID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKEx5cmljU3ltYm9sIGx5cmljIGluIGx5cmljcykge1xuICAgICAgICAgICAgICAgICAgICBpbnQgd2lkdGggPSBseXJpYy5NaW5XaWR0aDtcbiAgICAgICAgICAgICAgICAgICAgaW50IHRpbWUgPSBseXJpYy5TdGFydFRpbWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICghbWF4d2lkdGhzLkNvbnRhaW5zS2V5KHRpbWUpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAobWF4d2lkdGhzW3RpbWVdIDwgd2lkdGgpICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXh3aWR0aHNbdGltZV0gPSB3aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFN0b3JlIGFsbCB0aGUgc3RhcnQgdGltZXMgdG8gdGhlIHN0YXJ0dGltZSBhcnJheSAqL1xuICAgICAgICBzdGFydHRpbWVzID0gbmV3IGludFsgbWF4d2lkdGhzLktleXMuQ291bnQgXTtcbiAgICAgICAgbWF4d2lkdGhzLktleXMuQ29weVRvKHN0YXJ0dGltZXMsIDApO1xuICAgICAgICBBcnJheS5Tb3J0PGludD4oc3RhcnR0aW1lcyk7XG4gICAgfVxuXG4gICAgLyoqIENyZWF0ZSBhIHRhYmxlIG9mIHRoZSBzeW1ib2wgd2lkdGhzIGZvciBlYWNoIHN0YXJ0dGltZSBpbiB0aGUgdHJhY2suICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgRGljdGlvbmFyeTxpbnQsaW50PiBHZXRUcmFja1dpZHRocyhMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzKSB7XG4gICAgICAgIERpY3Rpb25hcnk8aW50LGludD4gd2lkdGhzID0gbmV3IERpY3Rpb25hcnk8aW50LGludD4oKTtcblxuICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBtIGluIHN5bWJvbHMpIHtcbiAgICAgICAgICAgIGludCBzdGFydCA9IG0uU3RhcnRUaW1lO1xuICAgICAgICAgICAgaW50IHcgPSBtLk1pbldpZHRoO1xuXG4gICAgICAgICAgICBpZiAobSBpcyBCYXJTeW1ib2wpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHdpZHRocy5Db250YWluc0tleShzdGFydCkpIHtcbiAgICAgICAgICAgICAgICB3aWR0aHNbc3RhcnRdICs9IHc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB3aWR0aHNbc3RhcnRdID0gdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gd2lkdGhzO1xuICAgIH1cblxuICAgIC8qKiBHaXZlbiBhIHRyYWNrIGFuZCBhIHN0YXJ0IHRpbWUsIHJldHVybiB0aGUgZXh0cmEgd2lkdGggbmVlZGVkIHNvIHRoYXRcbiAgICAgKiB0aGUgc3ltYm9scyBmb3IgdGhhdCBzdGFydCB0aW1lIGFsaWduIHdpdGggdGhlIG90aGVyIHRyYWNrcy5cbiAgICAgKi9cbiAgICBwdWJsaWMgaW50IEdldEV4dHJhV2lkdGgoaW50IHRyYWNrLCBpbnQgc3RhcnQpIHtcbiAgICAgICAgaWYgKCF3aWR0aHNbdHJhY2tdLkNvbnRhaW5zS2V5KHN0YXJ0KSkge1xuICAgICAgICAgICAgcmV0dXJuIG1heHdpZHRoc1tzdGFydF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbWF4d2lkdGhzW3N0YXJ0XSAtIHdpZHRoc1t0cmFja11bc3RhcnRdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiBhbiBhcnJheSBvZiBhbGwgdGhlIHN0YXJ0IHRpbWVzIGluIGFsbCB0aGUgdHJhY2tzICovXG4gICAgcHVibGljIGludFtdIFN0YXJ0VGltZXMge1xuICAgICAgICBnZXQgeyByZXR1cm4gc3RhcnR0aW1lczsgfVxuICAgIH1cblxuXG5cblxufVxuXG5cbn1cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMSBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIFRoZSBwb3NzaWJsZSBub3RlIGR1cmF0aW9ucyAqL1xucHVibGljIGVudW0gTm90ZUR1cmF0aW9uIHtcbiAgVGhpcnR5U2Vjb25kLCBTaXh0ZWVudGgsIFRyaXBsZXQsIEVpZ2h0aCxcbiAgRG90dGVkRWlnaHRoLCBRdWFydGVyLCBEb3R0ZWRRdWFydGVyLFxuICBIYWxmLCBEb3R0ZWRIYWxmLCBXaG9sZVxufTtcblxuLyoqIEBjbGFzcyBUaW1lU2lnbmF0dXJlXG4gKiBUaGUgVGltZVNpZ25hdHVyZSBjbGFzcyByZXByZXNlbnRzXG4gKiAtIFRoZSB0aW1lIHNpZ25hdHVyZSBvZiB0aGUgc29uZywgc3VjaCBhcyA0LzQsIDMvNCwgb3IgNi84IHRpbWUsIGFuZFxuICogLSBUaGUgbnVtYmVyIG9mIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlXG4gKiAtIFRoZSBudW1iZXIgb2YgbWljcm9zZWNvbmRzIHBlciBxdWFydGVyIG5vdGVcbiAqXG4gKiBJbiBtaWRpIGZpbGVzLCBhbGwgdGltZSBpcyBtZWFzdXJlZCBpbiBcInB1bHNlc1wiLiAgRWFjaCBub3RlIGhhc1xuICogYSBzdGFydCB0aW1lIChtZWFzdXJlZCBpbiBwdWxzZXMpLCBhbmQgYSBkdXJhdGlvbiAobWVhc3VyZWQgaW4gXG4gKiBwdWxzZXMpLiAgVGhpcyBjbGFzcyBpcyB1c2VkIG1haW5seSB0byBjb252ZXJ0IHB1bHNlIGR1cmF0aW9uc1xuICogKGxpa2UgMTIwLCAyNDAsIGV0YykgaW50byBub3RlIGR1cmF0aW9ucyAoaGFsZiwgcXVhcnRlciwgZWlnaHRoLCBldGMpLlxuICovXG5cbnB1YmxpYyBjbGFzcyBUaW1lU2lnbmF0dXJlIHtcbiAgICBwcml2YXRlIGludCBudW1lcmF0b3I7ICAgICAgLyoqIE51bWVyYXRvciBvZiB0aGUgdGltZSBzaWduYXR1cmUgKi9cbiAgICBwcml2YXRlIGludCBkZW5vbWluYXRvcjsgICAgLyoqIERlbm9taW5hdG9yIG9mIHRoZSB0aW1lIHNpZ25hdHVyZSAqL1xuICAgIHByaXZhdGUgaW50IHF1YXJ0ZXJub3RlOyAgICAvKiogTnVtYmVyIG9mIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlICovXG4gICAgcHJpdmF0ZSBpbnQgbWVhc3VyZTsgICAgICAgIC8qKiBOdW1iZXIgb2YgcHVsc2VzIHBlciBtZWFzdXJlICovXG4gICAgcHJpdmF0ZSBpbnQgdGVtcG87ICAgICAgICAgIC8qKiBOdW1iZXIgb2YgbWljcm9zZWNvbmRzIHBlciBxdWFydGVyIG5vdGUgKi9cblxuICAgIC8qKiBHZXQgdGhlIG51bWVyYXRvciBvZiB0aGUgdGltZSBzaWduYXR1cmUgKi9cbiAgICBwdWJsaWMgaW50IE51bWVyYXRvciB7XG4gICAgICAgIGdldCB7IHJldHVybiBudW1lcmF0b3I7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBkZW5vbWluYXRvciBvZiB0aGUgdGltZSBzaWduYXR1cmUgKi9cbiAgICBwdWJsaWMgaW50IERlbm9taW5hdG9yIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIGRlbm9taW5hdG9yOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlICovXG4gICAgcHVibGljIGludCBRdWFydGVyIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHF1YXJ0ZXJub3RlOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHB1bHNlcyBwZXIgbWVhc3VyZSAqL1xuICAgIHB1YmxpYyBpbnQgTWVhc3VyZSB7XG4gICAgICAgIGdldCB7IHJldHVybiBtZWFzdXJlOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIG1pY3Jvc2Vjb25kcyBwZXIgcXVhcnRlciBub3RlICovIFxuICAgIHB1YmxpYyBpbnQgVGVtcG8ge1xuICAgICAgICBnZXQgeyByZXR1cm4gdGVtcG87IH1cbiAgICB9XG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IHRpbWUgc2lnbmF0dXJlLCB3aXRoIHRoZSBnaXZlbiBudW1lcmF0b3IsXG4gICAgICogZGVub21pbmF0b3IsIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlLCBhbmQgdGVtcG8uXG4gICAgICovXG4gICAgcHVibGljIFRpbWVTaWduYXR1cmUoaW50IG51bWVyYXRvciwgaW50IGRlbm9taW5hdG9yLCBpbnQgcXVhcnRlcm5vdGUsIGludCB0ZW1wbykge1xuICAgICAgICBpZiAobnVtZXJhdG9yIDw9IDAgfHwgZGVub21pbmF0b3IgPD0gMCB8fCBxdWFydGVybm90ZSA8PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXCJJbnZhbGlkIHRpbWUgc2lnbmF0dXJlXCIsIDApO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogTWlkaSBGaWxlIGdpdmVzIHdyb25nIHRpbWUgc2lnbmF0dXJlIHNvbWV0aW1lcyAqL1xuICAgICAgICBpZiAobnVtZXJhdG9yID09IDUpIHtcbiAgICAgICAgICAgIG51bWVyYXRvciA9IDQ7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm51bWVyYXRvciA9IG51bWVyYXRvcjtcbiAgICAgICAgdGhpcy5kZW5vbWluYXRvciA9IGRlbm9taW5hdG9yO1xuICAgICAgICB0aGlzLnF1YXJ0ZXJub3RlID0gcXVhcnRlcm5vdGU7XG4gICAgICAgIHRoaXMudGVtcG8gPSB0ZW1wbztcblxuICAgICAgICBpbnQgYmVhdDtcbiAgICAgICAgaWYgKGRlbm9taW5hdG9yIDwgNClcbiAgICAgICAgICAgIGJlYXQgPSBxdWFydGVybm90ZSAqIDI7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJlYXQgPSBxdWFydGVybm90ZSAvIChkZW5vbWluYXRvci80KTtcblxuICAgICAgICBtZWFzdXJlID0gbnVtZXJhdG9yICogYmVhdDtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHdoaWNoIG1lYXN1cmUgdGhlIGdpdmVuIHRpbWUgKGluIHB1bHNlcykgYmVsb25ncyB0by4gKi9cbiAgICBwdWJsaWMgaW50IEdldE1lYXN1cmUoaW50IHRpbWUpIHtcbiAgICAgICAgcmV0dXJuIHRpbWUgLyBtZWFzdXJlO1xuICAgIH1cblxuICAgIC8qKiBHaXZlbiBhIGR1cmF0aW9uIGluIHB1bHNlcywgcmV0dXJuIHRoZSBjbG9zZXN0IG5vdGUgZHVyYXRpb24uICovXG4gICAgcHVibGljIE5vdGVEdXJhdGlvbiBHZXROb3RlRHVyYXRpb24oaW50IGR1cmF0aW9uKSB7XG4gICAgICAgIGludCB3aG9sZSA9IHF1YXJ0ZXJub3RlICogNDtcblxuICAgICAgICAvKipcbiAgICAgICAgIDEgICAgICAgPSAzMi8zMlxuICAgICAgICAgMy80ICAgICA9IDI0LzMyXG4gICAgICAgICAxLzIgICAgID0gMTYvMzJcbiAgICAgICAgIDMvOCAgICAgPSAxMi8zMlxuICAgICAgICAgMS80ICAgICA9ICA4LzMyXG4gICAgICAgICAzLzE2ICAgID0gIDYvMzJcbiAgICAgICAgIDEvOCAgICAgPSAgNC8zMiA9ICAgIDgvNjRcbiAgICAgICAgIHRyaXBsZXQgICAgICAgICA9IDUuMzMvNjRcbiAgICAgICAgIDEvMTYgICAgPSAgMi8zMiA9ICAgIDQvNjRcbiAgICAgICAgIDEvMzIgICAgPSAgMS8zMiA9ICAgIDIvNjRcbiAgICAgICAgICoqLyBcblxuICAgICAgICBpZiAgICAgIChkdXJhdGlvbiA+PSAyOCp3aG9sZS8zMilcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uV2hvbGU7XG4gICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID49IDIwKndob2xlLzMyKSBcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uRG90dGVkSGFsZjtcbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPj0gMTQqd2hvbGUvMzIpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLkhhbGY7XG4gICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID49IDEwKndob2xlLzMyKVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5Eb3R0ZWRRdWFydGVyO1xuICAgICAgICBlbHNlIGlmIChkdXJhdGlvbiA+PSAgNyp3aG9sZS8zMilcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uUXVhcnRlcjtcbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPj0gIDUqd2hvbGUvMzIpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aDtcbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPj0gIDYqd2hvbGUvNjQpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLkVpZ2h0aDtcbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPj0gIDUqd2hvbGUvNjQpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLlRyaXBsZXQ7XG4gICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID49ICAzKndob2xlLzY0KVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5TaXh0ZWVudGg7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kO1xuICAgIH1cblxuICAgIC8qKiBDb252ZXJ0IGEgbm90ZSBkdXJhdGlvbiBpbnRvIGEgc3RlbSBkdXJhdGlvbi4gIERvdHRlZCBkdXJhdGlvbnNcbiAgICAgKiBhcmUgY29udmVydGVkIGludG8gdGhlaXIgbm9uLWRvdHRlZCBlcXVpdmFsZW50cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIE5vdGVEdXJhdGlvbiBHZXRTdGVtRHVyYXRpb24oTm90ZUR1cmF0aW9uIGR1cikge1xuICAgICAgICBpZiAoZHVyID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRIYWxmKVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5IYWxmO1xuICAgICAgICBlbHNlIGlmIChkdXIgPT0gTm90ZUR1cmF0aW9uLkRvdHRlZFF1YXJ0ZXIpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLlF1YXJ0ZXI7XG4gICAgICAgIGVsc2UgaWYgKGR1ciA9PSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoKVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5FaWdodGg7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBkdXI7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgdGltZSBwZXJpb2QgKGluIHB1bHNlcykgdGhlIHRoZSBnaXZlbiBkdXJhdGlvbiBzcGFucyAqL1xuICAgIHB1YmxpYyBpbnQgRHVyYXRpb25Ub1RpbWUoTm90ZUR1cmF0aW9uIGR1cikge1xuICAgICAgICBpbnQgZWlnaHRoID0gcXVhcnRlcm5vdGUvMjtcbiAgICAgICAgaW50IHNpeHRlZW50aCA9IGVpZ2h0aC8yO1xuXG4gICAgICAgIHN3aXRjaCAoZHVyKSB7XG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5XaG9sZTogICAgICAgICByZXR1cm4gcXVhcnRlcm5vdGUgKiA0OyBcbiAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkRvdHRlZEhhbGY6ICAgIHJldHVybiBxdWFydGVybm90ZSAqIDM7IFxuICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uSGFsZjogICAgICAgICAgcmV0dXJuIHF1YXJ0ZXJub3RlICogMjsgXG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5Eb3R0ZWRRdWFydGVyOiByZXR1cm4gMyplaWdodGg7IFxuICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uUXVhcnRlcjogICAgICAgcmV0dXJuIHF1YXJ0ZXJub3RlOyBcbiAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aDogIHJldHVybiAzKnNpeHRlZW50aDtcbiAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkVpZ2h0aDogICAgICAgIHJldHVybiBlaWdodGg7XG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5UcmlwbGV0OiAgICAgICByZXR1cm4gcXVhcnRlcm5vdGUvMzsgXG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5TaXh0ZWVudGg6ICAgICByZXR1cm4gc2l4dGVlbnRoO1xuICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kOiAgcmV0dXJuIHNpeHRlZW50aC8yOyBcbiAgICAgICAgICAgIGRlZmF1bHQ6ICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgb3ZlcnJpZGUgXG4gICAgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gc3RyaW5nLkZvcm1hdChcIlRpbWVTaWduYXR1cmU9ezB9L3sxfSBxdWFydGVyPXsyfSB0ZW1wbz17M31cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtZXJhdG9yLCBkZW5vbWluYXRvciwgcXVhcnRlcm5vdGUsIHRlbXBvKTtcbiAgICB9XG4gICAgXG59XG5cbn1cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG5cbi8qKiBBY2NpZGVudGFscyAqL1xucHVibGljIGVudW0gQWNjaWQge1xuICAgIE5vbmUsIFNoYXJwLCBGbGF0LCBOYXR1cmFsXG59XG5cbi8qKiBAY2xhc3MgQWNjaWRTeW1ib2xcbiAqIEFuIGFjY2lkZW50YWwgKGFjY2lkKSBzeW1ib2wgcmVwcmVzZW50cyBhIHNoYXJwLCBmbGF0LCBvciBuYXR1cmFsXG4gKiBhY2NpZGVudGFsIHRoYXQgaXMgZGlzcGxheWVkIGF0IGEgc3BlY2lmaWMgcG9zaXRpb24gKG5vdGUgYW5kIGNsZWYpLlxuICovXG5wdWJsaWMgY2xhc3MgQWNjaWRTeW1ib2wgOiBNdXNpY1N5bWJvbCB7XG4gICAgcHJpdmF0ZSBBY2NpZCBhY2NpZDsgICAgICAgICAgLyoqIFRoZSBhY2NpZGVudGFsIChzaGFycCwgZmxhdCwgbmF0dXJhbCkgKi9cbiAgICBwcml2YXRlIFdoaXRlTm90ZSB3aGl0ZW5vdGU7ICAvKiogVGhlIHdoaXRlIG5vdGUgd2hlcmUgdGhlIHN5bWJvbCBvY2N1cnMgKi9cbiAgICBwcml2YXRlIENsZWYgY2xlZjsgICAgICAgICAgICAvKiogV2hpY2ggY2xlZiB0aGUgc3ltYm9scyBpcyBpbiAqL1xuICAgIHByaXZhdGUgaW50IHdpZHRoOyAgICAgICAgICAgIC8qKiBXaWR0aCBvZiBzeW1ib2wgKi9cblxuICAgIC8qKiBcbiAgICAgKiBDcmVhdGUgYSBuZXcgQWNjaWRTeW1ib2wgd2l0aCB0aGUgZ2l2ZW4gYWNjaWRlbnRhbCwgdGhhdCBpc1xuICAgICAqIGRpc3BsYXllZCBhdCB0aGUgZ2l2ZW4gbm90ZSBpbiB0aGUgZ2l2ZW4gY2xlZi5cbiAgICAgKi9cbiAgICBwdWJsaWMgQWNjaWRTeW1ib2woQWNjaWQgYWNjaWQsIFdoaXRlTm90ZSBub3RlLCBDbGVmIGNsZWYpIHtcbiAgICAgICAgdGhpcy5hY2NpZCA9IGFjY2lkO1xuICAgICAgICB0aGlzLndoaXRlbm90ZSA9IG5vdGU7XG4gICAgICAgIHRoaXMuY2xlZiA9IGNsZWY7XG4gICAgICAgIHdpZHRoID0gTWluV2lkdGg7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgd2hpdGUgbm90ZSB0aGlzIGFjY2lkZW50YWwgaXMgZGlzcGxheWVkIGF0ICovXG4gICAgcHVibGljIFdoaXRlTm90ZSBOb3RlICB7XG4gICAgICAgIGdldCB7IHJldHVybiB3aGl0ZW5vdGU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSB0aW1lIChpbiBwdWxzZXMpIHRoaXMgc3ltYm9sIG9jY3VycyBhdC5cbiAgICAgKiBOb3QgdXNlZC4gIEluc3RlYWQsIHRoZSBTdGFydFRpbWUgb2YgdGhlIENob3JkU3ltYm9sIGNvbnRhaW5pbmcgdGhpc1xuICAgICAqIEFjY2lkU3ltYm9sIGlzIHVzZWQuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBTdGFydFRpbWUgeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIC0xOyB9ICBcbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBtaW5pbXVtIHdpZHRoIChpbiBwaXhlbHMpIG5lZWRlZCB0byBkcmF3IHRoaXMgc3ltYm9sICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBNaW5XaWR0aCB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gMypTaGVldE11c2ljLk5vdGVIZWlnaHQvMjsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQvU2V0IHRoZSB3aWR0aCAoaW4gcGl4ZWxzKSBvZiB0aGlzIHN5bWJvbC4gVGhlIHdpZHRoIGlzIHNldFxuICAgICAqIGluIFNoZWV0TXVzaWMuQWxpZ25TeW1ib2xzKCkgdG8gdmVydGljYWxseSBhbGlnbiBzeW1ib2xzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgV2lkdGgge1xuICAgICAgICBnZXQgeyByZXR1cm4gd2lkdGg7IH1cbiAgICAgICAgc2V0IHsgd2lkdGggPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBhYm92ZSB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBBYm92ZVN0YWZmIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIEdldEFib3ZlU3RhZmYoKTsgfVxuICAgIH1cblxuICAgIGludCBHZXRBYm92ZVN0YWZmKCkge1xuICAgICAgICBpbnQgZGlzdCA9IFdoaXRlTm90ZS5Ub3AoY2xlZikuRGlzdCh3aGl0ZW5vdGUpICogXG4gICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG4gICAgICAgIGlmIChhY2NpZCA9PSBBY2NpZC5TaGFycCB8fCBhY2NpZCA9PSBBY2NpZC5OYXR1cmFsKVxuICAgICAgICAgICAgZGlzdCAtPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgIGVsc2UgaWYgKGFjY2lkID09IEFjY2lkLkZsYXQpXG4gICAgICAgICAgICBkaXN0IC09IDMqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG5cbiAgICAgICAgaWYgKGRpc3QgPCAwKVxuICAgICAgICAgICAgcmV0dXJuIC1kaXN0O1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYmVsb3cgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQmVsb3dTdGFmZiB7XG4gICAgICAgIGdldCB7IHJldHVybiBHZXRCZWxvd1N0YWZmKCk7IH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGludCBHZXRCZWxvd1N0YWZmKCkge1xuICAgICAgICBpbnQgZGlzdCA9IFdoaXRlTm90ZS5Cb3R0b20oY2xlZikuRGlzdCh3aGl0ZW5vdGUpICogXG4gICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgKyBcbiAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgIGlmIChhY2NpZCA9PSBBY2NpZC5TaGFycCB8fCBhY2NpZCA9PSBBY2NpZC5OYXR1cmFsKSBcbiAgICAgICAgICAgIGRpc3QgKz0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuXG4gICAgICAgIGlmIChkaXN0ID4gMClcbiAgICAgICAgICAgIHJldHVybiBkaXN0O1xuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgLyoqIERyYXcgdGhlIHN5bWJvbC5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIC8qIEFsaWduIHRoZSBzeW1ib2wgdG8gdGhlIHJpZ2h0ICovXG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKFdpZHRoIC0gTWluV2lkdGgsIDApO1xuXG4gICAgICAgIC8qIFN0b3JlIHRoZSB5LXBpeGVsIHZhbHVlIG9mIHRoZSB0b3Agb2YgdGhlIHdoaXRlbm90ZSBpbiB5bm90ZS4gKi9cbiAgICAgICAgaW50IHlub3RlID0geXRvcCArIFdoaXRlTm90ZS5Ub3AoY2xlZikuRGlzdCh3aGl0ZW5vdGUpICogXG4gICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG4gICAgICAgIGlmIChhY2NpZCA9PSBBY2NpZC5TaGFycClcbiAgICAgICAgICAgIERyYXdTaGFycChnLCBwZW4sIHlub3RlKTtcbiAgICAgICAgZWxzZSBpZiAoYWNjaWQgPT0gQWNjaWQuRmxhdClcbiAgICAgICAgICAgIERyYXdGbGF0KGcsIHBlbiwgeW5vdGUpO1xuICAgICAgICBlbHNlIGlmIChhY2NpZCA9PSBBY2NpZC5OYXR1cmFsKVxuICAgICAgICAgICAgRHJhd05hdHVyYWwoZywgcGVuLCB5bm90ZSk7XG5cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShXaWR0aCAtIE1pbldpZHRoKSwgMCk7XG4gICAgfVxuXG4gICAgLyoqIERyYXcgYSBzaGFycCBzeW1ib2wuIFxuICAgICAqIEBwYXJhbSB5bm90ZSBUaGUgcGl4ZWwgbG9jYXRpb24gb2YgdGhlIHRvcCBvZiB0aGUgYWNjaWRlbnRhbCdzIG5vdGUuIFxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIERyYXdTaGFycChHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeW5vdGUpIHtcblxuICAgICAgICAvKiBEcmF3IHRoZSB0d28gdmVydGljYWwgbGluZXMgKi9cbiAgICAgICAgaW50IHlzdGFydCA9IHlub3RlIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICBpbnQgeWVuZCA9IHlub3RlICsgMipTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgIGludCB4ID0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCB4LCB5c3RhcnQgKyAyLCB4LCB5ZW5kKTtcbiAgICAgICAgeCArPSBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHgsIHlzdGFydCwgeCwgeWVuZCAtIDIpO1xuXG4gICAgICAgIC8qIERyYXcgdGhlIHNsaWdodGx5IHVwd2FyZHMgaG9yaXpvbnRhbCBsaW5lcyAqL1xuICAgICAgICBpbnQgeHN0YXJ0ID0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgLSBTaGVldE11c2ljLk5vdGVIZWlnaHQvNDtcbiAgICAgICAgaW50IHhlbmQgPSBTaGVldE11c2ljLk5vdGVIZWlnaHQgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQvNDtcbiAgICAgICAgeXN0YXJ0ID0geW5vdGUgKyBTaGVldE11c2ljLkxpbmVXaWR0aDtcbiAgICAgICAgeWVuZCA9IHlzdGFydCAtIFNoZWV0TXVzaWMuTGluZVdpZHRoIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNDtcbiAgICAgICAgcGVuLldpZHRoID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvMjtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeXN0YXJ0LCB4ZW5kLCB5ZW5kKTtcbiAgICAgICAgeXN0YXJ0ICs9IFNoZWV0TXVzaWMuTGluZVNwYWNlO1xuICAgICAgICB5ZW5kICs9IFNoZWV0TXVzaWMuTGluZVNwYWNlO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5c3RhcnQsIHhlbmQsIHllbmQpO1xuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgIH1cblxuICAgIC8qKiBEcmF3IGEgZmxhdCBzeW1ib2wuXG4gICAgICogQHBhcmFtIHlub3RlIFRoZSBwaXhlbCBsb2NhdGlvbiBvZiB0aGUgdG9wIG9mIHRoZSBhY2NpZGVudGFsJ3Mgbm90ZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3RmxhdChHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeW5vdGUpIHtcbiAgICAgICAgaW50IHggPSBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuXG4gICAgICAgIC8qIERyYXcgdGhlIHZlcnRpY2FsIGxpbmUgKi9cbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHgsIHlub3RlIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0IC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIsXG4gICAgICAgICAgICAgICAgICAgICAgICB4LCB5bm90ZSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCk7XG5cbiAgICAgICAgLyogRHJhdyAzIGJlemllciBjdXJ2ZXMuXG4gICAgICAgICAqIEFsbCAzIGN1cnZlcyBzdGFydCBhbmQgc3RvcCBhdCB0aGUgc2FtZSBwb2ludHMuXG4gICAgICAgICAqIEVhY2ggc3Vic2VxdWVudCBjdXJ2ZSBidWxnZXMgbW9yZSBhbmQgbW9yZSB0b3dhcmRzIFxuICAgICAgICAgKiB0aGUgdG9wcmlnaHQgY29ybmVyLCBtYWtpbmcgdGhlIGN1cnZlIGxvb2sgdGhpY2tlclxuICAgICAgICAgKiB0b3dhcmRzIHRoZSB0b3AtcmlnaHQuXG4gICAgICAgICAqL1xuICAgICAgICBnLkRyYXdCZXppZXIocGVuLCB4LCB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQsXG4gICAgICAgICAgICB4ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMiwgeW5vdGUgLSBTaGVldE11c2ljLkxpbmVTcGFjZS8yLFxuICAgICAgICAgICAgeCArIFNoZWV0TXVzaWMuTGluZVNwYWNlLCB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzMsXG4gICAgICAgICAgICB4LCB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlICsgU2hlZXRNdXNpYy5MaW5lV2lkdGggKyAxKTtcblxuICAgICAgICBnLkRyYXdCZXppZXIocGVuLCB4LCB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQsXG4gICAgICAgICAgICB4ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMiwgeW5vdGUgLSBTaGVldE11c2ljLkxpbmVTcGFjZS8yLFxuICAgICAgICAgICAgeCArIFNoZWV0TXVzaWMuTGluZVNwYWNlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCwgXG4gICAgICAgICAgICAgIHlub3RlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMyAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQsXG4gICAgICAgICAgICB4LCB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlICsgU2hlZXRNdXNpYy5MaW5lV2lkdGggKyAxKTtcblxuXG4gICAgICAgIGcuRHJhd0JlemllcihwZW4sIHgsIHlub3RlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCxcbiAgICAgICAgICAgIHggKyBTaGVldE11c2ljLkxpbmVTcGFjZS8yLCB5bm90ZSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIsXG4gICAgICAgICAgICB4ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UgKyBTaGVldE11c2ljLkxpbmVTcGFjZS8yLCBcbiAgICAgICAgICAgICB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzMgLSBTaGVldE11c2ljLkxpbmVTcGFjZS8yLFxuICAgICAgICAgICAgeCwgeW5vdGUgKyBTaGVldE11c2ljLkxpbmVTcGFjZSArIFNoZWV0TXVzaWMuTGluZVdpZHRoICsgMSk7XG5cblxuICAgIH1cblxuICAgIC8qKiBEcmF3IGEgbmF0dXJhbCBzeW1ib2wuXG4gICAgICogQHBhcmFtIHlub3RlIFRoZSBwaXhlbCBsb2NhdGlvbiBvZiB0aGUgdG9wIG9mIHRoZSBhY2NpZGVudGFsJ3Mgbm90ZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3TmF0dXJhbChHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeW5vdGUpIHtcblxuICAgICAgICAvKiBEcmF3IHRoZSB0d28gdmVydGljYWwgbGluZXMgKi9cbiAgICAgICAgaW50IHlzdGFydCA9IHlub3RlIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UgLSBTaGVldE11c2ljLkxpbmVXaWR0aDtcbiAgICAgICAgaW50IHllbmQgPSB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlICsgU2hlZXRNdXNpYy5MaW5lV2lkdGg7XG4gICAgICAgIGludCB4ID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvMjtcbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHgsIHlzdGFydCwgeCwgeWVuZCk7XG4gICAgICAgIHggKz0gU2hlZXRNdXNpYy5MaW5lU3BhY2UgLSBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuICAgICAgICB5c3RhcnQgPSB5bm90ZSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQ7XG4gICAgICAgIHllbmQgPSB5bm90ZSArIDIqU2hlZXRNdXNpYy5MaW5lU3BhY2UgKyBTaGVldE11c2ljLkxpbmVXaWR0aCAtIFxuICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeCwgeXN0YXJ0LCB4LCB5ZW5kKTtcblxuICAgICAgICAvKiBEcmF3IHRoZSBzbGlnaHRseSB1cHdhcmRzIGhvcml6b250YWwgbGluZXMgKi9cbiAgICAgICAgaW50IHhzdGFydCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzI7XG4gICAgICAgIGludCB4ZW5kID0geHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UgLSBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuICAgICAgICB5c3RhcnQgPSB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVdpZHRoO1xuICAgICAgICB5ZW5kID0geXN0YXJ0IC0gU2hlZXRNdXNpYy5MaW5lV2lkdGggLSBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuICAgICAgICBwZW4uV2lkdGggPSBTaGVldE11c2ljLkxpbmVTcGFjZS8yO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5c3RhcnQsIHhlbmQsIHllbmQpO1xuICAgICAgICB5c3RhcnQgKz0gU2hlZXRNdXNpYy5MaW5lU3BhY2U7XG4gICAgICAgIHllbmQgKz0gU2hlZXRNdXNpYy5MaW5lU3BhY2U7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHlzdGFydCwgeGVuZCwgeWVuZCk7XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXG4gICAgICAgICAgXCJBY2NpZFN5bWJvbCBhY2NpZD17MH0gd2hpdGVub3RlPXsxfSBjbGVmPXsyfSB3aWR0aD17M31cIixcbiAgICAgICAgICBhY2NpZCwgd2hpdGVub3RlLCBjbGVmLCB3aWR0aCk7XG4gICAgfVxuXG59XG5cbn1cblxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cblxuLyoqIEBjbGFzcyBCYXJTeW1ib2xcbiAqIFRoZSBCYXJTeW1ib2wgcmVwcmVzZW50cyB0aGUgdmVydGljYWwgYmFycyB3aGljaCBkZWxpbWl0IG1lYXN1cmVzLlxuICogVGhlIHN0YXJ0dGltZSBvZiB0aGUgc3ltYm9sIGlzIHRoZSBiZWdpbm5pbmcgb2YgdGhlIG5ld1xuICogbWVhc3VyZS5cbiAqL1xucHVibGljIGNsYXNzIEJhclN5bWJvbCA6IE11c2ljU3ltYm9sIHtcbiAgICBwcml2YXRlIGludCBzdGFydHRpbWU7XG4gICAgcHJpdmF0ZSBpbnQgd2lkdGg7XG5cbiAgICAvKiogQ3JlYXRlIGEgQmFyU3ltYm9sLiBUaGUgc3RhcnR0aW1lIHNob3VsZCBiZSB0aGUgYmVnaW5uaW5nIG9mIGEgbWVhc3VyZS4gKi9cbiAgICBwdWJsaWMgQmFyU3ltYm9sKGludCBzdGFydHRpbWUpIHtcbiAgICAgICAgdGhpcy5zdGFydHRpbWUgPSBzdGFydHRpbWU7XG4gICAgICAgIHdpZHRoID0gTWluV2lkdGg7XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgdGltZSAoaW4gcHVsc2VzKSB0aGlzIHN5bWJvbCBvY2N1cnMgYXQuXG4gICAgICogVGhpcyBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgbWVhc3VyZSB0aGlzIHN5bWJvbCBiZWxvbmdzIHRvLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgU3RhcnRUaW1lIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHN0YXJ0dGltZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG1pbmltdW0gd2lkdGggKGluIHBpeGVscykgbmVlZGVkIHRvIGRyYXcgdGhpcyBzeW1ib2wgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IE1pbldpZHRoIHsgXG4gICAgICAgIGdldCB7IHJldHVybiAyICogU2hlZXRNdXNpYy5MaW5lU3BhY2U7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0L1NldCB0aGUgd2lkdGggKGluIHBpeGVscykgb2YgdGhpcyBzeW1ib2wuIFRoZSB3aWR0aCBpcyBzZXRcbiAgICAgKiBpbiBTaGVldE11c2ljLkFsaWduU3ltYm9scygpIHRvIHZlcnRpY2FsbHkgYWxpZ24gc3ltYm9scy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFdpZHRoIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgIHNldCB7IHdpZHRoID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYWJvdmUgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQWJvdmVTdGFmZiB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gMDsgfSBcbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYmVsb3cgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQmVsb3dTdGFmZiB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBEcmF3IGEgdmVydGljYWwgYmFyLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBcbiAgICB2b2lkIERyYXcoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3ApIHtcbiAgICAgICAgaW50IHkgPSB5dG9wO1xuICAgICAgICBpbnQgeWVuZCA9IHkgKyBTaGVldE11c2ljLkxpbmVTcGFjZSo0ICsgU2hlZXRNdXNpYy5MaW5lV2lkdGgqNDtcbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIFNoZWV0TXVzaWMuTm90ZVdpZHRoLzIsIHksIFxuICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlV2lkdGgvMiwgeWVuZCk7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgb3ZlcnJpZGUgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gc3RyaW5nLkZvcm1hdChcIkJhclN5bWJvbCBzdGFydHRpbWU9ezB9IHdpZHRoPXsxfVwiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnR0aW1lLCB3aWR0aCk7XG4gICAgfVxufVxuXG5cbn1cblxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEJpdG1hcDpJbWFnZVxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBCaXRtYXAoVHlwZSB0eXBlLCBzdHJpbmcgZmlsZW5hbWUpXHJcbiAgICAgICAgOmJhc2UodHlwZSxmaWxlbmFtZSl7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcbiAgICB9XHJcbn1cclxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG5cbi8qKiBAY2xhc3MgQmxhbmtTeW1ib2wgXG4gKiBUaGUgQmxhbmsgc3ltYm9sIGlzIGEgbXVzaWMgc3ltYm9sIHRoYXQgZG9lc24ndCBkcmF3IGFueXRoaW5nLiAgVGhpc1xuICogc3ltYm9sIGlzIHVzZWQgZm9yIGFsaWdubWVudCBwdXJwb3NlcywgdG8gYWxpZ24gbm90ZXMgaW4gZGlmZmVyZW50IFxuICogc3RhZmZzIHdoaWNoIG9jY3VyIGF0IHRoZSBzYW1lIHRpbWUuXG4gKi9cbnB1YmxpYyBjbGFzcyBCbGFua1N5bWJvbCA6IE11c2ljU3ltYm9sIHtcbiAgICBwcml2YXRlIGludCBzdGFydHRpbWU7IFxuICAgIHByaXZhdGUgaW50IHdpZHRoO1xuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBCbGFua1N5bWJvbCB3aXRoIHRoZSBnaXZlbiBzdGFydHRpbWUgYW5kIHdpZHRoICovXG4gICAgcHVibGljIEJsYW5rU3ltYm9sKGludCBzdGFydHRpbWUsIGludCB3aWR0aCkge1xuICAgICAgICB0aGlzLnN0YXJ0dGltZSA9IHN0YXJ0dGltZTtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIHRpbWUgKGluIHB1bHNlcykgdGhpcyBzeW1ib2wgb2NjdXJzIGF0LlxuICAgICAqIFRoaXMgaXMgdXNlZCB0byBkZXRlcm1pbmUgdGhlIG1lYXN1cmUgdGhpcyBzeW1ib2wgYmVsb25ncyB0by5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFN0YXJ0VGltZSB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gc3RhcnR0aW1lOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbWluaW11bSB3aWR0aCAoaW4gcGl4ZWxzKSBuZWVkZWQgdG8gZHJhdyB0aGlzIHN5bWJvbCAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgTWluV2lkdGgge1xuICAgICAgICBnZXQgeyByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQvU2V0IHRoZSB3aWR0aCAoaW4gcGl4ZWxzKSBvZiB0aGlzIHN5bWJvbC4gVGhlIHdpZHRoIGlzIHNldFxuICAgICAqIGluIFNoZWV0TXVzaWMuQWxpZ25TeW1ib2xzKCkgdG8gdmVydGljYWxseSBhbGlnbiBzeW1ib2xzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgV2lkdGggeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgIHNldCB7IHdpZHRoID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYWJvdmUgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQWJvdmVTdGFmZiB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBiZWxvdyB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBCZWxvd1N0YWZmIHsgXG4gICAgICAgIGdldCB7IHJldHVybiAwOyB9XG4gICAgfVxuXG4gICAgLyoqIERyYXcgbm90aGluZy5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7fVxuXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJCbGFua1N5bWJvbCBzdGFydHRpbWU9ezB9IHdpZHRoPXsxfVwiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnR0aW1lLCB3aWR0aCk7XG4gICAgfVxufVxuXG5cbn1cblxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbnB1YmxpYyBlbnVtIFN0ZW1EaXIgeyBVcCwgRG93biB9O1xuXG4vKiogQGNsYXNzIE5vdGVEYXRhXG4gKiAgQ29udGFpbnMgZmllbGRzIGZvciBkaXNwbGF5aW5nIGEgc2luZ2xlIG5vdGUgaW4gYSBjaG9yZC5cbiAqL1xucHVibGljIGNsYXNzIE5vdGVEYXRhIHtcbiAgICBwdWJsaWMgaW50IG51bWJlcjsgICAgICAgICAgICAgLyoqIFRoZSBNaWRpIG5vdGUgbnVtYmVyLCB1c2VkIHRvIGRldGVybWluZSB0aGUgY29sb3IgKi9cbiAgICBwdWJsaWMgV2hpdGVOb3RlIHdoaXRlbm90ZTsgICAgLyoqIFRoZSB3aGl0ZSBub3RlIGxvY2F0aW9uIHRvIGRyYXcgKi9cbiAgICBwdWJsaWMgTm90ZUR1cmF0aW9uIGR1cmF0aW9uOyAgLyoqIFRoZSBkdXJhdGlvbiBvZiB0aGUgbm90ZSAqL1xuICAgIHB1YmxpYyBib29sIGxlZnRzaWRlOyAgICAgICAgICAvKiogV2hldGhlciB0byBkcmF3IG5vdGUgdG8gdGhlIGxlZnQgb3IgcmlnaHQgb2YgdGhlIHN0ZW0gKi9cbiAgICBwdWJsaWMgQWNjaWQgYWNjaWQ7ICAgICAgICAgICAgLyoqIFVzZWQgdG8gY3JlYXRlIHRoZSBBY2NpZFN5bWJvbHMgZm9yIHRoZSBjaG9yZCAqL1xufTtcblxuLyoqIEBjbGFzcyBDaG9yZFN5bWJvbFxuICogQSBjaG9yZCBzeW1ib2wgcmVwcmVzZW50cyBhIGdyb3VwIG9mIG5vdGVzIHRoYXQgYXJlIHBsYXllZCBhdCB0aGUgc2FtZVxuICogdGltZS4gIEEgY2hvcmQgaW5jbHVkZXMgdGhlIG5vdGVzLCB0aGUgYWNjaWRlbnRhbCBzeW1ib2xzIGZvciBlYWNoXG4gKiBub3RlLCBhbmQgdGhlIHN0ZW0gKG9yIHN0ZW1zKSB0byB1c2UuICBBIHNpbmdsZSBjaG9yZCBtYXkgaGF2ZSB0d28gXG4gKiBzdGVtcyBpZiB0aGUgbm90ZXMgaGF2ZSBkaWZmZXJlbnQgZHVyYXRpb25zIChlLmcuIGlmIG9uZSBub3RlIGlzIGFcbiAqIHF1YXJ0ZXIgbm90ZSwgYW5kIGFub3RoZXIgaXMgYW4gZWlnaHRoIG5vdGUpLlxuICovXG5wdWJsaWMgY2xhc3MgQ2hvcmRTeW1ib2wgOiBNdXNpY1N5bWJvbCB7XG4gICAgcHJpdmF0ZSBDbGVmIGNsZWY7ICAgICAgICAgICAgIC8qKiBXaGljaCBjbGVmIHRoZSBjaG9yZCBpcyBiZWluZyBkcmF3biBpbiAqL1xuICAgIHByaXZhdGUgaW50IHN0YXJ0dGltZTsgICAgICAgICAvKiogVGhlIHRpbWUgKGluIHB1bHNlcykgdGhlIG5vdGVzIG9jY3VycyBhdCAqL1xuICAgIHByaXZhdGUgaW50IGVuZHRpbWU7ICAgICAgICAgICAvKiogVGhlIHN0YXJ0dGltZSBwbHVzIHRoZSBsb25nZXN0IG5vdGUgZHVyYXRpb24gKi9cbiAgICBwcml2YXRlIE5vdGVEYXRhW10gbm90ZWRhdGE7ICAgLyoqIFRoZSBub3RlcyB0byBkcmF3ICovXG4gICAgcHJpdmF0ZSBBY2NpZFN5bWJvbFtdIGFjY2lkc3ltYm9sczsgICAvKiogVGhlIGFjY2lkZW50YWwgc3ltYm9scyB0byBkcmF3ICovXG4gICAgcHJpdmF0ZSBpbnQgd2lkdGg7ICAgICAgICAgICAgIC8qKiBUaGUgd2lkdGggb2YgdGhlIGNob3JkICovXG4gICAgcHJpdmF0ZSBTdGVtIHN0ZW0xOyAgICAgICAgICAgIC8qKiBUaGUgc3RlbSBvZiB0aGUgY2hvcmQuIENhbiBiZSBudWxsLiAqL1xuICAgIHByaXZhdGUgU3RlbSBzdGVtMjsgICAgICAgICAgICAvKiogVGhlIHNlY29uZCBzdGVtIG9mIHRoZSBjaG9yZC4gQ2FuIGJlIG51bGwgKi9cbiAgICBwcml2YXRlIGJvb2wgaGFzdHdvc3RlbXM7ICAgICAgLyoqIFRydWUgaWYgdGhpcyBjaG9yZCBoYXMgdHdvIHN0ZW1zICovXG4gICAgcHJpdmF0ZSBTaGVldE11c2ljIHNoZWV0bXVzaWM7IC8qKiBVc2VkIHRvIGdldCBjb2xvcnMgYW5kIG90aGVyIG9wdGlvbnMgKi9cblxuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBDaG9yZCBTeW1ib2wgZnJvbSB0aGUgZ2l2ZW4gbGlzdCBvZiBtaWRpIG5vdGVzLlxuICAgICAqIEFsbCB0aGUgbWlkaSBub3RlcyB3aWxsIGhhdmUgdGhlIHNhbWUgc3RhcnQgdGltZS4gIFVzZSB0aGVcbiAgICAgKiBrZXkgc2lnbmF0dXJlIHRvIGdldCB0aGUgd2hpdGUga2V5IGFuZCBhY2NpZGVudGFsIHN5bWJvbCBmb3JcbiAgICAgKiBlYWNoIG5vdGUuICBVc2UgdGhlIHRpbWUgc2lnbmF0dXJlIHRvIGNhbGN1bGF0ZSB0aGUgZHVyYXRpb25cbiAgICAgKiBvZiB0aGUgbm90ZXMuIFVzZSB0aGUgY2xlZiB3aGVuIGRyYXdpbmcgdGhlIGNob3JkLlxuICAgICAqL1xuICAgIHB1YmxpYyBDaG9yZFN5bWJvbChMaXN0PE1pZGlOb3RlPiBtaWRpbm90ZXMsIEtleVNpZ25hdHVyZSBrZXksIFxuICAgICAgICAgICAgICAgICAgICAgICBUaW1lU2lnbmF0dXJlIHRpbWUsIENsZWYgYywgU2hlZXRNdXNpYyBzaGVldCkge1xuXG4gICAgICAgIGludCBsZW4gPSBtaWRpbm90ZXMuQ291bnQ7XG4gICAgICAgIGludCBpO1xuXG4gICAgICAgIGhhc3R3b3N0ZW1zID0gZmFsc2U7XG4gICAgICAgIGNsZWYgPSBjO1xuICAgICAgICBzaGVldG11c2ljID0gc2hlZXQ7XG5cbiAgICAgICAgc3RhcnR0aW1lID0gbWlkaW5vdGVzWzBdLlN0YXJ0VGltZTtcbiAgICAgICAgZW5kdGltZSA9IG1pZGlub3Rlc1swXS5FbmRUaW1lO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBtaWRpbm90ZXMuQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgaWYgKGkgPiAxKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1pZGlub3Rlc1tpXS5OdW1iZXIgPCBtaWRpbm90ZXNbaS0xXS5OdW1iZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5c3RlbS5Bcmd1bWVudEV4Y2VwdGlvbihcIkNob3JkIG5vdGVzIG5vdCBpbiBpbmNyZWFzaW5nIG9yZGVyIGJ5IG51bWJlclwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbmR0aW1lID0gTWF0aC5NYXgoZW5kdGltZSwgbWlkaW5vdGVzW2ldLkVuZFRpbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgbm90ZWRhdGEgPSBDcmVhdGVOb3RlRGF0YShtaWRpbm90ZXMsIGtleSwgdGltZSk7XG4gICAgICAgIGFjY2lkc3ltYm9scyA9IENyZWF0ZUFjY2lkU3ltYm9scyhub3RlZGF0YSwgY2xlZik7XG5cblxuICAgICAgICAvKiBGaW5kIG91dCBob3cgbWFueSBzdGVtcyB3ZSBuZWVkICgxIG9yIDIpICovXG4gICAgICAgIE5vdGVEdXJhdGlvbiBkdXIxID0gbm90ZWRhdGFbMF0uZHVyYXRpb247XG4gICAgICAgIE5vdGVEdXJhdGlvbiBkdXIyID0gZHVyMTtcbiAgICAgICAgaW50IGNoYW5nZSA9IC0xO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbm90ZWRhdGEuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGR1cjIgPSBub3RlZGF0YVtpXS5kdXJhdGlvbjtcbiAgICAgICAgICAgIGlmIChkdXIxICE9IGR1cjIpIHtcbiAgICAgICAgICAgICAgICBjaGFuZ2UgPSBpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGR1cjEgIT0gZHVyMikge1xuICAgICAgICAgICAgLyogV2UgaGF2ZSBub3RlcyB3aXRoIGRpZmZlcmVudCBkdXJhdGlvbnMuICBTbyB3ZSB3aWxsIG5lZWRcbiAgICAgICAgICAgICAqIHR3byBzdGVtcy4gIFRoZSBmaXJzdCBzdGVtIHBvaW50cyBkb3duLCBhbmQgY29udGFpbnMgdGhlXG4gICAgICAgICAgICAgKiBib3R0b20gbm90ZSB1cCB0byB0aGUgbm90ZSB3aXRoIHRoZSBkaWZmZXJlbnQgZHVyYXRpb24uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogVGhlIHNlY29uZCBzdGVtIHBvaW50cyB1cCwgYW5kIGNvbnRhaW5zIHRoZSBub3RlIHdpdGggdGhlXG4gICAgICAgICAgICAgKiBkaWZmZXJlbnQgZHVyYXRpb24gdXAgdG8gdGhlIHRvcCBub3RlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBoYXN0d29zdGVtcyA9IHRydWU7XG4gICAgICAgICAgICBzdGVtMSA9IG5ldyBTdGVtKG5vdGVkYXRhWzBdLndoaXRlbm90ZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGVkYXRhW2NoYW5nZS0xXS53aGl0ZW5vdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR1cjEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdGVtLkRvd24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5vdGVzT3ZlcmxhcChub3RlZGF0YSwgMCwgY2hhbmdlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHN0ZW0yID0gbmV3IFN0ZW0obm90ZWRhdGFbY2hhbmdlXS53aGl0ZW5vdGUsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlZGF0YVtub3RlZGF0YS5MZW5ndGgtMV0ud2hpdGVub3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkdXIyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3RlbS5VcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTm90ZXNPdmVybGFwKG5vdGVkYXRhLCBjaGFuZ2UsIG5vdGVkYXRhLkxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLyogQWxsIG5vdGVzIGhhdmUgdGhlIHNhbWUgZHVyYXRpb24sIHNvIHdlIG9ubHkgbmVlZCBvbmUgc3RlbS4gKi9cbiAgICAgICAgICAgIGludCBkaXJlY3Rpb24gPSBTdGVtRGlyZWN0aW9uKG5vdGVkYXRhWzBdLndoaXRlbm90ZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlZGF0YVtub3RlZGF0YS5MZW5ndGgtMV0ud2hpdGVub3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlZik7XG5cbiAgICAgICAgICAgIHN0ZW0xID0gbmV3IFN0ZW0obm90ZWRhdGFbMF0ud2hpdGVub3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlZGF0YVtub3RlZGF0YS5MZW5ndGgtMV0ud2hpdGVub3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkdXIxLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOb3Rlc092ZXJsYXAobm90ZWRhdGEsIDAsIG5vdGVkYXRhLkxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgc3RlbTIgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogRm9yIHdob2xlIG5vdGVzLCBubyBzdGVtIGlzIGRyYXduLiAqL1xuICAgICAgICBpZiAoZHVyMSA9PSBOb3RlRHVyYXRpb24uV2hvbGUpXG4gICAgICAgICAgICBzdGVtMSA9IG51bGw7XG4gICAgICAgIGlmIChkdXIyID09IE5vdGVEdXJhdGlvbi5XaG9sZSlcbiAgICAgICAgICAgIHN0ZW0yID0gbnVsbDtcblxuICAgICAgICB3aWR0aCA9IE1pbldpZHRoO1xuICAgIH1cblxuXG4gICAgLyoqIEdpdmVuIHRoZSByYXcgbWlkaSBub3RlcyAodGhlIG5vdGUgbnVtYmVyIGFuZCBkdXJhdGlvbiBpbiBwdWxzZXMpLFxuICAgICAqIGNhbGN1bGF0ZSB0aGUgZm9sbG93aW5nIG5vdGUgZGF0YTpcbiAgICAgKiAtIFRoZSB3aGl0ZSBrZXlcbiAgICAgKiAtIFRoZSBhY2NpZGVudGFsIChpZiBhbnkpXG4gICAgICogLSBUaGUgbm90ZSBkdXJhdGlvbiAoaGFsZiwgcXVhcnRlciwgZWlnaHRoLCBldGMpXG4gICAgICogLSBUaGUgc2lkZSBpdCBzaG91bGQgYmUgZHJhd24gKGxlZnQgb3Igc2lkZSlcbiAgICAgKiBCeSBkZWZhdWx0LCBub3RlcyBhcmUgZHJhd24gb24gdGhlIGxlZnQgc2lkZS4gIEhvd2V2ZXIsIGlmIHR3byBub3Rlc1xuICAgICAqIG92ZXJsYXAgKGxpa2UgQSBhbmQgQikgeW91IGNhbm5vdCBkcmF3IHRoZSBuZXh0IG5vdGUgZGlyZWN0bHkgYWJvdmUgaXQuXG4gICAgICogSW5zdGVhZCB5b3UgbXVzdCBzaGlmdCBvbmUgb2YgdGhlIG5vdGVzIHRvIHRoZSByaWdodC5cbiAgICAgKlxuICAgICAqIFRoZSBLZXlTaWduYXR1cmUgaXMgdXNlZCB0byBkZXRlcm1pbmUgdGhlIHdoaXRlIGtleSBhbmQgYWNjaWRlbnRhbC5cbiAgICAgKiBUaGUgVGltZVNpZ25hdHVyZSBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgZHVyYXRpb24uXG4gICAgICovXG4gXG4gICAgcHJpdmF0ZSBzdGF0aWMgTm90ZURhdGFbXSBcbiAgICBDcmVhdGVOb3RlRGF0YShMaXN0PE1pZGlOb3RlPiBtaWRpbm90ZXMsIEtleVNpZ25hdHVyZSBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUaW1lU2lnbmF0dXJlIHRpbWUpIHtcblxuICAgICAgICBpbnQgbGVuID0gbWlkaW5vdGVzLkNvdW50O1xuICAgICAgICBOb3RlRGF0YVtdIG5vdGVkYXRhID0gbmV3IE5vdGVEYXRhW2xlbl07XG5cbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgTWlkaU5vdGUgbWlkaSA9IG1pZGlub3Rlc1tpXTtcbiAgICAgICAgICAgIG5vdGVkYXRhW2ldID0gbmV3IE5vdGVEYXRhKCk7XG4gICAgICAgICAgICBub3RlZGF0YVtpXS5udW1iZXIgPSBtaWRpLk51bWJlcjtcbiAgICAgICAgICAgIG5vdGVkYXRhW2ldLmxlZnRzaWRlID0gdHJ1ZTtcbiAgICAgICAgICAgIG5vdGVkYXRhW2ldLndoaXRlbm90ZSA9IGtleS5HZXRXaGl0ZU5vdGUobWlkaS5OdW1iZXIpO1xuICAgICAgICAgICAgbm90ZWRhdGFbaV0uZHVyYXRpb24gPSB0aW1lLkdldE5vdGVEdXJhdGlvbihtaWRpLkVuZFRpbWUgLSBtaWRpLlN0YXJ0VGltZSk7XG4gICAgICAgICAgICBub3RlZGF0YVtpXS5hY2NpZCA9IGtleS5HZXRBY2NpZGVudGFsKG1pZGkuTnVtYmVyLCBtaWRpLlN0YXJ0VGltZSAvIHRpbWUuTWVhc3VyZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChpID4gMCAmJiAobm90ZWRhdGFbaV0ud2hpdGVub3RlLkRpc3Qobm90ZWRhdGFbaS0xXS53aGl0ZW5vdGUpID09IDEpKSB7XG4gICAgICAgICAgICAgICAgLyogVGhpcyBub3RlIChub3RlZGF0YVtpXSkgb3ZlcmxhcHMgd2l0aCB0aGUgcHJldmlvdXMgbm90ZS5cbiAgICAgICAgICAgICAgICAgKiBDaGFuZ2UgdGhlIHNpZGUgb2YgdGhpcyBub3RlLlxuICAgICAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAgICAgaWYgKG5vdGVkYXRhW2ktMV0ubGVmdHNpZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm90ZWRhdGFbaV0ubGVmdHNpZGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBub3RlZGF0YVtpXS5sZWZ0c2lkZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBub3RlZGF0YVtpXS5sZWZ0c2lkZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vdGVkYXRhO1xuICAgIH1cblxuXG4gICAgLyoqIEdpdmVuIHRoZSBub3RlIGRhdGEgKHRoZSB3aGl0ZSBrZXlzIGFuZCBhY2NpZGVudGFscyksIGNyZWF0ZSBcbiAgICAgKiB0aGUgQWNjaWRlbnRhbCBTeW1ib2xzIGFuZCByZXR1cm4gdGhlbS5cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBBY2NpZFN5bWJvbFtdIFxuICAgIENyZWF0ZUFjY2lkU3ltYm9scyhOb3RlRGF0YVtdIG5vdGVkYXRhLCBDbGVmIGNsZWYpIHtcbiAgICAgICAgaW50IGNvdW50ID0gMDtcbiAgICAgICAgZm9yZWFjaCAoTm90ZURhdGEgbiBpbiBub3RlZGF0YSkge1xuICAgICAgICAgICAgaWYgKG4uYWNjaWQgIT0gQWNjaWQuTm9uZSkge1xuICAgICAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgQWNjaWRTeW1ib2xbXSBzeW1ib2xzID0gbmV3IEFjY2lkU3ltYm9sW2NvdW50XTtcbiAgICAgICAgaW50IGkgPSAwO1xuICAgICAgICBmb3JlYWNoIChOb3RlRGF0YSBuIGluIG5vdGVkYXRhKSB7XG4gICAgICAgICAgICBpZiAobi5hY2NpZCAhPSBBY2NpZC5Ob25lKSB7XG4gICAgICAgICAgICAgICAgc3ltYm9sc1tpXSA9IG5ldyBBY2NpZFN5bWJvbChuLmFjY2lkLCBuLndoaXRlbm90ZSwgY2xlZik7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzeW1ib2xzO1xuICAgIH1cblxuICAgIC8qKiBDYWxjdWxhdGUgdGhlIHN0ZW0gZGlyZWN0aW9uIChVcCBvciBkb3duKSBiYXNlZCBvbiB0aGUgdG9wIGFuZFxuICAgICAqIGJvdHRvbSBub3RlIGluIHRoZSBjaG9yZC4gIElmIHRoZSBhdmVyYWdlIG9mIHRoZSBub3RlcyBpcyBhYm92ZVxuICAgICAqIHRoZSBtaWRkbGUgb2YgdGhlIHN0YWZmLCB0aGUgZGlyZWN0aW9uIGlzIGRvd24uICBFbHNlLCB0aGVcbiAgICAgKiBkaXJlY3Rpb24gaXMgdXAuXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50IFxuICAgIFN0ZW1EaXJlY3Rpb24oV2hpdGVOb3RlIGJvdHRvbSwgV2hpdGVOb3RlIHRvcCwgQ2xlZiBjbGVmKSB7XG4gICAgICAgIFdoaXRlTm90ZSBtaWRkbGU7XG4gICAgICAgIGlmIChjbGVmID09IENsZWYuVHJlYmxlKVxuICAgICAgICAgICAgbWlkZGxlID0gbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQiwgNSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG1pZGRsZSA9IG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkQsIDMpO1xuXG4gICAgICAgIGludCBkaXN0ID0gbWlkZGxlLkRpc3QoYm90dG9tKSArIG1pZGRsZS5EaXN0KHRvcCk7XG4gICAgICAgIGlmIChkaXN0ID49IDApXG4gICAgICAgICAgICByZXR1cm4gU3RlbS5VcDtcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIHJldHVybiBTdGVtLkRvd247XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB3aGV0aGVyIGFueSBvZiB0aGUgbm90ZXMgaW4gbm90ZWRhdGEgKGJldHdlZW4gc3RhcnQgYW5kXG4gICAgICogZW5kIGluZGV4ZXMpIG92ZXJsYXAuICBUaGlzIGlzIG5lZWRlZCBieSB0aGUgU3RlbSBjbGFzcyB0b1xuICAgICAqIGRldGVybWluZSB0aGUgcG9zaXRpb24gb2YgdGhlIHN0ZW0gKGxlZnQgb3IgcmlnaHQgb2Ygbm90ZXMpLlxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGJvb2wgTm90ZXNPdmVybGFwKE5vdGVEYXRhW10gbm90ZWRhdGEsIGludCBzdGFydCwgaW50IGVuZCkge1xuICAgICAgICBmb3IgKGludCBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgICAgICAgaWYgKCFub3RlZGF0YVtpXS5sZWZ0c2lkZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSB0aW1lIChpbiBwdWxzZXMpIHRoaXMgc3ltYm9sIG9jY3VycyBhdC5cbiAgICAgKiBUaGlzIGlzIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBtZWFzdXJlIHRoaXMgc3ltYm9sIGJlbG9uZ3MgdG8uXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBTdGFydFRpbWUgeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHN0YXJ0dGltZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIGVuZCB0aW1lIChpbiBwdWxzZXMpIG9mIHRoZSBsb25nZXN0IG5vdGUgaW4gdGhlIGNob3JkLlxuICAgICAqIFVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdHdvIGFkamFjZW50IGNob3JkcyBjYW4gYmUgam9pbmVkXG4gICAgICogYnkgYSBzdGVtLlxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgRW5kVGltZSB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gZW5kdGltZTsgfVxuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIGNsZWYgdGhpcyBjaG9yZCBpcyBkcmF3biBpbi4gKi9cbiAgICBwdWJsaWMgQ2xlZiBDbGVmIHsgXG4gICAgICAgIGdldCB7IHJldHVybiBjbGVmOyB9XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0cnVlIGlmIHRoaXMgY2hvcmQgaGFzIHR3byBzdGVtcyAqL1xuICAgIHB1YmxpYyBib29sIEhhc1R3b1N0ZW1zIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIGhhc3R3b3N0ZW1zOyB9XG4gICAgfVxuXG4gICAgLyogUmV0dXJuIHRoZSBzdGVtIHdpbGwgdGhlIHNtYWxsZXN0IGR1cmF0aW9uLiAgVGhpcyBwcm9wZXJ0eVxuICAgICAqIGlzIHVzZWQgd2hlbiBtYWtpbmcgY2hvcmQgcGFpcnMgKGNob3JkcyBqb2luZWQgYnkgYSBob3Jpem9udGFsXG4gICAgICogYmVhbSBzdGVtKS4gVGhlIHN0ZW0gZHVyYXRpb25zIG11c3QgbWF0Y2ggaW4gb3JkZXIgdG8gbWFrZVxuICAgICAqIGEgY2hvcmQgcGFpci4gIElmIGEgY2hvcmQgaGFzIHR3byBzdGVtcywgd2UgYWx3YXlzIHJldHVyblxuICAgICAqIHRoZSBvbmUgd2l0aCBhIHNtYWxsZXIgZHVyYXRpb24sIGJlY2F1c2UgaXQgaGFzIGEgYmV0dGVyIFxuICAgICAqIGNoYW5jZSBvZiBtYWtpbmcgYSBwYWlyLlxuICAgICAqL1xuICAgIHB1YmxpYyBTdGVtIFN0ZW0ge1xuICAgICAgICBnZXQgeyBcbiAgICAgICAgICAgIGlmIChzdGVtMSA9PSBudWxsKSB7IHJldHVybiBzdGVtMjsgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc3RlbTIgPT0gbnVsbCkgeyByZXR1cm4gc3RlbTE7IH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHN0ZW0xLkR1cmF0aW9uIDwgc3RlbTIuRHVyYXRpb24pIHsgcmV0dXJuIHN0ZW0xOyB9XG4gICAgICAgICAgICBlbHNlIHsgcmV0dXJuIHN0ZW0yOyB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogR2V0L1NldCB0aGUgd2lkdGggKGluIHBpeGVscykgb2YgdGhpcyBzeW1ib2wuIFRoZSB3aWR0aCBpcyBzZXRcbiAgICAgKiBpbiBTaGVldE11c2ljLkFsaWduU3ltYm9scygpIHRvIHZlcnRpY2FsbHkgYWxpZ24gc3ltYm9scy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFdpZHRoIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgIHNldCB7IHdpZHRoID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBtaW5pbXVtIHdpZHRoIChpbiBwaXhlbHMpIG5lZWRlZCB0byBkcmF3IHRoaXMgc3ltYm9sICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBNaW5XaWR0aCB7XG4gICAgICAgIGdldCB7IHJldHVybiBHZXRNaW5XaWR0aCgpOyB9XG4gICAgfVxuXG4gICAgLyogUmV0dXJuIHRoZSBtaW5pbXVtIHdpZHRoIG5lZWRlZCB0byBkaXNwbGF5IHRoaXMgY2hvcmQuXG4gICAgICpcbiAgICAgKiBUaGUgYWNjaWRlbnRhbCBzeW1ib2xzIGNhbiBiZSBkcmF3biBhYm92ZSBvbmUgYW5vdGhlciBhcyBsb25nXG4gICAgICogYXMgdGhleSBkb24ndCBvdmVybGFwICh0aGV5IG11c3QgYmUgYXQgbGVhc3QgNiBub3RlcyBhcGFydCkuXG4gICAgICogSWYgdHdvIGFjY2lkZW50YWwgc3ltYm9scyBkbyBvdmVybGFwLCB0aGUgYWNjaWRlbnRhbCBzeW1ib2xcbiAgICAgKiBvbiB0b3AgbXVzdCBiZSBzaGlmdGVkIHRvIHRoZSByaWdodC4gIFNvIHRoZSB3aWR0aCBuZWVkZWQgZm9yXG4gICAgICogYWNjaWRlbnRhbCBzeW1ib2xzIGRlcGVuZHMgb24gd2hldGhlciB0aGV5IG92ZXJsYXAgb3Igbm90LlxuICAgICAqXG4gICAgICogSWYgd2UgYXJlIGFsc28gZGlzcGxheWluZyB0aGUgbGV0dGVycywgaW5jbHVkZSBleHRyYSB3aWR0aC5cbiAgICAgKi9cbiAgICBpbnQgR2V0TWluV2lkdGgoKSB7XG4gICAgICAgIC8qIFRoZSB3aWR0aCBuZWVkZWQgZm9yIHRoZSBub3RlIGNpcmNsZXMgKi9cbiAgICAgICAgaW50IHJlc3VsdCA9IDIqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjMvNDtcblxuICAgICAgICBpZiAoYWNjaWRzeW1ib2xzLkxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSBhY2NpZHN5bWJvbHNbMF0uTWluV2lkdGg7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMTsgaSA8IGFjY2lkc3ltYm9scy5MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIEFjY2lkU3ltYm9sIGFjY2lkID0gYWNjaWRzeW1ib2xzW2ldO1xuICAgICAgICAgICAgICAgIEFjY2lkU3ltYm9sIHByZXYgPSBhY2NpZHN5bWJvbHNbaS0xXTtcbiAgICAgICAgICAgICAgICBpZiAoYWNjaWQuTm90ZS5EaXN0KHByZXYuTm90ZSkgPCA2KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBhY2NpZC5NaW5XaWR0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNoZWV0bXVzaWMgIT0gbnVsbCAmJiBzaGVldG11c2ljLlNob3dOb3RlTGV0dGVycyAhPSBNaWRpT3B0aW9ucy5Ob3RlTmFtZU5vbmUpIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSA4O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYWJvdmUgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQWJvdmVTdGFmZiB7XG4gICAgICAgIGdldCB7IHJldHVybiBHZXRBYm92ZVN0YWZmKCk7IH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGludCBHZXRBYm92ZVN0YWZmKCkge1xuICAgICAgICAvKiBGaW5kIHRoZSB0b3Btb3N0IG5vdGUgaW4gdGhlIGNob3JkICovXG4gICAgICAgIFdoaXRlTm90ZSB0b3Bub3RlID0gbm90ZWRhdGFbIG5vdGVkYXRhLkxlbmd0aC0xIF0ud2hpdGVub3RlO1xuXG4gICAgICAgIC8qIFRoZSBzdGVtLkVuZCBpcyB0aGUgbm90ZSBwb3NpdGlvbiB3aGVyZSB0aGUgc3RlbSBlbmRzLlxuICAgICAgICAgKiBDaGVjayBpZiB0aGUgc3RlbSBlbmQgaXMgaGlnaGVyIHRoYW4gdGhlIHRvcCBub3RlLlxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKHN0ZW0xICE9IG51bGwpXG4gICAgICAgICAgICB0b3Bub3RlID0gV2hpdGVOb3RlLk1heCh0b3Bub3RlLCBzdGVtMS5FbmQpO1xuICAgICAgICBpZiAoc3RlbTIgIT0gbnVsbClcbiAgICAgICAgICAgIHRvcG5vdGUgPSBXaGl0ZU5vdGUuTWF4KHRvcG5vdGUsIHN0ZW0yLkVuZCk7XG5cbiAgICAgICAgaW50IGRpc3QgPSB0b3Bub3RlLkRpc3QoV2hpdGVOb3RlLlRvcChjbGVmKSkgKiBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcbiAgICAgICAgaW50IHJlc3VsdCA9IDA7XG4gICAgICAgIGlmIChkaXN0ID4gMClcbiAgICAgICAgICAgIHJlc3VsdCA9IGRpc3Q7XG5cbiAgICAgICAgLyogQ2hlY2sgaWYgYW55IGFjY2lkZW50YWwgc3ltYm9scyBleHRlbmQgYWJvdmUgdGhlIHN0YWZmICovXG4gICAgICAgIGZvcmVhY2ggKEFjY2lkU3ltYm9sIHN5bWJvbCBpbiBhY2NpZHN5bWJvbHMpIHtcbiAgICAgICAgICAgIGlmIChzeW1ib2wuQWJvdmVTdGFmZiA+IHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHN5bWJvbC5BYm92ZVN0YWZmO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGJlbG93IHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEJlbG93U3RhZmYge1xuICAgICAgICBnZXQgeyByZXR1cm4gR2V0QmVsb3dTdGFmZigpOyB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbnQgR2V0QmVsb3dTdGFmZigpIHtcbiAgICAgICAgLyogRmluZCB0aGUgYm90dG9tIG5vdGUgaW4gdGhlIGNob3JkICovXG4gICAgICAgIFdoaXRlTm90ZSBib3R0b21ub3RlID0gbm90ZWRhdGFbMF0ud2hpdGVub3RlO1xuXG4gICAgICAgIC8qIFRoZSBzdGVtLkVuZCBpcyB0aGUgbm90ZSBwb3NpdGlvbiB3aGVyZSB0aGUgc3RlbSBlbmRzLlxuICAgICAgICAgKiBDaGVjayBpZiB0aGUgc3RlbSBlbmQgaXMgbG93ZXIgdGhhbiB0aGUgYm90dG9tIG5vdGUuXG4gICAgICAgICAqL1xuICAgICAgICBpZiAoc3RlbTEgIT0gbnVsbClcbiAgICAgICAgICAgIGJvdHRvbW5vdGUgPSBXaGl0ZU5vdGUuTWluKGJvdHRvbW5vdGUsIHN0ZW0xLkVuZCk7XG4gICAgICAgIGlmIChzdGVtMiAhPSBudWxsKVxuICAgICAgICAgICAgYm90dG9tbm90ZSA9IFdoaXRlTm90ZS5NaW4oYm90dG9tbm90ZSwgc3RlbTIuRW5kKTtcblxuICAgICAgICBpbnQgZGlzdCA9IFdoaXRlTm90ZS5Cb3R0b20oY2xlZikuRGlzdChib3R0b21ub3RlKSAqXG4gICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG5cbiAgICAgICAgaW50IHJlc3VsdCA9IDA7XG4gICAgICAgIGlmIChkaXN0ID4gMClcbiAgICAgICAgICAgIHJlc3VsdCA9IGRpc3Q7XG5cbiAgICAgICAgLyogQ2hlY2sgaWYgYW55IGFjY2lkZW50YWwgc3ltYm9scyBleHRlbmQgYmVsb3cgdGhlIHN0YWZmICovIFxuICAgICAgICBmb3JlYWNoIChBY2NpZFN5bWJvbCBzeW1ib2wgaW4gYWNjaWRzeW1ib2xzKSB7XG4gICAgICAgICAgICBpZiAoc3ltYm9sLkJlbG93U3RhZmYgPiByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBzeW1ib2wuQmVsb3dTdGFmZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG5hbWUgZm9yIHRoaXMgbm90ZSAqL1xuICAgIHByaXZhdGUgc3RyaW5nIE5vdGVOYW1lKGludCBub3RlbnVtYmVyLCBXaGl0ZU5vdGUgd2hpdGVub3RlKSB7XG4gICAgICAgIGlmIChzaGVldG11c2ljLlNob3dOb3RlTGV0dGVycyA9PSBNaWRpT3B0aW9ucy5Ob3RlTmFtZUxldHRlcikge1xuICAgICAgICAgICAgcmV0dXJuIExldHRlcihub3RlbnVtYmVyLCB3aGl0ZW5vdGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHNoZWV0bXVzaWMuU2hvd05vdGVMZXR0ZXJzID09IE1pZGlPcHRpb25zLk5vdGVOYW1lRml4ZWREb1JlTWkpIHtcbiAgICAgICAgICAgIHN0cmluZ1tdIGZpeGVkRG9SZU1pID0ge1xuICAgICAgICAgICAgICAgIFwiTGFcIiwgXCJMaVwiLCBcIlRpXCIsIFwiRG9cIiwgXCJEaVwiLCBcIlJlXCIsIFwiUmlcIiwgXCJNaVwiLCBcIkZhXCIsIFwiRmlcIiwgXCJTb1wiLCBcIlNpXCIgXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaW50IG5vdGVzY2FsZSA9IE5vdGVTY2FsZS5Gcm9tTnVtYmVyKG5vdGVudW1iZXIpO1xuICAgICAgICAgICAgcmV0dXJuIGZpeGVkRG9SZU1pW25vdGVzY2FsZV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc2hlZXRtdXNpYy5TaG93Tm90ZUxldHRlcnMgPT0gTWlkaU9wdGlvbnMuTm90ZU5hbWVNb3ZhYmxlRG9SZU1pKSB7XG4gICAgICAgICAgICBzdHJpbmdbXSBmaXhlZERvUmVNaSA9IHtcbiAgICAgICAgICAgICAgICBcIkxhXCIsIFwiTGlcIiwgXCJUaVwiLCBcIkRvXCIsIFwiRGlcIiwgXCJSZVwiLCBcIlJpXCIsIFwiTWlcIiwgXCJGYVwiLCBcIkZpXCIsIFwiU29cIiwgXCJTaVwiIFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGludCBtYWluc2NhbGUgPSBzaGVldG11c2ljLk1haW5LZXkuTm90ZXNjYWxlKCk7XG4gICAgICAgICAgICBpbnQgZGlmZiA9IE5vdGVTY2FsZS5DIC0gbWFpbnNjYWxlO1xuICAgICAgICAgICAgbm90ZW51bWJlciArPSBkaWZmO1xuICAgICAgICAgICAgaWYgKG5vdGVudW1iZXIgPCAwKSB7XG4gICAgICAgICAgICAgICAgbm90ZW51bWJlciArPSAxMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGludCBub3Rlc2NhbGUgPSBOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyKTtcbiAgICAgICAgICAgIHJldHVybiBmaXhlZERvUmVNaVtub3Rlc2NhbGVdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHNoZWV0bXVzaWMuU2hvd05vdGVMZXR0ZXJzID09IE1pZGlPcHRpb25zLk5vdGVOYW1lRml4ZWROdW1iZXIpIHtcbiAgICAgICAgICAgIHN0cmluZ1tdIG51bSA9IHtcbiAgICAgICAgICAgICAgICBcIjEwXCIsIFwiMTFcIiwgXCIxMlwiLCBcIjFcIiwgXCIyXCIsIFwiM1wiLCBcIjRcIiwgXCI1XCIsIFwiNlwiLCBcIjdcIiwgXCI4XCIsIFwiOVwiIFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGludCBub3Rlc2NhbGUgPSBOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyKTtcbiAgICAgICAgICAgIHJldHVybiBudW1bbm90ZXNjYWxlXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzaGVldG11c2ljLlNob3dOb3RlTGV0dGVycyA9PSBNaWRpT3B0aW9ucy5Ob3RlTmFtZU1vdmFibGVOdW1iZXIpIHtcbiAgICAgICAgICAgIHN0cmluZ1tdIG51bSA9IHtcbiAgICAgICAgICAgICAgICBcIjEwXCIsIFwiMTFcIiwgXCIxMlwiLCBcIjFcIiwgXCIyXCIsIFwiM1wiLCBcIjRcIiwgXCI1XCIsIFwiNlwiLCBcIjdcIiwgXCI4XCIsIFwiOVwiIFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGludCBtYWluc2NhbGUgPSBzaGVldG11c2ljLk1haW5LZXkuTm90ZXNjYWxlKCk7XG4gICAgICAgICAgICBpbnQgZGlmZiA9IE5vdGVTY2FsZS5DIC0gbWFpbnNjYWxlO1xuICAgICAgICAgICAgbm90ZW51bWJlciArPSBkaWZmO1xuICAgICAgICAgICAgaWYgKG5vdGVudW1iZXIgPCAwKSB7XG4gICAgICAgICAgICAgICAgbm90ZW51bWJlciArPSAxMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGludCBub3Rlc2NhbGUgPSBOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyKTtcbiAgICAgICAgICAgIHJldHVybiBudW1bbm90ZXNjYWxlXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbGV0dGVyIChBLCBBIywgQmIpIHJlcHJlc2VudGluZyB0aGlzIG5vdGUgKi9cbiAgICBwcml2YXRlIHN0cmluZyBMZXR0ZXIoaW50IG5vdGVudW1iZXIsIFdoaXRlTm90ZSB3aGl0ZW5vdGUpIHtcbiAgICAgICAgaW50IG5vdGVzY2FsZSA9IE5vdGVTY2FsZS5Gcm9tTnVtYmVyKG5vdGVudW1iZXIpO1xuICAgICAgICBzd2l0Y2gobm90ZXNjYWxlKSB7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5BOiByZXR1cm4gXCJBXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5COiByZXR1cm4gXCJCXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5DOiByZXR1cm4gXCJDXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5EOiByZXR1cm4gXCJEXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5FOiByZXR1cm4gXCJFXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5GOiByZXR1cm4gXCJGXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5HOiByZXR1cm4gXCJHXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5Bc2hhcnA6XG4gICAgICAgICAgICAgICAgaWYgKHdoaXRlbm90ZS5MZXR0ZXIgPT0gV2hpdGVOb3RlLkEpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIkEjXCI7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJCYlwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQ3NoYXJwOlxuICAgICAgICAgICAgICAgIGlmICh3aGl0ZW5vdGUuTGV0dGVyID09IFdoaXRlTm90ZS5DKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJDI1wiO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiRGJcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkRzaGFycDpcbiAgICAgICAgICAgICAgICBpZiAod2hpdGVub3RlLkxldHRlciA9PSBXaGl0ZU5vdGUuRClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiRCNcIjtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIkViXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5Gc2hhcnA6XG4gICAgICAgICAgICAgICAgaWYgKHdoaXRlbm90ZS5MZXR0ZXIgPT0gV2hpdGVOb3RlLkYpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIkYjXCI7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJHYlwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuR3NoYXJwOlxuICAgICAgICAgICAgICAgIGlmICh3aGl0ZW5vdGUuTGV0dGVyID09IFdoaXRlTm90ZS5HKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJHI1wiO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiQWJcIjtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgQ2hvcmQgU3ltYm9sOlxuICAgICAqIC0gRHJhdyB0aGUgYWNjaWRlbnRhbCBzeW1ib2xzLlxuICAgICAqIC0gRHJhdyB0aGUgYmxhY2sgY2lyY2xlIG5vdGVzLlxuICAgICAqIC0gRHJhdyB0aGUgc3RlbXMuXG4gICAgICBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIC8qIEFsaWduIHRoZSBjaG9yZCB0byB0aGUgcmlnaHQgKi9cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oV2lkdGggLSBNaW5XaWR0aCwgMCk7XG5cbiAgICAgICAgLyogRHJhdyB0aGUgYWNjaWRlbnRhbHMuICovXG4gICAgICAgIFdoaXRlTm90ZSB0b3BzdGFmZiA9IFdoaXRlTm90ZS5Ub3AoY2xlZik7XG4gICAgICAgIGludCB4cG9zID0gRHJhd0FjY2lkKGcsIHBlbiwgeXRvcCk7XG5cbiAgICAgICAgLyogRHJhdyB0aGUgbm90ZXMgKi9cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeHBvcywgMCk7XG4gICAgICAgIERyYXdOb3RlcyhnLCBwZW4sIHl0b3AsIHRvcHN0YWZmKTtcbiAgICAgICAgaWYgKHNoZWV0bXVzaWMgIT0gbnVsbCAmJiBzaGVldG11c2ljLlNob3dOb3RlTGV0dGVycyAhPSAwKSB7XG4gICAgICAgICAgICBEcmF3Tm90ZUxldHRlcnMoZywgcGVuLCB5dG9wLCB0b3BzdGFmZik7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBEcmF3IHRoZSBzdGVtcyAqL1xuICAgICAgICBpZiAoc3RlbTEgIT0gbnVsbClcbiAgICAgICAgICAgIHN0ZW0xLkRyYXcoZywgcGVuLCB5dG9wLCB0b3BzdGFmZik7XG4gICAgICAgIGlmIChzdGVtMiAhPSBudWxsKVxuICAgICAgICAgICAgc3RlbTIuRHJhdyhnLCBwZW4sIHl0b3AsIHRvcHN0YWZmKTtcblxuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgteHBvcywgMCk7XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0oV2lkdGggLSBNaW5XaWR0aCksIDApO1xuICAgIH1cblxuICAgIC8qIERyYXcgdGhlIGFjY2lkZW50YWwgc3ltYm9scy4gIElmIHR3byBzeW1ib2xzIG92ZXJsYXAgKGlmIHRoZXlcbiAgICAgKiBhcmUgbGVzcyB0aGFuIDYgbm90ZXMgYXBhcnQpLCB3ZSBjYW5ub3QgZHJhdyB0aGUgc3ltYm9sIGRpcmVjdGx5XG4gICAgICogYWJvdmUgdGhlIHByZXZpb3VzIG9uZS4gIEluc3RlYWQsIHdlIG11c3Qgc2hpZnQgaXQgdG8gdGhlIHJpZ2h0LlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEByZXR1cm4gVGhlIHggcGl4ZWwgd2lkdGggdXNlZCBieSBhbGwgdGhlIGFjY2lkZW50YWxzLlxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgRHJhd0FjY2lkKEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIGludCB4cG9zID0gMDtcblxuICAgICAgICBBY2NpZFN5bWJvbCBwcmV2ID0gbnVsbDtcbiAgICAgICAgZm9yZWFjaCAoQWNjaWRTeW1ib2wgc3ltYm9sIGluIGFjY2lkc3ltYm9scykge1xuICAgICAgICAgICAgaWYgKHByZXYgIT0gbnVsbCAmJiBzeW1ib2wuTm90ZS5EaXN0KHByZXYuTm90ZSkgPCA2KSB7XG4gICAgICAgICAgICAgICAgeHBvcyArPSBzeW1ib2wuV2lkdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSh4cG9zLCAwKTtcbiAgICAgICAgICAgIHN5bWJvbC5EcmF3KGcsIHBlbiwgeXRvcCk7XG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgteHBvcywgMCk7XG4gICAgICAgICAgICBwcmV2ID0gc3ltYm9sO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcmV2ICE9IG51bGwpIHtcbiAgICAgICAgICAgIHhwb3MgKz0gcHJldi5XaWR0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geHBvcztcbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgYmxhY2sgY2lyY2xlIG5vdGVzLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEBwYXJhbSB0b3BzdGFmZiBUaGUgd2hpdGUgbm90ZSBvZiB0aGUgdG9wIG9mIHRoZSBzdGFmZi5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3Tm90ZXMoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3AsIFdoaXRlTm90ZSB0b3BzdGFmZikge1xuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgICAgICBmb3JlYWNoIChOb3RlRGF0YSBub3RlIGluIG5vdGVkYXRhKSB7XG4gICAgICAgICAgICAvKiBHZXQgdGhlIHgseSBwb3NpdGlvbiB0byBkcmF3IHRoZSBub3RlICovXG4gICAgICAgICAgICBpbnQgeW5vdGUgPSB5dG9wICsgdG9wc3RhZmYuRGlzdChub3RlLndoaXRlbm90ZSkgKiBcbiAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG4gICAgICAgICAgICBpbnQgeG5vdGUgPSBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuICAgICAgICAgICAgaWYgKCFub3RlLmxlZnRzaWRlKVxuICAgICAgICAgICAgICAgIHhub3RlICs9IFNoZWV0TXVzaWMuTm90ZVdpZHRoO1xuXG4gICAgICAgICAgICAvKiBEcmF3IHJvdGF0ZWQgZWxsaXBzZS4gIFlvdSBtdXN0IGZpcnN0IHRyYW5zbGF0ZSAoMCwwKVxuICAgICAgICAgICAgICogdG8gdGhlIGNlbnRlciBvZiB0aGUgZWxsaXBzZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeG5vdGUgKyBTaGVldE11c2ljLk5vdGVXaWR0aC8yICsgMSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5bm90ZSAtIFNoZWV0TXVzaWMuTGluZVdpZHRoICsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQvMik7XG4gICAgICAgICAgICBnLlJvdGF0ZVRyYW5zZm9ybSgtNDUpO1xuXG4gICAgICAgICAgICBpZiAoc2hlZXRtdXNpYyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcGVuLkNvbG9yID0gc2hlZXRtdXNpYy5Ob3RlQ29sb3Iobm90ZS5udW1iZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcGVuLkNvbG9yID0gQ29sb3IuQmxhY2s7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChub3RlLmR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5XaG9sZSB8fCBcbiAgICAgICAgICAgICAgICBub3RlLmR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5IYWxmIHx8XG4gICAgICAgICAgICAgICAgbm90ZS5kdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkSGFsZikge1xuXG4gICAgICAgICAgICAgICAgZy5EcmF3RWxsaXBzZShwZW4sIC1TaGVldE11c2ljLk5vdGVXaWR0aC8yLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC1TaGVldE11c2ljLk5vdGVIZWlnaHQvMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZVdpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LTEpO1xuXG4gICAgICAgICAgICAgICAgZy5EcmF3RWxsaXBzZShwZW4sIC1TaGVldE11c2ljLk5vdGVXaWR0aC8yLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC1TaGVldE11c2ljLk5vdGVIZWlnaHQvMiArIDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC0yKTtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0VsbGlwc2UocGVuLCAtU2hlZXRNdXNpYy5Ob3RlV2lkdGgvMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgKyAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQtMyk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIEJydXNoIGJydXNoID0gQnJ1c2hlcy5CbGFjaztcbiAgICAgICAgICAgICAgICBpZiAocGVuLkNvbG9yICE9IENvbG9yLkJsYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGJydXNoID0gbmV3IFNvbGlkQnJ1c2gocGVuLkNvbG9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZy5GaWxsRWxsaXBzZShicnVzaCwgLVNoZWV0TXVzaWMuTm90ZVdpZHRoLzIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLVNoZWV0TXVzaWMuTm90ZUhlaWdodC8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQtMSk7XG4gICAgICAgICAgICAgICAgaWYgKHBlbi5Db2xvciAhPSBDb2xvci5CbGFjaykge1xuICAgICAgICAgICAgICAgICAgICBicnVzaC5EaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwZW4uQ29sb3IgPSBDb2xvci5CbGFjaztcbiAgICAgICAgICAgIGcuRHJhd0VsbGlwc2UocGVuLCAtU2hlZXRNdXNpYy5Ob3RlV2lkdGgvMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC1TaGVldE11c2ljLk5vdGVIZWlnaHQvMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZVdpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LTEpO1xuXG4gICAgICAgICAgICBnLlJvdGF0ZVRyYW5zZm9ybSg0NSk7XG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSggLSAoeG5vdGUgKyBTaGVldE11c2ljLk5vdGVXaWR0aC8yICsgMSksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gKHlub3RlIC0gU2hlZXRNdXNpYy5MaW5lV2lkdGggKyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQvMikpO1xuXG4gICAgICAgICAgICAvKiBEcmF3IGEgZG90IGlmIHRoaXMgaXMgYSBkb3R0ZWQgZHVyYXRpb24uICovXG4gICAgICAgICAgICBpZiAobm90ZS5kdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkSGFsZiB8fFxuICAgICAgICAgICAgICAgIG5vdGUuZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZFF1YXJ0ZXIgfHxcbiAgICAgICAgICAgICAgICBub3RlLmR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGgpIHtcblxuICAgICAgICAgICAgICAgIGcuRmlsbEVsbGlwc2UoQnJ1c2hlcy5CbGFjaywgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4bm90ZSArIFNoZWV0TXVzaWMuTm90ZVdpZHRoICsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxpbmVTcGFjZS8zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeW5vdGUgKyBTaGVldE11c2ljLkxpbmVTcGFjZS8zLCA0LCA0KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBEcmF3IGhvcml6b250YWwgbGluZXMgaWYgbm90ZSBpcyBhYm92ZS9iZWxvdyB0aGUgc3RhZmYgKi9cbiAgICAgICAgICAgIFdoaXRlTm90ZSB0b3AgPSB0b3BzdGFmZi5BZGQoMSk7XG4gICAgICAgICAgICBpbnQgZGlzdCA9IG5vdGUud2hpdGVub3RlLkRpc3QodG9wKTtcbiAgICAgICAgICAgIGludCB5ID0geXRvcCAtIFNoZWV0TXVzaWMuTGluZVdpZHRoO1xuXG4gICAgICAgICAgICBpZiAoZGlzdCA+PSAyKSB7XG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDI7IGkgPD0gZGlzdDsgaSArPSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIHkgLT0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeG5vdGUgLSBTaGVldE11c2ljLkxpbmVTcGFjZS80LCB5LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhub3RlICsgU2hlZXRNdXNpYy5Ob3RlV2lkdGggKyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQsIHkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgV2hpdGVOb3RlIGJvdHRvbSA9IHRvcC5BZGQoLTgpO1xuICAgICAgICAgICAgeSA9IHl0b3AgKyAoU2hlZXRNdXNpYy5MaW5lU3BhY2UgKyBTaGVldE11c2ljLkxpbmVXaWR0aCkgKiA0IC0gMTtcbiAgICAgICAgICAgIGRpc3QgPSBib3R0b20uRGlzdChub3RlLndoaXRlbm90ZSk7XG4gICAgICAgICAgICBpZiAoZGlzdCA+PSAyKSB7XG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDI7IGkgPD0gZGlzdDsgaSs9IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgeSArPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4bm90ZSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQsIHksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeG5vdGUgKyBTaGVldE11c2ljLk5vdGVXaWR0aCArIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCwgeSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyogRW5kIGRyYXdpbmcgaG9yaXpvbnRhbCBsaW5lcyAqL1xuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgbm90ZSBsZXR0ZXJzIChBLCBBIywgQmIsIGV0YykgbmV4dCB0byB0aGUgbm90ZSBjaXJjbGVzLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEBwYXJhbSB0b3BzdGFmZiBUaGUgd2hpdGUgbm90ZSBvZiB0aGUgdG9wIG9mIHRoZSBzdGFmZi5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3Tm90ZUxldHRlcnMoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3AsIFdoaXRlTm90ZSB0b3BzdGFmZikge1xuICAgICAgICBib29sIG92ZXJsYXAgPSBOb3Rlc092ZXJsYXAobm90ZWRhdGEsIDAsIG5vdGVkYXRhLkxlbmd0aCk7XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG5cbiAgICAgICAgZm9yZWFjaCAoTm90ZURhdGEgbm90ZSBpbiBub3RlZGF0YSkge1xuICAgICAgICAgICAgaWYgKCFub3RlLmxlZnRzaWRlKSB7XG4gICAgICAgICAgICAgICAgLyogVGhlcmUncyBub3QgZW5vdWdodCBwaXhlbCByb29tIHRvIHNob3cgdGhlIGxldHRlciAqL1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBHZXQgdGhlIHgseSBwb3NpdGlvbiB0byBkcmF3IHRoZSBub3RlICovXG4gICAgICAgICAgICBpbnQgeW5vdGUgPSB5dG9wICsgdG9wc3RhZmYuRGlzdChub3RlLndoaXRlbm90ZSkgKiBcbiAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG4gICAgICAgICAgICAvKiBEcmF3IHRoZSBsZXR0ZXIgdG8gdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIG5vdGUgKi9cbiAgICAgICAgICAgIGludCB4bm90ZSA9IFNoZWV0TXVzaWMuTm90ZVdpZHRoICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvNDtcblxuICAgICAgICAgICAgaWYgKG5vdGUuZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEhhbGYgfHxcbiAgICAgICAgICAgICAgICBub3RlLmR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRRdWFydGVyIHx8XG4gICAgICAgICAgICAgICAgbm90ZS5kdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoIHx8IG92ZXJsYXApIHtcblxuICAgICAgICAgICAgICAgIHhub3RlICs9IFNoZWV0TXVzaWMuTm90ZVdpZHRoLzI7XG4gICAgICAgICAgICB9IFxuICAgICAgICAgICAgZy5EcmF3U3RyaW5nKE5vdGVOYW1lKG5vdGUubnVtYmVyLCBub3RlLndoaXRlbm90ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5MZXR0ZXJGb250LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICBCcnVzaGVzLkJsYWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHhub3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHlub3RlIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKiogUmV0dXJuIHRydWUgaWYgdGhlIGNob3JkcyBjYW4gYmUgY29ubmVjdGVkLCB3aGVyZSB0aGVpciBzdGVtcyBhcmVcbiAgICAgKiBqb2luZWQgYnkgYSBob3Jpem9udGFsIGJlYW0uIEluIG9yZGVyIHRvIGNyZWF0ZSB0aGUgYmVhbTpcbiAgICAgKlxuICAgICAqIC0gVGhlIGNob3JkcyBtdXN0IGJlIGluIHRoZSBzYW1lIG1lYXN1cmUuXG4gICAgICogLSBUaGUgY2hvcmQgc3RlbXMgc2hvdWxkIG5vdCBiZSBhIGRvdHRlZCBkdXJhdGlvbi5cbiAgICAgKiAtIFRoZSBjaG9yZCBzdGVtcyBtdXN0IGJlIHRoZSBzYW1lIGR1cmF0aW9uLCB3aXRoIG9uZSBleGNlcHRpb25cbiAgICAgKiAgIChEb3R0ZWQgRWlnaHRoIHRvIFNpeHRlZW50aCkuXG4gICAgICogLSBUaGUgc3RlbXMgbXVzdCBhbGwgcG9pbnQgaW4gdGhlIHNhbWUgZGlyZWN0aW9uICh1cCBvciBkb3duKS5cbiAgICAgKiAtIFRoZSBjaG9yZCBjYW5ub3QgYWxyZWFkeSBiZSBwYXJ0IG9mIGEgYmVhbS5cbiAgICAgKlxuICAgICAqIC0gNi1jaG9yZCBiZWFtcyBtdXN0IGJlIDh0aCBub3RlcyBpbiAzLzQsIDYvOCwgb3IgNi80IHRpbWVcbiAgICAgKiAtIDMtY2hvcmQgYmVhbXMgbXVzdCBiZSBlaXRoZXIgdHJpcGxldHMsIG9yIDh0aCBub3RlcyAoMTIvOCB0aW1lIHNpZ25hdHVyZSlcbiAgICAgKiAtIDQtY2hvcmQgYmVhbXMgYXJlIG9rIGZvciAyLzIsIDIvNCBvciA0LzQgdGltZSwgYW55IGR1cmF0aW9uXG4gICAgICogLSA0LWNob3JkIGJlYW1zIGFyZSBvayBmb3Igb3RoZXIgdGltZXMgaWYgdGhlIGR1cmF0aW9uIGlzIDE2dGhcbiAgICAgKiAtIDItY2hvcmQgYmVhbXMgYXJlIG9rIGZvciBhbnkgZHVyYXRpb25cbiAgICAgKlxuICAgICAqIElmIHN0YXJ0UXVhcnRlciBpcyB0cnVlLCB0aGUgZmlyc3Qgbm90ZSBzaG91bGQgc3RhcnQgb24gYSBxdWFydGVyIG5vdGVcbiAgICAgKiAob25seSBhcHBsaWVzIHRvIDItY2hvcmQgYmVhbXMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgXG4gICAgYm9vbCBDYW5DcmVhdGVCZWFtKENob3JkU3ltYm9sW10gY2hvcmRzLCBUaW1lU2lnbmF0dXJlIHRpbWUsIGJvb2wgc3RhcnRRdWFydGVyKSB7XG4gICAgICAgIGludCBudW1DaG9yZHMgPSBjaG9yZHMuTGVuZ3RoO1xuICAgICAgICBTdGVtIGZpcnN0U3RlbSA9IGNob3Jkc1swXS5TdGVtO1xuICAgICAgICBTdGVtIGxhc3RTdGVtID0gY2hvcmRzW2Nob3Jkcy5MZW5ndGgtMV0uU3RlbTtcbiAgICAgICAgaWYgKGZpcnN0U3RlbSA9PSBudWxsIHx8IGxhc3RTdGVtID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpbnQgbWVhc3VyZSA9IGNob3Jkc1swXS5TdGFydFRpbWUgLyB0aW1lLk1lYXN1cmU7XG4gICAgICAgIE5vdGVEdXJhdGlvbiBkdXIgPSBmaXJzdFN0ZW0uRHVyYXRpb247XG4gICAgICAgIE5vdGVEdXJhdGlvbiBkdXIyID0gbGFzdFN0ZW0uRHVyYXRpb247XG5cbiAgICAgICAgYm9vbCBkb3R0ZWQ4X3RvXzE2ID0gZmFsc2U7XG4gICAgICAgIGlmIChjaG9yZHMuTGVuZ3RoID09IDIgJiYgZHVyID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGggJiZcbiAgICAgICAgICAgIGR1cjIgPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCkge1xuICAgICAgICAgICAgZG90dGVkOF90b18xNiA9IHRydWU7XG4gICAgICAgIH0gXG5cbiAgICAgICAgaWYgKGR1ciA9PSBOb3RlRHVyYXRpb24uV2hvbGUgfHwgZHVyID09IE5vdGVEdXJhdGlvbi5IYWxmIHx8XG4gICAgICAgICAgICBkdXIgPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEhhbGYgfHwgZHVyID09IE5vdGVEdXJhdGlvbi5RdWFydGVyIHx8XG4gICAgICAgICAgICBkdXIgPT0gTm90ZUR1cmF0aW9uLkRvdHRlZFF1YXJ0ZXIgfHxcbiAgICAgICAgICAgIChkdXIgPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCAmJiAhZG90dGVkOF90b18xNikpIHtcblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG51bUNob3JkcyA9PSA2KSB7XG4gICAgICAgICAgICBpZiAoZHVyICE9IE5vdGVEdXJhdGlvbi5FaWdodGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBib29sIGNvcnJlY3RUaW1lID0gXG4gICAgICAgICAgICAgICAoKHRpbWUuTnVtZXJhdG9yID09IDMgJiYgdGltZS5EZW5vbWluYXRvciA9PSA0KSB8fFxuICAgICAgICAgICAgICAgICh0aW1lLk51bWVyYXRvciA9PSA2ICYmIHRpbWUuRGVub21pbmF0b3IgPT0gOCkgfHxcbiAgICAgICAgICAgICAgICAodGltZS5OdW1lcmF0b3IgPT0gNiAmJiB0aW1lLkRlbm9taW5hdG9yID09IDQpICk7XG5cbiAgICAgICAgICAgIGlmICghY29ycmVjdFRpbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aW1lLk51bWVyYXRvciA9PSA2ICYmIHRpbWUuRGVub21pbmF0b3IgPT0gNCkge1xuICAgICAgICAgICAgICAgIC8qIGZpcnN0IGNob3JkIG11c3Qgc3RhcnQgYXQgMXN0IG9yIDR0aCBxdWFydGVyIG5vdGUgKi9cbiAgICAgICAgICAgICAgICBpbnQgYmVhdCA9IHRpbWUuUXVhcnRlciAqIDM7XG4gICAgICAgICAgICAgICAgaWYgKChjaG9yZHNbMF0uU3RhcnRUaW1lICUgYmVhdCkgPiB0aW1lLlF1YXJ0ZXIvNikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChudW1DaG9yZHMgPT0gNCkge1xuICAgICAgICAgICAgaWYgKHRpbWUuTnVtZXJhdG9yID09IDMgJiYgdGltZS5EZW5vbWluYXRvciA9PSA4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYm9vbCBjb3JyZWN0VGltZSA9IFxuICAgICAgICAgICAgICAodGltZS5OdW1lcmF0b3IgPT0gMiB8fCB0aW1lLk51bWVyYXRvciA9PSA0IHx8IHRpbWUuTnVtZXJhdG9yID09IDgpO1xuICAgICAgICAgICAgaWYgKCFjb3JyZWN0VGltZSAmJiBkdXIgIT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogY2hvcmQgbXVzdCBzdGFydCBvbiBxdWFydGVyIG5vdGUgKi9cbiAgICAgICAgICAgIGludCBiZWF0ID0gdGltZS5RdWFydGVyO1xuICAgICAgICAgICAgaWYgKGR1ciA9PSBOb3RlRHVyYXRpb24uRWlnaHRoKSB7XG4gICAgICAgICAgICAgICAgLyogOHRoIG5vdGUgY2hvcmQgbXVzdCBzdGFydCBvbiAxc3Qgb3IgM3JkIHF1YXJ0ZXIgbm90ZSAqL1xuICAgICAgICAgICAgICAgIGJlYXQgPSB0aW1lLlF1YXJ0ZXIgKiAyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZHVyID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcbiAgICAgICAgICAgICAgICAvKiAzMm5kIG5vdGUgbXVzdCBzdGFydCBvbiBhbiA4dGggYmVhdCAqL1xuICAgICAgICAgICAgICAgIGJlYXQgPSB0aW1lLlF1YXJ0ZXIgLyAyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoKGNob3Jkc1swXS5TdGFydFRpbWUgJSBiZWF0KSA+IHRpbWUuUXVhcnRlci82KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG51bUNob3JkcyA9PSAzKSB7XG4gICAgICAgICAgICBib29sIHZhbGlkID0gKGR1ciA9PSBOb3RlRHVyYXRpb24uVHJpcGxldCkgfHwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgIChkdXIgPT0gTm90ZUR1cmF0aW9uLkVpZ2h0aCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5OdW1lcmF0b3IgPT0gMTIgJiYgdGltZS5EZW5vbWluYXRvciA9PSA4KTtcbiAgICAgICAgICAgIGlmICghdmFsaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIGNob3JkIG11c3Qgc3RhcnQgb24gcXVhcnRlciBub3RlICovXG4gICAgICAgICAgICBpbnQgYmVhdCA9IHRpbWUuUXVhcnRlcjtcbiAgICAgICAgICAgIGlmICh0aW1lLk51bWVyYXRvciA9PSAxMiAmJiB0aW1lLkRlbm9taW5hdG9yID09IDgpIHtcbiAgICAgICAgICAgICAgICAvKiBJbiAxMi84IHRpbWUsIGNob3JkIG11c3Qgc3RhcnQgb24gMyo4dGggYmVhdCAqL1xuICAgICAgICAgICAgICAgIGJlYXQgPSB0aW1lLlF1YXJ0ZXIvMiAqIDM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoKGNob3Jkc1swXS5TdGFydFRpbWUgJSBiZWF0KSA+IHRpbWUuUXVhcnRlci82KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZWxzZSBpZiAobnVtQ2hvcmRzID09IDIpIHtcbiAgICAgICAgICAgIGlmIChzdGFydFF1YXJ0ZXIpIHtcbiAgICAgICAgICAgICAgICBpbnQgYmVhdCA9IHRpbWUuUXVhcnRlcjtcbiAgICAgICAgICAgICAgICBpZiAoKGNob3Jkc1swXS5TdGFydFRpbWUgJSBiZWF0KSA+IHRpbWUuUXVhcnRlci82KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3JlYWNoIChDaG9yZFN5bWJvbCBjaG9yZCBpbiBjaG9yZHMpIHtcbiAgICAgICAgICAgIGlmICgoY2hvcmQuU3RhcnRUaW1lIC8gdGltZS5NZWFzdXJlKSAhPSBtZWFzdXJlKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmIChjaG9yZC5TdGVtID09IG51bGwpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgaWYgKGNob3JkLlN0ZW0uRHVyYXRpb24gIT0gZHVyICYmICFkb3R0ZWQ4X3RvXzE2KVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmIChjaG9yZC5TdGVtLmlzQmVhbSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBDaGVjayB0aGF0IGFsbCBzdGVtcyBjYW4gcG9pbnQgaW4gc2FtZSBkaXJlY3Rpb24gKi9cbiAgICAgICAgYm9vbCBoYXNUd29TdGVtcyA9IGZhbHNlO1xuICAgICAgICBpbnQgZGlyZWN0aW9uID0gU3RlbS5VcDsgXG4gICAgICAgIGZvcmVhY2ggKENob3JkU3ltYm9sIGNob3JkIGluIGNob3Jkcykge1xuICAgICAgICAgICAgaWYgKGNob3JkLkhhc1R3b1N0ZW1zKSB7XG4gICAgICAgICAgICAgICAgaWYgKGhhc1R3b1N0ZW1zICYmIGNob3JkLlN0ZW0uRGlyZWN0aW9uICE9IGRpcmVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGhhc1R3b1N0ZW1zID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSBjaG9yZC5TdGVtLkRpcmVjdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIEdldCB0aGUgZmluYWwgc3RlbSBkaXJlY3Rpb24gKi9cbiAgICAgICAgaWYgKCFoYXNUd29TdGVtcykge1xuICAgICAgICAgICAgV2hpdGVOb3RlIG5vdGUxO1xuICAgICAgICAgICAgV2hpdGVOb3RlIG5vdGUyO1xuICAgICAgICAgICAgbm90ZTEgPSAoZmlyc3RTdGVtLkRpcmVjdGlvbiA9PSBTdGVtLlVwID8gZmlyc3RTdGVtLlRvcCA6IGZpcnN0U3RlbS5Cb3R0b20pO1xuICAgICAgICAgICAgbm90ZTIgPSAobGFzdFN0ZW0uRGlyZWN0aW9uID09IFN0ZW0uVXAgPyBsYXN0U3RlbS5Ub3AgOiBsYXN0U3RlbS5Cb3R0b20pO1xuICAgICAgICAgICAgZGlyZWN0aW9uID0gU3RlbURpcmVjdGlvbihub3RlMSwgbm90ZTIsIGNob3Jkc1swXS5DbGVmKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIElmIHRoZSBub3RlcyBhcmUgdG9vIGZhciBhcGFydCwgZG9uJ3QgdXNlIGEgYmVhbSAqL1xuICAgICAgICBpZiAoZGlyZWN0aW9uID09IFN0ZW0uVXApIHtcbiAgICAgICAgICAgIGlmIChNYXRoLkFicyhmaXJzdFN0ZW0uVG9wLkRpc3QobGFzdFN0ZW0uVG9wKSkgPj0gMTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoTWF0aC5BYnMoZmlyc3RTdGVtLkJvdHRvbS5EaXN0KGxhc3RTdGVtLkJvdHRvbSkpID49IDExKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuXG4gICAgLyoqIENvbm5lY3QgdGhlIGNob3JkcyB1c2luZyBhIGhvcml6b250YWwgYmVhbS4gXG4gICAgICpcbiAgICAgKiBzcGFjaW5nIGlzIHRoZSBob3Jpem9udGFsIGRpc3RhbmNlIChpbiBwaXhlbHMpIGJldHdlZW4gdGhlIHJpZ2h0IHNpZGUgXG4gICAgICogb2YgdGhlIGZpcnN0IGNob3JkLCBhbmQgdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIGxhc3QgY2hvcmQuXG4gICAgICpcbiAgICAgKiBUbyBtYWtlIHRoZSBiZWFtOlxuICAgICAqIC0gQ2hhbmdlIHRoZSBzdGVtIGRpcmVjdGlvbnMgZm9yIGVhY2ggY2hvcmQsIHNvIHRoZXkgbWF0Y2guXG4gICAgICogLSBJbiB0aGUgZmlyc3QgY2hvcmQsIHBhc3MgdGhlIHN0ZW0gbG9jYXRpb24gb2YgdGhlIGxhc3QgY2hvcmQsIGFuZFxuICAgICAqICAgdGhlIGhvcml6b250YWwgc3BhY2luZyB0byB0aGF0IGxhc3Qgc3RlbS5cbiAgICAgKiAtIE1hcmsgYWxsIGNob3JkcyAoZXhjZXB0IHRoZSBmaXJzdCkgYXMgXCJyZWNlaXZlclwiIHBhaXJzLCBzbyB0aGF0IFxuICAgICAqICAgdGhleSBkb24ndCBkcmF3IGEgY3Vydnkgc3RlbS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIFxuICAgIHZvaWQgQ3JlYXRlQmVhbShDaG9yZFN5bWJvbFtdIGNob3JkcywgaW50IHNwYWNpbmcpIHtcbiAgICAgICAgU3RlbSBmaXJzdFN0ZW0gPSBjaG9yZHNbMF0uU3RlbTtcbiAgICAgICAgU3RlbSBsYXN0U3RlbSA9IGNob3Jkc1tjaG9yZHMuTGVuZ3RoLTFdLlN0ZW07XG5cbiAgICAgICAgLyogQ2FsY3VsYXRlIHRoZSBuZXcgc3RlbSBkaXJlY3Rpb24gKi9cbiAgICAgICAgaW50IG5ld2RpcmVjdGlvbiA9IC0xO1xuICAgICAgICBmb3JlYWNoIChDaG9yZFN5bWJvbCBjaG9yZCBpbiBjaG9yZHMpIHtcbiAgICAgICAgICAgIGlmIChjaG9yZC5IYXNUd29TdGVtcykge1xuICAgICAgICAgICAgICAgIG5ld2RpcmVjdGlvbiA9IGNob3JkLlN0ZW0uRGlyZWN0aW9uO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5ld2RpcmVjdGlvbiA9PSAtMSkge1xuICAgICAgICAgICAgV2hpdGVOb3RlIG5vdGUxO1xuICAgICAgICAgICAgV2hpdGVOb3RlIG5vdGUyO1xuICAgICAgICAgICAgbm90ZTEgPSAoZmlyc3RTdGVtLkRpcmVjdGlvbiA9PSBTdGVtLlVwID8gZmlyc3RTdGVtLlRvcCA6IGZpcnN0U3RlbS5Cb3R0b20pO1xuICAgICAgICAgICAgbm90ZTIgPSAobGFzdFN0ZW0uRGlyZWN0aW9uID09IFN0ZW0uVXAgPyBsYXN0U3RlbS5Ub3AgOiBsYXN0U3RlbS5Cb3R0b20pO1xuICAgICAgICAgICAgbmV3ZGlyZWN0aW9uID0gU3RlbURpcmVjdGlvbihub3RlMSwgbm90ZTIsIGNob3Jkc1swXS5DbGVmKTtcbiAgICAgICAgfVxuICAgICAgICBmb3JlYWNoIChDaG9yZFN5bWJvbCBjaG9yZCBpbiBjaG9yZHMpIHtcbiAgICAgICAgICAgIGNob3JkLlN0ZW0uRGlyZWN0aW9uID0gbmV3ZGlyZWN0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNob3Jkcy5MZW5ndGggPT0gMikge1xuICAgICAgICAgICAgQnJpbmdTdGVtc0Nsb3NlcihjaG9yZHMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgTGluZVVwU3RlbUVuZHMoY2hvcmRzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZpcnN0U3RlbS5TZXRQYWlyKGxhc3RTdGVtLCBzcGFjaW5nKTtcbiAgICAgICAgZm9yIChpbnQgaSA9IDE7IGkgPCBjaG9yZHMuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNob3Jkc1tpXS5TdGVtLlJlY2VpdmVyID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBXZSdyZSBjb25uZWN0aW5nIHRoZSBzdGVtcyBvZiB0d28gY2hvcmRzIHVzaW5nIGEgaG9yaXpvbnRhbCBiZWFtLlxuICAgICAqICBBZGp1c3QgdGhlIHZlcnRpY2FsIGVuZHBvaW50IG9mIHRoZSBzdGVtcywgc28gdGhhdCB0aGV5J3JlIGNsb3NlclxuICAgICAqICB0b2dldGhlci4gIEZvciBhIGRvdHRlZCA4dGggdG8gMTZ0aCBiZWFtLCBpbmNyZWFzZSB0aGUgc3RlbSBvZiB0aGVcbiAgICAgKiAgZG90dGVkIGVpZ2h0aCwgc28gdGhhdCBpdCdzIGFzIGxvbmcgYXMgYSAxNnRoIHN0ZW0uXG4gICAgICovXG4gICAgc3RhdGljIHZvaWRcbiAgICBCcmluZ1N0ZW1zQ2xvc2VyKENob3JkU3ltYm9sW10gY2hvcmRzKSB7XG4gICAgICAgIFN0ZW0gZmlyc3RTdGVtID0gY2hvcmRzWzBdLlN0ZW07XG4gICAgICAgIFN0ZW0gbGFzdFN0ZW0gPSBjaG9yZHNbMV0uU3RlbTtcblxuICAgICAgICAvKiBJZiB3ZSdyZSBjb25uZWN0aW5nIGEgZG90dGVkIDh0aCB0byBhIDE2dGgsIGluY3JlYXNlXG4gICAgICAgICAqIHRoZSBzdGVtIGVuZCBvZiB0aGUgZG90dGVkIGVpZ2h0aC5cbiAgICAgICAgICovXG4gICAgICAgIGlmIChmaXJzdFN0ZW0uRHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCAmJlxuICAgICAgICAgICAgbGFzdFN0ZW0uRHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCkge1xuICAgICAgICAgICAgaWYgKGZpcnN0U3RlbS5EaXJlY3Rpb24gPT0gU3RlbS5VcCkge1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSBmaXJzdFN0ZW0uRW5kLkFkZCgyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSBmaXJzdFN0ZW0uRW5kLkFkZCgtMik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBCcmluZyB0aGUgc3RlbSBlbmRzIGNsb3NlciB0b2dldGhlciAqL1xuICAgICAgICBpbnQgZGlzdGFuY2UgPSBNYXRoLkFicyhmaXJzdFN0ZW0uRW5kLkRpc3QobGFzdFN0ZW0uRW5kKSk7XG4gICAgICAgIGlmIChmaXJzdFN0ZW0uRGlyZWN0aW9uID09IFN0ZW0uVXApIHtcbiAgICAgICAgICAgIGlmIChXaGl0ZU5vdGUuTWF4KGZpcnN0U3RlbS5FbmQsIGxhc3RTdGVtLkVuZCkgPT0gZmlyc3RTdGVtLkVuZClcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSBsYXN0U3RlbS5FbmQuQWRkKGRpc3RhbmNlLzIpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSBmaXJzdFN0ZW0uRW5kLkFkZChkaXN0YW5jZS8yKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChXaGl0ZU5vdGUuTWluKGZpcnN0U3RlbS5FbmQsIGxhc3RTdGVtLkVuZCkgPT0gZmlyc3RTdGVtLkVuZClcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSBsYXN0U3RlbS5FbmQuQWRkKC1kaXN0YW5jZS8yKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmaXJzdFN0ZW0uRW5kID0gZmlyc3RTdGVtLkVuZC5BZGQoLWRpc3RhbmNlLzIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFdlJ3JlIGNvbm5lY3RpbmcgdGhlIHN0ZW1zIG9mIHRocmVlIG9yIG1vcmUgY2hvcmRzIHVzaW5nIGEgaG9yaXpvbnRhbCBiZWFtLlxuICAgICAqICBBZGp1c3QgdGhlIHZlcnRpY2FsIGVuZHBvaW50IG9mIHRoZSBzdGVtcywgc28gdGhhdCB0aGUgbWlkZGxlIGNob3JkIHN0ZW1zXG4gICAgICogIGFyZSB2ZXJ0aWNhbGx5IGluIGJldHdlZW4gdGhlIGZpcnN0IGFuZCBsYXN0IHN0ZW0uXG4gICAgICovXG4gICAgc3RhdGljIHZvaWRcbiAgICBMaW5lVXBTdGVtRW5kcyhDaG9yZFN5bWJvbFtdIGNob3Jkcykge1xuICAgICAgICBTdGVtIGZpcnN0U3RlbSA9IGNob3Jkc1swXS5TdGVtO1xuICAgICAgICBTdGVtIGxhc3RTdGVtID0gY2hvcmRzW2Nob3Jkcy5MZW5ndGgtMV0uU3RlbTtcbiAgICAgICAgU3RlbSBtaWRkbGVTdGVtID0gY2hvcmRzWzFdLlN0ZW07XG5cbiAgICAgICAgaWYgKGZpcnN0U3RlbS5EaXJlY3Rpb24gPT0gU3RlbS5VcCkge1xuICAgICAgICAgICAgLyogRmluZCB0aGUgaGlnaGVzdCBzdGVtLiBUaGUgYmVhbSB3aWxsIGVpdGhlcjpcbiAgICAgICAgICAgICAqIC0gU2xhbnQgZG93bndhcmRzIChmaXJzdCBzdGVtIGlzIGhpZ2hlc3QpXG4gICAgICAgICAgICAgKiAtIFNsYW50IHVwd2FyZHMgKGxhc3Qgc3RlbSBpcyBoaWdoZXN0KVxuICAgICAgICAgICAgICogLSBCZSBzdHJhaWdodCAobWlkZGxlIHN0ZW0gaXMgaGlnaGVzdClcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgV2hpdGVOb3RlIHRvcCA9IGZpcnN0U3RlbS5FbmQ7XG4gICAgICAgICAgICBmb3JlYWNoIChDaG9yZFN5bWJvbCBjaG9yZCBpbiBjaG9yZHMpIHtcbiAgICAgICAgICAgICAgICB0b3AgPSBXaGl0ZU5vdGUuTWF4KHRvcCwgY2hvcmQuU3RlbS5FbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRvcCA9PSBmaXJzdFN0ZW0uRW5kICYmIHRvcC5EaXN0KGxhc3RTdGVtLkVuZCkgPj0gMikge1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSB0b3A7XG4gICAgICAgICAgICAgICAgbWlkZGxlU3RlbS5FbmQgPSB0b3AuQWRkKC0xKTtcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSB0b3AuQWRkKC0yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRvcCA9PSBsYXN0U3RlbS5FbmQgJiYgdG9wLkRpc3QoZmlyc3RTdGVtLkVuZCkgPj0gMikge1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSB0b3AuQWRkKC0yKTtcbiAgICAgICAgICAgICAgICBtaWRkbGVTdGVtLkVuZCA9IHRvcC5BZGQoLTEpO1xuICAgICAgICAgICAgICAgIGxhc3RTdGVtLkVuZCA9IHRvcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSB0b3A7XG4gICAgICAgICAgICAgICAgbWlkZGxlU3RlbS5FbmQgPSB0b3A7XG4gICAgICAgICAgICAgICAgbGFzdFN0ZW0uRW5kID0gdG9wO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLyogRmluZCB0aGUgYm90dG9tbW9zdCBzdGVtLiBUaGUgYmVhbSB3aWxsIGVpdGhlcjpcbiAgICAgICAgICAgICAqIC0gU2xhbnQgdXB3YXJkcyAoZmlyc3Qgc3RlbSBpcyBsb3dlc3QpXG4gICAgICAgICAgICAgKiAtIFNsYW50IGRvd253YXJkcyAobGFzdCBzdGVtIGlzIGxvd2VzdClcbiAgICAgICAgICAgICAqIC0gQmUgc3RyYWlnaHQgKG1pZGRsZSBzdGVtIGlzIGhpZ2hlc3QpXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFdoaXRlTm90ZSBib3R0b20gPSBmaXJzdFN0ZW0uRW5kO1xuICAgICAgICAgICAgZm9yZWFjaCAoQ2hvcmRTeW1ib2wgY2hvcmQgaW4gY2hvcmRzKSB7XG4gICAgICAgICAgICAgICAgYm90dG9tID0gV2hpdGVOb3RlLk1pbihib3R0b20sIGNob3JkLlN0ZW0uRW5kKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGJvdHRvbSA9PSBmaXJzdFN0ZW0uRW5kICYmIGxhc3RTdGVtLkVuZC5EaXN0KGJvdHRvbSkgPj0gMikge1xuICAgICAgICAgICAgICAgIG1pZGRsZVN0ZW0uRW5kID0gYm90dG9tLkFkZCgxKTtcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSBib3R0b20uQWRkKDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoYm90dG9tID09IGxhc3RTdGVtLkVuZCAmJiBmaXJzdFN0ZW0uRW5kLkRpc3QoYm90dG9tKSA+PSAyKSB7XG4gICAgICAgICAgICAgICAgbWlkZGxlU3RlbS5FbmQgPSBib3R0b20uQWRkKDEpO1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSBib3R0b20uQWRkKDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZmlyc3RTdGVtLkVuZCA9IGJvdHRvbTtcbiAgICAgICAgICAgICAgICBtaWRkbGVTdGVtLkVuZCA9IGJvdHRvbTtcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSBib3R0b207XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBBbGwgbWlkZGxlIHN0ZW1zIGhhdmUgdGhlIHNhbWUgZW5kICovXG4gICAgICAgIGZvciAoaW50IGkgPSAxOyBpIDwgY2hvcmRzLkxlbmd0aC0xOyBpKyspIHtcbiAgICAgICAgICAgIFN0ZW0gc3RlbSA9IGNob3Jkc1tpXS5TdGVtO1xuICAgICAgICAgICAgc3RlbS5FbmQgPSBtaWRkbGVTdGVtLkVuZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHN0cmluZyByZXN1bHQgPSBzdHJpbmcuRm9ybWF0KFwiQ2hvcmRTeW1ib2wgY2xlZj17MH0gc3RhcnQ9ezF9IGVuZD17Mn0gd2lkdGg9ezN9IGhhc3R3b3N0ZW1zPXs0fSBcIiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWYsIFN0YXJ0VGltZSwgRW5kVGltZSwgV2lkdGgsIGhhc3R3b3N0ZW1zKTtcbiAgICAgICAgZm9yZWFjaCAoQWNjaWRTeW1ib2wgc3ltYm9sIGluIGFjY2lkc3ltYm9scykge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHN5bWJvbC5Ub1N0cmluZygpICsgXCIgXCI7XG4gICAgICAgIH1cbiAgICAgICAgZm9yZWFjaCAoTm90ZURhdGEgbm90ZSBpbiBub3RlZGF0YSkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHN0cmluZy5Gb3JtYXQoXCJOb3RlIHdoaXRlbm90ZT17MH0gZHVyYXRpb249ezF9IGxlZnRzaWRlPXsyfSBcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGUud2hpdGVub3RlLCBub3RlLmR1cmF0aW9uLCBub3RlLmxlZnRzaWRlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RlbTEgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHN0ZW0xLlRvU3RyaW5nKCkgKyBcIiBcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RlbTIgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHN0ZW0yLlRvU3RyaW5nKCkgKyBcIiBcIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0OyBcbiAgICB9XG5cbn1cblxuXG59XG5cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogVGhlIHBvc3NpYmxlIGNsZWZzLCBUcmVibGUgb3IgQmFzcyAqL1xucHVibGljIGVudW0gQ2xlZiB7IFRyZWJsZSwgQmFzcyB9O1xuXG4vKiogQGNsYXNzIENsZWZTeW1ib2wgXG4gKiBBIENsZWZTeW1ib2wgcmVwcmVzZW50cyBlaXRoZXIgYSBUcmVibGUgb3IgQmFzcyBDbGVmIGltYWdlLlxuICogVGhlIGNsZWYgY2FuIGJlIGVpdGhlciBub3JtYWwgb3Igc21hbGwgc2l6ZS4gIE5vcm1hbCBzaXplIGlzXG4gKiB1c2VkIGF0IHRoZSBiZWdpbm5pbmcgb2YgYSBuZXcgc3RhZmYsIG9uIHRoZSBsZWZ0IHNpZGUuICBUaGVcbiAqIHNtYWxsIHN5bWJvbHMgYXJlIHVzZWQgdG8gc2hvdyBjbGVmIGNoYW5nZXMgd2l0aGluIGEgc3RhZmYuXG4gKi9cblxucHVibGljIGNsYXNzIENsZWZTeW1ib2wgOiBNdXNpY1N5bWJvbCB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgSW1hZ2UgdHJlYmxlOyAgLyoqIFRoZSB0cmVibGUgY2xlZiBpbWFnZSAqL1xuICAgIHByaXZhdGUgc3RhdGljIEltYWdlIGJhc3M7ICAgIC8qKiBUaGUgYmFzcyBjbGVmIGltYWdlICovXG5cbiAgICBwcml2YXRlIGludCBzdGFydHRpbWU7ICAgICAgICAvKiogU3RhcnQgdGltZSBvZiB0aGUgc3ltYm9sICovXG4gICAgcHJpdmF0ZSBib29sIHNtYWxsc2l6ZTsgICAgICAgLyoqIFRydWUgaWYgdGhpcyBpcyBhIHNtYWxsIGNsZWYsIGZhbHNlIG90aGVyd2lzZSAqL1xuICAgIHByaXZhdGUgQ2xlZiBjbGVmOyAgICAgICAgICAgIC8qKiBUaGUgY2xlZiwgVHJlYmxlIG9yIEJhc3MgKi9cbiAgICBwcml2YXRlIGludCB3aWR0aDtcblxuICAgIC8qKiBDcmVhdGUgYSBuZXcgQ2xlZlN5bWJvbCwgd2l0aCB0aGUgZ2l2ZW4gY2xlZiwgc3RhcnR0aW1lLCBhbmQgc2l6ZSAqL1xuICAgIHB1YmxpYyBDbGVmU3ltYm9sKENsZWYgY2xlZiwgaW50IHN0YXJ0dGltZSwgYm9vbCBzbWFsbCkge1xuICAgICAgICB0aGlzLmNsZWYgPSBjbGVmO1xuICAgICAgICB0aGlzLnN0YXJ0dGltZSA9IHN0YXJ0dGltZTtcbiAgICAgICAgc21hbGxzaXplID0gc21hbGw7XG4gICAgICAgIExvYWRJbWFnZXMoKTtcbiAgICAgICAgd2lkdGggPSBNaW5XaWR0aDtcbiAgICB9XG5cbiAgICAvKiogTG9hZCB0aGUgVHJlYmxlL0Jhc3MgY2xlZiBpbWFnZXMgaW50byBtZW1vcnkuICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBMb2FkSW1hZ2VzKCkge1xuICAgICAgICBpZiAodHJlYmxlID09IG51bGwpXG4gICAgICAgICAgICB0cmVibGUgPSBuZXcgQml0bWFwKHR5cGVvZihDbGVmU3ltYm9sKSwgXCJSZXNvdXJjZXMuSW1hZ2VzLnRyZWJsZS5wbmdcIik7XG5cbiAgICAgICAgaWYgKGJhc3MgPT0gbnVsbClcbiAgICAgICAgICAgIGJhc3MgPSBuZXcgQml0bWFwKHR5cGVvZihDbGVmU3ltYm9sKSwgXCJSZXNvdXJjZXMuSW1hZ2VzLmJhc3MucG5nXCIpO1xuXG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgdGltZSAoaW4gcHVsc2VzKSB0aGlzIHN5bWJvbCBvY2N1cnMgYXQuXG4gICAgICogVGhpcyBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgbWVhc3VyZSB0aGlzIHN5bWJvbCBiZWxvbmdzIHRvLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgU3RhcnRUaW1lIHsgXG4gICAgICAgIGdldCB7IHJldHVybiBzdGFydHRpbWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBtaW5pbXVtIHdpZHRoIChpbiBwaXhlbHMpIG5lZWRlZCB0byBkcmF3IHRoaXMgc3ltYm9sICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBNaW5XaWR0aCB7XG4gICAgICAgIGdldCB7IFxuICAgICAgICAgICAgaWYgKHNtYWxsc2l6ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gU2hlZXRNdXNpYy5Ob3RlV2lkdGggKiAyO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiBTaGVldE11c2ljLk5vdGVXaWR0aCAqIDM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogR2V0L1NldCB0aGUgd2lkdGggKGluIHBpeGVscykgb2YgdGhpcyBzeW1ib2wuIFRoZSB3aWR0aCBpcyBzZXRcbiAgICAgKiBpbiBTaGVldE11c2ljLkFsaWduU3ltYm9scygpIHRvIHZlcnRpY2FsbHkgYWxpZ24gc3ltYm9scy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFdpZHRoIHtcbiAgICAgICBnZXQgeyByZXR1cm4gd2lkdGg7IH1cbiAgICAgICBzZXQgeyB3aWR0aCA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGFib3ZlIHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEFib3ZlU3RhZmYgeyBcbiAgICAgICAgZ2V0IHsgXG4gICAgICAgICAgICBpZiAoY2xlZiA9PSBDbGVmLlRyZWJsZSAmJiAhc21hbGxzaXplKVxuICAgICAgICAgICAgICAgIHJldHVybiBTaGVldE11c2ljLk5vdGVIZWlnaHQgKiAyO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGJlbG93IHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEJlbG93U3RhZmYge1xuICAgICAgICBnZXQge1xuICAgICAgICAgICAgaWYgKGNsZWYgPT0gQ2xlZi5UcmVibGUgJiYgIXNtYWxsc2l6ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMjtcbiAgICAgICAgICAgIGVsc2UgaWYgKGNsZWYgPT0gQ2xlZi5UcmVibGUgJiYgc21hbGxzaXplKVxuICAgICAgICAgICAgICAgIHJldHVybiBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgc3ltYm9sLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBcbiAgICB2b2lkIERyYXcoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3ApIHtcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oV2lkdGggLSBNaW5XaWR0aCwgMCk7XG4gICAgICAgIGludCB5ID0geXRvcDtcbiAgICAgICAgSW1hZ2UgaW1hZ2U7XG4gICAgICAgIGludCBoZWlnaHQ7XG5cbiAgICAgICAgLyogR2V0IHRoZSBpbWFnZSwgaGVpZ2h0LCBhbmQgdG9wIHkgcGl4ZWwsIGRlcGVuZGluZyBvbiB0aGUgY2xlZlxuICAgICAgICAgKiBhbmQgdGhlIGltYWdlIHNpemUuXG4gICAgICAgICAqL1xuICAgICAgICBpZiAoY2xlZiA9PSBDbGVmLlRyZWJsZSkge1xuICAgICAgICAgICAgaW1hZ2UgPSB0cmVibGU7XG4gICAgICAgICAgICBpZiAoc21hbGxzaXplKSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gU2hlZXRNdXNpYy5TdGFmZkhlaWdodCArIFNoZWV0TXVzaWMuU3RhZmZIZWlnaHQvNDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gMyAqIFNoZWV0TXVzaWMuU3RhZmZIZWlnaHQvMiArIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICAgICAgICAgIHkgPSB5dG9wIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaW1hZ2UgPSBiYXNzO1xuICAgICAgICAgICAgaWYgKHNtYWxsc2l6ZSkge1xuICAgICAgICAgICAgICAgIGhlaWdodCA9IFNoZWV0TXVzaWMuU3RhZmZIZWlnaHQgLSAzKlNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBTaGVldE11c2ljLlN0YWZmSGVpZ2h0IC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyogU2NhbGUgdGhlIGltYWdlIHdpZHRoIHRvIG1hdGNoIHRoZSBoZWlnaHQgKi9cbiAgICAgICAgaW50IGltZ3dpZHRoID0gaW1hZ2UuV2lkdGggKiBoZWlnaHQgLyBpbWFnZS5IZWlnaHQ7XG4gICAgICAgIGcuRHJhd0ltYWdlKGltYWdlLCAwLCB5LCBpbWd3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShXaWR0aCAtIE1pbldpZHRoKSwgMCk7XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJDbGVmU3ltYm9sIGNsZWY9ezB9IHNtYWxsPXsxfSB3aWR0aD17Mn1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlZiwgc21hbGxzaXplLCB3aWR0aCk7XG4gICAgfVxufVxuXG5cbn1cblxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEZpbGVTdHJlYW06U3RyZWFtXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIEZpbGVTdHJlYW0oc3RyaW5nIGZpbGVuYW1lLCBGaWxlTW9kZSBtb2RlKVxyXG4gICAgICAgIHtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwOS0yMDEyIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG5cbi8qKiBAY2xhc3MgUGlhbm9cbiAqXG4gKiBUaGUgUGlhbm8gQ29udHJvbCBpcyB0aGUgcGFuZWwgYXQgdGhlIHRvcCB0aGF0IGRpc3BsYXlzIHRoZVxuICogcGlhbm8sIGFuZCBoaWdobGlnaHRzIHRoZSBwaWFubyBub3RlcyBkdXJpbmcgcGxheWJhY2suXG4gKiBUaGUgbWFpbiBtZXRob2RzIGFyZTpcbiAqXG4gKiBTZXRNaWRpRmlsZSgpIC0gU2V0IHRoZSBNaWRpIGZpbGUgdG8gdXNlIGZvciBzaGFkaW5nLiAgVGhlIE1pZGkgZmlsZVxuICogICAgICAgICAgICAgICAgIGlzIG5lZWRlZCB0byBkZXRlcm1pbmUgd2hpY2ggbm90ZXMgdG8gc2hhZGUuXG4gKlxuICogU2hhZGVOb3RlcygpIC0gU2hhZGUgbm90ZXMgb24gdGhlIHBpYW5vIHRoYXQgb2NjdXIgYXQgYSBnaXZlbiBwdWxzZSB0aW1lLlxuICpcbiAqL1xucHVibGljIGNsYXNzIFBpYW5vIDogQ29udHJvbCB7XG4gICAgcHVibGljIGNvbnN0IGludCBLZXlzUGVyT2N0YXZlID0gNztcbiAgICBwdWJsaWMgY29uc3QgaW50IE1heE9jdGF2ZSA9IDc7XG5cbiAgICBwcml2YXRlIHN0YXRpYyBpbnQgV2hpdGVLZXlXaWR0aDsgIC8qKiBXaWR0aCBvZiBhIHNpbmdsZSB3aGl0ZSBrZXkgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBpbnQgV2hpdGVLZXlIZWlnaHQ7IC8qKiBIZWlnaHQgb2YgYSBzaW5nbGUgd2hpdGUga2V5ICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50IEJsYWNrS2V5V2lkdGg7ICAvKiogV2lkdGggb2YgYSBzaW5nbGUgYmxhY2sga2V5ICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50IEJsYWNrS2V5SGVpZ2h0OyAvKiogSGVpZ2h0IG9mIGEgc2luZ2xlIGJsYWNrIGtleSAqL1xuICAgIHByaXZhdGUgc3RhdGljIGludCBtYXJnaW47ICAgICAgICAgLyoqIFRoZSB0b3AvbGVmdCBtYXJnaW4gdG8gdGhlIHBpYW5vICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50IEJsYWNrQm9yZGVyOyAgICAvKiogVGhlIHdpZHRoIG9mIHRoZSBibGFjayBib3JkZXIgYXJvdW5kIHRoZSBrZXlzICovXG5cbiAgICBwcml2YXRlIHN0YXRpYyBpbnRbXSBibGFja0tleU9mZnNldHM7ICAgLyoqIFRoZSB4IHBpeGxlcyBvZiB0aGUgYmxhY2sga2V5cyAqL1xuXG4gICAgLyogVGhlIGdyYXkxUGVucyBmb3IgZHJhd2luZyBibGFjay9ncmF5IGxpbmVzICovXG4gICAgcHJpdmF0ZSBQZW4gZ3JheTFQZW4sIGdyYXkyUGVuLCBncmF5M1BlbjtcblxuICAgIC8qIFRoZSBicnVzaGVzIGZvciBmaWxsaW5nIHRoZSBrZXlzICovXG4gICAgcHJpdmF0ZSBCcnVzaCBncmF5MUJydXNoLCBncmF5MkJydXNoLCBzaGFkZUJydXNoLCBzaGFkZTJCcnVzaDtcblxuICAgIHByaXZhdGUgYm9vbCB1c2VUd29Db2xvcnM7ICAgICAgICAgICAgICAvKiogSWYgdHJ1ZSwgdXNlIHR3byBjb2xvcnMgZm9yIGhpZ2hsaWdodGluZyAqL1xuICAgIHByaXZhdGUgTGlzdDxNaWRpTm90ZT4gbm90ZXM7ICAgICAgICAgICAvKiogVGhlIE1pZGkgbm90ZXMgZm9yIHNoYWRpbmcgKi9cbiAgICBwcml2YXRlIGludCBtYXhTaGFkZUR1cmF0aW9uOyAgICAgICAgICAgLyoqIFRoZSBtYXhpbXVtIGR1cmF0aW9uIHdlJ2xsIHNoYWRlIGEgbm90ZSBmb3IgKi9cbiAgICBwcml2YXRlIGludCBzaG93Tm90ZUxldHRlcnM7ICAgICAgICAgICAgLyoqIERpc3BsYXkgdGhlIGxldHRlciBmb3IgZWFjaCBwaWFubyBub3RlICovXG4gICAgcHJpdmF0ZSBHcmFwaGljcyBncmFwaGljczsgICAgICAgICAgICAgIC8qKiBUaGUgZ3JhcGhpY3MgZm9yIHNoYWRpbmcgdGhlIG5vdGVzICovXG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IFBpYW5vLiAqL1xuICAgIHB1YmxpYyBQaWFubygpIHtcclxuICAgICAgICBpbnQgc2NyZWVud2lkdGggPSAxMDI0OyAvL1N5c3RlbS5XaW5kb3dzLkZvcm1zLlNjcmVlbi5QcmltYXJ5U2NyZWVuLkJvdW5kcy5XaWR0aDtcbiAgICAgICAgaWYgKHNjcmVlbndpZHRoID49IDMyMDApIHtcbiAgICAgICAgICAgIC8qIExpbnV4L01vbm8gaXMgcmVwb3J0aW5nIHdpZHRoIG9mIDQgc2NyZWVucyAqL1xuICAgICAgICAgICAgc2NyZWVud2lkdGggPSBzY3JlZW53aWR0aCAvIDQ7XG4gICAgICAgIH1cbiAgICAgICAgc2NyZWVud2lkdGggPSBzY3JlZW53aWR0aCAqIDk1LzEwMDtcbiAgICAgICAgV2hpdGVLZXlXaWR0aCA9IChpbnQpKHNjcmVlbndpZHRoIC8gKDIuMCArIEtleXNQZXJPY3RhdmUgKiBNYXhPY3RhdmUpKTtcbiAgICAgICAgaWYgKFdoaXRlS2V5V2lkdGggJSAyICE9IDApIHtcbiAgICAgICAgICAgIFdoaXRlS2V5V2lkdGgtLTtcbiAgICAgICAgfVxuICAgICAgICBtYXJnaW4gPSAwO1xuICAgICAgICBCbGFja0JvcmRlciA9IFdoaXRlS2V5V2lkdGgvMjtcbiAgICAgICAgV2hpdGVLZXlIZWlnaHQgPSBXaGl0ZUtleVdpZHRoICogNTtcbiAgICAgICAgQmxhY2tLZXlXaWR0aCA9IFdoaXRlS2V5V2lkdGggLyAyO1xuICAgICAgICBCbGFja0tleUhlaWdodCA9IFdoaXRlS2V5SGVpZ2h0ICogNSAvIDk7IFxuXG4gICAgICAgIFdpZHRoID0gbWFyZ2luKjIgKyBCbGFja0JvcmRlcioyICsgV2hpdGVLZXlXaWR0aCAqIEtleXNQZXJPY3RhdmUgKiBNYXhPY3RhdmU7XG4gICAgICAgIEhlaWdodCA9IG1hcmdpbioyICsgQmxhY2tCb3JkZXIqMyArIFdoaXRlS2V5SGVpZ2h0O1xuICAgICAgICBpZiAoYmxhY2tLZXlPZmZzZXRzID09IG51bGwpIHtcbiAgICAgICAgICAgIGJsYWNrS2V5T2Zmc2V0cyA9IG5ldyBpbnRbXSB7IFxuICAgICAgICAgICAgICAgIFdoaXRlS2V5V2lkdGggLSBCbGFja0tleVdpZHRoLzIgLSAxLFxuICAgICAgICAgICAgICAgIFdoaXRlS2V5V2lkdGggKyBCbGFja0tleVdpZHRoLzIgLSAxLFxuICAgICAgICAgICAgICAgIDIqV2hpdGVLZXlXaWR0aCAtIEJsYWNrS2V5V2lkdGgvMixcbiAgICAgICAgICAgICAgICAyKldoaXRlS2V5V2lkdGggKyBCbGFja0tleVdpZHRoLzIsXG4gICAgICAgICAgICAgICAgNCpXaGl0ZUtleVdpZHRoIC0gQmxhY2tLZXlXaWR0aC8yIC0gMSxcbiAgICAgICAgICAgICAgICA0KldoaXRlS2V5V2lkdGggKyBCbGFja0tleVdpZHRoLzIgLSAxLFxuICAgICAgICAgICAgICAgIDUqV2hpdGVLZXlXaWR0aCAtIEJsYWNrS2V5V2lkdGgvMixcbiAgICAgICAgICAgICAgICA1KldoaXRlS2V5V2lkdGggKyBCbGFja0tleVdpZHRoLzIsXG4gICAgICAgICAgICAgICAgNipXaGl0ZUtleVdpZHRoIC0gQmxhY2tLZXlXaWR0aC8yLFxuICAgICAgICAgICAgICAgIDYqV2hpdGVLZXlXaWR0aCArIEJsYWNrS2V5V2lkdGgvMlxuICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIENvbG9yIGdyYXkxID0gQ29sb3IuRnJvbUFyZ2IoMTYsIDE2LCAxNik7XG4gICAgICAgIENvbG9yIGdyYXkyID0gQ29sb3IuRnJvbUFyZ2IoOTAsIDkwLCA5MCk7XG4gICAgICAgIENvbG9yIGdyYXkzID0gQ29sb3IuRnJvbUFyZ2IoMjAwLCAyMDAsIDIwMCk7XG4gICAgICAgIENvbG9yIHNoYWRlMSA9IENvbG9yLkZyb21BcmdiKDIxMCwgMjA1LCAyMjApO1xuICAgICAgICBDb2xvciBzaGFkZTIgPSBDb2xvci5Gcm9tQXJnYigxNTAsIDIwMCwgMjIwKTtcblxuICAgICAgICBncmF5MVBlbiA9IG5ldyBQZW4oZ3JheTEsIDEpO1xuICAgICAgICBncmF5MlBlbiA9IG5ldyBQZW4oZ3JheTIsIDEpO1xuICAgICAgICBncmF5M1BlbiA9IG5ldyBQZW4oZ3JheTMsIDEpO1xuXG4gICAgICAgIGdyYXkxQnJ1c2ggPSBuZXcgU29saWRCcnVzaChncmF5MSk7XG4gICAgICAgIGdyYXkyQnJ1c2ggPSBuZXcgU29saWRCcnVzaChncmF5Mik7XG4gICAgICAgIHNoYWRlQnJ1c2ggPSBuZXcgU29saWRCcnVzaChzaGFkZTEpO1xuICAgICAgICBzaGFkZTJCcnVzaCA9IG5ldyBTb2xpZEJydXNoKHNoYWRlMik7XG4gICAgICAgIHNob3dOb3RlTGV0dGVycyA9IE1pZGlPcHRpb25zLk5vdGVOYW1lTm9uZTtcbiAgICAgICAgQmFja0NvbG9yID0gQ29sb3IuTGlnaHRHcmF5O1xuICAgIH1cblxuICAgIC8qKiBTZXQgdGhlIE1pZGlGaWxlIHRvIHVzZS5cbiAgICAgKiAgU2F2ZSB0aGUgbGlzdCBvZiBtaWRpIG5vdGVzLiBFYWNoIG1pZGkgbm90ZSBpbmNsdWRlcyB0aGUgbm90ZSBOdW1iZXIgXG4gICAgICogIGFuZCBTdGFydFRpbWUgKGluIHB1bHNlcyksIHNvIHdlIGtub3cgd2hpY2ggbm90ZXMgdG8gc2hhZGUgZ2l2ZW4gdGhlXG4gICAgICogIGN1cnJlbnQgcHVsc2UgdGltZS5cbiAgICAgKi8gXG4gICAgcHVibGljIHZvaWQgU2V0TWlkaUZpbGUoTWlkaUZpbGUgbWlkaWZpbGUsIE1pZGlPcHRpb25zIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKG1pZGlmaWxlID09IG51bGwpIHtcbiAgICAgICAgICAgIG5vdGVzID0gbnVsbDtcbiAgICAgICAgICAgIHVzZVR3b0NvbG9ycyA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgTGlzdDxNaWRpVHJhY2s+IHRyYWNrcyA9IG1pZGlmaWxlLkNoYW5nZU1pZGlOb3RlcyhvcHRpb25zKTtcbiAgICAgICAgTWlkaVRyYWNrIHRyYWNrID0gTWlkaUZpbGUuQ29tYmluZVRvU2luZ2xlVHJhY2sodHJhY2tzKTtcbiAgICAgICAgbm90ZXMgPSB0cmFjay5Ob3RlcztcblxuICAgICAgICBtYXhTaGFkZUR1cmF0aW9uID0gbWlkaWZpbGUuVGltZS5RdWFydGVyICogMjtcblxuICAgICAgICAvKiBXZSB3YW50IHRvIGtub3cgd2hpY2ggdHJhY2sgdGhlIG5vdGUgY2FtZSBmcm9tLlxuICAgICAgICAgKiBVc2UgdGhlICdjaGFubmVsJyBmaWVsZCB0byBzdG9yZSB0aGUgdHJhY2suXG4gICAgICAgICAqL1xuICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgdHJhY2tzLkNvdW50OyB0cmFja251bSsrKSB7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrc1t0cmFja251bV0uTm90ZXMpIHtcbiAgICAgICAgICAgICAgICBub3RlLkNoYW5uZWwgPSB0cmFja251bTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFdoZW4gd2UgaGF2ZSBleGFjdGx5IHR3byB0cmFja3MsIHdlIGFzc3VtZSB0aGlzIGlzIGEgcGlhbm8gc29uZyxcbiAgICAgICAgICogYW5kIHdlIHVzZSBkaWZmZXJlbnQgY29sb3JzIGZvciBoaWdobGlnaHRpbmcgdGhlIGxlZnQgaGFuZCBhbmRcbiAgICAgICAgICogcmlnaHQgaGFuZCBub3Rlcy5cbiAgICAgICAgICovXG4gICAgICAgIHVzZVR3b0NvbG9ycyA9IGZhbHNlO1xuICAgICAgICBpZiAodHJhY2tzLkNvdW50ID09IDIpIHtcbiAgICAgICAgICAgIHVzZVR3b0NvbG9ycyA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBzaG93Tm90ZUxldHRlcnMgPSBvcHRpb25zLnNob3dOb3RlTGV0dGVycztcbiAgICAgICAgdGhpcy5JbnZhbGlkYXRlKCk7XG4gICAgfVxuXG4gICAgLyoqIFNldCB0aGUgY29sb3JzIHRvIHVzZSBmb3Igc2hhZGluZyAqL1xuICAgIHB1YmxpYyB2b2lkIFNldFNoYWRlQ29sb3JzKENvbG9yIGMxLCBDb2xvciBjMikge1xuICAgICAgICBzaGFkZUJydXNoLkRpc3Bvc2UoKTtcbiAgICAgICAgc2hhZGUyQnJ1c2guRGlzcG9zZSgpO1xuICAgICAgICBzaGFkZUJydXNoID0gbmV3IFNvbGlkQnJ1c2goYzEpO1xuICAgICAgICBzaGFkZTJCcnVzaCA9IG5ldyBTb2xpZEJydXNoKGMyKTtcbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgb3V0bGluZSBvZiBhIDEyLW5vdGUgKDcgd2hpdGUgbm90ZSkgcGlhbm8gb2N0YXZlICovXG4gICAgcHJpdmF0ZSB2b2lkIERyYXdPY3RhdmVPdXRsaW5lKEdyYXBoaWNzIGcpIHtcbiAgICAgICAgaW50IHJpZ2h0ID0gV2hpdGVLZXlXaWR0aCAqIEtleXNQZXJPY3RhdmU7XG5cbiAgICAgICAgLy8gRHJhdyB0aGUgYm91bmRpbmcgcmVjdGFuZ2xlLCBmcm9tIEMgdG8gQlxuICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCAwLCAwLCAwLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTFQZW4sIHJpZ2h0LCAwLCByaWdodCwgV2hpdGVLZXlIZWlnaHQpO1xuICAgICAgICAvLyBnLkRyYXdMaW5lKGdyYXkxUGVuLCAwLCAwLCByaWdodCwgMCk7XG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTFQZW4sIDAsIFdoaXRlS2V5SGVpZ2h0LCByaWdodCwgV2hpdGVLZXlIZWlnaHQpO1xuICAgICAgICBnLkRyYXdMaW5lKGdyYXkzUGVuLCByaWdodC0xLCAwLCByaWdodC0xLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIDEsIDAsIDEsIFdoaXRlS2V5SGVpZ2h0KTtcblxuICAgICAgICAvLyBEcmF3IHRoZSBsaW5lIGJldHdlZW4gRSBhbmQgRlxuICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCAzKldoaXRlS2V5V2lkdGgsIDAsIDMqV2hpdGVLZXlXaWR0aCwgV2hpdGVLZXlIZWlnaHQpO1xuICAgICAgICBnLkRyYXdMaW5lKGdyYXkzUGVuLCAzKldoaXRlS2V5V2lkdGggLSAxLCAwLCAzKldoaXRlS2V5V2lkdGggLSAxLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIDMqV2hpdGVLZXlXaWR0aCArIDEsIDAsIDMqV2hpdGVLZXlXaWR0aCArIDEsIFdoaXRlS2V5SGVpZ2h0KTtcblxuICAgICAgICAvLyBEcmF3IHRoZSBzaWRlcy9ib3R0b20gb2YgdGhlIGJsYWNrIGtleXNcbiAgICAgICAgZm9yIChpbnQgaSA9MDsgaSA8IDEwOyBpICs9IDIpIHtcbiAgICAgICAgICAgIGludCB4MSA9IGJsYWNrS2V5T2Zmc2V0c1tpXTtcbiAgICAgICAgICAgIGludCB4MiA9IGJsYWNrS2V5T2Zmc2V0c1tpKzFdO1xuXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCB4MSwgMCwgeDEsIEJsYWNrS2V5SGVpZ2h0KTsgXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCB4MiwgMCwgeDIsIEJsYWNrS2V5SGVpZ2h0KTsgXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCB4MSwgQmxhY2tLZXlIZWlnaHQsIHgyLCBCbGFja0tleUhlaWdodCk7XG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkyUGVuLCB4MS0xLCAwLCB4MS0xLCBCbGFja0tleUhlaWdodCsxKTsgXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkyUGVuLCB4MisxLCAwLCB4MisxLCBCbGFja0tleUhlaWdodCsxKTsgXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkyUGVuLCB4MS0xLCBCbGFja0tleUhlaWdodCsxLCB4MisxLCBCbGFja0tleUhlaWdodCsxKTtcbiAgICAgICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIHgxLTIsIDAsIHgxLTIsIEJsYWNrS2V5SGVpZ2h0KzIpOyBcbiAgICAgICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIHgyKzIsIDAsIHgyKzIsIEJsYWNrS2V5SGVpZ2h0KzIpOyBcbiAgICAgICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIHgxLTIsIEJsYWNrS2V5SGVpZ2h0KzIsIHgyKzIsIEJsYWNrS2V5SGVpZ2h0KzIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRHJhdyB0aGUgYm90dG9tLWhhbGYgb2YgdGhlIHdoaXRlIGtleXNcbiAgICAgICAgZm9yIChpbnQgaSA9IDE7IGkgPCBLZXlzUGVyT2N0YXZlOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpID09IDMpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTsgIC8vIHdlIGRyYXcgdGhlIGxpbmUgYmV0d2VlbiBFIGFuZCBGIGFib3ZlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCBpKldoaXRlS2V5V2lkdGgsIEJsYWNrS2V5SGVpZ2h0LCBpKldoaXRlS2V5V2lkdGgsIFdoaXRlS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgIFBlbiBwZW4xID0gZ3JheTJQZW47XG4gICAgICAgICAgICBQZW4gcGVuMiA9IGdyYXkzUGVuO1xuICAgICAgICAgICAgZy5EcmF3TGluZShwZW4xLCBpKldoaXRlS2V5V2lkdGggLSAxLCBCbGFja0tleUhlaWdodCsxLCBpKldoaXRlS2V5V2lkdGggLSAxLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgICAgICBnLkRyYXdMaW5lKHBlbjIsIGkqV2hpdGVLZXlXaWR0aCArIDEsIEJsYWNrS2V5SGVpZ2h0KzEsIGkqV2hpdGVLZXlXaWR0aCArIDEsIFdoaXRlS2V5SGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqIERyYXcgYW4gb3V0bGluZSBvZiB0aGUgcGlhbm8gZm9yIDcgb2N0YXZlcyAqL1xuICAgIHByaXZhdGUgdm9pZCBEcmF3T3V0bGluZShHcmFwaGljcyBnKSB7XG4gICAgICAgIGZvciAoaW50IG9jdGF2ZSA9IDA7IG9jdGF2ZSA8IE1heE9jdGF2ZTsgb2N0YXZlKyspIHtcbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKG9jdGF2ZSAqIFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlLCAwKTtcbiAgICAgICAgICAgIERyYXdPY3RhdmVPdXRsaW5lKGcpO1xuICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShvY3RhdmUgKiBXaGl0ZUtleVdpZHRoICogS2V5c1Blck9jdGF2ZSksIDApO1xuICAgICAgICB9XG4gICAgfVxuIFxuICAgIC8qIERyYXcgdGhlIEJsYWNrIGtleXMgKi9cbiAgICBwcml2YXRlIHZvaWQgRHJhd0JsYWNrS2V5cyhHcmFwaGljcyBnKSB7XG4gICAgICAgIGZvciAoaW50IG9jdGF2ZSA9IDA7IG9jdGF2ZSA8IE1heE9jdGF2ZTsgb2N0YXZlKyspIHtcbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKG9jdGF2ZSAqIFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlLCAwKTtcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgMTA7IGkgKz0gMikge1xuICAgICAgICAgICAgICAgIGludCB4MSA9IGJsYWNrS2V5T2Zmc2V0c1tpXTtcbiAgICAgICAgICAgICAgICBpbnQgeDIgPSBibGFja0tleU9mZnNldHNbaSsxXTtcbiAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTFCcnVzaCwgeDEsIDAsIEJsYWNrS2V5V2lkdGgsIEJsYWNrS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTJCcnVzaCwgeDErMSwgQmxhY2tLZXlIZWlnaHQgLSBCbGFja0tleUhlaWdodC84LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmxhY2tLZXlXaWR0aC0yLCBCbGFja0tleUhlaWdodC84KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0ob2N0YXZlICogV2hpdGVLZXlXaWR0aCAqIEtleXNQZXJPY3RhdmUpLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qIERyYXcgdGhlIGJsYWNrIGJvcmRlciBhcmVhIHN1cnJvdW5kaW5nIHRoZSBwaWFubyBrZXlzLlxuICAgICAqIEFsc28sIGRyYXcgZ3JheSBvdXRsaW5lcyBhdCB0aGUgYm90dG9tIG9mIHRoZSB3aGl0ZSBrZXlzLlxuICAgICAqL1xuICAgIHByaXZhdGUgdm9pZCBEcmF3QmxhY2tCb3JkZXIoR3JhcGhpY3MgZykge1xuICAgICAgICBpbnQgUGlhbm9XaWR0aCA9IFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlICogTWF4T2N0YXZlO1xuICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTFCcnVzaCwgbWFyZ2luLCBtYXJnaW4sIFBpYW5vV2lkdGggKyBCbGFja0JvcmRlcioyLCBCbGFja0JvcmRlci0yKTtcbiAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkxQnJ1c2gsIG1hcmdpbiwgbWFyZ2luLCBCbGFja0JvcmRlciwgV2hpdGVLZXlIZWlnaHQgKyBCbGFja0JvcmRlciAqIDMpO1xuICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTFCcnVzaCwgbWFyZ2luLCBtYXJnaW4gKyBCbGFja0JvcmRlciArIFdoaXRlS2V5SGVpZ2h0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrQm9yZGVyKjIgKyBQaWFub1dpZHRoLCBCbGFja0JvcmRlcioyKTtcbiAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkxQnJ1c2gsIG1hcmdpbiArIEJsYWNrQm9yZGVyICsgUGlhbm9XaWR0aCwgbWFyZ2luLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrQm9yZGVyLCBXaGl0ZUtleUhlaWdodCArIEJsYWNrQm9yZGVyKjMpO1xuXG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTJQZW4sIG1hcmdpbiArIEJsYWNrQm9yZGVyLCBtYXJnaW4gKyBCbGFja0JvcmRlciAtMSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbiArIEJsYWNrQm9yZGVyICsgUGlhbm9XaWR0aCwgbWFyZ2luICsgQmxhY2tCb3JkZXIgLTEpO1xuICAgICAgICBcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0obWFyZ2luICsgQmxhY2tCb3JkZXIsIG1hcmdpbiArIEJsYWNrQm9yZGVyKTsgXG5cbiAgICAgICAgLy8gRHJhdyB0aGUgZ3JheSBib3R0b21zIG9mIHRoZSB3aGl0ZSBrZXlzICBcbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBLZXlzUGVyT2N0YXZlICogTWF4T2N0YXZlOyBpKyspIHtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShncmF5MkJydXNoLCBpKldoaXRlS2V5V2lkdGgrMSwgV2hpdGVLZXlIZWlnaHQrMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgV2hpdGVLZXlXaWR0aC0yLCBCbGFja0JvcmRlci8yKTtcbiAgICAgICAgfVxuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKG1hcmdpbiArIEJsYWNrQm9yZGVyKSwgLShtYXJnaW4gKyBCbGFja0JvcmRlcikpOyBcbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgbm90ZSBsZXR0ZXJzIHVuZGVybmVhdGggZWFjaCB3aGl0ZSBub3RlICovXG4gICAgcHJpdmF0ZSB2b2lkIERyYXdOb3RlTGV0dGVycyhHcmFwaGljcyBnKSB7XG4gICAgICAgIHN0cmluZ1tdIGxldHRlcnMgPSB7IFwiQ1wiLCBcIkRcIiwgXCJFXCIsIFwiRlwiLCBcIkdcIiwgXCJBXCIsIFwiQlwiIH07XG4gICAgICAgIHN0cmluZ1tdIG51bWJlcnMgPSB7IFwiMVwiLCBcIjNcIiwgXCI1XCIsIFwiNlwiLCBcIjhcIiwgXCIxMFwiLCBcIjEyXCIgfTtcbiAgICAgICAgc3RyaW5nW10gbmFtZXM7XG4gICAgICAgIGlmIChzaG93Tm90ZUxldHRlcnMgPT0gTWlkaU9wdGlvbnMuTm90ZU5hbWVMZXR0ZXIpIHtcbiAgICAgICAgICAgIG5hbWVzID0gbGV0dGVycztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzaG93Tm90ZUxldHRlcnMgPT0gTWlkaU9wdGlvbnMuTm90ZU5hbWVGaXhlZE51bWJlcikge1xuICAgICAgICAgICAgbmFtZXMgPSBudW1iZXJzO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKG1hcmdpbiArIEJsYWNrQm9yZGVyLCBtYXJnaW4gKyBCbGFja0JvcmRlcik7IFxuICAgICAgICBmb3IgKGludCBvY3RhdmUgPSAwOyBvY3RhdmUgPCBNYXhPY3RhdmU7IG9jdGF2ZSsrKSB7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IEtleXNQZXJPY3RhdmU7IGkrKykge1xuICAgICAgICAgICAgICAgIGcuRHJhd1N0cmluZyhuYW1lc1tpXSwgU2hlZXRNdXNpYy5MZXR0ZXJGb250LCBCcnVzaGVzLldoaXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAob2N0YXZlKktleXNQZXJPY3RhdmUgKyBpKSAqIFdoaXRlS2V5V2lkdGggKyBXaGl0ZUtleVdpZHRoLzMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFdoaXRlS2V5SGVpZ2h0ICsgQmxhY2tCb3JkZXIgKiAzLzQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0obWFyZ2luICsgQmxhY2tCb3JkZXIpLCAtKG1hcmdpbiArIEJsYWNrQm9yZGVyKSk7IFxuICAgIH1cblxuICAgIC8qKiBEcmF3IHRoZSBQaWFuby4gKi9cbiAgICBwcm90ZWN0ZWQgLypvdmVycmlkZSovIHZvaWQgT25QYWludChQYWludEV2ZW50QXJncyBlKSB7XG4gICAgICAgIEdyYXBoaWNzIGcgPSBlLkdyYXBoaWNzKCk7XG4gICAgICAgIGcuU21vb3RoaW5nTW9kZSA9IFNtb290aGluZ01vZGUuTm9uZTtcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0obWFyZ2luICsgQmxhY2tCb3JkZXIsIG1hcmdpbiArIEJsYWNrQm9yZGVyKTsgXG4gICAgICAgIGcuRmlsbFJlY3RhbmdsZShCcnVzaGVzLldoaXRlLCAwLCAwLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlICogTWF4T2N0YXZlLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgIERyYXdCbGFja0tleXMoZyk7XG4gICAgICAgIERyYXdPdXRsaW5lKGcpO1xuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKG1hcmdpbiArIEJsYWNrQm9yZGVyKSwgLShtYXJnaW4gKyBCbGFja0JvcmRlcikpO1xuICAgICAgICBEcmF3QmxhY2tCb3JkZXIoZyk7XG4gICAgICAgIGlmIChzaG93Tm90ZUxldHRlcnMgIT0gTWlkaU9wdGlvbnMuTm90ZU5hbWVOb25lKSB7XG4gICAgICAgICAgICBEcmF3Tm90ZUxldHRlcnMoZyk7XG4gICAgICAgIH1cbiAgICAgICAgZy5TbW9vdGhpbmdNb2RlID0gU21vb3RoaW5nTW9kZS5BbnRpQWxpYXM7XG4gICAgfVxuXG4gICAgLyogU2hhZGUgdGhlIGdpdmVuIG5vdGUgd2l0aCB0aGUgZ2l2ZW4gYnJ1c2guXG4gICAgICogV2Ugb25seSBkcmF3IG5vdGVzIGZyb20gbm90ZW51bWJlciAyNCB0byA5Ni5cbiAgICAgKiAoTWlkZGxlLUMgaXMgNjApLlxuICAgICAqL1xuICAgIHByaXZhdGUgdm9pZCBTaGFkZU9uZU5vdGUoR3JhcGhpY3MgZywgaW50IG5vdGVudW1iZXIsIEJydXNoIGJydXNoKSB7XG4gICAgICAgIGludCBvY3RhdmUgPSBub3RlbnVtYmVyIC8gMTI7XG4gICAgICAgIGludCBub3Rlc2NhbGUgPSBub3RlbnVtYmVyICUgMTI7XG5cbiAgICAgICAgb2N0YXZlIC09IDI7XG4gICAgICAgIGlmIChvY3RhdmUgPCAwIHx8IG9jdGF2ZSA+PSBNYXhPY3RhdmUpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0ob2N0YXZlICogV2hpdGVLZXlXaWR0aCAqIEtleXNQZXJPY3RhdmUsIDApO1xuICAgICAgICBpbnQgeDEsIHgyLCB4MztcblxuICAgICAgICBpbnQgYm90dG9tSGFsZkhlaWdodCA9IFdoaXRlS2V5SGVpZ2h0IC0gKEJsYWNrS2V5SGVpZ2h0KzMpO1xuXG4gICAgICAgIC8qIG5vdGVzY2FsZSBnb2VzIGZyb20gMCB0byAxMSwgZnJvbSBDIHRvIEIuICovXG4gICAgICAgIHN3aXRjaCAobm90ZXNjYWxlKSB7XG4gICAgICAgIGNhc2UgMDogLyogQyAqL1xuICAgICAgICAgICAgeDEgPSAyO1xuICAgICAgICAgICAgeDIgPSBibGFja0tleU9mZnNldHNbMF0gLSAyO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgMCwgeDIgLSB4MSwgQmxhY2tLZXlIZWlnaHQrMyk7XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgxLCBCbGFja0tleUhlaWdodCszLCBXaGl0ZUtleVdpZHRoLTMsIGJvdHRvbUhhbGZIZWlnaHQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTogLyogQyMgKi9cbiAgICAgICAgICAgIHgxID0gYmxhY2tLZXlPZmZzZXRzWzBdOyBcbiAgICAgICAgICAgIHgyID0gYmxhY2tLZXlPZmZzZXRzWzFdO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgMCwgeDIgLSB4MSwgQmxhY2tLZXlIZWlnaHQpO1xuICAgICAgICAgICAgaWYgKGJydXNoID09IGdyYXkxQnJ1c2gpIHtcbiAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTJCcnVzaCwgeDErMSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrS2V5SGVpZ2h0IC0gQmxhY2tLZXlIZWlnaHQvOCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrS2V5V2lkdGgtMiwgQmxhY2tLZXlIZWlnaHQvOCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOiAvKiBEICovXG4gICAgICAgICAgICB4MSA9IFdoaXRlS2V5V2lkdGggKyAyO1xuICAgICAgICAgICAgeDIgPSBibGFja0tleU9mZnNldHNbMV0gKyAzO1xuICAgICAgICAgICAgeDMgPSBibGFja0tleU9mZnNldHNbMl0gLSAyOyBcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDIsIDAsIHgzIC0geDIsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6IC8qIEQjICovXG4gICAgICAgICAgICB4MSA9IGJsYWNrS2V5T2Zmc2V0c1syXTsgXG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1szXTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIDAsIEJsYWNrS2V5V2lkdGgsIEJsYWNrS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgIGlmIChicnVzaCA9PSBncmF5MUJydXNoKSB7XG4gICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkyQnJ1c2gsIHgxKzEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleUhlaWdodCAtIEJsYWNrS2V5SGVpZ2h0LzgsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleVdpZHRoLTIsIEJsYWNrS2V5SGVpZ2h0LzgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDogLyogRSAqL1xuICAgICAgICAgICAgeDEgPSBXaGl0ZUtleVdpZHRoICogMiArIDI7XG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1szXSArIDM7IFxuICAgICAgICAgICAgeDMgPSBXaGl0ZUtleVdpZHRoICogMyAtIDE7XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgyLCAwLCB4MyAtIHgyLCBCbGFja0tleUhlaWdodCszKTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIEJsYWNrS2V5SGVpZ2h0KzMsIFdoaXRlS2V5V2lkdGgtMywgYm90dG9tSGFsZkhlaWdodCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1OiAvKiBGICovXG4gICAgICAgICAgICB4MSA9IFdoaXRlS2V5V2lkdGggKiAzICsgMjtcbiAgICAgICAgICAgIHgyID0gYmxhY2tLZXlPZmZzZXRzWzRdIC0gMjsgXG4gICAgICAgICAgICB4MyA9IFdoaXRlS2V5V2lkdGggKiA0IC0gMjtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIDAsIHgyIC0geDEsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY6IC8qIEYjICovXG4gICAgICAgICAgICB4MSA9IGJsYWNrS2V5T2Zmc2V0c1s0XTsgXG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1s1XTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIDAsIEJsYWNrS2V5V2lkdGgsIEJsYWNrS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgIGlmIChicnVzaCA9PSBncmF5MUJydXNoKSB7XG4gICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkyQnJ1c2gsIHgxKzEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleUhlaWdodCAtIEJsYWNrS2V5SGVpZ2h0LzgsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleVdpZHRoLTIsIEJsYWNrS2V5SGVpZ2h0LzgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNzogLyogRyAqL1xuICAgICAgICAgICAgeDEgPSBXaGl0ZUtleVdpZHRoICogNCArIDI7XG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1s1XSArIDM7IFxuICAgICAgICAgICAgeDMgPSBibGFja0tleU9mZnNldHNbNl0gLSAyOyBcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDIsIDAsIHgzIC0geDIsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDg6IC8qIEcjICovXG4gICAgICAgICAgICB4MSA9IGJsYWNrS2V5T2Zmc2V0c1s2XTsgXG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1s3XTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIDAsIEJsYWNrS2V5V2lkdGgsIEJsYWNrS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgIGlmIChicnVzaCA9PSBncmF5MUJydXNoKSB7XG4gICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkyQnJ1c2gsIHgxKzEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleUhlaWdodCAtIEJsYWNrS2V5SGVpZ2h0LzgsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleVdpZHRoLTIsIEJsYWNrS2V5SGVpZ2h0LzgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgOTogLyogQSAqL1xuICAgICAgICAgICAgeDEgPSBXaGl0ZUtleVdpZHRoICogNSArIDI7XG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1s3XSArIDM7IFxuICAgICAgICAgICAgeDMgPSBibGFja0tleU9mZnNldHNbOF0gLSAyOyBcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDIsIDAsIHgzIC0geDIsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEwOiAvKiBBIyAqL1xuICAgICAgICAgICAgeDEgPSBibGFja0tleU9mZnNldHNbOF07IFxuICAgICAgICAgICAgeDIgPSBibGFja0tleU9mZnNldHNbOV07XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgxLCAwLCBCbGFja0tleVdpZHRoLCBCbGFja0tleUhlaWdodCk7XG4gICAgICAgICAgICBpZiAoYnJ1c2ggPT0gZ3JheTFCcnVzaCkge1xuICAgICAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShncmF5MkJydXNoLCB4MSsxLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmxhY2tLZXlIZWlnaHQgLSBCbGFja0tleUhlaWdodC84LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmxhY2tLZXlXaWR0aC0yLCBCbGFja0tleUhlaWdodC84KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDExOiAvKiBCICovXG4gICAgICAgICAgICB4MSA9IFdoaXRlS2V5V2lkdGggKiA2ICsgMjtcbiAgICAgICAgICAgIHgyID0gYmxhY2tLZXlPZmZzZXRzWzldICsgMzsgXG4gICAgICAgICAgICB4MyA9IFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlIC0gMTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDIsIDAsIHgzIC0geDIsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShvY3RhdmUgKiBXaGl0ZUtleVdpZHRoICogS2V5c1Blck9jdGF2ZSksIDApO1xuICAgIH1cblxuICAgIC8qKiBGaW5kIHRoZSBNaWRpTm90ZSB3aXRoIHRoZSBzdGFydFRpbWUgY2xvc2VzdCB0byB0aGUgZ2l2ZW4gdGltZS5cbiAgICAgKiAgUmV0dXJuIHRoZSBpbmRleCBvZiB0aGUgbm90ZS4gIFVzZSBhIGJpbmFyeSBzZWFyY2ggbWV0aG9kLlxuICAgICAqL1xuICAgIHByaXZhdGUgaW50IEZpbmRDbG9zZXN0U3RhcnRUaW1lKGludCBwdWxzZVRpbWUpIHtcbiAgICAgICAgaW50IGxlZnQgPSAwO1xuICAgICAgICBpbnQgcmlnaHQgPSBub3Rlcy5Db3VudC0xO1xuXG4gICAgICAgIHdoaWxlIChyaWdodCAtIGxlZnQgPiAxKSB7XG4gICAgICAgICAgICBpbnQgaSA9IChyaWdodCArIGxlZnQpLzI7XG4gICAgICAgICAgICBpZiAobm90ZXNbbGVmdF0uU3RhcnRUaW1lID09IHB1bHNlVGltZSlcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGVsc2UgaWYgKG5vdGVzW2ldLlN0YXJ0VGltZSA8PSBwdWxzZVRpbWUpXG4gICAgICAgICAgICAgICAgbGVmdCA9IGk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmlnaHQgPSBpO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChsZWZ0ID49IDEgJiYgKG5vdGVzW2xlZnQtMV0uU3RhcnRUaW1lID09IG5vdGVzW2xlZnRdLlN0YXJ0VGltZSkpIHtcbiAgICAgICAgICAgIGxlZnQtLTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGVmdDtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBuZXh0IFN0YXJ0VGltZSB0aGF0IG9jY3VycyBhZnRlciB0aGUgTWlkaU5vdGVcbiAgICAgKiAgYXQgb2Zmc2V0IGksIHRoYXQgaXMgYWxzbyBpbiB0aGUgc2FtZSB0cmFjay9jaGFubmVsLlxuICAgICAqL1xuICAgIHByaXZhdGUgaW50IE5leHRTdGFydFRpbWVTYW1lVHJhY2soaW50IGkpIHtcbiAgICAgICAgaW50IHN0YXJ0ID0gbm90ZXNbaV0uU3RhcnRUaW1lO1xuICAgICAgICBpbnQgZW5kID0gbm90ZXNbaV0uRW5kVGltZTtcbiAgICAgICAgaW50IHRyYWNrID0gbm90ZXNbaV0uQ2hhbm5lbDtcblxuICAgICAgICB3aGlsZSAoaSA8IG5vdGVzLkNvdW50KSB7XG4gICAgICAgICAgICBpZiAobm90ZXNbaV0uQ2hhbm5lbCAhPSB0cmFjaykge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChub3Rlc1tpXS5TdGFydFRpbWUgPiBzdGFydCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBub3Rlc1tpXS5TdGFydFRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbmQgPSBNYXRoLk1heChlbmQsIG5vdGVzW2ldLkVuZFRpbWUpO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbmQ7XG4gICAgfVxuXG5cbiAgICAvKiogUmV0dXJuIHRoZSBuZXh0IFN0YXJ0VGltZSB0aGF0IG9jY3VycyBhZnRlciB0aGUgTWlkaU5vdGVcbiAgICAgKiAgYXQgb2Zmc2V0IGkuICBJZiBhbGwgdGhlIHN1YnNlcXVlbnQgbm90ZXMgaGF2ZSB0aGUgc2FtZVxuICAgICAqICBTdGFydFRpbWUsIHRoZW4gcmV0dXJuIHRoZSBsYXJnZXN0IEVuZFRpbWUuXG4gICAgICovXG4gICAgcHJpdmF0ZSBpbnQgTmV4dFN0YXJ0VGltZShpbnQgaSkge1xuICAgICAgICBpbnQgc3RhcnQgPSBub3Rlc1tpXS5TdGFydFRpbWU7XG4gICAgICAgIGludCBlbmQgPSBub3Rlc1tpXS5FbmRUaW1lO1xuXG4gICAgICAgIHdoaWxlIChpIDwgbm90ZXMuQ291bnQpIHtcbiAgICAgICAgICAgIGlmIChub3Rlc1tpXS5TdGFydFRpbWUgPiBzdGFydCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBub3Rlc1tpXS5TdGFydFRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbmQgPSBNYXRoLk1heChlbmQsIG5vdGVzW2ldLkVuZFRpbWUpO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbmQ7XG4gICAgfVxuXG4gICAgLyoqIEZpbmQgdGhlIE1pZGkgbm90ZXMgdGhhdCBvY2N1ciBpbiB0aGUgY3VycmVudCB0aW1lLlxuICAgICAqICBTaGFkZSB0aG9zZSBub3RlcyBvbiB0aGUgcGlhbm8gZGlzcGxheWVkLlxuICAgICAqICBVbi1zaGFkZSB0aGUgdGhvc2Ugbm90ZXMgcGxheWVkIGluIHRoZSBwcmV2aW91cyB0aW1lLlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIFNoYWRlTm90ZXMoaW50IGN1cnJlbnRQdWxzZVRpbWUsIGludCBwcmV2UHVsc2VUaW1lKSB7XG4gICAgICAgIGlmIChub3RlcyA9PSBudWxsIHx8IG5vdGVzLkNvdW50ID09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ3JhcGhpY3MgPT0gbnVsbCkge1xuICAgICAgICAgICAgZ3JhcGhpY3MgPSBDcmVhdGVHcmFwaGljcyhcInNoYWRlTm90ZXNfcGlhbm9cIik7XG4gICAgICAgIH1cbiAgICAgICAgZ3JhcGhpY3MuU21vb3RoaW5nTW9kZSA9IFNtb290aGluZ01vZGUuTm9uZTtcbiAgICAgICAgZ3JhcGhpY3MuVHJhbnNsYXRlVHJhbnNmb3JtKG1hcmdpbiArIEJsYWNrQm9yZGVyLCBtYXJnaW4gKyBCbGFja0JvcmRlcik7XG5cbiAgICAgICAgLyogTG9vcCB0aHJvdWdoIHRoZSBNaWRpIG5vdGVzLlxuICAgICAgICAgKiBVbnNoYWRlIG5vdGVzIHdoZXJlIFN0YXJ0VGltZSA8PSBwcmV2UHVsc2VUaW1lIDwgbmV4dCBTdGFydFRpbWVcbiAgICAgICAgICogU2hhZGUgbm90ZXMgd2hlcmUgU3RhcnRUaW1lIDw9IGN1cnJlbnRQdWxzZVRpbWUgPCBuZXh0IFN0YXJ0VGltZVxuICAgICAgICAgKi9cbiAgICAgICAgaW50IGxhc3RTaGFkZWRJbmRleCA9IEZpbmRDbG9zZXN0U3RhcnRUaW1lKHByZXZQdWxzZVRpbWUgLSBtYXhTaGFkZUR1cmF0aW9uICogMik7XG4gICAgICAgIGZvciAoaW50IGkgPSBsYXN0U2hhZGVkSW5kZXg7IGkgPCBub3Rlcy5Db3VudDsgaSsrKSB7XG4gICAgICAgICAgICBpbnQgc3RhcnQgPSBub3Rlc1tpXS5TdGFydFRpbWU7XG4gICAgICAgICAgICBpbnQgZW5kID0gbm90ZXNbaV0uRW5kVGltZTtcbiAgICAgICAgICAgIGludCBub3RlbnVtYmVyID0gbm90ZXNbaV0uTnVtYmVyO1xuICAgICAgICAgICAgaW50IG5leHRTdGFydCA9IE5leHRTdGFydFRpbWUoaSk7XG4gICAgICAgICAgICBpbnQgbmV4dFN0YXJ0VHJhY2sgPSBOZXh0U3RhcnRUaW1lU2FtZVRyYWNrKGkpO1xuICAgICAgICAgICAgZW5kID0gTWF0aC5NYXgoZW5kLCBuZXh0U3RhcnRUcmFjayk7XG4gICAgICAgICAgICBlbmQgPSBNYXRoLk1pbihlbmQsIHN0YXJ0ICsgbWF4U2hhZGVEdXJhdGlvbi0xKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8qIElmIHdlJ3ZlIHBhc3QgdGhlIHByZXZpb3VzIGFuZCBjdXJyZW50IHRpbWVzLCB3ZSdyZSBkb25lLiAqL1xuICAgICAgICAgICAgaWYgKChzdGFydCA+IHByZXZQdWxzZVRpbWUpICYmIChzdGFydCA+IGN1cnJlbnRQdWxzZVRpbWUpKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIElmIHNoYWRlZCBub3RlcyBhcmUgdGhlIHNhbWUsIHdlJ3JlIGRvbmUgKi9cbiAgICAgICAgICAgIGlmICgoc3RhcnQgPD0gY3VycmVudFB1bHNlVGltZSkgJiYgKGN1cnJlbnRQdWxzZVRpbWUgPCBuZXh0U3RhcnQpICYmXG4gICAgICAgICAgICAgICAgKGN1cnJlbnRQdWxzZVRpbWUgPCBlbmQpICYmIFxuICAgICAgICAgICAgICAgIChzdGFydCA8PSBwcmV2UHVsc2VUaW1lKSAmJiAocHJldlB1bHNlVGltZSA8IG5leHRTdGFydCkgJiZcbiAgICAgICAgICAgICAgICAocHJldlB1bHNlVGltZSA8IGVuZCkpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogSWYgdGhlIG5vdGUgaXMgaW4gdGhlIGN1cnJlbnQgdGltZSwgc2hhZGUgaXQgKi9cbiAgICAgICAgICAgIGlmICgoc3RhcnQgPD0gY3VycmVudFB1bHNlVGltZSkgJiYgKGN1cnJlbnRQdWxzZVRpbWUgPCBlbmQpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHVzZVR3b0NvbG9ycykge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm90ZXNbaV0uQ2hhbm5lbCA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTaGFkZU9uZU5vdGUoZ3JhcGhpY3MsIG5vdGVudW1iZXIsIHNoYWRlMkJydXNoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFNoYWRlT25lTm90ZShncmFwaGljcywgbm90ZW51bWJlciwgc2hhZGVCcnVzaCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIFNoYWRlT25lTm90ZShncmFwaGljcywgbm90ZW51bWJlciwgc2hhZGVCcnVzaCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBJZiB0aGUgbm90ZSBpcyBpbiB0aGUgcHJldmlvdXMgdGltZSwgdW4tc2hhZGUgaXQsIGRyYXcgaXQgd2hpdGUuICovXG4gICAgICAgICAgICBlbHNlIGlmICgoc3RhcnQgPD0gcHJldlB1bHNlVGltZSkgJiYgKHByZXZQdWxzZVRpbWUgPCBlbmQpKSB7XG4gICAgICAgICAgICAgICAgaW50IG51bSA9IG5vdGVudW1iZXIgJSAxMjtcbiAgICAgICAgICAgICAgICBpZiAobnVtID09IDEgfHwgbnVtID09IDMgfHwgbnVtID09IDYgfHwgbnVtID09IDggfHwgbnVtID09IDEwKSB7XG4gICAgICAgICAgICAgICAgICAgIFNoYWRlT25lTm90ZShncmFwaGljcywgbm90ZW51bWJlciwgZ3JheTFCcnVzaCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBTaGFkZU9uZU5vdGUoZ3JhcGhpY3MsIG5vdGVudW1iZXIsIEJydXNoZXMuV2hpdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBncmFwaGljcy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShtYXJnaW4gKyBCbGFja0JvcmRlciksIC0obWFyZ2luICsgQmxhY2tCb3JkZXIpKTtcbiAgICAgICAgZ3JhcGhpY3MuU21vb3RoaW5nTW9kZSA9IFNtb290aGluZ01vZGUuQW50aUFsaWFzO1xuICAgIH1cbn1cblxufVxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG5cbi8qIEBjbGFzcyBSZXN0U3ltYm9sXG4gKiBBIFJlc3Qgc3ltYm9sIHJlcHJlc2VudHMgYSByZXN0IC0gd2hvbGUsIGhhbGYsIHF1YXJ0ZXIsIG9yIGVpZ2h0aC5cbiAqIFRoZSBSZXN0IHN5bWJvbCBoYXMgYSBzdGFydHRpbWUgYW5kIGEgZHVyYXRpb24sIGp1c3QgbGlrZSBhIHJlZ3VsYXJcbiAqIG5vdGUuXG4gKi9cbnB1YmxpYyBjbGFzcyBSZXN0U3ltYm9sIDogTXVzaWNTeW1ib2wge1xuICAgIHByaXZhdGUgaW50IHN0YXJ0dGltZTsgICAgICAgICAgLyoqIFRoZSBzdGFydHRpbWUgb2YgdGhlIHJlc3QgKi9cbiAgICBwcml2YXRlIE5vdGVEdXJhdGlvbiBkdXJhdGlvbjsgIC8qKiBUaGUgcmVzdCBkdXJhdGlvbiAoZWlnaHRoLCBxdWFydGVyLCBoYWxmLCB3aG9sZSkgKi9cbiAgICBwcml2YXRlIGludCB3aWR0aDsgICAgICAgICAgICAgIC8qKiBUaGUgd2lkdGggaW4gcGl4ZWxzICovXG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IHJlc3Qgc3ltYm9sIHdpdGggdGhlIGdpdmVuIHN0YXJ0IHRpbWUgYW5kIGR1cmF0aW9uICovXG4gICAgcHVibGljIFJlc3RTeW1ib2woaW50IHN0YXJ0LCBOb3RlRHVyYXRpb24gZHVyKSB7XG4gICAgICAgIHN0YXJ0dGltZSA9IHN0YXJ0O1xuICAgICAgICBkdXJhdGlvbiA9IGR1cjsgXG4gICAgICAgIHdpZHRoID0gTWluV2lkdGg7XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgdGltZSAoaW4gcHVsc2VzKSB0aGlzIHN5bWJvbCBvY2N1cnMgYXQuXG4gICAgICogVGhpcyBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgbWVhc3VyZSB0aGlzIHN5bWJvbCBiZWxvbmdzIHRvLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgU3RhcnRUaW1lIHsgXG4gICAgICAgIGdldCB7IHJldHVybiBzdGFydHRpbWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0L1NldCB0aGUgd2lkdGggKGluIHBpeGVscykgb2YgdGhpcyBzeW1ib2wuIFRoZSB3aWR0aCBpcyBzZXRcbiAgICAgKiBpbiBTaGVldE11c2ljLkFsaWduU3ltYm9scygpIHRvIHZlcnRpY2FsbHkgYWxpZ24gc3ltYm9scy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFdpZHRoIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgIHNldCB7IHdpZHRoID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBtaW5pbXVtIHdpZHRoIChpbiBwaXhlbHMpIG5lZWRlZCB0byBkcmF3IHRoaXMgc3ltYm9sICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBNaW5XaWR0aCB7XG4gICAgICAgIGdldCB7IHJldHVybiAyICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICsgXG4gICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGFib3ZlIHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEFib3ZlU3RhZmYgeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIDA7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYmVsb3cgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQmVsb3dTdGFmZiB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBEcmF3IHRoZSBzeW1ib2wuXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHlsb2NhdGlvbiAoaW4gcGl4ZWxzKSB3aGVyZSB0aGUgdG9wIG9mIHRoZSBzdGFmZiBzdGFydHMuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIFxuICAgIHZvaWQgRHJhdyhHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICAvKiBBbGlnbiB0aGUgcmVzdCBzeW1ib2wgdG8gdGhlIHJpZ2h0ICovXG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKFdpZHRoIC0gTWluV2lkdGgsIDApO1xuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybShTaGVldE11c2ljLk5vdGVIZWlnaHQvMiwgMCk7XG5cbiAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5XaG9sZSkge1xuICAgICAgICAgICAgRHJhd1dob2xlKGcsIHBlbiwgeXRvcCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkhhbGYpIHtcbiAgICAgICAgICAgIERyYXdIYWxmKGcsIHBlbiwgeXRvcCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlF1YXJ0ZXIpIHtcbiAgICAgICAgICAgIERyYXdRdWFydGVyKGcsIHBlbiwgeXRvcCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkVpZ2h0aCkge1xuICAgICAgICAgICAgRHJhd0VpZ2h0aChnLCBwZW4sIHl0b3ApO1xuICAgICAgICB9XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC1TaGVldE11c2ljLk5vdGVIZWlnaHQvMiwgMCk7XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0oV2lkdGggLSBNaW5XaWR0aCksIDApO1xuICAgIH1cblxuXG4gICAgLyoqIERyYXcgYSB3aG9sZSByZXN0IHN5bWJvbCwgYSByZWN0YW5nbGUgYmVsb3cgYSBzdGFmZiBsaW5lLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIERyYXdXaG9sZShHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICBpbnQgeSA9IHl0b3AgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG5cbiAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKEJydXNoZXMuQmxhY2ssIDAsIHksIFxuICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlV2lkdGgsIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yKTtcbiAgICB9XG5cbiAgICAvKiogRHJhdyBhIGhhbGYgcmVzdCBzeW1ib2wsIGEgcmVjdGFuZ2xlIGFib3ZlIGEgc3RhZmYgbGluZS5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3SGFsZihHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICBpbnQgeSA9IHl0b3AgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcblxuICAgICAgICBnLkZpbGxSZWN0YW5nbGUoQnJ1c2hlcy5CbGFjaywgMCwgeSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVXaWR0aCwgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIpO1xuICAgIH1cblxuICAgIC8qKiBEcmF3IGEgcXVhcnRlciByZXN0IHN5bWJvbC5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3UXVhcnRlcihHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICBwZW4uRW5kQ2FwID0gTGluZUNhcC5GbGF0O1xuXG4gICAgICAgIGludCB5ID0geXRvcCArIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICBpbnQgeCA9IDI7XG4gICAgICAgIGludCB4ZW5kID0geCArIDIqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzM7XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCB4LCB5LCB4ZW5kLTEsIHkgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQtMSk7XG5cbiAgICAgICAgcGVuLldpZHRoID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvMjtcbiAgICAgICAgeSAgPSB5dG9wICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICsgMTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHhlbmQtMiwgeSwgeCwgeSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCk7XG5cbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICAgICAgeSA9IHl0b3AgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQqMiAtIDE7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCAwLCB5LCB4ZW5kKzIsIHkgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQpOyBcblxuICAgICAgICBwZW4uV2lkdGggPSBTaGVldE11c2ljLkxpbmVTcGFjZS8yO1xuICAgICAgICBpZiAoU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ID09IDYpIHtcbiAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4ZW5kLCB5ICsgMSArIDMqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeC8yLCB5ICsgMSArIDMqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgeyAgLyogTm90ZUhlaWdodCA9PSA4ICovXG4gICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeGVuZCwgeSArIDMqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeC8yLCB5ICsgMypTaGVldE11c2ljLk5vdGVIZWlnaHQvNCk7XG4gICAgICAgIH1cblxuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgMCwgeSArIDIqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzMgKyAxLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHhlbmQgLSAxLCB5ICsgMypTaGVldE11c2ljLk5vdGVIZWlnaHQvMik7XG4gICAgfVxuXG4gICAgLyoqIERyYXcgYW4gZWlnaHRoIHJlc3Qgc3ltYm9sLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIERyYXdFaWdodGgoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3ApIHtcbiAgICAgICAgaW50IHkgPSB5dG9wICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0IC0gMTtcbiAgICAgICAgZy5GaWxsRWxsaXBzZShCcnVzaGVzLkJsYWNrLCAwLCB5KzEsIFxuICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGluZVNwYWNlLTEsIFNoZWV0TXVzaWMuTGluZVNwYWNlLTEpO1xuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgKFNoZWV0TXVzaWMuTGluZVNwYWNlLTIpLzIsIHkgKyBTaGVldE11c2ljLkxpbmVTcGFjZS0xLFxuICAgICAgICAgICAgICAgICAgICAgICAgMypTaGVldE11c2ljLkxpbmVTcGFjZS8yLCB5ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMik7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCAzKlNoZWV0TXVzaWMuTGluZVNwYWNlLzIsIHkgKyBTaGVldE11c2ljLkxpbmVTcGFjZS8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgMypTaGVldE11c2ljLkxpbmVTcGFjZS80LCB5ICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIpO1xuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiUmVzdFN5bWJvbCBzdGFydHRpbWU9ezB9IGR1cmF0aW9uPXsxfSB3aWR0aD17Mn1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnR0aW1lLCBkdXJhdGlvbiwgd2lkdGgpO1xuICAgIH1cblxufVxuXG5cbn1cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDEyIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG5cbi8qKiBAY2xhc3MgU2hlZXRNdXNpY1xuICpcbiAqIFRoZSBTaGVldE11c2ljIENvbnRyb2wgaXMgdGhlIG1haW4gY2xhc3MgZm9yIGRpc3BsYXlpbmcgdGhlIHNoZWV0IG11c2ljLlxuICogVGhlIFNoZWV0TXVzaWMgY2xhc3MgaGFzIHRoZSBmb2xsb3dpbmcgcHVibGljIG1ldGhvZHM6XG4gKlxuICogU2hlZXRNdXNpYygpXG4gKiAgIENyZWF0ZSBhIG5ldyBTaGVldE11c2ljIGNvbnRyb2wgZnJvbSB0aGUgZ2l2ZW4gbWlkaSBmaWxlIGFuZCBvcHRpb25zLlxuICogXG4gKiBTZXRab29tKClcbiAqICAgU2V0IHRoZSB6b29tIGxldmVsIHRvIGRpc3BsYXkgdGhlIHNoZWV0IG11c2ljIGF0LlxuICpcbiAqIERvUHJpbnQoKVxuICogICBQcmludCBhIHNpbmdsZSBwYWdlIG9mIHNoZWV0IG11c2ljLlxuICpcbiAqIEdldFRvdGFsUGFnZXMoKVxuICogICBHZXQgdGhlIHRvdGFsIG51bWJlciBvZiBzaGVldCBtdXNpYyBwYWdlcy5cbiAqXG4gKiBPblBhaW50KClcbiAqICAgTWV0aG9kIGNhbGxlZCB0byBkcmF3IHRoZSBTaGVldE11aXNjXG4gKlxuICogVGhlc2UgcHVibGljIG1ldGhvZHMgYXJlIGNhbGxlZCBmcm9tIHRoZSBNaWRpU2hlZXRNdXNpYyBGb3JtIFdpbmRvdy5cbiAqXG4gKi9cbnB1YmxpYyBjbGFzcyBTaGVldE11c2ljIDogQ29udHJvbCB7XG5cbiAgICAvKiBNZWFzdXJlbWVudHMgdXNlZCB3aGVuIGRyYXdpbmcuICBBbGwgbWVhc3VyZW1lbnRzIGFyZSBpbiBwaXhlbHMuXG4gICAgICogVGhlIHZhbHVlcyBkZXBlbmQgb24gd2hldGhlciB0aGUgbWVudSAnTGFyZ2UgTm90ZXMnIG9yICdTbWFsbCBOb3RlcycgaXMgc2VsZWN0ZWQuXG4gICAgICovXG4gICAgcHVibGljIGNvbnN0ICBpbnQgTGluZVdpZHRoID0gMTsgICAgLyoqIFRoZSB3aWR0aCBvZiBhIGxpbmUgKi9cbiAgICBwdWJsaWMgY29uc3QgIGludCBMZWZ0TWFyZ2luID0gNDsgICAvKiogVGhlIGxlZnQgbWFyZ2luICovXG4gICAgcHVibGljIGNvbnN0ICBpbnQgVGl0bGVIZWlnaHQgPSAxNDsgLyoqIFRoZSBoZWlnaHQgZm9yIHRoZSB0aXRsZSBvbiB0aGUgZmlyc3QgcGFnZSAqL1xuICAgIHB1YmxpYyBzdGF0aWMgaW50IExpbmVTcGFjZTsgICAgICAgIC8qKiBUaGUgc3BhY2UgYmV0d2VlbiBsaW5lcyBpbiB0aGUgc3RhZmYgKi9cbiAgICBwdWJsaWMgc3RhdGljIGludCBTdGFmZkhlaWdodDsgICAgICAvKiogVGhlIGhlaWdodCBiZXR3ZWVuIHRoZSA1IGhvcml6b250YWwgbGluZXMgb2YgdGhlIHN0YWZmICovXG4gICAgcHVibGljIHN0YXRpYyBpbnQgTm90ZUhlaWdodDsgICAgICAvKiogVGhlIGhlaWdodCBvZiBhIHdob2xlIG5vdGUgKi9cbiAgICBwdWJsaWMgc3RhdGljIGludCBOb3RlV2lkdGg7ICAgICAgIC8qKiBUaGUgd2lkdGggb2YgYSB3aG9sZSBub3RlICovXG5cbiAgICBwdWJsaWMgY29uc3QgaW50IFBhZ2VXaWR0aCA9IDgwMDsgICAgLyoqIFRoZSB3aWR0aCBvZiBlYWNoIHBhZ2UgKi9cbiAgICBwdWJsaWMgY29uc3QgaW50IFBhZ2VIZWlnaHQgPSAxMDUwOyAgLyoqIFRoZSBoZWlnaHQgb2YgZWFjaCBwYWdlICh3aGVuIHByaW50aW5nKSAqL1xuICAgIHB1YmxpYyBzdGF0aWMgRm9udCBMZXR0ZXJGb250OyAgICAgICAvKiogVGhlIGZvbnQgZm9yIGRyYXdpbmcgdGhlIGxldHRlcnMgKi9cblxuICAgIHByaXZhdGUgTGlzdDxTdGFmZj4gc3RhZmZzOyAvKiogVGhlIGFycmF5IG9mIHN0YWZmcyB0byBkaXNwbGF5IChmcm9tIHRvcCB0byBib3R0b20pICovXG4gICAgcHJpdmF0ZSBLZXlTaWduYXR1cmUgbWFpbmtleTsgLyoqIFRoZSBtYWluIGtleSBzaWduYXR1cmUgKi9cbiAgICBwcml2YXRlIGludCAgICBudW10cmFja3M7ICAgICAvKiogVGhlIG51bWJlciBvZiB0cmFja3MgKi9cbiAgICBwcml2YXRlIGZsb2F0ICB6b29tOyAgICAgICAgICAvKiogVGhlIHpvb20gbGV2ZWwgdG8gZHJhdyBhdCAoMS4wID09IDEwMCUpICovXG4gICAgcHJpdmF0ZSBib29sICAgc2Nyb2xsVmVydDsgICAgLyoqIFdoZXRoZXIgdG8gc2Nyb2xsIHZlcnRpY2FsbHkgb3IgaG9yaXpvbnRhbGx5ICovXG4gICAgcHJpdmF0ZSBzdHJpbmcgZmlsZW5hbWU7ICAgICAgLyoqIFRoZSBuYW1lIG9mIHRoZSBtaWRpIGZpbGUgKi9cbiAgICBwcml2YXRlIGludCBzaG93Tm90ZUxldHRlcnM7ICAgIC8qKiBEaXNwbGF5IHRoZSBub3RlIGxldHRlcnMgKi9cbiAgICBwcml2YXRlIENvbG9yW10gTm90ZUNvbG9yczsgICAgIC8qKiBUaGUgbm90ZSBjb2xvcnMgdG8gdXNlICovXG4gICAgcHJpdmF0ZSBTb2xpZEJydXNoIHNoYWRlQnJ1c2g7ICAvKiogVGhlIGJydXNoIGZvciBzaGFkaW5nICovXG4gICAgcHJpdmF0ZSBTb2xpZEJydXNoIHNoYWRlMkJydXNoOyAvKiogVGhlIGJydXNoIGZvciBzaGFkaW5nIGxlZnQtaGFuZCBwaWFubyAqL1xuICAgIHByaXZhdGUgUGVuIHBlbjsgICAgICAgICAgICAgICAgLyoqIFRoZSBibGFjayBwZW4gZm9yIGRyYXdpbmcgKi9cblxuXG4gICAgLyoqIEluaXRpYWxpemUgdGhlIGRlZmF1bHQgbm90ZSBzaXplcy4gICovXG4gICAgc3RhdGljIFNoZWV0TXVzaWMoKSB7XG4gICAgICAgIFNldE5vdGVTaXplKGZhbHNlKTtcbiAgICB9XG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IFNoZWV0TXVzaWMgY29udHJvbCwgdXNpbmcgdGhlIGdpdmVuIHBhcnNlZCBNaWRpRmlsZS5cbiAgICAgKiAgVGhlIG9wdGlvbnMgY2FuIGJlIG51bGwuXG4gICAgICovXG4gICAgcHVibGljIFNoZWV0TXVzaWMoTWlkaUZpbGUgZmlsZSwgTWlkaU9wdGlvbnMgb3B0aW9ucykge1xuICAgICAgICBpbml0KGZpbGUsIG9wdGlvbnMpOyBcbiAgICB9XG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IFNoZWV0TXVzaWMgY29udHJvbCwgdXNpbmcgdGhlIGdpdmVuIG1pZGkgZmlsZW5hbWUuXG4gICAgICogIFRoZSBvcHRpb25zIGNhbiBiZSBudWxsLlxuICAgICAqL1xuICAgIC8vcHVibGljIFNoZWV0TXVzaWMoc3RyaW5nIGZpbGVuYW1lLCBNaWRpT3B0aW9ucyBvcHRpb25zKSB7XG4gICAgLy8gICAgTWlkaUZpbGUgZmlsZSA9IG5ldyBNaWRpRmlsZShmaWxlbmFtZSk7XG4gICAgLy8gICAgaW5pdChmaWxlLCBvcHRpb25zKTsgXG4gICAgLy99XG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IFNoZWV0TXVzaWMgY29udHJvbCwgdXNpbmcgdGhlIGdpdmVuIHJhdyBtaWRpIGJ5dGVbXSBkYXRhLlxuICAgICAqICBUaGUgb3B0aW9ucyBjYW4gYmUgbnVsbC5cbiAgICAgKi9cbiAgICBwdWJsaWMgU2hlZXRNdXNpYyhieXRlW10gZGF0YSwgc3RyaW5nIHRpdGxlLCBNaWRpT3B0aW9ucyBvcHRpb25zKSB7XG4gICAgICAgIE1pZGlGaWxlIGZpbGUgPSBuZXcgTWlkaUZpbGUoZGF0YSwgdGl0bGUpO1xuICAgICAgICBpbml0KGZpbGUsIG9wdGlvbnMpOyBcbiAgICB9XG5cblxuICAgIC8qKiBDcmVhdGUgYSBuZXcgU2hlZXRNdXNpYyBjb250cm9sLlxuICAgICAqIE1pZGlGaWxlIGlzIHRoZSBwYXJzZWQgbWlkaSBmaWxlIHRvIGRpc3BsYXkuXG4gICAgICogU2hlZXRNdXNpYyBPcHRpb25zIGFyZSB0aGUgbWVudSBvcHRpb25zIHRoYXQgd2VyZSBzZWxlY3RlZC5cbiAgICAgKlxuICAgICAqIC0gQXBwbHkgYWxsIHRoZSBNZW51IE9wdGlvbnMgdG8gdGhlIE1pZGlGaWxlIHRyYWNrcy5cbiAgICAgKiAtIENhbGN1bGF0ZSB0aGUga2V5IHNpZ25hdHVyZVxuICAgICAqIC0gRm9yIGVhY2ggdHJhY2ssIGNyZWF0ZSBhIGxpc3Qgb2YgTXVzaWNTeW1ib2xzIChub3RlcywgcmVzdHMsIGJhcnMsIGV0YylcbiAgICAgKiAtIFZlcnRpY2FsbHkgYWxpZ24gdGhlIG11c2ljIHN5bWJvbHMgaW4gYWxsIHRoZSB0cmFja3NcbiAgICAgKiAtIFBhcnRpdGlvbiB0aGUgbXVzaWMgbm90ZXMgaW50byBob3Jpem9udGFsIHN0YWZmc1xuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIGluaXQoTWlkaUZpbGUgZmlsZSwgTWlkaU9wdGlvbnMgb3B0aW9ucykge1xuICAgICAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICAgICAgICBvcHRpb25zID0gbmV3IE1pZGlPcHRpb25zKGZpbGUpO1xuICAgICAgICB9XG4gICAgICAgIHpvb20gPSAxLjBmO1xuICAgICAgICBmaWxlbmFtZSA9IGZpbGUuRmlsZU5hbWU7XG5cbiAgICAgICAgU2V0Q29sb3JzKG9wdGlvbnMuY29sb3JzLCBvcHRpb25zLnNoYWRlQ29sb3IsIG9wdGlvbnMuc2hhZGUyQ29sb3IpO1xuICAgICAgICBwZW4gPSBuZXcgUGVuKENvbG9yLkJsYWNrLCAxKTtcblxuICAgICAgICBMaXN0PE1pZGlUcmFjaz4gdHJhY2tzID0gZmlsZS5DaGFuZ2VNaWRpTm90ZXMob3B0aW9ucyk7XG4gICAgICAgIFNldE5vdGVTaXplKG9wdGlvbnMubGFyZ2VOb3RlU2l6ZSk7XG4gICAgICAgIHNjcm9sbFZlcnQgPSBvcHRpb25zLnNjcm9sbFZlcnQ7XG4gICAgICAgIHNob3dOb3RlTGV0dGVycz0gb3B0aW9ucy5zaG93Tm90ZUxldHRlcnM7XG4gICAgICAgIFRpbWVTaWduYXR1cmUgdGltZSA9IGZpbGUuVGltZTsgXG4gICAgICAgIGlmIChvcHRpb25zLnRpbWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGltZSA9IG9wdGlvbnMudGltZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9ucy5rZXkgPT0gLTEpIHtcbiAgICAgICAgICAgIG1haW5rZXkgPSBHZXRLZXlTaWduYXR1cmUodHJhY2tzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG1haW5rZXkgPSBuZXcgS2V5U2lnbmF0dXJlKG9wdGlvbnMua2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG51bXRyYWNrcyA9IHRyYWNrcy5Db3VudDtcblxuICAgICAgICBpbnQgbGFzdFN0YXJ0ID0gZmlsZS5FbmRUaW1lKCkgKyBvcHRpb25zLnNoaWZ0dGltZTtcblxuICAgICAgICAvKiBDcmVhdGUgYWxsIHRoZSBtdXNpYyBzeW1ib2xzIChub3RlcywgcmVzdHMsIHZlcnRpY2FsIGJhcnMsIGFuZFxuICAgICAgICAgKiBjbGVmIGNoYW5nZXMpLiAgVGhlIHN5bWJvbHMgdmFyaWFibGUgY29udGFpbnMgYSBsaXN0IG9mIG11c2ljIFxuICAgICAgICAgKiBzeW1ib2xzIGZvciBlYWNoIHRyYWNrLiAgVGhlIGxpc3QgZG9lcyBub3QgaW5jbHVkZSB0aGUgbGVmdC1zaWRlIFxuICAgICAgICAgKiBDbGVmIGFuZCBrZXkgc2lnbmF0dXJlIHN5bWJvbHMuICBUaG9zZSBjYW4gb25seSBiZSBjYWxjdWxhdGVkIFxuICAgICAgICAgKiB3aGVuIHdlIGNyZWF0ZSB0aGUgc3RhZmZzLlxuICAgICAgICAgKi9cbiAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD5bXSBzeW1ib2xzID0gbmV3IExpc3Q8TXVzaWNTeW1ib2w+IFsgbnVtdHJhY2tzIF07XG4gICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCBudW10cmFja3M7IHRyYWNrbnVtKyspIHtcbiAgICAgICAgICAgIE1pZGlUcmFjayB0cmFjayA9IHRyYWNrc1t0cmFja251bV07XG4gICAgICAgICAgICBDbGVmTWVhc3VyZXMgY2xlZnMgPSBuZXcgQ2xlZk1lYXN1cmVzKHRyYWNrLk5vdGVzLCB0aW1lLk1lYXN1cmUpO1xuICAgICAgICAgICAgTGlzdDxDaG9yZFN5bWJvbD4gY2hvcmRzID0gQ3JlYXRlQ2hvcmRzKHRyYWNrLk5vdGVzLCBtYWlua2V5LCB0aW1lLCBjbGVmcyk7XG4gICAgICAgICAgICBzeW1ib2xzW3RyYWNrbnVtXSA9IENyZWF0ZVN5bWJvbHMoY2hvcmRzLCBjbGVmcywgdGltZSwgbGFzdFN0YXJ0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIExpc3Q8THlyaWNTeW1ib2w+W10gbHlyaWNzID0gbnVsbDtcbiAgICAgICAgaWYgKG9wdGlvbnMuc2hvd0x5cmljcykge1xuICAgICAgICAgICAgbHlyaWNzID0gR2V0THlyaWNzKHRyYWNrcyk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBWZXJ0aWNhbGx5IGFsaWduIHRoZSBtdXNpYyBzeW1ib2xzICovXG4gICAgICAgIFN5bWJvbFdpZHRocyB3aWR0aHMgPSBuZXcgU3ltYm9sV2lkdGhzKHN5bWJvbHMsIGx5cmljcyk7XG4gICAgICAgIEFsaWduU3ltYm9scyhzeW1ib2xzLCB3aWR0aHMsIG9wdGlvbnMpO1xuXG4gICAgICAgIHN0YWZmcyA9IENyZWF0ZVN0YWZmcyhzeW1ib2xzLCBtYWlua2V5LCBvcHRpb25zLCB0aW1lLk1lYXN1cmUpO1xuICAgICAgICBDcmVhdGVBbGxCZWFtZWRDaG9yZHMoc3ltYm9scywgdGltZSk7XG4gICAgICAgIGlmIChseXJpY3MgIT0gbnVsbCkge1xuICAgICAgICAgICAgQWRkTHlyaWNzVG9TdGFmZnMoc3RhZmZzLCBseXJpY3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogQWZ0ZXIgbWFraW5nIGNob3JkIHBhaXJzLCB0aGUgc3RlbSBkaXJlY3Rpb25zIGNhbiBjaGFuZ2UsXG4gICAgICAgICAqIHdoaWNoIGFmZmVjdHMgdGhlIHN0YWZmIGhlaWdodC4gIFJlLWNhbGN1bGF0ZSB0aGUgc3RhZmYgaGVpZ2h0LlxuICAgICAgICAgKi9cbiAgICAgICAgZm9yZWFjaCAoU3RhZmYgc3RhZmYgaW4gc3RhZmZzKSB7XG4gICAgICAgICAgICBzdGFmZi5DYWxjdWxhdGVIZWlnaHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIEJhY2tDb2xvciA9IENvbG9yLldoaXRlO1xuXG4gICAgICAgIFNldFpvb20oMS4wZik7XG4gICAgfVxuXG5cbiAgICAvKiogR2V0IHRoZSBiZXN0IGtleSBzaWduYXR1cmUgZ2l2ZW4gdGhlIG1pZGkgbm90ZXMgaW4gYWxsIHRoZSB0cmFja3MuICovXG4gICAgcHJpdmF0ZSBLZXlTaWduYXR1cmUgR2V0S2V5U2lnbmF0dXJlKExpc3Q8TWlkaVRyYWNrPiB0cmFja3MpIHtcbiAgICAgICAgTGlzdDxpbnQ+IG5vdGVudW1zID0gbmV3IExpc3Q8aW50PigpO1xuICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKSB7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrLk5vdGVzKSB7XG4gICAgICAgICAgICAgICAgbm90ZW51bXMuQWRkKG5vdGUuTnVtYmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gS2V5U2lnbmF0dXJlLkd1ZXNzKG5vdGVudW1zKTtcbiAgICB9XG5cblxuICAgIC8qKiBDcmVhdGUgdGhlIGNob3JkIHN5bWJvbHMgZm9yIGEgc2luZ2xlIHRyYWNrLlxuICAgICAqIEBwYXJhbSBtaWRpbm90ZXMgIFRoZSBNaWRpbm90ZXMgaW4gdGhlIHRyYWNrLlxuICAgICAqIEBwYXJhbSBrZXkgICAgICAgIFRoZSBLZXkgU2lnbmF0dXJlLCBmb3IgZGV0ZXJtaW5pbmcgc2hhcnBzL2ZsYXRzLlxuICAgICAqIEBwYXJhbSB0aW1lICAgICAgIFRoZSBUaW1lIFNpZ25hdHVyZSwgZm9yIGRldGVybWluaW5nIHRoZSBtZWFzdXJlcy5cbiAgICAgKiBAcGFyYW0gY2xlZnMgICAgICBUaGUgY2xlZnMgdG8gdXNlIGZvciBlYWNoIG1lYXN1cmUuXG4gICAgICogQHJldCBBbiBhcnJheSBvZiBDaG9yZFN5bWJvbHNcbiAgICAgKi9cbiAgICBwcml2YXRlXG4gICAgTGlzdDxDaG9yZFN5bWJvbD4gQ3JlYXRlQ2hvcmRzKExpc3Q8TWlkaU5vdGU+IG1pZGlub3RlcywgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEtleVNpZ25hdHVyZSBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRpbWVTaWduYXR1cmUgdGltZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ2xlZk1lYXN1cmVzIGNsZWZzKSB7XG5cbiAgICAgICAgaW50IGkgPSAwO1xuICAgICAgICBMaXN0PENob3JkU3ltYm9sPiBjaG9yZHMgPSBuZXcgTGlzdDxDaG9yZFN5bWJvbD4oKTtcbiAgICAgICAgTGlzdDxNaWRpTm90ZT4gbm90ZWdyb3VwID0gbmV3IExpc3Q8TWlkaU5vdGU+KDEyKTtcbiAgICAgICAgaW50IGxlbiA9IG1pZGlub3Rlcy5Db3VudDsgXG5cbiAgICAgICAgd2hpbGUgKGkgPCBsZW4pIHtcblxuICAgICAgICAgICAgaW50IHN0YXJ0dGltZSA9IG1pZGlub3Rlc1tpXS5TdGFydFRpbWU7XG4gICAgICAgICAgICBDbGVmIGNsZWYgPSBjbGVmcy5HZXRDbGVmKHN0YXJ0dGltZSk7XG5cbiAgICAgICAgICAgIC8qIEdyb3VwIGFsbCB0aGUgbWlkaSBub3RlcyB3aXRoIHRoZSBzYW1lIHN0YXJ0IHRpbWVcbiAgICAgICAgICAgICAqIGludG8gdGhlIG5vdGVzIGxpc3QuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIG5vdGVncm91cC5DbGVhcigpO1xuICAgICAgICAgICAgbm90ZWdyb3VwLkFkZChtaWRpbm90ZXNbaV0pO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgd2hpbGUgKGkgPCBsZW4gJiYgbWlkaW5vdGVzW2ldLlN0YXJ0VGltZSA9PSBzdGFydHRpbWUpIHtcbiAgICAgICAgICAgICAgICBub3RlZ3JvdXAuQWRkKG1pZGlub3Rlc1tpXSk7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBDcmVhdGUgYSBzaW5nbGUgY2hvcmQgZnJvbSB0aGUgZ3JvdXAgb2YgbWlkaSBub3RlcyB3aXRoXG4gICAgICAgICAgICAgKiB0aGUgc2FtZSBzdGFydCB0aW1lLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBDaG9yZFN5bWJvbCBjaG9yZCA9IG5ldyBDaG9yZFN5bWJvbChub3RlZ3JvdXAsIGtleSwgdGltZSwgY2xlZiwgdGhpcyk7XG4gICAgICAgICAgICBjaG9yZHMuQWRkKGNob3JkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjaG9yZHM7XG4gICAgfVxuXG4gICAgLyoqIEdpdmVuIHRoZSBjaG9yZCBzeW1ib2xzIGZvciBhIHRyYWNrLCBjcmVhdGUgYSBuZXcgc3ltYm9sIGxpc3RcbiAgICAgKiB0aGF0IGNvbnRhaW5zIHRoZSBjaG9yZCBzeW1ib2xzLCB2ZXJ0aWNhbCBiYXJzLCByZXN0cywgYW5kIGNsZWYgY2hhbmdlcy5cbiAgICAgKiBSZXR1cm4gYSBsaXN0IG9mIHN5bWJvbHMgKENob3JkU3ltYm9sLCBCYXJTeW1ib2wsIFJlc3RTeW1ib2wsIENsZWZTeW1ib2wpXG4gICAgICovXG4gICAgcHJpdmF0ZSBMaXN0PE11c2ljU3ltYm9sPiBcbiAgICBDcmVhdGVTeW1ib2xzKExpc3Q8Q2hvcmRTeW1ib2w+IGNob3JkcywgQ2xlZk1lYXN1cmVzIGNsZWZzLFxuICAgICAgICAgICAgICAgICAgVGltZVNpZ25hdHVyZSB0aW1lLCBpbnQgbGFzdFN0YXJ0KSB7XG5cbiAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scyA9IG5ldyBMaXN0PE11c2ljU3ltYm9sPigpO1xuICAgICAgICBzeW1ib2xzID0gQWRkQmFycyhjaG9yZHMsIHRpbWUsIGxhc3RTdGFydCk7XG4gICAgICAgIHN5bWJvbHMgPSBBZGRSZXN0cyhzeW1ib2xzLCB0aW1lKTtcbiAgICAgICAgc3ltYm9scyA9IEFkZENsZWZDaGFuZ2VzKHN5bWJvbHMsIGNsZWZzLCB0aW1lKTtcblxuICAgICAgICByZXR1cm4gc3ltYm9scztcbiAgICB9XG5cbiAgICAvKiogQWRkIGluIHRoZSB2ZXJ0aWNhbCBiYXJzIGRlbGltaXRpbmcgbWVhc3VyZXMuIFxuICAgICAqICBBbHNvLCBhZGQgdGhlIHRpbWUgc2lnbmF0dXJlIHN5bWJvbHMuXG4gICAgICovXG4gICAgcHJpdmF0ZVxuICAgIExpc3Q8TXVzaWNTeW1ib2w+IEFkZEJhcnMoTGlzdDxDaG9yZFN5bWJvbD4gY2hvcmRzLCBUaW1lU2lnbmF0dXJlIHRpbWUsIGludCBsYXN0U3RhcnQpIHtcblxuICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzID0gbmV3IExpc3Q8TXVzaWNTeW1ib2w+KCk7XG5cbiAgICAgICAgVGltZVNpZ1N5bWJvbCB0aW1lc2lnID0gbmV3IFRpbWVTaWdTeW1ib2wodGltZS5OdW1lcmF0b3IsIHRpbWUuRGVub21pbmF0b3IpO1xuICAgICAgICBzeW1ib2xzLkFkZCh0aW1lc2lnKTtcblxuICAgICAgICAvKiBUaGUgc3RhcnR0aW1lIG9mIHRoZSBiZWdpbm5pbmcgb2YgdGhlIG1lYXN1cmUgKi9cbiAgICAgICAgaW50IG1lYXN1cmV0aW1lID0gMDtcblxuICAgICAgICBpbnQgaSA9IDA7XG4gICAgICAgIHdoaWxlIChpIDwgY2hvcmRzLkNvdW50KSB7XG4gICAgICAgICAgICBpZiAobWVhc3VyZXRpbWUgPD0gY2hvcmRzW2ldLlN0YXJ0VGltZSkge1xuICAgICAgICAgICAgICAgIHN5bWJvbHMuQWRkKG5ldyBCYXJTeW1ib2wobWVhc3VyZXRpbWUpICk7XG4gICAgICAgICAgICAgICAgbWVhc3VyZXRpbWUgKz0gdGltZS5NZWFzdXJlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc3ltYm9scy5BZGQoY2hvcmRzW2ldKTtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBLZWVwIGFkZGluZyBiYXJzIHVudGlsIHRoZSBsYXN0IFN0YXJ0VGltZSAodGhlIGVuZCBvZiB0aGUgc29uZykgKi9cbiAgICAgICAgd2hpbGUgKG1lYXN1cmV0aW1lIDwgbGFzdFN0YXJ0KSB7XG4gICAgICAgICAgICBzeW1ib2xzLkFkZChuZXcgQmFyU3ltYm9sKG1lYXN1cmV0aW1lKSApO1xuICAgICAgICAgICAgbWVhc3VyZXRpbWUgKz0gdGltZS5NZWFzdXJlO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogQWRkIHRoZSBmaW5hbCB2ZXJ0aWNhbCBiYXIgdG8gdGhlIGxhc3QgbWVhc3VyZSAqL1xuICAgICAgICBzeW1ib2xzLkFkZChuZXcgQmFyU3ltYm9sKG1lYXN1cmV0aW1lKSApO1xuICAgICAgICByZXR1cm4gc3ltYm9scztcbiAgICB9XG5cbiAgICAvKiogQWRkIHJlc3Qgc3ltYm9scyBiZXR3ZWVuIG5vdGVzLiAgQWxsIHRpbWVzIGJlbG93IGFyZSBcbiAgICAgKiBtZWFzdXJlZCBpbiBwdWxzZXMuXG4gICAgICovXG4gICAgcHJpdmF0ZVxuICAgIExpc3Q8TXVzaWNTeW1ib2w+IEFkZFJlc3RzKExpc3Q8TXVzaWNTeW1ib2w+IHN5bWJvbHMsIFRpbWVTaWduYXR1cmUgdGltZSkge1xuICAgICAgICBpbnQgcHJldnRpbWUgPSAwO1xuXG4gICAgICAgIExpc3Q8TXVzaWNTeW1ib2w+IHJlc3VsdCA9IG5ldyBMaXN0PE11c2ljU3ltYm9sPiggc3ltYm9scy5Db3VudCApO1xuXG4gICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHN5bWJvbCBpbiBzeW1ib2xzKSB7XG4gICAgICAgICAgICBpbnQgc3RhcnR0aW1lID0gc3ltYm9sLlN0YXJ0VGltZTtcbiAgICAgICAgICAgIFJlc3RTeW1ib2xbXSByZXN0cyA9IEdldFJlc3RzKHRpbWUsIHByZXZ0aW1lLCBzdGFydHRpbWUpO1xuICAgICAgICAgICAgaWYgKHJlc3RzICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChSZXN0U3ltYm9sIHIgaW4gcmVzdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LkFkZChyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlc3VsdC5BZGQoc3ltYm9sKTtcblxuICAgICAgICAgICAgLyogU2V0IHByZXZ0aW1lIHRvIHRoZSBlbmQgdGltZSBvZiB0aGUgbGFzdCBub3RlL3N5bWJvbC4gKi9cbiAgICAgICAgICAgIGlmIChzeW1ib2wgaXMgQ2hvcmRTeW1ib2wpIHtcbiAgICAgICAgICAgICAgICBDaG9yZFN5bWJvbCBjaG9yZCA9IChDaG9yZFN5bWJvbClzeW1ib2w7XG4gICAgICAgICAgICAgICAgcHJldnRpbWUgPSBNYXRoLk1heCggY2hvcmQuRW5kVGltZSwgcHJldnRpbWUgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHByZXZ0aW1lID0gTWF0aC5NYXgoc3RhcnR0aW1lLCBwcmV2dGltZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSByZXN0IHN5bWJvbHMgbmVlZGVkIHRvIGZpbGwgdGhlIHRpbWUgaW50ZXJ2YWwgYmV0d2VlblxuICAgICAqIHN0YXJ0IGFuZCBlbmQuICBJZiBubyByZXN0cyBhcmUgbmVlZGVkLCByZXR1cm4gbmlsLlxuICAgICAqL1xuICAgIHByaXZhdGVcbiAgICBSZXN0U3ltYm9sW10gR2V0UmVzdHMoVGltZVNpZ25hdHVyZSB0aW1lLCBpbnQgc3RhcnQsIGludCBlbmQpIHtcbiAgICAgICAgUmVzdFN5bWJvbFtdIHJlc3VsdDtcbiAgICAgICAgUmVzdFN5bWJvbCByMSwgcjI7XG5cbiAgICAgICAgaWYgKGVuZCAtIHN0YXJ0IDwgMClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIE5vdGVEdXJhdGlvbiBkdXIgPSB0aW1lLkdldE5vdGVEdXJhdGlvbihlbmQgLSBzdGFydCk7XG4gICAgICAgIHN3aXRjaCAoZHVyKSB7XG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5XaG9sZTpcbiAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkhhbGY6XG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5RdWFydGVyOlxuICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uRWlnaHRoOlxuICAgICAgICAgICAgICAgIHIxID0gbmV3IFJlc3RTeW1ib2woc3RhcnQsIGR1cik7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbmV3IFJlc3RTeW1ib2xbXXsgcjEgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuXG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5Eb3R0ZWRIYWxmOlxuICAgICAgICAgICAgICAgIHIxID0gbmV3IFJlc3RTeW1ib2woc3RhcnQsIE5vdGVEdXJhdGlvbi5IYWxmKTtcbiAgICAgICAgICAgICAgICByMiA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0ICsgdGltZS5RdWFydGVyKjIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTm90ZUR1cmF0aW9uLlF1YXJ0ZXIpO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBSZXN0U3ltYm9sW117IHIxLCByMiB9O1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG5cbiAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkRvdHRlZFF1YXJ0ZXI6XG4gICAgICAgICAgICAgICAgcjEgPSBuZXcgUmVzdFN5bWJvbChzdGFydCwgTm90ZUR1cmF0aW9uLlF1YXJ0ZXIpO1xuICAgICAgICAgICAgICAgIHIyID0gbmV3IFJlc3RTeW1ib2woc3RhcnQgKyB0aW1lLlF1YXJ0ZXIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTm90ZUR1cmF0aW9uLkVpZ2h0aCk7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbmV3IFJlc3RTeW1ib2xbXXsgcjEsIHIyIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDsgXG5cbiAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aDpcbiAgICAgICAgICAgICAgICByMSA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0LCBOb3RlRHVyYXRpb24uRWlnaHRoKTtcbiAgICAgICAgICAgICAgICByMiA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0ICsgdGltZS5RdWFydGVyLzIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTm90ZUR1cmF0aW9uLlNpeHRlZW50aCk7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbmV3IFJlc3RTeW1ib2xbXXsgcjEsIHIyIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBUaGUgY3VycmVudCBjbGVmIGlzIGFsd2F5cyBzaG93biBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBzdGFmZiwgb25cbiAgICAgKiB0aGUgbGVmdCBzaWRlLiAgSG93ZXZlciwgdGhlIGNsZWYgY2FuIGFsc28gY2hhbmdlIGZyb20gbWVhc3VyZSB0byBcbiAgICAgKiBtZWFzdXJlLiBXaGVuIGl0IGRvZXMsIGEgQ2xlZiBzeW1ib2wgbXVzdCBiZSBzaG93biB0byBpbmRpY2F0ZSB0aGUgXG4gICAgICogY2hhbmdlIGluIGNsZWYuICBUaGlzIGZ1bmN0aW9uIGFkZHMgdGhlc2UgQ2xlZiBjaGFuZ2Ugc3ltYm9scy5cbiAgICAgKiBUaGlzIGZ1bmN0aW9uIGRvZXMgbm90IGFkZCB0aGUgbWFpbiBDbGVmIFN5bWJvbCB0aGF0IGJlZ2lucyBlYWNoXG4gICAgICogc3RhZmYuICBUaGF0IGlzIGRvbmUgaW4gdGhlIFN0YWZmKCkgY29udHJ1Y3Rvci5cbiAgICAgKi9cbiAgICBwcml2YXRlXG4gICAgTGlzdDxNdXNpY1N5bWJvbD4gQWRkQ2xlZkNoYW5nZXMoTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDbGVmTWVhc3VyZXMgY2xlZnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVGltZVNpZ25hdHVyZSB0aW1lKSB7XG5cbiAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD4gcmVzdWx0ID0gbmV3IExpc3Q8TXVzaWNTeW1ib2w+KCBzeW1ib2xzLkNvdW50ICk7XG4gICAgICAgIENsZWYgcHJldmNsZWYgPSBjbGVmcy5HZXRDbGVmKDApO1xuICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBzeW1ib2wgaW4gc3ltYm9scykge1xuICAgICAgICAgICAgLyogQSBCYXJTeW1ib2wgaW5kaWNhdGVzIGEgbmV3IG1lYXN1cmUgKi9cbiAgICAgICAgICAgIGlmIChzeW1ib2wgaXMgQmFyU3ltYm9sKSB7XG4gICAgICAgICAgICAgICAgQ2xlZiBjbGVmID0gY2xlZnMuR2V0Q2xlZihzeW1ib2wuU3RhcnRUaW1lKTtcbiAgICAgICAgICAgICAgICBpZiAoY2xlZiAhPSBwcmV2Y2xlZikge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQuQWRkKG5ldyBDbGVmU3ltYm9sKGNsZWYsIHN5bWJvbC5TdGFydFRpbWUtMSwgdHJ1ZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwcmV2Y2xlZiA9IGNsZWY7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHQuQWRkKHN5bWJvbCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgICAgICAgIFxuXG4gICAgLyoqIE5vdGVzIHdpdGggdGhlIHNhbWUgc3RhcnQgdGltZXMgaW4gZGlmZmVyZW50IHN0YWZmcyBzaG91bGQgYmVcbiAgICAgKiB2ZXJ0aWNhbGx5IGFsaWduZWQuICBUaGUgU3ltYm9sV2lkdGhzIGNsYXNzIGlzIHVzZWQgdG8gaGVscCBcbiAgICAgKiB2ZXJ0aWNhbGx5IGFsaWduIHN5bWJvbHMuXG4gICAgICpcbiAgICAgKiBGaXJzdCwgZWFjaCB0cmFjayBzaG91bGQgaGF2ZSBhIHN5bWJvbCBmb3IgZXZlcnkgc3RhcnR0aW1lIHRoYXRcbiAgICAgKiBhcHBlYXJzIGluIHRoZSBNaWRpIEZpbGUuICBJZiBhIHRyYWNrIGRvZXNuJ3QgaGF2ZSBhIHN5bWJvbCBmb3IgYVxuICAgICAqIHBhcnRpY3VsYXIgc3RhcnR0aW1lLCB0aGVuIGFkZCBhIFwiYmxhbmtcIiBzeW1ib2wgZm9yIHRoYXQgdGltZS5cbiAgICAgKlxuICAgICAqIE5leHQsIG1ha2Ugc3VyZSB0aGUgc3ltYm9scyBmb3IgZWFjaCBzdGFydCB0aW1lIGFsbCBoYXZlIHRoZSBzYW1lXG4gICAgICogd2lkdGgsIGFjcm9zcyBhbGwgdHJhY2tzLiAgVGhlIFN5bWJvbFdpZHRocyBjbGFzcyBzdG9yZXNcbiAgICAgKiAtIFRoZSBzeW1ib2wgd2lkdGggZm9yIGVhY2ggc3RhcnR0aW1lLCBmb3IgZWFjaCB0cmFja1xuICAgICAqIC0gVGhlIG1heGltdW0gc3ltYm9sIHdpZHRoIGZvciBhIGdpdmVuIHN0YXJ0dGltZSwgYWNyb3NzIGFsbCB0cmFja3MuXG4gICAgICpcbiAgICAgKiBUaGUgbWV0aG9kIFN5bWJvbFdpZHRocy5HZXRFeHRyYVdpZHRoKCkgcmV0dXJucyB0aGUgZXh0cmEgd2lkdGhcbiAgICAgKiBuZWVkZWQgZm9yIGEgdHJhY2sgdG8gbWF0Y2ggdGhlIG1heGltdW0gc3ltYm9sIHdpZHRoIGZvciBhIGdpdmVuXG4gICAgICogc3RhcnR0aW1lLlxuICAgICAqL1xuICAgIHByaXZhdGVcbiAgICB2b2lkIEFsaWduU3ltYm9scyhMaXN0PE11c2ljU3ltYm9sPltdIGFsbHN5bWJvbHMsIFN5bWJvbFdpZHRocyB3aWR0aHMsIE1pZGlPcHRpb25zIG9wdGlvbnMpIHtcblxuICAgICAgICAvLyBJZiB3ZSBzaG93IG1lYXN1cmUgbnVtYmVycywgaW5jcmVhc2UgYmFyIHN5bWJvbCB3aWR0aFxuICAgICAgICBpZiAob3B0aW9ucy5zaG93TWVhc3VyZXMpIHtcbiAgICAgICAgICAgIGZvciAoaW50IHRyYWNrID0gMDsgdHJhY2sgPCBhbGxzeW1ib2xzLkxlbmd0aDsgdHJhY2srKykge1xuICAgICAgICAgICAgICAgIExpc3Q8TXVzaWNTeW1ib2w+IHN5bWJvbHMgPSBhbGxzeW1ib2xzW3RyYWNrXTtcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBzeW0gaW4gc3ltYm9scykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3ltIGlzIEJhclN5bWJvbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ltLldpZHRoICs9IFNoZWV0TXVzaWMuTm90ZVdpZHRoO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBcbiAgICAgICAgZm9yIChpbnQgdHJhY2sgPSAwOyB0cmFjayA8IGFsbHN5bWJvbHMuTGVuZ3RoOyB0cmFjaysrKSB7XG4gICAgICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzID0gYWxsc3ltYm9sc1t0cmFja107XG4gICAgICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiByZXN1bHQgPSBuZXcgTGlzdDxNdXNpY1N5bWJvbD4oKTtcblxuICAgICAgICAgICAgaW50IGkgPSAwO1xuXG4gICAgICAgICAgICAvKiBJZiBhIHRyYWNrIGRvZXNuJ3QgaGF2ZSBhIHN5bWJvbCBmb3IgYSBzdGFydHRpbWUsXG4gICAgICAgICAgICAgKiBhZGQgYSBibGFuayBzeW1ib2wuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGZvcmVhY2ggKGludCBzdGFydCBpbiB3aWR0aHMuU3RhcnRUaW1lcykge1xuXG4gICAgICAgICAgICAgICAgLyogQmFyU3ltYm9scyBhcmUgbm90IGluY2x1ZGVkIGluIHRoZSBTeW1ib2xXaWR0aHMgY2FsY3VsYXRpb25zICovXG4gICAgICAgICAgICAgICAgd2hpbGUgKGkgPCBzeW1ib2xzLkNvdW50ICYmIChzeW1ib2xzW2ldIGlzIEJhclN5bWJvbCkgJiZcbiAgICAgICAgICAgICAgICAgICAgc3ltYm9sc1tpXS5TdGFydFRpbWUgPD0gc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LkFkZChzeW1ib2xzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChpIDwgc3ltYm9scy5Db3VudCAmJiBzeW1ib2xzW2ldLlN0YXJ0VGltZSA9PSBzdGFydCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgc3ltYm9scy5Db3VudCAmJiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHN5bWJvbHNbaV0uU3RhcnRUaW1lID09IHN0YXJ0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5BZGQoc3ltYm9sc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5BZGQobmV3IEJsYW5rU3ltYm9sKHN0YXJ0LCAwKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBGb3IgZWFjaCBzdGFydHRpbWUsIGluY3JlYXNlIHRoZSBzeW1ib2wgd2lkdGggYnlcbiAgICAgICAgICAgICAqIFN5bWJvbFdpZHRocy5HZXRFeHRyYVdpZHRoKCkuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGkgPSAwO1xuICAgICAgICAgICAgd2hpbGUgKGkgPCByZXN1bHQuQ291bnQpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0W2ldIGlzIEJhclN5bWJvbCkge1xuICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbnQgc3RhcnQgPSByZXN1bHRbaV0uU3RhcnRUaW1lO1xuICAgICAgICAgICAgICAgIGludCBleHRyYSA9IHdpZHRocy5HZXRFeHRyYVdpZHRoKHRyYWNrLCBzdGFydCk7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2ldLldpZHRoICs9IGV4dHJhO1xuXG4gICAgICAgICAgICAgICAgLyogU2tpcCBhbGwgcmVtYWluaW5nIHN5bWJvbHMgd2l0aCB0aGUgc2FtZSBzdGFydHRpbWUuICovXG4gICAgICAgICAgICAgICAgd2hpbGUgKGkgPCByZXN1bHQuQ291bnQgJiYgcmVzdWx0W2ldLlN0YXJ0VGltZSA9PSBzdGFydCkge1xuICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIGFsbHN5bWJvbHNbdHJhY2tdID0gcmVzdWx0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgYm9vbCBJc0Nob3JkKE11c2ljU3ltYm9sIHN5bWJvbCkge1xuICAgICAgICByZXR1cm4gc3ltYm9sIGlzIENob3JkU3ltYm9sO1xuICAgIH1cblxuXG4gICAgLyoqIEZpbmQgMiwgMywgNCwgb3IgNiBjaG9yZCBzeW1ib2xzIHRoYXQgb2NjdXIgY29uc2VjdXRpdmVseSAod2l0aG91dCBhbnlcbiAgICAgKiAgcmVzdHMgb3IgYmFycyBpbiBiZXR3ZWVuKS4gIFRoZXJlIGNhbiBiZSBCbGFua1N5bWJvbHMgaW4gYmV0d2Vlbi5cbiAgICAgKlxuICAgICAqICBUaGUgc3RhcnRJbmRleCBpcyB0aGUgaW5kZXggaW4gdGhlIHN5bWJvbHMgdG8gc3RhcnQgbG9va2luZyBmcm9tLlxuICAgICAqXG4gICAgICogIFN0b3JlIHRoZSBpbmRleGVzIG9mIHRoZSBjb25zZWN1dGl2ZSBjaG9yZHMgaW4gY2hvcmRJbmRleGVzLlxuICAgICAqICBTdG9yZSB0aGUgaG9yaXpvbnRhbCBkaXN0YW5jZSAocGl4ZWxzKSBiZXR3ZWVuIHRoZSBmaXJzdCBhbmQgbGFzdCBjaG9yZC5cbiAgICAgKiAgSWYgd2UgZmFpbGVkIHRvIGZpbmQgY29uc2VjdXRpdmUgY2hvcmRzLCByZXR1cm4gZmFsc2UuXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgYm9vbFxuICAgIEZpbmRDb25zZWN1dGl2ZUNob3JkcyhMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzLCBUaW1lU2lnbmF0dXJlIHRpbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGludCBzdGFydEluZGV4LCBpbnRbXSBjaG9yZEluZGV4ZXMsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICByZWYgaW50IGhvcml6RGlzdGFuY2UpIHtcblxuICAgICAgICBpbnQgaSA9IHN0YXJ0SW5kZXg7XG4gICAgICAgIGludCBudW1DaG9yZHMgPSBjaG9yZEluZGV4ZXMuTGVuZ3RoO1xuXG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBob3JpekRpc3RhbmNlID0gMDtcblxuICAgICAgICAgICAgLyogRmluZCB0aGUgc3RhcnRpbmcgY2hvcmQgKi9cbiAgICAgICAgICAgIHdoaWxlIChpIDwgc3ltYm9scy5Db3VudCAtIG51bUNob3Jkcykge1xuICAgICAgICAgICAgICAgIGlmIChzeW1ib2xzW2ldIGlzIENob3JkU3ltYm9sKSB7XG4gICAgICAgICAgICAgICAgICAgIENob3JkU3ltYm9sIGMgPSAoQ2hvcmRTeW1ib2wpIHN5bWJvbHNbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChjLlN0ZW0gIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGkgPj0gc3ltYm9scy5Db3VudCAtIG51bUNob3Jkcykge1xuICAgICAgICAgICAgICAgIGNob3JkSW5kZXhlc1swXSA9IC0xO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNob3JkSW5kZXhlc1swXSA9IGk7XG4gICAgICAgICAgICBib29sIGZvdW5kQ2hvcmRzID0gdHJ1ZTtcbiAgICAgICAgICAgIGZvciAoaW50IGNob3JkSW5kZXggPSAxOyBjaG9yZEluZGV4IDwgbnVtQ2hvcmRzOyBjaG9yZEluZGV4KyspIHtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgaW50IHJlbWFpbmluZyA9IG51bUNob3JkcyAtIDEgLSBjaG9yZEluZGV4O1xuICAgICAgICAgICAgICAgIHdoaWxlICgoaSA8IHN5bWJvbHMuQ291bnQgLSByZW1haW5pbmcpICYmIChzeW1ib2xzW2ldIGlzIEJsYW5rU3ltYm9sKSkge1xuICAgICAgICAgICAgICAgICAgICBob3JpekRpc3RhbmNlICs9IHN5bWJvbHNbaV0uV2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGkgPj0gc3ltYm9scy5Db3VudCAtIHJlbWFpbmluZykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghKHN5bWJvbHNbaV0gaXMgQ2hvcmRTeW1ib2wpKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvdW5kQ2hvcmRzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjaG9yZEluZGV4ZXNbY2hvcmRJbmRleF0gPSBpO1xuICAgICAgICAgICAgICAgIGhvcml6RGlzdGFuY2UgKz0gc3ltYm9sc1tpXS5XaWR0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChmb3VuZENob3Jkcykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBFbHNlLCBzdGFydCBzZWFyY2hpbmcgYWdhaW4gZnJvbSBpbmRleCBpICovXG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIC8qKiBDb25uZWN0IGNob3JkcyBvZiB0aGUgc2FtZSBkdXJhdGlvbiB3aXRoIGEgaG9yaXpvbnRhbCBiZWFtLlxuICAgICAqICBudW1DaG9yZHMgaXMgdGhlIG51bWJlciBvZiBjaG9yZHMgcGVyIGJlYW0gKDIsIDMsIDQsIG9yIDYpLlxuICAgICAqICBpZiBzdGFydEJlYXQgaXMgdHJ1ZSwgdGhlIGZpcnN0IGNob3JkIG11c3Qgc3RhcnQgb24gYSBxdWFydGVyIG5vdGUgYmVhdC5cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyB2b2lkXG4gICAgQ3JlYXRlQmVhbWVkQ2hvcmRzKExpc3Q8TXVzaWNTeW1ib2w+W10gYWxsc3ltYm9scywgVGltZVNpZ25hdHVyZSB0aW1lLFxuICAgICAgICAgICAgICAgICAgICAgICBpbnQgbnVtQ2hvcmRzLCBib29sIHN0YXJ0QmVhdCkge1xuICAgICAgICBpbnRbXSBjaG9yZEluZGV4ZXMgPSBuZXcgaW50W251bUNob3Jkc107XG4gICAgICAgIENob3JkU3ltYm9sW10gY2hvcmRzID0gbmV3IENob3JkU3ltYm9sW251bUNob3Jkc107XG5cbiAgICAgICAgZm9yZWFjaCAoTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scyBpbiBhbGxzeW1ib2xzKSB7XG4gICAgICAgICAgICBpbnQgc3RhcnRJbmRleCA9IDA7XG4gICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgICAgIGludCBob3JpekRpc3RhbmNlID0gMDtcbiAgICAgICAgICAgICAgICBib29sIGZvdW5kID0gRmluZENvbnNlY3V0aXZlQ2hvcmRzKHN5bWJvbHMsIHRpbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydEluZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hvcmRJbmRleGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmIGhvcml6RGlzdGFuY2UpO1xuICAgICAgICAgICAgICAgIGlmICghZm91bmQpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgbnVtQ2hvcmRzOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgY2hvcmRzW2ldID0gKENob3JkU3ltYm9sKXN5bWJvbHNbIGNob3JkSW5kZXhlc1tpXSBdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChDaG9yZFN5bWJvbC5DYW5DcmVhdGVCZWFtKGNob3JkcywgdGltZSwgc3RhcnRCZWF0KSkge1xuICAgICAgICAgICAgICAgICAgICBDaG9yZFN5bWJvbC5DcmVhdGVCZWFtKGNob3JkcywgaG9yaXpEaXN0YW5jZSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0SW5kZXggPSBjaG9yZEluZGV4ZXNbbnVtQ2hvcmRzLTFdICsgMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0SW5kZXggPSBjaG9yZEluZGV4ZXNbMF0gKyAxO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8qIFdoYXQgaXMgdGhlIHZhbHVlIG9mIHN0YXJ0SW5kZXggaGVyZT9cbiAgICAgICAgICAgICAgICAgKiBJZiB3ZSBjcmVhdGVkIGEgYmVhbSwgd2Ugc3RhcnQgYWZ0ZXIgdGhlIGxhc3QgY2hvcmQuXG4gICAgICAgICAgICAgICAgICogSWYgd2UgZmFpbGVkIHRvIGNyZWF0ZSBhIGJlYW0sIHdlIHN0YXJ0IGFmdGVyIHRoZSBmaXJzdCBjaG9yZC5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLyoqIENvbm5lY3QgY2hvcmRzIG9mIHRoZSBzYW1lIGR1cmF0aW9uIHdpdGggYSBob3Jpem9udGFsIGJlYW0uXG4gICAgICpcbiAgICAgKiAgV2UgY3JlYXRlIGJlYW1zIGluIHRoZSBmb2xsb3dpbmcgb3JkZXI6XG4gICAgICogIC0gNiBjb25uZWN0ZWQgOHRoIG5vdGUgY2hvcmRzLCBpbiAzLzQsIDYvOCwgb3IgNi80IHRpbWVcbiAgICAgKiAgLSBUcmlwbGV0cyB0aGF0IHN0YXJ0IG9uIHF1YXJ0ZXIgbm90ZSBiZWF0c1xuICAgICAqICAtIDMgY29ubmVjdGVkIGNob3JkcyB0aGF0IHN0YXJ0IG9uIHF1YXJ0ZXIgbm90ZSBiZWF0cyAoMTIvOCB0aW1lIG9ubHkpXG4gICAgICogIC0gNCBjb25uZWN0ZWQgY2hvcmRzIHRoYXQgc3RhcnQgb24gcXVhcnRlciBub3RlIGJlYXRzICg0LzQgb3IgMi80IHRpbWUgb25seSlcbiAgICAgKiAgLSAyIGNvbm5lY3RlZCBjaG9yZHMgdGhhdCBzdGFydCBvbiBxdWFydGVyIG5vdGUgYmVhdHNcbiAgICAgKiAgLSAyIGNvbm5lY3RlZCBjaG9yZHMgdGhhdCBzdGFydCBvbiBhbnkgYmVhdFxuICAgICAqLyBcbiAgICBwcml2YXRlIHN0YXRpYyB2b2lkXG4gICAgQ3JlYXRlQWxsQmVhbWVkQ2hvcmRzKExpc3Q8TXVzaWNTeW1ib2w+W10gYWxsc3ltYm9scywgVGltZVNpZ25hdHVyZSB0aW1lKSB7XG4gICAgICAgIGlmICgodGltZS5OdW1lcmF0b3IgPT0gMyAmJiB0aW1lLkRlbm9taW5hdG9yID09IDQpIHx8XG4gICAgICAgICAgICAodGltZS5OdW1lcmF0b3IgPT0gNiAmJiB0aW1lLkRlbm9taW5hdG9yID09IDgpIHx8XG4gICAgICAgICAgICAodGltZS5OdW1lcmF0b3IgPT0gNiAmJiB0aW1lLkRlbm9taW5hdG9yID09IDQpICkge1xuXG4gICAgICAgICAgICBDcmVhdGVCZWFtZWRDaG9yZHMoYWxsc3ltYm9scywgdGltZSwgNiwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgQ3JlYXRlQmVhbWVkQ2hvcmRzKGFsbHN5bWJvbHMsIHRpbWUsIDMsIHRydWUpO1xuICAgICAgICBDcmVhdGVCZWFtZWRDaG9yZHMoYWxsc3ltYm9scywgdGltZSwgNCwgdHJ1ZSk7XG4gICAgICAgIENyZWF0ZUJlYW1lZENob3JkcyhhbGxzeW1ib2xzLCB0aW1lLCAyLCB0cnVlKTtcbiAgICAgICAgQ3JlYXRlQmVhbWVkQ2hvcmRzKGFsbHN5bWJvbHMsIHRpbWUsIDIsIGZhbHNlKTtcbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSB3aWR0aCAoaW4gcGl4ZWxzKSBuZWVkZWQgdG8gZGlzcGxheSB0aGUga2V5IHNpZ25hdHVyZSAqL1xuICAgIHB1YmxpYyBzdGF0aWMgaW50XG4gICAgS2V5U2lnbmF0dXJlV2lkdGgoS2V5U2lnbmF0dXJlIGtleSkge1xuICAgICAgICBDbGVmU3ltYm9sIGNsZWZzeW0gPSBuZXcgQ2xlZlN5bWJvbChDbGVmLlRyZWJsZSwgMCwgZmFsc2UpO1xuICAgICAgICBpbnQgcmVzdWx0ID0gY2xlZnN5bS5NaW5XaWR0aDtcbiAgICAgICAgQWNjaWRTeW1ib2xbXSBrZXlzID0ga2V5LkdldFN5bWJvbHMoQ2xlZi5UcmVibGUpO1xuICAgICAgICBmb3JlYWNoIChBY2NpZFN5bWJvbCBzeW1ib2wgaW4ga2V5cykge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHN5bWJvbC5NaW5XaWR0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0ICsgU2hlZXRNdXNpYy5MZWZ0TWFyZ2luICsgNTtcbiAgICB9XG5cblxuICAgIC8qKiBHaXZlbiBNdXNpY1N5bWJvbHMgZm9yIGEgdHJhY2ssIGNyZWF0ZSB0aGUgc3RhZmZzIGZvciB0aGF0IHRyYWNrLlxuICAgICAqICBFYWNoIFN0YWZmIGhhcyBhIG1heG1pbXVtIHdpZHRoIG9mIFBhZ2VXaWR0aCAoODAwIHBpeGVscykuXG4gICAgICogIEFsc28sIG1lYXN1cmVzIHNob3VsZCBub3Qgc3BhbiBtdWx0aXBsZSBTdGFmZnMuXG4gICAgICovXG4gICAgcHJpdmF0ZSBMaXN0PFN0YWZmPiBcbiAgICBDcmVhdGVTdGFmZnNGb3JUcmFjayhMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzLCBpbnQgbWVhc3VyZWxlbiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgS2V5U2lnbmF0dXJlIGtleSwgTWlkaU9wdGlvbnMgb3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICBpbnQgdHJhY2ssIGludCB0b3RhbHRyYWNrcykge1xuICAgICAgICBpbnQga2V5c2lnV2lkdGggPSBLZXlTaWduYXR1cmVXaWR0aChrZXkpO1xuICAgICAgICBpbnQgc3RhcnRpbmRleCA9IDA7XG4gICAgICAgIExpc3Q8U3RhZmY+IHRoZXN0YWZmcyA9IG5ldyBMaXN0PFN0YWZmPihzeW1ib2xzLkNvdW50IC8gNTApO1xuXG4gICAgICAgIHdoaWxlIChzdGFydGluZGV4IDwgc3ltYm9scy5Db3VudCkge1xuICAgICAgICAgICAgLyogc3RhcnRpbmRleCBpcyB0aGUgaW5kZXggb2YgdGhlIGZpcnN0IHN5bWJvbCBpbiB0aGUgc3RhZmYuXG4gICAgICAgICAgICAgKiBlbmRpbmRleCBpcyB0aGUgaW5kZXggb2YgdGhlIGxhc3Qgc3ltYm9sIGluIHRoZSBzdGFmZi5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaW50IGVuZGluZGV4ID0gc3RhcnRpbmRleDtcbiAgICAgICAgICAgIGludCB3aWR0aCA9IGtleXNpZ1dpZHRoO1xuICAgICAgICAgICAgaW50IG1heHdpZHRoO1xuXG4gICAgICAgICAgICAvKiBJZiB3ZSdyZSBzY3JvbGxpbmcgdmVydGljYWxseSwgdGhlIG1heGltdW0gd2lkdGggaXMgUGFnZVdpZHRoLiAqL1xuICAgICAgICAgICAgaWYgKHNjcm9sbFZlcnQpIHtcbiAgICAgICAgICAgICAgICBtYXh3aWR0aCA9IFNoZWV0TXVzaWMuUGFnZVdpZHRoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbWF4d2lkdGggPSAyMDAwMDAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB3aGlsZSAoZW5kaW5kZXggPCBzeW1ib2xzLkNvdW50ICYmXG4gICAgICAgICAgICAgICAgICAgd2lkdGggKyBzeW1ib2xzW2VuZGluZGV4XS5XaWR0aCA8IG1heHdpZHRoKSB7XG5cbiAgICAgICAgICAgICAgICB3aWR0aCArPSBzeW1ib2xzW2VuZGluZGV4XS5XaWR0aDtcbiAgICAgICAgICAgICAgICBlbmRpbmRleCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZW5kaW5kZXgtLTtcblxuICAgICAgICAgICAgLyogVGhlcmUncyAzIHBvc3NpYmlsaXRpZXMgYXQgdGhpcyBwb2ludDpcbiAgICAgICAgICAgICAqIDEuIFdlIGhhdmUgYWxsIHRoZSBzeW1ib2xzIGluIHRoZSB0cmFjay5cbiAgICAgICAgICAgICAqICAgIFRoZSBlbmRpbmRleCBzdGF5cyB0aGUgc2FtZS5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiAyLiBXZSBoYXZlIHN5bWJvbHMgZm9yIGxlc3MgdGhhbiBvbmUgbWVhc3VyZS5cbiAgICAgICAgICAgICAqICAgIFRoZSBlbmRpbmRleCBzdGF5cyB0aGUgc2FtZS5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiAzLiBXZSBoYXZlIHN5bWJvbHMgZm9yIDEgb3IgbW9yZSBtZWFzdXJlcy5cbiAgICAgICAgICAgICAqICAgIFNpbmNlIG1lYXN1cmVzIGNhbm5vdCBzcGFuIG11bHRpcGxlIHN0YWZmcywgd2UgbXVzdFxuICAgICAgICAgICAgICogICAgbWFrZSBzdXJlIGVuZGluZGV4IGRvZXMgbm90IG9jY3VyIGluIHRoZSBtaWRkbGUgb2YgYVxuICAgICAgICAgICAgICogICAgbWVhc3VyZS4gIFdlIGNvdW50IGJhY2t3YXJkcyB1bnRpbCB3ZSBjb21lIHRvIHRoZSBlbmRcbiAgICAgICAgICAgICAqICAgIG9mIGEgbWVhc3VyZS5cbiAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICBpZiAoZW5kaW5kZXggPT0gc3ltYm9scy5Db3VudCAtIDEpIHtcbiAgICAgICAgICAgICAgICAvKiBlbmRpbmRleCBzdGF5cyB0aGUgc2FtZSAqL1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc3ltYm9sc1tzdGFydGluZGV4XS5TdGFydFRpbWUgLyBtZWFzdXJlbGVuID09XG4gICAgICAgICAgICAgICAgICAgICBzeW1ib2xzW2VuZGluZGV4XS5TdGFydFRpbWUgLyBtZWFzdXJlbGVuKSB7XG4gICAgICAgICAgICAgICAgLyogZW5kaW5kZXggc3RheXMgdGhlIHNhbWUgKi9cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGludCBlbmRtZWFzdXJlID0gc3ltYm9sc1tlbmRpbmRleCsxXS5TdGFydFRpbWUvbWVhc3VyZWxlbjtcbiAgICAgICAgICAgICAgICB3aGlsZSAoc3ltYm9sc1tlbmRpbmRleF0uU3RhcnRUaW1lIC8gbWVhc3VyZWxlbiA9PSBcbiAgICAgICAgICAgICAgICAgICAgICAgZW5kbWVhc3VyZSkge1xuICAgICAgICAgICAgICAgICAgICBlbmRpbmRleC0tO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGludCByYW5nZSA9IGVuZGluZGV4ICsgMSAtIHN0YXJ0aW5kZXg7XG4gICAgICAgICAgICBpZiAoc2Nyb2xsVmVydCkge1xuICAgICAgICAgICAgICAgIHdpZHRoID0gU2hlZXRNdXNpYy5QYWdlV2lkdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBTdGFmZiBzdGFmZiA9IG5ldyBTdGFmZihzeW1ib2xzLkdldFJhbmdlKHN0YXJ0aW5kZXgsIHJhbmdlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleSwgb3B0aW9ucywgdHJhY2ssIHRvdGFsdHJhY2tzKTtcbiAgICAgICAgICAgIHRoZXN0YWZmcy5BZGQoc3RhZmYpO1xuICAgICAgICAgICAgc3RhcnRpbmRleCA9IGVuZGluZGV4ICsgMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhlc3RhZmZzO1xuICAgIH1cblxuXG4gICAgLyoqIEdpdmVuIGFsbCB0aGUgTXVzaWNTeW1ib2xzIGZvciBldmVyeSB0cmFjaywgY3JlYXRlIHRoZSBzdGFmZnNcbiAgICAgKiBmb3IgdGhlIHNoZWV0IG11c2ljLiAgVGhlcmUgYXJlIHR3byBwYXJ0cyB0byB0aGlzOlxuICAgICAqXG4gICAgICogLSBHZXQgdGhlIGxpc3Qgb2Ygc3RhZmZzIGZvciBlYWNoIHRyYWNrLlxuICAgICAqICAgVGhlIHN0YWZmcyB3aWxsIGJlIHN0b3JlZCBpbiB0cmFja3N0YWZmcyBhczpcbiAgICAgKlxuICAgICAqICAgdHJhY2tzdGFmZnNbMF0gPSB7IFN0YWZmMCwgU3RhZmYxLCBTdGFmZjIsIC4uLiB9IGZvciB0cmFjayAwXG4gICAgICogICB0cmFja3N0YWZmc1sxXSA9IHsgU3RhZmYwLCBTdGFmZjEsIFN0YWZmMiwgLi4uIH0gZm9yIHRyYWNrIDFcbiAgICAgKiAgIHRyYWNrc3RhZmZzWzJdID0geyBTdGFmZjAsIFN0YWZmMSwgU3RhZmYyLCAuLi4gfSBmb3IgdHJhY2sgMlxuICAgICAqXG4gICAgICogLSBTdG9yZSB0aGUgU3RhZmZzIGluIHRoZSBzdGFmZnMgbGlzdCwgYnV0IGludGVybGVhdmUgdGhlXG4gICAgICogICB0cmFja3MgYXMgZm9sbG93czpcbiAgICAgKlxuICAgICAqICAgc3RhZmZzID0geyBTdGFmZjAgZm9yIHRyYWNrIDAsIFN0YWZmMCBmb3IgdHJhY2sxLCBTdGFmZjAgZm9yIHRyYWNrMixcbiAgICAgKiAgICAgICAgICAgICAgU3RhZmYxIGZvciB0cmFjayAwLCBTdGFmZjEgZm9yIHRyYWNrMSwgU3RhZmYxIGZvciB0cmFjazIsXG4gICAgICogICAgICAgICAgICAgIFN0YWZmMiBmb3IgdHJhY2sgMCwgU3RhZmYyIGZvciB0cmFjazEsIFN0YWZmMiBmb3IgdHJhY2syLFxuICAgICAqICAgICAgICAgICAgICAuLi4gfSBcbiAgICAgKi9cbiAgICBwcml2YXRlIExpc3Q8U3RhZmY+IFxuICAgIENyZWF0ZVN0YWZmcyhMaXN0PE11c2ljU3ltYm9sPltdIGFsbHN5bWJvbHMsIEtleVNpZ25hdHVyZSBrZXksIFxuICAgICAgICAgICAgICAgICBNaWRpT3B0aW9ucyBvcHRpb25zLCBpbnQgbWVhc3VyZWxlbikge1xuXG4gICAgICAgIExpc3Q8U3RhZmY+W10gdHJhY2tzdGFmZnMgPSBuZXcgTGlzdDxTdGFmZj5bIGFsbHN5bWJvbHMuTGVuZ3RoIF07XG4gICAgICAgIGludCB0b3RhbHRyYWNrcyA9IHRyYWNrc3RhZmZzLkxlbmd0aDtcblxuICAgICAgICBmb3IgKGludCB0cmFjayA9IDA7IHRyYWNrIDwgdG90YWx0cmFja3M7IHRyYWNrKyspIHtcbiAgICAgICAgICAgIExpc3Q8TXVzaWNTeW1ib2w+IHN5bWJvbHMgPSBhbGxzeW1ib2xzWyB0cmFjayBdO1xuICAgICAgICAgICAgdHJhY2tzdGFmZnNbdHJhY2tdID0gQ3JlYXRlU3RhZmZzRm9yVHJhY2soc3ltYm9scywgbWVhc3VyZWxlbiwga2V5LCBvcHRpb25zLCB0cmFjaywgdG90YWx0cmFja3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogVXBkYXRlIHRoZSBFbmRUaW1lIG9mIGVhY2ggU3RhZmYuIEVuZFRpbWUgaXMgdXNlZCBmb3IgcGxheWJhY2sgKi9cbiAgICAgICAgZm9yZWFjaCAoTGlzdDxTdGFmZj4gbGlzdCBpbiB0cmFja3N0YWZmcykge1xuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBsaXN0LkNvdW50LTE7IGkrKykge1xuICAgICAgICAgICAgICAgIGxpc3RbaV0uRW5kVGltZSA9IGxpc3RbaSsxXS5TdGFydFRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBJbnRlcmxlYXZlIHRoZSBzdGFmZnMgb2YgZWFjaCB0cmFjayBpbnRvIHRoZSByZXN1bHQgYXJyYXkuICovXG4gICAgICAgIGludCBtYXhzdGFmZnMgPSAwO1xuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHRyYWNrc3RhZmZzLkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAobWF4c3RhZmZzIDwgdHJhY2tzdGFmZnNbaV0uQ291bnQpIHtcbiAgICAgICAgICAgICAgICBtYXhzdGFmZnMgPSB0cmFja3N0YWZmc1tpXS5Db3VudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBMaXN0PFN0YWZmPiByZXN1bHQgPSBuZXcgTGlzdDxTdGFmZj4obWF4c3RhZmZzICogdHJhY2tzdGFmZnMuTGVuZ3RoKTtcbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBtYXhzdGFmZnM7IGkrKykge1xuICAgICAgICAgICAgZm9yZWFjaCAoTGlzdDxTdGFmZj4gbGlzdCBpbiB0cmFja3N0YWZmcykge1xuICAgICAgICAgICAgICAgIGlmIChpIDwgbGlzdC5Db3VudCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQuQWRkKGxpc3RbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIGx5cmljcyBmb3IgZWFjaCB0cmFjayAqL1xuICAgIHByaXZhdGUgc3RhdGljIExpc3Q8THlyaWNTeW1ib2w+W11cbiAgICBHZXRMeXJpY3MoTGlzdDxNaWRpVHJhY2s+IHRyYWNrcykge1xuICAgICAgICBib29sIGhhc0x5cmljcyA9IGZhbHNlO1xuICAgICAgICBMaXN0PEx5cmljU3ltYm9sPltdIHJlc3VsdCA9IG5ldyBMaXN0PEx5cmljU3ltYm9sPlt0cmFja3MuQ291bnRdO1xuICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgdHJhY2tzLkNvdW50OyB0cmFja251bSsrKSB7XG4gICAgICAgICAgICBNaWRpVHJhY2sgdHJhY2sgPSB0cmFja3NbdHJhY2tudW1dO1xuICAgICAgICAgICAgaWYgKHRyYWNrLkx5cmljcyA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBoYXNMeXJpY3MgPSB0cnVlO1xuICAgICAgICAgICAgcmVzdWx0W3RyYWNrbnVtXSA9IG5ldyBMaXN0PEx5cmljU3ltYm9sPigpO1xuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaUV2ZW50IGV2IGluIHRyYWNrLkx5cmljcykge1xuICAgICAgICAgICAgICAgIFN0cmluZyB0ZXh0ID0gVVRGOEVuY29kaW5nLlVURjguR2V0U3RyaW5nKGV2LlZhbHVlLCAwLCBldi5WYWx1ZS5MZW5ndGgpO1xuICAgICAgICAgICAgICAgIEx5cmljU3ltYm9sIHN5bSA9IG5ldyBMeXJpY1N5bWJvbChldi5TdGFydFRpbWUsIHRleHQpO1xuICAgICAgICAgICAgICAgIHJlc3VsdFt0cmFja251bV0uQWRkKHN5bSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFoYXNMeXJpY3MpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBBZGQgdGhlIGx5cmljIHN5bWJvbHMgdG8gdGhlIGNvcnJlc3BvbmRpbmcgc3RhZmZzICovXG4gICAgc3RhdGljIHZvaWRcbiAgICBBZGRMeXJpY3NUb1N0YWZmcyhMaXN0PFN0YWZmPiBzdGFmZnMsIExpc3Q8THlyaWNTeW1ib2w+W10gdHJhY2tseXJpY3MpIHtcbiAgICAgICAgZm9yZWFjaCAoU3RhZmYgc3RhZmYgaW4gc3RhZmZzKSB7XG4gICAgICAgICAgICBMaXN0PEx5cmljU3ltYm9sPiBseXJpY3MgPSB0cmFja2x5cmljc1tzdGFmZi5UcmFja107XG4gICAgICAgICAgICBzdGFmZi5BZGRMeXJpY3MobHlyaWNzKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLyoqIFNldCB0aGUgem9vbSBsZXZlbCB0byBkaXNwbGF5IGF0ICgxLjAgPT0gMTAwJSkuXG4gICAgICogUmVjYWxjdWxhdGUgdGhlIFNoZWV0TXVzaWMgd2lkdGggYW5kIGhlaWdodCBiYXNlZCBvbiB0aGVcbiAgICAgKiB6b29tIGxldmVsLiAgVGhlbiByZWRyYXcgdGhlIFNoZWV0TXVzaWMuIFxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIFNldFpvb20oZmxvYXQgdmFsdWUpIHtcbiAgICAgICAgem9vbSA9IHZhbHVlO1xuICAgICAgICBmbG9hdCB3aWR0aCA9IDA7XG4gICAgICAgIGZsb2F0IGhlaWdodCA9IDA7XG4gICAgICAgIGZvcmVhY2ggKFN0YWZmIHN0YWZmIGluIHN0YWZmcykge1xuICAgICAgICAgICAgd2lkdGggPSBNYXRoLk1heCh3aWR0aCwgc3RhZmYuV2lkdGggKiB6b29tKTtcbiAgICAgICAgICAgIGhlaWdodCArPSAoc3RhZmYuSGVpZ2h0ICogem9vbSk7XG4gICAgICAgIH1cbiAgICAgICAgV2lkdGggPSAoaW50KSh3aWR0aCArIDIpO1xuICAgICAgICBIZWlnaHQgPSAoKGludCloZWlnaHQpICsgTGVmdE1hcmdpbjtcbiAgICAgICAgdGhpcy5JbnZhbGlkYXRlKCk7XG4gICAgfVxuXG4gICAgLyoqIENoYW5nZSB0aGUgbm90ZSBjb2xvcnMgZm9yIHRoZSBzaGVldCBtdXNpYywgYW5kIHJlZHJhdy4gKi9cbiAgICBwcml2YXRlIHZvaWQgU2V0Q29sb3JzKENvbG9yW10gbmV3Y29sb3JzLCBDb2xvciBuZXdzaGFkZSwgQ29sb3IgbmV3c2hhZGUyKSB7XG4gICAgICAgIGlmIChOb3RlQ29sb3JzID09IG51bGwpIHtcbiAgICAgICAgICAgIE5vdGVDb2xvcnMgPSBuZXcgQ29sb3JbMTJdO1xuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCAxMjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgTm90ZUNvbG9yc1tpXSA9IENvbG9yLkJsYWNrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChuZXdjb2xvcnMgIT0gbnVsbCkge1xuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCAxMjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgTm90ZUNvbG9yc1tpXSA9IG5ld2NvbG9yc1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgMTI7IGkrKykge1xuICAgICAgICAgICAgICAgIE5vdGVDb2xvcnNbaV0gPSBDb2xvci5CbGFjaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoc2hhZGVCcnVzaCAhPSBudWxsKSB7XG4gICAgICAgICAgICBzaGFkZUJydXNoLkRpc3Bvc2UoKTsgXG4gICAgICAgICAgICBzaGFkZTJCcnVzaC5EaXNwb3NlKCk7IFxuICAgICAgICB9XG4gICAgICAgIHNoYWRlQnJ1c2ggPSBuZXcgU29saWRCcnVzaChuZXdzaGFkZSk7XG4gICAgICAgIHNoYWRlMkJydXNoID0gbmV3IFNvbGlkQnJ1c2gobmV3c2hhZGUyKTtcbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBjb2xvciBmb3IgYSBnaXZlbiBub3RlIG51bWJlciAqL1xuICAgIHB1YmxpYyBDb2xvciBOb3RlQ29sb3IoaW50IG51bWJlcikge1xuICAgICAgICByZXR1cm4gTm90ZUNvbG9yc1sgTm90ZVNjYWxlLkZyb21OdW1iZXIobnVtYmVyKSBdO1xuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIHNoYWRlIGJydXNoICovXG4gICAgcHVibGljIEJydXNoIFNoYWRlQnJ1c2gge1xuICAgICAgICBnZXQgeyByZXR1cm4gc2hhZGVCcnVzaDsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIHNoYWRlMiBicnVzaCAqL1xuICAgIHB1YmxpYyBCcnVzaCBTaGFkZTJCcnVzaCB7XG4gICAgICAgIGdldCB7IHJldHVybiBzaGFkZTJCcnVzaDsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgd2hldGhlciB0byBzaG93IG5vdGUgbGV0dGVycyBvciBub3QgKi9cbiAgICBwdWJsaWMgaW50IFNob3dOb3RlTGV0dGVycyB7XG4gICAgICAgIGdldCB7IHJldHVybiBzaG93Tm90ZUxldHRlcnM7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBtYWluIGtleSBzaWduYXR1cmUgKi9cbiAgICBwdWJsaWMgS2V5U2lnbmF0dXJlIE1haW5LZXkge1xuICAgICAgICBnZXQgeyByZXR1cm4gbWFpbmtleTsgfVxuICAgIH1cblxuXG4gICAgLyoqIFNldCB0aGUgc2l6ZSBvZiB0aGUgbm90ZXMsIGxhcmdlIG9yIHNtYWxsLiAgU21hbGxlciBub3RlcyBtZWFuc1xuICAgICAqIG1vcmUgbm90ZXMgcGVyIHN0YWZmLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBTZXROb3RlU2l6ZShib29sIGxhcmdlbm90ZXMpIHtcbiAgICAgICAgaWYgKGxhcmdlbm90ZXMpXG4gICAgICAgICAgICBMaW5lU3BhY2UgPSA3O1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBMaW5lU3BhY2UgPSA1O1xuXG4gICAgICAgIFN0YWZmSGVpZ2h0ID0gTGluZVNwYWNlKjQgKyBMaW5lV2lkdGgqNTtcbiAgICAgICAgTm90ZUhlaWdodCA9IExpbmVTcGFjZSArIExpbmVXaWR0aDtcbiAgICAgICAgTm90ZVdpZHRoID0gMyAqIExpbmVTcGFjZSAvIDI7XG4gICAgICAgIExldHRlckZvbnQgPSBuZXcgRm9udChcIkFyaWFsXCIsIDgsIEZvbnRTdHlsZS5SZWd1bGFyKTtcbiAgICB9XG5cblxuICAgIC8qKiBEcmF3IHRoZSBTaGVldE11c2ljLlxuICAgICAqIFNjYWxlIHRoZSBncmFwaGljcyBieSB0aGUgY3VycmVudCB6b29tIGZhY3Rvci5cbiAgICAgKiBHZXQgdGhlIHZlcnRpY2FsIHN0YXJ0IGFuZCBlbmQgcG9pbnRzIG9mIHRoZSBjbGlwIGFyZWEuXG4gICAgICogT25seSBkcmF3IFN0YWZmcyB3aGljaCBsaWUgaW5zaWRlIHRoZSBjbGlwIGFyZWEuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIC8qb3ZlcnJpZGUqLyB2b2lkIE9uUGFpbnQoUGFpbnRFdmVudEFyZ3MgZSkge1xuICAgICAgICBSZWN0YW5nbGUgY2xpcCA9IFxuICAgICAgICAgIG5ldyBSZWN0YW5nbGUoKGludCkgKGUuQ2xpcFJlY3RhbmdsZS5YIC8gem9vbSksXG4gICAgICAgICAgICAgICAgICAgICAgICAoaW50KSAoZS5DbGlwUmVjdGFuZ2xlLlkgLyB6b29tKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIChpbnQpIChlLkNsaXBSZWN0YW5nbGUuV2lkdGggLyB6b29tKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIChpbnQpIChlLkNsaXBSZWN0YW5nbGUuSGVpZ2h0IC8gem9vbSkpO1xuXG4gICAgICAgIEdyYXBoaWNzIGcgPSBlLkdyYXBoaWNzKCk7XG4gICAgICAgIGcuU2NhbGVUcmFuc2Zvcm0oem9vbSwgem9vbSk7XG4gICAgICAgIC8qIGcuUGFnZVNjYWxlID0gem9vbTsgKi9cbiAgICAgICAgZy5TbW9vdGhpbmdNb2RlID0gU21vb3RoaW5nTW9kZS5BbnRpQWxpYXM7XG4gICAgICAgIGludCB5cG9zID0gMDtcbiAgICAgICAgZm9yZWFjaCAoU3RhZmYgc3RhZmYgaW4gc3RhZmZzKSB7XG4gICAgICAgICAgICBpZiAoKHlwb3MgKyBzdGFmZi5IZWlnaHQgPCBjbGlwLlkpIHx8ICh5cG9zID4gY2xpcC5ZICsgY2xpcC5IZWlnaHQpKSAge1xuICAgICAgICAgICAgICAgIC8qIFN0YWZmIGlzIG5vdCBpbiB0aGUgY2xpcCwgZG9uJ3QgbmVlZCB0byBkcmF3IGl0ICovXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgwLCB5cG9zKTtcbiAgICAgICAgICAgICAgICBzdGFmZi5EcmF3KGcsIGNsaXAsIHBlbik7XG4gICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oMCwgLXlwb3MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB5cG9zICs9IHN0YWZmLkhlaWdodDtcbiAgICAgICAgfVxuICAgICAgICBnLlNjYWxlVHJhbnNmb3JtKDEuMGYvem9vbSwgMS4wZi96b29tKTtcbiAgICB9XG5cbiAgICAvKiogV3JpdGUgdGhlIE1JREkgZmlsZW5hbWUgYXQgdGhlIHRvcCBvZiB0aGUgcGFnZSAqL1xuICAgIHByaXZhdGUgdm9pZCBEcmF3VGl0bGUoR3JhcGhpY3MgZykge1xuICAgICAgICBpbnQgbGVmdG1hcmdpbiA9IDIwO1xuICAgICAgICBpbnQgdG9wbWFyZ2luID0gMjA7XG4gICAgICAgIHN0cmluZyB0aXRsZSA9IFBhdGguR2V0RmlsZU5hbWUoZmlsZW5hbWUpO1xuICAgICAgICB0aXRsZSA9IHRpdGxlLlJlcGxhY2UoXCIubWlkXCIsIFwiXCIpLlJlcGxhY2UoXCJfXCIsIFwiIFwiKTtcbiAgICAgICAgRm9udCBmb250ID0gbmV3IEZvbnQoXCJBcmlhbFwiLCAxMCwgRm9udFN0eWxlLkJvbGQpO1xuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybShsZWZ0bWFyZ2luLCB0b3BtYXJnaW4pO1xuICAgICAgICBnLkRyYXdTdHJpbmcodGl0bGUsIGZvbnQsIEJydXNoZXMuQmxhY2ssIDAsIDApO1xuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtbGVmdG1hcmdpbiwgLXRvcG1hcmdpbik7XG4gICAgICAgIGZvbnQuRGlzcG9zZSgpO1xuICAgIH1cblxuICAgIC8qKiBQcmludCB0aGUgZ2l2ZW4gcGFnZSBvZiB0aGUgc2hlZXQgbXVzaWMuIFxuICAgICAqIFBhZ2UgbnVtYmVycyBzdGFydCBmcm9tIDEuXG4gICAgICogQSBzdGFmZiBzaG91bGQgZml0IHdpdGhpbiBhIHNpbmdsZSBwYWdlLCBub3QgYmUgc3BsaXQgYWNyb3NzIHR3byBwYWdlcy5cbiAgICAgKiBJZiB0aGUgc2hlZXQgbXVzaWMgaGFzIGV4YWN0bHkgMiB0cmFja3MsIHRoZW4gdHdvIHN0YWZmcyBzaG91bGRcbiAgICAgKiBmaXQgd2l0aGluIGEgc2luZ2xlIHBhZ2UsIGFuZCBub3QgYmUgc3BsaXQgYWNyb3NzIHR3byBwYWdlcy5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEb1ByaW50KEdyYXBoaWNzIGcsIGludCBwYWdlbnVtYmVyKVxuICAgIHtcbiAgICAgICAgaW50IGxlZnRtYXJnaW4gPSAyMDtcbiAgICAgICAgaW50IHRvcG1hcmdpbiA9IDIwO1xuICAgICAgICBpbnQgcmlnaHRtYXJnaW4gPSAyMDtcbiAgICAgICAgaW50IGJvdHRvbW1hcmdpbiA9IDIwO1xuXG4gICAgICAgIGZsb2F0IHNjYWxlID0gKGcuVmlzaWJsZUNsaXBCb3VuZHMuV2lkdGggLSBsZWZ0bWFyZ2luIC0gcmlnaHRtYXJnaW4pIC8gUGFnZVdpZHRoO1xuICAgICAgICBnLlBhZ2VTY2FsZSA9IHNjYWxlO1xuXG4gICAgICAgIGludCB2aWV3UGFnZUhlaWdodCA9IChpbnQpKCAoZy5WaXNpYmxlQ2xpcEJvdW5kcy5IZWlnaHQgLSB0b3BtYXJnaW4gLSBib3R0b21tYXJnaW4pIC8gc2NhbGUpO1xuXG4gICAgICAgIGcuU21vb3RoaW5nTW9kZSA9IFNtb290aGluZ01vZGUuQW50aUFsaWFzO1xuICAgICAgICBnLkZpbGxSZWN0YW5nbGUoQnJ1c2hlcy5XaGl0ZSwgMCwgMCwgXG4gICAgICAgICAgICAgICAgICAgICAgICBnLlZpc2libGVDbGlwQm91bmRzLldpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgZy5WaXNpYmxlQ2xpcEJvdW5kcy5IZWlnaHQpO1xuXG4gICAgICAgIFJlY3RhbmdsZSBjbGlwID0gbmV3IFJlY3RhbmdsZSgwLCAwLCBQYWdlV2lkdGgsIFBhZ2VIZWlnaHQpO1xuXG4gICAgICAgIGludCB5cG9zID0gVGl0bGVIZWlnaHQ7XG4gICAgICAgIGludCBwYWdlbnVtID0gMTtcbiAgICAgICAgaW50IHN0YWZmbnVtID0gMDtcblxuICAgICAgICBpZiAobnVtdHJhY2tzID09IDIgJiYgKHN0YWZmcy5Db3VudCAlIDIpID09IDApIHtcbiAgICAgICAgICAgIC8qIFNraXAgdGhlIHN0YWZmcyB1bnRpbCB3ZSByZWFjaCB0aGUgZ2l2ZW4gcGFnZSBudW1iZXIgKi9cbiAgICAgICAgICAgIHdoaWxlIChzdGFmZm51bSArIDEgPCBzdGFmZnMuQ291bnQgJiYgcGFnZW51bSA8IHBhZ2VudW1iZXIpIHtcbiAgICAgICAgICAgICAgICBpbnQgaGVpZ2h0cyA9IHN0YWZmc1tzdGFmZm51bV0uSGVpZ2h0ICsgc3RhZmZzW3N0YWZmbnVtKzFdLkhlaWdodDtcbiAgICAgICAgICAgICAgICBpZiAoeXBvcyArIGhlaWdodHMgPj0gdmlld1BhZ2VIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFnZW51bSsrO1xuICAgICAgICAgICAgICAgICAgICB5cG9zID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHlwb3MgKz0gaGVpZ2h0cztcbiAgICAgICAgICAgICAgICAgICAgc3RhZmZudW0gKz0gMjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBQcmludCB0aGUgc3RhZmZzIHVudGlsIHRoZSBoZWlnaHQgcmVhY2hlcyB2aWV3UGFnZUhlaWdodCAqL1xuICAgICAgICAgICAgaWYgKHBhZ2VudW0gPT0gMSkge1xuICAgICAgICAgICAgICAgIERyYXdUaXRsZShnKTtcbiAgICAgICAgICAgICAgICB5cG9zID0gVGl0bGVIZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB5cG9zID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoOyBzdGFmZm51bSArIDEgPCBzdGFmZnMuQ291bnQ7IHN0YWZmbnVtICs9IDIpIHtcbiAgICAgICAgICAgICAgICBpbnQgaGVpZ2h0cyA9IHN0YWZmc1tzdGFmZm51bV0uSGVpZ2h0ICsgc3RhZmZzW3N0YWZmbnVtKzFdLkhlaWdodDtcblxuICAgICAgICAgICAgICAgIGlmICh5cG9zICsgaGVpZ2h0cyA+PSB2aWV3UGFnZUhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybShsZWZ0bWFyZ2luLCB0b3BtYXJnaW4gKyB5cG9zKTtcbiAgICAgICAgICAgICAgICBzdGFmZnNbc3RhZmZudW1dLkRyYXcoZywgY2xpcCwgcGVuKTtcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtbGVmdG1hcmdpbiwgLSh0b3BtYXJnaW4gKyB5cG9zKSk7XG4gICAgICAgICAgICAgICAgeXBvcyArPSBzdGFmZnNbc3RhZmZudW1dLkhlaWdodDtcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybShsZWZ0bWFyZ2luLCB0b3BtYXJnaW4gKyB5cG9zKTtcbiAgICAgICAgICAgICAgICBzdGFmZnNbc3RhZmZudW0gKyAxXS5EcmF3KGcsIGNsaXAsIHBlbik7XG4gICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLWxlZnRtYXJnaW4sIC0odG9wbWFyZ2luICsgeXBvcykpO1xuICAgICAgICAgICAgICAgIHlwb3MgKz0gc3RhZmZzW3N0YWZmbnVtICsgMV0uSGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvKiBTa2lwIHRoZSBzdGFmZnMgdW50aWwgd2UgcmVhY2ggdGhlIGdpdmVuIHBhZ2UgbnVtYmVyICovXG4gICAgICAgICAgICB3aGlsZSAoc3RhZmZudW0gPCBzdGFmZnMuQ291bnQgJiYgcGFnZW51bSA8IHBhZ2VudW1iZXIpIHtcbiAgICAgICAgICAgICAgICBpZiAoeXBvcyArIHN0YWZmc1tzdGFmZm51bV0uSGVpZ2h0ID49IHZpZXdQYWdlSGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIHBhZ2VudW0rKztcbiAgICAgICAgICAgICAgICAgICAgeXBvcyA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB5cG9zICs9IHN0YWZmc1tzdGFmZm51bV0uSGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBzdGFmZm51bSsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogUHJpbnQgdGhlIHN0YWZmcyB1bnRpbCB0aGUgaGVpZ2h0IHJlYWNoZXMgdmlld1BhZ2VIZWlnaHQgKi9cbiAgICAgICAgICAgIGlmIChwYWdlbnVtID09IDEpIHtcbiAgICAgICAgICAgICAgICBEcmF3VGl0bGUoZyk7XG4gICAgICAgICAgICAgICAgeXBvcyA9IFRpdGxlSGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgeXBvcyA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKDsgc3RhZmZudW0gPCBzdGFmZnMuQ291bnQ7IHN0YWZmbnVtKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoeXBvcyArIHN0YWZmc1tzdGFmZm51bV0uSGVpZ2h0ID49IHZpZXdQYWdlSGVpZ2h0KVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKGxlZnRtYXJnaW4sIHRvcG1hcmdpbiArIHlwb3MpO1xuICAgICAgICAgICAgICAgIHN0YWZmc1tzdGFmZm51bV0uRHJhdyhnLCBjbGlwLCBwZW4pO1xuICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC1sZWZ0bWFyZ2luLCAtKHRvcG1hcmdpbiArIHlwb3MpKTtcbiAgICAgICAgICAgICAgICB5cG9zICs9IHN0YWZmc1tzdGFmZm51bV0uSGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyogRHJhdyB0aGUgcGFnZSBudW1iZXIgKi9cbiAgICAgICAgRm9udCBmb250ID0gbmV3IEZvbnQoXCJBcmlhbFwiLCAxMCwgRm9udFN0eWxlLkJvbGQpO1xuICAgICAgICBnLkRyYXdTdHJpbmcoXCJcIiArIHBhZ2VudW1iZXIsIGZvbnQsIEJydXNoZXMuQmxhY2ssIFxuICAgICAgICAgICAgICAgICAgICAgUGFnZVdpZHRoLWxlZnRtYXJnaW4sIHRvcG1hcmdpbiArIHZpZXdQYWdlSGVpZ2h0IC0gMTIpO1xuICAgICAgICBmb250LkRpc3Bvc2UoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIG51bWJlciBvZiBwYWdlcyBuZWVkZWQgdG8gcHJpbnQgdGhpcyBzaGVldCBtdXNpYy5cbiAgICAgKiBBIHN0YWZmIHNob3VsZCBmaXQgd2l0aGluIGEgc2luZ2xlIHBhZ2UsIG5vdCBiZSBzcGxpdCBhY3Jvc3MgdHdvIHBhZ2VzLlxuICAgICAqIElmIHRoZSBzaGVldCBtdXNpYyBoYXMgZXhhY3RseSAyIHRyYWNrcywgdGhlbiB0d28gc3RhZmZzIHNob3VsZFxuICAgICAqIGZpdCB3aXRoaW4gYSBzaW5nbGUgcGFnZSwgYW5kIG5vdCBiZSBzcGxpdCBhY3Jvc3MgdHdvIHBhZ2VzLlxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgR2V0VG90YWxQYWdlcygpIHtcbiAgICAgICAgaW50IG51bSA9IDE7XG4gICAgICAgIGludCBjdXJyaGVpZ2h0ID0gVGl0bGVIZWlnaHQ7XG5cbiAgICAgICAgaWYgKG51bXRyYWNrcyA9PSAyICYmIChzdGFmZnMuQ291bnQgJSAyKSA9PSAwKSB7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHN0YWZmcy5Db3VudDsgaSArPSAyKSB7XG4gICAgICAgICAgICAgICAgaW50IGhlaWdodHMgPSBzdGFmZnNbaV0uSGVpZ2h0ICsgc3RhZmZzW2krMV0uSGVpZ2h0O1xuICAgICAgICAgICAgICAgIGlmIChjdXJyaGVpZ2h0ICsgaGVpZ2h0cyA+IFBhZ2VIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgbnVtKys7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJoZWlnaHQgPSBoZWlnaHRzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmhlaWdodCArPSBoZWlnaHRzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvcmVhY2ggKFN0YWZmIHN0YWZmIGluIHN0YWZmcykge1xuICAgICAgICAgICAgICAgIGlmIChjdXJyaGVpZ2h0ICsgc3RhZmYuSGVpZ2h0ID4gUGFnZUhlaWdodCkge1xuICAgICAgICAgICAgICAgICAgICBudW0rKztcbiAgICAgICAgICAgICAgICAgICAgY3VycmhlaWdodCA9IHN0YWZmLkhlaWdodDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJoZWlnaHQgKz0gc3RhZmYuSGVpZ2h0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVtO1xuICAgIH1cblxuICAgIC8qKiBTaGFkZSBhbGwgdGhlIGNob3JkcyBwbGF5ZWQgYXQgdGhlIGdpdmVuIHB1bHNlIHRpbWUuXG4gICAgICogIExvb3AgdGhyb3VnaCBhbGwgdGhlIHN0YWZmcyBhbmQgY2FsbCBzdGFmZi5TaGFkZSgpLlxuICAgICAqICBJZiBzY3JvbGxHcmFkdWFsbHkgaXMgdHJ1ZSwgc2Nyb2xsIGdyYWR1YWxseSAoc21vb3RoIHNjcm9sbGluZylcbiAgICAgKiAgdG8gdGhlIHNoYWRlZCBub3Rlcy5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBTaGFkZU5vdGVzKGludCBjdXJyZW50UHVsc2VUaW1lLCBpbnQgcHJldlB1bHNlVGltZSwgYm9vbCBzY3JvbGxHcmFkdWFsbHkpIHtcbiAgICAgICAgR3JhcGhpY3MgZyA9IENyZWF0ZUdyYXBoaWNzKFwic2hhZGVOb3Rlc1wiKTtcbiAgICAgICAgZy5TbW9vdGhpbmdNb2RlID0gU21vb3RoaW5nTW9kZS5BbnRpQWxpYXM7XG4gICAgICAgIGcuU2NhbGVUcmFuc2Zvcm0oem9vbSwgem9vbSk7XG4gICAgICAgIGludCB5cG9zID0gMDtcblxuICAgICAgICBpbnQgeF9zaGFkZSA9IDA7XG4gICAgICAgIGludCB5X3NoYWRlID0gMDtcblxuICAgICAgICBmb3JlYWNoIChTdGFmZiBzdGFmZiBpbiBzdGFmZnMpIHtcbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKDAsIHlwb3MpO1xuICAgICAgICAgICAgc3RhZmYuU2hhZGVOb3RlcyhnLCBzaGFkZUJydXNoLCBwZW4sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50UHVsc2VUaW1lLCBwcmV2UHVsc2VUaW1lLCByZWYgeF9zaGFkZSk7XG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgwLCAteXBvcyk7XG4gICAgICAgICAgICB5cG9zICs9IHN0YWZmLkhlaWdodDtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UHVsc2VUaW1lID49IHN0YWZmLkVuZFRpbWUpIHtcbiAgICAgICAgICAgICAgICB5X3NoYWRlICs9IHN0YWZmLkhlaWdodDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBnLlNjYWxlVHJhbnNmb3JtKDEuMGYvem9vbSwgMS4wZi96b29tKTtcbiAgICAgICAgZy5EaXNwb3NlKCk7XG4gICAgICAgIHhfc2hhZGUgPSAoaW50KSh4X3NoYWRlICogem9vbSk7XG4gICAgICAgIHlfc2hhZGUgLT0gTm90ZUhlaWdodDtcbiAgICAgICAgeV9zaGFkZSA9IChpbnQpKHlfc2hhZGUgKiB6b29tKTtcbiAgICAgICAgaWYgKGN1cnJlbnRQdWxzZVRpbWUgPj0gMCkge1xuICAgICAgICAgICAgU2Nyb2xsVG9TaGFkZWROb3Rlcyh4X3NoYWRlLCB5X3NoYWRlLCBzY3JvbGxHcmFkdWFsbHkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFNjcm9sbCB0aGUgc2hlZXQgbXVzaWMgc28gdGhhdCB0aGUgc2hhZGVkIG5vdGVzIGFyZSB2aXNpYmxlLlxuICAgICAgKiBJZiBzY3JvbGxHcmFkdWFsbHkgaXMgdHJ1ZSwgc2Nyb2xsIGdyYWR1YWxseSAoc21vb3RoIHNjcm9sbGluZylcbiAgICAgICogdG8gdGhlIHNoYWRlZCBub3Rlcy5cbiAgICAgICovXG4gICAgdm9pZCBTY3JvbGxUb1NoYWRlZE5vdGVzKGludCB4X3NoYWRlLCBpbnQgeV9zaGFkZSwgYm9vbCBzY3JvbGxHcmFkdWFsbHkpIHtcbiAgICAgICAgUGFuZWwgc2Nyb2xsdmlldyA9IChQYW5lbCkgdGhpcy5QYXJlbnQ7XG4gICAgICAgIFBvaW50IHNjcm9sbFBvcyA9IHNjcm9sbHZpZXcuQXV0b1Njcm9sbFBvc2l0aW9uO1xuXG4gICAgICAgIC8qIFRoZSBzY3JvbGwgcG9zaXRpb24gaXMgaW4gbmVnYXRpdmUgY29vcmRpbmF0ZXMgZm9yIHNvbWUgcmVhc29uICovXG4gICAgICAgIHNjcm9sbFBvcy5YID0gLXNjcm9sbFBvcy5YO1xuICAgICAgICBzY3JvbGxQb3MuWSA9IC1zY3JvbGxQb3MuWTtcbiAgICAgICAgUG9pbnQgbmV3UG9zID0gc2Nyb2xsUG9zO1xuXG4gICAgICAgIGlmIChzY3JvbGxWZXJ0KSB7XG4gICAgICAgICAgICBpbnQgc2Nyb2xsRGlzdCA9IChpbnQpKHlfc2hhZGUgLSBzY3JvbGxQb3MuWSk7XG5cbiAgICAgICAgICAgIGlmIChzY3JvbGxHcmFkdWFsbHkpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2Nyb2xsRGlzdCA+ICh6b29tICogU3RhZmZIZWlnaHQgKiA4KSlcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsRGlzdCA9IHNjcm9sbERpc3QvMjtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChzY3JvbGxEaXN0ID4gKE5vdGVIZWlnaHQgKiAzICogem9vbSkpXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbERpc3QgPSAoaW50KShOb3RlSGVpZ2h0ICogMyAqIHpvb20pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbmV3UG9zID0gbmV3IFBvaW50KHNjcm9sbFBvcy5YLCBzY3JvbGxQb3MuWSArIHNjcm9sbERpc3QpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaW50IHhfdmlldyA9IHNjcm9sbFBvcy5YICsgNDAgKiBzY3JvbGx2aWV3LldpZHRoLzEwMDtcbiAgICAgICAgICAgIGludCB4bWF4ICAgPSBzY3JvbGxQb3MuWCArIDY1ICogc2Nyb2xsdmlldy5XaWR0aC8xMDA7XG4gICAgICAgICAgICBpbnQgc2Nyb2xsRGlzdCA9IHhfc2hhZGUgLSB4X3ZpZXc7XG5cbiAgICAgICAgICAgIGlmIChzY3JvbGxHcmFkdWFsbHkpIHtcbiAgICAgICAgICAgICAgICBpZiAoeF9zaGFkZSA+IHhtYXgpIFxuICAgICAgICAgICAgICAgICAgICBzY3JvbGxEaXN0ID0gKHhfc2hhZGUgLSB4X3ZpZXcpLzM7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoeF9zaGFkZSA+IHhfdmlldylcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsRGlzdCA9ICh4X3NoYWRlIC0geF92aWV3KS82O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBuZXdQb3MgPSBuZXcgUG9pbnQoc2Nyb2xsUG9zLlggKyBzY3JvbGxEaXN0LCBzY3JvbGxQb3MuWSk7XG4gICAgICAgICAgICBpZiAobmV3UG9zLlggPCAwKSB7XG4gICAgICAgICAgICAgICAgbmV3UG9zLlggPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNjcm9sbHZpZXcuQXV0b1Njcm9sbFBvc2l0aW9uID0gbmV3UG9zO1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIHB1bHNlVGltZSBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlbiBwb2ludCBvbiB0aGUgU2hlZXRNdXNpYy5cbiAgICAgKiAgRmlyc3QsIGZpbmQgdGhlIHN0YWZmIGNvcnJlc3BvbmRpbmcgdG8gdGhlIHBvaW50LlxuICAgICAqICBUaGVuLCB3aXRoaW4gdGhlIHN0YWZmLCBmaW5kIHRoZSBub3Rlcy9zeW1ib2xzIGNvcnJlc3BvbmRpbmcgdG8gdGhlIHBvaW50LFxuICAgICAqICBhbmQgcmV0dXJuIHRoZSBTdGFydFRpbWUgKHB1bHNlVGltZSkgb2YgdGhlIHN5bWJvbHMuXG4gICAgICovXG4gICAgcHVibGljIGludCBQdWxzZVRpbWVGb3JQb2ludChQb2ludCBwb2ludCkge1xuICAgICAgICBQb2ludCBzY2FsZWRQb2ludCA9IG5ldyBQb2ludCgoaW50KShwb2ludC5YIC8gem9vbSksIChpbnQpKHBvaW50LlkgLyB6b29tKSk7IFxuICAgICAgICBpbnQgeSA9IDA7XG4gICAgICAgIGZvcmVhY2ggKFN0YWZmIHN0YWZmIGluIHN0YWZmcykge1xuICAgICAgICAgICAgaWYgKHNjYWxlZFBvaW50LlkgPj0geSAmJiBzY2FsZWRQb2ludC5ZIDw9IHkgKyBzdGFmZi5IZWlnaHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhZmYuUHVsc2VUaW1lRm9yUG9pbnQoc2NhbGVkUG9pbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeSArPSBzdGFmZi5IZWlnaHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHN0cmluZyByZXN1bHQgPSBcIlNoZWV0TXVzaWMgc3RhZmZzPVwiICsgc3RhZmZzLkNvdW50ICsgXCJcXG5cIjtcbiAgICAgICAgZm9yZWFjaCAoU3RhZmYgc3RhZmYgaW4gc3RhZmZzKSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gc3RhZmYuVG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgKz0gXCJFbmQgU2hlZXRNdXNpY1xcblwiO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxufVxuXG59XG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgU29saWRCcnVzaDpCcnVzaFxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBTb2xpZEJydXNoKENvbG9yIGNvbG9yKTpcclxuICAgICAgICAgICAgYmFzZShjb2xvcilcclxuICAgICAgICB7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMSBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIEBjbGFzcyBUaW1lU2lnU3ltYm9sXG4gKiBBIFRpbWVTaWdTeW1ib2wgcmVwcmVzZW50cyB0aGUgdGltZSBzaWduYXR1cmUgYXQgdGhlIGJlZ2lubmluZ1xuICogb2YgdGhlIHN0YWZmLiBXZSB1c2UgcHJlLW1hZGUgaW1hZ2VzIGZvciB0aGUgbnVtYmVycywgaW5zdGVhZCBvZlxuICogZHJhd2luZyBzdHJpbmdzLlxuICovXG5cbnB1YmxpYyBjbGFzcyBUaW1lU2lnU3ltYm9sIDogTXVzaWNTeW1ib2wge1xuICAgIHByaXZhdGUgc3RhdGljIEltYWdlW10gaW1hZ2VzOyAgLyoqIFRoZSBpbWFnZXMgZm9yIGVhY2ggbnVtYmVyICovXG4gICAgcHJpdmF0ZSBpbnQgIG51bWVyYXRvcjsgICAgICAgICAvKiogVGhlIG51bWVyYXRvciAqL1xuICAgIHByaXZhdGUgaW50ICBkZW5vbWluYXRvcjsgICAgICAgLyoqIFRoZSBkZW5vbWluYXRvciAqL1xuICAgIHByaXZhdGUgaW50ICB3aWR0aDsgICAgICAgICAgICAgLyoqIFRoZSB3aWR0aCBpbiBwaXhlbHMgKi9cbiAgICBwcml2YXRlIGJvb2wgY2FuZHJhdzsgICAgICAgICAgIC8qKiBUcnVlIGlmIHdlIGNhbiBkcmF3IHRoZSB0aW1lIHNpZ25hdHVyZSAqL1xuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBUaW1lU2lnU3ltYm9sICovXG4gICAgcHVibGljIFRpbWVTaWdTeW1ib2woaW50IG51bWVyLCBpbnQgZGVub20pIHtcbiAgICAgICAgbnVtZXJhdG9yID0gbnVtZXI7XG4gICAgICAgIGRlbm9taW5hdG9yID0gZGVub207XG4gICAgICAgIExvYWRJbWFnZXMoKTtcbiAgICAgICAgaWYgKG51bWVyID49IDAgJiYgbnVtZXIgPCBpbWFnZXMuTGVuZ3RoICYmIGltYWdlc1tudW1lcl0gIT0gbnVsbCAmJlxuICAgICAgICAgICAgZGVub20gPj0gMCAmJiBkZW5vbSA8IGltYWdlcy5MZW5ndGggJiYgaW1hZ2VzW251bWVyXSAhPSBudWxsKSB7XG4gICAgICAgICAgICBjYW5kcmF3ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNhbmRyYXcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB3aWR0aCA9IE1pbldpZHRoO1xuICAgIH1cblxuICAgIC8qKiBMb2FkIHRoZSBpbWFnZXMgaW50byBtZW1vcnkuICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBMb2FkSW1hZ2VzKCkge1xuICAgICAgICBpZiAoaW1hZ2VzID09IG51bGwpIHtcbiAgICAgICAgICAgIGltYWdlcyA9IG5ldyBJbWFnZVsxM107XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDEzOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpbWFnZXNbaV0gPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW1hZ2VzWzJdID0gbmV3IEJpdG1hcCh0eXBlb2YoVGltZVNpZ1N5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy50d28ucG5nXCIpO1xuICAgICAgICAgICAgaW1hZ2VzWzNdID0gbmV3IEJpdG1hcCh0eXBlb2YoVGltZVNpZ1N5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy50aHJlZS5wbmdcIik7XG4gICAgICAgICAgICBpbWFnZXNbNF0gPSBuZXcgQml0bWFwKHR5cGVvZihUaW1lU2lnU3ltYm9sKSwgXCJSZXNvdXJjZXMuSW1hZ2VzLmZvdXIucG5nXCIpO1xuICAgICAgICAgICAgaW1hZ2VzWzZdID0gbmV3IEJpdG1hcCh0eXBlb2YoVGltZVNpZ1N5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy5zaXgucG5nXCIpO1xuICAgICAgICAgICAgaW1hZ2VzWzhdID0gbmV3IEJpdG1hcCh0eXBlb2YoVGltZVNpZ1N5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy5laWdodC5wbmdcIik7XG4gICAgICAgICAgICBpbWFnZXNbOV0gPSBuZXcgQml0bWFwKHR5cGVvZihUaW1lU2lnU3ltYm9sKSwgXCJSZXNvdXJjZXMuSW1hZ2VzLm5pbmUucG5nXCIpO1xuICAgICAgICAgICAgaW1hZ2VzWzEyXSA9IG5ldyBCaXRtYXAodHlwZW9mKFRpbWVTaWdTeW1ib2wpLCBcIlJlc291cmNlcy5JbWFnZXMudHdlbHZlLnBuZ1wiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIHRpbWUgKGluIHB1bHNlcykgdGhpcyBzeW1ib2wgb2NjdXJzIGF0LiAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgU3RhcnRUaW1lIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIC0xOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbWluaW11bSB3aWR0aCAoaW4gcGl4ZWxzKSBuZWVkZWQgdG8gZHJhdyB0aGlzIHN5bWJvbCAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgTWluV2lkdGgge1xuICAgICAgICBnZXQgeyBpZiAoY2FuZHJhdykgXG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW1hZ2VzWzJdLldpZHRoICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMiAvaW1hZ2VzWzJdLkhlaWdodDtcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEdldC9TZXQgdGhlIHdpZHRoIChpbiBwaXhlbHMpIG9mIHRoaXMgc3ltYm9sLiBUaGUgd2lkdGggaXMgc2V0XG4gICAgICogaW4gU2hlZXRNdXNpYy5BbGlnblN5bWJvbHMoKSB0byB2ZXJ0aWNhbGx5IGFsaWduIHN5bWJvbHMuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBXaWR0aCB7XG4gICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgc2V0IHsgd2lkdGggPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBhYm92ZSB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBBYm92ZVN0YWZmIHsgXG4gICAgICAgIGdldCB7ICByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBiZWxvdyB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBCZWxvd1N0YWZmIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIDA7IH0gXG4gICAgfVxuXG4gICAgLyoqIERyYXcgdGhlIHN5bWJvbC5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgXG4gICAgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIGlmICghY2FuZHJhdylcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybShXaWR0aCAtIE1pbldpZHRoLCAwKTtcbiAgICAgICAgSW1hZ2UgbnVtZXIgPSBpbWFnZXNbbnVtZXJhdG9yXTtcbiAgICAgICAgSW1hZ2UgZGVub20gPSBpbWFnZXNbZGVub21pbmF0b3JdO1xuXG4gICAgICAgIC8qIFNjYWxlIHRoZSBpbWFnZSB3aWR0aCB0byBtYXRjaCB0aGUgaGVpZ2h0ICovXG4gICAgICAgIGludCBpbWdoZWlnaHQgPSBTaGVldE11c2ljLk5vdGVIZWlnaHQgKiAyO1xuICAgICAgICBpbnQgaW1nd2lkdGggPSBudW1lci5XaWR0aCAqIGltZ2hlaWdodCAvIG51bWVyLkhlaWdodDtcbiAgICAgICAgZy5EcmF3SW1hZ2UobnVtZXIsIDAsIHl0b3AsIGltZ3dpZHRoLCBpbWdoZWlnaHQpO1xuICAgICAgICBnLkRyYXdJbWFnZShkZW5vbSwgMCwgeXRvcCArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyLCBpbWd3aWR0aCwgaW1naGVpZ2h0KTtcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShXaWR0aCAtIE1pbldpZHRoKSwgMCk7XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJUaW1lU2lnU3ltYm9sIG51bWVyYXRvcj17MH0gZGVub21pbmF0b3I9ezF9XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWVyYXRvciwgZGVub21pbmF0b3IpO1xuICAgIH1cbn1cblxufVxuXG4iXQp9Cg==
