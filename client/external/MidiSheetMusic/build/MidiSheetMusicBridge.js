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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJNaWRpU2hlZXRNdXNpY0JyaWRnZS5qcyIsCiAgInNvdXJjZVJvb3QiOiAiIiwKICAic291cmNlcyI6IFsiQ2xhc3Nlcy9EcmF3aW5nL0ltYWdlLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL0JydXNoLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL0JydXNoZXMuY3MiLCJDbGFzc2VzL0NsZWZNZWFzdXJlcy5jcyIsIkNsYXNzZXMvRHJhd2luZy9Db2xvci5jcyIsIkNsYXNzZXMvRHJhd2luZy9Db250cm9sLmNzIiwiQ2xhc3Nlcy9UZXh0L0VuY29kaW5nLmNzIiwiQ2xhc3Nlcy9JTy9TdHJlYW0uY3MiLCJDbGFzc2VzL0RyYXdpbmcvRm9udC5jcyIsIkNsYXNzZXMvRHJhd2luZy9HcmFwaGljcy5jcyIsIkNsYXNzZXMvS2V5U2lnbmF0dXJlLmNzIiwiQ2xhc3Nlcy9MeXJpY1N5bWJvbC5jcyIsIkNsYXNzZXMvTWlkaUV2ZW50LmNzIiwiQ2xhc3Nlcy9NaWRpRmlsZS5jcyIsIkNsYXNzZXMvTWlkaUZpbGVFeGNlcHRpb24uY3MiLCJDbGFzc2VzL01pZGlGaWxlUmVhZGVyLmNzIiwiQ2xhc3Nlcy9NaWRpTm90ZS5jcyIsIkNsYXNzZXMvTWlkaU9wdGlvbnMuY3MiLCJDbGFzc2VzL01pZGlUcmFjay5jcyIsIkNsYXNzZXMvV2hpdGVOb3RlLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL1BhaW50RXZlbnRBcmdzLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL1BhbmVsLmNzIiwiQ2xhc3Nlcy9JTy9QYXRoLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL1Blbi5jcyIsIkNsYXNzZXMvRHJhd2luZy9Qb2ludC5jcyIsIkNsYXNzZXMvRHJhd2luZy9SZWN0YW5nbGUuY3MiLCJDbGFzc2VzL1N0YWZmLmNzIiwiQ2xhc3Nlcy9TdGVtLmNzIiwiQ2xhc3Nlcy9TeW1ib2xXaWR0aHMuY3MiLCJDbGFzc2VzL1RpbWVTaWduYXR1cmUuY3MiLCJDbGFzc2VzL0FjY2lkU3ltYm9sLmNzIiwiQ2xhc3Nlcy9CYXJTeW1ib2wuY3MiLCJDbGFzc2VzL0RyYXdpbmcvQml0bWFwLmNzIiwiQ2xhc3Nlcy9CbGFua1N5bWJvbC5jcyIsIkNsYXNzZXMvQ2hvcmRTeW1ib2wuY3MiLCJDbGFzc2VzL0NsZWZTeW1ib2wuY3MiLCJDbGFzc2VzL0lPL0ZpbGVTdHJlYW0uY3MiLCJDbGFzc2VzL1BpYW5vLmNzIiwiQ2xhc3Nlcy9SZXN0U3ltYm9sLmNzIiwiQ2xhc3Nlcy9TaGVldE11c2ljLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL1NvbGlkQnJ1c2guY3MiLCJDbGFzc2VzL1RpbWVTaWdTeW1ib2wuY3MiXSwKICAibmFtZXMiOiBbIiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQW9CZ0JBLE9BQU9BLDBCQUE4Q0E7Ozs7O29CQVFyREEsT0FBT0EsMkJBQStDQTs7Ozs7NEJBakI5Q0EsTUFBV0E7O2dCQUV2QkEsc0JBQXFDQSxNQUFNQSxNQUFNQTs7Ozs7Ozs7Ozs0QkNIeENBOztnQkFFVEEsYUFBUUE7Ozs7Ozs7Ozs7Ozs7d0JDSnNCQSxPQUFPQSxJQUFJQSxxQkFBTUE7Ozs7O3dCQUNqQkEsT0FBT0EsSUFBSUEscUJBQU1BOzs7Ozt3QkFDYkEsT0FBT0EsSUFBSUEscUJBQU1BOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQ0NxRjlCQTs7b0JBQ3pCQSxjQUFjQTtvQkFDZEE7b0JBQ0FBLDBCQUF1QkE7Ozs7NEJBQ25CQSxpQkFBU0E7Ozs7OztxQkFFYkEsSUFBSUE7d0JBQ0FBLE9BQU9BOzJCQUVOQSxJQUFJQSx3QkFBTUEsc0JBQWVBO3dCQUMxQkEsT0FBT0E7O3dCQUdQQSxPQUFPQTs7Ozs7Ozs7Ozs0QkE3RUtBLE9BQXNCQTs7Z0JBQ3RDQSxlQUFVQTtnQkFDVkEsZUFBZ0JBLHFDQUFTQTtnQkFDekJBLGtCQUFrQkE7Z0JBQ2xCQTtnQkFDQUEsV0FBWUE7O2dCQUVaQSxhQUFRQSxLQUFJQTs7Z0JBRVpBLE9BQU9BLE1BQU1BOztvQkFFVEE7b0JBQ0FBO29CQUNBQSxPQUFPQSxNQUFNQSxl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QzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBOztvQkFFMUJBLE1BQU1BLHlEQUFVQSwrQkFBVkE7b0JBQ05BLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTs7b0JBRTFCQSxNQUFNQSx5REFBVUEsK0JBQVZBO29CQUNOQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7O29CQUUxQkEsTUFBTUEseURBQVVBLCtCQUFWQTtvQkFDTkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBOztvQkFFMUJBLE1BQU1BLHlEQUFVQSwrQkFBVkE7b0JBQ05BLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTs7O29CQUcxQkEsTUFBTUEsd0RBQVNBLCtCQUFUQTtvQkFDTkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBOztvQkFFMUJBLE1BQU1BLHdEQUFTQSwrQkFBVEE7b0JBQ05BLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTs7b0JBRTFCQSxNQUFNQSx3REFBU0EsbUNBQVRBO29CQUNOQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7O29CQUUxQkEsTUFBTUEsd0RBQVNBLG1DQUFUQTtvQkFDTkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBOztvQkFFMUJBLE1BQU1BLHdEQUFTQSxtQ0FBVEE7b0JBQ05BLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTs7b0JBRTFCQSxNQUFNQSx3REFBU0EsbUNBQVRBO29CQUNOQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxn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aUJBLFFBQ3hEQSxjQUFjQSxRQUFRQSw4Q0FBaUJBLHVEQUFPQSxPQUFQQSx5Q0FBaUJBO29CQUN4REE7O29CQUdBQTs7Z0JBRUpBLGFBQVFBOzs7OzRCQTRERkEsR0FBWUEsS0FBU0E7Z0JBQzNCQSxJQUFJQSxDQUFDQTtvQkFDREE7OztnQkFFSkEscUJBQXFCQSxlQUFRQTtnQkFDN0JBLFlBQWNBLHVEQUFPQSxnQkFBUEE7Z0JBQ2RBLFlBQWNBLHVEQUFPQSxrQkFBUEE7OztnQkFHZEEsZ0JBQWdCQTtnQkFDaEJBLGVBQWVBLDRDQUFjQSxZQUFZQTtnQkFDekNBLFlBQVlBLFVBQVVBLE1BQU1BLFVBQVVBO2dCQUN0Q0EsWUFBWUEsVUFBVUEsU0FBT0EsK0RBQXlCQSxVQUFVQTtnQkFDaEVBLHFCQUFxQkEsR0FBQ0EsQ0FBQ0EsZUFBUUE7OztnQkFJL0JBLE9BQU9BLG9FQUNjQSwwQ0FBV0EiLAogICJzb3VyY2VzQ29udGVudCI6IFsidXNpbmcgQnJpZGdlO1xyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgSW1hZ2VcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgb2JqZWN0IERvbUltYWdlO1xyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgSW1hZ2UoVHlwZSB0eXBlLCBzdHJpbmcgZmlsZW5hbWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuaW1hZ2UuY3RvclwiLCB0aGlzLCB0eXBlLCBmaWxlbmFtZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgaW50IFdpZHRoXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXRcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFNjcmlwdC5DYWxsPGludD4oXCJicmlkZ2VVdGlsLmltYWdlLmdldFdpZHRoXCIsIHRoaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgaW50IEhlaWdodFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBTY3JpcHQuQ2FsbDxpbnQ+KFwiYnJpZGdlVXRpbC5pbWFnZS5nZXRIZWlnaHRcIiwgdGhpcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEJydXNoXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIENvbG9yIENvbG9yO1xyXG5cclxuICAgICAgICBwdWJsaWMgQnJ1c2goQ29sb3IgY29sb3IpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBDb2xvciA9IGNvbG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgRGlzcG9zZSgpIHsgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBzdGF0aWMgY2xhc3MgQnJ1c2hlc1xyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQnJ1c2ggQmxhY2sgeyBnZXQgeyByZXR1cm4gbmV3IEJydXNoKENvbG9yLkJsYWNrKTsgfSB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBCcnVzaCBXaGl0ZSB7IGdldCB7IHJldHVybiBuZXcgQnJ1c2goQ29sb3IuV2hpdGUpOyB9IH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIEJydXNoIExpZ2h0R3JheSB7IGdldCB7IHJldHVybiBuZXcgQnJ1c2goQ29sb3IuTGlnaHRHcmF5KTsgfSB9XHJcbiAgICB9XHJcbn1cclxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDA4IE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIEBjbGFzcyBDbGVmTWVhc3VyZXNcbiAqIFRoZSBDbGVmTWVhc3VyZXMgY2xhc3MgaXMgdXNlZCB0byByZXBvcnQgd2hhdCBDbGVmIChUcmVibGUgb3IgQmFzcykgYVxuICogZ2l2ZW4gbWVhc3VyZSB1c2VzLlxuICovXG5wdWJsaWMgY2xhc3MgQ2xlZk1lYXN1cmVzIHtcbiAgICBwcml2YXRlIExpc3Q8Q2xlZj4gY2xlZnM7ICAvKiogVGhlIGNsZWZzIHVzZWQgZm9yIGVhY2ggbWVhc3VyZSAoZm9yIGEgc2luZ2xlIHRyYWNrKSAqL1xuICAgIHByaXZhdGUgaW50IG1lYXN1cmU7ICAgICAgIC8qKiBUaGUgbGVuZ3RoIG9mIGEgbWVhc3VyZSwgaW4gcHVsc2VzICovXG5cbiBcbiAgICAvKiogR2l2ZW4gdGhlIG5vdGVzIGluIGEgdHJhY2ssIGNhbGN1bGF0ZSB0aGUgYXBwcm9wcmlhdGUgQ2xlZiB0byB1c2VcbiAgICAgKiBmb3IgZWFjaCBtZWFzdXJlLiAgU3RvcmUgdGhlIHJlc3VsdCBpbiB0aGUgY2xlZnMgbGlzdC5cbiAgICAgKiBAcGFyYW0gbm90ZXMgIFRoZSBtaWRpIG5vdGVzXG4gICAgICogQHBhcmFtIG1lYXN1cmVsZW4gVGhlIGxlbmd0aCBvZiBhIG1lYXN1cmUsIGluIHB1bHNlc1xuICAgICAqL1xuICAgIHB1YmxpYyBDbGVmTWVhc3VyZXMoTGlzdDxNaWRpTm90ZT4gbm90ZXMsIGludCBtZWFzdXJlbGVuKSB7XG4gICAgICAgIG1lYXN1cmUgPSBtZWFzdXJlbGVuO1xuICAgICAgICBDbGVmIG1haW5jbGVmID0gTWFpbkNsZWYobm90ZXMpO1xuICAgICAgICBpbnQgbmV4dG1lYXN1cmUgPSBtZWFzdXJlbGVuO1xuICAgICAgICBpbnQgcG9zID0gMDtcbiAgICAgICAgQ2xlZiBjbGVmID0gbWFpbmNsZWY7XG5cbiAgICAgICAgY2xlZnMgPSBuZXcgTGlzdDxDbGVmPigpO1xuXG4gICAgICAgIHdoaWxlIChwb3MgPCBub3Rlcy5Db3VudCkge1xuICAgICAgICAgICAgLyogU3VtIGFsbCB0aGUgbm90ZXMgaW4gdGhlIGN1cnJlbnQgbWVhc3VyZSAqL1xuICAgICAgICAgICAgaW50IHN1bW5vdGVzID0gMDtcbiAgICAgICAgICAgIGludCBub3RlY291bnQgPSAwO1xuICAgICAgICAgICAgd2hpbGUgKHBvcyA8IG5vdGVzLkNvdW50ICYmIG5vdGVzW3Bvc10uU3RhcnRUaW1lIDwgbmV4dG1lYXN1cmUpIHtcbiAgICAgICAgICAgICAgICBzdW1ub3RlcyArPSBub3Rlc1twb3NdLk51bWJlcjtcbiAgICAgICAgICAgICAgICBub3RlY291bnQrKztcbiAgICAgICAgICAgICAgICBwb3MrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChub3RlY291bnQgPT0gMClcbiAgICAgICAgICAgICAgICBub3RlY291bnQgPSAxO1xuXG4gICAgICAgICAgICAvKiBDYWxjdWxhdGUgdGhlIFwiYXZlcmFnZVwiIG5vdGUgaW4gdGhlIG1lYXN1cmUgKi9cbiAgICAgICAgICAgIGludCBhdmdub3RlID0gc3Vtbm90ZXMgLyBub3RlY291bnQ7XG4gICAgICAgICAgICBpZiAoYXZnbm90ZSA9PSAwKSB7XG4gICAgICAgICAgICAgICAgLyogVGhpcyBtZWFzdXJlIGRvZXNuJ3QgY29udGFpbiBhbnkgbm90ZXMuXG4gICAgICAgICAgICAgICAgICogS2VlcCB0aGUgcHJldmlvdXMgY2xlZi5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGF2Z25vdGUgPj0gV2hpdGVOb3RlLkJvdHRvbVRyZWJsZS5OdW1iZXIoKSkge1xuICAgICAgICAgICAgICAgIGNsZWYgPSBDbGVmLlRyZWJsZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGF2Z25vdGUgPD0gV2hpdGVOb3RlLlRvcEJhc3MuTnVtYmVyKCkpIHtcbiAgICAgICAgICAgICAgICBjbGVmID0gQ2xlZi5CYXNzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLyogVGhlIGF2ZXJhZ2Ugbm90ZSBpcyBiZXR3ZWVuIEczIGFuZCBGNC4gV2UgY2FuIHVzZSBlaXRoZXJcbiAgICAgICAgICAgICAgICAgKiB0aGUgdHJlYmxlIG9yIGJhc3MgY2xlZi4gIFVzZSB0aGUgXCJtYWluXCIgY2xlZiwgdGhlIGNsZWZcbiAgICAgICAgICAgICAgICAgKiB0aGF0IGFwcGVhcnMgbW9zdCBmb3IgdGhpcyB0cmFjay5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBjbGVmID0gbWFpbmNsZWY7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNsZWZzLkFkZChjbGVmKTtcbiAgICAgICAgICAgIG5leHRtZWFzdXJlICs9IG1lYXN1cmVsZW47XG4gICAgICAgIH1cbiAgICAgICAgY2xlZnMuQWRkKGNsZWYpO1xuICAgIH1cblxuICAgIC8qKiBHaXZlbiBhIHRpbWUgKGluIHB1bHNlcyksIHJldHVybiB0aGUgY2xlZiB1c2VkIGZvciB0aGF0IG1lYXN1cmUuICovXG4gICAgcHVibGljIENsZWYgR2V0Q2xlZihpbnQgc3RhcnR0aW1lKSB7XG5cbiAgICAgICAgLyogSWYgdGhlIHRpbWUgZXhjZWVkcyB0aGUgbGFzdCBtZWFzdXJlLCByZXR1cm4gdGhlIGxhc3QgbWVhc3VyZSAqL1xuICAgICAgICBpZiAoc3RhcnR0aW1lIC8gbWVhc3VyZSA+PSBjbGVmcy5Db3VudCkge1xuICAgICAgICAgICAgcmV0dXJuIGNsZWZzWyBjbGVmcy5Db3VudC0xIF07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gY2xlZnNbIHN0YXJ0dGltZSAvIG1lYXN1cmUgXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBDYWxjdWxhdGUgdGhlIGJlc3QgY2xlZiB0byB1c2UgZm9yIHRoZSBnaXZlbiBub3Rlcy4gIElmIHRoZVxuICAgICAqIGF2ZXJhZ2Ugbm90ZSBpcyBiZWxvdyBNaWRkbGUgQywgdXNlIGEgYmFzcyBjbGVmLiAgRWxzZSwgdXNlIGEgdHJlYmxlXG4gICAgICogY2xlZi5cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBDbGVmIE1haW5DbGVmKExpc3Q8TWlkaU5vdGU+IG5vdGVzKSB7XG4gICAgICAgIGludCBtaWRkbGVDID0gV2hpdGVOb3RlLk1pZGRsZUMuTnVtYmVyKCk7XG4gICAgICAgIGludCB0b3RhbCA9IDA7XG4gICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG0gaW4gbm90ZXMpIHtcbiAgICAgICAgICAgIHRvdGFsICs9IG0uTnVtYmVyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub3Rlcy5Db3VudCA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gQ2xlZi5UcmVibGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodG90YWwvbm90ZXMuQ291bnQgPj0gbWlkZGxlQykge1xuICAgICAgICAgICAgcmV0dXJuIENsZWYuVHJlYmxlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIENsZWYuQmFzcztcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG59XG5cbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBDb2xvclxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBpbnQgUmVkO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgR3JlZW47XHJcbiAgICAgICAgcHVibGljIGludCBCbHVlO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgQWxwaGE7XHJcblxyXG4gICAgICAgIHB1YmxpYyBDb2xvcigpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBBbHBoYSA9IDI1NTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQ29sb3IgRnJvbUFyZ2IoaW50IHJlZCwgaW50IGdyZWVuLCBpbnQgYmx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gRnJvbUFyZ2IoMjU1LCByZWQsIGdyZWVuLCBibHVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQ29sb3IgRnJvbUFyZ2IoaW50IGFscGhhLCBpbnQgcmVkLCBpbnQgZ3JlZW4sIGludCBibHVlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBDb2xvclxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBBbHBoYSA9IGFscGhhLFxyXG4gICAgICAgICAgICAgICAgUmVkID0gcmVkLFxyXG4gICAgICAgICAgICAgICAgR3JlZW4gPSBncmVlbixcclxuICAgICAgICAgICAgICAgIEJsdWUgPSBibHVlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIENvbG9yIEJsYWNrIHsgZ2V0IHsgcmV0dXJuIG5ldyBDb2xvcigpOyB9IH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBDb2xvciBXaGl0ZSB7IGdldCB7IHJldHVybiBGcm9tQXJnYigyNTUsMjU1LDI1NSk7IH0gfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIENvbG9yIExpZ2h0R3JheSB7IGdldCB7IHJldHVybiBGcm9tQXJnYigweGQzLDB4ZDMsMHhkMyk7IH0gfVxyXG5cclxuICAgICAgICBwdWJsaWMgaW50IFIgeyBnZXQgeyByZXR1cm4gUmVkOyB9IH1cclxuICAgICAgICBwdWJsaWMgaW50IEcgeyBnZXQgeyByZXR1cm4gR3JlZW47IH0gfVxyXG4gICAgICAgIHB1YmxpYyBpbnQgQiB7IGdldCB7IHJldHVybiBCbHVlOyB9IH1cclxuXHJcbiAgICAgICAgcHVibGljIGJvb2wgRXF1YWxzKENvbG9yIGNvbG9yKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIFJlZCA9PSBjb2xvci5SZWQgJiYgR3JlZW4gPT0gY29sb3IuR3JlZW4gJiYgQmx1ZSA9PSBjb2xvci5CbHVlICYmIEFscGhhPT1jb2xvci5BbHBoYTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIENvbnRyb2xcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgaW50IFdpZHRoO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgSGVpZ2h0O1xyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBJbnZhbGlkYXRlKCkgeyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBHcmFwaGljcyBDcmVhdGVHcmFwaGljcyhzdHJpbmcgbmFtZSkgeyByZXR1cm4gbmV3IEdyYXBoaWNzKG5hbWUpOyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBQYW5lbCBQYXJlbnQgeyBnZXQgeyByZXR1cm4gbmV3IFBhbmVsKCk7IH0gfVxyXG5cclxuICAgICAgICBwdWJsaWMgQ29sb3IgQmFja0NvbG9yO1xyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBzdGF0aWMgY2xhc3MgRW5jb2RpbmdcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIHN0cmluZyBHZXRVdGY4U3RyaW5nKGJ5dGVbXSB2YWx1ZSwgaW50IHN0YXJ0SW5kZXgsIGludCBsZW5ndGgpIHsgcmV0dXJuIFwibm90IGltcGxlbWVudGVkIVwiOyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgc3RyaW5nIEdldEFzY2lpU3RyaW5nKGJ5dGVbXSBkYXRhLCBpbnQgc3RhcnRJbmRleCwgaW50IGxlbikgXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgdG9SZXR1cm4gPSBcIlwiO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbiAmJiBpIDwgZGF0YS5MZW5ndGg7IGkrKylcclxuICAgICAgICAgICAgICAgIHRvUmV0dXJuICs9IChjaGFyKWRhdGFbaSArIHN0YXJ0SW5kZXhdO1xyXG4gICAgICAgICAgICByZXR1cm4gdG9SZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGJ5dGVbXSBHZXRBc2NpaUJ5dGVzKHN0cmluZyB2YWx1ZSkgeyByZXR1cm4gbnVsbDsgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBTdHJlYW1cclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgdm9pZCBXcml0ZShieXRlW10gYnVmZmVyLCBpbnQgb2Zmc2V0LCBpbnQgY291bnQpIHsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBDbG9zZSgpIHsgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBGb250XHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIHN0cmluZyBOYW1lO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgU2l6ZTtcclxuICAgICAgICBwdWJsaWMgRm9udFN0eWxlIFN0eWxlO1xyXG5cclxuICAgICAgICBwdWJsaWMgRm9udChzdHJpbmcgbmFtZSwgaW50IHNpemUsIEZvbnRTdHlsZSBzdHlsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIE5hbWUgPSBuYW1lO1xyXG4gICAgICAgICAgICBTaXplID0gc2l6ZTtcclxuICAgICAgICAgICAgU3R5bGUgPSBzdHlsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBmbG9hdCBHZXRIZWlnaHQoKSB7IHJldHVybiAwOyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIERpc3Bvc2UoKSB7IH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBCcmlkZ2U7XHJcbnVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBHcmFwaGljc1xyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBHcmFwaGljcyhzdHJpbmcgbmFtZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIE5hbWUgPSBuYW1lO1xyXG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3MuaW5pdEdyYXBoaWNzXCIsIHRoaXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0cmluZyBOYW1lO1xyXG5cclxuICAgICAgICBwdWJsaWMgb2JqZWN0IENvbnRleHQ7XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFRyYW5zbGF0ZVRyYW5zZm9ybShpbnQgeCwgaW50IHkpIHtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLnRyYW5zbGF0ZVRyYW5zZm9ybVwiLCB0aGlzLCB4LCB5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIERyYXdJbWFnZShJbWFnZSBpbWFnZSwgaW50IHgsIGludCB5LCBpbnQgd2lkdGgsIGludCBoZWlnaHQpIHtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLmRyYXdJbWFnZVwiLCB0aGlzLCBpbWFnZSwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBEcmF3U3RyaW5nKHN0cmluZyB0ZXh0LCBGb250IGZvbnQsIEJydXNoIGJydXNoLCBpbnQgeCwgaW50IHkpIHtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLmRyYXdTdHJpbmdcIiwgdGhpcywgdGV4dCwgZm9udCwgYnJ1c2gsIHgsIHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgRHJhd0xpbmUoUGVuIHBlbiwgaW50IHhTdGFydCwgaW50IHlTdGFydCwgaW50IHhFbmQsIGludCB5RW5kKSB7XHJcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy5kcmF3TGluZVwiLCB0aGlzLCBwZW4sIHhTdGFydCwgeVN0YXJ0LCB4RW5kLCB5RW5kKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIERyYXdCZXppZXIoUGVuIHBlbiwgaW50IHgxLCBpbnQgeTEsIGludCB4MiwgaW50IHkyLCBpbnQgeDMsIGludCB5MywgaW50IHg0LCBpbnQgeTQpIHtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLmRyYXdCZXppZXJcIiwgdGhpcywgcGVuLCB4MSwgeTEsIHgyLCB5MiwgeDMsIHkzLCB4NCwgeTQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgU2NhbGVUcmFuc2Zvcm0oZmxvYXQgeCwgZmxvYXQgeSkge1xyXG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3Muc2NhbGVUcmFuc2Zvcm1cIiwgdGhpcywgeCwgeSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBGaWxsUmVjdGFuZ2xlKEJydXNoIGJydXNoLCBpbnQgeCwgaW50IHksIGludCB3aWR0aCwgaW50IGhlaWdodCkge1xyXG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3MuZmlsbFJlY3RhbmdsZVwiLCB0aGlzLCBicnVzaCwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBDbGVhclJlY3RhbmdsZShpbnQgeCwgaW50IHksIGludCB3aWR0aCwgaW50IGhlaWdodCkge1xyXG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3MuY2xlYXJSZWN0YW5nbGVcIiwgdGhpcywgeCwgeSwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBGaWxsRWxsaXBzZShCcnVzaCBicnVzaCwgaW50IHgsIGludCB5LCBpbnQgd2lkdGgsIGludCBoZWlnaHQpIHtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLmZpbGxFbGxpcHNlXCIsIHRoaXMsIGJydXNoLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIERyYXdFbGxpcHNlKFBlbiBwZW4sIGludCB4LCBpbnQgeSwgaW50IHdpZHRoLCBpbnQgaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy5kcmF3RWxsaXBzZVwiLCB0aGlzLCBwZW4sIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgUm90YXRlVHJhbnNmb3JtKGZsb2F0IGFuZ2xlRGVnKSB7XHJcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy5yb3RhdGVUcmFuc2Zvcm1cIiwgdGhpcywgYW5nbGVEZWcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIFNtb290aGluZ01vZGUgU21vb3RoaW5nTW9kZSB7IGdldDsgc2V0OyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBSZWN0YW5nbGUgVmlzaWJsZUNsaXBCb3VuZHMgeyBnZXQ7IHNldDsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZmxvYXQgUGFnZVNjYWxlIHsgZ2V0OyBzZXQ7IH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgRGlzcG9zZSgpIHsgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMyBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuXG4vKiogQGNsYXNzIEtleVNpZ25hdHVyZVxuICogVGhlIEtleVNpZ25hdHVyZSBjbGFzcyByZXByZXNlbnRzIGEga2V5IHNpZ25hdHVyZSwgbGlrZSBHIE1ham9yXG4gKiBvciBCLWZsYXQgTWFqb3IuICBGb3Igc2hlZXQgbXVzaWMsIHdlIG9ubHkgY2FyZSBhYm91dCB0aGUgbnVtYmVyXG4gKiBvZiBzaGFycHMgb3IgZmxhdHMgaW4gdGhlIGtleSBzaWduYXR1cmUsIG5vdCB3aGV0aGVyIGl0IGlzIG1ham9yXG4gKiBvciBtaW5vci5cbiAqXG4gKiBUaGUgbWFpbiBvcGVyYXRpb25zIG9mIHRoaXMgY2xhc3MgYXJlOlxuICogLSBHdWVzc2luZyB0aGUga2V5IHNpZ25hdHVyZSwgZ2l2ZW4gdGhlIG5vdGVzIGluIGEgc29uZy5cbiAqIC0gR2VuZXJhdGluZyB0aGUgYWNjaWRlbnRhbCBzeW1ib2xzIGZvciB0aGUga2V5IHNpZ25hdHVyZS5cbiAqIC0gRGV0ZXJtaW5pbmcgd2hldGhlciBhIHBhcnRpY3VsYXIgbm90ZSByZXF1aXJlcyBhbiBhY2NpZGVudGFsXG4gKiAgIG9yIG5vdC5cbiAqXG4gKi9cblxucHVibGljIGNsYXNzIEtleVNpZ25hdHVyZSB7XG4gICAgLyoqIFRoZSBudW1iZXIgb2Ygc2hhcnBzIGluIGVhY2gga2V5IHNpZ25hdHVyZSAqL1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQyA9IDA7XG4gICAgcHVibGljIGNvbnN0IGludCBHID0gMTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEQgPSAyO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQSA9IDM7XG4gICAgcHVibGljIGNvbnN0IGludCBFID0gNDtcbiAgICBwdWJsaWMgY29uc3QgaW50IEIgPSA1O1xuXG4gICAgLyoqIFRoZSBudW1iZXIgb2YgZmxhdHMgaW4gZWFjaCBrZXkgc2lnbmF0dXJlICovXG4gICAgcHVibGljIGNvbnN0IGludCBGID0gMTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEJmbGF0ID0gMjtcbiAgICBwdWJsaWMgY29uc3QgaW50IEVmbGF0ID0gMztcbiAgICBwdWJsaWMgY29uc3QgaW50IEFmbGF0ID0gNDtcbiAgICBwdWJsaWMgY29uc3QgaW50IERmbGF0ID0gNTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEdmbGF0ID0gNjtcblxuICAgIC8qKiBUaGUgdHdvIGFycmF5cyBiZWxvdyBhcmUga2V5IG1hcHMuICBUaGV5IHRha2UgYSBtYWpvciBrZXlcbiAgICAgKiAobGlrZSBHIG1ham9yLCBCLWZsYXQgbWFqb3IpIGFuZCBhIG5vdGUgaW4gdGhlIHNjYWxlLCBhbmRcbiAgICAgKiByZXR1cm4gdGhlIEFjY2lkZW50YWwgcmVxdWlyZWQgdG8gZGlzcGxheSB0aGF0IG5vdGUgaW4gdGhlXG4gICAgICogZ2l2ZW4ga2V5LiAgSW4gYSBudXRzaGVsLCB0aGUgbWFwIGlzXG4gICAgICpcbiAgICAgKiAgIG1hcFtLZXldW05vdGVTY2FsZV0gLT4gQWNjaWRlbnRhbFxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIEFjY2lkW11bXSBzaGFycGtleXM7XG4gICAgcHJpdmF0ZSBzdGF0aWMgQWNjaWRbXVtdIGZsYXRrZXlzO1xuXG4gICAgcHJpdmF0ZSBpbnQgbnVtX2ZsYXRzOyAgIC8qKiBUaGUgbnVtYmVyIG9mIHNoYXJwcyBpbiB0aGUga2V5LCAwIHRocnUgNiAqL1xuICAgIHByaXZhdGUgaW50IG51bV9zaGFycHM7ICAvKiogVGhlIG51bWJlciBvZiBmbGF0cyBpbiB0aGUga2V5LCAwIHRocnUgNiAqL1xuXG4gICAgLyoqIFRoZSBhY2NpZGVudGFsIHN5bWJvbHMgdGhhdCBkZW5vdGUgdGhpcyBrZXksIGluIGEgdHJlYmxlIGNsZWYgKi9cbiAgICBwcml2YXRlIEFjY2lkU3ltYm9sW10gdHJlYmxlO1xuXG4gICAgLyoqIFRoZSBhY2NpZGVudGFsIHN5bWJvbHMgdGhhdCBkZW5vdGUgdGhpcyBrZXksIGluIGEgYmFzcyBjbGVmICovXG4gICAgcHJpdmF0ZSBBY2NpZFN5bWJvbFtdIGJhc3M7XG5cbiAgICAvKiogVGhlIGtleSBtYXAgZm9yIHRoaXMga2V5IHNpZ25hdHVyZTpcbiAgICAgKiAgIGtleW1hcFtub3RlbnVtYmVyXSAtPiBBY2NpZGVudGFsXG4gICAgICovXG4gICAgcHJpdmF0ZSBBY2NpZFtdIGtleW1hcDtcblxuICAgIC8qKiBUaGUgbWVhc3VyZSB1c2VkIGluIHRoZSBwcmV2aW91cyBjYWxsIHRvIEdldEFjY2lkZW50YWwoKSAqL1xuICAgIHByaXZhdGUgaW50IHByZXZtZWFzdXJlOyBcblxuXG4gICAgLyoqIENyZWF0ZSBuZXcga2V5IHNpZ25hdHVyZSwgd2l0aCB0aGUgZ2l2ZW4gbnVtYmVyIG9mXG4gICAgICogc2hhcnBzIGFuZCBmbGF0cy4gIE9uZSBvZiB0aGUgdHdvIG11c3QgYmUgMCwgeW91IGNhbid0XG4gICAgICogaGF2ZSBib3RoIHNoYXJwcyBhbmQgZmxhdHMgaW4gdGhlIGtleSBzaWduYXR1cmUuXG4gICAgICovXG4gICAgcHVibGljIEtleVNpZ25hdHVyZShpbnQgbnVtX3NoYXJwcywgaW50IG51bV9mbGF0cykge1xuICAgICAgICBpZiAoIShudW1fc2hhcnBzID09IDAgfHwgbnVtX2ZsYXRzID09IDApKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgU3lzdGVtLkFyZ3VtZW50RXhjZXB0aW9uKFwiQmFkIEtleVNpZ2F0dXJlIGFyZ3NcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5udW1fc2hhcnBzID0gbnVtX3NoYXJwcztcbiAgICAgICAgdGhpcy5udW1fZmxhdHMgPSBudW1fZmxhdHM7XG5cbiAgICAgICAgQ3JlYXRlQWNjaWRlbnRhbE1hcHMoKTtcbiAgICAgICAga2V5bWFwID0gbmV3IEFjY2lkWzE2MF07XG4gICAgICAgIFJlc2V0S2V5TWFwKCk7XG4gICAgICAgIENyZWF0ZVN5bWJvbHMoKTtcbiAgICB9XG5cbiAgICAvKiogQ3JlYXRlIG5ldyBrZXkgc2lnbmF0dXJlLCB3aXRoIHRoZSBnaXZlbiBub3Rlc2NhbGUuICAqL1xuICAgIHB1YmxpYyBLZXlTaWduYXR1cmUoaW50IG5vdGVzY2FsZSkge1xuICAgICAgICBudW1fc2hhcnBzID0gbnVtX2ZsYXRzID0gMDtcbiAgICAgICAgc3dpdGNoIChub3Rlc2NhbGUpIHtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkE6ICAgICBudW1fc2hhcnBzID0gMzsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5CZmxhdDogbnVtX2ZsYXRzID0gMjsgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQjogICAgIG51bV9zaGFycHMgPSA1OyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkM6ICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkRmbGF0OiBudW1fZmxhdHMgPSA1OyAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5EOiAgICAgbnVtX3NoYXJwcyA9IDI7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRWZsYXQ6IG51bV9mbGF0cyA9IDM7ICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkU6ICAgICBudW1fc2hhcnBzID0gNDsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5GOiAgICAgbnVtX2ZsYXRzID0gMTsgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuR2ZsYXQ6IG51bV9mbGF0cyA9IDY7ICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkc6ICAgICBudW1fc2hhcnBzID0gMTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5BZmxhdDogbnVtX2ZsYXRzID0gNDsgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDogICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgQ3JlYXRlQWNjaWRlbnRhbE1hcHMoKTtcbiAgICAgICAga2V5bWFwID0gbmV3IEFjY2lkWzE2MF07XG4gICAgICAgIFJlc2V0S2V5TWFwKCk7XG4gICAgICAgIENyZWF0ZVN5bWJvbHMoKTtcbiAgICB9XG5cblxuICAgIC8qKiBJbmlpdGFsaXplIHRoZSBzaGFycGtleXMgYW5kIGZsYXRrZXlzIG1hcHMgKi9cbiAgICBwcml2YXRlIHN0YXRpYyB2b2lkIENyZWF0ZUFjY2lkZW50YWxNYXBzKCkge1xuICAgICAgICBpZiAoc2hhcnBrZXlzICE9IG51bGwpXG4gICAgICAgICAgICByZXR1cm47IFxuXG4gICAgICAgIEFjY2lkW10gbWFwO1xuICAgICAgICBzaGFycGtleXMgPSBuZXcgQWNjaWRbOF1bXTtcbiAgICAgICAgZmxhdGtleXMgPSBuZXcgQWNjaWRbOF1bXTtcblxuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICAgICAgc2hhcnBrZXlzW2ldID0gbmV3IEFjY2lkWzEyXTtcbiAgICAgICAgICAgIGZsYXRrZXlzW2ldID0gbmV3IEFjY2lkWzEyXTtcbiAgICAgICAgfVxuXG4gICAgICAgIG1hcCA9IHNoYXJwa2V5c1tDXTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Bc2hhcnAgXSA9IEFjY2lkLkZsYXQ7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Dc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Gc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkdzaGFycCBdID0gQWNjaWQuU2hhcnA7XG5cbiAgICAgICAgbWFwID0gc2hhcnBrZXlzW0ddO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkFzaGFycCBdID0gQWNjaWQuRmxhdDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkNzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRHNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Hc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuXG4gICAgICAgIG1hcCA9IHNoYXJwa2V5c1tEXTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Bc2hhcnAgXSA9IEFjY2lkLkZsYXQ7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Dc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRHNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Hc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuXG4gICAgICAgIG1hcCA9IHNoYXJwa2V5c1tBXTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Bc2hhcnAgXSA9IEFjY2lkLkZsYXQ7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Dc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRHNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Hc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG5cbiAgICAgICAgbWFwID0gc2hhcnBrZXlzW0VdO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkFzaGFycCBdID0gQWNjaWQuRmxhdDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkNzaGFycCBdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRCBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Ec2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Gc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuR3NoYXJwIF0gPSBBY2NpZC5Ob25lO1xuXG4gICAgICAgIG1hcCA9IHNoYXJwa2V5c1tCXTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Bc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Dc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRHNoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRnNoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkdzaGFycCBdID0gQWNjaWQuTm9uZTtcblxuICAgICAgICAvKiBGbGF0IGtleXMgKi9cbiAgICAgICAgbWFwID0gZmxhdGtleXNbQ107XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQXNoYXJwIF0gPSBBY2NpZC5GbGF0O1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQ3NoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRCBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Ec2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRnNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Hc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuXG4gICAgICAgIG1hcCA9IGZsYXRrZXlzW0ZdO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkJmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkNzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRWZsYXQgXSAgPSBBY2NpZC5GbGF0O1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRnNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BZmxhdCBdICA9IEFjY2lkLkZsYXQ7XG5cbiAgICAgICAgbWFwID0gZmxhdGtleXNbQmZsYXRdO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkJmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkNzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRWZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRnNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BZmxhdCBdICA9IEFjY2lkLkZsYXQ7XG5cbiAgICAgICAgbWFwID0gZmxhdGtleXNbRWZsYXRdO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkJmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRmbGF0IF0gID0gQWNjaWQuRmxhdDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRCBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Gc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkFmbGF0IF0gID0gQWNjaWQuTm9uZTtcblxuICAgICAgICBtYXAgPSBmbGF0a2V5c1tBZmxhdF07XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQmZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRGZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkVmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQWZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuXG4gICAgICAgIG1hcCA9IGZsYXRrZXlzW0RmbGF0XTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRWZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuR2ZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkFmbGF0IF0gID0gQWNjaWQuTm9uZTtcblxuICAgICAgICBtYXAgPSBmbGF0a2V5c1tHZmxhdF07XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQmZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRGZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkVmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkdmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BZmxhdCBdICA9IEFjY2lkLk5vbmU7XG5cblxuICAgIH1cblxuICAgIC8qKiBUaGUga2V5bWFwIHRlbGxzIHdoYXQgYWNjaWRlbnRhbCBzeW1ib2wgaXMgbmVlZGVkIGZvciBlYWNoXG4gICAgICogIG5vdGUgaW4gdGhlIHNjYWxlLiAgUmVzZXQgdGhlIGtleW1hcCB0byB0aGUgdmFsdWVzIG9mIHRoZVxuICAgICAqICBrZXkgc2lnbmF0dXJlLlxuICAgICAqL1xuICAgIHByaXZhdGUgdm9pZCBSZXNldEtleU1hcCgpXG4gICAge1xuICAgICAgICBBY2NpZFtdIGtleTtcbiAgICAgICAgaWYgKG51bV9mbGF0cyA+IDApXG4gICAgICAgICAgICBrZXkgPSBmbGF0a2V5c1tudW1fZmxhdHNdO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBrZXkgPSBzaGFycGtleXNbbnVtX3NoYXJwc107XG5cbiAgICAgICAgZm9yIChpbnQgbm90ZW51bWJlciA9IDA7IG5vdGVudW1iZXIgPCBrZXltYXAuTGVuZ3RoOyBub3RlbnVtYmVyKyspIHtcbiAgICAgICAgICAgIGtleW1hcFtub3RlbnVtYmVyXSA9IGtleVtOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyKV07XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIC8qKiBDcmVhdGUgdGhlIEFjY2lkZW50YWwgc3ltYm9scyBmb3IgdGhpcyBrZXksIGZvclxuICAgICAqIHRoZSB0cmVibGUgYW5kIGJhc3MgY2xlZnMuXG4gICAgICovXG4gICAgcHJpdmF0ZSB2b2lkIENyZWF0ZVN5bWJvbHMoKSB7XG4gICAgICAgIGludCBjb3VudCA9IE1hdGguTWF4KG51bV9zaGFycHMsIG51bV9mbGF0cyk7XG4gICAgICAgIHRyZWJsZSA9IG5ldyBBY2NpZFN5bWJvbFtjb3VudF07XG4gICAgICAgIGJhc3MgPSBuZXcgQWNjaWRTeW1ib2xbY291bnRdO1xuXG4gICAgICAgIGlmIChjb3VudCA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBXaGl0ZU5vdGVbXSB0cmVibGVub3RlcyA9IG51bGw7XG4gICAgICAgIFdoaXRlTm90ZVtdIGJhc3Nub3RlcyA9IG51bGw7XG5cbiAgICAgICAgaWYgKG51bV9zaGFycHMgPiAwKSAge1xuICAgICAgICAgICAgdHJlYmxlbm90ZXMgPSBuZXcgV2hpdGVOb3RlW10ge1xuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkYsIDUpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkMsIDUpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkcsIDUpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkQsIDUpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkEsIDYpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkUsIDUpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgYmFzc25vdGVzID0gbmV3IFdoaXRlTm90ZVtdIHtcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5GLCAzKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5DLCAzKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5HLCAzKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5ELCAzKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5BLCA0KSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5FLCAzKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChudW1fZmxhdHMgPiAwKSB7XG4gICAgICAgICAgICB0cmVibGVub3RlcyA9IG5ldyBXaGl0ZU5vdGVbXSB7XG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQiwgNSksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRSwgNSksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQSwgNSksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRCwgNSksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRywgNCksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQywgNSlcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBiYXNzbm90ZXMgPSBuZXcgV2hpdGVOb3RlW10ge1xuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkIsIDMpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkUsIDMpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkEsIDMpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkQsIDMpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkcsIDIpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkMsIDMpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgQWNjaWQgYSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIGlmIChudW1fc2hhcnBzID4gMClcbiAgICAgICAgICAgIGEgPSBBY2NpZC5TaGFycDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYSA9IEFjY2lkLkZsYXQ7XG5cbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICB0cmVibGVbaV0gPSBuZXcgQWNjaWRTeW1ib2woYSwgdHJlYmxlbm90ZXNbaV0sIENsZWYuVHJlYmxlKTtcbiAgICAgICAgICAgIGJhc3NbaV0gPSBuZXcgQWNjaWRTeW1ib2woYSwgYmFzc25vdGVzW2ldLCBDbGVmLkJhc3MpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgQWNjaWRlbnRhbCBzeW1ib2xzIGZvciBkaXNwbGF5aW5nIHRoaXMga2V5IHNpZ25hdHVyZVxuICAgICAqIGZvciB0aGUgZ2l2ZW4gY2xlZi5cbiAgICAgKi9cbiAgICBwdWJsaWMgQWNjaWRTeW1ib2xbXSBHZXRTeW1ib2xzKENsZWYgY2xlZikge1xuICAgICAgICBpZiAoY2xlZiA9PSBDbGVmLlRyZWJsZSlcbiAgICAgICAgICAgIHJldHVybiB0cmVibGU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBiYXNzO1xuICAgIH1cblxuICAgIC8qKiBHaXZlbiBhIG1pZGkgbm90ZSBudW1iZXIsIHJldHVybiB0aGUgYWNjaWRlbnRhbCAoaWYgYW55KSBcbiAgICAgKiB0aGF0IHNob3VsZCBiZSB1c2VkIHdoZW4gZGlzcGxheWluZyB0aGUgbm90ZSBpbiB0aGlzIGtleSBzaWduYXR1cmUuXG4gICAgICpcbiAgICAgKiBUaGUgY3VycmVudCBtZWFzdXJlIGlzIGFsc28gcmVxdWlyZWQuICBPbmNlIHdlIHJldHVybiBhblxuICAgICAqIGFjY2lkZW50YWwgZm9yIGEgbWVhc3VyZSwgdGhlIGFjY2lkZW50YWwgcmVtYWlucyBmb3IgdGhlXG4gICAgICogcmVzdCBvZiB0aGUgbWVhc3VyZS4gU28gd2UgbXVzdCB1cGRhdGUgdGhlIGN1cnJlbnQga2V5bWFwXG4gICAgICogd2l0aCBhbnkgbmV3IGFjY2lkZW50YWxzIHRoYXQgd2UgcmV0dXJuLiAgV2hlbiB3ZSBtb3ZlIHRvIGFub3RoZXJcbiAgICAgKiBtZWFzdXJlLCB3ZSByZXNldCB0aGUga2V5bWFwIGJhY2sgdG8gdGhlIGtleSBzaWduYXR1cmUuXG4gICAgICovXG4gICAgcHVibGljIEFjY2lkIEdldEFjY2lkZW50YWwoaW50IG5vdGVudW1iZXIsIGludCBtZWFzdXJlKSB7XG4gICAgICAgIGlmIChtZWFzdXJlICE9IHByZXZtZWFzdXJlKSB7XG4gICAgICAgICAgICBSZXNldEtleU1hcCgpO1xuICAgICAgICAgICAgcHJldm1lYXN1cmUgPSBtZWFzdXJlO1xuICAgICAgICB9XG5cbiAgICAgICAgQWNjaWQgcmVzdWx0ID0ga2V5bWFwW25vdGVudW1iZXJdO1xuICAgICAgICBpZiAocmVzdWx0ID09IEFjY2lkLlNoYXJwKSB7XG4gICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlcl0gPSBBY2NpZC5Ob25lO1xuICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXItMV0gPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHJlc3VsdCA9PSBBY2NpZC5GbGF0KSB7XG4gICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlcl0gPSBBY2NpZC5Ob25lO1xuICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXIrMV0gPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHJlc3VsdCA9PSBBY2NpZC5OYXR1cmFsKSB7XG4gICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlcl0gPSBBY2NpZC5Ob25lO1xuICAgICAgICAgICAgaW50IG5leHRrZXkgPSBOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyKzEpO1xuICAgICAgICAgICAgaW50IHByZXZrZXkgPSBOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyLTEpO1xuXG4gICAgICAgICAgICAvKiBJZiB3ZSBpbnNlcnQgYSBuYXR1cmFsLCB0aGVuIGVpdGhlcjpcbiAgICAgICAgICAgICAqIC0gdGhlIG5leHQga2V5IG11c3QgZ28gYmFjayB0byBzaGFycCxcbiAgICAgICAgICAgICAqIC0gdGhlIHByZXZpb3VzIGtleSBtdXN0IGdvIGJhY2sgdG8gZmxhdC5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYgKGtleW1hcFtub3RlbnVtYmVyLTFdID09IEFjY2lkLk5vbmUgJiYga2V5bWFwW25vdGVudW1iZXIrMV0gPT0gQWNjaWQuTm9uZSAmJlxuICAgICAgICAgICAgICAgIE5vdGVTY2FsZS5Jc0JsYWNrS2V5KG5leHRrZXkpICYmIE5vdGVTY2FsZS5Jc0JsYWNrS2V5KHByZXZrZXkpICkge1xuXG4gICAgICAgICAgICAgICAgaWYgKG51bV9mbGF0cyA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGtleW1hcFtub3RlbnVtYmVyKzFdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlci0xXSA9IEFjY2lkLkZsYXQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5bWFwW25vdGVudW1iZXItMV0gPT0gQWNjaWQuTm9uZSAmJiBOb3RlU2NhbGUuSXNCbGFja0tleShwcmV2a2V5KSkge1xuICAgICAgICAgICAgICAgIGtleW1hcFtub3RlbnVtYmVyLTFdID0gQWNjaWQuRmxhdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGtleW1hcFtub3RlbnVtYmVyKzFdID09IEFjY2lkLk5vbmUgJiYgTm90ZVNjYWxlLklzQmxhY2tLZXkobmV4dGtleSkpIHtcbiAgICAgICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlcisxXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLyogU2hvdWxkbid0IGdldCBoZXJlICovXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cblxuICAgIC8qKiBHaXZlbiBhIG1pZGkgbm90ZSBudW1iZXIsIHJldHVybiB0aGUgd2hpdGUgbm90ZSAodGhlXG4gICAgICogbm9uLXNoYXJwL25vbi1mbGF0IG5vdGUpIHRoYXQgc2hvdWxkIGJlIHVzZWQgd2hlbiBkaXNwbGF5aW5nXG4gICAgICogdGhpcyBub3RlIGluIHRoaXMga2V5IHNpZ25hdHVyZS4gIFRoaXMgc2hvdWxkIGJlIGNhbGxlZFxuICAgICAqIGJlZm9yZSBjYWxsaW5nIEdldEFjY2lkZW50YWwoKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgV2hpdGVOb3RlIEdldFdoaXRlTm90ZShpbnQgbm90ZW51bWJlcikge1xuICAgICAgICBpbnQgbm90ZXNjYWxlID0gTm90ZVNjYWxlLkZyb21OdW1iZXIobm90ZW51bWJlcik7XG4gICAgICAgIGludCBvY3RhdmUgPSAobm90ZW51bWJlciArIDMpIC8gMTIgLSAxO1xuICAgICAgICBpbnQgbGV0dGVyID0gMDtcblxuICAgICAgICBpbnRbXSB3aG9sZV9zaGFycHMgPSB7IFxuICAgICAgICAgICAgV2hpdGVOb3RlLkEsIFdoaXRlTm90ZS5BLCBcbiAgICAgICAgICAgIFdoaXRlTm90ZS5CLCBcbiAgICAgICAgICAgIFdoaXRlTm90ZS5DLCBXaGl0ZU5vdGUuQyxcbiAgICAgICAgICAgIFdoaXRlTm90ZS5ELCBXaGl0ZU5vdGUuRCxcbiAgICAgICAgICAgIFdoaXRlTm90ZS5FLFxuICAgICAgICAgICAgV2hpdGVOb3RlLkYsIFdoaXRlTm90ZS5GLFxuICAgICAgICAgICAgV2hpdGVOb3RlLkcsIFdoaXRlTm90ZS5HXG4gICAgICAgIH07XG5cbiAgICAgICAgaW50W10gd2hvbGVfZmxhdHMgPSB7XG4gICAgICAgICAgICBXaGl0ZU5vdGUuQSwgXG4gICAgICAgICAgICBXaGl0ZU5vdGUuQiwgV2hpdGVOb3RlLkIsXG4gICAgICAgICAgICBXaGl0ZU5vdGUuQyxcbiAgICAgICAgICAgIFdoaXRlTm90ZS5ELCBXaGl0ZU5vdGUuRCxcbiAgICAgICAgICAgIFdoaXRlTm90ZS5FLCBXaGl0ZU5vdGUuRSxcbiAgICAgICAgICAgIFdoaXRlTm90ZS5GLFxuICAgICAgICAgICAgV2hpdGVOb3RlLkcsIFdoaXRlTm90ZS5HLFxuICAgICAgICAgICAgV2hpdGVOb3RlLkFcbiAgICAgICAgfTtcblxuICAgICAgICBBY2NpZCBhY2NpZCA9IGtleW1hcFtub3RlbnVtYmVyXTtcbiAgICAgICAgaWYgKGFjY2lkID09IEFjY2lkLkZsYXQpIHtcbiAgICAgICAgICAgIGxldHRlciA9IHdob2xlX2ZsYXRzW25vdGVzY2FsZV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYWNjaWQgPT0gQWNjaWQuU2hhcnApIHtcbiAgICAgICAgICAgIGxldHRlciA9IHdob2xlX3NoYXJwc1tub3Rlc2NhbGVdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFjY2lkID09IEFjY2lkLk5hdHVyYWwpIHtcbiAgICAgICAgICAgIGxldHRlciA9IHdob2xlX3NoYXJwc1tub3Rlc2NhbGVdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFjY2lkID09IEFjY2lkLk5vbmUpIHtcbiAgICAgICAgICAgIGxldHRlciA9IHdob2xlX3NoYXJwc1tub3Rlc2NhbGVdO1xuXG4gICAgICAgICAgICAvKiBJZiB0aGUgbm90ZSBudW1iZXIgaXMgYSBzaGFycC9mbGF0LCBhbmQgdGhlcmUncyBubyBhY2NpZGVudGFsLFxuICAgICAgICAgICAgICogZGV0ZXJtaW5lIHRoZSB3aGl0ZSBub3RlIGJ5IHNlZWluZyB3aGV0aGVyIHRoZSBwcmV2aW91cyBvciBuZXh0IG5vdGVcbiAgICAgICAgICAgICAqIGlzIGEgbmF0dXJhbC5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYgKE5vdGVTY2FsZS5Jc0JsYWNrS2V5KG5vdGVzY2FsZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5bWFwW25vdGVudW1iZXItMV0gPT0gQWNjaWQuTmF0dXJhbCAmJiBcbiAgICAgICAgICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXIrMV0gPT0gQWNjaWQuTmF0dXJhbCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChudW1fZmxhdHMgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXR0ZXIgPSB3aG9sZV9mbGF0c1tub3Rlc2NhbGVdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0dGVyID0gd2hvbGVfc2hhcnBzW25vdGVzY2FsZV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoa2V5bWFwW25vdGVudW1iZXItMV0gPT0gQWNjaWQuTmF0dXJhbCkge1xuICAgICAgICAgICAgICAgICAgICBsZXR0ZXIgPSB3aG9sZV9zaGFycHNbbm90ZXNjYWxlXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoa2V5bWFwW25vdGVudW1iZXIrMV0gPT0gQWNjaWQuTmF0dXJhbCkge1xuICAgICAgICAgICAgICAgICAgICBsZXR0ZXIgPSB3aG9sZV9mbGF0c1tub3Rlc2NhbGVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFRoZSBhYm92ZSBhbGdvcml0aG0gZG9lc24ndCBxdWl0ZSB3b3JrIGZvciBHLWZsYXQgbWFqb3IuXG4gICAgICAgICAqIEhhbmRsZSBpdCBoZXJlLlxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKG51bV9mbGF0cyA9PSBHZmxhdCAmJiBub3Rlc2NhbGUgPT0gTm90ZVNjYWxlLkIpIHtcbiAgICAgICAgICAgIGxldHRlciA9IFdoaXRlTm90ZS5DO1xuICAgICAgICB9XG4gICAgICAgIGlmIChudW1fZmxhdHMgPT0gR2ZsYXQgJiYgbm90ZXNjYWxlID09IE5vdGVTY2FsZS5CZmxhdCkge1xuICAgICAgICAgICAgbGV0dGVyID0gV2hpdGVOb3RlLkI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobnVtX2ZsYXRzID4gMCAmJiBub3Rlc2NhbGUgPT0gTm90ZVNjYWxlLkFmbGF0KSB7XG4gICAgICAgICAgICBvY3RhdmUrKztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgV2hpdGVOb3RlKGxldHRlciwgb2N0YXZlKTtcbiAgICB9XG5cblxuICAgIC8qKiBHdWVzcyB0aGUga2V5IHNpZ25hdHVyZSwgZ2l2ZW4gdGhlIG1pZGkgbm90ZSBudW1iZXJzIHVzZWQgaW5cbiAgICAgKiB0aGUgc29uZy5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIEtleVNpZ25hdHVyZSBHdWVzcyhMaXN0PGludD4gbm90ZXMpIHtcbiAgICAgICAgQ3JlYXRlQWNjaWRlbnRhbE1hcHMoKTtcblxuICAgICAgICAvKiBHZXQgdGhlIGZyZXF1ZW5jeSBjb3VudCBvZiBlYWNoIG5vdGUgaW4gdGhlIDEyLW5vdGUgc2NhbGUgKi9cbiAgICAgICAgaW50W10gbm90ZWNvdW50ID0gbmV3IGludFsxMl07XG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgbm90ZXMuQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgaW50IG5vdGVudW1iZXIgPSBub3Rlc1tpXTtcbiAgICAgICAgICAgIGludCBub3Rlc2NhbGUgPSAobm90ZW51bWJlciArIDMpICUgMTI7XG4gICAgICAgICAgICBub3RlY291bnRbbm90ZXNjYWxlXSArPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogRm9yIGVhY2gga2V5IHNpZ25hdHVyZSwgY291bnQgdGhlIHRvdGFsIG51bWJlciBvZiBhY2NpZGVudGFsc1xuICAgICAgICAgKiBuZWVkZWQgdG8gZGlzcGxheSBhbGwgdGhlIG5vdGVzLiAgQ2hvb3NlIHRoZSBrZXkgc2lnbmF0dXJlXG4gICAgICAgICAqIHdpdGggdGhlIGZld2VzdCBhY2NpZGVudGFscy5cbiAgICAgICAgICovXG4gICAgICAgIGludCBiZXN0a2V5ID0gMDtcbiAgICAgICAgYm9vbCBpc19iZXN0X3NoYXJwID0gdHJ1ZTtcbiAgICAgICAgaW50IHNtYWxsZXN0X2FjY2lkX2NvdW50ID0gbm90ZXMuQ291bnQ7XG4gICAgICAgIGludCBrZXk7XG5cbiAgICAgICAgZm9yIChrZXkgPSAwOyBrZXkgPCA2OyBrZXkrKykge1xuICAgICAgICAgICAgaW50IGFjY2lkX2NvdW50ID0gMDtcbiAgICAgICAgICAgIGZvciAoaW50IG4gPSAwOyBuIDwgMTI7IG4rKykge1xuICAgICAgICAgICAgICAgIGlmIChzaGFycGtleXNba2V5XVtuXSAhPSBBY2NpZC5Ob25lKSB7XG4gICAgICAgICAgICAgICAgICAgIGFjY2lkX2NvdW50ICs9IG5vdGVjb3VudFtuXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYWNjaWRfY291bnQgPCBzbWFsbGVzdF9hY2NpZF9jb3VudCkge1xuICAgICAgICAgICAgICAgIHNtYWxsZXN0X2FjY2lkX2NvdW50ID0gYWNjaWRfY291bnQ7XG4gICAgICAgICAgICAgICAgYmVzdGtleSA9IGtleTtcbiAgICAgICAgICAgICAgICBpc19iZXN0X3NoYXJwID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoa2V5ID0gMDsga2V5IDwgNzsga2V5KyspIHtcbiAgICAgICAgICAgIGludCBhY2NpZF9jb3VudCA9IDA7XG4gICAgICAgICAgICBmb3IgKGludCBuID0gMDsgbiA8IDEyOyBuKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoZmxhdGtleXNba2V5XVtuXSAhPSBBY2NpZC5Ob25lKSB7XG4gICAgICAgICAgICAgICAgICAgIGFjY2lkX2NvdW50ICs9IG5vdGVjb3VudFtuXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYWNjaWRfY291bnQgPCBzbWFsbGVzdF9hY2NpZF9jb3VudCkge1xuICAgICAgICAgICAgICAgIHNtYWxsZXN0X2FjY2lkX2NvdW50ID0gYWNjaWRfY291bnQ7XG4gICAgICAgICAgICAgICAgYmVzdGtleSA9IGtleTtcbiAgICAgICAgICAgICAgICBpc19iZXN0X3NoYXJwID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzX2Jlc3Rfc2hhcnApIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgS2V5U2lnbmF0dXJlKGJlc3RrZXksIDApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBLZXlTaWduYXR1cmUoMCwgYmVzdGtleSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRydWUgaWYgdGhpcyBrZXkgc2lnbmF0dXJlIGlzIGVxdWFsIHRvIGtleSBzaWduYXR1cmUgayAqL1xuICAgIHB1YmxpYyBib29sIEVxdWFscyhLZXlTaWduYXR1cmUgaykge1xuICAgICAgICBpZiAoay5udW1fc2hhcnBzID09IG51bV9zaGFycHMgJiYgay5udW1fZmxhdHMgPT0gbnVtX2ZsYXRzKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiBSZXR1cm4gdGhlIE1ham9yIEtleSBvZiB0aGlzIEtleSBTaWduYXR1cmUgKi9cbiAgICBwdWJsaWMgaW50IE5vdGVzY2FsZSgpIHtcbiAgICAgICAgaW50W10gZmxhdG1ham9yID0ge1xuICAgICAgICAgICAgTm90ZVNjYWxlLkMsIE5vdGVTY2FsZS5GLCBOb3RlU2NhbGUuQmZsYXQsIE5vdGVTY2FsZS5FZmxhdCxcbiAgICAgICAgICAgIE5vdGVTY2FsZS5BZmxhdCwgTm90ZVNjYWxlLkRmbGF0LCBOb3RlU2NhbGUuR2ZsYXQsIE5vdGVTY2FsZS5CIFxuICAgICAgICB9O1xuXG4gICAgICAgIGludFtdIHNoYXJwbWFqb3IgPSB7XG4gICAgICAgICAgICBOb3RlU2NhbGUuQywgTm90ZVNjYWxlLkcsIE5vdGVTY2FsZS5ELCBOb3RlU2NhbGUuQSwgTm90ZVNjYWxlLkUsXG4gICAgICAgICAgICBOb3RlU2NhbGUuQiwgTm90ZVNjYWxlLkZzaGFycCwgTm90ZVNjYWxlLkNzaGFycCwgTm90ZVNjYWxlLkdzaGFycCxcbiAgICAgICAgICAgIE5vdGVTY2FsZS5Ec2hhcnBcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKG51bV9mbGF0cyA+IDApXG4gICAgICAgICAgICByZXR1cm4gZmxhdG1ham9yW251bV9mbGF0c107XG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICByZXR1cm4gc2hhcnBtYWpvcltudW1fc2hhcnBzXTtcbiAgICB9XG5cbiAgICAvKiBDb252ZXJ0IGEgTWFqb3IgS2V5IGludG8gYSBzdHJpbmcgKi9cbiAgICBwdWJsaWMgc3RhdGljIHN0cmluZyBLZXlUb1N0cmluZyhpbnQgbm90ZXNjYWxlKSB7XG4gICAgICAgIHN3aXRjaCAobm90ZXNjYWxlKSB7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5BOiAgICAgcmV0dXJuIFwiQSBtYWpvciwgRiMgbWlub3JcIiA7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5CZmxhdDogcmV0dXJuIFwiQi1mbGF0IG1ham9yLCBHIG1pbm9yXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5COiAgICAgcmV0dXJuIFwiQiBtYWpvciwgQS1mbGF0IG1pbm9yXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5DOiAgICAgcmV0dXJuIFwiQyBtYWpvciwgQSBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRGZsYXQ6IHJldHVybiBcIkQtZmxhdCBtYWpvciwgQi1mbGF0IG1pbm9yXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5EOiAgICAgcmV0dXJuIFwiRCBtYWpvciwgQiBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRWZsYXQ6IHJldHVybiBcIkUtZmxhdCBtYWpvciwgQyBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRTogICAgIHJldHVybiBcIkUgbWFqb3IsIEMjIG1pbm9yXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5GOiAgICAgcmV0dXJuIFwiRiBtYWpvciwgRCBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuR2ZsYXQ6IHJldHVybiBcIkctZmxhdCBtYWpvciwgRS1mbGF0IG1pbm9yXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5HOiAgICAgcmV0dXJuIFwiRyBtYWpvciwgRSBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQWZsYXQ6IHJldHVybiBcIkEtZmxhdCBtYWpvciwgRiBtaW5vclwiO1xuICAgICAgICAgICAgZGVmYXVsdDogICAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMga2V5IHNpZ25hdHVyZS5cbiAgICAgKiBXZSBvbmx5IHJldHVybiB0aGUgbWFqb3Iga2V5IHNpZ25hdHVyZSwgbm90IHRoZSBtaW5vciBvbmUuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIEtleVRvU3RyaW5nKCBOb3Rlc2NhbGUoKSApO1xuICAgIH1cblxuXG59XG5cbn1cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMiBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogQGNsYXNzIEx5cmljU3ltYm9sXG4gKiAgQSBseXJpYyBjb250YWlucyB0aGUgbHlyaWMgdG8gZGlzcGxheSwgdGhlIHN0YXJ0IHRpbWUgdGhlIGx5cmljIG9jY3VycyBhdCxcbiAqICB0aGUgdGhlIHgtY29vcmRpbmF0ZSB3aGVyZSBpdCB3aWxsIGJlIGRpc3BsYXllZC5cbiAqL1xucHVibGljIGNsYXNzIEx5cmljU3ltYm9sIHtcbiAgICBwcml2YXRlIGludCBzdGFydHRpbWU7ICAgLyoqIFRoZSBzdGFydCB0aW1lLCBpbiBwdWxzZXMgKi9cbiAgICBwcml2YXRlIHN0cmluZyB0ZXh0OyAgICAgLyoqIFRoZSBseXJpYyB0ZXh0ICovXG4gICAgcHJpdmF0ZSBpbnQgeDsgICAgICAgICAgIC8qKiBUaGUgeCAoaG9yaXpvbnRhbCkgcG9zaXRpb24gd2l0aGluIHRoZSBzdGFmZiAqL1xuXG4gICAgcHVibGljIEx5cmljU3ltYm9sKGludCBzdGFydHRpbWUsIHN0cmluZyB0ZXh0KSB7XG4gICAgICAgIHRoaXMuc3RhcnR0aW1lID0gc3RhcnR0aW1lOyBcbiAgICAgICAgdGhpcy50ZXh0ID0gdGV4dDtcbiAgICB9XG4gICAgIFxuICAgIHB1YmxpYyBpbnQgU3RhcnRUaW1lIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHN0YXJ0dGltZTsgfVxuICAgICAgICBzZXQgeyBzdGFydHRpbWUgPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzdHJpbmcgVGV4dCB7XG4gICAgICAgIGdldCB7IHJldHVybiB0ZXh0OyB9XG4gICAgICAgIHNldCB7IHRleHQgPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIHB1YmxpYyBpbnQgWCB7XG4gICAgICAgIGdldCB7IHJldHVybiB4OyB9XG4gICAgICAgIHNldCB7IHggPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIHB1YmxpYyBpbnQgTWluV2lkdGgge1xuICAgICAgICBnZXQgeyByZXR1cm4gbWluV2lkdGgoKTsgfVxuICAgIH1cblxuICAgIC8qIFJldHVybiB0aGUgbWluaW11bSB3aWR0aCBpbiBwaXhlbHMgbmVlZGVkIHRvIGRpc3BsYXkgdGhpcyBseXJpYy5cbiAgICAgKiBUaGlzIGlzIGFuIGVzdGltYXRpb24sIG5vdCBleGFjdC5cbiAgICAgKi9cbiAgICBwcml2YXRlIGludCBtaW5XaWR0aCgpIHsgXG4gICAgICAgIGZsb2F0IHdpZHRoUGVyQ2hhciA9IFNoZWV0TXVzaWMuTGV0dGVyRm9udC5HZXRIZWlnaHQoKSAqIDIuMGYvMy4wZjtcbiAgICAgICAgZmxvYXQgd2lkdGggPSB0ZXh0Lkxlbmd0aCAqIHdpZHRoUGVyQ2hhcjtcbiAgICAgICAgaWYgKHRleHQuSW5kZXhPZihcImlcIikgPj0gMCkge1xuICAgICAgICAgICAgd2lkdGggLT0gd2lkdGhQZXJDaGFyLzIuMGY7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRleHQuSW5kZXhPZihcImpcIikgPj0gMCkge1xuICAgICAgICAgICAgd2lkdGggLT0gd2lkdGhQZXJDaGFyLzIuMGY7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRleHQuSW5kZXhPZihcImxcIikgPj0gMCkge1xuICAgICAgICAgICAgd2lkdGggLT0gd2lkdGhQZXJDaGFyLzIuMGY7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChpbnQpd2lkdGg7XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIFxuICAgIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJMeXJpYyBzdGFydD17MH0geD17MX0gdGV4dD17Mn1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnR0aW1lLCB4LCB0ZXh0KTtcbiAgICB9XG5cbn1cblxuXG59XG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTIgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIEBjbGFzcyBNaWRpRXZlbnRcbiAqIEEgTWlkaUV2ZW50IHJlcHJlc2VudHMgYSBzaW5nbGUgZXZlbnQgKHN1Y2ggYXMgRXZlbnROb3RlT24pIGluIHRoZVxuICogTWlkaSBmaWxlLiBJdCBpbmNsdWRlcyB0aGUgZGVsdGEgdGltZSBvZiB0aGUgZXZlbnQuXG4gKi9cbnB1YmxpYyBjbGFzcyBNaWRpRXZlbnQgOiBJQ29tcGFyZXI8TWlkaUV2ZW50PiB7XG5cbiAgICBwdWJsaWMgaW50ICAgIERlbHRhVGltZTsgICAgIC8qKiBUaGUgdGltZSBiZXR3ZWVuIHRoZSBwcmV2aW91cyBldmVudCBhbmQgdGhpcyBvbiAqL1xuICAgIHB1YmxpYyBpbnQgICAgU3RhcnRUaW1lOyAgICAgLyoqIFRoZSBhYnNvbHV0ZSB0aW1lIHRoaXMgZXZlbnQgb2NjdXJzICovXG4gICAgcHVibGljIGJvb2wgICBIYXNFdmVudGZsYWc7ICAvKiogRmFsc2UgaWYgdGhpcyBpcyB1c2luZyB0aGUgcHJldmlvdXMgZXZlbnRmbGFnICovXG4gICAgcHVibGljIGJ5dGUgICBFdmVudEZsYWc7ICAgICAvKiogTm90ZU9uLCBOb3RlT2ZmLCBldGMuICBGdWxsIGxpc3QgaXMgaW4gY2xhc3MgTWlkaUZpbGUgKi9cbiAgICBwdWJsaWMgYnl0ZSAgIENoYW5uZWw7ICAgICAgIC8qKiBUaGUgY2hhbm5lbCB0aGlzIGV2ZW50IG9jY3VycyBvbiAqLyBcblxuICAgIHB1YmxpYyBieXRlICAgTm90ZW51bWJlcjsgICAgLyoqIFRoZSBub3RlIG51bWJlciAgKi9cbiAgICBwdWJsaWMgYnl0ZSAgIFZlbG9jaXR5OyAgICAgIC8qKiBUaGUgdm9sdW1lIG9mIHRoZSBub3RlICovXG4gICAgcHVibGljIGJ5dGUgICBJbnN0cnVtZW50OyAgICAvKiogVGhlIGluc3RydW1lbnQgKi9cbiAgICBwdWJsaWMgYnl0ZSAgIEtleVByZXNzdXJlOyAgIC8qKiBUaGUga2V5IHByZXNzdXJlICovXG4gICAgcHVibGljIGJ5dGUgICBDaGFuUHJlc3N1cmU7ICAvKiogVGhlIGNoYW5uZWwgcHJlc3N1cmUgKi9cbiAgICBwdWJsaWMgYnl0ZSAgIENvbnRyb2xOdW07ICAgIC8qKiBUaGUgY29udHJvbGxlciBudW1iZXIgKi9cbiAgICBwdWJsaWMgYnl0ZSAgIENvbnRyb2xWYWx1ZTsgIC8qKiBUaGUgY29udHJvbGxlciB2YWx1ZSAqL1xuICAgIHB1YmxpYyB1c2hvcnQgUGl0Y2hCZW5kOyAgICAgLyoqIFRoZSBwaXRjaCBiZW5kIHZhbHVlICovXG4gICAgcHVibGljIGJ5dGUgICBOdW1lcmF0b3I7ICAgICAvKiogVGhlIG51bWVyYXRvciwgZm9yIFRpbWVTaWduYXR1cmUgbWV0YSBldmVudHMgKi9cbiAgICBwdWJsaWMgYnl0ZSAgIERlbm9taW5hdG9yOyAgIC8qKiBUaGUgZGVub21pbmF0b3IsIGZvciBUaW1lU2lnbmF0dXJlIG1ldGEgZXZlbnRzICovXG4gICAgcHVibGljIGludCAgICBUZW1wbzsgICAgICAgICAvKiogVGhlIHRlbXBvLCBmb3IgVGVtcG8gbWV0YSBldmVudHMgKi9cbiAgICBwdWJsaWMgYnl0ZSAgIE1ldGFldmVudDsgICAgIC8qKiBUaGUgbWV0YWV2ZW50LCB1c2VkIGlmIGV2ZW50ZmxhZyBpcyBNZXRhRXZlbnQgKi9cbiAgICBwdWJsaWMgaW50ICAgIE1ldGFsZW5ndGg7ICAgIC8qKiBUaGUgbWV0YWV2ZW50IGxlbmd0aCAgKi9cbiAgICBwdWJsaWMgYnl0ZVtdIFZhbHVlOyAgICAgICAgIC8qKiBUaGUgcmF3IGJ5dGUgdmFsdWUsIGZvciBTeXNleCBhbmQgbWV0YSBldmVudHMgKi9cblxuICAgIHB1YmxpYyBNaWRpRXZlbnQoKSB7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiBhIGNvcHkgb2YgdGhpcyBldmVudCAqL1xuICAgIHB1YmxpYyBNaWRpRXZlbnQgQ2xvbmUoKSB7XG4gICAgICAgIE1pZGlFdmVudCBtZXZlbnQ9IG5ldyBNaWRpRXZlbnQoKTtcbiAgICAgICAgbWV2ZW50LkRlbHRhVGltZSA9IERlbHRhVGltZTtcbiAgICAgICAgbWV2ZW50LlN0YXJ0VGltZSA9IFN0YXJ0VGltZTtcbiAgICAgICAgbWV2ZW50Lkhhc0V2ZW50ZmxhZyA9IEhhc0V2ZW50ZmxhZztcbiAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IEV2ZW50RmxhZztcbiAgICAgICAgbWV2ZW50LkNoYW5uZWwgPSBDaGFubmVsO1xuICAgICAgICBtZXZlbnQuTm90ZW51bWJlciA9IE5vdGVudW1iZXI7XG4gICAgICAgIG1ldmVudC5WZWxvY2l0eSA9IFZlbG9jaXR5O1xuICAgICAgICBtZXZlbnQuSW5zdHJ1bWVudCA9IEluc3RydW1lbnQ7XG4gICAgICAgIG1ldmVudC5LZXlQcmVzc3VyZSA9IEtleVByZXNzdXJlO1xuICAgICAgICBtZXZlbnQuQ2hhblByZXNzdXJlID0gQ2hhblByZXNzdXJlO1xuICAgICAgICBtZXZlbnQuQ29udHJvbE51bSA9IENvbnRyb2xOdW07XG4gICAgICAgIG1ldmVudC5Db250cm9sVmFsdWUgPSBDb250cm9sVmFsdWU7XG4gICAgICAgIG1ldmVudC5QaXRjaEJlbmQgPSBQaXRjaEJlbmQ7XG4gICAgICAgIG1ldmVudC5OdW1lcmF0b3IgPSBOdW1lcmF0b3I7XG4gICAgICAgIG1ldmVudC5EZW5vbWluYXRvciA9IERlbm9taW5hdG9yO1xuICAgICAgICBtZXZlbnQuVGVtcG8gPSBUZW1wbztcbiAgICAgICAgbWV2ZW50Lk1ldGFldmVudCA9IE1ldGFldmVudDtcbiAgICAgICAgbWV2ZW50Lk1ldGFsZW5ndGggPSBNZXRhbGVuZ3RoO1xuICAgICAgICBtZXZlbnQuVmFsdWUgPSBWYWx1ZTtcbiAgICAgICAgcmV0dXJuIG1ldmVudDtcbiAgICB9XG5cbiAgICAvKiogQ29tcGFyZSB0d28gTWlkaUV2ZW50cyBiYXNlZCBvbiB0aGVpciBzdGFydCB0aW1lcy4gKi9cbiAgICBwdWJsaWMgaW50IENvbXBhcmUoTWlkaUV2ZW50IHgsIE1pZGlFdmVudCB5KSB7XG4gICAgICAgIGlmICh4LlN0YXJ0VGltZSA9PSB5LlN0YXJ0VGltZSkge1xuICAgICAgICAgICAgaWYgKHguRXZlbnRGbGFnID09IHkuRXZlbnRGbGFnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHguTm90ZW51bWJlciAtIHkuTm90ZW51bWJlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB4LkV2ZW50RmxhZyAtIHkuRXZlbnRGbGFnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHguU3RhcnRUaW1lIC0geS5TdGFydFRpbWU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbn0gIC8qIEVuZCBuYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMgKi9cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDEyIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbi8qIFRoaXMgZmlsZSBjb250YWlucyB0aGUgY2xhc3NlcyBmb3IgcGFyc2luZyBhbmQgbW9kaWZ5aW5nXG4gKiBNSURJIG11c2ljIGZpbGVzLlxuICovXG5cbi8qIE1JREkgZmlsZSBmb3JtYXQuXG4gKlxuICogVGhlIE1pZGkgRmlsZSBmb3JtYXQgaXMgZGVzY3JpYmVkIGJlbG93LiAgVGhlIGRlc2NyaXB0aW9uIHVzZXNcbiAqIHRoZSBmb2xsb3dpbmcgYWJicmV2aWF0aW9ucy5cbiAqXG4gKiB1MSAgICAgLSBPbmUgYnl0ZVxuICogdTIgICAgIC0gVHdvIGJ5dGVzIChiaWcgZW5kaWFuKVxuICogdTQgICAgIC0gRm91ciBieXRlcyAoYmlnIGVuZGlhbilcbiAqIHZhcmxlbiAtIEEgdmFyaWFibGUgbGVuZ3RoIGludGVnZXIsIHRoYXQgY2FuIGJlIDEgdG8gNCBieXRlcy4gVGhlIFxuICogICAgICAgICAgaW50ZWdlciBlbmRzIHdoZW4geW91IGVuY291bnRlciBhIGJ5dGUgdGhhdCBkb2Vzbid0IGhhdmUgXG4gKiAgICAgICAgICB0aGUgOHRoIGJpdCBzZXQgKGEgYnl0ZSBsZXNzIHRoYW4gMHg4MCkuXG4gKiBsZW4/ICAgLSBUaGUgbGVuZ3RoIG9mIHRoZSBkYXRhIGRlcGVuZHMgb24gc29tZSBjb2RlXG4gKiAgICAgICAgICBcbiAqXG4gKiBUaGUgTWlkaSBmaWxlcyBiZWdpbnMgd2l0aCB0aGUgbWFpbiBNaWRpIGhlYWRlclxuICogdTQgPSBUaGUgZm91ciBhc2NpaSBjaGFyYWN0ZXJzICdNVGhkJ1xuICogdTQgPSBUaGUgbGVuZ3RoIG9mIHRoZSBNVGhkIGhlYWRlciA9IDYgYnl0ZXNcbiAqIHUyID0gMCBpZiB0aGUgZmlsZSBjb250YWlucyBhIHNpbmdsZSB0cmFja1xuICogICAgICAxIGlmIHRoZSBmaWxlIGNvbnRhaW5zIG9uZSBvciBtb3JlIHNpbXVsdGFuZW91cyB0cmFja3NcbiAqICAgICAgMiBpZiB0aGUgZmlsZSBjb250YWlucyBvbmUgb3IgbW9yZSBpbmRlcGVuZGVudCB0cmFja3NcbiAqIHUyID0gbnVtYmVyIG9mIHRyYWNrc1xuICogdTIgPSBpZiA+ICAwLCB0aGUgbnVtYmVyIG9mIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlXG4gKiAgICAgIGlmIDw9IDAsIHRoZW4gPz8/XG4gKlxuICogTmV4dCBjb21lIHRoZSBpbmRpdmlkdWFsIE1pZGkgdHJhY2tzLiAgVGhlIHRvdGFsIG51bWJlciBvZiBNaWRpXG4gKiB0cmFja3Mgd2FzIGdpdmVuIGFib3ZlLCBpbiB0aGUgTVRoZCBoZWFkZXIuICBFYWNoIHRyYWNrIHN0YXJ0c1xuICogd2l0aCBhIGhlYWRlcjpcbiAqXG4gKiB1NCA9IFRoZSBmb3VyIGFzY2lpIGNoYXJhY3RlcnMgJ01UcmsnXG4gKiB1NCA9IEFtb3VudCBvZiB0cmFjayBkYXRhLCBpbiBieXRlcy5cbiAqIFxuICogVGhlIHRyYWNrIGRhdGEgY29uc2lzdHMgb2YgYSBzZXJpZXMgb2YgTWlkaSBldmVudHMuICBFYWNoIE1pZGkgZXZlbnRcbiAqIGhhcyB0aGUgZm9sbG93aW5nIGZvcm1hdDpcbiAqXG4gKiB2YXJsZW4gIC0gVGhlIHRpbWUgYmV0d2VlbiB0aGUgcHJldmlvdXMgZXZlbnQgYW5kIHRoaXMgZXZlbnQsIG1lYXN1cmVkXG4gKiAgICAgICAgICAgaW4gXCJwdWxzZXNcIi4gIFRoZSBudW1iZXIgb2YgcHVsc2VzIHBlciBxdWFydGVyIG5vdGUgaXMgZ2l2ZW5cbiAqICAgICAgICAgICBpbiB0aGUgTVRoZCBoZWFkZXIuXG4gKiB1MSAgICAgIC0gVGhlIEV2ZW50IGNvZGUsIGFsd2F5cyBiZXR3ZWUgMHg4MCBhbmQgMHhGRlxuICogbGVuPyAgICAtIFRoZSBldmVudCBkYXRhLiAgVGhlIGxlbmd0aCBvZiB0aGlzIGRhdGEgaXMgZGV0ZXJtaW5lZCBieSB0aGVcbiAqICAgICAgICAgICBldmVudCBjb2RlLiAgVGhlIGZpcnN0IGJ5dGUgb2YgdGhlIGV2ZW50IGRhdGEgaXMgYWx3YXlzIDwgMHg4MC5cbiAqXG4gKiBUaGUgZXZlbnQgY29kZSBpcyBvcHRpb25hbC4gIElmIHRoZSBldmVudCBjb2RlIGlzIG1pc3NpbmcsIHRoZW4gaXRcbiAqIGRlZmF1bHRzIHRvIHRoZSBwcmV2aW91cyBldmVudCBjb2RlLiAgRm9yIGV4YW1wbGU6XG4gKlxuICogICB2YXJsZW4sIGV2ZW50Y29kZTEsIGV2ZW50ZGF0YSxcbiAqICAgdmFybGVuLCBldmVudGNvZGUyLCBldmVudGRhdGEsXG4gKiAgIHZhcmxlbiwgZXZlbnRkYXRhLCAgLy8gZXZlbnRjb2RlIGlzIGV2ZW50Y29kZTJcbiAqICAgdmFybGVuLCBldmVudGRhdGEsICAvLyBldmVudGNvZGUgaXMgZXZlbnRjb2RlMlxuICogICB2YXJsZW4sIGV2ZW50Y29kZTMsIGV2ZW50ZGF0YSxcbiAqICAgLi4uLlxuICpcbiAqICAgSG93IGRvIHlvdSBrbm93IGlmIHRoZSBldmVudGNvZGUgaXMgdGhlcmUgb3IgbWlzc2luZz8gV2VsbDpcbiAqICAgLSBBbGwgZXZlbnQgY29kZXMgYXJlIGJldHdlZW4gMHg4MCBhbmQgMHhGRlxuICogICAtIFRoZSBmaXJzdCBieXRlIG9mIGV2ZW50ZGF0YSBpcyBhbHdheXMgbGVzcyB0aGFuIDB4ODAuXG4gKiAgIFNvLCBhZnRlciB0aGUgdmFybGVuIGRlbHRhIHRpbWUsIGlmIHRoZSBuZXh0IGJ5dGUgaXMgYmV0d2VlbiAweDgwXG4gKiAgIGFuZCAweEZGLCBpdHMgYW4gZXZlbnQgY29kZS4gIE90aGVyd2lzZSwgaXRzIGV2ZW50IGRhdGEuXG4gKlxuICogVGhlIEV2ZW50IGNvZGVzIGFuZCBldmVudCBkYXRhIGZvciBlYWNoIGV2ZW50IGNvZGUgYXJlIHNob3duIGJlbG93LlxuICpcbiAqIENvZGU6ICB1MSAtIDB4ODAgdGhydSAweDhGIC0gTm90ZSBPZmYgZXZlbnQuXG4gKiAgICAgICAgICAgICAweDgwIGlzIGZvciBjaGFubmVsIDEsIDB4OEYgaXMgZm9yIGNoYW5uZWwgMTYuXG4gKiBEYXRhOiAgdTEgLSBUaGUgbm90ZSBudW1iZXIsIDAtMTI3LiAgTWlkZGxlIEMgaXMgNjAgKDB4M0MpXG4gKiAgICAgICAgdTEgLSBUaGUgbm90ZSB2ZWxvY2l0eS4gIFRoaXMgc2hvdWxkIGJlIDBcbiAqIFxuICogQ29kZTogIHUxIC0gMHg5MCB0aHJ1IDB4OUYgLSBOb3RlIE9uIGV2ZW50LlxuICogICAgICAgICAgICAgMHg5MCBpcyBmb3IgY2hhbm5lbCAxLCAweDlGIGlzIGZvciBjaGFubmVsIDE2LlxuICogRGF0YTogIHUxIC0gVGhlIG5vdGUgbnVtYmVyLCAwLTEyNy4gIE1pZGRsZSBDIGlzIDYwICgweDNDKVxuICogICAgICAgIHUxIC0gVGhlIG5vdGUgdmVsb2NpdHksIGZyb20gMCAobm8gc291bmQpIHRvIDEyNyAobG91ZCkuXG4gKiAgICAgICAgICAgICBBIHZhbHVlIG9mIDAgaXMgZXF1aXZhbGVudCB0byBhIE5vdGUgT2ZmLlxuICpcbiAqIENvZGU6ICB1MSAtIDB4QTAgdGhydSAweEFGIC0gS2V5IFByZXNzdXJlXG4gKiBEYXRhOiAgdTEgLSBUaGUgbm90ZSBudW1iZXIsIDAtMTI3LlxuICogICAgICAgIHUxIC0gVGhlIHByZXNzdXJlLlxuICpcbiAqIENvZGU6ICB1MSAtIDB4QjAgdGhydSAweEJGIC0gQ29udHJvbCBDaGFuZ2VcbiAqIERhdGE6ICB1MSAtIFRoZSBjb250cm9sbGVyIG51bWJlclxuICogICAgICAgIHUxIC0gVGhlIHZhbHVlXG4gKlxuICogQ29kZTogIHUxIC0gMHhDMCB0aHJ1IDB4Q0YgLSBQcm9ncmFtIENoYW5nZVxuICogRGF0YTogIHUxIC0gVGhlIHByb2dyYW0gbnVtYmVyLlxuICpcbiAqIENvZGU6ICB1MSAtIDB4RDAgdGhydSAweERGIC0gQ2hhbm5lbCBQcmVzc3VyZVxuICogICAgICAgIHUxIC0gVGhlIHByZXNzdXJlLlxuICpcbiAqIENvZGU6ICB1MSAtIDB4RTAgdGhydSAweEVGIC0gUGl0Y2ggQmVuZFxuICogRGF0YTogIHUyIC0gU29tZSBkYXRhXG4gKlxuICogQ29kZTogIHUxICAgICAtIDB4RkYgLSBNZXRhIEV2ZW50XG4gKiBEYXRhOiAgdTEgICAgIC0gTWV0YWNvZGVcbiAqICAgICAgICB2YXJsZW4gLSBMZW5ndGggb2YgbWV0YSBldmVudFxuICogICAgICAgIHUxW3Zhcmxlbl0gLSBNZXRhIGV2ZW50IGRhdGEuXG4gKlxuICpcbiAqIFRoZSBNZXRhIEV2ZW50IGNvZGVzIGFyZSBsaXN0ZWQgYmVsb3c6XG4gKlxuICogTWV0YWNvZGU6IHUxICAgICAgICAgLSAweDAgIFNlcXVlbmNlIE51bWJlclxuICogICAgICAgICAgIHZhcmxlbiAgICAgLSAwIG9yIDJcbiAqICAgICAgICAgICB1MVt2YXJsZW5dIC0gU2VxdWVuY2UgbnVtYmVyXG4gKlxuICogTWV0YWNvZGU6IHUxICAgICAgICAgLSAweDEgIFRleHRcbiAqICAgICAgICAgICB2YXJsZW4gICAgIC0gTGVuZ3RoIG9mIHRleHRcbiAqICAgICAgICAgICB1MVt2YXJsZW5dIC0gVGV4dFxuICpcbiAqIE1ldGFjb2RlOiB1MSAgICAgICAgIC0gMHgyICBDb3B5cmlnaHRcbiAqICAgICAgICAgICB2YXJsZW4gICAgIC0gTGVuZ3RoIG9mIHRleHRcbiAqICAgICAgICAgICB1MVt2YXJsZW5dIC0gVGV4dFxuICpcbiAqIE1ldGFjb2RlOiB1MSAgICAgICAgIC0gMHgzICBUcmFjayBOYW1lXG4gKiAgICAgICAgICAgdmFybGVuICAgICAtIExlbmd0aCBvZiBuYW1lXG4gKiAgICAgICAgICAgdTFbdmFybGVuXSAtIFRyYWNrIE5hbWVcbiAqXG4gKiBNZXRhY29kZTogdTEgICAgICAgICAtIDB4NTggIFRpbWUgU2lnbmF0dXJlXG4gKiAgICAgICAgICAgdmFybGVuICAgICAtIDQgXG4gKiAgICAgICAgICAgdTEgICAgICAgICAtIG51bWVyYXRvclxuICogICAgICAgICAgIHUxICAgICAgICAgLSBsb2cyKGRlbm9taW5hdG9yKVxuICogICAgICAgICAgIHUxICAgICAgICAgLSBjbG9ja3MgaW4gbWV0cm9ub21lIGNsaWNrXG4gKiAgICAgICAgICAgdTEgICAgICAgICAtIDMybmQgbm90ZXMgaW4gcXVhcnRlciBub3RlICh1c3VhbGx5IDgpXG4gKlxuICogTWV0YWNvZGU6IHUxICAgICAgICAgLSAweDU5ICBLZXkgU2lnbmF0dXJlXG4gKiAgICAgICAgICAgdmFybGVuICAgICAtIDJcbiAqICAgICAgICAgICB1MSAgICAgICAgIC0gaWYgPj0gMCwgdGhlbiBudW1iZXIgb2Ygc2hhcnBzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgIGlmIDwgMCwgdGhlbiBudW1iZXIgb2YgZmxhdHMgKiAtMVxuICogICAgICAgICAgIHUxICAgICAgICAgLSAwIGlmIG1ham9yIGtleVxuICogICAgICAgICAgICAgICAgICAgICAgICAxIGlmIG1pbm9yIGtleVxuICpcbiAqIE1ldGFjb2RlOiB1MSAgICAgICAgIC0gMHg1MSAgVGVtcG9cbiAqICAgICAgICAgICB2YXJsZW4gICAgIC0gMyAgXG4gKiAgICAgICAgICAgdTMgICAgICAgICAtIHF1YXJ0ZXIgbm90ZSBsZW5ndGggaW4gbWljcm9zZWNvbmRzXG4gKi9cblxuXG4vKiogQGNsYXNzIE1pZGlGaWxlXG4gKlxuICogVGhlIE1pZGlGaWxlIGNsYXNzIGNvbnRhaW5zIHRoZSBwYXJzZWQgZGF0YSBmcm9tIHRoZSBNaWRpIEZpbGUuXG4gKiBJdCBjb250YWluczpcbiAqIC0gQWxsIHRoZSB0cmFja3MgaW4gdGhlIG1pZGkgZmlsZSwgaW5jbHVkaW5nIGFsbCBNaWRpTm90ZXMgcGVyIHRyYWNrLlxuICogLSBUaGUgdGltZSBzaWduYXR1cmUgKGUuZy4gNC80LCAzLzQsIDYvOClcbiAqIC0gVGhlIG51bWJlciBvZiBwdWxzZXMgcGVyIHF1YXJ0ZXIgbm90ZS5cbiAqIC0gVGhlIHRlbXBvIChudW1iZXIgb2YgbWljcm9zZWNvbmRzIHBlciBxdWFydGVyIG5vdGUpLlxuICpcbiAqIFRoZSBjb25zdHJ1Y3RvciB0YWtlcyBhIGZpbGVuYW1lIGFzIGlucHV0LCBhbmQgdXBvbiByZXR1cm5pbmcsXG4gKiBjb250YWlucyB0aGUgcGFyc2VkIGRhdGEgZnJvbSB0aGUgbWlkaSBmaWxlLlxuICpcbiAqIFRoZSBtZXRob2RzIFJlYWRUcmFjaygpIGFuZCBSZWFkTWV0YUV2ZW50KCkgYXJlIGhlbHBlciBmdW5jdGlvbnMgY2FsbGVkXG4gKiBieSB0aGUgY29uc3RydWN0b3IgZHVyaW5nIHRoZSBwYXJzaW5nLlxuICpcbiAqIEFmdGVyIHRoZSBNaWRpRmlsZSBpcyBwYXJzZWQgYW5kIGNyZWF0ZWQsIHRoZSB1c2VyIGNhbiByZXRyaWV2ZSB0aGUgXG4gKiB0cmFja3MgYW5kIG5vdGVzIGJ5IHVzaW5nIHRoZSBwcm9wZXJ0eSBUcmFja3MgYW5kIFRyYWNrcy5Ob3Rlcy5cbiAqXG4gKiBUaGVyZSBhcmUgdHdvIG1ldGhvZHMgZm9yIG1vZGlmeWluZyB0aGUgbWlkaSBkYXRhIGJhc2VkIG9uIHRoZSBtZW51XG4gKiBvcHRpb25zIHNlbGVjdGVkOlxuICpcbiAqIC0gQ2hhbmdlTWlkaU5vdGVzKClcbiAqICAgQXBwbHkgdGhlIG1lbnUgb3B0aW9ucyB0byB0aGUgcGFyc2VkIE1pZGlGaWxlLiAgVGhpcyB1c2VzIHRoZSBoZWxwZXIgZnVuY3Rpb25zOlxuICogICAgIFNwbGl0VHJhY2soKVxuICogICAgIENvbWJpbmVUb1R3b1RyYWNrcygpXG4gKiAgICAgU2hpZnRUaW1lKClcbiAqICAgICBUcmFuc3Bvc2UoKVxuICogICAgIFJvdW5kU3RhcnRUaW1lcygpXG4gKiAgICAgUm91bmREdXJhdGlvbnMoKVxuICpcbiAqIC0gQ2hhbmdlU291bmQoKVxuICogICBBcHBseSB0aGUgbWVudSBvcHRpb25zIHRvIHRoZSBNSURJIG11c2ljIGRhdGEsIGFuZCBzYXZlIHRoZSBtb2RpZmllZCBtaWRpIGRhdGEgXG4gKiAgIHRvIGEgZmlsZSwgZm9yIHBsYXliYWNrLiBcbiAqICAgXG4gKi9cblxucHVibGljIGNsYXNzIE1pZGlGaWxlIHtcbiAgICBwcml2YXRlIHN0cmluZyBmaWxlbmFtZTsgICAgICAgICAgLyoqIFRoZSBNaWRpIGZpbGUgbmFtZSAqL1xuICAgIHByaXZhdGUgTGlzdDxNaWRpRXZlbnQ+W10gZXZlbnRzOyAvKiogVGhlIHJhdyBNaWRpRXZlbnRzLCBvbmUgbGlzdCBwZXIgdHJhY2sgKi9cbiAgICBwcml2YXRlIExpc3Q8TWlkaVRyYWNrPiB0cmFja3MgOyAgLyoqIFRoZSB0cmFja3Mgb2YgdGhlIG1pZGlmaWxlIHRoYXQgaGF2ZSBub3RlcyAqL1xuICAgIHByaXZhdGUgdXNob3J0IHRyYWNrbW9kZTsgICAgICAgICAvKiogMCAoc2luZ2xlIHRyYWNrKSwgMSAoc2ltdWx0YW5lb3VzIHRyYWNrcykgMiAoaW5kZXBlbmRlbnQgdHJhY2tzKSAqL1xuICAgIHByaXZhdGUgVGltZVNpZ25hdHVyZSB0aW1lc2lnOyAgICAvKiogVGhlIHRpbWUgc2lnbmF0dXJlICovXG4gICAgcHJpdmF0ZSBpbnQgcXVhcnRlcm5vdGU7ICAgICAgICAgIC8qKiBUaGUgbnVtYmVyIG9mIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlICovXG4gICAgcHJpdmF0ZSBpbnQgdG90YWxwdWxzZXM7ICAgICAgICAgIC8qKiBUaGUgdG90YWwgbGVuZ3RoIG9mIHRoZSBzb25nLCBpbiBwdWxzZXMgKi9cbiAgICBwcml2YXRlIGJvb2wgdHJhY2tQZXJDaGFubmVsOyAgICAgLyoqIFRydWUgaWYgd2UndmUgc3BsaXQgZWFjaCBjaGFubmVsIGludG8gYSB0cmFjayAqL1xuXG4gICAgLyogVGhlIGxpc3Qgb2YgTWlkaSBFdmVudHMgKi9cbiAgICBwdWJsaWMgY29uc3QgaW50IEV2ZW50Tm90ZU9mZiAgICAgICAgID0gMHg4MDtcbiAgICBwdWJsaWMgY29uc3QgaW50IEV2ZW50Tm90ZU9uICAgICAgICAgID0gMHg5MDtcbiAgICBwdWJsaWMgY29uc3QgaW50IEV2ZW50S2V5UHJlc3N1cmUgICAgID0gMHhBMDtcbiAgICBwdWJsaWMgY29uc3QgaW50IEV2ZW50Q29udHJvbENoYW5nZSAgID0gMHhCMDtcbiAgICBwdWJsaWMgY29uc3QgaW50IEV2ZW50UHJvZ3JhbUNoYW5nZSAgID0gMHhDMDtcbiAgICBwdWJsaWMgY29uc3QgaW50IEV2ZW50Q2hhbm5lbFByZXNzdXJlID0gMHhEMDtcbiAgICBwdWJsaWMgY29uc3QgaW50IEV2ZW50UGl0Y2hCZW5kICAgICAgID0gMHhFMDtcbiAgICBwdWJsaWMgY29uc3QgaW50IFN5c2V4RXZlbnQxICAgICAgICAgID0gMHhGMDtcbiAgICBwdWJsaWMgY29uc3QgaW50IFN5c2V4RXZlbnQyICAgICAgICAgID0gMHhGNztcbiAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudCAgICAgICAgICAgID0gMHhGRjtcblxuICAgIC8qIFRoZSBsaXN0IG9mIE1ldGEgRXZlbnRzICovXG4gICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRTZXF1ZW5jZSAgICAgID0gMHgwO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50VGV4dCAgICAgICAgICA9IDB4MTtcbiAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudENvcHlyaWdodCAgICAgPSAweDI7XG4gICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRTZXF1ZW5jZU5hbWUgID0gMHgzO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50SW5zdHJ1bWVudCAgICA9IDB4NDtcbiAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudEx5cmljICAgICAgICAgPSAweDU7XG4gICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRNYXJrZXIgICAgICAgID0gMHg2O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50RW5kT2ZUcmFjayAgICA9IDB4MkY7XG4gICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRUZW1wbyAgICAgICAgID0gMHg1MTtcbiAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudFNNUFRFT2Zmc2V0ICAgPSAweDU0O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50VGltZVNpZ25hdHVyZSA9IDB4NTg7XG4gICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRLZXlTaWduYXR1cmUgID0gMHg1OTtcblxuICAgIC8qIFRoZSBQcm9ncmFtIENoYW5nZSBldmVudCBnaXZlcyB0aGUgaW5zdHJ1bWVudCB0aGF0IHNob3VsZFxuICAgICAqIGJlIHVzZWQgZm9yIGEgcGFydGljdWxhciBjaGFubmVsLiAgVGhlIGZvbGxvd2luZyB0YWJsZVxuICAgICAqIG1hcHMgZWFjaCBpbnN0cnVtZW50IG51bWJlciAoMCB0aHJ1IDEyOCkgdG8gYW4gaW5zdHJ1bWVudFxuICAgICAqIG5hbWUuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBzdHJpbmdbXSBJbnN0cnVtZW50cyA9IHtcblxuICAgICAgICBcIkFjb3VzdGljIEdyYW5kIFBpYW5vXCIsXG4gICAgICAgIFwiQnJpZ2h0IEFjb3VzdGljIFBpYW5vXCIsXG4gICAgICAgIFwiRWxlY3RyaWMgR3JhbmQgUGlhbm9cIixcbiAgICAgICAgXCJIb25reS10b25rIFBpYW5vXCIsXG4gICAgICAgIFwiRWxlY3RyaWMgUGlhbm8gMVwiLFxuICAgICAgICBcIkVsZWN0cmljIFBpYW5vIDJcIixcbiAgICAgICAgXCJIYXJwc2ljaG9yZFwiLFxuICAgICAgICBcIkNsYXZpXCIsXG4gICAgICAgIFwiQ2VsZXN0YVwiLFxuICAgICAgICBcIkdsb2NrZW5zcGllbFwiLFxuICAgICAgICBcIk11c2ljIEJveFwiLFxuICAgICAgICBcIlZpYnJhcGhvbmVcIixcbiAgICAgICAgXCJNYXJpbWJhXCIsXG4gICAgICAgIFwiWHlsb3Bob25lXCIsXG4gICAgICAgIFwiVHVidWxhciBCZWxsc1wiLFxuICAgICAgICBcIkR1bGNpbWVyXCIsXG4gICAgICAgIFwiRHJhd2JhciBPcmdhblwiLFxuICAgICAgICBcIlBlcmN1c3NpdmUgT3JnYW5cIixcbiAgICAgICAgXCJSb2NrIE9yZ2FuXCIsXG4gICAgICAgIFwiQ2h1cmNoIE9yZ2FuXCIsXG4gICAgICAgIFwiUmVlZCBPcmdhblwiLFxuICAgICAgICBcIkFjY29yZGlvblwiLFxuICAgICAgICBcIkhhcm1vbmljYVwiLFxuICAgICAgICBcIlRhbmdvIEFjY29yZGlvblwiLFxuICAgICAgICBcIkFjb3VzdGljIEd1aXRhciAobnlsb24pXCIsXG4gICAgICAgIFwiQWNvdXN0aWMgR3VpdGFyIChzdGVlbClcIixcbiAgICAgICAgXCJFbGVjdHJpYyBHdWl0YXIgKGphenopXCIsXG4gICAgICAgIFwiRWxlY3RyaWMgR3VpdGFyIChjbGVhbilcIixcbiAgICAgICAgXCJFbGVjdHJpYyBHdWl0YXIgKG11dGVkKVwiLFxuICAgICAgICBcIk92ZXJkcml2ZW4gR3VpdGFyXCIsXG4gICAgICAgIFwiRGlzdG9ydGlvbiBHdWl0YXJcIixcbiAgICAgICAgXCJHdWl0YXIgaGFybW9uaWNzXCIsXG4gICAgICAgIFwiQWNvdXN0aWMgQmFzc1wiLFxuICAgICAgICBcIkVsZWN0cmljIEJhc3MgKGZpbmdlcilcIixcbiAgICAgICAgXCJFbGVjdHJpYyBCYXNzIChwaWNrKVwiLFxuICAgICAgICBcIkZyZXRsZXNzIEJhc3NcIixcbiAgICAgICAgXCJTbGFwIEJhc3MgMVwiLFxuICAgICAgICBcIlNsYXAgQmFzcyAyXCIsXG4gICAgICAgIFwiU3ludGggQmFzcyAxXCIsXG4gICAgICAgIFwiU3ludGggQmFzcyAyXCIsXG4gICAgICAgIFwiVmlvbGluXCIsXG4gICAgICAgIFwiVmlvbGFcIixcbiAgICAgICAgXCJDZWxsb1wiLFxuICAgICAgICBcIkNvbnRyYWJhc3NcIixcbiAgICAgICAgXCJUcmVtb2xvIFN0cmluZ3NcIixcbiAgICAgICAgXCJQaXp6aWNhdG8gU3RyaW5nc1wiLFxuICAgICAgICBcIk9yY2hlc3RyYWwgSGFycFwiLFxuICAgICAgICBcIlRpbXBhbmlcIixcbiAgICAgICAgXCJTdHJpbmcgRW5zZW1ibGUgMVwiLFxuICAgICAgICBcIlN0cmluZyBFbnNlbWJsZSAyXCIsXG4gICAgICAgIFwiU3ludGhTdHJpbmdzIDFcIixcbiAgICAgICAgXCJTeW50aFN0cmluZ3MgMlwiLFxuICAgICAgICBcIkNob2lyIEFhaHNcIixcbiAgICAgICAgXCJWb2ljZSBPb2hzXCIsXG4gICAgICAgIFwiU3ludGggVm9pY2VcIixcbiAgICAgICAgXCJPcmNoZXN0cmEgSGl0XCIsXG4gICAgICAgIFwiVHJ1bXBldFwiLFxuICAgICAgICBcIlRyb21ib25lXCIsXG4gICAgICAgIFwiVHViYVwiLFxuICAgICAgICBcIk11dGVkIFRydW1wZXRcIixcbiAgICAgICAgXCJGcmVuY2ggSG9yblwiLFxuICAgICAgICBcIkJyYXNzIFNlY3Rpb25cIixcbiAgICAgICAgXCJTeW50aEJyYXNzIDFcIixcbiAgICAgICAgXCJTeW50aEJyYXNzIDJcIixcbiAgICAgICAgXCJTb3ByYW5vIFNheFwiLFxuICAgICAgICBcIkFsdG8gU2F4XCIsXG4gICAgICAgIFwiVGVub3IgU2F4XCIsXG4gICAgICAgIFwiQmFyaXRvbmUgU2F4XCIsXG4gICAgICAgIFwiT2JvZVwiLFxuICAgICAgICBcIkVuZ2xpc2ggSG9yblwiLFxuICAgICAgICBcIkJhc3Nvb25cIixcbiAgICAgICAgXCJDbGFyaW5ldFwiLFxuICAgICAgICBcIlBpY2NvbG9cIixcbiAgICAgICAgXCJGbHV0ZVwiLFxuICAgICAgICBcIlJlY29yZGVyXCIsXG4gICAgICAgIFwiUGFuIEZsdXRlXCIsXG4gICAgICAgIFwiQmxvd24gQm90dGxlXCIsXG4gICAgICAgIFwiU2hha3VoYWNoaVwiLFxuICAgICAgICBcIldoaXN0bGVcIixcbiAgICAgICAgXCJPY2FyaW5hXCIsXG4gICAgICAgIFwiTGVhZCAxIChzcXVhcmUpXCIsXG4gICAgICAgIFwiTGVhZCAyIChzYXd0b290aClcIixcbiAgICAgICAgXCJMZWFkIDMgKGNhbGxpb3BlKVwiLFxuICAgICAgICBcIkxlYWQgNCAoY2hpZmYpXCIsXG4gICAgICAgIFwiTGVhZCA1IChjaGFyYW5nKVwiLFxuICAgICAgICBcIkxlYWQgNiAodm9pY2UpXCIsXG4gICAgICAgIFwiTGVhZCA3IChmaWZ0aHMpXCIsXG4gICAgICAgIFwiTGVhZCA4IChiYXNzICsgbGVhZClcIixcbiAgICAgICAgXCJQYWQgMSAobmV3IGFnZSlcIixcbiAgICAgICAgXCJQYWQgMiAod2FybSlcIixcbiAgICAgICAgXCJQYWQgMyAocG9seXN5bnRoKVwiLFxuICAgICAgICBcIlBhZCA0IChjaG9pcilcIixcbiAgICAgICAgXCJQYWQgNSAoYm93ZWQpXCIsXG4gICAgICAgIFwiUGFkIDYgKG1ldGFsbGljKVwiLFxuICAgICAgICBcIlBhZCA3IChoYWxvKVwiLFxuICAgICAgICBcIlBhZCA4IChzd2VlcClcIixcbiAgICAgICAgXCJGWCAxIChyYWluKVwiLFxuICAgICAgICBcIkZYIDIgKHNvdW5kdHJhY2spXCIsXG4gICAgICAgIFwiRlggMyAoY3J5c3RhbClcIixcbiAgICAgICAgXCJGWCA0IChhdG1vc3BoZXJlKVwiLFxuICAgICAgICBcIkZYIDUgKGJyaWdodG5lc3MpXCIsXG4gICAgICAgIFwiRlggNiAoZ29ibGlucylcIixcbiAgICAgICAgXCJGWCA3IChlY2hvZXMpXCIsXG4gICAgICAgIFwiRlggOCAoc2NpLWZpKVwiLFxuICAgICAgICBcIlNpdGFyXCIsXG4gICAgICAgIFwiQmFuam9cIixcbiAgICAgICAgXCJTaGFtaXNlblwiLFxuICAgICAgICBcIktvdG9cIixcbiAgICAgICAgXCJLYWxpbWJhXCIsXG4gICAgICAgIFwiQmFnIHBpcGVcIixcbiAgICAgICAgXCJGaWRkbGVcIixcbiAgICAgICAgXCJTaGFuYWlcIixcbiAgICAgICAgXCJUaW5rbGUgQmVsbFwiLFxuICAgICAgICBcIkFnb2dvXCIsXG4gICAgICAgIFwiU3RlZWwgRHJ1bXNcIixcbiAgICAgICAgXCJXb29kYmxvY2tcIixcbiAgICAgICAgXCJUYWlrbyBEcnVtXCIsXG4gICAgICAgIFwiTWVsb2RpYyBUb21cIixcbiAgICAgICAgXCJTeW50aCBEcnVtXCIsXG4gICAgICAgIFwiUmV2ZXJzZSBDeW1iYWxcIixcbiAgICAgICAgXCJHdWl0YXIgRnJldCBOb2lzZVwiLFxuICAgICAgICBcIkJyZWF0aCBOb2lzZVwiLFxuICAgICAgICBcIlNlYXNob3JlXCIsXG4gICAgICAgIFwiQmlyZCBUd2VldFwiLFxuICAgICAgICBcIlRlbGVwaG9uZSBSaW5nXCIsXG4gICAgICAgIFwiSGVsaWNvcHRlclwiLFxuICAgICAgICBcIkFwcGxhdXNlXCIsXG4gICAgICAgIFwiR3Vuc2hvdFwiLFxuICAgICAgICBcIlBlcmN1c3Npb25cIlxuICAgIH07XG4gICAgLyogRW5kIEluc3RydW1lbnRzICovXG5cbiAgICAvKiogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgTWlkaSBldmVudCAqL1xuICAgIHByaXZhdGUgc3RyaW5nIEV2ZW50TmFtZShpbnQgZXYpIHtcbiAgICAgICAgaWYgKGV2ID49IEV2ZW50Tm90ZU9mZiAmJiBldiA8IEV2ZW50Tm90ZU9mZiArIDE2KVxuICAgICAgICAgICAgcmV0dXJuIFwiTm90ZU9mZlwiO1xuICAgICAgICBlbHNlIGlmIChldiA+PSBFdmVudE5vdGVPbiAmJiBldiA8IEV2ZW50Tm90ZU9uICsgMTYpIFxuICAgICAgICAgICAgcmV0dXJuIFwiTm90ZU9uXCI7XG4gICAgICAgIGVsc2UgaWYgKGV2ID49IEV2ZW50S2V5UHJlc3N1cmUgJiYgZXYgPCBFdmVudEtleVByZXNzdXJlICsgMTYpIFxuICAgICAgICAgICAgcmV0dXJuIFwiS2V5UHJlc3N1cmVcIjtcbiAgICAgICAgZWxzZSBpZiAoZXYgPj0gRXZlbnRDb250cm9sQ2hhbmdlICYmIGV2IDwgRXZlbnRDb250cm9sQ2hhbmdlICsgMTYpIFxuICAgICAgICAgICAgcmV0dXJuIFwiQ29udHJvbENoYW5nZVwiO1xuICAgICAgICBlbHNlIGlmIChldiA+PSBFdmVudFByb2dyYW1DaGFuZ2UgJiYgZXYgPCBFdmVudFByb2dyYW1DaGFuZ2UgKyAxNikgXG4gICAgICAgICAgICByZXR1cm4gXCJQcm9ncmFtQ2hhbmdlXCI7XG4gICAgICAgIGVsc2UgaWYgKGV2ID49IEV2ZW50Q2hhbm5lbFByZXNzdXJlICYmIGV2IDwgRXZlbnRDaGFubmVsUHJlc3N1cmUgKyAxNilcbiAgICAgICAgICAgIHJldHVybiBcIkNoYW5uZWxQcmVzc3VyZVwiO1xuICAgICAgICBlbHNlIGlmIChldiA+PSBFdmVudFBpdGNoQmVuZCAmJiBldiA8IEV2ZW50UGl0Y2hCZW5kICsgMTYpXG4gICAgICAgICAgICByZXR1cm4gXCJQaXRjaEJlbmRcIjtcbiAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50KVxuICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50XCI7XG4gICAgICAgIGVsc2UgaWYgKGV2ID09IFN5c2V4RXZlbnQxIHx8IGV2ID09IFN5c2V4RXZlbnQyKVxuICAgICAgICAgICAgcmV0dXJuIFwiU3lzZXhFdmVudFwiO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gXCJVbmtub3duXCI7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIG1ldGEtZXZlbnQgKi9cbiAgICBwcml2YXRlIHN0cmluZyBNZXRhTmFtZShpbnQgZXYpIHtcbiAgICAgICAgaWYgKGV2ID09IE1ldGFFdmVudFNlcXVlbmNlKVxuICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50U2VxdWVuY2VcIjtcbiAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50VGV4dClcbiAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudFRleHRcIjtcbiAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50Q29weXJpZ2h0KVxuICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50Q29weXJpZ2h0XCI7XG4gICAgICAgIGVsc2UgaWYgKGV2ID09IE1ldGFFdmVudFNlcXVlbmNlTmFtZSlcbiAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudFNlcXVlbmNlTmFtZVwiO1xuICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRJbnN0cnVtZW50KVxuICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50SW5zdHJ1bWVudFwiO1xuICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRMeXJpYylcbiAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudEx5cmljXCI7XG4gICAgICAgIGVsc2UgaWYgKGV2ID09IE1ldGFFdmVudE1hcmtlcilcbiAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudE1hcmtlclwiO1xuICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRFbmRPZlRyYWNrKVxuICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50RW5kT2ZUcmFja1wiO1xuICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRUZW1wbylcbiAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudFRlbXBvXCI7XG4gICAgICAgIGVsc2UgaWYgKGV2ID09IE1ldGFFdmVudFNNUFRFT2Zmc2V0KVxuICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50U01QVEVPZmZzZXRcIjtcbiAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50VGltZVNpZ25hdHVyZSlcbiAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudFRpbWVTaWduYXR1cmVcIjtcbiAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50S2V5U2lnbmF0dXJlKVxuICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50S2V5U2lnbmF0dXJlXCI7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBcIlVua25vd25cIjtcbiAgICB9XG5cblxuICAgIC8qKiBHZXQgdGhlIGxpc3Qgb2YgdHJhY2tzICovXG4gICAgcHVibGljIExpc3Q8TWlkaVRyYWNrPiBUcmFja3Mge1xuICAgICAgICBnZXQgeyByZXR1cm4gdHJhY2tzOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgdGltZSBzaWduYXR1cmUgKi9cbiAgICBwdWJsaWMgVGltZVNpZ25hdHVyZSBUaW1lIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHRpbWVzaWc7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBmaWxlIG5hbWUgKi9cbiAgICBwdWJsaWMgc3RyaW5nIEZpbGVOYW1lIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIGZpbGVuYW1lOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgdG90YWwgbGVuZ3RoIChpbiBwdWxzZXMpIG9mIHRoZSBzb25nICovXG4gICAgcHVibGljIGludCBUb3RhbFB1bHNlcyB7XG4gICAgICAgIGdldCB7IHJldHVybiB0b3RhbHB1bHNlczsgfVxuICAgIH1cblxuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBNaWRpRmlsZSBmcm9tIHRoZSBmaWxlLiAqL1xuICAgIC8vcHVibGljIE1pZGlGaWxlKHN0cmluZyBmaWxlbmFtZSkge1xuICAgIC8vICAgIE1pZGlGaWxlUmVhZGVyIGZpbGUgPSBuZXcgTWlkaUZpbGVSZWFkZXIoZmlsZW5hbWUpO1xuICAgIC8vICAgIHBhcnNlKGZpbGUsIGZpbGVuYW1lKTtcbiAgICAvL31cblxuICAgIC8qKiBDcmVhdGUgYSBuZXcgTWlkaUZpbGUgZnJvbSB0aGUgYnl0ZVtdLiAqL1xuICAgIHB1YmxpYyBNaWRpRmlsZShieXRlW10gZGF0YSwgc3RyaW5nIHRpdGxlKSB7XG4gICAgICAgIE1pZGlGaWxlUmVhZGVyIGZpbGUgPSBuZXcgTWlkaUZpbGVSZWFkZXIoZGF0YSk7XG4gICAgICAgIGlmICh0aXRsZSA9PSBudWxsKVxuICAgICAgICAgICAgdGl0bGUgPSBcIlwiO1xuICAgICAgICBwYXJzZShmaWxlLCB0aXRsZSk7XG4gICAgfVxuXG4gICAgLyoqIFBhcnNlIHRoZSBnaXZlbiBNaWRpIGZpbGUsIGFuZCByZXR1cm4gYW4gaW5zdGFuY2Ugb2YgdGhpcyBNaWRpRmlsZVxuICAgICAqIGNsYXNzLiAgQWZ0ZXIgcmVhZGluZyB0aGUgbWlkaSBmaWxlLCB0aGlzIG9iamVjdCB3aWxsIGNvbnRhaW46XG4gICAgICogLSBUaGUgcmF3IGxpc3Qgb2YgbWlkaSBldmVudHNcbiAgICAgKiAtIFRoZSBUaW1lIFNpZ25hdHVyZSBvZiB0aGUgc29uZ1xuICAgICAqIC0gQWxsIHRoZSB0cmFja3MgaW4gdGhlIHNvbmcgd2hpY2ggY29udGFpbiBub3Rlcy4gXG4gICAgICogLSBUaGUgbnVtYmVyLCBzdGFydHRpbWUsIGFuZCBkdXJhdGlvbiBvZiBlYWNoIG5vdGUuXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgcGFyc2UoTWlkaUZpbGVSZWFkZXIgZmlsZSwgc3RyaW5nIGZpbGVuYW1lKSB7XG4gICAgICAgIHN0cmluZyBpZDtcbiAgICAgICAgaW50IGxlbjtcblxuICAgICAgICB0aGlzLmZpbGVuYW1lID0gZmlsZW5hbWU7XG4gICAgICAgIHRyYWNrcyA9IG5ldyBMaXN0PE1pZGlUcmFjaz4oKTtcbiAgICAgICAgdHJhY2tQZXJDaGFubmVsID0gZmFsc2U7XG5cbiAgICAgICAgaWQgPSBmaWxlLlJlYWRBc2NpaSg0KTtcbiAgICAgICAgaWYgKGlkICE9IFwiTVRoZFwiKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXCJEb2Vzbid0IHN0YXJ0IHdpdGggTVRoZFwiLCAwKTtcbiAgICAgICAgfVxuICAgICAgICBsZW4gPSBmaWxlLlJlYWRJbnQoKTsgXG4gICAgICAgIGlmIChsZW4gIT0gIDYpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBNaWRpRmlsZUV4Y2VwdGlvbihcIkJhZCBNVGhkIGhlYWRlclwiLCA0KTtcbiAgICAgICAgfVxuICAgICAgICB0cmFja21vZGUgPSBmaWxlLlJlYWRTaG9ydCgpO1xuICAgICAgICBpbnQgbnVtX3RyYWNrcyA9IGZpbGUuUmVhZFNob3J0KCk7XG4gICAgICAgIHF1YXJ0ZXJub3RlID0gZmlsZS5SZWFkU2hvcnQoKTsgXG5cbiAgICAgICAgZXZlbnRzID0gbmV3IExpc3Q8TWlkaUV2ZW50PltudW1fdHJhY2tzXTtcbiAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IG51bV90cmFja3M7IHRyYWNrbnVtKyspIHtcbiAgICAgICAgICAgIGV2ZW50c1t0cmFja251bV0gPSBSZWFkVHJhY2soZmlsZSk7XG4gICAgICAgICAgICBNaWRpVHJhY2sgdHJhY2sgPSBuZXcgTWlkaVRyYWNrKGV2ZW50c1t0cmFja251bV0sIHRyYWNrbnVtKTtcbiAgICAgICAgICAgIGlmICh0cmFjay5Ob3Rlcy5Db3VudCA+IDAgfHwgdHJhY2suTHlyaWNzICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0cmFja3MuQWRkKHRyYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIEdldCB0aGUgbGVuZ3RoIG9mIHRoZSBzb25nIGluIHB1bHNlcyAqL1xuICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKSB7XG4gICAgICAgICAgICBNaWRpTm90ZSBsYXN0ID0gdHJhY2suTm90ZXNbdHJhY2suTm90ZXMuQ291bnQtMV07XG4gICAgICAgICAgICBpZiAodGhpcy50b3RhbHB1bHNlcyA8IGxhc3QuU3RhcnRUaW1lICsgbGFzdC5EdXJhdGlvbikge1xuICAgICAgICAgICAgICAgIHRoaXMudG90YWxwdWxzZXMgPSBsYXN0LlN0YXJ0VGltZSArIGxhc3QuRHVyYXRpb247XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBJZiB3ZSBvbmx5IGhhdmUgb25lIHRyYWNrIHdpdGggbXVsdGlwbGUgY2hhbm5lbHMsIHRoZW4gdHJlYXRcbiAgICAgICAgICogZWFjaCBjaGFubmVsIGFzIGEgc2VwYXJhdGUgdHJhY2suXG4gICAgICAgICAqL1xuICAgICAgICBpZiAodHJhY2tzLkNvdW50ID09IDEgJiYgSGFzTXVsdGlwbGVDaGFubmVscyh0cmFja3NbMF0pKSB7XG4gICAgICAgICAgICB0cmFja3MgPSBTcGxpdENoYW5uZWxzKHRyYWNrc1swXSwgZXZlbnRzW3RyYWNrc1swXS5OdW1iZXJdKTtcbiAgICAgICAgICAgIHRyYWNrUGVyQ2hhbm5lbCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBDaGVja1N0YXJ0VGltZXModHJhY2tzKTtcblxuICAgICAgICAvKiBEZXRlcm1pbmUgdGhlIHRpbWUgc2lnbmF0dXJlICovXG4gICAgICAgIGludCB0ZW1wbyA9IDA7XG4gICAgICAgIGludCBudW1lciA9IDA7XG4gICAgICAgIGludCBkZW5vbSA9IDA7XG4gICAgICAgIGZvcmVhY2ggKExpc3Q8TWlkaUV2ZW50PiBsaXN0IGluIGV2ZW50cykge1xuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaUV2ZW50IG1ldmVudCBpbiBsaXN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKG1ldmVudC5NZXRhZXZlbnQgPT0gTWV0YUV2ZW50VGVtcG8gJiYgdGVtcG8gPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wbyA9IG1ldmVudC5UZW1wbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG1ldmVudC5NZXRhZXZlbnQgPT0gTWV0YUV2ZW50VGltZVNpZ25hdHVyZSAmJiBudW1lciA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG51bWVyID0gbWV2ZW50Lk51bWVyYXRvcjtcbiAgICAgICAgICAgICAgICAgICAgZGVub20gPSBtZXZlbnQuRGVub21pbmF0b3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0ZW1wbyA9PSAwKSB7XG4gICAgICAgICAgICB0ZW1wbyA9IDUwMDAwMDsgLyogNTAwLDAwMCBtaWNyb3NlY29uZHMgPSAwLjA1IHNlYyAqL1xuICAgICAgICB9XG4gICAgICAgIGlmIChudW1lciA9PSAwKSB7XG4gICAgICAgICAgICBudW1lciA9IDQ7IGRlbm9tID0gNDtcbiAgICAgICAgfVxuICAgICAgICB0aW1lc2lnID0gbmV3IFRpbWVTaWduYXR1cmUobnVtZXIsIGRlbm9tLCBxdWFydGVybm90ZSwgdGVtcG8pO1xuICAgIH1cblxuICAgIC8qKiBQYXJzZSBhIHNpbmdsZSBNaWRpIHRyYWNrIGludG8gYSBsaXN0IG9mIE1pZGlFdmVudHMuXG4gICAgICogRW50ZXJpbmcgdGhpcyBmdW5jdGlvbiwgdGhlIGZpbGUgb2Zmc2V0IHNob3VsZCBiZSBhdCB0aGUgc3RhcnQgb2ZcbiAgICAgKiB0aGUgTVRyayBoZWFkZXIuICBVcG9uIGV4aXRpbmcsIHRoZSBmaWxlIG9mZnNldCBzaG91bGQgYmUgYXQgdGhlXG4gICAgICogc3RhcnQgb2YgdGhlIG5leHQgTVRyayBoZWFkZXIuXG4gICAgICovXG4gICAgcHJpdmF0ZSBMaXN0PE1pZGlFdmVudD4gUmVhZFRyYWNrKE1pZGlGaWxlUmVhZGVyIGZpbGUpIHtcbiAgICAgICAgTGlzdDxNaWRpRXZlbnQ+IHJlc3VsdCA9IG5ldyBMaXN0PE1pZGlFdmVudD4oMjApO1xuICAgICAgICBpbnQgc3RhcnR0aW1lID0gMDtcbiAgICAgICAgc3RyaW5nIGlkID0gZmlsZS5SZWFkQXNjaWkoNCk7XG5cbiAgICAgICAgaWYgKGlkICE9IFwiTVRya1wiKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXCJCYWQgTVRyayBoZWFkZXJcIiwgZmlsZS5HZXRPZmZzZXQoKSAtIDQpO1xuICAgICAgICB9XG4gICAgICAgIGludCB0cmFja2xlbiA9IGZpbGUuUmVhZEludCgpO1xuICAgICAgICBpbnQgdHJhY2tlbmQgPSB0cmFja2xlbiArIGZpbGUuR2V0T2Zmc2V0KCk7XG5cbiAgICAgICAgaW50IGV2ZW50ZmxhZyA9IDA7XG5cbiAgICAgICAgd2hpbGUgKGZpbGUuR2V0T2Zmc2V0KCkgPCB0cmFja2VuZCkge1xuXG4gICAgICAgICAgICAvLyBJZiB0aGUgbWlkaSBmaWxlIGlzIHRydW5jYXRlZCBoZXJlLCB3ZSBjYW4gc3RpbGwgcmVjb3Zlci5cbiAgICAgICAgICAgIC8vIEp1c3QgcmV0dXJuIHdoYXQgd2UndmUgcGFyc2VkIHNvIGZhci5cblxuICAgICAgICAgICAgaW50IHN0YXJ0b2Zmc2V0LCBkZWx0YXRpbWU7XG4gICAgICAgICAgICBieXRlIHBlZWtldmVudDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgc3RhcnRvZmZzZXQgPSBmaWxlLkdldE9mZnNldCgpO1xuICAgICAgICAgICAgICAgIGRlbHRhdGltZSA9IGZpbGUuUmVhZFZhcmxlbigpO1xuICAgICAgICAgICAgICAgIHN0YXJ0dGltZSArPSBkZWx0YXRpbWU7XG4gICAgICAgICAgICAgICAgcGVla2V2ZW50ID0gZmlsZS5QZWVrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoTWlkaUZpbGVFeGNlcHRpb24gZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIE1pZGlFdmVudCBtZXZlbnQgPSBuZXcgTWlkaUV2ZW50KCk7XG4gICAgICAgICAgICByZXN1bHQuQWRkKG1ldmVudCk7XG4gICAgICAgICAgICBtZXZlbnQuRGVsdGFUaW1lID0gZGVsdGF0aW1lO1xuICAgICAgICAgICAgbWV2ZW50LlN0YXJ0VGltZSA9IHN0YXJ0dGltZTtcblxuICAgICAgICAgICAgaWYgKHBlZWtldmVudCA+PSBFdmVudE5vdGVPZmYpIHsgXG4gICAgICAgICAgICAgICAgbWV2ZW50Lkhhc0V2ZW50ZmxhZyA9IHRydWU7IFxuICAgICAgICAgICAgICAgIGV2ZW50ZmxhZyA9IGZpbGUuUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ29uc29sZS5Xcml0ZUxpbmUoXCJvZmZzZXQgezB9OiBldmVudCB7MX0gezJ9IHN0YXJ0IHszfSBkZWx0YSB7NH1cIiwgXG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICBzdGFydG9mZnNldCwgZXZlbnRmbGFnLCBFdmVudE5hbWUoZXZlbnRmbGFnKSwgXG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICBzdGFydHRpbWUsIG1ldmVudC5EZWx0YVRpbWUpO1xuXG4gICAgICAgICAgICBpZiAoZXZlbnRmbGFnID49IEV2ZW50Tm90ZU9uICYmIGV2ZW50ZmxhZyA8IEV2ZW50Tm90ZU9uICsgMTYpIHtcbiAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gRXZlbnROb3RlT247XG4gICAgICAgICAgICAgICAgbWV2ZW50LkNoYW5uZWwgPSAoYnl0ZSkoZXZlbnRmbGFnIC0gRXZlbnROb3RlT24pO1xuICAgICAgICAgICAgICAgIG1ldmVudC5Ob3RlbnVtYmVyID0gZmlsZS5SZWFkQnl0ZSgpO1xuICAgICAgICAgICAgICAgIG1ldmVudC5WZWxvY2l0eSA9IGZpbGUuUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ZW50ZmxhZyA+PSBFdmVudE5vdGVPZmYgJiYgZXZlbnRmbGFnIDwgRXZlbnROb3RlT2ZmICsgMTYpIHtcbiAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gRXZlbnROb3RlT2ZmO1xuICAgICAgICAgICAgICAgIG1ldmVudC5DaGFubmVsID0gKGJ5dGUpKGV2ZW50ZmxhZyAtIEV2ZW50Tm90ZU9mZik7XG4gICAgICAgICAgICAgICAgbWV2ZW50Lk5vdGVudW1iZXIgPSBmaWxlLlJlYWRCeXRlKCk7XG4gICAgICAgICAgICAgICAgbWV2ZW50LlZlbG9jaXR5ID0gZmlsZS5SZWFkQnl0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZXZlbnRmbGFnID49IEV2ZW50S2V5UHJlc3N1cmUgJiYgXG4gICAgICAgICAgICAgICAgICAgICBldmVudGZsYWcgPCBFdmVudEtleVByZXNzdXJlICsgMTYpIHtcbiAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gRXZlbnRLZXlQcmVzc3VyZTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuQ2hhbm5lbCA9IChieXRlKShldmVudGZsYWcgLSBFdmVudEtleVByZXNzdXJlKTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuTm90ZW51bWJlciA9IGZpbGUuUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuS2V5UHJlc3N1cmUgPSBmaWxlLlJlYWRCeXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChldmVudGZsYWcgPj0gRXZlbnRDb250cm9sQ2hhbmdlICYmIFxuICAgICAgICAgICAgICAgICAgICAgZXZlbnRmbGFnIDwgRXZlbnRDb250cm9sQ2hhbmdlICsgMTYpIHtcbiAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gRXZlbnRDb250cm9sQ2hhbmdlO1xuICAgICAgICAgICAgICAgIG1ldmVudC5DaGFubmVsID0gKGJ5dGUpKGV2ZW50ZmxhZyAtIEV2ZW50Q29udHJvbENoYW5nZSk7XG4gICAgICAgICAgICAgICAgbWV2ZW50LkNvbnRyb2xOdW0gPSBmaWxlLlJlYWRCeXRlKCk7XG4gICAgICAgICAgICAgICAgbWV2ZW50LkNvbnRyb2xWYWx1ZSA9IGZpbGUuUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ZW50ZmxhZyA+PSBFdmVudFByb2dyYW1DaGFuZ2UgJiYgXG4gICAgICAgICAgICAgICAgICAgICBldmVudGZsYWcgPCBFdmVudFByb2dyYW1DaGFuZ2UgKyAxNikge1xuICAgICAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPSBFdmVudFByb2dyYW1DaGFuZ2U7XG4gICAgICAgICAgICAgICAgbWV2ZW50LkNoYW5uZWwgPSAoYnl0ZSkoZXZlbnRmbGFnIC0gRXZlbnRQcm9ncmFtQ2hhbmdlKTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuSW5zdHJ1bWVudCA9IGZpbGUuUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ZW50ZmxhZyA+PSBFdmVudENoYW5uZWxQcmVzc3VyZSAmJiBcbiAgICAgICAgICAgICAgICAgICAgIGV2ZW50ZmxhZyA8IEV2ZW50Q2hhbm5lbFByZXNzdXJlICsgMTYpIHtcbiAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gRXZlbnRDaGFubmVsUHJlc3N1cmU7XG4gICAgICAgICAgICAgICAgbWV2ZW50LkNoYW5uZWwgPSAoYnl0ZSkoZXZlbnRmbGFnIC0gRXZlbnRDaGFubmVsUHJlc3N1cmUpO1xuICAgICAgICAgICAgICAgIG1ldmVudC5DaGFuUHJlc3N1cmUgPSBmaWxlLlJlYWRCeXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChldmVudGZsYWcgPj0gRXZlbnRQaXRjaEJlbmQgJiYgXG4gICAgICAgICAgICAgICAgICAgICBldmVudGZsYWcgPCBFdmVudFBpdGNoQmVuZCArIDE2KSB7XG4gICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IEV2ZW50UGl0Y2hCZW5kO1xuICAgICAgICAgICAgICAgIG1ldmVudC5DaGFubmVsID0gKGJ5dGUpKGV2ZW50ZmxhZyAtIEV2ZW50UGl0Y2hCZW5kKTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuUGl0Y2hCZW5kID0gZmlsZS5SZWFkU2hvcnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ZW50ZmxhZyA9PSBTeXNleEV2ZW50MSkge1xuICAgICAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPSBTeXNleEV2ZW50MTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuTWV0YWxlbmd0aCA9IGZpbGUuUmVhZFZhcmxlbigpO1xuICAgICAgICAgICAgICAgIG1ldmVudC5WYWx1ZSA9IGZpbGUuUmVhZEJ5dGVzKG1ldmVudC5NZXRhbGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ZW50ZmxhZyA9PSBTeXNleEV2ZW50Mikge1xuICAgICAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPSBTeXNleEV2ZW50MjtcbiAgICAgICAgICAgICAgICBtZXZlbnQuTWV0YWxlbmd0aCA9IGZpbGUuUmVhZFZhcmxlbigpO1xuICAgICAgICAgICAgICAgIG1ldmVudC5WYWx1ZSA9IGZpbGUuUmVhZEJ5dGVzKG1ldmVudC5NZXRhbGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ZW50ZmxhZyA9PSBNZXRhRXZlbnQpIHtcbiAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gTWV0YUV2ZW50O1xuICAgICAgICAgICAgICAgIG1ldmVudC5NZXRhZXZlbnQgPSBmaWxlLlJlYWRCeXRlKCk7XG4gICAgICAgICAgICAgICAgbWV2ZW50Lk1ldGFsZW5ndGggPSBmaWxlLlJlYWRWYXJsZW4oKTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuVmFsdWUgPSBmaWxlLlJlYWRCeXRlcyhtZXZlbnQuTWV0YWxlbmd0aCk7XG4gICAgICAgICAgICAgICAgaWYgKG1ldmVudC5NZXRhZXZlbnQgPT0gTWV0YUV2ZW50VGltZVNpZ25hdHVyZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobWV2ZW50Lk1ldGFsZW5ndGggPCAyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgXCJNZXRhIEV2ZW50IFRpbWUgU2lnbmF0dXJlIGxlbiA9PSBcIiArIG1ldmVudC5NZXRhbGVuZ3RoICArIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gIFwiICE9IDRcIiwgZmlsZS5HZXRPZmZzZXQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuTnVtZXJhdG9yID0gKGJ5dGUpMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5EZW5vbWluYXRvciA9IChieXRlKTQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50Lk1ldGFsZW5ndGggPj0gMiAmJiBtZXZlbnQuTWV0YWxlbmd0aCA8IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5OdW1lcmF0b3IgPSAoYnl0ZSltZXZlbnQuVmFsdWVbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRGVub21pbmF0b3IgPSAoYnl0ZSlTeXN0ZW0uTWF0aC5Qb3coMiwgbWV2ZW50LlZhbHVlWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5OdW1lcmF0b3IgPSAoYnl0ZSltZXZlbnQuVmFsdWVbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRGVub21pbmF0b3IgPSAoYnl0ZSlTeXN0ZW0uTWF0aC5Qb3coMiwgbWV2ZW50LlZhbHVlWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuTWV0YWV2ZW50ID09IE1ldGFFdmVudFRlbXBvKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXZlbnQuTWV0YWxlbmd0aCAhPSAzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiTWV0YSBFdmVudCBUZW1wbyBsZW4gPT0gXCIgKyBtZXZlbnQuTWV0YWxlbmd0aCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiICE9IDNcIiwgZmlsZS5HZXRPZmZzZXQoKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LlRlbXBvID0gKCAobWV2ZW50LlZhbHVlWzBdIDw8IDE2KSB8IChtZXZlbnQuVmFsdWVbMV0gPDwgOCkgfCBtZXZlbnQuVmFsdWVbMl0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuTWV0YWV2ZW50ID09IE1ldGFFdmVudEVuZE9mVHJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgLyogYnJlYWs7ICAqL1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNaWRpRmlsZUV4Y2VwdGlvbihcIlVua25vd24gZXZlbnQgXCIgKyBtZXZlbnQuRXZlbnRGbGFnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5HZXRPZmZzZXQoKS0xKTsgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGlzIHRyYWNrIGNvbnRhaW5zIG11bHRpcGxlIGNoYW5uZWxzLlxuICAgICAqIElmIGEgTWlkaUZpbGUgY29udGFpbnMgb25seSBvbmUgdHJhY2ssIGFuZCBpdCBoYXMgbXVsdGlwbGUgY2hhbm5lbHMsXG4gICAgICogdGhlbiB3ZSB0cmVhdCBlYWNoIGNoYW5uZWwgYXMgYSBzZXBhcmF0ZSB0cmFjay5cbiAgICAgKi9cbiAgICBzdGF0aWMgYm9vbCBIYXNNdWx0aXBsZUNoYW5uZWxzKE1pZGlUcmFjayB0cmFjaykge1xuICAgICAgICBpbnQgY2hhbm5lbCA9IHRyYWNrLk5vdGVzWzBdLkNoYW5uZWw7XG4gICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG5vdGUgaW4gdHJhY2suTm90ZXMpIHtcbiAgICAgICAgICAgIGlmIChub3RlLkNoYW5uZWwgIT0gY2hhbm5lbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiogV3JpdGUgYSB2YXJpYWJsZSBsZW5ndGggbnVtYmVyIHRvIHRoZSBidWZmZXIgYXQgdGhlIGdpdmVuIG9mZnNldC5cbiAgICAgKiBSZXR1cm4gdGhlIG51bWJlciBvZiBieXRlcyB3cml0dGVuLlxuICAgICAqL1xuICAgIHN0YXRpYyBpbnQgVmFybGVuVG9CeXRlcyhpbnQgbnVtLCBieXRlW10gYnVmLCBpbnQgb2Zmc2V0KSB7XG4gICAgICAgIGJ5dGUgYjEgPSAoYnl0ZSkgKChudW0gPj4gMjEpICYgMHg3Rik7XG4gICAgICAgIGJ5dGUgYjIgPSAoYnl0ZSkgKChudW0gPj4gMTQpICYgMHg3Rik7XG4gICAgICAgIGJ5dGUgYjMgPSAoYnl0ZSkgKChudW0gPj4gIDcpICYgMHg3Rik7XG4gICAgICAgIGJ5dGUgYjQgPSAoYnl0ZSkgKG51bSAmIDB4N0YpO1xuXG4gICAgICAgIGlmIChiMSA+IDApIHtcbiAgICAgICAgICAgIGJ1ZltvZmZzZXRdICAgPSAoYnl0ZSkoYjEgfCAweDgwKTtcbiAgICAgICAgICAgIGJ1ZltvZmZzZXQrMV0gPSAoYnl0ZSkoYjIgfCAweDgwKTtcbiAgICAgICAgICAgIGJ1ZltvZmZzZXQrMl0gPSAoYnl0ZSkoYjMgfCAweDgwKTtcbiAgICAgICAgICAgIGJ1ZltvZmZzZXQrM10gPSBiNDtcbiAgICAgICAgICAgIHJldHVybiA0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGIyID4gMCkge1xuICAgICAgICAgICAgYnVmW29mZnNldF0gICA9IChieXRlKShiMiB8IDB4ODApO1xuICAgICAgICAgICAgYnVmW29mZnNldCsxXSA9IChieXRlKShiMyB8IDB4ODApO1xuICAgICAgICAgICAgYnVmW29mZnNldCsyXSA9IGI0O1xuICAgICAgICAgICAgcmV0dXJuIDM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYjMgPiAwKSB7XG4gICAgICAgICAgICBidWZbb2Zmc2V0XSAgID0gKGJ5dGUpKGIzIHwgMHg4MCk7XG4gICAgICAgICAgICBidWZbb2Zmc2V0KzFdID0gYjQ7XG4gICAgICAgICAgICByZXR1cm4gMjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGJ1ZltvZmZzZXRdID0gYjQ7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBXcml0ZSBhIDQtYnl0ZSBpbnRlZ2VyIHRvIGRhdGFbb2Zmc2V0IDogb2Zmc2V0KzRdICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBJbnRUb0J5dGVzKGludCB2YWx1ZSwgYnl0ZVtdIGRhdGEsIGludCBvZmZzZXQpIHtcbiAgICAgICAgZGF0YVtvZmZzZXRdID0gKGJ5dGUpKCAodmFsdWUgPj4gMjQpICYgMHhGRiApO1xuICAgICAgICBkYXRhW29mZnNldCsxXSA9IChieXRlKSggKHZhbHVlID4+IDE2KSAmIDB4RkYgKTtcbiAgICAgICAgZGF0YVtvZmZzZXQrMl0gPSAoYnl0ZSkoICh2YWx1ZSA+PiA4KSAmIDB4RkYgKTtcbiAgICAgICAgZGF0YVtvZmZzZXQrM10gPSAoYnl0ZSkoIHZhbHVlICYgMHhGRiApO1xuICAgIH1cblxuICAgIC8qKiBDYWxjdWxhdGUgdGhlIHRyYWNrIGxlbmd0aCAoaW4gYnl0ZXMpIGdpdmVuIGEgbGlzdCBvZiBNaWRpIGV2ZW50cyAqL1xuICAgIHByaXZhdGUgc3RhdGljIGludCBHZXRUcmFja0xlbmd0aChMaXN0PE1pZGlFdmVudD4gZXZlbnRzKSB7XG4gICAgICAgIGludCBsZW4gPSAwO1xuICAgICAgICBieXRlW10gYnVmID0gbmV3IGJ5dGVbMTAyNF07XG4gICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBtZXZlbnQgaW4gZXZlbnRzKSB7XG4gICAgICAgICAgICBsZW4gKz0gVmFybGVuVG9CeXRlcyhtZXZlbnQuRGVsdGFUaW1lLCBidWYsIDApO1xuICAgICAgICAgICAgbGVuICs9IDE7ICAvKiBmb3IgZXZlbnRmbGFnICovXG4gICAgICAgICAgICBzd2l0Y2ggKG1ldmVudC5FdmVudEZsYWcpIHtcbiAgICAgICAgICAgICAgICBjYXNlIEV2ZW50Tm90ZU9uOiBsZW4gKz0gMjsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBFdmVudE5vdGVPZmY6IGxlbiArPSAyOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIEV2ZW50S2V5UHJlc3N1cmU6IGxlbiArPSAyOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIEV2ZW50Q29udHJvbENoYW5nZTogbGVuICs9IDI7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgRXZlbnRQcm9ncmFtQ2hhbmdlOiBsZW4gKz0gMTsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBFdmVudENoYW5uZWxQcmVzc3VyZTogbGVuICs9IDE7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgRXZlbnRQaXRjaEJlbmQ6IGxlbiArPSAyOyBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgU3lzZXhFdmVudDE6IFxuICAgICAgICAgICAgICAgIGNhc2UgU3lzZXhFdmVudDI6XG4gICAgICAgICAgICAgICAgICAgIGxlbiArPSBWYXJsZW5Ub0J5dGVzKG1ldmVudC5NZXRhbGVuZ3RoLCBidWYsIDApOyBcbiAgICAgICAgICAgICAgICAgICAgbGVuICs9IG1ldmVudC5NZXRhbGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIE1ldGFFdmVudDogXG4gICAgICAgICAgICAgICAgICAgIGxlbiArPSAxOyBcbiAgICAgICAgICAgICAgICAgICAgbGVuICs9IFZhcmxlblRvQnl0ZXMobWV2ZW50Lk1ldGFsZW5ndGgsIGJ1ZiwgMCk7IFxuICAgICAgICAgICAgICAgICAgICBsZW4gKz0gbWV2ZW50Lk1ldGFsZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsZW47XG4gICAgfVxuICAgICAgICAgICAgXG5cbiAgICAvKiogV3JpdGUgdGhlIGdpdmVuIGxpc3Qgb2YgTWlkaSBldmVudHMgdG8gYSBzdHJlYW0vZmlsZS5cbiAgICAgKiAgVGhpcyBtZXRob2QgaXMgdXNlZCBmb3Igc291bmQgcGxheWJhY2ssIGZvciBjcmVhdGluZyBuZXcgTWlkaSBmaWxlc1xuICAgICAqICB3aXRoIHRoZSB0ZW1wbywgdHJhbnNwb3NlLCBldGMgY2hhbmdlZC5cbiAgICAgKlxuICAgICAqICBSZXR1cm4gdHJ1ZSBvbiBzdWNjZXNzLCBhbmQgZmFsc2Ugb24gZXJyb3IuXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgYm9vbCBcbiAgICBXcml0ZUV2ZW50cyhTdHJlYW0gZmlsZSwgTGlzdDxNaWRpRXZlbnQ+W10gZXZlbnRzLCBpbnQgdHJhY2ttb2RlLCBpbnQgcXVhcnRlcikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYnl0ZVtdIGJ1ZiA9IG5ldyBieXRlWzY1NTM2XTtcblxuICAgICAgICAgICAgLyogV3JpdGUgdGhlIE1UaGQsIGxlbiA9IDYsIHRyYWNrIG1vZGUsIG51bWJlciB0cmFja3MsIHF1YXJ0ZXIgbm90ZSAqL1xuICAgICAgICAgICAgZmlsZS5Xcml0ZShBU0NJSUVuY29kaW5nLkFTQ0lJLkdldEJ5dGVzKFwiTVRoZFwiKSwgMCwgNCk7XG4gICAgICAgICAgICBJbnRUb0J5dGVzKDYsIGJ1ZiwgMCk7XG4gICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgNCk7XG4gICAgICAgICAgICBidWZbMF0gPSAoYnl0ZSkodHJhY2ttb2RlID4+IDgpOyBcbiAgICAgICAgICAgIGJ1ZlsxXSA9IChieXRlKSh0cmFja21vZGUgJiAweEZGKTtcbiAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCAyKTtcbiAgICAgICAgICAgIGJ1ZlswXSA9IDA7IFxuICAgICAgICAgICAgYnVmWzFdID0gKGJ5dGUpZXZlbnRzLkxlbmd0aDtcbiAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCAyKTtcbiAgICAgICAgICAgIGJ1ZlswXSA9IChieXRlKShxdWFydGVyID4+IDgpOyBcbiAgICAgICAgICAgIGJ1ZlsxXSA9IChieXRlKShxdWFydGVyICYgMHhGRik7XG4gICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgMik7XG5cbiAgICAgICAgICAgIGZvcmVhY2ggKExpc3Q8TWlkaUV2ZW50PiBsaXN0IGluIGV2ZW50cykge1xuICAgICAgICAgICAgICAgIC8qIFdyaXRlIHRoZSBNVHJrIGhlYWRlciBhbmQgdHJhY2sgbGVuZ3RoICovXG4gICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShBU0NJSUVuY29kaW5nLkFTQ0lJLkdldEJ5dGVzKFwiTVRya1wiKSwgMCwgNCk7XG4gICAgICAgICAgICAgICAgaW50IGxlbiA9IEdldFRyYWNrTGVuZ3RoKGxpc3QpO1xuICAgICAgICAgICAgICAgIEludFRvQnl0ZXMobGVuLCBidWYsIDApO1xuICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCA0KTtcblxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBtZXZlbnQgaW4gbGlzdCkge1xuICAgICAgICAgICAgICAgICAgICBpbnQgdmFybGVuID0gVmFybGVuVG9CeXRlcyhtZXZlbnQuRGVsdGFUaW1lLCBidWYsIDApO1xuICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgdmFybGVuKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBTeXNleEV2ZW50MSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9PSBTeXNleEV2ZW50MiB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9PSBNZXRhRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IG1ldmVudC5FdmVudEZsYWc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbMF0gPSAoYnl0ZSkobWV2ZW50LkV2ZW50RmxhZyArIG1ldmVudC5DaGFubmVsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgMSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnROb3RlT24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IG1ldmVudC5Ob3RlbnVtYmVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzFdID0gbWV2ZW50LlZlbG9jaXR5O1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnROb3RlT2ZmKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbMF0gPSBtZXZlbnQuTm90ZW51bWJlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlsxXSA9IG1ldmVudC5WZWxvY2l0eTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IEV2ZW50S2V5UHJlc3N1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IG1ldmVudC5Ob3RlbnVtYmVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzFdID0gbWV2ZW50LktleVByZXNzdXJlO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnRDb250cm9sQ2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbMF0gPSBtZXZlbnQuQ29udHJvbE51bTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlsxXSA9IG1ldmVudC5Db250cm9sVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgMik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudFByb2dyYW1DaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IG1ldmVudC5JbnN0cnVtZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnRDaGFubmVsUHJlc3N1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IG1ldmVudC5DaGFuUHJlc3N1cmU7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudFBpdGNoQmVuZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gKGJ5dGUpKG1ldmVudC5QaXRjaEJlbmQgPj4gOCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbMV0gPSAoYnl0ZSkobWV2ZW50LlBpdGNoQmVuZCAmIDB4RkYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gU3lzZXhFdmVudDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludCBvZmZzZXQgPSBWYXJsZW5Ub0J5dGVzKG1ldmVudC5NZXRhbGVuZ3RoLCBidWYsIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgQXJyYXkuQ29weShtZXZlbnQuVmFsdWUsIDAsIGJ1Ziwgb2Zmc2V0LCBtZXZlbnQuVmFsdWUuTGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCBvZmZzZXQgKyBtZXZlbnQuVmFsdWUuTGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IFN5c2V4RXZlbnQyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnQgb2Zmc2V0ID0gVmFybGVuVG9CeXRlcyhtZXZlbnQuTWV0YWxlbmd0aCwgYnVmLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LkNvcHkobWV2ZW50LlZhbHVlLCAwLCBidWYsIG9mZnNldCwgbWV2ZW50LlZhbHVlLkxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgb2Zmc2V0ICsgbWV2ZW50LlZhbHVlLkxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBNZXRhRXZlbnQgJiYgbWV2ZW50Lk1ldGFldmVudCA9PSBNZXRhRXZlbnRUZW1wbykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gbWV2ZW50Lk1ldGFldmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlsxXSA9IDM7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbMl0gPSAoYnl0ZSkoKG1ldmVudC5UZW1wbyA+PiAxNikgJiAweEZGKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlszXSA9IChieXRlKSgobWV2ZW50LlRlbXBvID4+IDgpICYgMHhGRik7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZbNF0gPSAoYnl0ZSkobWV2ZW50LlRlbXBvICYgMHhGRik7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgNSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBNZXRhRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IG1ldmVudC5NZXRhZXZlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnQgb2Zmc2V0ID0gVmFybGVuVG9CeXRlcyhtZXZlbnQuTWV0YWxlbmd0aCwgYnVmLCAxKSArIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBBcnJheS5Db3B5KG1ldmVudC5WYWx1ZSwgMCwgYnVmLCBvZmZzZXQsIG1ldmVudC5WYWx1ZS5MZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIG9mZnNldCArIG1ldmVudC5WYWx1ZS5MZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsZS5DbG9zZSgpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKElPRXhjZXB0aW9uIGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLyoqIENsb25lIHRoZSBsaXN0IG9mIE1pZGlFdmVudHMgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBMaXN0PE1pZGlFdmVudD5bXSBDbG9uZU1pZGlFdmVudHMoTGlzdDxNaWRpRXZlbnQ+W10gb3JpZ2xpc3QpIHtcbiAgICAgICAgTGlzdDxNaWRpRXZlbnQ+W10gbmV3bGlzdCA9IG5ldyBMaXN0PE1pZGlFdmVudD5bIG9yaWdsaXN0Lkxlbmd0aF07XG4gICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCBvcmlnbGlzdC5MZW5ndGg7IHRyYWNrbnVtKyspIHtcbiAgICAgICAgICAgIExpc3Q8TWlkaUV2ZW50PiBvcmlnZXZlbnRzID0gb3JpZ2xpc3RbdHJhY2tudW1dO1xuICAgICAgICAgICAgTGlzdDxNaWRpRXZlbnQ+IG5ld2V2ZW50cyA9IG5ldyBMaXN0PE1pZGlFdmVudD4ob3JpZ2V2ZW50cy5Db3VudCk7XG4gICAgICAgICAgICBuZXdsaXN0W3RyYWNrbnVtXSA9IG5ld2V2ZW50cztcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBtZXZlbnQgaW4gb3JpZ2V2ZW50cykge1xuICAgICAgICAgICAgICAgIG5ld2V2ZW50cy5BZGQoIG1ldmVudC5DbG9uZSgpICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ld2xpc3Q7XG4gICAgfVxuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBNaWRpIHRlbXBvIGV2ZW50LCB3aXRoIHRoZSBnaXZlbiB0ZW1wbyAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBNaWRpRXZlbnQgQ3JlYXRlVGVtcG9FdmVudChpbnQgdGVtcG8pIHtcbiAgICAgICAgTWlkaUV2ZW50IG1ldmVudCA9IG5ldyBNaWRpRXZlbnQoKTtcbiAgICAgICAgbWV2ZW50LkRlbHRhVGltZSA9IDA7XG4gICAgICAgIG1ldmVudC5TdGFydFRpbWUgPSAwO1xuICAgICAgICBtZXZlbnQuSGFzRXZlbnRmbGFnID0gdHJ1ZTtcbiAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IE1ldGFFdmVudDtcbiAgICAgICAgbWV2ZW50Lk1ldGFldmVudCA9IE1ldGFFdmVudFRlbXBvO1xuICAgICAgICBtZXZlbnQuTWV0YWxlbmd0aCA9IDM7XG4gICAgICAgIG1ldmVudC5UZW1wbyA9IHRlbXBvO1xuICAgICAgICByZXR1cm4gbWV2ZW50O1xuICAgIH1cblxuXG4gICAgLyoqIFNlYXJjaCB0aGUgZXZlbnRzIGZvciBhIENvbnRyb2xDaGFuZ2UgZXZlbnQgd2l0aCB0aGUgc2FtZVxuICAgICAqICBjaGFubmVsIGFuZCBjb250cm9sIG51bWJlci4gIElmIGEgbWF0Y2hpbmcgZXZlbnQgaXMgZm91bmQsXG4gICAgICogICB1cGRhdGUgdGhlIGNvbnRyb2wgdmFsdWUuICBFbHNlLCBhZGQgYSBuZXcgQ29udHJvbENoYW5nZSBldmVudC5cbiAgICAgKi8gXG4gICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBcbiAgICBVcGRhdGVDb250cm9sQ2hhbmdlKExpc3Q8TWlkaUV2ZW50PiBuZXdldmVudHMsIE1pZGlFdmVudCBjaGFuZ2VFdmVudCkge1xuICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbWV2ZW50IGluIG5ld2V2ZW50cykge1xuICAgICAgICAgICAgaWYgKChtZXZlbnQuRXZlbnRGbGFnID09IGNoYW5nZUV2ZW50LkV2ZW50RmxhZykgJiZcbiAgICAgICAgICAgICAgICAobWV2ZW50LkNoYW5uZWwgPT0gY2hhbmdlRXZlbnQuQ2hhbm5lbCkgJiZcbiAgICAgICAgICAgICAgICAobWV2ZW50LkNvbnRyb2xOdW0gPT0gY2hhbmdlRXZlbnQuQ29udHJvbE51bSkpIHtcblxuICAgICAgICAgICAgICAgIG1ldmVudC5Db250cm9sVmFsdWUgPSBjaGFuZ2VFdmVudC5Db250cm9sVmFsdWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG5ld2V2ZW50cy5BZGQoY2hhbmdlRXZlbnQpO1xuICAgIH1cblxuICAgIC8qKiBTdGFydCB0aGUgTWlkaSBtdXNpYyBhdCB0aGUgZ2l2ZW4gcGF1c2UgdGltZSAoaW4gcHVsc2VzKS5cbiAgICAgKiAgUmVtb3ZlIGFueSBOb3RlT24vTm90ZU9mZiBldmVudHMgdGhhdCBvY2N1ciBiZWZvcmUgdGhlIHBhdXNlIHRpbWUuXG4gICAgICogIEZvciBvdGhlciBldmVudHMsIGNoYW5nZSB0aGUgZGVsdGEtdGltZSB0byAwIGlmIHRoZXkgb2NjdXJcbiAgICAgKiAgYmVmb3JlIHRoZSBwYXVzZSB0aW1lLiAgUmV0dXJuIHRoZSBtb2RpZmllZCBNaWRpIEV2ZW50cy5cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBMaXN0PE1pZGlFdmVudD5bXSBcbiAgICBTdGFydEF0UGF1c2VUaW1lKExpc3Q8TWlkaUV2ZW50PltdIGxpc3QsIGludCBwYXVzZVRpbWUpIHtcbiAgICAgICAgTGlzdDxNaWRpRXZlbnQ+W10gbmV3bGlzdCA9IG5ldyBMaXN0PE1pZGlFdmVudD5bIGxpc3QuTGVuZ3RoXTtcbiAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IGxpc3QuTGVuZ3RoOyB0cmFja251bSsrKSB7XG4gICAgICAgICAgICBMaXN0PE1pZGlFdmVudD4gZXZlbnRzID0gbGlzdFt0cmFja251bV07XG4gICAgICAgICAgICBMaXN0PE1pZGlFdmVudD4gbmV3ZXZlbnRzID0gbmV3IExpc3Q8TWlkaUV2ZW50PihldmVudHMuQ291bnQpO1xuICAgICAgICAgICAgbmV3bGlzdFt0cmFja251bV0gPSBuZXdldmVudHM7XG5cbiAgICAgICAgICAgIGJvb2wgZm91bmRFdmVudEFmdGVyUGF1c2UgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBtZXZlbnQgaW4gZXZlbnRzKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAobWV2ZW50LlN0YXJ0VGltZSA8IHBhdXNlVGltZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudE5vdGVPbiB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudE5vdGVPZmYpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLyogU2tpcCBOb3RlT24vTm90ZU9mZiBldmVudCAqL1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnRDb250cm9sQ2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRGVsdGFUaW1lID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIFVwZGF0ZUNvbnRyb2xDaGFuZ2UobmV3ZXZlbnRzLCBtZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkRlbHRhVGltZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdldmVudHMuQWRkKG1ldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIWZvdW5kRXZlbnRBZnRlclBhdXNlKSB7XG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5EZWx0YVRpbWUgPSAobWV2ZW50LlN0YXJ0VGltZSAtIHBhdXNlVGltZSk7XG4gICAgICAgICAgICAgICAgICAgIG5ld2V2ZW50cy5BZGQobWV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgZm91bmRFdmVudEFmdGVyUGF1c2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3ZXZlbnRzLkFkZChtZXZlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3bGlzdDtcbiAgICB9XG5cblxuICAgIC8qKiBXcml0ZSB0aGlzIE1pZGkgZmlsZSB0byB0aGUgZ2l2ZW4gZmlsZW5hbWUuXG4gICAgICogSWYgb3B0aW9ucyBpcyBub3QgbnVsbCwgYXBwbHkgdGhvc2Ugb3B0aW9ucyB0byB0aGUgbWlkaSBldmVudHNcbiAgICAgKiBiZWZvcmUgcGVyZm9ybWluZyB0aGUgd3JpdGUuXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIGZpbGUgd2FzIHNhdmVkIHN1Y2Nlc3NmdWxseSwgZWxzZSBmYWxzZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgYm9vbCBDaGFuZ2VTb3VuZChzdHJpbmcgZGVzdGZpbGUsIE1pZGlPcHRpb25zIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIFdyaXRlKGRlc3RmaWxlLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYm9vbCBXcml0ZShzdHJpbmcgZGVzdGZpbGUsIE1pZGlPcHRpb25zIG9wdGlvbnMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIEZpbGVTdHJlYW0gc3RyZWFtO1xuICAgICAgICAgICAgc3RyZWFtID0gbmV3IEZpbGVTdHJlYW0oZGVzdGZpbGUsIEZpbGVNb2RlLkNyZWF0ZSk7XG4gICAgICAgICAgICBib29sIHJlc3VsdCA9IFdyaXRlKHN0cmVhbSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBzdHJlYW0uQ2xvc2UoKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKElPRXhjZXB0aW9uIGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBXcml0ZSB0aGlzIE1pZGkgZmlsZSB0byB0aGUgZ2l2ZW4gc3RyZWFtLlxuICAgICAqIElmIG9wdGlvbnMgaXMgbm90IG51bGwsIGFwcGx5IHRob3NlIG9wdGlvbnMgdG8gdGhlIG1pZGkgZXZlbnRzXG4gICAgICogYmVmb3JlIHBlcmZvcm1pbmcgdGhlIHdyaXRlLlxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSBmaWxlIHdhcyBzYXZlZCBzdWNjZXNzZnVsbHksIGVsc2UgZmFsc2UuXG4gICAgICovXG4gICAgcHVibGljIGJvb2wgV3JpdGUoU3RyZWFtIHN0cmVhbSwgTWlkaU9wdGlvbnMgb3B0aW9ucykge1xuICAgICAgICBMaXN0PE1pZGlFdmVudD5bXSBuZXdldmVudHMgPSBldmVudHM7XG4gICAgICAgIGlmIChvcHRpb25zICE9IG51bGwpIHtcbiAgICAgICAgICAgIG5ld2V2ZW50cyA9IEFwcGx5T3B0aW9uc1RvRXZlbnRzKG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBXcml0ZUV2ZW50cyhzdHJlYW0sIG5ld2V2ZW50cywgdHJhY2ttb2RlLCBxdWFydGVybm90ZSk7XG4gICAgfVxuXG5cbiAgICAvKiBBcHBseSB0aGUgZm9sbG93aW5nIHNvdW5kIG9wdGlvbnMgdG8gdGhlIG1pZGkgZXZlbnRzOlxuICAgICAqIC0gVGhlIHRlbXBvICh0aGUgbWljcm9zZWNvbmRzIHBlciBwdWxzZSlcbiAgICAgKiAtIFRoZSBpbnN0cnVtZW50cyBwZXIgdHJhY2tcbiAgICAgKiAtIFRoZSBub3RlIG51bWJlciAodHJhbnNwb3NlIHZhbHVlKVxuICAgICAqIC0gVGhlIHRyYWNrcyB0byBpbmNsdWRlXG4gICAgICogUmV0dXJuIHRoZSBtb2RpZmllZCBsaXN0IG9mIG1pZGkgZXZlbnRzLlxuICAgICAqL1xuICAgIHByaXZhdGUgTGlzdDxNaWRpRXZlbnQ+W11cbiAgICBBcHBseU9wdGlvbnNUb0V2ZW50cyhNaWRpT3B0aW9ucyBvcHRpb25zKSB7XG4gICAgICAgIGludCBpO1xuICAgICAgICBpZiAodHJhY2tQZXJDaGFubmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gQXBwbHlPcHRpb25zUGVyQ2hhbm5lbChvcHRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIEEgbWlkaWZpbGUgY2FuIGNvbnRhaW4gdHJhY2tzIHdpdGggbm90ZXMgYW5kIHRyYWNrcyB3aXRob3V0IG5vdGVzLlxuICAgICAgICAgKiBUaGUgb3B0aW9ucy50cmFja3MgYW5kIG9wdGlvbnMuaW5zdHJ1bWVudHMgYXJlIGZvciB0cmFja3Mgd2l0aCBub3Rlcy5cbiAgICAgICAgICogU28gdGhlIHRyYWNrIG51bWJlcnMgaW4gJ29wdGlvbnMnIG1heSBub3QgbWF0Y2ggY29ycmVjdGx5IGlmIHRoZVxuICAgICAgICAgKiBtaWRpIGZpbGUgaGFzIHRyYWNrcyB3aXRob3V0IG5vdGVzLiBSZS1jb21wdXRlIHRoZSBpbnN0cnVtZW50cywgYW5kIFxuICAgICAgICAgKiB0cmFja3MgdG8ga2VlcC5cbiAgICAgICAgICovXG4gICAgICAgIGludCBudW1fdHJhY2tzID0gZXZlbnRzLkxlbmd0aDtcbiAgICAgICAgaW50W10gaW5zdHJ1bWVudHMgPSBuZXcgaW50W251bV90cmFja3NdO1xuICAgICAgICBib29sW10ga2VlcHRyYWNrcyA9IG5ldyBib29sW251bV90cmFja3NdO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbnVtX3RyYWNrczsgaSsrKSB7XG4gICAgICAgICAgICBpbnN0cnVtZW50c1tpXSA9IDA7XG4gICAgICAgICAgICBrZWVwdHJhY2tzW2ldID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgdHJhY2tzLkNvdW50OyB0cmFja251bSsrKSB7XG4gICAgICAgICAgICBNaWRpVHJhY2sgdHJhY2sgPSB0cmFja3NbdHJhY2tudW1dO1xuICAgICAgICAgICAgaW50IHJlYWx0cmFjayA9IHRyYWNrLk51bWJlcjtcbiAgICAgICAgICAgIGluc3RydW1lbnRzW3JlYWx0cmFja10gPSBvcHRpb25zLmluc3RydW1lbnRzW3RyYWNrbnVtXTtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLm11dGVbdHJhY2tudW1dID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBrZWVwdHJhY2tzW3JlYWx0cmFja10gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIExpc3Q8TWlkaUV2ZW50PltdIG5ld2V2ZW50cyA9IENsb25lTWlkaUV2ZW50cyhldmVudHMpO1xuXG4gICAgICAgIC8qIFNldCB0aGUgdGVtcG8gYXQgdGhlIGJlZ2lubmluZyBvZiBlYWNoIHRyYWNrICovXG4gICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCBuZXdldmVudHMuTGVuZ3RoOyB0cmFja251bSsrKSB7XG4gICAgICAgICAgICBNaWRpRXZlbnQgbWV2ZW50ID0gQ3JlYXRlVGVtcG9FdmVudChvcHRpb25zLnRlbXBvKTtcbiAgICAgICAgICAgIG5ld2V2ZW50c1t0cmFja251bV0uSW5zZXJ0KDAsIG1ldmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBDaGFuZ2UgdGhlIG5vdGUgbnVtYmVyICh0cmFuc3Bvc2UpLCBpbnN0cnVtZW50LCBhbmQgdGVtcG8gKi9cbiAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IG5ld2V2ZW50cy5MZW5ndGg7IHRyYWNrbnVtKyspIHtcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBtZXZlbnQgaW4gbmV3ZXZlbnRzW3RyYWNrbnVtXSkge1xuICAgICAgICAgICAgICAgIGludCBudW0gPSBtZXZlbnQuTm90ZW51bWJlciArIG9wdGlvbnMudHJhbnNwb3NlO1xuICAgICAgICAgICAgICAgIGlmIChudW0gPCAwKVxuICAgICAgICAgICAgICAgICAgICBudW0gPSAwO1xuICAgICAgICAgICAgICAgIGlmIChudW0gPiAxMjcpXG4gICAgICAgICAgICAgICAgICAgIG51bSA9IDEyNztcbiAgICAgICAgICAgICAgICBtZXZlbnQuTm90ZW51bWJlciA9IChieXRlKW51bTtcbiAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbnMudXNlRGVmYXVsdEluc3RydW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5JbnN0cnVtZW50ID0gKGJ5dGUpaW5zdHJ1bWVudHNbdHJhY2tudW1dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtZXZlbnQuVGVtcG8gPSBvcHRpb25zLnRlbXBvO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMucGF1c2VUaW1lICE9IDApIHtcbiAgICAgICAgICAgIG5ld2V2ZW50cyA9IFN0YXJ0QXRQYXVzZVRpbWUobmV3ZXZlbnRzLCBvcHRpb25zLnBhdXNlVGltZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBDaGFuZ2UgdGhlIHRyYWNrcyB0byBpbmNsdWRlICovXG4gICAgICAgIGludCBjb3VudCA9IDA7XG4gICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCBrZWVwdHJhY2tzLkxlbmd0aDsgdHJhY2tudW0rKykge1xuICAgICAgICAgICAgaWYgKGtlZXB0cmFja3NbdHJhY2tudW1dKSB7XG4gICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBMaXN0PE1pZGlFdmVudD5bXSByZXN1bHQgPSBuZXcgTGlzdDxNaWRpRXZlbnQ+W2NvdW50XTtcbiAgICAgICAgaSA9IDA7XG4gICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCBrZWVwdHJhY2tzLkxlbmd0aDsgdHJhY2tudW0rKykge1xuICAgICAgICAgICAgaWYgKGtlZXB0cmFja3NbdHJhY2tudW1dKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2ldID0gbmV3ZXZlbnRzW3RyYWNrbnVtXTtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKiBBcHBseSB0aGUgZm9sbG93aW5nIHNvdW5kIG9wdGlvbnMgdG8gdGhlIG1pZGkgZXZlbnRzOlxuICAgICAqIC0gVGhlIHRlbXBvICh0aGUgbWljcm9zZWNvbmRzIHBlciBwdWxzZSlcbiAgICAgKiAtIFRoZSBpbnN0cnVtZW50cyBwZXIgdHJhY2tcbiAgICAgKiAtIFRoZSBub3RlIG51bWJlciAodHJhbnNwb3NlIHZhbHVlKVxuICAgICAqIC0gVGhlIHRyYWNrcyB0byBpbmNsdWRlXG4gICAgICogUmV0dXJuIHRoZSBtb2RpZmllZCBsaXN0IG9mIG1pZGkgZXZlbnRzLlxuICAgICAqXG4gICAgICogVGhpcyBNaWRpIGZpbGUgb25seSBoYXMgb25lIGFjdHVhbCB0cmFjaywgYnV0IHdlJ3ZlIHNwbGl0IHRoYXRcbiAgICAgKiBpbnRvIG11bHRpcGxlIGZha2UgdHJhY2tzLCBvbmUgcGVyIGNoYW5uZWwsIGFuZCBkaXNwbGF5ZWQgdGhhdFxuICAgICAqIHRvIHRoZSBlbmQtdXNlci4gIFNvIGNoYW5naW5nIHRoZSBpbnN0cnVtZW50LCBhbmQgdHJhY2tzIHRvXG4gICAgICogaW5jbHVkZSwgaXMgaW1wbGVtZW50ZWQgZGlmZmVyZW50bHkgdGhhbiBBcHBseU9wdGlvbnNUb0V2ZW50cygpLlxuICAgICAqXG4gICAgICogLSBXZSBjaGFuZ2UgdGhlIGluc3RydW1lbnQgYmFzZWQgb24gdGhlIGNoYW5uZWwsIG5vdCB0aGUgdHJhY2suXG4gICAgICogLSBXZSBpbmNsdWRlL2V4Y2x1ZGUgY2hhbm5lbHMsIG5vdCB0cmFja3MuXG4gICAgICogLSBXZSBleGNsdWRlIGEgY2hhbm5lbCBieSBzZXR0aW5nIHRoZSBub3RlIHZvbHVtZS92ZWxvY2l0eSB0byAwLlxuICAgICAqL1xuICAgIHByaXZhdGUgTGlzdDxNaWRpRXZlbnQ+W11cbiAgICBBcHBseU9wdGlvbnNQZXJDaGFubmVsKE1pZGlPcHRpb25zIG9wdGlvbnMpIHtcbiAgICAgICAgLyogRGV0ZXJtaW5lIHdoaWNoIGNoYW5uZWxzIHRvIGluY2x1ZGUvZXhjbHVkZS5cbiAgICAgICAgICogQWxzbywgZGV0ZXJtaW5lIHRoZSBpbnN0cnVtZW50cyBmb3IgZWFjaCBjaGFubmVsLlxuICAgICAgICAgKi9cbiAgICAgICAgaW50W10gaW5zdHJ1bWVudHMgPSBuZXcgaW50WzE2XTtcbiAgICAgICAgYm9vbFtdIGtlZXBjaGFubmVsID0gbmV3IGJvb2xbMTZdO1xuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDE2OyBpKyspIHtcbiAgICAgICAgICAgIGluc3RydW1lbnRzW2ldID0gMDtcbiAgICAgICAgICAgIGtlZXBjaGFubmVsW2ldID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgdHJhY2tzLkNvdW50OyB0cmFja251bSsrKSB7XG4gICAgICAgICAgICBNaWRpVHJhY2sgdHJhY2sgPSB0cmFja3NbdHJhY2tudW1dO1xuICAgICAgICAgICAgaW50IGNoYW5uZWwgPSB0cmFjay5Ob3Rlc1swXS5DaGFubmVsO1xuICAgICAgICAgICAgaW5zdHJ1bWVudHNbY2hhbm5lbF0gPSBvcHRpb25zLmluc3RydW1lbnRzW3RyYWNrbnVtXTtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLm11dGVbdHJhY2tudW1dID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBrZWVwY2hhbm5lbFtjaGFubmVsXSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBMaXN0PE1pZGlFdmVudD5bXSBuZXdldmVudHMgPSBDbG9uZU1pZGlFdmVudHMoZXZlbnRzKTtcblxuICAgICAgICAvKiBTZXQgdGhlIHRlbXBvIGF0IHRoZSBiZWdpbm5pbmcgb2YgZWFjaCB0cmFjayAqL1xuICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgbmV3ZXZlbnRzLkxlbmd0aDsgdHJhY2tudW0rKykge1xuICAgICAgICAgICAgTWlkaUV2ZW50IG1ldmVudCA9IENyZWF0ZVRlbXBvRXZlbnQob3B0aW9ucy50ZW1wbyk7XG4gICAgICAgICAgICBuZXdldmVudHNbdHJhY2tudW1dLkluc2VydCgwLCBtZXZlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogQ2hhbmdlIHRoZSBub3RlIG51bWJlciAodHJhbnNwb3NlKSwgaW5zdHJ1bWVudCwgYW5kIHRlbXBvICovXG4gICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCBuZXdldmVudHMuTGVuZ3RoOyB0cmFja251bSsrKSB7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbWV2ZW50IGluIG5ld2V2ZW50c1t0cmFja251bV0pIHtcbiAgICAgICAgICAgICAgICBpbnQgbnVtID0gbWV2ZW50Lk5vdGVudW1iZXIgKyBvcHRpb25zLnRyYW5zcG9zZTtcbiAgICAgICAgICAgICAgICBpZiAobnVtIDwgMClcbiAgICAgICAgICAgICAgICAgICAgbnVtID0gMDtcbiAgICAgICAgICAgICAgICBpZiAobnVtID4gMTI3KVxuICAgICAgICAgICAgICAgICAgICBudW0gPSAxMjc7XG4gICAgICAgICAgICAgICAgbWV2ZW50Lk5vdGVudW1iZXIgPSAoYnl0ZSludW07XG4gICAgICAgICAgICAgICAgaWYgKCFrZWVwY2hhbm5lbFttZXZlbnQuQ2hhbm5lbF0pIHtcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LlZlbG9jaXR5ID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFvcHRpb25zLnVzZURlZmF1bHRJbnN0cnVtZW50cykge1xuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuSW5zdHJ1bWVudCA9IChieXRlKWluc3RydW1lbnRzW21ldmVudC5DaGFubmVsXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbWV2ZW50LlRlbXBvID0gb3B0aW9ucy50ZW1wbztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9ucy5wYXVzZVRpbWUgIT0gMCkge1xuICAgICAgICAgICAgbmV3ZXZlbnRzID0gU3RhcnRBdFBhdXNlVGltZShuZXdldmVudHMsIG9wdGlvbnMucGF1c2VUaW1lKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3ZXZlbnRzO1xuICAgIH1cblxuXG4gICAgLyoqIEFwcGx5IHRoZSBnaXZlbiBzaGVldCBtdXNpYyBvcHRpb25zIHRvIHRoZSBNaWRpTm90ZXMuXG4gICAgICogIFJldHVybiB0aGUgbWlkaSB0cmFja3Mgd2l0aCB0aGUgY2hhbmdlcyBhcHBsaWVkLlxuICAgICAqL1xuICAgIHB1YmxpYyBMaXN0PE1pZGlUcmFjaz4gQ2hhbmdlTWlkaU5vdGVzKE1pZGlPcHRpb25zIG9wdGlvbnMpIHtcbiAgICAgICAgTGlzdDxNaWRpVHJhY2s+IG5ld3RyYWNrcyA9IG5ldyBMaXN0PE1pZGlUcmFjaz4oKTtcblxuICAgICAgICBmb3IgKGludCB0cmFjayA9IDA7IHRyYWNrIDwgdHJhY2tzLkNvdW50OyB0cmFjaysrKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy50cmFja3NbdHJhY2tdKSB7XG4gICAgICAgICAgICAgICAgbmV3dHJhY2tzLkFkZCh0cmFja3NbdHJhY2tdLkNsb25lKCkgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFRvIG1ha2UgdGhlIHNoZWV0IG11c2ljIGxvb2sgbmljZXIsIHdlIHJvdW5kIHRoZSBzdGFydCB0aW1lc1xuICAgICAgICAgKiBzbyB0aGF0IG5vdGVzIGNsb3NlIHRvZ2V0aGVyIGFwcGVhciBhcyBhIHNpbmdsZSBjaG9yZC4gIFdlXG4gICAgICAgICAqIGFsc28gZXh0ZW5kIHRoZSBub3RlIGR1cmF0aW9ucywgc28gdGhhdCB3ZSBoYXZlIGxvbmdlciBub3Rlc1xuICAgICAgICAgKiBhbmQgZmV3ZXIgcmVzdCBzeW1ib2xzLlxuICAgICAgICAgKi9cbiAgICAgICAgVGltZVNpZ25hdHVyZSB0aW1lID0gdGltZXNpZztcbiAgICAgICAgaWYgKG9wdGlvbnMudGltZSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aW1lID0gb3B0aW9ucy50aW1lO1xuICAgICAgICB9XG4gICAgICAgIE1pZGlGaWxlLlJvdW5kU3RhcnRUaW1lcyhuZXd0cmFja3MsIG9wdGlvbnMuY29tYmluZUludGVydmFsLCB0aW1lc2lnKTtcbiAgICAgICAgTWlkaUZpbGUuUm91bmREdXJhdGlvbnMobmV3dHJhY2tzLCB0aW1lLlF1YXJ0ZXIpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLnR3b1N0YWZmcykge1xuICAgICAgICAgICAgbmV3dHJhY2tzID0gTWlkaUZpbGUuQ29tYmluZVRvVHdvVHJhY2tzKG5ld3RyYWNrcywgdGltZXNpZy5NZWFzdXJlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9ucy5zaGlmdHRpbWUgIT0gMCkge1xuICAgICAgICAgICAgTWlkaUZpbGUuU2hpZnRUaW1lKG5ld3RyYWNrcywgb3B0aW9ucy5zaGlmdHRpbWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLnRyYW5zcG9zZSAhPSAwKSB7XG4gICAgICAgICAgICBNaWRpRmlsZS5UcmFuc3Bvc2UobmV3dHJhY2tzLCBvcHRpb25zLnRyYW5zcG9zZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3dHJhY2tzO1xuICAgIH1cblxuXG4gICAgLyoqIFNoaWZ0IHRoZSBzdGFydHRpbWUgb2YgdGhlIG5vdGVzIGJ5IHRoZSBnaXZlbiBhbW91bnQuXG4gICAgICogVGhpcyBpcyB1c2VkIGJ5IHRoZSBTaGlmdCBOb3RlcyBtZW51IHRvIHNoaWZ0IG5vdGVzIGxlZnQvcmlnaHQuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyB2b2lkXG4gICAgU2hpZnRUaW1lKExpc3Q8TWlkaVRyYWNrPiB0cmFja3MsIGludCBhbW91bnQpXG4gICAge1xuICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKSB7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrLk5vdGVzKSB7XG4gICAgICAgICAgICAgICAgbm90ZS5TdGFydFRpbWUgKz0gYW1vdW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFNoaWZ0IHRoZSBub3RlIGtleXMgdXAvZG93biBieSB0aGUgZ2l2ZW4gYW1vdW50ICovXG4gICAgcHVibGljIHN0YXRpYyB2b2lkXG4gICAgVHJhbnNwb3NlKExpc3Q8TWlkaVRyYWNrPiB0cmFja3MsIGludCBhbW91bnQpXG4gICAge1xuICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKSB7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrLk5vdGVzKSB7XG4gICAgICAgICAgICAgICAgbm90ZS5OdW1iZXIgKz0gYW1vdW50O1xuICAgICAgICAgICAgICAgIGlmIChub3RlLk51bWJlciA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbm90ZS5OdW1iZXIgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgXG4gICAgLyogRmluZCB0aGUgaGlnaGVzdCBhbmQgbG93ZXN0IG5vdGVzIHRoYXQgb3ZlcmxhcCB0aGlzIGludGVydmFsIChzdGFydHRpbWUgdG8gZW5kdGltZSkuXG4gICAgICogVGhpcyBtZXRob2QgaXMgdXNlZCBieSBTcGxpdFRyYWNrIHRvIGRldGVybWluZSB3aGljaCBzdGFmZiAodG9wIG9yIGJvdHRvbSkgYSBub3RlXG4gICAgICogc2hvdWxkIGdvIHRvLlxuICAgICAqXG4gICAgICogRm9yIG1vcmUgYWNjdXJhdGUgU3BsaXRUcmFjaygpIHJlc3VsdHMsIHdlIGxpbWl0IHRoZSBpbnRlcnZhbC9kdXJhdGlvbiBvZiB0aGlzIG5vdGUgXG4gICAgICogKGFuZCBvdGhlciBub3RlcykgdG8gb25lIG1lYXN1cmUuIFdlIGNhcmUgb25seSBhYm91dCBoaWdoL2xvdyBub3RlcyB0aGF0IGFyZVxuICAgICAqIHJlYXNvbmFibHkgY2xvc2UgdG8gdGhpcyBub3RlLlxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIHZvaWRcbiAgICBGaW5kSGlnaExvd05vdGVzKExpc3Q8TWlkaU5vdGU+IG5vdGVzLCBpbnQgbWVhc3VyZWxlbiwgaW50IHN0YXJ0aW5kZXgsIFxuICAgICAgICAgICAgICAgICAgICAgaW50IHN0YXJ0dGltZSwgaW50IGVuZHRpbWUsIHJlZiBpbnQgaGlnaCwgcmVmIGludCBsb3cpIHtcblxuICAgICAgICBpbnQgaSA9IHN0YXJ0aW5kZXg7XG4gICAgICAgIGlmIChzdGFydHRpbWUgKyBtZWFzdXJlbGVuIDwgZW5kdGltZSkge1xuICAgICAgICAgICAgZW5kdGltZSA9IHN0YXJ0dGltZSArIG1lYXN1cmVsZW47XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoaSA8IG5vdGVzLkNvdW50ICYmIG5vdGVzW2ldLlN0YXJ0VGltZSA8IGVuZHRpbWUpIHtcbiAgICAgICAgICAgIGlmIChub3Rlc1tpXS5FbmRUaW1lIDwgc3RhcnR0aW1lKSB7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5vdGVzW2ldLlN0YXJ0VGltZSArIG1lYXN1cmVsZW4gPCBzdGFydHRpbWUpIHtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaGlnaCA8IG5vdGVzW2ldLk51bWJlcikge1xuICAgICAgICAgICAgICAgIGhpZ2ggPSBub3Rlc1tpXS5OdW1iZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobG93ID4gbm90ZXNbaV0uTnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgbG93ID0gbm90ZXNbaV0uTnVtYmVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyogRmluZCB0aGUgaGlnaGVzdCBhbmQgbG93ZXN0IG5vdGVzIHRoYXQgc3RhcnQgYXQgdGhpcyBleGFjdCBzdGFydCB0aW1lICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgdm9pZFxuICAgIEZpbmRFeGFjdEhpZ2hMb3dOb3RlcyhMaXN0PE1pZGlOb3RlPiBub3RlcywgaW50IHN0YXJ0aW5kZXgsIGludCBzdGFydHRpbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJlZiBpbnQgaGlnaCwgcmVmIGludCBsb3cpIHtcblxuICAgICAgICBpbnQgaSA9IHN0YXJ0aW5kZXg7XG5cbiAgICAgICAgd2hpbGUgKG5vdGVzW2ldLlN0YXJ0VGltZSA8IHN0YXJ0dGltZSkge1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKGkgPCBub3Rlcy5Db3VudCAmJiBub3Rlc1tpXS5TdGFydFRpbWUgPT0gc3RhcnR0aW1lKSB7XG4gICAgICAgICAgICBpZiAoaGlnaCA8IG5vdGVzW2ldLk51bWJlcikge1xuICAgICAgICAgICAgICAgIGhpZ2ggPSBub3Rlc1tpXS5OdW1iZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobG93ID4gbm90ZXNbaV0uTnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgbG93ID0gbm90ZXNbaV0uTnVtYmVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiBcbiAgICAvKiBTcGxpdCB0aGUgZ2l2ZW4gTWlkaVRyYWNrIGludG8gdHdvIHRyYWNrcywgdG9wIGFuZCBib3R0b20uXG4gICAgICogVGhlIGhpZ2hlc3Qgbm90ZXMgd2lsbCBnbyBpbnRvIHRvcCwgdGhlIGxvd2VzdCBpbnRvIGJvdHRvbS5cbiAgICAgKiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gc3BsaXQgcGlhbm8gc29uZ3MgaW50byBsZWZ0LWhhbmQgKGJvdHRvbSlcbiAgICAgKiBhbmQgcmlnaHQtaGFuZCAodG9wKSB0cmFja3MuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBMaXN0PE1pZGlUcmFjaz4gU3BsaXRUcmFjayhNaWRpVHJhY2sgdHJhY2ssIGludCBtZWFzdXJlbGVuKSB7XG4gICAgICAgIExpc3Q8TWlkaU5vdGU+IG5vdGVzID0gdHJhY2suTm90ZXM7XG4gICAgICAgIGludCBjb3VudCA9IG5vdGVzLkNvdW50O1xuXG4gICAgICAgIE1pZGlUcmFjayB0b3AgPSBuZXcgTWlkaVRyYWNrKDEpO1xuICAgICAgICBNaWRpVHJhY2sgYm90dG9tID0gbmV3IE1pZGlUcmFjaygyKTtcbiAgICAgICAgTGlzdDxNaWRpVHJhY2s+IHJlc3VsdCA9IG5ldyBMaXN0PE1pZGlUcmFjaz4oMik7XG4gICAgICAgIHJlc3VsdC5BZGQodG9wKTsgcmVzdWx0LkFkZChib3R0b20pO1xuXG4gICAgICAgIGlmIChjb3VudCA9PSAwKVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcblxuICAgICAgICBpbnQgcHJldmhpZ2ggID0gNzY7IC8qIEU1LCB0b3Agb2YgdHJlYmxlIHN0YWZmICovXG4gICAgICAgIGludCBwcmV2bG93ICAgPSA0NTsgLyogQTMsIGJvdHRvbSBvZiBiYXNzIHN0YWZmICovXG4gICAgICAgIGludCBzdGFydGluZGV4ID0gMDtcblxuICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIG5vdGVzKSB7XG4gICAgICAgICAgICBpbnQgaGlnaCwgbG93LCBoaWdoRXhhY3QsIGxvd0V4YWN0O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpbnQgbnVtYmVyID0gbm90ZS5OdW1iZXI7XG4gICAgICAgICAgICBoaWdoID0gbG93ID0gaGlnaEV4YWN0ID0gbG93RXhhY3QgPSBudW1iZXI7XG5cbiAgICAgICAgICAgIHdoaWxlIChub3Rlc1tzdGFydGluZGV4XS5FbmRUaW1lIDwgbm90ZS5TdGFydFRpbWUpIHtcbiAgICAgICAgICAgICAgICBzdGFydGluZGV4Kys7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIEkndmUgdHJpZWQgc2V2ZXJhbCBhbGdvcml0aG1zIGZvciBzcGxpdHRpbmcgYSB0cmFjayBpbiB0d28sXG4gICAgICAgICAgICAgKiBhbmQgdGhlIG9uZSBiZWxvdyBzZWVtcyB0byB3b3JrIHRoZSBiZXN0OlxuICAgICAgICAgICAgICogLSBJZiB0aGlzIG5vdGUgaXMgbW9yZSB0aGFuIGFuIG9jdGF2ZSBmcm9tIHRoZSBoaWdoL2xvdyBub3Rlc1xuICAgICAgICAgICAgICogICAodGhhdCBzdGFydCBleGFjdGx5IGF0IHRoaXMgc3RhcnQgdGltZSksIGNob29zZSB0aGUgY2xvc2VzdCBvbmUuXG4gICAgICAgICAgICAgKiAtIElmIHRoaXMgbm90ZSBpcyBtb3JlIHRoYW4gYW4gb2N0YXZlIGZyb20gdGhlIGhpZ2gvbG93IG5vdGVzXG4gICAgICAgICAgICAgKiAgIChpbiB0aGlzIG5vdGUncyB0aW1lIGR1cmF0aW9uKSwgY2hvb3NlIHRoZSBjbG9zZXN0IG9uZS5cbiAgICAgICAgICAgICAqIC0gSWYgdGhlIGhpZ2ggYW5kIGxvdyBub3RlcyAodGhhdCBzdGFydCBleGFjdGx5IGF0IHRoaXMgc3RhcnR0aW1lKVxuICAgICAgICAgICAgICogICBhcmUgbW9yZSB0aGFuIGFuIG9jdGF2ZSBhcGFydCwgY2hvb3NlIHRoZSBjbG9zZXN0IG5vdGUuXG4gICAgICAgICAgICAgKiAtIElmIHRoZSBoaWdoIGFuZCBsb3cgbm90ZXMgKHRoYXQgb3ZlcmxhcCB0aGlzIHN0YXJ0dGltZSlcbiAgICAgICAgICAgICAqICAgYXJlIG1vcmUgdGhhbiBhbiBvY3RhdmUgYXBhcnQsIGNob29zZSB0aGUgY2xvc2VzdCBub3RlLlxuICAgICAgICAgICAgICogLSBFbHNlLCBsb29rIGF0IHRoZSBwcmV2aW91cyBoaWdoL2xvdyBub3RlcyB0aGF0IHdlcmUgbW9yZSB0aGFuIGFuIFxuICAgICAgICAgICAgICogICBvY3RhdmUgYXBhcnQuICBDaG9vc2UgdGhlIGNsb3Nlc2V0IG5vdGUuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIEZpbmRIaWdoTG93Tm90ZXMobm90ZXMsIG1lYXN1cmVsZW4sIHN0YXJ0aW5kZXgsIG5vdGUuU3RhcnRUaW1lLCBub3RlLkVuZFRpbWUsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWYgaGlnaCwgcmVmIGxvdyk7XG4gICAgICAgICAgICBGaW5kRXhhY3RIaWdoTG93Tm90ZXMobm90ZXMsIHN0YXJ0aW5kZXgsIG5vdGUuU3RhcnRUaW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZiBoaWdoRXhhY3QsIHJlZiBsb3dFeGFjdCk7XG5cbiAgICAgICAgICAgIGlmIChoaWdoRXhhY3QgLSBudW1iZXIgPiAxMiB8fCBudW1iZXIgLSBsb3dFeGFjdCA+IDEyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGhpZ2hFeGFjdCAtIG51bWJlciA8PSBudW1iZXIgLSBsb3dFeGFjdCkge1xuICAgICAgICAgICAgICAgICAgICB0b3AuQWRkTm90ZShub3RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJvdHRvbS5BZGROb3RlKG5vdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gXG4gICAgICAgICAgICBlbHNlIGlmIChoaWdoIC0gbnVtYmVyID4gMTIgfHwgbnVtYmVyIC0gbG93ID4gMTIpIHtcbiAgICAgICAgICAgICAgICBpZiAoaGlnaCAtIG51bWJlciA8PSBudW1iZXIgLSBsb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9wLkFkZE5vdGUobm90ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBib3R0b20uQWRkTm90ZShub3RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IFxuICAgICAgICAgICAgZWxzZSBpZiAoaGlnaEV4YWN0IC0gbG93RXhhY3QgPiAxMikge1xuICAgICAgICAgICAgICAgIGlmIChoaWdoRXhhY3QgLSBudW1iZXIgPD0gbnVtYmVyIC0gbG93RXhhY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9wLkFkZE5vdGUobm90ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBib3R0b20uQWRkTm90ZShub3RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChoaWdoIC0gbG93ID4gMTIpIHtcbiAgICAgICAgICAgICAgICBpZiAoaGlnaCAtIG51bWJlciA8PSBudW1iZXIgLSBsb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9wLkFkZE5vdGUobm90ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBib3R0b20uQWRkTm90ZShub3RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAocHJldmhpZ2ggLSBudW1iZXIgPD0gbnVtYmVyIC0gcHJldmxvdykge1xuICAgICAgICAgICAgICAgICAgICB0b3AuQWRkTm90ZShub3RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJvdHRvbS5BZGROb3RlKG5vdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogVGhlIHByZXZoaWdoL3ByZXZsb3cgYXJlIHNldCB0byB0aGUgbGFzdCBoaWdoL2xvd1xuICAgICAgICAgICAgICogdGhhdCBhcmUgbW9yZSB0aGFuIGFuIG9jdGF2ZSBhcGFydC5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYgKGhpZ2ggLSBsb3cgPiAxMikge1xuICAgICAgICAgICAgICAgIHByZXZoaWdoID0gaGlnaDtcbiAgICAgICAgICAgICAgICBwcmV2bG93ID0gbG93O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdG9wLk5vdGVzLlNvcnQodHJhY2suTm90ZXNbMF0pO1xuICAgICAgICBib3R0b20uTm90ZXMuU29ydCh0cmFjay5Ob3Rlc1swXSk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cblxuICAgIC8qKiBDb21iaW5lIHRoZSBub3RlcyBpbiB0aGUgZ2l2ZW4gdHJhY2tzIGludG8gYSBzaW5nbGUgTWlkaVRyYWNrLiBcbiAgICAgKiAgVGhlIGluZGl2aWR1YWwgdHJhY2tzIGFyZSBhbHJlYWR5IHNvcnRlZC4gIFRvIG1lcmdlIHRoZW0sIHdlXG4gICAgICogIHVzZSBhIG1lcmdlc29ydC1saWtlIGFsZ29yaXRobS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIE1pZGlUcmFjayBDb21iaW5lVG9TaW5nbGVUcmFjayhMaXN0PE1pZGlUcmFjaz4gdHJhY2tzKVxuICAgIHtcbiAgICAgICAgLyogQWRkIGFsbCBub3RlcyBpbnRvIG9uZSB0cmFjayAqL1xuICAgICAgICBNaWRpVHJhY2sgcmVzdWx0ID0gbmV3IE1pZGlUcmFjaygxKTtcblxuICAgICAgICBpZiAodHJhY2tzLkNvdW50ID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHJhY2tzLkNvdW50ID09IDEpIHtcbiAgICAgICAgICAgIE1pZGlUcmFjayB0cmFjayA9IHRyYWNrc1swXTtcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG5vdGUgaW4gdHJhY2suTm90ZXMpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQuQWRkTm90ZShub3RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICBpbnRbXSBub3RlaW5kZXggPSBuZXcgaW50WzY0XTtcbiAgICAgICAgaW50W10gbm90ZWNvdW50ID0gbmV3IGludFs2NF07XG5cbiAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IHRyYWNrcy5Db3VudDsgdHJhY2tudW0rKykge1xuICAgICAgICAgICAgbm90ZWluZGV4W3RyYWNrbnVtXSA9IDA7XG4gICAgICAgICAgICBub3RlY291bnRbdHJhY2tudW1dID0gdHJhY2tzW3RyYWNrbnVtXS5Ob3Rlcy5Db3VudDtcbiAgICAgICAgfVxuICAgICAgICBNaWRpTm90ZSBwcmV2bm90ZSA9IG51bGw7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBNaWRpTm90ZSBsb3dlc3Rub3RlID0gbnVsbDtcbiAgICAgICAgICAgIGludCBsb3dlc3RUcmFjayA9IC0xO1xuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IHRyYWNrcy5Db3VudDsgdHJhY2tudW0rKykge1xuICAgICAgICAgICAgICAgIE1pZGlUcmFjayB0cmFjayA9IHRyYWNrc1t0cmFja251bV07XG4gICAgICAgICAgICAgICAgaWYgKG5vdGVpbmRleFt0cmFja251bV0gPj0gbm90ZWNvdW50W3RyYWNrbnVtXSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgTWlkaU5vdGUgbm90ZSA9IHRyYWNrLk5vdGVzWyBub3RlaW5kZXhbdHJhY2tudW1dIF07XG4gICAgICAgICAgICAgICAgaWYgKGxvd2VzdG5vdGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBsb3dlc3Rub3RlID0gbm90ZTtcbiAgICAgICAgICAgICAgICAgICAgbG93ZXN0VHJhY2sgPSB0cmFja251bTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobm90ZS5TdGFydFRpbWUgPCBsb3dlc3Rub3RlLlN0YXJ0VGltZSkge1xuICAgICAgICAgICAgICAgICAgICBsb3dlc3Rub3RlID0gbm90ZTtcbiAgICAgICAgICAgICAgICAgICAgbG93ZXN0VHJhY2sgPSB0cmFja251bTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobm90ZS5TdGFydFRpbWUgPT0gbG93ZXN0bm90ZS5TdGFydFRpbWUgJiYgbm90ZS5OdW1iZXIgPCBsb3dlc3Rub3RlLk51bWJlcikge1xuICAgICAgICAgICAgICAgICAgICBsb3dlc3Rub3RlID0gbm90ZTtcbiAgICAgICAgICAgICAgICAgICAgbG93ZXN0VHJhY2sgPSB0cmFja251bTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobG93ZXN0bm90ZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLyogV2UndmUgZmluaXNoZWQgdGhlIG1lcmdlICovXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBub3RlaW5kZXhbbG93ZXN0VHJhY2tdKys7XG4gICAgICAgICAgICBpZiAoKHByZXZub3RlICE9IG51bGwpICYmIChwcmV2bm90ZS5TdGFydFRpbWUgPT0gbG93ZXN0bm90ZS5TdGFydFRpbWUpICYmXG4gICAgICAgICAgICAgICAgKHByZXZub3RlLk51bWJlciA9PSBsb3dlc3Rub3RlLk51bWJlcikgKSB7XG5cbiAgICAgICAgICAgICAgICAvKiBEb24ndCBhZGQgZHVwbGljYXRlIG5vdGVzLCB3aXRoIHRoZSBzYW1lIHN0YXJ0IHRpbWUgYW5kIG51bWJlciAqLyAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKGxvd2VzdG5vdGUuRHVyYXRpb24gPiBwcmV2bm90ZS5EdXJhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBwcmV2bm90ZS5EdXJhdGlvbiA9IGxvd2VzdG5vdGUuRHVyYXRpb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LkFkZE5vdGUobG93ZXN0bm90ZSk7XG4gICAgICAgICAgICAgICAgcHJldm5vdGUgPSBsb3dlc3Rub3RlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG5cbiAgICAvKiogQ29tYmluZSB0aGUgbm90ZXMgaW4gYWxsIHRoZSB0cmFja3MgZ2l2ZW4gaW50byB0d28gTWlkaVRyYWNrcyxcbiAgICAgKiBhbmQgcmV0dXJuIHRoZW0uXG4gICAgICogXG4gICAgICogVGhpcyBmdW5jdGlvbiBpcyBpbnRlbmRlZCBmb3IgcGlhbm8gc29uZ3MsIHdoZW4gd2Ugd2FudCB0byBkaXNwbGF5XG4gICAgICogYSBsZWZ0LWhhbmQgdHJhY2sgYW5kIGEgcmlnaHQtaGFuZCB0cmFjay4gIFRoZSBsb3dlciBub3RlcyBnbyBpbnRvIFxuICAgICAqIHRoZSBsZWZ0LWhhbmQgdHJhY2ssIGFuZCB0aGUgaGlnaGVyIG5vdGVzIGdvIGludG8gdGhlIHJpZ2h0IGhhbmQgXG4gICAgICogdHJhY2suXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBMaXN0PE1pZGlUcmFjaz4gQ29tYmluZVRvVHdvVHJhY2tzKExpc3Q8TWlkaVRyYWNrPiB0cmFja3MsIGludCBtZWFzdXJlbGVuKVxuICAgIHtcbiAgICAgICAgTWlkaVRyYWNrIHNpbmdsZSA9IENvbWJpbmVUb1NpbmdsZVRyYWNrKHRyYWNrcyk7XG4gICAgICAgIExpc3Q8TWlkaVRyYWNrPiByZXN1bHQgPSBTcGxpdFRyYWNrKHNpbmdsZSwgbWVhc3VyZWxlbik7XG5cbiAgICAgICAgTGlzdDxNaWRpRXZlbnQ+IGx5cmljcyA9IG5ldyBMaXN0PE1pZGlFdmVudD4oKTtcbiAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcykge1xuICAgICAgICAgICAgaWYgKHRyYWNrLkx5cmljcyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbHlyaWNzLkFkZFJhbmdlKHRyYWNrLkx5cmljcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGx5cmljcy5Db3VudCA+IDApIHtcbiAgICAgICAgICAgIGx5cmljcy5Tb3J0KGx5cmljc1swXSk7XG4gICAgICAgICAgICByZXN1bHRbMF0uTHlyaWNzID0gbHlyaWNzO1xuICAgICAgICB9IFxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG5cbiAgICAvKiogQ2hlY2sgdGhhdCB0aGUgTWlkaU5vdGUgc3RhcnQgdGltZXMgYXJlIGluIGluY3JlYXNpbmcgb3JkZXIuXG4gICAgICogVGhpcyBpcyBmb3IgZGVidWdnaW5nIHB1cnBvc2VzLlxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIHZvaWQgQ2hlY2tTdGFydFRpbWVzKExpc3Q8TWlkaVRyYWNrPiB0cmFja3MpIHtcbiAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcykge1xuICAgICAgICAgICAgaW50IHByZXZ0aW1lID0gLTE7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrLk5vdGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vdGUuU3RhcnRUaW1lIDwgcHJldnRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5c3RlbS5Bcmd1bWVudEV4Y2VwdGlvbihcInN0YXJ0IHRpbWVzIG5vdCBpbiBpbmNyZWFzaW5nIG9yZGVyXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwcmV2dGltZSA9IG5vdGUuU3RhcnRUaW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKiogSW4gTWlkaSBGaWxlcywgdGltZSBpcyBtZWFzdXJlZCBpbiBwdWxzZXMuICBOb3RlcyB0aGF0IGhhdmVcbiAgICAgKiBwdWxzZSB0aW1lcyB0aGF0IGFyZSBjbG9zZSB0b2dldGhlciAobGlrZSB3aXRoaW4gMTAgcHVsc2VzKVxuICAgICAqIHdpbGwgc291bmQgbGlrZSB0aGV5J3JlIHRoZSBzYW1lIGNob3JkLiAgV2Ugd2FudCB0byBkcmF3XG4gICAgICogdGhlc2Ugbm90ZXMgYXMgYSBzaW5nbGUgY2hvcmQsIGl0IG1ha2VzIHRoZSBzaGVldCBtdXNpYyBtdWNoXG4gICAgICogZWFzaWVyIHRvIHJlYWQuICBXZSBkb24ndCB3YW50IHRvIGRyYXcgbm90ZXMgdGhhdCBhcmUgY2xvc2VcbiAgICAgKiB0b2dldGhlciBhcyB0d28gc2VwYXJhdGUgY2hvcmRzLlxuICAgICAqXG4gICAgICogVGhlIFN5bWJvbFNwYWNpbmcgY2xhc3Mgb25seSBhbGlnbnMgbm90ZXMgdGhhdCBoYXZlIGV4YWN0bHkgdGhlIHNhbWVcbiAgICAgKiBzdGFydCB0aW1lcy4gIE5vdGVzIHdpdGggc2xpZ2h0bHkgZGlmZmVyZW50IHN0YXJ0IHRpbWVzIHdpbGxcbiAgICAgKiBhcHBlYXIgaW4gc2VwYXJhdGUgdmVydGljYWwgY29sdW1ucy4gIFRoaXMgaXNuJ3Qgd2hhdCB3ZSB3YW50LlxuICAgICAqIFdlIHdhbnQgdG8gYWxpZ24gbm90ZXMgd2l0aCBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIHN0YXJ0IHRpbWVzLlxuICAgICAqIFNvLCB0aGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gYXNzaWduIHRoZSBzYW1lIHN0YXJ0dGltZSBmb3Igbm90ZXNcbiAgICAgKiB0aGF0IGFyZSBjbG9zZSB0b2dldGhlciAodGltZXdpc2UpLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgdm9pZFxuICAgIFJvdW5kU3RhcnRUaW1lcyhMaXN0PE1pZGlUcmFjaz4gdHJhY2tzLCBpbnQgbWlsbGlzZWMsIFRpbWVTaWduYXR1cmUgdGltZSkge1xuICAgICAgICAvKiBHZXQgYWxsIHRoZSBzdGFydHRpbWVzIGluIGFsbCB0cmFja3MsIGluIHNvcnRlZCBvcmRlciAqL1xuICAgICAgICBMaXN0PGludD4gc3RhcnR0aW1lcyA9IG5ldyBMaXN0PGludD4oKTtcbiAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcykge1xuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiB0cmFjay5Ob3Rlcykge1xuICAgICAgICAgICAgICAgIHN0YXJ0dGltZXMuQWRkKCBub3RlLlN0YXJ0VGltZSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN0YXJ0dGltZXMuU29ydCgpO1xuXG4gICAgICAgIC8qIE5vdGVzIHdpdGhpbiBcIm1pbGxpc2VjXCIgbWlsbGlzZWNvbmRzIGFwYXJ0IHdpbGwgYmUgY29tYmluZWQuICovXG4gICAgICAgIGludCBpbnRlcnZhbCA9IHRpbWUuUXVhcnRlciAqIG1pbGxpc2VjICogMTAwMCAvIHRpbWUuVGVtcG87XG5cbiAgICAgICAgLyogSWYgdHdvIHN0YXJ0dGltZXMgYXJlIHdpdGhpbiBpbnRlcnZhbCBtaWxsaXNlYywgbWFrZSB0aGVtIHRoZSBzYW1lICovXG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgc3RhcnR0aW1lcy5Db3VudCAtIDE7IGkrKykge1xuICAgICAgICAgICAgaWYgKHN0YXJ0dGltZXNbaSsxXSAtIHN0YXJ0dGltZXNbaV0gPD0gaW50ZXJ2YWwpIHtcbiAgICAgICAgICAgICAgICBzdGFydHRpbWVzW2krMV0gPSBzdGFydHRpbWVzW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgQ2hlY2tTdGFydFRpbWVzKHRyYWNrcyk7XG5cbiAgICAgICAgLyogQWRqdXN0IHRoZSBub3RlIHN0YXJ0dGltZXMsIHNvIHRoYXQgaXQgbWF0Y2hlcyBvbmUgb2YgdGhlIHN0YXJ0dGltZXMgdmFsdWVzICovXG4gICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpIHtcbiAgICAgICAgICAgIGludCBpID0gMDtcblxuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiB0cmFjay5Ob3Rlcykge1xuICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgc3RhcnR0aW1lcy5Db3VudCAmJlxuICAgICAgICAgICAgICAgICAgICAgICBub3RlLlN0YXJ0VGltZSAtIGludGVydmFsID4gc3RhcnR0aW1lc1tpXSkge1xuICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKG5vdGUuU3RhcnRUaW1lID4gc3RhcnR0aW1lc1tpXSAmJlxuICAgICAgICAgICAgICAgICAgICBub3RlLlN0YXJ0VGltZSAtIHN0YXJ0dGltZXNbaV0gPD0gaW50ZXJ2YWwpIHtcblxuICAgICAgICAgICAgICAgICAgICBub3RlLlN0YXJ0VGltZSA9IHN0YXJ0dGltZXNbaV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJhY2suTm90ZXMuU29ydCh0cmFjay5Ob3Rlc1swXSk7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIC8qKiBXZSB3YW50IG5vdGUgZHVyYXRpb25zIHRvIHNwYW4gdXAgdG8gdGhlIG5leHQgbm90ZSBpbiBnZW5lcmFsLlxuICAgICAqIFRoZSBzaGVldCBtdXNpYyBsb29rcyBuaWNlciB0aGF0IHdheS4gIEluIGNvbnRyYXN0LCBzaGVldCBtdXNpY1xuICAgICAqIHdpdGggbG90cyBvZiAxNnRoLzMybmQgbm90ZXMgc2VwYXJhdGVkIGJ5IHNtYWxsIHJlc3RzIGRvZXNuJ3RcbiAgICAgKiBsb29rIGFzIG5pY2UuICBIYXZpbmcgbmljZSBsb29raW5nIHNoZWV0IG11c2ljIGlzIG1vcmUgaW1wb3J0YW50XG4gICAgICogdGhhbiBmYWl0aGZ1bGx5IHJlcHJlc2VudGluZyB0aGUgTWlkaSBGaWxlIGRhdGEuXG4gICAgICpcbiAgICAgKiBUaGVyZWZvcmUsIHRoaXMgZnVuY3Rpb24gcm91bmRzIHRoZSBkdXJhdGlvbiBvZiBNaWRpTm90ZXMgdXAgdG9cbiAgICAgKiB0aGUgbmV4dCBub3RlIHdoZXJlIHBvc3NpYmxlLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgdm9pZFxuICAgIFJvdW5kRHVyYXRpb25zKExpc3Q8TWlkaVRyYWNrPiB0cmFja3MsIGludCBxdWFydGVybm90ZSkge1xuXG4gICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MgKSB7XG4gICAgICAgICAgICBNaWRpTm90ZSBwcmV2Tm90ZSA9IG51bGw7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHRyYWNrLk5vdGVzLkNvdW50LTE7IGkrKykge1xuICAgICAgICAgICAgICAgIE1pZGlOb3RlIG5vdGUxID0gdHJhY2suTm90ZXNbaV07XG4gICAgICAgICAgICAgICAgaWYgKHByZXZOb3RlID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJldk5vdGUgPSBub3RlMTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvKiBHZXQgdGhlIG5leHQgbm90ZSB0aGF0IGhhcyBhIGRpZmZlcmVudCBzdGFydCB0aW1lICovXG4gICAgICAgICAgICAgICAgTWlkaU5vdGUgbm90ZTIgPSBub3RlMTtcbiAgICAgICAgICAgICAgICBmb3IgKGludCBqID0gaSsxOyBqIDwgdHJhY2suTm90ZXMuQ291bnQ7IGorKykge1xuICAgICAgICAgICAgICAgICAgICBub3RlMiA9IHRyYWNrLk5vdGVzW2pdO1xuICAgICAgICAgICAgICAgICAgICBpZiAobm90ZTEuU3RhcnRUaW1lIDwgbm90ZTIuU3RhcnRUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbnQgbWF4ZHVyYXRpb24gPSBub3RlMi5TdGFydFRpbWUgLSBub3RlMS5TdGFydFRpbWU7XG5cbiAgICAgICAgICAgICAgICBpbnQgZHVyID0gMDtcbiAgICAgICAgICAgICAgICBpZiAocXVhcnRlcm5vdGUgPD0gbWF4ZHVyYXRpb24pXG4gICAgICAgICAgICAgICAgICAgIGR1ciA9IHF1YXJ0ZXJub3RlO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHF1YXJ0ZXJub3RlLzIgPD0gbWF4ZHVyYXRpb24pXG4gICAgICAgICAgICAgICAgICAgIGR1ciA9IHF1YXJ0ZXJub3RlLzI7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocXVhcnRlcm5vdGUvMyA8PSBtYXhkdXJhdGlvbilcbiAgICAgICAgICAgICAgICAgICAgZHVyID0gcXVhcnRlcm5vdGUvMztcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChxdWFydGVybm90ZS80IDw9IG1heGR1cmF0aW9uKVxuICAgICAgICAgICAgICAgICAgICBkdXIgPSBxdWFydGVybm90ZS80O1xuXG5cbiAgICAgICAgICAgICAgICBpZiAoZHVyIDwgbm90ZTEuRHVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgZHVyID0gbm90ZTEuRHVyYXRpb247XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLyogU3BlY2lhbCBjYXNlOiBJZiB0aGUgcHJldmlvdXMgbm90ZSdzIGR1cmF0aW9uXG4gICAgICAgICAgICAgICAgICogbWF0Y2hlcyB0aGlzIG5vdGUncyBkdXJhdGlvbiwgd2UgY2FuIG1ha2UgYSBub3RlcGFpci5cbiAgICAgICAgICAgICAgICAgKiBTbyBkb24ndCBleHBhbmQgdGhlIGR1cmF0aW9uIGluIHRoYXQgY2FzZS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAoKHByZXZOb3RlLlN0YXJ0VGltZSArIHByZXZOb3RlLkR1cmF0aW9uID09IG5vdGUxLlN0YXJ0VGltZSkgJiZcbiAgICAgICAgICAgICAgICAgICAgKHByZXZOb3RlLkR1cmF0aW9uID09IG5vdGUxLkR1cmF0aW9uKSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGR1ciA9IG5vdGUxLkR1cmF0aW9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBub3RlMS5EdXJhdGlvbiA9IGR1cjtcbiAgICAgICAgICAgICAgICBpZiAodHJhY2suTm90ZXNbaSsxXS5TdGFydFRpbWUgIT0gbm90ZTEuU3RhcnRUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHByZXZOb3RlID0gbm90ZTE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFNwbGl0IHRoZSBnaXZlbiB0cmFjayBpbnRvIG11bHRpcGxlIHRyYWNrcywgc2VwYXJhdGluZyBlYWNoXG4gICAgICogY2hhbm5lbCBpbnRvIGEgc2VwYXJhdGUgdHJhY2suXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgTGlzdDxNaWRpVHJhY2s+IFxuICAgIFNwbGl0Q2hhbm5lbHMoTWlkaVRyYWNrIG9yaWd0cmFjaywgTGlzdDxNaWRpRXZlbnQ+IGV2ZW50cykge1xuXG4gICAgICAgIC8qIEZpbmQgdGhlIGluc3RydW1lbnQgdXNlZCBmb3IgZWFjaCBjaGFubmVsICovXG4gICAgICAgIGludFtdIGNoYW5uZWxJbnN0cnVtZW50cyA9IG5ldyBpbnRbMTZdO1xuICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbWV2ZW50IGluIGV2ZW50cykge1xuICAgICAgICAgICAgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnRQcm9ncmFtQ2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgY2hhbm5lbEluc3RydW1lbnRzW21ldmVudC5DaGFubmVsXSA9IG1ldmVudC5JbnN0cnVtZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNoYW5uZWxJbnN0cnVtZW50c1s5XSA9IDEyODsgLyogQ2hhbm5lbCA5ID0gUGVyY3Vzc2lvbiAqL1xuXG4gICAgICAgIExpc3Q8TWlkaVRyYWNrPiByZXN1bHQgPSBuZXcgTGlzdDxNaWRpVHJhY2s+KCk7XG4gICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG5vdGUgaW4gb3JpZ3RyYWNrLk5vdGVzKSB7XG4gICAgICAgICAgICBib29sIGZvdW5kY2hhbm5lbCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGlmIChub3RlLkNoYW5uZWwgPT0gdHJhY2suTm90ZXNbMF0uQ2hhbm5lbCkge1xuICAgICAgICAgICAgICAgICAgICBmb3VuZGNoYW5uZWwgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0cmFjay5BZGROb3RlKG5vdGUpOyBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWZvdW5kY2hhbm5lbCkge1xuICAgICAgICAgICAgICAgIE1pZGlUcmFjayB0cmFjayA9IG5ldyBNaWRpVHJhY2socmVzdWx0LkNvdW50ICsgMSk7XG4gICAgICAgICAgICAgICAgdHJhY2suQWRkTm90ZShub3RlKTtcbiAgICAgICAgICAgICAgICB0cmFjay5JbnN0cnVtZW50ID0gY2hhbm5lbEluc3RydW1lbnRzW25vdGUuQ2hhbm5lbF07XG4gICAgICAgICAgICAgICAgcmVzdWx0LkFkZCh0cmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9yaWd0cmFjay5MeXJpY3MgIT0gbnVsbCkge1xuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaUV2ZW50IGx5cmljRXZlbnQgaW4gb3JpZ3RyYWNrLkx5cmljcykge1xuICAgICAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGx5cmljRXZlbnQuQ2hhbm5lbCA9PSB0cmFjay5Ob3Rlc1swXS5DaGFubmVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFjay5BZGRMeXJpYyhseXJpY0V2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuXG4gICAgLyoqIEd1ZXNzIHRoZSBtZWFzdXJlIGxlbmd0aC4gIFdlIGFzc3VtZSB0aGF0IHRoZSBtZWFzdXJlXG4gICAgICogbGVuZ3RoIG11c3QgYmUgYmV0d2VlbiAwLjUgc2Vjb25kcyBhbmQgNCBzZWNvbmRzLlxuICAgICAqIFRha2UgYWxsIHRoZSBub3RlIHN0YXJ0IHRpbWVzIHRoYXQgZmFsbCBiZXR3ZWVuIDAuNSBhbmQgXG4gICAgICogNCBzZWNvbmRzLCBhbmQgcmV0dXJuIHRoZSBzdGFydHRpbWVzLlxuICAgICAqL1xuICAgIHB1YmxpYyBMaXN0PGludD4gXG4gICAgR3Vlc3NNZWFzdXJlTGVuZ3RoKCkge1xuICAgICAgICBMaXN0PGludD4gcmVzdWx0ID0gbmV3IExpc3Q8aW50PigpO1xuXG4gICAgICAgIGludCBwdWxzZXNfcGVyX3NlY29uZCA9IChpbnQpICgxMDAwMDAwLjAgLyB0aW1lc2lnLlRlbXBvICogdGltZXNpZy5RdWFydGVyKTtcbiAgICAgICAgaW50IG1pbm1lYXN1cmUgPSBwdWxzZXNfcGVyX3NlY29uZCAvIDI7ICAvKiBUaGUgbWluaW11bSBtZWFzdXJlIGxlbmd0aCBpbiBwdWxzZXMgKi9cbiAgICAgICAgaW50IG1heG1lYXN1cmUgPSBwdWxzZXNfcGVyX3NlY29uZCAqIDQ7ICAvKiBUaGUgbWF4aW11bSBtZWFzdXJlIGxlbmd0aCBpbiBwdWxzZXMgKi9cblxuICAgICAgICAvKiBHZXQgdGhlIHN0YXJ0IHRpbWUgb2YgdGhlIGZpcnN0IG5vdGUgaW4gdGhlIG1pZGkgZmlsZS4gKi9cbiAgICAgICAgaW50IGZpcnN0bm90ZSA9IHRpbWVzaWcuTWVhc3VyZSAqIDU7XG4gICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpIHtcbiAgICAgICAgICAgIGlmIChmaXJzdG5vdGUgPiB0cmFjay5Ob3Rlc1swXS5TdGFydFRpbWUpIHtcbiAgICAgICAgICAgICAgICBmaXJzdG5vdGUgPSB0cmFjay5Ob3Rlc1swXS5TdGFydFRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBpbnRlcnZhbCA9IDAuMDYgc2Vjb25kcywgY29udmVydGVkIGludG8gcHVsc2VzICovXG4gICAgICAgIGludCBpbnRlcnZhbCA9IHRpbWVzaWcuUXVhcnRlciAqIDYwMDAwIC8gdGltZXNpZy5UZW1wbztcblxuICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKSB7XG4gICAgICAgICAgICBpbnQgcHJldnRpbWUgPSAwO1xuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiB0cmFjay5Ob3Rlcykge1xuICAgICAgICAgICAgICAgIGlmIChub3RlLlN0YXJ0VGltZSAtIHByZXZ0aW1lIDw9IGludGVydmFsKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgIHByZXZ0aW1lID0gbm90ZS5TdGFydFRpbWU7XG5cbiAgICAgICAgICAgICAgICBpbnQgdGltZV9mcm9tX2ZpcnN0bm90ZSA9IG5vdGUuU3RhcnRUaW1lIC0gZmlyc3Rub3RlO1xuXG4gICAgICAgICAgICAgICAgLyogUm91bmQgdGhlIHRpbWUgZG93biB0byBhIG11bHRpcGxlIG9mIDQgKi9cbiAgICAgICAgICAgICAgICB0aW1lX2Zyb21fZmlyc3Rub3RlID0gdGltZV9mcm9tX2ZpcnN0bm90ZSAvIDQgKiA0O1xuICAgICAgICAgICAgICAgIGlmICh0aW1lX2Zyb21fZmlyc3Rub3RlIDwgbWlubWVhc3VyZSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgaWYgKHRpbWVfZnJvbV9maXJzdG5vdGUgPiBtYXhtZWFzdXJlKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGlmICghcmVzdWx0LkNvbnRhaW5zKHRpbWVfZnJvbV9maXJzdG5vdGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5BZGQodGltZV9mcm9tX2ZpcnN0bm90ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC5Tb3J0KCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgbGFzdCBzdGFydCB0aW1lICovXG4gICAgcHVibGljIGludCBFbmRUaW1lKCkge1xuICAgICAgICBpbnQgbGFzdFN0YXJ0ID0gMDtcbiAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcykge1xuICAgICAgICAgICAgaWYgKHRyYWNrLk5vdGVzLkNvdW50ID09IDApIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGludCBsYXN0ID0gdHJhY2suTm90ZXNbIHRyYWNrLk5vdGVzLkNvdW50LTEgXS5TdGFydFRpbWU7XG4gICAgICAgICAgICBsYXN0U3RhcnQgPSBNYXRoLk1heChsYXN0LCBsYXN0U3RhcnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsYXN0U3RhcnQ7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0cnVlIGlmIHRoaXMgbWlkaSBmaWxlIGhhcyBseXJpY3MgKi9cbiAgICBwdWJsaWMgYm9vbCBIYXNMeXJpY3MoKSB7XG4gICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpIHtcbiAgICAgICAgICAgIGlmICh0cmFjay5MeXJpY3MgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb3ZlcnJpZGUgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICBzdHJpbmcgcmVzdWx0ID0gXCJNaWRpIEZpbGUgdHJhY2tzPVwiICsgdHJhY2tzLkNvdW50ICsgXCIgcXVhcnRlcj1cIiArIHF1YXJ0ZXJub3RlICsgXCJcXG5cIjtcbiAgICAgICAgcmVzdWx0ICs9IFRpbWUuVG9TdHJpbmcoKSArIFwiXFxuXCI7XG4gICAgICAgIGZvcmVhY2goTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcykge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHRyYWNrLlRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKiBDb21tYW5kLWxpbmUgcHJvZ3JhbSB0byBwcmludCBvdXQgYSBwYXJzZWQgTWlkaSBmaWxlLiBVc2VkIGZvciBkZWJ1Z2dpbmcuXG4gICAgICogVG8gcnVuOlxuICAgICAqIC0gQ2hhbmdlIE1haW4yIHRvIE1haW5cbiAgICAgKiAtIGNzYyBNaWRpTm90ZS5jcyBNaWRpRXZlbnQuY3MgTWlkaVRyYWNrLmNzIE1pZGlGaWxlUmVhZGVyLmNzIE1pZGlPcHRpb25zLmNzXG4gICAgICogICBNaWRpRmlsZS5jcyBNaWRpRmlsZUV4Y2VwdGlvbi5jcyBUaW1lU2lnbmF0dXJlLmNzIENvbmZpZ0lOSS5jc1xuICAgICAqIC0gTWlkaUZpbGUuZXhlIGZpbGUubWlkXG4gICAgICpcbiAgICAgKi9cbiAgICAvL3B1YmxpYyBzdGF0aWMgdm9pZCBNYWluMihzdHJpbmdbXSBhcmcpIHtcbiAgICAvLyAgICBpZiAoYXJnLkxlbmd0aCA9PSAwKSB7XG4gICAgLy8gICAgICAgIENvbnNvbGUuV3JpdGVMaW5lKFwiVXNhZ2U6IE1pZGlGaWxlIDxmaWxlbmFtZT5cIik7XG4gICAgLy8gICAgICAgIHJldHVybjtcbiAgICAvLyAgICB9XG5cbiAgICAvLyAgICBNaWRpRmlsZSBmID0gbmV3IE1pZGlGaWxlKGFyZ1swXSk7XG4gICAgLy8gICAgQ29uc29sZS5Xcml0ZShmLlRvU3RyaW5nKCkpO1xuICAgIC8vfVxuXG59ICAvKiBFbmQgY2xhc3MgTWlkaUZpbGUgKi9cblxuXG59ICAvKiBFbmQgbmFtZXNwYWNlIE1pZGlTaGVldE11c2ljICovXG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMiBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogQGNsYXNzIE1pZGlGaWxlRXhjZXB0aW9uXG4gKiBBIE1pZGlGaWxlRXhjZXB0aW9uIGlzIHRocm93biB3aGVuIGFuIGVycm9yIG9jY3Vyc1xuICogd2hpbGUgcGFyc2luZyB0aGUgTWlkaSBGaWxlLiAgVGhlIGNvbnN0cnVjdG9yIHRha2VzXG4gKiB0aGUgZmlsZSBvZmZzZXQgKGluIGJ5dGVzKSB3aGVyZSB0aGUgZXJyb3Igb2NjdXJyZWQsXG4gKiBhbmQgYSBzdHJpbmcgZGVzY3JpYmluZyB0aGUgZXJyb3IuXG4gKi9cbnB1YmxpYyBjbGFzcyBNaWRpRmlsZUV4Y2VwdGlvbiA6IFN5c3RlbS5FeGNlcHRpb24ge1xuICAgIHB1YmxpYyBNaWRpRmlsZUV4Y2VwdGlvbiAoc3RyaW5nIHMsIGludCBvZmZzZXQpIDpcbiAgICAgICAgYmFzZShzICsgXCIgYXQgb2Zmc2V0IFwiICsgb2Zmc2V0KSB7XG4gICAgfVxufVxuXG59XG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMiBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG5cbi8qKiBAY2xhc3MgTWlkaUZpbGVSZWFkZXJcbiAqIFRoZSBNaWRpRmlsZVJlYWRlciBpcyB1c2VkIHRvIHJlYWQgbG93LWxldmVsIGJpbmFyeSBkYXRhIGZyb20gYSBmaWxlLlxuICogVGhpcyBjbGFzcyBjYW4gZG8gdGhlIGZvbGxvd2luZzpcbiAqXG4gKiAtIFBlZWsgYXQgdGhlIG5leHQgYnl0ZSBpbiB0aGUgZmlsZS5cbiAqIC0gUmVhZCBhIGJ5dGVcbiAqIC0gUmVhZCBhIDE2LWJpdCBiaWcgZW5kaWFuIHNob3J0XG4gKiAtIFJlYWQgYSAzMi1iaXQgYmlnIGVuZGlhbiBpbnRcbiAqIC0gUmVhZCBhIGZpeGVkIGxlbmd0aCBhc2NpaSBzdHJpbmcgKG5vdCBudWxsIHRlcm1pbmF0ZWQpXG4gKiAtIFJlYWQgYSBcInZhcmlhYmxlIGxlbmd0aFwiIGludGVnZXIuICBUaGUgZm9ybWF0IG9mIHRoZSB2YXJpYWJsZSBsZW5ndGhcbiAqICAgaW50IGlzIGRlc2NyaWJlZCBhdCB0aGUgdG9wIG9mIHRoaXMgZmlsZS5cbiAqIC0gU2tpcCBhaGVhZCBhIGdpdmVuIG51bWJlciBvZiBieXRlc1xuICogLSBSZXR1cm4gdGhlIGN1cnJlbnQgb2Zmc2V0LlxuICovXG5cbnB1YmxpYyBjbGFzcyBNaWRpRmlsZVJlYWRlciB7XG4gICAgcHJpdmF0ZSBieXRlW10gZGF0YTsgICAgICAgLyoqIFRoZSBlbnRpcmUgbWlkaSBmaWxlIGRhdGEgKi9cbiAgICBwcml2YXRlIGludCBwYXJzZV9vZmZzZXQ7ICAvKiogVGhlIGN1cnJlbnQgb2Zmc2V0IHdoaWxlIHBhcnNpbmcgKi9cblxuICAgIC8qKiBDcmVhdGUgYSBuZXcgTWlkaUZpbGVSZWFkZXIgZm9yIHRoZSBnaXZlbiBmaWxlbmFtZSAqL1xuICAgIC8vcHVibGljIE1pZGlGaWxlUmVhZGVyKHN0cmluZyBmaWxlbmFtZSkge1xuICAgIC8vICAgIEZpbGVJbmZvIGluZm8gPSBuZXcgRmlsZUluZm8oZmlsZW5hbWUpO1xuICAgIC8vICAgIGlmICghaW5mby5FeGlzdHMpIHtcbiAgICAvLyAgICAgICAgdGhyb3cgbmV3IE1pZGlGaWxlRXhjZXB0aW9uKFwiRmlsZSBcIiArIGZpbGVuYW1lICsgXCIgZG9lcyBub3QgZXhpc3RcIiwgMCk7XG4gICAgLy8gICAgfVxuICAgIC8vICAgIGlmIChpbmZvLkxlbmd0aCA9PSAwKSB7XG4gICAgLy8gICAgICAgIHRocm93IG5ldyBNaWRpRmlsZUV4Y2VwdGlvbihcIkZpbGUgXCIgKyBmaWxlbmFtZSArIFwiIGlzIGVtcHR5ICgwIGJ5dGVzKVwiLCAwKTtcbiAgICAvLyAgICB9XG4gICAgLy8gICAgRmlsZVN0cmVhbSBmaWxlID0gRmlsZS5PcGVuKGZpbGVuYW1lLCBGaWxlTW9kZS5PcGVuLCBcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRmlsZUFjY2Vzcy5SZWFkLCBGaWxlU2hhcmUuUmVhZCk7XG5cbiAgICAvLyAgICAvKiBSZWFkIHRoZSBlbnRpcmUgZmlsZSBpbnRvIG1lbW9yeSAqL1xuICAgIC8vICAgIGRhdGEgPSBuZXcgYnl0ZVsgaW5mby5MZW5ndGggXTtcbiAgICAvLyAgICBpbnQgb2Zmc2V0ID0gMDtcbiAgICAvLyAgICBpbnQgbGVuID0gKGludClpbmZvLkxlbmd0aDtcbiAgICAvLyAgICB3aGlsZSAodHJ1ZSkge1xuICAgIC8vICAgICAgICBpZiAob2Zmc2V0ID09IGluZm8uTGVuZ3RoKVxuICAgIC8vICAgICAgICAgICAgYnJlYWs7XG4gICAgLy8gICAgICAgIGludCBuID0gZmlsZS5SZWFkKGRhdGEsIG9mZnNldCwgKGludCkoaW5mby5MZW5ndGggLSBvZmZzZXQpKTtcbiAgICAvLyAgICAgICAgaWYgKG4gPD0gMClcbiAgICAvLyAgICAgICAgICAgIGJyZWFrO1xuICAgIC8vICAgICAgICBvZmZzZXQgKz0gbjtcbiAgICAvLyAgICB9XG4gICAgLy8gICAgcGFyc2Vfb2Zmc2V0ID0gMDtcbiAgICAvLyAgICBmaWxlLkNsb3NlKCk7XG4gICAgLy99XG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IE1pZGlGaWxlUmVhZGVyIGZyb20gdGhlIGdpdmVuIGRhdGEgKi9cbiAgICBwdWJsaWMgTWlkaUZpbGVSZWFkZXIoYnl0ZVtdIGJ5dGVzKSB7XG4gICAgICAgIGRhdGEgPSBieXRlcztcbiAgICAgICAgcGFyc2Vfb2Zmc2V0ID0gMDtcbiAgICB9XG5cbiAgICAvKiogQ2hlY2sgdGhhdCB0aGUgZ2l2ZW4gbnVtYmVyIG9mIGJ5dGVzIGRvZXNuJ3QgZXhjZWVkIHRoZSBmaWxlIHNpemUgKi9cbiAgICBwcml2YXRlIHZvaWQgY2hlY2tSZWFkKGludCBhbW91bnQpIHtcbiAgICAgICAgaWYgKHBhcnNlX29mZnNldCArIGFtb3VudCA+IGRhdGEuTGVuZ3RoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXCJGaWxlIGlzIHRydW5jYXRlZFwiLCBwYXJzZV9vZmZzZXQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFJlYWQgdGhlIG5leHQgYnl0ZSBpbiB0aGUgZmlsZSwgYnV0IGRvbid0IGluY3JlbWVudCB0aGUgcGFyc2Ugb2Zmc2V0ICovXG4gICAgcHVibGljIGJ5dGUgUGVlaygpIHtcbiAgICAgICAgY2hlY2tSZWFkKDEpO1xuICAgICAgICByZXR1cm4gZGF0YVtwYXJzZV9vZmZzZXRdO1xuICAgIH1cblxuICAgIC8qKiBSZWFkIGEgYnl0ZSBmcm9tIHRoZSBmaWxlICovXG4gICAgcHVibGljIGJ5dGUgUmVhZEJ5dGUoKSB7IFxuICAgICAgICBjaGVja1JlYWQoMSk7XG4gICAgICAgIGJ5dGUgeCA9IGRhdGFbcGFyc2Vfb2Zmc2V0XTtcbiAgICAgICAgcGFyc2Vfb2Zmc2V0Kys7XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cblxuICAgIC8qKiBSZWFkIHRoZSBnaXZlbiBudW1iZXIgb2YgYnl0ZXMgZnJvbSB0aGUgZmlsZSAqL1xuICAgIHB1YmxpYyBieXRlW10gUmVhZEJ5dGVzKGludCBhbW91bnQpIHtcbiAgICAgICAgY2hlY2tSZWFkKGFtb3VudCk7XG4gICAgICAgIGJ5dGVbXSByZXN1bHQgPSBuZXcgYnl0ZVthbW91bnRdO1xuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IGFtb3VudDsgaSsrKSB7XG4gICAgICAgICAgICByZXN1bHRbaV0gPSBkYXRhW2kgKyBwYXJzZV9vZmZzZXRdO1xuICAgICAgICB9XG4gICAgICAgIHBhcnNlX29mZnNldCArPSBhbW91bnQ7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqIFJlYWQgYSAxNi1iaXQgc2hvcnQgZnJvbSB0aGUgZmlsZSAqL1xuICAgIHB1YmxpYyB1c2hvcnQgUmVhZFNob3J0KCkge1xuICAgICAgICBjaGVja1JlYWQoMik7XG4gICAgICAgIHVzaG9ydCB4ID0gKHVzaG9ydCkgKCAoZGF0YVtwYXJzZV9vZmZzZXRdIDw8IDgpIHwgZGF0YVtwYXJzZV9vZmZzZXQrMV0gKTtcbiAgICAgICAgcGFyc2Vfb2Zmc2V0ICs9IDI7XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cblxuICAgIC8qKiBSZWFkIGEgMzItYml0IGludCBmcm9tIHRoZSBmaWxlICovXG4gICAgcHVibGljIGludCBSZWFkSW50KCkge1xuICAgICAgICBjaGVja1JlYWQoNCk7XG4gICAgICAgIGludCB4ID0gKGludCkoIChkYXRhW3BhcnNlX29mZnNldF0gPDwgMjQpIHwgKGRhdGFbcGFyc2Vfb2Zmc2V0KzFdIDw8IDE2KSB8XG4gICAgICAgICAgICAgICAgICAgICAgIChkYXRhW3BhcnNlX29mZnNldCsyXSA8PCA4KSB8IGRhdGFbcGFyc2Vfb2Zmc2V0KzNdICk7XG4gICAgICAgIHBhcnNlX29mZnNldCArPSA0O1xuICAgICAgICByZXR1cm4geDtcbiAgICB9XG5cbiAgICAvKiogUmVhZCBhbiBhc2NpaSBzdHJpbmcgd2l0aCB0aGUgZ2l2ZW4gbGVuZ3RoICovXG4gICAgcHVibGljIHN0cmluZyBSZWFkQXNjaWkoaW50IGxlbikge1xuICAgICAgICBjaGVja1JlYWQobGVuKTtcbiAgICAgICAgc3RyaW5nIHMgPSBBU0NJSUVuY29kaW5nLkFTQ0lJLkdldFN0cmluZyhkYXRhLCBwYXJzZV9vZmZzZXQsIGxlbik7XG4gICAgICAgIHBhcnNlX29mZnNldCArPSBsZW47XG4gICAgICAgIHJldHVybiBzO1xuICAgIH1cblxuICAgIC8qKiBSZWFkIGEgdmFyaWFibGUtbGVuZ3RoIGludGVnZXIgKDEgdG8gNCBieXRlcykuIFRoZSBpbnRlZ2VyIGVuZHNcbiAgICAgKiB3aGVuIHlvdSBlbmNvdW50ZXIgYSBieXRlIHRoYXQgZG9lc24ndCBoYXZlIHRoZSA4dGggYml0IHNldFxuICAgICAqIChhIGJ5dGUgbGVzcyB0aGFuIDB4ODApLlxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgUmVhZFZhcmxlbigpIHtcbiAgICAgICAgdWludCByZXN1bHQgPSAwO1xuICAgICAgICBieXRlIGI7XG5cbiAgICAgICAgYiA9IFJlYWRCeXRlKCk7XG4gICAgICAgIHJlc3VsdCA9ICh1aW50KShiICYgMHg3Zik7XG5cbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgICAgICAgIGlmICgoYiAmIDB4ODApICE9IDApIHtcbiAgICAgICAgICAgICAgICBiID0gUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSAodWludCkoIChyZXN1bHQgPDwgNykgKyAoYiAmIDB4N2YpICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKGludClyZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqIFNraXAgb3ZlciB0aGUgZ2l2ZW4gbnVtYmVyIG9mIGJ5dGVzICovIFxuICAgIHB1YmxpYyB2b2lkIFNraXAoaW50IGFtb3VudCkge1xuICAgICAgICBjaGVja1JlYWQoYW1vdW50KTtcbiAgICAgICAgcGFyc2Vfb2Zmc2V0ICs9IGFtb3VudDtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBjdXJyZW50IHBhcnNlIG9mZnNldCAqL1xuICAgIHB1YmxpYyBpbnQgR2V0T2Zmc2V0KCkge1xuICAgICAgICByZXR1cm4gcGFyc2Vfb2Zmc2V0O1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIHJhdyBtaWRpIGZpbGUgYnl0ZSBkYXRhICovXG4gICAgcHVibGljIGJ5dGVbXSBHZXREYXRhKCkge1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG59XG5cbn0gXG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMiBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogQGNsYXNzIE1pZGlOb3RlXG4gKiBBIE1pZGlOb3RlIGNvbnRhaW5zXG4gKlxuICogc3RhcnR0aW1lIC0gVGhlIHRpbWUgKG1lYXN1cmVkIGluIHB1bHNlcykgd2hlbiB0aGUgbm90ZSBpcyBwcmVzc2VkLlxuICogY2hhbm5lbCAgIC0gVGhlIGNoYW5uZWwgdGhlIG5vdGUgaXMgZnJvbS4gIFRoaXMgaXMgdXNlZCB3aGVuIG1hdGNoaW5nXG4gKiAgICAgICAgICAgICBOb3RlT2ZmIGV2ZW50cyB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIE5vdGVPbiBldmVudC5cbiAqICAgICAgICAgICAgIFRoZSBjaGFubmVscyBmb3IgdGhlIE5vdGVPbiBhbmQgTm90ZU9mZiBldmVudHMgbXVzdCBiZVxuICogICAgICAgICAgICAgdGhlIHNhbWUuXG4gKiBub3RlbnVtYmVyIC0gVGhlIG5vdGUgbnVtYmVyLCBmcm9tIDAgdG8gMTI3LiAgTWlkZGxlIEMgaXMgNjAuXG4gKiBkdXJhdGlvbiAgLSBUaGUgdGltZSBkdXJhdGlvbiAobWVhc3VyZWQgaW4gcHVsc2VzKSBhZnRlciB3aGljaCB0aGUgXG4gKiAgICAgICAgICAgICBub3RlIGlzIHJlbGVhc2VkLlxuICpcbiAqIEEgTWlkaU5vdGUgaXMgY3JlYXRlZCB3aGVuIHdlIGVuY291bnRlciBhIE5vdGVPZmYgZXZlbnQuICBUaGUgZHVyYXRpb25cbiAqIGlzIGluaXRpYWxseSB1bmtub3duIChzZXQgdG8gMCkuICBXaGVuIHRoZSBjb3JyZXNwb25kaW5nIE5vdGVPZmYgZXZlbnRcbiAqIGlzIGZvdW5kLCB0aGUgZHVyYXRpb24gaXMgc2V0IGJ5IHRoZSBtZXRob2QgTm90ZU9mZigpLlxuICovXG5wdWJsaWMgY2xhc3MgTWlkaU5vdGUgOiBJQ29tcGFyZXI8TWlkaU5vdGU+IHtcbiAgICBwcml2YXRlIGludCBzdGFydHRpbWU7ICAgLyoqIFRoZSBzdGFydCB0aW1lLCBpbiBwdWxzZXMgKi9cbiAgICBwcml2YXRlIGludCBjaGFubmVsOyAgICAgLyoqIFRoZSBjaGFubmVsICovXG4gICAgcHJpdmF0ZSBpbnQgbm90ZW51bWJlcjsgIC8qKiBUaGUgbm90ZSwgZnJvbSAwIHRvIDEyNy4gTWlkZGxlIEMgaXMgNjAgKi9cbiAgICBwcml2YXRlIGludCBkdXJhdGlvbjsgICAgLyoqIFRoZSBkdXJhdGlvbiwgaW4gcHVsc2VzICovXG5cblxuICAgIC8qIENyZWF0ZSBhIG5ldyBNaWRpTm90ZS4gIFRoaXMgaXMgY2FsbGVkIHdoZW4gYSBOb3RlT24gZXZlbnQgaXNcbiAgICAgKiBlbmNvdW50ZXJlZCBpbiB0aGUgTWlkaUZpbGUuXG4gICAgICovXG4gICAgcHVibGljIE1pZGlOb3RlKGludCBzdGFydHRpbWUsIGludCBjaGFubmVsLCBpbnQgbm90ZW51bWJlciwgaW50IGR1cmF0aW9uKSB7XG4gICAgICAgIHRoaXMuc3RhcnR0aW1lID0gc3RhcnR0aW1lO1xuICAgICAgICB0aGlzLmNoYW5uZWwgPSBjaGFubmVsO1xuICAgICAgICB0aGlzLm5vdGVudW1iZXIgPSBub3RlbnVtYmVyO1xuICAgICAgICB0aGlzLmR1cmF0aW9uID0gZHVyYXRpb247XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgaW50IFN0YXJ0VGltZSB7XG4gICAgICAgIGdldCB7IHJldHVybiBzdGFydHRpbWU7IH1cbiAgICAgICAgc2V0IHsgc3RhcnR0aW1lID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICBwdWJsaWMgaW50IEVuZFRpbWUge1xuICAgICAgICBnZXQgeyByZXR1cm4gc3RhcnR0aW1lICsgZHVyYXRpb247IH1cbiAgICB9XG5cbiAgICBwdWJsaWMgaW50IENoYW5uZWwge1xuICAgICAgICBnZXQgeyByZXR1cm4gY2hhbm5lbDsgfVxuICAgICAgICBzZXQgeyBjaGFubmVsID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICBwdWJsaWMgaW50IE51bWJlciB7XG4gICAgICAgIGdldCB7IHJldHVybiBub3RlbnVtYmVyOyB9XG4gICAgICAgIHNldCB7IG5vdGVudW1iZXIgPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIHB1YmxpYyBpbnQgRHVyYXRpb24ge1xuICAgICAgICBnZXQgeyByZXR1cm4gZHVyYXRpb247IH1cbiAgICAgICAgc2V0IHsgZHVyYXRpb24gPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIC8qIEEgTm90ZU9mZiBldmVudCBvY2N1cnMgZm9yIHRoaXMgbm90ZSBhdCB0aGUgZ2l2ZW4gdGltZS5cbiAgICAgKiBDYWxjdWxhdGUgdGhlIG5vdGUgZHVyYXRpb24gYmFzZWQgb24gdGhlIG5vdGVvZmYgZXZlbnQuXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgTm90ZU9mZihpbnQgZW5kdGltZSkge1xuICAgICAgICBkdXJhdGlvbiA9IGVuZHRpbWUgLSBzdGFydHRpbWU7XG4gICAgfVxuXG4gICAgLyoqIENvbXBhcmUgdHdvIE1pZGlOb3RlcyBiYXNlZCBvbiB0aGVpciBzdGFydCB0aW1lcy5cbiAgICAgKiAgSWYgdGhlIHN0YXJ0IHRpbWVzIGFyZSBlcXVhbCwgY29tcGFyZSBieSB0aGVpciBudW1iZXJzLlxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgQ29tcGFyZShNaWRpTm90ZSB4LCBNaWRpTm90ZSB5KSB7XG4gICAgICAgIGlmICh4LlN0YXJ0VGltZSA9PSB5LlN0YXJ0VGltZSlcbiAgICAgICAgICAgIHJldHVybiB4Lk51bWJlciAtIHkuTnVtYmVyO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4geC5TdGFydFRpbWUgLSB5LlN0YXJ0VGltZTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBNaWRpTm90ZSBDbG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBNaWRpTm90ZShzdGFydHRpbWUsIGNoYW5uZWwsIG5vdGVudW1iZXIsIGR1cmF0aW9uKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb3ZlcnJpZGUgXG4gICAgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICBzdHJpbmdbXSBzY2FsZSA9IHsgXCJBXCIsIFwiQSNcIiwgXCJCXCIsIFwiQ1wiLCBcIkMjXCIsIFwiRFwiLCBcIkQjXCIsIFwiRVwiLCBcIkZcIiwgXCJGI1wiLCBcIkdcIiwgXCJHI1wiIH07XG4gICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiTWlkaU5vdGUgY2hhbm5lbD17MH0gbnVtYmVyPXsxfSB7Mn0gc3RhcnQ9ezN9IGR1cmF0aW9uPXs0fVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFubmVsLCBub3RlbnVtYmVyLCBzY2FsZVsobm90ZW51bWJlciArIDMpICUgMTJdLCBzdGFydHRpbWUsIGR1cmF0aW9uKTtcblxuICAgIH1cblxufVxuXG5cbn0gIC8qIEVuZCBuYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMgKi9cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDEzIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogQGNsYXNzIE1pZGlPcHRpb25zXG4gKlxuICogVGhlIE1pZGlPcHRpb25zIGNsYXNzIGNvbnRhaW5zIHRoZSBhdmFpbGFibGUgb3B0aW9ucyBmb3JcbiAqIG1vZGlmeWluZyB0aGUgc2hlZXQgbXVzaWMgYW5kIHNvdW5kLiAgVGhlc2Ugb3B0aW9ucyBhcmVcbiAqIGNvbGxlY3RlZCBmcm9tIHRoZSBtZW51L2RpYWxvZyBzZXR0aW5ncywgYW5kIHRoZW4gYXJlIHBhc3NlZFxuICogdG8gdGhlIFNoZWV0TXVzaWMgYW5kIE1pZGlQbGF5ZXIgY2xhc3Nlcy5cbiAqL1xucHVibGljIGNsYXNzIE1pZGlPcHRpb25zIHtcblxuICAgIC8vIFRoZSBwb3NzaWJsZSB2YWx1ZXMgZm9yIHNob3dOb3RlTGV0dGVyc1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTm90ZU5hbWVOb25lICAgICAgICAgICA9IDA7XG4gICAgcHVibGljIGNvbnN0IGludCBOb3RlTmFtZUxldHRlciAgICAgICAgID0gMTtcbiAgICBwdWJsaWMgY29uc3QgaW50IE5vdGVOYW1lRml4ZWREb1JlTWkgICAgPSAyO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTm90ZU5hbWVNb3ZhYmxlRG9SZU1pICA9IDM7XG4gICAgcHVibGljIGNvbnN0IGludCBOb3RlTmFtZUZpeGVkTnVtYmVyICAgID0gNDtcbiAgICBwdWJsaWMgY29uc3QgaW50IE5vdGVOYW1lTW92YWJsZU51bWJlciAgPSA1O1xuXG4gICAgLy8gU2hlZXQgTXVzaWMgT3B0aW9uc1xuICAgIHB1YmxpYyBzdHJpbmcgZmlsZW5hbWU7ICAgICAgIC8qKiBUaGUgZnVsbCBNaWRpIGZpbGVuYW1lICovXG4gICAgcHVibGljIHN0cmluZyB0aXRsZTsgICAgICAgICAgLyoqIFRoZSBNaWRpIHNvbmcgdGl0bGUgKi9cbiAgICBwdWJsaWMgYm9vbFtdIHRyYWNrczsgICAgICAgICAvKiogV2hpY2ggdHJhY2tzIHRvIGRpc3BsYXkgKHRydWUgPSBkaXNwbGF5KSAqL1xuICAgIHB1YmxpYyBib29sIHNjcm9sbFZlcnQ7ICAgICAgIC8qKiBXaGV0aGVyIHRvIHNjcm9sbCB2ZXJ0aWNhbGx5IG9yIGhvcml6b250YWxseSAqL1xuICAgIHB1YmxpYyBib29sIGxhcmdlTm90ZVNpemU7ICAgIC8qKiBEaXNwbGF5IGxhcmdlIG9yIHNtYWxsIG5vdGUgc2l6ZXMgKi9cbiAgICBwdWJsaWMgYm9vbCB0d29TdGFmZnM7ICAgICAgICAvKiogQ29tYmluZSB0cmFja3MgaW50byB0d28gc3RhZmZzID8gKi9cbiAgICBwdWJsaWMgaW50IHNob3dOb3RlTGV0dGVyczsgICAgIC8qKiBTaG93IHRoZSBuYW1lIChBLCBBIywgZXRjKSBuZXh0IHRvIHRoZSBub3RlcyAqL1xuICAgIHB1YmxpYyBib29sIHNob3dMeXJpY3M7ICAgICAgIC8qKiBTaG93IHRoZSBseXJpY3MgdW5kZXIgZWFjaCBub3RlICovXG4gICAgcHVibGljIGJvb2wgc2hvd01lYXN1cmVzOyAgICAgLyoqIFNob3cgdGhlIG1lYXN1cmUgbnVtYmVycyBmb3IgZWFjaCBzdGFmZiAqL1xuICAgIHB1YmxpYyBpbnQgc2hpZnR0aW1lOyAgICAgICAgIC8qKiBTaGlmdCBub3RlIHN0YXJ0dGltZXMgYnkgdGhlIGdpdmVuIGFtb3VudCAqL1xuICAgIHB1YmxpYyBpbnQgdHJhbnNwb3NlOyAgICAgICAgIC8qKiBTaGlmdCBub3RlIGtleSB1cC9kb3duIGJ5IGdpdmVuIGFtb3VudCAqL1xuICAgIHB1YmxpYyBpbnQga2V5OyAgICAgICAgICAgICAgIC8qKiBVc2UgdGhlIGdpdmVuIEtleVNpZ25hdHVyZSAobm90ZXNjYWxlKSAqL1xuICAgIHB1YmxpYyBUaW1lU2lnbmF0dXJlIHRpbWU7ICAgIC8qKiBVc2UgdGhlIGdpdmVuIHRpbWUgc2lnbmF0dXJlICovXG4gICAgcHVibGljIGludCBjb21iaW5lSW50ZXJ2YWw7ICAgLyoqIENvbWJpbmUgbm90ZXMgd2l0aGluIGdpdmVuIHRpbWUgaW50ZXJ2YWwgKG1zZWMpICovXG4gICAgcHVibGljIENvbG9yW10gY29sb3JzOyAgICAgICAgLyoqIFRoZSBub3RlIGNvbG9ycyB0byB1c2UgKi9cbiAgICBwdWJsaWMgQ29sb3Igc2hhZGVDb2xvcjsgICAgICAvKiogVGhlIGNvbG9yIHRvIHVzZSBmb3Igc2hhZGluZy4gKi9cbiAgICBwdWJsaWMgQ29sb3Igc2hhZGUyQ29sb3I7ICAgICAvKiogVGhlIGNvbG9yIHRvIHVzZSBmb3Igc2hhZGluZyB0aGUgbGVmdCBoYW5kIHBpYW5vICovXG5cbiAgICAvLyBTb3VuZCBvcHRpb25zXG4gICAgcHVibGljIGJvb2wgW11tdXRlOyAgICAgICAgICAgIC8qKiBXaGljaCB0cmFja3MgdG8gbXV0ZSAodHJ1ZSA9IG11dGUpICovXG4gICAgcHVibGljIGludCB0ZW1wbzsgICAgICAgICAgICAgIC8qKiBUaGUgdGVtcG8sIGluIG1pY3Jvc2Vjb25kcyBwZXIgcXVhcnRlciBub3RlICovXG4gICAgcHVibGljIGludCBwYXVzZVRpbWU7ICAgICAgICAgIC8qKiBTdGFydCB0aGUgbWlkaSBtdXNpYyBhdCB0aGUgZ2l2ZW4gcGF1c2UgdGltZSAqL1xuICAgIHB1YmxpYyBpbnRbXSBpbnN0cnVtZW50czsgICAgICAvKiogVGhlIGluc3RydW1lbnRzIHRvIHVzZSBwZXIgdHJhY2sgKi9cbiAgICBwdWJsaWMgYm9vbCB1c2VEZWZhdWx0SW5zdHJ1bWVudHM7ICAvKiogSWYgdHJ1ZSwgZG9uJ3QgY2hhbmdlIGluc3RydW1lbnRzICovXG4gICAgcHVibGljIGJvb2wgcGxheU1lYXN1cmVzSW5Mb29wOyAgICAgLyoqIFBsYXkgdGhlIHNlbGVjdGVkIG1lYXN1cmVzIGluIGEgbG9vcCAqL1xuICAgIHB1YmxpYyBpbnQgcGxheU1lYXN1cmVzSW5Mb29wU3RhcnQ7IC8qKiBTdGFydCBtZWFzdXJlIHRvIHBsYXkgaW4gbG9vcCAqL1xuICAgIHB1YmxpYyBpbnQgcGxheU1lYXN1cmVzSW5Mb29wRW5kOyAgIC8qKiBFbmQgbWVhc3VyZSB0byBwbGF5IGluIGxvb3AgKi9cblxuXG4gICAgcHVibGljIE1pZGlPcHRpb25zKCkge1xuICAgIH1cblxuICAgIHB1YmxpYyBNaWRpT3B0aW9ucyhNaWRpRmlsZSBtaWRpZmlsZSkge1xuICAgICAgICBmaWxlbmFtZSA9IG1pZGlmaWxlLkZpbGVOYW1lO1xuICAgICAgICB0aXRsZSA9IFBhdGguR2V0RmlsZU5hbWUobWlkaWZpbGUuRmlsZU5hbWUpO1xuICAgICAgICBpbnQgbnVtdHJhY2tzID0gbWlkaWZpbGUuVHJhY2tzLkNvdW50O1xuICAgICAgICB0cmFja3MgPSBuZXcgYm9vbFtudW10cmFja3NdO1xuICAgICAgICBtdXRlID0gIG5ldyBib29sW251bXRyYWNrc107XG4gICAgICAgIGluc3RydW1lbnRzID0gbmV3IGludFtudW10cmFja3NdO1xuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHRyYWNrcy5MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdHJhY2tzW2ldID0gdHJ1ZTtcbiAgICAgICAgICAgIG11dGVbaV0gPSBmYWxzZTtcbiAgICAgICAgICAgIGluc3RydW1lbnRzW2ldID0gbWlkaWZpbGUuVHJhY2tzW2ldLkluc3RydW1lbnQ7XG4gICAgICAgICAgICBpZiAobWlkaWZpbGUuVHJhY2tzW2ldLkluc3RydW1lbnROYW1lID09IFwiUGVyY3Vzc2lvblwiKSB7XG4gICAgICAgICAgICAgICAgdHJhY2tzW2ldID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgbXV0ZVtpXSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gXG4gICAgICAgIHVzZURlZmF1bHRJbnN0cnVtZW50cyA9IHRydWU7XG4gICAgICAgIHNjcm9sbFZlcnQgPSB0cnVlO1xuICAgICAgICBsYXJnZU5vdGVTaXplID0gZmFsc2U7XG4gICAgICAgIGlmICh0cmFja3MuTGVuZ3RoID09IDEpIHtcbiAgICAgICAgICAgIHR3b1N0YWZmcyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0d29TdGFmZnMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBzaG93Tm90ZUxldHRlcnMgPSBOb3RlTmFtZU5vbmU7XG4gICAgICAgIHNob3dMeXJpY3MgPSB0cnVlO1xuICAgICAgICBzaG93TWVhc3VyZXMgPSBmYWxzZTtcbiAgICAgICAgc2hpZnR0aW1lID0gMDtcbiAgICAgICAgdHJhbnNwb3NlID0gMDtcbiAgICAgICAga2V5ID0gLTE7XG4gICAgICAgIHRpbWUgPSBtaWRpZmlsZS5UaW1lO1xuICAgICAgICBjb2xvcnMgPSBudWxsO1xuICAgICAgICBzaGFkZUNvbG9yID0gQ29sb3IuRnJvbUFyZ2IoMTAwLCA1MywgMTIzLCAyNTUpO1xuICAgICAgICBzaGFkZTJDb2xvciA9IENvbG9yLkZyb21BcmdiKDgwLCAxMDAsIDI1MCk7XG4gICAgICAgIGNvbWJpbmVJbnRlcnZhbCA9IDQwO1xuICAgICAgICB0ZW1wbyA9IG1pZGlmaWxlLlRpbWUuVGVtcG87XG4gICAgICAgIHBhdXNlVGltZSA9IDA7XG4gICAgICAgIHBsYXlNZWFzdXJlc0luTG9vcCA9IGZhbHNlOyBcbiAgICAgICAgcGxheU1lYXN1cmVzSW5Mb29wU3RhcnQgPSAwO1xuICAgICAgICBwbGF5TWVhc3VyZXNJbkxvb3BFbmQgPSBtaWRpZmlsZS5FbmRUaW1lKCkgLyBtaWRpZmlsZS5UaW1lLk1lYXN1cmU7XG4gICAgfVxuXG4gICAgLyogSm9pbiB0aGUgYXJyYXkgaW50byBhIGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgKi9cbiAgICBzdGF0aWMgc3RyaW5nIEpvaW4oYm9vbFtdIHZhbHVlcykge1xuICAgICAgICBTdHJpbmdCdWlsZGVyIHJlc3VsdCA9IG5ldyBTdHJpbmdCdWlsZGVyKCk7XG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgdmFsdWVzLkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQuQXBwZW5kKFwiLFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdC5BcHBlbmQodmFsdWVzW2ldLlRvU3RyaW5nKCkpOyBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0LlRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgc3RhdGljIHN0cmluZyBKb2luKGludFtdIHZhbHVlcykge1xuICAgICAgICBTdHJpbmdCdWlsZGVyIHJlc3VsdCA9IG5ldyBTdHJpbmdCdWlsZGVyKCk7XG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgdmFsdWVzLkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQuQXBwZW5kKFwiLFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdC5BcHBlbmQodmFsdWVzW2ldLlRvU3RyaW5nKCkpOyBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0LlRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgc3RhdGljIHN0cmluZyBKb2luKENvbG9yW10gdmFsdWVzKSB7XG4gICAgICAgIFN0cmluZ0J1aWxkZXIgcmVzdWx0ID0gbmV3IFN0cmluZ0J1aWxkZXIoKTtcbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCB2YWx1ZXMuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5BcHBlbmQoXCIsXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0LkFwcGVuZChDb2xvclRvU3RyaW5nKHZhbHVlc1tpXSkpOyBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0LlRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgc3RhdGljIHN0cmluZyBDb2xvclRvU3RyaW5nKENvbG9yIGMpIHtcbiAgICAgICAgcmV0dXJuIFwiXCIgKyBjLlIgKyBcIiBcIiArIGMuRyArIFwiIFwiICsgYy5CO1xuICAgIH1cblxuICAgIFxuICAgIC8qIE1lcmdlIGluIHRoZSBzYXZlZCBvcHRpb25zIHRvIHRoaXMgTWlkaU9wdGlvbnMuKi9cbiAgICBwdWJsaWMgdm9pZCBNZXJnZShNaWRpT3B0aW9ucyBzYXZlZCkge1xuICAgICAgICBpZiAoc2F2ZWQudHJhY2tzICE9IG51bGwgJiYgc2F2ZWQudHJhY2tzLkxlbmd0aCA9PSB0cmFja3MuTGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHRyYWNrcy5MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRyYWNrc1tpXSA9IHNhdmVkLnRyYWNrc1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoc2F2ZWQubXV0ZSAhPSBudWxsICYmIHNhdmVkLm11dGUuTGVuZ3RoID09IG11dGUuTGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IG11dGUuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBtdXRlW2ldID0gc2F2ZWQubXV0ZVtpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoc2F2ZWQuaW5zdHJ1bWVudHMgIT0gbnVsbCAmJiBzYXZlZC5pbnN0cnVtZW50cy5MZW5ndGggPT0gaW5zdHJ1bWVudHMuTGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IGluc3RydW1lbnRzLkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaW5zdHJ1bWVudHNbaV0gPSBzYXZlZC5pbnN0cnVtZW50c1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoc2F2ZWQudGltZSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aW1lID0gbmV3IFRpbWVTaWduYXR1cmUoc2F2ZWQudGltZS5OdW1lcmF0b3IsIHNhdmVkLnRpbWUuRGVub21pbmF0b3IsXG4gICAgICAgICAgICAgICAgICAgIHNhdmVkLnRpbWUuUXVhcnRlciwgc2F2ZWQudGltZS5UZW1wbyk7XG4gICAgICAgIH1cbiAgICAgICAgdXNlRGVmYXVsdEluc3RydW1lbnRzID0gc2F2ZWQudXNlRGVmYXVsdEluc3RydW1lbnRzO1xuICAgICAgICBzY3JvbGxWZXJ0ID0gc2F2ZWQuc2Nyb2xsVmVydDtcbiAgICAgICAgbGFyZ2VOb3RlU2l6ZSA9IHNhdmVkLmxhcmdlTm90ZVNpemU7XG4gICAgICAgIHNob3dMeXJpY3MgPSBzYXZlZC5zaG93THlyaWNzO1xuICAgICAgICB0d29TdGFmZnMgPSBzYXZlZC50d29TdGFmZnM7XG4gICAgICAgIHNob3dOb3RlTGV0dGVycyA9IHNhdmVkLnNob3dOb3RlTGV0dGVycztcbiAgICAgICAgdHJhbnNwb3NlID0gc2F2ZWQudHJhbnNwb3NlO1xuICAgICAgICBrZXkgPSBzYXZlZC5rZXk7XG4gICAgICAgIGNvbWJpbmVJbnRlcnZhbCA9IHNhdmVkLmNvbWJpbmVJbnRlcnZhbDtcbiAgICAgICAgaWYgKHNhdmVkLnNoYWRlQ29sb3IgIT0gQ29sb3IuV2hpdGUpIHtcbiAgICAgICAgICAgIHNoYWRlQ29sb3IgPSBzYXZlZC5zaGFkZUNvbG9yO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzYXZlZC5zaGFkZTJDb2xvciAhPSBDb2xvci5XaGl0ZSkge1xuICAgICAgICAgICAgc2hhZGUyQ29sb3IgPSBzYXZlZC5zaGFkZTJDb2xvcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2F2ZWQuY29sb3JzICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNvbG9ycyA9IHNhdmVkLmNvbG9ycztcbiAgICAgICAgfVxuICAgICAgICBzaG93TWVhc3VyZXMgPSBzYXZlZC5zaG93TWVhc3VyZXM7XG4gICAgICAgIHBsYXlNZWFzdXJlc0luTG9vcCA9IHNhdmVkLnBsYXlNZWFzdXJlc0luTG9vcDtcbiAgICAgICAgcGxheU1lYXN1cmVzSW5Mb29wU3RhcnQgPSBzYXZlZC5wbGF5TWVhc3VyZXNJbkxvb3BTdGFydDtcbiAgICAgICAgcGxheU1lYXN1cmVzSW5Mb29wRW5kID0gc2F2ZWQucGxheU1lYXN1cmVzSW5Mb29wRW5kO1xuICAgIH1cbn1cblxufVxuXG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMiBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogQGNsYXNzIE1pZGlUcmFja1xuICogVGhlIE1pZGlUcmFjayB0YWtlcyBhcyBpbnB1dCB0aGUgcmF3IE1pZGlFdmVudHMgZm9yIHRoZSB0cmFjaywgYW5kIGdldHM6XG4gKiAtIFRoZSBsaXN0IG9mIG1pZGkgbm90ZXMgaW4gdGhlIHRyYWNrLlxuICogLSBUaGUgZmlyc3QgaW5zdHJ1bWVudCB1c2VkIGluIHRoZSB0cmFjay5cbiAqXG4gKiBGb3IgZWFjaCBOb3RlT24gZXZlbnQgaW4gdGhlIG1pZGkgZmlsZSwgYSBuZXcgTWlkaU5vdGUgaXMgY3JlYXRlZFxuICogYW5kIGFkZGVkIHRvIHRoZSB0cmFjaywgdXNpbmcgdGhlIEFkZE5vdGUoKSBtZXRob2QuXG4gKiBcbiAqIFRoZSBOb3RlT2ZmKCkgbWV0aG9kIGlzIGNhbGxlZCB3aGVuIGEgTm90ZU9mZiBldmVudCBpcyBlbmNvdW50ZXJlZCxcbiAqIGluIG9yZGVyIHRvIHVwZGF0ZSB0aGUgZHVyYXRpb24gb2YgdGhlIE1pZGlOb3RlLlxuICovIFxucHVibGljIGNsYXNzIE1pZGlUcmFjayB7XG4gICAgcHJpdmF0ZSBpbnQgdHJhY2tudW07ICAgICAgICAgICAgIC8qKiBUaGUgdHJhY2sgbnVtYmVyICovXG4gICAgcHJpdmF0ZSBMaXN0PE1pZGlOb3RlPiBub3RlczsgICAgIC8qKiBMaXN0IG9mIE1pZGkgbm90ZXMgKi9cbiAgICBwcml2YXRlIGludCBpbnN0cnVtZW50OyAgICAgICAgICAgLyoqIEluc3RydW1lbnQgZm9yIHRoaXMgdHJhY2sgKi9cbiAgICBwcml2YXRlIExpc3Q8TWlkaUV2ZW50PiBseXJpY3M7ICAgLyoqIFRoZSBseXJpY3MgaW4gdGhpcyB0cmFjayAqL1xuXG4gICAgLyoqIENyZWF0ZSBhbiBlbXB0eSBNaWRpVHJhY2suICBVc2VkIGJ5IHRoZSBDbG9uZSBtZXRob2QgKi9cbiAgICBwdWJsaWMgTWlkaVRyYWNrKGludCB0cmFja251bSkge1xuICAgICAgICB0aGlzLnRyYWNrbnVtID0gdHJhY2tudW07XG4gICAgICAgIG5vdGVzID0gbmV3IExpc3Q8TWlkaU5vdGU+KDIwKTtcbiAgICAgICAgaW5zdHJ1bWVudCA9IDA7XG4gICAgfSBcblxuICAgIC8qKiBDcmVhdGUgYSBNaWRpVHJhY2sgYmFzZWQgb24gdGhlIE1pZGkgZXZlbnRzLiAgRXh0cmFjdCB0aGUgTm90ZU9uL05vdGVPZmZcbiAgICAgKiAgZXZlbnRzIHRvIGdhdGhlciB0aGUgbGlzdCBvZiBNaWRpTm90ZXMuXG4gICAgICovXG4gICAgcHVibGljIE1pZGlUcmFjayhMaXN0PE1pZGlFdmVudD4gZXZlbnRzLCBpbnQgdHJhY2tudW0pIHtcbiAgICAgICAgdGhpcy50cmFja251bSA9IHRyYWNrbnVtO1xuICAgICAgICBub3RlcyA9IG5ldyBMaXN0PE1pZGlOb3RlPihldmVudHMuQ291bnQpO1xuICAgICAgICBpbnN0cnVtZW50ID0gMDtcbiBcbiAgICAgICAgZm9yZWFjaCAoTWlkaUV2ZW50IG1ldmVudCBpbiBldmVudHMpIHtcbiAgICAgICAgICAgIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IE1pZGlGaWxlLkV2ZW50Tm90ZU9uICYmIG1ldmVudC5WZWxvY2l0eSA+IDApIHtcbiAgICAgICAgICAgICAgICBNaWRpTm90ZSBub3RlID0gbmV3IE1pZGlOb3RlKG1ldmVudC5TdGFydFRpbWUsIG1ldmVudC5DaGFubmVsLCBtZXZlbnQuTm90ZW51bWJlciwgMCk7XG4gICAgICAgICAgICAgICAgQWRkTm90ZShub3RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gTWlkaUZpbGUuRXZlbnROb3RlT24gJiYgbWV2ZW50LlZlbG9jaXR5ID09IDApIHtcbiAgICAgICAgICAgICAgICBOb3RlT2ZmKG1ldmVudC5DaGFubmVsLCBtZXZlbnQuTm90ZW51bWJlciwgbWV2ZW50LlN0YXJ0VGltZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IE1pZGlGaWxlLkV2ZW50Tm90ZU9mZikge1xuICAgICAgICAgICAgICAgIE5vdGVPZmYobWV2ZW50LkNoYW5uZWwsIG1ldmVudC5Ob3RlbnVtYmVyLCBtZXZlbnQuU3RhcnRUaW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gTWlkaUZpbGUuRXZlbnRQcm9ncmFtQ2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgaW5zdHJ1bWVudCA9IG1ldmVudC5JbnN0cnVtZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50Lk1ldGFldmVudCA9PSBNaWRpRmlsZS5NZXRhRXZlbnRMeXJpYykge1xuICAgICAgICAgICAgICAgIEFkZEx5cmljKG1ldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vdGVzLkNvdW50ID4gMCAmJiBub3Rlc1swXS5DaGFubmVsID09IDkpICB7XG4gICAgICAgICAgICBpbnN0cnVtZW50ID0gMTI4OyAgLyogUGVyY3Vzc2lvbiAqL1xuICAgICAgICB9XG4gICAgICAgIGludCBseXJpY2NvdW50ID0gMDtcbiAgICAgICAgaWYgKGx5cmljcyAhPSBudWxsKSB7IGx5cmljY291bnQgPSBseXJpY3MuQ291bnQ7IH1cbiAgICB9XG5cbiAgICBwdWJsaWMgaW50IE51bWJlciB7XG4gICAgICAgIGdldCB7IHJldHVybiB0cmFja251bTsgfVxuICAgIH1cblxuICAgIHB1YmxpYyBMaXN0PE1pZGlOb3RlPiBOb3RlcyB7XG4gICAgICAgIGdldCB7IHJldHVybiBub3RlczsgfVxuICAgIH1cblxuICAgIHB1YmxpYyBpbnQgSW5zdHJ1bWVudCB7XG4gICAgICAgIGdldCB7IHJldHVybiBpbnN0cnVtZW50OyB9XG4gICAgICAgIHNldCB7IGluc3RydW1lbnQgPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzdHJpbmcgSW5zdHJ1bWVudE5hbWUge1xuICAgICAgICBnZXQgeyBpZiAoaW5zdHJ1bWVudCA+PSAwICYmIGluc3RydW1lbnQgPD0gMTI4KVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIE1pZGlGaWxlLkluc3RydW1lbnRzW2luc3RydW1lbnRdO1xuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgTGlzdDxNaWRpRXZlbnQ+IEx5cmljcyB7XG4gICAgICAgIGdldCB7IHJldHVybiBseXJpY3M7IH1cbiAgICAgICAgc2V0IHsgbHlyaWNzID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogQWRkIGEgTWlkaU5vdGUgdG8gdGhpcyB0cmFjay4gIFRoaXMgaXMgY2FsbGVkIGZvciBlYWNoIE5vdGVPbiBldmVudCAqL1xuICAgIHB1YmxpYyB2b2lkIEFkZE5vdGUoTWlkaU5vdGUgbSkge1xuICAgICAgICBub3Rlcy5BZGQobSk7XG4gICAgfVxuXG4gICAgLyoqIEEgTm90ZU9mZiBldmVudCBvY2N1cmVkLiAgRmluZCB0aGUgTWlkaU5vdGUgb2YgdGhlIGNvcnJlc3BvbmRpbmdcbiAgICAgKiBOb3RlT24gZXZlbnQsIGFuZCB1cGRhdGUgdGhlIGR1cmF0aW9uIG9mIHRoZSBNaWRpTm90ZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBOb3RlT2ZmKGludCBjaGFubmVsLCBpbnQgbm90ZW51bWJlciwgaW50IGVuZHRpbWUpIHtcbiAgICAgICAgZm9yIChpbnQgaSA9IG5vdGVzLkNvdW50LTE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBNaWRpTm90ZSBub3RlID0gbm90ZXNbaV07XG4gICAgICAgICAgICBpZiAobm90ZS5DaGFubmVsID09IGNoYW5uZWwgJiYgbm90ZS5OdW1iZXIgPT0gbm90ZW51bWJlciAmJlxuICAgICAgICAgICAgICAgIG5vdGUuRHVyYXRpb24gPT0gMCkge1xuICAgICAgICAgICAgICAgIG5vdGUuTm90ZU9mZihlbmR0aW1lKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogQWRkIGEgTHlyaWMgTWlkaUV2ZW50ICovXG4gICAgcHVibGljIHZvaWQgQWRkTHlyaWMoTWlkaUV2ZW50IG1ldmVudCkge1xuICAgICAgICBpZiAobHlyaWNzID09IG51bGwpIHtcbiAgICAgICAgICAgIGx5cmljcyA9IG5ldyBMaXN0PE1pZGlFdmVudD4oKTtcbiAgICAgICAgfSBcbiAgICAgICAgbHlyaWNzLkFkZChtZXZlbnQpO1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gYSBkZWVwIGNvcHkgY2xvbmUgb2YgdGhpcyBNaWRpVHJhY2suICovXG4gICAgcHVibGljIE1pZGlUcmFjayBDbG9uZSgpIHtcbiAgICAgICAgTWlkaVRyYWNrIHRyYWNrID0gbmV3IE1pZGlUcmFjayhOdW1iZXIpO1xuICAgICAgICB0cmFjay5pbnN0cnVtZW50ID0gaW5zdHJ1bWVudDtcbiAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiBub3Rlcykge1xuICAgICAgICAgICAgdHJhY2subm90ZXMuQWRkKCBub3RlLkNsb25lKCkgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobHlyaWNzICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRyYWNrLmx5cmljcyA9IG5ldyBMaXN0PE1pZGlFdmVudD4oKTtcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBldiBpbiBseXJpY3MpIHtcbiAgICAgICAgICAgICAgICB0cmFjay5seXJpY3MuQWRkKGV2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJhY2s7XG4gICAgfVxuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHN0cmluZyByZXN1bHQgPSBcIlRyYWNrIG51bWJlcj1cIiArIHRyYWNrbnVtICsgXCIgaW5zdHJ1bWVudD1cIiArIGluc3RydW1lbnQgKyBcIlxcblwiO1xuICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBuIGluIG5vdGVzKSB7XG4gICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdCArIG4gKyBcIlxcblwiO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCArPSBcIkVuZCBUcmFja1xcblwiO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn1cblxufVxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogRW51bWVyYXRpb24gb2YgdGhlIG5vdGVzIGluIGEgc2NhbGUgKEEsIEEjLCAuLi4gRyMpICovXG5wdWJsaWMgY2xhc3MgTm90ZVNjYWxlIHtcbiAgICBwdWJsaWMgY29uc3QgaW50IEEgICAgICA9IDA7XG4gICAgcHVibGljIGNvbnN0IGludCBBc2hhcnAgPSAxO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQmZsYXQgID0gMTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEIgICAgICA9IDI7XG4gICAgcHVibGljIGNvbnN0IGludCBDICAgICAgPSAzO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQ3NoYXJwID0gNDtcbiAgICBwdWJsaWMgY29uc3QgaW50IERmbGF0ICA9IDQ7XG4gICAgcHVibGljIGNvbnN0IGludCBEICAgICAgPSA1O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRHNoYXJwID0gNjtcbiAgICBwdWJsaWMgY29uc3QgaW50IEVmbGF0ICA9IDY7XG4gICAgcHVibGljIGNvbnN0IGludCBFICAgICAgPSA3O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRiAgICAgID0gODtcbiAgICBwdWJsaWMgY29uc3QgaW50IEZzaGFycCA9IDk7XG4gICAgcHVibGljIGNvbnN0IGludCBHZmxhdCAgPSA5O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRyAgICAgID0gMTA7XG4gICAgcHVibGljIGNvbnN0IGludCBHc2hhcnAgPSAxMTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEFmbGF0ICA9IDExO1xuXG4gICAgLyoqIENvbnZlcnQgYSBub3RlIChBLCBBIywgQiwgZXRjKSBhbmQgb2N0YXZlIGludG8gYVxuICAgICAqIE1pZGkgTm90ZSBudW1iZXIuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBpbnQgVG9OdW1iZXIoaW50IG5vdGVzY2FsZSwgaW50IG9jdGF2ZSkge1xuICAgICAgICByZXR1cm4gOSArIG5vdGVzY2FsZSArIG9jdGF2ZSAqIDEyO1xuICAgIH1cblxuICAgIC8qKiBDb252ZXJ0IGEgTWlkaSBub3RlIG51bWJlciBpbnRvIGEgbm90ZXNjYWxlIChBLCBBIywgQikgKi9cbiAgICBwdWJsaWMgc3RhdGljIGludCBGcm9tTnVtYmVyKGludCBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIChudW1iZXIgKyAzKSAlIDEyO1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGlzIG5vdGVzY2FsZSBudW1iZXIgaXMgYSBibGFjayBrZXkgKi9cbiAgICBwdWJsaWMgc3RhdGljIGJvb2wgSXNCbGFja0tleShpbnQgbm90ZXNjYWxlKSB7XG4gICAgICAgIGlmIChub3Rlc2NhbGUgPT0gQXNoYXJwIHx8XG4gICAgICAgICAgICBub3Rlc2NhbGUgPT0gQ3NoYXJwIHx8XG4gICAgICAgICAgICBub3Rlc2NhbGUgPT0gRHNoYXJwIHx8XG4gICAgICAgICAgICBub3Rlc2NhbGUgPT0gRnNoYXJwIHx8XG4gICAgICAgICAgICBub3Rlc2NhbGUgPT0gR3NoYXJwKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbi8qKiBAY2xhc3MgV2hpdGVOb3RlXG4gKiBUaGUgV2hpdGVOb3RlIGNsYXNzIHJlcHJlc2VudHMgYSB3aGl0ZSBrZXkgbm90ZSwgYSBub24tc2hhcnAsXG4gKiBub24tZmxhdCBub3RlLiAgVG8gZGlzcGxheSBtaWRpIG5vdGVzIGFzIHNoZWV0IG11c2ljLCB0aGUgbm90ZXNcbiAqIG11c3QgYmUgY29udmVydGVkIHRvIHdoaXRlIG5vdGVzIGFuZCBhY2NpZGVudGFscy4gXG4gKlxuICogV2hpdGUgbm90ZXMgY29uc2lzdCBvZiBhIGxldHRlciAoQSB0aHJ1IEcpIGFuZCBhbiBvY3RhdmUgKDAgdGhydSAxMCkuXG4gKiBUaGUgb2N0YXZlIGNoYW5nZXMgZnJvbSBHIHRvIEEuICBBZnRlciBHMiBjb21lcyBBMy4gIE1pZGRsZS1DIGlzIEM0LlxuICpcbiAqIFRoZSBtYWluIG9wZXJhdGlvbnMgYXJlIGNhbGN1bGF0aW5nIGRpc3RhbmNlcyBiZXR3ZWVuIG5vdGVzLCBhbmQgY29tcGFyaW5nIG5vdGVzLlxuICovIFxuXG5wdWJsaWMgY2xhc3MgV2hpdGVOb3RlIDogSUNvbXBhcmVyPFdoaXRlTm90ZT4ge1xuXG4gICAgLyogVGhlIHBvc3NpYmxlIG5vdGUgbGV0dGVycyAqL1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQSA9IDA7XG4gICAgcHVibGljIGNvbnN0IGludCBCID0gMTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEMgPSAyO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRCA9IDM7XG4gICAgcHVibGljIGNvbnN0IGludCBFID0gNDtcbiAgICBwdWJsaWMgY29uc3QgaW50IEYgPSA1O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRyA9IDY7XG5cbiAgICAvKiBDb21tb24gd2hpdGUgbm90ZXMgdXNlZCBpbiBjYWxjdWxhdGlvbnMgKi9cbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBUb3BUcmVibGUgPSBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5FLCA1KTtcbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBCb3R0b21UcmVibGUgPSBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5GLCA0KTtcbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBUb3BCYXNzID0gbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRywgMyk7XG4gICAgcHVibGljIHN0YXRpYyBXaGl0ZU5vdGUgQm90dG9tQmFzcyA9IG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkEsIDMpO1xuICAgIHB1YmxpYyBzdGF0aWMgV2hpdGVOb3RlIE1pZGRsZUMgPSBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5DLCA0KTtcblxuICAgIHByaXZhdGUgaW50IGxldHRlcjsgIC8qIFRoZSBsZXR0ZXIgb2YgdGhlIG5vdGUsIEEgdGhydSBHICovXG4gICAgcHJpdmF0ZSBpbnQgb2N0YXZlOyAgLyogVGhlIG9jdGF2ZSwgMCB0aHJ1IDEwLiAqL1xuXG4gICAgLyogR2V0IHRoZSBsZXR0ZXIgKi9cbiAgICBwdWJsaWMgaW50IExldHRlciB7XG4gICAgICAgIGdldCB7IHJldHVybiBsZXR0ZXI7IH1cbiAgICB9XG5cbiAgICAvKiBHZXQgdGhlIG9jdGF2ZSAqL1xuICAgIHB1YmxpYyBpbnQgT2N0YXZlIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIG9jdGF2ZTsgfVxuICAgIH1cblxuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBub3RlIHdpdGggdGhlIGdpdmVuIGxldHRlciBhbmQgb2N0YXZlLiAqL1xuICAgIHB1YmxpYyBXaGl0ZU5vdGUoaW50IGxldHRlciwgaW50IG9jdGF2ZSkge1xuICAgICAgICBpZiAoIShsZXR0ZXIgPj0gMCAmJiBsZXR0ZXIgPD0gNikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBTeXN0ZW0uQXJndW1lbnRFeGNlcHRpb24oXCJMZXR0ZXIgXCIgKyBsZXR0ZXIgKyBcIiBpcyBpbmNvcnJlY3RcIik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxldHRlciA9IGxldHRlcjtcbiAgICAgICAgdGhpcy5vY3RhdmUgPSBvY3RhdmU7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgZGlzdGFuY2UgKGluIHdoaXRlIG5vdGVzKSBiZXR3ZWVuIHRoaXMgbm90ZVxuICAgICAqIGFuZCBub3RlIHcsIGkuZS4gIHRoaXMgLSB3LiAgRm9yIGV4YW1wbGUsIEM0IC0gQTQgPSAyLFxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgRGlzdChXaGl0ZU5vdGUgdykge1xuICAgICAgICByZXR1cm4gKG9jdGF2ZSAtIHcub2N0YXZlKSAqIDcgKyAobGV0dGVyIC0gdy5sZXR0ZXIpO1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhpcyBub3RlIHBsdXMgdGhlIGdpdmVuIGFtb3VudCAoaW4gd2hpdGUgbm90ZXMpLlxuICAgICAqIFRoZSBhbW91bnQgbWF5IGJlIHBvc2l0aXZlIG9yIG5lZ2F0aXZlLiAgRm9yIGV4YW1wbGUsXG4gICAgICogQTQgKyAyID0gQzQsIGFuZCBDNCArICgtMikgPSBBNC5cbiAgICAgKi9cbiAgICBwdWJsaWMgV2hpdGVOb3RlIEFkZChpbnQgYW1vdW50KSB7XG4gICAgICAgIGludCBudW0gPSBvY3RhdmUgKiA3ICsgbGV0dGVyO1xuICAgICAgICBudW0gKz0gYW1vdW50O1xuICAgICAgICBpZiAobnVtIDwgMCkge1xuICAgICAgICAgICAgbnVtID0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFdoaXRlTm90ZShudW0gJSA3LCBudW0gLyA3KTtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBtaWRpIG5vdGUgbnVtYmVyIGNvcnJlc3BvbmRpbmcgdG8gdGhpcyB3aGl0ZSBub3RlLlxuICAgICAqIFRoZSBtaWRpIG5vdGUgbnVtYmVycyBjb3ZlciBhbGwga2V5cywgaW5jbHVkaW5nIHNoYXJwcy9mbGF0cyxcbiAgICAgKiBzbyBlYWNoIG9jdGF2ZSBpcyAxMiBub3Rlcy4gIE1pZGRsZSBDIChDNCkgaXMgNjAuICBTb21lIGV4YW1wbGVcbiAgICAgKiBudW1iZXJzIGZvciB2YXJpb3VzIG5vdGVzOlxuICAgICAqXG4gICAgICogIEEgMiA9IDMzXG4gICAgICogIEEjMiA9IDM0XG4gICAgICogIEcgMiA9IDQzXG4gICAgICogIEcjMiA9IDQ0IFxuICAgICAqICBBIDMgPSA0NVxuICAgICAqICBBIDQgPSA1N1xuICAgICAqICBBIzQgPSA1OFxuICAgICAqICBCIDQgPSA1OVxuICAgICAqICBDIDQgPSA2MFxuICAgICAqL1xuXG4gICAgcHVibGljIGludCBOdW1iZXIoKSB7XG4gICAgICAgIGludCBvZmZzZXQgPSAwO1xuICAgICAgICBzd2l0Y2ggKGxldHRlcikge1xuICAgICAgICAgICAgY2FzZSBBOiBvZmZzZXQgPSBOb3RlU2NhbGUuQTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEI6IG9mZnNldCA9IE5vdGVTY2FsZS5COyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQzogb2Zmc2V0ID0gTm90ZVNjYWxlLkM7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBEOiBvZmZzZXQgPSBOb3RlU2NhbGUuRDsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEU6IG9mZnNldCA9IE5vdGVTY2FsZS5FOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgRjogb2Zmc2V0ID0gTm90ZVNjYWxlLkY7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBHOiBvZmZzZXQgPSBOb3RlU2NhbGUuRzsgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OiBvZmZzZXQgPSAwOyBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTm90ZVNjYWxlLlRvTnVtYmVyKG9mZnNldCwgb2N0YXZlKTtcbiAgICB9XG5cbiAgICAvKiogQ29tcGFyZSB0aGUgdHdvIG5vdGVzLiAgUmV0dXJuXG4gICAgICogIDwgMCAgaWYgeCBpcyBsZXNzIChsb3dlcikgdGhhbiB5XG4gICAgICogICAgMCAgaWYgeCBpcyBlcXVhbCB0byB5XG4gICAgICogID4gMCAgaWYgeCBpcyBncmVhdGVyIChoaWdoZXIpIHRoYW4geVxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgQ29tcGFyZShXaGl0ZU5vdGUgeCwgV2hpdGVOb3RlIHkpIHtcbiAgICAgICAgcmV0dXJuIHguRGlzdCh5KTtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBoaWdoZXIgbm90ZSwgeCBvciB5ICovXG4gICAgcHVibGljIHN0YXRpYyBXaGl0ZU5vdGUgTWF4KFdoaXRlTm90ZSB4LCBXaGl0ZU5vdGUgeSkge1xuICAgICAgICBpZiAoeC5EaXN0KHkpID4gMClcbiAgICAgICAgICAgIHJldHVybiB4O1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4geTtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBsb3dlciBub3RlLCB4IG9yIHkgKi9cbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBNaW4oV2hpdGVOb3RlIHgsIFdoaXRlTm90ZSB5KSB7XG4gICAgICAgIGlmICh4LkRpc3QoeSkgPCAwKVxuICAgICAgICAgICAgcmV0dXJuIHg7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB5O1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIHRvcCBub3RlIGluIHRoZSBzdGFmZiBvZiB0aGUgZ2l2ZW4gY2xlZiAqL1xuICAgIHB1YmxpYyBzdGF0aWMgV2hpdGVOb3RlIFRvcChDbGVmIGNsZWYpIHtcbiAgICAgICAgaWYgKGNsZWYgPT0gQ2xlZi5UcmVibGUpXG4gICAgICAgICAgICByZXR1cm4gVG9wVHJlYmxlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gVG9wQmFzcztcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBib3R0b20gbm90ZSBpbiB0aGUgc3RhZmYgb2YgdGhlIGdpdmVuIGNsZWYgKi9cbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBCb3R0b20oQ2xlZiBjbGVmKSB7XG4gICAgICAgIGlmIChjbGVmID09IENsZWYuVHJlYmxlKVxuICAgICAgICAgICAgcmV0dXJuIEJvdHRvbVRyZWJsZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIEJvdHRvbUJhc3M7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgc3RyaW5nIDxsZXR0ZXI+PG9jdGF2ZT4gZm9yIHRoaXMgbm90ZS4gKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgXG4gICAgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICBzdHJpbmdbXSBzID0geyBcIkFcIiwgXCJCXCIsIFwiQ1wiLCBcIkRcIiwgXCJFXCIsIFwiRlwiLCBcIkdcIiB9O1xuICAgICAgICByZXR1cm4gc1tsZXR0ZXJdICsgb2N0YXZlO1xuICAgIH1cbn1cblxuXG5cbn1cbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBQYWludEV2ZW50QXJnc1xyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBSZWN0YW5nbGUgQ2xpcFJlY3RhbmdsZSB7IGdldDsgc2V0OyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBHcmFwaGljcyBHcmFwaGljcygpIHsgcmV0dXJuIG5ldyBHcmFwaGljcyhcIm1haW5cIik7IH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgUGFuZWxcclxuICAgIHtcclxuICAgICAgICBwcml2YXRlIFBvaW50IGF1dG9TY3JvbGxQb3NpdGlvbj1uZXcgUG9pbnQoMCwwKTtcclxuICAgICAgICBwdWJsaWMgUG9pbnQgQXV0b1Njcm9sbFBvc2l0aW9uIHsgZ2V0IHsgcmV0dXJuIGF1dG9TY3JvbGxQb3NpdGlvbjsgfSBzZXQgeyBhdXRvU2Nyb2xsUG9zaXRpb24gPSB2YWx1ZTsgfSB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBpbnQgV2lkdGg7XHJcbiAgICAgICAgcHVibGljIGludCBIZWlnaHQ7XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIHN0YXRpYyBjbGFzcyBQYXRoXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBzdHJpbmcgR2V0RmlsZU5hbWUoc3RyaW5nIGZpbGVuYW1lKSB7IHJldHVybiBudWxsOyB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFBlblxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBDb2xvciBDb2xvcjtcclxuICAgICAgICBwdWJsaWMgaW50IFdpZHRoO1xyXG4gICAgICAgIHB1YmxpYyBMaW5lQ2FwIEVuZENhcDtcclxuXHJcbiAgICAgICAgcHVibGljIFBlbihDb2xvciBjb2xvciwgaW50IHdpZHRoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQ29sb3IgPSBjb2xvcjtcclxuICAgICAgICAgICAgV2lkdGggPSB3aWR0aDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFBvaW50XHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIGludCBYO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgWTtcclxuXHJcbiAgICAgICAgcHVibGljIFBvaW50KGludCB4LCBpbnQgeSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFggPSB4O1xyXG4gICAgICAgICAgICBZID0geTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFJlY3RhbmdsZVxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBpbnQgWDtcclxuICAgICAgICBwdWJsaWMgaW50IFk7XHJcbiAgICAgICAgcHVibGljIGludCBXaWR0aDtcclxuICAgICAgICBwdWJsaWMgaW50IEhlaWdodDtcclxuXHJcbiAgICAgICAgcHVibGljIFJlY3RhbmdsZShpbnQgeCwgaW50IHksIGludCB3aWR0aCwgaW50IGhlaWdodClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFggPSB4O1xyXG4gICAgICAgICAgICBZID0geTtcclxuICAgICAgICAgICAgV2lkdGggPSB3aWR0aDtcclxuICAgICAgICAgICAgSGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcblxyXG4gICAgLyogQGNsYXNzIFN0YWZmXHJcbiAgICAgKiBUaGUgU3RhZmYgaXMgdXNlZCB0byBkcmF3IGEgc2luZ2xlIFN0YWZmIChhIHJvdyBvZiBtZWFzdXJlcykgaW4gdGhlIFxyXG4gICAgICogU2hlZXRNdXNpYyBDb250cm9sLiBBIFN0YWZmIG5lZWRzIHRvIGRyYXdcclxuICAgICAqIC0gVGhlIENsZWZcclxuICAgICAqIC0gVGhlIGtleSBzaWduYXR1cmVcclxuICAgICAqIC0gVGhlIGhvcml6b250YWwgbGluZXNcclxuICAgICAqIC0gQSBsaXN0IG9mIE11c2ljU3ltYm9sc1xyXG4gICAgICogLSBUaGUgbGVmdCBhbmQgcmlnaHQgdmVydGljYWwgbGluZXNcclxuICAgICAqXHJcbiAgICAgKiBUaGUgaGVpZ2h0IG9mIHRoZSBTdGFmZiBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBudW1iZXIgb2YgcGl4ZWxzIGVhY2hcclxuICAgICAqIE11c2ljU3ltYm9sIGV4dGVuZHMgYWJvdmUgYW5kIGJlbG93IHRoZSBzdGFmZi5cclxuICAgICAqXHJcbiAgICAgKiBUaGUgdmVydGljYWwgbGluZXMgKGxlZnQgYW5kIHJpZ2h0IHNpZGVzKSBvZiB0aGUgc3RhZmYgYXJlIGpvaW5lZFxyXG4gICAgICogd2l0aCB0aGUgc3RhZmZzIGFib3ZlIGFuZCBiZWxvdyBpdCwgd2l0aCBvbmUgZXhjZXB0aW9uLiAgXHJcbiAgICAgKiBUaGUgbGFzdCB0cmFjayBpcyBub3Qgam9pbmVkIHdpdGggdGhlIGZpcnN0IHRyYWNrLlxyXG4gICAgICovXHJcblxyXG4gICAgcHVibGljIGNsYXNzIFN0YWZmXHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSBMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzOyAgLyoqIFRoZSBtdXNpYyBzeW1ib2xzIGluIHRoaXMgc3RhZmYgKi9cclxuICAgICAgICBwcml2YXRlIExpc3Q8THlyaWNTeW1ib2w+IGx5cmljczsgICAvKiogVGhlIGx5cmljcyB0byBkaXNwbGF5IChjYW4gYmUgbnVsbCkgKi9cclxuICAgICAgICBwcml2YXRlIGludCB5dG9wOyAgICAgICAgICAgICAgICAgICAvKiogVGhlIHkgcGl4ZWwgb2YgdGhlIHRvcCBvZiB0aGUgc3RhZmYgKi9cclxuICAgICAgICBwcml2YXRlIENsZWZTeW1ib2wgY2xlZnN5bTsgICAgICAgICAvKiogVGhlIGxlZnQtc2lkZSBDbGVmIHN5bWJvbCAqL1xyXG4gICAgICAgIHByaXZhdGUgQWNjaWRTeW1ib2xbXSBrZXlzOyAgICAgICAgIC8qKiBUaGUga2V5IHNpZ25hdHVyZSBzeW1ib2xzICovXHJcbiAgICAgICAgcHJpdmF0ZSBib29sIHNob3dNZWFzdXJlczsgICAgICAgICAgLyoqIElmIHRydWUsIHNob3cgdGhlIG1lYXN1cmUgbnVtYmVycyAqL1xyXG4gICAgICAgIHByaXZhdGUgaW50IGtleXNpZ1dpZHRoOyAgICAgICAgICAgIC8qKiBUaGUgd2lkdGggb2YgdGhlIGNsZWYgYW5kIGtleSBzaWduYXR1cmUgKi9cclxuICAgICAgICBwcml2YXRlIGludCB3aWR0aDsgICAgICAgICAgICAgICAgICAvKiogVGhlIHdpZHRoIG9mIHRoZSBzdGFmZiBpbiBwaXhlbHMgKi9cclxuICAgICAgICBwcml2YXRlIGludCBoZWlnaHQ7ICAgICAgICAgICAgICAgICAvKiogVGhlIGhlaWdodCBvZiB0aGUgc3RhZmYgaW4gcGl4ZWxzICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgdHJhY2tudW07ICAgICAgICAgICAgICAgLyoqIFRoZSB0cmFjayB0aGlzIHN0YWZmIHJlcHJlc2VudHMgKi9cclxuICAgICAgICBwcml2YXRlIGludCB0b3RhbHRyYWNrczsgICAgICAgICAgICAvKiogVGhlIHRvdGFsIG51bWJlciBvZiB0cmFja3MgKi9cclxuICAgICAgICBwcml2YXRlIGludCBzdGFydHRpbWU7ICAgICAgICAgICAgICAvKiogVGhlIHRpbWUgKGluIHB1bHNlcykgb2YgZmlyc3Qgc3ltYm9sICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgZW5kdGltZTsgICAgICAgICAgICAgICAgLyoqIFRoZSB0aW1lIChpbiBwdWxzZXMpIG9mIGxhc3Qgc3ltYm9sICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgbWVhc3VyZUxlbmd0aDsgICAgICAgICAgLyoqIFRoZSB0aW1lIChpbiBwdWxzZXMpIG9mIGEgbWVhc3VyZSAqL1xyXG5cclxuICAgICAgICAvKiogQ3JlYXRlIGEgbmV3IHN0YWZmIHdpdGggdGhlIGdpdmVuIGxpc3Qgb2YgbXVzaWMgc3ltYm9scyxcbiAgICAgICAgICogYW5kIHRoZSBnaXZlbiBrZXkgc2lnbmF0dXJlLiAgVGhlIGNsZWYgaXMgZGV0ZXJtaW5lZCBieVxuICAgICAgICAgKiB0aGUgY2xlZiBvZiB0aGUgZmlyc3QgY2hvcmQgc3ltYm9sLiBUaGUgdHJhY2sgbnVtYmVyIGlzIHVzZWRcbiAgICAgICAgICogdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdG8gam9pbiB0aGlzIGxlZnQvcmlnaHQgdmVydGljYWwgc2lkZXNcbiAgICAgICAgICogd2l0aCB0aGUgc3RhZmZzIGFib3ZlIGFuZCBiZWxvdy4gVGhlIFNoZWV0TXVzaWNPcHRpb25zIGFyZSB1c2VkXG4gICAgICAgICAqIHRvIGNoZWNrIHdoZXRoZXIgdG8gZGlzcGxheSBtZWFzdXJlIG51bWJlcnMgb3Igbm90LlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgU3RhZmYoTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scywgS2V5U2lnbmF0dXJlIGtleSxcclxuICAgICAgICAgICAgICAgICAgICAgTWlkaU9wdGlvbnMgb3B0aW9ucyxcclxuICAgICAgICAgICAgICAgICAgICAgaW50IHRyYWNrbnVtLCBpbnQgdG90YWx0cmFja3MpXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICAgICAga2V5c2lnV2lkdGggPSBTaGVldE11c2ljLktleVNpZ25hdHVyZVdpZHRoKGtleSk7XHJcbiAgICAgICAgICAgIHRoaXMudHJhY2tudW0gPSB0cmFja251bTtcclxuICAgICAgICAgICAgdGhpcy50b3RhbHRyYWNrcyA9IHRvdGFsdHJhY2tzO1xyXG4gICAgICAgICAgICBzaG93TWVhc3VyZXMgPSAob3B0aW9ucy5zaG93TWVhc3VyZXMgJiYgdHJhY2tudW0gPT0gMCk7XHJcbiAgICAgICAgICAgIG1lYXN1cmVMZW5ndGggPSBvcHRpb25zLnRpbWUuTWVhc3VyZTtcclxuICAgICAgICAgICAgQ2xlZiBjbGVmID0gRmluZENsZWYoc3ltYm9scyk7XHJcblxyXG4gICAgICAgICAgICBjbGVmc3ltID0gbmV3IENsZWZTeW1ib2woY2xlZiwgMCwgZmFsc2UpO1xyXG4gICAgICAgICAgICBrZXlzID0ga2V5LkdldFN5bWJvbHMoY2xlZik7XHJcbiAgICAgICAgICAgIHRoaXMuc3ltYm9scyA9IHN5bWJvbHM7XHJcbiAgICAgICAgICAgIENhbGN1bGF0ZVdpZHRoKG9wdGlvbnMuc2Nyb2xsVmVydCk7XHJcbiAgICAgICAgICAgIENhbGN1bGF0ZUhlaWdodCgpO1xyXG4gICAgICAgICAgICBDYWxjdWxhdGVTdGFydEVuZFRpbWUoKTtcclxuICAgICAgICAgICAgRnVsbEp1c3RpZnkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBSZXR1cm4gdGhlIHdpZHRoIG9mIHRoZSBzdGFmZiAqL1xyXG4gICAgICAgIHB1YmxpYyBpbnQgV2lkdGhcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdldCB7IHJldHVybiB3aWR0aDsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFJldHVybiB0aGUgaGVpZ2h0IG9mIHRoZSBzdGFmZiAqL1xyXG4gICAgICAgIHB1YmxpYyBpbnQgSGVpZ2h0XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gaGVpZ2h0OyB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogUmV0dXJuIHRoZSB0cmFjayBudW1iZXIgb2YgdGhpcyBzdGFmZiAoc3RhcnRpbmcgZnJvbSAwICovXHJcbiAgICAgICAgcHVibGljIGludCBUcmFja1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIHRyYWNrbnVtOyB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogUmV0dXJuIHRoZSBzdGFydGluZyB0aW1lIG9mIHRoZSBzdGFmZiwgdGhlIHN0YXJ0IHRpbWUgb2ZcbiAgICAgICAgICogIHRoZSBmaXJzdCBzeW1ib2wuICBUaGlzIGlzIHVzZWQgZHVyaW5nIHBsYXliYWNrLCB0byBcbiAgICAgICAgICogIGF1dG9tYXRpY2FsbHkgc2Nyb2xsIHRoZSBtdXNpYyB3aGlsZSBwbGF5aW5nLlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgaW50IFN0YXJ0VGltZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIHN0YXJ0dGltZTsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFJldHVybiB0aGUgZW5kaW5nIHRpbWUgb2YgdGhlIHN0YWZmLCB0aGUgZW5kdGltZSBvZlxuICAgICAgICAgKiAgdGhlIGxhc3Qgc3ltYm9sLiAgVGhpcyBpcyB1c2VkIGR1cmluZyBwbGF5YmFjaywgdG8gXG4gICAgICAgICAqICBhdXRvbWF0aWNhbGx5IHNjcm9sbCB0aGUgbXVzaWMgd2hpbGUgcGxheWluZy5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGludCBFbmRUaW1lXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gZW5kdGltZTsgfVxyXG4gICAgICAgICAgICBzZXQgeyBlbmR0aW1lID0gdmFsdWU7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBGaW5kIHRoZSBpbml0aWFsIGNsZWYgdG8gdXNlIGZvciB0aGlzIHN0YWZmLiAgVXNlIHRoZSBjbGVmIG9mXG4gICAgICAgICAqIHRoZSBmaXJzdCBDaG9yZFN5bWJvbC5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBDbGVmIEZpbmRDbGVmKExpc3Q8TXVzaWNTeW1ib2w+IGxpc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBtIGluIGxpc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChtIGlzIENob3JkU3ltYm9sKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIENob3JkU3ltYm9sIGMgPSAoQ2hvcmRTeW1ib2wpbTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYy5DbGVmO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBDbGVmLlRyZWJsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBDYWxjdWxhdGUgdGhlIGhlaWdodCBvZiB0aGlzIHN0YWZmLiAgRWFjaCBNdXNpY1N5bWJvbCBjb250YWlucyB0aGVcbiAgICAgICAgICogbnVtYmVyIG9mIHBpeGVscyBpdCBuZWVkcyBhYm92ZSBhbmQgYmVsb3cgdGhlIHN0YWZmLiAgR2V0IHRoZSBtYXhpbXVtXG4gICAgICAgICAqIHZhbHVlcyBhYm92ZSBhbmQgYmVsb3cgdGhlIHN0YWZmLlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgdm9pZCBDYWxjdWxhdGVIZWlnaHQoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW50IGFib3ZlID0gMDtcclxuICAgICAgICAgICAgaW50IGJlbG93ID0gMDtcclxuXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHMgaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgYWJvdmUgPSBNYXRoLk1heChhYm92ZSwgcy5BYm92ZVN0YWZmKTtcclxuICAgICAgICAgICAgICAgIGJlbG93ID0gTWF0aC5NYXgoYmVsb3csIHMuQmVsb3dTdGFmZik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYWJvdmUgPSBNYXRoLk1heChhYm92ZSwgY2xlZnN5bS5BYm92ZVN0YWZmKTtcclxuICAgICAgICAgICAgYmVsb3cgPSBNYXRoLk1heChiZWxvdywgY2xlZnN5bS5CZWxvd1N0YWZmKTtcclxuICAgICAgICAgICAgaWYgKHNob3dNZWFzdXJlcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgYWJvdmUgPSBNYXRoLk1heChhYm92ZSwgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgeXRvcCA9IGFib3ZlICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xyXG4gICAgICAgICAgICBoZWlnaHQgPSBTaGVldE11c2ljLk5vdGVIZWlnaHQgKiA1ICsgeXRvcCArIGJlbG93O1xyXG4gICAgICAgICAgICBpZiAobHlyaWNzICE9IG51bGwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGhlaWdodCArPSAxMjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLyogQWRkIHNvbWUgZXh0cmEgdmVydGljYWwgc3BhY2UgYmV0d2VlbiB0aGUgbGFzdCB0cmFja1xyXG4gICAgICAgICAgICAgKiBhbmQgZmlyc3QgdHJhY2suXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBpZiAodHJhY2tudW0gPT0gdG90YWx0cmFja3MgLSAxKVxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ICs9IFNoZWV0TXVzaWMuTm90ZUhlaWdodCAqIDM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogQ2FsY3VsYXRlIHRoZSB3aWR0aCBvZiB0aGlzIHN0YWZmICovXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIENhbGN1bGF0ZVdpZHRoKGJvb2wgc2Nyb2xsVmVydClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChzY3JvbGxWZXJ0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB3aWR0aCA9IFNoZWV0TXVzaWMuUGFnZVdpZHRoO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHdpZHRoID0ga2V5c2lnV2lkdGg7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHMgaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgd2lkdGggKz0gcy5XaWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBDYWxjdWxhdGUgdGhlIHN0YXJ0IGFuZCBlbmQgdGltZSBvZiB0aGlzIHN0YWZmLiAqL1xyXG4gICAgICAgIHByaXZhdGUgdm9pZCBDYWxjdWxhdGVTdGFydEVuZFRpbWUoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3RhcnR0aW1lID0gZW5kdGltZSA9IDA7XHJcbiAgICAgICAgICAgIGlmIChzeW1ib2xzLkNvdW50ID09IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdGFydHRpbWUgPSBzeW1ib2xzWzBdLlN0YXJ0VGltZTtcclxuICAgICAgICAgICAgZm9yZWFjaCAoTXVzaWNTeW1ib2wgbSBpbiBzeW1ib2xzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZW5kdGltZSA8IG0uU3RhcnRUaW1lKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuZHRpbWUgPSBtLlN0YXJ0VGltZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChtIGlzIENob3JkU3ltYm9sKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIENob3JkU3ltYm9sIGMgPSAoQ2hvcmRTeW1ib2wpbTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZW5kdGltZSA8IGMuRW5kVGltZSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZHRpbWUgPSBjLkVuZFRpbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIEZ1bGwtSnVzdGlmeSB0aGUgc3ltYm9scywgc28gdGhhdCB0aGV5IGV4cGFuZCB0byBmaWxsIHRoZSB3aG9sZSBzdGFmZi4gKi9cclxuICAgICAgICBwcml2YXRlIHZvaWQgRnVsbEp1c3RpZnkoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHdpZHRoICE9IFNoZWV0TXVzaWMuUGFnZVdpZHRoKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgaW50IHRvdGFsd2lkdGggPSBrZXlzaWdXaWR0aDtcclxuICAgICAgICAgICAgaW50IHRvdGFsc3ltYm9scyA9IDA7XHJcbiAgICAgICAgICAgIGludCBpID0gMDtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlIChpIDwgc3ltYm9scy5Db3VudClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IHN0YXJ0ID0gc3ltYm9sc1tpXS5TdGFydFRpbWU7XHJcbiAgICAgICAgICAgICAgICB0b3RhbHN5bWJvbHMrKztcclxuICAgICAgICAgICAgICAgIHRvdGFsd2lkdGggKz0gc3ltYm9sc1tpXS5XaWR0aDtcclxuICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgc3ltYm9scy5Db3VudCAmJiBzeW1ib2xzW2ldLlN0YXJ0VGltZSA9PSBzdGFydClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0b3RhbHdpZHRoICs9IHN5bWJvbHNbaV0uV2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpbnQgZXh0cmF3aWR0aCA9IChTaGVldE11c2ljLlBhZ2VXaWR0aCAtIHRvdGFsd2lkdGggLSAxKSAvIHRvdGFsc3ltYm9scztcclxuICAgICAgICAgICAgaWYgKGV4dHJhd2lkdGggPiBTaGVldE11c2ljLk5vdGVIZWlnaHQgKiAyKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBleHRyYXdpZHRoID0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpID0gMDtcclxuICAgICAgICAgICAgd2hpbGUgKGkgPCBzeW1ib2xzLkNvdW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgc3RhcnQgPSBzeW1ib2xzW2ldLlN0YXJ0VGltZTtcclxuICAgICAgICAgICAgICAgIHN5bWJvbHNbaV0uV2lkdGggKz0gZXh0cmF3aWR0aDtcclxuICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgc3ltYm9scy5Db3VudCAmJiBzeW1ib2xzW2ldLlN0YXJ0VGltZSA9PSBzdGFydClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogQWRkIHRoZSBseXJpYyBzeW1ib2xzIHRoYXQgb2NjdXIgd2l0aGluIHRoaXMgc3RhZmYuXG4gICAgICAgICAqICBTZXQgdGhlIHgtcG9zaXRpb24gb2YgdGhlIGx5cmljIHN5bWJvbC4gXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyB2b2lkIEFkZEx5cmljcyhMaXN0PEx5cmljU3ltYm9sPiB0cmFja2x5cmljcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0cmFja2x5cmljcyA9PSBudWxsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbHlyaWNzID0gbmV3IExpc3Q8THlyaWNTeW1ib2w+KCk7XHJcbiAgICAgICAgICAgIGludCB4cG9zID0gMDtcclxuICAgICAgICAgICAgaW50IHN5bWJvbGluZGV4ID0gMDtcclxuICAgICAgICAgICAgZm9yZWFjaCAoTHlyaWNTeW1ib2wgbHlyaWMgaW4gdHJhY2tseXJpY3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChseXJpYy5TdGFydFRpbWUgPCBzdGFydHRpbWUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAobHlyaWMuU3RhcnRUaW1lID4gZW5kdGltZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8qIEdldCB0aGUgeC1wb3NpdGlvbiBvZiB0aGlzIGx5cmljICovXHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoc3ltYm9saW5kZXggPCBzeW1ib2xzLkNvdW50ICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgc3ltYm9sc1tzeW1ib2xpbmRleF0uU3RhcnRUaW1lIDwgbHlyaWMuU3RhcnRUaW1lKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHhwb3MgKz0gc3ltYm9sc1tzeW1ib2xpbmRleF0uV2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgc3ltYm9saW5kZXgrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGx5cmljLlggPSB4cG9zO1xyXG4gICAgICAgICAgICAgICAgaWYgKHN5bWJvbGluZGV4IDwgc3ltYm9scy5Db3VudCAmJlxyXG4gICAgICAgICAgICAgICAgICAgIChzeW1ib2xzW3N5bWJvbGluZGV4XSBpcyBCYXJTeW1ib2wpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGx5cmljLlggKz0gU2hlZXRNdXNpYy5Ob3RlV2lkdGg7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBseXJpY3MuQWRkKGx5cmljKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobHlyaWNzLkNvdW50ID09IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGx5cmljcyA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogRHJhdyB0aGUgbHlyaWNzICovXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIERyYXdMeXJpY3MoR3JhcGhpY3MgZywgUGVuIHBlbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8qIFNraXAgdGhlIGxlZnQgc2lkZSBDbGVmIHN5bWJvbCBhbmQga2V5IHNpZ25hdHVyZSAqL1xyXG4gICAgICAgICAgICBpbnQgeHBvcyA9IGtleXNpZ1dpZHRoO1xyXG4gICAgICAgICAgICBpbnQgeXBvcyA9IGhlaWdodCAtIDEyO1xyXG5cclxuICAgICAgICAgICAgZm9yZWFjaCAoTHlyaWNTeW1ib2wgbHlyaWMgaW4gbHlyaWNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnLkRyYXdTdHJpbmcobHlyaWMuVGV4dCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxldHRlckZvbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQnJ1c2hlcy5CbGFjayxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4cG9zICsgbHlyaWMuWCwgeXBvcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBEcmF3IHRoZSBtZWFzdXJlIG51bWJlcnMgZm9yIGVhY2ggbWVhc3VyZSAqL1xyXG4gICAgICAgIHByaXZhdGUgdm9pZCBEcmF3TWVhc3VyZU51bWJlcnMoR3JhcGhpY3MgZywgUGVuIHBlbilcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICAvKiBTa2lwIHRoZSBsZWZ0IHNpZGUgQ2xlZiBzeW1ib2wgYW5kIGtleSBzaWduYXR1cmUgKi9cclxuICAgICAgICAgICAgaW50IHhwb3MgPSBrZXlzaWdXaWR0aDtcclxuICAgICAgICAgICAgaW50IHlwb3MgPSB5dG9wIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMztcclxuXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHMgaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHMgaXMgQmFyU3ltYm9sKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBtZWFzdXJlID0gMSArIHMuU3RhcnRUaW1lIC8gbWVhc3VyZUxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICBnLkRyYXdTdHJpbmcoXCJcIiArIG1lYXN1cmUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGV0dGVyRm9udCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQnJ1c2hlcy5CbGFjayxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHBvcyArIFNoZWV0TXVzaWMuTm90ZVdpZHRoIC8gMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXBvcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB4cG9zICs9IHMuV2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBEcmF3IHRoZSBseXJpY3MgKi9cclxuXHJcblxyXG4gICAgICAgIC8qKiBEcmF3IHRoZSBmaXZlIGhvcml6b250YWwgbGluZXMgb2YgdGhlIHN0YWZmICovXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIERyYXdIb3JpekxpbmVzKEdyYXBoaWNzIGcsIFBlbiBwZW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbnQgbGluZSA9IDE7XHJcbiAgICAgICAgICAgIGludCB5ID0geXRvcCAtIFNoZWV0TXVzaWMuTGluZVdpZHRoO1xyXG4gICAgICAgICAgICBwZW4uV2lkdGggPSAxO1xyXG4gICAgICAgICAgICBmb3IgKGxpbmUgPSAxOyBsaW5lIDw9IDU7IGxpbmUrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIFNoZWV0TXVzaWMuTGVmdE1hcmdpbiwgeSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aCAtIDEsIHkpO1xyXG4gICAgICAgICAgICAgICAgeSArPSBTaGVldE11c2ljLkxpbmVXaWR0aCArIFNoZWV0TXVzaWMuTGluZVNwYWNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBlbi5Db2xvciA9IENvbG9yLkJsYWNrO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBEcmF3IHRoZSB2ZXJ0aWNhbCBsaW5lcyBhdCB0aGUgZmFyIGxlZnQgYW5kIGZhciByaWdodCBzaWRlcy4gKi9cclxuICAgICAgICBwcml2YXRlIHZvaWQgRHJhd0VuZExpbmVzKEdyYXBoaWNzIGcsIFBlbiBwZW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBwZW4uV2lkdGggPSAxO1xyXG5cclxuICAgICAgICAgICAgLyogRHJhdyB0aGUgdmVydGljYWwgbGluZXMgZnJvbSAwIHRvIHRoZSBoZWlnaHQgb2YgdGhpcyBzdGFmZixcclxuICAgICAgICAgICAgICogaW5jbHVkaW5nIHRoZSBzcGFjZSBhYm92ZSBhbmQgYmVsb3cgdGhlIHN0YWZmLCB3aXRoIHR3byBleGNlcHRpb25zOlxyXG4gICAgICAgICAgICAgKiAtIElmIHRoaXMgaXMgdGhlIGZpcnN0IHRyYWNrLCBkb24ndCBzdGFydCBhYm92ZSB0aGUgc3RhZmYuXHJcbiAgICAgICAgICAgICAqICAgU3RhcnQgZXhhY3RseSBhdCB0aGUgdG9wIG9mIHRoZSBzdGFmZiAoeXRvcCAtIExpbmVXaWR0aClcclxuICAgICAgICAgICAgICogLSBJZiB0aGlzIGlzIHRoZSBsYXN0IHRyYWNrLCBkb24ndCBlbmQgYmVsb3cgdGhlIHN0YWZmLlxyXG4gICAgICAgICAgICAgKiAgIEVuZCBleGFjdGx5IGF0IHRoZSBib3R0b20gb2YgdGhlIHN0YWZmLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgaW50IHlzdGFydCwgeWVuZDtcclxuICAgICAgICAgICAgaWYgKHRyYWNrbnVtID09IDApXHJcbiAgICAgICAgICAgICAgICB5c3RhcnQgPSB5dG9wIC0gU2hlZXRNdXNpYy5MaW5lV2lkdGg7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHlzdGFydCA9IDA7XHJcblxyXG4gICAgICAgICAgICBpZiAodHJhY2tudW0gPT0gKHRvdGFsdHJhY2tzIC0gMSkpXHJcbiAgICAgICAgICAgICAgICB5ZW5kID0geXRvcCArIDQgKiBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHllbmQgPSBoZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgU2hlZXRNdXNpYy5MZWZ0TWFyZ2luLCB5c3RhcnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxlZnRNYXJnaW4sIHllbmQpO1xyXG5cclxuICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHdpZHRoIC0gMSwgeXN0YXJ0LCB3aWR0aCAtIDEsIHllbmQpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBEcmF3IHRoaXMgc3RhZmYuIE9ubHkgZHJhdyB0aGUgc3ltYm9scyBpbnNpZGUgdGhlIGNsaXAgYXJlYSAqL1xyXG4gICAgICAgIHB1YmxpYyB2b2lkIERyYXcoR3JhcGhpY3MgZywgUmVjdGFuZ2xlIGNsaXAsIFBlbiBwZW4sIGludCBzZWxlY3Rpb25TdGFydFB1bHNlLCBpbnQgc2VsZWN0aW9uRW5kUHVsc2UsIEJydXNoIGRlc2VsZWN0ZWRCcnVzaClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8qIFNoYWRlIGFueSBkZXNlbGVjdGVkIGFyZWFzICovXHJcbiAgICAgICAgICAgIFNoYWRlU2VsZWN0aW9uQmFja2dyb3VuZChnLCBjbGlwLCBzZWxlY3Rpb25TdGFydFB1bHNlLCBzZWxlY3Rpb25FbmRQdWxzZSwgZGVzZWxlY3RlZEJydXNoKTtcclxuXHJcbiAgICAgICAgICAgIGludCB4cG9zID0gU2hlZXRNdXNpYy5MZWZ0TWFyZ2luICsgNTtcclxuXHJcbiAgICAgICAgICAgIC8qIERyYXcgdGhlIGxlZnQgc2lkZSBDbGVmIHN5bWJvbCAqL1xyXG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSh4cG9zLCAwKTtcclxuICAgICAgICAgICAgY2xlZnN5bS5EcmF3KGcsIHBlbiwgeXRvcCk7XHJcbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC14cG9zLCAwKTtcclxuICAgICAgICAgICAgeHBvcyArPSBjbGVmc3ltLldpZHRoO1xyXG5cclxuICAgICAgICAgICAgLyogRHJhdyB0aGUga2V5IHNpZ25hdHVyZSAqL1xyXG4gICAgICAgICAgICBmb3JlYWNoIChBY2NpZFN5bWJvbCBhIGluIGtleXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKHhwb3MsIDApO1xyXG4gICAgICAgICAgICAgICAgYS5EcmF3KGcsIHBlbiwgeXRvcCk7XHJcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgteHBvcywgMCk7XHJcbiAgICAgICAgICAgICAgICB4cG9zICs9IGEuV2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIERyYXcgdGhlIGFjdHVhbCBub3RlcywgcmVzdHMsIGJhcnMuICBEcmF3IHRoZSBzeW1ib2xzIG9uZSBcclxuICAgICAgICAgICAgICogYWZ0ZXIgYW5vdGhlciwgdXNpbmcgdGhlIHN5bWJvbCB3aWR0aCB0byBkZXRlcm1pbmUgdGhlXHJcbiAgICAgICAgICAgICAqIHggcG9zaXRpb24gb2YgdGhlIG5leHQgc3ltYm9sLlxyXG4gICAgICAgICAgICAgKlxyXG4gICAgICAgICAgICAgKiBGb3IgZmFzdCBwZXJmb3JtYW5jZSwgb25seSBkcmF3IHN5bWJvbHMgdGhhdCBhcmUgaW4gdGhlIGNsaXAgYXJlYS5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHMgaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKEluc2lkZUNsaXBwaW5nKGNsaXAsIHhwb3MsIHMpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKHhwb3MsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgIHMuRHJhdyhnLCBwZW4sIHl0b3ApO1xyXG4gICAgICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC14cG9zLCAwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHhwb3MgKz0gcy5XaWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBEcmF3SG9yaXpMaW5lcyhnLCBwZW4pO1xyXG4gICAgICAgICAgICBEcmF3RW5kTGluZXMoZywgcGVuKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChzaG93TWVhc3VyZXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIERyYXdNZWFzdXJlTnVtYmVycyhnLCBwZW4pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChseXJpY3MgIT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgRHJhd0x5cmljcyhnLCBwZW4pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIElmIGEgc2VsZWN0aW9uIGhhcyBiZWVuIHNwZWNpZmllZCwgc2hhZGUgYWxsIGFyZWFzIHRoYXQgYXJlbid0IGluIHRoZSBzZWxlY3Rpb25cbiAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHZvaWQgU2hhZGVTZWxlY3Rpb25CYWNrZ3JvdW5kKEdyYXBoaWNzIGcsIFJlY3RhbmdsZSBjbGlwLCBpbnQgc2VsZWN0aW9uU3RhcnRQdWxzZSwgaW50IHNlbGVjdGlvbkVuZFB1bHNlLCBCcnVzaCBkZXNlbGVjdGVkQnJ1c2gpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoc2VsZWN0aW9uRW5kUHVsc2UgPT0gMCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgaW50IHhwb3MgPSBrZXlzaWdXaWR0aDtcclxuICAgICAgICAgICAgYm9vbCBsYXN0U3RhdGVGaWxsID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHMgaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKEluc2lkZUNsaXBwaW5nKGNsaXAsIHhwb3MsIHMpICYmIChzLlN0YXJ0VGltZSA8IHNlbGVjdGlvblN0YXJ0UHVsc2UgfHwgcy5TdGFydFRpbWUgPiBzZWxlY3Rpb25FbmRQdWxzZSkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeHBvcyAtIDIsIC0yKTtcclxuICAgICAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZGVzZWxlY3RlZEJydXNoLCAwLCAwLCBzLldpZHRoICsgNCwgdGhpcy5IZWlnaHQgKyA0KTtcclxuICAgICAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKHhwb3MgLSAyKSwgMik7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFN0YXRlRmlsbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFN0YXRlRmlsbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgeHBvcyArPSBzLldpZHRoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChsYXN0U3RhdGVGaWxsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvL3NoYWRlIHRoZSByZXN0IG9mIHRoZSBzdGFmZiBpZiB0aGUgcHJldmlvdXMgc3ltYm9sIHdhcyBzaGFkZWRcclxuICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKHhwb3MgLSAyLCAtMik7XHJcbiAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZGVzZWxlY3RlZEJydXNoLCAwLCAwLCB3aWR0aCAtIHhwb3MsIHRoaXMuSGVpZ2h0ICsgNCk7XHJcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKHhwb3MgLSAyKSwgMik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGJvb2wgSW5zaWRlQ2xpcHBpbmcoUmVjdGFuZ2xlIGNsaXAsIGludCB4cG9zLCBNdXNpY1N5bWJvbCBzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuICh4cG9zIDw9IGNsaXAuWCArIGNsaXAuV2lkdGggKyA1MCkgJiYgKHhwb3MgKyBzLldpZHRoICsgNTAgPj0gY2xpcC5YKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogU2hhZGUgYWxsIHRoZSBjaG9yZHMgcGxheWVkIGluIHRoZSBnaXZlbiB0aW1lLlxuICAgICAgICAgKiAgVW4tc2hhZGUgYW55IGNob3JkcyBzaGFkZWQgaW4gdGhlIHByZXZpb3VzIHB1bHNlIHRpbWUuXG4gICAgICAgICAqICBTdG9yZSB0aGUgeCBjb29yZGluYXRlIGxvY2F0aW9uIHdoZXJlIHRoZSBzaGFkZSB3YXMgZHJhd24uXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBib29sIFNoYWRlTm90ZXMoR3JhcGhpY3MgZywgU29saWRCcnVzaCBzaGFkZUJydXNoLCBQZW4gcGVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50IGN1cnJlbnRQdWxzZVRpbWUsIGludCBwcmV2UHVsc2VUaW1lLCByZWYgaW50IHhfc2hhZGUpXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgLyogSWYgdGhlcmUncyBub3RoaW5nIHRvIHVuc2hhZGUsIG9yIHNoYWRlLCByZXR1cm4gKi9cclxuICAgICAgICAgICAgaWYgKChzdGFydHRpbWUgPiBwcmV2UHVsc2VUaW1lIHx8IGVuZHRpbWUgPCBwcmV2UHVsc2VUaW1lKSAmJlxyXG4gICAgICAgICAgICAgICAgKHN0YXJ0dGltZSA+IGN1cnJlbnRQdWxzZVRpbWUgfHwgZW5kdGltZSA8IGN1cnJlbnRQdWxzZVRpbWUpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIFNraXAgdGhlIGxlZnQgc2lkZSBDbGVmIHN5bWJvbCBhbmQga2V5IHNpZ25hdHVyZSAqL1xyXG4gICAgICAgICAgICBpbnQgeHBvcyA9IGtleXNpZ1dpZHRoO1xyXG5cclxuICAgICAgICAgICAgTXVzaWNTeW1ib2wgY3VyciA9IG51bGw7XHJcbiAgICAgICAgICAgIENob3JkU3ltYm9sIHByZXZDaG9yZCA9IG51bGw7XHJcbiAgICAgICAgICAgIGludCBwcmV2X3hwb3MgPSAwO1xyXG5cclxuICAgICAgICAgICAgLyogTG9vcCB0aHJvdWdoIHRoZSBzeW1ib2xzLiBcclxuICAgICAgICAgICAgICogVW5zaGFkZSBzeW1ib2xzIHdoZXJlIHN0YXJ0IDw9IHByZXZQdWxzZVRpbWUgPCBlbmRcclxuICAgICAgICAgICAgICogU2hhZGUgc3ltYm9scyB3aGVyZSBzdGFydCA8PSBjdXJyZW50UHVsc2VUaW1lIDwgZW5kXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBib29sIHNoYWRlZE5vdGVGb3VuZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHN5bWJvbHMuQ291bnQ7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY3VyciA9IHN5bWJvbHNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAoY3VyciBpcyBCYXJTeW1ib2wpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgeHBvcyArPSBjdXJyLldpZHRoO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGludCBzdGFydCA9IGN1cnIuU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgaW50IGVuZCA9IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAoaSArIDIgPCBzeW1ib2xzLkNvdW50ICYmIHN5bWJvbHNbaSArIDFdIGlzIEJhclN5bWJvbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBlbmQgPSBzeW1ib2xzW2kgKyAyXS5TdGFydFRpbWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpICsgMSA8IHN5bWJvbHMuQ291bnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gc3ltYm9sc1tpICsgMV0uU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IGVuZHRpbWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIC8qIElmIHdlJ3ZlIHBhc3QgdGhlIHByZXZpb3VzIGFuZCBjdXJyZW50IHRpbWVzLCB3ZSdyZSBkb25lLiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKChzdGFydCA+IHByZXZQdWxzZVRpbWUpICYmIChzdGFydCA+IGN1cnJlbnRQdWxzZVRpbWUpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh4X3NoYWRlID09IDApXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4X3NoYWRlID0geHBvcztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzaGFkZWROb3RlRm91bmQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBJZiBzaGFkZWQgbm90ZXMgYXJlIHRoZSBzYW1lLCB3ZSdyZSBkb25lICovXHJcbiAgICAgICAgICAgICAgICBpZiAoKHN0YXJ0IDw9IGN1cnJlbnRQdWxzZVRpbWUpICYmIChjdXJyZW50UHVsc2VUaW1lIDwgZW5kKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgIChzdGFydCA8PSBwcmV2UHVsc2VUaW1lKSAmJiAocHJldlB1bHNlVGltZSA8IGVuZCkpXHJcbiAgICAgICAgICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHhfc2hhZGUgPSB4cG9zO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzaGFkZWROb3RlRm91bmQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyogSWYgc3ltYm9sIGlzIGluIHRoZSBwcmV2aW91cyB0aW1lLCBkcmF3IGEgd2hpdGUgYmFja2dyb3VuZCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKChzdGFydCA8PSBwcmV2UHVsc2VUaW1lKSAmJiAocHJldlB1bHNlVGltZSA8IGVuZCkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeHBvcyAtIDIsIC0yKTtcclxuICAgICAgICAgICAgICAgICAgICBnLkNsZWFyUmVjdGFuZ2xlKDAsIDAsIGN1cnIuV2lkdGggKyA0LCB0aGlzLkhlaWdodCArIDQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0oeHBvcyAtIDIpLCAyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKiBJZiBzeW1ib2wgaXMgaW4gdGhlIGN1cnJlbnQgdGltZSwgZHJhdyBhIHNoYWRlZCBiYWNrZ3JvdW5kICovXHJcbiAgICAgICAgICAgICAgICBpZiAoKHN0YXJ0IDw9IGN1cnJlbnRQdWxzZVRpbWUpICYmIChjdXJyZW50UHVsc2VUaW1lIDwgZW5kKSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB4X3NoYWRlID0geHBvcztcclxuICAgICAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSh4cG9zLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoc2hhZGVCcnVzaCwgMCwgMCwgY3Vyci5XaWR0aCwgdGhpcy5IZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC14cG9zLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICBzaGFkZWROb3RlRm91bmQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHhwb3MgKz0gY3Vyci5XaWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc2hhZGVkTm90ZUZvdW5kO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFJldHVybiB0aGUgcHVsc2UgdGltZSBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlbiBwb2ludC5cbiAgICAgICAgICogIEZpbmQgdGhlIG5vdGVzL3N5bWJvbHMgY29ycmVzcG9uZGluZyB0byB0aGUgeCBwb3NpdGlvbixcbiAgICAgICAgICogIGFuZCByZXR1cm4gdGhlIHN0YXJ0VGltZSAocHVsc2VUaW1lKSBvZiB0aGUgc3ltYm9sLlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgaW50IFB1bHNlVGltZUZvclBvaW50KFBvaW50IHBvaW50KVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIGludCB4cG9zID0ga2V5c2lnV2lkdGg7XHJcbiAgICAgICAgICAgIGludCBwdWxzZVRpbWUgPSBzdGFydHRpbWU7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHN5bSBpbiBzeW1ib2xzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBwdWxzZVRpbWUgPSBzeW0uU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBvaW50LlggPD0geHBvcyArIHN5bS5XaWR0aClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHVsc2VUaW1lO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgeHBvcyArPSBzeW0uV2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHB1bHNlVGltZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3RyaW5nIHJlc3VsdCA9IFwiU3RhZmYgY2xlZj1cIiArIGNsZWZzeW0uVG9TdHJpbmcoKSArIFwiXFxuXCI7XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSBcIiAgS2V5czpcXG5cIjtcclxuICAgICAgICAgICAgZm9yZWFjaCAoQWNjaWRTeW1ib2wgYSBpbiBrZXlzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gXCIgICAgXCIgKyBhLlRvU3RyaW5nKCkgKyBcIlxcblwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSBcIiAgU3ltYm9sczpcXG5cIjtcclxuICAgICAgICAgICAgZm9yZWFjaCAoTXVzaWNTeW1ib2wgcyBpbiBrZXlzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gXCIgICAgXCIgKyBzLlRvU3RyaW5nKCkgKyBcIlxcblwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIG0gaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IFwiICAgIFwiICsgbS5Ub1N0cmluZygpICsgXCJcXG5cIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXN1bHQgKz0gXCJFbmQgU3RhZmZcXG5cIjtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxufVxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbi8qKiBAY2xhc3MgU3RlbVxuICogVGhlIFN0ZW0gY2xhc3MgaXMgdXNlZCBieSBDaG9yZFN5bWJvbCB0byBkcmF3IHRoZSBzdGVtIHBvcnRpb24gb2ZcbiAqIHRoZSBjaG9yZC4gIFRoZSBzdGVtIGhhcyB0aGUgZm9sbG93aW5nIGZpZWxkczpcbiAqXG4gKiBkdXJhdGlvbiAgLSBUaGUgZHVyYXRpb24gb2YgdGhlIHN0ZW0uXG4gKiBkaXJlY3Rpb24gLSBFaXRoZXIgVXAgb3IgRG93blxuICogc2lkZSAgICAgIC0gRWl0aGVyIGxlZnQgb3IgcmlnaHRcbiAqIHRvcCAgICAgICAtIFRoZSB0b3Btb3N0IG5vdGUgaW4gdGhlIGNob3JkXG4gKiBib3R0b20gICAgLSBUaGUgYm90dG9tbW9zdCBub3RlIGluIHRoZSBjaG9yZFxuICogZW5kICAgICAgIC0gVGhlIG5vdGUgcG9zaXRpb24gd2hlcmUgdGhlIHN0ZW0gZW5kcy4gIFRoaXMgaXMgdXN1YWxseVxuICogICAgICAgICAgICAgc2l4IG5vdGVzIHBhc3QgdGhlIGxhc3Qgbm90ZSBpbiB0aGUgY2hvcmQuICBGb3IgOHRoLzE2dGhcbiAqICAgICAgICAgICAgIG5vdGVzLCB0aGUgc3RlbSBtdXN0IGV4dGVuZCBldmVuIG1vcmUuXG4gKlxuICogVGhlIFNoZWV0TXVzaWMgY2xhc3MgY2FuIGNoYW5nZSB0aGUgZGlyZWN0aW9uIG9mIGEgc3RlbSBhZnRlciBpdFxuICogaGFzIGJlZW4gY3JlYXRlZC4gIFRoZSBzaWRlIGFuZCBlbmQgZmllbGRzIG1heSBhbHNvIGNoYW5nZSBkdWUgdG9cbiAqIHRoZSBkaXJlY3Rpb24gY2hhbmdlLiAgQnV0IG90aGVyIGZpZWxkcyB3aWxsIG5vdCBjaGFuZ2UuXG4gKi9cbiBcbnB1YmxpYyBjbGFzcyBTdGVtIHtcbiAgICBwdWJsaWMgY29uc3QgaW50IFVwID0gICAxOyAgICAgIC8qIFRoZSBzdGVtIHBvaW50cyB1cCAqL1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRG93biA9IDI7ICAgICAgLyogVGhlIHN0ZW0gcG9pbnRzIGRvd24gKi9cbiAgICBwdWJsaWMgY29uc3QgaW50IExlZnRTaWRlID0gMTsgIC8qIFRoZSBzdGVtIGlzIHRvIHRoZSBsZWZ0IG9mIHRoZSBub3RlICovXG4gICAgcHVibGljIGNvbnN0IGludCBSaWdodFNpZGUgPSAyOyAvKiBUaGUgc3RlbSBpcyB0byB0aGUgcmlnaHQgb2YgdGhlIG5vdGUgKi9cblxuICAgIHByaXZhdGUgTm90ZUR1cmF0aW9uIGR1cmF0aW9uOyAvKiogRHVyYXRpb24gb2YgdGhlIHN0ZW0uICovXG4gICAgcHJpdmF0ZSBpbnQgZGlyZWN0aW9uOyAgICAgICAgIC8qKiBVcCwgRG93biwgb3IgTm9uZSAqL1xuICAgIHByaXZhdGUgV2hpdGVOb3RlIHRvcDsgICAgICAgICAvKiogVG9wbW9zdCBub3RlIGluIGNob3JkICovXG4gICAgcHJpdmF0ZSBXaGl0ZU5vdGUgYm90dG9tOyAgICAgIC8qKiBCb3R0b21tb3N0IG5vdGUgaW4gY2hvcmQgKi9cbiAgICBwcml2YXRlIFdoaXRlTm90ZSBlbmQ7ICAgICAgICAgLyoqIExvY2F0aW9uIG9mIGVuZCBvZiB0aGUgc3RlbSAqL1xuICAgIHByaXZhdGUgYm9vbCBub3Rlc292ZXJsYXA7ICAgICAvKiogRG8gdGhlIGNob3JkIG5vdGVzIG92ZXJsYXAgKi9cbiAgICBwcml2YXRlIGludCBzaWRlOyAgICAgICAgICAgICAgLyoqIExlZnQgc2lkZSBvciByaWdodCBzaWRlIG9mIG5vdGUgKi9cblxuICAgIHByaXZhdGUgU3RlbSBwYWlyOyAgICAgICAgICAgICAgLyoqIElmIHBhaXIgIT0gbnVsbCwgdGhpcyBpcyBhIGhvcml6b250YWwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBiZWFtIHN0ZW0gdG8gYW5vdGhlciBjaG9yZCAqL1xuICAgIHByaXZhdGUgaW50IHdpZHRoX3RvX3BhaXI7ICAgICAgLyoqIFRoZSB3aWR0aCAoaW4gcGl4ZWxzKSB0byB0aGUgY2hvcmQgcGFpciAqL1xuICAgIHByaXZhdGUgYm9vbCByZWNlaXZlcl9pbl9wYWlyOyAgLyoqIFRoaXMgc3RlbSBpcyB0aGUgcmVjZWl2ZXIgb2YgYSBob3Jpem9udGFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIGJlYW0gc3RlbSBmcm9tIGFub3RoZXIgY2hvcmQuICovXG5cbiAgICAvKiogR2V0L1NldCB0aGUgZGlyZWN0aW9uIG9mIHRoZSBzdGVtIChVcCBvciBEb3duKSAqL1xuICAgIHB1YmxpYyBpbnQgRGlyZWN0aW9uIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIGRpcmVjdGlvbjsgfVxuICAgICAgICBzZXQgeyBDaGFuZ2VEaXJlY3Rpb24odmFsdWUpOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgZHVyYXRpb24gb2YgdGhlIHN0ZW0gKEVpZ3RoLCBTaXh0ZWVudGgsIFRoaXJ0eVNlY29uZCkgKi9cbiAgICBwdWJsaWMgTm90ZUR1cmF0aW9uIER1cmF0aW9uIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIGR1cmF0aW9uOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgdG9wIG5vdGUgaW4gdGhlIGNob3JkLiBUaGlzIGlzIG5lZWRlZCB0byBkZXRlcm1pbmUgdGhlIHN0ZW0gZGlyZWN0aW9uICovXG4gICAgcHVibGljIFdoaXRlTm90ZSBUb3Age1xuICAgICAgICBnZXQgeyByZXR1cm4gdG9wOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgYm90dG9tIG5vdGUgaW4gdGhlIGNob3JkLiBUaGlzIGlzIG5lZWRlZCB0byBkZXRlcm1pbmUgdGhlIHN0ZW0gZGlyZWN0aW9uICovXG4gICAgcHVibGljIFdoaXRlTm90ZSBCb3R0b20ge1xuICAgICAgICBnZXQgeyByZXR1cm4gYm90dG9tOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldC9TZXQgdGhlIGxvY2F0aW9uIHdoZXJlIHRoZSBzdGVtIGVuZHMuICBUaGlzIGlzIHVzdWFsbHkgc2l4IG5vdGVzXG4gICAgICogcGFzdCB0aGUgbGFzdCBub3RlIGluIHRoZSBjaG9yZC4gU2VlIG1ldGhvZCBDYWxjdWxhdGVFbmQuXG4gICAgICovXG4gICAgcHVibGljIFdoaXRlTm90ZSBFbmQge1xuICAgICAgICBnZXQgeyByZXR1cm4gZW5kOyB9XG4gICAgICAgIHNldCB7IGVuZCA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgLyoqIFNldCB0aGlzIFN0ZW0gdG8gYmUgdGhlIHJlY2VpdmVyIG9mIGEgaG9yaXpvbnRhbCBiZWFtLCBhcyBwYXJ0XG4gICAgICogb2YgYSBjaG9yZCBwYWlyLiAgSW4gRHJhdygpLCBpZiB0aGlzIHN0ZW0gaXMgYSByZWNlaXZlciwgd2VcbiAgICAgKiBkb24ndCBkcmF3IGEgY3Vydnkgc3RlbSwgd2Ugb25seSBkcmF3IHRoZSB2ZXJ0aWNhbCBsaW5lLlxuICAgICAqL1xuICAgIHB1YmxpYyBib29sIFJlY2VpdmVyIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHJlY2VpdmVyX2luX3BhaXI7IH1cbiAgICAgICAgc2V0IHsgcmVjZWl2ZXJfaW5fcGFpciA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBzdGVtLiAgVGhlIHRvcCBub3RlLCBib3R0b20gbm90ZSwgYW5kIGRpcmVjdGlvbiBhcmUgXG4gICAgICogbmVlZGVkIGZvciBkcmF3aW5nIHRoZSB2ZXJ0aWNhbCBsaW5lIG9mIHRoZSBzdGVtLiAgVGhlIGR1cmF0aW9uIGlzIFxuICAgICAqIG5lZWRlZCB0byBkcmF3IHRoZSB0YWlsIG9mIHRoZSBzdGVtLiAgVGhlIG92ZXJsYXAgYm9vbGVhbiBpcyB0cnVlXG4gICAgICogaWYgdGhlIG5vdGVzIGluIHRoZSBjaG9yZCBvdmVybGFwLiAgSWYgdGhlIG5vdGVzIG92ZXJsYXAsIHRoZVxuICAgICAqIHN0ZW0gbXVzdCBiZSBkcmF3biBvbiB0aGUgcmlnaHQgc2lkZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgU3RlbShXaGl0ZU5vdGUgYm90dG9tLCBXaGl0ZU5vdGUgdG9wLCBcbiAgICAgICAgICAgICAgICBOb3RlRHVyYXRpb24gZHVyYXRpb24sIGludCBkaXJlY3Rpb24sIGJvb2wgb3ZlcmxhcCkge1xuXG4gICAgICAgIHRoaXMudG9wID0gdG9wO1xuICAgICAgICB0aGlzLmJvdHRvbSA9IGJvdHRvbTtcbiAgICAgICAgdGhpcy5kdXJhdGlvbiA9IGR1cmF0aW9uO1xuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgICAgICAgdGhpcy5ub3Rlc292ZXJsYXAgPSBvdmVybGFwO1xuICAgICAgICBpZiAoZGlyZWN0aW9uID09IFVwIHx8IG5vdGVzb3ZlcmxhcClcbiAgICAgICAgICAgIHNpZGUgPSBSaWdodFNpZGU7XG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICBzaWRlID0gTGVmdFNpZGU7XG4gICAgICAgIGVuZCA9IENhbGN1bGF0ZUVuZCgpO1xuICAgICAgICBwYWlyID0gbnVsbDtcbiAgICAgICAgd2lkdGhfdG9fcGFpciA9IDA7XG4gICAgICAgIHJlY2VpdmVyX2luX3BhaXIgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiogQ2FsY3VsYXRlIHRoZSB2ZXJ0aWNhbCBwb3NpdGlvbiAod2hpdGUgbm90ZSBrZXkpIHdoZXJlIFxuICAgICAqIHRoZSBzdGVtIGVuZHMgXG4gICAgICovXG4gICAgcHVibGljIFdoaXRlTm90ZSBDYWxjdWxhdGVFbmQoKSB7XG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT0gVXApIHtcbiAgICAgICAgICAgIFdoaXRlTm90ZSB3ID0gdG9wO1xuICAgICAgICAgICAgdyA9IHcuQWRkKDYpO1xuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGgpIHtcbiAgICAgICAgICAgICAgICB3ID0gdy5BZGQoMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG4gICAgICAgICAgICAgICAgdyA9IHcuQWRkKDQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGlyZWN0aW9uID09IERvd24pIHtcbiAgICAgICAgICAgIFdoaXRlTm90ZSB3ID0gYm90dG9tO1xuICAgICAgICAgICAgdyA9IHcuQWRkKC02KTtcbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uU2l4dGVlbnRoKSB7XG4gICAgICAgICAgICAgICAgdyA9IHcuQWRkKC0yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcbiAgICAgICAgICAgICAgICB3ID0gdy5BZGQoLTQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDsgIC8qIFNob3VsZG4ndCBoYXBwZW4gKi9cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBDaGFuZ2UgdGhlIGRpcmVjdGlvbiBvZiB0aGUgc3RlbS4gIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGJ5IFxuICAgICAqIENob3JkU3ltYm9sLk1ha2VQYWlyKCkuICBXaGVuIHR3byBjaG9yZHMgYXJlIGpvaW5lZCBieSBhIGhvcml6b250YWxcbiAgICAgKiBiZWFtLCB0aGVpciBzdGVtcyBtdXN0IHBvaW50IGluIHRoZSBzYW1lIGRpcmVjdGlvbiAodXAgb3IgZG93bikuXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgQ2hhbmdlRGlyZWN0aW9uKGludCBuZXdkaXJlY3Rpb24pIHtcbiAgICAgICAgZGlyZWN0aW9uID0gbmV3ZGlyZWN0aW9uO1xuICAgICAgICBpZiAoZGlyZWN0aW9uID09IFVwIHx8IG5vdGVzb3ZlcmxhcClcbiAgICAgICAgICAgIHNpZGUgPSBSaWdodFNpZGU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNpZGUgPSBMZWZ0U2lkZTtcbiAgICAgICAgZW5kID0gQ2FsY3VsYXRlRW5kKCk7XG4gICAgfVxuXG4gICAgLyoqIFBhaXIgdGhpcyBzdGVtIHdpdGggYW5vdGhlciBDaG9yZC4gIEluc3RlYWQgb2YgZHJhd2luZyBhIGN1cnZ5IHRhaWwsXG4gICAgICogdGhpcyBzdGVtIHdpbGwgbm93IGhhdmUgdG8gZHJhdyBhIGJlYW0gdG8gdGhlIGdpdmVuIHN0ZW0gcGFpci4gIFRoZVxuICAgICAqIHdpZHRoIChpbiBwaXhlbHMpIHRvIHRoaXMgc3RlbSBwYWlyIGlzIHBhc3NlZCBhcyBhcmd1bWVudC5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBTZXRQYWlyKFN0ZW0gcGFpciwgaW50IHdpZHRoX3RvX3BhaXIpIHtcbiAgICAgICAgdGhpcy5wYWlyID0gcGFpcjtcbiAgICAgICAgdGhpcy53aWR0aF90b19wYWlyID0gd2lkdGhfdG9fcGFpcjtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRydWUgaWYgdGhpcyBTdGVtIGlzIHBhcnQgb2YgYSBob3Jpem9udGFsIGJlYW0uICovXG4gICAgcHVibGljIGJvb2wgaXNCZWFtIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHJlY2VpdmVyX2luX3BhaXIgfHwgKHBhaXIgIT0gbnVsbCk7IH1cbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGlzIHN0ZW0uXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHkgbG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEBwYXJhbSB0b3BzdGFmZiAgVGhlIG5vdGUgYXQgdGhlIHRvcCBvZiB0aGUgc3RhZmYuXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgRHJhdyhHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCwgV2hpdGVOb3RlIHRvcHN0YWZmKSB7XG4gICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uV2hvbGUpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgRHJhd1ZlcnRpY2FsTGluZShnLCBwZW4sIHl0b3AsIHRvcHN0YWZmKTtcbiAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5RdWFydGVyIHx8IFxuICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZFF1YXJ0ZXIgfHwgXG4gICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uSGFsZiB8fFxuICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEhhbGYgfHxcbiAgICAgICAgICAgIHJlY2VpdmVyX2luX3BhaXIpIHtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhaXIgIT0gbnVsbClcbiAgICAgICAgICAgIERyYXdIb3JpekJhclN0ZW0oZywgcGVuLCB5dG9wLCB0b3BzdGFmZik7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIERyYXdDdXJ2eVN0ZW0oZywgcGVuLCB5dG9wLCB0b3BzdGFmZik7XG4gICAgfVxuXG4gICAgLyoqIERyYXcgdGhlIHZlcnRpY2FsIGxpbmUgb2YgdGhlIHN0ZW0gXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHkgbG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEBwYXJhbSB0b3BzdGFmZiAgVGhlIG5vdGUgYXQgdGhlIHRvcCBvZiB0aGUgc3RhZmYuXG4gICAgICovXG4gICAgcHJpdmF0ZSB2b2lkIERyYXdWZXJ0aWNhbExpbmUoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3AsIFdoaXRlTm90ZSB0b3BzdGFmZikge1xuICAgICAgICBpbnQgeHN0YXJ0O1xuICAgICAgICBpZiAoc2lkZSA9PSBMZWZ0U2lkZSlcbiAgICAgICAgICAgIHhzdGFydCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyAxO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB4c3RhcnQgPSBTaGVldE11c2ljLkxpbmVTcGFjZS80ICsgU2hlZXRNdXNpYy5Ob3RlV2lkdGg7XG5cbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PSBVcCkge1xuICAgICAgICAgICAgaW50IHkxID0geXRvcCArIHRvcHN0YWZmLkRpc3QoYm90dG9tKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yIFxuICAgICAgICAgICAgICAgICAgICAgICArIFNoZWV0TXVzaWMuTm90ZUhlaWdodC80O1xuXG4gICAgICAgICAgICBpbnQgeXN0ZW0gPSB5dG9wICsgdG9wc3RhZmYuRGlzdChlbmQpICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG5cbiAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHkxLCB4c3RhcnQsIHlzdGVtKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkaXJlY3Rpb24gPT0gRG93bikge1xuICAgICAgICAgICAgaW50IHkxID0geXRvcCArIHRvcHN0YWZmLkRpc3QodG9wKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yIFxuICAgICAgICAgICAgICAgICAgICAgICArIFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcblxuICAgICAgICAgICAgaWYgKHNpZGUgPT0gTGVmdFNpZGUpXG4gICAgICAgICAgICAgICAgeTEgPSB5MSAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodC80O1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHkxID0geTEgLSBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcblxuICAgICAgICAgICAgaW50IHlzdGVtID0geXRvcCArIHRvcHN0YWZmLkRpc3QoZW5kKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yIFxuICAgICAgICAgICAgICAgICAgICAgICAgICArIFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcblxuICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeTEsIHhzdGFydCwgeXN0ZW0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIERyYXcgYSBjdXJ2eSBzdGVtIHRhaWwuICBUaGlzIGlzIG9ubHkgdXNlZCBmb3Igc2luZ2xlIGNob3Jkcywgbm90IGNob3JkIHBhaXJzLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5IGxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKiBAcGFyYW0gdG9wc3RhZmYgIFRoZSBub3RlIGF0IHRoZSB0b3Agb2YgdGhlIHN0YWZmLlxuICAgICAqL1xuICAgIHByaXZhdGUgdm9pZCBEcmF3Q3VydnlTdGVtKEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wLCBXaGl0ZU5vdGUgdG9wc3RhZmYpIHtcblxuICAgICAgICBwZW4uV2lkdGggPSAyO1xuXG4gICAgICAgIGludCB4c3RhcnQgPSAwO1xuICAgICAgICBpZiAoc2lkZSA9PSBMZWZ0U2lkZSlcbiAgICAgICAgICAgIHhzdGFydCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyAxO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB4c3RhcnQgPSBTaGVldE11c2ljLkxpbmVTcGFjZS80ICsgU2hlZXRNdXNpYy5Ob3RlV2lkdGg7XG5cbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PSBVcCkge1xuICAgICAgICAgICAgaW50IHlzdGVtID0geXRvcCArIHRvcHN0YWZmLkRpc3QoZW5kKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG5cbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRWlnaHRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UcmlwbGV0IHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0JlemllcihwZW4sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIHlzdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSArIDMqU2hlZXRNdXNpYy5MaW5lU3BhY2UvMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UqMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCozKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHlzdGVtICs9IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcblxuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG5cbiAgICAgICAgICAgICAgICBnLkRyYXdCZXppZXIocGVuLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCB5c3RlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gKyAzKlNoZWV0TXVzaWMuTGluZVNwYWNlLzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlKjIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZS8yLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gKyBTaGVldE11c2ljLk5vdGVIZWlnaHQqMyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHlzdGVtICs9IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG4gICAgICAgICAgICAgICAgZy5EcmF3QmV6aWVyKHBlbiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgeXN0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtICsgMypTaGVldE11c2ljLkxpbmVTcGFjZS8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZSoyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gKyBTaGVldE11c2ljLk5vdGVIZWlnaHQqMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBlbHNlIGlmIChkaXJlY3Rpb24gPT0gRG93bikge1xuICAgICAgICAgICAgaW50IHlzdGVtID0geXRvcCArIHRvcHN0YWZmLkRpc3QoZW5kKSpTaGVldE11c2ljLk5vdGVIZWlnaHQvMiArXG4gICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG5cbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRWlnaHRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UcmlwbGV0IHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0JlemllcihwZW4sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIHlzdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZSoyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gLSBTaGVldE11c2ljLk5vdGVIZWlnaHQqMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyIC0gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB5c3RlbSAtPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG5cbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uU2l4dGVlbnRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRoaXJ0eVNlY29uZCkge1xuXG4gICAgICAgICAgICAgICAgZy5EcmF3QmV6aWVyKHBlbiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgeXN0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlKjIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIgLSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxpbmVTcGFjZS8yKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgeXN0ZW0gLT0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcbiAgICAgICAgICAgICAgICBnLkRyYXdCZXppZXIocGVuLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCB5c3RlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gLSBTaGVldE11c2ljLkxpbmVTcGFjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UqMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gLSBTaGVldE11c2ljLk5vdGVIZWlnaHQqMiAtIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICAgICAgcGVuLldpZHRoID0gMTtcblxuICAgIH1cblxuICAgIC8qIERyYXcgYSBob3Jpem9udGFsIGJlYW0gc3RlbSwgY29ubmVjdGluZyB0aGlzIHN0ZW0gd2l0aCB0aGUgU3RlbSBwYWlyLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5IGxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKiBAcGFyYW0gdG9wc3RhZmYgIFRoZSBub3RlIGF0IHRoZSB0b3Agb2YgdGhlIHN0YWZmLlxuICAgICAqL1xuICAgIHByaXZhdGUgdm9pZCBEcmF3SG9yaXpCYXJTdGVtKEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wLCBXaGl0ZU5vdGUgdG9wc3RhZmYpIHtcbiAgICAgICAgcGVuLldpZHRoID0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG5cbiAgICAgICAgaW50IHhzdGFydCA9IDA7XG4gICAgICAgIGludCB4c3RhcnQyID0gMDtcblxuICAgICAgICBpZiAoc2lkZSA9PSBMZWZ0U2lkZSlcbiAgICAgICAgICAgIHhzdGFydCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyAxO1xuICAgICAgICBlbHNlIGlmIChzaWRlID09IFJpZ2h0U2lkZSlcbiAgICAgICAgICAgIHhzdGFydCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyBTaGVldE11c2ljLk5vdGVXaWR0aDtcblxuICAgICAgICBpZiAocGFpci5zaWRlID09IExlZnRTaWRlKVxuICAgICAgICAgICAgeHN0YXJ0MiA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyAxO1xuICAgICAgICBlbHNlIGlmIChwYWlyLnNpZGUgPT0gUmlnaHRTaWRlKVxuICAgICAgICAgICAgeHN0YXJ0MiA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyBTaGVldE11c2ljLk5vdGVXaWR0aDtcblxuXG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT0gVXApIHtcbiAgICAgICAgICAgIGludCB4ZW5kID0gd2lkdGhfdG9fcGFpciArIHhzdGFydDI7XG4gICAgICAgICAgICBpbnQgeXN0YXJ0ID0geXRvcCArIHRvcHN0YWZmLkRpc3QoZW5kKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICAgICAgaW50IHllbmQgPSB5dG9wICsgdG9wc3RhZmYuRGlzdChwYWlyLmVuZCkgKiBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcblxuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5FaWdodGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoIHx8IFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UcmlwbGV0IHx8IFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG5cbiAgICAgICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5c3RhcnQsIHhlbmQsIHllbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeXN0YXJ0ICs9IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgIHllbmQgKz0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuXG4gICAgICAgICAgICAvKiBBIGRvdHRlZCBlaWdodGggd2lsbCBjb25uZWN0IHRvIGEgMTZ0aCBub3RlLiAqL1xuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGgpIHtcbiAgICAgICAgICAgICAgICBpbnQgeCA9IHhlbmQgLSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICAgICAgZG91YmxlIHNsb3BlID0gKHllbmQgLSB5c3RhcnQpICogMS4wIC8gKHhlbmQgLSB4c3RhcnQpO1xuICAgICAgICAgICAgICAgIGludCB5ID0gKGludCkoc2xvcGUgKiAoeCAtIHhlbmQpICsgeWVuZCk7IFxuXG4gICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHgsIHksIHhlbmQsIHllbmQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHlzdGFydCwgeGVuZCwgeWVuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB5c3RhcnQgKz0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgeWVuZCArPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG4gICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeXN0YXJ0LCB4ZW5kLCB5ZW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaW50IHhlbmQgPSB3aWR0aF90b19wYWlyICsgeHN0YXJ0MjtcbiAgICAgICAgICAgIGludCB5c3RhcnQgPSB5dG9wICsgdG9wc3RhZmYuRGlzdChlbmQpICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgKyBcbiAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICBpbnQgeWVuZCA9IHl0b3AgKyB0b3BzdGFmZi5EaXN0KHBhaXIuZW5kKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yIFxuICAgICAgICAgICAgICAgICAgICAgICAgICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuXG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkVpZ2h0aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVHJpcGxldCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG5cbiAgICAgICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5c3RhcnQsIHhlbmQsIHllbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeXN0YXJ0IC09IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgIHllbmQgLT0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuXG4gICAgICAgICAgICAvKiBBIGRvdHRlZCBlaWdodGggd2lsbCBjb25uZWN0IHRvIGEgMTZ0aCBub3RlLiAqL1xuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGgpIHtcbiAgICAgICAgICAgICAgICBpbnQgeCA9IHhlbmQgLSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICAgICAgZG91YmxlIHNsb3BlID0gKHllbmQgLSB5c3RhcnQpICogMS4wIC8gKHhlbmQgLSB4c3RhcnQpO1xuICAgICAgICAgICAgICAgIGludCB5ID0gKGludCkoc2xvcGUgKiAoeCAtIHhlbmQpICsgeWVuZCk7IFxuXG4gICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHgsIHksIHhlbmQsIHllbmQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHlzdGFydCwgeGVuZCwgeWVuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB5c3RhcnQgLT0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgeWVuZCAtPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG4gICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeXN0YXJ0LCB4ZW5kLCB5ZW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiU3RlbSBkdXJhdGlvbj17MH0gZGlyZWN0aW9uPXsxfSB0b3A9ezJ9IGJvdHRvbT17M30gZW5kPXs0fVwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgb3ZlcmxhcD17NX0gc2lkZT17Nn0gd2lkdGhfdG9fcGFpcj17N30gcmVjZWl2ZXJfaW5fcGFpcj17OH1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHVyYXRpb24sIGRpcmVjdGlvbiwgdG9wLlRvU3RyaW5nKCksIGJvdHRvbS5Ub1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmQuVG9TdHJpbmcoKSwgbm90ZXNvdmVybGFwLCBzaWRlLCB3aWR0aF90b19wYWlyLCByZWNlaXZlcl9pbl9wYWlyKTtcbiAgICB9XG5cbn0gXG5cblxufVxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogQGNsYXNzIFN5bWJvbFdpZHRoc1xuICogVGhlIFN5bWJvbFdpZHRocyBjbGFzcyBpcyB1c2VkIHRvIHZlcnRpY2FsbHkgYWxpZ24gbm90ZXMgaW4gZGlmZmVyZW50XG4gKiB0cmFja3MgdGhhdCBvY2N1ciBhdCB0aGUgc2FtZSB0aW1lICh0aGF0IGhhdmUgdGhlIHNhbWUgc3RhcnR0aW1lKS5cbiAqIFRoaXMgaXMgZG9uZSBieSB0aGUgZm9sbG93aW5nOlxuICogLSBTdG9yZSBhIGxpc3Qgb2YgYWxsIHRoZSBzdGFydCB0aW1lcy5cbiAqIC0gU3RvcmUgdGhlIHdpZHRoIG9mIHN5bWJvbHMgZm9yIGVhY2ggc3RhcnQgdGltZSwgZm9yIGVhY2ggdHJhY2suXG4gKiAtIFN0b3JlIHRoZSBtYXhpbXVtIHdpZHRoIGZvciBlYWNoIHN0YXJ0IHRpbWUsIGFjcm9zcyBhbGwgdHJhY2tzLlxuICogLSBHZXQgdGhlIGV4dHJhIHdpZHRoIG5lZWRlZCBmb3IgZWFjaCB0cmFjayB0byBtYXRjaCB0aGUgbWF4aW11bVxuICogICB3aWR0aCBmb3IgdGhhdCBzdGFydCB0aW1lLlxuICpcbiAqIFNlZSBtZXRob2QgU2hlZXRNdXNpYy5BbGlnblN5bWJvbHMoKSwgd2hpY2ggdXNlcyB0aGlzIGNsYXNzLlxuICovXG5cbnB1YmxpYyBjbGFzcyBTeW1ib2xXaWR0aHMge1xuXG4gICAgLyoqIEFycmF5IG9mIG1hcHMgKHN0YXJ0dGltZSAtPiBzeW1ib2wgd2lkdGgpLCBvbmUgcGVyIHRyYWNrICovXG4gICAgcHJpdmF0ZSBEaWN0aW9uYXJ5PGludCwgaW50PltdIHdpZHRocztcblxuICAgIC8qKiBNYXAgb2Ygc3RhcnR0aW1lIC0+IG1heGltdW0gc3ltYm9sIHdpZHRoICovXG4gICAgcHJpdmF0ZSBEaWN0aW9uYXJ5PGludCwgaW50PiBtYXh3aWR0aHM7XG5cbiAgICAvKiogQW4gYXJyYXkgb2YgYWxsIHRoZSBzdGFydHRpbWVzLCBpbiBhbGwgdHJhY2tzICovXG4gICAgcHJpdmF0ZSBpbnRbXSBzdGFydHRpbWVzO1xuXG5cbiAgICAvKiogSW5pdGlhbGl6ZSB0aGUgc3ltYm9sIHdpZHRoIG1hcHMsIGdpdmVuIGFsbCB0aGUgc3ltYm9scyBpblxuICAgICAqIGFsbCB0aGUgdHJhY2tzLCBwbHVzIHRoZSBseXJpY3MgaW4gYWxsIHRyYWNrcy5cbiAgICAgKi9cbiAgICBwdWJsaWMgU3ltYm9sV2lkdGhzKExpc3Q8TXVzaWNTeW1ib2w+W10gdHJhY2tzLFxuICAgICAgICAgICAgICAgICAgICAgICAgTGlzdDxMeXJpY1N5bWJvbD5bXSB0cmFja2x5cmljcykge1xuXG4gICAgICAgIC8qIEdldCB0aGUgc3ltYm9sIHdpZHRocyBmb3IgYWxsIHRoZSB0cmFja3MgKi9cbiAgICAgICAgd2lkdGhzID0gbmV3IERpY3Rpb25hcnk8aW50LGludD5bIHRyYWNrcy5MZW5ndGggXTtcbiAgICAgICAgZm9yIChpbnQgdHJhY2sgPSAwOyB0cmFjayA8IHRyYWNrcy5MZW5ndGg7IHRyYWNrKyspIHtcbiAgICAgICAgICAgIHdpZHRoc1t0cmFja10gPSBHZXRUcmFja1dpZHRocyh0cmFja3NbdHJhY2tdKTtcbiAgICAgICAgfVxuICAgICAgICBtYXh3aWR0aHMgPSBuZXcgRGljdGlvbmFyeTxpbnQsaW50PigpO1xuXG4gICAgICAgIC8qIENhbGN1bGF0ZSB0aGUgbWF4aW11bSBzeW1ib2wgd2lkdGhzICovXG4gICAgICAgIGZvcmVhY2ggKERpY3Rpb25hcnk8aW50LGludD4gZGljdCBpbiB3aWR0aHMpIHtcbiAgICAgICAgICAgIGZvcmVhY2ggKGludCB0aW1lIGluIGRpY3QuS2V5cykge1xuICAgICAgICAgICAgICAgIGlmICghbWF4d2lkdGhzLkNvbnRhaW5zS2V5KHRpbWUpIHx8XG4gICAgICAgICAgICAgICAgICAgIChtYXh3aWR0aHNbdGltZV0gPCBkaWN0W3RpbWVdKSApIHtcblxuICAgICAgICAgICAgICAgICAgICBtYXh3aWR0aHNbdGltZV0gPSBkaWN0W3RpbWVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0cmFja2x5cmljcyAhPSBudWxsKSB7XG4gICAgICAgICAgICBmb3JlYWNoIChMaXN0PEx5cmljU3ltYm9sPiBseXJpY3MgaW4gdHJhY2tseXJpY3MpIHtcbiAgICAgICAgICAgICAgICBpZiAobHlyaWNzID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKEx5cmljU3ltYm9sIGx5cmljIGluIGx5cmljcykge1xuICAgICAgICAgICAgICAgICAgICBpbnQgd2lkdGggPSBseXJpYy5NaW5XaWR0aDtcbiAgICAgICAgICAgICAgICAgICAgaW50IHRpbWUgPSBseXJpYy5TdGFydFRpbWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICghbWF4d2lkdGhzLkNvbnRhaW5zS2V5KHRpbWUpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAobWF4d2lkdGhzW3RpbWVdIDwgd2lkdGgpICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXh3aWR0aHNbdGltZV0gPSB3aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFN0b3JlIGFsbCB0aGUgc3RhcnQgdGltZXMgdG8gdGhlIHN0YXJ0dGltZSBhcnJheSAqL1xuICAgICAgICBzdGFydHRpbWVzID0gbmV3IGludFsgbWF4d2lkdGhzLktleXMuQ291bnQgXTtcbiAgICAgICAgbWF4d2lkdGhzLktleXMuQ29weVRvKHN0YXJ0dGltZXMsIDApO1xuICAgICAgICBBcnJheS5Tb3J0PGludD4oc3RhcnR0aW1lcyk7XG4gICAgfVxuXG4gICAgLyoqIENyZWF0ZSBhIHRhYmxlIG9mIHRoZSBzeW1ib2wgd2lkdGhzIGZvciBlYWNoIHN0YXJ0dGltZSBpbiB0aGUgdHJhY2suICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgRGljdGlvbmFyeTxpbnQsaW50PiBHZXRUcmFja1dpZHRocyhMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzKSB7XG4gICAgICAgIERpY3Rpb25hcnk8aW50LGludD4gd2lkdGhzID0gbmV3IERpY3Rpb25hcnk8aW50LGludD4oKTtcblxuICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBtIGluIHN5bWJvbHMpIHtcbiAgICAgICAgICAgIGludCBzdGFydCA9IG0uU3RhcnRUaW1lO1xuICAgICAgICAgICAgaW50IHcgPSBtLk1pbldpZHRoO1xuXG4gICAgICAgICAgICBpZiAobSBpcyBCYXJTeW1ib2wpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHdpZHRocy5Db250YWluc0tleShzdGFydCkpIHtcbiAgICAgICAgICAgICAgICB3aWR0aHNbc3RhcnRdICs9IHc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB3aWR0aHNbc3RhcnRdID0gdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gd2lkdGhzO1xuICAgIH1cblxuICAgIC8qKiBHaXZlbiBhIHRyYWNrIGFuZCBhIHN0YXJ0IHRpbWUsIHJldHVybiB0aGUgZXh0cmEgd2lkdGggbmVlZGVkIHNvIHRoYXRcbiAgICAgKiB0aGUgc3ltYm9scyBmb3IgdGhhdCBzdGFydCB0aW1lIGFsaWduIHdpdGggdGhlIG90aGVyIHRyYWNrcy5cbiAgICAgKi9cbiAgICBwdWJsaWMgaW50IEdldEV4dHJhV2lkdGgoaW50IHRyYWNrLCBpbnQgc3RhcnQpIHtcbiAgICAgICAgaWYgKCF3aWR0aHNbdHJhY2tdLkNvbnRhaW5zS2V5KHN0YXJ0KSkge1xuICAgICAgICAgICAgcmV0dXJuIG1heHdpZHRoc1tzdGFydF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbWF4d2lkdGhzW3N0YXJ0XSAtIHdpZHRoc1t0cmFja11bc3RhcnRdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiBhbiBhcnJheSBvZiBhbGwgdGhlIHN0YXJ0IHRpbWVzIGluIGFsbCB0aGUgdHJhY2tzICovXG4gICAgcHVibGljIGludFtdIFN0YXJ0VGltZXMge1xuICAgICAgICBnZXQgeyByZXR1cm4gc3RhcnR0aW1lczsgfVxuICAgIH1cblxuXG5cblxufVxuXG5cbn1cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMSBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIFRoZSBwb3NzaWJsZSBub3RlIGR1cmF0aW9ucyAqL1xucHVibGljIGVudW0gTm90ZUR1cmF0aW9uIHtcbiAgVGhpcnR5U2Vjb25kLCBTaXh0ZWVudGgsIFRyaXBsZXQsIEVpZ2h0aCxcbiAgRG90dGVkRWlnaHRoLCBRdWFydGVyLCBEb3R0ZWRRdWFydGVyLFxuICBIYWxmLCBEb3R0ZWRIYWxmLCBXaG9sZVxufTtcblxuLyoqIEBjbGFzcyBUaW1lU2lnbmF0dXJlXG4gKiBUaGUgVGltZVNpZ25hdHVyZSBjbGFzcyByZXByZXNlbnRzXG4gKiAtIFRoZSB0aW1lIHNpZ25hdHVyZSBvZiB0aGUgc29uZywgc3VjaCBhcyA0LzQsIDMvNCwgb3IgNi84IHRpbWUsIGFuZFxuICogLSBUaGUgbnVtYmVyIG9mIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlXG4gKiAtIFRoZSBudW1iZXIgb2YgbWljcm9zZWNvbmRzIHBlciBxdWFydGVyIG5vdGVcbiAqXG4gKiBJbiBtaWRpIGZpbGVzLCBhbGwgdGltZSBpcyBtZWFzdXJlZCBpbiBcInB1bHNlc1wiLiAgRWFjaCBub3RlIGhhc1xuICogYSBzdGFydCB0aW1lIChtZWFzdXJlZCBpbiBwdWxzZXMpLCBhbmQgYSBkdXJhdGlvbiAobWVhc3VyZWQgaW4gXG4gKiBwdWxzZXMpLiAgVGhpcyBjbGFzcyBpcyB1c2VkIG1haW5seSB0byBjb252ZXJ0IHB1bHNlIGR1cmF0aW9uc1xuICogKGxpa2UgMTIwLCAyNDAsIGV0YykgaW50byBub3RlIGR1cmF0aW9ucyAoaGFsZiwgcXVhcnRlciwgZWlnaHRoLCBldGMpLlxuICovXG5cbnB1YmxpYyBjbGFzcyBUaW1lU2lnbmF0dXJlIHtcbiAgICBwcml2YXRlIGludCBudW1lcmF0b3I7ICAgICAgLyoqIE51bWVyYXRvciBvZiB0aGUgdGltZSBzaWduYXR1cmUgKi9cbiAgICBwcml2YXRlIGludCBkZW5vbWluYXRvcjsgICAgLyoqIERlbm9taW5hdG9yIG9mIHRoZSB0aW1lIHNpZ25hdHVyZSAqL1xuICAgIHByaXZhdGUgaW50IHF1YXJ0ZXJub3RlOyAgICAvKiogTnVtYmVyIG9mIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlICovXG4gICAgcHJpdmF0ZSBpbnQgbWVhc3VyZTsgICAgICAgIC8qKiBOdW1iZXIgb2YgcHVsc2VzIHBlciBtZWFzdXJlICovXG4gICAgcHJpdmF0ZSBpbnQgdGVtcG87ICAgICAgICAgIC8qKiBOdW1iZXIgb2YgbWljcm9zZWNvbmRzIHBlciBxdWFydGVyIG5vdGUgKi9cblxuICAgIC8qKiBHZXQgdGhlIG51bWVyYXRvciBvZiB0aGUgdGltZSBzaWduYXR1cmUgKi9cbiAgICBwdWJsaWMgaW50IE51bWVyYXRvciB7XG4gICAgICAgIGdldCB7IHJldHVybiBudW1lcmF0b3I7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBkZW5vbWluYXRvciBvZiB0aGUgdGltZSBzaWduYXR1cmUgKi9cbiAgICBwdWJsaWMgaW50IERlbm9taW5hdG9yIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIGRlbm9taW5hdG9yOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlICovXG4gICAgcHVibGljIGludCBRdWFydGVyIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHF1YXJ0ZXJub3RlOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHB1bHNlcyBwZXIgbWVhc3VyZSAqL1xuICAgIHB1YmxpYyBpbnQgTWVhc3VyZSB7XG4gICAgICAgIGdldCB7IHJldHVybiBtZWFzdXJlOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIG1pY3Jvc2Vjb25kcyBwZXIgcXVhcnRlciBub3RlICovIFxuICAgIHB1YmxpYyBpbnQgVGVtcG8ge1xuICAgICAgICBnZXQgeyByZXR1cm4gdGVtcG87IH1cbiAgICB9XG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IHRpbWUgc2lnbmF0dXJlLCB3aXRoIHRoZSBnaXZlbiBudW1lcmF0b3IsXG4gICAgICogZGVub21pbmF0b3IsIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlLCBhbmQgdGVtcG8uXG4gICAgICovXG4gICAgcHVibGljIFRpbWVTaWduYXR1cmUoaW50IG51bWVyYXRvciwgaW50IGRlbm9taW5hdG9yLCBpbnQgcXVhcnRlcm5vdGUsIGludCB0ZW1wbykge1xuICAgICAgICBpZiAobnVtZXJhdG9yIDw9IDAgfHwgZGVub21pbmF0b3IgPD0gMCB8fCBxdWFydGVybm90ZSA8PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXCJJbnZhbGlkIHRpbWUgc2lnbmF0dXJlXCIsIDApO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogTWlkaSBGaWxlIGdpdmVzIHdyb25nIHRpbWUgc2lnbmF0dXJlIHNvbWV0aW1lcyAqL1xuICAgICAgICBpZiAobnVtZXJhdG9yID09IDUpIHtcbiAgICAgICAgICAgIG51bWVyYXRvciA9IDQ7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm51bWVyYXRvciA9IG51bWVyYXRvcjtcbiAgICAgICAgdGhpcy5kZW5vbWluYXRvciA9IGRlbm9taW5hdG9yO1xuICAgICAgICB0aGlzLnF1YXJ0ZXJub3RlID0gcXVhcnRlcm5vdGU7XG4gICAgICAgIHRoaXMudGVtcG8gPSB0ZW1wbztcblxuICAgICAgICBpbnQgYmVhdDtcbiAgICAgICAgaWYgKGRlbm9taW5hdG9yIDwgNClcbiAgICAgICAgICAgIGJlYXQgPSBxdWFydGVybm90ZSAqIDI7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJlYXQgPSBxdWFydGVybm90ZSAvIChkZW5vbWluYXRvci80KTtcblxuICAgICAgICBtZWFzdXJlID0gbnVtZXJhdG9yICogYmVhdDtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHdoaWNoIG1lYXN1cmUgdGhlIGdpdmVuIHRpbWUgKGluIHB1bHNlcykgYmVsb25ncyB0by4gKi9cbiAgICBwdWJsaWMgaW50IEdldE1lYXN1cmUoaW50IHRpbWUpIHtcbiAgICAgICAgcmV0dXJuIHRpbWUgLyBtZWFzdXJlO1xuICAgIH1cblxuICAgIC8qKiBHaXZlbiBhIGR1cmF0aW9uIGluIHB1bHNlcywgcmV0dXJuIHRoZSBjbG9zZXN0IG5vdGUgZHVyYXRpb24uICovXG4gICAgcHVibGljIE5vdGVEdXJhdGlvbiBHZXROb3RlRHVyYXRpb24oaW50IGR1cmF0aW9uKSB7XG4gICAgICAgIGludCB3aG9sZSA9IHF1YXJ0ZXJub3RlICogNDtcblxuICAgICAgICAvKipcbiAgICAgICAgIDEgICAgICAgPSAzMi8zMlxuICAgICAgICAgMy80ICAgICA9IDI0LzMyXG4gICAgICAgICAxLzIgICAgID0gMTYvMzJcbiAgICAgICAgIDMvOCAgICAgPSAxMi8zMlxuICAgICAgICAgMS80ICAgICA9ICA4LzMyXG4gICAgICAgICAzLzE2ICAgID0gIDYvMzJcbiAgICAgICAgIDEvOCAgICAgPSAgNC8zMiA9ICAgIDgvNjRcbiAgICAgICAgIHRyaXBsZXQgICAgICAgICA9IDUuMzMvNjRcbiAgICAgICAgIDEvMTYgICAgPSAgMi8zMiA9ICAgIDQvNjRcbiAgICAgICAgIDEvMzIgICAgPSAgMS8zMiA9ICAgIDIvNjRcbiAgICAgICAgICoqLyBcblxuICAgICAgICBpZiAgICAgIChkdXJhdGlvbiA+PSAyOCp3aG9sZS8zMilcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uV2hvbGU7XG4gICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID49IDIwKndob2xlLzMyKSBcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uRG90dGVkSGFsZjtcbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPj0gMTQqd2hvbGUvMzIpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLkhhbGY7XG4gICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID49IDEwKndob2xlLzMyKVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5Eb3R0ZWRRdWFydGVyO1xuICAgICAgICBlbHNlIGlmIChkdXJhdGlvbiA+PSAgNyp3aG9sZS8zMilcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uUXVhcnRlcjtcbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPj0gIDUqd2hvbGUvMzIpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aDtcbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPj0gIDYqd2hvbGUvNjQpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLkVpZ2h0aDtcbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPj0gIDUqd2hvbGUvNjQpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLlRyaXBsZXQ7XG4gICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID49ICAzKndob2xlLzY0KVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5TaXh0ZWVudGg7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kO1xuICAgIH1cblxuICAgIC8qKiBDb252ZXJ0IGEgbm90ZSBkdXJhdGlvbiBpbnRvIGEgc3RlbSBkdXJhdGlvbi4gIERvdHRlZCBkdXJhdGlvbnNcbiAgICAgKiBhcmUgY29udmVydGVkIGludG8gdGhlaXIgbm9uLWRvdHRlZCBlcXVpdmFsZW50cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIE5vdGVEdXJhdGlvbiBHZXRTdGVtRHVyYXRpb24oTm90ZUR1cmF0aW9uIGR1cikge1xuICAgICAgICBpZiAoZHVyID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRIYWxmKVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5IYWxmO1xuICAgICAgICBlbHNlIGlmIChkdXIgPT0gTm90ZUR1cmF0aW9uLkRvdHRlZFF1YXJ0ZXIpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLlF1YXJ0ZXI7XG4gICAgICAgIGVsc2UgaWYgKGR1ciA9PSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoKVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5FaWdodGg7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBkdXI7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgdGltZSBwZXJpb2QgKGluIHB1bHNlcykgdGhlIHRoZSBnaXZlbiBkdXJhdGlvbiBzcGFucyAqL1xuICAgIHB1YmxpYyBpbnQgRHVyYXRpb25Ub1RpbWUoTm90ZUR1cmF0aW9uIGR1cikge1xuICAgICAgICBpbnQgZWlnaHRoID0gcXVhcnRlcm5vdGUvMjtcbiAgICAgICAgaW50IHNpeHRlZW50aCA9IGVpZ2h0aC8yO1xuXG4gICAgICAgIHN3aXRjaCAoZHVyKSB7XG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5XaG9sZTogICAgICAgICByZXR1cm4gcXVhcnRlcm5vdGUgKiA0OyBcbiAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkRvdHRlZEhhbGY6ICAgIHJldHVybiBxdWFydGVybm90ZSAqIDM7IFxuICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uSGFsZjogICAgICAgICAgcmV0dXJuIHF1YXJ0ZXJub3RlICogMjsgXG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5Eb3R0ZWRRdWFydGVyOiByZXR1cm4gMyplaWdodGg7IFxuICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uUXVhcnRlcjogICAgICAgcmV0dXJuIHF1YXJ0ZXJub3RlOyBcbiAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aDogIHJldHVybiAzKnNpeHRlZW50aDtcbiAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkVpZ2h0aDogICAgICAgIHJldHVybiBlaWdodGg7XG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5UcmlwbGV0OiAgICAgICByZXR1cm4gcXVhcnRlcm5vdGUvMzsgXG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5TaXh0ZWVudGg6ICAgICByZXR1cm4gc2l4dGVlbnRoO1xuICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kOiAgcmV0dXJuIHNpeHRlZW50aC8yOyBcbiAgICAgICAgICAgIGRlZmF1bHQ6ICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgb3ZlcnJpZGUgXG4gICAgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gc3RyaW5nLkZvcm1hdChcIlRpbWVTaWduYXR1cmU9ezB9L3sxfSBxdWFydGVyPXsyfSB0ZW1wbz17M31cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtZXJhdG9yLCBkZW5vbWluYXRvciwgcXVhcnRlcm5vdGUsIHRlbXBvKTtcbiAgICB9XG4gICAgXG59XG5cbn1cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG5cbi8qKiBBY2NpZGVudGFscyAqL1xucHVibGljIGVudW0gQWNjaWQge1xuICAgIE5vbmUsIFNoYXJwLCBGbGF0LCBOYXR1cmFsXG59XG5cbi8qKiBAY2xhc3MgQWNjaWRTeW1ib2xcbiAqIEFuIGFjY2lkZW50YWwgKGFjY2lkKSBzeW1ib2wgcmVwcmVzZW50cyBhIHNoYXJwLCBmbGF0LCBvciBuYXR1cmFsXG4gKiBhY2NpZGVudGFsIHRoYXQgaXMgZGlzcGxheWVkIGF0IGEgc3BlY2lmaWMgcG9zaXRpb24gKG5vdGUgYW5kIGNsZWYpLlxuICovXG5wdWJsaWMgY2xhc3MgQWNjaWRTeW1ib2wgOiBNdXNpY1N5bWJvbCB7XG4gICAgcHJpdmF0ZSBBY2NpZCBhY2NpZDsgICAgICAgICAgLyoqIFRoZSBhY2NpZGVudGFsIChzaGFycCwgZmxhdCwgbmF0dXJhbCkgKi9cbiAgICBwcml2YXRlIFdoaXRlTm90ZSB3aGl0ZW5vdGU7ICAvKiogVGhlIHdoaXRlIG5vdGUgd2hlcmUgdGhlIHN5bWJvbCBvY2N1cnMgKi9cbiAgICBwcml2YXRlIENsZWYgY2xlZjsgICAgICAgICAgICAvKiogV2hpY2ggY2xlZiB0aGUgc3ltYm9scyBpcyBpbiAqL1xuICAgIHByaXZhdGUgaW50IHdpZHRoOyAgICAgICAgICAgIC8qKiBXaWR0aCBvZiBzeW1ib2wgKi9cblxuICAgIC8qKiBcbiAgICAgKiBDcmVhdGUgYSBuZXcgQWNjaWRTeW1ib2wgd2l0aCB0aGUgZ2l2ZW4gYWNjaWRlbnRhbCwgdGhhdCBpc1xuICAgICAqIGRpc3BsYXllZCBhdCB0aGUgZ2l2ZW4gbm90ZSBpbiB0aGUgZ2l2ZW4gY2xlZi5cbiAgICAgKi9cbiAgICBwdWJsaWMgQWNjaWRTeW1ib2woQWNjaWQgYWNjaWQsIFdoaXRlTm90ZSBub3RlLCBDbGVmIGNsZWYpIHtcbiAgICAgICAgdGhpcy5hY2NpZCA9IGFjY2lkO1xuICAgICAgICB0aGlzLndoaXRlbm90ZSA9IG5vdGU7XG4gICAgICAgIHRoaXMuY2xlZiA9IGNsZWY7XG4gICAgICAgIHdpZHRoID0gTWluV2lkdGg7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgd2hpdGUgbm90ZSB0aGlzIGFjY2lkZW50YWwgaXMgZGlzcGxheWVkIGF0ICovXG4gICAgcHVibGljIFdoaXRlTm90ZSBOb3RlICB7XG4gICAgICAgIGdldCB7IHJldHVybiB3aGl0ZW5vdGU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSB0aW1lIChpbiBwdWxzZXMpIHRoaXMgc3ltYm9sIG9jY3VycyBhdC5cbiAgICAgKiBOb3QgdXNlZC4gIEluc3RlYWQsIHRoZSBTdGFydFRpbWUgb2YgdGhlIENob3JkU3ltYm9sIGNvbnRhaW5pbmcgdGhpc1xuICAgICAqIEFjY2lkU3ltYm9sIGlzIHVzZWQuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBTdGFydFRpbWUgeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIC0xOyB9ICBcbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBtaW5pbXVtIHdpZHRoIChpbiBwaXhlbHMpIG5lZWRlZCB0byBkcmF3IHRoaXMgc3ltYm9sICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBNaW5XaWR0aCB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gMypTaGVldE11c2ljLk5vdGVIZWlnaHQvMjsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQvU2V0IHRoZSB3aWR0aCAoaW4gcGl4ZWxzKSBvZiB0aGlzIHN5bWJvbC4gVGhlIHdpZHRoIGlzIHNldFxuICAgICAqIGluIFNoZWV0TXVzaWMuQWxpZ25TeW1ib2xzKCkgdG8gdmVydGljYWxseSBhbGlnbiBzeW1ib2xzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgV2lkdGgge1xuICAgICAgICBnZXQgeyByZXR1cm4gd2lkdGg7IH1cbiAgICAgICAgc2V0IHsgd2lkdGggPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBhYm92ZSB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBBYm92ZVN0YWZmIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIEdldEFib3ZlU3RhZmYoKTsgfVxuICAgIH1cblxuICAgIGludCBHZXRBYm92ZVN0YWZmKCkge1xuICAgICAgICBpbnQgZGlzdCA9IFdoaXRlTm90ZS5Ub3AoY2xlZikuRGlzdCh3aGl0ZW5vdGUpICogXG4gICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG4gICAgICAgIGlmIChhY2NpZCA9PSBBY2NpZC5TaGFycCB8fCBhY2NpZCA9PSBBY2NpZC5OYXR1cmFsKVxuICAgICAgICAgICAgZGlzdCAtPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgIGVsc2UgaWYgKGFjY2lkID09IEFjY2lkLkZsYXQpXG4gICAgICAgICAgICBkaXN0IC09IDMqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG5cbiAgICAgICAgaWYgKGRpc3QgPCAwKVxuICAgICAgICAgICAgcmV0dXJuIC1kaXN0O1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYmVsb3cgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQmVsb3dTdGFmZiB7XG4gICAgICAgIGdldCB7IHJldHVybiBHZXRCZWxvd1N0YWZmKCk7IH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGludCBHZXRCZWxvd1N0YWZmKCkge1xuICAgICAgICBpbnQgZGlzdCA9IFdoaXRlTm90ZS5Cb3R0b20oY2xlZikuRGlzdCh3aGl0ZW5vdGUpICogXG4gICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgKyBcbiAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgIGlmIChhY2NpZCA9PSBBY2NpZC5TaGFycCB8fCBhY2NpZCA9PSBBY2NpZC5OYXR1cmFsKSBcbiAgICAgICAgICAgIGRpc3QgKz0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuXG4gICAgICAgIGlmIChkaXN0ID4gMClcbiAgICAgICAgICAgIHJldHVybiBkaXN0O1xuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgLyoqIERyYXcgdGhlIHN5bWJvbC5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIC8qIEFsaWduIHRoZSBzeW1ib2wgdG8gdGhlIHJpZ2h0ICovXG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKFdpZHRoIC0gTWluV2lkdGgsIDApO1xuXG4gICAgICAgIC8qIFN0b3JlIHRoZSB5LXBpeGVsIHZhbHVlIG9mIHRoZSB0b3Agb2YgdGhlIHdoaXRlbm90ZSBpbiB5bm90ZS4gKi9cbiAgICAgICAgaW50IHlub3RlID0geXRvcCArIFdoaXRlTm90ZS5Ub3AoY2xlZikuRGlzdCh3aGl0ZW5vdGUpICogXG4gICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG4gICAgICAgIGlmIChhY2NpZCA9PSBBY2NpZC5TaGFycClcbiAgICAgICAgICAgIERyYXdTaGFycChnLCBwZW4sIHlub3RlKTtcbiAgICAgICAgZWxzZSBpZiAoYWNjaWQgPT0gQWNjaWQuRmxhdClcbiAgICAgICAgICAgIERyYXdGbGF0KGcsIHBlbiwgeW5vdGUpO1xuICAgICAgICBlbHNlIGlmIChhY2NpZCA9PSBBY2NpZC5OYXR1cmFsKVxuICAgICAgICAgICAgRHJhd05hdHVyYWwoZywgcGVuLCB5bm90ZSk7XG5cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShXaWR0aCAtIE1pbldpZHRoKSwgMCk7XG4gICAgfVxuXG4gICAgLyoqIERyYXcgYSBzaGFycCBzeW1ib2wuIFxuICAgICAqIEBwYXJhbSB5bm90ZSBUaGUgcGl4ZWwgbG9jYXRpb24gb2YgdGhlIHRvcCBvZiB0aGUgYWNjaWRlbnRhbCdzIG5vdGUuIFxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIERyYXdTaGFycChHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeW5vdGUpIHtcblxuICAgICAgICAvKiBEcmF3IHRoZSB0d28gdmVydGljYWwgbGluZXMgKi9cbiAgICAgICAgaW50IHlzdGFydCA9IHlub3RlIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICBpbnQgeWVuZCA9IHlub3RlICsgMipTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgIGludCB4ID0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCB4LCB5c3RhcnQgKyAyLCB4LCB5ZW5kKTtcbiAgICAgICAgeCArPSBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHgsIHlzdGFydCwgeCwgeWVuZCAtIDIpO1xuXG4gICAgICAgIC8qIERyYXcgdGhlIHNsaWdodGx5IHVwd2FyZHMgaG9yaXpvbnRhbCBsaW5lcyAqL1xuICAgICAgICBpbnQgeHN0YXJ0ID0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgLSBTaGVldE11c2ljLk5vdGVIZWlnaHQvNDtcbiAgICAgICAgaW50IHhlbmQgPSBTaGVldE11c2ljLk5vdGVIZWlnaHQgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQvNDtcbiAgICAgICAgeXN0YXJ0ID0geW5vdGUgKyBTaGVldE11c2ljLkxpbmVXaWR0aDtcbiAgICAgICAgeWVuZCA9IHlzdGFydCAtIFNoZWV0TXVzaWMuTGluZVdpZHRoIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNDtcbiAgICAgICAgcGVuLldpZHRoID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvMjtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeXN0YXJ0LCB4ZW5kLCB5ZW5kKTtcbiAgICAgICAgeXN0YXJ0ICs9IFNoZWV0TXVzaWMuTGluZVNwYWNlO1xuICAgICAgICB5ZW5kICs9IFNoZWV0TXVzaWMuTGluZVNwYWNlO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5c3RhcnQsIHhlbmQsIHllbmQpO1xuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgIH1cblxuICAgIC8qKiBEcmF3IGEgZmxhdCBzeW1ib2wuXG4gICAgICogQHBhcmFtIHlub3RlIFRoZSBwaXhlbCBsb2NhdGlvbiBvZiB0aGUgdG9wIG9mIHRoZSBhY2NpZGVudGFsJ3Mgbm90ZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3RmxhdChHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeW5vdGUpIHtcbiAgICAgICAgaW50IHggPSBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuXG4gICAgICAgIC8qIERyYXcgdGhlIHZlcnRpY2FsIGxpbmUgKi9cbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHgsIHlub3RlIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0IC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIsXG4gICAgICAgICAgICAgICAgICAgICAgICB4LCB5bm90ZSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCk7XG5cbiAgICAgICAgLyogRHJhdyAzIGJlemllciBjdXJ2ZXMuXG4gICAgICAgICAqIEFsbCAzIGN1cnZlcyBzdGFydCBhbmQgc3RvcCBhdCB0aGUgc2FtZSBwb2ludHMuXG4gICAgICAgICAqIEVhY2ggc3Vic2VxdWVudCBjdXJ2ZSBidWxnZXMgbW9yZSBhbmQgbW9yZSB0b3dhcmRzIFxuICAgICAgICAgKiB0aGUgdG9wcmlnaHQgY29ybmVyLCBtYWtpbmcgdGhlIGN1cnZlIGxvb2sgdGhpY2tlclxuICAgICAgICAgKiB0b3dhcmRzIHRoZSB0b3AtcmlnaHQuXG4gICAgICAgICAqL1xuICAgICAgICBnLkRyYXdCZXppZXIocGVuLCB4LCB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQsXG4gICAgICAgICAgICB4ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMiwgeW5vdGUgLSBTaGVldE11c2ljLkxpbmVTcGFjZS8yLFxuICAgICAgICAgICAgeCArIFNoZWV0TXVzaWMuTGluZVNwYWNlLCB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzMsXG4gICAgICAgICAgICB4LCB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlICsgU2hlZXRNdXNpYy5MaW5lV2lkdGggKyAxKTtcblxuICAgICAgICBnLkRyYXdCZXppZXIocGVuLCB4LCB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQsXG4gICAgICAgICAgICB4ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMiwgeW5vdGUgLSBTaGVldE11c2ljLkxpbmVTcGFjZS8yLFxuICAgICAgICAgICAgeCArIFNoZWV0TXVzaWMuTGluZVNwYWNlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCwgXG4gICAgICAgICAgICAgIHlub3RlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMyAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQsXG4gICAgICAgICAgICB4LCB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlICsgU2hlZXRNdXNpYy5MaW5lV2lkdGggKyAxKTtcblxuXG4gICAgICAgIGcuRHJhd0JlemllcihwZW4sIHgsIHlub3RlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCxcbiAgICAgICAgICAgIHggKyBTaGVldE11c2ljLkxpbmVTcGFjZS8yLCB5bm90ZSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIsXG4gICAgICAgICAgICB4ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UgKyBTaGVldE11c2ljLkxpbmVTcGFjZS8yLCBcbiAgICAgICAgICAgICB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzMgLSBTaGVldE11c2ljLkxpbmVTcGFjZS8yLFxuICAgICAgICAgICAgeCwgeW5vdGUgKyBTaGVldE11c2ljLkxpbmVTcGFjZSArIFNoZWV0TXVzaWMuTGluZVdpZHRoICsgMSk7XG5cblxuICAgIH1cblxuICAgIC8qKiBEcmF3IGEgbmF0dXJhbCBzeW1ib2wuXG4gICAgICogQHBhcmFtIHlub3RlIFRoZSBwaXhlbCBsb2NhdGlvbiBvZiB0aGUgdG9wIG9mIHRoZSBhY2NpZGVudGFsJ3Mgbm90ZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3TmF0dXJhbChHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeW5vdGUpIHtcblxuICAgICAgICAvKiBEcmF3IHRoZSB0d28gdmVydGljYWwgbGluZXMgKi9cbiAgICAgICAgaW50IHlzdGFydCA9IHlub3RlIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UgLSBTaGVldE11c2ljLkxpbmVXaWR0aDtcbiAgICAgICAgaW50IHllbmQgPSB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlICsgU2hlZXRNdXNpYy5MaW5lV2lkdGg7XG4gICAgICAgIGludCB4ID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvMjtcbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHgsIHlzdGFydCwgeCwgeWVuZCk7XG4gICAgICAgIHggKz0gU2hlZXRNdXNpYy5MaW5lU3BhY2UgLSBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuICAgICAgICB5c3RhcnQgPSB5bm90ZSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQ7XG4gICAgICAgIHllbmQgPSB5bm90ZSArIDIqU2hlZXRNdXNpYy5MaW5lU3BhY2UgKyBTaGVldE11c2ljLkxpbmVXaWR0aCAtIFxuICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeCwgeXN0YXJ0LCB4LCB5ZW5kKTtcblxuICAgICAgICAvKiBEcmF3IHRoZSBzbGlnaHRseSB1cHdhcmRzIGhvcml6b250YWwgbGluZXMgKi9cbiAgICAgICAgaW50IHhzdGFydCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzI7XG4gICAgICAgIGludCB4ZW5kID0geHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UgLSBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuICAgICAgICB5c3RhcnQgPSB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVdpZHRoO1xuICAgICAgICB5ZW5kID0geXN0YXJ0IC0gU2hlZXRNdXNpYy5MaW5lV2lkdGggLSBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuICAgICAgICBwZW4uV2lkdGggPSBTaGVldE11c2ljLkxpbmVTcGFjZS8yO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5c3RhcnQsIHhlbmQsIHllbmQpO1xuICAgICAgICB5c3RhcnQgKz0gU2hlZXRNdXNpYy5MaW5lU3BhY2U7XG4gICAgICAgIHllbmQgKz0gU2hlZXRNdXNpYy5MaW5lU3BhY2U7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHlzdGFydCwgeGVuZCwgeWVuZCk7XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXG4gICAgICAgICAgXCJBY2NpZFN5bWJvbCBhY2NpZD17MH0gd2hpdGVub3RlPXsxfSBjbGVmPXsyfSB3aWR0aD17M31cIixcbiAgICAgICAgICBhY2NpZCwgd2hpdGVub3RlLCBjbGVmLCB3aWR0aCk7XG4gICAgfVxuXG59XG5cbn1cblxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cblxuLyoqIEBjbGFzcyBCYXJTeW1ib2xcbiAqIFRoZSBCYXJTeW1ib2wgcmVwcmVzZW50cyB0aGUgdmVydGljYWwgYmFycyB3aGljaCBkZWxpbWl0IG1lYXN1cmVzLlxuICogVGhlIHN0YXJ0dGltZSBvZiB0aGUgc3ltYm9sIGlzIHRoZSBiZWdpbm5pbmcgb2YgdGhlIG5ld1xuICogbWVhc3VyZS5cbiAqL1xucHVibGljIGNsYXNzIEJhclN5bWJvbCA6IE11c2ljU3ltYm9sIHtcbiAgICBwcml2YXRlIGludCBzdGFydHRpbWU7XG4gICAgcHJpdmF0ZSBpbnQgd2lkdGg7XG5cbiAgICAvKiogQ3JlYXRlIGEgQmFyU3ltYm9sLiBUaGUgc3RhcnR0aW1lIHNob3VsZCBiZSB0aGUgYmVnaW5uaW5nIG9mIGEgbWVhc3VyZS4gKi9cbiAgICBwdWJsaWMgQmFyU3ltYm9sKGludCBzdGFydHRpbWUpIHtcbiAgICAgICAgdGhpcy5zdGFydHRpbWUgPSBzdGFydHRpbWU7XG4gICAgICAgIHdpZHRoID0gTWluV2lkdGg7XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgdGltZSAoaW4gcHVsc2VzKSB0aGlzIHN5bWJvbCBvY2N1cnMgYXQuXG4gICAgICogVGhpcyBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgbWVhc3VyZSB0aGlzIHN5bWJvbCBiZWxvbmdzIHRvLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgU3RhcnRUaW1lIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHN0YXJ0dGltZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG1pbmltdW0gd2lkdGggKGluIHBpeGVscykgbmVlZGVkIHRvIGRyYXcgdGhpcyBzeW1ib2wgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IE1pbldpZHRoIHsgXG4gICAgICAgIGdldCB7IHJldHVybiAyICogU2hlZXRNdXNpYy5MaW5lU3BhY2U7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0L1NldCB0aGUgd2lkdGggKGluIHBpeGVscykgb2YgdGhpcyBzeW1ib2wuIFRoZSB3aWR0aCBpcyBzZXRcbiAgICAgKiBpbiBTaGVldE11c2ljLkFsaWduU3ltYm9scygpIHRvIHZlcnRpY2FsbHkgYWxpZ24gc3ltYm9scy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFdpZHRoIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgIHNldCB7IHdpZHRoID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYWJvdmUgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQWJvdmVTdGFmZiB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gMDsgfSBcbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYmVsb3cgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQmVsb3dTdGFmZiB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBEcmF3IGEgdmVydGljYWwgYmFyLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBcbiAgICB2b2lkIERyYXcoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3ApIHtcbiAgICAgICAgaW50IHkgPSB5dG9wO1xuICAgICAgICBpbnQgeWVuZCA9IHkgKyBTaGVldE11c2ljLkxpbmVTcGFjZSo0ICsgU2hlZXRNdXNpYy5MaW5lV2lkdGgqNDtcbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIFNoZWV0TXVzaWMuTm90ZVdpZHRoLzIsIHksIFxuICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlV2lkdGgvMiwgeWVuZCk7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgb3ZlcnJpZGUgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gc3RyaW5nLkZvcm1hdChcIkJhclN5bWJvbCBzdGFydHRpbWU9ezB9IHdpZHRoPXsxfVwiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnR0aW1lLCB3aWR0aCk7XG4gICAgfVxufVxuXG5cbn1cblxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEJpdG1hcDpJbWFnZVxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBCaXRtYXAoVHlwZSB0eXBlLCBzdHJpbmcgZmlsZW5hbWUpXHJcbiAgICAgICAgOmJhc2UodHlwZSxmaWxlbmFtZSl7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcbiAgICB9XHJcbn1cclxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG5cbi8qKiBAY2xhc3MgQmxhbmtTeW1ib2wgXG4gKiBUaGUgQmxhbmsgc3ltYm9sIGlzIGEgbXVzaWMgc3ltYm9sIHRoYXQgZG9lc24ndCBkcmF3IGFueXRoaW5nLiAgVGhpc1xuICogc3ltYm9sIGlzIHVzZWQgZm9yIGFsaWdubWVudCBwdXJwb3NlcywgdG8gYWxpZ24gbm90ZXMgaW4gZGlmZmVyZW50IFxuICogc3RhZmZzIHdoaWNoIG9jY3VyIGF0IHRoZSBzYW1lIHRpbWUuXG4gKi9cbnB1YmxpYyBjbGFzcyBCbGFua1N5bWJvbCA6IE11c2ljU3ltYm9sIHtcbiAgICBwcml2YXRlIGludCBzdGFydHRpbWU7IFxuICAgIHByaXZhdGUgaW50IHdpZHRoO1xuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBCbGFua1N5bWJvbCB3aXRoIHRoZSBnaXZlbiBzdGFydHRpbWUgYW5kIHdpZHRoICovXG4gICAgcHVibGljIEJsYW5rU3ltYm9sKGludCBzdGFydHRpbWUsIGludCB3aWR0aCkge1xuICAgICAgICB0aGlzLnN0YXJ0dGltZSA9IHN0YXJ0dGltZTtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIHRpbWUgKGluIHB1bHNlcykgdGhpcyBzeW1ib2wgb2NjdXJzIGF0LlxuICAgICAqIFRoaXMgaXMgdXNlZCB0byBkZXRlcm1pbmUgdGhlIG1lYXN1cmUgdGhpcyBzeW1ib2wgYmVsb25ncyB0by5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFN0YXJ0VGltZSB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gc3RhcnR0aW1lOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbWluaW11bSB3aWR0aCAoaW4gcGl4ZWxzKSBuZWVkZWQgdG8gZHJhdyB0aGlzIHN5bWJvbCAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgTWluV2lkdGgge1xuICAgICAgICBnZXQgeyByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQvU2V0IHRoZSB3aWR0aCAoaW4gcGl4ZWxzKSBvZiB0aGlzIHN5bWJvbC4gVGhlIHdpZHRoIGlzIHNldFxuICAgICAqIGluIFNoZWV0TXVzaWMuQWxpZ25TeW1ib2xzKCkgdG8gdmVydGljYWxseSBhbGlnbiBzeW1ib2xzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgV2lkdGggeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgIHNldCB7IHdpZHRoID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYWJvdmUgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQWJvdmVTdGFmZiB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBiZWxvdyB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBCZWxvd1N0YWZmIHsgXG4gICAgICAgIGdldCB7IHJldHVybiAwOyB9XG4gICAgfVxuXG4gICAgLyoqIERyYXcgbm90aGluZy5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7fVxuXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJCbGFua1N5bWJvbCBzdGFydHRpbWU9ezB9IHdpZHRoPXsxfVwiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnR0aW1lLCB3aWR0aCk7XG4gICAgfVxufVxuXG5cbn1cblxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbnB1YmxpYyBlbnVtIFN0ZW1EaXIgeyBVcCwgRG93biB9O1xuXG4vKiogQGNsYXNzIE5vdGVEYXRhXG4gKiAgQ29udGFpbnMgZmllbGRzIGZvciBkaXNwbGF5aW5nIGEgc2luZ2xlIG5vdGUgaW4gYSBjaG9yZC5cbiAqL1xucHVibGljIGNsYXNzIE5vdGVEYXRhIHtcbiAgICBwdWJsaWMgaW50IG51bWJlcjsgICAgICAgICAgICAgLyoqIFRoZSBNaWRpIG5vdGUgbnVtYmVyLCB1c2VkIHRvIGRldGVybWluZSB0aGUgY29sb3IgKi9cbiAgICBwdWJsaWMgV2hpdGVOb3RlIHdoaXRlbm90ZTsgICAgLyoqIFRoZSB3aGl0ZSBub3RlIGxvY2F0aW9uIHRvIGRyYXcgKi9cbiAgICBwdWJsaWMgTm90ZUR1cmF0aW9uIGR1cmF0aW9uOyAgLyoqIFRoZSBkdXJhdGlvbiBvZiB0aGUgbm90ZSAqL1xuICAgIHB1YmxpYyBib29sIGxlZnRzaWRlOyAgICAgICAgICAvKiogV2hldGhlciB0byBkcmF3IG5vdGUgdG8gdGhlIGxlZnQgb3IgcmlnaHQgb2YgdGhlIHN0ZW0gKi9cbiAgICBwdWJsaWMgQWNjaWQgYWNjaWQ7ICAgICAgICAgICAgLyoqIFVzZWQgdG8gY3JlYXRlIHRoZSBBY2NpZFN5bWJvbHMgZm9yIHRoZSBjaG9yZCAqL1xufTtcblxuLyoqIEBjbGFzcyBDaG9yZFN5bWJvbFxuICogQSBjaG9yZCBzeW1ib2wgcmVwcmVzZW50cyBhIGdyb3VwIG9mIG5vdGVzIHRoYXQgYXJlIHBsYXllZCBhdCB0aGUgc2FtZVxuICogdGltZS4gIEEgY2hvcmQgaW5jbHVkZXMgdGhlIG5vdGVzLCB0aGUgYWNjaWRlbnRhbCBzeW1ib2xzIGZvciBlYWNoXG4gKiBub3RlLCBhbmQgdGhlIHN0ZW0gKG9yIHN0ZW1zKSB0byB1c2UuICBBIHNpbmdsZSBjaG9yZCBtYXkgaGF2ZSB0d28gXG4gKiBzdGVtcyBpZiB0aGUgbm90ZXMgaGF2ZSBkaWZmZXJlbnQgZHVyYXRpb25zIChlLmcuIGlmIG9uZSBub3RlIGlzIGFcbiAqIHF1YXJ0ZXIgbm90ZSwgYW5kIGFub3RoZXIgaXMgYW4gZWlnaHRoIG5vdGUpLlxuICovXG5wdWJsaWMgY2xhc3MgQ2hvcmRTeW1ib2wgOiBNdXNpY1N5bWJvbCB7XG4gICAgcHJpdmF0ZSBDbGVmIGNsZWY7ICAgICAgICAgICAgIC8qKiBXaGljaCBjbGVmIHRoZSBjaG9yZCBpcyBiZWluZyBkcmF3biBpbiAqL1xuICAgIHByaXZhdGUgaW50IHN0YXJ0dGltZTsgICAgICAgICAvKiogVGhlIHRpbWUgKGluIHB1bHNlcykgdGhlIG5vdGVzIG9jY3VycyBhdCAqL1xuICAgIHByaXZhdGUgaW50IGVuZHRpbWU7ICAgICAgICAgICAvKiogVGhlIHN0YXJ0dGltZSBwbHVzIHRoZSBsb25nZXN0IG5vdGUgZHVyYXRpb24gKi9cbiAgICBwcml2YXRlIE5vdGVEYXRhW10gbm90ZWRhdGE7ICAgLyoqIFRoZSBub3RlcyB0byBkcmF3ICovXG4gICAgcHJpdmF0ZSBBY2NpZFN5bWJvbFtdIGFjY2lkc3ltYm9sczsgICAvKiogVGhlIGFjY2lkZW50YWwgc3ltYm9scyB0byBkcmF3ICovXG4gICAgcHJpdmF0ZSBpbnQgd2lkdGg7ICAgICAgICAgICAgIC8qKiBUaGUgd2lkdGggb2YgdGhlIGNob3JkICovXG4gICAgcHJpdmF0ZSBTdGVtIHN0ZW0xOyAgICAgICAgICAgIC8qKiBUaGUgc3RlbSBvZiB0aGUgY2hvcmQuIENhbiBiZSBudWxsLiAqL1xuICAgIHByaXZhdGUgU3RlbSBzdGVtMjsgICAgICAgICAgICAvKiogVGhlIHNlY29uZCBzdGVtIG9mIHRoZSBjaG9yZC4gQ2FuIGJlIG51bGwgKi9cbiAgICBwcml2YXRlIGJvb2wgaGFzdHdvc3RlbXM7ICAgICAgLyoqIFRydWUgaWYgdGhpcyBjaG9yZCBoYXMgdHdvIHN0ZW1zICovXG4gICAgcHJpdmF0ZSBTaGVldE11c2ljIHNoZWV0bXVzaWM7IC8qKiBVc2VkIHRvIGdldCBjb2xvcnMgYW5kIG90aGVyIG9wdGlvbnMgKi9cblxuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBDaG9yZCBTeW1ib2wgZnJvbSB0aGUgZ2l2ZW4gbGlzdCBvZiBtaWRpIG5vdGVzLlxuICAgICAqIEFsbCB0aGUgbWlkaSBub3RlcyB3aWxsIGhhdmUgdGhlIHNhbWUgc3RhcnQgdGltZS4gIFVzZSB0aGVcbiAgICAgKiBrZXkgc2lnbmF0dXJlIHRvIGdldCB0aGUgd2hpdGUga2V5IGFuZCBhY2NpZGVudGFsIHN5bWJvbCBmb3JcbiAgICAgKiBlYWNoIG5vdGUuICBVc2UgdGhlIHRpbWUgc2lnbmF0dXJlIHRvIGNhbGN1bGF0ZSB0aGUgZHVyYXRpb25cbiAgICAgKiBvZiB0aGUgbm90ZXMuIFVzZSB0aGUgY2xlZiB3aGVuIGRyYXdpbmcgdGhlIGNob3JkLlxuICAgICAqL1xuICAgIHB1YmxpYyBDaG9yZFN5bWJvbChMaXN0PE1pZGlOb3RlPiBtaWRpbm90ZXMsIEtleVNpZ25hdHVyZSBrZXksIFxuICAgICAgICAgICAgICAgICAgICAgICBUaW1lU2lnbmF0dXJlIHRpbWUsIENsZWYgYywgU2hlZXRNdXNpYyBzaGVldCkge1xuXG4gICAgICAgIGludCBsZW4gPSBtaWRpbm90ZXMuQ291bnQ7XG4gICAgICAgIGludCBpO1xuXG4gICAgICAgIGhhc3R3b3N0ZW1zID0gZmFsc2U7XG4gICAgICAgIGNsZWYgPSBjO1xuICAgICAgICBzaGVldG11c2ljID0gc2hlZXQ7XG5cbiAgICAgICAgc3RhcnR0aW1lID0gbWlkaW5vdGVzWzBdLlN0YXJ0VGltZTtcbiAgICAgICAgZW5kdGltZSA9IG1pZGlub3Rlc1swXS5FbmRUaW1lO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBtaWRpbm90ZXMuQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgaWYgKGkgPiAxKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1pZGlub3Rlc1tpXS5OdW1iZXIgPCBtaWRpbm90ZXNbaS0xXS5OdW1iZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5c3RlbS5Bcmd1bWVudEV4Y2VwdGlvbihcIkNob3JkIG5vdGVzIG5vdCBpbiBpbmNyZWFzaW5nIG9yZGVyIGJ5IG51bWJlclwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbmR0aW1lID0gTWF0aC5NYXgoZW5kdGltZSwgbWlkaW5vdGVzW2ldLkVuZFRpbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgbm90ZWRhdGEgPSBDcmVhdGVOb3RlRGF0YShtaWRpbm90ZXMsIGtleSwgdGltZSk7XG4gICAgICAgIGFjY2lkc3ltYm9scyA9IENyZWF0ZUFjY2lkU3ltYm9scyhub3RlZGF0YSwgY2xlZik7XG5cblxuICAgICAgICAvKiBGaW5kIG91dCBob3cgbWFueSBzdGVtcyB3ZSBuZWVkICgxIG9yIDIpICovXG4gICAgICAgIE5vdGVEdXJhdGlvbiBkdXIxID0gbm90ZWRhdGFbMF0uZHVyYXRpb247XG4gICAgICAgIE5vdGVEdXJhdGlvbiBkdXIyID0gZHVyMTtcbiAgICAgICAgaW50IGNoYW5nZSA9IC0xO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbm90ZWRhdGEuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGR1cjIgPSBub3RlZGF0YVtpXS5kdXJhdGlvbjtcbiAgICAgICAgICAgIGlmIChkdXIxICE9IGR1cjIpIHtcbiAgICAgICAgICAgICAgICBjaGFuZ2UgPSBpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGR1cjEgIT0gZHVyMikge1xuICAgICAgICAgICAgLyogV2UgaGF2ZSBub3RlcyB3aXRoIGRpZmZlcmVudCBkdXJhdGlvbnMuICBTbyB3ZSB3aWxsIG5lZWRcbiAgICAgICAgICAgICAqIHR3byBzdGVtcy4gIFRoZSBmaXJzdCBzdGVtIHBvaW50cyBkb3duLCBhbmQgY29udGFpbnMgdGhlXG4gICAgICAgICAgICAgKiBib3R0b20gbm90ZSB1cCB0byB0aGUgbm90ZSB3aXRoIHRoZSBkaWZmZXJlbnQgZHVyYXRpb24uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogVGhlIHNlY29uZCBzdGVtIHBvaW50cyB1cCwgYW5kIGNvbnRhaW5zIHRoZSBub3RlIHdpdGggdGhlXG4gICAgICAgICAgICAgKiBkaWZmZXJlbnQgZHVyYXRpb24gdXAgdG8gdGhlIHRvcCBub3RlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBoYXN0d29zdGVtcyA9IHRydWU7XG4gICAgICAgICAgICBzdGVtMSA9IG5ldyBTdGVtKG5vdGVkYXRhWzBdLndoaXRlbm90ZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGVkYXRhW2NoYW5nZS0xXS53aGl0ZW5vdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR1cjEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdGVtLkRvd24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5vdGVzT3ZlcmxhcChub3RlZGF0YSwgMCwgY2hhbmdlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHN0ZW0yID0gbmV3IFN0ZW0obm90ZWRhdGFbY2hhbmdlXS53aGl0ZW5vdGUsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlZGF0YVtub3RlZGF0YS5MZW5ndGgtMV0ud2hpdGVub3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkdXIyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3RlbS5VcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTm90ZXNPdmVybGFwKG5vdGVkYXRhLCBjaGFuZ2UsIG5vdGVkYXRhLkxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLyogQWxsIG5vdGVzIGhhdmUgdGhlIHNhbWUgZHVyYXRpb24sIHNvIHdlIG9ubHkgbmVlZCBvbmUgc3RlbS4gKi9cbiAgICAgICAgICAgIGludCBkaXJlY3Rpb24gPSBTdGVtRGlyZWN0aW9uKG5vdGVkYXRhWzBdLndoaXRlbm90ZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlZGF0YVtub3RlZGF0YS5MZW5ndGgtMV0ud2hpdGVub3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlZik7XG5cbiAgICAgICAgICAgIHN0ZW0xID0gbmV3IFN0ZW0obm90ZWRhdGFbMF0ud2hpdGVub3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlZGF0YVtub3RlZGF0YS5MZW5ndGgtMV0ud2hpdGVub3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkdXIxLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOb3Rlc092ZXJsYXAobm90ZWRhdGEsIDAsIG5vdGVkYXRhLkxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgc3RlbTIgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogRm9yIHdob2xlIG5vdGVzLCBubyBzdGVtIGlzIGRyYXduLiAqL1xuICAgICAgICBpZiAoZHVyMSA9PSBOb3RlRHVyYXRpb24uV2hvbGUpXG4gICAgICAgICAgICBzdGVtMSA9IG51bGw7XG4gICAgICAgIGlmIChkdXIyID09IE5vdGVEdXJhdGlvbi5XaG9sZSlcbiAgICAgICAgICAgIHN0ZW0yID0gbnVsbDtcblxuICAgICAgICB3aWR0aCA9IE1pbldpZHRoO1xuICAgIH1cblxuXG4gICAgLyoqIEdpdmVuIHRoZSByYXcgbWlkaSBub3RlcyAodGhlIG5vdGUgbnVtYmVyIGFuZCBkdXJhdGlvbiBpbiBwdWxzZXMpLFxuICAgICAqIGNhbGN1bGF0ZSB0aGUgZm9sbG93aW5nIG5vdGUgZGF0YTpcbiAgICAgKiAtIFRoZSB3aGl0ZSBrZXlcbiAgICAgKiAtIFRoZSBhY2NpZGVudGFsIChpZiBhbnkpXG4gICAgICogLSBUaGUgbm90ZSBkdXJhdGlvbiAoaGFsZiwgcXVhcnRlciwgZWlnaHRoLCBldGMpXG4gICAgICogLSBUaGUgc2lkZSBpdCBzaG91bGQgYmUgZHJhd24gKGxlZnQgb3Igc2lkZSlcbiAgICAgKiBCeSBkZWZhdWx0LCBub3RlcyBhcmUgZHJhd24gb24gdGhlIGxlZnQgc2lkZS4gIEhvd2V2ZXIsIGlmIHR3byBub3Rlc1xuICAgICAqIG92ZXJsYXAgKGxpa2UgQSBhbmQgQikgeW91IGNhbm5vdCBkcmF3IHRoZSBuZXh0IG5vdGUgZGlyZWN0bHkgYWJvdmUgaXQuXG4gICAgICogSW5zdGVhZCB5b3UgbXVzdCBzaGlmdCBvbmUgb2YgdGhlIG5vdGVzIHRvIHRoZSByaWdodC5cbiAgICAgKlxuICAgICAqIFRoZSBLZXlTaWduYXR1cmUgaXMgdXNlZCB0byBkZXRlcm1pbmUgdGhlIHdoaXRlIGtleSBhbmQgYWNjaWRlbnRhbC5cbiAgICAgKiBUaGUgVGltZVNpZ25hdHVyZSBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgZHVyYXRpb24uXG4gICAgICovXG4gXG4gICAgcHJpdmF0ZSBzdGF0aWMgTm90ZURhdGFbXSBcbiAgICBDcmVhdGVOb3RlRGF0YShMaXN0PE1pZGlOb3RlPiBtaWRpbm90ZXMsIEtleVNpZ25hdHVyZSBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUaW1lU2lnbmF0dXJlIHRpbWUpIHtcblxuICAgICAgICBpbnQgbGVuID0gbWlkaW5vdGVzLkNvdW50O1xuICAgICAgICBOb3RlRGF0YVtdIG5vdGVkYXRhID0gbmV3IE5vdGVEYXRhW2xlbl07XG5cbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgTWlkaU5vdGUgbWlkaSA9IG1pZGlub3Rlc1tpXTtcbiAgICAgICAgICAgIG5vdGVkYXRhW2ldID0gbmV3IE5vdGVEYXRhKCk7XG4gICAgICAgICAgICBub3RlZGF0YVtpXS5udW1iZXIgPSBtaWRpLk51bWJlcjtcbiAgICAgICAgICAgIG5vdGVkYXRhW2ldLmxlZnRzaWRlID0gdHJ1ZTtcbiAgICAgICAgICAgIG5vdGVkYXRhW2ldLndoaXRlbm90ZSA9IGtleS5HZXRXaGl0ZU5vdGUobWlkaS5OdW1iZXIpO1xuICAgICAgICAgICAgbm90ZWRhdGFbaV0uZHVyYXRpb24gPSB0aW1lLkdldE5vdGVEdXJhdGlvbihtaWRpLkVuZFRpbWUgLSBtaWRpLlN0YXJ0VGltZSk7XG4gICAgICAgICAgICBub3RlZGF0YVtpXS5hY2NpZCA9IGtleS5HZXRBY2NpZGVudGFsKG1pZGkuTnVtYmVyLCBtaWRpLlN0YXJ0VGltZSAvIHRpbWUuTWVhc3VyZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChpID4gMCAmJiAobm90ZWRhdGFbaV0ud2hpdGVub3RlLkRpc3Qobm90ZWRhdGFbaS0xXS53aGl0ZW5vdGUpID09IDEpKSB7XG4gICAgICAgICAgICAgICAgLyogVGhpcyBub3RlIChub3RlZGF0YVtpXSkgb3ZlcmxhcHMgd2l0aCB0aGUgcHJldmlvdXMgbm90ZS5cbiAgICAgICAgICAgICAgICAgKiBDaGFuZ2UgdGhlIHNpZGUgb2YgdGhpcyBub3RlLlxuICAgICAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAgICAgaWYgKG5vdGVkYXRhW2ktMV0ubGVmdHNpZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm90ZWRhdGFbaV0ubGVmdHNpZGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBub3RlZGF0YVtpXS5sZWZ0c2lkZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBub3RlZGF0YVtpXS5sZWZ0c2lkZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vdGVkYXRhO1xuICAgIH1cblxuXG4gICAgLyoqIEdpdmVuIHRoZSBub3RlIGRhdGEgKHRoZSB3aGl0ZSBrZXlzIGFuZCBhY2NpZGVudGFscyksIGNyZWF0ZSBcbiAgICAgKiB0aGUgQWNjaWRlbnRhbCBTeW1ib2xzIGFuZCByZXR1cm4gdGhlbS5cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBBY2NpZFN5bWJvbFtdIFxuICAgIENyZWF0ZUFjY2lkU3ltYm9scyhOb3RlRGF0YVtdIG5vdGVkYXRhLCBDbGVmIGNsZWYpIHtcbiAgICAgICAgaW50IGNvdW50ID0gMDtcbiAgICAgICAgZm9yZWFjaCAoTm90ZURhdGEgbiBpbiBub3RlZGF0YSkge1xuICAgICAgICAgICAgaWYgKG4uYWNjaWQgIT0gQWNjaWQuTm9uZSkge1xuICAgICAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgQWNjaWRTeW1ib2xbXSBzeW1ib2xzID0gbmV3IEFjY2lkU3ltYm9sW2NvdW50XTtcbiAgICAgICAgaW50IGkgPSAwO1xuICAgICAgICBmb3JlYWNoIChOb3RlRGF0YSBuIGluIG5vdGVkYXRhKSB7XG4gICAgICAgICAgICBpZiAobi5hY2NpZCAhPSBBY2NpZC5Ob25lKSB7XG4gICAgICAgICAgICAgICAgc3ltYm9sc1tpXSA9IG5ldyBBY2NpZFN5bWJvbChuLmFjY2lkLCBuLndoaXRlbm90ZSwgY2xlZik7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzeW1ib2xzO1xuICAgIH1cblxuICAgIC8qKiBDYWxjdWxhdGUgdGhlIHN0ZW0gZGlyZWN0aW9uIChVcCBvciBkb3duKSBiYXNlZCBvbiB0aGUgdG9wIGFuZFxuICAgICAqIGJvdHRvbSBub3RlIGluIHRoZSBjaG9yZC4gIElmIHRoZSBhdmVyYWdlIG9mIHRoZSBub3RlcyBpcyBhYm92ZVxuICAgICAqIHRoZSBtaWRkbGUgb2YgdGhlIHN0YWZmLCB0aGUgZGlyZWN0aW9uIGlzIGRvd24uICBFbHNlLCB0aGVcbiAgICAgKiBkaXJlY3Rpb24gaXMgdXAuXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50IFxuICAgIFN0ZW1EaXJlY3Rpb24oV2hpdGVOb3RlIGJvdHRvbSwgV2hpdGVOb3RlIHRvcCwgQ2xlZiBjbGVmKSB7XG4gICAgICAgIFdoaXRlTm90ZSBtaWRkbGU7XG4gICAgICAgIGlmIChjbGVmID09IENsZWYuVHJlYmxlKVxuICAgICAgICAgICAgbWlkZGxlID0gbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQiwgNSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG1pZGRsZSA9IG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkQsIDMpO1xuXG4gICAgICAgIGludCBkaXN0ID0gbWlkZGxlLkRpc3QoYm90dG9tKSArIG1pZGRsZS5EaXN0KHRvcCk7XG4gICAgICAgIGlmIChkaXN0ID49IDApXG4gICAgICAgICAgICByZXR1cm4gU3RlbS5VcDtcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIHJldHVybiBTdGVtLkRvd247XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB3aGV0aGVyIGFueSBvZiB0aGUgbm90ZXMgaW4gbm90ZWRhdGEgKGJldHdlZW4gc3RhcnQgYW5kXG4gICAgICogZW5kIGluZGV4ZXMpIG92ZXJsYXAuICBUaGlzIGlzIG5lZWRlZCBieSB0aGUgU3RlbSBjbGFzcyB0b1xuICAgICAqIGRldGVybWluZSB0aGUgcG9zaXRpb24gb2YgdGhlIHN0ZW0gKGxlZnQgb3IgcmlnaHQgb2Ygbm90ZXMpLlxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGJvb2wgTm90ZXNPdmVybGFwKE5vdGVEYXRhW10gbm90ZWRhdGEsIGludCBzdGFydCwgaW50IGVuZCkge1xuICAgICAgICBmb3IgKGludCBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgICAgICAgaWYgKCFub3RlZGF0YVtpXS5sZWZ0c2lkZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSB0aW1lIChpbiBwdWxzZXMpIHRoaXMgc3ltYm9sIG9jY3VycyBhdC5cbiAgICAgKiBUaGlzIGlzIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBtZWFzdXJlIHRoaXMgc3ltYm9sIGJlbG9uZ3MgdG8uXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBTdGFydFRpbWUgeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHN0YXJ0dGltZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIGVuZCB0aW1lIChpbiBwdWxzZXMpIG9mIHRoZSBsb25nZXN0IG5vdGUgaW4gdGhlIGNob3JkLlxuICAgICAqIFVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdHdvIGFkamFjZW50IGNob3JkcyBjYW4gYmUgam9pbmVkXG4gICAgICogYnkgYSBzdGVtLlxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgRW5kVGltZSB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gZW5kdGltZTsgfVxuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIGNsZWYgdGhpcyBjaG9yZCBpcyBkcmF3biBpbi4gKi9cbiAgICBwdWJsaWMgQ2xlZiBDbGVmIHsgXG4gICAgICAgIGdldCB7IHJldHVybiBjbGVmOyB9XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0cnVlIGlmIHRoaXMgY2hvcmQgaGFzIHR3byBzdGVtcyAqL1xuICAgIHB1YmxpYyBib29sIEhhc1R3b1N0ZW1zIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIGhhc3R3b3N0ZW1zOyB9XG4gICAgfVxuXG4gICAgLyogUmV0dXJuIHRoZSBzdGVtIHdpbGwgdGhlIHNtYWxsZXN0IGR1cmF0aW9uLiAgVGhpcyBwcm9wZXJ0eVxuICAgICAqIGlzIHVzZWQgd2hlbiBtYWtpbmcgY2hvcmQgcGFpcnMgKGNob3JkcyBqb2luZWQgYnkgYSBob3Jpem9udGFsXG4gICAgICogYmVhbSBzdGVtKS4gVGhlIHN0ZW0gZHVyYXRpb25zIG11c3QgbWF0Y2ggaW4gb3JkZXIgdG8gbWFrZVxuICAgICAqIGEgY2hvcmQgcGFpci4gIElmIGEgY2hvcmQgaGFzIHR3byBzdGVtcywgd2UgYWx3YXlzIHJldHVyblxuICAgICAqIHRoZSBvbmUgd2l0aCBhIHNtYWxsZXIgZHVyYXRpb24sIGJlY2F1c2UgaXQgaGFzIGEgYmV0dGVyIFxuICAgICAqIGNoYW5jZSBvZiBtYWtpbmcgYSBwYWlyLlxuICAgICAqL1xuICAgIHB1YmxpYyBTdGVtIFN0ZW0ge1xuICAgICAgICBnZXQgeyBcbiAgICAgICAgICAgIGlmIChzdGVtMSA9PSBudWxsKSB7IHJldHVybiBzdGVtMjsgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc3RlbTIgPT0gbnVsbCkgeyByZXR1cm4gc3RlbTE7IH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHN0ZW0xLkR1cmF0aW9uIDwgc3RlbTIuRHVyYXRpb24pIHsgcmV0dXJuIHN0ZW0xOyB9XG4gICAgICAgICAgICBlbHNlIHsgcmV0dXJuIHN0ZW0yOyB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogR2V0L1NldCB0aGUgd2lkdGggKGluIHBpeGVscykgb2YgdGhpcyBzeW1ib2wuIFRoZSB3aWR0aCBpcyBzZXRcbiAgICAgKiBpbiBTaGVldE11c2ljLkFsaWduU3ltYm9scygpIHRvIHZlcnRpY2FsbHkgYWxpZ24gc3ltYm9scy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFdpZHRoIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgIHNldCB7IHdpZHRoID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBtaW5pbXVtIHdpZHRoIChpbiBwaXhlbHMpIG5lZWRlZCB0byBkcmF3IHRoaXMgc3ltYm9sICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBNaW5XaWR0aCB7XG4gICAgICAgIGdldCB7IHJldHVybiBHZXRNaW5XaWR0aCgpOyB9XG4gICAgfVxuXG4gICAgLyogUmV0dXJuIHRoZSBtaW5pbXVtIHdpZHRoIG5lZWRlZCB0byBkaXNwbGF5IHRoaXMgY2hvcmQuXG4gICAgICpcbiAgICAgKiBUaGUgYWNjaWRlbnRhbCBzeW1ib2xzIGNhbiBiZSBkcmF3biBhYm92ZSBvbmUgYW5vdGhlciBhcyBsb25nXG4gICAgICogYXMgdGhleSBkb24ndCBvdmVybGFwICh0aGV5IG11c3QgYmUgYXQgbGVhc3QgNiBub3RlcyBhcGFydCkuXG4gICAgICogSWYgdHdvIGFjY2lkZW50YWwgc3ltYm9scyBkbyBvdmVybGFwLCB0aGUgYWNjaWRlbnRhbCBzeW1ib2xcbiAgICAgKiBvbiB0b3AgbXVzdCBiZSBzaGlmdGVkIHRvIHRoZSByaWdodC4gIFNvIHRoZSB3aWR0aCBuZWVkZWQgZm9yXG4gICAgICogYWNjaWRlbnRhbCBzeW1ib2xzIGRlcGVuZHMgb24gd2hldGhlciB0aGV5IG92ZXJsYXAgb3Igbm90LlxuICAgICAqXG4gICAgICogSWYgd2UgYXJlIGFsc28gZGlzcGxheWluZyB0aGUgbGV0dGVycywgaW5jbHVkZSBleHRyYSB3aWR0aC5cbiAgICAgKi9cbiAgICBpbnQgR2V0TWluV2lkdGgoKSB7XG4gICAgICAgIC8qIFRoZSB3aWR0aCBuZWVkZWQgZm9yIHRoZSBub3RlIGNpcmNsZXMgKi9cbiAgICAgICAgaW50IHJlc3VsdCA9IDIqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjMvNDtcblxuICAgICAgICBpZiAoYWNjaWRzeW1ib2xzLkxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSBhY2NpZHN5bWJvbHNbMF0uTWluV2lkdGg7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMTsgaSA8IGFjY2lkc3ltYm9scy5MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIEFjY2lkU3ltYm9sIGFjY2lkID0gYWNjaWRzeW1ib2xzW2ldO1xuICAgICAgICAgICAgICAgIEFjY2lkU3ltYm9sIHByZXYgPSBhY2NpZHN5bWJvbHNbaS0xXTtcbiAgICAgICAgICAgICAgICBpZiAoYWNjaWQuTm90ZS5EaXN0KHByZXYuTm90ZSkgPCA2KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBhY2NpZC5NaW5XaWR0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNoZWV0bXVzaWMgIT0gbnVsbCAmJiBzaGVldG11c2ljLlNob3dOb3RlTGV0dGVycyAhPSBNaWRpT3B0aW9ucy5Ob3RlTmFtZU5vbmUpIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSA4O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYWJvdmUgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQWJvdmVTdGFmZiB7XG4gICAgICAgIGdldCB7IHJldHVybiBHZXRBYm92ZVN0YWZmKCk7IH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGludCBHZXRBYm92ZVN0YWZmKCkge1xuICAgICAgICAvKiBGaW5kIHRoZSB0b3Btb3N0IG5vdGUgaW4gdGhlIGNob3JkICovXG4gICAgICAgIFdoaXRlTm90ZSB0b3Bub3RlID0gbm90ZWRhdGFbIG5vdGVkYXRhLkxlbmd0aC0xIF0ud2hpdGVub3RlO1xuXG4gICAgICAgIC8qIFRoZSBzdGVtLkVuZCBpcyB0aGUgbm90ZSBwb3NpdGlvbiB3aGVyZSB0aGUgc3RlbSBlbmRzLlxuICAgICAgICAgKiBDaGVjayBpZiB0aGUgc3RlbSBlbmQgaXMgaGlnaGVyIHRoYW4gdGhlIHRvcCBub3RlLlxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKHN0ZW0xICE9IG51bGwpXG4gICAgICAgICAgICB0b3Bub3RlID0gV2hpdGVOb3RlLk1heCh0b3Bub3RlLCBzdGVtMS5FbmQpO1xuICAgICAgICBpZiAoc3RlbTIgIT0gbnVsbClcbiAgICAgICAgICAgIHRvcG5vdGUgPSBXaGl0ZU5vdGUuTWF4KHRvcG5vdGUsIHN0ZW0yLkVuZCk7XG5cbiAgICAgICAgaW50IGRpc3QgPSB0b3Bub3RlLkRpc3QoV2hpdGVOb3RlLlRvcChjbGVmKSkgKiBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcbiAgICAgICAgaW50IHJlc3VsdCA9IDA7XG4gICAgICAgIGlmIChkaXN0ID4gMClcbiAgICAgICAgICAgIHJlc3VsdCA9IGRpc3Q7XG5cbiAgICAgICAgLyogQ2hlY2sgaWYgYW55IGFjY2lkZW50YWwgc3ltYm9scyBleHRlbmQgYWJvdmUgdGhlIHN0YWZmICovXG4gICAgICAgIGZvcmVhY2ggKEFjY2lkU3ltYm9sIHN5bWJvbCBpbiBhY2NpZHN5bWJvbHMpIHtcbiAgICAgICAgICAgIGlmIChzeW1ib2wuQWJvdmVTdGFmZiA+IHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHN5bWJvbC5BYm92ZVN0YWZmO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGJlbG93IHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEJlbG93U3RhZmYge1xuICAgICAgICBnZXQgeyByZXR1cm4gR2V0QmVsb3dTdGFmZigpOyB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbnQgR2V0QmVsb3dTdGFmZigpIHtcbiAgICAgICAgLyogRmluZCB0aGUgYm90dG9tIG5vdGUgaW4gdGhlIGNob3JkICovXG4gICAgICAgIFdoaXRlTm90ZSBib3R0b21ub3RlID0gbm90ZWRhdGFbMF0ud2hpdGVub3RlO1xuXG4gICAgICAgIC8qIFRoZSBzdGVtLkVuZCBpcyB0aGUgbm90ZSBwb3NpdGlvbiB3aGVyZSB0aGUgc3RlbSBlbmRzLlxuICAgICAgICAgKiBDaGVjayBpZiB0aGUgc3RlbSBlbmQgaXMgbG93ZXIgdGhhbiB0aGUgYm90dG9tIG5vdGUuXG4gICAgICAgICAqL1xuICAgICAgICBpZiAoc3RlbTEgIT0gbnVsbClcbiAgICAgICAgICAgIGJvdHRvbW5vdGUgPSBXaGl0ZU5vdGUuTWluKGJvdHRvbW5vdGUsIHN0ZW0xLkVuZCk7XG4gICAgICAgIGlmIChzdGVtMiAhPSBudWxsKVxuICAgICAgICAgICAgYm90dG9tbm90ZSA9IFdoaXRlTm90ZS5NaW4oYm90dG9tbm90ZSwgc3RlbTIuRW5kKTtcblxuICAgICAgICBpbnQgZGlzdCA9IFdoaXRlTm90ZS5Cb3R0b20oY2xlZikuRGlzdChib3R0b21ub3RlKSAqXG4gICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG5cbiAgICAgICAgaW50IHJlc3VsdCA9IDA7XG4gICAgICAgIGlmIChkaXN0ID4gMClcbiAgICAgICAgICAgIHJlc3VsdCA9IGRpc3Q7XG5cbiAgICAgICAgLyogQ2hlY2sgaWYgYW55IGFjY2lkZW50YWwgc3ltYm9scyBleHRlbmQgYmVsb3cgdGhlIHN0YWZmICovIFxuICAgICAgICBmb3JlYWNoIChBY2NpZFN5bWJvbCBzeW1ib2wgaW4gYWNjaWRzeW1ib2xzKSB7XG4gICAgICAgICAgICBpZiAoc3ltYm9sLkJlbG93U3RhZmYgPiByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBzeW1ib2wuQmVsb3dTdGFmZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG5hbWUgZm9yIHRoaXMgbm90ZSAqL1xuICAgIHByaXZhdGUgc3RyaW5nIE5vdGVOYW1lKGludCBub3RlbnVtYmVyLCBXaGl0ZU5vdGUgd2hpdGVub3RlKSB7XG4gICAgICAgIGlmIChzaGVldG11c2ljLlNob3dOb3RlTGV0dGVycyA9PSBNaWRpT3B0aW9ucy5Ob3RlTmFtZUxldHRlcikge1xuICAgICAgICAgICAgcmV0dXJuIExldHRlcihub3RlbnVtYmVyLCB3aGl0ZW5vdGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHNoZWV0bXVzaWMuU2hvd05vdGVMZXR0ZXJzID09IE1pZGlPcHRpb25zLk5vdGVOYW1lRml4ZWREb1JlTWkpIHtcbiAgICAgICAgICAgIHN0cmluZ1tdIGZpeGVkRG9SZU1pID0ge1xuICAgICAgICAgICAgICAgIFwiTGFcIiwgXCJMaVwiLCBcIlRpXCIsIFwiRG9cIiwgXCJEaVwiLCBcIlJlXCIsIFwiUmlcIiwgXCJNaVwiLCBcIkZhXCIsIFwiRmlcIiwgXCJTb1wiLCBcIlNpXCIgXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaW50IG5vdGVzY2FsZSA9IE5vdGVTY2FsZS5Gcm9tTnVtYmVyKG5vdGVudW1iZXIpO1xuICAgICAgICAgICAgcmV0dXJuIGZpeGVkRG9SZU1pW25vdGVzY2FsZV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc2hlZXRtdXNpYy5TaG93Tm90ZUxldHRlcnMgPT0gTWlkaU9wdGlvbnMuTm90ZU5hbWVNb3ZhYmxlRG9SZU1pKSB7XG4gICAgICAgICAgICBzdHJpbmdbXSBmaXhlZERvUmVNaSA9IHtcbiAgICAgICAgICAgICAgICBcIkxhXCIsIFwiTGlcIiwgXCJUaVwiLCBcIkRvXCIsIFwiRGlcIiwgXCJSZVwiLCBcIlJpXCIsIFwiTWlcIiwgXCJGYVwiLCBcIkZpXCIsIFwiU29cIiwgXCJTaVwiIFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGludCBtYWluc2NhbGUgPSBzaGVldG11c2ljLk1haW5LZXkuTm90ZXNjYWxlKCk7XG4gICAgICAgICAgICBpbnQgZGlmZiA9IE5vdGVTY2FsZS5DIC0gbWFpbnNjYWxlO1xuICAgICAgICAgICAgbm90ZW51bWJlciArPSBkaWZmO1xuICAgICAgICAgICAgaWYgKG5vdGVudW1iZXIgPCAwKSB7XG4gICAgICAgICAgICAgICAgbm90ZW51bWJlciArPSAxMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGludCBub3Rlc2NhbGUgPSBOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyKTtcbiAgICAgICAgICAgIHJldHVybiBmaXhlZERvUmVNaVtub3Rlc2NhbGVdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHNoZWV0bXVzaWMuU2hvd05vdGVMZXR0ZXJzID09IE1pZGlPcHRpb25zLk5vdGVOYW1lRml4ZWROdW1iZXIpIHtcbiAgICAgICAgICAgIHN0cmluZ1tdIG51bSA9IHtcbiAgICAgICAgICAgICAgICBcIjEwXCIsIFwiMTFcIiwgXCIxMlwiLCBcIjFcIiwgXCIyXCIsIFwiM1wiLCBcIjRcIiwgXCI1XCIsIFwiNlwiLCBcIjdcIiwgXCI4XCIsIFwiOVwiIFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGludCBub3Rlc2NhbGUgPSBOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyKTtcbiAgICAgICAgICAgIHJldHVybiBudW1bbm90ZXNjYWxlXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzaGVldG11c2ljLlNob3dOb3RlTGV0dGVycyA9PSBNaWRpT3B0aW9ucy5Ob3RlTmFtZU1vdmFibGVOdW1iZXIpIHtcbiAgICAgICAgICAgIHN0cmluZ1tdIG51bSA9IHtcbiAgICAgICAgICAgICAgICBcIjEwXCIsIFwiMTFcIiwgXCIxMlwiLCBcIjFcIiwgXCIyXCIsIFwiM1wiLCBcIjRcIiwgXCI1XCIsIFwiNlwiLCBcIjdcIiwgXCI4XCIsIFwiOVwiIFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGludCBtYWluc2NhbGUgPSBzaGVldG11c2ljLk1haW5LZXkuTm90ZXNjYWxlKCk7XG4gICAgICAgICAgICBpbnQgZGlmZiA9IE5vdGVTY2FsZS5DIC0gbWFpbnNjYWxlO1xuICAgICAgICAgICAgbm90ZW51bWJlciArPSBkaWZmO1xuICAgICAgICAgICAgaWYgKG5vdGVudW1iZXIgPCAwKSB7XG4gICAgICAgICAgICAgICAgbm90ZW51bWJlciArPSAxMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGludCBub3Rlc2NhbGUgPSBOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyKTtcbiAgICAgICAgICAgIHJldHVybiBudW1bbm90ZXNjYWxlXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbGV0dGVyIChBLCBBIywgQmIpIHJlcHJlc2VudGluZyB0aGlzIG5vdGUgKi9cbiAgICBwcml2YXRlIHN0cmluZyBMZXR0ZXIoaW50IG5vdGVudW1iZXIsIFdoaXRlTm90ZSB3aGl0ZW5vdGUpIHtcbiAgICAgICAgaW50IG5vdGVzY2FsZSA9IE5vdGVTY2FsZS5Gcm9tTnVtYmVyKG5vdGVudW1iZXIpO1xuICAgICAgICBzd2l0Y2gobm90ZXNjYWxlKSB7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5BOiByZXR1cm4gXCJBXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5COiByZXR1cm4gXCJCXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5DOiByZXR1cm4gXCJDXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5EOiByZXR1cm4gXCJEXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5FOiByZXR1cm4gXCJFXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5GOiByZXR1cm4gXCJGXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5HOiByZXR1cm4gXCJHXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5Bc2hhcnA6XG4gICAgICAgICAgICAgICAgaWYgKHdoaXRlbm90ZS5MZXR0ZXIgPT0gV2hpdGVOb3RlLkEpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIkEjXCI7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJCYlwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQ3NoYXJwOlxuICAgICAgICAgICAgICAgIGlmICh3aGl0ZW5vdGUuTGV0dGVyID09IFdoaXRlTm90ZS5DKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJDI1wiO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiRGJcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkRzaGFycDpcbiAgICAgICAgICAgICAgICBpZiAod2hpdGVub3RlLkxldHRlciA9PSBXaGl0ZU5vdGUuRClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiRCNcIjtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIkViXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5Gc2hhcnA6XG4gICAgICAgICAgICAgICAgaWYgKHdoaXRlbm90ZS5MZXR0ZXIgPT0gV2hpdGVOb3RlLkYpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIkYjXCI7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJHYlwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuR3NoYXJwOlxuICAgICAgICAgICAgICAgIGlmICh3aGl0ZW5vdGUuTGV0dGVyID09IFdoaXRlTm90ZS5HKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJHI1wiO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiQWJcIjtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgQ2hvcmQgU3ltYm9sOlxuICAgICAqIC0gRHJhdyB0aGUgYWNjaWRlbnRhbCBzeW1ib2xzLlxuICAgICAqIC0gRHJhdyB0aGUgYmxhY2sgY2lyY2xlIG5vdGVzLlxuICAgICAqIC0gRHJhdyB0aGUgc3RlbXMuXG4gICAgICBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIC8qIEFsaWduIHRoZSBjaG9yZCB0byB0aGUgcmlnaHQgKi9cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oV2lkdGggLSBNaW5XaWR0aCwgMCk7XG5cbiAgICAgICAgLyogRHJhdyB0aGUgYWNjaWRlbnRhbHMuICovXG4gICAgICAgIFdoaXRlTm90ZSB0b3BzdGFmZiA9IFdoaXRlTm90ZS5Ub3AoY2xlZik7XG4gICAgICAgIGludCB4cG9zID0gRHJhd0FjY2lkKGcsIHBlbiwgeXRvcCk7XG5cbiAgICAgICAgLyogRHJhdyB0aGUgbm90ZXMgKi9cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeHBvcywgMCk7XG4gICAgICAgIERyYXdOb3RlcyhnLCBwZW4sIHl0b3AsIHRvcHN0YWZmKTtcbiAgICAgICAgaWYgKHNoZWV0bXVzaWMgIT0gbnVsbCAmJiBzaGVldG11c2ljLlNob3dOb3RlTGV0dGVycyAhPSAwKSB7XG4gICAgICAgICAgICBEcmF3Tm90ZUxldHRlcnMoZywgcGVuLCB5dG9wLCB0b3BzdGFmZik7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBEcmF3IHRoZSBzdGVtcyAqL1xuICAgICAgICBpZiAoc3RlbTEgIT0gbnVsbClcbiAgICAgICAgICAgIHN0ZW0xLkRyYXcoZywgcGVuLCB5dG9wLCB0b3BzdGFmZik7XG4gICAgICAgIGlmIChzdGVtMiAhPSBudWxsKVxuICAgICAgICAgICAgc3RlbTIuRHJhdyhnLCBwZW4sIHl0b3AsIHRvcHN0YWZmKTtcblxuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgteHBvcywgMCk7XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0oV2lkdGggLSBNaW5XaWR0aCksIDApO1xuICAgIH1cblxuICAgIC8qIERyYXcgdGhlIGFjY2lkZW50YWwgc3ltYm9scy4gIElmIHR3byBzeW1ib2xzIG92ZXJsYXAgKGlmIHRoZXlcbiAgICAgKiBhcmUgbGVzcyB0aGFuIDYgbm90ZXMgYXBhcnQpLCB3ZSBjYW5ub3QgZHJhdyB0aGUgc3ltYm9sIGRpcmVjdGx5XG4gICAgICogYWJvdmUgdGhlIHByZXZpb3VzIG9uZS4gIEluc3RlYWQsIHdlIG11c3Qgc2hpZnQgaXQgdG8gdGhlIHJpZ2h0LlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEByZXR1cm4gVGhlIHggcGl4ZWwgd2lkdGggdXNlZCBieSBhbGwgdGhlIGFjY2lkZW50YWxzLlxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgRHJhd0FjY2lkKEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIGludCB4cG9zID0gMDtcblxuICAgICAgICBBY2NpZFN5bWJvbCBwcmV2ID0gbnVsbDtcbiAgICAgICAgZm9yZWFjaCAoQWNjaWRTeW1ib2wgc3ltYm9sIGluIGFjY2lkc3ltYm9scykge1xuICAgICAgICAgICAgaWYgKHByZXYgIT0gbnVsbCAmJiBzeW1ib2wuTm90ZS5EaXN0KHByZXYuTm90ZSkgPCA2KSB7XG4gICAgICAgICAgICAgICAgeHBvcyArPSBzeW1ib2wuV2lkdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSh4cG9zLCAwKTtcbiAgICAgICAgICAgIHN5bWJvbC5EcmF3KGcsIHBlbiwgeXRvcCk7XG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgteHBvcywgMCk7XG4gICAgICAgICAgICBwcmV2ID0gc3ltYm9sO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcmV2ICE9IG51bGwpIHtcbiAgICAgICAgICAgIHhwb3MgKz0gcHJldi5XaWR0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geHBvcztcbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgYmxhY2sgY2lyY2xlIG5vdGVzLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEBwYXJhbSB0b3BzdGFmZiBUaGUgd2hpdGUgbm90ZSBvZiB0aGUgdG9wIG9mIHRoZSBzdGFmZi5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3Tm90ZXMoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3AsIFdoaXRlTm90ZSB0b3BzdGFmZikge1xuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgICAgICBmb3JlYWNoIChOb3RlRGF0YSBub3RlIGluIG5vdGVkYXRhKSB7XG4gICAgICAgICAgICAvKiBHZXQgdGhlIHgseSBwb3NpdGlvbiB0byBkcmF3IHRoZSBub3RlICovXG4gICAgICAgICAgICBpbnQgeW5vdGUgPSB5dG9wICsgdG9wc3RhZmYuRGlzdChub3RlLndoaXRlbm90ZSkgKiBcbiAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG4gICAgICAgICAgICBpbnQgeG5vdGUgPSBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuICAgICAgICAgICAgaWYgKCFub3RlLmxlZnRzaWRlKVxuICAgICAgICAgICAgICAgIHhub3RlICs9IFNoZWV0TXVzaWMuTm90ZVdpZHRoO1xuXG4gICAgICAgICAgICAvKiBEcmF3IHJvdGF0ZWQgZWxsaXBzZS4gIFlvdSBtdXN0IGZpcnN0IHRyYW5zbGF0ZSAoMCwwKVxuICAgICAgICAgICAgICogdG8gdGhlIGNlbnRlciBvZiB0aGUgZWxsaXBzZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeG5vdGUgKyBTaGVldE11c2ljLk5vdGVXaWR0aC8yICsgMSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5bm90ZSAtIFNoZWV0TXVzaWMuTGluZVdpZHRoICsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQvMik7XG4gICAgICAgICAgICBnLlJvdGF0ZVRyYW5zZm9ybSgtNDUpO1xuXG4gICAgICAgICAgICBpZiAoc2hlZXRtdXNpYyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcGVuLkNvbG9yID0gc2hlZXRtdXNpYy5Ob3RlQ29sb3Iobm90ZS5udW1iZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcGVuLkNvbG9yID0gQ29sb3IuQmxhY2s7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChub3RlLmR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5XaG9sZSB8fCBcbiAgICAgICAgICAgICAgICBub3RlLmR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5IYWxmIHx8XG4gICAgICAgICAgICAgICAgbm90ZS5kdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkSGFsZikge1xuXG4gICAgICAgICAgICAgICAgZy5EcmF3RWxsaXBzZShwZW4sIC1TaGVldE11c2ljLk5vdGVXaWR0aC8yLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC1TaGVldE11c2ljLk5vdGVIZWlnaHQvMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZVdpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LTEpO1xuXG4gICAgICAgICAgICAgICAgZy5EcmF3RWxsaXBzZShwZW4sIC1TaGVldE11c2ljLk5vdGVXaWR0aC8yLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC1TaGVldE11c2ljLk5vdGVIZWlnaHQvMiArIDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC0yKTtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0VsbGlwc2UocGVuLCAtU2hlZXRNdXNpYy5Ob3RlV2lkdGgvMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgKyAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQtMyk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIEJydXNoIGJydXNoID0gQnJ1c2hlcy5CbGFjaztcbiAgICAgICAgICAgICAgICBpZiAocGVuLkNvbG9yICE9IENvbG9yLkJsYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGJydXNoID0gbmV3IFNvbGlkQnJ1c2gocGVuLkNvbG9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZy5GaWxsRWxsaXBzZShicnVzaCwgLVNoZWV0TXVzaWMuTm90ZVdpZHRoLzIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLVNoZWV0TXVzaWMuTm90ZUhlaWdodC8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQtMSk7XG4gICAgICAgICAgICAgICAgaWYgKHBlbi5Db2xvciAhPSBDb2xvci5CbGFjaykge1xuICAgICAgICAgICAgICAgICAgICBicnVzaC5EaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwZW4uQ29sb3IgPSBDb2xvci5CbGFjaztcbiAgICAgICAgICAgIGcuRHJhd0VsbGlwc2UocGVuLCAtU2hlZXRNdXNpYy5Ob3RlV2lkdGgvMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC1TaGVldE11c2ljLk5vdGVIZWlnaHQvMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZVdpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LTEpO1xuXG4gICAgICAgICAgICBnLlJvdGF0ZVRyYW5zZm9ybSg0NSk7XG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSggLSAoeG5vdGUgKyBTaGVldE11c2ljLk5vdGVXaWR0aC8yICsgMSksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gKHlub3RlIC0gU2hlZXRNdXNpYy5MaW5lV2lkdGggKyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQvMikpO1xuXG4gICAgICAgICAgICAvKiBEcmF3IGEgZG90IGlmIHRoaXMgaXMgYSBkb3R0ZWQgZHVyYXRpb24uICovXG4gICAgICAgICAgICBpZiAobm90ZS5kdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkSGFsZiB8fFxuICAgICAgICAgICAgICAgIG5vdGUuZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZFF1YXJ0ZXIgfHxcbiAgICAgICAgICAgICAgICBub3RlLmR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGgpIHtcblxuICAgICAgICAgICAgICAgIGcuRmlsbEVsbGlwc2UoQnJ1c2hlcy5CbGFjaywgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4bm90ZSArIFNoZWV0TXVzaWMuTm90ZVdpZHRoICsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxpbmVTcGFjZS8zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeW5vdGUgKyBTaGVldE11c2ljLkxpbmVTcGFjZS8zLCA0LCA0KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBEcmF3IGhvcml6b250YWwgbGluZXMgaWYgbm90ZSBpcyBhYm92ZS9iZWxvdyB0aGUgc3RhZmYgKi9cbiAgICAgICAgICAgIFdoaXRlTm90ZSB0b3AgPSB0b3BzdGFmZi5BZGQoMSk7XG4gICAgICAgICAgICBpbnQgZGlzdCA9IG5vdGUud2hpdGVub3RlLkRpc3QodG9wKTtcbiAgICAgICAgICAgIGludCB5ID0geXRvcCAtIFNoZWV0TXVzaWMuTGluZVdpZHRoO1xuXG4gICAgICAgICAgICBpZiAoZGlzdCA+PSAyKSB7XG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDI7IGkgPD0gZGlzdDsgaSArPSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIHkgLT0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeG5vdGUgLSBTaGVldE11c2ljLkxpbmVTcGFjZS80LCB5LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhub3RlICsgU2hlZXRNdXNpYy5Ob3RlV2lkdGggKyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQsIHkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgV2hpdGVOb3RlIGJvdHRvbSA9IHRvcC5BZGQoLTgpO1xuICAgICAgICAgICAgeSA9IHl0b3AgKyAoU2hlZXRNdXNpYy5MaW5lU3BhY2UgKyBTaGVldE11c2ljLkxpbmVXaWR0aCkgKiA0IC0gMTtcbiAgICAgICAgICAgIGRpc3QgPSBib3R0b20uRGlzdChub3RlLndoaXRlbm90ZSk7XG4gICAgICAgICAgICBpZiAoZGlzdCA+PSAyKSB7XG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDI7IGkgPD0gZGlzdDsgaSs9IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgeSArPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4bm90ZSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQsIHksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeG5vdGUgKyBTaGVldE11c2ljLk5vdGVXaWR0aCArIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCwgeSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyogRW5kIGRyYXdpbmcgaG9yaXpvbnRhbCBsaW5lcyAqL1xuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgbm90ZSBsZXR0ZXJzIChBLCBBIywgQmIsIGV0YykgbmV4dCB0byB0aGUgbm90ZSBjaXJjbGVzLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEBwYXJhbSB0b3BzdGFmZiBUaGUgd2hpdGUgbm90ZSBvZiB0aGUgdG9wIG9mIHRoZSBzdGFmZi5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3Tm90ZUxldHRlcnMoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3AsIFdoaXRlTm90ZSB0b3BzdGFmZikge1xuICAgICAgICBib29sIG92ZXJsYXAgPSBOb3Rlc092ZXJsYXAobm90ZWRhdGEsIDAsIG5vdGVkYXRhLkxlbmd0aCk7XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG5cbiAgICAgICAgZm9yZWFjaCAoTm90ZURhdGEgbm90ZSBpbiBub3RlZGF0YSkge1xuICAgICAgICAgICAgaWYgKCFub3RlLmxlZnRzaWRlKSB7XG4gICAgICAgICAgICAgICAgLyogVGhlcmUncyBub3QgZW5vdWdodCBwaXhlbCByb29tIHRvIHNob3cgdGhlIGxldHRlciAqL1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBHZXQgdGhlIHgseSBwb3NpdGlvbiB0byBkcmF3IHRoZSBub3RlICovXG4gICAgICAgICAgICBpbnQgeW5vdGUgPSB5dG9wICsgdG9wc3RhZmYuRGlzdChub3RlLndoaXRlbm90ZSkgKiBcbiAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG4gICAgICAgICAgICAvKiBEcmF3IHRoZSBsZXR0ZXIgdG8gdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIG5vdGUgKi9cbiAgICAgICAgICAgIGludCB4bm90ZSA9IFNoZWV0TXVzaWMuTm90ZVdpZHRoICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvNDtcblxuICAgICAgICAgICAgaWYgKG5vdGUuZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEhhbGYgfHxcbiAgICAgICAgICAgICAgICBub3RlLmR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRRdWFydGVyIHx8XG4gICAgICAgICAgICAgICAgbm90ZS5kdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoIHx8IG92ZXJsYXApIHtcblxuICAgICAgICAgICAgICAgIHhub3RlICs9IFNoZWV0TXVzaWMuTm90ZVdpZHRoLzI7XG4gICAgICAgICAgICB9IFxuICAgICAgICAgICAgZy5EcmF3U3RyaW5nKE5vdGVOYW1lKG5vdGUubnVtYmVyLCBub3RlLndoaXRlbm90ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5MZXR0ZXJGb250LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICBCcnVzaGVzLkJsYWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHhub3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHlub3RlIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKiogUmV0dXJuIHRydWUgaWYgdGhlIGNob3JkcyBjYW4gYmUgY29ubmVjdGVkLCB3aGVyZSB0aGVpciBzdGVtcyBhcmVcbiAgICAgKiBqb2luZWQgYnkgYSBob3Jpem9udGFsIGJlYW0uIEluIG9yZGVyIHRvIGNyZWF0ZSB0aGUgYmVhbTpcbiAgICAgKlxuICAgICAqIC0gVGhlIGNob3JkcyBtdXN0IGJlIGluIHRoZSBzYW1lIG1lYXN1cmUuXG4gICAgICogLSBUaGUgY2hvcmQgc3RlbXMgc2hvdWxkIG5vdCBiZSBhIGRvdHRlZCBkdXJhdGlvbi5cbiAgICAgKiAtIFRoZSBjaG9yZCBzdGVtcyBtdXN0IGJlIHRoZSBzYW1lIGR1cmF0aW9uLCB3aXRoIG9uZSBleGNlcHRpb25cbiAgICAgKiAgIChEb3R0ZWQgRWlnaHRoIHRvIFNpeHRlZW50aCkuXG4gICAgICogLSBUaGUgc3RlbXMgbXVzdCBhbGwgcG9pbnQgaW4gdGhlIHNhbWUgZGlyZWN0aW9uICh1cCBvciBkb3duKS5cbiAgICAgKiAtIFRoZSBjaG9yZCBjYW5ub3QgYWxyZWFkeSBiZSBwYXJ0IG9mIGEgYmVhbS5cbiAgICAgKlxuICAgICAqIC0gNi1jaG9yZCBiZWFtcyBtdXN0IGJlIDh0aCBub3RlcyBpbiAzLzQsIDYvOCwgb3IgNi80IHRpbWVcbiAgICAgKiAtIDMtY2hvcmQgYmVhbXMgbXVzdCBiZSBlaXRoZXIgdHJpcGxldHMsIG9yIDh0aCBub3RlcyAoMTIvOCB0aW1lIHNpZ25hdHVyZSlcbiAgICAgKiAtIDQtY2hvcmQgYmVhbXMgYXJlIG9rIGZvciAyLzIsIDIvNCBvciA0LzQgdGltZSwgYW55IGR1cmF0aW9uXG4gICAgICogLSA0LWNob3JkIGJlYW1zIGFyZSBvayBmb3Igb3RoZXIgdGltZXMgaWYgdGhlIGR1cmF0aW9uIGlzIDE2dGhcbiAgICAgKiAtIDItY2hvcmQgYmVhbXMgYXJlIG9rIGZvciBhbnkgZHVyYXRpb25cbiAgICAgKlxuICAgICAqIElmIHN0YXJ0UXVhcnRlciBpcyB0cnVlLCB0aGUgZmlyc3Qgbm90ZSBzaG91bGQgc3RhcnQgb24gYSBxdWFydGVyIG5vdGVcbiAgICAgKiAob25seSBhcHBsaWVzIHRvIDItY2hvcmQgYmVhbXMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgXG4gICAgYm9vbCBDYW5DcmVhdGVCZWFtKENob3JkU3ltYm9sW10gY2hvcmRzLCBUaW1lU2lnbmF0dXJlIHRpbWUsIGJvb2wgc3RhcnRRdWFydGVyKSB7XG4gICAgICAgIGludCBudW1DaG9yZHMgPSBjaG9yZHMuTGVuZ3RoO1xuICAgICAgICBTdGVtIGZpcnN0U3RlbSA9IGNob3Jkc1swXS5TdGVtO1xuICAgICAgICBTdGVtIGxhc3RTdGVtID0gY2hvcmRzW2Nob3Jkcy5MZW5ndGgtMV0uU3RlbTtcbiAgICAgICAgaWYgKGZpcnN0U3RlbSA9PSBudWxsIHx8IGxhc3RTdGVtID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpbnQgbWVhc3VyZSA9IGNob3Jkc1swXS5TdGFydFRpbWUgLyB0aW1lLk1lYXN1cmU7XG4gICAgICAgIE5vdGVEdXJhdGlvbiBkdXIgPSBmaXJzdFN0ZW0uRHVyYXRpb247XG4gICAgICAgIE5vdGVEdXJhdGlvbiBkdXIyID0gbGFzdFN0ZW0uRHVyYXRpb247XG5cbiAgICAgICAgYm9vbCBkb3R0ZWQ4X3RvXzE2ID0gZmFsc2U7XG4gICAgICAgIGlmIChjaG9yZHMuTGVuZ3RoID09IDIgJiYgZHVyID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGggJiZcbiAgICAgICAgICAgIGR1cjIgPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCkge1xuICAgICAgICAgICAgZG90dGVkOF90b18xNiA9IHRydWU7XG4gICAgICAgIH0gXG5cbiAgICAgICAgaWYgKGR1ciA9PSBOb3RlRHVyYXRpb24uV2hvbGUgfHwgZHVyID09IE5vdGVEdXJhdGlvbi5IYWxmIHx8XG4gICAgICAgICAgICBkdXIgPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEhhbGYgfHwgZHVyID09IE5vdGVEdXJhdGlvbi5RdWFydGVyIHx8XG4gICAgICAgICAgICBkdXIgPT0gTm90ZUR1cmF0aW9uLkRvdHRlZFF1YXJ0ZXIgfHxcbiAgICAgICAgICAgIChkdXIgPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCAmJiAhZG90dGVkOF90b18xNikpIHtcblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG51bUNob3JkcyA9PSA2KSB7XG4gICAgICAgICAgICBpZiAoZHVyICE9IE5vdGVEdXJhdGlvbi5FaWdodGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBib29sIGNvcnJlY3RUaW1lID0gXG4gICAgICAgICAgICAgICAoKHRpbWUuTnVtZXJhdG9yID09IDMgJiYgdGltZS5EZW5vbWluYXRvciA9PSA0KSB8fFxuICAgICAgICAgICAgICAgICh0aW1lLk51bWVyYXRvciA9PSA2ICYmIHRpbWUuRGVub21pbmF0b3IgPT0gOCkgfHxcbiAgICAgICAgICAgICAgICAodGltZS5OdW1lcmF0b3IgPT0gNiAmJiB0aW1lLkRlbm9taW5hdG9yID09IDQpICk7XG5cbiAgICAgICAgICAgIGlmICghY29ycmVjdFRpbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aW1lLk51bWVyYXRvciA9PSA2ICYmIHRpbWUuRGVub21pbmF0b3IgPT0gNCkge1xuICAgICAgICAgICAgICAgIC8qIGZpcnN0IGNob3JkIG11c3Qgc3RhcnQgYXQgMXN0IG9yIDR0aCBxdWFydGVyIG5vdGUgKi9cbiAgICAgICAgICAgICAgICBpbnQgYmVhdCA9IHRpbWUuUXVhcnRlciAqIDM7XG4gICAgICAgICAgICAgICAgaWYgKChjaG9yZHNbMF0uU3RhcnRUaW1lICUgYmVhdCkgPiB0aW1lLlF1YXJ0ZXIvNikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChudW1DaG9yZHMgPT0gNCkge1xuICAgICAgICAgICAgaWYgKHRpbWUuTnVtZXJhdG9yID09IDMgJiYgdGltZS5EZW5vbWluYXRvciA9PSA4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYm9vbCBjb3JyZWN0VGltZSA9IFxuICAgICAgICAgICAgICAodGltZS5OdW1lcmF0b3IgPT0gMiB8fCB0aW1lLk51bWVyYXRvciA9PSA0IHx8IHRpbWUuTnVtZXJhdG9yID09IDgpO1xuICAgICAgICAgICAgaWYgKCFjb3JyZWN0VGltZSAmJiBkdXIgIT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogY2hvcmQgbXVzdCBzdGFydCBvbiBxdWFydGVyIG5vdGUgKi9cbiAgICAgICAgICAgIGludCBiZWF0ID0gdGltZS5RdWFydGVyO1xuICAgICAgICAgICAgaWYgKGR1ciA9PSBOb3RlRHVyYXRpb24uRWlnaHRoKSB7XG4gICAgICAgICAgICAgICAgLyogOHRoIG5vdGUgY2hvcmQgbXVzdCBzdGFydCBvbiAxc3Qgb3IgM3JkIHF1YXJ0ZXIgbm90ZSAqL1xuICAgICAgICAgICAgICAgIGJlYXQgPSB0aW1lLlF1YXJ0ZXIgKiAyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZHVyID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcbiAgICAgICAgICAgICAgICAvKiAzMm5kIG5vdGUgbXVzdCBzdGFydCBvbiBhbiA4dGggYmVhdCAqL1xuICAgICAgICAgICAgICAgIGJlYXQgPSB0aW1lLlF1YXJ0ZXIgLyAyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoKGNob3Jkc1swXS5TdGFydFRpbWUgJSBiZWF0KSA+IHRpbWUuUXVhcnRlci82KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG51bUNob3JkcyA9PSAzKSB7XG4gICAgICAgICAgICBib29sIHZhbGlkID0gKGR1ciA9PSBOb3RlRHVyYXRpb24uVHJpcGxldCkgfHwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgIChkdXIgPT0gTm90ZUR1cmF0aW9uLkVpZ2h0aCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5OdW1lcmF0b3IgPT0gMTIgJiYgdGltZS5EZW5vbWluYXRvciA9PSA4KTtcbiAgICAgICAgICAgIGlmICghdmFsaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIGNob3JkIG11c3Qgc3RhcnQgb24gcXVhcnRlciBub3RlICovXG4gICAgICAgICAgICBpbnQgYmVhdCA9IHRpbWUuUXVhcnRlcjtcbiAgICAgICAgICAgIGlmICh0aW1lLk51bWVyYXRvciA9PSAxMiAmJiB0aW1lLkRlbm9taW5hdG9yID09IDgpIHtcbiAgICAgICAgICAgICAgICAvKiBJbiAxMi84IHRpbWUsIGNob3JkIG11c3Qgc3RhcnQgb24gMyo4dGggYmVhdCAqL1xuICAgICAgICAgICAgICAgIGJlYXQgPSB0aW1lLlF1YXJ0ZXIvMiAqIDM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoKGNob3Jkc1swXS5TdGFydFRpbWUgJSBiZWF0KSA+IHRpbWUuUXVhcnRlci82KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZWxzZSBpZiAobnVtQ2hvcmRzID09IDIpIHtcbiAgICAgICAgICAgIGlmIChzdGFydFF1YXJ0ZXIpIHtcbiAgICAgICAgICAgICAgICBpbnQgYmVhdCA9IHRpbWUuUXVhcnRlcjtcbiAgICAgICAgICAgICAgICBpZiAoKGNob3Jkc1swXS5TdGFydFRpbWUgJSBiZWF0KSA+IHRpbWUuUXVhcnRlci82KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3JlYWNoIChDaG9yZFN5bWJvbCBjaG9yZCBpbiBjaG9yZHMpIHtcbiAgICAgICAgICAgIGlmICgoY2hvcmQuU3RhcnRUaW1lIC8gdGltZS5NZWFzdXJlKSAhPSBtZWFzdXJlKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmIChjaG9yZC5TdGVtID09IG51bGwpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgaWYgKGNob3JkLlN0ZW0uRHVyYXRpb24gIT0gZHVyICYmICFkb3R0ZWQ4X3RvXzE2KVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmIChjaG9yZC5TdGVtLmlzQmVhbSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBDaGVjayB0aGF0IGFsbCBzdGVtcyBjYW4gcG9pbnQgaW4gc2FtZSBkaXJlY3Rpb24gKi9cbiAgICAgICAgYm9vbCBoYXNUd29TdGVtcyA9IGZhbHNlO1xuICAgICAgICBpbnQgZGlyZWN0aW9uID0gU3RlbS5VcDsgXG4gICAgICAgIGZvcmVhY2ggKENob3JkU3ltYm9sIGNob3JkIGluIGNob3Jkcykge1xuICAgICAgICAgICAgaWYgKGNob3JkLkhhc1R3b1N0ZW1zKSB7XG4gICAgICAgICAgICAgICAgaWYgKGhhc1R3b1N0ZW1zICYmIGNob3JkLlN0ZW0uRGlyZWN0aW9uICE9IGRpcmVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGhhc1R3b1N0ZW1zID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSBjaG9yZC5TdGVtLkRpcmVjdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIEdldCB0aGUgZmluYWwgc3RlbSBkaXJlY3Rpb24gKi9cbiAgICAgICAgaWYgKCFoYXNUd29TdGVtcykge1xuICAgICAgICAgICAgV2hpdGVOb3RlIG5vdGUxO1xuICAgICAgICAgICAgV2hpdGVOb3RlIG5vdGUyO1xuICAgICAgICAgICAgbm90ZTEgPSAoZmlyc3RTdGVtLkRpcmVjdGlvbiA9PSBTdGVtLlVwID8gZmlyc3RTdGVtLlRvcCA6IGZpcnN0U3RlbS5Cb3R0b20pO1xuICAgICAgICAgICAgbm90ZTIgPSAobGFzdFN0ZW0uRGlyZWN0aW9uID09IFN0ZW0uVXAgPyBsYXN0U3RlbS5Ub3AgOiBsYXN0U3RlbS5Cb3R0b20pO1xuICAgICAgICAgICAgZGlyZWN0aW9uID0gU3RlbURpcmVjdGlvbihub3RlMSwgbm90ZTIsIGNob3Jkc1swXS5DbGVmKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIElmIHRoZSBub3RlcyBhcmUgdG9vIGZhciBhcGFydCwgZG9uJ3QgdXNlIGEgYmVhbSAqL1xuICAgICAgICBpZiAoZGlyZWN0aW9uID09IFN0ZW0uVXApIHtcbiAgICAgICAgICAgIGlmIChNYXRoLkFicyhmaXJzdFN0ZW0uVG9wLkRpc3QobGFzdFN0ZW0uVG9wKSkgPj0gMTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoTWF0aC5BYnMoZmlyc3RTdGVtLkJvdHRvbS5EaXN0KGxhc3RTdGVtLkJvdHRvbSkpID49IDExKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuXG4gICAgLyoqIENvbm5lY3QgdGhlIGNob3JkcyB1c2luZyBhIGhvcml6b250YWwgYmVhbS4gXG4gICAgICpcbiAgICAgKiBzcGFjaW5nIGlzIHRoZSBob3Jpem9udGFsIGRpc3RhbmNlIChpbiBwaXhlbHMpIGJldHdlZW4gdGhlIHJpZ2h0IHNpZGUgXG4gICAgICogb2YgdGhlIGZpcnN0IGNob3JkLCBhbmQgdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIGxhc3QgY2hvcmQuXG4gICAgICpcbiAgICAgKiBUbyBtYWtlIHRoZSBiZWFtOlxuICAgICAqIC0gQ2hhbmdlIHRoZSBzdGVtIGRpcmVjdGlvbnMgZm9yIGVhY2ggY2hvcmQsIHNvIHRoZXkgbWF0Y2guXG4gICAgICogLSBJbiB0aGUgZmlyc3QgY2hvcmQsIHBhc3MgdGhlIHN0ZW0gbG9jYXRpb24gb2YgdGhlIGxhc3QgY2hvcmQsIGFuZFxuICAgICAqICAgdGhlIGhvcml6b250YWwgc3BhY2luZyB0byB0aGF0IGxhc3Qgc3RlbS5cbiAgICAgKiAtIE1hcmsgYWxsIGNob3JkcyAoZXhjZXB0IHRoZSBmaXJzdCkgYXMgXCJyZWNlaXZlclwiIHBhaXJzLCBzbyB0aGF0IFxuICAgICAqICAgdGhleSBkb24ndCBkcmF3IGEgY3Vydnkgc3RlbS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIFxuICAgIHZvaWQgQ3JlYXRlQmVhbShDaG9yZFN5bWJvbFtdIGNob3JkcywgaW50IHNwYWNpbmcpIHtcbiAgICAgICAgU3RlbSBmaXJzdFN0ZW0gPSBjaG9yZHNbMF0uU3RlbTtcbiAgICAgICAgU3RlbSBsYXN0U3RlbSA9IGNob3Jkc1tjaG9yZHMuTGVuZ3RoLTFdLlN0ZW07XG5cbiAgICAgICAgLyogQ2FsY3VsYXRlIHRoZSBuZXcgc3RlbSBkaXJlY3Rpb24gKi9cbiAgICAgICAgaW50IG5ld2RpcmVjdGlvbiA9IC0xO1xuICAgICAgICBmb3JlYWNoIChDaG9yZFN5bWJvbCBjaG9yZCBpbiBjaG9yZHMpIHtcbiAgICAgICAgICAgIGlmIChjaG9yZC5IYXNUd29TdGVtcykge1xuICAgICAgICAgICAgICAgIG5ld2RpcmVjdGlvbiA9IGNob3JkLlN0ZW0uRGlyZWN0aW9uO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5ld2RpcmVjdGlvbiA9PSAtMSkge1xuICAgICAgICAgICAgV2hpdGVOb3RlIG5vdGUxO1xuICAgICAgICAgICAgV2hpdGVOb3RlIG5vdGUyO1xuICAgICAgICAgICAgbm90ZTEgPSAoZmlyc3RTdGVtLkRpcmVjdGlvbiA9PSBTdGVtLlVwID8gZmlyc3RTdGVtLlRvcCA6IGZpcnN0U3RlbS5Cb3R0b20pO1xuICAgICAgICAgICAgbm90ZTIgPSAobGFzdFN0ZW0uRGlyZWN0aW9uID09IFN0ZW0uVXAgPyBsYXN0U3RlbS5Ub3AgOiBsYXN0U3RlbS5Cb3R0b20pO1xuICAgICAgICAgICAgbmV3ZGlyZWN0aW9uID0gU3RlbURpcmVjdGlvbihub3RlMSwgbm90ZTIsIGNob3Jkc1swXS5DbGVmKTtcbiAgICAgICAgfVxuICAgICAgICBmb3JlYWNoIChDaG9yZFN5bWJvbCBjaG9yZCBpbiBjaG9yZHMpIHtcbiAgICAgICAgICAgIGNob3JkLlN0ZW0uRGlyZWN0aW9uID0gbmV3ZGlyZWN0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNob3Jkcy5MZW5ndGggPT0gMikge1xuICAgICAgICAgICAgQnJpbmdTdGVtc0Nsb3NlcihjaG9yZHMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgTGluZVVwU3RlbUVuZHMoY2hvcmRzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZpcnN0U3RlbS5TZXRQYWlyKGxhc3RTdGVtLCBzcGFjaW5nKTtcbiAgICAgICAgZm9yIChpbnQgaSA9IDE7IGkgPCBjaG9yZHMuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNob3Jkc1tpXS5TdGVtLlJlY2VpdmVyID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBXZSdyZSBjb25uZWN0aW5nIHRoZSBzdGVtcyBvZiB0d28gY2hvcmRzIHVzaW5nIGEgaG9yaXpvbnRhbCBiZWFtLlxuICAgICAqICBBZGp1c3QgdGhlIHZlcnRpY2FsIGVuZHBvaW50IG9mIHRoZSBzdGVtcywgc28gdGhhdCB0aGV5J3JlIGNsb3NlclxuICAgICAqICB0b2dldGhlci4gIEZvciBhIGRvdHRlZCA4dGggdG8gMTZ0aCBiZWFtLCBpbmNyZWFzZSB0aGUgc3RlbSBvZiB0aGVcbiAgICAgKiAgZG90dGVkIGVpZ2h0aCwgc28gdGhhdCBpdCdzIGFzIGxvbmcgYXMgYSAxNnRoIHN0ZW0uXG4gICAgICovXG4gICAgc3RhdGljIHZvaWRcbiAgICBCcmluZ1N0ZW1zQ2xvc2VyKENob3JkU3ltYm9sW10gY2hvcmRzKSB7XG4gICAgICAgIFN0ZW0gZmlyc3RTdGVtID0gY2hvcmRzWzBdLlN0ZW07XG4gICAgICAgIFN0ZW0gbGFzdFN0ZW0gPSBjaG9yZHNbMV0uU3RlbTtcblxuICAgICAgICAvKiBJZiB3ZSdyZSBjb25uZWN0aW5nIGEgZG90dGVkIDh0aCB0byBhIDE2dGgsIGluY3JlYXNlXG4gICAgICAgICAqIHRoZSBzdGVtIGVuZCBvZiB0aGUgZG90dGVkIGVpZ2h0aC5cbiAgICAgICAgICovXG4gICAgICAgIGlmIChmaXJzdFN0ZW0uRHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCAmJlxuICAgICAgICAgICAgbGFzdFN0ZW0uRHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCkge1xuICAgICAgICAgICAgaWYgKGZpcnN0U3RlbS5EaXJlY3Rpb24gPT0gU3RlbS5VcCkge1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSBmaXJzdFN0ZW0uRW5kLkFkZCgyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSBmaXJzdFN0ZW0uRW5kLkFkZCgtMik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBCcmluZyB0aGUgc3RlbSBlbmRzIGNsb3NlciB0b2dldGhlciAqL1xuICAgICAgICBpbnQgZGlzdGFuY2UgPSBNYXRoLkFicyhmaXJzdFN0ZW0uRW5kLkRpc3QobGFzdFN0ZW0uRW5kKSk7XG4gICAgICAgIGlmIChmaXJzdFN0ZW0uRGlyZWN0aW9uID09IFN0ZW0uVXApIHtcbiAgICAgICAgICAgIGlmIChXaGl0ZU5vdGUuTWF4KGZpcnN0U3RlbS5FbmQsIGxhc3RTdGVtLkVuZCkgPT0gZmlyc3RTdGVtLkVuZClcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSBsYXN0U3RlbS5FbmQuQWRkKGRpc3RhbmNlLzIpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSBmaXJzdFN0ZW0uRW5kLkFkZChkaXN0YW5jZS8yKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChXaGl0ZU5vdGUuTWluKGZpcnN0U3RlbS5FbmQsIGxhc3RTdGVtLkVuZCkgPT0gZmlyc3RTdGVtLkVuZClcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSBsYXN0U3RlbS5FbmQuQWRkKC1kaXN0YW5jZS8yKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmaXJzdFN0ZW0uRW5kID0gZmlyc3RTdGVtLkVuZC5BZGQoLWRpc3RhbmNlLzIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFdlJ3JlIGNvbm5lY3RpbmcgdGhlIHN0ZW1zIG9mIHRocmVlIG9yIG1vcmUgY2hvcmRzIHVzaW5nIGEgaG9yaXpvbnRhbCBiZWFtLlxuICAgICAqICBBZGp1c3QgdGhlIHZlcnRpY2FsIGVuZHBvaW50IG9mIHRoZSBzdGVtcywgc28gdGhhdCB0aGUgbWlkZGxlIGNob3JkIHN0ZW1zXG4gICAgICogIGFyZSB2ZXJ0aWNhbGx5IGluIGJldHdlZW4gdGhlIGZpcnN0IGFuZCBsYXN0IHN0ZW0uXG4gICAgICovXG4gICAgc3RhdGljIHZvaWRcbiAgICBMaW5lVXBTdGVtRW5kcyhDaG9yZFN5bWJvbFtdIGNob3Jkcykge1xuICAgICAgICBTdGVtIGZpcnN0U3RlbSA9IGNob3Jkc1swXS5TdGVtO1xuICAgICAgICBTdGVtIGxhc3RTdGVtID0gY2hvcmRzW2Nob3Jkcy5MZW5ndGgtMV0uU3RlbTtcbiAgICAgICAgU3RlbSBtaWRkbGVTdGVtID0gY2hvcmRzWzFdLlN0ZW07XG5cbiAgICAgICAgaWYgKGZpcnN0U3RlbS5EaXJlY3Rpb24gPT0gU3RlbS5VcCkge1xuICAgICAgICAgICAgLyogRmluZCB0aGUgaGlnaGVzdCBzdGVtLiBUaGUgYmVhbSB3aWxsIGVpdGhlcjpcbiAgICAgICAgICAgICAqIC0gU2xhbnQgZG93bndhcmRzIChmaXJzdCBzdGVtIGlzIGhpZ2hlc3QpXG4gICAgICAgICAgICAgKiAtIFNsYW50IHVwd2FyZHMgKGxhc3Qgc3RlbSBpcyBoaWdoZXN0KVxuICAgICAgICAgICAgICogLSBCZSBzdHJhaWdodCAobWlkZGxlIHN0ZW0gaXMgaGlnaGVzdClcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgV2hpdGVOb3RlIHRvcCA9IGZpcnN0U3RlbS5FbmQ7XG4gICAgICAgICAgICBmb3JlYWNoIChDaG9yZFN5bWJvbCBjaG9yZCBpbiBjaG9yZHMpIHtcbiAgICAgICAgICAgICAgICB0b3AgPSBXaGl0ZU5vdGUuTWF4KHRvcCwgY2hvcmQuU3RlbS5FbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRvcCA9PSBmaXJzdFN0ZW0uRW5kICYmIHRvcC5EaXN0KGxhc3RTdGVtLkVuZCkgPj0gMikge1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSB0b3A7XG4gICAgICAgICAgICAgICAgbWlkZGxlU3RlbS5FbmQgPSB0b3AuQWRkKC0xKTtcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSB0b3AuQWRkKC0yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRvcCA9PSBsYXN0U3RlbS5FbmQgJiYgdG9wLkRpc3QoZmlyc3RTdGVtLkVuZCkgPj0gMikge1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSB0b3AuQWRkKC0yKTtcbiAgICAgICAgICAgICAgICBtaWRkbGVTdGVtLkVuZCA9IHRvcC5BZGQoLTEpO1xuICAgICAgICAgICAgICAgIGxhc3RTdGVtLkVuZCA9IHRvcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSB0b3A7XG4gICAgICAgICAgICAgICAgbWlkZGxlU3RlbS5FbmQgPSB0b3A7XG4gICAgICAgICAgICAgICAgbGFzdFN0ZW0uRW5kID0gdG9wO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLyogRmluZCB0aGUgYm90dG9tbW9zdCBzdGVtLiBUaGUgYmVhbSB3aWxsIGVpdGhlcjpcbiAgICAgICAgICAgICAqIC0gU2xhbnQgdXB3YXJkcyAoZmlyc3Qgc3RlbSBpcyBsb3dlc3QpXG4gICAgICAgICAgICAgKiAtIFNsYW50IGRvd253YXJkcyAobGFzdCBzdGVtIGlzIGxvd2VzdClcbiAgICAgICAgICAgICAqIC0gQmUgc3RyYWlnaHQgKG1pZGRsZSBzdGVtIGlzIGhpZ2hlc3QpXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFdoaXRlTm90ZSBib3R0b20gPSBmaXJzdFN0ZW0uRW5kO1xuICAgICAgICAgICAgZm9yZWFjaCAoQ2hvcmRTeW1ib2wgY2hvcmQgaW4gY2hvcmRzKSB7XG4gICAgICAgICAgICAgICAgYm90dG9tID0gV2hpdGVOb3RlLk1pbihib3R0b20sIGNob3JkLlN0ZW0uRW5kKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGJvdHRvbSA9PSBmaXJzdFN0ZW0uRW5kICYmIGxhc3RTdGVtLkVuZC5EaXN0KGJvdHRvbSkgPj0gMikge1xuICAgICAgICAgICAgICAgIG1pZGRsZVN0ZW0uRW5kID0gYm90dG9tLkFkZCgxKTtcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSBib3R0b20uQWRkKDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoYm90dG9tID09IGxhc3RTdGVtLkVuZCAmJiBmaXJzdFN0ZW0uRW5kLkRpc3QoYm90dG9tKSA+PSAyKSB7XG4gICAgICAgICAgICAgICAgbWlkZGxlU3RlbS5FbmQgPSBib3R0b20uQWRkKDEpO1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSBib3R0b20uQWRkKDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZmlyc3RTdGVtLkVuZCA9IGJvdHRvbTtcbiAgICAgICAgICAgICAgICBtaWRkbGVTdGVtLkVuZCA9IGJvdHRvbTtcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSBib3R0b207XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBBbGwgbWlkZGxlIHN0ZW1zIGhhdmUgdGhlIHNhbWUgZW5kICovXG4gICAgICAgIGZvciAoaW50IGkgPSAxOyBpIDwgY2hvcmRzLkxlbmd0aC0xOyBpKyspIHtcbiAgICAgICAgICAgIFN0ZW0gc3RlbSA9IGNob3Jkc1tpXS5TdGVtO1xuICAgICAgICAgICAgc3RlbS5FbmQgPSBtaWRkbGVTdGVtLkVuZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHN0cmluZyByZXN1bHQgPSBzdHJpbmcuRm9ybWF0KFwiQ2hvcmRTeW1ib2wgY2xlZj17MH0gc3RhcnQ9ezF9IGVuZD17Mn0gd2lkdGg9ezN9IGhhc3R3b3N0ZW1zPXs0fSBcIiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWYsIFN0YXJ0VGltZSwgRW5kVGltZSwgV2lkdGgsIGhhc3R3b3N0ZW1zKTtcbiAgICAgICAgZm9yZWFjaCAoQWNjaWRTeW1ib2wgc3ltYm9sIGluIGFjY2lkc3ltYm9scykge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHN5bWJvbC5Ub1N0cmluZygpICsgXCIgXCI7XG4gICAgICAgIH1cbiAgICAgICAgZm9yZWFjaCAoTm90ZURhdGEgbm90ZSBpbiBub3RlZGF0YSkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHN0cmluZy5Gb3JtYXQoXCJOb3RlIHdoaXRlbm90ZT17MH0gZHVyYXRpb249ezF9IGxlZnRzaWRlPXsyfSBcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGUud2hpdGVub3RlLCBub3RlLmR1cmF0aW9uLCBub3RlLmxlZnRzaWRlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RlbTEgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHN0ZW0xLlRvU3RyaW5nKCkgKyBcIiBcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RlbTIgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHN0ZW0yLlRvU3RyaW5nKCkgKyBcIiBcIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0OyBcbiAgICB9XG5cbn1cblxuXG59XG5cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogVGhlIHBvc3NpYmxlIGNsZWZzLCBUcmVibGUgb3IgQmFzcyAqL1xucHVibGljIGVudW0gQ2xlZiB7IFRyZWJsZSwgQmFzcyB9O1xuXG4vKiogQGNsYXNzIENsZWZTeW1ib2wgXG4gKiBBIENsZWZTeW1ib2wgcmVwcmVzZW50cyBlaXRoZXIgYSBUcmVibGUgb3IgQmFzcyBDbGVmIGltYWdlLlxuICogVGhlIGNsZWYgY2FuIGJlIGVpdGhlciBub3JtYWwgb3Igc21hbGwgc2l6ZS4gIE5vcm1hbCBzaXplIGlzXG4gKiB1c2VkIGF0IHRoZSBiZWdpbm5pbmcgb2YgYSBuZXcgc3RhZmYsIG9uIHRoZSBsZWZ0IHNpZGUuICBUaGVcbiAqIHNtYWxsIHN5bWJvbHMgYXJlIHVzZWQgdG8gc2hvdyBjbGVmIGNoYW5nZXMgd2l0aGluIGEgc3RhZmYuXG4gKi9cblxucHVibGljIGNsYXNzIENsZWZTeW1ib2wgOiBNdXNpY1N5bWJvbCB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgSW1hZ2UgdHJlYmxlOyAgLyoqIFRoZSB0cmVibGUgY2xlZiBpbWFnZSAqL1xuICAgIHByaXZhdGUgc3RhdGljIEltYWdlIGJhc3M7ICAgIC8qKiBUaGUgYmFzcyBjbGVmIGltYWdlICovXG5cbiAgICBwcml2YXRlIGludCBzdGFydHRpbWU7ICAgICAgICAvKiogU3RhcnQgdGltZSBvZiB0aGUgc3ltYm9sICovXG4gICAgcHJpdmF0ZSBib29sIHNtYWxsc2l6ZTsgICAgICAgLyoqIFRydWUgaWYgdGhpcyBpcyBhIHNtYWxsIGNsZWYsIGZhbHNlIG90aGVyd2lzZSAqL1xuICAgIHByaXZhdGUgQ2xlZiBjbGVmOyAgICAgICAgICAgIC8qKiBUaGUgY2xlZiwgVHJlYmxlIG9yIEJhc3MgKi9cbiAgICBwcml2YXRlIGludCB3aWR0aDtcblxuICAgIC8qKiBDcmVhdGUgYSBuZXcgQ2xlZlN5bWJvbCwgd2l0aCB0aGUgZ2l2ZW4gY2xlZiwgc3RhcnR0aW1lLCBhbmQgc2l6ZSAqL1xuICAgIHB1YmxpYyBDbGVmU3ltYm9sKENsZWYgY2xlZiwgaW50IHN0YXJ0dGltZSwgYm9vbCBzbWFsbCkge1xuICAgICAgICB0aGlzLmNsZWYgPSBjbGVmO1xuICAgICAgICB0aGlzLnN0YXJ0dGltZSA9IHN0YXJ0dGltZTtcbiAgICAgICAgc21hbGxzaXplID0gc21hbGw7XG4gICAgICAgIExvYWRJbWFnZXMoKTtcbiAgICAgICAgd2lkdGggPSBNaW5XaWR0aDtcbiAgICB9XG5cbiAgICAvKiogTG9hZCB0aGUgVHJlYmxlL0Jhc3MgY2xlZiBpbWFnZXMgaW50byBtZW1vcnkuICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBMb2FkSW1hZ2VzKCkge1xuICAgICAgICBpZiAodHJlYmxlID09IG51bGwpXG4gICAgICAgICAgICB0cmVibGUgPSBuZXcgQml0bWFwKHR5cGVvZihDbGVmU3ltYm9sKSwgXCJSZXNvdXJjZXMuSW1hZ2VzLnRyZWJsZS5wbmdcIik7XG5cbiAgICAgICAgaWYgKGJhc3MgPT0gbnVsbClcbiAgICAgICAgICAgIGJhc3MgPSBuZXcgQml0bWFwKHR5cGVvZihDbGVmU3ltYm9sKSwgXCJSZXNvdXJjZXMuSW1hZ2VzLmJhc3MucG5nXCIpO1xuXG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgdGltZSAoaW4gcHVsc2VzKSB0aGlzIHN5bWJvbCBvY2N1cnMgYXQuXG4gICAgICogVGhpcyBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgbWVhc3VyZSB0aGlzIHN5bWJvbCBiZWxvbmdzIHRvLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgU3RhcnRUaW1lIHsgXG4gICAgICAgIGdldCB7IHJldHVybiBzdGFydHRpbWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBtaW5pbXVtIHdpZHRoIChpbiBwaXhlbHMpIG5lZWRlZCB0byBkcmF3IHRoaXMgc3ltYm9sICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBNaW5XaWR0aCB7XG4gICAgICAgIGdldCB7IFxuICAgICAgICAgICAgaWYgKHNtYWxsc2l6ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gU2hlZXRNdXNpYy5Ob3RlV2lkdGggKiAyO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiBTaGVldE11c2ljLk5vdGVXaWR0aCAqIDM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogR2V0L1NldCB0aGUgd2lkdGggKGluIHBpeGVscykgb2YgdGhpcyBzeW1ib2wuIFRoZSB3aWR0aCBpcyBzZXRcbiAgICAgKiBpbiBTaGVldE11c2ljLkFsaWduU3ltYm9scygpIHRvIHZlcnRpY2FsbHkgYWxpZ24gc3ltYm9scy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFdpZHRoIHtcbiAgICAgICBnZXQgeyByZXR1cm4gd2lkdGg7IH1cbiAgICAgICBzZXQgeyB3aWR0aCA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGFib3ZlIHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEFib3ZlU3RhZmYgeyBcbiAgICAgICAgZ2V0IHsgXG4gICAgICAgICAgICBpZiAoY2xlZiA9PSBDbGVmLlRyZWJsZSAmJiAhc21hbGxzaXplKVxuICAgICAgICAgICAgICAgIHJldHVybiBTaGVldE11c2ljLk5vdGVIZWlnaHQgKiAyO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGJlbG93IHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEJlbG93U3RhZmYge1xuICAgICAgICBnZXQge1xuICAgICAgICAgICAgaWYgKGNsZWYgPT0gQ2xlZi5UcmVibGUgJiYgIXNtYWxsc2l6ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMjtcbiAgICAgICAgICAgIGVsc2UgaWYgKGNsZWYgPT0gQ2xlZi5UcmVibGUgJiYgc21hbGxzaXplKVxuICAgICAgICAgICAgICAgIHJldHVybiBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgc3ltYm9sLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBcbiAgICB2b2lkIERyYXcoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3ApIHtcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oV2lkdGggLSBNaW5XaWR0aCwgMCk7XG4gICAgICAgIGludCB5ID0geXRvcDtcbiAgICAgICAgSW1hZ2UgaW1hZ2U7XG4gICAgICAgIGludCBoZWlnaHQ7XG5cbiAgICAgICAgLyogR2V0IHRoZSBpbWFnZSwgaGVpZ2h0LCBhbmQgdG9wIHkgcGl4ZWwsIGRlcGVuZGluZyBvbiB0aGUgY2xlZlxuICAgICAgICAgKiBhbmQgdGhlIGltYWdlIHNpemUuXG4gICAgICAgICAqL1xuICAgICAgICBpZiAoY2xlZiA9PSBDbGVmLlRyZWJsZSkge1xuICAgICAgICAgICAgaW1hZ2UgPSB0cmVibGU7XG4gICAgICAgICAgICBpZiAoc21hbGxzaXplKSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gU2hlZXRNdXNpYy5TdGFmZkhlaWdodCArIFNoZWV0TXVzaWMuU3RhZmZIZWlnaHQvNDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gMyAqIFNoZWV0TXVzaWMuU3RhZmZIZWlnaHQvMiArIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICAgICAgICAgIHkgPSB5dG9wIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaW1hZ2UgPSBiYXNzO1xuICAgICAgICAgICAgaWYgKHNtYWxsc2l6ZSkge1xuICAgICAgICAgICAgICAgIGhlaWdodCA9IFNoZWV0TXVzaWMuU3RhZmZIZWlnaHQgLSAzKlNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBTaGVldE11c2ljLlN0YWZmSGVpZ2h0IC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyogU2NhbGUgdGhlIGltYWdlIHdpZHRoIHRvIG1hdGNoIHRoZSBoZWlnaHQgKi9cbiAgICAgICAgaW50IGltZ3dpZHRoID0gaW1hZ2UuV2lkdGggKiBoZWlnaHQgLyBpbWFnZS5IZWlnaHQ7XG4gICAgICAgIGcuRHJhd0ltYWdlKGltYWdlLCAwLCB5LCBpbWd3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShXaWR0aCAtIE1pbldpZHRoKSwgMCk7XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJDbGVmU3ltYm9sIGNsZWY9ezB9IHNtYWxsPXsxfSB3aWR0aD17Mn1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlZiwgc21hbGxzaXplLCB3aWR0aCk7XG4gICAgfVxufVxuXG5cbn1cblxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEZpbGVTdHJlYW06U3RyZWFtXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIEZpbGVTdHJlYW0oc3RyaW5nIGZpbGVuYW1lLCBGaWxlTW9kZSBtb2RlKVxyXG4gICAgICAgIHtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwOS0yMDEyIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG5cbi8qKiBAY2xhc3MgUGlhbm9cbiAqXG4gKiBUaGUgUGlhbm8gQ29udHJvbCBpcyB0aGUgcGFuZWwgYXQgdGhlIHRvcCB0aGF0IGRpc3BsYXlzIHRoZVxuICogcGlhbm8sIGFuZCBoaWdobGlnaHRzIHRoZSBwaWFubyBub3RlcyBkdXJpbmcgcGxheWJhY2suXG4gKiBUaGUgbWFpbiBtZXRob2RzIGFyZTpcbiAqXG4gKiBTZXRNaWRpRmlsZSgpIC0gU2V0IHRoZSBNaWRpIGZpbGUgdG8gdXNlIGZvciBzaGFkaW5nLiAgVGhlIE1pZGkgZmlsZVxuICogICAgICAgICAgICAgICAgIGlzIG5lZWRlZCB0byBkZXRlcm1pbmUgd2hpY2ggbm90ZXMgdG8gc2hhZGUuXG4gKlxuICogU2hhZGVOb3RlcygpIC0gU2hhZGUgbm90ZXMgb24gdGhlIHBpYW5vIHRoYXQgb2NjdXIgYXQgYSBnaXZlbiBwdWxzZSB0aW1lLlxuICpcbiAqL1xucHVibGljIGNsYXNzIFBpYW5vIDogQ29udHJvbCB7XG4gICAgcHVibGljIGNvbnN0IGludCBLZXlzUGVyT2N0YXZlID0gNztcbiAgICBwdWJsaWMgY29uc3QgaW50IE1heE9jdGF2ZSA9IDc7XG5cbiAgICBwcml2YXRlIHN0YXRpYyBpbnQgV2hpdGVLZXlXaWR0aDsgIC8qKiBXaWR0aCBvZiBhIHNpbmdsZSB3aGl0ZSBrZXkgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBpbnQgV2hpdGVLZXlIZWlnaHQ7IC8qKiBIZWlnaHQgb2YgYSBzaW5nbGUgd2hpdGUga2V5ICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50IEJsYWNrS2V5V2lkdGg7ICAvKiogV2lkdGggb2YgYSBzaW5nbGUgYmxhY2sga2V5ICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50IEJsYWNrS2V5SGVpZ2h0OyAvKiogSGVpZ2h0IG9mIGEgc2luZ2xlIGJsYWNrIGtleSAqL1xuICAgIHByaXZhdGUgc3RhdGljIGludCBtYXJnaW47ICAgICAgICAgLyoqIFRoZSB0b3AvbGVmdCBtYXJnaW4gdG8gdGhlIHBpYW5vICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50IEJsYWNrQm9yZGVyOyAgICAvKiogVGhlIHdpZHRoIG9mIHRoZSBibGFjayBib3JkZXIgYXJvdW5kIHRoZSBrZXlzICovXG5cbiAgICBwcml2YXRlIHN0YXRpYyBpbnRbXSBibGFja0tleU9mZnNldHM7ICAgLyoqIFRoZSB4IHBpeGxlcyBvZiB0aGUgYmxhY2sga2V5cyAqL1xuXG4gICAgLyogVGhlIGdyYXkxUGVucyBmb3IgZHJhd2luZyBibGFjay9ncmF5IGxpbmVzICovXG4gICAgcHJpdmF0ZSBQZW4gZ3JheTFQZW4sIGdyYXkyUGVuLCBncmF5M1BlbjtcblxuICAgIC8qIFRoZSBicnVzaGVzIGZvciBmaWxsaW5nIHRoZSBrZXlzICovXG4gICAgcHJpdmF0ZSBCcnVzaCBncmF5MUJydXNoLCBncmF5MkJydXNoLCBzaGFkZUJydXNoLCBzaGFkZTJCcnVzaDtcblxuICAgIHByaXZhdGUgYm9vbCB1c2VUd29Db2xvcnM7ICAgICAgICAgICAgICAvKiogSWYgdHJ1ZSwgdXNlIHR3byBjb2xvcnMgZm9yIGhpZ2hsaWdodGluZyAqL1xuICAgIHByaXZhdGUgTGlzdDxNaWRpTm90ZT4gbm90ZXM7ICAgICAgICAgICAvKiogVGhlIE1pZGkgbm90ZXMgZm9yIHNoYWRpbmcgKi9cbiAgICBwcml2YXRlIGludCBtYXhTaGFkZUR1cmF0aW9uOyAgICAgICAgICAgLyoqIFRoZSBtYXhpbXVtIGR1cmF0aW9uIHdlJ2xsIHNoYWRlIGEgbm90ZSBmb3IgKi9cbiAgICBwcml2YXRlIGludCBzaG93Tm90ZUxldHRlcnM7ICAgICAgICAgICAgLyoqIERpc3BsYXkgdGhlIGxldHRlciBmb3IgZWFjaCBwaWFubyBub3RlICovXG4gICAgcHJpdmF0ZSBHcmFwaGljcyBncmFwaGljczsgICAgICAgICAgICAgIC8qKiBUaGUgZ3JhcGhpY3MgZm9yIHNoYWRpbmcgdGhlIG5vdGVzICovXG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IFBpYW5vLiAqL1xuICAgIHB1YmxpYyBQaWFubygpIHtcclxuICAgICAgICBpbnQgc2NyZWVud2lkdGggPSAxMDI0OyAvL1N5c3RlbS5XaW5kb3dzLkZvcm1zLlNjcmVlbi5QcmltYXJ5U2NyZWVuLkJvdW5kcy5XaWR0aDtcbiAgICAgICAgaWYgKHNjcmVlbndpZHRoID49IDMyMDApIHtcbiAgICAgICAgICAgIC8qIExpbnV4L01vbm8gaXMgcmVwb3J0aW5nIHdpZHRoIG9mIDQgc2NyZWVucyAqL1xuICAgICAgICAgICAgc2NyZWVud2lkdGggPSBzY3JlZW53aWR0aCAvIDQ7XG4gICAgICAgIH1cbiAgICAgICAgc2NyZWVud2lkdGggPSBzY3JlZW53aWR0aCAqIDk1LzEwMDtcbiAgICAgICAgV2hpdGVLZXlXaWR0aCA9IChpbnQpKHNjcmVlbndpZHRoIC8gKDIuMCArIEtleXNQZXJPY3RhdmUgKiBNYXhPY3RhdmUpKTtcbiAgICAgICAgaWYgKFdoaXRlS2V5V2lkdGggJSAyICE9IDApIHtcbiAgICAgICAgICAgIFdoaXRlS2V5V2lkdGgtLTtcbiAgICAgICAgfVxuICAgICAgICBtYXJnaW4gPSAwO1xuICAgICAgICBCbGFja0JvcmRlciA9IFdoaXRlS2V5V2lkdGgvMjtcbiAgICAgICAgV2hpdGVLZXlIZWlnaHQgPSBXaGl0ZUtleVdpZHRoICogNTtcbiAgICAgICAgQmxhY2tLZXlXaWR0aCA9IFdoaXRlS2V5V2lkdGggLyAyO1xuICAgICAgICBCbGFja0tleUhlaWdodCA9IFdoaXRlS2V5SGVpZ2h0ICogNSAvIDk7IFxuXG4gICAgICAgIFdpZHRoID0gbWFyZ2luKjIgKyBCbGFja0JvcmRlcioyICsgV2hpdGVLZXlXaWR0aCAqIEtleXNQZXJPY3RhdmUgKiBNYXhPY3RhdmU7XG4gICAgICAgIEhlaWdodCA9IG1hcmdpbioyICsgQmxhY2tCb3JkZXIqMyArIFdoaXRlS2V5SGVpZ2h0O1xuICAgICAgICBpZiAoYmxhY2tLZXlPZmZzZXRzID09IG51bGwpIHtcbiAgICAgICAgICAgIGJsYWNrS2V5T2Zmc2V0cyA9IG5ldyBpbnRbXSB7IFxuICAgICAgICAgICAgICAgIFdoaXRlS2V5V2lkdGggLSBCbGFja0tleVdpZHRoLzIgLSAxLFxuICAgICAgICAgICAgICAgIFdoaXRlS2V5V2lkdGggKyBCbGFja0tleVdpZHRoLzIgLSAxLFxuICAgICAgICAgICAgICAgIDIqV2hpdGVLZXlXaWR0aCAtIEJsYWNrS2V5V2lkdGgvMixcbiAgICAgICAgICAgICAgICAyKldoaXRlS2V5V2lkdGggKyBCbGFja0tleVdpZHRoLzIsXG4gICAgICAgICAgICAgICAgNCpXaGl0ZUtleVdpZHRoIC0gQmxhY2tLZXlXaWR0aC8yIC0gMSxcbiAgICAgICAgICAgICAgICA0KldoaXRlS2V5V2lkdGggKyBCbGFja0tleVdpZHRoLzIgLSAxLFxuICAgICAgICAgICAgICAgIDUqV2hpdGVLZXlXaWR0aCAtIEJsYWNrS2V5V2lkdGgvMixcbiAgICAgICAgICAgICAgICA1KldoaXRlS2V5V2lkdGggKyBCbGFja0tleVdpZHRoLzIsXG4gICAgICAgICAgICAgICAgNipXaGl0ZUtleVdpZHRoIC0gQmxhY2tLZXlXaWR0aC8yLFxuICAgICAgICAgICAgICAgIDYqV2hpdGVLZXlXaWR0aCArIEJsYWNrS2V5V2lkdGgvMlxuICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIENvbG9yIGdyYXkxID0gQ29sb3IuRnJvbUFyZ2IoMTYsIDE2LCAxNik7XG4gICAgICAgIENvbG9yIGdyYXkyID0gQ29sb3IuRnJvbUFyZ2IoOTAsIDkwLCA5MCk7XG4gICAgICAgIENvbG9yIGdyYXkzID0gQ29sb3IuRnJvbUFyZ2IoMjAwLCAyMDAsIDIwMCk7XG4gICAgICAgIENvbG9yIHNoYWRlMSA9IENvbG9yLkZyb21BcmdiKDIxMCwgMjA1LCAyMjApO1xuICAgICAgICBDb2xvciBzaGFkZTIgPSBDb2xvci5Gcm9tQXJnYigxNTAsIDIwMCwgMjIwKTtcblxuICAgICAgICBncmF5MVBlbiA9IG5ldyBQZW4oZ3JheTEsIDEpO1xuICAgICAgICBncmF5MlBlbiA9IG5ldyBQZW4oZ3JheTIsIDEpO1xuICAgICAgICBncmF5M1BlbiA9IG5ldyBQZW4oZ3JheTMsIDEpO1xuXG4gICAgICAgIGdyYXkxQnJ1c2ggPSBuZXcgU29saWRCcnVzaChncmF5MSk7XG4gICAgICAgIGdyYXkyQnJ1c2ggPSBuZXcgU29saWRCcnVzaChncmF5Mik7XG4gICAgICAgIHNoYWRlQnJ1c2ggPSBuZXcgU29saWRCcnVzaChzaGFkZTEpO1xuICAgICAgICBzaGFkZTJCcnVzaCA9IG5ldyBTb2xpZEJydXNoKHNoYWRlMik7XG4gICAgICAgIHNob3dOb3RlTGV0dGVycyA9IE1pZGlPcHRpb25zLk5vdGVOYW1lTm9uZTtcbiAgICAgICAgQmFja0NvbG9yID0gQ29sb3IuTGlnaHRHcmF5O1xuICAgIH1cblxuICAgIC8qKiBTZXQgdGhlIE1pZGlGaWxlIHRvIHVzZS5cbiAgICAgKiAgU2F2ZSB0aGUgbGlzdCBvZiBtaWRpIG5vdGVzLiBFYWNoIG1pZGkgbm90ZSBpbmNsdWRlcyB0aGUgbm90ZSBOdW1iZXIgXG4gICAgICogIGFuZCBTdGFydFRpbWUgKGluIHB1bHNlcyksIHNvIHdlIGtub3cgd2hpY2ggbm90ZXMgdG8gc2hhZGUgZ2l2ZW4gdGhlXG4gICAgICogIGN1cnJlbnQgcHVsc2UgdGltZS5cbiAgICAgKi8gXG4gICAgcHVibGljIHZvaWQgU2V0TWlkaUZpbGUoTWlkaUZpbGUgbWlkaWZpbGUsIE1pZGlPcHRpb25zIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKG1pZGlmaWxlID09IG51bGwpIHtcbiAgICAgICAgICAgIG5vdGVzID0gbnVsbDtcbiAgICAgICAgICAgIHVzZVR3b0NvbG9ycyA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgTGlzdDxNaWRpVHJhY2s+IHRyYWNrcyA9IG1pZGlmaWxlLkNoYW5nZU1pZGlOb3RlcyhvcHRpb25zKTtcbiAgICAgICAgTWlkaVRyYWNrIHRyYWNrID0gTWlkaUZpbGUuQ29tYmluZVRvU2luZ2xlVHJhY2sodHJhY2tzKTtcbiAgICAgICAgbm90ZXMgPSB0cmFjay5Ob3RlcztcblxuICAgICAgICBtYXhTaGFkZUR1cmF0aW9uID0gbWlkaWZpbGUuVGltZS5RdWFydGVyICogMjtcblxuICAgICAgICAvKiBXZSB3YW50IHRvIGtub3cgd2hpY2ggdHJhY2sgdGhlIG5vdGUgY2FtZSBmcm9tLlxuICAgICAgICAgKiBVc2UgdGhlICdjaGFubmVsJyBmaWVsZCB0byBzdG9yZSB0aGUgdHJhY2suXG4gICAgICAgICAqL1xuICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgdHJhY2tzLkNvdW50OyB0cmFja251bSsrKSB7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrc1t0cmFja251bV0uTm90ZXMpIHtcbiAgICAgICAgICAgICAgICBub3RlLkNoYW5uZWwgPSB0cmFja251bTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFdoZW4gd2UgaGF2ZSBleGFjdGx5IHR3byB0cmFja3MsIHdlIGFzc3VtZSB0aGlzIGlzIGEgcGlhbm8gc29uZyxcbiAgICAgICAgICogYW5kIHdlIHVzZSBkaWZmZXJlbnQgY29sb3JzIGZvciBoaWdobGlnaHRpbmcgdGhlIGxlZnQgaGFuZCBhbmRcbiAgICAgICAgICogcmlnaHQgaGFuZCBub3Rlcy5cbiAgICAgICAgICovXG4gICAgICAgIHVzZVR3b0NvbG9ycyA9IGZhbHNlO1xuICAgICAgICBpZiAodHJhY2tzLkNvdW50ID09IDIpIHtcbiAgICAgICAgICAgIHVzZVR3b0NvbG9ycyA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBzaG93Tm90ZUxldHRlcnMgPSBvcHRpb25zLnNob3dOb3RlTGV0dGVycztcbiAgICAgICAgdGhpcy5JbnZhbGlkYXRlKCk7XG4gICAgfVxuXG4gICAgLyoqIFNldCB0aGUgY29sb3JzIHRvIHVzZSBmb3Igc2hhZGluZyAqL1xuICAgIHB1YmxpYyB2b2lkIFNldFNoYWRlQ29sb3JzKENvbG9yIGMxLCBDb2xvciBjMikge1xuICAgICAgICBzaGFkZUJydXNoLkRpc3Bvc2UoKTtcbiAgICAgICAgc2hhZGUyQnJ1c2guRGlzcG9zZSgpO1xuICAgICAgICBzaGFkZUJydXNoID0gbmV3IFNvbGlkQnJ1c2goYzEpO1xuICAgICAgICBzaGFkZTJCcnVzaCA9IG5ldyBTb2xpZEJydXNoKGMyKTtcbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgb3V0bGluZSBvZiBhIDEyLW5vdGUgKDcgd2hpdGUgbm90ZSkgcGlhbm8gb2N0YXZlICovXG4gICAgcHJpdmF0ZSB2b2lkIERyYXdPY3RhdmVPdXRsaW5lKEdyYXBoaWNzIGcpIHtcbiAgICAgICAgaW50IHJpZ2h0ID0gV2hpdGVLZXlXaWR0aCAqIEtleXNQZXJPY3RhdmU7XG5cbiAgICAgICAgLy8gRHJhdyB0aGUgYm91bmRpbmcgcmVjdGFuZ2xlLCBmcm9tIEMgdG8gQlxuICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCAwLCAwLCAwLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTFQZW4sIHJpZ2h0LCAwLCByaWdodCwgV2hpdGVLZXlIZWlnaHQpO1xuICAgICAgICAvLyBnLkRyYXdMaW5lKGdyYXkxUGVuLCAwLCAwLCByaWdodCwgMCk7XG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTFQZW4sIDAsIFdoaXRlS2V5SGVpZ2h0LCByaWdodCwgV2hpdGVLZXlIZWlnaHQpO1xuICAgICAgICBnLkRyYXdMaW5lKGdyYXkzUGVuLCByaWdodC0xLCAwLCByaWdodC0xLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIDEsIDAsIDEsIFdoaXRlS2V5SGVpZ2h0KTtcblxuICAgICAgICAvLyBEcmF3IHRoZSBsaW5lIGJldHdlZW4gRSBhbmQgRlxuICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCAzKldoaXRlS2V5V2lkdGgsIDAsIDMqV2hpdGVLZXlXaWR0aCwgV2hpdGVLZXlIZWlnaHQpO1xuICAgICAgICBnLkRyYXdMaW5lKGdyYXkzUGVuLCAzKldoaXRlS2V5V2lkdGggLSAxLCAwLCAzKldoaXRlS2V5V2lkdGggLSAxLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIDMqV2hpdGVLZXlXaWR0aCArIDEsIDAsIDMqV2hpdGVLZXlXaWR0aCArIDEsIFdoaXRlS2V5SGVpZ2h0KTtcblxuICAgICAgICAvLyBEcmF3IHRoZSBzaWRlcy9ib3R0b20gb2YgdGhlIGJsYWNrIGtleXNcbiAgICAgICAgZm9yIChpbnQgaSA9MDsgaSA8IDEwOyBpICs9IDIpIHtcbiAgICAgICAgICAgIGludCB4MSA9IGJsYWNrS2V5T2Zmc2V0c1tpXTtcbiAgICAgICAgICAgIGludCB4MiA9IGJsYWNrS2V5T2Zmc2V0c1tpKzFdO1xuXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCB4MSwgMCwgeDEsIEJsYWNrS2V5SGVpZ2h0KTsgXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCB4MiwgMCwgeDIsIEJsYWNrS2V5SGVpZ2h0KTsgXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCB4MSwgQmxhY2tLZXlIZWlnaHQsIHgyLCBCbGFja0tleUhlaWdodCk7XG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkyUGVuLCB4MS0xLCAwLCB4MS0xLCBCbGFja0tleUhlaWdodCsxKTsgXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkyUGVuLCB4MisxLCAwLCB4MisxLCBCbGFja0tleUhlaWdodCsxKTsgXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkyUGVuLCB4MS0xLCBCbGFja0tleUhlaWdodCsxLCB4MisxLCBCbGFja0tleUhlaWdodCsxKTtcbiAgICAgICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIHgxLTIsIDAsIHgxLTIsIEJsYWNrS2V5SGVpZ2h0KzIpOyBcbiAgICAgICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIHgyKzIsIDAsIHgyKzIsIEJsYWNrS2V5SGVpZ2h0KzIpOyBcbiAgICAgICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIHgxLTIsIEJsYWNrS2V5SGVpZ2h0KzIsIHgyKzIsIEJsYWNrS2V5SGVpZ2h0KzIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRHJhdyB0aGUgYm90dG9tLWhhbGYgb2YgdGhlIHdoaXRlIGtleXNcbiAgICAgICAgZm9yIChpbnQgaSA9IDE7IGkgPCBLZXlzUGVyT2N0YXZlOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpID09IDMpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTsgIC8vIHdlIGRyYXcgdGhlIGxpbmUgYmV0d2VlbiBFIGFuZCBGIGFib3ZlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCBpKldoaXRlS2V5V2lkdGgsIEJsYWNrS2V5SGVpZ2h0LCBpKldoaXRlS2V5V2lkdGgsIFdoaXRlS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgIFBlbiBwZW4xID0gZ3JheTJQZW47XG4gICAgICAgICAgICBQZW4gcGVuMiA9IGdyYXkzUGVuO1xuICAgICAgICAgICAgZy5EcmF3TGluZShwZW4xLCBpKldoaXRlS2V5V2lkdGggLSAxLCBCbGFja0tleUhlaWdodCsxLCBpKldoaXRlS2V5V2lkdGggLSAxLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgICAgICBnLkRyYXdMaW5lKHBlbjIsIGkqV2hpdGVLZXlXaWR0aCArIDEsIEJsYWNrS2V5SGVpZ2h0KzEsIGkqV2hpdGVLZXlXaWR0aCArIDEsIFdoaXRlS2V5SGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqIERyYXcgYW4gb3V0bGluZSBvZiB0aGUgcGlhbm8gZm9yIDcgb2N0YXZlcyAqL1xuICAgIHByaXZhdGUgdm9pZCBEcmF3T3V0bGluZShHcmFwaGljcyBnKSB7XG4gICAgICAgIGZvciAoaW50IG9jdGF2ZSA9IDA7IG9jdGF2ZSA8IE1heE9jdGF2ZTsgb2N0YXZlKyspIHtcbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKG9jdGF2ZSAqIFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlLCAwKTtcbiAgICAgICAgICAgIERyYXdPY3RhdmVPdXRsaW5lKGcpO1xuICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShvY3RhdmUgKiBXaGl0ZUtleVdpZHRoICogS2V5c1Blck9jdGF2ZSksIDApO1xuICAgICAgICB9XG4gICAgfVxuIFxuICAgIC8qIERyYXcgdGhlIEJsYWNrIGtleXMgKi9cbiAgICBwcml2YXRlIHZvaWQgRHJhd0JsYWNrS2V5cyhHcmFwaGljcyBnKSB7XG4gICAgICAgIGZvciAoaW50IG9jdGF2ZSA9IDA7IG9jdGF2ZSA8IE1heE9jdGF2ZTsgb2N0YXZlKyspIHtcbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKG9jdGF2ZSAqIFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlLCAwKTtcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgMTA7IGkgKz0gMikge1xuICAgICAgICAgICAgICAgIGludCB4MSA9IGJsYWNrS2V5T2Zmc2V0c1tpXTtcbiAgICAgICAgICAgICAgICBpbnQgeDIgPSBibGFja0tleU9mZnNldHNbaSsxXTtcbiAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTFCcnVzaCwgeDEsIDAsIEJsYWNrS2V5V2lkdGgsIEJsYWNrS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTJCcnVzaCwgeDErMSwgQmxhY2tLZXlIZWlnaHQgLSBCbGFja0tleUhlaWdodC84LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmxhY2tLZXlXaWR0aC0yLCBCbGFja0tleUhlaWdodC84KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0ob2N0YXZlICogV2hpdGVLZXlXaWR0aCAqIEtleXNQZXJPY3RhdmUpLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qIERyYXcgdGhlIGJsYWNrIGJvcmRlciBhcmVhIHN1cnJvdW5kaW5nIHRoZSBwaWFubyBrZXlzLlxuICAgICAqIEFsc28sIGRyYXcgZ3JheSBvdXRsaW5lcyBhdCB0aGUgYm90dG9tIG9mIHRoZSB3aGl0ZSBrZXlzLlxuICAgICAqL1xuICAgIHByaXZhdGUgdm9pZCBEcmF3QmxhY2tCb3JkZXIoR3JhcGhpY3MgZykge1xuICAgICAgICBpbnQgUGlhbm9XaWR0aCA9IFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlICogTWF4T2N0YXZlO1xuICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTFCcnVzaCwgbWFyZ2luLCBtYXJnaW4sIFBpYW5vV2lkdGggKyBCbGFja0JvcmRlcioyLCBCbGFja0JvcmRlci0yKTtcbiAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkxQnJ1c2gsIG1hcmdpbiwgbWFyZ2luLCBCbGFja0JvcmRlciwgV2hpdGVLZXlIZWlnaHQgKyBCbGFja0JvcmRlciAqIDMpO1xuICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTFCcnVzaCwgbWFyZ2luLCBtYXJnaW4gKyBCbGFja0JvcmRlciArIFdoaXRlS2V5SGVpZ2h0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrQm9yZGVyKjIgKyBQaWFub1dpZHRoLCBCbGFja0JvcmRlcioyKTtcbiAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkxQnJ1c2gsIG1hcmdpbiArIEJsYWNrQm9yZGVyICsgUGlhbm9XaWR0aCwgbWFyZ2luLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrQm9yZGVyLCBXaGl0ZUtleUhlaWdodCArIEJsYWNrQm9yZGVyKjMpO1xuXG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTJQZW4sIG1hcmdpbiArIEJsYWNrQm9yZGVyLCBtYXJnaW4gKyBCbGFja0JvcmRlciAtMSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbiArIEJsYWNrQm9yZGVyICsgUGlhbm9XaWR0aCwgbWFyZ2luICsgQmxhY2tCb3JkZXIgLTEpO1xuICAgICAgICBcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0obWFyZ2luICsgQmxhY2tCb3JkZXIsIG1hcmdpbiArIEJsYWNrQm9yZGVyKTsgXG5cbiAgICAgICAgLy8gRHJhdyB0aGUgZ3JheSBib3R0b21zIG9mIHRoZSB3aGl0ZSBrZXlzICBcbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBLZXlzUGVyT2N0YXZlICogTWF4T2N0YXZlOyBpKyspIHtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShncmF5MkJydXNoLCBpKldoaXRlS2V5V2lkdGgrMSwgV2hpdGVLZXlIZWlnaHQrMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgV2hpdGVLZXlXaWR0aC0yLCBCbGFja0JvcmRlci8yKTtcbiAgICAgICAgfVxuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKG1hcmdpbiArIEJsYWNrQm9yZGVyKSwgLShtYXJnaW4gKyBCbGFja0JvcmRlcikpOyBcbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgbm90ZSBsZXR0ZXJzIHVuZGVybmVhdGggZWFjaCB3aGl0ZSBub3RlICovXG4gICAgcHJpdmF0ZSB2b2lkIERyYXdOb3RlTGV0dGVycyhHcmFwaGljcyBnKSB7XG4gICAgICAgIHN0cmluZ1tdIGxldHRlcnMgPSB7IFwiQ1wiLCBcIkRcIiwgXCJFXCIsIFwiRlwiLCBcIkdcIiwgXCJBXCIsIFwiQlwiIH07XG4gICAgICAgIHN0cmluZ1tdIG51bWJlcnMgPSB7IFwiMVwiLCBcIjNcIiwgXCI1XCIsIFwiNlwiLCBcIjhcIiwgXCIxMFwiLCBcIjEyXCIgfTtcbiAgICAgICAgc3RyaW5nW10gbmFtZXM7XG4gICAgICAgIGlmIChzaG93Tm90ZUxldHRlcnMgPT0gTWlkaU9wdGlvbnMuTm90ZU5hbWVMZXR0ZXIpIHtcbiAgICAgICAgICAgIG5hbWVzID0gbGV0dGVycztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzaG93Tm90ZUxldHRlcnMgPT0gTWlkaU9wdGlvbnMuTm90ZU5hbWVGaXhlZE51bWJlcikge1xuICAgICAgICAgICAgbmFtZXMgPSBudW1iZXJzO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKG1hcmdpbiArIEJsYWNrQm9yZGVyLCBtYXJnaW4gKyBCbGFja0JvcmRlcik7IFxuICAgICAgICBmb3IgKGludCBvY3RhdmUgPSAwOyBvY3RhdmUgPCBNYXhPY3RhdmU7IG9jdGF2ZSsrKSB7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IEtleXNQZXJPY3RhdmU7IGkrKykge1xuICAgICAgICAgICAgICAgIGcuRHJhd1N0cmluZyhuYW1lc1tpXSwgU2hlZXRNdXNpYy5MZXR0ZXJGb250LCBCcnVzaGVzLldoaXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAob2N0YXZlKktleXNQZXJPY3RhdmUgKyBpKSAqIFdoaXRlS2V5V2lkdGggKyBXaGl0ZUtleVdpZHRoLzMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFdoaXRlS2V5SGVpZ2h0ICsgQmxhY2tCb3JkZXIgKiAzLzQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0obWFyZ2luICsgQmxhY2tCb3JkZXIpLCAtKG1hcmdpbiArIEJsYWNrQm9yZGVyKSk7IFxuICAgIH1cblxuICAgIC8qKiBEcmF3IHRoZSBQaWFuby4gKi9cbiAgICBwcm90ZWN0ZWQgLypvdmVycmlkZSovIHZvaWQgT25QYWludChQYWludEV2ZW50QXJncyBlKSB7XG4gICAgICAgIEdyYXBoaWNzIGcgPSBlLkdyYXBoaWNzKCk7XG4gICAgICAgIGcuU21vb3RoaW5nTW9kZSA9IFNtb290aGluZ01vZGUuTm9uZTtcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0obWFyZ2luICsgQmxhY2tCb3JkZXIsIG1hcmdpbiArIEJsYWNrQm9yZGVyKTsgXG4gICAgICAgIGcuRmlsbFJlY3RhbmdsZShCcnVzaGVzLldoaXRlLCAwLCAwLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlICogTWF4T2N0YXZlLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgIERyYXdCbGFja0tleXMoZyk7XG4gICAgICAgIERyYXdPdXRsaW5lKGcpO1xuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKG1hcmdpbiArIEJsYWNrQm9yZGVyKSwgLShtYXJnaW4gKyBCbGFja0JvcmRlcikpO1xuICAgICAgICBEcmF3QmxhY2tCb3JkZXIoZyk7XG4gICAgICAgIGlmIChzaG93Tm90ZUxldHRlcnMgIT0gTWlkaU9wdGlvbnMuTm90ZU5hbWVOb25lKSB7XG4gICAgICAgICAgICBEcmF3Tm90ZUxldHRlcnMoZyk7XG4gICAgICAgIH1cbiAgICAgICAgZy5TbW9vdGhpbmdNb2RlID0gU21vb3RoaW5nTW9kZS5BbnRpQWxpYXM7XG4gICAgfVxuXG4gICAgLyogU2hhZGUgdGhlIGdpdmVuIG5vdGUgd2l0aCB0aGUgZ2l2ZW4gYnJ1c2guXG4gICAgICogV2Ugb25seSBkcmF3IG5vdGVzIGZyb20gbm90ZW51bWJlciAyNCB0byA5Ni5cbiAgICAgKiAoTWlkZGxlLUMgaXMgNjApLlxuICAgICAqL1xuICAgIHByaXZhdGUgdm9pZCBTaGFkZU9uZU5vdGUoR3JhcGhpY3MgZywgaW50IG5vdGVudW1iZXIsIEJydXNoIGJydXNoKSB7XG4gICAgICAgIGludCBvY3RhdmUgPSBub3RlbnVtYmVyIC8gMTI7XG4gICAgICAgIGludCBub3Rlc2NhbGUgPSBub3RlbnVtYmVyICUgMTI7XG5cbiAgICAgICAgb2N0YXZlIC09IDI7XG4gICAgICAgIGlmIChvY3RhdmUgPCAwIHx8IG9jdGF2ZSA+PSBNYXhPY3RhdmUpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0ob2N0YXZlICogV2hpdGVLZXlXaWR0aCAqIEtleXNQZXJPY3RhdmUsIDApO1xuICAgICAgICBpbnQgeDEsIHgyLCB4MztcblxuICAgICAgICBpbnQgYm90dG9tSGFsZkhlaWdodCA9IFdoaXRlS2V5SGVpZ2h0IC0gKEJsYWNrS2V5SGVpZ2h0KzMpO1xuXG4gICAgICAgIC8qIG5vdGVzY2FsZSBnb2VzIGZyb20gMCB0byAxMSwgZnJvbSBDIHRvIEIuICovXG4gICAgICAgIHN3aXRjaCAobm90ZXNjYWxlKSB7XG4gICAgICAgIGNhc2UgMDogLyogQyAqL1xuICAgICAgICAgICAgeDEgPSAyO1xuICAgICAgICAgICAgeDIgPSBibGFja0tleU9mZnNldHNbMF0gLSAyO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgMCwgeDIgLSB4MSwgQmxhY2tLZXlIZWlnaHQrMyk7XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgxLCBCbGFja0tleUhlaWdodCszLCBXaGl0ZUtleVdpZHRoLTMsIGJvdHRvbUhhbGZIZWlnaHQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTogLyogQyMgKi9cbiAgICAgICAgICAgIHgxID0gYmxhY2tLZXlPZmZzZXRzWzBdOyBcbiAgICAgICAgICAgIHgyID0gYmxhY2tLZXlPZmZzZXRzWzFdO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgMCwgeDIgLSB4MSwgQmxhY2tLZXlIZWlnaHQpO1xuICAgICAgICAgICAgaWYgKGJydXNoID09IGdyYXkxQnJ1c2gpIHtcbiAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTJCcnVzaCwgeDErMSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrS2V5SGVpZ2h0IC0gQmxhY2tLZXlIZWlnaHQvOCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrS2V5V2lkdGgtMiwgQmxhY2tLZXlIZWlnaHQvOCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOiAvKiBEICovXG4gICAgICAgICAgICB4MSA9IFdoaXRlS2V5V2lkdGggKyAyO1xuICAgICAgICAgICAgeDIgPSBibGFja0tleU9mZnNldHNbMV0gKyAzO1xuICAgICAgICAgICAgeDMgPSBibGFja0tleU9mZnNldHNbMl0gLSAyOyBcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDIsIDAsIHgzIC0geDIsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6IC8qIEQjICovXG4gICAgICAgICAgICB4MSA9IGJsYWNrS2V5T2Zmc2V0c1syXTsgXG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1szXTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIDAsIEJsYWNrS2V5V2lkdGgsIEJsYWNrS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgIGlmIChicnVzaCA9PSBncmF5MUJydXNoKSB7XG4gICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkyQnJ1c2gsIHgxKzEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleUhlaWdodCAtIEJsYWNrS2V5SGVpZ2h0LzgsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleVdpZHRoLTIsIEJsYWNrS2V5SGVpZ2h0LzgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDogLyogRSAqL1xuICAgICAgICAgICAgeDEgPSBXaGl0ZUtleVdpZHRoICogMiArIDI7XG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1szXSArIDM7IFxuICAgICAgICAgICAgeDMgPSBXaGl0ZUtleVdpZHRoICogMyAtIDE7XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgyLCAwLCB4MyAtIHgyLCBCbGFja0tleUhlaWdodCszKTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIEJsYWNrS2V5SGVpZ2h0KzMsIFdoaXRlS2V5V2lkdGgtMywgYm90dG9tSGFsZkhlaWdodCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1OiAvKiBGICovXG4gICAgICAgICAgICB4MSA9IFdoaXRlS2V5V2lkdGggKiAzICsgMjtcbiAgICAgICAgICAgIHgyID0gYmxhY2tLZXlPZmZzZXRzWzRdIC0gMjsgXG4gICAgICAgICAgICB4MyA9IFdoaXRlS2V5V2lkdGggKiA0IC0gMjtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIDAsIHgyIC0geDEsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY6IC8qIEYjICovXG4gICAgICAgICAgICB4MSA9IGJsYWNrS2V5T2Zmc2V0c1s0XTsgXG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1s1XTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIDAsIEJsYWNrS2V5V2lkdGgsIEJsYWNrS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgIGlmIChicnVzaCA9PSBncmF5MUJydXNoKSB7XG4gICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkyQnJ1c2gsIHgxKzEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleUhlaWdodCAtIEJsYWNrS2V5SGVpZ2h0LzgsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleVdpZHRoLTIsIEJsYWNrS2V5SGVpZ2h0LzgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNzogLyogRyAqL1xuICAgICAgICAgICAgeDEgPSBXaGl0ZUtleVdpZHRoICogNCArIDI7XG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1s1XSArIDM7IFxuICAgICAgICAgICAgeDMgPSBibGFja0tleU9mZnNldHNbNl0gLSAyOyBcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDIsIDAsIHgzIC0geDIsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDg6IC8qIEcjICovXG4gICAgICAgICAgICB4MSA9IGJsYWNrS2V5T2Zmc2V0c1s2XTsgXG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1s3XTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIDAsIEJsYWNrS2V5V2lkdGgsIEJsYWNrS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgIGlmIChicnVzaCA9PSBncmF5MUJydXNoKSB7XG4gICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkyQnJ1c2gsIHgxKzEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleUhlaWdodCAtIEJsYWNrS2V5SGVpZ2h0LzgsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleVdpZHRoLTIsIEJsYWNrS2V5SGVpZ2h0LzgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgOTogLyogQSAqL1xuICAgICAgICAgICAgeDEgPSBXaGl0ZUtleVdpZHRoICogNSArIDI7XG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1s3XSArIDM7IFxuICAgICAgICAgICAgeDMgPSBibGFja0tleU9mZnNldHNbOF0gLSAyOyBcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDIsIDAsIHgzIC0geDIsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEwOiAvKiBBIyAqL1xuICAgICAgICAgICAgeDEgPSBibGFja0tleU9mZnNldHNbOF07IFxuICAgICAgICAgICAgeDIgPSBibGFja0tleU9mZnNldHNbOV07XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgxLCAwLCBCbGFja0tleVdpZHRoLCBCbGFja0tleUhlaWdodCk7XG4gICAgICAgICAgICBpZiAoYnJ1c2ggPT0gZ3JheTFCcnVzaCkge1xuICAgICAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShncmF5MkJydXNoLCB4MSsxLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmxhY2tLZXlIZWlnaHQgLSBCbGFja0tleUhlaWdodC84LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmxhY2tLZXlXaWR0aC0yLCBCbGFja0tleUhlaWdodC84KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDExOiAvKiBCICovXG4gICAgICAgICAgICB4MSA9IFdoaXRlS2V5V2lkdGggKiA2ICsgMjtcbiAgICAgICAgICAgIHgyID0gYmxhY2tLZXlPZmZzZXRzWzldICsgMzsgXG4gICAgICAgICAgICB4MyA9IFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlIC0gMTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDIsIDAsIHgzIC0geDIsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShvY3RhdmUgKiBXaGl0ZUtleVdpZHRoICogS2V5c1Blck9jdGF2ZSksIDApO1xuICAgIH1cblxuICAgIC8qKiBGaW5kIHRoZSBNaWRpTm90ZSB3aXRoIHRoZSBzdGFydFRpbWUgY2xvc2VzdCB0byB0aGUgZ2l2ZW4gdGltZS5cbiAgICAgKiAgUmV0dXJuIHRoZSBpbmRleCBvZiB0aGUgbm90ZS4gIFVzZSBhIGJpbmFyeSBzZWFyY2ggbWV0aG9kLlxuICAgICAqL1xuICAgIHByaXZhdGUgaW50IEZpbmRDbG9zZXN0U3RhcnRUaW1lKGludCBwdWxzZVRpbWUpIHtcbiAgICAgICAgaW50IGxlZnQgPSAwO1xuICAgICAgICBpbnQgcmlnaHQgPSBub3Rlcy5Db3VudC0xO1xuXG4gICAgICAgIHdoaWxlIChyaWdodCAtIGxlZnQgPiAxKSB7XG4gICAgICAgICAgICBpbnQgaSA9IChyaWdodCArIGxlZnQpLzI7XG4gICAgICAgICAgICBpZiAobm90ZXNbbGVmdF0uU3RhcnRUaW1lID09IHB1bHNlVGltZSlcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGVsc2UgaWYgKG5vdGVzW2ldLlN0YXJ0VGltZSA8PSBwdWxzZVRpbWUpXG4gICAgICAgICAgICAgICAgbGVmdCA9IGk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmlnaHQgPSBpO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChsZWZ0ID49IDEgJiYgKG5vdGVzW2xlZnQtMV0uU3RhcnRUaW1lID09IG5vdGVzW2xlZnRdLlN0YXJ0VGltZSkpIHtcbiAgICAgICAgICAgIGxlZnQtLTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGVmdDtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBuZXh0IFN0YXJ0VGltZSB0aGF0IG9jY3VycyBhZnRlciB0aGUgTWlkaU5vdGVcbiAgICAgKiAgYXQgb2Zmc2V0IGksIHRoYXQgaXMgYWxzbyBpbiB0aGUgc2FtZSB0cmFjay9jaGFubmVsLlxuICAgICAqL1xuICAgIHByaXZhdGUgaW50IE5leHRTdGFydFRpbWVTYW1lVHJhY2soaW50IGkpIHtcbiAgICAgICAgaW50IHN0YXJ0ID0gbm90ZXNbaV0uU3RhcnRUaW1lO1xuICAgICAgICBpbnQgZW5kID0gbm90ZXNbaV0uRW5kVGltZTtcbiAgICAgICAgaW50IHRyYWNrID0gbm90ZXNbaV0uQ2hhbm5lbDtcblxuICAgICAgICB3aGlsZSAoaSA8IG5vdGVzLkNvdW50KSB7XG4gICAgICAgICAgICBpZiAobm90ZXNbaV0uQ2hhbm5lbCAhPSB0cmFjaykge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChub3Rlc1tpXS5TdGFydFRpbWUgPiBzdGFydCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBub3Rlc1tpXS5TdGFydFRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbmQgPSBNYXRoLk1heChlbmQsIG5vdGVzW2ldLkVuZFRpbWUpO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbmQ7XG4gICAgfVxuXG5cbiAgICAvKiogUmV0dXJuIHRoZSBuZXh0IFN0YXJ0VGltZSB0aGF0IG9jY3VycyBhZnRlciB0aGUgTWlkaU5vdGVcbiAgICAgKiAgYXQgb2Zmc2V0IGkuICBJZiBhbGwgdGhlIHN1YnNlcXVlbnQgbm90ZXMgaGF2ZSB0aGUgc2FtZVxuICAgICAqICBTdGFydFRpbWUsIHRoZW4gcmV0dXJuIHRoZSBsYXJnZXN0IEVuZFRpbWUuXG4gICAgICovXG4gICAgcHJpdmF0ZSBpbnQgTmV4dFN0YXJ0VGltZShpbnQgaSkge1xuICAgICAgICBpbnQgc3RhcnQgPSBub3Rlc1tpXS5TdGFydFRpbWU7XG4gICAgICAgIGludCBlbmQgPSBub3Rlc1tpXS5FbmRUaW1lO1xuXG4gICAgICAgIHdoaWxlIChpIDwgbm90ZXMuQ291bnQpIHtcbiAgICAgICAgICAgIGlmIChub3Rlc1tpXS5TdGFydFRpbWUgPiBzdGFydCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBub3Rlc1tpXS5TdGFydFRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbmQgPSBNYXRoLk1heChlbmQsIG5vdGVzW2ldLkVuZFRpbWUpO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbmQ7XG4gICAgfVxuXG4gICAgLyoqIEZpbmQgdGhlIE1pZGkgbm90ZXMgdGhhdCBvY2N1ciBpbiB0aGUgY3VycmVudCB0aW1lLlxuICAgICAqICBTaGFkZSB0aG9zZSBub3RlcyBvbiB0aGUgcGlhbm8gZGlzcGxheWVkLlxuICAgICAqICBVbi1zaGFkZSB0aGUgdGhvc2Ugbm90ZXMgcGxheWVkIGluIHRoZSBwcmV2aW91cyB0aW1lLlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIFNoYWRlTm90ZXMoaW50IGN1cnJlbnRQdWxzZVRpbWUsIGludCBwcmV2UHVsc2VUaW1lKSB7XG4gICAgICAgIGlmIChub3RlcyA9PSBudWxsIHx8IG5vdGVzLkNvdW50ID09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ3JhcGhpY3MgPT0gbnVsbCkge1xuICAgICAgICAgICAgZ3JhcGhpY3MgPSBDcmVhdGVHcmFwaGljcyhcInNoYWRlTm90ZXNfcGlhbm9cIik7XG4gICAgICAgIH1cbiAgICAgICAgZ3JhcGhpY3MuU21vb3RoaW5nTW9kZSA9IFNtb290aGluZ01vZGUuTm9uZTtcbiAgICAgICAgZ3JhcGhpY3MuVHJhbnNsYXRlVHJhbnNmb3JtKG1hcmdpbiArIEJsYWNrQm9yZGVyLCBtYXJnaW4gKyBCbGFja0JvcmRlcik7XG5cbiAgICAgICAgLyogTG9vcCB0aHJvdWdoIHRoZSBNaWRpIG5vdGVzLlxuICAgICAgICAgKiBVbnNoYWRlIG5vdGVzIHdoZXJlIFN0YXJ0VGltZSA8PSBwcmV2UHVsc2VUaW1lIDwgbmV4dCBTdGFydFRpbWVcbiAgICAgICAgICogU2hhZGUgbm90ZXMgd2hlcmUgU3RhcnRUaW1lIDw9IGN1cnJlbnRQdWxzZVRpbWUgPCBuZXh0IFN0YXJ0VGltZVxuICAgICAgICAgKi9cbiAgICAgICAgaW50IGxhc3RTaGFkZWRJbmRleCA9IEZpbmRDbG9zZXN0U3RhcnRUaW1lKHByZXZQdWxzZVRpbWUgLSBtYXhTaGFkZUR1cmF0aW9uICogMik7XG4gICAgICAgIGZvciAoaW50IGkgPSBsYXN0U2hhZGVkSW5kZXg7IGkgPCBub3Rlcy5Db3VudDsgaSsrKSB7XG4gICAgICAgICAgICBpbnQgc3RhcnQgPSBub3Rlc1tpXS5TdGFydFRpbWU7XG4gICAgICAgICAgICBpbnQgZW5kID0gbm90ZXNbaV0uRW5kVGltZTtcbiAgICAgICAgICAgIGludCBub3RlbnVtYmVyID0gbm90ZXNbaV0uTnVtYmVyO1xuICAgICAgICAgICAgaW50IG5leHRTdGFydCA9IE5leHRTdGFydFRpbWUoaSk7XG4gICAgICAgICAgICBpbnQgbmV4dFN0YXJ0VHJhY2sgPSBOZXh0U3RhcnRUaW1lU2FtZVRyYWNrKGkpO1xuICAgICAgICAgICAgZW5kID0gTWF0aC5NYXgoZW5kLCBuZXh0U3RhcnRUcmFjayk7XG4gICAgICAgICAgICBlbmQgPSBNYXRoLk1pbihlbmQsIHN0YXJ0ICsgbWF4U2hhZGVEdXJhdGlvbi0xKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8qIElmIHdlJ3ZlIHBhc3QgdGhlIHByZXZpb3VzIGFuZCBjdXJyZW50IHRpbWVzLCB3ZSdyZSBkb25lLiAqL1xuICAgICAgICAgICAgaWYgKChzdGFydCA+IHByZXZQdWxzZVRpbWUpICYmIChzdGFydCA+IGN1cnJlbnRQdWxzZVRpbWUpKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIElmIHNoYWRlZCBub3RlcyBhcmUgdGhlIHNhbWUsIHdlJ3JlIGRvbmUgKi9cbiAgICAgICAgICAgIGlmICgoc3RhcnQgPD0gY3VycmVudFB1bHNlVGltZSkgJiYgKGN1cnJlbnRQdWxzZVRpbWUgPCBuZXh0U3RhcnQpICYmXG4gICAgICAgICAgICAgICAgKGN1cnJlbnRQdWxzZVRpbWUgPCBlbmQpICYmIFxuICAgICAgICAgICAgICAgIChzdGFydCA8PSBwcmV2UHVsc2VUaW1lKSAmJiAocHJldlB1bHNlVGltZSA8IG5leHRTdGFydCkgJiZcbiAgICAgICAgICAgICAgICAocHJldlB1bHNlVGltZSA8IGVuZCkpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogSWYgdGhlIG5vdGUgaXMgaW4gdGhlIGN1cnJlbnQgdGltZSwgc2hhZGUgaXQgKi9cbiAgICAgICAgICAgIGlmICgoc3RhcnQgPD0gY3VycmVudFB1bHNlVGltZSkgJiYgKGN1cnJlbnRQdWxzZVRpbWUgPCBlbmQpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHVzZVR3b0NvbG9ycykge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm90ZXNbaV0uQ2hhbm5lbCA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTaGFkZU9uZU5vdGUoZ3JhcGhpY3MsIG5vdGVudW1iZXIsIHNoYWRlMkJydXNoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFNoYWRlT25lTm90ZShncmFwaGljcywgbm90ZW51bWJlciwgc2hhZGVCcnVzaCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIFNoYWRlT25lTm90ZShncmFwaGljcywgbm90ZW51bWJlciwgc2hhZGVCcnVzaCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBJZiB0aGUgbm90ZSBpcyBpbiB0aGUgcHJldmlvdXMgdGltZSwgdW4tc2hhZGUgaXQsIGRyYXcgaXQgd2hpdGUuICovXG4gICAgICAgICAgICBlbHNlIGlmICgoc3RhcnQgPD0gcHJldlB1bHNlVGltZSkgJiYgKHByZXZQdWxzZVRpbWUgPCBlbmQpKSB7XG4gICAgICAgICAgICAgICAgaW50IG51bSA9IG5vdGVudW1iZXIgJSAxMjtcbiAgICAgICAgICAgICAgICBpZiAobnVtID09IDEgfHwgbnVtID09IDMgfHwgbnVtID09IDYgfHwgbnVtID09IDggfHwgbnVtID09IDEwKSB7XG4gICAgICAgICAgICAgICAgICAgIFNoYWRlT25lTm90ZShncmFwaGljcywgbm90ZW51bWJlciwgZ3JheTFCcnVzaCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBTaGFkZU9uZU5vdGUoZ3JhcGhpY3MsIG5vdGVudW1iZXIsIEJydXNoZXMuV2hpdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBncmFwaGljcy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShtYXJnaW4gKyBCbGFja0JvcmRlciksIC0obWFyZ2luICsgQmxhY2tCb3JkZXIpKTtcbiAgICAgICAgZ3JhcGhpY3MuU21vb3RoaW5nTW9kZSA9IFNtb290aGluZ01vZGUuQW50aUFsaWFzO1xuICAgIH1cbn1cblxufVxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG5cbi8qIEBjbGFzcyBSZXN0U3ltYm9sXG4gKiBBIFJlc3Qgc3ltYm9sIHJlcHJlc2VudHMgYSByZXN0IC0gd2hvbGUsIGhhbGYsIHF1YXJ0ZXIsIG9yIGVpZ2h0aC5cbiAqIFRoZSBSZXN0IHN5bWJvbCBoYXMgYSBzdGFydHRpbWUgYW5kIGEgZHVyYXRpb24sIGp1c3QgbGlrZSBhIHJlZ3VsYXJcbiAqIG5vdGUuXG4gKi9cbnB1YmxpYyBjbGFzcyBSZXN0U3ltYm9sIDogTXVzaWNTeW1ib2wge1xuICAgIHByaXZhdGUgaW50IHN0YXJ0dGltZTsgICAgICAgICAgLyoqIFRoZSBzdGFydHRpbWUgb2YgdGhlIHJlc3QgKi9cbiAgICBwcml2YXRlIE5vdGVEdXJhdGlvbiBkdXJhdGlvbjsgIC8qKiBUaGUgcmVzdCBkdXJhdGlvbiAoZWlnaHRoLCBxdWFydGVyLCBoYWxmLCB3aG9sZSkgKi9cbiAgICBwcml2YXRlIGludCB3aWR0aDsgICAgICAgICAgICAgIC8qKiBUaGUgd2lkdGggaW4gcGl4ZWxzICovXG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IHJlc3Qgc3ltYm9sIHdpdGggdGhlIGdpdmVuIHN0YXJ0IHRpbWUgYW5kIGR1cmF0aW9uICovXG4gICAgcHVibGljIFJlc3RTeW1ib2woaW50IHN0YXJ0LCBOb3RlRHVyYXRpb24gZHVyKSB7XG4gICAgICAgIHN0YXJ0dGltZSA9IHN0YXJ0O1xuICAgICAgICBkdXJhdGlvbiA9IGR1cjsgXG4gICAgICAgIHdpZHRoID0gTWluV2lkdGg7XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgdGltZSAoaW4gcHVsc2VzKSB0aGlzIHN5bWJvbCBvY2N1cnMgYXQuXG4gICAgICogVGhpcyBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgbWVhc3VyZSB0aGlzIHN5bWJvbCBiZWxvbmdzIHRvLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgU3RhcnRUaW1lIHsgXG4gICAgICAgIGdldCB7IHJldHVybiBzdGFydHRpbWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0L1NldCB0aGUgd2lkdGggKGluIHBpeGVscykgb2YgdGhpcyBzeW1ib2wuIFRoZSB3aWR0aCBpcyBzZXRcbiAgICAgKiBpbiBTaGVldE11c2ljLkFsaWduU3ltYm9scygpIHRvIHZlcnRpY2FsbHkgYWxpZ24gc3ltYm9scy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFdpZHRoIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgIHNldCB7IHdpZHRoID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBtaW5pbXVtIHdpZHRoIChpbiBwaXhlbHMpIG5lZWRlZCB0byBkcmF3IHRoaXMgc3ltYm9sICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBNaW5XaWR0aCB7XG4gICAgICAgIGdldCB7IHJldHVybiAyICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICsgXG4gICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGFib3ZlIHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEFib3ZlU3RhZmYgeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIDA7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYmVsb3cgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQmVsb3dTdGFmZiB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBEcmF3IHRoZSBzeW1ib2wuXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHlsb2NhdGlvbiAoaW4gcGl4ZWxzKSB3aGVyZSB0aGUgdG9wIG9mIHRoZSBzdGFmZiBzdGFydHMuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIFxuICAgIHZvaWQgRHJhdyhHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICAvKiBBbGlnbiB0aGUgcmVzdCBzeW1ib2wgdG8gdGhlIHJpZ2h0ICovXG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKFdpZHRoIC0gTWluV2lkdGgsIDApO1xuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybShTaGVldE11c2ljLk5vdGVIZWlnaHQvMiwgMCk7XG5cbiAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5XaG9sZSkge1xuICAgICAgICAgICAgRHJhd1dob2xlKGcsIHBlbiwgeXRvcCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkhhbGYpIHtcbiAgICAgICAgICAgIERyYXdIYWxmKGcsIHBlbiwgeXRvcCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlF1YXJ0ZXIpIHtcbiAgICAgICAgICAgIERyYXdRdWFydGVyKGcsIHBlbiwgeXRvcCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkVpZ2h0aCkge1xuICAgICAgICAgICAgRHJhd0VpZ2h0aChnLCBwZW4sIHl0b3ApO1xuICAgICAgICB9XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC1TaGVldE11c2ljLk5vdGVIZWlnaHQvMiwgMCk7XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0oV2lkdGggLSBNaW5XaWR0aCksIDApO1xuICAgIH1cblxuXG4gICAgLyoqIERyYXcgYSB3aG9sZSByZXN0IHN5bWJvbCwgYSByZWN0YW5nbGUgYmVsb3cgYSBzdGFmZiBsaW5lLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIERyYXdXaG9sZShHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICBpbnQgeSA9IHl0b3AgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG5cbiAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKEJydXNoZXMuQmxhY2ssIDAsIHksIFxuICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlV2lkdGgsIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yKTtcbiAgICB9XG5cbiAgICAvKiogRHJhdyBhIGhhbGYgcmVzdCBzeW1ib2wsIGEgcmVjdGFuZ2xlIGFib3ZlIGEgc3RhZmYgbGluZS5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3SGFsZihHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICBpbnQgeSA9IHl0b3AgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcblxuICAgICAgICBnLkZpbGxSZWN0YW5nbGUoQnJ1c2hlcy5CbGFjaywgMCwgeSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVXaWR0aCwgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIpO1xuICAgIH1cblxuICAgIC8qKiBEcmF3IGEgcXVhcnRlciByZXN0IHN5bWJvbC5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3UXVhcnRlcihHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICBwZW4uRW5kQ2FwID0gTGluZUNhcC5GbGF0O1xuXG4gICAgICAgIGludCB5ID0geXRvcCArIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICBpbnQgeCA9IDI7XG4gICAgICAgIGludCB4ZW5kID0geCArIDIqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzM7XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCB4LCB5LCB4ZW5kLTEsIHkgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQtMSk7XG5cbiAgICAgICAgcGVuLldpZHRoID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvMjtcbiAgICAgICAgeSAgPSB5dG9wICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICsgMTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHhlbmQtMiwgeSwgeCwgeSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCk7XG5cbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICAgICAgeSA9IHl0b3AgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQqMiAtIDE7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCAwLCB5LCB4ZW5kKzIsIHkgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQpOyBcblxuICAgICAgICBwZW4uV2lkdGggPSBTaGVldE11c2ljLkxpbmVTcGFjZS8yO1xuICAgICAgICBpZiAoU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ID09IDYpIHtcbiAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4ZW5kLCB5ICsgMSArIDMqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeC8yLCB5ICsgMSArIDMqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgeyAgLyogTm90ZUhlaWdodCA9PSA4ICovXG4gICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeGVuZCwgeSArIDMqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeC8yLCB5ICsgMypTaGVldE11c2ljLk5vdGVIZWlnaHQvNCk7XG4gICAgICAgIH1cblxuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgMCwgeSArIDIqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzMgKyAxLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHhlbmQgLSAxLCB5ICsgMypTaGVldE11c2ljLk5vdGVIZWlnaHQvMik7XG4gICAgfVxuXG4gICAgLyoqIERyYXcgYW4gZWlnaHRoIHJlc3Qgc3ltYm9sLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIERyYXdFaWdodGgoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3ApIHtcbiAgICAgICAgaW50IHkgPSB5dG9wICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0IC0gMTtcbiAgICAgICAgZy5GaWxsRWxsaXBzZShCcnVzaGVzLkJsYWNrLCAwLCB5KzEsIFxuICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGluZVNwYWNlLTEsIFNoZWV0TXVzaWMuTGluZVNwYWNlLTEpO1xuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgKFNoZWV0TXVzaWMuTGluZVNwYWNlLTIpLzIsIHkgKyBTaGVldE11c2ljLkxpbmVTcGFjZS0xLFxuICAgICAgICAgICAgICAgICAgICAgICAgMypTaGVldE11c2ljLkxpbmVTcGFjZS8yLCB5ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMik7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCAzKlNoZWV0TXVzaWMuTGluZVNwYWNlLzIsIHkgKyBTaGVldE11c2ljLkxpbmVTcGFjZS8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgMypTaGVldE11c2ljLkxpbmVTcGFjZS80LCB5ICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIpO1xuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiUmVzdFN5bWJvbCBzdGFydHRpbWU9ezB9IGR1cmF0aW9uPXsxfSB3aWR0aD17Mn1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnR0aW1lLCBkdXJhdGlvbiwgd2lkdGgpO1xuICAgIH1cblxufVxuXG5cbn1cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDEyIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG5cclxuXHJcbiAgICAvKiogQGNsYXNzIFNoZWV0TXVzaWNcbiAgICAgKlxuICAgICAqIFRoZSBTaGVldE11c2ljIENvbnRyb2wgaXMgdGhlIG1haW4gY2xhc3MgZm9yIGRpc3BsYXlpbmcgdGhlIHNoZWV0IG11c2ljLlxuICAgICAqIFRoZSBTaGVldE11c2ljIGNsYXNzIGhhcyB0aGUgZm9sbG93aW5nIHB1YmxpYyBtZXRob2RzOlxuICAgICAqXG4gICAgICogU2hlZXRNdXNpYygpXG4gICAgICogICBDcmVhdGUgYSBuZXcgU2hlZXRNdXNpYyBjb250cm9sIGZyb20gdGhlIGdpdmVuIG1pZGkgZmlsZSBhbmQgb3B0aW9ucy5cbiAgICAgKiBcbiAgICAgKiBTZXRab29tKClcbiAgICAgKiAgIFNldCB0aGUgem9vbSBsZXZlbCB0byBkaXNwbGF5IHRoZSBzaGVldCBtdXNpYyBhdC5cbiAgICAgKlxuICAgICAqIERvUHJpbnQoKVxuICAgICAqICAgUHJpbnQgYSBzaW5nbGUgcGFnZSBvZiBzaGVldCBtdXNpYy5cbiAgICAgKlxuICAgICAqIEdldFRvdGFsUGFnZXMoKVxuICAgICAqICAgR2V0IHRoZSB0b3RhbCBudW1iZXIgb2Ygc2hlZXQgbXVzaWMgcGFnZXMuXG4gICAgICpcbiAgICAgKiBPblBhaW50KClcbiAgICAgKiAgIE1ldGhvZCBjYWxsZWQgdG8gZHJhdyB0aGUgU2hlZXRNdWlzY1xuICAgICAqXG4gICAgICogVGhlc2UgcHVibGljIG1ldGhvZHMgYXJlIGNhbGxlZCBmcm9tIHRoZSBNaWRpU2hlZXRNdXNpYyBGb3JtIFdpbmRvdy5cbiAgICAgKlxuICAgICAqL1xyXG4gICAgcHVibGljIGNsYXNzIFNoZWV0TXVzaWMgOiBDb250cm9sXHJcbiAgICB7XHJcblxyXG4gICAgICAgIC8qIE1lYXN1cmVtZW50cyB1c2VkIHdoZW4gZHJhd2luZy4gIEFsbCBtZWFzdXJlbWVudHMgYXJlIGluIHBpeGVscy5cclxuICAgICAgICAgKiBUaGUgdmFsdWVzIGRlcGVuZCBvbiB3aGV0aGVyIHRoZSBtZW51ICdMYXJnZSBOb3Rlcycgb3IgJ1NtYWxsIE5vdGVzJyBpcyBzZWxlY3RlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IExpbmVXaWR0aCA9IDE7ICAgIC8qKiBUaGUgd2lkdGggb2YgYSBsaW5lICovXHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBMZWZ0TWFyZ2luID0gNDsgICAvKiogVGhlIGxlZnQgbWFyZ2luICovXHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBUaXRsZUhlaWdodCA9IDE0OyAvKiogVGhlIGhlaWdodCBmb3IgdGhlIHRpdGxlIG9uIHRoZSBmaXJzdCBwYWdlICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBpbnQgTGluZVNwYWNlOyAgICAgICAgLyoqIFRoZSBzcGFjZSBiZXR3ZWVuIGxpbmVzIGluIHRoZSBzdGFmZiAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaW50IFN0YWZmSGVpZ2h0OyAgICAgIC8qKiBUaGUgaGVpZ2h0IGJldHdlZW4gdGhlIDUgaG9yaXpvbnRhbCBsaW5lcyBvZiB0aGUgc3RhZmYgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGludCBOb3RlSGVpZ2h0OyAgICAgIC8qKiBUaGUgaGVpZ2h0IG9mIGEgd2hvbGUgbm90ZSAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaW50IE5vdGVXaWR0aDsgICAgICAgLyoqIFRoZSB3aWR0aCBvZiBhIHdob2xlIG5vdGUgKi9cclxuXHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBQYWdlV2lkdGggPSA4MDA7ICAgIC8qKiBUaGUgd2lkdGggb2YgZWFjaCBwYWdlICovXHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBQYWdlSGVpZ2h0ID0gMTA1MDsgIC8qKiBUaGUgaGVpZ2h0IG9mIGVhY2ggcGFnZSAod2hlbiBwcmludGluZykgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIEZvbnQgTGV0dGVyRm9udDsgICAgICAgLyoqIFRoZSBmb250IGZvciBkcmF3aW5nIHRoZSBsZXR0ZXJzICovXHJcblxyXG4gICAgICAgIHByaXZhdGUgTGlzdDxTdGFmZj4gc3RhZmZzOyAvKiogVGhlIGFycmF5IG9mIHN0YWZmcyB0byBkaXNwbGF5IChmcm9tIHRvcCB0byBib3R0b20pICovXHJcbiAgICAgICAgcHJpdmF0ZSBLZXlTaWduYXR1cmUgbWFpbmtleTsgLyoqIFRoZSBtYWluIGtleSBzaWduYXR1cmUgKi9cclxuICAgICAgICBwcml2YXRlIGludCBudW10cmFja3M7ICAgICAvKiogVGhlIG51bWJlciBvZiB0cmFja3MgKi9cclxuICAgICAgICBwcml2YXRlIGZsb2F0IHpvb207ICAgICAgICAgIC8qKiBUaGUgem9vbSBsZXZlbCB0byBkcmF3IGF0ICgxLjAgPT0gMTAwJSkgKi9cclxuICAgICAgICBwcml2YXRlIGJvb2wgc2Nyb2xsVmVydDsgICAgLyoqIFdoZXRoZXIgdG8gc2Nyb2xsIHZlcnRpY2FsbHkgb3IgaG9yaXpvbnRhbGx5ICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdHJpbmcgZmlsZW5hbWU7ICAgICAgLyoqIFRoZSBuYW1lIG9mIHRoZSBtaWRpIGZpbGUgKi9cclxuICAgICAgICBwcml2YXRlIGludCBzaG93Tm90ZUxldHRlcnM7ICAgIC8qKiBEaXNwbGF5IHRoZSBub3RlIGxldHRlcnMgKi9cclxuICAgICAgICBwcml2YXRlIENvbG9yW10gTm90ZUNvbG9yczsgICAgIC8qKiBUaGUgbm90ZSBjb2xvcnMgdG8gdXNlICovXHJcbiAgICAgICAgcHJpdmF0ZSBTb2xpZEJydXNoIHNoYWRlQnJ1c2g7ICAvKiogVGhlIGJydXNoIGZvciBzaGFkaW5nICovXHJcbiAgICAgICAgcHJpdmF0ZSBTb2xpZEJydXNoIHNoYWRlMkJydXNoOyAvKiogVGhlIGJydXNoIGZvciBzaGFkaW5nIGxlZnQtaGFuZCBwaWFubyAqL1xyXG4gICAgICAgIHByaXZhdGUgU29saWRCcnVzaCBkZXNlbGVjdGVkU2hhZGVCcnVzaCA9IG5ldyBTb2xpZEJydXNoKENvbG9yLkxpZ2h0R3JheSk7IC8qKiBUaGUgYnJ1c2ggZm9yIHNoYWRpbmcgZGVzZWxlY3RlZCBhcmVhcyAqL1xyXG4gICAgICAgIHByaXZhdGUgUGVuIHBlbjsgICAgICAgICAgICAgICAgLyoqIFRoZSBibGFjayBwZW4gZm9yIGRyYXdpbmcgKi9cclxuXHJcbiAgICAgICAgcHVibGljIGludCBTZWxlY3Rpb25TdGFydFB1bHNlIHsgZ2V0OyBzZXQ7IH1cbiAgICAgICAgcHVibGljIGludCBTZWxlY3Rpb25FbmRQdWxzZSB7IGdldDsgc2V0OyB9XHJcblxyXG4gICAgICAgIC8qKiBJbml0aWFsaXplIHRoZSBkZWZhdWx0IG5vdGUgc2l6ZXMuICAqL1xyXG4gICAgICAgIHN0YXRpYyBTaGVldE11c2ljKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNldE5vdGVTaXplKGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBDcmVhdGUgYSBuZXcgU2hlZXRNdXNpYyBjb250cm9sLCB1c2luZyB0aGUgZ2l2ZW4gcGFyc2VkIE1pZGlGaWxlLlxuICAgICAgICAgKiAgVGhlIG9wdGlvbnMgY2FuIGJlIG51bGwuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBTaGVldE11c2ljKE1pZGlGaWxlIGZpbGUsIE1pZGlPcHRpb25zIG9wdGlvbnMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbml0KGZpbGUsIG9wdGlvbnMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIENyZWF0ZSBhIG5ldyBTaGVldE11c2ljIGNvbnRyb2wsIHVzaW5nIHRoZSBnaXZlbiBtaWRpIGZpbGVuYW1lLlxuICAgICAgICAgKiAgVGhlIG9wdGlvbnMgY2FuIGJlIG51bGwuXG4gICAgICAgICAqL1xyXG4gICAgICAgIC8vcHVibGljIFNoZWV0TXVzaWMoc3RyaW5nIGZpbGVuYW1lLCBNaWRpT3B0aW9ucyBvcHRpb25zKSB7XHJcbiAgICAgICAgLy8gICAgTWlkaUZpbGUgZmlsZSA9IG5ldyBNaWRpRmlsZShmaWxlbmFtZSk7XHJcbiAgICAgICAgLy8gICAgaW5pdChmaWxlLCBvcHRpb25zKTsgXHJcbiAgICAgICAgLy99XHJcblxyXG4gICAgICAgIC8qKiBDcmVhdGUgYSBuZXcgU2hlZXRNdXNpYyBjb250cm9sLCB1c2luZyB0aGUgZ2l2ZW4gcmF3IG1pZGkgYnl0ZVtdIGRhdGEuXG4gICAgICAgICAqICBUaGUgb3B0aW9ucyBjYW4gYmUgbnVsbC5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIFNoZWV0TXVzaWMoYnl0ZVtdIGRhdGEsIHN0cmluZyB0aXRsZSwgTWlkaU9wdGlvbnMgb3B0aW9ucylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIE1pZGlGaWxlIGZpbGUgPSBuZXcgTWlkaUZpbGUoZGF0YSwgdGl0bGUpO1xyXG4gICAgICAgICAgICBpbml0KGZpbGUsIG9wdGlvbnMpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBDcmVhdGUgYSBuZXcgU2hlZXRNdXNpYyBjb250cm9sLlxuICAgICAgICAgKiBNaWRpRmlsZSBpcyB0aGUgcGFyc2VkIG1pZGkgZmlsZSB0byBkaXNwbGF5LlxuICAgICAgICAgKiBTaGVldE11c2ljIE9wdGlvbnMgYXJlIHRoZSBtZW51IG9wdGlvbnMgdGhhdCB3ZXJlIHNlbGVjdGVkLlxuICAgICAgICAgKlxuICAgICAgICAgKiAtIEFwcGx5IGFsbCB0aGUgTWVudSBPcHRpb25zIHRvIHRoZSBNaWRpRmlsZSB0cmFja3MuXG4gICAgICAgICAqIC0gQ2FsY3VsYXRlIHRoZSBrZXkgc2lnbmF0dXJlXG4gICAgICAgICAqIC0gRm9yIGVhY2ggdHJhY2ssIGNyZWF0ZSBhIGxpc3Qgb2YgTXVzaWNTeW1ib2xzIChub3RlcywgcmVzdHMsIGJhcnMsIGV0YylcbiAgICAgICAgICogLSBWZXJ0aWNhbGx5IGFsaWduIHRoZSBtdXNpYyBzeW1ib2xzIGluIGFsbCB0aGUgdHJhY2tzXG4gICAgICAgICAqIC0gUGFydGl0aW9uIHRoZSBtdXNpYyBub3RlcyBpbnRvIGhvcml6b250YWwgc3RhZmZzXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyB2b2lkIGluaXQoTWlkaUZpbGUgZmlsZSwgTWlkaU9wdGlvbnMgb3B0aW9ucylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zID09IG51bGwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSBuZXcgTWlkaU9wdGlvbnMoZmlsZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgem9vbSA9IDEuMGY7XHJcbiAgICAgICAgICAgIGZpbGVuYW1lID0gZmlsZS5GaWxlTmFtZTtcclxuXHJcbiAgICAgICAgICAgIFNldENvbG9ycyhvcHRpb25zLmNvbG9ycywgb3B0aW9ucy5zaGFkZUNvbG9yLCBvcHRpb25zLnNoYWRlMkNvbG9yKTtcclxuICAgICAgICAgICAgcGVuID0gbmV3IFBlbihDb2xvci5CbGFjaywgMSk7XHJcblxyXG4gICAgICAgICAgICBMaXN0PE1pZGlUcmFjaz4gdHJhY2tzID0gZmlsZS5DaGFuZ2VNaWRpTm90ZXMob3B0aW9ucyk7XHJcbiAgICAgICAgICAgIFNldE5vdGVTaXplKG9wdGlvbnMubGFyZ2VOb3RlU2l6ZSk7XHJcbiAgICAgICAgICAgIHNjcm9sbFZlcnQgPSBvcHRpb25zLnNjcm9sbFZlcnQ7XHJcbiAgICAgICAgICAgIHNob3dOb3RlTGV0dGVycyA9IG9wdGlvbnMuc2hvd05vdGVMZXR0ZXJzO1xyXG4gICAgICAgICAgICBUaW1lU2lnbmF0dXJlIHRpbWUgPSBmaWxlLlRpbWU7XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnRpbWUgIT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGltZSA9IG9wdGlvbnMudGltZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5rZXkgPT0gLTEpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1haW5rZXkgPSBHZXRLZXlTaWduYXR1cmUodHJhY2tzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1haW5rZXkgPSBuZXcgS2V5U2lnbmF0dXJlKG9wdGlvbnMua2V5KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbnVtdHJhY2tzID0gdHJhY2tzLkNvdW50O1xyXG5cclxuICAgICAgICAgICAgaW50IGxhc3RTdGFydCA9IGZpbGUuRW5kVGltZSgpICsgb3B0aW9ucy5zaGlmdHRpbWU7XHJcblxyXG4gICAgICAgICAgICAvKiBDcmVhdGUgYWxsIHRoZSBtdXNpYyBzeW1ib2xzIChub3RlcywgcmVzdHMsIHZlcnRpY2FsIGJhcnMsIGFuZFxyXG4gICAgICAgICAgICAgKiBjbGVmIGNoYW5nZXMpLiAgVGhlIHN5bWJvbHMgdmFyaWFibGUgY29udGFpbnMgYSBsaXN0IG9mIG11c2ljIFxyXG4gICAgICAgICAgICAgKiBzeW1ib2xzIGZvciBlYWNoIHRyYWNrLiAgVGhlIGxpc3QgZG9lcyBub3QgaW5jbHVkZSB0aGUgbGVmdC1zaWRlIFxyXG4gICAgICAgICAgICAgKiBDbGVmIGFuZCBrZXkgc2lnbmF0dXJlIHN5bWJvbHMuICBUaG9zZSBjYW4gb25seSBiZSBjYWxjdWxhdGVkIFxyXG4gICAgICAgICAgICAgKiB3aGVuIHdlIGNyZWF0ZSB0aGUgc3RhZmZzLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD5bXSBzeW1ib2xzID0gbmV3IExpc3Q8TXVzaWNTeW1ib2w+W251bXRyYWNrc107XHJcbiAgICAgICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCBudW10cmFja3M7IHRyYWNrbnVtKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIE1pZGlUcmFjayB0cmFjayA9IHRyYWNrc1t0cmFja251bV07XHJcbiAgICAgICAgICAgICAgICBDbGVmTWVhc3VyZXMgY2xlZnMgPSBuZXcgQ2xlZk1lYXN1cmVzKHRyYWNrLk5vdGVzLCB0aW1lLk1lYXN1cmUpO1xyXG4gICAgICAgICAgICAgICAgTGlzdDxDaG9yZFN5bWJvbD4gY2hvcmRzID0gQ3JlYXRlQ2hvcmRzKHRyYWNrLk5vdGVzLCBtYWlua2V5LCB0aW1lLCBjbGVmcyk7XHJcbiAgICAgICAgICAgICAgICBzeW1ib2xzW3RyYWNrbnVtXSA9IENyZWF0ZVN5bWJvbHMoY2hvcmRzLCBjbGVmcywgdGltZSwgbGFzdFN0YXJ0KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgTGlzdDxMeXJpY1N5bWJvbD5bXSBseXJpY3MgPSBudWxsO1xyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5zaG93THlyaWNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBseXJpY3MgPSBHZXRMeXJpY3ModHJhY2tzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLyogVmVydGljYWxseSBhbGlnbiB0aGUgbXVzaWMgc3ltYm9scyAqL1xyXG4gICAgICAgICAgICBTeW1ib2xXaWR0aHMgd2lkdGhzID0gbmV3IFN5bWJvbFdpZHRocyhzeW1ib2xzLCBseXJpY3MpO1xyXG4gICAgICAgICAgICBBbGlnblN5bWJvbHMoc3ltYm9scywgd2lkdGhzLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgICAgIHN0YWZmcyA9IENyZWF0ZVN0YWZmcyhzeW1ib2xzLCBtYWlua2V5LCBvcHRpb25zLCB0aW1lLk1lYXN1cmUpO1xyXG4gICAgICAgICAgICBDcmVhdGVBbGxCZWFtZWRDaG9yZHMoc3ltYm9scywgdGltZSk7XHJcbiAgICAgICAgICAgIGlmIChseXJpY3MgIT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgQWRkTHlyaWNzVG9TdGFmZnMoc3RhZmZzLCBseXJpY3MpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvKiBBZnRlciBtYWtpbmcgY2hvcmQgcGFpcnMsIHRoZSBzdGVtIGRpcmVjdGlvbnMgY2FuIGNoYW5nZSxcclxuICAgICAgICAgICAgICogd2hpY2ggYWZmZWN0cyB0aGUgc3RhZmYgaGVpZ2h0LiAgUmUtY2FsY3VsYXRlIHRoZSBzdGFmZiBoZWlnaHQuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBmb3JlYWNoIChTdGFmZiBzdGFmZiBpbiBzdGFmZnMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN0YWZmLkNhbGN1bGF0ZUhlaWdodCgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBCYWNrQ29sb3IgPSBDb2xvci5XaGl0ZTtcclxuXHJcbiAgICAgICAgICAgIFNldFpvb20oMS4wZik7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIEdldCB0aGUgYmVzdCBrZXkgc2lnbmF0dXJlIGdpdmVuIHRoZSBtaWRpIG5vdGVzIGluIGFsbCB0aGUgdHJhY2tzLiAqL1xyXG4gICAgICAgIHByaXZhdGUgS2V5U2lnbmF0dXJlIEdldEtleVNpZ25hdHVyZShMaXN0PE1pZGlUcmFjaz4gdHJhY2tzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgTGlzdDxpbnQ+IG5vdGVudW1zID0gbmV3IExpc3Q8aW50PigpO1xyXG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrLk5vdGVzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vdGVudW1zLkFkZChub3RlLk51bWJlcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIEtleVNpZ25hdHVyZS5HdWVzcyhub3RlbnVtcyk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIENyZWF0ZSB0aGUgY2hvcmQgc3ltYm9scyBmb3IgYSBzaW5nbGUgdHJhY2suXG4gICAgICAgICAqIEBwYXJhbSBtaWRpbm90ZXMgIFRoZSBNaWRpbm90ZXMgaW4gdGhlIHRyYWNrLlxuICAgICAgICAgKiBAcGFyYW0ga2V5ICAgICAgICBUaGUgS2V5IFNpZ25hdHVyZSwgZm9yIGRldGVybWluaW5nIHNoYXJwcy9mbGF0cy5cbiAgICAgICAgICogQHBhcmFtIHRpbWUgICAgICAgVGhlIFRpbWUgU2lnbmF0dXJlLCBmb3IgZGV0ZXJtaW5pbmcgdGhlIG1lYXN1cmVzLlxuICAgICAgICAgKiBAcGFyYW0gY2xlZnMgICAgICBUaGUgY2xlZnMgdG8gdXNlIGZvciBlYWNoIG1lYXN1cmUuXG4gICAgICAgICAqIEByZXQgQW4gYXJyYXkgb2YgQ2hvcmRTeW1ib2xzXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGVcclxuICAgICAgICBMaXN0PENob3JkU3ltYm9sPiBDcmVhdGVDaG9yZHMoTGlzdDxNaWRpTm90ZT4gbWlkaW5vdGVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBLZXlTaWduYXR1cmUga2V5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUaW1lU2lnbmF0dXJlIHRpbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENsZWZNZWFzdXJlcyBjbGVmcylcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICBpbnQgaSA9IDA7XHJcbiAgICAgICAgICAgIExpc3Q8Q2hvcmRTeW1ib2w+IGNob3JkcyA9IG5ldyBMaXN0PENob3JkU3ltYm9sPigpO1xyXG4gICAgICAgICAgICBMaXN0PE1pZGlOb3RlPiBub3RlZ3JvdXAgPSBuZXcgTGlzdDxNaWRpTm90ZT4oMTIpO1xyXG4gICAgICAgICAgICBpbnQgbGVuID0gbWlkaW5vdGVzLkNvdW50O1xyXG5cclxuICAgICAgICAgICAgd2hpbGUgKGkgPCBsZW4pXHJcbiAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpbnQgc3RhcnR0aW1lID0gbWlkaW5vdGVzW2ldLlN0YXJ0VGltZTtcclxuICAgICAgICAgICAgICAgIENsZWYgY2xlZiA9IGNsZWZzLkdldENsZWYoc3RhcnR0aW1lKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKiBHcm91cCBhbGwgdGhlIG1pZGkgbm90ZXMgd2l0aCB0aGUgc2FtZSBzdGFydCB0aW1lXHJcbiAgICAgICAgICAgICAgICAgKiBpbnRvIHRoZSBub3RlcyBsaXN0LlxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBub3RlZ3JvdXAuQ2xlYXIoKTtcclxuICAgICAgICAgICAgICAgIG5vdGVncm91cC5BZGQobWlkaW5vdGVzW2ldKTtcclxuICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgbGVuICYmIG1pZGlub3Rlc1tpXS5TdGFydFRpbWUgPT0gc3RhcnR0aW1lKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vdGVncm91cC5BZGQobWlkaW5vdGVzW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyogQ3JlYXRlIGEgc2luZ2xlIGNob3JkIGZyb20gdGhlIGdyb3VwIG9mIG1pZGkgbm90ZXMgd2l0aFxyXG4gICAgICAgICAgICAgICAgICogdGhlIHNhbWUgc3RhcnQgdGltZS5cclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgQ2hvcmRTeW1ib2wgY2hvcmQgPSBuZXcgQ2hvcmRTeW1ib2wobm90ZWdyb3VwLCBrZXksIHRpbWUsIGNsZWYsIHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgY2hvcmRzLkFkZChjaG9yZCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBjaG9yZHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogR2l2ZW4gdGhlIGNob3JkIHN5bWJvbHMgZm9yIGEgdHJhY2ssIGNyZWF0ZSBhIG5ldyBzeW1ib2wgbGlzdFxuICAgICAgICAgKiB0aGF0IGNvbnRhaW5zIHRoZSBjaG9yZCBzeW1ib2xzLCB2ZXJ0aWNhbCBiYXJzLCByZXN0cywgYW5kIGNsZWYgY2hhbmdlcy5cbiAgICAgICAgICogUmV0dXJuIGEgbGlzdCBvZiBzeW1ib2xzIChDaG9yZFN5bWJvbCwgQmFyU3ltYm9sLCBSZXN0U3ltYm9sLCBDbGVmU3ltYm9sKVxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIExpc3Q8TXVzaWNTeW1ib2w+XHJcbiAgICAgICAgQ3JlYXRlU3ltYm9scyhMaXN0PENob3JkU3ltYm9sPiBjaG9yZHMsIENsZWZNZWFzdXJlcyBjbGVmcyxcclxuICAgICAgICAgICAgICAgICAgICAgIFRpbWVTaWduYXR1cmUgdGltZSwgaW50IGxhc3RTdGFydClcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzID0gbmV3IExpc3Q8TXVzaWNTeW1ib2w+KCk7XHJcbiAgICAgICAgICAgIHN5bWJvbHMgPSBBZGRCYXJzKGNob3JkcywgdGltZSwgbGFzdFN0YXJ0KTtcclxuICAgICAgICAgICAgc3ltYm9scyA9IEFkZFJlc3RzKHN5bWJvbHMsIHRpbWUpO1xyXG4gICAgICAgICAgICBzeW1ib2xzID0gQWRkQ2xlZkNoYW5nZXMoc3ltYm9scywgY2xlZnMsIHRpbWUpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN5bWJvbHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogQWRkIGluIHRoZSB2ZXJ0aWNhbCBiYXJzIGRlbGltaXRpbmcgbWVhc3VyZXMuIFxuICAgICAgICAgKiAgQWxzbywgYWRkIHRoZSB0aW1lIHNpZ25hdHVyZSBzeW1ib2xzLlxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlXHJcbiAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD4gQWRkQmFycyhMaXN0PENob3JkU3ltYm9sPiBjaG9yZHMsIFRpbWVTaWduYXR1cmUgdGltZSwgaW50IGxhc3RTdGFydClcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzID0gbmV3IExpc3Q8TXVzaWNTeW1ib2w+KCk7XHJcblxyXG4gICAgICAgICAgICBUaW1lU2lnU3ltYm9sIHRpbWVzaWcgPSBuZXcgVGltZVNpZ1N5bWJvbCh0aW1lLk51bWVyYXRvciwgdGltZS5EZW5vbWluYXRvcik7XHJcbiAgICAgICAgICAgIHN5bWJvbHMuQWRkKHRpbWVzaWcpO1xyXG5cclxuICAgICAgICAgICAgLyogVGhlIHN0YXJ0dGltZSBvZiB0aGUgYmVnaW5uaW5nIG9mIHRoZSBtZWFzdXJlICovXHJcbiAgICAgICAgICAgIGludCBtZWFzdXJldGltZSA9IDA7XHJcblxyXG4gICAgICAgICAgICBpbnQgaSA9IDA7XHJcbiAgICAgICAgICAgIHdoaWxlIChpIDwgY2hvcmRzLkNvdW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWVhc3VyZXRpbWUgPD0gY2hvcmRzW2ldLlN0YXJ0VGltZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzeW1ib2xzLkFkZChuZXcgQmFyU3ltYm9sKG1lYXN1cmV0aW1lKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVhc3VyZXRpbWUgKz0gdGltZS5NZWFzdXJlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHN5bWJvbHMuQWRkKGNob3Jkc1tpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvKiBLZWVwIGFkZGluZyBiYXJzIHVudGlsIHRoZSBsYXN0IFN0YXJ0VGltZSAodGhlIGVuZCBvZiB0aGUgc29uZykgKi9cclxuICAgICAgICAgICAgd2hpbGUgKG1lYXN1cmV0aW1lIDwgbGFzdFN0YXJ0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzeW1ib2xzLkFkZChuZXcgQmFyU3ltYm9sKG1lYXN1cmV0aW1lKSk7XHJcbiAgICAgICAgICAgICAgICBtZWFzdXJldGltZSArPSB0aW1lLk1lYXN1cmU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIEFkZCB0aGUgZmluYWwgdmVydGljYWwgYmFyIHRvIHRoZSBsYXN0IG1lYXN1cmUgKi9cclxuICAgICAgICAgICAgc3ltYm9scy5BZGQobmV3IEJhclN5bWJvbChtZWFzdXJldGltZSkpO1xyXG4gICAgICAgICAgICByZXR1cm4gc3ltYm9scztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBBZGQgcmVzdCBzeW1ib2xzIGJldHdlZW4gbm90ZXMuICBBbGwgdGltZXMgYmVsb3cgYXJlIFxuICAgICAgICAgKiBtZWFzdXJlZCBpbiBwdWxzZXMuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGVcclxuICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiBBZGRSZXN0cyhMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzLCBUaW1lU2lnbmF0dXJlIHRpbWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbnQgcHJldnRpbWUgPSAwO1xyXG5cclxuICAgICAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD4gcmVzdWx0ID0gbmV3IExpc3Q8TXVzaWNTeW1ib2w+KHN5bWJvbHMuQ291bnQpO1xyXG5cclxuICAgICAgICAgICAgZm9yZWFjaCAoTXVzaWNTeW1ib2wgc3ltYm9sIGluIHN5bWJvbHMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGludCBzdGFydHRpbWUgPSBzeW1ib2wuU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgUmVzdFN5bWJvbFtdIHJlc3RzID0gR2V0UmVzdHModGltZSwgcHJldnRpbWUsIHN0YXJ0dGltZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzdHMgIT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3JlYWNoIChSZXN0U3ltYm9sIHIgaW4gcmVzdHMpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuQWRkKHIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXN1bHQuQWRkKHN5bWJvbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLyogU2V0IHByZXZ0aW1lIHRvIHRoZSBlbmQgdGltZSBvZiB0aGUgbGFzdCBub3RlL3N5bWJvbC4gKi9cclxuICAgICAgICAgICAgICAgIGlmIChzeW1ib2wgaXMgQ2hvcmRTeW1ib2wpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgQ2hvcmRTeW1ib2wgY2hvcmQgPSAoQ2hvcmRTeW1ib2wpc3ltYm9sO1xyXG4gICAgICAgICAgICAgICAgICAgIHByZXZ0aW1lID0gTWF0aC5NYXgoY2hvcmQuRW5kVGltZSwgcHJldnRpbWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHByZXZ0aW1lID0gTWF0aC5NYXgoc3RhcnR0aW1lLCBwcmV2dGltZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBSZXR1cm4gdGhlIHJlc3Qgc3ltYm9scyBuZWVkZWQgdG8gZmlsbCB0aGUgdGltZSBpbnRlcnZhbCBiZXR3ZWVuXG4gICAgICAgICAqIHN0YXJ0IGFuZCBlbmQuICBJZiBubyByZXN0cyBhcmUgbmVlZGVkLCByZXR1cm4gbmlsLlxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlXHJcbiAgICAgICAgUmVzdFN5bWJvbFtdIEdldFJlc3RzKFRpbWVTaWduYXR1cmUgdGltZSwgaW50IHN0YXJ0LCBpbnQgZW5kKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgUmVzdFN5bWJvbFtdIHJlc3VsdDtcclxuICAgICAgICAgICAgUmVzdFN5bWJvbCByMSwgcjI7XHJcblxyXG4gICAgICAgICAgICBpZiAoZW5kIC0gc3RhcnQgPCAwKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgICAgICBOb3RlRHVyYXRpb24gZHVyID0gdGltZS5HZXROb3RlRHVyYXRpb24oZW5kIC0gc3RhcnQpO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGR1cilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uV2hvbGU6XHJcbiAgICAgICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5IYWxmOlxyXG4gICAgICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uUXVhcnRlcjpcclxuICAgICAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkVpZ2h0aDpcclxuICAgICAgICAgICAgICAgICAgICByMSA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0LCBkdXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBSZXN0U3ltYm9sW10geyByMSB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uRG90dGVkSGFsZjpcclxuICAgICAgICAgICAgICAgICAgICByMSA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0LCBOb3RlRHVyYXRpb24uSGFsZik7XHJcbiAgICAgICAgICAgICAgICAgICAgcjIgPSBuZXcgUmVzdFN5bWJvbChzdGFydCArIHRpbWUuUXVhcnRlciAqIDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOb3RlRHVyYXRpb24uUXVhcnRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbmV3IFJlc3RTeW1ib2xbXSB7IHIxLCByMiB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uRG90dGVkUXVhcnRlcjpcclxuICAgICAgICAgICAgICAgICAgICByMSA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0LCBOb3RlRHVyYXRpb24uUXVhcnRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgcjIgPSBuZXcgUmVzdFN5bWJvbChzdGFydCArIHRpbWUuUXVhcnRlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5vdGVEdXJhdGlvbi5FaWdodGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBSZXN0U3ltYm9sW10geyByMSwgcjIgfTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aDpcclxuICAgICAgICAgICAgICAgICAgICByMSA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0LCBOb3RlRHVyYXRpb24uRWlnaHRoKTtcclxuICAgICAgICAgICAgICAgICAgICByMiA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0ICsgdGltZS5RdWFydGVyIC8gMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5vdGVEdXJhdGlvbi5TaXh0ZWVudGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBSZXN0U3ltYm9sW10geyByMSwgcjIgfTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBUaGUgY3VycmVudCBjbGVmIGlzIGFsd2F5cyBzaG93biBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBzdGFmZiwgb25cbiAgICAgICAgICogdGhlIGxlZnQgc2lkZS4gIEhvd2V2ZXIsIHRoZSBjbGVmIGNhbiBhbHNvIGNoYW5nZSBmcm9tIG1lYXN1cmUgdG8gXG4gICAgICAgICAqIG1lYXN1cmUuIFdoZW4gaXQgZG9lcywgYSBDbGVmIHN5bWJvbCBtdXN0IGJlIHNob3duIHRvIGluZGljYXRlIHRoZSBcbiAgICAgICAgICogY2hhbmdlIGluIGNsZWYuICBUaGlzIGZ1bmN0aW9uIGFkZHMgdGhlc2UgQ2xlZiBjaGFuZ2Ugc3ltYm9scy5cbiAgICAgICAgICogVGhpcyBmdW5jdGlvbiBkb2VzIG5vdCBhZGQgdGhlIG1haW4gQ2xlZiBTeW1ib2wgdGhhdCBiZWdpbnMgZWFjaFxuICAgICAgICAgKiBzdGFmZi4gIFRoYXQgaXMgZG9uZSBpbiB0aGUgU3RhZmYoKSBjb250cnVjdG9yLlxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlXHJcbiAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD4gQWRkQ2xlZkNoYW5nZXMoTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDbGVmTWVhc3VyZXMgY2xlZnMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVGltZVNpZ25hdHVyZSB0aW1lKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIExpc3Q8TXVzaWNTeW1ib2w+IHJlc3VsdCA9IG5ldyBMaXN0PE11c2ljU3ltYm9sPihzeW1ib2xzLkNvdW50KTtcclxuICAgICAgICAgICAgQ2xlZiBwcmV2Y2xlZiA9IGNsZWZzLkdldENsZWYoMCk7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHN5bWJvbCBpbiBzeW1ib2xzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvKiBBIEJhclN5bWJvbCBpbmRpY2F0ZXMgYSBuZXcgbWVhc3VyZSAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHN5bWJvbCBpcyBCYXJTeW1ib2wpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgQ2xlZiBjbGVmID0gY2xlZnMuR2V0Q2xlZihzeW1ib2wuU3RhcnRUaW1lKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2xlZiAhPSBwcmV2Y2xlZilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5BZGQobmV3IENsZWZTeW1ib2woY2xlZiwgc3ltYm9sLlN0YXJ0VGltZSAtIDEsIHRydWUpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldmNsZWYgPSBjbGVmO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmVzdWx0LkFkZChzeW1ib2wpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIE5vdGVzIHdpdGggdGhlIHNhbWUgc3RhcnQgdGltZXMgaW4gZGlmZmVyZW50IHN0YWZmcyBzaG91bGQgYmVcbiAgICAgICAgICogdmVydGljYWxseSBhbGlnbmVkLiAgVGhlIFN5bWJvbFdpZHRocyBjbGFzcyBpcyB1c2VkIHRvIGhlbHAgXG4gICAgICAgICAqIHZlcnRpY2FsbHkgYWxpZ24gc3ltYm9scy5cbiAgICAgICAgICpcbiAgICAgICAgICogRmlyc3QsIGVhY2ggdHJhY2sgc2hvdWxkIGhhdmUgYSBzeW1ib2wgZm9yIGV2ZXJ5IHN0YXJ0dGltZSB0aGF0XG4gICAgICAgICAqIGFwcGVhcnMgaW4gdGhlIE1pZGkgRmlsZS4gIElmIGEgdHJhY2sgZG9lc24ndCBoYXZlIGEgc3ltYm9sIGZvciBhXG4gICAgICAgICAqIHBhcnRpY3VsYXIgc3RhcnR0aW1lLCB0aGVuIGFkZCBhIFwiYmxhbmtcIiBzeW1ib2wgZm9yIHRoYXQgdGltZS5cbiAgICAgICAgICpcbiAgICAgICAgICogTmV4dCwgbWFrZSBzdXJlIHRoZSBzeW1ib2xzIGZvciBlYWNoIHN0YXJ0IHRpbWUgYWxsIGhhdmUgdGhlIHNhbWVcbiAgICAgICAgICogd2lkdGgsIGFjcm9zcyBhbGwgdHJhY2tzLiAgVGhlIFN5bWJvbFdpZHRocyBjbGFzcyBzdG9yZXNcbiAgICAgICAgICogLSBUaGUgc3ltYm9sIHdpZHRoIGZvciBlYWNoIHN0YXJ0dGltZSwgZm9yIGVhY2ggdHJhY2tcbiAgICAgICAgICogLSBUaGUgbWF4aW11bSBzeW1ib2wgd2lkdGggZm9yIGEgZ2l2ZW4gc3RhcnR0aW1lLCBhY3Jvc3MgYWxsIHRyYWNrcy5cbiAgICAgICAgICpcbiAgICAgICAgICogVGhlIG1ldGhvZCBTeW1ib2xXaWR0aHMuR2V0RXh0cmFXaWR0aCgpIHJldHVybnMgdGhlIGV4dHJhIHdpZHRoXG4gICAgICAgICAqIG5lZWRlZCBmb3IgYSB0cmFjayB0byBtYXRjaCB0aGUgbWF4aW11bSBzeW1ib2wgd2lkdGggZm9yIGEgZ2l2ZW5cbiAgICAgICAgICogc3RhcnR0aW1lLlxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlXHJcbiAgICAgICAgdm9pZCBBbGlnblN5bWJvbHMoTGlzdDxNdXNpY1N5bWJvbD5bXSBhbGxzeW1ib2xzLCBTeW1ib2xXaWR0aHMgd2lkdGhzLCBNaWRpT3B0aW9ucyBvcHRpb25zKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIHdlIHNob3cgbWVhc3VyZSBudW1iZXJzLCBpbmNyZWFzZSBiYXIgc3ltYm9sIHdpZHRoXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnNob3dNZWFzdXJlcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgdHJhY2sgPSAwOyB0cmFjayA8IGFsbHN5bWJvbHMuTGVuZ3RoOyB0cmFjaysrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIExpc3Q8TXVzaWNTeW1ib2w+IHN5bWJvbHMgPSBhbGxzeW1ib2xzW3RyYWNrXTtcclxuICAgICAgICAgICAgICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBzeW0gaW4gc3ltYm9scylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzeW0gaXMgQmFyU3ltYm9sKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzeW0uV2lkdGggKz0gU2hlZXRNdXNpYy5Ob3RlV2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZvciAoaW50IHRyYWNrID0gMDsgdHJhY2sgPCBhbGxzeW1ib2xzLkxlbmd0aDsgdHJhY2srKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scyA9IGFsbHN5bWJvbHNbdHJhY2tdO1xyXG4gICAgICAgICAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD4gcmVzdWx0ID0gbmV3IExpc3Q8TXVzaWNTeW1ib2w+KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaW50IGkgPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qIElmIGEgdHJhY2sgZG9lc24ndCBoYXZlIGEgc3ltYm9sIGZvciBhIHN0YXJ0dGltZSxcclxuICAgICAgICAgICAgICAgICAqIGFkZCBhIGJsYW5rIHN5bWJvbC5cclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoaW50IHN0YXJ0IGluIHdpZHRocy5TdGFydFRpbWVzKVxyXG4gICAgICAgICAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvKiBCYXJTeW1ib2xzIGFyZSBub3QgaW5jbHVkZWQgaW4gdGhlIFN5bWJvbFdpZHRocyBjYWxjdWxhdGlvbnMgKi9cclxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaSA8IHN5bWJvbHMuQ291bnQgJiYgKHN5bWJvbHNbaV0gaXMgQmFyU3ltYm9sKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzeW1ib2xzW2ldLlN0YXJ0VGltZSA8PSBzdGFydClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5BZGQoc3ltYm9sc1tpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpIDwgc3ltYm9scy5Db3VudCAmJiBzeW1ib2xzW2ldLlN0YXJ0VGltZSA9PSBzdGFydClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaSA8IHN5bWJvbHMuQ291bnQgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN5bWJvbHNbaV0uU3RhcnRUaW1lID09IHN0YXJ0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LkFkZChzeW1ib2xzW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuQWRkKG5ldyBCbGFua1N5bWJvbChzdGFydCwgMCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKiBGb3IgZWFjaCBzdGFydHRpbWUsIGluY3JlYXNlIHRoZSBzeW1ib2wgd2lkdGggYnlcclxuICAgICAgICAgICAgICAgICAqIFN5bWJvbFdpZHRocy5HZXRFeHRyYVdpZHRoKCkuXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGkgPSAwO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGkgPCByZXN1bHQuQ291bnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdFtpXSBpcyBCYXJTeW1ib2wpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpbnQgc3RhcnQgPSByZXN1bHRbaV0uU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBleHRyYSA9IHdpZHRocy5HZXRFeHRyYVdpZHRoKHRyYWNrLCBzdGFydCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2ldLldpZHRoICs9IGV4dHJhO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvKiBTa2lwIGFsbCByZW1haW5pbmcgc3ltYm9scyB3aXRoIHRoZSBzYW1lIHN0YXJ0dGltZS4gKi9cclxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaSA8IHJlc3VsdC5Db3VudCAmJiByZXN1bHRbaV0uU3RhcnRUaW1lID09IHN0YXJ0KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGFsbHN5bWJvbHNbdHJhY2tdID0gcmVzdWx0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBib29sIElzQ2hvcmQoTXVzaWNTeW1ib2wgc3ltYm9sKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN5bWJvbCBpcyBDaG9yZFN5bWJvbDtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogRmluZCAyLCAzLCA0LCBvciA2IGNob3JkIHN5bWJvbHMgdGhhdCBvY2N1ciBjb25zZWN1dGl2ZWx5ICh3aXRob3V0IGFueVxuICAgICAgICAgKiAgcmVzdHMgb3IgYmFycyBpbiBiZXR3ZWVuKS4gIFRoZXJlIGNhbiBiZSBCbGFua1N5bWJvbHMgaW4gYmV0d2Vlbi5cbiAgICAgICAgICpcbiAgICAgICAgICogIFRoZSBzdGFydEluZGV4IGlzIHRoZSBpbmRleCBpbiB0aGUgc3ltYm9scyB0byBzdGFydCBsb29raW5nIGZyb20uXG4gICAgICAgICAqXG4gICAgICAgICAqICBTdG9yZSB0aGUgaW5kZXhlcyBvZiB0aGUgY29uc2VjdXRpdmUgY2hvcmRzIGluIGNob3JkSW5kZXhlcy5cbiAgICAgICAgICogIFN0b3JlIHRoZSBob3Jpem9udGFsIGRpc3RhbmNlIChwaXhlbHMpIGJldHdlZW4gdGhlIGZpcnN0IGFuZCBsYXN0IGNob3JkLlxuICAgICAgICAgKiAgSWYgd2UgZmFpbGVkIHRvIGZpbmQgY29uc2VjdXRpdmUgY2hvcmRzLCByZXR1cm4gZmFsc2UuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGJvb2xcclxuICAgICAgICBGaW5kQ29uc2VjdXRpdmVDaG9yZHMoTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scywgVGltZVNpZ25hdHVyZSB0aW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnQgc3RhcnRJbmRleCwgaW50W10gY2hvcmRJbmRleGVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWYgaW50IGhvcml6RGlzdGFuY2UpXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgaW50IGkgPSBzdGFydEluZGV4O1xyXG4gICAgICAgICAgICBpbnQgbnVtQ2hvcmRzID0gY2hvcmRJbmRleGVzLkxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlICh0cnVlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBob3JpekRpc3RhbmNlID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICAvKiBGaW5kIHRoZSBzdGFydGluZyBjaG9yZCAqL1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGkgPCBzeW1ib2xzLkNvdW50IC0gbnVtQ2hvcmRzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzeW1ib2xzW2ldIGlzIENob3JkU3ltYm9sKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgQ2hvcmRTeW1ib2wgYyA9IChDaG9yZFN5bWJvbClzeW1ib2xzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYy5TdGVtICE9IG51bGwpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChpID49IHN5bWJvbHMuQ291bnQgLSBudW1DaG9yZHMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hvcmRJbmRleGVzWzBdID0gLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2hvcmRJbmRleGVzWzBdID0gaTtcclxuICAgICAgICAgICAgICAgIGJvb2wgZm91bmRDaG9yZHMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgY2hvcmRJbmRleCA9IDE7IGNob3JkSW5kZXggPCBudW1DaG9yZHM7IGNob3JkSW5kZXgrKylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IHJlbWFpbmluZyA9IG51bUNob3JkcyAtIDEgLSBjaG9yZEluZGV4O1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlICgoaSA8IHN5bWJvbHMuQ291bnQgLSByZW1haW5pbmcpICYmIChzeW1ib2xzW2ldIGlzIEJsYW5rU3ltYm9sKSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvcml6RGlzdGFuY2UgKz0gc3ltYm9sc1tpXS5XaWR0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaSA+PSBzeW1ib2xzLkNvdW50IC0gcmVtYWluaW5nKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIShzeW1ib2xzW2ldIGlzIENob3JkU3ltYm9sKSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kQ2hvcmRzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjaG9yZEluZGV4ZXNbY2hvcmRJbmRleF0gPSBpO1xyXG4gICAgICAgICAgICAgICAgICAgIGhvcml6RGlzdGFuY2UgKz0gc3ltYm9sc1tpXS5XaWR0aDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChmb3VuZENob3JkcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKiBFbHNlLCBzdGFydCBzZWFyY2hpbmcgYWdhaW4gZnJvbSBpbmRleCBpICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogQ29ubmVjdCBjaG9yZHMgb2YgdGhlIHNhbWUgZHVyYXRpb24gd2l0aCBhIGhvcml6b250YWwgYmVhbS5cbiAgICAgICAgICogIG51bUNob3JkcyBpcyB0aGUgbnVtYmVyIG9mIGNob3JkcyBwZXIgYmVhbSAoMiwgMywgNCwgb3IgNikuXG4gICAgICAgICAqICBpZiBzdGFydEJlYXQgaXMgdHJ1ZSwgdGhlIGZpcnN0IGNob3JkIG11c3Qgc3RhcnQgb24gYSBxdWFydGVyIG5vdGUgYmVhdC5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZFxyXG4gICAgICAgIENyZWF0ZUJlYW1lZENob3JkcyhMaXN0PE11c2ljU3ltYm9sPltdIGFsbHN5bWJvbHMsIFRpbWVTaWduYXR1cmUgdGltZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50IG51bUNob3JkcywgYm9vbCBzdGFydEJlYXQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbnRbXSBjaG9yZEluZGV4ZXMgPSBuZXcgaW50W251bUNob3Jkc107XHJcbiAgICAgICAgICAgIENob3JkU3ltYm9sW10gY2hvcmRzID0gbmV3IENob3JkU3ltYm9sW251bUNob3Jkc107XHJcblxyXG4gICAgICAgICAgICBmb3JlYWNoIChMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzIGluIGFsbHN5bWJvbHMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGludCBzdGFydEluZGV4ID0gMDtcclxuICAgICAgICAgICAgICAgIHdoaWxlICh0cnVlKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBob3JpekRpc3RhbmNlID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBib29sIGZvdW5kID0gRmluZENvbnNlY3V0aXZlQ2hvcmRzKHN5bWJvbHMsIHRpbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydEluZGV4LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hvcmRJbmRleGVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmIGhvcml6RGlzdGFuY2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghZm91bmQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBudW1DaG9yZHM7IGkrKylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNob3Jkc1tpXSA9IChDaG9yZFN5bWJvbClzeW1ib2xzW2Nob3JkSW5kZXhlc1tpXV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoQ2hvcmRTeW1ib2wuQ2FuQ3JlYXRlQmVhbShjaG9yZHMsIHRpbWUsIHN0YXJ0QmVhdCkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBDaG9yZFN5bWJvbC5DcmVhdGVCZWFtKGNob3JkcywgaG9yaXpEaXN0YW5jZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0SW5kZXggPSBjaG9yZEluZGV4ZXNbbnVtQ2hvcmRzIC0gMV0gKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydEluZGV4ID0gY2hvcmRJbmRleGVzWzBdICsgMTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8qIFdoYXQgaXMgdGhlIHZhbHVlIG9mIHN0YXJ0SW5kZXggaGVyZT9cclxuICAgICAgICAgICAgICAgICAgICAgKiBJZiB3ZSBjcmVhdGVkIGEgYmVhbSwgd2Ugc3RhcnQgYWZ0ZXIgdGhlIGxhc3QgY2hvcmQuXHJcbiAgICAgICAgICAgICAgICAgICAgICogSWYgd2UgZmFpbGVkIHRvIGNyZWF0ZSBhIGJlYW0sIHdlIHN0YXJ0IGFmdGVyIHRoZSBmaXJzdCBjaG9yZC5cclxuICAgICAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBDb25uZWN0IGNob3JkcyBvZiB0aGUgc2FtZSBkdXJhdGlvbiB3aXRoIGEgaG9yaXpvbnRhbCBiZWFtLlxuICAgICAgICAgKlxuICAgICAgICAgKiAgV2UgY3JlYXRlIGJlYW1zIGluIHRoZSBmb2xsb3dpbmcgb3JkZXI6XG4gICAgICAgICAqICAtIDYgY29ubmVjdGVkIDh0aCBub3RlIGNob3JkcywgaW4gMy80LCA2LzgsIG9yIDYvNCB0aW1lXG4gICAgICAgICAqICAtIFRyaXBsZXRzIHRoYXQgc3RhcnQgb24gcXVhcnRlciBub3RlIGJlYXRzXG4gICAgICAgICAqICAtIDMgY29ubmVjdGVkIGNob3JkcyB0aGF0IHN0YXJ0IG9uIHF1YXJ0ZXIgbm90ZSBiZWF0cyAoMTIvOCB0aW1lIG9ubHkpXG4gICAgICAgICAqICAtIDQgY29ubmVjdGVkIGNob3JkcyB0aGF0IHN0YXJ0IG9uIHF1YXJ0ZXIgbm90ZSBiZWF0cyAoNC80IG9yIDIvNCB0aW1lIG9ubHkpXG4gICAgICAgICAqICAtIDIgY29ubmVjdGVkIGNob3JkcyB0aGF0IHN0YXJ0IG9uIHF1YXJ0ZXIgbm90ZSBiZWF0c1xuICAgICAgICAgKiAgLSAyIGNvbm5lY3RlZCBjaG9yZHMgdGhhdCBzdGFydCBvbiBhbnkgYmVhdFxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkXHJcbiAgICAgICAgQ3JlYXRlQWxsQmVhbWVkQ2hvcmRzKExpc3Q8TXVzaWNTeW1ib2w+W10gYWxsc3ltYm9scywgVGltZVNpZ25hdHVyZSB0aW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCh0aW1lLk51bWVyYXRvciA9PSAzICYmIHRpbWUuRGVub21pbmF0b3IgPT0gNCkgfHxcclxuICAgICAgICAgICAgICAgICh0aW1lLk51bWVyYXRvciA9PSA2ICYmIHRpbWUuRGVub21pbmF0b3IgPT0gOCkgfHxcclxuICAgICAgICAgICAgICAgICh0aW1lLk51bWVyYXRvciA9PSA2ICYmIHRpbWUuRGVub21pbmF0b3IgPT0gNCkpXHJcbiAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICBDcmVhdGVCZWFtZWRDaG9yZHMoYWxsc3ltYm9scywgdGltZSwgNiwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgQ3JlYXRlQmVhbWVkQ2hvcmRzKGFsbHN5bWJvbHMsIHRpbWUsIDMsIHRydWUpO1xyXG4gICAgICAgICAgICBDcmVhdGVCZWFtZWRDaG9yZHMoYWxsc3ltYm9scywgdGltZSwgNCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIENyZWF0ZUJlYW1lZENob3JkcyhhbGxzeW1ib2xzLCB0aW1lLCAyLCB0cnVlKTtcclxuICAgICAgICAgICAgQ3JlYXRlQmVhbWVkQ2hvcmRzKGFsbHN5bWJvbHMsIHRpbWUsIDIsIGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBHZXQgdGhlIHdpZHRoIChpbiBwaXhlbHMpIG5lZWRlZCB0byBkaXNwbGF5IHRoZSBrZXkgc2lnbmF0dXJlICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBpbnRcclxuICAgICAgICBLZXlTaWduYXR1cmVXaWR0aChLZXlTaWduYXR1cmUga2V5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQ2xlZlN5bWJvbCBjbGVmc3ltID0gbmV3IENsZWZTeW1ib2woQ2xlZi5UcmVibGUsIDAsIGZhbHNlKTtcclxuICAgICAgICAgICAgaW50IHJlc3VsdCA9IGNsZWZzeW0uTWluV2lkdGg7XHJcbiAgICAgICAgICAgIEFjY2lkU3ltYm9sW10ga2V5cyA9IGtleS5HZXRTeW1ib2xzKENsZWYuVHJlYmxlKTtcclxuICAgICAgICAgICAgZm9yZWFjaCAoQWNjaWRTeW1ib2wgc3ltYm9sIGluIGtleXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBzeW1ib2wuTWluV2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdCArIFNoZWV0TXVzaWMuTGVmdE1hcmdpbiArIDU7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIEdpdmVuIE11c2ljU3ltYm9scyBmb3IgYSB0cmFjaywgY3JlYXRlIHRoZSBzdGFmZnMgZm9yIHRoYXQgdHJhY2suXG4gICAgICAgICAqICBFYWNoIFN0YWZmIGhhcyBhIG1heG1pbXVtIHdpZHRoIG9mIFBhZ2VXaWR0aCAoODAwIHBpeGVscykuXG4gICAgICAgICAqICBBbHNvLCBtZWFzdXJlcyBzaG91bGQgbm90IHNwYW4gbXVsdGlwbGUgU3RhZmZzLlxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIExpc3Q8U3RhZmY+XHJcbiAgICAgICAgQ3JlYXRlU3RhZmZzRm9yVHJhY2soTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scywgaW50IG1lYXN1cmVsZW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgS2V5U2lnbmF0dXJlIGtleSwgTWlkaU9wdGlvbnMgb3B0aW9ucyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnQgdHJhY2ssIGludCB0b3RhbHRyYWNrcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGludCBrZXlzaWdXaWR0aCA9IEtleVNpZ25hdHVyZVdpZHRoKGtleSk7XHJcbiAgICAgICAgICAgIGludCBzdGFydGluZGV4ID0gMDtcclxuICAgICAgICAgICAgTGlzdDxTdGFmZj4gdGhlc3RhZmZzID0gbmV3IExpc3Q8U3RhZmY+KHN5bWJvbHMuQ291bnQgLyA1MCk7XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAoc3RhcnRpbmRleCA8IHN5bWJvbHMuQ291bnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIC8qIHN0YXJ0aW5kZXggaXMgdGhlIGluZGV4IG9mIHRoZSBmaXJzdCBzeW1ib2wgaW4gdGhlIHN0YWZmLlxyXG4gICAgICAgICAgICAgICAgICogZW5kaW5kZXggaXMgdGhlIGluZGV4IG9mIHRoZSBsYXN0IHN5bWJvbCBpbiB0aGUgc3RhZmYuXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGludCBlbmRpbmRleCA9IHN0YXJ0aW5kZXg7XHJcbiAgICAgICAgICAgICAgICBpbnQgd2lkdGggPSBrZXlzaWdXaWR0aDtcclxuICAgICAgICAgICAgICAgIGludCBtYXh3aWR0aDtcclxuXHJcbiAgICAgICAgICAgICAgICAvKiBJZiB3ZSdyZSBzY3JvbGxpbmcgdmVydGljYWxseSwgdGhlIG1heGltdW0gd2lkdGggaXMgUGFnZVdpZHRoLiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHNjcm9sbFZlcnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF4d2lkdGggPSBTaGVldE11c2ljLlBhZ2VXaWR0aDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXh3aWR0aCA9IDIwMDAwMDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGVuZGluZGV4IDwgc3ltYm9scy5Db3VudCAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgIHdpZHRoICsgc3ltYm9sc1tlbmRpbmRleF0uV2lkdGggPCBtYXh3aWR0aClcclxuICAgICAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggKz0gc3ltYm9sc1tlbmRpbmRleF0uV2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5kaW5kZXgrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVuZGluZGV4LS07XHJcblxyXG4gICAgICAgICAgICAgICAgLyogVGhlcmUncyAzIHBvc3NpYmlsaXRpZXMgYXQgdGhpcyBwb2ludDpcclxuICAgICAgICAgICAgICAgICAqIDEuIFdlIGhhdmUgYWxsIHRoZSBzeW1ib2xzIGluIHRoZSB0cmFjay5cclxuICAgICAgICAgICAgICAgICAqICAgIFRoZSBlbmRpbmRleCBzdGF5cyB0aGUgc2FtZS5cclxuICAgICAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAgICAgKiAyLiBXZSBoYXZlIHN5bWJvbHMgZm9yIGxlc3MgdGhhbiBvbmUgbWVhc3VyZS5cclxuICAgICAgICAgICAgICAgICAqICAgIFRoZSBlbmRpbmRleCBzdGF5cyB0aGUgc2FtZS5cclxuICAgICAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAgICAgKiAzLiBXZSBoYXZlIHN5bWJvbHMgZm9yIDEgb3IgbW9yZSBtZWFzdXJlcy5cclxuICAgICAgICAgICAgICAgICAqICAgIFNpbmNlIG1lYXN1cmVzIGNhbm5vdCBzcGFuIG11bHRpcGxlIHN0YWZmcywgd2UgbXVzdFxyXG4gICAgICAgICAgICAgICAgICogICAgbWFrZSBzdXJlIGVuZGluZGV4IGRvZXMgbm90IG9jY3VyIGluIHRoZSBtaWRkbGUgb2YgYVxyXG4gICAgICAgICAgICAgICAgICogICAgbWVhc3VyZS4gIFdlIGNvdW50IGJhY2t3YXJkcyB1bnRpbCB3ZSBjb21lIHRvIHRoZSBlbmRcclxuICAgICAgICAgICAgICAgICAqICAgIG9mIGEgbWVhc3VyZS5cclxuICAgICAgICAgICAgICAgICAqL1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChlbmRpbmRleCA9PSBzeW1ib2xzLkNvdW50IC0gMSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBlbmRpbmRleCBzdGF5cyB0aGUgc2FtZSAqL1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc3ltYm9sc1tzdGFydGluZGV4XS5TdGFydFRpbWUgLyBtZWFzdXJlbGVuID09XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBzeW1ib2xzW2VuZGluZGV4XS5TdGFydFRpbWUgLyBtZWFzdXJlbGVuKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGVuZGluZGV4IHN0YXlzIHRoZSBzYW1lICovXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IGVuZG1lYXN1cmUgPSBzeW1ib2xzW2VuZGluZGV4ICsgMV0uU3RhcnRUaW1lIC8gbWVhc3VyZWxlbjtcclxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoc3ltYm9sc1tlbmRpbmRleF0uU3RhcnRUaW1lIC8gbWVhc3VyZWxlbiA9PVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBlbmRtZWFzdXJlKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kaW5kZXgtLTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpbnQgcmFuZ2UgPSBlbmRpbmRleCArIDEgLSBzdGFydGluZGV4O1xyXG4gICAgICAgICAgICAgICAgaWYgKHNjcm9sbFZlcnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSBTaGVldE11c2ljLlBhZ2VXaWR0aDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFN0YWZmIHN0YWZmID0gbmV3IFN0YWZmKHN5bWJvbHMuR2V0UmFuZ2Uoc3RhcnRpbmRleCwgcmFuZ2UpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5LCBvcHRpb25zLCB0cmFjaywgdG90YWx0cmFja3MpO1xyXG4gICAgICAgICAgICAgICAgdGhlc3RhZmZzLkFkZChzdGFmZik7XHJcbiAgICAgICAgICAgICAgICBzdGFydGluZGV4ID0gZW5kaW5kZXggKyAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGVzdGFmZnM7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIEdpdmVuIGFsbCB0aGUgTXVzaWNTeW1ib2xzIGZvciBldmVyeSB0cmFjaywgY3JlYXRlIHRoZSBzdGFmZnNcbiAgICAgICAgICogZm9yIHRoZSBzaGVldCBtdXNpYy4gIFRoZXJlIGFyZSB0d28gcGFydHMgdG8gdGhpczpcbiAgICAgICAgICpcbiAgICAgICAgICogLSBHZXQgdGhlIGxpc3Qgb2Ygc3RhZmZzIGZvciBlYWNoIHRyYWNrLlxuICAgICAgICAgKiAgIFRoZSBzdGFmZnMgd2lsbCBiZSBzdG9yZWQgaW4gdHJhY2tzdGFmZnMgYXM6XG4gICAgICAgICAqXG4gICAgICAgICAqICAgdHJhY2tzdGFmZnNbMF0gPSB7IFN0YWZmMCwgU3RhZmYxLCBTdGFmZjIsIC4uLiB9IGZvciB0cmFjayAwXG4gICAgICAgICAqICAgdHJhY2tzdGFmZnNbMV0gPSB7IFN0YWZmMCwgU3RhZmYxLCBTdGFmZjIsIC4uLiB9IGZvciB0cmFjayAxXG4gICAgICAgICAqICAgdHJhY2tzdGFmZnNbMl0gPSB7IFN0YWZmMCwgU3RhZmYxLCBTdGFmZjIsIC4uLiB9IGZvciB0cmFjayAyXG4gICAgICAgICAqXG4gICAgICAgICAqIC0gU3RvcmUgdGhlIFN0YWZmcyBpbiB0aGUgc3RhZmZzIGxpc3QsIGJ1dCBpbnRlcmxlYXZlIHRoZVxuICAgICAgICAgKiAgIHRyYWNrcyBhcyBmb2xsb3dzOlxuICAgICAgICAgKlxuICAgICAgICAgKiAgIHN0YWZmcyA9IHsgU3RhZmYwIGZvciB0cmFjayAwLCBTdGFmZjAgZm9yIHRyYWNrMSwgU3RhZmYwIGZvciB0cmFjazIsXG4gICAgICAgICAqICAgICAgICAgICAgICBTdGFmZjEgZm9yIHRyYWNrIDAsIFN0YWZmMSBmb3IgdHJhY2sxLCBTdGFmZjEgZm9yIHRyYWNrMixcbiAgICAgICAgICogICAgICAgICAgICAgIFN0YWZmMiBmb3IgdHJhY2sgMCwgU3RhZmYyIGZvciB0cmFjazEsIFN0YWZmMiBmb3IgdHJhY2syLFxuICAgICAgICAgKiAgICAgICAgICAgICAgLi4uIH0gXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgTGlzdDxTdGFmZj5cclxuICAgICAgICBDcmVhdGVTdGFmZnMoTGlzdDxNdXNpY1N5bWJvbD5bXSBhbGxzeW1ib2xzLCBLZXlTaWduYXR1cmUga2V5LFxyXG4gICAgICAgICAgICAgICAgICAgICBNaWRpT3B0aW9ucyBvcHRpb25zLCBpbnQgbWVhc3VyZWxlbilcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICBMaXN0PFN0YWZmPltdIHRyYWNrc3RhZmZzID0gbmV3IExpc3Q8U3RhZmY+W2FsbHN5bWJvbHMuTGVuZ3RoXTtcclxuICAgICAgICAgICAgaW50IHRvdGFsdHJhY2tzID0gdHJhY2tzdGFmZnMuTGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2sgPSAwOyB0cmFjayA8IHRvdGFsdHJhY2tzOyB0cmFjaysrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzID0gYWxsc3ltYm9sc1t0cmFja107XHJcbiAgICAgICAgICAgICAgICB0cmFja3N0YWZmc1t0cmFja10gPSBDcmVhdGVTdGFmZnNGb3JUcmFjayhzeW1ib2xzLCBtZWFzdXJlbGVuLCBrZXksIG9wdGlvbnMsIHRyYWNrLCB0b3RhbHRyYWNrcyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIFVwZGF0ZSB0aGUgRW5kVGltZSBvZiBlYWNoIFN0YWZmLiBFbmRUaW1lIGlzIHVzZWQgZm9yIHBsYXliYWNrICovXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKExpc3Q8U3RhZmY+IGxpc3QgaW4gdHJhY2tzdGFmZnMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgbGlzdC5Db3VudCAtIDE7IGkrKylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0W2ldLkVuZFRpbWUgPSBsaXN0W2kgKyAxXS5TdGFydFRpbWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIEludGVybGVhdmUgdGhlIHN0YWZmcyBvZiBlYWNoIHRyYWNrIGludG8gdGhlIHJlc3VsdCBhcnJheS4gKi9cclxuICAgICAgICAgICAgaW50IG1heHN0YWZmcyA9IDA7XHJcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgdHJhY2tzdGFmZnMuTGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChtYXhzdGFmZnMgPCB0cmFja3N0YWZmc1tpXS5Db3VudClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXhzdGFmZnMgPSB0cmFja3N0YWZmc1tpXS5Db3VudDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBMaXN0PFN0YWZmPiByZXN1bHQgPSBuZXcgTGlzdDxTdGFmZj4obWF4c3RhZmZzICogdHJhY2tzdGFmZnMuTGVuZ3RoKTtcclxuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBtYXhzdGFmZnM7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTGlzdDxTdGFmZj4gbGlzdCBpbiB0cmFja3N0YWZmcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaSA8IGxpc3QuQ291bnQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuQWRkKGxpc3RbaV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIEdldCB0aGUgbHlyaWNzIGZvciBlYWNoIHRyYWNrICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgTGlzdDxMeXJpY1N5bWJvbD5bXVxyXG4gICAgICAgIEdldEx5cmljcyhMaXN0PE1pZGlUcmFjaz4gdHJhY2tzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgYm9vbCBoYXNMeXJpY3MgPSBmYWxzZTtcclxuICAgICAgICAgICAgTGlzdDxMeXJpY1N5bWJvbD5bXSByZXN1bHQgPSBuZXcgTGlzdDxMeXJpY1N5bWJvbD5bdHJhY2tzLkNvdW50XTtcclxuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IHRyYWNrcy5Db3VudDsgdHJhY2tudW0rKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTWlkaVRyYWNrIHRyYWNrID0gdHJhY2tzW3RyYWNrbnVtXTtcclxuICAgICAgICAgICAgICAgIGlmICh0cmFjay5MeXJpY3MgPT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGhhc0x5cmljcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRbdHJhY2tudW1dID0gbmV3IExpc3Q8THlyaWNTeW1ib2w+KCk7XHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgZXYgaW4gdHJhY2suTHlyaWNzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFN0cmluZyB0ZXh0ID0gVVRGOEVuY29kaW5nLlVURjguR2V0U3RyaW5nKGV2LlZhbHVlLCAwLCBldi5WYWx1ZS5MZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIEx5cmljU3ltYm9sIHN5bSA9IG5ldyBMeXJpY1N5bWJvbChldi5TdGFydFRpbWUsIHRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFt0cmFja251bV0uQWRkKHN5bSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFoYXNMeXJpY3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIEFkZCB0aGUgbHlyaWMgc3ltYm9scyB0byB0aGUgY29ycmVzcG9uZGluZyBzdGFmZnMgKi9cclxuICAgICAgICBzdGF0aWMgdm9pZFxyXG4gICAgICAgIEFkZEx5cmljc1RvU3RhZmZzKExpc3Q8U3RhZmY+IHN0YWZmcywgTGlzdDxMeXJpY1N5bWJvbD5bXSB0cmFja2x5cmljcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKFN0YWZmIHN0YWZmIGluIHN0YWZmcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTGlzdDxMeXJpY1N5bWJvbD4gbHlyaWNzID0gdHJhY2tseXJpY3Nbc3RhZmYuVHJhY2tdO1xyXG4gICAgICAgICAgICAgICAgc3RhZmYuQWRkTHlyaWNzKGx5cmljcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogU2V0IHRoZSB6b29tIGxldmVsIHRvIGRpc3BsYXkgYXQgKDEuMCA9PSAxMDAlKS5cbiAgICAgICAgICogUmVjYWxjdWxhdGUgdGhlIFNoZWV0TXVzaWMgd2lkdGggYW5kIGhlaWdodCBiYXNlZCBvbiB0aGVcbiAgICAgICAgICogem9vbSBsZXZlbC4gIFRoZW4gcmVkcmF3IHRoZSBTaGVldE11c2ljLiBcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHZvaWQgU2V0Wm9vbShmbG9hdCB2YWx1ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHpvb20gPSB2YWx1ZTtcclxuICAgICAgICAgICAgZmxvYXQgd2lkdGggPSAwO1xyXG4gICAgICAgICAgICBmbG9hdCBoZWlnaHQgPSAwO1xyXG4gICAgICAgICAgICBmb3JlYWNoIChTdGFmZiBzdGFmZiBpbiBzdGFmZnMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHdpZHRoID0gTWF0aC5NYXgod2lkdGgsIHN0YWZmLldpZHRoICogem9vbSk7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgKz0gKHN0YWZmLkhlaWdodCAqIHpvb20pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFdpZHRoID0gKGludCkod2lkdGggKyAyKTtcclxuICAgICAgICAgICAgSGVpZ2h0ID0gKChpbnQpaGVpZ2h0KSArIExlZnRNYXJnaW47XHJcbiAgICAgICAgICAgIHRoaXMuSW52YWxpZGF0ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIENoYW5nZSB0aGUgbm90ZSBjb2xvcnMgZm9yIHRoZSBzaGVldCBtdXNpYywgYW5kIHJlZHJhdy4gKi9cclxuICAgICAgICBwcml2YXRlIHZvaWQgU2V0Q29sb3JzKENvbG9yW10gbmV3Y29sb3JzLCBDb2xvciBuZXdzaGFkZSwgQ29sb3IgbmV3c2hhZGUyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKE5vdGVDb2xvcnMgPT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTm90ZUNvbG9ycyA9IG5ldyBDb2xvclsxMl07XHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDEyOyBpKyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgTm90ZUNvbG9yc1tpXSA9IENvbG9yLkJsYWNrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChuZXdjb2xvcnMgIT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCAxMjsgaSsrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIE5vdGVDb2xvcnNbaV0gPSBuZXdjb2xvcnNbaV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDEyOyBpKyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgTm90ZUNvbG9yc1tpXSA9IENvbG9yLkJsYWNrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzaGFkZUJydXNoICE9IG51bGwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNoYWRlQnJ1c2guRGlzcG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgc2hhZGUyQnJ1c2guRGlzcG9zZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNoYWRlQnJ1c2ggPSBuZXcgU29saWRCcnVzaChuZXdzaGFkZSk7XHJcbiAgICAgICAgICAgIHNoYWRlMkJydXNoID0gbmV3IFNvbGlkQnJ1c2gobmV3c2hhZGUyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBHZXQgdGhlIGNvbG9yIGZvciBhIGdpdmVuIG5vdGUgbnVtYmVyICovXHJcbiAgICAgICAgcHVibGljIENvbG9yIE5vdGVDb2xvcihpbnQgbnVtYmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIE5vdGVDb2xvcnNbTm90ZVNjYWxlLkZyb21OdW1iZXIobnVtYmVyKV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogR2V0IHRoZSBzaGFkZSBicnVzaCAqL1xyXG4gICAgICAgIHB1YmxpYyBCcnVzaCBTaGFkZUJydXNoXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gc2hhZGVCcnVzaDsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIEdldCB0aGUgc2hhZGUyIGJydXNoICovXHJcbiAgICAgICAgcHVibGljIEJydXNoIFNoYWRlMkJydXNoXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gc2hhZGUyQnJ1c2g7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBHZXQgd2hldGhlciB0byBzaG93IG5vdGUgbGV0dGVycyBvciBub3QgKi9cclxuICAgICAgICBwdWJsaWMgaW50IFNob3dOb3RlTGV0dGVyc1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIHNob3dOb3RlTGV0dGVyczsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIEdldCB0aGUgbWFpbiBrZXkgc2lnbmF0dXJlICovXHJcbiAgICAgICAgcHVibGljIEtleVNpZ25hdHVyZSBNYWluS2V5XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gbWFpbmtleTsgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBTZXQgdGhlIHNpemUgb2YgdGhlIG5vdGVzLCBsYXJnZSBvciBzbWFsbC4gIFNtYWxsZXIgbm90ZXMgbWVhbnNcbiAgICAgICAgICogbW9yZSBub3RlcyBwZXIgc3RhZmYuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBTZXROb3RlU2l6ZShib29sIGxhcmdlbm90ZXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAobGFyZ2Vub3RlcylcclxuICAgICAgICAgICAgICAgIExpbmVTcGFjZSA9IDc7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIExpbmVTcGFjZSA9IDU7XHJcblxyXG4gICAgICAgICAgICBTdGFmZkhlaWdodCA9IExpbmVTcGFjZSAqIDQgKyBMaW5lV2lkdGggKiA1O1xyXG4gICAgICAgICAgICBOb3RlSGVpZ2h0ID0gTGluZVNwYWNlICsgTGluZVdpZHRoO1xyXG4gICAgICAgICAgICBOb3RlV2lkdGggPSAzICogTGluZVNwYWNlIC8gMjtcclxuICAgICAgICAgICAgTGV0dGVyRm9udCA9IG5ldyBGb250KFwiQXJpYWxcIiwgOCwgRm9udFN0eWxlLlJlZ3VsYXIpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBEcmF3IHRoZSBTaGVldE11c2ljLlxuICAgICAgICAgKiBTY2FsZSB0aGUgZ3JhcGhpY3MgYnkgdGhlIGN1cnJlbnQgem9vbSBmYWN0b3IuXG4gICAgICAgICAqIEdldCB0aGUgdmVydGljYWwgc3RhcnQgYW5kIGVuZCBwb2ludHMgb2YgdGhlIGNsaXAgYXJlYS5cbiAgICAgICAgICogT25seSBkcmF3IFN0YWZmcyB3aGljaCBsaWUgaW5zaWRlIHRoZSBjbGlwIGFyZWEuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByb3RlY3RlZCAvKm92ZXJyaWRlKi8gdm9pZCBPblBhaW50KFBhaW50RXZlbnRBcmdzIGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBSZWN0YW5nbGUgY2xpcCA9XHJcbiAgICAgICAgICAgICAgbmV3IFJlY3RhbmdsZSgoaW50KShlLkNsaXBSZWN0YW5nbGUuWCAvIHpvb20pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGludCkoZS5DbGlwUmVjdGFuZ2xlLlkgLyB6b29tKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChpbnQpKGUuQ2xpcFJlY3RhbmdsZS5XaWR0aCAvIHpvb20pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGludCkoZS5DbGlwUmVjdGFuZ2xlLkhlaWdodCAvIHpvb20pKTtcclxuXHJcbiAgICAgICAgICAgIEdyYXBoaWNzIGcgPSBlLkdyYXBoaWNzKCk7XHJcbiAgICAgICAgICAgIGcuU2NhbGVUcmFuc2Zvcm0oem9vbSwgem9vbSk7XHJcbiAgICAgICAgICAgIC8qIGcuUGFnZVNjYWxlID0gem9vbTsgKi9cclxuICAgICAgICAgICAgZy5TbW9vdGhpbmdNb2RlID0gU21vb3RoaW5nTW9kZS5BbnRpQWxpYXM7XHJcbiAgICAgICAgICAgIGludCB5cG9zID0gMDtcclxuICAgICAgICAgICAgZm9yZWFjaCAoU3RhZmYgc3RhZmYgaW4gc3RhZmZzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKHlwb3MgKyBzdGFmZi5IZWlnaHQgPCBjbGlwLlkpIHx8ICh5cG9zID4gY2xpcC5ZICsgY2xpcC5IZWlnaHQpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFN0YWZmIGlzIG5vdCBpbiB0aGUgY2xpcCwgZG9uJ3QgbmVlZCB0byBkcmF3IGl0ICovXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oMCwgeXBvcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhZmYuRHJhdyhnLCBjbGlwLCBwZW4sIFNlbGVjdGlvblN0YXJ0UHVsc2UsIFNlbGVjdGlvbkVuZFB1bHNlLCBkZXNlbGVjdGVkU2hhZGVCcnVzaCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oMCwgLXlwb3MpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHlwb3MgKz0gc3RhZmYuSGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGcuU2NhbGVUcmFuc2Zvcm0oMS4wZiAvIHpvb20sIDEuMGYgLyB6b29tKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBXcml0ZSB0aGUgTUlESSBmaWxlbmFtZSBhdCB0aGUgdG9wIG9mIHRoZSBwYWdlICovXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIERyYXdUaXRsZShHcmFwaGljcyBnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW50IGxlZnRtYXJnaW4gPSAyMDtcclxuICAgICAgICAgICAgaW50IHRvcG1hcmdpbiA9IDIwO1xyXG4gICAgICAgICAgICBzdHJpbmcgdGl0bGUgPSBQYXRoLkdldEZpbGVOYW1lKGZpbGVuYW1lKTtcclxuICAgICAgICAgICAgdGl0bGUgPSB0aXRsZS5SZXBsYWNlKFwiLm1pZFwiLCBcIlwiKS5SZXBsYWNlKFwiX1wiLCBcIiBcIik7XHJcbiAgICAgICAgICAgIEZvbnQgZm9udCA9IG5ldyBGb250KFwiQXJpYWxcIiwgMTAsIEZvbnRTdHlsZS5Cb2xkKTtcclxuICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0obGVmdG1hcmdpbiwgdG9wbWFyZ2luKTtcclxuICAgICAgICAgICAgZy5EcmF3U3RyaW5nKHRpdGxlLCBmb250LCBCcnVzaGVzLkJsYWNrLCAwLCAwKTtcclxuICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLWxlZnRtYXJnaW4sIC10b3BtYXJnaW4pO1xyXG4gICAgICAgICAgICBmb250LkRpc3Bvc2UoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm4gdGhlIG51bWJlciBvZiBwYWdlcyBuZWVkZWQgdG8gcHJpbnQgdGhpcyBzaGVldCBtdXNpYy5cbiAgICAgICAgICogQSBzdGFmZiBzaG91bGQgZml0IHdpdGhpbiBhIHNpbmdsZSBwYWdlLCBub3QgYmUgc3BsaXQgYWNyb3NzIHR3byBwYWdlcy5cbiAgICAgICAgICogSWYgdGhlIHNoZWV0IG11c2ljIGhhcyBleGFjdGx5IDIgdHJhY2tzLCB0aGVuIHR3byBzdGFmZnMgc2hvdWxkXG4gICAgICAgICAqIGZpdCB3aXRoaW4gYSBzaW5nbGUgcGFnZSwgYW5kIG5vdCBiZSBzcGxpdCBhY3Jvc3MgdHdvIHBhZ2VzLlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgaW50IEdldFRvdGFsUGFnZXMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW50IG51bSA9IDE7XHJcbiAgICAgICAgICAgIGludCBjdXJyaGVpZ2h0ID0gVGl0bGVIZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICBpZiAobnVtdHJhY2tzID09IDIgJiYgKHN0YWZmcy5Db3VudCAlIDIpID09IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgc3RhZmZzLkNvdW50OyBpICs9IDIpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IGhlaWdodHMgPSBzdGFmZnNbaV0uSGVpZ2h0ICsgc3RhZmZzW2kgKyAxXS5IZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJoZWlnaHQgKyBoZWlnaHRzID4gUGFnZUhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bSsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyaGVpZ2h0ID0gaGVpZ2h0cztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmhlaWdodCArPSBoZWlnaHRzO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKFN0YWZmIHN0YWZmIGluIHN0YWZmcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmhlaWdodCArIHN0YWZmLkhlaWdodCA+IFBhZ2VIZWlnaHQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBudW0rKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmhlaWdodCA9IHN0YWZmLkhlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmhlaWdodCArPSBzdGFmZi5IZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBudW07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogU2hhZGUgYWxsIHRoZSBjaG9yZHMgcGxheWVkIGF0IHRoZSBnaXZlbiBwdWxzZSB0aW1lLlxuICAgICAgICAgKiAgTG9vcCB0aHJvdWdoIGFsbCB0aGUgc3RhZmZzIGFuZCBjYWxsIHN0YWZmLlNoYWRlKCkuXG4gICAgICAgICAqICBJZiBzY3JvbGxHcmFkdWFsbHkgaXMgdHJ1ZSwgc2Nyb2xsIGdyYWR1YWxseSAoc21vb3RoIHNjcm9sbGluZylcbiAgICAgICAgICogIHRvIHRoZSBzaGFkZWQgbm90ZXMuIFJldHVybnMgdGhlIG1pbmltdW0geS1jb29yZGluYXRlIG9mIHRoZSBzaGFkZWQgY2hvcmQgKGZvciBzY3JvbGxpbmcgcHVycG9zZXMpXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBpbnQgU2hhZGVOb3RlcyhpbnQgY3VycmVudFB1bHNlVGltZSwgaW50IHByZXZQdWxzZVRpbWUsIGJvb2wgc2Nyb2xsR3JhZHVhbGx5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgR3JhcGhpY3MgZyA9IENyZWF0ZUdyYXBoaWNzKFwic2hhZGVOb3Rlc1wiKTtcclxuICAgICAgICAgICAgZy5TbW9vdGhpbmdNb2RlID0gU21vb3RoaW5nTW9kZS5BbnRpQWxpYXM7XHJcbiAgICAgICAgICAgIGcuU2NhbGVUcmFuc2Zvcm0oem9vbSwgem9vbSk7XHJcbiAgICAgICAgICAgIGludCB5cG9zID0gMDtcclxuXHJcbiAgICAgICAgICAgIGludCB4X3NoYWRlID0gMDtcclxuICAgICAgICAgICAgaW50IHlfc2hhZGUgPSAwO1xyXG5cclxuICAgICAgICAgICAgaW50IHNoYWRlZFlQb3MgPSAtMTtcclxuICAgICAgICAgICAgZm9yZWFjaCAoU3RhZmYgc3RhZmYgaW4gc3RhZmZzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgwLCB5cG9zKTtcclxuICAgICAgICAgICAgICAgIGlmIChzdGFmZi5TaGFkZU5vdGVzKGcsIHNoYWRlQnJ1c2gsIHBlbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFB1bHNlVGltZSwgcHJldlB1bHNlVGltZSwgcmVmIHhfc2hhZGUpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNoYWRlZFlQb3MgPSBzaGFkZWRZUG9zID09IC0xID8geXBvcyA6IHNoYWRlZFlQb3M7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgwLCAteXBvcyk7XHJcbiAgICAgICAgICAgICAgICB5cG9zICs9IHN0YWZmLkhlaWdodDtcclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50UHVsc2VUaW1lID49IHN0YWZmLkVuZFRpbWUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgeV9zaGFkZSArPSBzdGFmZi5IZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZy5TY2FsZVRyYW5zZm9ybSgxLjBmIC8gem9vbSwgMS4wZiAvIHpvb20pO1xyXG4gICAgICAgICAgICBnLkRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgeF9zaGFkZSA9IChpbnQpKHhfc2hhZGUgKiB6b29tKTtcclxuICAgICAgICAgICAgeV9zaGFkZSAtPSBOb3RlSGVpZ2h0O1xyXG4gICAgICAgICAgICB5X3NoYWRlID0gKGludCkoeV9zaGFkZSAqIHpvb20pO1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudFB1bHNlVGltZSA+PSAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBTY3JvbGxUb1NoYWRlZE5vdGVzKHhfc2hhZGUsIHlfc2hhZGUsIHNjcm9sbEdyYWR1YWxseSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNoYWRlZFlQb3MgPT0gLTEgPyAtMSA6IChpbnQpKHNoYWRlZFlQb3MgKiB6b29tKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBTY3JvbGwgdGhlIHNoZWV0IG11c2ljIHNvIHRoYXQgdGhlIHNoYWRlZCBub3RlcyBhcmUgdmlzaWJsZS5cbiAgICAgICAgICAqIElmIHNjcm9sbEdyYWR1YWxseSBpcyB0cnVlLCBzY3JvbGwgZ3JhZHVhbGx5IChzbW9vdGggc2Nyb2xsaW5nKVxuICAgICAgICAgICogdG8gdGhlIHNoYWRlZCBub3Rlcy5cbiAgICAgICAgICAqL1xyXG4gICAgICAgIHZvaWQgU2Nyb2xsVG9TaGFkZWROb3RlcyhpbnQgeF9zaGFkZSwgaW50IHlfc2hhZGUsIGJvb2wgc2Nyb2xsR3JhZHVhbGx5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgUGFuZWwgc2Nyb2xsdmlldyA9IChQYW5lbCl0aGlzLlBhcmVudDtcclxuICAgICAgICAgICAgUG9pbnQgc2Nyb2xsUG9zID0gc2Nyb2xsdmlldy5BdXRvU2Nyb2xsUG9zaXRpb247XHJcblxyXG4gICAgICAgICAgICAvKiBUaGUgc2Nyb2xsIHBvc2l0aW9uIGlzIGluIG5lZ2F0aXZlIGNvb3JkaW5hdGVzIGZvciBzb21lIHJlYXNvbiAqL1xyXG4gICAgICAgICAgICBzY3JvbGxQb3MuWCA9IC1zY3JvbGxQb3MuWDtcclxuICAgICAgICAgICAgc2Nyb2xsUG9zLlkgPSAtc2Nyb2xsUG9zLlk7XHJcbiAgICAgICAgICAgIFBvaW50IG5ld1BvcyA9IHNjcm9sbFBvcztcclxuXHJcbiAgICAgICAgICAgIGlmIChzY3JvbGxWZXJ0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgc2Nyb2xsRGlzdCA9IChpbnQpKHlfc2hhZGUgLSBzY3JvbGxQb3MuWSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNjcm9sbEdyYWR1YWxseSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2Nyb2xsRGlzdCA+ICh6b29tICogU3RhZmZIZWlnaHQgKiA4KSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsRGlzdCA9IHNjcm9sbERpc3QgLyAyO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHNjcm9sbERpc3QgPiAoTm90ZUhlaWdodCAqIDMgKiB6b29tKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsRGlzdCA9IChpbnQpKE5vdGVIZWlnaHQgKiAzICogem9vbSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBuZXdQb3MgPSBuZXcgUG9pbnQoc2Nyb2xsUG9zLlgsIHNjcm9sbFBvcy5ZICsgc2Nyb2xsRGlzdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgeF92aWV3ID0gc2Nyb2xsUG9zLlggKyA0MCAqIHNjcm9sbHZpZXcuV2lkdGggLyAxMDA7XHJcbiAgICAgICAgICAgICAgICBpbnQgeG1heCA9IHNjcm9sbFBvcy5YICsgNjUgKiBzY3JvbGx2aWV3LldpZHRoIC8gMTAwO1xyXG4gICAgICAgICAgICAgICAgaW50IHNjcm9sbERpc3QgPSB4X3NoYWRlIC0geF92aWV3O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzY3JvbGxHcmFkdWFsbHkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHhfc2hhZGUgPiB4bWF4KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxEaXN0ID0gKHhfc2hhZGUgLSB4X3ZpZXcpIC8gMztcclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh4X3NoYWRlID4geF92aWV3KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxEaXN0ID0gKHhfc2hhZGUgLSB4X3ZpZXcpIC8gNjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBuZXdQb3MgPSBuZXcgUG9pbnQoc2Nyb2xsUG9zLlggKyBzY3JvbGxEaXN0LCBzY3JvbGxQb3MuWSk7XHJcbiAgICAgICAgICAgICAgICBpZiAobmV3UG9zLlggPCAwKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld1Bvcy5YID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzY3JvbGx2aWV3LkF1dG9TY3JvbGxQb3NpdGlvbiA9IG5ld1BvcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBSZXR1cm4gdGhlIHB1bHNlVGltZSBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlbiBwb2ludCBvbiB0aGUgU2hlZXRNdXNpYy5cbiAgICAgICAgICogIEZpcnN0LCBmaW5kIHRoZSBzdGFmZiBjb3JyZXNwb25kaW5nIHRvIHRoZSBwb2ludC5cbiAgICAgICAgICogIFRoZW4sIHdpdGhpbiB0aGUgc3RhZmYsIGZpbmQgdGhlIG5vdGVzL3N5bWJvbHMgY29ycmVzcG9uZGluZyB0byB0aGUgcG9pbnQsXG4gICAgICAgICAqICBhbmQgcmV0dXJuIHRoZSBTdGFydFRpbWUgKHB1bHNlVGltZSkgb2YgdGhlIHN5bWJvbHMuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBpbnQgUHVsc2VUaW1lRm9yUG9pbnQoUG9pbnQgcG9pbnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBQb2ludCBzY2FsZWRQb2ludCA9IG5ldyBQb2ludCgoaW50KShwb2ludC5YIC8gem9vbSksIChpbnQpKHBvaW50LlkgLyB6b29tKSk7XHJcbiAgICAgICAgICAgIGludCB5ID0gMDtcclxuICAgICAgICAgICAgZm9yZWFjaCAoU3RhZmYgc3RhZmYgaW4gc3RhZmZzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2NhbGVkUG9pbnQuWSA+PSB5ICYmIHNjYWxlZFBvaW50LlkgPD0geSArIHN0YWZmLkhlaWdodClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhZmYuUHVsc2VUaW1lRm9yUG9pbnQoc2NhbGVkUG9pbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgeSArPSBzdGFmZi5IZWlnaHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzdHJpbmcgcmVzdWx0ID0gXCJTaGVldE11c2ljIHN0YWZmcz1cIiArIHN0YWZmcy5Db3VudCArIFwiXFxuXCI7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKFN0YWZmIHN0YWZmIGluIHN0YWZmcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHN0YWZmLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzdWx0ICs9IFwiRW5kIFNoZWV0TXVzaWNcXG5cIjtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxuXG59XG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgU29saWRCcnVzaDpCcnVzaFxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBTb2xpZEJydXNoKENvbG9yIGNvbG9yKTpcclxuICAgICAgICAgICAgYmFzZShjb2xvcilcclxuICAgICAgICB7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMSBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIEBjbGFzcyBUaW1lU2lnU3ltYm9sXG4gKiBBIFRpbWVTaWdTeW1ib2wgcmVwcmVzZW50cyB0aGUgdGltZSBzaWduYXR1cmUgYXQgdGhlIGJlZ2lubmluZ1xuICogb2YgdGhlIHN0YWZmLiBXZSB1c2UgcHJlLW1hZGUgaW1hZ2VzIGZvciB0aGUgbnVtYmVycywgaW5zdGVhZCBvZlxuICogZHJhd2luZyBzdHJpbmdzLlxuICovXG5cbnB1YmxpYyBjbGFzcyBUaW1lU2lnU3ltYm9sIDogTXVzaWNTeW1ib2wge1xuICAgIHByaXZhdGUgc3RhdGljIEltYWdlW10gaW1hZ2VzOyAgLyoqIFRoZSBpbWFnZXMgZm9yIGVhY2ggbnVtYmVyICovXG4gICAgcHJpdmF0ZSBpbnQgIG51bWVyYXRvcjsgICAgICAgICAvKiogVGhlIG51bWVyYXRvciAqL1xuICAgIHByaXZhdGUgaW50ICBkZW5vbWluYXRvcjsgICAgICAgLyoqIFRoZSBkZW5vbWluYXRvciAqL1xuICAgIHByaXZhdGUgaW50ICB3aWR0aDsgICAgICAgICAgICAgLyoqIFRoZSB3aWR0aCBpbiBwaXhlbHMgKi9cbiAgICBwcml2YXRlIGJvb2wgY2FuZHJhdzsgICAgICAgICAgIC8qKiBUcnVlIGlmIHdlIGNhbiBkcmF3IHRoZSB0aW1lIHNpZ25hdHVyZSAqL1xuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBUaW1lU2lnU3ltYm9sICovXG4gICAgcHVibGljIFRpbWVTaWdTeW1ib2woaW50IG51bWVyLCBpbnQgZGVub20pIHtcbiAgICAgICAgbnVtZXJhdG9yID0gbnVtZXI7XG4gICAgICAgIGRlbm9taW5hdG9yID0gZGVub207XG4gICAgICAgIExvYWRJbWFnZXMoKTtcbiAgICAgICAgaWYgKG51bWVyID49IDAgJiYgbnVtZXIgPCBpbWFnZXMuTGVuZ3RoICYmIGltYWdlc1tudW1lcl0gIT0gbnVsbCAmJlxuICAgICAgICAgICAgZGVub20gPj0gMCAmJiBkZW5vbSA8IGltYWdlcy5MZW5ndGggJiYgaW1hZ2VzW251bWVyXSAhPSBudWxsKSB7XG4gICAgICAgICAgICBjYW5kcmF3ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNhbmRyYXcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB3aWR0aCA9IE1pbldpZHRoO1xuICAgIH1cblxuICAgIC8qKiBMb2FkIHRoZSBpbWFnZXMgaW50byBtZW1vcnkuICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBMb2FkSW1hZ2VzKCkge1xuICAgICAgICBpZiAoaW1hZ2VzID09IG51bGwpIHtcbiAgICAgICAgICAgIGltYWdlcyA9IG5ldyBJbWFnZVsxM107XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDEzOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpbWFnZXNbaV0gPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW1hZ2VzWzJdID0gbmV3IEJpdG1hcCh0eXBlb2YoVGltZVNpZ1N5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy50d28ucG5nXCIpO1xuICAgICAgICAgICAgaW1hZ2VzWzNdID0gbmV3IEJpdG1hcCh0eXBlb2YoVGltZVNpZ1N5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy50aHJlZS5wbmdcIik7XG4gICAgICAgICAgICBpbWFnZXNbNF0gPSBuZXcgQml0bWFwKHR5cGVvZihUaW1lU2lnU3ltYm9sKSwgXCJSZXNvdXJjZXMuSW1hZ2VzLmZvdXIucG5nXCIpO1xuICAgICAgICAgICAgaW1hZ2VzWzZdID0gbmV3IEJpdG1hcCh0eXBlb2YoVGltZVNpZ1N5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy5zaXgucG5nXCIpO1xuICAgICAgICAgICAgaW1hZ2VzWzhdID0gbmV3IEJpdG1hcCh0eXBlb2YoVGltZVNpZ1N5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy5laWdodC5wbmdcIik7XG4gICAgICAgICAgICBpbWFnZXNbOV0gPSBuZXcgQml0bWFwKHR5cGVvZihUaW1lU2lnU3ltYm9sKSwgXCJSZXNvdXJjZXMuSW1hZ2VzLm5pbmUucG5nXCIpO1xuICAgICAgICAgICAgaW1hZ2VzWzEyXSA9IG5ldyBCaXRtYXAodHlwZW9mKFRpbWVTaWdTeW1ib2wpLCBcIlJlc291cmNlcy5JbWFnZXMudHdlbHZlLnBuZ1wiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIHRpbWUgKGluIHB1bHNlcykgdGhpcyBzeW1ib2wgb2NjdXJzIGF0LiAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgU3RhcnRUaW1lIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIC0xOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbWluaW11bSB3aWR0aCAoaW4gcGl4ZWxzKSBuZWVkZWQgdG8gZHJhdyB0aGlzIHN5bWJvbCAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgTWluV2lkdGgge1xuICAgICAgICBnZXQgeyBpZiAoY2FuZHJhdykgXG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW1hZ2VzWzJdLldpZHRoICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMiAvaW1hZ2VzWzJdLkhlaWdodDtcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEdldC9TZXQgdGhlIHdpZHRoIChpbiBwaXhlbHMpIG9mIHRoaXMgc3ltYm9sLiBUaGUgd2lkdGggaXMgc2V0XG4gICAgICogaW4gU2hlZXRNdXNpYy5BbGlnblN5bWJvbHMoKSB0byB2ZXJ0aWNhbGx5IGFsaWduIHN5bWJvbHMuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBXaWR0aCB7XG4gICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgc2V0IHsgd2lkdGggPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBhYm92ZSB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBBYm92ZVN0YWZmIHsgXG4gICAgICAgIGdldCB7ICByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBiZWxvdyB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBCZWxvd1N0YWZmIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIDA7IH0gXG4gICAgfVxuXG4gICAgLyoqIERyYXcgdGhlIHN5bWJvbC5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgXG4gICAgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIGlmICghY2FuZHJhdylcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybShXaWR0aCAtIE1pbldpZHRoLCAwKTtcbiAgICAgICAgSW1hZ2UgbnVtZXIgPSBpbWFnZXNbbnVtZXJhdG9yXTtcbiAgICAgICAgSW1hZ2UgZGVub20gPSBpbWFnZXNbZGVub21pbmF0b3JdO1xuXG4gICAgICAgIC8qIFNjYWxlIHRoZSBpbWFnZSB3aWR0aCB0byBtYXRjaCB0aGUgaGVpZ2h0ICovXG4gICAgICAgIGludCBpbWdoZWlnaHQgPSBTaGVldE11c2ljLk5vdGVIZWlnaHQgKiAyO1xuICAgICAgICBpbnQgaW1nd2lkdGggPSBudW1lci5XaWR0aCAqIGltZ2hlaWdodCAvIG51bWVyLkhlaWdodDtcbiAgICAgICAgZy5EcmF3SW1hZ2UobnVtZXIsIDAsIHl0b3AsIGltZ3dpZHRoLCBpbWdoZWlnaHQpO1xuICAgICAgICBnLkRyYXdJbWFnZShkZW5vbSwgMCwgeXRvcCArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyLCBpbWd3aWR0aCwgaW1naGVpZ2h0KTtcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShXaWR0aCAtIE1pbldpZHRoKSwgMCk7XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJUaW1lU2lnU3ltYm9sIG51bWVyYXRvcj17MH0gZGVub21pbmF0b3I9ezF9XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWVyYXRvciwgZGVub21pbmF0b3IpO1xuICAgIH1cbn1cblxufVxuXG4iXQp9Cg==
