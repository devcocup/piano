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
                },
                LightGray: {
                    get: function () {
                        return new MidiSheetMusic.Brush(MidiSheetMusic.Color.LightGray);
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
            duration: 0,
            velocity: 0
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
            },
            Velocity: {
                get: function () {
                    return this.velocity;
                },
                set: function (value) {
                    this.velocity = value;
                }
            }
        },
        alias: ["compare", ["System$Collections$Generic$IComparer$1$MidiSheetMusic$MidiNote$compare", "System$Collections$Generic$IComparer$1$compare"]],
        ctors: {
            ctor: function (starttime, channel, notenumber, duration, velocity) {
                this.$initialize();
                this.starttime = starttime;
                this.channel = channel;
                this.notenumber = notenumber;
                this.duration = duration;
                this.velocity = velocity;
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
                return new MidiSheetMusic.MidiNote(this.starttime, this.channel, this.notenumber, this.duration, this.velocity);
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
                this.shadeColor = MidiSheetMusic.Color.FromArgb$1(100, 53, 123, 255);
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
                            var note = new MidiSheetMusic.MidiNote(mevent.StartTime, mevent.Channel, mevent.Notenumber, 0, mevent.Velocity);
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
        statics: {
            methods: {
                InsideClipping: function (clip, xpos, s) {
                    return (xpos <= ((((clip.X + clip.Width) | 0) + 50) | 0)) && (((((xpos + s.Width) | 0) + 50) | 0) >= clip.X);
                }
            }
        },
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
            Draw: function (g, clip, pen, selectionStartPulse, selectionEndPulse, deselectedBrush) {
                var $t, $t1;
                /* Shade any deselected areas */
                this.ShadeSelectionBackground(g, clip, selectionStartPulse, selectionEndPulse, deselectedBrush);

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
                        if (MidiSheetMusic.Staff.InsideClipping(clip, xpos, s)) {
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
            ShadeSelectionBackground: function (g, clip, selectionStartPulse, selectionEndPulse, deselectedBrush) {
                var $t;
                if (selectionEndPulse === 0) {
                    return;
                }

                var xpos = this.keysigWidth;
                var lastStateFill = false;
                $t = Bridge.getEnumerator(this.symbols);
                try {
                    while ($t.moveNext()) {
                        var s = $t.Current;
                        if (MidiSheetMusic.Staff.InsideClipping(clip, xpos, s) && (s.StartTime < selectionStartPulse || s.StartTime > selectionEndPulse)) {
                            g.TranslateTransform(((xpos - 2) | 0), -2);
                            g.FillRectangle(deselectedBrush, 0, 0, ((s.Width + 4) | 0), ((this.Height + 4) | 0));
                            g.TranslateTransform(((-(((xpos - 2) | 0))) | 0), 2);
                            lastStateFill = true;
                        } else {
                            lastStateFill = false;
                        }
                        xpos = (xpos + s.Width) | 0;
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }if (lastStateFill) {
                    //shade the rest of the staff if the previous symbol was shaded
                    g.TranslateTransform(((xpos - 2) | 0), -2);
                    g.FillRectangle(deselectedBrush, 0, 0, ((this.width - xpos) | 0), ((this.Height + 4) | 0));
                    g.TranslateTransform(((-(((xpos - 2) | 0))) | 0), 2);
                }
            },
            ShadeNotes: function (g, shadeBrush, pen, currentPulseTime, prevPulseTime, x_shade) {

                /* If there's nothing to unshade, or shade, return */
                if ((this.starttime > prevPulseTime || this.endtime < prevPulseTime) && (this.starttime > currentPulseTime || this.endtime < currentPulseTime)) {
                    return false;
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
                var shadedNoteFound = false;
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

                        return shadedNoteFound;
                    }
                    /* If shaded notes are the same, we're done */
                    if ((start <= currentPulseTime) && (currentPulseTime < end) && (start <= prevPulseTime) && (prevPulseTime < end)) {

                        x_shade.v = xpos;
                        return shadedNoteFound;
                    }

                    /* If symbol is in the previous time, draw a white background */
                    if ((start <= prevPulseTime) && (prevPulseTime < end)) {
                        g.TranslateTransform(((xpos - 2) | 0), -2);
                        g.ClearRectangle(0, 0, ((curr.Width + 4) | 0), ((this.Height + 4) | 0));
                        g.TranslateTransform(((-(((xpos - 2) | 0))) | 0), 2);
                    }

                    /* If symbol is in the current time, draw a shaded background */
                    if ((start <= currentPulseTime) && (currentPulseTime < end)) {
                        x_shade.v = xpos;
                        g.TranslateTransform(xpos, 0);
                        g.FillRectangle(shadeBrush, 0, 0, curr.Width, this.Height);
                        g.TranslateTransform(((-xpos) | 0), 0);
                        shadedNoteFound = true;
                    }

                    xpos = (xpos + curr.Width) | 0;
                }
                return shadedNoteFound;
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
            deselectedShadeBrush: null,
            pen: null,
            SelectionStartPulse: 0,
            SelectionEndPulse: 0
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
            init: function () {
                this.deselectedShadeBrush = new MidiSheetMusic.SolidBrush(MidiSheetMusic.Color.LightGray);
            },
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
                            staff.Draw(g, clip, this.pen, this.SelectionStartPulse, this.SelectionEndPulse, this.deselectedShadeBrush);
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

                var shadedYPos = -1;
                $t = Bridge.getEnumerator(this.staffs);
                try {
                    while ($t.moveNext()) {
                        var staff = $t.Current;
                        g.TranslateTransform(0, ypos);
                        if (staff.ShadeNotes(g, this.shadeBrush, this.pen, currentPulseTime, prevPulseTime, x_shade)) {
                            shadedYPos = shadedYPos === -1 ? ypos : shadedYPos;
                        }
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
                return shadedYPos === -1 ? -1 : Bridge.Int.clip32(shadedYPos * this.zoom);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJNaWRpU2hlZXRNdXNpY0JyaWRnZS5qcyIsCiAgInNvdXJjZVJvb3QiOiAiIiwKICAic291cmNlcyI6IFsiQ2xhc3Nlcy9EcmF3aW5nL0ltYWdlLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL0JydXNoLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL0JydXNoZXMuY3MiLCJDbGFzc2VzL0NsZWZNZWFzdXJlcy5jcyIsIkNsYXNzZXMvRHJhd2luZy9Db2xvci5jcyIsIkNsYXNzZXMvRHJhd2luZy9Db250cm9sLmNzIiwiQ2xhc3Nlcy9UZXh0L0VuY29kaW5nLmNzIiwiQ2xhc3Nlcy9JTy9TdHJlYW0uY3MiLCJDbGFzc2VzL0RyYXdpbmcvRm9udC5jcyIsIkNsYXNzZXMvRHJhd2luZy9HcmFwaGljcy5jcyIsIkNsYXNzZXMvS2V5U2lnbmF0dXJlLmNzIiwiQ2xhc3Nlcy9MeXJpY1N5bWJvbC5jcyIsIkNsYXNzZXMvTWlkaUV2ZW50LmNzIiwiQ2xhc3Nlcy9NaWRpRmlsZS5jcyIsIkNsYXNzZXMvTWlkaUZpbGVFeGNlcHRpb24uY3MiLCJDbGFzc2VzL01pZGlGaWxlUmVhZGVyLmNzIiwiQ2xhc3Nlcy9NaWRpTm90ZS5jcyIsIkNsYXNzZXMvTWlkaU9wdGlvbnMuY3MiLCJDbGFzc2VzL01pZGlUcmFjay5jcyIsIkNsYXNzZXMvV2hpdGVOb3RlLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL1BhaW50RXZlbnRBcmdzLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL1BhbmVsLmNzIiwiQ2xhc3Nlcy9JTy9QYXRoLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL1Blbi5jcyIsIkNsYXNzZXMvRHJhd2luZy9Qb2ludC5jcyIsIkNsYXNzZXMvRHJhd2luZy9SZWN0YW5nbGUuY3MiLCJDbGFzc2VzL1N0YWZmLmNzIiwiQ2xhc3Nlcy9TdGVtLmNzIiwiQ2xhc3Nlcy9TeW1ib2xXaWR0aHMuY3MiLCJDbGFzc2VzL1RpbWVTaWduYXR1cmUuY3MiLCJDbGFzc2VzL0FjY2lkU3ltYm9sLmNzIiwiQ2xhc3Nlcy9CYXJTeW1ib2wuY3MiLCJDbGFzc2VzL0RyYXdpbmcvQml0bWFwLmNzIiwiQ2xhc3Nlcy9CbGFua1N5bWJvbC5jcyIsIkNsYXNzZXMvQ2hvcmRTeW1ib2wuY3MiLCJDbGFzc2VzL0NsZWZTeW1ib2wuY3MiLCJDbGFzc2VzL0lPL0ZpbGVTdHJlYW0uY3MiLCJDbGFzc2VzL1BpYW5vLmNzIiwiQ2xhc3Nlcy9SZXN0U3ltYm9sLmNzIiwiQ2xhc3Nlcy9TaGVldE11c2ljLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL1NvbGlkQnJ1c2guY3MiLCJDbGFzc2VzL1RpbWVTaWdTeW1ib2wuY3MiXSwKICAibmFtZXMiOiBbIiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQW9CZ0JBLE9BQU9BLDBCQUE4Q0E7Ozs7O29CQVFyREEsT0FBT0EsMkJBQStDQTs7Ozs7NEJBakI5Q0EsTUFBV0E7O2dCQUV2QkEsc0JBQXFDQSxNQUFNQSxNQUFNQTs7Ozs7Ozs7Ozs0QkNIeENBOztnQkFFVEEsYUFBUUE7Ozs7Ozs7Ozs7Ozs7d0JDSnNCQSxPQUFPQSxJQUFJQSxxQkFBTUE7Ozs7O3dCQUNqQkEsT0FBT0EsSUFBSUEscUJBQU1BOzs7Ozt3QkFDYkEsT0FBT0EsSUFBSUEscUJBQU1BOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQ0NxRjlCQTs7b0JBQ3pCQSxjQUFjQTtvQkFDZEE7b0JBQ0FBLDBCQUF1QkE7Ozs7NEJBQ25CQSxpQkFBU0E7Ozs7OztxQkFFYkEsSUFBSUE7d0JBQ0FBLE9BQU9BOzJCQUVOQSxJQUFJQSx3QkFBTUEsc0JBQWVBO3dCQUMxQkEsT0FBT0E7O3dCQUdQQSxPQUFPQTs7Ozs7Ozs7Ozs0QkE3RUtBLE9BQXNCQTs7Z0JBQ3RDQSxlQUFVQTtnQkFDVkEsZUFBZ0JBLHFDQUFTQTtnQkFDekJBLGtCQUFrQkE7Z0JBQ2xCQTtnQkFDQUEsV0FBWUE7O2dCQUVaQSxhQUFRQSxLQUFJQTs7Z0JBRVpBLE9BQU9BLE1BQU1BOztvQkFFVEE7b0JBQ0FBO29CQUNBQSxPQUFPQSxNQUFNQSxl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QzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBOztvQkFFMUJBLE1BQU1BLHlEQUFVQSwrQkFBVkE7b0JBQ05BLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTs7b0JBRTFCQSxNQUFNQSx5REFBVUEsK0JBQVZBO29CQUNOQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7O29CQUUx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S0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7O29CQUUxQkEsTUFBTUEsd0RBQVNBLG1DQUFUQTtvQkFDTkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBOztvQkFFMUJBLE1BQU1BLHdEQUFTQSxtQ0FBVEE7b0JBQ05BLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTs7b0JBRTFCQSxNQUFNQSx3REFBU0EsbUNBQVRBO29CQUNOQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxn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QkFDWkEsbUJBQWNBO2dCQUNkQTtnQkFDQUEsSUFBSUEsY0FBY0EsUUFBUUEsOENBQWlCQSx1REFBT0EsT0FBUEEseUNBQWlCQSxRQUN4REEsY0FBY0EsUUFBUUEsOENBQWlCQSx1REFBT0EsT0FBUEEseUNBQWlCQTtvQkFDeERBOztvQkFHQUE7O2dCQUVKQSxhQUFRQTs7Ozs0QkE0REZBLEdBQVlBLEtBQVNBO2dCQUMzQkEsSUFBSUEsQ0FBQ0E7b0JBQ0RBOzs7Z0JBRUpBLHFCQUFxQkEsZUFBUUE7Z0JBQzdCQSxZQUFjQSx1REFBT0EsZ0JBQVBBO2dCQUNkQSxZQUFjQSx1REFBT0Esa0JBQVBBOzs7Z0JBR2RBLGdCQUFnQkE7Z0JBQ2hCQSxlQUFlQSw0Q0FBY0EsWUFBWUE7Z0JBQ3pDQSxZQUFZQSxVQUFVQSxNQUFNQSxVQUFVQTtnQkFDdENBLFlBQVlBLFVBQVVBLFNBQU9BLCtEQUF5QkEsVUFBVUE7Z0JBQ2hFQSxxQkFBcUJBLEdBQUNBLENBQUNBLGVBQVFBOzs7Z0JBSS9CQSxPQUFPQSxvRUFDY0EsMENBQVdBIiwKICAic291cmNlc0NvbnRlbnQiOiBbInVzaW5nIEJyaWRnZTtcclxudXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEltYWdlXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIG9iamVjdCBEb21JbWFnZTtcclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIEltYWdlKFR5cGUgdHlwZSwgc3RyaW5nIGZpbGVuYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmltYWdlLmN0b3JcIiwgdGhpcywgdHlwZSwgZmlsZW5hbWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGludCBXaWR0aFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBTY3JpcHQuQ2FsbDxpbnQ+KFwiYnJpZGdlVXRpbC5pbWFnZS5nZXRXaWR0aFwiLCB0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGludCBIZWlnaHRcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdldFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gU2NyaXB0LkNhbGw8aW50PihcImJyaWRnZVV0aWwuaW1hZ2UuZ2V0SGVpZ2h0XCIsIHRoaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBCcnVzaFxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBDb2xvciBDb2xvcjtcclxuXHJcbiAgICAgICAgcHVibGljIEJydXNoKENvbG9yIGNvbG9yKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQ29sb3IgPSBjb2xvcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIERpc3Bvc2UoKSB7IH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgc3RhdGljIGNsYXNzIEJydXNoZXNcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIEJydXNoIEJsYWNrIHsgZ2V0IHsgcmV0dXJuIG5ldyBCcnVzaChDb2xvci5CbGFjayk7IH0gfVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQnJ1c2ggV2hpdGUgeyBnZXQgeyByZXR1cm4gbmV3IEJydXNoKENvbG9yLldoaXRlKTsgfSB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBCcnVzaCBMaWdodEdyYXkgeyBnZXQgeyByZXR1cm4gbmV3IEJydXNoKENvbG9yLkxpZ2h0R3JheSk7IH0gfVxyXG4gICAgfVxyXG59XHJcbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAwOCBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbi8qKiBAY2xhc3MgQ2xlZk1lYXN1cmVzXG4gKiBUaGUgQ2xlZk1lYXN1cmVzIGNsYXNzIGlzIHVzZWQgdG8gcmVwb3J0IHdoYXQgQ2xlZiAoVHJlYmxlIG9yIEJhc3MpIGFcbiAqIGdpdmVuIG1lYXN1cmUgdXNlcy5cbiAqL1xucHVibGljIGNsYXNzIENsZWZNZWFzdXJlcyB7XG4gICAgcHJpdmF0ZSBMaXN0PENsZWY+IGNsZWZzOyAgLyoqIFRoZSBjbGVmcyB1c2VkIGZvciBlYWNoIG1lYXN1cmUgKGZvciBhIHNpbmdsZSB0cmFjaykgKi9cbiAgICBwcml2YXRlIGludCBtZWFzdXJlOyAgICAgICAvKiogVGhlIGxlbmd0aCBvZiBhIG1lYXN1cmUsIGluIHB1bHNlcyAqL1xuXG4gXG4gICAgLyoqIEdpdmVuIHRoZSBub3RlcyBpbiBhIHRyYWNrLCBjYWxjdWxhdGUgdGhlIGFwcHJvcHJpYXRlIENsZWYgdG8gdXNlXG4gICAgICogZm9yIGVhY2ggbWVhc3VyZS4gIFN0b3JlIHRoZSByZXN1bHQgaW4gdGhlIGNsZWZzIGxpc3QuXG4gICAgICogQHBhcmFtIG5vdGVzICBUaGUgbWlkaSBub3Rlc1xuICAgICAqIEBwYXJhbSBtZWFzdXJlbGVuIFRoZSBsZW5ndGggb2YgYSBtZWFzdXJlLCBpbiBwdWxzZXNcbiAgICAgKi9cbiAgICBwdWJsaWMgQ2xlZk1lYXN1cmVzKExpc3Q8TWlkaU5vdGU+IG5vdGVzLCBpbnQgbWVhc3VyZWxlbikge1xuICAgICAgICBtZWFzdXJlID0gbWVhc3VyZWxlbjtcbiAgICAgICAgQ2xlZiBtYWluY2xlZiA9IE1haW5DbGVmKG5vdGVzKTtcbiAgICAgICAgaW50IG5leHRtZWFzdXJlID0gbWVhc3VyZWxlbjtcbiAgICAgICAgaW50IHBvcyA9IDA7XG4gICAgICAgIENsZWYgY2xlZiA9IG1haW5jbGVmO1xuXG4gICAgICAgIGNsZWZzID0gbmV3IExpc3Q8Q2xlZj4oKTtcblxuICAgICAgICB3aGlsZSAocG9zIDwgbm90ZXMuQ291bnQpIHtcbiAgICAgICAgICAgIC8qIFN1bSBhbGwgdGhlIG5vdGVzIGluIHRoZSBjdXJyZW50IG1lYXN1cmUgKi9cbiAgICAgICAgICAgIGludCBzdW1ub3RlcyA9IDA7XG4gICAgICAgICAgICBpbnQgbm90ZWNvdW50ID0gMDtcbiAgICAgICAgICAgIHdoaWxlIChwb3MgPCBub3Rlcy5Db3VudCAmJiBub3Rlc1twb3NdLlN0YXJ0VGltZSA8IG5leHRtZWFzdXJlKSB7XG4gICAgICAgICAgICAgICAgc3Vtbm90ZXMgKz0gbm90ZXNbcG9zXS5OdW1iZXI7XG4gICAgICAgICAgICAgICAgbm90ZWNvdW50Kys7XG4gICAgICAgICAgICAgICAgcG9zKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm90ZWNvdW50ID09IDApXG4gICAgICAgICAgICAgICAgbm90ZWNvdW50ID0gMTtcblxuICAgICAgICAgICAgLyogQ2FsY3VsYXRlIHRoZSBcImF2ZXJhZ2VcIiBub3RlIGluIHRoZSBtZWFzdXJlICovXG4gICAgICAgICAgICBpbnQgYXZnbm90ZSA9IHN1bW5vdGVzIC8gbm90ZWNvdW50O1xuICAgICAgICAgICAgaWYgKGF2Z25vdGUgPT0gMCkge1xuICAgICAgICAgICAgICAgIC8qIFRoaXMgbWVhc3VyZSBkb2Vzbid0IGNvbnRhaW4gYW55IG5vdGVzLlxuICAgICAgICAgICAgICAgICAqIEtlZXAgdGhlIHByZXZpb3VzIGNsZWYuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChhdmdub3RlID49IFdoaXRlTm90ZS5Cb3R0b21UcmVibGUuTnVtYmVyKCkpIHtcbiAgICAgICAgICAgICAgICBjbGVmID0gQ2xlZi5UcmVibGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChhdmdub3RlIDw9IFdoaXRlTm90ZS5Ub3BCYXNzLk51bWJlcigpKSB7XG4gICAgICAgICAgICAgICAgY2xlZiA9IENsZWYuQmFzcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8qIFRoZSBhdmVyYWdlIG5vdGUgaXMgYmV0d2VlbiBHMyBhbmQgRjQuIFdlIGNhbiB1c2UgZWl0aGVyXG4gICAgICAgICAgICAgICAgICogdGhlIHRyZWJsZSBvciBiYXNzIGNsZWYuICBVc2UgdGhlIFwibWFpblwiIGNsZWYsIHRoZSBjbGVmXG4gICAgICAgICAgICAgICAgICogdGhhdCBhcHBlYXJzIG1vc3QgZm9yIHRoaXMgdHJhY2suXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgY2xlZiA9IG1haW5jbGVmO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbGVmcy5BZGQoY2xlZik7XG4gICAgICAgICAgICBuZXh0bWVhc3VyZSArPSBtZWFzdXJlbGVuO1xuICAgICAgICB9XG4gICAgICAgIGNsZWZzLkFkZChjbGVmKTtcbiAgICB9XG5cbiAgICAvKiogR2l2ZW4gYSB0aW1lIChpbiBwdWxzZXMpLCByZXR1cm4gdGhlIGNsZWYgdXNlZCBmb3IgdGhhdCBtZWFzdXJlLiAqL1xuICAgIHB1YmxpYyBDbGVmIEdldENsZWYoaW50IHN0YXJ0dGltZSkge1xuXG4gICAgICAgIC8qIElmIHRoZSB0aW1lIGV4Y2VlZHMgdGhlIGxhc3QgbWVhc3VyZSwgcmV0dXJuIHRoZSBsYXN0IG1lYXN1cmUgKi9cbiAgICAgICAgaWYgKHN0YXJ0dGltZSAvIG1lYXN1cmUgPj0gY2xlZnMuQ291bnQpIHtcbiAgICAgICAgICAgIHJldHVybiBjbGVmc1sgY2xlZnMuQ291bnQtMSBdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGNsZWZzWyBzdGFydHRpbWUgLyBtZWFzdXJlIF07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogQ2FsY3VsYXRlIHRoZSBiZXN0IGNsZWYgdG8gdXNlIGZvciB0aGUgZ2l2ZW4gbm90ZXMuICBJZiB0aGVcbiAgICAgKiBhdmVyYWdlIG5vdGUgaXMgYmVsb3cgTWlkZGxlIEMsIHVzZSBhIGJhc3MgY2xlZi4gIEVsc2UsIHVzZSBhIHRyZWJsZVxuICAgICAqIGNsZWYuXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgQ2xlZiBNYWluQ2xlZihMaXN0PE1pZGlOb3RlPiBub3Rlcykge1xuICAgICAgICBpbnQgbWlkZGxlQyA9IFdoaXRlTm90ZS5NaWRkbGVDLk51bWJlcigpO1xuICAgICAgICBpbnQgdG90YWwgPSAwO1xuICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBtIGluIG5vdGVzKSB7XG4gICAgICAgICAgICB0b3RhbCArPSBtLk51bWJlcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm90ZXMuQ291bnQgPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIENsZWYuVHJlYmxlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRvdGFsL25vdGVzLkNvdW50ID49IG1pZGRsZUMpIHtcbiAgICAgICAgICAgIHJldHVybiBDbGVmLlRyZWJsZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBDbGVmLkJhc3M7XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxufVxuXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgQ29sb3JcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgaW50IFJlZDtcclxuICAgICAgICBwdWJsaWMgaW50IEdyZWVuO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgQmx1ZTtcclxuICAgICAgICBwdWJsaWMgaW50IEFscGhhO1xyXG5cclxuICAgICAgICBwdWJsaWMgQ29sb3IoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQWxwaGEgPSAyNTU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIENvbG9yIEZyb21BcmdiKGludCByZWQsIGludCBncmVlbiwgaW50IGJsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEZyb21BcmdiKDI1NSwgcmVkLCBncmVlbiwgYmx1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIENvbG9yIEZyb21BcmdiKGludCBhbHBoYSwgaW50IHJlZCwgaW50IGdyZWVuLCBpbnQgYmx1ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ29sb3JcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgQWxwaGEgPSBhbHBoYSxcclxuICAgICAgICAgICAgICAgIFJlZCA9IHJlZCxcclxuICAgICAgICAgICAgICAgIEdyZWVuID0gZ3JlZW4sXHJcbiAgICAgICAgICAgICAgICBCbHVlID0gYmx1ZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBDb2xvciBCbGFjayB7IGdldCB7IHJldHVybiBuZXcgQ29sb3IoKTsgfSB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQ29sb3IgV2hpdGUgeyBnZXQgeyByZXR1cm4gRnJvbUFyZ2IoMjU1LDI1NSwyNTUpOyB9IH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBDb2xvciBMaWdodEdyYXkgeyBnZXQgeyByZXR1cm4gRnJvbUFyZ2IoMHhkMywweGQzLDB4ZDMpOyB9IH1cclxuXHJcbiAgICAgICAgcHVibGljIGludCBSIHsgZ2V0IHsgcmV0dXJuIFJlZDsgfSB9XHJcbiAgICAgICAgcHVibGljIGludCBHIHsgZ2V0IHsgcmV0dXJuIEdyZWVuOyB9IH1cclxuICAgICAgICBwdWJsaWMgaW50IEIgeyBnZXQgeyByZXR1cm4gQmx1ZTsgfSB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBib29sIEVxdWFscyhDb2xvciBjb2xvcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiBSZWQgPT0gY29sb3IuUmVkICYmIEdyZWVuID09IGNvbG9yLkdyZWVuICYmIEJsdWUgPT0gY29sb3IuQmx1ZSAmJiBBbHBoYT09Y29sb3IuQWxwaGE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBDb250cm9sXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIGludCBXaWR0aDtcclxuICAgICAgICBwdWJsaWMgaW50IEhlaWdodDtcclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgSW52YWxpZGF0ZSgpIHsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgR3JhcGhpY3MgQ3JlYXRlR3JhcGhpY3Moc3RyaW5nIG5hbWUpIHsgcmV0dXJuIG5ldyBHcmFwaGljcyhuYW1lKTsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgUGFuZWwgUGFyZW50IHsgZ2V0IHsgcmV0dXJuIG5ldyBQYW5lbCgpOyB9IH1cclxuXHJcbiAgICAgICAgcHVibGljIENvbG9yIEJhY2tDb2xvcjtcclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgc3RhdGljIGNsYXNzIEVuY29kaW5nXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBzdHJpbmcgR2V0VXRmOFN0cmluZyhieXRlW10gdmFsdWUsIGludCBzdGFydEluZGV4LCBpbnQgbGVuZ3RoKSB7IHJldHVybiBcIm5vdCBpbXBsZW1lbnRlZCFcIjsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHN0cmluZyBHZXRBc2NpaVN0cmluZyhieXRlW10gZGF0YSwgaW50IHN0YXJ0SW5kZXgsIGludCBsZW4pIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIHRvUmV0dXJuID0gXCJcIjtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW4gJiYgaSA8IGRhdGEuTGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgICAgICB0b1JldHVybiArPSAoY2hhcilkYXRhW2kgKyBzdGFydEluZGV4XTtcclxuICAgICAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBieXRlW10gR2V0QXNjaWlCeXRlcyhzdHJpbmcgdmFsdWUpIHsgcmV0dXJuIG51bGw7IH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgU3RyZWFtXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIHZvaWQgV3JpdGUoYnl0ZVtdIGJ1ZmZlciwgaW50IG9mZnNldCwgaW50IGNvdW50KSB7IH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgQ2xvc2UoKSB7IH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgRm9udFxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBzdHJpbmcgTmFtZTtcclxuICAgICAgICBwdWJsaWMgaW50IFNpemU7XHJcbiAgICAgICAgcHVibGljIEZvbnRTdHlsZSBTdHlsZTtcclxuXHJcbiAgICAgICAgcHVibGljIEZvbnQoc3RyaW5nIG5hbWUsIGludCBzaXplLCBGb250U3R5bGUgc3R5bGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBOYW1lID0gbmFtZTtcclxuICAgICAgICAgICAgU2l6ZSA9IHNpemU7XHJcbiAgICAgICAgICAgIFN0eWxlID0gc3R5bGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZmxvYXQgR2V0SGVpZ2h0KCkgeyByZXR1cm4gMDsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBEaXNwb3NlKCkgeyB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgQnJpZGdlO1xyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgR3JhcGhpY3NcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgR3JhcGhpY3Moc3RyaW5nIG5hbWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBOYW1lID0gbmFtZTtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLmluaXRHcmFwaGljc1wiLCB0aGlzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdHJpbmcgTmFtZTtcclxuXHJcbiAgICAgICAgcHVibGljIG9iamVjdCBDb250ZXh0O1xyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBUcmFuc2xhdGVUcmFuc2Zvcm0oaW50IHgsIGludCB5KSB7XHJcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy50cmFuc2xhdGVUcmFuc2Zvcm1cIiwgdGhpcywgeCwgeSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBEcmF3SW1hZ2UoSW1hZ2UgaW1hZ2UsIGludCB4LCBpbnQgeSwgaW50IHdpZHRoLCBpbnQgaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy5kcmF3SW1hZ2VcIiwgdGhpcywgaW1hZ2UsIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgRHJhd1N0cmluZyhzdHJpbmcgdGV4dCwgRm9udCBmb250LCBCcnVzaCBicnVzaCwgaW50IHgsIGludCB5KSB7XHJcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy5kcmF3U3RyaW5nXCIsIHRoaXMsIHRleHQsIGZvbnQsIGJydXNoLCB4LCB5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIERyYXdMaW5lKFBlbiBwZW4sIGludCB4U3RhcnQsIGludCB5U3RhcnQsIGludCB4RW5kLCBpbnQgeUVuZCkge1xyXG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3MuZHJhd0xpbmVcIiwgdGhpcywgcGVuLCB4U3RhcnQsIHlTdGFydCwgeEVuZCwgeUVuZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBEcmF3QmV6aWVyKFBlbiBwZW4sIGludCB4MSwgaW50IHkxLCBpbnQgeDIsIGludCB5MiwgaW50IHgzLCBpbnQgeTMsIGludCB4NCwgaW50IHk0KSB7XHJcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy5kcmF3QmV6aWVyXCIsIHRoaXMsIHBlbiwgeDEsIHkxLCB4MiwgeTIsIHgzLCB5MywgeDQsIHk0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFNjYWxlVHJhbnNmb3JtKGZsb2F0IHgsIGZsb2F0IHkpIHtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLnNjYWxlVHJhbnNmb3JtXCIsIHRoaXMsIHgsIHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgRmlsbFJlY3RhbmdsZShCcnVzaCBicnVzaCwgaW50IHgsIGludCB5LCBpbnQgd2lkdGgsIGludCBoZWlnaHQpIHtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLmZpbGxSZWN0YW5nbGVcIiwgdGhpcywgYnJ1c2gsIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgQ2xlYXJSZWN0YW5nbGUoaW50IHgsIGludCB5LCBpbnQgd2lkdGgsIGludCBoZWlnaHQpIHtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLmNsZWFyUmVjdGFuZ2xlXCIsIHRoaXMsIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgRmlsbEVsbGlwc2UoQnJ1c2ggYnJ1c2gsIGludCB4LCBpbnQgeSwgaW50IHdpZHRoLCBpbnQgaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy5maWxsRWxsaXBzZVwiLCB0aGlzLCBicnVzaCwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBEcmF3RWxsaXBzZShQZW4gcGVuLCBpbnQgeCwgaW50IHksIGludCB3aWR0aCwgaW50IGhlaWdodCkge1xyXG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3MuZHJhd0VsbGlwc2VcIiwgdGhpcywgcGVuLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFJvdGF0ZVRyYW5zZm9ybShmbG9hdCBhbmdsZURlZykge1xyXG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3Mucm90YXRlVHJhbnNmb3JtXCIsIHRoaXMsIGFuZ2xlRGVnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBTbW9vdGhpbmdNb2RlIFNtb290aGluZ01vZGUgeyBnZXQ7IHNldDsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgUmVjdGFuZ2xlIFZpc2libGVDbGlwQm91bmRzIHsgZ2V0OyBzZXQ7IH1cclxuXHJcbiAgICAgICAgcHVibGljIGZsb2F0IFBhZ2VTY2FsZSB7IGdldDsgc2V0OyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIERpc3Bvc2UoKSB7IH1cclxuICAgIH1cclxufVxyXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTMgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cblxuLyoqIEBjbGFzcyBLZXlTaWduYXR1cmVcbiAqIFRoZSBLZXlTaWduYXR1cmUgY2xhc3MgcmVwcmVzZW50cyBhIGtleSBzaWduYXR1cmUsIGxpa2UgRyBNYWpvclxuICogb3IgQi1mbGF0IE1ham9yLiAgRm9yIHNoZWV0IG11c2ljLCB3ZSBvbmx5IGNhcmUgYWJvdXQgdGhlIG51bWJlclxuICogb2Ygc2hhcnBzIG9yIGZsYXRzIGluIHRoZSBrZXkgc2lnbmF0dXJlLCBub3Qgd2hldGhlciBpdCBpcyBtYWpvclxuICogb3IgbWlub3IuXG4gKlxuICogVGhlIG1haW4gb3BlcmF0aW9ucyBvZiB0aGlzIGNsYXNzIGFyZTpcbiAqIC0gR3Vlc3NpbmcgdGhlIGtleSBzaWduYXR1cmUsIGdpdmVuIHRoZSBub3RlcyBpbiBhIHNvbmcuXG4gKiAtIEdlbmVyYXRpbmcgdGhlIGFjY2lkZW50YWwgc3ltYm9scyBmb3IgdGhlIGtleSBzaWduYXR1cmUuXG4gKiAtIERldGVybWluaW5nIHdoZXRoZXIgYSBwYXJ0aWN1bGFyIG5vdGUgcmVxdWlyZXMgYW4gYWNjaWRlbnRhbFxuICogICBvciBub3QuXG4gKlxuICovXG5cbnB1YmxpYyBjbGFzcyBLZXlTaWduYXR1cmUge1xuICAgIC8qKiBUaGUgbnVtYmVyIG9mIHNoYXJwcyBpbiBlYWNoIGtleSBzaWduYXR1cmUgKi9cbiAgICBwdWJsaWMgY29uc3QgaW50IEMgPSAwO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRyA9IDE7XG4gICAgcHVibGljIGNvbnN0IGludCBEID0gMjtcbiAgICBwdWJsaWMgY29uc3QgaW50IEEgPSAzO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRSA9IDQ7XG4gICAgcHVibGljIGNvbnN0IGludCBCID0gNTtcblxuICAgIC8qKiBUaGUgbnVtYmVyIG9mIGZsYXRzIGluIGVhY2gga2V5IHNpZ25hdHVyZSAqL1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRiA9IDE7XG4gICAgcHVibGljIGNvbnN0IGludCBCZmxhdCA9IDI7XG4gICAgcHVibGljIGNvbnN0IGludCBFZmxhdCA9IDM7XG4gICAgcHVibGljIGNvbnN0IGludCBBZmxhdCA9IDQ7XG4gICAgcHVibGljIGNvbnN0IGludCBEZmxhdCA9IDU7XG4gICAgcHVibGljIGNvbnN0IGludCBHZmxhdCA9IDY7XG5cbiAgICAvKiogVGhlIHR3byBhcnJheXMgYmVsb3cgYXJlIGtleSBtYXBzLiAgVGhleSB0YWtlIGEgbWFqb3Iga2V5XG4gICAgICogKGxpa2UgRyBtYWpvciwgQi1mbGF0IG1ham9yKSBhbmQgYSBub3RlIGluIHRoZSBzY2FsZSwgYW5kXG4gICAgICogcmV0dXJuIHRoZSBBY2NpZGVudGFsIHJlcXVpcmVkIHRvIGRpc3BsYXkgdGhhdCBub3RlIGluIHRoZVxuICAgICAqIGdpdmVuIGtleS4gIEluIGEgbnV0c2hlbCwgdGhlIG1hcCBpc1xuICAgICAqXG4gICAgICogICBtYXBbS2V5XVtOb3RlU2NhbGVdIC0+IEFjY2lkZW50YWxcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBBY2NpZFtdW10gc2hhcnBrZXlzO1xuICAgIHByaXZhdGUgc3RhdGljIEFjY2lkW11bXSBmbGF0a2V5cztcblxuICAgIHByaXZhdGUgaW50IG51bV9mbGF0czsgICAvKiogVGhlIG51bWJlciBvZiBzaGFycHMgaW4gdGhlIGtleSwgMCB0aHJ1IDYgKi9cbiAgICBwcml2YXRlIGludCBudW1fc2hhcnBzOyAgLyoqIFRoZSBudW1iZXIgb2YgZmxhdHMgaW4gdGhlIGtleSwgMCB0aHJ1IDYgKi9cblxuICAgIC8qKiBUaGUgYWNjaWRlbnRhbCBzeW1ib2xzIHRoYXQgZGVub3RlIHRoaXMga2V5LCBpbiBhIHRyZWJsZSBjbGVmICovXG4gICAgcHJpdmF0ZSBBY2NpZFN5bWJvbFtdIHRyZWJsZTtcblxuICAgIC8qKiBUaGUgYWNjaWRlbnRhbCBzeW1ib2xzIHRoYXQgZGVub3RlIHRoaXMga2V5LCBpbiBhIGJhc3MgY2xlZiAqL1xuICAgIHByaXZhdGUgQWNjaWRTeW1ib2xbXSBiYXNzO1xuXG4gICAgLyoqIFRoZSBrZXkgbWFwIGZvciB0aGlzIGtleSBzaWduYXR1cmU6XG4gICAgICogICBrZXltYXBbbm90ZW51bWJlcl0gLT4gQWNjaWRlbnRhbFxuICAgICAqL1xuICAgIHByaXZhdGUgQWNjaWRbXSBrZXltYXA7XG5cbiAgICAvKiogVGhlIG1lYXN1cmUgdXNlZCBpbiB0aGUgcHJldmlvdXMgY2FsbCB0byBHZXRBY2NpZGVudGFsKCkgKi9cbiAgICBwcml2YXRlIGludCBwcmV2bWVhc3VyZTsgXG5cblxuICAgIC8qKiBDcmVhdGUgbmV3IGtleSBzaWduYXR1cmUsIHdpdGggdGhlIGdpdmVuIG51bWJlciBvZlxuICAgICAqIHNoYXJwcyBhbmQgZmxhdHMuICBPbmUgb2YgdGhlIHR3byBtdXN0IGJlIDAsIHlvdSBjYW4ndFxuICAgICAqIGhhdmUgYm90aCBzaGFycHMgYW5kIGZsYXRzIGluIHRoZSBrZXkgc2lnbmF0dXJlLlxuICAgICAqL1xuICAgIHB1YmxpYyBLZXlTaWduYXR1cmUoaW50IG51bV9zaGFycHMsIGludCBudW1fZmxhdHMpIHtcbiAgICAgICAgaWYgKCEobnVtX3NoYXJwcyA9PSAwIHx8IG51bV9mbGF0cyA9PSAwKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFN5c3RlbS5Bcmd1bWVudEV4Y2VwdGlvbihcIkJhZCBLZXlTaWdhdHVyZSBhcmdzXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubnVtX3NoYXJwcyA9IG51bV9zaGFycHM7XG4gICAgICAgIHRoaXMubnVtX2ZsYXRzID0gbnVtX2ZsYXRzO1xuXG4gICAgICAgIENyZWF0ZUFjY2lkZW50YWxNYXBzKCk7XG4gICAgICAgIGtleW1hcCA9IG5ldyBBY2NpZFsxNjBdO1xuICAgICAgICBSZXNldEtleU1hcCgpO1xuICAgICAgICBDcmVhdGVTeW1ib2xzKCk7XG4gICAgfVxuXG4gICAgLyoqIENyZWF0ZSBuZXcga2V5IHNpZ25hdHVyZSwgd2l0aCB0aGUgZ2l2ZW4gbm90ZXNjYWxlLiAgKi9cbiAgICBwdWJsaWMgS2V5U2lnbmF0dXJlKGludCBub3Rlc2NhbGUpIHtcbiAgICAgICAgbnVtX3NoYXJwcyA9IG51bV9mbGF0cyA9IDA7XG4gICAgICAgIHN3aXRjaCAobm90ZXNjYWxlKSB7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5BOiAgICAgbnVtX3NoYXJwcyA9IDM7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQmZsYXQ6IG51bV9mbGF0cyA9IDI7ICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkI6ICAgICBudW1fc2hhcnBzID0gNTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5DOiAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5EZmxhdDogbnVtX2ZsYXRzID0gNTsgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRDogICAgIG51bV9zaGFycHMgPSAyOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkVmbGF0OiBudW1fZmxhdHMgPSAzOyAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5FOiAgICAgbnVtX3NoYXJwcyA9IDQ7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRjogICAgIG51bV9mbGF0cyA9IDE7ICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkdmbGF0OiBudW1fZmxhdHMgPSA2OyAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5HOiAgICAgbnVtX3NoYXJwcyA9IDE7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQWZsYXQ6IG51bV9mbGF0cyA9IDQ7ICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6ICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIENyZWF0ZUFjY2lkZW50YWxNYXBzKCk7XG4gICAgICAgIGtleW1hcCA9IG5ldyBBY2NpZFsxNjBdO1xuICAgICAgICBSZXNldEtleU1hcCgpO1xuICAgICAgICBDcmVhdGVTeW1ib2xzKCk7XG4gICAgfVxuXG5cbiAgICAvKiogSW5paXRhbGl6ZSB0aGUgc2hhcnBrZXlzIGFuZCBmbGF0a2V5cyBtYXBzICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBDcmVhdGVBY2NpZGVudGFsTWFwcygpIHtcbiAgICAgICAgaWYgKHNoYXJwa2V5cyAhPSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuOyBcblxuICAgICAgICBBY2NpZFtdIG1hcDtcbiAgICAgICAgc2hhcnBrZXlzID0gbmV3IEFjY2lkWzhdW107XG4gICAgICAgIGZsYXRrZXlzID0gbmV3IEFjY2lkWzhdW107XG5cbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgICAgICAgIHNoYXJwa2V5c1tpXSA9IG5ldyBBY2NpZFsxMl07XG4gICAgICAgICAgICBmbGF0a2V5c1tpXSA9IG5ldyBBY2NpZFsxMl07XG4gICAgICAgIH1cblxuICAgICAgICBtYXAgPSBzaGFycGtleXNbQ107XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQXNoYXJwIF0gPSBBY2NpZC5GbGF0O1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQ3NoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRCBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Ec2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRnNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Hc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuXG4gICAgICAgIG1hcCA9IHNoYXJwa2V5c1tHXTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Bc2hhcnAgXSA9IEFjY2lkLkZsYXQ7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Dc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Gc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuR3NoYXJwIF0gPSBBY2NpZC5TaGFycDtcblxuICAgICAgICBtYXAgPSBzaGFycGtleXNbRF07XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQXNoYXJwIF0gPSBBY2NpZC5GbGF0O1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQ3NoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Gc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuR3NoYXJwIF0gPSBBY2NpZC5TaGFycDtcblxuICAgICAgICBtYXAgPSBzaGFycGtleXNbQV07XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQXNoYXJwIF0gPSBBY2NpZC5GbGF0O1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQ3NoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Gc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuR3NoYXJwIF0gPSBBY2NpZC5Ob25lO1xuXG4gICAgICAgIG1hcCA9IHNoYXJwa2V5c1tFXTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Bc2hhcnAgXSA9IEFjY2lkLkZsYXQ7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Dc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRHNoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRnNoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkdzaGFycCBdID0gQWNjaWQuTm9uZTtcblxuICAgICAgICBtYXAgPSBzaGFycGtleXNbQl07XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQXNoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQ3NoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRzaGFycCBdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Hc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG5cbiAgICAgICAgLyogRmxhdCBrZXlzICovXG4gICAgICAgIG1hcCA9IGZsYXRrZXlzW0NdO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkFzaGFycCBdID0gQWNjaWQuRmxhdDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkNzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRHNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuR3NoYXJwIF0gPSBBY2NpZC5TaGFycDtcblxuICAgICAgICBtYXAgPSBmbGF0a2V5c1tGXTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Dc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkVmbGF0IF0gID0gQWNjaWQuRmxhdDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQWZsYXQgXSAgPSBBY2NpZC5GbGF0O1xuXG4gICAgICAgIG1hcCA9IGZsYXRrZXlzW0JmbGF0XTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Dc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkVmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQWZsYXQgXSAgPSBBY2NpZC5GbGF0O1xuXG4gICAgICAgIG1hcCA9IGZsYXRrZXlzW0VmbGF0XTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EZmxhdCBdICA9IEFjY2lkLkZsYXQ7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRWZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRnNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BZmxhdCBdICA9IEFjY2lkLk5vbmU7XG5cbiAgICAgICAgbWFwID0gZmxhdGtleXNbQWZsYXRdO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkJmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRCBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Gc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkFmbGF0IF0gID0gQWNjaWQuTm9uZTtcblxuICAgICAgICBtYXAgPSBmbGF0a2V5c1tEZmxhdF07XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQmZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRGZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkVmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkdmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BZmxhdCBdICA9IEFjY2lkLk5vbmU7XG5cbiAgICAgICAgbWFwID0gZmxhdGtleXNbR2ZsYXRdO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkJmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRCBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQWZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuXG5cbiAgICB9XG5cbiAgICAvKiogVGhlIGtleW1hcCB0ZWxscyB3aGF0IGFjY2lkZW50YWwgc3ltYm9sIGlzIG5lZWRlZCBmb3IgZWFjaFxuICAgICAqICBub3RlIGluIHRoZSBzY2FsZS4gIFJlc2V0IHRoZSBrZXltYXAgdG8gdGhlIHZhbHVlcyBvZiB0aGVcbiAgICAgKiAga2V5IHNpZ25hdHVyZS5cbiAgICAgKi9cbiAgICBwcml2YXRlIHZvaWQgUmVzZXRLZXlNYXAoKVxuICAgIHtcbiAgICAgICAgQWNjaWRbXSBrZXk7XG4gICAgICAgIGlmIChudW1fZmxhdHMgPiAwKVxuICAgICAgICAgICAga2V5ID0gZmxhdGtleXNbbnVtX2ZsYXRzXTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAga2V5ID0gc2hhcnBrZXlzW251bV9zaGFycHNdO1xuXG4gICAgICAgIGZvciAoaW50IG5vdGVudW1iZXIgPSAwOyBub3RlbnVtYmVyIDwga2V5bWFwLkxlbmd0aDsgbm90ZW51bWJlcisrKSB7XG4gICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlcl0gPSBrZXlbTm90ZVNjYWxlLkZyb21OdW1iZXIobm90ZW51bWJlcildO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKiogQ3JlYXRlIHRoZSBBY2NpZGVudGFsIHN5bWJvbHMgZm9yIHRoaXMga2V5LCBmb3JcbiAgICAgKiB0aGUgdHJlYmxlIGFuZCBiYXNzIGNsZWZzLlxuICAgICAqL1xuICAgIHByaXZhdGUgdm9pZCBDcmVhdGVTeW1ib2xzKCkge1xuICAgICAgICBpbnQgY291bnQgPSBNYXRoLk1heChudW1fc2hhcnBzLCBudW1fZmxhdHMpO1xuICAgICAgICB0cmVibGUgPSBuZXcgQWNjaWRTeW1ib2xbY291bnRdO1xuICAgICAgICBiYXNzID0gbmV3IEFjY2lkU3ltYm9sW2NvdW50XTtcblxuICAgICAgICBpZiAoY291bnQgPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgV2hpdGVOb3RlW10gdHJlYmxlbm90ZXMgPSBudWxsO1xuICAgICAgICBXaGl0ZU5vdGVbXSBiYXNzbm90ZXMgPSBudWxsO1xuXG4gICAgICAgIGlmIChudW1fc2hhcnBzID4gMCkgIHtcbiAgICAgICAgICAgIHRyZWJsZW5vdGVzID0gbmV3IFdoaXRlTm90ZVtdIHtcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5GLCA1KSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5DLCA1KSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5HLCA1KSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5ELCA1KSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5BLCA2KSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5FLCA1KVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGJhc3Nub3RlcyA9IG5ldyBXaGl0ZU5vdGVbXSB7XG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRiwgMyksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQywgMyksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRywgMyksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRCwgMyksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQSwgNCksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRSwgMylcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobnVtX2ZsYXRzID4gMCkge1xuICAgICAgICAgICAgdHJlYmxlbm90ZXMgPSBuZXcgV2hpdGVOb3RlW10ge1xuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkIsIDUpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkUsIDUpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkEsIDUpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkQsIDUpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkcsIDQpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkMsIDUpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgYmFzc25vdGVzID0gbmV3IFdoaXRlTm90ZVtdIHtcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5CLCAzKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5FLCAzKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5BLCAzKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5ELCAzKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5HLCAyKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5DLCAzKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIEFjY2lkIGEgPSBBY2NpZC5Ob25lO1xuICAgICAgICBpZiAobnVtX3NoYXJwcyA+IDApXG4gICAgICAgICAgICBhID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGEgPSBBY2NpZC5GbGF0O1xuXG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgdHJlYmxlW2ldID0gbmV3IEFjY2lkU3ltYm9sKGEsIHRyZWJsZW5vdGVzW2ldLCBDbGVmLlRyZWJsZSk7XG4gICAgICAgICAgICBiYXNzW2ldID0gbmV3IEFjY2lkU3ltYm9sKGEsIGJhc3Nub3Rlc1tpXSwgQ2xlZi5CYXNzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIEFjY2lkZW50YWwgc3ltYm9scyBmb3IgZGlzcGxheWluZyB0aGlzIGtleSBzaWduYXR1cmVcbiAgICAgKiBmb3IgdGhlIGdpdmVuIGNsZWYuXG4gICAgICovXG4gICAgcHVibGljIEFjY2lkU3ltYm9sW10gR2V0U3ltYm9scyhDbGVmIGNsZWYpIHtcbiAgICAgICAgaWYgKGNsZWYgPT0gQ2xlZi5UcmVibGUpXG4gICAgICAgICAgICByZXR1cm4gdHJlYmxlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gYmFzcztcbiAgICB9XG5cbiAgICAvKiogR2l2ZW4gYSBtaWRpIG5vdGUgbnVtYmVyLCByZXR1cm4gdGhlIGFjY2lkZW50YWwgKGlmIGFueSkgXG4gICAgICogdGhhdCBzaG91bGQgYmUgdXNlZCB3aGVuIGRpc3BsYXlpbmcgdGhlIG5vdGUgaW4gdGhpcyBrZXkgc2lnbmF0dXJlLlxuICAgICAqXG4gICAgICogVGhlIGN1cnJlbnQgbWVhc3VyZSBpcyBhbHNvIHJlcXVpcmVkLiAgT25jZSB3ZSByZXR1cm4gYW5cbiAgICAgKiBhY2NpZGVudGFsIGZvciBhIG1lYXN1cmUsIHRoZSBhY2NpZGVudGFsIHJlbWFpbnMgZm9yIHRoZVxuICAgICAqIHJlc3Qgb2YgdGhlIG1lYXN1cmUuIFNvIHdlIG11c3QgdXBkYXRlIHRoZSBjdXJyZW50IGtleW1hcFxuICAgICAqIHdpdGggYW55IG5ldyBhY2NpZGVudGFscyB0aGF0IHdlIHJldHVybi4gIFdoZW4gd2UgbW92ZSB0byBhbm90aGVyXG4gICAgICogbWVhc3VyZSwgd2UgcmVzZXQgdGhlIGtleW1hcCBiYWNrIHRvIHRoZSBrZXkgc2lnbmF0dXJlLlxuICAgICAqL1xuICAgIHB1YmxpYyBBY2NpZCBHZXRBY2NpZGVudGFsKGludCBub3RlbnVtYmVyLCBpbnQgbWVhc3VyZSkge1xuICAgICAgICBpZiAobWVhc3VyZSAhPSBwcmV2bWVhc3VyZSkge1xuICAgICAgICAgICAgUmVzZXRLZXlNYXAoKTtcbiAgICAgICAgICAgIHByZXZtZWFzdXJlID0gbWVhc3VyZTtcbiAgICAgICAgfVxuXG4gICAgICAgIEFjY2lkIHJlc3VsdCA9IGtleW1hcFtub3RlbnVtYmVyXTtcbiAgICAgICAgaWYgKHJlc3VsdCA9PSBBY2NpZC5TaGFycCkge1xuICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXJdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgICAgIGtleW1hcFtub3RlbnVtYmVyLTFdID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChyZXN1bHQgPT0gQWNjaWQuRmxhdCkge1xuICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXJdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgICAgIGtleW1hcFtub3RlbnVtYmVyKzFdID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChyZXN1bHQgPT0gQWNjaWQuTmF0dXJhbCkge1xuICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXJdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgICAgIGludCBuZXh0a2V5ID0gTm90ZVNjYWxlLkZyb21OdW1iZXIobm90ZW51bWJlcisxKTtcbiAgICAgICAgICAgIGludCBwcmV2a2V5ID0gTm90ZVNjYWxlLkZyb21OdW1iZXIobm90ZW51bWJlci0xKTtcblxuICAgICAgICAgICAgLyogSWYgd2UgaW5zZXJ0IGEgbmF0dXJhbCwgdGhlbiBlaXRoZXI6XG4gICAgICAgICAgICAgKiAtIHRoZSBuZXh0IGtleSBtdXN0IGdvIGJhY2sgdG8gc2hhcnAsXG4gICAgICAgICAgICAgKiAtIHRoZSBwcmV2aW91cyBrZXkgbXVzdCBnbyBiYWNrIHRvIGZsYXQuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlmIChrZXltYXBbbm90ZW51bWJlci0xXSA9PSBBY2NpZC5Ob25lICYmIGtleW1hcFtub3RlbnVtYmVyKzFdID09IEFjY2lkLk5vbmUgJiZcbiAgICAgICAgICAgICAgICBOb3RlU2NhbGUuSXNCbGFja0tleShuZXh0a2V5KSAmJiBOb3RlU2NhbGUuSXNCbGFja0tleShwcmV2a2V5KSApIHtcblxuICAgICAgICAgICAgICAgIGlmIChudW1fZmxhdHMgPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlcisxXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXItMV0gPSBBY2NpZC5GbGF0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGtleW1hcFtub3RlbnVtYmVyLTFdID09IEFjY2lkLk5vbmUgJiYgTm90ZVNjYWxlLklzQmxhY2tLZXkocHJldmtleSkpIHtcbiAgICAgICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlci0xXSA9IEFjY2lkLkZsYXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChrZXltYXBbbm90ZW51bWJlcisxXSA9PSBBY2NpZC5Ob25lICYmIE5vdGVTY2FsZS5Jc0JsYWNrS2V5KG5leHRrZXkpKSB7XG4gICAgICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXIrMV0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8qIFNob3VsZG4ndCBnZXQgaGVyZSAqL1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG5cbiAgICAvKiogR2l2ZW4gYSBtaWRpIG5vdGUgbnVtYmVyLCByZXR1cm4gdGhlIHdoaXRlIG5vdGUgKHRoZVxuICAgICAqIG5vbi1zaGFycC9ub24tZmxhdCBub3RlKSB0aGF0IHNob3VsZCBiZSB1c2VkIHdoZW4gZGlzcGxheWluZ1xuICAgICAqIHRoaXMgbm90ZSBpbiB0aGlzIGtleSBzaWduYXR1cmUuICBUaGlzIHNob3VsZCBiZSBjYWxsZWRcbiAgICAgKiBiZWZvcmUgY2FsbGluZyBHZXRBY2NpZGVudGFsKCkuXG4gICAgICovXG4gICAgcHVibGljIFdoaXRlTm90ZSBHZXRXaGl0ZU5vdGUoaW50IG5vdGVudW1iZXIpIHtcbiAgICAgICAgaW50IG5vdGVzY2FsZSA9IE5vdGVTY2FsZS5Gcm9tTnVtYmVyKG5vdGVudW1iZXIpO1xuICAgICAgICBpbnQgb2N0YXZlID0gKG5vdGVudW1iZXIgKyAzKSAvIDEyIC0gMTtcbiAgICAgICAgaW50IGxldHRlciA9IDA7XG5cbiAgICAgICAgaW50W10gd2hvbGVfc2hhcnBzID0geyBcbiAgICAgICAgICAgIFdoaXRlTm90ZS5BLCBXaGl0ZU5vdGUuQSwgXG4gICAgICAgICAgICBXaGl0ZU5vdGUuQiwgXG4gICAgICAgICAgICBXaGl0ZU5vdGUuQywgV2hpdGVOb3RlLkMsXG4gICAgICAgICAgICBXaGl0ZU5vdGUuRCwgV2hpdGVOb3RlLkQsXG4gICAgICAgICAgICBXaGl0ZU5vdGUuRSxcbiAgICAgICAgICAgIFdoaXRlTm90ZS5GLCBXaGl0ZU5vdGUuRixcbiAgICAgICAgICAgIFdoaXRlTm90ZS5HLCBXaGl0ZU5vdGUuR1xuICAgICAgICB9O1xuXG4gICAgICAgIGludFtdIHdob2xlX2ZsYXRzID0ge1xuICAgICAgICAgICAgV2hpdGVOb3RlLkEsIFxuICAgICAgICAgICAgV2hpdGVOb3RlLkIsIFdoaXRlTm90ZS5CLFxuICAgICAgICAgICAgV2hpdGVOb3RlLkMsXG4gICAgICAgICAgICBXaGl0ZU5vdGUuRCwgV2hpdGVOb3RlLkQsXG4gICAgICAgICAgICBXaGl0ZU5vdGUuRSwgV2hpdGVOb3RlLkUsXG4gICAgICAgICAgICBXaGl0ZU5vdGUuRixcbiAgICAgICAgICAgIFdoaXRlTm90ZS5HLCBXaGl0ZU5vdGUuRyxcbiAgICAgICAgICAgIFdoaXRlTm90ZS5BXG4gICAgICAgIH07XG5cbiAgICAgICAgQWNjaWQgYWNjaWQgPSBrZXltYXBbbm90ZW51bWJlcl07XG4gICAgICAgIGlmIChhY2NpZCA9PSBBY2NpZC5GbGF0KSB7XG4gICAgICAgICAgICBsZXR0ZXIgPSB3aG9sZV9mbGF0c1tub3Rlc2NhbGVdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFjY2lkID09IEFjY2lkLlNoYXJwKSB7XG4gICAgICAgICAgICBsZXR0ZXIgPSB3aG9sZV9zaGFycHNbbm90ZXNjYWxlXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhY2NpZCA9PSBBY2NpZC5OYXR1cmFsKSB7XG4gICAgICAgICAgICBsZXR0ZXIgPSB3aG9sZV9zaGFycHNbbm90ZXNjYWxlXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhY2NpZCA9PSBBY2NpZC5Ob25lKSB7XG4gICAgICAgICAgICBsZXR0ZXIgPSB3aG9sZV9zaGFycHNbbm90ZXNjYWxlXTtcblxuICAgICAgICAgICAgLyogSWYgdGhlIG5vdGUgbnVtYmVyIGlzIGEgc2hhcnAvZmxhdCwgYW5kIHRoZXJlJ3Mgbm8gYWNjaWRlbnRhbCxcbiAgICAgICAgICAgICAqIGRldGVybWluZSB0aGUgd2hpdGUgbm90ZSBieSBzZWVpbmcgd2hldGhlciB0aGUgcHJldmlvdXMgb3IgbmV4dCBub3RlXG4gICAgICAgICAgICAgKiBpcyBhIG5hdHVyYWwuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlmIChOb3RlU2NhbGUuSXNCbGFja0tleShub3Rlc2NhbGUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleW1hcFtub3RlbnVtYmVyLTFdID09IEFjY2lkLk5hdHVyYWwgJiYgXG4gICAgICAgICAgICAgICAgICAgIGtleW1hcFtub3RlbnVtYmVyKzFdID09IEFjY2lkLk5hdHVyYWwpIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAobnVtX2ZsYXRzID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0dGVyID0gd2hvbGVfZmxhdHNbbm90ZXNjYWxlXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldHRlciA9IHdob2xlX3NoYXJwc1tub3Rlc2NhbGVdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGtleW1hcFtub3RlbnVtYmVyLTFdID09IEFjY2lkLk5hdHVyYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0dGVyID0gd2hvbGVfc2hhcnBzW25vdGVzY2FsZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGtleW1hcFtub3RlbnVtYmVyKzFdID09IEFjY2lkLk5hdHVyYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0dGVyID0gd2hvbGVfZmxhdHNbbm90ZXNjYWxlXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBUaGUgYWJvdmUgYWxnb3JpdGhtIGRvZXNuJ3QgcXVpdGUgd29yayBmb3IgRy1mbGF0IG1ham9yLlxuICAgICAgICAgKiBIYW5kbGUgaXQgaGVyZS5cbiAgICAgICAgICovXG4gICAgICAgIGlmIChudW1fZmxhdHMgPT0gR2ZsYXQgJiYgbm90ZXNjYWxlID09IE5vdGVTY2FsZS5CKSB7XG4gICAgICAgICAgICBsZXR0ZXIgPSBXaGl0ZU5vdGUuQztcbiAgICAgICAgfVxuICAgICAgICBpZiAobnVtX2ZsYXRzID09IEdmbGF0ICYmIG5vdGVzY2FsZSA9PSBOb3RlU2NhbGUuQmZsYXQpIHtcbiAgICAgICAgICAgIGxldHRlciA9IFdoaXRlTm90ZS5CO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG51bV9mbGF0cyA+IDAgJiYgbm90ZXNjYWxlID09IE5vdGVTY2FsZS5BZmxhdCkge1xuICAgICAgICAgICAgb2N0YXZlKys7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFdoaXRlTm90ZShsZXR0ZXIsIG9jdGF2ZSk7XG4gICAgfVxuXG5cbiAgICAvKiogR3Vlc3MgdGhlIGtleSBzaWduYXR1cmUsIGdpdmVuIHRoZSBtaWRpIG5vdGUgbnVtYmVycyB1c2VkIGluXG4gICAgICogdGhlIHNvbmcuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBLZXlTaWduYXR1cmUgR3Vlc3MoTGlzdDxpbnQ+IG5vdGVzKSB7XG4gICAgICAgIENyZWF0ZUFjY2lkZW50YWxNYXBzKCk7XG5cbiAgICAgICAgLyogR2V0IHRoZSBmcmVxdWVuY3kgY291bnQgb2YgZWFjaCBub3RlIGluIHRoZSAxMi1ub3RlIHNjYWxlICovXG4gICAgICAgIGludFtdIG5vdGVjb3VudCA9IG5ldyBpbnRbMTJdO1xuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IG5vdGVzLkNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGludCBub3RlbnVtYmVyID0gbm90ZXNbaV07XG4gICAgICAgICAgICBpbnQgbm90ZXNjYWxlID0gKG5vdGVudW1iZXIgKyAzKSAlIDEyO1xuICAgICAgICAgICAgbm90ZWNvdW50W25vdGVzY2FsZV0gKz0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIEZvciBlYWNoIGtleSBzaWduYXR1cmUsIGNvdW50IHRoZSB0b3RhbCBudW1iZXIgb2YgYWNjaWRlbnRhbHNcbiAgICAgICAgICogbmVlZGVkIHRvIGRpc3BsYXkgYWxsIHRoZSBub3Rlcy4gIENob29zZSB0aGUga2V5IHNpZ25hdHVyZVxuICAgICAgICAgKiB3aXRoIHRoZSBmZXdlc3QgYWNjaWRlbnRhbHMuXG4gICAgICAgICAqL1xuICAgICAgICBpbnQgYmVzdGtleSA9IDA7XG4gICAgICAgIGJvb2wgaXNfYmVzdF9zaGFycCA9IHRydWU7XG4gICAgICAgIGludCBzbWFsbGVzdF9hY2NpZF9jb3VudCA9IG5vdGVzLkNvdW50O1xuICAgICAgICBpbnQga2V5O1xuXG4gICAgICAgIGZvciAoa2V5ID0gMDsga2V5IDwgNjsga2V5KyspIHtcbiAgICAgICAgICAgIGludCBhY2NpZF9jb3VudCA9IDA7XG4gICAgICAgICAgICBmb3IgKGludCBuID0gMDsgbiA8IDEyOyBuKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoc2hhcnBrZXlzW2tleV1bbl0gIT0gQWNjaWQuTm9uZSkge1xuICAgICAgICAgICAgICAgICAgICBhY2NpZF9jb3VudCArPSBub3RlY291bnRbbl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFjY2lkX2NvdW50IDwgc21hbGxlc3RfYWNjaWRfY291bnQpIHtcbiAgICAgICAgICAgICAgICBzbWFsbGVzdF9hY2NpZF9jb3VudCA9IGFjY2lkX2NvdW50O1xuICAgICAgICAgICAgICAgIGJlc3RrZXkgPSBrZXk7XG4gICAgICAgICAgICAgICAgaXNfYmVzdF9zaGFycCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGtleSA9IDA7IGtleSA8IDc7IGtleSsrKSB7XG4gICAgICAgICAgICBpbnQgYWNjaWRfY291bnQgPSAwO1xuICAgICAgICAgICAgZm9yIChpbnQgbiA9IDA7IG4gPCAxMjsgbisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZsYXRrZXlzW2tleV1bbl0gIT0gQWNjaWQuTm9uZSkge1xuICAgICAgICAgICAgICAgICAgICBhY2NpZF9jb3VudCArPSBub3RlY291bnRbbl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFjY2lkX2NvdW50IDwgc21hbGxlc3RfYWNjaWRfY291bnQpIHtcbiAgICAgICAgICAgICAgICBzbWFsbGVzdF9hY2NpZF9jb3VudCA9IGFjY2lkX2NvdW50O1xuICAgICAgICAgICAgICAgIGJlc3RrZXkgPSBrZXk7XG4gICAgICAgICAgICAgICAgaXNfYmVzdF9zaGFycCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChpc19iZXN0X3NoYXJwKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEtleVNpZ25hdHVyZShiZXN0a2V5LCAwKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgS2V5U2lnbmF0dXJlKDAsIGJlc3RrZXkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0cnVlIGlmIHRoaXMga2V5IHNpZ25hdHVyZSBpcyBlcXVhbCB0byBrZXkgc2lnbmF0dXJlIGsgKi9cbiAgICBwdWJsaWMgYm9vbCBFcXVhbHMoS2V5U2lnbmF0dXJlIGspIHtcbiAgICAgICAgaWYgKGsubnVtX3NoYXJwcyA9PSBudW1fc2hhcnBzICYmIGsubnVtX2ZsYXRzID09IG51bV9mbGF0cylcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyogUmV0dXJuIHRoZSBNYWpvciBLZXkgb2YgdGhpcyBLZXkgU2lnbmF0dXJlICovXG4gICAgcHVibGljIGludCBOb3Rlc2NhbGUoKSB7XG4gICAgICAgIGludFtdIGZsYXRtYWpvciA9IHtcbiAgICAgICAgICAgIE5vdGVTY2FsZS5DLCBOb3RlU2NhbGUuRiwgTm90ZVNjYWxlLkJmbGF0LCBOb3RlU2NhbGUuRWZsYXQsXG4gICAgICAgICAgICBOb3RlU2NhbGUuQWZsYXQsIE5vdGVTY2FsZS5EZmxhdCwgTm90ZVNjYWxlLkdmbGF0LCBOb3RlU2NhbGUuQiBcbiAgICAgICAgfTtcblxuICAgICAgICBpbnRbXSBzaGFycG1ham9yID0ge1xuICAgICAgICAgICAgTm90ZVNjYWxlLkMsIE5vdGVTY2FsZS5HLCBOb3RlU2NhbGUuRCwgTm90ZVNjYWxlLkEsIE5vdGVTY2FsZS5FLFxuICAgICAgICAgICAgTm90ZVNjYWxlLkIsIE5vdGVTY2FsZS5Gc2hhcnAsIE5vdGVTY2FsZS5Dc2hhcnAsIE5vdGVTY2FsZS5Hc2hhcnAsXG4gICAgICAgICAgICBOb3RlU2NhbGUuRHNoYXJwXG4gICAgICAgIH07XG4gICAgICAgIGlmIChudW1fZmxhdHMgPiAwKVxuICAgICAgICAgICAgcmV0dXJuIGZsYXRtYWpvcltudW1fZmxhdHNdO1xuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgcmV0dXJuIHNoYXJwbWFqb3JbbnVtX3NoYXJwc107XG4gICAgfVxuXG4gICAgLyogQ29udmVydCBhIE1ham9yIEtleSBpbnRvIGEgc3RyaW5nICovXG4gICAgcHVibGljIHN0YXRpYyBzdHJpbmcgS2V5VG9TdHJpbmcoaW50IG5vdGVzY2FsZSkge1xuICAgICAgICBzd2l0Y2ggKG5vdGVzY2FsZSkge1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQTogICAgIHJldHVybiBcIkEgbWFqb3IsIEYjIG1pbm9yXCIgO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQmZsYXQ6IHJldHVybiBcIkItZmxhdCBtYWpvciwgRyBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQjogICAgIHJldHVybiBcIkIgbWFqb3IsIEEtZmxhdCBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQzogICAgIHJldHVybiBcIkMgbWFqb3IsIEEgbWlub3JcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkRmbGF0OiByZXR1cm4gXCJELWZsYXQgbWFqb3IsIEItZmxhdCBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRDogICAgIHJldHVybiBcIkQgbWFqb3IsIEIgbWlub3JcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkVmbGF0OiByZXR1cm4gXCJFLWZsYXQgbWFqb3IsIEMgbWlub3JcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkU6ICAgICByZXR1cm4gXCJFIG1ham9yLCBDIyBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRjogICAgIHJldHVybiBcIkYgbWFqb3IsIEQgbWlub3JcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkdmbGF0OiByZXR1cm4gXCJHLWZsYXQgbWFqb3IsIEUtZmxhdCBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRzogICAgIHJldHVybiBcIkcgbWFqb3IsIEUgbWlub3JcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkFmbGF0OiByZXR1cm4gXCJBLWZsYXQgbWFqb3IsIEYgbWlub3JcIjtcbiAgICAgICAgICAgIGRlZmF1bHQ6ICAgICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGlzIGtleSBzaWduYXR1cmUuXG4gICAgICogV2Ugb25seSByZXR1cm4gdGhlIG1ham9yIGtleSBzaWduYXR1cmUsIG5vdCB0aGUgbWlub3Igb25lLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBLZXlUb1N0cmluZyggTm90ZXNjYWxlKCkgKTtcbiAgICB9XG5cblxufVxuXG59XG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTIgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIEBjbGFzcyBMeXJpY1N5bWJvbFxuICogIEEgbHlyaWMgY29udGFpbnMgdGhlIGx5cmljIHRvIGRpc3BsYXksIHRoZSBzdGFydCB0aW1lIHRoZSBseXJpYyBvY2N1cnMgYXQsXG4gKiAgdGhlIHRoZSB4LWNvb3JkaW5hdGUgd2hlcmUgaXQgd2lsbCBiZSBkaXNwbGF5ZWQuXG4gKi9cbnB1YmxpYyBjbGFzcyBMeXJpY1N5bWJvbCB7XG4gICAgcHJpdmF0ZSBpbnQgc3RhcnR0aW1lOyAgIC8qKiBUaGUgc3RhcnQgdGltZSwgaW4gcHVsc2VzICovXG4gICAgcHJpdmF0ZSBzdHJpbmcgdGV4dDsgICAgIC8qKiBUaGUgbHlyaWMgdGV4dCAqL1xuICAgIHByaXZhdGUgaW50IHg7ICAgICAgICAgICAvKiogVGhlIHggKGhvcml6b250YWwpIHBvc2l0aW9uIHdpdGhpbiB0aGUgc3RhZmYgKi9cblxuICAgIHB1YmxpYyBMeXJpY1N5bWJvbChpbnQgc3RhcnR0aW1lLCBzdHJpbmcgdGV4dCkge1xuICAgICAgICB0aGlzLnN0YXJ0dGltZSA9IHN0YXJ0dGltZTsgXG4gICAgICAgIHRoaXMudGV4dCA9IHRleHQ7XG4gICAgfVxuICAgICBcbiAgICBwdWJsaWMgaW50IFN0YXJ0VGltZSB7XG4gICAgICAgIGdldCB7IHJldHVybiBzdGFydHRpbWU7IH1cbiAgICAgICAgc2V0IHsgc3RhcnR0aW1lID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RyaW5nIFRleHQge1xuICAgICAgICBnZXQgeyByZXR1cm4gdGV4dDsgfVxuICAgICAgICBzZXQgeyB0ZXh0ID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICBwdWJsaWMgaW50IFgge1xuICAgICAgICBnZXQgeyByZXR1cm4geDsgfVxuICAgICAgICBzZXQgeyB4ID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICBwdWJsaWMgaW50IE1pbldpZHRoIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIG1pbldpZHRoKCk7IH1cbiAgICB9XG5cbiAgICAvKiBSZXR1cm4gdGhlIG1pbmltdW0gd2lkdGggaW4gcGl4ZWxzIG5lZWRlZCB0byBkaXNwbGF5IHRoaXMgbHlyaWMuXG4gICAgICogVGhpcyBpcyBhbiBlc3RpbWF0aW9uLCBub3QgZXhhY3QuXG4gICAgICovXG4gICAgcHJpdmF0ZSBpbnQgbWluV2lkdGgoKSB7IFxuICAgICAgICBmbG9hdCB3aWR0aFBlckNoYXIgPSBTaGVldE11c2ljLkxldHRlckZvbnQuR2V0SGVpZ2h0KCkgKiAyLjBmLzMuMGY7XG4gICAgICAgIGZsb2F0IHdpZHRoID0gdGV4dC5MZW5ndGggKiB3aWR0aFBlckNoYXI7XG4gICAgICAgIGlmICh0ZXh0LkluZGV4T2YoXCJpXCIpID49IDApIHtcbiAgICAgICAgICAgIHdpZHRoIC09IHdpZHRoUGVyQ2hhci8yLjBmO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0ZXh0LkluZGV4T2YoXCJqXCIpID49IDApIHtcbiAgICAgICAgICAgIHdpZHRoIC09IHdpZHRoUGVyQ2hhci8yLjBmO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0ZXh0LkluZGV4T2YoXCJsXCIpID49IDApIHtcbiAgICAgICAgICAgIHdpZHRoIC09IHdpZHRoUGVyQ2hhci8yLjBmO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoaW50KXdpZHRoO1xuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBcbiAgICBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiTHlyaWMgc3RhcnQ9ezB9IHg9ezF9IHRleHQ9ezJ9XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0dGltZSwgeCwgdGV4dCk7XG4gICAgfVxuXG59XG5cblxufVxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDEyIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbi8qKiBAY2xhc3MgTWlkaUV2ZW50XG4gKiBBIE1pZGlFdmVudCByZXByZXNlbnRzIGEgc2luZ2xlIGV2ZW50IChzdWNoIGFzIEV2ZW50Tm90ZU9uKSBpbiB0aGVcbiAqIE1pZGkgZmlsZS4gSXQgaW5jbHVkZXMgdGhlIGRlbHRhIHRpbWUgb2YgdGhlIGV2ZW50LlxuICovXG5wdWJsaWMgY2xhc3MgTWlkaUV2ZW50IDogSUNvbXBhcmVyPE1pZGlFdmVudD4ge1xuXG4gICAgcHVibGljIGludCAgICBEZWx0YVRpbWU7ICAgICAvKiogVGhlIHRpbWUgYmV0d2VlbiB0aGUgcHJldmlvdXMgZXZlbnQgYW5kIHRoaXMgb24gKi9cbiAgICBwdWJsaWMgaW50ICAgIFN0YXJ0VGltZTsgICAgIC8qKiBUaGUgYWJzb2x1dGUgdGltZSB0aGlzIGV2ZW50IG9jY3VycyAqL1xuICAgIHB1YmxpYyBib29sICAgSGFzRXZlbnRmbGFnOyAgLyoqIEZhbHNlIGlmIHRoaXMgaXMgdXNpbmcgdGhlIHByZXZpb3VzIGV2ZW50ZmxhZyAqL1xuICAgIHB1YmxpYyBieXRlICAgRXZlbnRGbGFnOyAgICAgLyoqIE5vdGVPbiwgTm90ZU9mZiwgZXRjLiAgRnVsbCBsaXN0IGlzIGluIGNsYXNzIE1pZGlGaWxlICovXG4gICAgcHVibGljIGJ5dGUgICBDaGFubmVsOyAgICAgICAvKiogVGhlIGNoYW5uZWwgdGhpcyBldmVudCBvY2N1cnMgb24gKi8gXG5cbiAgICBwdWJsaWMgYnl0ZSAgIE5vdGVudW1iZXI7ICAgIC8qKiBUaGUgbm90ZSBudW1iZXIgICovXG4gICAgcHVibGljIGJ5dGUgICBWZWxvY2l0eTsgICAgICAvKiogVGhlIHZvbHVtZSBvZiB0aGUgbm90ZSAqL1xuICAgIHB1YmxpYyBieXRlICAgSW5zdHJ1bWVudDsgICAgLyoqIFRoZSBpbnN0cnVtZW50ICovXG4gICAgcHVibGljIGJ5dGUgICBLZXlQcmVzc3VyZTsgICAvKiogVGhlIGtleSBwcmVzc3VyZSAqL1xuICAgIHB1YmxpYyBieXRlICAgQ2hhblByZXNzdXJlOyAgLyoqIFRoZSBjaGFubmVsIHByZXNzdXJlICovXG4gICAgcHVibGljIGJ5dGUgICBDb250cm9sTnVtOyAgICAvKiogVGhlIGNvbnRyb2xsZXIgbnVtYmVyICovXG4gICAgcHVibGljIGJ5dGUgICBDb250cm9sVmFsdWU7ICAvKiogVGhlIGNvbnRyb2xsZXIgdmFsdWUgKi9cbiAgICBwdWJsaWMgdXNob3J0IFBpdGNoQmVuZDsgICAgIC8qKiBUaGUgcGl0Y2ggYmVuZCB2YWx1ZSAqL1xuICAgIHB1YmxpYyBieXRlICAgTnVtZXJhdG9yOyAgICAgLyoqIFRoZSBudW1lcmF0b3IsIGZvciBUaW1lU2lnbmF0dXJlIG1ldGEgZXZlbnRzICovXG4gICAgcHVibGljIGJ5dGUgICBEZW5vbWluYXRvcjsgICAvKiogVGhlIGRlbm9taW5hdG9yLCBmb3IgVGltZVNpZ25hdHVyZSBtZXRhIGV2ZW50cyAqL1xuICAgIHB1YmxpYyBpbnQgICAgVGVtcG87ICAgICAgICAgLyoqIFRoZSB0ZW1wbywgZm9yIFRlbXBvIG1ldGEgZXZlbnRzICovXG4gICAgcHVibGljIGJ5dGUgICBNZXRhZXZlbnQ7ICAgICAvKiogVGhlIG1ldGFldmVudCwgdXNlZCBpZiBldmVudGZsYWcgaXMgTWV0YUV2ZW50ICovXG4gICAgcHVibGljIGludCAgICBNZXRhbGVuZ3RoOyAgICAvKiogVGhlIG1ldGFldmVudCBsZW5ndGggICovXG4gICAgcHVibGljIGJ5dGVbXSBWYWx1ZTsgICAgICAgICAvKiogVGhlIHJhdyBieXRlIHZhbHVlLCBmb3IgU3lzZXggYW5kIG1ldGEgZXZlbnRzICovXG5cbiAgICBwdWJsaWMgTWlkaUV2ZW50KCkge1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gYSBjb3B5IG9mIHRoaXMgZXZlbnQgKi9cbiAgICBwdWJsaWMgTWlkaUV2ZW50IENsb25lKCkge1xuICAgICAgICBNaWRpRXZlbnQgbWV2ZW50PSBuZXcgTWlkaUV2ZW50KCk7XG4gICAgICAgIG1ldmVudC5EZWx0YVRpbWUgPSBEZWx0YVRpbWU7XG4gICAgICAgIG1ldmVudC5TdGFydFRpbWUgPSBTdGFydFRpbWU7XG4gICAgICAgIG1ldmVudC5IYXNFdmVudGZsYWcgPSBIYXNFdmVudGZsYWc7XG4gICAgICAgIG1ldmVudC5FdmVudEZsYWcgPSBFdmVudEZsYWc7XG4gICAgICAgIG1ldmVudC5DaGFubmVsID0gQ2hhbm5lbDtcbiAgICAgICAgbWV2ZW50Lk5vdGVudW1iZXIgPSBOb3RlbnVtYmVyO1xuICAgICAgICBtZXZlbnQuVmVsb2NpdHkgPSBWZWxvY2l0eTtcbiAgICAgICAgbWV2ZW50Lkluc3RydW1lbnQgPSBJbnN0cnVtZW50O1xuICAgICAgICBtZXZlbnQuS2V5UHJlc3N1cmUgPSBLZXlQcmVzc3VyZTtcbiAgICAgICAgbWV2ZW50LkNoYW5QcmVzc3VyZSA9IENoYW5QcmVzc3VyZTtcbiAgICAgICAgbWV2ZW50LkNvbnRyb2xOdW0gPSBDb250cm9sTnVtO1xuICAgICAgICBtZXZlbnQuQ29udHJvbFZhbHVlID0gQ29udHJvbFZhbHVlO1xuICAgICAgICBtZXZlbnQuUGl0Y2hCZW5kID0gUGl0Y2hCZW5kO1xuICAgICAgICBtZXZlbnQuTnVtZXJhdG9yID0gTnVtZXJhdG9yO1xuICAgICAgICBtZXZlbnQuRGVub21pbmF0b3IgPSBEZW5vbWluYXRvcjtcbiAgICAgICAgbWV2ZW50LlRlbXBvID0gVGVtcG87XG4gICAgICAgIG1ldmVudC5NZXRhZXZlbnQgPSBNZXRhZXZlbnQ7XG4gICAgICAgIG1ldmVudC5NZXRhbGVuZ3RoID0gTWV0YWxlbmd0aDtcbiAgICAgICAgbWV2ZW50LlZhbHVlID0gVmFsdWU7XG4gICAgICAgIHJldHVybiBtZXZlbnQ7XG4gICAgfVxuXG4gICAgLyoqIENvbXBhcmUgdHdvIE1pZGlFdmVudHMgYmFzZWQgb24gdGhlaXIgc3RhcnQgdGltZXMuICovXG4gICAgcHVibGljIGludCBDb21wYXJlKE1pZGlFdmVudCB4LCBNaWRpRXZlbnQgeSkge1xuICAgICAgICBpZiAoeC5TdGFydFRpbWUgPT0geS5TdGFydFRpbWUpIHtcbiAgICAgICAgICAgIGlmICh4LkV2ZW50RmxhZyA9PSB5LkV2ZW50RmxhZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB4Lk5vdGVudW1iZXIgLSB5Lk5vdGVudW1iZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geC5FdmVudEZsYWcgLSB5LkV2ZW50RmxhZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB4LlN0YXJ0VGltZSAtIHkuU3RhcnRUaW1lO1xuICAgICAgICB9XG4gICAgfVxufVxuXG59ICAvKiBFbmQgbmFtZXNwYWNlIE1pZGlTaGVldE11c2ljICovXG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMiBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiBUaGlzIGZpbGUgY29udGFpbnMgdGhlIGNsYXNzZXMgZm9yIHBhcnNpbmcgYW5kIG1vZGlmeWluZ1xuICogTUlESSBtdXNpYyBmaWxlcy5cbiAqL1xuXG4vKiBNSURJIGZpbGUgZm9ybWF0LlxuICpcbiAqIFRoZSBNaWRpIEZpbGUgZm9ybWF0IGlzIGRlc2NyaWJlZCBiZWxvdy4gIFRoZSBkZXNjcmlwdGlvbiB1c2VzXG4gKiB0aGUgZm9sbG93aW5nIGFiYnJldmlhdGlvbnMuXG4gKlxuICogdTEgICAgIC0gT25lIGJ5dGVcbiAqIHUyICAgICAtIFR3byBieXRlcyAoYmlnIGVuZGlhbilcbiAqIHU0ICAgICAtIEZvdXIgYnl0ZXMgKGJpZyBlbmRpYW4pXG4gKiB2YXJsZW4gLSBBIHZhcmlhYmxlIGxlbmd0aCBpbnRlZ2VyLCB0aGF0IGNhbiBiZSAxIHRvIDQgYnl0ZXMuIFRoZSBcbiAqICAgICAgICAgIGludGVnZXIgZW5kcyB3aGVuIHlvdSBlbmNvdW50ZXIgYSBieXRlIHRoYXQgZG9lc24ndCBoYXZlIFxuICogICAgICAgICAgdGhlIDh0aCBiaXQgc2V0IChhIGJ5dGUgbGVzcyB0aGFuIDB4ODApLlxuICogbGVuPyAgIC0gVGhlIGxlbmd0aCBvZiB0aGUgZGF0YSBkZXBlbmRzIG9uIHNvbWUgY29kZVxuICogICAgICAgICAgXG4gKlxuICogVGhlIE1pZGkgZmlsZXMgYmVnaW5zIHdpdGggdGhlIG1haW4gTWlkaSBoZWFkZXJcbiAqIHU0ID0gVGhlIGZvdXIgYXNjaWkgY2hhcmFjdGVycyAnTVRoZCdcbiAqIHU0ID0gVGhlIGxlbmd0aCBvZiB0aGUgTVRoZCBoZWFkZXIgPSA2IGJ5dGVzXG4gKiB1MiA9IDAgaWYgdGhlIGZpbGUgY29udGFpbnMgYSBzaW5nbGUgdHJhY2tcbiAqICAgICAgMSBpZiB0aGUgZmlsZSBjb250YWlucyBvbmUgb3IgbW9yZSBzaW11bHRhbmVvdXMgdHJhY2tzXG4gKiAgICAgIDIgaWYgdGhlIGZpbGUgY29udGFpbnMgb25lIG9yIG1vcmUgaW5kZXBlbmRlbnQgdHJhY2tzXG4gKiB1MiA9IG51bWJlciBvZiB0cmFja3NcbiAqIHUyID0gaWYgPiAgMCwgdGhlIG51bWJlciBvZiBwdWxzZXMgcGVyIHF1YXJ0ZXIgbm90ZVxuICogICAgICBpZiA8PSAwLCB0aGVuID8/P1xuICpcbiAqIE5leHQgY29tZSB0aGUgaW5kaXZpZHVhbCBNaWRpIHRyYWNrcy4gIFRoZSB0b3RhbCBudW1iZXIgb2YgTWlkaVxuICogdHJhY2tzIHdhcyBnaXZlbiBhYm92ZSwgaW4gdGhlIE1UaGQgaGVhZGVyLiAgRWFjaCB0cmFjayBzdGFydHNcbiAqIHdpdGggYSBoZWFkZXI6XG4gKlxuICogdTQgPSBUaGUgZm91ciBhc2NpaSBjaGFyYWN0ZXJzICdNVHJrJ1xuICogdTQgPSBBbW91bnQgb2YgdHJhY2sgZGF0YSwgaW4gYnl0ZXMuXG4gKiBcbiAqIFRoZSB0cmFjayBkYXRhIGNvbnNpc3RzIG9mIGEgc2VyaWVzIG9mIE1pZGkgZXZlbnRzLiAgRWFjaCBNaWRpIGV2ZW50XG4gKiBoYXMgdGhlIGZvbGxvd2luZyBmb3JtYXQ6XG4gKlxuICogdmFybGVuICAtIFRoZSB0aW1lIGJldHdlZW4gdGhlIHByZXZpb3VzIGV2ZW50IGFuZCB0aGlzIGV2ZW50LCBtZWFzdXJlZFxuICogICAgICAgICAgIGluIFwicHVsc2VzXCIuICBUaGUgbnVtYmVyIG9mIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlIGlzIGdpdmVuXG4gKiAgICAgICAgICAgaW4gdGhlIE1UaGQgaGVhZGVyLlxuICogdTEgICAgICAtIFRoZSBFdmVudCBjb2RlLCBhbHdheXMgYmV0d2VlIDB4ODAgYW5kIDB4RkZcbiAqIGxlbj8gICAgLSBUaGUgZXZlbnQgZGF0YS4gIFRoZSBsZW5ndGggb2YgdGhpcyBkYXRhIGlzIGRldGVybWluZWQgYnkgdGhlXG4gKiAgICAgICAgICAgZXZlbnQgY29kZS4gIFRoZSBmaXJzdCBieXRlIG9mIHRoZSBldmVudCBkYXRhIGlzIGFsd2F5cyA8IDB4ODAuXG4gKlxuICogVGhlIGV2ZW50IGNvZGUgaXMgb3B0aW9uYWwuICBJZiB0aGUgZXZlbnQgY29kZSBpcyBtaXNzaW5nLCB0aGVuIGl0XG4gKiBkZWZhdWx0cyB0byB0aGUgcHJldmlvdXMgZXZlbnQgY29kZS4gIEZvciBleGFtcGxlOlxuICpcbiAqICAgdmFybGVuLCBldmVudGNvZGUxLCBldmVudGRhdGEsXG4gKiAgIHZhcmxlbiwgZXZlbnRjb2RlMiwgZXZlbnRkYXRhLFxuICogICB2YXJsZW4sIGV2ZW50ZGF0YSwgIC8vIGV2ZW50Y29kZSBpcyBldmVudGNvZGUyXG4gKiAgIHZhcmxlbiwgZXZlbnRkYXRhLCAgLy8gZXZlbnRjb2RlIGlzIGV2ZW50Y29kZTJcbiAqICAgdmFybGVuLCBldmVudGNvZGUzLCBldmVudGRhdGEsXG4gKiAgIC4uLi5cbiAqXG4gKiAgIEhvdyBkbyB5b3Uga25vdyBpZiB0aGUgZXZlbnRjb2RlIGlzIHRoZXJlIG9yIG1pc3Npbmc/IFdlbGw6XG4gKiAgIC0gQWxsIGV2ZW50IGNvZGVzIGFyZSBiZXR3ZWVuIDB4ODAgYW5kIDB4RkZcbiAqICAgLSBUaGUgZmlyc3QgYnl0ZSBvZiBldmVudGRhdGEgaXMgYWx3YXlzIGxlc3MgdGhhbiAweDgwLlxuICogICBTbywgYWZ0ZXIgdGhlIHZhcmxlbiBkZWx0YSB0aW1lLCBpZiB0aGUgbmV4dCBieXRlIGlzIGJldHdlZW4gMHg4MFxuICogICBhbmQgMHhGRiwgaXRzIGFuIGV2ZW50IGNvZGUuICBPdGhlcndpc2UsIGl0cyBldmVudCBkYXRhLlxuICpcbiAqIFRoZSBFdmVudCBjb2RlcyBhbmQgZXZlbnQgZGF0YSBmb3IgZWFjaCBldmVudCBjb2RlIGFyZSBzaG93biBiZWxvdy5cbiAqXG4gKiBDb2RlOiAgdTEgLSAweDgwIHRocnUgMHg4RiAtIE5vdGUgT2ZmIGV2ZW50LlxuICogICAgICAgICAgICAgMHg4MCBpcyBmb3IgY2hhbm5lbCAxLCAweDhGIGlzIGZvciBjaGFubmVsIDE2LlxuICogRGF0YTogIHUxIC0gVGhlIG5vdGUgbnVtYmVyLCAwLTEyNy4gIE1pZGRsZSBDIGlzIDYwICgweDNDKVxuICogICAgICAgIHUxIC0gVGhlIG5vdGUgdmVsb2NpdHkuICBUaGlzIHNob3VsZCBiZSAwXG4gKiBcbiAqIENvZGU6ICB1MSAtIDB4OTAgdGhydSAweDlGIC0gTm90ZSBPbiBldmVudC5cbiAqICAgICAgICAgICAgIDB4OTAgaXMgZm9yIGNoYW5uZWwgMSwgMHg5RiBpcyBmb3IgY2hhbm5lbCAxNi5cbiAqIERhdGE6ICB1MSAtIFRoZSBub3RlIG51bWJlciwgMC0xMjcuICBNaWRkbGUgQyBpcyA2MCAoMHgzQylcbiAqICAgICAgICB1MSAtIFRoZSBub3RlIHZlbG9jaXR5LCBmcm9tIDAgKG5vIHNvdW5kKSB0byAxMjcgKGxvdWQpLlxuICogICAgICAgICAgICAgQSB2YWx1ZSBvZiAwIGlzIGVxdWl2YWxlbnQgdG8gYSBOb3RlIE9mZi5cbiAqXG4gKiBDb2RlOiAgdTEgLSAweEEwIHRocnUgMHhBRiAtIEtleSBQcmVzc3VyZVxuICogRGF0YTogIHUxIC0gVGhlIG5vdGUgbnVtYmVyLCAwLTEyNy5cbiAqICAgICAgICB1MSAtIFRoZSBwcmVzc3VyZS5cbiAqXG4gKiBDb2RlOiAgdTEgLSAweEIwIHRocnUgMHhCRiAtIENvbnRyb2wgQ2hhbmdlXG4gKiBEYXRhOiAgdTEgLSBUaGUgY29udHJvbGxlciBudW1iZXJcbiAqICAgICAgICB1MSAtIFRoZSB2YWx1ZVxuICpcbiAqIENvZGU6ICB1MSAtIDB4QzAgdGhydSAweENGIC0gUHJvZ3JhbSBDaGFuZ2VcbiAqIERhdGE6ICB1MSAtIFRoZSBwcm9ncmFtIG51bWJlci5cbiAqXG4gKiBDb2RlOiAgdTEgLSAweEQwIHRocnUgMHhERiAtIENoYW5uZWwgUHJlc3N1cmVcbiAqICAgICAgICB1MSAtIFRoZSBwcmVzc3VyZS5cbiAqXG4gKiBDb2RlOiAgdTEgLSAweEUwIHRocnUgMHhFRiAtIFBpdGNoIEJlbmRcbiAqIERhdGE6ICB1MiAtIFNvbWUgZGF0YVxuICpcbiAqIENvZGU6ICB1MSAgICAgLSAweEZGIC0gTWV0YSBFdmVudFxuICogRGF0YTogIHUxICAgICAtIE1ldGFjb2RlXG4gKiAgICAgICAgdmFybGVuIC0gTGVuZ3RoIG9mIG1ldGEgZXZlbnRcbiAqICAgICAgICB1MVt2YXJsZW5dIC0gTWV0YSBldmVudCBkYXRhLlxuICpcbiAqXG4gKiBUaGUgTWV0YSBFdmVudCBjb2RlcyBhcmUgbGlzdGVkIGJlbG93OlxuICpcbiAqIE1ldGFjb2RlOiB1MSAgICAgICAgIC0gMHgwICBTZXF1ZW5jZSBOdW1iZXJcbiAqICAgICAgICAgICB2YXJsZW4gICAgIC0gMCBvciAyXG4gKiAgICAgICAgICAgdTFbdmFybGVuXSAtIFNlcXVlbmNlIG51bWJlclxuICpcbiAqIE1ldGFjb2RlOiB1MSAgICAgICAgIC0gMHgxICBUZXh0XG4gKiAgICAgICAgICAgdmFybGVuICAgICAtIExlbmd0aCBvZiB0ZXh0XG4gKiAgICAgICAgICAgdTFbdmFybGVuXSAtIFRleHRcbiAqXG4gKiBNZXRhY29kZTogdTEgICAgICAgICAtIDB4MiAgQ29weXJpZ2h0XG4gKiAgICAgICAgICAgdmFybGVuICAgICAtIExlbmd0aCBvZiB0ZXh0XG4gKiAgICAgICAgICAgdTFbdmFybGVuXSAtIFRleHRcbiAqXG4gKiBNZXRhY29kZTogdTEgICAgICAgICAtIDB4MyAgVHJhY2sgTmFtZVxuICogICAgICAgICAgIHZhcmxlbiAgICAgLSBMZW5ndGggb2YgbmFtZVxuICogICAgICAgICAgIHUxW3Zhcmxlbl0gLSBUcmFjayBOYW1lXG4gKlxuICogTWV0YWNvZGU6IHUxICAgICAgICAgLSAweDU4ICBUaW1lIFNpZ25hdHVyZVxuICogICAgICAgICAgIHZhcmxlbiAgICAgLSA0IFxuICogICAgICAgICAgIHUxICAgICAgICAgLSBudW1lcmF0b3JcbiAqICAgICAgICAgICB1MSAgICAgICAgIC0gbG9nMihkZW5vbWluYXRvcilcbiAqICAgICAgICAgICB1MSAgICAgICAgIC0gY2xvY2tzIGluIG1ldHJvbm9tZSBjbGlja1xuICogICAgICAgICAgIHUxICAgICAgICAgLSAzMm5kIG5vdGVzIGluIHF1YXJ0ZXIgbm90ZSAodXN1YWxseSA4KVxuICpcbiAqIE1ldGFjb2RlOiB1MSAgICAgICAgIC0gMHg1OSAgS2V5IFNpZ25hdHVyZVxuICogICAgICAgICAgIHZhcmxlbiAgICAgLSAyXG4gKiAgICAgICAgICAgdTEgICAgICAgICAtIGlmID49IDAsIHRoZW4gbnVtYmVyIG9mIHNoYXJwc1xuICogICAgICAgICAgICAgICAgICAgICAgICBpZiA8IDAsIHRoZW4gbnVtYmVyIG9mIGZsYXRzICogLTFcbiAqICAgICAgICAgICB1MSAgICAgICAgIC0gMCBpZiBtYWpvciBrZXlcbiAqICAgICAgICAgICAgICAgICAgICAgICAgMSBpZiBtaW5vciBrZXlcbiAqXG4gKiBNZXRhY29kZTogdTEgICAgICAgICAtIDB4NTEgIFRlbXBvXG4gKiAgICAgICAgICAgdmFybGVuICAgICAtIDMgIFxuICogICAgICAgICAgIHUzICAgICAgICAgLSBxdWFydGVyIG5vdGUgbGVuZ3RoIGluIG1pY3Jvc2Vjb25kc1xuICovXG5cblxuLyoqIEBjbGFzcyBNaWRpRmlsZVxuICpcbiAqIFRoZSBNaWRpRmlsZSBjbGFzcyBjb250YWlucyB0aGUgcGFyc2VkIGRhdGEgZnJvbSB0aGUgTWlkaSBGaWxlLlxuICogSXQgY29udGFpbnM6XG4gKiAtIEFsbCB0aGUgdHJhY2tzIGluIHRoZSBtaWRpIGZpbGUsIGluY2x1ZGluZyBhbGwgTWlkaU5vdGVzIHBlciB0cmFjay5cbiAqIC0gVGhlIHRpbWUgc2lnbmF0dXJlIChlLmcuIDQvNCwgMy80LCA2LzgpXG4gKiAtIFRoZSBudW1iZXIgb2YgcHVsc2VzIHBlciBxdWFydGVyIG5vdGUuXG4gKiAtIFRoZSB0ZW1wbyAobnVtYmVyIG9mIG1pY3Jvc2Vjb25kcyBwZXIgcXVhcnRlciBub3RlKS5cbiAqXG4gKiBUaGUgY29uc3RydWN0b3IgdGFrZXMgYSBmaWxlbmFtZSBhcyBpbnB1dCwgYW5kIHVwb24gcmV0dXJuaW5nLFxuICogY29udGFpbnMgdGhlIHBhcnNlZCBkYXRhIGZyb20gdGhlIG1pZGkgZmlsZS5cbiAqXG4gKiBUaGUgbWV0aG9kcyBSZWFkVHJhY2soKSBhbmQgUmVhZE1ldGFFdmVudCgpIGFyZSBoZWxwZXIgZnVuY3Rpb25zIGNhbGxlZFxuICogYnkgdGhlIGNvbnN0cnVjdG9yIGR1cmluZyB0aGUgcGFyc2luZy5cbiAqXG4gKiBBZnRlciB0aGUgTWlkaUZpbGUgaXMgcGFyc2VkIGFuZCBjcmVhdGVkLCB0aGUgdXNlciBjYW4gcmV0cmlldmUgdGhlIFxuICogdHJhY2tzIGFuZCBub3RlcyBieSB1c2luZyB0aGUgcHJvcGVydHkgVHJhY2tzIGFuZCBUcmFja3MuTm90ZXMuXG4gKlxuICogVGhlcmUgYXJlIHR3byBtZXRob2RzIGZvciBtb2RpZnlpbmcgdGhlIG1pZGkgZGF0YSBiYXNlZCBvbiB0aGUgbWVudVxuICogb3B0aW9ucyBzZWxlY3RlZDpcbiAqXG4gKiAtIENoYW5nZU1pZGlOb3RlcygpXG4gKiAgIEFwcGx5IHRoZSBtZW51IG9wdGlvbnMgdG8gdGhlIHBhcnNlZCBNaWRpRmlsZS4gIFRoaXMgdXNlcyB0aGUgaGVscGVyIGZ1bmN0aW9uczpcbiAqICAgICBTcGxpdFRyYWNrKClcbiAqICAgICBDb21iaW5lVG9Ud29UcmFja3MoKVxuICogICAgIFNoaWZ0VGltZSgpXG4gKiAgICAgVHJhbnNwb3NlKClcbiAqICAgICBSb3VuZFN0YXJ0VGltZXMoKVxuICogICAgIFJvdW5kRHVyYXRpb25zKClcbiAqXG4gKiAtIENoYW5nZVNvdW5kKClcbiAqICAgQXBwbHkgdGhlIG1lbnUgb3B0aW9ucyB0byB0aGUgTUlESSBtdXNpYyBkYXRhLCBhbmQgc2F2ZSB0aGUgbW9kaWZpZWQgbWlkaSBkYXRhIFxuICogICB0byBhIGZpbGUsIGZvciBwbGF5YmFjay4gXG4gKiAgIFxuICovXG5cbnB1YmxpYyBjbGFzcyBNaWRpRmlsZSB7XG4gICAgcHJpdmF0ZSBzdHJpbmcgZmlsZW5hbWU7ICAgICAgICAgIC8qKiBUaGUgTWlkaSBmaWxlIG5hbWUgKi9cbiAgICBwcml2YXRlIExpc3Q8TWlkaUV2ZW50PltdIGV2ZW50czsgLyoqIFRoZSByYXcgTWlkaUV2ZW50cywgb25lIGxpc3QgcGVyIHRyYWNrICovXG4gICAgcHJpdmF0ZSBMaXN0PE1pZGlUcmFjaz4gdHJhY2tzIDsgIC8qKiBUaGUgdHJhY2tzIG9mIHRoZSBtaWRpZmlsZSB0aGF0IGhhdmUgbm90ZXMgKi9cbiAgICBwcml2YXRlIHVzaG9ydCB0cmFja21vZGU7ICAgICAgICAgLyoqIDAgKHNpbmdsZSB0cmFjayksIDEgKHNpbXVsdGFuZW91cyB0cmFja3MpIDIgKGluZGVwZW5kZW50IHRyYWNrcykgKi9cbiAgICBwcml2YXRlIFRpbWVTaWduYXR1cmUgdGltZXNpZzsgICAgLyoqIFRoZSB0aW1lIHNpZ25hdHVyZSAqL1xuICAgIHByaXZhdGUgaW50IHF1YXJ0ZXJub3RlOyAgICAgICAgICAvKiogVGhlIG51bWJlciBvZiBwdWxzZXMgcGVyIHF1YXJ0ZXIgbm90ZSAqL1xuICAgIHByaXZhdGUgaW50IHRvdGFscHVsc2VzOyAgICAgICAgICAvKiogVGhlIHRvdGFsIGxlbmd0aCBvZiB0aGUgc29uZywgaW4gcHVsc2VzICovXG4gICAgcHJpdmF0ZSBib29sIHRyYWNrUGVyQ2hhbm5lbDsgICAgIC8qKiBUcnVlIGlmIHdlJ3ZlIHNwbGl0IGVhY2ggY2hhbm5lbCBpbnRvIGEgdHJhY2sgKi9cblxuICAgIC8qIFRoZSBsaXN0IG9mIE1pZGkgRXZlbnRzICovXG4gICAgcHVibGljIGNvbnN0IGludCBFdmVudE5vdGVPZmYgICAgICAgICA9IDB4ODA7XG4gICAgcHVibGljIGNvbnN0IGludCBFdmVudE5vdGVPbiAgICAgICAgICA9IDB4OTA7XG4gICAgcHVibGljIGNvbnN0IGludCBFdmVudEtleVByZXNzdXJlICAgICA9IDB4QTA7XG4gICAgcHVibGljIGNvbnN0IGludCBFdmVudENvbnRyb2xDaGFuZ2UgICA9IDB4QjA7XG4gICAgcHVibGljIGNvbnN0IGludCBFdmVudFByb2dyYW1DaGFuZ2UgICA9IDB4QzA7XG4gICAgcHVibGljIGNvbnN0IGludCBFdmVudENoYW5uZWxQcmVzc3VyZSA9IDB4RDA7XG4gICAgcHVibGljIGNvbnN0IGludCBFdmVudFBpdGNoQmVuZCAgICAgICA9IDB4RTA7XG4gICAgcHVibGljIGNvbnN0IGludCBTeXNleEV2ZW50MSAgICAgICAgICA9IDB4RjA7XG4gICAgcHVibGljIGNvbnN0IGludCBTeXNleEV2ZW50MiAgICAgICAgICA9IDB4Rjc7XG4gICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnQgICAgICAgICAgICA9IDB4RkY7XG5cbiAgICAvKiBUaGUgbGlzdCBvZiBNZXRhIEV2ZW50cyAqL1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50U2VxdWVuY2UgICAgICA9IDB4MDtcbiAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudFRleHQgICAgICAgICAgPSAweDE7XG4gICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRDb3B5cmlnaHQgICAgID0gMHgyO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50U2VxdWVuY2VOYW1lICA9IDB4MztcbiAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudEluc3RydW1lbnQgICAgPSAweDQ7XG4gICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRMeXJpYyAgICAgICAgID0gMHg1O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50TWFya2VyICAgICAgICA9IDB4NjtcbiAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudEVuZE9mVHJhY2sgICAgPSAweDJGO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50VGVtcG8gICAgICAgICA9IDB4NTE7XG4gICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRTTVBURU9mZnNldCAgID0gMHg1NDtcbiAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudFRpbWVTaWduYXR1cmUgPSAweDU4O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50S2V5U2lnbmF0dXJlICA9IDB4NTk7XG5cbiAgICAvKiBUaGUgUHJvZ3JhbSBDaGFuZ2UgZXZlbnQgZ2l2ZXMgdGhlIGluc3RydW1lbnQgdGhhdCBzaG91bGRcbiAgICAgKiBiZSB1c2VkIGZvciBhIHBhcnRpY3VsYXIgY2hhbm5lbC4gIFRoZSBmb2xsb3dpbmcgdGFibGVcbiAgICAgKiBtYXBzIGVhY2ggaW5zdHJ1bWVudCBudW1iZXIgKDAgdGhydSAxMjgpIHRvIGFuIGluc3RydW1lbnRcbiAgICAgKiBuYW1lLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgc3RyaW5nW10gSW5zdHJ1bWVudHMgPSB7XG5cbiAgICAgICAgXCJBY291c3RpYyBHcmFuZCBQaWFub1wiLFxuICAgICAgICBcIkJyaWdodCBBY291c3RpYyBQaWFub1wiLFxuICAgICAgICBcIkVsZWN0cmljIEdyYW5kIFBpYW5vXCIsXG4gICAgICAgIFwiSG9ua3ktdG9uayBQaWFub1wiLFxuICAgICAgICBcIkVsZWN0cmljIFBpYW5vIDFcIixcbiAgICAgICAgXCJFbGVjdHJpYyBQaWFubyAyXCIsXG4gICAgICAgIFwiSGFycHNpY2hvcmRcIixcbiAgICAgICAgXCJDbGF2aVwiLFxuICAgICAgICBcIkNlbGVzdGFcIixcbiAgICAgICAgXCJHbG9ja2Vuc3BpZWxcIixcbiAgICAgICAgXCJNdXNpYyBCb3hcIixcbiAgICAgICAgXCJWaWJyYXBob25lXCIsXG4gICAgICAgIFwiTWFyaW1iYVwiLFxuICAgICAgICBcIlh5bG9waG9uZVwiLFxuICAgICAgICBcIlR1YnVsYXIgQmVsbHNcIixcbiAgICAgICAgXCJEdWxjaW1lclwiLFxuICAgICAgICBcIkRyYXdiYXIgT3JnYW5cIixcbiAgICAgICAgXCJQZXJjdXNzaXZlIE9yZ2FuXCIsXG4gICAgICAgIFwiUm9jayBPcmdhblwiLFxuICAgICAgICBcIkNodXJjaCBPcmdhblwiLFxuICAgICAgICBcIlJlZWQgT3JnYW5cIixcbiAgICAgICAgXCJBY2NvcmRpb25cIixcbiAgICAgICAgXCJIYXJtb25pY2FcIixcbiAgICAgICAgXCJUYW5nbyBBY2NvcmRpb25cIixcbiAgICAgICAgXCJBY291c3RpYyBHdWl0YXIgKG55bG9uKVwiLFxuICAgICAgICBcIkFjb3VzdGljIEd1aXRhciAoc3RlZWwpXCIsXG4gICAgICAgIFwiRWxlY3RyaWMgR3VpdGFyIChqYXp6KVwiLFxuICAgICAgICBcIkVsZWN0cmljIEd1aXRhciAoY2xlYW4pXCIsXG4gICAgICAgIFwiRWxlY3RyaWMgR3VpdGFyIChtdXRlZClcIixcbiAgICAgICAgXCJPdmVyZHJpdmVuIEd1aXRhclwiLFxuICAgICAgICBcIkRpc3RvcnRpb24gR3VpdGFyXCIsXG4gICAgICAgIFwiR3VpdGFyIGhhcm1vbmljc1wiLFxuICAgICAgICBcIkFjb3VzdGljIEJhc3NcIixcbiAgICAgICAgXCJFbGVjdHJpYyBCYXNzIChmaW5nZXIpXCIsXG4gICAgICAgIFwiRWxlY3RyaWMgQmFzcyAocGljaylcIixcbiAgICAgICAgXCJGcmV0bGVzcyBCYXNzXCIsXG4gICAgICAgIFwiU2xhcCBCYXNzIDFcIixcbiAgICAgICAgXCJTbGFwIEJhc3MgMlwiLFxuICAgICAgICBcIlN5bnRoIEJhc3MgMVwiLFxuICAgICAgICBcIlN5bnRoIEJhc3MgMlwiLFxuICAgICAgICBcIlZpb2xpblwiLFxuICAgICAgICBcIlZpb2xhXCIsXG4gICAgICAgIFwiQ2VsbG9cIixcbiAgICAgICAgXCJDb250cmFiYXNzXCIsXG4gICAgICAgIFwiVHJlbW9sbyBTdHJpbmdzXCIsXG4gICAgICAgIFwiUGl6emljYXRvIFN0cmluZ3NcIixcbiAgICAgICAgXCJPcmNoZXN0cmFsIEhhcnBcIixcbiAgICAgICAgXCJUaW1wYW5pXCIsXG4gICAgICAgIFwiU3RyaW5nIEVuc2VtYmxlIDFcIixcbiAgICAgICAgXCJTdHJpbmcgRW5zZW1ibGUgMlwiLFxuICAgICAgICBcIlN5bnRoU3RyaW5ncyAxXCIsXG4gICAgICAgIFwiU3ludGhTdHJpbmdzIDJcIixcbiAgICAgICAgXCJDaG9pciBBYWhzXCIsXG4gICAgICAgIFwiVm9pY2UgT29oc1wiLFxuICAgICAgICBcIlN5bnRoIFZvaWNlXCIsXG4gICAgICAgIFwiT3JjaGVzdHJhIEhpdFwiLFxuICAgICAgICBcIlRydW1wZXRcIixcbiAgICAgICAgXCJUcm9tYm9uZVwiLFxuICAgICAgICBcIlR1YmFcIixcbiAgICAgICAgXCJNdXRlZCBUcnVtcGV0XCIsXG4gICAgICAgIFwiRnJlbmNoIEhvcm5cIixcbiAgICAgICAgXCJCcmFzcyBTZWN0aW9uXCIsXG4gICAgICAgIFwiU3ludGhCcmFzcyAxXCIsXG4gICAgICAgIFwiU3ludGhCcmFzcyAyXCIsXG4gICAgICAgIFwiU29wcmFubyBTYXhcIixcbiAgICAgICAgXCJBbHRvIFNheFwiLFxuICAgICAgICBcIlRlbm9yIFNheFwiLFxuICAgICAgICBcIkJhcml0b25lIFNheFwiLFxuICAgICAgICBcIk9ib2VcIixcbiAgICAgICAgXCJFbmdsaXNoIEhvcm5cIixcbiAgICAgICAgXCJCYXNzb29uXCIsXG4gICAgICAgIFwiQ2xhcmluZXRcIixcbiAgICAgICAgXCJQaWNjb2xvXCIsXG4gICAgICAgIFwiRmx1dGVcIixcbiAgICAgICAgXCJSZWNvcmRlclwiLFxuICAgICAgICBcIlBhbiBGbHV0ZVwiLFxuICAgICAgICBcIkJsb3duIEJvdHRsZVwiLFxuICAgICAgICBcIlNoYWt1aGFjaGlcIixcbiAgICAgICAgXCJXaGlzdGxlXCIsXG4gICAgICAgIFwiT2NhcmluYVwiLFxuICAgICAgICBcIkxlYWQgMSAoc3F1YXJlKVwiLFxuICAgICAgICBcIkxlYWQgMiAoc2F3dG9vdGgpXCIsXG4gICAgICAgIFwiTGVhZCAzIChjYWxsaW9wZSlcIixcbiAgICAgICAgXCJMZWFkIDQgKGNoaWZmKVwiLFxuICAgICAgICBcIkxlYWQgNSAoY2hhcmFuZylcIixcbiAgICAgICAgXCJMZWFkIDYgKHZvaWNlKVwiLFxuICAgICAgICBcIkxlYWQgNyAoZmlmdGhzKVwiLFxuICAgICAgICBcIkxlYWQgOCAoYmFzcyArIGxlYWQpXCIsXG4gICAgICAgIFwiUGFkIDEgKG5ldyBhZ2UpXCIsXG4gICAgICAgIFwiUGFkIDIgKHdhcm0pXCIsXG4gICAgICAgIFwiUGFkIDMgKHBvbHlzeW50aClcIixcbiAgICAgICAgXCJQYWQgNCAoY2hvaXIpXCIsXG4gICAgICAgIFwiUGFkIDUgKGJvd2VkKVwiLFxuICAgICAgICBcIlBhZCA2IChtZXRhbGxpYylcIixcbiAgICAgICAgXCJQYWQgNyAoaGFsbylcIixcbiAgICAgICAgXCJQYWQgOCAoc3dlZXApXCIsXG4gICAgICAgIFwiRlggMSAocmFpbilcIixcbiAgICAgICAgXCJGWCAyIChzb3VuZHRyYWNrKVwiLFxuICAgICAgICBcIkZYIDMgKGNyeXN0YWwpXCIsXG4gICAgICAgIFwiRlggNCAoYXRtb3NwaGVyZSlcIixcbiAgICAgICAgXCJGWCA1IChicmlnaHRuZXNzKVwiLFxuICAgICAgICBcIkZYIDYgKGdvYmxpbnMpXCIsXG4gICAgICAgIFwiRlggNyAoZWNob2VzKVwiLFxuICAgICAgICBcIkZYIDggKHNjaS1maSlcIixcbiAgICAgICAgXCJTaXRhclwiLFxuICAgICAgICBcIkJhbmpvXCIsXG4gICAgICAgIFwiU2hhbWlzZW5cIixcbiAgICAgICAgXCJLb3RvXCIsXG4gICAgICAgIFwiS2FsaW1iYVwiLFxuICAgICAgICBcIkJhZyBwaXBlXCIsXG4gICAgICAgIFwiRmlkZGxlXCIsXG4gICAgICAgIFwiU2hhbmFpXCIsXG4gICAgICAgIFwiVGlua2xlIEJlbGxcIixcbiAgICAgICAgXCJBZ29nb1wiLFxuICAgICAgICBcIlN0ZWVsIERydW1zXCIsXG4gICAgICAgIFwiV29vZGJsb2NrXCIsXG4gICAgICAgIFwiVGFpa28gRHJ1bVwiLFxuICAgICAgICBcIk1lbG9kaWMgVG9tXCIsXG4gICAgICAgIFwiU3ludGggRHJ1bVwiLFxuICAgICAgICBcIlJldmVyc2UgQ3ltYmFsXCIsXG4gICAgICAgIFwiR3VpdGFyIEZyZXQgTm9pc2VcIixcbiAgICAgICAgXCJCcmVhdGggTm9pc2VcIixcbiAgICAgICAgXCJTZWFzaG9yZVwiLFxuICAgICAgICBcIkJpcmQgVHdlZXRcIixcbiAgICAgICAgXCJUZWxlcGhvbmUgUmluZ1wiLFxuICAgICAgICBcIkhlbGljb3B0ZXJcIixcbiAgICAgICAgXCJBcHBsYXVzZVwiLFxuICAgICAgICBcIkd1bnNob3RcIixcbiAgICAgICAgXCJQZXJjdXNzaW9uXCJcbiAgICB9O1xuICAgIC8qIEVuZCBJbnN0cnVtZW50cyAqL1xuXG4gICAgLyoqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIE1pZGkgZXZlbnQgKi9cbiAgICBwcml2YXRlIHN0cmluZyBFdmVudE5hbWUoaW50IGV2KSB7XG4gICAgICAgIGlmIChldiA+PSBFdmVudE5vdGVPZmYgJiYgZXYgPCBFdmVudE5vdGVPZmYgKyAxNilcbiAgICAgICAgICAgIHJldHVybiBcIk5vdGVPZmZcIjtcbiAgICAgICAgZWxzZSBpZiAoZXYgPj0gRXZlbnROb3RlT24gJiYgZXYgPCBFdmVudE5vdGVPbiArIDE2KSBcbiAgICAgICAgICAgIHJldHVybiBcIk5vdGVPblwiO1xuICAgICAgICBlbHNlIGlmIChldiA+PSBFdmVudEtleVByZXNzdXJlICYmIGV2IDwgRXZlbnRLZXlQcmVzc3VyZSArIDE2KSBcbiAgICAgICAgICAgIHJldHVybiBcIktleVByZXNzdXJlXCI7XG4gICAgICAgIGVsc2UgaWYgKGV2ID49IEV2ZW50Q29udHJvbENoYW5nZSAmJiBldiA8IEV2ZW50Q29udHJvbENoYW5nZSArIDE2KSBcbiAgICAgICAgICAgIHJldHVybiBcIkNvbnRyb2xDaGFuZ2VcIjtcbiAgICAgICAgZWxzZSBpZiAoZXYgPj0gRXZlbnRQcm9ncmFtQ2hhbmdlICYmIGV2IDwgRXZlbnRQcm9ncmFtQ2hhbmdlICsgMTYpIFxuICAgICAgICAgICAgcmV0dXJuIFwiUHJvZ3JhbUNoYW5nZVwiO1xuICAgICAgICBlbHNlIGlmIChldiA+PSBFdmVudENoYW5uZWxQcmVzc3VyZSAmJiBldiA8IEV2ZW50Q2hhbm5lbFByZXNzdXJlICsgMTYpXG4gICAgICAgICAgICByZXR1cm4gXCJDaGFubmVsUHJlc3N1cmVcIjtcbiAgICAgICAgZWxzZSBpZiAoZXYgPj0gRXZlbnRQaXRjaEJlbmQgJiYgZXYgPCBFdmVudFBpdGNoQmVuZCArIDE2KVxuICAgICAgICAgICAgcmV0dXJuIFwiUGl0Y2hCZW5kXCI7XG4gICAgICAgIGVsc2UgaWYgKGV2ID09IE1ldGFFdmVudClcbiAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudFwiO1xuICAgICAgICBlbHNlIGlmIChldiA9PSBTeXNleEV2ZW50MSB8fCBldiA9PSBTeXNleEV2ZW50MilcbiAgICAgICAgICAgIHJldHVybiBcIlN5c2V4RXZlbnRcIjtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIFwiVW5rbm93blwiO1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBtZXRhLWV2ZW50ICovXG4gICAgcHJpdmF0ZSBzdHJpbmcgTWV0YU5hbWUoaW50IGV2KSB7XG4gICAgICAgIGlmIChldiA9PSBNZXRhRXZlbnRTZXF1ZW5jZSlcbiAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudFNlcXVlbmNlXCI7XG4gICAgICAgIGVsc2UgaWYgKGV2ID09IE1ldGFFdmVudFRleHQpXG4gICAgICAgICAgICByZXR1cm4gXCJNZXRhRXZlbnRUZXh0XCI7XG4gICAgICAgIGVsc2UgaWYgKGV2ID09IE1ldGFFdmVudENvcHlyaWdodClcbiAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudENvcHlyaWdodFwiO1xuICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRTZXF1ZW5jZU5hbWUpXG4gICAgICAgICAgICByZXR1cm4gXCJNZXRhRXZlbnRTZXF1ZW5jZU5hbWVcIjtcbiAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50SW5zdHJ1bWVudClcbiAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudEluc3RydW1lbnRcIjtcbiAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50THlyaWMpXG4gICAgICAgICAgICByZXR1cm4gXCJNZXRhRXZlbnRMeXJpY1wiO1xuICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRNYXJrZXIpXG4gICAgICAgICAgICByZXR1cm4gXCJNZXRhRXZlbnRNYXJrZXJcIjtcbiAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50RW5kT2ZUcmFjaylcbiAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudEVuZE9mVHJhY2tcIjtcbiAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50VGVtcG8pXG4gICAgICAgICAgICByZXR1cm4gXCJNZXRhRXZlbnRUZW1wb1wiO1xuICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRTTVBURU9mZnNldClcbiAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudFNNUFRFT2Zmc2V0XCI7XG4gICAgICAgIGVsc2UgaWYgKGV2ID09IE1ldGFFdmVudFRpbWVTaWduYXR1cmUpXG4gICAgICAgICAgICByZXR1cm4gXCJNZXRhRXZlbnRUaW1lU2lnbmF0dXJlXCI7XG4gICAgICAgIGVsc2UgaWYgKGV2ID09IE1ldGFFdmVudEtleVNpZ25hdHVyZSlcbiAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudEtleVNpZ25hdHVyZVwiO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gXCJVbmtub3duXCI7XG4gICAgfVxuXG5cbiAgICAvKiogR2V0IHRoZSBsaXN0IG9mIHRyYWNrcyAqL1xuICAgIHB1YmxpYyBMaXN0PE1pZGlUcmFjaz4gVHJhY2tzIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHRyYWNrczsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIHRpbWUgc2lnbmF0dXJlICovXG4gICAgcHVibGljIFRpbWVTaWduYXR1cmUgVGltZSB7XG4gICAgICAgIGdldCB7IHJldHVybiB0aW1lc2lnOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgZmlsZSBuYW1lICovXG4gICAgcHVibGljIHN0cmluZyBGaWxlTmFtZSB7XG4gICAgICAgIGdldCB7IHJldHVybiBmaWxlbmFtZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIHRvdGFsIGxlbmd0aCAoaW4gcHVsc2VzKSBvZiB0aGUgc29uZyAqL1xuICAgIHB1YmxpYyBpbnQgVG90YWxQdWxzZXMge1xuICAgICAgICBnZXQgeyByZXR1cm4gdG90YWxwdWxzZXM7IH1cbiAgICB9XG5cblxuICAgIC8qKiBDcmVhdGUgYSBuZXcgTWlkaUZpbGUgZnJvbSB0aGUgZmlsZS4gKi9cbiAgICAvL3B1YmxpYyBNaWRpRmlsZShzdHJpbmcgZmlsZW5hbWUpIHtcbiAgICAvLyAgICBNaWRpRmlsZVJlYWRlciBmaWxlID0gbmV3IE1pZGlGaWxlUmVhZGVyKGZpbGVuYW1lKTtcbiAgICAvLyAgICBwYXJzZShmaWxlLCBmaWxlbmFtZSk7XG4gICAgLy99XG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IE1pZGlGaWxlIGZyb20gdGhlIGJ5dGVbXS4gKi9cbiAgICBwdWJsaWMgTWlkaUZpbGUoYnl0ZVtdIGRhdGEsIHN0cmluZyB0aXRsZSkge1xuICAgICAgICBNaWRpRmlsZVJlYWRlciBmaWxlID0gbmV3IE1pZGlGaWxlUmVhZGVyKGRhdGEpO1xuICAgICAgICBpZiAodGl0bGUgPT0gbnVsbClcbiAgICAgICAgICAgIHRpdGxlID0gXCJcIjtcbiAgICAgICAgcGFyc2UoZmlsZSwgdGl0bGUpO1xuICAgIH1cblxuICAgIC8qKiBQYXJzZSB0aGUgZ2l2ZW4gTWlkaSBmaWxlLCBhbmQgcmV0dXJuIGFuIGluc3RhbmNlIG9mIHRoaXMgTWlkaUZpbGVcbiAgICAgKiBjbGFzcy4gIEFmdGVyIHJlYWRpbmcgdGhlIG1pZGkgZmlsZSwgdGhpcyBvYmplY3Qgd2lsbCBjb250YWluOlxuICAgICAqIC0gVGhlIHJhdyBsaXN0IG9mIG1pZGkgZXZlbnRzXG4gICAgICogLSBUaGUgVGltZSBTaWduYXR1cmUgb2YgdGhlIHNvbmdcbiAgICAgKiAtIEFsbCB0aGUgdHJhY2tzIGluIHRoZSBzb25nIHdoaWNoIGNvbnRhaW4gbm90ZXMuIFxuICAgICAqIC0gVGhlIG51bWJlciwgc3RhcnR0aW1lLCBhbmQgZHVyYXRpb24gb2YgZWFjaCBub3RlLlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIHBhcnNlKE1pZGlGaWxlUmVhZGVyIGZpbGUsIHN0cmluZyBmaWxlbmFtZSkge1xuICAgICAgICBzdHJpbmcgaWQ7XG4gICAgICAgIGludCBsZW47XG5cbiAgICAgICAgdGhpcy5maWxlbmFtZSA9IGZpbGVuYW1lO1xuICAgICAgICB0cmFja3MgPSBuZXcgTGlzdDxNaWRpVHJhY2s+KCk7XG4gICAgICAgIHRyYWNrUGVyQ2hhbm5lbCA9IGZhbHNlO1xuXG4gICAgICAgIGlkID0gZmlsZS5SZWFkQXNjaWkoNCk7XG4gICAgICAgIGlmIChpZCAhPSBcIk1UaGRcIikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IE1pZGlGaWxlRXhjZXB0aW9uKFwiRG9lc24ndCBzdGFydCB3aXRoIE1UaGRcIiwgMCk7XG4gICAgICAgIH1cbiAgICAgICAgbGVuID0gZmlsZS5SZWFkSW50KCk7IFxuICAgICAgICBpZiAobGVuICE9ICA2KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXCJCYWQgTVRoZCBoZWFkZXJcIiwgNCk7XG4gICAgICAgIH1cbiAgICAgICAgdHJhY2ttb2RlID0gZmlsZS5SZWFkU2hvcnQoKTtcbiAgICAgICAgaW50IG51bV90cmFja3MgPSBmaWxlLlJlYWRTaG9ydCgpO1xuICAgICAgICBxdWFydGVybm90ZSA9IGZpbGUuUmVhZFNob3J0KCk7IFxuXG4gICAgICAgIGV2ZW50cyA9IG5ldyBMaXN0PE1pZGlFdmVudD5bbnVtX3RyYWNrc107XG4gICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCBudW1fdHJhY2tzOyB0cmFja251bSsrKSB7XG4gICAgICAgICAgICBldmVudHNbdHJhY2tudW1dID0gUmVhZFRyYWNrKGZpbGUpO1xuICAgICAgICAgICAgTWlkaVRyYWNrIHRyYWNrID0gbmV3IE1pZGlUcmFjayhldmVudHNbdHJhY2tudW1dLCB0cmFja251bSk7XG4gICAgICAgICAgICBpZiAodHJhY2suTm90ZXMuQ291bnQgPiAwIHx8IHRyYWNrLkx5cmljcyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdHJhY2tzLkFkZCh0cmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBHZXQgdGhlIGxlbmd0aCBvZiB0aGUgc29uZyBpbiBwdWxzZXMgKi9cbiAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcykge1xuICAgICAgICAgICAgTWlkaU5vdGUgbGFzdCA9IHRyYWNrLk5vdGVzW3RyYWNrLk5vdGVzLkNvdW50LTFdO1xuICAgICAgICAgICAgaWYgKHRoaXMudG90YWxwdWxzZXMgPCBsYXN0LlN0YXJ0VGltZSArIGxhc3QuRHVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRvdGFscHVsc2VzID0gbGFzdC5TdGFydFRpbWUgKyBsYXN0LkR1cmF0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyogSWYgd2Ugb25seSBoYXZlIG9uZSB0cmFjayB3aXRoIG11bHRpcGxlIGNoYW5uZWxzLCB0aGVuIHRyZWF0XG4gICAgICAgICAqIGVhY2ggY2hhbm5lbCBhcyBhIHNlcGFyYXRlIHRyYWNrLlxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKHRyYWNrcy5Db3VudCA9PSAxICYmIEhhc011bHRpcGxlQ2hhbm5lbHModHJhY2tzWzBdKSkge1xuICAgICAgICAgICAgdHJhY2tzID0gU3BsaXRDaGFubmVscyh0cmFja3NbMF0sIGV2ZW50c1t0cmFja3NbMF0uTnVtYmVyXSk7XG4gICAgICAgICAgICB0cmFja1BlckNoYW5uZWwgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgQ2hlY2tTdGFydFRpbWVzKHRyYWNrcyk7XG5cbiAgICAgICAgLyogRGV0ZXJtaW5lIHRoZSB0aW1lIHNpZ25hdHVyZSAqL1xuICAgICAgICBpbnQgdGVtcG8gPSAwO1xuICAgICAgICBpbnQgbnVtZXIgPSAwO1xuICAgICAgICBpbnQgZGVub20gPSAwO1xuICAgICAgICBmb3JlYWNoIChMaXN0PE1pZGlFdmVudD4gbGlzdCBpbiBldmVudHMpIHtcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBtZXZlbnQgaW4gbGlzdCkge1xuICAgICAgICAgICAgICAgIGlmIChtZXZlbnQuTWV0YWV2ZW50ID09IE1ldGFFdmVudFRlbXBvICYmIHRlbXBvID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcG8gPSBtZXZlbnQuVGVtcG87XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChtZXZlbnQuTWV0YWV2ZW50ID09IE1ldGFFdmVudFRpbWVTaWduYXR1cmUgJiYgbnVtZXIgPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBudW1lciA9IG1ldmVudC5OdW1lcmF0b3I7XG4gICAgICAgICAgICAgICAgICAgIGRlbm9tID0gbWV2ZW50LkRlbm9taW5hdG9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGVtcG8gPT0gMCkge1xuICAgICAgICAgICAgdGVtcG8gPSA1MDAwMDA7IC8qIDUwMCwwMDAgbWljcm9zZWNvbmRzID0gMC4wNSBzZWMgKi9cbiAgICAgICAgfVxuICAgICAgICBpZiAobnVtZXIgPT0gMCkge1xuICAgICAgICAgICAgbnVtZXIgPSA0OyBkZW5vbSA9IDQ7XG4gICAgICAgIH1cbiAgICAgICAgdGltZXNpZyA9IG5ldyBUaW1lU2lnbmF0dXJlKG51bWVyLCBkZW5vbSwgcXVhcnRlcm5vdGUsIHRlbXBvKTtcbiAgICB9XG5cbiAgICAvKiogUGFyc2UgYSBzaW5nbGUgTWlkaSB0cmFjayBpbnRvIGEgbGlzdCBvZiBNaWRpRXZlbnRzLlxuICAgICAqIEVudGVyaW5nIHRoaXMgZnVuY3Rpb24sIHRoZSBmaWxlIG9mZnNldCBzaG91bGQgYmUgYXQgdGhlIHN0YXJ0IG9mXG4gICAgICogdGhlIE1UcmsgaGVhZGVyLiAgVXBvbiBleGl0aW5nLCB0aGUgZmlsZSBvZmZzZXQgc2hvdWxkIGJlIGF0IHRoZVxuICAgICAqIHN0YXJ0IG9mIHRoZSBuZXh0IE1UcmsgaGVhZGVyLlxuICAgICAqL1xuICAgIHByaXZhdGUgTGlzdDxNaWRpRXZlbnQ+IFJlYWRUcmFjayhNaWRpRmlsZVJlYWRlciBmaWxlKSB7XG4gICAgICAgIExpc3Q8TWlkaUV2ZW50PiByZXN1bHQgPSBuZXcgTGlzdDxNaWRpRXZlbnQ+KDIwKTtcbiAgICAgICAgaW50IHN0YXJ0dGltZSA9IDA7XG4gICAgICAgIHN0cmluZyBpZCA9IGZpbGUuUmVhZEFzY2lpKDQpO1xuXG4gICAgICAgIGlmIChpZCAhPSBcIk1UcmtcIikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IE1pZGlGaWxlRXhjZXB0aW9uKFwiQmFkIE1UcmsgaGVhZGVyXCIsIGZpbGUuR2V0T2Zmc2V0KCkgLSA0KTtcbiAgICAgICAgfVxuICAgICAgICBpbnQgdHJhY2tsZW4gPSBmaWxlLlJlYWRJbnQoKTtcbiAgICAgICAgaW50IHRyYWNrZW5kID0gdHJhY2tsZW4gKyBmaWxlLkdldE9mZnNldCgpO1xuXG4gICAgICAgIGludCBldmVudGZsYWcgPSAwO1xuXG4gICAgICAgIHdoaWxlIChmaWxlLkdldE9mZnNldCgpIDwgdHJhY2tlbmQpIHtcblxuICAgICAgICAgICAgLy8gSWYgdGhlIG1pZGkgZmlsZSBpcyB0cnVuY2F0ZWQgaGVyZSwgd2UgY2FuIHN0aWxsIHJlY292ZXIuXG4gICAgICAgICAgICAvLyBKdXN0IHJldHVybiB3aGF0IHdlJ3ZlIHBhcnNlZCBzbyBmYXIuXG5cbiAgICAgICAgICAgIGludCBzdGFydG9mZnNldCwgZGVsdGF0aW1lO1xuICAgICAgICAgICAgYnl0ZSBwZWVrZXZlbnQ7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHN0YXJ0b2Zmc2V0ID0gZmlsZS5HZXRPZmZzZXQoKTtcbiAgICAgICAgICAgICAgICBkZWx0YXRpbWUgPSBmaWxlLlJlYWRWYXJsZW4oKTtcbiAgICAgICAgICAgICAgICBzdGFydHRpbWUgKz0gZGVsdGF0aW1lO1xuICAgICAgICAgICAgICAgIHBlZWtldmVudCA9IGZpbGUuUGVlaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKE1pZGlGaWxlRXhjZXB0aW9uIGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBNaWRpRXZlbnQgbWV2ZW50ID0gbmV3IE1pZGlFdmVudCgpO1xuICAgICAgICAgICAgcmVzdWx0LkFkZChtZXZlbnQpO1xuICAgICAgICAgICAgbWV2ZW50LkRlbHRhVGltZSA9IGRlbHRhdGltZTtcbiAgICAgICAgICAgIG1ldmVudC5TdGFydFRpbWUgPSBzdGFydHRpbWU7XG5cbiAgICAgICAgICAgIGlmIChwZWVrZXZlbnQgPj0gRXZlbnROb3RlT2ZmKSB7IFxuICAgICAgICAgICAgICAgIG1ldmVudC5IYXNFdmVudGZsYWcgPSB0cnVlOyBcbiAgICAgICAgICAgICAgICBldmVudGZsYWcgPSBmaWxlLlJlYWRCeXRlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENvbnNvbGUuV3JpdGVMaW5lKFwib2Zmc2V0IHswfTogZXZlbnQgezF9IHsyfSBzdGFydCB7M30gZGVsdGEgezR9XCIsIFxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgc3RhcnRvZmZzZXQsIGV2ZW50ZmxhZywgRXZlbnROYW1lKGV2ZW50ZmxhZyksIFxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgc3RhcnR0aW1lLCBtZXZlbnQuRGVsdGFUaW1lKTtcblxuICAgICAgICAgICAgaWYgKGV2ZW50ZmxhZyA+PSBFdmVudE5vdGVPbiAmJiBldmVudGZsYWcgPCBFdmVudE5vdGVPbiArIDE2KSB7XG4gICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IEV2ZW50Tm90ZU9uO1xuICAgICAgICAgICAgICAgIG1ldmVudC5DaGFubmVsID0gKGJ5dGUpKGV2ZW50ZmxhZyAtIEV2ZW50Tm90ZU9uKTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuTm90ZW51bWJlciA9IGZpbGUuUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuVmVsb2NpdHkgPSBmaWxlLlJlYWRCeXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChldmVudGZsYWcgPj0gRXZlbnROb3RlT2ZmICYmIGV2ZW50ZmxhZyA8IEV2ZW50Tm90ZU9mZiArIDE2KSB7XG4gICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IEV2ZW50Tm90ZU9mZjtcbiAgICAgICAgICAgICAgICBtZXZlbnQuQ2hhbm5lbCA9IChieXRlKShldmVudGZsYWcgLSBFdmVudE5vdGVPZmYpO1xuICAgICAgICAgICAgICAgIG1ldmVudC5Ob3RlbnVtYmVyID0gZmlsZS5SZWFkQnl0ZSgpO1xuICAgICAgICAgICAgICAgIG1ldmVudC5WZWxvY2l0eSA9IGZpbGUuUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ZW50ZmxhZyA+PSBFdmVudEtleVByZXNzdXJlICYmIFxuICAgICAgICAgICAgICAgICAgICAgZXZlbnRmbGFnIDwgRXZlbnRLZXlQcmVzc3VyZSArIDE2KSB7XG4gICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IEV2ZW50S2V5UHJlc3N1cmU7XG4gICAgICAgICAgICAgICAgbWV2ZW50LkNoYW5uZWwgPSAoYnl0ZSkoZXZlbnRmbGFnIC0gRXZlbnRLZXlQcmVzc3VyZSk7XG4gICAgICAgICAgICAgICAgbWV2ZW50Lk5vdGVudW1iZXIgPSBmaWxlLlJlYWRCeXRlKCk7XG4gICAgICAgICAgICAgICAgbWV2ZW50LktleVByZXNzdXJlID0gZmlsZS5SZWFkQnl0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZXZlbnRmbGFnID49IEV2ZW50Q29udHJvbENoYW5nZSAmJiBcbiAgICAgICAgICAgICAgICAgICAgIGV2ZW50ZmxhZyA8IEV2ZW50Q29udHJvbENoYW5nZSArIDE2KSB7XG4gICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IEV2ZW50Q29udHJvbENoYW5nZTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuQ2hhbm5lbCA9IChieXRlKShldmVudGZsYWcgLSBFdmVudENvbnRyb2xDaGFuZ2UpO1xuICAgICAgICAgICAgICAgIG1ldmVudC5Db250cm9sTnVtID0gZmlsZS5SZWFkQnl0ZSgpO1xuICAgICAgICAgICAgICAgIG1ldmVudC5Db250cm9sVmFsdWUgPSBmaWxlLlJlYWRCeXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChldmVudGZsYWcgPj0gRXZlbnRQcm9ncmFtQ2hhbmdlICYmIFxuICAgICAgICAgICAgICAgICAgICAgZXZlbnRmbGFnIDwgRXZlbnRQcm9ncmFtQ2hhbmdlICsgMTYpIHtcbiAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gRXZlbnRQcm9ncmFtQ2hhbmdlO1xuICAgICAgICAgICAgICAgIG1ldmVudC5DaGFubmVsID0gKGJ5dGUpKGV2ZW50ZmxhZyAtIEV2ZW50UHJvZ3JhbUNoYW5nZSk7XG4gICAgICAgICAgICAgICAgbWV2ZW50Lkluc3RydW1lbnQgPSBmaWxlLlJlYWRCeXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChldmVudGZsYWcgPj0gRXZlbnRDaGFubmVsUHJlc3N1cmUgJiYgXG4gICAgICAgICAgICAgICAgICAgICBldmVudGZsYWcgPCBFdmVudENoYW5uZWxQcmVzc3VyZSArIDE2KSB7XG4gICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IEV2ZW50Q2hhbm5lbFByZXNzdXJlO1xuICAgICAgICAgICAgICAgIG1ldmVudC5DaGFubmVsID0gKGJ5dGUpKGV2ZW50ZmxhZyAtIEV2ZW50Q2hhbm5lbFByZXNzdXJlKTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuQ2hhblByZXNzdXJlID0gZmlsZS5SZWFkQnl0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZXZlbnRmbGFnID49IEV2ZW50UGl0Y2hCZW5kICYmIFxuICAgICAgICAgICAgICAgICAgICAgZXZlbnRmbGFnIDwgRXZlbnRQaXRjaEJlbmQgKyAxNikge1xuICAgICAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPSBFdmVudFBpdGNoQmVuZDtcbiAgICAgICAgICAgICAgICBtZXZlbnQuQ2hhbm5lbCA9IChieXRlKShldmVudGZsYWcgLSBFdmVudFBpdGNoQmVuZCk7XG4gICAgICAgICAgICAgICAgbWV2ZW50LlBpdGNoQmVuZCA9IGZpbGUuUmVhZFNob3J0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChldmVudGZsYWcgPT0gU3lzZXhFdmVudDEpIHtcbiAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gU3lzZXhFdmVudDE7XG4gICAgICAgICAgICAgICAgbWV2ZW50Lk1ldGFsZW5ndGggPSBmaWxlLlJlYWRWYXJsZW4oKTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuVmFsdWUgPSBmaWxlLlJlYWRCeXRlcyhtZXZlbnQuTWV0YWxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChldmVudGZsYWcgPT0gU3lzZXhFdmVudDIpIHtcbiAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gU3lzZXhFdmVudDI7XG4gICAgICAgICAgICAgICAgbWV2ZW50Lk1ldGFsZW5ndGggPSBmaWxlLlJlYWRWYXJsZW4oKTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuVmFsdWUgPSBmaWxlLlJlYWRCeXRlcyhtZXZlbnQuTWV0YWxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChldmVudGZsYWcgPT0gTWV0YUV2ZW50KSB7XG4gICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IE1ldGFFdmVudDtcbiAgICAgICAgICAgICAgICBtZXZlbnQuTWV0YWV2ZW50ID0gZmlsZS5SZWFkQnl0ZSgpO1xuICAgICAgICAgICAgICAgIG1ldmVudC5NZXRhbGVuZ3RoID0gZmlsZS5SZWFkVmFybGVuKCk7XG4gICAgICAgICAgICAgICAgbWV2ZW50LlZhbHVlID0gZmlsZS5SZWFkQnl0ZXMobWV2ZW50Lk1ldGFsZW5ndGgpO1xuICAgICAgICAgICAgICAgIGlmIChtZXZlbnQuTWV0YWV2ZW50ID09IE1ldGFFdmVudFRpbWVTaWduYXR1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1ldmVudC5NZXRhbGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhyb3cgbmV3IE1pZGlGaWxlRXhjZXB0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gIFwiTWV0YSBFdmVudCBUaW1lIFNpZ25hdHVyZSBsZW4gPT0gXCIgKyBtZXZlbnQuTWV0YWxlbmd0aCAgKyBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICBcIiAhPSA0XCIsIGZpbGUuR2V0T2Zmc2V0KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50Lk51bWVyYXRvciA9IChieXRlKTA7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRGVub21pbmF0b3IgPSAoYnl0ZSk0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5NZXRhbGVuZ3RoID49IDIgJiYgbWV2ZW50Lk1ldGFsZW5ndGggPCA0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuTnVtZXJhdG9yID0gKGJ5dGUpbWV2ZW50LlZhbHVlWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkRlbm9taW5hdG9yID0gKGJ5dGUpU3lzdGVtLk1hdGguUG93KDIsIG1ldmVudC5WYWx1ZVsxXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuTnVtZXJhdG9yID0gKGJ5dGUpbWV2ZW50LlZhbHVlWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkRlbm9taW5hdG9yID0gKGJ5dGUpU3lzdGVtLk1hdGguUG93KDIsIG1ldmVudC5WYWx1ZVsxXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50Lk1ldGFldmVudCA9PSBNZXRhRXZlbnRUZW1wbykge1xuICAgICAgICAgICAgICAgICAgICBpZiAobWV2ZW50Lk1ldGFsZW5ndGggIT0gMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1pZGlGaWxlRXhjZXB0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcIk1ldGEgRXZlbnQgVGVtcG8gbGVuID09IFwiICsgbWV2ZW50Lk1ldGFsZW5ndGggK1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcIiAhPSAzXCIsIGZpbGUuR2V0T2Zmc2V0KCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5UZW1wbyA9ICggKG1ldmVudC5WYWx1ZVswXSA8PCAxNikgfCAobWV2ZW50LlZhbHVlWzFdIDw8IDgpIHwgbWV2ZW50LlZhbHVlWzJdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50Lk1ldGFldmVudCA9PSBNZXRhRXZlbnRFbmRPZlRyYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qIGJyZWFrOyAgKi9cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXCJVbmtub3duIGV2ZW50IFwiICsgbWV2ZW50LkV2ZW50RmxhZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuR2V0T2Zmc2V0KCktMSk7IFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRydWUgaWYgdGhpcyB0cmFjayBjb250YWlucyBtdWx0aXBsZSBjaGFubmVscy5cbiAgICAgKiBJZiBhIE1pZGlGaWxlIGNvbnRhaW5zIG9ubHkgb25lIHRyYWNrLCBhbmQgaXQgaGFzIG11bHRpcGxlIGNoYW5uZWxzLFxuICAgICAqIHRoZW4gd2UgdHJlYXQgZWFjaCBjaGFubmVsIGFzIGEgc2VwYXJhdGUgdHJhY2suXG4gICAgICovXG4gICAgc3RhdGljIGJvb2wgSGFzTXVsdGlwbGVDaGFubmVscyhNaWRpVHJhY2sgdHJhY2spIHtcbiAgICAgICAgaW50IGNoYW5uZWwgPSB0cmFjay5Ob3Rlc1swXS5DaGFubmVsO1xuICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrLk5vdGVzKSB7XG4gICAgICAgICAgICBpZiAobm90ZS5DaGFubmVsICE9IGNoYW5uZWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqIFdyaXRlIGEgdmFyaWFibGUgbGVuZ3RoIG51bWJlciB0byB0aGUgYnVmZmVyIGF0IHRoZSBnaXZlbiBvZmZzZXQuXG4gICAgICogUmV0dXJuIHRoZSBudW1iZXIgb2YgYnl0ZXMgd3JpdHRlbi5cbiAgICAgKi9cbiAgICBzdGF0aWMgaW50IFZhcmxlblRvQnl0ZXMoaW50IG51bSwgYnl0ZVtdIGJ1ZiwgaW50IG9mZnNldCkge1xuICAgICAgICBieXRlIGIxID0gKGJ5dGUpICgobnVtID4+IDIxKSAmIDB4N0YpO1xuICAgICAgICBieXRlIGIyID0gKGJ5dGUpICgobnVtID4+IDE0KSAmIDB4N0YpO1xuICAgICAgICBieXRlIGIzID0gKGJ5dGUpICgobnVtID4+ICA3KSAmIDB4N0YpO1xuICAgICAgICBieXRlIGI0ID0gKGJ5dGUpIChudW0gJiAweDdGKTtcblxuICAgICAgICBpZiAoYjEgPiAwKSB7XG4gICAgICAgICAgICBidWZbb2Zmc2V0XSAgID0gKGJ5dGUpKGIxIHwgMHg4MCk7XG4gICAgICAgICAgICBidWZbb2Zmc2V0KzFdID0gKGJ5dGUpKGIyIHwgMHg4MCk7XG4gICAgICAgICAgICBidWZbb2Zmc2V0KzJdID0gKGJ5dGUpKGIzIHwgMHg4MCk7XG4gICAgICAgICAgICBidWZbb2Zmc2V0KzNdID0gYjQ7XG4gICAgICAgICAgICByZXR1cm4gNDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChiMiA+IDApIHtcbiAgICAgICAgICAgIGJ1ZltvZmZzZXRdICAgPSAoYnl0ZSkoYjIgfCAweDgwKTtcbiAgICAgICAgICAgIGJ1ZltvZmZzZXQrMV0gPSAoYnl0ZSkoYjMgfCAweDgwKTtcbiAgICAgICAgICAgIGJ1ZltvZmZzZXQrMl0gPSBiNDtcbiAgICAgICAgICAgIHJldHVybiAzO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGIzID4gMCkge1xuICAgICAgICAgICAgYnVmW29mZnNldF0gICA9IChieXRlKShiMyB8IDB4ODApO1xuICAgICAgICAgICAgYnVmW29mZnNldCsxXSA9IGI0O1xuICAgICAgICAgICAgcmV0dXJuIDI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBidWZbb2Zmc2V0XSA9IGI0O1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogV3JpdGUgYSA0LWJ5dGUgaW50ZWdlciB0byBkYXRhW29mZnNldCA6IG9mZnNldCs0XSAqL1xuICAgIHByaXZhdGUgc3RhdGljIHZvaWQgSW50VG9CeXRlcyhpbnQgdmFsdWUsIGJ5dGVbXSBkYXRhLCBpbnQgb2Zmc2V0KSB7XG4gICAgICAgIGRhdGFbb2Zmc2V0XSA9IChieXRlKSggKHZhbHVlID4+IDI0KSAmIDB4RkYgKTtcbiAgICAgICAgZGF0YVtvZmZzZXQrMV0gPSAoYnl0ZSkoICh2YWx1ZSA+PiAxNikgJiAweEZGICk7XG4gICAgICAgIGRhdGFbb2Zmc2V0KzJdID0gKGJ5dGUpKCAodmFsdWUgPj4gOCkgJiAweEZGICk7XG4gICAgICAgIGRhdGFbb2Zmc2V0KzNdID0gKGJ5dGUpKCB2YWx1ZSAmIDB4RkYgKTtcbiAgICB9XG5cbiAgICAvKiogQ2FsY3VsYXRlIHRoZSB0cmFjayBsZW5ndGggKGluIGJ5dGVzKSBnaXZlbiBhIGxpc3Qgb2YgTWlkaSBldmVudHMgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBpbnQgR2V0VHJhY2tMZW5ndGgoTGlzdDxNaWRpRXZlbnQ+IGV2ZW50cykge1xuICAgICAgICBpbnQgbGVuID0gMDtcbiAgICAgICAgYnl0ZVtdIGJ1ZiA9IG5ldyBieXRlWzEwMjRdO1xuICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbWV2ZW50IGluIGV2ZW50cykge1xuICAgICAgICAgICAgbGVuICs9IFZhcmxlblRvQnl0ZXMobWV2ZW50LkRlbHRhVGltZSwgYnVmLCAwKTtcbiAgICAgICAgICAgIGxlbiArPSAxOyAgLyogZm9yIGV2ZW50ZmxhZyAqL1xuICAgICAgICAgICAgc3dpdGNoIChtZXZlbnQuRXZlbnRGbGFnKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBFdmVudE5vdGVPbjogbGVuICs9IDI7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgRXZlbnROb3RlT2ZmOiBsZW4gKz0gMjsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBFdmVudEtleVByZXNzdXJlOiBsZW4gKz0gMjsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBFdmVudENvbnRyb2xDaGFuZ2U6IGxlbiArPSAyOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIEV2ZW50UHJvZ3JhbUNoYW5nZTogbGVuICs9IDE7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgRXZlbnRDaGFubmVsUHJlc3N1cmU6IGxlbiArPSAxOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIEV2ZW50UGl0Y2hCZW5kOiBsZW4gKz0gMjsgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIFN5c2V4RXZlbnQxOiBcbiAgICAgICAgICAgICAgICBjYXNlIFN5c2V4RXZlbnQyOlxuICAgICAgICAgICAgICAgICAgICBsZW4gKz0gVmFybGVuVG9CeXRlcyhtZXZlbnQuTWV0YWxlbmd0aCwgYnVmLCAwKTsgXG4gICAgICAgICAgICAgICAgICAgIGxlbiArPSBtZXZlbnQuTWV0YWxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBNZXRhRXZlbnQ6IFxuICAgICAgICAgICAgICAgICAgICBsZW4gKz0gMTsgXG4gICAgICAgICAgICAgICAgICAgIGxlbiArPSBWYXJsZW5Ub0J5dGVzKG1ldmVudC5NZXRhbGVuZ3RoLCBidWYsIDApOyBcbiAgICAgICAgICAgICAgICAgICAgbGVuICs9IG1ldmVudC5NZXRhbGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGVuO1xuICAgIH1cbiAgICAgICAgICAgIFxuXG4gICAgLyoqIFdyaXRlIHRoZSBnaXZlbiBsaXN0IG9mIE1pZGkgZXZlbnRzIHRvIGEgc3RyZWFtL2ZpbGUuXG4gICAgICogIFRoaXMgbWV0aG9kIGlzIHVzZWQgZm9yIHNvdW5kIHBsYXliYWNrLCBmb3IgY3JlYXRpbmcgbmV3IE1pZGkgZmlsZXNcbiAgICAgKiAgd2l0aCB0aGUgdGVtcG8sIHRyYW5zcG9zZSwgZXRjIGNoYW5nZWQuXG4gICAgICpcbiAgICAgKiAgUmV0dXJuIHRydWUgb24gc3VjY2VzcywgYW5kIGZhbHNlIG9uIGVycm9yLlxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGJvb2wgXG4gICAgV3JpdGVFdmVudHMoU3RyZWFtIGZpbGUsIExpc3Q8TWlkaUV2ZW50PltdIGV2ZW50cywgaW50IHRyYWNrbW9kZSwgaW50IHF1YXJ0ZXIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGJ5dGVbXSBidWYgPSBuZXcgYnl0ZVs2NTUzNl07XG5cbiAgICAgICAgICAgIC8qIFdyaXRlIHRoZSBNVGhkLCBsZW4gPSA2LCB0cmFjayBtb2RlLCBudW1iZXIgdHJhY2tzLCBxdWFydGVyIG5vdGUgKi9cbiAgICAgICAgICAgIGZpbGUuV3JpdGUoQVNDSUlFbmNvZGluZy5BU0NJSS5HZXRCeXRlcyhcIk1UaGRcIiksIDAsIDQpO1xuICAgICAgICAgICAgSW50VG9CeXRlcyg2LCBidWYsIDApO1xuICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDQpO1xuICAgICAgICAgICAgYnVmWzBdID0gKGJ5dGUpKHRyYWNrbW9kZSA+PiA4KTsgXG4gICAgICAgICAgICBidWZbMV0gPSAoYnl0ZSkodHJhY2ttb2RlICYgMHhGRik7XG4gICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgMik7XG4gICAgICAgICAgICBidWZbMF0gPSAwOyBcbiAgICAgICAgICAgIGJ1ZlsxXSA9IChieXRlKWV2ZW50cy5MZW5ndGg7XG4gICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgMik7XG4gICAgICAgICAgICBidWZbMF0gPSAoYnl0ZSkocXVhcnRlciA+PiA4KTsgXG4gICAgICAgICAgICBidWZbMV0gPSAoYnl0ZSkocXVhcnRlciAmIDB4RkYpO1xuICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDIpO1xuXG4gICAgICAgICAgICBmb3JlYWNoIChMaXN0PE1pZGlFdmVudD4gbGlzdCBpbiBldmVudHMpIHtcbiAgICAgICAgICAgICAgICAvKiBXcml0ZSB0aGUgTVRyayBoZWFkZXIgYW5kIHRyYWNrIGxlbmd0aCAqL1xuICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoQVNDSUlFbmNvZGluZy5BU0NJSS5HZXRCeXRlcyhcIk1UcmtcIiksIDAsIDQpO1xuICAgICAgICAgICAgICAgIGludCBsZW4gPSBHZXRUcmFja0xlbmd0aChsaXN0KTtcbiAgICAgICAgICAgICAgICBJbnRUb0J5dGVzKGxlbiwgYnVmLCAwKTtcbiAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgNCk7XG5cbiAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbWV2ZW50IGluIGxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaW50IHZhcmxlbiA9IFZhcmxlblRvQnl0ZXMobWV2ZW50LkRlbHRhVGltZSwgYnVmLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIHZhcmxlbik7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gU3lzZXhFdmVudDEgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPT0gU3lzZXhFdmVudDIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPT0gTWV0YUV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbMF0gPSBtZXZlbnQuRXZlbnRGbGFnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gKGJ5dGUpKG1ldmVudC5FdmVudEZsYWcgKyBtZXZlbnQuQ2hhbm5lbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDEpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IEV2ZW50Tm90ZU9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbMF0gPSBtZXZlbnQuTm90ZW51bWJlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlsxXSA9IG1ldmVudC5WZWxvY2l0eTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IEV2ZW50Tm90ZU9mZikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gbWV2ZW50Lk5vdGVudW1iZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbMV0gPSBtZXZlbnQuVmVsb2NpdHk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgMik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudEtleVByZXNzdXJlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbMF0gPSBtZXZlbnQuTm90ZW51bWJlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlsxXSA9IG1ldmVudC5LZXlQcmVzc3VyZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IEV2ZW50Q29udHJvbENoYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gbWV2ZW50LkNvbnRyb2xOdW07XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbMV0gPSBtZXZlbnQuQ29udHJvbFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnRQcm9ncmFtQ2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbMF0gPSBtZXZlbnQuSW5zdHJ1bWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IEV2ZW50Q2hhbm5lbFByZXNzdXJlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbMF0gPSBtZXZlbnQuQ2hhblByZXNzdXJlO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnRQaXRjaEJlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IChieXRlKShtZXZlbnQuUGl0Y2hCZW5kID4+IDgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzFdID0gKGJ5dGUpKG1ldmVudC5QaXRjaEJlbmQgJiAweEZGKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IFN5c2V4RXZlbnQxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnQgb2Zmc2V0ID0gVmFybGVuVG9CeXRlcyhtZXZlbnQuTWV0YWxlbmd0aCwgYnVmLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LkNvcHkobWV2ZW50LlZhbHVlLCAwLCBidWYsIG9mZnNldCwgbWV2ZW50LlZhbHVlLkxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgb2Zmc2V0ICsgbWV2ZW50LlZhbHVlLkxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBTeXNleEV2ZW50Mikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50IG9mZnNldCA9IFZhcmxlblRvQnl0ZXMobWV2ZW50Lk1ldGFsZW5ndGgsIGJ1ZiwgMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBBcnJheS5Db3B5KG1ldmVudC5WYWx1ZSwgMCwgYnVmLCBvZmZzZXQsIG1ldmVudC5WYWx1ZS5MZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIG9mZnNldCArIG1ldmVudC5WYWx1ZS5MZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gTWV0YUV2ZW50ICYmIG1ldmVudC5NZXRhZXZlbnQgPT0gTWV0YUV2ZW50VGVtcG8pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IG1ldmVudC5NZXRhZXZlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbMV0gPSAzO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzJdID0gKGJ5dGUpKChtZXZlbnQuVGVtcG8gPj4gMTYpICYgMHhGRik7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbM10gPSAoYnl0ZSkoKG1ldmVudC5UZW1wbyA+PiA4KSAmIDB4RkYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzRdID0gKGJ5dGUpKG1ldmVudC5UZW1wbyAmIDB4RkYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gTWV0YUV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbMF0gPSBtZXZlbnQuTWV0YWV2ZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50IG9mZnNldCA9IFZhcmxlblRvQnl0ZXMobWV2ZW50Lk1ldGFsZW5ndGgsIGJ1ZiwgMSkgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgQXJyYXkuQ29weShtZXZlbnQuVmFsdWUsIDAsIGJ1Ziwgb2Zmc2V0LCBtZXZlbnQuVmFsdWUuTGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCBvZmZzZXQgKyBtZXZlbnQuVmFsdWUuTGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbGUuQ2xvc2UoKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChJT0V4Y2VwdGlvbiBlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIC8qKiBDbG9uZSB0aGUgbGlzdCBvZiBNaWRpRXZlbnRzICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgTGlzdDxNaWRpRXZlbnQ+W10gQ2xvbmVNaWRpRXZlbnRzKExpc3Q8TWlkaUV2ZW50PltdIG9yaWdsaXN0KSB7XG4gICAgICAgIExpc3Q8TWlkaUV2ZW50PltdIG5ld2xpc3QgPSBuZXcgTGlzdDxNaWRpRXZlbnQ+WyBvcmlnbGlzdC5MZW5ndGhdO1xuICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgb3JpZ2xpc3QuTGVuZ3RoOyB0cmFja251bSsrKSB7XG4gICAgICAgICAgICBMaXN0PE1pZGlFdmVudD4gb3JpZ2V2ZW50cyA9IG9yaWdsaXN0W3RyYWNrbnVtXTtcbiAgICAgICAgICAgIExpc3Q8TWlkaUV2ZW50PiBuZXdldmVudHMgPSBuZXcgTGlzdDxNaWRpRXZlbnQ+KG9yaWdldmVudHMuQ291bnQpO1xuICAgICAgICAgICAgbmV3bGlzdFt0cmFja251bV0gPSBuZXdldmVudHM7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbWV2ZW50IGluIG9yaWdldmVudHMpIHtcbiAgICAgICAgICAgICAgICBuZXdldmVudHMuQWRkKCBtZXZlbnQuQ2xvbmUoKSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXdsaXN0O1xuICAgIH1cblxuICAgIC8qKiBDcmVhdGUgYSBuZXcgTWlkaSB0ZW1wbyBldmVudCwgd2l0aCB0aGUgZ2l2ZW4gdGVtcG8gICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgTWlkaUV2ZW50IENyZWF0ZVRlbXBvRXZlbnQoaW50IHRlbXBvKSB7XG4gICAgICAgIE1pZGlFdmVudCBtZXZlbnQgPSBuZXcgTWlkaUV2ZW50KCk7XG4gICAgICAgIG1ldmVudC5EZWx0YVRpbWUgPSAwO1xuICAgICAgICBtZXZlbnQuU3RhcnRUaW1lID0gMDtcbiAgICAgICAgbWV2ZW50Lkhhc0V2ZW50ZmxhZyA9IHRydWU7XG4gICAgICAgIG1ldmVudC5FdmVudEZsYWcgPSBNZXRhRXZlbnQ7XG4gICAgICAgIG1ldmVudC5NZXRhZXZlbnQgPSBNZXRhRXZlbnRUZW1wbztcbiAgICAgICAgbWV2ZW50Lk1ldGFsZW5ndGggPSAzO1xuICAgICAgICBtZXZlbnQuVGVtcG8gPSB0ZW1wbztcbiAgICAgICAgcmV0dXJuIG1ldmVudDtcbiAgICB9XG5cblxuICAgIC8qKiBTZWFyY2ggdGhlIGV2ZW50cyBmb3IgYSBDb250cm9sQ2hhbmdlIGV2ZW50IHdpdGggdGhlIHNhbWVcbiAgICAgKiAgY2hhbm5lbCBhbmQgY29udHJvbCBudW1iZXIuICBJZiBhIG1hdGNoaW5nIGV2ZW50IGlzIGZvdW5kLFxuICAgICAqICAgdXBkYXRlIHRoZSBjb250cm9sIHZhbHVlLiAgRWxzZSwgYWRkIGEgbmV3IENvbnRyb2xDaGFuZ2UgZXZlbnQuXG4gICAgICovIFxuICAgIHByaXZhdGUgc3RhdGljIHZvaWQgXG4gICAgVXBkYXRlQ29udHJvbENoYW5nZShMaXN0PE1pZGlFdmVudD4gbmV3ZXZlbnRzLCBNaWRpRXZlbnQgY2hhbmdlRXZlbnQpIHtcbiAgICAgICAgZm9yZWFjaCAoTWlkaUV2ZW50IG1ldmVudCBpbiBuZXdldmVudHMpIHtcbiAgICAgICAgICAgIGlmICgobWV2ZW50LkV2ZW50RmxhZyA9PSBjaGFuZ2VFdmVudC5FdmVudEZsYWcpICYmXG4gICAgICAgICAgICAgICAgKG1ldmVudC5DaGFubmVsID09IGNoYW5nZUV2ZW50LkNoYW5uZWwpICYmXG4gICAgICAgICAgICAgICAgKG1ldmVudC5Db250cm9sTnVtID09IGNoYW5nZUV2ZW50LkNvbnRyb2xOdW0pKSB7XG5cbiAgICAgICAgICAgICAgICBtZXZlbnQuQ29udHJvbFZhbHVlID0gY2hhbmdlRXZlbnQuQ29udHJvbFZhbHVlO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBuZXdldmVudHMuQWRkKGNoYW5nZUV2ZW50KTtcbiAgICB9XG5cbiAgICAvKiogU3RhcnQgdGhlIE1pZGkgbXVzaWMgYXQgdGhlIGdpdmVuIHBhdXNlIHRpbWUgKGluIHB1bHNlcykuXG4gICAgICogIFJlbW92ZSBhbnkgTm90ZU9uL05vdGVPZmYgZXZlbnRzIHRoYXQgb2NjdXIgYmVmb3JlIHRoZSBwYXVzZSB0aW1lLlxuICAgICAqICBGb3Igb3RoZXIgZXZlbnRzLCBjaGFuZ2UgdGhlIGRlbHRhLXRpbWUgdG8gMCBpZiB0aGV5IG9jY3VyXG4gICAgICogIGJlZm9yZSB0aGUgcGF1c2UgdGltZS4gIFJldHVybiB0aGUgbW9kaWZpZWQgTWlkaSBFdmVudHMuXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgTGlzdDxNaWRpRXZlbnQ+W10gXG4gICAgU3RhcnRBdFBhdXNlVGltZShMaXN0PE1pZGlFdmVudD5bXSBsaXN0LCBpbnQgcGF1c2VUaW1lKSB7XG4gICAgICAgIExpc3Q8TWlkaUV2ZW50PltdIG5ld2xpc3QgPSBuZXcgTGlzdDxNaWRpRXZlbnQ+WyBsaXN0Lkxlbmd0aF07XG4gICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCBsaXN0Lkxlbmd0aDsgdHJhY2tudW0rKykge1xuICAgICAgICAgICAgTGlzdDxNaWRpRXZlbnQ+IGV2ZW50cyA9IGxpc3RbdHJhY2tudW1dO1xuICAgICAgICAgICAgTGlzdDxNaWRpRXZlbnQ+IG5ld2V2ZW50cyA9IG5ldyBMaXN0PE1pZGlFdmVudD4oZXZlbnRzLkNvdW50KTtcbiAgICAgICAgICAgIG5ld2xpc3RbdHJhY2tudW1dID0gbmV3ZXZlbnRzO1xuXG4gICAgICAgICAgICBib29sIGZvdW5kRXZlbnRBZnRlclBhdXNlID0gZmFsc2U7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbWV2ZW50IGluIGV2ZW50cykge1xuXG4gICAgICAgICAgICAgICAgaWYgKG1ldmVudC5TdGFydFRpbWUgPCBwYXVzZVRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnROb3RlT24gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnROb3RlT2ZmKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIFNraXAgTm90ZU9uL05vdGVPZmYgZXZlbnQgKi9cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IEV2ZW50Q29udHJvbENoYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkRlbHRhVGltZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBVcGRhdGVDb250cm9sQ2hhbmdlKG5ld2V2ZW50cywgbWV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5EZWx0YVRpbWUgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3ZXZlbnRzLkFkZChtZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCFmb3VuZEV2ZW50QWZ0ZXJQYXVzZSkge1xuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRGVsdGFUaW1lID0gKG1ldmVudC5TdGFydFRpbWUgLSBwYXVzZVRpbWUpO1xuICAgICAgICAgICAgICAgICAgICBuZXdldmVudHMuQWRkKG1ldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIGZvdW5kRXZlbnRBZnRlclBhdXNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld2V2ZW50cy5BZGQobWV2ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ld2xpc3Q7XG4gICAgfVxuXG5cbiAgICAvKiogV3JpdGUgdGhpcyBNaWRpIGZpbGUgdG8gdGhlIGdpdmVuIGZpbGVuYW1lLlxuICAgICAqIElmIG9wdGlvbnMgaXMgbm90IG51bGwsIGFwcGx5IHRob3NlIG9wdGlvbnMgdG8gdGhlIG1pZGkgZXZlbnRzXG4gICAgICogYmVmb3JlIHBlcmZvcm1pbmcgdGhlIHdyaXRlLlxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSBmaWxlIHdhcyBzYXZlZCBzdWNjZXNzZnVsbHksIGVsc2UgZmFsc2UuXG4gICAgICovXG4gICAgcHVibGljIGJvb2wgQ2hhbmdlU291bmQoc3RyaW5nIGRlc3RmaWxlLCBNaWRpT3B0aW9ucyBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBXcml0ZShkZXN0ZmlsZSwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgcHVibGljIGJvb2wgV3JpdGUoc3RyaW5nIGRlc3RmaWxlLCBNaWRpT3B0aW9ucyBvcHRpb25zKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBGaWxlU3RyZWFtIHN0cmVhbTtcbiAgICAgICAgICAgIHN0cmVhbSA9IG5ldyBGaWxlU3RyZWFtKGRlc3RmaWxlLCBGaWxlTW9kZS5DcmVhdGUpO1xuICAgICAgICAgICAgYm9vbCByZXN1bHQgPSBXcml0ZShzdHJlYW0sIG9wdGlvbnMpO1xuICAgICAgICAgICAgc3RyZWFtLkNsb3NlKCk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChJT0V4Y2VwdGlvbiBlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogV3JpdGUgdGhpcyBNaWRpIGZpbGUgdG8gdGhlIGdpdmVuIHN0cmVhbS5cbiAgICAgKiBJZiBvcHRpb25zIGlzIG5vdCBudWxsLCBhcHBseSB0aG9zZSBvcHRpb25zIHRvIHRoZSBtaWRpIGV2ZW50c1xuICAgICAqIGJlZm9yZSBwZXJmb3JtaW5nIHRoZSB3cml0ZS5cbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgZmlsZSB3YXMgc2F2ZWQgc3VjY2Vzc2Z1bGx5LCBlbHNlIGZhbHNlLlxuICAgICAqL1xuICAgIHB1YmxpYyBib29sIFdyaXRlKFN0cmVhbSBzdHJlYW0sIE1pZGlPcHRpb25zIG9wdGlvbnMpIHtcbiAgICAgICAgTGlzdDxNaWRpRXZlbnQ+W10gbmV3ZXZlbnRzID0gZXZlbnRzO1xuICAgICAgICBpZiAob3B0aW9ucyAhPSBudWxsKSB7XG4gICAgICAgICAgICBuZXdldmVudHMgPSBBcHBseU9wdGlvbnNUb0V2ZW50cyhvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gV3JpdGVFdmVudHMoc3RyZWFtLCBuZXdldmVudHMsIHRyYWNrbW9kZSwgcXVhcnRlcm5vdGUpO1xuICAgIH1cblxuXG4gICAgLyogQXBwbHkgdGhlIGZvbGxvd2luZyBzb3VuZCBvcHRpb25zIHRvIHRoZSBtaWRpIGV2ZW50czpcbiAgICAgKiAtIFRoZSB0ZW1wbyAodGhlIG1pY3Jvc2Vjb25kcyBwZXIgcHVsc2UpXG4gICAgICogLSBUaGUgaW5zdHJ1bWVudHMgcGVyIHRyYWNrXG4gICAgICogLSBUaGUgbm90ZSBudW1iZXIgKHRyYW5zcG9zZSB2YWx1ZSlcbiAgICAgKiAtIFRoZSB0cmFja3MgdG8gaW5jbHVkZVxuICAgICAqIFJldHVybiB0aGUgbW9kaWZpZWQgbGlzdCBvZiBtaWRpIGV2ZW50cy5cbiAgICAgKi9cbiAgICBwcml2YXRlIExpc3Q8TWlkaUV2ZW50PltdXG4gICAgQXBwbHlPcHRpb25zVG9FdmVudHMoTWlkaU9wdGlvbnMgb3B0aW9ucykge1xuICAgICAgICBpbnQgaTtcbiAgICAgICAgaWYgKHRyYWNrUGVyQ2hhbm5lbCkge1xuICAgICAgICAgICAgcmV0dXJuIEFwcGx5T3B0aW9uc1BlckNoYW5uZWwob3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBBIG1pZGlmaWxlIGNhbiBjb250YWluIHRyYWNrcyB3aXRoIG5vdGVzIGFuZCB0cmFja3Mgd2l0aG91dCBub3Rlcy5cbiAgICAgICAgICogVGhlIG9wdGlvbnMudHJhY2tzIGFuZCBvcHRpb25zLmluc3RydW1lbnRzIGFyZSBmb3IgdHJhY2tzIHdpdGggbm90ZXMuXG4gICAgICAgICAqIFNvIHRoZSB0cmFjayBudW1iZXJzIGluICdvcHRpb25zJyBtYXkgbm90IG1hdGNoIGNvcnJlY3RseSBpZiB0aGVcbiAgICAgICAgICogbWlkaSBmaWxlIGhhcyB0cmFja3Mgd2l0aG91dCBub3Rlcy4gUmUtY29tcHV0ZSB0aGUgaW5zdHJ1bWVudHMsIGFuZCBcbiAgICAgICAgICogdHJhY2tzIHRvIGtlZXAuXG4gICAgICAgICAqL1xuICAgICAgICBpbnQgbnVtX3RyYWNrcyA9IGV2ZW50cy5MZW5ndGg7XG4gICAgICAgIGludFtdIGluc3RydW1lbnRzID0gbmV3IGludFtudW1fdHJhY2tzXTtcbiAgICAgICAgYm9vbFtdIGtlZXB0cmFja3MgPSBuZXcgYm9vbFtudW1fdHJhY2tzXTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG51bV90cmFja3M7IGkrKykge1xuICAgICAgICAgICAgaW5zdHJ1bWVudHNbaV0gPSAwO1xuICAgICAgICAgICAga2VlcHRyYWNrc1tpXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IHRyYWNrcy5Db3VudDsgdHJhY2tudW0rKykge1xuICAgICAgICAgICAgTWlkaVRyYWNrIHRyYWNrID0gdHJhY2tzW3RyYWNrbnVtXTtcbiAgICAgICAgICAgIGludCByZWFsdHJhY2sgPSB0cmFjay5OdW1iZXI7XG4gICAgICAgICAgICBpbnN0cnVtZW50c1tyZWFsdHJhY2tdID0gb3B0aW9ucy5pbnN0cnVtZW50c1t0cmFja251bV07XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5tdXRlW3RyYWNrbnVtXSA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAga2VlcHRyYWNrc1tyZWFsdHJhY2tdID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBMaXN0PE1pZGlFdmVudD5bXSBuZXdldmVudHMgPSBDbG9uZU1pZGlFdmVudHMoZXZlbnRzKTtcblxuICAgICAgICAvKiBTZXQgdGhlIHRlbXBvIGF0IHRoZSBiZWdpbm5pbmcgb2YgZWFjaCB0cmFjayAqL1xuICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgbmV3ZXZlbnRzLkxlbmd0aDsgdHJhY2tudW0rKykge1xuICAgICAgICAgICAgTWlkaUV2ZW50IG1ldmVudCA9IENyZWF0ZVRlbXBvRXZlbnQob3B0aW9ucy50ZW1wbyk7XG4gICAgICAgICAgICBuZXdldmVudHNbdHJhY2tudW1dLkluc2VydCgwLCBtZXZlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogQ2hhbmdlIHRoZSBub3RlIG51bWJlciAodHJhbnNwb3NlKSwgaW5zdHJ1bWVudCwgYW5kIHRlbXBvICovXG4gICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCBuZXdldmVudHMuTGVuZ3RoOyB0cmFja251bSsrKSB7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbWV2ZW50IGluIG5ld2V2ZW50c1t0cmFja251bV0pIHtcbiAgICAgICAgICAgICAgICBpbnQgbnVtID0gbWV2ZW50Lk5vdGVudW1iZXIgKyBvcHRpb25zLnRyYW5zcG9zZTtcbiAgICAgICAgICAgICAgICBpZiAobnVtIDwgMClcbiAgICAgICAgICAgICAgICAgICAgbnVtID0gMDtcbiAgICAgICAgICAgICAgICBpZiAobnVtID4gMTI3KVxuICAgICAgICAgICAgICAgICAgICBudW0gPSAxMjc7XG4gICAgICAgICAgICAgICAgbWV2ZW50Lk5vdGVudW1iZXIgPSAoYnl0ZSludW07XG4gICAgICAgICAgICAgICAgaWYgKCFvcHRpb25zLnVzZURlZmF1bHRJbnN0cnVtZW50cykge1xuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuSW5zdHJ1bWVudCA9IChieXRlKWluc3RydW1lbnRzW3RyYWNrbnVtXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbWV2ZW50LlRlbXBvID0gb3B0aW9ucy50ZW1wbztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zLnBhdXNlVGltZSAhPSAwKSB7XG4gICAgICAgICAgICBuZXdldmVudHMgPSBTdGFydEF0UGF1c2VUaW1lKG5ld2V2ZW50cywgb3B0aW9ucy5wYXVzZVRpbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogQ2hhbmdlIHRoZSB0cmFja3MgdG8gaW5jbHVkZSAqL1xuICAgICAgICBpbnQgY291bnQgPSAwO1xuICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwga2VlcHRyYWNrcy5MZW5ndGg7IHRyYWNrbnVtKyspIHtcbiAgICAgICAgICAgIGlmIChrZWVwdHJhY2tzW3RyYWNrbnVtXSkge1xuICAgICAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgTGlzdDxNaWRpRXZlbnQ+W10gcmVzdWx0ID0gbmV3IExpc3Q8TWlkaUV2ZW50Pltjb3VudF07XG4gICAgICAgIGkgPSAwO1xuICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwga2VlcHRyYWNrcy5MZW5ndGg7IHRyYWNrbnVtKyspIHtcbiAgICAgICAgICAgIGlmIChrZWVwdHJhY2tzW3RyYWNrbnVtXSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtpXSA9IG5ld2V2ZW50c1t0cmFja251bV07XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyogQXBwbHkgdGhlIGZvbGxvd2luZyBzb3VuZCBvcHRpb25zIHRvIHRoZSBtaWRpIGV2ZW50czpcbiAgICAgKiAtIFRoZSB0ZW1wbyAodGhlIG1pY3Jvc2Vjb25kcyBwZXIgcHVsc2UpXG4gICAgICogLSBUaGUgaW5zdHJ1bWVudHMgcGVyIHRyYWNrXG4gICAgICogLSBUaGUgbm90ZSBudW1iZXIgKHRyYW5zcG9zZSB2YWx1ZSlcbiAgICAgKiAtIFRoZSB0cmFja3MgdG8gaW5jbHVkZVxuICAgICAqIFJldHVybiB0aGUgbW9kaWZpZWQgbGlzdCBvZiBtaWRpIGV2ZW50cy5cbiAgICAgKlxuICAgICAqIFRoaXMgTWlkaSBmaWxlIG9ubHkgaGFzIG9uZSBhY3R1YWwgdHJhY2ssIGJ1dCB3ZSd2ZSBzcGxpdCB0aGF0XG4gICAgICogaW50byBtdWx0aXBsZSBmYWtlIHRyYWNrcywgb25lIHBlciBjaGFubmVsLCBhbmQgZGlzcGxheWVkIHRoYXRcbiAgICAgKiB0byB0aGUgZW5kLXVzZXIuICBTbyBjaGFuZ2luZyB0aGUgaW5zdHJ1bWVudCwgYW5kIHRyYWNrcyB0b1xuICAgICAqIGluY2x1ZGUsIGlzIGltcGxlbWVudGVkIGRpZmZlcmVudGx5IHRoYW4gQXBwbHlPcHRpb25zVG9FdmVudHMoKS5cbiAgICAgKlxuICAgICAqIC0gV2UgY2hhbmdlIHRoZSBpbnN0cnVtZW50IGJhc2VkIG9uIHRoZSBjaGFubmVsLCBub3QgdGhlIHRyYWNrLlxuICAgICAqIC0gV2UgaW5jbHVkZS9leGNsdWRlIGNoYW5uZWxzLCBub3QgdHJhY2tzLlxuICAgICAqIC0gV2UgZXhjbHVkZSBhIGNoYW5uZWwgYnkgc2V0dGluZyB0aGUgbm90ZSB2b2x1bWUvdmVsb2NpdHkgdG8gMC5cbiAgICAgKi9cbiAgICBwcml2YXRlIExpc3Q8TWlkaUV2ZW50PltdXG4gICAgQXBwbHlPcHRpb25zUGVyQ2hhbm5lbChNaWRpT3B0aW9ucyBvcHRpb25zKSB7XG4gICAgICAgIC8qIERldGVybWluZSB3aGljaCBjaGFubmVscyB0byBpbmNsdWRlL2V4Y2x1ZGUuXG4gICAgICAgICAqIEFsc28sIGRldGVybWluZSB0aGUgaW5zdHJ1bWVudHMgZm9yIGVhY2ggY2hhbm5lbC5cbiAgICAgICAgICovXG4gICAgICAgIGludFtdIGluc3RydW1lbnRzID0gbmV3IGludFsxNl07XG4gICAgICAgIGJvb2xbXSBrZWVwY2hhbm5lbCA9IG5ldyBib29sWzE2XTtcbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCAxNjsgaSsrKSB7XG4gICAgICAgICAgICBpbnN0cnVtZW50c1tpXSA9IDA7XG4gICAgICAgICAgICBrZWVwY2hhbm5lbFtpXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IHRyYWNrcy5Db3VudDsgdHJhY2tudW0rKykge1xuICAgICAgICAgICAgTWlkaVRyYWNrIHRyYWNrID0gdHJhY2tzW3RyYWNrbnVtXTtcbiAgICAgICAgICAgIGludCBjaGFubmVsID0gdHJhY2suTm90ZXNbMF0uQ2hhbm5lbDtcbiAgICAgICAgICAgIGluc3RydW1lbnRzW2NoYW5uZWxdID0gb3B0aW9ucy5pbnN0cnVtZW50c1t0cmFja251bV07XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5tdXRlW3RyYWNrbnVtXSA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAga2VlcGNoYW5uZWxbY2hhbm5lbF0gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgTGlzdDxNaWRpRXZlbnQ+W10gbmV3ZXZlbnRzID0gQ2xvbmVNaWRpRXZlbnRzKGV2ZW50cyk7XG5cbiAgICAgICAgLyogU2V0IHRoZSB0ZW1wbyBhdCB0aGUgYmVnaW5uaW5nIG9mIGVhY2ggdHJhY2sgKi9cbiAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IG5ld2V2ZW50cy5MZW5ndGg7IHRyYWNrbnVtKyspIHtcbiAgICAgICAgICAgIE1pZGlFdmVudCBtZXZlbnQgPSBDcmVhdGVUZW1wb0V2ZW50KG9wdGlvbnMudGVtcG8pO1xuICAgICAgICAgICAgbmV3ZXZlbnRzW3RyYWNrbnVtXS5JbnNlcnQoMCwgbWV2ZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIENoYW5nZSB0aGUgbm90ZSBudW1iZXIgKHRyYW5zcG9zZSksIGluc3RydW1lbnQsIGFuZCB0ZW1wbyAqL1xuICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgbmV3ZXZlbnRzLkxlbmd0aDsgdHJhY2tudW0rKykge1xuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaUV2ZW50IG1ldmVudCBpbiBuZXdldmVudHNbdHJhY2tudW1dKSB7XG4gICAgICAgICAgICAgICAgaW50IG51bSA9IG1ldmVudC5Ob3RlbnVtYmVyICsgb3B0aW9ucy50cmFuc3Bvc2U7XG4gICAgICAgICAgICAgICAgaWYgKG51bSA8IDApXG4gICAgICAgICAgICAgICAgICAgIG51bSA9IDA7XG4gICAgICAgICAgICAgICAgaWYgKG51bSA+IDEyNylcbiAgICAgICAgICAgICAgICAgICAgbnVtID0gMTI3O1xuICAgICAgICAgICAgICAgIG1ldmVudC5Ob3RlbnVtYmVyID0gKGJ5dGUpbnVtO1xuICAgICAgICAgICAgICAgIGlmICgha2VlcGNoYW5uZWxbbWV2ZW50LkNoYW5uZWxdKSB7XG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5WZWxvY2l0eSA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy51c2VEZWZhdWx0SW5zdHJ1bWVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50Lkluc3RydW1lbnQgPSAoYnl0ZSlpbnN0cnVtZW50c1ttZXZlbnQuQ2hhbm5lbF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG1ldmVudC5UZW1wbyA9IG9wdGlvbnMudGVtcG87XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdGlvbnMucGF1c2VUaW1lICE9IDApIHtcbiAgICAgICAgICAgIG5ld2V2ZW50cyA9IFN0YXJ0QXRQYXVzZVRpbWUobmV3ZXZlbnRzLCBvcHRpb25zLnBhdXNlVGltZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ld2V2ZW50cztcbiAgICB9XG5cblxuICAgIC8qKiBBcHBseSB0aGUgZ2l2ZW4gc2hlZXQgbXVzaWMgb3B0aW9ucyB0byB0aGUgTWlkaU5vdGVzLlxuICAgICAqICBSZXR1cm4gdGhlIG1pZGkgdHJhY2tzIHdpdGggdGhlIGNoYW5nZXMgYXBwbGllZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgTGlzdDxNaWRpVHJhY2s+IENoYW5nZU1pZGlOb3RlcyhNaWRpT3B0aW9ucyBvcHRpb25zKSB7XG4gICAgICAgIExpc3Q8TWlkaVRyYWNrPiBuZXd0cmFja3MgPSBuZXcgTGlzdDxNaWRpVHJhY2s+KCk7XG5cbiAgICAgICAgZm9yIChpbnQgdHJhY2sgPSAwOyB0cmFjayA8IHRyYWNrcy5Db3VudDsgdHJhY2srKykge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMudHJhY2tzW3RyYWNrXSkge1xuICAgICAgICAgICAgICAgIG5ld3RyYWNrcy5BZGQodHJhY2tzW3RyYWNrXS5DbG9uZSgpICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBUbyBtYWtlIHRoZSBzaGVldCBtdXNpYyBsb29rIG5pY2VyLCB3ZSByb3VuZCB0aGUgc3RhcnQgdGltZXNcbiAgICAgICAgICogc28gdGhhdCBub3RlcyBjbG9zZSB0b2dldGhlciBhcHBlYXIgYXMgYSBzaW5nbGUgY2hvcmQuICBXZVxuICAgICAgICAgKiBhbHNvIGV4dGVuZCB0aGUgbm90ZSBkdXJhdGlvbnMsIHNvIHRoYXQgd2UgaGF2ZSBsb25nZXIgbm90ZXNcbiAgICAgICAgICogYW5kIGZld2VyIHJlc3Qgc3ltYm9scy5cbiAgICAgICAgICovXG4gICAgICAgIFRpbWVTaWduYXR1cmUgdGltZSA9IHRpbWVzaWc7XG4gICAgICAgIGlmIChvcHRpb25zLnRpbWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGltZSA9IG9wdGlvbnMudGltZTtcbiAgICAgICAgfVxuICAgICAgICBNaWRpRmlsZS5Sb3VuZFN0YXJ0VGltZXMobmV3dHJhY2tzLCBvcHRpb25zLmNvbWJpbmVJbnRlcnZhbCwgdGltZXNpZyk7XG4gICAgICAgIE1pZGlGaWxlLlJvdW5kRHVyYXRpb25zKG5ld3RyYWNrcywgdGltZS5RdWFydGVyKTtcblxuICAgICAgICBpZiAob3B0aW9ucy50d29TdGFmZnMpIHtcbiAgICAgICAgICAgIG5ld3RyYWNrcyA9IE1pZGlGaWxlLkNvbWJpbmVUb1R3b1RyYWNrcyhuZXd0cmFja3MsIHRpbWVzaWcuTWVhc3VyZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdGlvbnMuc2hpZnR0aW1lICE9IDApIHtcbiAgICAgICAgICAgIE1pZGlGaWxlLlNoaWZ0VGltZShuZXd0cmFja3MsIG9wdGlvbnMuc2hpZnR0aW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9ucy50cmFuc3Bvc2UgIT0gMCkge1xuICAgICAgICAgICAgTWlkaUZpbGUuVHJhbnNwb3NlKG5ld3RyYWNrcywgb3B0aW9ucy50cmFuc3Bvc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ld3RyYWNrcztcbiAgICB9XG5cblxuICAgIC8qKiBTaGlmdCB0aGUgc3RhcnR0aW1lIG9mIHRoZSBub3RlcyBieSB0aGUgZ2l2ZW4gYW1vdW50LlxuICAgICAqIFRoaXMgaXMgdXNlZCBieSB0aGUgU2hpZnQgTm90ZXMgbWVudSB0byBzaGlmdCBub3RlcyBsZWZ0L3JpZ2h0LlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgdm9pZFxuICAgIFNoaWZ0VGltZShMaXN0PE1pZGlUcmFjaz4gdHJhY2tzLCBpbnQgYW1vdW50KVxuICAgIHtcbiAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcykge1xuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiB0cmFjay5Ob3Rlcykge1xuICAgICAgICAgICAgICAgIG5vdGUuU3RhcnRUaW1lICs9IGFtb3VudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBTaGlmdCB0aGUgbm90ZSBrZXlzIHVwL2Rvd24gYnkgdGhlIGdpdmVuIGFtb3VudCAqL1xuICAgIHB1YmxpYyBzdGF0aWMgdm9pZFxuICAgIFRyYW5zcG9zZShMaXN0PE1pZGlUcmFjaz4gdHJhY2tzLCBpbnQgYW1vdW50KVxuICAgIHtcbiAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcykge1xuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiB0cmFjay5Ob3Rlcykge1xuICAgICAgICAgICAgICAgIG5vdGUuTnVtYmVyICs9IGFtb3VudDtcbiAgICAgICAgICAgICAgICBpZiAobm90ZS5OdW1iZXIgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vdGUuTnVtYmVyID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgIFxuICAgIC8qIEZpbmQgdGhlIGhpZ2hlc3QgYW5kIGxvd2VzdCBub3RlcyB0aGF0IG92ZXJsYXAgdGhpcyBpbnRlcnZhbCAoc3RhcnR0aW1lIHRvIGVuZHRpbWUpLlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIHVzZWQgYnkgU3BsaXRUcmFjayB0byBkZXRlcm1pbmUgd2hpY2ggc3RhZmYgKHRvcCBvciBib3R0b20pIGEgbm90ZVxuICAgICAqIHNob3VsZCBnbyB0by5cbiAgICAgKlxuICAgICAqIEZvciBtb3JlIGFjY3VyYXRlIFNwbGl0VHJhY2soKSByZXN1bHRzLCB3ZSBsaW1pdCB0aGUgaW50ZXJ2YWwvZHVyYXRpb24gb2YgdGhpcyBub3RlIFxuICAgICAqIChhbmQgb3RoZXIgbm90ZXMpIHRvIG9uZSBtZWFzdXJlLiBXZSBjYXJlIG9ubHkgYWJvdXQgaGlnaC9sb3cgbm90ZXMgdGhhdCBhcmVcbiAgICAgKiByZWFzb25hYmx5IGNsb3NlIHRvIHRoaXMgbm90ZS5cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyB2b2lkXG4gICAgRmluZEhpZ2hMb3dOb3RlcyhMaXN0PE1pZGlOb3RlPiBub3RlcywgaW50IG1lYXN1cmVsZW4sIGludCBzdGFydGluZGV4LCBcbiAgICAgICAgICAgICAgICAgICAgIGludCBzdGFydHRpbWUsIGludCBlbmR0aW1lLCByZWYgaW50IGhpZ2gsIHJlZiBpbnQgbG93KSB7XG5cbiAgICAgICAgaW50IGkgPSBzdGFydGluZGV4O1xuICAgICAgICBpZiAoc3RhcnR0aW1lICsgbWVhc3VyZWxlbiA8IGVuZHRpbWUpIHtcbiAgICAgICAgICAgIGVuZHRpbWUgPSBzdGFydHRpbWUgKyBtZWFzdXJlbGVuO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKGkgPCBub3Rlcy5Db3VudCAmJiBub3Rlc1tpXS5TdGFydFRpbWUgPCBlbmR0aW1lKSB7XG4gICAgICAgICAgICBpZiAobm90ZXNbaV0uRW5kVGltZSA8IHN0YXJ0dGltZSkge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChub3Rlc1tpXS5TdGFydFRpbWUgKyBtZWFzdXJlbGVuIDwgc3RhcnR0aW1lKSB7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGhpZ2ggPCBub3Rlc1tpXS5OdW1iZXIpIHtcbiAgICAgICAgICAgICAgICBoaWdoID0gbm90ZXNbaV0uTnVtYmVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxvdyA+IG5vdGVzW2ldLk51bWJlcikge1xuICAgICAgICAgICAgICAgIGxvdyA9IG5vdGVzW2ldLk51bWJlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qIEZpbmQgdGhlIGhpZ2hlc3QgYW5kIGxvd2VzdCBub3RlcyB0aGF0IHN0YXJ0IGF0IHRoaXMgZXhhY3Qgc3RhcnQgdGltZSAqL1xuICAgIHByaXZhdGUgc3RhdGljIHZvaWRcbiAgICBGaW5kRXhhY3RIaWdoTG93Tm90ZXMoTGlzdDxNaWRpTm90ZT4gbm90ZXMsIGludCBzdGFydGluZGV4LCBpbnQgc3RhcnR0aW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICByZWYgaW50IGhpZ2gsIHJlZiBpbnQgbG93KSB7XG5cbiAgICAgICAgaW50IGkgPSBzdGFydGluZGV4O1xuXG4gICAgICAgIHdoaWxlIChub3Rlc1tpXS5TdGFydFRpbWUgPCBzdGFydHRpbWUpIHtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlIChpIDwgbm90ZXMuQ291bnQgJiYgbm90ZXNbaV0uU3RhcnRUaW1lID09IHN0YXJ0dGltZSkge1xuICAgICAgICAgICAgaWYgKGhpZ2ggPCBub3Rlc1tpXS5OdW1iZXIpIHtcbiAgICAgICAgICAgICAgICBoaWdoID0gbm90ZXNbaV0uTnVtYmVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxvdyA+IG5vdGVzW2ldLk51bWJlcikge1xuICAgICAgICAgICAgICAgIGxvdyA9IG5vdGVzW2ldLk51bWJlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgIH1cblxuXG4gXG4gICAgLyogU3BsaXQgdGhlIGdpdmVuIE1pZGlUcmFjayBpbnRvIHR3byB0cmFja3MsIHRvcCBhbmQgYm90dG9tLlxuICAgICAqIFRoZSBoaWdoZXN0IG5vdGVzIHdpbGwgZ28gaW50byB0b3AsIHRoZSBsb3dlc3QgaW50byBib3R0b20uXG4gICAgICogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIHNwbGl0IHBpYW5vIHNvbmdzIGludG8gbGVmdC1oYW5kIChib3R0b20pXG4gICAgICogYW5kIHJpZ2h0LWhhbmQgKHRvcCkgdHJhY2tzLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgTGlzdDxNaWRpVHJhY2s+IFNwbGl0VHJhY2soTWlkaVRyYWNrIHRyYWNrLCBpbnQgbWVhc3VyZWxlbikge1xuICAgICAgICBMaXN0PE1pZGlOb3RlPiBub3RlcyA9IHRyYWNrLk5vdGVzO1xuICAgICAgICBpbnQgY291bnQgPSBub3Rlcy5Db3VudDtcblxuICAgICAgICBNaWRpVHJhY2sgdG9wID0gbmV3IE1pZGlUcmFjaygxKTtcbiAgICAgICAgTWlkaVRyYWNrIGJvdHRvbSA9IG5ldyBNaWRpVHJhY2soMik7XG4gICAgICAgIExpc3Q8TWlkaVRyYWNrPiByZXN1bHQgPSBuZXcgTGlzdDxNaWRpVHJhY2s+KDIpO1xuICAgICAgICByZXN1bHQuQWRkKHRvcCk7IHJlc3VsdC5BZGQoYm90dG9tKTtcblxuICAgICAgICBpZiAoY291bnQgPT0gMClcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG5cbiAgICAgICAgaW50IHByZXZoaWdoICA9IDc2OyAvKiBFNSwgdG9wIG9mIHRyZWJsZSBzdGFmZiAqL1xuICAgICAgICBpbnQgcHJldmxvdyAgID0gNDU7IC8qIEEzLCBib3R0b20gb2YgYmFzcyBzdGFmZiAqL1xuICAgICAgICBpbnQgc3RhcnRpbmRleCA9IDA7XG5cbiAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiBub3Rlcykge1xuICAgICAgICAgICAgaW50IGhpZ2gsIGxvdywgaGlnaEV4YWN0LCBsb3dFeGFjdDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaW50IG51bWJlciA9IG5vdGUuTnVtYmVyO1xuICAgICAgICAgICAgaGlnaCA9IGxvdyA9IGhpZ2hFeGFjdCA9IGxvd0V4YWN0ID0gbnVtYmVyO1xuXG4gICAgICAgICAgICB3aGlsZSAobm90ZXNbc3RhcnRpbmRleF0uRW5kVGltZSA8IG5vdGUuU3RhcnRUaW1lKSB7XG4gICAgICAgICAgICAgICAgc3RhcnRpbmRleCsrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBJJ3ZlIHRyaWVkIHNldmVyYWwgYWxnb3JpdGhtcyBmb3Igc3BsaXR0aW5nIGEgdHJhY2sgaW4gdHdvLFxuICAgICAgICAgICAgICogYW5kIHRoZSBvbmUgYmVsb3cgc2VlbXMgdG8gd29yayB0aGUgYmVzdDpcbiAgICAgICAgICAgICAqIC0gSWYgdGhpcyBub3RlIGlzIG1vcmUgdGhhbiBhbiBvY3RhdmUgZnJvbSB0aGUgaGlnaC9sb3cgbm90ZXNcbiAgICAgICAgICAgICAqICAgKHRoYXQgc3RhcnQgZXhhY3RseSBhdCB0aGlzIHN0YXJ0IHRpbWUpLCBjaG9vc2UgdGhlIGNsb3Nlc3Qgb25lLlxuICAgICAgICAgICAgICogLSBJZiB0aGlzIG5vdGUgaXMgbW9yZSB0aGFuIGFuIG9jdGF2ZSBmcm9tIHRoZSBoaWdoL2xvdyBub3Rlc1xuICAgICAgICAgICAgICogICAoaW4gdGhpcyBub3RlJ3MgdGltZSBkdXJhdGlvbiksIGNob29zZSB0aGUgY2xvc2VzdCBvbmUuXG4gICAgICAgICAgICAgKiAtIElmIHRoZSBoaWdoIGFuZCBsb3cgbm90ZXMgKHRoYXQgc3RhcnQgZXhhY3RseSBhdCB0aGlzIHN0YXJ0dGltZSlcbiAgICAgICAgICAgICAqICAgYXJlIG1vcmUgdGhhbiBhbiBvY3RhdmUgYXBhcnQsIGNob29zZSB0aGUgY2xvc2VzdCBub3RlLlxuICAgICAgICAgICAgICogLSBJZiB0aGUgaGlnaCBhbmQgbG93IG5vdGVzICh0aGF0IG92ZXJsYXAgdGhpcyBzdGFydHRpbWUpXG4gICAgICAgICAgICAgKiAgIGFyZSBtb3JlIHRoYW4gYW4gb2N0YXZlIGFwYXJ0LCBjaG9vc2UgdGhlIGNsb3Nlc3Qgbm90ZS5cbiAgICAgICAgICAgICAqIC0gRWxzZSwgbG9vayBhdCB0aGUgcHJldmlvdXMgaGlnaC9sb3cgbm90ZXMgdGhhdCB3ZXJlIG1vcmUgdGhhbiBhbiBcbiAgICAgICAgICAgICAqICAgb2N0YXZlIGFwYXJ0LiAgQ2hvb3NlIHRoZSBjbG9zZXNldCBub3RlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBGaW5kSGlnaExvd05vdGVzKG5vdGVzLCBtZWFzdXJlbGVuLCBzdGFydGluZGV4LCBub3RlLlN0YXJ0VGltZSwgbm90ZS5FbmRUaW1lLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmIGhpZ2gsIHJlZiBsb3cpO1xuICAgICAgICAgICAgRmluZEV4YWN0SGlnaExvd05vdGVzKG5vdGVzLCBzdGFydGluZGV4LCBub3RlLlN0YXJ0VGltZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWYgaGlnaEV4YWN0LCByZWYgbG93RXhhY3QpO1xuXG4gICAgICAgICAgICBpZiAoaGlnaEV4YWN0IC0gbnVtYmVyID4gMTIgfHwgbnVtYmVyIC0gbG93RXhhY3QgPiAxMikge1xuICAgICAgICAgICAgICAgIGlmIChoaWdoRXhhY3QgLSBudW1iZXIgPD0gbnVtYmVyIC0gbG93RXhhY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9wLkFkZE5vdGUobm90ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBib3R0b20uQWRkTm90ZShub3RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IFxuICAgICAgICAgICAgZWxzZSBpZiAoaGlnaCAtIG51bWJlciA+IDEyIHx8IG51bWJlciAtIGxvdyA+IDEyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGhpZ2ggLSBudW1iZXIgPD0gbnVtYmVyIC0gbG93KSB7XG4gICAgICAgICAgICAgICAgICAgIHRvcC5BZGROb3RlKG5vdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYm90dG9tLkFkZE5vdGUobm90ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIGVsc2UgaWYgKGhpZ2hFeGFjdCAtIGxvd0V4YWN0ID4gMTIpIHtcbiAgICAgICAgICAgICAgICBpZiAoaGlnaEV4YWN0IC0gbnVtYmVyIDw9IG51bWJlciAtIGxvd0V4YWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRvcC5BZGROb3RlKG5vdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYm90dG9tLkFkZE5vdGUobm90ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaGlnaCAtIGxvdyA+IDEyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGhpZ2ggLSBudW1iZXIgPD0gbnVtYmVyIC0gbG93KSB7XG4gICAgICAgICAgICAgICAgICAgIHRvcC5BZGROb3RlKG5vdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYm90dG9tLkFkZE5vdGUobm90ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHByZXZoaWdoIC0gbnVtYmVyIDw9IG51bWJlciAtIHByZXZsb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9wLkFkZE5vdGUobm90ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBib3R0b20uQWRkTm90ZShub3RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIFRoZSBwcmV2aGlnaC9wcmV2bG93IGFyZSBzZXQgdG8gdGhlIGxhc3QgaGlnaC9sb3dcbiAgICAgICAgICAgICAqIHRoYXQgYXJlIG1vcmUgdGhhbiBhbiBvY3RhdmUgYXBhcnQuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlmIChoaWdoIC0gbG93ID4gMTIpIHtcbiAgICAgICAgICAgICAgICBwcmV2aGlnaCA9IGhpZ2g7XG4gICAgICAgICAgICAgICAgcHJldmxvdyA9IGxvdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRvcC5Ob3Rlcy5Tb3J0KHRyYWNrLk5vdGVzWzBdKTtcbiAgICAgICAgYm90dG9tLk5vdGVzLlNvcnQodHJhY2suTm90ZXNbMF0pO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG5cbiAgICAvKiogQ29tYmluZSB0aGUgbm90ZXMgaW4gdGhlIGdpdmVuIHRyYWNrcyBpbnRvIGEgc2luZ2xlIE1pZGlUcmFjay4gXG4gICAgICogIFRoZSBpbmRpdmlkdWFsIHRyYWNrcyBhcmUgYWxyZWFkeSBzb3J0ZWQuICBUbyBtZXJnZSB0aGVtLCB3ZVxuICAgICAqICB1c2UgYSBtZXJnZXNvcnQtbGlrZSBhbGdvcml0aG0uXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBNaWRpVHJhY2sgQ29tYmluZVRvU2luZ2xlVHJhY2soTGlzdDxNaWRpVHJhY2s+IHRyYWNrcylcbiAgICB7XG4gICAgICAgIC8qIEFkZCBhbGwgbm90ZXMgaW50byBvbmUgdHJhY2sgKi9cbiAgICAgICAgTWlkaVRyYWNrIHJlc3VsdCA9IG5ldyBNaWRpVHJhY2soMSk7XG5cbiAgICAgICAgaWYgKHRyYWNrcy5Db3VudCA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRyYWNrcy5Db3VudCA9PSAxKSB7XG4gICAgICAgICAgICBNaWRpVHJhY2sgdHJhY2sgPSB0cmFja3NbMF07XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrLk5vdGVzKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LkFkZE5vdGUobm90ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG5cbiAgICAgICAgaW50W10gbm90ZWluZGV4ID0gbmV3IGludFs2NF07XG4gICAgICAgIGludFtdIG5vdGVjb3VudCA9IG5ldyBpbnRbNjRdO1xuXG4gICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCB0cmFja3MuQ291bnQ7IHRyYWNrbnVtKyspIHtcbiAgICAgICAgICAgIG5vdGVpbmRleFt0cmFja251bV0gPSAwO1xuICAgICAgICAgICAgbm90ZWNvdW50W3RyYWNrbnVtXSA9IHRyYWNrc1t0cmFja251bV0uTm90ZXMuQ291bnQ7XG4gICAgICAgIH1cbiAgICAgICAgTWlkaU5vdGUgcHJldm5vdGUgPSBudWxsO1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgTWlkaU5vdGUgbG93ZXN0bm90ZSA9IG51bGw7XG4gICAgICAgICAgICBpbnQgbG93ZXN0VHJhY2sgPSAtMTtcbiAgICAgICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCB0cmFja3MuQ291bnQ7IHRyYWNrbnVtKyspIHtcbiAgICAgICAgICAgICAgICBNaWRpVHJhY2sgdHJhY2sgPSB0cmFja3NbdHJhY2tudW1dO1xuICAgICAgICAgICAgICAgIGlmIChub3RlaW5kZXhbdHJhY2tudW1dID49IG5vdGVjb3VudFt0cmFja251bV0pIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIE1pZGlOb3RlIG5vdGUgPSB0cmFjay5Ob3Rlc1sgbm90ZWluZGV4W3RyYWNrbnVtXSBdO1xuICAgICAgICAgICAgICAgIGlmIChsb3dlc3Rub3RlID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgbG93ZXN0bm90ZSA9IG5vdGU7XG4gICAgICAgICAgICAgICAgICAgIGxvd2VzdFRyYWNrID0gdHJhY2tudW07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG5vdGUuU3RhcnRUaW1lIDwgbG93ZXN0bm90ZS5TdGFydFRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbG93ZXN0bm90ZSA9IG5vdGU7XG4gICAgICAgICAgICAgICAgICAgIGxvd2VzdFRyYWNrID0gdHJhY2tudW07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG5vdGUuU3RhcnRUaW1lID09IGxvd2VzdG5vdGUuU3RhcnRUaW1lICYmIG5vdGUuTnVtYmVyIDwgbG93ZXN0bm90ZS5OdW1iZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgbG93ZXN0bm90ZSA9IG5vdGU7XG4gICAgICAgICAgICAgICAgICAgIGxvd2VzdFRyYWNrID0gdHJhY2tudW07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxvd2VzdG5vdGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8qIFdlJ3ZlIGZpbmlzaGVkIHRoZSBtZXJnZSAqL1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbm90ZWluZGV4W2xvd2VzdFRyYWNrXSsrO1xuICAgICAgICAgICAgaWYgKChwcmV2bm90ZSAhPSBudWxsKSAmJiAocHJldm5vdGUuU3RhcnRUaW1lID09IGxvd2VzdG5vdGUuU3RhcnRUaW1lKSAmJlxuICAgICAgICAgICAgICAgIChwcmV2bm90ZS5OdW1iZXIgPT0gbG93ZXN0bm90ZS5OdW1iZXIpICkge1xuXG4gICAgICAgICAgICAgICAgLyogRG9uJ3QgYWRkIGR1cGxpY2F0ZSBub3Rlcywgd2l0aCB0aGUgc2FtZSBzdGFydCB0aW1lIGFuZCBudW1iZXIgKi8gICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChsb3dlc3Rub3RlLkR1cmF0aW9uID4gcHJldm5vdGUuRHVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcHJldm5vdGUuRHVyYXRpb24gPSBsb3dlc3Rub3RlLkR1cmF0aW9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5BZGROb3RlKGxvd2VzdG5vdGUpO1xuICAgICAgICAgICAgICAgIHByZXZub3RlID0gbG93ZXN0bm90ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIFxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuXG4gICAgLyoqIENvbWJpbmUgdGhlIG5vdGVzIGluIGFsbCB0aGUgdHJhY2tzIGdpdmVuIGludG8gdHdvIE1pZGlUcmFja3MsXG4gICAgICogYW5kIHJldHVybiB0aGVtLlxuICAgICAqIFxuICAgICAqIFRoaXMgZnVuY3Rpb24gaXMgaW50ZW5kZWQgZm9yIHBpYW5vIHNvbmdzLCB3aGVuIHdlIHdhbnQgdG8gZGlzcGxheVxuICAgICAqIGEgbGVmdC1oYW5kIHRyYWNrIGFuZCBhIHJpZ2h0LWhhbmQgdHJhY2suICBUaGUgbG93ZXIgbm90ZXMgZ28gaW50byBcbiAgICAgKiB0aGUgbGVmdC1oYW5kIHRyYWNrLCBhbmQgdGhlIGhpZ2hlciBub3RlcyBnbyBpbnRvIHRoZSByaWdodCBoYW5kIFxuICAgICAqIHRyYWNrLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgTGlzdDxNaWRpVHJhY2s+IENvbWJpbmVUb1R3b1RyYWNrcyhMaXN0PE1pZGlUcmFjaz4gdHJhY2tzLCBpbnQgbWVhc3VyZWxlbilcbiAgICB7XG4gICAgICAgIE1pZGlUcmFjayBzaW5nbGUgPSBDb21iaW5lVG9TaW5nbGVUcmFjayh0cmFja3MpO1xuICAgICAgICBMaXN0PE1pZGlUcmFjaz4gcmVzdWx0ID0gU3BsaXRUcmFjayhzaW5nbGUsIG1lYXN1cmVsZW4pO1xuXG4gICAgICAgIExpc3Q8TWlkaUV2ZW50PiBseXJpY3MgPSBuZXcgTGlzdDxNaWRpRXZlbnQ+KCk7XG4gICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpIHtcbiAgICAgICAgICAgIGlmICh0cmFjay5MeXJpY3MgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGx5cmljcy5BZGRSYW5nZSh0cmFjay5MeXJpY3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChseXJpY3MuQ291bnQgPiAwKSB7XG4gICAgICAgICAgICBseXJpY3MuU29ydChseXJpY3NbMF0pO1xuICAgICAgICAgICAgcmVzdWx0WzBdLkx5cmljcyA9IGx5cmljcztcbiAgICAgICAgfSBcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuXG4gICAgLyoqIENoZWNrIHRoYXQgdGhlIE1pZGlOb3RlIHN0YXJ0IHRpbWVzIGFyZSBpbiBpbmNyZWFzaW5nIG9yZGVyLlxuICAgICAqIFRoaXMgaXMgZm9yIGRlYnVnZ2luZyBwdXJwb3Nlcy5cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyB2b2lkIENoZWNrU3RhcnRUaW1lcyhMaXN0PE1pZGlUcmFjaz4gdHJhY2tzKSB7XG4gICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpIHtcbiAgICAgICAgICAgIGludCBwcmV2dGltZSA9IC0xO1xuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiB0cmFjay5Ob3Rlcykge1xuICAgICAgICAgICAgICAgIGlmIChub3RlLlN0YXJ0VGltZSA8IHByZXZ0aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBTeXN0ZW0uQXJndW1lbnRFeGNlcHRpb24oXCJzdGFydCB0aW1lcyBub3QgaW4gaW5jcmVhc2luZyBvcmRlclwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcHJldnRpbWUgPSBub3RlLlN0YXJ0VGltZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLyoqIEluIE1pZGkgRmlsZXMsIHRpbWUgaXMgbWVhc3VyZWQgaW4gcHVsc2VzLiAgTm90ZXMgdGhhdCBoYXZlXG4gICAgICogcHVsc2UgdGltZXMgdGhhdCBhcmUgY2xvc2UgdG9nZXRoZXIgKGxpa2Ugd2l0aGluIDEwIHB1bHNlcylcbiAgICAgKiB3aWxsIHNvdW5kIGxpa2UgdGhleSdyZSB0aGUgc2FtZSBjaG9yZC4gIFdlIHdhbnQgdG8gZHJhd1xuICAgICAqIHRoZXNlIG5vdGVzIGFzIGEgc2luZ2xlIGNob3JkLCBpdCBtYWtlcyB0aGUgc2hlZXQgbXVzaWMgbXVjaFxuICAgICAqIGVhc2llciB0byByZWFkLiAgV2UgZG9uJ3Qgd2FudCB0byBkcmF3IG5vdGVzIHRoYXQgYXJlIGNsb3NlXG4gICAgICogdG9nZXRoZXIgYXMgdHdvIHNlcGFyYXRlIGNob3Jkcy5cbiAgICAgKlxuICAgICAqIFRoZSBTeW1ib2xTcGFjaW5nIGNsYXNzIG9ubHkgYWxpZ25zIG5vdGVzIHRoYXQgaGF2ZSBleGFjdGx5IHRoZSBzYW1lXG4gICAgICogc3RhcnQgdGltZXMuICBOb3RlcyB3aXRoIHNsaWdodGx5IGRpZmZlcmVudCBzdGFydCB0aW1lcyB3aWxsXG4gICAgICogYXBwZWFyIGluIHNlcGFyYXRlIHZlcnRpY2FsIGNvbHVtbnMuICBUaGlzIGlzbid0IHdoYXQgd2Ugd2FudC5cbiAgICAgKiBXZSB3YW50IHRvIGFsaWduIG5vdGVzIHdpdGggYXBwcm94aW1hdGVseSB0aGUgc2FtZSBzdGFydCB0aW1lcy5cbiAgICAgKiBTbywgdGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIGFzc2lnbiB0aGUgc2FtZSBzdGFydHRpbWUgZm9yIG5vdGVzXG4gICAgICogdGhhdCBhcmUgY2xvc2UgdG9nZXRoZXIgKHRpbWV3aXNlKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHZvaWRcbiAgICBSb3VuZFN0YXJ0VGltZXMoTGlzdDxNaWRpVHJhY2s+IHRyYWNrcywgaW50IG1pbGxpc2VjLCBUaW1lU2lnbmF0dXJlIHRpbWUpIHtcbiAgICAgICAgLyogR2V0IGFsbCB0aGUgc3RhcnR0aW1lcyBpbiBhbGwgdHJhY2tzLCBpbiBzb3J0ZWQgb3JkZXIgKi9cbiAgICAgICAgTGlzdDxpbnQ+IHN0YXJ0dGltZXMgPSBuZXcgTGlzdDxpbnQ+KCk7XG4gICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpIHtcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG5vdGUgaW4gdHJhY2suTm90ZXMpIHtcbiAgICAgICAgICAgICAgICBzdGFydHRpbWVzLkFkZCggbm90ZS5TdGFydFRpbWUgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzdGFydHRpbWVzLlNvcnQoKTtcblxuICAgICAgICAvKiBOb3RlcyB3aXRoaW4gXCJtaWxsaXNlY1wiIG1pbGxpc2Vjb25kcyBhcGFydCB3aWxsIGJlIGNvbWJpbmVkLiAqL1xuICAgICAgICBpbnQgaW50ZXJ2YWwgPSB0aW1lLlF1YXJ0ZXIgKiBtaWxsaXNlYyAqIDEwMDAgLyB0aW1lLlRlbXBvO1xuXG4gICAgICAgIC8qIElmIHR3byBzdGFydHRpbWVzIGFyZSB3aXRoaW4gaW50ZXJ2YWwgbWlsbGlzZWMsIG1ha2UgdGhlbSB0aGUgc2FtZSAqL1xuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHN0YXJ0dGltZXMuQ291bnQgLSAxOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChzdGFydHRpbWVzW2krMV0gLSBzdGFydHRpbWVzW2ldIDw9IGludGVydmFsKSB7XG4gICAgICAgICAgICAgICAgc3RhcnR0aW1lc1tpKzFdID0gc3RhcnR0aW1lc1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIENoZWNrU3RhcnRUaW1lcyh0cmFja3MpO1xuXG4gICAgICAgIC8qIEFkanVzdCB0aGUgbm90ZSBzdGFydHRpbWVzLCBzbyB0aGF0IGl0IG1hdGNoZXMgb25lIG9mIHRoZSBzdGFydHRpbWVzIHZhbHVlcyAqL1xuICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKSB7XG4gICAgICAgICAgICBpbnQgaSA9IDA7XG5cbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG5vdGUgaW4gdHJhY2suTm90ZXMpIHtcbiAgICAgICAgICAgICAgICB3aGlsZSAoaSA8IHN0YXJ0dGltZXMuQ291bnQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgbm90ZS5TdGFydFRpbWUgLSBpbnRlcnZhbCA+IHN0YXJ0dGltZXNbaV0pIHtcbiAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChub3RlLlN0YXJ0VGltZSA+IHN0YXJ0dGltZXNbaV0gJiZcbiAgICAgICAgICAgICAgICAgICAgbm90ZS5TdGFydFRpbWUgLSBzdGFydHRpbWVzW2ldIDw9IGludGVydmFsKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgbm90ZS5TdGFydFRpbWUgPSBzdGFydHRpbWVzW2ldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyYWNrLk5vdGVzLlNvcnQodHJhY2suTm90ZXNbMF0pO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKiogV2Ugd2FudCBub3RlIGR1cmF0aW9ucyB0byBzcGFuIHVwIHRvIHRoZSBuZXh0IG5vdGUgaW4gZ2VuZXJhbC5cbiAgICAgKiBUaGUgc2hlZXQgbXVzaWMgbG9va3MgbmljZXIgdGhhdCB3YXkuICBJbiBjb250cmFzdCwgc2hlZXQgbXVzaWNcbiAgICAgKiB3aXRoIGxvdHMgb2YgMTZ0aC8zMm5kIG5vdGVzIHNlcGFyYXRlZCBieSBzbWFsbCByZXN0cyBkb2Vzbid0XG4gICAgICogbG9vayBhcyBuaWNlLiAgSGF2aW5nIG5pY2UgbG9va2luZyBzaGVldCBtdXNpYyBpcyBtb3JlIGltcG9ydGFudFxuICAgICAqIHRoYW4gZmFpdGhmdWxseSByZXByZXNlbnRpbmcgdGhlIE1pZGkgRmlsZSBkYXRhLlxuICAgICAqXG4gICAgICogVGhlcmVmb3JlLCB0aGlzIGZ1bmN0aW9uIHJvdW5kcyB0aGUgZHVyYXRpb24gb2YgTWlkaU5vdGVzIHVwIHRvXG4gICAgICogdGhlIG5leHQgbm90ZSB3aGVyZSBwb3NzaWJsZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHZvaWRcbiAgICBSb3VuZER1cmF0aW9ucyhMaXN0PE1pZGlUcmFjaz4gdHJhY2tzLCBpbnQgcXVhcnRlcm5vdGUpIHtcblxuICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzICkge1xuICAgICAgICAgICAgTWlkaU5vdGUgcHJldk5vdGUgPSBudWxsO1xuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCB0cmFjay5Ob3Rlcy5Db3VudC0xOyBpKyspIHtcbiAgICAgICAgICAgICAgICBNaWRpTm90ZSBub3RlMSA9IHRyYWNrLk5vdGVzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChwcmV2Tm90ZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHByZXZOb3RlID0gbm90ZTE7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLyogR2V0IHRoZSBuZXh0IG5vdGUgdGhhdCBoYXMgYSBkaWZmZXJlbnQgc3RhcnQgdGltZSAqL1xuICAgICAgICAgICAgICAgIE1pZGlOb3RlIG5vdGUyID0gbm90ZTE7XG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaiA9IGkrMTsgaiA8IHRyYWNrLk5vdGVzLkNvdW50OyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgbm90ZTIgPSB0cmFjay5Ob3Rlc1tqXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vdGUxLlN0YXJ0VGltZSA8IG5vdGUyLlN0YXJ0VGltZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaW50IG1heGR1cmF0aW9uID0gbm90ZTIuU3RhcnRUaW1lIC0gbm90ZTEuU3RhcnRUaW1lO1xuXG4gICAgICAgICAgICAgICAgaW50IGR1ciA9IDA7XG4gICAgICAgICAgICAgICAgaWYgKHF1YXJ0ZXJub3RlIDw9IG1heGR1cmF0aW9uKVxuICAgICAgICAgICAgICAgICAgICBkdXIgPSBxdWFydGVybm90ZTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChxdWFydGVybm90ZS8yIDw9IG1heGR1cmF0aW9uKVxuICAgICAgICAgICAgICAgICAgICBkdXIgPSBxdWFydGVybm90ZS8yO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHF1YXJ0ZXJub3RlLzMgPD0gbWF4ZHVyYXRpb24pXG4gICAgICAgICAgICAgICAgICAgIGR1ciA9IHF1YXJ0ZXJub3RlLzM7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocXVhcnRlcm5vdGUvNCA8PSBtYXhkdXJhdGlvbilcbiAgICAgICAgICAgICAgICAgICAgZHVyID0gcXVhcnRlcm5vdGUvNDtcblxuXG4gICAgICAgICAgICAgICAgaWYgKGR1ciA8IG5vdGUxLkR1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGR1ciA9IG5vdGUxLkR1cmF0aW9uO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8qIFNwZWNpYWwgY2FzZTogSWYgdGhlIHByZXZpb3VzIG5vdGUncyBkdXJhdGlvblxuICAgICAgICAgICAgICAgICAqIG1hdGNoZXMgdGhpcyBub3RlJ3MgZHVyYXRpb24sIHdlIGNhbiBtYWtlIGEgbm90ZXBhaXIuXG4gICAgICAgICAgICAgICAgICogU28gZG9uJ3QgZXhwYW5kIHRoZSBkdXJhdGlvbiBpbiB0aGF0IGNhc2UuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKChwcmV2Tm90ZS5TdGFydFRpbWUgKyBwcmV2Tm90ZS5EdXJhdGlvbiA9PSBub3RlMS5TdGFydFRpbWUpICYmXG4gICAgICAgICAgICAgICAgICAgIChwcmV2Tm90ZS5EdXJhdGlvbiA9PSBub3RlMS5EdXJhdGlvbikpIHtcblxuICAgICAgICAgICAgICAgICAgICBkdXIgPSBub3RlMS5EdXJhdGlvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbm90ZTEuRHVyYXRpb24gPSBkdXI7XG4gICAgICAgICAgICAgICAgaWYgKHRyYWNrLk5vdGVzW2krMV0uU3RhcnRUaW1lICE9IG5vdGUxLlN0YXJ0VGltZSkge1xuICAgICAgICAgICAgICAgICAgICBwcmV2Tm90ZSA9IG5vdGUxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBTcGxpdCB0aGUgZ2l2ZW4gdHJhY2sgaW50byBtdWx0aXBsZSB0cmFja3MsIHNlcGFyYXRpbmcgZWFjaFxuICAgICAqIGNoYW5uZWwgaW50byBhIHNlcGFyYXRlIHRyYWNrLlxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIExpc3Q8TWlkaVRyYWNrPiBcbiAgICBTcGxpdENoYW5uZWxzKE1pZGlUcmFjayBvcmlndHJhY2ssIExpc3Q8TWlkaUV2ZW50PiBldmVudHMpIHtcblxuICAgICAgICAvKiBGaW5kIHRoZSBpbnN0cnVtZW50IHVzZWQgZm9yIGVhY2ggY2hhbm5lbCAqL1xuICAgICAgICBpbnRbXSBjaGFubmVsSW5zdHJ1bWVudHMgPSBuZXcgaW50WzE2XTtcbiAgICAgICAgZm9yZWFjaCAoTWlkaUV2ZW50IG1ldmVudCBpbiBldmVudHMpIHtcbiAgICAgICAgICAgIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IEV2ZW50UHJvZ3JhbUNoYW5nZSkge1xuICAgICAgICAgICAgICAgIGNoYW5uZWxJbnN0cnVtZW50c1ttZXZlbnQuQ2hhbm5lbF0gPSBtZXZlbnQuSW5zdHJ1bWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjaGFubmVsSW5zdHJ1bWVudHNbOV0gPSAxMjg7IC8qIENoYW5uZWwgOSA9IFBlcmN1c3Npb24gKi9cblxuICAgICAgICBMaXN0PE1pZGlUcmFjaz4gcmVzdWx0ID0gbmV3IExpc3Q8TWlkaVRyYWNrPigpO1xuICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIG9yaWd0cmFjay5Ob3Rlcykge1xuICAgICAgICAgICAgYm9vbCBmb3VuZGNoYW5uZWwgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBpZiAobm90ZS5DaGFubmVsID09IHRyYWNrLk5vdGVzWzBdLkNoYW5uZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgZm91bmRjaGFubmVsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdHJhY2suQWRkTm90ZShub3RlKTsgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFmb3VuZGNoYW5uZWwpIHtcbiAgICAgICAgICAgICAgICBNaWRpVHJhY2sgdHJhY2sgPSBuZXcgTWlkaVRyYWNrKHJlc3VsdC5Db3VudCArIDEpO1xuICAgICAgICAgICAgICAgIHRyYWNrLkFkZE5vdGUobm90ZSk7XG4gICAgICAgICAgICAgICAgdHJhY2suSW5zdHJ1bWVudCA9IGNoYW5uZWxJbnN0cnVtZW50c1tub3RlLkNoYW5uZWxdO1xuICAgICAgICAgICAgICAgIHJlc3VsdC5BZGQodHJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChvcmlndHJhY2suTHlyaWNzICE9IG51bGwpIHtcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBseXJpY0V2ZW50IGluIG9yaWd0cmFjay5MeXJpY3MpIHtcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChseXJpY0V2ZW50LkNoYW5uZWwgPT0gdHJhY2suTm90ZXNbMF0uQ2hhbm5lbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhY2suQWRkTHlyaWMobHlyaWNFdmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cblxuICAgIC8qKiBHdWVzcyB0aGUgbWVhc3VyZSBsZW5ndGguICBXZSBhc3N1bWUgdGhhdCB0aGUgbWVhc3VyZVxuICAgICAqIGxlbmd0aCBtdXN0IGJlIGJldHdlZW4gMC41IHNlY29uZHMgYW5kIDQgc2Vjb25kcy5cbiAgICAgKiBUYWtlIGFsbCB0aGUgbm90ZSBzdGFydCB0aW1lcyB0aGF0IGZhbGwgYmV0d2VlbiAwLjUgYW5kIFxuICAgICAqIDQgc2Vjb25kcywgYW5kIHJldHVybiB0aGUgc3RhcnR0aW1lcy5cbiAgICAgKi9cbiAgICBwdWJsaWMgTGlzdDxpbnQ+IFxuICAgIEd1ZXNzTWVhc3VyZUxlbmd0aCgpIHtcbiAgICAgICAgTGlzdDxpbnQ+IHJlc3VsdCA9IG5ldyBMaXN0PGludD4oKTtcblxuICAgICAgICBpbnQgcHVsc2VzX3Blcl9zZWNvbmQgPSAoaW50KSAoMTAwMDAwMC4wIC8gdGltZXNpZy5UZW1wbyAqIHRpbWVzaWcuUXVhcnRlcik7XG4gICAgICAgIGludCBtaW5tZWFzdXJlID0gcHVsc2VzX3Blcl9zZWNvbmQgLyAyOyAgLyogVGhlIG1pbmltdW0gbWVhc3VyZSBsZW5ndGggaW4gcHVsc2VzICovXG4gICAgICAgIGludCBtYXhtZWFzdXJlID0gcHVsc2VzX3Blcl9zZWNvbmQgKiA0OyAgLyogVGhlIG1heGltdW0gbWVhc3VyZSBsZW5ndGggaW4gcHVsc2VzICovXG5cbiAgICAgICAgLyogR2V0IHRoZSBzdGFydCB0aW1lIG9mIHRoZSBmaXJzdCBub3RlIGluIHRoZSBtaWRpIGZpbGUuICovXG4gICAgICAgIGludCBmaXJzdG5vdGUgPSB0aW1lc2lnLk1lYXN1cmUgKiA1O1xuICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKSB7XG4gICAgICAgICAgICBpZiAoZmlyc3Rub3RlID4gdHJhY2suTm90ZXNbMF0uU3RhcnRUaW1lKSB7XG4gICAgICAgICAgICAgICAgZmlyc3Rub3RlID0gdHJhY2suTm90ZXNbMF0uU3RhcnRUaW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyogaW50ZXJ2YWwgPSAwLjA2IHNlY29uZHMsIGNvbnZlcnRlZCBpbnRvIHB1bHNlcyAqL1xuICAgICAgICBpbnQgaW50ZXJ2YWwgPSB0aW1lc2lnLlF1YXJ0ZXIgKiA2MDAwMCAvIHRpbWVzaWcuVGVtcG87XG5cbiAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcykge1xuICAgICAgICAgICAgaW50IHByZXZ0aW1lID0gMDtcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG5vdGUgaW4gdHJhY2suTm90ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAobm90ZS5TdGFydFRpbWUgLSBwcmV2dGltZSA8PSBpbnRlcnZhbClcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICBwcmV2dGltZSA9IG5vdGUuU3RhcnRUaW1lO1xuXG4gICAgICAgICAgICAgICAgaW50IHRpbWVfZnJvbV9maXJzdG5vdGUgPSBub3RlLlN0YXJ0VGltZSAtIGZpcnN0bm90ZTtcblxuICAgICAgICAgICAgICAgIC8qIFJvdW5kIHRoZSB0aW1lIGRvd24gdG8gYSBtdWx0aXBsZSBvZiA0ICovXG4gICAgICAgICAgICAgICAgdGltZV9mcm9tX2ZpcnN0bm90ZSA9IHRpbWVfZnJvbV9maXJzdG5vdGUgLyA0ICogNDtcbiAgICAgICAgICAgICAgICBpZiAodGltZV9mcm9tX2ZpcnN0bm90ZSA8IG1pbm1lYXN1cmUpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGlmICh0aW1lX2Zyb21fZmlyc3Rub3RlID4gbWF4bWVhc3VyZSlcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdC5Db250YWlucyh0aW1lX2Zyb21fZmlyc3Rub3RlKSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQuQWRkKHRpbWVfZnJvbV9maXJzdG5vdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXN1bHQuU29ydCgpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIGxhc3Qgc3RhcnQgdGltZSAqL1xuICAgIHB1YmxpYyBpbnQgRW5kVGltZSgpIHtcbiAgICAgICAgaW50IGxhc3RTdGFydCA9IDA7XG4gICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpIHtcbiAgICAgICAgICAgIGlmICh0cmFjay5Ob3Rlcy5Db3VudCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbnQgbGFzdCA9IHRyYWNrLk5vdGVzWyB0cmFjay5Ob3Rlcy5Db3VudC0xIF0uU3RhcnRUaW1lO1xuICAgICAgICAgICAgbGFzdFN0YXJ0ID0gTWF0aC5NYXgobGFzdCwgbGFzdFN0YXJ0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGFzdFN0YXJ0O1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGlzIG1pZGkgZmlsZSBoYXMgbHlyaWNzICovXG4gICAgcHVibGljIGJvb2wgSGFzTHlyaWNzKCkge1xuICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKSB7XG4gICAgICAgICAgICBpZiAodHJhY2suTHlyaWNzICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgc3RyaW5nIHJlc3VsdCA9IFwiTWlkaSBGaWxlIHRyYWNrcz1cIiArIHRyYWNrcy5Db3VudCArIFwiIHF1YXJ0ZXI9XCIgKyBxdWFydGVybm90ZSArIFwiXFxuXCI7XG4gICAgICAgIHJlc3VsdCArPSBUaW1lLlRvU3RyaW5nKCkgKyBcIlxcblwiO1xuICAgICAgICBmb3JlYWNoKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSB0cmFjay5Ub1N0cmluZygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyogQ29tbWFuZC1saW5lIHByb2dyYW0gdG8gcHJpbnQgb3V0IGEgcGFyc2VkIE1pZGkgZmlsZS4gVXNlZCBmb3IgZGVidWdnaW5nLlxuICAgICAqIFRvIHJ1bjpcbiAgICAgKiAtIENoYW5nZSBNYWluMiB0byBNYWluXG4gICAgICogLSBjc2MgTWlkaU5vdGUuY3MgTWlkaUV2ZW50LmNzIE1pZGlUcmFjay5jcyBNaWRpRmlsZVJlYWRlci5jcyBNaWRpT3B0aW9ucy5jc1xuICAgICAqICAgTWlkaUZpbGUuY3MgTWlkaUZpbGVFeGNlcHRpb24uY3MgVGltZVNpZ25hdHVyZS5jcyBDb25maWdJTkkuY3NcbiAgICAgKiAtIE1pZGlGaWxlLmV4ZSBmaWxlLm1pZFxuICAgICAqXG4gICAgICovXG4gICAgLy9wdWJsaWMgc3RhdGljIHZvaWQgTWFpbjIoc3RyaW5nW10gYXJnKSB7XG4gICAgLy8gICAgaWYgKGFyZy5MZW5ndGggPT0gMCkge1xuICAgIC8vICAgICAgICBDb25zb2xlLldyaXRlTGluZShcIlVzYWdlOiBNaWRpRmlsZSA8ZmlsZW5hbWU+XCIpO1xuICAgIC8vICAgICAgICByZXR1cm47XG4gICAgLy8gICAgfVxuXG4gICAgLy8gICAgTWlkaUZpbGUgZiA9IG5ldyBNaWRpRmlsZShhcmdbMF0pO1xuICAgIC8vICAgIENvbnNvbGUuV3JpdGUoZi5Ub1N0cmluZygpKTtcbiAgICAvL31cblxufSAgLyogRW5kIGNsYXNzIE1pZGlGaWxlICovXG5cblxufSAgLyogRW5kIG5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyAqL1xuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTIgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIEBjbGFzcyBNaWRpRmlsZUV4Y2VwdGlvblxuICogQSBNaWRpRmlsZUV4Y2VwdGlvbiBpcyB0aHJvd24gd2hlbiBhbiBlcnJvciBvY2N1cnNcbiAqIHdoaWxlIHBhcnNpbmcgdGhlIE1pZGkgRmlsZS4gIFRoZSBjb25zdHJ1Y3RvciB0YWtlc1xuICogdGhlIGZpbGUgb2Zmc2V0IChpbiBieXRlcykgd2hlcmUgdGhlIGVycm9yIG9jY3VycmVkLFxuICogYW5kIGEgc3RyaW5nIGRlc2NyaWJpbmcgdGhlIGVycm9yLlxuICovXG5wdWJsaWMgY2xhc3MgTWlkaUZpbGVFeGNlcHRpb24gOiBTeXN0ZW0uRXhjZXB0aW9uIHtcbiAgICBwdWJsaWMgTWlkaUZpbGVFeGNlcHRpb24gKHN0cmluZyBzLCBpbnQgb2Zmc2V0KSA6XG4gICAgICAgIGJhc2UocyArIFwiIGF0IG9mZnNldCBcIiArIG9mZnNldCkge1xuICAgIH1cbn1cblxufVxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTIgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuXG4vKiogQGNsYXNzIE1pZGlGaWxlUmVhZGVyXG4gKiBUaGUgTWlkaUZpbGVSZWFkZXIgaXMgdXNlZCB0byByZWFkIGxvdy1sZXZlbCBiaW5hcnkgZGF0YSBmcm9tIGEgZmlsZS5cbiAqIFRoaXMgY2xhc3MgY2FuIGRvIHRoZSBmb2xsb3dpbmc6XG4gKlxuICogLSBQZWVrIGF0IHRoZSBuZXh0IGJ5dGUgaW4gdGhlIGZpbGUuXG4gKiAtIFJlYWQgYSBieXRlXG4gKiAtIFJlYWQgYSAxNi1iaXQgYmlnIGVuZGlhbiBzaG9ydFxuICogLSBSZWFkIGEgMzItYml0IGJpZyBlbmRpYW4gaW50XG4gKiAtIFJlYWQgYSBmaXhlZCBsZW5ndGggYXNjaWkgc3RyaW5nIChub3QgbnVsbCB0ZXJtaW5hdGVkKVxuICogLSBSZWFkIGEgXCJ2YXJpYWJsZSBsZW5ndGhcIiBpbnRlZ2VyLiAgVGhlIGZvcm1hdCBvZiB0aGUgdmFyaWFibGUgbGVuZ3RoXG4gKiAgIGludCBpcyBkZXNjcmliZWQgYXQgdGhlIHRvcCBvZiB0aGlzIGZpbGUuXG4gKiAtIFNraXAgYWhlYWQgYSBnaXZlbiBudW1iZXIgb2YgYnl0ZXNcbiAqIC0gUmV0dXJuIHRoZSBjdXJyZW50IG9mZnNldC5cbiAqL1xuXG5wdWJsaWMgY2xhc3MgTWlkaUZpbGVSZWFkZXIge1xuICAgIHByaXZhdGUgYnl0ZVtdIGRhdGE7ICAgICAgIC8qKiBUaGUgZW50aXJlIG1pZGkgZmlsZSBkYXRhICovXG4gICAgcHJpdmF0ZSBpbnQgcGFyc2Vfb2Zmc2V0OyAgLyoqIFRoZSBjdXJyZW50IG9mZnNldCB3aGlsZSBwYXJzaW5nICovXG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IE1pZGlGaWxlUmVhZGVyIGZvciB0aGUgZ2l2ZW4gZmlsZW5hbWUgKi9cbiAgICAvL3B1YmxpYyBNaWRpRmlsZVJlYWRlcihzdHJpbmcgZmlsZW5hbWUpIHtcbiAgICAvLyAgICBGaWxlSW5mbyBpbmZvID0gbmV3IEZpbGVJbmZvKGZpbGVuYW1lKTtcbiAgICAvLyAgICBpZiAoIWluZm8uRXhpc3RzKSB7XG4gICAgLy8gICAgICAgIHRocm93IG5ldyBNaWRpRmlsZUV4Y2VwdGlvbihcIkZpbGUgXCIgKyBmaWxlbmFtZSArIFwiIGRvZXMgbm90IGV4aXN0XCIsIDApO1xuICAgIC8vICAgIH1cbiAgICAvLyAgICBpZiAoaW5mby5MZW5ndGggPT0gMCkge1xuICAgIC8vICAgICAgICB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXCJGaWxlIFwiICsgZmlsZW5hbWUgKyBcIiBpcyBlbXB0eSAoMCBieXRlcylcIiwgMCk7XG4gICAgLy8gICAgfVxuICAgIC8vICAgIEZpbGVTdHJlYW0gZmlsZSA9IEZpbGUuT3BlbihmaWxlbmFtZSwgRmlsZU1vZGUuT3BlbiwgXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEZpbGVBY2Nlc3MuUmVhZCwgRmlsZVNoYXJlLlJlYWQpO1xuXG4gICAgLy8gICAgLyogUmVhZCB0aGUgZW50aXJlIGZpbGUgaW50byBtZW1vcnkgKi9cbiAgICAvLyAgICBkYXRhID0gbmV3IGJ5dGVbIGluZm8uTGVuZ3RoIF07XG4gICAgLy8gICAgaW50IG9mZnNldCA9IDA7XG4gICAgLy8gICAgaW50IGxlbiA9IChpbnQpaW5mby5MZW5ndGg7XG4gICAgLy8gICAgd2hpbGUgKHRydWUpIHtcbiAgICAvLyAgICAgICAgaWYgKG9mZnNldCA9PSBpbmZvLkxlbmd0aClcbiAgICAvLyAgICAgICAgICAgIGJyZWFrO1xuICAgIC8vICAgICAgICBpbnQgbiA9IGZpbGUuUmVhZChkYXRhLCBvZmZzZXQsIChpbnQpKGluZm8uTGVuZ3RoIC0gb2Zmc2V0KSk7XG4gICAgLy8gICAgICAgIGlmIChuIDw9IDApXG4gICAgLy8gICAgICAgICAgICBicmVhaztcbiAgICAvLyAgICAgICAgb2Zmc2V0ICs9IG47XG4gICAgLy8gICAgfVxuICAgIC8vICAgIHBhcnNlX29mZnNldCA9IDA7XG4gICAgLy8gICAgZmlsZS5DbG9zZSgpO1xuICAgIC8vfVxuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBNaWRpRmlsZVJlYWRlciBmcm9tIHRoZSBnaXZlbiBkYXRhICovXG4gICAgcHVibGljIE1pZGlGaWxlUmVhZGVyKGJ5dGVbXSBieXRlcykge1xuICAgICAgICBkYXRhID0gYnl0ZXM7XG4gICAgICAgIHBhcnNlX29mZnNldCA9IDA7XG4gICAgfVxuXG4gICAgLyoqIENoZWNrIHRoYXQgdGhlIGdpdmVuIG51bWJlciBvZiBieXRlcyBkb2Vzbid0IGV4Y2VlZCB0aGUgZmlsZSBzaXplICovXG4gICAgcHJpdmF0ZSB2b2lkIGNoZWNrUmVhZChpbnQgYW1vdW50KSB7XG4gICAgICAgIGlmIChwYXJzZV9vZmZzZXQgKyBhbW91bnQgPiBkYXRhLkxlbmd0aCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IE1pZGlGaWxlRXhjZXB0aW9uKFwiRmlsZSBpcyB0cnVuY2F0ZWRcIiwgcGFyc2Vfb2Zmc2V0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBSZWFkIHRoZSBuZXh0IGJ5dGUgaW4gdGhlIGZpbGUsIGJ1dCBkb24ndCBpbmNyZW1lbnQgdGhlIHBhcnNlIG9mZnNldCAqL1xuICAgIHB1YmxpYyBieXRlIFBlZWsoKSB7XG4gICAgICAgIGNoZWNrUmVhZCgxKTtcbiAgICAgICAgcmV0dXJuIGRhdGFbcGFyc2Vfb2Zmc2V0XTtcbiAgICB9XG5cbiAgICAvKiogUmVhZCBhIGJ5dGUgZnJvbSB0aGUgZmlsZSAqL1xuICAgIHB1YmxpYyBieXRlIFJlYWRCeXRlKCkgeyBcbiAgICAgICAgY2hlY2tSZWFkKDEpO1xuICAgICAgICBieXRlIHggPSBkYXRhW3BhcnNlX29mZnNldF07XG4gICAgICAgIHBhcnNlX29mZnNldCsrO1xuICAgICAgICByZXR1cm4geDtcbiAgICB9XG5cbiAgICAvKiogUmVhZCB0aGUgZ2l2ZW4gbnVtYmVyIG9mIGJ5dGVzIGZyb20gdGhlIGZpbGUgKi9cbiAgICBwdWJsaWMgYnl0ZVtdIFJlYWRCeXRlcyhpbnQgYW1vdW50KSB7XG4gICAgICAgIGNoZWNrUmVhZChhbW91bnQpO1xuICAgICAgICBieXRlW10gcmVzdWx0ID0gbmV3IGJ5dGVbYW1vdW50XTtcbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBhbW91bnQ7IGkrKykge1xuICAgICAgICAgICAgcmVzdWx0W2ldID0gZGF0YVtpICsgcGFyc2Vfb2Zmc2V0XTtcbiAgICAgICAgfVxuICAgICAgICBwYXJzZV9vZmZzZXQgKz0gYW1vdW50O1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKiBSZWFkIGEgMTYtYml0IHNob3J0IGZyb20gdGhlIGZpbGUgKi9cbiAgICBwdWJsaWMgdXNob3J0IFJlYWRTaG9ydCgpIHtcbiAgICAgICAgY2hlY2tSZWFkKDIpO1xuICAgICAgICB1c2hvcnQgeCA9ICh1c2hvcnQpICggKGRhdGFbcGFyc2Vfb2Zmc2V0XSA8PCA4KSB8IGRhdGFbcGFyc2Vfb2Zmc2V0KzFdICk7XG4gICAgICAgIHBhcnNlX29mZnNldCArPSAyO1xuICAgICAgICByZXR1cm4geDtcbiAgICB9XG5cbiAgICAvKiogUmVhZCBhIDMyLWJpdCBpbnQgZnJvbSB0aGUgZmlsZSAqL1xuICAgIHB1YmxpYyBpbnQgUmVhZEludCgpIHtcbiAgICAgICAgY2hlY2tSZWFkKDQpO1xuICAgICAgICBpbnQgeCA9IChpbnQpKCAoZGF0YVtwYXJzZV9vZmZzZXRdIDw8IDI0KSB8IChkYXRhW3BhcnNlX29mZnNldCsxXSA8PCAxNikgfFxuICAgICAgICAgICAgICAgICAgICAgICAoZGF0YVtwYXJzZV9vZmZzZXQrMl0gPDwgOCkgfCBkYXRhW3BhcnNlX29mZnNldCszXSApO1xuICAgICAgICBwYXJzZV9vZmZzZXQgKz0gNDtcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuXG4gICAgLyoqIFJlYWQgYW4gYXNjaWkgc3RyaW5nIHdpdGggdGhlIGdpdmVuIGxlbmd0aCAqL1xuICAgIHB1YmxpYyBzdHJpbmcgUmVhZEFzY2lpKGludCBsZW4pIHtcbiAgICAgICAgY2hlY2tSZWFkKGxlbik7XG4gICAgICAgIHN0cmluZyBzID0gQVNDSUlFbmNvZGluZy5BU0NJSS5HZXRTdHJpbmcoZGF0YSwgcGFyc2Vfb2Zmc2V0LCBsZW4pO1xuICAgICAgICBwYXJzZV9vZmZzZXQgKz0gbGVuO1xuICAgICAgICByZXR1cm4gcztcbiAgICB9XG5cbiAgICAvKiogUmVhZCBhIHZhcmlhYmxlLWxlbmd0aCBpbnRlZ2VyICgxIHRvIDQgYnl0ZXMpLiBUaGUgaW50ZWdlciBlbmRzXG4gICAgICogd2hlbiB5b3UgZW5jb3VudGVyIGEgYnl0ZSB0aGF0IGRvZXNuJ3QgaGF2ZSB0aGUgOHRoIGJpdCBzZXRcbiAgICAgKiAoYSBieXRlIGxlc3MgdGhhbiAweDgwKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgaW50IFJlYWRWYXJsZW4oKSB7XG4gICAgICAgIHVpbnQgcmVzdWx0ID0gMDtcbiAgICAgICAgYnl0ZSBiO1xuXG4gICAgICAgIGIgPSBSZWFkQnl0ZSgpO1xuICAgICAgICByZXN1bHQgPSAodWludCkoYiAmIDB4N2YpO1xuXG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoKGIgJiAweDgwKSAhPSAwKSB7XG4gICAgICAgICAgICAgICAgYiA9IFJlYWRCeXRlKCk7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gKHVpbnQpKCAocmVzdWx0IDw8IDcpICsgKGIgJiAweDdmKSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChpbnQpcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKiBTa2lwIG92ZXIgdGhlIGdpdmVuIG51bWJlciBvZiBieXRlcyAqLyBcbiAgICBwdWJsaWMgdm9pZCBTa2lwKGludCBhbW91bnQpIHtcbiAgICAgICAgY2hlY2tSZWFkKGFtb3VudCk7XG4gICAgICAgIHBhcnNlX29mZnNldCArPSBhbW91bnQ7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgY3VycmVudCBwYXJzZSBvZmZzZXQgKi9cbiAgICBwdWJsaWMgaW50IEdldE9mZnNldCgpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlX29mZnNldDtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSByYXcgbWlkaSBmaWxlIGJ5dGUgZGF0YSAqL1xuICAgIHB1YmxpYyBieXRlW10gR2V0RGF0YSgpIHtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxufVxuXG59IFxuXG4iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMiBNYWRoYXYgVmFpZHlhbmF0aGFuXHJcbiAqXHJcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxyXG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXHJcbiAqXHJcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcclxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXHJcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXHJcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxyXG4gKi9cclxuXHJcbnVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLklPO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcclxuXHJcbi8qKiBAY2xhc3MgTWlkaU5vdGVcclxuICogQSBNaWRpTm90ZSBjb250YWluc1xyXG4gKlxyXG4gKiBzdGFydHRpbWUgLSBUaGUgdGltZSAobWVhc3VyZWQgaW4gcHVsc2VzKSB3aGVuIHRoZSBub3RlIGlzIHByZXNzZWQuXHJcbiAqIGNoYW5uZWwgICAtIFRoZSBjaGFubmVsIHRoZSBub3RlIGlzIGZyb20uICBUaGlzIGlzIHVzZWQgd2hlbiBtYXRjaGluZ1xyXG4gKiAgICAgICAgICAgICBOb3RlT2ZmIGV2ZW50cyB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIE5vdGVPbiBldmVudC5cclxuICogICAgICAgICAgICAgVGhlIGNoYW5uZWxzIGZvciB0aGUgTm90ZU9uIGFuZCBOb3RlT2ZmIGV2ZW50cyBtdXN0IGJlXHJcbiAqICAgICAgICAgICAgIHRoZSBzYW1lLlxyXG4gKiBub3RlbnVtYmVyIC0gVGhlIG5vdGUgbnVtYmVyLCBmcm9tIDAgdG8gMTI3LiAgTWlkZGxlIEMgaXMgNjAuXHJcbiAqIGR1cmF0aW9uICAtIFRoZSB0aW1lIGR1cmF0aW9uIChtZWFzdXJlZCBpbiBwdWxzZXMpIGFmdGVyIHdoaWNoIHRoZSBcclxuICogICAgICAgICAgICAgbm90ZSBpcyByZWxlYXNlZC5cclxuICpcclxuICogQSBNaWRpTm90ZSBpcyBjcmVhdGVkIHdoZW4gd2UgZW5jb3VudGVyIGEgTm90ZU9mZiBldmVudC4gIFRoZSBkdXJhdGlvblxyXG4gKiBpcyBpbml0aWFsbHkgdW5rbm93biAoc2V0IHRvIDApLiAgV2hlbiB0aGUgY29ycmVzcG9uZGluZyBOb3RlT2ZmIGV2ZW50XHJcbiAqIGlzIGZvdW5kLCB0aGUgZHVyYXRpb24gaXMgc2V0IGJ5IHRoZSBtZXRob2QgTm90ZU9mZigpLlxyXG4gKi9cclxucHVibGljIGNsYXNzIE1pZGlOb3RlIDogSUNvbXBhcmVyPE1pZGlOb3RlPiB7XHJcbiAgICBwcml2YXRlIGludCBzdGFydHRpbWU7ICAgLyoqIFRoZSBzdGFydCB0aW1lLCBpbiBwdWxzZXMgKi9cclxuICAgIHByaXZhdGUgaW50IGNoYW5uZWw7ICAgICAvKiogVGhlIGNoYW5uZWwgKi9cclxuICAgIHByaXZhdGUgaW50IG5vdGVudW1iZXI7ICAvKiogVGhlIG5vdGUsIGZyb20gMCB0byAxMjcuIE1pZGRsZSBDIGlzIDYwICovXHJcbiAgICBwcml2YXRlIGludCBkdXJhdGlvbjsgICAgLyoqIFRoZSBkdXJhdGlvbiwgaW4gcHVsc2VzICovXHJcbiAgICBwcml2YXRlIGludCB2ZWxvY2l0eTtcclxuXHJcblxyXG4gICAgLyogQ3JlYXRlIGEgbmV3IE1pZGlOb3RlLiAgVGhpcyBpcyBjYWxsZWQgd2hlbiBhIE5vdGVPbiBldmVudCBpc1xyXG4gICAgICogZW5jb3VudGVyZWQgaW4gdGhlIE1pZGlGaWxlLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgTWlkaU5vdGUoaW50IHN0YXJ0dGltZSwgaW50IGNoYW5uZWwsIGludCBub3RlbnVtYmVyLCBpbnQgZHVyYXRpb24sIGludCB2ZWxvY2l0eSkge1xyXG4gICAgICAgIHRoaXMuc3RhcnR0aW1lID0gc3RhcnR0aW1lO1xyXG4gICAgICAgIHRoaXMuY2hhbm5lbCA9IGNoYW5uZWw7XHJcbiAgICAgICAgdGhpcy5ub3RlbnVtYmVyID0gbm90ZW51bWJlcjtcclxuICAgICAgICB0aGlzLmR1cmF0aW9uID0gZHVyYXRpb247XHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IHZlbG9jaXR5O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwdWJsaWMgaW50IFN0YXJ0VGltZSB7XHJcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHN0YXJ0dGltZTsgfVxyXG4gICAgICAgIHNldCB7IHN0YXJ0dGltZSA9IHZhbHVlOyB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGludCBFbmRUaW1lIHtcclxuICAgICAgICBnZXQgeyByZXR1cm4gc3RhcnR0aW1lICsgZHVyYXRpb247IH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW50IENoYW5uZWwge1xyXG4gICAgICAgIGdldCB7IHJldHVybiBjaGFubmVsOyB9XHJcbiAgICAgICAgc2V0IHsgY2hhbm5lbCA9IHZhbHVlOyB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGludCBOdW1iZXIge1xyXG4gICAgICAgIGdldCB7IHJldHVybiBub3RlbnVtYmVyOyB9XHJcbiAgICAgICAgc2V0IHsgbm90ZW51bWJlciA9IHZhbHVlOyB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGludCBEdXJhdGlvbiB7XHJcbiAgICAgICAgZ2V0IHsgcmV0dXJuIGR1cmF0aW9uOyB9XHJcbiAgICAgICAgc2V0IHsgZHVyYXRpb24gPSB2YWx1ZTsgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgaW50IFZlbG9jaXR5XHJcbiAgICB7XHJcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHZlbG9jaXR5OyB9XHJcbiAgICAgICAgc2V0IHsgdmVsb2NpdHkgPSB2YWx1ZTsgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qIEEgTm90ZU9mZiBldmVudCBvY2N1cnMgZm9yIHRoaXMgbm90ZSBhdCB0aGUgZ2l2ZW4gdGltZS5cclxuICAgICAqIENhbGN1bGF0ZSB0aGUgbm90ZSBkdXJhdGlvbiBiYXNlZCBvbiB0aGUgbm90ZW9mZiBldmVudC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHZvaWQgTm90ZU9mZihpbnQgZW5kdGltZSkge1xyXG4gICAgICAgIGR1cmF0aW9uID0gZW5kdGltZSAtIHN0YXJ0dGltZTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogQ29tcGFyZSB0d28gTWlkaU5vdGVzIGJhc2VkIG9uIHRoZWlyIHN0YXJ0IHRpbWVzLlxyXG4gICAgICogIElmIHRoZSBzdGFydCB0aW1lcyBhcmUgZXF1YWwsIGNvbXBhcmUgYnkgdGhlaXIgbnVtYmVycy5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGludCBDb21wYXJlKE1pZGlOb3RlIHgsIE1pZGlOb3RlIHkpIHtcclxuICAgICAgICBpZiAoeC5TdGFydFRpbWUgPT0geS5TdGFydFRpbWUpXHJcbiAgICAgICAgICAgIHJldHVybiB4Lk51bWJlciAtIHkuTnVtYmVyO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgcmV0dXJuIHguU3RhcnRUaW1lIC0geS5TdGFydFRpbWU7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHB1YmxpYyBNaWRpTm90ZSBDbG9uZSgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IE1pZGlOb3RlKHN0YXJ0dGltZSwgY2hhbm5lbCwgbm90ZW51bWJlciwgZHVyYXRpb24sIHZlbG9jaXR5KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgXHJcbiAgICBzdHJpbmcgVG9TdHJpbmcoKSB7XHJcbiAgICAgICAgc3RyaW5nW10gc2NhbGUgPSB7IFwiQVwiLCBcIkEjXCIsIFwiQlwiLCBcIkNcIiwgXCJDI1wiLCBcIkRcIiwgXCJEI1wiLCBcIkVcIiwgXCJGXCIsIFwiRiNcIiwgXCJHXCIsIFwiRyNcIiB9O1xyXG4gICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiTWlkaU5vdGUgY2hhbm5lbD17MH0gbnVtYmVyPXsxfSB7Mn0gc3RhcnQ9ezN9IGR1cmF0aW9uPXs0fVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5uZWwsIG5vdGVudW1iZXIsIHNjYWxlWyhub3RlbnVtYmVyICsgMykgJSAxMl0sIHN0YXJ0dGltZSwgZHVyYXRpb24pO1xyXG5cclxuICAgIH1cclxuXHJcbn1cclxuXHJcblxyXG59ICAvKiBFbmQgbmFtZXNwYWNlIE1pZGlTaGVldE11c2ljICovXHJcblxyXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTMgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbi8qKiBAY2xhc3MgTWlkaU9wdGlvbnNcbiAqXG4gKiBUaGUgTWlkaU9wdGlvbnMgY2xhc3MgY29udGFpbnMgdGhlIGF2YWlsYWJsZSBvcHRpb25zIGZvclxuICogbW9kaWZ5aW5nIHRoZSBzaGVldCBtdXNpYyBhbmQgc291bmQuICBUaGVzZSBvcHRpb25zIGFyZVxuICogY29sbGVjdGVkIGZyb20gdGhlIG1lbnUvZGlhbG9nIHNldHRpbmdzLCBhbmQgdGhlbiBhcmUgcGFzc2VkXG4gKiB0byB0aGUgU2hlZXRNdXNpYyBhbmQgTWlkaVBsYXllciBjbGFzc2VzLlxuICovXG5wdWJsaWMgY2xhc3MgTWlkaU9wdGlvbnMge1xuXG4gICAgLy8gVGhlIHBvc3NpYmxlIHZhbHVlcyBmb3Igc2hvd05vdGVMZXR0ZXJzXG4gICAgcHVibGljIGNvbnN0IGludCBOb3RlTmFtZU5vbmUgICAgICAgICAgID0gMDtcbiAgICBwdWJsaWMgY29uc3QgaW50IE5vdGVOYW1lTGV0dGVyICAgICAgICAgPSAxO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTm90ZU5hbWVGaXhlZERvUmVNaSAgICA9IDI7XG4gICAgcHVibGljIGNvbnN0IGludCBOb3RlTmFtZU1vdmFibGVEb1JlTWkgID0gMztcbiAgICBwdWJsaWMgY29uc3QgaW50IE5vdGVOYW1lRml4ZWROdW1iZXIgICAgPSA0O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTm90ZU5hbWVNb3ZhYmxlTnVtYmVyICA9IDU7XG5cbiAgICAvLyBTaGVldCBNdXNpYyBPcHRpb25zXG4gICAgcHVibGljIHN0cmluZyBmaWxlbmFtZTsgICAgICAgLyoqIFRoZSBmdWxsIE1pZGkgZmlsZW5hbWUgKi9cbiAgICBwdWJsaWMgc3RyaW5nIHRpdGxlOyAgICAgICAgICAvKiogVGhlIE1pZGkgc29uZyB0aXRsZSAqL1xuICAgIHB1YmxpYyBib29sW10gdHJhY2tzOyAgICAgICAgIC8qKiBXaGljaCB0cmFja3MgdG8gZGlzcGxheSAodHJ1ZSA9IGRpc3BsYXkpICovXG4gICAgcHVibGljIGJvb2wgc2Nyb2xsVmVydDsgICAgICAgLyoqIFdoZXRoZXIgdG8gc2Nyb2xsIHZlcnRpY2FsbHkgb3IgaG9yaXpvbnRhbGx5ICovXG4gICAgcHVibGljIGJvb2wgbGFyZ2VOb3RlU2l6ZTsgICAgLyoqIERpc3BsYXkgbGFyZ2Ugb3Igc21hbGwgbm90ZSBzaXplcyAqL1xuICAgIHB1YmxpYyBib29sIHR3b1N0YWZmczsgICAgICAgIC8qKiBDb21iaW5lIHRyYWNrcyBpbnRvIHR3byBzdGFmZnMgPyAqL1xuICAgIHB1YmxpYyBpbnQgc2hvd05vdGVMZXR0ZXJzOyAgICAgLyoqIFNob3cgdGhlIG5hbWUgKEEsIEEjLCBldGMpIG5leHQgdG8gdGhlIG5vdGVzICovXG4gICAgcHVibGljIGJvb2wgc2hvd0x5cmljczsgICAgICAgLyoqIFNob3cgdGhlIGx5cmljcyB1bmRlciBlYWNoIG5vdGUgKi9cbiAgICBwdWJsaWMgYm9vbCBzaG93TWVhc3VyZXM7ICAgICAvKiogU2hvdyB0aGUgbWVhc3VyZSBudW1iZXJzIGZvciBlYWNoIHN0YWZmICovXG4gICAgcHVibGljIGludCBzaGlmdHRpbWU7ICAgICAgICAgLyoqIFNoaWZ0IG5vdGUgc3RhcnR0aW1lcyBieSB0aGUgZ2l2ZW4gYW1vdW50ICovXG4gICAgcHVibGljIGludCB0cmFuc3Bvc2U7ICAgICAgICAgLyoqIFNoaWZ0IG5vdGUga2V5IHVwL2Rvd24gYnkgZ2l2ZW4gYW1vdW50ICovXG4gICAgcHVibGljIGludCBrZXk7ICAgICAgICAgICAgICAgLyoqIFVzZSB0aGUgZ2l2ZW4gS2V5U2lnbmF0dXJlIChub3Rlc2NhbGUpICovXG4gICAgcHVibGljIFRpbWVTaWduYXR1cmUgdGltZTsgICAgLyoqIFVzZSB0aGUgZ2l2ZW4gdGltZSBzaWduYXR1cmUgKi9cbiAgICBwdWJsaWMgaW50IGNvbWJpbmVJbnRlcnZhbDsgICAvKiogQ29tYmluZSBub3RlcyB3aXRoaW4gZ2l2ZW4gdGltZSBpbnRlcnZhbCAobXNlYykgKi9cbiAgICBwdWJsaWMgQ29sb3JbXSBjb2xvcnM7ICAgICAgICAvKiogVGhlIG5vdGUgY29sb3JzIHRvIHVzZSAqL1xuICAgIHB1YmxpYyBDb2xvciBzaGFkZUNvbG9yOyAgICAgIC8qKiBUaGUgY29sb3IgdG8gdXNlIGZvciBzaGFkaW5nLiAqL1xuICAgIHB1YmxpYyBDb2xvciBzaGFkZTJDb2xvcjsgICAgIC8qKiBUaGUgY29sb3IgdG8gdXNlIGZvciBzaGFkaW5nIHRoZSBsZWZ0IGhhbmQgcGlhbm8gKi9cblxuICAgIC8vIFNvdW5kIG9wdGlvbnNcbiAgICBwdWJsaWMgYm9vbCBbXW11dGU7ICAgICAgICAgICAgLyoqIFdoaWNoIHRyYWNrcyB0byBtdXRlICh0cnVlID0gbXV0ZSkgKi9cbiAgICBwdWJsaWMgaW50IHRlbXBvOyAgICAgICAgICAgICAgLyoqIFRoZSB0ZW1wbywgaW4gbWljcm9zZWNvbmRzIHBlciBxdWFydGVyIG5vdGUgKi9cbiAgICBwdWJsaWMgaW50IHBhdXNlVGltZTsgICAgICAgICAgLyoqIFN0YXJ0IHRoZSBtaWRpIG11c2ljIGF0IHRoZSBnaXZlbiBwYXVzZSB0aW1lICovXG4gICAgcHVibGljIGludFtdIGluc3RydW1lbnRzOyAgICAgIC8qKiBUaGUgaW5zdHJ1bWVudHMgdG8gdXNlIHBlciB0cmFjayAqL1xuICAgIHB1YmxpYyBib29sIHVzZURlZmF1bHRJbnN0cnVtZW50czsgIC8qKiBJZiB0cnVlLCBkb24ndCBjaGFuZ2UgaW5zdHJ1bWVudHMgKi9cbiAgICBwdWJsaWMgYm9vbCBwbGF5TWVhc3VyZXNJbkxvb3A7ICAgICAvKiogUGxheSB0aGUgc2VsZWN0ZWQgbWVhc3VyZXMgaW4gYSBsb29wICovXG4gICAgcHVibGljIGludCBwbGF5TWVhc3VyZXNJbkxvb3BTdGFydDsgLyoqIFN0YXJ0IG1lYXN1cmUgdG8gcGxheSBpbiBsb29wICovXG4gICAgcHVibGljIGludCBwbGF5TWVhc3VyZXNJbkxvb3BFbmQ7ICAgLyoqIEVuZCBtZWFzdXJlIHRvIHBsYXkgaW4gbG9vcCAqL1xuXG5cbiAgICBwdWJsaWMgTWlkaU9wdGlvbnMoKSB7XG4gICAgfVxuXG4gICAgcHVibGljIE1pZGlPcHRpb25zKE1pZGlGaWxlIG1pZGlmaWxlKSB7XG4gICAgICAgIGZpbGVuYW1lID0gbWlkaWZpbGUuRmlsZU5hbWU7XG4gICAgICAgIHRpdGxlID0gUGF0aC5HZXRGaWxlTmFtZShtaWRpZmlsZS5GaWxlTmFtZSk7XG4gICAgICAgIGludCBudW10cmFja3MgPSBtaWRpZmlsZS5UcmFja3MuQ291bnQ7XG4gICAgICAgIHRyYWNrcyA9IG5ldyBib29sW251bXRyYWNrc107XG4gICAgICAgIG11dGUgPSAgbmV3IGJvb2xbbnVtdHJhY2tzXTtcbiAgICAgICAgaW5zdHJ1bWVudHMgPSBuZXcgaW50W251bXRyYWNrc107XG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgdHJhY2tzLkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0cmFja3NbaV0gPSB0cnVlO1xuICAgICAgICAgICAgbXV0ZVtpXSA9IGZhbHNlO1xuICAgICAgICAgICAgaW5zdHJ1bWVudHNbaV0gPSBtaWRpZmlsZS5UcmFja3NbaV0uSW5zdHJ1bWVudDtcbiAgICAgICAgICAgIGlmIChtaWRpZmlsZS5UcmFja3NbaV0uSW5zdHJ1bWVudE5hbWUgPT0gXCJQZXJjdXNzaW9uXCIpIHtcbiAgICAgICAgICAgICAgICB0cmFja3NbaV0gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBtdXRlW2ldID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBcbiAgICAgICAgdXNlRGVmYXVsdEluc3RydW1lbnRzID0gdHJ1ZTtcbiAgICAgICAgc2Nyb2xsVmVydCA9IHRydWU7XG4gICAgICAgIGxhcmdlTm90ZVNpemUgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRyYWNrcy5MZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgdHdvU3RhZmZzID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHR3b1N0YWZmcyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHNob3dOb3RlTGV0dGVycyA9IE5vdGVOYW1lTm9uZTtcbiAgICAgICAgc2hvd0x5cmljcyA9IHRydWU7XG4gICAgICAgIHNob3dNZWFzdXJlcyA9IGZhbHNlO1xuICAgICAgICBzaGlmdHRpbWUgPSAwO1xuICAgICAgICB0cmFuc3Bvc2UgPSAwO1xuICAgICAgICBrZXkgPSAtMTtcbiAgICAgICAgdGltZSA9IG1pZGlmaWxlLlRpbWU7XG4gICAgICAgIGNvbG9ycyA9IG51bGw7XG4gICAgICAgIHNoYWRlQ29sb3IgPSBDb2xvci5Gcm9tQXJnYigxMDAsIDUzLCAxMjMsIDI1NSk7XG4gICAgICAgIHNoYWRlMkNvbG9yID0gQ29sb3IuRnJvbUFyZ2IoODAsIDEwMCwgMjUwKTtcbiAgICAgICAgY29tYmluZUludGVydmFsID0gNDA7XG4gICAgICAgIHRlbXBvID0gbWlkaWZpbGUuVGltZS5UZW1wbztcbiAgICAgICAgcGF1c2VUaW1lID0gMDtcbiAgICAgICAgcGxheU1lYXN1cmVzSW5Mb29wID0gZmFsc2U7IFxuICAgICAgICBwbGF5TWVhc3VyZXNJbkxvb3BTdGFydCA9IDA7XG4gICAgICAgIHBsYXlNZWFzdXJlc0luTG9vcEVuZCA9IG1pZGlmaWxlLkVuZFRpbWUoKSAvIG1pZGlmaWxlLlRpbWUuTWVhc3VyZTtcbiAgICB9XG5cbiAgICAvKiBKb2luIHRoZSBhcnJheSBpbnRvIGEgY29tbWEgc2VwYXJhdGVkIHN0cmluZyAqL1xuICAgIHN0YXRpYyBzdHJpbmcgSm9pbihib29sW10gdmFsdWVzKSB7XG4gICAgICAgIFN0cmluZ0J1aWxkZXIgcmVzdWx0ID0gbmV3IFN0cmluZ0J1aWxkZXIoKTtcbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCB2YWx1ZXMuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5BcHBlbmQoXCIsXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0LkFwcGVuZCh2YWx1ZXNbaV0uVG9TdHJpbmcoKSk7IFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQuVG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgc3RyaW5nIEpvaW4oaW50W10gdmFsdWVzKSB7XG4gICAgICAgIFN0cmluZ0J1aWxkZXIgcmVzdWx0ID0gbmV3IFN0cmluZ0J1aWxkZXIoKTtcbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCB2YWx1ZXMuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5BcHBlbmQoXCIsXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0LkFwcGVuZCh2YWx1ZXNbaV0uVG9TdHJpbmcoKSk7IFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQuVG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgc3RyaW5nIEpvaW4oQ29sb3JbXSB2YWx1ZXMpIHtcbiAgICAgICAgU3RyaW5nQnVpbGRlciByZXN1bHQgPSBuZXcgU3RyaW5nQnVpbGRlcigpO1xuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHZhbHVlcy5MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LkFwcGVuZChcIixcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHQuQXBwZW5kKENvbG9yVG9TdHJpbmcodmFsdWVzW2ldKSk7IFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQuVG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgc3RyaW5nIENvbG9yVG9TdHJpbmcoQ29sb3IgYykge1xuICAgICAgICByZXR1cm4gXCJcIiArIGMuUiArIFwiIFwiICsgYy5HICsgXCIgXCIgKyBjLkI7XG4gICAgfVxuXG4gICAgXG4gICAgLyogTWVyZ2UgaW4gdGhlIHNhdmVkIG9wdGlvbnMgdG8gdGhpcyBNaWRpT3B0aW9ucy4qL1xuICAgIHB1YmxpYyB2b2lkIE1lcmdlKE1pZGlPcHRpb25zIHNhdmVkKSB7XG4gICAgICAgIGlmIChzYXZlZC50cmFja3MgIT0gbnVsbCAmJiBzYXZlZC50cmFja3MuTGVuZ3RoID09IHRyYWNrcy5MZW5ndGgpIHtcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgdHJhY2tzLkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdHJhY2tzW2ldID0gc2F2ZWQudHJhY2tzW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChzYXZlZC5tdXRlICE9IG51bGwgJiYgc2F2ZWQubXV0ZS5MZW5ndGggPT0gbXV0ZS5MZW5ndGgpIHtcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgbXV0ZS5MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIG11dGVbaV0gPSBzYXZlZC5tdXRlW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChzYXZlZC5pbnN0cnVtZW50cyAhPSBudWxsICYmIHNhdmVkLmluc3RydW1lbnRzLkxlbmd0aCA9PSBpbnN0cnVtZW50cy5MZW5ndGgpIHtcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgaW5zdHJ1bWVudHMuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpbnN0cnVtZW50c1tpXSA9IHNhdmVkLmluc3RydW1lbnRzW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChzYXZlZC50aW1lICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRpbWUgPSBuZXcgVGltZVNpZ25hdHVyZShzYXZlZC50aW1lLk51bWVyYXRvciwgc2F2ZWQudGltZS5EZW5vbWluYXRvcixcbiAgICAgICAgICAgICAgICAgICAgc2F2ZWQudGltZS5RdWFydGVyLCBzYXZlZC50aW1lLlRlbXBvKTtcbiAgICAgICAgfVxuICAgICAgICB1c2VEZWZhdWx0SW5zdHJ1bWVudHMgPSBzYXZlZC51c2VEZWZhdWx0SW5zdHJ1bWVudHM7XG4gICAgICAgIHNjcm9sbFZlcnQgPSBzYXZlZC5zY3JvbGxWZXJ0O1xuICAgICAgICBsYXJnZU5vdGVTaXplID0gc2F2ZWQubGFyZ2VOb3RlU2l6ZTtcbiAgICAgICAgc2hvd0x5cmljcyA9IHNhdmVkLnNob3dMeXJpY3M7XG4gICAgICAgIHR3b1N0YWZmcyA9IHNhdmVkLnR3b1N0YWZmcztcbiAgICAgICAgc2hvd05vdGVMZXR0ZXJzID0gc2F2ZWQuc2hvd05vdGVMZXR0ZXJzO1xuICAgICAgICB0cmFuc3Bvc2UgPSBzYXZlZC50cmFuc3Bvc2U7XG4gICAgICAgIGtleSA9IHNhdmVkLmtleTtcbiAgICAgICAgY29tYmluZUludGVydmFsID0gc2F2ZWQuY29tYmluZUludGVydmFsO1xuICAgICAgICBpZiAoc2F2ZWQuc2hhZGVDb2xvciAhPSBDb2xvci5XaGl0ZSkge1xuICAgICAgICAgICAgc2hhZGVDb2xvciA9IHNhdmVkLnNoYWRlQ29sb3I7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNhdmVkLnNoYWRlMkNvbG9yICE9IENvbG9yLldoaXRlKSB7XG4gICAgICAgICAgICBzaGFkZTJDb2xvciA9IHNhdmVkLnNoYWRlMkNvbG9yO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzYXZlZC5jb2xvcnMgIT0gbnVsbCkge1xuICAgICAgICAgICAgY29sb3JzID0gc2F2ZWQuY29sb3JzO1xuICAgICAgICB9XG4gICAgICAgIHNob3dNZWFzdXJlcyA9IHNhdmVkLnNob3dNZWFzdXJlcztcbiAgICAgICAgcGxheU1lYXN1cmVzSW5Mb29wID0gc2F2ZWQucGxheU1lYXN1cmVzSW5Mb29wO1xuICAgICAgICBwbGF5TWVhc3VyZXNJbkxvb3BTdGFydCA9IHNhdmVkLnBsYXlNZWFzdXJlc0luTG9vcFN0YXJ0O1xuICAgICAgICBwbGF5TWVhc3VyZXNJbkxvb3BFbmQgPSBzYXZlZC5wbGF5TWVhc3VyZXNJbkxvb3BFbmQ7XG4gICAgfVxufVxuXG59XG5cblxuIiwiLypcclxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTIgTWFkaGF2IFZhaWR5YW5hdGhhblxyXG4gKlxyXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcclxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxyXG4gKlxyXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXHJcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxyXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxyXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cclxuICovXHJcblxyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5JTztcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XHJcblxyXG4vKiogQGNsYXNzIE1pZGlUcmFja1xyXG4gKiBUaGUgTWlkaVRyYWNrIHRha2VzIGFzIGlucHV0IHRoZSByYXcgTWlkaUV2ZW50cyBmb3IgdGhlIHRyYWNrLCBhbmQgZ2V0czpcclxuICogLSBUaGUgbGlzdCBvZiBtaWRpIG5vdGVzIGluIHRoZSB0cmFjay5cclxuICogLSBUaGUgZmlyc3QgaW5zdHJ1bWVudCB1c2VkIGluIHRoZSB0cmFjay5cclxuICpcclxuICogRm9yIGVhY2ggTm90ZU9uIGV2ZW50IGluIHRoZSBtaWRpIGZpbGUsIGEgbmV3IE1pZGlOb3RlIGlzIGNyZWF0ZWRcclxuICogYW5kIGFkZGVkIHRvIHRoZSB0cmFjaywgdXNpbmcgdGhlIEFkZE5vdGUoKSBtZXRob2QuXHJcbiAqIFxyXG4gKiBUaGUgTm90ZU9mZigpIG1ldGhvZCBpcyBjYWxsZWQgd2hlbiBhIE5vdGVPZmYgZXZlbnQgaXMgZW5jb3VudGVyZWQsXHJcbiAqIGluIG9yZGVyIHRvIHVwZGF0ZSB0aGUgZHVyYXRpb24gb2YgdGhlIE1pZGlOb3RlLlxyXG4gKi8gXHJcbnB1YmxpYyBjbGFzcyBNaWRpVHJhY2sge1xyXG4gICAgcHJpdmF0ZSBpbnQgdHJhY2tudW07ICAgICAgICAgICAgIC8qKiBUaGUgdHJhY2sgbnVtYmVyICovXHJcbiAgICBwcml2YXRlIExpc3Q8TWlkaU5vdGU+IG5vdGVzOyAgICAgLyoqIExpc3Qgb2YgTWlkaSBub3RlcyAqL1xyXG4gICAgcHJpdmF0ZSBpbnQgaW5zdHJ1bWVudDsgICAgICAgICAgIC8qKiBJbnN0cnVtZW50IGZvciB0aGlzIHRyYWNrICovXHJcbiAgICBwcml2YXRlIExpc3Q8TWlkaUV2ZW50PiBseXJpY3M7ICAgLyoqIFRoZSBseXJpY3MgaW4gdGhpcyB0cmFjayAqL1xyXG5cclxuICAgIC8qKiBDcmVhdGUgYW4gZW1wdHkgTWlkaVRyYWNrLiAgVXNlZCBieSB0aGUgQ2xvbmUgbWV0aG9kICovXHJcbiAgICBwdWJsaWMgTWlkaVRyYWNrKGludCB0cmFja251bSkge1xyXG4gICAgICAgIHRoaXMudHJhY2tudW0gPSB0cmFja251bTtcclxuICAgICAgICBub3RlcyA9IG5ldyBMaXN0PE1pZGlOb3RlPigyMCk7XHJcbiAgICAgICAgaW5zdHJ1bWVudCA9IDA7XHJcbiAgICB9IFxyXG5cclxuICAgIC8qKiBDcmVhdGUgYSBNaWRpVHJhY2sgYmFzZWQgb24gdGhlIE1pZGkgZXZlbnRzLiAgRXh0cmFjdCB0aGUgTm90ZU9uL05vdGVPZmZcclxuICAgICAqICBldmVudHMgdG8gZ2F0aGVyIHRoZSBsaXN0IG9mIE1pZGlOb3Rlcy5cclxuICAgICAqL1xyXG4gICAgcHVibGljIE1pZGlUcmFjayhMaXN0PE1pZGlFdmVudD4gZXZlbnRzLCBpbnQgdHJhY2tudW0pIHtcclxuICAgICAgICB0aGlzLnRyYWNrbnVtID0gdHJhY2tudW07XHJcbiAgICAgICAgbm90ZXMgPSBuZXcgTGlzdDxNaWRpTm90ZT4oZXZlbnRzLkNvdW50KTtcclxuICAgICAgICBpbnN0cnVtZW50ID0gMDtcclxuIFxyXG4gICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBtZXZlbnQgaW4gZXZlbnRzKSB7XHJcbiAgICAgICAgICAgIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IE1pZGlGaWxlLkV2ZW50Tm90ZU9uICYmIG1ldmVudC5WZWxvY2l0eSA+IDApIHtcclxuICAgICAgICAgICAgICAgIE1pZGlOb3RlIG5vdGUgPSBuZXcgTWlkaU5vdGUobWV2ZW50LlN0YXJ0VGltZSwgbWV2ZW50LkNoYW5uZWwsIG1ldmVudC5Ob3RlbnVtYmVyLCAwLCBtZXZlbnQuVmVsb2NpdHkpO1xyXG4gICAgICAgICAgICAgICAgQWRkTm90ZShub3RlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IE1pZGlGaWxlLkV2ZW50Tm90ZU9uICYmIG1ldmVudC5WZWxvY2l0eSA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBOb3RlT2ZmKG1ldmVudC5DaGFubmVsLCBtZXZlbnQuTm90ZW51bWJlciwgbWV2ZW50LlN0YXJ0VGltZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBNaWRpRmlsZS5FdmVudE5vdGVPZmYpIHtcclxuICAgICAgICAgICAgICAgIE5vdGVPZmYobWV2ZW50LkNoYW5uZWwsIG1ldmVudC5Ob3RlbnVtYmVyLCBtZXZlbnQuU3RhcnRUaW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IE1pZGlGaWxlLkV2ZW50UHJvZ3JhbUNoYW5nZSkge1xyXG4gICAgICAgICAgICAgICAgaW5zdHJ1bWVudCA9IG1ldmVudC5JbnN0cnVtZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5NZXRhZXZlbnQgPT0gTWlkaUZpbGUuTWV0YUV2ZW50THlyaWMpIHtcclxuICAgICAgICAgICAgICAgIEFkZEx5cmljKG1ldmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5vdGVzLkNvdW50ID4gMCAmJiBub3Rlc1swXS5DaGFubmVsID09IDkpICB7XHJcbiAgICAgICAgICAgIGluc3RydW1lbnQgPSAxMjg7ICAvKiBQZXJjdXNzaW9uICovXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGludCBseXJpY2NvdW50ID0gMDtcclxuICAgICAgICBpZiAobHlyaWNzICE9IG51bGwpIHsgbHlyaWNjb3VudCA9IGx5cmljcy5Db3VudDsgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbnQgTnVtYmVyIHtcclxuICAgICAgICBnZXQgeyByZXR1cm4gdHJhY2tudW07IH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgTGlzdDxNaWRpTm90ZT4gTm90ZXMge1xyXG4gICAgICAgIGdldCB7IHJldHVybiBub3RlczsgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbnQgSW5zdHJ1bWVudCB7XHJcbiAgICAgICAgZ2V0IHsgcmV0dXJuIGluc3RydW1lbnQ7IH1cclxuICAgICAgICBzZXQgeyBpbnN0cnVtZW50ID0gdmFsdWU7IH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RyaW5nIEluc3RydW1lbnROYW1lIHtcclxuICAgICAgICBnZXQgeyBpZiAoaW5zdHJ1bWVudCA+PSAwICYmIGluc3RydW1lbnQgPD0gMTI4KVxyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gTWlkaUZpbGUuSW5zdHJ1bWVudHNbaW5zdHJ1bWVudF07XHJcbiAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gXCJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBMaXN0PE1pZGlFdmVudD4gTHlyaWNzIHtcclxuICAgICAgICBnZXQgeyByZXR1cm4gbHlyaWNzOyB9XHJcbiAgICAgICAgc2V0IHsgbHlyaWNzID0gdmFsdWU7IH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogQWRkIGEgTWlkaU5vdGUgdG8gdGhpcyB0cmFjay4gIFRoaXMgaXMgY2FsbGVkIGZvciBlYWNoIE5vdGVPbiBldmVudCAqL1xyXG4gICAgcHVibGljIHZvaWQgQWRkTm90ZShNaWRpTm90ZSBtKSB7XHJcbiAgICAgICAgbm90ZXMuQWRkKG0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBBIE5vdGVPZmYgZXZlbnQgb2NjdXJlZC4gIEZpbmQgdGhlIE1pZGlOb3RlIG9mIHRoZSBjb3JyZXNwb25kaW5nXHJcbiAgICAgKiBOb3RlT24gZXZlbnQsIGFuZCB1cGRhdGUgdGhlIGR1cmF0aW9uIG9mIHRoZSBNaWRpTm90ZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHZvaWQgTm90ZU9mZihpbnQgY2hhbm5lbCwgaW50IG5vdGVudW1iZXIsIGludCBlbmR0aW1lKSB7XHJcbiAgICAgICAgZm9yIChpbnQgaSA9IG5vdGVzLkNvdW50LTE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIE1pZGlOb3RlIG5vdGUgPSBub3Rlc1tpXTtcclxuICAgICAgICAgICAgaWYgKG5vdGUuQ2hhbm5lbCA9PSBjaGFubmVsICYmIG5vdGUuTnVtYmVyID09IG5vdGVudW1iZXIgJiZcclxuICAgICAgICAgICAgICAgIG5vdGUuRHVyYXRpb24gPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgbm90ZS5Ob3RlT2ZmKGVuZHRpbWUpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBBZGQgYSBMeXJpYyBNaWRpRXZlbnQgKi9cclxuICAgIHB1YmxpYyB2b2lkIEFkZEx5cmljKE1pZGlFdmVudCBtZXZlbnQpIHtcclxuICAgICAgICBpZiAobHlyaWNzID09IG51bGwpIHtcclxuICAgICAgICAgICAgbHlyaWNzID0gbmV3IExpc3Q8TWlkaUV2ZW50PigpO1xyXG4gICAgICAgIH0gXHJcbiAgICAgICAgbHlyaWNzLkFkZChtZXZlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBSZXR1cm4gYSBkZWVwIGNvcHkgY2xvbmUgb2YgdGhpcyBNaWRpVHJhY2suICovXHJcbiAgICBwdWJsaWMgTWlkaVRyYWNrIENsb25lKCkge1xyXG4gICAgICAgIE1pZGlUcmFjayB0cmFjayA9IG5ldyBNaWRpVHJhY2soTnVtYmVyKTtcclxuICAgICAgICB0cmFjay5pbnN0cnVtZW50ID0gaW5zdHJ1bWVudDtcclxuICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIG5vdGVzKSB7XHJcbiAgICAgICAgICAgIHRyYWNrLm5vdGVzLkFkZCggbm90ZS5DbG9uZSgpICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChseXJpY3MgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0cmFjay5seXJpY3MgPSBuZXcgTGlzdDxNaWRpRXZlbnQ+KCk7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBldiBpbiBseXJpY3MpIHtcclxuICAgICAgICAgICAgICAgIHRyYWNrLmx5cmljcy5BZGQoZXYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cmFjaztcclxuICAgIH1cclxuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XHJcbiAgICAgICAgc3RyaW5nIHJlc3VsdCA9IFwiVHJhY2sgbnVtYmVyPVwiICsgdHJhY2tudW0gKyBcIiBpbnN0cnVtZW50PVwiICsgaW5zdHJ1bWVudCArIFwiXFxuXCI7XHJcbiAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbiBpbiBub3Rlcykge1xyXG4gICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdCArIG4gKyBcIlxcblwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHQgKz0gXCJFbmQgVHJhY2tcXG5cIjtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG59XHJcblxyXG59XHJcblxyXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogRW51bWVyYXRpb24gb2YgdGhlIG5vdGVzIGluIGEgc2NhbGUgKEEsIEEjLCAuLi4gRyMpICovXG5wdWJsaWMgY2xhc3MgTm90ZVNjYWxlIHtcbiAgICBwdWJsaWMgY29uc3QgaW50IEEgICAgICA9IDA7XG4gICAgcHVibGljIGNvbnN0IGludCBBc2hhcnAgPSAxO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQmZsYXQgID0gMTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEIgICAgICA9IDI7XG4gICAgcHVibGljIGNvbnN0IGludCBDICAgICAgPSAzO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQ3NoYXJwID0gNDtcbiAgICBwdWJsaWMgY29uc3QgaW50IERmbGF0ICA9IDQ7XG4gICAgcHVibGljIGNvbnN0IGludCBEICAgICAgPSA1O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRHNoYXJwID0gNjtcbiAgICBwdWJsaWMgY29uc3QgaW50IEVmbGF0ICA9IDY7XG4gICAgcHVibGljIGNvbnN0IGludCBFICAgICAgPSA3O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRiAgICAgID0gODtcbiAgICBwdWJsaWMgY29uc3QgaW50IEZzaGFycCA9IDk7XG4gICAgcHVibGljIGNvbnN0IGludCBHZmxhdCAgPSA5O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRyAgICAgID0gMTA7XG4gICAgcHVibGljIGNvbnN0IGludCBHc2hhcnAgPSAxMTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEFmbGF0ICA9IDExO1xuXG4gICAgLyoqIENvbnZlcnQgYSBub3RlIChBLCBBIywgQiwgZXRjKSBhbmQgb2N0YXZlIGludG8gYVxuICAgICAqIE1pZGkgTm90ZSBudW1iZXIuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBpbnQgVG9OdW1iZXIoaW50IG5vdGVzY2FsZSwgaW50IG9jdGF2ZSkge1xuICAgICAgICByZXR1cm4gOSArIG5vdGVzY2FsZSArIG9jdGF2ZSAqIDEyO1xuICAgIH1cblxuICAgIC8qKiBDb252ZXJ0IGEgTWlkaSBub3RlIG51bWJlciBpbnRvIGEgbm90ZXNjYWxlIChBLCBBIywgQikgKi9cbiAgICBwdWJsaWMgc3RhdGljIGludCBGcm9tTnVtYmVyKGludCBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIChudW1iZXIgKyAzKSAlIDEyO1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGlzIG5vdGVzY2FsZSBudW1iZXIgaXMgYSBibGFjayBrZXkgKi9cbiAgICBwdWJsaWMgc3RhdGljIGJvb2wgSXNCbGFja0tleShpbnQgbm90ZXNjYWxlKSB7XG4gICAgICAgIGlmIChub3Rlc2NhbGUgPT0gQXNoYXJwIHx8XG4gICAgICAgICAgICBub3Rlc2NhbGUgPT0gQ3NoYXJwIHx8XG4gICAgICAgICAgICBub3Rlc2NhbGUgPT0gRHNoYXJwIHx8XG4gICAgICAgICAgICBub3Rlc2NhbGUgPT0gRnNoYXJwIHx8XG4gICAgICAgICAgICBub3Rlc2NhbGUgPT0gR3NoYXJwKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbi8qKiBAY2xhc3MgV2hpdGVOb3RlXG4gKiBUaGUgV2hpdGVOb3RlIGNsYXNzIHJlcHJlc2VudHMgYSB3aGl0ZSBrZXkgbm90ZSwgYSBub24tc2hhcnAsXG4gKiBub24tZmxhdCBub3RlLiAgVG8gZGlzcGxheSBtaWRpIG5vdGVzIGFzIHNoZWV0IG11c2ljLCB0aGUgbm90ZXNcbiAqIG11c3QgYmUgY29udmVydGVkIHRvIHdoaXRlIG5vdGVzIGFuZCBhY2NpZGVudGFscy4gXG4gKlxuICogV2hpdGUgbm90ZXMgY29uc2lzdCBvZiBhIGxldHRlciAoQSB0aHJ1IEcpIGFuZCBhbiBvY3RhdmUgKDAgdGhydSAxMCkuXG4gKiBUaGUgb2N0YXZlIGNoYW5nZXMgZnJvbSBHIHRvIEEuICBBZnRlciBHMiBjb21lcyBBMy4gIE1pZGRsZS1DIGlzIEM0LlxuICpcbiAqIFRoZSBtYWluIG9wZXJhdGlvbnMgYXJlIGNhbGN1bGF0aW5nIGRpc3RhbmNlcyBiZXR3ZWVuIG5vdGVzLCBhbmQgY29tcGFyaW5nIG5vdGVzLlxuICovIFxuXG5wdWJsaWMgY2xhc3MgV2hpdGVOb3RlIDogSUNvbXBhcmVyPFdoaXRlTm90ZT4ge1xuXG4gICAgLyogVGhlIHBvc3NpYmxlIG5vdGUgbGV0dGVycyAqL1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQSA9IDA7XG4gICAgcHVibGljIGNvbnN0IGludCBCID0gMTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEMgPSAyO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRCA9IDM7XG4gICAgcHVibGljIGNvbnN0IGludCBFID0gNDtcbiAgICBwdWJsaWMgY29uc3QgaW50IEYgPSA1O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRyA9IDY7XG5cbiAgICAvKiBDb21tb24gd2hpdGUgbm90ZXMgdXNlZCBpbiBjYWxjdWxhdGlvbnMgKi9cbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBUb3BUcmVibGUgPSBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5FLCA1KTtcbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBCb3R0b21UcmVibGUgPSBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5GLCA0KTtcbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBUb3BCYXNzID0gbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRywgMyk7XG4gICAgcHVibGljIHN0YXRpYyBXaGl0ZU5vdGUgQm90dG9tQmFzcyA9IG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkEsIDMpO1xuICAgIHB1YmxpYyBzdGF0aWMgV2hpdGVOb3RlIE1pZGRsZUMgPSBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5DLCA0KTtcblxuICAgIHByaXZhdGUgaW50IGxldHRlcjsgIC8qIFRoZSBsZXR0ZXIgb2YgdGhlIG5vdGUsIEEgdGhydSBHICovXG4gICAgcHJpdmF0ZSBpbnQgb2N0YXZlOyAgLyogVGhlIG9jdGF2ZSwgMCB0aHJ1IDEwLiAqL1xuXG4gICAgLyogR2V0IHRoZSBsZXR0ZXIgKi9cbiAgICBwdWJsaWMgaW50IExldHRlciB7XG4gICAgICAgIGdldCB7IHJldHVybiBsZXR0ZXI7IH1cbiAgICB9XG5cbiAgICAvKiBHZXQgdGhlIG9jdGF2ZSAqL1xuICAgIHB1YmxpYyBpbnQgT2N0YXZlIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIG9jdGF2ZTsgfVxuICAgIH1cblxuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBub3RlIHdpdGggdGhlIGdpdmVuIGxldHRlciBhbmQgb2N0YXZlLiAqL1xuICAgIHB1YmxpYyBXaGl0ZU5vdGUoaW50IGxldHRlciwgaW50IG9jdGF2ZSkge1xuICAgICAgICBpZiAoIShsZXR0ZXIgPj0gMCAmJiBsZXR0ZXIgPD0gNikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBTeXN0ZW0uQXJndW1lbnRFeGNlcHRpb24oXCJMZXR0ZXIgXCIgKyBsZXR0ZXIgKyBcIiBpcyBpbmNvcnJlY3RcIik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxldHRlciA9IGxldHRlcjtcbiAgICAgICAgdGhpcy5vY3RhdmUgPSBvY3RhdmU7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgZGlzdGFuY2UgKGluIHdoaXRlIG5vdGVzKSBiZXR3ZWVuIHRoaXMgbm90ZVxuICAgICAqIGFuZCBub3RlIHcsIGkuZS4gIHRoaXMgLSB3LiAgRm9yIGV4YW1wbGUsIEM0IC0gQTQgPSAyLFxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgRGlzdChXaGl0ZU5vdGUgdykge1xuICAgICAgICByZXR1cm4gKG9jdGF2ZSAtIHcub2N0YXZlKSAqIDcgKyAobGV0dGVyIC0gdy5sZXR0ZXIpO1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhpcyBub3RlIHBsdXMgdGhlIGdpdmVuIGFtb3VudCAoaW4gd2hpdGUgbm90ZXMpLlxuICAgICAqIFRoZSBhbW91bnQgbWF5IGJlIHBvc2l0aXZlIG9yIG5lZ2F0aXZlLiAgRm9yIGV4YW1wbGUsXG4gICAgICogQTQgKyAyID0gQzQsIGFuZCBDNCArICgtMikgPSBBNC5cbiAgICAgKi9cbiAgICBwdWJsaWMgV2hpdGVOb3RlIEFkZChpbnQgYW1vdW50KSB7XG4gICAgICAgIGludCBudW0gPSBvY3RhdmUgKiA3ICsgbGV0dGVyO1xuICAgICAgICBudW0gKz0gYW1vdW50O1xuICAgICAgICBpZiAobnVtIDwgMCkge1xuICAgICAgICAgICAgbnVtID0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFdoaXRlTm90ZShudW0gJSA3LCBudW0gLyA3KTtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBtaWRpIG5vdGUgbnVtYmVyIGNvcnJlc3BvbmRpbmcgdG8gdGhpcyB3aGl0ZSBub3RlLlxuICAgICAqIFRoZSBtaWRpIG5vdGUgbnVtYmVycyBjb3ZlciBhbGwga2V5cywgaW5jbHVkaW5nIHNoYXJwcy9mbGF0cyxcbiAgICAgKiBzbyBlYWNoIG9jdGF2ZSBpcyAxMiBub3Rlcy4gIE1pZGRsZSBDIChDNCkgaXMgNjAuICBTb21lIGV4YW1wbGVcbiAgICAgKiBudW1iZXJzIGZvciB2YXJpb3VzIG5vdGVzOlxuICAgICAqXG4gICAgICogIEEgMiA9IDMzXG4gICAgICogIEEjMiA9IDM0XG4gICAgICogIEcgMiA9IDQzXG4gICAgICogIEcjMiA9IDQ0IFxuICAgICAqICBBIDMgPSA0NVxuICAgICAqICBBIDQgPSA1N1xuICAgICAqICBBIzQgPSA1OFxuICAgICAqICBCIDQgPSA1OVxuICAgICAqICBDIDQgPSA2MFxuICAgICAqL1xuXG4gICAgcHVibGljIGludCBOdW1iZXIoKSB7XG4gICAgICAgIGludCBvZmZzZXQgPSAwO1xuICAgICAgICBzd2l0Y2ggKGxldHRlcikge1xuICAgICAgICAgICAgY2FzZSBBOiBvZmZzZXQgPSBOb3RlU2NhbGUuQTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEI6IG9mZnNldCA9IE5vdGVTY2FsZS5COyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQzogb2Zmc2V0ID0gTm90ZVNjYWxlLkM7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBEOiBvZmZzZXQgPSBOb3RlU2NhbGUuRDsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEU6IG9mZnNldCA9IE5vdGVTY2FsZS5FOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgRjogb2Zmc2V0ID0gTm90ZVNjYWxlLkY7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBHOiBvZmZzZXQgPSBOb3RlU2NhbGUuRzsgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OiBvZmZzZXQgPSAwOyBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTm90ZVNjYWxlLlRvTnVtYmVyKG9mZnNldCwgb2N0YXZlKTtcbiAgICB9XG5cbiAgICAvKiogQ29tcGFyZSB0aGUgdHdvIG5vdGVzLiAgUmV0dXJuXG4gICAgICogIDwgMCAgaWYgeCBpcyBsZXNzIChsb3dlcikgdGhhbiB5XG4gICAgICogICAgMCAgaWYgeCBpcyBlcXVhbCB0byB5XG4gICAgICogID4gMCAgaWYgeCBpcyBncmVhdGVyIChoaWdoZXIpIHRoYW4geVxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgQ29tcGFyZShXaGl0ZU5vdGUgeCwgV2hpdGVOb3RlIHkpIHtcbiAgICAgICAgcmV0dXJuIHguRGlzdCh5KTtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBoaWdoZXIgbm90ZSwgeCBvciB5ICovXG4gICAgcHVibGljIHN0YXRpYyBXaGl0ZU5vdGUgTWF4KFdoaXRlTm90ZSB4LCBXaGl0ZU5vdGUgeSkge1xuICAgICAgICBpZiAoeC5EaXN0KHkpID4gMClcbiAgICAgICAgICAgIHJldHVybiB4O1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4geTtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBsb3dlciBub3RlLCB4IG9yIHkgKi9cbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBNaW4oV2hpdGVOb3RlIHgsIFdoaXRlTm90ZSB5KSB7XG4gICAgICAgIGlmICh4LkRpc3QoeSkgPCAwKVxuICAgICAgICAgICAgcmV0dXJuIHg7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB5O1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIHRvcCBub3RlIGluIHRoZSBzdGFmZiBvZiB0aGUgZ2l2ZW4gY2xlZiAqL1xuICAgIHB1YmxpYyBzdGF0aWMgV2hpdGVOb3RlIFRvcChDbGVmIGNsZWYpIHtcbiAgICAgICAgaWYgKGNsZWYgPT0gQ2xlZi5UcmVibGUpXG4gICAgICAgICAgICByZXR1cm4gVG9wVHJlYmxlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gVG9wQmFzcztcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBib3R0b20gbm90ZSBpbiB0aGUgc3RhZmYgb2YgdGhlIGdpdmVuIGNsZWYgKi9cbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBCb3R0b20oQ2xlZiBjbGVmKSB7XG4gICAgICAgIGlmIChjbGVmID09IENsZWYuVHJlYmxlKVxuICAgICAgICAgICAgcmV0dXJuIEJvdHRvbVRyZWJsZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIEJvdHRvbUJhc3M7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgc3RyaW5nIDxsZXR0ZXI+PG9jdGF2ZT4gZm9yIHRoaXMgbm90ZS4gKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgXG4gICAgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICBzdHJpbmdbXSBzID0geyBcIkFcIiwgXCJCXCIsIFwiQ1wiLCBcIkRcIiwgXCJFXCIsIFwiRlwiLCBcIkdcIiB9O1xuICAgICAgICByZXR1cm4gc1tsZXR0ZXJdICsgb2N0YXZlO1xuICAgIH1cbn1cblxuXG5cbn1cbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBQYWludEV2ZW50QXJnc1xyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBSZWN0YW5nbGUgQ2xpcFJlY3RhbmdsZSB7IGdldDsgc2V0OyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBHcmFwaGljcyBHcmFwaGljcygpIHsgcmV0dXJuIG5ldyBHcmFwaGljcyhcIm1haW5cIik7IH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgUGFuZWxcclxuICAgIHtcclxuICAgICAgICBwcml2YXRlIFBvaW50IGF1dG9TY3JvbGxQb3NpdGlvbj1uZXcgUG9pbnQoMCwwKTtcclxuICAgICAgICBwdWJsaWMgUG9pbnQgQXV0b1Njcm9sbFBvc2l0aW9uIHsgZ2V0IHsgcmV0dXJuIGF1dG9TY3JvbGxQb3NpdGlvbjsgfSBzZXQgeyBhdXRvU2Nyb2xsUG9zaXRpb24gPSB2YWx1ZTsgfSB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBpbnQgV2lkdGg7XHJcbiAgICAgICAgcHVibGljIGludCBIZWlnaHQ7XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIHN0YXRpYyBjbGFzcyBQYXRoXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBzdHJpbmcgR2V0RmlsZU5hbWUoc3RyaW5nIGZpbGVuYW1lKSB7IHJldHVybiBudWxsOyB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFBlblxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBDb2xvciBDb2xvcjtcclxuICAgICAgICBwdWJsaWMgaW50IFdpZHRoO1xyXG4gICAgICAgIHB1YmxpYyBMaW5lQ2FwIEVuZENhcDtcclxuXHJcbiAgICAgICAgcHVibGljIFBlbihDb2xvciBjb2xvciwgaW50IHdpZHRoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQ29sb3IgPSBjb2xvcjtcclxuICAgICAgICAgICAgV2lkdGggPSB3aWR0aDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFBvaW50XHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIGludCBYO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgWTtcclxuXHJcbiAgICAgICAgcHVibGljIFBvaW50KGludCB4LCBpbnQgeSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFggPSB4O1xyXG4gICAgICAgICAgICBZID0geTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFJlY3RhbmdsZVxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBpbnQgWDtcclxuICAgICAgICBwdWJsaWMgaW50IFk7XHJcbiAgICAgICAgcHVibGljIGludCBXaWR0aDtcclxuICAgICAgICBwdWJsaWMgaW50IEhlaWdodDtcclxuXHJcbiAgICAgICAgcHVibGljIFJlY3RhbmdsZShpbnQgeCwgaW50IHksIGludCB3aWR0aCwgaW50IGhlaWdodClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFggPSB4O1xyXG4gICAgICAgICAgICBZID0geTtcclxuICAgICAgICAgICAgV2lkdGggPSB3aWR0aDtcclxuICAgICAgICAgICAgSGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcblxyXG4gICAgLyogQGNsYXNzIFN0YWZmXHJcbiAgICAgKiBUaGUgU3RhZmYgaXMgdXNlZCB0byBkcmF3IGEgc2luZ2xlIFN0YWZmIChhIHJvdyBvZiBtZWFzdXJlcykgaW4gdGhlIFxyXG4gICAgICogU2hlZXRNdXNpYyBDb250cm9sLiBBIFN0YWZmIG5lZWRzIHRvIGRyYXdcclxuICAgICAqIC0gVGhlIENsZWZcclxuICAgICAqIC0gVGhlIGtleSBzaWduYXR1cmVcclxuICAgICAqIC0gVGhlIGhvcml6b250YWwgbGluZXNcclxuICAgICAqIC0gQSBsaXN0IG9mIE11c2ljU3ltYm9sc1xyXG4gICAgICogLSBUaGUgbGVmdCBhbmQgcmlnaHQgdmVydGljYWwgbGluZXNcclxuICAgICAqXHJcbiAgICAgKiBUaGUgaGVpZ2h0IG9mIHRoZSBTdGFmZiBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBudW1iZXIgb2YgcGl4ZWxzIGVhY2hcclxuICAgICAqIE11c2ljU3ltYm9sIGV4dGVuZHMgYWJvdmUgYW5kIGJlbG93IHRoZSBzdGFmZi5cclxuICAgICAqXHJcbiAgICAgKiBUaGUgdmVydGljYWwgbGluZXMgKGxlZnQgYW5kIHJpZ2h0IHNpZGVzKSBvZiB0aGUgc3RhZmYgYXJlIGpvaW5lZFxyXG4gICAgICogd2l0aCB0aGUgc3RhZmZzIGFib3ZlIGFuZCBiZWxvdyBpdCwgd2l0aCBvbmUgZXhjZXB0aW9uLiAgXHJcbiAgICAgKiBUaGUgbGFzdCB0cmFjayBpcyBub3Qgam9pbmVkIHdpdGggdGhlIGZpcnN0IHRyYWNrLlxyXG4gICAgICovXHJcblxyXG4gICAgcHVibGljIGNsYXNzIFN0YWZmXHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSBMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzOyAgLyoqIFRoZSBtdXNpYyBzeW1ib2xzIGluIHRoaXMgc3RhZmYgKi9cclxuICAgICAgICBwcml2YXRlIExpc3Q8THlyaWNTeW1ib2w+IGx5cmljczsgICAvKiogVGhlIGx5cmljcyB0byBkaXNwbGF5IChjYW4gYmUgbnVsbCkgKi9cclxuICAgICAgICBwcml2YXRlIGludCB5dG9wOyAgICAgICAgICAgICAgICAgICAvKiogVGhlIHkgcGl4ZWwgb2YgdGhlIHRvcCBvZiB0aGUgc3RhZmYgKi9cclxuICAgICAgICBwcml2YXRlIENsZWZTeW1ib2wgY2xlZnN5bTsgICAgICAgICAvKiogVGhlIGxlZnQtc2lkZSBDbGVmIHN5bWJvbCAqL1xyXG4gICAgICAgIHByaXZhdGUgQWNjaWRTeW1ib2xbXSBrZXlzOyAgICAgICAgIC8qKiBUaGUga2V5IHNpZ25hdHVyZSBzeW1ib2xzICovXHJcbiAgICAgICAgcHJpdmF0ZSBib29sIHNob3dNZWFzdXJlczsgICAgICAgICAgLyoqIElmIHRydWUsIHNob3cgdGhlIG1lYXN1cmUgbnVtYmVycyAqL1xyXG4gICAgICAgIHByaXZhdGUgaW50IGtleXNpZ1dpZHRoOyAgICAgICAgICAgIC8qKiBUaGUgd2lkdGggb2YgdGhlIGNsZWYgYW5kIGtleSBzaWduYXR1cmUgKi9cclxuICAgICAgICBwcml2YXRlIGludCB3aWR0aDsgICAgICAgICAgICAgICAgICAvKiogVGhlIHdpZHRoIG9mIHRoZSBzdGFmZiBpbiBwaXhlbHMgKi9cclxuICAgICAgICBwcml2YXRlIGludCBoZWlnaHQ7ICAgICAgICAgICAgICAgICAvKiogVGhlIGhlaWdodCBvZiB0aGUgc3RhZmYgaW4gcGl4ZWxzICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgdHJhY2tudW07ICAgICAgICAgICAgICAgLyoqIFRoZSB0cmFjayB0aGlzIHN0YWZmIHJlcHJlc2VudHMgKi9cclxuICAgICAgICBwcml2YXRlIGludCB0b3RhbHRyYWNrczsgICAgICAgICAgICAvKiogVGhlIHRvdGFsIG51bWJlciBvZiB0cmFja3MgKi9cclxuICAgICAgICBwcml2YXRlIGludCBzdGFydHRpbWU7ICAgICAgICAgICAgICAvKiogVGhlIHRpbWUgKGluIHB1bHNlcykgb2YgZmlyc3Qgc3ltYm9sICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgZW5kdGltZTsgICAgICAgICAgICAgICAgLyoqIFRoZSB0aW1lIChpbiBwdWxzZXMpIG9mIGxhc3Qgc3ltYm9sICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgbWVhc3VyZUxlbmd0aDsgICAgICAgICAgLyoqIFRoZSB0aW1lIChpbiBwdWxzZXMpIG9mIGEgbWVhc3VyZSAqL1xyXG5cclxuICAgICAgICAvKiogQ3JlYXRlIGEgbmV3IHN0YWZmIHdpdGggdGhlIGdpdmVuIGxpc3Qgb2YgbXVzaWMgc3ltYm9scyxcbiAgICAgICAgICogYW5kIHRoZSBnaXZlbiBrZXkgc2lnbmF0dXJlLiAgVGhlIGNsZWYgaXMgZGV0ZXJtaW5lZCBieVxuICAgICAgICAgKiB0aGUgY2xlZiBvZiB0aGUgZmlyc3QgY2hvcmQgc3ltYm9sLiBUaGUgdHJhY2sgbnVtYmVyIGlzIHVzZWRcbiAgICAgICAgICogdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdG8gam9pbiB0aGlzIGxlZnQvcmlnaHQgdmVydGljYWwgc2lkZXNcbiAgICAgICAgICogd2l0aCB0aGUgc3RhZmZzIGFib3ZlIGFuZCBiZWxvdy4gVGhlIFNoZWV0TXVzaWNPcHRpb25zIGFyZSB1c2VkXG4gICAgICAgICAqIHRvIGNoZWNrIHdoZXRoZXIgdG8gZGlzcGxheSBtZWFzdXJlIG51bWJlcnMgb3Igbm90LlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgU3RhZmYoTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scywgS2V5U2lnbmF0dXJlIGtleSxcclxuICAgICAgICAgICAgICAgICAgICAgTWlkaU9wdGlvbnMgb3B0aW9ucyxcclxuICAgICAgICAgICAgICAgICAgICAgaW50IHRyYWNrbnVtLCBpbnQgdG90YWx0cmFja3MpXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICAgICAga2V5c2lnV2lkdGggPSBTaGVldE11c2ljLktleVNpZ25hdHVyZVdpZHRoKGtleSk7XHJcbiAgICAgICAgICAgIHRoaXMudHJhY2tudW0gPSB0cmFja251bTtcclxuICAgICAgICAgICAgdGhpcy50b3RhbHRyYWNrcyA9IHRvdGFsdHJhY2tzO1xyXG4gICAgICAgICAgICBzaG93TWVhc3VyZXMgPSAob3B0aW9ucy5zaG93TWVhc3VyZXMgJiYgdHJhY2tudW0gPT0gMCk7XHJcbiAgICAgICAgICAgIG1lYXN1cmVMZW5ndGggPSBvcHRpb25zLnRpbWUuTWVhc3VyZTtcclxuICAgICAgICAgICAgQ2xlZiBjbGVmID0gRmluZENsZWYoc3ltYm9scyk7XHJcblxyXG4gICAgICAgICAgICBjbGVmc3ltID0gbmV3IENsZWZTeW1ib2woY2xlZiwgMCwgZmFsc2UpO1xyXG4gICAgICAgICAgICBrZXlzID0ga2V5LkdldFN5bWJvbHMoY2xlZik7XHJcbiAgICAgICAgICAgIHRoaXMuc3ltYm9scyA9IHN5bWJvbHM7XHJcbiAgICAgICAgICAgIENhbGN1bGF0ZVdpZHRoKG9wdGlvbnMuc2Nyb2xsVmVydCk7XHJcbiAgICAgICAgICAgIENhbGN1bGF0ZUhlaWdodCgpO1xyXG4gICAgICAgICAgICBDYWxjdWxhdGVTdGFydEVuZFRpbWUoKTtcclxuICAgICAgICAgICAgRnVsbEp1c3RpZnkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBSZXR1cm4gdGhlIHdpZHRoIG9mIHRoZSBzdGFmZiAqL1xyXG4gICAgICAgIHB1YmxpYyBpbnQgV2lkdGhcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdldCB7IHJldHVybiB3aWR0aDsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFJldHVybiB0aGUgaGVpZ2h0IG9mIHRoZSBzdGFmZiAqL1xyXG4gICAgICAgIHB1YmxpYyBpbnQgSGVpZ2h0XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gaGVpZ2h0OyB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogUmV0dXJuIHRoZSB0cmFjayBudW1iZXIgb2YgdGhpcyBzdGFmZiAoc3RhcnRpbmcgZnJvbSAwICovXHJcbiAgICAgICAgcHVibGljIGludCBUcmFja1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIHRyYWNrbnVtOyB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogUmV0dXJuIHRoZSBzdGFydGluZyB0aW1lIG9mIHRoZSBzdGFmZiwgdGhlIHN0YXJ0IHRpbWUgb2ZcbiAgICAgICAgICogIHRoZSBmaXJzdCBzeW1ib2wuICBUaGlzIGlzIHVzZWQgZHVyaW5nIHBsYXliYWNrLCB0byBcbiAgICAgICAgICogIGF1dG9tYXRpY2FsbHkgc2Nyb2xsIHRoZSBtdXNpYyB3aGlsZSBwbGF5aW5nLlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgaW50IFN0YXJ0VGltZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIHN0YXJ0dGltZTsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFJldHVybiB0aGUgZW5kaW5nIHRpbWUgb2YgdGhlIHN0YWZmLCB0aGUgZW5kdGltZSBvZlxuICAgICAgICAgKiAgdGhlIGxhc3Qgc3ltYm9sLiAgVGhpcyBpcyB1c2VkIGR1cmluZyBwbGF5YmFjaywgdG8gXG4gICAgICAgICAqICBhdXRvbWF0aWNhbGx5IHNjcm9sbCB0aGUgbXVzaWMgd2hpbGUgcGxheWluZy5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGludCBFbmRUaW1lXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gZW5kdGltZTsgfVxyXG4gICAgICAgICAgICBzZXQgeyBlbmR0aW1lID0gdmFsdWU7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBGaW5kIHRoZSBpbml0aWFsIGNsZWYgdG8gdXNlIGZvciB0aGlzIHN0YWZmLiAgVXNlIHRoZSBjbGVmIG9mXG4gICAgICAgICAqIHRoZSBmaXJzdCBDaG9yZFN5bWJvbC5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBDbGVmIEZpbmRDbGVmKExpc3Q8TXVzaWNTeW1ib2w+IGxpc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBtIGluIGxpc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChtIGlzIENob3JkU3ltYm9sKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIENob3JkU3ltYm9sIGMgPSAoQ2hvcmRTeW1ib2wpbTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYy5DbGVmO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBDbGVmLlRyZWJsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBDYWxjdWxhdGUgdGhlIGhlaWdodCBvZiB0aGlzIHN0YWZmLiAgRWFjaCBNdXNpY1N5bWJvbCBjb250YWlucyB0aGVcbiAgICAgICAgICogbnVtYmVyIG9mIHBpeGVscyBpdCBuZWVkcyBhYm92ZSBhbmQgYmVsb3cgdGhlIHN0YWZmLiAgR2V0IHRoZSBtYXhpbXVtXG4gICAgICAgICAqIHZhbHVlcyBhYm92ZSBhbmQgYmVsb3cgdGhlIHN0YWZmLlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgdm9pZCBDYWxjdWxhdGVIZWlnaHQoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW50IGFib3ZlID0gMDtcclxuICAgICAgICAgICAgaW50IGJlbG93ID0gMDtcclxuXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHMgaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgYWJvdmUgPSBNYXRoLk1heChhYm92ZSwgcy5BYm92ZVN0YWZmKTtcclxuICAgICAgICAgICAgICAgIGJlbG93ID0gTWF0aC5NYXgoYmVsb3csIHMuQmVsb3dTdGFmZik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYWJvdmUgPSBNYXRoLk1heChhYm92ZSwgY2xlZnN5bS5BYm92ZVN0YWZmKTtcclxuICAgICAgICAgICAgYmVsb3cgPSBNYXRoLk1heChiZWxvdywgY2xlZnN5bS5CZWxvd1N0YWZmKTtcclxuICAgICAgICAgICAgaWYgKHNob3dNZWFzdXJlcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgYWJvdmUgPSBNYXRoLk1heChhYm92ZSwgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgeXRvcCA9IGFib3ZlICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xyXG4gICAgICAgICAgICBoZWlnaHQgPSBTaGVldE11c2ljLk5vdGVIZWlnaHQgKiA1ICsgeXRvcCArIGJlbG93O1xyXG4gICAgICAgICAgICBpZiAobHlyaWNzICE9IG51bGwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGhlaWdodCArPSAxMjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLyogQWRkIHNvbWUgZXh0cmEgdmVydGljYWwgc3BhY2UgYmV0d2VlbiB0aGUgbGFzdCB0cmFja1xyXG4gICAgICAgICAgICAgKiBhbmQgZmlyc3QgdHJhY2suXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBpZiAodHJhY2tudW0gPT0gdG90YWx0cmFja3MgLSAxKVxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ICs9IFNoZWV0TXVzaWMuTm90ZUhlaWdodCAqIDM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogQ2FsY3VsYXRlIHRoZSB3aWR0aCBvZiB0aGlzIHN0YWZmICovXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIENhbGN1bGF0ZVdpZHRoKGJvb2wgc2Nyb2xsVmVydClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChzY3JvbGxWZXJ0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB3aWR0aCA9IFNoZWV0TXVzaWMuUGFnZVdpZHRoO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHdpZHRoID0ga2V5c2lnV2lkdGg7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHMgaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgd2lkdGggKz0gcy5XaWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBDYWxjdWxhdGUgdGhlIHN0YXJ0IGFuZCBlbmQgdGltZSBvZiB0aGlzIHN0YWZmLiAqL1xyXG4gICAgICAgIHByaXZhdGUgdm9pZCBDYWxjdWxhdGVTdGFydEVuZFRpbWUoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3RhcnR0aW1lID0gZW5kdGltZSA9IDA7XHJcbiAgICAgICAgICAgIGlmIChzeW1ib2xzLkNvdW50ID09IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdGFydHRpbWUgPSBzeW1ib2xzWzBdLlN0YXJ0VGltZTtcclxuICAgICAgICAgICAgZm9yZWFjaCAoTXVzaWNTeW1ib2wgbSBpbiBzeW1ib2xzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZW5kdGltZSA8IG0uU3RhcnRUaW1lKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuZHRpbWUgPSBtLlN0YXJ0VGltZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChtIGlzIENob3JkU3ltYm9sKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIENob3JkU3ltYm9sIGMgPSAoQ2hvcmRTeW1ib2wpbTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZW5kdGltZSA8IGMuRW5kVGltZSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZHRpbWUgPSBjLkVuZFRpbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIEZ1bGwtSnVzdGlmeSB0aGUgc3ltYm9scywgc28gdGhhdCB0aGV5IGV4cGFuZCB0byBmaWxsIHRoZSB3aG9sZSBzdGFmZi4gKi9cclxuICAgICAgICBwcml2YXRlIHZvaWQgRnVsbEp1c3RpZnkoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHdpZHRoICE9IFNoZWV0TXVzaWMuUGFnZVdpZHRoKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgaW50IHRvdGFsd2lkdGggPSBrZXlzaWdXaWR0aDtcclxuICAgICAgICAgICAgaW50IHRvdGFsc3ltYm9scyA9IDA7XHJcbiAgICAgICAgICAgIGludCBpID0gMDtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlIChpIDwgc3ltYm9scy5Db3VudClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IHN0YXJ0ID0gc3ltYm9sc1tpXS5TdGFydFRpbWU7XHJcbiAgICAgICAgICAgICAgICB0b3RhbHN5bWJvbHMrKztcclxuICAgICAgICAgICAgICAgIHRvdGFsd2lkdGggKz0gc3ltYm9sc1tpXS5XaWR0aDtcclxuICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgc3ltYm9scy5Db3VudCAmJiBzeW1ib2xzW2ldLlN0YXJ0VGltZSA9PSBzdGFydClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0b3RhbHdpZHRoICs9IHN5bWJvbHNbaV0uV2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpbnQgZXh0cmF3aWR0aCA9IChTaGVldE11c2ljLlBhZ2VXaWR0aCAtIHRvdGFsd2lkdGggLSAxKSAvIHRvdGFsc3ltYm9scztcclxuICAgICAgICAgICAgaWYgKGV4dHJhd2lkdGggPiBTaGVldE11c2ljLk5vdGVIZWlnaHQgKiAyKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBleHRyYXdpZHRoID0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpID0gMDtcclxuICAgICAgICAgICAgd2hpbGUgKGkgPCBzeW1ib2xzLkNvdW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgc3RhcnQgPSBzeW1ib2xzW2ldLlN0YXJ0VGltZTtcclxuICAgICAgICAgICAgICAgIHN5bWJvbHNbaV0uV2lkdGggKz0gZXh0cmF3aWR0aDtcclxuICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgc3ltYm9scy5Db3VudCAmJiBzeW1ib2xzW2ldLlN0YXJ0VGltZSA9PSBzdGFydClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogQWRkIHRoZSBseXJpYyBzeW1ib2xzIHRoYXQgb2NjdXIgd2l0aGluIHRoaXMgc3RhZmYuXG4gICAgICAgICAqICBTZXQgdGhlIHgtcG9zaXRpb24gb2YgdGhlIGx5cmljIHN5bWJvbC4gXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyB2b2lkIEFkZEx5cmljcyhMaXN0PEx5cmljU3ltYm9sPiB0cmFja2x5cmljcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0cmFja2x5cmljcyA9PSBudWxsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbHlyaWNzID0gbmV3IExpc3Q8THlyaWNTeW1ib2w+KCk7XHJcbiAgICAgICAgICAgIGludCB4cG9zID0gMDtcclxuICAgICAgICAgICAgaW50IHN5bWJvbGluZGV4ID0gMDtcclxuICAgICAgICAgICAgZm9yZWFjaCAoTHlyaWNTeW1ib2wgbHlyaWMgaW4gdHJhY2tseXJpY3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChseXJpYy5TdGFydFRpbWUgPCBzdGFydHRpbWUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAobHlyaWMuU3RhcnRUaW1lID4gZW5kdGltZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8qIEdldCB0aGUgeC1wb3NpdGlvbiBvZiB0aGlzIGx5cmljICovXHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoc3ltYm9saW5kZXggPCBzeW1ib2xzLkNvdW50ICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgc3ltYm9sc1tzeW1ib2xpbmRleF0uU3RhcnRUaW1lIDwgbHlyaWMuU3RhcnRUaW1lKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHhwb3MgKz0gc3ltYm9sc1tzeW1ib2xpbmRleF0uV2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgc3ltYm9saW5kZXgrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGx5cmljLlggPSB4cG9zO1xyXG4gICAgICAgICAgICAgICAgaWYgKHN5bWJvbGluZGV4IDwgc3ltYm9scy5Db3VudCAmJlxyXG4gICAgICAgICAgICAgICAgICAgIChzeW1ib2xzW3N5bWJvbGluZGV4XSBpcyBCYXJTeW1ib2wpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGx5cmljLlggKz0gU2hlZXRNdXNpYy5Ob3RlV2lkdGg7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBseXJpY3MuQWRkKGx5cmljKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobHlyaWNzLkNvdW50ID09IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGx5cmljcyA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogRHJhdyB0aGUgbHlyaWNzICovXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIERyYXdMeXJpY3MoR3JhcGhpY3MgZywgUGVuIHBlbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8qIFNraXAgdGhlIGxlZnQgc2lkZSBDbGVmIHN5bWJvbCBhbmQga2V5IHNpZ25hdHVyZSAqL1xyXG4gICAgICAgICAgICBpbnQgeHBvcyA9IGtleXNpZ1dpZHRoO1xyXG4gICAgICAgICAgICBpbnQgeXBvcyA9IGhlaWdodCAtIDEyO1xyXG5cclxuICAgICAgICAgICAgZm9yZWFjaCAoTHlyaWNTeW1ib2wgbHlyaWMgaW4gbHlyaWNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnLkRyYXdTdHJpbmcobHlyaWMuVGV4dCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxldHRlckZvbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQnJ1c2hlcy5CbGFjayxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4cG9zICsgbHlyaWMuWCwgeXBvcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBEcmF3IHRoZSBtZWFzdXJlIG51bWJlcnMgZm9yIGVhY2ggbWVhc3VyZSAqL1xyXG4gICAgICAgIHByaXZhdGUgdm9pZCBEcmF3TWVhc3VyZU51bWJlcnMoR3JhcGhpY3MgZywgUGVuIHBlbilcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICAvKiBTa2lwIHRoZSBsZWZ0IHNpZGUgQ2xlZiBzeW1ib2wgYW5kIGtleSBzaWduYXR1cmUgKi9cclxuICAgICAgICAgICAgaW50IHhwb3MgPSBrZXlzaWdXaWR0aDtcclxuICAgICAgICAgICAgaW50IHlwb3MgPSB5dG9wIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMztcclxuXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHMgaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHMgaXMgQmFyU3ltYm9sKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBtZWFzdXJlID0gMSArIHMuU3RhcnRUaW1lIC8gbWVhc3VyZUxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICBnLkRyYXdTdHJpbmcoXCJcIiArIG1lYXN1cmUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGV0dGVyRm9udCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQnJ1c2hlcy5CbGFjayxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHBvcyArIFNoZWV0TXVzaWMuTm90ZVdpZHRoIC8gMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXBvcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB4cG9zICs9IHMuV2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBEcmF3IHRoZSBseXJpY3MgKi9cclxuXHJcblxyXG4gICAgICAgIC8qKiBEcmF3IHRoZSBmaXZlIGhvcml6b250YWwgbGluZXMgb2YgdGhlIHN0YWZmICovXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIERyYXdIb3JpekxpbmVzKEdyYXBoaWNzIGcsIFBlbiBwZW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbnQgbGluZSA9IDE7XHJcbiAgICAgICAgICAgIGludCB5ID0geXRvcCAtIFNoZWV0TXVzaWMuTGluZVdpZHRoO1xyXG4gICAgICAgICAgICBwZW4uV2lkdGggPSAxO1xyXG4gICAgICAgICAgICBmb3IgKGxpbmUgPSAxOyBsaW5lIDw9IDU7IGxpbmUrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIFNoZWV0TXVzaWMuTGVmdE1hcmdpbiwgeSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aCAtIDEsIHkpO1xyXG4gICAgICAgICAgICAgICAgeSArPSBTaGVldE11c2ljLkxpbmVXaWR0aCArIFNoZWV0TXVzaWMuTGluZVNwYWNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBlbi5Db2xvciA9IENvbG9yLkJsYWNrO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBEcmF3IHRoZSB2ZXJ0aWNhbCBsaW5lcyBhdCB0aGUgZmFyIGxlZnQgYW5kIGZhciByaWdodCBzaWRlcy4gKi9cclxuICAgICAgICBwcml2YXRlIHZvaWQgRHJhd0VuZExpbmVzKEdyYXBoaWNzIGcsIFBlbiBwZW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBwZW4uV2lkdGggPSAxO1xyXG5cclxuICAgICAgICAgICAgLyogRHJhdyB0aGUgdmVydGljYWwgbGluZXMgZnJvbSAwIHRvIHRoZSBoZWlnaHQgb2YgdGhpcyBzdGFmZixcclxuICAgICAgICAgICAgICogaW5jbHVkaW5nIHRoZSBzcGFjZSBhYm92ZSBhbmQgYmVsb3cgdGhlIHN0YWZmLCB3aXRoIHR3byBleGNlcHRpb25zOlxyXG4gICAgICAgICAgICAgKiAtIElmIHRoaXMgaXMgdGhlIGZpcnN0IHRyYWNrLCBkb24ndCBzdGFydCBhYm92ZSB0aGUgc3RhZmYuXHJcbiAgICAgICAgICAgICAqICAgU3RhcnQgZXhhY3RseSBhdCB0aGUgdG9wIG9mIHRoZSBzdGFmZiAoeXRvcCAtIExpbmVXaWR0aClcclxuICAgICAgICAgICAgICogLSBJZiB0aGlzIGlzIHRoZSBsYXN0IHRyYWNrLCBkb24ndCBlbmQgYmVsb3cgdGhlIHN0YWZmLlxyXG4gICAgICAgICAgICAgKiAgIEVuZCBleGFjdGx5IGF0IHRoZSBib3R0b20gb2YgdGhlIHN0YWZmLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgaW50IHlzdGFydCwgeWVuZDtcclxuICAgICAgICAgICAgaWYgKHRyYWNrbnVtID09IDApXHJcbiAgICAgICAgICAgICAgICB5c3RhcnQgPSB5dG9wIC0gU2hlZXRNdXNpYy5MaW5lV2lkdGg7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHlzdGFydCA9IDA7XHJcblxyXG4gICAgICAgICAgICBpZiAodHJhY2tudW0gPT0gKHRvdGFsdHJhY2tzIC0gMSkpXHJcbiAgICAgICAgICAgICAgICB5ZW5kID0geXRvcCArIDQgKiBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHllbmQgPSBoZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgU2hlZXRNdXNpYy5MZWZ0TWFyZ2luLCB5c3RhcnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxlZnRNYXJnaW4sIHllbmQpO1xyXG5cclxuICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHdpZHRoIC0gMSwgeXN0YXJ0LCB3aWR0aCAtIDEsIHllbmQpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBEcmF3IHRoaXMgc3RhZmYuIE9ubHkgZHJhdyB0aGUgc3ltYm9scyBpbnNpZGUgdGhlIGNsaXAgYXJlYSAqL1xyXG4gICAgICAgIHB1YmxpYyB2b2lkIERyYXcoR3JhcGhpY3MgZywgUmVjdGFuZ2xlIGNsaXAsIFBlbiBwZW4sIGludCBzZWxlY3Rpb25TdGFydFB1bHNlLCBpbnQgc2VsZWN0aW9uRW5kUHVsc2UsIEJydXNoIGRlc2VsZWN0ZWRCcnVzaClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8qIFNoYWRlIGFueSBkZXNlbGVjdGVkIGFyZWFzICovXHJcbiAgICAgICAgICAgIFNoYWRlU2VsZWN0aW9uQmFja2dyb3VuZChnLCBjbGlwLCBzZWxlY3Rpb25TdGFydFB1bHNlLCBzZWxlY3Rpb25FbmRQdWxzZSwgZGVzZWxlY3RlZEJydXNoKTtcclxuXHJcbiAgICAgICAgICAgIGludCB4cG9zID0gU2hlZXRNdXNpYy5MZWZ0TWFyZ2luICsgNTtcclxuXHJcbiAgICAgICAgICAgIC8qIERyYXcgdGhlIGxlZnQgc2lkZSBDbGVmIHN5bWJvbCAqL1xyXG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSh4cG9zLCAwKTtcclxuICAgICAgICAgICAgY2xlZnN5bS5EcmF3KGcsIHBlbiwgeXRvcCk7XHJcbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC14cG9zLCAwKTtcclxuICAgICAgICAgICAgeHBvcyArPSBjbGVmc3ltLldpZHRoO1xyXG5cclxuICAgICAgICAgICAgLyogRHJhdyB0aGUga2V5IHNpZ25hdHVyZSAqL1xyXG4gICAgICAgICAgICBmb3JlYWNoIChBY2NpZFN5bWJvbCBhIGluIGtleXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKHhwb3MsIDApO1xyXG4gICAgICAgICAgICAgICAgYS5EcmF3KGcsIHBlbiwgeXRvcCk7XHJcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgteHBvcywgMCk7XHJcbiAgICAgICAgICAgICAgICB4cG9zICs9IGEuV2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIERyYXcgdGhlIGFjdHVhbCBub3RlcywgcmVzdHMsIGJhcnMuICBEcmF3IHRoZSBzeW1ib2xzIG9uZSBcclxuICAgICAgICAgICAgICogYWZ0ZXIgYW5vdGhlciwgdXNpbmcgdGhlIHN5bWJvbCB3aWR0aCB0byBkZXRlcm1pbmUgdGhlXHJcbiAgICAgICAgICAgICAqIHggcG9zaXRpb24gb2YgdGhlIG5leHQgc3ltYm9sLlxyXG4gICAgICAgICAgICAgKlxyXG4gICAgICAgICAgICAgKiBGb3IgZmFzdCBwZXJmb3JtYW5jZSwgb25seSBkcmF3IHN5bWJvbHMgdGhhdCBhcmUgaW4gdGhlIGNsaXAgYXJlYS5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHMgaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKEluc2lkZUNsaXBwaW5nKGNsaXAsIHhwb3MsIHMpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKHhwb3MsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgIHMuRHJhdyhnLCBwZW4sIHl0b3ApO1xyXG4gICAgICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC14cG9zLCAwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHhwb3MgKz0gcy5XaWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBEcmF3SG9yaXpMaW5lcyhnLCBwZW4pO1xyXG4gICAgICAgICAgICBEcmF3RW5kTGluZXMoZywgcGVuKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChzaG93TWVhc3VyZXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIERyYXdNZWFzdXJlTnVtYmVycyhnLCBwZW4pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChseXJpY3MgIT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgRHJhd0x5cmljcyhnLCBwZW4pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIElmIGEgc2VsZWN0aW9uIGhhcyBiZWVuIHNwZWNpZmllZCwgc2hhZGUgYWxsIGFyZWFzIHRoYXQgYXJlbid0IGluIHRoZSBzZWxlY3Rpb25cbiAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHZvaWQgU2hhZGVTZWxlY3Rpb25CYWNrZ3JvdW5kKEdyYXBoaWNzIGcsIFJlY3RhbmdsZSBjbGlwLCBpbnQgc2VsZWN0aW9uU3RhcnRQdWxzZSwgaW50IHNlbGVjdGlvbkVuZFB1bHNlLCBCcnVzaCBkZXNlbGVjdGVkQnJ1c2gpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoc2VsZWN0aW9uRW5kUHVsc2UgPT0gMCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgaW50IHhwb3MgPSBrZXlzaWdXaWR0aDtcclxuICAgICAgICAgICAgYm9vbCBsYXN0U3RhdGVGaWxsID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHMgaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKEluc2lkZUNsaXBwaW5nKGNsaXAsIHhwb3MsIHMpICYmIChzLlN0YXJ0VGltZSA8IHNlbGVjdGlvblN0YXJ0UHVsc2UgfHwgcy5TdGFydFRpbWUgPiBzZWxlY3Rpb25FbmRQdWxzZSkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeHBvcyAtIDIsIC0yKTtcclxuICAgICAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZGVzZWxlY3RlZEJydXNoLCAwLCAwLCBzLldpZHRoICsgNCwgdGhpcy5IZWlnaHQgKyA0KTtcclxuICAgICAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKHhwb3MgLSAyKSwgMik7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFN0YXRlRmlsbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFN0YXRlRmlsbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgeHBvcyArPSBzLldpZHRoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChsYXN0U3RhdGVGaWxsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvL3NoYWRlIHRoZSByZXN0IG9mIHRoZSBzdGFmZiBpZiB0aGUgcHJldmlvdXMgc3ltYm9sIHdhcyBzaGFkZWRcclxuICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKHhwb3MgLSAyLCAtMik7XHJcbiAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZGVzZWxlY3RlZEJydXNoLCAwLCAwLCB3aWR0aCAtIHhwb3MsIHRoaXMuSGVpZ2h0ICsgNCk7XHJcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKHhwb3MgLSAyKSwgMik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGJvb2wgSW5zaWRlQ2xpcHBpbmcoUmVjdGFuZ2xlIGNsaXAsIGludCB4cG9zLCBNdXNpY1N5bWJvbCBzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuICh4cG9zIDw9IGNsaXAuWCArIGNsaXAuV2lkdGggKyA1MCkgJiYgKHhwb3MgKyBzLldpZHRoICsgNTAgPj0gY2xpcC5YKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogU2hhZGUgYWxsIHRoZSBjaG9yZHMgcGxheWVkIGluIHRoZSBnaXZlbiB0aW1lLlxuICAgICAgICAgKiAgVW4tc2hhZGUgYW55IGNob3JkcyBzaGFkZWQgaW4gdGhlIHByZXZpb3VzIHB1bHNlIHRpbWUuXG4gICAgICAgICAqICBTdG9yZSB0aGUgeCBjb29yZGluYXRlIGxvY2F0aW9uIHdoZXJlIHRoZSBzaGFkZSB3YXMgZHJhd24uXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBib29sIFNoYWRlTm90ZXMoR3JhcGhpY3MgZywgU29saWRCcnVzaCBzaGFkZUJydXNoLCBQZW4gcGVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50IGN1cnJlbnRQdWxzZVRpbWUsIGludCBwcmV2UHVsc2VUaW1lLCByZWYgaW50IHhfc2hhZGUpXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgLyogSWYgdGhlcmUncyBub3RoaW5nIHRvIHVuc2hhZGUsIG9yIHNoYWRlLCByZXR1cm4gKi9cclxuICAgICAgICAgICAgaWYgKChzdGFydHRpbWUgPiBwcmV2UHVsc2VUaW1lIHx8IGVuZHRpbWUgPCBwcmV2UHVsc2VUaW1lKSAmJlxyXG4gICAgICAgICAgICAgICAgKHN0YXJ0dGltZSA+IGN1cnJlbnRQdWxzZVRpbWUgfHwgZW5kdGltZSA8IGN1cnJlbnRQdWxzZVRpbWUpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIFNraXAgdGhlIGxlZnQgc2lkZSBDbGVmIHN5bWJvbCBhbmQga2V5IHNpZ25hdHVyZSAqL1xyXG4gICAgICAgICAgICBpbnQgeHBvcyA9IGtleXNpZ1dpZHRoO1xyXG5cclxuICAgICAgICAgICAgTXVzaWNTeW1ib2wgY3VyciA9IG51bGw7XHJcbiAgICAgICAgICAgIENob3JkU3ltYm9sIHByZXZDaG9yZCA9IG51bGw7XHJcbiAgICAgICAgICAgIGludCBwcmV2X3hwb3MgPSAwO1xyXG5cclxuICAgICAgICAgICAgLyogTG9vcCB0aHJvdWdoIHRoZSBzeW1ib2xzLiBcclxuICAgICAgICAgICAgICogVW5zaGFkZSBzeW1ib2xzIHdoZXJlIHN0YXJ0IDw9IHByZXZQdWxzZVRpbWUgPCBlbmRcclxuICAgICAgICAgICAgICogU2hhZGUgc3ltYm9scyB3aGVyZSBzdGFydCA8PSBjdXJyZW50UHVsc2VUaW1lIDwgZW5kXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBib29sIHNoYWRlZE5vdGVGb3VuZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHN5bWJvbHMuQ291bnQ7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY3VyciA9IHN5bWJvbHNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAoY3VyciBpcyBCYXJTeW1ib2wpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgeHBvcyArPSBjdXJyLldpZHRoO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGludCBzdGFydCA9IGN1cnIuU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgaW50IGVuZCA9IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAoaSArIDIgPCBzeW1ib2xzLkNvdW50ICYmIHN5bWJvbHNbaSArIDFdIGlzIEJhclN5bWJvbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBlbmQgPSBzeW1ib2xzW2kgKyAyXS5TdGFydFRpbWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpICsgMSA8IHN5bWJvbHMuQ291bnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gc3ltYm9sc1tpICsgMV0uU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IGVuZHRpbWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIC8qIElmIHdlJ3ZlIHBhc3QgdGhlIHByZXZpb3VzIGFuZCBjdXJyZW50IHRpbWVzLCB3ZSdyZSBkb25lLiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKChzdGFydCA+IHByZXZQdWxzZVRpbWUpICYmIChzdGFydCA+IGN1cnJlbnRQdWxzZVRpbWUpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh4X3NoYWRlID09IDApXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4X3NoYWRlID0geHBvcztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzaGFkZWROb3RlRm91bmQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBJZiBzaGFkZWQgbm90ZXMgYXJlIHRoZSBzYW1lLCB3ZSdyZSBkb25lICovXHJcbiAgICAgICAgICAgICAgICBpZiAoKHN0YXJ0IDw9IGN1cnJlbnRQdWxzZVRpbWUpICYmIChjdXJyZW50UHVsc2VUaW1lIDwgZW5kKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgIChzdGFydCA8PSBwcmV2UHVsc2VUaW1lKSAmJiAocHJldlB1bHNlVGltZSA8IGVuZCkpXHJcbiAgICAgICAgICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHhfc2hhZGUgPSB4cG9zO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzaGFkZWROb3RlRm91bmQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyogSWYgc3ltYm9sIGlzIGluIHRoZSBwcmV2aW91cyB0aW1lLCBkcmF3IGEgd2hpdGUgYmFja2dyb3VuZCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKChzdGFydCA8PSBwcmV2UHVsc2VUaW1lKSAmJiAocHJldlB1bHNlVGltZSA8IGVuZCkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeHBvcyAtIDIsIC0yKTtcclxuICAgICAgICAgICAgICAgICAgICBnLkNsZWFyUmVjdGFuZ2xlKDAsIDAsIGN1cnIuV2lkdGggKyA0LCB0aGlzLkhlaWdodCArIDQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0oeHBvcyAtIDIpLCAyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKiBJZiBzeW1ib2wgaXMgaW4gdGhlIGN1cnJlbnQgdGltZSwgZHJhdyBhIHNoYWRlZCBiYWNrZ3JvdW5kICovXHJcbiAgICAgICAgICAgICAgICBpZiAoKHN0YXJ0IDw9IGN1cnJlbnRQdWxzZVRpbWUpICYmIChjdXJyZW50UHVsc2VUaW1lIDwgZW5kKSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB4X3NoYWRlID0geHBvcztcclxuICAgICAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSh4cG9zLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoc2hhZGVCcnVzaCwgMCwgMCwgY3Vyci5XaWR0aCwgdGhpcy5IZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC14cG9zLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICBzaGFkZWROb3RlRm91bmQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHhwb3MgKz0gY3Vyci5XaWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc2hhZGVkTm90ZUZvdW5kO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFJldHVybiB0aGUgcHVsc2UgdGltZSBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlbiBwb2ludC5cbiAgICAgICAgICogIEZpbmQgdGhlIG5vdGVzL3N5bWJvbHMgY29ycmVzcG9uZGluZyB0byB0aGUgeCBwb3NpdGlvbixcbiAgICAgICAgICogIGFuZCByZXR1cm4gdGhlIHN0YXJ0VGltZSAocHVsc2VUaW1lKSBvZiB0aGUgc3ltYm9sLlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgaW50IFB1bHNlVGltZUZvclBvaW50KFBvaW50IHBvaW50KVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIGludCB4cG9zID0ga2V5c2lnV2lkdGg7XHJcbiAgICAgICAgICAgIGludCBwdWxzZVRpbWUgPSBzdGFydHRpbWU7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHN5bSBpbiBzeW1ib2xzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBwdWxzZVRpbWUgPSBzeW0uU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBvaW50LlggPD0geHBvcyArIHN5bS5XaWR0aClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHVsc2VUaW1lO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgeHBvcyArPSBzeW0uV2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHB1bHNlVGltZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3RyaW5nIHJlc3VsdCA9IFwiU3RhZmYgY2xlZj1cIiArIGNsZWZzeW0uVG9TdHJpbmcoKSArIFwiXFxuXCI7XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSBcIiAgS2V5czpcXG5cIjtcclxuICAgICAgICAgICAgZm9yZWFjaCAoQWNjaWRTeW1ib2wgYSBpbiBrZXlzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gXCIgICAgXCIgKyBhLlRvU3RyaW5nKCkgKyBcIlxcblwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSBcIiAgU3ltYm9sczpcXG5cIjtcclxuICAgICAgICAgICAgZm9yZWFjaCAoTXVzaWNTeW1ib2wgcyBpbiBrZXlzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gXCIgICAgXCIgKyBzLlRvU3RyaW5nKCkgKyBcIlxcblwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIG0gaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IFwiICAgIFwiICsgbS5Ub1N0cmluZygpICsgXCJcXG5cIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXN1bHQgKz0gXCJFbmQgU3RhZmZcXG5cIjtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxufVxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbi8qKiBAY2xhc3MgU3RlbVxuICogVGhlIFN0ZW0gY2xhc3MgaXMgdXNlZCBieSBDaG9yZFN5bWJvbCB0byBkcmF3IHRoZSBzdGVtIHBvcnRpb24gb2ZcbiAqIHRoZSBjaG9yZC4gIFRoZSBzdGVtIGhhcyB0aGUgZm9sbG93aW5nIGZpZWxkczpcbiAqXG4gKiBkdXJhdGlvbiAgLSBUaGUgZHVyYXRpb24gb2YgdGhlIHN0ZW0uXG4gKiBkaXJlY3Rpb24gLSBFaXRoZXIgVXAgb3IgRG93blxuICogc2lkZSAgICAgIC0gRWl0aGVyIGxlZnQgb3IgcmlnaHRcbiAqIHRvcCAgICAgICAtIFRoZSB0b3Btb3N0IG5vdGUgaW4gdGhlIGNob3JkXG4gKiBib3R0b20gICAgLSBUaGUgYm90dG9tbW9zdCBub3RlIGluIHRoZSBjaG9yZFxuICogZW5kICAgICAgIC0gVGhlIG5vdGUgcG9zaXRpb24gd2hlcmUgdGhlIHN0ZW0gZW5kcy4gIFRoaXMgaXMgdXN1YWxseVxuICogICAgICAgICAgICAgc2l4IG5vdGVzIHBhc3QgdGhlIGxhc3Qgbm90ZSBpbiB0aGUgY2hvcmQuICBGb3IgOHRoLzE2dGhcbiAqICAgICAgICAgICAgIG5vdGVzLCB0aGUgc3RlbSBtdXN0IGV4dGVuZCBldmVuIG1vcmUuXG4gKlxuICogVGhlIFNoZWV0TXVzaWMgY2xhc3MgY2FuIGNoYW5nZSB0aGUgZGlyZWN0aW9uIG9mIGEgc3RlbSBhZnRlciBpdFxuICogaGFzIGJlZW4gY3JlYXRlZC4gIFRoZSBzaWRlIGFuZCBlbmQgZmllbGRzIG1heSBhbHNvIGNoYW5nZSBkdWUgdG9cbiAqIHRoZSBkaXJlY3Rpb24gY2hhbmdlLiAgQnV0IG90aGVyIGZpZWxkcyB3aWxsIG5vdCBjaGFuZ2UuXG4gKi9cbiBcbnB1YmxpYyBjbGFzcyBTdGVtIHtcbiAgICBwdWJsaWMgY29uc3QgaW50IFVwID0gICAxOyAgICAgIC8qIFRoZSBzdGVtIHBvaW50cyB1cCAqL1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRG93biA9IDI7ICAgICAgLyogVGhlIHN0ZW0gcG9pbnRzIGRvd24gKi9cbiAgICBwdWJsaWMgY29uc3QgaW50IExlZnRTaWRlID0gMTsgIC8qIFRoZSBzdGVtIGlzIHRvIHRoZSBsZWZ0IG9mIHRoZSBub3RlICovXG4gICAgcHVibGljIGNvbnN0IGludCBSaWdodFNpZGUgPSAyOyAvKiBUaGUgc3RlbSBpcyB0byB0aGUgcmlnaHQgb2YgdGhlIG5vdGUgKi9cblxuICAgIHByaXZhdGUgTm90ZUR1cmF0aW9uIGR1cmF0aW9uOyAvKiogRHVyYXRpb24gb2YgdGhlIHN0ZW0uICovXG4gICAgcHJpdmF0ZSBpbnQgZGlyZWN0aW9uOyAgICAgICAgIC8qKiBVcCwgRG93biwgb3IgTm9uZSAqL1xuICAgIHByaXZhdGUgV2hpdGVOb3RlIHRvcDsgICAgICAgICAvKiogVG9wbW9zdCBub3RlIGluIGNob3JkICovXG4gICAgcHJpdmF0ZSBXaGl0ZU5vdGUgYm90dG9tOyAgICAgIC8qKiBCb3R0b21tb3N0IG5vdGUgaW4gY2hvcmQgKi9cbiAgICBwcml2YXRlIFdoaXRlTm90ZSBlbmQ7ICAgICAgICAgLyoqIExvY2F0aW9uIG9mIGVuZCBvZiB0aGUgc3RlbSAqL1xuICAgIHByaXZhdGUgYm9vbCBub3Rlc292ZXJsYXA7ICAgICAvKiogRG8gdGhlIGNob3JkIG5vdGVzIG92ZXJsYXAgKi9cbiAgICBwcml2YXRlIGludCBzaWRlOyAgICAgICAgICAgICAgLyoqIExlZnQgc2lkZSBvciByaWdodCBzaWRlIG9mIG5vdGUgKi9cblxuICAgIHByaXZhdGUgU3RlbSBwYWlyOyAgICAgICAgICAgICAgLyoqIElmIHBhaXIgIT0gbnVsbCwgdGhpcyBpcyBhIGhvcml6b250YWwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBiZWFtIHN0ZW0gdG8gYW5vdGhlciBjaG9yZCAqL1xuICAgIHByaXZhdGUgaW50IHdpZHRoX3RvX3BhaXI7ICAgICAgLyoqIFRoZSB3aWR0aCAoaW4gcGl4ZWxzKSB0byB0aGUgY2hvcmQgcGFpciAqL1xuICAgIHByaXZhdGUgYm9vbCByZWNlaXZlcl9pbl9wYWlyOyAgLyoqIFRoaXMgc3RlbSBpcyB0aGUgcmVjZWl2ZXIgb2YgYSBob3Jpem9udGFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIGJlYW0gc3RlbSBmcm9tIGFub3RoZXIgY2hvcmQuICovXG5cbiAgICAvKiogR2V0L1NldCB0aGUgZGlyZWN0aW9uIG9mIHRoZSBzdGVtIChVcCBvciBEb3duKSAqL1xuICAgIHB1YmxpYyBpbnQgRGlyZWN0aW9uIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIGRpcmVjdGlvbjsgfVxuICAgICAgICBzZXQgeyBDaGFuZ2VEaXJlY3Rpb24odmFsdWUpOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgZHVyYXRpb24gb2YgdGhlIHN0ZW0gKEVpZ3RoLCBTaXh0ZWVudGgsIFRoaXJ0eVNlY29uZCkgKi9cbiAgICBwdWJsaWMgTm90ZUR1cmF0aW9uIER1cmF0aW9uIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIGR1cmF0aW9uOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgdG9wIG5vdGUgaW4gdGhlIGNob3JkLiBUaGlzIGlzIG5lZWRlZCB0byBkZXRlcm1pbmUgdGhlIHN0ZW0gZGlyZWN0aW9uICovXG4gICAgcHVibGljIFdoaXRlTm90ZSBUb3Age1xuICAgICAgICBnZXQgeyByZXR1cm4gdG9wOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgYm90dG9tIG5vdGUgaW4gdGhlIGNob3JkLiBUaGlzIGlzIG5lZWRlZCB0byBkZXRlcm1pbmUgdGhlIHN0ZW0gZGlyZWN0aW9uICovXG4gICAgcHVibGljIFdoaXRlTm90ZSBCb3R0b20ge1xuICAgICAgICBnZXQgeyByZXR1cm4gYm90dG9tOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldC9TZXQgdGhlIGxvY2F0aW9uIHdoZXJlIHRoZSBzdGVtIGVuZHMuICBUaGlzIGlzIHVzdWFsbHkgc2l4IG5vdGVzXG4gICAgICogcGFzdCB0aGUgbGFzdCBub3RlIGluIHRoZSBjaG9yZC4gU2VlIG1ldGhvZCBDYWxjdWxhdGVFbmQuXG4gICAgICovXG4gICAgcHVibGljIFdoaXRlTm90ZSBFbmQge1xuICAgICAgICBnZXQgeyByZXR1cm4gZW5kOyB9XG4gICAgICAgIHNldCB7IGVuZCA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgLyoqIFNldCB0aGlzIFN0ZW0gdG8gYmUgdGhlIHJlY2VpdmVyIG9mIGEgaG9yaXpvbnRhbCBiZWFtLCBhcyBwYXJ0XG4gICAgICogb2YgYSBjaG9yZCBwYWlyLiAgSW4gRHJhdygpLCBpZiB0aGlzIHN0ZW0gaXMgYSByZWNlaXZlciwgd2VcbiAgICAgKiBkb24ndCBkcmF3IGEgY3Vydnkgc3RlbSwgd2Ugb25seSBkcmF3IHRoZSB2ZXJ0aWNhbCBsaW5lLlxuICAgICAqL1xuICAgIHB1YmxpYyBib29sIFJlY2VpdmVyIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHJlY2VpdmVyX2luX3BhaXI7IH1cbiAgICAgICAgc2V0IHsgcmVjZWl2ZXJfaW5fcGFpciA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBzdGVtLiAgVGhlIHRvcCBub3RlLCBib3R0b20gbm90ZSwgYW5kIGRpcmVjdGlvbiBhcmUgXG4gICAgICogbmVlZGVkIGZvciBkcmF3aW5nIHRoZSB2ZXJ0aWNhbCBsaW5lIG9mIHRoZSBzdGVtLiAgVGhlIGR1cmF0aW9uIGlzIFxuICAgICAqIG5lZWRlZCB0byBkcmF3IHRoZSB0YWlsIG9mIHRoZSBzdGVtLiAgVGhlIG92ZXJsYXAgYm9vbGVhbiBpcyB0cnVlXG4gICAgICogaWYgdGhlIG5vdGVzIGluIHRoZSBjaG9yZCBvdmVybGFwLiAgSWYgdGhlIG5vdGVzIG92ZXJsYXAsIHRoZVxuICAgICAqIHN0ZW0gbXVzdCBiZSBkcmF3biBvbiB0aGUgcmlnaHQgc2lkZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgU3RlbShXaGl0ZU5vdGUgYm90dG9tLCBXaGl0ZU5vdGUgdG9wLCBcbiAgICAgICAgICAgICAgICBOb3RlRHVyYXRpb24gZHVyYXRpb24sIGludCBkaXJlY3Rpb24sIGJvb2wgb3ZlcmxhcCkge1xuXG4gICAgICAgIHRoaXMudG9wID0gdG9wO1xuICAgICAgICB0aGlzLmJvdHRvbSA9IGJvdHRvbTtcbiAgICAgICAgdGhpcy5kdXJhdGlvbiA9IGR1cmF0aW9uO1xuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgICAgICAgdGhpcy5ub3Rlc292ZXJsYXAgPSBvdmVybGFwO1xuICAgICAgICBpZiAoZGlyZWN0aW9uID09IFVwIHx8IG5vdGVzb3ZlcmxhcClcbiAgICAgICAgICAgIHNpZGUgPSBSaWdodFNpZGU7XG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICBzaWRlID0gTGVmdFNpZGU7XG4gICAgICAgIGVuZCA9IENhbGN1bGF0ZUVuZCgpO1xuICAgICAgICBwYWlyID0gbnVsbDtcbiAgICAgICAgd2lkdGhfdG9fcGFpciA9IDA7XG4gICAgICAgIHJlY2VpdmVyX2luX3BhaXIgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiogQ2FsY3VsYXRlIHRoZSB2ZXJ0aWNhbCBwb3NpdGlvbiAod2hpdGUgbm90ZSBrZXkpIHdoZXJlIFxuICAgICAqIHRoZSBzdGVtIGVuZHMgXG4gICAgICovXG4gICAgcHVibGljIFdoaXRlTm90ZSBDYWxjdWxhdGVFbmQoKSB7XG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT0gVXApIHtcbiAgICAgICAgICAgIFdoaXRlTm90ZSB3ID0gdG9wO1xuICAgICAgICAgICAgdyA9IHcuQWRkKDYpO1xuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGgpIHtcbiAgICAgICAgICAgICAgICB3ID0gdy5BZGQoMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG4gICAgICAgICAgICAgICAgdyA9IHcuQWRkKDQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGlyZWN0aW9uID09IERvd24pIHtcbiAgICAgICAgICAgIFdoaXRlTm90ZSB3ID0gYm90dG9tO1xuICAgICAgICAgICAgdyA9IHcuQWRkKC02KTtcbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uU2l4dGVlbnRoKSB7XG4gICAgICAgICAgICAgICAgdyA9IHcuQWRkKC0yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcbiAgICAgICAgICAgICAgICB3ID0gdy5BZGQoLTQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDsgIC8qIFNob3VsZG4ndCBoYXBwZW4gKi9cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBDaGFuZ2UgdGhlIGRpcmVjdGlvbiBvZiB0aGUgc3RlbS4gIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGJ5IFxuICAgICAqIENob3JkU3ltYm9sLk1ha2VQYWlyKCkuICBXaGVuIHR3byBjaG9yZHMgYXJlIGpvaW5lZCBieSBhIGhvcml6b250YWxcbiAgICAgKiBiZWFtLCB0aGVpciBzdGVtcyBtdXN0IHBvaW50IGluIHRoZSBzYW1lIGRpcmVjdGlvbiAodXAgb3IgZG93bikuXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgQ2hhbmdlRGlyZWN0aW9uKGludCBuZXdkaXJlY3Rpb24pIHtcbiAgICAgICAgZGlyZWN0aW9uID0gbmV3ZGlyZWN0aW9uO1xuICAgICAgICBpZiAoZGlyZWN0aW9uID09IFVwIHx8IG5vdGVzb3ZlcmxhcClcbiAgICAgICAgICAgIHNpZGUgPSBSaWdodFNpZGU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNpZGUgPSBMZWZ0U2lkZTtcbiAgICAgICAgZW5kID0gQ2FsY3VsYXRlRW5kKCk7XG4gICAgfVxuXG4gICAgLyoqIFBhaXIgdGhpcyBzdGVtIHdpdGggYW5vdGhlciBDaG9yZC4gIEluc3RlYWQgb2YgZHJhd2luZyBhIGN1cnZ5IHRhaWwsXG4gICAgICogdGhpcyBzdGVtIHdpbGwgbm93IGhhdmUgdG8gZHJhdyBhIGJlYW0gdG8gdGhlIGdpdmVuIHN0ZW0gcGFpci4gIFRoZVxuICAgICAqIHdpZHRoIChpbiBwaXhlbHMpIHRvIHRoaXMgc3RlbSBwYWlyIGlzIHBhc3NlZCBhcyBhcmd1bWVudC5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBTZXRQYWlyKFN0ZW0gcGFpciwgaW50IHdpZHRoX3RvX3BhaXIpIHtcbiAgICAgICAgdGhpcy5wYWlyID0gcGFpcjtcbiAgICAgICAgdGhpcy53aWR0aF90b19wYWlyID0gd2lkdGhfdG9fcGFpcjtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRydWUgaWYgdGhpcyBTdGVtIGlzIHBhcnQgb2YgYSBob3Jpem9udGFsIGJlYW0uICovXG4gICAgcHVibGljIGJvb2wgaXNCZWFtIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHJlY2VpdmVyX2luX3BhaXIgfHwgKHBhaXIgIT0gbnVsbCk7IH1cbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGlzIHN0ZW0uXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHkgbG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEBwYXJhbSB0b3BzdGFmZiAgVGhlIG5vdGUgYXQgdGhlIHRvcCBvZiB0aGUgc3RhZmYuXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgRHJhdyhHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCwgV2hpdGVOb3RlIHRvcHN0YWZmKSB7XG4gICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uV2hvbGUpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgRHJhd1ZlcnRpY2FsTGluZShnLCBwZW4sIHl0b3AsIHRvcHN0YWZmKTtcbiAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5RdWFydGVyIHx8IFxuICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZFF1YXJ0ZXIgfHwgXG4gICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uSGFsZiB8fFxuICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEhhbGYgfHxcbiAgICAgICAgICAgIHJlY2VpdmVyX2luX3BhaXIpIHtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhaXIgIT0gbnVsbClcbiAgICAgICAgICAgIERyYXdIb3JpekJhclN0ZW0oZywgcGVuLCB5dG9wLCB0b3BzdGFmZik7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIERyYXdDdXJ2eVN0ZW0oZywgcGVuLCB5dG9wLCB0b3BzdGFmZik7XG4gICAgfVxuXG4gICAgLyoqIERyYXcgdGhlIHZlcnRpY2FsIGxpbmUgb2YgdGhlIHN0ZW0gXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHkgbG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEBwYXJhbSB0b3BzdGFmZiAgVGhlIG5vdGUgYXQgdGhlIHRvcCBvZiB0aGUgc3RhZmYuXG4gICAgICovXG4gICAgcHJpdmF0ZSB2b2lkIERyYXdWZXJ0aWNhbExpbmUoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3AsIFdoaXRlTm90ZSB0b3BzdGFmZikge1xuICAgICAgICBpbnQgeHN0YXJ0O1xuICAgICAgICBpZiAoc2lkZSA9PSBMZWZ0U2lkZSlcbiAgICAgICAgICAgIHhzdGFydCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyAxO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB4c3RhcnQgPSBTaGVldE11c2ljLkxpbmVTcGFjZS80ICsgU2hlZXRNdXNpYy5Ob3RlV2lkdGg7XG5cbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PSBVcCkge1xuICAgICAgICAgICAgaW50IHkxID0geXRvcCArIHRvcHN0YWZmLkRpc3QoYm90dG9tKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yIFxuICAgICAgICAgICAgICAgICAgICAgICArIFNoZWV0TXVzaWMuTm90ZUhlaWdodC80O1xuXG4gICAgICAgICAgICBpbnQgeXN0ZW0gPSB5dG9wICsgdG9wc3RhZmYuRGlzdChlbmQpICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG5cbiAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHkxLCB4c3RhcnQsIHlzdGVtKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkaXJlY3Rpb24gPT0gRG93bikge1xuICAgICAgICAgICAgaW50IHkxID0geXRvcCArIHRvcHN0YWZmLkRpc3QodG9wKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yIFxuICAgICAgICAgICAgICAgICAgICAgICArIFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcblxuICAgICAgICAgICAgaWYgKHNpZGUgPT0gTGVmdFNpZGUpXG4gICAgICAgICAgICAgICAgeTEgPSB5MSAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodC80O1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHkxID0geTEgLSBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcblxuICAgICAgICAgICAgaW50IHlzdGVtID0geXRvcCArIHRvcHN0YWZmLkRpc3QoZW5kKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yIFxuICAgICAgICAgICAgICAgICAgICAgICAgICArIFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcblxuICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeTEsIHhzdGFydCwgeXN0ZW0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIERyYXcgYSBjdXJ2eSBzdGVtIHRhaWwuICBUaGlzIGlzIG9ubHkgdXNlZCBmb3Igc2luZ2xlIGNob3Jkcywgbm90IGNob3JkIHBhaXJzLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5IGxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKiBAcGFyYW0gdG9wc3RhZmYgIFRoZSBub3RlIGF0IHRoZSB0b3Agb2YgdGhlIHN0YWZmLlxuICAgICAqL1xuICAgIHByaXZhdGUgdm9pZCBEcmF3Q3VydnlTdGVtKEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wLCBXaGl0ZU5vdGUgdG9wc3RhZmYpIHtcblxuICAgICAgICBwZW4uV2lkdGggPSAyO1xuXG4gICAgICAgIGludCB4c3RhcnQgPSAwO1xuICAgICAgICBpZiAoc2lkZSA9PSBMZWZ0U2lkZSlcbiAgICAgICAgICAgIHhzdGFydCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyAxO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB4c3RhcnQgPSBTaGVldE11c2ljLkxpbmVTcGFjZS80ICsgU2hlZXRNdXNpYy5Ob3RlV2lkdGg7XG5cbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PSBVcCkge1xuICAgICAgICAgICAgaW50IHlzdGVtID0geXRvcCArIHRvcHN0YWZmLkRpc3QoZW5kKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG5cbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRWlnaHRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UcmlwbGV0IHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0JlemllcihwZW4sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIHlzdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSArIDMqU2hlZXRNdXNpYy5MaW5lU3BhY2UvMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UqMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCozKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHlzdGVtICs9IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcblxuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG5cbiAgICAgICAgICAgICAgICBnLkRyYXdCZXppZXIocGVuLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCB5c3RlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gKyAzKlNoZWV0TXVzaWMuTGluZVNwYWNlLzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlKjIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZS8yLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gKyBTaGVldE11c2ljLk5vdGVIZWlnaHQqMyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHlzdGVtICs9IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG4gICAgICAgICAgICAgICAgZy5EcmF3QmV6aWVyKHBlbiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgeXN0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtICsgMypTaGVldE11c2ljLkxpbmVTcGFjZS8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZSoyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gKyBTaGVldE11c2ljLk5vdGVIZWlnaHQqMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBlbHNlIGlmIChkaXJlY3Rpb24gPT0gRG93bikge1xuICAgICAgICAgICAgaW50IHlzdGVtID0geXRvcCArIHRvcHN0YWZmLkRpc3QoZW5kKSpTaGVldE11c2ljLk5vdGVIZWlnaHQvMiArXG4gICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG5cbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRWlnaHRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UcmlwbGV0IHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0JlemllcihwZW4sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIHlzdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZSoyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gLSBTaGVldE11c2ljLk5vdGVIZWlnaHQqMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyIC0gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB5c3RlbSAtPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG5cbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uU2l4dGVlbnRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRoaXJ0eVNlY29uZCkge1xuXG4gICAgICAgICAgICAgICAgZy5EcmF3QmV6aWVyKHBlbiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgeXN0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlKjIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIgLSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxpbmVTcGFjZS8yKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgeXN0ZW0gLT0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcbiAgICAgICAgICAgICAgICBnLkRyYXdCZXppZXIocGVuLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCB5c3RlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gLSBTaGVldE11c2ljLkxpbmVTcGFjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UqMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gLSBTaGVldE11c2ljLk5vdGVIZWlnaHQqMiAtIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICAgICAgcGVuLldpZHRoID0gMTtcblxuICAgIH1cblxuICAgIC8qIERyYXcgYSBob3Jpem9udGFsIGJlYW0gc3RlbSwgY29ubmVjdGluZyB0aGlzIHN0ZW0gd2l0aCB0aGUgU3RlbSBwYWlyLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5IGxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKiBAcGFyYW0gdG9wc3RhZmYgIFRoZSBub3RlIGF0IHRoZSB0b3Agb2YgdGhlIHN0YWZmLlxuICAgICAqL1xuICAgIHByaXZhdGUgdm9pZCBEcmF3SG9yaXpCYXJTdGVtKEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wLCBXaGl0ZU5vdGUgdG9wc3RhZmYpIHtcbiAgICAgICAgcGVuLldpZHRoID0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG5cbiAgICAgICAgaW50IHhzdGFydCA9IDA7XG4gICAgICAgIGludCB4c3RhcnQyID0gMDtcblxuICAgICAgICBpZiAoc2lkZSA9PSBMZWZ0U2lkZSlcbiAgICAgICAgICAgIHhzdGFydCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyAxO1xuICAgICAgICBlbHNlIGlmIChzaWRlID09IFJpZ2h0U2lkZSlcbiAgICAgICAgICAgIHhzdGFydCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyBTaGVldE11c2ljLk5vdGVXaWR0aDtcblxuICAgICAgICBpZiAocGFpci5zaWRlID09IExlZnRTaWRlKVxuICAgICAgICAgICAgeHN0YXJ0MiA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyAxO1xuICAgICAgICBlbHNlIGlmIChwYWlyLnNpZGUgPT0gUmlnaHRTaWRlKVxuICAgICAgICAgICAgeHN0YXJ0MiA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyBTaGVldE11c2ljLk5vdGVXaWR0aDtcblxuXG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT0gVXApIHtcbiAgICAgICAgICAgIGludCB4ZW5kID0gd2lkdGhfdG9fcGFpciArIHhzdGFydDI7XG4gICAgICAgICAgICBpbnQgeXN0YXJ0ID0geXRvcCArIHRvcHN0YWZmLkRpc3QoZW5kKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICAgICAgaW50IHllbmQgPSB5dG9wICsgdG9wc3RhZmYuRGlzdChwYWlyLmVuZCkgKiBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcblxuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5FaWdodGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoIHx8IFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UcmlwbGV0IHx8IFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG5cbiAgICAgICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5c3RhcnQsIHhlbmQsIHllbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeXN0YXJ0ICs9IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgIHllbmQgKz0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuXG4gICAgICAgICAgICAvKiBBIGRvdHRlZCBlaWdodGggd2lsbCBjb25uZWN0IHRvIGEgMTZ0aCBub3RlLiAqL1xuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGgpIHtcbiAgICAgICAgICAgICAgICBpbnQgeCA9IHhlbmQgLSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICAgICAgZG91YmxlIHNsb3BlID0gKHllbmQgLSB5c3RhcnQpICogMS4wIC8gKHhlbmQgLSB4c3RhcnQpO1xuICAgICAgICAgICAgICAgIGludCB5ID0gKGludCkoc2xvcGUgKiAoeCAtIHhlbmQpICsgeWVuZCk7IFxuXG4gICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHgsIHksIHhlbmQsIHllbmQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHlzdGFydCwgeGVuZCwgeWVuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB5c3RhcnQgKz0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgeWVuZCArPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG4gICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeXN0YXJ0LCB4ZW5kLCB5ZW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaW50IHhlbmQgPSB3aWR0aF90b19wYWlyICsgeHN0YXJ0MjtcbiAgICAgICAgICAgIGludCB5c3RhcnQgPSB5dG9wICsgdG9wc3RhZmYuRGlzdChlbmQpICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgKyBcbiAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICBpbnQgeWVuZCA9IHl0b3AgKyB0b3BzdGFmZi5EaXN0KHBhaXIuZW5kKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yIFxuICAgICAgICAgICAgICAgICAgICAgICAgICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuXG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkVpZ2h0aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVHJpcGxldCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG5cbiAgICAgICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5c3RhcnQsIHhlbmQsIHllbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeXN0YXJ0IC09IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgIHllbmQgLT0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuXG4gICAgICAgICAgICAvKiBBIGRvdHRlZCBlaWdodGggd2lsbCBjb25uZWN0IHRvIGEgMTZ0aCBub3RlLiAqL1xuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGgpIHtcbiAgICAgICAgICAgICAgICBpbnQgeCA9IHhlbmQgLSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICAgICAgZG91YmxlIHNsb3BlID0gKHllbmQgLSB5c3RhcnQpICogMS4wIC8gKHhlbmQgLSB4c3RhcnQpO1xuICAgICAgICAgICAgICAgIGludCB5ID0gKGludCkoc2xvcGUgKiAoeCAtIHhlbmQpICsgeWVuZCk7IFxuXG4gICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHgsIHksIHhlbmQsIHllbmQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHlzdGFydCwgeGVuZCwgeWVuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB5c3RhcnQgLT0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgeWVuZCAtPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG4gICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeXN0YXJ0LCB4ZW5kLCB5ZW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiU3RlbSBkdXJhdGlvbj17MH0gZGlyZWN0aW9uPXsxfSB0b3A9ezJ9IGJvdHRvbT17M30gZW5kPXs0fVwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgb3ZlcmxhcD17NX0gc2lkZT17Nn0gd2lkdGhfdG9fcGFpcj17N30gcmVjZWl2ZXJfaW5fcGFpcj17OH1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHVyYXRpb24sIGRpcmVjdGlvbiwgdG9wLlRvU3RyaW5nKCksIGJvdHRvbS5Ub1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmQuVG9TdHJpbmcoKSwgbm90ZXNvdmVybGFwLCBzaWRlLCB3aWR0aF90b19wYWlyLCByZWNlaXZlcl9pbl9wYWlyKTtcbiAgICB9XG5cbn0gXG5cblxufVxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogQGNsYXNzIFN5bWJvbFdpZHRoc1xuICogVGhlIFN5bWJvbFdpZHRocyBjbGFzcyBpcyB1c2VkIHRvIHZlcnRpY2FsbHkgYWxpZ24gbm90ZXMgaW4gZGlmZmVyZW50XG4gKiB0cmFja3MgdGhhdCBvY2N1ciBhdCB0aGUgc2FtZSB0aW1lICh0aGF0IGhhdmUgdGhlIHNhbWUgc3RhcnR0aW1lKS5cbiAqIFRoaXMgaXMgZG9uZSBieSB0aGUgZm9sbG93aW5nOlxuICogLSBTdG9yZSBhIGxpc3Qgb2YgYWxsIHRoZSBzdGFydCB0aW1lcy5cbiAqIC0gU3RvcmUgdGhlIHdpZHRoIG9mIHN5bWJvbHMgZm9yIGVhY2ggc3RhcnQgdGltZSwgZm9yIGVhY2ggdHJhY2suXG4gKiAtIFN0b3JlIHRoZSBtYXhpbXVtIHdpZHRoIGZvciBlYWNoIHN0YXJ0IHRpbWUsIGFjcm9zcyBhbGwgdHJhY2tzLlxuICogLSBHZXQgdGhlIGV4dHJhIHdpZHRoIG5lZWRlZCBmb3IgZWFjaCB0cmFjayB0byBtYXRjaCB0aGUgbWF4aW11bVxuICogICB3aWR0aCBmb3IgdGhhdCBzdGFydCB0aW1lLlxuICpcbiAqIFNlZSBtZXRob2QgU2hlZXRNdXNpYy5BbGlnblN5bWJvbHMoKSwgd2hpY2ggdXNlcyB0aGlzIGNsYXNzLlxuICovXG5cbnB1YmxpYyBjbGFzcyBTeW1ib2xXaWR0aHMge1xuXG4gICAgLyoqIEFycmF5IG9mIG1hcHMgKHN0YXJ0dGltZSAtPiBzeW1ib2wgd2lkdGgpLCBvbmUgcGVyIHRyYWNrICovXG4gICAgcHJpdmF0ZSBEaWN0aW9uYXJ5PGludCwgaW50PltdIHdpZHRocztcblxuICAgIC8qKiBNYXAgb2Ygc3RhcnR0aW1lIC0+IG1heGltdW0gc3ltYm9sIHdpZHRoICovXG4gICAgcHJpdmF0ZSBEaWN0aW9uYXJ5PGludCwgaW50PiBtYXh3aWR0aHM7XG5cbiAgICAvKiogQW4gYXJyYXkgb2YgYWxsIHRoZSBzdGFydHRpbWVzLCBpbiBhbGwgdHJhY2tzICovXG4gICAgcHJpdmF0ZSBpbnRbXSBzdGFydHRpbWVzO1xuXG5cbiAgICAvKiogSW5pdGlhbGl6ZSB0aGUgc3ltYm9sIHdpZHRoIG1hcHMsIGdpdmVuIGFsbCB0aGUgc3ltYm9scyBpblxuICAgICAqIGFsbCB0aGUgdHJhY2tzLCBwbHVzIHRoZSBseXJpY3MgaW4gYWxsIHRyYWNrcy5cbiAgICAgKi9cbiAgICBwdWJsaWMgU3ltYm9sV2lkdGhzKExpc3Q8TXVzaWNTeW1ib2w+W10gdHJhY2tzLFxuICAgICAgICAgICAgICAgICAgICAgICAgTGlzdDxMeXJpY1N5bWJvbD5bXSB0cmFja2x5cmljcykge1xuXG4gICAgICAgIC8qIEdldCB0aGUgc3ltYm9sIHdpZHRocyBmb3IgYWxsIHRoZSB0cmFja3MgKi9cbiAgICAgICAgd2lkdGhzID0gbmV3IERpY3Rpb25hcnk8aW50LGludD5bIHRyYWNrcy5MZW5ndGggXTtcbiAgICAgICAgZm9yIChpbnQgdHJhY2sgPSAwOyB0cmFjayA8IHRyYWNrcy5MZW5ndGg7IHRyYWNrKyspIHtcbiAgICAgICAgICAgIHdpZHRoc1t0cmFja10gPSBHZXRUcmFja1dpZHRocyh0cmFja3NbdHJhY2tdKTtcbiAgICAgICAgfVxuICAgICAgICBtYXh3aWR0aHMgPSBuZXcgRGljdGlvbmFyeTxpbnQsaW50PigpO1xuXG4gICAgICAgIC8qIENhbGN1bGF0ZSB0aGUgbWF4aW11bSBzeW1ib2wgd2lkdGhzICovXG4gICAgICAgIGZvcmVhY2ggKERpY3Rpb25hcnk8aW50LGludD4gZGljdCBpbiB3aWR0aHMpIHtcbiAgICAgICAgICAgIGZvcmVhY2ggKGludCB0aW1lIGluIGRpY3QuS2V5cykge1xuICAgICAgICAgICAgICAgIGlmICghbWF4d2lkdGhzLkNvbnRhaW5zS2V5KHRpbWUpIHx8XG4gICAgICAgICAgICAgICAgICAgIChtYXh3aWR0aHNbdGltZV0gPCBkaWN0W3RpbWVdKSApIHtcblxuICAgICAgICAgICAgICAgICAgICBtYXh3aWR0aHNbdGltZV0gPSBkaWN0W3RpbWVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0cmFja2x5cmljcyAhPSBudWxsKSB7XG4gICAgICAgICAgICBmb3JlYWNoIChMaXN0PEx5cmljU3ltYm9sPiBseXJpY3MgaW4gdHJhY2tseXJpY3MpIHtcbiAgICAgICAgICAgICAgICBpZiAobHlyaWNzID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKEx5cmljU3ltYm9sIGx5cmljIGluIGx5cmljcykge1xuICAgICAgICAgICAgICAgICAgICBpbnQgd2lkdGggPSBseXJpYy5NaW5XaWR0aDtcbiAgICAgICAgICAgICAgICAgICAgaW50IHRpbWUgPSBseXJpYy5TdGFydFRpbWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICghbWF4d2lkdGhzLkNvbnRhaW5zS2V5KHRpbWUpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAobWF4d2lkdGhzW3RpbWVdIDwgd2lkdGgpICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXh3aWR0aHNbdGltZV0gPSB3aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFN0b3JlIGFsbCB0aGUgc3RhcnQgdGltZXMgdG8gdGhlIHN0YXJ0dGltZSBhcnJheSAqL1xuICAgICAgICBzdGFydHRpbWVzID0gbmV3IGludFsgbWF4d2lkdGhzLktleXMuQ291bnQgXTtcbiAgICAgICAgbWF4d2lkdGhzLktleXMuQ29weVRvKHN0YXJ0dGltZXMsIDApO1xuICAgICAgICBBcnJheS5Tb3J0PGludD4oc3RhcnR0aW1lcyk7XG4gICAgfVxuXG4gICAgLyoqIENyZWF0ZSBhIHRhYmxlIG9mIHRoZSBzeW1ib2wgd2lkdGhzIGZvciBlYWNoIHN0YXJ0dGltZSBpbiB0aGUgdHJhY2suICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgRGljdGlvbmFyeTxpbnQsaW50PiBHZXRUcmFja1dpZHRocyhMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzKSB7XG4gICAgICAgIERpY3Rpb25hcnk8aW50LGludD4gd2lkdGhzID0gbmV3IERpY3Rpb25hcnk8aW50LGludD4oKTtcblxuICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBtIGluIHN5bWJvbHMpIHtcbiAgICAgICAgICAgIGludCBzdGFydCA9IG0uU3RhcnRUaW1lO1xuICAgICAgICAgICAgaW50IHcgPSBtLk1pbldpZHRoO1xuXG4gICAgICAgICAgICBpZiAobSBpcyBCYXJTeW1ib2wpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHdpZHRocy5Db250YWluc0tleShzdGFydCkpIHtcbiAgICAgICAgICAgICAgICB3aWR0aHNbc3RhcnRdICs9IHc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB3aWR0aHNbc3RhcnRdID0gdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gd2lkdGhzO1xuICAgIH1cblxuICAgIC8qKiBHaXZlbiBhIHRyYWNrIGFuZCBhIHN0YXJ0IHRpbWUsIHJldHVybiB0aGUgZXh0cmEgd2lkdGggbmVlZGVkIHNvIHRoYXRcbiAgICAgKiB0aGUgc3ltYm9scyBmb3IgdGhhdCBzdGFydCB0aW1lIGFsaWduIHdpdGggdGhlIG90aGVyIHRyYWNrcy5cbiAgICAgKi9cbiAgICBwdWJsaWMgaW50IEdldEV4dHJhV2lkdGgoaW50IHRyYWNrLCBpbnQgc3RhcnQpIHtcbiAgICAgICAgaWYgKCF3aWR0aHNbdHJhY2tdLkNvbnRhaW5zS2V5KHN0YXJ0KSkge1xuICAgICAgICAgICAgcmV0dXJuIG1heHdpZHRoc1tzdGFydF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbWF4d2lkdGhzW3N0YXJ0XSAtIHdpZHRoc1t0cmFja11bc3RhcnRdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiBhbiBhcnJheSBvZiBhbGwgdGhlIHN0YXJ0IHRpbWVzIGluIGFsbCB0aGUgdHJhY2tzICovXG4gICAgcHVibGljIGludFtdIFN0YXJ0VGltZXMge1xuICAgICAgICBnZXQgeyByZXR1cm4gc3RhcnR0aW1lczsgfVxuICAgIH1cblxuXG5cblxufVxuXG5cbn1cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMSBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIFRoZSBwb3NzaWJsZSBub3RlIGR1cmF0aW9ucyAqL1xucHVibGljIGVudW0gTm90ZUR1cmF0aW9uIHtcbiAgVGhpcnR5U2Vjb25kLCBTaXh0ZWVudGgsIFRyaXBsZXQsIEVpZ2h0aCxcbiAgRG90dGVkRWlnaHRoLCBRdWFydGVyLCBEb3R0ZWRRdWFydGVyLFxuICBIYWxmLCBEb3R0ZWRIYWxmLCBXaG9sZVxufTtcblxuLyoqIEBjbGFzcyBUaW1lU2lnbmF0dXJlXG4gKiBUaGUgVGltZVNpZ25hdHVyZSBjbGFzcyByZXByZXNlbnRzXG4gKiAtIFRoZSB0aW1lIHNpZ25hdHVyZSBvZiB0aGUgc29uZywgc3VjaCBhcyA0LzQsIDMvNCwgb3IgNi84IHRpbWUsIGFuZFxuICogLSBUaGUgbnVtYmVyIG9mIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlXG4gKiAtIFRoZSBudW1iZXIgb2YgbWljcm9zZWNvbmRzIHBlciBxdWFydGVyIG5vdGVcbiAqXG4gKiBJbiBtaWRpIGZpbGVzLCBhbGwgdGltZSBpcyBtZWFzdXJlZCBpbiBcInB1bHNlc1wiLiAgRWFjaCBub3RlIGhhc1xuICogYSBzdGFydCB0aW1lIChtZWFzdXJlZCBpbiBwdWxzZXMpLCBhbmQgYSBkdXJhdGlvbiAobWVhc3VyZWQgaW4gXG4gKiBwdWxzZXMpLiAgVGhpcyBjbGFzcyBpcyB1c2VkIG1haW5seSB0byBjb252ZXJ0IHB1bHNlIGR1cmF0aW9uc1xuICogKGxpa2UgMTIwLCAyNDAsIGV0YykgaW50byBub3RlIGR1cmF0aW9ucyAoaGFsZiwgcXVhcnRlciwgZWlnaHRoLCBldGMpLlxuICovXG5cbnB1YmxpYyBjbGFzcyBUaW1lU2lnbmF0dXJlIHtcbiAgICBwcml2YXRlIGludCBudW1lcmF0b3I7ICAgICAgLyoqIE51bWVyYXRvciBvZiB0aGUgdGltZSBzaWduYXR1cmUgKi9cbiAgICBwcml2YXRlIGludCBkZW5vbWluYXRvcjsgICAgLyoqIERlbm9taW5hdG9yIG9mIHRoZSB0aW1lIHNpZ25hdHVyZSAqL1xuICAgIHByaXZhdGUgaW50IHF1YXJ0ZXJub3RlOyAgICAvKiogTnVtYmVyIG9mIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlICovXG4gICAgcHJpdmF0ZSBpbnQgbWVhc3VyZTsgICAgICAgIC8qKiBOdW1iZXIgb2YgcHVsc2VzIHBlciBtZWFzdXJlICovXG4gICAgcHJpdmF0ZSBpbnQgdGVtcG87ICAgICAgICAgIC8qKiBOdW1iZXIgb2YgbWljcm9zZWNvbmRzIHBlciBxdWFydGVyIG5vdGUgKi9cblxuICAgIC8qKiBHZXQgdGhlIG51bWVyYXRvciBvZiB0aGUgdGltZSBzaWduYXR1cmUgKi9cbiAgICBwdWJsaWMgaW50IE51bWVyYXRvciB7XG4gICAgICAgIGdldCB7IHJldHVybiBudW1lcmF0b3I7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBkZW5vbWluYXRvciBvZiB0aGUgdGltZSBzaWduYXR1cmUgKi9cbiAgICBwdWJsaWMgaW50IERlbm9taW5hdG9yIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIGRlbm9taW5hdG9yOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlICovXG4gICAgcHVibGljIGludCBRdWFydGVyIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHF1YXJ0ZXJub3RlOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHB1bHNlcyBwZXIgbWVhc3VyZSAqL1xuICAgIHB1YmxpYyBpbnQgTWVhc3VyZSB7XG4gICAgICAgIGdldCB7IHJldHVybiBtZWFzdXJlOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIG1pY3Jvc2Vjb25kcyBwZXIgcXVhcnRlciBub3RlICovIFxuICAgIHB1YmxpYyBpbnQgVGVtcG8ge1xuICAgICAgICBnZXQgeyByZXR1cm4gdGVtcG87IH1cbiAgICB9XG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IHRpbWUgc2lnbmF0dXJlLCB3aXRoIHRoZSBnaXZlbiBudW1lcmF0b3IsXG4gICAgICogZGVub21pbmF0b3IsIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlLCBhbmQgdGVtcG8uXG4gICAgICovXG4gICAgcHVibGljIFRpbWVTaWduYXR1cmUoaW50IG51bWVyYXRvciwgaW50IGRlbm9taW5hdG9yLCBpbnQgcXVhcnRlcm5vdGUsIGludCB0ZW1wbykge1xuICAgICAgICBpZiAobnVtZXJhdG9yIDw9IDAgfHwgZGVub21pbmF0b3IgPD0gMCB8fCBxdWFydGVybm90ZSA8PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXCJJbnZhbGlkIHRpbWUgc2lnbmF0dXJlXCIsIDApO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogTWlkaSBGaWxlIGdpdmVzIHdyb25nIHRpbWUgc2lnbmF0dXJlIHNvbWV0aW1lcyAqL1xuICAgICAgICBpZiAobnVtZXJhdG9yID09IDUpIHtcbiAgICAgICAgICAgIG51bWVyYXRvciA9IDQ7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm51bWVyYXRvciA9IG51bWVyYXRvcjtcbiAgICAgICAgdGhpcy5kZW5vbWluYXRvciA9IGRlbm9taW5hdG9yO1xuICAgICAgICB0aGlzLnF1YXJ0ZXJub3RlID0gcXVhcnRlcm5vdGU7XG4gICAgICAgIHRoaXMudGVtcG8gPSB0ZW1wbztcblxuICAgICAgICBpbnQgYmVhdDtcbiAgICAgICAgaWYgKGRlbm9taW5hdG9yIDwgNClcbiAgICAgICAgICAgIGJlYXQgPSBxdWFydGVybm90ZSAqIDI7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJlYXQgPSBxdWFydGVybm90ZSAvIChkZW5vbWluYXRvci80KTtcblxuICAgICAgICBtZWFzdXJlID0gbnVtZXJhdG9yICogYmVhdDtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHdoaWNoIG1lYXN1cmUgdGhlIGdpdmVuIHRpbWUgKGluIHB1bHNlcykgYmVsb25ncyB0by4gKi9cbiAgICBwdWJsaWMgaW50IEdldE1lYXN1cmUoaW50IHRpbWUpIHtcbiAgICAgICAgcmV0dXJuIHRpbWUgLyBtZWFzdXJlO1xuICAgIH1cblxuICAgIC8qKiBHaXZlbiBhIGR1cmF0aW9uIGluIHB1bHNlcywgcmV0dXJuIHRoZSBjbG9zZXN0IG5vdGUgZHVyYXRpb24uICovXG4gICAgcHVibGljIE5vdGVEdXJhdGlvbiBHZXROb3RlRHVyYXRpb24oaW50IGR1cmF0aW9uKSB7XG4gICAgICAgIGludCB3aG9sZSA9IHF1YXJ0ZXJub3RlICogNDtcblxuICAgICAgICAvKipcbiAgICAgICAgIDEgICAgICAgPSAzMi8zMlxuICAgICAgICAgMy80ICAgICA9IDI0LzMyXG4gICAgICAgICAxLzIgICAgID0gMTYvMzJcbiAgICAgICAgIDMvOCAgICAgPSAxMi8zMlxuICAgICAgICAgMS80ICAgICA9ICA4LzMyXG4gICAgICAgICAzLzE2ICAgID0gIDYvMzJcbiAgICAgICAgIDEvOCAgICAgPSAgNC8zMiA9ICAgIDgvNjRcbiAgICAgICAgIHRyaXBsZXQgICAgICAgICA9IDUuMzMvNjRcbiAgICAgICAgIDEvMTYgICAgPSAgMi8zMiA9ICAgIDQvNjRcbiAgICAgICAgIDEvMzIgICAgPSAgMS8zMiA9ICAgIDIvNjRcbiAgICAgICAgICoqLyBcblxuICAgICAgICBpZiAgICAgIChkdXJhdGlvbiA+PSAyOCp3aG9sZS8zMilcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uV2hvbGU7XG4gICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID49IDIwKndob2xlLzMyKSBcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uRG90dGVkSGFsZjtcbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPj0gMTQqd2hvbGUvMzIpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLkhhbGY7XG4gICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID49IDEwKndob2xlLzMyKVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5Eb3R0ZWRRdWFydGVyO1xuICAgICAgICBlbHNlIGlmIChkdXJhdGlvbiA+PSAgNyp3aG9sZS8zMilcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uUXVhcnRlcjtcbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPj0gIDUqd2hvbGUvMzIpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aDtcbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPj0gIDYqd2hvbGUvNjQpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLkVpZ2h0aDtcbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPj0gIDUqd2hvbGUvNjQpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLlRyaXBsZXQ7XG4gICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID49ICAzKndob2xlLzY0KVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5TaXh0ZWVudGg7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kO1xuICAgIH1cblxuICAgIC8qKiBDb252ZXJ0IGEgbm90ZSBkdXJhdGlvbiBpbnRvIGEgc3RlbSBkdXJhdGlvbi4gIERvdHRlZCBkdXJhdGlvbnNcbiAgICAgKiBhcmUgY29udmVydGVkIGludG8gdGhlaXIgbm9uLWRvdHRlZCBlcXVpdmFsZW50cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIE5vdGVEdXJhdGlvbiBHZXRTdGVtRHVyYXRpb24oTm90ZUR1cmF0aW9uIGR1cikge1xuICAgICAgICBpZiAoZHVyID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRIYWxmKVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5IYWxmO1xuICAgICAgICBlbHNlIGlmIChkdXIgPT0gTm90ZUR1cmF0aW9uLkRvdHRlZFF1YXJ0ZXIpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLlF1YXJ0ZXI7XG4gICAgICAgIGVsc2UgaWYgKGR1ciA9PSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoKVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5FaWdodGg7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBkdXI7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgdGltZSBwZXJpb2QgKGluIHB1bHNlcykgdGhlIHRoZSBnaXZlbiBkdXJhdGlvbiBzcGFucyAqL1xuICAgIHB1YmxpYyBpbnQgRHVyYXRpb25Ub1RpbWUoTm90ZUR1cmF0aW9uIGR1cikge1xuICAgICAgICBpbnQgZWlnaHRoID0gcXVhcnRlcm5vdGUvMjtcbiAgICAgICAgaW50IHNpeHRlZW50aCA9IGVpZ2h0aC8yO1xuXG4gICAgICAgIHN3aXRjaCAoZHVyKSB7XG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5XaG9sZTogICAgICAgICByZXR1cm4gcXVhcnRlcm5vdGUgKiA0OyBcbiAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkRvdHRlZEhhbGY6ICAgIHJldHVybiBxdWFydGVybm90ZSAqIDM7IFxuICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uSGFsZjogICAgICAgICAgcmV0dXJuIHF1YXJ0ZXJub3RlICogMjsgXG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5Eb3R0ZWRRdWFydGVyOiByZXR1cm4gMyplaWdodGg7IFxuICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uUXVhcnRlcjogICAgICAgcmV0dXJuIHF1YXJ0ZXJub3RlOyBcbiAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aDogIHJldHVybiAzKnNpeHRlZW50aDtcbiAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkVpZ2h0aDogICAgICAgIHJldHVybiBlaWdodGg7XG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5UcmlwbGV0OiAgICAgICByZXR1cm4gcXVhcnRlcm5vdGUvMzsgXG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5TaXh0ZWVudGg6ICAgICByZXR1cm4gc2l4dGVlbnRoO1xuICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kOiAgcmV0dXJuIHNpeHRlZW50aC8yOyBcbiAgICAgICAgICAgIGRlZmF1bHQ6ICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgb3ZlcnJpZGUgXG4gICAgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gc3RyaW5nLkZvcm1hdChcIlRpbWVTaWduYXR1cmU9ezB9L3sxfSBxdWFydGVyPXsyfSB0ZW1wbz17M31cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtZXJhdG9yLCBkZW5vbWluYXRvciwgcXVhcnRlcm5vdGUsIHRlbXBvKTtcbiAgICB9XG4gICAgXG59XG5cbn1cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG5cbi8qKiBBY2NpZGVudGFscyAqL1xucHVibGljIGVudW0gQWNjaWQge1xuICAgIE5vbmUsIFNoYXJwLCBGbGF0LCBOYXR1cmFsXG59XG5cbi8qKiBAY2xhc3MgQWNjaWRTeW1ib2xcbiAqIEFuIGFjY2lkZW50YWwgKGFjY2lkKSBzeW1ib2wgcmVwcmVzZW50cyBhIHNoYXJwLCBmbGF0LCBvciBuYXR1cmFsXG4gKiBhY2NpZGVudGFsIHRoYXQgaXMgZGlzcGxheWVkIGF0IGEgc3BlY2lmaWMgcG9zaXRpb24gKG5vdGUgYW5kIGNsZWYpLlxuICovXG5wdWJsaWMgY2xhc3MgQWNjaWRTeW1ib2wgOiBNdXNpY1N5bWJvbCB7XG4gICAgcHJpdmF0ZSBBY2NpZCBhY2NpZDsgICAgICAgICAgLyoqIFRoZSBhY2NpZGVudGFsIChzaGFycCwgZmxhdCwgbmF0dXJhbCkgKi9cbiAgICBwcml2YXRlIFdoaXRlTm90ZSB3aGl0ZW5vdGU7ICAvKiogVGhlIHdoaXRlIG5vdGUgd2hlcmUgdGhlIHN5bWJvbCBvY2N1cnMgKi9cbiAgICBwcml2YXRlIENsZWYgY2xlZjsgICAgICAgICAgICAvKiogV2hpY2ggY2xlZiB0aGUgc3ltYm9scyBpcyBpbiAqL1xuICAgIHByaXZhdGUgaW50IHdpZHRoOyAgICAgICAgICAgIC8qKiBXaWR0aCBvZiBzeW1ib2wgKi9cblxuICAgIC8qKiBcbiAgICAgKiBDcmVhdGUgYSBuZXcgQWNjaWRTeW1ib2wgd2l0aCB0aGUgZ2l2ZW4gYWNjaWRlbnRhbCwgdGhhdCBpc1xuICAgICAqIGRpc3BsYXllZCBhdCB0aGUgZ2l2ZW4gbm90ZSBpbiB0aGUgZ2l2ZW4gY2xlZi5cbiAgICAgKi9cbiAgICBwdWJsaWMgQWNjaWRTeW1ib2woQWNjaWQgYWNjaWQsIFdoaXRlTm90ZSBub3RlLCBDbGVmIGNsZWYpIHtcbiAgICAgICAgdGhpcy5hY2NpZCA9IGFjY2lkO1xuICAgICAgICB0aGlzLndoaXRlbm90ZSA9IG5vdGU7XG4gICAgICAgIHRoaXMuY2xlZiA9IGNsZWY7XG4gICAgICAgIHdpZHRoID0gTWluV2lkdGg7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgd2hpdGUgbm90ZSB0aGlzIGFjY2lkZW50YWwgaXMgZGlzcGxheWVkIGF0ICovXG4gICAgcHVibGljIFdoaXRlTm90ZSBOb3RlICB7XG4gICAgICAgIGdldCB7IHJldHVybiB3aGl0ZW5vdGU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSB0aW1lIChpbiBwdWxzZXMpIHRoaXMgc3ltYm9sIG9jY3VycyBhdC5cbiAgICAgKiBOb3QgdXNlZC4gIEluc3RlYWQsIHRoZSBTdGFydFRpbWUgb2YgdGhlIENob3JkU3ltYm9sIGNvbnRhaW5pbmcgdGhpc1xuICAgICAqIEFjY2lkU3ltYm9sIGlzIHVzZWQuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBTdGFydFRpbWUgeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIC0xOyB9ICBcbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBtaW5pbXVtIHdpZHRoIChpbiBwaXhlbHMpIG5lZWRlZCB0byBkcmF3IHRoaXMgc3ltYm9sICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBNaW5XaWR0aCB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gMypTaGVldE11c2ljLk5vdGVIZWlnaHQvMjsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQvU2V0IHRoZSB3aWR0aCAoaW4gcGl4ZWxzKSBvZiB0aGlzIHN5bWJvbC4gVGhlIHdpZHRoIGlzIHNldFxuICAgICAqIGluIFNoZWV0TXVzaWMuQWxpZ25TeW1ib2xzKCkgdG8gdmVydGljYWxseSBhbGlnbiBzeW1ib2xzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgV2lkdGgge1xuICAgICAgICBnZXQgeyByZXR1cm4gd2lkdGg7IH1cbiAgICAgICAgc2V0IHsgd2lkdGggPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBhYm92ZSB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBBYm92ZVN0YWZmIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIEdldEFib3ZlU3RhZmYoKTsgfVxuICAgIH1cblxuICAgIGludCBHZXRBYm92ZVN0YWZmKCkge1xuICAgICAgICBpbnQgZGlzdCA9IFdoaXRlTm90ZS5Ub3AoY2xlZikuRGlzdCh3aGl0ZW5vdGUpICogXG4gICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG4gICAgICAgIGlmIChhY2NpZCA9PSBBY2NpZC5TaGFycCB8fCBhY2NpZCA9PSBBY2NpZC5OYXR1cmFsKVxuICAgICAgICAgICAgZGlzdCAtPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgIGVsc2UgaWYgKGFjY2lkID09IEFjY2lkLkZsYXQpXG4gICAgICAgICAgICBkaXN0IC09IDMqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG5cbiAgICAgICAgaWYgKGRpc3QgPCAwKVxuICAgICAgICAgICAgcmV0dXJuIC1kaXN0O1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYmVsb3cgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQmVsb3dTdGFmZiB7XG4gICAgICAgIGdldCB7IHJldHVybiBHZXRCZWxvd1N0YWZmKCk7IH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGludCBHZXRCZWxvd1N0YWZmKCkge1xuICAgICAgICBpbnQgZGlzdCA9IFdoaXRlTm90ZS5Cb3R0b20oY2xlZikuRGlzdCh3aGl0ZW5vdGUpICogXG4gICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgKyBcbiAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgIGlmIChhY2NpZCA9PSBBY2NpZC5TaGFycCB8fCBhY2NpZCA9PSBBY2NpZC5OYXR1cmFsKSBcbiAgICAgICAgICAgIGRpc3QgKz0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuXG4gICAgICAgIGlmIChkaXN0ID4gMClcbiAgICAgICAgICAgIHJldHVybiBkaXN0O1xuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgLyoqIERyYXcgdGhlIHN5bWJvbC5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIC8qIEFsaWduIHRoZSBzeW1ib2wgdG8gdGhlIHJpZ2h0ICovXG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKFdpZHRoIC0gTWluV2lkdGgsIDApO1xuXG4gICAgICAgIC8qIFN0b3JlIHRoZSB5LXBpeGVsIHZhbHVlIG9mIHRoZSB0b3Agb2YgdGhlIHdoaXRlbm90ZSBpbiB5bm90ZS4gKi9cbiAgICAgICAgaW50IHlub3RlID0geXRvcCArIFdoaXRlTm90ZS5Ub3AoY2xlZikuRGlzdCh3aGl0ZW5vdGUpICogXG4gICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG4gICAgICAgIGlmIChhY2NpZCA9PSBBY2NpZC5TaGFycClcbiAgICAgICAgICAgIERyYXdTaGFycChnLCBwZW4sIHlub3RlKTtcbiAgICAgICAgZWxzZSBpZiAoYWNjaWQgPT0gQWNjaWQuRmxhdClcbiAgICAgICAgICAgIERyYXdGbGF0KGcsIHBlbiwgeW5vdGUpO1xuICAgICAgICBlbHNlIGlmIChhY2NpZCA9PSBBY2NpZC5OYXR1cmFsKVxuICAgICAgICAgICAgRHJhd05hdHVyYWwoZywgcGVuLCB5bm90ZSk7XG5cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShXaWR0aCAtIE1pbldpZHRoKSwgMCk7XG4gICAgfVxuXG4gICAgLyoqIERyYXcgYSBzaGFycCBzeW1ib2wuIFxuICAgICAqIEBwYXJhbSB5bm90ZSBUaGUgcGl4ZWwgbG9jYXRpb24gb2YgdGhlIHRvcCBvZiB0aGUgYWNjaWRlbnRhbCdzIG5vdGUuIFxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIERyYXdTaGFycChHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeW5vdGUpIHtcblxuICAgICAgICAvKiBEcmF3IHRoZSB0d28gdmVydGljYWwgbGluZXMgKi9cbiAgICAgICAgaW50IHlzdGFydCA9IHlub3RlIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICBpbnQgeWVuZCA9IHlub3RlICsgMipTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgIGludCB4ID0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCB4LCB5c3RhcnQgKyAyLCB4LCB5ZW5kKTtcbiAgICAgICAgeCArPSBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHgsIHlzdGFydCwgeCwgeWVuZCAtIDIpO1xuXG4gICAgICAgIC8qIERyYXcgdGhlIHNsaWdodGx5IHVwd2FyZHMgaG9yaXpvbnRhbCBsaW5lcyAqL1xuICAgICAgICBpbnQgeHN0YXJ0ID0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgLSBTaGVldE11c2ljLk5vdGVIZWlnaHQvNDtcbiAgICAgICAgaW50IHhlbmQgPSBTaGVldE11c2ljLk5vdGVIZWlnaHQgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQvNDtcbiAgICAgICAgeXN0YXJ0ID0geW5vdGUgKyBTaGVldE11c2ljLkxpbmVXaWR0aDtcbiAgICAgICAgeWVuZCA9IHlzdGFydCAtIFNoZWV0TXVzaWMuTGluZVdpZHRoIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNDtcbiAgICAgICAgcGVuLldpZHRoID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvMjtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeXN0YXJ0LCB4ZW5kLCB5ZW5kKTtcbiAgICAgICAgeXN0YXJ0ICs9IFNoZWV0TXVzaWMuTGluZVNwYWNlO1xuICAgICAgICB5ZW5kICs9IFNoZWV0TXVzaWMuTGluZVNwYWNlO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5c3RhcnQsIHhlbmQsIHllbmQpO1xuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgIH1cblxuICAgIC8qKiBEcmF3IGEgZmxhdCBzeW1ib2wuXG4gICAgICogQHBhcmFtIHlub3RlIFRoZSBwaXhlbCBsb2NhdGlvbiBvZiB0aGUgdG9wIG9mIHRoZSBhY2NpZGVudGFsJ3Mgbm90ZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3RmxhdChHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeW5vdGUpIHtcbiAgICAgICAgaW50IHggPSBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuXG4gICAgICAgIC8qIERyYXcgdGhlIHZlcnRpY2FsIGxpbmUgKi9cbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHgsIHlub3RlIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0IC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIsXG4gICAgICAgICAgICAgICAgICAgICAgICB4LCB5bm90ZSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCk7XG5cbiAgICAgICAgLyogRHJhdyAzIGJlemllciBjdXJ2ZXMuXG4gICAgICAgICAqIEFsbCAzIGN1cnZlcyBzdGFydCBhbmQgc3RvcCBhdCB0aGUgc2FtZSBwb2ludHMuXG4gICAgICAgICAqIEVhY2ggc3Vic2VxdWVudCBjdXJ2ZSBidWxnZXMgbW9yZSBhbmQgbW9yZSB0b3dhcmRzIFxuICAgICAgICAgKiB0aGUgdG9wcmlnaHQgY29ybmVyLCBtYWtpbmcgdGhlIGN1cnZlIGxvb2sgdGhpY2tlclxuICAgICAgICAgKiB0b3dhcmRzIHRoZSB0b3AtcmlnaHQuXG4gICAgICAgICAqL1xuICAgICAgICBnLkRyYXdCZXppZXIocGVuLCB4LCB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQsXG4gICAgICAgICAgICB4ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMiwgeW5vdGUgLSBTaGVldE11c2ljLkxpbmVTcGFjZS8yLFxuICAgICAgICAgICAgeCArIFNoZWV0TXVzaWMuTGluZVNwYWNlLCB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzMsXG4gICAgICAgICAgICB4LCB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlICsgU2hlZXRNdXNpYy5MaW5lV2lkdGggKyAxKTtcblxuICAgICAgICBnLkRyYXdCZXppZXIocGVuLCB4LCB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQsXG4gICAgICAgICAgICB4ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMiwgeW5vdGUgLSBTaGVldE11c2ljLkxpbmVTcGFjZS8yLFxuICAgICAgICAgICAgeCArIFNoZWV0TXVzaWMuTGluZVNwYWNlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCwgXG4gICAgICAgICAgICAgIHlub3RlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMyAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQsXG4gICAgICAgICAgICB4LCB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlICsgU2hlZXRNdXNpYy5MaW5lV2lkdGggKyAxKTtcblxuXG4gICAgICAgIGcuRHJhd0JlemllcihwZW4sIHgsIHlub3RlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCxcbiAgICAgICAgICAgIHggKyBTaGVldE11c2ljLkxpbmVTcGFjZS8yLCB5bm90ZSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIsXG4gICAgICAgICAgICB4ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UgKyBTaGVldE11c2ljLkxpbmVTcGFjZS8yLCBcbiAgICAgICAgICAgICB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzMgLSBTaGVldE11c2ljLkxpbmVTcGFjZS8yLFxuICAgICAgICAgICAgeCwgeW5vdGUgKyBTaGVldE11c2ljLkxpbmVTcGFjZSArIFNoZWV0TXVzaWMuTGluZVdpZHRoICsgMSk7XG5cblxuICAgIH1cblxuICAgIC8qKiBEcmF3IGEgbmF0dXJhbCBzeW1ib2wuXG4gICAgICogQHBhcmFtIHlub3RlIFRoZSBwaXhlbCBsb2NhdGlvbiBvZiB0aGUgdG9wIG9mIHRoZSBhY2NpZGVudGFsJ3Mgbm90ZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3TmF0dXJhbChHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeW5vdGUpIHtcblxuICAgICAgICAvKiBEcmF3IHRoZSB0d28gdmVydGljYWwgbGluZXMgKi9cbiAgICAgICAgaW50IHlzdGFydCA9IHlub3RlIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UgLSBTaGVldE11c2ljLkxpbmVXaWR0aDtcbiAgICAgICAgaW50IHllbmQgPSB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlICsgU2hlZXRNdXNpYy5MaW5lV2lkdGg7XG4gICAgICAgIGludCB4ID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvMjtcbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHgsIHlzdGFydCwgeCwgeWVuZCk7XG4gICAgICAgIHggKz0gU2hlZXRNdXNpYy5MaW5lU3BhY2UgLSBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuICAgICAgICB5c3RhcnQgPSB5bm90ZSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQ7XG4gICAgICAgIHllbmQgPSB5bm90ZSArIDIqU2hlZXRNdXNpYy5MaW5lU3BhY2UgKyBTaGVldE11c2ljLkxpbmVXaWR0aCAtIFxuICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeCwgeXN0YXJ0LCB4LCB5ZW5kKTtcblxuICAgICAgICAvKiBEcmF3IHRoZSBzbGlnaHRseSB1cHdhcmRzIGhvcml6b250YWwgbGluZXMgKi9cbiAgICAgICAgaW50IHhzdGFydCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzI7XG4gICAgICAgIGludCB4ZW5kID0geHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UgLSBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuICAgICAgICB5c3RhcnQgPSB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVdpZHRoO1xuICAgICAgICB5ZW5kID0geXN0YXJ0IC0gU2hlZXRNdXNpYy5MaW5lV2lkdGggLSBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuICAgICAgICBwZW4uV2lkdGggPSBTaGVldE11c2ljLkxpbmVTcGFjZS8yO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5c3RhcnQsIHhlbmQsIHllbmQpO1xuICAgICAgICB5c3RhcnQgKz0gU2hlZXRNdXNpYy5MaW5lU3BhY2U7XG4gICAgICAgIHllbmQgKz0gU2hlZXRNdXNpYy5MaW5lU3BhY2U7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHlzdGFydCwgeGVuZCwgeWVuZCk7XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXG4gICAgICAgICAgXCJBY2NpZFN5bWJvbCBhY2NpZD17MH0gd2hpdGVub3RlPXsxfSBjbGVmPXsyfSB3aWR0aD17M31cIixcbiAgICAgICAgICBhY2NpZCwgd2hpdGVub3RlLCBjbGVmLCB3aWR0aCk7XG4gICAgfVxuXG59XG5cbn1cblxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cblxuLyoqIEBjbGFzcyBCYXJTeW1ib2xcbiAqIFRoZSBCYXJTeW1ib2wgcmVwcmVzZW50cyB0aGUgdmVydGljYWwgYmFycyB3aGljaCBkZWxpbWl0IG1lYXN1cmVzLlxuICogVGhlIHN0YXJ0dGltZSBvZiB0aGUgc3ltYm9sIGlzIHRoZSBiZWdpbm5pbmcgb2YgdGhlIG5ld1xuICogbWVhc3VyZS5cbiAqL1xucHVibGljIGNsYXNzIEJhclN5bWJvbCA6IE11c2ljU3ltYm9sIHtcbiAgICBwcml2YXRlIGludCBzdGFydHRpbWU7XG4gICAgcHJpdmF0ZSBpbnQgd2lkdGg7XG5cbiAgICAvKiogQ3JlYXRlIGEgQmFyU3ltYm9sLiBUaGUgc3RhcnR0aW1lIHNob3VsZCBiZSB0aGUgYmVnaW5uaW5nIG9mIGEgbWVhc3VyZS4gKi9cbiAgICBwdWJsaWMgQmFyU3ltYm9sKGludCBzdGFydHRpbWUpIHtcbiAgICAgICAgdGhpcy5zdGFydHRpbWUgPSBzdGFydHRpbWU7XG4gICAgICAgIHdpZHRoID0gTWluV2lkdGg7XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgdGltZSAoaW4gcHVsc2VzKSB0aGlzIHN5bWJvbCBvY2N1cnMgYXQuXG4gICAgICogVGhpcyBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgbWVhc3VyZSB0aGlzIHN5bWJvbCBiZWxvbmdzIHRvLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgU3RhcnRUaW1lIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHN0YXJ0dGltZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG1pbmltdW0gd2lkdGggKGluIHBpeGVscykgbmVlZGVkIHRvIGRyYXcgdGhpcyBzeW1ib2wgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IE1pbldpZHRoIHsgXG4gICAgICAgIGdldCB7IHJldHVybiAyICogU2hlZXRNdXNpYy5MaW5lU3BhY2U7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0L1NldCB0aGUgd2lkdGggKGluIHBpeGVscykgb2YgdGhpcyBzeW1ib2wuIFRoZSB3aWR0aCBpcyBzZXRcbiAgICAgKiBpbiBTaGVldE11c2ljLkFsaWduU3ltYm9scygpIHRvIHZlcnRpY2FsbHkgYWxpZ24gc3ltYm9scy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFdpZHRoIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgIHNldCB7IHdpZHRoID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYWJvdmUgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQWJvdmVTdGFmZiB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gMDsgfSBcbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYmVsb3cgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQmVsb3dTdGFmZiB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBEcmF3IGEgdmVydGljYWwgYmFyLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBcbiAgICB2b2lkIERyYXcoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3ApIHtcbiAgICAgICAgaW50IHkgPSB5dG9wO1xuICAgICAgICBpbnQgeWVuZCA9IHkgKyBTaGVldE11c2ljLkxpbmVTcGFjZSo0ICsgU2hlZXRNdXNpYy5MaW5lV2lkdGgqNDtcbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIFNoZWV0TXVzaWMuTm90ZVdpZHRoLzIsIHksIFxuICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlV2lkdGgvMiwgeWVuZCk7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgb3ZlcnJpZGUgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gc3RyaW5nLkZvcm1hdChcIkJhclN5bWJvbCBzdGFydHRpbWU9ezB9IHdpZHRoPXsxfVwiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnR0aW1lLCB3aWR0aCk7XG4gICAgfVxufVxuXG5cbn1cblxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEJpdG1hcDpJbWFnZVxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBCaXRtYXAoVHlwZSB0eXBlLCBzdHJpbmcgZmlsZW5hbWUpXHJcbiAgICAgICAgOmJhc2UodHlwZSxmaWxlbmFtZSl7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcbiAgICB9XHJcbn1cclxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG5cbi8qKiBAY2xhc3MgQmxhbmtTeW1ib2wgXG4gKiBUaGUgQmxhbmsgc3ltYm9sIGlzIGEgbXVzaWMgc3ltYm9sIHRoYXQgZG9lc24ndCBkcmF3IGFueXRoaW5nLiAgVGhpc1xuICogc3ltYm9sIGlzIHVzZWQgZm9yIGFsaWdubWVudCBwdXJwb3NlcywgdG8gYWxpZ24gbm90ZXMgaW4gZGlmZmVyZW50IFxuICogc3RhZmZzIHdoaWNoIG9jY3VyIGF0IHRoZSBzYW1lIHRpbWUuXG4gKi9cbnB1YmxpYyBjbGFzcyBCbGFua1N5bWJvbCA6IE11c2ljU3ltYm9sIHtcbiAgICBwcml2YXRlIGludCBzdGFydHRpbWU7IFxuICAgIHByaXZhdGUgaW50IHdpZHRoO1xuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBCbGFua1N5bWJvbCB3aXRoIHRoZSBnaXZlbiBzdGFydHRpbWUgYW5kIHdpZHRoICovXG4gICAgcHVibGljIEJsYW5rU3ltYm9sKGludCBzdGFydHRpbWUsIGludCB3aWR0aCkge1xuICAgICAgICB0aGlzLnN0YXJ0dGltZSA9IHN0YXJ0dGltZTtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIHRpbWUgKGluIHB1bHNlcykgdGhpcyBzeW1ib2wgb2NjdXJzIGF0LlxuICAgICAqIFRoaXMgaXMgdXNlZCB0byBkZXRlcm1pbmUgdGhlIG1lYXN1cmUgdGhpcyBzeW1ib2wgYmVsb25ncyB0by5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFN0YXJ0VGltZSB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gc3RhcnR0aW1lOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbWluaW11bSB3aWR0aCAoaW4gcGl4ZWxzKSBuZWVkZWQgdG8gZHJhdyB0aGlzIHN5bWJvbCAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgTWluV2lkdGgge1xuICAgICAgICBnZXQgeyByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQvU2V0IHRoZSB3aWR0aCAoaW4gcGl4ZWxzKSBvZiB0aGlzIHN5bWJvbC4gVGhlIHdpZHRoIGlzIHNldFxuICAgICAqIGluIFNoZWV0TXVzaWMuQWxpZ25TeW1ib2xzKCkgdG8gdmVydGljYWxseSBhbGlnbiBzeW1ib2xzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgV2lkdGggeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgIHNldCB7IHdpZHRoID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYWJvdmUgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQWJvdmVTdGFmZiB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBiZWxvdyB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBCZWxvd1N0YWZmIHsgXG4gICAgICAgIGdldCB7IHJldHVybiAwOyB9XG4gICAgfVxuXG4gICAgLyoqIERyYXcgbm90aGluZy5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7fVxuXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJCbGFua1N5bWJvbCBzdGFydHRpbWU9ezB9IHdpZHRoPXsxfVwiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnR0aW1lLCB3aWR0aCk7XG4gICAgfVxufVxuXG5cbn1cblxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbnB1YmxpYyBlbnVtIFN0ZW1EaXIgeyBVcCwgRG93biB9O1xuXG4vKiogQGNsYXNzIE5vdGVEYXRhXG4gKiAgQ29udGFpbnMgZmllbGRzIGZvciBkaXNwbGF5aW5nIGEgc2luZ2xlIG5vdGUgaW4gYSBjaG9yZC5cbiAqL1xucHVibGljIGNsYXNzIE5vdGVEYXRhIHtcbiAgICBwdWJsaWMgaW50IG51bWJlcjsgICAgICAgICAgICAgLyoqIFRoZSBNaWRpIG5vdGUgbnVtYmVyLCB1c2VkIHRvIGRldGVybWluZSB0aGUgY29sb3IgKi9cbiAgICBwdWJsaWMgV2hpdGVOb3RlIHdoaXRlbm90ZTsgICAgLyoqIFRoZSB3aGl0ZSBub3RlIGxvY2F0aW9uIHRvIGRyYXcgKi9cbiAgICBwdWJsaWMgTm90ZUR1cmF0aW9uIGR1cmF0aW9uOyAgLyoqIFRoZSBkdXJhdGlvbiBvZiB0aGUgbm90ZSAqL1xuICAgIHB1YmxpYyBib29sIGxlZnRzaWRlOyAgICAgICAgICAvKiogV2hldGhlciB0byBkcmF3IG5vdGUgdG8gdGhlIGxlZnQgb3IgcmlnaHQgb2YgdGhlIHN0ZW0gKi9cbiAgICBwdWJsaWMgQWNjaWQgYWNjaWQ7ICAgICAgICAgICAgLyoqIFVzZWQgdG8gY3JlYXRlIHRoZSBBY2NpZFN5bWJvbHMgZm9yIHRoZSBjaG9yZCAqL1xufTtcblxuLyoqIEBjbGFzcyBDaG9yZFN5bWJvbFxuICogQSBjaG9yZCBzeW1ib2wgcmVwcmVzZW50cyBhIGdyb3VwIG9mIG5vdGVzIHRoYXQgYXJlIHBsYXllZCBhdCB0aGUgc2FtZVxuICogdGltZS4gIEEgY2hvcmQgaW5jbHVkZXMgdGhlIG5vdGVzLCB0aGUgYWNjaWRlbnRhbCBzeW1ib2xzIGZvciBlYWNoXG4gKiBub3RlLCBhbmQgdGhlIHN0ZW0gKG9yIHN0ZW1zKSB0byB1c2UuICBBIHNpbmdsZSBjaG9yZCBtYXkgaGF2ZSB0d28gXG4gKiBzdGVtcyBpZiB0aGUgbm90ZXMgaGF2ZSBkaWZmZXJlbnQgZHVyYXRpb25zIChlLmcuIGlmIG9uZSBub3RlIGlzIGFcbiAqIHF1YXJ0ZXIgbm90ZSwgYW5kIGFub3RoZXIgaXMgYW4gZWlnaHRoIG5vdGUpLlxuICovXG5wdWJsaWMgY2xhc3MgQ2hvcmRTeW1ib2wgOiBNdXNpY1N5bWJvbCB7XG4gICAgcHJpdmF0ZSBDbGVmIGNsZWY7ICAgICAgICAgICAgIC8qKiBXaGljaCBjbGVmIHRoZSBjaG9yZCBpcyBiZWluZyBkcmF3biBpbiAqL1xuICAgIHByaXZhdGUgaW50IHN0YXJ0dGltZTsgICAgICAgICAvKiogVGhlIHRpbWUgKGluIHB1bHNlcykgdGhlIG5vdGVzIG9jY3VycyBhdCAqL1xuICAgIHByaXZhdGUgaW50IGVuZHRpbWU7ICAgICAgICAgICAvKiogVGhlIHN0YXJ0dGltZSBwbHVzIHRoZSBsb25nZXN0IG5vdGUgZHVyYXRpb24gKi9cbiAgICBwcml2YXRlIE5vdGVEYXRhW10gbm90ZWRhdGE7ICAgLyoqIFRoZSBub3RlcyB0byBkcmF3ICovXG4gICAgcHJpdmF0ZSBBY2NpZFN5bWJvbFtdIGFjY2lkc3ltYm9sczsgICAvKiogVGhlIGFjY2lkZW50YWwgc3ltYm9scyB0byBkcmF3ICovXG4gICAgcHJpdmF0ZSBpbnQgd2lkdGg7ICAgICAgICAgICAgIC8qKiBUaGUgd2lkdGggb2YgdGhlIGNob3JkICovXG4gICAgcHJpdmF0ZSBTdGVtIHN0ZW0xOyAgICAgICAgICAgIC8qKiBUaGUgc3RlbSBvZiB0aGUgY2hvcmQuIENhbiBiZSBudWxsLiAqL1xuICAgIHByaXZhdGUgU3RlbSBzdGVtMjsgICAgICAgICAgICAvKiogVGhlIHNlY29uZCBzdGVtIG9mIHRoZSBjaG9yZC4gQ2FuIGJlIG51bGwgKi9cbiAgICBwcml2YXRlIGJvb2wgaGFzdHdvc3RlbXM7ICAgICAgLyoqIFRydWUgaWYgdGhpcyBjaG9yZCBoYXMgdHdvIHN0ZW1zICovXG4gICAgcHJpdmF0ZSBTaGVldE11c2ljIHNoZWV0bXVzaWM7IC8qKiBVc2VkIHRvIGdldCBjb2xvcnMgYW5kIG90aGVyIG9wdGlvbnMgKi9cblxuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBDaG9yZCBTeW1ib2wgZnJvbSB0aGUgZ2l2ZW4gbGlzdCBvZiBtaWRpIG5vdGVzLlxuICAgICAqIEFsbCB0aGUgbWlkaSBub3RlcyB3aWxsIGhhdmUgdGhlIHNhbWUgc3RhcnQgdGltZS4gIFVzZSB0aGVcbiAgICAgKiBrZXkgc2lnbmF0dXJlIHRvIGdldCB0aGUgd2hpdGUga2V5IGFuZCBhY2NpZGVudGFsIHN5bWJvbCBmb3JcbiAgICAgKiBlYWNoIG5vdGUuICBVc2UgdGhlIHRpbWUgc2lnbmF0dXJlIHRvIGNhbGN1bGF0ZSB0aGUgZHVyYXRpb25cbiAgICAgKiBvZiB0aGUgbm90ZXMuIFVzZSB0aGUgY2xlZiB3aGVuIGRyYXdpbmcgdGhlIGNob3JkLlxuICAgICAqL1xuICAgIHB1YmxpYyBDaG9yZFN5bWJvbChMaXN0PE1pZGlOb3RlPiBtaWRpbm90ZXMsIEtleVNpZ25hdHVyZSBrZXksIFxuICAgICAgICAgICAgICAgICAgICAgICBUaW1lU2lnbmF0dXJlIHRpbWUsIENsZWYgYywgU2hlZXRNdXNpYyBzaGVldCkge1xuXG4gICAgICAgIGludCBsZW4gPSBtaWRpbm90ZXMuQ291bnQ7XG4gICAgICAgIGludCBpO1xuXG4gICAgICAgIGhhc3R3b3N0ZW1zID0gZmFsc2U7XG4gICAgICAgIGNsZWYgPSBjO1xuICAgICAgICBzaGVldG11c2ljID0gc2hlZXQ7XG5cbiAgICAgICAgc3RhcnR0aW1lID0gbWlkaW5vdGVzWzBdLlN0YXJ0VGltZTtcbiAgICAgICAgZW5kdGltZSA9IG1pZGlub3Rlc1swXS5FbmRUaW1lO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBtaWRpbm90ZXMuQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgaWYgKGkgPiAxKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1pZGlub3Rlc1tpXS5OdW1iZXIgPCBtaWRpbm90ZXNbaS0xXS5OdW1iZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5c3RlbS5Bcmd1bWVudEV4Y2VwdGlvbihcIkNob3JkIG5vdGVzIG5vdCBpbiBpbmNyZWFzaW5nIG9yZGVyIGJ5IG51bWJlclwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbmR0aW1lID0gTWF0aC5NYXgoZW5kdGltZSwgbWlkaW5vdGVzW2ldLkVuZFRpbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgbm90ZWRhdGEgPSBDcmVhdGVOb3RlRGF0YShtaWRpbm90ZXMsIGtleSwgdGltZSk7XG4gICAgICAgIGFjY2lkc3ltYm9scyA9IENyZWF0ZUFjY2lkU3ltYm9scyhub3RlZGF0YSwgY2xlZik7XG5cblxuICAgICAgICAvKiBGaW5kIG91dCBob3cgbWFueSBzdGVtcyB3ZSBuZWVkICgxIG9yIDIpICovXG4gICAgICAgIE5vdGVEdXJhdGlvbiBkdXIxID0gbm90ZWRhdGFbMF0uZHVyYXRpb247XG4gICAgICAgIE5vdGVEdXJhdGlvbiBkdXIyID0gZHVyMTtcbiAgICAgICAgaW50IGNoYW5nZSA9IC0xO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbm90ZWRhdGEuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGR1cjIgPSBub3RlZGF0YVtpXS5kdXJhdGlvbjtcbiAgICAgICAgICAgIGlmIChkdXIxICE9IGR1cjIpIHtcbiAgICAgICAgICAgICAgICBjaGFuZ2UgPSBpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGR1cjEgIT0gZHVyMikge1xuICAgICAgICAgICAgLyogV2UgaGF2ZSBub3RlcyB3aXRoIGRpZmZlcmVudCBkdXJhdGlvbnMuICBTbyB3ZSB3aWxsIG5lZWRcbiAgICAgICAgICAgICAqIHR3byBzdGVtcy4gIFRoZSBmaXJzdCBzdGVtIHBvaW50cyBkb3duLCBhbmQgY29udGFpbnMgdGhlXG4gICAgICAgICAgICAgKiBib3R0b20gbm90ZSB1cCB0byB0aGUgbm90ZSB3aXRoIHRoZSBkaWZmZXJlbnQgZHVyYXRpb24uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogVGhlIHNlY29uZCBzdGVtIHBvaW50cyB1cCwgYW5kIGNvbnRhaW5zIHRoZSBub3RlIHdpdGggdGhlXG4gICAgICAgICAgICAgKiBkaWZmZXJlbnQgZHVyYXRpb24gdXAgdG8gdGhlIHRvcCBub3RlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBoYXN0d29zdGVtcyA9IHRydWU7XG4gICAgICAgICAgICBzdGVtMSA9IG5ldyBTdGVtKG5vdGVkYXRhWzBdLndoaXRlbm90ZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGVkYXRhW2NoYW5nZS0xXS53aGl0ZW5vdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR1cjEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdGVtLkRvd24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5vdGVzT3ZlcmxhcChub3RlZGF0YSwgMCwgY2hhbmdlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHN0ZW0yID0gbmV3IFN0ZW0obm90ZWRhdGFbY2hhbmdlXS53aGl0ZW5vdGUsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlZGF0YVtub3RlZGF0YS5MZW5ndGgtMV0ud2hpdGVub3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkdXIyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3RlbS5VcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTm90ZXNPdmVybGFwKG5vdGVkYXRhLCBjaGFuZ2UsIG5vdGVkYXRhLkxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLyogQWxsIG5vdGVzIGhhdmUgdGhlIHNhbWUgZHVyYXRpb24sIHNvIHdlIG9ubHkgbmVlZCBvbmUgc3RlbS4gKi9cbiAgICAgICAgICAgIGludCBkaXJlY3Rpb24gPSBTdGVtRGlyZWN0aW9uKG5vdGVkYXRhWzBdLndoaXRlbm90ZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlZGF0YVtub3RlZGF0YS5MZW5ndGgtMV0ud2hpdGVub3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlZik7XG5cbiAgICAgICAgICAgIHN0ZW0xID0gbmV3IFN0ZW0obm90ZWRhdGFbMF0ud2hpdGVub3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlZGF0YVtub3RlZGF0YS5MZW5ndGgtMV0ud2hpdGVub3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkdXIxLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOb3Rlc092ZXJsYXAobm90ZWRhdGEsIDAsIG5vdGVkYXRhLkxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgc3RlbTIgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogRm9yIHdob2xlIG5vdGVzLCBubyBzdGVtIGlzIGRyYXduLiAqL1xuICAgICAgICBpZiAoZHVyMSA9PSBOb3RlRHVyYXRpb24uV2hvbGUpXG4gICAgICAgICAgICBzdGVtMSA9IG51bGw7XG4gICAgICAgIGlmIChkdXIyID09IE5vdGVEdXJhdGlvbi5XaG9sZSlcbiAgICAgICAgICAgIHN0ZW0yID0gbnVsbDtcblxuICAgICAgICB3aWR0aCA9IE1pbldpZHRoO1xuICAgIH1cblxuXG4gICAgLyoqIEdpdmVuIHRoZSByYXcgbWlkaSBub3RlcyAodGhlIG5vdGUgbnVtYmVyIGFuZCBkdXJhdGlvbiBpbiBwdWxzZXMpLFxuICAgICAqIGNhbGN1bGF0ZSB0aGUgZm9sbG93aW5nIG5vdGUgZGF0YTpcbiAgICAgKiAtIFRoZSB3aGl0ZSBrZXlcbiAgICAgKiAtIFRoZSBhY2NpZGVudGFsIChpZiBhbnkpXG4gICAgICogLSBUaGUgbm90ZSBkdXJhdGlvbiAoaGFsZiwgcXVhcnRlciwgZWlnaHRoLCBldGMpXG4gICAgICogLSBUaGUgc2lkZSBpdCBzaG91bGQgYmUgZHJhd24gKGxlZnQgb3Igc2lkZSlcbiAgICAgKiBCeSBkZWZhdWx0LCBub3RlcyBhcmUgZHJhd24gb24gdGhlIGxlZnQgc2lkZS4gIEhvd2V2ZXIsIGlmIHR3byBub3Rlc1xuICAgICAqIG92ZXJsYXAgKGxpa2UgQSBhbmQgQikgeW91IGNhbm5vdCBkcmF3IHRoZSBuZXh0IG5vdGUgZGlyZWN0bHkgYWJvdmUgaXQuXG4gICAgICogSW5zdGVhZCB5b3UgbXVzdCBzaGlmdCBvbmUgb2YgdGhlIG5vdGVzIHRvIHRoZSByaWdodC5cbiAgICAgKlxuICAgICAqIFRoZSBLZXlTaWduYXR1cmUgaXMgdXNlZCB0byBkZXRlcm1pbmUgdGhlIHdoaXRlIGtleSBhbmQgYWNjaWRlbnRhbC5cbiAgICAgKiBUaGUgVGltZVNpZ25hdHVyZSBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgZHVyYXRpb24uXG4gICAgICovXG4gXG4gICAgcHJpdmF0ZSBzdGF0aWMgTm90ZURhdGFbXSBcbiAgICBDcmVhdGVOb3RlRGF0YShMaXN0PE1pZGlOb3RlPiBtaWRpbm90ZXMsIEtleVNpZ25hdHVyZSBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUaW1lU2lnbmF0dXJlIHRpbWUpIHtcblxuICAgICAgICBpbnQgbGVuID0gbWlkaW5vdGVzLkNvdW50O1xuICAgICAgICBOb3RlRGF0YVtdIG5vdGVkYXRhID0gbmV3IE5vdGVEYXRhW2xlbl07XG5cbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgTWlkaU5vdGUgbWlkaSA9IG1pZGlub3Rlc1tpXTtcbiAgICAgICAgICAgIG5vdGVkYXRhW2ldID0gbmV3IE5vdGVEYXRhKCk7XG4gICAgICAgICAgICBub3RlZGF0YVtpXS5udW1iZXIgPSBtaWRpLk51bWJlcjtcbiAgICAgICAgICAgIG5vdGVkYXRhW2ldLmxlZnRzaWRlID0gdHJ1ZTtcbiAgICAgICAgICAgIG5vdGVkYXRhW2ldLndoaXRlbm90ZSA9IGtleS5HZXRXaGl0ZU5vdGUobWlkaS5OdW1iZXIpO1xuICAgICAgICAgICAgbm90ZWRhdGFbaV0uZHVyYXRpb24gPSB0aW1lLkdldE5vdGVEdXJhdGlvbihtaWRpLkVuZFRpbWUgLSBtaWRpLlN0YXJ0VGltZSk7XG4gICAgICAgICAgICBub3RlZGF0YVtpXS5hY2NpZCA9IGtleS5HZXRBY2NpZGVudGFsKG1pZGkuTnVtYmVyLCBtaWRpLlN0YXJ0VGltZSAvIHRpbWUuTWVhc3VyZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChpID4gMCAmJiAobm90ZWRhdGFbaV0ud2hpdGVub3RlLkRpc3Qobm90ZWRhdGFbaS0xXS53aGl0ZW5vdGUpID09IDEpKSB7XG4gICAgICAgICAgICAgICAgLyogVGhpcyBub3RlIChub3RlZGF0YVtpXSkgb3ZlcmxhcHMgd2l0aCB0aGUgcHJldmlvdXMgbm90ZS5cbiAgICAgICAgICAgICAgICAgKiBDaGFuZ2UgdGhlIHNpZGUgb2YgdGhpcyBub3RlLlxuICAgICAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAgICAgaWYgKG5vdGVkYXRhW2ktMV0ubGVmdHNpZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm90ZWRhdGFbaV0ubGVmdHNpZGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBub3RlZGF0YVtpXS5sZWZ0c2lkZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBub3RlZGF0YVtpXS5sZWZ0c2lkZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vdGVkYXRhO1xuICAgIH1cblxuXG4gICAgLyoqIEdpdmVuIHRoZSBub3RlIGRhdGEgKHRoZSB3aGl0ZSBrZXlzIGFuZCBhY2NpZGVudGFscyksIGNyZWF0ZSBcbiAgICAgKiB0aGUgQWNjaWRlbnRhbCBTeW1ib2xzIGFuZCByZXR1cm4gdGhlbS5cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBBY2NpZFN5bWJvbFtdIFxuICAgIENyZWF0ZUFjY2lkU3ltYm9scyhOb3RlRGF0YVtdIG5vdGVkYXRhLCBDbGVmIGNsZWYpIHtcbiAgICAgICAgaW50IGNvdW50ID0gMDtcbiAgICAgICAgZm9yZWFjaCAoTm90ZURhdGEgbiBpbiBub3RlZGF0YSkge1xuICAgICAgICAgICAgaWYgKG4uYWNjaWQgIT0gQWNjaWQuTm9uZSkge1xuICAgICAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgQWNjaWRTeW1ib2xbXSBzeW1ib2xzID0gbmV3IEFjY2lkU3ltYm9sW2NvdW50XTtcbiAgICAgICAgaW50IGkgPSAwO1xuICAgICAgICBmb3JlYWNoIChOb3RlRGF0YSBuIGluIG5vdGVkYXRhKSB7XG4gICAgICAgICAgICBpZiAobi5hY2NpZCAhPSBBY2NpZC5Ob25lKSB7XG4gICAgICAgICAgICAgICAgc3ltYm9sc1tpXSA9IG5ldyBBY2NpZFN5bWJvbChuLmFjY2lkLCBuLndoaXRlbm90ZSwgY2xlZik7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzeW1ib2xzO1xuICAgIH1cblxuICAgIC8qKiBDYWxjdWxhdGUgdGhlIHN0ZW0gZGlyZWN0aW9uIChVcCBvciBkb3duKSBiYXNlZCBvbiB0aGUgdG9wIGFuZFxuICAgICAqIGJvdHRvbSBub3RlIGluIHRoZSBjaG9yZC4gIElmIHRoZSBhdmVyYWdlIG9mIHRoZSBub3RlcyBpcyBhYm92ZVxuICAgICAqIHRoZSBtaWRkbGUgb2YgdGhlIHN0YWZmLCB0aGUgZGlyZWN0aW9uIGlzIGRvd24uICBFbHNlLCB0aGVcbiAgICAgKiBkaXJlY3Rpb24gaXMgdXAuXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50IFxuICAgIFN0ZW1EaXJlY3Rpb24oV2hpdGVOb3RlIGJvdHRvbSwgV2hpdGVOb3RlIHRvcCwgQ2xlZiBjbGVmKSB7XG4gICAgICAgIFdoaXRlTm90ZSBtaWRkbGU7XG4gICAgICAgIGlmIChjbGVmID09IENsZWYuVHJlYmxlKVxuICAgICAgICAgICAgbWlkZGxlID0gbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQiwgNSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG1pZGRsZSA9IG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkQsIDMpO1xuXG4gICAgICAgIGludCBkaXN0ID0gbWlkZGxlLkRpc3QoYm90dG9tKSArIG1pZGRsZS5EaXN0KHRvcCk7XG4gICAgICAgIGlmIChkaXN0ID49IDApXG4gICAgICAgICAgICByZXR1cm4gU3RlbS5VcDtcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIHJldHVybiBTdGVtLkRvd247XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB3aGV0aGVyIGFueSBvZiB0aGUgbm90ZXMgaW4gbm90ZWRhdGEgKGJldHdlZW4gc3RhcnQgYW5kXG4gICAgICogZW5kIGluZGV4ZXMpIG92ZXJsYXAuICBUaGlzIGlzIG5lZWRlZCBieSB0aGUgU3RlbSBjbGFzcyB0b1xuICAgICAqIGRldGVybWluZSB0aGUgcG9zaXRpb24gb2YgdGhlIHN0ZW0gKGxlZnQgb3IgcmlnaHQgb2Ygbm90ZXMpLlxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGJvb2wgTm90ZXNPdmVybGFwKE5vdGVEYXRhW10gbm90ZWRhdGEsIGludCBzdGFydCwgaW50IGVuZCkge1xuICAgICAgICBmb3IgKGludCBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgICAgICAgaWYgKCFub3RlZGF0YVtpXS5sZWZ0c2lkZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSB0aW1lIChpbiBwdWxzZXMpIHRoaXMgc3ltYm9sIG9jY3VycyBhdC5cbiAgICAgKiBUaGlzIGlzIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBtZWFzdXJlIHRoaXMgc3ltYm9sIGJlbG9uZ3MgdG8uXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBTdGFydFRpbWUgeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHN0YXJ0dGltZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIGVuZCB0aW1lIChpbiBwdWxzZXMpIG9mIHRoZSBsb25nZXN0IG5vdGUgaW4gdGhlIGNob3JkLlxuICAgICAqIFVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdHdvIGFkamFjZW50IGNob3JkcyBjYW4gYmUgam9pbmVkXG4gICAgICogYnkgYSBzdGVtLlxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgRW5kVGltZSB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gZW5kdGltZTsgfVxuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIGNsZWYgdGhpcyBjaG9yZCBpcyBkcmF3biBpbi4gKi9cbiAgICBwdWJsaWMgQ2xlZiBDbGVmIHsgXG4gICAgICAgIGdldCB7IHJldHVybiBjbGVmOyB9XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0cnVlIGlmIHRoaXMgY2hvcmQgaGFzIHR3byBzdGVtcyAqL1xuICAgIHB1YmxpYyBib29sIEhhc1R3b1N0ZW1zIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIGhhc3R3b3N0ZW1zOyB9XG4gICAgfVxuXG4gICAgLyogUmV0dXJuIHRoZSBzdGVtIHdpbGwgdGhlIHNtYWxsZXN0IGR1cmF0aW9uLiAgVGhpcyBwcm9wZXJ0eVxuICAgICAqIGlzIHVzZWQgd2hlbiBtYWtpbmcgY2hvcmQgcGFpcnMgKGNob3JkcyBqb2luZWQgYnkgYSBob3Jpem9udGFsXG4gICAgICogYmVhbSBzdGVtKS4gVGhlIHN0ZW0gZHVyYXRpb25zIG11c3QgbWF0Y2ggaW4gb3JkZXIgdG8gbWFrZVxuICAgICAqIGEgY2hvcmQgcGFpci4gIElmIGEgY2hvcmQgaGFzIHR3byBzdGVtcywgd2UgYWx3YXlzIHJldHVyblxuICAgICAqIHRoZSBvbmUgd2l0aCBhIHNtYWxsZXIgZHVyYXRpb24sIGJlY2F1c2UgaXQgaGFzIGEgYmV0dGVyIFxuICAgICAqIGNoYW5jZSBvZiBtYWtpbmcgYSBwYWlyLlxuICAgICAqL1xuICAgIHB1YmxpYyBTdGVtIFN0ZW0ge1xuICAgICAgICBnZXQgeyBcbiAgICAgICAgICAgIGlmIChzdGVtMSA9PSBudWxsKSB7IHJldHVybiBzdGVtMjsgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc3RlbTIgPT0gbnVsbCkgeyByZXR1cm4gc3RlbTE7IH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHN0ZW0xLkR1cmF0aW9uIDwgc3RlbTIuRHVyYXRpb24pIHsgcmV0dXJuIHN0ZW0xOyB9XG4gICAgICAgICAgICBlbHNlIHsgcmV0dXJuIHN0ZW0yOyB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogR2V0L1NldCB0aGUgd2lkdGggKGluIHBpeGVscykgb2YgdGhpcyBzeW1ib2wuIFRoZSB3aWR0aCBpcyBzZXRcbiAgICAgKiBpbiBTaGVldE11c2ljLkFsaWduU3ltYm9scygpIHRvIHZlcnRpY2FsbHkgYWxpZ24gc3ltYm9scy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFdpZHRoIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgIHNldCB7IHdpZHRoID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBtaW5pbXVtIHdpZHRoIChpbiBwaXhlbHMpIG5lZWRlZCB0byBkcmF3IHRoaXMgc3ltYm9sICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBNaW5XaWR0aCB7XG4gICAgICAgIGdldCB7IHJldHVybiBHZXRNaW5XaWR0aCgpOyB9XG4gICAgfVxuXG4gICAgLyogUmV0dXJuIHRoZSBtaW5pbXVtIHdpZHRoIG5lZWRlZCB0byBkaXNwbGF5IHRoaXMgY2hvcmQuXG4gICAgICpcbiAgICAgKiBUaGUgYWNjaWRlbnRhbCBzeW1ib2xzIGNhbiBiZSBkcmF3biBhYm92ZSBvbmUgYW5vdGhlciBhcyBsb25nXG4gICAgICogYXMgdGhleSBkb24ndCBvdmVybGFwICh0aGV5IG11c3QgYmUgYXQgbGVhc3QgNiBub3RlcyBhcGFydCkuXG4gICAgICogSWYgdHdvIGFjY2lkZW50YWwgc3ltYm9scyBkbyBvdmVybGFwLCB0aGUgYWNjaWRlbnRhbCBzeW1ib2xcbiAgICAgKiBvbiB0b3AgbXVzdCBiZSBzaGlmdGVkIHRvIHRoZSByaWdodC4gIFNvIHRoZSB3aWR0aCBuZWVkZWQgZm9yXG4gICAgICogYWNjaWRlbnRhbCBzeW1ib2xzIGRlcGVuZHMgb24gd2hldGhlciB0aGV5IG92ZXJsYXAgb3Igbm90LlxuICAgICAqXG4gICAgICogSWYgd2UgYXJlIGFsc28gZGlzcGxheWluZyB0aGUgbGV0dGVycywgaW5jbHVkZSBleHRyYSB3aWR0aC5cbiAgICAgKi9cbiAgICBpbnQgR2V0TWluV2lkdGgoKSB7XG4gICAgICAgIC8qIFRoZSB3aWR0aCBuZWVkZWQgZm9yIHRoZSBub3RlIGNpcmNsZXMgKi9cbiAgICAgICAgaW50IHJlc3VsdCA9IDIqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjMvNDtcblxuICAgICAgICBpZiAoYWNjaWRzeW1ib2xzLkxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSBhY2NpZHN5bWJvbHNbMF0uTWluV2lkdGg7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMTsgaSA8IGFjY2lkc3ltYm9scy5MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIEFjY2lkU3ltYm9sIGFjY2lkID0gYWNjaWRzeW1ib2xzW2ldO1xuICAgICAgICAgICAgICAgIEFjY2lkU3ltYm9sIHByZXYgPSBhY2NpZHN5bWJvbHNbaS0xXTtcbiAgICAgICAgICAgICAgICBpZiAoYWNjaWQuTm90ZS5EaXN0KHByZXYuTm90ZSkgPCA2KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBhY2NpZC5NaW5XaWR0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNoZWV0bXVzaWMgIT0gbnVsbCAmJiBzaGVldG11c2ljLlNob3dOb3RlTGV0dGVycyAhPSBNaWRpT3B0aW9ucy5Ob3RlTmFtZU5vbmUpIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSA4O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYWJvdmUgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQWJvdmVTdGFmZiB7XG4gICAgICAgIGdldCB7IHJldHVybiBHZXRBYm92ZVN0YWZmKCk7IH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGludCBHZXRBYm92ZVN0YWZmKCkge1xuICAgICAgICAvKiBGaW5kIHRoZSB0b3Btb3N0IG5vdGUgaW4gdGhlIGNob3JkICovXG4gICAgICAgIFdoaXRlTm90ZSB0b3Bub3RlID0gbm90ZWRhdGFbIG5vdGVkYXRhLkxlbmd0aC0xIF0ud2hpdGVub3RlO1xuXG4gICAgICAgIC8qIFRoZSBzdGVtLkVuZCBpcyB0aGUgbm90ZSBwb3NpdGlvbiB3aGVyZSB0aGUgc3RlbSBlbmRzLlxuICAgICAgICAgKiBDaGVjayBpZiB0aGUgc3RlbSBlbmQgaXMgaGlnaGVyIHRoYW4gdGhlIHRvcCBub3RlLlxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKHN0ZW0xICE9IG51bGwpXG4gICAgICAgICAgICB0b3Bub3RlID0gV2hpdGVOb3RlLk1heCh0b3Bub3RlLCBzdGVtMS5FbmQpO1xuICAgICAgICBpZiAoc3RlbTIgIT0gbnVsbClcbiAgICAgICAgICAgIHRvcG5vdGUgPSBXaGl0ZU5vdGUuTWF4KHRvcG5vdGUsIHN0ZW0yLkVuZCk7XG5cbiAgICAgICAgaW50IGRpc3QgPSB0b3Bub3RlLkRpc3QoV2hpdGVOb3RlLlRvcChjbGVmKSkgKiBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcbiAgICAgICAgaW50IHJlc3VsdCA9IDA7XG4gICAgICAgIGlmIChkaXN0ID4gMClcbiAgICAgICAgICAgIHJlc3VsdCA9IGRpc3Q7XG5cbiAgICAgICAgLyogQ2hlY2sgaWYgYW55IGFjY2lkZW50YWwgc3ltYm9scyBleHRlbmQgYWJvdmUgdGhlIHN0YWZmICovXG4gICAgICAgIGZvcmVhY2ggKEFjY2lkU3ltYm9sIHN5bWJvbCBpbiBhY2NpZHN5bWJvbHMpIHtcbiAgICAgICAgICAgIGlmIChzeW1ib2wuQWJvdmVTdGFmZiA+IHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHN5bWJvbC5BYm92ZVN0YWZmO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGJlbG93IHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEJlbG93U3RhZmYge1xuICAgICAgICBnZXQgeyByZXR1cm4gR2V0QmVsb3dTdGFmZigpOyB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbnQgR2V0QmVsb3dTdGFmZigpIHtcbiAgICAgICAgLyogRmluZCB0aGUgYm90dG9tIG5vdGUgaW4gdGhlIGNob3JkICovXG4gICAgICAgIFdoaXRlTm90ZSBib3R0b21ub3RlID0gbm90ZWRhdGFbMF0ud2hpdGVub3RlO1xuXG4gICAgICAgIC8qIFRoZSBzdGVtLkVuZCBpcyB0aGUgbm90ZSBwb3NpdGlvbiB3aGVyZSB0aGUgc3RlbSBlbmRzLlxuICAgICAgICAgKiBDaGVjayBpZiB0aGUgc3RlbSBlbmQgaXMgbG93ZXIgdGhhbiB0aGUgYm90dG9tIG5vdGUuXG4gICAgICAgICAqL1xuICAgICAgICBpZiAoc3RlbTEgIT0gbnVsbClcbiAgICAgICAgICAgIGJvdHRvbW5vdGUgPSBXaGl0ZU5vdGUuTWluKGJvdHRvbW5vdGUsIHN0ZW0xLkVuZCk7XG4gICAgICAgIGlmIChzdGVtMiAhPSBudWxsKVxuICAgICAgICAgICAgYm90dG9tbm90ZSA9IFdoaXRlTm90ZS5NaW4oYm90dG9tbm90ZSwgc3RlbTIuRW5kKTtcblxuICAgICAgICBpbnQgZGlzdCA9IFdoaXRlTm90ZS5Cb3R0b20oY2xlZikuRGlzdChib3R0b21ub3RlKSAqXG4gICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG5cbiAgICAgICAgaW50IHJlc3VsdCA9IDA7XG4gICAgICAgIGlmIChkaXN0ID4gMClcbiAgICAgICAgICAgIHJlc3VsdCA9IGRpc3Q7XG5cbiAgICAgICAgLyogQ2hlY2sgaWYgYW55IGFjY2lkZW50YWwgc3ltYm9scyBleHRlbmQgYmVsb3cgdGhlIHN0YWZmICovIFxuICAgICAgICBmb3JlYWNoIChBY2NpZFN5bWJvbCBzeW1ib2wgaW4gYWNjaWRzeW1ib2xzKSB7XG4gICAgICAgICAgICBpZiAoc3ltYm9sLkJlbG93U3RhZmYgPiByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBzeW1ib2wuQmVsb3dTdGFmZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG5hbWUgZm9yIHRoaXMgbm90ZSAqL1xuICAgIHByaXZhdGUgc3RyaW5nIE5vdGVOYW1lKGludCBub3RlbnVtYmVyLCBXaGl0ZU5vdGUgd2hpdGVub3RlKSB7XG4gICAgICAgIGlmIChzaGVldG11c2ljLlNob3dOb3RlTGV0dGVycyA9PSBNaWRpT3B0aW9ucy5Ob3RlTmFtZUxldHRlcikge1xuICAgICAgICAgICAgcmV0dXJuIExldHRlcihub3RlbnVtYmVyLCB3aGl0ZW5vdGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHNoZWV0bXVzaWMuU2hvd05vdGVMZXR0ZXJzID09IE1pZGlPcHRpb25zLk5vdGVOYW1lRml4ZWREb1JlTWkpIHtcbiAgICAgICAgICAgIHN0cmluZ1tdIGZpeGVkRG9SZU1pID0ge1xuICAgICAgICAgICAgICAgIFwiTGFcIiwgXCJMaVwiLCBcIlRpXCIsIFwiRG9cIiwgXCJEaVwiLCBcIlJlXCIsIFwiUmlcIiwgXCJNaVwiLCBcIkZhXCIsIFwiRmlcIiwgXCJTb1wiLCBcIlNpXCIgXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaW50IG5vdGVzY2FsZSA9IE5vdGVTY2FsZS5Gcm9tTnVtYmVyKG5vdGVudW1iZXIpO1xuICAgICAgICAgICAgcmV0dXJuIGZpeGVkRG9SZU1pW25vdGVzY2FsZV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc2hlZXRtdXNpYy5TaG93Tm90ZUxldHRlcnMgPT0gTWlkaU9wdGlvbnMuTm90ZU5hbWVNb3ZhYmxlRG9SZU1pKSB7XG4gICAgICAgICAgICBzdHJpbmdbXSBmaXhlZERvUmVNaSA9IHtcbiAgICAgICAgICAgICAgICBcIkxhXCIsIFwiTGlcIiwgXCJUaVwiLCBcIkRvXCIsIFwiRGlcIiwgXCJSZVwiLCBcIlJpXCIsIFwiTWlcIiwgXCJGYVwiLCBcIkZpXCIsIFwiU29cIiwgXCJTaVwiIFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGludCBtYWluc2NhbGUgPSBzaGVldG11c2ljLk1haW5LZXkuTm90ZXNjYWxlKCk7XG4gICAgICAgICAgICBpbnQgZGlmZiA9IE5vdGVTY2FsZS5DIC0gbWFpbnNjYWxlO1xuICAgICAgICAgICAgbm90ZW51bWJlciArPSBkaWZmO1xuICAgICAgICAgICAgaWYgKG5vdGVudW1iZXIgPCAwKSB7XG4gICAgICAgICAgICAgICAgbm90ZW51bWJlciArPSAxMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGludCBub3Rlc2NhbGUgPSBOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyKTtcbiAgICAgICAgICAgIHJldHVybiBmaXhlZERvUmVNaVtub3Rlc2NhbGVdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHNoZWV0bXVzaWMuU2hvd05vdGVMZXR0ZXJzID09IE1pZGlPcHRpb25zLk5vdGVOYW1lRml4ZWROdW1iZXIpIHtcbiAgICAgICAgICAgIHN0cmluZ1tdIG51bSA9IHtcbiAgICAgICAgICAgICAgICBcIjEwXCIsIFwiMTFcIiwgXCIxMlwiLCBcIjFcIiwgXCIyXCIsIFwiM1wiLCBcIjRcIiwgXCI1XCIsIFwiNlwiLCBcIjdcIiwgXCI4XCIsIFwiOVwiIFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGludCBub3Rlc2NhbGUgPSBOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyKTtcbiAgICAgICAgICAgIHJldHVybiBudW1bbm90ZXNjYWxlXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzaGVldG11c2ljLlNob3dOb3RlTGV0dGVycyA9PSBNaWRpT3B0aW9ucy5Ob3RlTmFtZU1vdmFibGVOdW1iZXIpIHtcbiAgICAgICAgICAgIHN0cmluZ1tdIG51bSA9IHtcbiAgICAgICAgICAgICAgICBcIjEwXCIsIFwiMTFcIiwgXCIxMlwiLCBcIjFcIiwgXCIyXCIsIFwiM1wiLCBcIjRcIiwgXCI1XCIsIFwiNlwiLCBcIjdcIiwgXCI4XCIsIFwiOVwiIFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGludCBtYWluc2NhbGUgPSBzaGVldG11c2ljLk1haW5LZXkuTm90ZXNjYWxlKCk7XG4gICAgICAgICAgICBpbnQgZGlmZiA9IE5vdGVTY2FsZS5DIC0gbWFpbnNjYWxlO1xuICAgICAgICAgICAgbm90ZW51bWJlciArPSBkaWZmO1xuICAgICAgICAgICAgaWYgKG5vdGVudW1iZXIgPCAwKSB7XG4gICAgICAgICAgICAgICAgbm90ZW51bWJlciArPSAxMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGludCBub3Rlc2NhbGUgPSBOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyKTtcbiAgICAgICAgICAgIHJldHVybiBudW1bbm90ZXNjYWxlXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbGV0dGVyIChBLCBBIywgQmIpIHJlcHJlc2VudGluZyB0aGlzIG5vdGUgKi9cbiAgICBwcml2YXRlIHN0cmluZyBMZXR0ZXIoaW50IG5vdGVudW1iZXIsIFdoaXRlTm90ZSB3aGl0ZW5vdGUpIHtcbiAgICAgICAgaW50IG5vdGVzY2FsZSA9IE5vdGVTY2FsZS5Gcm9tTnVtYmVyKG5vdGVudW1iZXIpO1xuICAgICAgICBzd2l0Y2gobm90ZXNjYWxlKSB7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5BOiByZXR1cm4gXCJBXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5COiByZXR1cm4gXCJCXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5DOiByZXR1cm4gXCJDXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5EOiByZXR1cm4gXCJEXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5FOiByZXR1cm4gXCJFXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5GOiByZXR1cm4gXCJGXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5HOiByZXR1cm4gXCJHXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5Bc2hhcnA6XG4gICAgICAgICAgICAgICAgaWYgKHdoaXRlbm90ZS5MZXR0ZXIgPT0gV2hpdGVOb3RlLkEpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIkEjXCI7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJCYlwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQ3NoYXJwOlxuICAgICAgICAgICAgICAgIGlmICh3aGl0ZW5vdGUuTGV0dGVyID09IFdoaXRlTm90ZS5DKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJDI1wiO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiRGJcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkRzaGFycDpcbiAgICAgICAgICAgICAgICBpZiAod2hpdGVub3RlLkxldHRlciA9PSBXaGl0ZU5vdGUuRClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiRCNcIjtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIkViXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5Gc2hhcnA6XG4gICAgICAgICAgICAgICAgaWYgKHdoaXRlbm90ZS5MZXR0ZXIgPT0gV2hpdGVOb3RlLkYpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIkYjXCI7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJHYlwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuR3NoYXJwOlxuICAgICAgICAgICAgICAgIGlmICh3aGl0ZW5vdGUuTGV0dGVyID09IFdoaXRlTm90ZS5HKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJHI1wiO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiQWJcIjtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgQ2hvcmQgU3ltYm9sOlxuICAgICAqIC0gRHJhdyB0aGUgYWNjaWRlbnRhbCBzeW1ib2xzLlxuICAgICAqIC0gRHJhdyB0aGUgYmxhY2sgY2lyY2xlIG5vdGVzLlxuICAgICAqIC0gRHJhdyB0aGUgc3RlbXMuXG4gICAgICBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIC8qIEFsaWduIHRoZSBjaG9yZCB0byB0aGUgcmlnaHQgKi9cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oV2lkdGggLSBNaW5XaWR0aCwgMCk7XG5cbiAgICAgICAgLyogRHJhdyB0aGUgYWNjaWRlbnRhbHMuICovXG4gICAgICAgIFdoaXRlTm90ZSB0b3BzdGFmZiA9IFdoaXRlTm90ZS5Ub3AoY2xlZik7XG4gICAgICAgIGludCB4cG9zID0gRHJhd0FjY2lkKGcsIHBlbiwgeXRvcCk7XG5cbiAgICAgICAgLyogRHJhdyB0aGUgbm90ZXMgKi9cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeHBvcywgMCk7XG4gICAgICAgIERyYXdOb3RlcyhnLCBwZW4sIHl0b3AsIHRvcHN0YWZmKTtcbiAgICAgICAgaWYgKHNoZWV0bXVzaWMgIT0gbnVsbCAmJiBzaGVldG11c2ljLlNob3dOb3RlTGV0dGVycyAhPSAwKSB7XG4gICAgICAgICAgICBEcmF3Tm90ZUxldHRlcnMoZywgcGVuLCB5dG9wLCB0b3BzdGFmZik7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBEcmF3IHRoZSBzdGVtcyAqL1xuICAgICAgICBpZiAoc3RlbTEgIT0gbnVsbClcbiAgICAgICAgICAgIHN0ZW0xLkRyYXcoZywgcGVuLCB5dG9wLCB0b3BzdGFmZik7XG4gICAgICAgIGlmIChzdGVtMiAhPSBudWxsKVxuICAgICAgICAgICAgc3RlbTIuRHJhdyhnLCBwZW4sIHl0b3AsIHRvcHN0YWZmKTtcblxuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgteHBvcywgMCk7XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0oV2lkdGggLSBNaW5XaWR0aCksIDApO1xuICAgIH1cblxuICAgIC8qIERyYXcgdGhlIGFjY2lkZW50YWwgc3ltYm9scy4gIElmIHR3byBzeW1ib2xzIG92ZXJsYXAgKGlmIHRoZXlcbiAgICAgKiBhcmUgbGVzcyB0aGFuIDYgbm90ZXMgYXBhcnQpLCB3ZSBjYW5ub3QgZHJhdyB0aGUgc3ltYm9sIGRpcmVjdGx5XG4gICAgICogYWJvdmUgdGhlIHByZXZpb3VzIG9uZS4gIEluc3RlYWQsIHdlIG11c3Qgc2hpZnQgaXQgdG8gdGhlIHJpZ2h0LlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEByZXR1cm4gVGhlIHggcGl4ZWwgd2lkdGggdXNlZCBieSBhbGwgdGhlIGFjY2lkZW50YWxzLlxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgRHJhd0FjY2lkKEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIGludCB4cG9zID0gMDtcblxuICAgICAgICBBY2NpZFN5bWJvbCBwcmV2ID0gbnVsbDtcbiAgICAgICAgZm9yZWFjaCAoQWNjaWRTeW1ib2wgc3ltYm9sIGluIGFjY2lkc3ltYm9scykge1xuICAgICAgICAgICAgaWYgKHByZXYgIT0gbnVsbCAmJiBzeW1ib2wuTm90ZS5EaXN0KHByZXYuTm90ZSkgPCA2KSB7XG4gICAgICAgICAgICAgICAgeHBvcyArPSBzeW1ib2wuV2lkdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSh4cG9zLCAwKTtcbiAgICAgICAgICAgIHN5bWJvbC5EcmF3KGcsIHBlbiwgeXRvcCk7XG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgteHBvcywgMCk7XG4gICAgICAgICAgICBwcmV2ID0gc3ltYm9sO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcmV2ICE9IG51bGwpIHtcbiAgICAgICAgICAgIHhwb3MgKz0gcHJldi5XaWR0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geHBvcztcbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgYmxhY2sgY2lyY2xlIG5vdGVzLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEBwYXJhbSB0b3BzdGFmZiBUaGUgd2hpdGUgbm90ZSBvZiB0aGUgdG9wIG9mIHRoZSBzdGFmZi5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3Tm90ZXMoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3AsIFdoaXRlTm90ZSB0b3BzdGFmZikge1xuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgICAgICBmb3JlYWNoIChOb3RlRGF0YSBub3RlIGluIG5vdGVkYXRhKSB7XG4gICAgICAgICAgICAvKiBHZXQgdGhlIHgseSBwb3NpdGlvbiB0byBkcmF3IHRoZSBub3RlICovXG4gICAgICAgICAgICBpbnQgeW5vdGUgPSB5dG9wICsgdG9wc3RhZmYuRGlzdChub3RlLndoaXRlbm90ZSkgKiBcbiAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG4gICAgICAgICAgICBpbnQgeG5vdGUgPSBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuICAgICAgICAgICAgaWYgKCFub3RlLmxlZnRzaWRlKVxuICAgICAgICAgICAgICAgIHhub3RlICs9IFNoZWV0TXVzaWMuTm90ZVdpZHRoO1xuXG4gICAgICAgICAgICAvKiBEcmF3IHJvdGF0ZWQgZWxsaXBzZS4gIFlvdSBtdXN0IGZpcnN0IHRyYW5zbGF0ZSAoMCwwKVxuICAgICAgICAgICAgICogdG8gdGhlIGNlbnRlciBvZiB0aGUgZWxsaXBzZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeG5vdGUgKyBTaGVldE11c2ljLk5vdGVXaWR0aC8yICsgMSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5bm90ZSAtIFNoZWV0TXVzaWMuTGluZVdpZHRoICsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQvMik7XG4gICAgICAgICAgICBnLlJvdGF0ZVRyYW5zZm9ybSgtNDUpO1xuXG4gICAgICAgICAgICBpZiAoc2hlZXRtdXNpYyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcGVuLkNvbG9yID0gc2hlZXRtdXNpYy5Ob3RlQ29sb3Iobm90ZS5udW1iZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcGVuLkNvbG9yID0gQ29sb3IuQmxhY2s7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChub3RlLmR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5XaG9sZSB8fCBcbiAgICAgICAgICAgICAgICBub3RlLmR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5IYWxmIHx8XG4gICAgICAgICAgICAgICAgbm90ZS5kdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkSGFsZikge1xuXG4gICAgICAgICAgICAgICAgZy5EcmF3RWxsaXBzZShwZW4sIC1TaGVldE11c2ljLk5vdGVXaWR0aC8yLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC1TaGVldE11c2ljLk5vdGVIZWlnaHQvMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZVdpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LTEpO1xuXG4gICAgICAgICAgICAgICAgZy5EcmF3RWxsaXBzZShwZW4sIC1TaGVldE11c2ljLk5vdGVXaWR0aC8yLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC1TaGVldE11c2ljLk5vdGVIZWlnaHQvMiArIDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC0yKTtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0VsbGlwc2UocGVuLCAtU2hlZXRNdXNpYy5Ob3RlV2lkdGgvMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgKyAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQtMyk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIEJydXNoIGJydXNoID0gQnJ1c2hlcy5CbGFjaztcbiAgICAgICAgICAgICAgICBpZiAocGVuLkNvbG9yICE9IENvbG9yLkJsYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGJydXNoID0gbmV3IFNvbGlkQnJ1c2gocGVuLkNvbG9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZy5GaWxsRWxsaXBzZShicnVzaCwgLVNoZWV0TXVzaWMuTm90ZVdpZHRoLzIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLVNoZWV0TXVzaWMuTm90ZUhlaWdodC8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQtMSk7XG4gICAgICAgICAgICAgICAgaWYgKHBlbi5Db2xvciAhPSBDb2xvci5CbGFjaykge1xuICAgICAgICAgICAgICAgICAgICBicnVzaC5EaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwZW4uQ29sb3IgPSBDb2xvci5CbGFjaztcbiAgICAgICAgICAgIGcuRHJhd0VsbGlwc2UocGVuLCAtU2hlZXRNdXNpYy5Ob3RlV2lkdGgvMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC1TaGVldE11c2ljLk5vdGVIZWlnaHQvMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZVdpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LTEpO1xuXG4gICAgICAgICAgICBnLlJvdGF0ZVRyYW5zZm9ybSg0NSk7XG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSggLSAoeG5vdGUgKyBTaGVldE11c2ljLk5vdGVXaWR0aC8yICsgMSksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gKHlub3RlIC0gU2hlZXRNdXNpYy5MaW5lV2lkdGggKyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQvMikpO1xuXG4gICAgICAgICAgICAvKiBEcmF3IGEgZG90IGlmIHRoaXMgaXMgYSBkb3R0ZWQgZHVyYXRpb24uICovXG4gICAgICAgICAgICBpZiAobm90ZS5kdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkSGFsZiB8fFxuICAgICAgICAgICAgICAgIG5vdGUuZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZFF1YXJ0ZXIgfHxcbiAgICAgICAgICAgICAgICBub3RlLmR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGgpIHtcblxuICAgICAgICAgICAgICAgIGcuRmlsbEVsbGlwc2UoQnJ1c2hlcy5CbGFjaywgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4bm90ZSArIFNoZWV0TXVzaWMuTm90ZVdpZHRoICsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxpbmVTcGFjZS8zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeW5vdGUgKyBTaGVldE11c2ljLkxpbmVTcGFjZS8zLCA0LCA0KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBEcmF3IGhvcml6b250YWwgbGluZXMgaWYgbm90ZSBpcyBhYm92ZS9iZWxvdyB0aGUgc3RhZmYgKi9cbiAgICAgICAgICAgIFdoaXRlTm90ZSB0b3AgPSB0b3BzdGFmZi5BZGQoMSk7XG4gICAgICAgICAgICBpbnQgZGlzdCA9IG5vdGUud2hpdGVub3RlLkRpc3QodG9wKTtcbiAgICAgICAgICAgIGludCB5ID0geXRvcCAtIFNoZWV0TXVzaWMuTGluZVdpZHRoO1xuXG4gICAgICAgICAgICBpZiAoZGlzdCA+PSAyKSB7XG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDI7IGkgPD0gZGlzdDsgaSArPSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIHkgLT0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeG5vdGUgLSBTaGVldE11c2ljLkxpbmVTcGFjZS80LCB5LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhub3RlICsgU2hlZXRNdXNpYy5Ob3RlV2lkdGggKyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQsIHkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgV2hpdGVOb3RlIGJvdHRvbSA9IHRvcC5BZGQoLTgpO1xuICAgICAgICAgICAgeSA9IHl0b3AgKyAoU2hlZXRNdXNpYy5MaW5lU3BhY2UgKyBTaGVldE11c2ljLkxpbmVXaWR0aCkgKiA0IC0gMTtcbiAgICAgICAgICAgIGRpc3QgPSBib3R0b20uRGlzdChub3RlLndoaXRlbm90ZSk7XG4gICAgICAgICAgICBpZiAoZGlzdCA+PSAyKSB7XG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDI7IGkgPD0gZGlzdDsgaSs9IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgeSArPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4bm90ZSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQsIHksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeG5vdGUgKyBTaGVldE11c2ljLk5vdGVXaWR0aCArIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCwgeSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyogRW5kIGRyYXdpbmcgaG9yaXpvbnRhbCBsaW5lcyAqL1xuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgbm90ZSBsZXR0ZXJzIChBLCBBIywgQmIsIGV0YykgbmV4dCB0byB0aGUgbm90ZSBjaXJjbGVzLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEBwYXJhbSB0b3BzdGFmZiBUaGUgd2hpdGUgbm90ZSBvZiB0aGUgdG9wIG9mIHRoZSBzdGFmZi5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3Tm90ZUxldHRlcnMoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3AsIFdoaXRlTm90ZSB0b3BzdGFmZikge1xuICAgICAgICBib29sIG92ZXJsYXAgPSBOb3Rlc092ZXJsYXAobm90ZWRhdGEsIDAsIG5vdGVkYXRhLkxlbmd0aCk7XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG5cbiAgICAgICAgZm9yZWFjaCAoTm90ZURhdGEgbm90ZSBpbiBub3RlZGF0YSkge1xuICAgICAgICAgICAgaWYgKCFub3RlLmxlZnRzaWRlKSB7XG4gICAgICAgICAgICAgICAgLyogVGhlcmUncyBub3QgZW5vdWdodCBwaXhlbCByb29tIHRvIHNob3cgdGhlIGxldHRlciAqL1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBHZXQgdGhlIHgseSBwb3NpdGlvbiB0byBkcmF3IHRoZSBub3RlICovXG4gICAgICAgICAgICBpbnQgeW5vdGUgPSB5dG9wICsgdG9wc3RhZmYuRGlzdChub3RlLndoaXRlbm90ZSkgKiBcbiAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG4gICAgICAgICAgICAvKiBEcmF3IHRoZSBsZXR0ZXIgdG8gdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIG5vdGUgKi9cbiAgICAgICAgICAgIGludCB4bm90ZSA9IFNoZWV0TXVzaWMuTm90ZVdpZHRoICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvNDtcblxuICAgICAgICAgICAgaWYgKG5vdGUuZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEhhbGYgfHxcbiAgICAgICAgICAgICAgICBub3RlLmR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRRdWFydGVyIHx8XG4gICAgICAgICAgICAgICAgbm90ZS5kdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoIHx8IG92ZXJsYXApIHtcblxuICAgICAgICAgICAgICAgIHhub3RlICs9IFNoZWV0TXVzaWMuTm90ZVdpZHRoLzI7XG4gICAgICAgICAgICB9IFxuICAgICAgICAgICAgZy5EcmF3U3RyaW5nKE5vdGVOYW1lKG5vdGUubnVtYmVyLCBub3RlLndoaXRlbm90ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5MZXR0ZXJGb250LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICBCcnVzaGVzLkJsYWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHhub3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHlub3RlIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKiogUmV0dXJuIHRydWUgaWYgdGhlIGNob3JkcyBjYW4gYmUgY29ubmVjdGVkLCB3aGVyZSB0aGVpciBzdGVtcyBhcmVcbiAgICAgKiBqb2luZWQgYnkgYSBob3Jpem9udGFsIGJlYW0uIEluIG9yZGVyIHRvIGNyZWF0ZSB0aGUgYmVhbTpcbiAgICAgKlxuICAgICAqIC0gVGhlIGNob3JkcyBtdXN0IGJlIGluIHRoZSBzYW1lIG1lYXN1cmUuXG4gICAgICogLSBUaGUgY2hvcmQgc3RlbXMgc2hvdWxkIG5vdCBiZSBhIGRvdHRlZCBkdXJhdGlvbi5cbiAgICAgKiAtIFRoZSBjaG9yZCBzdGVtcyBtdXN0IGJlIHRoZSBzYW1lIGR1cmF0aW9uLCB3aXRoIG9uZSBleGNlcHRpb25cbiAgICAgKiAgIChEb3R0ZWQgRWlnaHRoIHRvIFNpeHRlZW50aCkuXG4gICAgICogLSBUaGUgc3RlbXMgbXVzdCBhbGwgcG9pbnQgaW4gdGhlIHNhbWUgZGlyZWN0aW9uICh1cCBvciBkb3duKS5cbiAgICAgKiAtIFRoZSBjaG9yZCBjYW5ub3QgYWxyZWFkeSBiZSBwYXJ0IG9mIGEgYmVhbS5cbiAgICAgKlxuICAgICAqIC0gNi1jaG9yZCBiZWFtcyBtdXN0IGJlIDh0aCBub3RlcyBpbiAzLzQsIDYvOCwgb3IgNi80IHRpbWVcbiAgICAgKiAtIDMtY2hvcmQgYmVhbXMgbXVzdCBiZSBlaXRoZXIgdHJpcGxldHMsIG9yIDh0aCBub3RlcyAoMTIvOCB0aW1lIHNpZ25hdHVyZSlcbiAgICAgKiAtIDQtY2hvcmQgYmVhbXMgYXJlIG9rIGZvciAyLzIsIDIvNCBvciA0LzQgdGltZSwgYW55IGR1cmF0aW9uXG4gICAgICogLSA0LWNob3JkIGJlYW1zIGFyZSBvayBmb3Igb3RoZXIgdGltZXMgaWYgdGhlIGR1cmF0aW9uIGlzIDE2dGhcbiAgICAgKiAtIDItY2hvcmQgYmVhbXMgYXJlIG9rIGZvciBhbnkgZHVyYXRpb25cbiAgICAgKlxuICAgICAqIElmIHN0YXJ0UXVhcnRlciBpcyB0cnVlLCB0aGUgZmlyc3Qgbm90ZSBzaG91bGQgc3RhcnQgb24gYSBxdWFydGVyIG5vdGVcbiAgICAgKiAob25seSBhcHBsaWVzIHRvIDItY2hvcmQgYmVhbXMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgXG4gICAgYm9vbCBDYW5DcmVhdGVCZWFtKENob3JkU3ltYm9sW10gY2hvcmRzLCBUaW1lU2lnbmF0dXJlIHRpbWUsIGJvb2wgc3RhcnRRdWFydGVyKSB7XG4gICAgICAgIGludCBudW1DaG9yZHMgPSBjaG9yZHMuTGVuZ3RoO1xuICAgICAgICBTdGVtIGZpcnN0U3RlbSA9IGNob3Jkc1swXS5TdGVtO1xuICAgICAgICBTdGVtIGxhc3RTdGVtID0gY2hvcmRzW2Nob3Jkcy5MZW5ndGgtMV0uU3RlbTtcbiAgICAgICAgaWYgKGZpcnN0U3RlbSA9PSBudWxsIHx8IGxhc3RTdGVtID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpbnQgbWVhc3VyZSA9IGNob3Jkc1swXS5TdGFydFRpbWUgLyB0aW1lLk1lYXN1cmU7XG4gICAgICAgIE5vdGVEdXJhdGlvbiBkdXIgPSBmaXJzdFN0ZW0uRHVyYXRpb247XG4gICAgICAgIE5vdGVEdXJhdGlvbiBkdXIyID0gbGFzdFN0ZW0uRHVyYXRpb247XG5cbiAgICAgICAgYm9vbCBkb3R0ZWQ4X3RvXzE2ID0gZmFsc2U7XG4gICAgICAgIGlmIChjaG9yZHMuTGVuZ3RoID09IDIgJiYgZHVyID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGggJiZcbiAgICAgICAgICAgIGR1cjIgPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCkge1xuICAgICAgICAgICAgZG90dGVkOF90b18xNiA9IHRydWU7XG4gICAgICAgIH0gXG5cbiAgICAgICAgaWYgKGR1ciA9PSBOb3RlRHVyYXRpb24uV2hvbGUgfHwgZHVyID09IE5vdGVEdXJhdGlvbi5IYWxmIHx8XG4gICAgICAgICAgICBkdXIgPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEhhbGYgfHwgZHVyID09IE5vdGVEdXJhdGlvbi5RdWFydGVyIHx8XG4gICAgICAgICAgICBkdXIgPT0gTm90ZUR1cmF0aW9uLkRvdHRlZFF1YXJ0ZXIgfHxcbiAgICAgICAgICAgIChkdXIgPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCAmJiAhZG90dGVkOF90b18xNikpIHtcblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG51bUNob3JkcyA9PSA2KSB7XG4gICAgICAgICAgICBpZiAoZHVyICE9IE5vdGVEdXJhdGlvbi5FaWdodGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBib29sIGNvcnJlY3RUaW1lID0gXG4gICAgICAgICAgICAgICAoKHRpbWUuTnVtZXJhdG9yID09IDMgJiYgdGltZS5EZW5vbWluYXRvciA9PSA0KSB8fFxuICAgICAgICAgICAgICAgICh0aW1lLk51bWVyYXRvciA9PSA2ICYmIHRpbWUuRGVub21pbmF0b3IgPT0gOCkgfHxcbiAgICAgICAgICAgICAgICAodGltZS5OdW1lcmF0b3IgPT0gNiAmJiB0aW1lLkRlbm9taW5hdG9yID09IDQpICk7XG5cbiAgICAgICAgICAgIGlmICghY29ycmVjdFRpbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aW1lLk51bWVyYXRvciA9PSA2ICYmIHRpbWUuRGVub21pbmF0b3IgPT0gNCkge1xuICAgICAgICAgICAgICAgIC8qIGZpcnN0IGNob3JkIG11c3Qgc3RhcnQgYXQgMXN0IG9yIDR0aCBxdWFydGVyIG5vdGUgKi9cbiAgICAgICAgICAgICAgICBpbnQgYmVhdCA9IHRpbWUuUXVhcnRlciAqIDM7XG4gICAgICAgICAgICAgICAgaWYgKChjaG9yZHNbMF0uU3RhcnRUaW1lICUgYmVhdCkgPiB0aW1lLlF1YXJ0ZXIvNikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChudW1DaG9yZHMgPT0gNCkge1xuICAgICAgICAgICAgaWYgKHRpbWUuTnVtZXJhdG9yID09IDMgJiYgdGltZS5EZW5vbWluYXRvciA9PSA4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYm9vbCBjb3JyZWN0VGltZSA9IFxuICAgICAgICAgICAgICAodGltZS5OdW1lcmF0b3IgPT0gMiB8fCB0aW1lLk51bWVyYXRvciA9PSA0IHx8IHRpbWUuTnVtZXJhdG9yID09IDgpO1xuICAgICAgICAgICAgaWYgKCFjb3JyZWN0VGltZSAmJiBkdXIgIT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogY2hvcmQgbXVzdCBzdGFydCBvbiBxdWFydGVyIG5vdGUgKi9cbiAgICAgICAgICAgIGludCBiZWF0ID0gdGltZS5RdWFydGVyO1xuICAgICAgICAgICAgaWYgKGR1ciA9PSBOb3RlRHVyYXRpb24uRWlnaHRoKSB7XG4gICAgICAgICAgICAgICAgLyogOHRoIG5vdGUgY2hvcmQgbXVzdCBzdGFydCBvbiAxc3Qgb3IgM3JkIHF1YXJ0ZXIgbm90ZSAqL1xuICAgICAgICAgICAgICAgIGJlYXQgPSB0aW1lLlF1YXJ0ZXIgKiAyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZHVyID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcbiAgICAgICAgICAgICAgICAvKiAzMm5kIG5vdGUgbXVzdCBzdGFydCBvbiBhbiA4dGggYmVhdCAqL1xuICAgICAgICAgICAgICAgIGJlYXQgPSB0aW1lLlF1YXJ0ZXIgLyAyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoKGNob3Jkc1swXS5TdGFydFRpbWUgJSBiZWF0KSA+IHRpbWUuUXVhcnRlci82KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG51bUNob3JkcyA9PSAzKSB7XG4gICAgICAgICAgICBib29sIHZhbGlkID0gKGR1ciA9PSBOb3RlRHVyYXRpb24uVHJpcGxldCkgfHwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgIChkdXIgPT0gTm90ZUR1cmF0aW9uLkVpZ2h0aCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5OdW1lcmF0b3IgPT0gMTIgJiYgdGltZS5EZW5vbWluYXRvciA9PSA4KTtcbiAgICAgICAgICAgIGlmICghdmFsaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIGNob3JkIG11c3Qgc3RhcnQgb24gcXVhcnRlciBub3RlICovXG4gICAgICAgICAgICBpbnQgYmVhdCA9IHRpbWUuUXVhcnRlcjtcbiAgICAgICAgICAgIGlmICh0aW1lLk51bWVyYXRvciA9PSAxMiAmJiB0aW1lLkRlbm9taW5hdG9yID09IDgpIHtcbiAgICAgICAgICAgICAgICAvKiBJbiAxMi84IHRpbWUsIGNob3JkIG11c3Qgc3RhcnQgb24gMyo4dGggYmVhdCAqL1xuICAgICAgICAgICAgICAgIGJlYXQgPSB0aW1lLlF1YXJ0ZXIvMiAqIDM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoKGNob3Jkc1swXS5TdGFydFRpbWUgJSBiZWF0KSA+IHRpbWUuUXVhcnRlci82KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZWxzZSBpZiAobnVtQ2hvcmRzID09IDIpIHtcbiAgICAgICAgICAgIGlmIChzdGFydFF1YXJ0ZXIpIHtcbiAgICAgICAgICAgICAgICBpbnQgYmVhdCA9IHRpbWUuUXVhcnRlcjtcbiAgICAgICAgICAgICAgICBpZiAoKGNob3Jkc1swXS5TdGFydFRpbWUgJSBiZWF0KSA+IHRpbWUuUXVhcnRlci82KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3JlYWNoIChDaG9yZFN5bWJvbCBjaG9yZCBpbiBjaG9yZHMpIHtcbiAgICAgICAgICAgIGlmICgoY2hvcmQuU3RhcnRUaW1lIC8gdGltZS5NZWFzdXJlKSAhPSBtZWFzdXJlKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmIChjaG9yZC5TdGVtID09IG51bGwpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgaWYgKGNob3JkLlN0ZW0uRHVyYXRpb24gIT0gZHVyICYmICFkb3R0ZWQ4X3RvXzE2KVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmIChjaG9yZC5TdGVtLmlzQmVhbSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBDaGVjayB0aGF0IGFsbCBzdGVtcyBjYW4gcG9pbnQgaW4gc2FtZSBkaXJlY3Rpb24gKi9cbiAgICAgICAgYm9vbCBoYXNUd29TdGVtcyA9IGZhbHNlO1xuICAgICAgICBpbnQgZGlyZWN0aW9uID0gU3RlbS5VcDsgXG4gICAgICAgIGZvcmVhY2ggKENob3JkU3ltYm9sIGNob3JkIGluIGNob3Jkcykge1xuICAgICAgICAgICAgaWYgKGNob3JkLkhhc1R3b1N0ZW1zKSB7XG4gICAgICAgICAgICAgICAgaWYgKGhhc1R3b1N0ZW1zICYmIGNob3JkLlN0ZW0uRGlyZWN0aW9uICE9IGRpcmVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGhhc1R3b1N0ZW1zID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSBjaG9yZC5TdGVtLkRpcmVjdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIEdldCB0aGUgZmluYWwgc3RlbSBkaXJlY3Rpb24gKi9cbiAgICAgICAgaWYgKCFoYXNUd29TdGVtcykge1xuICAgICAgICAgICAgV2hpdGVOb3RlIG5vdGUxO1xuICAgICAgICAgICAgV2hpdGVOb3RlIG5vdGUyO1xuICAgICAgICAgICAgbm90ZTEgPSAoZmlyc3RTdGVtLkRpcmVjdGlvbiA9PSBTdGVtLlVwID8gZmlyc3RTdGVtLlRvcCA6IGZpcnN0U3RlbS5Cb3R0b20pO1xuICAgICAgICAgICAgbm90ZTIgPSAobGFzdFN0ZW0uRGlyZWN0aW9uID09IFN0ZW0uVXAgPyBsYXN0U3RlbS5Ub3AgOiBsYXN0U3RlbS5Cb3R0b20pO1xuICAgICAgICAgICAgZGlyZWN0aW9uID0gU3RlbURpcmVjdGlvbihub3RlMSwgbm90ZTIsIGNob3Jkc1swXS5DbGVmKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIElmIHRoZSBub3RlcyBhcmUgdG9vIGZhciBhcGFydCwgZG9uJ3QgdXNlIGEgYmVhbSAqL1xuICAgICAgICBpZiAoZGlyZWN0aW9uID09IFN0ZW0uVXApIHtcbiAgICAgICAgICAgIGlmIChNYXRoLkFicyhmaXJzdFN0ZW0uVG9wLkRpc3QobGFzdFN0ZW0uVG9wKSkgPj0gMTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoTWF0aC5BYnMoZmlyc3RTdGVtLkJvdHRvbS5EaXN0KGxhc3RTdGVtLkJvdHRvbSkpID49IDExKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuXG4gICAgLyoqIENvbm5lY3QgdGhlIGNob3JkcyB1c2luZyBhIGhvcml6b250YWwgYmVhbS4gXG4gICAgICpcbiAgICAgKiBzcGFjaW5nIGlzIHRoZSBob3Jpem9udGFsIGRpc3RhbmNlIChpbiBwaXhlbHMpIGJldHdlZW4gdGhlIHJpZ2h0IHNpZGUgXG4gICAgICogb2YgdGhlIGZpcnN0IGNob3JkLCBhbmQgdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIGxhc3QgY2hvcmQuXG4gICAgICpcbiAgICAgKiBUbyBtYWtlIHRoZSBiZWFtOlxuICAgICAqIC0gQ2hhbmdlIHRoZSBzdGVtIGRpcmVjdGlvbnMgZm9yIGVhY2ggY2hvcmQsIHNvIHRoZXkgbWF0Y2guXG4gICAgICogLSBJbiB0aGUgZmlyc3QgY2hvcmQsIHBhc3MgdGhlIHN0ZW0gbG9jYXRpb24gb2YgdGhlIGxhc3QgY2hvcmQsIGFuZFxuICAgICAqICAgdGhlIGhvcml6b250YWwgc3BhY2luZyB0byB0aGF0IGxhc3Qgc3RlbS5cbiAgICAgKiAtIE1hcmsgYWxsIGNob3JkcyAoZXhjZXB0IHRoZSBmaXJzdCkgYXMgXCJyZWNlaXZlclwiIHBhaXJzLCBzbyB0aGF0IFxuICAgICAqICAgdGhleSBkb24ndCBkcmF3IGEgY3Vydnkgc3RlbS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIFxuICAgIHZvaWQgQ3JlYXRlQmVhbShDaG9yZFN5bWJvbFtdIGNob3JkcywgaW50IHNwYWNpbmcpIHtcbiAgICAgICAgU3RlbSBmaXJzdFN0ZW0gPSBjaG9yZHNbMF0uU3RlbTtcbiAgICAgICAgU3RlbSBsYXN0U3RlbSA9IGNob3Jkc1tjaG9yZHMuTGVuZ3RoLTFdLlN0ZW07XG5cbiAgICAgICAgLyogQ2FsY3VsYXRlIHRoZSBuZXcgc3RlbSBkaXJlY3Rpb24gKi9cbiAgICAgICAgaW50IG5ld2RpcmVjdGlvbiA9IC0xO1xuICAgICAgICBmb3JlYWNoIChDaG9yZFN5bWJvbCBjaG9yZCBpbiBjaG9yZHMpIHtcbiAgICAgICAgICAgIGlmIChjaG9yZC5IYXNUd29TdGVtcykge1xuICAgICAgICAgICAgICAgIG5ld2RpcmVjdGlvbiA9IGNob3JkLlN0ZW0uRGlyZWN0aW9uO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5ld2RpcmVjdGlvbiA9PSAtMSkge1xuICAgICAgICAgICAgV2hpdGVOb3RlIG5vdGUxO1xuICAgICAgICAgICAgV2hpdGVOb3RlIG5vdGUyO1xuICAgICAgICAgICAgbm90ZTEgPSAoZmlyc3RTdGVtLkRpcmVjdGlvbiA9PSBTdGVtLlVwID8gZmlyc3RTdGVtLlRvcCA6IGZpcnN0U3RlbS5Cb3R0b20pO1xuICAgICAgICAgICAgbm90ZTIgPSAobGFzdFN0ZW0uRGlyZWN0aW9uID09IFN0ZW0uVXAgPyBsYXN0U3RlbS5Ub3AgOiBsYXN0U3RlbS5Cb3R0b20pO1xuICAgICAgICAgICAgbmV3ZGlyZWN0aW9uID0gU3RlbURpcmVjdGlvbihub3RlMSwgbm90ZTIsIGNob3Jkc1swXS5DbGVmKTtcbiAgICAgICAgfVxuICAgICAgICBmb3JlYWNoIChDaG9yZFN5bWJvbCBjaG9yZCBpbiBjaG9yZHMpIHtcbiAgICAgICAgICAgIGNob3JkLlN0ZW0uRGlyZWN0aW9uID0gbmV3ZGlyZWN0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNob3Jkcy5MZW5ndGggPT0gMikge1xuICAgICAgICAgICAgQnJpbmdTdGVtc0Nsb3NlcihjaG9yZHMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgTGluZVVwU3RlbUVuZHMoY2hvcmRzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZpcnN0U3RlbS5TZXRQYWlyKGxhc3RTdGVtLCBzcGFjaW5nKTtcbiAgICAgICAgZm9yIChpbnQgaSA9IDE7IGkgPCBjaG9yZHMuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNob3Jkc1tpXS5TdGVtLlJlY2VpdmVyID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBXZSdyZSBjb25uZWN0aW5nIHRoZSBzdGVtcyBvZiB0d28gY2hvcmRzIHVzaW5nIGEgaG9yaXpvbnRhbCBiZWFtLlxuICAgICAqICBBZGp1c3QgdGhlIHZlcnRpY2FsIGVuZHBvaW50IG9mIHRoZSBzdGVtcywgc28gdGhhdCB0aGV5J3JlIGNsb3NlclxuICAgICAqICB0b2dldGhlci4gIEZvciBhIGRvdHRlZCA4dGggdG8gMTZ0aCBiZWFtLCBpbmNyZWFzZSB0aGUgc3RlbSBvZiB0aGVcbiAgICAgKiAgZG90dGVkIGVpZ2h0aCwgc28gdGhhdCBpdCdzIGFzIGxvbmcgYXMgYSAxNnRoIHN0ZW0uXG4gICAgICovXG4gICAgc3RhdGljIHZvaWRcbiAgICBCcmluZ1N0ZW1zQ2xvc2VyKENob3JkU3ltYm9sW10gY2hvcmRzKSB7XG4gICAgICAgIFN0ZW0gZmlyc3RTdGVtID0gY2hvcmRzWzBdLlN0ZW07XG4gICAgICAgIFN0ZW0gbGFzdFN0ZW0gPSBjaG9yZHNbMV0uU3RlbTtcblxuICAgICAgICAvKiBJZiB3ZSdyZSBjb25uZWN0aW5nIGEgZG90dGVkIDh0aCB0byBhIDE2dGgsIGluY3JlYXNlXG4gICAgICAgICAqIHRoZSBzdGVtIGVuZCBvZiB0aGUgZG90dGVkIGVpZ2h0aC5cbiAgICAgICAgICovXG4gICAgICAgIGlmIChmaXJzdFN0ZW0uRHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCAmJlxuICAgICAgICAgICAgbGFzdFN0ZW0uRHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCkge1xuICAgICAgICAgICAgaWYgKGZpcnN0U3RlbS5EaXJlY3Rpb24gPT0gU3RlbS5VcCkge1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSBmaXJzdFN0ZW0uRW5kLkFkZCgyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSBmaXJzdFN0ZW0uRW5kLkFkZCgtMik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBCcmluZyB0aGUgc3RlbSBlbmRzIGNsb3NlciB0b2dldGhlciAqL1xuICAgICAgICBpbnQgZGlzdGFuY2UgPSBNYXRoLkFicyhmaXJzdFN0ZW0uRW5kLkRpc3QobGFzdFN0ZW0uRW5kKSk7XG4gICAgICAgIGlmIChmaXJzdFN0ZW0uRGlyZWN0aW9uID09IFN0ZW0uVXApIHtcbiAgICAgICAgICAgIGlmIChXaGl0ZU5vdGUuTWF4KGZpcnN0U3RlbS5FbmQsIGxhc3RTdGVtLkVuZCkgPT0gZmlyc3RTdGVtLkVuZClcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSBsYXN0U3RlbS5FbmQuQWRkKGRpc3RhbmNlLzIpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSBmaXJzdFN0ZW0uRW5kLkFkZChkaXN0YW5jZS8yKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChXaGl0ZU5vdGUuTWluKGZpcnN0U3RlbS5FbmQsIGxhc3RTdGVtLkVuZCkgPT0gZmlyc3RTdGVtLkVuZClcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSBsYXN0U3RlbS5FbmQuQWRkKC1kaXN0YW5jZS8yKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmaXJzdFN0ZW0uRW5kID0gZmlyc3RTdGVtLkVuZC5BZGQoLWRpc3RhbmNlLzIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFdlJ3JlIGNvbm5lY3RpbmcgdGhlIHN0ZW1zIG9mIHRocmVlIG9yIG1vcmUgY2hvcmRzIHVzaW5nIGEgaG9yaXpvbnRhbCBiZWFtLlxuICAgICAqICBBZGp1c3QgdGhlIHZlcnRpY2FsIGVuZHBvaW50IG9mIHRoZSBzdGVtcywgc28gdGhhdCB0aGUgbWlkZGxlIGNob3JkIHN0ZW1zXG4gICAgICogIGFyZSB2ZXJ0aWNhbGx5IGluIGJldHdlZW4gdGhlIGZpcnN0IGFuZCBsYXN0IHN0ZW0uXG4gICAgICovXG4gICAgc3RhdGljIHZvaWRcbiAgICBMaW5lVXBTdGVtRW5kcyhDaG9yZFN5bWJvbFtdIGNob3Jkcykge1xuICAgICAgICBTdGVtIGZpcnN0U3RlbSA9IGNob3Jkc1swXS5TdGVtO1xuICAgICAgICBTdGVtIGxhc3RTdGVtID0gY2hvcmRzW2Nob3Jkcy5MZW5ndGgtMV0uU3RlbTtcbiAgICAgICAgU3RlbSBtaWRkbGVTdGVtID0gY2hvcmRzWzFdLlN0ZW07XG5cbiAgICAgICAgaWYgKGZpcnN0U3RlbS5EaXJlY3Rpb24gPT0gU3RlbS5VcCkge1xuICAgICAgICAgICAgLyogRmluZCB0aGUgaGlnaGVzdCBzdGVtLiBUaGUgYmVhbSB3aWxsIGVpdGhlcjpcbiAgICAgICAgICAgICAqIC0gU2xhbnQgZG93bndhcmRzIChmaXJzdCBzdGVtIGlzIGhpZ2hlc3QpXG4gICAgICAgICAgICAgKiAtIFNsYW50IHVwd2FyZHMgKGxhc3Qgc3RlbSBpcyBoaWdoZXN0KVxuICAgICAgICAgICAgICogLSBCZSBzdHJhaWdodCAobWlkZGxlIHN0ZW0gaXMgaGlnaGVzdClcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgV2hpdGVOb3RlIHRvcCA9IGZpcnN0U3RlbS5FbmQ7XG4gICAgICAgICAgICBmb3JlYWNoIChDaG9yZFN5bWJvbCBjaG9yZCBpbiBjaG9yZHMpIHtcbiAgICAgICAgICAgICAgICB0b3AgPSBXaGl0ZU5vdGUuTWF4KHRvcCwgY2hvcmQuU3RlbS5FbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRvcCA9PSBmaXJzdFN0ZW0uRW5kICYmIHRvcC5EaXN0KGxhc3RTdGVtLkVuZCkgPj0gMikge1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSB0b3A7XG4gICAgICAgICAgICAgICAgbWlkZGxlU3RlbS5FbmQgPSB0b3AuQWRkKC0xKTtcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSB0b3AuQWRkKC0yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRvcCA9PSBsYXN0U3RlbS5FbmQgJiYgdG9wLkRpc3QoZmlyc3RTdGVtLkVuZCkgPj0gMikge1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSB0b3AuQWRkKC0yKTtcbiAgICAgICAgICAgICAgICBtaWRkbGVTdGVtLkVuZCA9IHRvcC5BZGQoLTEpO1xuICAgICAgICAgICAgICAgIGxhc3RTdGVtLkVuZCA9IHRvcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSB0b3A7XG4gICAgICAgICAgICAgICAgbWlkZGxlU3RlbS5FbmQgPSB0b3A7XG4gICAgICAgICAgICAgICAgbGFzdFN0ZW0uRW5kID0gdG9wO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLyogRmluZCB0aGUgYm90dG9tbW9zdCBzdGVtLiBUaGUgYmVhbSB3aWxsIGVpdGhlcjpcbiAgICAgICAgICAgICAqIC0gU2xhbnQgdXB3YXJkcyAoZmlyc3Qgc3RlbSBpcyBsb3dlc3QpXG4gICAgICAgICAgICAgKiAtIFNsYW50IGRvd253YXJkcyAobGFzdCBzdGVtIGlzIGxvd2VzdClcbiAgICAgICAgICAgICAqIC0gQmUgc3RyYWlnaHQgKG1pZGRsZSBzdGVtIGlzIGhpZ2hlc3QpXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFdoaXRlTm90ZSBib3R0b20gPSBmaXJzdFN0ZW0uRW5kO1xuICAgICAgICAgICAgZm9yZWFjaCAoQ2hvcmRTeW1ib2wgY2hvcmQgaW4gY2hvcmRzKSB7XG4gICAgICAgICAgICAgICAgYm90dG9tID0gV2hpdGVOb3RlLk1pbihib3R0b20sIGNob3JkLlN0ZW0uRW5kKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGJvdHRvbSA9PSBmaXJzdFN0ZW0uRW5kICYmIGxhc3RTdGVtLkVuZC5EaXN0KGJvdHRvbSkgPj0gMikge1xuICAgICAgICAgICAgICAgIG1pZGRsZVN0ZW0uRW5kID0gYm90dG9tLkFkZCgxKTtcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSBib3R0b20uQWRkKDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoYm90dG9tID09IGxhc3RTdGVtLkVuZCAmJiBmaXJzdFN0ZW0uRW5kLkRpc3QoYm90dG9tKSA+PSAyKSB7XG4gICAgICAgICAgICAgICAgbWlkZGxlU3RlbS5FbmQgPSBib3R0b20uQWRkKDEpO1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSBib3R0b20uQWRkKDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZmlyc3RTdGVtLkVuZCA9IGJvdHRvbTtcbiAgICAgICAgICAgICAgICBtaWRkbGVTdGVtLkVuZCA9IGJvdHRvbTtcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSBib3R0b207XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBBbGwgbWlkZGxlIHN0ZW1zIGhhdmUgdGhlIHNhbWUgZW5kICovXG4gICAgICAgIGZvciAoaW50IGkgPSAxOyBpIDwgY2hvcmRzLkxlbmd0aC0xOyBpKyspIHtcbiAgICAgICAgICAgIFN0ZW0gc3RlbSA9IGNob3Jkc1tpXS5TdGVtO1xuICAgICAgICAgICAgc3RlbS5FbmQgPSBtaWRkbGVTdGVtLkVuZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHN0cmluZyByZXN1bHQgPSBzdHJpbmcuRm9ybWF0KFwiQ2hvcmRTeW1ib2wgY2xlZj17MH0gc3RhcnQ9ezF9IGVuZD17Mn0gd2lkdGg9ezN9IGhhc3R3b3N0ZW1zPXs0fSBcIiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWYsIFN0YXJ0VGltZSwgRW5kVGltZSwgV2lkdGgsIGhhc3R3b3N0ZW1zKTtcbiAgICAgICAgZm9yZWFjaCAoQWNjaWRTeW1ib2wgc3ltYm9sIGluIGFjY2lkc3ltYm9scykge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHN5bWJvbC5Ub1N0cmluZygpICsgXCIgXCI7XG4gICAgICAgIH1cbiAgICAgICAgZm9yZWFjaCAoTm90ZURhdGEgbm90ZSBpbiBub3RlZGF0YSkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHN0cmluZy5Gb3JtYXQoXCJOb3RlIHdoaXRlbm90ZT17MH0gZHVyYXRpb249ezF9IGxlZnRzaWRlPXsyfSBcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGUud2hpdGVub3RlLCBub3RlLmR1cmF0aW9uLCBub3RlLmxlZnRzaWRlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RlbTEgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHN0ZW0xLlRvU3RyaW5nKCkgKyBcIiBcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RlbTIgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHN0ZW0yLlRvU3RyaW5nKCkgKyBcIiBcIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0OyBcbiAgICB9XG5cbn1cblxuXG59XG5cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogVGhlIHBvc3NpYmxlIGNsZWZzLCBUcmVibGUgb3IgQmFzcyAqL1xucHVibGljIGVudW0gQ2xlZiB7IFRyZWJsZSwgQmFzcyB9O1xuXG4vKiogQGNsYXNzIENsZWZTeW1ib2wgXG4gKiBBIENsZWZTeW1ib2wgcmVwcmVzZW50cyBlaXRoZXIgYSBUcmVibGUgb3IgQmFzcyBDbGVmIGltYWdlLlxuICogVGhlIGNsZWYgY2FuIGJlIGVpdGhlciBub3JtYWwgb3Igc21hbGwgc2l6ZS4gIE5vcm1hbCBzaXplIGlzXG4gKiB1c2VkIGF0IHRoZSBiZWdpbm5pbmcgb2YgYSBuZXcgc3RhZmYsIG9uIHRoZSBsZWZ0IHNpZGUuICBUaGVcbiAqIHNtYWxsIHN5bWJvbHMgYXJlIHVzZWQgdG8gc2hvdyBjbGVmIGNoYW5nZXMgd2l0aGluIGEgc3RhZmYuXG4gKi9cblxucHVibGljIGNsYXNzIENsZWZTeW1ib2wgOiBNdXNpY1N5bWJvbCB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgSW1hZ2UgdHJlYmxlOyAgLyoqIFRoZSB0cmVibGUgY2xlZiBpbWFnZSAqL1xuICAgIHByaXZhdGUgc3RhdGljIEltYWdlIGJhc3M7ICAgIC8qKiBUaGUgYmFzcyBjbGVmIGltYWdlICovXG5cbiAgICBwcml2YXRlIGludCBzdGFydHRpbWU7ICAgICAgICAvKiogU3RhcnQgdGltZSBvZiB0aGUgc3ltYm9sICovXG4gICAgcHJpdmF0ZSBib29sIHNtYWxsc2l6ZTsgICAgICAgLyoqIFRydWUgaWYgdGhpcyBpcyBhIHNtYWxsIGNsZWYsIGZhbHNlIG90aGVyd2lzZSAqL1xuICAgIHByaXZhdGUgQ2xlZiBjbGVmOyAgICAgICAgICAgIC8qKiBUaGUgY2xlZiwgVHJlYmxlIG9yIEJhc3MgKi9cbiAgICBwcml2YXRlIGludCB3aWR0aDtcblxuICAgIC8qKiBDcmVhdGUgYSBuZXcgQ2xlZlN5bWJvbCwgd2l0aCB0aGUgZ2l2ZW4gY2xlZiwgc3RhcnR0aW1lLCBhbmQgc2l6ZSAqL1xuICAgIHB1YmxpYyBDbGVmU3ltYm9sKENsZWYgY2xlZiwgaW50IHN0YXJ0dGltZSwgYm9vbCBzbWFsbCkge1xuICAgICAgICB0aGlzLmNsZWYgPSBjbGVmO1xuICAgICAgICB0aGlzLnN0YXJ0dGltZSA9IHN0YXJ0dGltZTtcbiAgICAgICAgc21hbGxzaXplID0gc21hbGw7XG4gICAgICAgIExvYWRJbWFnZXMoKTtcbiAgICAgICAgd2lkdGggPSBNaW5XaWR0aDtcbiAgICB9XG5cbiAgICAvKiogTG9hZCB0aGUgVHJlYmxlL0Jhc3MgY2xlZiBpbWFnZXMgaW50byBtZW1vcnkuICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBMb2FkSW1hZ2VzKCkge1xuICAgICAgICBpZiAodHJlYmxlID09IG51bGwpXG4gICAgICAgICAgICB0cmVibGUgPSBuZXcgQml0bWFwKHR5cGVvZihDbGVmU3ltYm9sKSwgXCJSZXNvdXJjZXMuSW1hZ2VzLnRyZWJsZS5wbmdcIik7XG5cbiAgICAgICAgaWYgKGJhc3MgPT0gbnVsbClcbiAgICAgICAgICAgIGJhc3MgPSBuZXcgQml0bWFwKHR5cGVvZihDbGVmU3ltYm9sKSwgXCJSZXNvdXJjZXMuSW1hZ2VzLmJhc3MucG5nXCIpO1xuXG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgdGltZSAoaW4gcHVsc2VzKSB0aGlzIHN5bWJvbCBvY2N1cnMgYXQuXG4gICAgICogVGhpcyBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgbWVhc3VyZSB0aGlzIHN5bWJvbCBiZWxvbmdzIHRvLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgU3RhcnRUaW1lIHsgXG4gICAgICAgIGdldCB7IHJldHVybiBzdGFydHRpbWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBtaW5pbXVtIHdpZHRoIChpbiBwaXhlbHMpIG5lZWRlZCB0byBkcmF3IHRoaXMgc3ltYm9sICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBNaW5XaWR0aCB7XG4gICAgICAgIGdldCB7IFxuICAgICAgICAgICAgaWYgKHNtYWxsc2l6ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gU2hlZXRNdXNpYy5Ob3RlV2lkdGggKiAyO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiBTaGVldE11c2ljLk5vdGVXaWR0aCAqIDM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogR2V0L1NldCB0aGUgd2lkdGggKGluIHBpeGVscykgb2YgdGhpcyBzeW1ib2wuIFRoZSB3aWR0aCBpcyBzZXRcbiAgICAgKiBpbiBTaGVldE11c2ljLkFsaWduU3ltYm9scygpIHRvIHZlcnRpY2FsbHkgYWxpZ24gc3ltYm9scy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFdpZHRoIHtcbiAgICAgICBnZXQgeyByZXR1cm4gd2lkdGg7IH1cbiAgICAgICBzZXQgeyB3aWR0aCA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGFib3ZlIHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEFib3ZlU3RhZmYgeyBcbiAgICAgICAgZ2V0IHsgXG4gICAgICAgICAgICBpZiAoY2xlZiA9PSBDbGVmLlRyZWJsZSAmJiAhc21hbGxzaXplKVxuICAgICAgICAgICAgICAgIHJldHVybiBTaGVldE11c2ljLk5vdGVIZWlnaHQgKiAyO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGJlbG93IHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEJlbG93U3RhZmYge1xuICAgICAgICBnZXQge1xuICAgICAgICAgICAgaWYgKGNsZWYgPT0gQ2xlZi5UcmVibGUgJiYgIXNtYWxsc2l6ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMjtcbiAgICAgICAgICAgIGVsc2UgaWYgKGNsZWYgPT0gQ2xlZi5UcmVibGUgJiYgc21hbGxzaXplKVxuICAgICAgICAgICAgICAgIHJldHVybiBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgc3ltYm9sLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBcbiAgICB2b2lkIERyYXcoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3ApIHtcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oV2lkdGggLSBNaW5XaWR0aCwgMCk7XG4gICAgICAgIGludCB5ID0geXRvcDtcbiAgICAgICAgSW1hZ2UgaW1hZ2U7XG4gICAgICAgIGludCBoZWlnaHQ7XG5cbiAgICAgICAgLyogR2V0IHRoZSBpbWFnZSwgaGVpZ2h0LCBhbmQgdG9wIHkgcGl4ZWwsIGRlcGVuZGluZyBvbiB0aGUgY2xlZlxuICAgICAgICAgKiBhbmQgdGhlIGltYWdlIHNpemUuXG4gICAgICAgICAqL1xuICAgICAgICBpZiAoY2xlZiA9PSBDbGVmLlRyZWJsZSkge1xuICAgICAgICAgICAgaW1hZ2UgPSB0cmVibGU7XG4gICAgICAgICAgICBpZiAoc21hbGxzaXplKSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gU2hlZXRNdXNpYy5TdGFmZkhlaWdodCArIFNoZWV0TXVzaWMuU3RhZmZIZWlnaHQvNDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gMyAqIFNoZWV0TXVzaWMuU3RhZmZIZWlnaHQvMiArIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICAgICAgICAgIHkgPSB5dG9wIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaW1hZ2UgPSBiYXNzO1xuICAgICAgICAgICAgaWYgKHNtYWxsc2l6ZSkge1xuICAgICAgICAgICAgICAgIGhlaWdodCA9IFNoZWV0TXVzaWMuU3RhZmZIZWlnaHQgLSAzKlNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBTaGVldE11c2ljLlN0YWZmSGVpZ2h0IC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyogU2NhbGUgdGhlIGltYWdlIHdpZHRoIHRvIG1hdGNoIHRoZSBoZWlnaHQgKi9cbiAgICAgICAgaW50IGltZ3dpZHRoID0gaW1hZ2UuV2lkdGggKiBoZWlnaHQgLyBpbWFnZS5IZWlnaHQ7XG4gICAgICAgIGcuRHJhd0ltYWdlKGltYWdlLCAwLCB5LCBpbWd3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShXaWR0aCAtIE1pbldpZHRoKSwgMCk7XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJDbGVmU3ltYm9sIGNsZWY9ezB9IHNtYWxsPXsxfSB3aWR0aD17Mn1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlZiwgc21hbGxzaXplLCB3aWR0aCk7XG4gICAgfVxufVxuXG5cbn1cblxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEZpbGVTdHJlYW06U3RyZWFtXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIEZpbGVTdHJlYW0oc3RyaW5nIGZpbGVuYW1lLCBGaWxlTW9kZSBtb2RlKVxyXG4gICAgICAgIHtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwOS0yMDEyIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG5cbi8qKiBAY2xhc3MgUGlhbm9cbiAqXG4gKiBUaGUgUGlhbm8gQ29udHJvbCBpcyB0aGUgcGFuZWwgYXQgdGhlIHRvcCB0aGF0IGRpc3BsYXlzIHRoZVxuICogcGlhbm8sIGFuZCBoaWdobGlnaHRzIHRoZSBwaWFubyBub3RlcyBkdXJpbmcgcGxheWJhY2suXG4gKiBUaGUgbWFpbiBtZXRob2RzIGFyZTpcbiAqXG4gKiBTZXRNaWRpRmlsZSgpIC0gU2V0IHRoZSBNaWRpIGZpbGUgdG8gdXNlIGZvciBzaGFkaW5nLiAgVGhlIE1pZGkgZmlsZVxuICogICAgICAgICAgICAgICAgIGlzIG5lZWRlZCB0byBkZXRlcm1pbmUgd2hpY2ggbm90ZXMgdG8gc2hhZGUuXG4gKlxuICogU2hhZGVOb3RlcygpIC0gU2hhZGUgbm90ZXMgb24gdGhlIHBpYW5vIHRoYXQgb2NjdXIgYXQgYSBnaXZlbiBwdWxzZSB0aW1lLlxuICpcbiAqL1xucHVibGljIGNsYXNzIFBpYW5vIDogQ29udHJvbCB7XG4gICAgcHVibGljIGNvbnN0IGludCBLZXlzUGVyT2N0YXZlID0gNztcbiAgICBwdWJsaWMgY29uc3QgaW50IE1heE9jdGF2ZSA9IDc7XG5cbiAgICBwcml2YXRlIHN0YXRpYyBpbnQgV2hpdGVLZXlXaWR0aDsgIC8qKiBXaWR0aCBvZiBhIHNpbmdsZSB3aGl0ZSBrZXkgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBpbnQgV2hpdGVLZXlIZWlnaHQ7IC8qKiBIZWlnaHQgb2YgYSBzaW5nbGUgd2hpdGUga2V5ICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50IEJsYWNrS2V5V2lkdGg7ICAvKiogV2lkdGggb2YgYSBzaW5nbGUgYmxhY2sga2V5ICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50IEJsYWNrS2V5SGVpZ2h0OyAvKiogSGVpZ2h0IG9mIGEgc2luZ2xlIGJsYWNrIGtleSAqL1xuICAgIHByaXZhdGUgc3RhdGljIGludCBtYXJnaW47ICAgICAgICAgLyoqIFRoZSB0b3AvbGVmdCBtYXJnaW4gdG8gdGhlIHBpYW5vICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50IEJsYWNrQm9yZGVyOyAgICAvKiogVGhlIHdpZHRoIG9mIHRoZSBibGFjayBib3JkZXIgYXJvdW5kIHRoZSBrZXlzICovXG5cbiAgICBwcml2YXRlIHN0YXRpYyBpbnRbXSBibGFja0tleU9mZnNldHM7ICAgLyoqIFRoZSB4IHBpeGxlcyBvZiB0aGUgYmxhY2sga2V5cyAqL1xuXG4gICAgLyogVGhlIGdyYXkxUGVucyBmb3IgZHJhd2luZyBibGFjay9ncmF5IGxpbmVzICovXG4gICAgcHJpdmF0ZSBQZW4gZ3JheTFQZW4sIGdyYXkyUGVuLCBncmF5M1BlbjtcblxuICAgIC8qIFRoZSBicnVzaGVzIGZvciBmaWxsaW5nIHRoZSBrZXlzICovXG4gICAgcHJpdmF0ZSBCcnVzaCBncmF5MUJydXNoLCBncmF5MkJydXNoLCBzaGFkZUJydXNoLCBzaGFkZTJCcnVzaDtcblxuICAgIHByaXZhdGUgYm9vbCB1c2VUd29Db2xvcnM7ICAgICAgICAgICAgICAvKiogSWYgdHJ1ZSwgdXNlIHR3byBjb2xvcnMgZm9yIGhpZ2hsaWdodGluZyAqL1xuICAgIHByaXZhdGUgTGlzdDxNaWRpTm90ZT4gbm90ZXM7ICAgICAgICAgICAvKiogVGhlIE1pZGkgbm90ZXMgZm9yIHNoYWRpbmcgKi9cbiAgICBwcml2YXRlIGludCBtYXhTaGFkZUR1cmF0aW9uOyAgICAgICAgICAgLyoqIFRoZSBtYXhpbXVtIGR1cmF0aW9uIHdlJ2xsIHNoYWRlIGEgbm90ZSBmb3IgKi9cbiAgICBwcml2YXRlIGludCBzaG93Tm90ZUxldHRlcnM7ICAgICAgICAgICAgLyoqIERpc3BsYXkgdGhlIGxldHRlciBmb3IgZWFjaCBwaWFubyBub3RlICovXG4gICAgcHJpdmF0ZSBHcmFwaGljcyBncmFwaGljczsgICAgICAgICAgICAgIC8qKiBUaGUgZ3JhcGhpY3MgZm9yIHNoYWRpbmcgdGhlIG5vdGVzICovXG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IFBpYW5vLiAqL1xuICAgIHB1YmxpYyBQaWFubygpIHtcclxuICAgICAgICBpbnQgc2NyZWVud2lkdGggPSAxMDI0OyAvL1N5c3RlbS5XaW5kb3dzLkZvcm1zLlNjcmVlbi5QcmltYXJ5U2NyZWVuLkJvdW5kcy5XaWR0aDtcbiAgICAgICAgaWYgKHNjcmVlbndpZHRoID49IDMyMDApIHtcbiAgICAgICAgICAgIC8qIExpbnV4L01vbm8gaXMgcmVwb3J0aW5nIHdpZHRoIG9mIDQgc2NyZWVucyAqL1xuICAgICAgICAgICAgc2NyZWVud2lkdGggPSBzY3JlZW53aWR0aCAvIDQ7XG4gICAgICAgIH1cbiAgICAgICAgc2NyZWVud2lkdGggPSBzY3JlZW53aWR0aCAqIDk1LzEwMDtcbiAgICAgICAgV2hpdGVLZXlXaWR0aCA9IChpbnQpKHNjcmVlbndpZHRoIC8gKDIuMCArIEtleXNQZXJPY3RhdmUgKiBNYXhPY3RhdmUpKTtcbiAgICAgICAgaWYgKFdoaXRlS2V5V2lkdGggJSAyICE9IDApIHtcbiAgICAgICAgICAgIFdoaXRlS2V5V2lkdGgtLTtcbiAgICAgICAgfVxuICAgICAgICBtYXJnaW4gPSAwO1xuICAgICAgICBCbGFja0JvcmRlciA9IFdoaXRlS2V5V2lkdGgvMjtcbiAgICAgICAgV2hpdGVLZXlIZWlnaHQgPSBXaGl0ZUtleVdpZHRoICogNTtcbiAgICAgICAgQmxhY2tLZXlXaWR0aCA9IFdoaXRlS2V5V2lkdGggLyAyO1xuICAgICAgICBCbGFja0tleUhlaWdodCA9IFdoaXRlS2V5SGVpZ2h0ICogNSAvIDk7IFxuXG4gICAgICAgIFdpZHRoID0gbWFyZ2luKjIgKyBCbGFja0JvcmRlcioyICsgV2hpdGVLZXlXaWR0aCAqIEtleXNQZXJPY3RhdmUgKiBNYXhPY3RhdmU7XG4gICAgICAgIEhlaWdodCA9IG1hcmdpbioyICsgQmxhY2tCb3JkZXIqMyArIFdoaXRlS2V5SGVpZ2h0O1xuICAgICAgICBpZiAoYmxhY2tLZXlPZmZzZXRzID09IG51bGwpIHtcbiAgICAgICAgICAgIGJsYWNrS2V5T2Zmc2V0cyA9IG5ldyBpbnRbXSB7IFxuICAgICAgICAgICAgICAgIFdoaXRlS2V5V2lkdGggLSBCbGFja0tleVdpZHRoLzIgLSAxLFxuICAgICAgICAgICAgICAgIFdoaXRlS2V5V2lkdGggKyBCbGFja0tleVdpZHRoLzIgLSAxLFxuICAgICAgICAgICAgICAgIDIqV2hpdGVLZXlXaWR0aCAtIEJsYWNrS2V5V2lkdGgvMixcbiAgICAgICAgICAgICAgICAyKldoaXRlS2V5V2lkdGggKyBCbGFja0tleVdpZHRoLzIsXG4gICAgICAgICAgICAgICAgNCpXaGl0ZUtleVdpZHRoIC0gQmxhY2tLZXlXaWR0aC8yIC0gMSxcbiAgICAgICAgICAgICAgICA0KldoaXRlS2V5V2lkdGggKyBCbGFja0tleVdpZHRoLzIgLSAxLFxuICAgICAgICAgICAgICAgIDUqV2hpdGVLZXlXaWR0aCAtIEJsYWNrS2V5V2lkdGgvMixcbiAgICAgICAgICAgICAgICA1KldoaXRlS2V5V2lkdGggKyBCbGFja0tleVdpZHRoLzIsXG4gICAgICAgICAgICAgICAgNipXaGl0ZUtleVdpZHRoIC0gQmxhY2tLZXlXaWR0aC8yLFxuICAgICAgICAgICAgICAgIDYqV2hpdGVLZXlXaWR0aCArIEJsYWNrS2V5V2lkdGgvMlxuICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIENvbG9yIGdyYXkxID0gQ29sb3IuRnJvbUFyZ2IoMTYsIDE2LCAxNik7XG4gICAgICAgIENvbG9yIGdyYXkyID0gQ29sb3IuRnJvbUFyZ2IoOTAsIDkwLCA5MCk7XG4gICAgICAgIENvbG9yIGdyYXkzID0gQ29sb3IuRnJvbUFyZ2IoMjAwLCAyMDAsIDIwMCk7XG4gICAgICAgIENvbG9yIHNoYWRlMSA9IENvbG9yLkZyb21BcmdiKDIxMCwgMjA1LCAyMjApO1xuICAgICAgICBDb2xvciBzaGFkZTIgPSBDb2xvci5Gcm9tQXJnYigxNTAsIDIwMCwgMjIwKTtcblxuICAgICAgICBncmF5MVBlbiA9IG5ldyBQZW4oZ3JheTEsIDEpO1xuICAgICAgICBncmF5MlBlbiA9IG5ldyBQZW4oZ3JheTIsIDEpO1xuICAgICAgICBncmF5M1BlbiA9IG5ldyBQZW4oZ3JheTMsIDEpO1xuXG4gICAgICAgIGdyYXkxQnJ1c2ggPSBuZXcgU29saWRCcnVzaChncmF5MSk7XG4gICAgICAgIGdyYXkyQnJ1c2ggPSBuZXcgU29saWRCcnVzaChncmF5Mik7XG4gICAgICAgIHNoYWRlQnJ1c2ggPSBuZXcgU29saWRCcnVzaChzaGFkZTEpO1xuICAgICAgICBzaGFkZTJCcnVzaCA9IG5ldyBTb2xpZEJydXNoKHNoYWRlMik7XG4gICAgICAgIHNob3dOb3RlTGV0dGVycyA9IE1pZGlPcHRpb25zLk5vdGVOYW1lTm9uZTtcbiAgICAgICAgQmFja0NvbG9yID0gQ29sb3IuTGlnaHRHcmF5O1xuICAgIH1cblxuICAgIC8qKiBTZXQgdGhlIE1pZGlGaWxlIHRvIHVzZS5cbiAgICAgKiAgU2F2ZSB0aGUgbGlzdCBvZiBtaWRpIG5vdGVzLiBFYWNoIG1pZGkgbm90ZSBpbmNsdWRlcyB0aGUgbm90ZSBOdW1iZXIgXG4gICAgICogIGFuZCBTdGFydFRpbWUgKGluIHB1bHNlcyksIHNvIHdlIGtub3cgd2hpY2ggbm90ZXMgdG8gc2hhZGUgZ2l2ZW4gdGhlXG4gICAgICogIGN1cnJlbnQgcHVsc2UgdGltZS5cbiAgICAgKi8gXG4gICAgcHVibGljIHZvaWQgU2V0TWlkaUZpbGUoTWlkaUZpbGUgbWlkaWZpbGUsIE1pZGlPcHRpb25zIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKG1pZGlmaWxlID09IG51bGwpIHtcbiAgICAgICAgICAgIG5vdGVzID0gbnVsbDtcbiAgICAgICAgICAgIHVzZVR3b0NvbG9ycyA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgTGlzdDxNaWRpVHJhY2s+IHRyYWNrcyA9IG1pZGlmaWxlLkNoYW5nZU1pZGlOb3RlcyhvcHRpb25zKTtcbiAgICAgICAgTWlkaVRyYWNrIHRyYWNrID0gTWlkaUZpbGUuQ29tYmluZVRvU2luZ2xlVHJhY2sodHJhY2tzKTtcbiAgICAgICAgbm90ZXMgPSB0cmFjay5Ob3RlcztcblxuICAgICAgICBtYXhTaGFkZUR1cmF0aW9uID0gbWlkaWZpbGUuVGltZS5RdWFydGVyICogMjtcblxuICAgICAgICAvKiBXZSB3YW50IHRvIGtub3cgd2hpY2ggdHJhY2sgdGhlIG5vdGUgY2FtZSBmcm9tLlxuICAgICAgICAgKiBVc2UgdGhlICdjaGFubmVsJyBmaWVsZCB0byBzdG9yZSB0aGUgdHJhY2suXG4gICAgICAgICAqL1xuICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgdHJhY2tzLkNvdW50OyB0cmFja251bSsrKSB7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrc1t0cmFja251bV0uTm90ZXMpIHtcbiAgICAgICAgICAgICAgICBub3RlLkNoYW5uZWwgPSB0cmFja251bTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFdoZW4gd2UgaGF2ZSBleGFjdGx5IHR3byB0cmFja3MsIHdlIGFzc3VtZSB0aGlzIGlzIGEgcGlhbm8gc29uZyxcbiAgICAgICAgICogYW5kIHdlIHVzZSBkaWZmZXJlbnQgY29sb3JzIGZvciBoaWdobGlnaHRpbmcgdGhlIGxlZnQgaGFuZCBhbmRcbiAgICAgICAgICogcmlnaHQgaGFuZCBub3Rlcy5cbiAgICAgICAgICovXG4gICAgICAgIHVzZVR3b0NvbG9ycyA9IGZhbHNlO1xuICAgICAgICBpZiAodHJhY2tzLkNvdW50ID09IDIpIHtcbiAgICAgICAgICAgIHVzZVR3b0NvbG9ycyA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBzaG93Tm90ZUxldHRlcnMgPSBvcHRpb25zLnNob3dOb3RlTGV0dGVycztcbiAgICAgICAgdGhpcy5JbnZhbGlkYXRlKCk7XG4gICAgfVxuXG4gICAgLyoqIFNldCB0aGUgY29sb3JzIHRvIHVzZSBmb3Igc2hhZGluZyAqL1xuICAgIHB1YmxpYyB2b2lkIFNldFNoYWRlQ29sb3JzKENvbG9yIGMxLCBDb2xvciBjMikge1xuICAgICAgICBzaGFkZUJydXNoLkRpc3Bvc2UoKTtcbiAgICAgICAgc2hhZGUyQnJ1c2guRGlzcG9zZSgpO1xuICAgICAgICBzaGFkZUJydXNoID0gbmV3IFNvbGlkQnJ1c2goYzEpO1xuICAgICAgICBzaGFkZTJCcnVzaCA9IG5ldyBTb2xpZEJydXNoKGMyKTtcbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgb3V0bGluZSBvZiBhIDEyLW5vdGUgKDcgd2hpdGUgbm90ZSkgcGlhbm8gb2N0YXZlICovXG4gICAgcHJpdmF0ZSB2b2lkIERyYXdPY3RhdmVPdXRsaW5lKEdyYXBoaWNzIGcpIHtcbiAgICAgICAgaW50IHJpZ2h0ID0gV2hpdGVLZXlXaWR0aCAqIEtleXNQZXJPY3RhdmU7XG5cbiAgICAgICAgLy8gRHJhdyB0aGUgYm91bmRpbmcgcmVjdGFuZ2xlLCBmcm9tIEMgdG8gQlxuICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCAwLCAwLCAwLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTFQZW4sIHJpZ2h0LCAwLCByaWdodCwgV2hpdGVLZXlIZWlnaHQpO1xuICAgICAgICAvLyBnLkRyYXdMaW5lKGdyYXkxUGVuLCAwLCAwLCByaWdodCwgMCk7XG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTFQZW4sIDAsIFdoaXRlS2V5SGVpZ2h0LCByaWdodCwgV2hpdGVLZXlIZWlnaHQpO1xuICAgICAgICBnLkRyYXdMaW5lKGdyYXkzUGVuLCByaWdodC0xLCAwLCByaWdodC0xLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIDEsIDAsIDEsIFdoaXRlS2V5SGVpZ2h0KTtcblxuICAgICAgICAvLyBEcmF3IHRoZSBsaW5lIGJldHdlZW4gRSBhbmQgRlxuICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCAzKldoaXRlS2V5V2lkdGgsIDAsIDMqV2hpdGVLZXlXaWR0aCwgV2hpdGVLZXlIZWlnaHQpO1xuICAgICAgICBnLkRyYXdMaW5lKGdyYXkzUGVuLCAzKldoaXRlS2V5V2lkdGggLSAxLCAwLCAzKldoaXRlS2V5V2lkdGggLSAxLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIDMqV2hpdGVLZXlXaWR0aCArIDEsIDAsIDMqV2hpdGVLZXlXaWR0aCArIDEsIFdoaXRlS2V5SGVpZ2h0KTtcblxuICAgICAgICAvLyBEcmF3IHRoZSBzaWRlcy9ib3R0b20gb2YgdGhlIGJsYWNrIGtleXNcbiAgICAgICAgZm9yIChpbnQgaSA9MDsgaSA8IDEwOyBpICs9IDIpIHtcbiAgICAgICAgICAgIGludCB4MSA9IGJsYWNrS2V5T2Zmc2V0c1tpXTtcbiAgICAgICAgICAgIGludCB4MiA9IGJsYWNrS2V5T2Zmc2V0c1tpKzFdO1xuXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCB4MSwgMCwgeDEsIEJsYWNrS2V5SGVpZ2h0KTsgXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCB4MiwgMCwgeDIsIEJsYWNrS2V5SGVpZ2h0KTsgXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCB4MSwgQmxhY2tLZXlIZWlnaHQsIHgyLCBCbGFja0tleUhlaWdodCk7XG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkyUGVuLCB4MS0xLCAwLCB4MS0xLCBCbGFja0tleUhlaWdodCsxKTsgXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkyUGVuLCB4MisxLCAwLCB4MisxLCBCbGFja0tleUhlaWdodCsxKTsgXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkyUGVuLCB4MS0xLCBCbGFja0tleUhlaWdodCsxLCB4MisxLCBCbGFja0tleUhlaWdodCsxKTtcbiAgICAgICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIHgxLTIsIDAsIHgxLTIsIEJsYWNrS2V5SGVpZ2h0KzIpOyBcbiAgICAgICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIHgyKzIsIDAsIHgyKzIsIEJsYWNrS2V5SGVpZ2h0KzIpOyBcbiAgICAgICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIHgxLTIsIEJsYWNrS2V5SGVpZ2h0KzIsIHgyKzIsIEJsYWNrS2V5SGVpZ2h0KzIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRHJhdyB0aGUgYm90dG9tLWhhbGYgb2YgdGhlIHdoaXRlIGtleXNcbiAgICAgICAgZm9yIChpbnQgaSA9IDE7IGkgPCBLZXlzUGVyT2N0YXZlOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpID09IDMpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTsgIC8vIHdlIGRyYXcgdGhlIGxpbmUgYmV0d2VlbiBFIGFuZCBGIGFib3ZlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCBpKldoaXRlS2V5V2lkdGgsIEJsYWNrS2V5SGVpZ2h0LCBpKldoaXRlS2V5V2lkdGgsIFdoaXRlS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgIFBlbiBwZW4xID0gZ3JheTJQZW47XG4gICAgICAgICAgICBQZW4gcGVuMiA9IGdyYXkzUGVuO1xuICAgICAgICAgICAgZy5EcmF3TGluZShwZW4xLCBpKldoaXRlS2V5V2lkdGggLSAxLCBCbGFja0tleUhlaWdodCsxLCBpKldoaXRlS2V5V2lkdGggLSAxLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgICAgICBnLkRyYXdMaW5lKHBlbjIsIGkqV2hpdGVLZXlXaWR0aCArIDEsIEJsYWNrS2V5SGVpZ2h0KzEsIGkqV2hpdGVLZXlXaWR0aCArIDEsIFdoaXRlS2V5SGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqIERyYXcgYW4gb3V0bGluZSBvZiB0aGUgcGlhbm8gZm9yIDcgb2N0YXZlcyAqL1xuICAgIHByaXZhdGUgdm9pZCBEcmF3T3V0bGluZShHcmFwaGljcyBnKSB7XG4gICAgICAgIGZvciAoaW50IG9jdGF2ZSA9IDA7IG9jdGF2ZSA8IE1heE9jdGF2ZTsgb2N0YXZlKyspIHtcbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKG9jdGF2ZSAqIFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlLCAwKTtcbiAgICAgICAgICAgIERyYXdPY3RhdmVPdXRsaW5lKGcpO1xuICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShvY3RhdmUgKiBXaGl0ZUtleVdpZHRoICogS2V5c1Blck9jdGF2ZSksIDApO1xuICAgICAgICB9XG4gICAgfVxuIFxuICAgIC8qIERyYXcgdGhlIEJsYWNrIGtleXMgKi9cbiAgICBwcml2YXRlIHZvaWQgRHJhd0JsYWNrS2V5cyhHcmFwaGljcyBnKSB7XG4gICAgICAgIGZvciAoaW50IG9jdGF2ZSA9IDA7IG9jdGF2ZSA8IE1heE9jdGF2ZTsgb2N0YXZlKyspIHtcbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKG9jdGF2ZSAqIFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlLCAwKTtcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgMTA7IGkgKz0gMikge1xuICAgICAgICAgICAgICAgIGludCB4MSA9IGJsYWNrS2V5T2Zmc2V0c1tpXTtcbiAgICAgICAgICAgICAgICBpbnQgeDIgPSBibGFja0tleU9mZnNldHNbaSsxXTtcbiAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTFCcnVzaCwgeDEsIDAsIEJsYWNrS2V5V2lkdGgsIEJsYWNrS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTJCcnVzaCwgeDErMSwgQmxhY2tLZXlIZWlnaHQgLSBCbGFja0tleUhlaWdodC84LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmxhY2tLZXlXaWR0aC0yLCBCbGFja0tleUhlaWdodC84KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0ob2N0YXZlICogV2hpdGVLZXlXaWR0aCAqIEtleXNQZXJPY3RhdmUpLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qIERyYXcgdGhlIGJsYWNrIGJvcmRlciBhcmVhIHN1cnJvdW5kaW5nIHRoZSBwaWFubyBrZXlzLlxuICAgICAqIEFsc28sIGRyYXcgZ3JheSBvdXRsaW5lcyBhdCB0aGUgYm90dG9tIG9mIHRoZSB3aGl0ZSBrZXlzLlxuICAgICAqL1xuICAgIHByaXZhdGUgdm9pZCBEcmF3QmxhY2tCb3JkZXIoR3JhcGhpY3MgZykge1xuICAgICAgICBpbnQgUGlhbm9XaWR0aCA9IFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlICogTWF4T2N0YXZlO1xuICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTFCcnVzaCwgbWFyZ2luLCBtYXJnaW4sIFBpYW5vV2lkdGggKyBCbGFja0JvcmRlcioyLCBCbGFja0JvcmRlci0yKTtcbiAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkxQnJ1c2gsIG1hcmdpbiwgbWFyZ2luLCBCbGFja0JvcmRlciwgV2hpdGVLZXlIZWlnaHQgKyBCbGFja0JvcmRlciAqIDMpO1xuICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTFCcnVzaCwgbWFyZ2luLCBtYXJnaW4gKyBCbGFja0JvcmRlciArIFdoaXRlS2V5SGVpZ2h0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrQm9yZGVyKjIgKyBQaWFub1dpZHRoLCBCbGFja0JvcmRlcioyKTtcbiAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkxQnJ1c2gsIG1hcmdpbiArIEJsYWNrQm9yZGVyICsgUGlhbm9XaWR0aCwgbWFyZ2luLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrQm9yZGVyLCBXaGl0ZUtleUhlaWdodCArIEJsYWNrQm9yZGVyKjMpO1xuXG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTJQZW4sIG1hcmdpbiArIEJsYWNrQm9yZGVyLCBtYXJnaW4gKyBCbGFja0JvcmRlciAtMSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbiArIEJsYWNrQm9yZGVyICsgUGlhbm9XaWR0aCwgbWFyZ2luICsgQmxhY2tCb3JkZXIgLTEpO1xuICAgICAgICBcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0obWFyZ2luICsgQmxhY2tCb3JkZXIsIG1hcmdpbiArIEJsYWNrQm9yZGVyKTsgXG5cbiAgICAgICAgLy8gRHJhdyB0aGUgZ3JheSBib3R0b21zIG9mIHRoZSB3aGl0ZSBrZXlzICBcbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBLZXlzUGVyT2N0YXZlICogTWF4T2N0YXZlOyBpKyspIHtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShncmF5MkJydXNoLCBpKldoaXRlS2V5V2lkdGgrMSwgV2hpdGVLZXlIZWlnaHQrMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgV2hpdGVLZXlXaWR0aC0yLCBCbGFja0JvcmRlci8yKTtcbiAgICAgICAgfVxuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKG1hcmdpbiArIEJsYWNrQm9yZGVyKSwgLShtYXJnaW4gKyBCbGFja0JvcmRlcikpOyBcbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgbm90ZSBsZXR0ZXJzIHVuZGVybmVhdGggZWFjaCB3aGl0ZSBub3RlICovXG4gICAgcHJpdmF0ZSB2b2lkIERyYXdOb3RlTGV0dGVycyhHcmFwaGljcyBnKSB7XG4gICAgICAgIHN0cmluZ1tdIGxldHRlcnMgPSB7IFwiQ1wiLCBcIkRcIiwgXCJFXCIsIFwiRlwiLCBcIkdcIiwgXCJBXCIsIFwiQlwiIH07XG4gICAgICAgIHN0cmluZ1tdIG51bWJlcnMgPSB7IFwiMVwiLCBcIjNcIiwgXCI1XCIsIFwiNlwiLCBcIjhcIiwgXCIxMFwiLCBcIjEyXCIgfTtcbiAgICAgICAgc3RyaW5nW10gbmFtZXM7XG4gICAgICAgIGlmIChzaG93Tm90ZUxldHRlcnMgPT0gTWlkaU9wdGlvbnMuTm90ZU5hbWVMZXR0ZXIpIHtcbiAgICAgICAgICAgIG5hbWVzID0gbGV0dGVycztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzaG93Tm90ZUxldHRlcnMgPT0gTWlkaU9wdGlvbnMuTm90ZU5hbWVGaXhlZE51bWJlcikge1xuICAgICAgICAgICAgbmFtZXMgPSBudW1iZXJzO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKG1hcmdpbiArIEJsYWNrQm9yZGVyLCBtYXJnaW4gKyBCbGFja0JvcmRlcik7IFxuICAgICAgICBmb3IgKGludCBvY3RhdmUgPSAwOyBvY3RhdmUgPCBNYXhPY3RhdmU7IG9jdGF2ZSsrKSB7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IEtleXNQZXJPY3RhdmU7IGkrKykge1xuICAgICAgICAgICAgICAgIGcuRHJhd1N0cmluZyhuYW1lc1tpXSwgU2hlZXRNdXNpYy5MZXR0ZXJGb250LCBCcnVzaGVzLldoaXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAob2N0YXZlKktleXNQZXJPY3RhdmUgKyBpKSAqIFdoaXRlS2V5V2lkdGggKyBXaGl0ZUtleVdpZHRoLzMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFdoaXRlS2V5SGVpZ2h0ICsgQmxhY2tCb3JkZXIgKiAzLzQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0obWFyZ2luICsgQmxhY2tCb3JkZXIpLCAtKG1hcmdpbiArIEJsYWNrQm9yZGVyKSk7IFxuICAgIH1cblxuICAgIC8qKiBEcmF3IHRoZSBQaWFuby4gKi9cbiAgICBwcm90ZWN0ZWQgLypvdmVycmlkZSovIHZvaWQgT25QYWludChQYWludEV2ZW50QXJncyBlKSB7XG4gICAgICAgIEdyYXBoaWNzIGcgPSBlLkdyYXBoaWNzKCk7XG4gICAgICAgIGcuU21vb3RoaW5nTW9kZSA9IFNtb290aGluZ01vZGUuTm9uZTtcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0obWFyZ2luICsgQmxhY2tCb3JkZXIsIG1hcmdpbiArIEJsYWNrQm9yZGVyKTsgXG4gICAgICAgIGcuRmlsbFJlY3RhbmdsZShCcnVzaGVzLldoaXRlLCAwLCAwLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlICogTWF4T2N0YXZlLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgIERyYXdCbGFja0tleXMoZyk7XG4gICAgICAgIERyYXdPdXRsaW5lKGcpO1xuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKG1hcmdpbiArIEJsYWNrQm9yZGVyKSwgLShtYXJnaW4gKyBCbGFja0JvcmRlcikpO1xuICAgICAgICBEcmF3QmxhY2tCb3JkZXIoZyk7XG4gICAgICAgIGlmIChzaG93Tm90ZUxldHRlcnMgIT0gTWlkaU9wdGlvbnMuTm90ZU5hbWVOb25lKSB7XG4gICAgICAgICAgICBEcmF3Tm90ZUxldHRlcnMoZyk7XG4gICAgICAgIH1cbiAgICAgICAgZy5TbW9vdGhpbmdNb2RlID0gU21vb3RoaW5nTW9kZS5BbnRpQWxpYXM7XG4gICAgfVxuXG4gICAgLyogU2hhZGUgdGhlIGdpdmVuIG5vdGUgd2l0aCB0aGUgZ2l2ZW4gYnJ1c2guXG4gICAgICogV2Ugb25seSBkcmF3IG5vdGVzIGZyb20gbm90ZW51bWJlciAyNCB0byA5Ni5cbiAgICAgKiAoTWlkZGxlLUMgaXMgNjApLlxuICAgICAqL1xuICAgIHByaXZhdGUgdm9pZCBTaGFkZU9uZU5vdGUoR3JhcGhpY3MgZywgaW50IG5vdGVudW1iZXIsIEJydXNoIGJydXNoKSB7XG4gICAgICAgIGludCBvY3RhdmUgPSBub3RlbnVtYmVyIC8gMTI7XG4gICAgICAgIGludCBub3Rlc2NhbGUgPSBub3RlbnVtYmVyICUgMTI7XG5cbiAgICAgICAgb2N0YXZlIC09IDI7XG4gICAgICAgIGlmIChvY3RhdmUgPCAwIHx8IG9jdGF2ZSA+PSBNYXhPY3RhdmUpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0ob2N0YXZlICogV2hpdGVLZXlXaWR0aCAqIEtleXNQZXJPY3RhdmUsIDApO1xuICAgICAgICBpbnQgeDEsIHgyLCB4MztcblxuICAgICAgICBpbnQgYm90dG9tSGFsZkhlaWdodCA9IFdoaXRlS2V5SGVpZ2h0IC0gKEJsYWNrS2V5SGVpZ2h0KzMpO1xuXG4gICAgICAgIC8qIG5vdGVzY2FsZSBnb2VzIGZyb20gMCB0byAxMSwgZnJvbSBDIHRvIEIuICovXG4gICAgICAgIHN3aXRjaCAobm90ZXNjYWxlKSB7XG4gICAgICAgIGNhc2UgMDogLyogQyAqL1xuICAgICAgICAgICAgeDEgPSAyO1xuICAgICAgICAgICAgeDIgPSBibGFja0tleU9mZnNldHNbMF0gLSAyO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgMCwgeDIgLSB4MSwgQmxhY2tLZXlIZWlnaHQrMyk7XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgxLCBCbGFja0tleUhlaWdodCszLCBXaGl0ZUtleVdpZHRoLTMsIGJvdHRvbUhhbGZIZWlnaHQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTogLyogQyMgKi9cbiAgICAgICAgICAgIHgxID0gYmxhY2tLZXlPZmZzZXRzWzBdOyBcbiAgICAgICAgICAgIHgyID0gYmxhY2tLZXlPZmZzZXRzWzFdO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgMCwgeDIgLSB4MSwgQmxhY2tLZXlIZWlnaHQpO1xuICAgICAgICAgICAgaWYgKGJydXNoID09IGdyYXkxQnJ1c2gpIHtcbiAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTJCcnVzaCwgeDErMSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrS2V5SGVpZ2h0IC0gQmxhY2tLZXlIZWlnaHQvOCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrS2V5V2lkdGgtMiwgQmxhY2tLZXlIZWlnaHQvOCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOiAvKiBEICovXG4gICAgICAgICAgICB4MSA9IFdoaXRlS2V5V2lkdGggKyAyO1xuICAgICAgICAgICAgeDIgPSBibGFja0tleU9mZnNldHNbMV0gKyAzO1xuICAgICAgICAgICAgeDMgPSBibGFja0tleU9mZnNldHNbMl0gLSAyOyBcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDIsIDAsIHgzIC0geDIsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6IC8qIEQjICovXG4gICAgICAgICAgICB4MSA9IGJsYWNrS2V5T2Zmc2V0c1syXTsgXG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1szXTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIDAsIEJsYWNrS2V5V2lkdGgsIEJsYWNrS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgIGlmIChicnVzaCA9PSBncmF5MUJydXNoKSB7XG4gICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkyQnJ1c2gsIHgxKzEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleUhlaWdodCAtIEJsYWNrS2V5SGVpZ2h0LzgsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleVdpZHRoLTIsIEJsYWNrS2V5SGVpZ2h0LzgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDogLyogRSAqL1xuICAgICAgICAgICAgeDEgPSBXaGl0ZUtleVdpZHRoICogMiArIDI7XG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1szXSArIDM7IFxuICAgICAgICAgICAgeDMgPSBXaGl0ZUtleVdpZHRoICogMyAtIDE7XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgyLCAwLCB4MyAtIHgyLCBCbGFja0tleUhlaWdodCszKTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIEJsYWNrS2V5SGVpZ2h0KzMsIFdoaXRlS2V5V2lkdGgtMywgYm90dG9tSGFsZkhlaWdodCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1OiAvKiBGICovXG4gICAgICAgICAgICB4MSA9IFdoaXRlS2V5V2lkdGggKiAzICsgMjtcbiAgICAgICAgICAgIHgyID0gYmxhY2tLZXlPZmZzZXRzWzRdIC0gMjsgXG4gICAgICAgICAgICB4MyA9IFdoaXRlS2V5V2lkdGggKiA0IC0gMjtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIDAsIHgyIC0geDEsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY6IC8qIEYjICovXG4gICAgICAgICAgICB4MSA9IGJsYWNrS2V5T2Zmc2V0c1s0XTsgXG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1s1XTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIDAsIEJsYWNrS2V5V2lkdGgsIEJsYWNrS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgIGlmIChicnVzaCA9PSBncmF5MUJydXNoKSB7XG4gICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkyQnJ1c2gsIHgxKzEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleUhlaWdodCAtIEJsYWNrS2V5SGVpZ2h0LzgsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleVdpZHRoLTIsIEJsYWNrS2V5SGVpZ2h0LzgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNzogLyogRyAqL1xuICAgICAgICAgICAgeDEgPSBXaGl0ZUtleVdpZHRoICogNCArIDI7XG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1s1XSArIDM7IFxuICAgICAgICAgICAgeDMgPSBibGFja0tleU9mZnNldHNbNl0gLSAyOyBcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDIsIDAsIHgzIC0geDIsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDg6IC8qIEcjICovXG4gICAgICAgICAgICB4MSA9IGJsYWNrS2V5T2Zmc2V0c1s2XTsgXG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1s3XTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIDAsIEJsYWNrS2V5V2lkdGgsIEJsYWNrS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgIGlmIChicnVzaCA9PSBncmF5MUJydXNoKSB7XG4gICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkyQnJ1c2gsIHgxKzEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleUhlaWdodCAtIEJsYWNrS2V5SGVpZ2h0LzgsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleVdpZHRoLTIsIEJsYWNrS2V5SGVpZ2h0LzgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgOTogLyogQSAqL1xuICAgICAgICAgICAgeDEgPSBXaGl0ZUtleVdpZHRoICogNSArIDI7XG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1s3XSArIDM7IFxuICAgICAgICAgICAgeDMgPSBibGFja0tleU9mZnNldHNbOF0gLSAyOyBcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDIsIDAsIHgzIC0geDIsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEwOiAvKiBBIyAqL1xuICAgICAgICAgICAgeDEgPSBibGFja0tleU9mZnNldHNbOF07IFxuICAgICAgICAgICAgeDIgPSBibGFja0tleU9mZnNldHNbOV07XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgxLCAwLCBCbGFja0tleVdpZHRoLCBCbGFja0tleUhlaWdodCk7XG4gICAgICAgICAgICBpZiAoYnJ1c2ggPT0gZ3JheTFCcnVzaCkge1xuICAgICAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShncmF5MkJydXNoLCB4MSsxLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmxhY2tLZXlIZWlnaHQgLSBCbGFja0tleUhlaWdodC84LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmxhY2tLZXlXaWR0aC0yLCBCbGFja0tleUhlaWdodC84KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDExOiAvKiBCICovXG4gICAgICAgICAgICB4MSA9IFdoaXRlS2V5V2lkdGggKiA2ICsgMjtcbiAgICAgICAgICAgIHgyID0gYmxhY2tLZXlPZmZzZXRzWzldICsgMzsgXG4gICAgICAgICAgICB4MyA9IFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlIC0gMTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDIsIDAsIHgzIC0geDIsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShvY3RhdmUgKiBXaGl0ZUtleVdpZHRoICogS2V5c1Blck9jdGF2ZSksIDApO1xuICAgIH1cblxuICAgIC8qKiBGaW5kIHRoZSBNaWRpTm90ZSB3aXRoIHRoZSBzdGFydFRpbWUgY2xvc2VzdCB0byB0aGUgZ2l2ZW4gdGltZS5cbiAgICAgKiAgUmV0dXJuIHRoZSBpbmRleCBvZiB0aGUgbm90ZS4gIFVzZSBhIGJpbmFyeSBzZWFyY2ggbWV0aG9kLlxuICAgICAqL1xuICAgIHByaXZhdGUgaW50IEZpbmRDbG9zZXN0U3RhcnRUaW1lKGludCBwdWxzZVRpbWUpIHtcbiAgICAgICAgaW50IGxlZnQgPSAwO1xuICAgICAgICBpbnQgcmlnaHQgPSBub3Rlcy5Db3VudC0xO1xuXG4gICAgICAgIHdoaWxlIChyaWdodCAtIGxlZnQgPiAxKSB7XG4gICAgICAgICAgICBpbnQgaSA9IChyaWdodCArIGxlZnQpLzI7XG4gICAgICAgICAgICBpZiAobm90ZXNbbGVmdF0uU3RhcnRUaW1lID09IHB1bHNlVGltZSlcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGVsc2UgaWYgKG5vdGVzW2ldLlN0YXJ0VGltZSA8PSBwdWxzZVRpbWUpXG4gICAgICAgICAgICAgICAgbGVmdCA9IGk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmlnaHQgPSBpO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChsZWZ0ID49IDEgJiYgKG5vdGVzW2xlZnQtMV0uU3RhcnRUaW1lID09IG5vdGVzW2xlZnRdLlN0YXJ0VGltZSkpIHtcbiAgICAgICAgICAgIGxlZnQtLTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGVmdDtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBuZXh0IFN0YXJ0VGltZSB0aGF0IG9jY3VycyBhZnRlciB0aGUgTWlkaU5vdGVcbiAgICAgKiAgYXQgb2Zmc2V0IGksIHRoYXQgaXMgYWxzbyBpbiB0aGUgc2FtZSB0cmFjay9jaGFubmVsLlxuICAgICAqL1xuICAgIHByaXZhdGUgaW50IE5leHRTdGFydFRpbWVTYW1lVHJhY2soaW50IGkpIHtcbiAgICAgICAgaW50IHN0YXJ0ID0gbm90ZXNbaV0uU3RhcnRUaW1lO1xuICAgICAgICBpbnQgZW5kID0gbm90ZXNbaV0uRW5kVGltZTtcbiAgICAgICAgaW50IHRyYWNrID0gbm90ZXNbaV0uQ2hhbm5lbDtcblxuICAgICAgICB3aGlsZSAoaSA8IG5vdGVzLkNvdW50KSB7XG4gICAgICAgICAgICBpZiAobm90ZXNbaV0uQ2hhbm5lbCAhPSB0cmFjaykge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChub3Rlc1tpXS5TdGFydFRpbWUgPiBzdGFydCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBub3Rlc1tpXS5TdGFydFRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbmQgPSBNYXRoLk1heChlbmQsIG5vdGVzW2ldLkVuZFRpbWUpO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbmQ7XG4gICAgfVxuXG5cbiAgICAvKiogUmV0dXJuIHRoZSBuZXh0IFN0YXJ0VGltZSB0aGF0IG9jY3VycyBhZnRlciB0aGUgTWlkaU5vdGVcbiAgICAgKiAgYXQgb2Zmc2V0IGkuICBJZiBhbGwgdGhlIHN1YnNlcXVlbnQgbm90ZXMgaGF2ZSB0aGUgc2FtZVxuICAgICAqICBTdGFydFRpbWUsIHRoZW4gcmV0dXJuIHRoZSBsYXJnZXN0IEVuZFRpbWUuXG4gICAgICovXG4gICAgcHJpdmF0ZSBpbnQgTmV4dFN0YXJ0VGltZShpbnQgaSkge1xuICAgICAgICBpbnQgc3RhcnQgPSBub3Rlc1tpXS5TdGFydFRpbWU7XG4gICAgICAgIGludCBlbmQgPSBub3Rlc1tpXS5FbmRUaW1lO1xuXG4gICAgICAgIHdoaWxlIChpIDwgbm90ZXMuQ291bnQpIHtcbiAgICAgICAgICAgIGlmIChub3Rlc1tpXS5TdGFydFRpbWUgPiBzdGFydCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBub3Rlc1tpXS5TdGFydFRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbmQgPSBNYXRoLk1heChlbmQsIG5vdGVzW2ldLkVuZFRpbWUpO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbmQ7XG4gICAgfVxuXG4gICAgLyoqIEZpbmQgdGhlIE1pZGkgbm90ZXMgdGhhdCBvY2N1ciBpbiB0aGUgY3VycmVudCB0aW1lLlxuICAgICAqICBTaGFkZSB0aG9zZSBub3RlcyBvbiB0aGUgcGlhbm8gZGlzcGxheWVkLlxuICAgICAqICBVbi1zaGFkZSB0aGUgdGhvc2Ugbm90ZXMgcGxheWVkIGluIHRoZSBwcmV2aW91cyB0aW1lLlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIFNoYWRlTm90ZXMoaW50IGN1cnJlbnRQdWxzZVRpbWUsIGludCBwcmV2UHVsc2VUaW1lKSB7XG4gICAgICAgIGlmIChub3RlcyA9PSBudWxsIHx8IG5vdGVzLkNvdW50ID09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ3JhcGhpY3MgPT0gbnVsbCkge1xuICAgICAgICAgICAgZ3JhcGhpY3MgPSBDcmVhdGVHcmFwaGljcyhcInNoYWRlTm90ZXNfcGlhbm9cIik7XG4gICAgICAgIH1cbiAgICAgICAgZ3JhcGhpY3MuU21vb3RoaW5nTW9kZSA9IFNtb290aGluZ01vZGUuTm9uZTtcbiAgICAgICAgZ3JhcGhpY3MuVHJhbnNsYXRlVHJhbnNmb3JtKG1hcmdpbiArIEJsYWNrQm9yZGVyLCBtYXJnaW4gKyBCbGFja0JvcmRlcik7XG5cbiAgICAgICAgLyogTG9vcCB0aHJvdWdoIHRoZSBNaWRpIG5vdGVzLlxuICAgICAgICAgKiBVbnNoYWRlIG5vdGVzIHdoZXJlIFN0YXJ0VGltZSA8PSBwcmV2UHVsc2VUaW1lIDwgbmV4dCBTdGFydFRpbWVcbiAgICAgICAgICogU2hhZGUgbm90ZXMgd2hlcmUgU3RhcnRUaW1lIDw9IGN1cnJlbnRQdWxzZVRpbWUgPCBuZXh0IFN0YXJ0VGltZVxuICAgICAgICAgKi9cbiAgICAgICAgaW50IGxhc3RTaGFkZWRJbmRleCA9IEZpbmRDbG9zZXN0U3RhcnRUaW1lKHByZXZQdWxzZVRpbWUgLSBtYXhTaGFkZUR1cmF0aW9uICogMik7XG4gICAgICAgIGZvciAoaW50IGkgPSBsYXN0U2hhZGVkSW5kZXg7IGkgPCBub3Rlcy5Db3VudDsgaSsrKSB7XG4gICAgICAgICAgICBpbnQgc3RhcnQgPSBub3Rlc1tpXS5TdGFydFRpbWU7XG4gICAgICAgICAgICBpbnQgZW5kID0gbm90ZXNbaV0uRW5kVGltZTtcbiAgICAgICAgICAgIGludCBub3RlbnVtYmVyID0gbm90ZXNbaV0uTnVtYmVyO1xuICAgICAgICAgICAgaW50IG5leHRTdGFydCA9IE5leHRTdGFydFRpbWUoaSk7XG4gICAgICAgICAgICBpbnQgbmV4dFN0YXJ0VHJhY2sgPSBOZXh0U3RhcnRUaW1lU2FtZVRyYWNrKGkpO1xuICAgICAgICAgICAgZW5kID0gTWF0aC5NYXgoZW5kLCBuZXh0U3RhcnRUcmFjayk7XG4gICAgICAgICAgICBlbmQgPSBNYXRoLk1pbihlbmQsIHN0YXJ0ICsgbWF4U2hhZGVEdXJhdGlvbi0xKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8qIElmIHdlJ3ZlIHBhc3QgdGhlIHByZXZpb3VzIGFuZCBjdXJyZW50IHRpbWVzLCB3ZSdyZSBkb25lLiAqL1xuICAgICAgICAgICAgaWYgKChzdGFydCA+IHByZXZQdWxzZVRpbWUpICYmIChzdGFydCA+IGN1cnJlbnRQdWxzZVRpbWUpKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIElmIHNoYWRlZCBub3RlcyBhcmUgdGhlIHNhbWUsIHdlJ3JlIGRvbmUgKi9cbiAgICAgICAgICAgIGlmICgoc3RhcnQgPD0gY3VycmVudFB1bHNlVGltZSkgJiYgKGN1cnJlbnRQdWxzZVRpbWUgPCBuZXh0U3RhcnQpICYmXG4gICAgICAgICAgICAgICAgKGN1cnJlbnRQdWxzZVRpbWUgPCBlbmQpICYmIFxuICAgICAgICAgICAgICAgIChzdGFydCA8PSBwcmV2UHVsc2VUaW1lKSAmJiAocHJldlB1bHNlVGltZSA8IG5leHRTdGFydCkgJiZcbiAgICAgICAgICAgICAgICAocHJldlB1bHNlVGltZSA8IGVuZCkpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogSWYgdGhlIG5vdGUgaXMgaW4gdGhlIGN1cnJlbnQgdGltZSwgc2hhZGUgaXQgKi9cbiAgICAgICAgICAgIGlmICgoc3RhcnQgPD0gY3VycmVudFB1bHNlVGltZSkgJiYgKGN1cnJlbnRQdWxzZVRpbWUgPCBlbmQpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHVzZVR3b0NvbG9ycykge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm90ZXNbaV0uQ2hhbm5lbCA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTaGFkZU9uZU5vdGUoZ3JhcGhpY3MsIG5vdGVudW1iZXIsIHNoYWRlMkJydXNoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFNoYWRlT25lTm90ZShncmFwaGljcywgbm90ZW51bWJlciwgc2hhZGVCcnVzaCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIFNoYWRlT25lTm90ZShncmFwaGljcywgbm90ZW51bWJlciwgc2hhZGVCcnVzaCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBJZiB0aGUgbm90ZSBpcyBpbiB0aGUgcHJldmlvdXMgdGltZSwgdW4tc2hhZGUgaXQsIGRyYXcgaXQgd2hpdGUuICovXG4gICAgICAgICAgICBlbHNlIGlmICgoc3RhcnQgPD0gcHJldlB1bHNlVGltZSkgJiYgKHByZXZQdWxzZVRpbWUgPCBlbmQpKSB7XG4gICAgICAgICAgICAgICAgaW50IG51bSA9IG5vdGVudW1iZXIgJSAxMjtcbiAgICAgICAgICAgICAgICBpZiAobnVtID09IDEgfHwgbnVtID09IDMgfHwgbnVtID09IDYgfHwgbnVtID09IDggfHwgbnVtID09IDEwKSB7XG4gICAgICAgICAgICAgICAgICAgIFNoYWRlT25lTm90ZShncmFwaGljcywgbm90ZW51bWJlciwgZ3JheTFCcnVzaCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBTaGFkZU9uZU5vdGUoZ3JhcGhpY3MsIG5vdGVudW1iZXIsIEJydXNoZXMuV2hpdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBncmFwaGljcy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShtYXJnaW4gKyBCbGFja0JvcmRlciksIC0obWFyZ2luICsgQmxhY2tCb3JkZXIpKTtcbiAgICAgICAgZ3JhcGhpY3MuU21vb3RoaW5nTW9kZSA9IFNtb290aGluZ01vZGUuQW50aUFsaWFzO1xuICAgIH1cbn1cblxufVxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG5cbi8qIEBjbGFzcyBSZXN0U3ltYm9sXG4gKiBBIFJlc3Qgc3ltYm9sIHJlcHJlc2VudHMgYSByZXN0IC0gd2hvbGUsIGhhbGYsIHF1YXJ0ZXIsIG9yIGVpZ2h0aC5cbiAqIFRoZSBSZXN0IHN5bWJvbCBoYXMgYSBzdGFydHRpbWUgYW5kIGEgZHVyYXRpb24sIGp1c3QgbGlrZSBhIHJlZ3VsYXJcbiAqIG5vdGUuXG4gKi9cbnB1YmxpYyBjbGFzcyBSZXN0U3ltYm9sIDogTXVzaWNTeW1ib2wge1xuICAgIHByaXZhdGUgaW50IHN0YXJ0dGltZTsgICAgICAgICAgLyoqIFRoZSBzdGFydHRpbWUgb2YgdGhlIHJlc3QgKi9cbiAgICBwcml2YXRlIE5vdGVEdXJhdGlvbiBkdXJhdGlvbjsgIC8qKiBUaGUgcmVzdCBkdXJhdGlvbiAoZWlnaHRoLCBxdWFydGVyLCBoYWxmLCB3aG9sZSkgKi9cbiAgICBwcml2YXRlIGludCB3aWR0aDsgICAgICAgICAgICAgIC8qKiBUaGUgd2lkdGggaW4gcGl4ZWxzICovXG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IHJlc3Qgc3ltYm9sIHdpdGggdGhlIGdpdmVuIHN0YXJ0IHRpbWUgYW5kIGR1cmF0aW9uICovXG4gICAgcHVibGljIFJlc3RTeW1ib2woaW50IHN0YXJ0LCBOb3RlRHVyYXRpb24gZHVyKSB7XG4gICAgICAgIHN0YXJ0dGltZSA9IHN0YXJ0O1xuICAgICAgICBkdXJhdGlvbiA9IGR1cjsgXG4gICAgICAgIHdpZHRoID0gTWluV2lkdGg7XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgdGltZSAoaW4gcHVsc2VzKSB0aGlzIHN5bWJvbCBvY2N1cnMgYXQuXG4gICAgICogVGhpcyBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgbWVhc3VyZSB0aGlzIHN5bWJvbCBiZWxvbmdzIHRvLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgU3RhcnRUaW1lIHsgXG4gICAgICAgIGdldCB7IHJldHVybiBzdGFydHRpbWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0L1NldCB0aGUgd2lkdGggKGluIHBpeGVscykgb2YgdGhpcyBzeW1ib2wuIFRoZSB3aWR0aCBpcyBzZXRcbiAgICAgKiBpbiBTaGVldE11c2ljLkFsaWduU3ltYm9scygpIHRvIHZlcnRpY2FsbHkgYWxpZ24gc3ltYm9scy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFdpZHRoIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgIHNldCB7IHdpZHRoID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBtaW5pbXVtIHdpZHRoIChpbiBwaXhlbHMpIG5lZWRlZCB0byBkcmF3IHRoaXMgc3ltYm9sICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBNaW5XaWR0aCB7XG4gICAgICAgIGdldCB7IHJldHVybiAyICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICsgXG4gICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGFib3ZlIHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEFib3ZlU3RhZmYgeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIDA7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYmVsb3cgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQmVsb3dTdGFmZiB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBEcmF3IHRoZSBzeW1ib2wuXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHlsb2NhdGlvbiAoaW4gcGl4ZWxzKSB3aGVyZSB0aGUgdG9wIG9mIHRoZSBzdGFmZiBzdGFydHMuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIFxuICAgIHZvaWQgRHJhdyhHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICAvKiBBbGlnbiB0aGUgcmVzdCBzeW1ib2wgdG8gdGhlIHJpZ2h0ICovXG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKFdpZHRoIC0gTWluV2lkdGgsIDApO1xuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybShTaGVldE11c2ljLk5vdGVIZWlnaHQvMiwgMCk7XG5cbiAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5XaG9sZSkge1xuICAgICAgICAgICAgRHJhd1dob2xlKGcsIHBlbiwgeXRvcCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkhhbGYpIHtcbiAgICAgICAgICAgIERyYXdIYWxmKGcsIHBlbiwgeXRvcCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlF1YXJ0ZXIpIHtcbiAgICAgICAgICAgIERyYXdRdWFydGVyKGcsIHBlbiwgeXRvcCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkVpZ2h0aCkge1xuICAgICAgICAgICAgRHJhd0VpZ2h0aChnLCBwZW4sIHl0b3ApO1xuICAgICAgICB9XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC1TaGVldE11c2ljLk5vdGVIZWlnaHQvMiwgMCk7XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0oV2lkdGggLSBNaW5XaWR0aCksIDApO1xuICAgIH1cblxuXG4gICAgLyoqIERyYXcgYSB3aG9sZSByZXN0IHN5bWJvbCwgYSByZWN0YW5nbGUgYmVsb3cgYSBzdGFmZiBsaW5lLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIERyYXdXaG9sZShHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICBpbnQgeSA9IHl0b3AgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG5cbiAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKEJydXNoZXMuQmxhY2ssIDAsIHksIFxuICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlV2lkdGgsIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yKTtcbiAgICB9XG5cbiAgICAvKiogRHJhdyBhIGhhbGYgcmVzdCBzeW1ib2wsIGEgcmVjdGFuZ2xlIGFib3ZlIGEgc3RhZmYgbGluZS5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3SGFsZihHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICBpbnQgeSA9IHl0b3AgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcblxuICAgICAgICBnLkZpbGxSZWN0YW5nbGUoQnJ1c2hlcy5CbGFjaywgMCwgeSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVXaWR0aCwgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIpO1xuICAgIH1cblxuICAgIC8qKiBEcmF3IGEgcXVhcnRlciByZXN0IHN5bWJvbC5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3UXVhcnRlcihHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICBwZW4uRW5kQ2FwID0gTGluZUNhcC5GbGF0O1xuXG4gICAgICAgIGludCB5ID0geXRvcCArIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICBpbnQgeCA9IDI7XG4gICAgICAgIGludCB4ZW5kID0geCArIDIqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzM7XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCB4LCB5LCB4ZW5kLTEsIHkgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQtMSk7XG5cbiAgICAgICAgcGVuLldpZHRoID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvMjtcbiAgICAgICAgeSAgPSB5dG9wICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICsgMTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHhlbmQtMiwgeSwgeCwgeSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCk7XG5cbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICAgICAgeSA9IHl0b3AgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQqMiAtIDE7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCAwLCB5LCB4ZW5kKzIsIHkgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQpOyBcblxuICAgICAgICBwZW4uV2lkdGggPSBTaGVldE11c2ljLkxpbmVTcGFjZS8yO1xuICAgICAgICBpZiAoU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ID09IDYpIHtcbiAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4ZW5kLCB5ICsgMSArIDMqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeC8yLCB5ICsgMSArIDMqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgeyAgLyogTm90ZUhlaWdodCA9PSA4ICovXG4gICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeGVuZCwgeSArIDMqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeC8yLCB5ICsgMypTaGVldE11c2ljLk5vdGVIZWlnaHQvNCk7XG4gICAgICAgIH1cblxuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgMCwgeSArIDIqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzMgKyAxLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHhlbmQgLSAxLCB5ICsgMypTaGVldE11c2ljLk5vdGVIZWlnaHQvMik7XG4gICAgfVxuXG4gICAgLyoqIERyYXcgYW4gZWlnaHRoIHJlc3Qgc3ltYm9sLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIERyYXdFaWdodGgoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3ApIHtcbiAgICAgICAgaW50IHkgPSB5dG9wICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0IC0gMTtcbiAgICAgICAgZy5GaWxsRWxsaXBzZShCcnVzaGVzLkJsYWNrLCAwLCB5KzEsIFxuICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGluZVNwYWNlLTEsIFNoZWV0TXVzaWMuTGluZVNwYWNlLTEpO1xuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgKFNoZWV0TXVzaWMuTGluZVNwYWNlLTIpLzIsIHkgKyBTaGVldE11c2ljLkxpbmVTcGFjZS0xLFxuICAgICAgICAgICAgICAgICAgICAgICAgMypTaGVldE11c2ljLkxpbmVTcGFjZS8yLCB5ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMik7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCAzKlNoZWV0TXVzaWMuTGluZVNwYWNlLzIsIHkgKyBTaGVldE11c2ljLkxpbmVTcGFjZS8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgMypTaGVldE11c2ljLkxpbmVTcGFjZS80LCB5ICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIpO1xuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiUmVzdFN5bWJvbCBzdGFydHRpbWU9ezB9IGR1cmF0aW9uPXsxfSB3aWR0aD17Mn1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnR0aW1lLCBkdXJhdGlvbiwgd2lkdGgpO1xuICAgIH1cblxufVxuXG5cbn1cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDEyIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG5cclxuXHJcbiAgICAvKiogQGNsYXNzIFNoZWV0TXVzaWNcbiAgICAgKlxuICAgICAqIFRoZSBTaGVldE11c2ljIENvbnRyb2wgaXMgdGhlIG1haW4gY2xhc3MgZm9yIGRpc3BsYXlpbmcgdGhlIHNoZWV0IG11c2ljLlxuICAgICAqIFRoZSBTaGVldE11c2ljIGNsYXNzIGhhcyB0aGUgZm9sbG93aW5nIHB1YmxpYyBtZXRob2RzOlxuICAgICAqXG4gICAgICogU2hlZXRNdXNpYygpXG4gICAgICogICBDcmVhdGUgYSBuZXcgU2hlZXRNdXNpYyBjb250cm9sIGZyb20gdGhlIGdpdmVuIG1pZGkgZmlsZSBhbmQgb3B0aW9ucy5cbiAgICAgKiBcbiAgICAgKiBTZXRab29tKClcbiAgICAgKiAgIFNldCB0aGUgem9vbSBsZXZlbCB0byBkaXNwbGF5IHRoZSBzaGVldCBtdXNpYyBhdC5cbiAgICAgKlxuICAgICAqIERvUHJpbnQoKVxuICAgICAqICAgUHJpbnQgYSBzaW5nbGUgcGFnZSBvZiBzaGVldCBtdXNpYy5cbiAgICAgKlxuICAgICAqIEdldFRvdGFsUGFnZXMoKVxuICAgICAqICAgR2V0IHRoZSB0b3RhbCBudW1iZXIgb2Ygc2hlZXQgbXVzaWMgcGFnZXMuXG4gICAgICpcbiAgICAgKiBPblBhaW50KClcbiAgICAgKiAgIE1ldGhvZCBjYWxsZWQgdG8gZHJhdyB0aGUgU2hlZXRNdWlzY1xuICAgICAqXG4gICAgICogVGhlc2UgcHVibGljIG1ldGhvZHMgYXJlIGNhbGxlZCBmcm9tIHRoZSBNaWRpU2hlZXRNdXNpYyBGb3JtIFdpbmRvdy5cbiAgICAgKlxuICAgICAqL1xyXG4gICAgcHVibGljIGNsYXNzIFNoZWV0TXVzaWMgOiBDb250cm9sXHJcbiAgICB7XHJcblxyXG4gICAgICAgIC8qIE1lYXN1cmVtZW50cyB1c2VkIHdoZW4gZHJhd2luZy4gIEFsbCBtZWFzdXJlbWVudHMgYXJlIGluIHBpeGVscy5cclxuICAgICAgICAgKiBUaGUgdmFsdWVzIGRlcGVuZCBvbiB3aGV0aGVyIHRoZSBtZW51ICdMYXJnZSBOb3Rlcycgb3IgJ1NtYWxsIE5vdGVzJyBpcyBzZWxlY3RlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IExpbmVXaWR0aCA9IDE7ICAgIC8qKiBUaGUgd2lkdGggb2YgYSBsaW5lICovXHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBMZWZ0TWFyZ2luID0gNDsgICAvKiogVGhlIGxlZnQgbWFyZ2luICovXHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBUaXRsZUhlaWdodCA9IDE0OyAvKiogVGhlIGhlaWdodCBmb3IgdGhlIHRpdGxlIG9uIHRoZSBmaXJzdCBwYWdlICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBpbnQgTGluZVNwYWNlOyAgICAgICAgLyoqIFRoZSBzcGFjZSBiZXR3ZWVuIGxpbmVzIGluIHRoZSBzdGFmZiAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaW50IFN0YWZmSGVpZ2h0OyAgICAgIC8qKiBUaGUgaGVpZ2h0IGJldHdlZW4gdGhlIDUgaG9yaXpvbnRhbCBsaW5lcyBvZiB0aGUgc3RhZmYgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGludCBOb3RlSGVpZ2h0OyAgICAgIC8qKiBUaGUgaGVpZ2h0IG9mIGEgd2hvbGUgbm90ZSAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaW50IE5vdGVXaWR0aDsgICAgICAgLyoqIFRoZSB3aWR0aCBvZiBhIHdob2xlIG5vdGUgKi9cclxuXHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBQYWdlV2lkdGggPSA4MDA7ICAgIC8qKiBUaGUgd2lkdGggb2YgZWFjaCBwYWdlICovXHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBQYWdlSGVpZ2h0ID0gMTA1MDsgIC8qKiBUaGUgaGVpZ2h0IG9mIGVhY2ggcGFnZSAod2hlbiBwcmludGluZykgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIEZvbnQgTGV0dGVyRm9udDsgICAgICAgLyoqIFRoZSBmb250IGZvciBkcmF3aW5nIHRoZSBsZXR0ZXJzICovXHJcblxyXG4gICAgICAgIHByaXZhdGUgTGlzdDxTdGFmZj4gc3RhZmZzOyAvKiogVGhlIGFycmF5IG9mIHN0YWZmcyB0byBkaXNwbGF5IChmcm9tIHRvcCB0byBib3R0b20pICovXHJcbiAgICAgICAgcHJpdmF0ZSBLZXlTaWduYXR1cmUgbWFpbmtleTsgLyoqIFRoZSBtYWluIGtleSBzaWduYXR1cmUgKi9cclxuICAgICAgICBwcml2YXRlIGludCBudW10cmFja3M7ICAgICAvKiogVGhlIG51bWJlciBvZiB0cmFja3MgKi9cclxuICAgICAgICBwcml2YXRlIGZsb2F0IHpvb207ICAgICAgICAgIC8qKiBUaGUgem9vbSBsZXZlbCB0byBkcmF3IGF0ICgxLjAgPT0gMTAwJSkgKi9cclxuICAgICAgICBwcml2YXRlIGJvb2wgc2Nyb2xsVmVydDsgICAgLyoqIFdoZXRoZXIgdG8gc2Nyb2xsIHZlcnRpY2FsbHkgb3IgaG9yaXpvbnRhbGx5ICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdHJpbmcgZmlsZW5hbWU7ICAgICAgLyoqIFRoZSBuYW1lIG9mIHRoZSBtaWRpIGZpbGUgKi9cclxuICAgICAgICBwcml2YXRlIGludCBzaG93Tm90ZUxldHRlcnM7ICAgIC8qKiBEaXNwbGF5IHRoZSBub3RlIGxldHRlcnMgKi9cclxuICAgICAgICBwcml2YXRlIENvbG9yW10gTm90ZUNvbG9yczsgICAgIC8qKiBUaGUgbm90ZSBjb2xvcnMgdG8gdXNlICovXHJcbiAgICAgICAgcHJpdmF0ZSBTb2xpZEJydXNoIHNoYWRlQnJ1c2g7ICAvKiogVGhlIGJydXNoIGZvciBzaGFkaW5nICovXHJcbiAgICAgICAgcHJpdmF0ZSBTb2xpZEJydXNoIHNoYWRlMkJydXNoOyAvKiogVGhlIGJydXNoIGZvciBzaGFkaW5nIGxlZnQtaGFuZCBwaWFubyAqL1xyXG4gICAgICAgIHByaXZhdGUgU29saWRCcnVzaCBkZXNlbGVjdGVkU2hhZGVCcnVzaCA9IG5ldyBTb2xpZEJydXNoKENvbG9yLkxpZ2h0R3JheSk7IC8qKiBUaGUgYnJ1c2ggZm9yIHNoYWRpbmcgZGVzZWxlY3RlZCBhcmVhcyAqL1xyXG4gICAgICAgIHByaXZhdGUgUGVuIHBlbjsgICAgICAgICAgICAgICAgLyoqIFRoZSBibGFjayBwZW4gZm9yIGRyYXdpbmcgKi9cclxuXHJcbiAgICAgICAgcHVibGljIGludCBTZWxlY3Rpb25TdGFydFB1bHNlIHsgZ2V0OyBzZXQ7IH1cbiAgICAgICAgcHVibGljIGludCBTZWxlY3Rpb25FbmRQdWxzZSB7IGdldDsgc2V0OyB9XHJcblxyXG4gICAgICAgIC8qKiBJbml0aWFsaXplIHRoZSBkZWZhdWx0IG5vdGUgc2l6ZXMuICAqL1xyXG4gICAgICAgIHN0YXRpYyBTaGVldE11c2ljKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNldE5vdGVTaXplKGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBDcmVhdGUgYSBuZXcgU2hlZXRNdXNpYyBjb250cm9sLCB1c2luZyB0aGUgZ2l2ZW4gcGFyc2VkIE1pZGlGaWxlLlxuICAgICAgICAgKiAgVGhlIG9wdGlvbnMgY2FuIGJlIG51bGwuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBTaGVldE11c2ljKE1pZGlGaWxlIGZpbGUsIE1pZGlPcHRpb25zIG9wdGlvbnMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbml0KGZpbGUsIG9wdGlvbnMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIENyZWF0ZSBhIG5ldyBTaGVldE11c2ljIGNvbnRyb2wsIHVzaW5nIHRoZSBnaXZlbiBtaWRpIGZpbGVuYW1lLlxuICAgICAgICAgKiAgVGhlIG9wdGlvbnMgY2FuIGJlIG51bGwuXG4gICAgICAgICAqL1xyXG4gICAgICAgIC8vcHVibGljIFNoZWV0TXVzaWMoc3RyaW5nIGZpbGVuYW1lLCBNaWRpT3B0aW9ucyBvcHRpb25zKSB7XHJcbiAgICAgICAgLy8gICAgTWlkaUZpbGUgZmlsZSA9IG5ldyBNaWRpRmlsZShmaWxlbmFtZSk7XHJcbiAgICAgICAgLy8gICAgaW5pdChmaWxlLCBvcHRpb25zKTsgXHJcbiAgICAgICAgLy99XHJcblxyXG4gICAgICAgIC8qKiBDcmVhdGUgYSBuZXcgU2hlZXRNdXNpYyBjb250cm9sLCB1c2luZyB0aGUgZ2l2ZW4gcmF3IG1pZGkgYnl0ZVtdIGRhdGEuXG4gICAgICAgICAqICBUaGUgb3B0aW9ucyBjYW4gYmUgbnVsbC5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIFNoZWV0TXVzaWMoYnl0ZVtdIGRhdGEsIHN0cmluZyB0aXRsZSwgTWlkaU9wdGlvbnMgb3B0aW9ucylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIE1pZGlGaWxlIGZpbGUgPSBuZXcgTWlkaUZpbGUoZGF0YSwgdGl0bGUpO1xyXG4gICAgICAgICAgICBpbml0KGZpbGUsIG9wdGlvbnMpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBDcmVhdGUgYSBuZXcgU2hlZXRNdXNpYyBjb250cm9sLlxuICAgICAgICAgKiBNaWRpRmlsZSBpcyB0aGUgcGFyc2VkIG1pZGkgZmlsZSB0byBkaXNwbGF5LlxuICAgICAgICAgKiBTaGVldE11c2ljIE9wdGlvbnMgYXJlIHRoZSBtZW51IG9wdGlvbnMgdGhhdCB3ZXJlIHNlbGVjdGVkLlxuICAgICAgICAgKlxuICAgICAgICAgKiAtIEFwcGx5IGFsbCB0aGUgTWVudSBPcHRpb25zIHRvIHRoZSBNaWRpRmlsZSB0cmFja3MuXG4gICAgICAgICAqIC0gQ2FsY3VsYXRlIHRoZSBrZXkgc2lnbmF0dXJlXG4gICAgICAgICAqIC0gRm9yIGVhY2ggdHJhY2ssIGNyZWF0ZSBhIGxpc3Qgb2YgTXVzaWNTeW1ib2xzIChub3RlcywgcmVzdHMsIGJhcnMsIGV0YylcbiAgICAgICAgICogLSBWZXJ0aWNhbGx5IGFsaWduIHRoZSBtdXNpYyBzeW1ib2xzIGluIGFsbCB0aGUgdHJhY2tzXG4gICAgICAgICAqIC0gUGFydGl0aW9uIHRoZSBtdXNpYyBub3RlcyBpbnRvIGhvcml6b250YWwgc3RhZmZzXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyB2b2lkIGluaXQoTWlkaUZpbGUgZmlsZSwgTWlkaU9wdGlvbnMgb3B0aW9ucylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zID09IG51bGwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSBuZXcgTWlkaU9wdGlvbnMoZmlsZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgem9vbSA9IDEuMGY7XHJcbiAgICAgICAgICAgIGZpbGVuYW1lID0gZmlsZS5GaWxlTmFtZTtcclxuXHJcbiAgICAgICAgICAgIFNldENvbG9ycyhvcHRpb25zLmNvbG9ycywgb3B0aW9ucy5zaGFkZUNvbG9yLCBvcHRpb25zLnNoYWRlMkNvbG9yKTtcclxuICAgICAgICAgICAgcGVuID0gbmV3IFBlbihDb2xvci5CbGFjaywgMSk7XHJcblxyXG4gICAgICAgICAgICBMaXN0PE1pZGlUcmFjaz4gdHJhY2tzID0gZmlsZS5DaGFuZ2VNaWRpTm90ZXMob3B0aW9ucyk7XHJcbiAgICAgICAgICAgIFNldE5vdGVTaXplKG9wdGlvbnMubGFyZ2VOb3RlU2l6ZSk7XHJcbiAgICAgICAgICAgIHNjcm9sbFZlcnQgPSBvcHRpb25zLnNjcm9sbFZlcnQ7XHJcbiAgICAgICAgICAgIHNob3dOb3RlTGV0dGVycyA9IG9wdGlvbnMuc2hvd05vdGVMZXR0ZXJzO1xyXG4gICAgICAgICAgICBUaW1lU2lnbmF0dXJlIHRpbWUgPSBmaWxlLlRpbWU7XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnRpbWUgIT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGltZSA9IG9wdGlvbnMudGltZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5rZXkgPT0gLTEpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1haW5rZXkgPSBHZXRLZXlTaWduYXR1cmUodHJhY2tzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1haW5rZXkgPSBuZXcgS2V5U2lnbmF0dXJlKG9wdGlvbnMua2V5KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbnVtdHJhY2tzID0gdHJhY2tzLkNvdW50O1xyXG5cclxuICAgICAgICAgICAgaW50IGxhc3RTdGFydCA9IGZpbGUuRW5kVGltZSgpICsgb3B0aW9ucy5zaGlmdHRpbWU7XHJcblxyXG4gICAgICAgICAgICAvKiBDcmVhdGUgYWxsIHRoZSBtdXNpYyBzeW1ib2xzIChub3RlcywgcmVzdHMsIHZlcnRpY2FsIGJhcnMsIGFuZFxyXG4gICAgICAgICAgICAgKiBjbGVmIGNoYW5nZXMpLiAgVGhlIHN5bWJvbHMgdmFyaWFibGUgY29udGFpbnMgYSBsaXN0IG9mIG11c2ljIFxyXG4gICAgICAgICAgICAgKiBzeW1ib2xzIGZvciBlYWNoIHRyYWNrLiAgVGhlIGxpc3QgZG9lcyBub3QgaW5jbHVkZSB0aGUgbGVmdC1zaWRlIFxyXG4gICAgICAgICAgICAgKiBDbGVmIGFuZCBrZXkgc2lnbmF0dXJlIHN5bWJvbHMuICBUaG9zZSBjYW4gb25seSBiZSBjYWxjdWxhdGVkIFxyXG4gICAgICAgICAgICAgKiB3aGVuIHdlIGNyZWF0ZSB0aGUgc3RhZmZzLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD5bXSBzeW1ib2xzID0gbmV3IExpc3Q8TXVzaWNTeW1ib2w+W251bXRyYWNrc107XHJcbiAgICAgICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCBudW10cmFja3M7IHRyYWNrbnVtKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIE1pZGlUcmFjayB0cmFjayA9IHRyYWNrc1t0cmFja251bV07XHJcbiAgICAgICAgICAgICAgICBDbGVmTWVhc3VyZXMgY2xlZnMgPSBuZXcgQ2xlZk1lYXN1cmVzKHRyYWNrLk5vdGVzLCB0aW1lLk1lYXN1cmUpO1xyXG4gICAgICAgICAgICAgICAgTGlzdDxDaG9yZFN5bWJvbD4gY2hvcmRzID0gQ3JlYXRlQ2hvcmRzKHRyYWNrLk5vdGVzLCBtYWlua2V5LCB0aW1lLCBjbGVmcyk7XHJcbiAgICAgICAgICAgICAgICBzeW1ib2xzW3RyYWNrbnVtXSA9IENyZWF0ZVN5bWJvbHMoY2hvcmRzLCBjbGVmcywgdGltZSwgbGFzdFN0YXJ0KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgTGlzdDxMeXJpY1N5bWJvbD5bXSBseXJpY3MgPSBudWxsO1xyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5zaG93THlyaWNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBseXJpY3MgPSBHZXRMeXJpY3ModHJhY2tzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLyogVmVydGljYWxseSBhbGlnbiB0aGUgbXVzaWMgc3ltYm9scyAqL1xyXG4gICAgICAgICAgICBTeW1ib2xXaWR0aHMgd2lkdGhzID0gbmV3IFN5bWJvbFdpZHRocyhzeW1ib2xzLCBseXJpY3MpO1xyXG4gICAgICAgICAgICBBbGlnblN5bWJvbHMoc3ltYm9scywgd2lkdGhzLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgICAgIHN0YWZmcyA9IENyZWF0ZVN0YWZmcyhzeW1ib2xzLCBtYWlua2V5LCBvcHRpb25zLCB0aW1lLk1lYXN1cmUpO1xyXG4gICAgICAgICAgICBDcmVhdGVBbGxCZWFtZWRDaG9yZHMoc3ltYm9scywgdGltZSk7XHJcbiAgICAgICAgICAgIGlmIChseXJpY3MgIT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgQWRkTHlyaWNzVG9TdGFmZnMoc3RhZmZzLCBseXJpY3MpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvKiBBZnRlciBtYWtpbmcgY2hvcmQgcGFpcnMsIHRoZSBzdGVtIGRpcmVjdGlvbnMgY2FuIGNoYW5nZSxcclxuICAgICAgICAgICAgICogd2hpY2ggYWZmZWN0cyB0aGUgc3RhZmYgaGVpZ2h0LiAgUmUtY2FsY3VsYXRlIHRoZSBzdGFmZiBoZWlnaHQuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBmb3JlYWNoIChTdGFmZiBzdGFmZiBpbiBzdGFmZnMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN0YWZmLkNhbGN1bGF0ZUhlaWdodCgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBCYWNrQ29sb3IgPSBDb2xvci5XaGl0ZTtcclxuXHJcbiAgICAgICAgICAgIFNldFpvb20oMS4wZik7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIEdldCB0aGUgYmVzdCBrZXkgc2lnbmF0dXJlIGdpdmVuIHRoZSBtaWRpIG5vdGVzIGluIGFsbCB0aGUgdHJhY2tzLiAqL1xyXG4gICAgICAgIHByaXZhdGUgS2V5U2lnbmF0dXJlIEdldEtleVNpZ25hdHVyZShMaXN0PE1pZGlUcmFjaz4gdHJhY2tzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgTGlzdDxpbnQ+IG5vdGVudW1zID0gbmV3IExpc3Q8aW50PigpO1xyXG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrLk5vdGVzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vdGVudW1zLkFkZChub3RlLk51bWJlcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIEtleVNpZ25hdHVyZS5HdWVzcyhub3RlbnVtcyk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIENyZWF0ZSB0aGUgY2hvcmQgc3ltYm9scyBmb3IgYSBzaW5nbGUgdHJhY2suXG4gICAgICAgICAqIEBwYXJhbSBtaWRpbm90ZXMgIFRoZSBNaWRpbm90ZXMgaW4gdGhlIHRyYWNrLlxuICAgICAgICAgKiBAcGFyYW0ga2V5ICAgICAgICBUaGUgS2V5IFNpZ25hdHVyZSwgZm9yIGRldGVybWluaW5nIHNoYXJwcy9mbGF0cy5cbiAgICAgICAgICogQHBhcmFtIHRpbWUgICAgICAgVGhlIFRpbWUgU2lnbmF0dXJlLCBmb3IgZGV0ZXJtaW5pbmcgdGhlIG1lYXN1cmVzLlxuICAgICAgICAgKiBAcGFyYW0gY2xlZnMgICAgICBUaGUgY2xlZnMgdG8gdXNlIGZvciBlYWNoIG1lYXN1cmUuXG4gICAgICAgICAqIEByZXQgQW4gYXJyYXkgb2YgQ2hvcmRTeW1ib2xzXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGVcclxuICAgICAgICBMaXN0PENob3JkU3ltYm9sPiBDcmVhdGVDaG9yZHMoTGlzdDxNaWRpTm90ZT4gbWlkaW5vdGVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBLZXlTaWduYXR1cmUga2V5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUaW1lU2lnbmF0dXJlIHRpbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENsZWZNZWFzdXJlcyBjbGVmcylcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICBpbnQgaSA9IDA7XHJcbiAgICAgICAgICAgIExpc3Q8Q2hvcmRTeW1ib2w+IGNob3JkcyA9IG5ldyBMaXN0PENob3JkU3ltYm9sPigpO1xyXG4gICAgICAgICAgICBMaXN0PE1pZGlOb3RlPiBub3RlZ3JvdXAgPSBuZXcgTGlzdDxNaWRpTm90ZT4oMTIpO1xyXG4gICAgICAgICAgICBpbnQgbGVuID0gbWlkaW5vdGVzLkNvdW50O1xyXG5cclxuICAgICAgICAgICAgd2hpbGUgKGkgPCBsZW4pXHJcbiAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpbnQgc3RhcnR0aW1lID0gbWlkaW5vdGVzW2ldLlN0YXJ0VGltZTtcclxuICAgICAgICAgICAgICAgIENsZWYgY2xlZiA9IGNsZWZzLkdldENsZWYoc3RhcnR0aW1lKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKiBHcm91cCBhbGwgdGhlIG1pZGkgbm90ZXMgd2l0aCB0aGUgc2FtZSBzdGFydCB0aW1lXHJcbiAgICAgICAgICAgICAgICAgKiBpbnRvIHRoZSBub3RlcyBsaXN0LlxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBub3RlZ3JvdXAuQ2xlYXIoKTtcclxuICAgICAgICAgICAgICAgIG5vdGVncm91cC5BZGQobWlkaW5vdGVzW2ldKTtcclxuICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgbGVuICYmIG1pZGlub3Rlc1tpXS5TdGFydFRpbWUgPT0gc3RhcnR0aW1lKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vdGVncm91cC5BZGQobWlkaW5vdGVzW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyogQ3JlYXRlIGEgc2luZ2xlIGNob3JkIGZyb20gdGhlIGdyb3VwIG9mIG1pZGkgbm90ZXMgd2l0aFxyXG4gICAgICAgICAgICAgICAgICogdGhlIHNhbWUgc3RhcnQgdGltZS5cclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgQ2hvcmRTeW1ib2wgY2hvcmQgPSBuZXcgQ2hvcmRTeW1ib2wobm90ZWdyb3VwLCBrZXksIHRpbWUsIGNsZWYsIHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgY2hvcmRzLkFkZChjaG9yZCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBjaG9yZHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogR2l2ZW4gdGhlIGNob3JkIHN5bWJvbHMgZm9yIGEgdHJhY2ssIGNyZWF0ZSBhIG5ldyBzeW1ib2wgbGlzdFxuICAgICAgICAgKiB0aGF0IGNvbnRhaW5zIHRoZSBjaG9yZCBzeW1ib2xzLCB2ZXJ0aWNhbCBiYXJzLCByZXN0cywgYW5kIGNsZWYgY2hhbmdlcy5cbiAgICAgICAgICogUmV0dXJuIGEgbGlzdCBvZiBzeW1ib2xzIChDaG9yZFN5bWJvbCwgQmFyU3ltYm9sLCBSZXN0U3ltYm9sLCBDbGVmU3ltYm9sKVxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIExpc3Q8TXVzaWNTeW1ib2w+XHJcbiAgICAgICAgQ3JlYXRlU3ltYm9scyhMaXN0PENob3JkU3ltYm9sPiBjaG9yZHMsIENsZWZNZWFzdXJlcyBjbGVmcyxcclxuICAgICAgICAgICAgICAgICAgICAgIFRpbWVTaWduYXR1cmUgdGltZSwgaW50IGxhc3RTdGFydClcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzID0gbmV3IExpc3Q8TXVzaWNTeW1ib2w+KCk7XHJcbiAgICAgICAgICAgIHN5bWJvbHMgPSBBZGRCYXJzKGNob3JkcywgdGltZSwgbGFzdFN0YXJ0KTtcclxuICAgICAgICAgICAgc3ltYm9scyA9IEFkZFJlc3RzKHN5bWJvbHMsIHRpbWUpO1xyXG4gICAgICAgICAgICBzeW1ib2xzID0gQWRkQ2xlZkNoYW5nZXMoc3ltYm9scywgY2xlZnMsIHRpbWUpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN5bWJvbHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogQWRkIGluIHRoZSB2ZXJ0aWNhbCBiYXJzIGRlbGltaXRpbmcgbWVhc3VyZXMuIFxuICAgICAgICAgKiAgQWxzbywgYWRkIHRoZSB0aW1lIHNpZ25hdHVyZSBzeW1ib2xzLlxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlXHJcbiAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD4gQWRkQmFycyhMaXN0PENob3JkU3ltYm9sPiBjaG9yZHMsIFRpbWVTaWduYXR1cmUgdGltZSwgaW50IGxhc3RTdGFydClcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzID0gbmV3IExpc3Q8TXVzaWNTeW1ib2w+KCk7XHJcblxyXG4gICAgICAgICAgICBUaW1lU2lnU3ltYm9sIHRpbWVzaWcgPSBuZXcgVGltZVNpZ1N5bWJvbCh0aW1lLk51bWVyYXRvciwgdGltZS5EZW5vbWluYXRvcik7XHJcbiAgICAgICAgICAgIHN5bWJvbHMuQWRkKHRpbWVzaWcpO1xyXG5cclxuICAgICAgICAgICAgLyogVGhlIHN0YXJ0dGltZSBvZiB0aGUgYmVnaW5uaW5nIG9mIHRoZSBtZWFzdXJlICovXHJcbiAgICAgICAgICAgIGludCBtZWFzdXJldGltZSA9IDA7XHJcblxyXG4gICAgICAgICAgICBpbnQgaSA9IDA7XHJcbiAgICAgICAgICAgIHdoaWxlIChpIDwgY2hvcmRzLkNvdW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWVhc3VyZXRpbWUgPD0gY2hvcmRzW2ldLlN0YXJ0VGltZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzeW1ib2xzLkFkZChuZXcgQmFyU3ltYm9sKG1lYXN1cmV0aW1lKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVhc3VyZXRpbWUgKz0gdGltZS5NZWFzdXJlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHN5bWJvbHMuQWRkKGNob3Jkc1tpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvKiBLZWVwIGFkZGluZyBiYXJzIHVudGlsIHRoZSBsYXN0IFN0YXJ0VGltZSAodGhlIGVuZCBvZiB0aGUgc29uZykgKi9cclxuICAgICAgICAgICAgd2hpbGUgKG1lYXN1cmV0aW1lIDwgbGFzdFN0YXJ0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzeW1ib2xzLkFkZChuZXcgQmFyU3ltYm9sKG1lYXN1cmV0aW1lKSk7XHJcbiAgICAgICAgICAgICAgICBtZWFzdXJldGltZSArPSB0aW1lLk1lYXN1cmU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIEFkZCB0aGUgZmluYWwgdmVydGljYWwgYmFyIHRvIHRoZSBsYXN0IG1lYXN1cmUgKi9cclxuICAgICAgICAgICAgc3ltYm9scy5BZGQobmV3IEJhclN5bWJvbChtZWFzdXJldGltZSkpO1xyXG4gICAgICAgICAgICByZXR1cm4gc3ltYm9scztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBBZGQgcmVzdCBzeW1ib2xzIGJldHdlZW4gbm90ZXMuICBBbGwgdGltZXMgYmVsb3cgYXJlIFxuICAgICAgICAgKiBtZWFzdXJlZCBpbiBwdWxzZXMuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGVcclxuICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiBBZGRSZXN0cyhMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzLCBUaW1lU2lnbmF0dXJlIHRpbWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbnQgcHJldnRpbWUgPSAwO1xyXG5cclxuICAgICAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD4gcmVzdWx0ID0gbmV3IExpc3Q8TXVzaWNTeW1ib2w+KHN5bWJvbHMuQ291bnQpO1xyXG5cclxuICAgICAgICAgICAgZm9yZWFjaCAoTXVzaWNTeW1ib2wgc3ltYm9sIGluIHN5bWJvbHMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGludCBzdGFydHRpbWUgPSBzeW1ib2wuU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgUmVzdFN5bWJvbFtdIHJlc3RzID0gR2V0UmVzdHModGltZSwgcHJldnRpbWUsIHN0YXJ0dGltZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzdHMgIT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3JlYWNoIChSZXN0U3ltYm9sIHIgaW4gcmVzdHMpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuQWRkKHIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXN1bHQuQWRkKHN5bWJvbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLyogU2V0IHByZXZ0aW1lIHRvIHRoZSBlbmQgdGltZSBvZiB0aGUgbGFzdCBub3RlL3N5bWJvbC4gKi9cclxuICAgICAgICAgICAgICAgIGlmIChzeW1ib2wgaXMgQ2hvcmRTeW1ib2wpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgQ2hvcmRTeW1ib2wgY2hvcmQgPSAoQ2hvcmRTeW1ib2wpc3ltYm9sO1xyXG4gICAgICAgICAgICAgICAgICAgIHByZXZ0aW1lID0gTWF0aC5NYXgoY2hvcmQuRW5kVGltZSwgcHJldnRpbWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHByZXZ0aW1lID0gTWF0aC5NYXgoc3RhcnR0aW1lLCBwcmV2dGltZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBSZXR1cm4gdGhlIHJlc3Qgc3ltYm9scyBuZWVkZWQgdG8gZmlsbCB0aGUgdGltZSBpbnRlcnZhbCBiZXR3ZWVuXG4gICAgICAgICAqIHN0YXJ0IGFuZCBlbmQuICBJZiBubyByZXN0cyBhcmUgbmVlZGVkLCByZXR1cm4gbmlsLlxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlXHJcbiAgICAgICAgUmVzdFN5bWJvbFtdIEdldFJlc3RzKFRpbWVTaWduYXR1cmUgdGltZSwgaW50IHN0YXJ0LCBpbnQgZW5kKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgUmVzdFN5bWJvbFtdIHJlc3VsdDtcclxuICAgICAgICAgICAgUmVzdFN5bWJvbCByMSwgcjI7XHJcblxyXG4gICAgICAgICAgICBpZiAoZW5kIC0gc3RhcnQgPCAwKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgICAgICBOb3RlRHVyYXRpb24gZHVyID0gdGltZS5HZXROb3RlRHVyYXRpb24oZW5kIC0gc3RhcnQpO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGR1cilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uV2hvbGU6XHJcbiAgICAgICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5IYWxmOlxyXG4gICAgICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uUXVhcnRlcjpcclxuICAgICAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkVpZ2h0aDpcclxuICAgICAgICAgICAgICAgICAgICByMSA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0LCBkdXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBSZXN0U3ltYm9sW10geyByMSB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uRG90dGVkSGFsZjpcclxuICAgICAgICAgICAgICAgICAgICByMSA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0LCBOb3RlRHVyYXRpb24uSGFsZik7XHJcbiAgICAgICAgICAgICAgICAgICAgcjIgPSBuZXcgUmVzdFN5bWJvbChzdGFydCArIHRpbWUuUXVhcnRlciAqIDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOb3RlRHVyYXRpb24uUXVhcnRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbmV3IFJlc3RTeW1ib2xbXSB7IHIxLCByMiB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uRG90dGVkUXVhcnRlcjpcclxuICAgICAgICAgICAgICAgICAgICByMSA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0LCBOb3RlRHVyYXRpb24uUXVhcnRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgcjIgPSBuZXcgUmVzdFN5bWJvbChzdGFydCArIHRpbWUuUXVhcnRlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5vdGVEdXJhdGlvbi5FaWdodGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBSZXN0U3ltYm9sW10geyByMSwgcjIgfTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aDpcclxuICAgICAgICAgICAgICAgICAgICByMSA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0LCBOb3RlRHVyYXRpb24uRWlnaHRoKTtcclxuICAgICAgICAgICAgICAgICAgICByMiA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0ICsgdGltZS5RdWFydGVyIC8gMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5vdGVEdXJhdGlvbi5TaXh0ZWVudGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBSZXN0U3ltYm9sW10geyByMSwgcjIgfTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBUaGUgY3VycmVudCBjbGVmIGlzIGFsd2F5cyBzaG93biBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBzdGFmZiwgb25cbiAgICAgICAgICogdGhlIGxlZnQgc2lkZS4gIEhvd2V2ZXIsIHRoZSBjbGVmIGNhbiBhbHNvIGNoYW5nZSBmcm9tIG1lYXN1cmUgdG8gXG4gICAgICAgICAqIG1lYXN1cmUuIFdoZW4gaXQgZG9lcywgYSBDbGVmIHN5bWJvbCBtdXN0IGJlIHNob3duIHRvIGluZGljYXRlIHRoZSBcbiAgICAgICAgICogY2hhbmdlIGluIGNsZWYuICBUaGlzIGZ1bmN0aW9uIGFkZHMgdGhlc2UgQ2xlZiBjaGFuZ2Ugc3ltYm9scy5cbiAgICAgICAgICogVGhpcyBmdW5jdGlvbiBkb2VzIG5vdCBhZGQgdGhlIG1haW4gQ2xlZiBTeW1ib2wgdGhhdCBiZWdpbnMgZWFjaFxuICAgICAgICAgKiBzdGFmZi4gIFRoYXQgaXMgZG9uZSBpbiB0aGUgU3RhZmYoKSBjb250cnVjdG9yLlxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlXHJcbiAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD4gQWRkQ2xlZkNoYW5nZXMoTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDbGVmTWVhc3VyZXMgY2xlZnMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVGltZVNpZ25hdHVyZSB0aW1lKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIExpc3Q8TXVzaWNTeW1ib2w+IHJlc3VsdCA9IG5ldyBMaXN0PE11c2ljU3ltYm9sPihzeW1ib2xzLkNvdW50KTtcclxuICAgICAgICAgICAgQ2xlZiBwcmV2Y2xlZiA9IGNsZWZzLkdldENsZWYoMCk7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHN5bWJvbCBpbiBzeW1ib2xzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvKiBBIEJhclN5bWJvbCBpbmRpY2F0ZXMgYSBuZXcgbWVhc3VyZSAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHN5bWJvbCBpcyBCYXJTeW1ib2wpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgQ2xlZiBjbGVmID0gY2xlZnMuR2V0Q2xlZihzeW1ib2wuU3RhcnRUaW1lKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2xlZiAhPSBwcmV2Y2xlZilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5BZGQobmV3IENsZWZTeW1ib2woY2xlZiwgc3ltYm9sLlN0YXJ0VGltZSAtIDEsIHRydWUpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldmNsZWYgPSBjbGVmO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmVzdWx0LkFkZChzeW1ib2wpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIE5vdGVzIHdpdGggdGhlIHNhbWUgc3RhcnQgdGltZXMgaW4gZGlmZmVyZW50IHN0YWZmcyBzaG91bGQgYmVcbiAgICAgICAgICogdmVydGljYWxseSBhbGlnbmVkLiAgVGhlIFN5bWJvbFdpZHRocyBjbGFzcyBpcyB1c2VkIHRvIGhlbHAgXG4gICAgICAgICAqIHZlcnRpY2FsbHkgYWxpZ24gc3ltYm9scy5cbiAgICAgICAgICpcbiAgICAgICAgICogRmlyc3QsIGVhY2ggdHJhY2sgc2hvdWxkIGhhdmUgYSBzeW1ib2wgZm9yIGV2ZXJ5IHN0YXJ0dGltZSB0aGF0XG4gICAgICAgICAqIGFwcGVhcnMgaW4gdGhlIE1pZGkgRmlsZS4gIElmIGEgdHJhY2sgZG9lc24ndCBoYXZlIGEgc3ltYm9sIGZvciBhXG4gICAgICAgICAqIHBhcnRpY3VsYXIgc3RhcnR0aW1lLCB0aGVuIGFkZCBhIFwiYmxhbmtcIiBzeW1ib2wgZm9yIHRoYXQgdGltZS5cbiAgICAgICAgICpcbiAgICAgICAgICogTmV4dCwgbWFrZSBzdXJlIHRoZSBzeW1ib2xzIGZvciBlYWNoIHN0YXJ0IHRpbWUgYWxsIGhhdmUgdGhlIHNhbWVcbiAgICAgICAgICogd2lkdGgsIGFjcm9zcyBhbGwgdHJhY2tzLiAgVGhlIFN5bWJvbFdpZHRocyBjbGFzcyBzdG9yZXNcbiAgICAgICAgICogLSBUaGUgc3ltYm9sIHdpZHRoIGZvciBlYWNoIHN0YXJ0dGltZSwgZm9yIGVhY2ggdHJhY2tcbiAgICAgICAgICogLSBUaGUgbWF4aW11bSBzeW1ib2wgd2lkdGggZm9yIGEgZ2l2ZW4gc3RhcnR0aW1lLCBhY3Jvc3MgYWxsIHRyYWNrcy5cbiAgICAgICAgICpcbiAgICAgICAgICogVGhlIG1ldGhvZCBTeW1ib2xXaWR0aHMuR2V0RXh0cmFXaWR0aCgpIHJldHVybnMgdGhlIGV4dHJhIHdpZHRoXG4gICAgICAgICAqIG5lZWRlZCBmb3IgYSB0cmFjayB0byBtYXRjaCB0aGUgbWF4aW11bSBzeW1ib2wgd2lkdGggZm9yIGEgZ2l2ZW5cbiAgICAgICAgICogc3RhcnR0aW1lLlxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlXHJcbiAgICAgICAgdm9pZCBBbGlnblN5bWJvbHMoTGlzdDxNdXNpY1N5bWJvbD5bXSBhbGxzeW1ib2xzLCBTeW1ib2xXaWR0aHMgd2lkdGhzLCBNaWRpT3B0aW9ucyBvcHRpb25zKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIHdlIHNob3cgbWVhc3VyZSBudW1iZXJzLCBpbmNyZWFzZSBiYXIgc3ltYm9sIHdpZHRoXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnNob3dNZWFzdXJlcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgdHJhY2sgPSAwOyB0cmFjayA8IGFsbHN5bWJvbHMuTGVuZ3RoOyB0cmFjaysrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIExpc3Q8TXVzaWNTeW1ib2w+IHN5bWJvbHMgPSBhbGxzeW1ib2xzW3RyYWNrXTtcclxuICAgICAgICAgICAgICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBzeW0gaW4gc3ltYm9scylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzeW0gaXMgQmFyU3ltYm9sKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzeW0uV2lkdGggKz0gU2hlZXRNdXNpYy5Ob3RlV2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZvciAoaW50IHRyYWNrID0gMDsgdHJhY2sgPCBhbGxzeW1ib2xzLkxlbmd0aDsgdHJhY2srKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scyA9IGFsbHN5bWJvbHNbdHJhY2tdO1xyXG4gICAgICAgICAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD4gcmVzdWx0ID0gbmV3IExpc3Q8TXVzaWNTeW1ib2w+KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaW50IGkgPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qIElmIGEgdHJhY2sgZG9lc24ndCBoYXZlIGEgc3ltYm9sIGZvciBhIHN0YXJ0dGltZSxcclxuICAgICAgICAgICAgICAgICAqIGFkZCBhIGJsYW5rIHN5bWJvbC5cclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoaW50IHN0YXJ0IGluIHdpZHRocy5TdGFydFRpbWVzKVxyXG4gICAgICAgICAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvKiBCYXJTeW1ib2xzIGFyZSBub3QgaW5jbHVkZWQgaW4gdGhlIFN5bWJvbFdpZHRocyBjYWxjdWxhdGlvbnMgKi9cclxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaSA8IHN5bWJvbHMuQ291bnQgJiYgKHN5bWJvbHNbaV0gaXMgQmFyU3ltYm9sKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzeW1ib2xzW2ldLlN0YXJ0VGltZSA8PSBzdGFydClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5BZGQoc3ltYm9sc1tpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpIDwgc3ltYm9scy5Db3VudCAmJiBzeW1ib2xzW2ldLlN0YXJ0VGltZSA9PSBzdGFydClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaSA8IHN5bWJvbHMuQ291bnQgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN5bWJvbHNbaV0uU3RhcnRUaW1lID09IHN0YXJ0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LkFkZChzeW1ib2xzW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuQWRkKG5ldyBCbGFua1N5bWJvbChzdGFydCwgMCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKiBGb3IgZWFjaCBzdGFydHRpbWUsIGluY3JlYXNlIHRoZSBzeW1ib2wgd2lkdGggYnlcclxuICAgICAgICAgICAgICAgICAqIFN5bWJvbFdpZHRocy5HZXRFeHRyYVdpZHRoKCkuXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGkgPSAwO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGkgPCByZXN1bHQuQ291bnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdFtpXSBpcyBCYXJTeW1ib2wpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpbnQgc3RhcnQgPSByZXN1bHRbaV0uU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBleHRyYSA9IHdpZHRocy5HZXRFeHRyYVdpZHRoKHRyYWNrLCBzdGFydCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2ldLldpZHRoICs9IGV4dHJhO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvKiBTa2lwIGFsbCByZW1haW5pbmcgc3ltYm9scyB3aXRoIHRoZSBzYW1lIHN0YXJ0dGltZS4gKi9cclxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaSA8IHJlc3VsdC5Db3VudCAmJiByZXN1bHRbaV0uU3RhcnRUaW1lID09IHN0YXJ0KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGFsbHN5bWJvbHNbdHJhY2tdID0gcmVzdWx0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBib29sIElzQ2hvcmQoTXVzaWNTeW1ib2wgc3ltYm9sKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN5bWJvbCBpcyBDaG9yZFN5bWJvbDtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogRmluZCAyLCAzLCA0LCBvciA2IGNob3JkIHN5bWJvbHMgdGhhdCBvY2N1ciBjb25zZWN1dGl2ZWx5ICh3aXRob3V0IGFueVxuICAgICAgICAgKiAgcmVzdHMgb3IgYmFycyBpbiBiZXR3ZWVuKS4gIFRoZXJlIGNhbiBiZSBCbGFua1N5bWJvbHMgaW4gYmV0d2Vlbi5cbiAgICAgICAgICpcbiAgICAgICAgICogIFRoZSBzdGFydEluZGV4IGlzIHRoZSBpbmRleCBpbiB0aGUgc3ltYm9scyB0byBzdGFydCBsb29raW5nIGZyb20uXG4gICAgICAgICAqXG4gICAgICAgICAqICBTdG9yZSB0aGUgaW5kZXhlcyBvZiB0aGUgY29uc2VjdXRpdmUgY2hvcmRzIGluIGNob3JkSW5kZXhlcy5cbiAgICAgICAgICogIFN0b3JlIHRoZSBob3Jpem9udGFsIGRpc3RhbmNlIChwaXhlbHMpIGJldHdlZW4gdGhlIGZpcnN0IGFuZCBsYXN0IGNob3JkLlxuICAgICAgICAgKiAgSWYgd2UgZmFpbGVkIHRvIGZpbmQgY29uc2VjdXRpdmUgY2hvcmRzLCByZXR1cm4gZmFsc2UuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGJvb2xcclxuICAgICAgICBGaW5kQ29uc2VjdXRpdmVDaG9yZHMoTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scywgVGltZVNpZ25hdHVyZSB0aW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnQgc3RhcnRJbmRleCwgaW50W10gY2hvcmRJbmRleGVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWYgaW50IGhvcml6RGlzdGFuY2UpXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgaW50IGkgPSBzdGFydEluZGV4O1xyXG4gICAgICAgICAgICBpbnQgbnVtQ2hvcmRzID0gY2hvcmRJbmRleGVzLkxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlICh0cnVlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBob3JpekRpc3RhbmNlID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICAvKiBGaW5kIHRoZSBzdGFydGluZyBjaG9yZCAqL1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGkgPCBzeW1ib2xzLkNvdW50IC0gbnVtQ2hvcmRzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzeW1ib2xzW2ldIGlzIENob3JkU3ltYm9sKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgQ2hvcmRTeW1ib2wgYyA9IChDaG9yZFN5bWJvbClzeW1ib2xzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYy5TdGVtICE9IG51bGwpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChpID49IHN5bWJvbHMuQ291bnQgLSBudW1DaG9yZHMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hvcmRJbmRleGVzWzBdID0gLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2hvcmRJbmRleGVzWzBdID0gaTtcclxuICAgICAgICAgICAgICAgIGJvb2wgZm91bmRDaG9yZHMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgY2hvcmRJbmRleCA9IDE7IGNob3JkSW5kZXggPCBudW1DaG9yZHM7IGNob3JkSW5kZXgrKylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IHJlbWFpbmluZyA9IG51bUNob3JkcyAtIDEgLSBjaG9yZEluZGV4O1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlICgoaSA8IHN5bWJvbHMuQ291bnQgLSByZW1haW5pbmcpICYmIChzeW1ib2xzW2ldIGlzIEJsYW5rU3ltYm9sKSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvcml6RGlzdGFuY2UgKz0gc3ltYm9sc1tpXS5XaWR0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaSA+PSBzeW1ib2xzLkNvdW50IC0gcmVtYWluaW5nKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIShzeW1ib2xzW2ldIGlzIENob3JkU3ltYm9sKSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kQ2hvcmRzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjaG9yZEluZGV4ZXNbY2hvcmRJbmRleF0gPSBpO1xyXG4gICAgICAgICAgICAgICAgICAgIGhvcml6RGlzdGFuY2UgKz0gc3ltYm9sc1tpXS5XaWR0aDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChmb3VuZENob3JkcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKiBFbHNlLCBzdGFydCBzZWFyY2hpbmcgYWdhaW4gZnJvbSBpbmRleCBpICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogQ29ubmVjdCBjaG9yZHMgb2YgdGhlIHNhbWUgZHVyYXRpb24gd2l0aCBhIGhvcml6b250YWwgYmVhbS5cbiAgICAgICAgICogIG51bUNob3JkcyBpcyB0aGUgbnVtYmVyIG9mIGNob3JkcyBwZXIgYmVhbSAoMiwgMywgNCwgb3IgNikuXG4gICAgICAgICAqICBpZiBzdGFydEJlYXQgaXMgdHJ1ZSwgdGhlIGZpcnN0IGNob3JkIG11c3Qgc3RhcnQgb24gYSBxdWFydGVyIG5vdGUgYmVhdC5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZFxyXG4gICAgICAgIENyZWF0ZUJlYW1lZENob3JkcyhMaXN0PE11c2ljU3ltYm9sPltdIGFsbHN5bWJvbHMsIFRpbWVTaWduYXR1cmUgdGltZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50IG51bUNob3JkcywgYm9vbCBzdGFydEJlYXQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbnRbXSBjaG9yZEluZGV4ZXMgPSBuZXcgaW50W251bUNob3Jkc107XHJcbiAgICAgICAgICAgIENob3JkU3ltYm9sW10gY2hvcmRzID0gbmV3IENob3JkU3ltYm9sW251bUNob3Jkc107XHJcblxyXG4gICAgICAgICAgICBmb3JlYWNoIChMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzIGluIGFsbHN5bWJvbHMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGludCBzdGFydEluZGV4ID0gMDtcclxuICAgICAgICAgICAgICAgIHdoaWxlICh0cnVlKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBob3JpekRpc3RhbmNlID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBib29sIGZvdW5kID0gRmluZENvbnNlY3V0aXZlQ2hvcmRzKHN5bWJvbHMsIHRpbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydEluZGV4LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hvcmRJbmRleGVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmIGhvcml6RGlzdGFuY2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghZm91bmQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBudW1DaG9yZHM7IGkrKylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNob3Jkc1tpXSA9IChDaG9yZFN5bWJvbClzeW1ib2xzW2Nob3JkSW5kZXhlc1tpXV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoQ2hvcmRTeW1ib2wuQ2FuQ3JlYXRlQmVhbShjaG9yZHMsIHRpbWUsIHN0YXJ0QmVhdCkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBDaG9yZFN5bWJvbC5DcmVhdGVCZWFtKGNob3JkcywgaG9yaXpEaXN0YW5jZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0SW5kZXggPSBjaG9yZEluZGV4ZXNbbnVtQ2hvcmRzIC0gMV0gKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydEluZGV4ID0gY2hvcmRJbmRleGVzWzBdICsgMTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8qIFdoYXQgaXMgdGhlIHZhbHVlIG9mIHN0YXJ0SW5kZXggaGVyZT9cclxuICAgICAgICAgICAgICAgICAgICAgKiBJZiB3ZSBjcmVhdGVkIGEgYmVhbSwgd2Ugc3RhcnQgYWZ0ZXIgdGhlIGxhc3QgY2hvcmQuXHJcbiAgICAgICAgICAgICAgICAgICAgICogSWYgd2UgZmFpbGVkIHRvIGNyZWF0ZSBhIGJlYW0sIHdlIHN0YXJ0IGFmdGVyIHRoZSBmaXJzdCBjaG9yZC5cclxuICAgICAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBDb25uZWN0IGNob3JkcyBvZiB0aGUgc2FtZSBkdXJhdGlvbiB3aXRoIGEgaG9yaXpvbnRhbCBiZWFtLlxuICAgICAgICAgKlxuICAgICAgICAgKiAgV2UgY3JlYXRlIGJlYW1zIGluIHRoZSBmb2xsb3dpbmcgb3JkZXI6XG4gICAgICAgICAqICAtIDYgY29ubmVjdGVkIDh0aCBub3RlIGNob3JkcywgaW4gMy80LCA2LzgsIG9yIDYvNCB0aW1lXG4gICAgICAgICAqICAtIFRyaXBsZXRzIHRoYXQgc3RhcnQgb24gcXVhcnRlciBub3RlIGJlYXRzXG4gICAgICAgICAqICAtIDMgY29ubmVjdGVkIGNob3JkcyB0aGF0IHN0YXJ0IG9uIHF1YXJ0ZXIgbm90ZSBiZWF0cyAoMTIvOCB0aW1lIG9ubHkpXG4gICAgICAgICAqICAtIDQgY29ubmVjdGVkIGNob3JkcyB0aGF0IHN0YXJ0IG9uIHF1YXJ0ZXIgbm90ZSBiZWF0cyAoNC80IG9yIDIvNCB0aW1lIG9ubHkpXG4gICAgICAgICAqICAtIDIgY29ubmVjdGVkIGNob3JkcyB0aGF0IHN0YXJ0IG9uIHF1YXJ0ZXIgbm90ZSBiZWF0c1xuICAgICAgICAgKiAgLSAyIGNvbm5lY3RlZCBjaG9yZHMgdGhhdCBzdGFydCBvbiBhbnkgYmVhdFxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkXHJcbiAgICAgICAgQ3JlYXRlQWxsQmVhbWVkQ2hvcmRzKExpc3Q8TXVzaWNTeW1ib2w+W10gYWxsc3ltYm9scywgVGltZVNpZ25hdHVyZSB0aW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCh0aW1lLk51bWVyYXRvciA9PSAzICYmIHRpbWUuRGVub21pbmF0b3IgPT0gNCkgfHxcclxuICAgICAgICAgICAgICAgICh0aW1lLk51bWVyYXRvciA9PSA2ICYmIHRpbWUuRGVub21pbmF0b3IgPT0gOCkgfHxcclxuICAgICAgICAgICAgICAgICh0aW1lLk51bWVyYXRvciA9PSA2ICYmIHRpbWUuRGVub21pbmF0b3IgPT0gNCkpXHJcbiAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICBDcmVhdGVCZWFtZWRDaG9yZHMoYWxsc3ltYm9scywgdGltZSwgNiwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgQ3JlYXRlQmVhbWVkQ2hvcmRzKGFsbHN5bWJvbHMsIHRpbWUsIDMsIHRydWUpO1xyXG4gICAgICAgICAgICBDcmVhdGVCZWFtZWRDaG9yZHMoYWxsc3ltYm9scywgdGltZSwgNCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIENyZWF0ZUJlYW1lZENob3JkcyhhbGxzeW1ib2xzLCB0aW1lLCAyLCB0cnVlKTtcclxuICAgICAgICAgICAgQ3JlYXRlQmVhbWVkQ2hvcmRzKGFsbHN5bWJvbHMsIHRpbWUsIDIsIGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBHZXQgdGhlIHdpZHRoIChpbiBwaXhlbHMpIG5lZWRlZCB0byBkaXNwbGF5IHRoZSBrZXkgc2lnbmF0dXJlICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBpbnRcclxuICAgICAgICBLZXlTaWduYXR1cmVXaWR0aChLZXlTaWduYXR1cmUga2V5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQ2xlZlN5bWJvbCBjbGVmc3ltID0gbmV3IENsZWZTeW1ib2woQ2xlZi5UcmVibGUsIDAsIGZhbHNlKTtcclxuICAgICAgICAgICAgaW50IHJlc3VsdCA9IGNsZWZzeW0uTWluV2lkdGg7XHJcbiAgICAgICAgICAgIEFjY2lkU3ltYm9sW10ga2V5cyA9IGtleS5HZXRTeW1ib2xzKENsZWYuVHJlYmxlKTtcclxuICAgICAgICAgICAgZm9yZWFjaCAoQWNjaWRTeW1ib2wgc3ltYm9sIGluIGtleXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBzeW1ib2wuTWluV2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdCArIFNoZWV0TXVzaWMuTGVmdE1hcmdpbiArIDU7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIEdpdmVuIE11c2ljU3ltYm9scyBmb3IgYSB0cmFjaywgY3JlYXRlIHRoZSBzdGFmZnMgZm9yIHRoYXQgdHJhY2suXG4gICAgICAgICAqICBFYWNoIFN0YWZmIGhhcyBhIG1heG1pbXVtIHdpZHRoIG9mIFBhZ2VXaWR0aCAoODAwIHBpeGVscykuXG4gICAgICAgICAqICBBbHNvLCBtZWFzdXJlcyBzaG91bGQgbm90IHNwYW4gbXVsdGlwbGUgU3RhZmZzLlxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIExpc3Q8U3RhZmY+XHJcbiAgICAgICAgQ3JlYXRlU3RhZmZzRm9yVHJhY2soTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scywgaW50IG1lYXN1cmVsZW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgS2V5U2lnbmF0dXJlIGtleSwgTWlkaU9wdGlvbnMgb3B0aW9ucyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnQgdHJhY2ssIGludCB0b3RhbHRyYWNrcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGludCBrZXlzaWdXaWR0aCA9IEtleVNpZ25hdHVyZVdpZHRoKGtleSk7XHJcbiAgICAgICAgICAgIGludCBzdGFydGluZGV4ID0gMDtcclxuICAgICAgICAgICAgTGlzdDxTdGFmZj4gdGhlc3RhZmZzID0gbmV3IExpc3Q8U3RhZmY+KHN5bWJvbHMuQ291bnQgLyA1MCk7XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAoc3RhcnRpbmRleCA8IHN5bWJvbHMuQ291bnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIC8qIHN0YXJ0aW5kZXggaXMgdGhlIGluZGV4IG9mIHRoZSBmaXJzdCBzeW1ib2wgaW4gdGhlIHN0YWZmLlxyXG4gICAgICAgICAgICAgICAgICogZW5kaW5kZXggaXMgdGhlIGluZGV4IG9mIHRoZSBsYXN0IHN5bWJvbCBpbiB0aGUgc3RhZmYuXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGludCBlbmRpbmRleCA9IHN0YXJ0aW5kZXg7XHJcbiAgICAgICAgICAgICAgICBpbnQgd2lkdGggPSBrZXlzaWdXaWR0aDtcclxuICAgICAgICAgICAgICAgIGludCBtYXh3aWR0aDtcclxuXHJcbiAgICAgICAgICAgICAgICAvKiBJZiB3ZSdyZSBzY3JvbGxpbmcgdmVydGljYWxseSwgdGhlIG1heGltdW0gd2lkdGggaXMgUGFnZVdpZHRoLiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHNjcm9sbFZlcnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF4d2lkdGggPSBTaGVldE11c2ljLlBhZ2VXaWR0aDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXh3aWR0aCA9IDIwMDAwMDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGVuZGluZGV4IDwgc3ltYm9scy5Db3VudCAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgIHdpZHRoICsgc3ltYm9sc1tlbmRpbmRleF0uV2lkdGggPCBtYXh3aWR0aClcclxuICAgICAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggKz0gc3ltYm9sc1tlbmRpbmRleF0uV2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5kaW5kZXgrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVuZGluZGV4LS07XHJcblxyXG4gICAgICAgICAgICAgICAgLyogVGhlcmUncyAzIHBvc3NpYmlsaXRpZXMgYXQgdGhpcyBwb2ludDpcclxuICAgICAgICAgICAgICAgICAqIDEuIFdlIGhhdmUgYWxsIHRoZSBzeW1ib2xzIGluIHRoZSB0cmFjay5cclxuICAgICAgICAgICAgICAgICAqICAgIFRoZSBlbmRpbmRleCBzdGF5cyB0aGUgc2FtZS5cclxuICAgICAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAgICAgKiAyLiBXZSBoYXZlIHN5bWJvbHMgZm9yIGxlc3MgdGhhbiBvbmUgbWVhc3VyZS5cclxuICAgICAgICAgICAgICAgICAqICAgIFRoZSBlbmRpbmRleCBzdGF5cyB0aGUgc2FtZS5cclxuICAgICAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAgICAgKiAzLiBXZSBoYXZlIHN5bWJvbHMgZm9yIDEgb3IgbW9yZSBtZWFzdXJlcy5cclxuICAgICAgICAgICAgICAgICAqICAgIFNpbmNlIG1lYXN1cmVzIGNhbm5vdCBzcGFuIG11bHRpcGxlIHN0YWZmcywgd2UgbXVzdFxyXG4gICAgICAgICAgICAgICAgICogICAgbWFrZSBzdXJlIGVuZGluZGV4IGRvZXMgbm90IG9jY3VyIGluIHRoZSBtaWRkbGUgb2YgYVxyXG4gICAgICAgICAgICAgICAgICogICAgbWVhc3VyZS4gIFdlIGNvdW50IGJhY2t3YXJkcyB1bnRpbCB3ZSBjb21lIHRvIHRoZSBlbmRcclxuICAgICAgICAgICAgICAgICAqICAgIG9mIGEgbWVhc3VyZS5cclxuICAgICAgICAgICAgICAgICAqL1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChlbmRpbmRleCA9PSBzeW1ib2xzLkNvdW50IC0gMSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBlbmRpbmRleCBzdGF5cyB0aGUgc2FtZSAqL1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc3ltYm9sc1tzdGFydGluZGV4XS5TdGFydFRpbWUgLyBtZWFzdXJlbGVuID09XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBzeW1ib2xzW2VuZGluZGV4XS5TdGFydFRpbWUgLyBtZWFzdXJlbGVuKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGVuZGluZGV4IHN0YXlzIHRoZSBzYW1lICovXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IGVuZG1lYXN1cmUgPSBzeW1ib2xzW2VuZGluZGV4ICsgMV0uU3RhcnRUaW1lIC8gbWVhc3VyZWxlbjtcclxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoc3ltYm9sc1tlbmRpbmRleF0uU3RhcnRUaW1lIC8gbWVhc3VyZWxlbiA9PVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBlbmRtZWFzdXJlKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kaW5kZXgtLTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpbnQgcmFuZ2UgPSBlbmRpbmRleCArIDEgLSBzdGFydGluZGV4O1xyXG4gICAgICAgICAgICAgICAgaWYgKHNjcm9sbFZlcnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSBTaGVldE11c2ljLlBhZ2VXaWR0aDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFN0YWZmIHN0YWZmID0gbmV3IFN0YWZmKHN5bWJvbHMuR2V0UmFuZ2Uoc3RhcnRpbmRleCwgcmFuZ2UpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5LCBvcHRpb25zLCB0cmFjaywgdG90YWx0cmFja3MpO1xyXG4gICAgICAgICAgICAgICAgdGhlc3RhZmZzLkFkZChzdGFmZik7XHJcbiAgICAgICAgICAgICAgICBzdGFydGluZGV4ID0gZW5kaW5kZXggKyAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGVzdGFmZnM7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIEdpdmVuIGFsbCB0aGUgTXVzaWNTeW1ib2xzIGZvciBldmVyeSB0cmFjaywgY3JlYXRlIHRoZSBzdGFmZnNcbiAgICAgICAgICogZm9yIHRoZSBzaGVldCBtdXNpYy4gIFRoZXJlIGFyZSB0d28gcGFydHMgdG8gdGhpczpcbiAgICAgICAgICpcbiAgICAgICAgICogLSBHZXQgdGhlIGxpc3Qgb2Ygc3RhZmZzIGZvciBlYWNoIHRyYWNrLlxuICAgICAgICAgKiAgIFRoZSBzdGFmZnMgd2lsbCBiZSBzdG9yZWQgaW4gdHJhY2tzdGFmZnMgYXM6XG4gICAgICAgICAqXG4gICAgICAgICAqICAgdHJhY2tzdGFmZnNbMF0gPSB7IFN0YWZmMCwgU3RhZmYxLCBTdGFmZjIsIC4uLiB9IGZvciB0cmFjayAwXG4gICAgICAgICAqICAgdHJhY2tzdGFmZnNbMV0gPSB7IFN0YWZmMCwgU3RhZmYxLCBTdGFmZjIsIC4uLiB9IGZvciB0cmFjayAxXG4gICAgICAgICAqICAgdHJhY2tzdGFmZnNbMl0gPSB7IFN0YWZmMCwgU3RhZmYxLCBTdGFmZjIsIC4uLiB9IGZvciB0cmFjayAyXG4gICAgICAgICAqXG4gICAgICAgICAqIC0gU3RvcmUgdGhlIFN0YWZmcyBpbiB0aGUgc3RhZmZzIGxpc3QsIGJ1dCBpbnRlcmxlYXZlIHRoZVxuICAgICAgICAgKiAgIHRyYWNrcyBhcyBmb2xsb3dzOlxuICAgICAgICAgKlxuICAgICAgICAgKiAgIHN0YWZmcyA9IHsgU3RhZmYwIGZvciB0cmFjayAwLCBTdGFmZjAgZm9yIHRyYWNrMSwgU3RhZmYwIGZvciB0cmFjazIsXG4gICAgICAgICAqICAgICAgICAgICAgICBTdGFmZjEgZm9yIHRyYWNrIDAsIFN0YWZmMSBmb3IgdHJhY2sxLCBTdGFmZjEgZm9yIHRyYWNrMixcbiAgICAgICAgICogICAgICAgICAgICAgIFN0YWZmMiBmb3IgdHJhY2sgMCwgU3RhZmYyIGZvciB0cmFjazEsIFN0YWZmMiBmb3IgdHJhY2syLFxuICAgICAgICAgKiAgICAgICAgICAgICAgLi4uIH0gXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgTGlzdDxTdGFmZj5cclxuICAgICAgICBDcmVhdGVTdGFmZnMoTGlzdDxNdXNpY1N5bWJvbD5bXSBhbGxzeW1ib2xzLCBLZXlTaWduYXR1cmUga2V5LFxyXG4gICAgICAgICAgICAgICAgICAgICBNaWRpT3B0aW9ucyBvcHRpb25zLCBpbnQgbWVhc3VyZWxlbilcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICBMaXN0PFN0YWZmPltdIHRyYWNrc3RhZmZzID0gbmV3IExpc3Q8U3RhZmY+W2FsbHN5bWJvbHMuTGVuZ3RoXTtcclxuICAgICAgICAgICAgaW50IHRvdGFsdHJhY2tzID0gdHJhY2tzdGFmZnMuTGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2sgPSAwOyB0cmFjayA8IHRvdGFsdHJhY2tzOyB0cmFjaysrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzID0gYWxsc3ltYm9sc1t0cmFja107XHJcbiAgICAgICAgICAgICAgICB0cmFja3N0YWZmc1t0cmFja10gPSBDcmVhdGVTdGFmZnNGb3JUcmFjayhzeW1ib2xzLCBtZWFzdXJlbGVuLCBrZXksIG9wdGlvbnMsIHRyYWNrLCB0b3RhbHRyYWNrcyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIFVwZGF0ZSB0aGUgRW5kVGltZSBvZiBlYWNoIFN0YWZmLiBFbmRUaW1lIGlzIHVzZWQgZm9yIHBsYXliYWNrICovXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKExpc3Q8U3RhZmY+IGxpc3QgaW4gdHJhY2tzdGFmZnMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgbGlzdC5Db3VudCAtIDE7IGkrKylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0W2ldLkVuZFRpbWUgPSBsaXN0W2kgKyAxXS5TdGFydFRpbWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIEludGVybGVhdmUgdGhlIHN0YWZmcyBvZiBlYWNoIHRyYWNrIGludG8gdGhlIHJlc3VsdCBhcnJheS4gKi9cclxuICAgICAgICAgICAgaW50IG1heHN0YWZmcyA9IDA7XHJcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgdHJhY2tzdGFmZnMuTGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChtYXhzdGFmZnMgPCB0cmFja3N0YWZmc1tpXS5Db3VudClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXhzdGFmZnMgPSB0cmFja3N0YWZmc1tpXS5Db3VudDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBMaXN0PFN0YWZmPiByZXN1bHQgPSBuZXcgTGlzdDxTdGFmZj4obWF4c3RhZmZzICogdHJhY2tzdGFmZnMuTGVuZ3RoKTtcclxuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBtYXhzdGFmZnM7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTGlzdDxTdGFmZj4gbGlzdCBpbiB0cmFja3N0YWZmcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaSA8IGxpc3QuQ291bnQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuQWRkKGxpc3RbaV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIEdldCB0aGUgbHlyaWNzIGZvciBlYWNoIHRyYWNrICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgTGlzdDxMeXJpY1N5bWJvbD5bXVxyXG4gICAgICAgIEdldEx5cmljcyhMaXN0PE1pZGlUcmFjaz4gdHJhY2tzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgYm9vbCBoYXNMeXJpY3MgPSBmYWxzZTtcclxuICAgICAgICAgICAgTGlzdDxMeXJpY1N5bWJvbD5bXSByZXN1bHQgPSBuZXcgTGlzdDxMeXJpY1N5bWJvbD5bdHJhY2tzLkNvdW50XTtcclxuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IHRyYWNrcy5Db3VudDsgdHJhY2tudW0rKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTWlkaVRyYWNrIHRyYWNrID0gdHJhY2tzW3RyYWNrbnVtXTtcclxuICAgICAgICAgICAgICAgIGlmICh0cmFjay5MeXJpY3MgPT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGhhc0x5cmljcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRbdHJhY2tudW1dID0gbmV3IExpc3Q8THlyaWNTeW1ib2w+KCk7XHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgZXYgaW4gdHJhY2suTHlyaWNzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFN0cmluZyB0ZXh0ID0gVVRGOEVuY29kaW5nLlVURjguR2V0U3RyaW5nKGV2LlZhbHVlLCAwLCBldi5WYWx1ZS5MZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIEx5cmljU3ltYm9sIHN5bSA9IG5ldyBMeXJpY1N5bWJvbChldi5TdGFydFRpbWUsIHRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFt0cmFja251bV0uQWRkKHN5bSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFoYXNMeXJpY3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIEFkZCB0aGUgbHlyaWMgc3ltYm9scyB0byB0aGUgY29ycmVzcG9uZGluZyBzdGFmZnMgKi9cclxuICAgICAgICBzdGF0aWMgdm9pZFxyXG4gICAgICAgIEFkZEx5cmljc1RvU3RhZmZzKExpc3Q8U3RhZmY+IHN0YWZmcywgTGlzdDxMeXJpY1N5bWJvbD5bXSB0cmFja2x5cmljcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKFN0YWZmIHN0YWZmIGluIHN0YWZmcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTGlzdDxMeXJpY1N5bWJvbD4gbHlyaWNzID0gdHJhY2tseXJpY3Nbc3RhZmYuVHJhY2tdO1xyXG4gICAgICAgICAgICAgICAgc3RhZmYuQWRkTHlyaWNzKGx5cmljcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogU2V0IHRoZSB6b29tIGxldmVsIHRvIGRpc3BsYXkgYXQgKDEuMCA9PSAxMDAlKS5cbiAgICAgICAgICogUmVjYWxjdWxhdGUgdGhlIFNoZWV0TXVzaWMgd2lkdGggYW5kIGhlaWdodCBiYXNlZCBvbiB0aGVcbiAgICAgICAgICogem9vbSBsZXZlbC4gIFRoZW4gcmVkcmF3IHRoZSBTaGVldE11c2ljLiBcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHZvaWQgU2V0Wm9vbShmbG9hdCB2YWx1ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHpvb20gPSB2YWx1ZTtcclxuICAgICAgICAgICAgZmxvYXQgd2lkdGggPSAwO1xyXG4gICAgICAgICAgICBmbG9hdCBoZWlnaHQgPSAwO1xyXG4gICAgICAgICAgICBmb3JlYWNoIChTdGFmZiBzdGFmZiBpbiBzdGFmZnMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHdpZHRoID0gTWF0aC5NYXgod2lkdGgsIHN0YWZmLldpZHRoICogem9vbSk7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgKz0gKHN0YWZmLkhlaWdodCAqIHpvb20pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFdpZHRoID0gKGludCkod2lkdGggKyAyKTtcclxuICAgICAgICAgICAgSGVpZ2h0ID0gKChpbnQpaGVpZ2h0KSArIExlZnRNYXJnaW47XHJcbiAgICAgICAgICAgIHRoaXMuSW52YWxpZGF0ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIENoYW5nZSB0aGUgbm90ZSBjb2xvcnMgZm9yIHRoZSBzaGVldCBtdXNpYywgYW5kIHJlZHJhdy4gKi9cclxuICAgICAgICBwcml2YXRlIHZvaWQgU2V0Q29sb3JzKENvbG9yW10gbmV3Y29sb3JzLCBDb2xvciBuZXdzaGFkZSwgQ29sb3IgbmV3c2hhZGUyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKE5vdGVDb2xvcnMgPT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTm90ZUNvbG9ycyA9IG5ldyBDb2xvclsxMl07XHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDEyOyBpKyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgTm90ZUNvbG9yc1tpXSA9IENvbG9yLkJsYWNrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChuZXdjb2xvcnMgIT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCAxMjsgaSsrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIE5vdGVDb2xvcnNbaV0gPSBuZXdjb2xvcnNbaV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDEyOyBpKyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgTm90ZUNvbG9yc1tpXSA9IENvbG9yLkJsYWNrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzaGFkZUJydXNoICE9IG51bGwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNoYWRlQnJ1c2guRGlzcG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgc2hhZGUyQnJ1c2guRGlzcG9zZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNoYWRlQnJ1c2ggPSBuZXcgU29saWRCcnVzaChuZXdzaGFkZSk7XHJcbiAgICAgICAgICAgIHNoYWRlMkJydXNoID0gbmV3IFNvbGlkQnJ1c2gobmV3c2hhZGUyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBHZXQgdGhlIGNvbG9yIGZvciBhIGdpdmVuIG5vdGUgbnVtYmVyICovXHJcbiAgICAgICAgcHVibGljIENvbG9yIE5vdGVDb2xvcihpbnQgbnVtYmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIE5vdGVDb2xvcnNbTm90ZVNjYWxlLkZyb21OdW1iZXIobnVtYmVyKV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogR2V0IHRoZSBzaGFkZSBicnVzaCAqL1xyXG4gICAgICAgIHB1YmxpYyBCcnVzaCBTaGFkZUJydXNoXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gc2hhZGVCcnVzaDsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIEdldCB0aGUgc2hhZGUyIGJydXNoICovXHJcbiAgICAgICAgcHVibGljIEJydXNoIFNoYWRlMkJydXNoXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gc2hhZGUyQnJ1c2g7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBHZXQgd2hldGhlciB0byBzaG93IG5vdGUgbGV0dGVycyBvciBub3QgKi9cclxuICAgICAgICBwdWJsaWMgaW50IFNob3dOb3RlTGV0dGVyc1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIHNob3dOb3RlTGV0dGVyczsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIEdldCB0aGUgbWFpbiBrZXkgc2lnbmF0dXJlICovXHJcbiAgICAgICAgcHVibGljIEtleVNpZ25hdHVyZSBNYWluS2V5XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gbWFpbmtleTsgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBTZXQgdGhlIHNpemUgb2YgdGhlIG5vdGVzLCBsYXJnZSBvciBzbWFsbC4gIFNtYWxsZXIgbm90ZXMgbWVhbnNcbiAgICAgICAgICogbW9yZSBub3RlcyBwZXIgc3RhZmYuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBTZXROb3RlU2l6ZShib29sIGxhcmdlbm90ZXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAobGFyZ2Vub3RlcylcclxuICAgICAgICAgICAgICAgIExpbmVTcGFjZSA9IDc7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIExpbmVTcGFjZSA9IDU7XHJcblxyXG4gICAgICAgICAgICBTdGFmZkhlaWdodCA9IExpbmVTcGFjZSAqIDQgKyBMaW5lV2lkdGggKiA1O1xyXG4gICAgICAgICAgICBOb3RlSGVpZ2h0ID0gTGluZVNwYWNlICsgTGluZVdpZHRoO1xyXG4gICAgICAgICAgICBOb3RlV2lkdGggPSAzICogTGluZVNwYWNlIC8gMjtcclxuICAgICAgICAgICAgTGV0dGVyRm9udCA9IG5ldyBGb250KFwiQXJpYWxcIiwgOCwgRm9udFN0eWxlLlJlZ3VsYXIpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBEcmF3IHRoZSBTaGVldE11c2ljLlxuICAgICAgICAgKiBTY2FsZSB0aGUgZ3JhcGhpY3MgYnkgdGhlIGN1cnJlbnQgem9vbSBmYWN0b3IuXG4gICAgICAgICAqIEdldCB0aGUgdmVydGljYWwgc3RhcnQgYW5kIGVuZCBwb2ludHMgb2YgdGhlIGNsaXAgYXJlYS5cbiAgICAgICAgICogT25seSBkcmF3IFN0YWZmcyB3aGljaCBsaWUgaW5zaWRlIHRoZSBjbGlwIGFyZWEuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByb3RlY3RlZCAvKm92ZXJyaWRlKi8gdm9pZCBPblBhaW50KFBhaW50RXZlbnRBcmdzIGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBSZWN0YW5nbGUgY2xpcCA9XHJcbiAgICAgICAgICAgICAgbmV3IFJlY3RhbmdsZSgoaW50KShlLkNsaXBSZWN0YW5nbGUuWCAvIHpvb20pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGludCkoZS5DbGlwUmVjdGFuZ2xlLlkgLyB6b29tKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChpbnQpKGUuQ2xpcFJlY3RhbmdsZS5XaWR0aCAvIHpvb20pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGludCkoZS5DbGlwUmVjdGFuZ2xlLkhlaWdodCAvIHpvb20pKTtcclxuXHJcbiAgICAgICAgICAgIEdyYXBoaWNzIGcgPSBlLkdyYXBoaWNzKCk7XHJcbiAgICAgICAgICAgIGcuU2NhbGVUcmFuc2Zvcm0oem9vbSwgem9vbSk7XHJcbiAgICAgICAgICAgIC8qIGcuUGFnZVNjYWxlID0gem9vbTsgKi9cclxuICAgICAgICAgICAgZy5TbW9vdGhpbmdNb2RlID0gU21vb3RoaW5nTW9kZS5BbnRpQWxpYXM7XHJcbiAgICAgICAgICAgIGludCB5cG9zID0gMDtcclxuICAgICAgICAgICAgZm9yZWFjaCAoU3RhZmYgc3RhZmYgaW4gc3RhZmZzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKHlwb3MgKyBzdGFmZi5IZWlnaHQgPCBjbGlwLlkpIHx8ICh5cG9zID4gY2xpcC5ZICsgY2xpcC5IZWlnaHQpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFN0YWZmIGlzIG5vdCBpbiB0aGUgY2xpcCwgZG9uJ3QgbmVlZCB0byBkcmF3IGl0ICovXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oMCwgeXBvcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhZmYuRHJhdyhnLCBjbGlwLCBwZW4sIFNlbGVjdGlvblN0YXJ0UHVsc2UsIFNlbGVjdGlvbkVuZFB1bHNlLCBkZXNlbGVjdGVkU2hhZGVCcnVzaCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oMCwgLXlwb3MpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHlwb3MgKz0gc3RhZmYuSGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGcuU2NhbGVUcmFuc2Zvcm0oMS4wZiAvIHpvb20sIDEuMGYgLyB6b29tKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBXcml0ZSB0aGUgTUlESSBmaWxlbmFtZSBhdCB0aGUgdG9wIG9mIHRoZSBwYWdlICovXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIERyYXdUaXRsZShHcmFwaGljcyBnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW50IGxlZnRtYXJnaW4gPSAyMDtcclxuICAgICAgICAgICAgaW50IHRvcG1hcmdpbiA9IDIwO1xyXG4gICAgICAgICAgICBzdHJpbmcgdGl0bGUgPSBQYXRoLkdldEZpbGVOYW1lKGZpbGVuYW1lKTtcclxuICAgICAgICAgICAgdGl0bGUgPSB0aXRsZS5SZXBsYWNlKFwiLm1pZFwiLCBcIlwiKS5SZXBsYWNlKFwiX1wiLCBcIiBcIik7XHJcbiAgICAgICAgICAgIEZvbnQgZm9udCA9IG5ldyBGb250KFwiQXJpYWxcIiwgMTAsIEZvbnRTdHlsZS5Cb2xkKTtcclxuICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0obGVmdG1hcmdpbiwgdG9wbWFyZ2luKTtcclxuICAgICAgICAgICAgZy5EcmF3U3RyaW5nKHRpdGxlLCBmb250LCBCcnVzaGVzLkJsYWNrLCAwLCAwKTtcclxuICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLWxlZnRtYXJnaW4sIC10b3BtYXJnaW4pO1xyXG4gICAgICAgICAgICBmb250LkRpc3Bvc2UoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm4gdGhlIG51bWJlciBvZiBwYWdlcyBuZWVkZWQgdG8gcHJpbnQgdGhpcyBzaGVldCBtdXNpYy5cbiAgICAgICAgICogQSBzdGFmZiBzaG91bGQgZml0IHdpdGhpbiBhIHNpbmdsZSBwYWdlLCBub3QgYmUgc3BsaXQgYWNyb3NzIHR3byBwYWdlcy5cbiAgICAgICAgICogSWYgdGhlIHNoZWV0IG11c2ljIGhhcyBleGFjdGx5IDIgdHJhY2tzLCB0aGVuIHR3byBzdGFmZnMgc2hvdWxkXG4gICAgICAgICAqIGZpdCB3aXRoaW4gYSBzaW5nbGUgcGFnZSwgYW5kIG5vdCBiZSBzcGxpdCBhY3Jvc3MgdHdvIHBhZ2VzLlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgaW50IEdldFRvdGFsUGFnZXMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW50IG51bSA9IDE7XHJcbiAgICAgICAgICAgIGludCBjdXJyaGVpZ2h0ID0gVGl0bGVIZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICBpZiAobnVtdHJhY2tzID09IDIgJiYgKHN0YWZmcy5Db3VudCAlIDIpID09IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgc3RhZmZzLkNvdW50OyBpICs9IDIpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IGhlaWdodHMgPSBzdGFmZnNbaV0uSGVpZ2h0ICsgc3RhZmZzW2kgKyAxXS5IZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJoZWlnaHQgKyBoZWlnaHRzID4gUGFnZUhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bSsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyaGVpZ2h0ID0gaGVpZ2h0cztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmhlaWdodCArPSBoZWlnaHRzO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKFN0YWZmIHN0YWZmIGluIHN0YWZmcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmhlaWdodCArIHN0YWZmLkhlaWdodCA+IFBhZ2VIZWlnaHQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBudW0rKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmhlaWdodCA9IHN0YWZmLkhlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmhlaWdodCArPSBzdGFmZi5IZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBudW07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogU2hhZGUgYWxsIHRoZSBjaG9yZHMgcGxheWVkIGF0IHRoZSBnaXZlbiBwdWxzZSB0aW1lLlxuICAgICAgICAgKiAgTG9vcCB0aHJvdWdoIGFsbCB0aGUgc3RhZmZzIGFuZCBjYWxsIHN0YWZmLlNoYWRlKCkuXG4gICAgICAgICAqICBJZiBzY3JvbGxHcmFkdWFsbHkgaXMgdHJ1ZSwgc2Nyb2xsIGdyYWR1YWxseSAoc21vb3RoIHNjcm9sbGluZylcbiAgICAgICAgICogIHRvIHRoZSBzaGFkZWQgbm90ZXMuIFJldHVybnMgdGhlIG1pbmltdW0geS1jb29yZGluYXRlIG9mIHRoZSBzaGFkZWQgY2hvcmQgKGZvciBzY3JvbGxpbmcgcHVycG9zZXMpXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBpbnQgU2hhZGVOb3RlcyhpbnQgY3VycmVudFB1bHNlVGltZSwgaW50IHByZXZQdWxzZVRpbWUsIGJvb2wgc2Nyb2xsR3JhZHVhbGx5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgR3JhcGhpY3MgZyA9IENyZWF0ZUdyYXBoaWNzKFwic2hhZGVOb3Rlc1wiKTtcclxuICAgICAgICAgICAgZy5TbW9vdGhpbmdNb2RlID0gU21vb3RoaW5nTW9kZS5BbnRpQWxpYXM7XHJcbiAgICAgICAgICAgIGcuU2NhbGVUcmFuc2Zvcm0oem9vbSwgem9vbSk7XHJcbiAgICAgICAgICAgIGludCB5cG9zID0gMDtcclxuXHJcbiAgICAgICAgICAgIGludCB4X3NoYWRlID0gMDtcclxuICAgICAgICAgICAgaW50IHlfc2hhZGUgPSAwO1xyXG5cclxuICAgICAgICAgICAgaW50IHNoYWRlZFlQb3MgPSAtMTtcclxuICAgICAgICAgICAgZm9yZWFjaCAoU3RhZmYgc3RhZmYgaW4gc3RhZmZzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgwLCB5cG9zKTtcclxuICAgICAgICAgICAgICAgIGlmIChzdGFmZi5TaGFkZU5vdGVzKGcsIHNoYWRlQnJ1c2gsIHBlbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFB1bHNlVGltZSwgcHJldlB1bHNlVGltZSwgcmVmIHhfc2hhZGUpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNoYWRlZFlQb3MgPSBzaGFkZWRZUG9zID09IC0xID8geXBvcyA6IHNoYWRlZFlQb3M7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgwLCAteXBvcyk7XHJcbiAgICAgICAgICAgICAgICB5cG9zICs9IHN0YWZmLkhlaWdodDtcclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50UHVsc2VUaW1lID49IHN0YWZmLkVuZFRpbWUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgeV9zaGFkZSArPSBzdGFmZi5IZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZy5TY2FsZVRyYW5zZm9ybSgxLjBmIC8gem9vbSwgMS4wZiAvIHpvb20pO1xyXG4gICAgICAgICAgICBnLkRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgeF9zaGFkZSA9IChpbnQpKHhfc2hhZGUgKiB6b29tKTtcclxuICAgICAgICAgICAgeV9zaGFkZSAtPSBOb3RlSGVpZ2h0O1xyXG4gICAgICAgICAgICB5X3NoYWRlID0gKGludCkoeV9zaGFkZSAqIHpvb20pO1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudFB1bHNlVGltZSA+PSAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBTY3JvbGxUb1NoYWRlZE5vdGVzKHhfc2hhZGUsIHlfc2hhZGUsIHNjcm9sbEdyYWR1YWxseSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNoYWRlZFlQb3MgPT0gLTEgPyAtMSA6IChpbnQpKHNoYWRlZFlQb3MgKiB6b29tKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBTY3JvbGwgdGhlIHNoZWV0IG11c2ljIHNvIHRoYXQgdGhlIHNoYWRlZCBub3RlcyBhcmUgdmlzaWJsZS5cbiAgICAgICAgICAqIElmIHNjcm9sbEdyYWR1YWxseSBpcyB0cnVlLCBzY3JvbGwgZ3JhZHVhbGx5IChzbW9vdGggc2Nyb2xsaW5nKVxuICAgICAgICAgICogdG8gdGhlIHNoYWRlZCBub3Rlcy5cbiAgICAgICAgICAqL1xyXG4gICAgICAgIHZvaWQgU2Nyb2xsVG9TaGFkZWROb3RlcyhpbnQgeF9zaGFkZSwgaW50IHlfc2hhZGUsIGJvb2wgc2Nyb2xsR3JhZHVhbGx5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgUGFuZWwgc2Nyb2xsdmlldyA9IChQYW5lbCl0aGlzLlBhcmVudDtcclxuICAgICAgICAgICAgUG9pbnQgc2Nyb2xsUG9zID0gc2Nyb2xsdmlldy5BdXRvU2Nyb2xsUG9zaXRpb247XHJcblxyXG4gICAgICAgICAgICAvKiBUaGUgc2Nyb2xsIHBvc2l0aW9uIGlzIGluIG5lZ2F0aXZlIGNvb3JkaW5hdGVzIGZvciBzb21lIHJlYXNvbiAqL1xyXG4gICAgICAgICAgICBzY3JvbGxQb3MuWCA9IC1zY3JvbGxQb3MuWDtcclxuICAgICAgICAgICAgc2Nyb2xsUG9zLlkgPSAtc2Nyb2xsUG9zLlk7XHJcbiAgICAgICAgICAgIFBvaW50IG5ld1BvcyA9IHNjcm9sbFBvcztcclxuXHJcbiAgICAgICAgICAgIGlmIChzY3JvbGxWZXJ0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgc2Nyb2xsRGlzdCA9IChpbnQpKHlfc2hhZGUgLSBzY3JvbGxQb3MuWSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNjcm9sbEdyYWR1YWxseSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2Nyb2xsRGlzdCA+ICh6b29tICogU3RhZmZIZWlnaHQgKiA4KSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsRGlzdCA9IHNjcm9sbERpc3QgLyAyO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHNjcm9sbERpc3QgPiAoTm90ZUhlaWdodCAqIDMgKiB6b29tKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsRGlzdCA9IChpbnQpKE5vdGVIZWlnaHQgKiAzICogem9vbSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBuZXdQb3MgPSBuZXcgUG9pbnQoc2Nyb2xsUG9zLlgsIHNjcm9sbFBvcy5ZICsgc2Nyb2xsRGlzdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgeF92aWV3ID0gc2Nyb2xsUG9zLlggKyA0MCAqIHNjcm9sbHZpZXcuV2lkdGggLyAxMDA7XHJcbiAgICAgICAgICAgICAgICBpbnQgeG1heCA9IHNjcm9sbFBvcy5YICsgNjUgKiBzY3JvbGx2aWV3LldpZHRoIC8gMTAwO1xyXG4gICAgICAgICAgICAgICAgaW50IHNjcm9sbERpc3QgPSB4X3NoYWRlIC0geF92aWV3O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzY3JvbGxHcmFkdWFsbHkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHhfc2hhZGUgPiB4bWF4KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxEaXN0ID0gKHhfc2hhZGUgLSB4X3ZpZXcpIC8gMztcclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh4X3NoYWRlID4geF92aWV3KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxEaXN0ID0gKHhfc2hhZGUgLSB4X3ZpZXcpIC8gNjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBuZXdQb3MgPSBuZXcgUG9pbnQoc2Nyb2xsUG9zLlggKyBzY3JvbGxEaXN0LCBzY3JvbGxQb3MuWSk7XHJcbiAgICAgICAgICAgICAgICBpZiAobmV3UG9zLlggPCAwKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld1Bvcy5YID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzY3JvbGx2aWV3LkF1dG9TY3JvbGxQb3NpdGlvbiA9IG5ld1BvcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBSZXR1cm4gdGhlIHB1bHNlVGltZSBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlbiBwb2ludCBvbiB0aGUgU2hlZXRNdXNpYy5cbiAgICAgICAgICogIEZpcnN0LCBmaW5kIHRoZSBzdGFmZiBjb3JyZXNwb25kaW5nIHRvIHRoZSBwb2ludC5cbiAgICAgICAgICogIFRoZW4sIHdpdGhpbiB0aGUgc3RhZmYsIGZpbmQgdGhlIG5vdGVzL3N5bWJvbHMgY29ycmVzcG9uZGluZyB0byB0aGUgcG9pbnQsXG4gICAgICAgICAqICBhbmQgcmV0dXJuIHRoZSBTdGFydFRpbWUgKHB1bHNlVGltZSkgb2YgdGhlIHN5bWJvbHMuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBpbnQgUHVsc2VUaW1lRm9yUG9pbnQoUG9pbnQgcG9pbnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBQb2ludCBzY2FsZWRQb2ludCA9IG5ldyBQb2ludCgoaW50KShwb2ludC5YIC8gem9vbSksIChpbnQpKHBvaW50LlkgLyB6b29tKSk7XHJcbiAgICAgICAgICAgIGludCB5ID0gMDtcclxuICAgICAgICAgICAgZm9yZWFjaCAoU3RhZmYgc3RhZmYgaW4gc3RhZmZzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2NhbGVkUG9pbnQuWSA+PSB5ICYmIHNjYWxlZFBvaW50LlkgPD0geSArIHN0YWZmLkhlaWdodClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhZmYuUHVsc2VUaW1lRm9yUG9pbnQoc2NhbGVkUG9pbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgeSArPSBzdGFmZi5IZWlnaHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzdHJpbmcgcmVzdWx0ID0gXCJTaGVldE11c2ljIHN0YWZmcz1cIiArIHN0YWZmcy5Db3VudCArIFwiXFxuXCI7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKFN0YWZmIHN0YWZmIGluIHN0YWZmcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHN0YWZmLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzdWx0ICs9IFwiRW5kIFNoZWV0TXVzaWNcXG5cIjtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxuXG59XG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgU29saWRCcnVzaDpCcnVzaFxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBTb2xpZEJydXNoKENvbG9yIGNvbG9yKTpcclxuICAgICAgICAgICAgYmFzZShjb2xvcilcclxuICAgICAgICB7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMSBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIEBjbGFzcyBUaW1lU2lnU3ltYm9sXG4gKiBBIFRpbWVTaWdTeW1ib2wgcmVwcmVzZW50cyB0aGUgdGltZSBzaWduYXR1cmUgYXQgdGhlIGJlZ2lubmluZ1xuICogb2YgdGhlIHN0YWZmLiBXZSB1c2UgcHJlLW1hZGUgaW1hZ2VzIGZvciB0aGUgbnVtYmVycywgaW5zdGVhZCBvZlxuICogZHJhd2luZyBzdHJpbmdzLlxuICovXG5cbnB1YmxpYyBjbGFzcyBUaW1lU2lnU3ltYm9sIDogTXVzaWNTeW1ib2wge1xuICAgIHByaXZhdGUgc3RhdGljIEltYWdlW10gaW1hZ2VzOyAgLyoqIFRoZSBpbWFnZXMgZm9yIGVhY2ggbnVtYmVyICovXG4gICAgcHJpdmF0ZSBpbnQgIG51bWVyYXRvcjsgICAgICAgICAvKiogVGhlIG51bWVyYXRvciAqL1xuICAgIHByaXZhdGUgaW50ICBkZW5vbWluYXRvcjsgICAgICAgLyoqIFRoZSBkZW5vbWluYXRvciAqL1xuICAgIHByaXZhdGUgaW50ICB3aWR0aDsgICAgICAgICAgICAgLyoqIFRoZSB3aWR0aCBpbiBwaXhlbHMgKi9cbiAgICBwcml2YXRlIGJvb2wgY2FuZHJhdzsgICAgICAgICAgIC8qKiBUcnVlIGlmIHdlIGNhbiBkcmF3IHRoZSB0aW1lIHNpZ25hdHVyZSAqL1xuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBUaW1lU2lnU3ltYm9sICovXG4gICAgcHVibGljIFRpbWVTaWdTeW1ib2woaW50IG51bWVyLCBpbnQgZGVub20pIHtcbiAgICAgICAgbnVtZXJhdG9yID0gbnVtZXI7XG4gICAgICAgIGRlbm9taW5hdG9yID0gZGVub207XG4gICAgICAgIExvYWRJbWFnZXMoKTtcbiAgICAgICAgaWYgKG51bWVyID49IDAgJiYgbnVtZXIgPCBpbWFnZXMuTGVuZ3RoICYmIGltYWdlc1tudW1lcl0gIT0gbnVsbCAmJlxuICAgICAgICAgICAgZGVub20gPj0gMCAmJiBkZW5vbSA8IGltYWdlcy5MZW5ndGggJiYgaW1hZ2VzW251bWVyXSAhPSBudWxsKSB7XG4gICAgICAgICAgICBjYW5kcmF3ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNhbmRyYXcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB3aWR0aCA9IE1pbldpZHRoO1xuICAgIH1cblxuICAgIC8qKiBMb2FkIHRoZSBpbWFnZXMgaW50byBtZW1vcnkuICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBMb2FkSW1hZ2VzKCkge1xuICAgICAgICBpZiAoaW1hZ2VzID09IG51bGwpIHtcbiAgICAgICAgICAgIGltYWdlcyA9IG5ldyBJbWFnZVsxM107XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDEzOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpbWFnZXNbaV0gPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW1hZ2VzWzJdID0gbmV3IEJpdG1hcCh0eXBlb2YoVGltZVNpZ1N5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy50d28ucG5nXCIpO1xuICAgICAgICAgICAgaW1hZ2VzWzNdID0gbmV3IEJpdG1hcCh0eXBlb2YoVGltZVNpZ1N5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy50aHJlZS5wbmdcIik7XG4gICAgICAgICAgICBpbWFnZXNbNF0gPSBuZXcgQml0bWFwKHR5cGVvZihUaW1lU2lnU3ltYm9sKSwgXCJSZXNvdXJjZXMuSW1hZ2VzLmZvdXIucG5nXCIpO1xuICAgICAgICAgICAgaW1hZ2VzWzZdID0gbmV3IEJpdG1hcCh0eXBlb2YoVGltZVNpZ1N5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy5zaXgucG5nXCIpO1xuICAgICAgICAgICAgaW1hZ2VzWzhdID0gbmV3IEJpdG1hcCh0eXBlb2YoVGltZVNpZ1N5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy5laWdodC5wbmdcIik7XG4gICAgICAgICAgICBpbWFnZXNbOV0gPSBuZXcgQml0bWFwKHR5cGVvZihUaW1lU2lnU3ltYm9sKSwgXCJSZXNvdXJjZXMuSW1hZ2VzLm5pbmUucG5nXCIpO1xuICAgICAgICAgICAgaW1hZ2VzWzEyXSA9IG5ldyBCaXRtYXAodHlwZW9mKFRpbWVTaWdTeW1ib2wpLCBcIlJlc291cmNlcy5JbWFnZXMudHdlbHZlLnBuZ1wiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIHRpbWUgKGluIHB1bHNlcykgdGhpcyBzeW1ib2wgb2NjdXJzIGF0LiAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgU3RhcnRUaW1lIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIC0xOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbWluaW11bSB3aWR0aCAoaW4gcGl4ZWxzKSBuZWVkZWQgdG8gZHJhdyB0aGlzIHN5bWJvbCAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgTWluV2lkdGgge1xuICAgICAgICBnZXQgeyBpZiAoY2FuZHJhdykgXG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW1hZ2VzWzJdLldpZHRoICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMiAvaW1hZ2VzWzJdLkhlaWdodDtcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEdldC9TZXQgdGhlIHdpZHRoIChpbiBwaXhlbHMpIG9mIHRoaXMgc3ltYm9sLiBUaGUgd2lkdGggaXMgc2V0XG4gICAgICogaW4gU2hlZXRNdXNpYy5BbGlnblN5bWJvbHMoKSB0byB2ZXJ0aWNhbGx5IGFsaWduIHN5bWJvbHMuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBXaWR0aCB7XG4gICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgc2V0IHsgd2lkdGggPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBhYm92ZSB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBBYm92ZVN0YWZmIHsgXG4gICAgICAgIGdldCB7ICByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBiZWxvdyB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBCZWxvd1N0YWZmIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIDA7IH0gXG4gICAgfVxuXG4gICAgLyoqIERyYXcgdGhlIHN5bWJvbC5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgXG4gICAgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIGlmICghY2FuZHJhdylcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybShXaWR0aCAtIE1pbldpZHRoLCAwKTtcbiAgICAgICAgSW1hZ2UgbnVtZXIgPSBpbWFnZXNbbnVtZXJhdG9yXTtcbiAgICAgICAgSW1hZ2UgZGVub20gPSBpbWFnZXNbZGVub21pbmF0b3JdO1xuXG4gICAgICAgIC8qIFNjYWxlIHRoZSBpbWFnZSB3aWR0aCB0byBtYXRjaCB0aGUgaGVpZ2h0ICovXG4gICAgICAgIGludCBpbWdoZWlnaHQgPSBTaGVldE11c2ljLk5vdGVIZWlnaHQgKiAyO1xuICAgICAgICBpbnQgaW1nd2lkdGggPSBudW1lci5XaWR0aCAqIGltZ2hlaWdodCAvIG51bWVyLkhlaWdodDtcbiAgICAgICAgZy5EcmF3SW1hZ2UobnVtZXIsIDAsIHl0b3AsIGltZ3dpZHRoLCBpbWdoZWlnaHQpO1xuICAgICAgICBnLkRyYXdJbWFnZShkZW5vbSwgMCwgeXRvcCArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyLCBpbWd3aWR0aCwgaW1naGVpZ2h0KTtcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShXaWR0aCAtIE1pbldpZHRoKSwgMCk7XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJUaW1lU2lnU3ltYm9sIG51bWVyYXRvcj17MH0gZGVub21pbmF0b3I9ezF9XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWVyYXRvciwgZGVub21pbmF0b3IpO1xuICAgIH1cbn1cblxufVxuXG4iXQp9Cg==
