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

    Bridge.define("MidiSheetMusic.BoundedByteArray", {
        fields: {
            offset: 0,
            count: 0,
            data: null
        },
        ctors: {
            ctor: function (offset, count, data) {
                this.$initialize();
                this.offset = offset;
                this.count = count;
                this.data = data;
            }
        },
        methods: {
            GetData: function () {
                var slice = System.Array.init(this.count, 0, System.Byte);
                System.Array.copy(this.data, this.offset, slice, 0, this.count);
                return slice;
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
                        return MidiSheetMusic.Color.FromRgb(255, 255, 255);
                    }
                },
                LightGray: {
                    get: function () {
                        return MidiSheetMusic.Color.FromRgb(211, 211, 211);
                    }
                }
            },
            methods: {
                FromRgb: function (red, green, blue) {
                    return MidiSheetMusic.Color.FromArgb(255, red, green, blue);
                },
                FromArgb: function (alpha, red, green, blue) {
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
                        if (Bridge.is($e1, MidiSheetMusic.IOException)) {
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
                var header = { };
                if (MidiSheetMusic.RiffParser.IsRiffFile(data, header)) {
                    data = this.ParseRiffData(data);
                }

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
            ParseRiffData: function (data) {
                var riffFile = MidiSheetMusic.RiffParser.ParseByteArray(data);
                if (!Bridge.referenceEquals(riffFile.FileInfo.FileType, "RMID")) {
                    return data;
                }
                while (riffFile.Read(function (type, isList, chunk) {
                    if (!isList && Bridge.referenceEquals(type.toLowerCase(), "data")) {
                        data = chunk.GetData();
                    }
                })) {
                    ;
                }
                return data;
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
                        if (Bridge.is($e1, MidiSheetMusic.MidiFileException)) {
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
                    if (Bridge.is($e1, MidiSheetMusic.IOException)) {
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
            id: 0,
            starttime: 0,
            channel: 0,
            notenumber: 0,
            duration: 0,
            velocity: 0
        },
        props: {
            Id: {
                get: function () {
                    return this.id;
                }
            },
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
            ctor: function (id, starttime, channel, notenumber, duration, velocity) {
                this.$initialize();
                this.id = id;
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
                return new MidiSheetMusic.MidiNote(this.id, this.starttime, this.channel, this.notenumber, this.duration, this.velocity);
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
                this.shadeColor = MidiSheetMusic.Color.FromArgb(100, 53, 123, 255);
                this.shade2Color = MidiSheetMusic.Color.FromRgb(80, 100, 250);
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
        statics: {
            fields: {
                noteIdCounter: 0
            },
            ctors: {
                init: function () {
                    this.noteIdCounter = 0;
                }
            }
        },
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
                var $t, $t1;
                this.$initialize();
                this.tracknum = tracknum;
                this.notes = new (System.Collections.Generic.List$1(MidiSheetMusic.MidiNote)).$ctor2(events.Count);
                this.instrument = 0;

                $t = Bridge.getEnumerator(events);
                try {
                    while ($t.moveNext()) {
                        var mevent = $t.Current;
                        if (mevent.EventFlag === MidiSheetMusic.MidiFile.EventNoteOn && mevent.Velocity > 0) {
                            var note = new MidiSheetMusic.MidiNote(Bridge.identity(MidiSheetMusic.MidiTrack.noteIdCounter, ($t1 = (MidiSheetMusic.MidiTrack.noteIdCounter + 1) | 0, MidiSheetMusic.MidiTrack.noteIdCounter = $t1, $t1)), mevent.StartTime, mevent.Channel, mevent.Notenumber, 0, mevent.Velocity);
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

    Bridge.define("MidiSheetMusic.RiffFileInfo", {
        fields: {
            Header: null,
            FileType: null,
            FileSize: 0
        }
    });

    Bridge.define("MidiSheetMusic.RiffParser", {
        statics: {
            fields: {
                WordSize: 0,
                Riff4CC: null,
                RifX4CC: null,
                List4CC: null
            },
            ctors: {
                init: function () {
                    this.WordSize = 4;
                    this.Riff4CC = "RIFF";
                    this.RifX4CC = "RIFX";
                    this.List4CC = "LIST";
                }
            },
            methods: {
                ReadHeader: function (data) {
                    var $t;
                    if (data.length < 12) {
                        throw new MidiSheetMusic.RiffParserException("Read failed. File too small?");
                    }

                    var header = { };
                    if (!MidiSheetMusic.RiffParser.IsRiffFile(data, header)) {
                        throw new MidiSheetMusic.RiffParserException("Read failed. No RIFF header");
                    }
                    return ($t = new MidiSheetMusic.RiffFileInfo(), $t.Header = header.v, $t.FileSize = System.BitConverter.toInt32(data, MidiSheetMusic.RiffParser.WordSize), $t.FileType = System.Text.Encoding.ASCII.GetString$1(data, 8, MidiSheetMusic.RiffParser.WordSize), $t);
                },
                ParseByteArray: function (data) {
                    var riffParser = new MidiSheetMusic.RiffParser();
                    riffParser.Init(data);
                    return riffParser;
                },
                IsRiffFile: function (data, header) {
                    var test = System.Text.Encoding.ASCII.GetString$1(data, 0, MidiSheetMusic.RiffParser.WordSize);
                    if (Bridge.referenceEquals(test, MidiSheetMusic.RiffParser.Riff4CC) || Bridge.referenceEquals(test, MidiSheetMusic.RiffParser.RifX4CC)) {
                        header.v = test;
                        return true;
                    }
                    header.v = null;
                    return false;
                }
            }
        },
        fields: {
            data: null,
            position: 0,
            FileInfo: null
        },
        ctors: {
            ctor: function () {
                this.$initialize();
            }
        },
        methods: {
            Init: function (data) {
                this.data = data;
                this.FileInfo = MidiSheetMusic.RiffParser.ReadHeader(data);
                this.position = 12;
            },
            Read: function (processElement) {
                if (((this.data.length - this.position) | 0) < 8) {
                    return false;
                }

                var type = System.Text.Encoding.ASCII.GetString$1(this.data, this.position, MidiSheetMusic.RiffParser.WordSize);
                this.position = (this.position + MidiSheetMusic.RiffParser.WordSize) | 0;
                var size = System.BitConverter.toInt32(this.data, this.position);
                this.position = (this.position + MidiSheetMusic.RiffParser.WordSize) | 0;

                if (((this.data.length - this.position) | 0) < size) {
                    throw new MidiSheetMusic.RiffParserException((System.String.format("Element size mismatch for element {0} ", [type]) || "") + (System.String.format("need {0} but have only {1}", Bridge.box(size, System.Int32), Bridge.box(((this.FileInfo.FileSize - this.position) | 0), System.Int32)) || ""));
                }

                if (Bridge.referenceEquals(type, MidiSheetMusic.RiffParser.List4CC)) {
                    var listType = System.Text.Encoding.ASCII.GetString$1(this.data, this.position, MidiSheetMusic.RiffParser.WordSize);
                    processElement(listType, true, new MidiSheetMusic.BoundedByteArray(((this.position + MidiSheetMusic.RiffParser.WordSize) | 0), size, this.data));
                    this.position = (this.position + size) | 0;
                } else {
                    var paddedSize = size;
                    if ((size & 1) !== 0) {
                        paddedSize = (paddedSize + 1) | 0;
                    }
                    processElement(type, false, new MidiSheetMusic.BoundedByteArray(this.position, size, this.data));
                    this.position = (this.position + paddedSize) | 0;
                }
                return true;
            }
        }
    });

    Bridge.define("MidiSheetMusic.RiffParserException", {
        inherits: [System.Exception],
        ctors: {
            ctor: function (message) {
                this.$initialize();
                System.Exception.ctor.call(this, message);

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

    Bridge.define("MidiSheetMusicBridge.Text.ASCII", {
        methods: {
            GetString: function (data, startIndex, len) {
                var toReturn = "";
                for (var i = 0; i < len && i < data.length; i = (i + 1) | 0) {
                    toReturn = (toReturn || "") + String.fromCharCode(data[System.Array.index(((i + startIndex) | 0), data)]);
                }
                return toReturn;
            }
        }
    });

    Bridge.define("MidiSheetMusicBridge.Text.Encoding", {
        statics: {
            fields: {
                ASCII: null
            },
            ctors: {
                init: function () {
                    this.ASCII = new MidiSheetMusicBridge.Text.ASCII();
                }
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
                var gray1 = MidiSheetMusic.Color.FromRgb(16, 16, 16);
                var gray2 = MidiSheetMusic.Color.FromRgb(90, 90, 90);
                var gray3 = MidiSheetMusic.Color.FromRgb(200, 200, 200);
                var shade1 = MidiSheetMusic.Color.FromRgb(210, 205, 220);
                var shade2 = MidiSheetMusic.Color.FromRgb(150, 200, 220);

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
            $ctor1: function (file, options, tracks) {
                this.$initialize();
                MidiSheetMusic.Control.ctor.call(this);
                this.init$1(file, options, tracks);
            },
            $ctor2: function (data, title, options) {
                this.$initialize();
                MidiSheetMusic.Control.ctor.call(this);
                var file = new MidiSheetMusic.MidiFile(data, title);
                this.init(file, options);
            }
        },
        methods: {
            init$1: function (file, options, tracks) {
                var $t;
                this.zoom = 1.0;
                this.filename = file.FileName;

                this.SetColors(options.colors, options.shadeColor, options.shade2Color);
                this.pen = new MidiSheetMusic.Pen(MidiSheetMusic.Color.Black, 1);

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
            init: function (file, options) {
                if (options == null) {
                    options = new MidiSheetMusic.MidiOptions.$ctor1(file);
                }
                var tracks = file.ChangeMidiNotes(options);
                this.init$1(file, options, tracks);

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
            ShadeNotes: function (currentPulseTime, prevPulseTime, scrollGradually, brush) {
                var $t;
                var g = this.CreateGraphics("shadeNotes");
                g.SmoothingMode = MidiSheetMusic.SmoothingMode.AntiAlias;
                g.ScaleTransform(this.zoom, this.zoom);
                var ypos = 0;

                var x_shade = { v : 0 };
                var y_shade = 0;
                var height = 0;

                $t = Bridge.getEnumerator(this.staffs);
                try {
                    while ($t.moveNext()) {
                        var staff = $t.Current;
                        g.TranslateTransform(0, ypos);
                        staff.ShadeNotes(g, brush, this.pen, currentPulseTime, prevPulseTime, x_shade);
                        g.TranslateTransform(0, ((-ypos) | 0));
                        ypos = (ypos + staff.Height) | 0;
                        if (currentPulseTime >= staff.EndTime) {
                            y_shade = (y_shade + staff.Height) | 0;
                        }
                        if (currentPulseTime >= staff.StartTime && currentPulseTime <= staff.EndTime) {
                            height = (height + staff.Height) | 0;
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
                return new MidiSheetMusic.Rectangle(x_shade.v, y_shade, 0, Bridge.Int.clip32(height * this.zoom));
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJNaWRpU2hlZXRNdXNpY0JyaWRnZS5qcyIsCiAgInNvdXJjZVJvb3QiOiAiIiwKICAic291cmNlcyI6IFsiQ2xhc3Nlcy9EcmF3aW5nL0ltYWdlLmNzIiwiQ2xhc3Nlcy9SaWZmUGFyc2VyLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL0JydXNoLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL0JydXNoZXMuY3MiLCJDbGFzc2VzL0NsZWZNZWFzdXJlcy5jcyIsIkNsYXNzZXMvRHJhd2luZy9Db2xvci5jcyIsIkNsYXNzZXMvRHJhd2luZy9Db250cm9sLmNzIiwiQ2xhc3Nlcy9JTy9TdHJlYW0uY3MiLCJDbGFzc2VzL0RyYXdpbmcvRm9udC5jcyIsIkNsYXNzZXMvRHJhd2luZy9HcmFwaGljcy5jcyIsIkNsYXNzZXMvS2V5U2lnbmF0dXJlLmNzIiwiQ2xhc3Nlcy9MeXJpY1N5bWJvbC5jcyIsIkNsYXNzZXMvTWlkaUV2ZW50LmNzIiwiQ2xhc3Nlcy9NaWRpRmlsZS5jcyIsIkNsYXNzZXMvTWlkaUZpbGVFeGNlcHRpb24uY3MiLCJDbGFzc2VzL01pZGlGaWxlUmVhZGVyLmNzIiwiQ2xhc3Nlcy9NaWRpTm90ZS5jcyIsIkNsYXNzZXMvTWlkaU9wdGlvbnMuY3MiLCJDbGFzc2VzL01pZGlUcmFjay5jcyIsIkNsYXNzZXMvV2hpdGVOb3RlLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL1BhaW50RXZlbnRBcmdzLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL1BhbmVsLmNzIiwiQ2xhc3Nlcy9JTy9QYXRoLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL1Blbi5jcyIsIkNsYXNzZXMvRHJhd2luZy9Qb2ludC5jcyIsIkNsYXNzZXMvRHJhd2luZy9SZWN0YW5nbGUuY3MiLCJDbGFzc2VzL1N0YWZmLmNzIiwiQ2xhc3Nlcy9TdGVtLmNzIiwiQ2xhc3Nlcy9TeW1ib2xXaWR0aHMuY3MiLCJDbGFzc2VzL1RpbWVTaWduYXR1cmUuY3MiLCJDbGFzc2VzL1RleHQvQVNDSUkuY3MiLCJDbGFzc2VzL1RleHQvRW5jb2RpbmcuY3MiLCJDbGFzc2VzL0FjY2lkU3ltYm9sLmNzIiwiQ2xhc3Nlcy9CYXJTeW1ib2wuY3MiLCJDbGFzc2VzL0RyYXdpbmcvQml0bWFwLmNzIiwiQ2xhc3Nlcy9CbGFua1N5bWJvbC5jcyIsIkNsYXNzZXMvQ2hvcmRTeW1ib2wuY3MiLCJDbGFzc2VzL0NsZWZTeW1ib2wuY3MiLCJDbGFzc2VzL0lPL0ZpbGVTdHJlYW0uY3MiLCJDbGFzc2VzL1BpYW5vLmNzIiwiQ2xhc3Nlcy9SZXN0U3ltYm9sLmNzIiwiQ2xhc3Nlcy9TaGVldE11c2ljLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL1NvbGlkQnJ1c2guY3MiLCJDbGFzc2VzL1RpbWVTaWdTeW1ib2wuY3MiXSwKICAibmFtZXMiOiBbIiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQW9CZ0JBLE9BQU9BLDBCQUE4Q0E7Ozs7O29CQVFyREEsT0FBT0EsMkJBQStDQTs7Ozs7NEJBakI5Q0EsTUFBV0E7O2dCQUV2QkEsc0JBQXFDQSxNQUFNQSxNQUFNQTs7Ozs7Ozs7Ozs7OzRCQ2U3QkEsUUFBWUEsT0FBV0E7O2dCQUUzQ0EsY0FBY0E7Z0JBQ2RBLGFBQWFBO2dCQUNiQSxZQUFZQTs7Ozs7Z0JBS1pBLFlBQWVBLGtCQUFTQTtnQkFDeEJBLGtCQUFXQSxXQUFNQSxhQUFRQSxVQUFVQTtnQkFDbkNBLE9BQU9BOzs7Ozs7Ozs7OzRCQzdCRUE7O2dCQUVUQSxhQUFRQTs7Ozs7Ozs7Ozs7Ozt3QkNKc0JBLE9BQU9BLElBQUlBLHFCQUFNQTs7Ozs7d0JBQ2pCQSxPQUFPQSxJQUFJQSxxQkFBTUE7Ozs7O3dCQUNiQSxPQUFPQSxJQUFJQSxxQkFBTUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29DQ3FGOUJBOztvQkFDekJBLGNBQWNBO29CQUNkQTtvQkFDQUEsMEJBQXVCQTs7Ozs0QkFDbkJBLGlCQUFTQTs7Ozs7O3FCQUViQSxJQUFJQTt3QkFDQUEsT0FBT0E7MkJBRU5BLElBQUlBLHdCQUFNQSxzQkFBZUE7d0JBQzFCQSxP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b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBOztvQkFFMUJBLE1BQU1BLHlEQUFVQSwrQkFBVkE7b0JBQ05BLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTs7b0JBRTFCQSxNQUFNQSx5REFBVUEsK0JBQVZBO29CQUNOQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7O29CQUUxQkEsTUFBTUEseURBQVVBLCtCQUFWQTtvQkFDTkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBOztvQkFFMUJBLE1BQU1BLHlEQUFVQSwrQkFBVkE7b0JBQ05BLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTs7O29CQUcxQkEsTUFBTUEsd0RBQVNBLCtCQUFUQTtvQkFDTkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBOztvQkFFMUJBLE1BQU1BLHdEQUFTQSwrQkFBVEE7b0JBQ05BLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTs7b0JBRTFCQSxNQUFNQSx3REFBU0EsbUNBQVRBO29CQUNOQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7O29CQUUxQkEsTUFBTUEsd0RBQVNBLG1DQUFUQTtvQkFDTkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBOztvQkFFMUJBLE1BQU1BLHdEQUFTQSxtQ0FBVEE7b0JBQ05BLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTs7b0JBRTFCQSxNQUFNQSx3REFBU0EsbUNBQVRBO29CQUNOQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFL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Q2hCQSxlQUFlQSw0Q0FBY0EsWUFBWUE7Z0JBQ3pDQSxZQUFZQSxVQUFVQSxNQUFNQSxVQUFVQTtnQkFDdENBLFlBQVlBLFVBQVVBLFNBQU9BLCtEQUF5QkEsVUFBVUE7Z0JBQ2hFQSxxQkFBcUJBLEdBQUNBLENBQUNBLGVBQVFBOzs7Z0JBSS9CQSxPQUFPQSxvRUFDY0EsMENBQVdBIiwKICAic291cmNlc0NvbnRlbnQiOiBbInVzaW5nIEJyaWRnZTtcbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xue1xuICAgIHB1YmxpYyBjbGFzcyBJbWFnZVxuICAgIHtcbiAgICAgICAgcHVibGljIG9iamVjdCBEb21JbWFnZTtcblxuICAgICAgICBwcm90ZWN0ZWQgSW1hZ2UoVHlwZSB0eXBlLCBzdHJpbmcgZmlsZW5hbWUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5pbWFnZS5jdG9yXCIsIHRoaXMsIHR5cGUsIGZpbGVuYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBpbnQgV2lkdGhcbiAgICAgICAge1xuICAgICAgICAgICAgZ2V0XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFNjcmlwdC5DYWxsPGludD4oXCJicmlkZ2VVdGlsLmltYWdlLmdldFdpZHRoXCIsIHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGludCBIZWlnaHRcbiAgICAgICAge1xuICAgICAgICAgICAgZ2V0XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFNjcmlwdC5DYWxsPGludD4oXCJicmlkZ2VVdGlsLmltYWdlLmdldEhlaWdodFwiLCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiIsInVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcbntcbiAgICAvL2FkYXB0ZWQgZnJvbSBodHRwczovL3d3dy5jb2RlcHJvamVjdC5jb20vQXJ0aWNsZXMvMTA2MTMvJTJGQXJ0aWNsZXMlMkYxMDYxMyUyRkMtUklGRi1QYXJzZXJcbiAgICAvL21vZGlmaWVkIHRvIHVzZSBieXRlIGFycmF5IGluc3RlYWQgb2Ygc3RyZWFtIHNpbmNlIHRoaXMgd2lsbCBiZSBjb21waWxlZCB0byBKYXZhc2NyaXB0XG4gICAgcHVibGljIGNsYXNzIFJpZmZQYXJzZXJFeGNlcHRpb24gOiBFeGNlcHRpb25cbiAgICB7XG4gICAgICAgIHB1YmxpYyBSaWZmUGFyc2VyRXhjZXB0aW9uKHN0cmluZyBtZXNzYWdlKVxuICAgICAgICAgICAgOiBiYXNlKG1lc3NhZ2UpXG4gICAgICAgIHtcblxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGNsYXNzIFJpZmZGaWxlSW5mb1xuICAgIHtcbiAgICAgICAgcHVibGljIHN0cmluZyBIZWFkZXIgeyBnZXQ7IHNldDsgfVxuICAgICAgICBwdWJsaWMgc3RyaW5nIEZpbGVUeXBlIHsgZ2V0OyBzZXQ7IH1cbiAgICAgICAgcHVibGljIGludCBGaWxlU2l6ZSB7IGdldDsgc2V0OyB9XG4gICAgfVxuXG4gICAgcHVibGljIGNsYXNzIEJvdW5kZWRCeXRlQXJyYXlcbiAgICB7XG4gICAgICAgIHByaXZhdGUgaW50IG9mZnNldDtcbiAgICAgICAgcHJpdmF0ZSBpbnQgY291bnQ7XG4gICAgICAgIHByaXZhdGUgYnl0ZVtdIGRhdGE7XG4gICAgICAgIHB1YmxpYyBCb3VuZGVkQnl0ZUFycmF5KGludCBvZmZzZXQsIGludCBjb3VudCwgYnl0ZVtdIGRhdGEpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0ID0gb2Zmc2V0O1xuICAgICAgICAgICAgdGhpcy5jb3VudCA9IGNvdW50O1xuICAgICAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBieXRlW10gR2V0RGF0YSgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJ5dGVbXSBzbGljZSA9IG5ldyBieXRlW2NvdW50XTtcbiAgICAgICAgICAgIEFycmF5LkNvcHkoZGF0YSwgb2Zmc2V0LCBzbGljZSwgMCwgY291bnQpO1xuICAgICAgICAgICAgcmV0dXJuIHNsaWNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGRlbGVnYXRlIHZvaWQgUHJvY2Vzc0VsZW1lbnQoc3RyaW5nIHR5cGUsIGJvb2wgaXNMaXN0LCBCb3VuZGVkQnl0ZUFycmF5IGRhdGEpO1xuXG5cbiAgICBwdWJsaWMgY2xhc3MgUmlmZlBhcnNlclxuICAgIHtcbiAgICAgICAgcHJpdmF0ZSBjb25zdCBpbnQgV29yZFNpemUgPSA0O1xuICAgICAgICBwcml2YXRlIGNvbnN0IHN0cmluZyBSaWZmNENDID0gXCJSSUZGXCI7XG4gICAgICAgIHByaXZhdGUgY29uc3Qgc3RyaW5nIFJpZlg0Q0MgPSBcIlJJRlhcIjtcbiAgICAgICAgcHJpdmF0ZSBjb25zdCBzdHJpbmcgTGlzdDRDQyA9IFwiTElTVFwiO1xuXG4gICAgICAgIHByaXZhdGUgYnl0ZVtdIGRhdGE7XG4gICAgICAgIHByaXZhdGUgaW50IHBvc2l0aW9uO1xuXG4gICAgICAgIHB1YmxpYyBSaWZmRmlsZUluZm8gRmlsZUluZm8geyBnZXQ7IHByaXZhdGUgc2V0OyB9XG5cbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgUmlmZkZpbGVJbmZvIFJlYWRIZWFkZXIoYnl0ZVtdIGRhdGEpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmIChkYXRhLkxlbmd0aCA8IFdvcmRTaXplICogMylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUmlmZlBhcnNlckV4Y2VwdGlvbihcIlJlYWQgZmFpbGVkLiBGaWxlIHRvbyBzbWFsbD9cIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN0cmluZyBoZWFkZXI7XG4gICAgICAgICAgICBpZiAoIUlzUmlmZkZpbGUoZGF0YSwgb3V0IGhlYWRlcikpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFJpZmZQYXJzZXJFeGNlcHRpb24oXCJSZWFkIGZhaWxlZC4gTm8gUklGRiBoZWFkZXJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbmV3IFJpZmZGaWxlSW5mb1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIEhlYWRlciA9IGhlYWRlcixcbiAgICAgICAgICAgICAgICBGaWxlU2l6ZSA9IEJpdENvbnZlcnRlci5Ub0ludDMyKGRhdGEsIFdvcmRTaXplKSxcbiAgICAgICAgICAgICAgICBGaWxlVHlwZSA9IEVuY29kaW5nLkFTQ0lJLkdldFN0cmluZyhkYXRhLCBXb3JkU2l6ZSAqIDIsIFdvcmRTaXplKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIFJpZmZQYXJzZXIoKSB7IH1cblxuICAgICAgICBwdWJsaWMgc3RhdGljIFJpZmZQYXJzZXIgUGFyc2VCeXRlQXJyYXkoYnl0ZVtdIGRhdGEpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciByaWZmUGFyc2VyID0gbmV3IFJpZmZQYXJzZXIoKTtcbiAgICAgICAgICAgIHJpZmZQYXJzZXIuSW5pdChkYXRhKTtcbiAgICAgICAgICAgIHJldHVybiByaWZmUGFyc2VyO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgdm9pZCBJbml0KGJ5dGVbXSBkYXRhKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgICAgICAgICAgRmlsZUluZm8gPSBSZWFkSGVhZGVyKGRhdGEpO1xuICAgICAgICAgICAgcG9zaXRpb24gPSBXb3JkU2l6ZSAqIDM7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhdGljIGJvb2wgSXNSaWZmRmlsZShieXRlW10gZGF0YSwgb3V0IHN0cmluZyBoZWFkZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciB0ZXN0ID0gRW5jb2RpbmcuQVNDSUkuR2V0U3RyaW5nKGRhdGEsIDAsIFdvcmRTaXplKTtcbiAgICAgICAgICAgIGlmICh0ZXN0ID09IFJpZmY0Q0MgfHwgdGVzdCA9PSBSaWZYNENDKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGhlYWRlciA9IHRlc3Q7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBoZWFkZXIgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGJvb2wgUmVhZChQcm9jZXNzRWxlbWVudCBwcm9jZXNzRWxlbWVudClcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKGRhdGEuTGVuZ3RoIC0gcG9zaXRpb24gPCBXb3JkU2l6ZSAqIDIpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdHlwZSA9IEVuY29kaW5nLkFTQ0lJLkdldFN0cmluZyhkYXRhLCBwb3NpdGlvbiwgV29yZFNpemUpO1xuICAgICAgICAgICAgcG9zaXRpb24gKz0gV29yZFNpemU7XG4gICAgICAgICAgICB2YXIgc2l6ZSA9IEJpdENvbnZlcnRlci5Ub0ludDMyKGRhdGEsIHBvc2l0aW9uKTtcbiAgICAgICAgICAgIHBvc2l0aW9uICs9IFdvcmRTaXplO1xuXG4gICAgICAgICAgICBpZiAoZGF0YS5MZW5ndGggLSBwb3NpdGlvbiA8IHNpemUpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFJpZmZQYXJzZXJFeGNlcHRpb24oc3RyaW5nLkZvcm1hdChcIkVsZW1lbnQgc2l6ZSBtaXNtYXRjaCBmb3IgZWxlbWVudCB7MH0gXCIsdHlwZSkrXG5zdHJpbmcuRm9ybWF0KFwibmVlZCB7MH0gYnV0IGhhdmUgb25seSB7MX1cIixzaXplLEZpbGVJbmZvLkZpbGVTaXplIC0gcG9zaXRpb24pKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHR5cGUgPT0gTGlzdDRDQylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgbGlzdFR5cGUgPSBFbmNvZGluZy5BU0NJSS5HZXRTdHJpbmcoZGF0YSwgcG9zaXRpb24sIFdvcmRTaXplKTtcbiAgICAgICAgICAgICAgICBwcm9jZXNzRWxlbWVudChsaXN0VHlwZSwgdHJ1ZSwgbmV3IEJvdW5kZWRCeXRlQXJyYXkocG9zaXRpb24gKyBXb3JkU2l6ZSwgc2l6ZSwgZGF0YSkpO1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uICs9IHNpemU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIHBhZGRlZFNpemUgPSBzaXplO1xuICAgICAgICAgICAgICAgIGlmICgoc2l6ZSAmIDEpICE9IDApIHBhZGRlZFNpemUrKztcbiAgICAgICAgICAgICAgICBwcm9jZXNzRWxlbWVudCh0eXBlLCBmYWxzZSwgbmV3IEJvdW5kZWRCeXRlQXJyYXkocG9zaXRpb24sIHNpemUsIGRhdGEpKTtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbiArPSBwYWRkZWRTaXplO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJ1c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcbntcbiAgICBwdWJsaWMgY2xhc3MgQnJ1c2hcbiAgICB7XG4gICAgICAgIHB1YmxpYyBDb2xvciBDb2xvcjtcblxuICAgICAgICBwdWJsaWMgQnJ1c2goQ29sb3IgY29sb3IpXG4gICAgICAgIHtcbiAgICAgICAgICAgIENvbG9yID0gY29sb3I7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgdm9pZCBEaXNwb3NlKCkgeyB9XG4gICAgfVxufVxuIiwidXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXG57XG4gICAgcHVibGljIHN0YXRpYyBjbGFzcyBCcnVzaGVzXG4gICAge1xuICAgICAgICBwdWJsaWMgc3RhdGljIEJydXNoIEJsYWNrIHsgZ2V0IHsgcmV0dXJuIG5ldyBCcnVzaChDb2xvci5CbGFjayk7IH0gfVxuICAgICAgICBwdWJsaWMgc3RhdGljIEJydXNoIFdoaXRlIHsgZ2V0IHsgcmV0dXJuIG5ldyBCcnVzaChDb2xvci5XaGl0ZSk7IH0gfVxuICAgICAgICBwdWJsaWMgc3RhdGljIEJydXNoIExpZ2h0R3JheSB7IGdldCB7IHJldHVybiBuZXcgQnJ1c2goQ29sb3IuTGlnaHRHcmF5KTsgfSB9XG4gICAgfVxufVxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDA4IE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIEBjbGFzcyBDbGVmTWVhc3VyZXNcbiAqIFRoZSBDbGVmTWVhc3VyZXMgY2xhc3MgaXMgdXNlZCB0byByZXBvcnQgd2hhdCBDbGVmIChUcmVibGUgb3IgQmFzcykgYVxuICogZ2l2ZW4gbWVhc3VyZSB1c2VzLlxuICovXG5wdWJsaWMgY2xhc3MgQ2xlZk1lYXN1cmVzIHtcbiAgICBwcml2YXRlIExpc3Q8Q2xlZj4gY2xlZnM7ICAvKiogVGhlIGNsZWZzIHVzZWQgZm9yIGVhY2ggbWVhc3VyZSAoZm9yIGEgc2luZ2xlIHRyYWNrKSAqL1xuICAgIHByaXZhdGUgaW50IG1lYXN1cmU7ICAgICAgIC8qKiBUaGUgbGVuZ3RoIG9mIGEgbWVhc3VyZSwgaW4gcHVsc2VzICovXG5cbiBcbiAgICAvKiogR2l2ZW4gdGhlIG5vdGVzIGluIGEgdHJhY2ssIGNhbGN1bGF0ZSB0aGUgYXBwcm9wcmlhdGUgQ2xlZiB0byB1c2VcbiAgICAgKiBmb3IgZWFjaCBtZWFzdXJlLiAgU3RvcmUgdGhlIHJlc3VsdCBpbiB0aGUgY2xlZnMgbGlzdC5cbiAgICAgKiBAcGFyYW0gbm90ZXMgIFRoZSBtaWRpIG5vdGVzXG4gICAgICogQHBhcmFtIG1lYXN1cmVsZW4gVGhlIGxlbmd0aCBvZiBhIG1lYXN1cmUsIGluIHB1bHNlc1xuICAgICAqL1xuICAgIHB1YmxpYyBDbGVmTWVhc3VyZXMoTGlzdDxNaWRpTm90ZT4gbm90ZXMsIGludCBtZWFzdXJlbGVuKSB7XG4gICAgICAgIG1lYXN1cmUgPSBtZWFzdXJlbGVuO1xuICAgICAgICBDbGVmIG1haW5jbGVmID0gTWFpbkNsZWYobm90ZXMpO1xuICAgICAgICBpbnQgbmV4dG1lYXN1cmUgPSBtZWFzdXJlbGVuO1xuICAgICAgICBpbnQgcG9zID0gMDtcbiAgICAgICAgQ2xlZiBjbGVmID0gbWFpbmNsZWY7XG5cbiAgICAgICAgY2xlZnMgPSBuZXcgTGlzdDxDbGVmPigpO1xuXG4gICAgICAgIHdoaWxlIChwb3MgPCBub3Rlcy5Db3VudCkge1xuICAgICAgICAgICAgLyogU3VtIGFsbCB0aGUgbm90ZXMgaW4gdGhlIGN1cnJlbnQgbWVhc3VyZSAqL1xuICAgICAgICAgICAgaW50IHN1bW5vdGVzID0gMDtcbiAgICAgICAgICAgIGludCBub3RlY291bnQgPSAwO1xuICAgICAgICAgICAgd2hpbGUgKHBvcyA8IG5vdGVzLkNvdW50ICYmIG5vdGVzW3Bvc10uU3RhcnRUaW1lIDwgbmV4dG1lYXN1cmUpIHtcbiAgICAgICAgICAgICAgICBzdW1ub3RlcyArPSBub3Rlc1twb3NdLk51bWJlcjtcbiAgICAgICAgICAgICAgICBub3RlY291bnQrKztcbiAgICAgICAgICAgICAgICBwb3MrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChub3RlY291bnQgPT0gMClcbiAgICAgICAgICAgICAgICBub3RlY291bnQgPSAxO1xuXG4gICAgICAgICAgICAvKiBDYWxjdWxhdGUgdGhlIFwiYXZlcmFnZVwiIG5vdGUgaW4gdGhlIG1lYXN1cmUgKi9cbiAgICAgICAgICAgIGludCBhdmdub3RlID0gc3Vtbm90ZXMgLyBub3RlY291bnQ7XG4gICAgICAgICAgICBpZiAoYXZnbm90ZSA9PSAwKSB7XG4gICAgICAgICAgICAgICAgLyogVGhpcyBtZWFzdXJlIGRvZXNuJ3QgY29udGFpbiBhbnkgbm90ZXMuXG4gICAgICAgICAgICAgICAgICogS2VlcCB0aGUgcHJldmlvdXMgY2xlZi5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGF2Z25vdGUgPj0gV2hpdGVOb3RlLkJvdHRvbVRyZWJsZS5OdW1iZXIoKSkge1xuICAgICAgICAgICAgICAgIGNsZWYgPSBDbGVmLlRyZWJsZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGF2Z25vdGUgPD0gV2hpdGVOb3RlLlRvcEJhc3MuTnVtYmVyKCkpIHtcbiAgICAgICAgICAgICAgICBjbGVmID0gQ2xlZi5CYXNzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLyogVGhlIGF2ZXJhZ2Ugbm90ZSBpcyBiZXR3ZWVuIEczIGFuZCBGNC4gV2UgY2FuIHVzZSBlaXRoZXJcbiAgICAgICAgICAgICAgICAgKiB0aGUgdHJlYmxlIG9yIGJhc3MgY2xlZi4gIFVzZSB0aGUgXCJtYWluXCIgY2xlZiwgdGhlIGNsZWZcbiAgICAgICAgICAgICAgICAgKiB0aGF0IGFwcGVhcnMgbW9zdCBmb3IgdGhpcyB0cmFjay5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBjbGVmID0gbWFpbmNsZWY7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNsZWZzLkFkZChjbGVmKTtcbiAgICAgICAgICAgIG5leHRtZWFzdXJlICs9IG1lYXN1cmVsZW47XG4gICAgICAgIH1cbiAgICAgICAgY2xlZnMuQWRkKGNsZWYpO1xuICAgIH1cblxuICAgIC8qKiBHaXZlbiBhIHRpbWUgKGluIHB1bHNlcyksIHJldHVybiB0aGUgY2xlZiB1c2VkIGZvciB0aGF0IG1lYXN1cmUuICovXG4gICAgcHVibGljIENsZWYgR2V0Q2xlZihpbnQgc3RhcnR0aW1lKSB7XG5cbiAgICAgICAgLyogSWYgdGhlIHRpbWUgZXhjZWVkcyB0aGUgbGFzdCBtZWFzdXJlLCByZXR1cm4gdGhlIGxhc3QgbWVhc3VyZSAqL1xuICAgICAgICBpZiAoc3RhcnR0aW1lIC8gbWVhc3VyZSA+PSBjbGVmcy5Db3VudCkge1xuICAgICAgICAgICAgcmV0dXJuIGNsZWZzWyBjbGVmcy5Db3VudC0xIF07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gY2xlZnNbIHN0YXJ0dGltZSAvIG1lYXN1cmUgXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBDYWxjdWxhdGUgdGhlIGJlc3QgY2xlZiB0byB1c2UgZm9yIHRoZSBnaXZlbiBub3Rlcy4gIElmIHRoZVxuICAgICAqIGF2ZXJhZ2Ugbm90ZSBpcyBiZWxvdyBNaWRkbGUgQywgdXNlIGEgYmFzcyBjbGVmLiAgRWxzZSwgdXNlIGEgdHJlYmxlXG4gICAgICogY2xlZi5cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBDbGVmIE1haW5DbGVmKExpc3Q8TWlkaU5vdGU+IG5vdGVzKSB7XG4gICAgICAgIGludCBtaWRkbGVDID0gV2hpdGVOb3RlLk1pZGRsZUMuTnVtYmVyKCk7XG4gICAgICAgIGludCB0b3RhbCA9IDA7XG4gICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG0gaW4gbm90ZXMpIHtcbiAgICAgICAgICAgIHRvdGFsICs9IG0uTnVtYmVyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub3Rlcy5Db3VudCA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gQ2xlZi5UcmVibGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodG90YWwvbm90ZXMuQ291bnQgPj0gbWlkZGxlQykge1xuICAgICAgICAgICAgcmV0dXJuIENsZWYuVHJlYmxlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIENsZWYuQmFzcztcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG59XG5cbiIsInVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xue1xuICAgIHB1YmxpYyBjbGFzcyBDb2xvclxuICAgIHtcbiAgICAgICAgcHVibGljIGludCBSZWQ7XG4gICAgICAgIHB1YmxpYyBpbnQgR3JlZW47XG4gICAgICAgIHB1YmxpYyBpbnQgQmx1ZTtcbiAgICAgICAgcHVibGljIGludCBBbHBoYTtcblxuICAgICAgICBwdWJsaWMgQ29sb3IoKVxuICAgICAgICB7XG4gICAgICAgICAgICBBbHBoYSA9IDI1NTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQ29sb3IgRnJvbVJnYihpbnQgcmVkLCBpbnQgZ3JlZW4sIGludCBibHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gRnJvbUFyZ2IoMjU1LCByZWQsIGdyZWVuLCBibHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQ29sb3IgRnJvbUFyZ2IoaW50IGFscGhhLCBpbnQgcmVkLCBpbnQgZ3JlZW4sIGludCBibHVlKVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IENvbG9yXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgQWxwaGEgPSBhbHBoYSxcbiAgICAgICAgICAgICAgICBSZWQgPSByZWQsXG4gICAgICAgICAgICAgICAgR3JlZW4gPSBncmVlbixcbiAgICAgICAgICAgICAgICBCbHVlID0gYmx1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQ29sb3IgQmxhY2sgeyBnZXQgeyByZXR1cm4gbmV3IENvbG9yKCk7IH0gfVxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQ29sb3IgV2hpdGUgeyBnZXQgeyByZXR1cm4gRnJvbVJnYigyNTUsMjU1LDI1NSk7IH0gfVxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQ29sb3IgTGlnaHRHcmF5IHsgZ2V0IHsgcmV0dXJuIEZyb21SZ2IoMHhkMywweGQzLDB4ZDMpOyB9IH1cblxuICAgICAgICBwdWJsaWMgaW50IFIgeyBnZXQgeyByZXR1cm4gUmVkOyB9IH1cbiAgICAgICAgcHVibGljIGludCBHIHsgZ2V0IHsgcmV0dXJuIEdyZWVuOyB9IH1cbiAgICAgICAgcHVibGljIGludCBCIHsgZ2V0IHsgcmV0dXJuIEJsdWU7IH0gfVxuXG4gICAgICAgIHB1YmxpYyBib29sIEVxdWFscyhDb2xvciBjb2xvcilcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIFJlZCA9PSBjb2xvci5SZWQgJiYgR3JlZW4gPT0gY29sb3IuR3JlZW4gJiYgQmx1ZSA9PSBjb2xvci5CbHVlICYmIEFscGhhPT1jb2xvci5BbHBoYTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsInVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xue1xuICAgIHB1YmxpYyBjbGFzcyBDb250cm9sXG4gICAge1xuICAgICAgICBwdWJsaWMgaW50IFdpZHRoO1xuICAgICAgICBwdWJsaWMgaW50IEhlaWdodDtcblxuICAgICAgICBwdWJsaWMgdm9pZCBJbnZhbGlkYXRlKCkgeyB9XG5cbiAgICAgICAgcHVibGljIEdyYXBoaWNzIENyZWF0ZUdyYXBoaWNzKHN0cmluZyBuYW1lKSB7IHJldHVybiBuZXcgR3JhcGhpY3MobmFtZSk7IH1cblxuICAgICAgICBwdWJsaWMgUGFuZWwgUGFyZW50IHsgZ2V0IHsgcmV0dXJuIG5ldyBQYW5lbCgpOyB9IH1cblxuICAgICAgICBwdWJsaWMgQ29sb3IgQmFja0NvbG9yO1xuICAgIH1cbn1cbiIsInVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xue1xuICAgIHB1YmxpYyBjbGFzcyBTdHJlYW1cbiAgICB7XG4gICAgICAgIHB1YmxpYyB2b2lkIFdyaXRlKGJ5dGVbXSBidWZmZXIsIGludCBvZmZzZXQsIGludCBjb3VudCkgeyB9XG5cbiAgICAgICAgcHVibGljIHZvaWQgQ2xvc2UoKSB7IH1cbiAgICB9XG59XG4iLCJ1c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcbntcbiAgICBwdWJsaWMgY2xhc3MgRm9udFxuICAgIHtcbiAgICAgICAgcHVibGljIHN0cmluZyBOYW1lO1xuICAgICAgICBwdWJsaWMgaW50IFNpemU7XG4gICAgICAgIHB1YmxpYyBGb250U3R5bGUgU3R5bGU7XG5cbiAgICAgICAgcHVibGljIEZvbnQoc3RyaW5nIG5hbWUsIGludCBzaXplLCBGb250U3R5bGUgc3R5bGUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIE5hbWUgPSBuYW1lO1xuICAgICAgICAgICAgU2l6ZSA9IHNpemU7XG4gICAgICAgICAgICBTdHlsZSA9IHN0eWxlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGZsb2F0IEdldEhlaWdodCgpIHsgcmV0dXJuIDA7IH1cblxuICAgICAgICBwdWJsaWMgdm9pZCBEaXNwb3NlKCkgeyB9XG4gICAgfVxufVxuIiwidXNpbmcgQnJpZGdlO1xudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXG57XG4gICAgcHVibGljIGNsYXNzIEdyYXBoaWNzXG4gICAge1xuICAgICAgICBwdWJsaWMgR3JhcGhpY3Moc3RyaW5nIG5hbWUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIE5hbWUgPSBuYW1lO1xuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLmluaXRHcmFwaGljc1wiLCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdHJpbmcgTmFtZTtcblxuICAgICAgICBwdWJsaWMgb2JqZWN0IENvbnRleHQ7XG5cbiAgICAgICAgcHVibGljIHZvaWQgVHJhbnNsYXRlVHJhbnNmb3JtKGludCB4LCBpbnQgeSkge1xuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLnRyYW5zbGF0ZVRyYW5zZm9ybVwiLCB0aGlzLCB4LCB5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyB2b2lkIERyYXdJbWFnZShJbWFnZSBpbWFnZSwgaW50IHgsIGludCB5LCBpbnQgd2lkdGgsIGludCBoZWlnaHQpIHtcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy5kcmF3SW1hZ2VcIiwgdGhpcywgaW1hZ2UsIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHZvaWQgRHJhd1N0cmluZyhzdHJpbmcgdGV4dCwgRm9udCBmb250LCBCcnVzaCBicnVzaCwgaW50IHgsIGludCB5KSB7XG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3MuZHJhd1N0cmluZ1wiLCB0aGlzLCB0ZXh0LCBmb250LCBicnVzaCwgeCwgeSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgdm9pZCBEcmF3TGluZShQZW4gcGVuLCBpbnQgeFN0YXJ0LCBpbnQgeVN0YXJ0LCBpbnQgeEVuZCwgaW50IHlFbmQpIHtcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy5kcmF3TGluZVwiLCB0aGlzLCBwZW4sIHhTdGFydCwgeVN0YXJ0LCB4RW5kLCB5RW5kKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyB2b2lkIERyYXdCZXppZXIoUGVuIHBlbiwgaW50IHgxLCBpbnQgeTEsIGludCB4MiwgaW50IHkyLCBpbnQgeDMsIGludCB5MywgaW50IHg0LCBpbnQgeTQpIHtcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy5kcmF3QmV6aWVyXCIsIHRoaXMsIHBlbiwgeDEsIHkxLCB4MiwgeTIsIHgzLCB5MywgeDQsIHk0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyB2b2lkIFNjYWxlVHJhbnNmb3JtKGZsb2F0IHgsIGZsb2F0IHkpIHtcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy5zY2FsZVRyYW5zZm9ybVwiLCB0aGlzLCB4LCB5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyB2b2lkIEZpbGxSZWN0YW5nbGUoQnJ1c2ggYnJ1c2gsIGludCB4LCBpbnQgeSwgaW50IHdpZHRoLCBpbnQgaGVpZ2h0KSB7XG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3MuZmlsbFJlY3RhbmdsZVwiLCB0aGlzLCBicnVzaCwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgdm9pZCBDbGVhclJlY3RhbmdsZShpbnQgeCwgaW50IHksIGludCB3aWR0aCwgaW50IGhlaWdodCkge1xuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLmNsZWFyUmVjdGFuZ2xlXCIsIHRoaXMsIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHZvaWQgRmlsbEVsbGlwc2UoQnJ1c2ggYnJ1c2gsIGludCB4LCBpbnQgeSwgaW50IHdpZHRoLCBpbnQgaGVpZ2h0KSB7XG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3MuZmlsbEVsbGlwc2VcIiwgdGhpcywgYnJ1c2gsIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHZvaWQgRHJhd0VsbGlwc2UoUGVuIHBlbiwgaW50IHgsIGludCB5LCBpbnQgd2lkdGgsIGludCBoZWlnaHQpIHtcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy5kcmF3RWxsaXBzZVwiLCB0aGlzLCBwZW4sIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHZvaWQgUm90YXRlVHJhbnNmb3JtKGZsb2F0IGFuZ2xlRGVnKSB7XG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3Mucm90YXRlVHJhbnNmb3JtXCIsIHRoaXMsIGFuZ2xlRGVnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBTbW9vdGhpbmdNb2RlIFNtb290aGluZ01vZGUgeyBnZXQ7IHNldDsgfVxuXG4gICAgICAgIHB1YmxpYyBSZWN0YW5nbGUgVmlzaWJsZUNsaXBCb3VuZHMgeyBnZXQ7IHNldDsgfVxuXG4gICAgICAgIHB1YmxpYyBmbG9hdCBQYWdlU2NhbGUgeyBnZXQ7IHNldDsgfVxuXG4gICAgICAgIHB1YmxpYyB2b2lkIERpc3Bvc2UoKSB7IH1cbiAgICB9XG59XG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTMgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cblxuLyoqIEBjbGFzcyBLZXlTaWduYXR1cmVcbiAqIFRoZSBLZXlTaWduYXR1cmUgY2xhc3MgcmVwcmVzZW50cyBhIGtleSBzaWduYXR1cmUsIGxpa2UgRyBNYWpvclxuICogb3IgQi1mbGF0IE1ham9yLiAgRm9yIHNoZWV0IG11c2ljLCB3ZSBvbmx5IGNhcmUgYWJvdXQgdGhlIG51bWJlclxuICogb2Ygc2hhcnBzIG9yIGZsYXRzIGluIHRoZSBrZXkgc2lnbmF0dXJlLCBub3Qgd2hldGhlciBpdCBpcyBtYWpvclxuICogb3IgbWlub3IuXG4gKlxuICogVGhlIG1haW4gb3BlcmF0aW9ucyBvZiB0aGlzIGNsYXNzIGFyZTpcbiAqIC0gR3Vlc3NpbmcgdGhlIGtleSBzaWduYXR1cmUsIGdpdmVuIHRoZSBub3RlcyBpbiBhIHNvbmcuXG4gKiAtIEdlbmVyYXRpbmcgdGhlIGFjY2lkZW50YWwgc3ltYm9scyBmb3IgdGhlIGtleSBzaWduYXR1cmUuXG4gKiAtIERldGVybWluaW5nIHdoZXRoZXIgYSBwYXJ0aWN1bGFyIG5vdGUgcmVxdWlyZXMgYW4gYWNjaWRlbnRhbFxuICogICBvciBub3QuXG4gKlxuICovXG5cbnB1YmxpYyBjbGFzcyBLZXlTaWduYXR1cmUge1xuICAgIC8qKiBUaGUgbnVtYmVyIG9mIHNoYXJwcyBpbiBlYWNoIGtleSBzaWduYXR1cmUgKi9cbiAgICBwdWJsaWMgY29uc3QgaW50IEMgPSAwO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRyA9IDE7XG4gICAgcHVibGljIGNvbnN0IGludCBEID0gMjtcbiAgICBwdWJsaWMgY29uc3QgaW50IEEgPSAzO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRSA9IDQ7XG4gICAgcHVibGljIGNvbnN0IGludCBCID0gNTtcblxuICAgIC8qKiBUaGUgbnVtYmVyIG9mIGZsYXRzIGluIGVhY2gga2V5IHNpZ25hdHVyZSAqL1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRiA9IDE7XG4gICAgcHVibGljIGNvbnN0IGludCBCZmxhdCA9IDI7XG4gICAgcHVibGljIGNvbnN0IGludCBFZmxhdCA9IDM7XG4gICAgcHVibGljIGNvbnN0IGludCBBZmxhdCA9IDQ7XG4gICAgcHVibGljIGNvbnN0IGludCBEZmxhdCA9IDU7XG4gICAgcHVibGljIGNvbnN0IGludCBHZmxhdCA9IDY7XG5cbiAgICAvKiogVGhlIHR3byBhcnJheXMgYmVsb3cgYXJlIGtleSBtYXBzLiAgVGhleSB0YWtlIGEgbWFqb3Iga2V5XG4gICAgICogKGxpa2UgRyBtYWpvciwgQi1mbGF0IG1ham9yKSBhbmQgYSBub3RlIGluIHRoZSBzY2FsZSwgYW5kXG4gICAgICogcmV0dXJuIHRoZSBBY2NpZGVudGFsIHJlcXVpcmVkIHRvIGRpc3BsYXkgdGhhdCBub3RlIGluIHRoZVxuICAgICAqIGdpdmVuIGtleS4gIEluIGEgbnV0c2hlbCwgdGhlIG1hcCBpc1xuICAgICAqXG4gICAgICogICBtYXBbS2V5XVtOb3RlU2NhbGVdIC0+IEFjY2lkZW50YWxcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBBY2NpZFtdW10gc2hhcnBrZXlzO1xuICAgIHByaXZhdGUgc3RhdGljIEFjY2lkW11bXSBmbGF0a2V5cztcblxuICAgIHByaXZhdGUgaW50IG51bV9mbGF0czsgICAvKiogVGhlIG51bWJlciBvZiBzaGFycHMgaW4gdGhlIGtleSwgMCB0aHJ1IDYgKi9cbiAgICBwcml2YXRlIGludCBudW1fc2hhcnBzOyAgLyoqIFRoZSBudW1iZXIgb2YgZmxhdHMgaW4gdGhlIGtleSwgMCB0aHJ1IDYgKi9cblxuICAgIC8qKiBUaGUgYWNjaWRlbnRhbCBzeW1ib2xzIHRoYXQgZGVub3RlIHRoaXMga2V5LCBpbiBhIHRyZWJsZSBjbGVmICovXG4gICAgcHJpdmF0ZSBBY2NpZFN5bWJvbFtdIHRyZWJsZTtcblxuICAgIC8qKiBUaGUgYWNjaWRlbnRhbCBzeW1ib2xzIHRoYXQgZGVub3RlIHRoaXMga2V5LCBpbiBhIGJhc3MgY2xlZiAqL1xuICAgIHByaXZhdGUgQWNjaWRTeW1ib2xbXSBiYXNzO1xuXG4gICAgLyoqIFRoZSBrZXkgbWFwIGZvciB0aGlzIGtleSBzaWduYXR1cmU6XG4gICAgICogICBrZXltYXBbbm90ZW51bWJlcl0gLT4gQWNjaWRlbnRhbFxuICAgICAqL1xuICAgIHByaXZhdGUgQWNjaWRbXSBrZXltYXA7XG5cbiAgICAvKiogVGhlIG1lYXN1cmUgdXNlZCBpbiB0aGUgcHJldmlvdXMgY2FsbCB0byBHZXRBY2NpZGVudGFsKCkgKi9cbiAgICBwcml2YXRlIGludCBwcmV2bWVhc3VyZTsgXG5cblxuICAgIC8qKiBDcmVhdGUgbmV3IGtleSBzaWduYXR1cmUsIHdpdGggdGhlIGdpdmVuIG51bWJlciBvZlxuICAgICAqIHNoYXJwcyBhbmQgZmxhdHMuICBPbmUgb2YgdGhlIHR3byBtdXN0IGJlIDAsIHlvdSBjYW4ndFxuICAgICAqIGhhdmUgYm90aCBzaGFycHMgYW5kIGZsYXRzIGluIHRoZSBrZXkgc2lnbmF0dXJlLlxuICAgICAqL1xuICAgIHB1YmxpYyBLZXlTaWduYXR1cmUoaW50IG51bV9zaGFycHMsIGludCBudW1fZmxhdHMpIHtcbiAgICAgICAgaWYgKCEobnVtX3NoYXJwcyA9PSAwIHx8IG51bV9mbGF0cyA9PSAwKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFN5c3RlbS5Bcmd1bWVudEV4Y2VwdGlvbihcIkJhZCBLZXlTaWdhdHVyZSBhcmdzXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubnVtX3NoYXJwcyA9IG51bV9zaGFycHM7XG4gICAgICAgIHRoaXMubnVtX2ZsYXRzID0gbnVtX2ZsYXRzO1xuXG4gICAgICAgIENyZWF0ZUFjY2lkZW50YWxNYXBzKCk7XG4gICAgICAgIGtleW1hcCA9IG5ldyBBY2NpZFsxNjBdO1xuICAgICAgICBSZXNldEtleU1hcCgpO1xuICAgICAgICBDcmVhdGVTeW1ib2xzKCk7XG4gICAgfVxuXG4gICAgLyoqIENyZWF0ZSBuZXcga2V5IHNpZ25hdHVyZSwgd2l0aCB0aGUgZ2l2ZW4gbm90ZXNjYWxlLiAgKi9cbiAgICBwdWJsaWMgS2V5U2lnbmF0dXJlKGludCBub3Rlc2NhbGUpIHtcbiAgICAgICAgbnVtX3NoYXJwcyA9IG51bV9mbGF0cyA9IDA7XG4gICAgICAgIHN3aXRjaCAobm90ZXNjYWxlKSB7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5BOiAgICAgbnVtX3NoYXJwcyA9IDM7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQmZsYXQ6IG51bV9mbGF0cyA9IDI7ICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkI6ICAgICBudW1fc2hhcnBzID0gNTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5DOiAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5EZmxhdDogbnVtX2ZsYXRzID0gNTsgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRDogICAgIG51bV9zaGFycHMgPSAyOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkVmbGF0OiBudW1fZmxhdHMgPSAzOyAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5FOiAgICAgbnVtX3NoYXJwcyA9IDQ7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRjogICAgIG51bV9mbGF0cyA9IDE7ICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkdmbGF0OiBudW1fZmxhdHMgPSA2OyAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5HOiAgICAgbnVtX3NoYXJwcyA9IDE7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQWZsYXQ6IG51bV9mbGF0cyA9IDQ7ICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6ICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIENyZWF0ZUFjY2lkZW50YWxNYXBzKCk7XG4gICAgICAgIGtleW1hcCA9IG5ldyBBY2NpZFsxNjBdO1xuICAgICAgICBSZXNldEtleU1hcCgpO1xuICAgICAgICBDcmVhdGVTeW1ib2xzKCk7XG4gICAgfVxuXG5cbiAgICAvKiogSW5paXRhbGl6ZSB0aGUgc2hhcnBrZXlzIGFuZCBmbGF0a2V5cyBtYXBzICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBDcmVhdGVBY2NpZGVudGFsTWFwcygpIHtcbiAgICAgICAgaWYgKHNoYXJwa2V5cyAhPSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuOyBcblxuICAgICAgICBBY2NpZFtdIG1hcDtcbiAgICAgICAgc2hhcnBrZXlzID0gbmV3IEFjY2lkWzhdW107XG4gICAgICAgIGZsYXRrZXlzID0gbmV3IEFjY2lkWzhdW107XG5cbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgICAgICAgIHNoYXJwa2V5c1tpXSA9IG5ldyBBY2NpZFsxMl07XG4gICAgICAgICAgICBmbGF0a2V5c1tpXSA9IG5ldyBBY2NpZFsxMl07XG4gICAgICAgIH1cblxuICAgICAgICBtYXAgPSBzaGFycGtleXNbQ107XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQXNoYXJwIF0gPSBBY2NpZC5GbGF0O1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQ3NoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRCBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Ec2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRnNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Hc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuXG4gICAgICAgIG1hcCA9IHNoYXJwa2V5c1tHXTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Bc2hhcnAgXSA9IEFjY2lkLkZsYXQ7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Dc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Gc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuR3NoYXJwIF0gPSBBY2NpZC5TaGFycDtcblxuICAgICAgICBtYXAgPSBzaGFycGtleXNbRF07XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQXNoYXJwIF0gPSBBY2NpZC5GbGF0O1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQ3NoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Gc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuR3NoYXJwIF0gPSBBY2NpZC5TaGFycDtcblxuICAgICAgICBtYXAgPSBzaGFycGtleXNbQV07XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQXNoYXJwIF0gPSBBY2NpZC5GbGF0O1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQ3NoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Gc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuR3NoYXJwIF0gPSBBY2NpZC5Ob25lO1xuXG4gICAgICAgIG1hcCA9IHNoYXJwa2V5c1tFXTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Bc2hhcnAgXSA9IEFjY2lkLkZsYXQ7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Dc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRHNoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRnNoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkdzaGFycCBdID0gQWNjaWQuTm9uZTtcblxuICAgICAgICBtYXAgPSBzaGFycGtleXNbQl07XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQXNoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQ3NoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRzaGFycCBdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Hc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG5cbiAgICAgICAgLyogRmxhdCBrZXlzICovXG4gICAgICAgIG1hcCA9IGZsYXRrZXlzW0NdO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkFzaGFycCBdID0gQWNjaWQuRmxhdDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkNzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRHNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuR3NoYXJwIF0gPSBBY2NpZC5TaGFycDtcblxuICAgICAgICBtYXAgPSBmbGF0a2V5c1tGXTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Dc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkVmbGF0IF0gID0gQWNjaWQuRmxhdDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQWZsYXQgXSAgPSBBY2NpZC5GbGF0O1xuXG4gICAgICAgIG1hcCA9IGZsYXRrZXlzW0JmbGF0XTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Dc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkVmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQWZsYXQgXSAgPSBBY2NpZC5GbGF0O1xuXG4gICAgICAgIG1hcCA9IGZsYXRrZXlzW0VmbGF0XTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EZmxhdCBdICA9IEFjY2lkLkZsYXQ7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRWZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRnNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BZmxhdCBdICA9IEFjY2lkLk5vbmU7XG5cbiAgICAgICAgbWFwID0gZmxhdGtleXNbQWZsYXRdO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkJmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRCBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Gc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkFmbGF0IF0gID0gQWNjaWQuTm9uZTtcblxuICAgICAgICBtYXAgPSBmbGF0a2V5c1tEZmxhdF07XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQmZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRGZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkVmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkdmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BZmxhdCBdICA9IEFjY2lkLk5vbmU7XG5cbiAgICAgICAgbWFwID0gZmxhdGtleXNbR2ZsYXRdO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkJmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRCBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQWZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuXG5cbiAgICB9XG5cbiAgICAvKiogVGhlIGtleW1hcCB0ZWxscyB3aGF0IGFjY2lkZW50YWwgc3ltYm9sIGlzIG5lZWRlZCBmb3IgZWFjaFxuICAgICAqICBub3RlIGluIHRoZSBzY2FsZS4gIFJlc2V0IHRoZSBrZXltYXAgdG8gdGhlIHZhbHVlcyBvZiB0aGVcbiAgICAgKiAga2V5IHNpZ25hdHVyZS5cbiAgICAgKi9cbiAgICBwcml2YXRlIHZvaWQgUmVzZXRLZXlNYXAoKVxuICAgIHtcbiAgICAgICAgQWNjaWRbXSBrZXk7XG4gICAgICAgIGlmIChudW1fZmxhdHMgPiAwKVxuICAgICAgICAgICAga2V5ID0gZmxhdGtleXNbbnVtX2ZsYXRzXTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAga2V5ID0gc2hhcnBrZXlzW251bV9zaGFycHNdO1xuXG4gICAgICAgIGZvciAoaW50IG5vdGVudW1iZXIgPSAwOyBub3RlbnVtYmVyIDwga2V5bWFwLkxlbmd0aDsgbm90ZW51bWJlcisrKSB7XG4gICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlcl0gPSBrZXlbTm90ZVNjYWxlLkZyb21OdW1iZXIobm90ZW51bWJlcildO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKiogQ3JlYXRlIHRoZSBBY2NpZGVudGFsIHN5bWJvbHMgZm9yIHRoaXMga2V5LCBmb3JcbiAgICAgKiB0aGUgdHJlYmxlIGFuZCBiYXNzIGNsZWZzLlxuICAgICAqL1xuICAgIHByaXZhdGUgdm9pZCBDcmVhdGVTeW1ib2xzKCkge1xuICAgICAgICBpbnQgY291bnQgPSBNYXRoLk1heChudW1fc2hhcnBzLCBudW1fZmxhdHMpO1xuICAgICAgICB0cmVibGUgPSBuZXcgQWNjaWRTeW1ib2xbY291bnRdO1xuICAgICAgICBiYXNzID0gbmV3IEFjY2lkU3ltYm9sW2NvdW50XTtcblxuICAgICAgICBpZiAoY291bnQgPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgV2hpdGVOb3RlW10gdHJlYmxlbm90ZXMgPSBudWxsO1xuICAgICAgICBXaGl0ZU5vdGVbXSBiYXNzbm90ZXMgPSBudWxsO1xuXG4gICAgICAgIGlmIChudW1fc2hhcnBzID4gMCkgIHtcbiAgICAgICAgICAgIHRyZWJsZW5vdGVzID0gbmV3IFdoaXRlTm90ZVtdIHtcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5GLCA1KSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5DLCA1KSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5HLCA1KSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5ELCA1KSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5BLCA2KSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5FLCA1KVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGJhc3Nub3RlcyA9IG5ldyBXaGl0ZU5vdGVbXSB7XG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRiwgMyksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQywgMyksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRywgMyksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRCwgMyksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQSwgNCksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRSwgMylcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobnVtX2ZsYXRzID4gMCkge1xuICAgICAgICAgICAgdHJlYmxlbm90ZXMgPSBuZXcgV2hpdGVOb3RlW10ge1xuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkIsIDUpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkUsIDUpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkEsIDUpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkQsIDUpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkcsIDQpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkMsIDUpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgYmFzc25vdGVzID0gbmV3IFdoaXRlTm90ZVtdIHtcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5CLCAzKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5FLCAzKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5BLCAzKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5ELCAzKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5HLCAyKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5DLCAzKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIEFjY2lkIGEgPSBBY2NpZC5Ob25lO1xuICAgICAgICBpZiAobnVtX3NoYXJwcyA+IDApXG4gICAgICAgICAgICBhID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGEgPSBBY2NpZC5GbGF0O1xuXG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgdHJlYmxlW2ldID0gbmV3IEFjY2lkU3ltYm9sKGEsIHRyZWJsZW5vdGVzW2ldLCBDbGVmLlRyZWJsZSk7XG4gICAgICAgICAgICBiYXNzW2ldID0gbmV3IEFjY2lkU3ltYm9sKGEsIGJhc3Nub3Rlc1tpXSwgQ2xlZi5CYXNzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIEFjY2lkZW50YWwgc3ltYm9scyBmb3IgZGlzcGxheWluZyB0aGlzIGtleSBzaWduYXR1cmVcbiAgICAgKiBmb3IgdGhlIGdpdmVuIGNsZWYuXG4gICAgICovXG4gICAgcHVibGljIEFjY2lkU3ltYm9sW10gR2V0U3ltYm9scyhDbGVmIGNsZWYpIHtcbiAgICAgICAgaWYgKGNsZWYgPT0gQ2xlZi5UcmVibGUpXG4gICAgICAgICAgICByZXR1cm4gdHJlYmxlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gYmFzcztcbiAgICB9XG5cbiAgICAvKiogR2l2ZW4gYSBtaWRpIG5vdGUgbnVtYmVyLCByZXR1cm4gdGhlIGFjY2lkZW50YWwgKGlmIGFueSkgXG4gICAgICogdGhhdCBzaG91bGQgYmUgdXNlZCB3aGVuIGRpc3BsYXlpbmcgdGhlIG5vdGUgaW4gdGhpcyBrZXkgc2lnbmF0dXJlLlxuICAgICAqXG4gICAgICogVGhlIGN1cnJlbnQgbWVhc3VyZSBpcyBhbHNvIHJlcXVpcmVkLiAgT25jZSB3ZSByZXR1cm4gYW5cbiAgICAgKiBhY2NpZGVudGFsIGZvciBhIG1lYXN1cmUsIHRoZSBhY2NpZGVudGFsIHJlbWFpbnMgZm9yIHRoZVxuICAgICAqIHJlc3Qgb2YgdGhlIG1lYXN1cmUuIFNvIHdlIG11c3QgdXBkYXRlIHRoZSBjdXJyZW50IGtleW1hcFxuICAgICAqIHdpdGggYW55IG5ldyBhY2NpZGVudGFscyB0aGF0IHdlIHJldHVybi4gIFdoZW4gd2UgbW92ZSB0byBhbm90aGVyXG4gICAgICogbWVhc3VyZSwgd2UgcmVzZXQgdGhlIGtleW1hcCBiYWNrIHRvIHRoZSBrZXkgc2lnbmF0dXJlLlxuICAgICAqL1xuICAgIHB1YmxpYyBBY2NpZCBHZXRBY2NpZGVudGFsKGludCBub3RlbnVtYmVyLCBpbnQgbWVhc3VyZSkge1xuICAgICAgICBpZiAobWVhc3VyZSAhPSBwcmV2bWVhc3VyZSkge1xuICAgICAgICAgICAgUmVzZXRLZXlNYXAoKTtcbiAgICAgICAgICAgIHByZXZtZWFzdXJlID0gbWVhc3VyZTtcbiAgICAgICAgfVxuXG4gICAgICAgIEFjY2lkIHJlc3VsdCA9IGtleW1hcFtub3RlbnVtYmVyXTtcbiAgICAgICAgaWYgKHJlc3VsdCA9PSBBY2NpZC5TaGFycCkge1xuICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXJdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgICAgIGtleW1hcFtub3RlbnVtYmVyLTFdID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChyZXN1bHQgPT0gQWNjaWQuRmxhdCkge1xuICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXJdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgICAgIGtleW1hcFtub3RlbnVtYmVyKzFdID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChyZXN1bHQgPT0gQWNjaWQuTmF0dXJhbCkge1xuICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXJdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgICAgIGludCBuZXh0a2V5ID0gTm90ZVNjYWxlLkZyb21OdW1iZXIobm90ZW51bWJlcisxKTtcbiAgICAgICAgICAgIGludCBwcmV2a2V5ID0gTm90ZVNjYWxlLkZyb21OdW1iZXIobm90ZW51bWJlci0xKTtcblxuICAgICAgICAgICAgLyogSWYgd2UgaW5zZXJ0IGEgbmF0dXJhbCwgdGhlbiBlaXRoZXI6XG4gICAgICAgICAgICAgKiAtIHRoZSBuZXh0IGtleSBtdXN0IGdvIGJhY2sgdG8gc2hhcnAsXG4gICAgICAgICAgICAgKiAtIHRoZSBwcmV2aW91cyBrZXkgbXVzdCBnbyBiYWNrIHRvIGZsYXQuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlmIChrZXltYXBbbm90ZW51bWJlci0xXSA9PSBBY2NpZC5Ob25lICYmIGtleW1hcFtub3RlbnVtYmVyKzFdID09IEFjY2lkLk5vbmUgJiZcbiAgICAgICAgICAgICAgICBOb3RlU2NhbGUuSXNCbGFja0tleShuZXh0a2V5KSAmJiBOb3RlU2NhbGUuSXNCbGFja0tleShwcmV2a2V5KSApIHtcblxuICAgICAgICAgICAgICAgIGlmIChudW1fZmxhdHMgPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlcisxXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXItMV0gPSBBY2NpZC5GbGF0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGtleW1hcFtub3RlbnVtYmVyLTFdID09IEFjY2lkLk5vbmUgJiYgTm90ZVNjYWxlLklzQmxhY2tLZXkocHJldmtleSkpIHtcbiAgICAgICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlci0xXSA9IEFjY2lkLkZsYXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChrZXltYXBbbm90ZW51bWJlcisxXSA9PSBBY2NpZC5Ob25lICYmIE5vdGVTY2FsZS5Jc0JsYWNrS2V5KG5leHRrZXkpKSB7XG4gICAgICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXIrMV0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8qIFNob3VsZG4ndCBnZXQgaGVyZSAqL1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG5cbiAgICAvKiogR2l2ZW4gYSBtaWRpIG5vdGUgbnVtYmVyLCByZXR1cm4gdGhlIHdoaXRlIG5vdGUgKHRoZVxuICAgICAqIG5vbi1zaGFycC9ub24tZmxhdCBub3RlKSB0aGF0IHNob3VsZCBiZSB1c2VkIHdoZW4gZGlzcGxheWluZ1xuICAgICAqIHRoaXMgbm90ZSBpbiB0aGlzIGtleSBzaWduYXR1cmUuICBUaGlzIHNob3VsZCBiZSBjYWxsZWRcbiAgICAgKiBiZWZvcmUgY2FsbGluZyBHZXRBY2NpZGVudGFsKCkuXG4gICAgICovXG4gICAgcHVibGljIFdoaXRlTm90ZSBHZXRXaGl0ZU5vdGUoaW50IG5vdGVudW1iZXIpIHtcbiAgICAgICAgaW50IG5vdGVzY2FsZSA9IE5vdGVTY2FsZS5Gcm9tTnVtYmVyKG5vdGVudW1iZXIpO1xuICAgICAgICBpbnQgb2N0YXZlID0gKG5vdGVudW1iZXIgKyAzKSAvIDEyIC0gMTtcbiAgICAgICAgaW50IGxldHRlciA9IDA7XG5cbiAgICAgICAgaW50W10gd2hvbGVfc2hhcnBzID0geyBcbiAgICAgICAgICAgIFdoaXRlTm90ZS5BLCBXaGl0ZU5vdGUuQSwgXG4gICAgICAgICAgICBXaGl0ZU5vdGUuQiwgXG4gICAgICAgICAgICBXaGl0ZU5vdGUuQywgV2hpdGVOb3RlLkMsXG4gICAgICAgICAgICBXaGl0ZU5vdGUuRCwgV2hpdGVOb3RlLkQsXG4gICAgICAgICAgICBXaGl0ZU5vdGUuRSxcbiAgICAgICAgICAgIFdoaXRlTm90ZS5GLCBXaGl0ZU5vdGUuRixcbiAgICAgICAgICAgIFdoaXRlTm90ZS5HLCBXaGl0ZU5vdGUuR1xuICAgICAgICB9O1xuXG4gICAgICAgIGludFtdIHdob2xlX2ZsYXRzID0ge1xuICAgICAgICAgICAgV2hpdGVOb3RlLkEsIFxuICAgICAgICAgICAgV2hpdGVOb3RlLkIsIFdoaXRlTm90ZS5CLFxuICAgICAgICAgICAgV2hpdGVOb3RlLkMsXG4gICAgICAgICAgICBXaGl0ZU5vdGUuRCwgV2hpdGVOb3RlLkQsXG4gICAgICAgICAgICBXaGl0ZU5vdGUuRSwgV2hpdGVOb3RlLkUsXG4gICAgICAgICAgICBXaGl0ZU5vdGUuRixcbiAgICAgICAgICAgIFdoaXRlTm90ZS5HLCBXaGl0ZU5vdGUuRyxcbiAgICAgICAgICAgIFdoaXRlTm90ZS5BXG4gICAgICAgIH07XG5cbiAgICAgICAgQWNjaWQgYWNjaWQgPSBrZXltYXBbbm90ZW51bWJlcl07XG4gICAgICAgIGlmIChhY2NpZCA9PSBBY2NpZC5GbGF0KSB7XG4gICAgICAgICAgICBsZXR0ZXIgPSB3aG9sZV9mbGF0c1tub3Rlc2NhbGVdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFjY2lkID09IEFjY2lkLlNoYXJwKSB7XG4gICAgICAgICAgICBsZXR0ZXIgPSB3aG9sZV9zaGFycHNbbm90ZXNjYWxlXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhY2NpZCA9PSBBY2NpZC5OYXR1cmFsKSB7XG4gICAgICAgICAgICBsZXR0ZXIgPSB3aG9sZV9zaGFycHNbbm90ZXNjYWxlXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhY2NpZCA9PSBBY2NpZC5Ob25lKSB7XG4gICAgICAgICAgICBsZXR0ZXIgPSB3aG9sZV9zaGFycHNbbm90ZXNjYWxlXTtcblxuICAgICAgICAgICAgLyogSWYgdGhlIG5vdGUgbnVtYmVyIGlzIGEgc2hhcnAvZmxhdCwgYW5kIHRoZXJlJ3Mgbm8gYWNjaWRlbnRhbCxcbiAgICAgICAgICAgICAqIGRldGVybWluZSB0aGUgd2hpdGUgbm90ZSBieSBzZWVpbmcgd2hldGhlciB0aGUgcHJldmlvdXMgb3IgbmV4dCBub3RlXG4gICAgICAgICAgICAgKiBpcyBhIG5hdHVyYWwuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlmIChOb3RlU2NhbGUuSXNCbGFja0tleShub3Rlc2NhbGUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleW1hcFtub3RlbnVtYmVyLTFdID09IEFjY2lkLk5hdHVyYWwgJiYgXG4gICAgICAgICAgICAgICAgICAgIGtleW1hcFtub3RlbnVtYmVyKzFdID09IEFjY2lkLk5hdHVyYWwpIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAobnVtX2ZsYXRzID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0dGVyID0gd2hvbGVfZmxhdHNbbm90ZXNjYWxlXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldHRlciA9IHdob2xlX3NoYXJwc1tub3Rlc2NhbGVdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGtleW1hcFtub3RlbnVtYmVyLTFdID09IEFjY2lkLk5hdHVyYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0dGVyID0gd2hvbGVfc2hhcnBzW25vdGVzY2FsZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGtleW1hcFtub3RlbnVtYmVyKzFdID09IEFjY2lkLk5hdHVyYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0dGVyID0gd2hvbGVfZmxhdHNbbm90ZXNjYWxlXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBUaGUgYWJvdmUgYWxnb3JpdGhtIGRvZXNuJ3QgcXVpdGUgd29yayBmb3IgRy1mbGF0IG1ham9yLlxuICAgICAgICAgKiBIYW5kbGUgaXQgaGVyZS5cbiAgICAgICAgICovXG4gICAgICAgIGlmIChudW1fZmxhdHMgPT0gR2ZsYXQgJiYgbm90ZXNjYWxlID09IE5vdGVTY2FsZS5CKSB7XG4gICAgICAgICAgICBsZXR0ZXIgPSBXaGl0ZU5vdGUuQztcbiAgICAgICAgfVxuICAgICAgICBpZiAobnVtX2ZsYXRzID09IEdmbGF0ICYmIG5vdGVzY2FsZSA9PSBOb3RlU2NhbGUuQmZsYXQpIHtcbiAgICAgICAgICAgIGxldHRlciA9IFdoaXRlTm90ZS5CO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG51bV9mbGF0cyA+IDAgJiYgbm90ZXNjYWxlID09IE5vdGVTY2FsZS5BZmxhdCkge1xuICAgICAgICAgICAgb2N0YXZlKys7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFdoaXRlTm90ZShsZXR0ZXIsIG9jdGF2ZSk7XG4gICAgfVxuXG5cbiAgICAvKiogR3Vlc3MgdGhlIGtleSBzaWduYXR1cmUsIGdpdmVuIHRoZSBtaWRpIG5vdGUgbnVtYmVycyB1c2VkIGluXG4gICAgICogdGhlIHNvbmcuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBLZXlTaWduYXR1cmUgR3Vlc3MoTGlzdDxpbnQ+IG5vdGVzKSB7XG4gICAgICAgIENyZWF0ZUFjY2lkZW50YWxNYXBzKCk7XG5cbiAgICAgICAgLyogR2V0IHRoZSBmcmVxdWVuY3kgY291bnQgb2YgZWFjaCBub3RlIGluIHRoZSAxMi1ub3RlIHNjYWxlICovXG4gICAgICAgIGludFtdIG5vdGVjb3VudCA9IG5ldyBpbnRbMTJdO1xuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IG5vdGVzLkNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGludCBub3RlbnVtYmVyID0gbm90ZXNbaV07XG4gICAgICAgICAgICBpbnQgbm90ZXNjYWxlID0gKG5vdGVudW1iZXIgKyAzKSAlIDEyO1xuICAgICAgICAgICAgbm90ZWNvdW50W25vdGVzY2FsZV0gKz0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIEZvciBlYWNoIGtleSBzaWduYXR1cmUsIGNvdW50IHRoZSB0b3RhbCBudW1iZXIgb2YgYWNjaWRlbnRhbHNcbiAgICAgICAgICogbmVlZGVkIHRvIGRpc3BsYXkgYWxsIHRoZSBub3Rlcy4gIENob29zZSB0aGUga2V5IHNpZ25hdHVyZVxuICAgICAgICAgKiB3aXRoIHRoZSBmZXdlc3QgYWNjaWRlbnRhbHMuXG4gICAgICAgICAqL1xuICAgICAgICBpbnQgYmVzdGtleSA9IDA7XG4gICAgICAgIGJvb2wgaXNfYmVzdF9zaGFycCA9IHRydWU7XG4gICAgICAgIGludCBzbWFsbGVzdF9hY2NpZF9jb3VudCA9IG5vdGVzLkNvdW50O1xuICAgICAgICBpbnQga2V5O1xuXG4gICAgICAgIGZvciAoa2V5ID0gMDsga2V5IDwgNjsga2V5KyspIHtcbiAgICAgICAgICAgIGludCBhY2NpZF9jb3VudCA9IDA7XG4gICAgICAgICAgICBmb3IgKGludCBuID0gMDsgbiA8IDEyOyBuKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoc2hhcnBrZXlzW2tleV1bbl0gIT0gQWNjaWQuTm9uZSkge1xuICAgICAgICAgICAgICAgICAgICBhY2NpZF9jb3VudCArPSBub3RlY291bnRbbl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFjY2lkX2NvdW50IDwgc21hbGxlc3RfYWNjaWRfY291bnQpIHtcbiAgICAgICAgICAgICAgICBzbWFsbGVzdF9hY2NpZF9jb3VudCA9IGFjY2lkX2NvdW50O1xuICAgICAgICAgICAgICAgIGJlc3RrZXkgPSBrZXk7XG4gICAgICAgICAgICAgICAgaXNfYmVzdF9zaGFycCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGtleSA9IDA7IGtleSA8IDc7IGtleSsrKSB7XG4gICAgICAgICAgICBpbnQgYWNjaWRfY291bnQgPSAwO1xuICAgICAgICAgICAgZm9yIChpbnQgbiA9IDA7IG4gPCAxMjsgbisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZsYXRrZXlzW2tleV1bbl0gIT0gQWNjaWQuTm9uZSkge1xuICAgICAgICAgICAgICAgICAgICBhY2NpZF9jb3VudCArPSBub3RlY291bnRbbl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFjY2lkX2NvdW50IDwgc21hbGxlc3RfYWNjaWRfY291bnQpIHtcbiAgICAgICAgICAgICAgICBzbWFsbGVzdF9hY2NpZF9jb3VudCA9IGFjY2lkX2NvdW50O1xuICAgICAgICAgICAgICAgIGJlc3RrZXkgPSBrZXk7XG4gICAgICAgICAgICAgICAgaXNfYmVzdF9zaGFycCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChpc19iZXN0X3NoYXJwKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEtleVNpZ25hdHVyZShiZXN0a2V5LCAwKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgS2V5U2lnbmF0dXJlKDAsIGJlc3RrZXkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0cnVlIGlmIHRoaXMga2V5IHNpZ25hdHVyZSBpcyBlcXVhbCB0byBrZXkgc2lnbmF0dXJlIGsgKi9cbiAgICBwdWJsaWMgYm9vbCBFcXVhbHMoS2V5U2lnbmF0dXJlIGspIHtcbiAgICAgICAgaWYgKGsubnVtX3NoYXJwcyA9PSBudW1fc2hhcnBzICYmIGsubnVtX2ZsYXRzID09IG51bV9mbGF0cylcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyogUmV0dXJuIHRoZSBNYWpvciBLZXkgb2YgdGhpcyBLZXkgU2lnbmF0dXJlICovXG4gICAgcHVibGljIGludCBOb3Rlc2NhbGUoKSB7XG4gICAgICAgIGludFtdIGZsYXRtYWpvciA9IHtcbiAgICAgICAgICAgIE5vdGVTY2FsZS5DLCBOb3RlU2NhbGUuRiwgTm90ZVNjYWxlLkJmbGF0LCBOb3RlU2NhbGUuRWZsYXQsXG4gICAgICAgICAgICBOb3RlU2NhbGUuQWZsYXQsIE5vdGVTY2FsZS5EZmxhdCwgTm90ZVNjYWxlLkdmbGF0LCBOb3RlU2NhbGUuQiBcbiAgICAgICAgfTtcblxuICAgICAgICBpbnRbXSBzaGFycG1ham9yID0ge1xuICAgICAgICAgICAgTm90ZVNjYWxlLkMsIE5vdGVTY2FsZS5HLCBOb3RlU2NhbGUuRCwgTm90ZVNjYWxlLkEsIE5vdGVTY2FsZS5FLFxuICAgICAgICAgICAgTm90ZVNjYWxlLkIsIE5vdGVTY2FsZS5Gc2hhcnAsIE5vdGVTY2FsZS5Dc2hhcnAsIE5vdGVTY2FsZS5Hc2hhcnAsXG4gICAgICAgICAgICBOb3RlU2NhbGUuRHNoYXJwXG4gICAgICAgIH07XG4gICAgICAgIGlmIChudW1fZmxhdHMgPiAwKVxuICAgICAgICAgICAgcmV0dXJuIGZsYXRtYWpvcltudW1fZmxhdHNdO1xuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgcmV0dXJuIHNoYXJwbWFqb3JbbnVtX3NoYXJwc107XG4gICAgfVxuXG4gICAgLyogQ29udmVydCBhIE1ham9yIEtleSBpbnRvIGEgc3RyaW5nICovXG4gICAgcHVibGljIHN0YXRpYyBzdHJpbmcgS2V5VG9TdHJpbmcoaW50IG5vdGVzY2FsZSkge1xuICAgICAgICBzd2l0Y2ggKG5vdGVzY2FsZSkge1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQTogICAgIHJldHVybiBcIkEgbWFqb3IsIEYjIG1pbm9yXCIgO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQmZsYXQ6IHJldHVybiBcIkItZmxhdCBtYWpvciwgRyBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQjogICAgIHJldHVybiBcIkIgbWFqb3IsIEEtZmxhdCBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQzogICAgIHJldHVybiBcIkMgbWFqb3IsIEEgbWlub3JcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkRmbGF0OiByZXR1cm4gXCJELWZsYXQgbWFqb3IsIEItZmxhdCBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRDogICAgIHJldHVybiBcIkQgbWFqb3IsIEIgbWlub3JcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkVmbGF0OiByZXR1cm4gXCJFLWZsYXQgbWFqb3IsIEMgbWlub3JcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkU6ICAgICByZXR1cm4gXCJFIG1ham9yLCBDIyBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRjogICAgIHJldHVybiBcIkYgbWFqb3IsIEQgbWlub3JcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkdmbGF0OiByZXR1cm4gXCJHLWZsYXQgbWFqb3IsIEUtZmxhdCBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRzogICAgIHJldHVybiBcIkcgbWFqb3IsIEUgbWlub3JcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkFmbGF0OiByZXR1cm4gXCJBLWZsYXQgbWFqb3IsIEYgbWlub3JcIjtcbiAgICAgICAgICAgIGRlZmF1bHQ6ICAgICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGlzIGtleSBzaWduYXR1cmUuXG4gICAgICogV2Ugb25seSByZXR1cm4gdGhlIG1ham9yIGtleSBzaWduYXR1cmUsIG5vdCB0aGUgbWlub3Igb25lLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBLZXlUb1N0cmluZyggTm90ZXNjYWxlKCkgKTtcbiAgICB9XG5cblxufVxuXG59XG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTIgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIEBjbGFzcyBMeXJpY1N5bWJvbFxuICogIEEgbHlyaWMgY29udGFpbnMgdGhlIGx5cmljIHRvIGRpc3BsYXksIHRoZSBzdGFydCB0aW1lIHRoZSBseXJpYyBvY2N1cnMgYXQsXG4gKiAgdGhlIHRoZSB4LWNvb3JkaW5hdGUgd2hlcmUgaXQgd2lsbCBiZSBkaXNwbGF5ZWQuXG4gKi9cbnB1YmxpYyBjbGFzcyBMeXJpY1N5bWJvbCB7XG4gICAgcHJpdmF0ZSBpbnQgc3RhcnR0aW1lOyAgIC8qKiBUaGUgc3RhcnQgdGltZSwgaW4gcHVsc2VzICovXG4gICAgcHJpdmF0ZSBzdHJpbmcgdGV4dDsgICAgIC8qKiBUaGUgbHlyaWMgdGV4dCAqL1xuICAgIHByaXZhdGUgaW50IHg7ICAgICAgICAgICAvKiogVGhlIHggKGhvcml6b250YWwpIHBvc2l0aW9uIHdpdGhpbiB0aGUgc3RhZmYgKi9cblxuICAgIHB1YmxpYyBMeXJpY1N5bWJvbChpbnQgc3RhcnR0aW1lLCBzdHJpbmcgdGV4dCkge1xuICAgICAgICB0aGlzLnN0YXJ0dGltZSA9IHN0YXJ0dGltZTsgXG4gICAgICAgIHRoaXMudGV4dCA9IHRleHQ7XG4gICAgfVxuICAgICBcbiAgICBwdWJsaWMgaW50IFN0YXJ0VGltZSB7XG4gICAgICAgIGdldCB7IHJldHVybiBzdGFydHRpbWU7IH1cbiAgICAgICAgc2V0IHsgc3RhcnR0aW1lID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RyaW5nIFRleHQge1xuICAgICAgICBnZXQgeyByZXR1cm4gdGV4dDsgfVxuICAgICAgICBzZXQgeyB0ZXh0ID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICBwdWJsaWMgaW50IFgge1xuICAgICAgICBnZXQgeyByZXR1cm4geDsgfVxuICAgICAgICBzZXQgeyB4ID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICBwdWJsaWMgaW50IE1pbldpZHRoIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIG1pbldpZHRoKCk7IH1cbiAgICB9XG5cbiAgICAvKiBSZXR1cm4gdGhlIG1pbmltdW0gd2lkdGggaW4gcGl4ZWxzIG5lZWRlZCB0byBkaXNwbGF5IHRoaXMgbHlyaWMuXG4gICAgICogVGhpcyBpcyBhbiBlc3RpbWF0aW9uLCBub3QgZXhhY3QuXG4gICAgICovXG4gICAgcHJpdmF0ZSBpbnQgbWluV2lkdGgoKSB7IFxuICAgICAgICBmbG9hdCB3aWR0aFBlckNoYXIgPSBTaGVldE11c2ljLkxldHRlckZvbnQuR2V0SGVpZ2h0KCkgKiAyLjBmLzMuMGY7XG4gICAgICAgIGZsb2F0IHdpZHRoID0gdGV4dC5MZW5ndGggKiB3aWR0aFBlckNoYXI7XG4gICAgICAgIGlmICh0ZXh0LkluZGV4T2YoXCJpXCIpID49IDApIHtcbiAgICAgICAgICAgIHdpZHRoIC09IHdpZHRoUGVyQ2hhci8yLjBmO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0ZXh0LkluZGV4T2YoXCJqXCIpID49IDApIHtcbiAgICAgICAgICAgIHdpZHRoIC09IHdpZHRoUGVyQ2hhci8yLjBmO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0ZXh0LkluZGV4T2YoXCJsXCIpID49IDApIHtcbiAgICAgICAgICAgIHdpZHRoIC09IHdpZHRoUGVyQ2hhci8yLjBmO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoaW50KXdpZHRoO1xuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBcbiAgICBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiTHlyaWMgc3RhcnQ9ezB9IHg9ezF9IHRleHQ9ezJ9XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0dGltZSwgeCwgdGV4dCk7XG4gICAgfVxuXG59XG5cblxufVxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDEyIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbi8qKiBAY2xhc3MgTWlkaUV2ZW50XG4gKiBBIE1pZGlFdmVudCByZXByZXNlbnRzIGEgc2luZ2xlIGV2ZW50IChzdWNoIGFzIEV2ZW50Tm90ZU9uKSBpbiB0aGVcbiAqIE1pZGkgZmlsZS4gSXQgaW5jbHVkZXMgdGhlIGRlbHRhIHRpbWUgb2YgdGhlIGV2ZW50LlxuICovXG5wdWJsaWMgY2xhc3MgTWlkaUV2ZW50IDogSUNvbXBhcmVyPE1pZGlFdmVudD4ge1xuXG4gICAgcHVibGljIGludCAgICBEZWx0YVRpbWU7ICAgICAvKiogVGhlIHRpbWUgYmV0d2VlbiB0aGUgcHJldmlvdXMgZXZlbnQgYW5kIHRoaXMgb24gKi9cbiAgICBwdWJsaWMgaW50ICAgIFN0YXJ0VGltZTsgICAgIC8qKiBUaGUgYWJzb2x1dGUgdGltZSB0aGlzIGV2ZW50IG9jY3VycyAqL1xuICAgIHB1YmxpYyBib29sICAgSGFzRXZlbnRmbGFnOyAgLyoqIEZhbHNlIGlmIHRoaXMgaXMgdXNpbmcgdGhlIHByZXZpb3VzIGV2ZW50ZmxhZyAqL1xuICAgIHB1YmxpYyBieXRlICAgRXZlbnRGbGFnOyAgICAgLyoqIE5vdGVPbiwgTm90ZU9mZiwgZXRjLiAgRnVsbCBsaXN0IGlzIGluIGNsYXNzIE1pZGlGaWxlICovXG4gICAgcHVibGljIGJ5dGUgICBDaGFubmVsOyAgICAgICAvKiogVGhlIGNoYW5uZWwgdGhpcyBldmVudCBvY2N1cnMgb24gKi8gXG5cbiAgICBwdWJsaWMgYnl0ZSAgIE5vdGVudW1iZXI7ICAgIC8qKiBUaGUgbm90ZSBudW1iZXIgICovXG4gICAgcHVibGljIGJ5dGUgICBWZWxvY2l0eTsgICAgICAvKiogVGhlIHZvbHVtZSBvZiB0aGUgbm90ZSAqL1xuICAgIHB1YmxpYyBieXRlICAgSW5zdHJ1bWVudDsgICAgLyoqIFRoZSBpbnN0cnVtZW50ICovXG4gICAgcHVibGljIGJ5dGUgICBLZXlQcmVzc3VyZTsgICAvKiogVGhlIGtleSBwcmVzc3VyZSAqL1xuICAgIHB1YmxpYyBieXRlICAgQ2hhblByZXNzdXJlOyAgLyoqIFRoZSBjaGFubmVsIHByZXNzdXJlICovXG4gICAgcHVibGljIGJ5dGUgICBDb250cm9sTnVtOyAgICAvKiogVGhlIGNvbnRyb2xsZXIgbnVtYmVyICovXG4gICAgcHVibGljIGJ5dGUgICBDb250cm9sVmFsdWU7ICAvKiogVGhlIGNvbnRyb2xsZXIgdmFsdWUgKi9cbiAgICBwdWJsaWMgdXNob3J0IFBpdGNoQmVuZDsgICAgIC8qKiBUaGUgcGl0Y2ggYmVuZCB2YWx1ZSAqL1xuICAgIHB1YmxpYyBieXRlICAgTnVtZXJhdG9yOyAgICAgLyoqIFRoZSBudW1lcmF0b3IsIGZvciBUaW1lU2lnbmF0dXJlIG1ldGEgZXZlbnRzICovXG4gICAgcHVibGljIGJ5dGUgICBEZW5vbWluYXRvcjsgICAvKiogVGhlIGRlbm9taW5hdG9yLCBmb3IgVGltZVNpZ25hdHVyZSBtZXRhIGV2ZW50cyAqL1xuICAgIHB1YmxpYyBpbnQgICAgVGVtcG87ICAgICAgICAgLyoqIFRoZSB0ZW1wbywgZm9yIFRlbXBvIG1ldGEgZXZlbnRzICovXG4gICAgcHVibGljIGJ5dGUgICBNZXRhZXZlbnQ7ICAgICAvKiogVGhlIG1ldGFldmVudCwgdXNlZCBpZiBldmVudGZsYWcgaXMgTWV0YUV2ZW50ICovXG4gICAgcHVibGljIGludCAgICBNZXRhbGVuZ3RoOyAgICAvKiogVGhlIG1ldGFldmVudCBsZW5ndGggICovXG4gICAgcHVibGljIGJ5dGVbXSBWYWx1ZTsgICAgICAgICAvKiogVGhlIHJhdyBieXRlIHZhbHVlLCBmb3IgU3lzZXggYW5kIG1ldGEgZXZlbnRzICovXG5cbiAgICBwdWJsaWMgTWlkaUV2ZW50KCkge1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gYSBjb3B5IG9mIHRoaXMgZXZlbnQgKi9cbiAgICBwdWJsaWMgTWlkaUV2ZW50IENsb25lKCkge1xuICAgICAgICBNaWRpRXZlbnQgbWV2ZW50PSBuZXcgTWlkaUV2ZW50KCk7XG4gICAgICAgIG1ldmVudC5EZWx0YVRpbWUgPSBEZWx0YVRpbWU7XG4gICAgICAgIG1ldmVudC5TdGFydFRpbWUgPSBTdGFydFRpbWU7XG4gICAgICAgIG1ldmVudC5IYXNFdmVudGZsYWcgPSBIYXNFdmVudGZsYWc7XG4gICAgICAgIG1ldmVudC5FdmVudEZsYWcgPSBFdmVudEZsYWc7XG4gICAgICAgIG1ldmVudC5DaGFubmVsID0gQ2hhbm5lbDtcbiAgICAgICAgbWV2ZW50Lk5vdGVudW1iZXIgPSBOb3RlbnVtYmVyO1xuICAgICAgICBtZXZlbnQuVmVsb2NpdHkgPSBWZWxvY2l0eTtcbiAgICAgICAgbWV2ZW50Lkluc3RydW1lbnQgPSBJbnN0cnVtZW50O1xuICAgICAgICBtZXZlbnQuS2V5UHJlc3N1cmUgPSBLZXlQcmVzc3VyZTtcbiAgICAgICAgbWV2ZW50LkNoYW5QcmVzc3VyZSA9IENoYW5QcmVzc3VyZTtcbiAgICAgICAgbWV2ZW50LkNvbnRyb2xOdW0gPSBDb250cm9sTnVtO1xuICAgICAgICBtZXZlbnQuQ29udHJvbFZhbHVlID0gQ29udHJvbFZhbHVlO1xuICAgICAgICBtZXZlbnQuUGl0Y2hCZW5kID0gUGl0Y2hCZW5kO1xuICAgICAgICBtZXZlbnQuTnVtZXJhdG9yID0gTnVtZXJhdG9yO1xuICAgICAgICBtZXZlbnQuRGVub21pbmF0b3IgPSBEZW5vbWluYXRvcjtcbiAgICAgICAgbWV2ZW50LlRlbXBvID0gVGVtcG87XG4gICAgICAgIG1ldmVudC5NZXRhZXZlbnQgPSBNZXRhZXZlbnQ7XG4gICAgICAgIG1ldmVudC5NZXRhbGVuZ3RoID0gTWV0YWxlbmd0aDtcbiAgICAgICAgbWV2ZW50LlZhbHVlID0gVmFsdWU7XG4gICAgICAgIHJldHVybiBtZXZlbnQ7XG4gICAgfVxuXG4gICAgLyoqIENvbXBhcmUgdHdvIE1pZGlFdmVudHMgYmFzZWQgb24gdGhlaXIgc3RhcnQgdGltZXMuICovXG4gICAgcHVibGljIGludCBDb21wYXJlKE1pZGlFdmVudCB4LCBNaWRpRXZlbnQgeSkge1xuICAgICAgICBpZiAoeC5TdGFydFRpbWUgPT0geS5TdGFydFRpbWUpIHtcbiAgICAgICAgICAgIGlmICh4LkV2ZW50RmxhZyA9PSB5LkV2ZW50RmxhZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB4Lk5vdGVudW1iZXIgLSB5Lk5vdGVudW1iZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geC5FdmVudEZsYWcgLSB5LkV2ZW50RmxhZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB4LlN0YXJ0VGltZSAtIHkuU3RhcnRUaW1lO1xuICAgICAgICB9XG4gICAgfVxufVxuXG59ICAvKiBFbmQgbmFtZXNwYWNlIE1pZGlTaGVldE11c2ljICovXG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMiBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcbntcblxuICAgIC8qIFRoaXMgZmlsZSBjb250YWlucyB0aGUgY2xhc3NlcyBmb3IgcGFyc2luZyBhbmQgbW9kaWZ5aW5nXG4gICAgICogTUlESSBtdXNpYyBmaWxlcy5cbiAgICAgKi9cblxuICAgIC8qIE1JREkgZmlsZSBmb3JtYXQuXG4gICAgICpcbiAgICAgKiBUaGUgTWlkaSBGaWxlIGZvcm1hdCBpcyBkZXNjcmliZWQgYmVsb3cuICBUaGUgZGVzY3JpcHRpb24gdXNlc1xuICAgICAqIHRoZSBmb2xsb3dpbmcgYWJicmV2aWF0aW9ucy5cbiAgICAgKlxuICAgICAqIHUxICAgICAtIE9uZSBieXRlXG4gICAgICogdTIgICAgIC0gVHdvIGJ5dGVzIChiaWcgZW5kaWFuKVxuICAgICAqIHU0ICAgICAtIEZvdXIgYnl0ZXMgKGJpZyBlbmRpYW4pXG4gICAgICogdmFybGVuIC0gQSB2YXJpYWJsZSBsZW5ndGggaW50ZWdlciwgdGhhdCBjYW4gYmUgMSB0byA0IGJ5dGVzLiBUaGUgXG4gICAgICogICAgICAgICAgaW50ZWdlciBlbmRzIHdoZW4geW91IGVuY291bnRlciBhIGJ5dGUgdGhhdCBkb2Vzbid0IGhhdmUgXG4gICAgICogICAgICAgICAgdGhlIDh0aCBiaXQgc2V0IChhIGJ5dGUgbGVzcyB0aGFuIDB4ODApLlxuICAgICAqIGxlbj8gICAtIFRoZSBsZW5ndGggb2YgdGhlIGRhdGEgZGVwZW5kcyBvbiBzb21lIGNvZGVcbiAgICAgKiAgICAgICAgICBcbiAgICAgKlxuICAgICAqIFRoZSBNaWRpIGZpbGVzIGJlZ2lucyB3aXRoIHRoZSBtYWluIE1pZGkgaGVhZGVyXG4gICAgICogdTQgPSBUaGUgZm91ciBhc2NpaSBjaGFyYWN0ZXJzICdNVGhkJ1xuICAgICAqIHU0ID0gVGhlIGxlbmd0aCBvZiB0aGUgTVRoZCBoZWFkZXIgPSA2IGJ5dGVzXG4gICAgICogdTIgPSAwIGlmIHRoZSBmaWxlIGNvbnRhaW5zIGEgc2luZ2xlIHRyYWNrXG4gICAgICogICAgICAxIGlmIHRoZSBmaWxlIGNvbnRhaW5zIG9uZSBvciBtb3JlIHNpbXVsdGFuZW91cyB0cmFja3NcbiAgICAgKiAgICAgIDIgaWYgdGhlIGZpbGUgY29udGFpbnMgb25lIG9yIG1vcmUgaW5kZXBlbmRlbnQgdHJhY2tzXG4gICAgICogdTIgPSBudW1iZXIgb2YgdHJhY2tzXG4gICAgICogdTIgPSBpZiA+ICAwLCB0aGUgbnVtYmVyIG9mIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlXG4gICAgICogICAgICBpZiA8PSAwLCB0aGVuID8/P1xuICAgICAqXG4gICAgICogTmV4dCBjb21lIHRoZSBpbmRpdmlkdWFsIE1pZGkgdHJhY2tzLiAgVGhlIHRvdGFsIG51bWJlciBvZiBNaWRpXG4gICAgICogdHJhY2tzIHdhcyBnaXZlbiBhYm92ZSwgaW4gdGhlIE1UaGQgaGVhZGVyLiAgRWFjaCB0cmFjayBzdGFydHNcbiAgICAgKiB3aXRoIGEgaGVhZGVyOlxuICAgICAqXG4gICAgICogdTQgPSBUaGUgZm91ciBhc2NpaSBjaGFyYWN0ZXJzICdNVHJrJ1xuICAgICAqIHU0ID0gQW1vdW50IG9mIHRyYWNrIGRhdGEsIGluIGJ5dGVzLlxuICAgICAqIFxuICAgICAqIFRoZSB0cmFjayBkYXRhIGNvbnNpc3RzIG9mIGEgc2VyaWVzIG9mIE1pZGkgZXZlbnRzLiAgRWFjaCBNaWRpIGV2ZW50XG4gICAgICogaGFzIHRoZSBmb2xsb3dpbmcgZm9ybWF0OlxuICAgICAqXG4gICAgICogdmFybGVuICAtIFRoZSB0aW1lIGJldHdlZW4gdGhlIHByZXZpb3VzIGV2ZW50IGFuZCB0aGlzIGV2ZW50LCBtZWFzdXJlZFxuICAgICAqICAgICAgICAgICBpbiBcInB1bHNlc1wiLiAgVGhlIG51bWJlciBvZiBwdWxzZXMgcGVyIHF1YXJ0ZXIgbm90ZSBpcyBnaXZlblxuICAgICAqICAgICAgICAgICBpbiB0aGUgTVRoZCBoZWFkZXIuXG4gICAgICogdTEgICAgICAtIFRoZSBFdmVudCBjb2RlLCBhbHdheXMgYmV0d2VlIDB4ODAgYW5kIDB4RkZcbiAgICAgKiBsZW4/ICAgIC0gVGhlIGV2ZW50IGRhdGEuICBUaGUgbGVuZ3RoIG9mIHRoaXMgZGF0YSBpcyBkZXRlcm1pbmVkIGJ5IHRoZVxuICAgICAqICAgICAgICAgICBldmVudCBjb2RlLiAgVGhlIGZpcnN0IGJ5dGUgb2YgdGhlIGV2ZW50IGRhdGEgaXMgYWx3YXlzIDwgMHg4MC5cbiAgICAgKlxuICAgICAqIFRoZSBldmVudCBjb2RlIGlzIG9wdGlvbmFsLiAgSWYgdGhlIGV2ZW50IGNvZGUgaXMgbWlzc2luZywgdGhlbiBpdFxuICAgICAqIGRlZmF1bHRzIHRvIHRoZSBwcmV2aW91cyBldmVudCBjb2RlLiAgRm9yIGV4YW1wbGU6XG4gICAgICpcbiAgICAgKiAgIHZhcmxlbiwgZXZlbnRjb2RlMSwgZXZlbnRkYXRhLFxuICAgICAqICAgdmFybGVuLCBldmVudGNvZGUyLCBldmVudGRhdGEsXG4gICAgICogICB2YXJsZW4sIGV2ZW50ZGF0YSwgIC8vIGV2ZW50Y29kZSBpcyBldmVudGNvZGUyXG4gICAgICogICB2YXJsZW4sIGV2ZW50ZGF0YSwgIC8vIGV2ZW50Y29kZSBpcyBldmVudGNvZGUyXG4gICAgICogICB2YXJsZW4sIGV2ZW50Y29kZTMsIGV2ZW50ZGF0YSxcbiAgICAgKiAgIC4uLi5cbiAgICAgKlxuICAgICAqICAgSG93IGRvIHlvdSBrbm93IGlmIHRoZSBldmVudGNvZGUgaXMgdGhlcmUgb3IgbWlzc2luZz8gV2VsbDpcbiAgICAgKiAgIC0gQWxsIGV2ZW50IGNvZGVzIGFyZSBiZXR3ZWVuIDB4ODAgYW5kIDB4RkZcbiAgICAgKiAgIC0gVGhlIGZpcnN0IGJ5dGUgb2YgZXZlbnRkYXRhIGlzIGFsd2F5cyBsZXNzIHRoYW4gMHg4MC5cbiAgICAgKiAgIFNvLCBhZnRlciB0aGUgdmFybGVuIGRlbHRhIHRpbWUsIGlmIHRoZSBuZXh0IGJ5dGUgaXMgYmV0d2VlbiAweDgwXG4gICAgICogICBhbmQgMHhGRiwgaXRzIGFuIGV2ZW50IGNvZGUuICBPdGhlcndpc2UsIGl0cyBldmVudCBkYXRhLlxuICAgICAqXG4gICAgICogVGhlIEV2ZW50IGNvZGVzIGFuZCBldmVudCBkYXRhIGZvciBlYWNoIGV2ZW50IGNvZGUgYXJlIHNob3duIGJlbG93LlxuICAgICAqXG4gICAgICogQ29kZTogIHUxIC0gMHg4MCB0aHJ1IDB4OEYgLSBOb3RlIE9mZiBldmVudC5cbiAgICAgKiAgICAgICAgICAgICAweDgwIGlzIGZvciBjaGFubmVsIDEsIDB4OEYgaXMgZm9yIGNoYW5uZWwgMTYuXG4gICAgICogRGF0YTogIHUxIC0gVGhlIG5vdGUgbnVtYmVyLCAwLTEyNy4gIE1pZGRsZSBDIGlzIDYwICgweDNDKVxuICAgICAqICAgICAgICB1MSAtIFRoZSBub3RlIHZlbG9jaXR5LiAgVGhpcyBzaG91bGQgYmUgMFxuICAgICAqIFxuICAgICAqIENvZGU6ICB1MSAtIDB4OTAgdGhydSAweDlGIC0gTm90ZSBPbiBldmVudC5cbiAgICAgKiAgICAgICAgICAgICAweDkwIGlzIGZvciBjaGFubmVsIDEsIDB4OUYgaXMgZm9yIGNoYW5uZWwgMTYuXG4gICAgICogRGF0YTogIHUxIC0gVGhlIG5vdGUgbnVtYmVyLCAwLTEyNy4gIE1pZGRsZSBDIGlzIDYwICgweDNDKVxuICAgICAqICAgICAgICB1MSAtIFRoZSBub3RlIHZlbG9jaXR5LCBmcm9tIDAgKG5vIHNvdW5kKSB0byAxMjcgKGxvdWQpLlxuICAgICAqICAgICAgICAgICAgIEEgdmFsdWUgb2YgMCBpcyBlcXVpdmFsZW50IHRvIGEgTm90ZSBPZmYuXG4gICAgICpcbiAgICAgKiBDb2RlOiAgdTEgLSAweEEwIHRocnUgMHhBRiAtIEtleSBQcmVzc3VyZVxuICAgICAqIERhdGE6ICB1MSAtIFRoZSBub3RlIG51bWJlciwgMC0xMjcuXG4gICAgICogICAgICAgIHUxIC0gVGhlIHByZXNzdXJlLlxuICAgICAqXG4gICAgICogQ29kZTogIHUxIC0gMHhCMCB0aHJ1IDB4QkYgLSBDb250cm9sIENoYW5nZVxuICAgICAqIERhdGE6ICB1MSAtIFRoZSBjb250cm9sbGVyIG51bWJlclxuICAgICAqICAgICAgICB1MSAtIFRoZSB2YWx1ZVxuICAgICAqXG4gICAgICogQ29kZTogIHUxIC0gMHhDMCB0aHJ1IDB4Q0YgLSBQcm9ncmFtIENoYW5nZVxuICAgICAqIERhdGE6ICB1MSAtIFRoZSBwcm9ncmFtIG51bWJlci5cbiAgICAgKlxuICAgICAqIENvZGU6ICB1MSAtIDB4RDAgdGhydSAweERGIC0gQ2hhbm5lbCBQcmVzc3VyZVxuICAgICAqICAgICAgICB1MSAtIFRoZSBwcmVzc3VyZS5cbiAgICAgKlxuICAgICAqIENvZGU6ICB1MSAtIDB4RTAgdGhydSAweEVGIC0gUGl0Y2ggQmVuZFxuICAgICAqIERhdGE6ICB1MiAtIFNvbWUgZGF0YVxuICAgICAqXG4gICAgICogQ29kZTogIHUxICAgICAtIDB4RkYgLSBNZXRhIEV2ZW50XG4gICAgICogRGF0YTogIHUxICAgICAtIE1ldGFjb2RlXG4gICAgICogICAgICAgIHZhcmxlbiAtIExlbmd0aCBvZiBtZXRhIGV2ZW50XG4gICAgICogICAgICAgIHUxW3Zhcmxlbl0gLSBNZXRhIGV2ZW50IGRhdGEuXG4gICAgICpcbiAgICAgKlxuICAgICAqIFRoZSBNZXRhIEV2ZW50IGNvZGVzIGFyZSBsaXN0ZWQgYmVsb3c6XG4gICAgICpcbiAgICAgKiBNZXRhY29kZTogdTEgICAgICAgICAtIDB4MCAgU2VxdWVuY2UgTnVtYmVyXG4gICAgICogICAgICAgICAgIHZhcmxlbiAgICAgLSAwIG9yIDJcbiAgICAgKiAgICAgICAgICAgdTFbdmFybGVuXSAtIFNlcXVlbmNlIG51bWJlclxuICAgICAqXG4gICAgICogTWV0YWNvZGU6IHUxICAgICAgICAgLSAweDEgIFRleHRcbiAgICAgKiAgICAgICAgICAgdmFybGVuICAgICAtIExlbmd0aCBvZiB0ZXh0XG4gICAgICogICAgICAgICAgIHUxW3Zhcmxlbl0gLSBUZXh0XG4gICAgICpcbiAgICAgKiBNZXRhY29kZTogdTEgICAgICAgICAtIDB4MiAgQ29weXJpZ2h0XG4gICAgICogICAgICAgICAgIHZhcmxlbiAgICAgLSBMZW5ndGggb2YgdGV4dFxuICAgICAqICAgICAgICAgICB1MVt2YXJsZW5dIC0gVGV4dFxuICAgICAqXG4gICAgICogTWV0YWNvZGU6IHUxICAgICAgICAgLSAweDMgIFRyYWNrIE5hbWVcbiAgICAgKiAgICAgICAgICAgdmFybGVuICAgICAtIExlbmd0aCBvZiBuYW1lXG4gICAgICogICAgICAgICAgIHUxW3Zhcmxlbl0gLSBUcmFjayBOYW1lXG4gICAgICpcbiAgICAgKiBNZXRhY29kZTogdTEgICAgICAgICAtIDB4NTggIFRpbWUgU2lnbmF0dXJlXG4gICAgICogICAgICAgICAgIHZhcmxlbiAgICAgLSA0IFxuICAgICAqICAgICAgICAgICB1MSAgICAgICAgIC0gbnVtZXJhdG9yXG4gICAgICogICAgICAgICAgIHUxICAgICAgICAgLSBsb2cyKGRlbm9taW5hdG9yKVxuICAgICAqICAgICAgICAgICB1MSAgICAgICAgIC0gY2xvY2tzIGluIG1ldHJvbm9tZSBjbGlja1xuICAgICAqICAgICAgICAgICB1MSAgICAgICAgIC0gMzJuZCBub3RlcyBpbiBxdWFydGVyIG5vdGUgKHVzdWFsbHkgOClcbiAgICAgKlxuICAgICAqIE1ldGFjb2RlOiB1MSAgICAgICAgIC0gMHg1OSAgS2V5IFNpZ25hdHVyZVxuICAgICAqICAgICAgICAgICB2YXJsZW4gICAgIC0gMlxuICAgICAqICAgICAgICAgICB1MSAgICAgICAgIC0gaWYgPj0gMCwgdGhlbiBudW1iZXIgb2Ygc2hhcnBzXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICBpZiA8IDAsIHRoZW4gbnVtYmVyIG9mIGZsYXRzICogLTFcbiAgICAgKiAgICAgICAgICAgdTEgICAgICAgICAtIDAgaWYgbWFqb3Iga2V5XG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAxIGlmIG1pbm9yIGtleVxuICAgICAqXG4gICAgICogTWV0YWNvZGU6IHUxICAgICAgICAgLSAweDUxICBUZW1wb1xuICAgICAqICAgICAgICAgICB2YXJsZW4gICAgIC0gMyAgXG4gICAgICogICAgICAgICAgIHUzICAgICAgICAgLSBxdWFydGVyIG5vdGUgbGVuZ3RoIGluIG1pY3Jvc2Vjb25kc1xuICAgICAqL1xuXG5cbiAgICAvKiogQGNsYXNzIE1pZGlGaWxlXG4gICAgICpcbiAgICAgKiBUaGUgTWlkaUZpbGUgY2xhc3MgY29udGFpbnMgdGhlIHBhcnNlZCBkYXRhIGZyb20gdGhlIE1pZGkgRmlsZS5cbiAgICAgKiBJdCBjb250YWluczpcbiAgICAgKiAtIEFsbCB0aGUgdHJhY2tzIGluIHRoZSBtaWRpIGZpbGUsIGluY2x1ZGluZyBhbGwgTWlkaU5vdGVzIHBlciB0cmFjay5cbiAgICAgKiAtIFRoZSB0aW1lIHNpZ25hdHVyZSAoZS5nLiA0LzQsIDMvNCwgNi84KVxuICAgICAqIC0gVGhlIG51bWJlciBvZiBwdWxzZXMgcGVyIHF1YXJ0ZXIgbm90ZS5cbiAgICAgKiAtIFRoZSB0ZW1wbyAobnVtYmVyIG9mIG1pY3Jvc2Vjb25kcyBwZXIgcXVhcnRlciBub3RlKS5cbiAgICAgKlxuICAgICAqIFRoZSBjb25zdHJ1Y3RvciB0YWtlcyBhIGZpbGVuYW1lIGFzIGlucHV0LCBhbmQgdXBvbiByZXR1cm5pbmcsXG4gICAgICogY29udGFpbnMgdGhlIHBhcnNlZCBkYXRhIGZyb20gdGhlIG1pZGkgZmlsZS5cbiAgICAgKlxuICAgICAqIFRoZSBtZXRob2RzIFJlYWRUcmFjaygpIGFuZCBSZWFkTWV0YUV2ZW50KCkgYXJlIGhlbHBlciBmdW5jdGlvbnMgY2FsbGVkXG4gICAgICogYnkgdGhlIGNvbnN0cnVjdG9yIGR1cmluZyB0aGUgcGFyc2luZy5cbiAgICAgKlxuICAgICAqIEFmdGVyIHRoZSBNaWRpRmlsZSBpcyBwYXJzZWQgYW5kIGNyZWF0ZWQsIHRoZSB1c2VyIGNhbiByZXRyaWV2ZSB0aGUgXG4gICAgICogdHJhY2tzIGFuZCBub3RlcyBieSB1c2luZyB0aGUgcHJvcGVydHkgVHJhY2tzIGFuZCBUcmFja3MuTm90ZXMuXG4gICAgICpcbiAgICAgKiBUaGVyZSBhcmUgdHdvIG1ldGhvZHMgZm9yIG1vZGlmeWluZyB0aGUgbWlkaSBkYXRhIGJhc2VkIG9uIHRoZSBtZW51XG4gICAgICogb3B0aW9ucyBzZWxlY3RlZDpcbiAgICAgKlxuICAgICAqIC0gQ2hhbmdlTWlkaU5vdGVzKClcbiAgICAgKiAgIEFwcGx5IHRoZSBtZW51IG9wdGlvbnMgdG8gdGhlIHBhcnNlZCBNaWRpRmlsZS4gIFRoaXMgdXNlcyB0aGUgaGVscGVyIGZ1bmN0aW9uczpcbiAgICAgKiAgICAgU3BsaXRUcmFjaygpXG4gICAgICogICAgIENvbWJpbmVUb1R3b1RyYWNrcygpXG4gICAgICogICAgIFNoaWZ0VGltZSgpXG4gICAgICogICAgIFRyYW5zcG9zZSgpXG4gICAgICogICAgIFJvdW5kU3RhcnRUaW1lcygpXG4gICAgICogICAgIFJvdW5kRHVyYXRpb25zKClcbiAgICAgKlxuICAgICAqIC0gQ2hhbmdlU291bmQoKVxuICAgICAqICAgQXBwbHkgdGhlIG1lbnUgb3B0aW9ucyB0byB0aGUgTUlESSBtdXNpYyBkYXRhLCBhbmQgc2F2ZSB0aGUgbW9kaWZpZWQgbWlkaSBkYXRhIFxuICAgICAqICAgdG8gYSBmaWxlLCBmb3IgcGxheWJhY2suIFxuICAgICAqICAgXG4gICAgICovXG5cbiAgICBwdWJsaWMgY2xhc3MgTWlkaUZpbGVcbiAgICB7XG4gICAgICAgIHByaXZhdGUgc3RyaW5nIGZpbGVuYW1lOyAgICAgICAgICAvKiogVGhlIE1pZGkgZmlsZSBuYW1lICovXG4gICAgICAgIHByaXZhdGUgTGlzdDxNaWRpRXZlbnQ+W10gZXZlbnRzOyAvKiogVGhlIHJhdyBNaWRpRXZlbnRzLCBvbmUgbGlzdCBwZXIgdHJhY2sgKi9cbiAgICAgICAgcHJpdmF0ZSBMaXN0PE1pZGlUcmFjaz4gdHJhY2tzOyAgLyoqIFRoZSB0cmFja3Mgb2YgdGhlIG1pZGlmaWxlIHRoYXQgaGF2ZSBub3RlcyAqL1xuICAgICAgICBwcml2YXRlIHVzaG9ydCB0cmFja21vZGU7ICAgICAgICAgLyoqIDAgKHNpbmdsZSB0cmFjayksIDEgKHNpbXVsdGFuZW91cyB0cmFja3MpIDIgKGluZGVwZW5kZW50IHRyYWNrcykgKi9cbiAgICAgICAgcHJpdmF0ZSBUaW1lU2lnbmF0dXJlIHRpbWVzaWc7ICAgIC8qKiBUaGUgdGltZSBzaWduYXR1cmUgKi9cbiAgICAgICAgcHJpdmF0ZSBpbnQgcXVhcnRlcm5vdGU7ICAgICAgICAgIC8qKiBUaGUgbnVtYmVyIG9mIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlICovXG4gICAgICAgIHByaXZhdGUgaW50IHRvdGFscHVsc2VzOyAgICAgICAgICAvKiogVGhlIHRvdGFsIGxlbmd0aCBvZiB0aGUgc29uZywgaW4gcHVsc2VzICovXG4gICAgICAgIHByaXZhdGUgYm9vbCB0cmFja1BlckNoYW5uZWw7ICAgICAvKiogVHJ1ZSBpZiB3ZSd2ZSBzcGxpdCBlYWNoIGNoYW5uZWwgaW50byBhIHRyYWNrICovXG5cbiAgICAgICAgLyogVGhlIGxpc3Qgb2YgTWlkaSBFdmVudHMgKi9cbiAgICAgICAgcHVibGljIGNvbnN0IGludCBFdmVudE5vdGVPZmYgPSAweDgwO1xuICAgICAgICBwdWJsaWMgY29uc3QgaW50IEV2ZW50Tm90ZU9uID0gMHg5MDtcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBFdmVudEtleVByZXNzdXJlID0gMHhBMDtcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBFdmVudENvbnRyb2xDaGFuZ2UgPSAweEIwO1xuICAgICAgICBwdWJsaWMgY29uc3QgaW50IEV2ZW50UHJvZ3JhbUNoYW5nZSA9IDB4QzA7XG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgRXZlbnRDaGFubmVsUHJlc3N1cmUgPSAweEQwO1xuICAgICAgICBwdWJsaWMgY29uc3QgaW50IEV2ZW50UGl0Y2hCZW5kID0gMHhFMDtcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBTeXNleEV2ZW50MSA9IDB4RjA7XG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgU3lzZXhFdmVudDIgPSAweEY3O1xuICAgICAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudCA9IDB4RkY7XG5cbiAgICAgICAgLyogVGhlIGxpc3Qgb2YgTWV0YSBFdmVudHMgKi9cbiAgICAgICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRTZXF1ZW5jZSA9IDB4MDtcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRUZXh0ID0gMHgxO1xuICAgICAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudENvcHlyaWdodCA9IDB4MjtcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRTZXF1ZW5jZU5hbWUgPSAweDM7XG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50SW5zdHJ1bWVudCA9IDB4NDtcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRMeXJpYyA9IDB4NTtcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRNYXJrZXIgPSAweDY7XG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50RW5kT2ZUcmFjayA9IDB4MkY7XG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50VGVtcG8gPSAweDUxO1xuICAgICAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudFNNUFRFT2Zmc2V0ID0gMHg1NDtcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRUaW1lU2lnbmF0dXJlID0gMHg1ODtcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRLZXlTaWduYXR1cmUgPSAweDU5O1xuXG4gICAgICAgIC8qIFRoZSBQcm9ncmFtIENoYW5nZSBldmVudCBnaXZlcyB0aGUgaW5zdHJ1bWVudCB0aGF0IHNob3VsZFxuICAgICAgICAgKiBiZSB1c2VkIGZvciBhIHBhcnRpY3VsYXIgY2hhbm5lbC4gIFRoZSBmb2xsb3dpbmcgdGFibGVcbiAgICAgICAgICogbWFwcyBlYWNoIGluc3RydW1lbnQgbnVtYmVyICgwIHRocnUgMTI4KSB0byBhbiBpbnN0cnVtZW50XG4gICAgICAgICAqIG5hbWUuXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgc3RhdGljIHN0cmluZ1tdIEluc3RydW1lbnRzID0ge1xuXG4gICAgICAgIFwiQWNvdXN0aWMgR3JhbmQgUGlhbm9cIixcbiAgICAgICAgXCJCcmlnaHQgQWNvdXN0aWMgUGlhbm9cIixcbiAgICAgICAgXCJFbGVjdHJpYyBHcmFuZCBQaWFub1wiLFxuICAgICAgICBcIkhvbmt5LXRvbmsgUGlhbm9cIixcbiAgICAgICAgXCJFbGVjdHJpYyBQaWFubyAxXCIsXG4gICAgICAgIFwiRWxlY3RyaWMgUGlhbm8gMlwiLFxuICAgICAgICBcIkhhcnBzaWNob3JkXCIsXG4gICAgICAgIFwiQ2xhdmlcIixcbiAgICAgICAgXCJDZWxlc3RhXCIsXG4gICAgICAgIFwiR2xvY2tlbnNwaWVsXCIsXG4gICAgICAgIFwiTXVzaWMgQm94XCIsXG4gICAgICAgIFwiVmlicmFwaG9uZVwiLFxuICAgICAgICBcIk1hcmltYmFcIixcbiAgICAgICAgXCJYeWxvcGhvbmVcIixcbiAgICAgICAgXCJUdWJ1bGFyIEJlbGxzXCIsXG4gICAgICAgIFwiRHVsY2ltZXJcIixcbiAgICAgICAgXCJEcmF3YmFyIE9yZ2FuXCIsXG4gICAgICAgIFwiUGVyY3Vzc2l2ZSBPcmdhblwiLFxuICAgICAgICBcIlJvY2sgT3JnYW5cIixcbiAgICAgICAgXCJDaHVyY2ggT3JnYW5cIixcbiAgICAgICAgXCJSZWVkIE9yZ2FuXCIsXG4gICAgICAgIFwiQWNjb3JkaW9uXCIsXG4gICAgICAgIFwiSGFybW9uaWNhXCIsXG4gICAgICAgIFwiVGFuZ28gQWNjb3JkaW9uXCIsXG4gICAgICAgIFwiQWNvdXN0aWMgR3VpdGFyIChueWxvbilcIixcbiAgICAgICAgXCJBY291c3RpYyBHdWl0YXIgKHN0ZWVsKVwiLFxuICAgICAgICBcIkVsZWN0cmljIEd1aXRhciAoamF6eilcIixcbiAgICAgICAgXCJFbGVjdHJpYyBHdWl0YXIgKGNsZWFuKVwiLFxuICAgICAgICBcIkVsZWN0cmljIEd1aXRhciAobXV0ZWQpXCIsXG4gICAgICAgIFwiT3ZlcmRyaXZlbiBHdWl0YXJcIixcbiAgICAgICAgXCJEaXN0b3J0aW9uIEd1aXRhclwiLFxuICAgICAgICBcIkd1aXRhciBoYXJtb25pY3NcIixcbiAgICAgICAgXCJBY291c3RpYyBCYXNzXCIsXG4gICAgICAgIFwiRWxlY3RyaWMgQmFzcyAoZmluZ2VyKVwiLFxuICAgICAgICBcIkVsZWN0cmljIEJhc3MgKHBpY2spXCIsXG4gICAgICAgIFwiRnJldGxlc3MgQmFzc1wiLFxuICAgICAgICBcIlNsYXAgQmFzcyAxXCIsXG4gICAgICAgIFwiU2xhcCBCYXNzIDJcIixcbiAgICAgICAgXCJTeW50aCBCYXNzIDFcIixcbiAgICAgICAgXCJTeW50aCBCYXNzIDJcIixcbiAgICAgICAgXCJWaW9saW5cIixcbiAgICAgICAgXCJWaW9sYVwiLFxuICAgICAgICBcIkNlbGxvXCIsXG4gICAgICAgIFwiQ29udHJhYmFzc1wiLFxuICAgICAgICBcIlRyZW1vbG8gU3RyaW5nc1wiLFxuICAgICAgICBcIlBpenppY2F0byBTdHJpbmdzXCIsXG4gICAgICAgIFwiT3JjaGVzdHJhbCBIYXJwXCIsXG4gICAgICAgIFwiVGltcGFuaVwiLFxuICAgICAgICBcIlN0cmluZyBFbnNlbWJsZSAxXCIsXG4gICAgICAgIFwiU3RyaW5nIEVuc2VtYmxlIDJcIixcbiAgICAgICAgXCJTeW50aFN0cmluZ3MgMVwiLFxuICAgICAgICBcIlN5bnRoU3RyaW5ncyAyXCIsXG4gICAgICAgIFwiQ2hvaXIgQWFoc1wiLFxuICAgICAgICBcIlZvaWNlIE9vaHNcIixcbiAgICAgICAgXCJTeW50aCBWb2ljZVwiLFxuICAgICAgICBcIk9yY2hlc3RyYSBIaXRcIixcbiAgICAgICAgXCJUcnVtcGV0XCIsXG4gICAgICAgIFwiVHJvbWJvbmVcIixcbiAgICAgICAgXCJUdWJhXCIsXG4gICAgICAgIFwiTXV0ZWQgVHJ1bXBldFwiLFxuICAgICAgICBcIkZyZW5jaCBIb3JuXCIsXG4gICAgICAgIFwiQnJhc3MgU2VjdGlvblwiLFxuICAgICAgICBcIlN5bnRoQnJhc3MgMVwiLFxuICAgICAgICBcIlN5bnRoQnJhc3MgMlwiLFxuICAgICAgICBcIlNvcHJhbm8gU2F4XCIsXG4gICAgICAgIFwiQWx0byBTYXhcIixcbiAgICAgICAgXCJUZW5vciBTYXhcIixcbiAgICAgICAgXCJCYXJpdG9uZSBTYXhcIixcbiAgICAgICAgXCJPYm9lXCIsXG4gICAgICAgIFwiRW5nbGlzaCBIb3JuXCIsXG4gICAgICAgIFwiQmFzc29vblwiLFxuICAgICAgICBcIkNsYXJpbmV0XCIsXG4gICAgICAgIFwiUGljY29sb1wiLFxuICAgICAgICBcIkZsdXRlXCIsXG4gICAgICAgIFwiUmVjb3JkZXJcIixcbiAgICAgICAgXCJQYW4gRmx1dGVcIixcbiAgICAgICAgXCJCbG93biBCb3R0bGVcIixcbiAgICAgICAgXCJTaGFrdWhhY2hpXCIsXG4gICAgICAgIFwiV2hpc3RsZVwiLFxuICAgICAgICBcIk9jYXJpbmFcIixcbiAgICAgICAgXCJMZWFkIDEgKHNxdWFyZSlcIixcbiAgICAgICAgXCJMZWFkIDIgKHNhd3Rvb3RoKVwiLFxuICAgICAgICBcIkxlYWQgMyAoY2FsbGlvcGUpXCIsXG4gICAgICAgIFwiTGVhZCA0IChjaGlmZilcIixcbiAgICAgICAgXCJMZWFkIDUgKGNoYXJhbmcpXCIsXG4gICAgICAgIFwiTGVhZCA2ICh2b2ljZSlcIixcbiAgICAgICAgXCJMZWFkIDcgKGZpZnRocylcIixcbiAgICAgICAgXCJMZWFkIDggKGJhc3MgKyBsZWFkKVwiLFxuICAgICAgICBcIlBhZCAxIChuZXcgYWdlKVwiLFxuICAgICAgICBcIlBhZCAyICh3YXJtKVwiLFxuICAgICAgICBcIlBhZCAzIChwb2x5c3ludGgpXCIsXG4gICAgICAgIFwiUGFkIDQgKGNob2lyKVwiLFxuICAgICAgICBcIlBhZCA1IChib3dlZClcIixcbiAgICAgICAgXCJQYWQgNiAobWV0YWxsaWMpXCIsXG4gICAgICAgIFwiUGFkIDcgKGhhbG8pXCIsXG4gICAgICAgIFwiUGFkIDggKHN3ZWVwKVwiLFxuICAgICAgICBcIkZYIDEgKHJhaW4pXCIsXG4gICAgICAgIFwiRlggMiAoc291bmR0cmFjaylcIixcbiAgICAgICAgXCJGWCAzIChjcnlzdGFsKVwiLFxuICAgICAgICBcIkZYIDQgKGF0bW9zcGhlcmUpXCIsXG4gICAgICAgIFwiRlggNSAoYnJpZ2h0bmVzcylcIixcbiAgICAgICAgXCJGWCA2IChnb2JsaW5zKVwiLFxuICAgICAgICBcIkZYIDcgKGVjaG9lcylcIixcbiAgICAgICAgXCJGWCA4IChzY2ktZmkpXCIsXG4gICAgICAgIFwiU2l0YXJcIixcbiAgICAgICAgXCJCYW5qb1wiLFxuICAgICAgICBcIlNoYW1pc2VuXCIsXG4gICAgICAgIFwiS290b1wiLFxuICAgICAgICBcIkthbGltYmFcIixcbiAgICAgICAgXCJCYWcgcGlwZVwiLFxuICAgICAgICBcIkZpZGRsZVwiLFxuICAgICAgICBcIlNoYW5haVwiLFxuICAgICAgICBcIlRpbmtsZSBCZWxsXCIsXG4gICAgICAgIFwiQWdvZ29cIixcbiAgICAgICAgXCJTdGVlbCBEcnVtc1wiLFxuICAgICAgICBcIldvb2RibG9ja1wiLFxuICAgICAgICBcIlRhaWtvIERydW1cIixcbiAgICAgICAgXCJNZWxvZGljIFRvbVwiLFxuICAgICAgICBcIlN5bnRoIERydW1cIixcbiAgICAgICAgXCJSZXZlcnNlIEN5bWJhbFwiLFxuICAgICAgICBcIkd1aXRhciBGcmV0IE5vaXNlXCIsXG4gICAgICAgIFwiQnJlYXRoIE5vaXNlXCIsXG4gICAgICAgIFwiU2Vhc2hvcmVcIixcbiAgICAgICAgXCJCaXJkIFR3ZWV0XCIsXG4gICAgICAgIFwiVGVsZXBob25lIFJpbmdcIixcbiAgICAgICAgXCJIZWxpY29wdGVyXCIsXG4gICAgICAgIFwiQXBwbGF1c2VcIixcbiAgICAgICAgXCJHdW5zaG90XCIsXG4gICAgICAgIFwiUGVyY3Vzc2lvblwiXG4gICAgfTtcbiAgICAgICAgLyogRW5kIEluc3RydW1lbnRzICovXG5cbiAgICAgICAgLyoqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIE1pZGkgZXZlbnQgKi9cbiAgICAgICAgcHJpdmF0ZSBzdHJpbmcgRXZlbnROYW1lKGludCBldilcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKGV2ID49IEV2ZW50Tm90ZU9mZiAmJiBldiA8IEV2ZW50Tm90ZU9mZiArIDE2KVxuICAgICAgICAgICAgICAgIHJldHVybiBcIk5vdGVPZmZcIjtcbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ID49IEV2ZW50Tm90ZU9uICYmIGV2IDwgRXZlbnROb3RlT24gKyAxNilcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJOb3RlT25cIjtcbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ID49IEV2ZW50S2V5UHJlc3N1cmUgJiYgZXYgPCBFdmVudEtleVByZXNzdXJlICsgMTYpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiS2V5UHJlc3N1cmVcIjtcbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ID49IEV2ZW50Q29udHJvbENoYW5nZSAmJiBldiA8IEV2ZW50Q29udHJvbENoYW5nZSArIDE2KVxuICAgICAgICAgICAgICAgIHJldHVybiBcIkNvbnRyb2xDaGFuZ2VcIjtcbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ID49IEV2ZW50UHJvZ3JhbUNoYW5nZSAmJiBldiA8IEV2ZW50UHJvZ3JhbUNoYW5nZSArIDE2KVxuICAgICAgICAgICAgICAgIHJldHVybiBcIlByb2dyYW1DaGFuZ2VcIjtcbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ID49IEV2ZW50Q2hhbm5lbFByZXNzdXJlICYmIGV2IDwgRXZlbnRDaGFubmVsUHJlc3N1cmUgKyAxNilcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJDaGFubmVsUHJlc3N1cmVcIjtcbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ID49IEV2ZW50UGl0Y2hCZW5kICYmIGV2IDwgRXZlbnRQaXRjaEJlbmQgKyAxNilcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJQaXRjaEJlbmRcIjtcbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ID09IE1ldGFFdmVudClcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJNZXRhRXZlbnRcIjtcbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ID09IFN5c2V4RXZlbnQxIHx8IGV2ID09IFN5c2V4RXZlbnQyKVxuICAgICAgICAgICAgICAgIHJldHVybiBcIlN5c2V4RXZlbnRcIjtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJVbmtub3duXCI7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWV0YS1ldmVudCAqL1xuICAgICAgICBwcml2YXRlIHN0cmluZyBNZXRhTmFtZShpbnQgZXYpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmIChldiA9PSBNZXRhRXZlbnRTZXF1ZW5jZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJNZXRhRXZlbnRTZXF1ZW5jZVwiO1xuICAgICAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50VGV4dClcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJNZXRhRXZlbnRUZXh0XCI7XG4gICAgICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRDb3B5cmlnaHQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50Q29weXJpZ2h0XCI7XG4gICAgICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRTZXF1ZW5jZU5hbWUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50U2VxdWVuY2VOYW1lXCI7XG4gICAgICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRJbnN0cnVtZW50KVxuICAgICAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudEluc3RydW1lbnRcIjtcbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ID09IE1ldGFFdmVudEx5cmljKVxuICAgICAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudEx5cmljXCI7XG4gICAgICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRNYXJrZXIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50TWFya2VyXCI7XG4gICAgICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRFbmRPZlRyYWNrKVxuICAgICAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudEVuZE9mVHJhY2tcIjtcbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ID09IE1ldGFFdmVudFRlbXBvKVxuICAgICAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudFRlbXBvXCI7XG4gICAgICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRTTVBURU9mZnNldClcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJNZXRhRXZlbnRTTVBURU9mZnNldFwiO1xuICAgICAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50VGltZVNpZ25hdHVyZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJNZXRhRXZlbnRUaW1lU2lnbmF0dXJlXCI7XG4gICAgICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRLZXlTaWduYXR1cmUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50S2V5U2lnbmF0dXJlXCI7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiVW5rbm93blwiO1xuICAgICAgICB9XG5cblxuICAgICAgICAvKiogR2V0IHRoZSBsaXN0IG9mIHRyYWNrcyAqL1xuICAgICAgICBwdWJsaWMgTGlzdDxNaWRpVHJhY2s+IFRyYWNrc1xuICAgICAgICB7XG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gdHJhY2tzOyB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiogR2V0IHRoZSB0aW1lIHNpZ25hdHVyZSAqL1xuICAgICAgICBwdWJsaWMgVGltZVNpZ25hdHVyZSBUaW1lXG4gICAgICAgIHtcbiAgICAgICAgICAgIGdldCB7IHJldHVybiB0aW1lc2lnOyB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiogR2V0IHRoZSBmaWxlIG5hbWUgKi9cbiAgICAgICAgcHVibGljIHN0cmluZyBGaWxlTmFtZVxuICAgICAgICB7XG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gZmlsZW5hbWU7IH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBHZXQgdGhlIHRvdGFsIGxlbmd0aCAoaW4gcHVsc2VzKSBvZiB0aGUgc29uZyAqL1xuICAgICAgICBwdWJsaWMgaW50IFRvdGFsUHVsc2VzXG4gICAgICAgIHtcbiAgICAgICAgICAgIGdldCB7IHJldHVybiB0b3RhbHB1bHNlczsgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBieXRlW10gUGFyc2VSaWZmRGF0YShieXRlW10gZGF0YSlcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIHJpZmZGaWxlID0gUmlmZlBhcnNlci5QYXJzZUJ5dGVBcnJheShkYXRhKTtcbiAgICAgICAgICAgIGlmIChyaWZmRmlsZS5GaWxlSW5mby5GaWxlVHlwZSAhPSBcIlJNSURcIilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdoaWxlIChyaWZmRmlsZS5SZWFkKChnbG9iYWw6Ok1pZGlTaGVldE11c2ljLlByb2Nlc3NFbGVtZW50KSgodHlwZSwgaXNMaXN0LCBjaHVuaykgPT5cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzTGlzdCAmJiB0eXBlLlRvTG93ZXIoKSA9PSBcImRhdGFcIilcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSBjaHVuay5HZXREYXRhKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpKSA7XG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBDcmVhdGUgYSBuZXcgTWlkaUZpbGUgZnJvbSB0aGUgYnl0ZVtdLiAqL1xuICAgICAgICBwdWJsaWMgTWlkaUZpbGUoYnl0ZVtdIGRhdGEsIHN0cmluZyB0aXRsZSlcbiAgICAgICAge1xuICAgICAgICAgICAgc3RyaW5nIGhlYWRlcjtcbiAgICAgICAgICAgIGlmIChSaWZmUGFyc2VyLklzUmlmZkZpbGUoZGF0YSwgb3V0IGhlYWRlcikpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IFBhcnNlUmlmZkRhdGEoZGF0YSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIE1pZGlGaWxlUmVhZGVyIGZpbGUgPSBuZXcgTWlkaUZpbGVSZWFkZXIoZGF0YSk7XG4gICAgICAgICAgICBpZiAodGl0bGUgPT0gbnVsbClcbiAgICAgICAgICAgICAgICB0aXRsZSA9IFwiXCI7XG4gICAgICAgICAgICBwYXJzZShmaWxlLCB0aXRsZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogUGFyc2UgdGhlIGdpdmVuIE1pZGkgZmlsZSwgYW5kIHJldHVybiBhbiBpbnN0YW5jZSBvZiB0aGlzIE1pZGlGaWxlXG4gICAgICAgICAqIGNsYXNzLiAgQWZ0ZXIgcmVhZGluZyB0aGUgbWlkaSBmaWxlLCB0aGlzIG9iamVjdCB3aWxsIGNvbnRhaW46XG4gICAgICAgICAqIC0gVGhlIHJhdyBsaXN0IG9mIG1pZGkgZXZlbnRzXG4gICAgICAgICAqIC0gVGhlIFRpbWUgU2lnbmF0dXJlIG9mIHRoZSBzb25nXG4gICAgICAgICAqIC0gQWxsIHRoZSB0cmFja3MgaW4gdGhlIHNvbmcgd2hpY2ggY29udGFpbiBub3Rlcy4gXG4gICAgICAgICAqIC0gVGhlIG51bWJlciwgc3RhcnR0aW1lLCBhbmQgZHVyYXRpb24gb2YgZWFjaCBub3RlLlxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIHZvaWQgcGFyc2UoTWlkaUZpbGVSZWFkZXIgZmlsZSwgc3RyaW5nIGZpbGVuYW1lKVxuICAgICAgICB7XG4gICAgICAgICAgICBzdHJpbmcgaWQ7XG4gICAgICAgICAgICBpbnQgbGVuO1xuXG4gICAgICAgICAgICB0aGlzLmZpbGVuYW1lID0gZmlsZW5hbWU7XG4gICAgICAgICAgICB0cmFja3MgPSBuZXcgTGlzdDxNaWRpVHJhY2s+KCk7XG4gICAgICAgICAgICB0cmFja1BlckNoYW5uZWwgPSBmYWxzZTtcblxuICAgICAgICAgICAgaWQgPSBmaWxlLlJlYWRBc2NpaSg0KTtcbiAgICAgICAgICAgIGlmIChpZCAhPSBcIk1UaGRcIilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXCJEb2Vzbid0IHN0YXJ0IHdpdGggTVRoZFwiLCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxlbiA9IGZpbGUuUmVhZEludCgpO1xuICAgICAgICAgICAgaWYgKGxlbiAhPSA2KVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNaWRpRmlsZUV4Y2VwdGlvbihcIkJhZCBNVGhkIGhlYWRlclwiLCA0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyYWNrbW9kZSA9IGZpbGUuUmVhZFNob3J0KCk7XG4gICAgICAgICAgICBpbnQgbnVtX3RyYWNrcyA9IGZpbGUuUmVhZFNob3J0KCk7XG4gICAgICAgICAgICBxdWFydGVybm90ZSA9IGZpbGUuUmVhZFNob3J0KCk7XG5cbiAgICAgICAgICAgIGV2ZW50cyA9IG5ldyBMaXN0PE1pZGlFdmVudD5bbnVtX3RyYWNrc107XG4gICAgICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgbnVtX3RyYWNrczsgdHJhY2tudW0rKylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBldmVudHNbdHJhY2tudW1dID0gUmVhZFRyYWNrKGZpbGUpO1xuICAgICAgICAgICAgICAgIE1pZGlUcmFjayB0cmFjayA9IG5ldyBNaWRpVHJhY2soZXZlbnRzW3RyYWNrbnVtXSwgdHJhY2tudW0pO1xuICAgICAgICAgICAgICAgIGlmICh0cmFjay5Ob3Rlcy5Db3VudCA+IDAgfHwgdHJhY2suTHlyaWNzICE9IG51bGwpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0cmFja3MuQWRkKHRyYWNrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIEdldCB0aGUgbGVuZ3RoIG9mIHRoZSBzb25nIGluIHB1bHNlcyAqL1xuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBNaWRpTm90ZSBsYXN0ID0gdHJhY2suTm90ZXNbdHJhY2suTm90ZXMuQ291bnQgLSAxXTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50b3RhbHB1bHNlcyA8IGxhc3QuU3RhcnRUaW1lICsgbGFzdC5EdXJhdGlvbilcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG90YWxwdWxzZXMgPSBsYXN0LlN0YXJ0VGltZSArIGxhc3QuRHVyYXRpb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBJZiB3ZSBvbmx5IGhhdmUgb25lIHRyYWNrIHdpdGggbXVsdGlwbGUgY2hhbm5lbHMsIHRoZW4gdHJlYXRcbiAgICAgICAgICAgICAqIGVhY2ggY2hhbm5lbCBhcyBhIHNlcGFyYXRlIHRyYWNrLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAodHJhY2tzLkNvdW50ID09IDEgJiYgSGFzTXVsdGlwbGVDaGFubmVscyh0cmFja3NbMF0pKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRyYWNrcyA9IFNwbGl0Q2hhbm5lbHModHJhY2tzWzBdLCBldmVudHNbdHJhY2tzWzBdLk51bWJlcl0pO1xuICAgICAgICAgICAgICAgIHRyYWNrUGVyQ2hhbm5lbCA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIENoZWNrU3RhcnRUaW1lcyh0cmFja3MpO1xuXG4gICAgICAgICAgICAvKiBEZXRlcm1pbmUgdGhlIHRpbWUgc2lnbmF0dXJlICovXG4gICAgICAgICAgICBpbnQgdGVtcG8gPSAwO1xuICAgICAgICAgICAgaW50IG51bWVyID0gMDtcbiAgICAgICAgICAgIGludCBkZW5vbSA9IDA7XG4gICAgICAgICAgICBmb3JlYWNoIChMaXN0PE1pZGlFdmVudD4gbGlzdCBpbiBldmVudHMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTWlkaUV2ZW50IG1ldmVudCBpbiBsaXN0KVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1ldmVudC5NZXRhZXZlbnQgPT0gTWV0YUV2ZW50VGVtcG8gJiYgdGVtcG8gPT0gMClcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcG8gPSBtZXZlbnQuVGVtcG87XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG1ldmVudC5NZXRhZXZlbnQgPT0gTWV0YUV2ZW50VGltZVNpZ25hdHVyZSAmJiBudW1lciA9PSAwKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBudW1lciA9IG1ldmVudC5OdW1lcmF0b3I7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZW5vbSA9IG1ldmVudC5EZW5vbWluYXRvcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0ZW1wbyA9PSAwKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRlbXBvID0gNTAwMDAwOyAvKiA1MDAsMDAwIG1pY3Jvc2Vjb25kcyA9IDAuMDUgc2VjICovXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobnVtZXIgPT0gMClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBudW1lciA9IDQ7IGRlbm9tID0gNDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRpbWVzaWcgPSBuZXcgVGltZVNpZ25hdHVyZShudW1lciwgZGVub20sIHF1YXJ0ZXJub3RlLCB0ZW1wbyk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogUGFyc2UgYSBzaW5nbGUgTWlkaSB0cmFjayBpbnRvIGEgbGlzdCBvZiBNaWRpRXZlbnRzLlxuICAgICAgICAgKiBFbnRlcmluZyB0aGlzIGZ1bmN0aW9uLCB0aGUgZmlsZSBvZmZzZXQgc2hvdWxkIGJlIGF0IHRoZSBzdGFydCBvZlxuICAgICAgICAgKiB0aGUgTVRyayBoZWFkZXIuICBVcG9uIGV4aXRpbmcsIHRoZSBmaWxlIG9mZnNldCBzaG91bGQgYmUgYXQgdGhlXG4gICAgICAgICAqIHN0YXJ0IG9mIHRoZSBuZXh0IE1UcmsgaGVhZGVyLlxuICAgICAgICAgKi9cbiAgICAgICAgcHJpdmF0ZSBMaXN0PE1pZGlFdmVudD4gUmVhZFRyYWNrKE1pZGlGaWxlUmVhZGVyIGZpbGUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIExpc3Q8TWlkaUV2ZW50PiByZXN1bHQgPSBuZXcgTGlzdDxNaWRpRXZlbnQ+KDIwKTtcbiAgICAgICAgICAgIGludCBzdGFydHRpbWUgPSAwO1xuICAgICAgICAgICAgc3RyaW5nIGlkID0gZmlsZS5SZWFkQXNjaWkoNCk7XG5cbiAgICAgICAgICAgIGlmIChpZCAhPSBcIk1UcmtcIilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXCJCYWQgTVRyayBoZWFkZXJcIiwgZmlsZS5HZXRPZmZzZXQoKSAtIDQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW50IHRyYWNrbGVuID0gZmlsZS5SZWFkSW50KCk7XG4gICAgICAgICAgICBpbnQgdHJhY2tlbmQgPSB0cmFja2xlbiArIGZpbGUuR2V0T2Zmc2V0KCk7XG5cbiAgICAgICAgICAgIGludCBldmVudGZsYWcgPSAwO1xuXG4gICAgICAgICAgICB3aGlsZSAoZmlsZS5HZXRPZmZzZXQoKSA8IHRyYWNrZW5kKVxuICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIG1pZGkgZmlsZSBpcyB0cnVuY2F0ZWQgaGVyZSwgd2UgY2FuIHN0aWxsIHJlY292ZXIuXG4gICAgICAgICAgICAgICAgLy8gSnVzdCByZXR1cm4gd2hhdCB3ZSd2ZSBwYXJzZWQgc28gZmFyLlxuXG4gICAgICAgICAgICAgICAgaW50IHN0YXJ0b2Zmc2V0LCBkZWx0YXRpbWU7XG4gICAgICAgICAgICAgICAgYnl0ZSBwZWVrZXZlbnQ7XG4gICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBzdGFydG9mZnNldCA9IGZpbGUuR2V0T2Zmc2V0KCk7XG4gICAgICAgICAgICAgICAgICAgIGRlbHRhdGltZSA9IGZpbGUuUmVhZFZhcmxlbigpO1xuICAgICAgICAgICAgICAgICAgICBzdGFydHRpbWUgKz0gZGVsdGF0aW1lO1xuICAgICAgICAgICAgICAgICAgICBwZWVrZXZlbnQgPSBmaWxlLlBlZWsoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKE1pZGlGaWxlRXhjZXB0aW9uKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBNaWRpRXZlbnQgbWV2ZW50ID0gbmV3IE1pZGlFdmVudCgpO1xuICAgICAgICAgICAgICAgIHJlc3VsdC5BZGQobWV2ZW50KTtcbiAgICAgICAgICAgICAgICBtZXZlbnQuRGVsdGFUaW1lID0gZGVsdGF0aW1lO1xuICAgICAgICAgICAgICAgIG1ldmVudC5TdGFydFRpbWUgPSBzdGFydHRpbWU7XG5cbiAgICAgICAgICAgICAgICBpZiAocGVla2V2ZW50ID49IEV2ZW50Tm90ZU9mZilcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5IYXNFdmVudGZsYWcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBldmVudGZsYWcgPSBmaWxlLlJlYWRCeXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gQ29uc29sZS5Xcml0ZUxpbmUoXCJvZmZzZXQgezB9OiBldmVudCB7MX0gezJ9IHN0YXJ0IHszfSBkZWx0YSB7NH1cIiwgXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgc3RhcnRvZmZzZXQsIGV2ZW50ZmxhZywgRXZlbnROYW1lKGV2ZW50ZmxhZyksIFxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgIHN0YXJ0dGltZSwgbWV2ZW50LkRlbHRhVGltZSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZXZlbnRmbGFnID49IEV2ZW50Tm90ZU9uICYmIGV2ZW50ZmxhZyA8IEV2ZW50Tm90ZU9uICsgMTYpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gRXZlbnROb3RlT247XG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5DaGFubmVsID0gKGJ5dGUpKGV2ZW50ZmxhZyAtIEV2ZW50Tm90ZU9uKTtcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50Lk5vdGVudW1iZXIgPSBmaWxlLlJlYWRCeXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5WZWxvY2l0eSA9IGZpbGUuUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZXZlbnRmbGFnID49IEV2ZW50Tm90ZU9mZiAmJiBldmVudGZsYWcgPCBFdmVudE5vdGVPZmYgKyAxNilcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPSBFdmVudE5vdGVPZmY7XG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5DaGFubmVsID0gKGJ5dGUpKGV2ZW50ZmxhZyAtIEV2ZW50Tm90ZU9mZik7XG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5Ob3RlbnVtYmVyID0gZmlsZS5SZWFkQnl0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuVmVsb2NpdHkgPSBmaWxlLlJlYWRCeXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGV2ZW50ZmxhZyA+PSBFdmVudEtleVByZXNzdXJlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRmbGFnIDwgRXZlbnRLZXlQcmVzc3VyZSArIDE2KVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IEV2ZW50S2V5UHJlc3N1cmU7XG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5DaGFubmVsID0gKGJ5dGUpKGV2ZW50ZmxhZyAtIEV2ZW50S2V5UHJlc3N1cmUpO1xuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuTm90ZW51bWJlciA9IGZpbGUuUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LktleVByZXNzdXJlID0gZmlsZS5SZWFkQnl0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChldmVudGZsYWcgPj0gRXZlbnRDb250cm9sQ2hhbmdlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRmbGFnIDwgRXZlbnRDb250cm9sQ2hhbmdlICsgMTYpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gRXZlbnRDb250cm9sQ2hhbmdlO1xuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuQ2hhbm5lbCA9IChieXRlKShldmVudGZsYWcgLSBFdmVudENvbnRyb2xDaGFuZ2UpO1xuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuQ29udHJvbE51bSA9IGZpbGUuUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkNvbnRyb2xWYWx1ZSA9IGZpbGUuUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZXZlbnRmbGFnID49IEV2ZW50UHJvZ3JhbUNoYW5nZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50ZmxhZyA8IEV2ZW50UHJvZ3JhbUNoYW5nZSArIDE2KVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IEV2ZW50UHJvZ3JhbUNoYW5nZTtcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkNoYW5uZWwgPSAoYnl0ZSkoZXZlbnRmbGFnIC0gRXZlbnRQcm9ncmFtQ2hhbmdlKTtcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50Lkluc3RydW1lbnQgPSBmaWxlLlJlYWRCeXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGV2ZW50ZmxhZyA+PSBFdmVudENoYW5uZWxQcmVzc3VyZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50ZmxhZyA8IEV2ZW50Q2hhbm5lbFByZXNzdXJlICsgMTYpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gRXZlbnRDaGFubmVsUHJlc3N1cmU7XG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5DaGFubmVsID0gKGJ5dGUpKGV2ZW50ZmxhZyAtIEV2ZW50Q2hhbm5lbFByZXNzdXJlKTtcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkNoYW5QcmVzc3VyZSA9IGZpbGUuUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZXZlbnRmbGFnID49IEV2ZW50UGl0Y2hCZW5kICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRmbGFnIDwgRXZlbnRQaXRjaEJlbmQgKyAxNilcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPSBFdmVudFBpdGNoQmVuZDtcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkNoYW5uZWwgPSAoYnl0ZSkoZXZlbnRmbGFnIC0gRXZlbnRQaXRjaEJlbmQpO1xuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuUGl0Y2hCZW5kID0gZmlsZS5SZWFkU2hvcnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZXZlbnRmbGFnID09IFN5c2V4RXZlbnQxKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IFN5c2V4RXZlbnQxO1xuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuTWV0YWxlbmd0aCA9IGZpbGUuUmVhZFZhcmxlbigpO1xuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuVmFsdWUgPSBmaWxlLlJlYWRCeXRlcyhtZXZlbnQuTWV0YWxlbmd0aCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGV2ZW50ZmxhZyA9PSBTeXNleEV2ZW50MilcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPSBTeXNleEV2ZW50MjtcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50Lk1ldGFsZW5ndGggPSBmaWxlLlJlYWRWYXJsZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LlZhbHVlID0gZmlsZS5SZWFkQnl0ZXMobWV2ZW50Lk1ldGFsZW5ndGgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChldmVudGZsYWcgPT0gTWV0YUV2ZW50KVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IE1ldGFFdmVudDtcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50Lk1ldGFldmVudCA9IGZpbGUuUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50Lk1ldGFsZW5ndGggPSBmaWxlLlJlYWRWYXJsZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LlZhbHVlID0gZmlsZS5SZWFkQnl0ZXMobWV2ZW50Lk1ldGFsZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobWV2ZW50Lk1ldGFldmVudCA9PSBNZXRhRXZlbnRUaW1lU2lnbmF0dXJlKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWV2ZW50Lk1ldGFsZW5ndGggPCAyKVxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRocm93IG5ldyBNaWRpRmlsZUV4Y2VwdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgXCJNZXRhIEV2ZW50IFRpbWUgU2lnbmF0dXJlIGxlbiA9PSBcIiArIG1ldmVudC5NZXRhbGVuZ3RoICArIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICBcIiAhPSA0XCIsIGZpbGUuR2V0T2Zmc2V0KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5OdW1lcmF0b3IgPSAoYnl0ZSkwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5EZW5vbWluYXRvciA9IChieXRlKTQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuTWV0YWxlbmd0aCA+PSAyICYmIG1ldmVudC5NZXRhbGVuZ3RoIDwgNClcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuTnVtZXJhdG9yID0gKGJ5dGUpbWV2ZW50LlZhbHVlWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5EZW5vbWluYXRvciA9IChieXRlKVN5c3RlbS5NYXRoLlBvdygyLCBtZXZlbnQuVmFsdWVbMV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5OdW1lcmF0b3IgPSAoYnl0ZSltZXZlbnQuVmFsdWVbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkRlbm9taW5hdG9yID0gKGJ5dGUpU3lzdGVtLk1hdGguUG93KDIsIG1ldmVudC5WYWx1ZVsxXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50Lk1ldGFldmVudCA9PSBNZXRhRXZlbnRUZW1wbylcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1ldmVudC5NZXRhbGVuZ3RoICE9IDMpXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1pZGlGaWxlRXhjZXB0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJNZXRhIEV2ZW50IFRlbXBvIGxlbiA9PSBcIiArIG1ldmVudC5NZXRhbGVuZ3RoICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiICE9IDNcIiwgZmlsZS5HZXRPZmZzZXQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuVGVtcG8gPSAoKG1ldmVudC5WYWx1ZVswXSA8PCAxNikgfCAobWV2ZW50LlZhbHVlWzFdIDw8IDgpIHwgbWV2ZW50LlZhbHVlWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuTWV0YWV2ZW50ID09IE1ldGFFdmVudEVuZE9mVHJhY2spXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGJyZWFrOyAgKi9cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXCJVbmtub3duIGV2ZW50IFwiICsgbWV2ZW50LkV2ZW50RmxhZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLkdldE9mZnNldCgpIC0gMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqIFJldHVybiB0cnVlIGlmIHRoaXMgdHJhY2sgY29udGFpbnMgbXVsdGlwbGUgY2hhbm5lbHMuXG4gICAgICAgICAqIElmIGEgTWlkaUZpbGUgY29udGFpbnMgb25seSBvbmUgdHJhY2ssIGFuZCBpdCBoYXMgbXVsdGlwbGUgY2hhbm5lbHMsXG4gICAgICAgICAqIHRoZW4gd2UgdHJlYXQgZWFjaCBjaGFubmVsIGFzIGEgc2VwYXJhdGUgdHJhY2suXG4gICAgICAgICAqL1xuICAgICAgICBzdGF0aWMgYm9vbCBIYXNNdWx0aXBsZUNoYW5uZWxzKE1pZGlUcmFjayB0cmFjaylcbiAgICAgICAge1xuICAgICAgICAgICAgaW50IGNoYW5uZWwgPSB0cmFjay5Ob3Rlc1swXS5DaGFubmVsO1xuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiB0cmFjay5Ob3RlcylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAobm90ZS5DaGFubmVsICE9IGNoYW5uZWwpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogV3JpdGUgYSB2YXJpYWJsZSBsZW5ndGggbnVtYmVyIHRvIHRoZSBidWZmZXIgYXQgdGhlIGdpdmVuIG9mZnNldC5cbiAgICAgICAgICogUmV0dXJuIHRoZSBudW1iZXIgb2YgYnl0ZXMgd3JpdHRlbi5cbiAgICAgICAgICovXG4gICAgICAgIHN0YXRpYyBpbnQgVmFybGVuVG9CeXRlcyhpbnQgbnVtLCBieXRlW10gYnVmLCBpbnQgb2Zmc2V0KVxuICAgICAgICB7XG4gICAgICAgICAgICBieXRlIGIxID0gKGJ5dGUpKChudW0gPj4gMjEpICYgMHg3Rik7XG4gICAgICAgICAgICBieXRlIGIyID0gKGJ5dGUpKChudW0gPj4gMTQpICYgMHg3Rik7XG4gICAgICAgICAgICBieXRlIGIzID0gKGJ5dGUpKChudW0gPj4gNykgJiAweDdGKTtcbiAgICAgICAgICAgIGJ5dGUgYjQgPSAoYnl0ZSkobnVtICYgMHg3Rik7XG5cbiAgICAgICAgICAgIGlmIChiMSA+IDApXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYnVmW29mZnNldF0gPSAoYnl0ZSkoYjEgfCAweDgwKTtcbiAgICAgICAgICAgICAgICBidWZbb2Zmc2V0ICsgMV0gPSAoYnl0ZSkoYjIgfCAweDgwKTtcbiAgICAgICAgICAgICAgICBidWZbb2Zmc2V0ICsgMl0gPSAoYnl0ZSkoYjMgfCAweDgwKTtcbiAgICAgICAgICAgICAgICBidWZbb2Zmc2V0ICsgM10gPSBiNDtcbiAgICAgICAgICAgICAgICByZXR1cm4gNDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGIyID4gMClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBidWZbb2Zmc2V0XSA9IChieXRlKShiMiB8IDB4ODApO1xuICAgICAgICAgICAgICAgIGJ1ZltvZmZzZXQgKyAxXSA9IChieXRlKShiMyB8IDB4ODApO1xuICAgICAgICAgICAgICAgIGJ1ZltvZmZzZXQgKyAyXSA9IGI0O1xuICAgICAgICAgICAgICAgIHJldHVybiAzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoYjMgPiAwKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJ1ZltvZmZzZXRdID0gKGJ5dGUpKGIzIHwgMHg4MCk7XG4gICAgICAgICAgICAgICAgYnVmW29mZnNldCArIDFdID0gYjQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYnVmW29mZnNldF0gPSBiNDtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBXcml0ZSBhIDQtYnl0ZSBpbnRlZ2VyIHRvIGRhdGFbb2Zmc2V0IDogb2Zmc2V0KzRdICovXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgSW50VG9CeXRlcyhpbnQgdmFsdWUsIGJ5dGVbXSBkYXRhLCBpbnQgb2Zmc2V0KVxuICAgICAgICB7XG4gICAgICAgICAgICBkYXRhW29mZnNldF0gPSAoYnl0ZSkoKHZhbHVlID4+IDI0KSAmIDB4RkYpO1xuICAgICAgICAgICAgZGF0YVtvZmZzZXQgKyAxXSA9IChieXRlKSgodmFsdWUgPj4gMTYpICYgMHhGRik7XG4gICAgICAgICAgICBkYXRhW29mZnNldCArIDJdID0gKGJ5dGUpKCh2YWx1ZSA+PiA4KSAmIDB4RkYpO1xuICAgICAgICAgICAgZGF0YVtvZmZzZXQgKyAzXSA9IChieXRlKSh2YWx1ZSAmIDB4RkYpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqIENhbGN1bGF0ZSB0aGUgdHJhY2sgbGVuZ3RoIChpbiBieXRlcykgZ2l2ZW4gYSBsaXN0IG9mIE1pZGkgZXZlbnRzICovXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGludCBHZXRUcmFja0xlbmd0aChMaXN0PE1pZGlFdmVudD4gZXZlbnRzKVxuICAgICAgICB7XG4gICAgICAgICAgICBpbnQgbGVuID0gMDtcbiAgICAgICAgICAgIGJ5dGVbXSBidWYgPSBuZXcgYnl0ZVsxMDI0XTtcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBtZXZlbnQgaW4gZXZlbnRzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxlbiArPSBWYXJsZW5Ub0J5dGVzKG1ldmVudC5EZWx0YVRpbWUsIGJ1ZiwgMCk7XG4gICAgICAgICAgICAgICAgbGVuICs9IDE7ICAvKiBmb3IgZXZlbnRmbGFnICovXG4gICAgICAgICAgICAgICAgc3dpdGNoIChtZXZlbnQuRXZlbnRGbGFnKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBFdmVudE5vdGVPbjogbGVuICs9IDI7IGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEV2ZW50Tm90ZU9mZjogbGVuICs9IDI7IGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEV2ZW50S2V5UHJlc3N1cmU6IGxlbiArPSAyOyBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBFdmVudENvbnRyb2xDaGFuZ2U6IGxlbiArPSAyOyBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBFdmVudFByb2dyYW1DaGFuZ2U6IGxlbiArPSAxOyBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBFdmVudENoYW5uZWxQcmVzc3VyZTogbGVuICs9IDE7IGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEV2ZW50UGl0Y2hCZW5kOiBsZW4gKz0gMjsgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBTeXNleEV2ZW50MTpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBTeXNleEV2ZW50MjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbiArPSBWYXJsZW5Ub0J5dGVzKG1ldmVudC5NZXRhbGVuZ3RoLCBidWYsIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGVuICs9IG1ldmVudC5NZXRhbGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgTWV0YUV2ZW50OlxuICAgICAgICAgICAgICAgICAgICAgICAgbGVuICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZW4gKz0gVmFybGVuVG9CeXRlcyhtZXZlbnQuTWV0YWxlbmd0aCwgYnVmLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbiArPSBtZXZlbnQuTWV0YWxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbGVuO1xuICAgICAgICB9XG5cblxuICAgICAgICAvKiogV3JpdGUgdGhlIGdpdmVuIGxpc3Qgb2YgTWlkaSBldmVudHMgdG8gYSBzdHJlYW0vZmlsZS5cbiAgICAgICAgICogIFRoaXMgbWV0aG9kIGlzIHVzZWQgZm9yIHNvdW5kIHBsYXliYWNrLCBmb3IgY3JlYXRpbmcgbmV3IE1pZGkgZmlsZXNcbiAgICAgICAgICogIHdpdGggdGhlIHRlbXBvLCB0cmFuc3Bvc2UsIGV0YyBjaGFuZ2VkLlxuICAgICAgICAgKlxuICAgICAgICAgKiAgUmV0dXJuIHRydWUgb24gc3VjY2VzcywgYW5kIGZhbHNlIG9uIGVycm9yLlxuICAgICAgICAgKi9cbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgYm9vbFxuICAgICAgICBXcml0ZUV2ZW50cyhTdHJlYW0gZmlsZSwgTGlzdDxNaWRpRXZlbnQ+W10gZXZlbnRzLCBpbnQgdHJhY2ttb2RlLCBpbnQgcXVhcnRlcilcbiAgICAgICAge1xuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYnl0ZVtdIGJ1ZiA9IG5ldyBieXRlWzY1NTM2XTtcblxuICAgICAgICAgICAgICAgIC8qIFdyaXRlIHRoZSBNVGhkLCBsZW4gPSA2LCB0cmFjayBtb2RlLCBudW1iZXIgdHJhY2tzLCBxdWFydGVyIG5vdGUgKi9cbiAgICAgICAgICAgICAgICBmaWxlLldyaXRlKEFTQ0lJRW5jb2RpbmcuQVNDSUkuR2V0Qnl0ZXMoXCJNVGhkXCIpLCAwLCA0KTtcbiAgICAgICAgICAgICAgICBJbnRUb0J5dGVzKDYsIGJ1ZiwgMCk7XG4gICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDQpO1xuICAgICAgICAgICAgICAgIGJ1ZlswXSA9IChieXRlKSh0cmFja21vZGUgPj4gOCk7XG4gICAgICAgICAgICAgICAgYnVmWzFdID0gKGJ5dGUpKHRyYWNrbW9kZSAmIDB4RkYpO1xuICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCAyKTtcbiAgICAgICAgICAgICAgICBidWZbMF0gPSAwO1xuICAgICAgICAgICAgICAgIGJ1ZlsxXSA9IChieXRlKWV2ZW50cy5MZW5ndGg7XG4gICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDIpO1xuICAgICAgICAgICAgICAgIGJ1ZlswXSA9IChieXRlKShxdWFydGVyID4+IDgpO1xuICAgICAgICAgICAgICAgIGJ1ZlsxXSA9IChieXRlKShxdWFydGVyICYgMHhGRik7XG4gICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDIpO1xuXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTGlzdDxNaWRpRXZlbnQ+IGxpc3QgaW4gZXZlbnRzKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgLyogV3JpdGUgdGhlIE1UcmsgaGVhZGVyIGFuZCB0cmFjayBsZW5ndGggKi9cbiAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShBU0NJSUVuY29kaW5nLkFTQ0lJLkdldEJ5dGVzKFwiTVRya1wiKSwgMCwgNCk7XG4gICAgICAgICAgICAgICAgICAgIGludCBsZW4gPSBHZXRUcmFja0xlbmd0aChsaXN0KTtcbiAgICAgICAgICAgICAgICAgICAgSW50VG9CeXRlcyhsZW4sIGJ1ZiwgMCk7XG4gICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCA0KTtcblxuICAgICAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbWV2ZW50IGluIGxpc3QpXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludCB2YXJsZW4gPSBWYXJsZW5Ub0J5dGVzKG1ldmVudC5EZWx0YVRpbWUsIGJ1ZiwgMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgdmFybGVuKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gU3lzZXhFdmVudDEgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID09IFN5c2V4RXZlbnQyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9PSBNZXRhRXZlbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gbWV2ZW50LkV2ZW50RmxhZztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWZbMF0gPSAoYnl0ZSkobWV2ZW50LkV2ZW50RmxhZyArIG1ldmVudC5DaGFubmVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCAxKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnROb3RlT24pXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gbWV2ZW50Lk5vdGVudW1iZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzFdID0gbWV2ZW50LlZlbG9jaXR5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnROb3RlT2ZmKVxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IG1ldmVudC5Ob3RlbnVtYmVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlsxXSA9IG1ldmVudC5WZWxvY2l0eTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgMik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IEV2ZW50S2V5UHJlc3N1cmUpXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gbWV2ZW50Lk5vdGVudW1iZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzFdID0gbWV2ZW50LktleVByZXNzdXJlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnRDb250cm9sQ2hhbmdlKVxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IG1ldmVudC5Db250cm9sTnVtO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlsxXSA9IG1ldmVudC5Db250cm9sVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudFByb2dyYW1DaGFuZ2UpXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gbWV2ZW50Lkluc3RydW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudENoYW5uZWxQcmVzc3VyZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWZbMF0gPSBtZXZlbnQuQ2hhblByZXNzdXJlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnRQaXRjaEJlbmQpXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gKGJ5dGUpKG1ldmVudC5QaXRjaEJlbmQgPj4gOCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzFdID0gKGJ5dGUpKG1ldmVudC5QaXRjaEJlbmQgJiAweEZGKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgMik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IFN5c2V4RXZlbnQxKVxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludCBvZmZzZXQgPSBWYXJsZW5Ub0J5dGVzKG1ldmVudC5NZXRhbGVuZ3RoLCBidWYsIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LkNvcHkobWV2ZW50LlZhbHVlLCAwLCBidWYsIG9mZnNldCwgbWV2ZW50LlZhbHVlLkxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIG9mZnNldCArIG1ldmVudC5WYWx1ZS5MZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBTeXNleEV2ZW50MilcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnQgb2Zmc2V0ID0gVmFybGVuVG9CeXRlcyhtZXZlbnQuTWV0YWxlbmd0aCwgYnVmLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBBcnJheS5Db3B5KG1ldmVudC5WYWx1ZSwgMCwgYnVmLCBvZmZzZXQsIG1ldmVudC5WYWx1ZS5MZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCBvZmZzZXQgKyBtZXZlbnQuVmFsdWUuTGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gTWV0YUV2ZW50ICYmIG1ldmVudC5NZXRhZXZlbnQgPT0gTWV0YUV2ZW50VGVtcG8pXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gbWV2ZW50Lk1ldGFldmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWZbMV0gPSAzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlsyXSA9IChieXRlKSgobWV2ZW50LlRlbXBvID4+IDE2KSAmIDB4RkYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlszXSA9IChieXRlKSgobWV2ZW50LlRlbXBvID4+IDgpICYgMHhGRik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzRdID0gKGJ5dGUpKG1ldmVudC5UZW1wbyAmIDB4RkYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCA1KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gTWV0YUV2ZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IG1ldmVudC5NZXRhZXZlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50IG9mZnNldCA9IFZhcmxlblRvQnl0ZXMobWV2ZW50Lk1ldGFsZW5ndGgsIGJ1ZiwgMSkgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LkNvcHkobWV2ZW50LlZhbHVlLCAwLCBidWYsIG9mZnNldCwgbWV2ZW50LlZhbHVlLkxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIG9mZnNldCArIG1ldmVudC5WYWx1ZS5MZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbGUuQ2xvc2UoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChJT0V4Y2VwdGlvbilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8qKiBDbG9uZSB0aGUgbGlzdCBvZiBNaWRpRXZlbnRzICovXG4gICAgICAgIHByaXZhdGUgc3RhdGljIExpc3Q8TWlkaUV2ZW50PltdIENsb25lTWlkaUV2ZW50cyhMaXN0PE1pZGlFdmVudD5bXSBvcmlnbGlzdClcbiAgICAgICAge1xuICAgICAgICAgICAgTGlzdDxNaWRpRXZlbnQ+W10gbmV3bGlzdCA9IG5ldyBMaXN0PE1pZGlFdmVudD5bb3JpZ2xpc3QuTGVuZ3RoXTtcbiAgICAgICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCBvcmlnbGlzdC5MZW5ndGg7IHRyYWNrbnVtKyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgTGlzdDxNaWRpRXZlbnQ+IG9yaWdldmVudHMgPSBvcmlnbGlzdFt0cmFja251bV07XG4gICAgICAgICAgICAgICAgTGlzdDxNaWRpRXZlbnQ+IG5ld2V2ZW50cyA9IG5ldyBMaXN0PE1pZGlFdmVudD4ob3JpZ2V2ZW50cy5Db3VudCk7XG4gICAgICAgICAgICAgICAgbmV3bGlzdFt0cmFja251bV0gPSBuZXdldmVudHM7XG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTWlkaUV2ZW50IG1ldmVudCBpbiBvcmlnZXZlbnRzKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3ZXZlbnRzLkFkZChtZXZlbnQuQ2xvbmUoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5ld2xpc3Q7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogQ3JlYXRlIGEgbmV3IE1pZGkgdGVtcG8gZXZlbnQsIHdpdGggdGhlIGdpdmVuIHRlbXBvICAqL1xuICAgICAgICBwcml2YXRlIHN0YXRpYyBNaWRpRXZlbnQgQ3JlYXRlVGVtcG9FdmVudChpbnQgdGVtcG8pXG4gICAgICAgIHtcbiAgICAgICAgICAgIE1pZGlFdmVudCBtZXZlbnQgPSBuZXcgTWlkaUV2ZW50KCk7XG4gICAgICAgICAgICBtZXZlbnQuRGVsdGFUaW1lID0gMDtcbiAgICAgICAgICAgIG1ldmVudC5TdGFydFRpbWUgPSAwO1xuICAgICAgICAgICAgbWV2ZW50Lkhhc0V2ZW50ZmxhZyA9IHRydWU7XG4gICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gTWV0YUV2ZW50O1xuICAgICAgICAgICAgbWV2ZW50Lk1ldGFldmVudCA9IE1ldGFFdmVudFRlbXBvO1xuICAgICAgICAgICAgbWV2ZW50Lk1ldGFsZW5ndGggPSAzO1xuICAgICAgICAgICAgbWV2ZW50LlRlbXBvID0gdGVtcG87XG4gICAgICAgICAgICByZXR1cm4gbWV2ZW50O1xuICAgICAgICB9XG5cblxuICAgICAgICAvKiogU2VhcmNoIHRoZSBldmVudHMgZm9yIGEgQ29udHJvbENoYW5nZSBldmVudCB3aXRoIHRoZSBzYW1lXG4gICAgICAgICAqICBjaGFubmVsIGFuZCBjb250cm9sIG51bWJlci4gIElmIGEgbWF0Y2hpbmcgZXZlbnQgaXMgZm91bmQsXG4gICAgICAgICAqICAgdXBkYXRlIHRoZSBjb250cm9sIHZhbHVlLiAgRWxzZSwgYWRkIGEgbmV3IENvbnRyb2xDaGFuZ2UgZXZlbnQuXG4gICAgICAgICAqL1xuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkXG4gICAgICAgIFVwZGF0ZUNvbnRyb2xDaGFuZ2UoTGlzdDxNaWRpRXZlbnQ+IG5ld2V2ZW50cywgTWlkaUV2ZW50IGNoYW5nZUV2ZW50KVxuICAgICAgICB7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbWV2ZW50IGluIG5ld2V2ZW50cylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAoKG1ldmVudC5FdmVudEZsYWcgPT0gY2hhbmdlRXZlbnQuRXZlbnRGbGFnKSAmJlxuICAgICAgICAgICAgICAgICAgICAobWV2ZW50LkNoYW5uZWwgPT0gY2hhbmdlRXZlbnQuQ2hhbm5lbCkgJiZcbiAgICAgICAgICAgICAgICAgICAgKG1ldmVudC5Db250cm9sTnVtID09IGNoYW5nZUV2ZW50LkNvbnRyb2xOdW0pKVxuICAgICAgICAgICAgICAgIHtcblxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuQ29udHJvbFZhbHVlID0gY2hhbmdlRXZlbnQuQ29udHJvbFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbmV3ZXZlbnRzLkFkZChjaGFuZ2VFdmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogU3RhcnQgdGhlIE1pZGkgbXVzaWMgYXQgdGhlIGdpdmVuIHBhdXNlIHRpbWUgKGluIHB1bHNlcykuXG4gICAgICAgICAqICBSZW1vdmUgYW55IE5vdGVPbi9Ob3RlT2ZmIGV2ZW50cyB0aGF0IG9jY3VyIGJlZm9yZSB0aGUgcGF1c2UgdGltZS5cbiAgICAgICAgICogIEZvciBvdGhlciBldmVudHMsIGNoYW5nZSB0aGUgZGVsdGEtdGltZSB0byAwIGlmIHRoZXkgb2NjdXJcbiAgICAgICAgICogIGJlZm9yZSB0aGUgcGF1c2UgdGltZS4gIFJldHVybiB0aGUgbW9kaWZpZWQgTWlkaSBFdmVudHMuXG4gICAgICAgICAqL1xuICAgICAgICBwcml2YXRlIHN0YXRpYyBMaXN0PE1pZGlFdmVudD5bXVxuICAgICAgICBTdGFydEF0UGF1c2VUaW1lKExpc3Q8TWlkaUV2ZW50PltdIGxpc3QsIGludCBwYXVzZVRpbWUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIExpc3Q8TWlkaUV2ZW50PltdIG5ld2xpc3QgPSBuZXcgTGlzdDxNaWRpRXZlbnQ+W2xpc3QuTGVuZ3RoXTtcbiAgICAgICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCBsaXN0Lkxlbmd0aDsgdHJhY2tudW0rKylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBMaXN0PE1pZGlFdmVudD4gZXZlbnRzID0gbGlzdFt0cmFja251bV07XG4gICAgICAgICAgICAgICAgTGlzdDxNaWRpRXZlbnQ+IG5ld2V2ZW50cyA9IG5ldyBMaXN0PE1pZGlFdmVudD4oZXZlbnRzLkNvdW50KTtcbiAgICAgICAgICAgICAgICBuZXdsaXN0W3RyYWNrbnVtXSA9IG5ld2V2ZW50cztcblxuICAgICAgICAgICAgICAgIGJvb2wgZm91bmRFdmVudEFmdGVyUGF1c2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbWV2ZW50IGluIGV2ZW50cylcbiAgICAgICAgICAgICAgICB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG1ldmVudC5TdGFydFRpbWUgPCBwYXVzZVRpbWUpXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IEV2ZW50Tm90ZU9uIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudE5vdGVPZmYpXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBTa2lwIE5vdGVPbi9Ob3RlT2ZmIGV2ZW50ICovXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IEV2ZW50Q29udHJvbENoYW5nZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRGVsdGFUaW1lID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBVcGRhdGVDb250cm9sQ2hhbmdlKG5ld2V2ZW50cywgbWV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRGVsdGFUaW1lID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdldmVudHMuQWRkKG1ldmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoIWZvdW5kRXZlbnRBZnRlclBhdXNlKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRGVsdGFUaW1lID0gKG1ldmVudC5TdGFydFRpbWUgLSBwYXVzZVRpbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3ZXZlbnRzLkFkZChtZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmRFdmVudEFmdGVyUGF1c2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3ZXZlbnRzLkFkZChtZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5ld2xpc3Q7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8qKiBXcml0ZSB0aGlzIE1pZGkgZmlsZSB0byB0aGUgZ2l2ZW4gZmlsZW5hbWUuXG4gICAgICAgICAqIElmIG9wdGlvbnMgaXMgbm90IG51bGwsIGFwcGx5IHRob3NlIG9wdGlvbnMgdG8gdGhlIG1pZGkgZXZlbnRzXG4gICAgICAgICAqIGJlZm9yZSBwZXJmb3JtaW5nIHRoZSB3cml0ZS5cbiAgICAgICAgICogUmV0dXJuIHRydWUgaWYgdGhlIGZpbGUgd2FzIHNhdmVkIHN1Y2Nlc3NmdWxseSwgZWxzZSBmYWxzZS5cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBib29sIENoYW5nZVNvdW5kKHN0cmluZyBkZXN0ZmlsZSwgTWlkaU9wdGlvbnMgb3B0aW9ucylcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIFdyaXRlKGRlc3RmaWxlLCBvcHRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBib29sIFdyaXRlKHN0cmluZyBkZXN0ZmlsZSwgTWlkaU9wdGlvbnMgb3B0aW9ucylcbiAgICAgICAge1xuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgRmlsZVN0cmVhbSBzdHJlYW07XG4gICAgICAgICAgICAgICAgc3RyZWFtID0gbmV3IEZpbGVTdHJlYW0oZGVzdGZpbGUsIEZpbGVNb2RlLkNyZWF0ZSk7XG4gICAgICAgICAgICAgICAgYm9vbCByZXN1bHQgPSBXcml0ZShzdHJlYW0sIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHN0cmVhbS5DbG9zZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoSU9FeGNlcHRpb24pXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqIFdyaXRlIHRoaXMgTWlkaSBmaWxlIHRvIHRoZSBnaXZlbiBzdHJlYW0uXG4gICAgICAgICAqIElmIG9wdGlvbnMgaXMgbm90IG51bGwsIGFwcGx5IHRob3NlIG9wdGlvbnMgdG8gdGhlIG1pZGkgZXZlbnRzXG4gICAgICAgICAqIGJlZm9yZSBwZXJmb3JtaW5nIHRoZSB3cml0ZS5cbiAgICAgICAgICogUmV0dXJuIHRydWUgaWYgdGhlIGZpbGUgd2FzIHNhdmVkIHN1Y2Nlc3NmdWxseSwgZWxzZSBmYWxzZS5cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBib29sIFdyaXRlKFN0cmVhbSBzdHJlYW0sIE1pZGlPcHRpb25zIG9wdGlvbnMpXG4gICAgICAgIHtcbiAgICAgICAgICAgIExpc3Q8TWlkaUV2ZW50PltdIG5ld2V2ZW50cyA9IGV2ZW50cztcbiAgICAgICAgICAgIGlmIChvcHRpb25zICE9IG51bGwpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmV3ZXZlbnRzID0gQXBwbHlPcHRpb25zVG9FdmVudHMob3B0aW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gV3JpdGVFdmVudHMoc3RyZWFtLCBuZXdldmVudHMsIHRyYWNrbW9kZSwgcXVhcnRlcm5vdGUpO1xuICAgICAgICB9XG5cblxuICAgICAgICAvKiBBcHBseSB0aGUgZm9sbG93aW5nIHNvdW5kIG9wdGlvbnMgdG8gdGhlIG1pZGkgZXZlbnRzOlxuICAgICAgICAgKiAtIFRoZSB0ZW1wbyAodGhlIG1pY3Jvc2Vjb25kcyBwZXIgcHVsc2UpXG4gICAgICAgICAqIC0gVGhlIGluc3RydW1lbnRzIHBlciB0cmFja1xuICAgICAgICAgKiAtIFRoZSBub3RlIG51bWJlciAodHJhbnNwb3NlIHZhbHVlKVxuICAgICAgICAgKiAtIFRoZSB0cmFja3MgdG8gaW5jbHVkZVxuICAgICAgICAgKiBSZXR1cm4gdGhlIG1vZGlmaWVkIGxpc3Qgb2YgbWlkaSBldmVudHMuXG4gICAgICAgICAqL1xuICAgICAgICBwcml2YXRlIExpc3Q8TWlkaUV2ZW50PltdXG4gICAgICAgIEFwcGx5T3B0aW9uc1RvRXZlbnRzKE1pZGlPcHRpb25zIG9wdGlvbnMpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGludCBpO1xuICAgICAgICAgICAgaWYgKHRyYWNrUGVyQ2hhbm5lbClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXBwbHlPcHRpb25zUGVyQ2hhbm5lbChvcHRpb25zKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogQSBtaWRpZmlsZSBjYW4gY29udGFpbiB0cmFja3Mgd2l0aCBub3RlcyBhbmQgdHJhY2tzIHdpdGhvdXQgbm90ZXMuXG4gICAgICAgICAgICAgKiBUaGUgb3B0aW9ucy50cmFja3MgYW5kIG9wdGlvbnMuaW5zdHJ1bWVudHMgYXJlIGZvciB0cmFja3Mgd2l0aCBub3Rlcy5cbiAgICAgICAgICAgICAqIFNvIHRoZSB0cmFjayBudW1iZXJzIGluICdvcHRpb25zJyBtYXkgbm90IG1hdGNoIGNvcnJlY3RseSBpZiB0aGVcbiAgICAgICAgICAgICAqIG1pZGkgZmlsZSBoYXMgdHJhY2tzIHdpdGhvdXQgbm90ZXMuIFJlLWNvbXB1dGUgdGhlIGluc3RydW1lbnRzLCBhbmQgXG4gICAgICAgICAgICAgKiB0cmFja3MgdG8ga2VlcC5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaW50IG51bV90cmFja3MgPSBldmVudHMuTGVuZ3RoO1xuICAgICAgICAgICAgaW50W10gaW5zdHJ1bWVudHMgPSBuZXcgaW50W251bV90cmFja3NdO1xuICAgICAgICAgICAgYm9vbFtdIGtlZXB0cmFja3MgPSBuZXcgYm9vbFtudW1fdHJhY2tzXTtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBudW1fdHJhY2tzOyBpKyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaW5zdHJ1bWVudHNbaV0gPSAwO1xuICAgICAgICAgICAgICAgIGtlZXB0cmFja3NbaV0gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IHRyYWNrcy5Db3VudDsgdHJhY2tudW0rKylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBNaWRpVHJhY2sgdHJhY2sgPSB0cmFja3NbdHJhY2tudW1dO1xuICAgICAgICAgICAgICAgIGludCByZWFsdHJhY2sgPSB0cmFjay5OdW1iZXI7XG4gICAgICAgICAgICAgICAgaW5zdHJ1bWVudHNbcmVhbHRyYWNrXSA9IG9wdGlvbnMuaW5zdHJ1bWVudHNbdHJhY2tudW1dO1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLm11dGVbdHJhY2tudW1dID09IHRydWUpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBrZWVwdHJhY2tzW3JlYWx0cmFja10gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIExpc3Q8TWlkaUV2ZW50PltdIG5ld2V2ZW50cyA9IENsb25lTWlkaUV2ZW50cyhldmVudHMpO1xuXG4gICAgICAgICAgICAvKiBTZXQgdGhlIHRlbXBvIGF0IHRoZSBiZWdpbm5pbmcgb2YgZWFjaCB0cmFjayAqL1xuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IG5ld2V2ZW50cy5MZW5ndGg7IHRyYWNrbnVtKyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgTWlkaUV2ZW50IG1ldmVudCA9IENyZWF0ZVRlbXBvRXZlbnQob3B0aW9ucy50ZW1wbyk7XG4gICAgICAgICAgICAgICAgbmV3ZXZlbnRzW3RyYWNrbnVtXS5JbnNlcnQoMCwgbWV2ZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogQ2hhbmdlIHRoZSBub3RlIG51bWJlciAodHJhbnNwb3NlKSwgaW5zdHJ1bWVudCwgYW5kIHRlbXBvICovXG4gICAgICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgbmV3ZXZlbnRzLkxlbmd0aDsgdHJhY2tudW0rKylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbWV2ZW50IGluIG5ld2V2ZW50c1t0cmFja251bV0pXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpbnQgbnVtID0gbWV2ZW50Lk5vdGVudW1iZXIgKyBvcHRpb25zLnRyYW5zcG9zZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG51bSA8IDApXG4gICAgICAgICAgICAgICAgICAgICAgICBudW0gPSAwO1xuICAgICAgICAgICAgICAgICAgICBpZiAobnVtID4gMTI3KVxuICAgICAgICAgICAgICAgICAgICAgICAgbnVtID0gMTI3O1xuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuTm90ZW51bWJlciA9IChieXRlKW51bTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFvcHRpb25zLnVzZURlZmF1bHRJbnN0cnVtZW50cylcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50Lkluc3RydW1lbnQgPSAoYnl0ZSlpbnN0cnVtZW50c1t0cmFja251bV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LlRlbXBvID0gb3B0aW9ucy50ZW1wbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLnBhdXNlVGltZSAhPSAwKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5ld2V2ZW50cyA9IFN0YXJ0QXRQYXVzZVRpbWUobmV3ZXZlbnRzLCBvcHRpb25zLnBhdXNlVGltZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIENoYW5nZSB0aGUgdHJhY2tzIHRvIGluY2x1ZGUgKi9cbiAgICAgICAgICAgIGludCBjb3VudCA9IDA7XG4gICAgICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwga2VlcHRyYWNrcy5MZW5ndGg7IHRyYWNrbnVtKyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKGtlZXB0cmFja3NbdHJhY2tudW1dKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBMaXN0PE1pZGlFdmVudD5bXSByZXN1bHQgPSBuZXcgTGlzdDxNaWRpRXZlbnQ+W2NvdW50XTtcbiAgICAgICAgICAgIGkgPSAwO1xuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IGtlZXB0cmFja3MuTGVuZ3RoOyB0cmFja251bSsrKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmIChrZWVwdHJhY2tzW3RyYWNrbnVtXSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtpXSA9IG5ld2V2ZW50c1t0cmFja251bV07XG4gICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG5cbiAgICAgICAgLyogQXBwbHkgdGhlIGZvbGxvd2luZyBzb3VuZCBvcHRpb25zIHRvIHRoZSBtaWRpIGV2ZW50czpcbiAgICAgICAgICogLSBUaGUgdGVtcG8gKHRoZSBtaWNyb3NlY29uZHMgcGVyIHB1bHNlKVxuICAgICAgICAgKiAtIFRoZSBpbnN0cnVtZW50cyBwZXIgdHJhY2tcbiAgICAgICAgICogLSBUaGUgbm90ZSBudW1iZXIgKHRyYW5zcG9zZSB2YWx1ZSlcbiAgICAgICAgICogLSBUaGUgdHJhY2tzIHRvIGluY2x1ZGVcbiAgICAgICAgICogUmV0dXJuIHRoZSBtb2RpZmllZCBsaXN0IG9mIG1pZGkgZXZlbnRzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBUaGlzIE1pZGkgZmlsZSBvbmx5IGhhcyBvbmUgYWN0dWFsIHRyYWNrLCBidXQgd2UndmUgc3BsaXQgdGhhdFxuICAgICAgICAgKiBpbnRvIG11bHRpcGxlIGZha2UgdHJhY2tzLCBvbmUgcGVyIGNoYW5uZWwsIGFuZCBkaXNwbGF5ZWQgdGhhdFxuICAgICAgICAgKiB0byB0aGUgZW5kLXVzZXIuICBTbyBjaGFuZ2luZyB0aGUgaW5zdHJ1bWVudCwgYW5kIHRyYWNrcyB0b1xuICAgICAgICAgKiBpbmNsdWRlLCBpcyBpbXBsZW1lbnRlZCBkaWZmZXJlbnRseSB0aGFuIEFwcGx5T3B0aW9uc1RvRXZlbnRzKCkuXG4gICAgICAgICAqXG4gICAgICAgICAqIC0gV2UgY2hhbmdlIHRoZSBpbnN0cnVtZW50IGJhc2VkIG9uIHRoZSBjaGFubmVsLCBub3QgdGhlIHRyYWNrLlxuICAgICAgICAgKiAtIFdlIGluY2x1ZGUvZXhjbHVkZSBjaGFubmVscywgbm90IHRyYWNrcy5cbiAgICAgICAgICogLSBXZSBleGNsdWRlIGEgY2hhbm5lbCBieSBzZXR0aW5nIHRoZSBub3RlIHZvbHVtZS92ZWxvY2l0eSB0byAwLlxuICAgICAgICAgKi9cbiAgICAgICAgcHJpdmF0ZSBMaXN0PE1pZGlFdmVudD5bXVxuICAgICAgICBBcHBseU9wdGlvbnNQZXJDaGFubmVsKE1pZGlPcHRpb25zIG9wdGlvbnMpXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8qIERldGVybWluZSB3aGljaCBjaGFubmVscyB0byBpbmNsdWRlL2V4Y2x1ZGUuXG4gICAgICAgICAgICAgKiBBbHNvLCBkZXRlcm1pbmUgdGhlIGluc3RydW1lbnRzIGZvciBlYWNoIGNoYW5uZWwuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGludFtdIGluc3RydW1lbnRzID0gbmV3IGludFsxNl07XG4gICAgICAgICAgICBib29sW10ga2VlcGNoYW5uZWwgPSBuZXcgYm9vbFsxNl07XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDE2OyBpKyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaW5zdHJ1bWVudHNbaV0gPSAwO1xuICAgICAgICAgICAgICAgIGtlZXBjaGFubmVsW2ldID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCB0cmFja3MuQ291bnQ7IHRyYWNrbnVtKyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgTWlkaVRyYWNrIHRyYWNrID0gdHJhY2tzW3RyYWNrbnVtXTtcbiAgICAgICAgICAgICAgICBpbnQgY2hhbm5lbCA9IHRyYWNrLk5vdGVzWzBdLkNoYW5uZWw7XG4gICAgICAgICAgICAgICAgaW5zdHJ1bWVudHNbY2hhbm5lbF0gPSBvcHRpb25zLmluc3RydW1lbnRzW3RyYWNrbnVtXTtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5tdXRlW3RyYWNrbnVtXSA9PSB0cnVlKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAga2VlcGNoYW5uZWxbY2hhbm5lbF0gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIExpc3Q8TWlkaUV2ZW50PltdIG5ld2V2ZW50cyA9IENsb25lTWlkaUV2ZW50cyhldmVudHMpO1xuXG4gICAgICAgICAgICAvKiBTZXQgdGhlIHRlbXBvIGF0IHRoZSBiZWdpbm5pbmcgb2YgZWFjaCB0cmFjayAqL1xuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IG5ld2V2ZW50cy5MZW5ndGg7IHRyYWNrbnVtKyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgTWlkaUV2ZW50IG1ldmVudCA9IENyZWF0ZVRlbXBvRXZlbnQob3B0aW9ucy50ZW1wbyk7XG4gICAgICAgICAgICAgICAgbmV3ZXZlbnRzW3RyYWNrbnVtXS5JbnNlcnQoMCwgbWV2ZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogQ2hhbmdlIHRoZSBub3RlIG51bWJlciAodHJhbnNwb3NlKSwgaW5zdHJ1bWVudCwgYW5kIHRlbXBvICovXG4gICAgICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgbmV3ZXZlbnRzLkxlbmd0aDsgdHJhY2tudW0rKylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbWV2ZW50IGluIG5ld2V2ZW50c1t0cmFja251bV0pXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpbnQgbnVtID0gbWV2ZW50Lk5vdGVudW1iZXIgKyBvcHRpb25zLnRyYW5zcG9zZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG51bSA8IDApXG4gICAgICAgICAgICAgICAgICAgICAgICBudW0gPSAwO1xuICAgICAgICAgICAgICAgICAgICBpZiAobnVtID4gMTI3KVxuICAgICAgICAgICAgICAgICAgICAgICAgbnVtID0gMTI3O1xuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuTm90ZW51bWJlciA9IChieXRlKW51bTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFrZWVwY2hhbm5lbFttZXZlbnQuQ2hhbm5lbF0pXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5WZWxvY2l0eSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFvcHRpb25zLnVzZURlZmF1bHRJbnN0cnVtZW50cylcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50Lkluc3RydW1lbnQgPSAoYnl0ZSlpbnN0cnVtZW50c1ttZXZlbnQuQ2hhbm5lbF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LlRlbXBvID0gb3B0aW9ucy50ZW1wbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5wYXVzZVRpbWUgIT0gMClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuZXdldmVudHMgPSBTdGFydEF0UGF1c2VUaW1lKG5ld2V2ZW50cywgb3B0aW9ucy5wYXVzZVRpbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5ld2V2ZW50cztcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLyoqIEFwcGx5IHRoZSBnaXZlbiBzaGVldCBtdXNpYyBvcHRpb25zIHRvIHRoZSBNaWRpTm90ZXMuXG4gICAgICAgICAqICBSZXR1cm4gdGhlIG1pZGkgdHJhY2tzIHdpdGggdGhlIGNoYW5nZXMgYXBwbGllZC5cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBMaXN0PE1pZGlUcmFjaz4gQ2hhbmdlTWlkaU5vdGVzKE1pZGlPcHRpb25zIG9wdGlvbnMpXG4gICAgICAgIHtcbiAgICAgICAgICAgIExpc3Q8TWlkaVRyYWNrPiBuZXd0cmFja3MgPSBuZXcgTGlzdDxNaWRpVHJhY2s+KCk7XG5cbiAgICAgICAgICAgIGZvciAoaW50IHRyYWNrID0gMDsgdHJhY2sgPCB0cmFja3MuQ291bnQ7IHRyYWNrKyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMudHJhY2tzW3RyYWNrXSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5ld3RyYWNrcy5BZGQodHJhY2tzW3RyYWNrXS5DbG9uZSgpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIFRvIG1ha2UgdGhlIHNoZWV0IG11c2ljIGxvb2sgbmljZXIsIHdlIHJvdW5kIHRoZSBzdGFydCB0aW1lc1xuICAgICAgICAgICAgICogc28gdGhhdCBub3RlcyBjbG9zZSB0b2dldGhlciBhcHBlYXIgYXMgYSBzaW5nbGUgY2hvcmQuICBXZVxuICAgICAgICAgICAgICogYWxzbyBleHRlbmQgdGhlIG5vdGUgZHVyYXRpb25zLCBzbyB0aGF0IHdlIGhhdmUgbG9uZ2VyIG5vdGVzXG4gICAgICAgICAgICAgKiBhbmQgZmV3ZXIgcmVzdCBzeW1ib2xzLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBUaW1lU2lnbmF0dXJlIHRpbWUgPSB0aW1lc2lnO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMudGltZSAhPSBudWxsKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRpbWUgPSBvcHRpb25zLnRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBNaWRpRmlsZS5Sb3VuZFN0YXJ0VGltZXMobmV3dHJhY2tzLCBvcHRpb25zLmNvbWJpbmVJbnRlcnZhbCwgdGltZXNpZyk7XG4gICAgICAgICAgICBNaWRpRmlsZS5Sb3VuZER1cmF0aW9ucyhuZXd0cmFja3MsIHRpbWUuUXVhcnRlcik7XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLnR3b1N0YWZmcylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuZXd0cmFja3MgPSBNaWRpRmlsZS5Db21iaW5lVG9Ud29UcmFja3MobmV3dHJhY2tzLCB0aW1lc2lnLk1lYXN1cmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuc2hpZnR0aW1lICE9IDApXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgTWlkaUZpbGUuU2hpZnRUaW1lKG5ld3RyYWNrcywgb3B0aW9ucy5zaGlmdHRpbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudHJhbnNwb3NlICE9IDApXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgTWlkaUZpbGUuVHJhbnNwb3NlKG5ld3RyYWNrcywgb3B0aW9ucy50cmFuc3Bvc2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbmV3dHJhY2tzO1xuICAgICAgICB9XG5cblxuICAgICAgICAvKiogU2hpZnQgdGhlIHN0YXJ0dGltZSBvZiB0aGUgbm90ZXMgYnkgdGhlIGdpdmVuIGFtb3VudC5cbiAgICAgICAgICogVGhpcyBpcyB1c2VkIGJ5IHRoZSBTaGlmdCBOb3RlcyBtZW51IHRvIHNoaWZ0IG5vdGVzIGxlZnQvcmlnaHQuXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgc3RhdGljIHZvaWRcbiAgICAgICAgU2hpZnRUaW1lKExpc3Q8TWlkaVRyYWNrPiB0cmFja3MsIGludCBhbW91bnQpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiB0cmFjay5Ob3RlcylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5vdGUuU3RhcnRUaW1lICs9IGFtb3VudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiogU2hpZnQgdGhlIG5vdGUga2V5cyB1cC9kb3duIGJ5IHRoZSBnaXZlbiBhbW91bnQgKi9cbiAgICAgICAgcHVibGljIHN0YXRpYyB2b2lkXG4gICAgICAgIFRyYW5zcG9zZShMaXN0PE1pZGlUcmFjaz4gdHJhY2tzLCBpbnQgYW1vdW50KVxuICAgICAgICB7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG5vdGUgaW4gdHJhY2suTm90ZXMpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBub3RlLk51bWJlciArPSBhbW91bnQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub3RlLk51bWJlciA8IDApXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdGUuTnVtYmVyID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cbiAgICAgICAgLyogRmluZCB0aGUgaGlnaGVzdCBhbmQgbG93ZXN0IG5vdGVzIHRoYXQgb3ZlcmxhcCB0aGlzIGludGVydmFsIChzdGFydHRpbWUgdG8gZW5kdGltZSkuXG4gICAgICAgICAqIFRoaXMgbWV0aG9kIGlzIHVzZWQgYnkgU3BsaXRUcmFjayB0byBkZXRlcm1pbmUgd2hpY2ggc3RhZmYgKHRvcCBvciBib3R0b20pIGEgbm90ZVxuICAgICAgICAgKiBzaG91bGQgZ28gdG8uXG4gICAgICAgICAqXG4gICAgICAgICAqIEZvciBtb3JlIGFjY3VyYXRlIFNwbGl0VHJhY2soKSByZXN1bHRzLCB3ZSBsaW1pdCB0aGUgaW50ZXJ2YWwvZHVyYXRpb24gb2YgdGhpcyBub3RlIFxuICAgICAgICAgKiAoYW5kIG90aGVyIG5vdGVzKSB0byBvbmUgbWVhc3VyZS4gV2UgY2FyZSBvbmx5IGFib3V0IGhpZ2gvbG93IG5vdGVzIHRoYXQgYXJlXG4gICAgICAgICAqIHJlYXNvbmFibHkgY2xvc2UgdG8gdGhpcyBub3RlLlxuICAgICAgICAgKi9cbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZFxuICAgICAgICBGaW5kSGlnaExvd05vdGVzKExpc3Q8TWlkaU5vdGU+IG5vdGVzLCBpbnQgbWVhc3VyZWxlbiwgaW50IHN0YXJ0aW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgaW50IHN0YXJ0dGltZSwgaW50IGVuZHRpbWUsIHJlZiBpbnQgaGlnaCwgcmVmIGludCBsb3cpXG4gICAgICAgIHtcblxuICAgICAgICAgICAgaW50IGkgPSBzdGFydGluZGV4O1xuICAgICAgICAgICAgaWYgKHN0YXJ0dGltZSArIG1lYXN1cmVsZW4gPCBlbmR0aW1lKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGVuZHRpbWUgPSBzdGFydHRpbWUgKyBtZWFzdXJlbGVuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB3aGlsZSAoaSA8IG5vdGVzLkNvdW50ICYmIG5vdGVzW2ldLlN0YXJ0VGltZSA8IGVuZHRpbWUpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKG5vdGVzW2ldLkVuZFRpbWUgPCBzdGFydHRpbWUpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobm90ZXNbaV0uU3RhcnRUaW1lICsgbWVhc3VyZWxlbiA8IHN0YXJ0dGltZSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChoaWdoIDwgbm90ZXNbaV0uTnVtYmVyKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaGlnaCA9IG5vdGVzW2ldLk51bWJlcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGxvdyA+IG5vdGVzW2ldLk51bWJlcilcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxvdyA9IG5vdGVzW2ldLk51bWJlcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyogRmluZCB0aGUgaGlnaGVzdCBhbmQgbG93ZXN0IG5vdGVzIHRoYXQgc3RhcnQgYXQgdGhpcyBleGFjdCBzdGFydCB0aW1lICovXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWRcbiAgICAgICAgRmluZEV4YWN0SGlnaExvd05vdGVzKExpc3Q8TWlkaU5vdGU+IG5vdGVzLCBpbnQgc3RhcnRpbmRleCwgaW50IHN0YXJ0dGltZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZiBpbnQgaGlnaCwgcmVmIGludCBsb3cpXG4gICAgICAgIHtcblxuICAgICAgICAgICAgaW50IGkgPSBzdGFydGluZGV4O1xuXG4gICAgICAgICAgICB3aGlsZSAobm90ZXNbaV0uU3RhcnRUaW1lIDwgc3RhcnR0aW1lKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgd2hpbGUgKGkgPCBub3Rlcy5Db3VudCAmJiBub3Rlc1tpXS5TdGFydFRpbWUgPT0gc3RhcnR0aW1lKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmIChoaWdoIDwgbm90ZXNbaV0uTnVtYmVyKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaGlnaCA9IG5vdGVzW2ldLk51bWJlcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGxvdyA+IG5vdGVzW2ldLk51bWJlcilcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxvdyA9IG5vdGVzW2ldLk51bWJlcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cblxuXG4gICAgICAgIC8qIFNwbGl0IHRoZSBnaXZlbiBNaWRpVHJhY2sgaW50byB0d28gdHJhY2tzLCB0b3AgYW5kIGJvdHRvbS5cbiAgICAgICAgICogVGhlIGhpZ2hlc3Qgbm90ZXMgd2lsbCBnbyBpbnRvIHRvcCwgdGhlIGxvd2VzdCBpbnRvIGJvdHRvbS5cbiAgICAgICAgICogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIHNwbGl0IHBpYW5vIHNvbmdzIGludG8gbGVmdC1oYW5kIChib3R0b20pXG4gICAgICAgICAqIGFuZCByaWdodC1oYW5kICh0b3ApIHRyYWNrcy5cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgTGlzdDxNaWRpVHJhY2s+IFNwbGl0VHJhY2soTWlkaVRyYWNrIHRyYWNrLCBpbnQgbWVhc3VyZWxlbilcbiAgICAgICAge1xuICAgICAgICAgICAgTGlzdDxNaWRpTm90ZT4gbm90ZXMgPSB0cmFjay5Ob3RlcztcbiAgICAgICAgICAgIGludCBjb3VudCA9IG5vdGVzLkNvdW50O1xuXG4gICAgICAgICAgICBNaWRpVHJhY2sgdG9wID0gbmV3IE1pZGlUcmFjaygxKTtcbiAgICAgICAgICAgIE1pZGlUcmFjayBib3R0b20gPSBuZXcgTWlkaVRyYWNrKDIpO1xuICAgICAgICAgICAgTGlzdDxNaWRpVHJhY2s+IHJlc3VsdCA9IG5ldyBMaXN0PE1pZGlUcmFjaz4oMik7XG4gICAgICAgICAgICByZXN1bHQuQWRkKHRvcCk7IHJlc3VsdC5BZGQoYm90dG9tKTtcblxuICAgICAgICAgICAgaWYgKGNvdW50ID09IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcblxuICAgICAgICAgICAgaW50IHByZXZoaWdoID0gNzY7IC8qIEU1LCB0b3Agb2YgdHJlYmxlIHN0YWZmICovXG4gICAgICAgICAgICBpbnQgcHJldmxvdyA9IDQ1OyAvKiBBMywgYm90dG9tIG9mIGJhc3Mgc3RhZmYgKi9cbiAgICAgICAgICAgIGludCBzdGFydGluZGV4ID0gMDtcblxuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiBub3RlcylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpbnQgaGlnaCwgbG93LCBoaWdoRXhhY3QsIGxvd0V4YWN0O1xuXG4gICAgICAgICAgICAgICAgaW50IG51bWJlciA9IG5vdGUuTnVtYmVyO1xuICAgICAgICAgICAgICAgIGhpZ2ggPSBsb3cgPSBoaWdoRXhhY3QgPSBsb3dFeGFjdCA9IG51bWJlcjtcblxuICAgICAgICAgICAgICAgIHdoaWxlIChub3Rlc1tzdGFydGluZGV4XS5FbmRUaW1lIDwgbm90ZS5TdGFydFRpbWUpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBzdGFydGluZGV4Kys7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLyogSSd2ZSB0cmllZCBzZXZlcmFsIGFsZ29yaXRobXMgZm9yIHNwbGl0dGluZyBhIHRyYWNrIGluIHR3byxcbiAgICAgICAgICAgICAgICAgKiBhbmQgdGhlIG9uZSBiZWxvdyBzZWVtcyB0byB3b3JrIHRoZSBiZXN0OlxuICAgICAgICAgICAgICAgICAqIC0gSWYgdGhpcyBub3RlIGlzIG1vcmUgdGhhbiBhbiBvY3RhdmUgZnJvbSB0aGUgaGlnaC9sb3cgbm90ZXNcbiAgICAgICAgICAgICAgICAgKiAgICh0aGF0IHN0YXJ0IGV4YWN0bHkgYXQgdGhpcyBzdGFydCB0aW1lKSwgY2hvb3NlIHRoZSBjbG9zZXN0IG9uZS5cbiAgICAgICAgICAgICAgICAgKiAtIElmIHRoaXMgbm90ZSBpcyBtb3JlIHRoYW4gYW4gb2N0YXZlIGZyb20gdGhlIGhpZ2gvbG93IG5vdGVzXG4gICAgICAgICAgICAgICAgICogICAoaW4gdGhpcyBub3RlJ3MgdGltZSBkdXJhdGlvbiksIGNob29zZSB0aGUgY2xvc2VzdCBvbmUuXG4gICAgICAgICAgICAgICAgICogLSBJZiB0aGUgaGlnaCBhbmQgbG93IG5vdGVzICh0aGF0IHN0YXJ0IGV4YWN0bHkgYXQgdGhpcyBzdGFydHRpbWUpXG4gICAgICAgICAgICAgICAgICogICBhcmUgbW9yZSB0aGFuIGFuIG9jdGF2ZSBhcGFydCwgY2hvb3NlIHRoZSBjbG9zZXN0IG5vdGUuXG4gICAgICAgICAgICAgICAgICogLSBJZiB0aGUgaGlnaCBhbmQgbG93IG5vdGVzICh0aGF0IG92ZXJsYXAgdGhpcyBzdGFydHRpbWUpXG4gICAgICAgICAgICAgICAgICogICBhcmUgbW9yZSB0aGFuIGFuIG9jdGF2ZSBhcGFydCwgY2hvb3NlIHRoZSBjbG9zZXN0IG5vdGUuXG4gICAgICAgICAgICAgICAgICogLSBFbHNlLCBsb29rIGF0IHRoZSBwcmV2aW91cyBoaWdoL2xvdyBub3RlcyB0aGF0IHdlcmUgbW9yZSB0aGFuIGFuIFxuICAgICAgICAgICAgICAgICAqICAgb2N0YXZlIGFwYXJ0LiAgQ2hvb3NlIHRoZSBjbG9zZXNldCBub3RlLlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIEZpbmRIaWdoTG93Tm90ZXMobm90ZXMsIG1lYXN1cmVsZW4sIHN0YXJ0aW5kZXgsIG5vdGUuU3RhcnRUaW1lLCBub3RlLkVuZFRpbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWYgaGlnaCwgcmVmIGxvdyk7XG4gICAgICAgICAgICAgICAgRmluZEV4YWN0SGlnaExvd05vdGVzKG5vdGVzLCBzdGFydGluZGV4LCBub3RlLlN0YXJ0VGltZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmIGhpZ2hFeGFjdCwgcmVmIGxvd0V4YWN0KTtcblxuICAgICAgICAgICAgICAgIGlmIChoaWdoRXhhY3QgLSBudW1iZXIgPiAxMiB8fCBudW1iZXIgLSBsb3dFeGFjdCA+IDEyKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhpZ2hFeGFjdCAtIG51bWJlciA8PSBudW1iZXIgLSBsb3dFeGFjdClcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9wLkFkZE5vdGUobm90ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBib3R0b20uQWRkTm90ZShub3RlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChoaWdoIC0gbnVtYmVyID4gMTIgfHwgbnVtYmVyIC0gbG93ID4gMTIpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaGlnaCAtIG51bWJlciA8PSBudW1iZXIgLSBsb3cpXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcC5BZGROb3RlKG5vdGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgYm90dG9tLkFkZE5vdGUobm90ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaGlnaEV4YWN0IC0gbG93RXhhY3QgPiAxMilcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChoaWdoRXhhY3QgLSBudW1iZXIgPD0gbnVtYmVyIC0gbG93RXhhY3QpXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcC5BZGROb3RlKG5vdGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgYm90dG9tLkFkZE5vdGUobm90ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaGlnaCAtIGxvdyA+IDEyKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhpZ2ggLSBudW1iZXIgPD0gbnVtYmVyIC0gbG93KVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AuQWRkTm90ZShub3RlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdHRvbS5BZGROb3RlKG5vdGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmV2aGlnaCAtIG51bWJlciA8PSBudW1iZXIgLSBwcmV2bG93KVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AuQWRkTm90ZShub3RlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdHRvbS5BZGROb3RlKG5vdGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLyogVGhlIHByZXZoaWdoL3ByZXZsb3cgYXJlIHNldCB0byB0aGUgbGFzdCBoaWdoL2xvd1xuICAgICAgICAgICAgICAgICAqIHRoYXQgYXJlIG1vcmUgdGhhbiBhbiBvY3RhdmUgYXBhcnQuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKGhpZ2ggLSBsb3cgPiAxMilcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHByZXZoaWdoID0gaGlnaDtcbiAgICAgICAgICAgICAgICAgICAgcHJldmxvdyA9IGxvdztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRvcC5Ob3Rlcy5Tb3J0KHRyYWNrLk5vdGVzWzBdKTtcbiAgICAgICAgICAgIGJvdHRvbS5Ob3Rlcy5Tb3J0KHRyYWNrLk5vdGVzWzBdKTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLyoqIENvbWJpbmUgdGhlIG5vdGVzIGluIHRoZSBnaXZlbiB0cmFja3MgaW50byBhIHNpbmdsZSBNaWRpVHJhY2suIFxuICAgICAgICAgKiAgVGhlIGluZGl2aWR1YWwgdHJhY2tzIGFyZSBhbHJlYWR5IHNvcnRlZC4gIFRvIG1lcmdlIHRoZW0sIHdlXG4gICAgICAgICAqICB1c2UgYSBtZXJnZXNvcnQtbGlrZSBhbGdvcml0aG0uXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgc3RhdGljIE1pZGlUcmFjayBDb21iaW5lVG9TaW5nbGVUcmFjayhMaXN0PE1pZGlUcmFjaz4gdHJhY2tzKVxuICAgICAgICB7XG4gICAgICAgICAgICAvKiBBZGQgYWxsIG5vdGVzIGludG8gb25lIHRyYWNrICovXG4gICAgICAgICAgICBNaWRpVHJhY2sgcmVzdWx0ID0gbmV3IE1pZGlUcmFjaygxKTtcblxuICAgICAgICAgICAgaWYgKHRyYWNrcy5Db3VudCA9PSAwKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0cmFja3MuQ291bnQgPT0gMSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBNaWRpVHJhY2sgdHJhY2sgPSB0cmFja3NbMF07XG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiB0cmFjay5Ob3RlcylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5BZGROb3RlKG5vdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpbnRbXSBub3RlaW5kZXggPSBuZXcgaW50WzY0XTtcbiAgICAgICAgICAgIGludFtdIG5vdGVjb3VudCA9IG5ldyBpbnRbNjRdO1xuXG4gICAgICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgdHJhY2tzLkNvdW50OyB0cmFja251bSsrKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5vdGVpbmRleFt0cmFja251bV0gPSAwO1xuICAgICAgICAgICAgICAgIG5vdGVjb3VudFt0cmFja251bV0gPSB0cmFja3NbdHJhY2tudW1dLk5vdGVzLkNvdW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgTWlkaU5vdGUgcHJldm5vdGUgPSBudWxsO1xuICAgICAgICAgICAgd2hpbGUgKHRydWUpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgTWlkaU5vdGUgbG93ZXN0bm90ZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgaW50IGxvd2VzdFRyYWNrID0gLTE7XG4gICAgICAgICAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IHRyYWNrcy5Db3VudDsgdHJhY2tudW0rKylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIE1pZGlUcmFjayB0cmFjayA9IHRyYWNrc1t0cmFja251bV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChub3RlaW5kZXhbdHJhY2tudW1dID49IG5vdGVjb3VudFt0cmFja251bV0pXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIE1pZGlOb3RlIG5vdGUgPSB0cmFjay5Ob3Rlc1tub3RlaW5kZXhbdHJhY2tudW1dXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvd2VzdG5vdGUgPT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG93ZXN0bm90ZSA9IG5vdGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb3dlc3RUcmFjayA9IHRyYWNrbnVtO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG5vdGUuU3RhcnRUaW1lIDwgbG93ZXN0bm90ZS5TdGFydFRpbWUpXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvd2VzdG5vdGUgPSBub3RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG93ZXN0VHJhY2sgPSB0cmFja251bTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChub3RlLlN0YXJ0VGltZSA9PSBsb3dlc3Rub3RlLlN0YXJ0VGltZSAmJiBub3RlLk51bWJlciA8IGxvd2VzdG5vdGUuTnVtYmVyKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb3dlc3Rub3RlID0gbm90ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvd2VzdFRyYWNrID0gdHJhY2tudW07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGxvd2VzdG5vdGUgPT0gbnVsbClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIC8qIFdlJ3ZlIGZpbmlzaGVkIHRoZSBtZXJnZSAqL1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbm90ZWluZGV4W2xvd2VzdFRyYWNrXSsrO1xuICAgICAgICAgICAgICAgIGlmICgocHJldm5vdGUgIT0gbnVsbCkgJiYgKHByZXZub3RlLlN0YXJ0VGltZSA9PSBsb3dlc3Rub3RlLlN0YXJ0VGltZSkgJiZcbiAgICAgICAgICAgICAgICAgICAgKHByZXZub3RlLk51bWJlciA9PSBsb3dlc3Rub3RlLk51bWJlcikpXG4gICAgICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgICAgIC8qIERvbid0IGFkZCBkdXBsaWNhdGUgbm90ZXMsIHdpdGggdGhlIHNhbWUgc3RhcnQgdGltZSBhbmQgbnVtYmVyICovXG4gICAgICAgICAgICAgICAgICAgIGlmIChsb3dlc3Rub3RlLkR1cmF0aW9uID4gcHJldm5vdGUuRHVyYXRpb24pXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZub3RlLkR1cmF0aW9uID0gbG93ZXN0bm90ZS5EdXJhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQuQWRkTm90ZShsb3dlc3Rub3RlKTtcbiAgICAgICAgICAgICAgICAgICAgcHJldm5vdGUgPSBsb3dlc3Rub3RlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLyoqIENvbWJpbmUgdGhlIG5vdGVzIGluIGFsbCB0aGUgdHJhY2tzIGdpdmVuIGludG8gdHdvIE1pZGlUcmFja3MsXG4gICAgICAgICAqIGFuZCByZXR1cm4gdGhlbS5cbiAgICAgICAgICogXG4gICAgICAgICAqIFRoaXMgZnVuY3Rpb24gaXMgaW50ZW5kZWQgZm9yIHBpYW5vIHNvbmdzLCB3aGVuIHdlIHdhbnQgdG8gZGlzcGxheVxuICAgICAgICAgKiBhIGxlZnQtaGFuZCB0cmFjayBhbmQgYSByaWdodC1oYW5kIHRyYWNrLiAgVGhlIGxvd2VyIG5vdGVzIGdvIGludG8gXG4gICAgICAgICAqIHRoZSBsZWZ0LWhhbmQgdHJhY2ssIGFuZCB0aGUgaGlnaGVyIG5vdGVzIGdvIGludG8gdGhlIHJpZ2h0IGhhbmQgXG4gICAgICAgICAqIHRyYWNrLlxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIHN0YXRpYyBMaXN0PE1pZGlUcmFjaz4gQ29tYmluZVRvVHdvVHJhY2tzKExpc3Q8TWlkaVRyYWNrPiB0cmFja3MsIGludCBtZWFzdXJlbGVuKVxuICAgICAgICB7XG4gICAgICAgICAgICBNaWRpVHJhY2sgc2luZ2xlID0gQ29tYmluZVRvU2luZ2xlVHJhY2sodHJhY2tzKTtcbiAgICAgICAgICAgIExpc3Q8TWlkaVRyYWNrPiByZXN1bHQgPSBTcGxpdFRyYWNrKHNpbmdsZSwgbWVhc3VyZWxlbik7XG5cbiAgICAgICAgICAgIExpc3Q8TWlkaUV2ZW50PiBseXJpY3MgPSBuZXcgTGlzdDxNaWRpRXZlbnQ+KCk7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmICh0cmFjay5MeXJpY3MgIT0gbnVsbClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGx5cmljcy5BZGRSYW5nZSh0cmFjay5MeXJpY3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChseXJpY3MuQ291bnQgPiAwKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGx5cmljcy5Tb3J0KGx5cmljc1swXSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0WzBdLkx5cmljcyA9IGx5cmljcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLyoqIENoZWNrIHRoYXQgdGhlIE1pZGlOb3RlIHN0YXJ0IHRpbWVzIGFyZSBpbiBpbmNyZWFzaW5nIG9yZGVyLlxuICAgICAgICAgKiBUaGlzIGlzIGZvciBkZWJ1Z2dpbmcgcHVycG9zZXMuXG4gICAgICAgICAqL1xuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIENoZWNrU3RhcnRUaW1lcyhMaXN0PE1pZGlUcmFjaz4gdHJhY2tzKVxuICAgICAgICB7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGludCBwcmV2dGltZSA9IC0xO1xuICAgICAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG5vdGUgaW4gdHJhY2suTm90ZXMpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm90ZS5TdGFydFRpbWUgPCBwcmV2dGltZSlcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5c3RlbS5Bcmd1bWVudEV4Y2VwdGlvbihcInN0YXJ0IHRpbWVzIG5vdCBpbiBpbmNyZWFzaW5nIG9yZGVyXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHByZXZ0aW1lID0gbm90ZS5TdGFydFRpbWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cblxuICAgICAgICAvKiogSW4gTWlkaSBGaWxlcywgdGltZSBpcyBtZWFzdXJlZCBpbiBwdWxzZXMuICBOb3RlcyB0aGF0IGhhdmVcbiAgICAgICAgICogcHVsc2UgdGltZXMgdGhhdCBhcmUgY2xvc2UgdG9nZXRoZXIgKGxpa2Ugd2l0aGluIDEwIHB1bHNlcylcbiAgICAgICAgICogd2lsbCBzb3VuZCBsaWtlIHRoZXkncmUgdGhlIHNhbWUgY2hvcmQuICBXZSB3YW50IHRvIGRyYXdcbiAgICAgICAgICogdGhlc2Ugbm90ZXMgYXMgYSBzaW5nbGUgY2hvcmQsIGl0IG1ha2VzIHRoZSBzaGVldCBtdXNpYyBtdWNoXG4gICAgICAgICAqIGVhc2llciB0byByZWFkLiAgV2UgZG9uJ3Qgd2FudCB0byBkcmF3IG5vdGVzIHRoYXQgYXJlIGNsb3NlXG4gICAgICAgICAqIHRvZ2V0aGVyIGFzIHR3byBzZXBhcmF0ZSBjaG9yZHMuXG4gICAgICAgICAqXG4gICAgICAgICAqIFRoZSBTeW1ib2xTcGFjaW5nIGNsYXNzIG9ubHkgYWxpZ25zIG5vdGVzIHRoYXQgaGF2ZSBleGFjdGx5IHRoZSBzYW1lXG4gICAgICAgICAqIHN0YXJ0IHRpbWVzLiAgTm90ZXMgd2l0aCBzbGlnaHRseSBkaWZmZXJlbnQgc3RhcnQgdGltZXMgd2lsbFxuICAgICAgICAgKiBhcHBlYXIgaW4gc2VwYXJhdGUgdmVydGljYWwgY29sdW1ucy4gIFRoaXMgaXNuJ3Qgd2hhdCB3ZSB3YW50LlxuICAgICAgICAgKiBXZSB3YW50IHRvIGFsaWduIG5vdGVzIHdpdGggYXBwcm94aW1hdGVseSB0aGUgc2FtZSBzdGFydCB0aW1lcy5cbiAgICAgICAgICogU28sIHRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBhc3NpZ24gdGhlIHNhbWUgc3RhcnR0aW1lIGZvciBub3Rlc1xuICAgICAgICAgKiB0aGF0IGFyZSBjbG9zZSB0b2dldGhlciAodGltZXdpc2UpLlxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIHN0YXRpYyB2b2lkXG4gICAgICAgIFJvdW5kU3RhcnRUaW1lcyhMaXN0PE1pZGlUcmFjaz4gdHJhY2tzLCBpbnQgbWlsbGlzZWMsIFRpbWVTaWduYXR1cmUgdGltZSlcbiAgICAgICAge1xuICAgICAgICAgICAgLyogR2V0IGFsbCB0aGUgc3RhcnR0aW1lcyBpbiBhbGwgdHJhY2tzLCBpbiBzb3J0ZWQgb3JkZXIgKi9cbiAgICAgICAgICAgIExpc3Q8aW50PiBzdGFydHRpbWVzID0gbmV3IExpc3Q8aW50PigpO1xuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrLk5vdGVzKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnR0aW1lcy5BZGQobm90ZS5TdGFydFRpbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0YXJ0dGltZXMuU29ydCgpO1xuXG4gICAgICAgICAgICAvKiBOb3RlcyB3aXRoaW4gXCJtaWxsaXNlY1wiIG1pbGxpc2Vjb25kcyBhcGFydCB3aWxsIGJlIGNvbWJpbmVkLiAqL1xuICAgICAgICAgICAgaW50IGludGVydmFsID0gdGltZS5RdWFydGVyICogbWlsbGlzZWMgKiAxMDAwIC8gdGltZS5UZW1wbztcblxuICAgICAgICAgICAgLyogSWYgdHdvIHN0YXJ0dGltZXMgYXJlIHdpdGhpbiBpbnRlcnZhbCBtaWxsaXNlYywgbWFrZSB0aGVtIHRoZSBzYW1lICovXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHN0YXJ0dGltZXMuQ291bnQgLSAxOyBpKyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXJ0dGltZXNbaSArIDFdIC0gc3RhcnR0aW1lc1tpXSA8PSBpbnRlcnZhbClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0dGltZXNbaSArIDFdID0gc3RhcnR0aW1lc1tpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIENoZWNrU3RhcnRUaW1lcyh0cmFja3MpO1xuXG4gICAgICAgICAgICAvKiBBZGp1c3QgdGhlIG5vdGUgc3RhcnR0aW1lcywgc28gdGhhdCBpdCBtYXRjaGVzIG9uZSBvZiB0aGUgc3RhcnR0aW1lcyB2YWx1ZXMgKi9cbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaW50IGkgPSAwO1xuXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiB0cmFjay5Ob3RlcylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgc3RhcnR0aW1lcy5Db3VudCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90ZS5TdGFydFRpbWUgLSBpbnRlcnZhbCA+IHN0YXJ0dGltZXNbaV0pXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChub3RlLlN0YXJ0VGltZSA+IHN0YXJ0dGltZXNbaV0gJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdGUuU3RhcnRUaW1lIC0gc3RhcnR0aW1lc1tpXSA8PSBpbnRlcnZhbClcbiAgICAgICAgICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBub3RlLlN0YXJ0VGltZSA9IHN0YXJ0dGltZXNbaV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdHJhY2suTm90ZXMuU29ydCh0cmFjay5Ob3Rlc1swXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8qKiBXZSB3YW50IG5vdGUgZHVyYXRpb25zIHRvIHNwYW4gdXAgdG8gdGhlIG5leHQgbm90ZSBpbiBnZW5lcmFsLlxuICAgICAgICAgKiBUaGUgc2hlZXQgbXVzaWMgbG9va3MgbmljZXIgdGhhdCB3YXkuICBJbiBjb250cmFzdCwgc2hlZXQgbXVzaWNcbiAgICAgICAgICogd2l0aCBsb3RzIG9mIDE2dGgvMzJuZCBub3RlcyBzZXBhcmF0ZWQgYnkgc21hbGwgcmVzdHMgZG9lc24ndFxuICAgICAgICAgKiBsb29rIGFzIG5pY2UuICBIYXZpbmcgbmljZSBsb29raW5nIHNoZWV0IG11c2ljIGlzIG1vcmUgaW1wb3J0YW50XG4gICAgICAgICAqIHRoYW4gZmFpdGhmdWxseSByZXByZXNlbnRpbmcgdGhlIE1pZGkgRmlsZSBkYXRhLlxuICAgICAgICAgKlxuICAgICAgICAgKiBUaGVyZWZvcmUsIHRoaXMgZnVuY3Rpb24gcm91bmRzIHRoZSBkdXJhdGlvbiBvZiBNaWRpTm90ZXMgdXAgdG9cbiAgICAgICAgICogdGhlIG5leHQgbm90ZSB3aGVyZSBwb3NzaWJsZS5cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZFxuICAgICAgICBSb3VuZER1cmF0aW9ucyhMaXN0PE1pZGlUcmFjaz4gdHJhY2tzLCBpbnQgcXVhcnRlcm5vdGUpXG4gICAgICAgIHtcblxuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBNaWRpTm90ZSBwcmV2Tm90ZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCB0cmFjay5Ob3Rlcy5Db3VudCAtIDE7IGkrKylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIE1pZGlOb3RlIG5vdGUxID0gdHJhY2suTm90ZXNbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmV2Tm90ZSA9PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2Tm90ZSA9IG5vdGUxO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLyogR2V0IHRoZSBuZXh0IG5vdGUgdGhhdCBoYXMgYSBkaWZmZXJlbnQgc3RhcnQgdGltZSAqL1xuICAgICAgICAgICAgICAgICAgICBNaWRpTm90ZSBub3RlMiA9IG5vdGUxO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGludCBqID0gaSArIDE7IGogPCB0cmFjay5Ob3Rlcy5Db3VudDsgaisrKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub3RlMiA9IHRyYWNrLk5vdGVzW2pdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vdGUxLlN0YXJ0VGltZSA8IG5vdGUyLlN0YXJ0VGltZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpbnQgbWF4ZHVyYXRpb24gPSBub3RlMi5TdGFydFRpbWUgLSBub3RlMS5TdGFydFRpbWU7XG5cbiAgICAgICAgICAgICAgICAgICAgaW50IGR1ciA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGlmIChxdWFydGVybm90ZSA8PSBtYXhkdXJhdGlvbilcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1ciA9IHF1YXJ0ZXJub3RlO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChxdWFydGVybm90ZSAvIDIgPD0gbWF4ZHVyYXRpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICBkdXIgPSBxdWFydGVybm90ZSAvIDI7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHF1YXJ0ZXJub3RlIC8gMyA8PSBtYXhkdXJhdGlvbilcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1ciA9IHF1YXJ0ZXJub3RlIC8gMztcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocXVhcnRlcm5vdGUgLyA0IDw9IG1heGR1cmF0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgZHVyID0gcXVhcnRlcm5vdGUgLyA0O1xuXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGR1ciA8IG5vdGUxLkR1cmF0aW9uKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkdXIgPSBub3RlMS5EdXJhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8qIFNwZWNpYWwgY2FzZTogSWYgdGhlIHByZXZpb3VzIG5vdGUncyBkdXJhdGlvblxuICAgICAgICAgICAgICAgICAgICAgKiBtYXRjaGVzIHRoaXMgbm90ZSdzIGR1cmF0aW9uLCB3ZSBjYW4gbWFrZSBhIG5vdGVwYWlyLlxuICAgICAgICAgICAgICAgICAgICAgKiBTbyBkb24ndCBleHBhbmQgdGhlIGR1cmF0aW9uIGluIHRoYXQgY2FzZS5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGlmICgocHJldk5vdGUuU3RhcnRUaW1lICsgcHJldk5vdGUuRHVyYXRpb24gPT0gbm90ZTEuU3RhcnRUaW1lKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgKHByZXZOb3RlLkR1cmF0aW9uID09IG5vdGUxLkR1cmF0aW9uKSlcbiAgICAgICAgICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBkdXIgPSBub3RlMS5EdXJhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBub3RlMS5EdXJhdGlvbiA9IGR1cjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYWNrLk5vdGVzW2kgKyAxXS5TdGFydFRpbWUgIT0gbm90ZTEuU3RhcnRUaW1lKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2Tm90ZSA9IG5vdGUxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqIFNwbGl0IHRoZSBnaXZlbiB0cmFjayBpbnRvIG11bHRpcGxlIHRyYWNrcywgc2VwYXJhdGluZyBlYWNoXG4gICAgICAgICAqIGNoYW5uZWwgaW50byBhIHNlcGFyYXRlIHRyYWNrLlxuICAgICAgICAgKi9cbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgTGlzdDxNaWRpVHJhY2s+XG4gICAgICAgIFNwbGl0Q2hhbm5lbHMoTWlkaVRyYWNrIG9yaWd0cmFjaywgTGlzdDxNaWRpRXZlbnQ+IGV2ZW50cylcbiAgICAgICAge1xuXG4gICAgICAgICAgICAvKiBGaW5kIHRoZSBpbnN0cnVtZW50IHVzZWQgZm9yIGVhY2ggY2hhbm5lbCAqL1xuICAgICAgICAgICAgaW50W10gY2hhbm5lbEluc3RydW1lbnRzID0gbmV3IGludFsxNl07XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbWV2ZW50IGluIGV2ZW50cylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudFByb2dyYW1DaGFuZ2UpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjaGFubmVsSW5zdHJ1bWVudHNbbWV2ZW50LkNoYW5uZWxdID0gbWV2ZW50Lkluc3RydW1lbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hhbm5lbEluc3RydW1lbnRzWzldID0gMTI4OyAvKiBDaGFubmVsIDkgPSBQZXJjdXNzaW9uICovXG5cbiAgICAgICAgICAgIExpc3Q8TWlkaVRyYWNrPiByZXN1bHQgPSBuZXcgTGlzdDxNaWRpVHJhY2s+KCk7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIG9yaWd0cmFjay5Ob3RlcylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBib29sIGZvdW5kY2hhbm5lbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiByZXN1bHQpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm90ZS5DaGFubmVsID09IHRyYWNrLk5vdGVzWzBdLkNoYW5uZWwpXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kY2hhbm5lbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFjay5BZGROb3RlKG5vdGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghZm91bmRjaGFubmVsKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgTWlkaVRyYWNrIHRyYWNrID0gbmV3IE1pZGlUcmFjayhyZXN1bHQuQ291bnQgKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgdHJhY2suQWRkTm90ZShub3RlKTtcbiAgICAgICAgICAgICAgICAgICAgdHJhY2suSW5zdHJ1bWVudCA9IGNoYW5uZWxJbnN0cnVtZW50c1tub3RlLkNoYW5uZWxdO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQuQWRkKHRyYWNrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob3JpZ3RyYWNrLkx5cmljcyAhPSBudWxsKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBseXJpY0V2ZW50IGluIG9yaWd0cmFjay5MeXJpY3MpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gcmVzdWx0KVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobHlyaWNFdmVudC5DaGFubmVsID09IHRyYWNrLk5vdGVzWzBdLkNoYW5uZWwpXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhY2suQWRkTHlyaWMobHlyaWNFdmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG5cblxuICAgICAgICAvKiogR3Vlc3MgdGhlIG1lYXN1cmUgbGVuZ3RoLiAgV2UgYXNzdW1lIHRoYXQgdGhlIG1lYXN1cmVcbiAgICAgICAgICogbGVuZ3RoIG11c3QgYmUgYmV0d2VlbiAwLjUgc2Vjb25kcyBhbmQgNCBzZWNvbmRzLlxuICAgICAgICAgKiBUYWtlIGFsbCB0aGUgbm90ZSBzdGFydCB0aW1lcyB0aGF0IGZhbGwgYmV0d2VlbiAwLjUgYW5kIFxuICAgICAgICAgKiA0IHNlY29uZHMsIGFuZCByZXR1cm4gdGhlIHN0YXJ0dGltZXMuXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgTGlzdDxpbnQ+XG4gICAgICAgIEd1ZXNzTWVhc3VyZUxlbmd0aCgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIExpc3Q8aW50PiByZXN1bHQgPSBuZXcgTGlzdDxpbnQ+KCk7XG5cbiAgICAgICAgICAgIGludCBwdWxzZXNfcGVyX3NlY29uZCA9IChpbnQpKDEwMDAwMDAuMCAvIHRpbWVzaWcuVGVtcG8gKiB0aW1lc2lnLlF1YXJ0ZXIpO1xuICAgICAgICAgICAgaW50IG1pbm1lYXN1cmUgPSBwdWxzZXNfcGVyX3NlY29uZCAvIDI7ICAvKiBUaGUgbWluaW11bSBtZWFzdXJlIGxlbmd0aCBpbiBwdWxzZXMgKi9cbiAgICAgICAgICAgIGludCBtYXhtZWFzdXJlID0gcHVsc2VzX3Blcl9zZWNvbmQgKiA0OyAgLyogVGhlIG1heGltdW0gbWVhc3VyZSBsZW5ndGggaW4gcHVsc2VzICovXG5cbiAgICAgICAgICAgIC8qIEdldCB0aGUgc3RhcnQgdGltZSBvZiB0aGUgZmlyc3Qgbm90ZSBpbiB0aGUgbWlkaSBmaWxlLiAqL1xuICAgICAgICAgICAgaW50IGZpcnN0bm90ZSA9IHRpbWVzaWcuTWVhc3VyZSAqIDU7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmIChmaXJzdG5vdGUgPiB0cmFjay5Ob3Rlc1swXS5TdGFydFRpbWUpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBmaXJzdG5vdGUgPSB0cmFjay5Ob3Rlc1swXS5TdGFydFRpbWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBpbnRlcnZhbCA9IDAuMDYgc2Vjb25kcywgY29udmVydGVkIGludG8gcHVsc2VzICovXG4gICAgICAgICAgICBpbnQgaW50ZXJ2YWwgPSB0aW1lc2lnLlF1YXJ0ZXIgKiA2MDAwMCAvIHRpbWVzaWcuVGVtcG87XG5cbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaW50IHByZXZ0aW1lID0gMDtcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrLk5vdGVzKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vdGUuU3RhcnRUaW1lIC0gcHJldnRpbWUgPD0gaW50ZXJ2YWwpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgICAgICBwcmV2dGltZSA9IG5vdGUuU3RhcnRUaW1lO1xuXG4gICAgICAgICAgICAgICAgICAgIGludCB0aW1lX2Zyb21fZmlyc3Rub3RlID0gbm90ZS5TdGFydFRpbWUgLSBmaXJzdG5vdGU7XG5cbiAgICAgICAgICAgICAgICAgICAgLyogUm91bmQgdGhlIHRpbWUgZG93biB0byBhIG11bHRpcGxlIG9mIDQgKi9cbiAgICAgICAgICAgICAgICAgICAgdGltZV9mcm9tX2ZpcnN0bm90ZSA9IHRpbWVfZnJvbV9maXJzdG5vdGUgLyA0ICogNDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWVfZnJvbV9maXJzdG5vdGUgPCBtaW5tZWFzdXJlKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lX2Zyb21fZmlyc3Rub3RlID4gbWF4bWVhc3VyZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0LkNvbnRhaW5zKHRpbWVfZnJvbV9maXJzdG5vdGUpKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuQWRkKHRpbWVfZnJvbV9maXJzdG5vdGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0LlNvcnQoKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogUmV0dXJuIHRoZSBsYXN0IHN0YXJ0IHRpbWUgKi9cbiAgICAgICAgcHVibGljIGludCBFbmRUaW1lKClcbiAgICAgICAge1xuICAgICAgICAgICAgaW50IGxhc3RTdGFydCA9IDA7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmICh0cmFjay5Ob3Rlcy5Db3VudCA9PSAwKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGludCBsYXN0ID0gdHJhY2suTm90ZXNbdHJhY2suTm90ZXMuQ291bnQgLSAxXS5TdGFydFRpbWU7XG4gICAgICAgICAgICAgICAgbGFzdFN0YXJ0ID0gTWF0aC5NYXgobGFzdCwgbGFzdFN0YXJ0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBsYXN0U3RhcnQ7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogUmV0dXJuIHRydWUgaWYgdGhpcyBtaWRpIGZpbGUgaGFzIGx5cmljcyAqL1xuICAgICAgICBwdWJsaWMgYm9vbCBIYXNMeXJpY3MoKVxuICAgICAgICB7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmICh0cmFjay5MeXJpY3MgIT0gbnVsbClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKVxuICAgICAgICB7XG4gICAgICAgICAgICBzdHJpbmcgcmVzdWx0ID0gXCJNaWRpIEZpbGUgdHJhY2tzPVwiICsgdHJhY2tzLkNvdW50ICsgXCIgcXVhcnRlcj1cIiArIHF1YXJ0ZXJub3RlICsgXCJcXG5cIjtcbiAgICAgICAgICAgIHJlc3VsdCArPSBUaW1lLlRvU3RyaW5nKCkgKyBcIlxcblwiO1xuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gdHJhY2suVG9TdHJpbmcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cblxuICAgIH0gIC8qIEVuZCBjbGFzcyBNaWRpRmlsZSAqL1xuXG59ICAvKiBFbmQgbmFtZXNwYWNlIE1pZGlTaGVldE11c2ljICovXG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMiBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogQGNsYXNzIE1pZGlGaWxlRXhjZXB0aW9uXG4gKiBBIE1pZGlGaWxlRXhjZXB0aW9uIGlzIHRocm93biB3aGVuIGFuIGVycm9yIG9jY3Vyc1xuICogd2hpbGUgcGFyc2luZyB0aGUgTWlkaSBGaWxlLiAgVGhlIGNvbnN0cnVjdG9yIHRha2VzXG4gKiB0aGUgZmlsZSBvZmZzZXQgKGluIGJ5dGVzKSB3aGVyZSB0aGUgZXJyb3Igb2NjdXJyZWQsXG4gKiBhbmQgYSBzdHJpbmcgZGVzY3JpYmluZyB0aGUgZXJyb3IuXG4gKi9cbnB1YmxpYyBjbGFzcyBNaWRpRmlsZUV4Y2VwdGlvbiA6IFN5c3RlbS5FeGNlcHRpb24ge1xuICAgIHB1YmxpYyBNaWRpRmlsZUV4Y2VwdGlvbiAoc3RyaW5nIHMsIGludCBvZmZzZXQpIDpcbiAgICAgICAgYmFzZShzICsgXCIgYXQgb2Zmc2V0IFwiICsgb2Zmc2V0KSB7XG4gICAgfVxufVxuXG59XG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMiBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG5cbi8qKiBAY2xhc3MgTWlkaUZpbGVSZWFkZXJcbiAqIFRoZSBNaWRpRmlsZVJlYWRlciBpcyB1c2VkIHRvIHJlYWQgbG93LWxldmVsIGJpbmFyeSBkYXRhIGZyb20gYSBmaWxlLlxuICogVGhpcyBjbGFzcyBjYW4gZG8gdGhlIGZvbGxvd2luZzpcbiAqXG4gKiAtIFBlZWsgYXQgdGhlIG5leHQgYnl0ZSBpbiB0aGUgZmlsZS5cbiAqIC0gUmVhZCBhIGJ5dGVcbiAqIC0gUmVhZCBhIDE2LWJpdCBiaWcgZW5kaWFuIHNob3J0XG4gKiAtIFJlYWQgYSAzMi1iaXQgYmlnIGVuZGlhbiBpbnRcbiAqIC0gUmVhZCBhIGZpeGVkIGxlbmd0aCBhc2NpaSBzdHJpbmcgKG5vdCBudWxsIHRlcm1pbmF0ZWQpXG4gKiAtIFJlYWQgYSBcInZhcmlhYmxlIGxlbmd0aFwiIGludGVnZXIuICBUaGUgZm9ybWF0IG9mIHRoZSB2YXJpYWJsZSBsZW5ndGhcbiAqICAgaW50IGlzIGRlc2NyaWJlZCBhdCB0aGUgdG9wIG9mIHRoaXMgZmlsZS5cbiAqIC0gU2tpcCBhaGVhZCBhIGdpdmVuIG51bWJlciBvZiBieXRlc1xuICogLSBSZXR1cm4gdGhlIGN1cnJlbnQgb2Zmc2V0LlxuICovXG5cbnB1YmxpYyBjbGFzcyBNaWRpRmlsZVJlYWRlciB7XG4gICAgcHJpdmF0ZSBieXRlW10gZGF0YTsgICAgICAgLyoqIFRoZSBlbnRpcmUgbWlkaSBmaWxlIGRhdGEgKi9cbiAgICBwcml2YXRlIGludCBwYXJzZV9vZmZzZXQ7ICAvKiogVGhlIGN1cnJlbnQgb2Zmc2V0IHdoaWxlIHBhcnNpbmcgKi9cblxuICAgIC8qKiBDcmVhdGUgYSBuZXcgTWlkaUZpbGVSZWFkZXIgZm9yIHRoZSBnaXZlbiBmaWxlbmFtZSAqL1xuICAgIC8vcHVibGljIE1pZGlGaWxlUmVhZGVyKHN0cmluZyBmaWxlbmFtZSkge1xuICAgIC8vICAgIEZpbGVJbmZvIGluZm8gPSBuZXcgRmlsZUluZm8oZmlsZW5hbWUpO1xuICAgIC8vICAgIGlmICghaW5mby5FeGlzdHMpIHtcbiAgICAvLyAgICAgICAgdGhyb3cgbmV3IE1pZGlGaWxlRXhjZXB0aW9uKFwiRmlsZSBcIiArIGZpbGVuYW1lICsgXCIgZG9lcyBub3QgZXhpc3RcIiwgMCk7XG4gICAgLy8gICAgfVxuICAgIC8vICAgIGlmIChpbmZvLkxlbmd0aCA9PSAwKSB7XG4gICAgLy8gICAgICAgIHRocm93IG5ldyBNaWRpRmlsZUV4Y2VwdGlvbihcIkZpbGUgXCIgKyBmaWxlbmFtZSArIFwiIGlzIGVtcHR5ICgwIGJ5dGVzKVwiLCAwKTtcbiAgICAvLyAgICB9XG4gICAgLy8gICAgRmlsZVN0cmVhbSBmaWxlID0gRmlsZS5PcGVuKGZpbGVuYW1lLCBGaWxlTW9kZS5PcGVuLCBcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRmlsZUFjY2Vzcy5SZWFkLCBGaWxlU2hhcmUuUmVhZCk7XG5cbiAgICAvLyAgICAvKiBSZWFkIHRoZSBlbnRpcmUgZmlsZSBpbnRvIG1lbW9yeSAqL1xuICAgIC8vICAgIGRhdGEgPSBuZXcgYnl0ZVsgaW5mby5MZW5ndGggXTtcbiAgICAvLyAgICBpbnQgb2Zmc2V0ID0gMDtcbiAgICAvLyAgICBpbnQgbGVuID0gKGludClpbmZvLkxlbmd0aDtcbiAgICAvLyAgICB3aGlsZSAodHJ1ZSkge1xuICAgIC8vICAgICAgICBpZiAob2Zmc2V0ID09IGluZm8uTGVuZ3RoKVxuICAgIC8vICAgICAgICAgICAgYnJlYWs7XG4gICAgLy8gICAgICAgIGludCBuID0gZmlsZS5SZWFkKGRhdGEsIG9mZnNldCwgKGludCkoaW5mby5MZW5ndGggLSBvZmZzZXQpKTtcbiAgICAvLyAgICAgICAgaWYgKG4gPD0gMClcbiAgICAvLyAgICAgICAgICAgIGJyZWFrO1xuICAgIC8vICAgICAgICBvZmZzZXQgKz0gbjtcbiAgICAvLyAgICB9XG4gICAgLy8gICAgcGFyc2Vfb2Zmc2V0ID0gMDtcbiAgICAvLyAgICBmaWxlLkNsb3NlKCk7XG4gICAgLy99XG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IE1pZGlGaWxlUmVhZGVyIGZyb20gdGhlIGdpdmVuIGRhdGEgKi9cbiAgICBwdWJsaWMgTWlkaUZpbGVSZWFkZXIoYnl0ZVtdIGJ5dGVzKSB7XG4gICAgICAgIGRhdGEgPSBieXRlcztcbiAgICAgICAgcGFyc2Vfb2Zmc2V0ID0gMDtcbiAgICB9XG5cbiAgICAvKiogQ2hlY2sgdGhhdCB0aGUgZ2l2ZW4gbnVtYmVyIG9mIGJ5dGVzIGRvZXNuJ3QgZXhjZWVkIHRoZSBmaWxlIHNpemUgKi9cbiAgICBwcml2YXRlIHZvaWQgY2hlY2tSZWFkKGludCBhbW91bnQpIHtcbiAgICAgICAgaWYgKHBhcnNlX29mZnNldCArIGFtb3VudCA+IGRhdGEuTGVuZ3RoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXCJGaWxlIGlzIHRydW5jYXRlZFwiLCBwYXJzZV9vZmZzZXQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFJlYWQgdGhlIG5leHQgYnl0ZSBpbiB0aGUgZmlsZSwgYnV0IGRvbid0IGluY3JlbWVudCB0aGUgcGFyc2Ugb2Zmc2V0ICovXG4gICAgcHVibGljIGJ5dGUgUGVlaygpIHtcbiAgICAgICAgY2hlY2tSZWFkKDEpO1xuICAgICAgICByZXR1cm4gZGF0YVtwYXJzZV9vZmZzZXRdO1xuICAgIH1cblxuICAgIC8qKiBSZWFkIGEgYnl0ZSBmcm9tIHRoZSBmaWxlICovXG4gICAgcHVibGljIGJ5dGUgUmVhZEJ5dGUoKSB7IFxuICAgICAgICBjaGVja1JlYWQoMSk7XG4gICAgICAgIGJ5dGUgeCA9IGRhdGFbcGFyc2Vfb2Zmc2V0XTtcbiAgICAgICAgcGFyc2Vfb2Zmc2V0Kys7XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cblxuICAgIC8qKiBSZWFkIHRoZSBnaXZlbiBudW1iZXIgb2YgYnl0ZXMgZnJvbSB0aGUgZmlsZSAqL1xuICAgIHB1YmxpYyBieXRlW10gUmVhZEJ5dGVzKGludCBhbW91bnQpIHtcbiAgICAgICAgY2hlY2tSZWFkKGFtb3VudCk7XG4gICAgICAgIGJ5dGVbXSByZXN1bHQgPSBuZXcgYnl0ZVthbW91bnRdO1xuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IGFtb3VudDsgaSsrKSB7XG4gICAgICAgICAgICByZXN1bHRbaV0gPSBkYXRhW2kgKyBwYXJzZV9vZmZzZXRdO1xuICAgICAgICB9XG4gICAgICAgIHBhcnNlX29mZnNldCArPSBhbW91bnQ7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqIFJlYWQgYSAxNi1iaXQgc2hvcnQgZnJvbSB0aGUgZmlsZSAqL1xuICAgIHB1YmxpYyB1c2hvcnQgUmVhZFNob3J0KCkge1xuICAgICAgICBjaGVja1JlYWQoMik7XG4gICAgICAgIHVzaG9ydCB4ID0gKHVzaG9ydCkgKCAoZGF0YVtwYXJzZV9vZmZzZXRdIDw8IDgpIHwgZGF0YVtwYXJzZV9vZmZzZXQrMV0gKTtcbiAgICAgICAgcGFyc2Vfb2Zmc2V0ICs9IDI7XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cblxuICAgIC8qKiBSZWFkIGEgMzItYml0IGludCBmcm9tIHRoZSBmaWxlICovXG4gICAgcHVibGljIGludCBSZWFkSW50KCkge1xuICAgICAgICBjaGVja1JlYWQoNCk7XG4gICAgICAgIGludCB4ID0gKGludCkoIChkYXRhW3BhcnNlX29mZnNldF0gPDwgMjQpIHwgKGRhdGFbcGFyc2Vfb2Zmc2V0KzFdIDw8IDE2KSB8XG4gICAgICAgICAgICAgICAgICAgICAgIChkYXRhW3BhcnNlX29mZnNldCsyXSA8PCA4KSB8IGRhdGFbcGFyc2Vfb2Zmc2V0KzNdICk7XG4gICAgICAgIHBhcnNlX29mZnNldCArPSA0O1xuICAgICAgICByZXR1cm4geDtcbiAgICB9XG5cbiAgICAvKiogUmVhZCBhbiBhc2NpaSBzdHJpbmcgd2l0aCB0aGUgZ2l2ZW4gbGVuZ3RoICovXG4gICAgcHVibGljIHN0cmluZyBSZWFkQXNjaWkoaW50IGxlbikge1xuICAgICAgICBjaGVja1JlYWQobGVuKTtcbiAgICAgICAgc3RyaW5nIHMgPSBBU0NJSUVuY29kaW5nLkFTQ0lJLkdldFN0cmluZyhkYXRhLCBwYXJzZV9vZmZzZXQsIGxlbik7XG4gICAgICAgIHBhcnNlX29mZnNldCArPSBsZW47XG4gICAgICAgIHJldHVybiBzO1xuICAgIH1cblxuICAgIC8qKiBSZWFkIGEgdmFyaWFibGUtbGVuZ3RoIGludGVnZXIgKDEgdG8gNCBieXRlcykuIFRoZSBpbnRlZ2VyIGVuZHNcbiAgICAgKiB3aGVuIHlvdSBlbmNvdW50ZXIgYSBieXRlIHRoYXQgZG9lc24ndCBoYXZlIHRoZSA4dGggYml0IHNldFxuICAgICAqIChhIGJ5dGUgbGVzcyB0aGFuIDB4ODApLlxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgUmVhZFZhcmxlbigpIHtcbiAgICAgICAgdWludCByZXN1bHQgPSAwO1xuICAgICAgICBieXRlIGI7XG5cbiAgICAgICAgYiA9IFJlYWRCeXRlKCk7XG4gICAgICAgIHJlc3VsdCA9ICh1aW50KShiICYgMHg3Zik7XG5cbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgICAgICAgIGlmICgoYiAmIDB4ODApICE9IDApIHtcbiAgICAgICAgICAgICAgICBiID0gUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSAodWludCkoIChyZXN1bHQgPDwgNykgKyAoYiAmIDB4N2YpICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKGludClyZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqIFNraXAgb3ZlciB0aGUgZ2l2ZW4gbnVtYmVyIG9mIGJ5dGVzICovIFxuICAgIHB1YmxpYyB2b2lkIFNraXAoaW50IGFtb3VudCkge1xuICAgICAgICBjaGVja1JlYWQoYW1vdW50KTtcbiAgICAgICAgcGFyc2Vfb2Zmc2V0ICs9IGFtb3VudDtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBjdXJyZW50IHBhcnNlIG9mZnNldCAqL1xuICAgIHB1YmxpYyBpbnQgR2V0T2Zmc2V0KCkge1xuICAgICAgICByZXR1cm4gcGFyc2Vfb2Zmc2V0O1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIHJhdyBtaWRpIGZpbGUgYnl0ZSBkYXRhICovXG4gICAgcHVibGljIGJ5dGVbXSBHZXREYXRhKCkge1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG59XG5cbn0gXG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMiBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcbntcblxuICAgIC8qKiBAY2xhc3MgTWlkaU5vdGVcbiAgICAgKiBBIE1pZGlOb3RlIGNvbnRhaW5zXG4gICAgICpcbiAgICAgKiBzdGFydHRpbWUgLSBUaGUgdGltZSAobWVhc3VyZWQgaW4gcHVsc2VzKSB3aGVuIHRoZSBub3RlIGlzIHByZXNzZWQuXG4gICAgICogY2hhbm5lbCAgIC0gVGhlIGNoYW5uZWwgdGhlIG5vdGUgaXMgZnJvbS4gIFRoaXMgaXMgdXNlZCB3aGVuIG1hdGNoaW5nXG4gICAgICogICAgICAgICAgICAgTm90ZU9mZiBldmVudHMgd2l0aCB0aGUgY29ycmVzcG9uZGluZyBOb3RlT24gZXZlbnQuXG4gICAgICogICAgICAgICAgICAgVGhlIGNoYW5uZWxzIGZvciB0aGUgTm90ZU9uIGFuZCBOb3RlT2ZmIGV2ZW50cyBtdXN0IGJlXG4gICAgICogICAgICAgICAgICAgdGhlIHNhbWUuXG4gICAgICogbm90ZW51bWJlciAtIFRoZSBub3RlIG51bWJlciwgZnJvbSAwIHRvIDEyNy4gIE1pZGRsZSBDIGlzIDYwLlxuICAgICAqIGR1cmF0aW9uICAtIFRoZSB0aW1lIGR1cmF0aW9uIChtZWFzdXJlZCBpbiBwdWxzZXMpIGFmdGVyIHdoaWNoIHRoZSBcbiAgICAgKiAgICAgICAgICAgICBub3RlIGlzIHJlbGVhc2VkLlxuICAgICAqXG4gICAgICogQSBNaWRpTm90ZSBpcyBjcmVhdGVkIHdoZW4gd2UgZW5jb3VudGVyIGEgTm90ZU9mZiBldmVudC4gIFRoZSBkdXJhdGlvblxuICAgICAqIGlzIGluaXRpYWxseSB1bmtub3duIChzZXQgdG8gMCkuICBXaGVuIHRoZSBjb3JyZXNwb25kaW5nIE5vdGVPZmYgZXZlbnRcbiAgICAgKiBpcyBmb3VuZCwgdGhlIGR1cmF0aW9uIGlzIHNldCBieSB0aGUgbWV0aG9kIE5vdGVPZmYoKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgY2xhc3MgTWlkaU5vdGUgOiBJQ29tcGFyZXI8TWlkaU5vdGU+XG4gICAge1xuICAgICAgICBwcml2YXRlIGludCBpZDsgICAgICAgICAgLyoqIE5vdGUgSUQuIFRoaXMgY2FuIGJlIHVzZWQgdG8ga2VlcCB0cmFjayBvZiBjbG9uZXMgYWZ0ZXIgY2FsbHMgc3VjaCBhcyBNaWRpRmlsZS5DaGFuZ2VNaWRpTm90ZXMgICovXG4gICAgICAgIHByaXZhdGUgaW50IHN0YXJ0dGltZTsgICAvKiogVGhlIHN0YXJ0IHRpbWUsIGluIHB1bHNlcyAqL1xuICAgICAgICBwcml2YXRlIGludCBjaGFubmVsOyAgICAgLyoqIFRoZSBjaGFubmVsICovXG4gICAgICAgIHByaXZhdGUgaW50IG5vdGVudW1iZXI7ICAvKiogVGhlIG5vdGUsIGZyb20gMCB0byAxMjcuIE1pZGRsZSBDIGlzIDYwICovXG4gICAgICAgIHByaXZhdGUgaW50IGR1cmF0aW9uOyAgICAvKiogVGhlIGR1cmF0aW9uLCBpbiBwdWxzZXMgKi9cbiAgICAgICAgcHJpdmF0ZSBpbnQgdmVsb2NpdHk7ICAgIC8qKiBWZWxvY2l0eSBvZiB0aGUgbm90ZSwgZnJvbSAwIHRvIDEyNyAqL1xuXG5cbiAgICAgICAgLyogQ3JlYXRlIGEgbmV3IE1pZGlOb3RlLiAgVGhpcyBpcyBjYWxsZWQgd2hlbiBhIE5vdGVPbiBldmVudCBpc1xuICAgICAgICAgKiBlbmNvdW50ZXJlZCBpbiB0aGUgTWlkaUZpbGUuXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgTWlkaU5vdGUoaW50IGlkLCBpbnQgc3RhcnR0aW1lLCBpbnQgY2hhbm5lbCwgaW50IG5vdGVudW1iZXIsIGludCBkdXJhdGlvbiwgaW50IHZlbG9jaXR5KVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmlkID0gaWQ7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0dGltZSA9IHN0YXJ0dGltZTtcbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbCA9IGNoYW5uZWw7XG4gICAgICAgICAgICB0aGlzLm5vdGVudW1iZXIgPSBub3RlbnVtYmVyO1xuICAgICAgICAgICAgdGhpcy5kdXJhdGlvbiA9IGR1cmF0aW9uO1xuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eSA9IHZlbG9jaXR5O1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGludCBJZFxuICAgICAgICB7XG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gaWQ7IH1cbiAgICAgICAgfVxuXG5cbiAgICAgICAgcHVibGljIGludCBTdGFydFRpbWVcbiAgICAgICAge1xuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIHN0YXJ0dGltZTsgfVxuICAgICAgICAgICAgc2V0IHsgc3RhcnR0aW1lID0gdmFsdWU7IH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBpbnQgRW5kVGltZVxuICAgICAgICB7XG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gc3RhcnR0aW1lICsgZHVyYXRpb247IH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBpbnQgQ2hhbm5lbFxuICAgICAgICB7XG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gY2hhbm5lbDsgfVxuICAgICAgICAgICAgc2V0IHsgY2hhbm5lbCA9IHZhbHVlOyB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgaW50IE51bWJlclxuICAgICAgICB7XG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gbm90ZW51bWJlcjsgfVxuICAgICAgICAgICAgc2V0IHsgbm90ZW51bWJlciA9IHZhbHVlOyB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgaW50IER1cmF0aW9uXG4gICAgICAgIHtcbiAgICAgICAgICAgIGdldCB7IHJldHVybiBkdXJhdGlvbjsgfVxuICAgICAgICAgICAgc2V0IHsgZHVyYXRpb24gPSB2YWx1ZTsgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGludCBWZWxvY2l0eVxuICAgICAgICB7XG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gdmVsb2NpdHk7IH1cbiAgICAgICAgICAgIHNldCB7IHZlbG9jaXR5ID0gdmFsdWU7IH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIEEgTm90ZU9mZiBldmVudCBvY2N1cnMgZm9yIHRoaXMgbm90ZSBhdCB0aGUgZ2l2ZW4gdGltZS5cbiAgICAgICAgICogQ2FsY3VsYXRlIHRoZSBub3RlIGR1cmF0aW9uIGJhc2VkIG9uIHRoZSBub3Rlb2ZmIGV2ZW50LlxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIHZvaWQgTm90ZU9mZihpbnQgZW5kdGltZSlcbiAgICAgICAge1xuICAgICAgICAgICAgZHVyYXRpb24gPSBlbmR0aW1lIC0gc3RhcnR0aW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqIENvbXBhcmUgdHdvIE1pZGlOb3RlcyBiYXNlZCBvbiB0aGVpciBzdGFydCB0aW1lcy5cbiAgICAgICAgICogIElmIHRoZSBzdGFydCB0aW1lcyBhcmUgZXF1YWwsIGNvbXBhcmUgYnkgdGhlaXIgbnVtYmVycy5cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBpbnQgQ29tcGFyZShNaWRpTm90ZSB4LCBNaWRpTm90ZSB5KVxuICAgICAgICB7XG4gICAgICAgICAgICBpZiAoeC5TdGFydFRpbWUgPT0geS5TdGFydFRpbWUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHguTnVtYmVyIC0geS5OdW1iZXI7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHguU3RhcnRUaW1lIC0geS5TdGFydFRpbWU7XG4gICAgICAgIH1cblxuXG4gICAgICAgIHB1YmxpYyBNaWRpTm90ZSBDbG9uZSgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWlkaU5vdGUoaWQsIHN0YXJ0dGltZSwgY2hhbm5lbCwgbm90ZW51bWJlciwgZHVyYXRpb24sIHZlbG9jaXR5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZVxuICAgICAgICBzdHJpbmcgVG9TdHJpbmcoKVxuICAgICAgICB7XG4gICAgICAgICAgICBzdHJpbmdbXSBzY2FsZSA9IHsgXCJBXCIsIFwiQSNcIiwgXCJCXCIsIFwiQ1wiLCBcIkMjXCIsIFwiRFwiLCBcIkQjXCIsIFwiRVwiLCBcIkZcIiwgXCJGI1wiLCBcIkdcIiwgXCJHI1wiIH07XG4gICAgICAgICAgICByZXR1cm4gc3RyaW5nLkZvcm1hdChcIk1pZGlOb3RlIGNoYW5uZWw9ezB9IG51bWJlcj17MX0gezJ9IHN0YXJ0PXszfSBkdXJhdGlvbj17NH1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5uZWwsIG5vdGVudW1iZXIsIHNjYWxlWyhub3RlbnVtYmVyICsgMykgJSAxMl0sIHN0YXJ0dGltZSwgZHVyYXRpb24pO1xuXG4gICAgICAgIH1cblxuICAgIH1cblxuXG59ICAvKiBFbmQgbmFtZXNwYWNlIE1pZGlTaGVldE11c2ljICovXG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMyBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIEBjbGFzcyBNaWRpT3B0aW9uc1xuICpcbiAqIFRoZSBNaWRpT3B0aW9ucyBjbGFzcyBjb250YWlucyB0aGUgYXZhaWxhYmxlIG9wdGlvbnMgZm9yXG4gKiBtb2RpZnlpbmcgdGhlIHNoZWV0IG11c2ljIGFuZCBzb3VuZC4gIFRoZXNlIG9wdGlvbnMgYXJlXG4gKiBjb2xsZWN0ZWQgZnJvbSB0aGUgbWVudS9kaWFsb2cgc2V0dGluZ3MsIGFuZCB0aGVuIGFyZSBwYXNzZWRcbiAqIHRvIHRoZSBTaGVldE11c2ljIGFuZCBNaWRpUGxheWVyIGNsYXNzZXMuXG4gKi9cbnB1YmxpYyBjbGFzcyBNaWRpT3B0aW9ucyB7XG5cbiAgICAvLyBUaGUgcG9zc2libGUgdmFsdWVzIGZvciBzaG93Tm90ZUxldHRlcnNcbiAgICBwdWJsaWMgY29uc3QgaW50IE5vdGVOYW1lTm9uZSAgICAgICAgICAgPSAwO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTm90ZU5hbWVMZXR0ZXIgICAgICAgICA9IDE7XG4gICAgcHVibGljIGNvbnN0IGludCBOb3RlTmFtZUZpeGVkRG9SZU1pICAgID0gMjtcbiAgICBwdWJsaWMgY29uc3QgaW50IE5vdGVOYW1lTW92YWJsZURvUmVNaSAgPSAzO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTm90ZU5hbWVGaXhlZE51bWJlciAgICA9IDQ7XG4gICAgcHVibGljIGNvbnN0IGludCBOb3RlTmFtZU1vdmFibGVOdW1iZXIgID0gNTtcblxuICAgIC8vIFNoZWV0IE11c2ljIE9wdGlvbnNcbiAgICBwdWJsaWMgc3RyaW5nIGZpbGVuYW1lOyAgICAgICAvKiogVGhlIGZ1bGwgTWlkaSBmaWxlbmFtZSAqL1xuICAgIHB1YmxpYyBzdHJpbmcgdGl0bGU7ICAgICAgICAgIC8qKiBUaGUgTWlkaSBzb25nIHRpdGxlICovXG4gICAgcHVibGljIGJvb2xbXSB0cmFja3M7ICAgICAgICAgLyoqIFdoaWNoIHRyYWNrcyB0byBkaXNwbGF5ICh0cnVlID0gZGlzcGxheSkgKi9cbiAgICBwdWJsaWMgYm9vbCBzY3JvbGxWZXJ0OyAgICAgICAvKiogV2hldGhlciB0byBzY3JvbGwgdmVydGljYWxseSBvciBob3Jpem9udGFsbHkgKi9cbiAgICBwdWJsaWMgYm9vbCBsYXJnZU5vdGVTaXplOyAgICAvKiogRGlzcGxheSBsYXJnZSBvciBzbWFsbCBub3RlIHNpemVzICovXG4gICAgcHVibGljIGJvb2wgdHdvU3RhZmZzOyAgICAgICAgLyoqIENvbWJpbmUgdHJhY2tzIGludG8gdHdvIHN0YWZmcyA/ICovXG4gICAgcHVibGljIGludCBzaG93Tm90ZUxldHRlcnM7ICAgICAvKiogU2hvdyB0aGUgbmFtZSAoQSwgQSMsIGV0YykgbmV4dCB0byB0aGUgbm90ZXMgKi9cbiAgICBwdWJsaWMgYm9vbCBzaG93THlyaWNzOyAgICAgICAvKiogU2hvdyB0aGUgbHlyaWNzIHVuZGVyIGVhY2ggbm90ZSAqL1xuICAgIHB1YmxpYyBib29sIHNob3dNZWFzdXJlczsgICAgIC8qKiBTaG93IHRoZSBtZWFzdXJlIG51bWJlcnMgZm9yIGVhY2ggc3RhZmYgKi9cbiAgICBwdWJsaWMgaW50IHNoaWZ0dGltZTsgICAgICAgICAvKiogU2hpZnQgbm90ZSBzdGFydHRpbWVzIGJ5IHRoZSBnaXZlbiBhbW91bnQgKi9cbiAgICBwdWJsaWMgaW50IHRyYW5zcG9zZTsgICAgICAgICAvKiogU2hpZnQgbm90ZSBrZXkgdXAvZG93biBieSBnaXZlbiBhbW91bnQgKi9cbiAgICBwdWJsaWMgaW50IGtleTsgICAgICAgICAgICAgICAvKiogVXNlIHRoZSBnaXZlbiBLZXlTaWduYXR1cmUgKG5vdGVzY2FsZSkgKi9cbiAgICBwdWJsaWMgVGltZVNpZ25hdHVyZSB0aW1lOyAgICAvKiogVXNlIHRoZSBnaXZlbiB0aW1lIHNpZ25hdHVyZSAqL1xuICAgIHB1YmxpYyBpbnQgY29tYmluZUludGVydmFsOyAgIC8qKiBDb21iaW5lIG5vdGVzIHdpdGhpbiBnaXZlbiB0aW1lIGludGVydmFsIChtc2VjKSAqL1xuICAgIHB1YmxpYyBDb2xvcltdIGNvbG9yczsgICAgICAgIC8qKiBUaGUgbm90ZSBjb2xvcnMgdG8gdXNlICovXG4gICAgcHVibGljIENvbG9yIHNoYWRlQ29sb3I7ICAgICAgLyoqIFRoZSBjb2xvciB0byB1c2UgZm9yIHNoYWRpbmcuICovXG4gICAgcHVibGljIENvbG9yIHNoYWRlMkNvbG9yOyAgICAgLyoqIFRoZSBjb2xvciB0byB1c2UgZm9yIHNoYWRpbmcgdGhlIGxlZnQgaGFuZCBwaWFubyAqL1xuXG4gICAgLy8gU291bmQgb3B0aW9uc1xuICAgIHB1YmxpYyBib29sIFtdbXV0ZTsgICAgICAgICAgICAvKiogV2hpY2ggdHJhY2tzIHRvIG11dGUgKHRydWUgPSBtdXRlKSAqL1xuICAgIHB1YmxpYyBpbnQgdGVtcG87ICAgICAgICAgICAgICAvKiogVGhlIHRlbXBvLCBpbiBtaWNyb3NlY29uZHMgcGVyIHF1YXJ0ZXIgbm90ZSAqL1xuICAgIHB1YmxpYyBpbnQgcGF1c2VUaW1lOyAgICAgICAgICAvKiogU3RhcnQgdGhlIG1pZGkgbXVzaWMgYXQgdGhlIGdpdmVuIHBhdXNlIHRpbWUgKi9cbiAgICBwdWJsaWMgaW50W10gaW5zdHJ1bWVudHM7ICAgICAgLyoqIFRoZSBpbnN0cnVtZW50cyB0byB1c2UgcGVyIHRyYWNrICovXG4gICAgcHVibGljIGJvb2wgdXNlRGVmYXVsdEluc3RydW1lbnRzOyAgLyoqIElmIHRydWUsIGRvbid0IGNoYW5nZSBpbnN0cnVtZW50cyAqL1xuICAgIHB1YmxpYyBib29sIHBsYXlNZWFzdXJlc0luTG9vcDsgICAgIC8qKiBQbGF5IHRoZSBzZWxlY3RlZCBtZWFzdXJlcyBpbiBhIGxvb3AgKi9cbiAgICBwdWJsaWMgaW50IHBsYXlNZWFzdXJlc0luTG9vcFN0YXJ0OyAvKiogU3RhcnQgbWVhc3VyZSB0byBwbGF5IGluIGxvb3AgKi9cbiAgICBwdWJsaWMgaW50IHBsYXlNZWFzdXJlc0luTG9vcEVuZDsgICAvKiogRW5kIG1lYXN1cmUgdG8gcGxheSBpbiBsb29wICovXG5cblxuICAgIHB1YmxpYyBNaWRpT3B0aW9ucygpIHtcbiAgICB9XG5cbiAgICBwdWJsaWMgTWlkaU9wdGlvbnMoTWlkaUZpbGUgbWlkaWZpbGUpIHtcbiAgICAgICAgZmlsZW5hbWUgPSBtaWRpZmlsZS5GaWxlTmFtZTtcbiAgICAgICAgdGl0bGUgPSBQYXRoLkdldEZpbGVOYW1lKG1pZGlmaWxlLkZpbGVOYW1lKTtcbiAgICAgICAgaW50IG51bXRyYWNrcyA9IG1pZGlmaWxlLlRyYWNrcy5Db3VudDtcbiAgICAgICAgdHJhY2tzID0gbmV3IGJvb2xbbnVtdHJhY2tzXTtcbiAgICAgICAgbXV0ZSA9ICBuZXcgYm9vbFtudW10cmFja3NdO1xuICAgICAgICBpbnN0cnVtZW50cyA9IG5ldyBpbnRbbnVtdHJhY2tzXTtcbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCB0cmFja3MuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRyYWNrc1tpXSA9IHRydWU7XG4gICAgICAgICAgICBtdXRlW2ldID0gZmFsc2U7XG4gICAgICAgICAgICBpbnN0cnVtZW50c1tpXSA9IG1pZGlmaWxlLlRyYWNrc1tpXS5JbnN0cnVtZW50O1xuICAgICAgICAgICAgaWYgKG1pZGlmaWxlLlRyYWNrc1tpXS5JbnN0cnVtZW50TmFtZSA9PSBcIlBlcmN1c3Npb25cIikge1xuICAgICAgICAgICAgICAgIHRyYWNrc1tpXSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIG11dGVbaV0gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IFxuICAgICAgICB1c2VEZWZhdWx0SW5zdHJ1bWVudHMgPSB0cnVlO1xuICAgICAgICBzY3JvbGxWZXJ0ID0gdHJ1ZTtcbiAgICAgICAgbGFyZ2VOb3RlU2l6ZSA9IGZhbHNlO1xuICAgICAgICBpZiAodHJhY2tzLkxlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgICB0d29TdGFmZnMgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdHdvU3RhZmZzID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgc2hvd05vdGVMZXR0ZXJzID0gTm90ZU5hbWVOb25lO1xuICAgICAgICBzaG93THlyaWNzID0gdHJ1ZTtcbiAgICAgICAgc2hvd01lYXN1cmVzID0gZmFsc2U7XG4gICAgICAgIHNoaWZ0dGltZSA9IDA7XG4gICAgICAgIHRyYW5zcG9zZSA9IDA7XG4gICAgICAgIGtleSA9IC0xO1xuICAgICAgICB0aW1lID0gbWlkaWZpbGUuVGltZTtcbiAgICAgICAgY29sb3JzID0gbnVsbDtcbiAgICAgICAgc2hhZGVDb2xvciA9IENvbG9yLkZyb21BcmdiKDEwMCwgNTMsIDEyMywgMjU1KTtcbiAgICAgICAgc2hhZGUyQ29sb3IgPSBDb2xvci5Gcm9tUmdiKDgwLCAxMDAsIDI1MCk7XG4gICAgICAgIGNvbWJpbmVJbnRlcnZhbCA9IDQwO1xuICAgICAgICB0ZW1wbyA9IG1pZGlmaWxlLlRpbWUuVGVtcG87XG4gICAgICAgIHBhdXNlVGltZSA9IDA7XG4gICAgICAgIHBsYXlNZWFzdXJlc0luTG9vcCA9IGZhbHNlOyBcbiAgICAgICAgcGxheU1lYXN1cmVzSW5Mb29wU3RhcnQgPSAwO1xuICAgICAgICBwbGF5TWVhc3VyZXNJbkxvb3BFbmQgPSBtaWRpZmlsZS5FbmRUaW1lKCkgLyBtaWRpZmlsZS5UaW1lLk1lYXN1cmU7XG4gICAgfVxuXG4gICAgLyogSm9pbiB0aGUgYXJyYXkgaW50byBhIGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgKi9cbiAgICBzdGF0aWMgc3RyaW5nIEpvaW4oYm9vbFtdIHZhbHVlcykge1xuICAgICAgICBTdHJpbmdCdWlsZGVyIHJlc3VsdCA9IG5ldyBTdHJpbmdCdWlsZGVyKCk7XG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgdmFsdWVzLkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQuQXBwZW5kKFwiLFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdC5BcHBlbmQodmFsdWVzW2ldLlRvU3RyaW5nKCkpOyBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0LlRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgc3RhdGljIHN0cmluZyBKb2luKGludFtdIHZhbHVlcykge1xuICAgICAgICBTdHJpbmdCdWlsZGVyIHJlc3VsdCA9IG5ldyBTdHJpbmdCdWlsZGVyKCk7XG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgdmFsdWVzLkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQuQXBwZW5kKFwiLFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdC5BcHBlbmQodmFsdWVzW2ldLlRvU3RyaW5nKCkpOyBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0LlRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgc3RhdGljIHN0cmluZyBKb2luKENvbG9yW10gdmFsdWVzKSB7XG4gICAgICAgIFN0cmluZ0J1aWxkZXIgcmVzdWx0ID0gbmV3IFN0cmluZ0J1aWxkZXIoKTtcbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCB2YWx1ZXMuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5BcHBlbmQoXCIsXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0LkFwcGVuZChDb2xvclRvU3RyaW5nKHZhbHVlc1tpXSkpOyBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0LlRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgc3RhdGljIHN0cmluZyBDb2xvclRvU3RyaW5nKENvbG9yIGMpIHtcbiAgICAgICAgcmV0dXJuIFwiXCIgKyBjLlIgKyBcIiBcIiArIGMuRyArIFwiIFwiICsgYy5CO1xuICAgIH1cblxuICAgIFxuICAgIC8qIE1lcmdlIGluIHRoZSBzYXZlZCBvcHRpb25zIHRvIHRoaXMgTWlkaU9wdGlvbnMuKi9cbiAgICBwdWJsaWMgdm9pZCBNZXJnZShNaWRpT3B0aW9ucyBzYXZlZCkge1xuICAgICAgICBpZiAoc2F2ZWQudHJhY2tzICE9IG51bGwgJiYgc2F2ZWQudHJhY2tzLkxlbmd0aCA9PSB0cmFja3MuTGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHRyYWNrcy5MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRyYWNrc1tpXSA9IHNhdmVkLnRyYWNrc1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoc2F2ZWQubXV0ZSAhPSBudWxsICYmIHNhdmVkLm11dGUuTGVuZ3RoID09IG11dGUuTGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IG11dGUuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBtdXRlW2ldID0gc2F2ZWQubXV0ZVtpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoc2F2ZWQuaW5zdHJ1bWVudHMgIT0gbnVsbCAmJiBzYXZlZC5pbnN0cnVtZW50cy5MZW5ndGggPT0gaW5zdHJ1bWVudHMuTGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IGluc3RydW1lbnRzLkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaW5zdHJ1bWVudHNbaV0gPSBzYXZlZC5pbnN0cnVtZW50c1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoc2F2ZWQudGltZSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aW1lID0gbmV3IFRpbWVTaWduYXR1cmUoc2F2ZWQudGltZS5OdW1lcmF0b3IsIHNhdmVkLnRpbWUuRGVub21pbmF0b3IsXG4gICAgICAgICAgICAgICAgICAgIHNhdmVkLnRpbWUuUXVhcnRlciwgc2F2ZWQudGltZS5UZW1wbyk7XG4gICAgICAgIH1cbiAgICAgICAgdXNlRGVmYXVsdEluc3RydW1lbnRzID0gc2F2ZWQudXNlRGVmYXVsdEluc3RydW1lbnRzO1xuICAgICAgICBzY3JvbGxWZXJ0ID0gc2F2ZWQuc2Nyb2xsVmVydDtcbiAgICAgICAgbGFyZ2VOb3RlU2l6ZSA9IHNhdmVkLmxhcmdlTm90ZVNpemU7XG4gICAgICAgIHNob3dMeXJpY3MgPSBzYXZlZC5zaG93THlyaWNzO1xuICAgICAgICB0d29TdGFmZnMgPSBzYXZlZC50d29TdGFmZnM7XG4gICAgICAgIHNob3dOb3RlTGV0dGVycyA9IHNhdmVkLnNob3dOb3RlTGV0dGVycztcbiAgICAgICAgdHJhbnNwb3NlID0gc2F2ZWQudHJhbnNwb3NlO1xuICAgICAgICBrZXkgPSBzYXZlZC5rZXk7XG4gICAgICAgIGNvbWJpbmVJbnRlcnZhbCA9IHNhdmVkLmNvbWJpbmVJbnRlcnZhbDtcbiAgICAgICAgaWYgKHNhdmVkLnNoYWRlQ29sb3IgIT0gQ29sb3IuV2hpdGUpIHtcbiAgICAgICAgICAgIHNoYWRlQ29sb3IgPSBzYXZlZC5zaGFkZUNvbG9yO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzYXZlZC5zaGFkZTJDb2xvciAhPSBDb2xvci5XaGl0ZSkge1xuICAgICAgICAgICAgc2hhZGUyQ29sb3IgPSBzYXZlZC5zaGFkZTJDb2xvcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2F2ZWQuY29sb3JzICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNvbG9ycyA9IHNhdmVkLmNvbG9ycztcbiAgICAgICAgfVxuICAgICAgICBzaG93TWVhc3VyZXMgPSBzYXZlZC5zaG93TWVhc3VyZXM7XG4gICAgICAgIHBsYXlNZWFzdXJlc0luTG9vcCA9IHNhdmVkLnBsYXlNZWFzdXJlc0luTG9vcDtcbiAgICAgICAgcGxheU1lYXN1cmVzSW5Mb29wU3RhcnQgPSBzYXZlZC5wbGF5TWVhc3VyZXNJbkxvb3BTdGFydDtcbiAgICAgICAgcGxheU1lYXN1cmVzSW5Mb29wRW5kID0gc2F2ZWQucGxheU1lYXN1cmVzSW5Mb29wRW5kO1xuICAgIH1cbn1cblxufVxuXG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMiBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcbntcblxuICAgIC8qKiBAY2xhc3MgTWlkaVRyYWNrXG4gICAgICogVGhlIE1pZGlUcmFjayB0YWtlcyBhcyBpbnB1dCB0aGUgcmF3IE1pZGlFdmVudHMgZm9yIHRoZSB0cmFjaywgYW5kIGdldHM6XG4gICAgICogLSBUaGUgbGlzdCBvZiBtaWRpIG5vdGVzIGluIHRoZSB0cmFjay5cbiAgICAgKiAtIFRoZSBmaXJzdCBpbnN0cnVtZW50IHVzZWQgaW4gdGhlIHRyYWNrLlxuICAgICAqXG4gICAgICogRm9yIGVhY2ggTm90ZU9uIGV2ZW50IGluIHRoZSBtaWRpIGZpbGUsIGEgbmV3IE1pZGlOb3RlIGlzIGNyZWF0ZWRcbiAgICAgKiBhbmQgYWRkZWQgdG8gdGhlIHRyYWNrLCB1c2luZyB0aGUgQWRkTm90ZSgpIG1ldGhvZC5cbiAgICAgKiBcbiAgICAgKiBUaGUgTm90ZU9mZigpIG1ldGhvZCBpcyBjYWxsZWQgd2hlbiBhIE5vdGVPZmYgZXZlbnQgaXMgZW5jb3VudGVyZWQsXG4gICAgICogaW4gb3JkZXIgdG8gdXBkYXRlIHRoZSBkdXJhdGlvbiBvZiB0aGUgTWlkaU5vdGUuXG4gICAgICovXG4gICAgcHVibGljIGNsYXNzIE1pZGlUcmFja1xuICAgIHtcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgaW50IG5vdGVJZENvdW50ZXIgPSAwOyAvKiogQ291bnRlciB1c2VkIHRvIGdlbmVyYXRlIHVuaXF1ZSBub3RlIElEcyAqL1xuICAgICAgICBwcml2YXRlIGludCB0cmFja251bTsgICAgICAgICAgICAgLyoqIFRoZSB0cmFjayBudW1iZXIgKi9cbiAgICAgICAgcHJpdmF0ZSBMaXN0PE1pZGlOb3RlPiBub3RlczsgICAgIC8qKiBMaXN0IG9mIE1pZGkgbm90ZXMgKi9cbiAgICAgICAgcHJpdmF0ZSBpbnQgaW5zdHJ1bWVudDsgICAgICAgICAgIC8qKiBJbnN0cnVtZW50IGZvciB0aGlzIHRyYWNrICovXG4gICAgICAgIHByaXZhdGUgTGlzdDxNaWRpRXZlbnQ+IGx5cmljczsgICAvKiogVGhlIGx5cmljcyBpbiB0aGlzIHRyYWNrICovXG5cbiAgICAgICAgLyoqIENyZWF0ZSBhbiBlbXB0eSBNaWRpVHJhY2suICBVc2VkIGJ5IHRoZSBDbG9uZSBtZXRob2QgKi9cbiAgICAgICAgcHVibGljIE1pZGlUcmFjayhpbnQgdHJhY2tudW0pXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMudHJhY2tudW0gPSB0cmFja251bTtcbiAgICAgICAgICAgIG5vdGVzID0gbmV3IExpc3Q8TWlkaU5vdGU+KDIwKTtcbiAgICAgICAgICAgIGluc3RydW1lbnQgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqIENyZWF0ZSBhIE1pZGlUcmFjayBiYXNlZCBvbiB0aGUgTWlkaSBldmVudHMuICBFeHRyYWN0IHRoZSBOb3RlT24vTm90ZU9mZlxuICAgICAgICAgKiAgZXZlbnRzIHRvIGdhdGhlciB0aGUgbGlzdCBvZiBNaWRpTm90ZXMuXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgTWlkaVRyYWNrKExpc3Q8TWlkaUV2ZW50PiBldmVudHMsIGludCB0cmFja251bSlcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy50cmFja251bSA9IHRyYWNrbnVtO1xuICAgICAgICAgICAgbm90ZXMgPSBuZXcgTGlzdDxNaWRpTm90ZT4oZXZlbnRzLkNvdW50KTtcbiAgICAgICAgICAgIGluc3RydW1lbnQgPSAwO1xuXG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbWV2ZW50IGluIGV2ZW50cylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBNaWRpRmlsZS5FdmVudE5vdGVPbiAmJiBtZXZlbnQuVmVsb2NpdHkgPiAwKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgTWlkaU5vdGUgbm90ZSA9IG5ldyBNaWRpTm90ZShub3RlSWRDb3VudGVyKyssIG1ldmVudC5TdGFydFRpbWUsIG1ldmVudC5DaGFubmVsLCBtZXZlbnQuTm90ZW51bWJlciwgMCwgbWV2ZW50LlZlbG9jaXR5KTtcbiAgICAgICAgICAgICAgICAgICAgQWRkTm90ZShub3RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBNaWRpRmlsZS5FdmVudE5vdGVPbiAmJiBtZXZlbnQuVmVsb2NpdHkgPT0gMClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIE5vdGVPZmYobWV2ZW50LkNoYW5uZWwsIG1ldmVudC5Ob3RlbnVtYmVyLCBtZXZlbnQuU3RhcnRUaW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBNaWRpRmlsZS5FdmVudE5vdGVPZmYpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBOb3RlT2ZmKG1ldmVudC5DaGFubmVsLCBtZXZlbnQuTm90ZW51bWJlciwgbWV2ZW50LlN0YXJ0VGltZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gTWlkaUZpbGUuRXZlbnRQcm9ncmFtQ2hhbmdlKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdHJ1bWVudCA9IG1ldmVudC5JbnN0cnVtZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuTWV0YWV2ZW50ID09IE1pZGlGaWxlLk1ldGFFdmVudEx5cmljKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgQWRkTHlyaWMobWV2ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm90ZXMuQ291bnQgPiAwICYmIG5vdGVzWzBdLkNoYW5uZWwgPT0gOSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpbnN0cnVtZW50ID0gMTI4OyAgLyogUGVyY3Vzc2lvbiAqL1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW50IGx5cmljY291bnQgPSAwO1xuICAgICAgICAgICAgaWYgKGx5cmljcyAhPSBudWxsKSB7IGx5cmljY291bnQgPSBseXJpY3MuQ291bnQ7IH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBpbnQgTnVtYmVyXG4gICAgICAgIHtcbiAgICAgICAgICAgIGdldCB7IHJldHVybiB0cmFja251bTsgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIExpc3Q8TWlkaU5vdGU+IE5vdGVzXG4gICAgICAgIHtcbiAgICAgICAgICAgIGdldCB7IHJldHVybiBub3RlczsgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIGludCBJbnN0cnVtZW50XG4gICAgICAgIHtcbiAgICAgICAgICAgIGdldCB7IHJldHVybiBpbnN0cnVtZW50OyB9XG4gICAgICAgICAgICBzZXQgeyBpbnN0cnVtZW50ID0gdmFsdWU7IH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdHJpbmcgSW5zdHJ1bWVudE5hbWVcbiAgICAgICAge1xuICAgICAgICAgICAgZ2V0XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKGluc3RydW1lbnQgPj0gMCAmJiBpbnN0cnVtZW50IDw9IDEyOClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1pZGlGaWxlLkluc3RydW1lbnRzW2luc3RydW1lbnRdO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgTGlzdDxNaWRpRXZlbnQ+IEx5cmljc1xuICAgICAgICB7XG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gbHlyaWNzOyB9XG4gICAgICAgICAgICBzZXQgeyBseXJpY3MgPSB2YWx1ZTsgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqIEFkZCBhIE1pZGlOb3RlIHRvIHRoaXMgdHJhY2suICBUaGlzIGlzIGNhbGxlZCBmb3IgZWFjaCBOb3RlT24gZXZlbnQgKi9cbiAgICAgICAgcHVibGljIHZvaWQgQWRkTm90ZShNaWRpTm90ZSBtKVxuICAgICAgICB7XG4gICAgICAgICAgICBub3Rlcy5BZGQobSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogQSBOb3RlT2ZmIGV2ZW50IG9jY3VyZWQuICBGaW5kIHRoZSBNaWRpTm90ZSBvZiB0aGUgY29ycmVzcG9uZGluZ1xuICAgICAgICAgKiBOb3RlT24gZXZlbnQsIGFuZCB1cGRhdGUgdGhlIGR1cmF0aW9uIG9mIHRoZSBNaWRpTm90ZS5cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyB2b2lkIE5vdGVPZmYoaW50IGNoYW5uZWwsIGludCBub3RlbnVtYmVyLCBpbnQgZW5kdGltZSlcbiAgICAgICAge1xuICAgICAgICAgICAgZm9yIChpbnQgaSA9IG5vdGVzLkNvdW50IC0gMTsgaSA+PSAwOyBpLS0pXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgTWlkaU5vdGUgbm90ZSA9IG5vdGVzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChub3RlLkNoYW5uZWwgPT0gY2hhbm5lbCAmJiBub3RlLk51bWJlciA9PSBub3RlbnVtYmVyICYmXG4gICAgICAgICAgICAgICAgICAgIG5vdGUuRHVyYXRpb24gPT0gMClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5vdGUuTm90ZU9mZihlbmR0aW1lKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBBZGQgYSBMeXJpYyBNaWRpRXZlbnQgKi9cbiAgICAgICAgcHVibGljIHZvaWQgQWRkTHlyaWMoTWlkaUV2ZW50IG1ldmVudClcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKGx5cmljcyA9PSBudWxsKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGx5cmljcyA9IG5ldyBMaXN0PE1pZGlFdmVudD4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGx5cmljcy5BZGQobWV2ZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBSZXR1cm4gYSBkZWVwIGNvcHkgY2xvbmUgb2YgdGhpcyBNaWRpVHJhY2suICovXG4gICAgICAgIHB1YmxpYyBNaWRpVHJhY2sgQ2xvbmUoKVxuICAgICAgICB7XG4gICAgICAgICAgICBNaWRpVHJhY2sgdHJhY2sgPSBuZXcgTWlkaVRyYWNrKE51bWJlcik7XG4gICAgICAgICAgICB0cmFjay5pbnN0cnVtZW50ID0gaW5zdHJ1bWVudDtcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG5vdGUgaW4gbm90ZXMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHJhY2subm90ZXMuQWRkKG5vdGUuQ2xvbmUoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobHlyaWNzICE9IG51bGwpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHJhY2subHlyaWNzID0gbmV3IExpc3Q8TWlkaUV2ZW50PigpO1xuICAgICAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBldiBpbiBseXJpY3MpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0cmFjay5seXJpY3MuQWRkKGV2KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJhY2s7XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHN0cmluZyByZXN1bHQgPSBcIlRyYWNrIG51bWJlcj1cIiArIHRyYWNrbnVtICsgXCIgaW5zdHJ1bWVudD1cIiArIGluc3RydW1lbnQgKyBcIlxcblwiO1xuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbiBpbiBub3RlcylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgKyBuICsgXCJcXG5cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdCArPSBcIkVuZCBUcmFja1xcblwiO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgIH1cblxufVxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogRW51bWVyYXRpb24gb2YgdGhlIG5vdGVzIGluIGEgc2NhbGUgKEEsIEEjLCAuLi4gRyMpICovXG5wdWJsaWMgY2xhc3MgTm90ZVNjYWxlIHtcbiAgICBwdWJsaWMgY29uc3QgaW50IEEgICAgICA9IDA7XG4gICAgcHVibGljIGNvbnN0IGludCBBc2hhcnAgPSAxO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQmZsYXQgID0gMTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEIgICAgICA9IDI7XG4gICAgcHVibGljIGNvbnN0IGludCBDICAgICAgPSAzO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQ3NoYXJwID0gNDtcbiAgICBwdWJsaWMgY29uc3QgaW50IERmbGF0ICA9IDQ7XG4gICAgcHVibGljIGNvbnN0IGludCBEICAgICAgPSA1O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRHNoYXJwID0gNjtcbiAgICBwdWJsaWMgY29uc3QgaW50IEVmbGF0ICA9IDY7XG4gICAgcHVibGljIGNvbnN0IGludCBFICAgICAgPSA3O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRiAgICAgID0gODtcbiAgICBwdWJsaWMgY29uc3QgaW50IEZzaGFycCA9IDk7XG4gICAgcHVibGljIGNvbnN0IGludCBHZmxhdCAgPSA5O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRyAgICAgID0gMTA7XG4gICAgcHVibGljIGNvbnN0IGludCBHc2hhcnAgPSAxMTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEFmbGF0ICA9IDExO1xuXG4gICAgLyoqIENvbnZlcnQgYSBub3RlIChBLCBBIywgQiwgZXRjKSBhbmQgb2N0YXZlIGludG8gYVxuICAgICAqIE1pZGkgTm90ZSBudW1iZXIuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBpbnQgVG9OdW1iZXIoaW50IG5vdGVzY2FsZSwgaW50IG9jdGF2ZSkge1xuICAgICAgICByZXR1cm4gOSArIG5vdGVzY2FsZSArIG9jdGF2ZSAqIDEyO1xuICAgIH1cblxuICAgIC8qKiBDb252ZXJ0IGEgTWlkaSBub3RlIG51bWJlciBpbnRvIGEgbm90ZXNjYWxlIChBLCBBIywgQikgKi9cbiAgICBwdWJsaWMgc3RhdGljIGludCBGcm9tTnVtYmVyKGludCBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIChudW1iZXIgKyAzKSAlIDEyO1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGlzIG5vdGVzY2FsZSBudW1iZXIgaXMgYSBibGFjayBrZXkgKi9cbiAgICBwdWJsaWMgc3RhdGljIGJvb2wgSXNCbGFja0tleShpbnQgbm90ZXNjYWxlKSB7XG4gICAgICAgIGlmIChub3Rlc2NhbGUgPT0gQXNoYXJwIHx8XG4gICAgICAgICAgICBub3Rlc2NhbGUgPT0gQ3NoYXJwIHx8XG4gICAgICAgICAgICBub3Rlc2NhbGUgPT0gRHNoYXJwIHx8XG4gICAgICAgICAgICBub3Rlc2NhbGUgPT0gRnNoYXJwIHx8XG4gICAgICAgICAgICBub3Rlc2NhbGUgPT0gR3NoYXJwKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbi8qKiBAY2xhc3MgV2hpdGVOb3RlXG4gKiBUaGUgV2hpdGVOb3RlIGNsYXNzIHJlcHJlc2VudHMgYSB3aGl0ZSBrZXkgbm90ZSwgYSBub24tc2hhcnAsXG4gKiBub24tZmxhdCBub3RlLiAgVG8gZGlzcGxheSBtaWRpIG5vdGVzIGFzIHNoZWV0IG11c2ljLCB0aGUgbm90ZXNcbiAqIG11c3QgYmUgY29udmVydGVkIHRvIHdoaXRlIG5vdGVzIGFuZCBhY2NpZGVudGFscy4gXG4gKlxuICogV2hpdGUgbm90ZXMgY29uc2lzdCBvZiBhIGxldHRlciAoQSB0aHJ1IEcpIGFuZCBhbiBvY3RhdmUgKDAgdGhydSAxMCkuXG4gKiBUaGUgb2N0YXZlIGNoYW5nZXMgZnJvbSBHIHRvIEEuICBBZnRlciBHMiBjb21lcyBBMy4gIE1pZGRsZS1DIGlzIEM0LlxuICpcbiAqIFRoZSBtYWluIG9wZXJhdGlvbnMgYXJlIGNhbGN1bGF0aW5nIGRpc3RhbmNlcyBiZXR3ZWVuIG5vdGVzLCBhbmQgY29tcGFyaW5nIG5vdGVzLlxuICovIFxuXG5wdWJsaWMgY2xhc3MgV2hpdGVOb3RlIDogSUNvbXBhcmVyPFdoaXRlTm90ZT4ge1xuXG4gICAgLyogVGhlIHBvc3NpYmxlIG5vdGUgbGV0dGVycyAqL1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQSA9IDA7XG4gICAgcHVibGljIGNvbnN0IGludCBCID0gMTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEMgPSAyO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRCA9IDM7XG4gICAgcHVibGljIGNvbnN0IGludCBFID0gNDtcbiAgICBwdWJsaWMgY29uc3QgaW50IEYgPSA1O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRyA9IDY7XG5cbiAgICAvKiBDb21tb24gd2hpdGUgbm90ZXMgdXNlZCBpbiBjYWxjdWxhdGlvbnMgKi9cbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBUb3BUcmVibGUgPSBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5FLCA1KTtcbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBCb3R0b21UcmVibGUgPSBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5GLCA0KTtcbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBUb3BCYXNzID0gbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRywgMyk7XG4gICAgcHVibGljIHN0YXRpYyBXaGl0ZU5vdGUgQm90dG9tQmFzcyA9IG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkEsIDMpO1xuICAgIHB1YmxpYyBzdGF0aWMgV2hpdGVOb3RlIE1pZGRsZUMgPSBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5DLCA0KTtcblxuICAgIHByaXZhdGUgaW50IGxldHRlcjsgIC8qIFRoZSBsZXR0ZXIgb2YgdGhlIG5vdGUsIEEgdGhydSBHICovXG4gICAgcHJpdmF0ZSBpbnQgb2N0YXZlOyAgLyogVGhlIG9jdGF2ZSwgMCB0aHJ1IDEwLiAqL1xuXG4gICAgLyogR2V0IHRoZSBsZXR0ZXIgKi9cbiAgICBwdWJsaWMgaW50IExldHRlciB7XG4gICAgICAgIGdldCB7IHJldHVybiBsZXR0ZXI7IH1cbiAgICB9XG5cbiAgICAvKiBHZXQgdGhlIG9jdGF2ZSAqL1xuICAgIHB1YmxpYyBpbnQgT2N0YXZlIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIG9jdGF2ZTsgfVxuICAgIH1cblxuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBub3RlIHdpdGggdGhlIGdpdmVuIGxldHRlciBhbmQgb2N0YXZlLiAqL1xuICAgIHB1YmxpYyBXaGl0ZU5vdGUoaW50IGxldHRlciwgaW50IG9jdGF2ZSkge1xuICAgICAgICBpZiAoIShsZXR0ZXIgPj0gMCAmJiBsZXR0ZXIgPD0gNikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBTeXN0ZW0uQXJndW1lbnRFeGNlcHRpb24oXCJMZXR0ZXIgXCIgKyBsZXR0ZXIgKyBcIiBpcyBpbmNvcnJlY3RcIik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxldHRlciA9IGxldHRlcjtcbiAgICAgICAgdGhpcy5vY3RhdmUgPSBvY3RhdmU7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgZGlzdGFuY2UgKGluIHdoaXRlIG5vdGVzKSBiZXR3ZWVuIHRoaXMgbm90ZVxuICAgICAqIGFuZCBub3RlIHcsIGkuZS4gIHRoaXMgLSB3LiAgRm9yIGV4YW1wbGUsIEM0IC0gQTQgPSAyLFxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgRGlzdChXaGl0ZU5vdGUgdykge1xuICAgICAgICByZXR1cm4gKG9jdGF2ZSAtIHcub2N0YXZlKSAqIDcgKyAobGV0dGVyIC0gdy5sZXR0ZXIpO1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhpcyBub3RlIHBsdXMgdGhlIGdpdmVuIGFtb3VudCAoaW4gd2hpdGUgbm90ZXMpLlxuICAgICAqIFRoZSBhbW91bnQgbWF5IGJlIHBvc2l0aXZlIG9yIG5lZ2F0aXZlLiAgRm9yIGV4YW1wbGUsXG4gICAgICogQTQgKyAyID0gQzQsIGFuZCBDNCArICgtMikgPSBBNC5cbiAgICAgKi9cbiAgICBwdWJsaWMgV2hpdGVOb3RlIEFkZChpbnQgYW1vdW50KSB7XG4gICAgICAgIGludCBudW0gPSBvY3RhdmUgKiA3ICsgbGV0dGVyO1xuICAgICAgICBudW0gKz0gYW1vdW50O1xuICAgICAgICBpZiAobnVtIDwgMCkge1xuICAgICAgICAgICAgbnVtID0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFdoaXRlTm90ZShudW0gJSA3LCBudW0gLyA3KTtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBtaWRpIG5vdGUgbnVtYmVyIGNvcnJlc3BvbmRpbmcgdG8gdGhpcyB3aGl0ZSBub3RlLlxuICAgICAqIFRoZSBtaWRpIG5vdGUgbnVtYmVycyBjb3ZlciBhbGwga2V5cywgaW5jbHVkaW5nIHNoYXJwcy9mbGF0cyxcbiAgICAgKiBzbyBlYWNoIG9jdGF2ZSBpcyAxMiBub3Rlcy4gIE1pZGRsZSBDIChDNCkgaXMgNjAuICBTb21lIGV4YW1wbGVcbiAgICAgKiBudW1iZXJzIGZvciB2YXJpb3VzIG5vdGVzOlxuICAgICAqXG4gICAgICogIEEgMiA9IDMzXG4gICAgICogIEEjMiA9IDM0XG4gICAgICogIEcgMiA9IDQzXG4gICAgICogIEcjMiA9IDQ0IFxuICAgICAqICBBIDMgPSA0NVxuICAgICAqICBBIDQgPSA1N1xuICAgICAqICBBIzQgPSA1OFxuICAgICAqICBCIDQgPSA1OVxuICAgICAqICBDIDQgPSA2MFxuICAgICAqL1xuXG4gICAgcHVibGljIGludCBOdW1iZXIoKSB7XG4gICAgICAgIGludCBvZmZzZXQgPSAwO1xuICAgICAgICBzd2l0Y2ggKGxldHRlcikge1xuICAgICAgICAgICAgY2FzZSBBOiBvZmZzZXQgPSBOb3RlU2NhbGUuQTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEI6IG9mZnNldCA9IE5vdGVTY2FsZS5COyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQzogb2Zmc2V0ID0gTm90ZVNjYWxlLkM7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBEOiBvZmZzZXQgPSBOb3RlU2NhbGUuRDsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEU6IG9mZnNldCA9IE5vdGVTY2FsZS5FOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgRjogb2Zmc2V0ID0gTm90ZVNjYWxlLkY7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBHOiBvZmZzZXQgPSBOb3RlU2NhbGUuRzsgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OiBvZmZzZXQgPSAwOyBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTm90ZVNjYWxlLlRvTnVtYmVyKG9mZnNldCwgb2N0YXZlKTtcbiAgICB9XG5cbiAgICAvKiogQ29tcGFyZSB0aGUgdHdvIG5vdGVzLiAgUmV0dXJuXG4gICAgICogIDwgMCAgaWYgeCBpcyBsZXNzIChsb3dlcikgdGhhbiB5XG4gICAgICogICAgMCAgaWYgeCBpcyBlcXVhbCB0byB5XG4gICAgICogID4gMCAgaWYgeCBpcyBncmVhdGVyIChoaWdoZXIpIHRoYW4geVxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgQ29tcGFyZShXaGl0ZU5vdGUgeCwgV2hpdGVOb3RlIHkpIHtcbiAgICAgICAgcmV0dXJuIHguRGlzdCh5KTtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBoaWdoZXIgbm90ZSwgeCBvciB5ICovXG4gICAgcHVibGljIHN0YXRpYyBXaGl0ZU5vdGUgTWF4KFdoaXRlTm90ZSB4LCBXaGl0ZU5vdGUgeSkge1xuICAgICAgICBpZiAoeC5EaXN0KHkpID4gMClcbiAgICAgICAgICAgIHJldHVybiB4O1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4geTtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBsb3dlciBub3RlLCB4IG9yIHkgKi9cbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBNaW4oV2hpdGVOb3RlIHgsIFdoaXRlTm90ZSB5KSB7XG4gICAgICAgIGlmICh4LkRpc3QoeSkgPCAwKVxuICAgICAgICAgICAgcmV0dXJuIHg7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB5O1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIHRvcCBub3RlIGluIHRoZSBzdGFmZiBvZiB0aGUgZ2l2ZW4gY2xlZiAqL1xuICAgIHB1YmxpYyBzdGF0aWMgV2hpdGVOb3RlIFRvcChDbGVmIGNsZWYpIHtcbiAgICAgICAgaWYgKGNsZWYgPT0gQ2xlZi5UcmVibGUpXG4gICAgICAgICAgICByZXR1cm4gVG9wVHJlYmxlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gVG9wQmFzcztcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBib3R0b20gbm90ZSBpbiB0aGUgc3RhZmYgb2YgdGhlIGdpdmVuIGNsZWYgKi9cbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBCb3R0b20oQ2xlZiBjbGVmKSB7XG4gICAgICAgIGlmIChjbGVmID09IENsZWYuVHJlYmxlKVxuICAgICAgICAgICAgcmV0dXJuIEJvdHRvbVRyZWJsZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIEJvdHRvbUJhc3M7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgc3RyaW5nIDxsZXR0ZXI+PG9jdGF2ZT4gZm9yIHRoaXMgbm90ZS4gKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgXG4gICAgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICBzdHJpbmdbXSBzID0geyBcIkFcIiwgXCJCXCIsIFwiQ1wiLCBcIkRcIiwgXCJFXCIsIFwiRlwiLCBcIkdcIiB9O1xuICAgICAgICByZXR1cm4gc1tsZXR0ZXJdICsgb2N0YXZlO1xuICAgIH1cbn1cblxuXG5cbn1cbiIsInVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xue1xuICAgIHB1YmxpYyBjbGFzcyBQYWludEV2ZW50QXJnc1xuICAgIHtcbiAgICAgICAgcHVibGljIFJlY3RhbmdsZSBDbGlwUmVjdGFuZ2xlIHsgZ2V0OyBzZXQ7IH1cblxuICAgICAgICBwdWJsaWMgR3JhcGhpY3MgR3JhcGhpY3MoKSB7IHJldHVybiBuZXcgR3JhcGhpY3MoXCJtYWluXCIpOyB9XG4gICAgfVxufVxuIiwidXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXG57XG4gICAgcHVibGljIGNsYXNzIFBhbmVsXG4gICAge1xuICAgICAgICBwcml2YXRlIFBvaW50IGF1dG9TY3JvbGxQb3NpdGlvbj1uZXcgUG9pbnQoMCwwKTtcbiAgICAgICAgcHVibGljIFBvaW50IEF1dG9TY3JvbGxQb3NpdGlvbiB7IGdldCB7IHJldHVybiBhdXRvU2Nyb2xsUG9zaXRpb247IH0gc2V0IHsgYXV0b1Njcm9sbFBvc2l0aW9uID0gdmFsdWU7IH0gfVxuXG4gICAgICAgIHB1YmxpYyBpbnQgV2lkdGg7XG4gICAgICAgIHB1YmxpYyBpbnQgSGVpZ2h0O1xuICAgIH1cbn1cbiIsInVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xue1xuICAgIHB1YmxpYyBzdGF0aWMgY2xhc3MgUGF0aFxuICAgIHtcbiAgICAgICAgcHVibGljIHN0YXRpYyBzdHJpbmcgR2V0RmlsZU5hbWUoc3RyaW5nIGZpbGVuYW1lKSB7IHJldHVybiBudWxsOyB9XG4gICAgfVxufVxuIiwidXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXG57XG4gICAgcHVibGljIGNsYXNzIFBlblxuICAgIHtcbiAgICAgICAgcHVibGljIENvbG9yIENvbG9yO1xuICAgICAgICBwdWJsaWMgaW50IFdpZHRoO1xuICAgICAgICBwdWJsaWMgTGluZUNhcCBFbmRDYXA7XG5cbiAgICAgICAgcHVibGljIFBlbihDb2xvciBjb2xvciwgaW50IHdpZHRoKVxuICAgICAgICB7XG4gICAgICAgICAgICBDb2xvciA9IGNvbG9yO1xuICAgICAgICAgICAgV2lkdGggPSB3aWR0aDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsInVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xue1xuICAgIHB1YmxpYyBjbGFzcyBQb2ludFxuICAgIHtcbiAgICAgICAgcHVibGljIGludCBYO1xuICAgICAgICBwdWJsaWMgaW50IFk7XG5cbiAgICAgICAgcHVibGljIFBvaW50KGludCB4LCBpbnQgeSlcbiAgICAgICAge1xuICAgICAgICAgICAgWCA9IHg7XG4gICAgICAgICAgICBZID0geTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsInVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xue1xuICAgIHB1YmxpYyBjbGFzcyBSZWN0YW5nbGVcbiAgICB7XG4gICAgICAgIHB1YmxpYyBpbnQgWDtcbiAgICAgICAgcHVibGljIGludCBZO1xuICAgICAgICBwdWJsaWMgaW50IFdpZHRoO1xuICAgICAgICBwdWJsaWMgaW50IEhlaWdodDtcblxuICAgICAgICBwdWJsaWMgUmVjdGFuZ2xlKGludCB4LCBpbnQgeSwgaW50IHdpZHRoLCBpbnQgaGVpZ2h0KVxuICAgICAgICB7XG4gICAgICAgICAgICBYID0geDtcbiAgICAgICAgICAgIFkgPSB5O1xuICAgICAgICAgICAgV2lkdGggPSB3aWR0aDtcbiAgICAgICAgICAgIEhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMSBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXG57XG5cbiAgICAvKiBAY2xhc3MgU3RhZmZcbiAgICAgKiBUaGUgU3RhZmYgaXMgdXNlZCB0byBkcmF3IGEgc2luZ2xlIFN0YWZmIChhIHJvdyBvZiBtZWFzdXJlcykgaW4gdGhlIFxuICAgICAqIFNoZWV0TXVzaWMgQ29udHJvbC4gQSBTdGFmZiBuZWVkcyB0byBkcmF3XG4gICAgICogLSBUaGUgQ2xlZlxuICAgICAqIC0gVGhlIGtleSBzaWduYXR1cmVcbiAgICAgKiAtIFRoZSBob3Jpem9udGFsIGxpbmVzXG4gICAgICogLSBBIGxpc3Qgb2YgTXVzaWNTeW1ib2xzXG4gICAgICogLSBUaGUgbGVmdCBhbmQgcmlnaHQgdmVydGljYWwgbGluZXNcbiAgICAgKlxuICAgICAqIFRoZSBoZWlnaHQgb2YgdGhlIFN0YWZmIGlzIGRldGVybWluZWQgYnkgdGhlIG51bWJlciBvZiBwaXhlbHMgZWFjaFxuICAgICAqIE11c2ljU3ltYm9sIGV4dGVuZHMgYWJvdmUgYW5kIGJlbG93IHRoZSBzdGFmZi5cbiAgICAgKlxuICAgICAqIFRoZSB2ZXJ0aWNhbCBsaW5lcyAobGVmdCBhbmQgcmlnaHQgc2lkZXMpIG9mIHRoZSBzdGFmZiBhcmUgam9pbmVkXG4gICAgICogd2l0aCB0aGUgc3RhZmZzIGFib3ZlIGFuZCBiZWxvdyBpdCwgd2l0aCBvbmUgZXhjZXB0aW9uLiAgXG4gICAgICogVGhlIGxhc3QgdHJhY2sgaXMgbm90IGpvaW5lZCB3aXRoIHRoZSBmaXJzdCB0cmFjay5cbiAgICAgKi9cblxuICAgIHB1YmxpYyBjbGFzcyBTdGFmZlxuICAgIHtcbiAgICAgICAgcHJpdmF0ZSBMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzOyAgLyoqIFRoZSBtdXNpYyBzeW1ib2xzIGluIHRoaXMgc3RhZmYgKi9cbiAgICAgICAgcHJpdmF0ZSBMaXN0PEx5cmljU3ltYm9sPiBseXJpY3M7ICAgLyoqIFRoZSBseXJpY3MgdG8gZGlzcGxheSAoY2FuIGJlIG51bGwpICovXG4gICAgICAgIHByaXZhdGUgaW50IHl0b3A7ICAgICAgICAgICAgICAgICAgIC8qKiBUaGUgeSBwaXhlbCBvZiB0aGUgdG9wIG9mIHRoZSBzdGFmZiAqL1xuICAgICAgICBwcml2YXRlIENsZWZTeW1ib2wgY2xlZnN5bTsgICAgICAgICAvKiogVGhlIGxlZnQtc2lkZSBDbGVmIHN5bWJvbCAqL1xuICAgICAgICBwcml2YXRlIEFjY2lkU3ltYm9sW10ga2V5czsgICAgICAgICAvKiogVGhlIGtleSBzaWduYXR1cmUgc3ltYm9scyAqL1xuICAgICAgICBwcml2YXRlIGJvb2wgc2hvd01lYXN1cmVzOyAgICAgICAgICAvKiogSWYgdHJ1ZSwgc2hvdyB0aGUgbWVhc3VyZSBudW1iZXJzICovXG4gICAgICAgIHByaXZhdGUgaW50IGtleXNpZ1dpZHRoOyAgICAgICAgICAgIC8qKiBUaGUgd2lkdGggb2YgdGhlIGNsZWYgYW5kIGtleSBzaWduYXR1cmUgKi9cbiAgICAgICAgcHJpdmF0ZSBpbnQgd2lkdGg7ICAgICAgICAgICAgICAgICAgLyoqIFRoZSB3aWR0aCBvZiB0aGUgc3RhZmYgaW4gcGl4ZWxzICovXG4gICAgICAgIHByaXZhdGUgaW50IGhlaWdodDsgICAgICAgICAgICAgICAgIC8qKiBUaGUgaGVpZ2h0IG9mIHRoZSBzdGFmZiBpbiBwaXhlbHMgKi9cbiAgICAgICAgcHJpdmF0ZSBpbnQgdHJhY2tudW07ICAgICAgICAgICAgICAgLyoqIFRoZSB0cmFjayB0aGlzIHN0YWZmIHJlcHJlc2VudHMgKi9cbiAgICAgICAgcHJpdmF0ZSBpbnQgdG90YWx0cmFja3M7ICAgICAgICAgICAgLyoqIFRoZSB0b3RhbCBudW1iZXIgb2YgdHJhY2tzICovXG4gICAgICAgIHByaXZhdGUgaW50IHN0YXJ0dGltZTsgICAgICAgICAgICAgIC8qKiBUaGUgdGltZSAoaW4gcHVsc2VzKSBvZiBmaXJzdCBzeW1ib2wgKi9cbiAgICAgICAgcHJpdmF0ZSBpbnQgZW5kdGltZTsgICAgICAgICAgICAgICAgLyoqIFRoZSB0aW1lIChpbiBwdWxzZXMpIG9mIGxhc3Qgc3ltYm9sICovXG4gICAgICAgIHByaXZhdGUgaW50IG1lYXN1cmVMZW5ndGg7ICAgICAgICAgIC8qKiBUaGUgdGltZSAoaW4gcHVsc2VzKSBvZiBhIG1lYXN1cmUgKi9cblxuICAgICAgICAvKiogQ3JlYXRlIGEgbmV3IHN0YWZmIHdpdGggdGhlIGdpdmVuIGxpc3Qgb2YgbXVzaWMgc3ltYm9scyxcbiAgICAgICAgICogYW5kIHRoZSBnaXZlbiBrZXkgc2lnbmF0dXJlLiAgVGhlIGNsZWYgaXMgZGV0ZXJtaW5lZCBieVxuICAgICAgICAgKiB0aGUgY2xlZiBvZiB0aGUgZmlyc3QgY2hvcmQgc3ltYm9sLiBUaGUgdHJhY2sgbnVtYmVyIGlzIHVzZWRcbiAgICAgICAgICogdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdG8gam9pbiB0aGlzIGxlZnQvcmlnaHQgdmVydGljYWwgc2lkZXNcbiAgICAgICAgICogd2l0aCB0aGUgc3RhZmZzIGFib3ZlIGFuZCBiZWxvdy4gVGhlIFNoZWV0TXVzaWNPcHRpb25zIGFyZSB1c2VkXG4gICAgICAgICAqIHRvIGNoZWNrIHdoZXRoZXIgdG8gZGlzcGxheSBtZWFzdXJlIG51bWJlcnMgb3Igbm90LlxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIFN0YWZmKExpc3Q8TXVzaWNTeW1ib2w+IHN5bWJvbHMsIEtleVNpZ25hdHVyZSBrZXksXG4gICAgICAgICAgICAgICAgICAgICBNaWRpT3B0aW9ucyBvcHRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgaW50IHRyYWNrbnVtLCBpbnQgdG90YWx0cmFja3MpXG4gICAgICAgIHtcblxuICAgICAgICAgICAga2V5c2lnV2lkdGggPSBTaGVldE11c2ljLktleVNpZ25hdHVyZVdpZHRoKGtleSk7XG4gICAgICAgICAgICB0aGlzLnRyYWNrbnVtID0gdHJhY2tudW07XG4gICAgICAgICAgICB0aGlzLnRvdGFsdHJhY2tzID0gdG90YWx0cmFja3M7XG4gICAgICAgICAgICBzaG93TWVhc3VyZXMgPSAob3B0aW9ucy5zaG93TWVhc3VyZXMgJiYgdHJhY2tudW0gPT0gMCk7XG4gICAgICAgICAgICBtZWFzdXJlTGVuZ3RoID0gb3B0aW9ucy50aW1lLk1lYXN1cmU7XG4gICAgICAgICAgICBDbGVmIGNsZWYgPSBGaW5kQ2xlZihzeW1ib2xzKTtcblxuICAgICAgICAgICAgY2xlZnN5bSA9IG5ldyBDbGVmU3ltYm9sKGNsZWYsIDAsIGZhbHNlKTtcbiAgICAgICAgICAgIGtleXMgPSBrZXkuR2V0U3ltYm9scyhjbGVmKTtcbiAgICAgICAgICAgIHRoaXMuc3ltYm9scyA9IHN5bWJvbHM7XG4gICAgICAgICAgICBDYWxjdWxhdGVXaWR0aChvcHRpb25zLnNjcm9sbFZlcnQpO1xuICAgICAgICAgICAgQ2FsY3VsYXRlSGVpZ2h0KCk7XG4gICAgICAgICAgICBDYWxjdWxhdGVTdGFydEVuZFRpbWUoKTtcbiAgICAgICAgICAgIEZ1bGxKdXN0aWZ5KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogUmV0dXJuIHRoZSB3aWR0aCBvZiB0aGUgc3RhZmYgKi9cbiAgICAgICAgcHVibGljIGludCBXaWR0aFxuICAgICAgICB7XG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gd2lkdGg7IH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBSZXR1cm4gdGhlIGhlaWdodCBvZiB0aGUgc3RhZmYgKi9cbiAgICAgICAgcHVibGljIGludCBIZWlnaHRcbiAgICAgICAge1xuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIGhlaWdodDsgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqIFJldHVybiB0aGUgdHJhY2sgbnVtYmVyIG9mIHRoaXMgc3RhZmYgKHN0YXJ0aW5nIGZyb20gMCAqL1xuICAgICAgICBwdWJsaWMgaW50IFRyYWNrXG4gICAgICAgIHtcbiAgICAgICAgICAgIGdldCB7IHJldHVybiB0cmFja251bTsgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqIFJldHVybiB0aGUgc3RhcnRpbmcgdGltZSBvZiB0aGUgc3RhZmYsIHRoZSBzdGFydCB0aW1lIG9mXG4gICAgICAgICAqICB0aGUgZmlyc3Qgc3ltYm9sLiAgVGhpcyBpcyB1c2VkIGR1cmluZyBwbGF5YmFjaywgdG8gXG4gICAgICAgICAqICBhdXRvbWF0aWNhbGx5IHNjcm9sbCB0aGUgbXVzaWMgd2hpbGUgcGxheWluZy5cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBpbnQgU3RhcnRUaW1lXG4gICAgICAgIHtcbiAgICAgICAgICAgIGdldCB7IHJldHVybiBzdGFydHRpbWU7IH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBSZXR1cm4gdGhlIGVuZGluZyB0aW1lIG9mIHRoZSBzdGFmZiwgdGhlIGVuZHRpbWUgb2ZcbiAgICAgICAgICogIHRoZSBsYXN0IHN5bWJvbC4gIFRoaXMgaXMgdXNlZCBkdXJpbmcgcGxheWJhY2ssIHRvIFxuICAgICAgICAgKiAgYXV0b21hdGljYWxseSBzY3JvbGwgdGhlIG11c2ljIHdoaWxlIHBsYXlpbmcuXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgaW50IEVuZFRpbWVcbiAgICAgICAge1xuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIGVuZHRpbWU7IH1cbiAgICAgICAgICAgIHNldCB7IGVuZHRpbWUgPSB2YWx1ZTsgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqIEZpbmQgdGhlIGluaXRpYWwgY2xlZiB0byB1c2UgZm9yIHRoaXMgc3RhZmYuICBVc2UgdGhlIGNsZWYgb2ZcbiAgICAgICAgICogdGhlIGZpcnN0IENob3JkU3ltYm9sLlxuICAgICAgICAgKi9cbiAgICAgICAgcHJpdmF0ZSBDbGVmIEZpbmRDbGVmKExpc3Q8TXVzaWNTeW1ib2w+IGxpc3QpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIG0gaW4gbGlzdClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAobSBpcyBDaG9yZFN5bWJvbClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIENob3JkU3ltYm9sIGMgPSAoQ2hvcmRTeW1ib2wpbTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGMuQ2xlZjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gQ2xlZi5UcmVibGU7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogQ2FsY3VsYXRlIHRoZSBoZWlnaHQgb2YgdGhpcyBzdGFmZi4gIEVhY2ggTXVzaWNTeW1ib2wgY29udGFpbnMgdGhlXG4gICAgICAgICAqIG51bWJlciBvZiBwaXhlbHMgaXQgbmVlZHMgYWJvdmUgYW5kIGJlbG93IHRoZSBzdGFmZi4gIEdldCB0aGUgbWF4aW11bVxuICAgICAgICAgKiB2YWx1ZXMgYWJvdmUgYW5kIGJlbG93IHRoZSBzdGFmZi5cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyB2b2lkIENhbGN1bGF0ZUhlaWdodCgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGludCBhYm92ZSA9IDA7XG4gICAgICAgICAgICBpbnQgYmVsb3cgPSAwO1xuXG4gICAgICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBzIGluIHN5bWJvbHMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYWJvdmUgPSBNYXRoLk1heChhYm92ZSwgcy5BYm92ZVN0YWZmKTtcbiAgICAgICAgICAgICAgICBiZWxvdyA9IE1hdGguTWF4KGJlbG93LCBzLkJlbG93U3RhZmYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWJvdmUgPSBNYXRoLk1heChhYm92ZSwgY2xlZnN5bS5BYm92ZVN0YWZmKTtcbiAgICAgICAgICAgIGJlbG93ID0gTWF0aC5NYXgoYmVsb3csIGNsZWZzeW0uQmVsb3dTdGFmZik7XG4gICAgICAgICAgICBpZiAoc2hvd01lYXN1cmVzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGFib3ZlID0gTWF0aC5NYXgoYWJvdmUsIFNoZWV0TXVzaWMuTm90ZUhlaWdodCAqIDMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeXRvcCA9IGFib3ZlICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgaGVpZ2h0ID0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogNSArIHl0b3AgKyBiZWxvdztcbiAgICAgICAgICAgIGlmIChseXJpY3MgIT0gbnVsbClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBoZWlnaHQgKz0gMTI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIEFkZCBzb21lIGV4dHJhIHZlcnRpY2FsIHNwYWNlIGJldHdlZW4gdGhlIGxhc3QgdHJhY2tcbiAgICAgICAgICAgICAqIGFuZCBmaXJzdCB0cmFjay5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYgKHRyYWNrbnVtID09IHRvdGFsdHJhY2tzIC0gMSlcbiAgICAgICAgICAgICAgICBoZWlnaHQgKz0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMztcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBDYWxjdWxhdGUgdGhlIHdpZHRoIG9mIHRoaXMgc3RhZmYgKi9cbiAgICAgICAgcHJpdmF0ZSB2b2lkIENhbGN1bGF0ZVdpZHRoKGJvb2wgc2Nyb2xsVmVydClcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKHNjcm9sbFZlcnQpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgd2lkdGggPSBTaGVldE11c2ljLlBhZ2VXaWR0aDtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3aWR0aCA9IGtleXNpZ1dpZHRoO1xuICAgICAgICAgICAgZm9yZWFjaCAoTXVzaWNTeW1ib2wgcyBpbiBzeW1ib2xzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHdpZHRoICs9IHMuV2lkdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8qKiBDYWxjdWxhdGUgdGhlIHN0YXJ0IGFuZCBlbmQgdGltZSBvZiB0aGlzIHN0YWZmLiAqL1xuICAgICAgICBwcml2YXRlIHZvaWQgQ2FsY3VsYXRlU3RhcnRFbmRUaW1lKClcbiAgICAgICAge1xuICAgICAgICAgICAgc3RhcnR0aW1lID0gZW5kdGltZSA9IDA7XG4gICAgICAgICAgICBpZiAoc3ltYm9scy5Db3VudCA9PSAwKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0YXJ0dGltZSA9IHN5bWJvbHNbMF0uU3RhcnRUaW1lO1xuICAgICAgICAgICAgZm9yZWFjaCAoTXVzaWNTeW1ib2wgbSBpbiBzeW1ib2xzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmIChlbmR0aW1lIDwgbS5TdGFydFRpbWUpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBlbmR0aW1lID0gbS5TdGFydFRpbWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChtIGlzIENob3JkU3ltYm9sKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgQ2hvcmRTeW1ib2wgYyA9IChDaG9yZFN5bWJvbCltO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZW5kdGltZSA8IGMuRW5kVGltZSlcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5kdGltZSA9IGMuRW5kVGltZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cbiAgICAgICAgLyoqIEZ1bGwtSnVzdGlmeSB0aGUgc3ltYm9scywgc28gdGhhdCB0aGV5IGV4cGFuZCB0byBmaWxsIHRoZSB3aG9sZSBzdGFmZi4gKi9cbiAgICAgICAgcHJpdmF0ZSB2b2lkIEZ1bGxKdXN0aWZ5KClcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKHdpZHRoICE9IFNoZWV0TXVzaWMuUGFnZVdpZHRoKVxuICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgaW50IHRvdGFsd2lkdGggPSBrZXlzaWdXaWR0aDtcbiAgICAgICAgICAgIGludCB0b3RhbHN5bWJvbHMgPSAwO1xuICAgICAgICAgICAgaW50IGkgPSAwO1xuXG4gICAgICAgICAgICB3aGlsZSAoaSA8IHN5bWJvbHMuQ291bnQpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaW50IHN0YXJ0ID0gc3ltYm9sc1tpXS5TdGFydFRpbWU7XG4gICAgICAgICAgICAgICAgdG90YWxzeW1ib2xzKys7XG4gICAgICAgICAgICAgICAgdG90YWx3aWR0aCArPSBzeW1ib2xzW2ldLldpZHRoO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICB3aGlsZSAoaSA8IHN5bWJvbHMuQ291bnQgJiYgc3ltYm9sc1tpXS5TdGFydFRpbWUgPT0gc3RhcnQpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbHdpZHRoICs9IHN5bWJvbHNbaV0uV2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGludCBleHRyYXdpZHRoID0gKFNoZWV0TXVzaWMuUGFnZVdpZHRoIC0gdG90YWx3aWR0aCAtIDEpIC8gdG90YWxzeW1ib2xzO1xuICAgICAgICAgICAgaWYgKGV4dHJhd2lkdGggPiBTaGVldE11c2ljLk5vdGVIZWlnaHQgKiAyKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGV4dHJhd2lkdGggPSBTaGVldE11c2ljLk5vdGVIZWlnaHQgKiAyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSA9IDA7XG4gICAgICAgICAgICB3aGlsZSAoaSA8IHN5bWJvbHMuQ291bnQpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaW50IHN0YXJ0ID0gc3ltYm9sc1tpXS5TdGFydFRpbWU7XG4gICAgICAgICAgICAgICAgc3ltYm9sc1tpXS5XaWR0aCArPSBleHRyYXdpZHRoO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICB3aGlsZSAoaSA8IHN5bWJvbHMuQ291bnQgJiYgc3ltYm9sc1tpXS5TdGFydFRpbWUgPT0gc3RhcnQpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cblxuICAgICAgICAvKiogQWRkIHRoZSBseXJpYyBzeW1ib2xzIHRoYXQgb2NjdXIgd2l0aGluIHRoaXMgc3RhZmYuXG4gICAgICAgICAqICBTZXQgdGhlIHgtcG9zaXRpb24gb2YgdGhlIGx5cmljIHN5bWJvbC4gXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgdm9pZCBBZGRMeXJpY3MoTGlzdDxMeXJpY1N5bWJvbD4gdHJhY2tseXJpY3MpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmICh0cmFja2x5cmljcyA9PSBudWxsKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGx5cmljcyA9IG5ldyBMaXN0PEx5cmljU3ltYm9sPigpO1xuICAgICAgICAgICAgaW50IHhwb3MgPSAwO1xuICAgICAgICAgICAgaW50IHN5bWJvbGluZGV4ID0gMDtcbiAgICAgICAgICAgIGZvcmVhY2ggKEx5cmljU3ltYm9sIGx5cmljIGluIHRyYWNrbHlyaWNzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmIChseXJpYy5TdGFydFRpbWUgPCBzdGFydHRpbWUpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGx5cmljLlN0YXJ0VGltZSA+IGVuZHRpbWUpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLyogR2V0IHRoZSB4LXBvc2l0aW9uIG9mIHRoaXMgbHlyaWMgKi9cbiAgICAgICAgICAgICAgICB3aGlsZSAoc3ltYm9saW5kZXggPCBzeW1ib2xzLkNvdW50ICYmXG4gICAgICAgICAgICAgICAgICAgICAgIHN5bWJvbHNbc3ltYm9saW5kZXhdLlN0YXJ0VGltZSA8IGx5cmljLlN0YXJ0VGltZSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHhwb3MgKz0gc3ltYm9sc1tzeW1ib2xpbmRleF0uV2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIHN5bWJvbGluZGV4Kys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGx5cmljLlggPSB4cG9zO1xuICAgICAgICAgICAgICAgIGlmIChzeW1ib2xpbmRleCA8IHN5bWJvbHMuQ291bnQgJiZcbiAgICAgICAgICAgICAgICAgICAgKHN5bWJvbHNbc3ltYm9saW5kZXhdIGlzIEJhclN5bWJvbCkpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBseXJpYy5YICs9IFNoZWV0TXVzaWMuTm90ZVdpZHRoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBseXJpY3MuQWRkKGx5cmljKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChseXJpY3MuQ291bnQgPT0gMClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBseXJpY3MgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cblxuICAgICAgICAvKiogRHJhdyB0aGUgbHlyaWNzICovXG4gICAgICAgIHByaXZhdGUgdm9pZCBEcmF3THlyaWNzKEdyYXBoaWNzIGcsIFBlbiBwZW4pXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8qIFNraXAgdGhlIGxlZnQgc2lkZSBDbGVmIHN5bWJvbCBhbmQga2V5IHNpZ25hdHVyZSAqL1xuICAgICAgICAgICAgaW50IHhwb3MgPSBrZXlzaWdXaWR0aDtcbiAgICAgICAgICAgIGludCB5cG9zID0gaGVpZ2h0IC0gMTI7XG5cbiAgICAgICAgICAgIGZvcmVhY2ggKEx5cmljU3ltYm9sIGx5cmljIGluIGx5cmljcylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBnLkRyYXdTdHJpbmcobHlyaWMuVGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5MZXR0ZXJGb250LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCcnVzaGVzLkJsYWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4cG9zICsgbHlyaWMuWCwgeXBvcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiogRHJhdyB0aGUgbWVhc3VyZSBudW1iZXJzIGZvciBlYWNoIG1lYXN1cmUgKi9cbiAgICAgICAgcHJpdmF0ZSB2b2lkIERyYXdNZWFzdXJlTnVtYmVycyhHcmFwaGljcyBnLCBQZW4gcGVuKVxuICAgICAgICB7XG5cbiAgICAgICAgICAgIC8qIFNraXAgdGhlIGxlZnQgc2lkZSBDbGVmIHN5bWJvbCBhbmQga2V5IHNpZ25hdHVyZSAqL1xuICAgICAgICAgICAgaW50IHhwb3MgPSBrZXlzaWdXaWR0aDtcbiAgICAgICAgICAgIGludCB5cG9zID0geXRvcCAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodCAqIDM7XG5cbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHMgaW4gc3ltYm9scylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAocyBpcyBCYXJTeW1ib2wpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpbnQgbWVhc3VyZSA9IDEgKyBzLlN0YXJ0VGltZSAvIG1lYXN1cmVMZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGcuRHJhd1N0cmluZyhcIlwiICsgbWVhc3VyZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGV0dGVyRm9udCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJydXNoZXMuQmxhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4cG9zICsgU2hlZXRNdXNpYy5Ob3RlV2lkdGggLyAyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXBvcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHhwb3MgKz0gcy5XaWR0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBEcmF3IHRoZSBseXJpY3MgKi9cblxuXG4gICAgICAgIC8qKiBEcmF3IHRoZSBmaXZlIGhvcml6b250YWwgbGluZXMgb2YgdGhlIHN0YWZmICovXG4gICAgICAgIHByaXZhdGUgdm9pZCBEcmF3SG9yaXpMaW5lcyhHcmFwaGljcyBnLCBQZW4gcGVuKVxuICAgICAgICB7XG4gICAgICAgICAgICBpbnQgbGluZSA9IDE7XG4gICAgICAgICAgICBpbnQgeSA9IHl0b3AgLSBTaGVldE11c2ljLkxpbmVXaWR0aDtcbiAgICAgICAgICAgIHBlbi5XaWR0aCA9IDE7XG4gICAgICAgICAgICBmb3IgKGxpbmUgPSAxOyBsaW5lIDw9IDU7IGxpbmUrKylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgU2hlZXRNdXNpYy5MZWZ0TWFyZ2luLCB5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aCAtIDEsIHkpO1xuICAgICAgICAgICAgICAgIHkgKz0gU2hlZXRNdXNpYy5MaW5lV2lkdGggKyBTaGVldE11c2ljLkxpbmVTcGFjZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBlbi5Db2xvciA9IENvbG9yLkJsYWNrO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvKiogRHJhdyB0aGUgdmVydGljYWwgbGluZXMgYXQgdGhlIGZhciBsZWZ0IGFuZCBmYXIgcmlnaHQgc2lkZXMuICovXG4gICAgICAgIHByaXZhdGUgdm9pZCBEcmF3RW5kTGluZXMoR3JhcGhpY3MgZywgUGVuIHBlbilcbiAgICAgICAge1xuICAgICAgICAgICAgcGVuLldpZHRoID0gMTtcblxuICAgICAgICAgICAgLyogRHJhdyB0aGUgdmVydGljYWwgbGluZXMgZnJvbSAwIHRvIHRoZSBoZWlnaHQgb2YgdGhpcyBzdGFmZixcbiAgICAgICAgICAgICAqIGluY2x1ZGluZyB0aGUgc3BhY2UgYWJvdmUgYW5kIGJlbG93IHRoZSBzdGFmZiwgd2l0aCB0d28gZXhjZXB0aW9uczpcbiAgICAgICAgICAgICAqIC0gSWYgdGhpcyBpcyB0aGUgZmlyc3QgdHJhY2ssIGRvbid0IHN0YXJ0IGFib3ZlIHRoZSBzdGFmZi5cbiAgICAgICAgICAgICAqICAgU3RhcnQgZXhhY3RseSBhdCB0aGUgdG9wIG9mIHRoZSBzdGFmZiAoeXRvcCAtIExpbmVXaWR0aClcbiAgICAgICAgICAgICAqIC0gSWYgdGhpcyBpcyB0aGUgbGFzdCB0cmFjaywgZG9uJ3QgZW5kIGJlbG93IHRoZSBzdGFmZi5cbiAgICAgICAgICAgICAqICAgRW5kIGV4YWN0bHkgYXQgdGhlIGJvdHRvbSBvZiB0aGUgc3RhZmYuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGludCB5c3RhcnQsIHllbmQ7XG4gICAgICAgICAgICBpZiAodHJhY2tudW0gPT0gMClcbiAgICAgICAgICAgICAgICB5c3RhcnQgPSB5dG9wIC0gU2hlZXRNdXNpYy5MaW5lV2lkdGg7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgeXN0YXJ0ID0gMDtcblxuICAgICAgICAgICAgaWYgKHRyYWNrbnVtID09ICh0b3RhbHRyYWNrcyAtIDEpKVxuICAgICAgICAgICAgICAgIHllbmQgPSB5dG9wICsgNCAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB5ZW5kID0gaGVpZ2h0O1xuXG4gICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgU2hlZXRNdXNpYy5MZWZ0TWFyZ2luLCB5c3RhcnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5MZWZ0TWFyZ2luLCB5ZW5kKTtcblxuICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHdpZHRoIC0gMSwgeXN0YXJ0LCB3aWR0aCAtIDEsIHllbmQpO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvKiogRHJhdyB0aGlzIHN0YWZmLiBPbmx5IGRyYXcgdGhlIHN5bWJvbHMgaW5zaWRlIHRoZSBjbGlwIGFyZWEgKi9cbiAgICAgICAgcHVibGljIHZvaWQgRHJhdyhHcmFwaGljcyBnLCBSZWN0YW5nbGUgY2xpcCwgUGVuIHBlbiwgaW50IHNlbGVjdGlvblN0YXJ0UHVsc2UsIGludCBzZWxlY3Rpb25FbmRQdWxzZSwgQnJ1c2ggZGVzZWxlY3RlZEJydXNoKVxuICAgICAgICB7XG4gICAgICAgICAgICAvKiBTaGFkZSBhbnkgZGVzZWxlY3RlZCBhcmVhcyAqL1xuICAgICAgICAgICAgU2hhZGVTZWxlY3Rpb25CYWNrZ3JvdW5kKGcsIGNsaXAsIHNlbGVjdGlvblN0YXJ0UHVsc2UsIHNlbGVjdGlvbkVuZFB1bHNlLCBkZXNlbGVjdGVkQnJ1c2gpO1xuXG4gICAgICAgICAgICBpbnQgeHBvcyA9IFNoZWV0TXVzaWMuTGVmdE1hcmdpbiArIDU7XG5cbiAgICAgICAgICAgIC8qIERyYXcgdGhlIGxlZnQgc2lkZSBDbGVmIHN5bWJvbCAqL1xuICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeHBvcywgMCk7XG4gICAgICAgICAgICBjbGVmc3ltLkRyYXcoZywgcGVuLCB5dG9wKTtcbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC14cG9zLCAwKTtcbiAgICAgICAgICAgIHhwb3MgKz0gY2xlZnN5bS5XaWR0aDtcblxuICAgICAgICAgICAgLyogRHJhdyB0aGUga2V5IHNpZ25hdHVyZSAqL1xuICAgICAgICAgICAgZm9yZWFjaCAoQWNjaWRTeW1ib2wgYSBpbiBrZXlzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKHhwb3MsIDApO1xuICAgICAgICAgICAgICAgIGEuRHJhdyhnLCBwZW4sIHl0b3ApO1xuICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC14cG9zLCAwKTtcbiAgICAgICAgICAgICAgICB4cG9zICs9IGEuV2lkdGg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIERyYXcgdGhlIGFjdHVhbCBub3RlcywgcmVzdHMsIGJhcnMuICBEcmF3IHRoZSBzeW1ib2xzIG9uZSBcbiAgICAgICAgICAgICAqIGFmdGVyIGFub3RoZXIsIHVzaW5nIHRoZSBzeW1ib2wgd2lkdGggdG8gZGV0ZXJtaW5lIHRoZVxuICAgICAgICAgICAgICogeCBwb3NpdGlvbiBvZiB0aGUgbmV4dCBzeW1ib2wuXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogRm9yIGZhc3QgcGVyZm9ybWFuY2UsIG9ubHkgZHJhdyBzeW1ib2xzIHRoYXQgYXJlIGluIHRoZSBjbGlwIGFyZWEuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHMgaW4gc3ltYm9scylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAoSW5zaWRlQ2xpcHBpbmcoY2xpcCwgeHBvcywgcykpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSh4cG9zLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgcy5EcmF3KGcsIHBlbiwgeXRvcCk7XG4gICAgICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC14cG9zLCAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgeHBvcyArPSBzLldpZHRoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgRHJhd0hvcml6TGluZXMoZywgcGVuKTtcbiAgICAgICAgICAgIERyYXdFbmRMaW5lcyhnLCBwZW4pO1xuXG4gICAgICAgICAgICBpZiAoc2hvd01lYXN1cmVzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIERyYXdNZWFzdXJlTnVtYmVycyhnLCBwZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGx5cmljcyAhPSBudWxsKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIERyYXdMeXJpY3MoZywgcGVuKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgLyoqIFxuICAgICAgICAgKiBJZiBhIHNlbGVjdGlvbiBoYXMgYmVlbiBzcGVjaWZpZWQsIHNoYWRlIGFsbCBhcmVhcyB0aGF0IGFyZW4ndCBpbiB0aGUgc2VsZWN0aW9uXG4gICAgICAgICovXG4gICAgICAgIHByaXZhdGUgdm9pZCBTaGFkZVNlbGVjdGlvbkJhY2tncm91bmQoR3JhcGhpY3MgZywgUmVjdGFuZ2xlIGNsaXAsIGludCBzZWxlY3Rpb25TdGFydFB1bHNlLCBpbnQgc2VsZWN0aW9uRW5kUHVsc2UsIEJydXNoIGRlc2VsZWN0ZWRCcnVzaClcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKHNlbGVjdGlvbkVuZFB1bHNlID09IDApIHJldHVybjtcblxuICAgICAgICAgICAgaW50IHhwb3MgPSBrZXlzaWdXaWR0aDtcbiAgICAgICAgICAgIGJvb2wgbGFzdFN0YXRlRmlsbCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yZWFjaCAoTXVzaWNTeW1ib2wgcyBpbiBzeW1ib2xzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmIChJbnNpZGVDbGlwcGluZyhjbGlwLCB4cG9zLCBzKSAmJiAocy5TdGFydFRpbWUgPCBzZWxlY3Rpb25TdGFydFB1bHNlIHx8IHMuU3RhcnRUaW1lID4gc2VsZWN0aW9uRW5kUHVsc2UpKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeHBvcyAtIDIsIC0yKTtcbiAgICAgICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGRlc2VsZWN0ZWRCcnVzaCwgMCwgMCwgcy5XaWR0aCArIDQsIHRoaXMuSGVpZ2h0ICsgNCk7XG4gICAgICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0oeHBvcyAtIDIpLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFN0YXRlRmlsbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RTdGF0ZUZpbGwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgeHBvcyArPSBzLldpZHRoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxhc3RTdGF0ZUZpbGwpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgLy9zaGFkZSB0aGUgcmVzdCBvZiB0aGUgc3RhZmYgaWYgdGhlIHByZXZpb3VzIHN5bWJvbCB3YXMgc2hhZGVkXG4gICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeHBvcyAtIDIsIC0yKTtcbiAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZGVzZWxlY3RlZEJydXNoLCAwLCAwLCB3aWR0aCAtIHhwb3MsIHRoaXMuSGVpZ2h0ICsgNCk7XG4gICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLSh4cG9zIC0gMiksIDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgYm9vbCBJbnNpZGVDbGlwcGluZyhSZWN0YW5nbGUgY2xpcCwgaW50IHhwb3MsIE11c2ljU3ltYm9sIHMpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiAoeHBvcyA8PSBjbGlwLlggKyBjbGlwLldpZHRoICsgNTApICYmICh4cG9zICsgcy5XaWR0aCArIDUwID49IGNsaXAuWCk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8qKiBTaGFkZSBhbGwgdGhlIGNob3JkcyBwbGF5ZWQgaW4gdGhlIGdpdmVuIHRpbWUuXG4gICAgICAgICAqICBVbi1zaGFkZSBhbnkgY2hvcmRzIHNoYWRlZCBpbiB0aGUgcHJldmlvdXMgcHVsc2UgdGltZS5cbiAgICAgICAgICogIFN0b3JlIHRoZSB4IGNvb3JkaW5hdGUgbG9jYXRpb24gd2hlcmUgdGhlIHNoYWRlIHdhcyBkcmF3bi5cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBib29sIFNoYWRlTm90ZXMoR3JhcGhpY3MgZywgU29saWRCcnVzaCBzaGFkZUJydXNoLCBQZW4gcGVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50IGN1cnJlbnRQdWxzZVRpbWUsIGludCBwcmV2UHVsc2VUaW1lLCByZWYgaW50IHhfc2hhZGUpXG4gICAgICAgIHtcblxuICAgICAgICAgICAgLyogSWYgdGhlcmUncyBub3RoaW5nIHRvIHVuc2hhZGUsIG9yIHNoYWRlLCByZXR1cm4gKi9cbiAgICAgICAgICAgIGlmICgoc3RhcnR0aW1lID4gcHJldlB1bHNlVGltZSB8fCBlbmR0aW1lIDwgcHJldlB1bHNlVGltZSkgJiZcbiAgICAgICAgICAgICAgICAoc3RhcnR0aW1lID4gY3VycmVudFB1bHNlVGltZSB8fCBlbmR0aW1lIDwgY3VycmVudFB1bHNlVGltZSkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBTa2lwIHRoZSBsZWZ0IHNpZGUgQ2xlZiBzeW1ib2wgYW5kIGtleSBzaWduYXR1cmUgKi9cbiAgICAgICAgICAgIGludCB4cG9zID0ga2V5c2lnV2lkdGg7XG5cbiAgICAgICAgICAgIE11c2ljU3ltYm9sIGN1cnIgPSBudWxsO1xuXG4gICAgICAgICAgICAvKiBMb29wIHRocm91Z2ggdGhlIHN5bWJvbHMuIFxuICAgICAgICAgICAgICogVW5zaGFkZSBzeW1ib2xzIHdoZXJlIHN0YXJ0IDw9IHByZXZQdWxzZVRpbWUgPCBlbmRcbiAgICAgICAgICAgICAqIFNoYWRlIHN5bWJvbHMgd2hlcmUgc3RhcnQgPD0gY3VycmVudFB1bHNlVGltZSA8IGVuZFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBib29sIHNoYWRlZE5vdGVGb3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBzeW1ib2xzLkNvdW50OyBpKyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY3VyciA9IHN5bWJvbHNbaV07XG4gICAgICAgICAgICAgICAgaWYgKGN1cnIgaXMgQmFyU3ltYm9sKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgeHBvcyArPSBjdXJyLldpZHRoO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpbnQgc3RhcnQgPSBjdXJyLlN0YXJ0VGltZTtcbiAgICAgICAgICAgICAgICBpbnQgZW5kID0gMDtcbiAgICAgICAgICAgICAgICBpZiAoaSArIDIgPCBzeW1ib2xzLkNvdW50ICYmIHN5bWJvbHNbaSArIDFdIGlzIEJhclN5bWJvbClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IHN5bWJvbHNbaSArIDJdLlN0YXJ0VGltZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaSArIDEgPCBzeW1ib2xzLkNvdW50KVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gc3ltYm9sc1tpICsgMV0uU3RhcnRUaW1lO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBlbmQgPSBlbmR0aW1lO1xuICAgICAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICAgICAgLyogSWYgd2UndmUgcGFzdCB0aGUgcHJldmlvdXMgYW5kIGN1cnJlbnQgdGltZXMsIHdlJ3JlIGRvbmUuICovXG4gICAgICAgICAgICAgICAgaWYgKChzdGFydCA+IHByZXZQdWxzZVRpbWUpICYmIChzdGFydCA+IGN1cnJlbnRQdWxzZVRpbWUpKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHhfc2hhZGUgPT0gMClcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgeF9zaGFkZSA9IHhwb3M7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2hhZGVkTm90ZUZvdW5kO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvKiBJZiBzaGFkZWQgbm90ZXMgYXJlIHRoZSBzYW1lLCB3ZSdyZSBkb25lICovXG4gICAgICAgICAgICAgICAgaWYgKChzdGFydCA8PSBjdXJyZW50UHVsc2VUaW1lKSAmJiAoY3VycmVudFB1bHNlVGltZSA8IGVuZCkgJiZcbiAgICAgICAgICAgICAgICAgICAgKHN0YXJ0IDw9IHByZXZQdWxzZVRpbWUpICYmIChwcmV2UHVsc2VUaW1lIDwgZW5kKSlcbiAgICAgICAgICAgICAgICB7XG5cbiAgICAgICAgICAgICAgICAgICAgeF9zaGFkZSA9IHhwb3M7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzaGFkZWROb3RlRm91bmQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLyogSWYgc3ltYm9sIGlzIGluIHRoZSBwcmV2aW91cyB0aW1lLCBkcmF3IGEgd2hpdGUgYmFja2dyb3VuZCAqL1xuICAgICAgICAgICAgICAgIGlmICgoc3RhcnQgPD0gcHJldlB1bHNlVGltZSkgJiYgKHByZXZQdWxzZVRpbWUgPCBlbmQpKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeHBvcyAtIDIsIC0yKTtcbiAgICAgICAgICAgICAgICAgICAgZy5DbGVhclJlY3RhbmdsZSgwLCAwLCBjdXJyLldpZHRoICsgNCwgdGhpcy5IZWlnaHQgKyA0KTtcbiAgICAgICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLSh4cG9zIC0gMiksIDIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8qIElmIHN5bWJvbCBpcyBpbiB0aGUgY3VycmVudCB0aW1lLCBkcmF3IGEgc2hhZGVkIGJhY2tncm91bmQgKi9cbiAgICAgICAgICAgICAgICBpZiAoKHN0YXJ0IDw9IGN1cnJlbnRQdWxzZVRpbWUpICYmIChjdXJyZW50UHVsc2VUaW1lIDwgZW5kKSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHhfc2hhZGUgPSB4cG9zO1xuICAgICAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSh4cG9zLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKHNoYWRlQnJ1c2gsIDAsIDAsIGN1cnIuV2lkdGgsIHRoaXMuSGVpZ2h0KTtcbiAgICAgICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLXhwb3MsIDApO1xuICAgICAgICAgICAgICAgICAgICBzaGFkZWROb3RlRm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHhwb3MgKz0gY3Vyci5XaWR0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzaGFkZWROb3RlRm91bmQ7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogUmV0dXJuIHRoZSBwdWxzZSB0aW1lIGNvcnJlc3BvbmRpbmcgdG8gdGhlIGdpdmVuIHBvaW50LlxuICAgICAgICAgKiAgRmluZCB0aGUgbm90ZXMvc3ltYm9scyBjb3JyZXNwb25kaW5nIHRvIHRoZSB4IHBvc2l0aW9uLFxuICAgICAgICAgKiAgYW5kIHJldHVybiB0aGUgc3RhcnRUaW1lIChwdWxzZVRpbWUpIG9mIHRoZSBzeW1ib2wuXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgaW50IFB1bHNlVGltZUZvclBvaW50KFBvaW50IHBvaW50KVxuICAgICAgICB7XG5cbiAgICAgICAgICAgIGludCB4cG9zID0ga2V5c2lnV2lkdGg7XG4gICAgICAgICAgICBpbnQgcHVsc2VUaW1lID0gc3RhcnR0aW1lO1xuICAgICAgICAgICAgZm9yZWFjaCAoTXVzaWNTeW1ib2wgc3ltIGluIHN5bWJvbHMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcHVsc2VUaW1lID0gc3ltLlN0YXJ0VGltZTtcbiAgICAgICAgICAgICAgICBpZiAocG9pbnQuWCA8PSB4cG9zICsgc3ltLldpZHRoKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHB1bHNlVGltZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgeHBvcyArPSBzeW0uV2lkdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHVsc2VUaW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHN0cmluZyByZXN1bHQgPSBcIlN0YWZmIGNsZWY9XCIgKyBjbGVmc3ltLlRvU3RyaW5nKCkgKyBcIlxcblwiO1xuICAgICAgICAgICAgcmVzdWx0ICs9IFwiICBLZXlzOlxcblwiO1xuICAgICAgICAgICAgZm9yZWFjaCAoQWNjaWRTeW1ib2wgYSBpbiBrZXlzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBcIiAgICBcIiArIGEuVG9TdHJpbmcoKSArIFwiXFxuXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHQgKz0gXCIgIFN5bWJvbHM6XFxuXCI7XG4gICAgICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBzIGluIGtleXMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IFwiICAgIFwiICsgcy5Ub1N0cmluZygpICsgXCJcXG5cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIG0gaW4gc3ltYm9scylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gXCIgICAgXCIgKyBtLlRvU3RyaW5nKCkgKyBcIlxcblwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0ICs9IFwiRW5kIFN0YWZmXFxuXCI7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG5cbiAgICB9XG59XG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMSBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIEBjbGFzcyBTdGVtXG4gKiBUaGUgU3RlbSBjbGFzcyBpcyB1c2VkIGJ5IENob3JkU3ltYm9sIHRvIGRyYXcgdGhlIHN0ZW0gcG9ydGlvbiBvZlxuICogdGhlIGNob3JkLiAgVGhlIHN0ZW0gaGFzIHRoZSBmb2xsb3dpbmcgZmllbGRzOlxuICpcbiAqIGR1cmF0aW9uICAtIFRoZSBkdXJhdGlvbiBvZiB0aGUgc3RlbS5cbiAqIGRpcmVjdGlvbiAtIEVpdGhlciBVcCBvciBEb3duXG4gKiBzaWRlICAgICAgLSBFaXRoZXIgbGVmdCBvciByaWdodFxuICogdG9wICAgICAgIC0gVGhlIHRvcG1vc3Qgbm90ZSBpbiB0aGUgY2hvcmRcbiAqIGJvdHRvbSAgICAtIFRoZSBib3R0b21tb3N0IG5vdGUgaW4gdGhlIGNob3JkXG4gKiBlbmQgICAgICAgLSBUaGUgbm90ZSBwb3NpdGlvbiB3aGVyZSB0aGUgc3RlbSBlbmRzLiAgVGhpcyBpcyB1c3VhbGx5XG4gKiAgICAgICAgICAgICBzaXggbm90ZXMgcGFzdCB0aGUgbGFzdCBub3RlIGluIHRoZSBjaG9yZC4gIEZvciA4dGgvMTZ0aFxuICogICAgICAgICAgICAgbm90ZXMsIHRoZSBzdGVtIG11c3QgZXh0ZW5kIGV2ZW4gbW9yZS5cbiAqXG4gKiBUaGUgU2hlZXRNdXNpYyBjbGFzcyBjYW4gY2hhbmdlIHRoZSBkaXJlY3Rpb24gb2YgYSBzdGVtIGFmdGVyIGl0XG4gKiBoYXMgYmVlbiBjcmVhdGVkLiAgVGhlIHNpZGUgYW5kIGVuZCBmaWVsZHMgbWF5IGFsc28gY2hhbmdlIGR1ZSB0b1xuICogdGhlIGRpcmVjdGlvbiBjaGFuZ2UuICBCdXQgb3RoZXIgZmllbGRzIHdpbGwgbm90IGNoYW5nZS5cbiAqL1xuIFxucHVibGljIGNsYXNzIFN0ZW0ge1xuICAgIHB1YmxpYyBjb25zdCBpbnQgVXAgPSAgIDE7ICAgICAgLyogVGhlIHN0ZW0gcG9pbnRzIHVwICovXG4gICAgcHVibGljIGNvbnN0IGludCBEb3duID0gMjsgICAgICAvKiBUaGUgc3RlbSBwb2ludHMgZG93biAqL1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTGVmdFNpZGUgPSAxOyAgLyogVGhlIHN0ZW0gaXMgdG8gdGhlIGxlZnQgb2YgdGhlIG5vdGUgKi9cbiAgICBwdWJsaWMgY29uc3QgaW50IFJpZ2h0U2lkZSA9IDI7IC8qIFRoZSBzdGVtIGlzIHRvIHRoZSByaWdodCBvZiB0aGUgbm90ZSAqL1xuXG4gICAgcHJpdmF0ZSBOb3RlRHVyYXRpb24gZHVyYXRpb247IC8qKiBEdXJhdGlvbiBvZiB0aGUgc3RlbS4gKi9cbiAgICBwcml2YXRlIGludCBkaXJlY3Rpb247ICAgICAgICAgLyoqIFVwLCBEb3duLCBvciBOb25lICovXG4gICAgcHJpdmF0ZSBXaGl0ZU5vdGUgdG9wOyAgICAgICAgIC8qKiBUb3Btb3N0IG5vdGUgaW4gY2hvcmQgKi9cbiAgICBwcml2YXRlIFdoaXRlTm90ZSBib3R0b207ICAgICAgLyoqIEJvdHRvbW1vc3Qgbm90ZSBpbiBjaG9yZCAqL1xuICAgIHByaXZhdGUgV2hpdGVOb3RlIGVuZDsgICAgICAgICAvKiogTG9jYXRpb24gb2YgZW5kIG9mIHRoZSBzdGVtICovXG4gICAgcHJpdmF0ZSBib29sIG5vdGVzb3ZlcmxhcDsgICAgIC8qKiBEbyB0aGUgY2hvcmQgbm90ZXMgb3ZlcmxhcCAqL1xuICAgIHByaXZhdGUgaW50IHNpZGU7ICAgICAgICAgICAgICAvKiogTGVmdCBzaWRlIG9yIHJpZ2h0IHNpZGUgb2Ygbm90ZSAqL1xuXG4gICAgcHJpdmF0ZSBTdGVtIHBhaXI7ICAgICAgICAgICAgICAvKiogSWYgcGFpciAhPSBudWxsLCB0aGlzIGlzIGEgaG9yaXpvbnRhbCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIGJlYW0gc3RlbSB0byBhbm90aGVyIGNob3JkICovXG4gICAgcHJpdmF0ZSBpbnQgd2lkdGhfdG9fcGFpcjsgICAgICAvKiogVGhlIHdpZHRoIChpbiBwaXhlbHMpIHRvIHRoZSBjaG9yZCBwYWlyICovXG4gICAgcHJpdmF0ZSBib29sIHJlY2VpdmVyX2luX3BhaXI7ICAvKiogVGhpcyBzdGVtIGlzIHRoZSByZWNlaXZlciBvZiBhIGhvcml6b250YWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogYmVhbSBzdGVtIGZyb20gYW5vdGhlciBjaG9yZC4gKi9cblxuICAgIC8qKiBHZXQvU2V0IHRoZSBkaXJlY3Rpb24gb2YgdGhlIHN0ZW0gKFVwIG9yIERvd24pICovXG4gICAgcHVibGljIGludCBEaXJlY3Rpb24ge1xuICAgICAgICBnZXQgeyByZXR1cm4gZGlyZWN0aW9uOyB9XG4gICAgICAgIHNldCB7IENoYW5nZURpcmVjdGlvbih2YWx1ZSk7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBkdXJhdGlvbiBvZiB0aGUgc3RlbSAoRWlndGgsIFNpeHRlZW50aCwgVGhpcnR5U2Vjb25kKSAqL1xuICAgIHB1YmxpYyBOb3RlRHVyYXRpb24gRHVyYXRpb24ge1xuICAgICAgICBnZXQgeyByZXR1cm4gZHVyYXRpb247IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSB0b3Agbm90ZSBpbiB0aGUgY2hvcmQuIFRoaXMgaXMgbmVlZGVkIHRvIGRldGVybWluZSB0aGUgc3RlbSBkaXJlY3Rpb24gKi9cbiAgICBwdWJsaWMgV2hpdGVOb3RlIFRvcCB7XG4gICAgICAgIGdldCB7IHJldHVybiB0b3A7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBib3R0b20gbm90ZSBpbiB0aGUgY2hvcmQuIFRoaXMgaXMgbmVlZGVkIHRvIGRldGVybWluZSB0aGUgc3RlbSBkaXJlY3Rpb24gKi9cbiAgICBwdWJsaWMgV2hpdGVOb3RlIEJvdHRvbSB7XG4gICAgICAgIGdldCB7IHJldHVybiBib3R0b207IH1cbiAgICB9XG5cbiAgICAvKiogR2V0L1NldCB0aGUgbG9jYXRpb24gd2hlcmUgdGhlIHN0ZW0gZW5kcy4gIFRoaXMgaXMgdXN1YWxseSBzaXggbm90ZXNcbiAgICAgKiBwYXN0IHRoZSBsYXN0IG5vdGUgaW4gdGhlIGNob3JkLiBTZWUgbWV0aG9kIENhbGN1bGF0ZUVuZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgV2hpdGVOb3RlIEVuZCB7XG4gICAgICAgIGdldCB7IHJldHVybiBlbmQ7IH1cbiAgICAgICAgc2V0IHsgZW5kID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogU2V0IHRoaXMgU3RlbSB0byBiZSB0aGUgcmVjZWl2ZXIgb2YgYSBob3Jpem9udGFsIGJlYW0sIGFzIHBhcnRcbiAgICAgKiBvZiBhIGNob3JkIHBhaXIuICBJbiBEcmF3KCksIGlmIHRoaXMgc3RlbSBpcyBhIHJlY2VpdmVyLCB3ZVxuICAgICAqIGRvbid0IGRyYXcgYSBjdXJ2eSBzdGVtLCB3ZSBvbmx5IGRyYXcgdGhlIHZlcnRpY2FsIGxpbmUuXG4gICAgICovXG4gICAgcHVibGljIGJvb2wgUmVjZWl2ZXIge1xuICAgICAgICBnZXQgeyByZXR1cm4gcmVjZWl2ZXJfaW5fcGFpcjsgfVxuICAgICAgICBzZXQgeyByZWNlaXZlcl9pbl9wYWlyID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IHN0ZW0uICBUaGUgdG9wIG5vdGUsIGJvdHRvbSBub3RlLCBhbmQgZGlyZWN0aW9uIGFyZSBcbiAgICAgKiBuZWVkZWQgZm9yIGRyYXdpbmcgdGhlIHZlcnRpY2FsIGxpbmUgb2YgdGhlIHN0ZW0uICBUaGUgZHVyYXRpb24gaXMgXG4gICAgICogbmVlZGVkIHRvIGRyYXcgdGhlIHRhaWwgb2YgdGhlIHN0ZW0uICBUaGUgb3ZlcmxhcCBib29sZWFuIGlzIHRydWVcbiAgICAgKiBpZiB0aGUgbm90ZXMgaW4gdGhlIGNob3JkIG92ZXJsYXAuICBJZiB0aGUgbm90ZXMgb3ZlcmxhcCwgdGhlXG4gICAgICogc3RlbSBtdXN0IGJlIGRyYXduIG9uIHRoZSByaWdodCBzaWRlLlxuICAgICAqL1xuICAgIHB1YmxpYyBTdGVtKFdoaXRlTm90ZSBib3R0b20sIFdoaXRlTm90ZSB0b3AsIFxuICAgICAgICAgICAgICAgIE5vdGVEdXJhdGlvbiBkdXJhdGlvbiwgaW50IGRpcmVjdGlvbiwgYm9vbCBvdmVybGFwKSB7XG5cbiAgICAgICAgdGhpcy50b3AgPSB0b3A7XG4gICAgICAgIHRoaXMuYm90dG9tID0gYm90dG9tO1xuICAgICAgICB0aGlzLmR1cmF0aW9uID0gZHVyYXRpb247XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICAgICAgICB0aGlzLm5vdGVzb3ZlcmxhcCA9IG92ZXJsYXA7XG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT0gVXAgfHwgbm90ZXNvdmVybGFwKVxuICAgICAgICAgICAgc2lkZSA9IFJpZ2h0U2lkZTtcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIHNpZGUgPSBMZWZ0U2lkZTtcbiAgICAgICAgZW5kID0gQ2FsY3VsYXRlRW5kKCk7XG4gICAgICAgIHBhaXIgPSBudWxsO1xuICAgICAgICB3aWR0aF90b19wYWlyID0gMDtcbiAgICAgICAgcmVjZWl2ZXJfaW5fcGFpciA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKiBDYWxjdWxhdGUgdGhlIHZlcnRpY2FsIHBvc2l0aW9uICh3aGl0ZSBub3RlIGtleSkgd2hlcmUgXG4gICAgICogdGhlIHN0ZW0gZW5kcyBcbiAgICAgKi9cbiAgICBwdWJsaWMgV2hpdGVOb3RlIENhbGN1bGF0ZUVuZCgpIHtcbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PSBVcCkge1xuICAgICAgICAgICAgV2hpdGVOb3RlIHcgPSB0b3A7XG4gICAgICAgICAgICB3ID0gdy5BZGQoNik7XG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCkge1xuICAgICAgICAgICAgICAgIHcgPSB3LkFkZCgyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcbiAgICAgICAgICAgICAgICB3ID0gdy5BZGQoNCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkaXJlY3Rpb24gPT0gRG93bikge1xuICAgICAgICAgICAgV2hpdGVOb3RlIHcgPSBib3R0b207XG4gICAgICAgICAgICB3ID0gdy5BZGQoLTYpO1xuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGgpIHtcbiAgICAgICAgICAgICAgICB3ID0gdy5BZGQoLTIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRoaXJ0eVNlY29uZCkge1xuICAgICAgICAgICAgICAgIHcgPSB3LkFkZCgtNCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsOyAgLyogU2hvdWxkbid0IGhhcHBlbiAqL1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIENoYW5nZSB0aGUgZGlyZWN0aW9uIG9mIHRoZSBzdGVtLiAgVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgYnkgXG4gICAgICogQ2hvcmRTeW1ib2wuTWFrZVBhaXIoKS4gIFdoZW4gdHdvIGNob3JkcyBhcmUgam9pbmVkIGJ5IGEgaG9yaXpvbnRhbFxuICAgICAqIGJlYW0sIHRoZWlyIHN0ZW1zIG11c3QgcG9pbnQgaW4gdGhlIHNhbWUgZGlyZWN0aW9uICh1cCBvciBkb3duKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBDaGFuZ2VEaXJlY3Rpb24oaW50IG5ld2RpcmVjdGlvbikge1xuICAgICAgICBkaXJlY3Rpb24gPSBuZXdkaXJlY3Rpb247XG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT0gVXAgfHwgbm90ZXNvdmVybGFwKVxuICAgICAgICAgICAgc2lkZSA9IFJpZ2h0U2lkZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgc2lkZSA9IExlZnRTaWRlO1xuICAgICAgICBlbmQgPSBDYWxjdWxhdGVFbmQoKTtcbiAgICB9XG5cbiAgICAvKiogUGFpciB0aGlzIHN0ZW0gd2l0aCBhbm90aGVyIENob3JkLiAgSW5zdGVhZCBvZiBkcmF3aW5nIGEgY3VydnkgdGFpbCxcbiAgICAgKiB0aGlzIHN0ZW0gd2lsbCBub3cgaGF2ZSB0byBkcmF3IGEgYmVhbSB0byB0aGUgZ2l2ZW4gc3RlbSBwYWlyLiAgVGhlXG4gICAgICogd2lkdGggKGluIHBpeGVscykgdG8gdGhpcyBzdGVtIHBhaXIgaXMgcGFzc2VkIGFzIGFyZ3VtZW50LlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIFNldFBhaXIoU3RlbSBwYWlyLCBpbnQgd2lkdGhfdG9fcGFpcikge1xuICAgICAgICB0aGlzLnBhaXIgPSBwYWlyO1xuICAgICAgICB0aGlzLndpZHRoX3RvX3BhaXIgPSB3aWR0aF90b19wYWlyO1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGlzIFN0ZW0gaXMgcGFydCBvZiBhIGhvcml6b250YWwgYmVhbS4gKi9cbiAgICBwdWJsaWMgYm9vbCBpc0JlYW0ge1xuICAgICAgICBnZXQgeyByZXR1cm4gcmVjZWl2ZXJfaW5fcGFpciB8fCAocGFpciAhPSBudWxsKTsgfVxuICAgIH1cblxuICAgIC8qKiBEcmF3IHRoaXMgc3RlbS5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeSBsb2NhdGlvbiAoaW4gcGl4ZWxzKSB3aGVyZSB0aGUgdG9wIG9mIHRoZSBzdGFmZiBzdGFydHMuXG4gICAgICogQHBhcmFtIHRvcHN0YWZmICBUaGUgbm90ZSBhdCB0aGUgdG9wIG9mIHRoZSBzdGFmZi5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wLCBXaGl0ZU5vdGUgdG9wc3RhZmYpIHtcbiAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5XaG9sZSlcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBEcmF3VmVydGljYWxMaW5lKGcsIHBlbiwgeXRvcCwgdG9wc3RhZmYpO1xuICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlF1YXJ0ZXIgfHwgXG4gICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkUXVhcnRlciB8fCBcbiAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5IYWxmIHx8XG4gICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkSGFsZiB8fFxuICAgICAgICAgICAgcmVjZWl2ZXJfaW5fcGFpcikge1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFpciAhPSBudWxsKVxuICAgICAgICAgICAgRHJhd0hvcml6QmFyU3RlbShnLCBwZW4sIHl0b3AsIHRvcHN0YWZmKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgRHJhd0N1cnZ5U3RlbShnLCBwZW4sIHl0b3AsIHRvcHN0YWZmKTtcbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgdmVydGljYWwgbGluZSBvZiB0aGUgc3RlbSBcbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeSBsb2NhdGlvbiAoaW4gcGl4ZWxzKSB3aGVyZSB0aGUgdG9wIG9mIHRoZSBzdGFmZiBzdGFydHMuXG4gICAgICogQHBhcmFtIHRvcHN0YWZmICBUaGUgbm90ZSBhdCB0aGUgdG9wIG9mIHRoZSBzdGFmZi5cbiAgICAgKi9cbiAgICBwcml2YXRlIHZvaWQgRHJhd1ZlcnRpY2FsTGluZShHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCwgV2hpdGVOb3RlIHRvcHN0YWZmKSB7XG4gICAgICAgIGludCB4c3RhcnQ7XG4gICAgICAgIGlmIChzaWRlID09IExlZnRTaWRlKVxuICAgICAgICAgICAgeHN0YXJ0ID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCArIDE7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHhzdGFydCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyBTaGVldE11c2ljLk5vdGVXaWR0aDtcblxuICAgICAgICBpZiAoZGlyZWN0aW9uID09IFVwKSB7XG4gICAgICAgICAgICBpbnQgeTEgPSB5dG9wICsgdG9wc3RhZmYuRGlzdChib3R0b20pICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgXG4gICAgICAgICAgICAgICAgICAgICAgICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzQ7XG5cbiAgICAgICAgICAgIGludCB5c3RlbSA9IHl0b3AgKyB0b3BzdGFmZi5EaXN0KGVuZCkgKiBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcblxuICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeTEsIHhzdGFydCwgeXN0ZW0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRpcmVjdGlvbiA9PSBEb3duKSB7XG4gICAgICAgICAgICBpbnQgeTEgPSB5dG9wICsgdG9wc3RhZmYuRGlzdCh0b3ApICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgXG4gICAgICAgICAgICAgICAgICAgICAgICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuXG4gICAgICAgICAgICBpZiAoc2lkZSA9PSBMZWZ0U2lkZSlcbiAgICAgICAgICAgICAgICB5MSA9IHkxIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzQ7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgeTEgPSB5MSAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG4gICAgICAgICAgICBpbnQgeXN0ZW0gPSB5dG9wICsgdG9wc3RhZmYuRGlzdChlbmQpICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuXG4gICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5MSwgeHN0YXJ0LCB5c3RlbSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogRHJhdyBhIGN1cnZ5IHN0ZW0gdGFpbC4gIFRoaXMgaXMgb25seSB1c2VkIGZvciBzaW5nbGUgY2hvcmRzLCBub3QgY2hvcmQgcGFpcnMuXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHkgbG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEBwYXJhbSB0b3BzdGFmZiAgVGhlIG5vdGUgYXQgdGhlIHRvcCBvZiB0aGUgc3RhZmYuXG4gICAgICovXG4gICAgcHJpdmF0ZSB2b2lkIERyYXdDdXJ2eVN0ZW0oR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3AsIFdoaXRlTm90ZSB0b3BzdGFmZikge1xuXG4gICAgICAgIHBlbi5XaWR0aCA9IDI7XG5cbiAgICAgICAgaW50IHhzdGFydCA9IDA7XG4gICAgICAgIGlmIChzaWRlID09IExlZnRTaWRlKVxuICAgICAgICAgICAgeHN0YXJ0ID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCArIDE7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHhzdGFydCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyBTaGVldE11c2ljLk5vdGVXaWR0aDtcblxuICAgICAgICBpZiAoZGlyZWN0aW9uID09IFVwKSB7XG4gICAgICAgICAgICBpbnQgeXN0ZW0gPSB5dG9wICsgdG9wc3RhZmYuRGlzdChlbmQpICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG5cblxuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5FaWdodGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRyaXBsZXQgfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uU2l4dGVlbnRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRoaXJ0eVNlY29uZCkge1xuXG4gICAgICAgICAgICAgICAgZy5EcmF3QmV6aWVyKHBlbiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgeXN0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtICsgMypTaGVldE11c2ljLkxpbmVTcGFjZS8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZSoyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gKyBTaGVldE11c2ljLk5vdGVIZWlnaHQqMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeXN0ZW0gKz0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuXG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0JlemllcihwZW4sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIHlzdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSArIDMqU2hlZXRNdXNpYy5MaW5lU3BhY2UvMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UqMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCozKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgeXN0ZW0gKz0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcbiAgICAgICAgICAgICAgICBnLkRyYXdCZXppZXIocGVuLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCB5c3RlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gKyAzKlNoZWV0TXVzaWMuTGluZVNwYWNlLzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlKjIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZS8yLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gKyBTaGVldE11c2ljLk5vdGVIZWlnaHQqMyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGVsc2UgaWYgKGRpcmVjdGlvbiA9PSBEb3duKSB7XG4gICAgICAgICAgICBpbnQgeXN0ZW0gPSB5dG9wICsgdG9wc3RhZmYuRGlzdChlbmQpKlNoZWV0TXVzaWMuTm90ZUhlaWdodC8yICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcblxuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5FaWdodGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRyaXBsZXQgfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uU2l4dGVlbnRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRoaXJ0eVNlY29uZCkge1xuXG4gICAgICAgICAgICAgICAgZy5EcmF3QmV6aWVyKHBlbiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgeXN0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlKjIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIgLSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxpbmVTcGFjZS8yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHlzdGVtIC09IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcblxuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG5cbiAgICAgICAgICAgICAgICBnLkRyYXdCZXppZXIocGVuLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCB5c3RlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gLSBTaGVldE11c2ljLkxpbmVTcGFjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UqMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gLSBTaGVldE11c2ljLk5vdGVIZWlnaHQqMiAtIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB5c3RlbSAtPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRoaXJ0eVNlY29uZCkge1xuICAgICAgICAgICAgICAgIGcuRHJhd0JlemllcihwZW4sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIHlzdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZSoyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gLSBTaGVldE11c2ljLk5vdGVIZWlnaHQqMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyIC0gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgICAgICBwZW4uV2lkdGggPSAxO1xuXG4gICAgfVxuXG4gICAgLyogRHJhdyBhIGhvcml6b250YWwgYmVhbSBzdGVtLCBjb25uZWN0aW5nIHRoaXMgc3RlbSB3aXRoIHRoZSBTdGVtIHBhaXIuXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHkgbG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEBwYXJhbSB0b3BzdGFmZiAgVGhlIG5vdGUgYXQgdGhlIHRvcCBvZiB0aGUgc3RhZmYuXG4gICAgICovXG4gICAgcHJpdmF0ZSB2b2lkIERyYXdIb3JpekJhclN0ZW0oR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3AsIFdoaXRlTm90ZSB0b3BzdGFmZikge1xuICAgICAgICBwZW4uV2lkdGggPSBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcblxuICAgICAgICBpbnQgeHN0YXJ0ID0gMDtcbiAgICAgICAgaW50IHhzdGFydDIgPSAwO1xuXG4gICAgICAgIGlmIChzaWRlID09IExlZnRTaWRlKVxuICAgICAgICAgICAgeHN0YXJ0ID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCArIDE7XG4gICAgICAgIGVsc2UgaWYgKHNpZGUgPT0gUmlnaHRTaWRlKVxuICAgICAgICAgICAgeHN0YXJ0ID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCArIFNoZWV0TXVzaWMuTm90ZVdpZHRoO1xuXG4gICAgICAgIGlmIChwYWlyLnNpZGUgPT0gTGVmdFNpZGUpXG4gICAgICAgICAgICB4c3RhcnQyID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCArIDE7XG4gICAgICAgIGVsc2UgaWYgKHBhaXIuc2lkZSA9PSBSaWdodFNpZGUpXG4gICAgICAgICAgICB4c3RhcnQyID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCArIFNoZWV0TXVzaWMuTm90ZVdpZHRoO1xuXG5cbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PSBVcCkge1xuICAgICAgICAgICAgaW50IHhlbmQgPSB3aWR0aF90b19wYWlyICsgeHN0YXJ0MjtcbiAgICAgICAgICAgIGludCB5c3RhcnQgPSB5dG9wICsgdG9wc3RhZmYuRGlzdChlbmQpICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG4gICAgICAgICAgICBpbnQgeWVuZCA9IHl0b3AgKyB0b3BzdGFmZi5EaXN0KHBhaXIuZW5kKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkVpZ2h0aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGggfHwgXG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRyaXBsZXQgfHwgXG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHlzdGFydCwgeGVuZCwgeWVuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB5c3RhcnQgKz0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgeWVuZCArPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG5cbiAgICAgICAgICAgIC8qIEEgZG90dGVkIGVpZ2h0aCB3aWxsIGNvbm5lY3QgdG8gYSAxNnRoIG5vdGUuICovXG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCkge1xuICAgICAgICAgICAgICAgIGludCB4ID0geGVuZCAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgICAgICBkb3VibGUgc2xvcGUgPSAoeWVuZCAtIHlzdGFydCkgKiAxLjAgLyAoeGVuZCAtIHhzdGFydCk7XG4gICAgICAgICAgICAgICAgaW50IHkgPSAoaW50KShzbG9wZSAqICh4IC0geGVuZCkgKyB5ZW5kKTsgXG5cbiAgICAgICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeCwgeSwgeGVuZCwgeWVuZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uU2l4dGVlbnRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRoaXJ0eVNlY29uZCkge1xuXG4gICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeXN0YXJ0LCB4ZW5kLCB5ZW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHlzdGFydCArPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICB5ZW5kICs9IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcbiAgICAgICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5c3RhcnQsIHhlbmQsIHllbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpbnQgeGVuZCA9IHdpZHRoX3RvX3BhaXIgKyB4c3RhcnQyO1xuICAgICAgICAgICAgaW50IHlzdGFydCA9IHl0b3AgKyB0b3BzdGFmZi5EaXN0KGVuZCkgKiBTaGVldE11c2ljLk5vdGVIZWlnaHQvMiArIFxuICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgIGludCB5ZW5kID0geXRvcCArIHRvcHN0YWZmLkRpc3QocGFpci5lbmQpICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG5cbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRWlnaHRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UcmlwbGV0IHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHlzdGFydCwgeGVuZCwgeWVuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB5c3RhcnQgLT0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgeWVuZCAtPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG5cbiAgICAgICAgICAgIC8qIEEgZG90dGVkIGVpZ2h0aCB3aWxsIGNvbm5lY3QgdG8gYSAxNnRoIG5vdGUuICovXG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCkge1xuICAgICAgICAgICAgICAgIGludCB4ID0geGVuZCAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgICAgICBkb3VibGUgc2xvcGUgPSAoeWVuZCAtIHlzdGFydCkgKiAxLjAgLyAoeGVuZCAtIHhzdGFydCk7XG4gICAgICAgICAgICAgICAgaW50IHkgPSAoaW50KShzbG9wZSAqICh4IC0geGVuZCkgKyB5ZW5kKTsgXG5cbiAgICAgICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeCwgeSwgeGVuZCwgeWVuZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uU2l4dGVlbnRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRoaXJ0eVNlY29uZCkge1xuXG4gICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeXN0YXJ0LCB4ZW5kLCB5ZW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHlzdGFydCAtPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICB5ZW5kIC09IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcbiAgICAgICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5c3RhcnQsIHhlbmQsIHllbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJTdGVtIGR1cmF0aW9uPXswfSBkaXJlY3Rpb249ezF9IHRvcD17Mn0gYm90dG9tPXszfSBlbmQ9ezR9XCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiBvdmVybGFwPXs1fSBzaWRlPXs2fSB3aWR0aF90b19wYWlyPXs3fSByZWNlaXZlcl9pbl9wYWlyPXs4fVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbiwgZGlyZWN0aW9uLCB0b3AuVG9TdHJpbmcoKSwgYm90dG9tLlRvU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZC5Ub1N0cmluZygpLCBub3Rlc292ZXJsYXAsIHNpZGUsIHdpZHRoX3RvX3BhaXIsIHJlY2VpdmVyX2luX3BhaXIpO1xuICAgIH1cblxufSBcblxuXG59XG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMSBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbi8qKiBAY2xhc3MgU3ltYm9sV2lkdGhzXG4gKiBUaGUgU3ltYm9sV2lkdGhzIGNsYXNzIGlzIHVzZWQgdG8gdmVydGljYWxseSBhbGlnbiBub3RlcyBpbiBkaWZmZXJlbnRcbiAqIHRyYWNrcyB0aGF0IG9jY3VyIGF0IHRoZSBzYW1lIHRpbWUgKHRoYXQgaGF2ZSB0aGUgc2FtZSBzdGFydHRpbWUpLlxuICogVGhpcyBpcyBkb25lIGJ5IHRoZSBmb2xsb3dpbmc6XG4gKiAtIFN0b3JlIGEgbGlzdCBvZiBhbGwgdGhlIHN0YXJ0IHRpbWVzLlxuICogLSBTdG9yZSB0aGUgd2lkdGggb2Ygc3ltYm9scyBmb3IgZWFjaCBzdGFydCB0aW1lLCBmb3IgZWFjaCB0cmFjay5cbiAqIC0gU3RvcmUgdGhlIG1heGltdW0gd2lkdGggZm9yIGVhY2ggc3RhcnQgdGltZSwgYWNyb3NzIGFsbCB0cmFja3MuXG4gKiAtIEdldCB0aGUgZXh0cmEgd2lkdGggbmVlZGVkIGZvciBlYWNoIHRyYWNrIHRvIG1hdGNoIHRoZSBtYXhpbXVtXG4gKiAgIHdpZHRoIGZvciB0aGF0IHN0YXJ0IHRpbWUuXG4gKlxuICogU2VlIG1ldGhvZCBTaGVldE11c2ljLkFsaWduU3ltYm9scygpLCB3aGljaCB1c2VzIHRoaXMgY2xhc3MuXG4gKi9cblxucHVibGljIGNsYXNzIFN5bWJvbFdpZHRocyB7XG5cbiAgICAvKiogQXJyYXkgb2YgbWFwcyAoc3RhcnR0aW1lIC0+IHN5bWJvbCB3aWR0aCksIG9uZSBwZXIgdHJhY2sgKi9cbiAgICBwcml2YXRlIERpY3Rpb25hcnk8aW50LCBpbnQ+W10gd2lkdGhzO1xuXG4gICAgLyoqIE1hcCBvZiBzdGFydHRpbWUgLT4gbWF4aW11bSBzeW1ib2wgd2lkdGggKi9cbiAgICBwcml2YXRlIERpY3Rpb25hcnk8aW50LCBpbnQ+IG1heHdpZHRocztcblxuICAgIC8qKiBBbiBhcnJheSBvZiBhbGwgdGhlIHN0YXJ0dGltZXMsIGluIGFsbCB0cmFja3MgKi9cbiAgICBwcml2YXRlIGludFtdIHN0YXJ0dGltZXM7XG5cblxuICAgIC8qKiBJbml0aWFsaXplIHRoZSBzeW1ib2wgd2lkdGggbWFwcywgZ2l2ZW4gYWxsIHRoZSBzeW1ib2xzIGluXG4gICAgICogYWxsIHRoZSB0cmFja3MsIHBsdXMgdGhlIGx5cmljcyBpbiBhbGwgdHJhY2tzLlxuICAgICAqL1xuICAgIHB1YmxpYyBTeW1ib2xXaWR0aHMoTGlzdDxNdXNpY1N5bWJvbD5bXSB0cmFja3MsXG4gICAgICAgICAgICAgICAgICAgICAgICBMaXN0PEx5cmljU3ltYm9sPltdIHRyYWNrbHlyaWNzKSB7XG5cbiAgICAgICAgLyogR2V0IHRoZSBzeW1ib2wgd2lkdGhzIGZvciBhbGwgdGhlIHRyYWNrcyAqL1xuICAgICAgICB3aWR0aHMgPSBuZXcgRGljdGlvbmFyeTxpbnQsaW50PlsgdHJhY2tzLkxlbmd0aCBdO1xuICAgICAgICBmb3IgKGludCB0cmFjayA9IDA7IHRyYWNrIDwgdHJhY2tzLkxlbmd0aDsgdHJhY2srKykge1xuICAgICAgICAgICAgd2lkdGhzW3RyYWNrXSA9IEdldFRyYWNrV2lkdGhzKHRyYWNrc1t0cmFja10pO1xuICAgICAgICB9XG4gICAgICAgIG1heHdpZHRocyA9IG5ldyBEaWN0aW9uYXJ5PGludCxpbnQ+KCk7XG5cbiAgICAgICAgLyogQ2FsY3VsYXRlIHRoZSBtYXhpbXVtIHN5bWJvbCB3aWR0aHMgKi9cbiAgICAgICAgZm9yZWFjaCAoRGljdGlvbmFyeTxpbnQsaW50PiBkaWN0IGluIHdpZHRocykge1xuICAgICAgICAgICAgZm9yZWFjaCAoaW50IHRpbWUgaW4gZGljdC5LZXlzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFtYXh3aWR0aHMuQ29udGFpbnNLZXkodGltZSkgfHxcbiAgICAgICAgICAgICAgICAgICAgKG1heHdpZHRoc1t0aW1lXSA8IGRpY3RbdGltZV0pICkge1xuXG4gICAgICAgICAgICAgICAgICAgIG1heHdpZHRoc1t0aW1lXSA9IGRpY3RbdGltZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRyYWNrbHlyaWNzICE9IG51bGwpIHtcbiAgICAgICAgICAgIGZvcmVhY2ggKExpc3Q8THlyaWNTeW1ib2w+IGx5cmljcyBpbiB0cmFja2x5cmljcykge1xuICAgICAgICAgICAgICAgIGlmIChseXJpY3MgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTHlyaWNTeW1ib2wgbHlyaWMgaW4gbHlyaWNzKSB7XG4gICAgICAgICAgICAgICAgICAgIGludCB3aWR0aCA9IGx5cmljLk1pbldpZHRoO1xuICAgICAgICAgICAgICAgICAgICBpbnQgdGltZSA9IGx5cmljLlN0YXJ0VGltZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXh3aWR0aHMuQ29udGFpbnNLZXkodGltZSkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIChtYXh3aWR0aHNbdGltZV0gPCB3aWR0aCkgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG1heHdpZHRoc1t0aW1lXSA9IHdpZHRoO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyogU3RvcmUgYWxsIHRoZSBzdGFydCB0aW1lcyB0byB0aGUgc3RhcnR0aW1lIGFycmF5ICovXG4gICAgICAgIHN0YXJ0dGltZXMgPSBuZXcgaW50WyBtYXh3aWR0aHMuS2V5cy5Db3VudCBdO1xuICAgICAgICBtYXh3aWR0aHMuS2V5cy5Db3B5VG8oc3RhcnR0aW1lcywgMCk7XG4gICAgICAgIEFycmF5LlNvcnQ8aW50PihzdGFydHRpbWVzKTtcbiAgICB9XG5cbiAgICAvKiogQ3JlYXRlIGEgdGFibGUgb2YgdGhlIHN5bWJvbCB3aWR0aHMgZm9yIGVhY2ggc3RhcnR0aW1lIGluIHRoZSB0cmFjay4gKi9cbiAgICBwcml2YXRlIHN0YXRpYyBEaWN0aW9uYXJ5PGludCxpbnQ+IEdldFRyYWNrV2lkdGhzKExpc3Q8TXVzaWNTeW1ib2w+IHN5bWJvbHMpIHtcbiAgICAgICAgRGljdGlvbmFyeTxpbnQsaW50PiB3aWR0aHMgPSBuZXcgRGljdGlvbmFyeTxpbnQsaW50PigpO1xuXG4gICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIG0gaW4gc3ltYm9scykge1xuICAgICAgICAgICAgaW50IHN0YXJ0ID0gbS5TdGFydFRpbWU7XG4gICAgICAgICAgICBpbnQgdyA9IG0uTWluV2lkdGg7XG5cbiAgICAgICAgICAgIGlmIChtIGlzIEJhclN5bWJvbCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAod2lkdGhzLkNvbnRhaW5zS2V5KHN0YXJ0KSkge1xuICAgICAgICAgICAgICAgIHdpZHRoc1tzdGFydF0gKz0gdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHdpZHRoc1tzdGFydF0gPSB3O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB3aWR0aHM7XG4gICAgfVxuXG4gICAgLyoqIEdpdmVuIGEgdHJhY2sgYW5kIGEgc3RhcnQgdGltZSwgcmV0dXJuIHRoZSBleHRyYSB3aWR0aCBuZWVkZWQgc28gdGhhdFxuICAgICAqIHRoZSBzeW1ib2xzIGZvciB0aGF0IHN0YXJ0IHRpbWUgYWxpZ24gd2l0aCB0aGUgb3RoZXIgdHJhY2tzLlxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgR2V0RXh0cmFXaWR0aChpbnQgdHJhY2ssIGludCBzdGFydCkge1xuICAgICAgICBpZiAoIXdpZHRoc1t0cmFja10uQ29udGFpbnNLZXkoc3RhcnQpKSB7XG4gICAgICAgICAgICByZXR1cm4gbWF4d2lkdGhzW3N0YXJ0XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBtYXh3aWR0aHNbc3RhcnRdIC0gd2lkdGhzW3RyYWNrXVtzdGFydF07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIGFuIGFycmF5IG9mIGFsbCB0aGUgc3RhcnQgdGltZXMgaW4gYWxsIHRoZSB0cmFja3MgKi9cbiAgICBwdWJsaWMgaW50W10gU3RhcnRUaW1lcyB7XG4gICAgICAgIGdldCB7IHJldHVybiBzdGFydHRpbWVzOyB9XG4gICAgfVxuXG5cblxuXG59XG5cblxufVxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogVGhlIHBvc3NpYmxlIG5vdGUgZHVyYXRpb25zICovXG5wdWJsaWMgZW51bSBOb3RlRHVyYXRpb24ge1xuICBUaGlydHlTZWNvbmQsIFNpeHRlZW50aCwgVHJpcGxldCwgRWlnaHRoLFxuICBEb3R0ZWRFaWdodGgsIFF1YXJ0ZXIsIERvdHRlZFF1YXJ0ZXIsXG4gIEhhbGYsIERvdHRlZEhhbGYsIFdob2xlXG59O1xuXG4vKiogQGNsYXNzIFRpbWVTaWduYXR1cmVcbiAqIFRoZSBUaW1lU2lnbmF0dXJlIGNsYXNzIHJlcHJlc2VudHNcbiAqIC0gVGhlIHRpbWUgc2lnbmF0dXJlIG9mIHRoZSBzb25nLCBzdWNoIGFzIDQvNCwgMy80LCBvciA2LzggdGltZSwgYW5kXG4gKiAtIFRoZSBudW1iZXIgb2YgcHVsc2VzIHBlciBxdWFydGVyIG5vdGVcbiAqIC0gVGhlIG51bWJlciBvZiBtaWNyb3NlY29uZHMgcGVyIHF1YXJ0ZXIgbm90ZVxuICpcbiAqIEluIG1pZGkgZmlsZXMsIGFsbCB0aW1lIGlzIG1lYXN1cmVkIGluIFwicHVsc2VzXCIuICBFYWNoIG5vdGUgaGFzXG4gKiBhIHN0YXJ0IHRpbWUgKG1lYXN1cmVkIGluIHB1bHNlcyksIGFuZCBhIGR1cmF0aW9uIChtZWFzdXJlZCBpbiBcbiAqIHB1bHNlcykuICBUaGlzIGNsYXNzIGlzIHVzZWQgbWFpbmx5IHRvIGNvbnZlcnQgcHVsc2UgZHVyYXRpb25zXG4gKiAobGlrZSAxMjAsIDI0MCwgZXRjKSBpbnRvIG5vdGUgZHVyYXRpb25zIChoYWxmLCBxdWFydGVyLCBlaWdodGgsIGV0YykuXG4gKi9cblxucHVibGljIGNsYXNzIFRpbWVTaWduYXR1cmUge1xuICAgIHByaXZhdGUgaW50IG51bWVyYXRvcjsgICAgICAvKiogTnVtZXJhdG9yIG9mIHRoZSB0aW1lIHNpZ25hdHVyZSAqL1xuICAgIHByaXZhdGUgaW50IGRlbm9taW5hdG9yOyAgICAvKiogRGVub21pbmF0b3Igb2YgdGhlIHRpbWUgc2lnbmF0dXJlICovXG4gICAgcHJpdmF0ZSBpbnQgcXVhcnRlcm5vdGU7ICAgIC8qKiBOdW1iZXIgb2YgcHVsc2VzIHBlciBxdWFydGVyIG5vdGUgKi9cbiAgICBwcml2YXRlIGludCBtZWFzdXJlOyAgICAgICAgLyoqIE51bWJlciBvZiBwdWxzZXMgcGVyIG1lYXN1cmUgKi9cbiAgICBwcml2YXRlIGludCB0ZW1wbzsgICAgICAgICAgLyoqIE51bWJlciBvZiBtaWNyb3NlY29uZHMgcGVyIHF1YXJ0ZXIgbm90ZSAqL1xuXG4gICAgLyoqIEdldCB0aGUgbnVtZXJhdG9yIG9mIHRoZSB0aW1lIHNpZ25hdHVyZSAqL1xuICAgIHB1YmxpYyBpbnQgTnVtZXJhdG9yIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIG51bWVyYXRvcjsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIGRlbm9taW5hdG9yIG9mIHRoZSB0aW1lIHNpZ25hdHVyZSAqL1xuICAgIHB1YmxpYyBpbnQgRGVub21pbmF0b3Ige1xuICAgICAgICBnZXQgeyByZXR1cm4gZGVub21pbmF0b3I7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcHVsc2VzIHBlciBxdWFydGVyIG5vdGUgKi9cbiAgICBwdWJsaWMgaW50IFF1YXJ0ZXIge1xuICAgICAgICBnZXQgeyByZXR1cm4gcXVhcnRlcm5vdGU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcHVsc2VzIHBlciBtZWFzdXJlICovXG4gICAgcHVibGljIGludCBNZWFzdXJlIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIG1lYXN1cmU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgbWljcm9zZWNvbmRzIHBlciBxdWFydGVyIG5vdGUgKi8gXG4gICAgcHVibGljIGludCBUZW1wbyB7XG4gICAgICAgIGdldCB7IHJldHVybiB0ZW1wbzsgfVxuICAgIH1cblxuICAgIC8qKiBDcmVhdGUgYSBuZXcgdGltZSBzaWduYXR1cmUsIHdpdGggdGhlIGdpdmVuIG51bWVyYXRvcixcbiAgICAgKiBkZW5vbWluYXRvciwgcHVsc2VzIHBlciBxdWFydGVyIG5vdGUsIGFuZCB0ZW1wby5cbiAgICAgKi9cbiAgICBwdWJsaWMgVGltZVNpZ25hdHVyZShpbnQgbnVtZXJhdG9yLCBpbnQgZGVub21pbmF0b3IsIGludCBxdWFydGVybm90ZSwgaW50IHRlbXBvKSB7XG4gICAgICAgIGlmIChudW1lcmF0b3IgPD0gMCB8fCBkZW5vbWluYXRvciA8PSAwIHx8IHF1YXJ0ZXJub3RlIDw9IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBNaWRpRmlsZUV4Y2VwdGlvbihcIkludmFsaWQgdGltZSBzaWduYXR1cmVcIiwgMCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBNaWRpIEZpbGUgZ2l2ZXMgd3JvbmcgdGltZSBzaWduYXR1cmUgc29tZXRpbWVzICovXG4gICAgICAgIGlmIChudW1lcmF0b3IgPT0gNSkge1xuICAgICAgICAgICAgbnVtZXJhdG9yID0gNDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubnVtZXJhdG9yID0gbnVtZXJhdG9yO1xuICAgICAgICB0aGlzLmRlbm9taW5hdG9yID0gZGVub21pbmF0b3I7XG4gICAgICAgIHRoaXMucXVhcnRlcm5vdGUgPSBxdWFydGVybm90ZTtcbiAgICAgICAgdGhpcy50ZW1wbyA9IHRlbXBvO1xuXG4gICAgICAgIGludCBiZWF0O1xuICAgICAgICBpZiAoZGVub21pbmF0b3IgPCA0KVxuICAgICAgICAgICAgYmVhdCA9IHF1YXJ0ZXJub3RlICogMjtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYmVhdCA9IHF1YXJ0ZXJub3RlIC8gKGRlbm9taW5hdG9yLzQpO1xuXG4gICAgICAgIG1lYXN1cmUgPSBudW1lcmF0b3IgKiBiZWF0O1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gd2hpY2ggbWVhc3VyZSB0aGUgZ2l2ZW4gdGltZSAoaW4gcHVsc2VzKSBiZWxvbmdzIHRvLiAqL1xuICAgIHB1YmxpYyBpbnQgR2V0TWVhc3VyZShpbnQgdGltZSkge1xuICAgICAgICByZXR1cm4gdGltZSAvIG1lYXN1cmU7XG4gICAgfVxuXG4gICAgLyoqIEdpdmVuIGEgZHVyYXRpb24gaW4gcHVsc2VzLCByZXR1cm4gdGhlIGNsb3Nlc3Qgbm90ZSBkdXJhdGlvbi4gKi9cbiAgICBwdWJsaWMgTm90ZUR1cmF0aW9uIEdldE5vdGVEdXJhdGlvbihpbnQgZHVyYXRpb24pIHtcbiAgICAgICAgaW50IHdob2xlID0gcXVhcnRlcm5vdGUgKiA0O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgMSAgICAgICA9IDMyLzMyXG4gICAgICAgICAzLzQgICAgID0gMjQvMzJcbiAgICAgICAgIDEvMiAgICAgPSAxNi8zMlxuICAgICAgICAgMy84ICAgICA9IDEyLzMyXG4gICAgICAgICAxLzQgICAgID0gIDgvMzJcbiAgICAgICAgIDMvMTYgICAgPSAgNi8zMlxuICAgICAgICAgMS84ICAgICA9ICA0LzMyID0gICAgOC82NFxuICAgICAgICAgdHJpcGxldCAgICAgICAgID0gNS4zMy82NFxuICAgICAgICAgMS8xNiAgICA9ICAyLzMyID0gICAgNC82NFxuICAgICAgICAgMS8zMiAgICA9ICAxLzMyID0gICAgMi82NFxuICAgICAgICAgKiovIFxuXG4gICAgICAgIGlmICAgICAgKGR1cmF0aW9uID49IDI4Kndob2xlLzMyKVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5XaG9sZTtcbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPj0gMjAqd2hvbGUvMzIpIFxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5Eb3R0ZWRIYWxmO1xuICAgICAgICBlbHNlIGlmIChkdXJhdGlvbiA+PSAxNCp3aG9sZS8zMilcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uSGFsZjtcbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPj0gMTAqd2hvbGUvMzIpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLkRvdHRlZFF1YXJ0ZXI7XG4gICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID49ICA3Kndob2xlLzMyKVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5RdWFydGVyO1xuICAgICAgICBlbHNlIGlmIChkdXJhdGlvbiA+PSAgNSp3aG9sZS8zMilcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoO1xuICAgICAgICBlbHNlIGlmIChkdXJhdGlvbiA+PSAgNip3aG9sZS82NClcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uRWlnaHRoO1xuICAgICAgICBlbHNlIGlmIChkdXJhdGlvbiA+PSAgNSp3aG9sZS82NClcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uVHJpcGxldDtcbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPj0gIDMqd2hvbGUvNjQpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLlNpeHRlZW50aDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQ7XG4gICAgfVxuXG4gICAgLyoqIENvbnZlcnQgYSBub3RlIGR1cmF0aW9uIGludG8gYSBzdGVtIGR1cmF0aW9uLiAgRG90dGVkIGR1cmF0aW9uc1xuICAgICAqIGFyZSBjb252ZXJ0ZWQgaW50byB0aGVpciBub24tZG90dGVkIGVxdWl2YWxlbnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgTm90ZUR1cmF0aW9uIEdldFN0ZW1EdXJhdGlvbihOb3RlRHVyYXRpb24gZHVyKSB7XG4gICAgICAgIGlmIChkdXIgPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEhhbGYpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLkhhbGY7XG4gICAgICAgIGVsc2UgaWYgKGR1ciA9PSBOb3RlRHVyYXRpb24uRG90dGVkUXVhcnRlcilcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uUXVhcnRlcjtcbiAgICAgICAgZWxzZSBpZiAoZHVyID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGgpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLkVpZ2h0aDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGR1cjtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSB0aW1lIHBlcmlvZCAoaW4gcHVsc2VzKSB0aGUgdGhlIGdpdmVuIGR1cmF0aW9uIHNwYW5zICovXG4gICAgcHVibGljIGludCBEdXJhdGlvblRvVGltZShOb3RlRHVyYXRpb24gZHVyKSB7XG4gICAgICAgIGludCBlaWdodGggPSBxdWFydGVybm90ZS8yO1xuICAgICAgICBpbnQgc2l4dGVlbnRoID0gZWlnaHRoLzI7XG5cbiAgICAgICAgc3dpdGNoIChkdXIpIHtcbiAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLldob2xlOiAgICAgICAgIHJldHVybiBxdWFydGVybm90ZSAqIDQ7IFxuICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uRG90dGVkSGFsZjogICAgcmV0dXJuIHF1YXJ0ZXJub3RlICogMzsgXG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5IYWxmOiAgICAgICAgICByZXR1cm4gcXVhcnRlcm5vdGUgKiAyOyBcbiAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkRvdHRlZFF1YXJ0ZXI6IHJldHVybiAzKmVpZ2h0aDsgXG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5RdWFydGVyOiAgICAgICByZXR1cm4gcXVhcnRlcm5vdGU7IFxuICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoOiAgcmV0dXJuIDMqc2l4dGVlbnRoO1xuICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uRWlnaHRoOiAgICAgICAgcmV0dXJuIGVpZ2h0aDtcbiAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLlRyaXBsZXQ6ICAgICAgIHJldHVybiBxdWFydGVybm90ZS8zOyBcbiAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLlNpeHRlZW50aDogICAgIHJldHVybiBzaXh0ZWVudGg7XG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQ6ICByZXR1cm4gc2l4dGVlbnRoLzI7IFxuICAgICAgICAgICAgZGVmYXVsdDogICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBcbiAgICBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiVGltZVNpZ25hdHVyZT17MH0vezF9IHF1YXJ0ZXI9ezJ9IHRlbXBvPXszfVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1lcmF0b3IsIGRlbm9taW5hdG9yLCBxdWFydGVybm90ZSwgdGVtcG8pO1xuICAgIH1cbiAgICBcbn1cblxufVxuXG4iLCJ1c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5MaW5xO1xudXNpbmcgU3lzdGVtLlRleHQ7XG51c2luZyBTeXN0ZW0uVGhyZWFkaW5nLlRhc2tzO1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNCcmlkZ2UuVGV4dFxue1xuICAgIHB1YmxpYyBjbGFzcyBBU0NJSVxuICAgIHtcbiAgICAgICAgcHVibGljIHN0cmluZyBHZXRTdHJpbmcoYnl0ZVtdIGRhdGEsIGludCBzdGFydEluZGV4LCBpbnQgbGVuKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgdG9SZXR1cm4gPSBcIlwiO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW4gJiYgaSA8IGRhdGEuTGVuZ3RoOyBpKyspXG4gICAgICAgICAgICAgICAgdG9SZXR1cm4gKz0gKGNoYXIpZGF0YVtpICsgc3RhcnRJbmRleF07XG4gICAgICAgICAgICByZXR1cm4gdG9SZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJ1c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNCcmlkZ2UuVGV4dFxue1xuICAgIHB1YmxpYyBzdGF0aWMgY2xhc3MgRW5jb2RpbmdcbiAgICB7XG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQVNDSUkgQVNDSUkgPSBuZXcgQVNDSUkoKTtcbiAgICB9XG59XG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cblxuLyoqIEFjY2lkZW50YWxzICovXG5wdWJsaWMgZW51bSBBY2NpZCB7XG4gICAgTm9uZSwgU2hhcnAsIEZsYXQsIE5hdHVyYWxcbn1cblxuLyoqIEBjbGFzcyBBY2NpZFN5bWJvbFxuICogQW4gYWNjaWRlbnRhbCAoYWNjaWQpIHN5bWJvbCByZXByZXNlbnRzIGEgc2hhcnAsIGZsYXQsIG9yIG5hdHVyYWxcbiAqIGFjY2lkZW50YWwgdGhhdCBpcyBkaXNwbGF5ZWQgYXQgYSBzcGVjaWZpYyBwb3NpdGlvbiAobm90ZSBhbmQgY2xlZikuXG4gKi9cbnB1YmxpYyBjbGFzcyBBY2NpZFN5bWJvbCA6IE11c2ljU3ltYm9sIHtcbiAgICBwcml2YXRlIEFjY2lkIGFjY2lkOyAgICAgICAgICAvKiogVGhlIGFjY2lkZW50YWwgKHNoYXJwLCBmbGF0LCBuYXR1cmFsKSAqL1xuICAgIHByaXZhdGUgV2hpdGVOb3RlIHdoaXRlbm90ZTsgIC8qKiBUaGUgd2hpdGUgbm90ZSB3aGVyZSB0aGUgc3ltYm9sIG9jY3VycyAqL1xuICAgIHByaXZhdGUgQ2xlZiBjbGVmOyAgICAgICAgICAgIC8qKiBXaGljaCBjbGVmIHRoZSBzeW1ib2xzIGlzIGluICovXG4gICAgcHJpdmF0ZSBpbnQgd2lkdGg7ICAgICAgICAgICAgLyoqIFdpZHRoIG9mIHN5bWJvbCAqL1xuXG4gICAgLyoqIFxuICAgICAqIENyZWF0ZSBhIG5ldyBBY2NpZFN5bWJvbCB3aXRoIHRoZSBnaXZlbiBhY2NpZGVudGFsLCB0aGF0IGlzXG4gICAgICogZGlzcGxheWVkIGF0IHRoZSBnaXZlbiBub3RlIGluIHRoZSBnaXZlbiBjbGVmLlxuICAgICAqL1xuICAgIHB1YmxpYyBBY2NpZFN5bWJvbChBY2NpZCBhY2NpZCwgV2hpdGVOb3RlIG5vdGUsIENsZWYgY2xlZikge1xuICAgICAgICB0aGlzLmFjY2lkID0gYWNjaWQ7XG4gICAgICAgIHRoaXMud2hpdGVub3RlID0gbm90ZTtcbiAgICAgICAgdGhpcy5jbGVmID0gY2xlZjtcbiAgICAgICAgd2lkdGggPSBNaW5XaWR0aDtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSB3aGl0ZSBub3RlIHRoaXMgYWNjaWRlbnRhbCBpcyBkaXNwbGF5ZWQgYXQgKi9cbiAgICBwdWJsaWMgV2hpdGVOb3RlIE5vdGUgIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHdoaXRlbm90ZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIHRpbWUgKGluIHB1bHNlcykgdGhpcyBzeW1ib2wgb2NjdXJzIGF0LlxuICAgICAqIE5vdCB1c2VkLiAgSW5zdGVhZCwgdGhlIFN0YXJ0VGltZSBvZiB0aGUgQ2hvcmRTeW1ib2wgY29udGFpbmluZyB0aGlzXG4gICAgICogQWNjaWRTeW1ib2wgaXMgdXNlZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFN0YXJ0VGltZSB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gLTE7IH0gIFxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG1pbmltdW0gd2lkdGggKGluIHBpeGVscykgbmVlZGVkIHRvIGRyYXcgdGhpcyBzeW1ib2wgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IE1pbldpZHRoIHsgXG4gICAgICAgIGdldCB7IHJldHVybiAzKlNoZWV0TXVzaWMuTm90ZUhlaWdodC8yOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldC9TZXQgdGhlIHdpZHRoIChpbiBwaXhlbHMpIG9mIHRoaXMgc3ltYm9sLiBUaGUgd2lkdGggaXMgc2V0XG4gICAgICogaW4gU2hlZXRNdXNpYy5BbGlnblN5bWJvbHMoKSB0byB2ZXJ0aWNhbGx5IGFsaWduIHN5bWJvbHMuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBXaWR0aCB7XG4gICAgICAgIGdldCB7IHJldHVybiB3aWR0aDsgfVxuICAgICAgICBzZXQgeyB3aWR0aCA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGFib3ZlIHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEFib3ZlU3RhZmYge1xuICAgICAgICBnZXQgeyByZXR1cm4gR2V0QWJvdmVTdGFmZigpOyB9XG4gICAgfVxuXG4gICAgaW50IEdldEFib3ZlU3RhZmYoKSB7XG4gICAgICAgIGludCBkaXN0ID0gV2hpdGVOb3RlLlRvcChjbGVmKS5EaXN0KHdoaXRlbm90ZSkgKiBcbiAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcbiAgICAgICAgaWYgKGFjY2lkID09IEFjY2lkLlNoYXJwIHx8IGFjY2lkID09IEFjY2lkLk5hdHVyYWwpXG4gICAgICAgICAgICBkaXN0IC09IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgZWxzZSBpZiAoYWNjaWQgPT0gQWNjaWQuRmxhdClcbiAgICAgICAgICAgIGRpc3QgLT0gMypTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcblxuICAgICAgICBpZiAoZGlzdCA8IDApXG4gICAgICAgICAgICByZXR1cm4gLWRpc3Q7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBiZWxvdyB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBCZWxvd1N0YWZmIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIEdldEJlbG93U3RhZmYoKTsgfVxuICAgIH1cblxuICAgIHByaXZhdGUgaW50IEdldEJlbG93U3RhZmYoKSB7XG4gICAgICAgIGludCBkaXN0ID0gV2hpdGVOb3RlLkJvdHRvbShjbGVmKS5EaXN0KHdoaXRlbm90ZSkgKiBcbiAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQvMiArIFxuICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgaWYgKGFjY2lkID09IEFjY2lkLlNoYXJwIHx8IGFjY2lkID09IEFjY2lkLk5hdHVyYWwpIFxuICAgICAgICAgICAgZGlzdCArPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG5cbiAgICAgICAgaWYgKGRpc3QgPiAwKVxuICAgICAgICAgICAgcmV0dXJuIGRpc3Q7XG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgc3ltYm9sLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIERyYXcoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3ApIHtcbiAgICAgICAgLyogQWxpZ24gdGhlIHN5bWJvbCB0byB0aGUgcmlnaHQgKi9cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oV2lkdGggLSBNaW5XaWR0aCwgMCk7XG5cbiAgICAgICAgLyogU3RvcmUgdGhlIHktcGl4ZWwgdmFsdWUgb2YgdGhlIHRvcCBvZiB0aGUgd2hpdGVub3RlIGluIHlub3RlLiAqL1xuICAgICAgICBpbnQgeW5vdGUgPSB5dG9wICsgV2hpdGVOb3RlLlRvcChjbGVmKS5EaXN0KHdoaXRlbm90ZSkgKiBcbiAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG5cbiAgICAgICAgaWYgKGFjY2lkID09IEFjY2lkLlNoYXJwKVxuICAgICAgICAgICAgRHJhd1NoYXJwKGcsIHBlbiwgeW5vdGUpO1xuICAgICAgICBlbHNlIGlmIChhY2NpZCA9PSBBY2NpZC5GbGF0KVxuICAgICAgICAgICAgRHJhd0ZsYXQoZywgcGVuLCB5bm90ZSk7XG4gICAgICAgIGVsc2UgaWYgKGFjY2lkID09IEFjY2lkLk5hdHVyYWwpXG4gICAgICAgICAgICBEcmF3TmF0dXJhbChnLCBwZW4sIHlub3RlKTtcblxuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKFdpZHRoIC0gTWluV2lkdGgpLCAwKTtcbiAgICB9XG5cbiAgICAvKiogRHJhdyBhIHNoYXJwIHN5bWJvbC4gXG4gICAgICogQHBhcmFtIHlub3RlIFRoZSBwaXhlbCBsb2NhdGlvbiBvZiB0aGUgdG9wIG9mIHRoZSBhY2NpZGVudGFsJ3Mgbm90ZS4gXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgRHJhd1NoYXJwKEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5bm90ZSkge1xuXG4gICAgICAgIC8qIERyYXcgdGhlIHR3byB2ZXJ0aWNhbCBsaW5lcyAqL1xuICAgICAgICBpbnQgeXN0YXJ0ID0geW5vdGUgLSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgIGludCB5ZW5kID0geW5vdGUgKyAyKlNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgaW50IHggPSBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHgsIHlzdGFydCArIDIsIHgsIHllbmQpO1xuICAgICAgICB4ICs9IFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeCwgeXN0YXJ0LCB4LCB5ZW5kIC0gMik7XG5cbiAgICAgICAgLyogRHJhdyB0aGUgc2xpZ2h0bHkgdXB3YXJkcyBob3Jpem9udGFsIGxpbmVzICovXG4gICAgICAgIGludCB4c3RhcnQgPSBTaGVldE11c2ljLk5vdGVIZWlnaHQvMiAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodC80O1xuICAgICAgICBpbnQgeGVuZCA9IFNoZWV0TXVzaWMuTm90ZUhlaWdodCArIFNoZWV0TXVzaWMuTm90ZUhlaWdodC80O1xuICAgICAgICB5c3RhcnQgPSB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVdpZHRoO1xuICAgICAgICB5ZW5kID0geXN0YXJ0IC0gU2hlZXRNdXNpYy5MaW5lV2lkdGggLSBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuICAgICAgICBwZW4uV2lkdGggPSBTaGVldE11c2ljLkxpbmVTcGFjZS8yO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5c3RhcnQsIHhlbmQsIHllbmQpO1xuICAgICAgICB5c3RhcnQgKz0gU2hlZXRNdXNpYy5MaW5lU3BhY2U7XG4gICAgICAgIHllbmQgKz0gU2hlZXRNdXNpYy5MaW5lU3BhY2U7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHlzdGFydCwgeGVuZCwgeWVuZCk7XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG4gICAgfVxuXG4gICAgLyoqIERyYXcgYSBmbGF0IHN5bWJvbC5cbiAgICAgKiBAcGFyYW0geW5vdGUgVGhlIHBpeGVsIGxvY2F0aW9uIG9mIHRoZSB0b3Agb2YgdGhlIGFjY2lkZW50YWwncyBub3RlLlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIERyYXdGbGF0KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5bm90ZSkge1xuICAgICAgICBpbnQgeCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQ7XG5cbiAgICAgICAgLyogRHJhdyB0aGUgdmVydGljYWwgbGluZSAqL1xuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeCwgeW5vdGUgLSBTaGVldE11c2ljLk5vdGVIZWlnaHQgLSBTaGVldE11c2ljLk5vdGVIZWlnaHQvMixcbiAgICAgICAgICAgICAgICAgICAgICAgIHgsIHlub3RlICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KTtcblxuICAgICAgICAvKiBEcmF3IDMgYmV6aWVyIGN1cnZlcy5cbiAgICAgICAgICogQWxsIDMgY3VydmVzIHN0YXJ0IGFuZCBzdG9wIGF0IHRoZSBzYW1lIHBvaW50cy5cbiAgICAgICAgICogRWFjaCBzdWJzZXF1ZW50IGN1cnZlIGJ1bGdlcyBtb3JlIGFuZCBtb3JlIHRvd2FyZHMgXG4gICAgICAgICAqIHRoZSB0b3ByaWdodCBjb3JuZXIsIG1ha2luZyB0aGUgY3VydmUgbG9vayB0aGlja2VyXG4gICAgICAgICAqIHRvd2FyZHMgdGhlIHRvcC1yaWdodC5cbiAgICAgICAgICovXG4gICAgICAgIGcuRHJhd0JlemllcihwZW4sIHgsIHlub3RlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCxcbiAgICAgICAgICAgIHggKyBTaGVldE11c2ljLkxpbmVTcGFjZS8yLCB5bm90ZSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIsXG4gICAgICAgICAgICB4ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UsIHlub3RlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMyxcbiAgICAgICAgICAgIHgsIHlub3RlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UgKyBTaGVldE11c2ljLkxpbmVXaWR0aCArIDEpO1xuXG4gICAgICAgIGcuRHJhd0JlemllcihwZW4sIHgsIHlub3RlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCxcbiAgICAgICAgICAgIHggKyBTaGVldE11c2ljLkxpbmVTcGFjZS8yLCB5bm90ZSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIsXG4gICAgICAgICAgICB4ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UgKyBTaGVldE11c2ljLkxpbmVTcGFjZS80LCBcbiAgICAgICAgICAgICAgeW5vdGUgKyBTaGVldE11c2ljLkxpbmVTcGFjZS8zIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCxcbiAgICAgICAgICAgIHgsIHlub3RlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UgKyBTaGVldE11c2ljLkxpbmVXaWR0aCArIDEpO1xuXG5cbiAgICAgICAgZy5EcmF3QmV6aWVyKHBlbiwgeCwgeW5vdGUgKyBTaGVldE11c2ljLkxpbmVTcGFjZS80LFxuICAgICAgICAgICAgeCArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIsIHlub3RlIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvMixcbiAgICAgICAgICAgIHggKyBTaGVldE11c2ljLkxpbmVTcGFjZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIsIFxuICAgICAgICAgICAgIHlub3RlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMyAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIsXG4gICAgICAgICAgICB4LCB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlICsgU2hlZXRNdXNpYy5MaW5lV2lkdGggKyAxKTtcblxuXG4gICAgfVxuXG4gICAgLyoqIERyYXcgYSBuYXR1cmFsIHN5bWJvbC5cbiAgICAgKiBAcGFyYW0geW5vdGUgVGhlIHBpeGVsIGxvY2F0aW9uIG9mIHRoZSB0b3Agb2YgdGhlIGFjY2lkZW50YWwncyBub3RlLlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIERyYXdOYXR1cmFsKEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5bm90ZSkge1xuXG4gICAgICAgIC8qIERyYXcgdGhlIHR3byB2ZXJ0aWNhbCBsaW5lcyAqL1xuICAgICAgICBpbnQgeXN0YXJ0ID0geW5vdGUgLSBTaGVldE11c2ljLkxpbmVTcGFjZSAtIFNoZWV0TXVzaWMuTGluZVdpZHRoO1xuICAgICAgICBpbnQgeWVuZCA9IHlub3RlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UgKyBTaGVldE11c2ljLkxpbmVXaWR0aDtcbiAgICAgICAgaW50IHggPSBTaGVldE11c2ljLkxpbmVTcGFjZS8yO1xuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeCwgeXN0YXJ0LCB4LCB5ZW5kKTtcbiAgICAgICAgeCArPSBTaGVldE11c2ljLkxpbmVTcGFjZSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQ7XG4gICAgICAgIHlzdGFydCA9IHlub3RlIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNDtcbiAgICAgICAgeWVuZCA9IHlub3RlICsgMipTaGVldE11c2ljLkxpbmVTcGFjZSArIFNoZWV0TXVzaWMuTGluZVdpZHRoIC0gXG4gICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQ7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCB4LCB5c3RhcnQsIHgsIHllbmQpO1xuXG4gICAgICAgIC8qIERyYXcgdGhlIHNsaWdodGx5IHVwd2FyZHMgaG9yaXpvbnRhbCBsaW5lcyAqL1xuICAgICAgICBpbnQgeHN0YXJ0ID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvMjtcbiAgICAgICAgaW50IHhlbmQgPSB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQ7XG4gICAgICAgIHlzdGFydCA9IHlub3RlICsgU2hlZXRNdXNpYy5MaW5lV2lkdGg7XG4gICAgICAgIHllbmQgPSB5c3RhcnQgLSBTaGVldE11c2ljLkxpbmVXaWR0aCAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQ7XG4gICAgICAgIHBlbi5XaWR0aCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzI7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHlzdGFydCwgeGVuZCwgeWVuZCk7XG4gICAgICAgIHlzdGFydCArPSBTaGVldE11c2ljLkxpbmVTcGFjZTtcbiAgICAgICAgeWVuZCArPSBTaGVldE11c2ljLkxpbmVTcGFjZTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeXN0YXJ0LCB4ZW5kLCB5ZW5kKTtcbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb3ZlcnJpZGUgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gc3RyaW5nLkZvcm1hdChcbiAgICAgICAgICBcIkFjY2lkU3ltYm9sIGFjY2lkPXswfSB3aGl0ZW5vdGU9ezF9IGNsZWY9ezJ9IHdpZHRoPXszfVwiLFxuICAgICAgICAgIGFjY2lkLCB3aGl0ZW5vdGUsIGNsZWYsIHdpZHRoKTtcbiAgICB9XG5cbn1cblxufVxuXG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMSBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuXG4vKiogQGNsYXNzIEJhclN5bWJvbFxuICogVGhlIEJhclN5bWJvbCByZXByZXNlbnRzIHRoZSB2ZXJ0aWNhbCBiYXJzIHdoaWNoIGRlbGltaXQgbWVhc3VyZXMuXG4gKiBUaGUgc3RhcnR0aW1lIG9mIHRoZSBzeW1ib2wgaXMgdGhlIGJlZ2lubmluZyBvZiB0aGUgbmV3XG4gKiBtZWFzdXJlLlxuICovXG5wdWJsaWMgY2xhc3MgQmFyU3ltYm9sIDogTXVzaWNTeW1ib2wge1xuICAgIHByaXZhdGUgaW50IHN0YXJ0dGltZTtcbiAgICBwcml2YXRlIGludCB3aWR0aDtcblxuICAgIC8qKiBDcmVhdGUgYSBCYXJTeW1ib2wuIFRoZSBzdGFydHRpbWUgc2hvdWxkIGJlIHRoZSBiZWdpbm5pbmcgb2YgYSBtZWFzdXJlLiAqL1xuICAgIHB1YmxpYyBCYXJTeW1ib2woaW50IHN0YXJ0dGltZSkge1xuICAgICAgICB0aGlzLnN0YXJ0dGltZSA9IHN0YXJ0dGltZTtcbiAgICAgICAgd2lkdGggPSBNaW5XaWR0aDtcbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSB0aW1lIChpbiBwdWxzZXMpIHRoaXMgc3ltYm9sIG9jY3VycyBhdC5cbiAgICAgKiBUaGlzIGlzIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBtZWFzdXJlIHRoaXMgc3ltYm9sIGJlbG9uZ3MgdG8uXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBTdGFydFRpbWUge1xuICAgICAgICBnZXQgeyByZXR1cm4gc3RhcnR0aW1lOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbWluaW11bSB3aWR0aCAoaW4gcGl4ZWxzKSBuZWVkZWQgdG8gZHJhdyB0aGlzIHN5bWJvbCAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgTWluV2lkdGggeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIDIgKiBTaGVldE11c2ljLkxpbmVTcGFjZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQvU2V0IHRoZSB3aWR0aCAoaW4gcGl4ZWxzKSBvZiB0aGlzIHN5bWJvbC4gVGhlIHdpZHRoIGlzIHNldFxuICAgICAqIGluIFNoZWV0TXVzaWMuQWxpZ25TeW1ib2xzKCkgdG8gdmVydGljYWxseSBhbGlnbiBzeW1ib2xzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgV2lkdGgge1xuICAgICAgICBnZXQgeyByZXR1cm4gd2lkdGg7IH1cbiAgICAgICAgc2V0IHsgd2lkdGggPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBhYm92ZSB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBBYm92ZVN0YWZmIHsgXG4gICAgICAgIGdldCB7IHJldHVybiAwOyB9IFxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBiZWxvdyB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBCZWxvd1N0YWZmIHsgXG4gICAgICAgIGdldCB7IHJldHVybiAwOyB9XG4gICAgfVxuXG4gICAgLyoqIERyYXcgYSB2ZXJ0aWNhbCBiYXIuXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHlsb2NhdGlvbiAoaW4gcGl4ZWxzKSB3aGVyZSB0aGUgdG9wIG9mIHRoZSBzdGFmZiBzdGFydHMuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIFxuICAgIHZvaWQgRHJhdyhHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICBpbnQgeSA9IHl0b3A7XG4gICAgICAgIGludCB5ZW5kID0geSArIFNoZWV0TXVzaWMuTGluZVNwYWNlKjQgKyBTaGVldE11c2ljLkxpbmVXaWR0aCo0O1xuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgU2hlZXRNdXNpYy5Ob3RlV2lkdGgvMiwgeSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVXaWR0aC8yLCB5ZW5kKTtcblxuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiQmFyU3ltYm9sIHN0YXJ0dGltZT17MH0gd2lkdGg9ezF9XCIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydHRpbWUsIHdpZHRoKTtcbiAgICB9XG59XG5cblxufVxuXG4iLCJ1c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcbntcbiAgICBwdWJsaWMgY2xhc3MgQml0bWFwOkltYWdlXG4gICAge1xuICAgICAgICBwdWJsaWMgQml0bWFwKFR5cGUgdHlwZSwgc3RyaW5nIGZpbGVuYW1lKVxuICAgICAgICA6YmFzZSh0eXBlLGZpbGVuYW1lKXtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG5cbiAgICAgICAgXG4gICAgfVxufVxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG5cbi8qKiBAY2xhc3MgQmxhbmtTeW1ib2wgXG4gKiBUaGUgQmxhbmsgc3ltYm9sIGlzIGEgbXVzaWMgc3ltYm9sIHRoYXQgZG9lc24ndCBkcmF3IGFueXRoaW5nLiAgVGhpc1xuICogc3ltYm9sIGlzIHVzZWQgZm9yIGFsaWdubWVudCBwdXJwb3NlcywgdG8gYWxpZ24gbm90ZXMgaW4gZGlmZmVyZW50IFxuICogc3RhZmZzIHdoaWNoIG9jY3VyIGF0IHRoZSBzYW1lIHRpbWUuXG4gKi9cbnB1YmxpYyBjbGFzcyBCbGFua1N5bWJvbCA6IE11c2ljU3ltYm9sIHtcbiAgICBwcml2YXRlIGludCBzdGFydHRpbWU7IFxuICAgIHByaXZhdGUgaW50IHdpZHRoO1xuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBCbGFua1N5bWJvbCB3aXRoIHRoZSBnaXZlbiBzdGFydHRpbWUgYW5kIHdpZHRoICovXG4gICAgcHVibGljIEJsYW5rU3ltYm9sKGludCBzdGFydHRpbWUsIGludCB3aWR0aCkge1xuICAgICAgICB0aGlzLnN0YXJ0dGltZSA9IHN0YXJ0dGltZTtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIHRpbWUgKGluIHB1bHNlcykgdGhpcyBzeW1ib2wgb2NjdXJzIGF0LlxuICAgICAqIFRoaXMgaXMgdXNlZCB0byBkZXRlcm1pbmUgdGhlIG1lYXN1cmUgdGhpcyBzeW1ib2wgYmVsb25ncyB0by5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFN0YXJ0VGltZSB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gc3RhcnR0aW1lOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbWluaW11bSB3aWR0aCAoaW4gcGl4ZWxzKSBuZWVkZWQgdG8gZHJhdyB0aGlzIHN5bWJvbCAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgTWluV2lkdGgge1xuICAgICAgICBnZXQgeyByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQvU2V0IHRoZSB3aWR0aCAoaW4gcGl4ZWxzKSBvZiB0aGlzIHN5bWJvbC4gVGhlIHdpZHRoIGlzIHNldFxuICAgICAqIGluIFNoZWV0TXVzaWMuQWxpZ25TeW1ib2xzKCkgdG8gdmVydGljYWxseSBhbGlnbiBzeW1ib2xzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgV2lkdGggeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgIHNldCB7IHdpZHRoID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYWJvdmUgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQWJvdmVTdGFmZiB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBiZWxvdyB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBCZWxvd1N0YWZmIHsgXG4gICAgICAgIGdldCB7IHJldHVybiAwOyB9XG4gICAgfVxuXG4gICAgLyoqIERyYXcgbm90aGluZy5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7fVxuXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJCbGFua1N5bWJvbCBzdGFydHRpbWU9ezB9IHdpZHRoPXsxfVwiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnR0aW1lLCB3aWR0aCk7XG4gICAgfVxufVxuXG5cbn1cblxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbnB1YmxpYyBlbnVtIFN0ZW1EaXIgeyBVcCwgRG93biB9O1xuXG4vKiogQGNsYXNzIE5vdGVEYXRhXG4gKiAgQ29udGFpbnMgZmllbGRzIGZvciBkaXNwbGF5aW5nIGEgc2luZ2xlIG5vdGUgaW4gYSBjaG9yZC5cbiAqL1xucHVibGljIGNsYXNzIE5vdGVEYXRhIHtcbiAgICBwdWJsaWMgaW50IG51bWJlcjsgICAgICAgICAgICAgLyoqIFRoZSBNaWRpIG5vdGUgbnVtYmVyLCB1c2VkIHRvIGRldGVybWluZSB0aGUgY29sb3IgKi9cbiAgICBwdWJsaWMgV2hpdGVOb3RlIHdoaXRlbm90ZTsgICAgLyoqIFRoZSB3aGl0ZSBub3RlIGxvY2F0aW9uIHRvIGRyYXcgKi9cbiAgICBwdWJsaWMgTm90ZUR1cmF0aW9uIGR1cmF0aW9uOyAgLyoqIFRoZSBkdXJhdGlvbiBvZiB0aGUgbm90ZSAqL1xuICAgIHB1YmxpYyBib29sIGxlZnRzaWRlOyAgICAgICAgICAvKiogV2hldGhlciB0byBkcmF3IG5vdGUgdG8gdGhlIGxlZnQgb3IgcmlnaHQgb2YgdGhlIHN0ZW0gKi9cbiAgICBwdWJsaWMgQWNjaWQgYWNjaWQ7ICAgICAgICAgICAgLyoqIFVzZWQgdG8gY3JlYXRlIHRoZSBBY2NpZFN5bWJvbHMgZm9yIHRoZSBjaG9yZCAqL1xufTtcblxuLyoqIEBjbGFzcyBDaG9yZFN5bWJvbFxuICogQSBjaG9yZCBzeW1ib2wgcmVwcmVzZW50cyBhIGdyb3VwIG9mIG5vdGVzIHRoYXQgYXJlIHBsYXllZCBhdCB0aGUgc2FtZVxuICogdGltZS4gIEEgY2hvcmQgaW5jbHVkZXMgdGhlIG5vdGVzLCB0aGUgYWNjaWRlbnRhbCBzeW1ib2xzIGZvciBlYWNoXG4gKiBub3RlLCBhbmQgdGhlIHN0ZW0gKG9yIHN0ZW1zKSB0byB1c2UuICBBIHNpbmdsZSBjaG9yZCBtYXkgaGF2ZSB0d28gXG4gKiBzdGVtcyBpZiB0aGUgbm90ZXMgaGF2ZSBkaWZmZXJlbnQgZHVyYXRpb25zIChlLmcuIGlmIG9uZSBub3RlIGlzIGFcbiAqIHF1YXJ0ZXIgbm90ZSwgYW5kIGFub3RoZXIgaXMgYW4gZWlnaHRoIG5vdGUpLlxuICovXG5wdWJsaWMgY2xhc3MgQ2hvcmRTeW1ib2wgOiBNdXNpY1N5bWJvbCB7XG4gICAgcHJpdmF0ZSBDbGVmIGNsZWY7ICAgICAgICAgICAgIC8qKiBXaGljaCBjbGVmIHRoZSBjaG9yZCBpcyBiZWluZyBkcmF3biBpbiAqL1xuICAgIHByaXZhdGUgaW50IHN0YXJ0dGltZTsgICAgICAgICAvKiogVGhlIHRpbWUgKGluIHB1bHNlcykgdGhlIG5vdGVzIG9jY3VycyBhdCAqL1xuICAgIHByaXZhdGUgaW50IGVuZHRpbWU7ICAgICAgICAgICAvKiogVGhlIHN0YXJ0dGltZSBwbHVzIHRoZSBsb25nZXN0IG5vdGUgZHVyYXRpb24gKi9cbiAgICBwcml2YXRlIE5vdGVEYXRhW10gbm90ZWRhdGE7ICAgLyoqIFRoZSBub3RlcyB0byBkcmF3ICovXG4gICAgcHJpdmF0ZSBBY2NpZFN5bWJvbFtdIGFjY2lkc3ltYm9sczsgICAvKiogVGhlIGFjY2lkZW50YWwgc3ltYm9scyB0byBkcmF3ICovXG4gICAgcHJpdmF0ZSBpbnQgd2lkdGg7ICAgICAgICAgICAgIC8qKiBUaGUgd2lkdGggb2YgdGhlIGNob3JkICovXG4gICAgcHJpdmF0ZSBTdGVtIHN0ZW0xOyAgICAgICAgICAgIC8qKiBUaGUgc3RlbSBvZiB0aGUgY2hvcmQuIENhbiBiZSBudWxsLiAqL1xuICAgIHByaXZhdGUgU3RlbSBzdGVtMjsgICAgICAgICAgICAvKiogVGhlIHNlY29uZCBzdGVtIG9mIHRoZSBjaG9yZC4gQ2FuIGJlIG51bGwgKi9cbiAgICBwcml2YXRlIGJvb2wgaGFzdHdvc3RlbXM7ICAgICAgLyoqIFRydWUgaWYgdGhpcyBjaG9yZCBoYXMgdHdvIHN0ZW1zICovXG4gICAgcHJpdmF0ZSBTaGVldE11c2ljIHNoZWV0bXVzaWM7IC8qKiBVc2VkIHRvIGdldCBjb2xvcnMgYW5kIG90aGVyIG9wdGlvbnMgKi9cblxuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBDaG9yZCBTeW1ib2wgZnJvbSB0aGUgZ2l2ZW4gbGlzdCBvZiBtaWRpIG5vdGVzLlxuICAgICAqIEFsbCB0aGUgbWlkaSBub3RlcyB3aWxsIGhhdmUgdGhlIHNhbWUgc3RhcnQgdGltZS4gIFVzZSB0aGVcbiAgICAgKiBrZXkgc2lnbmF0dXJlIHRvIGdldCB0aGUgd2hpdGUga2V5IGFuZCBhY2NpZGVudGFsIHN5bWJvbCBmb3JcbiAgICAgKiBlYWNoIG5vdGUuICBVc2UgdGhlIHRpbWUgc2lnbmF0dXJlIHRvIGNhbGN1bGF0ZSB0aGUgZHVyYXRpb25cbiAgICAgKiBvZiB0aGUgbm90ZXMuIFVzZSB0aGUgY2xlZiB3aGVuIGRyYXdpbmcgdGhlIGNob3JkLlxuICAgICAqL1xuICAgIHB1YmxpYyBDaG9yZFN5bWJvbChMaXN0PE1pZGlOb3RlPiBtaWRpbm90ZXMsIEtleVNpZ25hdHVyZSBrZXksIFxuICAgICAgICAgICAgICAgICAgICAgICBUaW1lU2lnbmF0dXJlIHRpbWUsIENsZWYgYywgU2hlZXRNdXNpYyBzaGVldCkge1xuXG4gICAgICAgIGludCBsZW4gPSBtaWRpbm90ZXMuQ291bnQ7XG4gICAgICAgIGludCBpO1xuXG4gICAgICAgIGhhc3R3b3N0ZW1zID0gZmFsc2U7XG4gICAgICAgIGNsZWYgPSBjO1xuICAgICAgICBzaGVldG11c2ljID0gc2hlZXQ7XG5cbiAgICAgICAgc3RhcnR0aW1lID0gbWlkaW5vdGVzWzBdLlN0YXJ0VGltZTtcbiAgICAgICAgZW5kdGltZSA9IG1pZGlub3Rlc1swXS5FbmRUaW1lO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBtaWRpbm90ZXMuQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgaWYgKGkgPiAxKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1pZGlub3Rlc1tpXS5OdW1iZXIgPCBtaWRpbm90ZXNbaS0xXS5OdW1iZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5c3RlbS5Bcmd1bWVudEV4Y2VwdGlvbihcIkNob3JkIG5vdGVzIG5vdCBpbiBpbmNyZWFzaW5nIG9yZGVyIGJ5IG51bWJlclwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbmR0aW1lID0gTWF0aC5NYXgoZW5kdGltZSwgbWlkaW5vdGVzW2ldLkVuZFRpbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgbm90ZWRhdGEgPSBDcmVhdGVOb3RlRGF0YShtaWRpbm90ZXMsIGtleSwgdGltZSk7XG4gICAgICAgIGFjY2lkc3ltYm9scyA9IENyZWF0ZUFjY2lkU3ltYm9scyhub3RlZGF0YSwgY2xlZik7XG5cblxuICAgICAgICAvKiBGaW5kIG91dCBob3cgbWFueSBzdGVtcyB3ZSBuZWVkICgxIG9yIDIpICovXG4gICAgICAgIE5vdGVEdXJhdGlvbiBkdXIxID0gbm90ZWRhdGFbMF0uZHVyYXRpb247XG4gICAgICAgIE5vdGVEdXJhdGlvbiBkdXIyID0gZHVyMTtcbiAgICAgICAgaW50IGNoYW5nZSA9IC0xO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbm90ZWRhdGEuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGR1cjIgPSBub3RlZGF0YVtpXS5kdXJhdGlvbjtcbiAgICAgICAgICAgIGlmIChkdXIxICE9IGR1cjIpIHtcbiAgICAgICAgICAgICAgICBjaGFuZ2UgPSBpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGR1cjEgIT0gZHVyMikge1xuICAgICAgICAgICAgLyogV2UgaGF2ZSBub3RlcyB3aXRoIGRpZmZlcmVudCBkdXJhdGlvbnMuICBTbyB3ZSB3aWxsIG5lZWRcbiAgICAgICAgICAgICAqIHR3byBzdGVtcy4gIFRoZSBmaXJzdCBzdGVtIHBvaW50cyBkb3duLCBhbmQgY29udGFpbnMgdGhlXG4gICAgICAgICAgICAgKiBib3R0b20gbm90ZSB1cCB0byB0aGUgbm90ZSB3aXRoIHRoZSBkaWZmZXJlbnQgZHVyYXRpb24uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogVGhlIHNlY29uZCBzdGVtIHBvaW50cyB1cCwgYW5kIGNvbnRhaW5zIHRoZSBub3RlIHdpdGggdGhlXG4gICAgICAgICAgICAgKiBkaWZmZXJlbnQgZHVyYXRpb24gdXAgdG8gdGhlIHRvcCBub3RlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBoYXN0d29zdGVtcyA9IHRydWU7XG4gICAgICAgICAgICBzdGVtMSA9IG5ldyBTdGVtKG5vdGVkYXRhWzBdLndoaXRlbm90ZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGVkYXRhW2NoYW5nZS0xXS53aGl0ZW5vdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR1cjEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdGVtLkRvd24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5vdGVzT3ZlcmxhcChub3RlZGF0YSwgMCwgY2hhbmdlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHN0ZW0yID0gbmV3IFN0ZW0obm90ZWRhdGFbY2hhbmdlXS53aGl0ZW5vdGUsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlZGF0YVtub3RlZGF0YS5MZW5ndGgtMV0ud2hpdGVub3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkdXIyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3RlbS5VcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTm90ZXNPdmVybGFwKG5vdGVkYXRhLCBjaGFuZ2UsIG5vdGVkYXRhLkxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLyogQWxsIG5vdGVzIGhhdmUgdGhlIHNhbWUgZHVyYXRpb24sIHNvIHdlIG9ubHkgbmVlZCBvbmUgc3RlbS4gKi9cbiAgICAgICAgICAgIGludCBkaXJlY3Rpb24gPSBTdGVtRGlyZWN0aW9uKG5vdGVkYXRhWzBdLndoaXRlbm90ZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlZGF0YVtub3RlZGF0YS5MZW5ndGgtMV0ud2hpdGVub3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlZik7XG5cbiAgICAgICAgICAgIHN0ZW0xID0gbmV3IFN0ZW0obm90ZWRhdGFbMF0ud2hpdGVub3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlZGF0YVtub3RlZGF0YS5MZW5ndGgtMV0ud2hpdGVub3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkdXIxLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOb3Rlc092ZXJsYXAobm90ZWRhdGEsIDAsIG5vdGVkYXRhLkxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgc3RlbTIgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogRm9yIHdob2xlIG5vdGVzLCBubyBzdGVtIGlzIGRyYXduLiAqL1xuICAgICAgICBpZiAoZHVyMSA9PSBOb3RlRHVyYXRpb24uV2hvbGUpXG4gICAgICAgICAgICBzdGVtMSA9IG51bGw7XG4gICAgICAgIGlmIChkdXIyID09IE5vdGVEdXJhdGlvbi5XaG9sZSlcbiAgICAgICAgICAgIHN0ZW0yID0gbnVsbDtcblxuICAgICAgICB3aWR0aCA9IE1pbldpZHRoO1xuICAgIH1cblxuXG4gICAgLyoqIEdpdmVuIHRoZSByYXcgbWlkaSBub3RlcyAodGhlIG5vdGUgbnVtYmVyIGFuZCBkdXJhdGlvbiBpbiBwdWxzZXMpLFxuICAgICAqIGNhbGN1bGF0ZSB0aGUgZm9sbG93aW5nIG5vdGUgZGF0YTpcbiAgICAgKiAtIFRoZSB3aGl0ZSBrZXlcbiAgICAgKiAtIFRoZSBhY2NpZGVudGFsIChpZiBhbnkpXG4gICAgICogLSBUaGUgbm90ZSBkdXJhdGlvbiAoaGFsZiwgcXVhcnRlciwgZWlnaHRoLCBldGMpXG4gICAgICogLSBUaGUgc2lkZSBpdCBzaG91bGQgYmUgZHJhd24gKGxlZnQgb3Igc2lkZSlcbiAgICAgKiBCeSBkZWZhdWx0LCBub3RlcyBhcmUgZHJhd24gb24gdGhlIGxlZnQgc2lkZS4gIEhvd2V2ZXIsIGlmIHR3byBub3Rlc1xuICAgICAqIG92ZXJsYXAgKGxpa2UgQSBhbmQgQikgeW91IGNhbm5vdCBkcmF3IHRoZSBuZXh0IG5vdGUgZGlyZWN0bHkgYWJvdmUgaXQuXG4gICAgICogSW5zdGVhZCB5b3UgbXVzdCBzaGlmdCBvbmUgb2YgdGhlIG5vdGVzIHRvIHRoZSByaWdodC5cbiAgICAgKlxuICAgICAqIFRoZSBLZXlTaWduYXR1cmUgaXMgdXNlZCB0byBkZXRlcm1pbmUgdGhlIHdoaXRlIGtleSBhbmQgYWNjaWRlbnRhbC5cbiAgICAgKiBUaGUgVGltZVNpZ25hdHVyZSBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgZHVyYXRpb24uXG4gICAgICovXG4gXG4gICAgcHJpdmF0ZSBzdGF0aWMgTm90ZURhdGFbXSBcbiAgICBDcmVhdGVOb3RlRGF0YShMaXN0PE1pZGlOb3RlPiBtaWRpbm90ZXMsIEtleVNpZ25hdHVyZSBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUaW1lU2lnbmF0dXJlIHRpbWUpIHtcblxuICAgICAgICBpbnQgbGVuID0gbWlkaW5vdGVzLkNvdW50O1xuICAgICAgICBOb3RlRGF0YVtdIG5vdGVkYXRhID0gbmV3IE5vdGVEYXRhW2xlbl07XG5cbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgTWlkaU5vdGUgbWlkaSA9IG1pZGlub3Rlc1tpXTtcbiAgICAgICAgICAgIG5vdGVkYXRhW2ldID0gbmV3IE5vdGVEYXRhKCk7XG4gICAgICAgICAgICBub3RlZGF0YVtpXS5udW1iZXIgPSBtaWRpLk51bWJlcjtcbiAgICAgICAgICAgIG5vdGVkYXRhW2ldLmxlZnRzaWRlID0gdHJ1ZTtcbiAgICAgICAgICAgIG5vdGVkYXRhW2ldLndoaXRlbm90ZSA9IGtleS5HZXRXaGl0ZU5vdGUobWlkaS5OdW1iZXIpO1xuICAgICAgICAgICAgbm90ZWRhdGFbaV0uZHVyYXRpb24gPSB0aW1lLkdldE5vdGVEdXJhdGlvbihtaWRpLkVuZFRpbWUgLSBtaWRpLlN0YXJ0VGltZSk7XG4gICAgICAgICAgICBub3RlZGF0YVtpXS5hY2NpZCA9IGtleS5HZXRBY2NpZGVudGFsKG1pZGkuTnVtYmVyLCBtaWRpLlN0YXJ0VGltZSAvIHRpbWUuTWVhc3VyZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChpID4gMCAmJiAobm90ZWRhdGFbaV0ud2hpdGVub3RlLkRpc3Qobm90ZWRhdGFbaS0xXS53aGl0ZW5vdGUpID09IDEpKSB7XG4gICAgICAgICAgICAgICAgLyogVGhpcyBub3RlIChub3RlZGF0YVtpXSkgb3ZlcmxhcHMgd2l0aCB0aGUgcHJldmlvdXMgbm90ZS5cbiAgICAgICAgICAgICAgICAgKiBDaGFuZ2UgdGhlIHNpZGUgb2YgdGhpcyBub3RlLlxuICAgICAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAgICAgaWYgKG5vdGVkYXRhW2ktMV0ubGVmdHNpZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm90ZWRhdGFbaV0ubGVmdHNpZGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBub3RlZGF0YVtpXS5sZWZ0c2lkZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBub3RlZGF0YVtpXS5sZWZ0c2lkZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vdGVkYXRhO1xuICAgIH1cblxuXG4gICAgLyoqIEdpdmVuIHRoZSBub3RlIGRhdGEgKHRoZSB3aGl0ZSBrZXlzIGFuZCBhY2NpZGVudGFscyksIGNyZWF0ZSBcbiAgICAgKiB0aGUgQWNjaWRlbnRhbCBTeW1ib2xzIGFuZCByZXR1cm4gdGhlbS5cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBBY2NpZFN5bWJvbFtdIFxuICAgIENyZWF0ZUFjY2lkU3ltYm9scyhOb3RlRGF0YVtdIG5vdGVkYXRhLCBDbGVmIGNsZWYpIHtcbiAgICAgICAgaW50IGNvdW50ID0gMDtcbiAgICAgICAgZm9yZWFjaCAoTm90ZURhdGEgbiBpbiBub3RlZGF0YSkge1xuICAgICAgICAgICAgaWYgKG4uYWNjaWQgIT0gQWNjaWQuTm9uZSkge1xuICAgICAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgQWNjaWRTeW1ib2xbXSBzeW1ib2xzID0gbmV3IEFjY2lkU3ltYm9sW2NvdW50XTtcbiAgICAgICAgaW50IGkgPSAwO1xuICAgICAgICBmb3JlYWNoIChOb3RlRGF0YSBuIGluIG5vdGVkYXRhKSB7XG4gICAgICAgICAgICBpZiAobi5hY2NpZCAhPSBBY2NpZC5Ob25lKSB7XG4gICAgICAgICAgICAgICAgc3ltYm9sc1tpXSA9IG5ldyBBY2NpZFN5bWJvbChuLmFjY2lkLCBuLndoaXRlbm90ZSwgY2xlZik7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzeW1ib2xzO1xuICAgIH1cblxuICAgIC8qKiBDYWxjdWxhdGUgdGhlIHN0ZW0gZGlyZWN0aW9uIChVcCBvciBkb3duKSBiYXNlZCBvbiB0aGUgdG9wIGFuZFxuICAgICAqIGJvdHRvbSBub3RlIGluIHRoZSBjaG9yZC4gIElmIHRoZSBhdmVyYWdlIG9mIHRoZSBub3RlcyBpcyBhYm92ZVxuICAgICAqIHRoZSBtaWRkbGUgb2YgdGhlIHN0YWZmLCB0aGUgZGlyZWN0aW9uIGlzIGRvd24uICBFbHNlLCB0aGVcbiAgICAgKiBkaXJlY3Rpb24gaXMgdXAuXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50IFxuICAgIFN0ZW1EaXJlY3Rpb24oV2hpdGVOb3RlIGJvdHRvbSwgV2hpdGVOb3RlIHRvcCwgQ2xlZiBjbGVmKSB7XG4gICAgICAgIFdoaXRlTm90ZSBtaWRkbGU7XG4gICAgICAgIGlmIChjbGVmID09IENsZWYuVHJlYmxlKVxuICAgICAgICAgICAgbWlkZGxlID0gbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQiwgNSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG1pZGRsZSA9IG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkQsIDMpO1xuXG4gICAgICAgIGludCBkaXN0ID0gbWlkZGxlLkRpc3QoYm90dG9tKSArIG1pZGRsZS5EaXN0KHRvcCk7XG4gICAgICAgIGlmIChkaXN0ID49IDApXG4gICAgICAgICAgICByZXR1cm4gU3RlbS5VcDtcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIHJldHVybiBTdGVtLkRvd247XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB3aGV0aGVyIGFueSBvZiB0aGUgbm90ZXMgaW4gbm90ZWRhdGEgKGJldHdlZW4gc3RhcnQgYW5kXG4gICAgICogZW5kIGluZGV4ZXMpIG92ZXJsYXAuICBUaGlzIGlzIG5lZWRlZCBieSB0aGUgU3RlbSBjbGFzcyB0b1xuICAgICAqIGRldGVybWluZSB0aGUgcG9zaXRpb24gb2YgdGhlIHN0ZW0gKGxlZnQgb3IgcmlnaHQgb2Ygbm90ZXMpLlxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGJvb2wgTm90ZXNPdmVybGFwKE5vdGVEYXRhW10gbm90ZWRhdGEsIGludCBzdGFydCwgaW50IGVuZCkge1xuICAgICAgICBmb3IgKGludCBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgICAgICAgaWYgKCFub3RlZGF0YVtpXS5sZWZ0c2lkZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSB0aW1lIChpbiBwdWxzZXMpIHRoaXMgc3ltYm9sIG9jY3VycyBhdC5cbiAgICAgKiBUaGlzIGlzIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBtZWFzdXJlIHRoaXMgc3ltYm9sIGJlbG9uZ3MgdG8uXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBTdGFydFRpbWUgeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHN0YXJ0dGltZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIGVuZCB0aW1lIChpbiBwdWxzZXMpIG9mIHRoZSBsb25nZXN0IG5vdGUgaW4gdGhlIGNob3JkLlxuICAgICAqIFVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdHdvIGFkamFjZW50IGNob3JkcyBjYW4gYmUgam9pbmVkXG4gICAgICogYnkgYSBzdGVtLlxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgRW5kVGltZSB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gZW5kdGltZTsgfVxuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIGNsZWYgdGhpcyBjaG9yZCBpcyBkcmF3biBpbi4gKi9cbiAgICBwdWJsaWMgQ2xlZiBDbGVmIHsgXG4gICAgICAgIGdldCB7IHJldHVybiBjbGVmOyB9XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0cnVlIGlmIHRoaXMgY2hvcmQgaGFzIHR3byBzdGVtcyAqL1xuICAgIHB1YmxpYyBib29sIEhhc1R3b1N0ZW1zIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIGhhc3R3b3N0ZW1zOyB9XG4gICAgfVxuXG4gICAgLyogUmV0dXJuIHRoZSBzdGVtIHdpbGwgdGhlIHNtYWxsZXN0IGR1cmF0aW9uLiAgVGhpcyBwcm9wZXJ0eVxuICAgICAqIGlzIHVzZWQgd2hlbiBtYWtpbmcgY2hvcmQgcGFpcnMgKGNob3JkcyBqb2luZWQgYnkgYSBob3Jpem9udGFsXG4gICAgICogYmVhbSBzdGVtKS4gVGhlIHN0ZW0gZHVyYXRpb25zIG11c3QgbWF0Y2ggaW4gb3JkZXIgdG8gbWFrZVxuICAgICAqIGEgY2hvcmQgcGFpci4gIElmIGEgY2hvcmQgaGFzIHR3byBzdGVtcywgd2UgYWx3YXlzIHJldHVyblxuICAgICAqIHRoZSBvbmUgd2l0aCBhIHNtYWxsZXIgZHVyYXRpb24sIGJlY2F1c2UgaXQgaGFzIGEgYmV0dGVyIFxuICAgICAqIGNoYW5jZSBvZiBtYWtpbmcgYSBwYWlyLlxuICAgICAqL1xuICAgIHB1YmxpYyBTdGVtIFN0ZW0ge1xuICAgICAgICBnZXQgeyBcbiAgICAgICAgICAgIGlmIChzdGVtMSA9PSBudWxsKSB7IHJldHVybiBzdGVtMjsgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc3RlbTIgPT0gbnVsbCkgeyByZXR1cm4gc3RlbTE7IH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHN0ZW0xLkR1cmF0aW9uIDwgc3RlbTIuRHVyYXRpb24pIHsgcmV0dXJuIHN0ZW0xOyB9XG4gICAgICAgICAgICBlbHNlIHsgcmV0dXJuIHN0ZW0yOyB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogR2V0L1NldCB0aGUgd2lkdGggKGluIHBpeGVscykgb2YgdGhpcyBzeW1ib2wuIFRoZSB3aWR0aCBpcyBzZXRcbiAgICAgKiBpbiBTaGVldE11c2ljLkFsaWduU3ltYm9scygpIHRvIHZlcnRpY2FsbHkgYWxpZ24gc3ltYm9scy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFdpZHRoIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgIHNldCB7IHdpZHRoID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBtaW5pbXVtIHdpZHRoIChpbiBwaXhlbHMpIG5lZWRlZCB0byBkcmF3IHRoaXMgc3ltYm9sICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBNaW5XaWR0aCB7XG4gICAgICAgIGdldCB7IHJldHVybiBHZXRNaW5XaWR0aCgpOyB9XG4gICAgfVxuXG4gICAgLyogUmV0dXJuIHRoZSBtaW5pbXVtIHdpZHRoIG5lZWRlZCB0byBkaXNwbGF5IHRoaXMgY2hvcmQuXG4gICAgICpcbiAgICAgKiBUaGUgYWNjaWRlbnRhbCBzeW1ib2xzIGNhbiBiZSBkcmF3biBhYm92ZSBvbmUgYW5vdGhlciBhcyBsb25nXG4gICAgICogYXMgdGhleSBkb24ndCBvdmVybGFwICh0aGV5IG11c3QgYmUgYXQgbGVhc3QgNiBub3RlcyBhcGFydCkuXG4gICAgICogSWYgdHdvIGFjY2lkZW50YWwgc3ltYm9scyBkbyBvdmVybGFwLCB0aGUgYWNjaWRlbnRhbCBzeW1ib2xcbiAgICAgKiBvbiB0b3AgbXVzdCBiZSBzaGlmdGVkIHRvIHRoZSByaWdodC4gIFNvIHRoZSB3aWR0aCBuZWVkZWQgZm9yXG4gICAgICogYWNjaWRlbnRhbCBzeW1ib2xzIGRlcGVuZHMgb24gd2hldGhlciB0aGV5IG92ZXJsYXAgb3Igbm90LlxuICAgICAqXG4gICAgICogSWYgd2UgYXJlIGFsc28gZGlzcGxheWluZyB0aGUgbGV0dGVycywgaW5jbHVkZSBleHRyYSB3aWR0aC5cbiAgICAgKi9cbiAgICBpbnQgR2V0TWluV2lkdGgoKSB7XG4gICAgICAgIC8qIFRoZSB3aWR0aCBuZWVkZWQgZm9yIHRoZSBub3RlIGNpcmNsZXMgKi9cbiAgICAgICAgaW50IHJlc3VsdCA9IDIqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjMvNDtcblxuICAgICAgICBpZiAoYWNjaWRzeW1ib2xzLkxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSBhY2NpZHN5bWJvbHNbMF0uTWluV2lkdGg7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMTsgaSA8IGFjY2lkc3ltYm9scy5MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIEFjY2lkU3ltYm9sIGFjY2lkID0gYWNjaWRzeW1ib2xzW2ldO1xuICAgICAgICAgICAgICAgIEFjY2lkU3ltYm9sIHByZXYgPSBhY2NpZHN5bWJvbHNbaS0xXTtcbiAgICAgICAgICAgICAgICBpZiAoYWNjaWQuTm90ZS5EaXN0KHByZXYuTm90ZSkgPCA2KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBhY2NpZC5NaW5XaWR0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNoZWV0bXVzaWMgIT0gbnVsbCAmJiBzaGVldG11c2ljLlNob3dOb3RlTGV0dGVycyAhPSBNaWRpT3B0aW9ucy5Ob3RlTmFtZU5vbmUpIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSA4O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYWJvdmUgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQWJvdmVTdGFmZiB7XG4gICAgICAgIGdldCB7IHJldHVybiBHZXRBYm92ZVN0YWZmKCk7IH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGludCBHZXRBYm92ZVN0YWZmKCkge1xuICAgICAgICAvKiBGaW5kIHRoZSB0b3Btb3N0IG5vdGUgaW4gdGhlIGNob3JkICovXG4gICAgICAgIFdoaXRlTm90ZSB0b3Bub3RlID0gbm90ZWRhdGFbIG5vdGVkYXRhLkxlbmd0aC0xIF0ud2hpdGVub3RlO1xuXG4gICAgICAgIC8qIFRoZSBzdGVtLkVuZCBpcyB0aGUgbm90ZSBwb3NpdGlvbiB3aGVyZSB0aGUgc3RlbSBlbmRzLlxuICAgICAgICAgKiBDaGVjayBpZiB0aGUgc3RlbSBlbmQgaXMgaGlnaGVyIHRoYW4gdGhlIHRvcCBub3RlLlxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKHN0ZW0xICE9IG51bGwpXG4gICAgICAgICAgICB0b3Bub3RlID0gV2hpdGVOb3RlLk1heCh0b3Bub3RlLCBzdGVtMS5FbmQpO1xuICAgICAgICBpZiAoc3RlbTIgIT0gbnVsbClcbiAgICAgICAgICAgIHRvcG5vdGUgPSBXaGl0ZU5vdGUuTWF4KHRvcG5vdGUsIHN0ZW0yLkVuZCk7XG5cbiAgICAgICAgaW50IGRpc3QgPSB0b3Bub3RlLkRpc3QoV2hpdGVOb3RlLlRvcChjbGVmKSkgKiBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcbiAgICAgICAgaW50IHJlc3VsdCA9IDA7XG4gICAgICAgIGlmIChkaXN0ID4gMClcbiAgICAgICAgICAgIHJlc3VsdCA9IGRpc3Q7XG5cbiAgICAgICAgLyogQ2hlY2sgaWYgYW55IGFjY2lkZW50YWwgc3ltYm9scyBleHRlbmQgYWJvdmUgdGhlIHN0YWZmICovXG4gICAgICAgIGZvcmVhY2ggKEFjY2lkU3ltYm9sIHN5bWJvbCBpbiBhY2NpZHN5bWJvbHMpIHtcbiAgICAgICAgICAgIGlmIChzeW1ib2wuQWJvdmVTdGFmZiA+IHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHN5bWJvbC5BYm92ZVN0YWZmO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGJlbG93IHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEJlbG93U3RhZmYge1xuICAgICAgICBnZXQgeyByZXR1cm4gR2V0QmVsb3dTdGFmZigpOyB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbnQgR2V0QmVsb3dTdGFmZigpIHtcbiAgICAgICAgLyogRmluZCB0aGUgYm90dG9tIG5vdGUgaW4gdGhlIGNob3JkICovXG4gICAgICAgIFdoaXRlTm90ZSBib3R0b21ub3RlID0gbm90ZWRhdGFbMF0ud2hpdGVub3RlO1xuXG4gICAgICAgIC8qIFRoZSBzdGVtLkVuZCBpcyB0aGUgbm90ZSBwb3NpdGlvbiB3aGVyZSB0aGUgc3RlbSBlbmRzLlxuICAgICAgICAgKiBDaGVjayBpZiB0aGUgc3RlbSBlbmQgaXMgbG93ZXIgdGhhbiB0aGUgYm90dG9tIG5vdGUuXG4gICAgICAgICAqL1xuICAgICAgICBpZiAoc3RlbTEgIT0gbnVsbClcbiAgICAgICAgICAgIGJvdHRvbW5vdGUgPSBXaGl0ZU5vdGUuTWluKGJvdHRvbW5vdGUsIHN0ZW0xLkVuZCk7XG4gICAgICAgIGlmIChzdGVtMiAhPSBudWxsKVxuICAgICAgICAgICAgYm90dG9tbm90ZSA9IFdoaXRlTm90ZS5NaW4oYm90dG9tbm90ZSwgc3RlbTIuRW5kKTtcblxuICAgICAgICBpbnQgZGlzdCA9IFdoaXRlTm90ZS5Cb3R0b20oY2xlZikuRGlzdChib3R0b21ub3RlKSAqXG4gICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG5cbiAgICAgICAgaW50IHJlc3VsdCA9IDA7XG4gICAgICAgIGlmIChkaXN0ID4gMClcbiAgICAgICAgICAgIHJlc3VsdCA9IGRpc3Q7XG5cbiAgICAgICAgLyogQ2hlY2sgaWYgYW55IGFjY2lkZW50YWwgc3ltYm9scyBleHRlbmQgYmVsb3cgdGhlIHN0YWZmICovIFxuICAgICAgICBmb3JlYWNoIChBY2NpZFN5bWJvbCBzeW1ib2wgaW4gYWNjaWRzeW1ib2xzKSB7XG4gICAgICAgICAgICBpZiAoc3ltYm9sLkJlbG93U3RhZmYgPiByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBzeW1ib2wuQmVsb3dTdGFmZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG5hbWUgZm9yIHRoaXMgbm90ZSAqL1xuICAgIHByaXZhdGUgc3RyaW5nIE5vdGVOYW1lKGludCBub3RlbnVtYmVyLCBXaGl0ZU5vdGUgd2hpdGVub3RlKSB7XG4gICAgICAgIGlmIChzaGVldG11c2ljLlNob3dOb3RlTGV0dGVycyA9PSBNaWRpT3B0aW9ucy5Ob3RlTmFtZUxldHRlcikge1xuICAgICAgICAgICAgcmV0dXJuIExldHRlcihub3RlbnVtYmVyLCB3aGl0ZW5vdGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHNoZWV0bXVzaWMuU2hvd05vdGVMZXR0ZXJzID09IE1pZGlPcHRpb25zLk5vdGVOYW1lRml4ZWREb1JlTWkpIHtcbiAgICAgICAgICAgIHN0cmluZ1tdIGZpeGVkRG9SZU1pID0ge1xuICAgICAgICAgICAgICAgIFwiTGFcIiwgXCJMaVwiLCBcIlRpXCIsIFwiRG9cIiwgXCJEaVwiLCBcIlJlXCIsIFwiUmlcIiwgXCJNaVwiLCBcIkZhXCIsIFwiRmlcIiwgXCJTb1wiLCBcIlNpXCIgXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaW50IG5vdGVzY2FsZSA9IE5vdGVTY2FsZS5Gcm9tTnVtYmVyKG5vdGVudW1iZXIpO1xuICAgICAgICAgICAgcmV0dXJuIGZpeGVkRG9SZU1pW25vdGVzY2FsZV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc2hlZXRtdXNpYy5TaG93Tm90ZUxldHRlcnMgPT0gTWlkaU9wdGlvbnMuTm90ZU5hbWVNb3ZhYmxlRG9SZU1pKSB7XG4gICAgICAgICAgICBzdHJpbmdbXSBmaXhlZERvUmVNaSA9IHtcbiAgICAgICAgICAgICAgICBcIkxhXCIsIFwiTGlcIiwgXCJUaVwiLCBcIkRvXCIsIFwiRGlcIiwgXCJSZVwiLCBcIlJpXCIsIFwiTWlcIiwgXCJGYVwiLCBcIkZpXCIsIFwiU29cIiwgXCJTaVwiIFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGludCBtYWluc2NhbGUgPSBzaGVldG11c2ljLk1haW5LZXkuTm90ZXNjYWxlKCk7XG4gICAgICAgICAgICBpbnQgZGlmZiA9IE5vdGVTY2FsZS5DIC0gbWFpbnNjYWxlO1xuICAgICAgICAgICAgbm90ZW51bWJlciArPSBkaWZmO1xuICAgICAgICAgICAgaWYgKG5vdGVudW1iZXIgPCAwKSB7XG4gICAgICAgICAgICAgICAgbm90ZW51bWJlciArPSAxMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGludCBub3Rlc2NhbGUgPSBOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyKTtcbiAgICAgICAgICAgIHJldHVybiBmaXhlZERvUmVNaVtub3Rlc2NhbGVdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHNoZWV0bXVzaWMuU2hvd05vdGVMZXR0ZXJzID09IE1pZGlPcHRpb25zLk5vdGVOYW1lRml4ZWROdW1iZXIpIHtcbiAgICAgICAgICAgIHN0cmluZ1tdIG51bSA9IHtcbiAgICAgICAgICAgICAgICBcIjEwXCIsIFwiMTFcIiwgXCIxMlwiLCBcIjFcIiwgXCIyXCIsIFwiM1wiLCBcIjRcIiwgXCI1XCIsIFwiNlwiLCBcIjdcIiwgXCI4XCIsIFwiOVwiIFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGludCBub3Rlc2NhbGUgPSBOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyKTtcbiAgICAgICAgICAgIHJldHVybiBudW1bbm90ZXNjYWxlXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzaGVldG11c2ljLlNob3dOb3RlTGV0dGVycyA9PSBNaWRpT3B0aW9ucy5Ob3RlTmFtZU1vdmFibGVOdW1iZXIpIHtcbiAgICAgICAgICAgIHN0cmluZ1tdIG51bSA9IHtcbiAgICAgICAgICAgICAgICBcIjEwXCIsIFwiMTFcIiwgXCIxMlwiLCBcIjFcIiwgXCIyXCIsIFwiM1wiLCBcIjRcIiwgXCI1XCIsIFwiNlwiLCBcIjdcIiwgXCI4XCIsIFwiOVwiIFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGludCBtYWluc2NhbGUgPSBzaGVldG11c2ljLk1haW5LZXkuTm90ZXNjYWxlKCk7XG4gICAgICAgICAgICBpbnQgZGlmZiA9IE5vdGVTY2FsZS5DIC0gbWFpbnNjYWxlO1xuICAgICAgICAgICAgbm90ZW51bWJlciArPSBkaWZmO1xuICAgICAgICAgICAgaWYgKG5vdGVudW1iZXIgPCAwKSB7XG4gICAgICAgICAgICAgICAgbm90ZW51bWJlciArPSAxMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGludCBub3Rlc2NhbGUgPSBOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyKTtcbiAgICAgICAgICAgIHJldHVybiBudW1bbm90ZXNjYWxlXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbGV0dGVyIChBLCBBIywgQmIpIHJlcHJlc2VudGluZyB0aGlzIG5vdGUgKi9cbiAgICBwcml2YXRlIHN0cmluZyBMZXR0ZXIoaW50IG5vdGVudW1iZXIsIFdoaXRlTm90ZSB3aGl0ZW5vdGUpIHtcbiAgICAgICAgaW50IG5vdGVzY2FsZSA9IE5vdGVTY2FsZS5Gcm9tTnVtYmVyKG5vdGVudW1iZXIpO1xuICAgICAgICBzd2l0Y2gobm90ZXNjYWxlKSB7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5BOiByZXR1cm4gXCJBXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5COiByZXR1cm4gXCJCXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5DOiByZXR1cm4gXCJDXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5EOiByZXR1cm4gXCJEXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5FOiByZXR1cm4gXCJFXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5GOiByZXR1cm4gXCJGXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5HOiByZXR1cm4gXCJHXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5Bc2hhcnA6XG4gICAgICAgICAgICAgICAgaWYgKHdoaXRlbm90ZS5MZXR0ZXIgPT0gV2hpdGVOb3RlLkEpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIkEjXCI7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJCYlwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQ3NoYXJwOlxuICAgICAgICAgICAgICAgIGlmICh3aGl0ZW5vdGUuTGV0dGVyID09IFdoaXRlTm90ZS5DKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJDI1wiO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiRGJcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkRzaGFycDpcbiAgICAgICAgICAgICAgICBpZiAod2hpdGVub3RlLkxldHRlciA9PSBXaGl0ZU5vdGUuRClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiRCNcIjtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIkViXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5Gc2hhcnA6XG4gICAgICAgICAgICAgICAgaWYgKHdoaXRlbm90ZS5MZXR0ZXIgPT0gV2hpdGVOb3RlLkYpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIkYjXCI7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJHYlwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuR3NoYXJwOlxuICAgICAgICAgICAgICAgIGlmICh3aGl0ZW5vdGUuTGV0dGVyID09IFdoaXRlTm90ZS5HKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJHI1wiO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiQWJcIjtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgQ2hvcmQgU3ltYm9sOlxuICAgICAqIC0gRHJhdyB0aGUgYWNjaWRlbnRhbCBzeW1ib2xzLlxuICAgICAqIC0gRHJhdyB0aGUgYmxhY2sgY2lyY2xlIG5vdGVzLlxuICAgICAqIC0gRHJhdyB0aGUgc3RlbXMuXG4gICAgICBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIC8qIEFsaWduIHRoZSBjaG9yZCB0byB0aGUgcmlnaHQgKi9cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oV2lkdGggLSBNaW5XaWR0aCwgMCk7XG5cbiAgICAgICAgLyogRHJhdyB0aGUgYWNjaWRlbnRhbHMuICovXG4gICAgICAgIFdoaXRlTm90ZSB0b3BzdGFmZiA9IFdoaXRlTm90ZS5Ub3AoY2xlZik7XG4gICAgICAgIGludCB4cG9zID0gRHJhd0FjY2lkKGcsIHBlbiwgeXRvcCk7XG5cbiAgICAgICAgLyogRHJhdyB0aGUgbm90ZXMgKi9cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeHBvcywgMCk7XG4gICAgICAgIERyYXdOb3RlcyhnLCBwZW4sIHl0b3AsIHRvcHN0YWZmKTtcbiAgICAgICAgaWYgKHNoZWV0bXVzaWMgIT0gbnVsbCAmJiBzaGVldG11c2ljLlNob3dOb3RlTGV0dGVycyAhPSAwKSB7XG4gICAgICAgICAgICBEcmF3Tm90ZUxldHRlcnMoZywgcGVuLCB5dG9wLCB0b3BzdGFmZik7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBEcmF3IHRoZSBzdGVtcyAqL1xuICAgICAgICBpZiAoc3RlbTEgIT0gbnVsbClcbiAgICAgICAgICAgIHN0ZW0xLkRyYXcoZywgcGVuLCB5dG9wLCB0b3BzdGFmZik7XG4gICAgICAgIGlmIChzdGVtMiAhPSBudWxsKVxuICAgICAgICAgICAgc3RlbTIuRHJhdyhnLCBwZW4sIHl0b3AsIHRvcHN0YWZmKTtcblxuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgteHBvcywgMCk7XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0oV2lkdGggLSBNaW5XaWR0aCksIDApO1xuICAgIH1cblxuICAgIC8qIERyYXcgdGhlIGFjY2lkZW50YWwgc3ltYm9scy4gIElmIHR3byBzeW1ib2xzIG92ZXJsYXAgKGlmIHRoZXlcbiAgICAgKiBhcmUgbGVzcyB0aGFuIDYgbm90ZXMgYXBhcnQpLCB3ZSBjYW5ub3QgZHJhdyB0aGUgc3ltYm9sIGRpcmVjdGx5XG4gICAgICogYWJvdmUgdGhlIHByZXZpb3VzIG9uZS4gIEluc3RlYWQsIHdlIG11c3Qgc2hpZnQgaXQgdG8gdGhlIHJpZ2h0LlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEByZXR1cm4gVGhlIHggcGl4ZWwgd2lkdGggdXNlZCBieSBhbGwgdGhlIGFjY2lkZW50YWxzLlxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgRHJhd0FjY2lkKEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIGludCB4cG9zID0gMDtcblxuICAgICAgICBBY2NpZFN5bWJvbCBwcmV2ID0gbnVsbDtcbiAgICAgICAgZm9yZWFjaCAoQWNjaWRTeW1ib2wgc3ltYm9sIGluIGFjY2lkc3ltYm9scykge1xuICAgICAgICAgICAgaWYgKHByZXYgIT0gbnVsbCAmJiBzeW1ib2wuTm90ZS5EaXN0KHByZXYuTm90ZSkgPCA2KSB7XG4gICAgICAgICAgICAgICAgeHBvcyArPSBzeW1ib2wuV2lkdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSh4cG9zLCAwKTtcbiAgICAgICAgICAgIHN5bWJvbC5EcmF3KGcsIHBlbiwgeXRvcCk7XG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgteHBvcywgMCk7XG4gICAgICAgICAgICBwcmV2ID0gc3ltYm9sO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcmV2ICE9IG51bGwpIHtcbiAgICAgICAgICAgIHhwb3MgKz0gcHJldi5XaWR0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geHBvcztcbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgYmxhY2sgY2lyY2xlIG5vdGVzLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEBwYXJhbSB0b3BzdGFmZiBUaGUgd2hpdGUgbm90ZSBvZiB0aGUgdG9wIG9mIHRoZSBzdGFmZi5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3Tm90ZXMoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3AsIFdoaXRlTm90ZSB0b3BzdGFmZikge1xuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgICAgICBmb3JlYWNoIChOb3RlRGF0YSBub3RlIGluIG5vdGVkYXRhKSB7XG4gICAgICAgICAgICAvKiBHZXQgdGhlIHgseSBwb3NpdGlvbiB0byBkcmF3IHRoZSBub3RlICovXG4gICAgICAgICAgICBpbnQgeW5vdGUgPSB5dG9wICsgdG9wc3RhZmYuRGlzdChub3RlLndoaXRlbm90ZSkgKiBcbiAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG4gICAgICAgICAgICBpbnQgeG5vdGUgPSBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuICAgICAgICAgICAgaWYgKCFub3RlLmxlZnRzaWRlKVxuICAgICAgICAgICAgICAgIHhub3RlICs9IFNoZWV0TXVzaWMuTm90ZVdpZHRoO1xuXG4gICAgICAgICAgICAvKiBEcmF3IHJvdGF0ZWQgZWxsaXBzZS4gIFlvdSBtdXN0IGZpcnN0IHRyYW5zbGF0ZSAoMCwwKVxuICAgICAgICAgICAgICogdG8gdGhlIGNlbnRlciBvZiB0aGUgZWxsaXBzZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeG5vdGUgKyBTaGVldE11c2ljLk5vdGVXaWR0aC8yICsgMSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5bm90ZSAtIFNoZWV0TXVzaWMuTGluZVdpZHRoICsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQvMik7XG4gICAgICAgICAgICBnLlJvdGF0ZVRyYW5zZm9ybSgtNDUpO1xuXG4gICAgICAgICAgICBpZiAoc2hlZXRtdXNpYyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcGVuLkNvbG9yID0gc2hlZXRtdXNpYy5Ob3RlQ29sb3Iobm90ZS5udW1iZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcGVuLkNvbG9yID0gQ29sb3IuQmxhY2s7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChub3RlLmR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5XaG9sZSB8fCBcbiAgICAgICAgICAgICAgICBub3RlLmR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5IYWxmIHx8XG4gICAgICAgICAgICAgICAgbm90ZS5kdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkSGFsZikge1xuXG4gICAgICAgICAgICAgICAgZy5EcmF3RWxsaXBzZShwZW4sIC1TaGVldE11c2ljLk5vdGVXaWR0aC8yLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC1TaGVldE11c2ljLk5vdGVIZWlnaHQvMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZVdpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LTEpO1xuXG4gICAgICAgICAgICAgICAgZy5EcmF3RWxsaXBzZShwZW4sIC1TaGVldE11c2ljLk5vdGVXaWR0aC8yLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC1TaGVldE11c2ljLk5vdGVIZWlnaHQvMiArIDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC0yKTtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0VsbGlwc2UocGVuLCAtU2hlZXRNdXNpYy5Ob3RlV2lkdGgvMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgKyAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQtMyk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIEJydXNoIGJydXNoID0gQnJ1c2hlcy5CbGFjaztcbiAgICAgICAgICAgICAgICBpZiAocGVuLkNvbG9yICE9IENvbG9yLkJsYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGJydXNoID0gbmV3IFNvbGlkQnJ1c2gocGVuLkNvbG9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZy5GaWxsRWxsaXBzZShicnVzaCwgLVNoZWV0TXVzaWMuTm90ZVdpZHRoLzIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLVNoZWV0TXVzaWMuTm90ZUhlaWdodC8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQtMSk7XG4gICAgICAgICAgICAgICAgaWYgKHBlbi5Db2xvciAhPSBDb2xvci5CbGFjaykge1xuICAgICAgICAgICAgICAgICAgICBicnVzaC5EaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwZW4uQ29sb3IgPSBDb2xvci5CbGFjaztcbiAgICAgICAgICAgIGcuRHJhd0VsbGlwc2UocGVuLCAtU2hlZXRNdXNpYy5Ob3RlV2lkdGgvMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC1TaGVldE11c2ljLk5vdGVIZWlnaHQvMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZVdpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LTEpO1xuXG4gICAgICAgICAgICBnLlJvdGF0ZVRyYW5zZm9ybSg0NSk7XG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSggLSAoeG5vdGUgKyBTaGVldE11c2ljLk5vdGVXaWR0aC8yICsgMSksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gKHlub3RlIC0gU2hlZXRNdXNpYy5MaW5lV2lkdGggKyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQvMikpO1xuXG4gICAgICAgICAgICAvKiBEcmF3IGEgZG90IGlmIHRoaXMgaXMgYSBkb3R0ZWQgZHVyYXRpb24uICovXG4gICAgICAgICAgICBpZiAobm90ZS5kdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkSGFsZiB8fFxuICAgICAgICAgICAgICAgIG5vdGUuZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZFF1YXJ0ZXIgfHxcbiAgICAgICAgICAgICAgICBub3RlLmR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGgpIHtcblxuICAgICAgICAgICAgICAgIGcuRmlsbEVsbGlwc2UoQnJ1c2hlcy5CbGFjaywgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4bm90ZSArIFNoZWV0TXVzaWMuTm90ZVdpZHRoICsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxpbmVTcGFjZS8zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeW5vdGUgKyBTaGVldE11c2ljLkxpbmVTcGFjZS8zLCA0LCA0KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBEcmF3IGhvcml6b250YWwgbGluZXMgaWYgbm90ZSBpcyBhYm92ZS9iZWxvdyB0aGUgc3RhZmYgKi9cbiAgICAgICAgICAgIFdoaXRlTm90ZSB0b3AgPSB0b3BzdGFmZi5BZGQoMSk7XG4gICAgICAgICAgICBpbnQgZGlzdCA9IG5vdGUud2hpdGVub3RlLkRpc3QodG9wKTtcbiAgICAgICAgICAgIGludCB5ID0geXRvcCAtIFNoZWV0TXVzaWMuTGluZVdpZHRoO1xuXG4gICAgICAgICAgICBpZiAoZGlzdCA+PSAyKSB7XG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDI7IGkgPD0gZGlzdDsgaSArPSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIHkgLT0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeG5vdGUgLSBTaGVldE11c2ljLkxpbmVTcGFjZS80LCB5LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhub3RlICsgU2hlZXRNdXNpYy5Ob3RlV2lkdGggKyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQsIHkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgV2hpdGVOb3RlIGJvdHRvbSA9IHRvcC5BZGQoLTgpO1xuICAgICAgICAgICAgeSA9IHl0b3AgKyAoU2hlZXRNdXNpYy5MaW5lU3BhY2UgKyBTaGVldE11c2ljLkxpbmVXaWR0aCkgKiA0IC0gMTtcbiAgICAgICAgICAgIGRpc3QgPSBib3R0b20uRGlzdChub3RlLndoaXRlbm90ZSk7XG4gICAgICAgICAgICBpZiAoZGlzdCA+PSAyKSB7XG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDI7IGkgPD0gZGlzdDsgaSs9IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgeSArPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4bm90ZSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQsIHksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeG5vdGUgKyBTaGVldE11c2ljLk5vdGVXaWR0aCArIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCwgeSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyogRW5kIGRyYXdpbmcgaG9yaXpvbnRhbCBsaW5lcyAqL1xuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgbm90ZSBsZXR0ZXJzIChBLCBBIywgQmIsIGV0YykgbmV4dCB0byB0aGUgbm90ZSBjaXJjbGVzLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEBwYXJhbSB0b3BzdGFmZiBUaGUgd2hpdGUgbm90ZSBvZiB0aGUgdG9wIG9mIHRoZSBzdGFmZi5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3Tm90ZUxldHRlcnMoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3AsIFdoaXRlTm90ZSB0b3BzdGFmZikge1xuICAgICAgICBib29sIG92ZXJsYXAgPSBOb3Rlc092ZXJsYXAobm90ZWRhdGEsIDAsIG5vdGVkYXRhLkxlbmd0aCk7XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG5cbiAgICAgICAgZm9yZWFjaCAoTm90ZURhdGEgbm90ZSBpbiBub3RlZGF0YSkge1xuICAgICAgICAgICAgaWYgKCFub3RlLmxlZnRzaWRlKSB7XG4gICAgICAgICAgICAgICAgLyogVGhlcmUncyBub3QgZW5vdWdodCBwaXhlbCByb29tIHRvIHNob3cgdGhlIGxldHRlciAqL1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBHZXQgdGhlIHgseSBwb3NpdGlvbiB0byBkcmF3IHRoZSBub3RlICovXG4gICAgICAgICAgICBpbnQgeW5vdGUgPSB5dG9wICsgdG9wc3RhZmYuRGlzdChub3RlLndoaXRlbm90ZSkgKiBcbiAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG4gICAgICAgICAgICAvKiBEcmF3IHRoZSBsZXR0ZXIgdG8gdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIG5vdGUgKi9cbiAgICAgICAgICAgIGludCB4bm90ZSA9IFNoZWV0TXVzaWMuTm90ZVdpZHRoICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvNDtcblxuICAgICAgICAgICAgaWYgKG5vdGUuZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEhhbGYgfHxcbiAgICAgICAgICAgICAgICBub3RlLmR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRRdWFydGVyIHx8XG4gICAgICAgICAgICAgICAgbm90ZS5kdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoIHx8IG92ZXJsYXApIHtcblxuICAgICAgICAgICAgICAgIHhub3RlICs9IFNoZWV0TXVzaWMuTm90ZVdpZHRoLzI7XG4gICAgICAgICAgICB9IFxuICAgICAgICAgICAgZy5EcmF3U3RyaW5nKE5vdGVOYW1lKG5vdGUubnVtYmVyLCBub3RlLndoaXRlbm90ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5MZXR0ZXJGb250LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICBCcnVzaGVzLkJsYWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHhub3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHlub3RlIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKiogUmV0dXJuIHRydWUgaWYgdGhlIGNob3JkcyBjYW4gYmUgY29ubmVjdGVkLCB3aGVyZSB0aGVpciBzdGVtcyBhcmVcbiAgICAgKiBqb2luZWQgYnkgYSBob3Jpem9udGFsIGJlYW0uIEluIG9yZGVyIHRvIGNyZWF0ZSB0aGUgYmVhbTpcbiAgICAgKlxuICAgICAqIC0gVGhlIGNob3JkcyBtdXN0IGJlIGluIHRoZSBzYW1lIG1lYXN1cmUuXG4gICAgICogLSBUaGUgY2hvcmQgc3RlbXMgc2hvdWxkIG5vdCBiZSBhIGRvdHRlZCBkdXJhdGlvbi5cbiAgICAgKiAtIFRoZSBjaG9yZCBzdGVtcyBtdXN0IGJlIHRoZSBzYW1lIGR1cmF0aW9uLCB3aXRoIG9uZSBleGNlcHRpb25cbiAgICAgKiAgIChEb3R0ZWQgRWlnaHRoIHRvIFNpeHRlZW50aCkuXG4gICAgICogLSBUaGUgc3RlbXMgbXVzdCBhbGwgcG9pbnQgaW4gdGhlIHNhbWUgZGlyZWN0aW9uICh1cCBvciBkb3duKS5cbiAgICAgKiAtIFRoZSBjaG9yZCBjYW5ub3QgYWxyZWFkeSBiZSBwYXJ0IG9mIGEgYmVhbS5cbiAgICAgKlxuICAgICAqIC0gNi1jaG9yZCBiZWFtcyBtdXN0IGJlIDh0aCBub3RlcyBpbiAzLzQsIDYvOCwgb3IgNi80IHRpbWVcbiAgICAgKiAtIDMtY2hvcmQgYmVhbXMgbXVzdCBiZSBlaXRoZXIgdHJpcGxldHMsIG9yIDh0aCBub3RlcyAoMTIvOCB0aW1lIHNpZ25hdHVyZSlcbiAgICAgKiAtIDQtY2hvcmQgYmVhbXMgYXJlIG9rIGZvciAyLzIsIDIvNCBvciA0LzQgdGltZSwgYW55IGR1cmF0aW9uXG4gICAgICogLSA0LWNob3JkIGJlYW1zIGFyZSBvayBmb3Igb3RoZXIgdGltZXMgaWYgdGhlIGR1cmF0aW9uIGlzIDE2dGhcbiAgICAgKiAtIDItY2hvcmQgYmVhbXMgYXJlIG9rIGZvciBhbnkgZHVyYXRpb25cbiAgICAgKlxuICAgICAqIElmIHN0YXJ0UXVhcnRlciBpcyB0cnVlLCB0aGUgZmlyc3Qgbm90ZSBzaG91bGQgc3RhcnQgb24gYSBxdWFydGVyIG5vdGVcbiAgICAgKiAob25seSBhcHBsaWVzIHRvIDItY2hvcmQgYmVhbXMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgXG4gICAgYm9vbCBDYW5DcmVhdGVCZWFtKENob3JkU3ltYm9sW10gY2hvcmRzLCBUaW1lU2lnbmF0dXJlIHRpbWUsIGJvb2wgc3RhcnRRdWFydGVyKSB7XG4gICAgICAgIGludCBudW1DaG9yZHMgPSBjaG9yZHMuTGVuZ3RoO1xuICAgICAgICBTdGVtIGZpcnN0U3RlbSA9IGNob3Jkc1swXS5TdGVtO1xuICAgICAgICBTdGVtIGxhc3RTdGVtID0gY2hvcmRzW2Nob3Jkcy5MZW5ndGgtMV0uU3RlbTtcbiAgICAgICAgaWYgKGZpcnN0U3RlbSA9PSBudWxsIHx8IGxhc3RTdGVtID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpbnQgbWVhc3VyZSA9IGNob3Jkc1swXS5TdGFydFRpbWUgLyB0aW1lLk1lYXN1cmU7XG4gICAgICAgIE5vdGVEdXJhdGlvbiBkdXIgPSBmaXJzdFN0ZW0uRHVyYXRpb247XG4gICAgICAgIE5vdGVEdXJhdGlvbiBkdXIyID0gbGFzdFN0ZW0uRHVyYXRpb247XG5cbiAgICAgICAgYm9vbCBkb3R0ZWQ4X3RvXzE2ID0gZmFsc2U7XG4gICAgICAgIGlmIChjaG9yZHMuTGVuZ3RoID09IDIgJiYgZHVyID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGggJiZcbiAgICAgICAgICAgIGR1cjIgPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCkge1xuICAgICAgICAgICAgZG90dGVkOF90b18xNiA9IHRydWU7XG4gICAgICAgIH0gXG5cbiAgICAgICAgaWYgKGR1ciA9PSBOb3RlRHVyYXRpb24uV2hvbGUgfHwgZHVyID09IE5vdGVEdXJhdGlvbi5IYWxmIHx8XG4gICAgICAgICAgICBkdXIgPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEhhbGYgfHwgZHVyID09IE5vdGVEdXJhdGlvbi5RdWFydGVyIHx8XG4gICAgICAgICAgICBkdXIgPT0gTm90ZUR1cmF0aW9uLkRvdHRlZFF1YXJ0ZXIgfHxcbiAgICAgICAgICAgIChkdXIgPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCAmJiAhZG90dGVkOF90b18xNikpIHtcblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG51bUNob3JkcyA9PSA2KSB7XG4gICAgICAgICAgICBpZiAoZHVyICE9IE5vdGVEdXJhdGlvbi5FaWdodGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBib29sIGNvcnJlY3RUaW1lID0gXG4gICAgICAgICAgICAgICAoKHRpbWUuTnVtZXJhdG9yID09IDMgJiYgdGltZS5EZW5vbWluYXRvciA9PSA0KSB8fFxuICAgICAgICAgICAgICAgICh0aW1lLk51bWVyYXRvciA9PSA2ICYmIHRpbWUuRGVub21pbmF0b3IgPT0gOCkgfHxcbiAgICAgICAgICAgICAgICAodGltZS5OdW1lcmF0b3IgPT0gNiAmJiB0aW1lLkRlbm9taW5hdG9yID09IDQpICk7XG5cbiAgICAgICAgICAgIGlmICghY29ycmVjdFRpbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aW1lLk51bWVyYXRvciA9PSA2ICYmIHRpbWUuRGVub21pbmF0b3IgPT0gNCkge1xuICAgICAgICAgICAgICAgIC8qIGZpcnN0IGNob3JkIG11c3Qgc3RhcnQgYXQgMXN0IG9yIDR0aCBxdWFydGVyIG5vdGUgKi9cbiAgICAgICAgICAgICAgICBpbnQgYmVhdCA9IHRpbWUuUXVhcnRlciAqIDM7XG4gICAgICAgICAgICAgICAgaWYgKChjaG9yZHNbMF0uU3RhcnRUaW1lICUgYmVhdCkgPiB0aW1lLlF1YXJ0ZXIvNikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChudW1DaG9yZHMgPT0gNCkge1xuICAgICAgICAgICAgaWYgKHRpbWUuTnVtZXJhdG9yID09IDMgJiYgdGltZS5EZW5vbWluYXRvciA9PSA4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYm9vbCBjb3JyZWN0VGltZSA9IFxuICAgICAgICAgICAgICAodGltZS5OdW1lcmF0b3IgPT0gMiB8fCB0aW1lLk51bWVyYXRvciA9PSA0IHx8IHRpbWUuTnVtZXJhdG9yID09IDgpO1xuICAgICAgICAgICAgaWYgKCFjb3JyZWN0VGltZSAmJiBkdXIgIT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogY2hvcmQgbXVzdCBzdGFydCBvbiBxdWFydGVyIG5vdGUgKi9cbiAgICAgICAgICAgIGludCBiZWF0ID0gdGltZS5RdWFydGVyO1xuICAgICAgICAgICAgaWYgKGR1ciA9PSBOb3RlRHVyYXRpb24uRWlnaHRoKSB7XG4gICAgICAgICAgICAgICAgLyogOHRoIG5vdGUgY2hvcmQgbXVzdCBzdGFydCBvbiAxc3Qgb3IgM3JkIHF1YXJ0ZXIgbm90ZSAqL1xuICAgICAgICAgICAgICAgIGJlYXQgPSB0aW1lLlF1YXJ0ZXIgKiAyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZHVyID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcbiAgICAgICAgICAgICAgICAvKiAzMm5kIG5vdGUgbXVzdCBzdGFydCBvbiBhbiA4dGggYmVhdCAqL1xuICAgICAgICAgICAgICAgIGJlYXQgPSB0aW1lLlF1YXJ0ZXIgLyAyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoKGNob3Jkc1swXS5TdGFydFRpbWUgJSBiZWF0KSA+IHRpbWUuUXVhcnRlci82KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG51bUNob3JkcyA9PSAzKSB7XG4gICAgICAgICAgICBib29sIHZhbGlkID0gKGR1ciA9PSBOb3RlRHVyYXRpb24uVHJpcGxldCkgfHwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgIChkdXIgPT0gTm90ZUR1cmF0aW9uLkVpZ2h0aCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5OdW1lcmF0b3IgPT0gMTIgJiYgdGltZS5EZW5vbWluYXRvciA9PSA4KTtcbiAgICAgICAgICAgIGlmICghdmFsaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIGNob3JkIG11c3Qgc3RhcnQgb24gcXVhcnRlciBub3RlICovXG4gICAgICAgICAgICBpbnQgYmVhdCA9IHRpbWUuUXVhcnRlcjtcbiAgICAgICAgICAgIGlmICh0aW1lLk51bWVyYXRvciA9PSAxMiAmJiB0aW1lLkRlbm9taW5hdG9yID09IDgpIHtcbiAgICAgICAgICAgICAgICAvKiBJbiAxMi84IHRpbWUsIGNob3JkIG11c3Qgc3RhcnQgb24gMyo4dGggYmVhdCAqL1xuICAgICAgICAgICAgICAgIGJlYXQgPSB0aW1lLlF1YXJ0ZXIvMiAqIDM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoKGNob3Jkc1swXS5TdGFydFRpbWUgJSBiZWF0KSA+IHRpbWUuUXVhcnRlci82KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZWxzZSBpZiAobnVtQ2hvcmRzID09IDIpIHtcbiAgICAgICAgICAgIGlmIChzdGFydFF1YXJ0ZXIpIHtcbiAgICAgICAgICAgICAgICBpbnQgYmVhdCA9IHRpbWUuUXVhcnRlcjtcbiAgICAgICAgICAgICAgICBpZiAoKGNob3Jkc1swXS5TdGFydFRpbWUgJSBiZWF0KSA+IHRpbWUuUXVhcnRlci82KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3JlYWNoIChDaG9yZFN5bWJvbCBjaG9yZCBpbiBjaG9yZHMpIHtcbiAgICAgICAgICAgIGlmICgoY2hvcmQuU3RhcnRUaW1lIC8gdGltZS5NZWFzdXJlKSAhPSBtZWFzdXJlKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmIChjaG9yZC5TdGVtID09IG51bGwpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgaWYgKGNob3JkLlN0ZW0uRHVyYXRpb24gIT0gZHVyICYmICFkb3R0ZWQ4X3RvXzE2KVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmIChjaG9yZC5TdGVtLmlzQmVhbSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBDaGVjayB0aGF0IGFsbCBzdGVtcyBjYW4gcG9pbnQgaW4gc2FtZSBkaXJlY3Rpb24gKi9cbiAgICAgICAgYm9vbCBoYXNUd29TdGVtcyA9IGZhbHNlO1xuICAgICAgICBpbnQgZGlyZWN0aW9uID0gU3RlbS5VcDsgXG4gICAgICAgIGZvcmVhY2ggKENob3JkU3ltYm9sIGNob3JkIGluIGNob3Jkcykge1xuICAgICAgICAgICAgaWYgKGNob3JkLkhhc1R3b1N0ZW1zKSB7XG4gICAgICAgICAgICAgICAgaWYgKGhhc1R3b1N0ZW1zICYmIGNob3JkLlN0ZW0uRGlyZWN0aW9uICE9IGRpcmVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGhhc1R3b1N0ZW1zID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSBjaG9yZC5TdGVtLkRpcmVjdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIEdldCB0aGUgZmluYWwgc3RlbSBkaXJlY3Rpb24gKi9cbiAgICAgICAgaWYgKCFoYXNUd29TdGVtcykge1xuICAgICAgICAgICAgV2hpdGVOb3RlIG5vdGUxO1xuICAgICAgICAgICAgV2hpdGVOb3RlIG5vdGUyO1xuICAgICAgICAgICAgbm90ZTEgPSAoZmlyc3RTdGVtLkRpcmVjdGlvbiA9PSBTdGVtLlVwID8gZmlyc3RTdGVtLlRvcCA6IGZpcnN0U3RlbS5Cb3R0b20pO1xuICAgICAgICAgICAgbm90ZTIgPSAobGFzdFN0ZW0uRGlyZWN0aW9uID09IFN0ZW0uVXAgPyBsYXN0U3RlbS5Ub3AgOiBsYXN0U3RlbS5Cb3R0b20pO1xuICAgICAgICAgICAgZGlyZWN0aW9uID0gU3RlbURpcmVjdGlvbihub3RlMSwgbm90ZTIsIGNob3Jkc1swXS5DbGVmKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIElmIHRoZSBub3RlcyBhcmUgdG9vIGZhciBhcGFydCwgZG9uJ3QgdXNlIGEgYmVhbSAqL1xuICAgICAgICBpZiAoZGlyZWN0aW9uID09IFN0ZW0uVXApIHtcbiAgICAgICAgICAgIGlmIChNYXRoLkFicyhmaXJzdFN0ZW0uVG9wLkRpc3QobGFzdFN0ZW0uVG9wKSkgPj0gMTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoTWF0aC5BYnMoZmlyc3RTdGVtLkJvdHRvbS5EaXN0KGxhc3RTdGVtLkJvdHRvbSkpID49IDExKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuXG4gICAgLyoqIENvbm5lY3QgdGhlIGNob3JkcyB1c2luZyBhIGhvcml6b250YWwgYmVhbS4gXG4gICAgICpcbiAgICAgKiBzcGFjaW5nIGlzIHRoZSBob3Jpem9udGFsIGRpc3RhbmNlIChpbiBwaXhlbHMpIGJldHdlZW4gdGhlIHJpZ2h0IHNpZGUgXG4gICAgICogb2YgdGhlIGZpcnN0IGNob3JkLCBhbmQgdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIGxhc3QgY2hvcmQuXG4gICAgICpcbiAgICAgKiBUbyBtYWtlIHRoZSBiZWFtOlxuICAgICAqIC0gQ2hhbmdlIHRoZSBzdGVtIGRpcmVjdGlvbnMgZm9yIGVhY2ggY2hvcmQsIHNvIHRoZXkgbWF0Y2guXG4gICAgICogLSBJbiB0aGUgZmlyc3QgY2hvcmQsIHBhc3MgdGhlIHN0ZW0gbG9jYXRpb24gb2YgdGhlIGxhc3QgY2hvcmQsIGFuZFxuICAgICAqICAgdGhlIGhvcml6b250YWwgc3BhY2luZyB0byB0aGF0IGxhc3Qgc3RlbS5cbiAgICAgKiAtIE1hcmsgYWxsIGNob3JkcyAoZXhjZXB0IHRoZSBmaXJzdCkgYXMgXCJyZWNlaXZlclwiIHBhaXJzLCBzbyB0aGF0IFxuICAgICAqICAgdGhleSBkb24ndCBkcmF3IGEgY3Vydnkgc3RlbS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIFxuICAgIHZvaWQgQ3JlYXRlQmVhbShDaG9yZFN5bWJvbFtdIGNob3JkcywgaW50IHNwYWNpbmcpIHtcbiAgICAgICAgU3RlbSBmaXJzdFN0ZW0gPSBjaG9yZHNbMF0uU3RlbTtcbiAgICAgICAgU3RlbSBsYXN0U3RlbSA9IGNob3Jkc1tjaG9yZHMuTGVuZ3RoLTFdLlN0ZW07XG5cbiAgICAgICAgLyogQ2FsY3VsYXRlIHRoZSBuZXcgc3RlbSBkaXJlY3Rpb24gKi9cbiAgICAgICAgaW50IG5ld2RpcmVjdGlvbiA9IC0xO1xuICAgICAgICBmb3JlYWNoIChDaG9yZFN5bWJvbCBjaG9yZCBpbiBjaG9yZHMpIHtcbiAgICAgICAgICAgIGlmIChjaG9yZC5IYXNUd29TdGVtcykge1xuICAgICAgICAgICAgICAgIG5ld2RpcmVjdGlvbiA9IGNob3JkLlN0ZW0uRGlyZWN0aW9uO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5ld2RpcmVjdGlvbiA9PSAtMSkge1xuICAgICAgICAgICAgV2hpdGVOb3RlIG5vdGUxO1xuICAgICAgICAgICAgV2hpdGVOb3RlIG5vdGUyO1xuICAgICAgICAgICAgbm90ZTEgPSAoZmlyc3RTdGVtLkRpcmVjdGlvbiA9PSBTdGVtLlVwID8gZmlyc3RTdGVtLlRvcCA6IGZpcnN0U3RlbS5Cb3R0b20pO1xuICAgICAgICAgICAgbm90ZTIgPSAobGFzdFN0ZW0uRGlyZWN0aW9uID09IFN0ZW0uVXAgPyBsYXN0U3RlbS5Ub3AgOiBsYXN0U3RlbS5Cb3R0b20pO1xuICAgICAgICAgICAgbmV3ZGlyZWN0aW9uID0gU3RlbURpcmVjdGlvbihub3RlMSwgbm90ZTIsIGNob3Jkc1swXS5DbGVmKTtcbiAgICAgICAgfVxuICAgICAgICBmb3JlYWNoIChDaG9yZFN5bWJvbCBjaG9yZCBpbiBjaG9yZHMpIHtcbiAgICAgICAgICAgIGNob3JkLlN0ZW0uRGlyZWN0aW9uID0gbmV3ZGlyZWN0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNob3Jkcy5MZW5ndGggPT0gMikge1xuICAgICAgICAgICAgQnJpbmdTdGVtc0Nsb3NlcihjaG9yZHMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgTGluZVVwU3RlbUVuZHMoY2hvcmRzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZpcnN0U3RlbS5TZXRQYWlyKGxhc3RTdGVtLCBzcGFjaW5nKTtcbiAgICAgICAgZm9yIChpbnQgaSA9IDE7IGkgPCBjaG9yZHMuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNob3Jkc1tpXS5TdGVtLlJlY2VpdmVyID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBXZSdyZSBjb25uZWN0aW5nIHRoZSBzdGVtcyBvZiB0d28gY2hvcmRzIHVzaW5nIGEgaG9yaXpvbnRhbCBiZWFtLlxuICAgICAqICBBZGp1c3QgdGhlIHZlcnRpY2FsIGVuZHBvaW50IG9mIHRoZSBzdGVtcywgc28gdGhhdCB0aGV5J3JlIGNsb3NlclxuICAgICAqICB0b2dldGhlci4gIEZvciBhIGRvdHRlZCA4dGggdG8gMTZ0aCBiZWFtLCBpbmNyZWFzZSB0aGUgc3RlbSBvZiB0aGVcbiAgICAgKiAgZG90dGVkIGVpZ2h0aCwgc28gdGhhdCBpdCdzIGFzIGxvbmcgYXMgYSAxNnRoIHN0ZW0uXG4gICAgICovXG4gICAgc3RhdGljIHZvaWRcbiAgICBCcmluZ1N0ZW1zQ2xvc2VyKENob3JkU3ltYm9sW10gY2hvcmRzKSB7XG4gICAgICAgIFN0ZW0gZmlyc3RTdGVtID0gY2hvcmRzWzBdLlN0ZW07XG4gICAgICAgIFN0ZW0gbGFzdFN0ZW0gPSBjaG9yZHNbMV0uU3RlbTtcblxuICAgICAgICAvKiBJZiB3ZSdyZSBjb25uZWN0aW5nIGEgZG90dGVkIDh0aCB0byBhIDE2dGgsIGluY3JlYXNlXG4gICAgICAgICAqIHRoZSBzdGVtIGVuZCBvZiB0aGUgZG90dGVkIGVpZ2h0aC5cbiAgICAgICAgICovXG4gICAgICAgIGlmIChmaXJzdFN0ZW0uRHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCAmJlxuICAgICAgICAgICAgbGFzdFN0ZW0uRHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCkge1xuICAgICAgICAgICAgaWYgKGZpcnN0U3RlbS5EaXJlY3Rpb24gPT0gU3RlbS5VcCkge1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSBmaXJzdFN0ZW0uRW5kLkFkZCgyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSBmaXJzdFN0ZW0uRW5kLkFkZCgtMik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBCcmluZyB0aGUgc3RlbSBlbmRzIGNsb3NlciB0b2dldGhlciAqL1xuICAgICAgICBpbnQgZGlzdGFuY2UgPSBNYXRoLkFicyhmaXJzdFN0ZW0uRW5kLkRpc3QobGFzdFN0ZW0uRW5kKSk7XG4gICAgICAgIGlmIChmaXJzdFN0ZW0uRGlyZWN0aW9uID09IFN0ZW0uVXApIHtcbiAgICAgICAgICAgIGlmIChXaGl0ZU5vdGUuTWF4KGZpcnN0U3RlbS5FbmQsIGxhc3RTdGVtLkVuZCkgPT0gZmlyc3RTdGVtLkVuZClcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSBsYXN0U3RlbS5FbmQuQWRkKGRpc3RhbmNlLzIpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSBmaXJzdFN0ZW0uRW5kLkFkZChkaXN0YW5jZS8yKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChXaGl0ZU5vdGUuTWluKGZpcnN0U3RlbS5FbmQsIGxhc3RTdGVtLkVuZCkgPT0gZmlyc3RTdGVtLkVuZClcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSBsYXN0U3RlbS5FbmQuQWRkKC1kaXN0YW5jZS8yKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmaXJzdFN0ZW0uRW5kID0gZmlyc3RTdGVtLkVuZC5BZGQoLWRpc3RhbmNlLzIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFdlJ3JlIGNvbm5lY3RpbmcgdGhlIHN0ZW1zIG9mIHRocmVlIG9yIG1vcmUgY2hvcmRzIHVzaW5nIGEgaG9yaXpvbnRhbCBiZWFtLlxuICAgICAqICBBZGp1c3QgdGhlIHZlcnRpY2FsIGVuZHBvaW50IG9mIHRoZSBzdGVtcywgc28gdGhhdCB0aGUgbWlkZGxlIGNob3JkIHN0ZW1zXG4gICAgICogIGFyZSB2ZXJ0aWNhbGx5IGluIGJldHdlZW4gdGhlIGZpcnN0IGFuZCBsYXN0IHN0ZW0uXG4gICAgICovXG4gICAgc3RhdGljIHZvaWRcbiAgICBMaW5lVXBTdGVtRW5kcyhDaG9yZFN5bWJvbFtdIGNob3Jkcykge1xuICAgICAgICBTdGVtIGZpcnN0U3RlbSA9IGNob3Jkc1swXS5TdGVtO1xuICAgICAgICBTdGVtIGxhc3RTdGVtID0gY2hvcmRzW2Nob3Jkcy5MZW5ndGgtMV0uU3RlbTtcbiAgICAgICAgU3RlbSBtaWRkbGVTdGVtID0gY2hvcmRzWzFdLlN0ZW07XG5cbiAgICAgICAgaWYgKGZpcnN0U3RlbS5EaXJlY3Rpb24gPT0gU3RlbS5VcCkge1xuICAgICAgICAgICAgLyogRmluZCB0aGUgaGlnaGVzdCBzdGVtLiBUaGUgYmVhbSB3aWxsIGVpdGhlcjpcbiAgICAgICAgICAgICAqIC0gU2xhbnQgZG93bndhcmRzIChmaXJzdCBzdGVtIGlzIGhpZ2hlc3QpXG4gICAgICAgICAgICAgKiAtIFNsYW50IHVwd2FyZHMgKGxhc3Qgc3RlbSBpcyBoaWdoZXN0KVxuICAgICAgICAgICAgICogLSBCZSBzdHJhaWdodCAobWlkZGxlIHN0ZW0gaXMgaGlnaGVzdClcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgV2hpdGVOb3RlIHRvcCA9IGZpcnN0U3RlbS5FbmQ7XG4gICAgICAgICAgICBmb3JlYWNoIChDaG9yZFN5bWJvbCBjaG9yZCBpbiBjaG9yZHMpIHtcbiAgICAgICAgICAgICAgICB0b3AgPSBXaGl0ZU5vdGUuTWF4KHRvcCwgY2hvcmQuU3RlbS5FbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRvcCA9PSBmaXJzdFN0ZW0uRW5kICYmIHRvcC5EaXN0KGxhc3RTdGVtLkVuZCkgPj0gMikge1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSB0b3A7XG4gICAgICAgICAgICAgICAgbWlkZGxlU3RlbS5FbmQgPSB0b3AuQWRkKC0xKTtcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSB0b3AuQWRkKC0yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRvcCA9PSBsYXN0U3RlbS5FbmQgJiYgdG9wLkRpc3QoZmlyc3RTdGVtLkVuZCkgPj0gMikge1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSB0b3AuQWRkKC0yKTtcbiAgICAgICAgICAgICAgICBtaWRkbGVTdGVtLkVuZCA9IHRvcC5BZGQoLTEpO1xuICAgICAgICAgICAgICAgIGxhc3RTdGVtLkVuZCA9IHRvcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSB0b3A7XG4gICAgICAgICAgICAgICAgbWlkZGxlU3RlbS5FbmQgPSB0b3A7XG4gICAgICAgICAgICAgICAgbGFzdFN0ZW0uRW5kID0gdG9wO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLyogRmluZCB0aGUgYm90dG9tbW9zdCBzdGVtLiBUaGUgYmVhbSB3aWxsIGVpdGhlcjpcbiAgICAgICAgICAgICAqIC0gU2xhbnQgdXB3YXJkcyAoZmlyc3Qgc3RlbSBpcyBsb3dlc3QpXG4gICAgICAgICAgICAgKiAtIFNsYW50IGRvd253YXJkcyAobGFzdCBzdGVtIGlzIGxvd2VzdClcbiAgICAgICAgICAgICAqIC0gQmUgc3RyYWlnaHQgKG1pZGRsZSBzdGVtIGlzIGhpZ2hlc3QpXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFdoaXRlTm90ZSBib3R0b20gPSBmaXJzdFN0ZW0uRW5kO1xuICAgICAgICAgICAgZm9yZWFjaCAoQ2hvcmRTeW1ib2wgY2hvcmQgaW4gY2hvcmRzKSB7XG4gICAgICAgICAgICAgICAgYm90dG9tID0gV2hpdGVOb3RlLk1pbihib3R0b20sIGNob3JkLlN0ZW0uRW5kKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGJvdHRvbSA9PSBmaXJzdFN0ZW0uRW5kICYmIGxhc3RTdGVtLkVuZC5EaXN0KGJvdHRvbSkgPj0gMikge1xuICAgICAgICAgICAgICAgIG1pZGRsZVN0ZW0uRW5kID0gYm90dG9tLkFkZCgxKTtcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSBib3R0b20uQWRkKDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoYm90dG9tID09IGxhc3RTdGVtLkVuZCAmJiBmaXJzdFN0ZW0uRW5kLkRpc3QoYm90dG9tKSA+PSAyKSB7XG4gICAgICAgICAgICAgICAgbWlkZGxlU3RlbS5FbmQgPSBib3R0b20uQWRkKDEpO1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSBib3R0b20uQWRkKDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZmlyc3RTdGVtLkVuZCA9IGJvdHRvbTtcbiAgICAgICAgICAgICAgICBtaWRkbGVTdGVtLkVuZCA9IGJvdHRvbTtcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSBib3R0b207XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBBbGwgbWlkZGxlIHN0ZW1zIGhhdmUgdGhlIHNhbWUgZW5kICovXG4gICAgICAgIGZvciAoaW50IGkgPSAxOyBpIDwgY2hvcmRzLkxlbmd0aC0xOyBpKyspIHtcbiAgICAgICAgICAgIFN0ZW0gc3RlbSA9IGNob3Jkc1tpXS5TdGVtO1xuICAgICAgICAgICAgc3RlbS5FbmQgPSBtaWRkbGVTdGVtLkVuZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHN0cmluZyByZXN1bHQgPSBzdHJpbmcuRm9ybWF0KFwiQ2hvcmRTeW1ib2wgY2xlZj17MH0gc3RhcnQ9ezF9IGVuZD17Mn0gd2lkdGg9ezN9IGhhc3R3b3N0ZW1zPXs0fSBcIiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWYsIFN0YXJ0VGltZSwgRW5kVGltZSwgV2lkdGgsIGhhc3R3b3N0ZW1zKTtcbiAgICAgICAgZm9yZWFjaCAoQWNjaWRTeW1ib2wgc3ltYm9sIGluIGFjY2lkc3ltYm9scykge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHN5bWJvbC5Ub1N0cmluZygpICsgXCIgXCI7XG4gICAgICAgIH1cbiAgICAgICAgZm9yZWFjaCAoTm90ZURhdGEgbm90ZSBpbiBub3RlZGF0YSkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHN0cmluZy5Gb3JtYXQoXCJOb3RlIHdoaXRlbm90ZT17MH0gZHVyYXRpb249ezF9IGxlZnRzaWRlPXsyfSBcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGUud2hpdGVub3RlLCBub3RlLmR1cmF0aW9uLCBub3RlLmxlZnRzaWRlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RlbTEgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHN0ZW0xLlRvU3RyaW5nKCkgKyBcIiBcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RlbTIgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHN0ZW0yLlRvU3RyaW5nKCkgKyBcIiBcIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0OyBcbiAgICB9XG5cbn1cblxuXG59XG5cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogVGhlIHBvc3NpYmxlIGNsZWZzLCBUcmVibGUgb3IgQmFzcyAqL1xucHVibGljIGVudW0gQ2xlZiB7IFRyZWJsZSwgQmFzcyB9O1xuXG4vKiogQGNsYXNzIENsZWZTeW1ib2wgXG4gKiBBIENsZWZTeW1ib2wgcmVwcmVzZW50cyBlaXRoZXIgYSBUcmVibGUgb3IgQmFzcyBDbGVmIGltYWdlLlxuICogVGhlIGNsZWYgY2FuIGJlIGVpdGhlciBub3JtYWwgb3Igc21hbGwgc2l6ZS4gIE5vcm1hbCBzaXplIGlzXG4gKiB1c2VkIGF0IHRoZSBiZWdpbm5pbmcgb2YgYSBuZXcgc3RhZmYsIG9uIHRoZSBsZWZ0IHNpZGUuICBUaGVcbiAqIHNtYWxsIHN5bWJvbHMgYXJlIHVzZWQgdG8gc2hvdyBjbGVmIGNoYW5nZXMgd2l0aGluIGEgc3RhZmYuXG4gKi9cblxucHVibGljIGNsYXNzIENsZWZTeW1ib2wgOiBNdXNpY1N5bWJvbCB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgSW1hZ2UgdHJlYmxlOyAgLyoqIFRoZSB0cmVibGUgY2xlZiBpbWFnZSAqL1xuICAgIHByaXZhdGUgc3RhdGljIEltYWdlIGJhc3M7ICAgIC8qKiBUaGUgYmFzcyBjbGVmIGltYWdlICovXG5cbiAgICBwcml2YXRlIGludCBzdGFydHRpbWU7ICAgICAgICAvKiogU3RhcnQgdGltZSBvZiB0aGUgc3ltYm9sICovXG4gICAgcHJpdmF0ZSBib29sIHNtYWxsc2l6ZTsgICAgICAgLyoqIFRydWUgaWYgdGhpcyBpcyBhIHNtYWxsIGNsZWYsIGZhbHNlIG90aGVyd2lzZSAqL1xuICAgIHByaXZhdGUgQ2xlZiBjbGVmOyAgICAgICAgICAgIC8qKiBUaGUgY2xlZiwgVHJlYmxlIG9yIEJhc3MgKi9cbiAgICBwcml2YXRlIGludCB3aWR0aDtcblxuICAgIC8qKiBDcmVhdGUgYSBuZXcgQ2xlZlN5bWJvbCwgd2l0aCB0aGUgZ2l2ZW4gY2xlZiwgc3RhcnR0aW1lLCBhbmQgc2l6ZSAqL1xuICAgIHB1YmxpYyBDbGVmU3ltYm9sKENsZWYgY2xlZiwgaW50IHN0YXJ0dGltZSwgYm9vbCBzbWFsbCkge1xuICAgICAgICB0aGlzLmNsZWYgPSBjbGVmO1xuICAgICAgICB0aGlzLnN0YXJ0dGltZSA9IHN0YXJ0dGltZTtcbiAgICAgICAgc21hbGxzaXplID0gc21hbGw7XG4gICAgICAgIExvYWRJbWFnZXMoKTtcbiAgICAgICAgd2lkdGggPSBNaW5XaWR0aDtcbiAgICB9XG5cbiAgICAvKiogTG9hZCB0aGUgVHJlYmxlL0Jhc3MgY2xlZiBpbWFnZXMgaW50byBtZW1vcnkuICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBMb2FkSW1hZ2VzKCkge1xuICAgICAgICBpZiAodHJlYmxlID09IG51bGwpXG4gICAgICAgICAgICB0cmVibGUgPSBuZXcgQml0bWFwKHR5cGVvZihDbGVmU3ltYm9sKSwgXCJSZXNvdXJjZXMuSW1hZ2VzLnRyZWJsZS5wbmdcIik7XG5cbiAgICAgICAgaWYgKGJhc3MgPT0gbnVsbClcbiAgICAgICAgICAgIGJhc3MgPSBuZXcgQml0bWFwKHR5cGVvZihDbGVmU3ltYm9sKSwgXCJSZXNvdXJjZXMuSW1hZ2VzLmJhc3MucG5nXCIpO1xuXG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgdGltZSAoaW4gcHVsc2VzKSB0aGlzIHN5bWJvbCBvY2N1cnMgYXQuXG4gICAgICogVGhpcyBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgbWVhc3VyZSB0aGlzIHN5bWJvbCBiZWxvbmdzIHRvLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgU3RhcnRUaW1lIHsgXG4gICAgICAgIGdldCB7IHJldHVybiBzdGFydHRpbWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBtaW5pbXVtIHdpZHRoIChpbiBwaXhlbHMpIG5lZWRlZCB0byBkcmF3IHRoaXMgc3ltYm9sICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBNaW5XaWR0aCB7XG4gICAgICAgIGdldCB7IFxuICAgICAgICAgICAgaWYgKHNtYWxsc2l6ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gU2hlZXRNdXNpYy5Ob3RlV2lkdGggKiAyO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiBTaGVldE11c2ljLk5vdGVXaWR0aCAqIDM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogR2V0L1NldCB0aGUgd2lkdGggKGluIHBpeGVscykgb2YgdGhpcyBzeW1ib2wuIFRoZSB3aWR0aCBpcyBzZXRcbiAgICAgKiBpbiBTaGVldE11c2ljLkFsaWduU3ltYm9scygpIHRvIHZlcnRpY2FsbHkgYWxpZ24gc3ltYm9scy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFdpZHRoIHtcbiAgICAgICBnZXQgeyByZXR1cm4gd2lkdGg7IH1cbiAgICAgICBzZXQgeyB3aWR0aCA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGFib3ZlIHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEFib3ZlU3RhZmYgeyBcbiAgICAgICAgZ2V0IHsgXG4gICAgICAgICAgICBpZiAoY2xlZiA9PSBDbGVmLlRyZWJsZSAmJiAhc21hbGxzaXplKVxuICAgICAgICAgICAgICAgIHJldHVybiBTaGVldE11c2ljLk5vdGVIZWlnaHQgKiAyO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGJlbG93IHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEJlbG93U3RhZmYge1xuICAgICAgICBnZXQge1xuICAgICAgICAgICAgaWYgKGNsZWYgPT0gQ2xlZi5UcmVibGUgJiYgIXNtYWxsc2l6ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMjtcbiAgICAgICAgICAgIGVsc2UgaWYgKGNsZWYgPT0gQ2xlZi5UcmVibGUgJiYgc21hbGxzaXplKVxuICAgICAgICAgICAgICAgIHJldHVybiBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgc3ltYm9sLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBcbiAgICB2b2lkIERyYXcoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3ApIHtcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oV2lkdGggLSBNaW5XaWR0aCwgMCk7XG4gICAgICAgIGludCB5ID0geXRvcDtcbiAgICAgICAgSW1hZ2UgaW1hZ2U7XG4gICAgICAgIGludCBoZWlnaHQ7XG5cbiAgICAgICAgLyogR2V0IHRoZSBpbWFnZSwgaGVpZ2h0LCBhbmQgdG9wIHkgcGl4ZWwsIGRlcGVuZGluZyBvbiB0aGUgY2xlZlxuICAgICAgICAgKiBhbmQgdGhlIGltYWdlIHNpemUuXG4gICAgICAgICAqL1xuICAgICAgICBpZiAoY2xlZiA9PSBDbGVmLlRyZWJsZSkge1xuICAgICAgICAgICAgaW1hZ2UgPSB0cmVibGU7XG4gICAgICAgICAgICBpZiAoc21hbGxzaXplKSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gU2hlZXRNdXNpYy5TdGFmZkhlaWdodCArIFNoZWV0TXVzaWMuU3RhZmZIZWlnaHQvNDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gMyAqIFNoZWV0TXVzaWMuU3RhZmZIZWlnaHQvMiArIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICAgICAgICAgIHkgPSB5dG9wIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaW1hZ2UgPSBiYXNzO1xuICAgICAgICAgICAgaWYgKHNtYWxsc2l6ZSkge1xuICAgICAgICAgICAgICAgIGhlaWdodCA9IFNoZWV0TXVzaWMuU3RhZmZIZWlnaHQgLSAzKlNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBTaGVldE11c2ljLlN0YWZmSGVpZ2h0IC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyogU2NhbGUgdGhlIGltYWdlIHdpZHRoIHRvIG1hdGNoIHRoZSBoZWlnaHQgKi9cbiAgICAgICAgaW50IGltZ3dpZHRoID0gaW1hZ2UuV2lkdGggKiBoZWlnaHQgLyBpbWFnZS5IZWlnaHQ7XG4gICAgICAgIGcuRHJhd0ltYWdlKGltYWdlLCAwLCB5LCBpbWd3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShXaWR0aCAtIE1pbldpZHRoKSwgMCk7XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJDbGVmU3ltYm9sIGNsZWY9ezB9IHNtYWxsPXsxfSB3aWR0aD17Mn1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlZiwgc21hbGxzaXplLCB3aWR0aCk7XG4gICAgfVxufVxuXG5cbn1cblxuIiwidXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXG57XG4gICAgcHVibGljIGNsYXNzIEZpbGVTdHJlYW06U3RyZWFtXG4gICAge1xuICAgICAgICBwdWJsaWMgRmlsZVN0cmVhbShzdHJpbmcgZmlsZW5hbWUsIEZpbGVNb2RlIG1vZGUpXG4gICAgICAgIHtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDktMjAxMiBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuXG4vKiogQGNsYXNzIFBpYW5vXG4gKlxuICogVGhlIFBpYW5vIENvbnRyb2wgaXMgdGhlIHBhbmVsIGF0IHRoZSB0b3AgdGhhdCBkaXNwbGF5cyB0aGVcbiAqIHBpYW5vLCBhbmQgaGlnaGxpZ2h0cyB0aGUgcGlhbm8gbm90ZXMgZHVyaW5nIHBsYXliYWNrLlxuICogVGhlIG1haW4gbWV0aG9kcyBhcmU6XG4gKlxuICogU2V0TWlkaUZpbGUoKSAtIFNldCB0aGUgTWlkaSBmaWxlIHRvIHVzZSBmb3Igc2hhZGluZy4gIFRoZSBNaWRpIGZpbGVcbiAqICAgICAgICAgICAgICAgICBpcyBuZWVkZWQgdG8gZGV0ZXJtaW5lIHdoaWNoIG5vdGVzIHRvIHNoYWRlLlxuICpcbiAqIFNoYWRlTm90ZXMoKSAtIFNoYWRlIG5vdGVzIG9uIHRoZSBwaWFubyB0aGF0IG9jY3VyIGF0IGEgZ2l2ZW4gcHVsc2UgdGltZS5cbiAqXG4gKi9cbnB1YmxpYyBjbGFzcyBQaWFubyA6IENvbnRyb2wge1xuICAgIHB1YmxpYyBjb25zdCBpbnQgS2V5c1Blck9jdGF2ZSA9IDc7XG4gICAgcHVibGljIGNvbnN0IGludCBNYXhPY3RhdmUgPSA3O1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50IFdoaXRlS2V5V2lkdGg7ICAvKiogV2lkdGggb2YgYSBzaW5nbGUgd2hpdGUga2V5ICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50IFdoaXRlS2V5SGVpZ2h0OyAvKiogSGVpZ2h0IG9mIGEgc2luZ2xlIHdoaXRlIGtleSAqL1xuICAgIHByaXZhdGUgc3RhdGljIGludCBCbGFja0tleVdpZHRoOyAgLyoqIFdpZHRoIG9mIGEgc2luZ2xlIGJsYWNrIGtleSAqL1xuICAgIHByaXZhdGUgc3RhdGljIGludCBCbGFja0tleUhlaWdodDsgLyoqIEhlaWdodCBvZiBhIHNpbmdsZSBibGFjayBrZXkgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBpbnQgbWFyZ2luOyAgICAgICAgIC8qKiBUaGUgdG9wL2xlZnQgbWFyZ2luIHRvIHRoZSBwaWFubyAqL1xuICAgIHByaXZhdGUgc3RhdGljIGludCBCbGFja0JvcmRlcjsgICAgLyoqIFRoZSB3aWR0aCBvZiB0aGUgYmxhY2sgYm9yZGVyIGFyb3VuZCB0aGUga2V5cyAqL1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50W10gYmxhY2tLZXlPZmZzZXRzOyAgIC8qKiBUaGUgeCBwaXhsZXMgb2YgdGhlIGJsYWNrIGtleXMgKi9cblxuICAgIC8qIFRoZSBncmF5MVBlbnMgZm9yIGRyYXdpbmcgYmxhY2svZ3JheSBsaW5lcyAqL1xuICAgIHByaXZhdGUgUGVuIGdyYXkxUGVuLCBncmF5MlBlbiwgZ3JheTNQZW47XG5cbiAgICAvKiBUaGUgYnJ1c2hlcyBmb3IgZmlsbGluZyB0aGUga2V5cyAqL1xuICAgIHByaXZhdGUgQnJ1c2ggZ3JheTFCcnVzaCwgZ3JheTJCcnVzaCwgc2hhZGVCcnVzaCwgc2hhZGUyQnJ1c2g7XG5cbiAgICBwcml2YXRlIGJvb2wgdXNlVHdvQ29sb3JzOyAgICAgICAgICAgICAgLyoqIElmIHRydWUsIHVzZSB0d28gY29sb3JzIGZvciBoaWdobGlnaHRpbmcgKi9cbiAgICBwcml2YXRlIExpc3Q8TWlkaU5vdGU+IG5vdGVzOyAgICAgICAgICAgLyoqIFRoZSBNaWRpIG5vdGVzIGZvciBzaGFkaW5nICovXG4gICAgcHJpdmF0ZSBpbnQgbWF4U2hhZGVEdXJhdGlvbjsgICAgICAgICAgIC8qKiBUaGUgbWF4aW11bSBkdXJhdGlvbiB3ZSdsbCBzaGFkZSBhIG5vdGUgZm9yICovXG4gICAgcHJpdmF0ZSBpbnQgc2hvd05vdGVMZXR0ZXJzOyAgICAgICAgICAgIC8qKiBEaXNwbGF5IHRoZSBsZXR0ZXIgZm9yIGVhY2ggcGlhbm8gbm90ZSAqL1xuICAgIHByaXZhdGUgR3JhcGhpY3MgZ3JhcGhpY3M7ICAgICAgICAgICAgICAvKiogVGhlIGdyYXBoaWNzIGZvciBzaGFkaW5nIHRoZSBub3RlcyAqL1xuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBQaWFuby4gKi9cbiAgICBwdWJsaWMgUGlhbm8oKSB7XG4gICAgICAgIGludCBzY3JlZW53aWR0aCA9IDEwMjQ7IC8vU3lzdGVtLldpbmRvd3MuRm9ybXMuU2NyZWVuLlByaW1hcnlTY3JlZW4uQm91bmRzLldpZHRoO1xuICAgICAgICBpZiAoc2NyZWVud2lkdGggPj0gMzIwMCkge1xuICAgICAgICAgICAgLyogTGludXgvTW9ubyBpcyByZXBvcnRpbmcgd2lkdGggb2YgNCBzY3JlZW5zICovXG4gICAgICAgICAgICBzY3JlZW53aWR0aCA9IHNjcmVlbndpZHRoIC8gNDtcbiAgICAgICAgfVxuICAgICAgICBzY3JlZW53aWR0aCA9IHNjcmVlbndpZHRoICogOTUvMTAwO1xuICAgICAgICBXaGl0ZUtleVdpZHRoID0gKGludCkoc2NyZWVud2lkdGggLyAoMi4wICsgS2V5c1Blck9jdGF2ZSAqIE1heE9jdGF2ZSkpO1xuICAgICAgICBpZiAoV2hpdGVLZXlXaWR0aCAlIDIgIT0gMCkge1xuICAgICAgICAgICAgV2hpdGVLZXlXaWR0aC0tO1xuICAgICAgICB9XG4gICAgICAgIG1hcmdpbiA9IDA7XG4gICAgICAgIEJsYWNrQm9yZGVyID0gV2hpdGVLZXlXaWR0aC8yO1xuICAgICAgICBXaGl0ZUtleUhlaWdodCA9IFdoaXRlS2V5V2lkdGggKiA1O1xuICAgICAgICBCbGFja0tleVdpZHRoID0gV2hpdGVLZXlXaWR0aCAvIDI7XG4gICAgICAgIEJsYWNrS2V5SGVpZ2h0ID0gV2hpdGVLZXlIZWlnaHQgKiA1IC8gOTsgXG5cbiAgICAgICAgV2lkdGggPSBtYXJnaW4qMiArIEJsYWNrQm9yZGVyKjIgKyBXaGl0ZUtleVdpZHRoICogS2V5c1Blck9jdGF2ZSAqIE1heE9jdGF2ZTtcbiAgICAgICAgSGVpZ2h0ID0gbWFyZ2luKjIgKyBCbGFja0JvcmRlciozICsgV2hpdGVLZXlIZWlnaHQ7XG4gICAgICAgIGlmIChibGFja0tleU9mZnNldHMgPT0gbnVsbCkge1xuICAgICAgICAgICAgYmxhY2tLZXlPZmZzZXRzID0gbmV3IGludFtdIHsgXG4gICAgICAgICAgICAgICAgV2hpdGVLZXlXaWR0aCAtIEJsYWNrS2V5V2lkdGgvMiAtIDEsXG4gICAgICAgICAgICAgICAgV2hpdGVLZXlXaWR0aCArIEJsYWNrS2V5V2lkdGgvMiAtIDEsXG4gICAgICAgICAgICAgICAgMipXaGl0ZUtleVdpZHRoIC0gQmxhY2tLZXlXaWR0aC8yLFxuICAgICAgICAgICAgICAgIDIqV2hpdGVLZXlXaWR0aCArIEJsYWNrS2V5V2lkdGgvMixcbiAgICAgICAgICAgICAgICA0KldoaXRlS2V5V2lkdGggLSBCbGFja0tleVdpZHRoLzIgLSAxLFxuICAgICAgICAgICAgICAgIDQqV2hpdGVLZXlXaWR0aCArIEJsYWNrS2V5V2lkdGgvMiAtIDEsXG4gICAgICAgICAgICAgICAgNSpXaGl0ZUtleVdpZHRoIC0gQmxhY2tLZXlXaWR0aC8yLFxuICAgICAgICAgICAgICAgIDUqV2hpdGVLZXlXaWR0aCArIEJsYWNrS2V5V2lkdGgvMixcbiAgICAgICAgICAgICAgICA2KldoaXRlS2V5V2lkdGggLSBCbGFja0tleVdpZHRoLzIsXG4gICAgICAgICAgICAgICAgNipXaGl0ZUtleVdpZHRoICsgQmxhY2tLZXlXaWR0aC8yXG4gICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgQ29sb3IgZ3JheTEgPSBDb2xvci5Gcm9tUmdiKDE2LCAxNiwgMTYpO1xuICAgICAgICBDb2xvciBncmF5MiA9IENvbG9yLkZyb21SZ2IoOTAsIDkwLCA5MCk7XG4gICAgICAgIENvbG9yIGdyYXkzID0gQ29sb3IuRnJvbVJnYigyMDAsIDIwMCwgMjAwKTtcbiAgICAgICAgQ29sb3Igc2hhZGUxID0gQ29sb3IuRnJvbVJnYigyMTAsIDIwNSwgMjIwKTtcbiAgICAgICAgQ29sb3Igc2hhZGUyID0gQ29sb3IuRnJvbVJnYigxNTAsIDIwMCwgMjIwKTtcblxuICAgICAgICBncmF5MVBlbiA9IG5ldyBQZW4oZ3JheTEsIDEpO1xuICAgICAgICBncmF5MlBlbiA9IG5ldyBQZW4oZ3JheTIsIDEpO1xuICAgICAgICBncmF5M1BlbiA9IG5ldyBQZW4oZ3JheTMsIDEpO1xuXG4gICAgICAgIGdyYXkxQnJ1c2ggPSBuZXcgU29saWRCcnVzaChncmF5MSk7XG4gICAgICAgIGdyYXkyQnJ1c2ggPSBuZXcgU29saWRCcnVzaChncmF5Mik7XG4gICAgICAgIHNoYWRlQnJ1c2ggPSBuZXcgU29saWRCcnVzaChzaGFkZTEpO1xuICAgICAgICBzaGFkZTJCcnVzaCA9IG5ldyBTb2xpZEJydXNoKHNoYWRlMik7XG4gICAgICAgIHNob3dOb3RlTGV0dGVycyA9IE1pZGlPcHRpb25zLk5vdGVOYW1lTm9uZTtcbiAgICAgICAgQmFja0NvbG9yID0gQ29sb3IuTGlnaHRHcmF5O1xuICAgIH1cblxuICAgIC8qKiBTZXQgdGhlIE1pZGlGaWxlIHRvIHVzZS5cbiAgICAgKiAgU2F2ZSB0aGUgbGlzdCBvZiBtaWRpIG5vdGVzLiBFYWNoIG1pZGkgbm90ZSBpbmNsdWRlcyB0aGUgbm90ZSBOdW1iZXIgXG4gICAgICogIGFuZCBTdGFydFRpbWUgKGluIHB1bHNlcyksIHNvIHdlIGtub3cgd2hpY2ggbm90ZXMgdG8gc2hhZGUgZ2l2ZW4gdGhlXG4gICAgICogIGN1cnJlbnQgcHVsc2UgdGltZS5cbiAgICAgKi8gXG4gICAgcHVibGljIHZvaWQgU2V0TWlkaUZpbGUoTWlkaUZpbGUgbWlkaWZpbGUsIE1pZGlPcHRpb25zIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKG1pZGlmaWxlID09IG51bGwpIHtcbiAgICAgICAgICAgIG5vdGVzID0gbnVsbDtcbiAgICAgICAgICAgIHVzZVR3b0NvbG9ycyA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgTGlzdDxNaWRpVHJhY2s+IHRyYWNrcyA9IG1pZGlmaWxlLkNoYW5nZU1pZGlOb3RlcyhvcHRpb25zKTtcbiAgICAgICAgTWlkaVRyYWNrIHRyYWNrID0gTWlkaUZpbGUuQ29tYmluZVRvU2luZ2xlVHJhY2sodHJhY2tzKTtcbiAgICAgICAgbm90ZXMgPSB0cmFjay5Ob3RlcztcblxuICAgICAgICBtYXhTaGFkZUR1cmF0aW9uID0gbWlkaWZpbGUuVGltZS5RdWFydGVyICogMjtcblxuICAgICAgICAvKiBXZSB3YW50IHRvIGtub3cgd2hpY2ggdHJhY2sgdGhlIG5vdGUgY2FtZSBmcm9tLlxuICAgICAgICAgKiBVc2UgdGhlICdjaGFubmVsJyBmaWVsZCB0byBzdG9yZSB0aGUgdHJhY2suXG4gICAgICAgICAqL1xuICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgdHJhY2tzLkNvdW50OyB0cmFja251bSsrKSB7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrc1t0cmFja251bV0uTm90ZXMpIHtcbiAgICAgICAgICAgICAgICBub3RlLkNoYW5uZWwgPSB0cmFja251bTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFdoZW4gd2UgaGF2ZSBleGFjdGx5IHR3byB0cmFja3MsIHdlIGFzc3VtZSB0aGlzIGlzIGEgcGlhbm8gc29uZyxcbiAgICAgICAgICogYW5kIHdlIHVzZSBkaWZmZXJlbnQgY29sb3JzIGZvciBoaWdobGlnaHRpbmcgdGhlIGxlZnQgaGFuZCBhbmRcbiAgICAgICAgICogcmlnaHQgaGFuZCBub3Rlcy5cbiAgICAgICAgICovXG4gICAgICAgIHVzZVR3b0NvbG9ycyA9IGZhbHNlO1xuICAgICAgICBpZiAodHJhY2tzLkNvdW50ID09IDIpIHtcbiAgICAgICAgICAgIHVzZVR3b0NvbG9ycyA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBzaG93Tm90ZUxldHRlcnMgPSBvcHRpb25zLnNob3dOb3RlTGV0dGVycztcbiAgICAgICAgdGhpcy5JbnZhbGlkYXRlKCk7XG4gICAgfVxuXG4gICAgLyoqIFNldCB0aGUgY29sb3JzIHRvIHVzZSBmb3Igc2hhZGluZyAqL1xuICAgIHB1YmxpYyB2b2lkIFNldFNoYWRlQ29sb3JzKENvbG9yIGMxLCBDb2xvciBjMikge1xuICAgICAgICBzaGFkZUJydXNoLkRpc3Bvc2UoKTtcbiAgICAgICAgc2hhZGUyQnJ1c2guRGlzcG9zZSgpO1xuICAgICAgICBzaGFkZUJydXNoID0gbmV3IFNvbGlkQnJ1c2goYzEpO1xuICAgICAgICBzaGFkZTJCcnVzaCA9IG5ldyBTb2xpZEJydXNoKGMyKTtcbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgb3V0bGluZSBvZiBhIDEyLW5vdGUgKDcgd2hpdGUgbm90ZSkgcGlhbm8gb2N0YXZlICovXG4gICAgcHJpdmF0ZSB2b2lkIERyYXdPY3RhdmVPdXRsaW5lKEdyYXBoaWNzIGcpIHtcbiAgICAgICAgaW50IHJpZ2h0ID0gV2hpdGVLZXlXaWR0aCAqIEtleXNQZXJPY3RhdmU7XG5cbiAgICAgICAgLy8gRHJhdyB0aGUgYm91bmRpbmcgcmVjdGFuZ2xlLCBmcm9tIEMgdG8gQlxuICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCAwLCAwLCAwLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTFQZW4sIHJpZ2h0LCAwLCByaWdodCwgV2hpdGVLZXlIZWlnaHQpO1xuICAgICAgICAvLyBnLkRyYXdMaW5lKGdyYXkxUGVuLCAwLCAwLCByaWdodCwgMCk7XG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTFQZW4sIDAsIFdoaXRlS2V5SGVpZ2h0LCByaWdodCwgV2hpdGVLZXlIZWlnaHQpO1xuICAgICAgICBnLkRyYXdMaW5lKGdyYXkzUGVuLCByaWdodC0xLCAwLCByaWdodC0xLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIDEsIDAsIDEsIFdoaXRlS2V5SGVpZ2h0KTtcblxuICAgICAgICAvLyBEcmF3IHRoZSBsaW5lIGJldHdlZW4gRSBhbmQgRlxuICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCAzKldoaXRlS2V5V2lkdGgsIDAsIDMqV2hpdGVLZXlXaWR0aCwgV2hpdGVLZXlIZWlnaHQpO1xuICAgICAgICBnLkRyYXdMaW5lKGdyYXkzUGVuLCAzKldoaXRlS2V5V2lkdGggLSAxLCAwLCAzKldoaXRlS2V5V2lkdGggLSAxLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIDMqV2hpdGVLZXlXaWR0aCArIDEsIDAsIDMqV2hpdGVLZXlXaWR0aCArIDEsIFdoaXRlS2V5SGVpZ2h0KTtcblxuICAgICAgICAvLyBEcmF3IHRoZSBzaWRlcy9ib3R0b20gb2YgdGhlIGJsYWNrIGtleXNcbiAgICAgICAgZm9yIChpbnQgaSA9MDsgaSA8IDEwOyBpICs9IDIpIHtcbiAgICAgICAgICAgIGludCB4MSA9IGJsYWNrS2V5T2Zmc2V0c1tpXTtcbiAgICAgICAgICAgIGludCB4MiA9IGJsYWNrS2V5T2Zmc2V0c1tpKzFdO1xuXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCB4MSwgMCwgeDEsIEJsYWNrS2V5SGVpZ2h0KTsgXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCB4MiwgMCwgeDIsIEJsYWNrS2V5SGVpZ2h0KTsgXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCB4MSwgQmxhY2tLZXlIZWlnaHQsIHgyLCBCbGFja0tleUhlaWdodCk7XG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkyUGVuLCB4MS0xLCAwLCB4MS0xLCBCbGFja0tleUhlaWdodCsxKTsgXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkyUGVuLCB4MisxLCAwLCB4MisxLCBCbGFja0tleUhlaWdodCsxKTsgXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkyUGVuLCB4MS0xLCBCbGFja0tleUhlaWdodCsxLCB4MisxLCBCbGFja0tleUhlaWdodCsxKTtcbiAgICAgICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIHgxLTIsIDAsIHgxLTIsIEJsYWNrS2V5SGVpZ2h0KzIpOyBcbiAgICAgICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIHgyKzIsIDAsIHgyKzIsIEJsYWNrS2V5SGVpZ2h0KzIpOyBcbiAgICAgICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIHgxLTIsIEJsYWNrS2V5SGVpZ2h0KzIsIHgyKzIsIEJsYWNrS2V5SGVpZ2h0KzIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRHJhdyB0aGUgYm90dG9tLWhhbGYgb2YgdGhlIHdoaXRlIGtleXNcbiAgICAgICAgZm9yIChpbnQgaSA9IDE7IGkgPCBLZXlzUGVyT2N0YXZlOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpID09IDMpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTsgIC8vIHdlIGRyYXcgdGhlIGxpbmUgYmV0d2VlbiBFIGFuZCBGIGFib3ZlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCBpKldoaXRlS2V5V2lkdGgsIEJsYWNrS2V5SGVpZ2h0LCBpKldoaXRlS2V5V2lkdGgsIFdoaXRlS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgIFBlbiBwZW4xID0gZ3JheTJQZW47XG4gICAgICAgICAgICBQZW4gcGVuMiA9IGdyYXkzUGVuO1xuICAgICAgICAgICAgZy5EcmF3TGluZShwZW4xLCBpKldoaXRlS2V5V2lkdGggLSAxLCBCbGFja0tleUhlaWdodCsxLCBpKldoaXRlS2V5V2lkdGggLSAxLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgICAgICBnLkRyYXdMaW5lKHBlbjIsIGkqV2hpdGVLZXlXaWR0aCArIDEsIEJsYWNrS2V5SGVpZ2h0KzEsIGkqV2hpdGVLZXlXaWR0aCArIDEsIFdoaXRlS2V5SGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqIERyYXcgYW4gb3V0bGluZSBvZiB0aGUgcGlhbm8gZm9yIDcgb2N0YXZlcyAqL1xuICAgIHByaXZhdGUgdm9pZCBEcmF3T3V0bGluZShHcmFwaGljcyBnKSB7XG4gICAgICAgIGZvciAoaW50IG9jdGF2ZSA9IDA7IG9jdGF2ZSA8IE1heE9jdGF2ZTsgb2N0YXZlKyspIHtcbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKG9jdGF2ZSAqIFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlLCAwKTtcbiAgICAgICAgICAgIERyYXdPY3RhdmVPdXRsaW5lKGcpO1xuICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShvY3RhdmUgKiBXaGl0ZUtleVdpZHRoICogS2V5c1Blck9jdGF2ZSksIDApO1xuICAgICAgICB9XG4gICAgfVxuIFxuICAgIC8qIERyYXcgdGhlIEJsYWNrIGtleXMgKi9cbiAgICBwcml2YXRlIHZvaWQgRHJhd0JsYWNrS2V5cyhHcmFwaGljcyBnKSB7XG4gICAgICAgIGZvciAoaW50IG9jdGF2ZSA9IDA7IG9jdGF2ZSA8IE1heE9jdGF2ZTsgb2N0YXZlKyspIHtcbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKG9jdGF2ZSAqIFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlLCAwKTtcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgMTA7IGkgKz0gMikge1xuICAgICAgICAgICAgICAgIGludCB4MSA9IGJsYWNrS2V5T2Zmc2V0c1tpXTtcbiAgICAgICAgICAgICAgICBpbnQgeDIgPSBibGFja0tleU9mZnNldHNbaSsxXTtcbiAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTFCcnVzaCwgeDEsIDAsIEJsYWNrS2V5V2lkdGgsIEJsYWNrS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTJCcnVzaCwgeDErMSwgQmxhY2tLZXlIZWlnaHQgLSBCbGFja0tleUhlaWdodC84LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmxhY2tLZXlXaWR0aC0yLCBCbGFja0tleUhlaWdodC84KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0ob2N0YXZlICogV2hpdGVLZXlXaWR0aCAqIEtleXNQZXJPY3RhdmUpLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qIERyYXcgdGhlIGJsYWNrIGJvcmRlciBhcmVhIHN1cnJvdW5kaW5nIHRoZSBwaWFubyBrZXlzLlxuICAgICAqIEFsc28sIGRyYXcgZ3JheSBvdXRsaW5lcyBhdCB0aGUgYm90dG9tIG9mIHRoZSB3aGl0ZSBrZXlzLlxuICAgICAqL1xuICAgIHByaXZhdGUgdm9pZCBEcmF3QmxhY2tCb3JkZXIoR3JhcGhpY3MgZykge1xuICAgICAgICBpbnQgUGlhbm9XaWR0aCA9IFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlICogTWF4T2N0YXZlO1xuICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTFCcnVzaCwgbWFyZ2luLCBtYXJnaW4sIFBpYW5vV2lkdGggKyBCbGFja0JvcmRlcioyLCBCbGFja0JvcmRlci0yKTtcbiAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkxQnJ1c2gsIG1hcmdpbiwgbWFyZ2luLCBCbGFja0JvcmRlciwgV2hpdGVLZXlIZWlnaHQgKyBCbGFja0JvcmRlciAqIDMpO1xuICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTFCcnVzaCwgbWFyZ2luLCBtYXJnaW4gKyBCbGFja0JvcmRlciArIFdoaXRlS2V5SGVpZ2h0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrQm9yZGVyKjIgKyBQaWFub1dpZHRoLCBCbGFja0JvcmRlcioyKTtcbiAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkxQnJ1c2gsIG1hcmdpbiArIEJsYWNrQm9yZGVyICsgUGlhbm9XaWR0aCwgbWFyZ2luLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrQm9yZGVyLCBXaGl0ZUtleUhlaWdodCArIEJsYWNrQm9yZGVyKjMpO1xuXG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTJQZW4sIG1hcmdpbiArIEJsYWNrQm9yZGVyLCBtYXJnaW4gKyBCbGFja0JvcmRlciAtMSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbiArIEJsYWNrQm9yZGVyICsgUGlhbm9XaWR0aCwgbWFyZ2luICsgQmxhY2tCb3JkZXIgLTEpO1xuICAgICAgICBcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0obWFyZ2luICsgQmxhY2tCb3JkZXIsIG1hcmdpbiArIEJsYWNrQm9yZGVyKTsgXG5cbiAgICAgICAgLy8gRHJhdyB0aGUgZ3JheSBib3R0b21zIG9mIHRoZSB3aGl0ZSBrZXlzICBcbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBLZXlzUGVyT2N0YXZlICogTWF4T2N0YXZlOyBpKyspIHtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShncmF5MkJydXNoLCBpKldoaXRlS2V5V2lkdGgrMSwgV2hpdGVLZXlIZWlnaHQrMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgV2hpdGVLZXlXaWR0aC0yLCBCbGFja0JvcmRlci8yKTtcbiAgICAgICAgfVxuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKG1hcmdpbiArIEJsYWNrQm9yZGVyKSwgLShtYXJnaW4gKyBCbGFja0JvcmRlcikpOyBcbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgbm90ZSBsZXR0ZXJzIHVuZGVybmVhdGggZWFjaCB3aGl0ZSBub3RlICovXG4gICAgcHJpdmF0ZSB2b2lkIERyYXdOb3RlTGV0dGVycyhHcmFwaGljcyBnKSB7XG4gICAgICAgIHN0cmluZ1tdIGxldHRlcnMgPSB7IFwiQ1wiLCBcIkRcIiwgXCJFXCIsIFwiRlwiLCBcIkdcIiwgXCJBXCIsIFwiQlwiIH07XG4gICAgICAgIHN0cmluZ1tdIG51bWJlcnMgPSB7IFwiMVwiLCBcIjNcIiwgXCI1XCIsIFwiNlwiLCBcIjhcIiwgXCIxMFwiLCBcIjEyXCIgfTtcbiAgICAgICAgc3RyaW5nW10gbmFtZXM7XG4gICAgICAgIGlmIChzaG93Tm90ZUxldHRlcnMgPT0gTWlkaU9wdGlvbnMuTm90ZU5hbWVMZXR0ZXIpIHtcbiAgICAgICAgICAgIG5hbWVzID0gbGV0dGVycztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzaG93Tm90ZUxldHRlcnMgPT0gTWlkaU9wdGlvbnMuTm90ZU5hbWVGaXhlZE51bWJlcikge1xuICAgICAgICAgICAgbmFtZXMgPSBudW1iZXJzO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKG1hcmdpbiArIEJsYWNrQm9yZGVyLCBtYXJnaW4gKyBCbGFja0JvcmRlcik7IFxuICAgICAgICBmb3IgKGludCBvY3RhdmUgPSAwOyBvY3RhdmUgPCBNYXhPY3RhdmU7IG9jdGF2ZSsrKSB7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IEtleXNQZXJPY3RhdmU7IGkrKykge1xuICAgICAgICAgICAgICAgIGcuRHJhd1N0cmluZyhuYW1lc1tpXSwgU2hlZXRNdXNpYy5MZXR0ZXJGb250LCBCcnVzaGVzLldoaXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAob2N0YXZlKktleXNQZXJPY3RhdmUgKyBpKSAqIFdoaXRlS2V5V2lkdGggKyBXaGl0ZUtleVdpZHRoLzMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFdoaXRlS2V5SGVpZ2h0ICsgQmxhY2tCb3JkZXIgKiAzLzQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0obWFyZ2luICsgQmxhY2tCb3JkZXIpLCAtKG1hcmdpbiArIEJsYWNrQm9yZGVyKSk7IFxuICAgIH1cblxuICAgIC8qKiBEcmF3IHRoZSBQaWFuby4gKi9cbiAgICBwcm90ZWN0ZWQgLypvdmVycmlkZSovIHZvaWQgT25QYWludChQYWludEV2ZW50QXJncyBlKSB7XG4gICAgICAgIEdyYXBoaWNzIGcgPSBlLkdyYXBoaWNzKCk7XG4gICAgICAgIGcuU21vb3RoaW5nTW9kZSA9IFNtb290aGluZ01vZGUuTm9uZTtcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0obWFyZ2luICsgQmxhY2tCb3JkZXIsIG1hcmdpbiArIEJsYWNrQm9yZGVyKTsgXG4gICAgICAgIGcuRmlsbFJlY3RhbmdsZShCcnVzaGVzLldoaXRlLCAwLCAwLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlICogTWF4T2N0YXZlLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgIERyYXdCbGFja0tleXMoZyk7XG4gICAgICAgIERyYXdPdXRsaW5lKGcpO1xuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKG1hcmdpbiArIEJsYWNrQm9yZGVyKSwgLShtYXJnaW4gKyBCbGFja0JvcmRlcikpO1xuICAgICAgICBEcmF3QmxhY2tCb3JkZXIoZyk7XG4gICAgICAgIGlmIChzaG93Tm90ZUxldHRlcnMgIT0gTWlkaU9wdGlvbnMuTm90ZU5hbWVOb25lKSB7XG4gICAgICAgICAgICBEcmF3Tm90ZUxldHRlcnMoZyk7XG4gICAgICAgIH1cbiAgICAgICAgZy5TbW9vdGhpbmdNb2RlID0gU21vb3RoaW5nTW9kZS5BbnRpQWxpYXM7XG4gICAgfVxuXG4gICAgLyogU2hhZGUgdGhlIGdpdmVuIG5vdGUgd2l0aCB0aGUgZ2l2ZW4gYnJ1c2guXG4gICAgICogV2Ugb25seSBkcmF3IG5vdGVzIGZyb20gbm90ZW51bWJlciAyNCB0byA5Ni5cbiAgICAgKiAoTWlkZGxlLUMgaXMgNjApLlxuICAgICAqL1xuICAgIHByaXZhdGUgdm9pZCBTaGFkZU9uZU5vdGUoR3JhcGhpY3MgZywgaW50IG5vdGVudW1iZXIsIEJydXNoIGJydXNoKSB7XG4gICAgICAgIGludCBvY3RhdmUgPSBub3RlbnVtYmVyIC8gMTI7XG4gICAgICAgIGludCBub3Rlc2NhbGUgPSBub3RlbnVtYmVyICUgMTI7XG5cbiAgICAgICAgb2N0YXZlIC09IDI7XG4gICAgICAgIGlmIChvY3RhdmUgPCAwIHx8IG9jdGF2ZSA+PSBNYXhPY3RhdmUpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0ob2N0YXZlICogV2hpdGVLZXlXaWR0aCAqIEtleXNQZXJPY3RhdmUsIDApO1xuICAgICAgICBpbnQgeDEsIHgyLCB4MztcblxuICAgICAgICBpbnQgYm90dG9tSGFsZkhlaWdodCA9IFdoaXRlS2V5SGVpZ2h0IC0gKEJsYWNrS2V5SGVpZ2h0KzMpO1xuXG4gICAgICAgIC8qIG5vdGVzY2FsZSBnb2VzIGZyb20gMCB0byAxMSwgZnJvbSBDIHRvIEIuICovXG4gICAgICAgIHN3aXRjaCAobm90ZXNjYWxlKSB7XG4gICAgICAgIGNhc2UgMDogLyogQyAqL1xuICAgICAgICAgICAgeDEgPSAyO1xuICAgICAgICAgICAgeDIgPSBibGFja0tleU9mZnNldHNbMF0gLSAyO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgMCwgeDIgLSB4MSwgQmxhY2tLZXlIZWlnaHQrMyk7XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgxLCBCbGFja0tleUhlaWdodCszLCBXaGl0ZUtleVdpZHRoLTMsIGJvdHRvbUhhbGZIZWlnaHQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTogLyogQyMgKi9cbiAgICAgICAgICAgIHgxID0gYmxhY2tLZXlPZmZzZXRzWzBdOyBcbiAgICAgICAgICAgIHgyID0gYmxhY2tLZXlPZmZzZXRzWzFdO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgMCwgeDIgLSB4MSwgQmxhY2tLZXlIZWlnaHQpO1xuICAgICAgICAgICAgaWYgKGJydXNoID09IGdyYXkxQnJ1c2gpIHtcbiAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTJCcnVzaCwgeDErMSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrS2V5SGVpZ2h0IC0gQmxhY2tLZXlIZWlnaHQvOCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrS2V5V2lkdGgtMiwgQmxhY2tLZXlIZWlnaHQvOCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOiAvKiBEICovXG4gICAgICAgICAgICB4MSA9IFdoaXRlS2V5V2lkdGggKyAyO1xuICAgICAgICAgICAgeDIgPSBibGFja0tleU9mZnNldHNbMV0gKyAzO1xuICAgICAgICAgICAgeDMgPSBibGFja0tleU9mZnNldHNbMl0gLSAyOyBcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDIsIDAsIHgzIC0geDIsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6IC8qIEQjICovXG4gICAgICAgICAgICB4MSA9IGJsYWNrS2V5T2Zmc2V0c1syXTsgXG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1szXTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIDAsIEJsYWNrS2V5V2lkdGgsIEJsYWNrS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgIGlmIChicnVzaCA9PSBncmF5MUJydXNoKSB7XG4gICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkyQnJ1c2gsIHgxKzEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleUhlaWdodCAtIEJsYWNrS2V5SGVpZ2h0LzgsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleVdpZHRoLTIsIEJsYWNrS2V5SGVpZ2h0LzgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDogLyogRSAqL1xuICAgICAgICAgICAgeDEgPSBXaGl0ZUtleVdpZHRoICogMiArIDI7XG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1szXSArIDM7IFxuICAgICAgICAgICAgeDMgPSBXaGl0ZUtleVdpZHRoICogMyAtIDE7XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgyLCAwLCB4MyAtIHgyLCBCbGFja0tleUhlaWdodCszKTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIEJsYWNrS2V5SGVpZ2h0KzMsIFdoaXRlS2V5V2lkdGgtMywgYm90dG9tSGFsZkhlaWdodCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1OiAvKiBGICovXG4gICAgICAgICAgICB4MSA9IFdoaXRlS2V5V2lkdGggKiAzICsgMjtcbiAgICAgICAgICAgIHgyID0gYmxhY2tLZXlPZmZzZXRzWzRdIC0gMjsgXG4gICAgICAgICAgICB4MyA9IFdoaXRlS2V5V2lkdGggKiA0IC0gMjtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIDAsIHgyIC0geDEsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY6IC8qIEYjICovXG4gICAgICAgICAgICB4MSA9IGJsYWNrS2V5T2Zmc2V0c1s0XTsgXG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1s1XTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIDAsIEJsYWNrS2V5V2lkdGgsIEJsYWNrS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgIGlmIChicnVzaCA9PSBncmF5MUJydXNoKSB7XG4gICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkyQnJ1c2gsIHgxKzEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleUhlaWdodCAtIEJsYWNrS2V5SGVpZ2h0LzgsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleVdpZHRoLTIsIEJsYWNrS2V5SGVpZ2h0LzgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNzogLyogRyAqL1xuICAgICAgICAgICAgeDEgPSBXaGl0ZUtleVdpZHRoICogNCArIDI7XG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1s1XSArIDM7IFxuICAgICAgICAgICAgeDMgPSBibGFja0tleU9mZnNldHNbNl0gLSAyOyBcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDIsIDAsIHgzIC0geDIsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDg6IC8qIEcjICovXG4gICAgICAgICAgICB4MSA9IGJsYWNrS2V5T2Zmc2V0c1s2XTsgXG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1s3XTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIDAsIEJsYWNrS2V5V2lkdGgsIEJsYWNrS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgIGlmIChicnVzaCA9PSBncmF5MUJydXNoKSB7XG4gICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkyQnJ1c2gsIHgxKzEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleUhlaWdodCAtIEJsYWNrS2V5SGVpZ2h0LzgsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleVdpZHRoLTIsIEJsYWNrS2V5SGVpZ2h0LzgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgOTogLyogQSAqL1xuICAgICAgICAgICAgeDEgPSBXaGl0ZUtleVdpZHRoICogNSArIDI7XG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1s3XSArIDM7IFxuICAgICAgICAgICAgeDMgPSBibGFja0tleU9mZnNldHNbOF0gLSAyOyBcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDIsIDAsIHgzIC0geDIsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEwOiAvKiBBIyAqL1xuICAgICAgICAgICAgeDEgPSBibGFja0tleU9mZnNldHNbOF07IFxuICAgICAgICAgICAgeDIgPSBibGFja0tleU9mZnNldHNbOV07XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgxLCAwLCBCbGFja0tleVdpZHRoLCBCbGFja0tleUhlaWdodCk7XG4gICAgICAgICAgICBpZiAoYnJ1c2ggPT0gZ3JheTFCcnVzaCkge1xuICAgICAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShncmF5MkJydXNoLCB4MSsxLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmxhY2tLZXlIZWlnaHQgLSBCbGFja0tleUhlaWdodC84LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmxhY2tLZXlXaWR0aC0yLCBCbGFja0tleUhlaWdodC84KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDExOiAvKiBCICovXG4gICAgICAgICAgICB4MSA9IFdoaXRlS2V5V2lkdGggKiA2ICsgMjtcbiAgICAgICAgICAgIHgyID0gYmxhY2tLZXlPZmZzZXRzWzldICsgMzsgXG4gICAgICAgICAgICB4MyA9IFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlIC0gMTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDIsIDAsIHgzIC0geDIsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShvY3RhdmUgKiBXaGl0ZUtleVdpZHRoICogS2V5c1Blck9jdGF2ZSksIDApO1xuICAgIH1cblxuICAgIC8qKiBGaW5kIHRoZSBNaWRpTm90ZSB3aXRoIHRoZSBzdGFydFRpbWUgY2xvc2VzdCB0byB0aGUgZ2l2ZW4gdGltZS5cbiAgICAgKiAgUmV0dXJuIHRoZSBpbmRleCBvZiB0aGUgbm90ZS4gIFVzZSBhIGJpbmFyeSBzZWFyY2ggbWV0aG9kLlxuICAgICAqL1xuICAgIHByaXZhdGUgaW50IEZpbmRDbG9zZXN0U3RhcnRUaW1lKGludCBwdWxzZVRpbWUpIHtcbiAgICAgICAgaW50IGxlZnQgPSAwO1xuICAgICAgICBpbnQgcmlnaHQgPSBub3Rlcy5Db3VudC0xO1xuXG4gICAgICAgIHdoaWxlIChyaWdodCAtIGxlZnQgPiAxKSB7XG4gICAgICAgICAgICBpbnQgaSA9IChyaWdodCArIGxlZnQpLzI7XG4gICAgICAgICAgICBpZiAobm90ZXNbbGVmdF0uU3RhcnRUaW1lID09IHB1bHNlVGltZSlcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGVsc2UgaWYgKG5vdGVzW2ldLlN0YXJ0VGltZSA8PSBwdWxzZVRpbWUpXG4gICAgICAgICAgICAgICAgbGVmdCA9IGk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmlnaHQgPSBpO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChsZWZ0ID49IDEgJiYgKG5vdGVzW2xlZnQtMV0uU3RhcnRUaW1lID09IG5vdGVzW2xlZnRdLlN0YXJ0VGltZSkpIHtcbiAgICAgICAgICAgIGxlZnQtLTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGVmdDtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBuZXh0IFN0YXJ0VGltZSB0aGF0IG9jY3VycyBhZnRlciB0aGUgTWlkaU5vdGVcbiAgICAgKiAgYXQgb2Zmc2V0IGksIHRoYXQgaXMgYWxzbyBpbiB0aGUgc2FtZSB0cmFjay9jaGFubmVsLlxuICAgICAqL1xuICAgIHByaXZhdGUgaW50IE5leHRTdGFydFRpbWVTYW1lVHJhY2soaW50IGkpIHtcbiAgICAgICAgaW50IHN0YXJ0ID0gbm90ZXNbaV0uU3RhcnRUaW1lO1xuICAgICAgICBpbnQgZW5kID0gbm90ZXNbaV0uRW5kVGltZTtcbiAgICAgICAgaW50IHRyYWNrID0gbm90ZXNbaV0uQ2hhbm5lbDtcblxuICAgICAgICB3aGlsZSAoaSA8IG5vdGVzLkNvdW50KSB7XG4gICAgICAgICAgICBpZiAobm90ZXNbaV0uQ2hhbm5lbCAhPSB0cmFjaykge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChub3Rlc1tpXS5TdGFydFRpbWUgPiBzdGFydCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBub3Rlc1tpXS5TdGFydFRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbmQgPSBNYXRoLk1heChlbmQsIG5vdGVzW2ldLkVuZFRpbWUpO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbmQ7XG4gICAgfVxuXG5cbiAgICAvKiogUmV0dXJuIHRoZSBuZXh0IFN0YXJ0VGltZSB0aGF0IG9jY3VycyBhZnRlciB0aGUgTWlkaU5vdGVcbiAgICAgKiAgYXQgb2Zmc2V0IGkuICBJZiBhbGwgdGhlIHN1YnNlcXVlbnQgbm90ZXMgaGF2ZSB0aGUgc2FtZVxuICAgICAqICBTdGFydFRpbWUsIHRoZW4gcmV0dXJuIHRoZSBsYXJnZXN0IEVuZFRpbWUuXG4gICAgICovXG4gICAgcHJpdmF0ZSBpbnQgTmV4dFN0YXJ0VGltZShpbnQgaSkge1xuICAgICAgICBpbnQgc3RhcnQgPSBub3Rlc1tpXS5TdGFydFRpbWU7XG4gICAgICAgIGludCBlbmQgPSBub3Rlc1tpXS5FbmRUaW1lO1xuXG4gICAgICAgIHdoaWxlIChpIDwgbm90ZXMuQ291bnQpIHtcbiAgICAgICAgICAgIGlmIChub3Rlc1tpXS5TdGFydFRpbWUgPiBzdGFydCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBub3Rlc1tpXS5TdGFydFRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbmQgPSBNYXRoLk1heChlbmQsIG5vdGVzW2ldLkVuZFRpbWUpO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbmQ7XG4gICAgfVxuXG4gICAgLyoqIEZpbmQgdGhlIE1pZGkgbm90ZXMgdGhhdCBvY2N1ciBpbiB0aGUgY3VycmVudCB0aW1lLlxuICAgICAqICBTaGFkZSB0aG9zZSBub3RlcyBvbiB0aGUgcGlhbm8gZGlzcGxheWVkLlxuICAgICAqICBVbi1zaGFkZSB0aGUgdGhvc2Ugbm90ZXMgcGxheWVkIGluIHRoZSBwcmV2aW91cyB0aW1lLlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIFNoYWRlTm90ZXMoaW50IGN1cnJlbnRQdWxzZVRpbWUsIGludCBwcmV2UHVsc2VUaW1lKSB7XG4gICAgICAgIGlmIChub3RlcyA9PSBudWxsIHx8IG5vdGVzLkNvdW50ID09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ3JhcGhpY3MgPT0gbnVsbCkge1xuICAgICAgICAgICAgZ3JhcGhpY3MgPSBDcmVhdGVHcmFwaGljcyhcInNoYWRlTm90ZXNfcGlhbm9cIik7XG4gICAgICAgIH1cbiAgICAgICAgZ3JhcGhpY3MuU21vb3RoaW5nTW9kZSA9IFNtb290aGluZ01vZGUuTm9uZTtcbiAgICAgICAgZ3JhcGhpY3MuVHJhbnNsYXRlVHJhbnNmb3JtKG1hcmdpbiArIEJsYWNrQm9yZGVyLCBtYXJnaW4gKyBCbGFja0JvcmRlcik7XG5cbiAgICAgICAgLyogTG9vcCB0aHJvdWdoIHRoZSBNaWRpIG5vdGVzLlxuICAgICAgICAgKiBVbnNoYWRlIG5vdGVzIHdoZXJlIFN0YXJ0VGltZSA8PSBwcmV2UHVsc2VUaW1lIDwgbmV4dCBTdGFydFRpbWVcbiAgICAgICAgICogU2hhZGUgbm90ZXMgd2hlcmUgU3RhcnRUaW1lIDw9IGN1cnJlbnRQdWxzZVRpbWUgPCBuZXh0IFN0YXJ0VGltZVxuICAgICAgICAgKi9cbiAgICAgICAgaW50IGxhc3RTaGFkZWRJbmRleCA9IEZpbmRDbG9zZXN0U3RhcnRUaW1lKHByZXZQdWxzZVRpbWUgLSBtYXhTaGFkZUR1cmF0aW9uICogMik7XG4gICAgICAgIGZvciAoaW50IGkgPSBsYXN0U2hhZGVkSW5kZXg7IGkgPCBub3Rlcy5Db3VudDsgaSsrKSB7XG4gICAgICAgICAgICBpbnQgc3RhcnQgPSBub3Rlc1tpXS5TdGFydFRpbWU7XG4gICAgICAgICAgICBpbnQgZW5kID0gbm90ZXNbaV0uRW5kVGltZTtcbiAgICAgICAgICAgIGludCBub3RlbnVtYmVyID0gbm90ZXNbaV0uTnVtYmVyO1xuICAgICAgICAgICAgaW50IG5leHRTdGFydCA9IE5leHRTdGFydFRpbWUoaSk7XG4gICAgICAgICAgICBpbnQgbmV4dFN0YXJ0VHJhY2sgPSBOZXh0U3RhcnRUaW1lU2FtZVRyYWNrKGkpO1xuICAgICAgICAgICAgZW5kID0gTWF0aC5NYXgoZW5kLCBuZXh0U3RhcnRUcmFjayk7XG4gICAgICAgICAgICBlbmQgPSBNYXRoLk1pbihlbmQsIHN0YXJ0ICsgbWF4U2hhZGVEdXJhdGlvbi0xKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8qIElmIHdlJ3ZlIHBhc3QgdGhlIHByZXZpb3VzIGFuZCBjdXJyZW50IHRpbWVzLCB3ZSdyZSBkb25lLiAqL1xuICAgICAgICAgICAgaWYgKChzdGFydCA+IHByZXZQdWxzZVRpbWUpICYmIChzdGFydCA+IGN1cnJlbnRQdWxzZVRpbWUpKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIElmIHNoYWRlZCBub3RlcyBhcmUgdGhlIHNhbWUsIHdlJ3JlIGRvbmUgKi9cbiAgICAgICAgICAgIGlmICgoc3RhcnQgPD0gY3VycmVudFB1bHNlVGltZSkgJiYgKGN1cnJlbnRQdWxzZVRpbWUgPCBuZXh0U3RhcnQpICYmXG4gICAgICAgICAgICAgICAgKGN1cnJlbnRQdWxzZVRpbWUgPCBlbmQpICYmIFxuICAgICAgICAgICAgICAgIChzdGFydCA8PSBwcmV2UHVsc2VUaW1lKSAmJiAocHJldlB1bHNlVGltZSA8IG5leHRTdGFydCkgJiZcbiAgICAgICAgICAgICAgICAocHJldlB1bHNlVGltZSA8IGVuZCkpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogSWYgdGhlIG5vdGUgaXMgaW4gdGhlIGN1cnJlbnQgdGltZSwgc2hhZGUgaXQgKi9cbiAgICAgICAgICAgIGlmICgoc3RhcnQgPD0gY3VycmVudFB1bHNlVGltZSkgJiYgKGN1cnJlbnRQdWxzZVRpbWUgPCBlbmQpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHVzZVR3b0NvbG9ycykge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm90ZXNbaV0uQ2hhbm5lbCA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTaGFkZU9uZU5vdGUoZ3JhcGhpY3MsIG5vdGVudW1iZXIsIHNoYWRlMkJydXNoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFNoYWRlT25lTm90ZShncmFwaGljcywgbm90ZW51bWJlciwgc2hhZGVCcnVzaCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIFNoYWRlT25lTm90ZShncmFwaGljcywgbm90ZW51bWJlciwgc2hhZGVCcnVzaCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBJZiB0aGUgbm90ZSBpcyBpbiB0aGUgcHJldmlvdXMgdGltZSwgdW4tc2hhZGUgaXQsIGRyYXcgaXQgd2hpdGUuICovXG4gICAgICAgICAgICBlbHNlIGlmICgoc3RhcnQgPD0gcHJldlB1bHNlVGltZSkgJiYgKHByZXZQdWxzZVRpbWUgPCBlbmQpKSB7XG4gICAgICAgICAgICAgICAgaW50IG51bSA9IG5vdGVudW1iZXIgJSAxMjtcbiAgICAgICAgICAgICAgICBpZiAobnVtID09IDEgfHwgbnVtID09IDMgfHwgbnVtID09IDYgfHwgbnVtID09IDggfHwgbnVtID09IDEwKSB7XG4gICAgICAgICAgICAgICAgICAgIFNoYWRlT25lTm90ZShncmFwaGljcywgbm90ZW51bWJlciwgZ3JheTFCcnVzaCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBTaGFkZU9uZU5vdGUoZ3JhcGhpY3MsIG5vdGVudW1iZXIsIEJydXNoZXMuV2hpdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBncmFwaGljcy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShtYXJnaW4gKyBCbGFja0JvcmRlciksIC0obWFyZ2luICsgQmxhY2tCb3JkZXIpKTtcbiAgICAgICAgZ3JhcGhpY3MuU21vb3RoaW5nTW9kZSA9IFNtb290aGluZ01vZGUuQW50aUFsaWFzO1xuICAgIH1cbn1cblxufVxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG5cbi8qIEBjbGFzcyBSZXN0U3ltYm9sXG4gKiBBIFJlc3Qgc3ltYm9sIHJlcHJlc2VudHMgYSByZXN0IC0gd2hvbGUsIGhhbGYsIHF1YXJ0ZXIsIG9yIGVpZ2h0aC5cbiAqIFRoZSBSZXN0IHN5bWJvbCBoYXMgYSBzdGFydHRpbWUgYW5kIGEgZHVyYXRpb24sIGp1c3QgbGlrZSBhIHJlZ3VsYXJcbiAqIG5vdGUuXG4gKi9cbnB1YmxpYyBjbGFzcyBSZXN0U3ltYm9sIDogTXVzaWNTeW1ib2wge1xuICAgIHByaXZhdGUgaW50IHN0YXJ0dGltZTsgICAgICAgICAgLyoqIFRoZSBzdGFydHRpbWUgb2YgdGhlIHJlc3QgKi9cbiAgICBwcml2YXRlIE5vdGVEdXJhdGlvbiBkdXJhdGlvbjsgIC8qKiBUaGUgcmVzdCBkdXJhdGlvbiAoZWlnaHRoLCBxdWFydGVyLCBoYWxmLCB3aG9sZSkgKi9cbiAgICBwcml2YXRlIGludCB3aWR0aDsgICAgICAgICAgICAgIC8qKiBUaGUgd2lkdGggaW4gcGl4ZWxzICovXG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IHJlc3Qgc3ltYm9sIHdpdGggdGhlIGdpdmVuIHN0YXJ0IHRpbWUgYW5kIGR1cmF0aW9uICovXG4gICAgcHVibGljIFJlc3RTeW1ib2woaW50IHN0YXJ0LCBOb3RlRHVyYXRpb24gZHVyKSB7XG4gICAgICAgIHN0YXJ0dGltZSA9IHN0YXJ0O1xuICAgICAgICBkdXJhdGlvbiA9IGR1cjsgXG4gICAgICAgIHdpZHRoID0gTWluV2lkdGg7XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgdGltZSAoaW4gcHVsc2VzKSB0aGlzIHN5bWJvbCBvY2N1cnMgYXQuXG4gICAgICogVGhpcyBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgbWVhc3VyZSB0aGlzIHN5bWJvbCBiZWxvbmdzIHRvLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgU3RhcnRUaW1lIHsgXG4gICAgICAgIGdldCB7IHJldHVybiBzdGFydHRpbWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0L1NldCB0aGUgd2lkdGggKGluIHBpeGVscykgb2YgdGhpcyBzeW1ib2wuIFRoZSB3aWR0aCBpcyBzZXRcbiAgICAgKiBpbiBTaGVldE11c2ljLkFsaWduU3ltYm9scygpIHRvIHZlcnRpY2FsbHkgYWxpZ24gc3ltYm9scy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFdpZHRoIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgIHNldCB7IHdpZHRoID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBtaW5pbXVtIHdpZHRoIChpbiBwaXhlbHMpIG5lZWRlZCB0byBkcmF3IHRoaXMgc3ltYm9sICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBNaW5XaWR0aCB7XG4gICAgICAgIGdldCB7IHJldHVybiAyICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICsgXG4gICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGFib3ZlIHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEFib3ZlU3RhZmYgeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIDA7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYmVsb3cgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQmVsb3dTdGFmZiB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBEcmF3IHRoZSBzeW1ib2wuXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHlsb2NhdGlvbiAoaW4gcGl4ZWxzKSB3aGVyZSB0aGUgdG9wIG9mIHRoZSBzdGFmZiBzdGFydHMuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIFxuICAgIHZvaWQgRHJhdyhHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICAvKiBBbGlnbiB0aGUgcmVzdCBzeW1ib2wgdG8gdGhlIHJpZ2h0ICovXG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKFdpZHRoIC0gTWluV2lkdGgsIDApO1xuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybShTaGVldE11c2ljLk5vdGVIZWlnaHQvMiwgMCk7XG5cbiAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5XaG9sZSkge1xuICAgICAgICAgICAgRHJhd1dob2xlKGcsIHBlbiwgeXRvcCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkhhbGYpIHtcbiAgICAgICAgICAgIERyYXdIYWxmKGcsIHBlbiwgeXRvcCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlF1YXJ0ZXIpIHtcbiAgICAgICAgICAgIERyYXdRdWFydGVyKGcsIHBlbiwgeXRvcCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkVpZ2h0aCkge1xuICAgICAgICAgICAgRHJhd0VpZ2h0aChnLCBwZW4sIHl0b3ApO1xuICAgICAgICB9XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC1TaGVldE11c2ljLk5vdGVIZWlnaHQvMiwgMCk7XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0oV2lkdGggLSBNaW5XaWR0aCksIDApO1xuICAgIH1cblxuXG4gICAgLyoqIERyYXcgYSB3aG9sZSByZXN0IHN5bWJvbCwgYSByZWN0YW5nbGUgYmVsb3cgYSBzdGFmZiBsaW5lLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIERyYXdXaG9sZShHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICBpbnQgeSA9IHl0b3AgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG5cbiAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKEJydXNoZXMuQmxhY2ssIDAsIHksIFxuICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlV2lkdGgsIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yKTtcbiAgICB9XG5cbiAgICAvKiogRHJhdyBhIGhhbGYgcmVzdCBzeW1ib2wsIGEgcmVjdGFuZ2xlIGFib3ZlIGEgc3RhZmYgbGluZS5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3SGFsZihHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICBpbnQgeSA9IHl0b3AgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcblxuICAgICAgICBnLkZpbGxSZWN0YW5nbGUoQnJ1c2hlcy5CbGFjaywgMCwgeSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVXaWR0aCwgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIpO1xuICAgIH1cblxuICAgIC8qKiBEcmF3IGEgcXVhcnRlciByZXN0IHN5bWJvbC5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3UXVhcnRlcihHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICBwZW4uRW5kQ2FwID0gTGluZUNhcC5GbGF0O1xuXG4gICAgICAgIGludCB5ID0geXRvcCArIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICBpbnQgeCA9IDI7XG4gICAgICAgIGludCB4ZW5kID0geCArIDIqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzM7XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCB4LCB5LCB4ZW5kLTEsIHkgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQtMSk7XG5cbiAgICAgICAgcGVuLldpZHRoID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvMjtcbiAgICAgICAgeSAgPSB5dG9wICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICsgMTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHhlbmQtMiwgeSwgeCwgeSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCk7XG5cbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICAgICAgeSA9IHl0b3AgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQqMiAtIDE7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCAwLCB5LCB4ZW5kKzIsIHkgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQpOyBcblxuICAgICAgICBwZW4uV2lkdGggPSBTaGVldE11c2ljLkxpbmVTcGFjZS8yO1xuICAgICAgICBpZiAoU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ID09IDYpIHtcbiAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4ZW5kLCB5ICsgMSArIDMqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeC8yLCB5ICsgMSArIDMqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgeyAgLyogTm90ZUhlaWdodCA9PSA4ICovXG4gICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeGVuZCwgeSArIDMqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeC8yLCB5ICsgMypTaGVldE11c2ljLk5vdGVIZWlnaHQvNCk7XG4gICAgICAgIH1cblxuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgMCwgeSArIDIqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzMgKyAxLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHhlbmQgLSAxLCB5ICsgMypTaGVldE11c2ljLk5vdGVIZWlnaHQvMik7XG4gICAgfVxuXG4gICAgLyoqIERyYXcgYW4gZWlnaHRoIHJlc3Qgc3ltYm9sLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIERyYXdFaWdodGgoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3ApIHtcbiAgICAgICAgaW50IHkgPSB5dG9wICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0IC0gMTtcbiAgICAgICAgZy5GaWxsRWxsaXBzZShCcnVzaGVzLkJsYWNrLCAwLCB5KzEsIFxuICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGluZVNwYWNlLTEsIFNoZWV0TXVzaWMuTGluZVNwYWNlLTEpO1xuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgKFNoZWV0TXVzaWMuTGluZVNwYWNlLTIpLzIsIHkgKyBTaGVldE11c2ljLkxpbmVTcGFjZS0xLFxuICAgICAgICAgICAgICAgICAgICAgICAgMypTaGVldE11c2ljLkxpbmVTcGFjZS8yLCB5ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMik7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCAzKlNoZWV0TXVzaWMuTGluZVNwYWNlLzIsIHkgKyBTaGVldE11c2ljLkxpbmVTcGFjZS8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgMypTaGVldE11c2ljLkxpbmVTcGFjZS80LCB5ICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIpO1xuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiUmVzdFN5bWJvbCBzdGFydHRpbWU9ezB9IGR1cmF0aW9uPXsxfSB3aWR0aD17Mn1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnR0aW1lLCBkdXJhdGlvbiwgd2lkdGgpO1xuICAgIH1cblxufVxuXG5cbn1cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDEyIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uTGlucTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xue1xuXG5cbiAgICAvKiogQGNsYXNzIFNoZWV0TXVzaWNcbiAgICAgKlxuICAgICAqIFRoZSBTaGVldE11c2ljIENvbnRyb2wgaXMgdGhlIG1haW4gY2xhc3MgZm9yIGRpc3BsYXlpbmcgdGhlIHNoZWV0IG11c2ljLlxuICAgICAqIFRoZSBTaGVldE11c2ljIGNsYXNzIGhhcyB0aGUgZm9sbG93aW5nIHB1YmxpYyBtZXRob2RzOlxuICAgICAqXG4gICAgICogU2hlZXRNdXNpYygpXG4gICAgICogICBDcmVhdGUgYSBuZXcgU2hlZXRNdXNpYyBjb250cm9sIGZyb20gdGhlIGdpdmVuIG1pZGkgZmlsZSBhbmQgb3B0aW9ucy5cbiAgICAgKiBcbiAgICAgKiBTZXRab29tKClcbiAgICAgKiAgIFNldCB0aGUgem9vbSBsZXZlbCB0byBkaXNwbGF5IHRoZSBzaGVldCBtdXNpYyBhdC5cbiAgICAgKlxuICAgICAqIERvUHJpbnQoKVxuICAgICAqICAgUHJpbnQgYSBzaW5nbGUgcGFnZSBvZiBzaGVldCBtdXNpYy5cbiAgICAgKlxuICAgICAqIEdldFRvdGFsUGFnZXMoKVxuICAgICAqICAgR2V0IHRoZSB0b3RhbCBudW1iZXIgb2Ygc2hlZXQgbXVzaWMgcGFnZXMuXG4gICAgICpcbiAgICAgKiBPblBhaW50KClcbiAgICAgKiAgIE1ldGhvZCBjYWxsZWQgdG8gZHJhdyB0aGUgU2hlZXRNdWlzY1xuICAgICAqXG4gICAgICogVGhlc2UgcHVibGljIG1ldGhvZHMgYXJlIGNhbGxlZCBmcm9tIHRoZSBNaWRpU2hlZXRNdXNpYyBGb3JtIFdpbmRvdy5cbiAgICAgKlxuICAgICAqL1xuICAgIHB1YmxpYyBjbGFzcyBTaGVldE11c2ljIDogQ29udHJvbFxuICAgIHtcblxuICAgICAgICAvKiBNZWFzdXJlbWVudHMgdXNlZCB3aGVuIGRyYXdpbmcuICBBbGwgbWVhc3VyZW1lbnRzIGFyZSBpbiBwaXhlbHMuXG4gICAgICAgICAqIFRoZSB2YWx1ZXMgZGVwZW5kIG9uIHdoZXRoZXIgdGhlIG1lbnUgJ0xhcmdlIE5vdGVzJyBvciAnU21hbGwgTm90ZXMnIGlzIHNlbGVjdGVkLlxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIGNvbnN0IGludCBMaW5lV2lkdGggPSAxOyAgICAvKiogVGhlIHdpZHRoIG9mIGEgbGluZSAqL1xuICAgICAgICBwdWJsaWMgY29uc3QgaW50IExlZnRNYXJnaW4gPSA0OyAgIC8qKiBUaGUgbGVmdCBtYXJnaW4gKi9cbiAgICAgICAgcHVibGljIGNvbnN0IGludCBUaXRsZUhlaWdodCA9IDE0OyAvKiogVGhlIGhlaWdodCBmb3IgdGhlIHRpdGxlIG9uIHRoZSBmaXJzdCBwYWdlICovXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaW50IExpbmVTcGFjZTsgICAgICAgIC8qKiBUaGUgc3BhY2UgYmV0d2VlbiBsaW5lcyBpbiB0aGUgc3RhZmYgKi9cbiAgICAgICAgcHVibGljIHN0YXRpYyBpbnQgU3RhZmZIZWlnaHQ7ICAgICAgLyoqIFRoZSBoZWlnaHQgYmV0d2VlbiB0aGUgNSBob3Jpem9udGFsIGxpbmVzIG9mIHRoZSBzdGFmZiAqL1xuICAgICAgICBwdWJsaWMgc3RhdGljIGludCBOb3RlSGVpZ2h0OyAgICAgIC8qKiBUaGUgaGVpZ2h0IG9mIGEgd2hvbGUgbm90ZSAqL1xuICAgICAgICBwdWJsaWMgc3RhdGljIGludCBOb3RlV2lkdGg7ICAgICAgIC8qKiBUaGUgd2lkdGggb2YgYSB3aG9sZSBub3RlICovXG5cbiAgICAgICAgcHVibGljIGNvbnN0IGludCBQYWdlV2lkdGggPSA4MDA7ICAgIC8qKiBUaGUgd2lkdGggb2YgZWFjaCBwYWdlICovXG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgUGFnZUhlaWdodCA9IDEwNTA7ICAvKiogVGhlIGhlaWdodCBvZiBlYWNoIHBhZ2UgKHdoZW4gcHJpbnRpbmcpICovXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgRm9udCBMZXR0ZXJGb250OyAgICAgICAvKiogVGhlIGZvbnQgZm9yIGRyYXdpbmcgdGhlIGxldHRlcnMgKi9cblxuICAgICAgICBwcml2YXRlIExpc3Q8U3RhZmY+IHN0YWZmczsgLyoqIFRoZSBhcnJheSBvZiBzdGFmZnMgdG8gZGlzcGxheSAoZnJvbSB0b3AgdG8gYm90dG9tKSAqL1xuICAgICAgICBwcml2YXRlIEtleVNpZ25hdHVyZSBtYWlua2V5OyAvKiogVGhlIG1haW4ga2V5IHNpZ25hdHVyZSAqL1xuICAgICAgICBwcml2YXRlIGludCBudW10cmFja3M7ICAgICAvKiogVGhlIG51bWJlciBvZiB0cmFja3MgKi9cbiAgICAgICAgcHJpdmF0ZSBmbG9hdCB6b29tOyAgICAgICAgICAvKiogVGhlIHpvb20gbGV2ZWwgdG8gZHJhdyBhdCAoMS4wID09IDEwMCUpICovXG4gICAgICAgIHByaXZhdGUgYm9vbCBzY3JvbGxWZXJ0OyAgICAvKiogV2hldGhlciB0byBzY3JvbGwgdmVydGljYWxseSBvciBob3Jpem9udGFsbHkgKi9cbiAgICAgICAgcHJpdmF0ZSBzdHJpbmcgZmlsZW5hbWU7ICAgICAgLyoqIFRoZSBuYW1lIG9mIHRoZSBtaWRpIGZpbGUgKi9cbiAgICAgICAgcHJpdmF0ZSBpbnQgc2hvd05vdGVMZXR0ZXJzOyAgICAvKiogRGlzcGxheSB0aGUgbm90ZSBsZXR0ZXJzICovXG4gICAgICAgIHByaXZhdGUgQ29sb3JbXSBOb3RlQ29sb3JzOyAgICAgLyoqIFRoZSBub3RlIGNvbG9ycyB0byB1c2UgKi9cbiAgICAgICAgcHJpdmF0ZSBTb2xpZEJydXNoIHNoYWRlQnJ1c2g7ICAvKiogVGhlIGJydXNoIGZvciBzaGFkaW5nICovXG4gICAgICAgIHByaXZhdGUgU29saWRCcnVzaCBzaGFkZTJCcnVzaDsgLyoqIFRoZSBicnVzaCBmb3Igc2hhZGluZyBsZWZ0LWhhbmQgcGlhbm8gKi9cbiAgICAgICAgcHJpdmF0ZSBTb2xpZEJydXNoIGRlc2VsZWN0ZWRTaGFkZUJydXNoID0gbmV3IFNvbGlkQnJ1c2goQ29sb3IuTGlnaHRHcmF5KTsgLyoqIFRoZSBicnVzaCBmb3Igc2hhZGluZyBkZXNlbGVjdGVkIGFyZWFzICovXG4gICAgICAgIHByaXZhdGUgUGVuIHBlbjsgICAgICAgICAgICAgICAgLyoqIFRoZSBibGFjayBwZW4gZm9yIGRyYXdpbmcgKi9cblxuICAgICAgICBwdWJsaWMgaW50IFNlbGVjdGlvblN0YXJ0UHVsc2UgeyBnZXQ7IHNldDsgfVxuICAgICAgICBwdWJsaWMgaW50IFNlbGVjdGlvbkVuZFB1bHNlIHsgZ2V0OyBzZXQ7IH1cblxuICAgICAgICAvKiogSW5pdGlhbGl6ZSB0aGUgZGVmYXVsdCBub3RlIHNpemVzLiAgKi9cbiAgICAgICAgc3RhdGljIFNoZWV0TXVzaWMoKVxuICAgICAgICB7XG4gICAgICAgICAgICBTZXROb3RlU2l6ZShmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogQ3JlYXRlIGEgbmV3IFNoZWV0TXVzaWMgY29udHJvbCwgdXNpbmcgdGhlIGdpdmVuIHBhcnNlZCBNaWRpRmlsZS5cbiAgICAgICAgICogIFRoZSBvcHRpb25zIGNhbiBiZSBudWxsLlxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIFNoZWV0TXVzaWMoTWlkaUZpbGUgZmlsZSwgTWlkaU9wdGlvbnMgb3B0aW9ucylcbiAgICAgICAge1xuICAgICAgICAgICAgaW5pdChmaWxlLCBvcHRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBTaGVldE11c2ljKE1pZGlGaWxlIGZpbGUsIE1pZGlPcHRpb25zIG9wdGlvbnMsIExpc3Q8TWlkaVRyYWNrPiB0cmFja3MpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGluaXQoZmlsZSwgb3B0aW9ucywgdHJhY2tzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBDcmVhdGUgYSBuZXcgU2hlZXRNdXNpYyBjb250cm9sLCB1c2luZyB0aGUgZ2l2ZW4gcmF3IG1pZGkgYnl0ZVtdIGRhdGEuXG4gICAgICAgICAqICBUaGUgb3B0aW9ucyBjYW4gYmUgbnVsbC5cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBTaGVldE11c2ljKGJ5dGVbXSBkYXRhLCBzdHJpbmcgdGl0bGUsIE1pZGlPcHRpb25zIG9wdGlvbnMpXG4gICAgICAgIHtcbiAgICAgICAgICAgIE1pZGlGaWxlIGZpbGUgPSBuZXcgTWlkaUZpbGUoZGF0YSwgdGl0bGUpO1xuICAgICAgICAgICAgaW5pdChmaWxlLCBvcHRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyB2b2lkIGluaXQoTWlkaUZpbGUgZmlsZSwgTWlkaU9wdGlvbnMgb3B0aW9ucywgTGlzdDxNaWRpVHJhY2s+IHRyYWNrcylcbiAgICAgICAge1xuICAgICAgICAgICAgem9vbSA9IDEuMGY7XG4gICAgICAgICAgICBmaWxlbmFtZSA9IGZpbGUuRmlsZU5hbWU7XG5cbiAgICAgICAgICAgIFNldENvbG9ycyhvcHRpb25zLmNvbG9ycywgb3B0aW9ucy5zaGFkZUNvbG9yLCBvcHRpb25zLnNoYWRlMkNvbG9yKTtcbiAgICAgICAgICAgIHBlbiA9IG5ldyBQZW4oQ29sb3IuQmxhY2ssIDEpO1xuXG4gICAgICAgICAgICBTZXROb3RlU2l6ZShvcHRpb25zLmxhcmdlTm90ZVNpemUpO1xuICAgICAgICAgICAgc2Nyb2xsVmVydCA9IG9wdGlvbnMuc2Nyb2xsVmVydDtcbiAgICAgICAgICAgIHNob3dOb3RlTGV0dGVycyA9IG9wdGlvbnMuc2hvd05vdGVMZXR0ZXJzO1xuICAgICAgICAgICAgVGltZVNpZ25hdHVyZSB0aW1lID0gZmlsZS5UaW1lO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMudGltZSAhPSBudWxsKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRpbWUgPSBvcHRpb25zLnRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5rZXkgPT0gLTEpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbWFpbmtleSA9IEdldEtleVNpZ25hdHVyZSh0cmFja3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG1haW5rZXkgPSBuZXcgS2V5U2lnbmF0dXJlKG9wdGlvbnMua2V5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbnVtdHJhY2tzID0gdHJhY2tzLkNvdW50O1xuXG4gICAgICAgICAgICBpbnQgbGFzdFN0YXJ0ID0gZmlsZS5FbmRUaW1lKCkgKyBvcHRpb25zLnNoaWZ0dGltZTtcblxuICAgICAgICAgICAgLyogQ3JlYXRlIGFsbCB0aGUgbXVzaWMgc3ltYm9scyAobm90ZXMsIHJlc3RzLCB2ZXJ0aWNhbCBiYXJzLCBhbmRcbiAgICAgICAgICAgICAqIGNsZWYgY2hhbmdlcykuICBUaGUgc3ltYm9scyB2YXJpYWJsZSBjb250YWlucyBhIGxpc3Qgb2YgbXVzaWMgXG4gICAgICAgICAgICAgKiBzeW1ib2xzIGZvciBlYWNoIHRyYWNrLiAgVGhlIGxpc3QgZG9lcyBub3QgaW5jbHVkZSB0aGUgbGVmdC1zaWRlIFxuICAgICAgICAgICAgICogQ2xlZiBhbmQga2V5IHNpZ25hdHVyZSBzeW1ib2xzLiAgVGhvc2UgY2FuIG9ubHkgYmUgY2FsY3VsYXRlZCBcbiAgICAgICAgICAgICAqIHdoZW4gd2UgY3JlYXRlIHRoZSBzdGFmZnMuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIExpc3Q8TXVzaWNTeW1ib2w+W10gc3ltYm9scyA9IG5ldyBMaXN0PE11c2ljU3ltYm9sPltudW10cmFja3NdO1xuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IG51bXRyYWNrczsgdHJhY2tudW0rKylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBNaWRpVHJhY2sgdHJhY2sgPSB0cmFja3NbdHJhY2tudW1dO1xuICAgICAgICAgICAgICAgIENsZWZNZWFzdXJlcyBjbGVmcyA9IG5ldyBDbGVmTWVhc3VyZXModHJhY2suTm90ZXMsIHRpbWUuTWVhc3VyZSk7XG4gICAgICAgICAgICAgICAgTGlzdDxDaG9yZFN5bWJvbD4gY2hvcmRzID0gQ3JlYXRlQ2hvcmRzKHRyYWNrLk5vdGVzLCBtYWlua2V5LCB0aW1lLCBjbGVmcyk7XG4gICAgICAgICAgICAgICAgc3ltYm9sc1t0cmFja251bV0gPSBDcmVhdGVTeW1ib2xzKGNob3JkcywgY2xlZnMsIHRpbWUsIGxhc3RTdGFydCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIExpc3Q8THlyaWNTeW1ib2w+W10gbHlyaWNzID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnNob3dMeXJpY3MpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbHlyaWNzID0gR2V0THlyaWNzKHRyYWNrcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIFZlcnRpY2FsbHkgYWxpZ24gdGhlIG11c2ljIHN5bWJvbHMgKi9cbiAgICAgICAgICAgIFN5bWJvbFdpZHRocyB3aWR0aHMgPSBuZXcgU3ltYm9sV2lkdGhzKHN5bWJvbHMsIGx5cmljcyk7XG4gICAgICAgICAgICBBbGlnblN5bWJvbHMoc3ltYm9scywgd2lkdGhzLCBvcHRpb25zKTtcblxuICAgICAgICAgICAgc3RhZmZzID0gQ3JlYXRlU3RhZmZzKHN5bWJvbHMsIG1haW5rZXksIG9wdGlvbnMsIHRpbWUuTWVhc3VyZSk7XG4gICAgICAgICAgICBDcmVhdGVBbGxCZWFtZWRDaG9yZHMoc3ltYm9scywgdGltZSk7XG4gICAgICAgICAgICBpZiAobHlyaWNzICE9IG51bGwpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgQWRkTHlyaWNzVG9TdGFmZnMoc3RhZmZzLCBseXJpY3MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBBZnRlciBtYWtpbmcgY2hvcmQgcGFpcnMsIHRoZSBzdGVtIGRpcmVjdGlvbnMgY2FuIGNoYW5nZSxcbiAgICAgICAgICAgICAqIHdoaWNoIGFmZmVjdHMgdGhlIHN0YWZmIGhlaWdodC4gIFJlLWNhbGN1bGF0ZSB0aGUgc3RhZmYgaGVpZ2h0LlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBmb3JlYWNoIChTdGFmZiBzdGFmZiBpbiBzdGFmZnMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc3RhZmYuQ2FsY3VsYXRlSGVpZ2h0KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIEJhY2tDb2xvciA9IENvbG9yLldoaXRlO1xuXG4gICAgICAgICAgICBTZXRab29tKDEuMGYpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqIENyZWF0ZSBhIG5ldyBTaGVldE11c2ljIGNvbnRyb2wuXG4gICAgICAgICAqIE1pZGlGaWxlIGlzIHRoZSBwYXJzZWQgbWlkaSBmaWxlIHRvIGRpc3BsYXkuXG4gICAgICAgICAqIFNoZWV0TXVzaWMgT3B0aW9ucyBhcmUgdGhlIG1lbnUgb3B0aW9ucyB0aGF0IHdlcmUgc2VsZWN0ZWQuXG4gICAgICAgICAqXG4gICAgICAgICAqIC0gQXBwbHkgYWxsIHRoZSBNZW51IE9wdGlvbnMgdG8gdGhlIE1pZGlGaWxlIHRyYWNrcy5cbiAgICAgICAgICogLSBDYWxjdWxhdGUgdGhlIGtleSBzaWduYXR1cmVcbiAgICAgICAgICogLSBGb3IgZWFjaCB0cmFjaywgY3JlYXRlIGEgbGlzdCBvZiBNdXNpY1N5bWJvbHMgKG5vdGVzLCByZXN0cywgYmFycywgZXRjKVxuICAgICAgICAgKiAtIFZlcnRpY2FsbHkgYWxpZ24gdGhlIG11c2ljIHN5bWJvbHMgaW4gYWxsIHRoZSB0cmFja3NcbiAgICAgICAgICogLSBQYXJ0aXRpb24gdGhlIG11c2ljIG5vdGVzIGludG8gaG9yaXpvbnRhbCBzdGFmZnNcbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyB2b2lkIGluaXQoTWlkaUZpbGUgZmlsZSwgTWlkaU9wdGlvbnMgb3B0aW9ucylcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMgPT0gbnVsbClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gbmV3IE1pZGlPcHRpb25zKGZpbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgTGlzdDxNaWRpVHJhY2s+IHRyYWNrcyA9IGZpbGUuQ2hhbmdlTWlkaU5vdGVzKG9wdGlvbnMpO1xuICAgICAgICAgICAgaW5pdChmaWxlLCBvcHRpb25zLCB0cmFja3MpO1xuXG4gICAgICAgIH1cblxuXG4gICAgICAgIC8qKiBHZXQgdGhlIGJlc3Qga2V5IHNpZ25hdHVyZSBnaXZlbiB0aGUgbWlkaSBub3RlcyBpbiBhbGwgdGhlIHRyYWNrcy4gKi9cbiAgICAgICAgcHJpdmF0ZSBLZXlTaWduYXR1cmUgR2V0S2V5U2lnbmF0dXJlKExpc3Q8TWlkaVRyYWNrPiB0cmFja3MpXG4gICAgICAgIHtcbiAgICAgICAgICAgIExpc3Q8aW50PiBub3RlbnVtcyA9IG5ldyBMaXN0PGludD4oKTtcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiB0cmFjay5Ob3RlcylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5vdGVudW1zLkFkZChub3RlLk51bWJlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIEtleVNpZ25hdHVyZS5HdWVzcyhub3RlbnVtcyk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8qKiBDcmVhdGUgdGhlIGNob3JkIHN5bWJvbHMgZm9yIGEgc2luZ2xlIHRyYWNrLlxuICAgICAgICAgKiBAcGFyYW0gbWlkaW5vdGVzICBUaGUgTWlkaW5vdGVzIGluIHRoZSB0cmFjay5cbiAgICAgICAgICogQHBhcmFtIGtleSAgICAgICAgVGhlIEtleSBTaWduYXR1cmUsIGZvciBkZXRlcm1pbmluZyBzaGFycHMvZmxhdHMuXG4gICAgICAgICAqIEBwYXJhbSB0aW1lICAgICAgIFRoZSBUaW1lIFNpZ25hdHVyZSwgZm9yIGRldGVybWluaW5nIHRoZSBtZWFzdXJlcy5cbiAgICAgICAgICogQHBhcmFtIGNsZWZzICAgICAgVGhlIGNsZWZzIHRvIHVzZSBmb3IgZWFjaCBtZWFzdXJlLlxuICAgICAgICAgKiBAcmV0IEFuIGFycmF5IG9mIENob3JkU3ltYm9sc1xuICAgICAgICAgKi9cbiAgICAgICAgcHJpdmF0ZVxuICAgICAgICBMaXN0PENob3JkU3ltYm9sPiBDcmVhdGVDaG9yZHMoTGlzdDxNaWRpTm90ZT4gbWlkaW5vdGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgS2V5U2lnbmF0dXJlIGtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRpbWVTaWduYXR1cmUgdGltZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENsZWZNZWFzdXJlcyBjbGVmcylcbiAgICAgICAge1xuXG4gICAgICAgICAgICBpbnQgaSA9IDA7XG4gICAgICAgICAgICBMaXN0PENob3JkU3ltYm9sPiBjaG9yZHMgPSBuZXcgTGlzdDxDaG9yZFN5bWJvbD4oKTtcbiAgICAgICAgICAgIExpc3Q8TWlkaU5vdGU+IG5vdGVncm91cCA9IG5ldyBMaXN0PE1pZGlOb3RlPigxMik7XG4gICAgICAgICAgICBpbnQgbGVuID0gbWlkaW5vdGVzLkNvdW50O1xuXG4gICAgICAgICAgICB3aGlsZSAoaSA8IGxlbilcbiAgICAgICAgICAgIHtcblxuICAgICAgICAgICAgICAgIGludCBzdGFydHRpbWUgPSBtaWRpbm90ZXNbaV0uU3RhcnRUaW1lO1xuICAgICAgICAgICAgICAgIENsZWYgY2xlZiA9IGNsZWZzLkdldENsZWYoc3RhcnR0aW1lKTtcblxuICAgICAgICAgICAgICAgIC8qIEdyb3VwIGFsbCB0aGUgbWlkaSBub3RlcyB3aXRoIHRoZSBzYW1lIHN0YXJ0IHRpbWVcbiAgICAgICAgICAgICAgICAgKiBpbnRvIHRoZSBub3RlcyBsaXN0LlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIG5vdGVncm91cC5DbGVhcigpO1xuICAgICAgICAgICAgICAgIG5vdGVncm91cC5BZGQobWlkaW5vdGVzW2ldKTtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGkgPCBsZW4gJiYgbWlkaW5vdGVzW2ldLlN0YXJ0VGltZSA9PSBzdGFydHRpbWUpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBub3RlZ3JvdXAuQWRkKG1pZGlub3Rlc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvKiBDcmVhdGUgYSBzaW5nbGUgY2hvcmQgZnJvbSB0aGUgZ3JvdXAgb2YgbWlkaSBub3RlcyB3aXRoXG4gICAgICAgICAgICAgICAgICogdGhlIHNhbWUgc3RhcnQgdGltZS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBDaG9yZFN5bWJvbCBjaG9yZCA9IG5ldyBDaG9yZFN5bWJvbChub3RlZ3JvdXAsIGtleSwgdGltZSwgY2xlZiwgdGhpcyk7XG4gICAgICAgICAgICAgICAgY2hvcmRzLkFkZChjaG9yZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBjaG9yZHM7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogR2l2ZW4gdGhlIGNob3JkIHN5bWJvbHMgZm9yIGEgdHJhY2ssIGNyZWF0ZSBhIG5ldyBzeW1ib2wgbGlzdFxuICAgICAgICAgKiB0aGF0IGNvbnRhaW5zIHRoZSBjaG9yZCBzeW1ib2xzLCB2ZXJ0aWNhbCBiYXJzLCByZXN0cywgYW5kIGNsZWYgY2hhbmdlcy5cbiAgICAgICAgICogUmV0dXJuIGEgbGlzdCBvZiBzeW1ib2xzIChDaG9yZFN5bWJvbCwgQmFyU3ltYm9sLCBSZXN0U3ltYm9sLCBDbGVmU3ltYm9sKVxuICAgICAgICAgKi9cbiAgICAgICAgcHJpdmF0ZSBMaXN0PE11c2ljU3ltYm9sPlxuICAgICAgICBDcmVhdGVTeW1ib2xzKExpc3Q8Q2hvcmRTeW1ib2w+IGNob3JkcywgQ2xlZk1lYXN1cmVzIGNsZWZzLFxuICAgICAgICAgICAgICAgICAgICAgIFRpbWVTaWduYXR1cmUgdGltZSwgaW50IGxhc3RTdGFydClcbiAgICAgICAge1xuXG4gICAgICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzID0gbmV3IExpc3Q8TXVzaWNTeW1ib2w+KCk7XG4gICAgICAgICAgICBzeW1ib2xzID0gQWRkQmFycyhjaG9yZHMsIHRpbWUsIGxhc3RTdGFydCk7XG4gICAgICAgICAgICBzeW1ib2xzID0gQWRkUmVzdHMoc3ltYm9scywgdGltZSk7XG4gICAgICAgICAgICBzeW1ib2xzID0gQWRkQ2xlZkNoYW5nZXMoc3ltYm9scywgY2xlZnMsIHRpbWUpO1xuXG4gICAgICAgICAgICByZXR1cm4gc3ltYm9scztcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBBZGQgaW4gdGhlIHZlcnRpY2FsIGJhcnMgZGVsaW1pdGluZyBtZWFzdXJlcy4gXG4gICAgICAgICAqICBBbHNvLCBhZGQgdGhlIHRpbWUgc2lnbmF0dXJlIHN5bWJvbHMuXG4gICAgICAgICAqL1xuICAgICAgICBwcml2YXRlXG4gICAgICAgIExpc3Q8TXVzaWNTeW1ib2w+IEFkZEJhcnMoTGlzdDxDaG9yZFN5bWJvbD4gY2hvcmRzLCBUaW1lU2lnbmF0dXJlIHRpbWUsIGludCBsYXN0U3RhcnQpXG4gICAgICAgIHtcblxuICAgICAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scyA9IG5ldyBMaXN0PE11c2ljU3ltYm9sPigpO1xuXG4gICAgICAgICAgICBUaW1lU2lnU3ltYm9sIHRpbWVzaWcgPSBuZXcgVGltZVNpZ1N5bWJvbCh0aW1lLk51bWVyYXRvciwgdGltZS5EZW5vbWluYXRvcik7XG4gICAgICAgICAgICBzeW1ib2xzLkFkZCh0aW1lc2lnKTtcblxuICAgICAgICAgICAgLyogVGhlIHN0YXJ0dGltZSBvZiB0aGUgYmVnaW5uaW5nIG9mIHRoZSBtZWFzdXJlICovXG4gICAgICAgICAgICBpbnQgbWVhc3VyZXRpbWUgPSAwO1xuXG4gICAgICAgICAgICBpbnQgaSA9IDA7XG4gICAgICAgICAgICB3aGlsZSAoaSA8IGNob3Jkcy5Db3VudClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAobWVhc3VyZXRpbWUgPD0gY2hvcmRzW2ldLlN0YXJ0VGltZSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHN5bWJvbHMuQWRkKG5ldyBCYXJTeW1ib2wobWVhc3VyZXRpbWUpKTtcbiAgICAgICAgICAgICAgICAgICAgbWVhc3VyZXRpbWUgKz0gdGltZS5NZWFzdXJlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBzeW1ib2xzLkFkZChjaG9yZHNbaV0pO1xuICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBLZWVwIGFkZGluZyBiYXJzIHVudGlsIHRoZSBsYXN0IFN0YXJ0VGltZSAodGhlIGVuZCBvZiB0aGUgc29uZykgKi9cbiAgICAgICAgICAgIHdoaWxlIChtZWFzdXJldGltZSA8IGxhc3RTdGFydClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzeW1ib2xzLkFkZChuZXcgQmFyU3ltYm9sKG1lYXN1cmV0aW1lKSk7XG4gICAgICAgICAgICAgICAgbWVhc3VyZXRpbWUgKz0gdGltZS5NZWFzdXJlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBBZGQgdGhlIGZpbmFsIHZlcnRpY2FsIGJhciB0byB0aGUgbGFzdCBtZWFzdXJlICovXG4gICAgICAgICAgICBzeW1ib2xzLkFkZChuZXcgQmFyU3ltYm9sKG1lYXN1cmV0aW1lKSk7XG4gICAgICAgICAgICByZXR1cm4gc3ltYm9scztcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBBZGQgcmVzdCBzeW1ib2xzIGJldHdlZW4gbm90ZXMuICBBbGwgdGltZXMgYmVsb3cgYXJlIFxuICAgICAgICAgKiBtZWFzdXJlZCBpbiBwdWxzZXMuXG4gICAgICAgICAqL1xuICAgICAgICBwcml2YXRlXG4gICAgICAgIExpc3Q8TXVzaWNTeW1ib2w+IEFkZFJlc3RzKExpc3Q8TXVzaWNTeW1ib2w+IHN5bWJvbHMsIFRpbWVTaWduYXR1cmUgdGltZSlcbiAgICAgICAge1xuICAgICAgICAgICAgaW50IHByZXZ0aW1lID0gMDtcblxuICAgICAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD4gcmVzdWx0ID0gbmV3IExpc3Q8TXVzaWNTeW1ib2w+KHN5bWJvbHMuQ291bnQpO1xuXG4gICAgICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBzeW1ib2wgaW4gc3ltYm9scylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpbnQgc3RhcnR0aW1lID0gc3ltYm9sLlN0YXJ0VGltZTtcbiAgICAgICAgICAgICAgICBSZXN0U3ltYm9sW10gcmVzdHMgPSBHZXRSZXN0cyh0aW1lLCBwcmV2dGltZSwgc3RhcnR0aW1lKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdHMgIT0gbnVsbClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGZvcmVhY2ggKFJlc3RTeW1ib2wgciBpbiByZXN0cylcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LkFkZChyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJlc3VsdC5BZGQoc3ltYm9sKTtcblxuICAgICAgICAgICAgICAgIC8qIFNldCBwcmV2dGltZSB0byB0aGUgZW5kIHRpbWUgb2YgdGhlIGxhc3Qgbm90ZS9zeW1ib2wuICovXG4gICAgICAgICAgICAgICAgaWYgKHN5bWJvbCBpcyBDaG9yZFN5bWJvbClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIENob3JkU3ltYm9sIGNob3JkID0gKENob3JkU3ltYm9sKXN5bWJvbDtcbiAgICAgICAgICAgICAgICAgICAgcHJldnRpbWUgPSBNYXRoLk1heChjaG9yZC5FbmRUaW1lLCBwcmV2dGltZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHByZXZ0aW1lID0gTWF0aC5NYXgoc3RhcnR0aW1lLCBwcmV2dGltZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBSZXR1cm4gdGhlIHJlc3Qgc3ltYm9scyBuZWVkZWQgdG8gZmlsbCB0aGUgdGltZSBpbnRlcnZhbCBiZXR3ZWVuXG4gICAgICAgICAqIHN0YXJ0IGFuZCBlbmQuICBJZiBubyByZXN0cyBhcmUgbmVlZGVkLCByZXR1cm4gbmlsLlxuICAgICAgICAgKi9cbiAgICAgICAgcHJpdmF0ZVxuICAgICAgICBSZXN0U3ltYm9sW10gR2V0UmVzdHMoVGltZVNpZ25hdHVyZSB0aW1lLCBpbnQgc3RhcnQsIGludCBlbmQpXG4gICAgICAgIHtcbiAgICAgICAgICAgIFJlc3RTeW1ib2xbXSByZXN1bHQ7XG4gICAgICAgICAgICBSZXN0U3ltYm9sIHIxLCByMjtcblxuICAgICAgICAgICAgaWYgKGVuZCAtIHN0YXJ0IDwgMClcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICAgICAgTm90ZUR1cmF0aW9uIGR1ciA9IHRpbWUuR2V0Tm90ZUR1cmF0aW9uKGVuZCAtIHN0YXJ0KTtcbiAgICAgICAgICAgIHN3aXRjaCAoZHVyKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLldob2xlOlxuICAgICAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkhhbGY6XG4gICAgICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uUXVhcnRlcjpcbiAgICAgICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5FaWdodGg6XG4gICAgICAgICAgICAgICAgICAgIHIxID0gbmV3IFJlc3RTeW1ib2woc3RhcnQsIGR1cik7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBSZXN0U3ltYm9sW10geyByMSB9O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuXG4gICAgICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uRG90dGVkSGFsZjpcbiAgICAgICAgICAgICAgICAgICAgcjEgPSBuZXcgUmVzdFN5bWJvbChzdGFydCwgTm90ZUR1cmF0aW9uLkhhbGYpO1xuICAgICAgICAgICAgICAgICAgICByMiA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0ICsgdGltZS5RdWFydGVyICogMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOb3RlRHVyYXRpb24uUXVhcnRlcik7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBSZXN0U3ltYm9sW10geyByMSwgcjIgfTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcblxuICAgICAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkRvdHRlZFF1YXJ0ZXI6XG4gICAgICAgICAgICAgICAgICAgIHIxID0gbmV3IFJlc3RTeW1ib2woc3RhcnQsIE5vdGVEdXJhdGlvbi5RdWFydGVyKTtcbiAgICAgICAgICAgICAgICAgICAgcjIgPSBuZXcgUmVzdFN5bWJvbChzdGFydCArIHRpbWUuUXVhcnRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOb3RlRHVyYXRpb24uRWlnaHRoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbmV3IFJlc3RTeW1ib2xbXSB7IHIxLCByMiB9O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuXG4gICAgICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoOlxuICAgICAgICAgICAgICAgICAgICByMSA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0LCBOb3RlRHVyYXRpb24uRWlnaHRoKTtcbiAgICAgICAgICAgICAgICAgICAgcjIgPSBuZXcgUmVzdFN5bWJvbChzdGFydCArIHRpbWUuUXVhcnRlciAvIDIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTm90ZUR1cmF0aW9uLlNpeHRlZW50aCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBSZXN0U3ltYm9sW10geyByMSwgcjIgfTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcblxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqIFRoZSBjdXJyZW50IGNsZWYgaXMgYWx3YXlzIHNob3duIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIHN0YWZmLCBvblxuICAgICAgICAgKiB0aGUgbGVmdCBzaWRlLiAgSG93ZXZlciwgdGhlIGNsZWYgY2FuIGFsc28gY2hhbmdlIGZyb20gbWVhc3VyZSB0byBcbiAgICAgICAgICogbWVhc3VyZS4gV2hlbiBpdCBkb2VzLCBhIENsZWYgc3ltYm9sIG11c3QgYmUgc2hvd24gdG8gaW5kaWNhdGUgdGhlIFxuICAgICAgICAgKiBjaGFuZ2UgaW4gY2xlZi4gIFRoaXMgZnVuY3Rpb24gYWRkcyB0aGVzZSBDbGVmIGNoYW5nZSBzeW1ib2xzLlxuICAgICAgICAgKiBUaGlzIGZ1bmN0aW9uIGRvZXMgbm90IGFkZCB0aGUgbWFpbiBDbGVmIFN5bWJvbCB0aGF0IGJlZ2lucyBlYWNoXG4gICAgICAgICAqIHN0YWZmLiAgVGhhdCBpcyBkb25lIGluIHRoZSBTdGFmZigpIGNvbnRydWN0b3IuXG4gICAgICAgICAqL1xuICAgICAgICBwcml2YXRlXG4gICAgICAgIExpc3Q8TXVzaWNTeW1ib2w+IEFkZENsZWZDaGFuZ2VzKExpc3Q8TXVzaWNTeW1ib2w+IHN5bWJvbHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENsZWZNZWFzdXJlcyBjbGVmcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVGltZVNpZ25hdHVyZSB0aW1lKVxuICAgICAgICB7XG5cbiAgICAgICAgICAgIExpc3Q8TXVzaWNTeW1ib2w+IHJlc3VsdCA9IG5ldyBMaXN0PE11c2ljU3ltYm9sPihzeW1ib2xzLkNvdW50KTtcbiAgICAgICAgICAgIENsZWYgcHJldmNsZWYgPSBjbGVmcy5HZXRDbGVmKDApO1xuICAgICAgICAgICAgZm9yZWFjaCAoTXVzaWNTeW1ib2wgc3ltYm9sIGluIHN5bWJvbHMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgLyogQSBCYXJTeW1ib2wgaW5kaWNhdGVzIGEgbmV3IG1lYXN1cmUgKi9cbiAgICAgICAgICAgICAgICBpZiAoc3ltYm9sIGlzIEJhclN5bWJvbClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIENsZWYgY2xlZiA9IGNsZWZzLkdldENsZWYoc3ltYm9sLlN0YXJ0VGltZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjbGVmICE9IHByZXZjbGVmKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuQWRkKG5ldyBDbGVmU3ltYm9sKGNsZWYsIHN5bWJvbC5TdGFydFRpbWUgLSAxLCB0cnVlKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcHJldmNsZWYgPSBjbGVmO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXN1bHQuQWRkKHN5bWJvbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG5cblxuICAgICAgICAvKiogTm90ZXMgd2l0aCB0aGUgc2FtZSBzdGFydCB0aW1lcyBpbiBkaWZmZXJlbnQgc3RhZmZzIHNob3VsZCBiZVxuICAgICAgICAgKiB2ZXJ0aWNhbGx5IGFsaWduZWQuICBUaGUgU3ltYm9sV2lkdGhzIGNsYXNzIGlzIHVzZWQgdG8gaGVscCBcbiAgICAgICAgICogdmVydGljYWxseSBhbGlnbiBzeW1ib2xzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBGaXJzdCwgZWFjaCB0cmFjayBzaG91bGQgaGF2ZSBhIHN5bWJvbCBmb3IgZXZlcnkgc3RhcnR0aW1lIHRoYXRcbiAgICAgICAgICogYXBwZWFycyBpbiB0aGUgTWlkaSBGaWxlLiAgSWYgYSB0cmFjayBkb2Vzbid0IGhhdmUgYSBzeW1ib2wgZm9yIGFcbiAgICAgICAgICogcGFydGljdWxhciBzdGFydHRpbWUsIHRoZW4gYWRkIGEgXCJibGFua1wiIHN5bWJvbCBmb3IgdGhhdCB0aW1lLlxuICAgICAgICAgKlxuICAgICAgICAgKiBOZXh0LCBtYWtlIHN1cmUgdGhlIHN5bWJvbHMgZm9yIGVhY2ggc3RhcnQgdGltZSBhbGwgaGF2ZSB0aGUgc2FtZVxuICAgICAgICAgKiB3aWR0aCwgYWNyb3NzIGFsbCB0cmFja3MuICBUaGUgU3ltYm9sV2lkdGhzIGNsYXNzIHN0b3Jlc1xuICAgICAgICAgKiAtIFRoZSBzeW1ib2wgd2lkdGggZm9yIGVhY2ggc3RhcnR0aW1lLCBmb3IgZWFjaCB0cmFja1xuICAgICAgICAgKiAtIFRoZSBtYXhpbXVtIHN5bWJvbCB3aWR0aCBmb3IgYSBnaXZlbiBzdGFydHRpbWUsIGFjcm9zcyBhbGwgdHJhY2tzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBUaGUgbWV0aG9kIFN5bWJvbFdpZHRocy5HZXRFeHRyYVdpZHRoKCkgcmV0dXJucyB0aGUgZXh0cmEgd2lkdGhcbiAgICAgICAgICogbmVlZGVkIGZvciBhIHRyYWNrIHRvIG1hdGNoIHRoZSBtYXhpbXVtIHN5bWJvbCB3aWR0aCBmb3IgYSBnaXZlblxuICAgICAgICAgKiBzdGFydHRpbWUuXG4gICAgICAgICAqL1xuICAgICAgICBwcml2YXRlXG4gICAgICAgIHZvaWQgQWxpZ25TeW1ib2xzKExpc3Q8TXVzaWNTeW1ib2w+W10gYWxsc3ltYm9scywgU3ltYm9sV2lkdGhzIHdpZHRocywgTWlkaU9wdGlvbnMgb3B0aW9ucylcbiAgICAgICAge1xuXG4gICAgICAgICAgICAvLyBJZiB3ZSBzaG93IG1lYXN1cmUgbnVtYmVycywgaW5jcmVhc2UgYmFyIHN5bWJvbCB3aWR0aFxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuc2hvd01lYXN1cmVzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZvciAoaW50IHRyYWNrID0gMDsgdHJhY2sgPCBhbGxzeW1ib2xzLkxlbmd0aDsgdHJhY2srKylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIExpc3Q8TXVzaWNTeW1ib2w+IHN5bWJvbHMgPSBhbGxzeW1ib2xzW3RyYWNrXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yZWFjaCAoTXVzaWNTeW1ib2wgc3ltIGluIHN5bWJvbHMpXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzeW0gaXMgQmFyU3ltYm9sKVxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN5bS5XaWR0aCArPSBTaGVldE11c2ljLk5vdGVXaWR0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2sgPSAwOyB0cmFjayA8IGFsbHN5bWJvbHMuTGVuZ3RoOyB0cmFjaysrKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIExpc3Q8TXVzaWNTeW1ib2w+IHN5bWJvbHMgPSBhbGxzeW1ib2xzW3RyYWNrXTtcbiAgICAgICAgICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiByZXN1bHQgPSBuZXcgTGlzdDxNdXNpY1N5bWJvbD4oKTtcblxuICAgICAgICAgICAgICAgIGludCBpID0gMDtcblxuICAgICAgICAgICAgICAgIC8qIElmIGEgdHJhY2sgZG9lc24ndCBoYXZlIGEgc3ltYm9sIGZvciBhIHN0YXJ0dGltZSxcbiAgICAgICAgICAgICAgICAgKiBhZGQgYSBibGFuayBzeW1ib2wuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoaW50IHN0YXJ0IGluIHdpZHRocy5TdGFydFRpbWVzKVxuICAgICAgICAgICAgICAgIHtcblxuICAgICAgICAgICAgICAgICAgICAvKiBCYXJTeW1ib2xzIGFyZSBub3QgaW5jbHVkZWQgaW4gdGhlIFN5bWJvbFdpZHRocyBjYWxjdWxhdGlvbnMgKi9cbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGkgPCBzeW1ib2xzLkNvdW50ICYmIChzeW1ib2xzW2ldIGlzIEJhclN5bWJvbCkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHN5bWJvbHNbaV0uU3RhcnRUaW1lIDw9IHN0YXJ0KVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuQWRkKHN5bWJvbHNbaV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPCBzeW1ib2xzLkNvdW50ICYmIHN5bWJvbHNbaV0uU3RhcnRUaW1lID09IHN0YXJ0KVxuICAgICAgICAgICAgICAgICAgICB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgc3ltYm9scy5Db3VudCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN5bWJvbHNbaV0uU3RhcnRUaW1lID09IHN0YXJ0KVxuICAgICAgICAgICAgICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LkFkZChzeW1ib2xzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuQWRkKG5ldyBCbGFua1N5bWJvbChzdGFydCwgMCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLyogRm9yIGVhY2ggc3RhcnR0aW1lLCBpbmNyZWFzZSB0aGUgc3ltYm9sIHdpZHRoIGJ5XG4gICAgICAgICAgICAgICAgICogU3ltYm9sV2lkdGhzLkdldEV4dHJhV2lkdGgoKS5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpID0gMDtcbiAgICAgICAgICAgICAgICB3aGlsZSAoaSA8IHJlc3VsdC5Db3VudClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHRbaV0gaXMgQmFyU3ltYm9sKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpbnQgc3RhcnQgPSByZXN1bHRbaV0uU3RhcnRUaW1lO1xuICAgICAgICAgICAgICAgICAgICBpbnQgZXh0cmEgPSB3aWR0aHMuR2V0RXh0cmFXaWR0aCh0cmFjaywgc3RhcnQpO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRbaV0uV2lkdGggKz0gZXh0cmE7XG5cbiAgICAgICAgICAgICAgICAgICAgLyogU2tpcCBhbGwgcmVtYWluaW5nIHN5bWJvbHMgd2l0aCB0aGUgc2FtZSBzdGFydHRpbWUuICovXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgcmVzdWx0LkNvdW50ICYmIHJlc3VsdFtpXS5TdGFydFRpbWUgPT0gc3RhcnQpXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhbGxzeW1ib2xzW3RyYWNrXSA9IHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGJvb2wgSXNDaG9yZChNdXNpY1N5bWJvbCBzeW1ib2wpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBzeW1ib2wgaXMgQ2hvcmRTeW1ib2w7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8qKiBGaW5kIDIsIDMsIDQsIG9yIDYgY2hvcmQgc3ltYm9scyB0aGF0IG9jY3VyIGNvbnNlY3V0aXZlbHkgKHdpdGhvdXQgYW55XG4gICAgICAgICAqICByZXN0cyBvciBiYXJzIGluIGJldHdlZW4pLiAgVGhlcmUgY2FuIGJlIEJsYW5rU3ltYm9scyBpbiBiZXR3ZWVuLlxuICAgICAgICAgKlxuICAgICAgICAgKiAgVGhlIHN0YXJ0SW5kZXggaXMgdGhlIGluZGV4IGluIHRoZSBzeW1ib2xzIHRvIHN0YXJ0IGxvb2tpbmcgZnJvbS5cbiAgICAgICAgICpcbiAgICAgICAgICogIFN0b3JlIHRoZSBpbmRleGVzIG9mIHRoZSBjb25zZWN1dGl2ZSBjaG9yZHMgaW4gY2hvcmRJbmRleGVzLlxuICAgICAgICAgKiAgU3RvcmUgdGhlIGhvcml6b250YWwgZGlzdGFuY2UgKHBpeGVscykgYmV0d2VlbiB0aGUgZmlyc3QgYW5kIGxhc3QgY2hvcmQuXG4gICAgICAgICAqICBJZiB3ZSBmYWlsZWQgdG8gZmluZCBjb25zZWN1dGl2ZSBjaG9yZHMsIHJldHVybiBmYWxzZS5cbiAgICAgICAgICovXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGJvb2xcbiAgICAgICAgRmluZENvbnNlY3V0aXZlQ2hvcmRzKExpc3Q8TXVzaWNTeW1ib2w+IHN5bWJvbHMsIFRpbWVTaWduYXR1cmUgdGltZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludCBzdGFydEluZGV4LCBpbnRbXSBjaG9yZEluZGV4ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWYgaW50IGhvcml6RGlzdGFuY2UpXG4gICAgICAgIHtcblxuICAgICAgICAgICAgaW50IGkgPSBzdGFydEluZGV4O1xuICAgICAgICAgICAgaW50IG51bUNob3JkcyA9IGNob3JkSW5kZXhlcy5MZW5ndGg7XG5cbiAgICAgICAgICAgIHdoaWxlICh0cnVlKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGhvcml6RGlzdGFuY2UgPSAwO1xuXG4gICAgICAgICAgICAgICAgLyogRmluZCB0aGUgc3RhcnRpbmcgY2hvcmQgKi9cbiAgICAgICAgICAgICAgICB3aGlsZSAoaSA8IHN5bWJvbHMuQ291bnQgLSBudW1DaG9yZHMpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3ltYm9sc1tpXSBpcyBDaG9yZFN5bWJvbClcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgQ2hvcmRTeW1ib2wgYyA9IChDaG9yZFN5bWJvbClzeW1ib2xzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGMuU3RlbSAhPSBudWxsKVxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGkgPj0gc3ltYm9scy5Db3VudCAtIG51bUNob3JkcylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNob3JkSW5kZXhlc1swXSA9IC0xO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNob3JkSW5kZXhlc1swXSA9IGk7XG4gICAgICAgICAgICAgICAgYm9vbCBmb3VuZENob3JkcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgZm9yIChpbnQgY2hvcmRJbmRleCA9IDE7IGNob3JkSW5kZXggPCBudW1DaG9yZHM7IGNob3JkSW5kZXgrKylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgaW50IHJlbWFpbmluZyA9IG51bUNob3JkcyAtIDEgLSBjaG9yZEluZGV4O1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoKGkgPCBzeW1ib2xzLkNvdW50IC0gcmVtYWluaW5nKSAmJiAoc3ltYm9sc1tpXSBpcyBCbGFua1N5bWJvbCkpXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvcml6RGlzdGFuY2UgKz0gc3ltYm9sc1tpXS5XaWR0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoaSA+PSBzeW1ib2xzLkNvdW50IC0gcmVtYWluaW5nKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCEoc3ltYm9sc1tpXSBpcyBDaG9yZFN5bWJvbCkpXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kQ2hvcmRzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjaG9yZEluZGV4ZXNbY2hvcmRJbmRleF0gPSBpO1xuICAgICAgICAgICAgICAgICAgICBob3JpekRpc3RhbmNlICs9IHN5bWJvbHNbaV0uV2lkdGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChmb3VuZENob3JkcylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8qIEVsc2UsIHN0YXJ0IHNlYXJjaGluZyBhZ2FpbiBmcm9tIGluZGV4IGkgKi9cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cbiAgICAgICAgLyoqIENvbm5lY3QgY2hvcmRzIG9mIHRoZSBzYW1lIGR1cmF0aW9uIHdpdGggYSBob3Jpem9udGFsIGJlYW0uXG4gICAgICAgICAqICBudW1DaG9yZHMgaXMgdGhlIG51bWJlciBvZiBjaG9yZHMgcGVyIGJlYW0gKDIsIDMsIDQsIG9yIDYpLlxuICAgICAgICAgKiAgaWYgc3RhcnRCZWF0IGlzIHRydWUsIHRoZSBmaXJzdCBjaG9yZCBtdXN0IHN0YXJ0IG9uIGEgcXVhcnRlciBub3RlIGJlYXQuXG4gICAgICAgICAqL1xuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkXG4gICAgICAgIENyZWF0ZUJlYW1lZENob3JkcyhMaXN0PE11c2ljU3ltYm9sPltdIGFsbHN5bWJvbHMsIFRpbWVTaWduYXR1cmUgdGltZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGludCBudW1DaG9yZHMsIGJvb2wgc3RhcnRCZWF0KVxuICAgICAgICB7XG4gICAgICAgICAgICBpbnRbXSBjaG9yZEluZGV4ZXMgPSBuZXcgaW50W251bUNob3Jkc107XG4gICAgICAgICAgICBDaG9yZFN5bWJvbFtdIGNob3JkcyA9IG5ldyBDaG9yZFN5bWJvbFtudW1DaG9yZHNdO1xuXG4gICAgICAgICAgICBmb3JlYWNoIChMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzIGluIGFsbHN5bWJvbHMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaW50IHN0YXJ0SW5kZXggPSAwO1xuICAgICAgICAgICAgICAgIHdoaWxlICh0cnVlKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaW50IGhvcml6RGlzdGFuY2UgPSAwO1xuICAgICAgICAgICAgICAgICAgICBib29sIGZvdW5kID0gRmluZENvbnNlY3V0aXZlQ2hvcmRzKHN5bWJvbHMsIHRpbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaG9yZEluZGV4ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmIGhvcml6RGlzdGFuY2UpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWZvdW5kKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IG51bUNob3JkczsgaSsrKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaG9yZHNbaV0gPSAoQ2hvcmRTeW1ib2wpc3ltYm9sc1tjaG9yZEluZGV4ZXNbaV1dO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKENob3JkU3ltYm9sLkNhbkNyZWF0ZUJlYW0oY2hvcmRzLCB0aW1lLCBzdGFydEJlYXQpKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBDaG9yZFN5bWJvbC5DcmVhdGVCZWFtKGNob3JkcywgaG9yaXpEaXN0YW5jZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydEluZGV4ID0gY2hvcmRJbmRleGVzW251bUNob3JkcyAtIDFdICsgMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0SW5kZXggPSBjaG9yZEluZGV4ZXNbMF0gKyAxO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLyogV2hhdCBpcyB0aGUgdmFsdWUgb2Ygc3RhcnRJbmRleCBoZXJlP1xuICAgICAgICAgICAgICAgICAgICAgKiBJZiB3ZSBjcmVhdGVkIGEgYmVhbSwgd2Ugc3RhcnQgYWZ0ZXIgdGhlIGxhc3QgY2hvcmQuXG4gICAgICAgICAgICAgICAgICAgICAqIElmIHdlIGZhaWxlZCB0byBjcmVhdGUgYSBiZWFtLCB3ZSBzdGFydCBhZnRlciB0aGUgZmlyc3QgY2hvcmQuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cbiAgICAgICAgLyoqIENvbm5lY3QgY2hvcmRzIG9mIHRoZSBzYW1lIGR1cmF0aW9uIHdpdGggYSBob3Jpem9udGFsIGJlYW0uXG4gICAgICAgICAqXG4gICAgICAgICAqICBXZSBjcmVhdGUgYmVhbXMgaW4gdGhlIGZvbGxvd2luZyBvcmRlcjpcbiAgICAgICAgICogIC0gNiBjb25uZWN0ZWQgOHRoIG5vdGUgY2hvcmRzLCBpbiAzLzQsIDYvOCwgb3IgNi80IHRpbWVcbiAgICAgICAgICogIC0gVHJpcGxldHMgdGhhdCBzdGFydCBvbiBxdWFydGVyIG5vdGUgYmVhdHNcbiAgICAgICAgICogIC0gMyBjb25uZWN0ZWQgY2hvcmRzIHRoYXQgc3RhcnQgb24gcXVhcnRlciBub3RlIGJlYXRzICgxMi84IHRpbWUgb25seSlcbiAgICAgICAgICogIC0gNCBjb25uZWN0ZWQgY2hvcmRzIHRoYXQgc3RhcnQgb24gcXVhcnRlciBub3RlIGJlYXRzICg0LzQgb3IgMi80IHRpbWUgb25seSlcbiAgICAgICAgICogIC0gMiBjb25uZWN0ZWQgY2hvcmRzIHRoYXQgc3RhcnQgb24gcXVhcnRlciBub3RlIGJlYXRzXG4gICAgICAgICAqICAtIDIgY29ubmVjdGVkIGNob3JkcyB0aGF0IHN0YXJ0IG9uIGFueSBiZWF0XG4gICAgICAgICAqL1xuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkXG4gICAgICAgIENyZWF0ZUFsbEJlYW1lZENob3JkcyhMaXN0PE11c2ljU3ltYm9sPltdIGFsbHN5bWJvbHMsIFRpbWVTaWduYXR1cmUgdGltZSlcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKCh0aW1lLk51bWVyYXRvciA9PSAzICYmIHRpbWUuRGVub21pbmF0b3IgPT0gNCkgfHxcbiAgICAgICAgICAgICAgICAodGltZS5OdW1lcmF0b3IgPT0gNiAmJiB0aW1lLkRlbm9taW5hdG9yID09IDgpIHx8XG4gICAgICAgICAgICAgICAgKHRpbWUuTnVtZXJhdG9yID09IDYgJiYgdGltZS5EZW5vbWluYXRvciA9PSA0KSlcbiAgICAgICAgICAgIHtcblxuICAgICAgICAgICAgICAgIENyZWF0ZUJlYW1lZENob3JkcyhhbGxzeW1ib2xzLCB0aW1lLCA2LCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIENyZWF0ZUJlYW1lZENob3JkcyhhbGxzeW1ib2xzLCB0aW1lLCAzLCB0cnVlKTtcbiAgICAgICAgICAgIENyZWF0ZUJlYW1lZENob3JkcyhhbGxzeW1ib2xzLCB0aW1lLCA0LCB0cnVlKTtcbiAgICAgICAgICAgIENyZWF0ZUJlYW1lZENob3JkcyhhbGxzeW1ib2xzLCB0aW1lLCAyLCB0cnVlKTtcbiAgICAgICAgICAgIENyZWF0ZUJlYW1lZENob3JkcyhhbGxzeW1ib2xzLCB0aW1lLCAyLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogR2V0IHRoZSB3aWR0aCAoaW4gcGl4ZWxzKSBuZWVkZWQgdG8gZGlzcGxheSB0aGUga2V5IHNpZ25hdHVyZSAqL1xuICAgICAgICBwdWJsaWMgc3RhdGljIGludFxuICAgICAgICBLZXlTaWduYXR1cmVXaWR0aChLZXlTaWduYXR1cmUga2V5KVxuICAgICAgICB7XG4gICAgICAgICAgICBDbGVmU3ltYm9sIGNsZWZzeW0gPSBuZXcgQ2xlZlN5bWJvbChDbGVmLlRyZWJsZSwgMCwgZmFsc2UpO1xuICAgICAgICAgICAgaW50IHJlc3VsdCA9IGNsZWZzeW0uTWluV2lkdGg7XG4gICAgICAgICAgICBBY2NpZFN5bWJvbFtdIGtleXMgPSBrZXkuR2V0U3ltYm9scyhDbGVmLlRyZWJsZSk7XG4gICAgICAgICAgICBmb3JlYWNoIChBY2NpZFN5bWJvbCBzeW1ib2wgaW4ga2V5cylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gc3ltYm9sLk1pbldpZHRoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdCArIFNoZWV0TXVzaWMuTGVmdE1hcmdpbiArIDU7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8qKiBHaXZlbiBNdXNpY1N5bWJvbHMgZm9yIGEgdHJhY2ssIGNyZWF0ZSB0aGUgc3RhZmZzIGZvciB0aGF0IHRyYWNrLlxuICAgICAgICAgKiAgRWFjaCBTdGFmZiBoYXMgYSBtYXhtaW11bSB3aWR0aCBvZiBQYWdlV2lkdGggKDgwMCBwaXhlbHMpLlxuICAgICAgICAgKiAgQWxzbywgbWVhc3VyZXMgc2hvdWxkIG5vdCBzcGFuIG11bHRpcGxlIFN0YWZmcy5cbiAgICAgICAgICovXG4gICAgICAgIHByaXZhdGUgTGlzdDxTdGFmZj5cbiAgICAgICAgQ3JlYXRlU3RhZmZzRm9yVHJhY2soTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scywgaW50IG1lYXN1cmVsZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIEtleVNpZ25hdHVyZSBrZXksIE1pZGlPcHRpb25zIG9wdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludCB0cmFjaywgaW50IHRvdGFsdHJhY2tzKVxuICAgICAgICB7XG4gICAgICAgICAgICBpbnQga2V5c2lnV2lkdGggPSBLZXlTaWduYXR1cmVXaWR0aChrZXkpO1xuICAgICAgICAgICAgaW50IHN0YXJ0aW5kZXggPSAwO1xuICAgICAgICAgICAgTGlzdDxTdGFmZj4gdGhlc3RhZmZzID0gbmV3IExpc3Q8U3RhZmY+KHN5bWJvbHMuQ291bnQgLyA1MCk7XG5cbiAgICAgICAgICAgIHdoaWxlIChzdGFydGluZGV4IDwgc3ltYm9scy5Db3VudClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAvKiBzdGFydGluZGV4IGlzIHRoZSBpbmRleCBvZiB0aGUgZmlyc3Qgc3ltYm9sIGluIHRoZSBzdGFmZi5cbiAgICAgICAgICAgICAgICAgKiBlbmRpbmRleCBpcyB0aGUgaW5kZXggb2YgdGhlIGxhc3Qgc3ltYm9sIGluIHRoZSBzdGFmZi5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpbnQgZW5kaW5kZXggPSBzdGFydGluZGV4O1xuICAgICAgICAgICAgICAgIGludCB3aWR0aCA9IGtleXNpZ1dpZHRoO1xuICAgICAgICAgICAgICAgIGludCBtYXh3aWR0aDtcblxuICAgICAgICAgICAgICAgIC8qIElmIHdlJ3JlIHNjcm9sbGluZyB2ZXJ0aWNhbGx5LCB0aGUgbWF4aW11bSB3aWR0aCBpcyBQYWdlV2lkdGguICovXG4gICAgICAgICAgICAgICAgaWYgKHNjcm9sbFZlcnQpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBtYXh3aWR0aCA9IFNoZWV0TXVzaWMuUGFnZVdpZHRoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBtYXh3aWR0aCA9IDIwMDAwMDA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd2hpbGUgKGVuZGluZGV4IDwgc3ltYm9scy5Db3VudCAmJlxuICAgICAgICAgICAgICAgICAgICAgICB3aWR0aCArIHN5bWJvbHNbZW5kaW5kZXhdLldpZHRoIDwgbWF4d2lkdGgpXG4gICAgICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoICs9IHN5bWJvbHNbZW5kaW5kZXhdLldpZHRoO1xuICAgICAgICAgICAgICAgICAgICBlbmRpbmRleCsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbmRpbmRleC0tO1xuXG4gICAgICAgICAgICAgICAgLyogVGhlcmUncyAzIHBvc3NpYmlsaXRpZXMgYXQgdGhpcyBwb2ludDpcbiAgICAgICAgICAgICAgICAgKiAxLiBXZSBoYXZlIGFsbCB0aGUgc3ltYm9scyBpbiB0aGUgdHJhY2suXG4gICAgICAgICAgICAgICAgICogICAgVGhlIGVuZGluZGV4IHN0YXlzIHRoZSBzYW1lLlxuICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICogMi4gV2UgaGF2ZSBzeW1ib2xzIGZvciBsZXNzIHRoYW4gb25lIG1lYXN1cmUuXG4gICAgICAgICAgICAgICAgICogICAgVGhlIGVuZGluZGV4IHN0YXlzIHRoZSBzYW1lLlxuICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICogMy4gV2UgaGF2ZSBzeW1ib2xzIGZvciAxIG9yIG1vcmUgbWVhc3VyZXMuXG4gICAgICAgICAgICAgICAgICogICAgU2luY2UgbWVhc3VyZXMgY2Fubm90IHNwYW4gbXVsdGlwbGUgc3RhZmZzLCB3ZSBtdXN0XG4gICAgICAgICAgICAgICAgICogICAgbWFrZSBzdXJlIGVuZGluZGV4IGRvZXMgbm90IG9jY3VyIGluIHRoZSBtaWRkbGUgb2YgYVxuICAgICAgICAgICAgICAgICAqICAgIG1lYXN1cmUuICBXZSBjb3VudCBiYWNrd2FyZHMgdW50aWwgd2UgY29tZSB0byB0aGUgZW5kXG4gICAgICAgICAgICAgICAgICogICAgb2YgYSBtZWFzdXJlLlxuICAgICAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAgICAgaWYgKGVuZGluZGV4ID09IHN5bWJvbHMuQ291bnQgLSAxKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgLyogZW5kaW5kZXggc3RheXMgdGhlIHNhbWUgKi9cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc3ltYm9sc1tzdGFydGluZGV4XS5TdGFydFRpbWUgLyBtZWFzdXJlbGVuID09XG4gICAgICAgICAgICAgICAgICAgICAgICAgc3ltYm9sc1tlbmRpbmRleF0uU3RhcnRUaW1lIC8gbWVhc3VyZWxlbilcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIC8qIGVuZGluZGV4IHN0YXlzIHRoZSBzYW1lICovXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGludCBlbmRtZWFzdXJlID0gc3ltYm9sc1tlbmRpbmRleCArIDFdLlN0YXJ0VGltZSAvIG1lYXN1cmVsZW47XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChzeW1ib2xzW2VuZGluZGV4XS5TdGFydFRpbWUgLyBtZWFzdXJlbGVuID09XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBlbmRtZWFzdXJlKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRpbmRleC0tO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGludCByYW5nZSA9IGVuZGluZGV4ICsgMSAtIHN0YXJ0aW5kZXg7XG4gICAgICAgICAgICAgICAgaWYgKHNjcm9sbFZlcnQpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IFNoZWV0TXVzaWMuUGFnZVdpZHRoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBTdGFmZiBzdGFmZiA9IG5ldyBTdGFmZihzeW1ib2xzLkdldFJhbmdlKHN0YXJ0aW5kZXgsIHJhbmdlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXksIG9wdGlvbnMsIHRyYWNrLCB0b3RhbHRyYWNrcyk7XG4gICAgICAgICAgICAgICAgdGhlc3RhZmZzLkFkZChzdGFmZik7XG4gICAgICAgICAgICAgICAgc3RhcnRpbmRleCA9IGVuZGluZGV4ICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGVzdGFmZnM7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8qKiBHaXZlbiBhbGwgdGhlIE11c2ljU3ltYm9scyBmb3IgZXZlcnkgdHJhY2ssIGNyZWF0ZSB0aGUgc3RhZmZzXG4gICAgICAgICAqIGZvciB0aGUgc2hlZXQgbXVzaWMuICBUaGVyZSBhcmUgdHdvIHBhcnRzIHRvIHRoaXM6XG4gICAgICAgICAqXG4gICAgICAgICAqIC0gR2V0IHRoZSBsaXN0IG9mIHN0YWZmcyBmb3IgZWFjaCB0cmFjay5cbiAgICAgICAgICogICBUaGUgc3RhZmZzIHdpbGwgYmUgc3RvcmVkIGluIHRyYWNrc3RhZmZzIGFzOlxuICAgICAgICAgKlxuICAgICAgICAgKiAgIHRyYWNrc3RhZmZzWzBdID0geyBTdGFmZjAsIFN0YWZmMSwgU3RhZmYyLCAuLi4gfSBmb3IgdHJhY2sgMFxuICAgICAgICAgKiAgIHRyYWNrc3RhZmZzWzFdID0geyBTdGFmZjAsIFN0YWZmMSwgU3RhZmYyLCAuLi4gfSBmb3IgdHJhY2sgMVxuICAgICAgICAgKiAgIHRyYWNrc3RhZmZzWzJdID0geyBTdGFmZjAsIFN0YWZmMSwgU3RhZmYyLCAuLi4gfSBmb3IgdHJhY2sgMlxuICAgICAgICAgKlxuICAgICAgICAgKiAtIFN0b3JlIHRoZSBTdGFmZnMgaW4gdGhlIHN0YWZmcyBsaXN0LCBidXQgaW50ZXJsZWF2ZSB0aGVcbiAgICAgICAgICogICB0cmFja3MgYXMgZm9sbG93czpcbiAgICAgICAgICpcbiAgICAgICAgICogICBzdGFmZnMgPSB7IFN0YWZmMCBmb3IgdHJhY2sgMCwgU3RhZmYwIGZvciB0cmFjazEsIFN0YWZmMCBmb3IgdHJhY2syLFxuICAgICAgICAgKiAgICAgICAgICAgICAgU3RhZmYxIGZvciB0cmFjayAwLCBTdGFmZjEgZm9yIHRyYWNrMSwgU3RhZmYxIGZvciB0cmFjazIsXG4gICAgICAgICAqICAgICAgICAgICAgICBTdGFmZjIgZm9yIHRyYWNrIDAsIFN0YWZmMiBmb3IgdHJhY2sxLCBTdGFmZjIgZm9yIHRyYWNrMixcbiAgICAgICAgICogICAgICAgICAgICAgIC4uLiB9IFxuICAgICAgICAgKi9cbiAgICAgICAgcHJpdmF0ZSBMaXN0PFN0YWZmPlxuICAgICAgICBDcmVhdGVTdGFmZnMoTGlzdDxNdXNpY1N5bWJvbD5bXSBhbGxzeW1ib2xzLCBLZXlTaWduYXR1cmUga2V5LFxuICAgICAgICAgICAgICAgICAgICAgTWlkaU9wdGlvbnMgb3B0aW9ucywgaW50IG1lYXN1cmVsZW4pXG4gICAgICAgIHtcblxuICAgICAgICAgICAgTGlzdDxTdGFmZj5bXSB0cmFja3N0YWZmcyA9IG5ldyBMaXN0PFN0YWZmPlthbGxzeW1ib2xzLkxlbmd0aF07XG4gICAgICAgICAgICBpbnQgdG90YWx0cmFja3MgPSB0cmFja3N0YWZmcy5MZW5ndGg7XG5cbiAgICAgICAgICAgIGZvciAoaW50IHRyYWNrID0gMDsgdHJhY2sgPCB0b3RhbHRyYWNrczsgdHJhY2srKylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzID0gYWxsc3ltYm9sc1t0cmFja107XG4gICAgICAgICAgICAgICAgdHJhY2tzdGFmZnNbdHJhY2tdID0gQ3JlYXRlU3RhZmZzRm9yVHJhY2soc3ltYm9scywgbWVhc3VyZWxlbiwga2V5LCBvcHRpb25zLCB0cmFjaywgdG90YWx0cmFja3MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBVcGRhdGUgdGhlIEVuZFRpbWUgb2YgZWFjaCBTdGFmZi4gRW5kVGltZSBpcyB1c2VkIGZvciBwbGF5YmFjayAqL1xuICAgICAgICAgICAgZm9yZWFjaCAoTGlzdDxTdGFmZj4gbGlzdCBpbiB0cmFja3N0YWZmcylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IGxpc3QuQ291bnQgLSAxOyBpKyspXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsaXN0W2ldLkVuZFRpbWUgPSBsaXN0W2kgKyAxXS5TdGFydFRpbWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBJbnRlcmxlYXZlIHRoZSBzdGFmZnMgb2YgZWFjaCB0cmFjayBpbnRvIHRoZSByZXN1bHQgYXJyYXkuICovXG4gICAgICAgICAgICBpbnQgbWF4c3RhZmZzID0gMDtcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgdHJhY2tzdGFmZnMuTGVuZ3RoOyBpKyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKG1heHN0YWZmcyA8IHRyYWNrc3RhZmZzW2ldLkNvdW50KVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbWF4c3RhZmZzID0gdHJhY2tzdGFmZnNbaV0uQ291bnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgTGlzdDxTdGFmZj4gcmVzdWx0ID0gbmV3IExpc3Q8U3RhZmY+KG1heHN0YWZmcyAqIHRyYWNrc3RhZmZzLkxlbmd0aCk7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IG1heHN0YWZmczsgaSsrKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZvcmVhY2ggKExpc3Q8U3RhZmY+IGxpc3QgaW4gdHJhY2tzdGFmZnMpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSA8IGxpc3QuQ291bnQpXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5BZGQobGlzdFtpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqIEdldCB0aGUgbHlyaWNzIGZvciBlYWNoIHRyYWNrICovXG4gICAgICAgIHByaXZhdGUgc3RhdGljIExpc3Q8THlyaWNTeW1ib2w+W11cbiAgICAgICAgR2V0THlyaWNzKExpc3Q8TWlkaVRyYWNrPiB0cmFja3MpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGJvb2wgaGFzTHlyaWNzID0gZmFsc2U7XG4gICAgICAgICAgICBMaXN0PEx5cmljU3ltYm9sPltdIHJlc3VsdCA9IG5ldyBMaXN0PEx5cmljU3ltYm9sPlt0cmFja3MuQ291bnRdO1xuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IHRyYWNrcy5Db3VudDsgdHJhY2tudW0rKylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBNaWRpVHJhY2sgdHJhY2sgPSB0cmFja3NbdHJhY2tudW1dO1xuICAgICAgICAgICAgICAgIGlmICh0cmFjay5MeXJpY3MgPT0gbnVsbClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBoYXNMeXJpY3MgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJlc3VsdFt0cmFja251bV0gPSBuZXcgTGlzdDxMeXJpY1N5bWJvbD4oKTtcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgZXYgaW4gdHJhY2suTHlyaWNzKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgU3RyaW5nIHRleHQgPSBVVEY4RW5jb2RpbmcuVVRGOC5HZXRTdHJpbmcoZXYuVmFsdWUsIDAsIGV2LlZhbHVlLkxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIEx5cmljU3ltYm9sIHN5bSA9IG5ldyBMeXJpY1N5bWJvbChldi5TdGFydFRpbWUsIHRleHQpO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRbdHJhY2tudW1dLkFkZChzeW0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaGFzTHlyaWNzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiogQWRkIHRoZSBseXJpYyBzeW1ib2xzIHRvIHRoZSBjb3JyZXNwb25kaW5nIHN0YWZmcyAqL1xuICAgICAgICBzdGF0aWMgdm9pZFxuICAgICAgICBBZGRMeXJpY3NUb1N0YWZmcyhMaXN0PFN0YWZmPiBzdGFmZnMsIExpc3Q8THlyaWNTeW1ib2w+W10gdHJhY2tseXJpY3MpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZvcmVhY2ggKFN0YWZmIHN0YWZmIGluIHN0YWZmcylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBMaXN0PEx5cmljU3ltYm9sPiBseXJpY3MgPSB0cmFja2x5cmljc1tzdGFmZi5UcmFja107XG4gICAgICAgICAgICAgICAgc3RhZmYuQWRkTHlyaWNzKGx5cmljcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8qKiBTZXQgdGhlIHpvb20gbGV2ZWwgdG8gZGlzcGxheSBhdCAoMS4wID09IDEwMCUpLlxuICAgICAgICAgKiBSZWNhbGN1bGF0ZSB0aGUgU2hlZXRNdXNpYyB3aWR0aCBhbmQgaGVpZ2h0IGJhc2VkIG9uIHRoZVxuICAgICAgICAgKiB6b29tIGxldmVsLiAgVGhlbiByZWRyYXcgdGhlIFNoZWV0TXVzaWMuIFxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIHZvaWQgU2V0Wm9vbShmbG9hdCB2YWx1ZSlcbiAgICAgICAge1xuICAgICAgICAgICAgem9vbSA9IHZhbHVlO1xuICAgICAgICAgICAgZmxvYXQgd2lkdGggPSAwO1xuICAgICAgICAgICAgZmxvYXQgaGVpZ2h0ID0gMDtcbiAgICAgICAgICAgIGZvcmVhY2ggKFN0YWZmIHN0YWZmIGluIHN0YWZmcylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB3aWR0aCA9IE1hdGguTWF4KHdpZHRoLCBzdGFmZi5XaWR0aCAqIHpvb20pO1xuICAgICAgICAgICAgICAgIGhlaWdodCArPSAoc3RhZmYuSGVpZ2h0ICogem9vbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBXaWR0aCA9IChpbnQpKHdpZHRoICsgMik7XG4gICAgICAgICAgICBIZWlnaHQgPSAoKGludCloZWlnaHQpICsgTGVmdE1hcmdpbjtcbiAgICAgICAgICAgIHRoaXMuSW52YWxpZGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqIENoYW5nZSB0aGUgbm90ZSBjb2xvcnMgZm9yIHRoZSBzaGVldCBtdXNpYywgYW5kIHJlZHJhdy4gKi9cbiAgICAgICAgcHJpdmF0ZSB2b2lkIFNldENvbG9ycyhDb2xvcltdIG5ld2NvbG9ycywgQ29sb3IgbmV3c2hhZGUsIENvbG9yIG5ld3NoYWRlMilcbiAgICAgICAge1xuICAgICAgICAgICAgaWYgKE5vdGVDb2xvcnMgPT0gbnVsbClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBOb3RlQ29sb3JzID0gbmV3IENvbG9yWzEyXTtcbiAgICAgICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDEyOyBpKyspXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBOb3RlQ29sb3JzW2ldID0gQ29sb3IuQmxhY2s7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5ld2NvbG9ycyAhPSBudWxsKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgMTI7IGkrKylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIE5vdGVDb2xvcnNbaV0gPSBuZXdjb2xvcnNbaV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgMTI7IGkrKylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIE5vdGVDb2xvcnNbaV0gPSBDb2xvci5CbGFjaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2hhZGVCcnVzaCAhPSBudWxsKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHNoYWRlQnJ1c2guRGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgIHNoYWRlMkJydXNoLkRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNoYWRlQnJ1c2ggPSBuZXcgU29saWRCcnVzaChuZXdzaGFkZSk7XG4gICAgICAgICAgICBzaGFkZTJCcnVzaCA9IG5ldyBTb2xpZEJydXNoKG5ld3NoYWRlMik7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogR2V0IHRoZSBjb2xvciBmb3IgYSBnaXZlbiBub3RlIG51bWJlciAqL1xuICAgICAgICBwdWJsaWMgQ29sb3IgTm90ZUNvbG9yKGludCBudW1iZXIpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBOb3RlQ29sb3JzW05vdGVTY2FsZS5Gcm9tTnVtYmVyKG51bWJlcildO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqIEdldCB0aGUgc2hhZGUgYnJ1c2ggKi9cbiAgICAgICAgcHVibGljIEJydXNoIFNoYWRlQnJ1c2hcbiAgICAgICAge1xuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIHNoYWRlQnJ1c2g7IH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBHZXQgdGhlIHNoYWRlMiBicnVzaCAqL1xuICAgICAgICBwdWJsaWMgQnJ1c2ggU2hhZGUyQnJ1c2hcbiAgICAgICAge1xuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIHNoYWRlMkJydXNoOyB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiogR2V0IHdoZXRoZXIgdG8gc2hvdyBub3RlIGxldHRlcnMgb3Igbm90ICovXG4gICAgICAgIHB1YmxpYyBpbnQgU2hvd05vdGVMZXR0ZXJzXG4gICAgICAgIHtcbiAgICAgICAgICAgIGdldCB7IHJldHVybiBzaG93Tm90ZUxldHRlcnM7IH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBHZXQgdGhlIG1haW4ga2V5IHNpZ25hdHVyZSAqL1xuICAgICAgICBwdWJsaWMgS2V5U2lnbmF0dXJlIE1haW5LZXlcbiAgICAgICAge1xuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIG1haW5rZXk7IH1cbiAgICAgICAgfVxuXG5cbiAgICAgICAgLyoqIFNldCB0aGUgc2l6ZSBvZiB0aGUgbm90ZXMsIGxhcmdlIG9yIHNtYWxsLiAgU21hbGxlciBub3RlcyBtZWFuc1xuICAgICAgICAgKiBtb3JlIG5vdGVzIHBlciBzdGFmZi5cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBTZXROb3RlU2l6ZShib29sIGxhcmdlbm90ZXMpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmIChsYXJnZW5vdGVzKVxuICAgICAgICAgICAgICAgIExpbmVTcGFjZSA9IDc7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgTGluZVNwYWNlID0gNTtcblxuICAgICAgICAgICAgU3RhZmZIZWlnaHQgPSBMaW5lU3BhY2UgKiA0ICsgTGluZVdpZHRoICogNTtcbiAgICAgICAgICAgIE5vdGVIZWlnaHQgPSBMaW5lU3BhY2UgKyBMaW5lV2lkdGg7XG4gICAgICAgICAgICBOb3RlV2lkdGggPSAzICogTGluZVNwYWNlIC8gMjtcbiAgICAgICAgICAgIExldHRlckZvbnQgPSBuZXcgRm9udChcIkFyaWFsXCIsIDgsIEZvbnRTdHlsZS5SZWd1bGFyKTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLyoqIERyYXcgdGhlIFNoZWV0TXVzaWMuXG4gICAgICAgICAqIFNjYWxlIHRoZSBncmFwaGljcyBieSB0aGUgY3VycmVudCB6b29tIGZhY3Rvci5cbiAgICAgICAgICogR2V0IHRoZSB2ZXJ0aWNhbCBzdGFydCBhbmQgZW5kIHBvaW50cyBvZiB0aGUgY2xpcCBhcmVhLlxuICAgICAgICAgKiBPbmx5IGRyYXcgU3RhZmZzIHdoaWNoIGxpZSBpbnNpZGUgdGhlIGNsaXAgYXJlYS5cbiAgICAgICAgICovXG4gICAgICAgIHByb3RlY3RlZCAvKm92ZXJyaWRlKi8gdm9pZCBPblBhaW50KFBhaW50RXZlbnRBcmdzIGUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIFJlY3RhbmdsZSBjbGlwID1cbiAgICAgICAgICAgICAgbmV3IFJlY3RhbmdsZSgoaW50KShlLkNsaXBSZWN0YW5nbGUuWCAvIHpvb20pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChpbnQpKGUuQ2xpcFJlY3RhbmdsZS5ZIC8gem9vbSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGludCkoZS5DbGlwUmVjdGFuZ2xlLldpZHRoIC8gem9vbSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGludCkoZS5DbGlwUmVjdGFuZ2xlLkhlaWdodCAvIHpvb20pKTtcblxuICAgICAgICAgICAgR3JhcGhpY3MgZyA9IGUuR3JhcGhpY3MoKTtcbiAgICAgICAgICAgIGcuU2NhbGVUcmFuc2Zvcm0oem9vbSwgem9vbSk7XG4gICAgICAgICAgICAvKiBnLlBhZ2VTY2FsZSA9IHpvb207ICovXG4gICAgICAgICAgICBnLlNtb290aGluZ01vZGUgPSBTbW9vdGhpbmdNb2RlLkFudGlBbGlhcztcbiAgICAgICAgICAgIGludCB5cG9zID0gMDtcbiAgICAgICAgICAgIGZvcmVhY2ggKFN0YWZmIHN0YWZmIGluIHN0YWZmcylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAoKHlwb3MgKyBzdGFmZi5IZWlnaHQgPCBjbGlwLlkpIHx8ICh5cG9zID4gY2xpcC5ZICsgY2xpcC5IZWlnaHQpKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgLyogU3RhZmYgaXMgbm90IGluIHRoZSBjbGlwLCBkb24ndCBuZWVkIHRvIGRyYXcgaXQgKi9cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oMCwgeXBvcyk7XG4gICAgICAgICAgICAgICAgICAgIHN0YWZmLkRyYXcoZywgY2xpcCwgcGVuLCBTZWxlY3Rpb25TdGFydFB1bHNlLCBTZWxlY3Rpb25FbmRQdWxzZSwgZGVzZWxlY3RlZFNoYWRlQnJ1c2gpO1xuICAgICAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgwLCAteXBvcyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgeXBvcyArPSBzdGFmZi5IZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnLlNjYWxlVHJhbnNmb3JtKDEuMGYgLyB6b29tLCAxLjBmIC8gem9vbSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogV3JpdGUgdGhlIE1JREkgZmlsZW5hbWUgYXQgdGhlIHRvcCBvZiB0aGUgcGFnZSAqL1xuICAgICAgICBwcml2YXRlIHZvaWQgRHJhd1RpdGxlKEdyYXBoaWNzIGcpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGludCBsZWZ0bWFyZ2luID0gMjA7XG4gICAgICAgICAgICBpbnQgdG9wbWFyZ2luID0gMjA7XG4gICAgICAgICAgICBzdHJpbmcgdGl0bGUgPSBQYXRoLkdldEZpbGVOYW1lKGZpbGVuYW1lKTtcbiAgICAgICAgICAgIHRpdGxlID0gdGl0bGUuUmVwbGFjZShcIi5taWRcIiwgXCJcIikuUmVwbGFjZShcIl9cIiwgXCIgXCIpO1xuICAgICAgICAgICAgRm9udCBmb250ID0gbmV3IEZvbnQoXCJBcmlhbFwiLCAxMCwgRm9udFN0eWxlLkJvbGQpO1xuICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0obGVmdG1hcmdpbiwgdG9wbWFyZ2luKTtcbiAgICAgICAgICAgIGcuRHJhd1N0cmluZyh0aXRsZSwgZm9udCwgQnJ1c2hlcy5CbGFjaywgMCwgMCk7XG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtbGVmdG1hcmdpbiwgLXRvcG1hcmdpbik7XG4gICAgICAgICAgICBmb250LkRpc3Bvc2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm4gdGhlIG51bWJlciBvZiBwYWdlcyBuZWVkZWQgdG8gcHJpbnQgdGhpcyBzaGVldCBtdXNpYy5cbiAgICAgICAgICogQSBzdGFmZiBzaG91bGQgZml0IHdpdGhpbiBhIHNpbmdsZSBwYWdlLCBub3QgYmUgc3BsaXQgYWNyb3NzIHR3byBwYWdlcy5cbiAgICAgICAgICogSWYgdGhlIHNoZWV0IG11c2ljIGhhcyBleGFjdGx5IDIgdHJhY2tzLCB0aGVuIHR3byBzdGFmZnMgc2hvdWxkXG4gICAgICAgICAqIGZpdCB3aXRoaW4gYSBzaW5nbGUgcGFnZSwgYW5kIG5vdCBiZSBzcGxpdCBhY3Jvc3MgdHdvIHBhZ2VzLlxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIGludCBHZXRUb3RhbFBhZ2VzKClcbiAgICAgICAge1xuICAgICAgICAgICAgaW50IG51bSA9IDE7XG4gICAgICAgICAgICBpbnQgY3VycmhlaWdodCA9IFRpdGxlSGVpZ2h0O1xuXG4gICAgICAgICAgICBpZiAobnVtdHJhY2tzID09IDIgJiYgKHN0YWZmcy5Db3VudCAlIDIpID09IDApXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBzdGFmZnMuQ291bnQ7IGkgKz0gMilcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGludCBoZWlnaHRzID0gc3RhZmZzW2ldLkhlaWdodCArIHN0YWZmc1tpICsgMV0uSGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmhlaWdodCArIGhlaWdodHMgPiBQYWdlSGVpZ2h0KVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBudW0rKztcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJoZWlnaHQgPSBoZWlnaHRzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmhlaWdodCArPSBoZWlnaHRzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZvcmVhY2ggKFN0YWZmIHN0YWZmIGluIHN0YWZmcylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyaGVpZ2h0ICsgc3RhZmYuSGVpZ2h0ID4gUGFnZUhlaWdodClcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgbnVtKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyaGVpZ2h0ID0gc3RhZmYuSGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmhlaWdodCArPSBzdGFmZi5IZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVtO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqIFNoYWRlIGFsbCB0aGUgY2hvcmRzIHBsYXllZCBhdCB0aGUgZ2l2ZW4gcHVsc2UgdGltZS5cbiAgICAgICAgICogIExvb3AgdGhyb3VnaCBhbGwgdGhlIHN0YWZmcyBhbmQgY2FsbCBzdGFmZi5TaGFkZSgpLlxuICAgICAgICAgKiAgSWYgc2Nyb2xsR3JhZHVhbGx5IGlzIHRydWUsIHNjcm9sbCBncmFkdWFsbHkgKHNtb290aCBzY3JvbGxpbmcpXG4gICAgICAgICAqICB0byB0aGUgc2hhZGVkIG5vdGVzLiBSZXR1cm5zIHRoZSBtaW5pbXVtIHktY29vcmRpbmF0ZSBvZiB0aGUgc2hhZGVkIGNob3JkIChmb3Igc2Nyb2xsaW5nIHB1cnBvc2VzKVxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIFJlY3RhbmdsZSBTaGFkZU5vdGVzKGludCBjdXJyZW50UHVsc2VUaW1lLCBpbnQgcHJldlB1bHNlVGltZSwgYm9vbCBzY3JvbGxHcmFkdWFsbHksIFNvbGlkQnJ1c2ggYnJ1c2gpXG4gICAgICAgIHtcbiAgICAgICAgICAgIEdyYXBoaWNzIGcgPSBDcmVhdGVHcmFwaGljcyhcInNoYWRlTm90ZXNcIik7XG4gICAgICAgICAgICBnLlNtb290aGluZ01vZGUgPSBTbW9vdGhpbmdNb2RlLkFudGlBbGlhcztcbiAgICAgICAgICAgIGcuU2NhbGVUcmFuc2Zvcm0oem9vbSwgem9vbSk7XG4gICAgICAgICAgICBpbnQgeXBvcyA9IDA7XG5cbiAgICAgICAgICAgIGludCB4X3NoYWRlID0gMDtcbiAgICAgICAgICAgIGludCB5X3NoYWRlID0gMDtcbiAgICAgICAgICAgIGludCBoZWlnaHQgPSAwO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3JlYWNoIChTdGFmZiBzdGFmZiBpbiBzdGFmZnMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oMCwgeXBvcyk7XG4gICAgICAgICAgICAgICAgc3RhZmYuU2hhZGVOb3RlcyhnLCBicnVzaCwgcGVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFB1bHNlVGltZSwgcHJldlB1bHNlVGltZSwgcmVmIHhfc2hhZGUpO1xuICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKDAsIC15cG9zKTtcbiAgICAgICAgICAgICAgICB5cG9zICs9IHN0YWZmLkhlaWdodDtcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudFB1bHNlVGltZSA+PSBzdGFmZi5FbmRUaW1lKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgeV9zaGFkZSArPSBzdGFmZi5IZWlnaHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50UHVsc2VUaW1lID49IHN0YWZmLlN0YXJ0VGltZSAmJiBjdXJyZW50UHVsc2VUaW1lIDw9IHN0YWZmLkVuZFRpbWUpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgKz0gc3RhZmYuSGVpZ2h0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGcuU2NhbGVUcmFuc2Zvcm0oMS4wZiAvIHpvb20sIDEuMGYgLyB6b29tKTtcbiAgICAgICAgICAgIGcuRGlzcG9zZSgpO1xuICAgICAgICAgICAgeF9zaGFkZSA9IChpbnQpKHhfc2hhZGUgKiB6b29tKTtcbiAgICAgICAgICAgIHlfc2hhZGUgLT0gTm90ZUhlaWdodDtcbiAgICAgICAgICAgIHlfc2hhZGUgPSAoaW50KSh5X3NoYWRlICogem9vbSk7XG4gICAgICAgICAgICBpZiAoY3VycmVudFB1bHNlVGltZSA+PSAwKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIFNjcm9sbFRvU2hhZGVkTm90ZXMoeF9zaGFkZSwgeV9zaGFkZSwgc2Nyb2xsR3JhZHVhbGx5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBuZXcgUmVjdGFuZ2xlKHhfc2hhZGUsIHlfc2hhZGUsIDAsIChpbnQpKGhlaWdodCAqIHpvb20pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBTY3JvbGwgdGhlIHNoZWV0IG11c2ljIHNvIHRoYXQgdGhlIHNoYWRlZCBub3RlcyBhcmUgdmlzaWJsZS5cbiAgICAgICAgICAqIElmIHNjcm9sbEdyYWR1YWxseSBpcyB0cnVlLCBzY3JvbGwgZ3JhZHVhbGx5IChzbW9vdGggc2Nyb2xsaW5nKVxuICAgICAgICAgICogdG8gdGhlIHNoYWRlZCBub3Rlcy5cbiAgICAgICAgICAqL1xuICAgICAgICB2b2lkIFNjcm9sbFRvU2hhZGVkTm90ZXMoaW50IHhfc2hhZGUsIGludCB5X3NoYWRlLCBib29sIHNjcm9sbEdyYWR1YWxseSlcbiAgICAgICAge1xuICAgICAgICAgICAgUGFuZWwgc2Nyb2xsdmlldyA9IChQYW5lbCl0aGlzLlBhcmVudDtcbiAgICAgICAgICAgIFBvaW50IHNjcm9sbFBvcyA9IHNjcm9sbHZpZXcuQXV0b1Njcm9sbFBvc2l0aW9uO1xuXG4gICAgICAgICAgICAvKiBUaGUgc2Nyb2xsIHBvc2l0aW9uIGlzIGluIG5lZ2F0aXZlIGNvb3JkaW5hdGVzIGZvciBzb21lIHJlYXNvbiAqL1xuICAgICAgICAgICAgc2Nyb2xsUG9zLlggPSAtc2Nyb2xsUG9zLlg7XG4gICAgICAgICAgICBzY3JvbGxQb3MuWSA9IC1zY3JvbGxQb3MuWTtcbiAgICAgICAgICAgIFBvaW50IG5ld1BvcyA9IHNjcm9sbFBvcztcblxuICAgICAgICAgICAgaWYgKHNjcm9sbFZlcnQpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaW50IHNjcm9sbERpc3QgPSAoaW50KSh5X3NoYWRlIC0gc2Nyb2xsUG9zLlkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHNjcm9sbEdyYWR1YWxseSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzY3JvbGxEaXN0ID4gKHpvb20gKiBTdGFmZkhlaWdodCAqIDgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsRGlzdCA9IHNjcm9sbERpc3QgLyAyO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzY3JvbGxEaXN0ID4gKE5vdGVIZWlnaHQgKiAzICogem9vbSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxEaXN0ID0gKGludCkoTm90ZUhlaWdodCAqIDMgKiB6b29tKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV3UG9zID0gbmV3IFBvaW50KHNjcm9sbFBvcy5YLCBzY3JvbGxQb3MuWSArIHNjcm9sbERpc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGludCB4X3ZpZXcgPSBzY3JvbGxQb3MuWCArIDQwICogc2Nyb2xsdmlldy5XaWR0aCAvIDEwMDtcbiAgICAgICAgICAgICAgICBpbnQgeG1heCA9IHNjcm9sbFBvcy5YICsgNjUgKiBzY3JvbGx2aWV3LldpZHRoIC8gMTAwO1xuICAgICAgICAgICAgICAgIGludCBzY3JvbGxEaXN0ID0geF9zaGFkZSAtIHhfdmlldztcblxuICAgICAgICAgICAgICAgIGlmIChzY3JvbGxHcmFkdWFsbHkpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpZiAoeF9zaGFkZSA+IHhtYXgpXG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxEaXN0ID0gKHhfc2hhZGUgLSB4X3ZpZXcpIC8gMztcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoeF9zaGFkZSA+IHhfdmlldylcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbERpc3QgPSAoeF9zaGFkZSAtIHhfdmlldykgLyA2O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG5ld1BvcyA9IG5ldyBQb2ludChzY3JvbGxQb3MuWCArIHNjcm9sbERpc3QsIHNjcm9sbFBvcy5ZKTtcbiAgICAgICAgICAgICAgICBpZiAobmV3UG9zLlggPCAwKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3UG9zLlggPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNjcm9sbHZpZXcuQXV0b1Njcm9sbFBvc2l0aW9uID0gbmV3UG9zO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqIFJldHVybiB0aGUgcHVsc2VUaW1lIGNvcnJlc3BvbmRpbmcgdG8gdGhlIGdpdmVuIHBvaW50IG9uIHRoZSBTaGVldE11c2ljLlxuICAgICAgICAgKiAgRmlyc3QsIGZpbmQgdGhlIHN0YWZmIGNvcnJlc3BvbmRpbmcgdG8gdGhlIHBvaW50LlxuICAgICAgICAgKiAgVGhlbiwgd2l0aGluIHRoZSBzdGFmZiwgZmluZCB0aGUgbm90ZXMvc3ltYm9scyBjb3JyZXNwb25kaW5nIHRvIHRoZSBwb2ludCxcbiAgICAgICAgICogIGFuZCByZXR1cm4gdGhlIFN0YXJ0VGltZSAocHVsc2VUaW1lKSBvZiB0aGUgc3ltYm9scy5cbiAgICAgICAgICovXG4gICAgICAgIHB1YmxpYyBpbnQgUHVsc2VUaW1lRm9yUG9pbnQoUG9pbnQgcG9pbnQpXG4gICAgICAgIHtcbiAgICAgICAgICAgIFBvaW50IHNjYWxlZFBvaW50ID0gbmV3IFBvaW50KChpbnQpKHBvaW50LlggLyB6b29tKSwgKGludCkocG9pbnQuWSAvIHpvb20pKTtcbiAgICAgICAgICAgIGludCB5ID0gMDtcbiAgICAgICAgICAgIGZvcmVhY2ggKFN0YWZmIHN0YWZmIGluIHN0YWZmcylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAoc2NhbGVkUG9pbnQuWSA+PSB5ICYmIHNjYWxlZFBvaW50LlkgPD0geSArIHN0YWZmLkhlaWdodClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGFmZi5QdWxzZVRpbWVGb3JQb2ludChzY2FsZWRQb2ludCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHkgKz0gc3RhZmYuSGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHN0cmluZyByZXN1bHQgPSBcIlNoZWV0TXVzaWMgc3RhZmZzPVwiICsgc3RhZmZzLkNvdW50ICsgXCJcXG5cIjtcbiAgICAgICAgICAgIGZvcmVhY2ggKFN0YWZmIHN0YWZmIGluIHN0YWZmcylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gc3RhZmYuVG9TdHJpbmcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdCArPSBcIkVuZCBTaGVldE11c2ljXFxuXCI7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG5cbiAgICB9XG5cbn1cbiIsInVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xue1xuICAgIHB1YmxpYyBjbGFzcyBTb2xpZEJydXNoOkJydXNoXG4gICAge1xuICAgICAgICBwdWJsaWMgU29saWRCcnVzaChDb2xvciBjb2xvcik6XG4gICAgICAgICAgICBiYXNlKGNvbG9yKVxuICAgICAgICB7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbi8qKiBAY2xhc3MgVGltZVNpZ1N5bWJvbFxuICogQSBUaW1lU2lnU3ltYm9sIHJlcHJlc2VudHMgdGhlIHRpbWUgc2lnbmF0dXJlIGF0IHRoZSBiZWdpbm5pbmdcbiAqIG9mIHRoZSBzdGFmZi4gV2UgdXNlIHByZS1tYWRlIGltYWdlcyBmb3IgdGhlIG51bWJlcnMsIGluc3RlYWQgb2ZcbiAqIGRyYXdpbmcgc3RyaW5ncy5cbiAqL1xuXG5wdWJsaWMgY2xhc3MgVGltZVNpZ1N5bWJvbCA6IE11c2ljU3ltYm9sIHtcbiAgICBwcml2YXRlIHN0YXRpYyBJbWFnZVtdIGltYWdlczsgIC8qKiBUaGUgaW1hZ2VzIGZvciBlYWNoIG51bWJlciAqL1xuICAgIHByaXZhdGUgaW50ICBudW1lcmF0b3I7ICAgICAgICAgLyoqIFRoZSBudW1lcmF0b3IgKi9cbiAgICBwcml2YXRlIGludCAgZGVub21pbmF0b3I7ICAgICAgIC8qKiBUaGUgZGVub21pbmF0b3IgKi9cbiAgICBwcml2YXRlIGludCAgd2lkdGg7ICAgICAgICAgICAgIC8qKiBUaGUgd2lkdGggaW4gcGl4ZWxzICovXG4gICAgcHJpdmF0ZSBib29sIGNhbmRyYXc7ICAgICAgICAgICAvKiogVHJ1ZSBpZiB3ZSBjYW4gZHJhdyB0aGUgdGltZSBzaWduYXR1cmUgKi9cblxuICAgIC8qKiBDcmVhdGUgYSBuZXcgVGltZVNpZ1N5bWJvbCAqL1xuICAgIHB1YmxpYyBUaW1lU2lnU3ltYm9sKGludCBudW1lciwgaW50IGRlbm9tKSB7XG4gICAgICAgIG51bWVyYXRvciA9IG51bWVyO1xuICAgICAgICBkZW5vbWluYXRvciA9IGRlbm9tO1xuICAgICAgICBMb2FkSW1hZ2VzKCk7XG4gICAgICAgIGlmIChudW1lciA+PSAwICYmIG51bWVyIDwgaW1hZ2VzLkxlbmd0aCAmJiBpbWFnZXNbbnVtZXJdICE9IG51bGwgJiZcbiAgICAgICAgICAgIGRlbm9tID49IDAgJiYgZGVub20gPCBpbWFnZXMuTGVuZ3RoICYmIGltYWdlc1tudW1lcl0gIT0gbnVsbCkge1xuICAgICAgICAgICAgY2FuZHJhdyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjYW5kcmF3ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgd2lkdGggPSBNaW5XaWR0aDtcbiAgICB9XG5cbiAgICAvKiogTG9hZCB0aGUgaW1hZ2VzIGludG8gbWVtb3J5LiAqL1xuICAgIHByaXZhdGUgc3RhdGljIHZvaWQgTG9hZEltYWdlcygpIHtcbiAgICAgICAgaWYgKGltYWdlcyA9PSBudWxsKSB7XG4gICAgICAgICAgICBpbWFnZXMgPSBuZXcgSW1hZ2VbMTNdO1xuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCAxMzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaW1hZ2VzW2ldID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGltYWdlc1syXSA9IG5ldyBCaXRtYXAodHlwZW9mKFRpbWVTaWdTeW1ib2wpLCBcIlJlc291cmNlcy5JbWFnZXMudHdvLnBuZ1wiKTtcbiAgICAgICAgICAgIGltYWdlc1szXSA9IG5ldyBCaXRtYXAodHlwZW9mKFRpbWVTaWdTeW1ib2wpLCBcIlJlc291cmNlcy5JbWFnZXMudGhyZWUucG5nXCIpO1xuICAgICAgICAgICAgaW1hZ2VzWzRdID0gbmV3IEJpdG1hcCh0eXBlb2YoVGltZVNpZ1N5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy5mb3VyLnBuZ1wiKTtcbiAgICAgICAgICAgIGltYWdlc1s2XSA9IG5ldyBCaXRtYXAodHlwZW9mKFRpbWVTaWdTeW1ib2wpLCBcIlJlc291cmNlcy5JbWFnZXMuc2l4LnBuZ1wiKTtcbiAgICAgICAgICAgIGltYWdlc1s4XSA9IG5ldyBCaXRtYXAodHlwZW9mKFRpbWVTaWdTeW1ib2wpLCBcIlJlc291cmNlcy5JbWFnZXMuZWlnaHQucG5nXCIpO1xuICAgICAgICAgICAgaW1hZ2VzWzldID0gbmV3IEJpdG1hcCh0eXBlb2YoVGltZVNpZ1N5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy5uaW5lLnBuZ1wiKTtcbiAgICAgICAgICAgIGltYWdlc1sxMl0gPSBuZXcgQml0bWFwKHR5cGVvZihUaW1lU2lnU3ltYm9sKSwgXCJSZXNvdXJjZXMuSW1hZ2VzLnR3ZWx2ZS5wbmdcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSB0aW1lIChpbiBwdWxzZXMpIHRoaXMgc3ltYm9sIG9jY3VycyBhdC4gKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFN0YXJ0VGltZSB7XG4gICAgICAgIGdldCB7IHJldHVybiAtMTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG1pbmltdW0gd2lkdGggKGluIHBpeGVscykgbmVlZGVkIHRvIGRyYXcgdGhpcyBzeW1ib2wgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IE1pbldpZHRoIHtcbiAgICAgICAgZ2V0IHsgaWYgKGNhbmRyYXcpIFxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGltYWdlc1syXS5XaWR0aCAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodCAqIDIgL2ltYWdlc1syXS5IZWlnaHQ7XG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBHZXQvU2V0IHRoZSB3aWR0aCAoaW4gcGl4ZWxzKSBvZiB0aGlzIHN5bWJvbC4gVGhlIHdpZHRoIGlzIHNldFxuICAgICAqIGluIFNoZWV0TXVzaWMuQWxpZ25TeW1ib2xzKCkgdG8gdmVydGljYWxseSBhbGlnbiBzeW1ib2xzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgV2lkdGgge1xuICAgICAgIGdldCB7IHJldHVybiB3aWR0aDsgfVxuICAgICAgIHNldCB7IHdpZHRoID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYWJvdmUgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQWJvdmVTdGFmZiB7IFxuICAgICAgICBnZXQgeyAgcmV0dXJuIDA7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYmVsb3cgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQmVsb3dTdGFmZiB7XG4gICAgICAgIGdldCB7IHJldHVybiAwOyB9IFxuICAgIH1cblxuICAgIC8qKiBEcmF3IHRoZSBzeW1ib2wuXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHlsb2NhdGlvbiAoaW4gcGl4ZWxzKSB3aGVyZSB0aGUgdG9wIG9mIHRoZSBzdGFmZiBzdGFydHMuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIFxuICAgIHZvaWQgRHJhdyhHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICBpZiAoIWNhbmRyYXcpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oV2lkdGggLSBNaW5XaWR0aCwgMCk7XG4gICAgICAgIEltYWdlIG51bWVyID0gaW1hZ2VzW251bWVyYXRvcl07XG4gICAgICAgIEltYWdlIGRlbm9tID0gaW1hZ2VzW2Rlbm9taW5hdG9yXTtcblxuICAgICAgICAvKiBTY2FsZSB0aGUgaW1hZ2Ugd2lkdGggdG8gbWF0Y2ggdGhlIGhlaWdodCAqL1xuICAgICAgICBpbnQgaW1naGVpZ2h0ID0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMjtcbiAgICAgICAgaW50IGltZ3dpZHRoID0gbnVtZXIuV2lkdGggKiBpbWdoZWlnaHQgLyBudW1lci5IZWlnaHQ7XG4gICAgICAgIGcuRHJhd0ltYWdlKG51bWVyLCAwLCB5dG9wLCBpbWd3aWR0aCwgaW1naGVpZ2h0KTtcbiAgICAgICAgZy5EcmF3SW1hZ2UoZGVub20sIDAsIHl0b3AgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQqMiwgaW1nd2lkdGgsIGltZ2hlaWdodCk7XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0oV2lkdGggLSBNaW5XaWR0aCksIDApO1xuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiVGltZVNpZ1N5bWJvbCBudW1lcmF0b3I9ezB9IGRlbm9taW5hdG9yPXsxfVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1lcmF0b3IsIGRlbm9taW5hdG9yKTtcbiAgICB9XG59XG5cbn1cblxuIl0KfQo=
