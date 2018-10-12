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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJNaWRpU2hlZXRNdXNpY0JyaWRnZS5qcyIsCiAgInNvdXJjZVJvb3QiOiAiIiwKICAic291cmNlcyI6IFsiQ2xhc3Nlcy9EcmF3aW5nL0ltYWdlLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL0JydXNoLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL0JydXNoZXMuY3MiLCJDbGFzc2VzL0NsZWZNZWFzdXJlcy5jcyIsIkNsYXNzZXMvRHJhd2luZy9Db2xvci5jcyIsIkNsYXNzZXMvRHJhd2luZy9Db250cm9sLmNzIiwiQ2xhc3Nlcy9UZXh0L0VuY29kaW5nLmNzIiwiQ2xhc3Nlcy9JTy9TdHJlYW0uY3MiLCJDbGFzc2VzL0RyYXdpbmcvRm9udC5jcyIsIkNsYXNzZXMvRHJhd2luZy9HcmFwaGljcy5jcyIsIkNsYXNzZXMvS2V5U2lnbmF0dXJlLmNzIiwiQ2xhc3Nlcy9MeXJpY1N5bWJvbC5jcyIsIkNsYXNzZXMvTWlkaUV2ZW50LmNzIiwiQ2xhc3Nlcy9NaWRpRmlsZS5jcyIsIkNsYXNzZXMvTWlkaUZpbGVFeGNlcHRpb24uY3MiLCJDbGFzc2VzL01pZGlGaWxlUmVhZGVyLmNzIiwiQ2xhc3Nlcy9NaWRpTm90ZS5jcyIsIkNsYXNzZXMvTWlkaU9wdGlvbnMuY3MiLCJDbGFzc2VzL01pZGlUcmFjay5jcyIsIkNsYXNzZXMvV2hpdGVOb3RlLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL1BhaW50RXZlbnRBcmdzLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL1BhbmVsLmNzIiwiQ2xhc3Nlcy9JTy9QYXRoLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL1Blbi5jcyIsIkNsYXNzZXMvRHJhd2luZy9Qb2ludC5jcyIsIkNsYXNzZXMvRHJhd2luZy9SZWN0YW5nbGUuY3MiLCJDbGFzc2VzL1N0YWZmLmNzIiwiQ2xhc3Nlcy9TdGVtLmNzIiwiQ2xhc3Nlcy9TeW1ib2xXaWR0aHMuY3MiLCJDbGFzc2VzL1RpbWVTaWduYXR1cmUuY3MiLCJDbGFzc2VzL0FjY2lkU3ltYm9sLmNzIiwiQ2xhc3Nlcy9CYXJTeW1ib2wuY3MiLCJDbGFzc2VzL0RyYXdpbmcvQml0bWFwLmNzIiwiQ2xhc3Nlcy9CbGFua1N5bWJvbC5jcyIsIkNsYXNzZXMvQ2hvcmRTeW1ib2wuY3MiLCJDbGFzc2VzL0NsZWZTeW1ib2wuY3MiLCJDbGFzc2VzL0lPL0ZpbGVTdHJlYW0uY3MiLCJDbGFzc2VzL1BpYW5vLmNzIiwiQ2xhc3Nlcy9SZXN0U3ltYm9sLmNzIiwiQ2xhc3Nlcy9TaGVldE11c2ljLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL1NvbGlkQnJ1c2guY3MiLCJDbGFzc2VzL1RpbWVTaWdTeW1ib2wuY3MiXSwKICAibmFtZXMiOiBbIiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQW9CZ0JBLE9BQU9BLDBCQUE4Q0E7Ozs7O29CQVFyREEsT0FBT0EsMkJBQStDQTs7Ozs7NEJBakI5Q0EsTUFBV0E7O2dCQUV2QkEsc0JBQXFDQSxNQUFNQSxNQUFNQTs7Ozs7Ozs7Ozs0QkNIeENBOztnQkFFVEEsYUFBUUE7Ozs7Ozs7Ozs7Ozs7d0JDSnNCQSxPQUFPQSxJQUFJQSxxQkFBTUE7Ozs7O3dCQUNqQkEsT0FBT0EsSUFBSUEscUJBQU1BOzs7Ozt3QkFDYkEsT0FBT0EsSUFBSUEscUJBQU1BOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQ0NxRjlCQTs7b0JBQ3pCQSxjQUFjQTtvQkFDZEE7b0JBQ0FBLDBCQUF1QkE7Ozs7NEJBQ25CQSxpQkFBU0E7Ozs7OztxQkFFYkEsSUFBSUE7d0JBQ0FBLE9BQU9BOzJCQUVOQSxJQUFJQSx3QkFBTUEsc0JBQWVBO3dCQUMxQkEsT0FBT0E7O3dCQUdQQSxPQUFPQTs7Ozs7Ozs7Ozs0QkE3RUtBLE9BQXNCQTs7Z0JBQ3RDQSxlQUFVQTtnQkFDVkEsZUFBZ0JBLHFDQUFTQTtnQkFDekJBLGtCQUFrQkE7Z0JBQ2xCQTtnQkFDQUEsV0FBWUE7O2dCQUVaQSxhQUFRQSxLQUFJQTs7Z0JBRVpBLE9BQU9BLE1BQU1BOztvQkFFVEE7b0JBQ0FBO29CQUNBQSxPQUFPQSxNQUFNQSxl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QzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBOztvQkFFMUJBLE1BQU1BLHlEQUFVQSwrQkFBVkE7b0JBQ05BLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTs7b0JBRTFCQSxNQUFNQSx5REFBVUEsK0JBQVZBO29CQUNOQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7O29CQUUx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S0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7O29CQUUxQkEsTUFBTUEsd0RBQVNBLG1DQUFUQTtvQkFDTkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBOztvQkFFMUJBLE1BQU1BLHdEQUFTQSxtQ0FBVEE7b0JBQ05BLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTs7b0JBRTFCQSxNQUFNQSx3REFBU0EsbUNBQVRBO29CQUNOQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxn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QSxlQUFRQTtnQkFDN0JBLFlBQWNBLHVEQUFPQSxnQkFBUEE7Z0JBQ2RBLFlBQWNBLHVEQUFPQSxrQkFBUEE7OztnQkFHZEEsZ0JBQWdCQTtnQkFDaEJBLGVBQWVBLDRDQUFjQSxZQUFZQTtnQkFDekNBLFlBQVlBLFVBQVVBLE1BQU1BLFVBQVVBO2dCQUN0Q0EsWUFBWUEsVUFBVUEsU0FBT0EsK0RBQXlCQSxVQUFVQTtnQkFDaEVBLHFCQUFxQkEsR0FBQ0EsQ0FBQ0EsZUFBUUE7OztnQkFJL0JBLE9BQU9BLG9FQUNjQSwwQ0FBV0EiLAogICJzb3VyY2VzQ29udGVudCI6IFsidXNpbmcgQnJpZGdlO1xyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgSW1hZ2VcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgb2JqZWN0IERvbUltYWdlO1xyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgSW1hZ2UoVHlwZSB0eXBlLCBzdHJpbmcgZmlsZW5hbWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuaW1hZ2UuY3RvclwiLCB0aGlzLCB0eXBlLCBmaWxlbmFtZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgaW50IFdpZHRoXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXRcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFNjcmlwdC5DYWxsPGludD4oXCJicmlkZ2VVdGlsLmltYWdlLmdldFdpZHRoXCIsIHRoaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgaW50IEhlaWdodFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBTY3JpcHQuQ2FsbDxpbnQ+KFwiYnJpZGdlVXRpbC5pbWFnZS5nZXRIZWlnaHRcIiwgdGhpcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEJydXNoXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIENvbG9yIENvbG9yO1xyXG5cclxuICAgICAgICBwdWJsaWMgQnJ1c2goQ29sb3IgY29sb3IpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBDb2xvciA9IGNvbG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgRGlzcG9zZSgpIHsgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBzdGF0aWMgY2xhc3MgQnJ1c2hlc1xyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQnJ1c2ggQmxhY2sgeyBnZXQgeyByZXR1cm4gbmV3IEJydXNoKENvbG9yLkJsYWNrKTsgfSB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBCcnVzaCBXaGl0ZSB7IGdldCB7IHJldHVybiBuZXcgQnJ1c2goQ29sb3IuV2hpdGUpOyB9IH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIEJydXNoIExpZ2h0R3JheSB7IGdldCB7IHJldHVybiBuZXcgQnJ1c2goQ29sb3IuTGlnaHRHcmF5KTsgfSB9XHJcbiAgICB9XHJcbn1cclxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDA4IE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIEBjbGFzcyBDbGVmTWVhc3VyZXNcbiAqIFRoZSBDbGVmTWVhc3VyZXMgY2xhc3MgaXMgdXNlZCB0byByZXBvcnQgd2hhdCBDbGVmIChUcmVibGUgb3IgQmFzcykgYVxuICogZ2l2ZW4gbWVhc3VyZSB1c2VzLlxuICovXG5wdWJsaWMgY2xhc3MgQ2xlZk1lYXN1cmVzIHtcbiAgICBwcml2YXRlIExpc3Q8Q2xlZj4gY2xlZnM7ICAvKiogVGhlIGNsZWZzIHVzZWQgZm9yIGVhY2ggbWVhc3VyZSAoZm9yIGEgc2luZ2xlIHRyYWNrKSAqL1xuICAgIHByaXZhdGUgaW50IG1lYXN1cmU7ICAgICAgIC8qKiBUaGUgbGVuZ3RoIG9mIGEgbWVhc3VyZSwgaW4gcHVsc2VzICovXG5cbiBcbiAgICAvKiogR2l2ZW4gdGhlIG5vdGVzIGluIGEgdHJhY2ssIGNhbGN1bGF0ZSB0aGUgYXBwcm9wcmlhdGUgQ2xlZiB0byB1c2VcbiAgICAgKiBmb3IgZWFjaCBtZWFzdXJlLiAgU3RvcmUgdGhlIHJlc3VsdCBpbiB0aGUgY2xlZnMgbGlzdC5cbiAgICAgKiBAcGFyYW0gbm90ZXMgIFRoZSBtaWRpIG5vdGVzXG4gICAgICogQHBhcmFtIG1lYXN1cmVsZW4gVGhlIGxlbmd0aCBvZiBhIG1lYXN1cmUsIGluIHB1bHNlc1xuICAgICAqL1xuICAgIHB1YmxpYyBDbGVmTWVhc3VyZXMoTGlzdDxNaWRpTm90ZT4gbm90ZXMsIGludCBtZWFzdXJlbGVuKSB7XG4gICAgICAgIG1lYXN1cmUgPSBtZWFzdXJlbGVuO1xuICAgICAgICBDbGVmIG1haW5jbGVmID0gTWFpbkNsZWYobm90ZXMpO1xuICAgICAgICBpbnQgbmV4dG1lYXN1cmUgPSBtZWFzdXJlbGVuO1xuICAgICAgICBpbnQgcG9zID0gMDtcbiAgICAgICAgQ2xlZiBjbGVmID0gbWFpbmNsZWY7XG5cbiAgICAgICAgY2xlZnMgPSBuZXcgTGlzdDxDbGVmPigpO1xuXG4gICAgICAgIHdoaWxlIChwb3MgPCBub3Rlcy5Db3VudCkge1xuICAgICAgICAgICAgLyogU3VtIGFsbCB0aGUgbm90ZXMgaW4gdGhlIGN1cnJlbnQgbWVhc3VyZSAqL1xuICAgICAgICAgICAgaW50IHN1bW5vdGVzID0gMDtcbiAgICAgICAgICAgIGludCBub3RlY291bnQgPSAwO1xuICAgICAgICAgICAgd2hpbGUgKHBvcyA8IG5vdGVzLkNvdW50ICYmIG5vdGVzW3Bvc10uU3RhcnRUaW1lIDwgbmV4dG1lYXN1cmUpIHtcbiAgICAgICAgICAgICAgICBzdW1ub3RlcyArPSBub3Rlc1twb3NdLk51bWJlcjtcbiAgICAgICAgICAgICAgICBub3RlY291bnQrKztcbiAgICAgICAgICAgICAgICBwb3MrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChub3RlY291bnQgPT0gMClcbiAgICAgICAgICAgICAgICBub3RlY291bnQgPSAxO1xuXG4gICAgICAgICAgICAvKiBDYWxjdWxhdGUgdGhlIFwiYXZlcmFnZVwiIG5vdGUgaW4gdGhlIG1lYXN1cmUgKi9cbiAgICAgICAgICAgIGludCBhdmdub3RlID0gc3Vtbm90ZXMgLyBub3RlY291bnQ7XG4gICAgICAgICAgICBpZiAoYXZnbm90ZSA9PSAwKSB7XG4gICAgICAgICAgICAgICAgLyogVGhpcyBtZWFzdXJlIGRvZXNuJ3QgY29udGFpbiBhbnkgbm90ZXMuXG4gICAgICAgICAgICAgICAgICogS2VlcCB0aGUgcHJldmlvdXMgY2xlZi5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGF2Z25vdGUgPj0gV2hpdGVOb3RlLkJvdHRvbVRyZWJsZS5OdW1iZXIoKSkge1xuICAgICAgICAgICAgICAgIGNsZWYgPSBDbGVmLlRyZWJsZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGF2Z25vdGUgPD0gV2hpdGVOb3RlLlRvcEJhc3MuTnVtYmVyKCkpIHtcbiAgICAgICAgICAgICAgICBjbGVmID0gQ2xlZi5CYXNzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLyogVGhlIGF2ZXJhZ2Ugbm90ZSBpcyBiZXR3ZWVuIEczIGFuZCBGNC4gV2UgY2FuIHVzZSBlaXRoZXJcbiAgICAgICAgICAgICAgICAgKiB0aGUgdHJlYmxlIG9yIGJhc3MgY2xlZi4gIFVzZSB0aGUgXCJtYWluXCIgY2xlZiwgdGhlIGNsZWZcbiAgICAgICAgICAgICAgICAgKiB0aGF0IGFwcGVhcnMgbW9zdCBmb3IgdGhpcyB0cmFjay5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBjbGVmID0gbWFpbmNsZWY7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNsZWZzLkFkZChjbGVmKTtcbiAgICAgICAgICAgIG5leHRtZWFzdXJlICs9IG1lYXN1cmVsZW47XG4gICAgICAgIH1cbiAgICAgICAgY2xlZnMuQWRkKGNsZWYpO1xuICAgIH1cblxuICAgIC8qKiBHaXZlbiBhIHRpbWUgKGluIHB1bHNlcyksIHJldHVybiB0aGUgY2xlZiB1c2VkIGZvciB0aGF0IG1lYXN1cmUuICovXG4gICAgcHVibGljIENsZWYgR2V0Q2xlZihpbnQgc3RhcnR0aW1lKSB7XG5cbiAgICAgICAgLyogSWYgdGhlIHRpbWUgZXhjZWVkcyB0aGUgbGFzdCBtZWFzdXJlLCByZXR1cm4gdGhlIGxhc3QgbWVhc3VyZSAqL1xuICAgICAgICBpZiAoc3RhcnR0aW1lIC8gbWVhc3VyZSA+PSBjbGVmcy5Db3VudCkge1xuICAgICAgICAgICAgcmV0dXJuIGNsZWZzWyBjbGVmcy5Db3VudC0xIF07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gY2xlZnNbIHN0YXJ0dGltZSAvIG1lYXN1cmUgXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBDYWxjdWxhdGUgdGhlIGJlc3QgY2xlZiB0byB1c2UgZm9yIHRoZSBnaXZlbiBub3Rlcy4gIElmIHRoZVxuICAgICAqIGF2ZXJhZ2Ugbm90ZSBpcyBiZWxvdyBNaWRkbGUgQywgdXNlIGEgYmFzcyBjbGVmLiAgRWxzZSwgdXNlIGEgdHJlYmxlXG4gICAgICogY2xlZi5cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBDbGVmIE1haW5DbGVmKExpc3Q8TWlkaU5vdGU+IG5vdGVzKSB7XG4gICAgICAgIGludCBtaWRkbGVDID0gV2hpdGVOb3RlLk1pZGRsZUMuTnVtYmVyKCk7XG4gICAgICAgIGludCB0b3RhbCA9IDA7XG4gICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG0gaW4gbm90ZXMpIHtcbiAgICAgICAgICAgIHRvdGFsICs9IG0uTnVtYmVyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub3Rlcy5Db3VudCA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gQ2xlZi5UcmVibGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodG90YWwvbm90ZXMuQ291bnQgPj0gbWlkZGxlQykge1xuICAgICAgICAgICAgcmV0dXJuIENsZWYuVHJlYmxlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIENsZWYuQmFzcztcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG59XG5cbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBDb2xvclxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBpbnQgUmVkO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgR3JlZW47XHJcbiAgICAgICAgcHVibGljIGludCBCbHVlO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgQWxwaGE7XHJcblxyXG4gICAgICAgIHB1YmxpYyBDb2xvcigpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBBbHBoYSA9IDI1NTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQ29sb3IgRnJvbUFyZ2IoaW50IHJlZCwgaW50IGdyZWVuLCBpbnQgYmx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gRnJvbUFyZ2IoMjU1LCByZWQsIGdyZWVuLCBibHVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQ29sb3IgRnJvbUFyZ2IoaW50IGFscGhhLCBpbnQgcmVkLCBpbnQgZ3JlZW4sIGludCBibHVlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBDb2xvclxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBBbHBoYSA9IGFscGhhLFxyXG4gICAgICAgICAgICAgICAgUmVkID0gcmVkLFxyXG4gICAgICAgICAgICAgICAgR3JlZW4gPSBncmVlbixcclxuICAgICAgICAgICAgICAgIEJsdWUgPSBibHVlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIENvbG9yIEJsYWNrIHsgZ2V0IHsgcmV0dXJuIG5ldyBDb2xvcigpOyB9IH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBDb2xvciBXaGl0ZSB7IGdldCB7IHJldHVybiBGcm9tQXJnYigyNTUsMjU1LDI1NSk7IH0gfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIENvbG9yIExpZ2h0R3JheSB7IGdldCB7IHJldHVybiBGcm9tQXJnYigweGQzLDB4ZDMsMHhkMyk7IH0gfVxyXG5cclxuICAgICAgICBwdWJsaWMgaW50IFIgeyBnZXQgeyByZXR1cm4gUmVkOyB9IH1cclxuICAgICAgICBwdWJsaWMgaW50IEcgeyBnZXQgeyByZXR1cm4gR3JlZW47IH0gfVxyXG4gICAgICAgIHB1YmxpYyBpbnQgQiB7IGdldCB7IHJldHVybiBCbHVlOyB9IH1cclxuXHJcbiAgICAgICAgcHVibGljIGJvb2wgRXF1YWxzKENvbG9yIGNvbG9yKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIFJlZCA9PSBjb2xvci5SZWQgJiYgR3JlZW4gPT0gY29sb3IuR3JlZW4gJiYgQmx1ZSA9PSBjb2xvci5CbHVlICYmIEFscGhhPT1jb2xvci5BbHBoYTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIENvbnRyb2xcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgaW50IFdpZHRoO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgSGVpZ2h0O1xyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBJbnZhbGlkYXRlKCkgeyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBHcmFwaGljcyBDcmVhdGVHcmFwaGljcyhzdHJpbmcgbmFtZSkgeyByZXR1cm4gbmV3IEdyYXBoaWNzKG5hbWUpOyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBQYW5lbCBQYXJlbnQgeyBnZXQgeyByZXR1cm4gbmV3IFBhbmVsKCk7IH0gfVxyXG5cclxuICAgICAgICBwdWJsaWMgQ29sb3IgQmFja0NvbG9yO1xyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBzdGF0aWMgY2xhc3MgRW5jb2RpbmdcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIHN0cmluZyBHZXRVdGY4U3RyaW5nKGJ5dGVbXSB2YWx1ZSwgaW50IHN0YXJ0SW5kZXgsIGludCBsZW5ndGgpIHsgcmV0dXJuIFwibm90IGltcGxlbWVudGVkIVwiOyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgc3RyaW5nIEdldEFzY2lpU3RyaW5nKGJ5dGVbXSBkYXRhLCBpbnQgc3RhcnRJbmRleCwgaW50IGxlbikgXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgdG9SZXR1cm4gPSBcIlwiO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbiAmJiBpIDwgZGF0YS5MZW5ndGg7IGkrKylcclxuICAgICAgICAgICAgICAgIHRvUmV0dXJuICs9IChjaGFyKWRhdGFbaSArIHN0YXJ0SW5kZXhdO1xyXG4gICAgICAgICAgICByZXR1cm4gdG9SZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGJ5dGVbXSBHZXRBc2NpaUJ5dGVzKHN0cmluZyB2YWx1ZSkgeyByZXR1cm4gbnVsbDsgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBTdHJlYW1cclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgdm9pZCBXcml0ZShieXRlW10gYnVmZmVyLCBpbnQgb2Zmc2V0LCBpbnQgY291bnQpIHsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBDbG9zZSgpIHsgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBGb250XHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIHN0cmluZyBOYW1lO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgU2l6ZTtcclxuICAgICAgICBwdWJsaWMgRm9udFN0eWxlIFN0eWxlO1xyXG5cclxuICAgICAgICBwdWJsaWMgRm9udChzdHJpbmcgbmFtZSwgaW50IHNpemUsIEZvbnRTdHlsZSBzdHlsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIE5hbWUgPSBuYW1lO1xyXG4gICAgICAgICAgICBTaXplID0gc2l6ZTtcclxuICAgICAgICAgICAgU3R5bGUgPSBzdHlsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBmbG9hdCBHZXRIZWlnaHQoKSB7IHJldHVybiAwOyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIERpc3Bvc2UoKSB7IH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBCcmlkZ2U7XHJcbnVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBHcmFwaGljc1xyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBHcmFwaGljcyhzdHJpbmcgbmFtZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIE5hbWUgPSBuYW1lO1xyXG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3MuaW5pdEdyYXBoaWNzXCIsIHRoaXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0cmluZyBOYW1lO1xyXG5cclxuICAgICAgICBwdWJsaWMgb2JqZWN0IENvbnRleHQ7XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFRyYW5zbGF0ZVRyYW5zZm9ybShpbnQgeCwgaW50IHkpIHtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLnRyYW5zbGF0ZVRyYW5zZm9ybVwiLCB0aGlzLCB4LCB5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIERyYXdJbWFnZShJbWFnZSBpbWFnZSwgaW50IHgsIGludCB5LCBpbnQgd2lkdGgsIGludCBoZWlnaHQpIHtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLmRyYXdJbWFnZVwiLCB0aGlzLCBpbWFnZSwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBEcmF3U3RyaW5nKHN0cmluZyB0ZXh0LCBGb250IGZvbnQsIEJydXNoIGJydXNoLCBpbnQgeCwgaW50IHkpIHtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLmRyYXdTdHJpbmdcIiwgdGhpcywgdGV4dCwgZm9udCwgYnJ1c2gsIHgsIHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgRHJhd0xpbmUoUGVuIHBlbiwgaW50IHhTdGFydCwgaW50IHlTdGFydCwgaW50IHhFbmQsIGludCB5RW5kKSB7XHJcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy5kcmF3TGluZVwiLCB0aGlzLCBwZW4sIHhTdGFydCwgeVN0YXJ0LCB4RW5kLCB5RW5kKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIERyYXdCZXppZXIoUGVuIHBlbiwgaW50IHgxLCBpbnQgeTEsIGludCB4MiwgaW50IHkyLCBpbnQgeDMsIGludCB5MywgaW50IHg0LCBpbnQgeTQpIHtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLmRyYXdCZXppZXJcIiwgdGhpcywgcGVuLCB4MSwgeTEsIHgyLCB5MiwgeDMsIHkzLCB4NCwgeTQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgU2NhbGVUcmFuc2Zvcm0oZmxvYXQgeCwgZmxvYXQgeSkge1xyXG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3Muc2NhbGVUcmFuc2Zvcm1cIiwgdGhpcywgeCwgeSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBGaWxsUmVjdGFuZ2xlKEJydXNoIGJydXNoLCBpbnQgeCwgaW50IHksIGludCB3aWR0aCwgaW50IGhlaWdodCkge1xyXG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3MuZmlsbFJlY3RhbmdsZVwiLCB0aGlzLCBicnVzaCwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBDbGVhclJlY3RhbmdsZShpbnQgeCwgaW50IHksIGludCB3aWR0aCwgaW50IGhlaWdodCkge1xyXG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3MuY2xlYXJSZWN0YW5nbGVcIiwgdGhpcywgeCwgeSwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBGaWxsRWxsaXBzZShCcnVzaCBicnVzaCwgaW50IHgsIGludCB5LCBpbnQgd2lkdGgsIGludCBoZWlnaHQpIHtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLmZpbGxFbGxpcHNlXCIsIHRoaXMsIGJydXNoLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIERyYXdFbGxpcHNlKFBlbiBwZW4sIGludCB4LCBpbnQgeSwgaW50IHdpZHRoLCBpbnQgaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy5kcmF3RWxsaXBzZVwiLCB0aGlzLCBwZW4sIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgUm90YXRlVHJhbnNmb3JtKGZsb2F0IGFuZ2xlRGVnKSB7XHJcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy5yb3RhdGVUcmFuc2Zvcm1cIiwgdGhpcywgYW5nbGVEZWcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIFNtb290aGluZ01vZGUgU21vb3RoaW5nTW9kZSB7IGdldDsgc2V0OyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBSZWN0YW5nbGUgVmlzaWJsZUNsaXBCb3VuZHMgeyBnZXQ7IHNldDsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZmxvYXQgUGFnZVNjYWxlIHsgZ2V0OyBzZXQ7IH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgRGlzcG9zZSgpIHsgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMyBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuXG4vKiogQGNsYXNzIEtleVNpZ25hdHVyZVxuICogVGhlIEtleVNpZ25hdHVyZSBjbGFzcyByZXByZXNlbnRzIGEga2V5IHNpZ25hdHVyZSwgbGlrZSBHIE1ham9yXG4gKiBvciBCLWZsYXQgTWFqb3IuICBGb3Igc2hlZXQgbXVzaWMsIHdlIG9ubHkgY2FyZSBhYm91dCB0aGUgbnVtYmVyXG4gKiBvZiBzaGFycHMgb3IgZmxhdHMgaW4gdGhlIGtleSBzaWduYXR1cmUsIG5vdCB3aGV0aGVyIGl0IGlzIG1ham9yXG4gKiBvciBtaW5vci5cbiAqXG4gKiBUaGUgbWFpbiBvcGVyYXRpb25zIG9mIHRoaXMgY2xhc3MgYXJlOlxuICogLSBHdWVzc2luZyB0aGUga2V5IHNpZ25hdHVyZSwgZ2l2ZW4gdGhlIG5vdGVzIGluIGEgc29uZy5cbiAqIC0gR2VuZXJhdGluZyB0aGUgYWNjaWRlbnRhbCBzeW1ib2xzIGZvciB0aGUga2V5IHNpZ25hdHVyZS5cbiAqIC0gRGV0ZXJtaW5pbmcgd2hldGhlciBhIHBhcnRpY3VsYXIgbm90ZSByZXF1aXJlcyBhbiBhY2NpZGVudGFsXG4gKiAgIG9yIG5vdC5cbiAqXG4gKi9cblxucHVibGljIGNsYXNzIEtleVNpZ25hdHVyZSB7XG4gICAgLyoqIFRoZSBudW1iZXIgb2Ygc2hhcnBzIGluIGVhY2gga2V5IHNpZ25hdHVyZSAqL1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQyA9IDA7XG4gICAgcHVibGljIGNvbnN0IGludCBHID0gMTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEQgPSAyO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQSA9IDM7XG4gICAgcHVibGljIGNvbnN0IGludCBFID0gNDtcbiAgICBwdWJsaWMgY29uc3QgaW50IEIgPSA1O1xuXG4gICAgLyoqIFRoZSBudW1iZXIgb2YgZmxhdHMgaW4gZWFjaCBrZXkgc2lnbmF0dXJlICovXG4gICAgcHVibGljIGNvbnN0IGludCBGID0gMTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEJmbGF0ID0gMjtcbiAgICBwdWJsaWMgY29uc3QgaW50IEVmbGF0ID0gMztcbiAgICBwdWJsaWMgY29uc3QgaW50IEFmbGF0ID0gNDtcbiAgICBwdWJsaWMgY29uc3QgaW50IERmbGF0ID0gNTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEdmbGF0ID0gNjtcblxuICAgIC8qKiBUaGUgdHdvIGFycmF5cyBiZWxvdyBhcmUga2V5IG1hcHMuICBUaGV5IHRha2UgYSBtYWpvciBrZXlcbiAgICAgKiAobGlrZSBHIG1ham9yLCBCLWZsYXQgbWFqb3IpIGFuZCBhIG5vdGUgaW4gdGhlIHNjYWxlLCBhbmRcbiAgICAgKiByZXR1cm4gdGhlIEFjY2lkZW50YWwgcmVxdWlyZWQgdG8gZGlzcGxheSB0aGF0IG5vdGUgaW4gdGhlXG4gICAgICogZ2l2ZW4ga2V5LiAgSW4gYSBudXRzaGVsLCB0aGUgbWFwIGlzXG4gICAgICpcbiAgICAgKiAgIG1hcFtLZXldW05vdGVTY2FsZV0gLT4gQWNjaWRlbnRhbFxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIEFjY2lkW11bXSBzaGFycGtleXM7XG4gICAgcHJpdmF0ZSBzdGF0aWMgQWNjaWRbXVtdIGZsYXRrZXlzO1xuXG4gICAgcHJpdmF0ZSBpbnQgbnVtX2ZsYXRzOyAgIC8qKiBUaGUgbnVtYmVyIG9mIHNoYXJwcyBpbiB0aGUga2V5LCAwIHRocnUgNiAqL1xuICAgIHByaXZhdGUgaW50IG51bV9zaGFycHM7ICAvKiogVGhlIG51bWJlciBvZiBmbGF0cyBpbiB0aGUga2V5LCAwIHRocnUgNiAqL1xuXG4gICAgLyoqIFRoZSBhY2NpZGVudGFsIHN5bWJvbHMgdGhhdCBkZW5vdGUgdGhpcyBrZXksIGluIGEgdHJlYmxlIGNsZWYgKi9cbiAgICBwcml2YXRlIEFjY2lkU3ltYm9sW10gdHJlYmxlO1xuXG4gICAgLyoqIFRoZSBhY2NpZGVudGFsIHN5bWJvbHMgdGhhdCBkZW5vdGUgdGhpcyBrZXksIGluIGEgYmFzcyBjbGVmICovXG4gICAgcHJpdmF0ZSBBY2NpZFN5bWJvbFtdIGJhc3M7XG5cbiAgICAvKiogVGhlIGtleSBtYXAgZm9yIHRoaXMga2V5IHNpZ25hdHVyZTpcbiAgICAgKiAgIGtleW1hcFtub3RlbnVtYmVyXSAtPiBBY2NpZGVudGFsXG4gICAgICovXG4gICAgcHJpdmF0ZSBBY2NpZFtdIGtleW1hcDtcblxuICAgIC8qKiBUaGUgbWVhc3VyZSB1c2VkIGluIHRoZSBwcmV2aW91cyBjYWxsIHRvIEdldEFjY2lkZW50YWwoKSAqL1xuICAgIHByaXZhdGUgaW50IHByZXZtZWFzdXJlOyBcblxuXG4gICAgLyoqIENyZWF0ZSBuZXcga2V5IHNpZ25hdHVyZSwgd2l0aCB0aGUgZ2l2ZW4gbnVtYmVyIG9mXG4gICAgICogc2hhcnBzIGFuZCBmbGF0cy4gIE9uZSBvZiB0aGUgdHdvIG11c3QgYmUgMCwgeW91IGNhbid0XG4gICAgICogaGF2ZSBib3RoIHNoYXJwcyBhbmQgZmxhdHMgaW4gdGhlIGtleSBzaWduYXR1cmUuXG4gICAgICovXG4gICAgcHVibGljIEtleVNpZ25hdHVyZShpbnQgbnVtX3NoYXJwcywgaW50IG51bV9mbGF0cykge1xuICAgICAgICBpZiAoIShudW1fc2hhcnBzID09IDAgfHwgbnVtX2ZsYXRzID09IDApKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgU3lzdGVtLkFyZ3VtZW50RXhjZXB0aW9uKFwiQmFkIEtleVNpZ2F0dXJlIGFyZ3NcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5udW1fc2hhcnBzID0gbnVtX3NoYXJwcztcbiAgICAgICAgdGhpcy5udW1fZmxhdHMgPSBudW1fZmxhdHM7XG5cbiAgICAgICAgQ3JlYXRlQWNjaWRlbnRhbE1hcHMoKTtcbiAgICAgICAga2V5bWFwID0gbmV3IEFjY2lkWzE2MF07XG4gICAgICAgIFJlc2V0S2V5TWFwKCk7XG4gICAgICAgIENyZWF0ZVN5bWJvbHMoKTtcbiAgICB9XG5cbiAgICAvKiogQ3JlYXRlIG5ldyBrZXkgc2lnbmF0dXJlLCB3aXRoIHRoZSBnaXZlbiBub3Rlc2NhbGUuICAqL1xuICAgIHB1YmxpYyBLZXlTaWduYXR1cmUoaW50IG5vdGVzY2FsZSkge1xuICAgICAgICBudW1fc2hhcnBzID0gbnVtX2ZsYXRzID0gMDtcbiAgICAgICAgc3dpdGNoIChub3Rlc2NhbGUpIHtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkE6ICAgICBudW1fc2hhcnBzID0gMzsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5CZmxhdDogbnVtX2ZsYXRzID0gMjsgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQjogICAgIG51bV9zaGFycHMgPSA1OyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkM6ICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkRmbGF0OiBudW1fZmxhdHMgPSA1OyAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5EOiAgICAgbnVtX3NoYXJwcyA9IDI7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRWZsYXQ6IG51bV9mbGF0cyA9IDM7ICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkU6ICAgICBudW1fc2hhcnBzID0gNDsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5GOiAgICAgbnVtX2ZsYXRzID0gMTsgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuR2ZsYXQ6IG51bV9mbGF0cyA9IDY7ICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkc6ICAgICBudW1fc2hhcnBzID0gMTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5BZmxhdDogbnVtX2ZsYXRzID0gNDsgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDogICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgQ3JlYXRlQWNjaWRlbnRhbE1hcHMoKTtcbiAgICAgICAga2V5bWFwID0gbmV3IEFjY2lkWzE2MF07XG4gICAgICAgIFJlc2V0S2V5TWFwKCk7XG4gICAgICAgIENyZWF0ZVN5bWJvbHMoKTtcbiAgICB9XG5cblxuICAgIC8qKiBJbmlpdGFsaXplIHRoZSBzaGFycGtleXMgYW5kIGZsYXRrZXlzIG1hcHMgKi9cbiAgICBwcml2YXRlIHN0YXRpYyB2b2lkIENyZWF0ZUFjY2lkZW50YWxNYXBzKCkge1xuICAgICAgICBpZiAoc2hhcnBrZXlzICE9IG51bGwpXG4gICAgICAgICAgICByZXR1cm47IFxuXG4gICAgICAgIEFjY2lkW10gbWFwO1xuICAgICAgICBzaGFycGtleXMgPSBuZXcgQWNjaWRbOF1bXTtcbiAgICAgICAgZmxhdGtleXMgPSBuZXcgQWNjaWRbOF1bXTtcblxuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICAgICAgc2hhcnBrZXlzW2ldID0gbmV3IEFjY2lkWzEyXTtcbiAgICAgICAgICAgIGZsYXRrZXlzW2ldID0gbmV3IEFjY2lkWzEyXTtcbiAgICAgICAgfVxuXG4gICAgICAgIG1hcCA9IHNoYXJwa2V5c1tDXTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Bc2hhcnAgXSA9IEFjY2lkLkZsYXQ7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Dc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Gc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkdzaGFycCBdID0gQWNjaWQuU2hhcnA7XG5cbiAgICAgICAgbWFwID0gc2hhcnBrZXlzW0ddO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkFzaGFycCBdID0gQWNjaWQuRmxhdDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkNzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRHNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Hc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuXG4gICAgICAgIG1hcCA9IHNoYXJwa2V5c1tEXTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Bc2hhcnAgXSA9IEFjY2lkLkZsYXQ7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Dc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRHNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Hc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuXG4gICAgICAgIG1hcCA9IHNoYXJwa2V5c1tBXTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Bc2hhcnAgXSA9IEFjY2lkLkZsYXQ7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Dc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRHNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Hc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG5cbiAgICAgICAgbWFwID0gc2hhcnBrZXlzW0VdO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkFzaGFycCBdID0gQWNjaWQuRmxhdDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkNzaGFycCBdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRCBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Ec2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Gc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuR3NoYXJwIF0gPSBBY2NpZC5Ob25lO1xuXG4gICAgICAgIG1hcCA9IHNoYXJwa2V5c1tCXTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Bc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Dc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRHNoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRnNoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkdzaGFycCBdID0gQWNjaWQuTm9uZTtcblxuICAgICAgICAvKiBGbGF0IGtleXMgKi9cbiAgICAgICAgbWFwID0gZmxhdGtleXNbQ107XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQXNoYXJwIF0gPSBBY2NpZC5GbGF0O1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQ3NoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRCBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Ec2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRnNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Hc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuXG4gICAgICAgIG1hcCA9IGZsYXRrZXlzW0ZdO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkJmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkNzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRWZsYXQgXSAgPSBBY2NpZC5GbGF0O1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRnNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BZmxhdCBdICA9IEFjY2lkLkZsYXQ7XG5cbiAgICAgICAgbWFwID0gZmxhdGtleXNbQmZsYXRdO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkJmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkNzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRWZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRnNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BZmxhdCBdICA9IEFjY2lkLkZsYXQ7XG5cbiAgICAgICAgbWFwID0gZmxhdGtleXNbRWZsYXRdO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkJmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRmbGF0IF0gID0gQWNjaWQuRmxhdDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRCBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Gc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkFmbGF0IF0gID0gQWNjaWQuTm9uZTtcblxuICAgICAgICBtYXAgPSBmbGF0a2V5c1tBZmxhdF07XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQmZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRGZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkVmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQWZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuXG4gICAgICAgIG1hcCA9IGZsYXRrZXlzW0RmbGF0XTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRWZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuR2ZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkFmbGF0IF0gID0gQWNjaWQuTm9uZTtcblxuICAgICAgICBtYXAgPSBmbGF0a2V5c1tHZmxhdF07XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQmZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRGZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkVmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkdmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BZmxhdCBdICA9IEFjY2lkLk5vbmU7XG5cblxuICAgIH1cblxuICAgIC8qKiBUaGUga2V5bWFwIHRlbGxzIHdoYXQgYWNjaWRlbnRhbCBzeW1ib2wgaXMgbmVlZGVkIGZvciBlYWNoXG4gICAgICogIG5vdGUgaW4gdGhlIHNjYWxlLiAgUmVzZXQgdGhlIGtleW1hcCB0byB0aGUgdmFsdWVzIG9mIHRoZVxuICAgICAqICBrZXkgc2lnbmF0dXJlLlxuICAgICAqL1xuICAgIHByaXZhdGUgdm9pZCBSZXNldEtleU1hcCgpXG4gICAge1xuICAgICAgICBBY2NpZFtdIGtleTtcbiAgICAgICAgaWYgKG51bV9mbGF0cyA+IDApXG4gICAgICAgICAgICBrZXkgPSBmbGF0a2V5c1tudW1fZmxhdHNdO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBrZXkgPSBzaGFycGtleXNbbnVtX3NoYXJwc107XG5cbiAgICAgICAgZm9yIChpbnQgbm90ZW51bWJlciA9IDA7IG5vdGVudW1iZXIgPCBrZXltYXAuTGVuZ3RoOyBub3RlbnVtYmVyKyspIHtcbiAgICAgICAgICAgIGtleW1hcFtub3RlbnVtYmVyXSA9IGtleVtOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyKV07XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIC8qKiBDcmVhdGUgdGhlIEFjY2lkZW50YWwgc3ltYm9scyBmb3IgdGhpcyBrZXksIGZvclxuICAgICAqIHRoZSB0cmVibGUgYW5kIGJhc3MgY2xlZnMuXG4gICAgICovXG4gICAgcHJpdmF0ZSB2b2lkIENyZWF0ZVN5bWJvbHMoKSB7XG4gICAgICAgIGludCBjb3VudCA9IE1hdGguTWF4KG51bV9zaGFycHMsIG51bV9mbGF0cyk7XG4gICAgICAgIHRyZWJsZSA9IG5ldyBBY2NpZFN5bWJvbFtjb3VudF07XG4gICAgICAgIGJhc3MgPSBuZXcgQWNjaWRTeW1ib2xbY291bnRdO1xuXG4gICAgICAgIGlmIChjb3VudCA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBXaGl0ZU5vdGVbXSB0cmVibGVub3RlcyA9IG51bGw7XG4gICAgICAgIFdoaXRlTm90ZVtdIGJhc3Nub3RlcyA9IG51bGw7XG5cbiAgICAgICAgaWYgKG51bV9zaGFycHMgPiAwKSAge1xuICAgICAgICAgICAgdHJlYmxlbm90ZXMgPSBuZXcgV2hpdGVOb3RlW10ge1xuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkYsIDUpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkMsIDUpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkcsIDUpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkQsIDUpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkEsIDYpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkUsIDUpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgYmFzc25vdGVzID0gbmV3IFdoaXRlTm90ZVtdIHtcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5GLCAzKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5DLCAzKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5HLCAzKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5ELCAzKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5BLCA0KSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5FLCAzKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChudW1fZmxhdHMgPiAwKSB7XG4gICAgICAgICAgICB0cmVibGVub3RlcyA9IG5ldyBXaGl0ZU5vdGVbXSB7XG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQiwgNSksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRSwgNSksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQSwgNSksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRCwgNSksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRywgNCksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQywgNSlcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBiYXNzbm90ZXMgPSBuZXcgV2hpdGVOb3RlW10ge1xuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkIsIDMpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkUsIDMpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkEsIDMpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkQsIDMpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkcsIDIpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkMsIDMpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgQWNjaWQgYSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIGlmIChudW1fc2hhcnBzID4gMClcbiAgICAgICAgICAgIGEgPSBBY2NpZC5TaGFycDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYSA9IEFjY2lkLkZsYXQ7XG5cbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICB0cmVibGVbaV0gPSBuZXcgQWNjaWRTeW1ib2woYSwgdHJlYmxlbm90ZXNbaV0sIENsZWYuVHJlYmxlKTtcbiAgICAgICAgICAgIGJhc3NbaV0gPSBuZXcgQWNjaWRTeW1ib2woYSwgYmFzc25vdGVzW2ldLCBDbGVmLkJhc3MpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgQWNjaWRlbnRhbCBzeW1ib2xzIGZvciBkaXNwbGF5aW5nIHRoaXMga2V5IHNpZ25hdHVyZVxuICAgICAqIGZvciB0aGUgZ2l2ZW4gY2xlZi5cbiAgICAgKi9cbiAgICBwdWJsaWMgQWNjaWRTeW1ib2xbXSBHZXRTeW1ib2xzKENsZWYgY2xlZikge1xuICAgICAgICBpZiAoY2xlZiA9PSBDbGVmLlRyZWJsZSlcbiAgICAgICAgICAgIHJldHVybiB0cmVibGU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBiYXNzO1xuICAgIH1cblxuICAgIC8qKiBHaXZlbiBhIG1pZGkgbm90ZSBudW1iZXIsIHJldHVybiB0aGUgYWNjaWRlbnRhbCAoaWYgYW55KSBcbiAgICAgKiB0aGF0IHNob3VsZCBiZSB1c2VkIHdoZW4gZGlzcGxheWluZyB0aGUgbm90ZSBpbiB0aGlzIGtleSBzaWduYXR1cmUuXG4gICAgICpcbiAgICAgKiBUaGUgY3VycmVudCBtZWFzdXJlIGlzIGFsc28gcmVxdWlyZWQuICBPbmNlIHdlIHJldHVybiBhblxuICAgICAqIGFjY2lkZW50YWwgZm9yIGEgbWVhc3VyZSwgdGhlIGFjY2lkZW50YWwgcmVtYWlucyBmb3IgdGhlXG4gICAgICogcmVzdCBvZiB0aGUgbWVhc3VyZS4gU28gd2UgbXVzdCB1cGRhdGUgdGhlIGN1cnJlbnQga2V5bWFwXG4gICAgICogd2l0aCBhbnkgbmV3IGFjY2lkZW50YWxzIHRoYXQgd2UgcmV0dXJuLiAgV2hlbiB3ZSBtb3ZlIHRvIGFub3RoZXJcbiAgICAgKiBtZWFzdXJlLCB3ZSByZXNldCB0aGUga2V5bWFwIGJhY2sgdG8gdGhlIGtleSBzaWduYXR1cmUuXG4gICAgICovXG4gICAgcHVibGljIEFjY2lkIEdldEFjY2lkZW50YWwoaW50IG5vdGVudW1iZXIsIGludCBtZWFzdXJlKSB7XG4gICAgICAgIGlmIChtZWFzdXJlICE9IHByZXZtZWFzdXJlKSB7XG4gICAgICAgICAgICBSZXNldEtleU1hcCgpO1xuICAgICAgICAgICAgcHJldm1lYXN1cmUgPSBtZWFzdXJlO1xuICAgICAgICB9XG5cbiAgICAgICAgQWNjaWQgcmVzdWx0ID0ga2V5bWFwW25vdGVudW1iZXJdO1xuICAgICAgICBpZiAocmVzdWx0ID09IEFjY2lkLlNoYXJwKSB7XG4gICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlcl0gPSBBY2NpZC5Ob25lO1xuICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXItMV0gPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHJlc3VsdCA9PSBBY2NpZC5GbGF0KSB7XG4gICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlcl0gPSBBY2NpZC5Ob25lO1xuICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXIrMV0gPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHJlc3VsdCA9PSBBY2NpZC5OYXR1cmFsKSB7XG4gICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlcl0gPSBBY2NpZC5Ob25lO1xuICAgICAgICAgICAgaW50IG5leHRrZXkgPSBOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyKzEpO1xuICAgICAgICAgICAgaW50IHByZXZrZXkgPSBOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyLTEpO1xuXG4gICAgICAgICAgICAvKiBJZiB3ZSBpbnNlcnQgYSBuYXR1cmFsLCB0aGVuIGVpdGhlcjpcbiAgICAgICAgICAgICAqIC0gdGhlIG5leHQga2V5IG11c3QgZ28gYmFjayB0byBzaGFycCxcbiAgICAgICAgICAgICAqIC0gdGhlIHByZXZpb3VzIGtleSBtdXN0IGdvIGJhY2sgdG8gZmxhdC5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYgKGtleW1hcFtub3RlbnVtYmVyLTFdID09IEFjY2lkLk5vbmUgJiYga2V5bWFwW25vdGVudW1iZXIrMV0gPT0gQWNjaWQuTm9uZSAmJlxuICAgICAgICAgICAgICAgIE5vdGVTY2FsZS5Jc0JsYWNrS2V5KG5leHRrZXkpICYmIE5vdGVTY2FsZS5Jc0JsYWNrS2V5KHByZXZrZXkpICkge1xuXG4gICAgICAgICAgICAgICAgaWYgKG51bV9mbGF0cyA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGtleW1hcFtub3RlbnVtYmVyKzFdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlci0xXSA9IEFjY2lkLkZsYXQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5bWFwW25vdGVudW1iZXItMV0gPT0gQWNjaWQuTm9uZSAmJiBOb3RlU2NhbGUuSXNCbGFja0tleShwcmV2a2V5KSkge1xuICAgICAgICAgICAgICAgIGtleW1hcFtub3RlbnVtYmVyLTFdID0gQWNjaWQuRmxhdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGtleW1hcFtub3RlbnVtYmVyKzFdID09IEFjY2lkLk5vbmUgJiYgTm90ZVNjYWxlLklzQmxhY2tLZXkobmV4dGtleSkpIHtcbiAgICAgICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlcisxXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLyogU2hvdWxkbid0IGdldCBoZXJlICovXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cblxuICAgIC8qKiBHaXZlbiBhIG1pZGkgbm90ZSBudW1iZXIsIHJldHVybiB0aGUgd2hpdGUgbm90ZSAodGhlXG4gICAgICogbm9uLXNoYXJwL25vbi1mbGF0IG5vdGUpIHRoYXQgc2hvdWxkIGJlIHVzZWQgd2hlbiBkaXNwbGF5aW5nXG4gICAgICogdGhpcyBub3RlIGluIHRoaXMga2V5IHNpZ25hdHVyZS4gIFRoaXMgc2hvdWxkIGJlIGNhbGxlZFxuICAgICAqIGJlZm9yZSBjYWxsaW5nIEdldEFjY2lkZW50YWwoKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgV2hpdGVOb3RlIEdldFdoaXRlTm90ZShpbnQgbm90ZW51bWJlcikge1xuICAgICAgICBpbnQgbm90ZXNjYWxlID0gTm90ZVNjYWxlLkZyb21OdW1iZXIobm90ZW51bWJlcik7XG4gICAgICAgIGludCBvY3RhdmUgPSAobm90ZW51bWJlciArIDMpIC8gMTIgLSAxO1xuICAgICAgICBpbnQgbGV0dGVyID0gMDtcblxuICAgICAgICBpbnRbXSB3aG9sZV9zaGFycHMgPSB7IFxuICAgICAgICAgICAgV2hpdGVOb3RlLkEsIFdoaXRlTm90ZS5BLCBcbiAgICAgICAgICAgIFdoaXRlTm90ZS5CLCBcbiAgICAgICAgICAgIFdoaXRlTm90ZS5DLCBXaGl0ZU5vdGUuQyxcbiAgICAgICAgICAgIFdoaXRlTm90ZS5ELCBXaGl0ZU5vdGUuRCxcbiAgICAgICAgICAgIFdoaXRlTm90ZS5FLFxuICAgICAgICAgICAgV2hpdGVOb3RlLkYsIFdoaXRlTm90ZS5GLFxuICAgICAgICAgICAgV2hpdGVOb3RlLkcsIFdoaXRlTm90ZS5HXG4gICAgICAgIH07XG5cbiAgICAgICAgaW50W10gd2hvbGVfZmxhdHMgPSB7XG4gICAgICAgICAgICBXaGl0ZU5vdGUuQSwgXG4gICAgICAgICAgICBXaGl0ZU5vdGUuQiwgV2hpdGVOb3RlLkIsXG4gICAgICAgICAgICBXaGl0ZU5vdGUuQyxcbiAgICAgICAgICAgIFdoaXRlTm90ZS5ELCBXaGl0ZU5vdGUuRCxcbiAgICAgICAgICAgIFdoaXRlTm90ZS5FLCBXaGl0ZU5vdGUuRSxcbiAgICAgICAgICAgIFdoaXRlTm90ZS5GLFxuICAgICAgICAgICAgV2hpdGVOb3RlLkcsIFdoaXRlTm90ZS5HLFxuICAgICAgICAgICAgV2hpdGVOb3RlLkFcbiAgICAgICAgfTtcblxuICAgICAgICBBY2NpZCBhY2NpZCA9IGtleW1hcFtub3RlbnVtYmVyXTtcbiAgICAgICAgaWYgKGFjY2lkID09IEFjY2lkLkZsYXQpIHtcbiAgICAgICAgICAgIGxldHRlciA9IHdob2xlX2ZsYXRzW25vdGVzY2FsZV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYWNjaWQgPT0gQWNjaWQuU2hhcnApIHtcbiAgICAgICAgICAgIGxldHRlciA9IHdob2xlX3NoYXJwc1tub3Rlc2NhbGVdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFjY2lkID09IEFjY2lkLk5hdHVyYWwpIHtcbiAgICAgICAgICAgIGxldHRlciA9IHdob2xlX3NoYXJwc1tub3Rlc2NhbGVdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFjY2lkID09IEFjY2lkLk5vbmUpIHtcbiAgICAgICAgICAgIGxldHRlciA9IHdob2xlX3NoYXJwc1tub3Rlc2NhbGVdO1xuXG4gICAgICAgICAgICAvKiBJZiB0aGUgbm90ZSBudW1iZXIgaXMgYSBzaGFycC9mbGF0LCBhbmQgdGhlcmUncyBubyBhY2NpZGVudGFsLFxuICAgICAgICAgICAgICogZGV0ZXJtaW5lIHRoZSB3aGl0ZSBub3RlIGJ5IHNlZWluZyB3aGV0aGVyIHRoZSBwcmV2aW91cyBvciBuZXh0IG5vdGVcbiAgICAgICAgICAgICAqIGlzIGEgbmF0dXJhbC5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYgKE5vdGVTY2FsZS5Jc0JsYWNrS2V5KG5vdGVzY2FsZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5bWFwW25vdGVudW1iZXItMV0gPT0gQWNjaWQuTmF0dXJhbCAmJiBcbiAgICAgICAgICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXIrMV0gPT0gQWNjaWQuTmF0dXJhbCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChudW1fZmxhdHMgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXR0ZXIgPSB3aG9sZV9mbGF0c1tub3Rlc2NhbGVdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0dGVyID0gd2hvbGVfc2hhcnBzW25vdGVzY2FsZV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoa2V5bWFwW25vdGVudW1iZXItMV0gPT0gQWNjaWQuTmF0dXJhbCkge1xuICAgICAgICAgICAgICAgICAgICBsZXR0ZXIgPSB3aG9sZV9zaGFycHNbbm90ZXNjYWxlXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoa2V5bWFwW25vdGVudW1iZXIrMV0gPT0gQWNjaWQuTmF0dXJhbCkge1xuICAgICAgICAgICAgICAgICAgICBsZXR0ZXIgPSB3aG9sZV9mbGF0c1tub3Rlc2NhbGVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFRoZSBhYm92ZSBhbGdvcml0aG0gZG9lc24ndCBxdWl0ZSB3b3JrIGZvciBHLWZsYXQgbWFqb3IuXG4gICAgICAgICAqIEhhbmRsZSBpdCBoZXJlLlxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKG51bV9mbGF0cyA9PSBHZmxhdCAmJiBub3Rlc2NhbGUgPT0gTm90ZVNjYWxlLkIpIHtcbiAgICAgICAgICAgIGxldHRlciA9IFdoaXRlTm90ZS5DO1xuICAgICAgICB9XG4gICAgICAgIGlmIChudW1fZmxhdHMgPT0gR2ZsYXQgJiYgbm90ZXNjYWxlID09IE5vdGVTY2FsZS5CZmxhdCkge1xuICAgICAgICAgICAgbGV0dGVyID0gV2hpdGVOb3RlLkI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobnVtX2ZsYXRzID4gMCAmJiBub3Rlc2NhbGUgPT0gTm90ZVNjYWxlLkFmbGF0KSB7XG4gICAgICAgICAgICBvY3RhdmUrKztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgV2hpdGVOb3RlKGxldHRlciwgb2N0YXZlKTtcbiAgICB9XG5cblxuICAgIC8qKiBHdWVzcyB0aGUga2V5IHNpZ25hdHVyZSwgZ2l2ZW4gdGhlIG1pZGkgbm90ZSBudW1iZXJzIHVzZWQgaW5cbiAgICAgKiB0aGUgc29uZy5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIEtleVNpZ25hdHVyZSBHdWVzcyhMaXN0PGludD4gbm90ZXMpIHtcbiAgICAgICAgQ3JlYXRlQWNjaWRlbnRhbE1hcHMoKTtcblxuICAgICAgICAvKiBHZXQgdGhlIGZyZXF1ZW5jeSBjb3VudCBvZiBlYWNoIG5vdGUgaW4gdGhlIDEyLW5vdGUgc2NhbGUgKi9cbiAgICAgICAgaW50W10gbm90ZWNvdW50ID0gbmV3IGludFsxMl07XG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgbm90ZXMuQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgaW50IG5vdGVudW1iZXIgPSBub3Rlc1tpXTtcbiAgICAgICAgICAgIGludCBub3Rlc2NhbGUgPSAobm90ZW51bWJlciArIDMpICUgMTI7XG4gICAgICAgICAgICBub3RlY291bnRbbm90ZXNjYWxlXSArPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogRm9yIGVhY2gga2V5IHNpZ25hdHVyZSwgY291bnQgdGhlIHRvdGFsIG51bWJlciBvZiBhY2NpZGVudGFsc1xuICAgICAgICAgKiBuZWVkZWQgdG8gZGlzcGxheSBhbGwgdGhlIG5vdGVzLiAgQ2hvb3NlIHRoZSBrZXkgc2lnbmF0dXJlXG4gICAgICAgICAqIHdpdGggdGhlIGZld2VzdCBhY2NpZGVudGFscy5cbiAgICAgICAgICovXG4gICAgICAgIGludCBiZXN0a2V5ID0gMDtcbiAgICAgICAgYm9vbCBpc19iZXN0X3NoYXJwID0gdHJ1ZTtcbiAgICAgICAgaW50IHNtYWxsZXN0X2FjY2lkX2NvdW50ID0gbm90ZXMuQ291bnQ7XG4gICAgICAgIGludCBrZXk7XG5cbiAgICAgICAgZm9yIChrZXkgPSAwOyBrZXkgPCA2OyBrZXkrKykge1xuICAgICAgICAgICAgaW50IGFjY2lkX2NvdW50ID0gMDtcbiAgICAgICAgICAgIGZvciAoaW50IG4gPSAwOyBuIDwgMTI7IG4rKykge1xuICAgICAgICAgICAgICAgIGlmIChzaGFycGtleXNba2V5XVtuXSAhPSBBY2NpZC5Ob25lKSB7XG4gICAgICAgICAgICAgICAgICAgIGFjY2lkX2NvdW50ICs9IG5vdGVjb3VudFtuXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYWNjaWRfY291bnQgPCBzbWFsbGVzdF9hY2NpZF9jb3VudCkge1xuICAgICAgICAgICAgICAgIHNtYWxsZXN0X2FjY2lkX2NvdW50ID0gYWNjaWRfY291bnQ7XG4gICAgICAgICAgICAgICAgYmVzdGtleSA9IGtleTtcbiAgICAgICAgICAgICAgICBpc19iZXN0X3NoYXJwID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoa2V5ID0gMDsga2V5IDwgNzsga2V5KyspIHtcbiAgICAgICAgICAgIGludCBhY2NpZF9jb3VudCA9IDA7XG4gICAgICAgICAgICBmb3IgKGludCBuID0gMDsgbiA8IDEyOyBuKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoZmxhdGtleXNba2V5XVtuXSAhPSBBY2NpZC5Ob25lKSB7XG4gICAgICAgICAgICAgICAgICAgIGFjY2lkX2NvdW50ICs9IG5vdGVjb3VudFtuXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYWNjaWRfY291bnQgPCBzbWFsbGVzdF9hY2NpZF9jb3VudCkge1xuICAgICAgICAgICAgICAgIHNtYWxsZXN0X2FjY2lkX2NvdW50ID0gYWNjaWRfY291bnQ7XG4gICAgICAgICAgICAgICAgYmVzdGtleSA9IGtleTtcbiAgICAgICAgICAgICAgICBpc19iZXN0X3NoYXJwID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzX2Jlc3Rfc2hhcnApIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgS2V5U2lnbmF0dXJlKGJlc3RrZXksIDApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBLZXlTaWduYXR1cmUoMCwgYmVzdGtleSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRydWUgaWYgdGhpcyBrZXkgc2lnbmF0dXJlIGlzIGVxdWFsIHRvIGtleSBzaWduYXR1cmUgayAqL1xuICAgIHB1YmxpYyBib29sIEVxdWFscyhLZXlTaWduYXR1cmUgaykge1xuICAgICAgICBpZiAoay5udW1fc2hhcnBzID09IG51bV9zaGFycHMgJiYgay5udW1fZmxhdHMgPT0gbnVtX2ZsYXRzKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiBSZXR1cm4gdGhlIE1ham9yIEtleSBvZiB0aGlzIEtleSBTaWduYXR1cmUgKi9cbiAgICBwdWJsaWMgaW50IE5vdGVzY2FsZSgpIHtcbiAgICAgICAgaW50W10gZmxhdG1ham9yID0ge1xuICAgICAgICAgICAgTm90ZVNjYWxlLkMsIE5vdGVTY2FsZS5GLCBOb3RlU2NhbGUuQmZsYXQsIE5vdGVTY2FsZS5FZmxhdCxcbiAgICAgICAgICAgIE5vdGVTY2FsZS5BZmxhdCwgTm90ZVNjYWxlLkRmbGF0LCBOb3RlU2NhbGUuR2ZsYXQsIE5vdGVTY2FsZS5CIFxuICAgICAgICB9O1xuXG4gICAgICAgIGludFtdIHNoYXJwbWFqb3IgPSB7XG4gICAgICAgICAgICBOb3RlU2NhbGUuQywgTm90ZVNjYWxlLkcsIE5vdGVTY2FsZS5ELCBOb3RlU2NhbGUuQSwgTm90ZVNjYWxlLkUsXG4gICAgICAgICAgICBOb3RlU2NhbGUuQiwgTm90ZVNjYWxlLkZzaGFycCwgTm90ZVNjYWxlLkNzaGFycCwgTm90ZVNjYWxlLkdzaGFycCxcbiAgICAgICAgICAgIE5vdGVTY2FsZS5Ec2hhcnBcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKG51bV9mbGF0cyA+IDApXG4gICAgICAgICAgICByZXR1cm4gZmxhdG1ham9yW251bV9mbGF0c107XG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICByZXR1cm4gc2hhcnBtYWpvcltudW1fc2hhcnBzXTtcbiAgICB9XG5cbiAgICAvKiBDb252ZXJ0IGEgTWFqb3IgS2V5IGludG8gYSBzdHJpbmcgKi9cbiAgICBwdWJsaWMgc3RhdGljIHN0cmluZyBLZXlUb1N0cmluZyhpbnQgbm90ZXNjYWxlKSB7XG4gICAgICAgIHN3aXRjaCAobm90ZXNjYWxlKSB7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5BOiAgICAgcmV0dXJuIFwiQSBtYWpvciwgRiMgbWlub3JcIiA7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5CZmxhdDogcmV0dXJuIFwiQi1mbGF0IG1ham9yLCBHIG1pbm9yXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5COiAgICAgcmV0dXJuIFwiQiBtYWpvciwgQS1mbGF0IG1pbm9yXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5DOiAgICAgcmV0dXJuIFwiQyBtYWpvciwgQSBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRGZsYXQ6IHJldHVybiBcIkQtZmxhdCBtYWpvciwgQi1mbGF0IG1pbm9yXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5EOiAgICAgcmV0dXJuIFwiRCBtYWpvciwgQiBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRWZsYXQ6IHJldHVybiBcIkUtZmxhdCBtYWpvciwgQyBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRTogICAgIHJldHVybiBcIkUgbWFqb3IsIEMjIG1pbm9yXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5GOiAgICAgcmV0dXJuIFwiRiBtYWpvciwgRCBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuR2ZsYXQ6IHJldHVybiBcIkctZmxhdCBtYWpvciwgRS1mbGF0IG1pbm9yXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5HOiAgICAgcmV0dXJuIFwiRyBtYWpvciwgRSBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQWZsYXQ6IHJldHVybiBcIkEtZmxhdCBtYWpvciwgRiBtaW5vclwiO1xuICAgICAgICAgICAgZGVmYXVsdDogICAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMga2V5IHNpZ25hdHVyZS5cbiAgICAgKiBXZSBvbmx5IHJldHVybiB0aGUgbWFqb3Iga2V5IHNpZ25hdHVyZSwgbm90IHRoZSBtaW5vciBvbmUuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIEtleVRvU3RyaW5nKCBOb3Rlc2NhbGUoKSApO1xuICAgIH1cblxuXG59XG5cbn1cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMiBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogQGNsYXNzIEx5cmljU3ltYm9sXG4gKiAgQSBseXJpYyBjb250YWlucyB0aGUgbHlyaWMgdG8gZGlzcGxheSwgdGhlIHN0YXJ0IHRpbWUgdGhlIGx5cmljIG9jY3VycyBhdCxcbiAqICB0aGUgdGhlIHgtY29vcmRpbmF0ZSB3aGVyZSBpdCB3aWxsIGJlIGRpc3BsYXllZC5cbiAqL1xucHVibGljIGNsYXNzIEx5cmljU3ltYm9sIHtcbiAgICBwcml2YXRlIGludCBzdGFydHRpbWU7ICAgLyoqIFRoZSBzdGFydCB0aW1lLCBpbiBwdWxzZXMgKi9cbiAgICBwcml2YXRlIHN0cmluZyB0ZXh0OyAgICAgLyoqIFRoZSBseXJpYyB0ZXh0ICovXG4gICAgcHJpdmF0ZSBpbnQgeDsgICAgICAgICAgIC8qKiBUaGUgeCAoaG9yaXpvbnRhbCkgcG9zaXRpb24gd2l0aGluIHRoZSBzdGFmZiAqL1xuXG4gICAgcHVibGljIEx5cmljU3ltYm9sKGludCBzdGFydHRpbWUsIHN0cmluZyB0ZXh0KSB7XG4gICAgICAgIHRoaXMuc3RhcnR0aW1lID0gc3RhcnR0aW1lOyBcbiAgICAgICAgdGhpcy50ZXh0ID0gdGV4dDtcbiAgICB9XG4gICAgIFxuICAgIHB1YmxpYyBpbnQgU3RhcnRUaW1lIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHN0YXJ0dGltZTsgfVxuICAgICAgICBzZXQgeyBzdGFydHRpbWUgPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzdHJpbmcgVGV4dCB7XG4gICAgICAgIGdldCB7IHJldHVybiB0ZXh0OyB9XG4gICAgICAgIHNldCB7IHRleHQgPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIHB1YmxpYyBpbnQgWCB7XG4gICAgICAgIGdldCB7IHJldHVybiB4OyB9XG4gICAgICAgIHNldCB7IHggPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIHB1YmxpYyBpbnQgTWluV2lkdGgge1xuICAgICAgICBnZXQgeyByZXR1cm4gbWluV2lkdGgoKTsgfVxuICAgIH1cblxuICAgIC8qIFJldHVybiB0aGUgbWluaW11bSB3aWR0aCBpbiBwaXhlbHMgbmVlZGVkIHRvIGRpc3BsYXkgdGhpcyBseXJpYy5cbiAgICAgKiBUaGlzIGlzIGFuIGVzdGltYXRpb24sIG5vdCBleGFjdC5cbiAgICAgKi9cbiAgICBwcml2YXRlIGludCBtaW5XaWR0aCgpIHsgXG4gICAgICAgIGZsb2F0IHdpZHRoUGVyQ2hhciA9IFNoZWV0TXVzaWMuTGV0dGVyRm9udC5HZXRIZWlnaHQoKSAqIDIuMGYvMy4wZjtcbiAgICAgICAgZmxvYXQgd2lkdGggPSB0ZXh0Lkxlbmd0aCAqIHdpZHRoUGVyQ2hhcjtcbiAgICAgICAgaWYgKHRleHQuSW5kZXhPZihcImlcIikgPj0gMCkge1xuICAgICAgICAgICAgd2lkdGggLT0gd2lkdGhQZXJDaGFyLzIuMGY7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRleHQuSW5kZXhPZihcImpcIikgPj0gMCkge1xuICAgICAgICAgICAgd2lkdGggLT0gd2lkdGhQZXJDaGFyLzIuMGY7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRleHQuSW5kZXhPZihcImxcIikgPj0gMCkge1xuICAgICAgICAgICAgd2lkdGggLT0gd2lkdGhQZXJDaGFyLzIuMGY7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChpbnQpd2lkdGg7XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIFxuICAgIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJMeXJpYyBzdGFydD17MH0geD17MX0gdGV4dD17Mn1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnR0aW1lLCB4LCB0ZXh0KTtcbiAgICB9XG5cbn1cblxuXG59XG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTIgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIEBjbGFzcyBNaWRpRXZlbnRcbiAqIEEgTWlkaUV2ZW50IHJlcHJlc2VudHMgYSBzaW5nbGUgZXZlbnQgKHN1Y2ggYXMgRXZlbnROb3RlT24pIGluIHRoZVxuICogTWlkaSBmaWxlLiBJdCBpbmNsdWRlcyB0aGUgZGVsdGEgdGltZSBvZiB0aGUgZXZlbnQuXG4gKi9cbnB1YmxpYyBjbGFzcyBNaWRpRXZlbnQgOiBJQ29tcGFyZXI8TWlkaUV2ZW50PiB7XG5cbiAgICBwdWJsaWMgaW50ICAgIERlbHRhVGltZTsgICAgIC8qKiBUaGUgdGltZSBiZXR3ZWVuIHRoZSBwcmV2aW91cyBldmVudCBhbmQgdGhpcyBvbiAqL1xuICAgIHB1YmxpYyBpbnQgICAgU3RhcnRUaW1lOyAgICAgLyoqIFRoZSBhYnNvbHV0ZSB0aW1lIHRoaXMgZXZlbnQgb2NjdXJzICovXG4gICAgcHVibGljIGJvb2wgICBIYXNFdmVudGZsYWc7ICAvKiogRmFsc2UgaWYgdGhpcyBpcyB1c2luZyB0aGUgcHJldmlvdXMgZXZlbnRmbGFnICovXG4gICAgcHVibGljIGJ5dGUgICBFdmVudEZsYWc7ICAgICAvKiogTm90ZU9uLCBOb3RlT2ZmLCBldGMuICBGdWxsIGxpc3QgaXMgaW4gY2xhc3MgTWlkaUZpbGUgKi9cbiAgICBwdWJsaWMgYnl0ZSAgIENoYW5uZWw7ICAgICAgIC8qKiBUaGUgY2hhbm5lbCB0aGlzIGV2ZW50IG9jY3VycyBvbiAqLyBcblxuICAgIHB1YmxpYyBieXRlICAgTm90ZW51bWJlcjsgICAgLyoqIFRoZSBub3RlIG51bWJlciAgKi9cbiAgICBwdWJsaWMgYnl0ZSAgIFZlbG9jaXR5OyAgICAgIC8qKiBUaGUgdm9sdW1lIG9mIHRoZSBub3RlICovXG4gICAgcHVibGljIGJ5dGUgICBJbnN0cnVtZW50OyAgICAvKiogVGhlIGluc3RydW1lbnQgKi9cbiAgICBwdWJsaWMgYnl0ZSAgIEtleVByZXNzdXJlOyAgIC8qKiBUaGUga2V5IHByZXNzdXJlICovXG4gICAgcHVibGljIGJ5dGUgICBDaGFuUHJlc3N1cmU7ICAvKiogVGhlIGNoYW5uZWwgcHJlc3N1cmUgKi9cbiAgICBwdWJsaWMgYnl0ZSAgIENvbnRyb2xOdW07ICAgIC8qKiBUaGUgY29udHJvbGxlciBudW1iZXIgKi9cbiAgICBwdWJsaWMgYnl0ZSAgIENvbnRyb2xWYWx1ZTsgIC8qKiBUaGUgY29udHJvbGxlciB2YWx1ZSAqL1xuICAgIHB1YmxpYyB1c2hvcnQgUGl0Y2hCZW5kOyAgICAgLyoqIFRoZSBwaXRjaCBiZW5kIHZhbHVlICovXG4gICAgcHVibGljIGJ5dGUgICBOdW1lcmF0b3I7ICAgICAvKiogVGhlIG51bWVyYXRvciwgZm9yIFRpbWVTaWduYXR1cmUgbWV0YSBldmVudHMgKi9cbiAgICBwdWJsaWMgYnl0ZSAgIERlbm9taW5hdG9yOyAgIC8qKiBUaGUgZGVub21pbmF0b3IsIGZvciBUaW1lU2lnbmF0dXJlIG1ldGEgZXZlbnRzICovXG4gICAgcHVibGljIGludCAgICBUZW1wbzsgICAgICAgICAvKiogVGhlIHRlbXBvLCBmb3IgVGVtcG8gbWV0YSBldmVudHMgKi9cbiAgICBwdWJsaWMgYnl0ZSAgIE1ldGFldmVudDsgICAgIC8qKiBUaGUgbWV0YWV2ZW50LCB1c2VkIGlmIGV2ZW50ZmxhZyBpcyBNZXRhRXZlbnQgKi9cbiAgICBwdWJsaWMgaW50ICAgIE1ldGFsZW5ndGg7ICAgIC8qKiBUaGUgbWV0YWV2ZW50IGxlbmd0aCAgKi9cbiAgICBwdWJsaWMgYnl0ZVtdIFZhbHVlOyAgICAgICAgIC8qKiBUaGUgcmF3IGJ5dGUgdmFsdWUsIGZvciBTeXNleCBhbmQgbWV0YSBldmVudHMgKi9cblxuICAgIHB1YmxpYyBNaWRpRXZlbnQoKSB7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiBhIGNvcHkgb2YgdGhpcyBldmVudCAqL1xuICAgIHB1YmxpYyBNaWRpRXZlbnQgQ2xvbmUoKSB7XG4gICAgICAgIE1pZGlFdmVudCBtZXZlbnQ9IG5ldyBNaWRpRXZlbnQoKTtcbiAgICAgICAgbWV2ZW50LkRlbHRhVGltZSA9IERlbHRhVGltZTtcbiAgICAgICAgbWV2ZW50LlN0YXJ0VGltZSA9IFN0YXJ0VGltZTtcbiAgICAgICAgbWV2ZW50Lkhhc0V2ZW50ZmxhZyA9IEhhc0V2ZW50ZmxhZztcbiAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IEV2ZW50RmxhZztcbiAgICAgICAgbWV2ZW50LkNoYW5uZWwgPSBDaGFubmVsO1xuICAgICAgICBtZXZlbnQuTm90ZW51bWJlciA9IE5vdGVudW1iZXI7XG4gICAgICAgIG1ldmVudC5WZWxvY2l0eSA9IFZlbG9jaXR5O1xuICAgICAgICBtZXZlbnQuSW5zdHJ1bWVudCA9IEluc3RydW1lbnQ7XG4gICAgICAgIG1ldmVudC5LZXlQcmVzc3VyZSA9IEtleVByZXNzdXJlO1xuICAgICAgICBtZXZlbnQuQ2hhblByZXNzdXJlID0gQ2hhblByZXNzdXJlO1xuICAgICAgICBtZXZlbnQuQ29udHJvbE51bSA9IENvbnRyb2xOdW07XG4gICAgICAgIG1ldmVudC5Db250cm9sVmFsdWUgPSBDb250cm9sVmFsdWU7XG4gICAgICAgIG1ldmVudC5QaXRjaEJlbmQgPSBQaXRjaEJlbmQ7XG4gICAgICAgIG1ldmVudC5OdW1lcmF0b3IgPSBOdW1lcmF0b3I7XG4gICAgICAgIG1ldmVudC5EZW5vbWluYXRvciA9IERlbm9taW5hdG9yO1xuICAgICAgICBtZXZlbnQuVGVtcG8gPSBUZW1wbztcbiAgICAgICAgbWV2ZW50Lk1ldGFldmVudCA9IE1ldGFldmVudDtcbiAgICAgICAgbWV2ZW50Lk1ldGFsZW5ndGggPSBNZXRhbGVuZ3RoO1xuICAgICAgICBtZXZlbnQuVmFsdWUgPSBWYWx1ZTtcbiAgICAgICAgcmV0dXJuIG1ldmVudDtcbiAgICB9XG5cbiAgICAvKiogQ29tcGFyZSB0d28gTWlkaUV2ZW50cyBiYXNlZCBvbiB0aGVpciBzdGFydCB0aW1lcy4gKi9cbiAgICBwdWJsaWMgaW50IENvbXBhcmUoTWlkaUV2ZW50IHgsIE1pZGlFdmVudCB5KSB7XG4gICAgICAgIGlmICh4LlN0YXJ0VGltZSA9PSB5LlN0YXJ0VGltZSkge1xuICAgICAgICAgICAgaWYgKHguRXZlbnRGbGFnID09IHkuRXZlbnRGbGFnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHguTm90ZW51bWJlciAtIHkuTm90ZW51bWJlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB4LkV2ZW50RmxhZyAtIHkuRXZlbnRGbGFnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHguU3RhcnRUaW1lIC0geS5TdGFydFRpbWU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbn0gIC8qIEVuZCBuYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMgKi9cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDEyIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbi8qIFRoaXMgZmlsZSBjb250YWlucyB0aGUgY2xhc3NlcyBmb3IgcGFyc2luZyBhbmQgbW9kaWZ5aW5nXG4gKiBNSURJIG11c2ljIGZpbGVzLlxuICovXG5cbi8qIE1JREkgZmlsZSBmb3JtYXQuXG4gKlxuICogVGhlIE1pZGkgRmlsZSBmb3JtYXQgaXMgZGVzY3JpYmVkIGJlbG93LiAgVGhlIGRlc2NyaXB0aW9uIHVzZXNcbiAqIHRoZSBmb2xsb3dpbmcgYWJicmV2aWF0aW9ucy5cbiAqXG4gKiB1MSAgICAgLSBPbmUgYnl0ZVxuICogdTIgICAgIC0gVHdvIGJ5dGVzIChiaWcgZW5kaWFuKVxuICogdTQgICAgIC0gRm91ciBieXRlcyAoYmlnIGVuZGlhbilcbiAqIHZhcmxlbiAtIEEgdmFyaWFibGUgbGVuZ3RoIGludGVnZXIsIHRoYXQgY2FuIGJlIDEgdG8gNCBieXRlcy4gVGhlIFxuICogICAgICAgICAgaW50ZWdlciBlbmRzIHdoZW4geW91IGVuY291bnRlciBhIGJ5dGUgdGhhdCBkb2Vzbid0IGhhdmUgXG4gKiAgICAgICAgICB0aGUgOHRoIGJpdCBzZXQgKGEgYnl0ZSBsZXNzIHRoYW4gMHg4MCkuXG4gKiBsZW4/ICAgLSBUaGUgbGVuZ3RoIG9mIHRoZSBkYXRhIGRlcGVuZHMgb24gc29tZSBjb2RlXG4gKiAgICAgICAgICBcbiAqXG4gKiBUaGUgTWlkaSBmaWxlcyBiZWdpbnMgd2l0aCB0aGUgbWFpbiBNaWRpIGhlYWRlclxuICogdTQgPSBUaGUgZm91ciBhc2NpaSBjaGFyYWN0ZXJzICdNVGhkJ1xuICogdTQgPSBUaGUgbGVuZ3RoIG9mIHRoZSBNVGhkIGhlYWRlciA9IDYgYnl0ZXNcbiAqIHUyID0gMCBpZiB0aGUgZmlsZSBjb250YWlucyBhIHNpbmdsZSB0cmFja1xuICogICAgICAxIGlmIHRoZSBmaWxlIGNvbnRhaW5zIG9uZSBvciBtb3JlIHNpbXVsdGFuZW91cyB0cmFja3NcbiAqICAgICAgMiBpZiB0aGUgZmlsZSBjb250YWlucyBvbmUgb3IgbW9yZSBpbmRlcGVuZGVudCB0cmFja3NcbiAqIHUyID0gbnVtYmVyIG9mIHRyYWNrc1xuICogdTIgPSBpZiA+ICAwLCB0aGUgbnVtYmVyIG9mIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlXG4gKiAgICAgIGlmIDw9IDAsIHRoZW4gPz8/XG4gKlxuICogTmV4dCBjb21lIHRoZSBpbmRpdmlkdWFsIE1pZGkgdHJhY2tzLiAgVGhlIHRvdGFsIG51bWJlciBvZiBNaWRpXG4gKiB0cmFja3Mgd2FzIGdpdmVuIGFib3ZlLCBpbiB0aGUgTVRoZCBoZWFkZXIuICBFYWNoIHRyYWNrIHN0YXJ0c1xuICogd2l0aCBhIGhlYWRlcjpcbiAqXG4gKiB1NCA9IFRoZSBmb3VyIGFzY2lpIGNoYXJhY3RlcnMgJ01UcmsnXG4gKiB1NCA9IEFtb3VudCBvZiB0cmFjayBkYXRhLCBpbiBieXRlcy5cbiAqIFxuICogVGhlIHRyYWNrIGRhdGEgY29uc2lzdHMgb2YgYSBzZXJpZXMgb2YgTWlkaSBldmVudHMuICBFYWNoIE1pZGkgZXZlbnRcbiAqIGhhcyB0aGUgZm9sbG93aW5nIGZvcm1hdDpcbiAqXG4gKiB2YXJsZW4gIC0gVGhlIHRpbWUgYmV0d2VlbiB0aGUgcHJldmlvdXMgZXZlbnQgYW5kIHRoaXMgZXZlbnQsIG1lYXN1cmVkXG4gKiAgICAgICAgICAgaW4gXCJwdWxzZXNcIi4gIFRoZSBudW1iZXIgb2YgcHVsc2VzIHBlciBxdWFydGVyIG5vdGUgaXMgZ2l2ZW5cbiAqICAgICAgICAgICBpbiB0aGUgTVRoZCBoZWFkZXIuXG4gKiB1MSAgICAgIC0gVGhlIEV2ZW50IGNvZGUsIGFsd2F5cyBiZXR3ZWUgMHg4MCBhbmQgMHhGRlxuICogbGVuPyAgICAtIFRoZSBldmVudCBkYXRhLiAgVGhlIGxlbmd0aCBvZiB0aGlzIGRhdGEgaXMgZGV0ZXJtaW5lZCBieSB0aGVcbiAqICAgICAgICAgICBldmVudCBjb2RlLiAgVGhlIGZpcnN0IGJ5dGUgb2YgdGhlIGV2ZW50IGRhdGEgaXMgYWx3YXlzIDwgMHg4MC5cbiAqXG4gKiBUaGUgZXZlbnQgY29kZSBpcyBvcHRpb25hbC4gIElmIHRoZSBldmVudCBjb2RlIGlzIG1pc3NpbmcsIHRoZW4gaXRcbiAqIGRlZmF1bHRzIHRvIHRoZSBwcmV2aW91cyBldmVudCBjb2RlLiAgRm9yIGV4YW1wbGU6XG4gKlxuICogICB2YXJsZW4sIGV2ZW50Y29kZTEsIGV2ZW50ZGF0YSxcbiAqICAgdmFybGVuLCBldmVudGNvZGUyLCBldmVudGRhdGEsXG4gKiAgIHZhcmxlbiwgZXZlbnRkYXRhLCAgLy8gZXZlbnRjb2RlIGlzIGV2ZW50Y29kZTJcbiAqICAgdmFybGVuLCBldmVudGRhdGEsICAvLyBldmVudGNvZGUgaXMgZXZlbnRjb2RlMlxuICogICB2YXJsZW4sIGV2ZW50Y29kZTMsIGV2ZW50ZGF0YSxcbiAqICAgLi4uLlxuICpcbiAqICAgSG93IGRvIHlvdSBrbm93IGlmIHRoZSBldmVudGNvZGUgaXMgdGhlcmUgb3IgbWlzc2luZz8gV2VsbDpcbiAqICAgLSBBbGwgZXZlbnQgY29kZXMgYXJlIGJldHdlZW4gMHg4MCBhbmQgMHhGRlxuICogICAtIFRoZSBmaXJzdCBieXRlIG9mIGV2ZW50ZGF0YSBpcyBhbHdheXMgbGVzcyB0aGFuIDB4ODAuXG4gKiAgIFNvLCBhZnRlciB0aGUgdmFybGVuIGRlbHRhIHRpbWUsIGlmIHRoZSBuZXh0IGJ5dGUgaXMgYmV0d2VlbiAweDgwXG4gKiAgIGFuZCAweEZGLCBpdHMgYW4gZXZlbnQgY29kZS4gIE90aGVyd2lzZSwgaXRzIGV2ZW50IGRhdGEuXG4gKlxuICogVGhlIEV2ZW50IGNvZGVzIGFuZCBldmVudCBkYXRhIGZvciBlYWNoIGV2ZW50IGNvZGUgYXJlIHNob3duIGJlbG93LlxuICpcbiAqIENvZGU6ICB1MSAtIDB4ODAgdGhydSAweDhGIC0gTm90ZSBPZmYgZXZlbnQuXG4gKiAgICAgICAgICAgICAweDgwIGlzIGZvciBjaGFubmVsIDEsIDB4OEYgaXMgZm9yIGNoYW5uZWwgMTYuXG4gKiBEYXRhOiAgdTEgLSBUaGUgbm90ZSBudW1iZXIsIDAtMTI3LiAgTWlkZGxlIEMgaXMgNjAgKDB4M0MpXG4gKiAgICAgICAgdTEgLSBUaGUgbm90ZSB2ZWxvY2l0eS4gIFRoaXMgc2hvdWxkIGJlIDBcbiAqIFxuICogQ29kZTogIHUxIC0gMHg5MCB0aHJ1IDB4OUYgLSBOb3RlIE9uIGV2ZW50LlxuICogICAgICAgICAgICAgMHg5MCBpcyBmb3IgY2hhbm5lbCAxLCAweDlGIGlzIGZvciBjaGFubmVsIDE2LlxuICogRGF0YTogIHUxIC0gVGhlIG5vdGUgbnVtYmVyLCAwLTEyNy4gIE1pZGRsZSBDIGlzIDYwICgweDNDKVxuICogICAgICAgIHUxIC0gVGhlIG5vdGUgdmVsb2NpdHksIGZyb20gMCAobm8gc291bmQpIHRvIDEyNyAobG91ZCkuXG4gKiAgICAgICAgICAgICBBIHZhbHVlIG9mIDAgaXMgZXF1aXZhbGVudCB0byBhIE5vdGUgT2ZmLlxuICpcbiAqIENvZGU6ICB1MSAtIDB4QTAgdGhydSAweEFGIC0gS2V5IFByZXNzdXJlXG4gKiBEYXRhOiAgdTEgLSBUaGUgbm90ZSBudW1iZXIsIDAtMTI3LlxuICogICAgICAgIHUxIC0gVGhlIHByZXNzdXJlLlxuICpcbiAqIENvZGU6ICB1MSAtIDB4QjAgdGhydSAweEJGIC0gQ29udHJvbCBDaGFuZ2VcbiAqIERhdGE6ICB1MSAtIFRoZSBjb250cm9sbGVyIG51bWJlclxuICogICAgICAgIHUxIC0gVGhlIHZhbHVlXG4gKlxuICogQ29kZTogIHUxIC0gMHhDMCB0aHJ1IDB4Q0YgLSBQcm9ncmFtIENoYW5nZVxuICogRGF0YTogIHUxIC0gVGhlIHByb2dyYW0gbnVtYmVyLlxuICpcbiAqIENvZGU6ICB1MSAtIDB4RDAgdGhydSAweERGIC0gQ2hhbm5lbCBQcmVzc3VyZVxuICogICAgICAgIHUxIC0gVGhlIHByZXNzdXJlLlxuICpcbiAqIENvZGU6ICB1MSAtIDB4RTAgdGhydSAweEVGIC0gUGl0Y2ggQmVuZFxuICogRGF0YTogIHUyIC0gU29tZSBkYXRhXG4gKlxuICogQ29kZTogIHUxICAgICAtIDB4RkYgLSBNZXRhIEV2ZW50XG4gKiBEYXRhOiAgdTEgICAgIC0gTWV0YWNvZGVcbiAqICAgICAgICB2YXJsZW4gLSBMZW5ndGggb2YgbWV0YSBldmVudFxuICogICAgICAgIHUxW3Zhcmxlbl0gLSBNZXRhIGV2ZW50IGRhdGEuXG4gKlxuICpcbiAqIFRoZSBNZXRhIEV2ZW50IGNvZGVzIGFyZSBsaXN0ZWQgYmVsb3c6XG4gKlxuICogTWV0YWNvZGU6IHUxICAgICAgICAgLSAweDAgIFNlcXVlbmNlIE51bWJlclxuICogICAgICAgICAgIHZhcmxlbiAgICAgLSAwIG9yIDJcbiAqICAgICAgICAgICB1MVt2YXJsZW5dIC0gU2VxdWVuY2UgbnVtYmVyXG4gKlxuICogTWV0YWNvZGU6IHUxICAgICAgICAgLSAweDEgIFRleHRcbiAqICAgICAgICAgICB2YXJsZW4gICAgIC0gTGVuZ3RoIG9mIHRleHRcbiAqICAgICAgICAgICB1MVt2YXJsZW5dIC0gVGV4dFxuICpcbiAqIE1ldGFjb2RlOiB1MSAgICAgICAgIC0gMHgyICBDb3B5cmlnaHRcbiAqICAgICAgICAgICB2YXJsZW4gICAgIC0gTGVuZ3RoIG9mIHRleHRcbiAqICAgICAgICAgICB1MVt2YXJsZW5dIC0gVGV4dFxuICpcbiAqIE1ldGFjb2RlOiB1MSAgICAgICAgIC0gMHgzICBUcmFjayBOYW1lXG4gKiAgICAgICAgICAgdmFybGVuICAgICAtIExlbmd0aCBvZiBuYW1lXG4gKiAgICAgICAgICAgdTFbdmFybGVuXSAtIFRyYWNrIE5hbWVcbiAqXG4gKiBNZXRhY29kZTogdTEgICAgICAgICAtIDB4NTggIFRpbWUgU2lnbmF0dXJlXG4gKiAgICAgICAgICAgdmFybGVuICAgICAtIDQgXG4gKiAgICAgICAgICAgdTEgICAgICAgICAtIG51bWVyYXRvclxuICogICAgICAgICAgIHUxICAgICAgICAgLSBsb2cyKGRlbm9taW5hdG9yKVxuICogICAgICAgICAgIHUxICAgICAgICAgLSBjbG9ja3MgaW4gbWV0cm9ub21lIGNsaWNrXG4gKiAgICAgICAgICAgdTEgICAgICAgICAtIDMybmQgbm90ZXMgaW4gcXVhcnRlciBub3RlICh1c3VhbGx5IDgpXG4gKlxuICogTWV0YWNvZGU6IHUxICAgICAgICAgLSAweDU5ICBLZXkgU2lnbmF0dXJlXG4gKiAgICAgICAgICAgdmFybGVuICAgICAtIDJcbiAqICAgICAgICAgICB1MSAgICAgICAgIC0gaWYgPj0gMCwgdGhlbiBudW1iZXIgb2Ygc2hhcnBzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgIGlmIDwgMCwgdGhlbiBudW1iZXIgb2YgZmxhdHMgKiAtMVxuICogICAgICAgICAgIHUxICAgICAgICAgLSAwIGlmIG1ham9yIGtleVxuICogICAgICAgICAgICAgICAgICAgICAgICAxIGlmIG1pbm9yIGtleVxuICpcbiAqIE1ldGFjb2RlOiB1MSAgICAgICAgIC0gMHg1MSAgVGVtcG9cbiAqICAgICAgICAgICB2YXJsZW4gICAgIC0gMyAgXG4gKiAgICAgICAgICAgdTMgICAgICAgICAtIHF1YXJ0ZXIgbm90ZSBsZW5ndGggaW4gbWljcm9zZWNvbmRzXG4gKi9cblxuXG4vKiogQGNsYXNzIE1pZGlGaWxlXG4gKlxuICogVGhlIE1pZGlGaWxlIGNsYXNzIGNvbnRhaW5zIHRoZSBwYXJzZWQgZGF0YSBmcm9tIHRoZSBNaWRpIEZpbGUuXG4gKiBJdCBjb250YWluczpcbiAqIC0gQWxsIHRoZSB0cmFja3MgaW4gdGhlIG1pZGkgZmlsZSwgaW5jbHVkaW5nIGFsbCBNaWRpTm90ZXMgcGVyIHRyYWNrLlxuICogLSBUaGUgdGltZSBzaWduYXR1cmUgKGUuZy4gNC80LCAzLzQsIDYvOClcbiAqIC0gVGhlIG51bWJlciBvZiBwdWxzZXMgcGVyIHF1YXJ0ZXIgbm90ZS5cbiAqIC0gVGhlIHRlbXBvIChudW1iZXIgb2YgbWljcm9zZWNvbmRzIHBlciBxdWFydGVyIG5vdGUpLlxuICpcbiAqIFRoZSBjb25zdHJ1Y3RvciB0YWtlcyBhIGZpbGVuYW1lIGFzIGlucHV0LCBhbmQgdXBvbiByZXR1cm5pbmcsXG4gKiBjb250YWlucyB0aGUgcGFyc2VkIGRhdGEgZnJvbSB0aGUgbWlkaSBmaWxlLlxuICpcbiAqIFRoZSBtZXRob2RzIFJlYWRUcmFjaygpIGFuZCBSZWFkTWV0YUV2ZW50KCkgYXJlIGhlbHBlciBmdW5jdGlvbnMgY2FsbGVkXG4gKiBieSB0aGUgY29uc3RydWN0b3IgZHVyaW5nIHRoZSBwYXJzaW5nLlxuICpcbiAqIEFmdGVyIHRoZSBNaWRpRmlsZSBpcyBwYXJzZWQgYW5kIGNyZWF0ZWQsIHRoZSB1c2VyIGNhbiByZXRyaWV2ZSB0aGUgXG4gKiB0cmFja3MgYW5kIG5vdGVzIGJ5IHVzaW5nIHRoZSBwcm9wZXJ0eSBUcmFja3MgYW5kIFRyYWNrcy5Ob3Rlcy5cbiAqXG4gKiBUaGVyZSBhcmUgdHdvIG1ldGhvZHMgZm9yIG1vZGlmeWluZyB0aGUgbWlkaSBkYXRhIGJhc2VkIG9uIHRoZSBtZW51XG4gKiBvcHRpb25zIHNlbGVjdGVkOlxuICpcbiAqIC0gQ2hhbmdlTWlkaU5vdGVzKClcbiAqICAgQXBwbHkgdGhlIG1lbnUgb3B0aW9ucyB0byB0aGUgcGFyc2VkIE1pZGlGaWxlLiAgVGhpcyB1c2VzIHRoZSBoZWxwZXIgZnVuY3Rpb25zOlxuICogICAgIFNwbGl0VHJhY2soKVxuICogICAgIENvbWJpbmVUb1R3b1RyYWNrcygpXG4gKiAgICAgU2hpZnRUaW1lKClcbiAqICAgICBUcmFuc3Bvc2UoKVxuICogICAgIFJvdW5kU3RhcnRUaW1lcygpXG4gKiAgICAgUm91bmREdXJhdGlvbnMoKVxuICpcbiAqIC0gQ2hhbmdlU291bmQoKVxuICogICBBcHBseSB0aGUgbWVudSBvcHRpb25zIHRvIHRoZSBNSURJIG11c2ljIGRhdGEsIGFuZCBzYXZlIHRoZSBtb2RpZmllZCBtaWRpIGRhdGEgXG4gKiAgIHRvIGEgZmlsZSwgZm9yIHBsYXliYWNrLiBcbiAqICAgXG4gKi9cblxucHVibGljIGNsYXNzIE1pZGlGaWxlIHtcbiAgICBwcml2YXRlIHN0cmluZyBmaWxlbmFtZTsgICAgICAgICAgLyoqIFRoZSBNaWRpIGZpbGUgbmFtZSAqL1xuICAgIHByaXZhdGUgTGlzdDxNaWRpRXZlbnQ+W10gZXZlbnRzOyAvKiogVGhlIHJhdyBNaWRpRXZlbnRzLCBvbmUgbGlzdCBwZXIgdHJhY2sgKi9cbiAgICBwcml2YXRlIExpc3Q8TWlkaVRyYWNrPiB0cmFja3MgOyAgLyoqIFRoZSB0cmFja3Mgb2YgdGhlIG1pZGlmaWxlIHRoYXQgaGF2ZSBub3RlcyAqL1xuICAgIHByaXZhdGUgdXNob3J0IHRyYWNrbW9kZTsgICAgICAgICAvKiogMCAoc2luZ2xlIHRyYWNrKSwgMSAoc2ltdWx0YW5lb3VzIHRyYWNrcykgMiAoaW5kZXBlbmRlbnQgdHJhY2tzKSAqL1xuICAgIHByaXZhdGUgVGltZVNpZ25hdHVyZSB0aW1lc2lnOyAgICAvKiogVGhlIHRpbWUgc2lnbmF0dXJlICovXG4gICAgcHJpdmF0ZSBpbnQgcXVhcnRlcm5vdGU7ICAgICAgICAgIC8qKiBUaGUgbnVtYmVyIG9mIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlICovXG4gICAgcHJpdmF0ZSBpbnQgdG90YWxwdWxzZXM7ICAgICAgICAgIC8qKiBUaGUgdG90YWwgbGVuZ3RoIG9mIHRoZSBzb25nLCBpbiBwdWxzZXMgKi9cbiAgICBwcml2YXRlIGJvb2wgdHJhY2tQZXJDaGFubmVsOyAgICAgLyoqIFRydWUgaWYgd2UndmUgc3BsaXQgZWFjaCBjaGFubmVsIGludG8gYSB0cmFjayAqL1xuXG4gICAgLyogVGhlIGxpc3Qgb2YgTWlkaSBFdmVudHMgKi9cbiAgICBwdWJsaWMgY29uc3QgaW50IEV2ZW50Tm90ZU9mZiAgICAgICAgID0gMHg4MDtcbiAgICBwdWJsaWMgY29uc3QgaW50IEV2ZW50Tm90ZU9uICAgICAgICAgID0gMHg5MDtcbiAgICBwdWJsaWMgY29uc3QgaW50IEV2ZW50S2V5UHJlc3N1cmUgICAgID0gMHhBMDtcbiAgICBwdWJsaWMgY29uc3QgaW50IEV2ZW50Q29udHJvbENoYW5nZSAgID0gMHhCMDtcbiAgICBwdWJsaWMgY29uc3QgaW50IEV2ZW50UHJvZ3JhbUNoYW5nZSAgID0gMHhDMDtcbiAgICBwdWJsaWMgY29uc3QgaW50IEV2ZW50Q2hhbm5lbFByZXNzdXJlID0gMHhEMDtcbiAgICBwdWJsaWMgY29uc3QgaW50IEV2ZW50UGl0Y2hCZW5kICAgICAgID0gMHhFMDtcbiAgICBwdWJsaWMgY29uc3QgaW50IFN5c2V4RXZlbnQxICAgICAgICAgID0gMHhGMDtcbiAgICBwdWJsaWMgY29uc3QgaW50IFN5c2V4RXZlbnQyICAgICAgICAgID0gMHhGNztcbiAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudCAgICAgICAgICAgID0gMHhGRjtcblxuICAgIC8qIFRoZSBsaXN0IG9mIE1ldGEgRXZlbnRzICovXG4gICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRTZXF1ZW5jZSAgICAgID0gMHgwO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50VGV4dCAgICAgICAgICA9IDB4MTtcbiAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudENvcHlyaWdodCAgICAgPSAweDI7XG4gICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRTZXF1ZW5jZU5hbWUgID0gMHgzO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50SW5zdHJ1bWVudCAgICA9IDB4NDtcbiAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudEx5cmljICAgICAgICAgPSAweDU7XG4gICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRNYXJrZXIgICAgICAgID0gMHg2O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50RW5kT2ZUcmFjayAgICA9IDB4MkY7XG4gICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRUZW1wbyAgICAgICAgID0gMHg1MTtcbiAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudFNNUFRFT2Zmc2V0ICAgPSAweDU0O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50VGltZVNpZ25hdHVyZSA9IDB4NTg7XG4gICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRLZXlTaWduYXR1cmUgID0gMHg1OTtcblxuICAgIC8qIFRoZSBQcm9ncmFtIENoYW5nZSBldmVudCBnaXZlcyB0aGUgaW5zdHJ1bWVudCB0aGF0IHNob3VsZFxuICAgICAqIGJlIHVzZWQgZm9yIGEgcGFydGljdWxhciBjaGFubmVsLiAgVGhlIGZvbGxvd2luZyB0YWJsZVxuICAgICAqIG1hcHMgZWFjaCBpbnN0cnVtZW50IG51bWJlciAoMCB0aHJ1IDEyOCkgdG8gYW4gaW5zdHJ1bWVudFxuICAgICAqIG5hbWUuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBzdHJpbmdbXSBJbnN0cnVtZW50cyA9IHtcblxuICAgICAgICBcIkFjb3VzdGljIEdyYW5kIFBpYW5vXCIsXG4gICAgICAgIFwiQnJpZ2h0IEFjb3VzdGljIFBpYW5vXCIsXG4gICAgICAgIFwiRWxlY3RyaWMgR3JhbmQgUGlhbm9cIixcbiAgICAgICAgXCJIb25reS10b25rIFBpYW5vXCIsXG4gICAgICAgIFwiRWxlY3RyaWMgUGlhbm8gMVwiLFxuICAgICAgICBcIkVsZWN0cmljIFBpYW5vIDJcIixcbiAgICAgICAgXCJIYXJwc2ljaG9yZFwiLFxuICAgICAgICBcIkNsYXZpXCIsXG4gICAgICAgIFwiQ2VsZXN0YVwiLFxuICAgICAgICBcIkdsb2NrZW5zcGllbFwiLFxuICAgICAgICBcIk11c2ljIEJveFwiLFxuICAgICAgICBcIlZpYnJhcGhvbmVcIixcbiAgICAgICAgXCJNYXJpbWJhXCIsXG4gICAgICAgIFwiWHlsb3Bob25lXCIsXG4gICAgICAgIFwiVHVidWxhciBCZWxsc1wiLFxuICAgICAgICBcIkR1bGNpbWVyXCIsXG4gICAgICAgIFwiRHJhd2JhciBPcmdhblwiLFxuICAgICAgICBcIlBlcmN1c3NpdmUgT3JnYW5cIixcbiAgICAgICAgXCJSb2NrIE9yZ2FuXCIsXG4gICAgICAgIFwiQ2h1cmNoIE9yZ2FuXCIsXG4gICAgICAgIFwiUmVlZCBPcmdhblwiLFxuICAgICAgICBcIkFjY29yZGlvblwiLFxuICAgICAgICBcIkhhcm1vbmljYVwiLFxuICAgICAgICBcIlRhbmdvIEFjY29yZGlvblwiLFxuICAgICAgICBcIkFjb3VzdGljIEd1aXRhciAobnlsb24pXCIsXG4gICAgICAgIFwiQWNvdXN0aWMgR3VpdGFyIChzdGVlbClcIixcbiAgICAgICAgXCJFbGVjdHJpYyBHdWl0YXIgKGphenopXCIsXG4gICAgICAgIFwiRWxlY3RyaWMgR3VpdGFyIChjbGVhbilcIixcbiAgICAgICAgXCJFbGVjdHJpYyBHdWl0YXIgKG11dGVkKVwiLFxuICAgICAgICBcIk92ZXJkcml2ZW4gR3VpdGFyXCIsXG4gICAgICAgIFwiRGlzdG9ydGlvbiBHdWl0YXJcIixcbiAgICAgICAgXCJHdWl0YXIgaGFybW9uaWNzXCIsXG4gICAgICAgIFwiQWNvdXN0aWMgQmFzc1wiLFxuICAgICAgICBcIkVsZWN0cmljIEJhc3MgKGZpbmdlcilcIixcbiAgICAgICAgXCJFbGVjdHJpYyBCYXNzIChwaWNrKVwiLFxuICAgICAgICBcIkZyZXRsZXNzIEJhc3NcIixcbiAgICAgICAgXCJTbGFwIEJhc3MgMVwiLFxuICAgICAgICBcIlNsYXAgQmFzcyAyXCIsXG4gICAgICAgIFwiU3ludGggQmFzcyAxXCIsXG4gICAgICAgIFwiU3ludGggQmFzcyAyXCIsXG4gICAgICAgIFwiVmlvbGluXCIsXG4gICAgICAgIFwiVmlvbGFcIixcbiAgICAgICAgXCJDZWxsb1wiLFxuICAgICAgICBcIkNvbnRyYWJhc3NcIixcbiAgICAgICAgXCJUcmVtb2xvIFN0cmluZ3NcIixcbiAgICAgICAgXCJQaXp6aWNhdG8gU3RyaW5nc1wiLFxuICAgICAgICBcIk9yY2hlc3RyYWwgSGFycFwiLFxuICAgICAgICBcIlRpbXBhbmlcIixcbiAgICAgICAgXCJTdHJpbmcgRW5zZW1ibGUgMVwiLFxuICAgICAgICBcIlN0cmluZyBFbnNlbWJsZSAyXCIsXG4gICAgICAgIFwiU3ludGhTdHJpbmdzIDFcIixcbiAgICAgICAgXCJTeW50aFN0cmluZ3MgMlwiLFxuICAgICAgICBcIkNob2lyIEFhaHNcIixcbiAgICAgICAgXCJWb2ljZSBPb2hzXCIsXG4gICAgICAgIFwiU3ludGggVm9pY2VcIixcbiAgICAgICAgXCJPcmNoZXN0cmEgSGl0XCIsXG4gICAgICAgIFwiVHJ1bXBldFwiLFxuICAgICAgICBcIlRyb21ib25lXCIsXG4gICAgICAgIFwiVHViYVwiLFxuICAgICAgICBcIk11dGVkIFRydW1wZXRcIixcbiAgICAgICAgXCJGcmVuY2ggSG9yblwiLFxuICAgICAgICBcIkJyYXNzIFNlY3Rpb25cIixcbiAgICAgICAgXCJTeW50aEJyYXNzIDFcIixcbiAgICAgICAgXCJTeW50aEJyYXNzIDJcIixcbiAgICAgICAgXCJTb3ByYW5vIFNheFwiLFxuICAgICAgICBcIkFsdG8gU2F4XCIsXG4gICAgICAgIFwiVGVub3IgU2F4XCIsXG4gICAgICAgIFwiQmFyaXRvbmUgU2F4XCIsXG4gICAgICAgIFwiT2JvZVwiLFxuICAgICAgICBcIkVuZ2xpc2ggSG9yblwiLFxuICAgICAgICBcIkJhc3Nvb25cIixcbiAgICAgICAgXCJDbGFyaW5ldFwiLFxuICAgICAgICBcIlBpY2NvbG9cIixcbiAgICAgICAgXCJGbHV0ZVwiLFxuICAgICAgICBcIlJlY29yZGVyXCIsXG4gICAgICAgIFwiUGFuIEZsdXRlXCIsXG4gICAgICAgIFwiQmxvd24gQm90dGxlXCIsXG4gICAgICAgIFwiU2hha3VoYWNoaVwiLFxuICAgICAgICBcIldoaXN0bGVcIixcbiAgICAgICAgXCJPY2FyaW5hXCIsXG4gICAgICAgIFwiTGVhZCAxIChzcXVhcmUpXCIsXG4gICAgICAgIFwiTGVhZCAyIChzYXd0b290aClcIixcbiAgICAgICAgXCJMZWFkIDMgKGNhbGxpb3BlKVwiLFxuICAgICAgICBcIkxlYWQgNCAoY2hpZmYpXCIsXG4gICAgICAgIFwiTGVhZCA1IChjaGFyYW5nKVwiLFxuICAgICAgICBcIkxlYWQgNiAodm9pY2UpXCIsXG4gICAgICAgIFwiTGVhZCA3IChmaWZ0aHMpXCIsXG4gICAgICAgIFwiTGVhZCA4IChiYXNzICsgbGVhZClcIixcbiAgICAgICAgXCJQYWQgMSAobmV3IGFnZSlcIixcbiAgICAgICAgXCJQYWQgMiAod2FybSlcIixcbiAgICAgICAgXCJQYWQgMyAocG9seXN5bnRoKVwiLFxuICAgICAgICBcIlBhZCA0IChjaG9pcilcIixcbiAgICAgICAgXCJQYWQgNSAoYm93ZWQpXCIsXG4gICAgICAgIFwiUGFkIDYgKG1ldGFsbGljKVwiLFxuICAgICAgICBcIlBhZCA3IChoYWxvKVwiLFxuICAgICAgICBcIlBhZCA4IChzd2VlcClcIixcbiAgICAgICAgXCJGWCAxIChyYWluKVwiLFxuICAgICAgICBcIkZYIDIgKHNvdW5kdHJhY2spXCIsXG4gICAgICAgIFwiRlggMyAoY3J5c3RhbClcIixcbiAgICAgICAgXCJGWCA0IChhdG1vc3BoZXJlKVwiLFxuICAgICAgICBcIkZYIDUgKGJyaWdodG5lc3MpXCIsXG4gICAgICAgIFwiRlggNiAoZ29ibGlucylcIixcbiAgICAgICAgXCJGWCA3IChlY2hvZXMpXCIsXG4gICAgICAgIFwiRlggOCAoc2NpLWZpKVwiLFxuICAgICAgICBcIlNpdGFyXCIsXG4gICAgICAgIFwiQmFuam9cIixcbiAgICAgICAgXCJTaGFtaXNlblwiLFxuICAgICAgICBcIktvdG9cIixcbiAgICAgICAgXCJLYWxpbWJhXCIsXG4gICAgICAgIFwiQmFnIHBpcGVcIixcbiAgICAgICAgXCJGaWRkbGVcIixcbiAgICAgICAgXCJTaGFuYWlcIixcbiAgICAgICAgXCJUaW5rbGUgQmVsbFwiLFxuICAgICAgICBcIkFnb2dvXCIsXG4gICAgICAgIFwiU3RlZWwgRHJ1bXNcIixcbiAgICAgICAgXCJXb29kYmxvY2tcIixcbiAgICAgICAgXCJUYWlrbyBEcnVtXCIsXG4gICAgICAgIFwiTWVsb2RpYyBUb21cIixcbiAgICAgICAgXCJTeW50aCBEcnVtXCIsXG4gICAgICAgIFwiUmV2ZXJzZSBDeW1iYWxcIixcbiAgICAgICAgXCJHdWl0YXIgRnJldCBOb2lzZVwiLFxuICAgICAgICBcIkJyZWF0aCBOb2lzZVwiLFxuICAgICAgICBcIlNlYXNob3JlXCIsXG4gICAgICAgIFwiQmlyZCBUd2VldFwiLFxuICAgICAgICBcIlRlbGVwaG9uZSBSaW5nXCIsXG4gICAgICAgIFwiSGVsaWNvcHRlclwiLFxuICAgICAgICBcIkFwcGxhdXNlXCIsXG4gICAgICAgIFwiR3Vuc2hvdFwiLFxuICAgICAgICBcIlBlcmN1c3Npb25cIlxuICAgIH07XG4gICAgLyogRW5kIEluc3RydW1lbnRzICovXG5cbiAgICAvKiogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgTWlkaSBldmVudCAqL1xuICAgIHByaXZhdGUgc3RyaW5nIEV2ZW50TmFtZShpbnQgZXYpIHtcbiAgICAgICAgaWYgKGV2ID49IEV2ZW50Tm90ZU9mZiAmJiBldiA8IEV2ZW50Tm90ZU9mZiArIDE2KVxuICAgICAgICAgICAgcmV0dXJuIFwiTm90ZU9mZlwiO1xuICAgICAgICBlbHNlIGlmIChldiA+PSBFdmVudE5vdGVPbiAmJiBldiA8IEV2ZW50Tm90ZU9uICsgMTYpIFxuICAgICAgICAgICAgcmV0dXJuIFwiTm90ZU9uXCI7XG4gICAgICAgIGVsc2UgaWYgKGV2ID49IEV2ZW50S2V5UHJlc3N1cmUgJiYgZXYgPCBFdmVudEtleVByZXNzdXJlICsgMTYpIFxuICAgICAgICAgICAgcmV0dXJuIFwiS2V5UHJlc3N1cmVcIjtcbiAgICAgICAgZWxzZSBpZiAoZXYgPj0gRXZlbnRDb250cm9sQ2hhbmdlICYmIGV2IDwgRXZlbnRDb250cm9sQ2hhbmdlICsgMTYpIFxuICAgICAgICAgICAgcmV0dXJuIFwiQ29udHJvbENoYW5nZVwiO1xuICAgICAgICBlbHNlIGlmIChldiA+PSBFdmVudFByb2dyYW1DaGFuZ2UgJiYgZXYgPCBFdmVudFByb2dyYW1DaGFuZ2UgKyAxNikgXG4gICAgICAgICAgICByZXR1cm4gXCJQcm9ncmFtQ2hhbmdlXCI7XG4gICAgICAgIGVsc2UgaWYgKGV2ID49IEV2ZW50Q2hhbm5lbFByZXNzdXJlICYmIGV2IDwgRXZlbnRDaGFubmVsUHJlc3N1cmUgKyAxNilcbiAgICAgICAgICAgIHJldHVybiBcIkNoYW5uZWxQcmVzc3VyZVwiO1xuICAgICAgICBlbHNlIGlmIChldiA+PSBFdmVudFBpdGNoQmVuZCAmJiBldiA8IEV2ZW50UGl0Y2hCZW5kICsgMTYpXG4gICAgICAgICAgICByZXR1cm4gXCJQaXRjaEJlbmRcIjtcbiAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50KVxuICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50XCI7XG4gICAgICAgIGVsc2UgaWYgKGV2ID09IFN5c2V4RXZlbnQxIHx8IGV2ID09IFN5c2V4RXZlbnQyKVxuICAgICAgICAgICAgcmV0dXJuIFwiU3lzZXhFdmVudFwiO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gXCJVbmtub3duXCI7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIG1ldGEtZXZlbnQgKi9cbiAgICBwcml2YXRlIHN0cmluZyBNZXRhTmFtZShpbnQgZXYpIHtcbiAgICAgICAgaWYgKGV2ID09IE1ldGFFdmVudFNlcXVlbmNlKVxuICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50U2VxdWVuY2VcIjtcbiAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50VGV4dClcbiAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudFRleHRcIjtcbiAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50Q29weXJpZ2h0KVxuICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50Q29weXJpZ2h0XCI7XG4gICAgICAgIGVsc2UgaWYgKGV2ID09IE1ldGFFdmVudFNlcXVlbmNlTmFtZSlcbiAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudFNlcXVlbmNlTmFtZVwiO1xuICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRJbnN0cnVtZW50KVxuICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50SW5zdHJ1bWVudFwiO1xuICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRMeXJpYylcbiAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudEx5cmljXCI7XG4gICAgICAgIGVsc2UgaWYgKGV2ID09IE1ldGFFdmVudE1hcmtlcilcbiAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudE1hcmtlclwiO1xuICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRFbmRPZlRyYWNrKVxuICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50RW5kT2ZUcmFja1wiO1xuICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRUZW1wbylcbiAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudFRlbXBvXCI7XG4gICAgICAgIGVsc2UgaWYgKGV2ID09IE1ldGFFdmVudFNNUFRFT2Zmc2V0KVxuICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50U01QVEVPZmZzZXRcIjtcbiAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50VGltZVNpZ25hdHVyZSlcbiAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudFRpbWVTaWduYXR1cmVcIjtcbiAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50S2V5U2lnbmF0dXJlKVxuICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50S2V5U2lnbmF0dXJlXCI7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBcIlVua25vd25cIjtcbiAgICB9XG5cblxuICAgIC8qKiBHZXQgdGhlIGxpc3Qgb2YgdHJhY2tzICovXG4gICAgcHVibGljIExpc3Q8TWlkaVRyYWNrPiBUcmFja3Mge1xuICAgICAgICBnZXQgeyByZXR1cm4gdHJhY2tzOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgdGltZSBzaWduYXR1cmUgKi9cbiAgICBwdWJsaWMgVGltZVNpZ25hdHVyZSBUaW1lIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHRpbWVzaWc7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBmaWxlIG5hbWUgKi9cbiAgICBwdWJsaWMgc3RyaW5nIEZpbGVOYW1lIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIGZpbGVuYW1lOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgdG90YWwgbGVuZ3RoIChpbiBwdWxzZXMpIG9mIHRoZSBzb25nICovXG4gICAgcHVibGljIGludCBUb3RhbFB1bHNlcyB7XG4gICAgICAgIGdldCB7IHJldHVybiB0b3RhbHB1bHNlczsgfVxuICAgIH1cblxuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBNaWRpRmlsZSBmcm9tIHRoZSBmaWxlLiAqL1xuICAgIC8vcHVibGljIE1pZGlGaWxlKHN0cmluZyBmaWxlbmFtZSkge1xuICAgIC8vICAgIE1pZGlGaWxlUmVhZGVyIGZpbGUgPSBuZXcgTWlkaUZpbGVSZWFkZXIoZmlsZW5hbWUpO1xuICAgIC8vICAgIHBhcnNlKGZpbGUsIGZpbGVuYW1lKTtcbiAgICAvL31cblxuICAgIC8qKiBDcmVhdGUgYSBuZXcgTWlkaUZpbGUgZnJvbSB0aGUgYnl0ZVtdLiAqL1xuICAgIHB1YmxpYyBNaWRpRmlsZShieXRlW10gZGF0YSwgc3RyaW5nIHRpdGxlKSB7XG4gICAgICAgIE1pZGlGaWxlUmVhZGVyIGZpbGUgPSBuZXcgTWlkaUZpbGVSZWFkZXIoZGF0YSk7XG4gICAgICAgIGlmICh0aXRsZSA9PSBudWxsKVxuICAgICAgICAgICAgdGl0bGUgPSBcIlwiO1xuICAgICAgICBwYXJzZShmaWxlLCB0aXRsZSk7XG4gICAgfVxuXG4gICAgLyoqIFBhcnNlIHRoZSBnaXZlbiBNaWRpIGZpbGUsIGFuZCByZXR1cm4gYW4gaW5zdGFuY2Ugb2YgdGhpcyBNaWRpRmlsZVxuICAgICAqIGNsYXNzLiAgQWZ0ZXIgcmVhZGluZyB0aGUgbWlkaSBmaWxlLCB0aGlzIG9iamVjdCB3aWxsIGNvbnRhaW46XG4gICAgICogLSBUaGUgcmF3IGxpc3Qgb2YgbWlkaSBldmVudHNcbiAgICAgKiAtIFRoZSBUaW1lIFNpZ25hdHVyZSBvZiB0aGUgc29uZ1xuICAgICAqIC0gQWxsIHRoZSB0cmFja3MgaW4gdGhlIHNvbmcgd2hpY2ggY29udGFpbiBub3Rlcy4gXG4gICAgICogLSBUaGUgbnVtYmVyLCBzdGFydHRpbWUsIGFuZCBkdXJhdGlvbiBvZiBlYWNoIG5vdGUuXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgcGFyc2UoTWlkaUZpbGVSZWFkZXIgZmlsZSwgc3RyaW5nIGZpbGVuYW1lKSB7XG4gICAgICAgIHN0cmluZyBpZDtcbiAgICAgICAgaW50IGxlbjtcblxuICAgICAgICB0aGlzLmZpbGVuYW1lID0gZmlsZW5hbWU7XG4gICAgICAgIHRyYWNrcyA9IG5ldyBMaXN0PE1pZGlUcmFjaz4oKTtcbiAgICAgICAgdHJhY2tQZXJDaGFubmVsID0gZmFsc2U7XG5cbiAgICAgICAgaWQgPSBmaWxlLlJlYWRBc2NpaSg0KTtcbiAgICAgICAgaWYgKGlkICE9IFwiTVRoZFwiKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXCJEb2Vzbid0IHN0YXJ0IHdpdGggTVRoZFwiLCAwKTtcbiAgICAgICAgfVxuICAgICAgICBsZW4gPSBmaWxlLlJlYWRJbnQoKTsgXG4gICAgICAgIGlmIChsZW4gIT0gIDYpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBNaWRpRmlsZUV4Y2VwdGlvbihcIkJhZCBNVGhkIGhlYWRlclwiLCA0KTtcbiAgICAgICAgfVxuICAgICAgICB0cmFja21vZGUgPSBmaWxlLlJlYWRTaG9ydCgpO1xuICAgICAgICBpbnQgbnVtX3RyYWNrcyA9IGZpbGUuUmVhZFNob3J0KCk7XG4gICAgICAgIHF1YXJ0ZXJub3RlID0gZmlsZS5SZWFkU2hvcnQoKTsgXG5cbiAgICAgICAgZXZlbnRzID0gbmV3IExpc3Q8TWlkaUV2ZW50PltudW1fdHJhY2tzXTtcbiAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IG51bV90cmFja3M7IHRyYWNrbnVtKyspIHtcbiAgICAgICAgICAgIGV2ZW50c1t0cmFja251bV0gPSBSZWFkVHJhY2soZmlsZSk7XG4gICAgICAgICAgICBNaWRpVHJhY2sgdHJhY2sgPSBuZXcgTWlkaVRyYWNrKGV2ZW50c1t0cmFja251bV0sIHRyYWNrbnVtKTtcbiAgICAgICAgICAgIGlmICh0cmFjay5Ob3Rlcy5Db3VudCA+IDAgfHwgdHJhY2suTHlyaWNzICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0cmFja3MuQWRkKHRyYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIEdldCB0aGUgbGVuZ3RoIG9mIHRoZSBzb25nIGluIHB1bHNlcyAqL1xuICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKSB7XG4gICAgICAgICAgICBNaWRpTm90ZSBsYXN0ID0gdHJhY2suTm90ZXNbdHJhY2suTm90ZXMuQ291bnQtMV07XG4gICAgICAgICAgICBpZiAodGhpcy50b3RhbHB1bHNlcyA8IGxhc3QuU3RhcnRUaW1lICsgbGFzdC5EdXJhdGlvbikge1xuICAgICAgICAgICAgICAgIHRoaXMudG90YWxwdWxzZXMgPSBsYXN0LlN0YXJ0VGltZSArIGxhc3QuRHVyYXRpb247XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBJZiB3ZSBvbmx5IGhhdmUgb25lIHRyYWNrIHdpdGggbXVsdGlwbGUgY2hhbm5lbHMsIHRoZW4gdHJlYXRcbiAgICAgICAgICogZWFjaCBjaGFubmVsIGFzIGEgc2VwYXJhdGUgdHJhY2suXG4gICAgICAgICAqL1xuICAgICAgICBpZiAodHJhY2tzLkNvdW50ID09IDEgJiYgSGFzTXVsdGlwbGVDaGFubmVscyh0cmFja3NbMF0pKSB7XG4gICAgICAgICAgICB0cmFja3MgPSBTcGxpdENoYW5uZWxzKHRyYWNrc1swXSwgZXZlbnRzW3RyYWNrc1swXS5OdW1iZXJdKTtcbiAgICAgICAgICAgIHRyYWNrUGVyQ2hhbm5lbCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBDaGVja1N0YXJ0VGltZXModHJhY2tzKTtcblxuICAgICAgICAvKiBEZXRlcm1pbmUgdGhlIHRpbWUgc2lnbmF0dXJlICovXG4gICAgICAgIGludCB0ZW1wbyA9IDA7XG4gICAgICAgIGludCBudW1lciA9IDA7XG4gICAgICAgIGludCBkZW5vbSA9IDA7XG4gICAgICAgIGZvcmVhY2ggKExpc3Q8TWlkaUV2ZW50PiBsaXN0IGluIGV2ZW50cykge1xuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaUV2ZW50IG1ldmVudCBpbiBsaXN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKG1ldmVudC5NZXRhZXZlbnQgPT0gTWV0YUV2ZW50VGVtcG8gJiYgdGVtcG8gPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wbyA9IG1ldmVudC5UZW1wbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG1ldmVudC5NZXRhZXZlbnQgPT0gTWV0YUV2ZW50VGltZVNpZ25hdHVyZSAmJiBudW1lciA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG51bWVyID0gbWV2ZW50Lk51bWVyYXRvcjtcbiAgICAgICAgICAgICAgICAgICAgZGVub20gPSBtZXZlbnQuRGVub21pbmF0b3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0ZW1wbyA9PSAwKSB7XG4gICAgICAgICAgICB0ZW1wbyA9IDUwMDAwMDsgLyogNTAwLDAwMCBtaWNyb3NlY29uZHMgPSAwLjA1IHNlYyAqL1xuICAgICAgICB9XG4gICAgICAgIGlmIChudW1lciA9PSAwKSB7XG4gICAgICAgICAgICBudW1lciA9IDQ7IGRlbm9tID0gNDtcbiAgICAgICAgfVxuICAgICAgICB0aW1lc2lnID0gbmV3IFRpbWVTaWduYXR1cmUobnVtZXIsIGRlbm9tLCBxdWFydGVybm90ZSwgdGVtcG8pO1xuICAgIH1cblxuICAgIC8qKiBQYXJzZSBhIHNpbmdsZSBNaWRpIHRyYWNrIGludG8gYSBsaXN0IG9mIE1pZGlFdmVudHMuXG4gICAgICogRW50ZXJpbmcgdGhpcyBmdW5jdGlvbiwgdGhlIGZpbGUgb2Zmc2V0IHNob3VsZCBiZSBhdCB0aGUgc3RhcnQgb2ZcbiAgICAgKiB0aGUgTVRyayBoZWFkZXIuICBVcG9uIGV4aXRpbmcsIHRoZSBmaWxlIG9mZnNldCBzaG91bGQgYmUgYXQgdGhlXG4gICAgICogc3RhcnQgb2YgdGhlIG5leHQgTVRyayBoZWFkZXIuXG4gICAgICovXG4gICAgcHJpdmF0ZSBMaXN0PE1pZGlFdmVudD4gUmVhZFRyYWNrKE1pZGlGaWxlUmVhZGVyIGZpbGUpIHtcbiAgICAgICAgTGlzdDxNaWRpRXZlbnQ+IHJlc3VsdCA9IG5ldyBMaXN0PE1pZGlFdmVudD4oMjApO1xuICAgICAgICBpbnQgc3RhcnR0aW1lID0gMDtcbiAgICAgICAgc3RyaW5nIGlkID0gZmlsZS5SZWFkQXNjaWkoNCk7XG5cbiAgICAgICAgaWYgKGlkICE9IFwiTVRya1wiKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXCJCYWQgTVRyayBoZWFkZXJcIiwgZmlsZS5HZXRPZmZzZXQoKSAtIDQpO1xuICAgICAgICB9XG4gICAgICAgIGludCB0cmFja2xlbiA9IGZpbGUuUmVhZEludCgpO1xuICAgICAgICBpbnQgdHJhY2tlbmQgPSB0cmFja2xlbiArIGZpbGUuR2V0T2Zmc2V0KCk7XG5cbiAgICAgICAgaW50IGV2ZW50ZmxhZyA9IDA7XG5cbiAgICAgICAgd2hpbGUgKGZpbGUuR2V0T2Zmc2V0KCkgPCB0cmFja2VuZCkge1xuXG4gICAgICAgICAgICAvLyBJZiB0aGUgbWlkaSBmaWxlIGlzIHRydW5jYXRlZCBoZXJlLCB3ZSBjYW4gc3RpbGwgcmVjb3Zlci5cbiAgICAgICAgICAgIC8vIEp1c3QgcmV0dXJuIHdoYXQgd2UndmUgcGFyc2VkIHNvIGZhci5cblxuICAgICAgICAgICAgaW50IHN0YXJ0b2Zmc2V0LCBkZWx0YXRpbWU7XG4gICAgICAgICAgICBieXRlIHBlZWtldmVudDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgc3RhcnRvZmZzZXQgPSBmaWxlLkdldE9mZnNldCgpO1xuICAgICAgICAgICAgICAgIGRlbHRhdGltZSA9IGZpbGUuUmVhZFZhcmxlbigpO1xuICAgICAgICAgICAgICAgIHN0YXJ0dGltZSArPSBkZWx0YXRpbWU7XG4gICAgICAgICAgICAgICAgcGVla2V2ZW50ID0gZmlsZS5QZWVrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoTWlkaUZpbGVFeGNlcHRpb24gZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIE1pZGlFdmVudCBtZXZlbnQgPSBuZXcgTWlkaUV2ZW50KCk7XG4gICAgICAgICAgICByZXN1bHQuQWRkKG1ldmVudCk7XG4gICAgICAgICAgICBtZXZlbnQuRGVsdGFUaW1lID0gZGVsdGF0aW1lO1xuICAgICAgICAgICAgbWV2ZW50LlN0YXJ0VGltZSA9IHN0YXJ0dGltZTtcblxuICAgICAgICAgICAgaWYgKHBlZWtldmVudCA+PSBFdmVudE5vdGVPZmYpIHsgXG4gICAgICAgICAgICAgICAgbWV2ZW50Lkhhc0V2ZW50ZmxhZyA9IHRydWU7IFxuICAgICAgICAgICAgICAgIGV2ZW50ZmxhZyA9IGZpbGUuUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ29uc29sZS5Xcml0ZUxpbmUoXCJvZmZzZXQgezB9OiBldmVudCB7MX0gezJ9IHN0YXJ0IHszfSBkZWx0YSB7NH1cIiwgXG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICBzdGFydG9mZnNldCwgZXZlbnRmbGFnLCBFdmVudE5hbWUoZXZlbnRmbGFnKSwgXG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICBzdGFydHRpbWUsIG1ldmVudC5EZWx0YVRpbWUpO1xuXG4gICAgICAgICAgICBpZiAoZXZlbnRmbGFnID49IEV2ZW50Tm90ZU9uICYmIGV2ZW50ZmxhZyA8IEV2ZW50Tm90ZU9uICsgMTYpIHtcbiAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gRXZlbnROb3RlT247XG4gICAgICAgICAgICAgICAgbWV2ZW50LkNoYW5uZWwgPSAoYnl0ZSkoZXZlbnRmbGFnIC0gRXZlbnROb3RlT24pO1xuICAgICAgICAgICAgICAgIG1ldmVudC5Ob3RlbnVtYmVyID0gZmlsZS5SZWFkQnl0ZSgpO1xuICAgICAgICAgICAgICAgIG1ldmVudC5WZWxvY2l0eSA9IGZpbGUuUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ZW50ZmxhZyA+PSBFdmVudE5vdGVPZmYgJiYgZXZlbnRmbGFnIDwgRXZlbnROb3RlT2ZmICsgMTYpIHtcbiAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gRXZlbnROb3RlT2ZmO1xuICAgICAgICAgICAgICAgIG1ldmVudC5DaGFubmVsID0gKGJ5dGUpKGV2ZW50ZmxhZyAtIEV2ZW50Tm90ZU9mZik7XG4gICAgICAgICAgICAgICAgbWV2ZW50Lk5vdGVudW1iZXIgPSBmaWxlLlJlYWRCeXRlKCk7XG4gICAgICAgICAgICAgICAgbWV2ZW50LlZlbG9jaXR5ID0gZmlsZS5SZWFkQnl0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZXZlbnRmbGFnID49IEV2ZW50S2V5UHJlc3N1cmUgJiYgXG4gICAgICAgICAgICAgICAgICAgICBldmVudGZsYWcgPCBFdmVudEtleVByZXNzdXJlICsgMTYpIHtcbiAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gRXZlbnRLZXlQcmVzc3VyZTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuQ2hhbm5lbCA9IChieXRlKShldmVudGZsYWcgLSBFdmVudEtleVByZXNzdXJlKTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuTm90ZW51bWJlciA9IGZpbGUuUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuS2V5UHJlc3N1cmUgPSBmaWxlLlJlYWRCeXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChldmVudGZsYWcgPj0gRXZlbnRDb250cm9sQ2hhbmdlICYmIFxuICAgICAgICAgICAgICAgICAgICAgZXZlbnRmbGFnIDwgRXZlbnRDb250cm9sQ2hhbmdlICsgMTYpIHtcbiAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gRXZlbnRDb250cm9sQ2hhbmdlO1xuICAgICAgICAgICAgICAgIG1ldmVudC5DaGFubmVsID0gKGJ5dGUpKGV2ZW50ZmxhZyAtIEV2ZW50Q29udHJvbENoYW5nZSk7XG4gICAgICAgICAgICAgICAgbWV2ZW50LkNvbnRyb2xOdW0gPSBmaWxlLlJlYWRCeXRlKCk7XG4gICAgICAgICAgICAgICAgbWV2ZW50LkNvbnRyb2xWYWx1ZSA9IGZpbGUuUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ZW50ZmxhZyA+PSBFdmVudFByb2dyYW1DaGFuZ2UgJiYgXG4gICAgICAgICAgICAgICAgICAgICBldmVudGZsYWcgPCBFdmVudFByb2dyYW1DaGFuZ2UgKyAxNikge1xuICAgICAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPSBFdmVudFByb2dyYW1DaGFuZ2U7XG4gICAgICAgICAgICAgICAgbWV2ZW50LkNoYW5uZWwgPSAoYnl0ZSkoZXZlbnRmbGFnIC0gRXZlbnRQcm9ncmFtQ2hhbmdlKTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuSW5zdHJ1bWVudCA9IGZpbGUuUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ZW50ZmxhZyA+PSBFdmVudENoYW5uZWxQcmVzc3VyZSAmJiBcbiAgICAgICAgICAgICAgICAgICAgIGV2ZW50ZmxhZyA8IEV2ZW50Q2hhbm5lbFByZXNzdXJlICsgMTYpIHtcbiAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gRXZlbnRDaGFubmVsUHJlc3N1cmU7XG4gICAgICAgICAgICAgICAgbWV2ZW50LkNoYW5uZWwgPSAoYnl0ZSkoZXZlbnRmbGFnIC0gRXZlbnRDaGFubmVsUHJlc3N1cmUpO1xuICAgICAgICAgICAgICAgIG1ldmVudC5DaGFuUHJlc3N1cmUgPSBmaWxlLlJlYWRCeXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChldmVudGZsYWcgPj0gRXZlbnRQaXRjaEJlbmQgJiYgXG4gICAgICAgICAgICAgICAgICAgICBldmVudGZsYWcgPCBFdmVudFBpdGNoQmVuZCArIDE2KSB7XG4gICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IEV2ZW50UGl0Y2hCZW5kO1xuICAgICAgICAgICAgICAgIG1ldmVudC5DaGFubmVsID0gKGJ5dGUpKGV2ZW50ZmxhZyAtIEV2ZW50UGl0Y2hCZW5kKTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuUGl0Y2hCZW5kID0gZmlsZS5SZWFkU2hvcnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ZW50ZmxhZyA9PSBTeXNleEV2ZW50MSkge1xuICAgICAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPSBTeXNleEV2ZW50MTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuTWV0YWxlbmd0aCA9IGZpbGUuUmVhZFZhcmxlbigpO1xuICAgICAgICAgICAgICAgIG1ldmVudC5WYWx1ZSA9IGZpbGUuUmVhZEJ5dGVzKG1ldmVudC5NZXRhbGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ZW50ZmxhZyA9PSBTeXNleEV2ZW50Mikge1xuICAgICAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPSBTeXNleEV2ZW50MjtcbiAgICAgICAgICAgICAgICBtZXZlbnQuTWV0YWxlbmd0aCA9IGZpbGUuUmVhZFZhcmxlbigpO1xuICAgICAgICAgICAgICAgIG1ldmVudC5WYWx1ZSA9IGZpbGUuUmVhZEJ5dGVzKG1ldmVudC5NZXRhbGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ZW50ZmxhZyA9PSBNZXRhRXZlbnQpIHtcbiAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gTWV0YUV2ZW50O1xuICAgICAgICAgICAgICAgIG1ldmVudC5NZXRhZXZlbnQgPSBmaWxlLlJlYWRCeXRlKCk7XG4gICAgICAgICAgICAgICAgbWV2ZW50Lk1ldGFsZW5ndGggPSBmaWxlLlJlYWRWYXJsZW4oKTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuVmFsdWUgPSBmaWxlLlJlYWRCeXRlcyhtZXZlbnQuTWV0YWxlbmd0aCk7XG4gICAgICAgICAgICAgICAgaWYgKG1ldmVudC5NZXRhZXZlbnQgPT0gTWV0YUV2ZW50VGltZVNpZ25hdHVyZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobWV2ZW50Lk1ldGFsZW5ndGggPCAyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgXCJNZXRhIEV2ZW50IFRpbWUgU2lnbmF0dXJlIGxlbiA9PSBcIiArIG1ldmVudC5NZXRhbGVuZ3RoICArIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gIFwiICE9IDRcIiwgZmlsZS5HZXRPZmZzZXQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuTnVtZXJhdG9yID0gKGJ5dGUpMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5EZW5vbWluYXRvciA9IChieXRlKTQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50Lk1ldGFsZW5ndGggPj0gMiAmJiBtZXZlbnQuTWV0YWxlbmd0aCA8IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5OdW1lcmF0b3IgPSAoYnl0ZSltZXZlbnQuVmFsdWVbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRGVub21pbmF0b3IgPSAoYnl0ZSlTeXN0ZW0uTWF0aC5Qb3coMiwgbWV2ZW50LlZhbHVlWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5OdW1lcmF0b3IgPSAoYnl0ZSltZXZlbnQuVmFsdWVbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRGVub21pbmF0b3IgPSAoYnl0ZSlTeXN0ZW0uTWF0aC5Qb3coMiwgbWV2ZW50LlZhbHVlWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuTWV0YWV2ZW50ID09IE1ldGFFdmVudFRlbXBvKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXZlbnQuTWV0YWxlbmd0aCAhPSAzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiTWV0YSBFdmVudCBUZW1wbyBsZW4gPT0gXCIgKyBtZXZlbnQuTWV0YWxlbmd0aCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiICE9IDNcIiwgZmlsZS5HZXRPZmZzZXQoKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LlRlbXBvID0gKCAobWV2ZW50LlZhbHVlWzBdIDw8IDE2KSB8IChtZXZlbnQuVmFsdWVbMV0gPDwgOCkgfCBtZXZlbnQuVmFsdWVbMl0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuTWV0YWV2ZW50ID09IE1ldGFFdmVudEVuZE9mVHJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgLyogYnJlYWs7ICAqL1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNaWRpRmlsZUV4Y2VwdGlvbihcIlVua25vd24gZXZlbnQgXCIgKyBtZXZlbnQuRXZlbnRGbGFnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5HZXRPZmZzZXQoKS0xKTsgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGlzIHRyYWNrIGNvbnRhaW5zIG11bHRpcGxlIGNoYW5uZWxzLlxuICAgICAqIElmIGEgTWlkaUZpbGUgY29udGFpbnMgb25seSBvbmUgdHJhY2ssIGFuZCBpdCBoYXMgbXVsdGlwbGUgY2hhbm5lbHMsXG4gICAgICogdGhlbiB3ZSB0cmVhdCBlYWNoIGNoYW5uZWwgYXMgYSBzZXBhcmF0ZSB0cmFjay5cbiAgICAgKi9cbiAgICBzdGF0aWMgYm9vbCBIYXNNdWx0aXBsZUNoYW5uZWxzKE1pZGlUcmFjayB0cmFjaykge1xuICAgICAgICBpbnQgY2hhbm5lbCA9IHRyYWNrLk5vdGVzWzBdLkNoYW5uZWw7XG4gICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG5vdGUgaW4gdHJhY2suTm90ZXMpIHtcbiAgICAgICAgICAgIGlmIChub3RlLkNoYW5uZWwgIT0gY2hhbm5lbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiogV3JpdGUgYSB2YXJpYWJsZSBsZW5ndGggbnVtYmVyIHRvIHRoZSBidWZmZXIgYXQgdGhlIGdpdmVuIG9mZnNldC5cbiAgICAgKiBSZXR1cm4gdGhlIG51bWJlciBvZiBieXRlcyB3cml0dGVuLlxuICAgICAqL1xuICAgIHN0YXRpYyBpbnQgVmFybGVuVG9CeXRlcyhpbnQgbnVtLCBieXRlW10gYnVmLCBpbnQgb2Zmc2V0KSB7XG4gICAgICAgIGJ5dGUgYjEgPSAoYnl0ZSkgKChudW0gPj4gMjEpICYgMHg3Rik7XG4gICAgICAgIGJ5dGUgYjIgPSAoYnl0ZSkgKChudW0gPj4gMTQpICYgMHg3Rik7XG4gICAgICAgIGJ5dGUgYjMgPSAoYnl0ZSkgKChudW0gPj4gIDcpICYgMHg3Rik7XG4gICAgICAgIGJ5dGUgYjQgPSAoYnl0ZSkgKG51bSAmIDB4N0YpO1xuXG4gICAgICAgIGlmIChiMSA+IDApIHtcbiAgICAgICAgICAgIGJ1ZltvZmZzZXRdICAgPSAoYnl0ZSkoYjEgfCAweDgwKTtcbiAgICAgICAgICAgIGJ1ZltvZmZzZXQrMV0gPSAoYnl0ZSkoYjIgfCAweDgwKTtcbiAgICAgICAgICAgIGJ1ZltvZmZzZXQrMl0gPSAoYnl0ZSkoYjMgfCAweDgwKTtcbiAgICAgICAgICAgIGJ1ZltvZmZzZXQrM10gPSBiNDtcbiAgICAgICAgICAgIHJldHVybiA0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGIyID4gMCkge1xuICAgICAgICAgICAgYnVmW29mZnNldF0gICA9IChieXRlKShiMiB8IDB4ODApO1xuICAgICAgICAgICAgYnVmW29mZnNldCsxXSA9IChieXRlKShiMyB8IDB4ODApO1xuICAgICAgICAgICAgYnVmW29mZnNldCsyXSA9IGI0O1xuICAgICAgICAgICAgcmV0dXJuIDM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYjMgPiAwKSB7XG4gICAgICAgICAgICBidWZbb2Zmc2V0XSAgID0gKGJ5dGUpKGIzIHwgMHg4MCk7XG4gICAgICAgICAgICBidWZbb2Zmc2V0KzFdID0gYjQ7XG4gICAgICAgICAgICByZXR1cm4gMjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGJ1ZltvZmZzZXRdID0gYjQ7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBXcml0ZSBhIDQtYnl0ZSBpbnRlZ2VyIHRvIGRhdGFbb2Zmc2V0IDogb2Zmc2V0KzRdICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBJbnRUb0J5dGVzKGludCB2YWx1ZSwgYnl0ZVtdIGRhdGEsIGludCBvZmZzZXQpIHtcbiAgICAgICAgZGF0YVtvZmZzZXRdID0gKGJ5dGUpKCAodmFsdWUgPj4gMjQpICYgMHhGRiApO1xuICAgICAgICBkYXRhW29mZnNldCsxXSA9IChieXRlKSggKHZhbHVlID4+IDE2KSAmIDB4RkYgKTtcbiAgICAgICAgZGF0YVtvZmZzZXQrMl0gPSAoYnl0ZSkoICh2YWx1ZSA+PiA4KSAmIDB4RkYgKTtcbiAgICAgICAgZGF0YVtvZmZzZXQrM10gPSAoYnl0ZSkoIHZhbHVlICYgMHhGRiApO1xuICAgIH1cblxuICAgIC8qKiBDYWxjdWxhdGUgdGhlIHRyYWNrIGxlbmd0aCAoaW4gYnl0ZXMpIGdpdmVuIGEgbGlzdCBvZiBNaWRpIGV2ZW50cyAqL1xuICAgIHByaXZhdGUgc3RhdGljIGludCBHZXRUcmFja0xlbmd0aChMaXN0PE1pZGlFdmVudD4gZXZlbnRzKSB7XG4gICAgICAgIGludCBsZW4gPSAwO1xuICAgICAgICBieXRlW10gYnVmID0gbmV3IGJ5dGVbMTAyNF07XG4gICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBtZXZlbnQgaW4gZXZlbnRzKSB7XG4gICAgICAgICAgICBsZW4gKz0gVmFybGVuVG9CeXRlcyhtZXZlbnQuRGVsdGFUaW1lLCBidWYsIDApO1xuICAgICAgICAgICAgbGVuICs9IDE7ICAvKiBmb3IgZXZlbnRmbGFnICovXG4gICAgICAgICAgICBzd2l0Y2ggKG1ldmVudC5FdmVudEZsYWcpIHtcbiAgICAgICAgICAgICAgICBjYXNlIEV2ZW50Tm90ZU9uOiBsZW4gKz0gMjsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBFdmVudE5vdGVPZmY6IGxlbiArPSAyOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIEV2ZW50S2V5UHJlc3N1cmU6IGxlbiArPSAyOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIEV2ZW50Q29udHJvbENoYW5nZTogbGVuICs9IDI7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgRXZlbnRQcm9ncmFtQ2hhbmdlOiBsZW4gKz0gMTsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBFdmVudENoYW5uZWxQcmVzc3VyZTogbGVuICs9IDE7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgRXZlbnRQaXRjaEJlbmQ6IGxlbiArPSAyOyBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgU3lzZXhFdmVudDE6IFxuICAgICAgICAgICAgICAgIGNhc2UgU3lzZXhFdmVudDI6XG4gICAgICAgICAgICAgICAgICAgIGxlbiArPSBWYXJsZW5Ub0J5dGVzKG1ldmVudC5NZXRhbGVuZ3RoLCBidWYsIDApOyBcbiAgICAgICAgICAgICAgICAgICAgbGVuICs9IG1ldmVudC5NZXRhbGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIE1ldGFFdmVudDogXG4gICAgICAgICAgICAgICAgICAgIGxlbiArPSAxOyBcbiAgICAgICAgICAgICAgICAgICAgbGVuICs9IFZhcmxlblRvQnl0ZXMobWV2ZW50Lk1ldGFsZW5ndGgsIGJ1ZiwgMCk7IFxuICAgICAgICAgICAgICAgICAgICBsZW4gKz0gbWV2ZW50Lk1ldGFsZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsZW47XG4gICAgfVxuICAgICAgICAgICAgXG5cbiAgICAvKiogV3JpdGUgdGhlIGdpdmVuIGxpc3Qgb2YgTWlkaSBldmVudHMgdG8gYSBzdHJlYW0vZmlsZS5cbiAgICAgKiAgVGhpcyBtZXRob2QgaXMgdXNlZCBmb3Igc291bmQgcGxheWJhY2ssIGZvciBjcmVhdGluZyBuZXcgTWlkaSBmaWxlc1xuICAgICAqICB3aXRoIHRoZSB0ZW1wbywgdHJhbnNwb3NlLCBldGMgY2hhbmdlZC5cbiAgICAgKlxuICAgICAqICBSZXR1cm4gdHJ1ZSBvbiBzdWNjZXNzLCBhbmQgZmFsc2Ugb24gZXJyb3IuXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgYm9vbCBcbiAgICBXcml0ZUV2ZW50cyhTdHJlYW0gZmlsZSwgTGlzdDxNaWRpRXZlbnQ+W10gZXZlbnRzLCBpbnQgdHJhY2ttb2RlLCBpbnQgcXVhcnRlcikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYnl0ZVtdIGJ1ZiA9IG5ldyBieXRlWzY1NTM2XTtcblxuICAgICAgICAgICAgLyogV3JpdGUgdGhlIE1UaGQsIGxlbiA9IDYsIHRyYWNrIG1vZGUsIG51bWJlciB0cmFja3MsIHF1YXJ0ZXIgbm90ZSAqL1xuICAgICAgICAgICAgZmlsZS5Xcml0ZShBU0NJSUVuY29kaW5nLkFTQ0lJLkdldEJ5dGVzKFwiTVRoZFwiKSwgMCwgNCk7XG4gICAgICAgICAgICBJbnRUb0J5dGVzKDYsIGJ1ZiwgMCk7XG4gICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgNCk7XG4gICAgICAgICAgICBidWZbMF0gPSAoYnl0ZSkodHJhY2ttb2RlID4+IDgpOyBcbiAgICAgICAgICAgIGJ1ZlsxXSA9IChieXRlKSh0cmFja21vZGUgJiAweEZGKTtcbiAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCAyKTtcbiAgICAgICAgICAgIGJ1ZlswXSA9IDA7IFxuICAgICAgICAgICAgYnVmWzFdID0gKGJ5dGUpZXZlbnRzLkxlbmd0aDtcbiAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCAyKTtcbiAgICAgICAgICAgIGJ1ZlswXSA9IChieXRlKShxdWFydGVyID4+IDgpOyBcbiAgICAgICAgICAgIGJ1ZlsxXSA9IChieXRlKShxdWFydGVyICYgMHhGRik7XG4gICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgMik7XG5cbiAgICAgICAgICAgIGZvcmVhY2ggKExpc3Q8TWlkaUV2ZW50PiBsaXN0IGluIGV2ZW50cykge1xuICAgICAgICAgICAgICAgIC8qIFdyaXRlIHRoZSBNVHJrIGhlYWRlciBhbmQgdHJhY2sgbGVuZ3RoICovXG4gICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShBU0NJSUVuY29kaW5nLkFTQ0lJLkdldEJ5dGVzKFwiTVRya1wiKSwgMCwgNCk7XG4gICAgICAgICAgICAgICAgaW50IGxlbiA9IEdldFRyYWNrTGVuZ3RoKGxpc3QpO1xuICAgICAgICAgICAgICAgIEludFRvQnl0ZXMobGVuLCBidWYsIDApO1xuICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCA0KTtcblxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBtZXZlbnQgaW4gbGlzdCkge1xuICAgICAgICAgICAgICAgICAgICBpbnQgdmFybGVuID0gVmFybGVuVG9CeXRlcyhtZXZlbnQuRGVsdGFUaW1lLCBidWYsIDApO1xuICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgdmFybGVuKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBTeXNleEV2ZW50MSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9PSBTeXNleEV2ZW50MiB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9PSBNZXRhRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IG1ldmVudC5FdmVudEZsYWc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbMF0gPSAoYnl0ZSkobWV2ZW50LkV2ZW50RmxhZyArIG1ldmVudC5DaGFubmVsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgMSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnROb3RlT24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IG1ldmVudC5Ob3RlbnVtYmVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzFdID0gbWV2ZW50LlZlbG9jaXR5O1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnROb3RlT2ZmKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbMF0gPSBtZXZlbnQuTm90ZW51bWJlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlsxXSA9IG1ldmVudC5WZWxvY2l0eTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IEV2ZW50S2V5UHJlc3N1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IG1ldmVudC5Ob3RlbnVtYmVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzFdID0gbWV2ZW50LktleVByZXNzdXJlO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnRDb250cm9sQ2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbMF0gPSBtZXZlbnQuQ29udHJvbE51bTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlsxXSA9IG1ldmVudC5Db250cm9sVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgMik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudFByb2dyYW1DaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IG1ldmVudC5JbnN0cnVtZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnRDaGFubmVsUHJlc3N1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IG1ldmVudC5DaGFuUHJlc3N1cmU7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudFBpdGNoQmVuZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gKGJ5dGUpKG1ldmVudC5QaXRjaEJlbmQgPj4gOCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbMV0gPSAoYnl0ZSkobWV2ZW50LlBpdGNoQmVuZCAmIDB4RkYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gU3lzZXhFdmVudDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludCBvZmZzZXQgPSBWYXJsZW5Ub0J5dGVzKG1ldmVudC5NZXRhbGVuZ3RoLCBidWYsIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgQXJyYXkuQ29weShtZXZlbnQuVmFsdWUsIDAsIGJ1Ziwgb2Zmc2V0LCBtZXZlbnQuVmFsdWUuTGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCBvZmZzZXQgKyBtZXZlbnQuVmFsdWUuTGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IFN5c2V4RXZlbnQyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnQgb2Zmc2V0ID0gVmFybGVuVG9CeXRlcyhtZXZlbnQuTWV0YWxlbmd0aCwgYnVmLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LkNvcHkobWV2ZW50LlZhbHVlLCAwLCBidWYsIG9mZnNldCwgbWV2ZW50LlZhbHVlLkxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgb2Zmc2V0ICsgbWV2ZW50LlZhbHVlLkxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBNZXRhRXZlbnQgJiYgbWV2ZW50Lk1ldGFldmVudCA9PSBNZXRhRXZlbnRUZW1wbykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gbWV2ZW50Lk1ldGFldmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlsxXSA9IDM7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbMl0gPSAoYnl0ZSkoKG1ldmVudC5UZW1wbyA+PiAxNikgJiAweEZGKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlszXSA9IChieXRlKSgobWV2ZW50LlRlbXBvID4+IDgpICYgMHhGRik7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbNF0gPSAoYnl0ZSkobWV2ZW50LlRlbXBvICYgMHhGRik7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgNSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBNZXRhRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IG1ldmVudC5NZXRhZXZlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnQgb2Zmc2V0ID0gVmFybGVuVG9CeXRlcyhtZXZlbnQuTWV0YWxlbmd0aCwgYnVmLCAxKSArIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBBcnJheS5Db3B5KG1ldmVudC5WYWx1ZSwgMCwgYnVmLCBvZmZzZXQsIG1ldmVudC5WYWx1ZS5MZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIG9mZnNldCArIG1ldmVudC5WYWx1ZS5MZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsZS5DbG9zZSgpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKElPRXhjZXB0aW9uIGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLyoqIENsb25lIHRoZSBsaXN0IG9mIE1pZGlFdmVudHMgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBMaXN0PE1pZGlFdmVudD5bXSBDbG9uZU1pZGlFdmVudHMoTGlzdDxNaWRpRXZlbnQ+W10gb3JpZ2xpc3QpIHtcbiAgICAgICAgTGlzdDxNaWRpRXZlbnQ+W10gbmV3bGlzdCA9IG5ldyBMaXN0PE1pZGlFdmVudD5bIG9yaWdsaXN0Lkxlbmd0aF07XG4gICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCBvcmlnbGlzdC5MZW5ndGg7IHRyYWNrbnVtKyspIHtcbiAgICAgICAgICAgIExpc3Q8TWlkaUV2ZW50PiBvcmlnZXZlbnRzID0gb3JpZ2xpc3RbdHJhY2tudW1dO1xuICAgICAgICAgICAgTGlzdDxNaWRpRXZlbnQ+IG5ld2V2ZW50cyA9IG5ldyBMaXN0PE1pZGlFdmVudD4ob3JpZ2V2ZW50cy5Db3VudCk7XG4gICAgICAgICAgICBuZXdsaXN0W3RyYWNrbnVtXSA9IG5ld2V2ZW50cztcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBtZXZlbnQgaW4gb3JpZ2V2ZW50cykge1xuICAgICAgICAgICAgICAgIG5ld2V2ZW50cy5BZGQoIG1ldmVudC5DbG9uZSgpICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ld2xpc3Q7XG4gICAgfVxuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBNaWRpIHRlbXBvIGV2ZW50LCB3aXRoIHRoZSBnaXZlbiB0ZW1wbyAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBNaWRpRXZlbnQgQ3JlYXRlVGVtcG9FdmVudChpbnQgdGVtcG8pIHtcbiAgICAgICAgTWlkaUV2ZW50IG1ldmVudCA9IG5ldyBNaWRpRXZlbnQoKTtcbiAgICAgICAgbWV2ZW50LkRlbHRhVGltZSA9IDA7XG4gICAgICAgIG1ldmVudC5TdGFydFRpbWUgPSAwO1xuICAgICAgICBtZXZlbnQuSGFzRXZlbnRmbGFnID0gdHJ1ZTtcbiAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IE1ldGFFdmVudDtcbiAgICAgICAgbWV2ZW50Lk1ldGFldmVudCA9IE1ldGFFdmVudFRlbXBvO1xuICAgICAgICBtZXZlbnQuTWV0YWxlbmd0aCA9IDM7XG4gICAgICAgIG1ldmVudC5UZW1wbyA9IHRlbXBvO1xuICAgICAgICByZXR1cm4gbWV2ZW50O1xuICAgIH1cblxuXG4gICAgLyoqIFNlYXJjaCB0aGUgZXZlbnRzIGZvciBhIENvbnRyb2xDaGFuZ2UgZXZlbnQgd2l0aCB0aGUgc2FtZVxuICAgICAqICBjaGFubmVsIGFuZCBjb250cm9sIG51bWJlci4gIElmIGEgbWF0Y2hpbmcgZXZlbnQgaXMgZm91bmQsXG4gICAgICogICB1cGRhdGUgdGhlIGNvbnRyb2wgdmFsdWUuICBFbHNlLCBhZGQgYSBuZXcgQ29udHJvbENoYW5nZSBldmVudC5cbiAgICAgKi8gXG4gICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBcbiAgICBVcGRhdGVDb250cm9sQ2hhbmdlKExpc3Q8TWlkaUV2ZW50PiBuZXdldmVudHMsIE1pZGlFdmVudCBjaGFuZ2VFdmVudCkge1xuICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbWV2ZW50IGluIG5ld2V2ZW50cykge1xuICAgICAgICAgICAgaWYgKChtZXZlbnQuRXZlbnRGbGFnID09IGNoYW5nZUV2ZW50LkV2ZW50RmxhZykgJiZcbiAgICAgICAgICAgICAgICAobWV2ZW50LkNoYW5uZWwgPT0gY2hhbmdlRXZlbnQuQ2hhbm5lbCkgJiZcbiAgICAgICAgICAgICAgICAobWV2ZW50LkNvbnRyb2xOdW0gPT0gY2hhbmdlRXZlbnQuQ29udHJvbE51bSkpIHtcblxuICAgICAgICAgICAgICAgIG1ldmVudC5Db250cm9sVmFsdWUgPSBjaGFuZ2VFdmVudC5Db250cm9sVmFsdWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG5ld2V2ZW50cy5BZGQoY2hhbmdlRXZlbnQpO1xuICAgIH1cblxuICAgIC8qKiBTdGFydCB0aGUgTWlkaSBtdXNpYyBhdCB0aGUgZ2l2ZW4gcGF1c2UgdGltZSAoaW4gcHVsc2VzKS5cbiAgICAgKiAgUmVtb3ZlIGFueSBOb3RlT24vTm90ZU9mZiBldmVudHMgdGhhdCBvY2N1ciBiZWZvcmUgdGhlIHBhdXNlIHRpbWUuXG4gICAgICogIEZvciBvdGhlciBldmVudHMsIGNoYW5nZSB0aGUgZGVsdGEtdGltZSB0byAwIGlmIHRoZXkgb2NjdXJcbiAgICAgKiAgYmVmb3JlIHRoZSBwYXVzZSB0aW1lLiAgUmV0dXJuIHRoZSBtb2RpZmllZCBNaWRpIEV2ZW50cy5cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBMaXN0PE1pZGlFdmVudD5bXSBcbiAgICBTdGFydEF0UGF1c2VUaW1lKExpc3Q8TWlkaUV2ZW50PltdIGxpc3QsIGludCBwYXVzZVRpbWUpIHtcbiAgICAgICAgTGlzdDxNaWRpRXZlbnQ+W10gbmV3bGlzdCA9IG5ldyBMaXN0PE1pZGlFdmVudD5bIGxpc3QuTGVuZ3RoXTtcbiAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IGxpc3QuTGVuZ3RoOyB0cmFja251bSsrKSB7XG4gICAgICAgICAgICBMaXN0PE1pZGlFdmVudD4gZXZlbnRzID0gbGlzdFt0cmFja251bV07XG4gICAgICAgICAgICBMaXN0PE1pZGlFdmVudD4gbmV3ZXZlbnRzID0gbmV3IExpc3Q8TWlkaUV2ZW50PihldmVudHMuQ291bnQpO1xuICAgICAgICAgICAgbmV3bGlzdFt0cmFja251bV0gPSBuZXdldmVudHM7XG5cbiAgICAgICAgICAgIGJvb2wgZm91bmRFdmVudEFmdGVyUGF1c2UgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBtZXZlbnQgaW4gZXZlbnRzKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAobWV2ZW50LlN0YXJ0VGltZSA8IHBhdXNlVGltZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudE5vdGVPbiB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudE5vdGVPZmYpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLyogU2tpcCBOb3RlT24vTm90ZU9mZiBldmVudCAqL1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnRDb250cm9sQ2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRGVsdGFUaW1lID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIFVwZGF0ZUNvbnRyb2xDaGFuZ2UobmV3ZXZlbnRzLCBtZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkRlbHRhVGltZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdldmVudHMuQWRkKG1ldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIWZvdW5kRXZlbnRBZnRlclBhdXNlKSB7XG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5EZWx0YVRpbWUgPSAobWV2ZW50LlN0YXJ0VGltZSAtIHBhdXNlVGltZSk7XG4gICAgICAgICAgICAgICAgICAgIG5ld2V2ZW50cy5BZGQobWV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgZm91bmRFdmVudEFmdGVyUGF1c2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3ZXZlbnRzLkFkZChtZXZlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3bGlzdDtcbiAgICB9XG5cblxuICAgIC8qKiBXcml0ZSB0aGlzIE1pZGkgZmlsZSB0byB0aGUgZ2l2ZW4gZmlsZW5hbWUuXG4gICAgICogSWYgb3B0aW9ucyBpcyBub3QgbnVsbCwgYXBwbHkgdGhvc2Ugb3B0aW9ucyB0byB0aGUgbWlkaSBldmVudHNcbiAgICAgKiBiZWZvcmUgcGVyZm9ybWluZyB0aGUgd3JpdGUuXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIGZpbGUgd2FzIHNhdmVkIHN1Y2Nlc3NmdWxseSwgZWxzZSBmYWxzZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgYm9vbCBDaGFuZ2VTb3VuZChzdHJpbmcgZGVzdGZpbGUsIE1pZGlPcHRpb25zIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIFdyaXRlKGRlc3RmaWxlLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYm9vbCBXcml0ZShzdHJpbmcgZGVzdGZpbGUsIE1pZGlPcHRpb25zIG9wdGlvbnMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIEZpbGVTdHJlYW0gc3RyZWFtO1xuICAgICAgICAgICAgc3RyZWFtID0gbmV3IEZpbGVTdHJlYW0oZGVzdGZpbGUsIEZpbGVNb2RlLkNyZWF0ZSk7XG4gICAgICAgICAgICBib29sIHJlc3VsdCA9IFdyaXRlKHN0cmVhbSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBzdHJlYW0uQ2xvc2UoKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKElPRXhjZXB0aW9uIGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBXcml0ZSB0aGlzIE1pZGkgZmlsZSB0byB0aGUgZ2l2ZW4gc3RyZWFtLlxuICAgICAqIElmIG9wdGlvbnMgaXMgbm90IG51bGwsIGFwcGx5IHRob3NlIG9wdGlvbnMgdG8gdGhlIG1pZGkgZXZlbnRzXG4gICAgICogYmVmb3JlIHBlcmZvcm1pbmcgdGhlIHdyaXRlLlxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSBmaWxlIHdhcyBzYXZlZCBzdWNjZXNzZnVsbHksIGVsc2UgZmFsc2UuXG4gICAgICovXG4gICAgcHVibGljIGJvb2wgV3JpdGUoU3RyZWFtIHN0cmVhbSwgTWlkaU9wdGlvbnMgb3B0aW9ucykge1xuICAgICAgICBMaXN0PE1pZGlFdmVudD5bXSBuZXdldmVudHMgPSBldmVudHM7XG4gICAgICAgIGlmIChvcHRpb25zICE9IG51bGwpIHtcbiAgICAgICAgICAgIG5ld2V2ZW50cyA9IEFwcGx5T3B0aW9uc1RvRXZlbnRzKG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBXcml0ZUV2ZW50cyhzdHJlYW0sIG5ld2V2ZW50cywgdHJhY2ttb2RlLCBxdWFydGVybm90ZSk7XG4gICAgfVxuXG5cbiAgICAvKiBBcHBseSB0aGUgZm9sbG93aW5nIHNvdW5kIG9wdGlvbnMgdG8gdGhlIG1pZGkgZXZlbnRzOlxuICAgICAqIC0gVGhlIHRlbXBvICh0aGUgbWljcm9zZWNvbmRzIHBlciBwdWxzZSlcbiAgICAgKiAtIFRoZSBpbnN0cnVtZW50cyBwZXIgdHJhY2tcbiAgICAgKiAtIFRoZSBub3RlIG51bWJlciAodHJhbnNwb3NlIHZhbHVlKVxuICAgICAqIC0gVGhlIHRyYWNrcyB0byBpbmNsdWRlXG4gICAgICogUmV0dXJuIHRoZSBtb2RpZmllZCBsaXN0IG9mIG1pZGkgZXZlbnRzLlxuICAgICAqL1xuICAgIHByaXZhdGUgTGlzdDxNaWRpRXZlbnQ+W11cbiAgICBBcHBseU9wdGlvbnNUb0V2ZW50cyhNaWRpT3B0aW9ucyBvcHRpb25zKSB7XG4gICAgICAgIGludCBpO1xuICAgICAgICBpZiAodHJhY2tQZXJDaGFubmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gQXBwbHlPcHRpb25zUGVyQ2hhbm5lbChvcHRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIEEgbWlkaWZpbGUgY2FuIGNvbnRhaW4gdHJhY2tzIHdpdGggbm90ZXMgYW5kIHRyYWNrcyB3aXRob3V0IG5vdGVzLlxuICAgICAgICAgKiBUaGUgb3B0aW9ucy50cmFja3MgYW5kIG9wdGlvbnMuaW5zdHJ1bWVudHMgYXJlIGZvciB0cmFja3Mgd2l0aCBub3Rlcy5cbiAgICAgICAgICogU28gdGhlIHRyYWNrIG51bWJlcnMgaW4gJ29wdGlvbnMnIG1heSBub3QgbWF0Y2ggY29ycmVjdGx5IGlmIHRoZVxuICAgICAgICAgKiBtaWRpIGZpbGUgaGFzIHRyYWNrcyB3aXRob3V0IG5vdGVzLiBSZS1jb21wdXRlIHRoZSBpbnN0cnVtZW50cywgYW5kIFxuICAgICAgICAgKiB0cmFja3MgdG8ga2VlcC5cbiAgICAgICAgICovXG4gICAgICAgIGludCBudW1fdHJhY2tzID0gZXZlbnRzLkxlbmd0aDtcbiAgICAgICAgaW50W10gaW5zdHJ1bWVudHMgPSBuZXcgaW50W251bV90cmFja3NdO1xuICAgICAgICBib29sW10ga2VlcHRyYWNrcyA9IG5ldyBib29sW251bV90cmFja3NdO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbnVtX3RyYWNrczsgaSsrKSB7XG4gICAgICAgICAgICBpbnN0cnVtZW50c1tpXSA9IDA7XG4gICAgICAgICAgICBrZWVwdHJhY2tzW2ldID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgdHJhY2tzLkNvdW50OyB0cmFja251bSsrKSB7XG4gICAgICAgICAgICBNaWRpVHJhY2sgdHJhY2sgPSB0cmFja3NbdHJhY2tudW1dO1xuICAgICAgICAgICAgaW50IHJlYWx0cmFjayA9IHRyYWNrLk51bWJlcjtcbiAgICAgICAgICAgIGluc3RydW1lbnRzW3JlYWx0cmFja10gPSBvcHRpb25zLmluc3RydW1lbnRzW3RyYWNrbnVtXTtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLm11dGVbdHJhY2tudW1dID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBrZWVwdHJhY2tzW3JlYWx0cmFja10gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIExpc3Q8TWlkaUV2ZW50PltdIG5ld2V2ZW50cyA9IENsb25lTWlkaUV2ZW50cyhldmVudHMpO1xuXG4gICAgICAgIC8qIFNldCB0aGUgdGVtcG8gYXQgdGhlIGJlZ2lubmluZyBvZiBlYWNoIHRyYWNrICovXG4gICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCBuZXdldmVudHMuTGVuZ3RoOyB0cmFja251bSsrKSB7XG4gICAgICAgICAgICBNaWRpRXZlbnQgbWV2ZW50ID0gQ3JlYXRlVGVtcG9FdmVudChvcHRpb25zLnRlbXBvKTtcbiAgICAgICAgICAgIG5ld2V2ZW50c1t0cmFja251bV0uSW5zZXJ0KDAsIG1ldmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBDaGFuZ2UgdGhlIG5vdGUgbnVtYmVyICh0cmFuc3Bvc2UpLCBpbnN0cnVtZW50LCBhbmQgdGVtcG8gKi9cbiAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IG5ld2V2ZW50cy5MZW5ndGg7IHRyYWNrbnVtKyspIHtcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBtZXZlbnQgaW4gbmV3ZXZlbnRzW3RyYWNrbnVtXSkge1xuICAgICAgICAgICAgICAgIGludCBudW0gPSBtZXZlbnQuTm90ZW51bWJlciArIG9wdGlvbnMudHJhbnNwb3NlO1xuICAgICAgICAgICAgICAgIGlmIChudW0gPCAwKVxuICAgICAgICAgICAgICAgICAgICBudW0gPSAwO1xuICAgICAgICAgICAgICAgIGlmIChudW0gPiAxMjcpXG4gICAgICAgICAgICAgICAgICAgIG51bSA9IDEyNztcbiAgICAgICAgICAgICAgICBtZXZlbnQuTm90ZW51bWJlciA9IChieXRlKW51bTtcbiAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbnMudXNlRGVmYXVsdEluc3RydW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5JbnN0cnVtZW50ID0gKGJ5dGUpaW5zdHJ1bWVudHNbdHJhY2tudW1dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtZXZlbnQuVGVtcG8gPSBvcHRpb25zLnRlbXBvO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMucGF1c2VUaW1lICE9IDApIHtcbiAgICAgICAgICAgIG5ld2V2ZW50cyA9IFN0YXJ0QXRQYXVzZVRpbWUobmV3ZXZlbnRzLCBvcHRpb25zLnBhdXNlVGltZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBDaGFuZ2UgdGhlIHRyYWNrcyB0byBpbmNsdWRlICovXG4gICAgICAgIGludCBjb3VudCA9IDA7XG4gICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCBrZWVwdHJhY2tzLkxlbmd0aDsgdHJhY2tudW0rKykge1xuICAgICAgICAgICAgaWYgKGtlZXB0cmFja3NbdHJhY2tudW1dKSB7XG4gICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBMaXN0PE1pZGlFdmVudD5bXSByZXN1bHQgPSBuZXcgTGlzdDxNaWRpRXZlbnQ+W2NvdW50XTtcbiAgICAgICAgaSA9IDA7XG4gICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCBrZWVwdHJhY2tzLkxlbmd0aDsgdHJhY2tudW0rKykge1xuICAgICAgICAgICAgaWYgKGtlZXB0cmFja3NbdHJhY2tudW1dKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2ldID0gbmV3ZXZlbnRzW3RyYWNrbnVtXTtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKiBBcHBseSB0aGUgZm9sbG93aW5nIHNvdW5kIG9wdGlvbnMgdG8gdGhlIG1pZGkgZXZlbnRzOlxuICAgICAqIC0gVGhlIHRlbXBvICh0aGUgbWljcm9zZWNvbmRzIHBlciBwdWxzZSlcbiAgICAgKiAtIFRoZSBpbnN0cnVtZW50cyBwZXIgdHJhY2tcbiAgICAgKiAtIFRoZSBub3RlIG51bWJlciAodHJhbnNwb3NlIHZhbHVlKVxuICAgICAqIC0gVGhlIHRyYWNrcyB0byBpbmNsdWRlXG4gICAgICogUmV0dXJuIHRoZSBtb2RpZmllZCBsaXN0IG9mIG1pZGkgZXZlbnRzLlxuICAgICAqXG4gICAgICogVGhpcyBNaWRpIGZpbGUgb25seSBoYXMgb25lIGFjdHVhbCB0cmFjaywgYnV0IHdlJ3ZlIHNwbGl0IHRoYXRcbiAgICAgKiBpbnRvIG11bHRpcGxlIGZha2UgdHJhY2tzLCBvbmUgcGVyIGNoYW5uZWwsIGFuZCBkaXNwbGF5ZWQgdGhhdFxuICAgICAqIHRvIHRoZSBlbmQtdXNlci4gIFNvIGNoYW5naW5nIHRoZSBpbnN0cnVtZW50LCBhbmQgdHJhY2tzIHRvXG4gICAgICogaW5jbHVkZSwgaXMgaW1wbGVtZW50ZWQgZGlmZmVyZW50bHkgdGhhbiBBcHBseU9wdGlvbnNUb0V2ZW50cygpLlxuICAgICAqXG4gICAgICogLSBXZSBjaGFuZ2UgdGhlIGluc3RydW1lbnQgYmFzZWQgb24gdGhlIGNoYW5uZWwsIG5vdCB0aGUgdHJhY2suXG4gICAgICogLSBXZSBpbmNsdWRlL2V4Y2x1ZGUgY2hhbm5lbHMsIG5vdCB0cmFja3MuXG4gICAgICogLSBXZSBleGNsdWRlIGEgY2hhbm5lbCBieSBzZXR0aW5nIHRoZSBub3RlIHZvbHVtZS92ZWxvY2l0eSB0byAwLlxuICAgICAqL1xuICAgIHByaXZhdGUgTGlzdDxNaWRpRXZlbnQ+W11cbiAgICBBcHBseU9wdGlvbnNQZXJDaGFubmVsKE1pZGlPcHRpb25zIG9wdGlvbnMpIHtcbiAgICAgICAgLyogRGV0ZXJtaW5lIHdoaWNoIGNoYW5uZWxzIHRvIGluY2x1ZGUvZXhjbHVkZS5cbiAgICAgICAgICogQWxzbywgZGV0ZXJtaW5lIHRoZSBpbnN0cnVtZW50cyBmb3IgZWFjaCBjaGFubmVsLlxuICAgICAgICAgKi9cbiAgICAgICAgaW50W10gaW5zdHJ1bWVudHMgPSBuZXcgaW50WzE2XTtcbiAgICAgICAgYm9vbFtdIGtlZXBjaGFubmVsID0gbmV3IGJvb2xbMTZdO1xuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDE2OyBpKyspIHtcbiAgICAgICAgICAgIGluc3RydW1lbnRzW2ldID0gMDtcbiAgICAgICAgICAgIGtlZXBjaGFubmVsW2ldID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgdHJhY2tzLkNvdW50OyB0cmFja251bSsrKSB7XG4gICAgICAgICAgICBNaWRpVHJhY2sgdHJhY2sgPSB0cmFja3NbdHJhY2tudW1dO1xuICAgICAgICAgICAgaW50IGNoYW5uZWwgPSB0cmFjay5Ob3Rlc1swXS5DaGFubmVsO1xuICAgICAgICAgICAgaW5zdHJ1bWVudHNbY2hhbm5lbF0gPSBvcHRpb25zLmluc3RydW1lbnRzW3RyYWNrbnVtXTtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLm11dGVbdHJhY2tudW1dID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBrZWVwY2hhbm5lbFtjaGFubmVsXSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBMaXN0PE1pZGlFdmVudD5bXSBuZXdldmVudHMgPSBDbG9uZU1pZGlFdmVudHMoZXZlbnRzKTtcblxuICAgICAgICAvKiBTZXQgdGhlIHRlbXBvIGF0IHRoZSBiZWdpbm5pbmcgb2YgZWFjaCB0cmFjayAqL1xuICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgbmV3ZXZlbnRzLkxlbmd0aDsgdHJhY2tudW0rKykge1xuICAgICAgICAgICAgTWlkaUV2ZW50IG1ldmVudCA9IENyZWF0ZVRlbXBvRXZlbnQob3B0aW9ucy50ZW1wbyk7XG4gICAgICAgICAgICBuZXdldmVudHNbdHJhY2tudW1dLkluc2VydCgwLCBtZXZlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogQ2hhbmdlIHRoZSBub3RlIG51bWJlciAodHJhbnNwb3NlKSwgaW5zdHJ1bWVudCwgYW5kIHRlbXBvICovXG4gICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCBuZXdldmVudHMuTGVuZ3RoOyB0cmFja251bSsrKSB7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbWV2ZW50IGluIG5ld2V2ZW50c1t0cmFja251bV0pIHtcbiAgICAgICAgICAgICAgICBpbnQgbnVtID0gbWV2ZW50Lk5vdGVudW1iZXIgKyBvcHRpb25zLnRyYW5zcG9zZTtcbiAgICAgICAgICAgICAgICBpZiAobnVtIDwgMClcbiAgICAgICAgICAgICAgICAgICAgbnVtID0gMDtcbiAgICAgICAgICAgICAgICBpZiAobnVtID4gMTI3KVxuICAgICAgICAgICAgICAgICAgICBudW0gPSAxMjc7XG4gICAgICAgICAgICAgICAgbWV2ZW50Lk5vdGVudW1iZXIgPSAoYnl0ZSludW07XG4gICAgICAgICAgICAgICAgaWYgKCFrZWVwY2hhbm5lbFttZXZlbnQuQ2hhbm5lbF0pIHtcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LlZlbG9jaXR5ID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFvcHRpb25zLnVzZURlZmF1bHRJbnN0cnVtZW50cykge1xuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuSW5zdHJ1bWVudCA9IChieXRlKWluc3RydW1lbnRzW21ldmVudC5DaGFubmVsXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbWV2ZW50LlRlbXBvID0gb3B0aW9ucy50ZW1wbztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9ucy5wYXVzZVRpbWUgIT0gMCkge1xuICAgICAgICAgICAgbmV3ZXZlbnRzID0gU3RhcnRBdFBhdXNlVGltZShuZXdldmVudHMsIG9wdGlvbnMucGF1c2VUaW1lKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3ZXZlbnRzO1xuICAgIH1cblxuXG4gICAgLyoqIEFwcGx5IHRoZSBnaXZlbiBzaGVldCBtdXNpYyBvcHRpb25zIHRvIHRoZSBNaWRpTm90ZXMuXG4gICAgICogIFJldHVybiB0aGUgbWlkaSB0cmFja3Mgd2l0aCB0aGUgY2hhbmdlcyBhcHBsaWVkLlxuICAgICAqL1xuICAgIHB1YmxpYyBMaXN0PE1pZGlUcmFjaz4gQ2hhbmdlTWlkaU5vdGVzKE1pZGlPcHRpb25zIG9wdGlvbnMpIHtcbiAgICAgICAgTGlzdDxNaWRpVHJhY2s+IG5ld3RyYWNrcyA9IG5ldyBMaXN0PE1pZGlUcmFjaz4oKTtcblxuICAgICAgICBmb3IgKGludCB0cmFjayA9IDA7IHRyYWNrIDwgdHJhY2tzLkNvdW50OyB0cmFjaysrKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy50cmFja3NbdHJhY2tdKSB7XG4gICAgICAgICAgICAgICAgbmV3dHJhY2tzLkFkZCh0cmFja3NbdHJhY2tdLkNsb25lKCkgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFRvIG1ha2UgdGhlIHNoZWV0IG11c2ljIGxvb2sgbmljZXIsIHdlIHJvdW5kIHRoZSBzdGFydCB0aW1lc1xuICAgICAgICAgKiBzbyB0aGF0IG5vdGVzIGNsb3NlIHRvZ2V0aGVyIGFwcGVhciBhcyBhIHNpbmdsZSBjaG9yZC4gIFdlXG4gICAgICAgICAqIGFsc28gZXh0ZW5kIHRoZSBub3RlIGR1cmF0aW9ucywgc28gdGhhdCB3ZSBoYXZlIGxvbmdlciBub3Rlc1xuICAgICAgICAgKiBhbmQgZmV3ZXIgcmVzdCBzeW1ib2xzLlxuICAgICAgICAgKi9cbiAgICAgICAgVGltZVNpZ25hdHVyZSB0aW1lID0gdGltZXNpZztcbiAgICAgICAgaWYgKG9wdGlvbnMudGltZSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aW1lID0gb3B0aW9ucy50aW1lO1xuICAgICAgICB9XG4gICAgICAgIE1pZGlGaWxlLlJvdW5kU3RhcnRUaW1lcyhuZXd0cmFja3MsIG9wdGlvbnMuY29tYmluZUludGVydmFsLCB0aW1lc2lnKTtcbiAgICAgICAgTWlkaUZpbGUuUm91bmREdXJhdGlvbnMobmV3dHJhY2tzLCB0aW1lLlF1YXJ0ZXIpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLnR3b1N0YWZmcykge1xuICAgICAgICAgICAgbmV3dHJhY2tzID0gTWlkaUZpbGUuQ29tYmluZVRvVHdvVHJhY2tzKG5ld3RyYWNrcywgdGltZXNpZy5NZWFzdXJlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9ucy5zaGlmdHRpbWUgIT0gMCkge1xuICAgICAgICAgICAgTWlkaUZpbGUuU2hpZnRUaW1lKG5ld3RyYWNrcywgb3B0aW9ucy5zaGlmdHRpbWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLnRyYW5zcG9zZSAhPSAwKSB7XG4gICAgICAgICAgICBNaWRpRmlsZS5UcmFuc3Bvc2UobmV3dHJhY2tzLCBvcHRpb25zLnRyYW5zcG9zZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3dHJhY2tzO1xuICAgIH1cblxuXG4gICAgLyoqIFNoaWZ0IHRoZSBzdGFydHRpbWUgb2YgdGhlIG5vdGVzIGJ5IHRoZSBnaXZlbiBhbW91bnQuXG4gICAgICogVGhpcyBpcyB1c2VkIGJ5IHRoZSBTaGlmdCBOb3RlcyBtZW51IHRvIHNoaWZ0IG5vdGVzIGxlZnQvcmlnaHQuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyB2b2lkXG4gICAgU2hpZnRUaW1lKExpc3Q8TWlkaVRyYWNrPiB0cmFja3MsIGludCBhbW91bnQpXG4gICAge1xuICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKSB7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrLk5vdGVzKSB7XG4gICAgICAgICAgICAgICAgbm90ZS5TdGFydFRpbWUgKz0gYW1vdW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFNoaWZ0IHRoZSBub3RlIGtleXMgdXAvZG93biBieSB0aGUgZ2l2ZW4gYW1vdW50ICovXG4gICAgcHVibGljIHN0YXRpYyB2b2lkXG4gICAgVHJhbnNwb3NlKExpc3Q8TWlkaVRyYWNrPiB0cmFja3MsIGludCBhbW91bnQpXG4gICAge1xuICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKSB7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrLk5vdGVzKSB7XG4gICAgICAgICAgICAgICAgbm90ZS5OdW1iZXIgKz0gYW1vdW50O1xuICAgICAgICAgICAgICAgIGlmIChub3RlLk51bWJlciA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbm90ZS5OdW1iZXIgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgXG4gICAgLyogRmluZCB0aGUgaGlnaGVzdCBhbmQgbG93ZXN0IG5vdGVzIHRoYXQgb3ZlcmxhcCB0aGlzIGludGVydmFsIChzdGFydHRpbWUgdG8gZW5kdGltZSkuXG4gICAgICogVGhpcyBtZXRob2QgaXMgdXNlZCBieSBTcGxpdFRyYWNrIHRvIGRldGVybWluZSB3aGljaCBzdGFmZiAodG9wIG9yIGJvdHRvbSkgYSBub3RlXG4gICAgICogc2hvdWxkIGdvIHRvLlxuICAgICAqXG4gICAgICogRm9yIG1vcmUgYWNjdXJhdGUgU3BsaXRUcmFjaygpIHJlc3VsdHMsIHdlIGxpbWl0IHRoZSBpbnRlcnZhbC9kdXJhdGlvbiBvZiB0aGlzIG5vdGUgXG4gICAgICogKGFuZCBvdGhlciBub3RlcykgdG8gb25lIG1lYXN1cmUuIFdlIGNhcmUgb25seSBhYm91dCBoaWdoL2xvdyBub3RlcyB0aGF0IGFyZVxuICAgICAqIHJlYXNvbmFibHkgY2xvc2UgdG8gdGhpcyBub3RlLlxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIHZvaWRcbiAgICBGaW5kSGlnaExvd05vdGVzKExpc3Q8TWlkaU5vdGU+IG5vdGVzLCBpbnQgbWVhc3VyZWxlbiwgaW50IHN0YXJ0aW5kZXgsIFxuICAgICAgICAgICAgICAgICAgICAgaW50IHN0YXJ0dGltZSwgaW50IGVuZHRpbWUsIHJlZiBpbnQgaGlnaCwgcmVmIGludCBsb3cpIHtcblxuICAgICAgICBpbnQgaSA9IHN0YXJ0aW5kZXg7XG4gICAgICAgIGlmIChzdGFydHRpbWUgKyBtZWFzdXJlbGVuIDwgZW5kdGltZSkge1xuICAgICAgICAgICAgZW5kdGltZSA9IHN0YXJ0dGltZSArIG1lYXN1cmVsZW47XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoaSA8IG5vdGVzLkNvdW50ICYmIG5vdGVzW2ldLlN0YXJ0VGltZSA8IGVuZHRpbWUpIHtcbiAgICAgICAgICAgIGlmIChub3Rlc1tpXS5FbmRUaW1lIDwgc3RhcnR0aW1lKSB7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5vdGVzW2ldLlN0YXJ0VGltZSArIG1lYXN1cmVsZW4gPCBzdGFydHRpbWUpIHtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaGlnaCA8IG5vdGVzW2ldLk51bWJlcikge1xuICAgICAgICAgICAgICAgIGhpZ2ggPSBub3Rlc1tpXS5OdW1iZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobG93ID4gbm90ZXNbaV0uTnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgbG93ID0gbm90ZXNbaV0uTnVtYmVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyogRmluZCB0aGUgaGlnaGVzdCBhbmQgbG93ZXN0IG5vdGVzIHRoYXQgc3RhcnQgYXQgdGhpcyBleGFjdCBzdGFydCB0aW1lICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgdm9pZFxuICAgIEZpbmRFeGFjdEhpZ2hMb3dOb3RlcyhMaXN0PE1pZGlOb3RlPiBub3RlcywgaW50IHN0YXJ0aW5kZXgsIGludCBzdGFydHRpbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJlZiBpbnQgaGlnaCwgcmVmIGludCBsb3cpIHtcblxuICAgICAgICBpbnQgaSA9IHN0YXJ0aW5kZXg7XG5cbiAgICAgICAgd2hpbGUgKG5vdGVzW2ldLlN0YXJ0VGltZSA8IHN0YXJ0dGltZSkge1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKGkgPCBub3Rlcy5Db3VudCAmJiBub3Rlc1tpXS5TdGFydFRpbWUgPT0gc3RhcnR0aW1lKSB7XG4gICAgICAgICAgICBpZiAoaGlnaCA8IG5vdGVzW2ldLk51bWJlcikge1xuICAgICAgICAgICAgICAgIGhpZ2ggPSBub3Rlc1tpXS5OdW1iZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobG93ID4gbm90ZXNbaV0uTnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgbG93ID0gbm90ZXNbaV0uTnVtYmVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiBcbiAgICAvKiBTcGxpdCB0aGUgZ2l2ZW4gTWlkaVRyYWNrIGludG8gdHdvIHRyYWNrcywgdG9wIGFuZCBib3R0b20uXG4gICAgICogVGhlIGhpZ2hlc3Qgbm90ZXMgd2lsbCBnbyBpbnRvIHRvcCwgdGhlIGxvd2VzdCBpbnRvIGJvdHRvbS5cbiAgICAgKiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gc3BsaXQgcGlhbm8gc29uZ3MgaW50byBsZWZ0LWhhbmQgKGJvdHRvbSlcbiAgICAgKiBhbmQgcmlnaHQtaGFuZCAodG9wKSB0cmFja3MuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBMaXN0PE1pZGlUcmFjaz4gU3BsaXRUcmFjayhNaWRpVHJhY2sgdHJhY2ssIGludCBtZWFzdXJlbGVuKSB7XG4gICAgICAgIExpc3Q8TWlkaU5vdGU+IG5vdGVzID0gdHJhY2suTm90ZXM7XG4gICAgICAgIGludCBjb3VudCA9IG5vdGVzLkNvdW50O1xuXG4gICAgICAgIE1pZGlUcmFjayB0b3AgPSBuZXcgTWlkaVRyYWNrKDEpO1xuICAgICAgICBNaWRpVHJhY2sgYm90dG9tID0gbmV3IE1pZGlUcmFjaygyKTtcbiAgICAgICAgTGlzdDxNaWRpVHJhY2s+IHJlc3VsdCA9IG5ldyBMaXN0PE1pZGlUcmFjaz4oMik7XG4gICAgICAgIHJlc3VsdC5BZGQodG9wKTsgcmVzdWx0LkFkZChib3R0b20pO1xuXG4gICAgICAgIGlmIChjb3VudCA9PSAwKVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcblxuICAgICAgICBpbnQgcHJldmhpZ2ggID0gNzY7IC8qIEU1LCB0b3Agb2YgdHJlYmxlIHN0YWZmICovXG4gICAgICAgIGludCBwcmV2bG93ICAgPSA0NTsgLyogQTMsIGJvdHRvbSBvZiBiYXNzIHN0YWZmICovXG4gICAgICAgIGludCBzdGFydGluZGV4ID0gMDtcblxuICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIG5vdGVzKSB7XG4gICAgICAgICAgICBpbnQgaGlnaCwgbG93LCBoaWdoRXhhY3QsIGxvd0V4YWN0O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpbnQgbnVtYmVyID0gbm90ZS5OdW1iZXI7XG4gICAgICAgICAgICBoaWdoID0gbG93ID0gaGlnaEV4YWN0ID0gbG93RXhhY3QgPSBudW1iZXI7XG5cbiAgICAgICAgICAgIHdoaWxlIChub3Rlc1tzdGFydGluZGV4XS5FbmRUaW1lIDwgbm90ZS5TdGFydFRpbWUpIHtcbiAgICAgICAgICAgICAgICBzdGFydGluZGV4Kys7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIEkndmUgdHJpZWQgc2V2ZXJhbCBhbGdvcml0aG1zIGZvciBzcGxpdHRpbmcgYSB0cmFjayBpbiB0d28sXG4gICAgICAgICAgICAgKiBhbmQgdGhlIG9uZSBiZWxvdyBzZWVtcyB0byB3b3JrIHRoZSBiZXN0OlxuICAgICAgICAgICAgICogLSBJZiB0aGlzIG5vdGUgaXMgbW9yZSB0aGFuIGFuIG9jdGF2ZSBmcm9tIHRoZSBoaWdoL2xvdyBub3Rlc1xuICAgICAgICAgICAgICogICAodGhhdCBzdGFydCBleGFjdGx5IGF0IHRoaXMgc3RhcnQgdGltZSksIGNob29zZSB0aGUgY2xvc2VzdCBvbmUuXG4gICAgICAgICAgICAgKiAtIElmIHRoaXMgbm90ZSBpcyBtb3JlIHRoYW4gYW4gb2N0YXZlIGZyb20gdGhlIGhpZ2gvbG93IG5vdGVzXG4gICAgICAgICAgICAgKiAgIChpbiB0aGlzIG5vdGUncyB0aW1lIGR1cmF0aW9uKSwgY2hvb3NlIHRoZSBjbG9zZXN0IG9uZS5cbiAgICAgICAgICAgICAqIC0gSWYgdGhlIGhpZ2ggYW5kIGxvdyBub3RlcyAodGhhdCBzdGFydCBleGFjdGx5IGF0IHRoaXMgc3RhcnR0aW1lKVxuICAgICAgICAgICAgICogICBhcmUgbW9yZSB0aGFuIGFuIG9jdGF2ZSBhcGFydCwgY2hvb3NlIHRoZSBjbG9zZXN0IG5vdGUuXG4gICAgICAgICAgICAgKiAtIElmIHRoZSBoaWdoIGFuZCBsb3cgbm90ZXMgKHRoYXQgb3ZlcmxhcCB0aGlzIHN0YXJ0dGltZSlcbiAgICAgICAgICAgICAqICAgYXJlIG1vcmUgdGhhbiBhbiBvY3RhdmUgYXBhcnQsIGNob29zZSB0aGUgY2xvc2VzdCBub3RlLlxuICAgICAgICAgICAgICogLSBFbHNlLCBsb29rIGF0IHRoZSBwcmV2aW91cyBoaWdoL2xvdyBub3RlcyB0aGF0IHdlcmUgbW9yZSB0aGFuIGFuIFxuICAgICAgICAgICAgICogICBvY3RhdmUgYXBhcnQuICBDaG9vc2UgdGhlIGNsb3Nlc2V0IG5vdGUuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIEZpbmRIaWdoTG93Tm90ZXMobm90ZXMsIG1lYXN1cmVsZW4sIHN0YXJ0aW5kZXgsIG5vdGUuU3RhcnRUaW1lLCBub3RlLkVuZFRpbWUsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWYgaGlnaCwgcmVmIGxvdyk7XG4gICAgICAgICAgICBGaW5kRXhhY3RIaWdoTG93Tm90ZXMobm90ZXMsIHN0YXJ0aW5kZXgsIG5vdGUuU3RhcnRUaW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZiBoaWdoRXhhY3QsIHJlZiBsb3dFeGFjdCk7XG5cbiAgICAgICAgICAgIGlmIChoaWdoRXhhY3QgLSBudW1iZXIgPiAxMiB8fCBudW1iZXIgLSBsb3dFeGFjdCA+IDEyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGhpZ2hFeGFjdCAtIG51bWJlciA8PSBudW1iZXIgLSBsb3dFeGFjdCkge1xuICAgICAgICAgICAgICAgICAgICB0b3AuQWRkTm90ZShub3RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJvdHRvbS5BZGROb3RlKG5vdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gXG4gICAgICAgICAgICBlbHNlIGlmIChoaWdoIC0gbnVtYmVyID4gMTIgfHwgbnVtYmVyIC0gbG93ID4gMTIpIHtcbiAgICAgICAgICAgICAgICBpZiAoaGlnaCAtIG51bWJlciA8PSBudW1iZXIgLSBsb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9wLkFkZE5vdGUobm90ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBib3R0b20uQWRkTm90ZShub3RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IFxuICAgICAgICAgICAgZWxzZSBpZiAoaGlnaEV4YWN0IC0gbG93RXhhY3QgPiAxMikge1xuICAgICAgICAgICAgICAgIGlmIChoaWdoRXhhY3QgLSBudW1iZXIgPD0gbnVtYmVyIC0gbG93RXhhY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9wLkFkZE5vdGUobm90ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBib3R0b20uQWRkTm90ZShub3RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChoaWdoIC0gbG93ID4gMTIpIHtcbiAgICAgICAgICAgICAgICBpZiAoaGlnaCAtIG51bWJlciA8PSBudW1iZXIgLSBsb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9wLkFkZE5vdGUobm90ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBib3R0b20uQWRkTm90ZShub3RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAocHJldmhpZ2ggLSBudW1iZXIgPD0gbnVtYmVyIC0gcHJldmxvdykge1xuICAgICAgICAgICAgICAgICAgICB0b3AuQWRkTm90ZShub3RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJvdHRvbS5BZGROb3RlKG5vdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogVGhlIHByZXZoaWdoL3ByZXZsb3cgYXJlIHNldCB0byB0aGUgbGFzdCBoaWdoL2xvd1xuICAgICAgICAgICAgICogdGhhdCBhcmUgbW9yZSB0aGFuIGFuIG9jdGF2ZSBhcGFydC5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYgKGhpZ2ggLSBsb3cgPiAxMikge1xuICAgICAgICAgICAgICAgIHByZXZoaWdoID0gaGlnaDtcbiAgICAgICAgICAgICAgICBwcmV2bG93ID0gbG93O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdG9wLk5vdGVzLlNvcnQodHJhY2suTm90ZXNbMF0pO1xuICAgICAgICBib3R0b20uTm90ZXMuU29ydCh0cmFjay5Ob3Rlc1swXSk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cblxuICAgIC8qKiBDb21iaW5lIHRoZSBub3RlcyBpbiB0aGUgZ2l2ZW4gdHJhY2tzIGludG8gYSBzaW5nbGUgTWlkaVRyYWNrLiBcbiAgICAgKiAgVGhlIGluZGl2aWR1YWwgdHJhY2tzIGFyZSBhbHJlYWR5IHNvcnRlZC4gIFRvIG1lcmdlIHRoZW0sIHdlXG4gICAgICogIHVzZSBhIG1lcmdlc29ydC1saWtlIGFsZ29yaXRobS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIE1pZGlUcmFjayBDb21iaW5lVG9TaW5nbGVUcmFjayhMaXN0PE1pZGlUcmFjaz4gdHJhY2tzKVxuICAgIHtcbiAgICAgICAgLyogQWRkIGFsbCBub3RlcyBpbnRvIG9uZSB0cmFjayAqL1xuICAgICAgICBNaWRpVHJhY2sgcmVzdWx0ID0gbmV3IE1pZGlUcmFjaygxKTtcblxuICAgICAgICBpZiAodHJhY2tzLkNvdW50ID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHJhY2tzLkNvdW50ID09IDEpIHtcbiAgICAgICAgICAgIE1pZGlUcmFjayB0cmFjayA9IHRyYWNrc1swXTtcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG5vdGUgaW4gdHJhY2suTm90ZXMpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQuQWRkTm90ZShub3RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICBpbnRbXSBub3RlaW5kZXggPSBuZXcgaW50WzY0XTtcbiAgICAgICAgaW50W10gbm90ZWNvdW50ID0gbmV3IGludFs2NF07XG5cbiAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IHRyYWNrcy5Db3VudDsgdHJhY2tudW0rKykge1xuICAgICAgICAgICAgbm90ZWluZGV4W3RyYWNrbnVtXSA9IDA7XG4gICAgICAgICAgICBub3RlY291bnRbdHJhY2tudW1dID0gdHJhY2tzW3RyYWNrbnVtXS5Ob3Rlcy5Db3VudDtcbiAgICAgICAgfVxuICAgICAgICBNaWRpTm90ZSBwcmV2bm90ZSA9IG51bGw7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBNaWRpTm90ZSBsb3dlc3Rub3RlID0gbnVsbDtcbiAgICAgICAgICAgIGludCBsb3dlc3RUcmFjayA9IC0xO1xuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IHRyYWNrcy5Db3VudDsgdHJhY2tudW0rKykge1xuICAgICAgICAgICAgICAgIE1pZGlUcmFjayB0cmFjayA9IHRyYWNrc1t0cmFja251bV07XG4gICAgICAgICAgICAgICAgaWYgKG5vdGVpbmRleFt0cmFja251bV0gPj0gbm90ZWNvdW50W3RyYWNrbnVtXSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgTWlkaU5vdGUgbm90ZSA9IHRyYWNrLk5vdGVzWyBub3RlaW5kZXhbdHJhY2tudW1dIF07XG4gICAgICAgICAgICAgICAgaWYgKGxvd2VzdG5vdGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBsb3dlc3Rub3RlID0gbm90ZTtcbiAgICAgICAgICAgICAgICAgICAgbG93ZXN0VHJhY2sgPSB0cmFja251bTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobm90ZS5TdGFydFRpbWUgPCBsb3dlc3Rub3RlLlN0YXJ0VGltZSkge1xuICAgICAgICAgICAgICAgICAgICBsb3dlc3Rub3RlID0gbm90ZTtcbiAgICAgICAgICAgICAgICAgICAgbG93ZXN0VHJhY2sgPSB0cmFja251bTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobm90ZS5TdGFydFRpbWUgPT0gbG93ZXN0bm90ZS5TdGFydFRpbWUgJiYgbm90ZS5OdW1iZXIgPCBsb3dlc3Rub3RlLk51bWJlcikge1xuICAgICAgICAgICAgICAgICAgICBsb3dlc3Rub3RlID0gbm90ZTtcbiAgICAgICAgICAgICAgICAgICAgbG93ZXN0VHJhY2sgPSB0cmFja251bTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobG93ZXN0bm90ZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLyogV2UndmUgZmluaXNoZWQgdGhlIG1lcmdlICovXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBub3RlaW5kZXhbbG93ZXN0VHJhY2tdKys7XG4gICAgICAgICAgICBpZiAoKHByZXZub3RlICE9IG51bGwpICYmIChwcmV2bm90ZS5TdGFydFRpbWUgPT0gbG93ZXN0bm90ZS5TdGFydFRpbWUpICYmXG4gICAgICAgICAgICAgICAgKHByZXZub3RlLk51bWJlciA9PSBsb3dlc3Rub3RlLk51bWJlcikgKSB7XG5cbiAgICAgICAgICAgICAgICAvKiBEb24ndCBhZGQgZHVwbGljYXRlIG5vdGVzLCB3aXRoIHRoZSBzYW1lIHN0YXJ0IHRpbWUgYW5kIG51bWJlciAqLyAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKGxvd2VzdG5vdGUuRHVyYXRpb24gPiBwcmV2bm90ZS5EdXJhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBwcmV2bm90ZS5EdXJhdGlvbiA9IGxvd2VzdG5vdGUuRHVyYXRpb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LkFkZE5vdGUobG93ZXN0bm90ZSk7XG4gICAgICAgICAgICAgICAgcHJldm5vdGUgPSBsb3dlc3Rub3RlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG5cbiAgICAvKiogQ29tYmluZSB0aGUgbm90ZXMgaW4gYWxsIHRoZSB0cmFja3MgZ2l2ZW4gaW50byB0d28gTWlkaVRyYWNrcyxcbiAgICAgKiBhbmQgcmV0dXJuIHRoZW0uXG4gICAgICogXG4gICAgICogVGhpcyBmdW5jdGlvbiBpcyBpbnRlbmRlZCBmb3IgcGlhbm8gc29uZ3MsIHdoZW4gd2Ugd2FudCB0byBkaXNwbGF5XG4gICAgICogYSBsZWZ0LWhhbmQgdHJhY2sgYW5kIGEgcmlnaHQtaGFuZCB0cmFjay4gIFRoZSBsb3dlciBub3RlcyBnbyBpbnRvIFxuICAgICAqIHRoZSBsZWZ0LWhhbmQgdHJhY2ssIGFuZCB0aGUgaGlnaGVyIG5vdGVzIGdvIGludG8gdGhlIHJpZ2h0IGhhbmQgXG4gICAgICogdHJhY2suXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBMaXN0PE1pZGlUcmFjaz4gQ29tYmluZVRvVHdvVHJhY2tzKExpc3Q8TWlkaVRyYWNrPiB0cmFja3MsIGludCBtZWFzdXJlbGVuKVxuICAgIHtcbiAgICAgICAgTWlkaVRyYWNrIHNpbmdsZSA9IENvbWJpbmVUb1NpbmdsZVRyYWNrKHRyYWNrcyk7XG4gICAgICAgIExpc3Q8TWlkaVRyYWNrPiByZXN1bHQgPSBTcGxpdFRyYWNrKHNpbmdsZSwgbWVhc3VyZWxlbik7XG5cbiAgICAgICAgTGlzdDxNaWRpRXZlbnQ+IGx5cmljcyA9IG5ldyBMaXN0PE1pZGlFdmVudD4oKTtcbiAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcykge1xuICAgICAgICAgICAgaWYgKHRyYWNrLkx5cmljcyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbHlyaWNzLkFkZFJhbmdlKHRyYWNrLkx5cmljcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGx5cmljcy5Db3VudCA+IDApIHtcbiAgICAgICAgICAgIGx5cmljcy5Tb3J0KGx5cmljc1swXSk7XG4gICAgICAgICAgICByZXN1bHRbMF0uTHlyaWNzID0gbHlyaWNzO1xuICAgICAgICB9IFxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG5cbiAgICAvKiogQ2hlY2sgdGhhdCB0aGUgTWlkaU5vdGUgc3RhcnQgdGltZXMgYXJlIGluIGluY3JlYXNpbmcgb3JkZXIuXG4gICAgICogVGhpcyBpcyBmb3IgZGVidWdnaW5nIHB1cnBvc2VzLlxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIHZvaWQgQ2hlY2tTdGFydFRpbWVzKExpc3Q8TWlkaVRyYWNrPiB0cmFja3MpIHtcbiAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcykge1xuICAgICAgICAgICAgaW50IHByZXZ0aW1lID0gLTE7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrLk5vdGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vdGUuU3RhcnRUaW1lIDwgcHJldnRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5c3RlbS5Bcmd1bWVudEV4Y2VwdGlvbihcInN0YXJ0IHRpbWVzIG5vdCBpbiBpbmNyZWFzaW5nIG9yZGVyXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwcmV2dGltZSA9IG5vdGUuU3RhcnRUaW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKiogSW4gTWlkaSBGaWxlcywgdGltZSBpcyBtZWFzdXJlZCBpbiBwdWxzZXMuICBOb3RlcyB0aGF0IGhhdmVcbiAgICAgKiBwdWxzZSB0aW1lcyB0aGF0IGFyZSBjbG9zZSB0b2dldGhlciAobGlrZSB3aXRoaW4gMTAgcHVsc2VzKVxuICAgICAqIHdpbGwgc291bmQgbGlrZSB0aGV5J3JlIHRoZSBzYW1lIGNob3JkLiAgV2Ugd2FudCB0byBkcmF3XG4gICAgICogdGhlc2Ugbm90ZXMgYXMgYSBzaW5nbGUgY2hvcmQsIGl0IG1ha2VzIHRoZSBzaGVldCBtdXNpYyBtdWNoXG4gICAgICogZWFzaWVyIHRvIHJlYWQuICBXZSBkb24ndCB3YW50IHRvIGRyYXcgbm90ZXMgdGhhdCBhcmUgY2xvc2VcbiAgICAgKiB0b2dldGhlciBhcyB0d28gc2VwYXJhdGUgY2hvcmRzLlxuICAgICAqXG4gICAgICogVGhlIFN5bWJvbFNwYWNpbmcgY2xhc3Mgb25seSBhbGlnbnMgbm90ZXMgdGhhdCBoYXZlIGV4YWN0bHkgdGhlIHNhbWVcbiAgICAgKiBzdGFydCB0aW1lcy4gIE5vdGVzIHdpdGggc2xpZ2h0bHkgZGlmZmVyZW50IHN0YXJ0IHRpbWVzIHdpbGxcbiAgICAgKiBhcHBlYXIgaW4gc2VwYXJhdGUgdmVydGljYWwgY29sdW1ucy4gIFRoaXMgaXNuJ3Qgd2hhdCB3ZSB3YW50LlxuICAgICAqIFdlIHdhbnQgdG8gYWxpZ24gbm90ZXMgd2l0aCBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIHN0YXJ0IHRpbWVzLlxuICAgICAqIFNvLCB0aGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gYXNzaWduIHRoZSBzYW1lIHN0YXJ0dGltZSBmb3Igbm90ZXNcbiAgICAgKiB0aGF0IGFyZSBjbG9zZSB0b2dldGhlciAodGltZXdpc2UpLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgdm9pZFxuICAgIFJvdW5kU3RhcnRUaW1lcyhMaXN0PE1pZGlUcmFjaz4gdHJhY2tzLCBpbnQgbWlsbGlzZWMsIFRpbWVTaWduYXR1cmUgdGltZSkge1xuICAgICAgICAvKiBHZXQgYWxsIHRoZSBzdGFydHRpbWVzIGluIGFsbCB0cmFja3MsIGluIHNvcnRlZCBvcmRlciAqL1xuICAgICAgICBMaXN0PGludD4gc3RhcnR0aW1lcyA9IG5ldyBMaXN0PGludD4oKTtcbiAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcykge1xuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiB0cmFjay5Ob3Rlcykge1xuICAgICAgICAgICAgICAgIHN0YXJ0dGltZXMuQWRkKCBub3RlLlN0YXJ0VGltZSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN0YXJ0dGltZXMuU29ydCgpO1xuXG4gICAgICAgIC8qIE5vdGVzIHdpdGhpbiBcIm1pbGxpc2VjXCIgbWlsbGlzZWNvbmRzIGFwYXJ0IHdpbGwgYmUgY29tYmluZWQuICovXG4gICAgICAgIGludCBpbnRlcnZhbCA9IHRpbWUuUXVhcnRlciAqIG1pbGxpc2VjICogMTAwMCAvIHRpbWUuVGVtcG87XG5cbiAgICAgICAgLyogSWYgdHdvIHN0YXJ0dGltZXMgYXJlIHdpdGhpbiBpbnRlcnZhbCBtaWxsaXNlYywgbWFrZSB0aGVtIHRoZSBzYW1lICovXG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgc3RhcnR0aW1lcy5Db3VudCAtIDE7IGkrKykge1xuICAgICAgICAgICAgaWYgKHN0YXJ0dGltZXNbaSsxXSAtIHN0YXJ0dGltZXNbaV0gPD0gaW50ZXJ2YWwpIHtcbiAgICAgICAgICAgICAgICBzdGFydHRpbWVzW2krMV0gPSBzdGFydHRpbWVzW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgQ2hlY2tTdGFydFRpbWVzKHRyYWNrcyk7XG5cbiAgICAgICAgLyogQWRqdXN0IHRoZSBub3RlIHN0YXJ0dGltZXMsIHNvIHRoYXQgaXQgbWF0Y2hlcyBvbmUgb2YgdGhlIHN0YXJ0dGltZXMgdmFsdWVzICovXG4gICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpIHtcbiAgICAgICAgICAgIGludCBpID0gMDtcblxuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiB0cmFjay5Ob3Rlcykge1xuICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgc3RhcnR0aW1lcy5Db3VudCAmJlxuICAgICAgICAgICAgICAgICAgICAgICBub3RlLlN0YXJ0VGltZSAtIGludGVydmFsID4gc3RhcnR0aW1lc1tpXSkge1xuICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKG5vdGUuU3RhcnRUaW1lID4gc3RhcnR0aW1lc1tpXSAmJlxuICAgICAgICAgICAgICAgICAgICBub3RlLlN0YXJ0VGltZSAtIHN0YXJ0dGltZXNbaV0gPD0gaW50ZXJ2YWwpIHtcblxuICAgICAgICAgICAgICAgICAgICBub3RlLlN0YXJ0VGltZSA9IHN0YXJ0dGltZXNbaV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJhY2suTm90ZXMuU29ydCh0cmFjay5Ob3Rlc1swXSk7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIC8qKiBXZSB3YW50IG5vdGUgZHVyYXRpb25zIHRvIHNwYW4gdXAgdG8gdGhlIG5leHQgbm90ZSBpbiBnZW5lcmFsLlxuICAgICAqIFRoZSBzaGVldCBtdXNpYyBsb29rcyBuaWNlciB0aGF0IHdheS4gIEluIGNvbnRyYXN0LCBzaGVldCBtdXNpY1xuICAgICAqIHdpdGggbG90cyBvZiAxNnRoLzMybmQgbm90ZXMgc2VwYXJhdGVkIGJ5IHNtYWxsIHJlc3RzIGRvZXNuJ3RcbiAgICAgKiBsb29rIGFzIG5pY2UuICBIYXZpbmcgbmljZSBsb29raW5nIHNoZWV0IG11c2ljIGlzIG1vcmUgaW1wb3J0YW50XG4gICAgICogdGhhbiBmYWl0aGZ1bGx5IHJlcHJlc2VudGluZyB0aGUgTWlkaSBGaWxlIGRhdGEuXG4gICAgICpcbiAgICAgKiBUaGVyZWZvcmUsIHRoaXMgZnVuY3Rpb24gcm91bmRzIHRoZSBkdXJhdGlvbiBvZiBNaWRpTm90ZXMgdXAgdG9cbiAgICAgKiB0aGUgbmV4dCBub3RlIHdoZXJlIHBvc3NpYmxlLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgdm9pZFxuICAgIFJvdW5kRHVyYXRpb25zKExpc3Q8TWlkaVRyYWNrPiB0cmFja3MsIGludCBxdWFydGVybm90ZSkge1xuXG4gICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MgKSB7XG4gICAgICAgICAgICBNaWRpTm90ZSBwcmV2Tm90ZSA9IG51bGw7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHRyYWNrLk5vdGVzLkNvdW50LTE7IGkrKykge1xuICAgICAgICAgICAgICAgIE1pZGlOb3RlIG5vdGUxID0gdHJhY2suTm90ZXNbaV07XG4gICAgICAgICAgICAgICAgaWYgKHByZXZOb3RlID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJldk5vdGUgPSBub3RlMTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvKiBHZXQgdGhlIG5leHQgbm90ZSB0aGF0IGhhcyBhIGRpZmZlcmVudCBzdGFydCB0aW1lICovXG4gICAgICAgICAgICAgICAgTWlkaU5vdGUgbm90ZTIgPSBub3RlMTtcbiAgICAgICAgICAgICAgICBmb3IgKGludCBqID0gaSsxOyBqIDwgdHJhY2suTm90ZXMuQ291bnQ7IGorKykge1xuICAgICAgICAgICAgICAgICAgICBub3RlMiA9IHRyYWNrLk5vdGVzW2pdO1xuICAgICAgICAgICAgICAgICAgICBpZiAobm90ZTEuU3RhcnRUaW1lIDwgbm90ZTIuU3RhcnRUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbnQgbWF4ZHVyYXRpb24gPSBub3RlMi5TdGFydFRpbWUgLSBub3RlMS5TdGFydFRpbWU7XG5cbiAgICAgICAgICAgICAgICBpbnQgZHVyID0gMDtcbiAgICAgICAgICAgICAgICBpZiAocXVhcnRlcm5vdGUgPD0gbWF4ZHVyYXRpb24pXG4gICAgICAgICAgICAgICAgICAgIGR1ciA9IHF1YXJ0ZXJub3RlO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHF1YXJ0ZXJub3RlLzIgPD0gbWF4ZHVyYXRpb24pXG4gICAgICAgICAgICAgICAgICAgIGR1ciA9IHF1YXJ0ZXJub3RlLzI7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocXVhcnRlcm5vdGUvMyA8PSBtYXhkdXJhdGlvbilcbiAgICAgICAgICAgICAgICAgICAgZHVyID0gcXVhcnRlcm5vdGUvMztcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChxdWFydGVybm90ZS80IDw9IG1heGR1cmF0aW9uKVxuICAgICAgICAgICAgICAgICAgICBkdXIgPSBxdWFydGVybm90ZS80O1xuXG5cbiAgICAgICAgICAgICAgICBpZiAoZHVyIDwgbm90ZTEuRHVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgZHVyID0gbm90ZTEuRHVyYXRpb247XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLyogU3BlY2lhbCBjYXNlOiBJZiB0aGUgcHJldmlvdXMgbm90ZSdzIGR1cmF0aW9uXG4gICAgICAgICAgICAgICAgICogbWF0Y2hlcyB0aGlzIG5vdGUncyBkdXJhdGlvbiwgd2UgY2FuIG1ha2UgYSBub3RlcGFpci5cbiAgICAgICAgICAgICAgICAgKiBTbyBkb24ndCBleHBhbmQgdGhlIGR1cmF0aW9uIGluIHRoYXQgY2FzZS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAoKHByZXZOb3RlLlN0YXJ0VGltZSArIHByZXZOb3RlLkR1cmF0aW9uID09IG5vdGUxLlN0YXJ0VGltZSkgJiZcbiAgICAgICAgICAgICAgICAgICAgKHByZXZOb3RlLkR1cmF0aW9uID09IG5vdGUxLkR1cmF0aW9uKSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGR1ciA9IG5vdGUxLkR1cmF0aW9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBub3RlMS5EdXJhdGlvbiA9IGR1cjtcbiAgICAgICAgICAgICAgICBpZiAodHJhY2suTm90ZXNbaSsxXS5TdGFydFRpbWUgIT0gbm90ZTEuU3RhcnRUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHByZXZOb3RlID0gbm90ZTE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFNwbGl0IHRoZSBnaXZlbiB0cmFjayBpbnRvIG11bHRpcGxlIHRyYWNrcywgc2VwYXJhdGluZyBlYWNoXG4gICAgICogY2hhbm5lbCBpbnRvIGEgc2VwYXJhdGUgdHJhY2suXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgTGlzdDxNaWRpVHJhY2s+IFxuICAgIFNwbGl0Q2hhbm5lbHMoTWlkaVRyYWNrIG9yaWd0cmFjaywgTGlzdDxNaWRpRXZlbnQ+IGV2ZW50cykge1xuXG4gICAgICAgIC8qIEZpbmQgdGhlIGluc3RydW1lbnQgdXNlZCBmb3IgZWFjaCBjaGFubmVsICovXG4gICAgICAgIGludFtdIGNoYW5uZWxJbnN0cnVtZW50cyA9IG5ldyBpbnRbMTZdO1xuICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbWV2ZW50IGluIGV2ZW50cykge1xuICAgICAgICAgICAgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnRQcm9ncmFtQ2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgY2hhbm5lbEluc3RydW1lbnRzW21ldmVudC5DaGFubmVsXSA9IG1ldmVudC5JbnN0cnVtZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNoYW5uZWxJbnN0cnVtZW50c1s5XSA9IDEyODsgLyogQ2hhbm5lbCA5ID0gUGVyY3Vzc2lvbiAqL1xuXG4gICAgICAgIExpc3Q8TWlkaVRyYWNrPiByZXN1bHQgPSBuZXcgTGlzdDxNaWRpVHJhY2s+KCk7XG4gICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG5vdGUgaW4gb3JpZ3RyYWNrLk5vdGVzKSB7XG4gICAgICAgICAgICBib29sIGZvdW5kY2hhbm5lbCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGlmIChub3RlLkNoYW5uZWwgPT0gdHJhY2suTm90ZXNbMF0uQ2hhbm5lbCkge1xuICAgICAgICAgICAgICAgICAgICBmb3VuZGNoYW5uZWwgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0cmFjay5BZGROb3RlKG5vdGUpOyBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWZvdW5kY2hhbm5lbCkge1xuICAgICAgICAgICAgICAgIE1pZGlUcmFjayB0cmFjayA9IG5ldyBNaWRpVHJhY2socmVzdWx0LkNvdW50ICsgMSk7XG4gICAgICAgICAgICAgICAgdHJhY2suQWRkTm90ZShub3RlKTtcbiAgICAgICAgICAgICAgICB0cmFjay5JbnN0cnVtZW50ID0gY2hhbm5lbEluc3RydW1lbnRzW25vdGUuQ2hhbm5lbF07XG4gICAgICAgICAgICAgICAgcmVzdWx0LkFkZCh0cmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9yaWd0cmFjay5MeXJpY3MgIT0gbnVsbCkge1xuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaUV2ZW50IGx5cmljRXZlbnQgaW4gb3JpZ3RyYWNrLkx5cmljcykge1xuICAgICAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGx5cmljRXZlbnQuQ2hhbm5lbCA9PSB0cmFjay5Ob3Rlc1swXS5DaGFubmVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFjay5BZGRMeXJpYyhseXJpY0V2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuXG4gICAgLyoqIEd1ZXNzIHRoZSBtZWFzdXJlIGxlbmd0aC4gIFdlIGFzc3VtZSB0aGF0IHRoZSBtZWFzdXJlXG4gICAgICogbGVuZ3RoIG11c3QgYmUgYmV0d2VlbiAwLjUgc2Vjb25kcyBhbmQgNCBzZWNvbmRzLlxuICAgICAqIFRha2UgYWxsIHRoZSBub3RlIHN0YXJ0IHRpbWVzIHRoYXQgZmFsbCBiZXR3ZWVuIDAuNSBhbmQgXG4gICAgICogNCBzZWNvbmRzLCBhbmQgcmV0dXJuIHRoZSBzdGFydHRpbWVzLlxuICAgICAqL1xuICAgIHB1YmxpYyBMaXN0PGludD4gXG4gICAgR3Vlc3NNZWFzdXJlTGVuZ3RoKCkge1xuICAgICAgICBMaXN0PGludD4gcmVzdWx0ID0gbmV3IExpc3Q8aW50PigpO1xuXG4gICAgICAgIGludCBwdWxzZXNfcGVyX3NlY29uZCA9IChpbnQpICgxMDAwMDAwLjAgLyB0aW1lc2lnLlRlbXBvICogdGltZXNpZy5RdWFydGVyKTtcbiAgICAgICAgaW50IG1pbm1lYXN1cmUgPSBwdWxzZXNfcGVyX3NlY29uZCAvIDI7ICAvKiBUaGUgbWluaW11bSBtZWFzdXJlIGxlbmd0aCBpbiBwdWxzZXMgKi9cbiAgICAgICAgaW50IG1heG1lYXN1cmUgPSBwdWxzZXNfcGVyX3NlY29uZCAqIDQ7ICAvKiBUaGUgbWF4aW11bSBtZWFzdXJlIGxlbmd0aCBpbiBwdWxzZXMgKi9cblxuICAgICAgICAvKiBHZXQgdGhlIHN0YXJ0IHRpbWUgb2YgdGhlIGZpcnN0IG5vdGUgaW4gdGhlIG1pZGkgZmlsZS4gKi9cbiAgICAgICAgaW50IGZpcnN0bm90ZSA9IHRpbWVzaWcuTWVhc3VyZSAqIDU7XG4gICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpIHtcbiAgICAgICAgICAgIGlmIChmaXJzdG5vdGUgPiB0cmFjay5Ob3Rlc1swXS5TdGFydFRpbWUpIHtcbiAgICAgICAgICAgICAgICBmaXJzdG5vdGUgPSB0cmFjay5Ob3Rlc1swXS5TdGFydFRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBpbnRlcnZhbCA9IDAuMDYgc2Vjb25kcywgY29udmVydGVkIGludG8gcHVsc2VzICovXG4gICAgICAgIGludCBpbnRlcnZhbCA9IHRpbWVzaWcuUXVhcnRlciAqIDYwMDAwIC8gdGltZXNpZy5UZW1wbztcblxuICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKSB7XG4gICAgICAgICAgICBpbnQgcHJldnRpbWUgPSAwO1xuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiB0cmFjay5Ob3Rlcykge1xuICAgICAgICAgICAgICAgIGlmIChub3RlLlN0YXJ0VGltZSAtIHByZXZ0aW1lIDw9IGludGVydmFsKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgIHByZXZ0aW1lID0gbm90ZS5TdGFydFRpbWU7XG5cbiAgICAgICAgICAgICAgICBpbnQgdGltZV9mcm9tX2ZpcnN0bm90ZSA9IG5vdGUuU3RhcnRUaW1lIC0gZmlyc3Rub3RlO1xuXG4gICAgICAgICAgICAgICAgLyogUm91bmQgdGhlIHRpbWUgZG93biB0byBhIG11bHRpcGxlIG9mIDQgKi9cbiAgICAgICAgICAgICAgICB0aW1lX2Zyb21fZmlyc3Rub3RlID0gdGltZV9mcm9tX2ZpcnN0bm90ZSAvIDQgKiA0O1xuICAgICAgICAgICAgICAgIGlmICh0aW1lX2Zyb21fZmlyc3Rub3RlIDwgbWlubWVhc3VyZSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgaWYgKHRpbWVfZnJvbV9maXJzdG5vdGUgPiBtYXhtZWFzdXJlKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGlmICghcmVzdWx0LkNvbnRhaW5zKHRpbWVfZnJvbV9maXJzdG5vdGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5BZGQodGltZV9mcm9tX2ZpcnN0bm90ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC5Tb3J0KCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgbGFzdCBzdGFydCB0aW1lICovXG4gICAgcHVibGljIGludCBFbmRUaW1lKCkge1xuICAgICAgICBpbnQgbGFzdFN0YXJ0ID0gMDtcbiAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcykge1xuICAgICAgICAgICAgaWYgKHRyYWNrLk5vdGVzLkNvdW50ID09IDApIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGludCBsYXN0ID0gdHJhY2suTm90ZXNbIHRyYWNrLk5vdGVzLkNvdW50LTEgXS5TdGFydFRpbWU7XG4gICAgICAgICAgICBsYXN0U3RhcnQgPSBNYXRoLk1heChsYXN0LCBsYXN0U3RhcnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsYXN0U3RhcnQ7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0cnVlIGlmIHRoaXMgbWlkaSBmaWxlIGhhcyBseXJpY3MgKi9cbiAgICBwdWJsaWMgYm9vbCBIYXNMeXJpY3MoKSB7XG4gICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpIHtcbiAgICAgICAgICAgIGlmICh0cmFjay5MeXJpY3MgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb3ZlcnJpZGUgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICBzdHJpbmcgcmVzdWx0ID0gXCJNaWRpIEZpbGUgdHJhY2tzPVwiICsgdHJhY2tzLkNvdW50ICsgXCIgcXVhcnRlcj1cIiArIHF1YXJ0ZXJub3RlICsgXCJcXG5cIjtcbiAgICAgICAgcmVzdWx0ICs9IFRpbWUuVG9TdHJpbmcoKSArIFwiXFxuXCI7XG4gICAgICAgIGZvcmVhY2goTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcykge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHRyYWNrLlRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKiBDb21tYW5kLWxpbmUgcHJvZ3JhbSB0byBwcmludCBvdXQgYSBwYXJzZWQgTWlkaSBmaWxlLiBVc2VkIGZvciBkZWJ1Z2dpbmcuXG4gICAgICogVG8gcnVuOlxuICAgICAqIC0gQ2hhbmdlIE1haW4yIHRvIE1haW5cbiAgICAgKiAtIGNzYyBNaWRpTm90ZS5jcyBNaWRpRXZlbnQuY3MgTWlkaVRyYWNrLmNzIE1pZGlGaWxlUmVhZGVyLmNzIE1pZGlPcHRpb25zLmNzXG4gICAgICogICBNaWRpRmlsZS5jcyBNaWRpRmlsZUV4Y2VwdGlvbi5jcyBUaW1lU2lnbmF0dXJlLmNzIENvbmZpZ0lOSS5jc1xuICAgICAqIC0gTWlkaUZpbGUuZXhlIGZpbGUubWlkXG4gICAgICpcbiAgICAgKi9cbiAgICAvL3B1YmxpYyBzdGF0aWMgdm9pZCBNYWluMihzdHJpbmdbXSBhcmcpIHtcbiAgICAvLyAgICBpZiAoYXJnLkxlbmd0aCA9PSAwKSB7XG4gICAgLy8gICAgICAgIENvbnNvbGUuV3JpdGVMaW5lKFwiVXNhZ2U6IE1pZGlGaWxlIDxmaWxlbmFtZT5cIik7XG4gICAgLy8gICAgICAgIHJldHVybjtcbiAgICAvLyAgICB9XG5cbiAgICAvLyAgICBNaWRpRmlsZSBmID0gbmV3IE1pZGlGaWxlKGFyZ1swXSk7XG4gICAgLy8gICAgQ29uc29sZS5Xcml0ZShmLlRvU3RyaW5nKCkpO1xuICAgIC8vfVxuXG59ICAvKiBFbmQgY2xhc3MgTWlkaUZpbGUgKi9cblxuXG59ICAvKiBFbmQgbmFtZXNwYWNlIE1pZGlTaGVldE11c2ljICovXG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMiBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogQGNsYXNzIE1pZGlGaWxlRXhjZXB0aW9uXG4gKiBBIE1pZGlGaWxlRXhjZXB0aW9uIGlzIHRocm93biB3aGVuIGFuIGVycm9yIG9jY3Vyc1xuICogd2hpbGUgcGFyc2luZyB0aGUgTWlkaSBGaWxlLiAgVGhlIGNvbnN0cnVjdG9yIHRha2VzXG4gKiB0aGUgZmlsZSBvZmZzZXQgKGluIGJ5dGVzKSB3aGVyZSB0aGUgZXJyb3Igb2NjdXJyZWQsXG4gKiBhbmQgYSBzdHJpbmcgZGVzY3JpYmluZyB0aGUgZXJyb3IuXG4gKi9cbnB1YmxpYyBjbGFzcyBNaWRpRmlsZUV4Y2VwdGlvbiA6IFN5c3RlbS5FeGNlcHRpb24ge1xuICAgIHB1YmxpYyBNaWRpRmlsZUV4Y2VwdGlvbiAoc3RyaW5nIHMsIGludCBvZmZzZXQpIDpcbiAgICAgICAgYmFzZShzICsgXCIgYXQgb2Zmc2V0IFwiICsgb2Zmc2V0KSB7XG4gICAgfVxufVxuXG59XG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMiBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG5cbi8qKiBAY2xhc3MgTWlkaUZpbGVSZWFkZXJcbiAqIFRoZSBNaWRpRmlsZVJlYWRlciBpcyB1c2VkIHRvIHJlYWQgbG93LWxldmVsIGJpbmFyeSBkYXRhIGZyb20gYSBmaWxlLlxuICogVGhpcyBjbGFzcyBjYW4gZG8gdGhlIGZvbGxvd2luZzpcbiAqXG4gKiAtIFBlZWsgYXQgdGhlIG5leHQgYnl0ZSBpbiB0aGUgZmlsZS5cbiAqIC0gUmVhZCBhIGJ5dGVcbiAqIC0gUmVhZCBhIDE2LWJpdCBiaWcgZW5kaWFuIHNob3J0XG4gKiAtIFJlYWQgYSAzMi1iaXQgYmlnIGVuZGlhbiBpbnRcbiAqIC0gUmVhZCBhIGZpeGVkIGxlbmd0aCBhc2NpaSBzdHJpbmcgKG5vdCBudWxsIHRlcm1pbmF0ZWQpXG4gKiAtIFJlYWQgYSBcInZhcmlhYmxlIGxlbmd0aFwiIGludGVnZXIuICBUaGUgZm9ybWF0IG9mIHRoZSB2YXJpYWJsZSBsZW5ndGhcbiAqICAgaW50IGlzIGRlc2NyaWJlZCBhdCB0aGUgdG9wIG9mIHRoaXMgZmlsZS5cbiAqIC0gU2tpcCBhaGVhZCBhIGdpdmVuIG51bWJlciBvZiBieXRlc1xuICogLSBSZXR1cm4gdGhlIGN1cnJlbnQgb2Zmc2V0LlxuICovXG5cbnB1YmxpYyBjbGFzcyBNaWRpRmlsZVJlYWRlciB7XG4gICAgcHJpdmF0ZSBieXRlW10gZGF0YTsgICAgICAgLyoqIFRoZSBlbnRpcmUgbWlkaSBmaWxlIGRhdGEgKi9cbiAgICBwcml2YXRlIGludCBwYXJzZV9vZmZzZXQ7ICAvKiogVGhlIGN1cnJlbnQgb2Zmc2V0IHdoaWxlIHBhcnNpbmcgKi9cblxuICAgIC8qKiBDcmVhdGUgYSBuZXcgTWlkaUZpbGVSZWFkZXIgZm9yIHRoZSBnaXZlbiBmaWxlbmFtZSAqL1xuICAgIC8vcHVibGljIE1pZGlGaWxlUmVhZGVyKHN0cmluZyBmaWxlbmFtZSkge1xuICAgIC8vICAgIEZpbGVJbmZvIGluZm8gPSBuZXcgRmlsZUluZm8oZmlsZW5hbWUpO1xuICAgIC8vICAgIGlmICghaW5mby5FeGlzdHMpIHtcbiAgICAvLyAgICAgICAgdGhyb3cgbmV3IE1pZGlGaWxlRXhjZXB0aW9uKFwiRmlsZSBcIiArIGZpbGVuYW1lICsgXCIgZG9lcyBub3QgZXhpc3RcIiwgMCk7XG4gICAgLy8gICAgfVxuICAgIC8vICAgIGlmIChpbmZvLkxlbmd0aCA9PSAwKSB7XG4gICAgLy8gICAgICAgIHRocm93IG5ldyBNaWRpRmlsZUV4Y2VwdGlvbihcIkZpbGUgXCIgKyBmaWxlbmFtZSArIFwiIGlzIGVtcHR5ICgwIGJ5dGVzKVwiLCAwKTtcbiAgICAvLyAgICB9XG4gICAgLy8gICAgRmlsZVN0cmVhbSBmaWxlID0gRmlsZS5PcGVuKGZpbGVuYW1lLCBGaWxlTW9kZS5PcGVuLCBcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRmlsZUFjY2Vzcy5SZWFkLCBGaWxlU2hhcmUuUmVhZCk7XG5cbiAgICAvLyAgICAvKiBSZWFkIHRoZSBlbnRpcmUgZmlsZSBpbnRvIG1lbW9yeSAqL1xuICAgIC8vICAgIGRhdGEgPSBuZXcgYnl0ZVsgaW5mby5MZW5ndGggXTtcbiAgICAvLyAgICBpbnQgb2Zmc2V0ID0gMDtcbiAgICAvLyAgICBpbnQgbGVuID0gKGludClpbmZvLkxlbmd0aDtcbiAgICAvLyAgICB3aGlsZSAodHJ1ZSkge1xuICAgIC8vICAgICAgICBpZiAob2Zmc2V0ID09IGluZm8uTGVuZ3RoKVxuICAgIC8vICAgICAgICAgICAgYnJlYWs7XG4gICAgLy8gICAgICAgIGludCBuID0gZmlsZS5SZWFkKGRhdGEsIG9mZnNldCwgKGludCkoaW5mby5MZW5ndGggLSBvZmZzZXQpKTtcbiAgICAvLyAgICAgICAgaWYgKG4gPD0gMClcbiAgICAvLyAgICAgICAgICAgIGJyZWFrO1xuICAgIC8vICAgICAgICBvZmZzZXQgKz0gbjtcbiAgICAvLyAgICB9XG4gICAgLy8gICAgcGFyc2Vfb2Zmc2V0ID0gMDtcbiAgICAvLyAgICBmaWxlLkNsb3NlKCk7XG4gICAgLy99XG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IE1pZGlGaWxlUmVhZGVyIGZyb20gdGhlIGdpdmVuIGRhdGEgKi9cbiAgICBwdWJsaWMgTWlkaUZpbGVSZWFkZXIoYnl0ZVtdIGJ5dGVzKSB7XG4gICAgICAgIGRhdGEgPSBieXRlcztcbiAgICAgICAgcGFyc2Vfb2Zmc2V0ID0gMDtcbiAgICB9XG5cbiAgICAvKiogQ2hlY2sgdGhhdCB0aGUgZ2l2ZW4gbnVtYmVyIG9mIGJ5dGVzIGRvZXNuJ3QgZXhjZWVkIHRoZSBmaWxlIHNpemUgKi9cbiAgICBwcml2YXRlIHZvaWQgY2hlY2tSZWFkKGludCBhbW91bnQpIHtcbiAgICAgICAgaWYgKHBhcnNlX29mZnNldCArIGFtb3VudCA+IGRhdGEuTGVuZ3RoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXCJGaWxlIGlzIHRydW5jYXRlZFwiLCBwYXJzZV9vZmZzZXQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFJlYWQgdGhlIG5leHQgYnl0ZSBpbiB0aGUgZmlsZSwgYnV0IGRvbid0IGluY3JlbWVudCB0aGUgcGFyc2Ugb2Zmc2V0ICovXG4gICAgcHVibGljIGJ5dGUgUGVlaygpIHtcbiAgICAgICAgY2hlY2tSZWFkKDEpO1xuICAgICAgICByZXR1cm4gZGF0YVtwYXJzZV9vZmZzZXRdO1xuICAgIH1cblxuICAgIC8qKiBSZWFkIGEgYnl0ZSBmcm9tIHRoZSBmaWxlICovXG4gICAgcHVibGljIGJ5dGUgUmVhZEJ5dGUoKSB7IFxuICAgICAgICBjaGVja1JlYWQoMSk7XG4gICAgICAgIGJ5dGUgeCA9IGRhdGFbcGFyc2Vfb2Zmc2V0XTtcbiAgICAgICAgcGFyc2Vfb2Zmc2V0Kys7XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cblxuICAgIC8qKiBSZWFkIHRoZSBnaXZlbiBudW1iZXIgb2YgYnl0ZXMgZnJvbSB0aGUgZmlsZSAqL1xuICAgIHB1YmxpYyBieXRlW10gUmVhZEJ5dGVzKGludCBhbW91bnQpIHtcbiAgICAgICAgY2hlY2tSZWFkKGFtb3VudCk7XG4gICAgICAgIGJ5dGVbXSByZXN1bHQgPSBuZXcgYnl0ZVthbW91bnRdO1xuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IGFtb3VudDsgaSsrKSB7XG4gICAgICAgICAgICByZXN1bHRbaV0gPSBkYXRhW2kgKyBwYXJzZV9vZmZzZXRdO1xuICAgICAgICB9XG4gICAgICAgIHBhcnNlX29mZnNldCArPSBhbW91bnQ7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqIFJlYWQgYSAxNi1iaXQgc2hvcnQgZnJvbSB0aGUgZmlsZSAqL1xuICAgIHB1YmxpYyB1c2hvcnQgUmVhZFNob3J0KCkge1xuICAgICAgICBjaGVja1JlYWQoMik7XG4gICAgICAgIHVzaG9ydCB4ID0gKHVzaG9ydCkgKCAoZGF0YVtwYXJzZV9vZmZzZXRdIDw8IDgpIHwgZGF0YVtwYXJzZV9vZmZzZXQrMV0gKTtcbiAgICAgICAgcGFyc2Vfb2Zmc2V0ICs9IDI7XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cblxuICAgIC8qKiBSZWFkIGEgMzItYml0IGludCBmcm9tIHRoZSBmaWxlICovXG4gICAgcHVibGljIGludCBSZWFkSW50KCkge1xuICAgICAgICBjaGVja1JlYWQoNCk7XG4gICAgICAgIGludCB4ID0gKGludCkoIChkYXRhW3BhcnNlX29mZnNldF0gPDwgMjQpIHwgKGRhdGFbcGFyc2Vfb2Zmc2V0KzFdIDw8IDE2KSB8XG4gICAgICAgICAgICAgICAgICAgICAgIChkYXRhW3BhcnNlX29mZnNldCsyXSA8PCA4KSB8IGRhdGFbcGFyc2Vfb2Zmc2V0KzNdICk7XG4gICAgICAgIHBhcnNlX29mZnNldCArPSA0O1xuICAgICAgICByZXR1cm4geDtcbiAgICB9XG5cbiAgICAvKiogUmVhZCBhbiBhc2NpaSBzdHJpbmcgd2l0aCB0aGUgZ2l2ZW4gbGVuZ3RoICovXG4gICAgcHVibGljIHN0cmluZyBSZWFkQXNjaWkoaW50IGxlbikge1xuICAgICAgICBjaGVja1JlYWQobGVuKTtcbiAgICAgICAgc3RyaW5nIHMgPSBBU0NJSUVuY29kaW5nLkFTQ0lJLkdldFN0cmluZyhkYXRhLCBwYXJzZV9vZmZzZXQsIGxlbik7XG4gICAgICAgIHBhcnNlX29mZnNldCArPSBsZW47XG4gICAgICAgIHJldHVybiBzO1xuICAgIH1cblxuICAgIC8qKiBSZWFkIGEgdmFyaWFibGUtbGVuZ3RoIGludGVnZXIgKDEgdG8gNCBieXRlcykuIFRoZSBpbnRlZ2VyIGVuZHNcbiAgICAgKiB3aGVuIHlvdSBlbmNvdW50ZXIgYSBieXRlIHRoYXQgZG9lc24ndCBoYXZlIHRoZSA4dGggYml0IHNldFxuICAgICAqIChhIGJ5dGUgbGVzcyB0aGFuIDB4ODApLlxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgUmVhZFZhcmxlbigpIHtcbiAgICAgICAgdWludCByZXN1bHQgPSAwO1xuICAgICAgICBieXRlIGI7XG5cbiAgICAgICAgYiA9IFJlYWRCeXRlKCk7XG4gICAgICAgIHJlc3VsdCA9ICh1aW50KShiICYgMHg3Zik7XG5cbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgICAgICAgIGlmICgoYiAmIDB4ODApICE9IDApIHtcbiAgICAgICAgICAgICAgICBiID0gUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSAodWludCkoIChyZXN1bHQgPDwgNykgKyAoYiAmIDB4N2YpICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKGludClyZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqIFNraXAgb3ZlciB0aGUgZ2l2ZW4gbnVtYmVyIG9mIGJ5dGVzICovIFxuICAgIHB1YmxpYyB2b2lkIFNraXAoaW50IGFtb3VudCkge1xuICAgICAgICBjaGVja1JlYWQoYW1vdW50KTtcbiAgICAgICAgcGFyc2Vfb2Zmc2V0ICs9IGFtb3VudDtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBjdXJyZW50IHBhcnNlIG9mZnNldCAqL1xuICAgIHB1YmxpYyBpbnQgR2V0T2Zmc2V0KCkge1xuICAgICAgICByZXR1cm4gcGFyc2Vfb2Zmc2V0O1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIHJhdyBtaWRpIGZpbGUgYnl0ZSBkYXRhICovXG4gICAgcHVibGljIGJ5dGVbXSBHZXREYXRhKCkge1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG59XG5cbn0gXG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMiBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogQGNsYXNzIE1pZGlOb3RlXG4gKiBBIE1pZGlOb3RlIGNvbnRhaW5zXG4gKlxuICogc3RhcnR0aW1lIC0gVGhlIHRpbWUgKG1lYXN1cmVkIGluIHB1bHNlcykgd2hlbiB0aGUgbm90ZSBpcyBwcmVzc2VkLlxuICogY2hhbm5lbCAgIC0gVGhlIGNoYW5uZWwgdGhlIG5vdGUgaXMgZnJvbS4gIFRoaXMgaXMgdXNlZCB3aGVuIG1hdGNoaW5nXG4gKiAgICAgICAgICAgICBOb3RlT2ZmIGV2ZW50cyB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIE5vdGVPbiBldmVudC5cbiAqICAgICAgICAgICAgIFRoZSBjaGFubmVscyBmb3IgdGhlIE5vdGVPbiBhbmQgTm90ZU9mZiBldmVudHMgbXVzdCBiZVxuICogICAgICAgICAgICAgdGhlIHNhbWUuXG4gKiBub3RlbnVtYmVyIC0gVGhlIG5vdGUgbnVtYmVyLCBmcm9tIDAgdG8gMTI3LiAgTWlkZGxlIEMgaXMgNjAuXG4gKiBkdXJhdGlvbiAgLSBUaGUgdGltZSBkdXJhdGlvbiAobWVhc3VyZWQgaW4gcHVsc2VzKSBhZnRlciB3aGljaCB0aGUgXG4gKiAgICAgICAgICAgICBub3RlIGlzIHJlbGVhc2VkLlxuICpcbiAqIEEgTWlkaU5vdGUgaXMgY3JlYXRlZCB3aGVuIHdlIGVuY291bnRlciBhIE5vdGVPZmYgZXZlbnQuICBUaGUgZHVyYXRpb25cbiAqIGlzIGluaXRpYWxseSB1bmtub3duIChzZXQgdG8gMCkuICBXaGVuIHRoZSBjb3JyZXNwb25kaW5nIE5vdGVPZmYgZXZlbnRcbiAqIGlzIGZvdW5kLCB0aGUgZHVyYXRpb24gaXMgc2V0IGJ5IHRoZSBtZXRob2QgTm90ZU9mZigpLlxuICovXG5wdWJsaWMgY2xhc3MgTWlkaU5vdGUgOiBJQ29tcGFyZXI8TWlkaU5vdGU+IHtcbiAgICBwcml2YXRlIGludCBzdGFydHRpbWU7ICAgLyoqIFRoZSBzdGFydCB0aW1lLCBpbiBwdWxzZXMgKi9cbiAgICBwcml2YXRlIGludCBjaGFubmVsOyAgICAgLyoqIFRoZSBjaGFubmVsICovXG4gICAgcHJpdmF0ZSBpbnQgbm90ZW51bWJlcjsgIC8qKiBUaGUgbm90ZSwgZnJvbSAwIHRvIDEyNy4gTWlkZGxlIEMgaXMgNjAgKi9cbiAgICBwcml2YXRlIGludCBkdXJhdGlvbjsgICAgLyoqIFRoZSBkdXJhdGlvbiwgaW4gcHVsc2VzICovXG5cblxuICAgIC8qIENyZWF0ZSBhIG5ldyBNaWRpTm90ZS4gIFRoaXMgaXMgY2FsbGVkIHdoZW4gYSBOb3RlT24gZXZlbnQgaXNcbiAgICAgKiBlbmNvdW50ZXJlZCBpbiB0aGUgTWlkaUZpbGUuXG4gICAgICovXG4gICAgcHVibGljIE1pZGlOb3RlKGludCBzdGFydHRpbWUsIGludCBjaGFubmVsLCBpbnQgbm90ZW51bWJlciwgaW50IGR1cmF0aW9uKSB7XG4gICAgICAgIHRoaXMuc3RhcnR0aW1lID0gc3RhcnR0aW1lO1xuICAgICAgICB0aGlzLmNoYW5uZWwgPSBjaGFubmVsO1xuICAgICAgICB0aGlzLm5vdGVudW1iZXIgPSBub3RlbnVtYmVyO1xuICAgICAgICB0aGlzLmR1cmF0aW9uID0gZHVyYXRpb247XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgaW50IFN0YXJ0VGltZSB7XG4gICAgICAgIGdldCB7IHJldHVybiBzdGFydHRpbWU7IH1cbiAgICAgICAgc2V0IHsgc3RhcnR0aW1lID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICBwdWJsaWMgaW50IEVuZFRpbWUge1xuICAgICAgICBnZXQgeyByZXR1cm4gc3RhcnR0aW1lICsgZHVyYXRpb247IH1cbiAgICB9XG5cbiAgICBwdWJsaWMgaW50IENoYW5uZWwge1xuICAgICAgICBnZXQgeyByZXR1cm4gY2hhbm5lbDsgfVxuICAgICAgICBzZXQgeyBjaGFubmVsID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICBwdWJsaWMgaW50IE51bWJlciB7XG4gICAgICAgIGdldCB7IHJldHVybiBub3RlbnVtYmVyOyB9XG4gICAgICAgIHNldCB7IG5vdGVudW1iZXIgPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIHB1YmxpYyBpbnQgRHVyYXRpb24ge1xuICAgICAgICBnZXQgeyByZXR1cm4gZHVyYXRpb247IH1cbiAgICAgICAgc2V0IHsgZHVyYXRpb24gPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIC8qIEEgTm90ZU9mZiBldmVudCBvY2N1cnMgZm9yIHRoaXMgbm90ZSBhdCB0aGUgZ2l2ZW4gdGltZS5cbiAgICAgKiBDYWxjdWxhdGUgdGhlIG5vdGUgZHVyYXRpb24gYmFzZWQgb24gdGhlIG5vdGVvZmYgZXZlbnQuXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgTm90ZU9mZihpbnQgZW5kdGltZSkge1xuICAgICAgICBkdXJhdGlvbiA9IGVuZHRpbWUgLSBzdGFydHRpbWU7XG4gICAgfVxuXG4gICAgLyoqIENvbXBhcmUgdHdvIE1pZGlOb3RlcyBiYXNlZCBvbiB0aGVpciBzdGFydCB0aW1lcy5cbiAgICAgKiAgSWYgdGhlIHN0YXJ0IHRpbWVzIGFyZSBlcXVhbCwgY29tcGFyZSBieSB0aGVpciBudW1iZXJzLlxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgQ29tcGFyZShNaWRpTm90ZSB4LCBNaWRpTm90ZSB5KSB7XG4gICAgICAgIGlmICh4LlN0YXJ0VGltZSA9PSB5LlN0YXJ0VGltZSlcbiAgICAgICAgICAgIHJldHVybiB4Lk51bWJlciAtIHkuTnVtYmVyO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4geC5TdGFydFRpbWUgLSB5LlN0YXJ0VGltZTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBNaWRpTm90ZSBDbG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBNaWRpTm90ZShzdGFydHRpbWUsIGNoYW5uZWwsIG5vdGVudW1iZXIsIGR1cmF0aW9uKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb3ZlcnJpZGUgXG4gICAgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICBzdHJpbmdbXSBzY2FsZSA9IHsgXCJBXCIsIFwiQSNcIiwgXCJCXCIsIFwiQ1wiLCBcIkMjXCIsIFwiRFwiLCBcIkQjXCIsIFwiRVwiLCBcIkZcIiwgXCJGI1wiLCBcIkdcIiwgXCJHI1wiIH07XG4gICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiTWlkaU5vdGUgY2hhbm5lbD17MH0gbnVtYmVyPXsxfSB7Mn0gc3RhcnQ9ezN9IGR1cmF0aW9uPXs0fVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFubmVsLCBub3RlbnVtYmVyLCBzY2FsZVsobm90ZW51bWJlciArIDMpICUgMTJdLCBzdGFydHRpbWUsIGR1cmF0aW9uKTtcblxuICAgIH1cblxufVxuXG5cbn0gIC8qIEVuZCBuYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMgKi9cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDEzIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogQGNsYXNzIE1pZGlPcHRpb25zXG4gKlxuICogVGhlIE1pZGlPcHRpb25zIGNsYXNzIGNvbnRhaW5zIHRoZSBhdmFpbGFibGUgb3B0aW9ucyBmb3JcbiAqIG1vZGlmeWluZyB0aGUgc2hlZXQgbXVzaWMgYW5kIHNvdW5kLiAgVGhlc2Ugb3B0aW9ucyBhcmVcbiAqIGNvbGxlY3RlZCBmcm9tIHRoZSBtZW51L2RpYWxvZyBzZXR0aW5ncywgYW5kIHRoZW4gYXJlIHBhc3NlZFxuICogdG8gdGhlIFNoZWV0TXVzaWMgYW5kIE1pZGlQbGF5ZXIgY2xhc3Nlcy5cbiAqL1xucHVibGljIGNsYXNzIE1pZGlPcHRpb25zIHtcblxuICAgIC8vIFRoZSBwb3NzaWJsZSB2YWx1ZXMgZm9yIHNob3dOb3RlTGV0dGVyc1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTm90ZU5hbWVOb25lICAgICAgICAgICA9IDA7XG4gICAgcHVibGljIGNvbnN0IGludCBOb3RlTmFtZUxldHRlciAgICAgICAgID0gMTtcbiAgICBwdWJsaWMgY29uc3QgaW50IE5vdGVOYW1lRml4ZWREb1JlTWkgICAgPSAyO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTm90ZU5hbWVNb3ZhYmxlRG9SZU1pICA9IDM7XG4gICAgcHVibGljIGNvbnN0IGludCBOb3RlTmFtZUZpeGVkTnVtYmVyICAgID0gNDtcbiAgICBwdWJsaWMgY29uc3QgaW50IE5vdGVOYW1lTW92YWJsZU51bWJlciAgPSA1O1xuXG4gICAgLy8gU2hlZXQgTXVzaWMgT3B0aW9uc1xuICAgIHB1YmxpYyBzdHJpbmcgZmlsZW5hbWU7ICAgICAgIC8qKiBUaGUgZnVsbCBNaWRpIGZpbGVuYW1lICovXG4gICAgcHVibGljIHN0cmluZyB0aXRsZTsgICAgICAgICAgLyoqIFRoZSBNaWRpIHNvbmcgdGl0bGUgKi9cbiAgICBwdWJsaWMgYm9vbFtdIHRyYWNrczsgICAgICAgICAvKiogV2hpY2ggdHJhY2tzIHRvIGRpc3BsYXkgKHRydWUgPSBkaXNwbGF5KSAqL1xuICAgIHB1YmxpYyBib29sIHNjcm9sbFZlcnQ7ICAgICAgIC8qKiBXaGV0aGVyIHRvIHNjcm9sbCB2ZXJ0aWNhbGx5IG9yIGhvcml6b250YWxseSAqL1xuICAgIHB1YmxpYyBib29sIGxhcmdlTm90ZVNpemU7ICAgIC8qKiBEaXNwbGF5IGxhcmdlIG9yIHNtYWxsIG5vdGUgc2l6ZXMgKi9cbiAgICBwdWJsaWMgYm9vbCB0d29TdGFmZnM7ICAgICAgICAvKiogQ29tYmluZSB0cmFja3MgaW50byB0d28gc3RhZmZzID8gKi9cbiAgICBwdWJsaWMgaW50IHNob3dOb3RlTGV0dGVyczsgICAgIC8qKiBTaG93IHRoZSBuYW1lIChBLCBBIywgZXRjKSBuZXh0IHRvIHRoZSBub3RlcyAqL1xuICAgIHB1YmxpYyBib29sIHNob3dMeXJpY3M7ICAgICAgIC8qKiBTaG93IHRoZSBseXJpY3MgdW5kZXIgZWFjaCBub3RlICovXG4gICAgcHVibGljIGJvb2wgc2hvd01lYXN1cmVzOyAgICAgLyoqIFNob3cgdGhlIG1lYXN1cmUgbnVtYmVycyBmb3IgZWFjaCBzdGFmZiAqL1xuICAgIHB1YmxpYyBpbnQgc2hpZnR0aW1lOyAgICAgICAgIC8qKiBTaGlmdCBub3RlIHN0YXJ0dGltZXMgYnkgdGhlIGdpdmVuIGFtb3VudCAqL1xuICAgIHB1YmxpYyBpbnQgdHJhbnNwb3NlOyAgICAgICAgIC8qKiBTaGlmdCBub3RlIGtleSB1cC9kb3duIGJ5IGdpdmVuIGFtb3VudCAqL1xuICAgIHB1YmxpYyBpbnQga2V5OyAgICAgICAgICAgICAgIC8qKiBVc2UgdGhlIGdpdmVuIEtleVNpZ25hdHVyZSAobm90ZXNjYWxlKSAqL1xuICAgIHB1YmxpYyBUaW1lU2lnbmF0dXJlIHRpbWU7ICAgIC8qKiBVc2UgdGhlIGdpdmVuIHRpbWUgc2lnbmF0dXJlICovXG4gICAgcHVibGljIGludCBjb21iaW5lSW50ZXJ2YWw7ICAgLyoqIENvbWJpbmUgbm90ZXMgd2l0aGluIGdpdmVuIHRpbWUgaW50ZXJ2YWwgKG1zZWMpICovXG4gICAgcHVibGljIENvbG9yW10gY29sb3JzOyAgICAgICAgLyoqIFRoZSBub3RlIGNvbG9ycyB0byB1c2UgKi9cbiAgICBwdWJsaWMgQ29sb3Igc2hhZGVDb2xvcjsgICAgICAvKiogVGhlIGNvbG9yIHRvIHVzZSBmb3Igc2hhZGluZy4gKi9cbiAgICBwdWJsaWMgQ29sb3Igc2hhZGUyQ29sb3I7ICAgICAvKiogVGhlIGNvbG9yIHRvIHVzZSBmb3Igc2hhZGluZyB0aGUgbGVmdCBoYW5kIHBpYW5vICovXG5cbiAgICAvLyBTb3VuZCBvcHRpb25zXG4gICAgcHVibGljIGJvb2wgW11tdXRlOyAgICAgICAgICAgIC8qKiBXaGljaCB0cmFja3MgdG8gbXV0ZSAodHJ1ZSA9IG11dGUpICovXG4gICAgcHVibGljIGludCB0ZW1wbzsgICAgICAgICAgICAgIC8qKiBUaGUgdGVtcG8sIGluIG1pY3Jvc2Vjb25kcyBwZXIgcXVhcnRlciBub3RlICovXG4gICAgcHVibGljIGludCBwYXVzZVRpbWU7ICAgICAgICAgIC8qKiBTdGFydCB0aGUgbWlkaSBtdXNpYyBhdCB0aGUgZ2l2ZW4gcGF1c2UgdGltZSAqL1xuICAgIHB1YmxpYyBpbnRbXSBpbnN0cnVtZW50czsgICAgICAvKiogVGhlIGluc3RydW1lbnRzIHRvIHVzZSBwZXIgdHJhY2sgKi9cbiAgICBwdWJsaWMgYm9vbCB1c2VEZWZhdWx0SW5zdHJ1bWVudHM7ICAvKiogSWYgdHJ1ZSwgZG9uJ3QgY2hhbmdlIGluc3RydW1lbnRzICovXG4gICAgcHVibGljIGJvb2wgcGxheU1lYXN1cmVzSW5Mb29wOyAgICAgLyoqIFBsYXkgdGhlIHNlbGVjdGVkIG1lYXN1cmVzIGluIGEgbG9vcCAqL1xuICAgIHB1YmxpYyBpbnQgcGxheU1lYXN1cmVzSW5Mb29wU3RhcnQ7IC8qKiBTdGFydCBtZWFzdXJlIHRvIHBsYXkgaW4gbG9vcCAqL1xuICAgIHB1YmxpYyBpbnQgcGxheU1lYXN1cmVzSW5Mb29wRW5kOyAgIC8qKiBFbmQgbWVhc3VyZSB0byBwbGF5IGluIGxvb3AgKi9cblxuXG4gICAgcHVibGljIE1pZGlPcHRpb25zKCkge1xuICAgIH1cblxuICAgIHB1YmxpYyBNaWRpT3B0aW9ucyhNaWRpRmlsZSBtaWRpZmlsZSkge1xuICAgICAgICBmaWxlbmFtZSA9IG1pZGlmaWxlLkZpbGVOYW1lO1xuICAgICAgICB0aXRsZSA9IFBhdGguR2V0RmlsZU5hbWUobWlkaWZpbGUuRmlsZU5hbWUpO1xuICAgICAgICBpbnQgbnVtdHJhY2tzID0gbWlkaWZpbGUuVHJhY2tzLkNvdW50O1xuICAgICAgICB0cmFja3MgPSBuZXcgYm9vbFtudW10cmFja3NdO1xuICAgICAgICBtdXRlID0gIG5ldyBib29sW251bXRyYWNrc107XG4gICAgICAgIGluc3RydW1lbnRzID0gbmV3IGludFtudW10cmFja3NdO1xuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHRyYWNrcy5MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdHJhY2tzW2ldID0gdHJ1ZTtcbiAgICAgICAgICAgIG11dGVbaV0gPSBmYWxzZTtcbiAgICAgICAgICAgIGluc3RydW1lbnRzW2ldID0gbWlkaWZpbGUuVHJhY2tzW2ldLkluc3RydW1lbnQ7XG4gICAgICAgICAgICBpZiAobWlkaWZpbGUuVHJhY2tzW2ldLkluc3RydW1lbnROYW1lID09IFwiUGVyY3Vzc2lvblwiKSB7XG4gICAgICAgICAgICAgICAgdHJhY2tzW2ldID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgbXV0ZVtpXSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gXG4gICAgICAgIHVzZURlZmF1bHRJbnN0cnVtZW50cyA9IHRydWU7XG4gICAgICAgIHNjcm9sbFZlcnQgPSB0cnVlO1xuICAgICAgICBsYXJnZU5vdGVTaXplID0gZmFsc2U7XG4gICAgICAgIGlmICh0cmFja3MuTGVuZ3RoID09IDEpIHtcbiAgICAgICAgICAgIHR3b1N0YWZmcyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0d29TdGFmZnMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBzaG93Tm90ZUxldHRlcnMgPSBOb3RlTmFtZU5vbmU7XG4gICAgICAgIHNob3dMeXJpY3MgPSB0cnVlO1xuICAgICAgICBzaG93TWVhc3VyZXMgPSBmYWxzZTtcbiAgICAgICAgc2hpZnR0aW1lID0gMDtcbiAgICAgICAgdHJhbnNwb3NlID0gMDtcbiAgICAgICAga2V5ID0gLTE7XG4gICAgICAgIHRpbWUgPSBtaWRpZmlsZS5UaW1lO1xuICAgICAgICBjb2xvcnMgPSBudWxsO1xuICAgICAgICBzaGFkZUNvbG9yID0gQ29sb3IuRnJvbUFyZ2IoMTAwLCA1MywgMTIzLCAyNTUpO1xuICAgICAgICBzaGFkZTJDb2xvciA9IENvbG9yLkZyb21BcmdiKDgwLCAxMDAsIDI1MCk7XG4gICAgICAgIGNvbWJpbmVJbnRlcnZhbCA9IDQwO1xuICAgICAgICB0ZW1wbyA9IG1pZGlmaWxlLlRpbWUuVGVtcG87XG4gICAgICAgIHBhdXNlVGltZSA9IDA7XG4gICAgICAgIHBsYXlNZWFzdXJlc0luTG9vcCA9IGZhbHNlOyBcbiAgICAgICAgcGxheU1lYXN1cmVzSW5Mb29wU3RhcnQgPSAwO1xuICAgICAgICBwbGF5TWVhc3VyZXNJbkxvb3BFbmQgPSBtaWRpZmlsZS5FbmRUaW1lKCkgLyBtaWRpZmlsZS5UaW1lLk1lYXN1cmU7XG4gICAgfVxuXG4gICAgLyogSm9pbiB0aGUgYXJyYXkgaW50byBhIGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgKi9cbiAgICBzdGF0aWMgc3RyaW5nIEpvaW4oYm9vbFtdIHZhbHVlcykge1xuICAgICAgICBTdHJpbmdCdWlsZGVyIHJlc3VsdCA9IG5ldyBTdHJpbmdCdWlsZGVyKCk7XG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgdmFsdWVzLkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQuQXBwZW5kKFwiLFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdC5BcHBlbmQodmFsdWVzW2ldLlRvU3RyaW5nKCkpOyBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0LlRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgc3RhdGljIHN0cmluZyBKb2luKGludFtdIHZhbHVlcykge1xuICAgICAgICBTdHJpbmdCdWlsZGVyIHJlc3VsdCA9IG5ldyBTdHJpbmdCdWlsZGVyKCk7XG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgdmFsdWVzLkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQuQXBwZW5kKFwiLFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdC5BcHBlbmQodmFsdWVzW2ldLlRvU3RyaW5nKCkpOyBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0LlRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgc3RhdGljIHN0cmluZyBKb2luKENvbG9yW10gdmFsdWVzKSB7XG4gICAgICAgIFN0cmluZ0J1aWxkZXIgcmVzdWx0ID0gbmV3IFN0cmluZ0J1aWxkZXIoKTtcbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCB2YWx1ZXMuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5BcHBlbmQoXCIsXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0LkFwcGVuZChDb2xvclRvU3RyaW5nKHZhbHVlc1tpXSkpOyBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0LlRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgc3RhdGljIHN0cmluZyBDb2xvclRvU3RyaW5nKENvbG9yIGMpIHtcbiAgICAgICAgcmV0dXJuIFwiXCIgKyBjLlIgKyBcIiBcIiArIGMuRyArIFwiIFwiICsgYy5CO1xuICAgIH1cblxuICAgIFxuICAgIC8qIE1lcmdlIGluIHRoZSBzYXZlZCBvcHRpb25zIHRvIHRoaXMgTWlkaU9wdGlvbnMuKi9cbiAgICBwdWJsaWMgdm9pZCBNZXJnZShNaWRpT3B0aW9ucyBzYXZlZCkge1xuICAgICAgICBpZiAoc2F2ZWQudHJhY2tzICE9IG51bGwgJiYgc2F2ZWQudHJhY2tzLkxlbmd0aCA9PSB0cmFja3MuTGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHRyYWNrcy5MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRyYWNrc1tpXSA9IHNhdmVkLnRyYWNrc1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoc2F2ZWQubXV0ZSAhPSBudWxsICYmIHNhdmVkLm11dGUuTGVuZ3RoID09IG11dGUuTGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IG11dGUuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBtdXRlW2ldID0gc2F2ZWQubXV0ZVtpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoc2F2ZWQuaW5zdHJ1bWVudHMgIT0gbnVsbCAmJiBzYXZlZC5pbnN0cnVtZW50cy5MZW5ndGggPT0gaW5zdHJ1bWVudHMuTGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IGluc3RydW1lbnRzLkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaW5zdHJ1bWVudHNbaV0gPSBzYXZlZC5pbnN0cnVtZW50c1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoc2F2ZWQudGltZSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aW1lID0gbmV3IFRpbWVTaWduYXR1cmUoc2F2ZWQudGltZS5OdW1lcmF0b3IsIHNhdmVkLnRpbWUuRGVub21pbmF0b3IsXG4gICAgICAgICAgICAgICAgICAgIHNhdmVkLnRpbWUuUXVhcnRlciwgc2F2ZWQudGltZS5UZW1wbyk7XG4gICAgICAgIH1cbiAgICAgICAgdXNlRGVmYXVsdEluc3RydW1lbnRzID0gc2F2ZWQudXNlRGVmYXVsdEluc3RydW1lbnRzO1xuICAgICAgICBzY3JvbGxWZXJ0ID0gc2F2ZWQuc2Nyb2xsVmVydDtcbiAgICAgICAgbGFyZ2VOb3RlU2l6ZSA9IHNhdmVkLmxhcmdlTm90ZVNpemU7XG4gICAgICAgIHNob3dMeXJpY3MgPSBzYXZlZC5zaG93THlyaWNzO1xuICAgICAgICB0d29TdGFmZnMgPSBzYXZlZC50d29TdGFmZnM7XG4gICAgICAgIHNob3dOb3RlTGV0dGVycyA9IHNhdmVkLnNob3dOb3RlTGV0dGVycztcbiAgICAgICAgdHJhbnNwb3NlID0gc2F2ZWQudHJhbnNwb3NlO1xuICAgICAgICBrZXkgPSBzYXZlZC5rZXk7XG4gICAgICAgIGNvbWJpbmVJbnRlcnZhbCA9IHNhdmVkLmNvbWJpbmVJbnRlcnZhbDtcbiAgICAgICAgaWYgKHNhdmVkLnNoYWRlQ29sb3IgIT0gQ29sb3IuV2hpdGUpIHtcbiAgICAgICAgICAgIHNoYWRlQ29sb3IgPSBzYXZlZC5zaGFkZUNvbG9yO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzYXZlZC5zaGFkZTJDb2xvciAhPSBDb2xvci5XaGl0ZSkge1xuICAgICAgICAgICAgc2hhZGUyQ29sb3IgPSBzYXZlZC5zaGFkZTJDb2xvcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2F2ZWQuY29sb3JzICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNvbG9ycyA9IHNhdmVkLmNvbG9ycztcbiAgICAgICAgfVxuICAgICAgICBzaG93TWVhc3VyZXMgPSBzYXZlZC5zaG93TWVhc3VyZXM7XG4gICAgICAgIHBsYXlNZWFzdXJlc0luTG9vcCA9IHNhdmVkLnBsYXlNZWFzdXJlc0luTG9vcDtcbiAgICAgICAgcGxheU1lYXN1cmVzSW5Mb29wU3RhcnQgPSBzYXZlZC5wbGF5TWVhc3VyZXNJbkxvb3BTdGFydDtcbiAgICAgICAgcGxheU1lYXN1cmVzSW5Mb29wRW5kID0gc2F2ZWQucGxheU1lYXN1cmVzSW5Mb29wRW5kO1xuICAgIH1cbn1cblxufVxuXG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMiBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogQGNsYXNzIE1pZGlUcmFja1xuICogVGhlIE1pZGlUcmFjayB0YWtlcyBhcyBpbnB1dCB0aGUgcmF3IE1pZGlFdmVudHMgZm9yIHRoZSB0cmFjaywgYW5kIGdldHM6XG4gKiAtIFRoZSBsaXN0IG9mIG1pZGkgbm90ZXMgaW4gdGhlIHRyYWNrLlxuICogLSBUaGUgZmlyc3QgaW5zdHJ1bWVudCB1c2VkIGluIHRoZSB0cmFjay5cbiAqXG4gKiBGb3IgZWFjaCBOb3RlT24gZXZlbnQgaW4gdGhlIG1pZGkgZmlsZSwgYSBuZXcgTWlkaU5vdGUgaXMgY3JlYXRlZFxuICogYW5kIGFkZGVkIHRvIHRoZSB0cmFjaywgdXNpbmcgdGhlIEFkZE5vdGUoKSBtZXRob2QuXG4gKiBcbiAqIFRoZSBOb3RlT2ZmKCkgbWV0aG9kIGlzIGNhbGxlZCB3aGVuIGEgTm90ZU9mZiBldmVudCBpcyBlbmNvdW50ZXJlZCxcbiAqIGluIG9yZGVyIHRvIHVwZGF0ZSB0aGUgZHVyYXRpb24gb2YgdGhlIE1pZGlOb3RlLlxuICovIFxucHVibGljIGNsYXNzIE1pZGlUcmFjayB7XG4gICAgcHJpdmF0ZSBpbnQgdHJhY2tudW07ICAgICAgICAgICAgIC8qKiBUaGUgdHJhY2sgbnVtYmVyICovXG4gICAgcHJpdmF0ZSBMaXN0PE1pZGlOb3RlPiBub3RlczsgICAgIC8qKiBMaXN0IG9mIE1pZGkgbm90ZXMgKi9cbiAgICBwcml2YXRlIGludCBpbnN0cnVtZW50OyAgICAgICAgICAgLyoqIEluc3RydW1lbnQgZm9yIHRoaXMgdHJhY2sgKi9cbiAgICBwcml2YXRlIExpc3Q8TWlkaUV2ZW50PiBseXJpY3M7ICAgLyoqIFRoZSBseXJpY3MgaW4gdGhpcyB0cmFjayAqL1xuXG4gICAgLyoqIENyZWF0ZSBhbiBlbXB0eSBNaWRpVHJhY2suICBVc2VkIGJ5IHRoZSBDbG9uZSBtZXRob2QgKi9cbiAgICBwdWJsaWMgTWlkaVRyYWNrKGludCB0cmFja251bSkge1xuICAgICAgICB0aGlzLnRyYWNrbnVtID0gdHJhY2tudW07XG4gICAgICAgIG5vdGVzID0gbmV3IExpc3Q8TWlkaU5vdGU+KDIwKTtcbiAgICAgICAgaW5zdHJ1bWVudCA9IDA7XG4gICAgfSBcblxuICAgIC8qKiBDcmVhdGUgYSBNaWRpVHJhY2sgYmFzZWQgb24gdGhlIE1pZGkgZXZlbnRzLiAgRXh0cmFjdCB0aGUgTm90ZU9uL05vdGVPZmZcbiAgICAgKiAgZXZlbnRzIHRvIGdhdGhlciB0aGUgbGlzdCBvZiBNaWRpTm90ZXMuXG4gICAgICovXG4gICAgcHVibGljIE1pZGlUcmFjayhMaXN0PE1pZGlFdmVudD4gZXZlbnRzLCBpbnQgdHJhY2tudW0pIHtcbiAgICAgICAgdGhpcy50cmFja251bSA9IHRyYWNrbnVtO1xuICAgICAgICBub3RlcyA9IG5ldyBMaXN0PE1pZGlOb3RlPihldmVudHMuQ291bnQpO1xuICAgICAgICBpbnN0cnVtZW50ID0gMDtcbiBcbiAgICAgICAgZm9yZWFjaCAoTWlkaUV2ZW50IG1ldmVudCBpbiBldmVudHMpIHtcbiAgICAgICAgICAgIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IE1pZGlGaWxlLkV2ZW50Tm90ZU9uICYmIG1ldmVudC5WZWxvY2l0eSA+IDApIHtcbiAgICAgICAgICAgICAgICBNaWRpTm90ZSBub3RlID0gbmV3IE1pZGlOb3RlKG1ldmVudC5TdGFydFRpbWUsIG1ldmVudC5DaGFubmVsLCBtZXZlbnQuTm90ZW51bWJlciwgMCk7XG4gICAgICAgICAgICAgICAgQWRkTm90ZShub3RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gTWlkaUZpbGUuRXZlbnROb3RlT24gJiYgbWV2ZW50LlZlbG9jaXR5ID09IDApIHtcbiAgICAgICAgICAgICAgICBOb3RlT2ZmKG1ldmVudC5DaGFubmVsLCBtZXZlbnQuTm90ZW51bWJlciwgbWV2ZW50LlN0YXJ0VGltZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IE1pZGlGaWxlLkV2ZW50Tm90ZU9mZikge1xuICAgICAgICAgICAgICAgIE5vdGVPZmYobWV2ZW50LkNoYW5uZWwsIG1ldmVudC5Ob3RlbnVtYmVyLCBtZXZlbnQuU3RhcnRUaW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gTWlkaUZpbGUuRXZlbnRQcm9ncmFtQ2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgaW5zdHJ1bWVudCA9IG1ldmVudC5JbnN0cnVtZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50Lk1ldGFldmVudCA9PSBNaWRpRmlsZS5NZXRhRXZlbnRMeXJpYykge1xuICAgICAgICAgICAgICAgIEFkZEx5cmljKG1ldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vdGVzLkNvdW50ID4gMCAmJiBub3Rlc1swXS5DaGFubmVsID09IDkpICB7XG4gICAgICAgICAgICBpbnN0cnVtZW50ID0gMTI4OyAgLyogUGVyY3Vzc2lvbiAqL1xuICAgICAgICB9XG4gICAgICAgIGludCBseXJpY2NvdW50ID0gMDtcbiAgICAgICAgaWYgKGx5cmljcyAhPSBudWxsKSB7IGx5cmljY291bnQgPSBseXJpY3MuQ291bnQ7IH1cbiAgICB9XG5cbiAgICBwdWJsaWMgaW50IE51bWJlciB7XG4gICAgICAgIGdldCB7IHJldHVybiB0cmFja251bTsgfVxuICAgIH1cblxuICAgIHB1YmxpYyBMaXN0PE1pZGlOb3RlPiBOb3RlcyB7XG4gICAgICAgIGdldCB7IHJldHVybiBub3RlczsgfVxuICAgIH1cblxuICAgIHB1YmxpYyBpbnQgSW5zdHJ1bWVudCB7XG4gICAgICAgIGdldCB7IHJldHVybiBpbnN0cnVtZW50OyB9XG4gICAgICAgIHNldCB7IGluc3RydW1lbnQgPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzdHJpbmcgSW5zdHJ1bWVudE5hbWUge1xuICAgICAgICBnZXQgeyBpZiAoaW5zdHJ1bWVudCA+PSAwICYmIGluc3RydW1lbnQgPD0gMTI4KVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIE1pZGlGaWxlLkluc3RydW1lbnRzW2luc3RydW1lbnRdO1xuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgTGlzdDxNaWRpRXZlbnQ+IEx5cmljcyB7XG4gICAgICAgIGdldCB7IHJldHVybiBseXJpY3M7IH1cbiAgICAgICAgc2V0IHsgbHlyaWNzID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogQWRkIGEgTWlkaU5vdGUgdG8gdGhpcyB0cmFjay4gIFRoaXMgaXMgY2FsbGVkIGZvciBlYWNoIE5vdGVPbiBldmVudCAqL1xuICAgIHB1YmxpYyB2b2lkIEFkZE5vdGUoTWlkaU5vdGUgbSkge1xuICAgICAgICBub3Rlcy5BZGQobSk7XG4gICAgfVxuXG4gICAgLyoqIEEgTm90ZU9mZiBldmVudCBvY2N1cmVkLiAgRmluZCB0aGUgTWlkaU5vdGUgb2YgdGhlIGNvcnJlc3BvbmRpbmdcbiAgICAgKiBOb3RlT24gZXZlbnQsIGFuZCB1cGRhdGUgdGhlIGR1cmF0aW9uIG9mIHRoZSBNaWRpTm90ZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBOb3RlT2ZmKGludCBjaGFubmVsLCBpbnQgbm90ZW51bWJlciwgaW50IGVuZHRpbWUpIHtcbiAgICAgICAgZm9yIChpbnQgaSA9IG5vdGVzLkNvdW50LTE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBNaWRpTm90ZSBub3RlID0gbm90ZXNbaV07XG4gICAgICAgICAgICBpZiAobm90ZS5DaGFubmVsID09IGNoYW5uZWwgJiYgbm90ZS5OdW1iZXIgPT0gbm90ZW51bWJlciAmJlxuICAgICAgICAgICAgICAgIG5vdGUuRHVyYXRpb24gPT0gMCkge1xuICAgICAgICAgICAgICAgIG5vdGUuTm90ZU9mZihlbmR0aW1lKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogQWRkIGEgTHlyaWMgTWlkaUV2ZW50ICovXG4gICAgcHVibGljIHZvaWQgQWRkTHlyaWMoTWlkaUV2ZW50IG1ldmVudCkge1xuICAgICAgICBpZiAobHlyaWNzID09IG51bGwpIHtcbiAgICAgICAgICAgIGx5cmljcyA9IG5ldyBMaXN0PE1pZGlFdmVudD4oKTtcbiAgICAgICAgfSBcbiAgICAgICAgbHlyaWNzLkFkZChtZXZlbnQpO1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gYSBkZWVwIGNvcHkgY2xvbmUgb2YgdGhpcyBNaWRpVHJhY2suICovXG4gICAgcHVibGljIE1pZGlUcmFjayBDbG9uZSgpIHtcbiAgICAgICAgTWlkaVRyYWNrIHRyYWNrID0gbmV3IE1pZGlUcmFjayhOdW1iZXIpO1xuICAgICAgICB0cmFjay5pbnN0cnVtZW50ID0gaW5zdHJ1bWVudDtcbiAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiBub3Rlcykge1xuICAgICAgICAgICAgdHJhY2subm90ZXMuQWRkKCBub3RlLkNsb25lKCkgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobHlyaWNzICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRyYWNrLmx5cmljcyA9IG5ldyBMaXN0PE1pZGlFdmVudD4oKTtcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBldiBpbiBseXJpY3MpIHtcbiAgICAgICAgICAgICAgICB0cmFjay5seXJpY3MuQWRkKGV2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJhY2s7XG4gICAgfVxuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHN0cmluZyByZXN1bHQgPSBcIlRyYWNrIG51bWJlcj1cIiArIHRyYWNrbnVtICsgXCIgaW5zdHJ1bWVudD1cIiArIGluc3RydW1lbnQgKyBcIlxcblwiO1xuICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBuIGluIG5vdGVzKSB7XG4gICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdCArIG4gKyBcIlxcblwiO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCArPSBcIkVuZCBUcmFja1xcblwiO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn1cblxufVxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogRW51bWVyYXRpb24gb2YgdGhlIG5vdGVzIGluIGEgc2NhbGUgKEEsIEEjLCAuLi4gRyMpICovXG5wdWJsaWMgY2xhc3MgTm90ZVNjYWxlIHtcbiAgICBwdWJsaWMgY29uc3QgaW50IEEgICAgICA9IDA7XG4gICAgcHVibGljIGNvbnN0IGludCBBc2hhcnAgPSAxO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQmZsYXQgID0gMTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEIgICAgICA9IDI7XG4gICAgcHVibGljIGNvbnN0IGludCBDICAgICAgPSAzO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQ3NoYXJwID0gNDtcbiAgICBwdWJsaWMgY29uc3QgaW50IERmbGF0ICA9IDQ7XG4gICAgcHVibGljIGNvbnN0IGludCBEICAgICAgPSA1O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRHNoYXJwID0gNjtcbiAgICBwdWJsaWMgY29uc3QgaW50IEVmbGF0ICA9IDY7XG4gICAgcHVibGljIGNvbnN0IGludCBFICAgICAgPSA3O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRiAgICAgID0gODtcbiAgICBwdWJsaWMgY29uc3QgaW50IEZzaGFycCA9IDk7XG4gICAgcHVibGljIGNvbnN0IGludCBHZmxhdCAgPSA5O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRyAgICAgID0gMTA7XG4gICAgcHVibGljIGNvbnN0IGludCBHc2hhcnAgPSAxMTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEFmbGF0ICA9IDExO1xuXG4gICAgLyoqIENvbnZlcnQgYSBub3RlIChBLCBBIywgQiwgZXRjKSBhbmQgb2N0YXZlIGludG8gYVxuICAgICAqIE1pZGkgTm90ZSBudW1iZXIuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBpbnQgVG9OdW1iZXIoaW50IG5vdGVzY2FsZSwgaW50IG9jdGF2ZSkge1xuICAgICAgICByZXR1cm4gOSArIG5vdGVzY2FsZSArIG9jdGF2ZSAqIDEyO1xuICAgIH1cblxuICAgIC8qKiBDb252ZXJ0IGEgTWlkaSBub3RlIG51bWJlciBpbnRvIGEgbm90ZXNjYWxlIChBLCBBIywgQikgKi9cbiAgICBwdWJsaWMgc3RhdGljIGludCBGcm9tTnVtYmVyKGludCBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIChudW1iZXIgKyAzKSAlIDEyO1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGlzIG5vdGVzY2FsZSBudW1iZXIgaXMgYSBibGFjayBrZXkgKi9cbiAgICBwdWJsaWMgc3RhdGljIGJvb2wgSXNCbGFja0tleShpbnQgbm90ZXNjYWxlKSB7XG4gICAgICAgIGlmIChub3Rlc2NhbGUgPT0gQXNoYXJwIHx8XG4gICAgICAgICAgICBub3Rlc2NhbGUgPT0gQ3NoYXJwIHx8XG4gICAgICAgICAgICBub3Rlc2NhbGUgPT0gRHNoYXJwIHx8XG4gICAgICAgICAgICBub3Rlc2NhbGUgPT0gRnNoYXJwIHx8XG4gICAgICAgICAgICBub3Rlc2NhbGUgPT0gR3NoYXJwKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbi8qKiBAY2xhc3MgV2hpdGVOb3RlXG4gKiBUaGUgV2hpdGVOb3RlIGNsYXNzIHJlcHJlc2VudHMgYSB3aGl0ZSBrZXkgbm90ZSwgYSBub24tc2hhcnAsXG4gKiBub24tZmxhdCBub3RlLiAgVG8gZGlzcGxheSBtaWRpIG5vdGVzIGFzIHNoZWV0IG11c2ljLCB0aGUgbm90ZXNcbiAqIG11c3QgYmUgY29udmVydGVkIHRvIHdoaXRlIG5vdGVzIGFuZCBhY2NpZGVudGFscy4gXG4gKlxuICogV2hpdGUgbm90ZXMgY29uc2lzdCBvZiBhIGxldHRlciAoQSB0aHJ1IEcpIGFuZCBhbiBvY3RhdmUgKDAgdGhydSAxMCkuXG4gKiBUaGUgb2N0YXZlIGNoYW5nZXMgZnJvbSBHIHRvIEEuICBBZnRlciBHMiBjb21lcyBBMy4gIE1pZGRsZS1DIGlzIEM0LlxuICpcbiAqIFRoZSBtYWluIG9wZXJhdGlvbnMgYXJlIGNhbGN1bGF0aW5nIGRpc3RhbmNlcyBiZXR3ZWVuIG5vdGVzLCBhbmQgY29tcGFyaW5nIG5vdGVzLlxuICovIFxuXG5wdWJsaWMgY2xhc3MgV2hpdGVOb3RlIDogSUNvbXBhcmVyPFdoaXRlTm90ZT4ge1xuXG4gICAgLyogVGhlIHBvc3NpYmxlIG5vdGUgbGV0dGVycyAqL1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQSA9IDA7XG4gICAgcHVibGljIGNvbnN0IGludCBCID0gMTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEMgPSAyO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRCA9IDM7XG4gICAgcHVibGljIGNvbnN0IGludCBFID0gNDtcbiAgICBwdWJsaWMgY29uc3QgaW50IEYgPSA1O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRyA9IDY7XG5cbiAgICAvKiBDb21tb24gd2hpdGUgbm90ZXMgdXNlZCBpbiBjYWxjdWxhdGlvbnMgKi9cbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBUb3BUcmVibGUgPSBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5FLCA1KTtcbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBCb3R0b21UcmVibGUgPSBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5GLCA0KTtcbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBUb3BCYXNzID0gbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRywgMyk7XG4gICAgcHVibGljIHN0YXRpYyBXaGl0ZU5vdGUgQm90dG9tQmFzcyA9IG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkEsIDMpO1xuICAgIHB1YmxpYyBzdGF0aWMgV2hpdGVOb3RlIE1pZGRsZUMgPSBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5DLCA0KTtcblxuICAgIHByaXZhdGUgaW50IGxldHRlcjsgIC8qIFRoZSBsZXR0ZXIgb2YgdGhlIG5vdGUsIEEgdGhydSBHICovXG4gICAgcHJpdmF0ZSBpbnQgb2N0YXZlOyAgLyogVGhlIG9jdGF2ZSwgMCB0aHJ1IDEwLiAqL1xuXG4gICAgLyogR2V0IHRoZSBsZXR0ZXIgKi9cbiAgICBwdWJsaWMgaW50IExldHRlciB7XG4gICAgICAgIGdldCB7IHJldHVybiBsZXR0ZXI7IH1cbiAgICB9XG5cbiAgICAvKiBHZXQgdGhlIG9jdGF2ZSAqL1xuICAgIHB1YmxpYyBpbnQgT2N0YXZlIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIG9jdGF2ZTsgfVxuICAgIH1cblxuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBub3RlIHdpdGggdGhlIGdpdmVuIGxldHRlciBhbmQgb2N0YXZlLiAqL1xuICAgIHB1YmxpYyBXaGl0ZU5vdGUoaW50IGxldHRlciwgaW50IG9jdGF2ZSkge1xuICAgICAgICBpZiAoIShsZXR0ZXIgPj0gMCAmJiBsZXR0ZXIgPD0gNikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBTeXN0ZW0uQXJndW1lbnRFeGNlcHRpb24oXCJMZXR0ZXIgXCIgKyBsZXR0ZXIgKyBcIiBpcyBpbmNvcnJlY3RcIik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxldHRlciA9IGxldHRlcjtcbiAgICAgICAgdGhpcy5vY3RhdmUgPSBvY3RhdmU7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgZGlzdGFuY2UgKGluIHdoaXRlIG5vdGVzKSBiZXR3ZWVuIHRoaXMgbm90ZVxuICAgICAqIGFuZCBub3RlIHcsIGkuZS4gIHRoaXMgLSB3LiAgRm9yIGV4YW1wbGUsIEM0IC0gQTQgPSAyLFxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgRGlzdChXaGl0ZU5vdGUgdykge1xuICAgICAgICByZXR1cm4gKG9jdGF2ZSAtIHcub2N0YXZlKSAqIDcgKyAobGV0dGVyIC0gdy5sZXR0ZXIpO1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhpcyBub3RlIHBsdXMgdGhlIGdpdmVuIGFtb3VudCAoaW4gd2hpdGUgbm90ZXMpLlxuICAgICAqIFRoZSBhbW91bnQgbWF5IGJlIHBvc2l0aXZlIG9yIG5lZ2F0aXZlLiAgRm9yIGV4YW1wbGUsXG4gICAgICogQTQgKyAyID0gQzQsIGFuZCBDNCArICgtMikgPSBBNC5cbiAgICAgKi9cbiAgICBwdWJsaWMgV2hpdGVOb3RlIEFkZChpbnQgYW1vdW50KSB7XG4gICAgICAgIGludCBudW0gPSBvY3RhdmUgKiA3ICsgbGV0dGVyO1xuICAgICAgICBudW0gKz0gYW1vdW50O1xuICAgICAgICBpZiAobnVtIDwgMCkge1xuICAgICAgICAgICAgbnVtID0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFdoaXRlTm90ZShudW0gJSA3LCBudW0gLyA3KTtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBtaWRpIG5vdGUgbnVtYmVyIGNvcnJlc3BvbmRpbmcgdG8gdGhpcyB3aGl0ZSBub3RlLlxuICAgICAqIFRoZSBtaWRpIG5vdGUgbnVtYmVycyBjb3ZlciBhbGwga2V5cywgaW5jbHVkaW5nIHNoYXJwcy9mbGF0cyxcbiAgICAgKiBzbyBlYWNoIG9jdGF2ZSBpcyAxMiBub3Rlcy4gIE1pZGRsZSBDIChDNCkgaXMgNjAuICBTb21lIGV4YW1wbGVcbiAgICAgKiBudW1iZXJzIGZvciB2YXJpb3VzIG5vdGVzOlxuICAgICAqXG4gICAgICogIEEgMiA9IDMzXG4gICAgICogIEEjMiA9IDM0XG4gICAgICogIEcgMiA9IDQzXG4gICAgICogIEcjMiA9IDQ0IFxuICAgICAqICBBIDMgPSA0NVxuICAgICAqICBBIDQgPSA1N1xuICAgICAqICBBIzQgPSA1OFxuICAgICAqICBCIDQgPSA1OVxuICAgICAqICBDIDQgPSA2MFxuICAgICAqL1xuXG4gICAgcHVibGljIGludCBOdW1iZXIoKSB7XG4gICAgICAgIGludCBvZmZzZXQgPSAwO1xuICAgICAgICBzd2l0Y2ggKGxldHRlcikge1xuICAgICAgICAgICAgY2FzZSBBOiBvZmZzZXQgPSBOb3RlU2NhbGUuQTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEI6IG9mZnNldCA9IE5vdGVTY2FsZS5COyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQzogb2Zmc2V0ID0gTm90ZVNjYWxlLkM7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBEOiBvZmZzZXQgPSBOb3RlU2NhbGUuRDsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEU6IG9mZnNldCA9IE5vdGVTY2FsZS5FOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgRjogb2Zmc2V0ID0gTm90ZVNjYWxlLkY7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBHOiBvZmZzZXQgPSBOb3RlU2NhbGUuRzsgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OiBvZmZzZXQgPSAwOyBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTm90ZVNjYWxlLlRvTnVtYmVyKG9mZnNldCwgb2N0YXZlKTtcbiAgICB9XG5cbiAgICAvKiogQ29tcGFyZSB0aGUgdHdvIG5vdGVzLiAgUmV0dXJuXG4gICAgICogIDwgMCAgaWYgeCBpcyBsZXNzIChsb3dlcikgdGhhbiB5XG4gICAgICogICAgMCAgaWYgeCBpcyBlcXVhbCB0byB5XG4gICAgICogID4gMCAgaWYgeCBpcyBncmVhdGVyIChoaWdoZXIpIHRoYW4geVxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgQ29tcGFyZShXaGl0ZU5vdGUgeCwgV2hpdGVOb3RlIHkpIHtcbiAgICAgICAgcmV0dXJuIHguRGlzdCh5KTtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBoaWdoZXIgbm90ZSwgeCBvciB5ICovXG4gICAgcHVibGljIHN0YXRpYyBXaGl0ZU5vdGUgTWF4KFdoaXRlTm90ZSB4LCBXaGl0ZU5vdGUgeSkge1xuICAgICAgICBpZiAoeC5EaXN0KHkpID4gMClcbiAgICAgICAgICAgIHJldHVybiB4O1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4geTtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBsb3dlciBub3RlLCB4IG9yIHkgKi9cbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBNaW4oV2hpdGVOb3RlIHgsIFdoaXRlTm90ZSB5KSB7XG4gICAgICAgIGlmICh4LkRpc3QoeSkgPCAwKVxuICAgICAgICAgICAgcmV0dXJuIHg7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB5O1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIHRvcCBub3RlIGluIHRoZSBzdGFmZiBvZiB0aGUgZ2l2ZW4gY2xlZiAqL1xuICAgIHB1YmxpYyBzdGF0aWMgV2hpdGVOb3RlIFRvcChDbGVmIGNsZWYpIHtcbiAgICAgICAgaWYgKGNsZWYgPT0gQ2xlZi5UcmVibGUpXG4gICAgICAgICAgICByZXR1cm4gVG9wVHJlYmxlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gVG9wQmFzcztcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBib3R0b20gbm90ZSBpbiB0aGUgc3RhZmYgb2YgdGhlIGdpdmVuIGNsZWYgKi9cbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBCb3R0b20oQ2xlZiBjbGVmKSB7XG4gICAgICAgIGlmIChjbGVmID09IENsZWYuVHJlYmxlKVxuICAgICAgICAgICAgcmV0dXJuIEJvdHRvbVRyZWJsZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIEJvdHRvbUJhc3M7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgc3RyaW5nIDxsZXR0ZXI+PG9jdGF2ZT4gZm9yIHRoaXMgbm90ZS4gKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgXG4gICAgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICBzdHJpbmdbXSBzID0geyBcIkFcIiwgXCJCXCIsIFwiQ1wiLCBcIkRcIiwgXCJFXCIsIFwiRlwiLCBcIkdcIiB9O1xuICAgICAgICByZXR1cm4gc1tsZXR0ZXJdICsgb2N0YXZlO1xuICAgIH1cbn1cblxuXG5cbn1cbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBQYWludEV2ZW50QXJnc1xyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBSZWN0YW5nbGUgQ2xpcFJlY3RhbmdsZSB7IGdldDsgc2V0OyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBHcmFwaGljcyBHcmFwaGljcygpIHsgcmV0dXJuIG5ldyBHcmFwaGljcyhcIm1haW5cIik7IH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgUGFuZWxcclxuICAgIHtcclxuICAgICAgICBwcml2YXRlIFBvaW50IGF1dG9TY3JvbGxQb3NpdGlvbj1uZXcgUG9pbnQoMCwwKTtcclxuICAgICAgICBwdWJsaWMgUG9pbnQgQXV0b1Njcm9sbFBvc2l0aW9uIHsgZ2V0IHsgcmV0dXJuIGF1dG9TY3JvbGxQb3NpdGlvbjsgfSBzZXQgeyBhdXRvU2Nyb2xsUG9zaXRpb24gPSB2YWx1ZTsgfSB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBpbnQgV2lkdGg7XHJcbiAgICAgICAgcHVibGljIGludCBIZWlnaHQ7XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIHN0YXRpYyBjbGFzcyBQYXRoXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBzdHJpbmcgR2V0RmlsZU5hbWUoc3RyaW5nIGZpbGVuYW1lKSB7IHJldHVybiBudWxsOyB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFBlblxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBDb2xvciBDb2xvcjtcclxuICAgICAgICBwdWJsaWMgaW50IFdpZHRoO1xyXG4gICAgICAgIHB1YmxpYyBMaW5lQ2FwIEVuZENhcDtcclxuXHJcbiAgICAgICAgcHVibGljIFBlbihDb2xvciBjb2xvciwgaW50IHdpZHRoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQ29sb3IgPSBjb2xvcjtcclxuICAgICAgICAgICAgV2lkdGggPSB3aWR0aDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFBvaW50XHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIGludCBYO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgWTtcclxuXHJcbiAgICAgICAgcHVibGljIFBvaW50KGludCB4LCBpbnQgeSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFggPSB4O1xyXG4gICAgICAgICAgICBZID0geTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFJlY3RhbmdsZVxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBpbnQgWDtcclxuICAgICAgICBwdWJsaWMgaW50IFk7XHJcbiAgICAgICAgcHVibGljIGludCBXaWR0aDtcclxuICAgICAgICBwdWJsaWMgaW50IEhlaWdodDtcclxuXHJcbiAgICAgICAgcHVibGljIFJlY3RhbmdsZShpbnQgeCwgaW50IHksIGludCB3aWR0aCwgaW50IGhlaWdodClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFggPSB4O1xyXG4gICAgICAgICAgICBZID0geTtcclxuICAgICAgICAgICAgV2lkdGggPSB3aWR0aDtcclxuICAgICAgICAgICAgSGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcblxyXG4gICAgLyogQGNsYXNzIFN0YWZmXHJcbiAgICAgKiBUaGUgU3RhZmYgaXMgdXNlZCB0byBkcmF3IGEgc2luZ2xlIFN0YWZmIChhIHJvdyBvZiBtZWFzdXJlcykgaW4gdGhlIFxyXG4gICAgICogU2hlZXRNdXNpYyBDb250cm9sLiBBIFN0YWZmIG5lZWRzIHRvIGRyYXdcclxuICAgICAqIC0gVGhlIENsZWZcclxuICAgICAqIC0gVGhlIGtleSBzaWduYXR1cmVcclxuICAgICAqIC0gVGhlIGhvcml6b250YWwgbGluZXNcclxuICAgICAqIC0gQSBsaXN0IG9mIE11c2ljU3ltYm9sc1xyXG4gICAgICogLSBUaGUgbGVmdCBhbmQgcmlnaHQgdmVydGljYWwgbGluZXNcclxuICAgICAqXHJcbiAgICAgKiBUaGUgaGVpZ2h0IG9mIHRoZSBTdGFmZiBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBudW1iZXIgb2YgcGl4ZWxzIGVhY2hcclxuICAgICAqIE11c2ljU3ltYm9sIGV4dGVuZHMgYWJvdmUgYW5kIGJlbG93IHRoZSBzdGFmZi5cclxuICAgICAqXHJcbiAgICAgKiBUaGUgdmVydGljYWwgbGluZXMgKGxlZnQgYW5kIHJpZ2h0IHNpZGVzKSBvZiB0aGUgc3RhZmYgYXJlIGpvaW5lZFxyXG4gICAgICogd2l0aCB0aGUgc3RhZmZzIGFib3ZlIGFuZCBiZWxvdyBpdCwgd2l0aCBvbmUgZXhjZXB0aW9uLiAgXHJcbiAgICAgKiBUaGUgbGFzdCB0cmFjayBpcyBub3Qgam9pbmVkIHdpdGggdGhlIGZpcnN0IHRyYWNrLlxyXG4gICAgICovXHJcblxyXG4gICAgcHVibGljIGNsYXNzIFN0YWZmXHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSBMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzOyAgLyoqIFRoZSBtdXNpYyBzeW1ib2xzIGluIHRoaXMgc3RhZmYgKi9cclxuICAgICAgICBwcml2YXRlIExpc3Q8THlyaWNTeW1ib2w+IGx5cmljczsgICAvKiogVGhlIGx5cmljcyB0byBkaXNwbGF5IChjYW4gYmUgbnVsbCkgKi9cclxuICAgICAgICBwcml2YXRlIGludCB5dG9wOyAgICAgICAgICAgICAgICAgICAvKiogVGhlIHkgcGl4ZWwgb2YgdGhlIHRvcCBvZiB0aGUgc3RhZmYgKi9cclxuICAgICAgICBwcml2YXRlIENsZWZTeW1ib2wgY2xlZnN5bTsgICAgICAgICAvKiogVGhlIGxlZnQtc2lkZSBDbGVmIHN5bWJvbCAqL1xyXG4gICAgICAgIHByaXZhdGUgQWNjaWRTeW1ib2xbXSBrZXlzOyAgICAgICAgIC8qKiBUaGUga2V5IHNpZ25hdHVyZSBzeW1ib2xzICovXHJcbiAgICAgICAgcHJpdmF0ZSBib29sIHNob3dNZWFzdXJlczsgICAgICAgICAgLyoqIElmIHRydWUsIHNob3cgdGhlIG1lYXN1cmUgbnVtYmVycyAqL1xyXG4gICAgICAgIHByaXZhdGUgaW50IGtleXNpZ1dpZHRoOyAgICAgICAgICAgIC8qKiBUaGUgd2lkdGggb2YgdGhlIGNsZWYgYW5kIGtleSBzaWduYXR1cmUgKi9cclxuICAgICAgICBwcml2YXRlIGludCB3aWR0aDsgICAgICAgICAgICAgICAgICAvKiogVGhlIHdpZHRoIG9mIHRoZSBzdGFmZiBpbiBwaXhlbHMgKi9cclxuICAgICAgICBwcml2YXRlIGludCBoZWlnaHQ7ICAgICAgICAgICAgICAgICAvKiogVGhlIGhlaWdodCBvZiB0aGUgc3RhZmYgaW4gcGl4ZWxzICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgdHJhY2tudW07ICAgICAgICAgICAgICAgLyoqIFRoZSB0cmFjayB0aGlzIHN0YWZmIHJlcHJlc2VudHMgKi9cclxuICAgICAgICBwcml2YXRlIGludCB0b3RhbHRyYWNrczsgICAgICAgICAgICAvKiogVGhlIHRvdGFsIG51bWJlciBvZiB0cmFja3MgKi9cclxuICAgICAgICBwcml2YXRlIGludCBzdGFydHRpbWU7ICAgICAgICAgICAgICAvKiogVGhlIHRpbWUgKGluIHB1bHNlcykgb2YgZmlyc3Qgc3ltYm9sICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgZW5kdGltZTsgICAgICAgICAgICAgICAgLyoqIFRoZSB0aW1lIChpbiBwdWxzZXMpIG9mIGxhc3Qgc3ltYm9sICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgbWVhc3VyZUxlbmd0aDsgICAgICAgICAgLyoqIFRoZSB0aW1lIChpbiBwdWxzZXMpIG9mIGEgbWVhc3VyZSAqL1xyXG5cclxuICAgICAgICAvKiogQ3JlYXRlIGEgbmV3IHN0YWZmIHdpdGggdGhlIGdpdmVuIGxpc3Qgb2YgbXVzaWMgc3ltYm9scyxcbiAgICAgICAgICogYW5kIHRoZSBnaXZlbiBrZXkgc2lnbmF0dXJlLiAgVGhlIGNsZWYgaXMgZGV0ZXJtaW5lZCBieVxuICAgICAgICAgKiB0aGUgY2xlZiBvZiB0aGUgZmlyc3QgY2hvcmQgc3ltYm9sLiBUaGUgdHJhY2sgbnVtYmVyIGlzIHVzZWRcbiAgICAgICAgICogdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdG8gam9pbiB0aGlzIGxlZnQvcmlnaHQgdmVydGljYWwgc2lkZXNcbiAgICAgICAgICogd2l0aCB0aGUgc3RhZmZzIGFib3ZlIGFuZCBiZWxvdy4gVGhlIFNoZWV0TXVzaWNPcHRpb25zIGFyZSB1c2VkXG4gICAgICAgICAqIHRvIGNoZWNrIHdoZXRoZXIgdG8gZGlzcGxheSBtZWFzdXJlIG51bWJlcnMgb3Igbm90LlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgU3RhZmYoTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scywgS2V5U2lnbmF0dXJlIGtleSxcclxuICAgICAgICAgICAgICAgICAgICAgTWlkaU9wdGlvbnMgb3B0aW9ucyxcclxuICAgICAgICAgICAgICAgICAgICAgaW50IHRyYWNrbnVtLCBpbnQgdG90YWx0cmFja3MpXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICAgICAga2V5c2lnV2lkdGggPSBTaGVldE11c2ljLktleVNpZ25hdHVyZVdpZHRoKGtleSk7XHJcbiAgICAgICAgICAgIHRoaXMudHJhY2tudW0gPSB0cmFja251bTtcclxuICAgICAgICAgICAgdGhpcy50b3RhbHRyYWNrcyA9IHRvdGFsdHJhY2tzO1xyXG4gICAgICAgICAgICBzaG93TWVhc3VyZXMgPSAob3B0aW9ucy5zaG93TWVhc3VyZXMgJiYgdHJhY2tudW0gPT0gMCk7XHJcbiAgICAgICAgICAgIG1lYXN1cmVMZW5ndGggPSBvcHRpb25zLnRpbWUuTWVhc3VyZTtcclxuICAgICAgICAgICAgQ2xlZiBjbGVmID0gRmluZENsZWYoc3ltYm9scyk7XHJcblxyXG4gICAgICAgICAgICBjbGVmc3ltID0gbmV3IENsZWZTeW1ib2woY2xlZiwgMCwgZmFsc2UpO1xyXG4gICAgICAgICAgICBrZXlzID0ga2V5LkdldFN5bWJvbHMoY2xlZik7XHJcbiAgICAgICAgICAgIHRoaXMuc3ltYm9scyA9IHN5bWJvbHM7XHJcbiAgICAgICAgICAgIENhbGN1bGF0ZVdpZHRoKG9wdGlvbnMuc2Nyb2xsVmVydCk7XHJcbiAgICAgICAgICAgIENhbGN1bGF0ZUhlaWdodCgpO1xyXG4gICAgICAgICAgICBDYWxjdWxhdGVTdGFydEVuZFRpbWUoKTtcclxuICAgICAgICAgICAgRnVsbEp1c3RpZnkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBSZXR1cm4gdGhlIHdpZHRoIG9mIHRoZSBzdGFmZiAqL1xyXG4gICAgICAgIHB1YmxpYyBpbnQgV2lkdGhcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdldCB7IHJldHVybiB3aWR0aDsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFJldHVybiB0aGUgaGVpZ2h0IG9mIHRoZSBzdGFmZiAqL1xyXG4gICAgICAgIHB1YmxpYyBpbnQgSGVpZ2h0XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gaGVpZ2h0OyB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogUmV0dXJuIHRoZSB0cmFjayBudW1iZXIgb2YgdGhpcyBzdGFmZiAoc3RhcnRpbmcgZnJvbSAwICovXHJcbiAgICAgICAgcHVibGljIGludCBUcmFja1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIHRyYWNrbnVtOyB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogUmV0dXJuIHRoZSBzdGFydGluZyB0aW1lIG9mIHRoZSBzdGFmZiwgdGhlIHN0YXJ0IHRpbWUgb2ZcbiAgICAgICAgICogIHRoZSBmaXJzdCBzeW1ib2wuICBUaGlzIGlzIHVzZWQgZHVyaW5nIHBsYXliYWNrLCB0byBcbiAgICAgICAgICogIGF1dG9tYXRpY2FsbHkgc2Nyb2xsIHRoZSBtdXNpYyB3aGlsZSBwbGF5aW5nLlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgaW50IFN0YXJ0VGltZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIHN0YXJ0dGltZTsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFJldHVybiB0aGUgZW5kaW5nIHRpbWUgb2YgdGhlIHN0YWZmLCB0aGUgZW5kdGltZSBvZlxuICAgICAgICAgKiAgdGhlIGxhc3Qgc3ltYm9sLiAgVGhpcyBpcyB1c2VkIGR1cmluZyBwbGF5YmFjaywgdG8gXG4gICAgICAgICAqICBhdXRvbWF0aWNhbGx5IHNjcm9sbCB0aGUgbXVzaWMgd2hpbGUgcGxheWluZy5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGludCBFbmRUaW1lXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gZW5kdGltZTsgfVxyXG4gICAgICAgICAgICBzZXQgeyBlbmR0aW1lID0gdmFsdWU7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBGaW5kIHRoZSBpbml0aWFsIGNsZWYgdG8gdXNlIGZvciB0aGlzIHN0YWZmLiAgVXNlIHRoZSBjbGVmIG9mXG4gICAgICAgICAqIHRoZSBmaXJzdCBDaG9yZFN5bWJvbC5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBDbGVmIEZpbmRDbGVmKExpc3Q8TXVzaWNTeW1ib2w+IGxpc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBtIGluIGxpc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChtIGlzIENob3JkU3ltYm9sKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIENob3JkU3ltYm9sIGMgPSAoQ2hvcmRTeW1ib2wpbTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYy5DbGVmO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBDbGVmLlRyZWJsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBDYWxjdWxhdGUgdGhlIGhlaWdodCBvZiB0aGlzIHN0YWZmLiAgRWFjaCBNdXNpY1N5bWJvbCBjb250YWlucyB0aGVcbiAgICAgICAgICogbnVtYmVyIG9mIHBpeGVscyBpdCBuZWVkcyBhYm92ZSBhbmQgYmVsb3cgdGhlIHN0YWZmLiAgR2V0IHRoZSBtYXhpbXVtXG4gICAgICAgICAqIHZhbHVlcyBhYm92ZSBhbmQgYmVsb3cgdGhlIHN0YWZmLlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgdm9pZCBDYWxjdWxhdGVIZWlnaHQoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW50IGFib3ZlID0gMDtcclxuICAgICAgICAgICAgaW50IGJlbG93ID0gMDtcclxuXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHMgaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgYWJvdmUgPSBNYXRoLk1heChhYm92ZSwgcy5BYm92ZVN0YWZmKTtcclxuICAgICAgICAgICAgICAgIGJlbG93ID0gTWF0aC5NYXgoYmVsb3csIHMuQmVsb3dTdGFmZik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYWJvdmUgPSBNYXRoLk1heChhYm92ZSwgY2xlZnN5bS5BYm92ZVN0YWZmKTtcclxuICAgICAgICAgICAgYmVsb3cgPSBNYXRoLk1heChiZWxvdywgY2xlZnN5bS5CZWxvd1N0YWZmKTtcclxuICAgICAgICAgICAgaWYgKHNob3dNZWFzdXJlcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgYWJvdmUgPSBNYXRoLk1heChhYm92ZSwgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgeXRvcCA9IGFib3ZlICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xyXG4gICAgICAgICAgICBoZWlnaHQgPSBTaGVldE11c2ljLk5vdGVIZWlnaHQgKiA1ICsgeXRvcCArIGJlbG93O1xyXG4gICAgICAgICAgICBpZiAobHlyaWNzICE9IG51bGwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGhlaWdodCArPSAxMjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLyogQWRkIHNvbWUgZXh0cmEgdmVydGljYWwgc3BhY2UgYmV0d2VlbiB0aGUgbGFzdCB0cmFja1xyXG4gICAgICAgICAgICAgKiBhbmQgZmlyc3QgdHJhY2suXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBpZiAodHJhY2tudW0gPT0gdG90YWx0cmFja3MgLSAxKVxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ICs9IFNoZWV0TXVzaWMuTm90ZUhlaWdodCAqIDM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogQ2FsY3VsYXRlIHRoZSB3aWR0aCBvZiB0aGlzIHN0YWZmICovXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIENhbGN1bGF0ZVdpZHRoKGJvb2wgc2Nyb2xsVmVydClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChzY3JvbGxWZXJ0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB3aWR0aCA9IFNoZWV0TXVzaWMuUGFnZVdpZHRoO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHdpZHRoID0ga2V5c2lnV2lkdGg7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHMgaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgd2lkdGggKz0gcy5XaWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBDYWxjdWxhdGUgdGhlIHN0YXJ0IGFuZCBlbmQgdGltZSBvZiB0aGlzIHN0YWZmLiAqL1xyXG4gICAgICAgIHByaXZhdGUgdm9pZCBDYWxjdWxhdGVTdGFydEVuZFRpbWUoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3RhcnR0aW1lID0gZW5kdGltZSA9IDA7XHJcbiAgICAgICAgICAgIGlmIChzeW1ib2xzLkNvdW50ID09IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdGFydHRpbWUgPSBzeW1ib2xzWzBdLlN0YXJ0VGltZTtcclxuICAgICAgICAgICAgZm9yZWFjaCAoTXVzaWNTeW1ib2wgbSBpbiBzeW1ib2xzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZW5kdGltZSA8IG0uU3RhcnRUaW1lKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuZHRpbWUgPSBtLlN0YXJ0VGltZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChtIGlzIENob3JkU3ltYm9sKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIENob3JkU3ltYm9sIGMgPSAoQ2hvcmRTeW1ib2wpbTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZW5kdGltZSA8IGMuRW5kVGltZSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZHRpbWUgPSBjLkVuZFRpbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIEZ1bGwtSnVzdGlmeSB0aGUgc3ltYm9scywgc28gdGhhdCB0aGV5IGV4cGFuZCB0byBmaWxsIHRoZSB3aG9sZSBzdGFmZi4gKi9cclxuICAgICAgICBwcml2YXRlIHZvaWQgRnVsbEp1c3RpZnkoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHdpZHRoICE9IFNoZWV0TXVzaWMuUGFnZVdpZHRoKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgaW50IHRvdGFsd2lkdGggPSBrZXlzaWdXaWR0aDtcclxuICAgICAgICAgICAgaW50IHRvdGFsc3ltYm9scyA9IDA7XHJcbiAgICAgICAgICAgIGludCBpID0gMDtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlIChpIDwgc3ltYm9scy5Db3VudClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IHN0YXJ0ID0gc3ltYm9sc1tpXS5TdGFydFRpbWU7XHJcbiAgICAgICAgICAgICAgICB0b3RhbHN5bWJvbHMrKztcclxuICAgICAgICAgICAgICAgIHRvdGFsd2lkdGggKz0gc3ltYm9sc1tpXS5XaWR0aDtcclxuICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgc3ltYm9scy5Db3VudCAmJiBzeW1ib2xzW2ldLlN0YXJ0VGltZSA9PSBzdGFydClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0b3RhbHdpZHRoICs9IHN5bWJvbHNbaV0uV2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpbnQgZXh0cmF3aWR0aCA9IChTaGVldE11c2ljLlBhZ2VXaWR0aCAtIHRvdGFsd2lkdGggLSAxKSAvIHRvdGFsc3ltYm9scztcclxuICAgICAgICAgICAgaWYgKGV4dHJhd2lkdGggPiBTaGVldE11c2ljLk5vdGVIZWlnaHQgKiAyKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBleHRyYXdpZHRoID0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpID0gMDtcclxuICAgICAgICAgICAgd2hpbGUgKGkgPCBzeW1ib2xzLkNvdW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgc3RhcnQgPSBzeW1ib2xzW2ldLlN0YXJ0VGltZTtcclxuICAgICAgICAgICAgICAgIHN5bWJvbHNbaV0uV2lkdGggKz0gZXh0cmF3aWR0aDtcclxuICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgc3ltYm9scy5Db3VudCAmJiBzeW1ib2xzW2ldLlN0YXJ0VGltZSA9PSBzdGFydClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogQWRkIHRoZSBseXJpYyBzeW1ib2xzIHRoYXQgb2NjdXIgd2l0aGluIHRoaXMgc3RhZmYuXG4gICAgICAgICAqICBTZXQgdGhlIHgtcG9zaXRpb24gb2YgdGhlIGx5cmljIHN5bWJvbC4gXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyB2b2lkIEFkZEx5cmljcyhMaXN0PEx5cmljU3ltYm9sPiB0cmFja2x5cmljcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0cmFja2x5cmljcyA9PSBudWxsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbHlyaWNzID0gbmV3IExpc3Q8THlyaWNTeW1ib2w+KCk7XHJcbiAgICAgICAgICAgIGludCB4cG9zID0gMDtcclxuICAgICAgICAgICAgaW50IHN5bWJvbGluZGV4ID0gMDtcclxuICAgICAgICAgICAgZm9yZWFjaCAoTHlyaWNTeW1ib2wgbHlyaWMgaW4gdHJhY2tseXJpY3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChseXJpYy5TdGFydFRpbWUgPCBzdGFydHRpbWUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAobHlyaWMuU3RhcnRUaW1lID4gZW5kdGltZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8qIEdldCB0aGUgeC1wb3NpdGlvbiBvZiB0aGlzIGx5cmljICovXHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoc3ltYm9saW5kZXggPCBzeW1ib2xzLkNvdW50ICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgc3ltYm9sc1tzeW1ib2xpbmRleF0uU3RhcnRUaW1lIDwgbHlyaWMuU3RhcnRUaW1lKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHhwb3MgKz0gc3ltYm9sc1tzeW1ib2xpbmRleF0uV2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgc3ltYm9saW5kZXgrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGx5cmljLlggPSB4cG9zO1xyXG4gICAgICAgICAgICAgICAgaWYgKHN5bWJvbGluZGV4IDwgc3ltYm9scy5Db3VudCAmJlxyXG4gICAgICAgICAgICAgICAgICAgIChzeW1ib2xzW3N5bWJvbGluZGV4XSBpcyBCYXJTeW1ib2wpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGx5cmljLlggKz0gU2hlZXRNdXNpYy5Ob3RlV2lkdGg7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBseXJpY3MuQWRkKGx5cmljKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobHlyaWNzLkNvdW50ID09IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGx5cmljcyA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogRHJhdyB0aGUgbHlyaWNzICovXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIERyYXdMeXJpY3MoR3JhcGhpY3MgZywgUGVuIHBlbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8qIFNraXAgdGhlIGxlZnQgc2lkZSBDbGVmIHN5bWJvbCBhbmQga2V5IHNpZ25hdHVyZSAqL1xyXG4gICAgICAgICAgICBpbnQgeHBvcyA9IGtleXNpZ1dpZHRoO1xyXG4gICAgICAgICAgICBpbnQgeXBvcyA9IGhlaWdodCAtIDEyO1xyXG5cclxuICAgICAgICAgICAgZm9yZWFjaCAoTHlyaWNTeW1ib2wgbHlyaWMgaW4gbHlyaWNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnLkRyYXdTdHJpbmcobHlyaWMuVGV4dCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxldHRlckZvbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQnJ1c2hlcy5CbGFjayxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4cG9zICsgbHlyaWMuWCwgeXBvcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBEcmF3IHRoZSBtZWFzdXJlIG51bWJlcnMgZm9yIGVhY2ggbWVhc3VyZSAqL1xyXG4gICAgICAgIHByaXZhdGUgdm9pZCBEcmF3TWVhc3VyZU51bWJlcnMoR3JhcGhpY3MgZywgUGVuIHBlbilcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICAvKiBTa2lwIHRoZSBsZWZ0IHNpZGUgQ2xlZiBzeW1ib2wgYW5kIGtleSBzaWduYXR1cmUgKi9cclxuICAgICAgICAgICAgaW50IHhwb3MgPSBrZXlzaWdXaWR0aDtcclxuICAgICAgICAgICAgaW50IHlwb3MgPSB5dG9wIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMztcclxuXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHMgaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHMgaXMgQmFyU3ltYm9sKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBtZWFzdXJlID0gMSArIHMuU3RhcnRUaW1lIC8gbWVhc3VyZUxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICBnLkRyYXdTdHJpbmcoXCJcIiArIG1lYXN1cmUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGV0dGVyRm9udCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQnJ1c2hlcy5CbGFjayxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHBvcyArIFNoZWV0TXVzaWMuTm90ZVdpZHRoIC8gMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXBvcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB4cG9zICs9IHMuV2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBEcmF3IHRoZSBseXJpY3MgKi9cclxuXHJcblxyXG4gICAgICAgIC8qKiBEcmF3IHRoZSBmaXZlIGhvcml6b250YWwgbGluZXMgb2YgdGhlIHN0YWZmICovXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIERyYXdIb3JpekxpbmVzKEdyYXBoaWNzIGcsIFBlbiBwZW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbnQgbGluZSA9IDE7XHJcbiAgICAgICAgICAgIGludCB5ID0geXRvcCAtIFNoZWV0TXVzaWMuTGluZVdpZHRoO1xyXG4gICAgICAgICAgICBwZW4uV2lkdGggPSAxO1xyXG4gICAgICAgICAgICBmb3IgKGxpbmUgPSAxOyBsaW5lIDw9IDU7IGxpbmUrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIFNoZWV0TXVzaWMuTGVmdE1hcmdpbiwgeSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aCAtIDEsIHkpO1xyXG4gICAgICAgICAgICAgICAgeSArPSBTaGVldE11c2ljLkxpbmVXaWR0aCArIFNoZWV0TXVzaWMuTGluZVNwYWNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBlbi5Db2xvciA9IENvbG9yLkJsYWNrO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBEcmF3IHRoZSB2ZXJ0aWNhbCBsaW5lcyBhdCB0aGUgZmFyIGxlZnQgYW5kIGZhciByaWdodCBzaWRlcy4gKi9cclxuICAgICAgICBwcml2YXRlIHZvaWQgRHJhd0VuZExpbmVzKEdyYXBoaWNzIGcsIFBlbiBwZW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBwZW4uV2lkdGggPSAxO1xyXG5cclxuICAgICAgICAgICAgLyogRHJhdyB0aGUgdmVydGljYWwgbGluZXMgZnJvbSAwIHRvIHRoZSBoZWlnaHQgb2YgdGhpcyBzdGFmZixcclxuICAgICAgICAgICAgICogaW5jbHVkaW5nIHRoZSBzcGFjZSBhYm92ZSBhbmQgYmVsb3cgdGhlIHN0YWZmLCB3aXRoIHR3byBleGNlcHRpb25zOlxyXG4gICAgICAgICAgICAgKiAtIElmIHRoaXMgaXMgdGhlIGZpcnN0IHRyYWNrLCBkb24ndCBzdGFydCBhYm92ZSB0aGUgc3RhZmYuXHJcbiAgICAgICAgICAgICAqICAgU3RhcnQgZXhhY3RseSBhdCB0aGUgdG9wIG9mIHRoZSBzdGFmZiAoeXRvcCAtIExpbmVXaWR0aClcclxuICAgICAgICAgICAgICogLSBJZiB0aGlzIGlzIHRoZSBsYXN0IHRyYWNrLCBkb24ndCBlbmQgYmVsb3cgdGhlIHN0YWZmLlxyXG4gICAgICAgICAgICAgKiAgIEVuZCBleGFjdGx5IGF0IHRoZSBib3R0b20gb2YgdGhlIHN0YWZmLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgaW50IHlzdGFydCwgeWVuZDtcclxuICAgICAgICAgICAgaWYgKHRyYWNrbnVtID09IDApXHJcbiAgICAgICAgICAgICAgICB5c3RhcnQgPSB5dG9wIC0gU2hlZXRNdXNpYy5MaW5lV2lkdGg7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHlzdGFydCA9IDA7XHJcblxyXG4gICAgICAgICAgICBpZiAodHJhY2tudW0gPT0gKHRvdGFsdHJhY2tzIC0gMSkpXHJcbiAgICAgICAgICAgICAgICB5ZW5kID0geXRvcCArIDQgKiBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHllbmQgPSBoZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgU2hlZXRNdXNpYy5MZWZ0TWFyZ2luLCB5c3RhcnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxlZnRNYXJnaW4sIHllbmQpO1xyXG5cclxuICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHdpZHRoIC0gMSwgeXN0YXJ0LCB3aWR0aCAtIDEsIHllbmQpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBEcmF3IHRoaXMgc3RhZmYuIE9ubHkgZHJhdyB0aGUgc3ltYm9scyBpbnNpZGUgdGhlIGNsaXAgYXJlYSAqL1xyXG4gICAgICAgIHB1YmxpYyB2b2lkIERyYXcoR3JhcGhpY3MgZywgUmVjdGFuZ2xlIGNsaXAsIFBlbiBwZW4sIGludCBzZWxlY3Rpb25TdGFydFB1bHNlLCBpbnQgc2VsZWN0aW9uRW5kUHVsc2UsIEJydXNoIGRlc2VsZWN0ZWRCcnVzaClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8qIFNoYWRlIGFueSBkZXNlbGVjdGVkIGFyZWFzICovXHJcbiAgICAgICAgICAgIFNoYWRlU2VsZWN0aW9uQmFja2dyb3VuZChnLCBjbGlwLCBzZWxlY3Rpb25TdGFydFB1bHNlLCBzZWxlY3Rpb25FbmRQdWxzZSwgZGVzZWxlY3RlZEJydXNoKTtcclxuXHJcbiAgICAgICAgICAgIGludCB4cG9zID0gU2hlZXRNdXNpYy5MZWZ0TWFyZ2luICsgNTtcclxuXHJcbiAgICAgICAgICAgIC8qIERyYXcgdGhlIGxlZnQgc2lkZSBDbGVmIHN5bWJvbCAqL1xyXG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSh4cG9zLCAwKTtcclxuICAgICAgICAgICAgY2xlZnN5bS5EcmF3KGcsIHBlbiwgeXRvcCk7XHJcbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC14cG9zLCAwKTtcclxuICAgICAgICAgICAgeHBvcyArPSBjbGVmc3ltLldpZHRoO1xyXG5cclxuICAgICAgICAgICAgLyogRHJhdyB0aGUga2V5IHNpZ25hdHVyZSAqL1xyXG4gICAgICAgICAgICBmb3JlYWNoIChBY2NpZFN5bWJvbCBhIGluIGtleXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKHhwb3MsIDApO1xyXG4gICAgICAgICAgICAgICAgYS5EcmF3KGcsIHBlbiwgeXRvcCk7XHJcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgteHBvcywgMCk7XHJcbiAgICAgICAgICAgICAgICB4cG9zICs9IGEuV2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIERyYXcgdGhlIGFjdHVhbCBub3RlcywgcmVzdHMsIGJhcnMuICBEcmF3IHRoZSBzeW1ib2xzIG9uZSBcclxuICAgICAgICAgICAgICogYWZ0ZXIgYW5vdGhlciwgdXNpbmcgdGhlIHN5bWJvbCB3aWR0aCB0byBkZXRlcm1pbmUgdGhlXHJcbiAgICAgICAgICAgICAqIHggcG9zaXRpb24gb2YgdGhlIG5leHQgc3ltYm9sLlxyXG4gICAgICAgICAgICAgKlxyXG4gICAgICAgICAgICAgKiBGb3IgZmFzdCBwZXJmb3JtYW5jZSwgb25seSBkcmF3IHN5bWJvbHMgdGhhdCBhcmUgaW4gdGhlIGNsaXAgYXJlYS5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHMgaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKEluc2lkZUNsaXBwaW5nKGNsaXAsIHhwb3MsIHMpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKHhwb3MsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgIHMuRHJhdyhnLCBwZW4sIHl0b3ApO1xyXG4gICAgICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC14cG9zLCAwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHhwb3MgKz0gcy5XaWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBEcmF3SG9yaXpMaW5lcyhnLCBwZW4pO1xyXG4gICAgICAgICAgICBEcmF3RW5kTGluZXMoZywgcGVuKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChzaG93TWVhc3VyZXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIERyYXdNZWFzdXJlTnVtYmVycyhnLCBwZW4pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChseXJpY3MgIT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgRHJhd0x5cmljcyhnLCBwZW4pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIElmIGEgc2VsZWN0aW9uIGhhcyBiZWVuIHNwZWNpZmllZCwgc2hhZGUgYWxsIGFyZWFzIHRoYXQgYXJlbid0IGluIHRoZSBzZWxlY3Rpb25cbiAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHZvaWQgU2hhZGVTZWxlY3Rpb25CYWNrZ3JvdW5kKEdyYXBoaWNzIGcsIFJlY3RhbmdsZSBjbGlwLCBpbnQgc2VsZWN0aW9uU3RhcnRQdWxzZSwgaW50IHNlbGVjdGlvbkVuZFB1bHNlLCBCcnVzaCBkZXNlbGVjdGVkQnJ1c2gpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoc2VsZWN0aW9uRW5kUHVsc2UgPT0gMCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgaW50IHhwb3MgPSBrZXlzaWdXaWR0aDtcclxuICAgICAgICAgICAgYm9vbCBsYXN0U3RhdGVGaWxsID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHMgaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKEluc2lkZUNsaXBwaW5nKGNsaXAsIHhwb3MsIHMpICYmIChzLlN0YXJ0VGltZSA8IHNlbGVjdGlvblN0YXJ0UHVsc2UgfHwgcy5TdGFydFRpbWUgPiBzZWxlY3Rpb25FbmRQdWxzZSkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeHBvcyAtIDIsIC0yKTtcclxuICAgICAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZGVzZWxlY3RlZEJydXNoLCAwLCAwLCBzLldpZHRoICsgNCwgdGhpcy5IZWlnaHQgKyA0KTtcclxuICAgICAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKHhwb3MgLSAyKSwgMik7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFN0YXRlRmlsbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFN0YXRlRmlsbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgeHBvcyArPSBzLldpZHRoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChsYXN0U3RhdGVGaWxsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvL3NoYWRlIHRoZSByZXN0IG9mIHRoZSBzdGFmZiBpZiB0aGUgcHJldmlvdXMgc3ltYm9sIHdhcyBzaGFkZWRcclxuICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKHhwb3MgLSAyLCAtMik7XHJcbiAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZGVzZWxlY3RlZEJydXNoLCAwLCAwLCB3aWR0aCAtIHhwb3MsIHRoaXMuSGVpZ2h0ICsgNCk7XHJcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKHhwb3MgLSAyKSwgMik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGJvb2wgSW5zaWRlQ2xpcHBpbmcoUmVjdGFuZ2xlIGNsaXAsIGludCB4cG9zLCBNdXNpY1N5bWJvbCBzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuICh4cG9zIDw9IGNsaXAuWCArIGNsaXAuV2lkdGggKyA1MCkgJiYgKHhwb3MgKyBzLldpZHRoICsgNTAgPj0gY2xpcC5YKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogU2hhZGUgYWxsIHRoZSBjaG9yZHMgcGxheWVkIGluIHRoZSBnaXZlbiB0aW1lLlxuICAgICAgICAgKiAgVW4tc2hhZGUgYW55IGNob3JkcyBzaGFkZWQgaW4gdGhlIHByZXZpb3VzIHB1bHNlIHRpbWUuXG4gICAgICAgICAqICBTdG9yZSB0aGUgeCBjb29yZGluYXRlIGxvY2F0aW9uIHdoZXJlIHRoZSBzaGFkZSB3YXMgZHJhd24uXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyB2b2lkIFNoYWRlTm90ZXMoR3JhcGhpY3MgZywgU29saWRCcnVzaCBzaGFkZUJydXNoLCBQZW4gcGVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50IGN1cnJlbnRQdWxzZVRpbWUsIGludCBwcmV2UHVsc2VUaW1lLCByZWYgaW50IHhfc2hhZGUpXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgLyogSWYgdGhlcmUncyBub3RoaW5nIHRvIHVuc2hhZGUsIG9yIHNoYWRlLCByZXR1cm4gKi9cclxuICAgICAgICAgICAgaWYgKChzdGFydHRpbWUgPiBwcmV2UHVsc2VUaW1lIHx8IGVuZHRpbWUgPCBwcmV2UHVsc2VUaW1lKSAmJlxyXG4gICAgICAgICAgICAgICAgKHN0YXJ0dGltZSA+IGN1cnJlbnRQdWxzZVRpbWUgfHwgZW5kdGltZSA8IGN1cnJlbnRQdWxzZVRpbWUpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIFNraXAgdGhlIGxlZnQgc2lkZSBDbGVmIHN5bWJvbCBhbmQga2V5IHNpZ25hdHVyZSAqL1xyXG4gICAgICAgICAgICBpbnQgeHBvcyA9IGtleXNpZ1dpZHRoO1xyXG5cclxuICAgICAgICAgICAgTXVzaWNTeW1ib2wgY3VyciA9IG51bGw7XHJcbiAgICAgICAgICAgIENob3JkU3ltYm9sIHByZXZDaG9yZCA9IG51bGw7XHJcbiAgICAgICAgICAgIGludCBwcmV2X3hwb3MgPSAwO1xyXG5cclxuICAgICAgICAgICAgLyogTG9vcCB0aHJvdWdoIHRoZSBzeW1ib2xzLiBcclxuICAgICAgICAgICAgICogVW5zaGFkZSBzeW1ib2xzIHdoZXJlIHN0YXJ0IDw9IHByZXZQdWxzZVRpbWUgPCBlbmRcclxuICAgICAgICAgICAgICogU2hhZGUgc3ltYm9scyB3aGVyZSBzdGFydCA8PSBjdXJyZW50UHVsc2VUaW1lIDwgZW5kXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHN5bWJvbHMuQ291bnQ7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY3VyciA9IHN5bWJvbHNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAoY3VyciBpcyBCYXJTeW1ib2wpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgeHBvcyArPSBjdXJyLldpZHRoO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGludCBzdGFydCA9IGN1cnIuU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgaW50IGVuZCA9IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAoaSArIDIgPCBzeW1ib2xzLkNvdW50ICYmIHN5bWJvbHNbaSArIDFdIGlzIEJhclN5bWJvbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBlbmQgPSBzeW1ib2xzW2kgKyAyXS5TdGFydFRpbWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpICsgMSA8IHN5bWJvbHMuQ291bnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gc3ltYm9sc1tpICsgMV0uU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IGVuZHRpbWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIC8qIElmIHdlJ3ZlIHBhc3QgdGhlIHByZXZpb3VzIGFuZCBjdXJyZW50IHRpbWVzLCB3ZSdyZSBkb25lLiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKChzdGFydCA+IHByZXZQdWxzZVRpbWUpICYmIChzdGFydCA+IGN1cnJlbnRQdWxzZVRpbWUpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh4X3NoYWRlID09IDApXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4X3NoYWRlID0geHBvcztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8qIElmIHNoYWRlZCBub3RlcyBhcmUgdGhlIHNhbWUsIHdlJ3JlIGRvbmUgKi9cclxuICAgICAgICAgICAgICAgIGlmICgoc3RhcnQgPD0gY3VycmVudFB1bHNlVGltZSkgJiYgKGN1cnJlbnRQdWxzZVRpbWUgPCBlbmQpICYmXHJcbiAgICAgICAgICAgICAgICAgICAgKHN0YXJ0IDw9IHByZXZQdWxzZVRpbWUpICYmIChwcmV2UHVsc2VUaW1lIDwgZW5kKSlcclxuICAgICAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgeF9zaGFkZSA9IHhwb3M7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8qIElmIHN5bWJvbCBpcyBpbiB0aGUgcHJldmlvdXMgdGltZSwgZHJhdyBhIHdoaXRlIGJhY2tncm91bmQgKi9cclxuICAgICAgICAgICAgICAgIGlmICgoc3RhcnQgPD0gcHJldlB1bHNlVGltZSkgJiYgKHByZXZQdWxzZVRpbWUgPCBlbmQpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKHhwb3MgLSAyLCAtMik7XHJcbiAgICAgICAgICAgICAgICAgICAgZy5DbGVhclJlY3RhbmdsZSgwLCAwLCBjdXJyLldpZHRoICsgNCwgdGhpcy5IZWlnaHQgKyA0KTtcclxuICAgICAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKHhwb3MgLSAyKSwgMik7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyogSWYgc3ltYm9sIGlzIGluIHRoZSBjdXJyZW50IHRpbWUsIGRyYXcgYSBzaGFkZWQgYmFja2dyb3VuZCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKChzdGFydCA8PSBjdXJyZW50UHVsc2VUaW1lKSAmJiAoY3VycmVudFB1bHNlVGltZSA8IGVuZCkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgeF9zaGFkZSA9IHhwb3M7XHJcbiAgICAgICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeHBvcywgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKHNoYWRlQnJ1c2gsIDAsIDAsIGN1cnIuV2lkdGgsIHRoaXMuSGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgteHBvcywgMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgeHBvcyArPSBjdXJyLldpZHRoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogUmV0dXJuIHRoZSBwdWxzZSB0aW1lIGNvcnJlc3BvbmRpbmcgdG8gdGhlIGdpdmVuIHBvaW50LlxuICAgICAgICAgKiAgRmluZCB0aGUgbm90ZXMvc3ltYm9scyBjb3JyZXNwb25kaW5nIHRvIHRoZSB4IHBvc2l0aW9uLFxuICAgICAgICAgKiAgYW5kIHJldHVybiB0aGUgc3RhcnRUaW1lIChwdWxzZVRpbWUpIG9mIHRoZSBzeW1ib2wuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBpbnQgUHVsc2VUaW1lRm9yUG9pbnQoUG9pbnQgcG9pbnQpXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgaW50IHhwb3MgPSBrZXlzaWdXaWR0aDtcclxuICAgICAgICAgICAgaW50IHB1bHNlVGltZSA9IHN0YXJ0dGltZTtcclxuICAgICAgICAgICAgZm9yZWFjaCAoTXVzaWNTeW1ib2wgc3ltIGluIHN5bWJvbHMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHB1bHNlVGltZSA9IHN5bS5TdGFydFRpbWU7XHJcbiAgICAgICAgICAgICAgICBpZiAocG9pbnQuWCA8PSB4cG9zICsgc3ltLldpZHRoKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwdWxzZVRpbWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB4cG9zICs9IHN5bS5XaWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcHVsc2VUaW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzdHJpbmcgcmVzdWx0ID0gXCJTdGFmZiBjbGVmPVwiICsgY2xlZnN5bS5Ub1N0cmluZygpICsgXCJcXG5cIjtcclxuICAgICAgICAgICAgcmVzdWx0ICs9IFwiICBLZXlzOlxcblwiO1xyXG4gICAgICAgICAgICBmb3JlYWNoIChBY2NpZFN5bWJvbCBhIGluIGtleXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBcIiAgICBcIiArIGEuVG9TdHJpbmcoKSArIFwiXFxuXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzdWx0ICs9IFwiICBTeW1ib2xzOlxcblwiO1xyXG4gICAgICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBzIGluIGtleXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBcIiAgICBcIiArIHMuVG9TdHJpbmcoKSArIFwiXFxuXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yZWFjaCAoTXVzaWNTeW1ib2wgbSBpbiBzeW1ib2xzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gXCIgICAgXCIgKyBtLlRvU3RyaW5nKCkgKyBcIlxcblwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSBcIkVuZCBTdGFmZlxcblwiO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XG59XG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMSBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIEBjbGFzcyBTdGVtXG4gKiBUaGUgU3RlbSBjbGFzcyBpcyB1c2VkIGJ5IENob3JkU3ltYm9sIHRvIGRyYXcgdGhlIHN0ZW0gcG9ydGlvbiBvZlxuICogdGhlIGNob3JkLiAgVGhlIHN0ZW0gaGFzIHRoZSBmb2xsb3dpbmcgZmllbGRzOlxuICpcbiAqIGR1cmF0aW9uICAtIFRoZSBkdXJhdGlvbiBvZiB0aGUgc3RlbS5cbiAqIGRpcmVjdGlvbiAtIEVpdGhlciBVcCBvciBEb3duXG4gKiBzaWRlICAgICAgLSBFaXRoZXIgbGVmdCBvciByaWdodFxuICogdG9wICAgICAgIC0gVGhlIHRvcG1vc3Qgbm90ZSBpbiB0aGUgY2hvcmRcbiAqIGJvdHRvbSAgICAtIFRoZSBib3R0b21tb3N0IG5vdGUgaW4gdGhlIGNob3JkXG4gKiBlbmQgICAgICAgLSBUaGUgbm90ZSBwb3NpdGlvbiB3aGVyZSB0aGUgc3RlbSBlbmRzLiAgVGhpcyBpcyB1c3VhbGx5XG4gKiAgICAgICAgICAgICBzaXggbm90ZXMgcGFzdCB0aGUgbGFzdCBub3RlIGluIHRoZSBjaG9yZC4gIEZvciA4dGgvMTZ0aFxuICogICAgICAgICAgICAgbm90ZXMsIHRoZSBzdGVtIG11c3QgZXh0ZW5kIGV2ZW4gbW9yZS5cbiAqXG4gKiBUaGUgU2hlZXRNdXNpYyBjbGFzcyBjYW4gY2hhbmdlIHRoZSBkaXJlY3Rpb24gb2YgYSBzdGVtIGFmdGVyIGl0XG4gKiBoYXMgYmVlbiBjcmVhdGVkLiAgVGhlIHNpZGUgYW5kIGVuZCBmaWVsZHMgbWF5IGFsc28gY2hhbmdlIGR1ZSB0b1xuICogdGhlIGRpcmVjdGlvbiBjaGFuZ2UuICBCdXQgb3RoZXIgZmllbGRzIHdpbGwgbm90IGNoYW5nZS5cbiAqL1xuIFxucHVibGljIGNsYXNzIFN0ZW0ge1xuICAgIHB1YmxpYyBjb25zdCBpbnQgVXAgPSAgIDE7ICAgICAgLyogVGhlIHN0ZW0gcG9pbnRzIHVwICovXG4gICAgcHVibGljIGNvbnN0IGludCBEb3duID0gMjsgICAgICAvKiBUaGUgc3RlbSBwb2ludHMgZG93biAqL1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTGVmdFNpZGUgPSAxOyAgLyogVGhlIHN0ZW0gaXMgdG8gdGhlIGxlZnQgb2YgdGhlIG5vdGUgKi9cbiAgICBwdWJsaWMgY29uc3QgaW50IFJpZ2h0U2lkZSA9IDI7IC8qIFRoZSBzdGVtIGlzIHRvIHRoZSByaWdodCBvZiB0aGUgbm90ZSAqL1xuXG4gICAgcHJpdmF0ZSBOb3RlRHVyYXRpb24gZHVyYXRpb247IC8qKiBEdXJhdGlvbiBvZiB0aGUgc3RlbS4gKi9cbiAgICBwcml2YXRlIGludCBkaXJlY3Rpb247ICAgICAgICAgLyoqIFVwLCBEb3duLCBvciBOb25lICovXG4gICAgcHJpdmF0ZSBXaGl0ZU5vdGUgdG9wOyAgICAgICAgIC8qKiBUb3Btb3N0IG5vdGUgaW4gY2hvcmQgKi9cbiAgICBwcml2YXRlIFdoaXRlTm90ZSBib3R0b207ICAgICAgLyoqIEJvdHRvbW1vc3Qgbm90ZSBpbiBjaG9yZCAqL1xuICAgIHByaXZhdGUgV2hpdGVOb3RlIGVuZDsgICAgICAgICAvKiogTG9jYXRpb24gb2YgZW5kIG9mIHRoZSBzdGVtICovXG4gICAgcHJpdmF0ZSBib29sIG5vdGVzb3ZlcmxhcDsgICAgIC8qKiBEbyB0aGUgY2hvcmQgbm90ZXMgb3ZlcmxhcCAqL1xuICAgIHByaXZhdGUgaW50IHNpZGU7ICAgICAgICAgICAgICAvKiogTGVmdCBzaWRlIG9yIHJpZ2h0IHNpZGUgb2Ygbm90ZSAqL1xuXG4gICAgcHJpdmF0ZSBTdGVtIHBhaXI7ICAgICAgICAgICAgICAvKiogSWYgcGFpciAhPSBudWxsLCB0aGlzIGlzIGEgaG9yaXpvbnRhbCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIGJlYW0gc3RlbSB0byBhbm90aGVyIGNob3JkICovXG4gICAgcHJpdmF0ZSBpbnQgd2lkdGhfdG9fcGFpcjsgICAgICAvKiogVGhlIHdpZHRoIChpbiBwaXhlbHMpIHRvIHRoZSBjaG9yZCBwYWlyICovXG4gICAgcHJpdmF0ZSBib29sIHJlY2VpdmVyX2luX3BhaXI7ICAvKiogVGhpcyBzdGVtIGlzIHRoZSByZWNlaXZlciBvZiBhIGhvcml6b250YWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogYmVhbSBzdGVtIGZyb20gYW5vdGhlciBjaG9yZC4gKi9cblxuICAgIC8qKiBHZXQvU2V0IHRoZSBkaXJlY3Rpb24gb2YgdGhlIHN0ZW0gKFVwIG9yIERvd24pICovXG4gICAgcHVibGljIGludCBEaXJlY3Rpb24ge1xuICAgICAgICBnZXQgeyByZXR1cm4gZGlyZWN0aW9uOyB9XG4gICAgICAgIHNldCB7IENoYW5nZURpcmVjdGlvbih2YWx1ZSk7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBkdXJhdGlvbiBvZiB0aGUgc3RlbSAoRWlndGgsIFNpeHRlZW50aCwgVGhpcnR5U2Vjb25kKSAqL1xuICAgIHB1YmxpYyBOb3RlRHVyYXRpb24gRHVyYXRpb24ge1xuICAgICAgICBnZXQgeyByZXR1cm4gZHVyYXRpb247IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSB0b3Agbm90ZSBpbiB0aGUgY2hvcmQuIFRoaXMgaXMgbmVlZGVkIHRvIGRldGVybWluZSB0aGUgc3RlbSBkaXJlY3Rpb24gKi9cbiAgICBwdWJsaWMgV2hpdGVOb3RlIFRvcCB7XG4gICAgICAgIGdldCB7IHJldHVybiB0b3A7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBib3R0b20gbm90ZSBpbiB0aGUgY2hvcmQuIFRoaXMgaXMgbmVlZGVkIHRvIGRldGVybWluZSB0aGUgc3RlbSBkaXJlY3Rpb24gKi9cbiAgICBwdWJsaWMgV2hpdGVOb3RlIEJvdHRvbSB7XG4gICAgICAgIGdldCB7IHJldHVybiBib3R0b207IH1cbiAgICB9XG5cbiAgICAvKiogR2V0L1NldCB0aGUgbG9jYXRpb24gd2hlcmUgdGhlIHN0ZW0gZW5kcy4gIFRoaXMgaXMgdXN1YWxseSBzaXggbm90ZXNcbiAgICAgKiBwYXN0IHRoZSBsYXN0IG5vdGUgaW4gdGhlIGNob3JkLiBTZWUgbWV0aG9kIENhbGN1bGF0ZUVuZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgV2hpdGVOb3RlIEVuZCB7XG4gICAgICAgIGdldCB7IHJldHVybiBlbmQ7IH1cbiAgICAgICAgc2V0IHsgZW5kID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogU2V0IHRoaXMgU3RlbSB0byBiZSB0aGUgcmVjZWl2ZXIgb2YgYSBob3Jpem9udGFsIGJlYW0sIGFzIHBhcnRcbiAgICAgKiBvZiBhIGNob3JkIHBhaXIuICBJbiBEcmF3KCksIGlmIHRoaXMgc3RlbSBpcyBhIHJlY2VpdmVyLCB3ZVxuICAgICAqIGRvbid0IGRyYXcgYSBjdXJ2eSBzdGVtLCB3ZSBvbmx5IGRyYXcgdGhlIHZlcnRpY2FsIGxpbmUuXG4gICAgICovXG4gICAgcHVibGljIGJvb2wgUmVjZWl2ZXIge1xuICAgICAgICBnZXQgeyByZXR1cm4gcmVjZWl2ZXJfaW5fcGFpcjsgfVxuICAgICAgICBzZXQgeyByZWNlaXZlcl9pbl9wYWlyID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IHN0ZW0uICBUaGUgdG9wIG5vdGUsIGJvdHRvbSBub3RlLCBhbmQgZGlyZWN0aW9uIGFyZSBcbiAgICAgKiBuZWVkZWQgZm9yIGRyYXdpbmcgdGhlIHZlcnRpY2FsIGxpbmUgb2YgdGhlIHN0ZW0uICBUaGUgZHVyYXRpb24gaXMgXG4gICAgICogbmVlZGVkIHRvIGRyYXcgdGhlIHRhaWwgb2YgdGhlIHN0ZW0uICBUaGUgb3ZlcmxhcCBib29sZWFuIGlzIHRydWVcbiAgICAgKiBpZiB0aGUgbm90ZXMgaW4gdGhlIGNob3JkIG92ZXJsYXAuICBJZiB0aGUgbm90ZXMgb3ZlcmxhcCwgdGhlXG4gICAgICogc3RlbSBtdXN0IGJlIGRyYXduIG9uIHRoZSByaWdodCBzaWRlLlxuICAgICAqL1xuICAgIHB1YmxpYyBTdGVtKFdoaXRlTm90ZSBib3R0b20sIFdoaXRlTm90ZSB0b3AsIFxuICAgICAgICAgICAgICAgIE5vdGVEdXJhdGlvbiBkdXJhdGlvbiwgaW50IGRpcmVjdGlvbiwgYm9vbCBvdmVybGFwKSB7XG5cbiAgICAgICAgdGhpcy50b3AgPSB0b3A7XG4gICAgICAgIHRoaXMuYm90dG9tID0gYm90dG9tO1xuICAgICAgICB0aGlzLmR1cmF0aW9uID0gZHVyYXRpb247XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICAgICAgICB0aGlzLm5vdGVzb3ZlcmxhcCA9IG92ZXJsYXA7XG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT0gVXAgfHwgbm90ZXNvdmVybGFwKVxuICAgICAgICAgICAgc2lkZSA9IFJpZ2h0U2lkZTtcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIHNpZGUgPSBMZWZ0U2lkZTtcbiAgICAgICAgZW5kID0gQ2FsY3VsYXRlRW5kKCk7XG4gICAgICAgIHBhaXIgPSBudWxsO1xuICAgICAgICB3aWR0aF90b19wYWlyID0gMDtcbiAgICAgICAgcmVjZWl2ZXJfaW5fcGFpciA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKiBDYWxjdWxhdGUgdGhlIHZlcnRpY2FsIHBvc2l0aW9uICh3aGl0ZSBub3RlIGtleSkgd2hlcmUgXG4gICAgICogdGhlIHN0ZW0gZW5kcyBcbiAgICAgKi9cbiAgICBwdWJsaWMgV2hpdGVOb3RlIENhbGN1bGF0ZUVuZCgpIHtcbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PSBVcCkge1xuICAgICAgICAgICAgV2hpdGVOb3RlIHcgPSB0b3A7XG4gICAgICAgICAgICB3ID0gdy5BZGQoNik7XG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCkge1xuICAgICAgICAgICAgICAgIHcgPSB3LkFkZCgyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcbiAgICAgICAgICAgICAgICB3ID0gdy5BZGQoNCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkaXJlY3Rpb24gPT0gRG93bikge1xuICAgICAgICAgICAgV2hpdGVOb3RlIHcgPSBib3R0b207XG4gICAgICAgICAgICB3ID0gdy5BZGQoLTYpO1xuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGgpIHtcbiAgICAgICAgICAgICAgICB3ID0gdy5BZGQoLTIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRoaXJ0eVNlY29uZCkge1xuICAgICAgICAgICAgICAgIHcgPSB3LkFkZCgtNCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsOyAgLyogU2hvdWxkbid0IGhhcHBlbiAqL1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIENoYW5nZSB0aGUgZGlyZWN0aW9uIG9mIHRoZSBzdGVtLiAgVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgYnkgXG4gICAgICogQ2hvcmRTeW1ib2wuTWFrZVBhaXIoKS4gIFdoZW4gdHdvIGNob3JkcyBhcmUgam9pbmVkIGJ5IGEgaG9yaXpvbnRhbFxuICAgICAqIGJlYW0sIHRoZWlyIHN0ZW1zIG11c3QgcG9pbnQgaW4gdGhlIHNhbWUgZGlyZWN0aW9uICh1cCBvciBkb3duKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBDaGFuZ2VEaXJlY3Rpb24oaW50IG5ld2RpcmVjdGlvbikge1xuICAgICAgICBkaXJlY3Rpb24gPSBuZXdkaXJlY3Rpb247XG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT0gVXAgfHwgbm90ZXNvdmVybGFwKVxuICAgICAgICAgICAgc2lkZSA9IFJpZ2h0U2lkZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgc2lkZSA9IExlZnRTaWRlO1xuICAgICAgICBlbmQgPSBDYWxjdWxhdGVFbmQoKTtcbiAgICB9XG5cbiAgICAvKiogUGFpciB0aGlzIHN0ZW0gd2l0aCBhbm90aGVyIENob3JkLiAgSW5zdGVhZCBvZiBkcmF3aW5nIGEgY3VydnkgdGFpbCxcbiAgICAgKiB0aGlzIHN0ZW0gd2lsbCBub3cgaGF2ZSB0byBkcmF3IGEgYmVhbSB0byB0aGUgZ2l2ZW4gc3RlbSBwYWlyLiAgVGhlXG4gICAgICogd2lkdGggKGluIHBpeGVscykgdG8gdGhpcyBzdGVtIHBhaXIgaXMgcGFzc2VkIGFzIGFyZ3VtZW50LlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIFNldFBhaXIoU3RlbSBwYWlyLCBpbnQgd2lkdGhfdG9fcGFpcikge1xuICAgICAgICB0aGlzLnBhaXIgPSBwYWlyO1xuICAgICAgICB0aGlzLndpZHRoX3RvX3BhaXIgPSB3aWR0aF90b19wYWlyO1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGlzIFN0ZW0gaXMgcGFydCBvZiBhIGhvcml6b250YWwgYmVhbS4gKi9cbiAgICBwdWJsaWMgYm9vbCBpc0JlYW0ge1xuICAgICAgICBnZXQgeyByZXR1cm4gcmVjZWl2ZXJfaW5fcGFpciB8fCAocGFpciAhPSBudWxsKTsgfVxuICAgIH1cblxuICAgIC8qKiBEcmF3IHRoaXMgc3RlbS5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeSBsb2NhdGlvbiAoaW4gcGl4ZWxzKSB3aGVyZSB0aGUgdG9wIG9mIHRoZSBzdGFmZiBzdGFydHMuXG4gICAgICogQHBhcmFtIHRvcHN0YWZmICBUaGUgbm90ZSBhdCB0aGUgdG9wIG9mIHRoZSBzdGFmZi5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wLCBXaGl0ZU5vdGUgdG9wc3RhZmYpIHtcbiAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5XaG9sZSlcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBEcmF3VmVydGljYWxMaW5lKGcsIHBlbiwgeXRvcCwgdG9wc3RhZmYpO1xuICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlF1YXJ0ZXIgfHwgXG4gICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkUXVhcnRlciB8fCBcbiAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5IYWxmIHx8XG4gICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkSGFsZiB8fFxuICAgICAgICAgICAgcmVjZWl2ZXJfaW5fcGFpcikge1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFpciAhPSBudWxsKVxuICAgICAgICAgICAgRHJhd0hvcml6QmFyU3RlbShnLCBwZW4sIHl0b3AsIHRvcHN0YWZmKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgRHJhd0N1cnZ5U3RlbShnLCBwZW4sIHl0b3AsIHRvcHN0YWZmKTtcbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgdmVydGljYWwgbGluZSBvZiB0aGUgc3RlbSBcbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeSBsb2NhdGlvbiAoaW4gcGl4ZWxzKSB3aGVyZSB0aGUgdG9wIG9mIHRoZSBzdGFmZiBzdGFydHMuXG4gICAgICogQHBhcmFtIHRvcHN0YWZmICBUaGUgbm90ZSBhdCB0aGUgdG9wIG9mIHRoZSBzdGFmZi5cbiAgICAgKi9cbiAgICBwcml2YXRlIHZvaWQgRHJhd1ZlcnRpY2FsTGluZShHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCwgV2hpdGVOb3RlIHRvcHN0YWZmKSB7XG4gICAgICAgIGludCB4c3RhcnQ7XG4gICAgICAgIGlmIChzaWRlID09IExlZnRTaWRlKVxuICAgICAgICAgICAgeHN0YXJ0ID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCArIDE7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHhzdGFydCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyBTaGVldE11c2ljLk5vdGVXaWR0aDtcblxuICAgICAgICBpZiAoZGlyZWN0aW9uID09IFVwKSB7XG4gICAgICAgICAgICBpbnQgeTEgPSB5dG9wICsgdG9wc3RhZmYuRGlzdChib3R0b20pICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgXG4gICAgICAgICAgICAgICAgICAgICAgICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzQ7XG5cbiAgICAgICAgICAgIGludCB5c3RlbSA9IHl0b3AgKyB0b3BzdGFmZi5EaXN0KGVuZCkgKiBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcblxuICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeTEsIHhzdGFydCwgeXN0ZW0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRpcmVjdGlvbiA9PSBEb3duKSB7XG4gICAgICAgICAgICBpbnQgeTEgPSB5dG9wICsgdG9wc3RhZmYuRGlzdCh0b3ApICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgXG4gICAgICAgICAgICAgICAgICAgICAgICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuXG4gICAgICAgICAgICBpZiAoc2lkZSA9PSBMZWZ0U2lkZSlcbiAgICAgICAgICAgICAgICB5MSA9IHkxIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzQ7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgeTEgPSB5MSAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG4gICAgICAgICAgICBpbnQgeXN0ZW0gPSB5dG9wICsgdG9wc3RhZmYuRGlzdChlbmQpICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuXG4gICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5MSwgeHN0YXJ0LCB5c3RlbSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogRHJhdyBhIGN1cnZ5IHN0ZW0gdGFpbC4gIFRoaXMgaXMgb25seSB1c2VkIGZvciBzaW5nbGUgY2hvcmRzLCBub3QgY2hvcmQgcGFpcnMuXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHkgbG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEBwYXJhbSB0b3BzdGFmZiAgVGhlIG5vdGUgYXQgdGhlIHRvcCBvZiB0aGUgc3RhZmYuXG4gICAgICovXG4gICAgcHJpdmF0ZSB2b2lkIERyYXdDdXJ2eVN0ZW0oR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3AsIFdoaXRlTm90ZSB0b3BzdGFmZikge1xuXG4gICAgICAgIHBlbi5XaWR0aCA9IDI7XG5cbiAgICAgICAgaW50IHhzdGFydCA9IDA7XG4gICAgICAgIGlmIChzaWRlID09IExlZnRTaWRlKVxuICAgICAgICAgICAgeHN0YXJ0ID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCArIDE7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHhzdGFydCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyBTaGVldE11c2ljLk5vdGVXaWR0aDtcblxuICAgICAgICBpZiAoZGlyZWN0aW9uID09IFVwKSB7XG4gICAgICAgICAgICBpbnQgeXN0ZW0gPSB5dG9wICsgdG9wc3RhZmYuRGlzdChlbmQpICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG5cblxuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5FaWdodGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRyaXBsZXQgfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uU2l4dGVlbnRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRoaXJ0eVNlY29uZCkge1xuXG4gICAgICAgICAgICAgICAgZy5EcmF3QmV6aWVyKHBlbiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgeXN0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtICsgMypTaGVldE11c2ljLkxpbmVTcGFjZS8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZSoyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gKyBTaGVldE11c2ljLk5vdGVIZWlnaHQqMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeXN0ZW0gKz0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuXG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0JlemllcihwZW4sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIHlzdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSArIDMqU2hlZXRNdXNpYy5MaW5lU3BhY2UvMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UqMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCozKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgeXN0ZW0gKz0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcbiAgICAgICAgICAgICAgICBnLkRyYXdCZXppZXIocGVuLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCB5c3RlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gKyAzKlNoZWV0TXVzaWMuTGluZVNwYWNlLzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlKjIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZS8yLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gKyBTaGVldE11c2ljLk5vdGVIZWlnaHQqMyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGVsc2UgaWYgKGRpcmVjdGlvbiA9PSBEb3duKSB7XG4gICAgICAgICAgICBpbnQgeXN0ZW0gPSB5dG9wICsgdG9wc3RhZmYuRGlzdChlbmQpKlNoZWV0TXVzaWMuTm90ZUhlaWdodC8yICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcblxuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5FaWdodGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRyaXBsZXQgfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uU2l4dGVlbnRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRoaXJ0eVNlY29uZCkge1xuXG4gICAgICAgICAgICAgICAgZy5EcmF3QmV6aWVyKHBlbiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgeXN0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlKjIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIgLSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxpbmVTcGFjZS8yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHlzdGVtIC09IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcblxuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG5cbiAgICAgICAgICAgICAgICBnLkRyYXdCZXppZXIocGVuLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCB5c3RlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gLSBTaGVldE11c2ljLkxpbmVTcGFjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UqMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gLSBTaGVldE11c2ljLk5vdGVIZWlnaHQqMiAtIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB5c3RlbSAtPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRoaXJ0eVNlY29uZCkge1xuICAgICAgICAgICAgICAgIGcuRHJhd0JlemllcihwZW4sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIHlzdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZSoyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gLSBTaGVldE11c2ljLk5vdGVIZWlnaHQqMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyIC0gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgICAgICBwZW4uV2lkdGggPSAxO1xuXG4gICAgfVxuXG4gICAgLyogRHJhdyBhIGhvcml6b250YWwgYmVhbSBzdGVtLCBjb25uZWN0aW5nIHRoaXMgc3RlbSB3aXRoIHRoZSBTdGVtIHBhaXIuXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHkgbG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEBwYXJhbSB0b3BzdGFmZiAgVGhlIG5vdGUgYXQgdGhlIHRvcCBvZiB0aGUgc3RhZmYuXG4gICAgICovXG4gICAgcHJpdmF0ZSB2b2lkIERyYXdIb3JpekJhclN0ZW0oR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3AsIFdoaXRlTm90ZSB0b3BzdGFmZikge1xuICAgICAgICBwZW4uV2lkdGggPSBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcblxuICAgICAgICBpbnQgeHN0YXJ0ID0gMDtcbiAgICAgICAgaW50IHhzdGFydDIgPSAwO1xuXG4gICAgICAgIGlmIChzaWRlID09IExlZnRTaWRlKVxuICAgICAgICAgICAgeHN0YXJ0ID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCArIDE7XG4gICAgICAgIGVsc2UgaWYgKHNpZGUgPT0gUmlnaHRTaWRlKVxuICAgICAgICAgICAgeHN0YXJ0ID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCArIFNoZWV0TXVzaWMuTm90ZVdpZHRoO1xuXG4gICAgICAgIGlmIChwYWlyLnNpZGUgPT0gTGVmdFNpZGUpXG4gICAgICAgICAgICB4c3RhcnQyID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCArIDE7XG4gICAgICAgIGVsc2UgaWYgKHBhaXIuc2lkZSA9PSBSaWdodFNpZGUpXG4gICAgICAgICAgICB4c3RhcnQyID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCArIFNoZWV0TXVzaWMuTm90ZVdpZHRoO1xuXG5cbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PSBVcCkge1xuICAgICAgICAgICAgaW50IHhlbmQgPSB3aWR0aF90b19wYWlyICsgeHN0YXJ0MjtcbiAgICAgICAgICAgIGludCB5c3RhcnQgPSB5dG9wICsgdG9wc3RhZmYuRGlzdChlbmQpICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG4gICAgICAgICAgICBpbnQgeWVuZCA9IHl0b3AgKyB0b3BzdGFmZi5EaXN0KHBhaXIuZW5kKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkVpZ2h0aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGggfHwgXG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRyaXBsZXQgfHwgXG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHlzdGFydCwgeGVuZCwgeWVuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB5c3RhcnQgKz0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgeWVuZCArPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG5cbiAgICAgICAgICAgIC8qIEEgZG90dGVkIGVpZ2h0aCB3aWxsIGNvbm5lY3QgdG8gYSAxNnRoIG5vdGUuICovXG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCkge1xuICAgICAgICAgICAgICAgIGludCB4ID0geGVuZCAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgICAgICBkb3VibGUgc2xvcGUgPSAoeWVuZCAtIHlzdGFydCkgKiAxLjAgLyAoeGVuZCAtIHhzdGFydCk7XG4gICAgICAgICAgICAgICAgaW50IHkgPSAoaW50KShzbG9wZSAqICh4IC0geGVuZCkgKyB5ZW5kKTsgXG5cbiAgICAgICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeCwgeSwgeGVuZCwgeWVuZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uU2l4dGVlbnRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRoaXJ0eVNlY29uZCkge1xuXG4gICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeXN0YXJ0LCB4ZW5kLCB5ZW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHlzdGFydCArPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICB5ZW5kICs9IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcbiAgICAgICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5c3RhcnQsIHhlbmQsIHllbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpbnQgeGVuZCA9IHdpZHRoX3RvX3BhaXIgKyB4c3RhcnQyO1xuICAgICAgICAgICAgaW50IHlzdGFydCA9IHl0b3AgKyB0b3BzdGFmZi5EaXN0KGVuZCkgKiBTaGVldE11c2ljLk5vdGVIZWlnaHQvMiArIFxuICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgIGludCB5ZW5kID0geXRvcCArIHRvcHN0YWZmLkRpc3QocGFpci5lbmQpICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG5cbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRWlnaHRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UcmlwbGV0IHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHlzdGFydCwgeGVuZCwgeWVuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB5c3RhcnQgLT0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgeWVuZCAtPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG5cbiAgICAgICAgICAgIC8qIEEgZG90dGVkIGVpZ2h0aCB3aWxsIGNvbm5lY3QgdG8gYSAxNnRoIG5vdGUuICovXG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCkge1xuICAgICAgICAgICAgICAgIGludCB4ID0geGVuZCAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgICAgICBkb3VibGUgc2xvcGUgPSAoeWVuZCAtIHlzdGFydCkgKiAxLjAgLyAoeGVuZCAtIHhzdGFydCk7XG4gICAgICAgICAgICAgICAgaW50IHkgPSAoaW50KShzbG9wZSAqICh4IC0geGVuZCkgKyB5ZW5kKTsgXG5cbiAgICAgICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeCwgeSwgeGVuZCwgeWVuZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uU2l4dGVlbnRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRoaXJ0eVNlY29uZCkge1xuXG4gICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeXN0YXJ0LCB4ZW5kLCB5ZW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHlzdGFydCAtPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICB5ZW5kIC09IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcbiAgICAgICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5c3RhcnQsIHhlbmQsIHllbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJTdGVtIGR1cmF0aW9uPXswfSBkaXJlY3Rpb249ezF9IHRvcD17Mn0gYm90dG9tPXszfSBlbmQ9ezR9XCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiBvdmVybGFwPXs1fSBzaWRlPXs2fSB3aWR0aF90b19wYWlyPXs3fSByZWNlaXZlcl9pbl9wYWlyPXs4fVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbiwgZGlyZWN0aW9uLCB0b3AuVG9TdHJpbmcoKSwgYm90dG9tLlRvU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZC5Ub1N0cmluZygpLCBub3Rlc292ZXJsYXAsIHNpZGUsIHdpZHRoX3RvX3BhaXIsIHJlY2VpdmVyX2luX3BhaXIpO1xuICAgIH1cblxufSBcblxuXG59XG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMSBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbi8qKiBAY2xhc3MgU3ltYm9sV2lkdGhzXG4gKiBUaGUgU3ltYm9sV2lkdGhzIGNsYXNzIGlzIHVzZWQgdG8gdmVydGljYWxseSBhbGlnbiBub3RlcyBpbiBkaWZmZXJlbnRcbiAqIHRyYWNrcyB0aGF0IG9jY3VyIGF0IHRoZSBzYW1lIHRpbWUgKHRoYXQgaGF2ZSB0aGUgc2FtZSBzdGFydHRpbWUpLlxuICogVGhpcyBpcyBkb25lIGJ5IHRoZSBmb2xsb3dpbmc6XG4gKiAtIFN0b3JlIGEgbGlzdCBvZiBhbGwgdGhlIHN0YXJ0IHRpbWVzLlxuICogLSBTdG9yZSB0aGUgd2lkdGggb2Ygc3ltYm9scyBmb3IgZWFjaCBzdGFydCB0aW1lLCBmb3IgZWFjaCB0cmFjay5cbiAqIC0gU3RvcmUgdGhlIG1heGltdW0gd2lkdGggZm9yIGVhY2ggc3RhcnQgdGltZSwgYWNyb3NzIGFsbCB0cmFja3MuXG4gKiAtIEdldCB0aGUgZXh0cmEgd2lkdGggbmVlZGVkIGZvciBlYWNoIHRyYWNrIHRvIG1hdGNoIHRoZSBtYXhpbXVtXG4gKiAgIHdpZHRoIGZvciB0aGF0IHN0YXJ0IHRpbWUuXG4gKlxuICogU2VlIG1ldGhvZCBTaGVldE11c2ljLkFsaWduU3ltYm9scygpLCB3aGljaCB1c2VzIHRoaXMgY2xhc3MuXG4gKi9cblxucHVibGljIGNsYXNzIFN5bWJvbFdpZHRocyB7XG5cbiAgICAvKiogQXJyYXkgb2YgbWFwcyAoc3RhcnR0aW1lIC0+IHN5bWJvbCB3aWR0aCksIG9uZSBwZXIgdHJhY2sgKi9cbiAgICBwcml2YXRlIERpY3Rpb25hcnk8aW50LCBpbnQ+W10gd2lkdGhzO1xuXG4gICAgLyoqIE1hcCBvZiBzdGFydHRpbWUgLT4gbWF4aW11bSBzeW1ib2wgd2lkdGggKi9cbiAgICBwcml2YXRlIERpY3Rpb25hcnk8aW50LCBpbnQ+IG1heHdpZHRocztcblxuICAgIC8qKiBBbiBhcnJheSBvZiBhbGwgdGhlIHN0YXJ0dGltZXMsIGluIGFsbCB0cmFja3MgKi9cbiAgICBwcml2YXRlIGludFtdIHN0YXJ0dGltZXM7XG5cblxuICAgIC8qKiBJbml0aWFsaXplIHRoZSBzeW1ib2wgd2lkdGggbWFwcywgZ2l2ZW4gYWxsIHRoZSBzeW1ib2xzIGluXG4gICAgICogYWxsIHRoZSB0cmFja3MsIHBsdXMgdGhlIGx5cmljcyBpbiBhbGwgdHJhY2tzLlxuICAgICAqL1xuICAgIHB1YmxpYyBTeW1ib2xXaWR0aHMoTGlzdDxNdXNpY1N5bWJvbD5bXSB0cmFja3MsXG4gICAgICAgICAgICAgICAgICAgICAgICBMaXN0PEx5cmljU3ltYm9sPltdIHRyYWNrbHlyaWNzKSB7XG5cbiAgICAgICAgLyogR2V0IHRoZSBzeW1ib2wgd2lkdGhzIGZvciBhbGwgdGhlIHRyYWNrcyAqL1xuICAgICAgICB3aWR0aHMgPSBuZXcgRGljdGlvbmFyeTxpbnQsaW50PlsgdHJhY2tzLkxlbmd0aCBdO1xuICAgICAgICBmb3IgKGludCB0cmFjayA9IDA7IHRyYWNrIDwgdHJhY2tzLkxlbmd0aDsgdHJhY2srKykge1xuICAgICAgICAgICAgd2lkdGhzW3RyYWNrXSA9IEdldFRyYWNrV2lkdGhzKHRyYWNrc1t0cmFja10pO1xuICAgICAgICB9XG4gICAgICAgIG1heHdpZHRocyA9IG5ldyBEaWN0aW9uYXJ5PGludCxpbnQ+KCk7XG5cbiAgICAgICAgLyogQ2FsY3VsYXRlIHRoZSBtYXhpbXVtIHN5bWJvbCB3aWR0aHMgKi9cbiAgICAgICAgZm9yZWFjaCAoRGljdGlvbmFyeTxpbnQsaW50PiBkaWN0IGluIHdpZHRocykge1xuICAgICAgICAgICAgZm9yZWFjaCAoaW50IHRpbWUgaW4gZGljdC5LZXlzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFtYXh3aWR0aHMuQ29udGFpbnNLZXkodGltZSkgfHxcbiAgICAgICAgICAgICAgICAgICAgKG1heHdpZHRoc1t0aW1lXSA8IGRpY3RbdGltZV0pICkge1xuXG4gICAgICAgICAgICAgICAgICAgIG1heHdpZHRoc1t0aW1lXSA9IGRpY3RbdGltZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRyYWNrbHlyaWNzICE9IG51bGwpIHtcbiAgICAgICAgICAgIGZvcmVhY2ggKExpc3Q8THlyaWNTeW1ib2w+IGx5cmljcyBpbiB0cmFja2x5cmljcykge1xuICAgICAgICAgICAgICAgIGlmIChseXJpY3MgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTHlyaWNTeW1ib2wgbHlyaWMgaW4gbHlyaWNzKSB7XG4gICAgICAgICAgICAgICAgICAgIGludCB3aWR0aCA9IGx5cmljLk1pbldpZHRoO1xuICAgICAgICAgICAgICAgICAgICBpbnQgdGltZSA9IGx5cmljLlN0YXJ0VGltZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXh3aWR0aHMuQ29udGFpbnNLZXkodGltZSkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIChtYXh3aWR0aHNbdGltZV0gPCB3aWR0aCkgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG1heHdpZHRoc1t0aW1lXSA9IHdpZHRoO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyogU3RvcmUgYWxsIHRoZSBzdGFydCB0aW1lcyB0byB0aGUgc3RhcnR0aW1lIGFycmF5ICovXG4gICAgICAgIHN0YXJ0dGltZXMgPSBuZXcgaW50WyBtYXh3aWR0aHMuS2V5cy5Db3VudCBdO1xuICAgICAgICBtYXh3aWR0aHMuS2V5cy5Db3B5VG8oc3RhcnR0aW1lcywgMCk7XG4gICAgICAgIEFycmF5LlNvcnQ8aW50PihzdGFydHRpbWVzKTtcbiAgICB9XG5cbiAgICAvKiogQ3JlYXRlIGEgdGFibGUgb2YgdGhlIHN5bWJvbCB3aWR0aHMgZm9yIGVhY2ggc3RhcnR0aW1lIGluIHRoZSB0cmFjay4gKi9cbiAgICBwcml2YXRlIHN0YXRpYyBEaWN0aW9uYXJ5PGludCxpbnQ+IEdldFRyYWNrV2lkdGhzKExpc3Q8TXVzaWNTeW1ib2w+IHN5bWJvbHMpIHtcbiAgICAgICAgRGljdGlvbmFyeTxpbnQsaW50PiB3aWR0aHMgPSBuZXcgRGljdGlvbmFyeTxpbnQsaW50PigpO1xuXG4gICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIG0gaW4gc3ltYm9scykge1xuICAgICAgICAgICAgaW50IHN0YXJ0ID0gbS5TdGFydFRpbWU7XG4gICAgICAgICAgICBpbnQgdyA9IG0uTWluV2lkdGg7XG5cbiAgICAgICAgICAgIGlmIChtIGlzIEJhclN5bWJvbCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAod2lkdGhzLkNvbnRhaW5zS2V5KHN0YXJ0KSkge1xuICAgICAgICAgICAgICAgIHdpZHRoc1tzdGFydF0gKz0gdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHdpZHRoc1tzdGFydF0gPSB3O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB3aWR0aHM7XG4gICAgfVxuXG4gICAgLyoqIEdpdmVuIGEgdHJhY2sgYW5kIGEgc3RhcnQgdGltZSwgcmV0dXJuIHRoZSBleHRyYSB3aWR0aCBuZWVkZWQgc28gdGhhdFxuICAgICAqIHRoZSBzeW1ib2xzIGZvciB0aGF0IHN0YXJ0IHRpbWUgYWxpZ24gd2l0aCB0aGUgb3RoZXIgdHJhY2tzLlxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgR2V0RXh0cmFXaWR0aChpbnQgdHJhY2ssIGludCBzdGFydCkge1xuICAgICAgICBpZiAoIXdpZHRoc1t0cmFja10uQ29udGFpbnNLZXkoc3RhcnQpKSB7XG4gICAgICAgICAgICByZXR1cm4gbWF4d2lkdGhzW3N0YXJ0XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBtYXh3aWR0aHNbc3RhcnRdIC0gd2lkdGhzW3RyYWNrXVtzdGFydF07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIGFuIGFycmF5IG9mIGFsbCB0aGUgc3RhcnQgdGltZXMgaW4gYWxsIHRoZSB0cmFja3MgKi9cbiAgICBwdWJsaWMgaW50W10gU3RhcnRUaW1lcyB7XG4gICAgICAgIGdldCB7IHJldHVybiBzdGFydHRpbWVzOyB9XG4gICAgfVxuXG5cblxuXG59XG5cblxufVxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogVGhlIHBvc3NpYmxlIG5vdGUgZHVyYXRpb25zICovXG5wdWJsaWMgZW51bSBOb3RlRHVyYXRpb24ge1xuICBUaGlydHlTZWNvbmQsIFNpeHRlZW50aCwgVHJpcGxldCwgRWlnaHRoLFxuICBEb3R0ZWRFaWdodGgsIFF1YXJ0ZXIsIERvdHRlZFF1YXJ0ZXIsXG4gIEhhbGYsIERvdHRlZEhhbGYsIFdob2xlXG59O1xuXG4vKiogQGNsYXNzIFRpbWVTaWduYXR1cmVcbiAqIFRoZSBUaW1lU2lnbmF0dXJlIGNsYXNzIHJlcHJlc2VudHNcbiAqIC0gVGhlIHRpbWUgc2lnbmF0dXJlIG9mIHRoZSBzb25nLCBzdWNoIGFzIDQvNCwgMy80LCBvciA2LzggdGltZSwgYW5kXG4gKiAtIFRoZSBudW1iZXIgb2YgcHVsc2VzIHBlciBxdWFydGVyIG5vdGVcbiAqIC0gVGhlIG51bWJlciBvZiBtaWNyb3NlY29uZHMgcGVyIHF1YXJ0ZXIgbm90ZVxuICpcbiAqIEluIG1pZGkgZmlsZXMsIGFsbCB0aW1lIGlzIG1lYXN1cmVkIGluIFwicHVsc2VzXCIuICBFYWNoIG5vdGUgaGFzXG4gKiBhIHN0YXJ0IHRpbWUgKG1lYXN1cmVkIGluIHB1bHNlcyksIGFuZCBhIGR1cmF0aW9uIChtZWFzdXJlZCBpbiBcbiAqIHB1bHNlcykuICBUaGlzIGNsYXNzIGlzIHVzZWQgbWFpbmx5IHRvIGNvbnZlcnQgcHVsc2UgZHVyYXRpb25zXG4gKiAobGlrZSAxMjAsIDI0MCwgZXRjKSBpbnRvIG5vdGUgZHVyYXRpb25zIChoYWxmLCBxdWFydGVyLCBlaWdodGgsIGV0YykuXG4gKi9cblxucHVibGljIGNsYXNzIFRpbWVTaWduYXR1cmUge1xuICAgIHByaXZhdGUgaW50IG51bWVyYXRvcjsgICAgICAvKiogTnVtZXJhdG9yIG9mIHRoZSB0aW1lIHNpZ25hdHVyZSAqL1xuICAgIHByaXZhdGUgaW50IGRlbm9taW5hdG9yOyAgICAvKiogRGVub21pbmF0b3Igb2YgdGhlIHRpbWUgc2lnbmF0dXJlICovXG4gICAgcHJpdmF0ZSBpbnQgcXVhcnRlcm5vdGU7ICAgIC8qKiBOdW1iZXIgb2YgcHVsc2VzIHBlciBxdWFydGVyIG5vdGUgKi9cbiAgICBwcml2YXRlIGludCBtZWFzdXJlOyAgICAgICAgLyoqIE51bWJlciBvZiBwdWxzZXMgcGVyIG1lYXN1cmUgKi9cbiAgICBwcml2YXRlIGludCB0ZW1wbzsgICAgICAgICAgLyoqIE51bWJlciBvZiBtaWNyb3NlY29uZHMgcGVyIHF1YXJ0ZXIgbm90ZSAqL1xuXG4gICAgLyoqIEdldCB0aGUgbnVtZXJhdG9yIG9mIHRoZSB0aW1lIHNpZ25hdHVyZSAqL1xuICAgIHB1YmxpYyBpbnQgTnVtZXJhdG9yIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIG51bWVyYXRvcjsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIGRlbm9taW5hdG9yIG9mIHRoZSB0aW1lIHNpZ25hdHVyZSAqL1xuICAgIHB1YmxpYyBpbnQgRGVub21pbmF0b3Ige1xuICAgICAgICBnZXQgeyByZXR1cm4gZGVub21pbmF0b3I7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcHVsc2VzIHBlciBxdWFydGVyIG5vdGUgKi9cbiAgICBwdWJsaWMgaW50IFF1YXJ0ZXIge1xuICAgICAgICBnZXQgeyByZXR1cm4gcXVhcnRlcm5vdGU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcHVsc2VzIHBlciBtZWFzdXJlICovXG4gICAgcHVibGljIGludCBNZWFzdXJlIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIG1lYXN1cmU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgbWljcm9zZWNvbmRzIHBlciBxdWFydGVyIG5vdGUgKi8gXG4gICAgcHVibGljIGludCBUZW1wbyB7XG4gICAgICAgIGdldCB7IHJldHVybiB0ZW1wbzsgfVxuICAgIH1cblxuICAgIC8qKiBDcmVhdGUgYSBuZXcgdGltZSBzaWduYXR1cmUsIHdpdGggdGhlIGdpdmVuIG51bWVyYXRvcixcbiAgICAgKiBkZW5vbWluYXRvciwgcHVsc2VzIHBlciBxdWFydGVyIG5vdGUsIGFuZCB0ZW1wby5cbiAgICAgKi9cbiAgICBwdWJsaWMgVGltZVNpZ25hdHVyZShpbnQgbnVtZXJhdG9yLCBpbnQgZGVub21pbmF0b3IsIGludCBxdWFydGVybm90ZSwgaW50IHRlbXBvKSB7XG4gICAgICAgIGlmIChudW1lcmF0b3IgPD0gMCB8fCBkZW5vbWluYXRvciA8PSAwIHx8IHF1YXJ0ZXJub3RlIDw9IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBNaWRpRmlsZUV4Y2VwdGlvbihcIkludmFsaWQgdGltZSBzaWduYXR1cmVcIiwgMCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBNaWRpIEZpbGUgZ2l2ZXMgd3JvbmcgdGltZSBzaWduYXR1cmUgc29tZXRpbWVzICovXG4gICAgICAgIGlmIChudW1lcmF0b3IgPT0gNSkge1xuICAgICAgICAgICAgbnVtZXJhdG9yID0gNDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubnVtZXJhdG9yID0gbnVtZXJhdG9yO1xuICAgICAgICB0aGlzLmRlbm9taW5hdG9yID0gZGVub21pbmF0b3I7XG4gICAgICAgIHRoaXMucXVhcnRlcm5vdGUgPSBxdWFydGVybm90ZTtcbiAgICAgICAgdGhpcy50ZW1wbyA9IHRlbXBvO1xuXG4gICAgICAgIGludCBiZWF0O1xuICAgICAgICBpZiAoZGVub21pbmF0b3IgPCA0KVxuICAgICAgICAgICAgYmVhdCA9IHF1YXJ0ZXJub3RlICogMjtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYmVhdCA9IHF1YXJ0ZXJub3RlIC8gKGRlbm9taW5hdG9yLzQpO1xuXG4gICAgICAgIG1lYXN1cmUgPSBudW1lcmF0b3IgKiBiZWF0O1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gd2hpY2ggbWVhc3VyZSB0aGUgZ2l2ZW4gdGltZSAoaW4gcHVsc2VzKSBiZWxvbmdzIHRvLiAqL1xuICAgIHB1YmxpYyBpbnQgR2V0TWVhc3VyZShpbnQgdGltZSkge1xuICAgICAgICByZXR1cm4gdGltZSAvIG1lYXN1cmU7XG4gICAgfVxuXG4gICAgLyoqIEdpdmVuIGEgZHVyYXRpb24gaW4gcHVsc2VzLCByZXR1cm4gdGhlIGNsb3Nlc3Qgbm90ZSBkdXJhdGlvbi4gKi9cbiAgICBwdWJsaWMgTm90ZUR1cmF0aW9uIEdldE5vdGVEdXJhdGlvbihpbnQgZHVyYXRpb24pIHtcbiAgICAgICAgaW50IHdob2xlID0gcXVhcnRlcm5vdGUgKiA0O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgMSAgICAgICA9IDMyLzMyXG4gICAgICAgICAzLzQgICAgID0gMjQvMzJcbiAgICAgICAgIDEvMiAgICAgPSAxNi8zMlxuICAgICAgICAgMy84ICAgICA9IDEyLzMyXG4gICAgICAgICAxLzQgICAgID0gIDgvMzJcbiAgICAgICAgIDMvMTYgICAgPSAgNi8zMlxuICAgICAgICAgMS84ICAgICA9ICA0LzMyID0gICAgOC82NFxuICAgICAgICAgdHJpcGxldCAgICAgICAgID0gNS4zMy82NFxuICAgICAgICAgMS8xNiAgICA9ICAyLzMyID0gICAgNC82NFxuICAgICAgICAgMS8zMiAgICA9ICAxLzMyID0gICAgMi82NFxuICAgICAgICAgKiovIFxuXG4gICAgICAgIGlmICAgICAgKGR1cmF0aW9uID49IDI4Kndob2xlLzMyKVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5XaG9sZTtcbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPj0gMjAqd2hvbGUvMzIpIFxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5Eb3R0ZWRIYWxmO1xuICAgICAgICBlbHNlIGlmIChkdXJhdGlvbiA+PSAxNCp3aG9sZS8zMilcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uSGFsZjtcbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPj0gMTAqd2hvbGUvMzIpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLkRvdHRlZFF1YXJ0ZXI7XG4gICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID49ICA3Kndob2xlLzMyKVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5RdWFydGVyO1xuICAgICAgICBlbHNlIGlmIChkdXJhdGlvbiA+PSAgNSp3aG9sZS8zMilcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoO1xuICAgICAgICBlbHNlIGlmIChkdXJhdGlvbiA+PSAgNip3aG9sZS82NClcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uRWlnaHRoO1xuICAgICAgICBlbHNlIGlmIChkdXJhdGlvbiA+PSAgNSp3aG9sZS82NClcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uVHJpcGxldDtcbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPj0gIDMqd2hvbGUvNjQpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLlNpeHRlZW50aDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQ7XG4gICAgfVxuXG4gICAgLyoqIENvbnZlcnQgYSBub3RlIGR1cmF0aW9uIGludG8gYSBzdGVtIGR1cmF0aW9uLiAgRG90dGVkIGR1cmF0aW9uc1xuICAgICAqIGFyZSBjb252ZXJ0ZWQgaW50byB0aGVpciBub24tZG90dGVkIGVxdWl2YWxlbnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgTm90ZUR1cmF0aW9uIEdldFN0ZW1EdXJhdGlvbihOb3RlRHVyYXRpb24gZHVyKSB7XG4gICAgICAgIGlmIChkdXIgPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEhhbGYpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLkhhbGY7XG4gICAgICAgIGVsc2UgaWYgKGR1ciA9PSBOb3RlRHVyYXRpb24uRG90dGVkUXVhcnRlcilcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uUXVhcnRlcjtcbiAgICAgICAgZWxzZSBpZiAoZHVyID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGgpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLkVpZ2h0aDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGR1cjtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSB0aW1lIHBlcmlvZCAoaW4gcHVsc2VzKSB0aGUgdGhlIGdpdmVuIGR1cmF0aW9uIHNwYW5zICovXG4gICAgcHVibGljIGludCBEdXJhdGlvblRvVGltZShOb3RlRHVyYXRpb24gZHVyKSB7XG4gICAgICAgIGludCBlaWdodGggPSBxdWFydGVybm90ZS8yO1xuICAgICAgICBpbnQgc2l4dGVlbnRoID0gZWlnaHRoLzI7XG5cbiAgICAgICAgc3dpdGNoIChkdXIpIHtcbiAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLldob2xlOiAgICAgICAgIHJldHVybiBxdWFydGVybm90ZSAqIDQ7IFxuICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uRG90dGVkSGFsZjogICAgcmV0dXJuIHF1YXJ0ZXJub3RlICogMzsgXG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5IYWxmOiAgICAgICAgICByZXR1cm4gcXVhcnRlcm5vdGUgKiAyOyBcbiAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkRvdHRlZFF1YXJ0ZXI6IHJldHVybiAzKmVpZ2h0aDsgXG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5RdWFydGVyOiAgICAgICByZXR1cm4gcXVhcnRlcm5vdGU7IFxuICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoOiAgcmV0dXJuIDMqc2l4dGVlbnRoO1xuICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uRWlnaHRoOiAgICAgICAgcmV0dXJuIGVpZ2h0aDtcbiAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLlRyaXBsZXQ6ICAgICAgIHJldHVybiBxdWFydGVybm90ZS8zOyBcbiAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLlNpeHRlZW50aDogICAgIHJldHVybiBzaXh0ZWVudGg7XG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQ6ICByZXR1cm4gc2l4dGVlbnRoLzI7IFxuICAgICAgICAgICAgZGVmYXVsdDogICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBcbiAgICBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiVGltZVNpZ25hdHVyZT17MH0vezF9IHF1YXJ0ZXI9ezJ9IHRlbXBvPXszfVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1lcmF0b3IsIGRlbm9taW5hdG9yLCBxdWFydGVybm90ZSwgdGVtcG8pO1xuICAgIH1cbiAgICBcbn1cblxufVxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cblxuLyoqIEFjY2lkZW50YWxzICovXG5wdWJsaWMgZW51bSBBY2NpZCB7XG4gICAgTm9uZSwgU2hhcnAsIEZsYXQsIE5hdHVyYWxcbn1cblxuLyoqIEBjbGFzcyBBY2NpZFN5bWJvbFxuICogQW4gYWNjaWRlbnRhbCAoYWNjaWQpIHN5bWJvbCByZXByZXNlbnRzIGEgc2hhcnAsIGZsYXQsIG9yIG5hdHVyYWxcbiAqIGFjY2lkZW50YWwgdGhhdCBpcyBkaXNwbGF5ZWQgYXQgYSBzcGVjaWZpYyBwb3NpdGlvbiAobm90ZSBhbmQgY2xlZikuXG4gKi9cbnB1YmxpYyBjbGFzcyBBY2NpZFN5bWJvbCA6IE11c2ljU3ltYm9sIHtcbiAgICBwcml2YXRlIEFjY2lkIGFjY2lkOyAgICAgICAgICAvKiogVGhlIGFjY2lkZW50YWwgKHNoYXJwLCBmbGF0LCBuYXR1cmFsKSAqL1xuICAgIHByaXZhdGUgV2hpdGVOb3RlIHdoaXRlbm90ZTsgIC8qKiBUaGUgd2hpdGUgbm90ZSB3aGVyZSB0aGUgc3ltYm9sIG9jY3VycyAqL1xuICAgIHByaXZhdGUgQ2xlZiBjbGVmOyAgICAgICAgICAgIC8qKiBXaGljaCBjbGVmIHRoZSBzeW1ib2xzIGlzIGluICovXG4gICAgcHJpdmF0ZSBpbnQgd2lkdGg7ICAgICAgICAgICAgLyoqIFdpZHRoIG9mIHN5bWJvbCAqL1xuXG4gICAgLyoqIFxuICAgICAqIENyZWF0ZSBhIG5ldyBBY2NpZFN5bWJvbCB3aXRoIHRoZSBnaXZlbiBhY2NpZGVudGFsLCB0aGF0IGlzXG4gICAgICogZGlzcGxheWVkIGF0IHRoZSBnaXZlbiBub3RlIGluIHRoZSBnaXZlbiBjbGVmLlxuICAgICAqL1xuICAgIHB1YmxpYyBBY2NpZFN5bWJvbChBY2NpZCBhY2NpZCwgV2hpdGVOb3RlIG5vdGUsIENsZWYgY2xlZikge1xuICAgICAgICB0aGlzLmFjY2lkID0gYWNjaWQ7XG4gICAgICAgIHRoaXMud2hpdGVub3RlID0gbm90ZTtcbiAgICAgICAgdGhpcy5jbGVmID0gY2xlZjtcbiAgICAgICAgd2lkdGggPSBNaW5XaWR0aDtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSB3aGl0ZSBub3RlIHRoaXMgYWNjaWRlbnRhbCBpcyBkaXNwbGF5ZWQgYXQgKi9cbiAgICBwdWJsaWMgV2hpdGVOb3RlIE5vdGUgIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHdoaXRlbm90ZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIHRpbWUgKGluIHB1bHNlcykgdGhpcyBzeW1ib2wgb2NjdXJzIGF0LlxuICAgICAqIE5vdCB1c2VkLiAgSW5zdGVhZCwgdGhlIFN0YXJ0VGltZSBvZiB0aGUgQ2hvcmRTeW1ib2wgY29udGFpbmluZyB0aGlzXG4gICAgICogQWNjaWRTeW1ib2wgaXMgdXNlZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFN0YXJ0VGltZSB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gLTE7IH0gIFxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG1pbmltdW0gd2lkdGggKGluIHBpeGVscykgbmVlZGVkIHRvIGRyYXcgdGhpcyBzeW1ib2wgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IE1pbldpZHRoIHsgXG4gICAgICAgIGdldCB7IHJldHVybiAzKlNoZWV0TXVzaWMuTm90ZUhlaWdodC8yOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldC9TZXQgdGhlIHdpZHRoIChpbiBwaXhlbHMpIG9mIHRoaXMgc3ltYm9sLiBUaGUgd2lkdGggaXMgc2V0XG4gICAgICogaW4gU2hlZXRNdXNpYy5BbGlnblN5bWJvbHMoKSB0byB2ZXJ0aWNhbGx5IGFsaWduIHN5bWJvbHMuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBXaWR0aCB7XG4gICAgICAgIGdldCB7IHJldHVybiB3aWR0aDsgfVxuICAgICAgICBzZXQgeyB3aWR0aCA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGFib3ZlIHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEFib3ZlU3RhZmYge1xuICAgICAgICBnZXQgeyByZXR1cm4gR2V0QWJvdmVTdGFmZigpOyB9XG4gICAgfVxuXG4gICAgaW50IEdldEFib3ZlU3RhZmYoKSB7XG4gICAgICAgIGludCBkaXN0ID0gV2hpdGVOb3RlLlRvcChjbGVmKS5EaXN0KHdoaXRlbm90ZSkgKiBcbiAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcbiAgICAgICAgaWYgKGFjY2lkID09IEFjY2lkLlNoYXJwIHx8IGFjY2lkID09IEFjY2lkLk5hdHVyYWwpXG4gICAgICAgICAgICBkaXN0IC09IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgZWxzZSBpZiAoYWNjaWQgPT0gQWNjaWQuRmxhdClcbiAgICAgICAgICAgIGRpc3QgLT0gMypTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcblxuICAgICAgICBpZiAoZGlzdCA8IDApXG4gICAgICAgICAgICByZXR1cm4gLWRpc3Q7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBiZWxvdyB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBCZWxvd1N0YWZmIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIEdldEJlbG93U3RhZmYoKTsgfVxuICAgIH1cblxuICAgIHByaXZhdGUgaW50IEdldEJlbG93U3RhZmYoKSB7XG4gICAgICAgIGludCBkaXN0ID0gV2hpdGVOb3RlLkJvdHRvbShjbGVmKS5EaXN0KHdoaXRlbm90ZSkgKiBcbiAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQvMiArIFxuICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgaWYgKGFjY2lkID09IEFjY2lkLlNoYXJwIHx8IGFjY2lkID09IEFjY2lkLk5hdHVyYWwpIFxuICAgICAgICAgICAgZGlzdCArPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG5cbiAgICAgICAgaWYgKGRpc3QgPiAwKVxuICAgICAgICAgICAgcmV0dXJuIGRpc3Q7XG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgc3ltYm9sLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIERyYXcoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3ApIHtcbiAgICAgICAgLyogQWxpZ24gdGhlIHN5bWJvbCB0byB0aGUgcmlnaHQgKi9cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oV2lkdGggLSBNaW5XaWR0aCwgMCk7XG5cbiAgICAgICAgLyogU3RvcmUgdGhlIHktcGl4ZWwgdmFsdWUgb2YgdGhlIHRvcCBvZiB0aGUgd2hpdGVub3RlIGluIHlub3RlLiAqL1xuICAgICAgICBpbnQgeW5vdGUgPSB5dG9wICsgV2hpdGVOb3RlLlRvcChjbGVmKS5EaXN0KHdoaXRlbm90ZSkgKiBcbiAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG5cbiAgICAgICAgaWYgKGFjY2lkID09IEFjY2lkLlNoYXJwKVxuICAgICAgICAgICAgRHJhd1NoYXJwKGcsIHBlbiwgeW5vdGUpO1xuICAgICAgICBlbHNlIGlmIChhY2NpZCA9PSBBY2NpZC5GbGF0KVxuICAgICAgICAgICAgRHJhd0ZsYXQoZywgcGVuLCB5bm90ZSk7XG4gICAgICAgIGVsc2UgaWYgKGFjY2lkID09IEFjY2lkLk5hdHVyYWwpXG4gICAgICAgICAgICBEcmF3TmF0dXJhbChnLCBwZW4sIHlub3RlKTtcblxuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKFdpZHRoIC0gTWluV2lkdGgpLCAwKTtcbiAgICB9XG5cbiAgICAvKiogRHJhdyBhIHNoYXJwIHN5bWJvbC4gXG4gICAgICogQHBhcmFtIHlub3RlIFRoZSBwaXhlbCBsb2NhdGlvbiBvZiB0aGUgdG9wIG9mIHRoZSBhY2NpZGVudGFsJ3Mgbm90ZS4gXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgRHJhd1NoYXJwKEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5bm90ZSkge1xuXG4gICAgICAgIC8qIERyYXcgdGhlIHR3byB2ZXJ0aWNhbCBsaW5lcyAqL1xuICAgICAgICBpbnQgeXN0YXJ0ID0geW5vdGUgLSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgIGludCB5ZW5kID0geW5vdGUgKyAyKlNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgaW50IHggPSBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHgsIHlzdGFydCArIDIsIHgsIHllbmQpO1xuICAgICAgICB4ICs9IFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeCwgeXN0YXJ0LCB4LCB5ZW5kIC0gMik7XG5cbiAgICAgICAgLyogRHJhdyB0aGUgc2xpZ2h0bHkgdXB3YXJkcyBob3Jpem9udGFsIGxpbmVzICovXG4gICAgICAgIGludCB4c3RhcnQgPSBTaGVldE11c2ljLk5vdGVIZWlnaHQvMiAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodC80O1xuICAgICAgICBpbnQgeGVuZCA9IFNoZWV0TXVzaWMuTm90ZUhlaWdodCArIFNoZWV0TXVzaWMuTm90ZUhlaWdodC80O1xuICAgICAgICB5c3RhcnQgPSB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVdpZHRoO1xuICAgICAgICB5ZW5kID0geXN0YXJ0IC0gU2hlZXRNdXNpYy5MaW5lV2lkdGggLSBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuICAgICAgICBwZW4uV2lkdGggPSBTaGVldE11c2ljLkxpbmVTcGFjZS8yO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5c3RhcnQsIHhlbmQsIHllbmQpO1xuICAgICAgICB5c3RhcnQgKz0gU2hlZXRNdXNpYy5MaW5lU3BhY2U7XG4gICAgICAgIHllbmQgKz0gU2hlZXRNdXNpYy5MaW5lU3BhY2U7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHlzdGFydCwgeGVuZCwgeWVuZCk7XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG4gICAgfVxuXG4gICAgLyoqIERyYXcgYSBmbGF0IHN5bWJvbC5cbiAgICAgKiBAcGFyYW0geW5vdGUgVGhlIHBpeGVsIGxvY2F0aW9uIG9mIHRoZSB0b3Agb2YgdGhlIGFjY2lkZW50YWwncyBub3RlLlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIERyYXdGbGF0KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5bm90ZSkge1xuICAgICAgICBpbnQgeCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQ7XG5cbiAgICAgICAgLyogRHJhdyB0aGUgdmVydGljYWwgbGluZSAqL1xuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeCwgeW5vdGUgLSBTaGVldE11c2ljLk5vdGVIZWlnaHQgLSBTaGVldE11c2ljLk5vdGVIZWlnaHQvMixcbiAgICAgICAgICAgICAgICAgICAgICAgIHgsIHlub3RlICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KTtcblxuICAgICAgICAvKiBEcmF3IDMgYmV6aWVyIGN1cnZlcy5cbiAgICAgICAgICogQWxsIDMgY3VydmVzIHN0YXJ0IGFuZCBzdG9wIGF0IHRoZSBzYW1lIHBvaW50cy5cbiAgICAgICAgICogRWFjaCBzdWJzZXF1ZW50IGN1cnZlIGJ1bGdlcyBtb3JlIGFuZCBtb3JlIHRvd2FyZHMgXG4gICAgICAgICAqIHRoZSB0b3ByaWdodCBjb3JuZXIsIG1ha2luZyB0aGUgY3VydmUgbG9vayB0aGlja2VyXG4gICAgICAgICAqIHRvd2FyZHMgdGhlIHRvcC1yaWdodC5cbiAgICAgICAgICovXG4gICAgICAgIGcuRHJhd0JlemllcihwZW4sIHgsIHlub3RlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCxcbiAgICAgICAgICAgIHggKyBTaGVldE11c2ljLkxpbmVTcGFjZS8yLCB5bm90ZSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIsXG4gICAgICAgICAgICB4ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UsIHlub3RlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMyxcbiAgICAgICAgICAgIHgsIHlub3RlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UgKyBTaGVldE11c2ljLkxpbmVXaWR0aCArIDEpO1xuXG4gICAgICAgIGcuRHJhd0JlemllcihwZW4sIHgsIHlub3RlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCxcbiAgICAgICAgICAgIHggKyBTaGVldE11c2ljLkxpbmVTcGFjZS8yLCB5bm90ZSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIsXG4gICAgICAgICAgICB4ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UgKyBTaGVldE11c2ljLkxpbmVTcGFjZS80LCBcbiAgICAgICAgICAgICAgeW5vdGUgKyBTaGVldE11c2ljLkxpbmVTcGFjZS8zIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCxcbiAgICAgICAgICAgIHgsIHlub3RlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UgKyBTaGVldE11c2ljLkxpbmVXaWR0aCArIDEpO1xuXG5cbiAgICAgICAgZy5EcmF3QmV6aWVyKHBlbiwgeCwgeW5vdGUgKyBTaGVldE11c2ljLkxpbmVTcGFjZS80LFxuICAgICAgICAgICAgeCArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIsIHlub3RlIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvMixcbiAgICAgICAgICAgIHggKyBTaGVldE11c2ljLkxpbmVTcGFjZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIsIFxuICAgICAgICAgICAgIHlub3RlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMyAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIsXG4gICAgICAgICAgICB4LCB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlICsgU2hlZXRNdXNpYy5MaW5lV2lkdGggKyAxKTtcblxuXG4gICAgfVxuXG4gICAgLyoqIERyYXcgYSBuYXR1cmFsIHN5bWJvbC5cbiAgICAgKiBAcGFyYW0geW5vdGUgVGhlIHBpeGVsIGxvY2F0aW9uIG9mIHRoZSB0b3Agb2YgdGhlIGFjY2lkZW50YWwncyBub3RlLlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIERyYXdOYXR1cmFsKEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5bm90ZSkge1xuXG4gICAgICAgIC8qIERyYXcgdGhlIHR3byB2ZXJ0aWNhbCBsaW5lcyAqL1xuICAgICAgICBpbnQgeXN0YXJ0ID0geW5vdGUgLSBTaGVldE11c2ljLkxpbmVTcGFjZSAtIFNoZWV0TXVzaWMuTGluZVdpZHRoO1xuICAgICAgICBpbnQgeWVuZCA9IHlub3RlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UgKyBTaGVldE11c2ljLkxpbmVXaWR0aDtcbiAgICAgICAgaW50IHggPSBTaGVldE11c2ljLkxpbmVTcGFjZS8yO1xuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeCwgeXN0YXJ0LCB4LCB5ZW5kKTtcbiAgICAgICAgeCArPSBTaGVldE11c2ljLkxpbmVTcGFjZSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQ7XG4gICAgICAgIHlzdGFydCA9IHlub3RlIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNDtcbiAgICAgICAgeWVuZCA9IHlub3RlICsgMipTaGVldE11c2ljLkxpbmVTcGFjZSArIFNoZWV0TXVzaWMuTGluZVdpZHRoIC0gXG4gICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQ7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCB4LCB5c3RhcnQsIHgsIHllbmQpO1xuXG4gICAgICAgIC8qIERyYXcgdGhlIHNsaWdodGx5IHVwd2FyZHMgaG9yaXpvbnRhbCBsaW5lcyAqL1xuICAgICAgICBpbnQgeHN0YXJ0ID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvMjtcbiAgICAgICAgaW50IHhlbmQgPSB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQ7XG4gICAgICAgIHlzdGFydCA9IHlub3RlICsgU2hlZXRNdXNpYy5MaW5lV2lkdGg7XG4gICAgICAgIHllbmQgPSB5c3RhcnQgLSBTaGVldE11c2ljLkxpbmVXaWR0aCAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQ7XG4gICAgICAgIHBlbi5XaWR0aCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzI7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHlzdGFydCwgeGVuZCwgeWVuZCk7XG4gICAgICAgIHlzdGFydCArPSBTaGVldE11c2ljLkxpbmVTcGFjZTtcbiAgICAgICAgeWVuZCArPSBTaGVldE11c2ljLkxpbmVTcGFjZTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeXN0YXJ0LCB4ZW5kLCB5ZW5kKTtcbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb3ZlcnJpZGUgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gc3RyaW5nLkZvcm1hdChcbiAgICAgICAgICBcIkFjY2lkU3ltYm9sIGFjY2lkPXswfSB3aGl0ZW5vdGU9ezF9IGNsZWY9ezJ9IHdpZHRoPXszfVwiLFxuICAgICAgICAgIGFjY2lkLCB3aGl0ZW5vdGUsIGNsZWYsIHdpZHRoKTtcbiAgICB9XG5cbn1cblxufVxuXG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMSBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuXG4vKiogQGNsYXNzIEJhclN5bWJvbFxuICogVGhlIEJhclN5bWJvbCByZXByZXNlbnRzIHRoZSB2ZXJ0aWNhbCBiYXJzIHdoaWNoIGRlbGltaXQgbWVhc3VyZXMuXG4gKiBUaGUgc3RhcnR0aW1lIG9mIHRoZSBzeW1ib2wgaXMgdGhlIGJlZ2lubmluZyBvZiB0aGUgbmV3XG4gKiBtZWFzdXJlLlxuICovXG5wdWJsaWMgY2xhc3MgQmFyU3ltYm9sIDogTXVzaWNTeW1ib2wge1xuICAgIHByaXZhdGUgaW50IHN0YXJ0dGltZTtcbiAgICBwcml2YXRlIGludCB3aWR0aDtcblxuICAgIC8qKiBDcmVhdGUgYSBCYXJTeW1ib2wuIFRoZSBzdGFydHRpbWUgc2hvdWxkIGJlIHRoZSBiZWdpbm5pbmcgb2YgYSBtZWFzdXJlLiAqL1xuICAgIHB1YmxpYyBCYXJTeW1ib2woaW50IHN0YXJ0dGltZSkge1xuICAgICAgICB0aGlzLnN0YXJ0dGltZSA9IHN0YXJ0dGltZTtcbiAgICAgICAgd2lkdGggPSBNaW5XaWR0aDtcbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSB0aW1lIChpbiBwdWxzZXMpIHRoaXMgc3ltYm9sIG9jY3VycyBhdC5cbiAgICAgKiBUaGlzIGlzIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBtZWFzdXJlIHRoaXMgc3ltYm9sIGJlbG9uZ3MgdG8uXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBTdGFydFRpbWUge1xuICAgICAgICBnZXQgeyByZXR1cm4gc3RhcnR0aW1lOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbWluaW11bSB3aWR0aCAoaW4gcGl4ZWxzKSBuZWVkZWQgdG8gZHJhdyB0aGlzIHN5bWJvbCAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgTWluV2lkdGggeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIDIgKiBTaGVldE11c2ljLkxpbmVTcGFjZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQvU2V0IHRoZSB3aWR0aCAoaW4gcGl4ZWxzKSBvZiB0aGlzIHN5bWJvbC4gVGhlIHdpZHRoIGlzIHNldFxuICAgICAqIGluIFNoZWV0TXVzaWMuQWxpZ25TeW1ib2xzKCkgdG8gdmVydGljYWxseSBhbGlnbiBzeW1ib2xzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgV2lkdGgge1xuICAgICAgICBnZXQgeyByZXR1cm4gd2lkdGg7IH1cbiAgICAgICAgc2V0IHsgd2lkdGggPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBhYm92ZSB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBBYm92ZVN0YWZmIHsgXG4gICAgICAgIGdldCB7IHJldHVybiAwOyB9IFxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBiZWxvdyB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBCZWxvd1N0YWZmIHsgXG4gICAgICAgIGdldCB7IHJldHVybiAwOyB9XG4gICAgfVxuXG4gICAgLyoqIERyYXcgYSB2ZXJ0aWNhbCBiYXIuXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHlsb2NhdGlvbiAoaW4gcGl4ZWxzKSB3aGVyZSB0aGUgdG9wIG9mIHRoZSBzdGFmZiBzdGFydHMuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIFxuICAgIHZvaWQgRHJhdyhHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICBpbnQgeSA9IHl0b3A7XG4gICAgICAgIGludCB5ZW5kID0geSArIFNoZWV0TXVzaWMuTGluZVNwYWNlKjQgKyBTaGVldE11c2ljLkxpbmVXaWR0aCo0O1xuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgU2hlZXRNdXNpYy5Ob3RlV2lkdGgvMiwgeSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVXaWR0aC8yLCB5ZW5kKTtcblxuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiQmFyU3ltYm9sIHN0YXJ0dGltZT17MH0gd2lkdGg9ezF9XCIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydHRpbWUsIHdpZHRoKTtcbiAgICB9XG59XG5cblxufVxuXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgQml0bWFwOkltYWdlXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIEJpdG1hcChUeXBlIHR5cGUsIHN0cmluZyBmaWxlbmFtZSlcclxuICAgICAgICA6YmFzZSh0eXBlLGZpbGVuYW1lKXtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBcclxuICAgIH1cclxufVxyXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cblxuLyoqIEBjbGFzcyBCbGFua1N5bWJvbCBcbiAqIFRoZSBCbGFuayBzeW1ib2wgaXMgYSBtdXNpYyBzeW1ib2wgdGhhdCBkb2Vzbid0IGRyYXcgYW55dGhpbmcuICBUaGlzXG4gKiBzeW1ib2wgaXMgdXNlZCBmb3IgYWxpZ25tZW50IHB1cnBvc2VzLCB0byBhbGlnbiBub3RlcyBpbiBkaWZmZXJlbnQgXG4gKiBzdGFmZnMgd2hpY2ggb2NjdXIgYXQgdGhlIHNhbWUgdGltZS5cbiAqL1xucHVibGljIGNsYXNzIEJsYW5rU3ltYm9sIDogTXVzaWNTeW1ib2wge1xuICAgIHByaXZhdGUgaW50IHN0YXJ0dGltZTsgXG4gICAgcHJpdmF0ZSBpbnQgd2lkdGg7XG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IEJsYW5rU3ltYm9sIHdpdGggdGhlIGdpdmVuIHN0YXJ0dGltZSBhbmQgd2lkdGggKi9cbiAgICBwdWJsaWMgQmxhbmtTeW1ib2woaW50IHN0YXJ0dGltZSwgaW50IHdpZHRoKSB7XG4gICAgICAgIHRoaXMuc3RhcnR0aW1lID0gc3RhcnR0aW1lO1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgdGltZSAoaW4gcHVsc2VzKSB0aGlzIHN5bWJvbCBvY2N1cnMgYXQuXG4gICAgICogVGhpcyBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgbWVhc3VyZSB0aGlzIHN5bWJvbCBiZWxvbmdzIHRvLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgU3RhcnRUaW1lIHsgXG4gICAgICAgIGdldCB7IHJldHVybiBzdGFydHRpbWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBtaW5pbXVtIHdpZHRoIChpbiBwaXhlbHMpIG5lZWRlZCB0byBkcmF3IHRoaXMgc3ltYm9sICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBNaW5XaWR0aCB7XG4gICAgICAgIGdldCB7IHJldHVybiAwOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldC9TZXQgdGhlIHdpZHRoIChpbiBwaXhlbHMpIG9mIHRoaXMgc3ltYm9sLiBUaGUgd2lkdGggaXMgc2V0XG4gICAgICogaW4gU2hlZXRNdXNpYy5BbGlnblN5bWJvbHMoKSB0byB2ZXJ0aWNhbGx5IGFsaWduIHN5bWJvbHMuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBXaWR0aCB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gd2lkdGg7IH1cbiAgICAgICAgc2V0IHsgd2lkdGggPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBhYm92ZSB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBBYm92ZVN0YWZmIHsgXG4gICAgICAgIGdldCB7IHJldHVybiAwOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGJlbG93IHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEJlbG93U3RhZmYgeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIDA7IH1cbiAgICB9XG5cbiAgICAvKiogRHJhdyBub3RoaW5nLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIERyYXcoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3ApIHt9XG5cbiAgICBwdWJsaWMgb3ZlcnJpZGUgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gc3RyaW5nLkZvcm1hdChcIkJsYW5rU3ltYm9sIHN0YXJ0dGltZT17MH0gd2lkdGg9ezF9XCIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydHRpbWUsIHdpZHRoKTtcbiAgICB9XG59XG5cblxufVxuXG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMSBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxucHVibGljIGVudW0gU3RlbURpciB7IFVwLCBEb3duIH07XG5cbi8qKiBAY2xhc3MgTm90ZURhdGFcbiAqICBDb250YWlucyBmaWVsZHMgZm9yIGRpc3BsYXlpbmcgYSBzaW5nbGUgbm90ZSBpbiBhIGNob3JkLlxuICovXG5wdWJsaWMgY2xhc3MgTm90ZURhdGEge1xuICAgIHB1YmxpYyBpbnQgbnVtYmVyOyAgICAgICAgICAgICAvKiogVGhlIE1pZGkgbm90ZSBudW1iZXIsIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBjb2xvciAqL1xuICAgIHB1YmxpYyBXaGl0ZU5vdGUgd2hpdGVub3RlOyAgICAvKiogVGhlIHdoaXRlIG5vdGUgbG9jYXRpb24gdG8gZHJhdyAqL1xuICAgIHB1YmxpYyBOb3RlRHVyYXRpb24gZHVyYXRpb247ICAvKiogVGhlIGR1cmF0aW9uIG9mIHRoZSBub3RlICovXG4gICAgcHVibGljIGJvb2wgbGVmdHNpZGU7ICAgICAgICAgIC8qKiBXaGV0aGVyIHRvIGRyYXcgbm90ZSB0byB0aGUgbGVmdCBvciByaWdodCBvZiB0aGUgc3RlbSAqL1xuICAgIHB1YmxpYyBBY2NpZCBhY2NpZDsgICAgICAgICAgICAvKiogVXNlZCB0byBjcmVhdGUgdGhlIEFjY2lkU3ltYm9scyBmb3IgdGhlIGNob3JkICovXG59O1xuXG4vKiogQGNsYXNzIENob3JkU3ltYm9sXG4gKiBBIGNob3JkIHN5bWJvbCByZXByZXNlbnRzIGEgZ3JvdXAgb2Ygbm90ZXMgdGhhdCBhcmUgcGxheWVkIGF0IHRoZSBzYW1lXG4gKiB0aW1lLiAgQSBjaG9yZCBpbmNsdWRlcyB0aGUgbm90ZXMsIHRoZSBhY2NpZGVudGFsIHN5bWJvbHMgZm9yIGVhY2hcbiAqIG5vdGUsIGFuZCB0aGUgc3RlbSAob3Igc3RlbXMpIHRvIHVzZS4gIEEgc2luZ2xlIGNob3JkIG1heSBoYXZlIHR3byBcbiAqIHN0ZW1zIGlmIHRoZSBub3RlcyBoYXZlIGRpZmZlcmVudCBkdXJhdGlvbnMgKGUuZy4gaWYgb25lIG5vdGUgaXMgYVxuICogcXVhcnRlciBub3RlLCBhbmQgYW5vdGhlciBpcyBhbiBlaWdodGggbm90ZSkuXG4gKi9cbnB1YmxpYyBjbGFzcyBDaG9yZFN5bWJvbCA6IE11c2ljU3ltYm9sIHtcbiAgICBwcml2YXRlIENsZWYgY2xlZjsgICAgICAgICAgICAgLyoqIFdoaWNoIGNsZWYgdGhlIGNob3JkIGlzIGJlaW5nIGRyYXduIGluICovXG4gICAgcHJpdmF0ZSBpbnQgc3RhcnR0aW1lOyAgICAgICAgIC8qKiBUaGUgdGltZSAoaW4gcHVsc2VzKSB0aGUgbm90ZXMgb2NjdXJzIGF0ICovXG4gICAgcHJpdmF0ZSBpbnQgZW5kdGltZTsgICAgICAgICAgIC8qKiBUaGUgc3RhcnR0aW1lIHBsdXMgdGhlIGxvbmdlc3Qgbm90ZSBkdXJhdGlvbiAqL1xuICAgIHByaXZhdGUgTm90ZURhdGFbXSBub3RlZGF0YTsgICAvKiogVGhlIG5vdGVzIHRvIGRyYXcgKi9cbiAgICBwcml2YXRlIEFjY2lkU3ltYm9sW10gYWNjaWRzeW1ib2xzOyAgIC8qKiBUaGUgYWNjaWRlbnRhbCBzeW1ib2xzIHRvIGRyYXcgKi9cbiAgICBwcml2YXRlIGludCB3aWR0aDsgICAgICAgICAgICAgLyoqIFRoZSB3aWR0aCBvZiB0aGUgY2hvcmQgKi9cbiAgICBwcml2YXRlIFN0ZW0gc3RlbTE7ICAgICAgICAgICAgLyoqIFRoZSBzdGVtIG9mIHRoZSBjaG9yZC4gQ2FuIGJlIG51bGwuICovXG4gICAgcHJpdmF0ZSBTdGVtIHN0ZW0yOyAgICAgICAgICAgIC8qKiBUaGUgc2Vjb25kIHN0ZW0gb2YgdGhlIGNob3JkLiBDYW4gYmUgbnVsbCAqL1xuICAgIHByaXZhdGUgYm9vbCBoYXN0d29zdGVtczsgICAgICAvKiogVHJ1ZSBpZiB0aGlzIGNob3JkIGhhcyB0d28gc3RlbXMgKi9cbiAgICBwcml2YXRlIFNoZWV0TXVzaWMgc2hlZXRtdXNpYzsgLyoqIFVzZWQgdG8gZ2V0IGNvbG9ycyBhbmQgb3RoZXIgb3B0aW9ucyAqL1xuXG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IENob3JkIFN5bWJvbCBmcm9tIHRoZSBnaXZlbiBsaXN0IG9mIG1pZGkgbm90ZXMuXG4gICAgICogQWxsIHRoZSBtaWRpIG5vdGVzIHdpbGwgaGF2ZSB0aGUgc2FtZSBzdGFydCB0aW1lLiAgVXNlIHRoZVxuICAgICAqIGtleSBzaWduYXR1cmUgdG8gZ2V0IHRoZSB3aGl0ZSBrZXkgYW5kIGFjY2lkZW50YWwgc3ltYm9sIGZvclxuICAgICAqIGVhY2ggbm90ZS4gIFVzZSB0aGUgdGltZSBzaWduYXR1cmUgdG8gY2FsY3VsYXRlIHRoZSBkdXJhdGlvblxuICAgICAqIG9mIHRoZSBub3Rlcy4gVXNlIHRoZSBjbGVmIHdoZW4gZHJhd2luZyB0aGUgY2hvcmQuXG4gICAgICovXG4gICAgcHVibGljIENob3JkU3ltYm9sKExpc3Q8TWlkaU5vdGU+IG1pZGlub3RlcywgS2V5U2lnbmF0dXJlIGtleSwgXG4gICAgICAgICAgICAgICAgICAgICAgIFRpbWVTaWduYXR1cmUgdGltZSwgQ2xlZiBjLCBTaGVldE11c2ljIHNoZWV0KSB7XG5cbiAgICAgICAgaW50IGxlbiA9IG1pZGlub3Rlcy5Db3VudDtcbiAgICAgICAgaW50IGk7XG5cbiAgICAgICAgaGFzdHdvc3RlbXMgPSBmYWxzZTtcbiAgICAgICAgY2xlZiA9IGM7XG4gICAgICAgIHNoZWV0bXVzaWMgPSBzaGVldDtcblxuICAgICAgICBzdGFydHRpbWUgPSBtaWRpbm90ZXNbMF0uU3RhcnRUaW1lO1xuICAgICAgICBlbmR0aW1lID0gbWlkaW5vdGVzWzBdLkVuZFRpbWU7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG1pZGlub3Rlcy5Db3VudDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaSA+IDEpIHtcbiAgICAgICAgICAgICAgICBpZiAobWlkaW5vdGVzW2ldLk51bWJlciA8IG1pZGlub3Rlc1tpLTFdLk51bWJlcikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgU3lzdGVtLkFyZ3VtZW50RXhjZXB0aW9uKFwiQ2hvcmQgbm90ZXMgbm90IGluIGluY3JlYXNpbmcgb3JkZXIgYnkgbnVtYmVyXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVuZHRpbWUgPSBNYXRoLk1heChlbmR0aW1lLCBtaWRpbm90ZXNbaV0uRW5kVGltZSk7XG4gICAgICAgIH1cblxuICAgICAgICBub3RlZGF0YSA9IENyZWF0ZU5vdGVEYXRhKG1pZGlub3Rlcywga2V5LCB0aW1lKTtcbiAgICAgICAgYWNjaWRzeW1ib2xzID0gQ3JlYXRlQWNjaWRTeW1ib2xzKG5vdGVkYXRhLCBjbGVmKTtcblxuXG4gICAgICAgIC8qIEZpbmQgb3V0IGhvdyBtYW55IHN0ZW1zIHdlIG5lZWQgKDEgb3IgMikgKi9cbiAgICAgICAgTm90ZUR1cmF0aW9uIGR1cjEgPSBub3RlZGF0YVswXS5kdXJhdGlvbjtcbiAgICAgICAgTm90ZUR1cmF0aW9uIGR1cjIgPSBkdXIxO1xuICAgICAgICBpbnQgY2hhbmdlID0gLTE7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBub3RlZGF0YS5MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZHVyMiA9IG5vdGVkYXRhW2ldLmR1cmF0aW9uO1xuICAgICAgICAgICAgaWYgKGR1cjEgIT0gZHVyMikge1xuICAgICAgICAgICAgICAgIGNoYW5nZSA9IGk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZHVyMSAhPSBkdXIyKSB7XG4gICAgICAgICAgICAvKiBXZSBoYXZlIG5vdGVzIHdpdGggZGlmZmVyZW50IGR1cmF0aW9ucy4gIFNvIHdlIHdpbGwgbmVlZFxuICAgICAgICAgICAgICogdHdvIHN0ZW1zLiAgVGhlIGZpcnN0IHN0ZW0gcG9pbnRzIGRvd24sIGFuZCBjb250YWlucyB0aGVcbiAgICAgICAgICAgICAqIGJvdHRvbSBub3RlIHVwIHRvIHRoZSBub3RlIHdpdGggdGhlIGRpZmZlcmVudCBkdXJhdGlvbi5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBUaGUgc2Vjb25kIHN0ZW0gcG9pbnRzIHVwLCBhbmQgY29udGFpbnMgdGhlIG5vdGUgd2l0aCB0aGVcbiAgICAgICAgICAgICAqIGRpZmZlcmVudCBkdXJhdGlvbiB1cCB0byB0aGUgdG9wIG5vdGUuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGhhc3R3b3N0ZW1zID0gdHJ1ZTtcbiAgICAgICAgICAgIHN0ZW0xID0gbmV3IFN0ZW0obm90ZWRhdGFbMF0ud2hpdGVub3RlLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90ZWRhdGFbY2hhbmdlLTFdLndoaXRlbm90ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHVyMSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0ZW0uRG93bixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTm90ZXNPdmVybGFwKG5vdGVkYXRhLCAwLCBjaGFuZ2UpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgc3RlbTIgPSBuZXcgU3RlbShub3RlZGF0YVtjaGFuZ2VdLndoaXRlbm90ZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGVkYXRhW25vdGVkYXRhLkxlbmd0aC0xXS53aGl0ZW5vdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR1cjIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdGVtLlVwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOb3Rlc092ZXJsYXAobm90ZWRhdGEsIGNoYW5nZSwgbm90ZWRhdGEuTGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvKiBBbGwgbm90ZXMgaGF2ZSB0aGUgc2FtZSBkdXJhdGlvbiwgc28gd2Ugb25seSBuZWVkIG9uZSBzdGVtLiAqL1xuICAgICAgICAgICAgaW50IGRpcmVjdGlvbiA9IFN0ZW1EaXJlY3Rpb24obm90ZWRhdGFbMF0ud2hpdGVub3RlLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGVkYXRhW25vdGVkYXRhLkxlbmd0aC0xXS53aGl0ZW5vdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVmKTtcblxuICAgICAgICAgICAgc3RlbTEgPSBuZXcgU3RlbShub3RlZGF0YVswXS53aGl0ZW5vdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGVkYXRhW25vdGVkYXRhLkxlbmd0aC0xXS53aGl0ZW5vdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR1cjEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5vdGVzT3ZlcmxhcChub3RlZGF0YSwgMCwgbm90ZWRhdGEuTGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICBzdGVtMiA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBGb3Igd2hvbGUgbm90ZXMsIG5vIHN0ZW0gaXMgZHJhd24uICovXG4gICAgICAgIGlmIChkdXIxID09IE5vdGVEdXJhdGlvbi5XaG9sZSlcbiAgICAgICAgICAgIHN0ZW0xID0gbnVsbDtcbiAgICAgICAgaWYgKGR1cjIgPT0gTm90ZUR1cmF0aW9uLldob2xlKVxuICAgICAgICAgICAgc3RlbTIgPSBudWxsO1xuXG4gICAgICAgIHdpZHRoID0gTWluV2lkdGg7XG4gICAgfVxuXG5cbiAgICAvKiogR2l2ZW4gdGhlIHJhdyBtaWRpIG5vdGVzICh0aGUgbm90ZSBudW1iZXIgYW5kIGR1cmF0aW9uIGluIHB1bHNlcyksXG4gICAgICogY2FsY3VsYXRlIHRoZSBmb2xsb3dpbmcgbm90ZSBkYXRhOlxuICAgICAqIC0gVGhlIHdoaXRlIGtleVxuICAgICAqIC0gVGhlIGFjY2lkZW50YWwgKGlmIGFueSlcbiAgICAgKiAtIFRoZSBub3RlIGR1cmF0aW9uIChoYWxmLCBxdWFydGVyLCBlaWdodGgsIGV0YylcbiAgICAgKiAtIFRoZSBzaWRlIGl0IHNob3VsZCBiZSBkcmF3biAobGVmdCBvciBzaWRlKVxuICAgICAqIEJ5IGRlZmF1bHQsIG5vdGVzIGFyZSBkcmF3biBvbiB0aGUgbGVmdCBzaWRlLiAgSG93ZXZlciwgaWYgdHdvIG5vdGVzXG4gICAgICogb3ZlcmxhcCAobGlrZSBBIGFuZCBCKSB5b3UgY2Fubm90IGRyYXcgdGhlIG5leHQgbm90ZSBkaXJlY3RseSBhYm92ZSBpdC5cbiAgICAgKiBJbnN0ZWFkIHlvdSBtdXN0IHNoaWZ0IG9uZSBvZiB0aGUgbm90ZXMgdG8gdGhlIHJpZ2h0LlxuICAgICAqXG4gICAgICogVGhlIEtleVNpZ25hdHVyZSBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgd2hpdGUga2V5IGFuZCBhY2NpZGVudGFsLlxuICAgICAqIFRoZSBUaW1lU2lnbmF0dXJlIGlzIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBkdXJhdGlvbi5cbiAgICAgKi9cbiBcbiAgICBwcml2YXRlIHN0YXRpYyBOb3RlRGF0YVtdIFxuICAgIENyZWF0ZU5vdGVEYXRhKExpc3Q8TWlkaU5vdGU+IG1pZGlub3RlcywgS2V5U2lnbmF0dXJlIGtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRpbWVTaWduYXR1cmUgdGltZSkge1xuXG4gICAgICAgIGludCBsZW4gPSBtaWRpbm90ZXMuQ291bnQ7XG4gICAgICAgIE5vdGVEYXRhW10gbm90ZWRhdGEgPSBuZXcgTm90ZURhdGFbbGVuXTtcblxuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBNaWRpTm90ZSBtaWRpID0gbWlkaW5vdGVzW2ldO1xuICAgICAgICAgICAgbm90ZWRhdGFbaV0gPSBuZXcgTm90ZURhdGEoKTtcbiAgICAgICAgICAgIG5vdGVkYXRhW2ldLm51bWJlciA9IG1pZGkuTnVtYmVyO1xuICAgICAgICAgICAgbm90ZWRhdGFbaV0ubGVmdHNpZGUgPSB0cnVlO1xuICAgICAgICAgICAgbm90ZWRhdGFbaV0ud2hpdGVub3RlID0ga2V5LkdldFdoaXRlTm90ZShtaWRpLk51bWJlcik7XG4gICAgICAgICAgICBub3RlZGF0YVtpXS5kdXJhdGlvbiA9IHRpbWUuR2V0Tm90ZUR1cmF0aW9uKG1pZGkuRW5kVGltZSAtIG1pZGkuU3RhcnRUaW1lKTtcbiAgICAgICAgICAgIG5vdGVkYXRhW2ldLmFjY2lkID0ga2V5LkdldEFjY2lkZW50YWwobWlkaS5OdW1iZXIsIG1pZGkuU3RhcnRUaW1lIC8gdGltZS5NZWFzdXJlKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGkgPiAwICYmIChub3RlZGF0YVtpXS53aGl0ZW5vdGUuRGlzdChub3RlZGF0YVtpLTFdLndoaXRlbm90ZSkgPT0gMSkpIHtcbiAgICAgICAgICAgICAgICAvKiBUaGlzIG5vdGUgKG5vdGVkYXRhW2ldKSBvdmVybGFwcyB3aXRoIHRoZSBwcmV2aW91cyBub3RlLlxuICAgICAgICAgICAgICAgICAqIENoYW5nZSB0aGUgc2lkZSBvZiB0aGlzIG5vdGUuXG4gICAgICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgICAgICBpZiAobm90ZWRhdGFbaS0xXS5sZWZ0c2lkZSkge1xuICAgICAgICAgICAgICAgICAgICBub3RlZGF0YVtpXS5sZWZ0c2lkZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5vdGVkYXRhW2ldLmxlZnRzaWRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5vdGVkYXRhW2ldLmxlZnRzaWRlID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm90ZWRhdGE7XG4gICAgfVxuXG5cbiAgICAvKiogR2l2ZW4gdGhlIG5vdGUgZGF0YSAodGhlIHdoaXRlIGtleXMgYW5kIGFjY2lkZW50YWxzKSwgY3JlYXRlIFxuICAgICAqIHRoZSBBY2NpZGVudGFsIFN5bWJvbHMgYW5kIHJldHVybiB0aGVtLlxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIEFjY2lkU3ltYm9sW10gXG4gICAgQ3JlYXRlQWNjaWRTeW1ib2xzKE5vdGVEYXRhW10gbm90ZWRhdGEsIENsZWYgY2xlZikge1xuICAgICAgICBpbnQgY291bnQgPSAwO1xuICAgICAgICBmb3JlYWNoIChOb3RlRGF0YSBuIGluIG5vdGVkYXRhKSB7XG4gICAgICAgICAgICBpZiAobi5hY2NpZCAhPSBBY2NpZC5Ob25lKSB7XG4gICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBBY2NpZFN5bWJvbFtdIHN5bWJvbHMgPSBuZXcgQWNjaWRTeW1ib2xbY291bnRdO1xuICAgICAgICBpbnQgaSA9IDA7XG4gICAgICAgIGZvcmVhY2ggKE5vdGVEYXRhIG4gaW4gbm90ZWRhdGEpIHtcbiAgICAgICAgICAgIGlmIChuLmFjY2lkICE9IEFjY2lkLk5vbmUpIHtcbiAgICAgICAgICAgICAgICBzeW1ib2xzW2ldID0gbmV3IEFjY2lkU3ltYm9sKG4uYWNjaWQsIG4ud2hpdGVub3RlLCBjbGVmKTtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN5bWJvbHM7XG4gICAgfVxuXG4gICAgLyoqIENhbGN1bGF0ZSB0aGUgc3RlbSBkaXJlY3Rpb24gKFVwIG9yIGRvd24pIGJhc2VkIG9uIHRoZSB0b3AgYW5kXG4gICAgICogYm90dG9tIG5vdGUgaW4gdGhlIGNob3JkLiAgSWYgdGhlIGF2ZXJhZ2Ugb2YgdGhlIG5vdGVzIGlzIGFib3ZlXG4gICAgICogdGhlIG1pZGRsZSBvZiB0aGUgc3RhZmYsIHRoZSBkaXJlY3Rpb24gaXMgZG93bi4gIEVsc2UsIHRoZVxuICAgICAqIGRpcmVjdGlvbiBpcyB1cC5cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBpbnQgXG4gICAgU3RlbURpcmVjdGlvbihXaGl0ZU5vdGUgYm90dG9tLCBXaGl0ZU5vdGUgdG9wLCBDbGVmIGNsZWYpIHtcbiAgICAgICAgV2hpdGVOb3RlIG1pZGRsZTtcbiAgICAgICAgaWYgKGNsZWYgPT0gQ2xlZi5UcmVibGUpXG4gICAgICAgICAgICBtaWRkbGUgPSBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5CLCA1KTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbWlkZGxlID0gbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRCwgMyk7XG5cbiAgICAgICAgaW50IGRpc3QgPSBtaWRkbGUuRGlzdChib3R0b20pICsgbWlkZGxlLkRpc3QodG9wKTtcbiAgICAgICAgaWYgKGRpc3QgPj0gMClcbiAgICAgICAgICAgIHJldHVybiBTdGVtLlVwO1xuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgcmV0dXJuIFN0ZW0uRG93bjtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHdoZXRoZXIgYW55IG9mIHRoZSBub3RlcyBpbiBub3RlZGF0YSAoYmV0d2VlbiBzdGFydCBhbmRcbiAgICAgKiBlbmQgaW5kZXhlcykgb3ZlcmxhcC4gIFRoaXMgaXMgbmVlZGVkIGJ5IHRoZSBTdGVtIGNsYXNzIHRvXG4gICAgICogZGV0ZXJtaW5lIHRoZSBwb3NpdGlvbiBvZiB0aGUgc3RlbSAobGVmdCBvciByaWdodCBvZiBub3RlcykuXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgYm9vbCBOb3Rlc092ZXJsYXAoTm90ZURhdGFbXSBub3RlZGF0YSwgaW50IHN0YXJ0LCBpbnQgZW5kKSB7XG4gICAgICAgIGZvciAoaW50IGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoIW5vdGVkYXRhW2ldLmxlZnRzaWRlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIHRpbWUgKGluIHB1bHNlcykgdGhpcyBzeW1ib2wgb2NjdXJzIGF0LlxuICAgICAqIFRoaXMgaXMgdXNlZCB0byBkZXRlcm1pbmUgdGhlIG1lYXN1cmUgdGhpcyBzeW1ib2wgYmVsb25ncyB0by5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFN0YXJ0VGltZSB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gc3RhcnR0aW1lOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgZW5kIHRpbWUgKGluIHB1bHNlcykgb2YgdGhlIGxvbmdlc3Qgbm90ZSBpbiB0aGUgY2hvcmQuXG4gICAgICogVXNlZCB0byBkZXRlcm1pbmUgd2hldGhlciB0d28gYWRqYWNlbnQgY2hvcmRzIGNhbiBiZSBqb2luZWRcbiAgICAgKiBieSBhIHN0ZW0uXG4gICAgICovXG4gICAgcHVibGljIGludCBFbmRUaW1lIHsgXG4gICAgICAgIGdldCB7IHJldHVybiBlbmR0aW1lOyB9XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgY2xlZiB0aGlzIGNob3JkIGlzIGRyYXduIGluLiAqL1xuICAgIHB1YmxpYyBDbGVmIENsZWYgeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIGNsZWY7IH1cbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRydWUgaWYgdGhpcyBjaG9yZCBoYXMgdHdvIHN0ZW1zICovXG4gICAgcHVibGljIGJvb2wgSGFzVHdvU3RlbXMge1xuICAgICAgICBnZXQgeyByZXR1cm4gaGFzdHdvc3RlbXM7IH1cbiAgICB9XG5cbiAgICAvKiBSZXR1cm4gdGhlIHN0ZW0gd2lsbCB0aGUgc21hbGxlc3QgZHVyYXRpb24uICBUaGlzIHByb3BlcnR5XG4gICAgICogaXMgdXNlZCB3aGVuIG1ha2luZyBjaG9yZCBwYWlycyAoY2hvcmRzIGpvaW5lZCBieSBhIGhvcml6b250YWxcbiAgICAgKiBiZWFtIHN0ZW0pLiBUaGUgc3RlbSBkdXJhdGlvbnMgbXVzdCBtYXRjaCBpbiBvcmRlciB0byBtYWtlXG4gICAgICogYSBjaG9yZCBwYWlyLiAgSWYgYSBjaG9yZCBoYXMgdHdvIHN0ZW1zLCB3ZSBhbHdheXMgcmV0dXJuXG4gICAgICogdGhlIG9uZSB3aXRoIGEgc21hbGxlciBkdXJhdGlvbiwgYmVjYXVzZSBpdCBoYXMgYSBiZXR0ZXIgXG4gICAgICogY2hhbmNlIG9mIG1ha2luZyBhIHBhaXIuXG4gICAgICovXG4gICAgcHVibGljIFN0ZW0gU3RlbSB7XG4gICAgICAgIGdldCB7IFxuICAgICAgICAgICAgaWYgKHN0ZW0xID09IG51bGwpIHsgcmV0dXJuIHN0ZW0yOyB9XG4gICAgICAgICAgICBlbHNlIGlmIChzdGVtMiA9PSBudWxsKSB7IHJldHVybiBzdGVtMTsgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc3RlbTEuRHVyYXRpb24gPCBzdGVtMi5EdXJhdGlvbikgeyByZXR1cm4gc3RlbTE7IH1cbiAgICAgICAgICAgIGVsc2UgeyByZXR1cm4gc3RlbTI7IH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBHZXQvU2V0IHRoZSB3aWR0aCAoaW4gcGl4ZWxzKSBvZiB0aGlzIHN5bWJvbC4gVGhlIHdpZHRoIGlzIHNldFxuICAgICAqIGluIFNoZWV0TXVzaWMuQWxpZ25TeW1ib2xzKCkgdG8gdmVydGljYWxseSBhbGlnbiBzeW1ib2xzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgV2lkdGgge1xuICAgICAgICBnZXQgeyByZXR1cm4gd2lkdGg7IH1cbiAgICAgICAgc2V0IHsgd2lkdGggPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG1pbmltdW0gd2lkdGggKGluIHBpeGVscykgbmVlZGVkIHRvIGRyYXcgdGhpcyBzeW1ib2wgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IE1pbldpZHRoIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIEdldE1pbldpZHRoKCk7IH1cbiAgICB9XG5cbiAgICAvKiBSZXR1cm4gdGhlIG1pbmltdW0gd2lkdGggbmVlZGVkIHRvIGRpc3BsYXkgdGhpcyBjaG9yZC5cbiAgICAgKlxuICAgICAqIFRoZSBhY2NpZGVudGFsIHN5bWJvbHMgY2FuIGJlIGRyYXduIGFib3ZlIG9uZSBhbm90aGVyIGFzIGxvbmdcbiAgICAgKiBhcyB0aGV5IGRvbid0IG92ZXJsYXAgKHRoZXkgbXVzdCBiZSBhdCBsZWFzdCA2IG5vdGVzIGFwYXJ0KS5cbiAgICAgKiBJZiB0d28gYWNjaWRlbnRhbCBzeW1ib2xzIGRvIG92ZXJsYXAsIHRoZSBhY2NpZGVudGFsIHN5bWJvbFxuICAgICAqIG9uIHRvcCBtdXN0IGJlIHNoaWZ0ZWQgdG8gdGhlIHJpZ2h0LiAgU28gdGhlIHdpZHRoIG5lZWRlZCBmb3JcbiAgICAgKiBhY2NpZGVudGFsIHN5bWJvbHMgZGVwZW5kcyBvbiB3aGV0aGVyIHRoZXkgb3ZlcmxhcCBvciBub3QuXG4gICAgICpcbiAgICAgKiBJZiB3ZSBhcmUgYWxzbyBkaXNwbGF5aW5nIHRoZSBsZXR0ZXJzLCBpbmNsdWRlIGV4dHJhIHdpZHRoLlxuICAgICAqL1xuICAgIGludCBHZXRNaW5XaWR0aCgpIHtcbiAgICAgICAgLyogVGhlIHdpZHRoIG5lZWRlZCBmb3IgdGhlIG5vdGUgY2lyY2xlcyAqL1xuICAgICAgICBpbnQgcmVzdWx0ID0gMipTaGVldE11c2ljLk5vdGVIZWlnaHQgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQqMy80O1xuXG4gICAgICAgIGlmIChhY2NpZHN5bWJvbHMuTGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IGFjY2lkc3ltYm9sc1swXS5NaW5XaWR0aDtcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAxOyBpIDwgYWNjaWRzeW1ib2xzLkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgQWNjaWRTeW1ib2wgYWNjaWQgPSBhY2NpZHN5bWJvbHNbaV07XG4gICAgICAgICAgICAgICAgQWNjaWRTeW1ib2wgcHJldiA9IGFjY2lkc3ltYm9sc1tpLTFdO1xuICAgICAgICAgICAgICAgIGlmIChhY2NpZC5Ob3RlLkRpc3QocHJldi5Ob3RlKSA8IDYpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IGFjY2lkLk1pbldpZHRoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoc2hlZXRtdXNpYyAhPSBudWxsICYmIHNoZWV0bXVzaWMuU2hvd05vdGVMZXR0ZXJzICE9IE1pZGlPcHRpb25zLk5vdGVOYW1lTm9uZSkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IDg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBhYm92ZSB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBBYm92ZVN0YWZmIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIEdldEFib3ZlU3RhZmYoKTsgfVxuICAgIH1cblxuICAgIHByaXZhdGUgaW50IEdldEFib3ZlU3RhZmYoKSB7XG4gICAgICAgIC8qIEZpbmQgdGhlIHRvcG1vc3Qgbm90ZSBpbiB0aGUgY2hvcmQgKi9cbiAgICAgICAgV2hpdGVOb3RlIHRvcG5vdGUgPSBub3RlZGF0YVsgbm90ZWRhdGEuTGVuZ3RoLTEgXS53aGl0ZW5vdGU7XG5cbiAgICAgICAgLyogVGhlIHN0ZW0uRW5kIGlzIHRoZSBub3RlIHBvc2l0aW9uIHdoZXJlIHRoZSBzdGVtIGVuZHMuXG4gICAgICAgICAqIENoZWNrIGlmIHRoZSBzdGVtIGVuZCBpcyBoaWdoZXIgdGhhbiB0aGUgdG9wIG5vdGUuXG4gICAgICAgICAqL1xuICAgICAgICBpZiAoc3RlbTEgIT0gbnVsbClcbiAgICAgICAgICAgIHRvcG5vdGUgPSBXaGl0ZU5vdGUuTWF4KHRvcG5vdGUsIHN0ZW0xLkVuZCk7XG4gICAgICAgIGlmIChzdGVtMiAhPSBudWxsKVxuICAgICAgICAgICAgdG9wbm90ZSA9IFdoaXRlTm90ZS5NYXgodG9wbm90ZSwgc3RlbTIuRW5kKTtcblxuICAgICAgICBpbnQgZGlzdCA9IHRvcG5vdGUuRGlzdChXaGl0ZU5vdGUuVG9wKGNsZWYpKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICBpbnQgcmVzdWx0ID0gMDtcbiAgICAgICAgaWYgKGRpc3QgPiAwKVxuICAgICAgICAgICAgcmVzdWx0ID0gZGlzdDtcblxuICAgICAgICAvKiBDaGVjayBpZiBhbnkgYWNjaWRlbnRhbCBzeW1ib2xzIGV4dGVuZCBhYm92ZSB0aGUgc3RhZmYgKi9cbiAgICAgICAgZm9yZWFjaCAoQWNjaWRTeW1ib2wgc3ltYm9sIGluIGFjY2lkc3ltYm9scykge1xuICAgICAgICAgICAgaWYgKHN5bWJvbC5BYm92ZVN0YWZmID4gcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gc3ltYm9sLkFib3ZlU3RhZmY7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYmVsb3cgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQmVsb3dTdGFmZiB7XG4gICAgICAgIGdldCB7IHJldHVybiBHZXRCZWxvd1N0YWZmKCk7IH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGludCBHZXRCZWxvd1N0YWZmKCkge1xuICAgICAgICAvKiBGaW5kIHRoZSBib3R0b20gbm90ZSBpbiB0aGUgY2hvcmQgKi9cbiAgICAgICAgV2hpdGVOb3RlIGJvdHRvbW5vdGUgPSBub3RlZGF0YVswXS53aGl0ZW5vdGU7XG5cbiAgICAgICAgLyogVGhlIHN0ZW0uRW5kIGlzIHRoZSBub3RlIHBvc2l0aW9uIHdoZXJlIHRoZSBzdGVtIGVuZHMuXG4gICAgICAgICAqIENoZWNrIGlmIHRoZSBzdGVtIGVuZCBpcyBsb3dlciB0aGFuIHRoZSBib3R0b20gbm90ZS5cbiAgICAgICAgICovXG4gICAgICAgIGlmIChzdGVtMSAhPSBudWxsKVxuICAgICAgICAgICAgYm90dG9tbm90ZSA9IFdoaXRlTm90ZS5NaW4oYm90dG9tbm90ZSwgc3RlbTEuRW5kKTtcbiAgICAgICAgaWYgKHN0ZW0yICE9IG51bGwpXG4gICAgICAgICAgICBib3R0b21ub3RlID0gV2hpdGVOb3RlLk1pbihib3R0b21ub3RlLCBzdGVtMi5FbmQpO1xuXG4gICAgICAgIGludCBkaXN0ID0gV2hpdGVOb3RlLkJvdHRvbShjbGVmKS5EaXN0KGJvdHRvbW5vdGUpICpcbiAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcblxuICAgICAgICBpbnQgcmVzdWx0ID0gMDtcbiAgICAgICAgaWYgKGRpc3QgPiAwKVxuICAgICAgICAgICAgcmVzdWx0ID0gZGlzdDtcblxuICAgICAgICAvKiBDaGVjayBpZiBhbnkgYWNjaWRlbnRhbCBzeW1ib2xzIGV4dGVuZCBiZWxvdyB0aGUgc3RhZmYgKi8gXG4gICAgICAgIGZvcmVhY2ggKEFjY2lkU3ltYm9sIHN5bWJvbCBpbiBhY2NpZHN5bWJvbHMpIHtcbiAgICAgICAgICAgIGlmIChzeW1ib2wuQmVsb3dTdGFmZiA+IHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHN5bWJvbC5CZWxvd1N0YWZmO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbmFtZSBmb3IgdGhpcyBub3RlICovXG4gICAgcHJpdmF0ZSBzdHJpbmcgTm90ZU5hbWUoaW50IG5vdGVudW1iZXIsIFdoaXRlTm90ZSB3aGl0ZW5vdGUpIHtcbiAgICAgICAgaWYgKHNoZWV0bXVzaWMuU2hvd05vdGVMZXR0ZXJzID09IE1pZGlPcHRpb25zLk5vdGVOYW1lTGV0dGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gTGV0dGVyKG5vdGVudW1iZXIsIHdoaXRlbm90ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc2hlZXRtdXNpYy5TaG93Tm90ZUxldHRlcnMgPT0gTWlkaU9wdGlvbnMuTm90ZU5hbWVGaXhlZERvUmVNaSkge1xuICAgICAgICAgICAgc3RyaW5nW10gZml4ZWREb1JlTWkgPSB7XG4gICAgICAgICAgICAgICAgXCJMYVwiLCBcIkxpXCIsIFwiVGlcIiwgXCJEb1wiLCBcIkRpXCIsIFwiUmVcIiwgXCJSaVwiLCBcIk1pXCIsIFwiRmFcIiwgXCJGaVwiLCBcIlNvXCIsIFwiU2lcIiBcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpbnQgbm90ZXNjYWxlID0gTm90ZVNjYWxlLkZyb21OdW1iZXIobm90ZW51bWJlcik7XG4gICAgICAgICAgICByZXR1cm4gZml4ZWREb1JlTWlbbm90ZXNjYWxlXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzaGVldG11c2ljLlNob3dOb3RlTGV0dGVycyA9PSBNaWRpT3B0aW9ucy5Ob3RlTmFtZU1vdmFibGVEb1JlTWkpIHtcbiAgICAgICAgICAgIHN0cmluZ1tdIGZpeGVkRG9SZU1pID0ge1xuICAgICAgICAgICAgICAgIFwiTGFcIiwgXCJMaVwiLCBcIlRpXCIsIFwiRG9cIiwgXCJEaVwiLCBcIlJlXCIsIFwiUmlcIiwgXCJNaVwiLCBcIkZhXCIsIFwiRmlcIiwgXCJTb1wiLCBcIlNpXCIgXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaW50IG1haW5zY2FsZSA9IHNoZWV0bXVzaWMuTWFpbktleS5Ob3Rlc2NhbGUoKTtcbiAgICAgICAgICAgIGludCBkaWZmID0gTm90ZVNjYWxlLkMgLSBtYWluc2NhbGU7XG4gICAgICAgICAgICBub3RlbnVtYmVyICs9IGRpZmY7XG4gICAgICAgICAgICBpZiAobm90ZW51bWJlciA8IDApIHtcbiAgICAgICAgICAgICAgICBub3RlbnVtYmVyICs9IDEyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW50IG5vdGVzY2FsZSA9IE5vdGVTY2FsZS5Gcm9tTnVtYmVyKG5vdGVudW1iZXIpO1xuICAgICAgICAgICAgcmV0dXJuIGZpeGVkRG9SZU1pW25vdGVzY2FsZV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc2hlZXRtdXNpYy5TaG93Tm90ZUxldHRlcnMgPT0gTWlkaU9wdGlvbnMuTm90ZU5hbWVGaXhlZE51bWJlcikge1xuICAgICAgICAgICAgc3RyaW5nW10gbnVtID0ge1xuICAgICAgICAgICAgICAgIFwiMTBcIiwgXCIxMVwiLCBcIjEyXCIsIFwiMVwiLCBcIjJcIiwgXCIzXCIsIFwiNFwiLCBcIjVcIiwgXCI2XCIsIFwiN1wiLCBcIjhcIiwgXCI5XCIgXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaW50IG5vdGVzY2FsZSA9IE5vdGVTY2FsZS5Gcm9tTnVtYmVyKG5vdGVudW1iZXIpO1xuICAgICAgICAgICAgcmV0dXJuIG51bVtub3Rlc2NhbGVdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHNoZWV0bXVzaWMuU2hvd05vdGVMZXR0ZXJzID09IE1pZGlPcHRpb25zLk5vdGVOYW1lTW92YWJsZU51bWJlcikge1xuICAgICAgICAgICAgc3RyaW5nW10gbnVtID0ge1xuICAgICAgICAgICAgICAgIFwiMTBcIiwgXCIxMVwiLCBcIjEyXCIsIFwiMVwiLCBcIjJcIiwgXCIzXCIsIFwiNFwiLCBcIjVcIiwgXCI2XCIsIFwiN1wiLCBcIjhcIiwgXCI5XCIgXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaW50IG1haW5zY2FsZSA9IHNoZWV0bXVzaWMuTWFpbktleS5Ob3Rlc2NhbGUoKTtcbiAgICAgICAgICAgIGludCBkaWZmID0gTm90ZVNjYWxlLkMgLSBtYWluc2NhbGU7XG4gICAgICAgICAgICBub3RlbnVtYmVyICs9IGRpZmY7XG4gICAgICAgICAgICBpZiAobm90ZW51bWJlciA8IDApIHtcbiAgICAgICAgICAgICAgICBub3RlbnVtYmVyICs9IDEyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW50IG5vdGVzY2FsZSA9IE5vdGVTY2FsZS5Gcm9tTnVtYmVyKG5vdGVudW1iZXIpO1xuICAgICAgICAgICAgcmV0dXJuIG51bVtub3Rlc2NhbGVdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBsZXR0ZXIgKEEsIEEjLCBCYikgcmVwcmVzZW50aW5nIHRoaXMgbm90ZSAqL1xuICAgIHByaXZhdGUgc3RyaW5nIExldHRlcihpbnQgbm90ZW51bWJlciwgV2hpdGVOb3RlIHdoaXRlbm90ZSkge1xuICAgICAgICBpbnQgbm90ZXNjYWxlID0gTm90ZVNjYWxlLkZyb21OdW1iZXIobm90ZW51bWJlcik7XG4gICAgICAgIHN3aXRjaChub3Rlc2NhbGUpIHtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkE6IHJldHVybiBcIkFcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkI6IHJldHVybiBcIkJcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkM6IHJldHVybiBcIkNcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkQ6IHJldHVybiBcIkRcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkU6IHJldHVybiBcIkVcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkY6IHJldHVybiBcIkZcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkc6IHJldHVybiBcIkdcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkFzaGFycDpcbiAgICAgICAgICAgICAgICBpZiAod2hpdGVub3RlLkxldHRlciA9PSBXaGl0ZU5vdGUuQSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiQSNcIjtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIkJiXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5Dc2hhcnA6XG4gICAgICAgICAgICAgICAgaWYgKHdoaXRlbm90ZS5MZXR0ZXIgPT0gV2hpdGVOb3RlLkMpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIkMjXCI7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJEYlwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRHNoYXJwOlxuICAgICAgICAgICAgICAgIGlmICh3aGl0ZW5vdGUuTGV0dGVyID09IFdoaXRlTm90ZS5EKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJEI1wiO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiRWJcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkZzaGFycDpcbiAgICAgICAgICAgICAgICBpZiAod2hpdGVub3RlLkxldHRlciA9PSBXaGl0ZU5vdGUuRilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiRiNcIjtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIkdiXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5Hc2hhcnA6XG4gICAgICAgICAgICAgICAgaWYgKHdoaXRlbm90ZS5MZXR0ZXIgPT0gV2hpdGVOb3RlLkcpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIkcjXCI7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJBYlwiO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBEcmF3IHRoZSBDaG9yZCBTeW1ib2w6XG4gICAgICogLSBEcmF3IHRoZSBhY2NpZGVudGFsIHN5bWJvbHMuXG4gICAgICogLSBEcmF3IHRoZSBibGFjayBjaXJjbGUgbm90ZXMuXG4gICAgICogLSBEcmF3IHRoZSBzdGVtcy5cbiAgICAgIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIERyYXcoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3ApIHtcbiAgICAgICAgLyogQWxpZ24gdGhlIGNob3JkIHRvIHRoZSByaWdodCAqL1xuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybShXaWR0aCAtIE1pbldpZHRoLCAwKTtcblxuICAgICAgICAvKiBEcmF3IHRoZSBhY2NpZGVudGFscy4gKi9cbiAgICAgICAgV2hpdGVOb3RlIHRvcHN0YWZmID0gV2hpdGVOb3RlLlRvcChjbGVmKTtcbiAgICAgICAgaW50IHhwb3MgPSBEcmF3QWNjaWQoZywgcGVuLCB5dG9wKTtcblxuICAgICAgICAvKiBEcmF3IHRoZSBub3RlcyAqL1xuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSh4cG9zLCAwKTtcbiAgICAgICAgRHJhd05vdGVzKGcsIHBlbiwgeXRvcCwgdG9wc3RhZmYpO1xuICAgICAgICBpZiAoc2hlZXRtdXNpYyAhPSBudWxsICYmIHNoZWV0bXVzaWMuU2hvd05vdGVMZXR0ZXJzICE9IDApIHtcbiAgICAgICAgICAgIERyYXdOb3RlTGV0dGVycyhnLCBwZW4sIHl0b3AsIHRvcHN0YWZmKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIERyYXcgdGhlIHN0ZW1zICovXG4gICAgICAgIGlmIChzdGVtMSAhPSBudWxsKVxuICAgICAgICAgICAgc3RlbTEuRHJhdyhnLCBwZW4sIHl0b3AsIHRvcHN0YWZmKTtcbiAgICAgICAgaWYgKHN0ZW0yICE9IG51bGwpXG4gICAgICAgICAgICBzdGVtMi5EcmF3KGcsIHBlbiwgeXRvcCwgdG9wc3RhZmYpO1xuXG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC14cG9zLCAwKTtcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShXaWR0aCAtIE1pbldpZHRoKSwgMCk7XG4gICAgfVxuXG4gICAgLyogRHJhdyB0aGUgYWNjaWRlbnRhbCBzeW1ib2xzLiAgSWYgdHdvIHN5bWJvbHMgb3ZlcmxhcCAoaWYgdGhleVxuICAgICAqIGFyZSBsZXNzIHRoYW4gNiBub3RlcyBhcGFydCksIHdlIGNhbm5vdCBkcmF3IHRoZSBzeW1ib2wgZGlyZWN0bHlcbiAgICAgKiBhYm92ZSB0aGUgcHJldmlvdXMgb25lLiAgSW5zdGVhZCwgd2UgbXVzdCBzaGlmdCBpdCB0byB0aGUgcmlnaHQuXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHlsb2NhdGlvbiAoaW4gcGl4ZWxzKSB3aGVyZSB0aGUgdG9wIG9mIHRoZSBzdGFmZiBzdGFydHMuXG4gICAgICogQHJldHVybiBUaGUgeCBwaXhlbCB3aWR0aCB1c2VkIGJ5IGFsbCB0aGUgYWNjaWRlbnRhbHMuXG4gICAgICovXG4gICAgcHVibGljIGludCBEcmF3QWNjaWQoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3ApIHtcbiAgICAgICAgaW50IHhwb3MgPSAwO1xuXG4gICAgICAgIEFjY2lkU3ltYm9sIHByZXYgPSBudWxsO1xuICAgICAgICBmb3JlYWNoIChBY2NpZFN5bWJvbCBzeW1ib2wgaW4gYWNjaWRzeW1ib2xzKSB7XG4gICAgICAgICAgICBpZiAocHJldiAhPSBudWxsICYmIHN5bWJvbC5Ob3RlLkRpc3QocHJldi5Ob3RlKSA8IDYpIHtcbiAgICAgICAgICAgICAgICB4cG9zICs9IHN5bWJvbC5XaWR0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKHhwb3MsIDApO1xuICAgICAgICAgICAgc3ltYm9sLkRyYXcoZywgcGVuLCB5dG9wKTtcbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC14cG9zLCAwKTtcbiAgICAgICAgICAgIHByZXYgPSBzeW1ib2w7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByZXYgIT0gbnVsbCkge1xuICAgICAgICAgICAgeHBvcyArPSBwcmV2LldpZHRoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB4cG9zO1xuICAgIH1cblxuICAgIC8qKiBEcmF3IHRoZSBibGFjayBjaXJjbGUgbm90ZXMuXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHlsb2NhdGlvbiAoaW4gcGl4ZWxzKSB3aGVyZSB0aGUgdG9wIG9mIHRoZSBzdGFmZiBzdGFydHMuXG4gICAgICogQHBhcmFtIHRvcHN0YWZmIFRoZSB3aGl0ZSBub3RlIG9mIHRoZSB0b3Agb2YgdGhlIHN0YWZmLlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIERyYXdOb3RlcyhHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCwgV2hpdGVOb3RlIHRvcHN0YWZmKSB7XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG4gICAgICAgIGZvcmVhY2ggKE5vdGVEYXRhIG5vdGUgaW4gbm90ZWRhdGEpIHtcbiAgICAgICAgICAgIC8qIEdldCB0aGUgeCx5IHBvc2l0aW9uIHRvIGRyYXcgdGhlIG5vdGUgKi9cbiAgICAgICAgICAgIGludCB5bm90ZSA9IHl0b3AgKyB0b3BzdGFmZi5EaXN0KG5vdGUud2hpdGVub3RlKSAqIFxuICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG5cbiAgICAgICAgICAgIGludCB4bm90ZSA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQ7XG4gICAgICAgICAgICBpZiAoIW5vdGUubGVmdHNpZGUpXG4gICAgICAgICAgICAgICAgeG5vdGUgKz0gU2hlZXRNdXNpYy5Ob3RlV2lkdGg7XG5cbiAgICAgICAgICAgIC8qIERyYXcgcm90YXRlZCBlbGxpcHNlLiAgWW91IG11c3QgZmlyc3QgdHJhbnNsYXRlICgwLDApXG4gICAgICAgICAgICAgKiB0byB0aGUgY2VudGVyIG9mIHRoZSBlbGxpcHNlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSh4bm90ZSArIFNoZWV0TXVzaWMuTm90ZVdpZHRoLzIgKyAxLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlub3RlIC0gU2hlZXRNdXNpYy5MaW5lV2lkdGggKyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yKTtcbiAgICAgICAgICAgIGcuUm90YXRlVHJhbnNmb3JtKC00NSk7XG5cbiAgICAgICAgICAgIGlmIChzaGVldG11c2ljICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBwZW4uQ29sb3IgPSBzaGVldG11c2ljLk5vdGVDb2xvcihub3RlLm51bWJlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBwZW4uQ29sb3IgPSBDb2xvci5CbGFjaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG5vdGUuZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLldob2xlIHx8IFxuICAgICAgICAgICAgICAgIG5vdGUuZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkhhbGYgfHxcbiAgICAgICAgICAgICAgICBub3RlLmR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRIYWxmKSB7XG5cbiAgICAgICAgICAgICAgICBnLkRyYXdFbGxpcHNlKHBlbiwgLVNoZWV0TXVzaWMuTm90ZVdpZHRoLzIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLVNoZWV0TXVzaWMuTm90ZUhlaWdodC8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQtMSk7XG5cbiAgICAgICAgICAgICAgICBnLkRyYXdFbGxpcHNlKHBlbiwgLVNoZWV0TXVzaWMuTm90ZVdpZHRoLzIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLVNoZWV0TXVzaWMuTm90ZUhlaWdodC8yICsgMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZVdpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LTIpO1xuXG4gICAgICAgICAgICAgICAgZy5EcmF3RWxsaXBzZShwZW4sIC1TaGVldE11c2ljLk5vdGVXaWR0aC8yLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC1TaGVldE11c2ljLk5vdGVIZWlnaHQvMiArIDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC0zKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgQnJ1c2ggYnJ1c2ggPSBCcnVzaGVzLkJsYWNrO1xuICAgICAgICAgICAgICAgIGlmIChwZW4uQ29sb3IgIT0gQ29sb3IuQmxhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgYnJ1c2ggPSBuZXcgU29saWRCcnVzaChwZW4uQ29sb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBnLkZpbGxFbGxpcHNlKGJydXNoLCAtU2hlZXRNdXNpYy5Ob3RlV2lkdGgvMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC0xKTtcbiAgICAgICAgICAgICAgICBpZiAocGVuLkNvbG9yICE9IENvbG9yLkJsYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGJydXNoLkRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHBlbi5Db2xvciA9IENvbG9yLkJsYWNrO1xuICAgICAgICAgICAgZy5EcmF3RWxsaXBzZShwZW4sIC1TaGVldE11c2ljLk5vdGVXaWR0aC8yLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLVNoZWV0TXVzaWMuTm90ZUhlaWdodC8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQtMSk7XG5cbiAgICAgICAgICAgIGcuUm90YXRlVHJhbnNmb3JtKDQ1KTtcbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKCAtICh4bm90ZSArIFNoZWV0TXVzaWMuTm90ZVdpZHRoLzIgKyAxKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSAoeW5vdGUgLSBTaGVldE11c2ljLkxpbmVXaWR0aCArIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yKSk7XG5cbiAgICAgICAgICAgIC8qIERyYXcgYSBkb3QgaWYgdGhpcyBpcyBhIGRvdHRlZCBkdXJhdGlvbi4gKi9cbiAgICAgICAgICAgIGlmIChub3RlLmR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRIYWxmIHx8XG4gICAgICAgICAgICAgICAgbm90ZS5kdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkUXVhcnRlciB8fFxuICAgICAgICAgICAgICAgIG5vdGUuZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCkge1xuXG4gICAgICAgICAgICAgICAgZy5GaWxsRWxsaXBzZShCcnVzaGVzLkJsYWNrLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhub3RlICsgU2hlZXRNdXNpYy5Ob3RlV2lkdGggKyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGluZVNwYWNlLzMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzMsIDQsIDQpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIERyYXcgaG9yaXpvbnRhbCBsaW5lcyBpZiBub3RlIGlzIGFib3ZlL2JlbG93IHRoZSBzdGFmZiAqL1xuICAgICAgICAgICAgV2hpdGVOb3RlIHRvcCA9IHRvcHN0YWZmLkFkZCgxKTtcbiAgICAgICAgICAgIGludCBkaXN0ID0gbm90ZS53aGl0ZW5vdGUuRGlzdCh0b3ApO1xuICAgICAgICAgICAgaW50IHkgPSB5dG9wIC0gU2hlZXRNdXNpYy5MaW5lV2lkdGg7XG5cbiAgICAgICAgICAgIGlmIChkaXN0ID49IDIpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGludCBpID0gMjsgaSA8PSBkaXN0OyBpICs9IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgeSAtPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4bm90ZSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQsIHksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeG5vdGUgKyBTaGVldE11c2ljLk5vdGVXaWR0aCArIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCwgeSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBXaGl0ZU5vdGUgYm90dG9tID0gdG9wLkFkZCgtOCk7XG4gICAgICAgICAgICB5ID0geXRvcCArIChTaGVldE11c2ljLkxpbmVTcGFjZSArIFNoZWV0TXVzaWMuTGluZVdpZHRoKSAqIDQgLSAxO1xuICAgICAgICAgICAgZGlzdCA9IGJvdHRvbS5EaXN0KG5vdGUud2hpdGVub3RlKTtcbiAgICAgICAgICAgIGlmIChkaXN0ID49IDIpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGludCBpID0gMjsgaSA8PSBkaXN0OyBpKz0gMikge1xuICAgICAgICAgICAgICAgICAgICB5ICs9IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHhub3RlIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCwgeSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4bm90ZSArIFNoZWV0TXVzaWMuTm90ZVdpZHRoICsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxpbmVTcGFjZS80LCB5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBFbmQgZHJhd2luZyBob3Jpem9udGFsIGxpbmVzICovXG5cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBEcmF3IHRoZSBub3RlIGxldHRlcnMgKEEsIEEjLCBCYiwgZXRjKSBuZXh0IHRvIHRoZSBub3RlIGNpcmNsZXMuXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHlsb2NhdGlvbiAoaW4gcGl4ZWxzKSB3aGVyZSB0aGUgdG9wIG9mIHRoZSBzdGFmZiBzdGFydHMuXG4gICAgICogQHBhcmFtIHRvcHN0YWZmIFRoZSB3aGl0ZSBub3RlIG9mIHRoZSB0b3Agb2YgdGhlIHN0YWZmLlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIERyYXdOb3RlTGV0dGVycyhHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCwgV2hpdGVOb3RlIHRvcHN0YWZmKSB7XG4gICAgICAgIGJvb2wgb3ZlcmxhcCA9IE5vdGVzT3ZlcmxhcChub3RlZGF0YSwgMCwgbm90ZWRhdGEuTGVuZ3RoKTtcbiAgICAgICAgcGVuLldpZHRoID0gMTtcblxuICAgICAgICBmb3JlYWNoIChOb3RlRGF0YSBub3RlIGluIG5vdGVkYXRhKSB7XG4gICAgICAgICAgICBpZiAoIW5vdGUubGVmdHNpZGUpIHtcbiAgICAgICAgICAgICAgICAvKiBUaGVyZSdzIG5vdCBlbm91Z2h0IHBpeGVsIHJvb20gdG8gc2hvdyB0aGUgbGV0dGVyICovXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIEdldCB0aGUgeCx5IHBvc2l0aW9uIHRvIGRyYXcgdGhlIG5vdGUgKi9cbiAgICAgICAgICAgIGludCB5bm90ZSA9IHl0b3AgKyB0b3BzdGFmZi5EaXN0KG5vdGUud2hpdGVub3RlKSAqIFxuICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG5cbiAgICAgICAgICAgIC8qIERyYXcgdGhlIGxldHRlciB0byB0aGUgcmlnaHQgc2lkZSBvZiB0aGUgbm90ZSAqL1xuICAgICAgICAgICAgaW50IHhub3RlID0gU2hlZXRNdXNpYy5Ob3RlV2lkdGggKyBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuXG4gICAgICAgICAgICBpZiAobm90ZS5kdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkSGFsZiB8fFxuICAgICAgICAgICAgICAgIG5vdGUuZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZFF1YXJ0ZXIgfHxcbiAgICAgICAgICAgICAgICBub3RlLmR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGggfHwgb3ZlcmxhcCkge1xuXG4gICAgICAgICAgICAgICAgeG5vdGUgKz0gU2hlZXRNdXNpYy5Ob3RlV2lkdGgvMjtcbiAgICAgICAgICAgIH0gXG4gICAgICAgICAgICBnLkRyYXdTdHJpbmcoTm90ZU5hbWUobm90ZS5udW1iZXIsIG5vdGUud2hpdGVub3RlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxldHRlckZvbnQsIFxuICAgICAgICAgICAgICAgICAgICAgICAgIEJydXNoZXMuQmxhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgICAgeG5vdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgeW5vdGUgLSBTaGVldE11c2ljLk5vdGVIZWlnaHQvMik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgY2hvcmRzIGNhbiBiZSBjb25uZWN0ZWQsIHdoZXJlIHRoZWlyIHN0ZW1zIGFyZVxuICAgICAqIGpvaW5lZCBieSBhIGhvcml6b250YWwgYmVhbS4gSW4gb3JkZXIgdG8gY3JlYXRlIHRoZSBiZWFtOlxuICAgICAqXG4gICAgICogLSBUaGUgY2hvcmRzIG11c3QgYmUgaW4gdGhlIHNhbWUgbWVhc3VyZS5cbiAgICAgKiAtIFRoZSBjaG9yZCBzdGVtcyBzaG91bGQgbm90IGJlIGEgZG90dGVkIGR1cmF0aW9uLlxuICAgICAqIC0gVGhlIGNob3JkIHN0ZW1zIG11c3QgYmUgdGhlIHNhbWUgZHVyYXRpb24sIHdpdGggb25lIGV4Y2VwdGlvblxuICAgICAqICAgKERvdHRlZCBFaWdodGggdG8gU2l4dGVlbnRoKS5cbiAgICAgKiAtIFRoZSBzdGVtcyBtdXN0IGFsbCBwb2ludCBpbiB0aGUgc2FtZSBkaXJlY3Rpb24gKHVwIG9yIGRvd24pLlxuICAgICAqIC0gVGhlIGNob3JkIGNhbm5vdCBhbHJlYWR5IGJlIHBhcnQgb2YgYSBiZWFtLlxuICAgICAqXG4gICAgICogLSA2LWNob3JkIGJlYW1zIG11c3QgYmUgOHRoIG5vdGVzIGluIDMvNCwgNi84LCBvciA2LzQgdGltZVxuICAgICAqIC0gMy1jaG9yZCBiZWFtcyBtdXN0IGJlIGVpdGhlciB0cmlwbGV0cywgb3IgOHRoIG5vdGVzICgxMi84IHRpbWUgc2lnbmF0dXJlKVxuICAgICAqIC0gNC1jaG9yZCBiZWFtcyBhcmUgb2sgZm9yIDIvMiwgMi80IG9yIDQvNCB0aW1lLCBhbnkgZHVyYXRpb25cbiAgICAgKiAtIDQtY2hvcmQgYmVhbXMgYXJlIG9rIGZvciBvdGhlciB0aW1lcyBpZiB0aGUgZHVyYXRpb24gaXMgMTZ0aFxuICAgICAqIC0gMi1jaG9yZCBiZWFtcyBhcmUgb2sgZm9yIGFueSBkdXJhdGlvblxuICAgICAqXG4gICAgICogSWYgc3RhcnRRdWFydGVyIGlzIHRydWUsIHRoZSBmaXJzdCBub3RlIHNob3VsZCBzdGFydCBvbiBhIHF1YXJ0ZXIgbm90ZVxuICAgICAqIChvbmx5IGFwcGxpZXMgdG8gMi1jaG9yZCBiZWFtcykuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBcbiAgICBib29sIENhbkNyZWF0ZUJlYW0oQ2hvcmRTeW1ib2xbXSBjaG9yZHMsIFRpbWVTaWduYXR1cmUgdGltZSwgYm9vbCBzdGFydFF1YXJ0ZXIpIHtcbiAgICAgICAgaW50IG51bUNob3JkcyA9IGNob3Jkcy5MZW5ndGg7XG4gICAgICAgIFN0ZW0gZmlyc3RTdGVtID0gY2hvcmRzWzBdLlN0ZW07XG4gICAgICAgIFN0ZW0gbGFzdFN0ZW0gPSBjaG9yZHNbY2hvcmRzLkxlbmd0aC0xXS5TdGVtO1xuICAgICAgICBpZiAoZmlyc3RTdGVtID09IG51bGwgfHwgbGFzdFN0ZW0gPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGludCBtZWFzdXJlID0gY2hvcmRzWzBdLlN0YXJ0VGltZSAvIHRpbWUuTWVhc3VyZTtcbiAgICAgICAgTm90ZUR1cmF0aW9uIGR1ciA9IGZpcnN0U3RlbS5EdXJhdGlvbjtcbiAgICAgICAgTm90ZUR1cmF0aW9uIGR1cjIgPSBsYXN0U3RlbS5EdXJhdGlvbjtcblxuICAgICAgICBib29sIGRvdHRlZDhfdG9fMTYgPSBmYWxzZTtcbiAgICAgICAgaWYgKGNob3Jkcy5MZW5ndGggPT0gMiAmJiBkdXIgPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCAmJlxuICAgICAgICAgICAgZHVyMiA9PSBOb3RlRHVyYXRpb24uU2l4dGVlbnRoKSB7XG4gICAgICAgICAgICBkb3R0ZWQ4X3RvXzE2ID0gdHJ1ZTtcbiAgICAgICAgfSBcblxuICAgICAgICBpZiAoZHVyID09IE5vdGVEdXJhdGlvbi5XaG9sZSB8fCBkdXIgPT0gTm90ZUR1cmF0aW9uLkhhbGYgfHxcbiAgICAgICAgICAgIGR1ciA9PSBOb3RlRHVyYXRpb24uRG90dGVkSGFsZiB8fCBkdXIgPT0gTm90ZUR1cmF0aW9uLlF1YXJ0ZXIgfHxcbiAgICAgICAgICAgIGR1ciA9PSBOb3RlRHVyYXRpb24uRG90dGVkUXVhcnRlciB8fFxuICAgICAgICAgICAgKGR1ciA9PSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoICYmICFkb3R0ZWQ4X3RvXzE2KSkge1xuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobnVtQ2hvcmRzID09IDYpIHtcbiAgICAgICAgICAgIGlmIChkdXIgIT0gTm90ZUR1cmF0aW9uLkVpZ2h0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJvb2wgY29ycmVjdFRpbWUgPSBcbiAgICAgICAgICAgICAgICgodGltZS5OdW1lcmF0b3IgPT0gMyAmJiB0aW1lLkRlbm9taW5hdG9yID09IDQpIHx8XG4gICAgICAgICAgICAgICAgKHRpbWUuTnVtZXJhdG9yID09IDYgJiYgdGltZS5EZW5vbWluYXRvciA9PSA4KSB8fFxuICAgICAgICAgICAgICAgICh0aW1lLk51bWVyYXRvciA9PSA2ICYmIHRpbWUuRGVub21pbmF0b3IgPT0gNCkgKTtcblxuICAgICAgICAgICAgaWYgKCFjb3JyZWN0VGltZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRpbWUuTnVtZXJhdG9yID09IDYgJiYgdGltZS5EZW5vbWluYXRvciA9PSA0KSB7XG4gICAgICAgICAgICAgICAgLyogZmlyc3QgY2hvcmQgbXVzdCBzdGFydCBhdCAxc3Qgb3IgNHRoIHF1YXJ0ZXIgbm90ZSAqL1xuICAgICAgICAgICAgICAgIGludCBiZWF0ID0gdGltZS5RdWFydGVyICogMztcbiAgICAgICAgICAgICAgICBpZiAoKGNob3Jkc1swXS5TdGFydFRpbWUgJSBiZWF0KSA+IHRpbWUuUXVhcnRlci82KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG51bUNob3JkcyA9PSA0KSB7XG4gICAgICAgICAgICBpZiAodGltZS5OdW1lcmF0b3IgPT0gMyAmJiB0aW1lLkRlbm9taW5hdG9yID09IDgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBib29sIGNvcnJlY3RUaW1lID0gXG4gICAgICAgICAgICAgICh0aW1lLk51bWVyYXRvciA9PSAyIHx8IHRpbWUuTnVtZXJhdG9yID09IDQgfHwgdGltZS5OdW1lcmF0b3IgPT0gOCk7XG4gICAgICAgICAgICBpZiAoIWNvcnJlY3RUaW1lICYmIGR1ciAhPSBOb3RlRHVyYXRpb24uU2l4dGVlbnRoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBjaG9yZCBtdXN0IHN0YXJ0IG9uIHF1YXJ0ZXIgbm90ZSAqL1xuICAgICAgICAgICAgaW50IGJlYXQgPSB0aW1lLlF1YXJ0ZXI7XG4gICAgICAgICAgICBpZiAoZHVyID09IE5vdGVEdXJhdGlvbi5FaWdodGgpIHtcbiAgICAgICAgICAgICAgICAvKiA4dGggbm90ZSBjaG9yZCBtdXN0IHN0YXJ0IG9uIDFzdCBvciAzcmQgcXVhcnRlciBub3RlICovXG4gICAgICAgICAgICAgICAgYmVhdCA9IHRpbWUuUXVhcnRlciAqIDI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChkdXIgPT0gTm90ZUR1cmF0aW9uLlRoaXJ0eVNlY29uZCkge1xuICAgICAgICAgICAgICAgIC8qIDMybmQgbm90ZSBtdXN0IHN0YXJ0IG9uIGFuIDh0aCBiZWF0ICovXG4gICAgICAgICAgICAgICAgYmVhdCA9IHRpbWUuUXVhcnRlciAvIDI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgoY2hvcmRzWzBdLlN0YXJ0VGltZSAlIGJlYXQpID4gdGltZS5RdWFydGVyLzYpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobnVtQ2hvcmRzID09IDMpIHtcbiAgICAgICAgICAgIGJvb2wgdmFsaWQgPSAoZHVyID09IE5vdGVEdXJhdGlvbi5UcmlwbGV0KSB8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKGR1ciA9PSBOb3RlRHVyYXRpb24uRWlnaHRoICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lLk51bWVyYXRvciA9PSAxMiAmJiB0aW1lLkRlbm9taW5hdG9yID09IDgpO1xuICAgICAgICAgICAgaWYgKCF2YWxpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogY2hvcmQgbXVzdCBzdGFydCBvbiBxdWFydGVyIG5vdGUgKi9cbiAgICAgICAgICAgIGludCBiZWF0ID0gdGltZS5RdWFydGVyO1xuICAgICAgICAgICAgaWYgKHRpbWUuTnVtZXJhdG9yID09IDEyICYmIHRpbWUuRGVub21pbmF0b3IgPT0gOCkge1xuICAgICAgICAgICAgICAgIC8qIEluIDEyLzggdGltZSwgY2hvcmQgbXVzdCBzdGFydCBvbiAzKjh0aCBiZWF0ICovXG4gICAgICAgICAgICAgICAgYmVhdCA9IHRpbWUuUXVhcnRlci8yICogMztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgoY2hvcmRzWzBdLlN0YXJ0VGltZSAlIGJlYXQpID4gdGltZS5RdWFydGVyLzYpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBlbHNlIGlmIChudW1DaG9yZHMgPT0gMikge1xuICAgICAgICAgICAgaWYgKHN0YXJ0UXVhcnRlcikge1xuICAgICAgICAgICAgICAgIGludCBiZWF0ID0gdGltZS5RdWFydGVyO1xuICAgICAgICAgICAgICAgIGlmICgoY2hvcmRzWzBdLlN0YXJ0VGltZSAlIGJlYXQpID4gdGltZS5RdWFydGVyLzYpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvcmVhY2ggKENob3JkU3ltYm9sIGNob3JkIGluIGNob3Jkcykge1xuICAgICAgICAgICAgaWYgKChjaG9yZC5TdGFydFRpbWUgLyB0aW1lLk1lYXN1cmUpICE9IG1lYXN1cmUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgaWYgKGNob3JkLlN0ZW0gPT0gbnVsbClcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBpZiAoY2hvcmQuU3RlbS5EdXJhdGlvbiAhPSBkdXIgJiYgIWRvdHRlZDhfdG9fMTYpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgaWYgKGNob3JkLlN0ZW0uaXNCZWFtKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIENoZWNrIHRoYXQgYWxsIHN0ZW1zIGNhbiBwb2ludCBpbiBzYW1lIGRpcmVjdGlvbiAqL1xuICAgICAgICBib29sIGhhc1R3b1N0ZW1zID0gZmFsc2U7XG4gICAgICAgIGludCBkaXJlY3Rpb24gPSBTdGVtLlVwOyBcbiAgICAgICAgZm9yZWFjaCAoQ2hvcmRTeW1ib2wgY2hvcmQgaW4gY2hvcmRzKSB7XG4gICAgICAgICAgICBpZiAoY2hvcmQuSGFzVHdvU3RlbXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoaGFzVHdvU3RlbXMgJiYgY2hvcmQuU3RlbS5EaXJlY3Rpb24gIT0gZGlyZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaGFzVHdvU3RlbXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IGNob3JkLlN0ZW0uRGlyZWN0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyogR2V0IHRoZSBmaW5hbCBzdGVtIGRpcmVjdGlvbiAqL1xuICAgICAgICBpZiAoIWhhc1R3b1N0ZW1zKSB7XG4gICAgICAgICAgICBXaGl0ZU5vdGUgbm90ZTE7XG4gICAgICAgICAgICBXaGl0ZU5vdGUgbm90ZTI7XG4gICAgICAgICAgICBub3RlMSA9IChmaXJzdFN0ZW0uRGlyZWN0aW9uID09IFN0ZW0uVXAgPyBmaXJzdFN0ZW0uVG9wIDogZmlyc3RTdGVtLkJvdHRvbSk7XG4gICAgICAgICAgICBub3RlMiA9IChsYXN0U3RlbS5EaXJlY3Rpb24gPT0gU3RlbS5VcCA/IGxhc3RTdGVtLlRvcCA6IGxhc3RTdGVtLkJvdHRvbSk7XG4gICAgICAgICAgICBkaXJlY3Rpb24gPSBTdGVtRGlyZWN0aW9uKG5vdGUxLCBub3RlMiwgY2hvcmRzWzBdLkNsZWYpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogSWYgdGhlIG5vdGVzIGFyZSB0b28gZmFyIGFwYXJ0LCBkb24ndCB1c2UgYSBiZWFtICovXG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT0gU3RlbS5VcCkge1xuICAgICAgICAgICAgaWYgKE1hdGguQWJzKGZpcnN0U3RlbS5Ub3AuRGlzdChsYXN0U3RlbS5Ub3ApKSA+PSAxMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChNYXRoLkFicyhmaXJzdFN0ZW0uQm90dG9tLkRpc3QobGFzdFN0ZW0uQm90dG9tKSkgPj0gMTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG5cbiAgICAvKiogQ29ubmVjdCB0aGUgY2hvcmRzIHVzaW5nIGEgaG9yaXpvbnRhbCBiZWFtLiBcbiAgICAgKlxuICAgICAqIHNwYWNpbmcgaXMgdGhlIGhvcml6b250YWwgZGlzdGFuY2UgKGluIHBpeGVscykgYmV0d2VlbiB0aGUgcmlnaHQgc2lkZSBcbiAgICAgKiBvZiB0aGUgZmlyc3QgY2hvcmQsIGFuZCB0aGUgcmlnaHQgc2lkZSBvZiB0aGUgbGFzdCBjaG9yZC5cbiAgICAgKlxuICAgICAqIFRvIG1ha2UgdGhlIGJlYW06XG4gICAgICogLSBDaGFuZ2UgdGhlIHN0ZW0gZGlyZWN0aW9ucyBmb3IgZWFjaCBjaG9yZCwgc28gdGhleSBtYXRjaC5cbiAgICAgKiAtIEluIHRoZSBmaXJzdCBjaG9yZCwgcGFzcyB0aGUgc3RlbSBsb2NhdGlvbiBvZiB0aGUgbGFzdCBjaG9yZCwgYW5kXG4gICAgICogICB0aGUgaG9yaXpvbnRhbCBzcGFjaW5nIHRvIHRoYXQgbGFzdCBzdGVtLlxuICAgICAqIC0gTWFyayBhbGwgY2hvcmRzIChleGNlcHQgdGhlIGZpcnN0KSBhcyBcInJlY2VpdmVyXCIgcGFpcnMsIHNvIHRoYXQgXG4gICAgICogICB0aGV5IGRvbid0IGRyYXcgYSBjdXJ2eSBzdGVtLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgXG4gICAgdm9pZCBDcmVhdGVCZWFtKENob3JkU3ltYm9sW10gY2hvcmRzLCBpbnQgc3BhY2luZykge1xuICAgICAgICBTdGVtIGZpcnN0U3RlbSA9IGNob3Jkc1swXS5TdGVtO1xuICAgICAgICBTdGVtIGxhc3RTdGVtID0gY2hvcmRzW2Nob3Jkcy5MZW5ndGgtMV0uU3RlbTtcblxuICAgICAgICAvKiBDYWxjdWxhdGUgdGhlIG5ldyBzdGVtIGRpcmVjdGlvbiAqL1xuICAgICAgICBpbnQgbmV3ZGlyZWN0aW9uID0gLTE7XG4gICAgICAgIGZvcmVhY2ggKENob3JkU3ltYm9sIGNob3JkIGluIGNob3Jkcykge1xuICAgICAgICAgICAgaWYgKGNob3JkLkhhc1R3b1N0ZW1zKSB7XG4gICAgICAgICAgICAgICAgbmV3ZGlyZWN0aW9uID0gY2hvcmQuU3RlbS5EaXJlY3Rpb247XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmV3ZGlyZWN0aW9uID09IC0xKSB7XG4gICAgICAgICAgICBXaGl0ZU5vdGUgbm90ZTE7XG4gICAgICAgICAgICBXaGl0ZU5vdGUgbm90ZTI7XG4gICAgICAgICAgICBub3RlMSA9IChmaXJzdFN0ZW0uRGlyZWN0aW9uID09IFN0ZW0uVXAgPyBmaXJzdFN0ZW0uVG9wIDogZmlyc3RTdGVtLkJvdHRvbSk7XG4gICAgICAgICAgICBub3RlMiA9IChsYXN0U3RlbS5EaXJlY3Rpb24gPT0gU3RlbS5VcCA/IGxhc3RTdGVtLlRvcCA6IGxhc3RTdGVtLkJvdHRvbSk7XG4gICAgICAgICAgICBuZXdkaXJlY3Rpb24gPSBTdGVtRGlyZWN0aW9uKG5vdGUxLCBub3RlMiwgY2hvcmRzWzBdLkNsZWYpO1xuICAgICAgICB9XG4gICAgICAgIGZvcmVhY2ggKENob3JkU3ltYm9sIGNob3JkIGluIGNob3Jkcykge1xuICAgICAgICAgICAgY2hvcmQuU3RlbS5EaXJlY3Rpb24gPSBuZXdkaXJlY3Rpb247XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2hvcmRzLkxlbmd0aCA9PSAyKSB7XG4gICAgICAgICAgICBCcmluZ1N0ZW1zQ2xvc2VyKGNob3Jkcyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBMaW5lVXBTdGVtRW5kcyhjaG9yZHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgZmlyc3RTdGVtLlNldFBhaXIobGFzdFN0ZW0sIHNwYWNpbmcpO1xuICAgICAgICBmb3IgKGludCBpID0gMTsgaSA8IGNob3Jkcy5MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY2hvcmRzW2ldLlN0ZW0uUmVjZWl2ZXIgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFdlJ3JlIGNvbm5lY3RpbmcgdGhlIHN0ZW1zIG9mIHR3byBjaG9yZHMgdXNpbmcgYSBob3Jpem9udGFsIGJlYW0uXG4gICAgICogIEFkanVzdCB0aGUgdmVydGljYWwgZW5kcG9pbnQgb2YgdGhlIHN0ZW1zLCBzbyB0aGF0IHRoZXkncmUgY2xvc2VyXG4gICAgICogIHRvZ2V0aGVyLiAgRm9yIGEgZG90dGVkIDh0aCB0byAxNnRoIGJlYW0sIGluY3JlYXNlIHRoZSBzdGVtIG9mIHRoZVxuICAgICAqICBkb3R0ZWQgZWlnaHRoLCBzbyB0aGF0IGl0J3MgYXMgbG9uZyBhcyBhIDE2dGggc3RlbS5cbiAgICAgKi9cbiAgICBzdGF0aWMgdm9pZFxuICAgIEJyaW5nU3RlbXNDbG9zZXIoQ2hvcmRTeW1ib2xbXSBjaG9yZHMpIHtcbiAgICAgICAgU3RlbSBmaXJzdFN0ZW0gPSBjaG9yZHNbMF0uU3RlbTtcbiAgICAgICAgU3RlbSBsYXN0U3RlbSA9IGNob3Jkc1sxXS5TdGVtO1xuXG4gICAgICAgIC8qIElmIHdlJ3JlIGNvbm5lY3RpbmcgYSBkb3R0ZWQgOHRoIHRvIGEgMTZ0aCwgaW5jcmVhc2VcbiAgICAgICAgICogdGhlIHN0ZW0gZW5kIG9mIHRoZSBkb3R0ZWQgZWlnaHRoLlxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKGZpcnN0U3RlbS5EdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoICYmXG4gICAgICAgICAgICBsYXN0U3RlbS5EdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uU2l4dGVlbnRoKSB7XG4gICAgICAgICAgICBpZiAoZmlyc3RTdGVtLkRpcmVjdGlvbiA9PSBTdGVtLlVwKSB7XG4gICAgICAgICAgICAgICAgZmlyc3RTdGVtLkVuZCA9IGZpcnN0U3RlbS5FbmQuQWRkKDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZmlyc3RTdGVtLkVuZCA9IGZpcnN0U3RlbS5FbmQuQWRkKC0yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIEJyaW5nIHRoZSBzdGVtIGVuZHMgY2xvc2VyIHRvZ2V0aGVyICovXG4gICAgICAgIGludCBkaXN0YW5jZSA9IE1hdGguQWJzKGZpcnN0U3RlbS5FbmQuRGlzdChsYXN0U3RlbS5FbmQpKTtcbiAgICAgICAgaWYgKGZpcnN0U3RlbS5EaXJlY3Rpb24gPT0gU3RlbS5VcCkge1xuICAgICAgICAgICAgaWYgKFdoaXRlTm90ZS5NYXgoZmlyc3RTdGVtLkVuZCwgbGFzdFN0ZW0uRW5kKSA9PSBmaXJzdFN0ZW0uRW5kKVxuICAgICAgICAgICAgICAgIGxhc3RTdGVtLkVuZCA9IGxhc3RTdGVtLkVuZC5BZGQoZGlzdGFuY2UvMik7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZmlyc3RTdGVtLkVuZCA9IGZpcnN0U3RlbS5FbmQuQWRkKGRpc3RhbmNlLzIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKFdoaXRlTm90ZS5NaW4oZmlyc3RTdGVtLkVuZCwgbGFzdFN0ZW0uRW5kKSA9PSBmaXJzdFN0ZW0uRW5kKVxuICAgICAgICAgICAgICAgIGxhc3RTdGVtLkVuZCA9IGxhc3RTdGVtLkVuZC5BZGQoLWRpc3RhbmNlLzIpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSBmaXJzdFN0ZW0uRW5kLkFkZCgtZGlzdGFuY2UvMik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogV2UncmUgY29ubmVjdGluZyB0aGUgc3RlbXMgb2YgdGhyZWUgb3IgbW9yZSBjaG9yZHMgdXNpbmcgYSBob3Jpem9udGFsIGJlYW0uXG4gICAgICogIEFkanVzdCB0aGUgdmVydGljYWwgZW5kcG9pbnQgb2YgdGhlIHN0ZW1zLCBzbyB0aGF0IHRoZSBtaWRkbGUgY2hvcmQgc3RlbXNcbiAgICAgKiAgYXJlIHZlcnRpY2FsbHkgaW4gYmV0d2VlbiB0aGUgZmlyc3QgYW5kIGxhc3Qgc3RlbS5cbiAgICAgKi9cbiAgICBzdGF0aWMgdm9pZFxuICAgIExpbmVVcFN0ZW1FbmRzKENob3JkU3ltYm9sW10gY2hvcmRzKSB7XG4gICAgICAgIFN0ZW0gZmlyc3RTdGVtID0gY2hvcmRzWzBdLlN0ZW07XG4gICAgICAgIFN0ZW0gbGFzdFN0ZW0gPSBjaG9yZHNbY2hvcmRzLkxlbmd0aC0xXS5TdGVtO1xuICAgICAgICBTdGVtIG1pZGRsZVN0ZW0gPSBjaG9yZHNbMV0uU3RlbTtcblxuICAgICAgICBpZiAoZmlyc3RTdGVtLkRpcmVjdGlvbiA9PSBTdGVtLlVwKSB7XG4gICAgICAgICAgICAvKiBGaW5kIHRoZSBoaWdoZXN0IHN0ZW0uIFRoZSBiZWFtIHdpbGwgZWl0aGVyOlxuICAgICAgICAgICAgICogLSBTbGFudCBkb3dud2FyZHMgKGZpcnN0IHN0ZW0gaXMgaGlnaGVzdClcbiAgICAgICAgICAgICAqIC0gU2xhbnQgdXB3YXJkcyAobGFzdCBzdGVtIGlzIGhpZ2hlc3QpXG4gICAgICAgICAgICAgKiAtIEJlIHN0cmFpZ2h0IChtaWRkbGUgc3RlbSBpcyBoaWdoZXN0KVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBXaGl0ZU5vdGUgdG9wID0gZmlyc3RTdGVtLkVuZDtcbiAgICAgICAgICAgIGZvcmVhY2ggKENob3JkU3ltYm9sIGNob3JkIGluIGNob3Jkcykge1xuICAgICAgICAgICAgICAgIHRvcCA9IFdoaXRlTm90ZS5NYXgodG9wLCBjaG9yZC5TdGVtLkVuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodG9wID09IGZpcnN0U3RlbS5FbmQgJiYgdG9wLkRpc3QobGFzdFN0ZW0uRW5kKSA+PSAyKSB7XG4gICAgICAgICAgICAgICAgZmlyc3RTdGVtLkVuZCA9IHRvcDtcbiAgICAgICAgICAgICAgICBtaWRkbGVTdGVtLkVuZCA9IHRvcC5BZGQoLTEpO1xuICAgICAgICAgICAgICAgIGxhc3RTdGVtLkVuZCA9IHRvcC5BZGQoLTIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodG9wID09IGxhc3RTdGVtLkVuZCAmJiB0b3AuRGlzdChmaXJzdFN0ZW0uRW5kKSA+PSAyKSB7XG4gICAgICAgICAgICAgICAgZmlyc3RTdGVtLkVuZCA9IHRvcC5BZGQoLTIpO1xuICAgICAgICAgICAgICAgIG1pZGRsZVN0ZW0uRW5kID0gdG9wLkFkZCgtMSk7XG4gICAgICAgICAgICAgICAgbGFzdFN0ZW0uRW5kID0gdG9wO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZmlyc3RTdGVtLkVuZCA9IHRvcDtcbiAgICAgICAgICAgICAgICBtaWRkbGVTdGVtLkVuZCA9IHRvcDtcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSB0b3A7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvKiBGaW5kIHRoZSBib3R0b21tb3N0IHN0ZW0uIFRoZSBiZWFtIHdpbGwgZWl0aGVyOlxuICAgICAgICAgICAgICogLSBTbGFudCB1cHdhcmRzIChmaXJzdCBzdGVtIGlzIGxvd2VzdClcbiAgICAgICAgICAgICAqIC0gU2xhbnQgZG93bndhcmRzIChsYXN0IHN0ZW0gaXMgbG93ZXN0KVxuICAgICAgICAgICAgICogLSBCZSBzdHJhaWdodCAobWlkZGxlIHN0ZW0gaXMgaGlnaGVzdClcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgV2hpdGVOb3RlIGJvdHRvbSA9IGZpcnN0U3RlbS5FbmQ7XG4gICAgICAgICAgICBmb3JlYWNoIChDaG9yZFN5bWJvbCBjaG9yZCBpbiBjaG9yZHMpIHtcbiAgICAgICAgICAgICAgICBib3R0b20gPSBXaGl0ZU5vdGUuTWluKGJvdHRvbSwgY2hvcmQuU3RlbS5FbmQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYm90dG9tID09IGZpcnN0U3RlbS5FbmQgJiYgbGFzdFN0ZW0uRW5kLkRpc3QoYm90dG9tKSA+PSAyKSB7XG4gICAgICAgICAgICAgICAgbWlkZGxlU3RlbS5FbmQgPSBib3R0b20uQWRkKDEpO1xuICAgICAgICAgICAgICAgIGxhc3RTdGVtLkVuZCA9IGJvdHRvbS5BZGQoMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChib3R0b20gPT0gbGFzdFN0ZW0uRW5kICYmIGZpcnN0U3RlbS5FbmQuRGlzdChib3R0b20pID49IDIpIHtcbiAgICAgICAgICAgICAgICBtaWRkbGVTdGVtLkVuZCA9IGJvdHRvbS5BZGQoMSk7XG4gICAgICAgICAgICAgICAgZmlyc3RTdGVtLkVuZCA9IGJvdHRvbS5BZGQoMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBmaXJzdFN0ZW0uRW5kID0gYm90dG9tO1xuICAgICAgICAgICAgICAgIG1pZGRsZVN0ZW0uRW5kID0gYm90dG9tO1xuICAgICAgICAgICAgICAgIGxhc3RTdGVtLkVuZCA9IGJvdHRvbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIEFsbCBtaWRkbGUgc3RlbXMgaGF2ZSB0aGUgc2FtZSBlbmQgKi9cbiAgICAgICAgZm9yIChpbnQgaSA9IDE7IGkgPCBjaG9yZHMuTGVuZ3RoLTE7IGkrKykge1xuICAgICAgICAgICAgU3RlbSBzdGVtID0gY2hvcmRzW2ldLlN0ZW07XG4gICAgICAgICAgICBzdGVtLkVuZCA9IG1pZGRsZVN0ZW0uRW5kO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgc3RyaW5nIHJlc3VsdCA9IHN0cmluZy5Gb3JtYXQoXCJDaG9yZFN5bWJvbCBjbGVmPXswfSBzdGFydD17MX0gZW5kPXsyfSB3aWR0aD17M30gaGFzdHdvc3RlbXM9ezR9IFwiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlZiwgU3RhcnRUaW1lLCBFbmRUaW1lLCBXaWR0aCwgaGFzdHdvc3RlbXMpO1xuICAgICAgICBmb3JlYWNoIChBY2NpZFN5bWJvbCBzeW1ib2wgaW4gYWNjaWRzeW1ib2xzKSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gc3ltYm9sLlRvU3RyaW5nKCkgKyBcIiBcIjtcbiAgICAgICAgfVxuICAgICAgICBmb3JlYWNoIChOb3RlRGF0YSBub3RlIGluIG5vdGVkYXRhKSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gc3RyaW5nLkZvcm1hdChcIk5vdGUgd2hpdGVub3RlPXswfSBkdXJhdGlvbj17MX0gbGVmdHNpZGU9ezJ9IFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90ZS53aGl0ZW5vdGUsIG5vdGUuZHVyYXRpb24sIG5vdGUubGVmdHNpZGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGVtMSAhPSBudWxsKSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gc3RlbTEuVG9TdHJpbmcoKSArIFwiIFwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGVtMiAhPSBudWxsKSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gc3RlbTIuVG9TdHJpbmcoKSArIFwiIFwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7IFxuICAgIH1cblxufVxuXG5cbn1cblxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbi8qKiBUaGUgcG9zc2libGUgY2xlZnMsIFRyZWJsZSBvciBCYXNzICovXG5wdWJsaWMgZW51bSBDbGVmIHsgVHJlYmxlLCBCYXNzIH07XG5cbi8qKiBAY2xhc3MgQ2xlZlN5bWJvbCBcbiAqIEEgQ2xlZlN5bWJvbCByZXByZXNlbnRzIGVpdGhlciBhIFRyZWJsZSBvciBCYXNzIENsZWYgaW1hZ2UuXG4gKiBUaGUgY2xlZiBjYW4gYmUgZWl0aGVyIG5vcm1hbCBvciBzbWFsbCBzaXplLiAgTm9ybWFsIHNpemUgaXNcbiAqIHVzZWQgYXQgdGhlIGJlZ2lubmluZyBvZiBhIG5ldyBzdGFmZiwgb24gdGhlIGxlZnQgc2lkZS4gIFRoZVxuICogc21hbGwgc3ltYm9scyBhcmUgdXNlZCB0byBzaG93IGNsZWYgY2hhbmdlcyB3aXRoaW4gYSBzdGFmZi5cbiAqL1xuXG5wdWJsaWMgY2xhc3MgQ2xlZlN5bWJvbCA6IE11c2ljU3ltYm9sIHtcbiAgICBwcml2YXRlIHN0YXRpYyBJbWFnZSB0cmVibGU7ICAvKiogVGhlIHRyZWJsZSBjbGVmIGltYWdlICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgSW1hZ2UgYmFzczsgICAgLyoqIFRoZSBiYXNzIGNsZWYgaW1hZ2UgKi9cblxuICAgIHByaXZhdGUgaW50IHN0YXJ0dGltZTsgICAgICAgIC8qKiBTdGFydCB0aW1lIG9mIHRoZSBzeW1ib2wgKi9cbiAgICBwcml2YXRlIGJvb2wgc21hbGxzaXplOyAgICAgICAvKiogVHJ1ZSBpZiB0aGlzIGlzIGEgc21hbGwgY2xlZiwgZmFsc2Ugb3RoZXJ3aXNlICovXG4gICAgcHJpdmF0ZSBDbGVmIGNsZWY7ICAgICAgICAgICAgLyoqIFRoZSBjbGVmLCBUcmVibGUgb3IgQmFzcyAqL1xuICAgIHByaXZhdGUgaW50IHdpZHRoO1xuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBDbGVmU3ltYm9sLCB3aXRoIHRoZSBnaXZlbiBjbGVmLCBzdGFydHRpbWUsIGFuZCBzaXplICovXG4gICAgcHVibGljIENsZWZTeW1ib2woQ2xlZiBjbGVmLCBpbnQgc3RhcnR0aW1lLCBib29sIHNtYWxsKSB7XG4gICAgICAgIHRoaXMuY2xlZiA9IGNsZWY7XG4gICAgICAgIHRoaXMuc3RhcnR0aW1lID0gc3RhcnR0aW1lO1xuICAgICAgICBzbWFsbHNpemUgPSBzbWFsbDtcbiAgICAgICAgTG9hZEltYWdlcygpO1xuICAgICAgICB3aWR0aCA9IE1pbldpZHRoO1xuICAgIH1cblxuICAgIC8qKiBMb2FkIHRoZSBUcmVibGUvQmFzcyBjbGVmIGltYWdlcyBpbnRvIG1lbW9yeS4gKi9cbiAgICBwcml2YXRlIHN0YXRpYyB2b2lkIExvYWRJbWFnZXMoKSB7XG4gICAgICAgIGlmICh0cmVibGUgPT0gbnVsbClcbiAgICAgICAgICAgIHRyZWJsZSA9IG5ldyBCaXRtYXAodHlwZW9mKENsZWZTeW1ib2wpLCBcIlJlc291cmNlcy5JbWFnZXMudHJlYmxlLnBuZ1wiKTtcblxuICAgICAgICBpZiAoYmFzcyA9PSBudWxsKVxuICAgICAgICAgICAgYmFzcyA9IG5ldyBCaXRtYXAodHlwZW9mKENsZWZTeW1ib2wpLCBcIlJlc291cmNlcy5JbWFnZXMuYmFzcy5wbmdcIik7XG5cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSB0aW1lIChpbiBwdWxzZXMpIHRoaXMgc3ltYm9sIG9jY3VycyBhdC5cbiAgICAgKiBUaGlzIGlzIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBtZWFzdXJlIHRoaXMgc3ltYm9sIGJlbG9uZ3MgdG8uXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBTdGFydFRpbWUgeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHN0YXJ0dGltZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG1pbmltdW0gd2lkdGggKGluIHBpeGVscykgbmVlZGVkIHRvIGRyYXcgdGhpcyBzeW1ib2wgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IE1pbldpZHRoIHtcbiAgICAgICAgZ2V0IHsgXG4gICAgICAgICAgICBpZiAoc21hbGxzaXplKVxuICAgICAgICAgICAgICAgIHJldHVybiBTaGVldE11c2ljLk5vdGVXaWR0aCAqIDI7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIFNoZWV0TXVzaWMuTm90ZVdpZHRoICogMztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBHZXQvU2V0IHRoZSB3aWR0aCAoaW4gcGl4ZWxzKSBvZiB0aGlzIHN5bWJvbC4gVGhlIHdpZHRoIGlzIHNldFxuICAgICAqIGluIFNoZWV0TXVzaWMuQWxpZ25TeW1ib2xzKCkgdG8gdmVydGljYWxseSBhbGlnbiBzeW1ib2xzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgV2lkdGgge1xuICAgICAgIGdldCB7IHJldHVybiB3aWR0aDsgfVxuICAgICAgIHNldCB7IHdpZHRoID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYWJvdmUgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQWJvdmVTdGFmZiB7IFxuICAgICAgICBnZXQgeyBcbiAgICAgICAgICAgIGlmIChjbGVmID09IENsZWYuVHJlYmxlICYmICFzbWFsbHNpemUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFNoZWV0TXVzaWMuTm90ZUhlaWdodCAqIDI7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYmVsb3cgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQmVsb3dTdGFmZiB7XG4gICAgICAgIGdldCB7XG4gICAgICAgICAgICBpZiAoY2xlZiA9PSBDbGVmLlRyZWJsZSAmJiAhc21hbGxzaXplKVxuICAgICAgICAgICAgICAgIHJldHVybiBTaGVldE11c2ljLk5vdGVIZWlnaHQgKiAyO1xuICAgICAgICAgICAgZWxzZSBpZiAoY2xlZiA9PSBDbGVmLlRyZWJsZSAmJiBzbWFsbHNpemUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBEcmF3IHRoZSBzeW1ib2wuXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHlsb2NhdGlvbiAoaW4gcGl4ZWxzKSB3aGVyZSB0aGUgdG9wIG9mIHRoZSBzdGFmZiBzdGFydHMuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIFxuICAgIHZvaWQgRHJhdyhHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybShXaWR0aCAtIE1pbldpZHRoLCAwKTtcbiAgICAgICAgaW50IHkgPSB5dG9wO1xuICAgICAgICBJbWFnZSBpbWFnZTtcbiAgICAgICAgaW50IGhlaWdodDtcblxuICAgICAgICAvKiBHZXQgdGhlIGltYWdlLCBoZWlnaHQsIGFuZCB0b3AgeSBwaXhlbCwgZGVwZW5kaW5nIG9uIHRoZSBjbGVmXG4gICAgICAgICAqIGFuZCB0aGUgaW1hZ2Ugc2l6ZS5cbiAgICAgICAgICovXG4gICAgICAgIGlmIChjbGVmID09IENsZWYuVHJlYmxlKSB7XG4gICAgICAgICAgICBpbWFnZSA9IHRyZWJsZTtcbiAgICAgICAgICAgIGlmIChzbWFsbHNpemUpIHtcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBTaGVldE11c2ljLlN0YWZmSGVpZ2h0ICsgU2hlZXRNdXNpYy5TdGFmZkhlaWdodC80O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSAzICogU2hlZXRNdXNpYy5TdGFmZkhlaWdodC8yICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG4gICAgICAgICAgICAgICAgeSA9IHl0b3AgLSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpbWFnZSA9IGJhc3M7XG4gICAgICAgICAgICBpZiAoc21hbGxzaXplKSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gU2hlZXRNdXNpYy5TdGFmZkhlaWdodCAtIDMqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGhlaWdodCA9IFNoZWV0TXVzaWMuU3RhZmZIZWlnaHQgLSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBTY2FsZSB0aGUgaW1hZ2Ugd2lkdGggdG8gbWF0Y2ggdGhlIGhlaWdodCAqL1xuICAgICAgICBpbnQgaW1nd2lkdGggPSBpbWFnZS5XaWR0aCAqIGhlaWdodCAvIGltYWdlLkhlaWdodDtcbiAgICAgICAgZy5EcmF3SW1hZ2UoaW1hZ2UsIDAsIHksIGltZ3dpZHRoLCBoZWlnaHQpO1xuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKFdpZHRoIC0gTWluV2lkdGgpLCAwKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb3ZlcnJpZGUgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gc3RyaW5nLkZvcm1hdChcIkNsZWZTeW1ib2wgY2xlZj17MH0gc21hbGw9ezF9IHdpZHRoPXsyfVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVmLCBzbWFsbHNpemUsIHdpZHRoKTtcbiAgICB9XG59XG5cblxufVxuXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgRmlsZVN0cmVhbTpTdHJlYW1cclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgRmlsZVN0cmVhbShzdHJpbmcgZmlsZW5hbWUsIEZpbGVNb2RlIG1vZGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA5LTIwMTIgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cblxuLyoqIEBjbGFzcyBQaWFub1xuICpcbiAqIFRoZSBQaWFubyBDb250cm9sIGlzIHRoZSBwYW5lbCBhdCB0aGUgdG9wIHRoYXQgZGlzcGxheXMgdGhlXG4gKiBwaWFubywgYW5kIGhpZ2hsaWdodHMgdGhlIHBpYW5vIG5vdGVzIGR1cmluZyBwbGF5YmFjay5cbiAqIFRoZSBtYWluIG1ldGhvZHMgYXJlOlxuICpcbiAqIFNldE1pZGlGaWxlKCkgLSBTZXQgdGhlIE1pZGkgZmlsZSB0byB1c2UgZm9yIHNoYWRpbmcuICBUaGUgTWlkaSBmaWxlXG4gKiAgICAgICAgICAgICAgICAgaXMgbmVlZGVkIHRvIGRldGVybWluZSB3aGljaCBub3RlcyB0byBzaGFkZS5cbiAqXG4gKiBTaGFkZU5vdGVzKCkgLSBTaGFkZSBub3RlcyBvbiB0aGUgcGlhbm8gdGhhdCBvY2N1ciBhdCBhIGdpdmVuIHB1bHNlIHRpbWUuXG4gKlxuICovXG5wdWJsaWMgY2xhc3MgUGlhbm8gOiBDb250cm9sIHtcbiAgICBwdWJsaWMgY29uc3QgaW50IEtleXNQZXJPY3RhdmUgPSA3O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTWF4T2N0YXZlID0gNztcblxuICAgIHByaXZhdGUgc3RhdGljIGludCBXaGl0ZUtleVdpZHRoOyAgLyoqIFdpZHRoIG9mIGEgc2luZ2xlIHdoaXRlIGtleSAqL1xuICAgIHByaXZhdGUgc3RhdGljIGludCBXaGl0ZUtleUhlaWdodDsgLyoqIEhlaWdodCBvZiBhIHNpbmdsZSB3aGl0ZSBrZXkgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBpbnQgQmxhY2tLZXlXaWR0aDsgIC8qKiBXaWR0aCBvZiBhIHNpbmdsZSBibGFjayBrZXkgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBpbnQgQmxhY2tLZXlIZWlnaHQ7IC8qKiBIZWlnaHQgb2YgYSBzaW5nbGUgYmxhY2sga2V5ICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50IG1hcmdpbjsgICAgICAgICAvKiogVGhlIHRvcC9sZWZ0IG1hcmdpbiB0byB0aGUgcGlhbm8gKi9cbiAgICBwcml2YXRlIHN0YXRpYyBpbnQgQmxhY2tCb3JkZXI7ICAgIC8qKiBUaGUgd2lkdGggb2YgdGhlIGJsYWNrIGJvcmRlciBhcm91bmQgdGhlIGtleXMgKi9cblxuICAgIHByaXZhdGUgc3RhdGljIGludFtdIGJsYWNrS2V5T2Zmc2V0czsgICAvKiogVGhlIHggcGl4bGVzIG9mIHRoZSBibGFjayBrZXlzICovXG5cbiAgICAvKiBUaGUgZ3JheTFQZW5zIGZvciBkcmF3aW5nIGJsYWNrL2dyYXkgbGluZXMgKi9cbiAgICBwcml2YXRlIFBlbiBncmF5MVBlbiwgZ3JheTJQZW4sIGdyYXkzUGVuO1xuXG4gICAgLyogVGhlIGJydXNoZXMgZm9yIGZpbGxpbmcgdGhlIGtleXMgKi9cbiAgICBwcml2YXRlIEJydXNoIGdyYXkxQnJ1c2gsIGdyYXkyQnJ1c2gsIHNoYWRlQnJ1c2gsIHNoYWRlMkJydXNoO1xuXG4gICAgcHJpdmF0ZSBib29sIHVzZVR3b0NvbG9yczsgICAgICAgICAgICAgIC8qKiBJZiB0cnVlLCB1c2UgdHdvIGNvbG9ycyBmb3IgaGlnaGxpZ2h0aW5nICovXG4gICAgcHJpdmF0ZSBMaXN0PE1pZGlOb3RlPiBub3RlczsgICAgICAgICAgIC8qKiBUaGUgTWlkaSBub3RlcyBmb3Igc2hhZGluZyAqL1xuICAgIHByaXZhdGUgaW50IG1heFNoYWRlRHVyYXRpb247ICAgICAgICAgICAvKiogVGhlIG1heGltdW0gZHVyYXRpb24gd2UnbGwgc2hhZGUgYSBub3RlIGZvciAqL1xuICAgIHByaXZhdGUgaW50IHNob3dOb3RlTGV0dGVyczsgICAgICAgICAgICAvKiogRGlzcGxheSB0aGUgbGV0dGVyIGZvciBlYWNoIHBpYW5vIG5vdGUgKi9cbiAgICBwcml2YXRlIEdyYXBoaWNzIGdyYXBoaWNzOyAgICAgICAgICAgICAgLyoqIFRoZSBncmFwaGljcyBmb3Igc2hhZGluZyB0aGUgbm90ZXMgKi9cblxuICAgIC8qKiBDcmVhdGUgYSBuZXcgUGlhbm8uICovXG4gICAgcHVibGljIFBpYW5vKCkge1xyXG4gICAgICAgIGludCBzY3JlZW53aWR0aCA9IDEwMjQ7IC8vU3lzdGVtLldpbmRvd3MuRm9ybXMuU2NyZWVuLlByaW1hcnlTY3JlZW4uQm91bmRzLldpZHRoO1xuICAgICAgICBpZiAoc2NyZWVud2lkdGggPj0gMzIwMCkge1xuICAgICAgICAgICAgLyogTGludXgvTW9ubyBpcyByZXBvcnRpbmcgd2lkdGggb2YgNCBzY3JlZW5zICovXG4gICAgICAgICAgICBzY3JlZW53aWR0aCA9IHNjcmVlbndpZHRoIC8gNDtcbiAgICAgICAgfVxuICAgICAgICBzY3JlZW53aWR0aCA9IHNjcmVlbndpZHRoICogOTUvMTAwO1xuICAgICAgICBXaGl0ZUtleVdpZHRoID0gKGludCkoc2NyZWVud2lkdGggLyAoMi4wICsgS2V5c1Blck9jdGF2ZSAqIE1heE9jdGF2ZSkpO1xuICAgICAgICBpZiAoV2hpdGVLZXlXaWR0aCAlIDIgIT0gMCkge1xuICAgICAgICAgICAgV2hpdGVLZXlXaWR0aC0tO1xuICAgICAgICB9XG4gICAgICAgIG1hcmdpbiA9IDA7XG4gICAgICAgIEJsYWNrQm9yZGVyID0gV2hpdGVLZXlXaWR0aC8yO1xuICAgICAgICBXaGl0ZUtleUhlaWdodCA9IFdoaXRlS2V5V2lkdGggKiA1O1xuICAgICAgICBCbGFja0tleVdpZHRoID0gV2hpdGVLZXlXaWR0aCAvIDI7XG4gICAgICAgIEJsYWNrS2V5SGVpZ2h0ID0gV2hpdGVLZXlIZWlnaHQgKiA1IC8gOTsgXG5cbiAgICAgICAgV2lkdGggPSBtYXJnaW4qMiArIEJsYWNrQm9yZGVyKjIgKyBXaGl0ZUtleVdpZHRoICogS2V5c1Blck9jdGF2ZSAqIE1heE9jdGF2ZTtcbiAgICAgICAgSGVpZ2h0ID0gbWFyZ2luKjIgKyBCbGFja0JvcmRlciozICsgV2hpdGVLZXlIZWlnaHQ7XG4gICAgICAgIGlmIChibGFja0tleU9mZnNldHMgPT0gbnVsbCkge1xuICAgICAgICAgICAgYmxhY2tLZXlPZmZzZXRzID0gbmV3IGludFtdIHsgXG4gICAgICAgICAgICAgICAgV2hpdGVLZXlXaWR0aCAtIEJsYWNrS2V5V2lkdGgvMiAtIDEsXG4gICAgICAgICAgICAgICAgV2hpdGVLZXlXaWR0aCArIEJsYWNrS2V5V2lkdGgvMiAtIDEsXG4gICAgICAgICAgICAgICAgMipXaGl0ZUtleVdpZHRoIC0gQmxhY2tLZXlXaWR0aC8yLFxuICAgICAgICAgICAgICAgIDIqV2hpdGVLZXlXaWR0aCArIEJsYWNrS2V5V2lkdGgvMixcbiAgICAgICAgICAgICAgICA0KldoaXRlS2V5V2lkdGggLSBCbGFja0tleVdpZHRoLzIgLSAxLFxuICAgICAgICAgICAgICAgIDQqV2hpdGVLZXlXaWR0aCArIEJsYWNrS2V5V2lkdGgvMiAtIDEsXG4gICAgICAgICAgICAgICAgNSpXaGl0ZUtleVdpZHRoIC0gQmxhY2tLZXlXaWR0aC8yLFxuICAgICAgICAgICAgICAgIDUqV2hpdGVLZXlXaWR0aCArIEJsYWNrS2V5V2lkdGgvMixcbiAgICAgICAgICAgICAgICA2KldoaXRlS2V5V2lkdGggLSBCbGFja0tleVdpZHRoLzIsXG4gICAgICAgICAgICAgICAgNipXaGl0ZUtleVdpZHRoICsgQmxhY2tLZXlXaWR0aC8yXG4gICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgQ29sb3IgZ3JheTEgPSBDb2xvci5Gcm9tQXJnYigxNiwgMTYsIDE2KTtcbiAgICAgICAgQ29sb3IgZ3JheTIgPSBDb2xvci5Gcm9tQXJnYig5MCwgOTAsIDkwKTtcbiAgICAgICAgQ29sb3IgZ3JheTMgPSBDb2xvci5Gcm9tQXJnYigyMDAsIDIwMCwgMjAwKTtcbiAgICAgICAgQ29sb3Igc2hhZGUxID0gQ29sb3IuRnJvbUFyZ2IoMjEwLCAyMDUsIDIyMCk7XG4gICAgICAgIENvbG9yIHNoYWRlMiA9IENvbG9yLkZyb21BcmdiKDE1MCwgMjAwLCAyMjApO1xuXG4gICAgICAgIGdyYXkxUGVuID0gbmV3IFBlbihncmF5MSwgMSk7XG4gICAgICAgIGdyYXkyUGVuID0gbmV3IFBlbihncmF5MiwgMSk7XG4gICAgICAgIGdyYXkzUGVuID0gbmV3IFBlbihncmF5MywgMSk7XG5cbiAgICAgICAgZ3JheTFCcnVzaCA9IG5ldyBTb2xpZEJydXNoKGdyYXkxKTtcbiAgICAgICAgZ3JheTJCcnVzaCA9IG5ldyBTb2xpZEJydXNoKGdyYXkyKTtcbiAgICAgICAgc2hhZGVCcnVzaCA9IG5ldyBTb2xpZEJydXNoKHNoYWRlMSk7XG4gICAgICAgIHNoYWRlMkJydXNoID0gbmV3IFNvbGlkQnJ1c2goc2hhZGUyKTtcbiAgICAgICAgc2hvd05vdGVMZXR0ZXJzID0gTWlkaU9wdGlvbnMuTm90ZU5hbWVOb25lO1xuICAgICAgICBCYWNrQ29sb3IgPSBDb2xvci5MaWdodEdyYXk7XG4gICAgfVxuXG4gICAgLyoqIFNldCB0aGUgTWlkaUZpbGUgdG8gdXNlLlxuICAgICAqICBTYXZlIHRoZSBsaXN0IG9mIG1pZGkgbm90ZXMuIEVhY2ggbWlkaSBub3RlIGluY2x1ZGVzIHRoZSBub3RlIE51bWJlciBcbiAgICAgKiAgYW5kIFN0YXJ0VGltZSAoaW4gcHVsc2VzKSwgc28gd2Uga25vdyB3aGljaCBub3RlcyB0byBzaGFkZSBnaXZlbiB0aGVcbiAgICAgKiAgY3VycmVudCBwdWxzZSB0aW1lLlxuICAgICAqLyBcbiAgICBwdWJsaWMgdm9pZCBTZXRNaWRpRmlsZShNaWRpRmlsZSBtaWRpZmlsZSwgTWlkaU9wdGlvbnMgb3B0aW9ucykge1xuICAgICAgICBpZiAobWlkaWZpbGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgbm90ZXMgPSBudWxsO1xuICAgICAgICAgICAgdXNlVHdvQ29sb3JzID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBMaXN0PE1pZGlUcmFjaz4gdHJhY2tzID0gbWlkaWZpbGUuQ2hhbmdlTWlkaU5vdGVzKG9wdGlvbnMpO1xuICAgICAgICBNaWRpVHJhY2sgdHJhY2sgPSBNaWRpRmlsZS5Db21iaW5lVG9TaW5nbGVUcmFjayh0cmFja3MpO1xuICAgICAgICBub3RlcyA9IHRyYWNrLk5vdGVzO1xuXG4gICAgICAgIG1heFNoYWRlRHVyYXRpb24gPSBtaWRpZmlsZS5UaW1lLlF1YXJ0ZXIgKiAyO1xuXG4gICAgICAgIC8qIFdlIHdhbnQgdG8ga25vdyB3aGljaCB0cmFjayB0aGUgbm90ZSBjYW1lIGZyb20uXG4gICAgICAgICAqIFVzZSB0aGUgJ2NoYW5uZWwnIGZpZWxkIHRvIHN0b3JlIHRoZSB0cmFjay5cbiAgICAgICAgICovXG4gICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCB0cmFja3MuQ291bnQ7IHRyYWNrbnVtKyspIHtcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG5vdGUgaW4gdHJhY2tzW3RyYWNrbnVtXS5Ob3Rlcykge1xuICAgICAgICAgICAgICAgIG5vdGUuQ2hhbm5lbCA9IHRyYWNrbnVtO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyogV2hlbiB3ZSBoYXZlIGV4YWN0bHkgdHdvIHRyYWNrcywgd2UgYXNzdW1lIHRoaXMgaXMgYSBwaWFubyBzb25nLFxuICAgICAgICAgKiBhbmQgd2UgdXNlIGRpZmZlcmVudCBjb2xvcnMgZm9yIGhpZ2hsaWdodGluZyB0aGUgbGVmdCBoYW5kIGFuZFxuICAgICAgICAgKiByaWdodCBoYW5kIG5vdGVzLlxuICAgICAgICAgKi9cbiAgICAgICAgdXNlVHdvQ29sb3JzID0gZmFsc2U7XG4gICAgICAgIGlmICh0cmFja3MuQ291bnQgPT0gMikge1xuICAgICAgICAgICAgdXNlVHdvQ29sb3JzID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNob3dOb3RlTGV0dGVycyA9IG9wdGlvbnMuc2hvd05vdGVMZXR0ZXJzO1xuICAgICAgICB0aGlzLkludmFsaWRhdGUoKTtcbiAgICB9XG5cbiAgICAvKiogU2V0IHRoZSBjb2xvcnMgdG8gdXNlIGZvciBzaGFkaW5nICovXG4gICAgcHVibGljIHZvaWQgU2V0U2hhZGVDb2xvcnMoQ29sb3IgYzEsIENvbG9yIGMyKSB7XG4gICAgICAgIHNoYWRlQnJ1c2guRGlzcG9zZSgpO1xuICAgICAgICBzaGFkZTJCcnVzaC5EaXNwb3NlKCk7XG4gICAgICAgIHNoYWRlQnJ1c2ggPSBuZXcgU29saWRCcnVzaChjMSk7XG4gICAgICAgIHNoYWRlMkJydXNoID0gbmV3IFNvbGlkQnJ1c2goYzIpO1xuICAgIH1cblxuICAgIC8qKiBEcmF3IHRoZSBvdXRsaW5lIG9mIGEgMTItbm90ZSAoNyB3aGl0ZSBub3RlKSBwaWFubyBvY3RhdmUgKi9cbiAgICBwcml2YXRlIHZvaWQgRHJhd09jdGF2ZU91dGxpbmUoR3JhcGhpY3MgZykge1xuICAgICAgICBpbnQgcmlnaHQgPSBXaGl0ZUtleVdpZHRoICogS2V5c1Blck9jdGF2ZTtcblxuICAgICAgICAvLyBEcmF3IHRoZSBib3VuZGluZyByZWN0YW5nbGUsIGZyb20gQyB0byBCXG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTFQZW4sIDAsIDAsIDAsIFdoaXRlS2V5SGVpZ2h0KTtcbiAgICAgICAgZy5EcmF3TGluZShncmF5MVBlbiwgcmlnaHQsIDAsIHJpZ2h0LCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgIC8vIGcuRHJhd0xpbmUoZ3JheTFQZW4sIDAsIDAsIHJpZ2h0LCAwKTtcbiAgICAgICAgZy5EcmF3TGluZShncmF5MVBlbiwgMCwgV2hpdGVLZXlIZWlnaHQsIHJpZ2h0LCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIHJpZ2h0LTEsIDAsIHJpZ2h0LTEsIFdoaXRlS2V5SGVpZ2h0KTtcbiAgICAgICAgZy5EcmF3TGluZShncmF5M1BlbiwgMSwgMCwgMSwgV2hpdGVLZXlIZWlnaHQpO1xuXG4gICAgICAgIC8vIERyYXcgdGhlIGxpbmUgYmV0d2VlbiBFIGFuZCBGXG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTFQZW4sIDMqV2hpdGVLZXlXaWR0aCwgMCwgMypXaGl0ZUtleVdpZHRoLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIDMqV2hpdGVLZXlXaWR0aCAtIDEsIDAsIDMqV2hpdGVLZXlXaWR0aCAtIDEsIFdoaXRlS2V5SGVpZ2h0KTtcbiAgICAgICAgZy5EcmF3TGluZShncmF5M1BlbiwgMypXaGl0ZUtleVdpZHRoICsgMSwgMCwgMypXaGl0ZUtleVdpZHRoICsgMSwgV2hpdGVLZXlIZWlnaHQpO1xuXG4gICAgICAgIC8vIERyYXcgdGhlIHNpZGVzL2JvdHRvbSBvZiB0aGUgYmxhY2sga2V5c1xuICAgICAgICBmb3IgKGludCBpID0wOyBpIDwgMTA7IGkgKz0gMikge1xuICAgICAgICAgICAgaW50IHgxID0gYmxhY2tLZXlPZmZzZXRzW2ldO1xuICAgICAgICAgICAgaW50IHgyID0gYmxhY2tLZXlPZmZzZXRzW2krMV07XG5cbiAgICAgICAgICAgIGcuRHJhd0xpbmUoZ3JheTFQZW4sIHgxLCAwLCB4MSwgQmxhY2tLZXlIZWlnaHQpOyBcbiAgICAgICAgICAgIGcuRHJhd0xpbmUoZ3JheTFQZW4sIHgyLCAwLCB4MiwgQmxhY2tLZXlIZWlnaHQpOyBcbiAgICAgICAgICAgIGcuRHJhd0xpbmUoZ3JheTFQZW4sIHgxLCBCbGFja0tleUhlaWdodCwgeDIsIEJsYWNrS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgIGcuRHJhd0xpbmUoZ3JheTJQZW4sIHgxLTEsIDAsIHgxLTEsIEJsYWNrS2V5SGVpZ2h0KzEpOyBcbiAgICAgICAgICAgIGcuRHJhd0xpbmUoZ3JheTJQZW4sIHgyKzEsIDAsIHgyKzEsIEJsYWNrS2V5SGVpZ2h0KzEpOyBcbiAgICAgICAgICAgIGcuRHJhd0xpbmUoZ3JheTJQZW4sIHgxLTEsIEJsYWNrS2V5SGVpZ2h0KzEsIHgyKzEsIEJsYWNrS2V5SGVpZ2h0KzEpO1xuICAgICAgICAgICAgZy5EcmF3TGluZShncmF5M1BlbiwgeDEtMiwgMCwgeDEtMiwgQmxhY2tLZXlIZWlnaHQrMik7IFxuICAgICAgICAgICAgZy5EcmF3TGluZShncmF5M1BlbiwgeDIrMiwgMCwgeDIrMiwgQmxhY2tLZXlIZWlnaHQrMik7IFxuICAgICAgICAgICAgZy5EcmF3TGluZShncmF5M1BlbiwgeDEtMiwgQmxhY2tLZXlIZWlnaHQrMiwgeDIrMiwgQmxhY2tLZXlIZWlnaHQrMik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEcmF3IHRoZSBib3R0b20taGFsZiBvZiB0aGUgd2hpdGUga2V5c1xuICAgICAgICBmb3IgKGludCBpID0gMTsgaSA8IEtleXNQZXJPY3RhdmU7IGkrKykge1xuICAgICAgICAgICAgaWYgKGkgPT0gMykge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlOyAgLy8gd2UgZHJhdyB0aGUgbGluZSBiZXR3ZWVuIEUgYW5kIEYgYWJvdmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGcuRHJhd0xpbmUoZ3JheTFQZW4sIGkqV2hpdGVLZXlXaWR0aCwgQmxhY2tLZXlIZWlnaHQsIGkqV2hpdGVLZXlXaWR0aCwgV2hpdGVLZXlIZWlnaHQpO1xuICAgICAgICAgICAgUGVuIHBlbjEgPSBncmF5MlBlbjtcbiAgICAgICAgICAgIFBlbiBwZW4yID0gZ3JheTNQZW47XG4gICAgICAgICAgICBnLkRyYXdMaW5lKHBlbjEsIGkqV2hpdGVLZXlXaWR0aCAtIDEsIEJsYWNrS2V5SGVpZ2h0KzEsIGkqV2hpdGVLZXlXaWR0aCAtIDEsIFdoaXRlS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuMiwgaSpXaGl0ZUtleVdpZHRoICsgMSwgQmxhY2tLZXlIZWlnaHQrMSwgaSpXaGl0ZUtleVdpZHRoICsgMSwgV2hpdGVLZXlIZWlnaHQpO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKiogRHJhdyBhbiBvdXRsaW5lIG9mIHRoZSBwaWFubyBmb3IgNyBvY3RhdmVzICovXG4gICAgcHJpdmF0ZSB2b2lkIERyYXdPdXRsaW5lKEdyYXBoaWNzIGcpIHtcbiAgICAgICAgZm9yIChpbnQgb2N0YXZlID0gMDsgb2N0YXZlIDwgTWF4T2N0YXZlOyBvY3RhdmUrKykge1xuICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0ob2N0YXZlICogV2hpdGVLZXlXaWR0aCAqIEtleXNQZXJPY3RhdmUsIDApO1xuICAgICAgICAgICAgRHJhd09jdGF2ZU91dGxpbmUoZyk7XG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKG9jdGF2ZSAqIFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlKSwgMCk7XG4gICAgICAgIH1cbiAgICB9XG4gXG4gICAgLyogRHJhdyB0aGUgQmxhY2sga2V5cyAqL1xuICAgIHByaXZhdGUgdm9pZCBEcmF3QmxhY2tLZXlzKEdyYXBoaWNzIGcpIHtcbiAgICAgICAgZm9yIChpbnQgb2N0YXZlID0gMDsgb2N0YXZlIDwgTWF4T2N0YXZlOyBvY3RhdmUrKykge1xuICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0ob2N0YXZlICogV2hpdGVLZXlXaWR0aCAqIEtleXNQZXJPY3RhdmUsIDApO1xuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCAxMDsgaSArPSAyKSB7XG4gICAgICAgICAgICAgICAgaW50IHgxID0gYmxhY2tLZXlPZmZzZXRzW2ldO1xuICAgICAgICAgICAgICAgIGludCB4MiA9IGJsYWNrS2V5T2Zmc2V0c1tpKzFdO1xuICAgICAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShncmF5MUJydXNoLCB4MSwgMCwgQmxhY2tLZXlXaWR0aCwgQmxhY2tLZXlIZWlnaHQpO1xuICAgICAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShncmF5MkJydXNoLCB4MSsxLCBCbGFja0tleUhlaWdodCAtIEJsYWNrS2V5SGVpZ2h0LzgsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleVdpZHRoLTIsIEJsYWNrS2V5SGVpZ2h0LzgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShvY3RhdmUgKiBXaGl0ZUtleVdpZHRoICogS2V5c1Blck9jdGF2ZSksIDApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyogRHJhdyB0aGUgYmxhY2sgYm9yZGVyIGFyZWEgc3Vycm91bmRpbmcgdGhlIHBpYW5vIGtleXMuXG4gICAgICogQWxzbywgZHJhdyBncmF5IG91dGxpbmVzIGF0IHRoZSBib3R0b20gb2YgdGhlIHdoaXRlIGtleXMuXG4gICAgICovXG4gICAgcHJpdmF0ZSB2b2lkIERyYXdCbGFja0JvcmRlcihHcmFwaGljcyBnKSB7XG4gICAgICAgIGludCBQaWFub1dpZHRoID0gV2hpdGVLZXlXaWR0aCAqIEtleXNQZXJPY3RhdmUgKiBNYXhPY3RhdmU7XG4gICAgICAgIGcuRmlsbFJlY3RhbmdsZShncmF5MUJydXNoLCBtYXJnaW4sIG1hcmdpbiwgUGlhbm9XaWR0aCArIEJsYWNrQm9yZGVyKjIsIEJsYWNrQm9yZGVyLTIpO1xuICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTFCcnVzaCwgbWFyZ2luLCBtYXJnaW4sIEJsYWNrQm9yZGVyLCBXaGl0ZUtleUhlaWdodCArIEJsYWNrQm9yZGVyICogMyk7XG4gICAgICAgIGcuRmlsbFJlY3RhbmdsZShncmF5MUJydXNoLCBtYXJnaW4sIG1hcmdpbiArIEJsYWNrQm9yZGVyICsgV2hpdGVLZXlIZWlnaHQsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmxhY2tCb3JkZXIqMiArIFBpYW5vV2lkdGgsIEJsYWNrQm9yZGVyKjIpO1xuICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTFCcnVzaCwgbWFyZ2luICsgQmxhY2tCb3JkZXIgKyBQaWFub1dpZHRoLCBtYXJnaW4sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmxhY2tCb3JkZXIsIFdoaXRlS2V5SGVpZ2h0ICsgQmxhY2tCb3JkZXIqMyk7XG5cbiAgICAgICAgZy5EcmF3TGluZShncmF5MlBlbiwgbWFyZ2luICsgQmxhY2tCb3JkZXIsIG1hcmdpbiArIEJsYWNrQm9yZGVyIC0xLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luICsgQmxhY2tCb3JkZXIgKyBQaWFub1dpZHRoLCBtYXJnaW4gKyBCbGFja0JvcmRlciAtMSk7XG4gICAgICAgIFxuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybShtYXJnaW4gKyBCbGFja0JvcmRlciwgbWFyZ2luICsgQmxhY2tCb3JkZXIpOyBcblxuICAgICAgICAvLyBEcmF3IHRoZSBncmF5IGJvdHRvbXMgb2YgdGhlIHdoaXRlIGtleXMgIFxuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IEtleXNQZXJPY3RhdmUgKiBNYXhPY3RhdmU7IGkrKykge1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkyQnJ1c2gsIGkqV2hpdGVLZXlXaWR0aCsxLCBXaGl0ZUtleUhlaWdodCsyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBXaGl0ZUtleVdpZHRoLTIsIEJsYWNrQm9yZGVyLzIpO1xuICAgICAgICB9XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0obWFyZ2luICsgQmxhY2tCb3JkZXIpLCAtKG1hcmdpbiArIEJsYWNrQm9yZGVyKSk7IFxuICAgIH1cblxuICAgIC8qKiBEcmF3IHRoZSBub3RlIGxldHRlcnMgdW5kZXJuZWF0aCBlYWNoIHdoaXRlIG5vdGUgKi9cbiAgICBwcml2YXRlIHZvaWQgRHJhd05vdGVMZXR0ZXJzKEdyYXBoaWNzIGcpIHtcbiAgICAgICAgc3RyaW5nW10gbGV0dGVycyA9IHsgXCJDXCIsIFwiRFwiLCBcIkVcIiwgXCJGXCIsIFwiR1wiLCBcIkFcIiwgXCJCXCIgfTtcbiAgICAgICAgc3RyaW5nW10gbnVtYmVycyA9IHsgXCIxXCIsIFwiM1wiLCBcIjVcIiwgXCI2XCIsIFwiOFwiLCBcIjEwXCIsIFwiMTJcIiB9O1xuICAgICAgICBzdHJpbmdbXSBuYW1lcztcbiAgICAgICAgaWYgKHNob3dOb3RlTGV0dGVycyA9PSBNaWRpT3B0aW9ucy5Ob3RlTmFtZUxldHRlcikge1xuICAgICAgICAgICAgbmFtZXMgPSBsZXR0ZXJzO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHNob3dOb3RlTGV0dGVycyA9PSBNaWRpT3B0aW9ucy5Ob3RlTmFtZUZpeGVkTnVtYmVyKSB7XG4gICAgICAgICAgICBuYW1lcyA9IG51bWJlcnM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0obWFyZ2luICsgQmxhY2tCb3JkZXIsIG1hcmdpbiArIEJsYWNrQm9yZGVyKTsgXG4gICAgICAgIGZvciAoaW50IG9jdGF2ZSA9IDA7IG9jdGF2ZSA8IE1heE9jdGF2ZTsgb2N0YXZlKyspIHtcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgS2V5c1Blck9jdGF2ZTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZy5EcmF3U3RyaW5nKG5hbWVzW2ldLCBTaGVldE11c2ljLkxldHRlckZvbnQsIEJydXNoZXMuV2hpdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIChvY3RhdmUqS2V5c1Blck9jdGF2ZSArIGkpICogV2hpdGVLZXlXaWR0aCArIFdoaXRlS2V5V2lkdGgvMyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgV2hpdGVLZXlIZWlnaHQgKyBCbGFja0JvcmRlciAqIDMvNCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShtYXJnaW4gKyBCbGFja0JvcmRlciksIC0obWFyZ2luICsgQmxhY2tCb3JkZXIpKTsgXG4gICAgfVxuXG4gICAgLyoqIERyYXcgdGhlIFBpYW5vLiAqL1xuICAgIHByb3RlY3RlZCAvKm92ZXJyaWRlKi8gdm9pZCBPblBhaW50KFBhaW50RXZlbnRBcmdzIGUpIHtcbiAgICAgICAgR3JhcGhpY3MgZyA9IGUuR3JhcGhpY3MoKTtcbiAgICAgICAgZy5TbW9vdGhpbmdNb2RlID0gU21vb3RoaW5nTW9kZS5Ob25lO1xuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybShtYXJnaW4gKyBCbGFja0JvcmRlciwgbWFyZ2luICsgQmxhY2tCb3JkZXIpOyBcbiAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKEJydXNoZXMuV2hpdGUsIDAsIDAsIFxuICAgICAgICAgICAgICAgICAgICAgICAgV2hpdGVLZXlXaWR0aCAqIEtleXNQZXJPY3RhdmUgKiBNYXhPY3RhdmUsIFdoaXRlS2V5SGVpZ2h0KTtcbiAgICAgICAgRHJhd0JsYWNrS2V5cyhnKTtcbiAgICAgICAgRHJhd091dGxpbmUoZyk7XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0obWFyZ2luICsgQmxhY2tCb3JkZXIpLCAtKG1hcmdpbiArIEJsYWNrQm9yZGVyKSk7XG4gICAgICAgIERyYXdCbGFja0JvcmRlcihnKTtcbiAgICAgICAgaWYgKHNob3dOb3RlTGV0dGVycyAhPSBNaWRpT3B0aW9ucy5Ob3RlTmFtZU5vbmUpIHtcbiAgICAgICAgICAgIERyYXdOb3RlTGV0dGVycyhnKTtcbiAgICAgICAgfVxuICAgICAgICBnLlNtb290aGluZ01vZGUgPSBTbW9vdGhpbmdNb2RlLkFudGlBbGlhcztcbiAgICB9XG5cbiAgICAvKiBTaGFkZSB0aGUgZ2l2ZW4gbm90ZSB3aXRoIHRoZSBnaXZlbiBicnVzaC5cbiAgICAgKiBXZSBvbmx5IGRyYXcgbm90ZXMgZnJvbSBub3RlbnVtYmVyIDI0IHRvIDk2LlxuICAgICAqIChNaWRkbGUtQyBpcyA2MCkuXG4gICAgICovXG4gICAgcHJpdmF0ZSB2b2lkIFNoYWRlT25lTm90ZShHcmFwaGljcyBnLCBpbnQgbm90ZW51bWJlciwgQnJ1c2ggYnJ1c2gpIHtcbiAgICAgICAgaW50IG9jdGF2ZSA9IG5vdGVudW1iZXIgLyAxMjtcbiAgICAgICAgaW50IG5vdGVzY2FsZSA9IG5vdGVudW1iZXIgJSAxMjtcblxuICAgICAgICBvY3RhdmUgLT0gMjtcbiAgICAgICAgaWYgKG9jdGF2ZSA8IDAgfHwgb2N0YXZlID49IE1heE9jdGF2ZSlcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybShvY3RhdmUgKiBXaGl0ZUtleVdpZHRoICogS2V5c1Blck9jdGF2ZSwgMCk7XG4gICAgICAgIGludCB4MSwgeDIsIHgzO1xuXG4gICAgICAgIGludCBib3R0b21IYWxmSGVpZ2h0ID0gV2hpdGVLZXlIZWlnaHQgLSAoQmxhY2tLZXlIZWlnaHQrMyk7XG5cbiAgICAgICAgLyogbm90ZXNjYWxlIGdvZXMgZnJvbSAwIHRvIDExLCBmcm9tIEMgdG8gQi4gKi9cbiAgICAgICAgc3dpdGNoIChub3Rlc2NhbGUpIHtcbiAgICAgICAgY2FzZSAwOiAvKiBDICovXG4gICAgICAgICAgICB4MSA9IDI7XG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1swXSAtIDI7XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgxLCAwLCB4MiAtIHgxLCBCbGFja0tleUhlaWdodCszKTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIEJsYWNrS2V5SGVpZ2h0KzMsIFdoaXRlS2V5V2lkdGgtMywgYm90dG9tSGFsZkhlaWdodCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOiAvKiBDIyAqL1xuICAgICAgICAgICAgeDEgPSBibGFja0tleU9mZnNldHNbMF07IFxuICAgICAgICAgICAgeDIgPSBibGFja0tleU9mZnNldHNbMV07XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgxLCAwLCB4MiAtIHgxLCBCbGFja0tleUhlaWdodCk7XG4gICAgICAgICAgICBpZiAoYnJ1c2ggPT0gZ3JheTFCcnVzaCkge1xuICAgICAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShncmF5MkJydXNoLCB4MSsxLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmxhY2tLZXlIZWlnaHQgLSBCbGFja0tleUhlaWdodC84LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmxhY2tLZXlXaWR0aC0yLCBCbGFja0tleUhlaWdodC84KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6IC8qIEQgKi9cbiAgICAgICAgICAgIHgxID0gV2hpdGVLZXlXaWR0aCArIDI7XG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1sxXSArIDM7XG4gICAgICAgICAgICB4MyA9IGJsYWNrS2V5T2Zmc2V0c1syXSAtIDI7IFxuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MiwgMCwgeDMgLSB4MiwgQmxhY2tLZXlIZWlnaHQrMyk7XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgxLCBCbGFja0tleUhlaWdodCszLCBXaGl0ZUtleVdpZHRoLTMsIGJvdHRvbUhhbGZIZWlnaHQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzogLyogRCMgKi9cbiAgICAgICAgICAgIHgxID0gYmxhY2tLZXlPZmZzZXRzWzJdOyBcbiAgICAgICAgICAgIHgyID0gYmxhY2tLZXlPZmZzZXRzWzNdO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgMCwgQmxhY2tLZXlXaWR0aCwgQmxhY2tLZXlIZWlnaHQpO1xuICAgICAgICAgICAgaWYgKGJydXNoID09IGdyYXkxQnJ1c2gpIHtcbiAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTJCcnVzaCwgeDErMSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrS2V5SGVpZ2h0IC0gQmxhY2tLZXlIZWlnaHQvOCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrS2V5V2lkdGgtMiwgQmxhY2tLZXlIZWlnaHQvOCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OiAvKiBFICovXG4gICAgICAgICAgICB4MSA9IFdoaXRlS2V5V2lkdGggKiAyICsgMjtcbiAgICAgICAgICAgIHgyID0gYmxhY2tLZXlPZmZzZXRzWzNdICsgMzsgXG4gICAgICAgICAgICB4MyA9IFdoaXRlS2V5V2lkdGggKiAzIC0gMTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDIsIDAsIHgzIC0geDIsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDU6IC8qIEYgKi9cbiAgICAgICAgICAgIHgxID0gV2hpdGVLZXlXaWR0aCAqIDMgKyAyO1xuICAgICAgICAgICAgeDIgPSBibGFja0tleU9mZnNldHNbNF0gLSAyOyBcbiAgICAgICAgICAgIHgzID0gV2hpdGVLZXlXaWR0aCAqIDQgLSAyO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgMCwgeDIgLSB4MSwgQmxhY2tLZXlIZWlnaHQrMyk7XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgxLCBCbGFja0tleUhlaWdodCszLCBXaGl0ZUtleVdpZHRoLTMsIGJvdHRvbUhhbGZIZWlnaHQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjogLyogRiMgKi9cbiAgICAgICAgICAgIHgxID0gYmxhY2tLZXlPZmZzZXRzWzRdOyBcbiAgICAgICAgICAgIHgyID0gYmxhY2tLZXlPZmZzZXRzWzVdO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgMCwgQmxhY2tLZXlXaWR0aCwgQmxhY2tLZXlIZWlnaHQpO1xuICAgICAgICAgICAgaWYgKGJydXNoID09IGdyYXkxQnJ1c2gpIHtcbiAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTJCcnVzaCwgeDErMSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrS2V5SGVpZ2h0IC0gQmxhY2tLZXlIZWlnaHQvOCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrS2V5V2lkdGgtMiwgQmxhY2tLZXlIZWlnaHQvOCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA3OiAvKiBHICovXG4gICAgICAgICAgICB4MSA9IFdoaXRlS2V5V2lkdGggKiA0ICsgMjtcbiAgICAgICAgICAgIHgyID0gYmxhY2tLZXlPZmZzZXRzWzVdICsgMzsgXG4gICAgICAgICAgICB4MyA9IGJsYWNrS2V5T2Zmc2V0c1s2XSAtIDI7IFxuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MiwgMCwgeDMgLSB4MiwgQmxhY2tLZXlIZWlnaHQrMyk7XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgxLCBCbGFja0tleUhlaWdodCszLCBXaGl0ZUtleVdpZHRoLTMsIGJvdHRvbUhhbGZIZWlnaHQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgODogLyogRyMgKi9cbiAgICAgICAgICAgIHgxID0gYmxhY2tLZXlPZmZzZXRzWzZdOyBcbiAgICAgICAgICAgIHgyID0gYmxhY2tLZXlPZmZzZXRzWzddO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgMCwgQmxhY2tLZXlXaWR0aCwgQmxhY2tLZXlIZWlnaHQpO1xuICAgICAgICAgICAgaWYgKGJydXNoID09IGdyYXkxQnJ1c2gpIHtcbiAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTJCcnVzaCwgeDErMSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrS2V5SGVpZ2h0IC0gQmxhY2tLZXlIZWlnaHQvOCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrS2V5V2lkdGgtMiwgQmxhY2tLZXlIZWlnaHQvOCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA5OiAvKiBBICovXG4gICAgICAgICAgICB4MSA9IFdoaXRlS2V5V2lkdGggKiA1ICsgMjtcbiAgICAgICAgICAgIHgyID0gYmxhY2tLZXlPZmZzZXRzWzddICsgMzsgXG4gICAgICAgICAgICB4MyA9IGJsYWNrS2V5T2Zmc2V0c1s4XSAtIDI7IFxuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MiwgMCwgeDMgLSB4MiwgQmxhY2tLZXlIZWlnaHQrMyk7XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgxLCBCbGFja0tleUhlaWdodCszLCBXaGl0ZUtleVdpZHRoLTMsIGJvdHRvbUhhbGZIZWlnaHQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTA6IC8qIEEjICovXG4gICAgICAgICAgICB4MSA9IGJsYWNrS2V5T2Zmc2V0c1s4XTsgXG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1s5XTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIDAsIEJsYWNrS2V5V2lkdGgsIEJsYWNrS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgIGlmIChicnVzaCA9PSBncmF5MUJydXNoKSB7XG4gICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkyQnJ1c2gsIHgxKzEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleUhlaWdodCAtIEJsYWNrS2V5SGVpZ2h0LzgsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleVdpZHRoLTIsIEJsYWNrS2V5SGVpZ2h0LzgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTE6IC8qIEIgKi9cbiAgICAgICAgICAgIHgxID0gV2hpdGVLZXlXaWR0aCAqIDYgKyAyO1xuICAgICAgICAgICAgeDIgPSBibGFja0tleU9mZnNldHNbOV0gKyAzOyBcbiAgICAgICAgICAgIHgzID0gV2hpdGVLZXlXaWR0aCAqIEtleXNQZXJPY3RhdmUgLSAxO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MiwgMCwgeDMgLSB4MiwgQmxhY2tLZXlIZWlnaHQrMyk7XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgxLCBCbGFja0tleUhlaWdodCszLCBXaGl0ZUtleVdpZHRoLTMsIGJvdHRvbUhhbGZIZWlnaHQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKG9jdGF2ZSAqIFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlKSwgMCk7XG4gICAgfVxuXG4gICAgLyoqIEZpbmQgdGhlIE1pZGlOb3RlIHdpdGggdGhlIHN0YXJ0VGltZSBjbG9zZXN0IHRvIHRoZSBnaXZlbiB0aW1lLlxuICAgICAqICBSZXR1cm4gdGhlIGluZGV4IG9mIHRoZSBub3RlLiAgVXNlIGEgYmluYXJ5IHNlYXJjaCBtZXRob2QuXG4gICAgICovXG4gICAgcHJpdmF0ZSBpbnQgRmluZENsb3Nlc3RTdGFydFRpbWUoaW50IHB1bHNlVGltZSkge1xuICAgICAgICBpbnQgbGVmdCA9IDA7XG4gICAgICAgIGludCByaWdodCA9IG5vdGVzLkNvdW50LTE7XG5cbiAgICAgICAgd2hpbGUgKHJpZ2h0IC0gbGVmdCA+IDEpIHtcbiAgICAgICAgICAgIGludCBpID0gKHJpZ2h0ICsgbGVmdCkvMjtcbiAgICAgICAgICAgIGlmIChub3Rlc1tsZWZ0XS5TdGFydFRpbWUgPT0gcHVsc2VUaW1lKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZWxzZSBpZiAobm90ZXNbaV0uU3RhcnRUaW1lIDw9IHB1bHNlVGltZSlcbiAgICAgICAgICAgICAgICBsZWZ0ID0gaTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByaWdodCA9IGk7XG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKGxlZnQgPj0gMSAmJiAobm90ZXNbbGVmdC0xXS5TdGFydFRpbWUgPT0gbm90ZXNbbGVmdF0uU3RhcnRUaW1lKSkge1xuICAgICAgICAgICAgbGVmdC0tO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsZWZ0O1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIG5leHQgU3RhcnRUaW1lIHRoYXQgb2NjdXJzIGFmdGVyIHRoZSBNaWRpTm90ZVxuICAgICAqICBhdCBvZmZzZXQgaSwgdGhhdCBpcyBhbHNvIGluIHRoZSBzYW1lIHRyYWNrL2NoYW5uZWwuXG4gICAgICovXG4gICAgcHJpdmF0ZSBpbnQgTmV4dFN0YXJ0VGltZVNhbWVUcmFjayhpbnQgaSkge1xuICAgICAgICBpbnQgc3RhcnQgPSBub3Rlc1tpXS5TdGFydFRpbWU7XG4gICAgICAgIGludCBlbmQgPSBub3Rlc1tpXS5FbmRUaW1lO1xuICAgICAgICBpbnQgdHJhY2sgPSBub3Rlc1tpXS5DaGFubmVsO1xuXG4gICAgICAgIHdoaWxlIChpIDwgbm90ZXMuQ291bnQpIHtcbiAgICAgICAgICAgIGlmIChub3Rlc1tpXS5DaGFubmVsICE9IHRyYWNrKSB7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5vdGVzW2ldLlN0YXJ0VGltZSA+IHN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vdGVzW2ldLlN0YXJ0VGltZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVuZCA9IE1hdGguTWF4KGVuZCwgbm90ZXNbaV0uRW5kVGltZSk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVuZDtcbiAgICB9XG5cblxuICAgIC8qKiBSZXR1cm4gdGhlIG5leHQgU3RhcnRUaW1lIHRoYXQgb2NjdXJzIGFmdGVyIHRoZSBNaWRpTm90ZVxuICAgICAqICBhdCBvZmZzZXQgaS4gIElmIGFsbCB0aGUgc3Vic2VxdWVudCBub3RlcyBoYXZlIHRoZSBzYW1lXG4gICAgICogIFN0YXJ0VGltZSwgdGhlbiByZXR1cm4gdGhlIGxhcmdlc3QgRW5kVGltZS5cbiAgICAgKi9cbiAgICBwcml2YXRlIGludCBOZXh0U3RhcnRUaW1lKGludCBpKSB7XG4gICAgICAgIGludCBzdGFydCA9IG5vdGVzW2ldLlN0YXJ0VGltZTtcbiAgICAgICAgaW50IGVuZCA9IG5vdGVzW2ldLkVuZFRpbWU7XG5cbiAgICAgICAgd2hpbGUgKGkgPCBub3Rlcy5Db3VudCkge1xuICAgICAgICAgICAgaWYgKG5vdGVzW2ldLlN0YXJ0VGltZSA+IHN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vdGVzW2ldLlN0YXJ0VGltZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVuZCA9IE1hdGguTWF4KGVuZCwgbm90ZXNbaV0uRW5kVGltZSk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVuZDtcbiAgICB9XG5cbiAgICAvKiogRmluZCB0aGUgTWlkaSBub3RlcyB0aGF0IG9jY3VyIGluIHRoZSBjdXJyZW50IHRpbWUuXG4gICAgICogIFNoYWRlIHRob3NlIG5vdGVzIG9uIHRoZSBwaWFubyBkaXNwbGF5ZWQuXG4gICAgICogIFVuLXNoYWRlIHRoZSB0aG9zZSBub3RlcyBwbGF5ZWQgaW4gdGhlIHByZXZpb3VzIHRpbWUuXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgU2hhZGVOb3RlcyhpbnQgY3VycmVudFB1bHNlVGltZSwgaW50IHByZXZQdWxzZVRpbWUpIHtcbiAgICAgICAgaWYgKG5vdGVzID09IG51bGwgfHwgbm90ZXMuQ291bnQgPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChncmFwaGljcyA9PSBudWxsKSB7XG4gICAgICAgICAgICBncmFwaGljcyA9IENyZWF0ZUdyYXBoaWNzKFwic2hhZGVOb3Rlc19waWFub1wiKTtcbiAgICAgICAgfVxuICAgICAgICBncmFwaGljcy5TbW9vdGhpbmdNb2RlID0gU21vb3RoaW5nTW9kZS5Ob25lO1xuICAgICAgICBncmFwaGljcy5UcmFuc2xhdGVUcmFuc2Zvcm0obWFyZ2luICsgQmxhY2tCb3JkZXIsIG1hcmdpbiArIEJsYWNrQm9yZGVyKTtcblxuICAgICAgICAvKiBMb29wIHRocm91Z2ggdGhlIE1pZGkgbm90ZXMuXG4gICAgICAgICAqIFVuc2hhZGUgbm90ZXMgd2hlcmUgU3RhcnRUaW1lIDw9IHByZXZQdWxzZVRpbWUgPCBuZXh0IFN0YXJ0VGltZVxuICAgICAgICAgKiBTaGFkZSBub3RlcyB3aGVyZSBTdGFydFRpbWUgPD0gY3VycmVudFB1bHNlVGltZSA8IG5leHQgU3RhcnRUaW1lXG4gICAgICAgICAqL1xuICAgICAgICBpbnQgbGFzdFNoYWRlZEluZGV4ID0gRmluZENsb3Nlc3RTdGFydFRpbWUocHJldlB1bHNlVGltZSAtIG1heFNoYWRlRHVyYXRpb24gKiAyKTtcbiAgICAgICAgZm9yIChpbnQgaSA9IGxhc3RTaGFkZWRJbmRleDsgaSA8IG5vdGVzLkNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGludCBzdGFydCA9IG5vdGVzW2ldLlN0YXJ0VGltZTtcbiAgICAgICAgICAgIGludCBlbmQgPSBub3Rlc1tpXS5FbmRUaW1lO1xuICAgICAgICAgICAgaW50IG5vdGVudW1iZXIgPSBub3Rlc1tpXS5OdW1iZXI7XG4gICAgICAgICAgICBpbnQgbmV4dFN0YXJ0ID0gTmV4dFN0YXJ0VGltZShpKTtcbiAgICAgICAgICAgIGludCBuZXh0U3RhcnRUcmFjayA9IE5leHRTdGFydFRpbWVTYW1lVHJhY2soaSk7XG4gICAgICAgICAgICBlbmQgPSBNYXRoLk1heChlbmQsIG5leHRTdGFydFRyYWNrKTtcbiAgICAgICAgICAgIGVuZCA9IE1hdGguTWluKGVuZCwgc3RhcnQgKyBtYXhTaGFkZUR1cmF0aW9uLTEpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgLyogSWYgd2UndmUgcGFzdCB0aGUgcHJldmlvdXMgYW5kIGN1cnJlbnQgdGltZXMsIHdlJ3JlIGRvbmUuICovXG4gICAgICAgICAgICBpZiAoKHN0YXJ0ID4gcHJldlB1bHNlVGltZSkgJiYgKHN0YXJ0ID4gY3VycmVudFB1bHNlVGltZSkpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogSWYgc2hhZGVkIG5vdGVzIGFyZSB0aGUgc2FtZSwgd2UncmUgZG9uZSAqL1xuICAgICAgICAgICAgaWYgKChzdGFydCA8PSBjdXJyZW50UHVsc2VUaW1lKSAmJiAoY3VycmVudFB1bHNlVGltZSA8IG5leHRTdGFydCkgJiZcbiAgICAgICAgICAgICAgICAoY3VycmVudFB1bHNlVGltZSA8IGVuZCkgJiYgXG4gICAgICAgICAgICAgICAgKHN0YXJ0IDw9IHByZXZQdWxzZVRpbWUpICYmIChwcmV2UHVsc2VUaW1lIDwgbmV4dFN0YXJ0KSAmJlxuICAgICAgICAgICAgICAgIChwcmV2UHVsc2VUaW1lIDwgZW5kKSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBJZiB0aGUgbm90ZSBpcyBpbiB0aGUgY3VycmVudCB0aW1lLCBzaGFkZSBpdCAqL1xuICAgICAgICAgICAgaWYgKChzdGFydCA8PSBjdXJyZW50UHVsc2VUaW1lKSAmJiAoY3VycmVudFB1bHNlVGltZSA8IGVuZCkpIHtcbiAgICAgICAgICAgICAgICBpZiAodXNlVHdvQ29sb3JzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub3Rlc1tpXS5DaGFubmVsID09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFNoYWRlT25lTm90ZShncmFwaGljcywgbm90ZW51bWJlciwgc2hhZGUyQnJ1c2gpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgU2hhZGVPbmVOb3RlKGdyYXBoaWNzLCBub3RlbnVtYmVyLCBzaGFkZUJydXNoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgU2hhZGVPbmVOb3RlKGdyYXBoaWNzLCBub3RlbnVtYmVyLCBzaGFkZUJydXNoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIElmIHRoZSBub3RlIGlzIGluIHRoZSBwcmV2aW91cyB0aW1lLCB1bi1zaGFkZSBpdCwgZHJhdyBpdCB3aGl0ZS4gKi9cbiAgICAgICAgICAgIGVsc2UgaWYgKChzdGFydCA8PSBwcmV2UHVsc2VUaW1lKSAmJiAocHJldlB1bHNlVGltZSA8IGVuZCkpIHtcbiAgICAgICAgICAgICAgICBpbnQgbnVtID0gbm90ZW51bWJlciAlIDEyO1xuICAgICAgICAgICAgICAgIGlmIChudW0gPT0gMSB8fCBudW0gPT0gMyB8fCBudW0gPT0gNiB8fCBudW0gPT0gOCB8fCBudW0gPT0gMTApIHtcbiAgICAgICAgICAgICAgICAgICAgU2hhZGVPbmVOb3RlKGdyYXBoaWNzLCBub3RlbnVtYmVyLCBncmF5MUJydXNoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIFNoYWRlT25lTm90ZShncmFwaGljcywgbm90ZW51bWJlciwgQnJ1c2hlcy5XaGl0ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGdyYXBoaWNzLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKG1hcmdpbiArIEJsYWNrQm9yZGVyKSwgLShtYXJnaW4gKyBCbGFja0JvcmRlcikpO1xuICAgICAgICBncmFwaGljcy5TbW9vdGhpbmdNb2RlID0gU21vb3RoaW5nTW9kZS5BbnRpQWxpYXM7XG4gICAgfVxufVxuXG59XG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cblxuLyogQGNsYXNzIFJlc3RTeW1ib2xcbiAqIEEgUmVzdCBzeW1ib2wgcmVwcmVzZW50cyBhIHJlc3QgLSB3aG9sZSwgaGFsZiwgcXVhcnRlciwgb3IgZWlnaHRoLlxuICogVGhlIFJlc3Qgc3ltYm9sIGhhcyBhIHN0YXJ0dGltZSBhbmQgYSBkdXJhdGlvbiwganVzdCBsaWtlIGEgcmVndWxhclxuICogbm90ZS5cbiAqL1xucHVibGljIGNsYXNzIFJlc3RTeW1ib2wgOiBNdXNpY1N5bWJvbCB7XG4gICAgcHJpdmF0ZSBpbnQgc3RhcnR0aW1lOyAgICAgICAgICAvKiogVGhlIHN0YXJ0dGltZSBvZiB0aGUgcmVzdCAqL1xuICAgIHByaXZhdGUgTm90ZUR1cmF0aW9uIGR1cmF0aW9uOyAgLyoqIFRoZSByZXN0IGR1cmF0aW9uIChlaWdodGgsIHF1YXJ0ZXIsIGhhbGYsIHdob2xlKSAqL1xuICAgIHByaXZhdGUgaW50IHdpZHRoOyAgICAgICAgICAgICAgLyoqIFRoZSB3aWR0aCBpbiBwaXhlbHMgKi9cblxuICAgIC8qKiBDcmVhdGUgYSBuZXcgcmVzdCBzeW1ib2wgd2l0aCB0aGUgZ2l2ZW4gc3RhcnQgdGltZSBhbmQgZHVyYXRpb24gKi9cbiAgICBwdWJsaWMgUmVzdFN5bWJvbChpbnQgc3RhcnQsIE5vdGVEdXJhdGlvbiBkdXIpIHtcbiAgICAgICAgc3RhcnR0aW1lID0gc3RhcnQ7XG4gICAgICAgIGR1cmF0aW9uID0gZHVyOyBcbiAgICAgICAgd2lkdGggPSBNaW5XaWR0aDtcbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSB0aW1lIChpbiBwdWxzZXMpIHRoaXMgc3ltYm9sIG9jY3VycyBhdC5cbiAgICAgKiBUaGlzIGlzIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBtZWFzdXJlIHRoaXMgc3ltYm9sIGJlbG9uZ3MgdG8uXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBTdGFydFRpbWUgeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHN0YXJ0dGltZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQvU2V0IHRoZSB3aWR0aCAoaW4gcGl4ZWxzKSBvZiB0aGlzIHN5bWJvbC4gVGhlIHdpZHRoIGlzIHNldFxuICAgICAqIGluIFNoZWV0TXVzaWMuQWxpZ25TeW1ib2xzKCkgdG8gdmVydGljYWxseSBhbGlnbiBzeW1ib2xzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgV2lkdGgge1xuICAgICAgICBnZXQgeyByZXR1cm4gd2lkdGg7IH1cbiAgICAgICAgc2V0IHsgd2lkdGggPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG1pbmltdW0gd2lkdGggKGluIHBpeGVscykgbmVlZGVkIHRvIGRyYXcgdGhpcyBzeW1ib2wgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IE1pbldpZHRoIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIDIgKiBTaGVldE11c2ljLk5vdGVIZWlnaHQgKyBcbiAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYWJvdmUgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQWJvdmVTdGFmZiB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBiZWxvdyB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBCZWxvd1N0YWZmIHsgXG4gICAgICAgIGdldCB7IHJldHVybiAwOyB9XG4gICAgfVxuXG4gICAgLyoqIERyYXcgdGhlIHN5bWJvbC5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgXG4gICAgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIC8qIEFsaWduIHRoZSByZXN0IHN5bWJvbCB0byB0aGUgcmlnaHQgKi9cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oV2lkdGggLSBNaW5XaWR0aCwgMCk7XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yLCAwKTtcblxuICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLldob2xlKSB7XG4gICAgICAgICAgICBEcmF3V2hvbGUoZywgcGVuLCB5dG9wKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uSGFsZikge1xuICAgICAgICAgICAgRHJhd0hhbGYoZywgcGVuLCB5dG9wKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uUXVhcnRlcikge1xuICAgICAgICAgICAgRHJhd1F1YXJ0ZXIoZywgcGVuLCB5dG9wKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRWlnaHRoKSB7XG4gICAgICAgICAgICBEcmF3RWlnaHRoKGcsIHBlbiwgeXRvcCk7XG4gICAgICAgIH1cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLVNoZWV0TXVzaWMuTm90ZUhlaWdodC8yLCAwKTtcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShXaWR0aCAtIE1pbldpZHRoKSwgMCk7XG4gICAgfVxuXG5cbiAgICAvKiogRHJhdyBhIHdob2xlIHJlc3Qgc3ltYm9sLCBhIHJlY3RhbmdsZSBiZWxvdyBhIHN0YWZmIGxpbmUuXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHlsb2NhdGlvbiAoaW4gcGl4ZWxzKSB3aGVyZSB0aGUgdG9wIG9mIHRoZSBzdGFmZiBzdGFydHMuXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgRHJhd1dob2xlKEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIGludCB5ID0geXRvcCArIFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcblxuICAgICAgICBnLkZpbGxSZWN0YW5nbGUoQnJ1c2hlcy5CbGFjaywgMCwgeSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVXaWR0aCwgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIpO1xuICAgIH1cblxuICAgIC8qKiBEcmF3IGEgaGFsZiByZXN0IHN5bWJvbCwgYSByZWN0YW5nbGUgYWJvdmUgYSBzdGFmZiBsaW5lLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIERyYXdIYWxmKEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIGludCB5ID0geXRvcCArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCArIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG4gICAgICAgIGcuRmlsbFJlY3RhbmdsZShCcnVzaGVzLkJsYWNrLCAwLCB5LCBcbiAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZVdpZHRoLCBTaGVldE11c2ljLk5vdGVIZWlnaHQvMik7XG4gICAgfVxuXG4gICAgLyoqIERyYXcgYSBxdWFydGVyIHJlc3Qgc3ltYm9sLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIERyYXdRdWFydGVyKEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIHBlbi5FbmRDYXAgPSBMaW5lQ2FwLkZsYXQ7XG5cbiAgICAgICAgaW50IHkgPSB5dG9wICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG4gICAgICAgIGludCB4ID0gMjtcbiAgICAgICAgaW50IHhlbmQgPSB4ICsgMipTaGVldE11c2ljLk5vdGVIZWlnaHQvMztcbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHgsIHksIHhlbmQtMSwgeSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodC0xKTtcblxuICAgICAgICBwZW4uV2lkdGggPSBTaGVldE11c2ljLkxpbmVTcGFjZS8yO1xuICAgICAgICB5ICA9IHl0b3AgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQgKyAxO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeGVuZC0yLCB5LCB4LCB5ICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KTtcblxuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgICAgICB5ID0geXRvcCArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyIC0gMTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIDAsIHksIHhlbmQrMiwgeSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCk7IFxuXG4gICAgICAgIHBlbi5XaWR0aCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzI7XG4gICAgICAgIGlmIChTaGVldE11c2ljLk5vdGVIZWlnaHQgPT0gNikge1xuICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHhlbmQsIHkgKyAxICsgMypTaGVldE11c2ljLk5vdGVIZWlnaHQvNCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4LzIsIHkgKyAxICsgMypTaGVldE11c2ljLk5vdGVIZWlnaHQvNCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7ICAvKiBOb3RlSGVpZ2h0ID09IDggKi9cbiAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4ZW5kLCB5ICsgMypTaGVldE11c2ljLk5vdGVIZWlnaHQvNCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4LzIsIHkgKyAzKlNoZWV0TXVzaWMuTm90ZUhlaWdodC80KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCAwLCB5ICsgMipTaGVldE11c2ljLk5vdGVIZWlnaHQvMyArIDEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgeGVuZCAtIDEsIHkgKyAzKlNoZWV0TXVzaWMuTm90ZUhlaWdodC8yKTtcbiAgICB9XG5cbiAgICAvKiogRHJhdyBhbiBlaWdodGggcmVzdCBzeW1ib2wuXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHlsb2NhdGlvbiAoaW4gcGl4ZWxzKSB3aGVyZSB0aGUgdG9wIG9mIHRoZSBzdGFmZiBzdGFydHMuXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgRHJhd0VpZ2h0aChHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICBpbnQgeSA9IHl0b3AgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQgLSAxO1xuICAgICAgICBnLkZpbGxFbGxpcHNlKEJydXNoZXMuQmxhY2ssIDAsIHkrMSwgXG4gICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5MaW5lU3BhY2UtMSwgU2hlZXRNdXNpYy5MaW5lU3BhY2UtMSk7XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCAoU2hlZXRNdXNpYy5MaW5lU3BhY2UtMikvMiwgeSArIFNoZWV0TXVzaWMuTGluZVNwYWNlLTEsXG4gICAgICAgICAgICAgICAgICAgICAgICAzKlNoZWV0TXVzaWMuTGluZVNwYWNlLzIsIHkgKyBTaGVldE11c2ljLkxpbmVTcGFjZS8yKTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIDMqU2hlZXRNdXNpYy5MaW5lU3BhY2UvMiwgeSArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAzKlNoZWV0TXVzaWMuTGluZVNwYWNlLzQsIHkgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQqMik7XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJSZXN0U3ltYm9sIHN0YXJ0dGltZT17MH0gZHVyYXRpb249ezF9IHdpZHRoPXsyfVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydHRpbWUsIGR1cmF0aW9uLCB3aWR0aCk7XG4gICAgfVxuXG59XG5cblxufVxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTIgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcblxyXG5cclxuICAgIC8qKiBAY2xhc3MgU2hlZXRNdXNpY1xuICAgICAqXG4gICAgICogVGhlIFNoZWV0TXVzaWMgQ29udHJvbCBpcyB0aGUgbWFpbiBjbGFzcyBmb3IgZGlzcGxheWluZyB0aGUgc2hlZXQgbXVzaWMuXG4gICAgICogVGhlIFNoZWV0TXVzaWMgY2xhc3MgaGFzIHRoZSBmb2xsb3dpbmcgcHVibGljIG1ldGhvZHM6XG4gICAgICpcbiAgICAgKiBTaGVldE11c2ljKClcbiAgICAgKiAgIENyZWF0ZSBhIG5ldyBTaGVldE11c2ljIGNvbnRyb2wgZnJvbSB0aGUgZ2l2ZW4gbWlkaSBmaWxlIGFuZCBvcHRpb25zLlxuICAgICAqIFxuICAgICAqIFNldFpvb20oKVxuICAgICAqICAgU2V0IHRoZSB6b29tIGxldmVsIHRvIGRpc3BsYXkgdGhlIHNoZWV0IG11c2ljIGF0LlxuICAgICAqXG4gICAgICogRG9QcmludCgpXG4gICAgICogICBQcmludCBhIHNpbmdsZSBwYWdlIG9mIHNoZWV0IG11c2ljLlxuICAgICAqXG4gICAgICogR2V0VG90YWxQYWdlcygpXG4gICAgICogICBHZXQgdGhlIHRvdGFsIG51bWJlciBvZiBzaGVldCBtdXNpYyBwYWdlcy5cbiAgICAgKlxuICAgICAqIE9uUGFpbnQoKVxuICAgICAqICAgTWV0aG9kIGNhbGxlZCB0byBkcmF3IHRoZSBTaGVldE11aXNjXG4gICAgICpcbiAgICAgKiBUaGVzZSBwdWJsaWMgbWV0aG9kcyBhcmUgY2FsbGVkIGZyb20gdGhlIE1pZGlTaGVldE11c2ljIEZvcm0gV2luZG93LlxuICAgICAqXG4gICAgICovXHJcbiAgICBwdWJsaWMgY2xhc3MgU2hlZXRNdXNpYyA6IENvbnRyb2xcclxuICAgIHtcclxuXHJcbiAgICAgICAgLyogTWVhc3VyZW1lbnRzIHVzZWQgd2hlbiBkcmF3aW5nLiAgQWxsIG1lYXN1cmVtZW50cyBhcmUgaW4gcGl4ZWxzLlxyXG4gICAgICAgICAqIFRoZSB2YWx1ZXMgZGVwZW5kIG9uIHdoZXRoZXIgdGhlIG1lbnUgJ0xhcmdlIE5vdGVzJyBvciAnU21hbGwgTm90ZXMnIGlzIHNlbGVjdGVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgTGluZVdpZHRoID0gMTsgICAgLyoqIFRoZSB3aWR0aCBvZiBhIGxpbmUgKi9cclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IExlZnRNYXJnaW4gPSA0OyAgIC8qKiBUaGUgbGVmdCBtYXJnaW4gKi9cclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IFRpdGxlSGVpZ2h0ID0gMTQ7IC8qKiBUaGUgaGVpZ2h0IGZvciB0aGUgdGl0bGUgb24gdGhlIGZpcnN0IHBhZ2UgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGludCBMaW5lU3BhY2U7ICAgICAgICAvKiogVGhlIHNwYWNlIGJldHdlZW4gbGluZXMgaW4gdGhlIHN0YWZmICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBpbnQgU3RhZmZIZWlnaHQ7ICAgICAgLyoqIFRoZSBoZWlnaHQgYmV0d2VlbiB0aGUgNSBob3Jpem9udGFsIGxpbmVzIG9mIHRoZSBzdGFmZiAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaW50IE5vdGVIZWlnaHQ7ICAgICAgLyoqIFRoZSBoZWlnaHQgb2YgYSB3aG9sZSBub3RlICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBpbnQgTm90ZVdpZHRoOyAgICAgICAvKiogVGhlIHdpZHRoIG9mIGEgd2hvbGUgbm90ZSAqL1xyXG5cclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IFBhZ2VXaWR0aCA9IDgwMDsgICAgLyoqIFRoZSB3aWR0aCBvZiBlYWNoIHBhZ2UgKi9cclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IFBhZ2VIZWlnaHQgPSAxMDUwOyAgLyoqIFRoZSBoZWlnaHQgb2YgZWFjaCBwYWdlICh3aGVuIHByaW50aW5nKSAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgRm9udCBMZXR0ZXJGb250OyAgICAgICAvKiogVGhlIGZvbnQgZm9yIGRyYXdpbmcgdGhlIGxldHRlcnMgKi9cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBMaXN0PFN0YWZmPiBzdGFmZnM7IC8qKiBUaGUgYXJyYXkgb2Ygc3RhZmZzIHRvIGRpc3BsYXkgKGZyb20gdG9wIHRvIGJvdHRvbSkgKi9cclxuICAgICAgICBwcml2YXRlIEtleVNpZ25hdHVyZSBtYWlua2V5OyAvKiogVGhlIG1haW4ga2V5IHNpZ25hdHVyZSAqL1xyXG4gICAgICAgIHByaXZhdGUgaW50IG51bXRyYWNrczsgICAgIC8qKiBUaGUgbnVtYmVyIG9mIHRyYWNrcyAqL1xyXG4gICAgICAgIHByaXZhdGUgZmxvYXQgem9vbTsgICAgICAgICAgLyoqIFRoZSB6b29tIGxldmVsIHRvIGRyYXcgYXQgKDEuMCA9PSAxMDAlKSAqL1xyXG4gICAgICAgIHByaXZhdGUgYm9vbCBzY3JvbGxWZXJ0OyAgICAvKiogV2hldGhlciB0byBzY3JvbGwgdmVydGljYWxseSBvciBob3Jpem9udGFsbHkgKi9cclxuICAgICAgICBwcml2YXRlIHN0cmluZyBmaWxlbmFtZTsgICAgICAvKiogVGhlIG5hbWUgb2YgdGhlIG1pZGkgZmlsZSAqL1xyXG4gICAgICAgIHByaXZhdGUgaW50IHNob3dOb3RlTGV0dGVyczsgICAgLyoqIERpc3BsYXkgdGhlIG5vdGUgbGV0dGVycyAqL1xyXG4gICAgICAgIHByaXZhdGUgQ29sb3JbXSBOb3RlQ29sb3JzOyAgICAgLyoqIFRoZSBub3RlIGNvbG9ycyB0byB1c2UgKi9cclxuICAgICAgICBwcml2YXRlIFNvbGlkQnJ1c2ggc2hhZGVCcnVzaDsgIC8qKiBUaGUgYnJ1c2ggZm9yIHNoYWRpbmcgKi9cclxuICAgICAgICBwcml2YXRlIFNvbGlkQnJ1c2ggc2hhZGUyQnJ1c2g7IC8qKiBUaGUgYnJ1c2ggZm9yIHNoYWRpbmcgbGVmdC1oYW5kIHBpYW5vICovXHJcbiAgICAgICAgcHJpdmF0ZSBTb2xpZEJydXNoIGRlc2VsZWN0ZWRTaGFkZUJydXNoID0gbmV3IFNvbGlkQnJ1c2goQ29sb3IuTGlnaHRHcmF5KTsgLyoqIFRoZSBicnVzaCBmb3Igc2hhZGluZyBkZXNlbGVjdGVkIGFyZWFzICovXHJcbiAgICAgICAgcHJpdmF0ZSBQZW4gcGVuOyAgICAgICAgICAgICAgICAvKiogVGhlIGJsYWNrIHBlbiBmb3IgZHJhd2luZyAqL1xyXG5cclxuICAgICAgICBwdWJsaWMgaW50IFNlbGVjdGlvblN0YXJ0UHVsc2UgeyBnZXQ7IHNldDsgfVxuICAgICAgICBwdWJsaWMgaW50IFNlbGVjdGlvbkVuZFB1bHNlIHsgZ2V0OyBzZXQ7IH1cclxuXHJcbiAgICAgICAgLyoqIEluaXRpYWxpemUgdGhlIGRlZmF1bHQgbm90ZSBzaXplcy4gICovXHJcbiAgICAgICAgc3RhdGljIFNoZWV0TXVzaWMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgU2V0Tm90ZVNpemUoZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIENyZWF0ZSBhIG5ldyBTaGVldE11c2ljIGNvbnRyb2wsIHVzaW5nIHRoZSBnaXZlbiBwYXJzZWQgTWlkaUZpbGUuXG4gICAgICAgICAqICBUaGUgb3B0aW9ucyBjYW4gYmUgbnVsbC5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIFNoZWV0TXVzaWMoTWlkaUZpbGUgZmlsZSwgTWlkaU9wdGlvbnMgb3B0aW9ucylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGluaXQoZmlsZSwgb3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogQ3JlYXRlIGEgbmV3IFNoZWV0TXVzaWMgY29udHJvbCwgdXNpbmcgdGhlIGdpdmVuIG1pZGkgZmlsZW5hbWUuXG4gICAgICAgICAqICBUaGUgb3B0aW9ucyBjYW4gYmUgbnVsbC5cbiAgICAgICAgICovXHJcbiAgICAgICAgLy9wdWJsaWMgU2hlZXRNdXNpYyhzdHJpbmcgZmlsZW5hbWUsIE1pZGlPcHRpb25zIG9wdGlvbnMpIHtcclxuICAgICAgICAvLyAgICBNaWRpRmlsZSBmaWxlID0gbmV3IE1pZGlGaWxlKGZpbGVuYW1lKTtcclxuICAgICAgICAvLyAgICBpbml0KGZpbGUsIG9wdGlvbnMpOyBcclxuICAgICAgICAvL31cclxuXHJcbiAgICAgICAgLyoqIENyZWF0ZSBhIG5ldyBTaGVldE11c2ljIGNvbnRyb2wsIHVzaW5nIHRoZSBnaXZlbiByYXcgbWlkaSBieXRlW10gZGF0YS5cbiAgICAgICAgICogIFRoZSBvcHRpb25zIGNhbiBiZSBudWxsLlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgU2hlZXRNdXNpYyhieXRlW10gZGF0YSwgc3RyaW5nIHRpdGxlLCBNaWRpT3B0aW9ucyBvcHRpb25zKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgTWlkaUZpbGUgZmlsZSA9IG5ldyBNaWRpRmlsZShkYXRhLCB0aXRsZSk7XHJcbiAgICAgICAgICAgIGluaXQoZmlsZSwgb3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIENyZWF0ZSBhIG5ldyBTaGVldE11c2ljIGNvbnRyb2wuXG4gICAgICAgICAqIE1pZGlGaWxlIGlzIHRoZSBwYXJzZWQgbWlkaSBmaWxlIHRvIGRpc3BsYXkuXG4gICAgICAgICAqIFNoZWV0TXVzaWMgT3B0aW9ucyBhcmUgdGhlIG1lbnUgb3B0aW9ucyB0aGF0IHdlcmUgc2VsZWN0ZWQuXG4gICAgICAgICAqXG4gICAgICAgICAqIC0gQXBwbHkgYWxsIHRoZSBNZW51IE9wdGlvbnMgdG8gdGhlIE1pZGlGaWxlIHRyYWNrcy5cbiAgICAgICAgICogLSBDYWxjdWxhdGUgdGhlIGtleSBzaWduYXR1cmVcbiAgICAgICAgICogLSBGb3IgZWFjaCB0cmFjaywgY3JlYXRlIGEgbGlzdCBvZiBNdXNpY1N5bWJvbHMgKG5vdGVzLCByZXN0cywgYmFycywgZXRjKVxuICAgICAgICAgKiAtIFZlcnRpY2FsbHkgYWxpZ24gdGhlIG11c2ljIHN5bWJvbHMgaW4gYWxsIHRoZSB0cmFja3NcbiAgICAgICAgICogLSBQYXJ0aXRpb24gdGhlIG11c2ljIG5vdGVzIGludG8gaG9yaXpvbnRhbCBzdGFmZnNcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHZvaWQgaW5pdChNaWRpRmlsZSBmaWxlLCBNaWRpT3B0aW9ucyBvcHRpb25zKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMgPT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IG5ldyBNaWRpT3B0aW9ucyhmaWxlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB6b29tID0gMS4wZjtcclxuICAgICAgICAgICAgZmlsZW5hbWUgPSBmaWxlLkZpbGVOYW1lO1xyXG5cclxuICAgICAgICAgICAgU2V0Q29sb3JzKG9wdGlvbnMuY29sb3JzLCBvcHRpb25zLnNoYWRlQ29sb3IsIG9wdGlvbnMuc2hhZGUyQ29sb3IpO1xyXG4gICAgICAgICAgICBwZW4gPSBuZXcgUGVuKENvbG9yLkJsYWNrLCAxKTtcclxuXHJcbiAgICAgICAgICAgIExpc3Q8TWlkaVRyYWNrPiB0cmFja3MgPSBmaWxlLkNoYW5nZU1pZGlOb3RlcyhvcHRpb25zKTtcclxuICAgICAgICAgICAgU2V0Tm90ZVNpemUob3B0aW9ucy5sYXJnZU5vdGVTaXplKTtcclxuICAgICAgICAgICAgc2Nyb2xsVmVydCA9IG9wdGlvbnMuc2Nyb2xsVmVydDtcclxuICAgICAgICAgICAgc2hvd05vdGVMZXR0ZXJzID0gb3B0aW9ucy5zaG93Tm90ZUxldHRlcnM7XHJcbiAgICAgICAgICAgIFRpbWVTaWduYXR1cmUgdGltZSA9IGZpbGUuVGltZTtcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudGltZSAhPSBudWxsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aW1lID0gb3B0aW9ucy50aW1lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmtleSA9PSAtMSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbWFpbmtleSA9IEdldEtleVNpZ25hdHVyZSh0cmFja3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbWFpbmtleSA9IG5ldyBLZXlTaWduYXR1cmUob3B0aW9ucy5rZXkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBudW10cmFja3MgPSB0cmFja3MuQ291bnQ7XHJcblxyXG4gICAgICAgICAgICBpbnQgbGFzdFN0YXJ0ID0gZmlsZS5FbmRUaW1lKCkgKyBvcHRpb25zLnNoaWZ0dGltZTtcclxuXHJcbiAgICAgICAgICAgIC8qIENyZWF0ZSBhbGwgdGhlIG11c2ljIHN5bWJvbHMgKG5vdGVzLCByZXN0cywgdmVydGljYWwgYmFycywgYW5kXHJcbiAgICAgICAgICAgICAqIGNsZWYgY2hhbmdlcykuICBUaGUgc3ltYm9scyB2YXJpYWJsZSBjb250YWlucyBhIGxpc3Qgb2YgbXVzaWMgXHJcbiAgICAgICAgICAgICAqIHN5bWJvbHMgZm9yIGVhY2ggdHJhY2suICBUaGUgbGlzdCBkb2VzIG5vdCBpbmNsdWRlIHRoZSBsZWZ0LXNpZGUgXHJcbiAgICAgICAgICAgICAqIENsZWYgYW5kIGtleSBzaWduYXR1cmUgc3ltYm9scy4gIFRob3NlIGNhbiBvbmx5IGJlIGNhbGN1bGF0ZWQgXHJcbiAgICAgICAgICAgICAqIHdoZW4gd2UgY3JlYXRlIHRoZSBzdGFmZnMuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBMaXN0PE11c2ljU3ltYm9sPltdIHN5bWJvbHMgPSBuZXcgTGlzdDxNdXNpY1N5bWJvbD5bbnVtdHJhY2tzXTtcclxuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IG51bXRyYWNrczsgdHJhY2tudW0rKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTWlkaVRyYWNrIHRyYWNrID0gdHJhY2tzW3RyYWNrbnVtXTtcclxuICAgICAgICAgICAgICAgIENsZWZNZWFzdXJlcyBjbGVmcyA9IG5ldyBDbGVmTWVhc3VyZXModHJhY2suTm90ZXMsIHRpbWUuTWVhc3VyZSk7XHJcbiAgICAgICAgICAgICAgICBMaXN0PENob3JkU3ltYm9sPiBjaG9yZHMgPSBDcmVhdGVDaG9yZHModHJhY2suTm90ZXMsIG1haW5rZXksIHRpbWUsIGNsZWZzKTtcclxuICAgICAgICAgICAgICAgIHN5bWJvbHNbdHJhY2tudW1dID0gQ3JlYXRlU3ltYm9scyhjaG9yZHMsIGNsZWZzLCB0aW1lLCBsYXN0U3RhcnQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBMaXN0PEx5cmljU3ltYm9sPltdIGx5cmljcyA9IG51bGw7XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnNob3dMeXJpY3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGx5cmljcyA9IEdldEx5cmljcyh0cmFja3MpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvKiBWZXJ0aWNhbGx5IGFsaWduIHRoZSBtdXNpYyBzeW1ib2xzICovXHJcbiAgICAgICAgICAgIFN5bWJvbFdpZHRocyB3aWR0aHMgPSBuZXcgU3ltYm9sV2lkdGhzKHN5bWJvbHMsIGx5cmljcyk7XHJcbiAgICAgICAgICAgIEFsaWduU3ltYm9scyhzeW1ib2xzLCB3aWR0aHMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICAgICAgc3RhZmZzID0gQ3JlYXRlU3RhZmZzKHN5bWJvbHMsIG1haW5rZXksIG9wdGlvbnMsIHRpbWUuTWVhc3VyZSk7XHJcbiAgICAgICAgICAgIENyZWF0ZUFsbEJlYW1lZENob3JkcyhzeW1ib2xzLCB0aW1lKTtcclxuICAgICAgICAgICAgaWYgKGx5cmljcyAhPSBudWxsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBBZGRMeXJpY3NUb1N0YWZmcyhzdGFmZnMsIGx5cmljcyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIEFmdGVyIG1ha2luZyBjaG9yZCBwYWlycywgdGhlIHN0ZW0gZGlyZWN0aW9ucyBjYW4gY2hhbmdlLFxyXG4gICAgICAgICAgICAgKiB3aGljaCBhZmZlY3RzIHRoZSBzdGFmZiBoZWlnaHQuICBSZS1jYWxjdWxhdGUgdGhlIHN0YWZmIGhlaWdodC5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKFN0YWZmIHN0YWZmIGluIHN0YWZmcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3RhZmYuQ2FsY3VsYXRlSGVpZ2h0KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIEJhY2tDb2xvciA9IENvbG9yLldoaXRlO1xyXG5cclxuICAgICAgICAgICAgU2V0Wm9vbSgxLjBmKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogR2V0IHRoZSBiZXN0IGtleSBzaWduYXR1cmUgZ2l2ZW4gdGhlIG1pZGkgbm90ZXMgaW4gYWxsIHRoZSB0cmFja3MuICovXHJcbiAgICAgICAgcHJpdmF0ZSBLZXlTaWduYXR1cmUgR2V0S2V5U2lnbmF0dXJlKExpc3Q8TWlkaVRyYWNrPiB0cmFja3MpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBMaXN0PGludD4gbm90ZW51bXMgPSBuZXcgTGlzdDxpbnQ+KCk7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG5vdGUgaW4gdHJhY2suTm90ZXMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm90ZW51bXMuQWRkKG5vdGUuTnVtYmVyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gS2V5U2lnbmF0dXJlLkd1ZXNzKG5vdGVudW1zKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogQ3JlYXRlIHRoZSBjaG9yZCBzeW1ib2xzIGZvciBhIHNpbmdsZSB0cmFjay5cbiAgICAgICAgICogQHBhcmFtIG1pZGlub3RlcyAgVGhlIE1pZGlub3RlcyBpbiB0aGUgdHJhY2suXG4gICAgICAgICAqIEBwYXJhbSBrZXkgICAgICAgIFRoZSBLZXkgU2lnbmF0dXJlLCBmb3IgZGV0ZXJtaW5pbmcgc2hhcnBzL2ZsYXRzLlxuICAgICAgICAgKiBAcGFyYW0gdGltZSAgICAgICBUaGUgVGltZSBTaWduYXR1cmUsIGZvciBkZXRlcm1pbmluZyB0aGUgbWVhc3VyZXMuXG4gICAgICAgICAqIEBwYXJhbSBjbGVmcyAgICAgIFRoZSBjbGVmcyB0byB1c2UgZm9yIGVhY2ggbWVhc3VyZS5cbiAgICAgICAgICogQHJldCBBbiBhcnJheSBvZiBDaG9yZFN5bWJvbHNcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZVxyXG4gICAgICAgIExpc3Q8Q2hvcmRTeW1ib2w+IENyZWF0ZUNob3JkcyhMaXN0PE1pZGlOb3RlPiBtaWRpbm90ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEtleVNpZ25hdHVyZSBrZXksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRpbWVTaWduYXR1cmUgdGltZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ2xlZk1lYXN1cmVzIGNsZWZzKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIGludCBpID0gMDtcclxuICAgICAgICAgICAgTGlzdDxDaG9yZFN5bWJvbD4gY2hvcmRzID0gbmV3IExpc3Q8Q2hvcmRTeW1ib2w+KCk7XHJcbiAgICAgICAgICAgIExpc3Q8TWlkaU5vdGU+IG5vdGVncm91cCA9IG5ldyBMaXN0PE1pZGlOb3RlPigxMik7XHJcbiAgICAgICAgICAgIGludCBsZW4gPSBtaWRpbm90ZXMuQ291bnQ7XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAoaSA8IGxlbilcclxuICAgICAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgICAgIGludCBzdGFydHRpbWUgPSBtaWRpbm90ZXNbaV0uU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgQ2xlZiBjbGVmID0gY2xlZnMuR2V0Q2xlZihzdGFydHRpbWUpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qIEdyb3VwIGFsbCB0aGUgbWlkaSBub3RlcyB3aXRoIHRoZSBzYW1lIHN0YXJ0IHRpbWVcclxuICAgICAgICAgICAgICAgICAqIGludG8gdGhlIG5vdGVzIGxpc3QuXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIG5vdGVncm91cC5DbGVhcigpO1xyXG4gICAgICAgICAgICAgICAgbm90ZWdyb3VwLkFkZChtaWRpbm90ZXNbaV0pO1xyXG4gICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGkgPCBsZW4gJiYgbWlkaW5vdGVzW2ldLlN0YXJ0VGltZSA9PSBzdGFydHRpbWUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm90ZWdyb3VwLkFkZChtaWRpbm90ZXNbaV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKiBDcmVhdGUgYSBzaW5nbGUgY2hvcmQgZnJvbSB0aGUgZ3JvdXAgb2YgbWlkaSBub3RlcyB3aXRoXHJcbiAgICAgICAgICAgICAgICAgKiB0aGUgc2FtZSBzdGFydCB0aW1lLlxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBDaG9yZFN5bWJvbCBjaG9yZCA9IG5ldyBDaG9yZFN5bWJvbChub3RlZ3JvdXAsIGtleSwgdGltZSwgY2xlZiwgdGhpcyk7XHJcbiAgICAgICAgICAgICAgICBjaG9yZHMuQWRkKGNob3JkKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGNob3JkcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBHaXZlbiB0aGUgY2hvcmQgc3ltYm9scyBmb3IgYSB0cmFjaywgY3JlYXRlIGEgbmV3IHN5bWJvbCBsaXN0XG4gICAgICAgICAqIHRoYXQgY29udGFpbnMgdGhlIGNob3JkIHN5bWJvbHMsIHZlcnRpY2FsIGJhcnMsIHJlc3RzLCBhbmQgY2xlZiBjaGFuZ2VzLlxuICAgICAgICAgKiBSZXR1cm4gYSBsaXN0IG9mIHN5bWJvbHMgKENob3JkU3ltYm9sLCBCYXJTeW1ib2wsIFJlc3RTeW1ib2wsIENsZWZTeW1ib2wpXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgTGlzdDxNdXNpY1N5bWJvbD5cclxuICAgICAgICBDcmVhdGVTeW1ib2xzKExpc3Q8Q2hvcmRTeW1ib2w+IGNob3JkcywgQ2xlZk1lYXN1cmVzIGNsZWZzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgVGltZVNpZ25hdHVyZSB0aW1lLCBpbnQgbGFzdFN0YXJ0KVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIExpc3Q8TXVzaWNTeW1ib2w+IHN5bWJvbHMgPSBuZXcgTGlzdDxNdXNpY1N5bWJvbD4oKTtcclxuICAgICAgICAgICAgc3ltYm9scyA9IEFkZEJhcnMoY2hvcmRzLCB0aW1lLCBsYXN0U3RhcnQpO1xyXG4gICAgICAgICAgICBzeW1ib2xzID0gQWRkUmVzdHMoc3ltYm9scywgdGltZSk7XHJcbiAgICAgICAgICAgIHN5bWJvbHMgPSBBZGRDbGVmQ2hhbmdlcyhzeW1ib2xzLCBjbGVmcywgdGltZSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3ltYm9scztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBBZGQgaW4gdGhlIHZlcnRpY2FsIGJhcnMgZGVsaW1pdGluZyBtZWFzdXJlcy4gXG4gICAgICAgICAqICBBbHNvLCBhZGQgdGhlIHRpbWUgc2lnbmF0dXJlIHN5bWJvbHMuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGVcclxuICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiBBZGRCYXJzKExpc3Q8Q2hvcmRTeW1ib2w+IGNob3JkcywgVGltZVNpZ25hdHVyZSB0aW1lLCBpbnQgbGFzdFN0YXJ0KVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIExpc3Q8TXVzaWNTeW1ib2w+IHN5bWJvbHMgPSBuZXcgTGlzdDxNdXNpY1N5bWJvbD4oKTtcclxuXHJcbiAgICAgICAgICAgIFRpbWVTaWdTeW1ib2wgdGltZXNpZyA9IG5ldyBUaW1lU2lnU3ltYm9sKHRpbWUuTnVtZXJhdG9yLCB0aW1lLkRlbm9taW5hdG9yKTtcclxuICAgICAgICAgICAgc3ltYm9scy5BZGQodGltZXNpZyk7XHJcblxyXG4gICAgICAgICAgICAvKiBUaGUgc3RhcnR0aW1lIG9mIHRoZSBiZWdpbm5pbmcgb2YgdGhlIG1lYXN1cmUgKi9cclxuICAgICAgICAgICAgaW50IG1lYXN1cmV0aW1lID0gMDtcclxuXHJcbiAgICAgICAgICAgIGludCBpID0gMDtcclxuICAgICAgICAgICAgd2hpbGUgKGkgPCBjaG9yZHMuQ291bnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChtZWFzdXJldGltZSA8PSBjaG9yZHNbaV0uU3RhcnRUaW1lKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHN5bWJvbHMuQWRkKG5ldyBCYXJTeW1ib2wobWVhc3VyZXRpbWUpKTtcclxuICAgICAgICAgICAgICAgICAgICBtZWFzdXJldGltZSArPSB0aW1lLk1lYXN1cmU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3ltYm9scy5BZGQoY2hvcmRzW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIEtlZXAgYWRkaW5nIGJhcnMgdW50aWwgdGhlIGxhc3QgU3RhcnRUaW1lICh0aGUgZW5kIG9mIHRoZSBzb25nKSAqL1xyXG4gICAgICAgICAgICB3aGlsZSAobWVhc3VyZXRpbWUgPCBsYXN0U3RhcnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN5bWJvbHMuQWRkKG5ldyBCYXJTeW1ib2wobWVhc3VyZXRpbWUpKTtcclxuICAgICAgICAgICAgICAgIG1lYXN1cmV0aW1lICs9IHRpbWUuTWVhc3VyZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLyogQWRkIHRoZSBmaW5hbCB2ZXJ0aWNhbCBiYXIgdG8gdGhlIGxhc3QgbWVhc3VyZSAqL1xyXG4gICAgICAgICAgICBzeW1ib2xzLkFkZChuZXcgQmFyU3ltYm9sKG1lYXN1cmV0aW1lKSk7XHJcbiAgICAgICAgICAgIHJldHVybiBzeW1ib2xzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIEFkZCByZXN0IHN5bWJvbHMgYmV0d2VlbiBub3Rlcy4gIEFsbCB0aW1lcyBiZWxvdyBhcmUgXG4gICAgICAgICAqIG1lYXN1cmVkIGluIHB1bHNlcy5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZVxyXG4gICAgICAgIExpc3Q8TXVzaWNTeW1ib2w+IEFkZFJlc3RzKExpc3Q8TXVzaWNTeW1ib2w+IHN5bWJvbHMsIFRpbWVTaWduYXR1cmUgdGltZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGludCBwcmV2dGltZSA9IDA7XHJcblxyXG4gICAgICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiByZXN1bHQgPSBuZXcgTGlzdDxNdXNpY1N5bWJvbD4oc3ltYm9scy5Db3VudCk7XHJcblxyXG4gICAgICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBzeW1ib2wgaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IHN0YXJ0dGltZSA9IHN5bWJvbC5TdGFydFRpbWU7XHJcbiAgICAgICAgICAgICAgICBSZXN0U3ltYm9sW10gcmVzdHMgPSBHZXRSZXN0cyh0aW1lLCBwcmV2dGltZSwgc3RhcnR0aW1lKTtcclxuICAgICAgICAgICAgICAgIGlmIChyZXN0cyAhPSBudWxsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcmVhY2ggKFJlc3RTeW1ib2wgciBpbiByZXN0cylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5BZGQocik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJlc3VsdC5BZGQoc3ltYm9sKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKiBTZXQgcHJldnRpbWUgdG8gdGhlIGVuZCB0aW1lIG9mIHRoZSBsYXN0IG5vdGUvc3ltYm9sLiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHN5bWJvbCBpcyBDaG9yZFN5bWJvbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBDaG9yZFN5bWJvbCBjaG9yZCA9IChDaG9yZFN5bWJvbClzeW1ib2w7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldnRpbWUgPSBNYXRoLk1heChjaG9yZC5FbmRUaW1lLCBwcmV2dGltZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldnRpbWUgPSBNYXRoLk1heChzdGFydHRpbWUsIHByZXZ0aW1lKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFJldHVybiB0aGUgcmVzdCBzeW1ib2xzIG5lZWRlZCB0byBmaWxsIHRoZSB0aW1lIGludGVydmFsIGJldHdlZW5cbiAgICAgICAgICogc3RhcnQgYW5kIGVuZC4gIElmIG5vIHJlc3RzIGFyZSBuZWVkZWQsIHJldHVybiBuaWwuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGVcclxuICAgICAgICBSZXN0U3ltYm9sW10gR2V0UmVzdHMoVGltZVNpZ25hdHVyZSB0aW1lLCBpbnQgc3RhcnQsIGludCBlbmQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBSZXN0U3ltYm9sW10gcmVzdWx0O1xyXG4gICAgICAgICAgICBSZXN0U3ltYm9sIHIxLCByMjtcclxuXHJcbiAgICAgICAgICAgIGlmIChlbmQgLSBzdGFydCA8IDApXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIE5vdGVEdXJhdGlvbiBkdXIgPSB0aW1lLkdldE5vdGVEdXJhdGlvbihlbmQgLSBzdGFydCk7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoZHVyKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5XaG9sZTpcclxuICAgICAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkhhbGY6XHJcbiAgICAgICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5RdWFydGVyOlxyXG4gICAgICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uRWlnaHRoOlxyXG4gICAgICAgICAgICAgICAgICAgIHIxID0gbmV3IFJlc3RTeW1ib2woc3RhcnQsIGR1cik7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbmV3IFJlc3RTeW1ib2xbXSB7IHIxIH07XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5Eb3R0ZWRIYWxmOlxyXG4gICAgICAgICAgICAgICAgICAgIHIxID0gbmV3IFJlc3RTeW1ib2woc3RhcnQsIE5vdGVEdXJhdGlvbi5IYWxmKTtcclxuICAgICAgICAgICAgICAgICAgICByMiA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0ICsgdGltZS5RdWFydGVyICogMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5vdGVEdXJhdGlvbi5RdWFydGVyKTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBuZXcgUmVzdFN5bWJvbFtdIHsgcjEsIHIyIH07XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5Eb3R0ZWRRdWFydGVyOlxyXG4gICAgICAgICAgICAgICAgICAgIHIxID0gbmV3IFJlc3RTeW1ib2woc3RhcnQsIE5vdGVEdXJhdGlvbi5RdWFydGVyKTtcclxuICAgICAgICAgICAgICAgICAgICByMiA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0ICsgdGltZS5RdWFydGVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTm90ZUR1cmF0aW9uLkVpZ2h0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbmV3IFJlc3RTeW1ib2xbXSB7IHIxLCByMiB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoOlxyXG4gICAgICAgICAgICAgICAgICAgIHIxID0gbmV3IFJlc3RTeW1ib2woc3RhcnQsIE5vdGVEdXJhdGlvbi5FaWdodGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHIyID0gbmV3IFJlc3RTeW1ib2woc3RhcnQgKyB0aW1lLlF1YXJ0ZXIgLyAyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTm90ZUR1cmF0aW9uLlNpeHRlZW50aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbmV3IFJlc3RTeW1ib2xbXSB7IHIxLCByMiB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFRoZSBjdXJyZW50IGNsZWYgaXMgYWx3YXlzIHNob3duIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIHN0YWZmLCBvblxuICAgICAgICAgKiB0aGUgbGVmdCBzaWRlLiAgSG93ZXZlciwgdGhlIGNsZWYgY2FuIGFsc28gY2hhbmdlIGZyb20gbWVhc3VyZSB0byBcbiAgICAgICAgICogbWVhc3VyZS4gV2hlbiBpdCBkb2VzLCBhIENsZWYgc3ltYm9sIG11c3QgYmUgc2hvd24gdG8gaW5kaWNhdGUgdGhlIFxuICAgICAgICAgKiBjaGFuZ2UgaW4gY2xlZi4gIFRoaXMgZnVuY3Rpb24gYWRkcyB0aGVzZSBDbGVmIGNoYW5nZSBzeW1ib2xzLlxuICAgICAgICAgKiBUaGlzIGZ1bmN0aW9uIGRvZXMgbm90IGFkZCB0aGUgbWFpbiBDbGVmIFN5bWJvbCB0aGF0IGJlZ2lucyBlYWNoXG4gICAgICAgICAqIHN0YWZmLiAgVGhhdCBpcyBkb25lIGluIHRoZSBTdGFmZigpIGNvbnRydWN0b3IuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGVcclxuICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiBBZGRDbGVmQ2hhbmdlcyhMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENsZWZNZWFzdXJlcyBjbGVmcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUaW1lU2lnbmF0dXJlIHRpbWUpXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD4gcmVzdWx0ID0gbmV3IExpc3Q8TXVzaWNTeW1ib2w+KHN5bWJvbHMuQ291bnQpO1xyXG4gICAgICAgICAgICBDbGVmIHByZXZjbGVmID0gY2xlZnMuR2V0Q2xlZigwKTtcclxuICAgICAgICAgICAgZm9yZWFjaCAoTXVzaWNTeW1ib2wgc3ltYm9sIGluIHN5bWJvbHMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIC8qIEEgQmFyU3ltYm9sIGluZGljYXRlcyBhIG5ldyBtZWFzdXJlICovXHJcbiAgICAgICAgICAgICAgICBpZiAoc3ltYm9sIGlzIEJhclN5bWJvbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBDbGVmIGNsZWYgPSBjbGVmcy5HZXRDbGVmKHN5bWJvbC5TdGFydFRpbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjbGVmICE9IHByZXZjbGVmKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LkFkZChuZXcgQ2xlZlN5bWJvbChjbGVmLCBzeW1ib2wuU3RhcnRUaW1lIC0gMSwgdHJ1ZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBwcmV2Y2xlZiA9IGNsZWY7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXN1bHQuQWRkKHN5bWJvbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogTm90ZXMgd2l0aCB0aGUgc2FtZSBzdGFydCB0aW1lcyBpbiBkaWZmZXJlbnQgc3RhZmZzIHNob3VsZCBiZVxuICAgICAgICAgKiB2ZXJ0aWNhbGx5IGFsaWduZWQuICBUaGUgU3ltYm9sV2lkdGhzIGNsYXNzIGlzIHVzZWQgdG8gaGVscCBcbiAgICAgICAgICogdmVydGljYWxseSBhbGlnbiBzeW1ib2xzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBGaXJzdCwgZWFjaCB0cmFjayBzaG91bGQgaGF2ZSBhIHN5bWJvbCBmb3IgZXZlcnkgc3RhcnR0aW1lIHRoYXRcbiAgICAgICAgICogYXBwZWFycyBpbiB0aGUgTWlkaSBGaWxlLiAgSWYgYSB0cmFjayBkb2Vzbid0IGhhdmUgYSBzeW1ib2wgZm9yIGFcbiAgICAgICAgICogcGFydGljdWxhciBzdGFydHRpbWUsIHRoZW4gYWRkIGEgXCJibGFua1wiIHN5bWJvbCBmb3IgdGhhdCB0aW1lLlxuICAgICAgICAgKlxuICAgICAgICAgKiBOZXh0LCBtYWtlIHN1cmUgdGhlIHN5bWJvbHMgZm9yIGVhY2ggc3RhcnQgdGltZSBhbGwgaGF2ZSB0aGUgc2FtZVxuICAgICAgICAgKiB3aWR0aCwgYWNyb3NzIGFsbCB0cmFja3MuICBUaGUgU3ltYm9sV2lkdGhzIGNsYXNzIHN0b3Jlc1xuICAgICAgICAgKiAtIFRoZSBzeW1ib2wgd2lkdGggZm9yIGVhY2ggc3RhcnR0aW1lLCBmb3IgZWFjaCB0cmFja1xuICAgICAgICAgKiAtIFRoZSBtYXhpbXVtIHN5bWJvbCB3aWR0aCBmb3IgYSBnaXZlbiBzdGFydHRpbWUsIGFjcm9zcyBhbGwgdHJhY2tzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBUaGUgbWV0aG9kIFN5bWJvbFdpZHRocy5HZXRFeHRyYVdpZHRoKCkgcmV0dXJucyB0aGUgZXh0cmEgd2lkdGhcbiAgICAgICAgICogbmVlZGVkIGZvciBhIHRyYWNrIHRvIG1hdGNoIHRoZSBtYXhpbXVtIHN5bWJvbCB3aWR0aCBmb3IgYSBnaXZlblxuICAgICAgICAgKiBzdGFydHRpbWUuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGVcclxuICAgICAgICB2b2lkIEFsaWduU3ltYm9scyhMaXN0PE11c2ljU3ltYm9sPltdIGFsbHN5bWJvbHMsIFN5bWJvbFdpZHRocyB3aWR0aHMsIE1pZGlPcHRpb25zIG9wdGlvbnMpXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgd2Ugc2hvdyBtZWFzdXJlIG51bWJlcnMsIGluY3JlYXNlIGJhciBzeW1ib2wgd2lkdGhcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuc2hvd01lYXN1cmVzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCB0cmFjayA9IDA7IHRyYWNrIDwgYWxsc3ltYm9scy5MZW5ndGg7IHRyYWNrKyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scyA9IGFsbHN5bWJvbHNbdHJhY2tdO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHN5bSBpbiBzeW1ib2xzKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN5bSBpcyBCYXJTeW1ib2wpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN5bS5XaWR0aCArPSBTaGVldE11c2ljLk5vdGVXaWR0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2sgPSAwOyB0cmFjayA8IGFsbHN5bWJvbHMuTGVuZ3RoOyB0cmFjaysrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzID0gYWxsc3ltYm9sc1t0cmFja107XHJcbiAgICAgICAgICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiByZXN1bHQgPSBuZXcgTGlzdDxNdXNpY1N5bWJvbD4oKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpbnQgaSA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgLyogSWYgYSB0cmFjayBkb2Vzbid0IGhhdmUgYSBzeW1ib2wgZm9yIGEgc3RhcnR0aW1lLFxyXG4gICAgICAgICAgICAgICAgICogYWRkIGEgYmxhbmsgc3ltYm9sLlxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChpbnQgc3RhcnQgaW4gd2lkdGhzLlN0YXJ0VGltZXMpXHJcbiAgICAgICAgICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8qIEJhclN5bWJvbHMgYXJlIG5vdCBpbmNsdWRlZCBpbiB0aGUgU3ltYm9sV2lkdGhzIGNhbGN1bGF0aW9ucyAqL1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgc3ltYm9scy5Db3VudCAmJiAoc3ltYm9sc1tpXSBpcyBCYXJTeW1ib2wpICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN5bWJvbHNbaV0uU3RhcnRUaW1lIDw9IHN0YXJ0KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LkFkZChzeW1ib2xzW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPCBzeW1ib2xzLkNvdW50ICYmIHN5bWJvbHNbaV0uU3RhcnRUaW1lID09IHN0YXJ0KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgc3ltYm9scy5Db3VudCAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ltYm9sc1tpXS5TdGFydFRpbWUgPT0gc3RhcnQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuQWRkKHN5bWJvbHNbaV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5BZGQobmV3IEJsYW5rU3ltYm9sKHN0YXJ0LCAwKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8qIEZvciBlYWNoIHN0YXJ0dGltZSwgaW5jcmVhc2UgdGhlIHN5bWJvbCB3aWR0aCBieVxyXG4gICAgICAgICAgICAgICAgICogU3ltYm9sV2lkdGhzLkdldEV4dHJhV2lkdGgoKS5cclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgaSA9IDA7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoaSA8IHJlc3VsdC5Db3VudClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0W2ldIGlzIEJhclN5bWJvbClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGludCBzdGFydCA9IHJlc3VsdFtpXS5TdGFydFRpbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IGV4dHJhID0gd2lkdGhzLkdldEV4dHJhV2lkdGgodHJhY2ssIHN0YXJ0KTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRbaV0uV2lkdGggKz0gZXh0cmE7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8qIFNraXAgYWxsIHJlbWFpbmluZyBzeW1ib2xzIHdpdGggdGhlIHNhbWUgc3RhcnR0aW1lLiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgcmVzdWx0LkNvdW50ICYmIHJlc3VsdFtpXS5TdGFydFRpbWUgPT0gc3RhcnQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYWxsc3ltYm9sc1t0cmFja10gPSByZXN1bHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGJvb2wgSXNDaG9yZChNdXNpY1N5bWJvbCBzeW1ib2wpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gc3ltYm9sIGlzIENob3JkU3ltYm9sO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBGaW5kIDIsIDMsIDQsIG9yIDYgY2hvcmQgc3ltYm9scyB0aGF0IG9jY3VyIGNvbnNlY3V0aXZlbHkgKHdpdGhvdXQgYW55XG4gICAgICAgICAqICByZXN0cyBvciBiYXJzIGluIGJldHdlZW4pLiAgVGhlcmUgY2FuIGJlIEJsYW5rU3ltYm9scyBpbiBiZXR3ZWVuLlxuICAgICAgICAgKlxuICAgICAgICAgKiAgVGhlIHN0YXJ0SW5kZXggaXMgdGhlIGluZGV4IGluIHRoZSBzeW1ib2xzIHRvIHN0YXJ0IGxvb2tpbmcgZnJvbS5cbiAgICAgICAgICpcbiAgICAgICAgICogIFN0b3JlIHRoZSBpbmRleGVzIG9mIHRoZSBjb25zZWN1dGl2ZSBjaG9yZHMgaW4gY2hvcmRJbmRleGVzLlxuICAgICAgICAgKiAgU3RvcmUgdGhlIGhvcml6b250YWwgZGlzdGFuY2UgKHBpeGVscykgYmV0d2VlbiB0aGUgZmlyc3QgYW5kIGxhc3QgY2hvcmQuXG4gICAgICAgICAqICBJZiB3ZSBmYWlsZWQgdG8gZmluZCBjb25zZWN1dGl2ZSBjaG9yZHMsIHJldHVybiBmYWxzZS5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgYm9vbFxyXG4gICAgICAgIEZpbmRDb25zZWN1dGl2ZUNob3JkcyhMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzLCBUaW1lU2lnbmF0dXJlIHRpbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludCBzdGFydEluZGV4LCBpbnRbXSBjaG9yZEluZGV4ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZiBpbnQgaG9yaXpEaXN0YW5jZSlcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICBpbnQgaSA9IHN0YXJ0SW5kZXg7XHJcbiAgICAgICAgICAgIGludCBudW1DaG9yZHMgPSBjaG9yZEluZGV4ZXMuTGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgd2hpbGUgKHRydWUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGhvcml6RGlzdGFuY2UgPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qIEZpbmQgdGhlIHN0YXJ0aW5nIGNob3JkICovXHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoaSA8IHN5bWJvbHMuQ291bnQgLSBudW1DaG9yZHMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN5bWJvbHNbaV0gaXMgQ2hvcmRTeW1ib2wpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBDaG9yZFN5bWJvbCBjID0gKENob3JkU3ltYm9sKXN5bWJvbHNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjLlN0ZW0gIT0gbnVsbClcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGkgPj0gc3ltYm9scy5Db3VudCAtIG51bUNob3JkcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjaG9yZEluZGV4ZXNbMF0gPSAtMTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjaG9yZEluZGV4ZXNbMF0gPSBpO1xyXG4gICAgICAgICAgICAgICAgYm9vbCBmb3VuZENob3JkcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCBjaG9yZEluZGV4ID0gMTsgY2hvcmRJbmRleCA8IG51bUNob3JkczsgY2hvcmRJbmRleCsrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgICAgICBpbnQgcmVtYWluaW5nID0gbnVtQ2hvcmRzIC0gMSAtIGNob3JkSW5kZXg7XHJcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKChpIDwgc3ltYm9scy5Db3VudCAtIHJlbWFpbmluZykgJiYgKHN5bWJvbHNbaV0gaXMgQmxhbmtTeW1ib2wpKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaG9yaXpEaXN0YW5jZSArPSBzeW1ib2xzW2ldLldpZHRoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpID49IHN5bWJvbHMuQ291bnQgLSByZW1haW5pbmcpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghKHN5bWJvbHNbaV0gaXMgQ2hvcmRTeW1ib2wpKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmRDaG9yZHMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNob3JkSW5kZXhlc1tjaG9yZEluZGV4XSA9IGk7XHJcbiAgICAgICAgICAgICAgICAgICAgaG9yaXpEaXN0YW5jZSArPSBzeW1ib2xzW2ldLldpZHRoO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGZvdW5kQ2hvcmRzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8qIEVsc2UsIHN0YXJ0IHNlYXJjaGluZyBhZ2FpbiBmcm9tIGluZGV4IGkgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBDb25uZWN0IGNob3JkcyBvZiB0aGUgc2FtZSBkdXJhdGlvbiB3aXRoIGEgaG9yaXpvbnRhbCBiZWFtLlxuICAgICAgICAgKiAgbnVtQ2hvcmRzIGlzIHRoZSBudW1iZXIgb2YgY2hvcmRzIHBlciBiZWFtICgyLCAzLCA0LCBvciA2KS5cbiAgICAgICAgICogIGlmIHN0YXJ0QmVhdCBpcyB0cnVlLCB0aGUgZmlyc3QgY2hvcmQgbXVzdCBzdGFydCBvbiBhIHF1YXJ0ZXIgbm90ZSBiZWF0LlxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkXHJcbiAgICAgICAgQ3JlYXRlQmVhbWVkQ2hvcmRzKExpc3Q8TXVzaWNTeW1ib2w+W10gYWxsc3ltYm9scywgVGltZVNpZ25hdHVyZSB0aW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBpbnQgbnVtQ2hvcmRzLCBib29sIHN0YXJ0QmVhdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGludFtdIGNob3JkSW5kZXhlcyA9IG5ldyBpbnRbbnVtQ2hvcmRzXTtcclxuICAgICAgICAgICAgQ2hvcmRTeW1ib2xbXSBjaG9yZHMgPSBuZXcgQ2hvcmRTeW1ib2xbbnVtQ2hvcmRzXTtcclxuXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKExpc3Q8TXVzaWNTeW1ib2w+IHN5bWJvbHMgaW4gYWxsc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IHN0YXJ0SW5kZXggPSAwO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKHRydWUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IGhvcml6RGlzdGFuY2UgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGJvb2wgZm91bmQgPSBGaW5kQ29uc2VjdXRpdmVDaG9yZHMoc3ltYm9scywgdGltZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0SW5kZXgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaG9yZEluZGV4ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWYgaG9yaXpEaXN0YW5jZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFmb3VuZClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IG51bUNob3JkczsgaSsrKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hvcmRzW2ldID0gKENob3JkU3ltYm9sKXN5bWJvbHNbY2hvcmRJbmRleGVzW2ldXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChDaG9yZFN5bWJvbC5DYW5DcmVhdGVCZWFtKGNob3JkcywgdGltZSwgc3RhcnRCZWF0KSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIENob3JkU3ltYm9sLkNyZWF0ZUJlYW0oY2hvcmRzLCBob3JpekRpc3RhbmNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRJbmRleCA9IGNob3JkSW5kZXhlc1tudW1DaG9yZHMgLSAxXSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0SW5kZXggPSBjaG9yZEluZGV4ZXNbMF0gKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLyogV2hhdCBpcyB0aGUgdmFsdWUgb2Ygc3RhcnRJbmRleCBoZXJlP1xyXG4gICAgICAgICAgICAgICAgICAgICAqIElmIHdlIGNyZWF0ZWQgYSBiZWFtLCB3ZSBzdGFydCBhZnRlciB0aGUgbGFzdCBjaG9yZC5cclxuICAgICAgICAgICAgICAgICAgICAgKiBJZiB3ZSBmYWlsZWQgdG8gY3JlYXRlIGEgYmVhbSwgd2Ugc3RhcnQgYWZ0ZXIgdGhlIGZpcnN0IGNob3JkLlxyXG4gICAgICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIENvbm5lY3QgY2hvcmRzIG9mIHRoZSBzYW1lIGR1cmF0aW9uIHdpdGggYSBob3Jpem9udGFsIGJlYW0uXG4gICAgICAgICAqXG4gICAgICAgICAqICBXZSBjcmVhdGUgYmVhbXMgaW4gdGhlIGZvbGxvd2luZyBvcmRlcjpcbiAgICAgICAgICogIC0gNiBjb25uZWN0ZWQgOHRoIG5vdGUgY2hvcmRzLCBpbiAzLzQsIDYvOCwgb3IgNi80IHRpbWVcbiAgICAgICAgICogIC0gVHJpcGxldHMgdGhhdCBzdGFydCBvbiBxdWFydGVyIG5vdGUgYmVhdHNcbiAgICAgICAgICogIC0gMyBjb25uZWN0ZWQgY2hvcmRzIHRoYXQgc3RhcnQgb24gcXVhcnRlciBub3RlIGJlYXRzICgxMi84IHRpbWUgb25seSlcbiAgICAgICAgICogIC0gNCBjb25uZWN0ZWQgY2hvcmRzIHRoYXQgc3RhcnQgb24gcXVhcnRlciBub3RlIGJlYXRzICg0LzQgb3IgMi80IHRpbWUgb25seSlcbiAgICAgICAgICogIC0gMiBjb25uZWN0ZWQgY2hvcmRzIHRoYXQgc3RhcnQgb24gcXVhcnRlciBub3RlIGJlYXRzXG4gICAgICAgICAqICAtIDIgY29ubmVjdGVkIGNob3JkcyB0aGF0IHN0YXJ0IG9uIGFueSBiZWF0XG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWRcclxuICAgICAgICBDcmVhdGVBbGxCZWFtZWRDaG9yZHMoTGlzdDxNdXNpY1N5bWJvbD5bXSBhbGxzeW1ib2xzLCBUaW1lU2lnbmF0dXJlIHRpbWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoKHRpbWUuTnVtZXJhdG9yID09IDMgJiYgdGltZS5EZW5vbWluYXRvciA9PSA0KSB8fFxyXG4gICAgICAgICAgICAgICAgKHRpbWUuTnVtZXJhdG9yID09IDYgJiYgdGltZS5EZW5vbWluYXRvciA9PSA4KSB8fFxyXG4gICAgICAgICAgICAgICAgKHRpbWUuTnVtZXJhdG9yID09IDYgJiYgdGltZS5EZW5vbWluYXRvciA9PSA0KSlcclxuICAgICAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgICAgIENyZWF0ZUJlYW1lZENob3JkcyhhbGxzeW1ib2xzLCB0aW1lLCA2LCB0cnVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBDcmVhdGVCZWFtZWRDaG9yZHMoYWxsc3ltYm9scywgdGltZSwgMywgdHJ1ZSk7XHJcbiAgICAgICAgICAgIENyZWF0ZUJlYW1lZENob3JkcyhhbGxzeW1ib2xzLCB0aW1lLCA0LCB0cnVlKTtcclxuICAgICAgICAgICAgQ3JlYXRlQmVhbWVkQ2hvcmRzKGFsbHN5bWJvbHMsIHRpbWUsIDIsIHRydWUpO1xyXG4gICAgICAgICAgICBDcmVhdGVCZWFtZWRDaG9yZHMoYWxsc3ltYm9scywgdGltZSwgMiwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIEdldCB0aGUgd2lkdGggKGluIHBpeGVscykgbmVlZGVkIHRvIGRpc3BsYXkgdGhlIGtleSBzaWduYXR1cmUgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGludFxyXG4gICAgICAgIEtleVNpZ25hdHVyZVdpZHRoKEtleVNpZ25hdHVyZSBrZXkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBDbGVmU3ltYm9sIGNsZWZzeW0gPSBuZXcgQ2xlZlN5bWJvbChDbGVmLlRyZWJsZSwgMCwgZmFsc2UpO1xyXG4gICAgICAgICAgICBpbnQgcmVzdWx0ID0gY2xlZnN5bS5NaW5XaWR0aDtcclxuICAgICAgICAgICAgQWNjaWRTeW1ib2xbXSBrZXlzID0ga2V5LkdldFN5bWJvbHMoQ2xlZi5UcmVibGUpO1xyXG4gICAgICAgICAgICBmb3JlYWNoIChBY2NpZFN5bWJvbCBzeW1ib2wgaW4ga2V5cylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHN5bWJvbC5NaW5XaWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0ICsgU2hlZXRNdXNpYy5MZWZ0TWFyZ2luICsgNTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogR2l2ZW4gTXVzaWNTeW1ib2xzIGZvciBhIHRyYWNrLCBjcmVhdGUgdGhlIHN0YWZmcyBmb3IgdGhhdCB0cmFjay5cbiAgICAgICAgICogIEVhY2ggU3RhZmYgaGFzIGEgbWF4bWltdW0gd2lkdGggb2YgUGFnZVdpZHRoICg4MDAgcGl4ZWxzKS5cbiAgICAgICAgICogIEFsc28sIG1lYXN1cmVzIHNob3VsZCBub3Qgc3BhbiBtdWx0aXBsZSBTdGFmZnMuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgTGlzdDxTdGFmZj5cclxuICAgICAgICBDcmVhdGVTdGFmZnNGb3JUcmFjayhMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzLCBpbnQgbWVhc3VyZWxlbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBLZXlTaWduYXR1cmUga2V5LCBNaWRpT3B0aW9ucyBvcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludCB0cmFjaywgaW50IHRvdGFsdHJhY2tzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW50IGtleXNpZ1dpZHRoID0gS2V5U2lnbmF0dXJlV2lkdGgoa2V5KTtcclxuICAgICAgICAgICAgaW50IHN0YXJ0aW5kZXggPSAwO1xyXG4gICAgICAgICAgICBMaXN0PFN0YWZmPiB0aGVzdGFmZnMgPSBuZXcgTGlzdDxTdGFmZj4oc3ltYm9scy5Db3VudCAvIDUwKTtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlIChzdGFydGluZGV4IDwgc3ltYm9scy5Db3VudClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgLyogc3RhcnRpbmRleCBpcyB0aGUgaW5kZXggb2YgdGhlIGZpcnN0IHN5bWJvbCBpbiB0aGUgc3RhZmYuXHJcbiAgICAgICAgICAgICAgICAgKiBlbmRpbmRleCBpcyB0aGUgaW5kZXggb2YgdGhlIGxhc3Qgc3ltYm9sIGluIHRoZSBzdGFmZi5cclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgaW50IGVuZGluZGV4ID0gc3RhcnRpbmRleDtcclxuICAgICAgICAgICAgICAgIGludCB3aWR0aCA9IGtleXNpZ1dpZHRoO1xyXG4gICAgICAgICAgICAgICAgaW50IG1heHdpZHRoO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qIElmIHdlJ3JlIHNjcm9sbGluZyB2ZXJ0aWNhbGx5LCB0aGUgbWF4aW11bSB3aWR0aCBpcyBQYWdlV2lkdGguICovXHJcbiAgICAgICAgICAgICAgICBpZiAoc2Nyb2xsVmVydClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXh3aWR0aCA9IFNoZWV0TXVzaWMuUGFnZVdpZHRoO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG1heHdpZHRoID0gMjAwMDAwMDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoZW5kaW5kZXggPCBzeW1ib2xzLkNvdW50ICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgd2lkdGggKyBzeW1ib2xzW2VuZGluZGV4XS5XaWR0aCA8IG1heHdpZHRoKVxyXG4gICAgICAgICAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB3aWR0aCArPSBzeW1ib2xzW2VuZGluZGV4XS5XaWR0aDtcclxuICAgICAgICAgICAgICAgICAgICBlbmRpbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZW5kaW5kZXgtLTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKiBUaGVyZSdzIDMgcG9zc2liaWxpdGllcyBhdCB0aGlzIHBvaW50OlxyXG4gICAgICAgICAgICAgICAgICogMS4gV2UgaGF2ZSBhbGwgdGhlIHN5bWJvbHMgaW4gdGhlIHRyYWNrLlxyXG4gICAgICAgICAgICAgICAgICogICAgVGhlIGVuZGluZGV4IHN0YXlzIHRoZSBzYW1lLlxyXG4gICAgICAgICAgICAgICAgICpcclxuICAgICAgICAgICAgICAgICAqIDIuIFdlIGhhdmUgc3ltYm9scyBmb3IgbGVzcyB0aGFuIG9uZSBtZWFzdXJlLlxyXG4gICAgICAgICAgICAgICAgICogICAgVGhlIGVuZGluZGV4IHN0YXlzIHRoZSBzYW1lLlxyXG4gICAgICAgICAgICAgICAgICpcclxuICAgICAgICAgICAgICAgICAqIDMuIFdlIGhhdmUgc3ltYm9scyBmb3IgMSBvciBtb3JlIG1lYXN1cmVzLlxyXG4gICAgICAgICAgICAgICAgICogICAgU2luY2UgbWVhc3VyZXMgY2Fubm90IHNwYW4gbXVsdGlwbGUgc3RhZmZzLCB3ZSBtdXN0XHJcbiAgICAgICAgICAgICAgICAgKiAgICBtYWtlIHN1cmUgZW5kaW5kZXggZG9lcyBub3Qgb2NjdXIgaW4gdGhlIG1pZGRsZSBvZiBhXHJcbiAgICAgICAgICAgICAgICAgKiAgICBtZWFzdXJlLiAgV2UgY291bnQgYmFja3dhcmRzIHVudGlsIHdlIGNvbWUgdG8gdGhlIGVuZFxyXG4gICAgICAgICAgICAgICAgICogICAgb2YgYSBtZWFzdXJlLlxyXG4gICAgICAgICAgICAgICAgICovXHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGVuZGluZGV4ID09IHN5bWJvbHMuQ291bnQgLSAxKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGVuZGluZGV4IHN0YXlzIHRoZSBzYW1lICovXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChzeW1ib2xzW3N0YXJ0aW5kZXhdLlN0YXJ0VGltZSAvIG1lYXN1cmVsZW4gPT1cclxuICAgICAgICAgICAgICAgICAgICAgICAgIHN5bWJvbHNbZW5kaW5kZXhdLlN0YXJ0VGltZSAvIG1lYXN1cmVsZW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogZW5kaW5kZXggc3RheXMgdGhlIHNhbWUgKi9cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnQgZW5kbWVhc3VyZSA9IHN5bWJvbHNbZW5kaW5kZXggKyAxXS5TdGFydFRpbWUgLyBtZWFzdXJlbGVuO1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChzeW1ib2xzW2VuZGluZGV4XS5TdGFydFRpbWUgLyBtZWFzdXJlbGVuID09XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZG1lYXN1cmUpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRpbmRleC0tO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGludCByYW5nZSA9IGVuZGluZGV4ICsgMSAtIHN0YXJ0aW5kZXg7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2Nyb2xsVmVydClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IFNoZWV0TXVzaWMuUGFnZVdpZHRoO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgU3RhZmYgc3RhZmYgPSBuZXcgU3RhZmYoc3ltYm9scy5HZXRSYW5nZShzdGFydGluZGV4LCByYW5nZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXksIG9wdGlvbnMsIHRyYWNrLCB0b3RhbHRyYWNrcyk7XHJcbiAgICAgICAgICAgICAgICB0aGVzdGFmZnMuQWRkKHN0YWZmKTtcclxuICAgICAgICAgICAgICAgIHN0YXJ0aW5kZXggPSBlbmRpbmRleCArIDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoZXN0YWZmcztcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogR2l2ZW4gYWxsIHRoZSBNdXNpY1N5bWJvbHMgZm9yIGV2ZXJ5IHRyYWNrLCBjcmVhdGUgdGhlIHN0YWZmc1xuICAgICAgICAgKiBmb3IgdGhlIHNoZWV0IG11c2ljLiAgVGhlcmUgYXJlIHR3byBwYXJ0cyB0byB0aGlzOlxuICAgICAgICAgKlxuICAgICAgICAgKiAtIEdldCB0aGUgbGlzdCBvZiBzdGFmZnMgZm9yIGVhY2ggdHJhY2suXG4gICAgICAgICAqICAgVGhlIHN0YWZmcyB3aWxsIGJlIHN0b3JlZCBpbiB0cmFja3N0YWZmcyBhczpcbiAgICAgICAgICpcbiAgICAgICAgICogICB0cmFja3N0YWZmc1swXSA9IHsgU3RhZmYwLCBTdGFmZjEsIFN0YWZmMiwgLi4uIH0gZm9yIHRyYWNrIDBcbiAgICAgICAgICogICB0cmFja3N0YWZmc1sxXSA9IHsgU3RhZmYwLCBTdGFmZjEsIFN0YWZmMiwgLi4uIH0gZm9yIHRyYWNrIDFcbiAgICAgICAgICogICB0cmFja3N0YWZmc1syXSA9IHsgU3RhZmYwLCBTdGFmZjEsIFN0YWZmMiwgLi4uIH0gZm9yIHRyYWNrIDJcbiAgICAgICAgICpcbiAgICAgICAgICogLSBTdG9yZSB0aGUgU3RhZmZzIGluIHRoZSBzdGFmZnMgbGlzdCwgYnV0IGludGVybGVhdmUgdGhlXG4gICAgICAgICAqICAgdHJhY2tzIGFzIGZvbGxvd3M6XG4gICAgICAgICAqXG4gICAgICAgICAqICAgc3RhZmZzID0geyBTdGFmZjAgZm9yIHRyYWNrIDAsIFN0YWZmMCBmb3IgdHJhY2sxLCBTdGFmZjAgZm9yIHRyYWNrMixcbiAgICAgICAgICogICAgICAgICAgICAgIFN0YWZmMSBmb3IgdHJhY2sgMCwgU3RhZmYxIGZvciB0cmFjazEsIFN0YWZmMSBmb3IgdHJhY2syLFxuICAgICAgICAgKiAgICAgICAgICAgICAgU3RhZmYyIGZvciB0cmFjayAwLCBTdGFmZjIgZm9yIHRyYWNrMSwgU3RhZmYyIGZvciB0cmFjazIsXG4gICAgICAgICAqICAgICAgICAgICAgICAuLi4gfSBcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBMaXN0PFN0YWZmPlxyXG4gICAgICAgIENyZWF0ZVN0YWZmcyhMaXN0PE11c2ljU3ltYm9sPltdIGFsbHN5bWJvbHMsIEtleVNpZ25hdHVyZSBrZXksXHJcbiAgICAgICAgICAgICAgICAgICAgIE1pZGlPcHRpb25zIG9wdGlvbnMsIGludCBtZWFzdXJlbGVuKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIExpc3Q8U3RhZmY+W10gdHJhY2tzdGFmZnMgPSBuZXcgTGlzdDxTdGFmZj5bYWxsc3ltYm9scy5MZW5ndGhdO1xyXG4gICAgICAgICAgICBpbnQgdG90YWx0cmFja3MgPSB0cmFja3N0YWZmcy5MZW5ndGg7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGludCB0cmFjayA9IDA7IHRyYWNrIDwgdG90YWx0cmFja3M7IHRyYWNrKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIExpc3Q8TXVzaWNTeW1ib2w+IHN5bWJvbHMgPSBhbGxzeW1ib2xzW3RyYWNrXTtcclxuICAgICAgICAgICAgICAgIHRyYWNrc3RhZmZzW3RyYWNrXSA9IENyZWF0ZVN0YWZmc0ZvclRyYWNrKHN5bWJvbHMsIG1lYXN1cmVsZW4sIGtleSwgb3B0aW9ucywgdHJhY2ssIHRvdGFsdHJhY2tzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLyogVXBkYXRlIHRoZSBFbmRUaW1lIG9mIGVhY2ggU3RhZmYuIEVuZFRpbWUgaXMgdXNlZCBmb3IgcGxheWJhY2sgKi9cclxuICAgICAgICAgICAgZm9yZWFjaCAoTGlzdDxTdGFmZj4gbGlzdCBpbiB0cmFja3N0YWZmcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBsaXN0LkNvdW50IC0gMTsgaSsrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxpc3RbaV0uRW5kVGltZSA9IGxpc3RbaSArIDFdLlN0YXJ0VGltZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLyogSW50ZXJsZWF2ZSB0aGUgc3RhZmZzIG9mIGVhY2ggdHJhY2sgaW50byB0aGUgcmVzdWx0IGFycmF5LiAqL1xyXG4gICAgICAgICAgICBpbnQgbWF4c3RhZmZzID0gMDtcclxuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCB0cmFja3N0YWZmcy5MZW5ndGg7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1heHN0YWZmcyA8IHRyYWNrc3RhZmZzW2ldLkNvdW50KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG1heHN0YWZmcyA9IHRyYWNrc3RhZmZzW2ldLkNvdW50O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIExpc3Q8U3RhZmY+IHJlc3VsdCA9IG5ldyBMaXN0PFN0YWZmPihtYXhzdGFmZnMgKiB0cmFja3N0YWZmcy5MZW5ndGgpO1xyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IG1heHN0YWZmczsgaSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChMaXN0PFN0YWZmPiBsaXN0IGluIHRyYWNrc3RhZmZzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpIDwgbGlzdC5Db3VudClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5BZGQobGlzdFtpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogR2V0IHRoZSBseXJpY3MgZm9yIGVhY2ggdHJhY2sgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBMaXN0PEx5cmljU3ltYm9sPltdXHJcbiAgICAgICAgR2V0THlyaWNzKExpc3Q8TWlkaVRyYWNrPiB0cmFja3MpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBib29sIGhhc0x5cmljcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBMaXN0PEx5cmljU3ltYm9sPltdIHJlc3VsdCA9IG5ldyBMaXN0PEx5cmljU3ltYm9sPlt0cmFja3MuQ291bnRdO1xyXG4gICAgICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgdHJhY2tzLkNvdW50OyB0cmFja251bSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBNaWRpVHJhY2sgdHJhY2sgPSB0cmFja3NbdHJhY2tudW1dO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRyYWNrLkx5cmljcyA9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaGFzTHlyaWNzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFt0cmFja251bV0gPSBuZXcgTGlzdDxMeXJpY1N5bWJvbD4oKTtcclxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBldiBpbiB0cmFjay5MeXJpY3MpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgU3RyaW5nIHRleHQgPSBVVEY4RW5jb2RpbmcuVVRGOC5HZXRTdHJpbmcoZXYuVmFsdWUsIDAsIGV2LlZhbHVlLkxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgTHlyaWNTeW1ib2wgc3ltID0gbmV3IEx5cmljU3ltYm9sKGV2LlN0YXJ0VGltZSwgdGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W3RyYWNrbnVtXS5BZGQoc3ltKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWhhc0x5cmljcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogQWRkIHRoZSBseXJpYyBzeW1ib2xzIHRvIHRoZSBjb3JyZXNwb25kaW5nIHN0YWZmcyAqL1xyXG4gICAgICAgIHN0YXRpYyB2b2lkXHJcbiAgICAgICAgQWRkTHlyaWNzVG9TdGFmZnMoTGlzdDxTdGFmZj4gc3RhZmZzLCBMaXN0PEx5cmljU3ltYm9sPltdIHRyYWNrbHlyaWNzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yZWFjaCAoU3RhZmYgc3RhZmYgaW4gc3RhZmZzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBMaXN0PEx5cmljU3ltYm9sPiBseXJpY3MgPSB0cmFja2x5cmljc1tzdGFmZi5UcmFja107XHJcbiAgICAgICAgICAgICAgICBzdGFmZi5BZGRMeXJpY3MobHlyaWNzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBTZXQgdGhlIHpvb20gbGV2ZWwgdG8gZGlzcGxheSBhdCAoMS4wID09IDEwMCUpLlxuICAgICAgICAgKiBSZWNhbGN1bGF0ZSB0aGUgU2hlZXRNdXNpYyB3aWR0aCBhbmQgaGVpZ2h0IGJhc2VkIG9uIHRoZVxuICAgICAgICAgKiB6b29tIGxldmVsLiAgVGhlbiByZWRyYXcgdGhlIFNoZWV0TXVzaWMuIFxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgdm9pZCBTZXRab29tKGZsb2F0IHZhbHVlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgem9vbSA9IHZhbHVlO1xyXG4gICAgICAgICAgICBmbG9hdCB3aWR0aCA9IDA7XHJcbiAgICAgICAgICAgIGZsb2F0IGhlaWdodCA9IDA7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKFN0YWZmIHN0YWZmIGluIHN0YWZmcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgd2lkdGggPSBNYXRoLk1heCh3aWR0aCwgc3RhZmYuV2lkdGggKiB6b29tKTtcclxuICAgICAgICAgICAgICAgIGhlaWdodCArPSAoc3RhZmYuSGVpZ2h0ICogem9vbSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgV2lkdGggPSAoaW50KSh3aWR0aCArIDIpO1xyXG4gICAgICAgICAgICBIZWlnaHQgPSAoKGludCloZWlnaHQpICsgTGVmdE1hcmdpbjtcclxuICAgICAgICAgICAgdGhpcy5JbnZhbGlkYXRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogQ2hhbmdlIHRoZSBub3RlIGNvbG9ycyBmb3IgdGhlIHNoZWV0IG11c2ljLCBhbmQgcmVkcmF3LiAqL1xyXG4gICAgICAgIHByaXZhdGUgdm9pZCBTZXRDb2xvcnMoQ29sb3JbXSBuZXdjb2xvcnMsIENvbG9yIG5ld3NoYWRlLCBDb2xvciBuZXdzaGFkZTIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoTm90ZUNvbG9ycyA9PSBudWxsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBOb3RlQ29sb3JzID0gbmV3IENvbG9yWzEyXTtcclxuICAgICAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgMTI7IGkrKylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBOb3RlQ29sb3JzW2ldID0gQ29sb3IuQmxhY2s7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG5ld2NvbG9ycyAhPSBudWxsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDEyOyBpKyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgTm90ZUNvbG9yc1tpXSA9IG5ld2NvbG9yc1tpXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgMTI7IGkrKylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBOb3RlQ29sb3JzW2ldID0gQ29sb3IuQmxhY2s7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHNoYWRlQnJ1c2ggIT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc2hhZGVCcnVzaC5EaXNwb3NlKCk7XHJcbiAgICAgICAgICAgICAgICBzaGFkZTJCcnVzaC5EaXNwb3NlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2hhZGVCcnVzaCA9IG5ldyBTb2xpZEJydXNoKG5ld3NoYWRlKTtcclxuICAgICAgICAgICAgc2hhZGUyQnJ1c2ggPSBuZXcgU29saWRCcnVzaChuZXdzaGFkZTIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIEdldCB0aGUgY29sb3IgZm9yIGEgZ2l2ZW4gbm90ZSBudW1iZXIgKi9cclxuICAgICAgICBwdWJsaWMgQ29sb3IgTm90ZUNvbG9yKGludCBudW1iZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gTm90ZUNvbG9yc1tOb3RlU2NhbGUuRnJvbU51bWJlcihudW1iZXIpXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBHZXQgdGhlIHNoYWRlIGJydXNoICovXHJcbiAgICAgICAgcHVibGljIEJydXNoIFNoYWRlQnJ1c2hcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdldCB7IHJldHVybiBzaGFkZUJydXNoOyB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogR2V0IHRoZSBzaGFkZTIgYnJ1c2ggKi9cclxuICAgICAgICBwdWJsaWMgQnJ1c2ggU2hhZGUyQnJ1c2hcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdldCB7IHJldHVybiBzaGFkZTJCcnVzaDsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIEdldCB3aGV0aGVyIHRvIHNob3cgbm90ZSBsZXR0ZXJzIG9yIG5vdCAqL1xyXG4gICAgICAgIHB1YmxpYyBpbnQgU2hvd05vdGVMZXR0ZXJzXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gc2hvd05vdGVMZXR0ZXJzOyB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogR2V0IHRoZSBtYWluIGtleSBzaWduYXR1cmUgKi9cclxuICAgICAgICBwdWJsaWMgS2V5U2lnbmF0dXJlIE1haW5LZXlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdldCB7IHJldHVybiBtYWlua2V5OyB9XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIFNldCB0aGUgc2l6ZSBvZiB0aGUgbm90ZXMsIGxhcmdlIG9yIHNtYWxsLiAgU21hbGxlciBub3RlcyBtZWFuc1xuICAgICAgICAgKiBtb3JlIG5vdGVzIHBlciBzdGFmZi5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB2b2lkIFNldE5vdGVTaXplKGJvb2wgbGFyZ2Vub3RlcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChsYXJnZW5vdGVzKVxyXG4gICAgICAgICAgICAgICAgTGluZVNwYWNlID0gNztcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgTGluZVNwYWNlID0gNTtcclxuXHJcbiAgICAgICAgICAgIFN0YWZmSGVpZ2h0ID0gTGluZVNwYWNlICogNCArIExpbmVXaWR0aCAqIDU7XHJcbiAgICAgICAgICAgIE5vdGVIZWlnaHQgPSBMaW5lU3BhY2UgKyBMaW5lV2lkdGg7XHJcbiAgICAgICAgICAgIE5vdGVXaWR0aCA9IDMgKiBMaW5lU3BhY2UgLyAyO1xyXG4gICAgICAgICAgICBMZXR0ZXJGb250ID0gbmV3IEZvbnQoXCJBcmlhbFwiLCA4LCBGb250U3R5bGUuUmVndWxhcik7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIERyYXcgdGhlIFNoZWV0TXVzaWMuXG4gICAgICAgICAqIFNjYWxlIHRoZSBncmFwaGljcyBieSB0aGUgY3VycmVudCB6b29tIGZhY3Rvci5cbiAgICAgICAgICogR2V0IHRoZSB2ZXJ0aWNhbCBzdGFydCBhbmQgZW5kIHBvaW50cyBvZiB0aGUgY2xpcCBhcmVhLlxuICAgICAgICAgKiBPbmx5IGRyYXcgU3RhZmZzIHdoaWNoIGxpZSBpbnNpZGUgdGhlIGNsaXAgYXJlYS5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHJvdGVjdGVkIC8qb3ZlcnJpZGUqLyB2b2lkIE9uUGFpbnQoUGFpbnRFdmVudEFyZ3MgZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFJlY3RhbmdsZSBjbGlwID1cclxuICAgICAgICAgICAgICBuZXcgUmVjdGFuZ2xlKChpbnQpKGUuQ2xpcFJlY3RhbmdsZS5YIC8gem9vbSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoaW50KShlLkNsaXBSZWN0YW5nbGUuWSAvIHpvb20pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGludCkoZS5DbGlwUmVjdGFuZ2xlLldpZHRoIC8gem9vbSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoaW50KShlLkNsaXBSZWN0YW5nbGUuSGVpZ2h0IC8gem9vbSkpO1xyXG5cclxuICAgICAgICAgICAgR3JhcGhpY3MgZyA9IGUuR3JhcGhpY3MoKTtcclxuICAgICAgICAgICAgZy5TY2FsZVRyYW5zZm9ybSh6b29tLCB6b29tKTtcclxuICAgICAgICAgICAgLyogZy5QYWdlU2NhbGUgPSB6b29tOyAqL1xyXG4gICAgICAgICAgICBnLlNtb290aGluZ01vZGUgPSBTbW9vdGhpbmdNb2RlLkFudGlBbGlhcztcclxuICAgICAgICAgICAgaW50IHlwb3MgPSAwO1xyXG4gICAgICAgICAgICBmb3JlYWNoIChTdGFmZiBzdGFmZiBpbiBzdGFmZnMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICgoeXBvcyArIHN0YWZmLkhlaWdodCA8IGNsaXAuWSkgfHwgKHlwb3MgPiBjbGlwLlkgKyBjbGlwLkhlaWdodCkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogU3RhZmYgaXMgbm90IGluIHRoZSBjbGlwLCBkb24ndCBuZWVkIHRvIGRyYXcgaXQgKi9cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgwLCB5cG9zKTtcclxuICAgICAgICAgICAgICAgICAgICBzdGFmZi5EcmF3KGcsIGNsaXAsIHBlbiwgU2VsZWN0aW9uU3RhcnRQdWxzZSwgU2VsZWN0aW9uRW5kUHVsc2UsIGRlc2VsZWN0ZWRTaGFkZUJydXNoKTtcclxuICAgICAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgwLCAteXBvcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgeXBvcyArPSBzdGFmZi5IZWlnaHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZy5TY2FsZVRyYW5zZm9ybSgxLjBmIC8gem9vbSwgMS4wZiAvIHpvb20pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFdyaXRlIHRoZSBNSURJIGZpbGVuYW1lIGF0IHRoZSB0b3Agb2YgdGhlIHBhZ2UgKi9cclxuICAgICAgICBwcml2YXRlIHZvaWQgRHJhd1RpdGxlKEdyYXBoaWNzIGcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbnQgbGVmdG1hcmdpbiA9IDIwO1xyXG4gICAgICAgICAgICBpbnQgdG9wbWFyZ2luID0gMjA7XHJcbiAgICAgICAgICAgIHN0cmluZyB0aXRsZSA9IFBhdGguR2V0RmlsZU5hbWUoZmlsZW5hbWUpO1xyXG4gICAgICAgICAgICB0aXRsZSA9IHRpdGxlLlJlcGxhY2UoXCIubWlkXCIsIFwiXCIpLlJlcGxhY2UoXCJfXCIsIFwiIFwiKTtcclxuICAgICAgICAgICAgRm9udCBmb250ID0gbmV3IEZvbnQoXCJBcmlhbFwiLCAxMCwgRm9udFN0eWxlLkJvbGQpO1xyXG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybShsZWZ0bWFyZ2luLCB0b3BtYXJnaW4pO1xyXG4gICAgICAgICAgICBnLkRyYXdTdHJpbmcodGl0bGUsIGZvbnQsIEJydXNoZXMuQmxhY2ssIDAsIDApO1xyXG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtbGVmdG1hcmdpbiwgLXRvcG1hcmdpbik7XHJcbiAgICAgICAgICAgIGZvbnQuRGlzcG9zZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybiB0aGUgbnVtYmVyIG9mIHBhZ2VzIG5lZWRlZCB0byBwcmludCB0aGlzIHNoZWV0IG11c2ljLlxuICAgICAgICAgKiBBIHN0YWZmIHNob3VsZCBmaXQgd2l0aGluIGEgc2luZ2xlIHBhZ2UsIG5vdCBiZSBzcGxpdCBhY3Jvc3MgdHdvIHBhZ2VzLlxuICAgICAgICAgKiBJZiB0aGUgc2hlZXQgbXVzaWMgaGFzIGV4YWN0bHkgMiB0cmFja3MsIHRoZW4gdHdvIHN0YWZmcyBzaG91bGRcbiAgICAgICAgICogZml0IHdpdGhpbiBhIHNpbmdsZSBwYWdlLCBhbmQgbm90IGJlIHNwbGl0IGFjcm9zcyB0d28gcGFnZXMuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBpbnQgR2V0VG90YWxQYWdlcygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbnQgbnVtID0gMTtcclxuICAgICAgICAgICAgaW50IGN1cnJoZWlnaHQgPSBUaXRsZUhlaWdodDtcclxuXHJcbiAgICAgICAgICAgIGlmIChudW10cmFja3MgPT0gMiAmJiAoc3RhZmZzLkNvdW50ICUgMikgPT0gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBzdGFmZnMuQ291bnQ7IGkgKz0gMilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnQgaGVpZ2h0cyA9IHN0YWZmc1tpXS5IZWlnaHQgKyBzdGFmZnNbaSArIDFdLkhlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmhlaWdodCArIGhlaWdodHMgPiBQYWdlSGVpZ2h0KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbnVtKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJoZWlnaHQgPSBoZWlnaHRzO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyaGVpZ2h0ICs9IGhlaWdodHM7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoU3RhZmYgc3RhZmYgaW4gc3RhZmZzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyaGVpZ2h0ICsgc3RhZmYuSGVpZ2h0ID4gUGFnZUhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bSsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyaGVpZ2h0ID0gc3RhZmYuSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyaGVpZ2h0ICs9IHN0YWZmLkhlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG51bTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBTaGFkZSBhbGwgdGhlIGNob3JkcyBwbGF5ZWQgYXQgdGhlIGdpdmVuIHB1bHNlIHRpbWUuXG4gICAgICAgICAqICBMb29wIHRocm91Z2ggYWxsIHRoZSBzdGFmZnMgYW5kIGNhbGwgc3RhZmYuU2hhZGUoKS5cbiAgICAgICAgICogIElmIHNjcm9sbEdyYWR1YWxseSBpcyB0cnVlLCBzY3JvbGwgZ3JhZHVhbGx5IChzbW9vdGggc2Nyb2xsaW5nKVxuICAgICAgICAgKiAgdG8gdGhlIHNoYWRlZCBub3Rlcy5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHZvaWQgU2hhZGVOb3RlcyhpbnQgY3VycmVudFB1bHNlVGltZSwgaW50IHByZXZQdWxzZVRpbWUsIGJvb2wgc2Nyb2xsR3JhZHVhbGx5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgR3JhcGhpY3MgZyA9IENyZWF0ZUdyYXBoaWNzKFwic2hhZGVOb3Rlc1wiKTtcclxuICAgICAgICAgICAgZy5TbW9vdGhpbmdNb2RlID0gU21vb3RoaW5nTW9kZS5BbnRpQWxpYXM7XHJcbiAgICAgICAgICAgIGcuU2NhbGVUcmFuc2Zvcm0oem9vbSwgem9vbSk7XHJcbiAgICAgICAgICAgIGludCB5cG9zID0gMDtcclxuXHJcbiAgICAgICAgICAgIGludCB4X3NoYWRlID0gMDtcclxuICAgICAgICAgICAgaW50IHlfc2hhZGUgPSAwO1xyXG5cclxuICAgICAgICAgICAgZm9yZWFjaCAoU3RhZmYgc3RhZmYgaW4gc3RhZmZzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgwLCB5cG9zKTtcclxuICAgICAgICAgICAgICAgIHN0YWZmLlNoYWRlTm90ZXMoZywgc2hhZGVCcnVzaCwgcGVuLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50UHVsc2VUaW1lLCBwcmV2UHVsc2VUaW1lLCByZWYgeF9zaGFkZSk7XHJcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgwLCAteXBvcyk7XHJcbiAgICAgICAgICAgICAgICB5cG9zICs9IHN0YWZmLkhlaWdodDtcclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50UHVsc2VUaW1lID49IHN0YWZmLkVuZFRpbWUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgeV9zaGFkZSArPSBzdGFmZi5IZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZy5TY2FsZVRyYW5zZm9ybSgxLjBmIC8gem9vbSwgMS4wZiAvIHpvb20pO1xyXG4gICAgICAgICAgICBnLkRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgeF9zaGFkZSA9IChpbnQpKHhfc2hhZGUgKiB6b29tKTtcclxuICAgICAgICAgICAgeV9zaGFkZSAtPSBOb3RlSGVpZ2h0O1xyXG4gICAgICAgICAgICB5X3NoYWRlID0gKGludCkoeV9zaGFkZSAqIHpvb20pO1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudFB1bHNlVGltZSA+PSAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBTY3JvbGxUb1NoYWRlZE5vdGVzKHhfc2hhZGUsIHlfc2hhZGUsIHNjcm9sbEdyYWR1YWxseSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBTY3JvbGwgdGhlIHNoZWV0IG11c2ljIHNvIHRoYXQgdGhlIHNoYWRlZCBub3RlcyBhcmUgdmlzaWJsZS5cbiAgICAgICAgICAqIElmIHNjcm9sbEdyYWR1YWxseSBpcyB0cnVlLCBzY3JvbGwgZ3JhZHVhbGx5IChzbW9vdGggc2Nyb2xsaW5nKVxuICAgICAgICAgICogdG8gdGhlIHNoYWRlZCBub3Rlcy5cbiAgICAgICAgICAqL1xyXG4gICAgICAgIHZvaWQgU2Nyb2xsVG9TaGFkZWROb3RlcyhpbnQgeF9zaGFkZSwgaW50IHlfc2hhZGUsIGJvb2wgc2Nyb2xsR3JhZHVhbGx5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgUGFuZWwgc2Nyb2xsdmlldyA9IChQYW5lbCl0aGlzLlBhcmVudDtcclxuICAgICAgICAgICAgUG9pbnQgc2Nyb2xsUG9zID0gc2Nyb2xsdmlldy5BdXRvU2Nyb2xsUG9zaXRpb247XHJcblxyXG4gICAgICAgICAgICAvKiBUaGUgc2Nyb2xsIHBvc2l0aW9uIGlzIGluIG5lZ2F0aXZlIGNvb3JkaW5hdGVzIGZvciBzb21lIHJlYXNvbiAqL1xyXG4gICAgICAgICAgICBzY3JvbGxQb3MuWCA9IC1zY3JvbGxQb3MuWDtcclxuICAgICAgICAgICAgc2Nyb2xsUG9zLlkgPSAtc2Nyb2xsUG9zLlk7XHJcbiAgICAgICAgICAgIFBvaW50IG5ld1BvcyA9IHNjcm9sbFBvcztcclxuXHJcbiAgICAgICAgICAgIGlmIChzY3JvbGxWZXJ0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgc2Nyb2xsRGlzdCA9IChpbnQpKHlfc2hhZGUgLSBzY3JvbGxQb3MuWSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNjcm9sbEdyYWR1YWxseSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2Nyb2xsRGlzdCA+ICh6b29tICogU3RhZmZIZWlnaHQgKiA4KSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsRGlzdCA9IHNjcm9sbERpc3QgLyAyO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHNjcm9sbERpc3QgPiAoTm90ZUhlaWdodCAqIDMgKiB6b29tKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsRGlzdCA9IChpbnQpKE5vdGVIZWlnaHQgKiAzICogem9vbSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBuZXdQb3MgPSBuZXcgUG9pbnQoc2Nyb2xsUG9zLlgsIHNjcm9sbFBvcy5ZICsgc2Nyb2xsRGlzdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgeF92aWV3ID0gc2Nyb2xsUG9zLlggKyA0MCAqIHNjcm9sbHZpZXcuV2lkdGggLyAxMDA7XHJcbiAgICAgICAgICAgICAgICBpbnQgeG1heCA9IHNjcm9sbFBvcy5YICsgNjUgKiBzY3JvbGx2aWV3LldpZHRoIC8gMTAwO1xyXG4gICAgICAgICAgICAgICAgaW50IHNjcm9sbERpc3QgPSB4X3NoYWRlIC0geF92aWV3O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzY3JvbGxHcmFkdWFsbHkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHhfc2hhZGUgPiB4bWF4KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxEaXN0ID0gKHhfc2hhZGUgLSB4X3ZpZXcpIC8gMztcclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh4X3NoYWRlID4geF92aWV3KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxEaXN0ID0gKHhfc2hhZGUgLSB4X3ZpZXcpIC8gNjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBuZXdQb3MgPSBuZXcgUG9pbnQoc2Nyb2xsUG9zLlggKyBzY3JvbGxEaXN0LCBzY3JvbGxQb3MuWSk7XHJcbiAgICAgICAgICAgICAgICBpZiAobmV3UG9zLlggPCAwKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld1Bvcy5YID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzY3JvbGx2aWV3LkF1dG9TY3JvbGxQb3NpdGlvbiA9IG5ld1BvcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBSZXR1cm4gdGhlIHB1bHNlVGltZSBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlbiBwb2ludCBvbiB0aGUgU2hlZXRNdXNpYy5cbiAgICAgICAgICogIEZpcnN0LCBmaW5kIHRoZSBzdGFmZiBjb3JyZXNwb25kaW5nIHRvIHRoZSBwb2ludC5cbiAgICAgICAgICogIFRoZW4sIHdpdGhpbiB0aGUgc3RhZmYsIGZpbmQgdGhlIG5vdGVzL3N5bWJvbHMgY29ycmVzcG9uZGluZyB0byB0aGUgcG9pbnQsXG4gICAgICAgICAqICBhbmQgcmV0dXJuIHRoZSBTdGFydFRpbWUgKHB1bHNlVGltZSkgb2YgdGhlIHN5bWJvbHMuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBpbnQgUHVsc2VUaW1lRm9yUG9pbnQoUG9pbnQgcG9pbnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBQb2ludCBzY2FsZWRQb2ludCA9IG5ldyBQb2ludCgoaW50KShwb2ludC5YIC8gem9vbSksIChpbnQpKHBvaW50LlkgLyB6b29tKSk7XHJcbiAgICAgICAgICAgIGludCB5ID0gMDtcclxuICAgICAgICAgICAgZm9yZWFjaCAoU3RhZmYgc3RhZmYgaW4gc3RhZmZzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2NhbGVkUG9pbnQuWSA+PSB5ICYmIHNjYWxlZFBvaW50LlkgPD0geSArIHN0YWZmLkhlaWdodClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhZmYuUHVsc2VUaW1lRm9yUG9pbnQoc2NhbGVkUG9pbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgeSArPSBzdGFmZi5IZWlnaHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzdHJpbmcgcmVzdWx0ID0gXCJTaGVldE11c2ljIHN0YWZmcz1cIiArIHN0YWZmcy5Db3VudCArIFwiXFxuXCI7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKFN0YWZmIHN0YWZmIGluIHN0YWZmcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHN0YWZmLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzdWx0ICs9IFwiRW5kIFNoZWV0TXVzaWNcXG5cIjtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxuXG59XG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgU29saWRCcnVzaDpCcnVzaFxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBTb2xpZEJydXNoKENvbG9yIGNvbG9yKTpcclxuICAgICAgICAgICAgYmFzZShjb2xvcilcclxuICAgICAgICB7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMSBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIEBjbGFzcyBUaW1lU2lnU3ltYm9sXG4gKiBBIFRpbWVTaWdTeW1ib2wgcmVwcmVzZW50cyB0aGUgdGltZSBzaWduYXR1cmUgYXQgdGhlIGJlZ2lubmluZ1xuICogb2YgdGhlIHN0YWZmLiBXZSB1c2UgcHJlLW1hZGUgaW1hZ2VzIGZvciB0aGUgbnVtYmVycywgaW5zdGVhZCBvZlxuICogZHJhd2luZyBzdHJpbmdzLlxuICovXG5cbnB1YmxpYyBjbGFzcyBUaW1lU2lnU3ltYm9sIDogTXVzaWNTeW1ib2wge1xuICAgIHByaXZhdGUgc3RhdGljIEltYWdlW10gaW1hZ2VzOyAgLyoqIFRoZSBpbWFnZXMgZm9yIGVhY2ggbnVtYmVyICovXG4gICAgcHJpdmF0ZSBpbnQgIG51bWVyYXRvcjsgICAgICAgICAvKiogVGhlIG51bWVyYXRvciAqL1xuICAgIHByaXZhdGUgaW50ICBkZW5vbWluYXRvcjsgICAgICAgLyoqIFRoZSBkZW5vbWluYXRvciAqL1xuICAgIHByaXZhdGUgaW50ICB3aWR0aDsgICAgICAgICAgICAgLyoqIFRoZSB3aWR0aCBpbiBwaXhlbHMgKi9cbiAgICBwcml2YXRlIGJvb2wgY2FuZHJhdzsgICAgICAgICAgIC8qKiBUcnVlIGlmIHdlIGNhbiBkcmF3IHRoZSB0aW1lIHNpZ25hdHVyZSAqL1xuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBUaW1lU2lnU3ltYm9sICovXG4gICAgcHVibGljIFRpbWVTaWdTeW1ib2woaW50IG51bWVyLCBpbnQgZGVub20pIHtcbiAgICAgICAgbnVtZXJhdG9yID0gbnVtZXI7XG4gICAgICAgIGRlbm9taW5hdG9yID0gZGVub207XG4gICAgICAgIExvYWRJbWFnZXMoKTtcbiAgICAgICAgaWYgKG51bWVyID49IDAgJiYgbnVtZXIgPCBpbWFnZXMuTGVuZ3RoICYmIGltYWdlc1tudW1lcl0gIT0gbnVsbCAmJlxuICAgICAgICAgICAgZGVub20gPj0gMCAmJiBkZW5vbSA8IGltYWdlcy5MZW5ndGggJiYgaW1hZ2VzW251bWVyXSAhPSBudWxsKSB7XG4gICAgICAgICAgICBjYW5kcmF3ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNhbmRyYXcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB3aWR0aCA9IE1pbldpZHRoO1xuICAgIH1cblxuICAgIC8qKiBMb2FkIHRoZSBpbWFnZXMgaW50byBtZW1vcnkuICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBMb2FkSW1hZ2VzKCkge1xuICAgICAgICBpZiAoaW1hZ2VzID09IG51bGwpIHtcbiAgICAgICAgICAgIGltYWdlcyA9IG5ldyBJbWFnZVsxM107XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDEzOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpbWFnZXNbaV0gPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW1hZ2VzWzJdID0gbmV3IEJpdG1hcCh0eXBlb2YoVGltZVNpZ1N5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy50d28ucG5nXCIpO1xuICAgICAgICAgICAgaW1hZ2VzWzNdID0gbmV3IEJpdG1hcCh0eXBlb2YoVGltZVNpZ1N5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy50aHJlZS5wbmdcIik7XG4gICAgICAgICAgICBpbWFnZXNbNF0gPSBuZXcgQml0bWFwKHR5cGVvZihUaW1lU2lnU3ltYm9sKSwgXCJSZXNvdXJjZXMuSW1hZ2VzLmZvdXIucG5nXCIpO1xuICAgICAgICAgICAgaW1hZ2VzWzZdID0gbmV3IEJpdG1hcCh0eXBlb2YoVGltZVNpZ1N5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy5zaXgucG5nXCIpO1xuICAgICAgICAgICAgaW1hZ2VzWzhdID0gbmV3IEJpdG1hcCh0eXBlb2YoVGltZVNpZ1N5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy5laWdodC5wbmdcIik7XG4gICAgICAgICAgICBpbWFnZXNbOV0gPSBuZXcgQml0bWFwKHR5cGVvZihUaW1lU2lnU3ltYm9sKSwgXCJSZXNvdXJjZXMuSW1hZ2VzLm5pbmUucG5nXCIpO1xuICAgICAgICAgICAgaW1hZ2VzWzEyXSA9IG5ldyBCaXRtYXAodHlwZW9mKFRpbWVTaWdTeW1ib2wpLCBcIlJlc291cmNlcy5JbWFnZXMudHdlbHZlLnBuZ1wiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIHRpbWUgKGluIHB1bHNlcykgdGhpcyBzeW1ib2wgb2NjdXJzIGF0LiAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgU3RhcnRUaW1lIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIC0xOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbWluaW11bSB3aWR0aCAoaW4gcGl4ZWxzKSBuZWVkZWQgdG8gZHJhdyB0aGlzIHN5bWJvbCAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgTWluV2lkdGgge1xuICAgICAgICBnZXQgeyBpZiAoY2FuZHJhdykgXG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW1hZ2VzWzJdLldpZHRoICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMiAvaW1hZ2VzWzJdLkhlaWdodDtcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEdldC9TZXQgdGhlIHdpZHRoIChpbiBwaXhlbHMpIG9mIHRoaXMgc3ltYm9sLiBUaGUgd2lkdGggaXMgc2V0XG4gICAgICogaW4gU2hlZXRNdXNpYy5BbGlnblN5bWJvbHMoKSB0byB2ZXJ0aWNhbGx5IGFsaWduIHN5bWJvbHMuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBXaWR0aCB7XG4gICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgc2V0IHsgd2lkdGggPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBhYm92ZSB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBBYm92ZVN0YWZmIHsgXG4gICAgICAgIGdldCB7ICByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBiZWxvdyB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBCZWxvd1N0YWZmIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIDA7IH0gXG4gICAgfVxuXG4gICAgLyoqIERyYXcgdGhlIHN5bWJvbC5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgXG4gICAgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIGlmICghY2FuZHJhdylcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybShXaWR0aCAtIE1pbldpZHRoLCAwKTtcbiAgICAgICAgSW1hZ2UgbnVtZXIgPSBpbWFnZXNbbnVtZXJhdG9yXTtcbiAgICAgICAgSW1hZ2UgZGVub20gPSBpbWFnZXNbZGVub21pbmF0b3JdO1xuXG4gICAgICAgIC8qIFNjYWxlIHRoZSBpbWFnZSB3aWR0aCB0byBtYXRjaCB0aGUgaGVpZ2h0ICovXG4gICAgICAgIGludCBpbWdoZWlnaHQgPSBTaGVldE11c2ljLk5vdGVIZWlnaHQgKiAyO1xuICAgICAgICBpbnQgaW1nd2lkdGggPSBudW1lci5XaWR0aCAqIGltZ2hlaWdodCAvIG51bWVyLkhlaWdodDtcbiAgICAgICAgZy5EcmF3SW1hZ2UobnVtZXIsIDAsIHl0b3AsIGltZ3dpZHRoLCBpbWdoZWlnaHQpO1xuICAgICAgICBnLkRyYXdJbWFnZShkZW5vbSwgMCwgeXRvcCArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyLCBpbWd3aWR0aCwgaW1naGVpZ2h0KTtcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShXaWR0aCAtIE1pbldpZHRoKSwgMCk7XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJUaW1lU2lnU3ltYm9sIG51bWVyYXRvcj17MH0gZGVub21pbmF0b3I9ezF9XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWVyYXRvciwgZGVub21pbmF0b3IpO1xuICAgIH1cbn1cblxufVxuXG4iXQp9Cg==
