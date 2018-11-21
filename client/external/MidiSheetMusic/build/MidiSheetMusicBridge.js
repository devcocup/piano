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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJNaWRpU2hlZXRNdXNpY0JyaWRnZS5qcyIsCiAgInNvdXJjZVJvb3QiOiAiIiwKICAic291cmNlcyI6IFsiQ2xhc3Nlcy9EcmF3aW5nL0ltYWdlLmNzIiwiQ2xhc3Nlcy9SaWZmUGFyc2VyLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL0JydXNoLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL0JydXNoZXMuY3MiLCJDbGFzc2VzL0NsZWZNZWFzdXJlcy5jcyIsIkNsYXNzZXMvRHJhd2luZy9Db2xvci5jcyIsIkNsYXNzZXMvRHJhd2luZy9Db250cm9sLmNzIiwiQ2xhc3Nlcy9JTy9TdHJlYW0uY3MiLCJDbGFzc2VzL0RyYXdpbmcvRm9udC5jcyIsIkNsYXNzZXMvRHJhd2luZy9HcmFwaGljcy5jcyIsIkNsYXNzZXMvS2V5U2lnbmF0dXJlLmNzIiwiQ2xhc3Nlcy9MeXJpY1N5bWJvbC5jcyIsIkNsYXNzZXMvTWlkaUV2ZW50LmNzIiwiQ2xhc3Nlcy9NaWRpRmlsZS5jcyIsIkNsYXNzZXMvTWlkaUZpbGVFeGNlcHRpb24uY3MiLCJDbGFzc2VzL01pZGlGaWxlUmVhZGVyLmNzIiwiQ2xhc3Nlcy9NaWRpTm90ZS5jcyIsIkNsYXNzZXMvTWlkaU9wdGlvbnMuY3MiLCJDbGFzc2VzL01pZGlUcmFjay5jcyIsIkNsYXNzZXMvV2hpdGVOb3RlLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL1BhaW50RXZlbnRBcmdzLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL1BhbmVsLmNzIiwiQ2xhc3Nlcy9JTy9QYXRoLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL1Blbi5jcyIsIkNsYXNzZXMvRHJhd2luZy9Qb2ludC5jcyIsIkNsYXNzZXMvRHJhd2luZy9SZWN0YW5nbGUuY3MiLCJDbGFzc2VzL1N0YWZmLmNzIiwiQ2xhc3Nlcy9TdGVtLmNzIiwiQ2xhc3Nlcy9TeW1ib2xXaWR0aHMuY3MiLCJDbGFzc2VzL1RpbWVTaWduYXR1cmUuY3MiLCJDbGFzc2VzL1RleHQvQVNDSUkuY3MiLCJDbGFzc2VzL1RleHQvRW5jb2RpbmcuY3MiLCJDbGFzc2VzL0FjY2lkU3ltYm9sLmNzIiwiQ2xhc3Nlcy9CYXJTeW1ib2wuY3MiLCJDbGFzc2VzL0RyYXdpbmcvQml0bWFwLmNzIiwiQ2xhc3Nlcy9CbGFua1N5bWJvbC5jcyIsIkNsYXNzZXMvQ2hvcmRTeW1ib2wuY3MiLCJDbGFzc2VzL0NsZWZTeW1ib2wuY3MiLCJDbGFzc2VzL0lPL0ZpbGVTdHJlYW0uY3MiLCJDbGFzc2VzL1BpYW5vLmNzIiwiQ2xhc3Nlcy9SZXN0U3ltYm9sLmNzIiwiQ2xhc3Nlcy9TaGVldE11c2ljLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL1NvbGlkQnJ1c2guY3MiLCJDbGFzc2VzL1RpbWVTaWdTeW1ib2wuY3MiXSwKICAibmFtZXMiOiBbIiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQW9CZ0JBLE9BQU9BLDBCQUE4Q0E7Ozs7O29CQVFyREEsT0FBT0EsMkJBQStDQTs7Ozs7NEJBakI5Q0EsTUFBV0E7O2dCQUV2QkEsc0JBQXFDQSxNQUFNQSxNQUFNQTs7Ozs7Ozs7Ozs7OzRCQ2U3QkEsUUFBWUEsT0FBV0E7O2dCQUUzQ0EsY0FBY0E7Z0JBQ2RBLGFBQWFBO2dCQUNiQSxZQUFZQTs7Ozs7Z0JBS1pBLFlBQWVBLGtCQUFTQTtnQkFDeEJBLGtCQUFXQSxXQUFNQSxhQUFRQSxVQUFVQTtnQkFDbkNBLE9BQU9BOzs7Ozs7Ozs7OzRCQzdCRUE7O2dCQUVUQSxhQUFRQTs7Ozs7Ozs7Ozs7Ozt3QkNKc0JBLE9BQU9BLElBQUlBLHFCQUFNQTs7Ozs7d0JBQ2pCQSxPQUFPQSxJQUFJQSxxQkFBTUE7Ozs7O3dCQUNiQSxPQUFPQSxJQUFJQSxxQkFBTUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29DQ3FGOUJBOztvQkFDekJBLGNBQWNBO29CQUNkQTtvQkFDQUEsMEJBQXVCQTs7Ozs0QkFDbkJBLGlCQUFTQTs7Ozs7O3FCQUViQSxJQUFJQTt3QkFDQUEsT0FBT0E7MkJBRU5BLElBQUlBLHdCQUFNQSxzQkFBZUE7d0JBQzFCQSxP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b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBOztvQkFFMUJBLE1BQU1BLHlEQUFVQSwrQkFBVkE7b0JBQ05BLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTs7b0JBRTFCQSxNQUFNQSx5REFBVUEsK0JBQVZBO29CQUNOQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7O29C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QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7O29CQUUxQkEsTUFBTUEsd0RBQVNBLG1DQUFUQTtvQkFDTkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBOztvQkFFMUJBLE1BQU1BLHdEQUFTQSxtQ0FBVEE7b0JBQ05BLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTs7b0JBRTFCQSxNQUFNQSx3REFBU0EsbUNBQVRBO29CQUNOQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFL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RUFDY0EsMENBQVdBIiwKICAic291cmNlc0NvbnRlbnQiOiBbInVzaW5nIEJyaWRnZTtcclxudXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEltYWdlXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIG9iamVjdCBEb21JbWFnZTtcclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIEltYWdlKFR5cGUgdHlwZSwgc3RyaW5nIGZpbGVuYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmltYWdlLmN0b3JcIiwgdGhpcywgdHlwZSwgZmlsZW5hbWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGludCBXaWR0aFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBTY3JpcHQuQ2FsbDxpbnQ+KFwiYnJpZGdlVXRpbC5pbWFnZS5nZXRXaWR0aFwiLCB0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGludCBIZWlnaHRcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdldFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gU2NyaXB0LkNhbGw8aW50PihcImJyaWRnZVV0aWwuaW1hZ2UuZ2V0SGVpZ2h0XCIsIHRoaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgLy9hZGFwdGVkIGZyb20gaHR0cHM6Ly93d3cuY29kZXByb2plY3QuY29tL0FydGljbGVzLzEwNjEzLyUyRkFydGljbGVzJTJGMTA2MTMlMkZDLVJJRkYtUGFyc2VyXHJcbiAgICAvL21vZGlmaWVkIHRvIHVzZSBieXRlIGFycmF5IGluc3RlYWQgb2Ygc3RyZWFtIHNpbmNlIHRoaXMgd2lsbCBiZSBjb21waWxlZCB0byBKYXZhc2NyaXB0XHJcbiAgICBwdWJsaWMgY2xhc3MgUmlmZlBhcnNlckV4Y2VwdGlvbiA6IEV4Y2VwdGlvblxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBSaWZmUGFyc2VyRXhjZXB0aW9uKHN0cmluZyBtZXNzYWdlKVxyXG4gICAgICAgICAgICA6IGJhc2UobWVzc2FnZSlcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2xhc3MgUmlmZkZpbGVJbmZvXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIHN0cmluZyBIZWFkZXIgeyBnZXQ7IHNldDsgfVxyXG4gICAgICAgIHB1YmxpYyBzdHJpbmcgRmlsZVR5cGUgeyBnZXQ7IHNldDsgfVxyXG4gICAgICAgIHB1YmxpYyBpbnQgRmlsZVNpemUgeyBnZXQ7IHNldDsgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjbGFzcyBCb3VuZGVkQnl0ZUFycmF5XHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgb2Zmc2V0O1xyXG4gICAgICAgIHByaXZhdGUgaW50IGNvdW50O1xyXG4gICAgICAgIHByaXZhdGUgYnl0ZVtdIGRhdGE7XHJcbiAgICAgICAgcHVibGljIEJvdW5kZWRCeXRlQXJyYXkoaW50IG9mZnNldCwgaW50IGNvdW50LCBieXRlW10gZGF0YSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0ID0gb2Zmc2V0O1xyXG4gICAgICAgICAgICB0aGlzLmNvdW50ID0gY291bnQ7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgYnl0ZVtdIEdldERhdGEoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgYnl0ZVtdIHNsaWNlID0gbmV3IGJ5dGVbY291bnRdO1xyXG4gICAgICAgICAgICBBcnJheS5Db3B5KGRhdGEsIG9mZnNldCwgc2xpY2UsIDAsIGNvdW50KTtcclxuICAgICAgICAgICAgcmV0dXJuIHNsaWNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGVsZWdhdGUgdm9pZCBQcm9jZXNzRWxlbWVudChzdHJpbmcgdHlwZSwgYm9vbCBpc0xpc3QsIEJvdW5kZWRCeXRlQXJyYXkgZGF0YSk7XHJcblxyXG5cclxuICAgIHB1YmxpYyBjbGFzcyBSaWZmUGFyc2VyXHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSBjb25zdCBpbnQgV29yZFNpemUgPSA0O1xyXG4gICAgICAgIHByaXZhdGUgY29uc3Qgc3RyaW5nIFJpZmY0Q0MgPSBcIlJJRkZcIjtcclxuICAgICAgICBwcml2YXRlIGNvbnN0IHN0cmluZyBSaWZYNENDID0gXCJSSUZYXCI7XHJcbiAgICAgICAgcHJpdmF0ZSBjb25zdCBzdHJpbmcgTGlzdDRDQyA9IFwiTElTVFwiO1xyXG5cclxuICAgICAgICBwcml2YXRlIGJ5dGVbXSBkYXRhO1xyXG4gICAgICAgIHByaXZhdGUgaW50IHBvc2l0aW9uO1xyXG5cclxuICAgICAgICBwdWJsaWMgUmlmZkZpbGVJbmZvIEZpbGVJbmZvIHsgZ2V0OyBwcml2YXRlIHNldDsgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBSaWZmRmlsZUluZm8gUmVhZEhlYWRlcihieXRlW10gZGF0YSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChkYXRhLkxlbmd0aCA8IFdvcmRTaXplICogMylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFJpZmZQYXJzZXJFeGNlcHRpb24oXCJSZWFkIGZhaWxlZC4gRmlsZSB0b28gc21hbGw/XCIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzdHJpbmcgaGVhZGVyO1xyXG4gICAgICAgICAgICBpZiAoIUlzUmlmZkZpbGUoZGF0YSwgb3V0IGhlYWRlcikpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBSaWZmUGFyc2VyRXhjZXB0aW9uKFwiUmVhZCBmYWlsZWQuIE5vIFJJRkYgaGVhZGVyXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmlmZkZpbGVJbmZvXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIEhlYWRlciA9IGhlYWRlcixcclxuICAgICAgICAgICAgICAgIEZpbGVTaXplID0gQml0Q29udmVydGVyLlRvSW50MzIoZGF0YSwgV29yZFNpemUpLFxyXG4gICAgICAgICAgICAgICAgRmlsZVR5cGUgPSBFbmNvZGluZy5BU0NJSS5HZXRTdHJpbmcoZGF0YSwgV29yZFNpemUgKiAyLCBXb3JkU2l6ZSksXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIFJpZmZQYXJzZXIoKSB7IH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBSaWZmUGFyc2VyIFBhcnNlQnl0ZUFycmF5KGJ5dGVbXSBkYXRhKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIHJpZmZQYXJzZXIgPSBuZXcgUmlmZlBhcnNlcigpO1xyXG4gICAgICAgICAgICByaWZmUGFyc2VyLkluaXQoZGF0YSk7XHJcbiAgICAgICAgICAgIHJldHVybiByaWZmUGFyc2VyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcml2YXRlIHZvaWQgSW5pdChieXRlW10gZGF0YSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgICAgIEZpbGVJbmZvID0gUmVhZEhlYWRlcihkYXRhKTtcclxuICAgICAgICAgICAgcG9zaXRpb24gPSBXb3JkU2l6ZSAqIDM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGJvb2wgSXNSaWZmRmlsZShieXRlW10gZGF0YSwgb3V0IHN0cmluZyBoZWFkZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgdGVzdCA9IEVuY29kaW5nLkFTQ0lJLkdldFN0cmluZyhkYXRhLCAwLCBXb3JkU2l6ZSk7XHJcbiAgICAgICAgICAgIGlmICh0ZXN0ID09IFJpZmY0Q0MgfHwgdGVzdCA9PSBSaWZYNENDKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBoZWFkZXIgPSB0ZXN0O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaGVhZGVyID0gbnVsbDtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGJvb2wgUmVhZChQcm9jZXNzRWxlbWVudCBwcm9jZXNzRWxlbWVudClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChkYXRhLkxlbmd0aCAtIHBvc2l0aW9uIDwgV29yZFNpemUgKiAyKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciB0eXBlID0gRW5jb2RpbmcuQVNDSUkuR2V0U3RyaW5nKGRhdGEsIHBvc2l0aW9uLCBXb3JkU2l6ZSk7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uICs9IFdvcmRTaXplO1xyXG4gICAgICAgICAgICB2YXIgc2l6ZSA9IEJpdENvbnZlcnRlci5Ub0ludDMyKGRhdGEsIHBvc2l0aW9uKTtcclxuICAgICAgICAgICAgcG9zaXRpb24gKz0gV29yZFNpemU7XHJcblxyXG4gICAgICAgICAgICBpZiAoZGF0YS5MZW5ndGggLSBwb3NpdGlvbiA8IHNpemUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBSaWZmUGFyc2VyRXhjZXB0aW9uKHN0cmluZy5Gb3JtYXQoXCJFbGVtZW50IHNpemUgbWlzbWF0Y2ggZm9yIGVsZW1lbnQgezB9IFwiLHR5cGUpK1xyXG5zdHJpbmcuRm9ybWF0KFwibmVlZCB7MH0gYnV0IGhhdmUgb25seSB7MX1cIixzaXplLEZpbGVJbmZvLkZpbGVTaXplIC0gcG9zaXRpb24pKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGUgPT0gTGlzdDRDQylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxpc3RUeXBlID0gRW5jb2RpbmcuQVNDSUkuR2V0U3RyaW5nKGRhdGEsIHBvc2l0aW9uLCBXb3JkU2l6ZSk7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzRWxlbWVudChsaXN0VHlwZSwgdHJ1ZSwgbmV3IEJvdW5kZWRCeXRlQXJyYXkocG9zaXRpb24gKyBXb3JkU2l6ZSwgc2l6ZSwgZGF0YSkpO1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb24gKz0gc2l6ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHZhciBwYWRkZWRTaXplID0gc2l6ZTtcclxuICAgICAgICAgICAgICAgIGlmICgoc2l6ZSAmIDEpICE9IDApIHBhZGRlZFNpemUrKztcclxuICAgICAgICAgICAgICAgIHByb2Nlc3NFbGVtZW50KHR5cGUsIGZhbHNlLCBuZXcgQm91bmRlZEJ5dGVBcnJheShwb3NpdGlvbiwgc2l6ZSwgZGF0YSkpO1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb24gKz0gcGFkZGVkU2l6ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEJydXNoXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIENvbG9yIENvbG9yO1xyXG5cclxuICAgICAgICBwdWJsaWMgQnJ1c2goQ29sb3IgY29sb3IpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBDb2xvciA9IGNvbG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgRGlzcG9zZSgpIHsgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBzdGF0aWMgY2xhc3MgQnJ1c2hlc1xyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQnJ1c2ggQmxhY2sgeyBnZXQgeyByZXR1cm4gbmV3IEJydXNoKENvbG9yLkJsYWNrKTsgfSB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBCcnVzaCBXaGl0ZSB7IGdldCB7IHJldHVybiBuZXcgQnJ1c2goQ29sb3IuV2hpdGUpOyB9IH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIEJydXNoIExpZ2h0R3JheSB7IGdldCB7IHJldHVybiBuZXcgQnJ1c2goQ29sb3IuTGlnaHRHcmF5KTsgfSB9XHJcbiAgICB9XHJcbn1cclxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDA4IE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIEBjbGFzcyBDbGVmTWVhc3VyZXNcbiAqIFRoZSBDbGVmTWVhc3VyZXMgY2xhc3MgaXMgdXNlZCB0byByZXBvcnQgd2hhdCBDbGVmIChUcmVibGUgb3IgQmFzcykgYVxuICogZ2l2ZW4gbWVhc3VyZSB1c2VzLlxuICovXG5wdWJsaWMgY2xhc3MgQ2xlZk1lYXN1cmVzIHtcbiAgICBwcml2YXRlIExpc3Q8Q2xlZj4gY2xlZnM7ICAvKiogVGhlIGNsZWZzIHVzZWQgZm9yIGVhY2ggbWVhc3VyZSAoZm9yIGEgc2luZ2xlIHRyYWNrKSAqL1xuICAgIHByaXZhdGUgaW50IG1lYXN1cmU7ICAgICAgIC8qKiBUaGUgbGVuZ3RoIG9mIGEgbWVhc3VyZSwgaW4gcHVsc2VzICovXG5cbiBcbiAgICAvKiogR2l2ZW4gdGhlIG5vdGVzIGluIGEgdHJhY2ssIGNhbGN1bGF0ZSB0aGUgYXBwcm9wcmlhdGUgQ2xlZiB0byB1c2VcbiAgICAgKiBmb3IgZWFjaCBtZWFzdXJlLiAgU3RvcmUgdGhlIHJlc3VsdCBpbiB0aGUgY2xlZnMgbGlzdC5cbiAgICAgKiBAcGFyYW0gbm90ZXMgIFRoZSBtaWRpIG5vdGVzXG4gICAgICogQHBhcmFtIG1lYXN1cmVsZW4gVGhlIGxlbmd0aCBvZiBhIG1lYXN1cmUsIGluIHB1bHNlc1xuICAgICAqL1xuICAgIHB1YmxpYyBDbGVmTWVhc3VyZXMoTGlzdDxNaWRpTm90ZT4gbm90ZXMsIGludCBtZWFzdXJlbGVuKSB7XG4gICAgICAgIG1lYXN1cmUgPSBtZWFzdXJlbGVuO1xuICAgICAgICBDbGVmIG1haW5jbGVmID0gTWFpbkNsZWYobm90ZXMpO1xuICAgICAgICBpbnQgbmV4dG1lYXN1cmUgPSBtZWFzdXJlbGVuO1xuICAgICAgICBpbnQgcG9zID0gMDtcbiAgICAgICAgQ2xlZiBjbGVmID0gbWFpbmNsZWY7XG5cbiAgICAgICAgY2xlZnMgPSBuZXcgTGlzdDxDbGVmPigpO1xuXG4gICAgICAgIHdoaWxlIChwb3MgPCBub3Rlcy5Db3VudCkge1xuICAgICAgICAgICAgLyogU3VtIGFsbCB0aGUgbm90ZXMgaW4gdGhlIGN1cnJlbnQgbWVhc3VyZSAqL1xuICAgICAgICAgICAgaW50IHN1bW5vdGVzID0gMDtcbiAgICAgICAgICAgIGludCBub3RlY291bnQgPSAwO1xuICAgICAgICAgICAgd2hpbGUgKHBvcyA8IG5vdGVzLkNvdW50ICYmIG5vdGVzW3Bvc10uU3RhcnRUaW1lIDwgbmV4dG1lYXN1cmUpIHtcbiAgICAgICAgICAgICAgICBzdW1ub3RlcyArPSBub3Rlc1twb3NdLk51bWJlcjtcbiAgICAgICAgICAgICAgICBub3RlY291bnQrKztcbiAgICAgICAgICAgICAgICBwb3MrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChub3RlY291bnQgPT0gMClcbiAgICAgICAgICAgICAgICBub3RlY291bnQgPSAxO1xuXG4gICAgICAgICAgICAvKiBDYWxjdWxhdGUgdGhlIFwiYXZlcmFnZVwiIG5vdGUgaW4gdGhlIG1lYXN1cmUgKi9cbiAgICAgICAgICAgIGludCBhdmdub3RlID0gc3Vtbm90ZXMgLyBub3RlY291bnQ7XG4gICAgICAgICAgICBpZiAoYXZnbm90ZSA9PSAwKSB7XG4gICAgICAgICAgICAgICAgLyogVGhpcyBtZWFzdXJlIGRvZXNuJ3QgY29udGFpbiBhbnkgbm90ZXMuXG4gICAgICAgICAgICAgICAgICogS2VlcCB0aGUgcHJldmlvdXMgY2xlZi5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGF2Z25vdGUgPj0gV2hpdGVOb3RlLkJvdHRvbVRyZWJsZS5OdW1iZXIoKSkge1xuICAgICAgICAgICAgICAgIGNsZWYgPSBDbGVmLlRyZWJsZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGF2Z25vdGUgPD0gV2hpdGVOb3RlLlRvcEJhc3MuTnVtYmVyKCkpIHtcbiAgICAgICAgICAgICAgICBjbGVmID0gQ2xlZi5CYXNzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLyogVGhlIGF2ZXJhZ2Ugbm90ZSBpcyBiZXR3ZWVuIEczIGFuZCBGNC4gV2UgY2FuIHVzZSBlaXRoZXJcbiAgICAgICAgICAgICAgICAgKiB0aGUgdHJlYmxlIG9yIGJhc3MgY2xlZi4gIFVzZSB0aGUgXCJtYWluXCIgY2xlZiwgdGhlIGNsZWZcbiAgICAgICAgICAgICAgICAgKiB0aGF0IGFwcGVhcnMgbW9zdCBmb3IgdGhpcyB0cmFjay5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBjbGVmID0gbWFpbmNsZWY7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNsZWZzLkFkZChjbGVmKTtcbiAgICAgICAgICAgIG5leHRtZWFzdXJlICs9IG1lYXN1cmVsZW47XG4gICAgICAgIH1cbiAgICAgICAgY2xlZnMuQWRkKGNsZWYpO1xuICAgIH1cblxuICAgIC8qKiBHaXZlbiBhIHRpbWUgKGluIHB1bHNlcyksIHJldHVybiB0aGUgY2xlZiB1c2VkIGZvciB0aGF0IG1lYXN1cmUuICovXG4gICAgcHVibGljIENsZWYgR2V0Q2xlZihpbnQgc3RhcnR0aW1lKSB7XG5cbiAgICAgICAgLyogSWYgdGhlIHRpbWUgZXhjZWVkcyB0aGUgbGFzdCBtZWFzdXJlLCByZXR1cm4gdGhlIGxhc3QgbWVhc3VyZSAqL1xuICAgICAgICBpZiAoc3RhcnR0aW1lIC8gbWVhc3VyZSA+PSBjbGVmcy5Db3VudCkge1xuICAgICAgICAgICAgcmV0dXJuIGNsZWZzWyBjbGVmcy5Db3VudC0xIF07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gY2xlZnNbIHN0YXJ0dGltZSAvIG1lYXN1cmUgXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBDYWxjdWxhdGUgdGhlIGJlc3QgY2xlZiB0byB1c2UgZm9yIHRoZSBnaXZlbiBub3Rlcy4gIElmIHRoZVxuICAgICAqIGF2ZXJhZ2Ugbm90ZSBpcyBiZWxvdyBNaWRkbGUgQywgdXNlIGEgYmFzcyBjbGVmLiAgRWxzZSwgdXNlIGEgdHJlYmxlXG4gICAgICogY2xlZi5cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBDbGVmIE1haW5DbGVmKExpc3Q8TWlkaU5vdGU+IG5vdGVzKSB7XG4gICAgICAgIGludCBtaWRkbGVDID0gV2hpdGVOb3RlLk1pZGRsZUMuTnVtYmVyKCk7XG4gICAgICAgIGludCB0b3RhbCA9IDA7XG4gICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG0gaW4gbm90ZXMpIHtcbiAgICAgICAgICAgIHRvdGFsICs9IG0uTnVtYmVyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub3Rlcy5Db3VudCA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gQ2xlZi5UcmVibGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodG90YWwvbm90ZXMuQ291bnQgPj0gbWlkZGxlQykge1xuICAgICAgICAgICAgcmV0dXJuIENsZWYuVHJlYmxlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIENsZWYuQmFzcztcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG59XG5cbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBDb2xvclxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBpbnQgUmVkO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgR3JlZW47XHJcbiAgICAgICAgcHVibGljIGludCBCbHVlO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgQWxwaGE7XHJcblxyXG4gICAgICAgIHB1YmxpYyBDb2xvcigpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBBbHBoYSA9IDI1NTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQ29sb3IgRnJvbUFyZ2IoaW50IHJlZCwgaW50IGdyZWVuLCBpbnQgYmx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gRnJvbUFyZ2IoMjU1LCByZWQsIGdyZWVuLCBibHVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQ29sb3IgRnJvbUFyZ2IoaW50IGFscGhhLCBpbnQgcmVkLCBpbnQgZ3JlZW4sIGludCBibHVlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBDb2xvclxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBBbHBoYSA9IGFscGhhLFxyXG4gICAgICAgICAgICAgICAgUmVkID0gcmVkLFxyXG4gICAgICAgICAgICAgICAgR3JlZW4gPSBncmVlbixcclxuICAgICAgICAgICAgICAgIEJsdWUgPSBibHVlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIENvbG9yIEJsYWNrIHsgZ2V0IHsgcmV0dXJuIG5ldyBDb2xvcigpOyB9IH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBDb2xvciBXaGl0ZSB7IGdldCB7IHJldHVybiBGcm9tQXJnYigyNTUsMjU1LDI1NSk7IH0gfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIENvbG9yIExpZ2h0R3JheSB7IGdldCB7IHJldHVybiBGcm9tQXJnYigweGQzLDB4ZDMsMHhkMyk7IH0gfVxyXG5cclxuICAgICAgICBwdWJsaWMgaW50IFIgeyBnZXQgeyByZXR1cm4gUmVkOyB9IH1cclxuICAgICAgICBwdWJsaWMgaW50IEcgeyBnZXQgeyByZXR1cm4gR3JlZW47IH0gfVxyXG4gICAgICAgIHB1YmxpYyBpbnQgQiB7IGdldCB7IHJldHVybiBCbHVlOyB9IH1cclxuXHJcbiAgICAgICAgcHVibGljIGJvb2wgRXF1YWxzKENvbG9yIGNvbG9yKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIFJlZCA9PSBjb2xvci5SZWQgJiYgR3JlZW4gPT0gY29sb3IuR3JlZW4gJiYgQmx1ZSA9PSBjb2xvci5CbHVlICYmIEFscGhhPT1jb2xvci5BbHBoYTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIENvbnRyb2xcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgaW50IFdpZHRoO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgSGVpZ2h0O1xyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBJbnZhbGlkYXRlKCkgeyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBHcmFwaGljcyBDcmVhdGVHcmFwaGljcyhzdHJpbmcgbmFtZSkgeyByZXR1cm4gbmV3IEdyYXBoaWNzKG5hbWUpOyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBQYW5lbCBQYXJlbnQgeyBnZXQgeyByZXR1cm4gbmV3IFBhbmVsKCk7IH0gfVxyXG5cclxuICAgICAgICBwdWJsaWMgQ29sb3IgQmFja0NvbG9yO1xyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBTdHJlYW1cclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgdm9pZCBXcml0ZShieXRlW10gYnVmZmVyLCBpbnQgb2Zmc2V0LCBpbnQgY291bnQpIHsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBDbG9zZSgpIHsgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBGb250XHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIHN0cmluZyBOYW1lO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgU2l6ZTtcclxuICAgICAgICBwdWJsaWMgRm9udFN0eWxlIFN0eWxlO1xyXG5cclxuICAgICAgICBwdWJsaWMgRm9udChzdHJpbmcgbmFtZSwgaW50IHNpemUsIEZvbnRTdHlsZSBzdHlsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIE5hbWUgPSBuYW1lO1xyXG4gICAgICAgICAgICBTaXplID0gc2l6ZTtcclxuICAgICAgICAgICAgU3R5bGUgPSBzdHlsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBmbG9hdCBHZXRIZWlnaHQoKSB7IHJldHVybiAwOyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIERpc3Bvc2UoKSB7IH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBCcmlkZ2U7XHJcbnVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBHcmFwaGljc1xyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBHcmFwaGljcyhzdHJpbmcgbmFtZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIE5hbWUgPSBuYW1lO1xyXG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3MuaW5pdEdyYXBoaWNzXCIsIHRoaXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0cmluZyBOYW1lO1xyXG5cclxuICAgICAgICBwdWJsaWMgb2JqZWN0IENvbnRleHQ7XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFRyYW5zbGF0ZVRyYW5zZm9ybShpbnQgeCwgaW50IHkpIHtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLnRyYW5zbGF0ZVRyYW5zZm9ybVwiLCB0aGlzLCB4LCB5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIERyYXdJbWFnZShJbWFnZSBpbWFnZSwgaW50IHgsIGludCB5LCBpbnQgd2lkdGgsIGludCBoZWlnaHQpIHtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLmRyYXdJbWFnZVwiLCB0aGlzLCBpbWFnZSwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBEcmF3U3RyaW5nKHN0cmluZyB0ZXh0LCBGb250IGZvbnQsIEJydXNoIGJydXNoLCBpbnQgeCwgaW50IHkpIHtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLmRyYXdTdHJpbmdcIiwgdGhpcywgdGV4dCwgZm9udCwgYnJ1c2gsIHgsIHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgRHJhd0xpbmUoUGVuIHBlbiwgaW50IHhTdGFydCwgaW50IHlTdGFydCwgaW50IHhFbmQsIGludCB5RW5kKSB7XHJcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy5kcmF3TGluZVwiLCB0aGlzLCBwZW4sIHhTdGFydCwgeVN0YXJ0LCB4RW5kLCB5RW5kKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIERyYXdCZXppZXIoUGVuIHBlbiwgaW50IHgxLCBpbnQgeTEsIGludCB4MiwgaW50IHkyLCBpbnQgeDMsIGludCB5MywgaW50IHg0LCBpbnQgeTQpIHtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLmRyYXdCZXppZXJcIiwgdGhpcywgcGVuLCB4MSwgeTEsIHgyLCB5MiwgeDMsIHkzLCB4NCwgeTQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgU2NhbGVUcmFuc2Zvcm0oZmxvYXQgeCwgZmxvYXQgeSkge1xyXG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3Muc2NhbGVUcmFuc2Zvcm1cIiwgdGhpcywgeCwgeSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBGaWxsUmVjdGFuZ2xlKEJydXNoIGJydXNoLCBpbnQgeCwgaW50IHksIGludCB3aWR0aCwgaW50IGhlaWdodCkge1xyXG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3MuZmlsbFJlY3RhbmdsZVwiLCB0aGlzLCBicnVzaCwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBDbGVhclJlY3RhbmdsZShpbnQgeCwgaW50IHksIGludCB3aWR0aCwgaW50IGhlaWdodCkge1xyXG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3MuY2xlYXJSZWN0YW5nbGVcIiwgdGhpcywgeCwgeSwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBGaWxsRWxsaXBzZShCcnVzaCBicnVzaCwgaW50IHgsIGludCB5LCBpbnQgd2lkdGgsIGludCBoZWlnaHQpIHtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLmZpbGxFbGxpcHNlXCIsIHRoaXMsIGJydXNoLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIERyYXdFbGxpcHNlKFBlbiBwZW4sIGludCB4LCBpbnQgeSwgaW50IHdpZHRoLCBpbnQgaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy5kcmF3RWxsaXBzZVwiLCB0aGlzLCBwZW4sIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgUm90YXRlVHJhbnNmb3JtKGZsb2F0IGFuZ2xlRGVnKSB7XHJcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy5yb3RhdGVUcmFuc2Zvcm1cIiwgdGhpcywgYW5nbGVEZWcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIFNtb290aGluZ01vZGUgU21vb3RoaW5nTW9kZSB7IGdldDsgc2V0OyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBSZWN0YW5nbGUgVmlzaWJsZUNsaXBCb3VuZHMgeyBnZXQ7IHNldDsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZmxvYXQgUGFnZVNjYWxlIHsgZ2V0OyBzZXQ7IH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgRGlzcG9zZSgpIHsgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMyBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuXG4vKiogQGNsYXNzIEtleVNpZ25hdHVyZVxuICogVGhlIEtleVNpZ25hdHVyZSBjbGFzcyByZXByZXNlbnRzIGEga2V5IHNpZ25hdHVyZSwgbGlrZSBHIE1ham9yXG4gKiBvciBCLWZsYXQgTWFqb3IuICBGb3Igc2hlZXQgbXVzaWMsIHdlIG9ubHkgY2FyZSBhYm91dCB0aGUgbnVtYmVyXG4gKiBvZiBzaGFycHMgb3IgZmxhdHMgaW4gdGhlIGtleSBzaWduYXR1cmUsIG5vdCB3aGV0aGVyIGl0IGlzIG1ham9yXG4gKiBvciBtaW5vci5cbiAqXG4gKiBUaGUgbWFpbiBvcGVyYXRpb25zIG9mIHRoaXMgY2xhc3MgYXJlOlxuICogLSBHdWVzc2luZyB0aGUga2V5IHNpZ25hdHVyZSwgZ2l2ZW4gdGhlIG5vdGVzIGluIGEgc29uZy5cbiAqIC0gR2VuZXJhdGluZyB0aGUgYWNjaWRlbnRhbCBzeW1ib2xzIGZvciB0aGUga2V5IHNpZ25hdHVyZS5cbiAqIC0gRGV0ZXJtaW5pbmcgd2hldGhlciBhIHBhcnRpY3VsYXIgbm90ZSByZXF1aXJlcyBhbiBhY2NpZGVudGFsXG4gKiAgIG9yIG5vdC5cbiAqXG4gKi9cblxucHVibGljIGNsYXNzIEtleVNpZ25hdHVyZSB7XG4gICAgLyoqIFRoZSBudW1iZXIgb2Ygc2hhcnBzIGluIGVhY2gga2V5IHNpZ25hdHVyZSAqL1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQyA9IDA7XG4gICAgcHVibGljIGNvbnN0IGludCBHID0gMTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEQgPSAyO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQSA9IDM7XG4gICAgcHVibGljIGNvbnN0IGludCBFID0gNDtcbiAgICBwdWJsaWMgY29uc3QgaW50IEIgPSA1O1xuXG4gICAgLyoqIFRoZSBudW1iZXIgb2YgZmxhdHMgaW4gZWFjaCBrZXkgc2lnbmF0dXJlICovXG4gICAgcHVibGljIGNvbnN0IGludCBGID0gMTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEJmbGF0ID0gMjtcbiAgICBwdWJsaWMgY29uc3QgaW50IEVmbGF0ID0gMztcbiAgICBwdWJsaWMgY29uc3QgaW50IEFmbGF0ID0gNDtcbiAgICBwdWJsaWMgY29uc3QgaW50IERmbGF0ID0gNTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEdmbGF0ID0gNjtcblxuICAgIC8qKiBUaGUgdHdvIGFycmF5cyBiZWxvdyBhcmUga2V5IG1hcHMuICBUaGV5IHRha2UgYSBtYWpvciBrZXlcbiAgICAgKiAobGlrZSBHIG1ham9yLCBCLWZsYXQgbWFqb3IpIGFuZCBhIG5vdGUgaW4gdGhlIHNjYWxlLCBhbmRcbiAgICAgKiByZXR1cm4gdGhlIEFjY2lkZW50YWwgcmVxdWlyZWQgdG8gZGlzcGxheSB0aGF0IG5vdGUgaW4gdGhlXG4gICAgICogZ2l2ZW4ga2V5LiAgSW4gYSBudXRzaGVsLCB0aGUgbWFwIGlzXG4gICAgICpcbiAgICAgKiAgIG1hcFtLZXldW05vdGVTY2FsZV0gLT4gQWNjaWRlbnRhbFxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIEFjY2lkW11bXSBzaGFycGtleXM7XG4gICAgcHJpdmF0ZSBzdGF0aWMgQWNjaWRbXVtdIGZsYXRrZXlzO1xuXG4gICAgcHJpdmF0ZSBpbnQgbnVtX2ZsYXRzOyAgIC8qKiBUaGUgbnVtYmVyIG9mIHNoYXJwcyBpbiB0aGUga2V5LCAwIHRocnUgNiAqL1xuICAgIHByaXZhdGUgaW50IG51bV9zaGFycHM7ICAvKiogVGhlIG51bWJlciBvZiBmbGF0cyBpbiB0aGUga2V5LCAwIHRocnUgNiAqL1xuXG4gICAgLyoqIFRoZSBhY2NpZGVudGFsIHN5bWJvbHMgdGhhdCBkZW5vdGUgdGhpcyBrZXksIGluIGEgdHJlYmxlIGNsZWYgKi9cbiAgICBwcml2YXRlIEFjY2lkU3ltYm9sW10gdHJlYmxlO1xuXG4gICAgLyoqIFRoZSBhY2NpZGVudGFsIHN5bWJvbHMgdGhhdCBkZW5vdGUgdGhpcyBrZXksIGluIGEgYmFzcyBjbGVmICovXG4gICAgcHJpdmF0ZSBBY2NpZFN5bWJvbFtdIGJhc3M7XG5cbiAgICAvKiogVGhlIGtleSBtYXAgZm9yIHRoaXMga2V5IHNpZ25hdHVyZTpcbiAgICAgKiAgIGtleW1hcFtub3RlbnVtYmVyXSAtPiBBY2NpZGVudGFsXG4gICAgICovXG4gICAgcHJpdmF0ZSBBY2NpZFtdIGtleW1hcDtcblxuICAgIC8qKiBUaGUgbWVhc3VyZSB1c2VkIGluIHRoZSBwcmV2aW91cyBjYWxsIHRvIEdldEFjY2lkZW50YWwoKSAqL1xuICAgIHByaXZhdGUgaW50IHByZXZtZWFzdXJlOyBcblxuXG4gICAgLyoqIENyZWF0ZSBuZXcga2V5IHNpZ25hdHVyZSwgd2l0aCB0aGUgZ2l2ZW4gbnVtYmVyIG9mXG4gICAgICogc2hhcnBzIGFuZCBmbGF0cy4gIE9uZSBvZiB0aGUgdHdvIG11c3QgYmUgMCwgeW91IGNhbid0XG4gICAgICogaGF2ZSBib3RoIHNoYXJwcyBhbmQgZmxhdHMgaW4gdGhlIGtleSBzaWduYXR1cmUuXG4gICAgICovXG4gICAgcHVibGljIEtleVNpZ25hdHVyZShpbnQgbnVtX3NoYXJwcywgaW50IG51bV9mbGF0cykge1xuICAgICAgICBpZiAoIShudW1fc2hhcnBzID09IDAgfHwgbnVtX2ZsYXRzID09IDApKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgU3lzdGVtLkFyZ3VtZW50RXhjZXB0aW9uKFwiQmFkIEtleVNpZ2F0dXJlIGFyZ3NcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5udW1fc2hhcnBzID0gbnVtX3NoYXJwcztcbiAgICAgICAgdGhpcy5udW1fZmxhdHMgPSBudW1fZmxhdHM7XG5cbiAgICAgICAgQ3JlYXRlQWNjaWRlbnRhbE1hcHMoKTtcbiAgICAgICAga2V5bWFwID0gbmV3IEFjY2lkWzE2MF07XG4gICAgICAgIFJlc2V0S2V5TWFwKCk7XG4gICAgICAgIENyZWF0ZVN5bWJvbHMoKTtcbiAgICB9XG5cbiAgICAvKiogQ3JlYXRlIG5ldyBrZXkgc2lnbmF0dXJlLCB3aXRoIHRoZSBnaXZlbiBub3Rlc2NhbGUuICAqL1xuICAgIHB1YmxpYyBLZXlTaWduYXR1cmUoaW50IG5vdGVzY2FsZSkge1xuICAgICAgICBudW1fc2hhcnBzID0gbnVtX2ZsYXRzID0gMDtcbiAgICAgICAgc3dpdGNoIChub3Rlc2NhbGUpIHtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkE6ICAgICBudW1fc2hhcnBzID0gMzsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5CZmxhdDogbnVtX2ZsYXRzID0gMjsgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQjogICAgIG51bV9zaGFycHMgPSA1OyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkM6ICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkRmbGF0OiBudW1fZmxhdHMgPSA1OyAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5EOiAgICAgbnVtX3NoYXJwcyA9IDI7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRWZsYXQ6IG51bV9mbGF0cyA9IDM7ICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkU6ICAgICBudW1fc2hhcnBzID0gNDsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5GOiAgICAgbnVtX2ZsYXRzID0gMTsgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuR2ZsYXQ6IG51bV9mbGF0cyA9IDY7ICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkc6ICAgICBudW1fc2hhcnBzID0gMTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5BZmxhdDogbnVtX2ZsYXRzID0gNDsgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDogICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgQ3JlYXRlQWNjaWRlbnRhbE1hcHMoKTtcbiAgICAgICAga2V5bWFwID0gbmV3IEFjY2lkWzE2MF07XG4gICAgICAgIFJlc2V0S2V5TWFwKCk7XG4gICAgICAgIENyZWF0ZVN5bWJvbHMoKTtcbiAgICB9XG5cblxuICAgIC8qKiBJbmlpdGFsaXplIHRoZSBzaGFycGtleXMgYW5kIGZsYXRrZXlzIG1hcHMgKi9cbiAgICBwcml2YXRlIHN0YXRpYyB2b2lkIENyZWF0ZUFjY2lkZW50YWxNYXBzKCkge1xuICAgICAgICBpZiAoc2hhcnBrZXlzICE9IG51bGwpXG4gICAgICAgICAgICByZXR1cm47IFxuXG4gICAgICAgIEFjY2lkW10gbWFwO1xuICAgICAgICBzaGFycGtleXMgPSBuZXcgQWNjaWRbOF1bXTtcbiAgICAgICAgZmxhdGtleXMgPSBuZXcgQWNjaWRbOF1bXTtcblxuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICAgICAgc2hhcnBrZXlzW2ldID0gbmV3IEFjY2lkWzEyXTtcbiAgICAgICAgICAgIGZsYXRrZXlzW2ldID0gbmV3IEFjY2lkWzEyXTtcbiAgICAgICAgfVxuXG4gICAgICAgIG1hcCA9IHNoYXJwa2V5c1tDXTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Bc2hhcnAgXSA9IEFjY2lkLkZsYXQ7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Dc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Gc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkdzaGFycCBdID0gQWNjaWQuU2hhcnA7XG5cbiAgICAgICAgbWFwID0gc2hhcnBrZXlzW0ddO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkFzaGFycCBdID0gQWNjaWQuRmxhdDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkNzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRHNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Hc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuXG4gICAgICAgIG1hcCA9IHNoYXJwa2V5c1tEXTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Bc2hhcnAgXSA9IEFjY2lkLkZsYXQ7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Dc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRHNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Hc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuXG4gICAgICAgIG1hcCA9IHNoYXJwa2V5c1tBXTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Bc2hhcnAgXSA9IEFjY2lkLkZsYXQ7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Dc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRHNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Hc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG5cbiAgICAgICAgbWFwID0gc2hhcnBrZXlzW0VdO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkFzaGFycCBdID0gQWNjaWQuRmxhdDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkNzaGFycCBdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRCBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Ec2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Gc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuR3NoYXJwIF0gPSBBY2NpZC5Ob25lO1xuXG4gICAgICAgIG1hcCA9IHNoYXJwa2V5c1tCXTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Bc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Dc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRHNoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRnNoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkdzaGFycCBdID0gQWNjaWQuTm9uZTtcblxuICAgICAgICAvKiBGbGF0IGtleXMgKi9cbiAgICAgICAgbWFwID0gZmxhdGtleXNbQ107XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQXNoYXJwIF0gPSBBY2NpZC5GbGF0O1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQ3NoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRCBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Ec2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRnNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Hc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuXG4gICAgICAgIG1hcCA9IGZsYXRrZXlzW0ZdO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkJmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkNzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRWZsYXQgXSAgPSBBY2NpZC5GbGF0O1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRnNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BZmxhdCBdICA9IEFjY2lkLkZsYXQ7XG5cbiAgICAgICAgbWFwID0gZmxhdGtleXNbQmZsYXRdO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkJmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkNzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRWZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRnNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BZmxhdCBdICA9IEFjY2lkLkZsYXQ7XG5cbiAgICAgICAgbWFwID0gZmxhdGtleXNbRWZsYXRdO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkJmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRmbGF0IF0gID0gQWNjaWQuRmxhdDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRCBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Gc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkFmbGF0IF0gID0gQWNjaWQuTm9uZTtcblxuICAgICAgICBtYXAgPSBmbGF0a2V5c1tBZmxhdF07XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQmZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRGZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkVmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQWZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuXG4gICAgICAgIG1hcCA9IGZsYXRrZXlzW0RmbGF0XTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRWZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuR2ZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkFmbGF0IF0gID0gQWNjaWQuTm9uZTtcblxuICAgICAgICBtYXAgPSBmbGF0a2V5c1tHZmxhdF07XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQmZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRGZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkVmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkdmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BZmxhdCBdICA9IEFjY2lkLk5vbmU7XG5cblxuICAgIH1cblxuICAgIC8qKiBUaGUga2V5bWFwIHRlbGxzIHdoYXQgYWNjaWRlbnRhbCBzeW1ib2wgaXMgbmVlZGVkIGZvciBlYWNoXG4gICAgICogIG5vdGUgaW4gdGhlIHNjYWxlLiAgUmVzZXQgdGhlIGtleW1hcCB0byB0aGUgdmFsdWVzIG9mIHRoZVxuICAgICAqICBrZXkgc2lnbmF0dXJlLlxuICAgICAqL1xuICAgIHByaXZhdGUgdm9pZCBSZXNldEtleU1hcCgpXG4gICAge1xuICAgICAgICBBY2NpZFtdIGtleTtcbiAgICAgICAgaWYgKG51bV9mbGF0cyA+IDApXG4gICAgICAgICAgICBrZXkgPSBmbGF0a2V5c1tudW1fZmxhdHNdO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBrZXkgPSBzaGFycGtleXNbbnVtX3NoYXJwc107XG5cbiAgICAgICAgZm9yIChpbnQgbm90ZW51bWJlciA9IDA7IG5vdGVudW1iZXIgPCBrZXltYXAuTGVuZ3RoOyBub3RlbnVtYmVyKyspIHtcbiAgICAgICAgICAgIGtleW1hcFtub3RlbnVtYmVyXSA9IGtleVtOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyKV07XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIC8qKiBDcmVhdGUgdGhlIEFjY2lkZW50YWwgc3ltYm9scyBmb3IgdGhpcyBrZXksIGZvclxuICAgICAqIHRoZSB0cmVibGUgYW5kIGJhc3MgY2xlZnMuXG4gICAgICovXG4gICAgcHJpdmF0ZSB2b2lkIENyZWF0ZVN5bWJvbHMoKSB7XG4gICAgICAgIGludCBjb3VudCA9IE1hdGguTWF4KG51bV9zaGFycHMsIG51bV9mbGF0cyk7XG4gICAgICAgIHRyZWJsZSA9IG5ldyBBY2NpZFN5bWJvbFtjb3VudF07XG4gICAgICAgIGJhc3MgPSBuZXcgQWNjaWRTeW1ib2xbY291bnRdO1xuXG4gICAgICAgIGlmIChjb3VudCA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBXaGl0ZU5vdGVbXSB0cmVibGVub3RlcyA9IG51bGw7XG4gICAgICAgIFdoaXRlTm90ZVtdIGJhc3Nub3RlcyA9IG51bGw7XG5cbiAgICAgICAgaWYgKG51bV9zaGFycHMgPiAwKSAge1xuICAgICAgICAgICAgdHJlYmxlbm90ZXMgPSBuZXcgV2hpdGVOb3RlW10ge1xuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkYsIDUpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkMsIDUpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkcsIDUpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkQsIDUpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkEsIDYpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkUsIDUpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgYmFzc25vdGVzID0gbmV3IFdoaXRlTm90ZVtdIHtcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5GLCAzKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5DLCAzKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5HLCAzKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5ELCAzKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5BLCA0KSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5FLCAzKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChudW1fZmxhdHMgPiAwKSB7XG4gICAgICAgICAgICB0cmVibGVub3RlcyA9IG5ldyBXaGl0ZU5vdGVbXSB7XG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQiwgNSksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRSwgNSksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQSwgNSksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRCwgNSksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRywgNCksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQywgNSlcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBiYXNzbm90ZXMgPSBuZXcgV2hpdGVOb3RlW10ge1xuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkIsIDMpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkUsIDMpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkEsIDMpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkQsIDMpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkcsIDIpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkMsIDMpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgQWNjaWQgYSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIGlmIChudW1fc2hhcnBzID4gMClcbiAgICAgICAgICAgIGEgPSBBY2NpZC5TaGFycDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYSA9IEFjY2lkLkZsYXQ7XG5cbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICB0cmVibGVbaV0gPSBuZXcgQWNjaWRTeW1ib2woYSwgdHJlYmxlbm90ZXNbaV0sIENsZWYuVHJlYmxlKTtcbiAgICAgICAgICAgIGJhc3NbaV0gPSBuZXcgQWNjaWRTeW1ib2woYSwgYmFzc25vdGVzW2ldLCBDbGVmLkJhc3MpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgQWNjaWRlbnRhbCBzeW1ib2xzIGZvciBkaXNwbGF5aW5nIHRoaXMga2V5IHNpZ25hdHVyZVxuICAgICAqIGZvciB0aGUgZ2l2ZW4gY2xlZi5cbiAgICAgKi9cbiAgICBwdWJsaWMgQWNjaWRTeW1ib2xbXSBHZXRTeW1ib2xzKENsZWYgY2xlZikge1xuICAgICAgICBpZiAoY2xlZiA9PSBDbGVmLlRyZWJsZSlcbiAgICAgICAgICAgIHJldHVybiB0cmVibGU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBiYXNzO1xuICAgIH1cblxuICAgIC8qKiBHaXZlbiBhIG1pZGkgbm90ZSBudW1iZXIsIHJldHVybiB0aGUgYWNjaWRlbnRhbCAoaWYgYW55KSBcbiAgICAgKiB0aGF0IHNob3VsZCBiZSB1c2VkIHdoZW4gZGlzcGxheWluZyB0aGUgbm90ZSBpbiB0aGlzIGtleSBzaWduYXR1cmUuXG4gICAgICpcbiAgICAgKiBUaGUgY3VycmVudCBtZWFzdXJlIGlzIGFsc28gcmVxdWlyZWQuICBPbmNlIHdlIHJldHVybiBhblxuICAgICAqIGFjY2lkZW50YWwgZm9yIGEgbWVhc3VyZSwgdGhlIGFjY2lkZW50YWwgcmVtYWlucyBmb3IgdGhlXG4gICAgICogcmVzdCBvZiB0aGUgbWVhc3VyZS4gU28gd2UgbXVzdCB1cGRhdGUgdGhlIGN1cnJlbnQga2V5bWFwXG4gICAgICogd2l0aCBhbnkgbmV3IGFjY2lkZW50YWxzIHRoYXQgd2UgcmV0dXJuLiAgV2hlbiB3ZSBtb3ZlIHRvIGFub3RoZXJcbiAgICAgKiBtZWFzdXJlLCB3ZSByZXNldCB0aGUga2V5bWFwIGJhY2sgdG8gdGhlIGtleSBzaWduYXR1cmUuXG4gICAgICovXG4gICAgcHVibGljIEFjY2lkIEdldEFjY2lkZW50YWwoaW50IG5vdGVudW1iZXIsIGludCBtZWFzdXJlKSB7XG4gICAgICAgIGlmIChtZWFzdXJlICE9IHByZXZtZWFzdXJlKSB7XG4gICAgICAgICAgICBSZXNldEtleU1hcCgpO1xuICAgICAgICAgICAgcHJldm1lYXN1cmUgPSBtZWFzdXJlO1xuICAgICAgICB9XG5cbiAgICAgICAgQWNjaWQgcmVzdWx0ID0ga2V5bWFwW25vdGVudW1iZXJdO1xuICAgICAgICBpZiAocmVzdWx0ID09IEFjY2lkLlNoYXJwKSB7XG4gICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlcl0gPSBBY2NpZC5Ob25lO1xuICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXItMV0gPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHJlc3VsdCA9PSBBY2NpZC5GbGF0KSB7XG4gICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlcl0gPSBBY2NpZC5Ob25lO1xuICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXIrMV0gPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHJlc3VsdCA9PSBBY2NpZC5OYXR1cmFsKSB7XG4gICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlcl0gPSBBY2NpZC5Ob25lO1xuICAgICAgICAgICAgaW50IG5leHRrZXkgPSBOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyKzEpO1xuICAgICAgICAgICAgaW50IHByZXZrZXkgPSBOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyLTEpO1xuXG4gICAgICAgICAgICAvKiBJZiB3ZSBpbnNlcnQgYSBuYXR1cmFsLCB0aGVuIGVpdGhlcjpcbiAgICAgICAgICAgICAqIC0gdGhlIG5leHQga2V5IG11c3QgZ28gYmFjayB0byBzaGFycCxcbiAgICAgICAgICAgICAqIC0gdGhlIHByZXZpb3VzIGtleSBtdXN0IGdvIGJhY2sgdG8gZmxhdC5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYgKGtleW1hcFtub3RlbnVtYmVyLTFdID09IEFjY2lkLk5vbmUgJiYga2V5bWFwW25vdGVudW1iZXIrMV0gPT0gQWNjaWQuTm9uZSAmJlxuICAgICAgICAgICAgICAgIE5vdGVTY2FsZS5Jc0JsYWNrS2V5KG5leHRrZXkpICYmIE5vdGVTY2FsZS5Jc0JsYWNrS2V5KHByZXZrZXkpICkge1xuXG4gICAgICAgICAgICAgICAgaWYgKG51bV9mbGF0cyA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGtleW1hcFtub3RlbnVtYmVyKzFdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlci0xXSA9IEFjY2lkLkZsYXQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5bWFwW25vdGVudW1iZXItMV0gPT0gQWNjaWQuTm9uZSAmJiBOb3RlU2NhbGUuSXNCbGFja0tleShwcmV2a2V5KSkge1xuICAgICAgICAgICAgICAgIGtleW1hcFtub3RlbnVtYmVyLTFdID0gQWNjaWQuRmxhdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGtleW1hcFtub3RlbnVtYmVyKzFdID09IEFjY2lkLk5vbmUgJiYgTm90ZVNjYWxlLklzQmxhY2tLZXkobmV4dGtleSkpIHtcbiAgICAgICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlcisxXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLyogU2hvdWxkbid0IGdldCBoZXJlICovXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cblxuICAgIC8qKiBHaXZlbiBhIG1pZGkgbm90ZSBudW1iZXIsIHJldHVybiB0aGUgd2hpdGUgbm90ZSAodGhlXG4gICAgICogbm9uLXNoYXJwL25vbi1mbGF0IG5vdGUpIHRoYXQgc2hvdWxkIGJlIHVzZWQgd2hlbiBkaXNwbGF5aW5nXG4gICAgICogdGhpcyBub3RlIGluIHRoaXMga2V5IHNpZ25hdHVyZS4gIFRoaXMgc2hvdWxkIGJlIGNhbGxlZFxuICAgICAqIGJlZm9yZSBjYWxsaW5nIEdldEFjY2lkZW50YWwoKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgV2hpdGVOb3RlIEdldFdoaXRlTm90ZShpbnQgbm90ZW51bWJlcikge1xuICAgICAgICBpbnQgbm90ZXNjYWxlID0gTm90ZVNjYWxlLkZyb21OdW1iZXIobm90ZW51bWJlcik7XG4gICAgICAgIGludCBvY3RhdmUgPSAobm90ZW51bWJlciArIDMpIC8gMTIgLSAxO1xuICAgICAgICBpbnQgbGV0dGVyID0gMDtcblxuICAgICAgICBpbnRbXSB3aG9sZV9zaGFycHMgPSB7IFxuICAgICAgICAgICAgV2hpdGVOb3RlLkEsIFdoaXRlTm90ZS5BLCBcbiAgICAgICAgICAgIFdoaXRlTm90ZS5CLCBcbiAgICAgICAgICAgIFdoaXRlTm90ZS5DLCBXaGl0ZU5vdGUuQyxcbiAgICAgICAgICAgIFdoaXRlTm90ZS5ELCBXaGl0ZU5vdGUuRCxcbiAgICAgICAgICAgIFdoaXRlTm90ZS5FLFxuICAgICAgICAgICAgV2hpdGVOb3RlLkYsIFdoaXRlTm90ZS5GLFxuICAgICAgICAgICAgV2hpdGVOb3RlLkcsIFdoaXRlTm90ZS5HXG4gICAgICAgIH07XG5cbiAgICAgICAgaW50W10gd2hvbGVfZmxhdHMgPSB7XG4gICAgICAgICAgICBXaGl0ZU5vdGUuQSwgXG4gICAgICAgICAgICBXaGl0ZU5vdGUuQiwgV2hpdGVOb3RlLkIsXG4gICAgICAgICAgICBXaGl0ZU5vdGUuQyxcbiAgICAgICAgICAgIFdoaXRlTm90ZS5ELCBXaGl0ZU5vdGUuRCxcbiAgICAgICAgICAgIFdoaXRlTm90ZS5FLCBXaGl0ZU5vdGUuRSxcbiAgICAgICAgICAgIFdoaXRlTm90ZS5GLFxuICAgICAgICAgICAgV2hpdGVOb3RlLkcsIFdoaXRlTm90ZS5HLFxuICAgICAgICAgICAgV2hpdGVOb3RlLkFcbiAgICAgICAgfTtcblxuICAgICAgICBBY2NpZCBhY2NpZCA9IGtleW1hcFtub3RlbnVtYmVyXTtcbiAgICAgICAgaWYgKGFjY2lkID09IEFjY2lkLkZsYXQpIHtcbiAgICAgICAgICAgIGxldHRlciA9IHdob2xlX2ZsYXRzW25vdGVzY2FsZV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYWNjaWQgPT0gQWNjaWQuU2hhcnApIHtcbiAgICAgICAgICAgIGxldHRlciA9IHdob2xlX3NoYXJwc1tub3Rlc2NhbGVdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFjY2lkID09IEFjY2lkLk5hdHVyYWwpIHtcbiAgICAgICAgICAgIGxldHRlciA9IHdob2xlX3NoYXJwc1tub3Rlc2NhbGVdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFjY2lkID09IEFjY2lkLk5vbmUpIHtcbiAgICAgICAgICAgIGxldHRlciA9IHdob2xlX3NoYXJwc1tub3Rlc2NhbGVdO1xuXG4gICAgICAgICAgICAvKiBJZiB0aGUgbm90ZSBudW1iZXIgaXMgYSBzaGFycC9mbGF0LCBhbmQgdGhlcmUncyBubyBhY2NpZGVudGFsLFxuICAgICAgICAgICAgICogZGV0ZXJtaW5lIHRoZSB3aGl0ZSBub3RlIGJ5IHNlZWluZyB3aGV0aGVyIHRoZSBwcmV2aW91cyBvciBuZXh0IG5vdGVcbiAgICAgICAgICAgICAqIGlzIGEgbmF0dXJhbC5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaWYgKE5vdGVTY2FsZS5Jc0JsYWNrS2V5KG5vdGVzY2FsZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5bWFwW25vdGVudW1iZXItMV0gPT0gQWNjaWQuTmF0dXJhbCAmJiBcbiAgICAgICAgICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXIrMV0gPT0gQWNjaWQuTmF0dXJhbCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChudW1fZmxhdHMgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXR0ZXIgPSB3aG9sZV9mbGF0c1tub3Rlc2NhbGVdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0dGVyID0gd2hvbGVfc2hhcnBzW25vdGVzY2FsZV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoa2V5bWFwW25vdGVudW1iZXItMV0gPT0gQWNjaWQuTmF0dXJhbCkge1xuICAgICAgICAgICAgICAgICAgICBsZXR0ZXIgPSB3aG9sZV9zaGFycHNbbm90ZXNjYWxlXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoa2V5bWFwW25vdGVudW1iZXIrMV0gPT0gQWNjaWQuTmF0dXJhbCkge1xuICAgICAgICAgICAgICAgICAgICBsZXR0ZXIgPSB3aG9sZV9mbGF0c1tub3Rlc2NhbGVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFRoZSBhYm92ZSBhbGdvcml0aG0gZG9lc24ndCBxdWl0ZSB3b3JrIGZvciBHLWZsYXQgbWFqb3IuXG4gICAgICAgICAqIEhhbmRsZSBpdCBoZXJlLlxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKG51bV9mbGF0cyA9PSBHZmxhdCAmJiBub3Rlc2NhbGUgPT0gTm90ZVNjYWxlLkIpIHtcbiAgICAgICAgICAgIGxldHRlciA9IFdoaXRlTm90ZS5DO1xuICAgICAgICB9XG4gICAgICAgIGlmIChudW1fZmxhdHMgPT0gR2ZsYXQgJiYgbm90ZXNjYWxlID09IE5vdGVTY2FsZS5CZmxhdCkge1xuICAgICAgICAgICAgbGV0dGVyID0gV2hpdGVOb3RlLkI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobnVtX2ZsYXRzID4gMCAmJiBub3Rlc2NhbGUgPT0gTm90ZVNjYWxlLkFmbGF0KSB7XG4gICAgICAgICAgICBvY3RhdmUrKztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgV2hpdGVOb3RlKGxldHRlciwgb2N0YXZlKTtcbiAgICB9XG5cblxuICAgIC8qKiBHdWVzcyB0aGUga2V5IHNpZ25hdHVyZSwgZ2l2ZW4gdGhlIG1pZGkgbm90ZSBudW1iZXJzIHVzZWQgaW5cbiAgICAgKiB0aGUgc29uZy5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIEtleVNpZ25hdHVyZSBHdWVzcyhMaXN0PGludD4gbm90ZXMpIHtcbiAgICAgICAgQ3JlYXRlQWNjaWRlbnRhbE1hcHMoKTtcblxuICAgICAgICAvKiBHZXQgdGhlIGZyZXF1ZW5jeSBjb3VudCBvZiBlYWNoIG5vdGUgaW4gdGhlIDEyLW5vdGUgc2NhbGUgKi9cbiAgICAgICAgaW50W10gbm90ZWNvdW50ID0gbmV3IGludFsxMl07XG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgbm90ZXMuQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgaW50IG5vdGVudW1iZXIgPSBub3Rlc1tpXTtcbiAgICAgICAgICAgIGludCBub3Rlc2NhbGUgPSAobm90ZW51bWJlciArIDMpICUgMTI7XG4gICAgICAgICAgICBub3RlY291bnRbbm90ZXNjYWxlXSArPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogRm9yIGVhY2gga2V5IHNpZ25hdHVyZSwgY291bnQgdGhlIHRvdGFsIG51bWJlciBvZiBhY2NpZGVudGFsc1xuICAgICAgICAgKiBuZWVkZWQgdG8gZGlzcGxheSBhbGwgdGhlIG5vdGVzLiAgQ2hvb3NlIHRoZSBrZXkgc2lnbmF0dXJlXG4gICAgICAgICAqIHdpdGggdGhlIGZld2VzdCBhY2NpZGVudGFscy5cbiAgICAgICAgICovXG4gICAgICAgIGludCBiZXN0a2V5ID0gMDtcbiAgICAgICAgYm9vbCBpc19iZXN0X3NoYXJwID0gdHJ1ZTtcbiAgICAgICAgaW50IHNtYWxsZXN0X2FjY2lkX2NvdW50ID0gbm90ZXMuQ291bnQ7XG4gICAgICAgIGludCBrZXk7XG5cbiAgICAgICAgZm9yIChrZXkgPSAwOyBrZXkgPCA2OyBrZXkrKykge1xuICAgICAgICAgICAgaW50IGFjY2lkX2NvdW50ID0gMDtcbiAgICAgICAgICAgIGZvciAoaW50IG4gPSAwOyBuIDwgMTI7IG4rKykge1xuICAgICAgICAgICAgICAgIGlmIChzaGFycGtleXNba2V5XVtuXSAhPSBBY2NpZC5Ob25lKSB7XG4gICAgICAgICAgICAgICAgICAgIGFjY2lkX2NvdW50ICs9IG5vdGVjb3VudFtuXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYWNjaWRfY291bnQgPCBzbWFsbGVzdF9hY2NpZF9jb3VudCkge1xuICAgICAgICAgICAgICAgIHNtYWxsZXN0X2FjY2lkX2NvdW50ID0gYWNjaWRfY291bnQ7XG4gICAgICAgICAgICAgICAgYmVzdGtleSA9IGtleTtcbiAgICAgICAgICAgICAgICBpc19iZXN0X3NoYXJwID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoa2V5ID0gMDsga2V5IDwgNzsga2V5KyspIHtcbiAgICAgICAgICAgIGludCBhY2NpZF9jb3VudCA9IDA7XG4gICAgICAgICAgICBmb3IgKGludCBuID0gMDsgbiA8IDEyOyBuKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoZmxhdGtleXNba2V5XVtuXSAhPSBBY2NpZC5Ob25lKSB7XG4gICAgICAgICAgICAgICAgICAgIGFjY2lkX2NvdW50ICs9IG5vdGVjb3VudFtuXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYWNjaWRfY291bnQgPCBzbWFsbGVzdF9hY2NpZF9jb3VudCkge1xuICAgICAgICAgICAgICAgIHNtYWxsZXN0X2FjY2lkX2NvdW50ID0gYWNjaWRfY291bnQ7XG4gICAgICAgICAgICAgICAgYmVzdGtleSA9IGtleTtcbiAgICAgICAgICAgICAgICBpc19iZXN0X3NoYXJwID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzX2Jlc3Rfc2hhcnApIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgS2V5U2lnbmF0dXJlKGJlc3RrZXksIDApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBLZXlTaWduYXR1cmUoMCwgYmVzdGtleSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRydWUgaWYgdGhpcyBrZXkgc2lnbmF0dXJlIGlzIGVxdWFsIHRvIGtleSBzaWduYXR1cmUgayAqL1xuICAgIHB1YmxpYyBib29sIEVxdWFscyhLZXlTaWduYXR1cmUgaykge1xuICAgICAgICBpZiAoay5udW1fc2hhcnBzID09IG51bV9zaGFycHMgJiYgay5udW1fZmxhdHMgPT0gbnVtX2ZsYXRzKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiBSZXR1cm4gdGhlIE1ham9yIEtleSBvZiB0aGlzIEtleSBTaWduYXR1cmUgKi9cbiAgICBwdWJsaWMgaW50IE5vdGVzY2FsZSgpIHtcbiAgICAgICAgaW50W10gZmxhdG1ham9yID0ge1xuICAgICAgICAgICAgTm90ZVNjYWxlLkMsIE5vdGVTY2FsZS5GLCBOb3RlU2NhbGUuQmZsYXQsIE5vdGVTY2FsZS5FZmxhdCxcbiAgICAgICAgICAgIE5vdGVTY2FsZS5BZmxhdCwgTm90ZVNjYWxlLkRmbGF0LCBOb3RlU2NhbGUuR2ZsYXQsIE5vdGVTY2FsZS5CIFxuICAgICAgICB9O1xuXG4gICAgICAgIGludFtdIHNoYXJwbWFqb3IgPSB7XG4gICAgICAgICAgICBOb3RlU2NhbGUuQywgTm90ZVNjYWxlLkcsIE5vdGVTY2FsZS5ELCBOb3RlU2NhbGUuQSwgTm90ZVNjYWxlLkUsXG4gICAgICAgICAgICBOb3RlU2NhbGUuQiwgTm90ZVNjYWxlLkZzaGFycCwgTm90ZVNjYWxlLkNzaGFycCwgTm90ZVNjYWxlLkdzaGFycCxcbiAgICAgICAgICAgIE5vdGVTY2FsZS5Ec2hhcnBcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKG51bV9mbGF0cyA+IDApXG4gICAgICAgICAgICByZXR1cm4gZmxhdG1ham9yW251bV9mbGF0c107XG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICByZXR1cm4gc2hhcnBtYWpvcltudW1fc2hhcnBzXTtcbiAgICB9XG5cbiAgICAvKiBDb252ZXJ0IGEgTWFqb3IgS2V5IGludG8gYSBzdHJpbmcgKi9cbiAgICBwdWJsaWMgc3RhdGljIHN0cmluZyBLZXlUb1N0cmluZyhpbnQgbm90ZXNjYWxlKSB7XG4gICAgICAgIHN3aXRjaCAobm90ZXNjYWxlKSB7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5BOiAgICAgcmV0dXJuIFwiQSBtYWpvciwgRiMgbWlub3JcIiA7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5CZmxhdDogcmV0dXJuIFwiQi1mbGF0IG1ham9yLCBHIG1pbm9yXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5COiAgICAgcmV0dXJuIFwiQiBtYWpvciwgQS1mbGF0IG1pbm9yXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5DOiAgICAgcmV0dXJuIFwiQyBtYWpvciwgQSBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRGZsYXQ6IHJldHVybiBcIkQtZmxhdCBtYWpvciwgQi1mbGF0IG1pbm9yXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5EOiAgICAgcmV0dXJuIFwiRCBtYWpvciwgQiBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRWZsYXQ6IHJldHVybiBcIkUtZmxhdCBtYWpvciwgQyBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRTogICAgIHJldHVybiBcIkUgbWFqb3IsIEMjIG1pbm9yXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5GOiAgICAgcmV0dXJuIFwiRiBtYWpvciwgRCBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuR2ZsYXQ6IHJldHVybiBcIkctZmxhdCBtYWpvciwgRS1mbGF0IG1pbm9yXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5HOiAgICAgcmV0dXJuIFwiRyBtYWpvciwgRSBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQWZsYXQ6IHJldHVybiBcIkEtZmxhdCBtYWpvciwgRiBtaW5vclwiO1xuICAgICAgICAgICAgZGVmYXVsdDogICAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMga2V5IHNpZ25hdHVyZS5cbiAgICAgKiBXZSBvbmx5IHJldHVybiB0aGUgbWFqb3Iga2V5IHNpZ25hdHVyZSwgbm90IHRoZSBtaW5vciBvbmUuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIEtleVRvU3RyaW5nKCBOb3Rlc2NhbGUoKSApO1xuICAgIH1cblxuXG59XG5cbn1cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMiBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogQGNsYXNzIEx5cmljU3ltYm9sXG4gKiAgQSBseXJpYyBjb250YWlucyB0aGUgbHlyaWMgdG8gZGlzcGxheSwgdGhlIHN0YXJ0IHRpbWUgdGhlIGx5cmljIG9jY3VycyBhdCxcbiAqICB0aGUgdGhlIHgtY29vcmRpbmF0ZSB3aGVyZSBpdCB3aWxsIGJlIGRpc3BsYXllZC5cbiAqL1xucHVibGljIGNsYXNzIEx5cmljU3ltYm9sIHtcbiAgICBwcml2YXRlIGludCBzdGFydHRpbWU7ICAgLyoqIFRoZSBzdGFydCB0aW1lLCBpbiBwdWxzZXMgKi9cbiAgICBwcml2YXRlIHN0cmluZyB0ZXh0OyAgICAgLyoqIFRoZSBseXJpYyB0ZXh0ICovXG4gICAgcHJpdmF0ZSBpbnQgeDsgICAgICAgICAgIC8qKiBUaGUgeCAoaG9yaXpvbnRhbCkgcG9zaXRpb24gd2l0aGluIHRoZSBzdGFmZiAqL1xuXG4gICAgcHVibGljIEx5cmljU3ltYm9sKGludCBzdGFydHRpbWUsIHN0cmluZyB0ZXh0KSB7XG4gICAgICAgIHRoaXMuc3RhcnR0aW1lID0gc3RhcnR0aW1lOyBcbiAgICAgICAgdGhpcy50ZXh0ID0gdGV4dDtcbiAgICB9XG4gICAgIFxuICAgIHB1YmxpYyBpbnQgU3RhcnRUaW1lIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHN0YXJ0dGltZTsgfVxuICAgICAgICBzZXQgeyBzdGFydHRpbWUgPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzdHJpbmcgVGV4dCB7XG4gICAgICAgIGdldCB7IHJldHVybiB0ZXh0OyB9XG4gICAgICAgIHNldCB7IHRleHQgPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIHB1YmxpYyBpbnQgWCB7XG4gICAgICAgIGdldCB7IHJldHVybiB4OyB9XG4gICAgICAgIHNldCB7IHggPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIHB1YmxpYyBpbnQgTWluV2lkdGgge1xuICAgICAgICBnZXQgeyByZXR1cm4gbWluV2lkdGgoKTsgfVxuICAgIH1cblxuICAgIC8qIFJldHVybiB0aGUgbWluaW11bSB3aWR0aCBpbiBwaXhlbHMgbmVlZGVkIHRvIGRpc3BsYXkgdGhpcyBseXJpYy5cbiAgICAgKiBUaGlzIGlzIGFuIGVzdGltYXRpb24sIG5vdCBleGFjdC5cbiAgICAgKi9cbiAgICBwcml2YXRlIGludCBtaW5XaWR0aCgpIHsgXG4gICAgICAgIGZsb2F0IHdpZHRoUGVyQ2hhciA9IFNoZWV0TXVzaWMuTGV0dGVyRm9udC5HZXRIZWlnaHQoKSAqIDIuMGYvMy4wZjtcbiAgICAgICAgZmxvYXQgd2lkdGggPSB0ZXh0Lkxlbmd0aCAqIHdpZHRoUGVyQ2hhcjtcbiAgICAgICAgaWYgKHRleHQuSW5kZXhPZihcImlcIikgPj0gMCkge1xuICAgICAgICAgICAgd2lkdGggLT0gd2lkdGhQZXJDaGFyLzIuMGY7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRleHQuSW5kZXhPZihcImpcIikgPj0gMCkge1xuICAgICAgICAgICAgd2lkdGggLT0gd2lkdGhQZXJDaGFyLzIuMGY7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRleHQuSW5kZXhPZihcImxcIikgPj0gMCkge1xuICAgICAgICAgICAgd2lkdGggLT0gd2lkdGhQZXJDaGFyLzIuMGY7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChpbnQpd2lkdGg7XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIFxuICAgIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJMeXJpYyBzdGFydD17MH0geD17MX0gdGV4dD17Mn1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnR0aW1lLCB4LCB0ZXh0KTtcbiAgICB9XG5cbn1cblxuXG59XG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTIgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIEBjbGFzcyBNaWRpRXZlbnRcbiAqIEEgTWlkaUV2ZW50IHJlcHJlc2VudHMgYSBzaW5nbGUgZXZlbnQgKHN1Y2ggYXMgRXZlbnROb3RlT24pIGluIHRoZVxuICogTWlkaSBmaWxlLiBJdCBpbmNsdWRlcyB0aGUgZGVsdGEgdGltZSBvZiB0aGUgZXZlbnQuXG4gKi9cbnB1YmxpYyBjbGFzcyBNaWRpRXZlbnQgOiBJQ29tcGFyZXI8TWlkaUV2ZW50PiB7XG5cbiAgICBwdWJsaWMgaW50ICAgIERlbHRhVGltZTsgICAgIC8qKiBUaGUgdGltZSBiZXR3ZWVuIHRoZSBwcmV2aW91cyBldmVudCBhbmQgdGhpcyBvbiAqL1xuICAgIHB1YmxpYyBpbnQgICAgU3RhcnRUaW1lOyAgICAgLyoqIFRoZSBhYnNvbHV0ZSB0aW1lIHRoaXMgZXZlbnQgb2NjdXJzICovXG4gICAgcHVibGljIGJvb2wgICBIYXNFdmVudGZsYWc7ICAvKiogRmFsc2UgaWYgdGhpcyBpcyB1c2luZyB0aGUgcHJldmlvdXMgZXZlbnRmbGFnICovXG4gICAgcHVibGljIGJ5dGUgICBFdmVudEZsYWc7ICAgICAvKiogTm90ZU9uLCBOb3RlT2ZmLCBldGMuICBGdWxsIGxpc3QgaXMgaW4gY2xhc3MgTWlkaUZpbGUgKi9cbiAgICBwdWJsaWMgYnl0ZSAgIENoYW5uZWw7ICAgICAgIC8qKiBUaGUgY2hhbm5lbCB0aGlzIGV2ZW50IG9jY3VycyBvbiAqLyBcblxuICAgIHB1YmxpYyBieXRlICAgTm90ZW51bWJlcjsgICAgLyoqIFRoZSBub3RlIG51bWJlciAgKi9cbiAgICBwdWJsaWMgYnl0ZSAgIFZlbG9jaXR5OyAgICAgIC8qKiBUaGUgdm9sdW1lIG9mIHRoZSBub3RlICovXG4gICAgcHVibGljIGJ5dGUgICBJbnN0cnVtZW50OyAgICAvKiogVGhlIGluc3RydW1lbnQgKi9cbiAgICBwdWJsaWMgYnl0ZSAgIEtleVByZXNzdXJlOyAgIC8qKiBUaGUga2V5IHByZXNzdXJlICovXG4gICAgcHVibGljIGJ5dGUgICBDaGFuUHJlc3N1cmU7ICAvKiogVGhlIGNoYW5uZWwgcHJlc3N1cmUgKi9cbiAgICBwdWJsaWMgYnl0ZSAgIENvbnRyb2xOdW07ICAgIC8qKiBUaGUgY29udHJvbGxlciBudW1iZXIgKi9cbiAgICBwdWJsaWMgYnl0ZSAgIENvbnRyb2xWYWx1ZTsgIC8qKiBUaGUgY29udHJvbGxlciB2YWx1ZSAqL1xuICAgIHB1YmxpYyB1c2hvcnQgUGl0Y2hCZW5kOyAgICAgLyoqIFRoZSBwaXRjaCBiZW5kIHZhbHVlICovXG4gICAgcHVibGljIGJ5dGUgICBOdW1lcmF0b3I7ICAgICAvKiogVGhlIG51bWVyYXRvciwgZm9yIFRpbWVTaWduYXR1cmUgbWV0YSBldmVudHMgKi9cbiAgICBwdWJsaWMgYnl0ZSAgIERlbm9taW5hdG9yOyAgIC8qKiBUaGUgZGVub21pbmF0b3IsIGZvciBUaW1lU2lnbmF0dXJlIG1ldGEgZXZlbnRzICovXG4gICAgcHVibGljIGludCAgICBUZW1wbzsgICAgICAgICAvKiogVGhlIHRlbXBvLCBmb3IgVGVtcG8gbWV0YSBldmVudHMgKi9cbiAgICBwdWJsaWMgYnl0ZSAgIE1ldGFldmVudDsgICAgIC8qKiBUaGUgbWV0YWV2ZW50LCB1c2VkIGlmIGV2ZW50ZmxhZyBpcyBNZXRhRXZlbnQgKi9cbiAgICBwdWJsaWMgaW50ICAgIE1ldGFsZW5ndGg7ICAgIC8qKiBUaGUgbWV0YWV2ZW50IGxlbmd0aCAgKi9cbiAgICBwdWJsaWMgYnl0ZVtdIFZhbHVlOyAgICAgICAgIC8qKiBUaGUgcmF3IGJ5dGUgdmFsdWUsIGZvciBTeXNleCBhbmQgbWV0YSBldmVudHMgKi9cblxuICAgIHB1YmxpYyBNaWRpRXZlbnQoKSB7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiBhIGNvcHkgb2YgdGhpcyBldmVudCAqL1xuICAgIHB1YmxpYyBNaWRpRXZlbnQgQ2xvbmUoKSB7XG4gICAgICAgIE1pZGlFdmVudCBtZXZlbnQ9IG5ldyBNaWRpRXZlbnQoKTtcbiAgICAgICAgbWV2ZW50LkRlbHRhVGltZSA9IERlbHRhVGltZTtcbiAgICAgICAgbWV2ZW50LlN0YXJ0VGltZSA9IFN0YXJ0VGltZTtcbiAgICAgICAgbWV2ZW50Lkhhc0V2ZW50ZmxhZyA9IEhhc0V2ZW50ZmxhZztcbiAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IEV2ZW50RmxhZztcbiAgICAgICAgbWV2ZW50LkNoYW5uZWwgPSBDaGFubmVsO1xuICAgICAgICBtZXZlbnQuTm90ZW51bWJlciA9IE5vdGVudW1iZXI7XG4gICAgICAgIG1ldmVudC5WZWxvY2l0eSA9IFZlbG9jaXR5O1xuICAgICAgICBtZXZlbnQuSW5zdHJ1bWVudCA9IEluc3RydW1lbnQ7XG4gICAgICAgIG1ldmVudC5LZXlQcmVzc3VyZSA9IEtleVByZXNzdXJlO1xuICAgICAgICBtZXZlbnQuQ2hhblByZXNzdXJlID0gQ2hhblByZXNzdXJlO1xuICAgICAgICBtZXZlbnQuQ29udHJvbE51bSA9IENvbnRyb2xOdW07XG4gICAgICAgIG1ldmVudC5Db250cm9sVmFsdWUgPSBDb250cm9sVmFsdWU7XG4gICAgICAgIG1ldmVudC5QaXRjaEJlbmQgPSBQaXRjaEJlbmQ7XG4gICAgICAgIG1ldmVudC5OdW1lcmF0b3IgPSBOdW1lcmF0b3I7XG4gICAgICAgIG1ldmVudC5EZW5vbWluYXRvciA9IERlbm9taW5hdG9yO1xuICAgICAgICBtZXZlbnQuVGVtcG8gPSBUZW1wbztcbiAgICAgICAgbWV2ZW50Lk1ldGFldmVudCA9IE1ldGFldmVudDtcbiAgICAgICAgbWV2ZW50Lk1ldGFsZW5ndGggPSBNZXRhbGVuZ3RoO1xuICAgICAgICBtZXZlbnQuVmFsdWUgPSBWYWx1ZTtcbiAgICAgICAgcmV0dXJuIG1ldmVudDtcbiAgICB9XG5cbiAgICAvKiogQ29tcGFyZSB0d28gTWlkaUV2ZW50cyBiYXNlZCBvbiB0aGVpciBzdGFydCB0aW1lcy4gKi9cbiAgICBwdWJsaWMgaW50IENvbXBhcmUoTWlkaUV2ZW50IHgsIE1pZGlFdmVudCB5KSB7XG4gICAgICAgIGlmICh4LlN0YXJ0VGltZSA9PSB5LlN0YXJ0VGltZSkge1xuICAgICAgICAgICAgaWYgKHguRXZlbnRGbGFnID09IHkuRXZlbnRGbGFnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHguTm90ZW51bWJlciAtIHkuTm90ZW51bWJlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB4LkV2ZW50RmxhZyAtIHkuRXZlbnRGbGFnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHguU3RhcnRUaW1lIC0geS5TdGFydFRpbWU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbn0gIC8qIEVuZCBuYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMgKi9cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDEyIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcblxyXG4gICAgLyogVGhpcyBmaWxlIGNvbnRhaW5zIHRoZSBjbGFzc2VzIGZvciBwYXJzaW5nIGFuZCBtb2RpZnlpbmdcclxuICAgICAqIE1JREkgbXVzaWMgZmlsZXMuXHJcbiAgICAgKi9cclxuXHJcbiAgICAvKiBNSURJIGZpbGUgZm9ybWF0LlxyXG4gICAgICpcclxuICAgICAqIFRoZSBNaWRpIEZpbGUgZm9ybWF0IGlzIGRlc2NyaWJlZCBiZWxvdy4gIFRoZSBkZXNjcmlwdGlvbiB1c2VzXHJcbiAgICAgKiB0aGUgZm9sbG93aW5nIGFiYnJldmlhdGlvbnMuXHJcbiAgICAgKlxyXG4gICAgICogdTEgICAgIC0gT25lIGJ5dGVcclxuICAgICAqIHUyICAgICAtIFR3byBieXRlcyAoYmlnIGVuZGlhbilcclxuICAgICAqIHU0ICAgICAtIEZvdXIgYnl0ZXMgKGJpZyBlbmRpYW4pXHJcbiAgICAgKiB2YXJsZW4gLSBBIHZhcmlhYmxlIGxlbmd0aCBpbnRlZ2VyLCB0aGF0IGNhbiBiZSAxIHRvIDQgYnl0ZXMuIFRoZSBcclxuICAgICAqICAgICAgICAgIGludGVnZXIgZW5kcyB3aGVuIHlvdSBlbmNvdW50ZXIgYSBieXRlIHRoYXQgZG9lc24ndCBoYXZlIFxyXG4gICAgICogICAgICAgICAgdGhlIDh0aCBiaXQgc2V0IChhIGJ5dGUgbGVzcyB0aGFuIDB4ODApLlxyXG4gICAgICogbGVuPyAgIC0gVGhlIGxlbmd0aCBvZiB0aGUgZGF0YSBkZXBlbmRzIG9uIHNvbWUgY29kZVxyXG4gICAgICogICAgICAgICAgXHJcbiAgICAgKlxyXG4gICAgICogVGhlIE1pZGkgZmlsZXMgYmVnaW5zIHdpdGggdGhlIG1haW4gTWlkaSBoZWFkZXJcclxuICAgICAqIHU0ID0gVGhlIGZvdXIgYXNjaWkgY2hhcmFjdGVycyAnTVRoZCdcclxuICAgICAqIHU0ID0gVGhlIGxlbmd0aCBvZiB0aGUgTVRoZCBoZWFkZXIgPSA2IGJ5dGVzXHJcbiAgICAgKiB1MiA9IDAgaWYgdGhlIGZpbGUgY29udGFpbnMgYSBzaW5nbGUgdHJhY2tcclxuICAgICAqICAgICAgMSBpZiB0aGUgZmlsZSBjb250YWlucyBvbmUgb3IgbW9yZSBzaW11bHRhbmVvdXMgdHJhY2tzXHJcbiAgICAgKiAgICAgIDIgaWYgdGhlIGZpbGUgY29udGFpbnMgb25lIG9yIG1vcmUgaW5kZXBlbmRlbnQgdHJhY2tzXHJcbiAgICAgKiB1MiA9IG51bWJlciBvZiB0cmFja3NcclxuICAgICAqIHUyID0gaWYgPiAgMCwgdGhlIG51bWJlciBvZiBwdWxzZXMgcGVyIHF1YXJ0ZXIgbm90ZVxyXG4gICAgICogICAgICBpZiA8PSAwLCB0aGVuID8/P1xyXG4gICAgICpcclxuICAgICAqIE5leHQgY29tZSB0aGUgaW5kaXZpZHVhbCBNaWRpIHRyYWNrcy4gIFRoZSB0b3RhbCBudW1iZXIgb2YgTWlkaVxyXG4gICAgICogdHJhY2tzIHdhcyBnaXZlbiBhYm92ZSwgaW4gdGhlIE1UaGQgaGVhZGVyLiAgRWFjaCB0cmFjayBzdGFydHNcclxuICAgICAqIHdpdGggYSBoZWFkZXI6XHJcbiAgICAgKlxyXG4gICAgICogdTQgPSBUaGUgZm91ciBhc2NpaSBjaGFyYWN0ZXJzICdNVHJrJ1xyXG4gICAgICogdTQgPSBBbW91bnQgb2YgdHJhY2sgZGF0YSwgaW4gYnl0ZXMuXHJcbiAgICAgKiBcclxuICAgICAqIFRoZSB0cmFjayBkYXRhIGNvbnNpc3RzIG9mIGEgc2VyaWVzIG9mIE1pZGkgZXZlbnRzLiAgRWFjaCBNaWRpIGV2ZW50XHJcbiAgICAgKiBoYXMgdGhlIGZvbGxvd2luZyBmb3JtYXQ6XHJcbiAgICAgKlxyXG4gICAgICogdmFybGVuICAtIFRoZSB0aW1lIGJldHdlZW4gdGhlIHByZXZpb3VzIGV2ZW50IGFuZCB0aGlzIGV2ZW50LCBtZWFzdXJlZFxyXG4gICAgICogICAgICAgICAgIGluIFwicHVsc2VzXCIuICBUaGUgbnVtYmVyIG9mIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlIGlzIGdpdmVuXHJcbiAgICAgKiAgICAgICAgICAgaW4gdGhlIE1UaGQgaGVhZGVyLlxyXG4gICAgICogdTEgICAgICAtIFRoZSBFdmVudCBjb2RlLCBhbHdheXMgYmV0d2VlIDB4ODAgYW5kIDB4RkZcclxuICAgICAqIGxlbj8gICAgLSBUaGUgZXZlbnQgZGF0YS4gIFRoZSBsZW5ndGggb2YgdGhpcyBkYXRhIGlzIGRldGVybWluZWQgYnkgdGhlXHJcbiAgICAgKiAgICAgICAgICAgZXZlbnQgY29kZS4gIFRoZSBmaXJzdCBieXRlIG9mIHRoZSBldmVudCBkYXRhIGlzIGFsd2F5cyA8IDB4ODAuXHJcbiAgICAgKlxyXG4gICAgICogVGhlIGV2ZW50IGNvZGUgaXMgb3B0aW9uYWwuICBJZiB0aGUgZXZlbnQgY29kZSBpcyBtaXNzaW5nLCB0aGVuIGl0XHJcbiAgICAgKiBkZWZhdWx0cyB0byB0aGUgcHJldmlvdXMgZXZlbnQgY29kZS4gIEZvciBleGFtcGxlOlxyXG4gICAgICpcclxuICAgICAqICAgdmFybGVuLCBldmVudGNvZGUxLCBldmVudGRhdGEsXHJcbiAgICAgKiAgIHZhcmxlbiwgZXZlbnRjb2RlMiwgZXZlbnRkYXRhLFxyXG4gICAgICogICB2YXJsZW4sIGV2ZW50ZGF0YSwgIC8vIGV2ZW50Y29kZSBpcyBldmVudGNvZGUyXHJcbiAgICAgKiAgIHZhcmxlbiwgZXZlbnRkYXRhLCAgLy8gZXZlbnRjb2RlIGlzIGV2ZW50Y29kZTJcclxuICAgICAqICAgdmFybGVuLCBldmVudGNvZGUzLCBldmVudGRhdGEsXHJcbiAgICAgKiAgIC4uLi5cclxuICAgICAqXHJcbiAgICAgKiAgIEhvdyBkbyB5b3Uga25vdyBpZiB0aGUgZXZlbnRjb2RlIGlzIHRoZXJlIG9yIG1pc3Npbmc/IFdlbGw6XHJcbiAgICAgKiAgIC0gQWxsIGV2ZW50IGNvZGVzIGFyZSBiZXR3ZWVuIDB4ODAgYW5kIDB4RkZcclxuICAgICAqICAgLSBUaGUgZmlyc3QgYnl0ZSBvZiBldmVudGRhdGEgaXMgYWx3YXlzIGxlc3MgdGhhbiAweDgwLlxyXG4gICAgICogICBTbywgYWZ0ZXIgdGhlIHZhcmxlbiBkZWx0YSB0aW1lLCBpZiB0aGUgbmV4dCBieXRlIGlzIGJldHdlZW4gMHg4MFxyXG4gICAgICogICBhbmQgMHhGRiwgaXRzIGFuIGV2ZW50IGNvZGUuICBPdGhlcndpc2UsIGl0cyBldmVudCBkYXRhLlxyXG4gICAgICpcclxuICAgICAqIFRoZSBFdmVudCBjb2RlcyBhbmQgZXZlbnQgZGF0YSBmb3IgZWFjaCBldmVudCBjb2RlIGFyZSBzaG93biBiZWxvdy5cclxuICAgICAqXHJcbiAgICAgKiBDb2RlOiAgdTEgLSAweDgwIHRocnUgMHg4RiAtIE5vdGUgT2ZmIGV2ZW50LlxyXG4gICAgICogICAgICAgICAgICAgMHg4MCBpcyBmb3IgY2hhbm5lbCAxLCAweDhGIGlzIGZvciBjaGFubmVsIDE2LlxyXG4gICAgICogRGF0YTogIHUxIC0gVGhlIG5vdGUgbnVtYmVyLCAwLTEyNy4gIE1pZGRsZSBDIGlzIDYwICgweDNDKVxyXG4gICAgICogICAgICAgIHUxIC0gVGhlIG5vdGUgdmVsb2NpdHkuICBUaGlzIHNob3VsZCBiZSAwXHJcbiAgICAgKiBcclxuICAgICAqIENvZGU6ICB1MSAtIDB4OTAgdGhydSAweDlGIC0gTm90ZSBPbiBldmVudC5cclxuICAgICAqICAgICAgICAgICAgIDB4OTAgaXMgZm9yIGNoYW5uZWwgMSwgMHg5RiBpcyBmb3IgY2hhbm5lbCAxNi5cclxuICAgICAqIERhdGE6ICB1MSAtIFRoZSBub3RlIG51bWJlciwgMC0xMjcuICBNaWRkbGUgQyBpcyA2MCAoMHgzQylcclxuICAgICAqICAgICAgICB1MSAtIFRoZSBub3RlIHZlbG9jaXR5LCBmcm9tIDAgKG5vIHNvdW5kKSB0byAxMjcgKGxvdWQpLlxyXG4gICAgICogICAgICAgICAgICAgQSB2YWx1ZSBvZiAwIGlzIGVxdWl2YWxlbnQgdG8gYSBOb3RlIE9mZi5cclxuICAgICAqXHJcbiAgICAgKiBDb2RlOiAgdTEgLSAweEEwIHRocnUgMHhBRiAtIEtleSBQcmVzc3VyZVxyXG4gICAgICogRGF0YTogIHUxIC0gVGhlIG5vdGUgbnVtYmVyLCAwLTEyNy5cclxuICAgICAqICAgICAgICB1MSAtIFRoZSBwcmVzc3VyZS5cclxuICAgICAqXHJcbiAgICAgKiBDb2RlOiAgdTEgLSAweEIwIHRocnUgMHhCRiAtIENvbnRyb2wgQ2hhbmdlXHJcbiAgICAgKiBEYXRhOiAgdTEgLSBUaGUgY29udHJvbGxlciBudW1iZXJcclxuICAgICAqICAgICAgICB1MSAtIFRoZSB2YWx1ZVxyXG4gICAgICpcclxuICAgICAqIENvZGU6ICB1MSAtIDB4QzAgdGhydSAweENGIC0gUHJvZ3JhbSBDaGFuZ2VcclxuICAgICAqIERhdGE6ICB1MSAtIFRoZSBwcm9ncmFtIG51bWJlci5cclxuICAgICAqXHJcbiAgICAgKiBDb2RlOiAgdTEgLSAweEQwIHRocnUgMHhERiAtIENoYW5uZWwgUHJlc3N1cmVcclxuICAgICAqICAgICAgICB1MSAtIFRoZSBwcmVzc3VyZS5cclxuICAgICAqXHJcbiAgICAgKiBDb2RlOiAgdTEgLSAweEUwIHRocnUgMHhFRiAtIFBpdGNoIEJlbmRcclxuICAgICAqIERhdGE6ICB1MiAtIFNvbWUgZGF0YVxyXG4gICAgICpcclxuICAgICAqIENvZGU6ICB1MSAgICAgLSAweEZGIC0gTWV0YSBFdmVudFxyXG4gICAgICogRGF0YTogIHUxICAgICAtIE1ldGFjb2RlXHJcbiAgICAgKiAgICAgICAgdmFybGVuIC0gTGVuZ3RoIG9mIG1ldGEgZXZlbnRcclxuICAgICAqICAgICAgICB1MVt2YXJsZW5dIC0gTWV0YSBldmVudCBkYXRhLlxyXG4gICAgICpcclxuICAgICAqXHJcbiAgICAgKiBUaGUgTWV0YSBFdmVudCBjb2RlcyBhcmUgbGlzdGVkIGJlbG93OlxyXG4gICAgICpcclxuICAgICAqIE1ldGFjb2RlOiB1MSAgICAgICAgIC0gMHgwICBTZXF1ZW5jZSBOdW1iZXJcclxuICAgICAqICAgICAgICAgICB2YXJsZW4gICAgIC0gMCBvciAyXHJcbiAgICAgKiAgICAgICAgICAgdTFbdmFybGVuXSAtIFNlcXVlbmNlIG51bWJlclxyXG4gICAgICpcclxuICAgICAqIE1ldGFjb2RlOiB1MSAgICAgICAgIC0gMHgxICBUZXh0XHJcbiAgICAgKiAgICAgICAgICAgdmFybGVuICAgICAtIExlbmd0aCBvZiB0ZXh0XHJcbiAgICAgKiAgICAgICAgICAgdTFbdmFybGVuXSAtIFRleHRcclxuICAgICAqXHJcbiAgICAgKiBNZXRhY29kZTogdTEgICAgICAgICAtIDB4MiAgQ29weXJpZ2h0XHJcbiAgICAgKiAgICAgICAgICAgdmFybGVuICAgICAtIExlbmd0aCBvZiB0ZXh0XHJcbiAgICAgKiAgICAgICAgICAgdTFbdmFybGVuXSAtIFRleHRcclxuICAgICAqXHJcbiAgICAgKiBNZXRhY29kZTogdTEgICAgICAgICAtIDB4MyAgVHJhY2sgTmFtZVxyXG4gICAgICogICAgICAgICAgIHZhcmxlbiAgICAgLSBMZW5ndGggb2YgbmFtZVxyXG4gICAgICogICAgICAgICAgIHUxW3Zhcmxlbl0gLSBUcmFjayBOYW1lXHJcbiAgICAgKlxyXG4gICAgICogTWV0YWNvZGU6IHUxICAgICAgICAgLSAweDU4ICBUaW1lIFNpZ25hdHVyZVxyXG4gICAgICogICAgICAgICAgIHZhcmxlbiAgICAgLSA0IFxyXG4gICAgICogICAgICAgICAgIHUxICAgICAgICAgLSBudW1lcmF0b3JcclxuICAgICAqICAgICAgICAgICB1MSAgICAgICAgIC0gbG9nMihkZW5vbWluYXRvcilcclxuICAgICAqICAgICAgICAgICB1MSAgICAgICAgIC0gY2xvY2tzIGluIG1ldHJvbm9tZSBjbGlja1xyXG4gICAgICogICAgICAgICAgIHUxICAgICAgICAgLSAzMm5kIG5vdGVzIGluIHF1YXJ0ZXIgbm90ZSAodXN1YWxseSA4KVxyXG4gICAgICpcclxuICAgICAqIE1ldGFjb2RlOiB1MSAgICAgICAgIC0gMHg1OSAgS2V5IFNpZ25hdHVyZVxyXG4gICAgICogICAgICAgICAgIHZhcmxlbiAgICAgLSAyXHJcbiAgICAgKiAgICAgICAgICAgdTEgICAgICAgICAtIGlmID49IDAsIHRoZW4gbnVtYmVyIG9mIHNoYXJwc1xyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICBpZiA8IDAsIHRoZW4gbnVtYmVyIG9mIGZsYXRzICogLTFcclxuICAgICAqICAgICAgICAgICB1MSAgICAgICAgIC0gMCBpZiBtYWpvciBrZXlcclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgMSBpZiBtaW5vciBrZXlcclxuICAgICAqXHJcbiAgICAgKiBNZXRhY29kZTogdTEgICAgICAgICAtIDB4NTEgIFRlbXBvXHJcbiAgICAgKiAgICAgICAgICAgdmFybGVuICAgICAtIDMgIFxyXG4gICAgICogICAgICAgICAgIHUzICAgICAgICAgLSBxdWFydGVyIG5vdGUgbGVuZ3RoIGluIG1pY3Jvc2Vjb25kc1xyXG4gICAgICovXHJcblxyXG5cclxuICAgIC8qKiBAY2xhc3MgTWlkaUZpbGVcbiAgICAgKlxuICAgICAqIFRoZSBNaWRpRmlsZSBjbGFzcyBjb250YWlucyB0aGUgcGFyc2VkIGRhdGEgZnJvbSB0aGUgTWlkaSBGaWxlLlxuICAgICAqIEl0IGNvbnRhaW5zOlxuICAgICAqIC0gQWxsIHRoZSB0cmFja3MgaW4gdGhlIG1pZGkgZmlsZSwgaW5jbHVkaW5nIGFsbCBNaWRpTm90ZXMgcGVyIHRyYWNrLlxuICAgICAqIC0gVGhlIHRpbWUgc2lnbmF0dXJlIChlLmcuIDQvNCwgMy80LCA2LzgpXG4gICAgICogLSBUaGUgbnVtYmVyIG9mIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlLlxuICAgICAqIC0gVGhlIHRlbXBvIChudW1iZXIgb2YgbWljcm9zZWNvbmRzIHBlciBxdWFydGVyIG5vdGUpLlxuICAgICAqXG4gICAgICogVGhlIGNvbnN0cnVjdG9yIHRha2VzIGEgZmlsZW5hbWUgYXMgaW5wdXQsIGFuZCB1cG9uIHJldHVybmluZyxcbiAgICAgKiBjb250YWlucyB0aGUgcGFyc2VkIGRhdGEgZnJvbSB0aGUgbWlkaSBmaWxlLlxuICAgICAqXG4gICAgICogVGhlIG1ldGhvZHMgUmVhZFRyYWNrKCkgYW5kIFJlYWRNZXRhRXZlbnQoKSBhcmUgaGVscGVyIGZ1bmN0aW9ucyBjYWxsZWRcbiAgICAgKiBieSB0aGUgY29uc3RydWN0b3IgZHVyaW5nIHRoZSBwYXJzaW5nLlxuICAgICAqXG4gICAgICogQWZ0ZXIgdGhlIE1pZGlGaWxlIGlzIHBhcnNlZCBhbmQgY3JlYXRlZCwgdGhlIHVzZXIgY2FuIHJldHJpZXZlIHRoZSBcbiAgICAgKiB0cmFja3MgYW5kIG5vdGVzIGJ5IHVzaW5nIHRoZSBwcm9wZXJ0eSBUcmFja3MgYW5kIFRyYWNrcy5Ob3Rlcy5cbiAgICAgKlxuICAgICAqIFRoZXJlIGFyZSB0d28gbWV0aG9kcyBmb3IgbW9kaWZ5aW5nIHRoZSBtaWRpIGRhdGEgYmFzZWQgb24gdGhlIG1lbnVcbiAgICAgKiBvcHRpb25zIHNlbGVjdGVkOlxuICAgICAqXG4gICAgICogLSBDaGFuZ2VNaWRpTm90ZXMoKVxuICAgICAqICAgQXBwbHkgdGhlIG1lbnUgb3B0aW9ucyB0byB0aGUgcGFyc2VkIE1pZGlGaWxlLiAgVGhpcyB1c2VzIHRoZSBoZWxwZXIgZnVuY3Rpb25zOlxuICAgICAqICAgICBTcGxpdFRyYWNrKClcbiAgICAgKiAgICAgQ29tYmluZVRvVHdvVHJhY2tzKClcbiAgICAgKiAgICAgU2hpZnRUaW1lKClcbiAgICAgKiAgICAgVHJhbnNwb3NlKClcbiAgICAgKiAgICAgUm91bmRTdGFydFRpbWVzKClcbiAgICAgKiAgICAgUm91bmREdXJhdGlvbnMoKVxuICAgICAqXG4gICAgICogLSBDaGFuZ2VTb3VuZCgpXG4gICAgICogICBBcHBseSB0aGUgbWVudSBvcHRpb25zIHRvIHRoZSBNSURJIG11c2ljIGRhdGEsIGFuZCBzYXZlIHRoZSBtb2RpZmllZCBtaWRpIGRhdGEgXG4gICAgICogICB0byBhIGZpbGUsIGZvciBwbGF5YmFjay4gXG4gICAgICogICBcbiAgICAgKi9cclxuXHJcbiAgICBwdWJsaWMgY2xhc3MgTWlkaUZpbGVcclxuICAgIHtcclxuICAgICAgICBwcml2YXRlIHN0cmluZyBmaWxlbmFtZTsgICAgICAgICAgLyoqIFRoZSBNaWRpIGZpbGUgbmFtZSAqL1xyXG4gICAgICAgIHByaXZhdGUgTGlzdDxNaWRpRXZlbnQ+W10gZXZlbnRzOyAvKiogVGhlIHJhdyBNaWRpRXZlbnRzLCBvbmUgbGlzdCBwZXIgdHJhY2sgKi9cclxuICAgICAgICBwcml2YXRlIExpc3Q8TWlkaVRyYWNrPiB0cmFja3M7ICAvKiogVGhlIHRyYWNrcyBvZiB0aGUgbWlkaWZpbGUgdGhhdCBoYXZlIG5vdGVzICovXHJcbiAgICAgICAgcHJpdmF0ZSB1c2hvcnQgdHJhY2ttb2RlOyAgICAgICAgIC8qKiAwIChzaW5nbGUgdHJhY2spLCAxIChzaW11bHRhbmVvdXMgdHJhY2tzKSAyIChpbmRlcGVuZGVudCB0cmFja3MpICovXHJcbiAgICAgICAgcHJpdmF0ZSBUaW1lU2lnbmF0dXJlIHRpbWVzaWc7ICAgIC8qKiBUaGUgdGltZSBzaWduYXR1cmUgKi9cclxuICAgICAgICBwcml2YXRlIGludCBxdWFydGVybm90ZTsgICAgICAgICAgLyoqIFRoZSBudW1iZXIgb2YgcHVsc2VzIHBlciBxdWFydGVyIG5vdGUgKi9cclxuICAgICAgICBwcml2YXRlIGludCB0b3RhbHB1bHNlczsgICAgICAgICAgLyoqIFRoZSB0b3RhbCBsZW5ndGggb2YgdGhlIHNvbmcsIGluIHB1bHNlcyAqL1xyXG4gICAgICAgIHByaXZhdGUgYm9vbCB0cmFja1BlckNoYW5uZWw7ICAgICAvKiogVHJ1ZSBpZiB3ZSd2ZSBzcGxpdCBlYWNoIGNoYW5uZWwgaW50byBhIHRyYWNrICovXHJcblxyXG4gICAgICAgIC8qIFRoZSBsaXN0IG9mIE1pZGkgRXZlbnRzICovXHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBFdmVudE5vdGVPZmYgPSAweDgwO1xyXG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgRXZlbnROb3RlT24gPSAweDkwO1xyXG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgRXZlbnRLZXlQcmVzc3VyZSA9IDB4QTA7XHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBFdmVudENvbnRyb2xDaGFuZ2UgPSAweEIwO1xyXG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgRXZlbnRQcm9ncmFtQ2hhbmdlID0gMHhDMDtcclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IEV2ZW50Q2hhbm5lbFByZXNzdXJlID0gMHhEMDtcclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IEV2ZW50UGl0Y2hCZW5kID0gMHhFMDtcclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IFN5c2V4RXZlbnQxID0gMHhGMDtcclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IFN5c2V4RXZlbnQyID0gMHhGNztcclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudCA9IDB4RkY7XHJcblxyXG4gICAgICAgIC8qIFRoZSBsaXN0IG9mIE1ldGEgRXZlbnRzICovXHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRTZXF1ZW5jZSA9IDB4MDtcclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudFRleHQgPSAweDE7XHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRDb3B5cmlnaHQgPSAweDI7XHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRTZXF1ZW5jZU5hbWUgPSAweDM7XHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRJbnN0cnVtZW50ID0gMHg0O1xyXG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50THlyaWMgPSAweDU7XHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRNYXJrZXIgPSAweDY7XHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRFbmRPZlRyYWNrID0gMHgyRjtcclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudFRlbXBvID0gMHg1MTtcclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudFNNUFRFT2Zmc2V0ID0gMHg1NDtcclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudFRpbWVTaWduYXR1cmUgPSAweDU4O1xyXG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50S2V5U2lnbmF0dXJlID0gMHg1OTtcclxuXHJcbiAgICAgICAgLyogVGhlIFByb2dyYW0gQ2hhbmdlIGV2ZW50IGdpdmVzIHRoZSBpbnN0cnVtZW50IHRoYXQgc2hvdWxkXHJcbiAgICAgICAgICogYmUgdXNlZCBmb3IgYSBwYXJ0aWN1bGFyIGNoYW5uZWwuICBUaGUgZm9sbG93aW5nIHRhYmxlXHJcbiAgICAgICAgICogbWFwcyBlYWNoIGluc3RydW1lbnQgbnVtYmVyICgwIHRocnUgMTI4KSB0byBhbiBpbnN0cnVtZW50XHJcbiAgICAgICAgICogbmFtZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHN0cmluZ1tdIEluc3RydW1lbnRzID0ge1xuXG4gICAgICAgIFwiQWNvdXN0aWMgR3JhbmQgUGlhbm9cIixcbiAgICAgICAgXCJCcmlnaHQgQWNvdXN0aWMgUGlhbm9cIixcbiAgICAgICAgXCJFbGVjdHJpYyBHcmFuZCBQaWFub1wiLFxuICAgICAgICBcIkhvbmt5LXRvbmsgUGlhbm9cIixcbiAgICAgICAgXCJFbGVjdHJpYyBQaWFubyAxXCIsXG4gICAgICAgIFwiRWxlY3RyaWMgUGlhbm8gMlwiLFxuICAgICAgICBcIkhhcnBzaWNob3JkXCIsXG4gICAgICAgIFwiQ2xhdmlcIixcbiAgICAgICAgXCJDZWxlc3RhXCIsXG4gICAgICAgIFwiR2xvY2tlbnNwaWVsXCIsXG4gICAgICAgIFwiTXVzaWMgQm94XCIsXG4gICAgICAgIFwiVmlicmFwaG9uZVwiLFxuICAgICAgICBcIk1hcmltYmFcIixcbiAgICAgICAgXCJYeWxvcGhvbmVcIixcbiAgICAgICAgXCJUdWJ1bGFyIEJlbGxzXCIsXG4gICAgICAgIFwiRHVsY2ltZXJcIixcbiAgICAgICAgXCJEcmF3YmFyIE9yZ2FuXCIsXG4gICAgICAgIFwiUGVyY3Vzc2l2ZSBPcmdhblwiLFxuICAgICAgICBcIlJvY2sgT3JnYW5cIixcbiAgICAgICAgXCJDaHVyY2ggT3JnYW5cIixcbiAgICAgICAgXCJSZWVkIE9yZ2FuXCIsXG4gICAgICAgIFwiQWNjb3JkaW9uXCIsXG4gICAgICAgIFwiSGFybW9uaWNhXCIsXG4gICAgICAgIFwiVGFuZ28gQWNjb3JkaW9uXCIsXG4gICAgICAgIFwiQWNvdXN0aWMgR3VpdGFyIChueWxvbilcIixcbiAgICAgICAgXCJBY291c3RpYyBHdWl0YXIgKHN0ZWVsKVwiLFxuICAgICAgICBcIkVsZWN0cmljIEd1aXRhciAoamF6eilcIixcbiAgICAgICAgXCJFbGVjdHJpYyBHdWl0YXIgKGNsZWFuKVwiLFxuICAgICAgICBcIkVsZWN0cmljIEd1aXRhciAobXV0ZWQpXCIsXG4gICAgICAgIFwiT3ZlcmRyaXZlbiBHdWl0YXJcIixcbiAgICAgICAgXCJEaXN0b3J0aW9uIEd1aXRhclwiLFxuICAgICAgICBcIkd1aXRhciBoYXJtb25pY3NcIixcbiAgICAgICAgXCJBY291c3RpYyBCYXNzXCIsXG4gICAgICAgIFwiRWxlY3RyaWMgQmFzcyAoZmluZ2VyKVwiLFxuICAgICAgICBcIkVsZWN0cmljIEJhc3MgKHBpY2spXCIsXG4gICAgICAgIFwiRnJldGxlc3MgQmFzc1wiLFxuICAgICAgICBcIlNsYXAgQmFzcyAxXCIsXG4gICAgICAgIFwiU2xhcCBCYXNzIDJcIixcbiAgICAgICAgXCJTeW50aCBCYXNzIDFcIixcbiAgICAgICAgXCJTeW50aCBCYXNzIDJcIixcbiAgICAgICAgXCJWaW9saW5cIixcbiAgICAgICAgXCJWaW9sYVwiLFxuICAgICAgICBcIkNlbGxvXCIsXG4gICAgICAgIFwiQ29udHJhYmFzc1wiLFxuICAgICAgICBcIlRyZW1vbG8gU3RyaW5nc1wiLFxuICAgICAgICBcIlBpenppY2F0byBTdHJpbmdzXCIsXG4gICAgICAgIFwiT3JjaGVzdHJhbCBIYXJwXCIsXG4gICAgICAgIFwiVGltcGFuaVwiLFxuICAgICAgICBcIlN0cmluZyBFbnNlbWJsZSAxXCIsXG4gICAgICAgIFwiU3RyaW5nIEVuc2VtYmxlIDJcIixcbiAgICAgICAgXCJTeW50aFN0cmluZ3MgMVwiLFxuICAgICAgICBcIlN5bnRoU3RyaW5ncyAyXCIsXG4gICAgICAgIFwiQ2hvaXIgQWFoc1wiLFxuICAgICAgICBcIlZvaWNlIE9vaHNcIixcbiAgICAgICAgXCJTeW50aCBWb2ljZVwiLFxuICAgICAgICBcIk9yY2hlc3RyYSBIaXRcIixcbiAgICAgICAgXCJUcnVtcGV0XCIsXG4gICAgICAgIFwiVHJvbWJvbmVcIixcbiAgICAgICAgXCJUdWJhXCIsXG4gICAgICAgIFwiTXV0ZWQgVHJ1bXBldFwiLFxuICAgICAgICBcIkZyZW5jaCBIb3JuXCIsXG4gICAgICAgIFwiQnJhc3MgU2VjdGlvblwiLFxuICAgICAgICBcIlN5bnRoQnJhc3MgMVwiLFxuICAgICAgICBcIlN5bnRoQnJhc3MgMlwiLFxuICAgICAgICBcIlNvcHJhbm8gU2F4XCIsXG4gICAgICAgIFwiQWx0byBTYXhcIixcbiAgICAgICAgXCJUZW5vciBTYXhcIixcbiAgICAgICAgXCJCYXJpdG9uZSBTYXhcIixcbiAgICAgICAgXCJPYm9lXCIsXG4gICAgICAgIFwiRW5nbGlzaCBIb3JuXCIsXG4gICAgICAgIFwiQmFzc29vblwiLFxuICAgICAgICBcIkNsYXJpbmV0XCIsXG4gICAgICAgIFwiUGljY29sb1wiLFxuICAgICAgICBcIkZsdXRlXCIsXG4gICAgICAgIFwiUmVjb3JkZXJcIixcbiAgICAgICAgXCJQYW4gRmx1dGVcIixcbiAgICAgICAgXCJCbG93biBCb3R0bGVcIixcbiAgICAgICAgXCJTaGFrdWhhY2hpXCIsXG4gICAgICAgIFwiV2hpc3RsZVwiLFxuICAgICAgICBcIk9jYXJpbmFcIixcbiAgICAgICAgXCJMZWFkIDEgKHNxdWFyZSlcIixcbiAgICAgICAgXCJMZWFkIDIgKHNhd3Rvb3RoKVwiLFxuICAgICAgICBcIkxlYWQgMyAoY2FsbGlvcGUpXCIsXG4gICAgICAgIFwiTGVhZCA0IChjaGlmZilcIixcbiAgICAgICAgXCJMZWFkIDUgKGNoYXJhbmcpXCIsXG4gICAgICAgIFwiTGVhZCA2ICh2b2ljZSlcIixcbiAgICAgICAgXCJMZWFkIDcgKGZpZnRocylcIixcbiAgICAgICAgXCJMZWFkIDggKGJhc3MgKyBsZWFkKVwiLFxuICAgICAgICBcIlBhZCAxIChuZXcgYWdlKVwiLFxuICAgICAgICBcIlBhZCAyICh3YXJtKVwiLFxuICAgICAgICBcIlBhZCAzIChwb2x5c3ludGgpXCIsXG4gICAgICAgIFwiUGFkIDQgKGNob2lyKVwiLFxuICAgICAgICBcIlBhZCA1IChib3dlZClcIixcbiAgICAgICAgXCJQYWQgNiAobWV0YWxsaWMpXCIsXG4gICAgICAgIFwiUGFkIDcgKGhhbG8pXCIsXG4gICAgICAgIFwiUGFkIDggKHN3ZWVwKVwiLFxuICAgICAgICBcIkZYIDEgKHJhaW4pXCIsXG4gICAgICAgIFwiRlggMiAoc291bmR0cmFjaylcIixcbiAgICAgICAgXCJGWCAzIChjcnlzdGFsKVwiLFxuICAgICAgICBcIkZYIDQgKGF0bW9zcGhlcmUpXCIsXG4gICAgICAgIFwiRlggNSAoYnJpZ2h0bmVzcylcIixcbiAgICAgICAgXCJGWCA2IChnb2JsaW5zKVwiLFxuICAgICAgICBcIkZYIDcgKGVjaG9lcylcIixcbiAgICAgICAgXCJGWCA4IChzY2ktZmkpXCIsXG4gICAgICAgIFwiU2l0YXJcIixcbiAgICAgICAgXCJCYW5qb1wiLFxuICAgICAgICBcIlNoYW1pc2VuXCIsXG4gICAgICAgIFwiS290b1wiLFxuICAgICAgICBcIkthbGltYmFcIixcbiAgICAgICAgXCJCYWcgcGlwZVwiLFxuICAgICAgICBcIkZpZGRsZVwiLFxuICAgICAgICBcIlNoYW5haVwiLFxuICAgICAgICBcIlRpbmtsZSBCZWxsXCIsXG4gICAgICAgIFwiQWdvZ29cIixcbiAgICAgICAgXCJTdGVlbCBEcnVtc1wiLFxuICAgICAgICBcIldvb2RibG9ja1wiLFxuICAgICAgICBcIlRhaWtvIERydW1cIixcbiAgICAgICAgXCJNZWxvZGljIFRvbVwiLFxuICAgICAgICBcIlN5bnRoIERydW1cIixcbiAgICAgICAgXCJSZXZlcnNlIEN5bWJhbFwiLFxuICAgICAgICBcIkd1aXRhciBGcmV0IE5vaXNlXCIsXG4gICAgICAgIFwiQnJlYXRoIE5vaXNlXCIsXG4gICAgICAgIFwiU2Vhc2hvcmVcIixcbiAgICAgICAgXCJCaXJkIFR3ZWV0XCIsXG4gICAgICAgIFwiVGVsZXBob25lIFJpbmdcIixcbiAgICAgICAgXCJIZWxpY29wdGVyXCIsXG4gICAgICAgIFwiQXBwbGF1c2VcIixcbiAgICAgICAgXCJHdW5zaG90XCIsXG4gICAgICAgIFwiUGVyY3Vzc2lvblwiXG4gICAgfTtcclxuICAgICAgICAvKiBFbmQgSW5zdHJ1bWVudHMgKi9cclxuXHJcbiAgICAgICAgLyoqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIE1pZGkgZXZlbnQgKi9cclxuICAgICAgICBwcml2YXRlIHN0cmluZyBFdmVudE5hbWUoaW50IGV2KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGV2ID49IEV2ZW50Tm90ZU9mZiAmJiBldiA8IEV2ZW50Tm90ZU9mZiArIDE2KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiTm90ZU9mZlwiO1xyXG4gICAgICAgICAgICBlbHNlIGlmIChldiA+PSBFdmVudE5vdGVPbiAmJiBldiA8IEV2ZW50Tm90ZU9uICsgMTYpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJOb3RlT25cIjtcclxuICAgICAgICAgICAgZWxzZSBpZiAoZXYgPj0gRXZlbnRLZXlQcmVzc3VyZSAmJiBldiA8IEV2ZW50S2V5UHJlc3N1cmUgKyAxNilcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIktleVByZXNzdXJlXCI7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ID49IEV2ZW50Q29udHJvbENoYW5nZSAmJiBldiA8IEV2ZW50Q29udHJvbENoYW5nZSArIDE2KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiQ29udHJvbENoYW5nZVwiO1xyXG4gICAgICAgICAgICBlbHNlIGlmIChldiA+PSBFdmVudFByb2dyYW1DaGFuZ2UgJiYgZXYgPCBFdmVudFByb2dyYW1DaGFuZ2UgKyAxNilcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlByb2dyYW1DaGFuZ2VcIjtcclxuICAgICAgICAgICAgZWxzZSBpZiAoZXYgPj0gRXZlbnRDaGFubmVsUHJlc3N1cmUgJiYgZXYgPCBFdmVudENoYW5uZWxQcmVzc3VyZSArIDE2KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiQ2hhbm5lbFByZXNzdXJlXCI7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ID49IEV2ZW50UGl0Y2hCZW5kICYmIGV2IDwgRXZlbnRQaXRjaEJlbmQgKyAxNilcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlBpdGNoQmVuZFwiO1xyXG4gICAgICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnQpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJNZXRhRXZlbnRcIjtcclxuICAgICAgICAgICAgZWxzZSBpZiAoZXYgPT0gU3lzZXhFdmVudDEgfHwgZXYgPT0gU3lzZXhFdmVudDIpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJTeXNleEV2ZW50XCI7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlVua25vd25cIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBtZXRhLWV2ZW50ICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdHJpbmcgTWV0YU5hbWUoaW50IGV2KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGV2ID09IE1ldGFFdmVudFNlcXVlbmNlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50U2VxdWVuY2VcIjtcclxuICAgICAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50VGV4dClcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudFRleHRcIjtcclxuICAgICAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50Q29weXJpZ2h0KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50Q29weXJpZ2h0XCI7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ID09IE1ldGFFdmVudFNlcXVlbmNlTmFtZSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudFNlcXVlbmNlTmFtZVwiO1xyXG4gICAgICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRJbnN0cnVtZW50KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50SW5zdHJ1bWVudFwiO1xyXG4gICAgICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRMeXJpYylcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudEx5cmljXCI7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ID09IE1ldGFFdmVudE1hcmtlcilcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudE1hcmtlclwiO1xyXG4gICAgICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRFbmRPZlRyYWNrKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50RW5kT2ZUcmFja1wiO1xyXG4gICAgICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRUZW1wbylcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudFRlbXBvXCI7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ID09IE1ldGFFdmVudFNNUFRFT2Zmc2V0KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50U01QVEVPZmZzZXRcIjtcclxuICAgICAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50VGltZVNpZ25hdHVyZSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudFRpbWVTaWduYXR1cmVcIjtcclxuICAgICAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50S2V5U2lnbmF0dXJlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50S2V5U2lnbmF0dXJlXCI7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlVua25vd25cIjtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogR2V0IHRoZSBsaXN0IG9mIHRyYWNrcyAqL1xyXG4gICAgICAgIHB1YmxpYyBMaXN0PE1pZGlUcmFjaz4gVHJhY2tzXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gdHJhY2tzOyB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogR2V0IHRoZSB0aW1lIHNpZ25hdHVyZSAqL1xyXG4gICAgICAgIHB1YmxpYyBUaW1lU2lnbmF0dXJlIFRpbWVcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdldCB7IHJldHVybiB0aW1lc2lnOyB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogR2V0IHRoZSBmaWxlIG5hbWUgKi9cclxuICAgICAgICBwdWJsaWMgc3RyaW5nIEZpbGVOYW1lXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gZmlsZW5hbWU7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBHZXQgdGhlIHRvdGFsIGxlbmd0aCAoaW4gcHVsc2VzKSBvZiB0aGUgc29uZyAqL1xyXG4gICAgICAgIHB1YmxpYyBpbnQgVG90YWxQdWxzZXNcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdldCB7IHJldHVybiB0b3RhbHB1bHNlczsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBieXRlW10gUGFyc2VSaWZmRGF0YShieXRlW10gZGF0YSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciByaWZmRmlsZSA9IFJpZmZQYXJzZXIuUGFyc2VCeXRlQXJyYXkoZGF0YSk7XHJcbiAgICAgICAgICAgIGlmIChyaWZmRmlsZS5GaWxlSW5mby5GaWxlVHlwZSAhPSBcIlJNSURcIilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgd2hpbGUgKHJpZmZGaWxlLlJlYWQoKGdsb2JhbDo6TWlkaVNoZWV0TXVzaWMuUHJvY2Vzc0VsZW1lbnQpKCh0eXBlLCBpc0xpc3QsIGNodW5rKSA9PlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWlzTGlzdCAmJiB0eXBlLlRvTG93ZXIoKSA9PSBcImRhdGFcIilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhID0gY2h1bmsuR2V0RGF0YSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KSkpIDtcclxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogQ3JlYXRlIGEgbmV3IE1pZGlGaWxlIGZyb20gdGhlIGJ5dGVbXS4gKi9cclxuICAgICAgICBwdWJsaWMgTWlkaUZpbGUoYnl0ZVtdIGRhdGEsIHN0cmluZyB0aXRsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0cmluZyBoZWFkZXI7XHJcbiAgICAgICAgICAgIGlmIChSaWZmUGFyc2VyLklzUmlmZkZpbGUoZGF0YSwgb3V0IGhlYWRlcikpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGRhdGEgPSBQYXJzZVJpZmZEYXRhKGRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBNaWRpRmlsZVJlYWRlciBmaWxlID0gbmV3IE1pZGlGaWxlUmVhZGVyKGRhdGEpO1xyXG4gICAgICAgICAgICBpZiAodGl0bGUgPT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHRpdGxlID0gXCJcIjtcclxuICAgICAgICAgICAgcGFyc2UoZmlsZSwgdGl0bGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFBhcnNlIHRoZSBnaXZlbiBNaWRpIGZpbGUsIGFuZCByZXR1cm4gYW4gaW5zdGFuY2Ugb2YgdGhpcyBNaWRpRmlsZVxuICAgICAgICAgKiBjbGFzcy4gIEFmdGVyIHJlYWRpbmcgdGhlIG1pZGkgZmlsZSwgdGhpcyBvYmplY3Qgd2lsbCBjb250YWluOlxuICAgICAgICAgKiAtIFRoZSByYXcgbGlzdCBvZiBtaWRpIGV2ZW50c1xuICAgICAgICAgKiAtIFRoZSBUaW1lIFNpZ25hdHVyZSBvZiB0aGUgc29uZ1xuICAgICAgICAgKiAtIEFsbCB0aGUgdHJhY2tzIGluIHRoZSBzb25nIHdoaWNoIGNvbnRhaW4gbm90ZXMuIFxuICAgICAgICAgKiAtIFRoZSBudW1iZXIsIHN0YXJ0dGltZSwgYW5kIGR1cmF0aW9uIG9mIGVhY2ggbm90ZS5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHZvaWQgcGFyc2UoTWlkaUZpbGVSZWFkZXIgZmlsZSwgc3RyaW5nIGZpbGVuYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3RyaW5nIGlkO1xyXG4gICAgICAgICAgICBpbnQgbGVuO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5maWxlbmFtZSA9IGZpbGVuYW1lO1xyXG4gICAgICAgICAgICB0cmFja3MgPSBuZXcgTGlzdDxNaWRpVHJhY2s+KCk7XHJcbiAgICAgICAgICAgIHRyYWNrUGVyQ2hhbm5lbCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgaWQgPSBmaWxlLlJlYWRBc2NpaSg0KTtcclxuICAgICAgICAgICAgaWYgKGlkICE9IFwiTVRoZFwiKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXCJEb2Vzbid0IHN0YXJ0IHdpdGggTVRoZFwiLCAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZW4gPSBmaWxlLlJlYWRJbnQoKTtcclxuICAgICAgICAgICAgaWYgKGxlbiAhPSA2KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXCJCYWQgTVRoZCBoZWFkZXJcIiwgNCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdHJhY2ttb2RlID0gZmlsZS5SZWFkU2hvcnQoKTtcclxuICAgICAgICAgICAgaW50IG51bV90cmFja3MgPSBmaWxlLlJlYWRTaG9ydCgpO1xyXG4gICAgICAgICAgICBxdWFydGVybm90ZSA9IGZpbGUuUmVhZFNob3J0KCk7XHJcblxyXG4gICAgICAgICAgICBldmVudHMgPSBuZXcgTGlzdDxNaWRpRXZlbnQ+W251bV90cmFja3NdO1xyXG4gICAgICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgbnVtX3RyYWNrczsgdHJhY2tudW0rKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzW3RyYWNrbnVtXSA9IFJlYWRUcmFjayhmaWxlKTtcclxuICAgICAgICAgICAgICAgIE1pZGlUcmFjayB0cmFjayA9IG5ldyBNaWRpVHJhY2soZXZlbnRzW3RyYWNrbnVtXSwgdHJhY2tudW0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRyYWNrLk5vdGVzLkNvdW50ID4gMCB8fCB0cmFjay5MeXJpY3MgIT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0cmFja3MuQWRkKHRyYWNrKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLyogR2V0IHRoZSBsZW5ndGggb2YgdGhlIHNvbmcgaW4gcHVsc2VzICovXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIE1pZGlOb3RlIGxhc3QgPSB0cmFjay5Ob3Rlc1t0cmFjay5Ob3Rlcy5Db3VudCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudG90YWxwdWxzZXMgPCBsYXN0LlN0YXJ0VGltZSArIGxhc3QuRHVyYXRpb24pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b3RhbHB1bHNlcyA9IGxhc3QuU3RhcnRUaW1lICsgbGFzdC5EdXJhdGlvbjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLyogSWYgd2Ugb25seSBoYXZlIG9uZSB0cmFjayB3aXRoIG11bHRpcGxlIGNoYW5uZWxzLCB0aGVuIHRyZWF0XHJcbiAgICAgICAgICAgICAqIGVhY2ggY2hhbm5lbCBhcyBhIHNlcGFyYXRlIHRyYWNrLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgaWYgKHRyYWNrcy5Db3VudCA9PSAxICYmIEhhc011bHRpcGxlQ2hhbm5lbHModHJhY2tzWzBdKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdHJhY2tzID0gU3BsaXRDaGFubmVscyh0cmFja3NbMF0sIGV2ZW50c1t0cmFja3NbMF0uTnVtYmVyXSk7XHJcbiAgICAgICAgICAgICAgICB0cmFja1BlckNoYW5uZWwgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBDaGVja1N0YXJ0VGltZXModHJhY2tzKTtcclxuXHJcbiAgICAgICAgICAgIC8qIERldGVybWluZSB0aGUgdGltZSBzaWduYXR1cmUgKi9cclxuICAgICAgICAgICAgaW50IHRlbXBvID0gMDtcclxuICAgICAgICAgICAgaW50IG51bWVyID0gMDtcclxuICAgICAgICAgICAgaW50IGRlbm9tID0gMDtcclxuICAgICAgICAgICAgZm9yZWFjaCAoTGlzdDxNaWRpRXZlbnQ+IGxpc3QgaW4gZXZlbnRzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbWV2ZW50IGluIGxpc3QpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1ldmVudC5NZXRhZXZlbnQgPT0gTWV0YUV2ZW50VGVtcG8gJiYgdGVtcG8gPT0gMClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBvID0gbWV2ZW50LlRlbXBvO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobWV2ZW50Lk1ldGFldmVudCA9PSBNZXRhRXZlbnRUaW1lU2lnbmF0dXJlICYmIG51bWVyID09IDApXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBudW1lciA9IG1ldmVudC5OdW1lcmF0b3I7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbm9tID0gbWV2ZW50LkRlbm9taW5hdG9yO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGVtcG8gPT0gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGVtcG8gPSA1MDAwMDA7IC8qIDUwMCwwMDAgbWljcm9zZWNvbmRzID0gMC4wNSBzZWMgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobnVtZXIgPT0gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbnVtZXIgPSA0OyBkZW5vbSA9IDQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGltZXNpZyA9IG5ldyBUaW1lU2lnbmF0dXJlKG51bWVyLCBkZW5vbSwgcXVhcnRlcm5vdGUsIHRlbXBvKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBQYXJzZSBhIHNpbmdsZSBNaWRpIHRyYWNrIGludG8gYSBsaXN0IG9mIE1pZGlFdmVudHMuXG4gICAgICAgICAqIEVudGVyaW5nIHRoaXMgZnVuY3Rpb24sIHRoZSBmaWxlIG9mZnNldCBzaG91bGQgYmUgYXQgdGhlIHN0YXJ0IG9mXG4gICAgICAgICAqIHRoZSBNVHJrIGhlYWRlci4gIFVwb24gZXhpdGluZywgdGhlIGZpbGUgb2Zmc2V0IHNob3VsZCBiZSBhdCB0aGVcbiAgICAgICAgICogc3RhcnQgb2YgdGhlIG5leHQgTVRyayBoZWFkZXIuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgTGlzdDxNaWRpRXZlbnQ+IFJlYWRUcmFjayhNaWRpRmlsZVJlYWRlciBmaWxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgTGlzdDxNaWRpRXZlbnQ+IHJlc3VsdCA9IG5ldyBMaXN0PE1pZGlFdmVudD4oMjApO1xyXG4gICAgICAgICAgICBpbnQgc3RhcnR0aW1lID0gMDtcclxuICAgICAgICAgICAgc3RyaW5nIGlkID0gZmlsZS5SZWFkQXNjaWkoNCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaWQgIT0gXCJNVHJrXCIpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNaWRpRmlsZUV4Y2VwdGlvbihcIkJhZCBNVHJrIGhlYWRlclwiLCBmaWxlLkdldE9mZnNldCgpIC0gNCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW50IHRyYWNrbGVuID0gZmlsZS5SZWFkSW50KCk7XHJcbiAgICAgICAgICAgIGludCB0cmFja2VuZCA9IHRyYWNrbGVuICsgZmlsZS5HZXRPZmZzZXQoKTtcclxuXHJcbiAgICAgICAgICAgIGludCBldmVudGZsYWcgPSAwO1xyXG5cclxuICAgICAgICAgICAgd2hpbGUgKGZpbGUuR2V0T2Zmc2V0KCkgPCB0cmFja2VuZClcclxuICAgICAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBtaWRpIGZpbGUgaXMgdHJ1bmNhdGVkIGhlcmUsIHdlIGNhbiBzdGlsbCByZWNvdmVyLlxyXG4gICAgICAgICAgICAgICAgLy8gSnVzdCByZXR1cm4gd2hhdCB3ZSd2ZSBwYXJzZWQgc28gZmFyLlxyXG5cclxuICAgICAgICAgICAgICAgIGludCBzdGFydG9mZnNldCwgZGVsdGF0aW1lO1xyXG4gICAgICAgICAgICAgICAgYnl0ZSBwZWVrZXZlbnQ7XHJcbiAgICAgICAgICAgICAgICB0cnlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydG9mZnNldCA9IGZpbGUuR2V0T2Zmc2V0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsdGF0aW1lID0gZmlsZS5SZWFkVmFybGVuKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnR0aW1lICs9IGRlbHRhdGltZTtcclxuICAgICAgICAgICAgICAgICAgICBwZWVrZXZlbnQgPSBmaWxlLlBlZWsoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhdGNoIChNaWRpRmlsZUV4Y2VwdGlvbiBlKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgTWlkaUV2ZW50IG1ldmVudCA9IG5ldyBNaWRpRXZlbnQoKTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5BZGQobWV2ZW50KTtcclxuICAgICAgICAgICAgICAgIG1ldmVudC5EZWx0YVRpbWUgPSBkZWx0YXRpbWU7XHJcbiAgICAgICAgICAgICAgICBtZXZlbnQuU3RhcnRUaW1lID0gc3RhcnR0aW1lO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwZWVrZXZlbnQgPj0gRXZlbnROb3RlT2ZmKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5IYXNFdmVudGZsYWcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50ZmxhZyA9IGZpbGUuUmVhZEJ5dGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDb25zb2xlLldyaXRlTGluZShcIm9mZnNldCB7MH06IGV2ZW50IHsxfSB7Mn0gc3RhcnQgezN9IGRlbHRhIHs0fVwiLCBcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgIHN0YXJ0b2Zmc2V0LCBldmVudGZsYWcsIEV2ZW50TmFtZShldmVudGZsYWcpLCBcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgIHN0YXJ0dGltZSwgbWV2ZW50LkRlbHRhVGltZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50ZmxhZyA+PSBFdmVudE5vdGVPbiAmJiBldmVudGZsYWcgPCBFdmVudE5vdGVPbiArIDE2KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPSBFdmVudE5vdGVPbjtcclxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuQ2hhbm5lbCA9IChieXRlKShldmVudGZsYWcgLSBFdmVudE5vdGVPbik7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50Lk5vdGVudW1iZXIgPSBmaWxlLlJlYWRCeXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LlZlbG9jaXR5ID0gZmlsZS5SZWFkQnl0ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZXZlbnRmbGFnID49IEV2ZW50Tm90ZU9mZiAmJiBldmVudGZsYWcgPCBFdmVudE5vdGVPZmYgKyAxNilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gRXZlbnROb3RlT2ZmO1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5DaGFubmVsID0gKGJ5dGUpKGV2ZW50ZmxhZyAtIEV2ZW50Tm90ZU9mZik7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50Lk5vdGVudW1iZXIgPSBmaWxlLlJlYWRCeXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LlZlbG9jaXR5ID0gZmlsZS5SZWFkQnl0ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZXZlbnRmbGFnID49IEV2ZW50S2V5UHJlc3N1cmUgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50ZmxhZyA8IEV2ZW50S2V5UHJlc3N1cmUgKyAxNilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gRXZlbnRLZXlQcmVzc3VyZTtcclxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuQ2hhbm5lbCA9IChieXRlKShldmVudGZsYWcgLSBFdmVudEtleVByZXNzdXJlKTtcclxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuTm90ZW51bWJlciA9IGZpbGUuUmVhZEJ5dGUoKTtcclxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuS2V5UHJlc3N1cmUgPSBmaWxlLlJlYWRCeXRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChldmVudGZsYWcgPj0gRXZlbnRDb250cm9sQ2hhbmdlICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBldmVudGZsYWcgPCBFdmVudENvbnRyb2xDaGFuZ2UgKyAxNilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gRXZlbnRDb250cm9sQ2hhbmdlO1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5DaGFubmVsID0gKGJ5dGUpKGV2ZW50ZmxhZyAtIEV2ZW50Q29udHJvbENoYW5nZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkNvbnRyb2xOdW0gPSBmaWxlLlJlYWRCeXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkNvbnRyb2xWYWx1ZSA9IGZpbGUuUmVhZEJ5dGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGV2ZW50ZmxhZyA+PSBFdmVudFByb2dyYW1DaGFuZ2UgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50ZmxhZyA8IEV2ZW50UHJvZ3JhbUNoYW5nZSArIDE2KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPSBFdmVudFByb2dyYW1DaGFuZ2U7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkNoYW5uZWwgPSAoYnl0ZSkoZXZlbnRmbGFnIC0gRXZlbnRQcm9ncmFtQ2hhbmdlKTtcclxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuSW5zdHJ1bWVudCA9IGZpbGUuUmVhZEJ5dGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGV2ZW50ZmxhZyA+PSBFdmVudENoYW5uZWxQcmVzc3VyZSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRmbGFnIDwgRXZlbnRDaGFubmVsUHJlc3N1cmUgKyAxNilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gRXZlbnRDaGFubmVsUHJlc3N1cmU7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkNoYW5uZWwgPSAoYnl0ZSkoZXZlbnRmbGFnIC0gRXZlbnRDaGFubmVsUHJlc3N1cmUpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5DaGFuUHJlc3N1cmUgPSBmaWxlLlJlYWRCeXRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChldmVudGZsYWcgPj0gRXZlbnRQaXRjaEJlbmQgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50ZmxhZyA8IEV2ZW50UGl0Y2hCZW5kICsgMTYpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IEV2ZW50UGl0Y2hCZW5kO1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5DaGFubmVsID0gKGJ5dGUpKGV2ZW50ZmxhZyAtIEV2ZW50UGl0Y2hCZW5kKTtcclxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuUGl0Y2hCZW5kID0gZmlsZS5SZWFkU2hvcnQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGV2ZW50ZmxhZyA9PSBTeXNleEV2ZW50MSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gU3lzZXhFdmVudDE7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50Lk1ldGFsZW5ndGggPSBmaWxlLlJlYWRWYXJsZW4oKTtcclxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuVmFsdWUgPSBmaWxlLlJlYWRCeXRlcyhtZXZlbnQuTWV0YWxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChldmVudGZsYWcgPT0gU3lzZXhFdmVudDIpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IFN5c2V4RXZlbnQyO1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5NZXRhbGVuZ3RoID0gZmlsZS5SZWFkVmFybGVuKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LlZhbHVlID0gZmlsZS5SZWFkQnl0ZXMobWV2ZW50Lk1ldGFsZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZXZlbnRmbGFnID09IE1ldGFFdmVudClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gTWV0YUV2ZW50O1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5NZXRhZXZlbnQgPSBmaWxlLlJlYWRCeXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50Lk1ldGFsZW5ndGggPSBmaWxlLlJlYWRWYXJsZW4oKTtcclxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuVmFsdWUgPSBmaWxlLlJlYWRCeXRlcyhtZXZlbnQuTWV0YWxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1ldmVudC5NZXRhZXZlbnQgPT0gTWV0YUV2ZW50VGltZVNpZ25hdHVyZSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtZXZlbnQuTWV0YWxlbmd0aCA8IDIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRocm93IG5ldyBNaWRpRmlsZUV4Y2VwdGlvbihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICBcIk1ldGEgRXZlbnQgVGltZSBTaWduYXR1cmUgbGVuID09IFwiICsgbWV2ZW50Lk1ldGFsZW5ndGggICsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgXCIgIT0gNFwiLCBmaWxlLkdldE9mZnNldCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5OdW1lcmF0b3IgPSAoYnl0ZSkwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkRlbm9taW5hdG9yID0gKGJ5dGUpNDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuTWV0YWxlbmd0aCA+PSAyICYmIG1ldmVudC5NZXRhbGVuZ3RoIDwgNClcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50Lk51bWVyYXRvciA9IChieXRlKW1ldmVudC5WYWx1ZVswXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5EZW5vbWluYXRvciA9IChieXRlKVN5c3RlbS5NYXRoLlBvdygyLCBtZXZlbnQuVmFsdWVbMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50Lk51bWVyYXRvciA9IChieXRlKW1ldmVudC5WYWx1ZVswXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5EZW5vbWluYXRvciA9IChieXRlKVN5c3RlbS5NYXRoLlBvdygyLCBtZXZlbnQuVmFsdWVbMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5NZXRhZXZlbnQgPT0gTWV0YUV2ZW50VGVtcG8pXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWV2ZW50Lk1ldGFsZW5ndGggIT0gMylcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1pZGlGaWxlRXhjZXB0aW9uKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIk1ldGEgRXZlbnQgVGVtcG8gbGVuID09IFwiICsgbWV2ZW50Lk1ldGFsZW5ndGggK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiAhPSAzXCIsIGZpbGUuR2V0T2Zmc2V0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5UZW1wbyA9ICgobWV2ZW50LlZhbHVlWzBdIDw8IDE2KSB8IChtZXZlbnQuVmFsdWVbMV0gPDwgOCkgfCBtZXZlbnQuVmFsdWVbMl0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuTWV0YWV2ZW50ID09IE1ldGFFdmVudEVuZE9mVHJhY2spXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBicmVhazsgICovXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBNaWRpRmlsZUV4Y2VwdGlvbihcIlVua25vd24gZXZlbnQgXCIgKyBtZXZlbnQuRXZlbnRGbGFnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5HZXRPZmZzZXQoKSAtIDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFJldHVybiB0cnVlIGlmIHRoaXMgdHJhY2sgY29udGFpbnMgbXVsdGlwbGUgY2hhbm5lbHMuXG4gICAgICAgICAqIElmIGEgTWlkaUZpbGUgY29udGFpbnMgb25seSBvbmUgdHJhY2ssIGFuZCBpdCBoYXMgbXVsdGlwbGUgY2hhbm5lbHMsXG4gICAgICAgICAqIHRoZW4gd2UgdHJlYXQgZWFjaCBjaGFubmVsIGFzIGEgc2VwYXJhdGUgdHJhY2suXG4gICAgICAgICAqL1xyXG4gICAgICAgIHN0YXRpYyBib29sIEhhc011bHRpcGxlQ2hhbm5lbHMoTWlkaVRyYWNrIHRyYWNrKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW50IGNoYW5uZWwgPSB0cmFjay5Ob3Rlc1swXS5DaGFubmVsO1xyXG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrLk5vdGVzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAobm90ZS5DaGFubmVsICE9IGNoYW5uZWwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFdyaXRlIGEgdmFyaWFibGUgbGVuZ3RoIG51bWJlciB0byB0aGUgYnVmZmVyIGF0IHRoZSBnaXZlbiBvZmZzZXQuXG4gICAgICAgICAqIFJldHVybiB0aGUgbnVtYmVyIG9mIGJ5dGVzIHdyaXR0ZW4uXG4gICAgICAgICAqL1xyXG4gICAgICAgIHN0YXRpYyBpbnQgVmFybGVuVG9CeXRlcyhpbnQgbnVtLCBieXRlW10gYnVmLCBpbnQgb2Zmc2V0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgYnl0ZSBiMSA9IChieXRlKSgobnVtID4+IDIxKSAmIDB4N0YpO1xyXG4gICAgICAgICAgICBieXRlIGIyID0gKGJ5dGUpKChudW0gPj4gMTQpICYgMHg3Rik7XHJcbiAgICAgICAgICAgIGJ5dGUgYjMgPSAoYnl0ZSkoKG51bSA+PiA3KSAmIDB4N0YpO1xyXG4gICAgICAgICAgICBieXRlIGI0ID0gKGJ5dGUpKG51bSAmIDB4N0YpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGIxID4gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgYnVmW29mZnNldF0gPSAoYnl0ZSkoYjEgfCAweDgwKTtcclxuICAgICAgICAgICAgICAgIGJ1ZltvZmZzZXQgKyAxXSA9IChieXRlKShiMiB8IDB4ODApO1xyXG4gICAgICAgICAgICAgICAgYnVmW29mZnNldCArIDJdID0gKGJ5dGUpKGIzIHwgMHg4MCk7XHJcbiAgICAgICAgICAgICAgICBidWZbb2Zmc2V0ICsgM10gPSBiNDtcclxuICAgICAgICAgICAgICAgIHJldHVybiA0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGIyID4gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgYnVmW29mZnNldF0gPSAoYnl0ZSkoYjIgfCAweDgwKTtcclxuICAgICAgICAgICAgICAgIGJ1ZltvZmZzZXQgKyAxXSA9IChieXRlKShiMyB8IDB4ODApO1xyXG4gICAgICAgICAgICAgICAgYnVmW29mZnNldCArIDJdID0gYjQ7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChiMyA+IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGJ1ZltvZmZzZXRdID0gKGJ5dGUpKGIzIHwgMHg4MCk7XHJcbiAgICAgICAgICAgICAgICBidWZbb2Zmc2V0ICsgMV0gPSBiNDtcclxuICAgICAgICAgICAgICAgIHJldHVybiAyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgYnVmW29mZnNldF0gPSBiNDtcclxuICAgICAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogV3JpdGUgYSA0LWJ5dGUgaW50ZWdlciB0byBkYXRhW29mZnNldCA6IG9mZnNldCs0XSAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgSW50VG9CeXRlcyhpbnQgdmFsdWUsIGJ5dGVbXSBkYXRhLCBpbnQgb2Zmc2V0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZGF0YVtvZmZzZXRdID0gKGJ5dGUpKCh2YWx1ZSA+PiAyNCkgJiAweEZGKTtcclxuICAgICAgICAgICAgZGF0YVtvZmZzZXQgKyAxXSA9IChieXRlKSgodmFsdWUgPj4gMTYpICYgMHhGRik7XHJcbiAgICAgICAgICAgIGRhdGFbb2Zmc2V0ICsgMl0gPSAoYnl0ZSkoKHZhbHVlID4+IDgpICYgMHhGRik7XHJcbiAgICAgICAgICAgIGRhdGFbb2Zmc2V0ICsgM10gPSAoYnl0ZSkodmFsdWUgJiAweEZGKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBDYWxjdWxhdGUgdGhlIHRyYWNrIGxlbmd0aCAoaW4gYnl0ZXMpIGdpdmVuIGEgbGlzdCBvZiBNaWRpIGV2ZW50cyAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGludCBHZXRUcmFja0xlbmd0aChMaXN0PE1pZGlFdmVudD4gZXZlbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW50IGxlbiA9IDA7XHJcbiAgICAgICAgICAgIGJ5dGVbXSBidWYgPSBuZXcgYnl0ZVsxMDI0XTtcclxuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaUV2ZW50IG1ldmVudCBpbiBldmVudHMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxlbiArPSBWYXJsZW5Ub0J5dGVzKG1ldmVudC5EZWx0YVRpbWUsIGJ1ZiwgMCk7XHJcbiAgICAgICAgICAgICAgICBsZW4gKz0gMTsgIC8qIGZvciBldmVudGZsYWcgKi9cclxuICAgICAgICAgICAgICAgIHN3aXRjaCAobWV2ZW50LkV2ZW50RmxhZylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIEV2ZW50Tm90ZU9uOiBsZW4gKz0gMjsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBFdmVudE5vdGVPZmY6IGxlbiArPSAyOyBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIEV2ZW50S2V5UHJlc3N1cmU6IGxlbiArPSAyOyBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIEV2ZW50Q29udHJvbENoYW5nZTogbGVuICs9IDI7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgRXZlbnRQcm9ncmFtQ2hhbmdlOiBsZW4gKz0gMTsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBFdmVudENoYW5uZWxQcmVzc3VyZTogbGVuICs9IDE7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgRXZlbnRQaXRjaEJlbmQ6IGxlbiArPSAyOyBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBTeXNleEV2ZW50MTpcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFN5c2V4RXZlbnQyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZW4gKz0gVmFybGVuVG9CeXRlcyhtZXZlbnQuTWV0YWxlbmd0aCwgYnVmLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGVuICs9IG1ldmVudC5NZXRhbGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIE1ldGFFdmVudDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGVuICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbiArPSBWYXJsZW5Ub0J5dGVzKG1ldmVudC5NZXRhbGVuZ3RoLCBidWYsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZW4gKz0gbWV2ZW50Lk1ldGFsZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBsZW47XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIFdyaXRlIHRoZSBnaXZlbiBsaXN0IG9mIE1pZGkgZXZlbnRzIHRvIGEgc3RyZWFtL2ZpbGUuXG4gICAgICAgICAqICBUaGlzIG1ldGhvZCBpcyB1c2VkIGZvciBzb3VuZCBwbGF5YmFjaywgZm9yIGNyZWF0aW5nIG5ldyBNaWRpIGZpbGVzXG4gICAgICAgICAqICB3aXRoIHRoZSB0ZW1wbywgdHJhbnNwb3NlLCBldGMgY2hhbmdlZC5cbiAgICAgICAgICpcbiAgICAgICAgICogIFJldHVybiB0cnVlIG9uIHN1Y2Nlc3MsIGFuZCBmYWxzZSBvbiBlcnJvci5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgYm9vbFxyXG4gICAgICAgIFdyaXRlRXZlbnRzKFN0cmVhbSBmaWxlLCBMaXN0PE1pZGlFdmVudD5bXSBldmVudHMsIGludCB0cmFja21vZGUsIGludCBxdWFydGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGJ5dGVbXSBidWYgPSBuZXcgYnl0ZVs2NTUzNl07XHJcblxyXG4gICAgICAgICAgICAgICAgLyogV3JpdGUgdGhlIE1UaGQsIGxlbiA9IDYsIHRyYWNrIG1vZGUsIG51bWJlciB0cmFja3MsIHF1YXJ0ZXIgbm90ZSAqL1xyXG4gICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShBU0NJSUVuY29kaW5nLkFTQ0lJLkdldEJ5dGVzKFwiTVRoZFwiKSwgMCwgNCk7XHJcbiAgICAgICAgICAgICAgICBJbnRUb0J5dGVzKDYsIGJ1ZiwgMCk7XHJcbiAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgNCk7XHJcbiAgICAgICAgICAgICAgICBidWZbMF0gPSAoYnl0ZSkodHJhY2ttb2RlID4+IDgpO1xyXG4gICAgICAgICAgICAgICAgYnVmWzFdID0gKGJ5dGUpKHRyYWNrbW9kZSAmIDB4RkYpO1xyXG4gICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDIpO1xyXG4gICAgICAgICAgICAgICAgYnVmWzBdID0gMDtcclxuICAgICAgICAgICAgICAgIGJ1ZlsxXSA9IChieXRlKWV2ZW50cy5MZW5ndGg7XHJcbiAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgMik7XHJcbiAgICAgICAgICAgICAgICBidWZbMF0gPSAoYnl0ZSkocXVhcnRlciA+PiA4KTtcclxuICAgICAgICAgICAgICAgIGJ1ZlsxXSA9IChieXRlKShxdWFydGVyICYgMHhGRik7XHJcbiAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgMik7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTGlzdDxNaWRpRXZlbnQ+IGxpc3QgaW4gZXZlbnRzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFdyaXRlIHRoZSBNVHJrIGhlYWRlciBhbmQgdHJhY2sgbGVuZ3RoICovXHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShBU0NJSUVuY29kaW5nLkFTQ0lJLkdldEJ5dGVzKFwiTVRya1wiKSwgMCwgNCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IGxlbiA9IEdldFRyYWNrTGVuZ3RoKGxpc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIEludFRvQnl0ZXMobGVuLCBidWYsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCA0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yZWFjaCAoTWlkaUV2ZW50IG1ldmVudCBpbiBsaXN0KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW50IHZhcmxlbiA9IFZhcmxlblRvQnl0ZXMobWV2ZW50LkRlbHRhVGltZSwgYnVmLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIHZhcmxlbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBTeXNleEV2ZW50MSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9PSBTeXNleEV2ZW50MiB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9PSBNZXRhRXZlbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IG1ldmVudC5FdmVudEZsYWc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWZbMF0gPSAoYnl0ZSkobWV2ZW50LkV2ZW50RmxhZyArIG1ldmVudC5DaGFubmVsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgMSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudE5vdGVPbilcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gbWV2ZW50Lk5vdGVudW1iZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWZbMV0gPSBtZXZlbnQuVmVsb2NpdHk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgMik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudE5vdGVPZmYpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IG1ldmVudC5Ob3RlbnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzFdID0gbWV2ZW50LlZlbG9jaXR5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnRLZXlQcmVzc3VyZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gbWV2ZW50Lk5vdGVudW1iZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWZbMV0gPSBtZXZlbnQuS2V5UHJlc3N1cmU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgMik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudENvbnRyb2xDaGFuZ2UpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IG1ldmVudC5Db250cm9sTnVtO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzFdID0gbWV2ZW50LkNvbnRyb2xWYWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCAyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IEV2ZW50UHJvZ3JhbUNoYW5nZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gbWV2ZW50Lkluc3RydW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudENoYW5uZWxQcmVzc3VyZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gbWV2ZW50LkNoYW5QcmVzc3VyZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IEV2ZW50UGl0Y2hCZW5kKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWZbMF0gPSAoYnl0ZSkobWV2ZW50LlBpdGNoQmVuZCA+PiA4KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlsxXSA9IChieXRlKShtZXZlbnQuUGl0Y2hCZW5kICYgMHhGRik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgMik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBTeXNleEV2ZW50MSlcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50IG9mZnNldCA9IFZhcmxlblRvQnl0ZXMobWV2ZW50Lk1ldGFsZW5ndGgsIGJ1ZiwgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBBcnJheS5Db3B5KG1ldmVudC5WYWx1ZSwgMCwgYnVmLCBvZmZzZXQsIG1ldmVudC5WYWx1ZS5MZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIG9mZnNldCArIG1ldmVudC5WYWx1ZS5MZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gU3lzZXhFdmVudDIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludCBvZmZzZXQgPSBWYXJsZW5Ub0J5dGVzKG1ldmVudC5NZXRhbGVuZ3RoLCBidWYsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQXJyYXkuQ29weShtZXZlbnQuVmFsdWUsIDAsIGJ1Ziwgb2Zmc2V0LCBtZXZlbnQuVmFsdWUuTGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCBvZmZzZXQgKyBtZXZlbnQuVmFsdWUuTGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IE1ldGFFdmVudCAmJiBtZXZlbnQuTWV0YWV2ZW50ID09IE1ldGFFdmVudFRlbXBvKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWZbMF0gPSBtZXZlbnQuTWV0YWV2ZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzFdID0gMztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlsyXSA9IChieXRlKSgobWV2ZW50LlRlbXBvID4+IDE2KSAmIDB4RkYpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzNdID0gKGJ5dGUpKChtZXZlbnQuVGVtcG8gPj4gOCkgJiAweEZGKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1Zls0XSA9IChieXRlKShtZXZlbnQuVGVtcG8gJiAweEZGKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCA1KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IE1ldGFFdmVudClcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gbWV2ZW50Lk1ldGFldmVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludCBvZmZzZXQgPSBWYXJsZW5Ub0J5dGVzKG1ldmVudC5NZXRhbGVuZ3RoLCBidWYsIDEpICsgMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LkNvcHkobWV2ZW50LlZhbHVlLCAwLCBidWYsIG9mZnNldCwgbWV2ZW50LlZhbHVlLkxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgb2Zmc2V0ICsgbWV2ZW50LlZhbHVlLkxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmaWxlLkNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoSU9FeGNlcHRpb24gZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIENsb25lIHRoZSBsaXN0IG9mIE1pZGlFdmVudHMgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBMaXN0PE1pZGlFdmVudD5bXSBDbG9uZU1pZGlFdmVudHMoTGlzdDxNaWRpRXZlbnQ+W10gb3JpZ2xpc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBMaXN0PE1pZGlFdmVudD5bXSBuZXdsaXN0ID0gbmV3IExpc3Q8TWlkaUV2ZW50PltvcmlnbGlzdC5MZW5ndGhdO1xyXG4gICAgICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgb3JpZ2xpc3QuTGVuZ3RoOyB0cmFja251bSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBMaXN0PE1pZGlFdmVudD4gb3JpZ2V2ZW50cyA9IG9yaWdsaXN0W3RyYWNrbnVtXTtcclxuICAgICAgICAgICAgICAgIExpc3Q8TWlkaUV2ZW50PiBuZXdldmVudHMgPSBuZXcgTGlzdDxNaWRpRXZlbnQ+KG9yaWdldmVudHMuQ291bnQpO1xyXG4gICAgICAgICAgICAgICAgbmV3bGlzdFt0cmFja251bV0gPSBuZXdldmVudHM7XHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbWV2ZW50IGluIG9yaWdldmVudHMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3ZXZlbnRzLkFkZChtZXZlbnQuQ2xvbmUoKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG5ld2xpc3Q7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogQ3JlYXRlIGEgbmV3IE1pZGkgdGVtcG8gZXZlbnQsIHdpdGggdGhlIGdpdmVuIHRlbXBvICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIE1pZGlFdmVudCBDcmVhdGVUZW1wb0V2ZW50KGludCB0ZW1wbylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIE1pZGlFdmVudCBtZXZlbnQgPSBuZXcgTWlkaUV2ZW50KCk7XHJcbiAgICAgICAgICAgIG1ldmVudC5EZWx0YVRpbWUgPSAwO1xyXG4gICAgICAgICAgICBtZXZlbnQuU3RhcnRUaW1lID0gMDtcclxuICAgICAgICAgICAgbWV2ZW50Lkhhc0V2ZW50ZmxhZyA9IHRydWU7XHJcbiAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPSBNZXRhRXZlbnQ7XHJcbiAgICAgICAgICAgIG1ldmVudC5NZXRhZXZlbnQgPSBNZXRhRXZlbnRUZW1wbztcclxuICAgICAgICAgICAgbWV2ZW50Lk1ldGFsZW5ndGggPSAzO1xyXG4gICAgICAgICAgICBtZXZlbnQuVGVtcG8gPSB0ZW1wbztcclxuICAgICAgICAgICAgcmV0dXJuIG1ldmVudDtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogU2VhcmNoIHRoZSBldmVudHMgZm9yIGEgQ29udHJvbENoYW5nZSBldmVudCB3aXRoIHRoZSBzYW1lXG4gICAgICAgICAqICBjaGFubmVsIGFuZCBjb250cm9sIG51bWJlci4gIElmIGEgbWF0Y2hpbmcgZXZlbnQgaXMgZm91bmQsXG4gICAgICAgICAqICAgdXBkYXRlIHRoZSBjb250cm9sIHZhbHVlLiAgRWxzZSwgYWRkIGEgbmV3IENvbnRyb2xDaGFuZ2UgZXZlbnQuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWRcclxuICAgICAgICBVcGRhdGVDb250cm9sQ2hhbmdlKExpc3Q8TWlkaUV2ZW50PiBuZXdldmVudHMsIE1pZGlFdmVudCBjaGFuZ2VFdmVudClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBtZXZlbnQgaW4gbmV3ZXZlbnRzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKG1ldmVudC5FdmVudEZsYWcgPT0gY2hhbmdlRXZlbnQuRXZlbnRGbGFnKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgIChtZXZlbnQuQ2hhbm5lbCA9PSBjaGFuZ2VFdmVudC5DaGFubmVsKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgIChtZXZlbnQuQ29udHJvbE51bSA9PSBjaGFuZ2VFdmVudC5Db250cm9sTnVtKSlcclxuICAgICAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkNvbnRyb2xWYWx1ZSA9IGNoYW5nZUV2ZW50LkNvbnRyb2xWYWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbmV3ZXZlbnRzLkFkZChjaGFuZ2VFdmVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogU3RhcnQgdGhlIE1pZGkgbXVzaWMgYXQgdGhlIGdpdmVuIHBhdXNlIHRpbWUgKGluIHB1bHNlcykuXG4gICAgICAgICAqICBSZW1vdmUgYW55IE5vdGVPbi9Ob3RlT2ZmIGV2ZW50cyB0aGF0IG9jY3VyIGJlZm9yZSB0aGUgcGF1c2UgdGltZS5cbiAgICAgICAgICogIEZvciBvdGhlciBldmVudHMsIGNoYW5nZSB0aGUgZGVsdGEtdGltZSB0byAwIGlmIHRoZXkgb2NjdXJcbiAgICAgICAgICogIGJlZm9yZSB0aGUgcGF1c2UgdGltZS4gIFJldHVybiB0aGUgbW9kaWZpZWQgTWlkaSBFdmVudHMuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIExpc3Q8TWlkaUV2ZW50PltdXHJcbiAgICAgICAgU3RhcnRBdFBhdXNlVGltZShMaXN0PE1pZGlFdmVudD5bXSBsaXN0LCBpbnQgcGF1c2VUaW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgTGlzdDxNaWRpRXZlbnQ+W10gbmV3bGlzdCA9IG5ldyBMaXN0PE1pZGlFdmVudD5bbGlzdC5MZW5ndGhdO1xyXG4gICAgICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgbGlzdC5MZW5ndGg7IHRyYWNrbnVtKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIExpc3Q8TWlkaUV2ZW50PiBldmVudHMgPSBsaXN0W3RyYWNrbnVtXTtcclxuICAgICAgICAgICAgICAgIExpc3Q8TWlkaUV2ZW50PiBuZXdldmVudHMgPSBuZXcgTGlzdDxNaWRpRXZlbnQ+KGV2ZW50cy5Db3VudCk7XHJcbiAgICAgICAgICAgICAgICBuZXdsaXN0W3RyYWNrbnVtXSA9IG5ld2V2ZW50cztcclxuXHJcbiAgICAgICAgICAgICAgICBib29sIGZvdW5kRXZlbnRBZnRlclBhdXNlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbWV2ZW50IGluIGV2ZW50cylcclxuICAgICAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1ldmVudC5TdGFydFRpbWUgPCBwYXVzZVRpbWUpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudE5vdGVPbiB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudE5vdGVPZmYpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBTa2lwIE5vdGVPbi9Ob3RlT2ZmIGV2ZW50ICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudENvbnRyb2xDaGFuZ2UpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5EZWx0YVRpbWUgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVXBkYXRlQ29udHJvbENoYW5nZShuZXdldmVudHMsIG1ldmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRGVsdGFUaW1lID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld2V2ZW50cy5BZGQobWV2ZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICghZm91bmRFdmVudEFmdGVyUGF1c2UpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRGVsdGFUaW1lID0gKG1ldmVudC5TdGFydFRpbWUgLSBwYXVzZVRpbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdldmVudHMuQWRkKG1ldmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kRXZlbnRBZnRlclBhdXNlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3ZXZlbnRzLkFkZChtZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbmV3bGlzdDtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogV3JpdGUgdGhpcyBNaWRpIGZpbGUgdG8gdGhlIGdpdmVuIGZpbGVuYW1lLlxuICAgICAgICAgKiBJZiBvcHRpb25zIGlzIG5vdCBudWxsLCBhcHBseSB0aG9zZSBvcHRpb25zIHRvIHRoZSBtaWRpIGV2ZW50c1xuICAgICAgICAgKiBiZWZvcmUgcGVyZm9ybWluZyB0aGUgd3JpdGUuXG4gICAgICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSBmaWxlIHdhcyBzYXZlZCBzdWNjZXNzZnVsbHksIGVsc2UgZmFsc2UuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBib29sIENoYW5nZVNvdW5kKHN0cmluZyBkZXN0ZmlsZSwgTWlkaU9wdGlvbnMgb3B0aW9ucylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiBXcml0ZShkZXN0ZmlsZSwgb3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgYm9vbCBXcml0ZShzdHJpbmcgZGVzdGZpbGUsIE1pZGlPcHRpb25zIG9wdGlvbnMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0cnlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgRmlsZVN0cmVhbSBzdHJlYW07XHJcbiAgICAgICAgICAgICAgICBzdHJlYW0gPSBuZXcgRmlsZVN0cmVhbShkZXN0ZmlsZSwgRmlsZU1vZGUuQ3JlYXRlKTtcclxuICAgICAgICAgICAgICAgIGJvb2wgcmVzdWx0ID0gV3JpdGUoc3RyZWFtLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIHN0cmVhbS5DbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoSU9FeGNlcHRpb24gZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogV3JpdGUgdGhpcyBNaWRpIGZpbGUgdG8gdGhlIGdpdmVuIHN0cmVhbS5cbiAgICAgICAgICogSWYgb3B0aW9ucyBpcyBub3QgbnVsbCwgYXBwbHkgdGhvc2Ugb3B0aW9ucyB0byB0aGUgbWlkaSBldmVudHNcbiAgICAgICAgICogYmVmb3JlIHBlcmZvcm1pbmcgdGhlIHdyaXRlLlxuICAgICAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgZmlsZSB3YXMgc2F2ZWQgc3VjY2Vzc2Z1bGx5LCBlbHNlIGZhbHNlLlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgYm9vbCBXcml0ZShTdHJlYW0gc3RyZWFtLCBNaWRpT3B0aW9ucyBvcHRpb25zKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgTGlzdDxNaWRpRXZlbnQ+W10gbmV3ZXZlbnRzID0gZXZlbnRzO1xyXG4gICAgICAgICAgICBpZiAob3B0aW9ucyAhPSBudWxsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBuZXdldmVudHMgPSBBcHBseU9wdGlvbnNUb0V2ZW50cyhvcHRpb25zKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gV3JpdGVFdmVudHMoc3RyZWFtLCBuZXdldmVudHMsIHRyYWNrbW9kZSwgcXVhcnRlcm5vdGUpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qIEFwcGx5IHRoZSBmb2xsb3dpbmcgc291bmQgb3B0aW9ucyB0byB0aGUgbWlkaSBldmVudHM6XHJcbiAgICAgICAgICogLSBUaGUgdGVtcG8gKHRoZSBtaWNyb3NlY29uZHMgcGVyIHB1bHNlKVxyXG4gICAgICAgICAqIC0gVGhlIGluc3RydW1lbnRzIHBlciB0cmFja1xyXG4gICAgICAgICAqIC0gVGhlIG5vdGUgbnVtYmVyICh0cmFuc3Bvc2UgdmFsdWUpXHJcbiAgICAgICAgICogLSBUaGUgdHJhY2tzIHRvIGluY2x1ZGVcclxuICAgICAgICAgKiBSZXR1cm4gdGhlIG1vZGlmaWVkIGxpc3Qgb2YgbWlkaSBldmVudHMuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBMaXN0PE1pZGlFdmVudD5bXVxyXG4gICAgICAgIEFwcGx5T3B0aW9uc1RvRXZlbnRzKE1pZGlPcHRpb25zIG9wdGlvbnMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbnQgaTtcclxuICAgICAgICAgICAgaWYgKHRyYWNrUGVyQ2hhbm5lbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEFwcGx5T3B0aW9uc1BlckNoYW5uZWwob3B0aW9ucyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIEEgbWlkaWZpbGUgY2FuIGNvbnRhaW4gdHJhY2tzIHdpdGggbm90ZXMgYW5kIHRyYWNrcyB3aXRob3V0IG5vdGVzLlxyXG4gICAgICAgICAgICAgKiBUaGUgb3B0aW9ucy50cmFja3MgYW5kIG9wdGlvbnMuaW5zdHJ1bWVudHMgYXJlIGZvciB0cmFja3Mgd2l0aCBub3Rlcy5cclxuICAgICAgICAgICAgICogU28gdGhlIHRyYWNrIG51bWJlcnMgaW4gJ29wdGlvbnMnIG1heSBub3QgbWF0Y2ggY29ycmVjdGx5IGlmIHRoZVxyXG4gICAgICAgICAgICAgKiBtaWRpIGZpbGUgaGFzIHRyYWNrcyB3aXRob3V0IG5vdGVzLiBSZS1jb21wdXRlIHRoZSBpbnN0cnVtZW50cywgYW5kIFxyXG4gICAgICAgICAgICAgKiB0cmFja3MgdG8ga2VlcC5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGludCBudW1fdHJhY2tzID0gZXZlbnRzLkxlbmd0aDtcclxuICAgICAgICAgICAgaW50W10gaW5zdHJ1bWVudHMgPSBuZXcgaW50W251bV90cmFja3NdO1xyXG4gICAgICAgICAgICBib29sW10ga2VlcHRyYWNrcyA9IG5ldyBib29sW251bV90cmFja3NdO1xyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbnVtX3RyYWNrczsgaSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnN0cnVtZW50c1tpXSA9IDA7XHJcbiAgICAgICAgICAgICAgICBrZWVwdHJhY2tzW2ldID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgdHJhY2tzLkNvdW50OyB0cmFja251bSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBNaWRpVHJhY2sgdHJhY2sgPSB0cmFja3NbdHJhY2tudW1dO1xyXG4gICAgICAgICAgICAgICAgaW50IHJlYWx0cmFjayA9IHRyYWNrLk51bWJlcjtcclxuICAgICAgICAgICAgICAgIGluc3RydW1lbnRzW3JlYWx0cmFja10gPSBvcHRpb25zLmluc3RydW1lbnRzW3RyYWNrbnVtXTtcclxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLm11dGVbdHJhY2tudW1dID09IHRydWUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAga2VlcHRyYWNrc1tyZWFsdHJhY2tdID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIExpc3Q8TWlkaUV2ZW50PltdIG5ld2V2ZW50cyA9IENsb25lTWlkaUV2ZW50cyhldmVudHMpO1xyXG5cclxuICAgICAgICAgICAgLyogU2V0IHRoZSB0ZW1wbyBhdCB0aGUgYmVnaW5uaW5nIG9mIGVhY2ggdHJhY2sgKi9cclxuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IG5ld2V2ZW50cy5MZW5ndGg7IHRyYWNrbnVtKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIE1pZGlFdmVudCBtZXZlbnQgPSBDcmVhdGVUZW1wb0V2ZW50KG9wdGlvbnMudGVtcG8pO1xyXG4gICAgICAgICAgICAgICAgbmV3ZXZlbnRzW3RyYWNrbnVtXS5JbnNlcnQoMCwgbWV2ZW50KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLyogQ2hhbmdlIHRoZSBub3RlIG51bWJlciAodHJhbnNwb3NlKSwgaW5zdHJ1bWVudCwgYW5kIHRlbXBvICovXHJcbiAgICAgICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCBuZXdldmVudHMuTGVuZ3RoOyB0cmFja251bSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbWV2ZW50IGluIG5ld2V2ZW50c1t0cmFja251bV0pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IG51bSA9IG1ldmVudC5Ob3RlbnVtYmVyICsgb3B0aW9ucy50cmFuc3Bvc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG51bSA8IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG51bSA+IDEyNylcclxuICAgICAgICAgICAgICAgICAgICAgICAgbnVtID0gMTI3O1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5Ob3RlbnVtYmVyID0gKGJ5dGUpbnVtO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy51c2VEZWZhdWx0SW5zdHJ1bWVudHMpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuSW5zdHJ1bWVudCA9IChieXRlKWluc3RydW1lbnRzW3RyYWNrbnVtXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LlRlbXBvID0gb3B0aW9ucy50ZW1wbztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMucGF1c2VUaW1lICE9IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG5ld2V2ZW50cyA9IFN0YXJ0QXRQYXVzZVRpbWUobmV3ZXZlbnRzLCBvcHRpb25zLnBhdXNlVGltZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIENoYW5nZSB0aGUgdHJhY2tzIHRvIGluY2x1ZGUgKi9cclxuICAgICAgICAgICAgaW50IGNvdW50ID0gMDtcclxuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IGtlZXB0cmFja3MuTGVuZ3RoOyB0cmFja251bSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoa2VlcHRyYWNrc1t0cmFja251bV0pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY291bnQrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBMaXN0PE1pZGlFdmVudD5bXSByZXN1bHQgPSBuZXcgTGlzdDxNaWRpRXZlbnQ+W2NvdW50XTtcclxuICAgICAgICAgICAgaSA9IDA7XHJcbiAgICAgICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCBrZWVwdHJhY2tzLkxlbmd0aDsgdHJhY2tudW0rKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGtlZXB0cmFja3NbdHJhY2tudW1dKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtpXSA9IG5ld2V2ZW50c1t0cmFja251bV07XHJcbiAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiBBcHBseSB0aGUgZm9sbG93aW5nIHNvdW5kIG9wdGlvbnMgdG8gdGhlIG1pZGkgZXZlbnRzOlxyXG4gICAgICAgICAqIC0gVGhlIHRlbXBvICh0aGUgbWljcm9zZWNvbmRzIHBlciBwdWxzZSlcclxuICAgICAgICAgKiAtIFRoZSBpbnN0cnVtZW50cyBwZXIgdHJhY2tcclxuICAgICAgICAgKiAtIFRoZSBub3RlIG51bWJlciAodHJhbnNwb3NlIHZhbHVlKVxyXG4gICAgICAgICAqIC0gVGhlIHRyYWNrcyB0byBpbmNsdWRlXHJcbiAgICAgICAgICogUmV0dXJuIHRoZSBtb2RpZmllZCBsaXN0IG9mIG1pZGkgZXZlbnRzLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogVGhpcyBNaWRpIGZpbGUgb25seSBoYXMgb25lIGFjdHVhbCB0cmFjaywgYnV0IHdlJ3ZlIHNwbGl0IHRoYXRcclxuICAgICAgICAgKiBpbnRvIG11bHRpcGxlIGZha2UgdHJhY2tzLCBvbmUgcGVyIGNoYW5uZWwsIGFuZCBkaXNwbGF5ZWQgdGhhdFxyXG4gICAgICAgICAqIHRvIHRoZSBlbmQtdXNlci4gIFNvIGNoYW5naW5nIHRoZSBpbnN0cnVtZW50LCBhbmQgdHJhY2tzIHRvXHJcbiAgICAgICAgICogaW5jbHVkZSwgaXMgaW1wbGVtZW50ZWQgZGlmZmVyZW50bHkgdGhhbiBBcHBseU9wdGlvbnNUb0V2ZW50cygpLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogLSBXZSBjaGFuZ2UgdGhlIGluc3RydW1lbnQgYmFzZWQgb24gdGhlIGNoYW5uZWwsIG5vdCB0aGUgdHJhY2suXHJcbiAgICAgICAgICogLSBXZSBpbmNsdWRlL2V4Y2x1ZGUgY2hhbm5lbHMsIG5vdCB0cmFja3MuXHJcbiAgICAgICAgICogLSBXZSBleGNsdWRlIGEgY2hhbm5lbCBieSBzZXR0aW5nIHRoZSBub3RlIHZvbHVtZS92ZWxvY2l0eSB0byAwLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgTGlzdDxNaWRpRXZlbnQ+W11cclxuICAgICAgICBBcHBseU9wdGlvbnNQZXJDaGFubmVsKE1pZGlPcHRpb25zIG9wdGlvbnMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvKiBEZXRlcm1pbmUgd2hpY2ggY2hhbm5lbHMgdG8gaW5jbHVkZS9leGNsdWRlLlxyXG4gICAgICAgICAgICAgKiBBbHNvLCBkZXRlcm1pbmUgdGhlIGluc3RydW1lbnRzIGZvciBlYWNoIGNoYW5uZWwuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBpbnRbXSBpbnN0cnVtZW50cyA9IG5ldyBpbnRbMTZdO1xyXG4gICAgICAgICAgICBib29sW10ga2VlcGNoYW5uZWwgPSBuZXcgYm9vbFsxNl07XHJcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgMTY7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW5zdHJ1bWVudHNbaV0gPSAwO1xyXG4gICAgICAgICAgICAgICAga2VlcGNoYW5uZWxbaV0gPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCB0cmFja3MuQ291bnQ7IHRyYWNrbnVtKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIE1pZGlUcmFjayB0cmFjayA9IHRyYWNrc1t0cmFja251bV07XHJcbiAgICAgICAgICAgICAgICBpbnQgY2hhbm5lbCA9IHRyYWNrLk5vdGVzWzBdLkNoYW5uZWw7XHJcbiAgICAgICAgICAgICAgICBpbnN0cnVtZW50c1tjaGFubmVsXSA9IG9wdGlvbnMuaW5zdHJ1bWVudHNbdHJhY2tudW1dO1xyXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMubXV0ZVt0cmFja251bV0gPT0gdHJ1ZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBrZWVwY2hhbm5lbFtjaGFubmVsXSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBMaXN0PE1pZGlFdmVudD5bXSBuZXdldmVudHMgPSBDbG9uZU1pZGlFdmVudHMoZXZlbnRzKTtcclxuXHJcbiAgICAgICAgICAgIC8qIFNldCB0aGUgdGVtcG8gYXQgdGhlIGJlZ2lubmluZyBvZiBlYWNoIHRyYWNrICovXHJcbiAgICAgICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCBuZXdldmVudHMuTGVuZ3RoOyB0cmFja251bSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBNaWRpRXZlbnQgbWV2ZW50ID0gQ3JlYXRlVGVtcG9FdmVudChvcHRpb25zLnRlbXBvKTtcclxuICAgICAgICAgICAgICAgIG5ld2V2ZW50c1t0cmFja251bV0uSW5zZXJ0KDAsIG1ldmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIENoYW5nZSB0aGUgbm90ZSBudW1iZXIgKHRyYW5zcG9zZSksIGluc3RydW1lbnQsIGFuZCB0ZW1wbyAqL1xyXG4gICAgICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgbmV3ZXZlbnRzLkxlbmd0aDsgdHJhY2tudW0rKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTWlkaUV2ZW50IG1ldmVudCBpbiBuZXdldmVudHNbdHJhY2tudW1dKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBudW0gPSBtZXZlbnQuTm90ZW51bWJlciArIG9wdGlvbnMudHJhbnNwb3NlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChudW0gPCAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBudW0gPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChudW0gPiAxMjcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bSA9IDEyNztcclxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuTm90ZW51bWJlciA9IChieXRlKW51bTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWtlZXBjaGFubmVsW21ldmVudC5DaGFubmVsXSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5WZWxvY2l0eSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy51c2VEZWZhdWx0SW5zdHJ1bWVudHMpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuSW5zdHJ1bWVudCA9IChieXRlKWluc3RydW1lbnRzW21ldmVudC5DaGFubmVsXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LlRlbXBvID0gb3B0aW9ucy50ZW1wbztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5wYXVzZVRpbWUgIT0gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmV3ZXZlbnRzID0gU3RhcnRBdFBhdXNlVGltZShuZXdldmVudHMsIG9wdGlvbnMucGF1c2VUaW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbmV3ZXZlbnRzO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBBcHBseSB0aGUgZ2l2ZW4gc2hlZXQgbXVzaWMgb3B0aW9ucyB0byB0aGUgTWlkaU5vdGVzLlxuICAgICAgICAgKiAgUmV0dXJuIHRoZSBtaWRpIHRyYWNrcyB3aXRoIHRoZSBjaGFuZ2VzIGFwcGxpZWQuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBMaXN0PE1pZGlUcmFjaz4gQ2hhbmdlTWlkaU5vdGVzKE1pZGlPcHRpb25zIG9wdGlvbnMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBMaXN0PE1pZGlUcmFjaz4gbmV3dHJhY2tzID0gbmV3IExpc3Q8TWlkaVRyYWNrPigpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2sgPSAwOyB0cmFjayA8IHRyYWNrcy5Db3VudDsgdHJhY2srKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMudHJhY2tzW3RyYWNrXSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXd0cmFja3MuQWRkKHRyYWNrc1t0cmFja10uQ2xvbmUoKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIFRvIG1ha2UgdGhlIHNoZWV0IG11c2ljIGxvb2sgbmljZXIsIHdlIHJvdW5kIHRoZSBzdGFydCB0aW1lc1xyXG4gICAgICAgICAgICAgKiBzbyB0aGF0IG5vdGVzIGNsb3NlIHRvZ2V0aGVyIGFwcGVhciBhcyBhIHNpbmdsZSBjaG9yZC4gIFdlXHJcbiAgICAgICAgICAgICAqIGFsc28gZXh0ZW5kIHRoZSBub3RlIGR1cmF0aW9ucywgc28gdGhhdCB3ZSBoYXZlIGxvbmdlciBub3Rlc1xyXG4gICAgICAgICAgICAgKiBhbmQgZmV3ZXIgcmVzdCBzeW1ib2xzLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgVGltZVNpZ25hdHVyZSB0aW1lID0gdGltZXNpZztcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudGltZSAhPSBudWxsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aW1lID0gb3B0aW9ucy50aW1lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIE1pZGlGaWxlLlJvdW5kU3RhcnRUaW1lcyhuZXd0cmFja3MsIG9wdGlvbnMuY29tYmluZUludGVydmFsLCB0aW1lc2lnKTtcclxuICAgICAgICAgICAgTWlkaUZpbGUuUm91bmREdXJhdGlvbnMobmV3dHJhY2tzLCB0aW1lLlF1YXJ0ZXIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudHdvU3RhZmZzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBuZXd0cmFja3MgPSBNaWRpRmlsZS5Db21iaW5lVG9Ud29UcmFja3MobmV3dHJhY2tzLCB0aW1lc2lnLk1lYXN1cmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnNoaWZ0dGltZSAhPSAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBNaWRpRmlsZS5TaGlmdFRpbWUobmV3dHJhY2tzLCBvcHRpb25zLnNoaWZ0dGltZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudHJhbnNwb3NlICE9IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIE1pZGlGaWxlLlRyYW5zcG9zZShuZXd0cmFja3MsIG9wdGlvbnMudHJhbnNwb3NlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG5ld3RyYWNrcztcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogU2hpZnQgdGhlIHN0YXJ0dGltZSBvZiB0aGUgbm90ZXMgYnkgdGhlIGdpdmVuIGFtb3VudC5cbiAgICAgICAgICogVGhpcyBpcyB1c2VkIGJ5IHRoZSBTaGlmdCBOb3RlcyBtZW51IHRvIHNoaWZ0IG5vdGVzIGxlZnQvcmlnaHQuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZFxyXG4gICAgICAgIFNoaWZ0VGltZShMaXN0PE1pZGlUcmFjaz4gdHJhY2tzLCBpbnQgYW1vdW50KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiB0cmFjay5Ob3RlcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBub3RlLlN0YXJ0VGltZSArPSBhbW91bnQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBTaGlmdCB0aGUgbm90ZSBrZXlzIHVwL2Rvd24gYnkgdGhlIGdpdmVuIGFtb3VudCAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZFxyXG4gICAgICAgIFRyYW5zcG9zZShMaXN0PE1pZGlUcmFjaz4gdHJhY2tzLCBpbnQgYW1vdW50KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiB0cmFjay5Ob3RlcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBub3RlLk51bWJlciArPSBhbW91bnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vdGUuTnVtYmVyIDwgMClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdGUuTnVtYmVyID0gMDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiBGaW5kIHRoZSBoaWdoZXN0IGFuZCBsb3dlc3Qgbm90ZXMgdGhhdCBvdmVybGFwIHRoaXMgaW50ZXJ2YWwgKHN0YXJ0dGltZSB0byBlbmR0aW1lKS5cclxuICAgICAgICAgKiBUaGlzIG1ldGhvZCBpcyB1c2VkIGJ5IFNwbGl0VHJhY2sgdG8gZGV0ZXJtaW5lIHdoaWNoIHN0YWZmICh0b3Agb3IgYm90dG9tKSBhIG5vdGVcclxuICAgICAgICAgKiBzaG91bGQgZ28gdG8uXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBGb3IgbW9yZSBhY2N1cmF0ZSBTcGxpdFRyYWNrKCkgcmVzdWx0cywgd2UgbGltaXQgdGhlIGludGVydmFsL2R1cmF0aW9uIG9mIHRoaXMgbm90ZSBcclxuICAgICAgICAgKiAoYW5kIG90aGVyIG5vdGVzKSB0byBvbmUgbWVhc3VyZS4gV2UgY2FyZSBvbmx5IGFib3V0IGhpZ2gvbG93IG5vdGVzIHRoYXQgYXJlXHJcbiAgICAgICAgICogcmVhc29uYWJseSBjbG9zZSB0byB0aGlzIG5vdGUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZFxyXG4gICAgICAgIEZpbmRIaWdoTG93Tm90ZXMoTGlzdDxNaWRpTm90ZT4gbm90ZXMsIGludCBtZWFzdXJlbGVuLCBpbnQgc3RhcnRpbmRleCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgIGludCBzdGFydHRpbWUsIGludCBlbmR0aW1lLCByZWYgaW50IGhpZ2gsIHJlZiBpbnQgbG93KVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIGludCBpID0gc3RhcnRpbmRleDtcclxuICAgICAgICAgICAgaWYgKHN0YXJ0dGltZSArIG1lYXN1cmVsZW4gPCBlbmR0aW1lKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbmR0aW1lID0gc3RhcnR0aW1lICsgbWVhc3VyZWxlbjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgd2hpbGUgKGkgPCBub3Rlcy5Db3VudCAmJiBub3Rlc1tpXS5TdGFydFRpbWUgPCBlbmR0aW1lKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAobm90ZXNbaV0uRW5kVGltZSA8IHN0YXJ0dGltZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAobm90ZXNbaV0uU3RhcnRUaW1lICsgbWVhc3VyZWxlbiA8IHN0YXJ0dGltZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoaGlnaCA8IG5vdGVzW2ldLk51bWJlcilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBoaWdoID0gbm90ZXNbaV0uTnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGxvdyA+IG5vdGVzW2ldLk51bWJlcilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsb3cgPSBub3Rlc1tpXS5OdW1iZXI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qIEZpbmQgdGhlIGhpZ2hlc3QgYW5kIGxvd2VzdCBub3RlcyB0aGF0IHN0YXJ0IGF0IHRoaXMgZXhhY3Qgc3RhcnQgdGltZSAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWRcclxuICAgICAgICBGaW5kRXhhY3RIaWdoTG93Tm90ZXMoTGlzdDxNaWRpTm90ZT4gbm90ZXMsIGludCBzdGFydGluZGV4LCBpbnQgc3RhcnR0aW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWYgaW50IGhpZ2gsIHJlZiBpbnQgbG93KVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIGludCBpID0gc3RhcnRpbmRleDtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlIChub3Rlc1tpXS5TdGFydFRpbWUgPCBzdGFydHRpbWUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgd2hpbGUgKGkgPCBub3Rlcy5Db3VudCAmJiBub3Rlc1tpXS5TdGFydFRpbWUgPT0gc3RhcnR0aW1lKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaGlnaCA8IG5vdGVzW2ldLk51bWJlcilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBoaWdoID0gbm90ZXNbaV0uTnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGxvdyA+IG5vdGVzW2ldLk51bWJlcilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsb3cgPSBub3Rlc1tpXS5OdW1iZXI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuXHJcbiAgICAgICAgLyogU3BsaXQgdGhlIGdpdmVuIE1pZGlUcmFjayBpbnRvIHR3byB0cmFja3MsIHRvcCBhbmQgYm90dG9tLlxyXG4gICAgICAgICAqIFRoZSBoaWdoZXN0IG5vdGVzIHdpbGwgZ28gaW50byB0b3AsIHRoZSBsb3dlc3QgaW50byBib3R0b20uXHJcbiAgICAgICAgICogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIHNwbGl0IHBpYW5vIHNvbmdzIGludG8gbGVmdC1oYW5kIChib3R0b20pXHJcbiAgICAgICAgICogYW5kIHJpZ2h0LWhhbmQgKHRvcCkgdHJhY2tzLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgTGlzdDxNaWRpVHJhY2s+IFNwbGl0VHJhY2soTWlkaVRyYWNrIHRyYWNrLCBpbnQgbWVhc3VyZWxlbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIExpc3Q8TWlkaU5vdGU+IG5vdGVzID0gdHJhY2suTm90ZXM7XHJcbiAgICAgICAgICAgIGludCBjb3VudCA9IG5vdGVzLkNvdW50O1xyXG5cclxuICAgICAgICAgICAgTWlkaVRyYWNrIHRvcCA9IG5ldyBNaWRpVHJhY2soMSk7XHJcbiAgICAgICAgICAgIE1pZGlUcmFjayBib3R0b20gPSBuZXcgTWlkaVRyYWNrKDIpO1xyXG4gICAgICAgICAgICBMaXN0PE1pZGlUcmFjaz4gcmVzdWx0ID0gbmV3IExpc3Q8TWlkaVRyYWNrPigyKTtcclxuICAgICAgICAgICAgcmVzdWx0LkFkZCh0b3ApOyByZXN1bHQuQWRkKGJvdHRvbSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoY291bnQgPT0gMClcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gICAgICAgICAgICBpbnQgcHJldmhpZ2ggPSA3NjsgLyogRTUsIHRvcCBvZiB0cmVibGUgc3RhZmYgKi9cclxuICAgICAgICAgICAgaW50IHByZXZsb3cgPSA0NTsgLyogQTMsIGJvdHRvbSBvZiBiYXNzIHN0YWZmICovXHJcbiAgICAgICAgICAgIGludCBzdGFydGluZGV4ID0gMDtcclxuXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG5vdGUgaW4gbm90ZXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGludCBoaWdoLCBsb3csIGhpZ2hFeGFjdCwgbG93RXhhY3Q7XHJcblxyXG4gICAgICAgICAgICAgICAgaW50IG51bWJlciA9IG5vdGUuTnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgaGlnaCA9IGxvdyA9IGhpZ2hFeGFjdCA9IGxvd0V4YWN0ID0gbnVtYmVyO1xyXG5cclxuICAgICAgICAgICAgICAgIHdoaWxlIChub3Rlc1tzdGFydGluZGV4XS5FbmRUaW1lIDwgbm90ZS5TdGFydFRpbWUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRpbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8qIEkndmUgdHJpZWQgc2V2ZXJhbCBhbGdvcml0aG1zIGZvciBzcGxpdHRpbmcgYSB0cmFjayBpbiB0d28sXHJcbiAgICAgICAgICAgICAgICAgKiBhbmQgdGhlIG9uZSBiZWxvdyBzZWVtcyB0byB3b3JrIHRoZSBiZXN0OlxyXG4gICAgICAgICAgICAgICAgICogLSBJZiB0aGlzIG5vdGUgaXMgbW9yZSB0aGFuIGFuIG9jdGF2ZSBmcm9tIHRoZSBoaWdoL2xvdyBub3Rlc1xyXG4gICAgICAgICAgICAgICAgICogICAodGhhdCBzdGFydCBleGFjdGx5IGF0IHRoaXMgc3RhcnQgdGltZSksIGNob29zZSB0aGUgY2xvc2VzdCBvbmUuXHJcbiAgICAgICAgICAgICAgICAgKiAtIElmIHRoaXMgbm90ZSBpcyBtb3JlIHRoYW4gYW4gb2N0YXZlIGZyb20gdGhlIGhpZ2gvbG93IG5vdGVzXHJcbiAgICAgICAgICAgICAgICAgKiAgIChpbiB0aGlzIG5vdGUncyB0aW1lIGR1cmF0aW9uKSwgY2hvb3NlIHRoZSBjbG9zZXN0IG9uZS5cclxuICAgICAgICAgICAgICAgICAqIC0gSWYgdGhlIGhpZ2ggYW5kIGxvdyBub3RlcyAodGhhdCBzdGFydCBleGFjdGx5IGF0IHRoaXMgc3RhcnR0aW1lKVxyXG4gICAgICAgICAgICAgICAgICogICBhcmUgbW9yZSB0aGFuIGFuIG9jdGF2ZSBhcGFydCwgY2hvb3NlIHRoZSBjbG9zZXN0IG5vdGUuXHJcbiAgICAgICAgICAgICAgICAgKiAtIElmIHRoZSBoaWdoIGFuZCBsb3cgbm90ZXMgKHRoYXQgb3ZlcmxhcCB0aGlzIHN0YXJ0dGltZSlcclxuICAgICAgICAgICAgICAgICAqICAgYXJlIG1vcmUgdGhhbiBhbiBvY3RhdmUgYXBhcnQsIGNob29zZSB0aGUgY2xvc2VzdCBub3RlLlxyXG4gICAgICAgICAgICAgICAgICogLSBFbHNlLCBsb29rIGF0IHRoZSBwcmV2aW91cyBoaWdoL2xvdyBub3RlcyB0aGF0IHdlcmUgbW9yZSB0aGFuIGFuIFxyXG4gICAgICAgICAgICAgICAgICogICBvY3RhdmUgYXBhcnQuICBDaG9vc2UgdGhlIGNsb3Nlc2V0IG5vdGUuXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIEZpbmRIaWdoTG93Tm90ZXMobm90ZXMsIG1lYXN1cmVsZW4sIHN0YXJ0aW5kZXgsIG5vdGUuU3RhcnRUaW1lLCBub3RlLkVuZFRpbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZiBoaWdoLCByZWYgbG93KTtcclxuICAgICAgICAgICAgICAgIEZpbmRFeGFjdEhpZ2hMb3dOb3Rlcyhub3Rlcywgc3RhcnRpbmRleCwgbm90ZS5TdGFydFRpbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmIGhpZ2hFeGFjdCwgcmVmIGxvd0V4YWN0KTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaGlnaEV4YWN0IC0gbnVtYmVyID4gMTIgfHwgbnVtYmVyIC0gbG93RXhhY3QgPiAxMilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGlnaEV4YWN0IC0gbnVtYmVyIDw9IG51bWJlciAtIGxvd0V4YWN0KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wLkFkZE5vdGUobm90ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdHRvbS5BZGROb3RlKG5vdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGhpZ2ggLSBudW1iZXIgPiAxMiB8fCBudW1iZXIgLSBsb3cgPiAxMilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGlnaCAtIG51bWJlciA8PSBudW1iZXIgLSBsb3cpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AuQWRkTm90ZShub3RlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm90dG9tLkFkZE5vdGUobm90ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaGlnaEV4YWN0IC0gbG93RXhhY3QgPiAxMilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGlnaEV4YWN0IC0gbnVtYmVyIDw9IG51bWJlciAtIGxvd0V4YWN0KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wLkFkZE5vdGUobm90ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdHRvbS5BZGROb3RlKG5vdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGhpZ2ggLSBsb3cgPiAxMilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGlnaCAtIG51bWJlciA8PSBudW1iZXIgLSBsb3cpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AuQWRkTm90ZShub3RlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm90dG9tLkFkZE5vdGUobm90ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmV2aGlnaCAtIG51bWJlciA8PSBudW1iZXIgLSBwcmV2bG93KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wLkFkZE5vdGUobm90ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdHRvbS5BZGROb3RlKG5vdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKiBUaGUgcHJldmhpZ2gvcHJldmxvdyBhcmUgc2V0IHRvIHRoZSBsYXN0IGhpZ2gvbG93XHJcbiAgICAgICAgICAgICAgICAgKiB0aGF0IGFyZSBtb3JlIHRoYW4gYW4gb2N0YXZlIGFwYXJ0LlxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBpZiAoaGlnaCAtIGxvdyA+IDEyKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHByZXZoaWdoID0gaGlnaDtcclxuICAgICAgICAgICAgICAgICAgICBwcmV2bG93ID0gbG93O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0b3AuTm90ZXMuU29ydCh0cmFjay5Ob3Rlc1swXSk7XHJcbiAgICAgICAgICAgIGJvdHRvbS5Ob3Rlcy5Tb3J0KHRyYWNrLk5vdGVzWzBdKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIENvbWJpbmUgdGhlIG5vdGVzIGluIHRoZSBnaXZlbiB0cmFja3MgaW50byBhIHNpbmdsZSBNaWRpVHJhY2suIFxuICAgICAgICAgKiAgVGhlIGluZGl2aWR1YWwgdHJhY2tzIGFyZSBhbHJlYWR5IHNvcnRlZC4gIFRvIG1lcmdlIHRoZW0sIHdlXG4gICAgICAgICAqICB1c2UgYSBtZXJnZXNvcnQtbGlrZSBhbGdvcml0aG0uXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgTWlkaVRyYWNrIENvbWJpbmVUb1NpbmdsZVRyYWNrKExpc3Q8TWlkaVRyYWNrPiB0cmFja3MpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvKiBBZGQgYWxsIG5vdGVzIGludG8gb25lIHRyYWNrICovXHJcbiAgICAgICAgICAgIE1pZGlUcmFjayByZXN1bHQgPSBuZXcgTWlkaVRyYWNrKDEpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRyYWNrcy5Db3VudCA9PSAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRyYWNrcy5Db3VudCA9PSAxKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBNaWRpVHJhY2sgdHJhY2sgPSB0cmFja3NbMF07XHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrLk5vdGVzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5BZGROb3RlKG5vdGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaW50W10gbm90ZWluZGV4ID0gbmV3IGludFs2NF07XHJcbiAgICAgICAgICAgIGludFtdIG5vdGVjb3VudCA9IG5ldyBpbnRbNjRdO1xyXG5cclxuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IHRyYWNrcy5Db3VudDsgdHJhY2tudW0rKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbm90ZWluZGV4W3RyYWNrbnVtXSA9IDA7XHJcbiAgICAgICAgICAgICAgICBub3RlY291bnRbdHJhY2tudW1dID0gdHJhY2tzW3RyYWNrbnVtXS5Ob3Rlcy5Db3VudDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBNaWRpTm90ZSBwcmV2bm90ZSA9IG51bGw7XHJcbiAgICAgICAgICAgIHdoaWxlICh0cnVlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBNaWRpTm90ZSBsb3dlc3Rub3RlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGludCBsb3dlc3RUcmFjayA9IC0xO1xyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IHRyYWNrcy5Db3VudDsgdHJhY2tudW0rKylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBNaWRpVHJhY2sgdHJhY2sgPSB0cmFja3NbdHJhY2tudW1dO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChub3RlaW5kZXhbdHJhY2tudW1dID49IG5vdGVjb3VudFt0cmFja251bV0pXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgTWlkaU5vdGUgbm90ZSA9IHRyYWNrLk5vdGVzW25vdGVpbmRleFt0cmFja251bV1dO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsb3dlc3Rub3RlID09IG51bGwpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb3dlc3Rub3RlID0gbm90ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG93ZXN0VHJhY2sgPSB0cmFja251bTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobm90ZS5TdGFydFRpbWUgPCBsb3dlc3Rub3RlLlN0YXJ0VGltZSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvd2VzdG5vdGUgPSBub3RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb3dlc3RUcmFjayA9IHRyYWNrbnVtO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChub3RlLlN0YXJ0VGltZSA9PSBsb3dlc3Rub3RlLlN0YXJ0VGltZSAmJiBub3RlLk51bWJlciA8IGxvd2VzdG5vdGUuTnVtYmVyKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG93ZXN0bm90ZSA9IG5vdGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvd2VzdFRyYWNrID0gdHJhY2tudW07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGxvd2VzdG5vdGUgPT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBXZSd2ZSBmaW5pc2hlZCB0aGUgbWVyZ2UgKi9cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG5vdGVpbmRleFtsb3dlc3RUcmFja10rKztcclxuICAgICAgICAgICAgICAgIGlmICgocHJldm5vdGUgIT0gbnVsbCkgJiYgKHByZXZub3RlLlN0YXJ0VGltZSA9PSBsb3dlc3Rub3RlLlN0YXJ0VGltZSkgJiZcclxuICAgICAgICAgICAgICAgICAgICAocHJldm5vdGUuTnVtYmVyID09IGxvd2VzdG5vdGUuTnVtYmVyKSlcclxuICAgICAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLyogRG9uJ3QgYWRkIGR1cGxpY2F0ZSBub3Rlcywgd2l0aCB0aGUgc2FtZSBzdGFydCB0aW1lIGFuZCBudW1iZXIgKi9cclxuICAgICAgICAgICAgICAgICAgICBpZiAobG93ZXN0bm90ZS5EdXJhdGlvbiA+IHByZXZub3RlLkR1cmF0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldm5vdGUuRHVyYXRpb24gPSBsb3dlc3Rub3RlLkR1cmF0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQuQWRkTm90ZShsb3dlc3Rub3RlKTtcclxuICAgICAgICAgICAgICAgICAgICBwcmV2bm90ZSA9IGxvd2VzdG5vdGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIENvbWJpbmUgdGhlIG5vdGVzIGluIGFsbCB0aGUgdHJhY2tzIGdpdmVuIGludG8gdHdvIE1pZGlUcmFja3MsXG4gICAgICAgICAqIGFuZCByZXR1cm4gdGhlbS5cbiAgICAgICAgICogXG4gICAgICAgICAqIFRoaXMgZnVuY3Rpb24gaXMgaW50ZW5kZWQgZm9yIHBpYW5vIHNvbmdzLCB3aGVuIHdlIHdhbnQgdG8gZGlzcGxheVxuICAgICAgICAgKiBhIGxlZnQtaGFuZCB0cmFjayBhbmQgYSByaWdodC1oYW5kIHRyYWNrLiAgVGhlIGxvd2VyIG5vdGVzIGdvIGludG8gXG4gICAgICAgICAqIHRoZSBsZWZ0LWhhbmQgdHJhY2ssIGFuZCB0aGUgaGlnaGVyIG5vdGVzIGdvIGludG8gdGhlIHJpZ2h0IGhhbmQgXG4gICAgICAgICAqIHRyYWNrLlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIExpc3Q8TWlkaVRyYWNrPiBDb21iaW5lVG9Ud29UcmFja3MoTGlzdDxNaWRpVHJhY2s+IHRyYWNrcywgaW50IG1lYXN1cmVsZW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBNaWRpVHJhY2sgc2luZ2xlID0gQ29tYmluZVRvU2luZ2xlVHJhY2sodHJhY2tzKTtcclxuICAgICAgICAgICAgTGlzdDxNaWRpVHJhY2s+IHJlc3VsdCA9IFNwbGl0VHJhY2soc2luZ2xlLCBtZWFzdXJlbGVuKTtcclxuXHJcbiAgICAgICAgICAgIExpc3Q8TWlkaUV2ZW50PiBseXJpY3MgPSBuZXcgTGlzdDxNaWRpRXZlbnQ+KCk7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0cmFjay5MeXJpY3MgIT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBseXJpY3MuQWRkUmFuZ2UodHJhY2suTHlyaWNzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobHlyaWNzLkNvdW50ID4gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbHlyaWNzLlNvcnQobHlyaWNzWzBdKTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFswXS5MeXJpY3MgPSBseXJpY3M7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIENoZWNrIHRoYXQgdGhlIE1pZGlOb3RlIHN0YXJ0IHRpbWVzIGFyZSBpbiBpbmNyZWFzaW5nIG9yZGVyLlxuICAgICAgICAgKiBUaGlzIGlzIGZvciBkZWJ1Z2dpbmcgcHVycG9zZXMuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgQ2hlY2tTdGFydFRpbWVzKExpc3Q8TWlkaVRyYWNrPiB0cmFja3MpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgcHJldnRpbWUgPSAtMTtcclxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG5vdGUgaW4gdHJhY2suTm90ZXMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vdGUuU3RhcnRUaW1lIDwgcHJldnRpbWUpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgU3lzdGVtLkFyZ3VtZW50RXhjZXB0aW9uKFwic3RhcnQgdGltZXMgbm90IGluIGluY3JlYXNpbmcgb3JkZXJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHByZXZ0aW1lID0gbm90ZS5TdGFydFRpbWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogSW4gTWlkaSBGaWxlcywgdGltZSBpcyBtZWFzdXJlZCBpbiBwdWxzZXMuICBOb3RlcyB0aGF0IGhhdmVcbiAgICAgICAgICogcHVsc2UgdGltZXMgdGhhdCBhcmUgY2xvc2UgdG9nZXRoZXIgKGxpa2Ugd2l0aGluIDEwIHB1bHNlcylcbiAgICAgICAgICogd2lsbCBzb3VuZCBsaWtlIHRoZXkncmUgdGhlIHNhbWUgY2hvcmQuICBXZSB3YW50IHRvIGRyYXdcbiAgICAgICAgICogdGhlc2Ugbm90ZXMgYXMgYSBzaW5nbGUgY2hvcmQsIGl0IG1ha2VzIHRoZSBzaGVldCBtdXNpYyBtdWNoXG4gICAgICAgICAqIGVhc2llciB0byByZWFkLiAgV2UgZG9uJ3Qgd2FudCB0byBkcmF3IG5vdGVzIHRoYXQgYXJlIGNsb3NlXG4gICAgICAgICAqIHRvZ2V0aGVyIGFzIHR3byBzZXBhcmF0ZSBjaG9yZHMuXG4gICAgICAgICAqXG4gICAgICAgICAqIFRoZSBTeW1ib2xTcGFjaW5nIGNsYXNzIG9ubHkgYWxpZ25zIG5vdGVzIHRoYXQgaGF2ZSBleGFjdGx5IHRoZSBzYW1lXG4gICAgICAgICAqIHN0YXJ0IHRpbWVzLiAgTm90ZXMgd2l0aCBzbGlnaHRseSBkaWZmZXJlbnQgc3RhcnQgdGltZXMgd2lsbFxuICAgICAgICAgKiBhcHBlYXIgaW4gc2VwYXJhdGUgdmVydGljYWwgY29sdW1ucy4gIFRoaXMgaXNuJ3Qgd2hhdCB3ZSB3YW50LlxuICAgICAgICAgKiBXZSB3YW50IHRvIGFsaWduIG5vdGVzIHdpdGggYXBwcm94aW1hdGVseSB0aGUgc2FtZSBzdGFydCB0aW1lcy5cbiAgICAgICAgICogU28sIHRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBhc3NpZ24gdGhlIHNhbWUgc3RhcnR0aW1lIGZvciBub3Rlc1xuICAgICAgICAgKiB0aGF0IGFyZSBjbG9zZSB0b2dldGhlciAodGltZXdpc2UpLlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHZvaWRcclxuICAgICAgICBSb3VuZFN0YXJ0VGltZXMoTGlzdDxNaWRpVHJhY2s+IHRyYWNrcywgaW50IG1pbGxpc2VjLCBUaW1lU2lnbmF0dXJlIHRpbWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvKiBHZXQgYWxsIHRoZSBzdGFydHRpbWVzIGluIGFsbCB0cmFja3MsIGluIHNvcnRlZCBvcmRlciAqL1xyXG4gICAgICAgICAgICBMaXN0PGludD4gc3RhcnR0aW1lcyA9IG5ldyBMaXN0PGludD4oKTtcclxuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiB0cmFjay5Ob3RlcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydHRpbWVzLkFkZChub3RlLlN0YXJ0VGltZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3RhcnR0aW1lcy5Tb3J0KCk7XHJcblxyXG4gICAgICAgICAgICAvKiBOb3RlcyB3aXRoaW4gXCJtaWxsaXNlY1wiIG1pbGxpc2Vjb25kcyBhcGFydCB3aWxsIGJlIGNvbWJpbmVkLiAqL1xyXG4gICAgICAgICAgICBpbnQgaW50ZXJ2YWwgPSB0aW1lLlF1YXJ0ZXIgKiBtaWxsaXNlYyAqIDEwMDAgLyB0aW1lLlRlbXBvO1xyXG5cclxuICAgICAgICAgICAgLyogSWYgdHdvIHN0YXJ0dGltZXMgYXJlIHdpdGhpbiBpbnRlcnZhbCBtaWxsaXNlYywgbWFrZSB0aGVtIHRoZSBzYW1lICovXHJcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgc3RhcnR0aW1lcy5Db3VudCAtIDE7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXJ0dGltZXNbaSArIDFdIC0gc3RhcnR0aW1lc1tpXSA8PSBpbnRlcnZhbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydHRpbWVzW2kgKyAxXSA9IHN0YXJ0dGltZXNbaV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIENoZWNrU3RhcnRUaW1lcyh0cmFja3MpO1xyXG5cclxuICAgICAgICAgICAgLyogQWRqdXN0IHRoZSBub3RlIHN0YXJ0dGltZXMsIHNvIHRoYXQgaXQgbWF0Y2hlcyBvbmUgb2YgdGhlIHN0YXJ0dGltZXMgdmFsdWVzICovXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGludCBpID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrLk5vdGVzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgc3RhcnR0aW1lcy5Db3VudCAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlLlN0YXJ0VGltZSAtIGludGVydmFsID4gc3RhcnR0aW1lc1tpXSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChub3RlLlN0YXJ0VGltZSA+IHN0YXJ0dGltZXNbaV0gJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm90ZS5TdGFydFRpbWUgLSBzdGFydHRpbWVzW2ldIDw9IGludGVydmFsKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdGUuU3RhcnRUaW1lID0gc3RhcnR0aW1lc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0cmFjay5Ob3Rlcy5Tb3J0KHRyYWNrLk5vdGVzWzBdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBXZSB3YW50IG5vdGUgZHVyYXRpb25zIHRvIHNwYW4gdXAgdG8gdGhlIG5leHQgbm90ZSBpbiBnZW5lcmFsLlxuICAgICAgICAgKiBUaGUgc2hlZXQgbXVzaWMgbG9va3MgbmljZXIgdGhhdCB3YXkuICBJbiBjb250cmFzdCwgc2hlZXQgbXVzaWNcbiAgICAgICAgICogd2l0aCBsb3RzIG9mIDE2dGgvMzJuZCBub3RlcyBzZXBhcmF0ZWQgYnkgc21hbGwgcmVzdHMgZG9lc24ndFxuICAgICAgICAgKiBsb29rIGFzIG5pY2UuICBIYXZpbmcgbmljZSBsb29raW5nIHNoZWV0IG11c2ljIGlzIG1vcmUgaW1wb3J0YW50XG4gICAgICAgICAqIHRoYW4gZmFpdGhmdWxseSByZXByZXNlbnRpbmcgdGhlIE1pZGkgRmlsZSBkYXRhLlxuICAgICAgICAgKlxuICAgICAgICAgKiBUaGVyZWZvcmUsIHRoaXMgZnVuY3Rpb24gcm91bmRzIHRoZSBkdXJhdGlvbiBvZiBNaWRpTm90ZXMgdXAgdG9cbiAgICAgICAgICogdGhlIG5leHQgbm90ZSB3aGVyZSBwb3NzaWJsZS5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB2b2lkXHJcbiAgICAgICAgUm91bmREdXJhdGlvbnMoTGlzdDxNaWRpVHJhY2s+IHRyYWNrcywgaW50IHF1YXJ0ZXJub3RlKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIE1pZGlOb3RlIHByZXZOb3RlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgdHJhY2suTm90ZXMuQ291bnQgLSAxOyBpKyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgTWlkaU5vdGUgbm90ZTEgPSB0cmFjay5Ob3Rlc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJldk5vdGUgPT0gbnVsbClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZOb3RlID0gbm90ZTE7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvKiBHZXQgdGhlIG5leHQgbm90ZSB0aGF0IGhhcyBhIGRpZmZlcmVudCBzdGFydCB0aW1lICovXHJcbiAgICAgICAgICAgICAgICAgICAgTWlkaU5vdGUgbm90ZTIgPSBub3RlMTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGludCBqID0gaSArIDE7IGogPCB0cmFjay5Ob3Rlcy5Db3VudDsgaisrKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm90ZTIgPSB0cmFjay5Ob3Rlc1tqXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vdGUxLlN0YXJ0VGltZSA8IG5vdGUyLlN0YXJ0VGltZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IG1heGR1cmF0aW9uID0gbm90ZTIuU3RhcnRUaW1lIC0gbm90ZTEuU3RhcnRUaW1lO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpbnQgZHVyID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocXVhcnRlcm5vdGUgPD0gbWF4ZHVyYXRpb24pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1ciA9IHF1YXJ0ZXJub3RlO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHF1YXJ0ZXJub3RlIC8gMiA8PSBtYXhkdXJhdGlvbilcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHVyID0gcXVhcnRlcm5vdGUgLyAyO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHF1YXJ0ZXJub3RlIC8gMyA8PSBtYXhkdXJhdGlvbilcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHVyID0gcXVhcnRlcm5vdGUgLyAzO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHF1YXJ0ZXJub3RlIC8gNCA8PSBtYXhkdXJhdGlvbilcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHVyID0gcXVhcnRlcm5vdGUgLyA0O1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGR1ciA8IG5vdGUxLkR1cmF0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHVyID0gbm90ZTEuRHVyYXRpb247XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvKiBTcGVjaWFsIGNhc2U6IElmIHRoZSBwcmV2aW91cyBub3RlJ3MgZHVyYXRpb25cclxuICAgICAgICAgICAgICAgICAgICAgKiBtYXRjaGVzIHRoaXMgbm90ZSdzIGR1cmF0aW9uLCB3ZSBjYW4gbWFrZSBhIG5vdGVwYWlyLlxyXG4gICAgICAgICAgICAgICAgICAgICAqIFNvIGRvbid0IGV4cGFuZCB0aGUgZHVyYXRpb24gaW4gdGhhdCBjYXNlLlxyXG4gICAgICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgocHJldk5vdGUuU3RhcnRUaW1lICsgcHJldk5vdGUuRHVyYXRpb24gPT0gbm90ZTEuU3RhcnRUaW1lKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAocHJldk5vdGUuRHVyYXRpb24gPT0gbm90ZTEuRHVyYXRpb24pKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1ciA9IG5vdGUxLkR1cmF0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBub3RlMS5EdXJhdGlvbiA9IGR1cjtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJhY2suTm90ZXNbaSArIDFdLlN0YXJ0VGltZSAhPSBub3RlMS5TdGFydFRpbWUpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2Tm90ZSA9IG5vdGUxO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFNwbGl0IHRoZSBnaXZlbiB0cmFjayBpbnRvIG11bHRpcGxlIHRyYWNrcywgc2VwYXJhdGluZyBlYWNoXG4gICAgICAgICAqIGNoYW5uZWwgaW50byBhIHNlcGFyYXRlIHRyYWNrLlxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBMaXN0PE1pZGlUcmFjaz5cclxuICAgICAgICBTcGxpdENoYW5uZWxzKE1pZGlUcmFjayBvcmlndHJhY2ssIExpc3Q8TWlkaUV2ZW50PiBldmVudHMpXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgLyogRmluZCB0aGUgaW5zdHJ1bWVudCB1c2VkIGZvciBlYWNoIGNoYW5uZWwgKi9cclxuICAgICAgICAgICAgaW50W10gY2hhbm5lbEluc3RydW1lbnRzID0gbmV3IGludFsxNl07XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBtZXZlbnQgaW4gZXZlbnRzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudFByb2dyYW1DaGFuZ2UpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hhbm5lbEluc3RydW1lbnRzW21ldmVudC5DaGFubmVsXSA9IG1ldmVudC5JbnN0cnVtZW50O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNoYW5uZWxJbnN0cnVtZW50c1s5XSA9IDEyODsgLyogQ2hhbm5lbCA5ID0gUGVyY3Vzc2lvbiAqL1xyXG5cclxuICAgICAgICAgICAgTGlzdDxNaWRpVHJhY2s+IHJlc3VsdCA9IG5ldyBMaXN0PE1pZGlUcmFjaz4oKTtcclxuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiBvcmlndHJhY2suTm90ZXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGJvb2wgZm91bmRjaGFubmVsID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gcmVzdWx0KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChub3RlLkNoYW5uZWwgPT0gdHJhY2suTm90ZXNbMF0uQ2hhbm5lbClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kY2hhbm5lbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYWNrLkFkZE5vdGUobm90ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCFmb3VuZGNoYW5uZWwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgTWlkaVRyYWNrIHRyYWNrID0gbmV3IE1pZGlUcmFjayhyZXN1bHQuQ291bnQgKyAxKTtcclxuICAgICAgICAgICAgICAgICAgICB0cmFjay5BZGROb3RlKG5vdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRyYWNrLkluc3RydW1lbnQgPSBjaGFubmVsSW5zdHJ1bWVudHNbbm90ZS5DaGFubmVsXTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQuQWRkKHRyYWNrKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAob3JpZ3RyYWNrLkx5cmljcyAhPSBudWxsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbHlyaWNFdmVudCBpbiBvcmlndHJhY2suTHlyaWNzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiByZXN1bHQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobHlyaWNFdmVudC5DaGFubmVsID09IHRyYWNrLk5vdGVzWzBdLkNoYW5uZWwpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYWNrLkFkZEx5cmljKGx5cmljRXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIEd1ZXNzIHRoZSBtZWFzdXJlIGxlbmd0aC4gIFdlIGFzc3VtZSB0aGF0IHRoZSBtZWFzdXJlXG4gICAgICAgICAqIGxlbmd0aCBtdXN0IGJlIGJldHdlZW4gMC41IHNlY29uZHMgYW5kIDQgc2Vjb25kcy5cbiAgICAgICAgICogVGFrZSBhbGwgdGhlIG5vdGUgc3RhcnQgdGltZXMgdGhhdCBmYWxsIGJldHdlZW4gMC41IGFuZCBcbiAgICAgICAgICogNCBzZWNvbmRzLCBhbmQgcmV0dXJuIHRoZSBzdGFydHRpbWVzLlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgTGlzdDxpbnQ+XHJcbiAgICAgICAgR3Vlc3NNZWFzdXJlTGVuZ3RoKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIExpc3Q8aW50PiByZXN1bHQgPSBuZXcgTGlzdDxpbnQ+KCk7XHJcblxyXG4gICAgICAgICAgICBpbnQgcHVsc2VzX3Blcl9zZWNvbmQgPSAoaW50KSgxMDAwMDAwLjAgLyB0aW1lc2lnLlRlbXBvICogdGltZXNpZy5RdWFydGVyKTtcclxuICAgICAgICAgICAgaW50IG1pbm1lYXN1cmUgPSBwdWxzZXNfcGVyX3NlY29uZCAvIDI7ICAvKiBUaGUgbWluaW11bSBtZWFzdXJlIGxlbmd0aCBpbiBwdWxzZXMgKi9cclxuICAgICAgICAgICAgaW50IG1heG1lYXN1cmUgPSBwdWxzZXNfcGVyX3NlY29uZCAqIDQ7ICAvKiBUaGUgbWF4aW11bSBtZWFzdXJlIGxlbmd0aCBpbiBwdWxzZXMgKi9cclxuXHJcbiAgICAgICAgICAgIC8qIEdldCB0aGUgc3RhcnQgdGltZSBvZiB0aGUgZmlyc3Qgbm90ZSBpbiB0aGUgbWlkaSBmaWxlLiAqL1xyXG4gICAgICAgICAgICBpbnQgZmlyc3Rub3RlID0gdGltZXNpZy5NZWFzdXJlICogNTtcclxuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGZpcnN0bm90ZSA+IHRyYWNrLk5vdGVzWzBdLlN0YXJ0VGltZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBmaXJzdG5vdGUgPSB0cmFjay5Ob3Rlc1swXS5TdGFydFRpbWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIGludGVydmFsID0gMC4wNiBzZWNvbmRzLCBjb252ZXJ0ZWQgaW50byBwdWxzZXMgKi9cclxuICAgICAgICAgICAgaW50IGludGVydmFsID0gdGltZXNpZy5RdWFydGVyICogNjAwMDAgLyB0aW1lc2lnLlRlbXBvO1xyXG5cclxuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IHByZXZ0aW1lID0gMDtcclxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG5vdGUgaW4gdHJhY2suTm90ZXMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vdGUuU3RhcnRUaW1lIC0gcHJldnRpbWUgPD0gaW50ZXJ2YWwpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBwcmV2dGltZSA9IG5vdGUuU3RhcnRUaW1lO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpbnQgdGltZV9mcm9tX2ZpcnN0bm90ZSA9IG5vdGUuU3RhcnRUaW1lIC0gZmlyc3Rub3RlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvKiBSb3VuZCB0aGUgdGltZSBkb3duIHRvIGEgbXVsdGlwbGUgb2YgNCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIHRpbWVfZnJvbV9maXJzdG5vdGUgPSB0aW1lX2Zyb21fZmlyc3Rub3RlIC8gNCAqIDQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWVfZnJvbV9maXJzdG5vdGUgPCBtaW5tZWFzdXJlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGltZV9mcm9tX2ZpcnN0bm90ZSA+IG1heG1lYXN1cmUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdC5Db250YWlucyh0aW1lX2Zyb21fZmlyc3Rub3RlKSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5BZGQodGltZV9mcm9tX2ZpcnN0bm90ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc3VsdC5Tb3J0KCk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogUmV0dXJuIHRoZSBsYXN0IHN0YXJ0IHRpbWUgKi9cclxuICAgICAgICBwdWJsaWMgaW50IEVuZFRpbWUoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW50IGxhc3RTdGFydCA9IDA7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0cmFjay5Ob3Rlcy5Db3VudCA9PSAwKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaW50IGxhc3QgPSB0cmFjay5Ob3Rlc1t0cmFjay5Ob3Rlcy5Db3VudCAtIDFdLlN0YXJ0VGltZTtcclxuICAgICAgICAgICAgICAgIGxhc3RTdGFydCA9IE1hdGguTWF4KGxhc3QsIGxhc3RTdGFydCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGxhc3RTdGFydDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGlzIG1pZGkgZmlsZSBoYXMgbHlyaWNzICovXHJcbiAgICAgICAgcHVibGljIGJvb2wgSGFzTHlyaWNzKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0cmFjay5MeXJpY3MgIT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgc3RyaW5nIFRvU3RyaW5nKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0cmluZyByZXN1bHQgPSBcIk1pZGkgRmlsZSB0cmFja3M9XCIgKyB0cmFja3MuQ291bnQgKyBcIiBxdWFydGVyPVwiICsgcXVhcnRlcm5vdGUgKyBcIlxcblwiO1xyXG4gICAgICAgICAgICByZXN1bHQgKz0gVGltZS5Ub1N0cmluZygpICsgXCJcXG5cIjtcclxuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHRyYWNrLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSAgLyogRW5kIGNsYXNzIE1pZGlGaWxlICovXG5cbn0gIC8qIEVuZCBuYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMgKi9cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDEyIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbi8qKiBAY2xhc3MgTWlkaUZpbGVFeGNlcHRpb25cbiAqIEEgTWlkaUZpbGVFeGNlcHRpb24gaXMgdGhyb3duIHdoZW4gYW4gZXJyb3Igb2NjdXJzXG4gKiB3aGlsZSBwYXJzaW5nIHRoZSBNaWRpIEZpbGUuICBUaGUgY29uc3RydWN0b3IgdGFrZXNcbiAqIHRoZSBmaWxlIG9mZnNldCAoaW4gYnl0ZXMpIHdoZXJlIHRoZSBlcnJvciBvY2N1cnJlZCxcbiAqIGFuZCBhIHN0cmluZyBkZXNjcmliaW5nIHRoZSBlcnJvci5cbiAqL1xucHVibGljIGNsYXNzIE1pZGlGaWxlRXhjZXB0aW9uIDogU3lzdGVtLkV4Y2VwdGlvbiB7XG4gICAgcHVibGljIE1pZGlGaWxlRXhjZXB0aW9uIChzdHJpbmcgcywgaW50IG9mZnNldCkgOlxuICAgICAgICBiYXNlKHMgKyBcIiBhdCBvZmZzZXQgXCIgKyBvZmZzZXQpIHtcbiAgICB9XG59XG5cbn1cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDEyIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cblxuLyoqIEBjbGFzcyBNaWRpRmlsZVJlYWRlclxuICogVGhlIE1pZGlGaWxlUmVhZGVyIGlzIHVzZWQgdG8gcmVhZCBsb3ctbGV2ZWwgYmluYXJ5IGRhdGEgZnJvbSBhIGZpbGUuXG4gKiBUaGlzIGNsYXNzIGNhbiBkbyB0aGUgZm9sbG93aW5nOlxuICpcbiAqIC0gUGVlayBhdCB0aGUgbmV4dCBieXRlIGluIHRoZSBmaWxlLlxuICogLSBSZWFkIGEgYnl0ZVxuICogLSBSZWFkIGEgMTYtYml0IGJpZyBlbmRpYW4gc2hvcnRcbiAqIC0gUmVhZCBhIDMyLWJpdCBiaWcgZW5kaWFuIGludFxuICogLSBSZWFkIGEgZml4ZWQgbGVuZ3RoIGFzY2lpIHN0cmluZyAobm90IG51bGwgdGVybWluYXRlZClcbiAqIC0gUmVhZCBhIFwidmFyaWFibGUgbGVuZ3RoXCIgaW50ZWdlci4gIFRoZSBmb3JtYXQgb2YgdGhlIHZhcmlhYmxlIGxlbmd0aFxuICogICBpbnQgaXMgZGVzY3JpYmVkIGF0IHRoZSB0b3Agb2YgdGhpcyBmaWxlLlxuICogLSBTa2lwIGFoZWFkIGEgZ2l2ZW4gbnVtYmVyIG9mIGJ5dGVzXG4gKiAtIFJldHVybiB0aGUgY3VycmVudCBvZmZzZXQuXG4gKi9cblxucHVibGljIGNsYXNzIE1pZGlGaWxlUmVhZGVyIHtcbiAgICBwcml2YXRlIGJ5dGVbXSBkYXRhOyAgICAgICAvKiogVGhlIGVudGlyZSBtaWRpIGZpbGUgZGF0YSAqL1xuICAgIHByaXZhdGUgaW50IHBhcnNlX29mZnNldDsgIC8qKiBUaGUgY3VycmVudCBvZmZzZXQgd2hpbGUgcGFyc2luZyAqL1xuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBNaWRpRmlsZVJlYWRlciBmb3IgdGhlIGdpdmVuIGZpbGVuYW1lICovXG4gICAgLy9wdWJsaWMgTWlkaUZpbGVSZWFkZXIoc3RyaW5nIGZpbGVuYW1lKSB7XG4gICAgLy8gICAgRmlsZUluZm8gaW5mbyA9IG5ldyBGaWxlSW5mbyhmaWxlbmFtZSk7XG4gICAgLy8gICAgaWYgKCFpbmZvLkV4aXN0cykge1xuICAgIC8vICAgICAgICB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXCJGaWxlIFwiICsgZmlsZW5hbWUgKyBcIiBkb2VzIG5vdCBleGlzdFwiLCAwKTtcbiAgICAvLyAgICB9XG4gICAgLy8gICAgaWYgKGluZm8uTGVuZ3RoID09IDApIHtcbiAgICAvLyAgICAgICAgdGhyb3cgbmV3IE1pZGlGaWxlRXhjZXB0aW9uKFwiRmlsZSBcIiArIGZpbGVuYW1lICsgXCIgaXMgZW1wdHkgKDAgYnl0ZXMpXCIsIDApO1xuICAgIC8vICAgIH1cbiAgICAvLyAgICBGaWxlU3RyZWFtIGZpbGUgPSBGaWxlLk9wZW4oZmlsZW5hbWUsIEZpbGVNb2RlLk9wZW4sIFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBGaWxlQWNjZXNzLlJlYWQsIEZpbGVTaGFyZS5SZWFkKTtcblxuICAgIC8vICAgIC8qIFJlYWQgdGhlIGVudGlyZSBmaWxlIGludG8gbWVtb3J5ICovXG4gICAgLy8gICAgZGF0YSA9IG5ldyBieXRlWyBpbmZvLkxlbmd0aCBdO1xuICAgIC8vICAgIGludCBvZmZzZXQgPSAwO1xuICAgIC8vICAgIGludCBsZW4gPSAoaW50KWluZm8uTGVuZ3RoO1xuICAgIC8vICAgIHdoaWxlICh0cnVlKSB7XG4gICAgLy8gICAgICAgIGlmIChvZmZzZXQgPT0gaW5mby5MZW5ndGgpXG4gICAgLy8gICAgICAgICAgICBicmVhaztcbiAgICAvLyAgICAgICAgaW50IG4gPSBmaWxlLlJlYWQoZGF0YSwgb2Zmc2V0LCAoaW50KShpbmZvLkxlbmd0aCAtIG9mZnNldCkpO1xuICAgIC8vICAgICAgICBpZiAobiA8PSAwKVxuICAgIC8vICAgICAgICAgICAgYnJlYWs7XG4gICAgLy8gICAgICAgIG9mZnNldCArPSBuO1xuICAgIC8vICAgIH1cbiAgICAvLyAgICBwYXJzZV9vZmZzZXQgPSAwO1xuICAgIC8vICAgIGZpbGUuQ2xvc2UoKTtcbiAgICAvL31cblxuICAgIC8qKiBDcmVhdGUgYSBuZXcgTWlkaUZpbGVSZWFkZXIgZnJvbSB0aGUgZ2l2ZW4gZGF0YSAqL1xuICAgIHB1YmxpYyBNaWRpRmlsZVJlYWRlcihieXRlW10gYnl0ZXMpIHtcbiAgICAgICAgZGF0YSA9IGJ5dGVzO1xuICAgICAgICBwYXJzZV9vZmZzZXQgPSAwO1xuICAgIH1cblxuICAgIC8qKiBDaGVjayB0aGF0IHRoZSBnaXZlbiBudW1iZXIgb2YgYnl0ZXMgZG9lc24ndCBleGNlZWQgdGhlIGZpbGUgc2l6ZSAqL1xuICAgIHByaXZhdGUgdm9pZCBjaGVja1JlYWQoaW50IGFtb3VudCkge1xuICAgICAgICBpZiAocGFyc2Vfb2Zmc2V0ICsgYW1vdW50ID4gZGF0YS5MZW5ndGgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBNaWRpRmlsZUV4Y2VwdGlvbihcIkZpbGUgaXMgdHJ1bmNhdGVkXCIsIHBhcnNlX29mZnNldCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogUmVhZCB0aGUgbmV4dCBieXRlIGluIHRoZSBmaWxlLCBidXQgZG9uJ3QgaW5jcmVtZW50IHRoZSBwYXJzZSBvZmZzZXQgKi9cbiAgICBwdWJsaWMgYnl0ZSBQZWVrKCkge1xuICAgICAgICBjaGVja1JlYWQoMSk7XG4gICAgICAgIHJldHVybiBkYXRhW3BhcnNlX29mZnNldF07XG4gICAgfVxuXG4gICAgLyoqIFJlYWQgYSBieXRlIGZyb20gdGhlIGZpbGUgKi9cbiAgICBwdWJsaWMgYnl0ZSBSZWFkQnl0ZSgpIHsgXG4gICAgICAgIGNoZWNrUmVhZCgxKTtcbiAgICAgICAgYnl0ZSB4ID0gZGF0YVtwYXJzZV9vZmZzZXRdO1xuICAgICAgICBwYXJzZV9vZmZzZXQrKztcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuXG4gICAgLyoqIFJlYWQgdGhlIGdpdmVuIG51bWJlciBvZiBieXRlcyBmcm9tIHRoZSBmaWxlICovXG4gICAgcHVibGljIGJ5dGVbXSBSZWFkQnl0ZXMoaW50IGFtb3VudCkge1xuICAgICAgICBjaGVja1JlYWQoYW1vdW50KTtcbiAgICAgICAgYnl0ZVtdIHJlc3VsdCA9IG5ldyBieXRlW2Ftb3VudF07XG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgYW1vdW50OyBpKyspIHtcbiAgICAgICAgICAgIHJlc3VsdFtpXSA9IGRhdGFbaSArIHBhcnNlX29mZnNldF07XG4gICAgICAgIH1cbiAgICAgICAgcGFyc2Vfb2Zmc2V0ICs9IGFtb3VudDtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKiogUmVhZCBhIDE2LWJpdCBzaG9ydCBmcm9tIHRoZSBmaWxlICovXG4gICAgcHVibGljIHVzaG9ydCBSZWFkU2hvcnQoKSB7XG4gICAgICAgIGNoZWNrUmVhZCgyKTtcbiAgICAgICAgdXNob3J0IHggPSAodXNob3J0KSAoIChkYXRhW3BhcnNlX29mZnNldF0gPDwgOCkgfCBkYXRhW3BhcnNlX29mZnNldCsxXSApO1xuICAgICAgICBwYXJzZV9vZmZzZXQgKz0gMjtcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuXG4gICAgLyoqIFJlYWQgYSAzMi1iaXQgaW50IGZyb20gdGhlIGZpbGUgKi9cbiAgICBwdWJsaWMgaW50IFJlYWRJbnQoKSB7XG4gICAgICAgIGNoZWNrUmVhZCg0KTtcbiAgICAgICAgaW50IHggPSAoaW50KSggKGRhdGFbcGFyc2Vfb2Zmc2V0XSA8PCAyNCkgfCAoZGF0YVtwYXJzZV9vZmZzZXQrMV0gPDwgMTYpIHxcbiAgICAgICAgICAgICAgICAgICAgICAgKGRhdGFbcGFyc2Vfb2Zmc2V0KzJdIDw8IDgpIHwgZGF0YVtwYXJzZV9vZmZzZXQrM10gKTtcbiAgICAgICAgcGFyc2Vfb2Zmc2V0ICs9IDQ7XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cblxuICAgIC8qKiBSZWFkIGFuIGFzY2lpIHN0cmluZyB3aXRoIHRoZSBnaXZlbiBsZW5ndGggKi9cbiAgICBwdWJsaWMgc3RyaW5nIFJlYWRBc2NpaShpbnQgbGVuKSB7XG4gICAgICAgIGNoZWNrUmVhZChsZW4pO1xuICAgICAgICBzdHJpbmcgcyA9IEFTQ0lJRW5jb2RpbmcuQVNDSUkuR2V0U3RyaW5nKGRhdGEsIHBhcnNlX29mZnNldCwgbGVuKTtcbiAgICAgICAgcGFyc2Vfb2Zmc2V0ICs9IGxlbjtcbiAgICAgICAgcmV0dXJuIHM7XG4gICAgfVxuXG4gICAgLyoqIFJlYWQgYSB2YXJpYWJsZS1sZW5ndGggaW50ZWdlciAoMSB0byA0IGJ5dGVzKS4gVGhlIGludGVnZXIgZW5kc1xuICAgICAqIHdoZW4geW91IGVuY291bnRlciBhIGJ5dGUgdGhhdCBkb2Vzbid0IGhhdmUgdGhlIDh0aCBiaXQgc2V0XG4gICAgICogKGEgYnl0ZSBsZXNzIHRoYW4gMHg4MCkuXG4gICAgICovXG4gICAgcHVibGljIGludCBSZWFkVmFybGVuKCkge1xuICAgICAgICB1aW50IHJlc3VsdCA9IDA7XG4gICAgICAgIGJ5dGUgYjtcblxuICAgICAgICBiID0gUmVhZEJ5dGUoKTtcbiAgICAgICAgcmVzdWx0ID0gKHVpbnQpKGIgJiAweDdmKTtcblxuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgICAgICAgaWYgKChiICYgMHg4MCkgIT0gMCkge1xuICAgICAgICAgICAgICAgIGIgPSBSZWFkQnl0ZSgpO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9ICh1aW50KSggKHJlc3VsdCA8PCA3KSArIChiICYgMHg3ZikgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoaW50KXJlc3VsdDtcbiAgICB9XG5cbiAgICAvKiogU2tpcCBvdmVyIHRoZSBnaXZlbiBudW1iZXIgb2YgYnl0ZXMgKi8gXG4gICAgcHVibGljIHZvaWQgU2tpcChpbnQgYW1vdW50KSB7XG4gICAgICAgIGNoZWNrUmVhZChhbW91bnQpO1xuICAgICAgICBwYXJzZV9vZmZzZXQgKz0gYW1vdW50O1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIGN1cnJlbnQgcGFyc2Ugb2Zmc2V0ICovXG4gICAgcHVibGljIGludCBHZXRPZmZzZXQoKSB7XG4gICAgICAgIHJldHVybiBwYXJzZV9vZmZzZXQ7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgcmF3IG1pZGkgZmlsZSBieXRlIGRhdGEgKi9cbiAgICBwdWJsaWMgYnl0ZVtdIEdldERhdGEoKSB7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbn1cblxufSBcblxuIiwiLypcclxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTIgTWFkaGF2IFZhaWR5YW5hdGhhblxyXG4gKlxyXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcclxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxyXG4gKlxyXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXHJcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxyXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxyXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cclxuICovXHJcblxyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5JTztcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XHJcblxyXG4vKiogQGNsYXNzIE1pZGlOb3RlXHJcbiAqIEEgTWlkaU5vdGUgY29udGFpbnNcclxuICpcclxuICogc3RhcnR0aW1lIC0gVGhlIHRpbWUgKG1lYXN1cmVkIGluIHB1bHNlcykgd2hlbiB0aGUgbm90ZSBpcyBwcmVzc2VkLlxyXG4gKiBjaGFubmVsICAgLSBUaGUgY2hhbm5lbCB0aGUgbm90ZSBpcyBmcm9tLiAgVGhpcyBpcyB1c2VkIHdoZW4gbWF0Y2hpbmdcclxuICogICAgICAgICAgICAgTm90ZU9mZiBldmVudHMgd2l0aCB0aGUgY29ycmVzcG9uZGluZyBOb3RlT24gZXZlbnQuXHJcbiAqICAgICAgICAgICAgIFRoZSBjaGFubmVscyBmb3IgdGhlIE5vdGVPbiBhbmQgTm90ZU9mZiBldmVudHMgbXVzdCBiZVxyXG4gKiAgICAgICAgICAgICB0aGUgc2FtZS5cclxuICogbm90ZW51bWJlciAtIFRoZSBub3RlIG51bWJlciwgZnJvbSAwIHRvIDEyNy4gIE1pZGRsZSBDIGlzIDYwLlxyXG4gKiBkdXJhdGlvbiAgLSBUaGUgdGltZSBkdXJhdGlvbiAobWVhc3VyZWQgaW4gcHVsc2VzKSBhZnRlciB3aGljaCB0aGUgXHJcbiAqICAgICAgICAgICAgIG5vdGUgaXMgcmVsZWFzZWQuXHJcbiAqXHJcbiAqIEEgTWlkaU5vdGUgaXMgY3JlYXRlZCB3aGVuIHdlIGVuY291bnRlciBhIE5vdGVPZmYgZXZlbnQuICBUaGUgZHVyYXRpb25cclxuICogaXMgaW5pdGlhbGx5IHVua25vd24gKHNldCB0byAwKS4gIFdoZW4gdGhlIGNvcnJlc3BvbmRpbmcgTm90ZU9mZiBldmVudFxyXG4gKiBpcyBmb3VuZCwgdGhlIGR1cmF0aW9uIGlzIHNldCBieSB0aGUgbWV0aG9kIE5vdGVPZmYoKS5cclxuICovXHJcbnB1YmxpYyBjbGFzcyBNaWRpTm90ZSA6IElDb21wYXJlcjxNaWRpTm90ZT4ge1xyXG4gICAgcHJpdmF0ZSBpbnQgc3RhcnR0aW1lOyAgIC8qKiBUaGUgc3RhcnQgdGltZSwgaW4gcHVsc2VzICovXHJcbiAgICBwcml2YXRlIGludCBjaGFubmVsOyAgICAgLyoqIFRoZSBjaGFubmVsICovXHJcbiAgICBwcml2YXRlIGludCBub3RlbnVtYmVyOyAgLyoqIFRoZSBub3RlLCBmcm9tIDAgdG8gMTI3LiBNaWRkbGUgQyBpcyA2MCAqL1xyXG4gICAgcHJpdmF0ZSBpbnQgZHVyYXRpb247ICAgIC8qKiBUaGUgZHVyYXRpb24sIGluIHB1bHNlcyAqL1xyXG4gICAgcHJpdmF0ZSBpbnQgdmVsb2NpdHk7XHJcblxyXG5cclxuICAgIC8qIENyZWF0ZSBhIG5ldyBNaWRpTm90ZS4gIFRoaXMgaXMgY2FsbGVkIHdoZW4gYSBOb3RlT24gZXZlbnQgaXNcclxuICAgICAqIGVuY291bnRlcmVkIGluIHRoZSBNaWRpRmlsZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIE1pZGlOb3RlKGludCBzdGFydHRpbWUsIGludCBjaGFubmVsLCBpbnQgbm90ZW51bWJlciwgaW50IGR1cmF0aW9uLCBpbnQgdmVsb2NpdHkpIHtcclxuICAgICAgICB0aGlzLnN0YXJ0dGltZSA9IHN0YXJ0dGltZTtcclxuICAgICAgICB0aGlzLmNoYW5uZWwgPSBjaGFubmVsO1xyXG4gICAgICAgIHRoaXMubm90ZW51bWJlciA9IG5vdGVudW1iZXI7XHJcbiAgICAgICAgdGhpcy5kdXJhdGlvbiA9IGR1cmF0aW9uO1xyXG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSB2ZWxvY2l0eTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgcHVibGljIGludCBTdGFydFRpbWUge1xyXG4gICAgICAgIGdldCB7IHJldHVybiBzdGFydHRpbWU7IH1cclxuICAgICAgICBzZXQgeyBzdGFydHRpbWUgPSB2YWx1ZTsgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbnQgRW5kVGltZSB7XHJcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHN0YXJ0dGltZSArIGR1cmF0aW9uOyB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGludCBDaGFubmVsIHtcclxuICAgICAgICBnZXQgeyByZXR1cm4gY2hhbm5lbDsgfVxyXG4gICAgICAgIHNldCB7IGNoYW5uZWwgPSB2YWx1ZTsgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbnQgTnVtYmVyIHtcclxuICAgICAgICBnZXQgeyByZXR1cm4gbm90ZW51bWJlcjsgfVxyXG4gICAgICAgIHNldCB7IG5vdGVudW1iZXIgPSB2YWx1ZTsgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbnQgRHVyYXRpb24ge1xyXG4gICAgICAgIGdldCB7IHJldHVybiBkdXJhdGlvbjsgfVxyXG4gICAgICAgIHNldCB7IGR1cmF0aW9uID0gdmFsdWU7IH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVibGljIGludCBWZWxvY2l0eVxyXG4gICAge1xyXG4gICAgICAgIGdldCB7IHJldHVybiB2ZWxvY2l0eTsgfVxyXG4gICAgICAgIHNldCB7IHZlbG9jaXR5ID0gdmFsdWU7IH1cclxuICAgIH1cclxuXHJcbiAgICAvKiBBIE5vdGVPZmYgZXZlbnQgb2NjdXJzIGZvciB0aGlzIG5vdGUgYXQgdGhlIGdpdmVuIHRpbWUuXHJcbiAgICAgKiBDYWxjdWxhdGUgdGhlIG5vdGUgZHVyYXRpb24gYmFzZWQgb24gdGhlIG5vdGVvZmYgZXZlbnQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB2b2lkIE5vdGVPZmYoaW50IGVuZHRpbWUpIHtcclxuICAgICAgICBkdXJhdGlvbiA9IGVuZHRpbWUgLSBzdGFydHRpbWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIENvbXBhcmUgdHdvIE1pZGlOb3RlcyBiYXNlZCBvbiB0aGVpciBzdGFydCB0aW1lcy5cclxuICAgICAqICBJZiB0aGUgc3RhcnQgdGltZXMgYXJlIGVxdWFsLCBjb21wYXJlIGJ5IHRoZWlyIG51bWJlcnMuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBpbnQgQ29tcGFyZShNaWRpTm90ZSB4LCBNaWRpTm90ZSB5KSB7XHJcbiAgICAgICAgaWYgKHguU3RhcnRUaW1lID09IHkuU3RhcnRUaW1lKVxyXG4gICAgICAgICAgICByZXR1cm4geC5OdW1iZXIgLSB5Lk51bWJlcjtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHJldHVybiB4LlN0YXJ0VGltZSAtIHkuU3RhcnRUaW1lO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwdWJsaWMgTWlkaU5vdGUgQ2xvbmUoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNaWRpTm90ZShzdGFydHRpbWUsIGNoYW5uZWwsIG5vdGVudW1iZXIsIGR1cmF0aW9uLCB2ZWxvY2l0eSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG92ZXJyaWRlIFxyXG4gICAgc3RyaW5nIFRvU3RyaW5nKCkge1xyXG4gICAgICAgIHN0cmluZ1tdIHNjYWxlID0geyBcIkFcIiwgXCJBI1wiLCBcIkJcIiwgXCJDXCIsIFwiQyNcIiwgXCJEXCIsIFwiRCNcIiwgXCJFXCIsIFwiRlwiLCBcIkYjXCIsIFwiR1wiLCBcIkcjXCIgfTtcclxuICAgICAgICByZXR1cm4gc3RyaW5nLkZvcm1hdChcIk1pZGlOb3RlIGNoYW5uZWw9ezB9IG51bWJlcj17MX0gezJ9IHN0YXJ0PXszfSBkdXJhdGlvbj17NH1cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFubmVsLCBub3RlbnVtYmVyLCBzY2FsZVsobm90ZW51bWJlciArIDMpICUgMTJdLCBzdGFydHRpbWUsIGR1cmF0aW9uKTtcclxuXHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5cclxufSAgLyogRW5kIG5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyAqL1xyXG5cclxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDEzIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogQGNsYXNzIE1pZGlPcHRpb25zXG4gKlxuICogVGhlIE1pZGlPcHRpb25zIGNsYXNzIGNvbnRhaW5zIHRoZSBhdmFpbGFibGUgb3B0aW9ucyBmb3JcbiAqIG1vZGlmeWluZyB0aGUgc2hlZXQgbXVzaWMgYW5kIHNvdW5kLiAgVGhlc2Ugb3B0aW9ucyBhcmVcbiAqIGNvbGxlY3RlZCBmcm9tIHRoZSBtZW51L2RpYWxvZyBzZXR0aW5ncywgYW5kIHRoZW4gYXJlIHBhc3NlZFxuICogdG8gdGhlIFNoZWV0TXVzaWMgYW5kIE1pZGlQbGF5ZXIgY2xhc3Nlcy5cbiAqL1xucHVibGljIGNsYXNzIE1pZGlPcHRpb25zIHtcblxuICAgIC8vIFRoZSBwb3NzaWJsZSB2YWx1ZXMgZm9yIHNob3dOb3RlTGV0dGVyc1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTm90ZU5hbWVOb25lICAgICAgICAgICA9IDA7XG4gICAgcHVibGljIGNvbnN0IGludCBOb3RlTmFtZUxldHRlciAgICAgICAgID0gMTtcbiAgICBwdWJsaWMgY29uc3QgaW50IE5vdGVOYW1lRml4ZWREb1JlTWkgICAgPSAyO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTm90ZU5hbWVNb3ZhYmxlRG9SZU1pICA9IDM7XG4gICAgcHVibGljIGNvbnN0IGludCBOb3RlTmFtZUZpeGVkTnVtYmVyICAgID0gNDtcbiAgICBwdWJsaWMgY29uc3QgaW50IE5vdGVOYW1lTW92YWJsZU51bWJlciAgPSA1O1xuXG4gICAgLy8gU2hlZXQgTXVzaWMgT3B0aW9uc1xuICAgIHB1YmxpYyBzdHJpbmcgZmlsZW5hbWU7ICAgICAgIC8qKiBUaGUgZnVsbCBNaWRpIGZpbGVuYW1lICovXG4gICAgcHVibGljIHN0cmluZyB0aXRsZTsgICAgICAgICAgLyoqIFRoZSBNaWRpIHNvbmcgdGl0bGUgKi9cbiAgICBwdWJsaWMgYm9vbFtdIHRyYWNrczsgICAgICAgICAvKiogV2hpY2ggdHJhY2tzIHRvIGRpc3BsYXkgKHRydWUgPSBkaXNwbGF5KSAqL1xuICAgIHB1YmxpYyBib29sIHNjcm9sbFZlcnQ7ICAgICAgIC8qKiBXaGV0aGVyIHRvIHNjcm9sbCB2ZXJ0aWNhbGx5IG9yIGhvcml6b250YWxseSAqL1xuICAgIHB1YmxpYyBib29sIGxhcmdlTm90ZVNpemU7ICAgIC8qKiBEaXNwbGF5IGxhcmdlIG9yIHNtYWxsIG5vdGUgc2l6ZXMgKi9cbiAgICBwdWJsaWMgYm9vbCB0d29TdGFmZnM7ICAgICAgICAvKiogQ29tYmluZSB0cmFja3MgaW50byB0d28gc3RhZmZzID8gKi9cbiAgICBwdWJsaWMgaW50IHNob3dOb3RlTGV0dGVyczsgICAgIC8qKiBTaG93IHRoZSBuYW1lIChBLCBBIywgZXRjKSBuZXh0IHRvIHRoZSBub3RlcyAqL1xuICAgIHB1YmxpYyBib29sIHNob3dMeXJpY3M7ICAgICAgIC8qKiBTaG93IHRoZSBseXJpY3MgdW5kZXIgZWFjaCBub3RlICovXG4gICAgcHVibGljIGJvb2wgc2hvd01lYXN1cmVzOyAgICAgLyoqIFNob3cgdGhlIG1lYXN1cmUgbnVtYmVycyBmb3IgZWFjaCBzdGFmZiAqL1xuICAgIHB1YmxpYyBpbnQgc2hpZnR0aW1lOyAgICAgICAgIC8qKiBTaGlmdCBub3RlIHN0YXJ0dGltZXMgYnkgdGhlIGdpdmVuIGFtb3VudCAqL1xuICAgIHB1YmxpYyBpbnQgdHJhbnNwb3NlOyAgICAgICAgIC8qKiBTaGlmdCBub3RlIGtleSB1cC9kb3duIGJ5IGdpdmVuIGFtb3VudCAqL1xuICAgIHB1YmxpYyBpbnQga2V5OyAgICAgICAgICAgICAgIC8qKiBVc2UgdGhlIGdpdmVuIEtleVNpZ25hdHVyZSAobm90ZXNjYWxlKSAqL1xuICAgIHB1YmxpYyBUaW1lU2lnbmF0dXJlIHRpbWU7ICAgIC8qKiBVc2UgdGhlIGdpdmVuIHRpbWUgc2lnbmF0dXJlICovXG4gICAgcHVibGljIGludCBjb21iaW5lSW50ZXJ2YWw7ICAgLyoqIENvbWJpbmUgbm90ZXMgd2l0aGluIGdpdmVuIHRpbWUgaW50ZXJ2YWwgKG1zZWMpICovXG4gICAgcHVibGljIENvbG9yW10gY29sb3JzOyAgICAgICAgLyoqIFRoZSBub3RlIGNvbG9ycyB0byB1c2UgKi9cbiAgICBwdWJsaWMgQ29sb3Igc2hhZGVDb2xvcjsgICAgICAvKiogVGhlIGNvbG9yIHRvIHVzZSBmb3Igc2hhZGluZy4gKi9cbiAgICBwdWJsaWMgQ29sb3Igc2hhZGUyQ29sb3I7ICAgICAvKiogVGhlIGNvbG9yIHRvIHVzZSBmb3Igc2hhZGluZyB0aGUgbGVmdCBoYW5kIHBpYW5vICovXG5cbiAgICAvLyBTb3VuZCBvcHRpb25zXG4gICAgcHVibGljIGJvb2wgW11tdXRlOyAgICAgICAgICAgIC8qKiBXaGljaCB0cmFja3MgdG8gbXV0ZSAodHJ1ZSA9IG11dGUpICovXG4gICAgcHVibGljIGludCB0ZW1wbzsgICAgICAgICAgICAgIC8qKiBUaGUgdGVtcG8sIGluIG1pY3Jvc2Vjb25kcyBwZXIgcXVhcnRlciBub3RlICovXG4gICAgcHVibGljIGludCBwYXVzZVRpbWU7ICAgICAgICAgIC8qKiBTdGFydCB0aGUgbWlkaSBtdXNpYyBhdCB0aGUgZ2l2ZW4gcGF1c2UgdGltZSAqL1xuICAgIHB1YmxpYyBpbnRbXSBpbnN0cnVtZW50czsgICAgICAvKiogVGhlIGluc3RydW1lbnRzIHRvIHVzZSBwZXIgdHJhY2sgKi9cbiAgICBwdWJsaWMgYm9vbCB1c2VEZWZhdWx0SW5zdHJ1bWVudHM7ICAvKiogSWYgdHJ1ZSwgZG9uJ3QgY2hhbmdlIGluc3RydW1lbnRzICovXG4gICAgcHVibGljIGJvb2wgcGxheU1lYXN1cmVzSW5Mb29wOyAgICAgLyoqIFBsYXkgdGhlIHNlbGVjdGVkIG1lYXN1cmVzIGluIGEgbG9vcCAqL1xuICAgIHB1YmxpYyBpbnQgcGxheU1lYXN1cmVzSW5Mb29wU3RhcnQ7IC8qKiBTdGFydCBtZWFzdXJlIHRvIHBsYXkgaW4gbG9vcCAqL1xuICAgIHB1YmxpYyBpbnQgcGxheU1lYXN1cmVzSW5Mb29wRW5kOyAgIC8qKiBFbmQgbWVhc3VyZSB0byBwbGF5IGluIGxvb3AgKi9cblxuXG4gICAgcHVibGljIE1pZGlPcHRpb25zKCkge1xuICAgIH1cblxuICAgIHB1YmxpYyBNaWRpT3B0aW9ucyhNaWRpRmlsZSBtaWRpZmlsZSkge1xuICAgICAgICBmaWxlbmFtZSA9IG1pZGlmaWxlLkZpbGVOYW1lO1xuICAgICAgICB0aXRsZSA9IFBhdGguR2V0RmlsZU5hbWUobWlkaWZpbGUuRmlsZU5hbWUpO1xuICAgICAgICBpbnQgbnVtdHJhY2tzID0gbWlkaWZpbGUuVHJhY2tzLkNvdW50O1xuICAgICAgICB0cmFja3MgPSBuZXcgYm9vbFtudW10cmFja3NdO1xuICAgICAgICBtdXRlID0gIG5ldyBib29sW251bXRyYWNrc107XG4gICAgICAgIGluc3RydW1lbnRzID0gbmV3IGludFtudW10cmFja3NdO1xuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHRyYWNrcy5MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdHJhY2tzW2ldID0gdHJ1ZTtcbiAgICAgICAgICAgIG11dGVbaV0gPSBmYWxzZTtcbiAgICAgICAgICAgIGluc3RydW1lbnRzW2ldID0gbWlkaWZpbGUuVHJhY2tzW2ldLkluc3RydW1lbnQ7XG4gICAgICAgICAgICBpZiAobWlkaWZpbGUuVHJhY2tzW2ldLkluc3RydW1lbnROYW1lID09IFwiUGVyY3Vzc2lvblwiKSB7XG4gICAgICAgICAgICAgICAgdHJhY2tzW2ldID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgbXV0ZVtpXSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gXG4gICAgICAgIHVzZURlZmF1bHRJbnN0cnVtZW50cyA9IHRydWU7XG4gICAgICAgIHNjcm9sbFZlcnQgPSB0cnVlO1xuICAgICAgICBsYXJnZU5vdGVTaXplID0gZmFsc2U7XG4gICAgICAgIGlmICh0cmFja3MuTGVuZ3RoID09IDEpIHtcbiAgICAgICAgICAgIHR3b1N0YWZmcyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0d29TdGFmZnMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBzaG93Tm90ZUxldHRlcnMgPSBOb3RlTmFtZU5vbmU7XG4gICAgICAgIHNob3dMeXJpY3MgPSB0cnVlO1xuICAgICAgICBzaG93TWVhc3VyZXMgPSBmYWxzZTtcbiAgICAgICAgc2hpZnR0aW1lID0gMDtcbiAgICAgICAgdHJhbnNwb3NlID0gMDtcbiAgICAgICAga2V5ID0gLTE7XG4gICAgICAgIHRpbWUgPSBtaWRpZmlsZS5UaW1lO1xuICAgICAgICBjb2xvcnMgPSBudWxsO1xuICAgICAgICBzaGFkZUNvbG9yID0gQ29sb3IuRnJvbUFyZ2IoMTAwLCA1MywgMTIzLCAyNTUpO1xuICAgICAgICBzaGFkZTJDb2xvciA9IENvbG9yLkZyb21BcmdiKDgwLCAxMDAsIDI1MCk7XG4gICAgICAgIGNvbWJpbmVJbnRlcnZhbCA9IDQwO1xuICAgICAgICB0ZW1wbyA9IG1pZGlmaWxlLlRpbWUuVGVtcG87XG4gICAgICAgIHBhdXNlVGltZSA9IDA7XG4gICAgICAgIHBsYXlNZWFzdXJlc0luTG9vcCA9IGZhbHNlOyBcbiAgICAgICAgcGxheU1lYXN1cmVzSW5Mb29wU3RhcnQgPSAwO1xuICAgICAgICBwbGF5TWVhc3VyZXNJbkxvb3BFbmQgPSBtaWRpZmlsZS5FbmRUaW1lKCkgLyBtaWRpZmlsZS5UaW1lLk1lYXN1cmU7XG4gICAgfVxuXG4gICAgLyogSm9pbiB0aGUgYXJyYXkgaW50byBhIGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgKi9cbiAgICBzdGF0aWMgc3RyaW5nIEpvaW4oYm9vbFtdIHZhbHVlcykge1xuICAgICAgICBTdHJpbmdCdWlsZGVyIHJlc3VsdCA9IG5ldyBTdHJpbmdCdWlsZGVyKCk7XG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgdmFsdWVzLkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQuQXBwZW5kKFwiLFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdC5BcHBlbmQodmFsdWVzW2ldLlRvU3RyaW5nKCkpOyBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0LlRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgc3RhdGljIHN0cmluZyBKb2luKGludFtdIHZhbHVlcykge1xuICAgICAgICBTdHJpbmdCdWlsZGVyIHJlc3VsdCA9IG5ldyBTdHJpbmdCdWlsZGVyKCk7XG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgdmFsdWVzLkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQuQXBwZW5kKFwiLFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdC5BcHBlbmQodmFsdWVzW2ldLlRvU3RyaW5nKCkpOyBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0LlRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgc3RhdGljIHN0cmluZyBKb2luKENvbG9yW10gdmFsdWVzKSB7XG4gICAgICAgIFN0cmluZ0J1aWxkZXIgcmVzdWx0ID0gbmV3IFN0cmluZ0J1aWxkZXIoKTtcbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCB2YWx1ZXMuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5BcHBlbmQoXCIsXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0LkFwcGVuZChDb2xvclRvU3RyaW5nKHZhbHVlc1tpXSkpOyBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0LlRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgc3RhdGljIHN0cmluZyBDb2xvclRvU3RyaW5nKENvbG9yIGMpIHtcbiAgICAgICAgcmV0dXJuIFwiXCIgKyBjLlIgKyBcIiBcIiArIGMuRyArIFwiIFwiICsgYy5CO1xuICAgIH1cblxuICAgIFxuICAgIC8qIE1lcmdlIGluIHRoZSBzYXZlZCBvcHRpb25zIHRvIHRoaXMgTWlkaU9wdGlvbnMuKi9cbiAgICBwdWJsaWMgdm9pZCBNZXJnZShNaWRpT3B0aW9ucyBzYXZlZCkge1xuICAgICAgICBpZiAoc2F2ZWQudHJhY2tzICE9IG51bGwgJiYgc2F2ZWQudHJhY2tzLkxlbmd0aCA9PSB0cmFja3MuTGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHRyYWNrcy5MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRyYWNrc1tpXSA9IHNhdmVkLnRyYWNrc1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoc2F2ZWQubXV0ZSAhPSBudWxsICYmIHNhdmVkLm11dGUuTGVuZ3RoID09IG11dGUuTGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IG11dGUuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBtdXRlW2ldID0gc2F2ZWQubXV0ZVtpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoc2F2ZWQuaW5zdHJ1bWVudHMgIT0gbnVsbCAmJiBzYXZlZC5pbnN0cnVtZW50cy5MZW5ndGggPT0gaW5zdHJ1bWVudHMuTGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IGluc3RydW1lbnRzLkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaW5zdHJ1bWVudHNbaV0gPSBzYXZlZC5pbnN0cnVtZW50c1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoc2F2ZWQudGltZSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aW1lID0gbmV3IFRpbWVTaWduYXR1cmUoc2F2ZWQudGltZS5OdW1lcmF0b3IsIHNhdmVkLnRpbWUuRGVub21pbmF0b3IsXG4gICAgICAgICAgICAgICAgICAgIHNhdmVkLnRpbWUuUXVhcnRlciwgc2F2ZWQudGltZS5UZW1wbyk7XG4gICAgICAgIH1cbiAgICAgICAgdXNlRGVmYXVsdEluc3RydW1lbnRzID0gc2F2ZWQudXNlRGVmYXVsdEluc3RydW1lbnRzO1xuICAgICAgICBzY3JvbGxWZXJ0ID0gc2F2ZWQuc2Nyb2xsVmVydDtcbiAgICAgICAgbGFyZ2VOb3RlU2l6ZSA9IHNhdmVkLmxhcmdlTm90ZVNpemU7XG4gICAgICAgIHNob3dMeXJpY3MgPSBzYXZlZC5zaG93THlyaWNzO1xuICAgICAgICB0d29TdGFmZnMgPSBzYXZlZC50d29TdGFmZnM7XG4gICAgICAgIHNob3dOb3RlTGV0dGVycyA9IHNhdmVkLnNob3dOb3RlTGV0dGVycztcbiAgICAgICAgdHJhbnNwb3NlID0gc2F2ZWQudHJhbnNwb3NlO1xuICAgICAgICBrZXkgPSBzYXZlZC5rZXk7XG4gICAgICAgIGNvbWJpbmVJbnRlcnZhbCA9IHNhdmVkLmNvbWJpbmVJbnRlcnZhbDtcbiAgICAgICAgaWYgKHNhdmVkLnNoYWRlQ29sb3IgIT0gQ29sb3IuV2hpdGUpIHtcbiAgICAgICAgICAgIHNoYWRlQ29sb3IgPSBzYXZlZC5zaGFkZUNvbG9yO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzYXZlZC5zaGFkZTJDb2xvciAhPSBDb2xvci5XaGl0ZSkge1xuICAgICAgICAgICAgc2hhZGUyQ29sb3IgPSBzYXZlZC5zaGFkZTJDb2xvcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2F2ZWQuY29sb3JzICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNvbG9ycyA9IHNhdmVkLmNvbG9ycztcbiAgICAgICAgfVxuICAgICAgICBzaG93TWVhc3VyZXMgPSBzYXZlZC5zaG93TWVhc3VyZXM7XG4gICAgICAgIHBsYXlNZWFzdXJlc0luTG9vcCA9IHNhdmVkLnBsYXlNZWFzdXJlc0luTG9vcDtcbiAgICAgICAgcGxheU1lYXN1cmVzSW5Mb29wU3RhcnQgPSBzYXZlZC5wbGF5TWVhc3VyZXNJbkxvb3BTdGFydDtcbiAgICAgICAgcGxheU1lYXN1cmVzSW5Mb29wRW5kID0gc2F2ZWQucGxheU1lYXN1cmVzSW5Mb29wRW5kO1xuICAgIH1cbn1cblxufVxuXG5cbiIsIi8qXHJcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDEyIE1hZGhhdiBWYWlkeWFuYXRoYW5cclxuICpcclxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XHJcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cclxuICpcclxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxyXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcclxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcclxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXHJcbiAqL1xyXG5cclxudXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uSU87XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xyXG5cclxuLyoqIEBjbGFzcyBNaWRpVHJhY2tcclxuICogVGhlIE1pZGlUcmFjayB0YWtlcyBhcyBpbnB1dCB0aGUgcmF3IE1pZGlFdmVudHMgZm9yIHRoZSB0cmFjaywgYW5kIGdldHM6XHJcbiAqIC0gVGhlIGxpc3Qgb2YgbWlkaSBub3RlcyBpbiB0aGUgdHJhY2suXHJcbiAqIC0gVGhlIGZpcnN0IGluc3RydW1lbnQgdXNlZCBpbiB0aGUgdHJhY2suXHJcbiAqXHJcbiAqIEZvciBlYWNoIE5vdGVPbiBldmVudCBpbiB0aGUgbWlkaSBmaWxlLCBhIG5ldyBNaWRpTm90ZSBpcyBjcmVhdGVkXHJcbiAqIGFuZCBhZGRlZCB0byB0aGUgdHJhY2ssIHVzaW5nIHRoZSBBZGROb3RlKCkgbWV0aG9kLlxyXG4gKiBcclxuICogVGhlIE5vdGVPZmYoKSBtZXRob2QgaXMgY2FsbGVkIHdoZW4gYSBOb3RlT2ZmIGV2ZW50IGlzIGVuY291bnRlcmVkLFxyXG4gKiBpbiBvcmRlciB0byB1cGRhdGUgdGhlIGR1cmF0aW9uIG9mIHRoZSBNaWRpTm90ZS5cclxuICovIFxyXG5wdWJsaWMgY2xhc3MgTWlkaVRyYWNrIHtcclxuICAgIHByaXZhdGUgaW50IHRyYWNrbnVtOyAgICAgICAgICAgICAvKiogVGhlIHRyYWNrIG51bWJlciAqL1xyXG4gICAgcHJpdmF0ZSBMaXN0PE1pZGlOb3RlPiBub3RlczsgICAgIC8qKiBMaXN0IG9mIE1pZGkgbm90ZXMgKi9cclxuICAgIHByaXZhdGUgaW50IGluc3RydW1lbnQ7ICAgICAgICAgICAvKiogSW5zdHJ1bWVudCBmb3IgdGhpcyB0cmFjayAqL1xyXG4gICAgcHJpdmF0ZSBMaXN0PE1pZGlFdmVudD4gbHlyaWNzOyAgIC8qKiBUaGUgbHlyaWNzIGluIHRoaXMgdHJhY2sgKi9cclxuXHJcbiAgICAvKiogQ3JlYXRlIGFuIGVtcHR5IE1pZGlUcmFjay4gIFVzZWQgYnkgdGhlIENsb25lIG1ldGhvZCAqL1xyXG4gICAgcHVibGljIE1pZGlUcmFjayhpbnQgdHJhY2tudW0pIHtcclxuICAgICAgICB0aGlzLnRyYWNrbnVtID0gdHJhY2tudW07XHJcbiAgICAgICAgbm90ZXMgPSBuZXcgTGlzdDxNaWRpTm90ZT4oMjApO1xyXG4gICAgICAgIGluc3RydW1lbnQgPSAwO1xyXG4gICAgfSBcclxuXHJcbiAgICAvKiogQ3JlYXRlIGEgTWlkaVRyYWNrIGJhc2VkIG9uIHRoZSBNaWRpIGV2ZW50cy4gIEV4dHJhY3QgdGhlIE5vdGVPbi9Ob3RlT2ZmXHJcbiAgICAgKiAgZXZlbnRzIHRvIGdhdGhlciB0aGUgbGlzdCBvZiBNaWRpTm90ZXMuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBNaWRpVHJhY2soTGlzdDxNaWRpRXZlbnQ+IGV2ZW50cywgaW50IHRyYWNrbnVtKSB7XHJcbiAgICAgICAgdGhpcy50cmFja251bSA9IHRyYWNrbnVtO1xyXG4gICAgICAgIG5vdGVzID0gbmV3IExpc3Q8TWlkaU5vdGU+KGV2ZW50cy5Db3VudCk7XHJcbiAgICAgICAgaW5zdHJ1bWVudCA9IDA7XHJcbiBcclxuICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbWV2ZW50IGluIGV2ZW50cykge1xyXG4gICAgICAgICAgICBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBNaWRpRmlsZS5FdmVudE5vdGVPbiAmJiBtZXZlbnQuVmVsb2NpdHkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBNaWRpTm90ZSBub3RlID0gbmV3IE1pZGlOb3RlKG1ldmVudC5TdGFydFRpbWUsIG1ldmVudC5DaGFubmVsLCBtZXZlbnQuTm90ZW51bWJlciwgMCwgbWV2ZW50LlZlbG9jaXR5KTtcclxuICAgICAgICAgICAgICAgIEFkZE5vdGUobm90ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBNaWRpRmlsZS5FdmVudE5vdGVPbiAmJiBtZXZlbnQuVmVsb2NpdHkgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgTm90ZU9mZihtZXZlbnQuQ2hhbm5lbCwgbWV2ZW50Lk5vdGVudW1iZXIsIG1ldmVudC5TdGFydFRpbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gTWlkaUZpbGUuRXZlbnROb3RlT2ZmKSB7XHJcbiAgICAgICAgICAgICAgICBOb3RlT2ZmKG1ldmVudC5DaGFubmVsLCBtZXZlbnQuTm90ZW51bWJlciwgbWV2ZW50LlN0YXJ0VGltZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBNaWRpRmlsZS5FdmVudFByb2dyYW1DaGFuZ2UpIHtcclxuICAgICAgICAgICAgICAgIGluc3RydW1lbnQgPSBtZXZlbnQuSW5zdHJ1bWVudDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuTWV0YWV2ZW50ID09IE1pZGlGaWxlLk1ldGFFdmVudEx5cmljKSB7XHJcbiAgICAgICAgICAgICAgICBBZGRMeXJpYyhtZXZlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChub3Rlcy5Db3VudCA+IDAgJiYgbm90ZXNbMF0uQ2hhbm5lbCA9PSA5KSAge1xyXG4gICAgICAgICAgICBpbnN0cnVtZW50ID0gMTI4OyAgLyogUGVyY3Vzc2lvbiAqL1xyXG4gICAgICAgIH1cclxuICAgICAgICBpbnQgbHlyaWNjb3VudCA9IDA7XHJcbiAgICAgICAgaWYgKGx5cmljcyAhPSBudWxsKSB7IGx5cmljY291bnQgPSBseXJpY3MuQ291bnQ7IH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW50IE51bWJlciB7XHJcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHRyYWNrbnVtOyB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIExpc3Q8TWlkaU5vdGU+IE5vdGVzIHtcclxuICAgICAgICBnZXQgeyByZXR1cm4gbm90ZXM7IH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW50IEluc3RydW1lbnQge1xyXG4gICAgICAgIGdldCB7IHJldHVybiBpbnN0cnVtZW50OyB9XHJcbiAgICAgICAgc2V0IHsgaW5zdHJ1bWVudCA9IHZhbHVlOyB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0cmluZyBJbnN0cnVtZW50TmFtZSB7XHJcbiAgICAgICAgZ2V0IHsgaWYgKGluc3RydW1lbnQgPj0gMCAmJiBpbnN0cnVtZW50IDw9IDEyOClcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIE1pZGlGaWxlLkluc3RydW1lbnRzW2luc3RydW1lbnRdO1xyXG4gICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgTGlzdDxNaWRpRXZlbnQ+IEx5cmljcyB7XHJcbiAgICAgICAgZ2V0IHsgcmV0dXJuIGx5cmljczsgfVxyXG4gICAgICAgIHNldCB7IGx5cmljcyA9IHZhbHVlOyB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEFkZCBhIE1pZGlOb3RlIHRvIHRoaXMgdHJhY2suICBUaGlzIGlzIGNhbGxlZCBmb3IgZWFjaCBOb3RlT24gZXZlbnQgKi9cclxuICAgIHB1YmxpYyB2b2lkIEFkZE5vdGUoTWlkaU5vdGUgbSkge1xyXG4gICAgICAgIG5vdGVzLkFkZChtKTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogQSBOb3RlT2ZmIGV2ZW50IG9jY3VyZWQuICBGaW5kIHRoZSBNaWRpTm90ZSBvZiB0aGUgY29ycmVzcG9uZGluZ1xyXG4gICAgICogTm90ZU9uIGV2ZW50LCBhbmQgdXBkYXRlIHRoZSBkdXJhdGlvbiBvZiB0aGUgTWlkaU5vdGUuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB2b2lkIE5vdGVPZmYoaW50IGNoYW5uZWwsIGludCBub3RlbnVtYmVyLCBpbnQgZW5kdGltZSkge1xyXG4gICAgICAgIGZvciAoaW50IGkgPSBub3Rlcy5Db3VudC0xOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICBNaWRpTm90ZSBub3RlID0gbm90ZXNbaV07XHJcbiAgICAgICAgICAgIGlmIChub3RlLkNoYW5uZWwgPT0gY2hhbm5lbCAmJiBub3RlLk51bWJlciA9PSBub3RlbnVtYmVyICYmXHJcbiAgICAgICAgICAgICAgICBub3RlLkR1cmF0aW9uID09IDApIHtcclxuICAgICAgICAgICAgICAgIG5vdGUuTm90ZU9mZihlbmR0aW1lKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogQWRkIGEgTHlyaWMgTWlkaUV2ZW50ICovXHJcbiAgICBwdWJsaWMgdm9pZCBBZGRMeXJpYyhNaWRpRXZlbnQgbWV2ZW50KSB7XHJcbiAgICAgICAgaWYgKGx5cmljcyA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGx5cmljcyA9IG5ldyBMaXN0PE1pZGlFdmVudD4oKTtcclxuICAgICAgICB9IFxyXG4gICAgICAgIGx5cmljcy5BZGQobWV2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogUmV0dXJuIGEgZGVlcCBjb3B5IGNsb25lIG9mIHRoaXMgTWlkaVRyYWNrLiAqL1xyXG4gICAgcHVibGljIE1pZGlUcmFjayBDbG9uZSgpIHtcclxuICAgICAgICBNaWRpVHJhY2sgdHJhY2sgPSBuZXcgTWlkaVRyYWNrKE51bWJlcik7XHJcbiAgICAgICAgdHJhY2suaW5zdHJ1bWVudCA9IGluc3RydW1lbnQ7XHJcbiAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiBub3Rlcykge1xyXG4gICAgICAgICAgICB0cmFjay5ub3Rlcy5BZGQoIG5vdGUuQ2xvbmUoKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobHlyaWNzICE9IG51bGwpIHtcclxuICAgICAgICAgICAgdHJhY2subHlyaWNzID0gbmV3IExpc3Q8TWlkaUV2ZW50PigpO1xyXG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgZXYgaW4gbHlyaWNzKSB7XHJcbiAgICAgICAgICAgICAgICB0cmFjay5seXJpY3MuQWRkKGV2KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJhY2s7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgc3RyaW5nIFRvU3RyaW5nKCkge1xyXG4gICAgICAgIHN0cmluZyByZXN1bHQgPSBcIlRyYWNrIG51bWJlcj1cIiArIHRyYWNrbnVtICsgXCIgaW5zdHJ1bWVudD1cIiArIGluc3RydW1lbnQgKyBcIlxcblwiO1xyXG4gICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG4gaW4gbm90ZXMpIHtcclxuICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgKyBuICsgXCJcXG5cIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0ICs9IFwiRW5kIFRyYWNrXFxuXCI7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxufVxyXG5cclxufVxyXG5cclxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIEVudW1lcmF0aW9uIG9mIHRoZSBub3RlcyBpbiBhIHNjYWxlIChBLCBBIywgLi4uIEcjKSAqL1xucHVibGljIGNsYXNzIE5vdGVTY2FsZSB7XG4gICAgcHVibGljIGNvbnN0IGludCBBICAgICAgPSAwO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQXNoYXJwID0gMTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEJmbGF0ICA9IDE7XG4gICAgcHVibGljIGNvbnN0IGludCBCICAgICAgPSAyO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQyAgICAgID0gMztcbiAgICBwdWJsaWMgY29uc3QgaW50IENzaGFycCA9IDQ7XG4gICAgcHVibGljIGNvbnN0IGludCBEZmxhdCAgPSA0O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRCAgICAgID0gNTtcbiAgICBwdWJsaWMgY29uc3QgaW50IERzaGFycCA9IDY7XG4gICAgcHVibGljIGNvbnN0IGludCBFZmxhdCAgPSA2O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRSAgICAgID0gNztcbiAgICBwdWJsaWMgY29uc3QgaW50IEYgICAgICA9IDg7XG4gICAgcHVibGljIGNvbnN0IGludCBGc2hhcnAgPSA5O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgR2ZsYXQgID0gOTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEcgICAgICA9IDEwO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgR3NoYXJwID0gMTE7XG4gICAgcHVibGljIGNvbnN0IGludCBBZmxhdCAgPSAxMTtcblxuICAgIC8qKiBDb252ZXJ0IGEgbm90ZSAoQSwgQSMsIEIsIGV0YykgYW5kIG9jdGF2ZSBpbnRvIGFcbiAgICAgKiBNaWRpIE5vdGUgbnVtYmVyLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgaW50IFRvTnVtYmVyKGludCBub3Rlc2NhbGUsIGludCBvY3RhdmUpIHtcbiAgICAgICAgcmV0dXJuIDkgKyBub3Rlc2NhbGUgKyBvY3RhdmUgKiAxMjtcbiAgICB9XG5cbiAgICAvKiogQ29udmVydCBhIE1pZGkgbm90ZSBudW1iZXIgaW50byBhIG5vdGVzY2FsZSAoQSwgQSMsIEIpICovXG4gICAgcHVibGljIHN0YXRpYyBpbnQgRnJvbU51bWJlcihpbnQgbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiAobnVtYmVyICsgMykgJSAxMjtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRydWUgaWYgdGhpcyBub3Rlc2NhbGUgbnVtYmVyIGlzIGEgYmxhY2sga2V5ICovXG4gICAgcHVibGljIHN0YXRpYyBib29sIElzQmxhY2tLZXkoaW50IG5vdGVzY2FsZSkge1xuICAgICAgICBpZiAobm90ZXNjYWxlID09IEFzaGFycCB8fFxuICAgICAgICAgICAgbm90ZXNjYWxlID09IENzaGFycCB8fFxuICAgICAgICAgICAgbm90ZXNjYWxlID09IERzaGFycCB8fFxuICAgICAgICAgICAgbm90ZXNjYWxlID09IEZzaGFycCB8fFxuICAgICAgICAgICAgbm90ZXNjYWxlID09IEdzaGFycCkge1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG4vKiogQGNsYXNzIFdoaXRlTm90ZVxuICogVGhlIFdoaXRlTm90ZSBjbGFzcyByZXByZXNlbnRzIGEgd2hpdGUga2V5IG5vdGUsIGEgbm9uLXNoYXJwLFxuICogbm9uLWZsYXQgbm90ZS4gIFRvIGRpc3BsYXkgbWlkaSBub3RlcyBhcyBzaGVldCBtdXNpYywgdGhlIG5vdGVzXG4gKiBtdXN0IGJlIGNvbnZlcnRlZCB0byB3aGl0ZSBub3RlcyBhbmQgYWNjaWRlbnRhbHMuIFxuICpcbiAqIFdoaXRlIG5vdGVzIGNvbnNpc3Qgb2YgYSBsZXR0ZXIgKEEgdGhydSBHKSBhbmQgYW4gb2N0YXZlICgwIHRocnUgMTApLlxuICogVGhlIG9jdGF2ZSBjaGFuZ2VzIGZyb20gRyB0byBBLiAgQWZ0ZXIgRzIgY29tZXMgQTMuICBNaWRkbGUtQyBpcyBDNC5cbiAqXG4gKiBUaGUgbWFpbiBvcGVyYXRpb25zIGFyZSBjYWxjdWxhdGluZyBkaXN0YW5jZXMgYmV0d2VlbiBub3RlcywgYW5kIGNvbXBhcmluZyBub3Rlcy5cbiAqLyBcblxucHVibGljIGNsYXNzIFdoaXRlTm90ZSA6IElDb21wYXJlcjxXaGl0ZU5vdGU+IHtcblxuICAgIC8qIFRoZSBwb3NzaWJsZSBub3RlIGxldHRlcnMgKi9cbiAgICBwdWJsaWMgY29uc3QgaW50IEEgPSAwO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQiA9IDE7XG4gICAgcHVibGljIGNvbnN0IGludCBDID0gMjtcbiAgICBwdWJsaWMgY29uc3QgaW50IEQgPSAzO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRSA9IDQ7XG4gICAgcHVibGljIGNvbnN0IGludCBGID0gNTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEcgPSA2O1xuXG4gICAgLyogQ29tbW9uIHdoaXRlIG5vdGVzIHVzZWQgaW4gY2FsY3VsYXRpb25zICovXG4gICAgcHVibGljIHN0YXRpYyBXaGl0ZU5vdGUgVG9wVHJlYmxlID0gbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRSwgNSk7XG4gICAgcHVibGljIHN0YXRpYyBXaGl0ZU5vdGUgQm90dG9tVHJlYmxlID0gbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRiwgNCk7XG4gICAgcHVibGljIHN0YXRpYyBXaGl0ZU5vdGUgVG9wQmFzcyA9IG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkcsIDMpO1xuICAgIHB1YmxpYyBzdGF0aWMgV2hpdGVOb3RlIEJvdHRvbUJhc3MgPSBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5BLCAzKTtcbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBNaWRkbGVDID0gbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQywgNCk7XG5cbiAgICBwcml2YXRlIGludCBsZXR0ZXI7ICAvKiBUaGUgbGV0dGVyIG9mIHRoZSBub3RlLCBBIHRocnUgRyAqL1xuICAgIHByaXZhdGUgaW50IG9jdGF2ZTsgIC8qIFRoZSBvY3RhdmUsIDAgdGhydSAxMC4gKi9cblxuICAgIC8qIEdldCB0aGUgbGV0dGVyICovXG4gICAgcHVibGljIGludCBMZXR0ZXIge1xuICAgICAgICBnZXQgeyByZXR1cm4gbGV0dGVyOyB9XG4gICAgfVxuXG4gICAgLyogR2V0IHRoZSBvY3RhdmUgKi9cbiAgICBwdWJsaWMgaW50IE9jdGF2ZSB7XG4gICAgICAgIGdldCB7IHJldHVybiBvY3RhdmU7IH1cbiAgICB9XG5cblxuICAgIC8qKiBDcmVhdGUgYSBuZXcgbm90ZSB3aXRoIHRoZSBnaXZlbiBsZXR0ZXIgYW5kIG9jdGF2ZS4gKi9cbiAgICBwdWJsaWMgV2hpdGVOb3RlKGludCBsZXR0ZXIsIGludCBvY3RhdmUpIHtcbiAgICAgICAgaWYgKCEobGV0dGVyID49IDAgJiYgbGV0dGVyIDw9IDYpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgU3lzdGVtLkFyZ3VtZW50RXhjZXB0aW9uKFwiTGV0dGVyIFwiICsgbGV0dGVyICsgXCIgaXMgaW5jb3JyZWN0XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sZXR0ZXIgPSBsZXR0ZXI7XG4gICAgICAgIHRoaXMub2N0YXZlID0gb2N0YXZlO1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIGRpc3RhbmNlIChpbiB3aGl0ZSBub3RlcykgYmV0d2VlbiB0aGlzIG5vdGVcbiAgICAgKiBhbmQgbm90ZSB3LCBpLmUuICB0aGlzIC0gdy4gIEZvciBleGFtcGxlLCBDNCAtIEE0ID0gMixcbiAgICAgKi9cbiAgICBwdWJsaWMgaW50IERpc3QoV2hpdGVOb3RlIHcpIHtcbiAgICAgICAgcmV0dXJuIChvY3RhdmUgLSB3Lm9jdGF2ZSkgKiA3ICsgKGxldHRlciAtIHcubGV0dGVyKTtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoaXMgbm90ZSBwbHVzIHRoZSBnaXZlbiBhbW91bnQgKGluIHdoaXRlIG5vdGVzKS5cbiAgICAgKiBUaGUgYW1vdW50IG1heSBiZSBwb3NpdGl2ZSBvciBuZWdhdGl2ZS4gIEZvciBleGFtcGxlLFxuICAgICAqIEE0ICsgMiA9IEM0LCBhbmQgQzQgKyAoLTIpID0gQTQuXG4gICAgICovXG4gICAgcHVibGljIFdoaXRlTm90ZSBBZGQoaW50IGFtb3VudCkge1xuICAgICAgICBpbnQgbnVtID0gb2N0YXZlICogNyArIGxldHRlcjtcbiAgICAgICAgbnVtICs9IGFtb3VudDtcbiAgICAgICAgaWYgKG51bSA8IDApIHtcbiAgICAgICAgICAgIG51bSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBXaGl0ZU5vdGUobnVtICUgNywgbnVtIC8gNyk7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgbWlkaSBub3RlIG51bWJlciBjb3JyZXNwb25kaW5nIHRvIHRoaXMgd2hpdGUgbm90ZS5cbiAgICAgKiBUaGUgbWlkaSBub3RlIG51bWJlcnMgY292ZXIgYWxsIGtleXMsIGluY2x1ZGluZyBzaGFycHMvZmxhdHMsXG4gICAgICogc28gZWFjaCBvY3RhdmUgaXMgMTIgbm90ZXMuICBNaWRkbGUgQyAoQzQpIGlzIDYwLiAgU29tZSBleGFtcGxlXG4gICAgICogbnVtYmVycyBmb3IgdmFyaW91cyBub3RlczpcbiAgICAgKlxuICAgICAqICBBIDIgPSAzM1xuICAgICAqICBBIzIgPSAzNFxuICAgICAqICBHIDIgPSA0M1xuICAgICAqICBHIzIgPSA0NCBcbiAgICAgKiAgQSAzID0gNDVcbiAgICAgKiAgQSA0ID0gNTdcbiAgICAgKiAgQSM0ID0gNThcbiAgICAgKiAgQiA0ID0gNTlcbiAgICAgKiAgQyA0ID0gNjBcbiAgICAgKi9cblxuICAgIHB1YmxpYyBpbnQgTnVtYmVyKCkge1xuICAgICAgICBpbnQgb2Zmc2V0ID0gMDtcbiAgICAgICAgc3dpdGNoIChsZXR0ZXIpIHtcbiAgICAgICAgICAgIGNhc2UgQTogb2Zmc2V0ID0gTm90ZVNjYWxlLkE7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBCOiBvZmZzZXQgPSBOb3RlU2NhbGUuQjsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEM6IG9mZnNldCA9IE5vdGVTY2FsZS5DOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgRDogb2Zmc2V0ID0gTm90ZVNjYWxlLkQ7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBFOiBvZmZzZXQgPSBOb3RlU2NhbGUuRTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEY6IG9mZnNldCA9IE5vdGVTY2FsZS5GOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgRzogb2Zmc2V0ID0gTm90ZVNjYWxlLkc7IGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDogb2Zmc2V0ID0gMDsgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE5vdGVTY2FsZS5Ub051bWJlcihvZmZzZXQsIG9jdGF2ZSk7XG4gICAgfVxuXG4gICAgLyoqIENvbXBhcmUgdGhlIHR3byBub3Rlcy4gIFJldHVyblxuICAgICAqICA8IDAgIGlmIHggaXMgbGVzcyAobG93ZXIpIHRoYW4geVxuICAgICAqICAgIDAgIGlmIHggaXMgZXF1YWwgdG8geVxuICAgICAqICA+IDAgIGlmIHggaXMgZ3JlYXRlciAoaGlnaGVyKSB0aGFuIHlcbiAgICAgKi9cbiAgICBwdWJsaWMgaW50IENvbXBhcmUoV2hpdGVOb3RlIHgsIFdoaXRlTm90ZSB5KSB7XG4gICAgICAgIHJldHVybiB4LkRpc3QoeSk7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgaGlnaGVyIG5vdGUsIHggb3IgeSAqL1xuICAgIHB1YmxpYyBzdGF0aWMgV2hpdGVOb3RlIE1heChXaGl0ZU5vdGUgeCwgV2hpdGVOb3RlIHkpIHtcbiAgICAgICAgaWYgKHguRGlzdCh5KSA+IDApXG4gICAgICAgICAgICByZXR1cm4geDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHk7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgbG93ZXIgbm90ZSwgeCBvciB5ICovXG4gICAgcHVibGljIHN0YXRpYyBXaGl0ZU5vdGUgTWluKFdoaXRlTm90ZSB4LCBXaGl0ZU5vdGUgeSkge1xuICAgICAgICBpZiAoeC5EaXN0KHkpIDwgMClcbiAgICAgICAgICAgIHJldHVybiB4O1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4geTtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSB0b3Agbm90ZSBpbiB0aGUgc3RhZmYgb2YgdGhlIGdpdmVuIGNsZWYgKi9cbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBUb3AoQ2xlZiBjbGVmKSB7XG4gICAgICAgIGlmIChjbGVmID09IENsZWYuVHJlYmxlKVxuICAgICAgICAgICAgcmV0dXJuIFRvcFRyZWJsZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIFRvcEJhc3M7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgYm90dG9tIG5vdGUgaW4gdGhlIHN0YWZmIG9mIHRoZSBnaXZlbiBjbGVmICovXG4gICAgcHVibGljIHN0YXRpYyBXaGl0ZU5vdGUgQm90dG9tKENsZWYgY2xlZikge1xuICAgICAgICBpZiAoY2xlZiA9PSBDbGVmLlRyZWJsZSlcbiAgICAgICAgICAgIHJldHVybiBCb3R0b21UcmVibGU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBCb3R0b21CYXNzO1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIHN0cmluZyA8bGV0dGVyPjxvY3RhdmU+IGZvciB0aGlzIG5vdGUuICovXG4gICAgcHVibGljIG92ZXJyaWRlIFxuICAgIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgc3RyaW5nW10gcyA9IHsgXCJBXCIsIFwiQlwiLCBcIkNcIiwgXCJEXCIsIFwiRVwiLCBcIkZcIiwgXCJHXCIgfTtcbiAgICAgICAgcmV0dXJuIHNbbGV0dGVyXSArIG9jdGF2ZTtcbiAgICB9XG59XG5cblxuXG59XG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgUGFpbnRFdmVudEFyZ3NcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgUmVjdGFuZ2xlIENsaXBSZWN0YW5nbGUgeyBnZXQ7IHNldDsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgR3JhcGhpY3MgR3JhcGhpY3MoKSB7IHJldHVybiBuZXcgR3JhcGhpY3MoXCJtYWluXCIpOyB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFBhbmVsXHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSBQb2ludCBhdXRvU2Nyb2xsUG9zaXRpb249bmV3IFBvaW50KDAsMCk7XHJcbiAgICAgICAgcHVibGljIFBvaW50IEF1dG9TY3JvbGxQb3NpdGlvbiB7IGdldCB7IHJldHVybiBhdXRvU2Nyb2xsUG9zaXRpb247IH0gc2V0IHsgYXV0b1Njcm9sbFBvc2l0aW9uID0gdmFsdWU7IH0gfVxyXG5cclxuICAgICAgICBwdWJsaWMgaW50IFdpZHRoO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgSGVpZ2h0O1xyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBzdGF0aWMgY2xhc3MgUGF0aFxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgc3RyaW5nIEdldEZpbGVOYW1lKHN0cmluZyBmaWxlbmFtZSkgeyByZXR1cm4gbnVsbDsgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBQZW5cclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgQ29sb3IgQ29sb3I7XHJcbiAgICAgICAgcHVibGljIGludCBXaWR0aDtcclxuICAgICAgICBwdWJsaWMgTGluZUNhcCBFbmRDYXA7XHJcblxyXG4gICAgICAgIHB1YmxpYyBQZW4oQ29sb3IgY29sb3IsIGludCB3aWR0aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIENvbG9yID0gY29sb3I7XHJcbiAgICAgICAgICAgIFdpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBQb2ludFxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBpbnQgWDtcclxuICAgICAgICBwdWJsaWMgaW50IFk7XHJcblxyXG4gICAgICAgIHB1YmxpYyBQb2ludChpbnQgeCwgaW50IHkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBYID0geDtcclxuICAgICAgICAgICAgWSA9IHk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBSZWN0YW5nbGVcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgaW50IFg7XHJcbiAgICAgICAgcHVibGljIGludCBZO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgV2lkdGg7XHJcbiAgICAgICAgcHVibGljIGludCBIZWlnaHQ7XHJcblxyXG4gICAgICAgIHB1YmxpYyBSZWN0YW5nbGUoaW50IHgsIGludCB5LCBpbnQgd2lkdGgsIGludCBoZWlnaHQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBYID0geDtcclxuICAgICAgICAgICAgWSA9IHk7XHJcbiAgICAgICAgICAgIFdpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgICAgIEhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG5cclxuICAgIC8qIEBjbGFzcyBTdGFmZlxyXG4gICAgICogVGhlIFN0YWZmIGlzIHVzZWQgdG8gZHJhdyBhIHNpbmdsZSBTdGFmZiAoYSByb3cgb2YgbWVhc3VyZXMpIGluIHRoZSBcclxuICAgICAqIFNoZWV0TXVzaWMgQ29udHJvbC4gQSBTdGFmZiBuZWVkcyB0byBkcmF3XHJcbiAgICAgKiAtIFRoZSBDbGVmXHJcbiAgICAgKiAtIFRoZSBrZXkgc2lnbmF0dXJlXHJcbiAgICAgKiAtIFRoZSBob3Jpem9udGFsIGxpbmVzXHJcbiAgICAgKiAtIEEgbGlzdCBvZiBNdXNpY1N5bWJvbHNcclxuICAgICAqIC0gVGhlIGxlZnQgYW5kIHJpZ2h0IHZlcnRpY2FsIGxpbmVzXHJcbiAgICAgKlxyXG4gICAgICogVGhlIGhlaWdodCBvZiB0aGUgU3RhZmYgaXMgZGV0ZXJtaW5lZCBieSB0aGUgbnVtYmVyIG9mIHBpeGVscyBlYWNoXHJcbiAgICAgKiBNdXNpY1N5bWJvbCBleHRlbmRzIGFib3ZlIGFuZCBiZWxvdyB0aGUgc3RhZmYuXHJcbiAgICAgKlxyXG4gICAgICogVGhlIHZlcnRpY2FsIGxpbmVzIChsZWZ0IGFuZCByaWdodCBzaWRlcykgb2YgdGhlIHN0YWZmIGFyZSBqb2luZWRcclxuICAgICAqIHdpdGggdGhlIHN0YWZmcyBhYm92ZSBhbmQgYmVsb3cgaXQsIHdpdGggb25lIGV4Y2VwdGlvbi4gIFxyXG4gICAgICogVGhlIGxhc3QgdHJhY2sgaXMgbm90IGpvaW5lZCB3aXRoIHRoZSBmaXJzdCB0cmFjay5cclxuICAgICAqL1xyXG5cclxuICAgIHB1YmxpYyBjbGFzcyBTdGFmZlxyXG4gICAge1xyXG4gICAgICAgIHByaXZhdGUgTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9sczsgIC8qKiBUaGUgbXVzaWMgc3ltYm9scyBpbiB0aGlzIHN0YWZmICovXHJcbiAgICAgICAgcHJpdmF0ZSBMaXN0PEx5cmljU3ltYm9sPiBseXJpY3M7ICAgLyoqIFRoZSBseXJpY3MgdG8gZGlzcGxheSAoY2FuIGJlIG51bGwpICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgeXRvcDsgICAgICAgICAgICAgICAgICAgLyoqIFRoZSB5IHBpeGVsIG9mIHRoZSB0b3Agb2YgdGhlIHN0YWZmICovXHJcbiAgICAgICAgcHJpdmF0ZSBDbGVmU3ltYm9sIGNsZWZzeW07ICAgICAgICAgLyoqIFRoZSBsZWZ0LXNpZGUgQ2xlZiBzeW1ib2wgKi9cclxuICAgICAgICBwcml2YXRlIEFjY2lkU3ltYm9sW10ga2V5czsgICAgICAgICAvKiogVGhlIGtleSBzaWduYXR1cmUgc3ltYm9scyAqL1xyXG4gICAgICAgIHByaXZhdGUgYm9vbCBzaG93TWVhc3VyZXM7ICAgICAgICAgIC8qKiBJZiB0cnVlLCBzaG93IHRoZSBtZWFzdXJlIG51bWJlcnMgKi9cclxuICAgICAgICBwcml2YXRlIGludCBrZXlzaWdXaWR0aDsgICAgICAgICAgICAvKiogVGhlIHdpZHRoIG9mIHRoZSBjbGVmIGFuZCBrZXkgc2lnbmF0dXJlICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgd2lkdGg7ICAgICAgICAgICAgICAgICAgLyoqIFRoZSB3aWR0aCBvZiB0aGUgc3RhZmYgaW4gcGl4ZWxzICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgaGVpZ2h0OyAgICAgICAgICAgICAgICAgLyoqIFRoZSBoZWlnaHQgb2YgdGhlIHN0YWZmIGluIHBpeGVscyAqL1xyXG4gICAgICAgIHByaXZhdGUgaW50IHRyYWNrbnVtOyAgICAgICAgICAgICAgIC8qKiBUaGUgdHJhY2sgdGhpcyBzdGFmZiByZXByZXNlbnRzICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgdG90YWx0cmFja3M7ICAgICAgICAgICAgLyoqIFRoZSB0b3RhbCBudW1iZXIgb2YgdHJhY2tzICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgc3RhcnR0aW1lOyAgICAgICAgICAgICAgLyoqIFRoZSB0aW1lIChpbiBwdWxzZXMpIG9mIGZpcnN0IHN5bWJvbCAqL1xyXG4gICAgICAgIHByaXZhdGUgaW50IGVuZHRpbWU7ICAgICAgICAgICAgICAgIC8qKiBUaGUgdGltZSAoaW4gcHVsc2VzKSBvZiBsYXN0IHN5bWJvbCAqL1xyXG4gICAgICAgIHByaXZhdGUgaW50IG1lYXN1cmVMZW5ndGg7ICAgICAgICAgIC8qKiBUaGUgdGltZSAoaW4gcHVsc2VzKSBvZiBhIG1lYXN1cmUgKi9cclxuXHJcbiAgICAgICAgLyoqIENyZWF0ZSBhIG5ldyBzdGFmZiB3aXRoIHRoZSBnaXZlbiBsaXN0IG9mIG11c2ljIHN5bWJvbHMsXG4gICAgICAgICAqIGFuZCB0aGUgZ2l2ZW4ga2V5IHNpZ25hdHVyZS4gIFRoZSBjbGVmIGlzIGRldGVybWluZWQgYnlcbiAgICAgICAgICogdGhlIGNsZWYgb2YgdGhlIGZpcnN0IGNob3JkIHN5bWJvbC4gVGhlIHRyYWNrIG51bWJlciBpcyB1c2VkXG4gICAgICAgICAqIHRvIGRldGVybWluZSB3aGV0aGVyIHRvIGpvaW4gdGhpcyBsZWZ0L3JpZ2h0IHZlcnRpY2FsIHNpZGVzXG4gICAgICAgICAqIHdpdGggdGhlIHN0YWZmcyBhYm92ZSBhbmQgYmVsb3cuIFRoZSBTaGVldE11c2ljT3B0aW9ucyBhcmUgdXNlZFxuICAgICAgICAgKiB0byBjaGVjayB3aGV0aGVyIHRvIGRpc3BsYXkgbWVhc3VyZSBudW1iZXJzIG9yIG5vdC5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIFN0YWZmKExpc3Q8TXVzaWNTeW1ib2w+IHN5bWJvbHMsIEtleVNpZ25hdHVyZSBrZXksXHJcbiAgICAgICAgICAgICAgICAgICAgIE1pZGlPcHRpb25zIG9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICAgICAgIGludCB0cmFja251bSwgaW50IHRvdGFsdHJhY2tzKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIGtleXNpZ1dpZHRoID0gU2hlZXRNdXNpYy5LZXlTaWduYXR1cmVXaWR0aChrZXkpO1xyXG4gICAgICAgICAgICB0aGlzLnRyYWNrbnVtID0gdHJhY2tudW07XHJcbiAgICAgICAgICAgIHRoaXMudG90YWx0cmFja3MgPSB0b3RhbHRyYWNrcztcclxuICAgICAgICAgICAgc2hvd01lYXN1cmVzID0gKG9wdGlvbnMuc2hvd01lYXN1cmVzICYmIHRyYWNrbnVtID09IDApO1xyXG4gICAgICAgICAgICBtZWFzdXJlTGVuZ3RoID0gb3B0aW9ucy50aW1lLk1lYXN1cmU7XHJcbiAgICAgICAgICAgIENsZWYgY2xlZiA9IEZpbmRDbGVmKHN5bWJvbHMpO1xyXG5cclxuICAgICAgICAgICAgY2xlZnN5bSA9IG5ldyBDbGVmU3ltYm9sKGNsZWYsIDAsIGZhbHNlKTtcclxuICAgICAgICAgICAga2V5cyA9IGtleS5HZXRTeW1ib2xzKGNsZWYpO1xyXG4gICAgICAgICAgICB0aGlzLnN5bWJvbHMgPSBzeW1ib2xzO1xyXG4gICAgICAgICAgICBDYWxjdWxhdGVXaWR0aChvcHRpb25zLnNjcm9sbFZlcnQpO1xyXG4gICAgICAgICAgICBDYWxjdWxhdGVIZWlnaHQoKTtcclxuICAgICAgICAgICAgQ2FsY3VsYXRlU3RhcnRFbmRUaW1lKCk7XHJcbiAgICAgICAgICAgIEZ1bGxKdXN0aWZ5KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogUmV0dXJuIHRoZSB3aWR0aCBvZiB0aGUgc3RhZmYgKi9cclxuICAgICAgICBwdWJsaWMgaW50IFdpZHRoXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gd2lkdGg7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBSZXR1cm4gdGhlIGhlaWdodCBvZiB0aGUgc3RhZmYgKi9cclxuICAgICAgICBwdWJsaWMgaW50IEhlaWdodFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIGhlaWdodDsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFJldHVybiB0aGUgdHJhY2sgbnVtYmVyIG9mIHRoaXMgc3RhZmYgKHN0YXJ0aW5nIGZyb20gMCAqL1xyXG4gICAgICAgIHB1YmxpYyBpbnQgVHJhY2tcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdldCB7IHJldHVybiB0cmFja251bTsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFJldHVybiB0aGUgc3RhcnRpbmcgdGltZSBvZiB0aGUgc3RhZmYsIHRoZSBzdGFydCB0aW1lIG9mXG4gICAgICAgICAqICB0aGUgZmlyc3Qgc3ltYm9sLiAgVGhpcyBpcyB1c2VkIGR1cmluZyBwbGF5YmFjaywgdG8gXG4gICAgICAgICAqICBhdXRvbWF0aWNhbGx5IHNjcm9sbCB0aGUgbXVzaWMgd2hpbGUgcGxheWluZy5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGludCBTdGFydFRpbWVcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdldCB7IHJldHVybiBzdGFydHRpbWU7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBSZXR1cm4gdGhlIGVuZGluZyB0aW1lIG9mIHRoZSBzdGFmZiwgdGhlIGVuZHRpbWUgb2ZcbiAgICAgICAgICogIHRoZSBsYXN0IHN5bWJvbC4gIFRoaXMgaXMgdXNlZCBkdXJpbmcgcGxheWJhY2ssIHRvIFxuICAgICAgICAgKiAgYXV0b21hdGljYWxseSBzY3JvbGwgdGhlIG11c2ljIHdoaWxlIHBsYXlpbmcuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBpbnQgRW5kVGltZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIGVuZHRpbWU7IH1cclxuICAgICAgICAgICAgc2V0IHsgZW5kdGltZSA9IHZhbHVlOyB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogRmluZCB0aGUgaW5pdGlhbCBjbGVmIHRvIHVzZSBmb3IgdGhpcyBzdGFmZi4gIFVzZSB0aGUgY2xlZiBvZlxuICAgICAgICAgKiB0aGUgZmlyc3QgQ2hvcmRTeW1ib2wuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgQ2xlZiBGaW5kQ2xlZihMaXN0PE11c2ljU3ltYm9sPiBsaXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yZWFjaCAoTXVzaWNTeW1ib2wgbSBpbiBsaXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAobSBpcyBDaG9yZFN5bWJvbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBDaG9yZFN5bWJvbCBjID0gKENob3JkU3ltYm9sKW07XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGMuQ2xlZjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gQ2xlZi5UcmVibGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogQ2FsY3VsYXRlIHRoZSBoZWlnaHQgb2YgdGhpcyBzdGFmZi4gIEVhY2ggTXVzaWNTeW1ib2wgY29udGFpbnMgdGhlXG4gICAgICAgICAqIG51bWJlciBvZiBwaXhlbHMgaXQgbmVlZHMgYWJvdmUgYW5kIGJlbG93IHRoZSBzdGFmZi4gIEdldCB0aGUgbWF4aW11bVxuICAgICAgICAgKiB2YWx1ZXMgYWJvdmUgYW5kIGJlbG93IHRoZSBzdGFmZi5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHZvaWQgQ2FsY3VsYXRlSGVpZ2h0KClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGludCBhYm92ZSA9IDA7XHJcbiAgICAgICAgICAgIGludCBiZWxvdyA9IDA7XHJcblxyXG4gICAgICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBzIGluIHN5bWJvbHMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGFib3ZlID0gTWF0aC5NYXgoYWJvdmUsIHMuQWJvdmVTdGFmZik7XHJcbiAgICAgICAgICAgICAgICBiZWxvdyA9IE1hdGguTWF4KGJlbG93LCBzLkJlbG93U3RhZmYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFib3ZlID0gTWF0aC5NYXgoYWJvdmUsIGNsZWZzeW0uQWJvdmVTdGFmZik7XHJcbiAgICAgICAgICAgIGJlbG93ID0gTWF0aC5NYXgoYmVsb3csIGNsZWZzeW0uQmVsb3dTdGFmZik7XHJcbiAgICAgICAgICAgIGlmIChzaG93TWVhc3VyZXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGFib3ZlID0gTWF0aC5NYXgoYWJvdmUsIFNoZWV0TXVzaWMuTm90ZUhlaWdodCAqIDMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHl0b3AgPSBhYm92ZSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcclxuICAgICAgICAgICAgaGVpZ2h0ID0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogNSArIHl0b3AgKyBiZWxvdztcclxuICAgICAgICAgICAgaWYgKGx5cmljcyAhPSBudWxsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgKz0gMTI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIEFkZCBzb21lIGV4dHJhIHZlcnRpY2FsIHNwYWNlIGJldHdlZW4gdGhlIGxhc3QgdHJhY2tcclxuICAgICAgICAgICAgICogYW5kIGZpcnN0IHRyYWNrLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgaWYgKHRyYWNrbnVtID09IHRvdGFsdHJhY2tzIC0gMSlcclxuICAgICAgICAgICAgICAgIGhlaWdodCArPSBTaGVldE11c2ljLk5vdGVIZWlnaHQgKiAzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIENhbGN1bGF0ZSB0aGUgd2lkdGggb2YgdGhpcyBzdGFmZiAqL1xyXG4gICAgICAgIHByaXZhdGUgdm9pZCBDYWxjdWxhdGVXaWR0aChib29sIHNjcm9sbFZlcnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoc2Nyb2xsVmVydClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgd2lkdGggPSBTaGVldE11c2ljLlBhZ2VXaWR0aDtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB3aWR0aCA9IGtleXNpZ1dpZHRoO1xyXG4gICAgICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBzIGluIHN5bWJvbHMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHdpZHRoICs9IHMuV2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogQ2FsY3VsYXRlIHRoZSBzdGFydCBhbmQgZW5kIHRpbWUgb2YgdGhpcyBzdGFmZi4gKi9cclxuICAgICAgICBwcml2YXRlIHZvaWQgQ2FsY3VsYXRlU3RhcnRFbmRUaW1lKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0YXJ0dGltZSA9IGVuZHRpbWUgPSAwO1xyXG4gICAgICAgICAgICBpZiAoc3ltYm9scy5Db3VudCA9PSAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3RhcnR0aW1lID0gc3ltYm9sc1swXS5TdGFydFRpbWU7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIG0gaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVuZHRpbWUgPCBtLlN0YXJ0VGltZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBlbmR0aW1lID0gbS5TdGFydFRpbWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAobSBpcyBDaG9yZFN5bWJvbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBDaG9yZFN5bWJvbCBjID0gKENob3JkU3ltYm9sKW07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVuZHRpbWUgPCBjLkVuZFRpbWUpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmR0aW1lID0gYy5FbmRUaW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBGdWxsLUp1c3RpZnkgdGhlIHN5bWJvbHMsIHNvIHRoYXQgdGhleSBleHBhbmQgdG8gZmlsbCB0aGUgd2hvbGUgc3RhZmYuICovXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIEZ1bGxKdXN0aWZ5KClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh3aWR0aCAhPSBTaGVldE11c2ljLlBhZ2VXaWR0aClcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGludCB0b3RhbHdpZHRoID0ga2V5c2lnV2lkdGg7XHJcbiAgICAgICAgICAgIGludCB0b3RhbHN5bWJvbHMgPSAwO1xyXG4gICAgICAgICAgICBpbnQgaSA9IDA7XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAoaSA8IHN5bWJvbHMuQ291bnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGludCBzdGFydCA9IHN5bWJvbHNbaV0uU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgdG90YWxzeW1ib2xzKys7XHJcbiAgICAgICAgICAgICAgICB0b3RhbHdpZHRoICs9IHN5bWJvbHNbaV0uV2lkdGg7XHJcbiAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoaSA8IHN5bWJvbHMuQ291bnQgJiYgc3ltYm9sc1tpXS5TdGFydFRpbWUgPT0gc3RhcnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdG90YWx3aWR0aCArPSBzeW1ib2xzW2ldLldpZHRoO1xyXG4gICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaW50IGV4dHJhd2lkdGggPSAoU2hlZXRNdXNpYy5QYWdlV2lkdGggLSB0b3RhbHdpZHRoIC0gMSkgLyB0b3RhbHN5bWJvbHM7XHJcbiAgICAgICAgICAgIGlmIChleHRyYXdpZHRoID4gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZXh0cmF3aWR0aCA9IFNoZWV0TXVzaWMuTm90ZUhlaWdodCAqIDI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaSA9IDA7XHJcbiAgICAgICAgICAgIHdoaWxlIChpIDwgc3ltYm9scy5Db3VudClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IHN0YXJ0ID0gc3ltYm9sc1tpXS5TdGFydFRpbWU7XHJcbiAgICAgICAgICAgICAgICBzeW1ib2xzW2ldLldpZHRoICs9IGV4dHJhd2lkdGg7XHJcbiAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoaSA8IHN5bWJvbHMuQ291bnQgJiYgc3ltYm9sc1tpXS5TdGFydFRpbWUgPT0gc3RhcnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIEFkZCB0aGUgbHlyaWMgc3ltYm9scyB0aGF0IG9jY3VyIHdpdGhpbiB0aGlzIHN0YWZmLlxuICAgICAgICAgKiAgU2V0IHRoZSB4LXBvc2l0aW9uIG9mIHRoZSBseXJpYyBzeW1ib2wuIFxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgdm9pZCBBZGRMeXJpY3MoTGlzdDxMeXJpY1N5bWJvbD4gdHJhY2tseXJpY3MpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodHJhY2tseXJpY3MgPT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGx5cmljcyA9IG5ldyBMaXN0PEx5cmljU3ltYm9sPigpO1xyXG4gICAgICAgICAgICBpbnQgeHBvcyA9IDA7XHJcbiAgICAgICAgICAgIGludCBzeW1ib2xpbmRleCA9IDA7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKEx5cmljU3ltYm9sIGx5cmljIGluIHRyYWNrbHlyaWNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAobHlyaWMuU3RhcnRUaW1lIDwgc3RhcnR0aW1lKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGx5cmljLlN0YXJ0VGltZSA+IGVuZHRpbWUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBHZXQgdGhlIHgtcG9zaXRpb24gb2YgdGhpcyBseXJpYyAqL1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKHN5bWJvbGluZGV4IDwgc3ltYm9scy5Db3VudCAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgIHN5bWJvbHNbc3ltYm9saW5kZXhdLlN0YXJ0VGltZSA8IGx5cmljLlN0YXJ0VGltZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB4cG9zICs9IHN5bWJvbHNbc3ltYm9saW5kZXhdLldpZHRoO1xyXG4gICAgICAgICAgICAgICAgICAgIHN5bWJvbGluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBseXJpYy5YID0geHBvcztcclxuICAgICAgICAgICAgICAgIGlmIChzeW1ib2xpbmRleCA8IHN5bWJvbHMuQ291bnQgJiZcclxuICAgICAgICAgICAgICAgICAgICAoc3ltYm9sc1tzeW1ib2xpbmRleF0gaXMgQmFyU3ltYm9sKSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBseXJpYy5YICs9IFNoZWV0TXVzaWMuTm90ZVdpZHRoO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbHlyaWNzLkFkZChseXJpYyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGx5cmljcy5Db3VudCA9PSAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBseXJpY3MgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIERyYXcgdGhlIGx5cmljcyAqL1xyXG4gICAgICAgIHByaXZhdGUgdm9pZCBEcmF3THlyaWNzKEdyYXBoaWNzIGcsIFBlbiBwZW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvKiBTa2lwIHRoZSBsZWZ0IHNpZGUgQ2xlZiBzeW1ib2wgYW5kIGtleSBzaWduYXR1cmUgKi9cclxuICAgICAgICAgICAgaW50IHhwb3MgPSBrZXlzaWdXaWR0aDtcclxuICAgICAgICAgICAgaW50IHlwb3MgPSBoZWlnaHQgLSAxMjtcclxuXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKEx5cmljU3ltYm9sIGx5cmljIGluIGx5cmljcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZy5EcmF3U3RyaW5nKGx5cmljLlRleHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5MZXR0ZXJGb250LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJydXNoZXMuQmxhY2ssXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHBvcyArIGx5cmljLlgsIHlwb3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogRHJhdyB0aGUgbWVhc3VyZSBudW1iZXJzIGZvciBlYWNoIG1lYXN1cmUgKi9cclxuICAgICAgICBwcml2YXRlIHZvaWQgRHJhd01lYXN1cmVOdW1iZXJzKEdyYXBoaWNzIGcsIFBlbiBwZW4pXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgLyogU2tpcCB0aGUgbGVmdCBzaWRlIENsZWYgc3ltYm9sIGFuZCBrZXkgc2lnbmF0dXJlICovXHJcbiAgICAgICAgICAgIGludCB4cG9zID0ga2V5c2lnV2lkdGg7XHJcbiAgICAgICAgICAgIGludCB5cG9zID0geXRvcCAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodCAqIDM7XHJcblxyXG4gICAgICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBzIGluIHN5bWJvbHMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzIGlzIEJhclN5bWJvbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnQgbWVhc3VyZSA9IDEgKyBzLlN0YXJ0VGltZSAvIG1lYXN1cmVMZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgZy5EcmF3U3RyaW5nKFwiXCIgKyBtZWFzdXJlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxldHRlckZvbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJydXNoZXMuQmxhY2ssXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhwb3MgKyBTaGVldE11c2ljLk5vdGVXaWR0aCAvIDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlwb3MpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgeHBvcyArPSBzLldpZHRoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogRHJhdyB0aGUgbHlyaWNzICovXHJcblxyXG5cclxuICAgICAgICAvKiogRHJhdyB0aGUgZml2ZSBob3Jpem9udGFsIGxpbmVzIG9mIHRoZSBzdGFmZiAqL1xyXG4gICAgICAgIHByaXZhdGUgdm9pZCBEcmF3SG9yaXpMaW5lcyhHcmFwaGljcyBnLCBQZW4gcGVuKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW50IGxpbmUgPSAxO1xyXG4gICAgICAgICAgICBpbnQgeSA9IHl0b3AgLSBTaGVldE11c2ljLkxpbmVXaWR0aDtcclxuICAgICAgICAgICAgcGVuLldpZHRoID0gMTtcclxuICAgICAgICAgICAgZm9yIChsaW5lID0gMTsgbGluZSA8PSA1OyBsaW5lKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCBTaGVldE11c2ljLkxlZnRNYXJnaW4sIHksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGggLSAxLCB5KTtcclxuICAgICAgICAgICAgICAgIHkgKz0gU2hlZXRNdXNpYy5MaW5lV2lkdGggKyBTaGVldE11c2ljLkxpbmVTcGFjZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwZW4uQ29sb3IgPSBDb2xvci5CbGFjaztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogRHJhdyB0aGUgdmVydGljYWwgbGluZXMgYXQgdGhlIGZhciBsZWZ0IGFuZCBmYXIgcmlnaHQgc2lkZXMuICovXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIERyYXdFbmRMaW5lcyhHcmFwaGljcyBnLCBQZW4gcGVuKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcGVuLldpZHRoID0gMTtcclxuXHJcbiAgICAgICAgICAgIC8qIERyYXcgdGhlIHZlcnRpY2FsIGxpbmVzIGZyb20gMCB0byB0aGUgaGVpZ2h0IG9mIHRoaXMgc3RhZmYsXHJcbiAgICAgICAgICAgICAqIGluY2x1ZGluZyB0aGUgc3BhY2UgYWJvdmUgYW5kIGJlbG93IHRoZSBzdGFmZiwgd2l0aCB0d28gZXhjZXB0aW9uczpcclxuICAgICAgICAgICAgICogLSBJZiB0aGlzIGlzIHRoZSBmaXJzdCB0cmFjaywgZG9uJ3Qgc3RhcnQgYWJvdmUgdGhlIHN0YWZmLlxyXG4gICAgICAgICAgICAgKiAgIFN0YXJ0IGV4YWN0bHkgYXQgdGhlIHRvcCBvZiB0aGUgc3RhZmYgKHl0b3AgLSBMaW5lV2lkdGgpXHJcbiAgICAgICAgICAgICAqIC0gSWYgdGhpcyBpcyB0aGUgbGFzdCB0cmFjaywgZG9uJ3QgZW5kIGJlbG93IHRoZSBzdGFmZi5cclxuICAgICAgICAgICAgICogICBFbmQgZXhhY3RseSBhdCB0aGUgYm90dG9tIG9mIHRoZSBzdGFmZi5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGludCB5c3RhcnQsIHllbmQ7XHJcbiAgICAgICAgICAgIGlmICh0cmFja251bSA9PSAwKVxyXG4gICAgICAgICAgICAgICAgeXN0YXJ0ID0geXRvcCAtIFNoZWV0TXVzaWMuTGluZVdpZHRoO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB5c3RhcnQgPSAwO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRyYWNrbnVtID09ICh0b3RhbHRyYWNrcyAtIDEpKVxyXG4gICAgICAgICAgICAgICAgeWVuZCA9IHl0b3AgKyA0ICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB5ZW5kID0gaGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIFNoZWV0TXVzaWMuTGVmdE1hcmdpbiwgeXN0YXJ0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5MZWZ0TWFyZ2luLCB5ZW5kKTtcclxuXHJcbiAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB3aWR0aCAtIDEsIHlzdGFydCwgd2lkdGggLSAxLCB5ZW5kKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogRHJhdyB0aGlzIHN0YWZmLiBPbmx5IGRyYXcgdGhlIHN5bWJvbHMgaW5zaWRlIHRoZSBjbGlwIGFyZWEgKi9cclxuICAgICAgICBwdWJsaWMgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFJlY3RhbmdsZSBjbGlwLCBQZW4gcGVuLCBpbnQgc2VsZWN0aW9uU3RhcnRQdWxzZSwgaW50IHNlbGVjdGlvbkVuZFB1bHNlLCBCcnVzaCBkZXNlbGVjdGVkQnJ1c2gpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvKiBTaGFkZSBhbnkgZGVzZWxlY3RlZCBhcmVhcyAqL1xyXG4gICAgICAgICAgICBTaGFkZVNlbGVjdGlvbkJhY2tncm91bmQoZywgY2xpcCwgc2VsZWN0aW9uU3RhcnRQdWxzZSwgc2VsZWN0aW9uRW5kUHVsc2UsIGRlc2VsZWN0ZWRCcnVzaCk7XHJcblxyXG4gICAgICAgICAgICBpbnQgeHBvcyA9IFNoZWV0TXVzaWMuTGVmdE1hcmdpbiArIDU7XHJcblxyXG4gICAgICAgICAgICAvKiBEcmF3IHRoZSBsZWZ0IHNpZGUgQ2xlZiBzeW1ib2wgKi9cclxuICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeHBvcywgMCk7XHJcbiAgICAgICAgICAgIGNsZWZzeW0uRHJhdyhnLCBwZW4sIHl0b3ApO1xyXG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgteHBvcywgMCk7XHJcbiAgICAgICAgICAgIHhwb3MgKz0gY2xlZnN5bS5XaWR0aDtcclxuXHJcbiAgICAgICAgICAgIC8qIERyYXcgdGhlIGtleSBzaWduYXR1cmUgKi9cclxuICAgICAgICAgICAgZm9yZWFjaCAoQWNjaWRTeW1ib2wgYSBpbiBrZXlzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSh4cG9zLCAwKTtcclxuICAgICAgICAgICAgICAgIGEuRHJhdyhnLCBwZW4sIHl0b3ApO1xyXG4gICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLXhwb3MsIDApO1xyXG4gICAgICAgICAgICAgICAgeHBvcyArPSBhLldpZHRoO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvKiBEcmF3IHRoZSBhY3R1YWwgbm90ZXMsIHJlc3RzLCBiYXJzLiAgRHJhdyB0aGUgc3ltYm9scyBvbmUgXHJcbiAgICAgICAgICAgICAqIGFmdGVyIGFub3RoZXIsIHVzaW5nIHRoZSBzeW1ib2wgd2lkdGggdG8gZGV0ZXJtaW5lIHRoZVxyXG4gICAgICAgICAgICAgKiB4IHBvc2l0aW9uIG9mIHRoZSBuZXh0IHN5bWJvbC5cclxuICAgICAgICAgICAgICpcclxuICAgICAgICAgICAgICogRm9yIGZhc3QgcGVyZm9ybWFuY2UsIG9ubHkgZHJhdyBzeW1ib2xzIHRoYXQgYXJlIGluIHRoZSBjbGlwIGFyZWEuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBzIGluIHN5bWJvbHMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChJbnNpZGVDbGlwcGluZyhjbGlwLCB4cG9zLCBzKSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSh4cG9zLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICBzLkRyYXcoZywgcGVuLCB5dG9wKTtcclxuICAgICAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgteHBvcywgMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB4cG9zICs9IHMuV2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgRHJhd0hvcml6TGluZXMoZywgcGVuKTtcclxuICAgICAgICAgICAgRHJhd0VuZExpbmVzKGcsIHBlbik7XHJcblxyXG4gICAgICAgICAgICBpZiAoc2hvd01lYXN1cmVzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBEcmF3TWVhc3VyZU51bWJlcnMoZywgcGVuKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobHlyaWNzICE9IG51bGwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIERyYXdMeXJpY3MoZywgcGVuKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBJZiBhIHNlbGVjdGlvbiBoYXMgYmVlbiBzcGVjaWZpZWQsIHNoYWRlIGFsbCBhcmVhcyB0aGF0IGFyZW4ndCBpbiB0aGUgc2VsZWN0aW9uXG4gICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIFNoYWRlU2VsZWN0aW9uQmFja2dyb3VuZChHcmFwaGljcyBnLCBSZWN0YW5nbGUgY2xpcCwgaW50IHNlbGVjdGlvblN0YXJ0UHVsc2UsIGludCBzZWxlY3Rpb25FbmRQdWxzZSwgQnJ1c2ggZGVzZWxlY3RlZEJydXNoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHNlbGVjdGlvbkVuZFB1bHNlID09IDApIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGludCB4cG9zID0ga2V5c2lnV2lkdGg7XHJcbiAgICAgICAgICAgIGJvb2wgbGFzdFN0YXRlRmlsbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBzIGluIHN5bWJvbHMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChJbnNpZGVDbGlwcGluZyhjbGlwLCB4cG9zLCBzKSAmJiAocy5TdGFydFRpbWUgPCBzZWxlY3Rpb25TdGFydFB1bHNlIHx8IHMuU3RhcnRUaW1lID4gc2VsZWN0aW9uRW5kUHVsc2UpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKHhwb3MgLSAyLCAtMik7XHJcbiAgICAgICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGRlc2VsZWN0ZWRCcnVzaCwgMCwgMCwgcy5XaWR0aCArIDQsIHRoaXMuSGVpZ2h0ICsgNCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLSh4cG9zIC0gMiksIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RTdGF0ZUZpbGwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RTdGF0ZUZpbGwgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHhwb3MgKz0gcy5XaWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobGFzdFN0YXRlRmlsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgLy9zaGFkZSB0aGUgcmVzdCBvZiB0aGUgc3RhZmYgaWYgdGhlIHByZXZpb3VzIHN5bWJvbCB3YXMgc2hhZGVkXHJcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSh4cG9zIC0gMiwgLTIpO1xyXG4gICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGRlc2VsZWN0ZWRCcnVzaCwgMCwgMCwgd2lkdGggLSB4cG9zLCB0aGlzLkhlaWdodCArIDQpO1xyXG4gICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLSh4cG9zIC0gMiksIDIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBib29sIEluc2lkZUNsaXBwaW5nKFJlY3RhbmdsZSBjbGlwLCBpbnQgeHBvcywgTXVzaWNTeW1ib2wgcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiAoeHBvcyA8PSBjbGlwLlggKyBjbGlwLldpZHRoICsgNTApICYmICh4cG9zICsgcy5XaWR0aCArIDUwID49IGNsaXAuWCk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIFNoYWRlIGFsbCB0aGUgY2hvcmRzIHBsYXllZCBpbiB0aGUgZ2l2ZW4gdGltZS5cbiAgICAgICAgICogIFVuLXNoYWRlIGFueSBjaG9yZHMgc2hhZGVkIGluIHRoZSBwcmV2aW91cyBwdWxzZSB0aW1lLlxuICAgICAgICAgKiAgU3RvcmUgdGhlIHggY29vcmRpbmF0ZSBsb2NhdGlvbiB3aGVyZSB0aGUgc2hhZGUgd2FzIGRyYXduLlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgYm9vbCBTaGFkZU5vdGVzKEdyYXBoaWNzIGcsIFNvbGlkQnJ1c2ggc2hhZGVCcnVzaCwgUGVuIHBlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGludCBjdXJyZW50UHVsc2VUaW1lLCBpbnQgcHJldlB1bHNlVGltZSwgcmVmIGludCB4X3NoYWRlKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIC8qIElmIHRoZXJlJ3Mgbm90aGluZyB0byB1bnNoYWRlLCBvciBzaGFkZSwgcmV0dXJuICovXHJcbiAgICAgICAgICAgIGlmICgoc3RhcnR0aW1lID4gcHJldlB1bHNlVGltZSB8fCBlbmR0aW1lIDwgcHJldlB1bHNlVGltZSkgJiZcclxuICAgICAgICAgICAgICAgIChzdGFydHRpbWUgPiBjdXJyZW50UHVsc2VUaW1lIHx8IGVuZHRpbWUgPCBjdXJyZW50UHVsc2VUaW1lKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvKiBTa2lwIHRoZSBsZWZ0IHNpZGUgQ2xlZiBzeW1ib2wgYW5kIGtleSBzaWduYXR1cmUgKi9cclxuICAgICAgICAgICAgaW50IHhwb3MgPSBrZXlzaWdXaWR0aDtcclxuXHJcbiAgICAgICAgICAgIE11c2ljU3ltYm9sIGN1cnIgPSBudWxsO1xyXG4gICAgICAgICAgICBDaG9yZFN5bWJvbCBwcmV2Q2hvcmQgPSBudWxsO1xyXG4gICAgICAgICAgICBpbnQgcHJldl94cG9zID0gMDtcclxuXHJcbiAgICAgICAgICAgIC8qIExvb3AgdGhyb3VnaCB0aGUgc3ltYm9scy4gXHJcbiAgICAgICAgICAgICAqIFVuc2hhZGUgc3ltYm9scyB3aGVyZSBzdGFydCA8PSBwcmV2UHVsc2VUaW1lIDwgZW5kXHJcbiAgICAgICAgICAgICAqIFNoYWRlIHN5bWJvbHMgd2hlcmUgc3RhcnQgPD0gY3VycmVudFB1bHNlVGltZSA8IGVuZFxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgYm9vbCBzaGFkZWROb3RlRm91bmQgPSBmYWxzZTtcclxuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBzeW1ib2xzLkNvdW50OyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGN1cnIgPSBzeW1ib2xzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnIgaXMgQmFyU3ltYm9sKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHhwb3MgKz0gY3Vyci5XaWR0aDtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpbnQgc3RhcnQgPSBjdXJyLlN0YXJ0VGltZTtcclxuICAgICAgICAgICAgICAgIGludCBlbmQgPSAwO1xyXG4gICAgICAgICAgICAgICAgaWYgKGkgKyAyIDwgc3ltYm9scy5Db3VudCAmJiBzeW1ib2xzW2kgKyAxXSBpcyBCYXJTeW1ib2wpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gc3ltYm9sc1tpICsgMl0uU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaSArIDEgPCBzeW1ib2xzLkNvdW50KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IHN5bWJvbHNbaSArIDFdLlN0YXJ0VGltZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBlbmQgPSBlbmR0aW1lO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAvKiBJZiB3ZSd2ZSBwYXN0IHRoZSBwcmV2aW91cyBhbmQgY3VycmVudCB0aW1lcywgd2UncmUgZG9uZS4gKi9cclxuICAgICAgICAgICAgICAgIGlmICgoc3RhcnQgPiBwcmV2UHVsc2VUaW1lKSAmJiAoc3RhcnQgPiBjdXJyZW50UHVsc2VUaW1lKSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoeF9zaGFkZSA9PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeF9zaGFkZSA9IHhwb3M7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2hhZGVkTm90ZUZvdW5kO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLyogSWYgc2hhZGVkIG5vdGVzIGFyZSB0aGUgc2FtZSwgd2UncmUgZG9uZSAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKChzdGFydCA8PSBjdXJyZW50UHVsc2VUaW1lKSAmJiAoY3VycmVudFB1bHNlVGltZSA8IGVuZCkgJiZcclxuICAgICAgICAgICAgICAgICAgICAoc3RhcnQgPD0gcHJldlB1bHNlVGltZSkgJiYgKHByZXZQdWxzZVRpbWUgPCBlbmQpKVxyXG4gICAgICAgICAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB4X3NoYWRlID0geHBvcztcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2hhZGVkTm90ZUZvdW5kO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8qIElmIHN5bWJvbCBpcyBpbiB0aGUgcHJldmlvdXMgdGltZSwgZHJhdyBhIHdoaXRlIGJhY2tncm91bmQgKi9cclxuICAgICAgICAgICAgICAgIGlmICgoc3RhcnQgPD0gcHJldlB1bHNlVGltZSkgJiYgKHByZXZQdWxzZVRpbWUgPCBlbmQpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKHhwb3MgLSAyLCAtMik7XHJcbiAgICAgICAgICAgICAgICAgICAgZy5DbGVhclJlY3RhbmdsZSgwLCAwLCBjdXJyLldpZHRoICsgNCwgdGhpcy5IZWlnaHQgKyA0KTtcclxuICAgICAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKHhwb3MgLSAyKSwgMik7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyogSWYgc3ltYm9sIGlzIGluIHRoZSBjdXJyZW50IHRpbWUsIGRyYXcgYSBzaGFkZWQgYmFja2dyb3VuZCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKChzdGFydCA8PSBjdXJyZW50UHVsc2VUaW1lKSAmJiAoY3VycmVudFB1bHNlVGltZSA8IGVuZCkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgeF9zaGFkZSA9IHhwb3M7XHJcbiAgICAgICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeHBvcywgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKHNoYWRlQnJ1c2gsIDAsIDAsIGN1cnIuV2lkdGgsIHRoaXMuSGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgteHBvcywgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hhZGVkTm90ZUZvdW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB4cG9zICs9IGN1cnIuV2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNoYWRlZE5vdGVGb3VuZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBSZXR1cm4gdGhlIHB1bHNlIHRpbWUgY29ycmVzcG9uZGluZyB0byB0aGUgZ2l2ZW4gcG9pbnQuXG4gICAgICAgICAqICBGaW5kIHRoZSBub3Rlcy9zeW1ib2xzIGNvcnJlc3BvbmRpbmcgdG8gdGhlIHggcG9zaXRpb24sXG4gICAgICAgICAqICBhbmQgcmV0dXJuIHRoZSBzdGFydFRpbWUgKHB1bHNlVGltZSkgb2YgdGhlIHN5bWJvbC5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGludCBQdWxzZVRpbWVGb3JQb2ludChQb2ludCBwb2ludClcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICBpbnQgeHBvcyA9IGtleXNpZ1dpZHRoO1xyXG4gICAgICAgICAgICBpbnQgcHVsc2VUaW1lID0gc3RhcnR0aW1lO1xyXG4gICAgICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBzeW0gaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcHVsc2VUaW1lID0gc3ltLlN0YXJ0VGltZTtcclxuICAgICAgICAgICAgICAgIGlmIChwb2ludC5YIDw9IHhwb3MgKyBzeW0uV2lkdGgpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHB1bHNlVGltZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHhwb3MgKz0gc3ltLldpZHRoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBwdWxzZVRpbWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgc3RyaW5nIFRvU3RyaW5nKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0cmluZyByZXN1bHQgPSBcIlN0YWZmIGNsZWY9XCIgKyBjbGVmc3ltLlRvU3RyaW5nKCkgKyBcIlxcblwiO1xyXG4gICAgICAgICAgICByZXN1bHQgKz0gXCIgIEtleXM6XFxuXCI7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKEFjY2lkU3ltYm9sIGEgaW4ga2V5cylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IFwiICAgIFwiICsgYS5Ub1N0cmluZygpICsgXCJcXG5cIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXN1bHQgKz0gXCIgIFN5bWJvbHM6XFxuXCI7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHMgaW4ga2V5cylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IFwiICAgIFwiICsgcy5Ub1N0cmluZygpICsgXCJcXG5cIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBtIGluIHN5bWJvbHMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBcIiAgICBcIiArIG0uVG9TdHJpbmcoKSArIFwiXFxuXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzdWx0ICs9IFwiRW5kIFN0YWZmXFxuXCI7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cbn1cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogQGNsYXNzIFN0ZW1cbiAqIFRoZSBTdGVtIGNsYXNzIGlzIHVzZWQgYnkgQ2hvcmRTeW1ib2wgdG8gZHJhdyB0aGUgc3RlbSBwb3J0aW9uIG9mXG4gKiB0aGUgY2hvcmQuICBUaGUgc3RlbSBoYXMgdGhlIGZvbGxvd2luZyBmaWVsZHM6XG4gKlxuICogZHVyYXRpb24gIC0gVGhlIGR1cmF0aW9uIG9mIHRoZSBzdGVtLlxuICogZGlyZWN0aW9uIC0gRWl0aGVyIFVwIG9yIERvd25cbiAqIHNpZGUgICAgICAtIEVpdGhlciBsZWZ0IG9yIHJpZ2h0XG4gKiB0b3AgICAgICAgLSBUaGUgdG9wbW9zdCBub3RlIGluIHRoZSBjaG9yZFxuICogYm90dG9tICAgIC0gVGhlIGJvdHRvbW1vc3Qgbm90ZSBpbiB0aGUgY2hvcmRcbiAqIGVuZCAgICAgICAtIFRoZSBub3RlIHBvc2l0aW9uIHdoZXJlIHRoZSBzdGVtIGVuZHMuICBUaGlzIGlzIHVzdWFsbHlcbiAqICAgICAgICAgICAgIHNpeCBub3RlcyBwYXN0IHRoZSBsYXN0IG5vdGUgaW4gdGhlIGNob3JkLiAgRm9yIDh0aC8xNnRoXG4gKiAgICAgICAgICAgICBub3RlcywgdGhlIHN0ZW0gbXVzdCBleHRlbmQgZXZlbiBtb3JlLlxuICpcbiAqIFRoZSBTaGVldE11c2ljIGNsYXNzIGNhbiBjaGFuZ2UgdGhlIGRpcmVjdGlvbiBvZiBhIHN0ZW0gYWZ0ZXIgaXRcbiAqIGhhcyBiZWVuIGNyZWF0ZWQuICBUaGUgc2lkZSBhbmQgZW5kIGZpZWxkcyBtYXkgYWxzbyBjaGFuZ2UgZHVlIHRvXG4gKiB0aGUgZGlyZWN0aW9uIGNoYW5nZS4gIEJ1dCBvdGhlciBmaWVsZHMgd2lsbCBub3QgY2hhbmdlLlxuICovXG4gXG5wdWJsaWMgY2xhc3MgU3RlbSB7XG4gICAgcHVibGljIGNvbnN0IGludCBVcCA9ICAgMTsgICAgICAvKiBUaGUgc3RlbSBwb2ludHMgdXAgKi9cbiAgICBwdWJsaWMgY29uc3QgaW50IERvd24gPSAyOyAgICAgIC8qIFRoZSBzdGVtIHBvaW50cyBkb3duICovXG4gICAgcHVibGljIGNvbnN0IGludCBMZWZ0U2lkZSA9IDE7ICAvKiBUaGUgc3RlbSBpcyB0byB0aGUgbGVmdCBvZiB0aGUgbm90ZSAqL1xuICAgIHB1YmxpYyBjb25zdCBpbnQgUmlnaHRTaWRlID0gMjsgLyogVGhlIHN0ZW0gaXMgdG8gdGhlIHJpZ2h0IG9mIHRoZSBub3RlICovXG5cbiAgICBwcml2YXRlIE5vdGVEdXJhdGlvbiBkdXJhdGlvbjsgLyoqIER1cmF0aW9uIG9mIHRoZSBzdGVtLiAqL1xuICAgIHByaXZhdGUgaW50IGRpcmVjdGlvbjsgICAgICAgICAvKiogVXAsIERvd24sIG9yIE5vbmUgKi9cbiAgICBwcml2YXRlIFdoaXRlTm90ZSB0b3A7ICAgICAgICAgLyoqIFRvcG1vc3Qgbm90ZSBpbiBjaG9yZCAqL1xuICAgIHByaXZhdGUgV2hpdGVOb3RlIGJvdHRvbTsgICAgICAvKiogQm90dG9tbW9zdCBub3RlIGluIGNob3JkICovXG4gICAgcHJpdmF0ZSBXaGl0ZU5vdGUgZW5kOyAgICAgICAgIC8qKiBMb2NhdGlvbiBvZiBlbmQgb2YgdGhlIHN0ZW0gKi9cbiAgICBwcml2YXRlIGJvb2wgbm90ZXNvdmVybGFwOyAgICAgLyoqIERvIHRoZSBjaG9yZCBub3RlcyBvdmVybGFwICovXG4gICAgcHJpdmF0ZSBpbnQgc2lkZTsgICAgICAgICAgICAgIC8qKiBMZWZ0IHNpZGUgb3IgcmlnaHQgc2lkZSBvZiBub3RlICovXG5cbiAgICBwcml2YXRlIFN0ZW0gcGFpcjsgICAgICAgICAgICAgIC8qKiBJZiBwYWlyICE9IG51bGwsIHRoaXMgaXMgYSBob3Jpem9udGFsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogYmVhbSBzdGVtIHRvIGFub3RoZXIgY2hvcmQgKi9cbiAgICBwcml2YXRlIGludCB3aWR0aF90b19wYWlyOyAgICAgIC8qKiBUaGUgd2lkdGggKGluIHBpeGVscykgdG8gdGhlIGNob3JkIHBhaXIgKi9cbiAgICBwcml2YXRlIGJvb2wgcmVjZWl2ZXJfaW5fcGFpcjsgIC8qKiBUaGlzIHN0ZW0gaXMgdGhlIHJlY2VpdmVyIG9mIGEgaG9yaXpvbnRhbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBiZWFtIHN0ZW0gZnJvbSBhbm90aGVyIGNob3JkLiAqL1xuXG4gICAgLyoqIEdldC9TZXQgdGhlIGRpcmVjdGlvbiBvZiB0aGUgc3RlbSAoVXAgb3IgRG93bikgKi9cbiAgICBwdWJsaWMgaW50IERpcmVjdGlvbiB7XG4gICAgICAgIGdldCB7IHJldHVybiBkaXJlY3Rpb247IH1cbiAgICAgICAgc2V0IHsgQ2hhbmdlRGlyZWN0aW9uKHZhbHVlKTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIGR1cmF0aW9uIG9mIHRoZSBzdGVtIChFaWd0aCwgU2l4dGVlbnRoLCBUaGlydHlTZWNvbmQpICovXG4gICAgcHVibGljIE5vdGVEdXJhdGlvbiBEdXJhdGlvbiB7XG4gICAgICAgIGdldCB7IHJldHVybiBkdXJhdGlvbjsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIHRvcCBub3RlIGluIHRoZSBjaG9yZC4gVGhpcyBpcyBuZWVkZWQgdG8gZGV0ZXJtaW5lIHRoZSBzdGVtIGRpcmVjdGlvbiAqL1xuICAgIHB1YmxpYyBXaGl0ZU5vdGUgVG9wIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHRvcDsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIGJvdHRvbSBub3RlIGluIHRoZSBjaG9yZC4gVGhpcyBpcyBuZWVkZWQgdG8gZGV0ZXJtaW5lIHRoZSBzdGVtIGRpcmVjdGlvbiAqL1xuICAgIHB1YmxpYyBXaGl0ZU5vdGUgQm90dG9tIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIGJvdHRvbTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQvU2V0IHRoZSBsb2NhdGlvbiB3aGVyZSB0aGUgc3RlbSBlbmRzLiAgVGhpcyBpcyB1c3VhbGx5IHNpeCBub3Rlc1xuICAgICAqIHBhc3QgdGhlIGxhc3Qgbm90ZSBpbiB0aGUgY2hvcmQuIFNlZSBtZXRob2QgQ2FsY3VsYXRlRW5kLlxuICAgICAqL1xuICAgIHB1YmxpYyBXaGl0ZU5vdGUgRW5kIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIGVuZDsgfVxuICAgICAgICBzZXQgeyBlbmQgPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIC8qKiBTZXQgdGhpcyBTdGVtIHRvIGJlIHRoZSByZWNlaXZlciBvZiBhIGhvcml6b250YWwgYmVhbSwgYXMgcGFydFxuICAgICAqIG9mIGEgY2hvcmQgcGFpci4gIEluIERyYXcoKSwgaWYgdGhpcyBzdGVtIGlzIGEgcmVjZWl2ZXIsIHdlXG4gICAgICogZG9uJ3QgZHJhdyBhIGN1cnZ5IHN0ZW0sIHdlIG9ubHkgZHJhdyB0aGUgdmVydGljYWwgbGluZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgYm9vbCBSZWNlaXZlciB7XG4gICAgICAgIGdldCB7IHJldHVybiByZWNlaXZlcl9pbl9wYWlyOyB9XG4gICAgICAgIHNldCB7IHJlY2VpdmVyX2luX3BhaXIgPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIC8qKiBDcmVhdGUgYSBuZXcgc3RlbS4gIFRoZSB0b3Agbm90ZSwgYm90dG9tIG5vdGUsIGFuZCBkaXJlY3Rpb24gYXJlIFxuICAgICAqIG5lZWRlZCBmb3IgZHJhd2luZyB0aGUgdmVydGljYWwgbGluZSBvZiB0aGUgc3RlbS4gIFRoZSBkdXJhdGlvbiBpcyBcbiAgICAgKiBuZWVkZWQgdG8gZHJhdyB0aGUgdGFpbCBvZiB0aGUgc3RlbS4gIFRoZSBvdmVybGFwIGJvb2xlYW4gaXMgdHJ1ZVxuICAgICAqIGlmIHRoZSBub3RlcyBpbiB0aGUgY2hvcmQgb3ZlcmxhcC4gIElmIHRoZSBub3RlcyBvdmVybGFwLCB0aGVcbiAgICAgKiBzdGVtIG11c3QgYmUgZHJhd24gb24gdGhlIHJpZ2h0IHNpZGUuXG4gICAgICovXG4gICAgcHVibGljIFN0ZW0oV2hpdGVOb3RlIGJvdHRvbSwgV2hpdGVOb3RlIHRvcCwgXG4gICAgICAgICAgICAgICAgTm90ZUR1cmF0aW9uIGR1cmF0aW9uLCBpbnQgZGlyZWN0aW9uLCBib29sIG92ZXJsYXApIHtcblxuICAgICAgICB0aGlzLnRvcCA9IHRvcDtcbiAgICAgICAgdGhpcy5ib3R0b20gPSBib3R0b207XG4gICAgICAgIHRoaXMuZHVyYXRpb24gPSBkdXJhdGlvbjtcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XG4gICAgICAgIHRoaXMubm90ZXNvdmVybGFwID0gb3ZlcmxhcDtcbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PSBVcCB8fCBub3Rlc292ZXJsYXApXG4gICAgICAgICAgICBzaWRlID0gUmlnaHRTaWRlO1xuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgc2lkZSA9IExlZnRTaWRlO1xuICAgICAgICBlbmQgPSBDYWxjdWxhdGVFbmQoKTtcbiAgICAgICAgcGFpciA9IG51bGw7XG4gICAgICAgIHdpZHRoX3RvX3BhaXIgPSAwO1xuICAgICAgICByZWNlaXZlcl9pbl9wYWlyID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqIENhbGN1bGF0ZSB0aGUgdmVydGljYWwgcG9zaXRpb24gKHdoaXRlIG5vdGUga2V5KSB3aGVyZSBcbiAgICAgKiB0aGUgc3RlbSBlbmRzIFxuICAgICAqL1xuICAgIHB1YmxpYyBXaGl0ZU5vdGUgQ2FsY3VsYXRlRW5kKCkge1xuICAgICAgICBpZiAoZGlyZWN0aW9uID09IFVwKSB7XG4gICAgICAgICAgICBXaGl0ZU5vdGUgdyA9IHRvcDtcbiAgICAgICAgICAgIHcgPSB3LkFkZCg2KTtcbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uU2l4dGVlbnRoKSB7XG4gICAgICAgICAgICAgICAgdyA9IHcuQWRkKDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRoaXJ0eVNlY29uZCkge1xuICAgICAgICAgICAgICAgIHcgPSB3LkFkZCg0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB3O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRpcmVjdGlvbiA9PSBEb3duKSB7XG4gICAgICAgICAgICBXaGl0ZU5vdGUgdyA9IGJvdHRvbTtcbiAgICAgICAgICAgIHcgPSB3LkFkZCgtNik7XG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCkge1xuICAgICAgICAgICAgICAgIHcgPSB3LkFkZCgtMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG4gICAgICAgICAgICAgICAgdyA9IHcuQWRkKC00KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB3O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7ICAvKiBTaG91bGRuJ3QgaGFwcGVuICovXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogQ2hhbmdlIHRoZSBkaXJlY3Rpb24gb2YgdGhlIHN0ZW0uICBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBieSBcbiAgICAgKiBDaG9yZFN5bWJvbC5NYWtlUGFpcigpLiAgV2hlbiB0d28gY2hvcmRzIGFyZSBqb2luZWQgYnkgYSBob3Jpem9udGFsXG4gICAgICogYmVhbSwgdGhlaXIgc3RlbXMgbXVzdCBwb2ludCBpbiB0aGUgc2FtZSBkaXJlY3Rpb24gKHVwIG9yIGRvd24pLlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIENoYW5nZURpcmVjdGlvbihpbnQgbmV3ZGlyZWN0aW9uKSB7XG4gICAgICAgIGRpcmVjdGlvbiA9IG5ld2RpcmVjdGlvbjtcbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PSBVcCB8fCBub3Rlc292ZXJsYXApXG4gICAgICAgICAgICBzaWRlID0gUmlnaHRTaWRlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBzaWRlID0gTGVmdFNpZGU7XG4gICAgICAgIGVuZCA9IENhbGN1bGF0ZUVuZCgpO1xuICAgIH1cblxuICAgIC8qKiBQYWlyIHRoaXMgc3RlbSB3aXRoIGFub3RoZXIgQ2hvcmQuICBJbnN0ZWFkIG9mIGRyYXdpbmcgYSBjdXJ2eSB0YWlsLFxuICAgICAqIHRoaXMgc3RlbSB3aWxsIG5vdyBoYXZlIHRvIGRyYXcgYSBiZWFtIHRvIHRoZSBnaXZlbiBzdGVtIHBhaXIuICBUaGVcbiAgICAgKiB3aWR0aCAoaW4gcGl4ZWxzKSB0byB0aGlzIHN0ZW0gcGFpciBpcyBwYXNzZWQgYXMgYXJndW1lbnQuXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgU2V0UGFpcihTdGVtIHBhaXIsIGludCB3aWR0aF90b19wYWlyKSB7XG4gICAgICAgIHRoaXMucGFpciA9IHBhaXI7XG4gICAgICAgIHRoaXMud2lkdGhfdG9fcGFpciA9IHdpZHRoX3RvX3BhaXI7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0cnVlIGlmIHRoaXMgU3RlbSBpcyBwYXJ0IG9mIGEgaG9yaXpvbnRhbCBiZWFtLiAqL1xuICAgIHB1YmxpYyBib29sIGlzQmVhbSB7XG4gICAgICAgIGdldCB7IHJldHVybiByZWNlaXZlcl9pbl9wYWlyIHx8IChwYWlyICE9IG51bGwpOyB9XG4gICAgfVxuXG4gICAgLyoqIERyYXcgdGhpcyBzdGVtLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5IGxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKiBAcGFyYW0gdG9wc3RhZmYgIFRoZSBub3RlIGF0IHRoZSB0b3Agb2YgdGhlIHN0YWZmLlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIERyYXcoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3AsIFdoaXRlTm90ZSB0b3BzdGFmZikge1xuICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLldob2xlKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIERyYXdWZXJ0aWNhbExpbmUoZywgcGVuLCB5dG9wLCB0b3BzdGFmZik7XG4gICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uUXVhcnRlciB8fCBcbiAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRRdWFydGVyIHx8IFxuICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkhhbGYgfHxcbiAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRIYWxmIHx8XG4gICAgICAgICAgICByZWNlaXZlcl9pbl9wYWlyKSB7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYWlyICE9IG51bGwpXG4gICAgICAgICAgICBEcmF3SG9yaXpCYXJTdGVtKGcsIHBlbiwgeXRvcCwgdG9wc3RhZmYpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBEcmF3Q3VydnlTdGVtKGcsIHBlbiwgeXRvcCwgdG9wc3RhZmYpO1xuICAgIH1cblxuICAgIC8qKiBEcmF3IHRoZSB2ZXJ0aWNhbCBsaW5lIG9mIHRoZSBzdGVtIFxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5IGxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKiBAcGFyYW0gdG9wc3RhZmYgIFRoZSBub3RlIGF0IHRoZSB0b3Agb2YgdGhlIHN0YWZmLlxuICAgICAqL1xuICAgIHByaXZhdGUgdm9pZCBEcmF3VmVydGljYWxMaW5lKEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wLCBXaGl0ZU5vdGUgdG9wc3RhZmYpIHtcbiAgICAgICAgaW50IHhzdGFydDtcbiAgICAgICAgaWYgKHNpZGUgPT0gTGVmdFNpZGUpXG4gICAgICAgICAgICB4c3RhcnQgPSBTaGVldE11c2ljLkxpbmVTcGFjZS80ICsgMTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgeHN0YXJ0ID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCArIFNoZWV0TXVzaWMuTm90ZVdpZHRoO1xuXG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT0gVXApIHtcbiAgICAgICAgICAgIGludCB5MSA9IHl0b3AgKyB0b3BzdGFmZi5EaXN0KGJvdHRvbSkgKiBTaGVldE11c2ljLk5vdGVIZWlnaHQvMiBcbiAgICAgICAgICAgICAgICAgICAgICAgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQvNDtcblxuICAgICAgICAgICAgaW50IHlzdGVtID0geXRvcCArIHRvcHN0YWZmLkRpc3QoZW5kKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG4gICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5MSwgeHN0YXJ0LCB5c3RlbSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGlyZWN0aW9uID09IERvd24pIHtcbiAgICAgICAgICAgIGludCB5MSA9IHl0b3AgKyB0b3BzdGFmZi5EaXN0KHRvcCkgKiBTaGVldE11c2ljLk5vdGVIZWlnaHQvMiBcbiAgICAgICAgICAgICAgICAgICAgICAgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG5cbiAgICAgICAgICAgIGlmIChzaWRlID09IExlZnRTaWRlKVxuICAgICAgICAgICAgICAgIHkxID0geTEgLSBTaGVldE11c2ljLk5vdGVIZWlnaHQvNDtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB5MSA9IHkxIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG5cbiAgICAgICAgICAgIGludCB5c3RlbSA9IHl0b3AgKyB0b3BzdGFmZi5EaXN0KGVuZCkgKiBTaGVldE11c2ljLk5vdGVIZWlnaHQvMiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG5cbiAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHkxLCB4c3RhcnQsIHlzdGVtKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBEcmF3IGEgY3Vydnkgc3RlbSB0YWlsLiAgVGhpcyBpcyBvbmx5IHVzZWQgZm9yIHNpbmdsZSBjaG9yZHMsIG5vdCBjaG9yZCBwYWlycy5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeSBsb2NhdGlvbiAoaW4gcGl4ZWxzKSB3aGVyZSB0aGUgdG9wIG9mIHRoZSBzdGFmZiBzdGFydHMuXG4gICAgICogQHBhcmFtIHRvcHN0YWZmICBUaGUgbm90ZSBhdCB0aGUgdG9wIG9mIHRoZSBzdGFmZi5cbiAgICAgKi9cbiAgICBwcml2YXRlIHZvaWQgRHJhd0N1cnZ5U3RlbShHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCwgV2hpdGVOb3RlIHRvcHN0YWZmKSB7XG5cbiAgICAgICAgcGVuLldpZHRoID0gMjtcblxuICAgICAgICBpbnQgeHN0YXJ0ID0gMDtcbiAgICAgICAgaWYgKHNpZGUgPT0gTGVmdFNpZGUpXG4gICAgICAgICAgICB4c3RhcnQgPSBTaGVldE11c2ljLkxpbmVTcGFjZS80ICsgMTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgeHN0YXJ0ID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCArIFNoZWV0TXVzaWMuTm90ZVdpZHRoO1xuXG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT0gVXApIHtcbiAgICAgICAgICAgIGludCB5c3RlbSA9IHl0b3AgKyB0b3BzdGFmZi5EaXN0KGVuZCkgKiBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcblxuXG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkVpZ2h0aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVHJpcGxldCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG5cbiAgICAgICAgICAgICAgICBnLkRyYXdCZXppZXIocGVuLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCB5c3RlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gKyAzKlNoZWV0TXVzaWMuTGluZVNwYWNlLzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlKjIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZS8yLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gKyBTaGVldE11c2ljLk5vdGVIZWlnaHQqMyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB5c3RlbSArPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG5cbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uU2l4dGVlbnRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRoaXJ0eVNlY29uZCkge1xuXG4gICAgICAgICAgICAgICAgZy5EcmF3QmV6aWVyKHBlbiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgeXN0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtICsgMypTaGVldE11c2ljLkxpbmVTcGFjZS8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZSoyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gKyBTaGVldE11c2ljLk5vdGVIZWlnaHQqMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB5c3RlbSArPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRoaXJ0eVNlY29uZCkge1xuICAgICAgICAgICAgICAgIGcuRHJhd0JlemllcihwZW4sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIHlzdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSArIDMqU2hlZXRNdXNpYy5MaW5lU3BhY2UvMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UqMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCozKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgZWxzZSBpZiAoZGlyZWN0aW9uID09IERvd24pIHtcbiAgICAgICAgICAgIGludCB5c3RlbSA9IHl0b3AgKyB0b3BzdGFmZi5EaXN0KGVuZCkqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuXG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkVpZ2h0aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVHJpcGxldCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG5cbiAgICAgICAgICAgICAgICBnLkRyYXdCZXppZXIocGVuLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCB5c3RlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gLSBTaGVldE11c2ljLkxpbmVTcGFjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UqMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gLSBTaGVldE11c2ljLk5vdGVIZWlnaHQqMiAtIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeXN0ZW0gLT0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuXG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0JlemllcihwZW4sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIHlzdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZSoyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gLSBTaGVldE11c2ljLk5vdGVIZWlnaHQqMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyIC0gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHlzdGVtIC09IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG4gICAgICAgICAgICAgICAgZy5EcmF3QmV6aWVyKHBlbiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgeXN0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlKjIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIgLSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxpbmVTcGFjZS8yKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG5cbiAgICB9XG5cbiAgICAvKiBEcmF3IGEgaG9yaXpvbnRhbCBiZWFtIHN0ZW0sIGNvbm5lY3RpbmcgdGhpcyBzdGVtIHdpdGggdGhlIFN0ZW0gcGFpci5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeSBsb2NhdGlvbiAoaW4gcGl4ZWxzKSB3aGVyZSB0aGUgdG9wIG9mIHRoZSBzdGFmZiBzdGFydHMuXG4gICAgICogQHBhcmFtIHRvcHN0YWZmICBUaGUgbm90ZSBhdCB0aGUgdG9wIG9mIHRoZSBzdGFmZi5cbiAgICAgKi9cbiAgICBwcml2YXRlIHZvaWQgRHJhd0hvcml6QmFyU3RlbShHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCwgV2hpdGVOb3RlIHRvcHN0YWZmKSB7XG4gICAgICAgIHBlbi5XaWR0aCA9IFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG4gICAgICAgIGludCB4c3RhcnQgPSAwO1xuICAgICAgICBpbnQgeHN0YXJ0MiA9IDA7XG5cbiAgICAgICAgaWYgKHNpZGUgPT0gTGVmdFNpZGUpXG4gICAgICAgICAgICB4c3RhcnQgPSBTaGVldE11c2ljLkxpbmVTcGFjZS80ICsgMTtcbiAgICAgICAgZWxzZSBpZiAoc2lkZSA9PSBSaWdodFNpZGUpXG4gICAgICAgICAgICB4c3RhcnQgPSBTaGVldE11c2ljLkxpbmVTcGFjZS80ICsgU2hlZXRNdXNpYy5Ob3RlV2lkdGg7XG5cbiAgICAgICAgaWYgKHBhaXIuc2lkZSA9PSBMZWZ0U2lkZSlcbiAgICAgICAgICAgIHhzdGFydDIgPSBTaGVldE11c2ljLkxpbmVTcGFjZS80ICsgMTtcbiAgICAgICAgZWxzZSBpZiAocGFpci5zaWRlID09IFJpZ2h0U2lkZSlcbiAgICAgICAgICAgIHhzdGFydDIgPSBTaGVldE11c2ljLkxpbmVTcGFjZS80ICsgU2hlZXRNdXNpYy5Ob3RlV2lkdGg7XG5cblxuICAgICAgICBpZiAoZGlyZWN0aW9uID09IFVwKSB7XG4gICAgICAgICAgICBpbnQgeGVuZCA9IHdpZHRoX3RvX3BhaXIgKyB4c3RhcnQyO1xuICAgICAgICAgICAgaW50IHlzdGFydCA9IHl0b3AgKyB0b3BzdGFmZi5EaXN0KGVuZCkgKiBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcbiAgICAgICAgICAgIGludCB5ZW5kID0geXRvcCArIHRvcHN0YWZmLkRpc3QocGFpci5lbmQpICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG5cbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRWlnaHRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCB8fCBcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVHJpcGxldCB8fCBcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uU2l4dGVlbnRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRoaXJ0eVNlY29uZCkge1xuXG4gICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeXN0YXJ0LCB4ZW5kLCB5ZW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHlzdGFydCArPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICB5ZW5kICs9IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcblxuICAgICAgICAgICAgLyogQSBkb3R0ZWQgZWlnaHRoIHdpbGwgY29ubmVjdCB0byBhIDE2dGggbm90ZS4gKi9cbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoKSB7XG4gICAgICAgICAgICAgICAgaW50IHggPSB4ZW5kIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgICAgIGRvdWJsZSBzbG9wZSA9ICh5ZW5kIC0geXN0YXJ0KSAqIDEuMCAvICh4ZW5kIC0geHN0YXJ0KTtcbiAgICAgICAgICAgICAgICBpbnQgeSA9IChpbnQpKHNsb3BlICogKHggLSB4ZW5kKSArIHllbmQpOyBcblxuICAgICAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4LCB5LCB4ZW5kLCB5ZW5kKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG5cbiAgICAgICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5c3RhcnQsIHhlbmQsIHllbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeXN0YXJ0ICs9IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgIHllbmQgKz0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRoaXJ0eVNlY29uZCkge1xuICAgICAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHlzdGFydCwgeGVuZCwgeWVuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGludCB4ZW5kID0gd2lkdGhfdG9fcGFpciArIHhzdGFydDI7XG4gICAgICAgICAgICBpbnQgeXN0YXJ0ID0geXRvcCArIHRvcHN0YWZmLkRpc3QoZW5kKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yICsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgaW50IHllbmQgPSB5dG9wICsgdG9wc3RhZmYuRGlzdChwYWlyLmVuZCkgKiBTaGVldE11c2ljLk5vdGVIZWlnaHQvMiBcbiAgICAgICAgICAgICAgICAgICAgICAgICArIFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcblxuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5FaWdodGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRyaXBsZXQgfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uU2l4dGVlbnRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRoaXJ0eVNlY29uZCkge1xuXG4gICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeXN0YXJ0LCB4ZW5kLCB5ZW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHlzdGFydCAtPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICB5ZW5kIC09IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcblxuICAgICAgICAgICAgLyogQSBkb3R0ZWQgZWlnaHRoIHdpbGwgY29ubmVjdCB0byBhIDE2dGggbm90ZS4gKi9cbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoKSB7XG4gICAgICAgICAgICAgICAgaW50IHggPSB4ZW5kIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgICAgIGRvdWJsZSBzbG9wZSA9ICh5ZW5kIC0geXN0YXJ0KSAqIDEuMCAvICh4ZW5kIC0geHN0YXJ0KTtcbiAgICAgICAgICAgICAgICBpbnQgeSA9IChpbnQpKHNsb3BlICogKHggLSB4ZW5kKSArIHllbmQpOyBcblxuICAgICAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4LCB5LCB4ZW5kLCB5ZW5kKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG5cbiAgICAgICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5c3RhcnQsIHhlbmQsIHllbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeXN0YXJ0IC09IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgIHllbmQgLT0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRoaXJ0eVNlY29uZCkge1xuICAgICAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHlzdGFydCwgeGVuZCwgeWVuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb3ZlcnJpZGUgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gc3RyaW5nLkZvcm1hdChcIlN0ZW0gZHVyYXRpb249ezB9IGRpcmVjdGlvbj17MX0gdG9wPXsyfSBib3R0b209ezN9IGVuZD17NH1cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiIG92ZXJsYXA9ezV9IHNpZGU9ezZ9IHdpZHRoX3RvX3BhaXI9ezd9IHJlY2VpdmVyX2luX3BhaXI9ezh9XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uLCBkaXJlY3Rpb24sIHRvcC5Ub1N0cmluZygpLCBib3R0b20uVG9TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kLlRvU3RyaW5nKCksIG5vdGVzb3ZlcmxhcCwgc2lkZSwgd2lkdGhfdG9fcGFpciwgcmVjZWl2ZXJfaW5fcGFpcik7XG4gICAgfVxuXG59IFxuXG5cbn1cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIEBjbGFzcyBTeW1ib2xXaWR0aHNcbiAqIFRoZSBTeW1ib2xXaWR0aHMgY2xhc3MgaXMgdXNlZCB0byB2ZXJ0aWNhbGx5IGFsaWduIG5vdGVzIGluIGRpZmZlcmVudFxuICogdHJhY2tzIHRoYXQgb2NjdXIgYXQgdGhlIHNhbWUgdGltZSAodGhhdCBoYXZlIHRoZSBzYW1lIHN0YXJ0dGltZSkuXG4gKiBUaGlzIGlzIGRvbmUgYnkgdGhlIGZvbGxvd2luZzpcbiAqIC0gU3RvcmUgYSBsaXN0IG9mIGFsbCB0aGUgc3RhcnQgdGltZXMuXG4gKiAtIFN0b3JlIHRoZSB3aWR0aCBvZiBzeW1ib2xzIGZvciBlYWNoIHN0YXJ0IHRpbWUsIGZvciBlYWNoIHRyYWNrLlxuICogLSBTdG9yZSB0aGUgbWF4aW11bSB3aWR0aCBmb3IgZWFjaCBzdGFydCB0aW1lLCBhY3Jvc3MgYWxsIHRyYWNrcy5cbiAqIC0gR2V0IHRoZSBleHRyYSB3aWR0aCBuZWVkZWQgZm9yIGVhY2ggdHJhY2sgdG8gbWF0Y2ggdGhlIG1heGltdW1cbiAqICAgd2lkdGggZm9yIHRoYXQgc3RhcnQgdGltZS5cbiAqXG4gKiBTZWUgbWV0aG9kIFNoZWV0TXVzaWMuQWxpZ25TeW1ib2xzKCksIHdoaWNoIHVzZXMgdGhpcyBjbGFzcy5cbiAqL1xuXG5wdWJsaWMgY2xhc3MgU3ltYm9sV2lkdGhzIHtcblxuICAgIC8qKiBBcnJheSBvZiBtYXBzIChzdGFydHRpbWUgLT4gc3ltYm9sIHdpZHRoKSwgb25lIHBlciB0cmFjayAqL1xuICAgIHByaXZhdGUgRGljdGlvbmFyeTxpbnQsIGludD5bXSB3aWR0aHM7XG5cbiAgICAvKiogTWFwIG9mIHN0YXJ0dGltZSAtPiBtYXhpbXVtIHN5bWJvbCB3aWR0aCAqL1xuICAgIHByaXZhdGUgRGljdGlvbmFyeTxpbnQsIGludD4gbWF4d2lkdGhzO1xuXG4gICAgLyoqIEFuIGFycmF5IG9mIGFsbCB0aGUgc3RhcnR0aW1lcywgaW4gYWxsIHRyYWNrcyAqL1xuICAgIHByaXZhdGUgaW50W10gc3RhcnR0aW1lcztcblxuXG4gICAgLyoqIEluaXRpYWxpemUgdGhlIHN5bWJvbCB3aWR0aCBtYXBzLCBnaXZlbiBhbGwgdGhlIHN5bWJvbHMgaW5cbiAgICAgKiBhbGwgdGhlIHRyYWNrcywgcGx1cyB0aGUgbHlyaWNzIGluIGFsbCB0cmFja3MuXG4gICAgICovXG4gICAgcHVibGljIFN5bWJvbFdpZHRocyhMaXN0PE11c2ljU3ltYm9sPltdIHRyYWNrcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIExpc3Q8THlyaWNTeW1ib2w+W10gdHJhY2tseXJpY3MpIHtcblxuICAgICAgICAvKiBHZXQgdGhlIHN5bWJvbCB3aWR0aHMgZm9yIGFsbCB0aGUgdHJhY2tzICovXG4gICAgICAgIHdpZHRocyA9IG5ldyBEaWN0aW9uYXJ5PGludCxpbnQ+WyB0cmFja3MuTGVuZ3RoIF07XG4gICAgICAgIGZvciAoaW50IHRyYWNrID0gMDsgdHJhY2sgPCB0cmFja3MuTGVuZ3RoOyB0cmFjaysrKSB7XG4gICAgICAgICAgICB3aWR0aHNbdHJhY2tdID0gR2V0VHJhY2tXaWR0aHModHJhY2tzW3RyYWNrXSk7XG4gICAgICAgIH1cbiAgICAgICAgbWF4d2lkdGhzID0gbmV3IERpY3Rpb25hcnk8aW50LGludD4oKTtcblxuICAgICAgICAvKiBDYWxjdWxhdGUgdGhlIG1heGltdW0gc3ltYm9sIHdpZHRocyAqL1xuICAgICAgICBmb3JlYWNoIChEaWN0aW9uYXJ5PGludCxpbnQ+IGRpY3QgaW4gd2lkdGhzKSB7XG4gICAgICAgICAgICBmb3JlYWNoIChpbnQgdGltZSBpbiBkaWN0LktleXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIW1heHdpZHRocy5Db250YWluc0tleSh0aW1lKSB8fFxuICAgICAgICAgICAgICAgICAgICAobWF4d2lkdGhzW3RpbWVdIDwgZGljdFt0aW1lXSkgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgbWF4d2lkdGhzW3RpbWVdID0gZGljdFt0aW1lXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHJhY2tseXJpY3MgIT0gbnVsbCkge1xuICAgICAgICAgICAgZm9yZWFjaCAoTGlzdDxMeXJpY1N5bWJvbD4gbHlyaWNzIGluIHRyYWNrbHlyaWNzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGx5cmljcyA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3JlYWNoIChMeXJpY1N5bWJvbCBseXJpYyBpbiBseXJpY3MpIHtcbiAgICAgICAgICAgICAgICAgICAgaW50IHdpZHRoID0gbHlyaWMuTWluV2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIGludCB0aW1lID0gbHlyaWMuU3RhcnRUaW1lO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW1heHdpZHRocy5Db250YWluc0tleSh0aW1lKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgKG1heHdpZHRoc1t0aW1lXSA8IHdpZHRoKSApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4d2lkdGhzW3RpbWVdID0gd2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBTdG9yZSBhbGwgdGhlIHN0YXJ0IHRpbWVzIHRvIHRoZSBzdGFydHRpbWUgYXJyYXkgKi9cbiAgICAgICAgc3RhcnR0aW1lcyA9IG5ldyBpbnRbIG1heHdpZHRocy5LZXlzLkNvdW50IF07XG4gICAgICAgIG1heHdpZHRocy5LZXlzLkNvcHlUbyhzdGFydHRpbWVzLCAwKTtcbiAgICAgICAgQXJyYXkuU29ydDxpbnQ+KHN0YXJ0dGltZXMpO1xuICAgIH1cblxuICAgIC8qKiBDcmVhdGUgYSB0YWJsZSBvZiB0aGUgc3ltYm9sIHdpZHRocyBmb3IgZWFjaCBzdGFydHRpbWUgaW4gdGhlIHRyYWNrLiAqL1xuICAgIHByaXZhdGUgc3RhdGljIERpY3Rpb25hcnk8aW50LGludD4gR2V0VHJhY2tXaWR0aHMoTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scykge1xuICAgICAgICBEaWN0aW9uYXJ5PGludCxpbnQ+IHdpZHRocyA9IG5ldyBEaWN0aW9uYXJ5PGludCxpbnQ+KCk7XG5cbiAgICAgICAgZm9yZWFjaCAoTXVzaWNTeW1ib2wgbSBpbiBzeW1ib2xzKSB7XG4gICAgICAgICAgICBpbnQgc3RhcnQgPSBtLlN0YXJ0VGltZTtcbiAgICAgICAgICAgIGludCB3ID0gbS5NaW5XaWR0aDtcblxuICAgICAgICAgICAgaWYgKG0gaXMgQmFyU3ltYm9sKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh3aWR0aHMuQ29udGFpbnNLZXkoc3RhcnQpKSB7XG4gICAgICAgICAgICAgICAgd2lkdGhzW3N0YXJ0XSArPSB3O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgd2lkdGhzW3N0YXJ0XSA9IHc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHdpZHRocztcbiAgICB9XG5cbiAgICAvKiogR2l2ZW4gYSB0cmFjayBhbmQgYSBzdGFydCB0aW1lLCByZXR1cm4gdGhlIGV4dHJhIHdpZHRoIG5lZWRlZCBzbyB0aGF0XG4gICAgICogdGhlIHN5bWJvbHMgZm9yIHRoYXQgc3RhcnQgdGltZSBhbGlnbiB3aXRoIHRoZSBvdGhlciB0cmFja3MuXG4gICAgICovXG4gICAgcHVibGljIGludCBHZXRFeHRyYVdpZHRoKGludCB0cmFjaywgaW50IHN0YXJ0KSB7XG4gICAgICAgIGlmICghd2lkdGhzW3RyYWNrXS5Db250YWluc0tleShzdGFydCkpIHtcbiAgICAgICAgICAgIHJldHVybiBtYXh3aWR0aHNbc3RhcnRdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG1heHdpZHRoc1tzdGFydF0gLSB3aWR0aHNbdHJhY2tdW3N0YXJ0XTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gYW4gYXJyYXkgb2YgYWxsIHRoZSBzdGFydCB0aW1lcyBpbiBhbGwgdGhlIHRyYWNrcyAqL1xuICAgIHB1YmxpYyBpbnRbXSBTdGFydFRpbWVzIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHN0YXJ0dGltZXM7IH1cbiAgICB9XG5cblxuXG5cbn1cblxuXG59XG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbi8qKiBUaGUgcG9zc2libGUgbm90ZSBkdXJhdGlvbnMgKi9cbnB1YmxpYyBlbnVtIE5vdGVEdXJhdGlvbiB7XG4gIFRoaXJ0eVNlY29uZCwgU2l4dGVlbnRoLCBUcmlwbGV0LCBFaWdodGgsXG4gIERvdHRlZEVpZ2h0aCwgUXVhcnRlciwgRG90dGVkUXVhcnRlcixcbiAgSGFsZiwgRG90dGVkSGFsZiwgV2hvbGVcbn07XG5cbi8qKiBAY2xhc3MgVGltZVNpZ25hdHVyZVxuICogVGhlIFRpbWVTaWduYXR1cmUgY2xhc3MgcmVwcmVzZW50c1xuICogLSBUaGUgdGltZSBzaWduYXR1cmUgb2YgdGhlIHNvbmcsIHN1Y2ggYXMgNC80LCAzLzQsIG9yIDYvOCB0aW1lLCBhbmRcbiAqIC0gVGhlIG51bWJlciBvZiBwdWxzZXMgcGVyIHF1YXJ0ZXIgbm90ZVxuICogLSBUaGUgbnVtYmVyIG9mIG1pY3Jvc2Vjb25kcyBwZXIgcXVhcnRlciBub3RlXG4gKlxuICogSW4gbWlkaSBmaWxlcywgYWxsIHRpbWUgaXMgbWVhc3VyZWQgaW4gXCJwdWxzZXNcIi4gIEVhY2ggbm90ZSBoYXNcbiAqIGEgc3RhcnQgdGltZSAobWVhc3VyZWQgaW4gcHVsc2VzKSwgYW5kIGEgZHVyYXRpb24gKG1lYXN1cmVkIGluIFxuICogcHVsc2VzKS4gIFRoaXMgY2xhc3MgaXMgdXNlZCBtYWlubHkgdG8gY29udmVydCBwdWxzZSBkdXJhdGlvbnNcbiAqIChsaWtlIDEyMCwgMjQwLCBldGMpIGludG8gbm90ZSBkdXJhdGlvbnMgKGhhbGYsIHF1YXJ0ZXIsIGVpZ2h0aCwgZXRjKS5cbiAqL1xuXG5wdWJsaWMgY2xhc3MgVGltZVNpZ25hdHVyZSB7XG4gICAgcHJpdmF0ZSBpbnQgbnVtZXJhdG9yOyAgICAgIC8qKiBOdW1lcmF0b3Igb2YgdGhlIHRpbWUgc2lnbmF0dXJlICovXG4gICAgcHJpdmF0ZSBpbnQgZGVub21pbmF0b3I7ICAgIC8qKiBEZW5vbWluYXRvciBvZiB0aGUgdGltZSBzaWduYXR1cmUgKi9cbiAgICBwcml2YXRlIGludCBxdWFydGVybm90ZTsgICAgLyoqIE51bWJlciBvZiBwdWxzZXMgcGVyIHF1YXJ0ZXIgbm90ZSAqL1xuICAgIHByaXZhdGUgaW50IG1lYXN1cmU7ICAgICAgICAvKiogTnVtYmVyIG9mIHB1bHNlcyBwZXIgbWVhc3VyZSAqL1xuICAgIHByaXZhdGUgaW50IHRlbXBvOyAgICAgICAgICAvKiogTnVtYmVyIG9mIG1pY3Jvc2Vjb25kcyBwZXIgcXVhcnRlciBub3RlICovXG5cbiAgICAvKiogR2V0IHRoZSBudW1lcmF0b3Igb2YgdGhlIHRpbWUgc2lnbmF0dXJlICovXG4gICAgcHVibGljIGludCBOdW1lcmF0b3Ige1xuICAgICAgICBnZXQgeyByZXR1cm4gbnVtZXJhdG9yOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgZGVub21pbmF0b3Igb2YgdGhlIHRpbWUgc2lnbmF0dXJlICovXG4gICAgcHVibGljIGludCBEZW5vbWluYXRvciB7XG4gICAgICAgIGdldCB7IHJldHVybiBkZW5vbWluYXRvcjsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwdWxzZXMgcGVyIHF1YXJ0ZXIgbm90ZSAqL1xuICAgIHB1YmxpYyBpbnQgUXVhcnRlciB7XG4gICAgICAgIGdldCB7IHJldHVybiBxdWFydGVybm90ZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwdWxzZXMgcGVyIG1lYXN1cmUgKi9cbiAgICBwdWJsaWMgaW50IE1lYXN1cmUge1xuICAgICAgICBnZXQgeyByZXR1cm4gbWVhc3VyZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBtaWNyb3NlY29uZHMgcGVyIHF1YXJ0ZXIgbm90ZSAqLyBcbiAgICBwdWJsaWMgaW50IFRlbXBvIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHRlbXBvOyB9XG4gICAgfVxuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyB0aW1lIHNpZ25hdHVyZSwgd2l0aCB0aGUgZ2l2ZW4gbnVtZXJhdG9yLFxuICAgICAqIGRlbm9taW5hdG9yLCBwdWxzZXMgcGVyIHF1YXJ0ZXIgbm90ZSwgYW5kIHRlbXBvLlxuICAgICAqL1xuICAgIHB1YmxpYyBUaW1lU2lnbmF0dXJlKGludCBudW1lcmF0b3IsIGludCBkZW5vbWluYXRvciwgaW50IHF1YXJ0ZXJub3RlLCBpbnQgdGVtcG8pIHtcbiAgICAgICAgaWYgKG51bWVyYXRvciA8PSAwIHx8IGRlbm9taW5hdG9yIDw9IDAgfHwgcXVhcnRlcm5vdGUgPD0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IE1pZGlGaWxlRXhjZXB0aW9uKFwiSW52YWxpZCB0aW1lIHNpZ25hdHVyZVwiLCAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIE1pZGkgRmlsZSBnaXZlcyB3cm9uZyB0aW1lIHNpZ25hdHVyZSBzb21ldGltZXMgKi9cbiAgICAgICAgaWYgKG51bWVyYXRvciA9PSA1KSB7XG4gICAgICAgICAgICBudW1lcmF0b3IgPSA0O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5udW1lcmF0b3IgPSBudW1lcmF0b3I7XG4gICAgICAgIHRoaXMuZGVub21pbmF0b3IgPSBkZW5vbWluYXRvcjtcbiAgICAgICAgdGhpcy5xdWFydGVybm90ZSA9IHF1YXJ0ZXJub3RlO1xuICAgICAgICB0aGlzLnRlbXBvID0gdGVtcG87XG5cbiAgICAgICAgaW50IGJlYXQ7XG4gICAgICAgIGlmIChkZW5vbWluYXRvciA8IDQpXG4gICAgICAgICAgICBiZWF0ID0gcXVhcnRlcm5vdGUgKiAyO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBiZWF0ID0gcXVhcnRlcm5vdGUgLyAoZGVub21pbmF0b3IvNCk7XG5cbiAgICAgICAgbWVhc3VyZSA9IG51bWVyYXRvciAqIGJlYXQ7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB3aGljaCBtZWFzdXJlIHRoZSBnaXZlbiB0aW1lIChpbiBwdWxzZXMpIGJlbG9uZ3MgdG8uICovXG4gICAgcHVibGljIGludCBHZXRNZWFzdXJlKGludCB0aW1lKSB7XG4gICAgICAgIHJldHVybiB0aW1lIC8gbWVhc3VyZTtcbiAgICB9XG5cbiAgICAvKiogR2l2ZW4gYSBkdXJhdGlvbiBpbiBwdWxzZXMsIHJldHVybiB0aGUgY2xvc2VzdCBub3RlIGR1cmF0aW9uLiAqL1xuICAgIHB1YmxpYyBOb3RlRHVyYXRpb24gR2V0Tm90ZUR1cmF0aW9uKGludCBkdXJhdGlvbikge1xuICAgICAgICBpbnQgd2hvbGUgPSBxdWFydGVybm90ZSAqIDQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAxICAgICAgID0gMzIvMzJcbiAgICAgICAgIDMvNCAgICAgPSAyNC8zMlxuICAgICAgICAgMS8yICAgICA9IDE2LzMyXG4gICAgICAgICAzLzggICAgID0gMTIvMzJcbiAgICAgICAgIDEvNCAgICAgPSAgOC8zMlxuICAgICAgICAgMy8xNiAgICA9ICA2LzMyXG4gICAgICAgICAxLzggICAgID0gIDQvMzIgPSAgICA4LzY0XG4gICAgICAgICB0cmlwbGV0ICAgICAgICAgPSA1LjMzLzY0XG4gICAgICAgICAxLzE2ICAgID0gIDIvMzIgPSAgICA0LzY0XG4gICAgICAgICAxLzMyICAgID0gIDEvMzIgPSAgICAyLzY0XG4gICAgICAgICAqKi8gXG5cbiAgICAgICAgaWYgICAgICAoZHVyYXRpb24gPj0gMjgqd2hvbGUvMzIpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLldob2xlO1xuICAgICAgICBlbHNlIGlmIChkdXJhdGlvbiA+PSAyMCp3aG9sZS8zMikgXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLkRvdHRlZEhhbGY7XG4gICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID49IDE0Kndob2xlLzMyKVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5IYWxmO1xuICAgICAgICBlbHNlIGlmIChkdXJhdGlvbiA+PSAxMCp3aG9sZS8zMilcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uRG90dGVkUXVhcnRlcjtcbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPj0gIDcqd2hvbGUvMzIpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLlF1YXJ0ZXI7XG4gICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID49ICA1Kndob2xlLzMyKVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGg7XG4gICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID49ICA2Kndob2xlLzY0KVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5FaWdodGg7XG4gICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID49ICA1Kndob2xlLzY0KVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5UcmlwbGV0O1xuICAgICAgICBlbHNlIGlmIChkdXJhdGlvbiA+PSAgMyp3aG9sZS82NClcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uU2l4dGVlbnRoO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLlRoaXJ0eVNlY29uZDtcbiAgICB9XG5cbiAgICAvKiogQ29udmVydCBhIG5vdGUgZHVyYXRpb24gaW50byBhIHN0ZW0gZHVyYXRpb24uICBEb3R0ZWQgZHVyYXRpb25zXG4gICAgICogYXJlIGNvbnZlcnRlZCBpbnRvIHRoZWlyIG5vbi1kb3R0ZWQgZXF1aXZhbGVudHMuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBOb3RlRHVyYXRpb24gR2V0U3RlbUR1cmF0aW9uKE5vdGVEdXJhdGlvbiBkdXIpIHtcbiAgICAgICAgaWYgKGR1ciA9PSBOb3RlRHVyYXRpb24uRG90dGVkSGFsZilcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uSGFsZjtcbiAgICAgICAgZWxzZSBpZiAoZHVyID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRRdWFydGVyKVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5RdWFydGVyO1xuICAgICAgICBlbHNlIGlmIChkdXIgPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aClcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uRWlnaHRoO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gZHVyO1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIHRpbWUgcGVyaW9kIChpbiBwdWxzZXMpIHRoZSB0aGUgZ2l2ZW4gZHVyYXRpb24gc3BhbnMgKi9cbiAgICBwdWJsaWMgaW50IER1cmF0aW9uVG9UaW1lKE5vdGVEdXJhdGlvbiBkdXIpIHtcbiAgICAgICAgaW50IGVpZ2h0aCA9IHF1YXJ0ZXJub3RlLzI7XG4gICAgICAgIGludCBzaXh0ZWVudGggPSBlaWdodGgvMjtcblxuICAgICAgICBzd2l0Y2ggKGR1cikge1xuICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uV2hvbGU6ICAgICAgICAgcmV0dXJuIHF1YXJ0ZXJub3RlICogNDsgXG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5Eb3R0ZWRIYWxmOiAgICByZXR1cm4gcXVhcnRlcm5vdGUgKiAzOyBcbiAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkhhbGY6ICAgICAgICAgIHJldHVybiBxdWFydGVybm90ZSAqIDI7IFxuICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uRG90dGVkUXVhcnRlcjogcmV0dXJuIDMqZWlnaHRoOyBcbiAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLlF1YXJ0ZXI6ICAgICAgIHJldHVybiBxdWFydGVybm90ZTsgXG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGg6ICByZXR1cm4gMypzaXh0ZWVudGg7XG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5FaWdodGg6ICAgICAgICByZXR1cm4gZWlnaHRoO1xuICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uVHJpcGxldDogICAgICAgcmV0dXJuIHF1YXJ0ZXJub3RlLzM7IFxuICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uU2l4dGVlbnRoOiAgICAgcmV0dXJuIHNpeHRlZW50aDtcbiAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLlRoaXJ0eVNlY29uZDogIHJldHVybiBzaXh0ZWVudGgvMjsgXG4gICAgICAgICAgICBkZWZhdWx0OiAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIFxuICAgIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJUaW1lU2lnbmF0dXJlPXswfS97MX0gcXVhcnRlcj17Mn0gdGVtcG89ezN9XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWVyYXRvciwgZGVub21pbmF0b3IsIHF1YXJ0ZXJub3RlLCB0ZW1wbyk7XG4gICAgfVxuICAgIFxufVxuXG59XG5cbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgU3lzdGVtLlRocmVhZGluZy5UYXNrcztcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY0JyaWRnZS5UZXh0XHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBBU0NJSVxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBzdHJpbmcgR2V0U3RyaW5nKGJ5dGVbXSBkYXRhLCBpbnQgc3RhcnRJbmRleCwgaW50IGxlbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciB0b1JldHVybiA9IFwiXCI7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuICYmIGkgPCBkYXRhLkxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICAgICAgdG9SZXR1cm4gKz0gKGNoYXIpZGF0YVtpICsgc3RhcnRJbmRleF07XHJcbiAgICAgICAgICAgIHJldHVybiB0b1JldHVybjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNCcmlkZ2UuVGV4dFxyXG57XHJcbiAgICBwdWJsaWMgc3RhdGljIGNsYXNzIEVuY29kaW5nXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBBU0NJSSBBU0NJSSA9IG5ldyBBU0NJSSgpO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMSBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuXG4vKiogQWNjaWRlbnRhbHMgKi9cbnB1YmxpYyBlbnVtIEFjY2lkIHtcbiAgICBOb25lLCBTaGFycCwgRmxhdCwgTmF0dXJhbFxufVxuXG4vKiogQGNsYXNzIEFjY2lkU3ltYm9sXG4gKiBBbiBhY2NpZGVudGFsIChhY2NpZCkgc3ltYm9sIHJlcHJlc2VudHMgYSBzaGFycCwgZmxhdCwgb3IgbmF0dXJhbFxuICogYWNjaWRlbnRhbCB0aGF0IGlzIGRpc3BsYXllZCBhdCBhIHNwZWNpZmljIHBvc2l0aW9uIChub3RlIGFuZCBjbGVmKS5cbiAqL1xucHVibGljIGNsYXNzIEFjY2lkU3ltYm9sIDogTXVzaWNTeW1ib2wge1xuICAgIHByaXZhdGUgQWNjaWQgYWNjaWQ7ICAgICAgICAgIC8qKiBUaGUgYWNjaWRlbnRhbCAoc2hhcnAsIGZsYXQsIG5hdHVyYWwpICovXG4gICAgcHJpdmF0ZSBXaGl0ZU5vdGUgd2hpdGVub3RlOyAgLyoqIFRoZSB3aGl0ZSBub3RlIHdoZXJlIHRoZSBzeW1ib2wgb2NjdXJzICovXG4gICAgcHJpdmF0ZSBDbGVmIGNsZWY7ICAgICAgICAgICAgLyoqIFdoaWNoIGNsZWYgdGhlIHN5bWJvbHMgaXMgaW4gKi9cbiAgICBwcml2YXRlIGludCB3aWR0aDsgICAgICAgICAgICAvKiogV2lkdGggb2Ygc3ltYm9sICovXG5cbiAgICAvKiogXG4gICAgICogQ3JlYXRlIGEgbmV3IEFjY2lkU3ltYm9sIHdpdGggdGhlIGdpdmVuIGFjY2lkZW50YWwsIHRoYXQgaXNcbiAgICAgKiBkaXNwbGF5ZWQgYXQgdGhlIGdpdmVuIG5vdGUgaW4gdGhlIGdpdmVuIGNsZWYuXG4gICAgICovXG4gICAgcHVibGljIEFjY2lkU3ltYm9sKEFjY2lkIGFjY2lkLCBXaGl0ZU5vdGUgbm90ZSwgQ2xlZiBjbGVmKSB7XG4gICAgICAgIHRoaXMuYWNjaWQgPSBhY2NpZDtcbiAgICAgICAgdGhpcy53aGl0ZW5vdGUgPSBub3RlO1xuICAgICAgICB0aGlzLmNsZWYgPSBjbGVmO1xuICAgICAgICB3aWR0aCA9IE1pbldpZHRoO1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIHdoaXRlIG5vdGUgdGhpcyBhY2NpZGVudGFsIGlzIGRpc3BsYXllZCBhdCAqL1xuICAgIHB1YmxpYyBXaGl0ZU5vdGUgTm90ZSAge1xuICAgICAgICBnZXQgeyByZXR1cm4gd2hpdGVub3RlOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgdGltZSAoaW4gcHVsc2VzKSB0aGlzIHN5bWJvbCBvY2N1cnMgYXQuXG4gICAgICogTm90IHVzZWQuICBJbnN0ZWFkLCB0aGUgU3RhcnRUaW1lIG9mIHRoZSBDaG9yZFN5bWJvbCBjb250YWluaW5nIHRoaXNcbiAgICAgKiBBY2NpZFN5bWJvbCBpcyB1c2VkLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgU3RhcnRUaW1lIHsgXG4gICAgICAgIGdldCB7IHJldHVybiAtMTsgfSAgXG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbWluaW11bSB3aWR0aCAoaW4gcGl4ZWxzKSBuZWVkZWQgdG8gZHJhdyB0aGlzIHN5bWJvbCAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgTWluV2lkdGggeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIDMqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0L1NldCB0aGUgd2lkdGggKGluIHBpeGVscykgb2YgdGhpcyBzeW1ib2wuIFRoZSB3aWR0aCBpcyBzZXRcbiAgICAgKiBpbiBTaGVldE11c2ljLkFsaWduU3ltYm9scygpIHRvIHZlcnRpY2FsbHkgYWxpZ24gc3ltYm9scy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFdpZHRoIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgIHNldCB7IHdpZHRoID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYWJvdmUgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQWJvdmVTdGFmZiB7XG4gICAgICAgIGdldCB7IHJldHVybiBHZXRBYm92ZVN0YWZmKCk7IH1cbiAgICB9XG5cbiAgICBpbnQgR2V0QWJvdmVTdGFmZigpIHtcbiAgICAgICAgaW50IGRpc3QgPSBXaGl0ZU5vdGUuVG9wKGNsZWYpLkRpc3Qod2hpdGVub3RlKSAqIFxuICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICBpZiAoYWNjaWQgPT0gQWNjaWQuU2hhcnAgfHwgYWNjaWQgPT0gQWNjaWQuTmF0dXJhbClcbiAgICAgICAgICAgIGRpc3QgLT0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICBlbHNlIGlmIChhY2NpZCA9PSBBY2NpZC5GbGF0KVxuICAgICAgICAgICAgZGlzdCAtPSAzKlNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG4gICAgICAgIGlmIChkaXN0IDwgMClcbiAgICAgICAgICAgIHJldHVybiAtZGlzdDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGJlbG93IHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEJlbG93U3RhZmYge1xuICAgICAgICBnZXQgeyByZXR1cm4gR2V0QmVsb3dTdGFmZigpOyB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbnQgR2V0QmVsb3dTdGFmZigpIHtcbiAgICAgICAgaW50IGRpc3QgPSBXaGl0ZU5vdGUuQm90dG9tKGNsZWYpLkRpc3Qod2hpdGVub3RlKSAqIFxuICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yICsgXG4gICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICBpZiAoYWNjaWQgPT0gQWNjaWQuU2hhcnAgfHwgYWNjaWQgPT0gQWNjaWQuTmF0dXJhbCkgXG4gICAgICAgICAgICBkaXN0ICs9IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcblxuICAgICAgICBpZiAoZGlzdCA+IDApXG4gICAgICAgICAgICByZXR1cm4gZGlzdDtcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIC8qKiBEcmF3IHRoZSBzeW1ib2wuXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHlsb2NhdGlvbiAoaW4gcGl4ZWxzKSB3aGVyZSB0aGUgdG9wIG9mIHRoZSBzdGFmZiBzdGFydHMuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIHZvaWQgRHJhdyhHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICAvKiBBbGlnbiB0aGUgc3ltYm9sIHRvIHRoZSByaWdodCAqL1xuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybShXaWR0aCAtIE1pbldpZHRoLCAwKTtcblxuICAgICAgICAvKiBTdG9yZSB0aGUgeS1waXhlbCB2YWx1ZSBvZiB0aGUgdG9wIG9mIHRoZSB3aGl0ZW5vdGUgaW4geW5vdGUuICovXG4gICAgICAgIGludCB5bm90ZSA9IHl0b3AgKyBXaGl0ZU5vdGUuVG9wKGNsZWYpLkRpc3Qod2hpdGVub3RlKSAqIFxuICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcblxuICAgICAgICBpZiAoYWNjaWQgPT0gQWNjaWQuU2hhcnApXG4gICAgICAgICAgICBEcmF3U2hhcnAoZywgcGVuLCB5bm90ZSk7XG4gICAgICAgIGVsc2UgaWYgKGFjY2lkID09IEFjY2lkLkZsYXQpXG4gICAgICAgICAgICBEcmF3RmxhdChnLCBwZW4sIHlub3RlKTtcbiAgICAgICAgZWxzZSBpZiAoYWNjaWQgPT0gQWNjaWQuTmF0dXJhbClcbiAgICAgICAgICAgIERyYXdOYXR1cmFsKGcsIHBlbiwgeW5vdGUpO1xuXG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0oV2lkdGggLSBNaW5XaWR0aCksIDApO1xuICAgIH1cblxuICAgIC8qKiBEcmF3IGEgc2hhcnAgc3ltYm9sLiBcbiAgICAgKiBAcGFyYW0geW5vdGUgVGhlIHBpeGVsIGxvY2F0aW9uIG9mIHRoZSB0b3Agb2YgdGhlIGFjY2lkZW50YWwncyBub3RlLiBcbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3U2hhcnAoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHlub3RlKSB7XG5cbiAgICAgICAgLyogRHJhdyB0aGUgdHdvIHZlcnRpY2FsIGxpbmVzICovXG4gICAgICAgIGludCB5c3RhcnQgPSB5bm90ZSAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgaW50IHllbmQgPSB5bm90ZSArIDIqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICBpbnQgeCA9IFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeCwgeXN0YXJ0ICsgMiwgeCwgeWVuZCk7XG4gICAgICAgIHggKz0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCB4LCB5c3RhcnQsIHgsIHllbmQgLSAyKTtcblxuICAgICAgICAvKiBEcmF3IHRoZSBzbGlnaHRseSB1cHdhcmRzIGhvcml6b250YWwgbGluZXMgKi9cbiAgICAgICAgaW50IHhzdGFydCA9IFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzQ7XG4gICAgICAgIGludCB4ZW5kID0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzQ7XG4gICAgICAgIHlzdGFydCA9IHlub3RlICsgU2hlZXRNdXNpYy5MaW5lV2lkdGg7XG4gICAgICAgIHllbmQgPSB5c3RhcnQgLSBTaGVldE11c2ljLkxpbmVXaWR0aCAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQ7XG4gICAgICAgIHBlbi5XaWR0aCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzI7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHlzdGFydCwgeGVuZCwgeWVuZCk7XG4gICAgICAgIHlzdGFydCArPSBTaGVldE11c2ljLkxpbmVTcGFjZTtcbiAgICAgICAgeWVuZCArPSBTaGVldE11c2ljLkxpbmVTcGFjZTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeXN0YXJ0LCB4ZW5kLCB5ZW5kKTtcbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICB9XG5cbiAgICAvKiogRHJhdyBhIGZsYXQgc3ltYm9sLlxuICAgICAqIEBwYXJhbSB5bm90ZSBUaGUgcGl4ZWwgbG9jYXRpb24gb2YgdGhlIHRvcCBvZiB0aGUgYWNjaWRlbnRhbCdzIG5vdGUuXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgRHJhd0ZsYXQoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHlub3RlKSB7XG4gICAgICAgIGludCB4ID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNDtcblxuICAgICAgICAvKiBEcmF3IHRoZSB2ZXJ0aWNhbCBsaW5lICovXG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCB4LCB5bm90ZSAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodCAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgeCwgeW5vdGUgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQpO1xuXG4gICAgICAgIC8qIERyYXcgMyBiZXppZXIgY3VydmVzLlxuICAgICAgICAgKiBBbGwgMyBjdXJ2ZXMgc3RhcnQgYW5kIHN0b3AgYXQgdGhlIHNhbWUgcG9pbnRzLlxuICAgICAgICAgKiBFYWNoIHN1YnNlcXVlbnQgY3VydmUgYnVsZ2VzIG1vcmUgYW5kIG1vcmUgdG93YXJkcyBcbiAgICAgICAgICogdGhlIHRvcHJpZ2h0IGNvcm5lciwgbWFraW5nIHRoZSBjdXJ2ZSBsb29rIHRoaWNrZXJcbiAgICAgICAgICogdG93YXJkcyB0aGUgdG9wLXJpZ2h0LlxuICAgICAgICAgKi9cbiAgICAgICAgZy5EcmF3QmV6aWVyKHBlbiwgeCwgeW5vdGUgKyBTaGVldE11c2ljLkxpbmVTcGFjZS80LFxuICAgICAgICAgICAgeCArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIsIHlub3RlIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvMixcbiAgICAgICAgICAgIHggKyBTaGVldE11c2ljLkxpbmVTcGFjZSwgeW5vdGUgKyBTaGVldE11c2ljLkxpbmVTcGFjZS8zLFxuICAgICAgICAgICAgeCwgeW5vdGUgKyBTaGVldE11c2ljLkxpbmVTcGFjZSArIFNoZWV0TXVzaWMuTGluZVdpZHRoICsgMSk7XG5cbiAgICAgICAgZy5EcmF3QmV6aWVyKHBlbiwgeCwgeW5vdGUgKyBTaGVldE11c2ljLkxpbmVTcGFjZS80LFxuICAgICAgICAgICAgeCArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIsIHlub3RlIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvMixcbiAgICAgICAgICAgIHggKyBTaGVldE11c2ljLkxpbmVTcGFjZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQsIFxuICAgICAgICAgICAgICB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzMgLSBTaGVldE11c2ljLkxpbmVTcGFjZS80LFxuICAgICAgICAgICAgeCwgeW5vdGUgKyBTaGVldE11c2ljLkxpbmVTcGFjZSArIFNoZWV0TXVzaWMuTGluZVdpZHRoICsgMSk7XG5cblxuICAgICAgICBnLkRyYXdCZXppZXIocGVuLCB4LCB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQsXG4gICAgICAgICAgICB4ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMiwgeW5vdGUgLSBTaGVldE11c2ljLkxpbmVTcGFjZS8yLFxuICAgICAgICAgICAgeCArIFNoZWV0TXVzaWMuTGluZVNwYWNlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMiwgXG4gICAgICAgICAgICAgeW5vdGUgKyBTaGVldE11c2ljLkxpbmVTcGFjZS8zIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvMixcbiAgICAgICAgICAgIHgsIHlub3RlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UgKyBTaGVldE11c2ljLkxpbmVXaWR0aCArIDEpO1xuXG5cbiAgICB9XG5cbiAgICAvKiogRHJhdyBhIG5hdHVyYWwgc3ltYm9sLlxuICAgICAqIEBwYXJhbSB5bm90ZSBUaGUgcGl4ZWwgbG9jYXRpb24gb2YgdGhlIHRvcCBvZiB0aGUgYWNjaWRlbnRhbCdzIG5vdGUuXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgRHJhd05hdHVyYWwoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHlub3RlKSB7XG5cbiAgICAgICAgLyogRHJhdyB0aGUgdHdvIHZlcnRpY2FsIGxpbmVzICovXG4gICAgICAgIGludCB5c3RhcnQgPSB5bm90ZSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlIC0gU2hlZXRNdXNpYy5MaW5lV2lkdGg7XG4gICAgICAgIGludCB5ZW5kID0geW5vdGUgKyBTaGVldE11c2ljLkxpbmVTcGFjZSArIFNoZWV0TXVzaWMuTGluZVdpZHRoO1xuICAgICAgICBpbnQgeCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzI7XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCB4LCB5c3RhcnQsIHgsIHllbmQpO1xuICAgICAgICB4ICs9IFNoZWV0TXVzaWMuTGluZVNwYWNlIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNDtcbiAgICAgICAgeXN0YXJ0ID0geW5vdGUgLSBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuICAgICAgICB5ZW5kID0geW5vdGUgKyAyKlNoZWV0TXVzaWMuTGluZVNwYWNlICsgU2hlZXRNdXNpYy5MaW5lV2lkdGggLSBcbiAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5MaW5lU3BhY2UvNDtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHgsIHlzdGFydCwgeCwgeWVuZCk7XG5cbiAgICAgICAgLyogRHJhdyB0aGUgc2xpZ2h0bHkgdXB3YXJkcyBob3Jpem9udGFsIGxpbmVzICovXG4gICAgICAgIGludCB4c3RhcnQgPSBTaGVldE11c2ljLkxpbmVTcGFjZS8yO1xuICAgICAgICBpbnQgeGVuZCA9IHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNDtcbiAgICAgICAgeXN0YXJ0ID0geW5vdGUgKyBTaGVldE11c2ljLkxpbmVXaWR0aDtcbiAgICAgICAgeWVuZCA9IHlzdGFydCAtIFNoZWV0TXVzaWMuTGluZVdpZHRoIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNDtcbiAgICAgICAgcGVuLldpZHRoID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvMjtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeXN0YXJ0LCB4ZW5kLCB5ZW5kKTtcbiAgICAgICAgeXN0YXJ0ICs9IFNoZWV0TXVzaWMuTGluZVNwYWNlO1xuICAgICAgICB5ZW5kICs9IFNoZWV0TXVzaWMuTGluZVNwYWNlO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5c3RhcnQsIHhlbmQsIHllbmQpO1xuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFxuICAgICAgICAgIFwiQWNjaWRTeW1ib2wgYWNjaWQ9ezB9IHdoaXRlbm90ZT17MX0gY2xlZj17Mn0gd2lkdGg9ezN9XCIsXG4gICAgICAgICAgYWNjaWQsIHdoaXRlbm90ZSwgY2xlZiwgd2lkdGgpO1xuICAgIH1cblxufVxuXG59XG5cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG5cbi8qKiBAY2xhc3MgQmFyU3ltYm9sXG4gKiBUaGUgQmFyU3ltYm9sIHJlcHJlc2VudHMgdGhlIHZlcnRpY2FsIGJhcnMgd2hpY2ggZGVsaW1pdCBtZWFzdXJlcy5cbiAqIFRoZSBzdGFydHRpbWUgb2YgdGhlIHN5bWJvbCBpcyB0aGUgYmVnaW5uaW5nIG9mIHRoZSBuZXdcbiAqIG1lYXN1cmUuXG4gKi9cbnB1YmxpYyBjbGFzcyBCYXJTeW1ib2wgOiBNdXNpY1N5bWJvbCB7XG4gICAgcHJpdmF0ZSBpbnQgc3RhcnR0aW1lO1xuICAgIHByaXZhdGUgaW50IHdpZHRoO1xuXG4gICAgLyoqIENyZWF0ZSBhIEJhclN5bWJvbC4gVGhlIHN0YXJ0dGltZSBzaG91bGQgYmUgdGhlIGJlZ2lubmluZyBvZiBhIG1lYXN1cmUuICovXG4gICAgcHVibGljIEJhclN5bWJvbChpbnQgc3RhcnR0aW1lKSB7XG4gICAgICAgIHRoaXMuc3RhcnR0aW1lID0gc3RhcnR0aW1lO1xuICAgICAgICB3aWR0aCA9IE1pbldpZHRoO1xuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIHRpbWUgKGluIHB1bHNlcykgdGhpcyBzeW1ib2wgb2NjdXJzIGF0LlxuICAgICAqIFRoaXMgaXMgdXNlZCB0byBkZXRlcm1pbmUgdGhlIG1lYXN1cmUgdGhpcyBzeW1ib2wgYmVsb25ncyB0by5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFN0YXJ0VGltZSB7XG4gICAgICAgIGdldCB7IHJldHVybiBzdGFydHRpbWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBtaW5pbXVtIHdpZHRoIChpbiBwaXhlbHMpIG5lZWRlZCB0byBkcmF3IHRoaXMgc3ltYm9sICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBNaW5XaWR0aCB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gMiAqIFNoZWV0TXVzaWMuTGluZVNwYWNlOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldC9TZXQgdGhlIHdpZHRoIChpbiBwaXhlbHMpIG9mIHRoaXMgc3ltYm9sLiBUaGUgd2lkdGggaXMgc2V0XG4gICAgICogaW4gU2hlZXRNdXNpYy5BbGlnblN5bWJvbHMoKSB0byB2ZXJ0aWNhbGx5IGFsaWduIHN5bWJvbHMuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBXaWR0aCB7XG4gICAgICAgIGdldCB7IHJldHVybiB3aWR0aDsgfVxuICAgICAgICBzZXQgeyB3aWR0aCA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGFib3ZlIHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEFib3ZlU3RhZmYgeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIDA7IH0gXG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGJlbG93IHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEJlbG93U3RhZmYgeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIDA7IH1cbiAgICB9XG5cbiAgICAvKiogRHJhdyBhIHZlcnRpY2FsIGJhci5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgXG4gICAgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIGludCB5ID0geXRvcDtcbiAgICAgICAgaW50IHllbmQgPSB5ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UqNCArIFNoZWV0TXVzaWMuTGluZVdpZHRoKjQ7XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCBTaGVldE11c2ljLk5vdGVXaWR0aC8yLCB5LCBcbiAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZVdpZHRoLzIsIHllbmQpO1xuXG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJCYXJTeW1ib2wgc3RhcnR0aW1lPXswfSB3aWR0aD17MX1cIiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0dGltZSwgd2lkdGgpO1xuICAgIH1cbn1cblxuXG59XG5cbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBCaXRtYXA6SW1hZ2VcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgQml0bWFwKFR5cGUgdHlwZSwgc3RyaW5nIGZpbGVuYW1lKVxyXG4gICAgICAgIDpiYXNlKHR5cGUsZmlsZW5hbWUpe1xyXG4gICAgICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFxyXG4gICAgfVxyXG59XHJcbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMSBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuXG4vKiogQGNsYXNzIEJsYW5rU3ltYm9sIFxuICogVGhlIEJsYW5rIHN5bWJvbCBpcyBhIG11c2ljIHN5bWJvbCB0aGF0IGRvZXNuJ3QgZHJhdyBhbnl0aGluZy4gIFRoaXNcbiAqIHN5bWJvbCBpcyB1c2VkIGZvciBhbGlnbm1lbnQgcHVycG9zZXMsIHRvIGFsaWduIG5vdGVzIGluIGRpZmZlcmVudCBcbiAqIHN0YWZmcyB3aGljaCBvY2N1ciBhdCB0aGUgc2FtZSB0aW1lLlxuICovXG5wdWJsaWMgY2xhc3MgQmxhbmtTeW1ib2wgOiBNdXNpY1N5bWJvbCB7XG4gICAgcHJpdmF0ZSBpbnQgc3RhcnR0aW1lOyBcbiAgICBwcml2YXRlIGludCB3aWR0aDtcblxuICAgIC8qKiBDcmVhdGUgYSBuZXcgQmxhbmtTeW1ib2wgd2l0aCB0aGUgZ2l2ZW4gc3RhcnR0aW1lIGFuZCB3aWR0aCAqL1xuICAgIHB1YmxpYyBCbGFua1N5bWJvbChpbnQgc3RhcnR0aW1lLCBpbnQgd2lkdGgpIHtcbiAgICAgICAgdGhpcy5zdGFydHRpbWUgPSBzdGFydHRpbWU7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSB0aW1lIChpbiBwdWxzZXMpIHRoaXMgc3ltYm9sIG9jY3VycyBhdC5cbiAgICAgKiBUaGlzIGlzIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBtZWFzdXJlIHRoaXMgc3ltYm9sIGJlbG9uZ3MgdG8uXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBTdGFydFRpbWUgeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHN0YXJ0dGltZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG1pbmltdW0gd2lkdGggKGluIHBpeGVscykgbmVlZGVkIHRvIGRyYXcgdGhpcyBzeW1ib2wgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IE1pbldpZHRoIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIDA7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0L1NldCB0aGUgd2lkdGggKGluIHBpeGVscykgb2YgdGhpcyBzeW1ib2wuIFRoZSB3aWR0aCBpcyBzZXRcbiAgICAgKiBpbiBTaGVldE11c2ljLkFsaWduU3ltYm9scygpIHRvIHZlcnRpY2FsbHkgYWxpZ24gc3ltYm9scy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFdpZHRoIHsgXG4gICAgICAgIGdldCB7IHJldHVybiB3aWR0aDsgfVxuICAgICAgICBzZXQgeyB3aWR0aCA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGFib3ZlIHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEFib3ZlU3RhZmYgeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIDA7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYmVsb3cgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQmVsb3dTdGFmZiB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBEcmF3IG5vdGhpbmcuXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHlsb2NhdGlvbiAoaW4gcGl4ZWxzKSB3aGVyZSB0aGUgdG9wIG9mIHRoZSBzdGFmZiBzdGFydHMuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIHZvaWQgRHJhdyhHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge31cblxuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiQmxhbmtTeW1ib2wgc3RhcnR0aW1lPXswfSB3aWR0aD17MX1cIiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0dGltZSwgd2lkdGgpO1xuICAgIH1cbn1cblxuXG59XG5cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG5wdWJsaWMgZW51bSBTdGVtRGlyIHsgVXAsIERvd24gfTtcblxuLyoqIEBjbGFzcyBOb3RlRGF0YVxuICogIENvbnRhaW5zIGZpZWxkcyBmb3IgZGlzcGxheWluZyBhIHNpbmdsZSBub3RlIGluIGEgY2hvcmQuXG4gKi9cbnB1YmxpYyBjbGFzcyBOb3RlRGF0YSB7XG4gICAgcHVibGljIGludCBudW1iZXI7ICAgICAgICAgICAgIC8qKiBUaGUgTWlkaSBub3RlIG51bWJlciwgdXNlZCB0byBkZXRlcm1pbmUgdGhlIGNvbG9yICovXG4gICAgcHVibGljIFdoaXRlTm90ZSB3aGl0ZW5vdGU7ICAgIC8qKiBUaGUgd2hpdGUgbm90ZSBsb2NhdGlvbiB0byBkcmF3ICovXG4gICAgcHVibGljIE5vdGVEdXJhdGlvbiBkdXJhdGlvbjsgIC8qKiBUaGUgZHVyYXRpb24gb2YgdGhlIG5vdGUgKi9cbiAgICBwdWJsaWMgYm9vbCBsZWZ0c2lkZTsgICAgICAgICAgLyoqIFdoZXRoZXIgdG8gZHJhdyBub3RlIHRvIHRoZSBsZWZ0IG9yIHJpZ2h0IG9mIHRoZSBzdGVtICovXG4gICAgcHVibGljIEFjY2lkIGFjY2lkOyAgICAgICAgICAgIC8qKiBVc2VkIHRvIGNyZWF0ZSB0aGUgQWNjaWRTeW1ib2xzIGZvciB0aGUgY2hvcmQgKi9cbn07XG5cbi8qKiBAY2xhc3MgQ2hvcmRTeW1ib2xcbiAqIEEgY2hvcmQgc3ltYm9sIHJlcHJlc2VudHMgYSBncm91cCBvZiBub3RlcyB0aGF0IGFyZSBwbGF5ZWQgYXQgdGhlIHNhbWVcbiAqIHRpbWUuICBBIGNob3JkIGluY2x1ZGVzIHRoZSBub3RlcywgdGhlIGFjY2lkZW50YWwgc3ltYm9scyBmb3IgZWFjaFxuICogbm90ZSwgYW5kIHRoZSBzdGVtIChvciBzdGVtcykgdG8gdXNlLiAgQSBzaW5nbGUgY2hvcmQgbWF5IGhhdmUgdHdvIFxuICogc3RlbXMgaWYgdGhlIG5vdGVzIGhhdmUgZGlmZmVyZW50IGR1cmF0aW9ucyAoZS5nLiBpZiBvbmUgbm90ZSBpcyBhXG4gKiBxdWFydGVyIG5vdGUsIGFuZCBhbm90aGVyIGlzIGFuIGVpZ2h0aCBub3RlKS5cbiAqL1xucHVibGljIGNsYXNzIENob3JkU3ltYm9sIDogTXVzaWNTeW1ib2wge1xuICAgIHByaXZhdGUgQ2xlZiBjbGVmOyAgICAgICAgICAgICAvKiogV2hpY2ggY2xlZiB0aGUgY2hvcmQgaXMgYmVpbmcgZHJhd24gaW4gKi9cbiAgICBwcml2YXRlIGludCBzdGFydHRpbWU7ICAgICAgICAgLyoqIFRoZSB0aW1lIChpbiBwdWxzZXMpIHRoZSBub3RlcyBvY2N1cnMgYXQgKi9cbiAgICBwcml2YXRlIGludCBlbmR0aW1lOyAgICAgICAgICAgLyoqIFRoZSBzdGFydHRpbWUgcGx1cyB0aGUgbG9uZ2VzdCBub3RlIGR1cmF0aW9uICovXG4gICAgcHJpdmF0ZSBOb3RlRGF0YVtdIG5vdGVkYXRhOyAgIC8qKiBUaGUgbm90ZXMgdG8gZHJhdyAqL1xuICAgIHByaXZhdGUgQWNjaWRTeW1ib2xbXSBhY2NpZHN5bWJvbHM7ICAgLyoqIFRoZSBhY2NpZGVudGFsIHN5bWJvbHMgdG8gZHJhdyAqL1xuICAgIHByaXZhdGUgaW50IHdpZHRoOyAgICAgICAgICAgICAvKiogVGhlIHdpZHRoIG9mIHRoZSBjaG9yZCAqL1xuICAgIHByaXZhdGUgU3RlbSBzdGVtMTsgICAgICAgICAgICAvKiogVGhlIHN0ZW0gb2YgdGhlIGNob3JkLiBDYW4gYmUgbnVsbC4gKi9cbiAgICBwcml2YXRlIFN0ZW0gc3RlbTI7ICAgICAgICAgICAgLyoqIFRoZSBzZWNvbmQgc3RlbSBvZiB0aGUgY2hvcmQuIENhbiBiZSBudWxsICovXG4gICAgcHJpdmF0ZSBib29sIGhhc3R3b3N0ZW1zOyAgICAgIC8qKiBUcnVlIGlmIHRoaXMgY2hvcmQgaGFzIHR3byBzdGVtcyAqL1xuICAgIHByaXZhdGUgU2hlZXRNdXNpYyBzaGVldG11c2ljOyAvKiogVXNlZCB0byBnZXQgY29sb3JzIGFuZCBvdGhlciBvcHRpb25zICovXG5cblxuICAgIC8qKiBDcmVhdGUgYSBuZXcgQ2hvcmQgU3ltYm9sIGZyb20gdGhlIGdpdmVuIGxpc3Qgb2YgbWlkaSBub3Rlcy5cbiAgICAgKiBBbGwgdGhlIG1pZGkgbm90ZXMgd2lsbCBoYXZlIHRoZSBzYW1lIHN0YXJ0IHRpbWUuICBVc2UgdGhlXG4gICAgICoga2V5IHNpZ25hdHVyZSB0byBnZXQgdGhlIHdoaXRlIGtleSBhbmQgYWNjaWRlbnRhbCBzeW1ib2wgZm9yXG4gICAgICogZWFjaCBub3RlLiAgVXNlIHRoZSB0aW1lIHNpZ25hdHVyZSB0byBjYWxjdWxhdGUgdGhlIGR1cmF0aW9uXG4gICAgICogb2YgdGhlIG5vdGVzLiBVc2UgdGhlIGNsZWYgd2hlbiBkcmF3aW5nIHRoZSBjaG9yZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgQ2hvcmRTeW1ib2woTGlzdDxNaWRpTm90ZT4gbWlkaW5vdGVzLCBLZXlTaWduYXR1cmUga2V5LCBcbiAgICAgICAgICAgICAgICAgICAgICAgVGltZVNpZ25hdHVyZSB0aW1lLCBDbGVmIGMsIFNoZWV0TXVzaWMgc2hlZXQpIHtcblxuICAgICAgICBpbnQgbGVuID0gbWlkaW5vdGVzLkNvdW50O1xuICAgICAgICBpbnQgaTtcblxuICAgICAgICBoYXN0d29zdGVtcyA9IGZhbHNlO1xuICAgICAgICBjbGVmID0gYztcbiAgICAgICAgc2hlZXRtdXNpYyA9IHNoZWV0O1xuXG4gICAgICAgIHN0YXJ0dGltZSA9IG1pZGlub3Rlc1swXS5TdGFydFRpbWU7XG4gICAgICAgIGVuZHRpbWUgPSBtaWRpbm90ZXNbMF0uRW5kVGltZTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbWlkaW5vdGVzLkNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpID4gMSkge1xuICAgICAgICAgICAgICAgIGlmIChtaWRpbm90ZXNbaV0uTnVtYmVyIDwgbWlkaW5vdGVzW2ktMV0uTnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBTeXN0ZW0uQXJndW1lbnRFeGNlcHRpb24oXCJDaG9yZCBub3RlcyBub3QgaW4gaW5jcmVhc2luZyBvcmRlciBieSBudW1iZXJcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZW5kdGltZSA9IE1hdGguTWF4KGVuZHRpbWUsIG1pZGlub3Rlc1tpXS5FbmRUaW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5vdGVkYXRhID0gQ3JlYXRlTm90ZURhdGEobWlkaW5vdGVzLCBrZXksIHRpbWUpO1xuICAgICAgICBhY2NpZHN5bWJvbHMgPSBDcmVhdGVBY2NpZFN5bWJvbHMobm90ZWRhdGEsIGNsZWYpO1xuXG5cbiAgICAgICAgLyogRmluZCBvdXQgaG93IG1hbnkgc3RlbXMgd2UgbmVlZCAoMSBvciAyKSAqL1xuICAgICAgICBOb3RlRHVyYXRpb24gZHVyMSA9IG5vdGVkYXRhWzBdLmR1cmF0aW9uO1xuICAgICAgICBOb3RlRHVyYXRpb24gZHVyMiA9IGR1cjE7XG4gICAgICAgIGludCBjaGFuZ2UgPSAtMTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG5vdGVkYXRhLkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBkdXIyID0gbm90ZWRhdGFbaV0uZHVyYXRpb247XG4gICAgICAgICAgICBpZiAoZHVyMSAhPSBkdXIyKSB7XG4gICAgICAgICAgICAgICAgY2hhbmdlID0gaTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkdXIxICE9IGR1cjIpIHtcbiAgICAgICAgICAgIC8qIFdlIGhhdmUgbm90ZXMgd2l0aCBkaWZmZXJlbnQgZHVyYXRpb25zLiAgU28gd2Ugd2lsbCBuZWVkXG4gICAgICAgICAgICAgKiB0d28gc3RlbXMuICBUaGUgZmlyc3Qgc3RlbSBwb2ludHMgZG93biwgYW5kIGNvbnRhaW5zIHRoZVxuICAgICAgICAgICAgICogYm90dG9tIG5vdGUgdXAgdG8gdGhlIG5vdGUgd2l0aCB0aGUgZGlmZmVyZW50IGR1cmF0aW9uLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIFRoZSBzZWNvbmQgc3RlbSBwb2ludHMgdXAsIGFuZCBjb250YWlucyB0aGUgbm90ZSB3aXRoIHRoZVxuICAgICAgICAgICAgICogZGlmZmVyZW50IGR1cmF0aW9uIHVwIHRvIHRoZSB0b3Agbm90ZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaGFzdHdvc3RlbXMgPSB0cnVlO1xuICAgICAgICAgICAgc3RlbTEgPSBuZXcgU3RlbShub3RlZGF0YVswXS53aGl0ZW5vdGUsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlZGF0YVtjaGFuZ2UtMV0ud2hpdGVub3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkdXIxLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3RlbS5Eb3duLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOb3Rlc092ZXJsYXAobm90ZWRhdGEsIDAsIGNoYW5nZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBzdGVtMiA9IG5ldyBTdGVtKG5vdGVkYXRhW2NoYW5nZV0ud2hpdGVub3RlLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90ZWRhdGFbbm90ZWRhdGEuTGVuZ3RoLTFdLndoaXRlbm90ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHVyMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0ZW0uVXAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5vdGVzT3ZlcmxhcChub3RlZGF0YSwgY2hhbmdlLCBub3RlZGF0YS5MZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8qIEFsbCBub3RlcyBoYXZlIHRoZSBzYW1lIGR1cmF0aW9uLCBzbyB3ZSBvbmx5IG5lZWQgb25lIHN0ZW0uICovXG4gICAgICAgICAgICBpbnQgZGlyZWN0aW9uID0gU3RlbURpcmVjdGlvbihub3RlZGF0YVswXS53aGl0ZW5vdGUsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90ZWRhdGFbbm90ZWRhdGEuTGVuZ3RoLTFdLndoaXRlbm90ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWYpO1xuXG4gICAgICAgICAgICBzdGVtMSA9IG5ldyBTdGVtKG5vdGVkYXRhWzBdLndoaXRlbm90ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90ZWRhdGFbbm90ZWRhdGEuTGVuZ3RoLTFdLndoaXRlbm90ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHVyMSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTm90ZXNPdmVybGFwKG5vdGVkYXRhLCAwLCBub3RlZGF0YS5MZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHN0ZW0yID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIEZvciB3aG9sZSBub3Rlcywgbm8gc3RlbSBpcyBkcmF3bi4gKi9cbiAgICAgICAgaWYgKGR1cjEgPT0gTm90ZUR1cmF0aW9uLldob2xlKVxuICAgICAgICAgICAgc3RlbTEgPSBudWxsO1xuICAgICAgICBpZiAoZHVyMiA9PSBOb3RlRHVyYXRpb24uV2hvbGUpXG4gICAgICAgICAgICBzdGVtMiA9IG51bGw7XG5cbiAgICAgICAgd2lkdGggPSBNaW5XaWR0aDtcbiAgICB9XG5cblxuICAgIC8qKiBHaXZlbiB0aGUgcmF3IG1pZGkgbm90ZXMgKHRoZSBub3RlIG51bWJlciBhbmQgZHVyYXRpb24gaW4gcHVsc2VzKSxcbiAgICAgKiBjYWxjdWxhdGUgdGhlIGZvbGxvd2luZyBub3RlIGRhdGE6XG4gICAgICogLSBUaGUgd2hpdGUga2V5XG4gICAgICogLSBUaGUgYWNjaWRlbnRhbCAoaWYgYW55KVxuICAgICAqIC0gVGhlIG5vdGUgZHVyYXRpb24gKGhhbGYsIHF1YXJ0ZXIsIGVpZ2h0aCwgZXRjKVxuICAgICAqIC0gVGhlIHNpZGUgaXQgc2hvdWxkIGJlIGRyYXduIChsZWZ0IG9yIHNpZGUpXG4gICAgICogQnkgZGVmYXVsdCwgbm90ZXMgYXJlIGRyYXduIG9uIHRoZSBsZWZ0IHNpZGUuICBIb3dldmVyLCBpZiB0d28gbm90ZXNcbiAgICAgKiBvdmVybGFwIChsaWtlIEEgYW5kIEIpIHlvdSBjYW5ub3QgZHJhdyB0aGUgbmV4dCBub3RlIGRpcmVjdGx5IGFib3ZlIGl0LlxuICAgICAqIEluc3RlYWQgeW91IG11c3Qgc2hpZnQgb25lIG9mIHRoZSBub3RlcyB0byB0aGUgcmlnaHQuXG4gICAgICpcbiAgICAgKiBUaGUgS2V5U2lnbmF0dXJlIGlzIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSB3aGl0ZSBrZXkgYW5kIGFjY2lkZW50YWwuXG4gICAgICogVGhlIFRpbWVTaWduYXR1cmUgaXMgdXNlZCB0byBkZXRlcm1pbmUgdGhlIGR1cmF0aW9uLlxuICAgICAqL1xuIFxuICAgIHByaXZhdGUgc3RhdGljIE5vdGVEYXRhW10gXG4gICAgQ3JlYXRlTm90ZURhdGEoTGlzdDxNaWRpTm90ZT4gbWlkaW5vdGVzLCBLZXlTaWduYXR1cmUga2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVGltZVNpZ25hdHVyZSB0aW1lKSB7XG5cbiAgICAgICAgaW50IGxlbiA9IG1pZGlub3Rlcy5Db3VudDtcbiAgICAgICAgTm90ZURhdGFbXSBub3RlZGF0YSA9IG5ldyBOb3RlRGF0YVtsZW5dO1xuXG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIE1pZGlOb3RlIG1pZGkgPSBtaWRpbm90ZXNbaV07XG4gICAgICAgICAgICBub3RlZGF0YVtpXSA9IG5ldyBOb3RlRGF0YSgpO1xuICAgICAgICAgICAgbm90ZWRhdGFbaV0ubnVtYmVyID0gbWlkaS5OdW1iZXI7XG4gICAgICAgICAgICBub3RlZGF0YVtpXS5sZWZ0c2lkZSA9IHRydWU7XG4gICAgICAgICAgICBub3RlZGF0YVtpXS53aGl0ZW5vdGUgPSBrZXkuR2V0V2hpdGVOb3RlKG1pZGkuTnVtYmVyKTtcbiAgICAgICAgICAgIG5vdGVkYXRhW2ldLmR1cmF0aW9uID0gdGltZS5HZXROb3RlRHVyYXRpb24obWlkaS5FbmRUaW1lIC0gbWlkaS5TdGFydFRpbWUpO1xuICAgICAgICAgICAgbm90ZWRhdGFbaV0uYWNjaWQgPSBrZXkuR2V0QWNjaWRlbnRhbChtaWRpLk51bWJlciwgbWlkaS5TdGFydFRpbWUgLyB0aW1lLk1lYXN1cmUpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoaSA+IDAgJiYgKG5vdGVkYXRhW2ldLndoaXRlbm90ZS5EaXN0KG5vdGVkYXRhW2ktMV0ud2hpdGVub3RlKSA9PSAxKSkge1xuICAgICAgICAgICAgICAgIC8qIFRoaXMgbm90ZSAobm90ZWRhdGFbaV0pIG92ZXJsYXBzIHdpdGggdGhlIHByZXZpb3VzIG5vdGUuXG4gICAgICAgICAgICAgICAgICogQ2hhbmdlIHRoZSBzaWRlIG9mIHRoaXMgbm90ZS5cbiAgICAgICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgICAgIGlmIChub3RlZGF0YVtpLTFdLmxlZnRzaWRlKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vdGVkYXRhW2ldLmxlZnRzaWRlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbm90ZWRhdGFbaV0ubGVmdHNpZGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbm90ZWRhdGFbaV0ubGVmdHNpZGUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBub3RlZGF0YTtcbiAgICB9XG5cblxuICAgIC8qKiBHaXZlbiB0aGUgbm90ZSBkYXRhICh0aGUgd2hpdGUga2V5cyBhbmQgYWNjaWRlbnRhbHMpLCBjcmVhdGUgXG4gICAgICogdGhlIEFjY2lkZW50YWwgU3ltYm9scyBhbmQgcmV0dXJuIHRoZW0uXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgQWNjaWRTeW1ib2xbXSBcbiAgICBDcmVhdGVBY2NpZFN5bWJvbHMoTm90ZURhdGFbXSBub3RlZGF0YSwgQ2xlZiBjbGVmKSB7XG4gICAgICAgIGludCBjb3VudCA9IDA7XG4gICAgICAgIGZvcmVhY2ggKE5vdGVEYXRhIG4gaW4gbm90ZWRhdGEpIHtcbiAgICAgICAgICAgIGlmIChuLmFjY2lkICE9IEFjY2lkLk5vbmUpIHtcbiAgICAgICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIEFjY2lkU3ltYm9sW10gc3ltYm9scyA9IG5ldyBBY2NpZFN5bWJvbFtjb3VudF07XG4gICAgICAgIGludCBpID0gMDtcbiAgICAgICAgZm9yZWFjaCAoTm90ZURhdGEgbiBpbiBub3RlZGF0YSkge1xuICAgICAgICAgICAgaWYgKG4uYWNjaWQgIT0gQWNjaWQuTm9uZSkge1xuICAgICAgICAgICAgICAgIHN5bWJvbHNbaV0gPSBuZXcgQWNjaWRTeW1ib2wobi5hY2NpZCwgbi53aGl0ZW5vdGUsIGNsZWYpO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3ltYm9scztcbiAgICB9XG5cbiAgICAvKiogQ2FsY3VsYXRlIHRoZSBzdGVtIGRpcmVjdGlvbiAoVXAgb3IgZG93bikgYmFzZWQgb24gdGhlIHRvcCBhbmRcbiAgICAgKiBib3R0b20gbm90ZSBpbiB0aGUgY2hvcmQuICBJZiB0aGUgYXZlcmFnZSBvZiB0aGUgbm90ZXMgaXMgYWJvdmVcbiAgICAgKiB0aGUgbWlkZGxlIG9mIHRoZSBzdGFmZiwgdGhlIGRpcmVjdGlvbiBpcyBkb3duLiAgRWxzZSwgdGhlXG4gICAgICogZGlyZWN0aW9uIGlzIHVwLlxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGludCBcbiAgICBTdGVtRGlyZWN0aW9uKFdoaXRlTm90ZSBib3R0b20sIFdoaXRlTm90ZSB0b3AsIENsZWYgY2xlZikge1xuICAgICAgICBXaGl0ZU5vdGUgbWlkZGxlO1xuICAgICAgICBpZiAoY2xlZiA9PSBDbGVmLlRyZWJsZSlcbiAgICAgICAgICAgIG1pZGRsZSA9IG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkIsIDUpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBtaWRkbGUgPSBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5ELCAzKTtcblxuICAgICAgICBpbnQgZGlzdCA9IG1pZGRsZS5EaXN0KGJvdHRvbSkgKyBtaWRkbGUuRGlzdCh0b3ApO1xuICAgICAgICBpZiAoZGlzdCA+PSAwKVxuICAgICAgICAgICAgcmV0dXJuIFN0ZW0uVXA7XG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICByZXR1cm4gU3RlbS5Eb3duO1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gd2hldGhlciBhbnkgb2YgdGhlIG5vdGVzIGluIG5vdGVkYXRhIChiZXR3ZWVuIHN0YXJ0IGFuZFxuICAgICAqIGVuZCBpbmRleGVzKSBvdmVybGFwLiAgVGhpcyBpcyBuZWVkZWQgYnkgdGhlIFN0ZW0gY2xhc3MgdG9cbiAgICAgKiBkZXRlcm1pbmUgdGhlIHBvc2l0aW9uIG9mIHRoZSBzdGVtIChsZWZ0IG9yIHJpZ2h0IG9mIG5vdGVzKS5cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBib29sIE5vdGVzT3ZlcmxhcChOb3RlRGF0YVtdIG5vdGVkYXRhLCBpbnQgc3RhcnQsIGludCBlbmQpIHtcbiAgICAgICAgZm9yIChpbnQgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICAgICAgICAgIGlmICghbm90ZWRhdGFbaV0ubGVmdHNpZGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgdGltZSAoaW4gcHVsc2VzKSB0aGlzIHN5bWJvbCBvY2N1cnMgYXQuXG4gICAgICogVGhpcyBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgbWVhc3VyZSB0aGlzIHN5bWJvbCBiZWxvbmdzIHRvLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgU3RhcnRUaW1lIHsgXG4gICAgICAgIGdldCB7IHJldHVybiBzdGFydHRpbWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBlbmQgdGltZSAoaW4gcHVsc2VzKSBvZiB0aGUgbG9uZ2VzdCBub3RlIGluIHRoZSBjaG9yZC5cbiAgICAgKiBVc2VkIHRvIGRldGVybWluZSB3aGV0aGVyIHR3byBhZGphY2VudCBjaG9yZHMgY2FuIGJlIGpvaW5lZFxuICAgICAqIGJ5IGEgc3RlbS5cbiAgICAgKi9cbiAgICBwdWJsaWMgaW50IEVuZFRpbWUgeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIGVuZHRpbWU7IH1cbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBjbGVmIHRoaXMgY2hvcmQgaXMgZHJhd24gaW4uICovXG4gICAgcHVibGljIENsZWYgQ2xlZiB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gY2xlZjsgfVxuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGlzIGNob3JkIGhhcyB0d28gc3RlbXMgKi9cbiAgICBwdWJsaWMgYm9vbCBIYXNUd29TdGVtcyB7XG4gICAgICAgIGdldCB7IHJldHVybiBoYXN0d29zdGVtczsgfVxuICAgIH1cblxuICAgIC8qIFJldHVybiB0aGUgc3RlbSB3aWxsIHRoZSBzbWFsbGVzdCBkdXJhdGlvbi4gIFRoaXMgcHJvcGVydHlcbiAgICAgKiBpcyB1c2VkIHdoZW4gbWFraW5nIGNob3JkIHBhaXJzIChjaG9yZHMgam9pbmVkIGJ5IGEgaG9yaXpvbnRhbFxuICAgICAqIGJlYW0gc3RlbSkuIFRoZSBzdGVtIGR1cmF0aW9ucyBtdXN0IG1hdGNoIGluIG9yZGVyIHRvIG1ha2VcbiAgICAgKiBhIGNob3JkIHBhaXIuICBJZiBhIGNob3JkIGhhcyB0d28gc3RlbXMsIHdlIGFsd2F5cyByZXR1cm5cbiAgICAgKiB0aGUgb25lIHdpdGggYSBzbWFsbGVyIGR1cmF0aW9uLCBiZWNhdXNlIGl0IGhhcyBhIGJldHRlciBcbiAgICAgKiBjaGFuY2Ugb2YgbWFraW5nIGEgcGFpci5cbiAgICAgKi9cbiAgICBwdWJsaWMgU3RlbSBTdGVtIHtcbiAgICAgICAgZ2V0IHsgXG4gICAgICAgICAgICBpZiAoc3RlbTEgPT0gbnVsbCkgeyByZXR1cm4gc3RlbTI7IH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHN0ZW0yID09IG51bGwpIHsgcmV0dXJuIHN0ZW0xOyB9XG4gICAgICAgICAgICBlbHNlIGlmIChzdGVtMS5EdXJhdGlvbiA8IHN0ZW0yLkR1cmF0aW9uKSB7IHJldHVybiBzdGVtMTsgfVxuICAgICAgICAgICAgZWxzZSB7IHJldHVybiBzdGVtMjsgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEdldC9TZXQgdGhlIHdpZHRoIChpbiBwaXhlbHMpIG9mIHRoaXMgc3ltYm9sLiBUaGUgd2lkdGggaXMgc2V0XG4gICAgICogaW4gU2hlZXRNdXNpYy5BbGlnblN5bWJvbHMoKSB0byB2ZXJ0aWNhbGx5IGFsaWduIHN5bWJvbHMuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBXaWR0aCB7XG4gICAgICAgIGdldCB7IHJldHVybiB3aWR0aDsgfVxuICAgICAgICBzZXQgeyB3aWR0aCA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbWluaW11bSB3aWR0aCAoaW4gcGl4ZWxzKSBuZWVkZWQgdG8gZHJhdyB0aGlzIHN5bWJvbCAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgTWluV2lkdGgge1xuICAgICAgICBnZXQgeyByZXR1cm4gR2V0TWluV2lkdGgoKTsgfVxuICAgIH1cblxuICAgIC8qIFJldHVybiB0aGUgbWluaW11bSB3aWR0aCBuZWVkZWQgdG8gZGlzcGxheSB0aGlzIGNob3JkLlxuICAgICAqXG4gICAgICogVGhlIGFjY2lkZW50YWwgc3ltYm9scyBjYW4gYmUgZHJhd24gYWJvdmUgb25lIGFub3RoZXIgYXMgbG9uZ1xuICAgICAqIGFzIHRoZXkgZG9uJ3Qgb3ZlcmxhcCAodGhleSBtdXN0IGJlIGF0IGxlYXN0IDYgbm90ZXMgYXBhcnQpLlxuICAgICAqIElmIHR3byBhY2NpZGVudGFsIHN5bWJvbHMgZG8gb3ZlcmxhcCwgdGhlIGFjY2lkZW50YWwgc3ltYm9sXG4gICAgICogb24gdG9wIG11c3QgYmUgc2hpZnRlZCB0byB0aGUgcmlnaHQuICBTbyB0aGUgd2lkdGggbmVlZGVkIGZvclxuICAgICAqIGFjY2lkZW50YWwgc3ltYm9scyBkZXBlbmRzIG9uIHdoZXRoZXIgdGhleSBvdmVybGFwIG9yIG5vdC5cbiAgICAgKlxuICAgICAqIElmIHdlIGFyZSBhbHNvIGRpc3BsYXlpbmcgdGhlIGxldHRlcnMsIGluY2x1ZGUgZXh0cmEgd2lkdGguXG4gICAgICovXG4gICAgaW50IEdldE1pbldpZHRoKCkge1xuICAgICAgICAvKiBUaGUgd2lkdGggbmVlZGVkIGZvciB0aGUgbm90ZSBjaXJjbGVzICovXG4gICAgICAgIGludCByZXN1bHQgPSAyKlNoZWV0TXVzaWMuTm90ZUhlaWdodCArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCozLzQ7XG5cbiAgICAgICAgaWYgKGFjY2lkc3ltYm9scy5MZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gYWNjaWRzeW1ib2xzWzBdLk1pbldpZHRoO1xuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDE7IGkgPCBhY2NpZHN5bWJvbHMuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBBY2NpZFN5bWJvbCBhY2NpZCA9IGFjY2lkc3ltYm9sc1tpXTtcbiAgICAgICAgICAgICAgICBBY2NpZFN5bWJvbCBwcmV2ID0gYWNjaWRzeW1ib2xzW2ktMV07XG4gICAgICAgICAgICAgICAgaWYgKGFjY2lkLk5vdGUuRGlzdChwcmV2Lk5vdGUpIDwgNikge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gYWNjaWQuTWluV2lkdGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChzaGVldG11c2ljICE9IG51bGwgJiYgc2hlZXRtdXNpYy5TaG93Tm90ZUxldHRlcnMgIT0gTWlkaU9wdGlvbnMuTm90ZU5hbWVOb25lKSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gODtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGFib3ZlIHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEFib3ZlU3RhZmYge1xuICAgICAgICBnZXQgeyByZXR1cm4gR2V0QWJvdmVTdGFmZigpOyB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbnQgR2V0QWJvdmVTdGFmZigpIHtcbiAgICAgICAgLyogRmluZCB0aGUgdG9wbW9zdCBub3RlIGluIHRoZSBjaG9yZCAqL1xuICAgICAgICBXaGl0ZU5vdGUgdG9wbm90ZSA9IG5vdGVkYXRhWyBub3RlZGF0YS5MZW5ndGgtMSBdLndoaXRlbm90ZTtcblxuICAgICAgICAvKiBUaGUgc3RlbS5FbmQgaXMgdGhlIG5vdGUgcG9zaXRpb24gd2hlcmUgdGhlIHN0ZW0gZW5kcy5cbiAgICAgICAgICogQ2hlY2sgaWYgdGhlIHN0ZW0gZW5kIGlzIGhpZ2hlciB0aGFuIHRoZSB0b3Agbm90ZS5cbiAgICAgICAgICovXG4gICAgICAgIGlmIChzdGVtMSAhPSBudWxsKVxuICAgICAgICAgICAgdG9wbm90ZSA9IFdoaXRlTm90ZS5NYXgodG9wbm90ZSwgc3RlbTEuRW5kKTtcbiAgICAgICAgaWYgKHN0ZW0yICE9IG51bGwpXG4gICAgICAgICAgICB0b3Bub3RlID0gV2hpdGVOb3RlLk1heCh0b3Bub3RlLCBzdGVtMi5FbmQpO1xuXG4gICAgICAgIGludCBkaXN0ID0gdG9wbm90ZS5EaXN0KFdoaXRlTm90ZS5Ub3AoY2xlZikpICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG4gICAgICAgIGludCByZXN1bHQgPSAwO1xuICAgICAgICBpZiAoZGlzdCA+IDApXG4gICAgICAgICAgICByZXN1bHQgPSBkaXN0O1xuXG4gICAgICAgIC8qIENoZWNrIGlmIGFueSBhY2NpZGVudGFsIHN5bWJvbHMgZXh0ZW5kIGFib3ZlIHRoZSBzdGFmZiAqL1xuICAgICAgICBmb3JlYWNoIChBY2NpZFN5bWJvbCBzeW1ib2wgaW4gYWNjaWRzeW1ib2xzKSB7XG4gICAgICAgICAgICBpZiAoc3ltYm9sLkFib3ZlU3RhZmYgPiByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBzeW1ib2wuQWJvdmVTdGFmZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBiZWxvdyB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBCZWxvd1N0YWZmIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIEdldEJlbG93U3RhZmYoKTsgfVxuICAgIH1cblxuICAgIHByaXZhdGUgaW50IEdldEJlbG93U3RhZmYoKSB7XG4gICAgICAgIC8qIEZpbmQgdGhlIGJvdHRvbSBub3RlIGluIHRoZSBjaG9yZCAqL1xuICAgICAgICBXaGl0ZU5vdGUgYm90dG9tbm90ZSA9IG5vdGVkYXRhWzBdLndoaXRlbm90ZTtcblxuICAgICAgICAvKiBUaGUgc3RlbS5FbmQgaXMgdGhlIG5vdGUgcG9zaXRpb24gd2hlcmUgdGhlIHN0ZW0gZW5kcy5cbiAgICAgICAgICogQ2hlY2sgaWYgdGhlIHN0ZW0gZW5kIGlzIGxvd2VyIHRoYW4gdGhlIGJvdHRvbSBub3RlLlxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKHN0ZW0xICE9IG51bGwpXG4gICAgICAgICAgICBib3R0b21ub3RlID0gV2hpdGVOb3RlLk1pbihib3R0b21ub3RlLCBzdGVtMS5FbmQpO1xuICAgICAgICBpZiAoc3RlbTIgIT0gbnVsbClcbiAgICAgICAgICAgIGJvdHRvbW5vdGUgPSBXaGl0ZU5vdGUuTWluKGJvdHRvbW5vdGUsIHN0ZW0yLkVuZCk7XG5cbiAgICAgICAgaW50IGRpc3QgPSBXaGl0ZU5vdGUuQm90dG9tKGNsZWYpLkRpc3QoYm90dG9tbm90ZSkgKlxuICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG4gICAgICAgIGludCByZXN1bHQgPSAwO1xuICAgICAgICBpZiAoZGlzdCA+IDApXG4gICAgICAgICAgICByZXN1bHQgPSBkaXN0O1xuXG4gICAgICAgIC8qIENoZWNrIGlmIGFueSBhY2NpZGVudGFsIHN5bWJvbHMgZXh0ZW5kIGJlbG93IHRoZSBzdGFmZiAqLyBcbiAgICAgICAgZm9yZWFjaCAoQWNjaWRTeW1ib2wgc3ltYm9sIGluIGFjY2lkc3ltYm9scykge1xuICAgICAgICAgICAgaWYgKHN5bWJvbC5CZWxvd1N0YWZmID4gcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gc3ltYm9sLkJlbG93U3RhZmY7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBuYW1lIGZvciB0aGlzIG5vdGUgKi9cbiAgICBwcml2YXRlIHN0cmluZyBOb3RlTmFtZShpbnQgbm90ZW51bWJlciwgV2hpdGVOb3RlIHdoaXRlbm90ZSkge1xuICAgICAgICBpZiAoc2hlZXRtdXNpYy5TaG93Tm90ZUxldHRlcnMgPT0gTWlkaU9wdGlvbnMuTm90ZU5hbWVMZXR0ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBMZXR0ZXIobm90ZW51bWJlciwgd2hpdGVub3RlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzaGVldG11c2ljLlNob3dOb3RlTGV0dGVycyA9PSBNaWRpT3B0aW9ucy5Ob3RlTmFtZUZpeGVkRG9SZU1pKSB7XG4gICAgICAgICAgICBzdHJpbmdbXSBmaXhlZERvUmVNaSA9IHtcbiAgICAgICAgICAgICAgICBcIkxhXCIsIFwiTGlcIiwgXCJUaVwiLCBcIkRvXCIsIFwiRGlcIiwgXCJSZVwiLCBcIlJpXCIsIFwiTWlcIiwgXCJGYVwiLCBcIkZpXCIsIFwiU29cIiwgXCJTaVwiIFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGludCBub3Rlc2NhbGUgPSBOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyKTtcbiAgICAgICAgICAgIHJldHVybiBmaXhlZERvUmVNaVtub3Rlc2NhbGVdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHNoZWV0bXVzaWMuU2hvd05vdGVMZXR0ZXJzID09IE1pZGlPcHRpb25zLk5vdGVOYW1lTW92YWJsZURvUmVNaSkge1xuICAgICAgICAgICAgc3RyaW5nW10gZml4ZWREb1JlTWkgPSB7XG4gICAgICAgICAgICAgICAgXCJMYVwiLCBcIkxpXCIsIFwiVGlcIiwgXCJEb1wiLCBcIkRpXCIsIFwiUmVcIiwgXCJSaVwiLCBcIk1pXCIsIFwiRmFcIiwgXCJGaVwiLCBcIlNvXCIsIFwiU2lcIiBcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpbnQgbWFpbnNjYWxlID0gc2hlZXRtdXNpYy5NYWluS2V5Lk5vdGVzY2FsZSgpO1xuICAgICAgICAgICAgaW50IGRpZmYgPSBOb3RlU2NhbGUuQyAtIG1haW5zY2FsZTtcbiAgICAgICAgICAgIG5vdGVudW1iZXIgKz0gZGlmZjtcbiAgICAgICAgICAgIGlmIChub3RlbnVtYmVyIDwgMCkge1xuICAgICAgICAgICAgICAgIG5vdGVudW1iZXIgKz0gMTI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbnQgbm90ZXNjYWxlID0gTm90ZVNjYWxlLkZyb21OdW1iZXIobm90ZW51bWJlcik7XG4gICAgICAgICAgICByZXR1cm4gZml4ZWREb1JlTWlbbm90ZXNjYWxlXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzaGVldG11c2ljLlNob3dOb3RlTGV0dGVycyA9PSBNaWRpT3B0aW9ucy5Ob3RlTmFtZUZpeGVkTnVtYmVyKSB7XG4gICAgICAgICAgICBzdHJpbmdbXSBudW0gPSB7XG4gICAgICAgICAgICAgICAgXCIxMFwiLCBcIjExXCIsIFwiMTJcIiwgXCIxXCIsIFwiMlwiLCBcIjNcIiwgXCI0XCIsIFwiNVwiLCBcIjZcIiwgXCI3XCIsIFwiOFwiLCBcIjlcIiBcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpbnQgbm90ZXNjYWxlID0gTm90ZVNjYWxlLkZyb21OdW1iZXIobm90ZW51bWJlcik7XG4gICAgICAgICAgICByZXR1cm4gbnVtW25vdGVzY2FsZV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc2hlZXRtdXNpYy5TaG93Tm90ZUxldHRlcnMgPT0gTWlkaU9wdGlvbnMuTm90ZU5hbWVNb3ZhYmxlTnVtYmVyKSB7XG4gICAgICAgICAgICBzdHJpbmdbXSBudW0gPSB7XG4gICAgICAgICAgICAgICAgXCIxMFwiLCBcIjExXCIsIFwiMTJcIiwgXCIxXCIsIFwiMlwiLCBcIjNcIiwgXCI0XCIsIFwiNVwiLCBcIjZcIiwgXCI3XCIsIFwiOFwiLCBcIjlcIiBcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpbnQgbWFpbnNjYWxlID0gc2hlZXRtdXNpYy5NYWluS2V5Lk5vdGVzY2FsZSgpO1xuICAgICAgICAgICAgaW50IGRpZmYgPSBOb3RlU2NhbGUuQyAtIG1haW5zY2FsZTtcbiAgICAgICAgICAgIG5vdGVudW1iZXIgKz0gZGlmZjtcbiAgICAgICAgICAgIGlmIChub3RlbnVtYmVyIDwgMCkge1xuICAgICAgICAgICAgICAgIG5vdGVudW1iZXIgKz0gMTI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbnQgbm90ZXNjYWxlID0gTm90ZVNjYWxlLkZyb21OdW1iZXIobm90ZW51bWJlcik7XG4gICAgICAgICAgICByZXR1cm4gbnVtW25vdGVzY2FsZV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIGxldHRlciAoQSwgQSMsIEJiKSByZXByZXNlbnRpbmcgdGhpcyBub3RlICovXG4gICAgcHJpdmF0ZSBzdHJpbmcgTGV0dGVyKGludCBub3RlbnVtYmVyLCBXaGl0ZU5vdGUgd2hpdGVub3RlKSB7XG4gICAgICAgIGludCBub3Rlc2NhbGUgPSBOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyKTtcbiAgICAgICAgc3dpdGNoKG5vdGVzY2FsZSkge1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQTogcmV0dXJuIFwiQVwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQjogcmV0dXJuIFwiQlwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQzogcmV0dXJuIFwiQ1wiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRDogcmV0dXJuIFwiRFwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRTogcmV0dXJuIFwiRVwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRjogcmV0dXJuIFwiRlwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRzogcmV0dXJuIFwiR1wiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQXNoYXJwOlxuICAgICAgICAgICAgICAgIGlmICh3aGl0ZW5vdGUuTGV0dGVyID09IFdoaXRlTm90ZS5BKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJBI1wiO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiQmJcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkNzaGFycDpcbiAgICAgICAgICAgICAgICBpZiAod2hpdGVub3RlLkxldHRlciA9PSBXaGl0ZU5vdGUuQylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiQyNcIjtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIkRiXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5Ec2hhcnA6XG4gICAgICAgICAgICAgICAgaWYgKHdoaXRlbm90ZS5MZXR0ZXIgPT0gV2hpdGVOb3RlLkQpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIkQjXCI7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJFYlwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRnNoYXJwOlxuICAgICAgICAgICAgICAgIGlmICh3aGl0ZW5vdGUuTGV0dGVyID09IFdoaXRlTm90ZS5GKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJGI1wiO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiR2JcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkdzaGFycDpcbiAgICAgICAgICAgICAgICBpZiAod2hpdGVub3RlLkxldHRlciA9PSBXaGl0ZU5vdGUuRylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiRyNcIjtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIkFiXCI7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIERyYXcgdGhlIENob3JkIFN5bWJvbDpcbiAgICAgKiAtIERyYXcgdGhlIGFjY2lkZW50YWwgc3ltYm9scy5cbiAgICAgKiAtIERyYXcgdGhlIGJsYWNrIGNpcmNsZSBub3Rlcy5cbiAgICAgKiAtIERyYXcgdGhlIHN0ZW1zLlxuICAgICAgQHBhcmFtIHl0b3AgVGhlIHlsb2NhdGlvbiAoaW4gcGl4ZWxzKSB3aGVyZSB0aGUgdG9wIG9mIHRoZSBzdGFmZiBzdGFydHMuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIHZvaWQgRHJhdyhHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICAvKiBBbGlnbiB0aGUgY2hvcmQgdG8gdGhlIHJpZ2h0ICovXG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKFdpZHRoIC0gTWluV2lkdGgsIDApO1xuXG4gICAgICAgIC8qIERyYXcgdGhlIGFjY2lkZW50YWxzLiAqL1xuICAgICAgICBXaGl0ZU5vdGUgdG9wc3RhZmYgPSBXaGl0ZU5vdGUuVG9wKGNsZWYpO1xuICAgICAgICBpbnQgeHBvcyA9IERyYXdBY2NpZChnLCBwZW4sIHl0b3ApO1xuXG4gICAgICAgIC8qIERyYXcgdGhlIG5vdGVzICovXG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKHhwb3MsIDApO1xuICAgICAgICBEcmF3Tm90ZXMoZywgcGVuLCB5dG9wLCB0b3BzdGFmZik7XG4gICAgICAgIGlmIChzaGVldG11c2ljICE9IG51bGwgJiYgc2hlZXRtdXNpYy5TaG93Tm90ZUxldHRlcnMgIT0gMCkge1xuICAgICAgICAgICAgRHJhd05vdGVMZXR0ZXJzKGcsIHBlbiwgeXRvcCwgdG9wc3RhZmYpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogRHJhdyB0aGUgc3RlbXMgKi9cbiAgICAgICAgaWYgKHN0ZW0xICE9IG51bGwpXG4gICAgICAgICAgICBzdGVtMS5EcmF3KGcsIHBlbiwgeXRvcCwgdG9wc3RhZmYpO1xuICAgICAgICBpZiAoc3RlbTIgIT0gbnVsbClcbiAgICAgICAgICAgIHN0ZW0yLkRyYXcoZywgcGVuLCB5dG9wLCB0b3BzdGFmZik7XG5cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLXhwb3MsIDApO1xuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKFdpZHRoIC0gTWluV2lkdGgpLCAwKTtcbiAgICB9XG5cbiAgICAvKiBEcmF3IHRoZSBhY2NpZGVudGFsIHN5bWJvbHMuICBJZiB0d28gc3ltYm9scyBvdmVybGFwIChpZiB0aGV5XG4gICAgICogYXJlIGxlc3MgdGhhbiA2IG5vdGVzIGFwYXJ0KSwgd2UgY2Fubm90IGRyYXcgdGhlIHN5bWJvbCBkaXJlY3RseVxuICAgICAqIGFib3ZlIHRoZSBwcmV2aW91cyBvbmUuICBJbnN0ZWFkLCB3ZSBtdXN0IHNoaWZ0IGl0IHRvIHRoZSByaWdodC5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKiBAcmV0dXJuIFRoZSB4IHBpeGVsIHdpZHRoIHVzZWQgYnkgYWxsIHRoZSBhY2NpZGVudGFscy5cbiAgICAgKi9cbiAgICBwdWJsaWMgaW50IERyYXdBY2NpZChHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICBpbnQgeHBvcyA9IDA7XG5cbiAgICAgICAgQWNjaWRTeW1ib2wgcHJldiA9IG51bGw7XG4gICAgICAgIGZvcmVhY2ggKEFjY2lkU3ltYm9sIHN5bWJvbCBpbiBhY2NpZHN5bWJvbHMpIHtcbiAgICAgICAgICAgIGlmIChwcmV2ICE9IG51bGwgJiYgc3ltYm9sLk5vdGUuRGlzdChwcmV2Lk5vdGUpIDwgNikge1xuICAgICAgICAgICAgICAgIHhwb3MgKz0gc3ltYm9sLldpZHRoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeHBvcywgMCk7XG4gICAgICAgICAgICBzeW1ib2wuRHJhdyhnLCBwZW4sIHl0b3ApO1xuICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLXhwb3MsIDApO1xuICAgICAgICAgICAgcHJldiA9IHN5bWJvbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJldiAhPSBudWxsKSB7XG4gICAgICAgICAgICB4cG9zICs9IHByZXYuV2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHhwb3M7XG4gICAgfVxuXG4gICAgLyoqIERyYXcgdGhlIGJsYWNrIGNpcmNsZSBub3Rlcy5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKiBAcGFyYW0gdG9wc3RhZmYgVGhlIHdoaXRlIG5vdGUgb2YgdGhlIHRvcCBvZiB0aGUgc3RhZmYuXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgRHJhd05vdGVzKEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wLCBXaGl0ZU5vdGUgdG9wc3RhZmYpIHtcbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICAgICAgZm9yZWFjaCAoTm90ZURhdGEgbm90ZSBpbiBub3RlZGF0YSkge1xuICAgICAgICAgICAgLyogR2V0IHRoZSB4LHkgcG9zaXRpb24gdG8gZHJhdyB0aGUgbm90ZSAqL1xuICAgICAgICAgICAgaW50IHlub3RlID0geXRvcCArIHRvcHN0YWZmLkRpc3Qobm90ZS53aGl0ZW5vdGUpICogXG4gICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcblxuICAgICAgICAgICAgaW50IHhub3RlID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNDtcbiAgICAgICAgICAgIGlmICghbm90ZS5sZWZ0c2lkZSlcbiAgICAgICAgICAgICAgICB4bm90ZSArPSBTaGVldE11c2ljLk5vdGVXaWR0aDtcblxuICAgICAgICAgICAgLyogRHJhdyByb3RhdGVkIGVsbGlwc2UuICBZb3UgbXVzdCBmaXJzdCB0cmFuc2xhdGUgKDAsMClcbiAgICAgICAgICAgICAqIHRvIHRoZSBjZW50ZXIgb2YgdGhlIGVsbGlwc2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKHhub3RlICsgU2hlZXRNdXNpYy5Ob3RlV2lkdGgvMiArIDEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeW5vdGUgLSBTaGVldE11c2ljLkxpbmVXaWR0aCArIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIpO1xuICAgICAgICAgICAgZy5Sb3RhdGVUcmFuc2Zvcm0oLTQ1KTtcblxuICAgICAgICAgICAgaWYgKHNoZWV0bXVzaWMgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHBlbi5Db2xvciA9IHNoZWV0bXVzaWMuTm90ZUNvbG9yKG5vdGUubnVtYmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHBlbi5Db2xvciA9IENvbG9yLkJsYWNrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobm90ZS5kdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uV2hvbGUgfHwgXG4gICAgICAgICAgICAgICAgbm90ZS5kdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uSGFsZiB8fFxuICAgICAgICAgICAgICAgIG5vdGUuZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEhhbGYpIHtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0VsbGlwc2UocGVuLCAtU2hlZXRNdXNpYy5Ob3RlV2lkdGgvMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC0xKTtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0VsbGlwc2UocGVuLCAtU2hlZXRNdXNpYy5Ob3RlV2lkdGgvMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgKyAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQtMik7XG5cbiAgICAgICAgICAgICAgICBnLkRyYXdFbGxpcHNlKHBlbiwgLVNoZWV0TXVzaWMuTm90ZVdpZHRoLzIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLVNoZWV0TXVzaWMuTm90ZUhlaWdodC8yICsgMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZVdpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LTMpO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBCcnVzaCBicnVzaCA9IEJydXNoZXMuQmxhY2s7XG4gICAgICAgICAgICAgICAgaWYgKHBlbi5Db2xvciAhPSBDb2xvci5CbGFjaykge1xuICAgICAgICAgICAgICAgICAgICBicnVzaCA9IG5ldyBTb2xpZEJydXNoKHBlbi5Db2xvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGcuRmlsbEVsbGlwc2UoYnJ1c2gsIC1TaGVldE11c2ljLk5vdGVXaWR0aC8yLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC1TaGVldE11c2ljLk5vdGVIZWlnaHQvMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZVdpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LTEpO1xuICAgICAgICAgICAgICAgIGlmIChwZW4uQ29sb3IgIT0gQ29sb3IuQmxhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgYnJ1c2guRGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcGVuLkNvbG9yID0gQ29sb3IuQmxhY2s7XG4gICAgICAgICAgICBnLkRyYXdFbGxpcHNlKHBlbiwgLVNoZWV0TXVzaWMuTm90ZVdpZHRoLzIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAtU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC0xKTtcblxuICAgICAgICAgICAgZy5Sb3RhdGVUcmFuc2Zvcm0oNDUpO1xuICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oIC0gKHhub3RlICsgU2hlZXRNdXNpYy5Ob3RlV2lkdGgvMiArIDEpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtICh5bm90ZSAtIFNoZWV0TXVzaWMuTGluZVdpZHRoICsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIpKTtcblxuICAgICAgICAgICAgLyogRHJhdyBhIGRvdCBpZiB0aGlzIGlzIGEgZG90dGVkIGR1cmF0aW9uLiAqL1xuICAgICAgICAgICAgaWYgKG5vdGUuZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEhhbGYgfHxcbiAgICAgICAgICAgICAgICBub3RlLmR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRRdWFydGVyIHx8XG4gICAgICAgICAgICAgICAgbm90ZS5kdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoKSB7XG5cbiAgICAgICAgICAgICAgICBnLkZpbGxFbGxpcHNlKEJydXNoZXMuQmxhY2ssIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeG5vdGUgKyBTaGVldE11c2ljLk5vdGVXaWR0aCArIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlub3RlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMywgNCwgNCk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogRHJhdyBob3Jpem9udGFsIGxpbmVzIGlmIG5vdGUgaXMgYWJvdmUvYmVsb3cgdGhlIHN0YWZmICovXG4gICAgICAgICAgICBXaGl0ZU5vdGUgdG9wID0gdG9wc3RhZmYuQWRkKDEpO1xuICAgICAgICAgICAgaW50IGRpc3QgPSBub3RlLndoaXRlbm90ZS5EaXN0KHRvcCk7XG4gICAgICAgICAgICBpbnQgeSA9IHl0b3AgLSBTaGVldE11c2ljLkxpbmVXaWR0aDtcblxuICAgICAgICAgICAgaWYgKGRpc3QgPj0gMikge1xuICAgICAgICAgICAgICAgIGZvciAoaW50IGkgPSAyOyBpIDw9IGRpc3Q7IGkgKz0gMikge1xuICAgICAgICAgICAgICAgICAgICB5IC09IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHhub3RlIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCwgeSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4bm90ZSArIFNoZWV0TXVzaWMuTm90ZVdpZHRoICsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxpbmVTcGFjZS80LCB5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIFdoaXRlTm90ZSBib3R0b20gPSB0b3AuQWRkKC04KTtcbiAgICAgICAgICAgIHkgPSB5dG9wICsgKFNoZWV0TXVzaWMuTGluZVNwYWNlICsgU2hlZXRNdXNpYy5MaW5lV2lkdGgpICogNCAtIDE7XG4gICAgICAgICAgICBkaXN0ID0gYm90dG9tLkRpc3Qobm90ZS53aGl0ZW5vdGUpO1xuICAgICAgICAgICAgaWYgKGRpc3QgPj0gMikge1xuICAgICAgICAgICAgICAgIGZvciAoaW50IGkgPSAyOyBpIDw9IGRpc3Q7IGkrPSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIHkgKz0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeG5vdGUgLSBTaGVldE11c2ljLkxpbmVTcGFjZS80LCB5LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhub3RlICsgU2hlZXRNdXNpYy5Ob3RlV2lkdGggKyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQsIHkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIEVuZCBkcmF3aW5nIGhvcml6b250YWwgbGluZXMgKi9cblxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIERyYXcgdGhlIG5vdGUgbGV0dGVycyAoQSwgQSMsIEJiLCBldGMpIG5leHQgdG8gdGhlIG5vdGUgY2lyY2xlcy5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKiBAcGFyYW0gdG9wc3RhZmYgVGhlIHdoaXRlIG5vdGUgb2YgdGhlIHRvcCBvZiB0aGUgc3RhZmYuXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgRHJhd05vdGVMZXR0ZXJzKEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wLCBXaGl0ZU5vdGUgdG9wc3RhZmYpIHtcbiAgICAgICAgYm9vbCBvdmVybGFwID0gTm90ZXNPdmVybGFwKG5vdGVkYXRhLCAwLCBub3RlZGF0YS5MZW5ndGgpO1xuICAgICAgICBwZW4uV2lkdGggPSAxO1xuXG4gICAgICAgIGZvcmVhY2ggKE5vdGVEYXRhIG5vdGUgaW4gbm90ZWRhdGEpIHtcbiAgICAgICAgICAgIGlmICghbm90ZS5sZWZ0c2lkZSkge1xuICAgICAgICAgICAgICAgIC8qIFRoZXJlJ3Mgbm90IGVub3VnaHQgcGl4ZWwgcm9vbSB0byBzaG93IHRoZSBsZXR0ZXIgKi9cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogR2V0IHRoZSB4LHkgcG9zaXRpb24gdG8gZHJhdyB0aGUgbm90ZSAqL1xuICAgICAgICAgICAgaW50IHlub3RlID0geXRvcCArIHRvcHN0YWZmLkRpc3Qobm90ZS53aGl0ZW5vdGUpICogXG4gICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcblxuICAgICAgICAgICAgLyogRHJhdyB0aGUgbGV0dGVyIHRvIHRoZSByaWdodCBzaWRlIG9mIHRoZSBub3RlICovXG4gICAgICAgICAgICBpbnQgeG5vdGUgPSBTaGVldE11c2ljLk5vdGVXaWR0aCArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQ7XG5cbiAgICAgICAgICAgIGlmIChub3RlLmR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRIYWxmIHx8XG4gICAgICAgICAgICAgICAgbm90ZS5kdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkUXVhcnRlciB8fFxuICAgICAgICAgICAgICAgIG5vdGUuZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCB8fCBvdmVybGFwKSB7XG5cbiAgICAgICAgICAgICAgICB4bm90ZSArPSBTaGVldE11c2ljLk5vdGVXaWR0aC8yO1xuICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIGcuRHJhd1N0cmluZyhOb3RlTmFtZShub3RlLm51bWJlciwgbm90ZS53aGl0ZW5vdGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGV0dGVyRm9udCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgQnJ1c2hlcy5CbGFjayxcbiAgICAgICAgICAgICAgICAgICAgICAgICB4bm90ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICB5bm90ZSAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLyoqIFJldHVybiB0cnVlIGlmIHRoZSBjaG9yZHMgY2FuIGJlIGNvbm5lY3RlZCwgd2hlcmUgdGhlaXIgc3RlbXMgYXJlXG4gICAgICogam9pbmVkIGJ5IGEgaG9yaXpvbnRhbCBiZWFtLiBJbiBvcmRlciB0byBjcmVhdGUgdGhlIGJlYW06XG4gICAgICpcbiAgICAgKiAtIFRoZSBjaG9yZHMgbXVzdCBiZSBpbiB0aGUgc2FtZSBtZWFzdXJlLlxuICAgICAqIC0gVGhlIGNob3JkIHN0ZW1zIHNob3VsZCBub3QgYmUgYSBkb3R0ZWQgZHVyYXRpb24uXG4gICAgICogLSBUaGUgY2hvcmQgc3RlbXMgbXVzdCBiZSB0aGUgc2FtZSBkdXJhdGlvbiwgd2l0aCBvbmUgZXhjZXB0aW9uXG4gICAgICogICAoRG90dGVkIEVpZ2h0aCB0byBTaXh0ZWVudGgpLlxuICAgICAqIC0gVGhlIHN0ZW1zIG11c3QgYWxsIHBvaW50IGluIHRoZSBzYW1lIGRpcmVjdGlvbiAodXAgb3IgZG93bikuXG4gICAgICogLSBUaGUgY2hvcmQgY2Fubm90IGFscmVhZHkgYmUgcGFydCBvZiBhIGJlYW0uXG4gICAgICpcbiAgICAgKiAtIDYtY2hvcmQgYmVhbXMgbXVzdCBiZSA4dGggbm90ZXMgaW4gMy80LCA2LzgsIG9yIDYvNCB0aW1lXG4gICAgICogLSAzLWNob3JkIGJlYW1zIG11c3QgYmUgZWl0aGVyIHRyaXBsZXRzLCBvciA4dGggbm90ZXMgKDEyLzggdGltZSBzaWduYXR1cmUpXG4gICAgICogLSA0LWNob3JkIGJlYW1zIGFyZSBvayBmb3IgMi8yLCAyLzQgb3IgNC80IHRpbWUsIGFueSBkdXJhdGlvblxuICAgICAqIC0gNC1jaG9yZCBiZWFtcyBhcmUgb2sgZm9yIG90aGVyIHRpbWVzIGlmIHRoZSBkdXJhdGlvbiBpcyAxNnRoXG4gICAgICogLSAyLWNob3JkIGJlYW1zIGFyZSBvayBmb3IgYW55IGR1cmF0aW9uXG4gICAgICpcbiAgICAgKiBJZiBzdGFydFF1YXJ0ZXIgaXMgdHJ1ZSwgdGhlIGZpcnN0IG5vdGUgc2hvdWxkIHN0YXJ0IG9uIGEgcXVhcnRlciBub3RlXG4gICAgICogKG9ubHkgYXBwbGllcyB0byAyLWNob3JkIGJlYW1zKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIFxuICAgIGJvb2wgQ2FuQ3JlYXRlQmVhbShDaG9yZFN5bWJvbFtdIGNob3JkcywgVGltZVNpZ25hdHVyZSB0aW1lLCBib29sIHN0YXJ0UXVhcnRlcikge1xuICAgICAgICBpbnQgbnVtQ2hvcmRzID0gY2hvcmRzLkxlbmd0aDtcbiAgICAgICAgU3RlbSBmaXJzdFN0ZW0gPSBjaG9yZHNbMF0uU3RlbTtcbiAgICAgICAgU3RlbSBsYXN0U3RlbSA9IGNob3Jkc1tjaG9yZHMuTGVuZ3RoLTFdLlN0ZW07XG4gICAgICAgIGlmIChmaXJzdFN0ZW0gPT0gbnVsbCB8fCBsYXN0U3RlbSA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaW50IG1lYXN1cmUgPSBjaG9yZHNbMF0uU3RhcnRUaW1lIC8gdGltZS5NZWFzdXJlO1xuICAgICAgICBOb3RlRHVyYXRpb24gZHVyID0gZmlyc3RTdGVtLkR1cmF0aW9uO1xuICAgICAgICBOb3RlRHVyYXRpb24gZHVyMiA9IGxhc3RTdGVtLkR1cmF0aW9uO1xuXG4gICAgICAgIGJvb2wgZG90dGVkOF90b18xNiA9IGZhbHNlO1xuICAgICAgICBpZiAoY2hvcmRzLkxlbmd0aCA9PSAyICYmIGR1ciA9PSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoICYmXG4gICAgICAgICAgICBkdXIyID09IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGgpIHtcbiAgICAgICAgICAgIGRvdHRlZDhfdG9fMTYgPSB0cnVlO1xuICAgICAgICB9IFxuXG4gICAgICAgIGlmIChkdXIgPT0gTm90ZUR1cmF0aW9uLldob2xlIHx8IGR1ciA9PSBOb3RlRHVyYXRpb24uSGFsZiB8fFxuICAgICAgICAgICAgZHVyID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRIYWxmIHx8IGR1ciA9PSBOb3RlRHVyYXRpb24uUXVhcnRlciB8fFxuICAgICAgICAgICAgZHVyID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRRdWFydGVyIHx8XG4gICAgICAgICAgICAoZHVyID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGggJiYgIWRvdHRlZDhfdG9fMTYpKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChudW1DaG9yZHMgPT0gNikge1xuICAgICAgICAgICAgaWYgKGR1ciAhPSBOb3RlRHVyYXRpb24uRWlnaHRoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYm9vbCBjb3JyZWN0VGltZSA9IFxuICAgICAgICAgICAgICAgKCh0aW1lLk51bWVyYXRvciA9PSAzICYmIHRpbWUuRGVub21pbmF0b3IgPT0gNCkgfHxcbiAgICAgICAgICAgICAgICAodGltZS5OdW1lcmF0b3IgPT0gNiAmJiB0aW1lLkRlbm9taW5hdG9yID09IDgpIHx8XG4gICAgICAgICAgICAgICAgKHRpbWUuTnVtZXJhdG9yID09IDYgJiYgdGltZS5EZW5vbWluYXRvciA9PSA0KSApO1xuXG4gICAgICAgICAgICBpZiAoIWNvcnJlY3RUaW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGltZS5OdW1lcmF0b3IgPT0gNiAmJiB0aW1lLkRlbm9taW5hdG9yID09IDQpIHtcbiAgICAgICAgICAgICAgICAvKiBmaXJzdCBjaG9yZCBtdXN0IHN0YXJ0IGF0IDFzdCBvciA0dGggcXVhcnRlciBub3RlICovXG4gICAgICAgICAgICAgICAgaW50IGJlYXQgPSB0aW1lLlF1YXJ0ZXIgKiAzO1xuICAgICAgICAgICAgICAgIGlmICgoY2hvcmRzWzBdLlN0YXJ0VGltZSAlIGJlYXQpID4gdGltZS5RdWFydGVyLzYpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobnVtQ2hvcmRzID09IDQpIHtcbiAgICAgICAgICAgIGlmICh0aW1lLk51bWVyYXRvciA9PSAzICYmIHRpbWUuRGVub21pbmF0b3IgPT0gOCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJvb2wgY29ycmVjdFRpbWUgPSBcbiAgICAgICAgICAgICAgKHRpbWUuTnVtZXJhdG9yID09IDIgfHwgdGltZS5OdW1lcmF0b3IgPT0gNCB8fCB0aW1lLk51bWVyYXRvciA9PSA4KTtcbiAgICAgICAgICAgIGlmICghY29ycmVjdFRpbWUgJiYgZHVyICE9IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIGNob3JkIG11c3Qgc3RhcnQgb24gcXVhcnRlciBub3RlICovXG4gICAgICAgICAgICBpbnQgYmVhdCA9IHRpbWUuUXVhcnRlcjtcbiAgICAgICAgICAgIGlmIChkdXIgPT0gTm90ZUR1cmF0aW9uLkVpZ2h0aCkge1xuICAgICAgICAgICAgICAgIC8qIDh0aCBub3RlIGNob3JkIG11c3Qgc3RhcnQgb24gMXN0IG9yIDNyZCBxdWFydGVyIG5vdGUgKi9cbiAgICAgICAgICAgICAgICBiZWF0ID0gdGltZS5RdWFydGVyICogMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGR1ciA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG4gICAgICAgICAgICAgICAgLyogMzJuZCBub3RlIG11c3Qgc3RhcnQgb24gYW4gOHRoIGJlYXQgKi9cbiAgICAgICAgICAgICAgICBiZWF0ID0gdGltZS5RdWFydGVyIC8gMjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKChjaG9yZHNbMF0uU3RhcnRUaW1lICUgYmVhdCkgPiB0aW1lLlF1YXJ0ZXIvNikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChudW1DaG9yZHMgPT0gMykge1xuICAgICAgICAgICAgYm9vbCB2YWxpZCA9IChkdXIgPT0gTm90ZUR1cmF0aW9uLlRyaXBsZXQpIHx8IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAoZHVyID09IE5vdGVEdXJhdGlvbi5FaWdodGggJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUuTnVtZXJhdG9yID09IDEyICYmIHRpbWUuRGVub21pbmF0b3IgPT0gOCk7XG4gICAgICAgICAgICBpZiAoIXZhbGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBjaG9yZCBtdXN0IHN0YXJ0IG9uIHF1YXJ0ZXIgbm90ZSAqL1xuICAgICAgICAgICAgaW50IGJlYXQgPSB0aW1lLlF1YXJ0ZXI7XG4gICAgICAgICAgICBpZiAodGltZS5OdW1lcmF0b3IgPT0gMTIgJiYgdGltZS5EZW5vbWluYXRvciA9PSA4KSB7XG4gICAgICAgICAgICAgICAgLyogSW4gMTIvOCB0aW1lLCBjaG9yZCBtdXN0IHN0YXJ0IG9uIDMqOHRoIGJlYXQgKi9cbiAgICAgICAgICAgICAgICBiZWF0ID0gdGltZS5RdWFydGVyLzIgKiAzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKChjaG9yZHNbMF0uU3RhcnRUaW1lICUgYmVhdCkgPiB0aW1lLlF1YXJ0ZXIvNikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGVsc2UgaWYgKG51bUNob3JkcyA9PSAyKSB7XG4gICAgICAgICAgICBpZiAoc3RhcnRRdWFydGVyKSB7XG4gICAgICAgICAgICAgICAgaW50IGJlYXQgPSB0aW1lLlF1YXJ0ZXI7XG4gICAgICAgICAgICAgICAgaWYgKChjaG9yZHNbMF0uU3RhcnRUaW1lICUgYmVhdCkgPiB0aW1lLlF1YXJ0ZXIvNikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yZWFjaCAoQ2hvcmRTeW1ib2wgY2hvcmQgaW4gY2hvcmRzKSB7XG4gICAgICAgICAgICBpZiAoKGNob3JkLlN0YXJ0VGltZSAvIHRpbWUuTWVhc3VyZSkgIT0gbWVhc3VyZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBpZiAoY2hvcmQuU3RlbSA9PSBudWxsKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmIChjaG9yZC5TdGVtLkR1cmF0aW9uICE9IGR1ciAmJiAhZG90dGVkOF90b18xNilcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBpZiAoY2hvcmQuU3RlbS5pc0JlYW0pXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogQ2hlY2sgdGhhdCBhbGwgc3RlbXMgY2FuIHBvaW50IGluIHNhbWUgZGlyZWN0aW9uICovXG4gICAgICAgIGJvb2wgaGFzVHdvU3RlbXMgPSBmYWxzZTtcbiAgICAgICAgaW50IGRpcmVjdGlvbiA9IFN0ZW0uVXA7IFxuICAgICAgICBmb3JlYWNoIChDaG9yZFN5bWJvbCBjaG9yZCBpbiBjaG9yZHMpIHtcbiAgICAgICAgICAgIGlmIChjaG9yZC5IYXNUd29TdGVtcykge1xuICAgICAgICAgICAgICAgIGlmIChoYXNUd29TdGVtcyAmJiBjaG9yZC5TdGVtLkRpcmVjdGlvbiAhPSBkaXJlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBoYXNUd29TdGVtcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uID0gY2hvcmQuU3RlbS5EaXJlY3Rpb247XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBHZXQgdGhlIGZpbmFsIHN0ZW0gZGlyZWN0aW9uICovXG4gICAgICAgIGlmICghaGFzVHdvU3RlbXMpIHtcbiAgICAgICAgICAgIFdoaXRlTm90ZSBub3RlMTtcbiAgICAgICAgICAgIFdoaXRlTm90ZSBub3RlMjtcbiAgICAgICAgICAgIG5vdGUxID0gKGZpcnN0U3RlbS5EaXJlY3Rpb24gPT0gU3RlbS5VcCA/IGZpcnN0U3RlbS5Ub3AgOiBmaXJzdFN0ZW0uQm90dG9tKTtcbiAgICAgICAgICAgIG5vdGUyID0gKGxhc3RTdGVtLkRpcmVjdGlvbiA9PSBTdGVtLlVwID8gbGFzdFN0ZW0uVG9wIDogbGFzdFN0ZW0uQm90dG9tKTtcbiAgICAgICAgICAgIGRpcmVjdGlvbiA9IFN0ZW1EaXJlY3Rpb24obm90ZTEsIG5vdGUyLCBjaG9yZHNbMF0uQ2xlZik7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBJZiB0aGUgbm90ZXMgYXJlIHRvbyBmYXIgYXBhcnQsIGRvbid0IHVzZSBhIGJlYW0gKi9cbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PSBTdGVtLlVwKSB7XG4gICAgICAgICAgICBpZiAoTWF0aC5BYnMoZmlyc3RTdGVtLlRvcC5EaXN0KGxhc3RTdGVtLlRvcCkpID49IDExKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKE1hdGguQWJzKGZpcnN0U3RlbS5Cb3R0b20uRGlzdChsYXN0U3RlbS5Cb3R0b20pKSA+PSAxMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cblxuICAgIC8qKiBDb25uZWN0IHRoZSBjaG9yZHMgdXNpbmcgYSBob3Jpem9udGFsIGJlYW0uIFxuICAgICAqXG4gICAgICogc3BhY2luZyBpcyB0aGUgaG9yaXpvbnRhbCBkaXN0YW5jZSAoaW4gcGl4ZWxzKSBiZXR3ZWVuIHRoZSByaWdodCBzaWRlIFxuICAgICAqIG9mIHRoZSBmaXJzdCBjaG9yZCwgYW5kIHRoZSByaWdodCBzaWRlIG9mIHRoZSBsYXN0IGNob3JkLlxuICAgICAqXG4gICAgICogVG8gbWFrZSB0aGUgYmVhbTpcbiAgICAgKiAtIENoYW5nZSB0aGUgc3RlbSBkaXJlY3Rpb25zIGZvciBlYWNoIGNob3JkLCBzbyB0aGV5IG1hdGNoLlxuICAgICAqIC0gSW4gdGhlIGZpcnN0IGNob3JkLCBwYXNzIHRoZSBzdGVtIGxvY2F0aW9uIG9mIHRoZSBsYXN0IGNob3JkLCBhbmRcbiAgICAgKiAgIHRoZSBob3Jpem9udGFsIHNwYWNpbmcgdG8gdGhhdCBsYXN0IHN0ZW0uXG4gICAgICogLSBNYXJrIGFsbCBjaG9yZHMgKGV4Y2VwdCB0aGUgZmlyc3QpIGFzIFwicmVjZWl2ZXJcIiBwYWlycywgc28gdGhhdCBcbiAgICAgKiAgIHRoZXkgZG9uJ3QgZHJhdyBhIGN1cnZ5IHN0ZW0uXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBcbiAgICB2b2lkIENyZWF0ZUJlYW0oQ2hvcmRTeW1ib2xbXSBjaG9yZHMsIGludCBzcGFjaW5nKSB7XG4gICAgICAgIFN0ZW0gZmlyc3RTdGVtID0gY2hvcmRzWzBdLlN0ZW07XG4gICAgICAgIFN0ZW0gbGFzdFN0ZW0gPSBjaG9yZHNbY2hvcmRzLkxlbmd0aC0xXS5TdGVtO1xuXG4gICAgICAgIC8qIENhbGN1bGF0ZSB0aGUgbmV3IHN0ZW0gZGlyZWN0aW9uICovXG4gICAgICAgIGludCBuZXdkaXJlY3Rpb24gPSAtMTtcbiAgICAgICAgZm9yZWFjaCAoQ2hvcmRTeW1ib2wgY2hvcmQgaW4gY2hvcmRzKSB7XG4gICAgICAgICAgICBpZiAoY2hvcmQuSGFzVHdvU3RlbXMpIHtcbiAgICAgICAgICAgICAgICBuZXdkaXJlY3Rpb24gPSBjaG9yZC5TdGVtLkRpcmVjdGlvbjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuZXdkaXJlY3Rpb24gPT0gLTEpIHtcbiAgICAgICAgICAgIFdoaXRlTm90ZSBub3RlMTtcbiAgICAgICAgICAgIFdoaXRlTm90ZSBub3RlMjtcbiAgICAgICAgICAgIG5vdGUxID0gKGZpcnN0U3RlbS5EaXJlY3Rpb24gPT0gU3RlbS5VcCA/IGZpcnN0U3RlbS5Ub3AgOiBmaXJzdFN0ZW0uQm90dG9tKTtcbiAgICAgICAgICAgIG5vdGUyID0gKGxhc3RTdGVtLkRpcmVjdGlvbiA9PSBTdGVtLlVwID8gbGFzdFN0ZW0uVG9wIDogbGFzdFN0ZW0uQm90dG9tKTtcbiAgICAgICAgICAgIG5ld2RpcmVjdGlvbiA9IFN0ZW1EaXJlY3Rpb24obm90ZTEsIG5vdGUyLCBjaG9yZHNbMF0uQ2xlZik7XG4gICAgICAgIH1cbiAgICAgICAgZm9yZWFjaCAoQ2hvcmRTeW1ib2wgY2hvcmQgaW4gY2hvcmRzKSB7XG4gICAgICAgICAgICBjaG9yZC5TdGVtLkRpcmVjdGlvbiA9IG5ld2RpcmVjdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjaG9yZHMuTGVuZ3RoID09IDIpIHtcbiAgICAgICAgICAgIEJyaW5nU3RlbXNDbG9zZXIoY2hvcmRzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIExpbmVVcFN0ZW1FbmRzKGNob3Jkcyk7XG4gICAgICAgIH1cblxuICAgICAgICBmaXJzdFN0ZW0uU2V0UGFpcihsYXN0U3RlbSwgc3BhY2luZyk7XG4gICAgICAgIGZvciAoaW50IGkgPSAxOyBpIDwgY2hvcmRzLkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjaG9yZHNbaV0uU3RlbS5SZWNlaXZlciA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogV2UncmUgY29ubmVjdGluZyB0aGUgc3RlbXMgb2YgdHdvIGNob3JkcyB1c2luZyBhIGhvcml6b250YWwgYmVhbS5cbiAgICAgKiAgQWRqdXN0IHRoZSB2ZXJ0aWNhbCBlbmRwb2ludCBvZiB0aGUgc3RlbXMsIHNvIHRoYXQgdGhleSdyZSBjbG9zZXJcbiAgICAgKiAgdG9nZXRoZXIuICBGb3IgYSBkb3R0ZWQgOHRoIHRvIDE2dGggYmVhbSwgaW5jcmVhc2UgdGhlIHN0ZW0gb2YgdGhlXG4gICAgICogIGRvdHRlZCBlaWdodGgsIHNvIHRoYXQgaXQncyBhcyBsb25nIGFzIGEgMTZ0aCBzdGVtLlxuICAgICAqL1xuICAgIHN0YXRpYyB2b2lkXG4gICAgQnJpbmdTdGVtc0Nsb3NlcihDaG9yZFN5bWJvbFtdIGNob3Jkcykge1xuICAgICAgICBTdGVtIGZpcnN0U3RlbSA9IGNob3Jkc1swXS5TdGVtO1xuICAgICAgICBTdGVtIGxhc3RTdGVtID0gY2hvcmRzWzFdLlN0ZW07XG5cbiAgICAgICAgLyogSWYgd2UncmUgY29ubmVjdGluZyBhIGRvdHRlZCA4dGggdG8gYSAxNnRoLCBpbmNyZWFzZVxuICAgICAgICAgKiB0aGUgc3RlbSBlbmQgb2YgdGhlIGRvdHRlZCBlaWdodGguXG4gICAgICAgICAqL1xuICAgICAgICBpZiAoZmlyc3RTdGVtLkR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGggJiZcbiAgICAgICAgICAgIGxhc3RTdGVtLkR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGgpIHtcbiAgICAgICAgICAgIGlmIChmaXJzdFN0ZW0uRGlyZWN0aW9uID09IFN0ZW0uVXApIHtcbiAgICAgICAgICAgICAgICBmaXJzdFN0ZW0uRW5kID0gZmlyc3RTdGVtLkVuZC5BZGQoMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBmaXJzdFN0ZW0uRW5kID0gZmlyc3RTdGVtLkVuZC5BZGQoLTIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyogQnJpbmcgdGhlIHN0ZW0gZW5kcyBjbG9zZXIgdG9nZXRoZXIgKi9cbiAgICAgICAgaW50IGRpc3RhbmNlID0gTWF0aC5BYnMoZmlyc3RTdGVtLkVuZC5EaXN0KGxhc3RTdGVtLkVuZCkpO1xuICAgICAgICBpZiAoZmlyc3RTdGVtLkRpcmVjdGlvbiA9PSBTdGVtLlVwKSB7XG4gICAgICAgICAgICBpZiAoV2hpdGVOb3RlLk1heChmaXJzdFN0ZW0uRW5kLCBsYXN0U3RlbS5FbmQpID09IGZpcnN0U3RlbS5FbmQpXG4gICAgICAgICAgICAgICAgbGFzdFN0ZW0uRW5kID0gbGFzdFN0ZW0uRW5kLkFkZChkaXN0YW5jZS8yKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmaXJzdFN0ZW0uRW5kID0gZmlyc3RTdGVtLkVuZC5BZGQoZGlzdGFuY2UvMik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoV2hpdGVOb3RlLk1pbihmaXJzdFN0ZW0uRW5kLCBsYXN0U3RlbS5FbmQpID09IGZpcnN0U3RlbS5FbmQpXG4gICAgICAgICAgICAgICAgbGFzdFN0ZW0uRW5kID0gbGFzdFN0ZW0uRW5kLkFkZCgtZGlzdGFuY2UvMik7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZmlyc3RTdGVtLkVuZCA9IGZpcnN0U3RlbS5FbmQuQWRkKC1kaXN0YW5jZS8yKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBXZSdyZSBjb25uZWN0aW5nIHRoZSBzdGVtcyBvZiB0aHJlZSBvciBtb3JlIGNob3JkcyB1c2luZyBhIGhvcml6b250YWwgYmVhbS5cbiAgICAgKiAgQWRqdXN0IHRoZSB2ZXJ0aWNhbCBlbmRwb2ludCBvZiB0aGUgc3RlbXMsIHNvIHRoYXQgdGhlIG1pZGRsZSBjaG9yZCBzdGVtc1xuICAgICAqICBhcmUgdmVydGljYWxseSBpbiBiZXR3ZWVuIHRoZSBmaXJzdCBhbmQgbGFzdCBzdGVtLlxuICAgICAqL1xuICAgIHN0YXRpYyB2b2lkXG4gICAgTGluZVVwU3RlbUVuZHMoQ2hvcmRTeW1ib2xbXSBjaG9yZHMpIHtcbiAgICAgICAgU3RlbSBmaXJzdFN0ZW0gPSBjaG9yZHNbMF0uU3RlbTtcbiAgICAgICAgU3RlbSBsYXN0U3RlbSA9IGNob3Jkc1tjaG9yZHMuTGVuZ3RoLTFdLlN0ZW07XG4gICAgICAgIFN0ZW0gbWlkZGxlU3RlbSA9IGNob3Jkc1sxXS5TdGVtO1xuXG4gICAgICAgIGlmIChmaXJzdFN0ZW0uRGlyZWN0aW9uID09IFN0ZW0uVXApIHtcbiAgICAgICAgICAgIC8qIEZpbmQgdGhlIGhpZ2hlc3Qgc3RlbS4gVGhlIGJlYW0gd2lsbCBlaXRoZXI6XG4gICAgICAgICAgICAgKiAtIFNsYW50IGRvd253YXJkcyAoZmlyc3Qgc3RlbSBpcyBoaWdoZXN0KVxuICAgICAgICAgICAgICogLSBTbGFudCB1cHdhcmRzIChsYXN0IHN0ZW0gaXMgaGlnaGVzdClcbiAgICAgICAgICAgICAqIC0gQmUgc3RyYWlnaHQgKG1pZGRsZSBzdGVtIGlzIGhpZ2hlc3QpXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFdoaXRlTm90ZSB0b3AgPSBmaXJzdFN0ZW0uRW5kO1xuICAgICAgICAgICAgZm9yZWFjaCAoQ2hvcmRTeW1ib2wgY2hvcmQgaW4gY2hvcmRzKSB7XG4gICAgICAgICAgICAgICAgdG9wID0gV2hpdGVOb3RlLk1heCh0b3AsIGNob3JkLlN0ZW0uRW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0b3AgPT0gZmlyc3RTdGVtLkVuZCAmJiB0b3AuRGlzdChsYXN0U3RlbS5FbmQpID49IDIpIHtcbiAgICAgICAgICAgICAgICBmaXJzdFN0ZW0uRW5kID0gdG9wO1xuICAgICAgICAgICAgICAgIG1pZGRsZVN0ZW0uRW5kID0gdG9wLkFkZCgtMSk7XG4gICAgICAgICAgICAgICAgbGFzdFN0ZW0uRW5kID0gdG9wLkFkZCgtMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0b3AgPT0gbGFzdFN0ZW0uRW5kICYmIHRvcC5EaXN0KGZpcnN0U3RlbS5FbmQpID49IDIpIHtcbiAgICAgICAgICAgICAgICBmaXJzdFN0ZW0uRW5kID0gdG9wLkFkZCgtMik7XG4gICAgICAgICAgICAgICAgbWlkZGxlU3RlbS5FbmQgPSB0b3AuQWRkKC0xKTtcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSB0b3A7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBmaXJzdFN0ZW0uRW5kID0gdG9wO1xuICAgICAgICAgICAgICAgIG1pZGRsZVN0ZW0uRW5kID0gdG9wO1xuICAgICAgICAgICAgICAgIGxhc3RTdGVtLkVuZCA9IHRvcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8qIEZpbmQgdGhlIGJvdHRvbW1vc3Qgc3RlbS4gVGhlIGJlYW0gd2lsbCBlaXRoZXI6XG4gICAgICAgICAgICAgKiAtIFNsYW50IHVwd2FyZHMgKGZpcnN0IHN0ZW0gaXMgbG93ZXN0KVxuICAgICAgICAgICAgICogLSBTbGFudCBkb3dud2FyZHMgKGxhc3Qgc3RlbSBpcyBsb3dlc3QpXG4gICAgICAgICAgICAgKiAtIEJlIHN0cmFpZ2h0IChtaWRkbGUgc3RlbSBpcyBoaWdoZXN0KVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBXaGl0ZU5vdGUgYm90dG9tID0gZmlyc3RTdGVtLkVuZDtcbiAgICAgICAgICAgIGZvcmVhY2ggKENob3JkU3ltYm9sIGNob3JkIGluIGNob3Jkcykge1xuICAgICAgICAgICAgICAgIGJvdHRvbSA9IFdoaXRlTm90ZS5NaW4oYm90dG9tLCBjaG9yZC5TdGVtLkVuZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChib3R0b20gPT0gZmlyc3RTdGVtLkVuZCAmJiBsYXN0U3RlbS5FbmQuRGlzdChib3R0b20pID49IDIpIHtcbiAgICAgICAgICAgICAgICBtaWRkbGVTdGVtLkVuZCA9IGJvdHRvbS5BZGQoMSk7XG4gICAgICAgICAgICAgICAgbGFzdFN0ZW0uRW5kID0gYm90dG9tLkFkZCgyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGJvdHRvbSA9PSBsYXN0U3RlbS5FbmQgJiYgZmlyc3RTdGVtLkVuZC5EaXN0KGJvdHRvbSkgPj0gMikge1xuICAgICAgICAgICAgICAgIG1pZGRsZVN0ZW0uRW5kID0gYm90dG9tLkFkZCgxKTtcbiAgICAgICAgICAgICAgICBmaXJzdFN0ZW0uRW5kID0gYm90dG9tLkFkZCgyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSBib3R0b207XG4gICAgICAgICAgICAgICAgbWlkZGxlU3RlbS5FbmQgPSBib3R0b207XG4gICAgICAgICAgICAgICAgbGFzdFN0ZW0uRW5kID0gYm90dG9tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyogQWxsIG1pZGRsZSBzdGVtcyBoYXZlIHRoZSBzYW1lIGVuZCAqL1xuICAgICAgICBmb3IgKGludCBpID0gMTsgaSA8IGNob3Jkcy5MZW5ndGgtMTsgaSsrKSB7XG4gICAgICAgICAgICBTdGVtIHN0ZW0gPSBjaG9yZHNbaV0uU3RlbTtcbiAgICAgICAgICAgIHN0ZW0uRW5kID0gbWlkZGxlU3RlbS5FbmQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgb3ZlcnJpZGUgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICBzdHJpbmcgcmVzdWx0ID0gc3RyaW5nLkZvcm1hdChcIkNob3JkU3ltYm9sIGNsZWY9ezB9IHN0YXJ0PXsxfSBlbmQ9ezJ9IHdpZHRoPXszfSBoYXN0d29zdGVtcz17NH0gXCIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVmLCBTdGFydFRpbWUsIEVuZFRpbWUsIFdpZHRoLCBoYXN0d29zdGVtcyk7XG4gICAgICAgIGZvcmVhY2ggKEFjY2lkU3ltYm9sIHN5bWJvbCBpbiBhY2NpZHN5bWJvbHMpIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSBzeW1ib2wuVG9TdHJpbmcoKSArIFwiIFwiO1xuICAgICAgICB9XG4gICAgICAgIGZvcmVhY2ggKE5vdGVEYXRhIG5vdGUgaW4gbm90ZWRhdGEpIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSBzdHJpbmcuRm9ybWF0KFwiTm90ZSB3aGl0ZW5vdGU9ezB9IGR1cmF0aW9uPXsxfSBsZWZ0c2lkZT17Mn0gXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlLndoaXRlbm90ZSwgbm90ZS5kdXJhdGlvbiwgbm90ZS5sZWZ0c2lkZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0ZW0xICE9IG51bGwpIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSBzdGVtMS5Ub1N0cmluZygpICsgXCIgXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0ZW0yICE9IG51bGwpIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSBzdGVtMi5Ub1N0cmluZygpICsgXCIgXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDsgXG4gICAgfVxuXG59XG5cblxufVxuXG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMSBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIFRoZSBwb3NzaWJsZSBjbGVmcywgVHJlYmxlIG9yIEJhc3MgKi9cbnB1YmxpYyBlbnVtIENsZWYgeyBUcmVibGUsIEJhc3MgfTtcblxuLyoqIEBjbGFzcyBDbGVmU3ltYm9sIFxuICogQSBDbGVmU3ltYm9sIHJlcHJlc2VudHMgZWl0aGVyIGEgVHJlYmxlIG9yIEJhc3MgQ2xlZiBpbWFnZS5cbiAqIFRoZSBjbGVmIGNhbiBiZSBlaXRoZXIgbm9ybWFsIG9yIHNtYWxsIHNpemUuICBOb3JtYWwgc2l6ZSBpc1xuICogdXNlZCBhdCB0aGUgYmVnaW5uaW5nIG9mIGEgbmV3IHN0YWZmLCBvbiB0aGUgbGVmdCBzaWRlLiAgVGhlXG4gKiBzbWFsbCBzeW1ib2xzIGFyZSB1c2VkIHRvIHNob3cgY2xlZiBjaGFuZ2VzIHdpdGhpbiBhIHN0YWZmLlxuICovXG5cbnB1YmxpYyBjbGFzcyBDbGVmU3ltYm9sIDogTXVzaWNTeW1ib2wge1xuICAgIHByaXZhdGUgc3RhdGljIEltYWdlIHRyZWJsZTsgIC8qKiBUaGUgdHJlYmxlIGNsZWYgaW1hZ2UgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBJbWFnZSBiYXNzOyAgICAvKiogVGhlIGJhc3MgY2xlZiBpbWFnZSAqL1xuXG4gICAgcHJpdmF0ZSBpbnQgc3RhcnR0aW1lOyAgICAgICAgLyoqIFN0YXJ0IHRpbWUgb2YgdGhlIHN5bWJvbCAqL1xuICAgIHByaXZhdGUgYm9vbCBzbWFsbHNpemU7ICAgICAgIC8qKiBUcnVlIGlmIHRoaXMgaXMgYSBzbWFsbCBjbGVmLCBmYWxzZSBvdGhlcndpc2UgKi9cbiAgICBwcml2YXRlIENsZWYgY2xlZjsgICAgICAgICAgICAvKiogVGhlIGNsZWYsIFRyZWJsZSBvciBCYXNzICovXG4gICAgcHJpdmF0ZSBpbnQgd2lkdGg7XG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IENsZWZTeW1ib2wsIHdpdGggdGhlIGdpdmVuIGNsZWYsIHN0YXJ0dGltZSwgYW5kIHNpemUgKi9cbiAgICBwdWJsaWMgQ2xlZlN5bWJvbChDbGVmIGNsZWYsIGludCBzdGFydHRpbWUsIGJvb2wgc21hbGwpIHtcbiAgICAgICAgdGhpcy5jbGVmID0gY2xlZjtcbiAgICAgICAgdGhpcy5zdGFydHRpbWUgPSBzdGFydHRpbWU7XG4gICAgICAgIHNtYWxsc2l6ZSA9IHNtYWxsO1xuICAgICAgICBMb2FkSW1hZ2VzKCk7XG4gICAgICAgIHdpZHRoID0gTWluV2lkdGg7XG4gICAgfVxuXG4gICAgLyoqIExvYWQgdGhlIFRyZWJsZS9CYXNzIGNsZWYgaW1hZ2VzIGludG8gbWVtb3J5LiAqL1xuICAgIHByaXZhdGUgc3RhdGljIHZvaWQgTG9hZEltYWdlcygpIHtcbiAgICAgICAgaWYgKHRyZWJsZSA9PSBudWxsKVxuICAgICAgICAgICAgdHJlYmxlID0gbmV3IEJpdG1hcCh0eXBlb2YoQ2xlZlN5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy50cmVibGUucG5nXCIpO1xuXG4gICAgICAgIGlmIChiYXNzID09IG51bGwpXG4gICAgICAgICAgICBiYXNzID0gbmV3IEJpdG1hcCh0eXBlb2YoQ2xlZlN5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy5iYXNzLnBuZ1wiKTtcblxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIHRpbWUgKGluIHB1bHNlcykgdGhpcyBzeW1ib2wgb2NjdXJzIGF0LlxuICAgICAqIFRoaXMgaXMgdXNlZCB0byBkZXRlcm1pbmUgdGhlIG1lYXN1cmUgdGhpcyBzeW1ib2wgYmVsb25ncyB0by5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFN0YXJ0VGltZSB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gc3RhcnR0aW1lOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbWluaW11bSB3aWR0aCAoaW4gcGl4ZWxzKSBuZWVkZWQgdG8gZHJhdyB0aGlzIHN5bWJvbCAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgTWluV2lkdGgge1xuICAgICAgICBnZXQgeyBcbiAgICAgICAgICAgIGlmIChzbWFsbHNpemUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFNoZWV0TXVzaWMuTm90ZVdpZHRoICogMjtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gU2hlZXRNdXNpYy5Ob3RlV2lkdGggKiAzO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEdldC9TZXQgdGhlIHdpZHRoIChpbiBwaXhlbHMpIG9mIHRoaXMgc3ltYm9sLiBUaGUgd2lkdGggaXMgc2V0XG4gICAgICogaW4gU2hlZXRNdXNpYy5BbGlnblN5bWJvbHMoKSB0byB2ZXJ0aWNhbGx5IGFsaWduIHN5bWJvbHMuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBXaWR0aCB7XG4gICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgc2V0IHsgd2lkdGggPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBhYm92ZSB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBBYm92ZVN0YWZmIHsgXG4gICAgICAgIGdldCB7IFxuICAgICAgICAgICAgaWYgKGNsZWYgPT0gQ2xlZi5UcmVibGUgJiYgIXNtYWxsc2l6ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMjtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBiZWxvdyB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBCZWxvd1N0YWZmIHtcbiAgICAgICAgZ2V0IHtcbiAgICAgICAgICAgIGlmIChjbGVmID09IENsZWYuVHJlYmxlICYmICFzbWFsbHNpemUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFNoZWV0TXVzaWMuTm90ZUhlaWdodCAqIDI7XG4gICAgICAgICAgICBlbHNlIGlmIChjbGVmID09IENsZWYuVHJlYmxlICYmIHNtYWxsc2l6ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIERyYXcgdGhlIHN5bWJvbC5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgXG4gICAgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKFdpZHRoIC0gTWluV2lkdGgsIDApO1xuICAgICAgICBpbnQgeSA9IHl0b3A7XG4gICAgICAgIEltYWdlIGltYWdlO1xuICAgICAgICBpbnQgaGVpZ2h0O1xuXG4gICAgICAgIC8qIEdldCB0aGUgaW1hZ2UsIGhlaWdodCwgYW5kIHRvcCB5IHBpeGVsLCBkZXBlbmRpbmcgb24gdGhlIGNsZWZcbiAgICAgICAgICogYW5kIHRoZSBpbWFnZSBzaXplLlxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKGNsZWYgPT0gQ2xlZi5UcmVibGUpIHtcbiAgICAgICAgICAgIGltYWdlID0gdHJlYmxlO1xuICAgICAgICAgICAgaWYgKHNtYWxsc2l6ZSkge1xuICAgICAgICAgICAgICAgIGhlaWdodCA9IFNoZWV0TXVzaWMuU3RhZmZIZWlnaHQgKyBTaGVldE11c2ljLlN0YWZmSGVpZ2h0LzQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGhlaWdodCA9IDMgKiBTaGVldE11c2ljLlN0YWZmSGVpZ2h0LzIgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcbiAgICAgICAgICAgICAgICB5ID0geXRvcCAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGltYWdlID0gYmFzcztcbiAgICAgICAgICAgIGlmIChzbWFsbHNpemUpIHtcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBTaGVldE11c2ljLlN0YWZmSGVpZ2h0IC0gMypTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gU2hlZXRNdXNpYy5TdGFmZkhlaWdodCAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFNjYWxlIHRoZSBpbWFnZSB3aWR0aCB0byBtYXRjaCB0aGUgaGVpZ2h0ICovXG4gICAgICAgIGludCBpbWd3aWR0aCA9IGltYWdlLldpZHRoICogaGVpZ2h0IC8gaW1hZ2UuSGVpZ2h0O1xuICAgICAgICBnLkRyYXdJbWFnZShpbWFnZSwgMCwgeSwgaW1nd2lkdGgsIGhlaWdodCk7XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0oV2lkdGggLSBNaW5XaWR0aCksIDApO1xuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiQ2xlZlN5bWJvbCBjbGVmPXswfSBzbWFsbD17MX0gd2lkdGg9ezJ9XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWYsIHNtYWxsc2l6ZSwgd2lkdGgpO1xuICAgIH1cbn1cblxuXG59XG5cbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBGaWxlU3RyZWFtOlN0cmVhbVxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBGaWxlU3RyZWFtKHN0cmluZyBmaWxlbmFtZSwgRmlsZU1vZGUgbW9kZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDktMjAxMiBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuXG4vKiogQGNsYXNzIFBpYW5vXG4gKlxuICogVGhlIFBpYW5vIENvbnRyb2wgaXMgdGhlIHBhbmVsIGF0IHRoZSB0b3AgdGhhdCBkaXNwbGF5cyB0aGVcbiAqIHBpYW5vLCBhbmQgaGlnaGxpZ2h0cyB0aGUgcGlhbm8gbm90ZXMgZHVyaW5nIHBsYXliYWNrLlxuICogVGhlIG1haW4gbWV0aG9kcyBhcmU6XG4gKlxuICogU2V0TWlkaUZpbGUoKSAtIFNldCB0aGUgTWlkaSBmaWxlIHRvIHVzZSBmb3Igc2hhZGluZy4gIFRoZSBNaWRpIGZpbGVcbiAqICAgICAgICAgICAgICAgICBpcyBuZWVkZWQgdG8gZGV0ZXJtaW5lIHdoaWNoIG5vdGVzIHRvIHNoYWRlLlxuICpcbiAqIFNoYWRlTm90ZXMoKSAtIFNoYWRlIG5vdGVzIG9uIHRoZSBwaWFubyB0aGF0IG9jY3VyIGF0IGEgZ2l2ZW4gcHVsc2UgdGltZS5cbiAqXG4gKi9cbnB1YmxpYyBjbGFzcyBQaWFubyA6IENvbnRyb2wge1xuICAgIHB1YmxpYyBjb25zdCBpbnQgS2V5c1Blck9jdGF2ZSA9IDc7XG4gICAgcHVibGljIGNvbnN0IGludCBNYXhPY3RhdmUgPSA3O1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50IFdoaXRlS2V5V2lkdGg7ICAvKiogV2lkdGggb2YgYSBzaW5nbGUgd2hpdGUga2V5ICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50IFdoaXRlS2V5SGVpZ2h0OyAvKiogSGVpZ2h0IG9mIGEgc2luZ2xlIHdoaXRlIGtleSAqL1xuICAgIHByaXZhdGUgc3RhdGljIGludCBCbGFja0tleVdpZHRoOyAgLyoqIFdpZHRoIG9mIGEgc2luZ2xlIGJsYWNrIGtleSAqL1xuICAgIHByaXZhdGUgc3RhdGljIGludCBCbGFja0tleUhlaWdodDsgLyoqIEhlaWdodCBvZiBhIHNpbmdsZSBibGFjayBrZXkgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBpbnQgbWFyZ2luOyAgICAgICAgIC8qKiBUaGUgdG9wL2xlZnQgbWFyZ2luIHRvIHRoZSBwaWFubyAqL1xuICAgIHByaXZhdGUgc3RhdGljIGludCBCbGFja0JvcmRlcjsgICAgLyoqIFRoZSB3aWR0aCBvZiB0aGUgYmxhY2sgYm9yZGVyIGFyb3VuZCB0aGUga2V5cyAqL1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50W10gYmxhY2tLZXlPZmZzZXRzOyAgIC8qKiBUaGUgeCBwaXhsZXMgb2YgdGhlIGJsYWNrIGtleXMgKi9cblxuICAgIC8qIFRoZSBncmF5MVBlbnMgZm9yIGRyYXdpbmcgYmxhY2svZ3JheSBsaW5lcyAqL1xuICAgIHByaXZhdGUgUGVuIGdyYXkxUGVuLCBncmF5MlBlbiwgZ3JheTNQZW47XG5cbiAgICAvKiBUaGUgYnJ1c2hlcyBmb3IgZmlsbGluZyB0aGUga2V5cyAqL1xuICAgIHByaXZhdGUgQnJ1c2ggZ3JheTFCcnVzaCwgZ3JheTJCcnVzaCwgc2hhZGVCcnVzaCwgc2hhZGUyQnJ1c2g7XG5cbiAgICBwcml2YXRlIGJvb2wgdXNlVHdvQ29sb3JzOyAgICAgICAgICAgICAgLyoqIElmIHRydWUsIHVzZSB0d28gY29sb3JzIGZvciBoaWdobGlnaHRpbmcgKi9cbiAgICBwcml2YXRlIExpc3Q8TWlkaU5vdGU+IG5vdGVzOyAgICAgICAgICAgLyoqIFRoZSBNaWRpIG5vdGVzIGZvciBzaGFkaW5nICovXG4gICAgcHJpdmF0ZSBpbnQgbWF4U2hhZGVEdXJhdGlvbjsgICAgICAgICAgIC8qKiBUaGUgbWF4aW11bSBkdXJhdGlvbiB3ZSdsbCBzaGFkZSBhIG5vdGUgZm9yICovXG4gICAgcHJpdmF0ZSBpbnQgc2hvd05vdGVMZXR0ZXJzOyAgICAgICAgICAgIC8qKiBEaXNwbGF5IHRoZSBsZXR0ZXIgZm9yIGVhY2ggcGlhbm8gbm90ZSAqL1xuICAgIHByaXZhdGUgR3JhcGhpY3MgZ3JhcGhpY3M7ICAgICAgICAgICAgICAvKiogVGhlIGdyYXBoaWNzIGZvciBzaGFkaW5nIHRoZSBub3RlcyAqL1xuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBQaWFuby4gKi9cbiAgICBwdWJsaWMgUGlhbm8oKSB7XHJcbiAgICAgICAgaW50IHNjcmVlbndpZHRoID0gMTAyNDsgLy9TeXN0ZW0uV2luZG93cy5Gb3Jtcy5TY3JlZW4uUHJpbWFyeVNjcmVlbi5Cb3VuZHMuV2lkdGg7XG4gICAgICAgIGlmIChzY3JlZW53aWR0aCA+PSAzMjAwKSB7XG4gICAgICAgICAgICAvKiBMaW51eC9Nb25vIGlzIHJlcG9ydGluZyB3aWR0aCBvZiA0IHNjcmVlbnMgKi9cbiAgICAgICAgICAgIHNjcmVlbndpZHRoID0gc2NyZWVud2lkdGggLyA0O1xuICAgICAgICB9XG4gICAgICAgIHNjcmVlbndpZHRoID0gc2NyZWVud2lkdGggKiA5NS8xMDA7XG4gICAgICAgIFdoaXRlS2V5V2lkdGggPSAoaW50KShzY3JlZW53aWR0aCAvICgyLjAgKyBLZXlzUGVyT2N0YXZlICogTWF4T2N0YXZlKSk7XG4gICAgICAgIGlmIChXaGl0ZUtleVdpZHRoICUgMiAhPSAwKSB7XG4gICAgICAgICAgICBXaGl0ZUtleVdpZHRoLS07XG4gICAgICAgIH1cbiAgICAgICAgbWFyZ2luID0gMDtcbiAgICAgICAgQmxhY2tCb3JkZXIgPSBXaGl0ZUtleVdpZHRoLzI7XG4gICAgICAgIFdoaXRlS2V5SGVpZ2h0ID0gV2hpdGVLZXlXaWR0aCAqIDU7XG4gICAgICAgIEJsYWNrS2V5V2lkdGggPSBXaGl0ZUtleVdpZHRoIC8gMjtcbiAgICAgICAgQmxhY2tLZXlIZWlnaHQgPSBXaGl0ZUtleUhlaWdodCAqIDUgLyA5OyBcblxuICAgICAgICBXaWR0aCA9IG1hcmdpbioyICsgQmxhY2tCb3JkZXIqMiArIFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlICogTWF4T2N0YXZlO1xuICAgICAgICBIZWlnaHQgPSBtYXJnaW4qMiArIEJsYWNrQm9yZGVyKjMgKyBXaGl0ZUtleUhlaWdodDtcbiAgICAgICAgaWYgKGJsYWNrS2V5T2Zmc2V0cyA9PSBudWxsKSB7XG4gICAgICAgICAgICBibGFja0tleU9mZnNldHMgPSBuZXcgaW50W10geyBcbiAgICAgICAgICAgICAgICBXaGl0ZUtleVdpZHRoIC0gQmxhY2tLZXlXaWR0aC8yIC0gMSxcbiAgICAgICAgICAgICAgICBXaGl0ZUtleVdpZHRoICsgQmxhY2tLZXlXaWR0aC8yIC0gMSxcbiAgICAgICAgICAgICAgICAyKldoaXRlS2V5V2lkdGggLSBCbGFja0tleVdpZHRoLzIsXG4gICAgICAgICAgICAgICAgMipXaGl0ZUtleVdpZHRoICsgQmxhY2tLZXlXaWR0aC8yLFxuICAgICAgICAgICAgICAgIDQqV2hpdGVLZXlXaWR0aCAtIEJsYWNrS2V5V2lkdGgvMiAtIDEsXG4gICAgICAgICAgICAgICAgNCpXaGl0ZUtleVdpZHRoICsgQmxhY2tLZXlXaWR0aC8yIC0gMSxcbiAgICAgICAgICAgICAgICA1KldoaXRlS2V5V2lkdGggLSBCbGFja0tleVdpZHRoLzIsXG4gICAgICAgICAgICAgICAgNSpXaGl0ZUtleVdpZHRoICsgQmxhY2tLZXlXaWR0aC8yLFxuICAgICAgICAgICAgICAgIDYqV2hpdGVLZXlXaWR0aCAtIEJsYWNrS2V5V2lkdGgvMixcbiAgICAgICAgICAgICAgICA2KldoaXRlS2V5V2lkdGggKyBCbGFja0tleVdpZHRoLzJcbiAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBDb2xvciBncmF5MSA9IENvbG9yLkZyb21BcmdiKDE2LCAxNiwgMTYpO1xuICAgICAgICBDb2xvciBncmF5MiA9IENvbG9yLkZyb21BcmdiKDkwLCA5MCwgOTApO1xuICAgICAgICBDb2xvciBncmF5MyA9IENvbG9yLkZyb21BcmdiKDIwMCwgMjAwLCAyMDApO1xuICAgICAgICBDb2xvciBzaGFkZTEgPSBDb2xvci5Gcm9tQXJnYigyMTAsIDIwNSwgMjIwKTtcbiAgICAgICAgQ29sb3Igc2hhZGUyID0gQ29sb3IuRnJvbUFyZ2IoMTUwLCAyMDAsIDIyMCk7XG5cbiAgICAgICAgZ3JheTFQZW4gPSBuZXcgUGVuKGdyYXkxLCAxKTtcbiAgICAgICAgZ3JheTJQZW4gPSBuZXcgUGVuKGdyYXkyLCAxKTtcbiAgICAgICAgZ3JheTNQZW4gPSBuZXcgUGVuKGdyYXkzLCAxKTtcblxuICAgICAgICBncmF5MUJydXNoID0gbmV3IFNvbGlkQnJ1c2goZ3JheTEpO1xuICAgICAgICBncmF5MkJydXNoID0gbmV3IFNvbGlkQnJ1c2goZ3JheTIpO1xuICAgICAgICBzaGFkZUJydXNoID0gbmV3IFNvbGlkQnJ1c2goc2hhZGUxKTtcbiAgICAgICAgc2hhZGUyQnJ1c2ggPSBuZXcgU29saWRCcnVzaChzaGFkZTIpO1xuICAgICAgICBzaG93Tm90ZUxldHRlcnMgPSBNaWRpT3B0aW9ucy5Ob3RlTmFtZU5vbmU7XG4gICAgICAgIEJhY2tDb2xvciA9IENvbG9yLkxpZ2h0R3JheTtcbiAgICB9XG5cbiAgICAvKiogU2V0IHRoZSBNaWRpRmlsZSB0byB1c2UuXG4gICAgICogIFNhdmUgdGhlIGxpc3Qgb2YgbWlkaSBub3Rlcy4gRWFjaCBtaWRpIG5vdGUgaW5jbHVkZXMgdGhlIG5vdGUgTnVtYmVyIFxuICAgICAqICBhbmQgU3RhcnRUaW1lIChpbiBwdWxzZXMpLCBzbyB3ZSBrbm93IHdoaWNoIG5vdGVzIHRvIHNoYWRlIGdpdmVuIHRoZVxuICAgICAqICBjdXJyZW50IHB1bHNlIHRpbWUuXG4gICAgICovIFxuICAgIHB1YmxpYyB2b2lkIFNldE1pZGlGaWxlKE1pZGlGaWxlIG1pZGlmaWxlLCBNaWRpT3B0aW9ucyBvcHRpb25zKSB7XG4gICAgICAgIGlmIChtaWRpZmlsZSA9PSBudWxsKSB7XG4gICAgICAgICAgICBub3RlcyA9IG51bGw7XG4gICAgICAgICAgICB1c2VUd29Db2xvcnMgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIExpc3Q8TWlkaVRyYWNrPiB0cmFja3MgPSBtaWRpZmlsZS5DaGFuZ2VNaWRpTm90ZXMob3B0aW9ucyk7XG4gICAgICAgIE1pZGlUcmFjayB0cmFjayA9IE1pZGlGaWxlLkNvbWJpbmVUb1NpbmdsZVRyYWNrKHRyYWNrcyk7XG4gICAgICAgIG5vdGVzID0gdHJhY2suTm90ZXM7XG5cbiAgICAgICAgbWF4U2hhZGVEdXJhdGlvbiA9IG1pZGlmaWxlLlRpbWUuUXVhcnRlciAqIDI7XG5cbiAgICAgICAgLyogV2Ugd2FudCB0byBrbm93IHdoaWNoIHRyYWNrIHRoZSBub3RlIGNhbWUgZnJvbS5cbiAgICAgICAgICogVXNlIHRoZSAnY2hhbm5lbCcgZmllbGQgdG8gc3RvcmUgdGhlIHRyYWNrLlxuICAgICAgICAgKi9cbiAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IHRyYWNrcy5Db3VudDsgdHJhY2tudW0rKykge1xuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiB0cmFja3NbdHJhY2tudW1dLk5vdGVzKSB7XG4gICAgICAgICAgICAgICAgbm90ZS5DaGFubmVsID0gdHJhY2tudW07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBXaGVuIHdlIGhhdmUgZXhhY3RseSB0d28gdHJhY2tzLCB3ZSBhc3N1bWUgdGhpcyBpcyBhIHBpYW5vIHNvbmcsXG4gICAgICAgICAqIGFuZCB3ZSB1c2UgZGlmZmVyZW50IGNvbG9ycyBmb3IgaGlnaGxpZ2h0aW5nIHRoZSBsZWZ0IGhhbmQgYW5kXG4gICAgICAgICAqIHJpZ2h0IGhhbmQgbm90ZXMuXG4gICAgICAgICAqL1xuICAgICAgICB1c2VUd29Db2xvcnMgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRyYWNrcy5Db3VudCA9PSAyKSB7XG4gICAgICAgICAgICB1c2VUd29Db2xvcnMgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgc2hvd05vdGVMZXR0ZXJzID0gb3B0aW9ucy5zaG93Tm90ZUxldHRlcnM7XG4gICAgICAgIHRoaXMuSW52YWxpZGF0ZSgpO1xuICAgIH1cblxuICAgIC8qKiBTZXQgdGhlIGNvbG9ycyB0byB1c2UgZm9yIHNoYWRpbmcgKi9cbiAgICBwdWJsaWMgdm9pZCBTZXRTaGFkZUNvbG9ycyhDb2xvciBjMSwgQ29sb3IgYzIpIHtcbiAgICAgICAgc2hhZGVCcnVzaC5EaXNwb3NlKCk7XG4gICAgICAgIHNoYWRlMkJydXNoLkRpc3Bvc2UoKTtcbiAgICAgICAgc2hhZGVCcnVzaCA9IG5ldyBTb2xpZEJydXNoKGMxKTtcbiAgICAgICAgc2hhZGUyQnJ1c2ggPSBuZXcgU29saWRCcnVzaChjMik7XG4gICAgfVxuXG4gICAgLyoqIERyYXcgdGhlIG91dGxpbmUgb2YgYSAxMi1ub3RlICg3IHdoaXRlIG5vdGUpIHBpYW5vIG9jdGF2ZSAqL1xuICAgIHByaXZhdGUgdm9pZCBEcmF3T2N0YXZlT3V0bGluZShHcmFwaGljcyBnKSB7XG4gICAgICAgIGludCByaWdodCA9IFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlO1xuXG4gICAgICAgIC8vIERyYXcgdGhlIGJvdW5kaW5nIHJlY3RhbmdsZSwgZnJvbSBDIHRvIEJcbiAgICAgICAgZy5EcmF3TGluZShncmF5MVBlbiwgMCwgMCwgMCwgV2hpdGVLZXlIZWlnaHQpO1xuICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCByaWdodCwgMCwgcmlnaHQsIFdoaXRlS2V5SGVpZ2h0KTtcbiAgICAgICAgLy8gZy5EcmF3TGluZShncmF5MVBlbiwgMCwgMCwgcmlnaHQsIDApO1xuICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCAwLCBXaGl0ZUtleUhlaWdodCwgcmlnaHQsIFdoaXRlS2V5SGVpZ2h0KTtcbiAgICAgICAgZy5EcmF3TGluZShncmF5M1BlbiwgcmlnaHQtMSwgMCwgcmlnaHQtMSwgV2hpdGVLZXlIZWlnaHQpO1xuICAgICAgICBnLkRyYXdMaW5lKGdyYXkzUGVuLCAxLCAwLCAxLCBXaGl0ZUtleUhlaWdodCk7XG5cbiAgICAgICAgLy8gRHJhdyB0aGUgbGluZSBiZXR3ZWVuIEUgYW5kIEZcbiAgICAgICAgZy5EcmF3TGluZShncmF5MVBlbiwgMypXaGl0ZUtleVdpZHRoLCAwLCAzKldoaXRlS2V5V2lkdGgsIFdoaXRlS2V5SGVpZ2h0KTtcbiAgICAgICAgZy5EcmF3TGluZShncmF5M1BlbiwgMypXaGl0ZUtleVdpZHRoIC0gMSwgMCwgMypXaGl0ZUtleVdpZHRoIC0gMSwgV2hpdGVLZXlIZWlnaHQpO1xuICAgICAgICBnLkRyYXdMaW5lKGdyYXkzUGVuLCAzKldoaXRlS2V5V2lkdGggKyAxLCAwLCAzKldoaXRlS2V5V2lkdGggKyAxLCBXaGl0ZUtleUhlaWdodCk7XG5cbiAgICAgICAgLy8gRHJhdyB0aGUgc2lkZXMvYm90dG9tIG9mIHRoZSBibGFjayBrZXlzXG4gICAgICAgIGZvciAoaW50IGkgPTA7IGkgPCAxMDsgaSArPSAyKSB7XG4gICAgICAgICAgICBpbnQgeDEgPSBibGFja0tleU9mZnNldHNbaV07XG4gICAgICAgICAgICBpbnQgeDIgPSBibGFja0tleU9mZnNldHNbaSsxXTtcblxuICAgICAgICAgICAgZy5EcmF3TGluZShncmF5MVBlbiwgeDEsIDAsIHgxLCBCbGFja0tleUhlaWdodCk7IFxuICAgICAgICAgICAgZy5EcmF3TGluZShncmF5MVBlbiwgeDIsIDAsIHgyLCBCbGFja0tleUhlaWdodCk7IFxuICAgICAgICAgICAgZy5EcmF3TGluZShncmF5MVBlbiwgeDEsIEJsYWNrS2V5SGVpZ2h0LCB4MiwgQmxhY2tLZXlIZWlnaHQpO1xuICAgICAgICAgICAgZy5EcmF3TGluZShncmF5MlBlbiwgeDEtMSwgMCwgeDEtMSwgQmxhY2tLZXlIZWlnaHQrMSk7IFxuICAgICAgICAgICAgZy5EcmF3TGluZShncmF5MlBlbiwgeDIrMSwgMCwgeDIrMSwgQmxhY2tLZXlIZWlnaHQrMSk7IFxuICAgICAgICAgICAgZy5EcmF3TGluZShncmF5MlBlbiwgeDEtMSwgQmxhY2tLZXlIZWlnaHQrMSwgeDIrMSwgQmxhY2tLZXlIZWlnaHQrMSk7XG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkzUGVuLCB4MS0yLCAwLCB4MS0yLCBCbGFja0tleUhlaWdodCsyKTsgXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkzUGVuLCB4MisyLCAwLCB4MisyLCBCbGFja0tleUhlaWdodCsyKTsgXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkzUGVuLCB4MS0yLCBCbGFja0tleUhlaWdodCsyLCB4MisyLCBCbGFja0tleUhlaWdodCsyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERyYXcgdGhlIGJvdHRvbS1oYWxmIG9mIHRoZSB3aGl0ZSBrZXlzXG4gICAgICAgIGZvciAoaW50IGkgPSAxOyBpIDwgS2V5c1Blck9jdGF2ZTsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaSA9PSAzKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7ICAvLyB3ZSBkcmF3IHRoZSBsaW5lIGJldHdlZW4gRSBhbmQgRiBhYm92ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZy5EcmF3TGluZShncmF5MVBlbiwgaSpXaGl0ZUtleVdpZHRoLCBCbGFja0tleUhlaWdodCwgaSpXaGl0ZUtleVdpZHRoLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgICAgICBQZW4gcGVuMSA9IGdyYXkyUGVuO1xuICAgICAgICAgICAgUGVuIHBlbjIgPSBncmF5M1BlbjtcbiAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuMSwgaSpXaGl0ZUtleVdpZHRoIC0gMSwgQmxhY2tLZXlIZWlnaHQrMSwgaSpXaGl0ZUtleVdpZHRoIC0gMSwgV2hpdGVLZXlIZWlnaHQpO1xuICAgICAgICAgICAgZy5EcmF3TGluZShwZW4yLCBpKldoaXRlS2V5V2lkdGggKyAxLCBCbGFja0tleUhlaWdodCsxLCBpKldoaXRlS2V5V2lkdGggKyAxLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKiBEcmF3IGFuIG91dGxpbmUgb2YgdGhlIHBpYW5vIGZvciA3IG9jdGF2ZXMgKi9cbiAgICBwcml2YXRlIHZvaWQgRHJhd091dGxpbmUoR3JhcGhpY3MgZykge1xuICAgICAgICBmb3IgKGludCBvY3RhdmUgPSAwOyBvY3RhdmUgPCBNYXhPY3RhdmU7IG9jdGF2ZSsrKSB7XG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybShvY3RhdmUgKiBXaGl0ZUtleVdpZHRoICogS2V5c1Blck9jdGF2ZSwgMCk7XG4gICAgICAgICAgICBEcmF3T2N0YXZlT3V0bGluZShnKTtcbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0ob2N0YXZlICogV2hpdGVLZXlXaWR0aCAqIEtleXNQZXJPY3RhdmUpLCAwKTtcbiAgICAgICAgfVxuICAgIH1cbiBcbiAgICAvKiBEcmF3IHRoZSBCbGFjayBrZXlzICovXG4gICAgcHJpdmF0ZSB2b2lkIERyYXdCbGFja0tleXMoR3JhcGhpY3MgZykge1xuICAgICAgICBmb3IgKGludCBvY3RhdmUgPSAwOyBvY3RhdmUgPCBNYXhPY3RhdmU7IG9jdGF2ZSsrKSB7XG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybShvY3RhdmUgKiBXaGl0ZUtleVdpZHRoICogS2V5c1Blck9jdGF2ZSwgMCk7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDEwOyBpICs9IDIpIHtcbiAgICAgICAgICAgICAgICBpbnQgeDEgPSBibGFja0tleU9mZnNldHNbaV07XG4gICAgICAgICAgICAgICAgaW50IHgyID0gYmxhY2tLZXlPZmZzZXRzW2krMV07XG4gICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkxQnJ1c2gsIHgxLCAwLCBCbGFja0tleVdpZHRoLCBCbGFja0tleUhlaWdodCk7XG4gICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkyQnJ1c2gsIHgxKzEsIEJsYWNrS2V5SGVpZ2h0IC0gQmxhY2tLZXlIZWlnaHQvOCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrS2V5V2lkdGgtMiwgQmxhY2tLZXlIZWlnaHQvOCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKG9jdGF2ZSAqIFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlKSwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBEcmF3IHRoZSBibGFjayBib3JkZXIgYXJlYSBzdXJyb3VuZGluZyB0aGUgcGlhbm8ga2V5cy5cbiAgICAgKiBBbHNvLCBkcmF3IGdyYXkgb3V0bGluZXMgYXQgdGhlIGJvdHRvbSBvZiB0aGUgd2hpdGUga2V5cy5cbiAgICAgKi9cbiAgICBwcml2YXRlIHZvaWQgRHJhd0JsYWNrQm9yZGVyKEdyYXBoaWNzIGcpIHtcbiAgICAgICAgaW50IFBpYW5vV2lkdGggPSBXaGl0ZUtleVdpZHRoICogS2V5c1Blck9jdGF2ZSAqIE1heE9jdGF2ZTtcbiAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkxQnJ1c2gsIG1hcmdpbiwgbWFyZ2luLCBQaWFub1dpZHRoICsgQmxhY2tCb3JkZXIqMiwgQmxhY2tCb3JkZXItMik7XG4gICAgICAgIGcuRmlsbFJlY3RhbmdsZShncmF5MUJydXNoLCBtYXJnaW4sIG1hcmdpbiwgQmxhY2tCb3JkZXIsIFdoaXRlS2V5SGVpZ2h0ICsgQmxhY2tCb3JkZXIgKiAzKTtcbiAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkxQnJ1c2gsIG1hcmdpbiwgbWFyZ2luICsgQmxhY2tCb3JkZXIgKyBXaGl0ZUtleUhlaWdodCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0JvcmRlcioyICsgUGlhbm9XaWR0aCwgQmxhY2tCb3JkZXIqMik7XG4gICAgICAgIGcuRmlsbFJlY3RhbmdsZShncmF5MUJydXNoLCBtYXJnaW4gKyBCbGFja0JvcmRlciArIFBpYW5vV2lkdGgsIG1hcmdpbiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0JvcmRlciwgV2hpdGVLZXlIZWlnaHQgKyBCbGFja0JvcmRlciozKTtcblxuICAgICAgICBnLkRyYXdMaW5lKGdyYXkyUGVuLCBtYXJnaW4gKyBCbGFja0JvcmRlciwgbWFyZ2luICsgQmxhY2tCb3JkZXIgLTEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW4gKyBCbGFja0JvcmRlciArIFBpYW5vV2lkdGgsIG1hcmdpbiArIEJsYWNrQm9yZGVyIC0xKTtcbiAgICAgICAgXG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKG1hcmdpbiArIEJsYWNrQm9yZGVyLCBtYXJnaW4gKyBCbGFja0JvcmRlcik7IFxuXG4gICAgICAgIC8vIERyYXcgdGhlIGdyYXkgYm90dG9tcyBvZiB0aGUgd2hpdGUga2V5cyAgXG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgS2V5c1Blck9jdGF2ZSAqIE1heE9jdGF2ZTsgaSsrKSB7XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTJCcnVzaCwgaSpXaGl0ZUtleVdpZHRoKzEsIFdoaXRlS2V5SGVpZ2h0KzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFdoaXRlS2V5V2lkdGgtMiwgQmxhY2tCb3JkZXIvMik7XG4gICAgICAgIH1cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShtYXJnaW4gKyBCbGFja0JvcmRlciksIC0obWFyZ2luICsgQmxhY2tCb3JkZXIpKTsgXG4gICAgfVxuXG4gICAgLyoqIERyYXcgdGhlIG5vdGUgbGV0dGVycyB1bmRlcm5lYXRoIGVhY2ggd2hpdGUgbm90ZSAqL1xuICAgIHByaXZhdGUgdm9pZCBEcmF3Tm90ZUxldHRlcnMoR3JhcGhpY3MgZykge1xuICAgICAgICBzdHJpbmdbXSBsZXR0ZXJzID0geyBcIkNcIiwgXCJEXCIsIFwiRVwiLCBcIkZcIiwgXCJHXCIsIFwiQVwiLCBcIkJcIiB9O1xuICAgICAgICBzdHJpbmdbXSBudW1iZXJzID0geyBcIjFcIiwgXCIzXCIsIFwiNVwiLCBcIjZcIiwgXCI4XCIsIFwiMTBcIiwgXCIxMlwiIH07XG4gICAgICAgIHN0cmluZ1tdIG5hbWVzO1xuICAgICAgICBpZiAoc2hvd05vdGVMZXR0ZXJzID09IE1pZGlPcHRpb25zLk5vdGVOYW1lTGV0dGVyKSB7XG4gICAgICAgICAgICBuYW1lcyA9IGxldHRlcnM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc2hvd05vdGVMZXR0ZXJzID09IE1pZGlPcHRpb25zLk5vdGVOYW1lRml4ZWROdW1iZXIpIHtcbiAgICAgICAgICAgIG5hbWVzID0gbnVtYmVycztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybShtYXJnaW4gKyBCbGFja0JvcmRlciwgbWFyZ2luICsgQmxhY2tCb3JkZXIpOyBcbiAgICAgICAgZm9yIChpbnQgb2N0YXZlID0gMDsgb2N0YXZlIDwgTWF4T2N0YXZlOyBvY3RhdmUrKykge1xuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBLZXlzUGVyT2N0YXZlOyBpKyspIHtcbiAgICAgICAgICAgICAgICBnLkRyYXdTdHJpbmcobmFtZXNbaV0sIFNoZWV0TXVzaWMuTGV0dGVyRm9udCwgQnJ1c2hlcy5XaGl0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKG9jdGF2ZSpLZXlzUGVyT2N0YXZlICsgaSkgKiBXaGl0ZUtleVdpZHRoICsgV2hpdGVLZXlXaWR0aC8zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBXaGl0ZUtleUhlaWdodCArIEJsYWNrQm9yZGVyICogMy80KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKG1hcmdpbiArIEJsYWNrQm9yZGVyKSwgLShtYXJnaW4gKyBCbGFja0JvcmRlcikpOyBcbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgUGlhbm8uICovXG4gICAgcHJvdGVjdGVkIC8qb3ZlcnJpZGUqLyB2b2lkIE9uUGFpbnQoUGFpbnRFdmVudEFyZ3MgZSkge1xuICAgICAgICBHcmFwaGljcyBnID0gZS5HcmFwaGljcygpO1xuICAgICAgICBnLlNtb290aGluZ01vZGUgPSBTbW9vdGhpbmdNb2RlLk5vbmU7XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKG1hcmdpbiArIEJsYWNrQm9yZGVyLCBtYXJnaW4gKyBCbGFja0JvcmRlcik7IFxuICAgICAgICBnLkZpbGxSZWN0YW5nbGUoQnJ1c2hlcy5XaGl0ZSwgMCwgMCwgXG4gICAgICAgICAgICAgICAgICAgICAgICBXaGl0ZUtleVdpZHRoICogS2V5c1Blck9jdGF2ZSAqIE1heE9jdGF2ZSwgV2hpdGVLZXlIZWlnaHQpO1xuICAgICAgICBEcmF3QmxhY2tLZXlzKGcpO1xuICAgICAgICBEcmF3T3V0bGluZShnKTtcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShtYXJnaW4gKyBCbGFja0JvcmRlciksIC0obWFyZ2luICsgQmxhY2tCb3JkZXIpKTtcbiAgICAgICAgRHJhd0JsYWNrQm9yZGVyKGcpO1xuICAgICAgICBpZiAoc2hvd05vdGVMZXR0ZXJzICE9IE1pZGlPcHRpb25zLk5vdGVOYW1lTm9uZSkge1xuICAgICAgICAgICAgRHJhd05vdGVMZXR0ZXJzKGcpO1xuICAgICAgICB9XG4gICAgICAgIGcuU21vb3RoaW5nTW9kZSA9IFNtb290aGluZ01vZGUuQW50aUFsaWFzO1xuICAgIH1cblxuICAgIC8qIFNoYWRlIHRoZSBnaXZlbiBub3RlIHdpdGggdGhlIGdpdmVuIGJydXNoLlxuICAgICAqIFdlIG9ubHkgZHJhdyBub3RlcyBmcm9tIG5vdGVudW1iZXIgMjQgdG8gOTYuXG4gICAgICogKE1pZGRsZS1DIGlzIDYwKS5cbiAgICAgKi9cbiAgICBwcml2YXRlIHZvaWQgU2hhZGVPbmVOb3RlKEdyYXBoaWNzIGcsIGludCBub3RlbnVtYmVyLCBCcnVzaCBicnVzaCkge1xuICAgICAgICBpbnQgb2N0YXZlID0gbm90ZW51bWJlciAvIDEyO1xuICAgICAgICBpbnQgbm90ZXNjYWxlID0gbm90ZW51bWJlciAlIDEyO1xuXG4gICAgICAgIG9jdGF2ZSAtPSAyO1xuICAgICAgICBpZiAob2N0YXZlIDwgMCB8fCBvY3RhdmUgPj0gTWF4T2N0YXZlKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKG9jdGF2ZSAqIFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlLCAwKTtcbiAgICAgICAgaW50IHgxLCB4MiwgeDM7XG5cbiAgICAgICAgaW50IGJvdHRvbUhhbGZIZWlnaHQgPSBXaGl0ZUtleUhlaWdodCAtIChCbGFja0tleUhlaWdodCszKTtcblxuICAgICAgICAvKiBub3Rlc2NhbGUgZ29lcyBmcm9tIDAgdG8gMTEsIGZyb20gQyB0byBCLiAqL1xuICAgICAgICBzd2l0Y2ggKG5vdGVzY2FsZSkge1xuICAgICAgICBjYXNlIDA6IC8qIEMgKi9cbiAgICAgICAgICAgIHgxID0gMjtcbiAgICAgICAgICAgIHgyID0gYmxhY2tLZXlPZmZzZXRzWzBdIC0gMjtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIDAsIHgyIC0geDEsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE6IC8qIEMjICovXG4gICAgICAgICAgICB4MSA9IGJsYWNrS2V5T2Zmc2V0c1swXTsgXG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1sxXTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIDAsIHgyIC0geDEsIEJsYWNrS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgIGlmIChicnVzaCA9PSBncmF5MUJydXNoKSB7XG4gICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkyQnJ1c2gsIHgxKzEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleUhlaWdodCAtIEJsYWNrS2V5SGVpZ2h0LzgsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleVdpZHRoLTIsIEJsYWNrS2V5SGVpZ2h0LzgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjogLyogRCAqL1xuICAgICAgICAgICAgeDEgPSBXaGl0ZUtleVdpZHRoICsgMjtcbiAgICAgICAgICAgIHgyID0gYmxhY2tLZXlPZmZzZXRzWzFdICsgMztcbiAgICAgICAgICAgIHgzID0gYmxhY2tLZXlPZmZzZXRzWzJdIC0gMjsgXG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgyLCAwLCB4MyAtIHgyLCBCbGFja0tleUhlaWdodCszKTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIEJsYWNrS2V5SGVpZ2h0KzMsIFdoaXRlS2V5V2lkdGgtMywgYm90dG9tSGFsZkhlaWdodCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOiAvKiBEIyAqL1xuICAgICAgICAgICAgeDEgPSBibGFja0tleU9mZnNldHNbMl07IFxuICAgICAgICAgICAgeDIgPSBibGFja0tleU9mZnNldHNbM107XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgxLCAwLCBCbGFja0tleVdpZHRoLCBCbGFja0tleUhlaWdodCk7XG4gICAgICAgICAgICBpZiAoYnJ1c2ggPT0gZ3JheTFCcnVzaCkge1xuICAgICAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShncmF5MkJydXNoLCB4MSsxLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmxhY2tLZXlIZWlnaHQgLSBCbGFja0tleUhlaWdodC84LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmxhY2tLZXlXaWR0aC0yLCBCbGFja0tleUhlaWdodC84KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ6IC8qIEUgKi9cbiAgICAgICAgICAgIHgxID0gV2hpdGVLZXlXaWR0aCAqIDIgKyAyO1xuICAgICAgICAgICAgeDIgPSBibGFja0tleU9mZnNldHNbM10gKyAzOyBcbiAgICAgICAgICAgIHgzID0gV2hpdGVLZXlXaWR0aCAqIDMgLSAxO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MiwgMCwgeDMgLSB4MiwgQmxhY2tLZXlIZWlnaHQrMyk7XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgxLCBCbGFja0tleUhlaWdodCszLCBXaGl0ZUtleVdpZHRoLTMsIGJvdHRvbUhhbGZIZWlnaHQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTogLyogRiAqL1xuICAgICAgICAgICAgeDEgPSBXaGl0ZUtleVdpZHRoICogMyArIDI7XG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1s0XSAtIDI7IFxuICAgICAgICAgICAgeDMgPSBXaGl0ZUtleVdpZHRoICogNCAtIDI7XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgxLCAwLCB4MiAtIHgxLCBCbGFja0tleUhlaWdodCszKTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIEJsYWNrS2V5SGVpZ2h0KzMsIFdoaXRlS2V5V2lkdGgtMywgYm90dG9tSGFsZkhlaWdodCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA2OiAvKiBGIyAqL1xuICAgICAgICAgICAgeDEgPSBibGFja0tleU9mZnNldHNbNF07IFxuICAgICAgICAgICAgeDIgPSBibGFja0tleU9mZnNldHNbNV07XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgxLCAwLCBCbGFja0tleVdpZHRoLCBCbGFja0tleUhlaWdodCk7XG4gICAgICAgICAgICBpZiAoYnJ1c2ggPT0gZ3JheTFCcnVzaCkge1xuICAgICAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShncmF5MkJydXNoLCB4MSsxLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmxhY2tLZXlIZWlnaHQgLSBCbGFja0tleUhlaWdodC84LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmxhY2tLZXlXaWR0aC0yLCBCbGFja0tleUhlaWdodC84KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDc6IC8qIEcgKi9cbiAgICAgICAgICAgIHgxID0gV2hpdGVLZXlXaWR0aCAqIDQgKyAyO1xuICAgICAgICAgICAgeDIgPSBibGFja0tleU9mZnNldHNbNV0gKyAzOyBcbiAgICAgICAgICAgIHgzID0gYmxhY2tLZXlPZmZzZXRzWzZdIC0gMjsgXG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgyLCAwLCB4MyAtIHgyLCBCbGFja0tleUhlaWdodCszKTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIEJsYWNrS2V5SGVpZ2h0KzMsIFdoaXRlS2V5V2lkdGgtMywgYm90dG9tSGFsZkhlaWdodCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA4OiAvKiBHIyAqL1xuICAgICAgICAgICAgeDEgPSBibGFja0tleU9mZnNldHNbNl07IFxuICAgICAgICAgICAgeDIgPSBibGFja0tleU9mZnNldHNbN107XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgxLCAwLCBCbGFja0tleVdpZHRoLCBCbGFja0tleUhlaWdodCk7XG4gICAgICAgICAgICBpZiAoYnJ1c2ggPT0gZ3JheTFCcnVzaCkge1xuICAgICAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShncmF5MkJydXNoLCB4MSsxLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmxhY2tLZXlIZWlnaHQgLSBCbGFja0tleUhlaWdodC84LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmxhY2tLZXlXaWR0aC0yLCBCbGFja0tleUhlaWdodC84KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDk6IC8qIEEgKi9cbiAgICAgICAgICAgIHgxID0gV2hpdGVLZXlXaWR0aCAqIDUgKyAyO1xuICAgICAgICAgICAgeDIgPSBibGFja0tleU9mZnNldHNbN10gKyAzOyBcbiAgICAgICAgICAgIHgzID0gYmxhY2tLZXlPZmZzZXRzWzhdIC0gMjsgXG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgyLCAwLCB4MyAtIHgyLCBCbGFja0tleUhlaWdodCszKTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIEJsYWNrS2V5SGVpZ2h0KzMsIFdoaXRlS2V5V2lkdGgtMywgYm90dG9tSGFsZkhlaWdodCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMDogLyogQSMgKi9cbiAgICAgICAgICAgIHgxID0gYmxhY2tLZXlPZmZzZXRzWzhdOyBcbiAgICAgICAgICAgIHgyID0gYmxhY2tLZXlPZmZzZXRzWzldO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgMCwgQmxhY2tLZXlXaWR0aCwgQmxhY2tLZXlIZWlnaHQpO1xuICAgICAgICAgICAgaWYgKGJydXNoID09IGdyYXkxQnJ1c2gpIHtcbiAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTJCcnVzaCwgeDErMSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrS2V5SGVpZ2h0IC0gQmxhY2tLZXlIZWlnaHQvOCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrS2V5V2lkdGgtMiwgQmxhY2tLZXlIZWlnaHQvOCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMTogLyogQiAqL1xuICAgICAgICAgICAgeDEgPSBXaGl0ZUtleVdpZHRoICogNiArIDI7XG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1s5XSArIDM7IFxuICAgICAgICAgICAgeDMgPSBXaGl0ZUtleVdpZHRoICogS2V5c1Blck9jdGF2ZSAtIDE7XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgyLCAwLCB4MyAtIHgyLCBCbGFja0tleUhlaWdodCszKTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIEJsYWNrS2V5SGVpZ2h0KzMsIFdoaXRlS2V5V2lkdGgtMywgYm90dG9tSGFsZkhlaWdodCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0ob2N0YXZlICogV2hpdGVLZXlXaWR0aCAqIEtleXNQZXJPY3RhdmUpLCAwKTtcbiAgICB9XG5cbiAgICAvKiogRmluZCB0aGUgTWlkaU5vdGUgd2l0aCB0aGUgc3RhcnRUaW1lIGNsb3Nlc3QgdG8gdGhlIGdpdmVuIHRpbWUuXG4gICAgICogIFJldHVybiB0aGUgaW5kZXggb2YgdGhlIG5vdGUuICBVc2UgYSBiaW5hcnkgc2VhcmNoIG1ldGhvZC5cbiAgICAgKi9cbiAgICBwcml2YXRlIGludCBGaW5kQ2xvc2VzdFN0YXJ0VGltZShpbnQgcHVsc2VUaW1lKSB7XG4gICAgICAgIGludCBsZWZ0ID0gMDtcbiAgICAgICAgaW50IHJpZ2h0ID0gbm90ZXMuQ291bnQtMTtcblxuICAgICAgICB3aGlsZSAocmlnaHQgLSBsZWZ0ID4gMSkge1xuICAgICAgICAgICAgaW50IGkgPSAocmlnaHQgKyBsZWZ0KS8yO1xuICAgICAgICAgICAgaWYgKG5vdGVzW2xlZnRdLlN0YXJ0VGltZSA9PSBwdWxzZVRpbWUpXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBlbHNlIGlmIChub3Rlc1tpXS5TdGFydFRpbWUgPD0gcHVsc2VUaW1lKVxuICAgICAgICAgICAgICAgIGxlZnQgPSBpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJpZ2h0ID0gaTtcbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAobGVmdCA+PSAxICYmIChub3Rlc1tsZWZ0LTFdLlN0YXJ0VGltZSA9PSBub3Rlc1tsZWZ0XS5TdGFydFRpbWUpKSB7XG4gICAgICAgICAgICBsZWZ0LS07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxlZnQ7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgbmV4dCBTdGFydFRpbWUgdGhhdCBvY2N1cnMgYWZ0ZXIgdGhlIE1pZGlOb3RlXG4gICAgICogIGF0IG9mZnNldCBpLCB0aGF0IGlzIGFsc28gaW4gdGhlIHNhbWUgdHJhY2svY2hhbm5lbC5cbiAgICAgKi9cbiAgICBwcml2YXRlIGludCBOZXh0U3RhcnRUaW1lU2FtZVRyYWNrKGludCBpKSB7XG4gICAgICAgIGludCBzdGFydCA9IG5vdGVzW2ldLlN0YXJ0VGltZTtcbiAgICAgICAgaW50IGVuZCA9IG5vdGVzW2ldLkVuZFRpbWU7XG4gICAgICAgIGludCB0cmFjayA9IG5vdGVzW2ldLkNoYW5uZWw7XG5cbiAgICAgICAgd2hpbGUgKGkgPCBub3Rlcy5Db3VudCkge1xuICAgICAgICAgICAgaWYgKG5vdGVzW2ldLkNoYW5uZWwgIT0gdHJhY2spIHtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm90ZXNbaV0uU3RhcnRUaW1lID4gc3RhcnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbm90ZXNbaV0uU3RhcnRUaW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZW5kID0gTWF0aC5NYXgoZW5kLCBub3Rlc1tpXS5FbmRUaW1lKTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZW5kO1xuICAgIH1cblxuXG4gICAgLyoqIFJldHVybiB0aGUgbmV4dCBTdGFydFRpbWUgdGhhdCBvY2N1cnMgYWZ0ZXIgdGhlIE1pZGlOb3RlXG4gICAgICogIGF0IG9mZnNldCBpLiAgSWYgYWxsIHRoZSBzdWJzZXF1ZW50IG5vdGVzIGhhdmUgdGhlIHNhbWVcbiAgICAgKiAgU3RhcnRUaW1lLCB0aGVuIHJldHVybiB0aGUgbGFyZ2VzdCBFbmRUaW1lLlxuICAgICAqL1xuICAgIHByaXZhdGUgaW50IE5leHRTdGFydFRpbWUoaW50IGkpIHtcbiAgICAgICAgaW50IHN0YXJ0ID0gbm90ZXNbaV0uU3RhcnRUaW1lO1xuICAgICAgICBpbnQgZW5kID0gbm90ZXNbaV0uRW5kVGltZTtcblxuICAgICAgICB3aGlsZSAoaSA8IG5vdGVzLkNvdW50KSB7XG4gICAgICAgICAgICBpZiAobm90ZXNbaV0uU3RhcnRUaW1lID4gc3RhcnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbm90ZXNbaV0uU3RhcnRUaW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZW5kID0gTWF0aC5NYXgoZW5kLCBub3Rlc1tpXS5FbmRUaW1lKTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZW5kO1xuICAgIH1cblxuICAgIC8qKiBGaW5kIHRoZSBNaWRpIG5vdGVzIHRoYXQgb2NjdXIgaW4gdGhlIGN1cnJlbnQgdGltZS5cbiAgICAgKiAgU2hhZGUgdGhvc2Ugbm90ZXMgb24gdGhlIHBpYW5vIGRpc3BsYXllZC5cbiAgICAgKiAgVW4tc2hhZGUgdGhlIHRob3NlIG5vdGVzIHBsYXllZCBpbiB0aGUgcHJldmlvdXMgdGltZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBTaGFkZU5vdGVzKGludCBjdXJyZW50UHVsc2VUaW1lLCBpbnQgcHJldlB1bHNlVGltZSkge1xuICAgICAgICBpZiAobm90ZXMgPT0gbnVsbCB8fCBub3Rlcy5Db3VudCA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdyYXBoaWNzID09IG51bGwpIHtcbiAgICAgICAgICAgIGdyYXBoaWNzID0gQ3JlYXRlR3JhcGhpY3MoXCJzaGFkZU5vdGVzX3BpYW5vXCIpO1xuICAgICAgICB9XG4gICAgICAgIGdyYXBoaWNzLlNtb290aGluZ01vZGUgPSBTbW9vdGhpbmdNb2RlLk5vbmU7XG4gICAgICAgIGdyYXBoaWNzLlRyYW5zbGF0ZVRyYW5zZm9ybShtYXJnaW4gKyBCbGFja0JvcmRlciwgbWFyZ2luICsgQmxhY2tCb3JkZXIpO1xuXG4gICAgICAgIC8qIExvb3AgdGhyb3VnaCB0aGUgTWlkaSBub3Rlcy5cbiAgICAgICAgICogVW5zaGFkZSBub3RlcyB3aGVyZSBTdGFydFRpbWUgPD0gcHJldlB1bHNlVGltZSA8IG5leHQgU3RhcnRUaW1lXG4gICAgICAgICAqIFNoYWRlIG5vdGVzIHdoZXJlIFN0YXJ0VGltZSA8PSBjdXJyZW50UHVsc2VUaW1lIDwgbmV4dCBTdGFydFRpbWVcbiAgICAgICAgICovXG4gICAgICAgIGludCBsYXN0U2hhZGVkSW5kZXggPSBGaW5kQ2xvc2VzdFN0YXJ0VGltZShwcmV2UHVsc2VUaW1lIC0gbWF4U2hhZGVEdXJhdGlvbiAqIDIpO1xuICAgICAgICBmb3IgKGludCBpID0gbGFzdFNoYWRlZEluZGV4OyBpIDwgbm90ZXMuQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgaW50IHN0YXJ0ID0gbm90ZXNbaV0uU3RhcnRUaW1lO1xuICAgICAgICAgICAgaW50IGVuZCA9IG5vdGVzW2ldLkVuZFRpbWU7XG4gICAgICAgICAgICBpbnQgbm90ZW51bWJlciA9IG5vdGVzW2ldLk51bWJlcjtcbiAgICAgICAgICAgIGludCBuZXh0U3RhcnQgPSBOZXh0U3RhcnRUaW1lKGkpO1xuICAgICAgICAgICAgaW50IG5leHRTdGFydFRyYWNrID0gTmV4dFN0YXJ0VGltZVNhbWVUcmFjayhpKTtcbiAgICAgICAgICAgIGVuZCA9IE1hdGguTWF4KGVuZCwgbmV4dFN0YXJ0VHJhY2spO1xuICAgICAgICAgICAgZW5kID0gTWF0aC5NaW4oZW5kLCBzdGFydCArIG1heFNoYWRlRHVyYXRpb24tMSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvKiBJZiB3ZSd2ZSBwYXN0IHRoZSBwcmV2aW91cyBhbmQgY3VycmVudCB0aW1lcywgd2UncmUgZG9uZS4gKi9cbiAgICAgICAgICAgIGlmICgoc3RhcnQgPiBwcmV2UHVsc2VUaW1lKSAmJiAoc3RhcnQgPiBjdXJyZW50UHVsc2VUaW1lKSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBJZiBzaGFkZWQgbm90ZXMgYXJlIHRoZSBzYW1lLCB3ZSdyZSBkb25lICovXG4gICAgICAgICAgICBpZiAoKHN0YXJ0IDw9IGN1cnJlbnRQdWxzZVRpbWUpICYmIChjdXJyZW50UHVsc2VUaW1lIDwgbmV4dFN0YXJ0KSAmJlxuICAgICAgICAgICAgICAgIChjdXJyZW50UHVsc2VUaW1lIDwgZW5kKSAmJiBcbiAgICAgICAgICAgICAgICAoc3RhcnQgPD0gcHJldlB1bHNlVGltZSkgJiYgKHByZXZQdWxzZVRpbWUgPCBuZXh0U3RhcnQpICYmXG4gICAgICAgICAgICAgICAgKHByZXZQdWxzZVRpbWUgPCBlbmQpKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIElmIHRoZSBub3RlIGlzIGluIHRoZSBjdXJyZW50IHRpbWUsIHNoYWRlIGl0ICovXG4gICAgICAgICAgICBpZiAoKHN0YXJ0IDw9IGN1cnJlbnRQdWxzZVRpbWUpICYmIChjdXJyZW50UHVsc2VUaW1lIDwgZW5kKSkge1xuICAgICAgICAgICAgICAgIGlmICh1c2VUd29Db2xvcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vdGVzW2ldLkNoYW5uZWwgPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgU2hhZGVPbmVOb3RlKGdyYXBoaWNzLCBub3RlbnVtYmVyLCBzaGFkZTJCcnVzaCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTaGFkZU9uZU5vdGUoZ3JhcGhpY3MsIG5vdGVudW1iZXIsIHNoYWRlQnJ1c2gpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBTaGFkZU9uZU5vdGUoZ3JhcGhpY3MsIG5vdGVudW1iZXIsIHNoYWRlQnJ1c2gpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogSWYgdGhlIG5vdGUgaXMgaW4gdGhlIHByZXZpb3VzIHRpbWUsIHVuLXNoYWRlIGl0LCBkcmF3IGl0IHdoaXRlLiAqL1xuICAgICAgICAgICAgZWxzZSBpZiAoKHN0YXJ0IDw9IHByZXZQdWxzZVRpbWUpICYmIChwcmV2UHVsc2VUaW1lIDwgZW5kKSkge1xuICAgICAgICAgICAgICAgIGludCBudW0gPSBub3RlbnVtYmVyICUgMTI7XG4gICAgICAgICAgICAgICAgaWYgKG51bSA9PSAxIHx8IG51bSA9PSAzIHx8IG51bSA9PSA2IHx8IG51bSA9PSA4IHx8IG51bSA9PSAxMCkge1xuICAgICAgICAgICAgICAgICAgICBTaGFkZU9uZU5vdGUoZ3JhcGhpY3MsIG5vdGVudW1iZXIsIGdyYXkxQnJ1c2gpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgU2hhZGVPbmVOb3RlKGdyYXBoaWNzLCBub3RlbnVtYmVyLCBCcnVzaGVzLldoaXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZ3JhcGhpY3MuVHJhbnNsYXRlVHJhbnNmb3JtKC0obWFyZ2luICsgQmxhY2tCb3JkZXIpLCAtKG1hcmdpbiArIEJsYWNrQm9yZGVyKSk7XG4gICAgICAgIGdyYXBoaWNzLlNtb290aGluZ01vZGUgPSBTbW9vdGhpbmdNb2RlLkFudGlBbGlhcztcbiAgICB9XG59XG5cbn1cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMSBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuXG4vKiBAY2xhc3MgUmVzdFN5bWJvbFxuICogQSBSZXN0IHN5bWJvbCByZXByZXNlbnRzIGEgcmVzdCAtIHdob2xlLCBoYWxmLCBxdWFydGVyLCBvciBlaWdodGguXG4gKiBUaGUgUmVzdCBzeW1ib2wgaGFzIGEgc3RhcnR0aW1lIGFuZCBhIGR1cmF0aW9uLCBqdXN0IGxpa2UgYSByZWd1bGFyXG4gKiBub3RlLlxuICovXG5wdWJsaWMgY2xhc3MgUmVzdFN5bWJvbCA6IE11c2ljU3ltYm9sIHtcbiAgICBwcml2YXRlIGludCBzdGFydHRpbWU7ICAgICAgICAgIC8qKiBUaGUgc3RhcnR0aW1lIG9mIHRoZSByZXN0ICovXG4gICAgcHJpdmF0ZSBOb3RlRHVyYXRpb24gZHVyYXRpb247ICAvKiogVGhlIHJlc3QgZHVyYXRpb24gKGVpZ2h0aCwgcXVhcnRlciwgaGFsZiwgd2hvbGUpICovXG4gICAgcHJpdmF0ZSBpbnQgd2lkdGg7ICAgICAgICAgICAgICAvKiogVGhlIHdpZHRoIGluIHBpeGVscyAqL1xuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyByZXN0IHN5bWJvbCB3aXRoIHRoZSBnaXZlbiBzdGFydCB0aW1lIGFuZCBkdXJhdGlvbiAqL1xuICAgIHB1YmxpYyBSZXN0U3ltYm9sKGludCBzdGFydCwgTm90ZUR1cmF0aW9uIGR1cikge1xuICAgICAgICBzdGFydHRpbWUgPSBzdGFydDtcbiAgICAgICAgZHVyYXRpb24gPSBkdXI7IFxuICAgICAgICB3aWR0aCA9IE1pbldpZHRoO1xuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIHRpbWUgKGluIHB1bHNlcykgdGhpcyBzeW1ib2wgb2NjdXJzIGF0LlxuICAgICAqIFRoaXMgaXMgdXNlZCB0byBkZXRlcm1pbmUgdGhlIG1lYXN1cmUgdGhpcyBzeW1ib2wgYmVsb25ncyB0by5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFN0YXJ0VGltZSB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gc3RhcnR0aW1lOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldC9TZXQgdGhlIHdpZHRoIChpbiBwaXhlbHMpIG9mIHRoaXMgc3ltYm9sLiBUaGUgd2lkdGggaXMgc2V0XG4gICAgICogaW4gU2hlZXRNdXNpYy5BbGlnblN5bWJvbHMoKSB0byB2ZXJ0aWNhbGx5IGFsaWduIHN5bWJvbHMuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBXaWR0aCB7XG4gICAgICAgIGdldCB7IHJldHVybiB3aWR0aDsgfVxuICAgICAgICBzZXQgeyB3aWR0aCA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbWluaW11bSB3aWR0aCAoaW4gcGl4ZWxzKSBuZWVkZWQgdG8gZHJhdyB0aGlzIHN5bWJvbCAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgTWluV2lkdGgge1xuICAgICAgICBnZXQgeyByZXR1cm4gMiAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodCArIFxuICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBhYm92ZSB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBBYm92ZVN0YWZmIHsgXG4gICAgICAgIGdldCB7IHJldHVybiAwOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGJlbG93IHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEJlbG93U3RhZmYgeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIDA7IH1cbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgc3ltYm9sLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBcbiAgICB2b2lkIERyYXcoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3ApIHtcbiAgICAgICAgLyogQWxpZ24gdGhlIHJlc3Qgc3ltYm9sIHRvIHRoZSByaWdodCAqL1xuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybShXaWR0aCAtIE1pbldpZHRoLCAwKTtcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIsIDApO1xuXG4gICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uV2hvbGUpIHtcbiAgICAgICAgICAgIERyYXdXaG9sZShnLCBwZW4sIHl0b3ApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5IYWxmKSB7XG4gICAgICAgICAgICBEcmF3SGFsZihnLCBwZW4sIHl0b3ApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5RdWFydGVyKSB7XG4gICAgICAgICAgICBEcmF3UXVhcnRlcihnLCBwZW4sIHl0b3ApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5FaWdodGgpIHtcbiAgICAgICAgICAgIERyYXdFaWdodGgoZywgcGVuLCB5dG9wKTtcbiAgICAgICAgfVxuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIsIDApO1xuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKFdpZHRoIC0gTWluV2lkdGgpLCAwKTtcbiAgICB9XG5cblxuICAgIC8qKiBEcmF3IGEgd2hvbGUgcmVzdCBzeW1ib2wsIGEgcmVjdGFuZ2xlIGJlbG93IGEgc3RhZmYgbGluZS5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3V2hvbGUoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3ApIHtcbiAgICAgICAgaW50IHkgPSB5dG9wICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuXG4gICAgICAgIGcuRmlsbFJlY3RhbmdsZShCcnVzaGVzLkJsYWNrLCAwLCB5LCBcbiAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZVdpZHRoLCBTaGVldE11c2ljLk5vdGVIZWlnaHQvMik7XG4gICAgfVxuXG4gICAgLyoqIERyYXcgYSBoYWxmIHJlc3Qgc3ltYm9sLCBhIHJlY3RhbmdsZSBhYm92ZSBhIHN0YWZmIGxpbmUuXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHlsb2NhdGlvbiAoaW4gcGl4ZWxzKSB3aGVyZSB0aGUgdG9wIG9mIHRoZSBzdGFmZiBzdGFydHMuXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgRHJhd0hhbGYoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3ApIHtcbiAgICAgICAgaW50IHkgPSB5dG9wICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG5cbiAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKEJydXNoZXMuQmxhY2ssIDAsIHksIFxuICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlV2lkdGgsIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yKTtcbiAgICB9XG5cbiAgICAvKiogRHJhdyBhIHF1YXJ0ZXIgcmVzdCBzeW1ib2wuXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHlsb2NhdGlvbiAoaW4gcGl4ZWxzKSB3aGVyZSB0aGUgdG9wIG9mIHRoZSBzdGFmZiBzdGFydHMuXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgRHJhd1F1YXJ0ZXIoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3ApIHtcbiAgICAgICAgcGVuLkVuZENhcCA9IExpbmVDYXAuRmxhdDtcblxuICAgICAgICBpbnQgeSA9IHl0b3AgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcbiAgICAgICAgaW50IHggPSAyO1xuICAgICAgICBpbnQgeGVuZCA9IHggKyAyKlNoZWV0TXVzaWMuTm90ZUhlaWdodC8zO1xuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeCwgeSwgeGVuZC0xLCB5ICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LTEpO1xuXG4gICAgICAgIHBlbi5XaWR0aCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzI7XG4gICAgICAgIHkgID0geXRvcCArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCArIDE7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCB4ZW5kLTIsIHksIHgsIHkgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQpO1xuXG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG4gICAgICAgIHkgPSB5dG9wICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIgLSAxO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgMCwgeSwgeGVuZCsyLCB5ICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KTsgXG5cbiAgICAgICAgcGVuLldpZHRoID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvMjtcbiAgICAgICAgaWYgKFNoZWV0TXVzaWMuTm90ZUhlaWdodCA9PSA2KSB7XG4gICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeGVuZCwgeSArIDEgKyAzKlNoZWV0TXVzaWMuTm90ZUhlaWdodC80LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHgvMiwgeSArIDEgKyAzKlNoZWV0TXVzaWMuTm90ZUhlaWdodC80KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHsgIC8qIE5vdGVIZWlnaHQgPT0gOCAqL1xuICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHhlbmQsIHkgKyAzKlNoZWV0TXVzaWMuTm90ZUhlaWdodC80LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHgvMiwgeSArIDMqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIDAsIHkgKyAyKlNoZWV0TXVzaWMuTm90ZUhlaWdodC8zICsgMSwgXG4gICAgICAgICAgICAgICAgICAgICAgICB4ZW5kIC0gMSwgeSArIDMqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIpO1xuICAgIH1cblxuICAgIC8qKiBEcmF3IGFuIGVpZ2h0aCByZXN0IHN5bWJvbC5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3RWlnaHRoKEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIGludCB5ID0geXRvcCArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCAtIDE7XG4gICAgICAgIGcuRmlsbEVsbGlwc2UoQnJ1c2hlcy5CbGFjaywgMCwgeSsxLCBcbiAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxpbmVTcGFjZS0xLCBTaGVldE11c2ljLkxpbmVTcGFjZS0xKTtcbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIChTaGVldE11c2ljLkxpbmVTcGFjZS0yKS8yLCB5ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UtMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIDMqU2hlZXRNdXNpYy5MaW5lU3BhY2UvMiwgeSArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIpO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgMypTaGVldE11c2ljLkxpbmVTcGFjZS8yLCB5ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMixcbiAgICAgICAgICAgICAgICAgICAgICAgIDMqU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCwgeSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb3ZlcnJpZGUgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gc3RyaW5nLkZvcm1hdChcIlJlc3RTeW1ib2wgc3RhcnR0aW1lPXswfSBkdXJhdGlvbj17MX0gd2lkdGg9ezJ9XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0dGltZSwgZHVyYXRpb24sIHdpZHRoKTtcbiAgICB9XG5cbn1cblxuXG59XG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMiBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuXHJcblxyXG4gICAgLyoqIEBjbGFzcyBTaGVldE11c2ljXG4gICAgICpcbiAgICAgKiBUaGUgU2hlZXRNdXNpYyBDb250cm9sIGlzIHRoZSBtYWluIGNsYXNzIGZvciBkaXNwbGF5aW5nIHRoZSBzaGVldCBtdXNpYy5cbiAgICAgKiBUaGUgU2hlZXRNdXNpYyBjbGFzcyBoYXMgdGhlIGZvbGxvd2luZyBwdWJsaWMgbWV0aG9kczpcbiAgICAgKlxuICAgICAqIFNoZWV0TXVzaWMoKVxuICAgICAqICAgQ3JlYXRlIGEgbmV3IFNoZWV0TXVzaWMgY29udHJvbCBmcm9tIHRoZSBnaXZlbiBtaWRpIGZpbGUgYW5kIG9wdGlvbnMuXG4gICAgICogXG4gICAgICogU2V0Wm9vbSgpXG4gICAgICogICBTZXQgdGhlIHpvb20gbGV2ZWwgdG8gZGlzcGxheSB0aGUgc2hlZXQgbXVzaWMgYXQuXG4gICAgICpcbiAgICAgKiBEb1ByaW50KClcbiAgICAgKiAgIFByaW50IGEgc2luZ2xlIHBhZ2Ugb2Ygc2hlZXQgbXVzaWMuXG4gICAgICpcbiAgICAgKiBHZXRUb3RhbFBhZ2VzKClcbiAgICAgKiAgIEdldCB0aGUgdG90YWwgbnVtYmVyIG9mIHNoZWV0IG11c2ljIHBhZ2VzLlxuICAgICAqXG4gICAgICogT25QYWludCgpXG4gICAgICogICBNZXRob2QgY2FsbGVkIHRvIGRyYXcgdGhlIFNoZWV0TXVpc2NcbiAgICAgKlxuICAgICAqIFRoZXNlIHB1YmxpYyBtZXRob2RzIGFyZSBjYWxsZWQgZnJvbSB0aGUgTWlkaVNoZWV0TXVzaWMgRm9ybSBXaW5kb3cuXG4gICAgICpcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjbGFzcyBTaGVldE11c2ljIDogQ29udHJvbFxyXG4gICAge1xyXG5cclxuICAgICAgICAvKiBNZWFzdXJlbWVudHMgdXNlZCB3aGVuIGRyYXdpbmcuICBBbGwgbWVhc3VyZW1lbnRzIGFyZSBpbiBwaXhlbHMuXHJcbiAgICAgICAgICogVGhlIHZhbHVlcyBkZXBlbmQgb24gd2hldGhlciB0aGUgbWVudSAnTGFyZ2UgTm90ZXMnIG9yICdTbWFsbCBOb3RlcycgaXMgc2VsZWN0ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBMaW5lV2lkdGggPSAxOyAgICAvKiogVGhlIHdpZHRoIG9mIGEgbGluZSAqL1xyXG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgTGVmdE1hcmdpbiA9IDQ7ICAgLyoqIFRoZSBsZWZ0IG1hcmdpbiAqL1xyXG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgVGl0bGVIZWlnaHQgPSAxNDsgLyoqIFRoZSBoZWlnaHQgZm9yIHRoZSB0aXRsZSBvbiB0aGUgZmlyc3QgcGFnZSAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaW50IExpbmVTcGFjZTsgICAgICAgIC8qKiBUaGUgc3BhY2UgYmV0d2VlbiBsaW5lcyBpbiB0aGUgc3RhZmYgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGludCBTdGFmZkhlaWdodDsgICAgICAvKiogVGhlIGhlaWdodCBiZXR3ZWVuIHRoZSA1IGhvcml6b250YWwgbGluZXMgb2YgdGhlIHN0YWZmICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBpbnQgTm90ZUhlaWdodDsgICAgICAvKiogVGhlIGhlaWdodCBvZiBhIHdob2xlIG5vdGUgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGludCBOb3RlV2lkdGg7ICAgICAgIC8qKiBUaGUgd2lkdGggb2YgYSB3aG9sZSBub3RlICovXHJcblxyXG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgUGFnZVdpZHRoID0gODAwOyAgICAvKiogVGhlIHdpZHRoIG9mIGVhY2ggcGFnZSAqL1xyXG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgUGFnZUhlaWdodCA9IDEwNTA7ICAvKiogVGhlIGhlaWdodCBvZiBlYWNoIHBhZ2UgKHdoZW4gcHJpbnRpbmcpICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBGb250IExldHRlckZvbnQ7ICAgICAgIC8qKiBUaGUgZm9udCBmb3IgZHJhd2luZyB0aGUgbGV0dGVycyAqL1xyXG5cclxuICAgICAgICBwcml2YXRlIExpc3Q8U3RhZmY+IHN0YWZmczsgLyoqIFRoZSBhcnJheSBvZiBzdGFmZnMgdG8gZGlzcGxheSAoZnJvbSB0b3AgdG8gYm90dG9tKSAqL1xyXG4gICAgICAgIHByaXZhdGUgS2V5U2lnbmF0dXJlIG1haW5rZXk7IC8qKiBUaGUgbWFpbiBrZXkgc2lnbmF0dXJlICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgbnVtdHJhY2tzOyAgICAgLyoqIFRoZSBudW1iZXIgb2YgdHJhY2tzICovXHJcbiAgICAgICAgcHJpdmF0ZSBmbG9hdCB6b29tOyAgICAgICAgICAvKiogVGhlIHpvb20gbGV2ZWwgdG8gZHJhdyBhdCAoMS4wID09IDEwMCUpICovXHJcbiAgICAgICAgcHJpdmF0ZSBib29sIHNjcm9sbFZlcnQ7ICAgIC8qKiBXaGV0aGVyIHRvIHNjcm9sbCB2ZXJ0aWNhbGx5IG9yIGhvcml6b250YWxseSAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RyaW5nIGZpbGVuYW1lOyAgICAgIC8qKiBUaGUgbmFtZSBvZiB0aGUgbWlkaSBmaWxlICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgc2hvd05vdGVMZXR0ZXJzOyAgICAvKiogRGlzcGxheSB0aGUgbm90ZSBsZXR0ZXJzICovXHJcbiAgICAgICAgcHJpdmF0ZSBDb2xvcltdIE5vdGVDb2xvcnM7ICAgICAvKiogVGhlIG5vdGUgY29sb3JzIHRvIHVzZSAqL1xyXG4gICAgICAgIHByaXZhdGUgU29saWRCcnVzaCBzaGFkZUJydXNoOyAgLyoqIFRoZSBicnVzaCBmb3Igc2hhZGluZyAqL1xyXG4gICAgICAgIHByaXZhdGUgU29saWRCcnVzaCBzaGFkZTJCcnVzaDsgLyoqIFRoZSBicnVzaCBmb3Igc2hhZGluZyBsZWZ0LWhhbmQgcGlhbm8gKi9cclxuICAgICAgICBwcml2YXRlIFNvbGlkQnJ1c2ggZGVzZWxlY3RlZFNoYWRlQnJ1c2ggPSBuZXcgU29saWRCcnVzaChDb2xvci5MaWdodEdyYXkpOyAvKiogVGhlIGJydXNoIGZvciBzaGFkaW5nIGRlc2VsZWN0ZWQgYXJlYXMgKi9cclxuICAgICAgICBwcml2YXRlIFBlbiBwZW47ICAgICAgICAgICAgICAgIC8qKiBUaGUgYmxhY2sgcGVuIGZvciBkcmF3aW5nICovXHJcblxyXG4gICAgICAgIHB1YmxpYyBpbnQgU2VsZWN0aW9uU3RhcnRQdWxzZSB7IGdldDsgc2V0OyB9XG4gICAgICAgIHB1YmxpYyBpbnQgU2VsZWN0aW9uRW5kUHVsc2UgeyBnZXQ7IHNldDsgfVxyXG5cclxuICAgICAgICAvKiogSW5pdGlhbGl6ZSB0aGUgZGVmYXVsdCBub3RlIHNpemVzLiAgKi9cclxuICAgICAgICBzdGF0aWMgU2hlZXRNdXNpYygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTZXROb3RlU2l6ZShmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogQ3JlYXRlIGEgbmV3IFNoZWV0TXVzaWMgY29udHJvbCwgdXNpbmcgdGhlIGdpdmVuIHBhcnNlZCBNaWRpRmlsZS5cbiAgICAgICAgICogIFRoZSBvcHRpb25zIGNhbiBiZSBudWxsLlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgU2hlZXRNdXNpYyhNaWRpRmlsZSBmaWxlLCBNaWRpT3B0aW9ucyBvcHRpb25zKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW5pdChmaWxlLCBvcHRpb25zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBDcmVhdGUgYSBuZXcgU2hlZXRNdXNpYyBjb250cm9sLCB1c2luZyB0aGUgZ2l2ZW4gcmF3IG1pZGkgYnl0ZVtdIGRhdGEuXG4gICAgICAgICAqICBUaGUgb3B0aW9ucyBjYW4gYmUgbnVsbC5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIFNoZWV0TXVzaWMoYnl0ZVtdIGRhdGEsIHN0cmluZyB0aXRsZSwgTWlkaU9wdGlvbnMgb3B0aW9ucylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIE1pZGlGaWxlIGZpbGUgPSBuZXcgTWlkaUZpbGUoZGF0YSwgdGl0bGUpO1xyXG4gICAgICAgICAgICBpbml0KGZpbGUsIG9wdGlvbnMpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBDcmVhdGUgYSBuZXcgU2hlZXRNdXNpYyBjb250cm9sLlxuICAgICAgICAgKiBNaWRpRmlsZSBpcyB0aGUgcGFyc2VkIG1pZGkgZmlsZSB0byBkaXNwbGF5LlxuICAgICAgICAgKiBTaGVldE11c2ljIE9wdGlvbnMgYXJlIHRoZSBtZW51IG9wdGlvbnMgdGhhdCB3ZXJlIHNlbGVjdGVkLlxuICAgICAgICAgKlxuICAgICAgICAgKiAtIEFwcGx5IGFsbCB0aGUgTWVudSBPcHRpb25zIHRvIHRoZSBNaWRpRmlsZSB0cmFja3MuXG4gICAgICAgICAqIC0gQ2FsY3VsYXRlIHRoZSBrZXkgc2lnbmF0dXJlXG4gICAgICAgICAqIC0gRm9yIGVhY2ggdHJhY2ssIGNyZWF0ZSBhIGxpc3Qgb2YgTXVzaWNTeW1ib2xzIChub3RlcywgcmVzdHMsIGJhcnMsIGV0YylcbiAgICAgICAgICogLSBWZXJ0aWNhbGx5IGFsaWduIHRoZSBtdXNpYyBzeW1ib2xzIGluIGFsbCB0aGUgdHJhY2tzXG4gICAgICAgICAqIC0gUGFydGl0aW9uIHRoZSBtdXNpYyBub3RlcyBpbnRvIGhvcml6b250YWwgc3RhZmZzXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyB2b2lkIGluaXQoTWlkaUZpbGUgZmlsZSwgTWlkaU9wdGlvbnMgb3B0aW9ucylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zID09IG51bGwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSBuZXcgTWlkaU9wdGlvbnMoZmlsZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgem9vbSA9IDEuMGY7XHJcbiAgICAgICAgICAgIGZpbGVuYW1lID0gZmlsZS5GaWxlTmFtZTtcclxuXHJcbiAgICAgICAgICAgIFNldENvbG9ycyhvcHRpb25zLmNvbG9ycywgb3B0aW9ucy5zaGFkZUNvbG9yLCBvcHRpb25zLnNoYWRlMkNvbG9yKTtcclxuICAgICAgICAgICAgcGVuID0gbmV3IFBlbihDb2xvci5CbGFjaywgMSk7XHJcblxyXG4gICAgICAgICAgICBMaXN0PE1pZGlUcmFjaz4gdHJhY2tzID0gZmlsZS5DaGFuZ2VNaWRpTm90ZXMob3B0aW9ucyk7XHJcbiAgICAgICAgICAgIFNldE5vdGVTaXplKG9wdGlvbnMubGFyZ2VOb3RlU2l6ZSk7XHJcbiAgICAgICAgICAgIHNjcm9sbFZlcnQgPSBvcHRpb25zLnNjcm9sbFZlcnQ7XHJcbiAgICAgICAgICAgIHNob3dOb3RlTGV0dGVycyA9IG9wdGlvbnMuc2hvd05vdGVMZXR0ZXJzO1xyXG4gICAgICAgICAgICBUaW1lU2lnbmF0dXJlIHRpbWUgPSBmaWxlLlRpbWU7XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnRpbWUgIT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGltZSA9IG9wdGlvbnMudGltZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5rZXkgPT0gLTEpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1haW5rZXkgPSBHZXRLZXlTaWduYXR1cmUodHJhY2tzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1haW5rZXkgPSBuZXcgS2V5U2lnbmF0dXJlKG9wdGlvbnMua2V5KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbnVtdHJhY2tzID0gdHJhY2tzLkNvdW50O1xyXG5cclxuICAgICAgICAgICAgaW50IGxhc3RTdGFydCA9IGZpbGUuRW5kVGltZSgpICsgb3B0aW9ucy5zaGlmdHRpbWU7XHJcblxyXG4gICAgICAgICAgICAvKiBDcmVhdGUgYWxsIHRoZSBtdXNpYyBzeW1ib2xzIChub3RlcywgcmVzdHMsIHZlcnRpY2FsIGJhcnMsIGFuZFxyXG4gICAgICAgICAgICAgKiBjbGVmIGNoYW5nZXMpLiAgVGhlIHN5bWJvbHMgdmFyaWFibGUgY29udGFpbnMgYSBsaXN0IG9mIG11c2ljIFxyXG4gICAgICAgICAgICAgKiBzeW1ib2xzIGZvciBlYWNoIHRyYWNrLiAgVGhlIGxpc3QgZG9lcyBub3QgaW5jbHVkZSB0aGUgbGVmdC1zaWRlIFxyXG4gICAgICAgICAgICAgKiBDbGVmIGFuZCBrZXkgc2lnbmF0dXJlIHN5bWJvbHMuICBUaG9zZSBjYW4gb25seSBiZSBjYWxjdWxhdGVkIFxyXG4gICAgICAgICAgICAgKiB3aGVuIHdlIGNyZWF0ZSB0aGUgc3RhZmZzLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD5bXSBzeW1ib2xzID0gbmV3IExpc3Q8TXVzaWNTeW1ib2w+W251bXRyYWNrc107XHJcbiAgICAgICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCBudW10cmFja3M7IHRyYWNrbnVtKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIE1pZGlUcmFjayB0cmFjayA9IHRyYWNrc1t0cmFja251bV07XHJcbiAgICAgICAgICAgICAgICBDbGVmTWVhc3VyZXMgY2xlZnMgPSBuZXcgQ2xlZk1lYXN1cmVzKHRyYWNrLk5vdGVzLCB0aW1lLk1lYXN1cmUpO1xyXG4gICAgICAgICAgICAgICAgTGlzdDxDaG9yZFN5bWJvbD4gY2hvcmRzID0gQ3JlYXRlQ2hvcmRzKHRyYWNrLk5vdGVzLCBtYWlua2V5LCB0aW1lLCBjbGVmcyk7XHJcbiAgICAgICAgICAgICAgICBzeW1ib2xzW3RyYWNrbnVtXSA9IENyZWF0ZVN5bWJvbHMoY2hvcmRzLCBjbGVmcywgdGltZSwgbGFzdFN0YXJ0KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgTGlzdDxMeXJpY1N5bWJvbD5bXSBseXJpY3MgPSBudWxsO1xyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5zaG93THlyaWNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBseXJpY3MgPSBHZXRMeXJpY3ModHJhY2tzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLyogVmVydGljYWxseSBhbGlnbiB0aGUgbXVzaWMgc3ltYm9scyAqL1xyXG4gICAgICAgICAgICBTeW1ib2xXaWR0aHMgd2lkdGhzID0gbmV3IFN5bWJvbFdpZHRocyhzeW1ib2xzLCBseXJpY3MpO1xyXG4gICAgICAgICAgICBBbGlnblN5bWJvbHMoc3ltYm9scywgd2lkdGhzLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgICAgIHN0YWZmcyA9IENyZWF0ZVN0YWZmcyhzeW1ib2xzLCBtYWlua2V5LCBvcHRpb25zLCB0aW1lLk1lYXN1cmUpO1xyXG4gICAgICAgICAgICBDcmVhdGVBbGxCZWFtZWRDaG9yZHMoc3ltYm9scywgdGltZSk7XHJcbiAgICAgICAgICAgIGlmIChseXJpY3MgIT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgQWRkTHlyaWNzVG9TdGFmZnMoc3RhZmZzLCBseXJpY3MpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvKiBBZnRlciBtYWtpbmcgY2hvcmQgcGFpcnMsIHRoZSBzdGVtIGRpcmVjdGlvbnMgY2FuIGNoYW5nZSxcclxuICAgICAgICAgICAgICogd2hpY2ggYWZmZWN0cyB0aGUgc3RhZmYgaGVpZ2h0LiAgUmUtY2FsY3VsYXRlIHRoZSBzdGFmZiBoZWlnaHQuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBmb3JlYWNoIChTdGFmZiBzdGFmZiBpbiBzdGFmZnMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN0YWZmLkNhbGN1bGF0ZUhlaWdodCgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBCYWNrQ29sb3IgPSBDb2xvci5XaGl0ZTtcclxuXHJcbiAgICAgICAgICAgIFNldFpvb20oMS4wZik7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIEdldCB0aGUgYmVzdCBrZXkgc2lnbmF0dXJlIGdpdmVuIHRoZSBtaWRpIG5vdGVzIGluIGFsbCB0aGUgdHJhY2tzLiAqL1xyXG4gICAgICAgIHByaXZhdGUgS2V5U2lnbmF0dXJlIEdldEtleVNpZ25hdHVyZShMaXN0PE1pZGlUcmFjaz4gdHJhY2tzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgTGlzdDxpbnQ+IG5vdGVudW1zID0gbmV3IExpc3Q8aW50PigpO1xyXG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrLk5vdGVzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vdGVudW1zLkFkZChub3RlLk51bWJlcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIEtleVNpZ25hdHVyZS5HdWVzcyhub3RlbnVtcyk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIENyZWF0ZSB0aGUgY2hvcmQgc3ltYm9scyBmb3IgYSBzaW5nbGUgdHJhY2suXG4gICAgICAgICAqIEBwYXJhbSBtaWRpbm90ZXMgIFRoZSBNaWRpbm90ZXMgaW4gdGhlIHRyYWNrLlxuICAgICAgICAgKiBAcGFyYW0ga2V5ICAgICAgICBUaGUgS2V5IFNpZ25hdHVyZSwgZm9yIGRldGVybWluaW5nIHNoYXJwcy9mbGF0cy5cbiAgICAgICAgICogQHBhcmFtIHRpbWUgICAgICAgVGhlIFRpbWUgU2lnbmF0dXJlLCBmb3IgZGV0ZXJtaW5pbmcgdGhlIG1lYXN1cmVzLlxuICAgICAgICAgKiBAcGFyYW0gY2xlZnMgICAgICBUaGUgY2xlZnMgdG8gdXNlIGZvciBlYWNoIG1lYXN1cmUuXG4gICAgICAgICAqIEByZXQgQW4gYXJyYXkgb2YgQ2hvcmRTeW1ib2xzXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGVcclxuICAgICAgICBMaXN0PENob3JkU3ltYm9sPiBDcmVhdGVDaG9yZHMoTGlzdDxNaWRpTm90ZT4gbWlkaW5vdGVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBLZXlTaWduYXR1cmUga2V5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUaW1lU2lnbmF0dXJlIHRpbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENsZWZNZWFzdXJlcyBjbGVmcylcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICBpbnQgaSA9IDA7XHJcbiAgICAgICAgICAgIExpc3Q8Q2hvcmRTeW1ib2w+IGNob3JkcyA9IG5ldyBMaXN0PENob3JkU3ltYm9sPigpO1xyXG4gICAgICAgICAgICBMaXN0PE1pZGlOb3RlPiBub3RlZ3JvdXAgPSBuZXcgTGlzdDxNaWRpTm90ZT4oMTIpO1xyXG4gICAgICAgICAgICBpbnQgbGVuID0gbWlkaW5vdGVzLkNvdW50O1xyXG5cclxuICAgICAgICAgICAgd2hpbGUgKGkgPCBsZW4pXHJcbiAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpbnQgc3RhcnR0aW1lID0gbWlkaW5vdGVzW2ldLlN0YXJ0VGltZTtcclxuICAgICAgICAgICAgICAgIENsZWYgY2xlZiA9IGNsZWZzLkdldENsZWYoc3RhcnR0aW1lKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKiBHcm91cCBhbGwgdGhlIG1pZGkgbm90ZXMgd2l0aCB0aGUgc2FtZSBzdGFydCB0aW1lXHJcbiAgICAgICAgICAgICAgICAgKiBpbnRvIHRoZSBub3RlcyBsaXN0LlxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBub3RlZ3JvdXAuQ2xlYXIoKTtcclxuICAgICAgICAgICAgICAgIG5vdGVncm91cC5BZGQobWlkaW5vdGVzW2ldKTtcclxuICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgbGVuICYmIG1pZGlub3Rlc1tpXS5TdGFydFRpbWUgPT0gc3RhcnR0aW1lKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vdGVncm91cC5BZGQobWlkaW5vdGVzW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyogQ3JlYXRlIGEgc2luZ2xlIGNob3JkIGZyb20gdGhlIGdyb3VwIG9mIG1pZGkgbm90ZXMgd2l0aFxyXG4gICAgICAgICAgICAgICAgICogdGhlIHNhbWUgc3RhcnQgdGltZS5cclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgQ2hvcmRTeW1ib2wgY2hvcmQgPSBuZXcgQ2hvcmRTeW1ib2wobm90ZWdyb3VwLCBrZXksIHRpbWUsIGNsZWYsIHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgY2hvcmRzLkFkZChjaG9yZCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBjaG9yZHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogR2l2ZW4gdGhlIGNob3JkIHN5bWJvbHMgZm9yIGEgdHJhY2ssIGNyZWF0ZSBhIG5ldyBzeW1ib2wgbGlzdFxuICAgICAgICAgKiB0aGF0IGNvbnRhaW5zIHRoZSBjaG9yZCBzeW1ib2xzLCB2ZXJ0aWNhbCBiYXJzLCByZXN0cywgYW5kIGNsZWYgY2hhbmdlcy5cbiAgICAgICAgICogUmV0dXJuIGEgbGlzdCBvZiBzeW1ib2xzIChDaG9yZFN5bWJvbCwgQmFyU3ltYm9sLCBSZXN0U3ltYm9sLCBDbGVmU3ltYm9sKVxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIExpc3Q8TXVzaWNTeW1ib2w+XHJcbiAgICAgICAgQ3JlYXRlU3ltYm9scyhMaXN0PENob3JkU3ltYm9sPiBjaG9yZHMsIENsZWZNZWFzdXJlcyBjbGVmcyxcclxuICAgICAgICAgICAgICAgICAgICAgIFRpbWVTaWduYXR1cmUgdGltZSwgaW50IGxhc3RTdGFydClcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzID0gbmV3IExpc3Q8TXVzaWNTeW1ib2w+KCk7XHJcbiAgICAgICAgICAgIHN5bWJvbHMgPSBBZGRCYXJzKGNob3JkcywgdGltZSwgbGFzdFN0YXJ0KTtcclxuICAgICAgICAgICAgc3ltYm9scyA9IEFkZFJlc3RzKHN5bWJvbHMsIHRpbWUpO1xyXG4gICAgICAgICAgICBzeW1ib2xzID0gQWRkQ2xlZkNoYW5nZXMoc3ltYm9scywgY2xlZnMsIHRpbWUpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN5bWJvbHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogQWRkIGluIHRoZSB2ZXJ0aWNhbCBiYXJzIGRlbGltaXRpbmcgbWVhc3VyZXMuIFxuICAgICAgICAgKiAgQWxzbywgYWRkIHRoZSB0aW1lIHNpZ25hdHVyZSBzeW1ib2xzLlxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlXHJcbiAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD4gQWRkQmFycyhMaXN0PENob3JkU3ltYm9sPiBjaG9yZHMsIFRpbWVTaWduYXR1cmUgdGltZSwgaW50IGxhc3RTdGFydClcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzID0gbmV3IExpc3Q8TXVzaWNTeW1ib2w+KCk7XHJcblxyXG4gICAgICAgICAgICBUaW1lU2lnU3ltYm9sIHRpbWVzaWcgPSBuZXcgVGltZVNpZ1N5bWJvbCh0aW1lLk51bWVyYXRvciwgdGltZS5EZW5vbWluYXRvcik7XHJcbiAgICAgICAgICAgIHN5bWJvbHMuQWRkKHRpbWVzaWcpO1xyXG5cclxuICAgICAgICAgICAgLyogVGhlIHN0YXJ0dGltZSBvZiB0aGUgYmVnaW5uaW5nIG9mIHRoZSBtZWFzdXJlICovXHJcbiAgICAgICAgICAgIGludCBtZWFzdXJldGltZSA9IDA7XHJcblxyXG4gICAgICAgICAgICBpbnQgaSA9IDA7XHJcbiAgICAgICAgICAgIHdoaWxlIChpIDwgY2hvcmRzLkNvdW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWVhc3VyZXRpbWUgPD0gY2hvcmRzW2ldLlN0YXJ0VGltZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzeW1ib2xzLkFkZChuZXcgQmFyU3ltYm9sKG1lYXN1cmV0aW1lKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVhc3VyZXRpbWUgKz0gdGltZS5NZWFzdXJlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHN5bWJvbHMuQWRkKGNob3Jkc1tpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvKiBLZWVwIGFkZGluZyBiYXJzIHVudGlsIHRoZSBsYXN0IFN0YXJ0VGltZSAodGhlIGVuZCBvZiB0aGUgc29uZykgKi9cclxuICAgICAgICAgICAgd2hpbGUgKG1lYXN1cmV0aW1lIDwgbGFzdFN0YXJ0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzeW1ib2xzLkFkZChuZXcgQmFyU3ltYm9sKG1lYXN1cmV0aW1lKSk7XHJcbiAgICAgICAgICAgICAgICBtZWFzdXJldGltZSArPSB0aW1lLk1lYXN1cmU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIEFkZCB0aGUgZmluYWwgdmVydGljYWwgYmFyIHRvIHRoZSBsYXN0IG1lYXN1cmUgKi9cclxuICAgICAgICAgICAgc3ltYm9scy5BZGQobmV3IEJhclN5bWJvbChtZWFzdXJldGltZSkpO1xyXG4gICAgICAgICAgICByZXR1cm4gc3ltYm9scztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBBZGQgcmVzdCBzeW1ib2xzIGJldHdlZW4gbm90ZXMuICBBbGwgdGltZXMgYmVsb3cgYXJlIFxuICAgICAgICAgKiBtZWFzdXJlZCBpbiBwdWxzZXMuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGVcclxuICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiBBZGRSZXN0cyhMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzLCBUaW1lU2lnbmF0dXJlIHRpbWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbnQgcHJldnRpbWUgPSAwO1xyXG5cclxuICAgICAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD4gcmVzdWx0ID0gbmV3IExpc3Q8TXVzaWNTeW1ib2w+KHN5bWJvbHMuQ291bnQpO1xyXG5cclxuICAgICAgICAgICAgZm9yZWFjaCAoTXVzaWNTeW1ib2wgc3ltYm9sIGluIHN5bWJvbHMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGludCBzdGFydHRpbWUgPSBzeW1ib2wuU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgUmVzdFN5bWJvbFtdIHJlc3RzID0gR2V0UmVzdHModGltZSwgcHJldnRpbWUsIHN0YXJ0dGltZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzdHMgIT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3JlYWNoIChSZXN0U3ltYm9sIHIgaW4gcmVzdHMpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuQWRkKHIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXN1bHQuQWRkKHN5bWJvbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLyogU2V0IHByZXZ0aW1lIHRvIHRoZSBlbmQgdGltZSBvZiB0aGUgbGFzdCBub3RlL3N5bWJvbC4gKi9cclxuICAgICAgICAgICAgICAgIGlmIChzeW1ib2wgaXMgQ2hvcmRTeW1ib2wpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgQ2hvcmRTeW1ib2wgY2hvcmQgPSAoQ2hvcmRTeW1ib2wpc3ltYm9sO1xyXG4gICAgICAgICAgICAgICAgICAgIHByZXZ0aW1lID0gTWF0aC5NYXgoY2hvcmQuRW5kVGltZSwgcHJldnRpbWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHByZXZ0aW1lID0gTWF0aC5NYXgoc3RhcnR0aW1lLCBwcmV2dGltZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBSZXR1cm4gdGhlIHJlc3Qgc3ltYm9scyBuZWVkZWQgdG8gZmlsbCB0aGUgdGltZSBpbnRlcnZhbCBiZXR3ZWVuXG4gICAgICAgICAqIHN0YXJ0IGFuZCBlbmQuICBJZiBubyByZXN0cyBhcmUgbmVlZGVkLCByZXR1cm4gbmlsLlxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlXHJcbiAgICAgICAgUmVzdFN5bWJvbFtdIEdldFJlc3RzKFRpbWVTaWduYXR1cmUgdGltZSwgaW50IHN0YXJ0LCBpbnQgZW5kKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgUmVzdFN5bWJvbFtdIHJlc3VsdDtcclxuICAgICAgICAgICAgUmVzdFN5bWJvbCByMSwgcjI7XHJcblxyXG4gICAgICAgICAgICBpZiAoZW5kIC0gc3RhcnQgPCAwKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgICAgICBOb3RlRHVyYXRpb24gZHVyID0gdGltZS5HZXROb3RlRHVyYXRpb24oZW5kIC0gc3RhcnQpO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGR1cilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uV2hvbGU6XHJcbiAgICAgICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5IYWxmOlxyXG4gICAgICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uUXVhcnRlcjpcclxuICAgICAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkVpZ2h0aDpcclxuICAgICAgICAgICAgICAgICAgICByMSA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0LCBkdXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBSZXN0U3ltYm9sW10geyByMSB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uRG90dGVkSGFsZjpcclxuICAgICAgICAgICAgICAgICAgICByMSA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0LCBOb3RlRHVyYXRpb24uSGFsZik7XHJcbiAgICAgICAgICAgICAgICAgICAgcjIgPSBuZXcgUmVzdFN5bWJvbChzdGFydCArIHRpbWUuUXVhcnRlciAqIDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOb3RlRHVyYXRpb24uUXVhcnRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbmV3IFJlc3RTeW1ib2xbXSB7IHIxLCByMiB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uRG90dGVkUXVhcnRlcjpcclxuICAgICAgICAgICAgICAgICAgICByMSA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0LCBOb3RlRHVyYXRpb24uUXVhcnRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgcjIgPSBuZXcgUmVzdFN5bWJvbChzdGFydCArIHRpbWUuUXVhcnRlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5vdGVEdXJhdGlvbi5FaWdodGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBSZXN0U3ltYm9sW10geyByMSwgcjIgfTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aDpcclxuICAgICAgICAgICAgICAgICAgICByMSA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0LCBOb3RlRHVyYXRpb24uRWlnaHRoKTtcclxuICAgICAgICAgICAgICAgICAgICByMiA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0ICsgdGltZS5RdWFydGVyIC8gMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5vdGVEdXJhdGlvbi5TaXh0ZWVudGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBSZXN0U3ltYm9sW10geyByMSwgcjIgfTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBUaGUgY3VycmVudCBjbGVmIGlzIGFsd2F5cyBzaG93biBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBzdGFmZiwgb25cbiAgICAgICAgICogdGhlIGxlZnQgc2lkZS4gIEhvd2V2ZXIsIHRoZSBjbGVmIGNhbiBhbHNvIGNoYW5nZSBmcm9tIG1lYXN1cmUgdG8gXG4gICAgICAgICAqIG1lYXN1cmUuIFdoZW4gaXQgZG9lcywgYSBDbGVmIHN5bWJvbCBtdXN0IGJlIHNob3duIHRvIGluZGljYXRlIHRoZSBcbiAgICAgICAgICogY2hhbmdlIGluIGNsZWYuICBUaGlzIGZ1bmN0aW9uIGFkZHMgdGhlc2UgQ2xlZiBjaGFuZ2Ugc3ltYm9scy5cbiAgICAgICAgICogVGhpcyBmdW5jdGlvbiBkb2VzIG5vdCBhZGQgdGhlIG1haW4gQ2xlZiBTeW1ib2wgdGhhdCBiZWdpbnMgZWFjaFxuICAgICAgICAgKiBzdGFmZi4gIFRoYXQgaXMgZG9uZSBpbiB0aGUgU3RhZmYoKSBjb250cnVjdG9yLlxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlXHJcbiAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD4gQWRkQ2xlZkNoYW5nZXMoTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDbGVmTWVhc3VyZXMgY2xlZnMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVGltZVNpZ25hdHVyZSB0aW1lKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIExpc3Q8TXVzaWNTeW1ib2w+IHJlc3VsdCA9IG5ldyBMaXN0PE11c2ljU3ltYm9sPihzeW1ib2xzLkNvdW50KTtcclxuICAgICAgICAgICAgQ2xlZiBwcmV2Y2xlZiA9IGNsZWZzLkdldENsZWYoMCk7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHN5bWJvbCBpbiBzeW1ib2xzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvKiBBIEJhclN5bWJvbCBpbmRpY2F0ZXMgYSBuZXcgbWVhc3VyZSAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHN5bWJvbCBpcyBCYXJTeW1ib2wpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgQ2xlZiBjbGVmID0gY2xlZnMuR2V0Q2xlZihzeW1ib2wuU3RhcnRUaW1lKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2xlZiAhPSBwcmV2Y2xlZilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5BZGQobmV3IENsZWZTeW1ib2woY2xlZiwgc3ltYm9sLlN0YXJ0VGltZSAtIDEsIHRydWUpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldmNsZWYgPSBjbGVmO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmVzdWx0LkFkZChzeW1ib2wpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIE5vdGVzIHdpdGggdGhlIHNhbWUgc3RhcnQgdGltZXMgaW4gZGlmZmVyZW50IHN0YWZmcyBzaG91bGQgYmVcbiAgICAgICAgICogdmVydGljYWxseSBhbGlnbmVkLiAgVGhlIFN5bWJvbFdpZHRocyBjbGFzcyBpcyB1c2VkIHRvIGhlbHAgXG4gICAgICAgICAqIHZlcnRpY2FsbHkgYWxpZ24gc3ltYm9scy5cbiAgICAgICAgICpcbiAgICAgICAgICogRmlyc3QsIGVhY2ggdHJhY2sgc2hvdWxkIGhhdmUgYSBzeW1ib2wgZm9yIGV2ZXJ5IHN0YXJ0dGltZSB0aGF0XG4gICAgICAgICAqIGFwcGVhcnMgaW4gdGhlIE1pZGkgRmlsZS4gIElmIGEgdHJhY2sgZG9lc24ndCBoYXZlIGEgc3ltYm9sIGZvciBhXG4gICAgICAgICAqIHBhcnRpY3VsYXIgc3RhcnR0aW1lLCB0aGVuIGFkZCBhIFwiYmxhbmtcIiBzeW1ib2wgZm9yIHRoYXQgdGltZS5cbiAgICAgICAgICpcbiAgICAgICAgICogTmV4dCwgbWFrZSBzdXJlIHRoZSBzeW1ib2xzIGZvciBlYWNoIHN0YXJ0IHRpbWUgYWxsIGhhdmUgdGhlIHNhbWVcbiAgICAgICAgICogd2lkdGgsIGFjcm9zcyBhbGwgdHJhY2tzLiAgVGhlIFN5bWJvbFdpZHRocyBjbGFzcyBzdG9yZXNcbiAgICAgICAgICogLSBUaGUgc3ltYm9sIHdpZHRoIGZvciBlYWNoIHN0YXJ0dGltZSwgZm9yIGVhY2ggdHJhY2tcbiAgICAgICAgICogLSBUaGUgbWF4aW11bSBzeW1ib2wgd2lkdGggZm9yIGEgZ2l2ZW4gc3RhcnR0aW1lLCBhY3Jvc3MgYWxsIHRyYWNrcy5cbiAgICAgICAgICpcbiAgICAgICAgICogVGhlIG1ldGhvZCBTeW1ib2xXaWR0aHMuR2V0RXh0cmFXaWR0aCgpIHJldHVybnMgdGhlIGV4dHJhIHdpZHRoXG4gICAgICAgICAqIG5lZWRlZCBmb3IgYSB0cmFjayB0byBtYXRjaCB0aGUgbWF4aW11bSBzeW1ib2wgd2lkdGggZm9yIGEgZ2l2ZW5cbiAgICAgICAgICogc3RhcnR0aW1lLlxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlXHJcbiAgICAgICAgdm9pZCBBbGlnblN5bWJvbHMoTGlzdDxNdXNpY1N5bWJvbD5bXSBhbGxzeW1ib2xzLCBTeW1ib2xXaWR0aHMgd2lkdGhzLCBNaWRpT3B0aW9ucyBvcHRpb25zKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIHdlIHNob3cgbWVhc3VyZSBudW1iZXJzLCBpbmNyZWFzZSBiYXIgc3ltYm9sIHdpZHRoXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnNob3dNZWFzdXJlcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgdHJhY2sgPSAwOyB0cmFjayA8IGFsbHN5bWJvbHMuTGVuZ3RoOyB0cmFjaysrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIExpc3Q8TXVzaWNTeW1ib2w+IHN5bWJvbHMgPSBhbGxzeW1ib2xzW3RyYWNrXTtcclxuICAgICAgICAgICAgICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBzeW0gaW4gc3ltYm9scylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzeW0gaXMgQmFyU3ltYm9sKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzeW0uV2lkdGggKz0gU2hlZXRNdXNpYy5Ob3RlV2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZvciAoaW50IHRyYWNrID0gMDsgdHJhY2sgPCBhbGxzeW1ib2xzLkxlbmd0aDsgdHJhY2srKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scyA9IGFsbHN5bWJvbHNbdHJhY2tdO1xyXG4gICAgICAgICAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD4gcmVzdWx0ID0gbmV3IExpc3Q8TXVzaWNTeW1ib2w+KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaW50IGkgPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qIElmIGEgdHJhY2sgZG9lc24ndCBoYXZlIGEgc3ltYm9sIGZvciBhIHN0YXJ0dGltZSxcclxuICAgICAgICAgICAgICAgICAqIGFkZCBhIGJsYW5rIHN5bWJvbC5cclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoaW50IHN0YXJ0IGluIHdpZHRocy5TdGFydFRpbWVzKVxyXG4gICAgICAgICAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvKiBCYXJTeW1ib2xzIGFyZSBub3QgaW5jbHVkZWQgaW4gdGhlIFN5bWJvbFdpZHRocyBjYWxjdWxhdGlvbnMgKi9cclxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaSA8IHN5bWJvbHMuQ291bnQgJiYgKHN5bWJvbHNbaV0gaXMgQmFyU3ltYm9sKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzeW1ib2xzW2ldLlN0YXJ0VGltZSA8PSBzdGFydClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5BZGQoc3ltYm9sc1tpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpIDwgc3ltYm9scy5Db3VudCAmJiBzeW1ib2xzW2ldLlN0YXJ0VGltZSA9PSBzdGFydClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaSA8IHN5bWJvbHMuQ291bnQgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN5bWJvbHNbaV0uU3RhcnRUaW1lID09IHN0YXJ0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LkFkZChzeW1ib2xzW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuQWRkKG5ldyBCbGFua1N5bWJvbChzdGFydCwgMCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKiBGb3IgZWFjaCBzdGFydHRpbWUsIGluY3JlYXNlIHRoZSBzeW1ib2wgd2lkdGggYnlcclxuICAgICAgICAgICAgICAgICAqIFN5bWJvbFdpZHRocy5HZXRFeHRyYVdpZHRoKCkuXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGkgPSAwO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGkgPCByZXN1bHQuQ291bnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdFtpXSBpcyBCYXJTeW1ib2wpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpbnQgc3RhcnQgPSByZXN1bHRbaV0uU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBleHRyYSA9IHdpZHRocy5HZXRFeHRyYVdpZHRoKHRyYWNrLCBzdGFydCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2ldLldpZHRoICs9IGV4dHJhO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvKiBTa2lwIGFsbCByZW1haW5pbmcgc3ltYm9scyB3aXRoIHRoZSBzYW1lIHN0YXJ0dGltZS4gKi9cclxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaSA8IHJlc3VsdC5Db3VudCAmJiByZXN1bHRbaV0uU3RhcnRUaW1lID09IHN0YXJ0KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGFsbHN5bWJvbHNbdHJhY2tdID0gcmVzdWx0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBib29sIElzQ2hvcmQoTXVzaWNTeW1ib2wgc3ltYm9sKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN5bWJvbCBpcyBDaG9yZFN5bWJvbDtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogRmluZCAyLCAzLCA0LCBvciA2IGNob3JkIHN5bWJvbHMgdGhhdCBvY2N1ciBjb25zZWN1dGl2ZWx5ICh3aXRob3V0IGFueVxuICAgICAgICAgKiAgcmVzdHMgb3IgYmFycyBpbiBiZXR3ZWVuKS4gIFRoZXJlIGNhbiBiZSBCbGFua1N5bWJvbHMgaW4gYmV0d2Vlbi5cbiAgICAgICAgICpcbiAgICAgICAgICogIFRoZSBzdGFydEluZGV4IGlzIHRoZSBpbmRleCBpbiB0aGUgc3ltYm9scyB0byBzdGFydCBsb29raW5nIGZyb20uXG4gICAgICAgICAqXG4gICAgICAgICAqICBTdG9yZSB0aGUgaW5kZXhlcyBvZiB0aGUgY29uc2VjdXRpdmUgY2hvcmRzIGluIGNob3JkSW5kZXhlcy5cbiAgICAgICAgICogIFN0b3JlIHRoZSBob3Jpem9udGFsIGRpc3RhbmNlIChwaXhlbHMpIGJldHdlZW4gdGhlIGZpcnN0IGFuZCBsYXN0IGNob3JkLlxuICAgICAgICAgKiAgSWYgd2UgZmFpbGVkIHRvIGZpbmQgY29uc2VjdXRpdmUgY2hvcmRzLCByZXR1cm4gZmFsc2UuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGJvb2xcclxuICAgICAgICBGaW5kQ29uc2VjdXRpdmVDaG9yZHMoTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scywgVGltZVNpZ25hdHVyZSB0aW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnQgc3RhcnRJbmRleCwgaW50W10gY2hvcmRJbmRleGVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWYgaW50IGhvcml6RGlzdGFuY2UpXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgaW50IGkgPSBzdGFydEluZGV4O1xyXG4gICAgICAgICAgICBpbnQgbnVtQ2hvcmRzID0gY2hvcmRJbmRleGVzLkxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlICh0cnVlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBob3JpekRpc3RhbmNlID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICAvKiBGaW5kIHRoZSBzdGFydGluZyBjaG9yZCAqL1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGkgPCBzeW1ib2xzLkNvdW50IC0gbnVtQ2hvcmRzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzeW1ib2xzW2ldIGlzIENob3JkU3ltYm9sKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgQ2hvcmRTeW1ib2wgYyA9IChDaG9yZFN5bWJvbClzeW1ib2xzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYy5TdGVtICE9IG51bGwpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChpID49IHN5bWJvbHMuQ291bnQgLSBudW1DaG9yZHMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hvcmRJbmRleGVzWzBdID0gLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2hvcmRJbmRleGVzWzBdID0gaTtcclxuICAgICAgICAgICAgICAgIGJvb2wgZm91bmRDaG9yZHMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgY2hvcmRJbmRleCA9IDE7IGNob3JkSW5kZXggPCBudW1DaG9yZHM7IGNob3JkSW5kZXgrKylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IHJlbWFpbmluZyA9IG51bUNob3JkcyAtIDEgLSBjaG9yZEluZGV4O1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlICgoaSA8IHN5bWJvbHMuQ291bnQgLSByZW1haW5pbmcpICYmIChzeW1ib2xzW2ldIGlzIEJsYW5rU3ltYm9sKSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvcml6RGlzdGFuY2UgKz0gc3ltYm9sc1tpXS5XaWR0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaSA+PSBzeW1ib2xzLkNvdW50IC0gcmVtYWluaW5nKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIShzeW1ib2xzW2ldIGlzIENob3JkU3ltYm9sKSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kQ2hvcmRzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjaG9yZEluZGV4ZXNbY2hvcmRJbmRleF0gPSBpO1xyXG4gICAgICAgICAgICAgICAgICAgIGhvcml6RGlzdGFuY2UgKz0gc3ltYm9sc1tpXS5XaWR0aDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChmb3VuZENob3JkcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKiBFbHNlLCBzdGFydCBzZWFyY2hpbmcgYWdhaW4gZnJvbSBpbmRleCBpICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogQ29ubmVjdCBjaG9yZHMgb2YgdGhlIHNhbWUgZHVyYXRpb24gd2l0aCBhIGhvcml6b250YWwgYmVhbS5cbiAgICAgICAgICogIG51bUNob3JkcyBpcyB0aGUgbnVtYmVyIG9mIGNob3JkcyBwZXIgYmVhbSAoMiwgMywgNCwgb3IgNikuXG4gICAgICAgICAqICBpZiBzdGFydEJlYXQgaXMgdHJ1ZSwgdGhlIGZpcnN0IGNob3JkIG11c3Qgc3RhcnQgb24gYSBxdWFydGVyIG5vdGUgYmVhdC5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZFxyXG4gICAgICAgIENyZWF0ZUJlYW1lZENob3JkcyhMaXN0PE11c2ljU3ltYm9sPltdIGFsbHN5bWJvbHMsIFRpbWVTaWduYXR1cmUgdGltZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50IG51bUNob3JkcywgYm9vbCBzdGFydEJlYXQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbnRbXSBjaG9yZEluZGV4ZXMgPSBuZXcgaW50W251bUNob3Jkc107XHJcbiAgICAgICAgICAgIENob3JkU3ltYm9sW10gY2hvcmRzID0gbmV3IENob3JkU3ltYm9sW251bUNob3Jkc107XHJcblxyXG4gICAgICAgICAgICBmb3JlYWNoIChMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzIGluIGFsbHN5bWJvbHMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGludCBzdGFydEluZGV4ID0gMDtcclxuICAgICAgICAgICAgICAgIHdoaWxlICh0cnVlKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBob3JpekRpc3RhbmNlID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBib29sIGZvdW5kID0gRmluZENvbnNlY3V0aXZlQ2hvcmRzKHN5bWJvbHMsIHRpbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydEluZGV4LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hvcmRJbmRleGVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmIGhvcml6RGlzdGFuY2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghZm91bmQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBudW1DaG9yZHM7IGkrKylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNob3Jkc1tpXSA9IChDaG9yZFN5bWJvbClzeW1ib2xzW2Nob3JkSW5kZXhlc1tpXV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoQ2hvcmRTeW1ib2wuQ2FuQ3JlYXRlQmVhbShjaG9yZHMsIHRpbWUsIHN0YXJ0QmVhdCkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBDaG9yZFN5bWJvbC5DcmVhdGVCZWFtKGNob3JkcywgaG9yaXpEaXN0YW5jZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0SW5kZXggPSBjaG9yZEluZGV4ZXNbbnVtQ2hvcmRzIC0gMV0gKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydEluZGV4ID0gY2hvcmRJbmRleGVzWzBdICsgMTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8qIFdoYXQgaXMgdGhlIHZhbHVlIG9mIHN0YXJ0SW5kZXggaGVyZT9cclxuICAgICAgICAgICAgICAgICAgICAgKiBJZiB3ZSBjcmVhdGVkIGEgYmVhbSwgd2Ugc3RhcnQgYWZ0ZXIgdGhlIGxhc3QgY2hvcmQuXHJcbiAgICAgICAgICAgICAgICAgICAgICogSWYgd2UgZmFpbGVkIHRvIGNyZWF0ZSBhIGJlYW0sIHdlIHN0YXJ0IGFmdGVyIHRoZSBmaXJzdCBjaG9yZC5cclxuICAgICAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBDb25uZWN0IGNob3JkcyBvZiB0aGUgc2FtZSBkdXJhdGlvbiB3aXRoIGEgaG9yaXpvbnRhbCBiZWFtLlxuICAgICAgICAgKlxuICAgICAgICAgKiAgV2UgY3JlYXRlIGJlYW1zIGluIHRoZSBmb2xsb3dpbmcgb3JkZXI6XG4gICAgICAgICAqICAtIDYgY29ubmVjdGVkIDh0aCBub3RlIGNob3JkcywgaW4gMy80LCA2LzgsIG9yIDYvNCB0aW1lXG4gICAgICAgICAqICAtIFRyaXBsZXRzIHRoYXQgc3RhcnQgb24gcXVhcnRlciBub3RlIGJlYXRzXG4gICAgICAgICAqICAtIDMgY29ubmVjdGVkIGNob3JkcyB0aGF0IHN0YXJ0IG9uIHF1YXJ0ZXIgbm90ZSBiZWF0cyAoMTIvOCB0aW1lIG9ubHkpXG4gICAgICAgICAqICAtIDQgY29ubmVjdGVkIGNob3JkcyB0aGF0IHN0YXJ0IG9uIHF1YXJ0ZXIgbm90ZSBiZWF0cyAoNC80IG9yIDIvNCB0aW1lIG9ubHkpXG4gICAgICAgICAqICAtIDIgY29ubmVjdGVkIGNob3JkcyB0aGF0IHN0YXJ0IG9uIHF1YXJ0ZXIgbm90ZSBiZWF0c1xuICAgICAgICAgKiAgLSAyIGNvbm5lY3RlZCBjaG9yZHMgdGhhdCBzdGFydCBvbiBhbnkgYmVhdFxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkXHJcbiAgICAgICAgQ3JlYXRlQWxsQmVhbWVkQ2hvcmRzKExpc3Q8TXVzaWNTeW1ib2w+W10gYWxsc3ltYm9scywgVGltZVNpZ25hdHVyZSB0aW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCh0aW1lLk51bWVyYXRvciA9PSAzICYmIHRpbWUuRGVub21pbmF0b3IgPT0gNCkgfHxcclxuICAgICAgICAgICAgICAgICh0aW1lLk51bWVyYXRvciA9PSA2ICYmIHRpbWUuRGVub21pbmF0b3IgPT0gOCkgfHxcclxuICAgICAgICAgICAgICAgICh0aW1lLk51bWVyYXRvciA9PSA2ICYmIHRpbWUuRGVub21pbmF0b3IgPT0gNCkpXHJcbiAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICBDcmVhdGVCZWFtZWRDaG9yZHMoYWxsc3ltYm9scywgdGltZSwgNiwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgQ3JlYXRlQmVhbWVkQ2hvcmRzKGFsbHN5bWJvbHMsIHRpbWUsIDMsIHRydWUpO1xyXG4gICAgICAgICAgICBDcmVhdGVCZWFtZWRDaG9yZHMoYWxsc3ltYm9scywgdGltZSwgNCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIENyZWF0ZUJlYW1lZENob3JkcyhhbGxzeW1ib2xzLCB0aW1lLCAyLCB0cnVlKTtcclxuICAgICAgICAgICAgQ3JlYXRlQmVhbWVkQ2hvcmRzKGFsbHN5bWJvbHMsIHRpbWUsIDIsIGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBHZXQgdGhlIHdpZHRoIChpbiBwaXhlbHMpIG5lZWRlZCB0byBkaXNwbGF5IHRoZSBrZXkgc2lnbmF0dXJlICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBpbnRcclxuICAgICAgICBLZXlTaWduYXR1cmVXaWR0aChLZXlTaWduYXR1cmUga2V5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQ2xlZlN5bWJvbCBjbGVmc3ltID0gbmV3IENsZWZTeW1ib2woQ2xlZi5UcmVibGUsIDAsIGZhbHNlKTtcclxuICAgICAgICAgICAgaW50IHJlc3VsdCA9IGNsZWZzeW0uTWluV2lkdGg7XHJcbiAgICAgICAgICAgIEFjY2lkU3ltYm9sW10ga2V5cyA9IGtleS5HZXRTeW1ib2xzKENsZWYuVHJlYmxlKTtcclxuICAgICAgICAgICAgZm9yZWFjaCAoQWNjaWRTeW1ib2wgc3ltYm9sIGluIGtleXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBzeW1ib2wuTWluV2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdCArIFNoZWV0TXVzaWMuTGVmdE1hcmdpbiArIDU7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIEdpdmVuIE11c2ljU3ltYm9scyBmb3IgYSB0cmFjaywgY3JlYXRlIHRoZSBzdGFmZnMgZm9yIHRoYXQgdHJhY2suXG4gICAgICAgICAqICBFYWNoIFN0YWZmIGhhcyBhIG1heG1pbXVtIHdpZHRoIG9mIFBhZ2VXaWR0aCAoODAwIHBpeGVscykuXG4gICAgICAgICAqICBBbHNvLCBtZWFzdXJlcyBzaG91bGQgbm90IHNwYW4gbXVsdGlwbGUgU3RhZmZzLlxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIExpc3Q8U3RhZmY+XHJcbiAgICAgICAgQ3JlYXRlU3RhZmZzRm9yVHJhY2soTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scywgaW50IG1lYXN1cmVsZW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgS2V5U2lnbmF0dXJlIGtleSwgTWlkaU9wdGlvbnMgb3B0aW9ucyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnQgdHJhY2ssIGludCB0b3RhbHRyYWNrcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGludCBrZXlzaWdXaWR0aCA9IEtleVNpZ25hdHVyZVdpZHRoKGtleSk7XHJcbiAgICAgICAgICAgIGludCBzdGFydGluZGV4ID0gMDtcclxuICAgICAgICAgICAgTGlzdDxTdGFmZj4gdGhlc3RhZmZzID0gbmV3IExpc3Q8U3RhZmY+KHN5bWJvbHMuQ291bnQgLyA1MCk7XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAoc3RhcnRpbmRleCA8IHN5bWJvbHMuQ291bnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIC8qIHN0YXJ0aW5kZXggaXMgdGhlIGluZGV4IG9mIHRoZSBmaXJzdCBzeW1ib2wgaW4gdGhlIHN0YWZmLlxyXG4gICAgICAgICAgICAgICAgICogZW5kaW5kZXggaXMgdGhlIGluZGV4IG9mIHRoZSBsYXN0IHN5bWJvbCBpbiB0aGUgc3RhZmYuXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGludCBlbmRpbmRleCA9IHN0YXJ0aW5kZXg7XHJcbiAgICAgICAgICAgICAgICBpbnQgd2lkdGggPSBrZXlzaWdXaWR0aDtcclxuICAgICAgICAgICAgICAgIGludCBtYXh3aWR0aDtcclxuXHJcbiAgICAgICAgICAgICAgICAvKiBJZiB3ZSdyZSBzY3JvbGxpbmcgdmVydGljYWxseSwgdGhlIG1heGltdW0gd2lkdGggaXMgUGFnZVdpZHRoLiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHNjcm9sbFZlcnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF4d2lkdGggPSBTaGVldE11c2ljLlBhZ2VXaWR0aDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXh3aWR0aCA9IDIwMDAwMDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGVuZGluZGV4IDwgc3ltYm9scy5Db3VudCAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgIHdpZHRoICsgc3ltYm9sc1tlbmRpbmRleF0uV2lkdGggPCBtYXh3aWR0aClcclxuICAgICAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggKz0gc3ltYm9sc1tlbmRpbmRleF0uV2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5kaW5kZXgrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVuZGluZGV4LS07XHJcblxyXG4gICAgICAgICAgICAgICAgLyogVGhlcmUncyAzIHBvc3NpYmlsaXRpZXMgYXQgdGhpcyBwb2ludDpcclxuICAgICAgICAgICAgICAgICAqIDEuIFdlIGhhdmUgYWxsIHRoZSBzeW1ib2xzIGluIHRoZSB0cmFjay5cclxuICAgICAgICAgICAgICAgICAqICAgIFRoZSBlbmRpbmRleCBzdGF5cyB0aGUgc2FtZS5cclxuICAgICAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAgICAgKiAyLiBXZSBoYXZlIHN5bWJvbHMgZm9yIGxlc3MgdGhhbiBvbmUgbWVhc3VyZS5cclxuICAgICAgICAgICAgICAgICAqICAgIFRoZSBlbmRpbmRleCBzdGF5cyB0aGUgc2FtZS5cclxuICAgICAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAgICAgKiAzLiBXZSBoYXZlIHN5bWJvbHMgZm9yIDEgb3IgbW9yZSBtZWFzdXJlcy5cclxuICAgICAgICAgICAgICAgICAqICAgIFNpbmNlIG1lYXN1cmVzIGNhbm5vdCBzcGFuIG11bHRpcGxlIHN0YWZmcywgd2UgbXVzdFxyXG4gICAgICAgICAgICAgICAgICogICAgbWFrZSBzdXJlIGVuZGluZGV4IGRvZXMgbm90IG9jY3VyIGluIHRoZSBtaWRkbGUgb2YgYVxyXG4gICAgICAgICAgICAgICAgICogICAgbWVhc3VyZS4gIFdlIGNvdW50IGJhY2t3YXJkcyB1bnRpbCB3ZSBjb21lIHRvIHRoZSBlbmRcclxuICAgICAgICAgICAgICAgICAqICAgIG9mIGEgbWVhc3VyZS5cclxuICAgICAgICAgICAgICAgICAqL1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChlbmRpbmRleCA9PSBzeW1ib2xzLkNvdW50IC0gMSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBlbmRpbmRleCBzdGF5cyB0aGUgc2FtZSAqL1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc3ltYm9sc1tzdGFydGluZGV4XS5TdGFydFRpbWUgLyBtZWFzdXJlbGVuID09XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBzeW1ib2xzW2VuZGluZGV4XS5TdGFydFRpbWUgLyBtZWFzdXJlbGVuKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGVuZGluZGV4IHN0YXlzIHRoZSBzYW1lICovXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IGVuZG1lYXN1cmUgPSBzeW1ib2xzW2VuZGluZGV4ICsgMV0uU3RhcnRUaW1lIC8gbWVhc3VyZWxlbjtcclxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoc3ltYm9sc1tlbmRpbmRleF0uU3RhcnRUaW1lIC8gbWVhc3VyZWxlbiA9PVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBlbmRtZWFzdXJlKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kaW5kZXgtLTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpbnQgcmFuZ2UgPSBlbmRpbmRleCArIDEgLSBzdGFydGluZGV4O1xyXG4gICAgICAgICAgICAgICAgaWYgKHNjcm9sbFZlcnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSBTaGVldE11c2ljLlBhZ2VXaWR0aDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFN0YWZmIHN0YWZmID0gbmV3IFN0YWZmKHN5bWJvbHMuR2V0UmFuZ2Uoc3RhcnRpbmRleCwgcmFuZ2UpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5LCBvcHRpb25zLCB0cmFjaywgdG90YWx0cmFja3MpO1xyXG4gICAgICAgICAgICAgICAgdGhlc3RhZmZzLkFkZChzdGFmZik7XHJcbiAgICAgICAgICAgICAgICBzdGFydGluZGV4ID0gZW5kaW5kZXggKyAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGVzdGFmZnM7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIEdpdmVuIGFsbCB0aGUgTXVzaWNTeW1ib2xzIGZvciBldmVyeSB0cmFjaywgY3JlYXRlIHRoZSBzdGFmZnNcbiAgICAgICAgICogZm9yIHRoZSBzaGVldCBtdXNpYy4gIFRoZXJlIGFyZSB0d28gcGFydHMgdG8gdGhpczpcbiAgICAgICAgICpcbiAgICAgICAgICogLSBHZXQgdGhlIGxpc3Qgb2Ygc3RhZmZzIGZvciBlYWNoIHRyYWNrLlxuICAgICAgICAgKiAgIFRoZSBzdGFmZnMgd2lsbCBiZSBzdG9yZWQgaW4gdHJhY2tzdGFmZnMgYXM6XG4gICAgICAgICAqXG4gICAgICAgICAqICAgdHJhY2tzdGFmZnNbMF0gPSB7IFN0YWZmMCwgU3RhZmYxLCBTdGFmZjIsIC4uLiB9IGZvciB0cmFjayAwXG4gICAgICAgICAqICAgdHJhY2tzdGFmZnNbMV0gPSB7IFN0YWZmMCwgU3RhZmYxLCBTdGFmZjIsIC4uLiB9IGZvciB0cmFjayAxXG4gICAgICAgICAqICAgdHJhY2tzdGFmZnNbMl0gPSB7IFN0YWZmMCwgU3RhZmYxLCBTdGFmZjIsIC4uLiB9IGZvciB0cmFjayAyXG4gICAgICAgICAqXG4gICAgICAgICAqIC0gU3RvcmUgdGhlIFN0YWZmcyBpbiB0aGUgc3RhZmZzIGxpc3QsIGJ1dCBpbnRlcmxlYXZlIHRoZVxuICAgICAgICAgKiAgIHRyYWNrcyBhcyBmb2xsb3dzOlxuICAgICAgICAgKlxuICAgICAgICAgKiAgIHN0YWZmcyA9IHsgU3RhZmYwIGZvciB0cmFjayAwLCBTdGFmZjAgZm9yIHRyYWNrMSwgU3RhZmYwIGZvciB0cmFjazIsXG4gICAgICAgICAqICAgICAgICAgICAgICBTdGFmZjEgZm9yIHRyYWNrIDAsIFN0YWZmMSBmb3IgdHJhY2sxLCBTdGFmZjEgZm9yIHRyYWNrMixcbiAgICAgICAgICogICAgICAgICAgICAgIFN0YWZmMiBmb3IgdHJhY2sgMCwgU3RhZmYyIGZvciB0cmFjazEsIFN0YWZmMiBmb3IgdHJhY2syLFxuICAgICAgICAgKiAgICAgICAgICAgICAgLi4uIH0gXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgTGlzdDxTdGFmZj5cclxuICAgICAgICBDcmVhdGVTdGFmZnMoTGlzdDxNdXNpY1N5bWJvbD5bXSBhbGxzeW1ib2xzLCBLZXlTaWduYXR1cmUga2V5LFxyXG4gICAgICAgICAgICAgICAgICAgICBNaWRpT3B0aW9ucyBvcHRpb25zLCBpbnQgbWVhc3VyZWxlbilcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICBMaXN0PFN0YWZmPltdIHRyYWNrc3RhZmZzID0gbmV3IExpc3Q8U3RhZmY+W2FsbHN5bWJvbHMuTGVuZ3RoXTtcclxuICAgICAgICAgICAgaW50IHRvdGFsdHJhY2tzID0gdHJhY2tzdGFmZnMuTGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2sgPSAwOyB0cmFjayA8IHRvdGFsdHJhY2tzOyB0cmFjaysrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzID0gYWxsc3ltYm9sc1t0cmFja107XHJcbiAgICAgICAgICAgICAgICB0cmFja3N0YWZmc1t0cmFja10gPSBDcmVhdGVTdGFmZnNGb3JUcmFjayhzeW1ib2xzLCBtZWFzdXJlbGVuLCBrZXksIG9wdGlvbnMsIHRyYWNrLCB0b3RhbHRyYWNrcyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIFVwZGF0ZSB0aGUgRW5kVGltZSBvZiBlYWNoIFN0YWZmLiBFbmRUaW1lIGlzIHVzZWQgZm9yIHBsYXliYWNrICovXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKExpc3Q8U3RhZmY+IGxpc3QgaW4gdHJhY2tzdGFmZnMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgbGlzdC5Db3VudCAtIDE7IGkrKylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0W2ldLkVuZFRpbWUgPSBsaXN0W2kgKyAxXS5TdGFydFRpbWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIEludGVybGVhdmUgdGhlIHN0YWZmcyBvZiBlYWNoIHRyYWNrIGludG8gdGhlIHJlc3VsdCBhcnJheS4gKi9cclxuICAgICAgICAgICAgaW50IG1heHN0YWZmcyA9IDA7XHJcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgdHJhY2tzdGFmZnMuTGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChtYXhzdGFmZnMgPCB0cmFja3N0YWZmc1tpXS5Db3VudClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXhzdGFmZnMgPSB0cmFja3N0YWZmc1tpXS5Db3VudDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBMaXN0PFN0YWZmPiByZXN1bHQgPSBuZXcgTGlzdDxTdGFmZj4obWF4c3RhZmZzICogdHJhY2tzdGFmZnMuTGVuZ3RoKTtcclxuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBtYXhzdGFmZnM7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTGlzdDxTdGFmZj4gbGlzdCBpbiB0cmFja3N0YWZmcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaSA8IGxpc3QuQ291bnQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuQWRkKGxpc3RbaV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIEdldCB0aGUgbHlyaWNzIGZvciBlYWNoIHRyYWNrICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgTGlzdDxMeXJpY1N5bWJvbD5bXVxyXG4gICAgICAgIEdldEx5cmljcyhMaXN0PE1pZGlUcmFjaz4gdHJhY2tzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgYm9vbCBoYXNMeXJpY3MgPSBmYWxzZTtcclxuICAgICAgICAgICAgTGlzdDxMeXJpY1N5bWJvbD5bXSByZXN1bHQgPSBuZXcgTGlzdDxMeXJpY1N5bWJvbD5bdHJhY2tzLkNvdW50XTtcclxuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IHRyYWNrcy5Db3VudDsgdHJhY2tudW0rKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTWlkaVRyYWNrIHRyYWNrID0gdHJhY2tzW3RyYWNrbnVtXTtcclxuICAgICAgICAgICAgICAgIGlmICh0cmFjay5MeXJpY3MgPT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGhhc0x5cmljcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRbdHJhY2tudW1dID0gbmV3IExpc3Q8THlyaWNTeW1ib2w+KCk7XHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgZXYgaW4gdHJhY2suTHlyaWNzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFN0cmluZyB0ZXh0ID0gVVRGOEVuY29kaW5nLlVURjguR2V0U3RyaW5nKGV2LlZhbHVlLCAwLCBldi5WYWx1ZS5MZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIEx5cmljU3ltYm9sIHN5bSA9IG5ldyBMeXJpY1N5bWJvbChldi5TdGFydFRpbWUsIHRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFt0cmFja251bV0uQWRkKHN5bSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFoYXNMeXJpY3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIEFkZCB0aGUgbHlyaWMgc3ltYm9scyB0byB0aGUgY29ycmVzcG9uZGluZyBzdGFmZnMgKi9cclxuICAgICAgICBzdGF0aWMgdm9pZFxyXG4gICAgICAgIEFkZEx5cmljc1RvU3RhZmZzKExpc3Q8U3RhZmY+IHN0YWZmcywgTGlzdDxMeXJpY1N5bWJvbD5bXSB0cmFja2x5cmljcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKFN0YWZmIHN0YWZmIGluIHN0YWZmcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTGlzdDxMeXJpY1N5bWJvbD4gbHlyaWNzID0gdHJhY2tseXJpY3Nbc3RhZmYuVHJhY2tdO1xyXG4gICAgICAgICAgICAgICAgc3RhZmYuQWRkTHlyaWNzKGx5cmljcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogU2V0IHRoZSB6b29tIGxldmVsIHRvIGRpc3BsYXkgYXQgKDEuMCA9PSAxMDAlKS5cbiAgICAgICAgICogUmVjYWxjdWxhdGUgdGhlIFNoZWV0TXVzaWMgd2lkdGggYW5kIGhlaWdodCBiYXNlZCBvbiB0aGVcbiAgICAgICAgICogem9vbSBsZXZlbC4gIFRoZW4gcmVkcmF3IHRoZSBTaGVldE11c2ljLiBcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHZvaWQgU2V0Wm9vbShmbG9hdCB2YWx1ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHpvb20gPSB2YWx1ZTtcclxuICAgICAgICAgICAgZmxvYXQgd2lkdGggPSAwO1xyXG4gICAgICAgICAgICBmbG9hdCBoZWlnaHQgPSAwO1xyXG4gICAgICAgICAgICBmb3JlYWNoIChTdGFmZiBzdGFmZiBpbiBzdGFmZnMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHdpZHRoID0gTWF0aC5NYXgod2lkdGgsIHN0YWZmLldpZHRoICogem9vbSk7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgKz0gKHN0YWZmLkhlaWdodCAqIHpvb20pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFdpZHRoID0gKGludCkod2lkdGggKyAyKTtcclxuICAgICAgICAgICAgSGVpZ2h0ID0gKChpbnQpaGVpZ2h0KSArIExlZnRNYXJnaW47XHJcbiAgICAgICAgICAgIHRoaXMuSW52YWxpZGF0ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIENoYW5nZSB0aGUgbm90ZSBjb2xvcnMgZm9yIHRoZSBzaGVldCBtdXNpYywgYW5kIHJlZHJhdy4gKi9cclxuICAgICAgICBwcml2YXRlIHZvaWQgU2V0Q29sb3JzKENvbG9yW10gbmV3Y29sb3JzLCBDb2xvciBuZXdzaGFkZSwgQ29sb3IgbmV3c2hhZGUyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKE5vdGVDb2xvcnMgPT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTm90ZUNvbG9ycyA9IG5ldyBDb2xvclsxMl07XHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDEyOyBpKyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgTm90ZUNvbG9yc1tpXSA9IENvbG9yLkJsYWNrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChuZXdjb2xvcnMgIT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCAxMjsgaSsrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIE5vdGVDb2xvcnNbaV0gPSBuZXdjb2xvcnNbaV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDEyOyBpKyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgTm90ZUNvbG9yc1tpXSA9IENvbG9yLkJsYWNrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzaGFkZUJydXNoICE9IG51bGwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNoYWRlQnJ1c2guRGlzcG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgc2hhZGUyQnJ1c2guRGlzcG9zZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNoYWRlQnJ1c2ggPSBuZXcgU29saWRCcnVzaChuZXdzaGFkZSk7XHJcbiAgICAgICAgICAgIHNoYWRlMkJydXNoID0gbmV3IFNvbGlkQnJ1c2gobmV3c2hhZGUyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBHZXQgdGhlIGNvbG9yIGZvciBhIGdpdmVuIG5vdGUgbnVtYmVyICovXHJcbiAgICAgICAgcHVibGljIENvbG9yIE5vdGVDb2xvcihpbnQgbnVtYmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIE5vdGVDb2xvcnNbTm90ZVNjYWxlLkZyb21OdW1iZXIobnVtYmVyKV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogR2V0IHRoZSBzaGFkZSBicnVzaCAqL1xyXG4gICAgICAgIHB1YmxpYyBCcnVzaCBTaGFkZUJydXNoXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gc2hhZGVCcnVzaDsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIEdldCB0aGUgc2hhZGUyIGJydXNoICovXHJcbiAgICAgICAgcHVibGljIEJydXNoIFNoYWRlMkJydXNoXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gc2hhZGUyQnJ1c2g7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBHZXQgd2hldGhlciB0byBzaG93IG5vdGUgbGV0dGVycyBvciBub3QgKi9cclxuICAgICAgICBwdWJsaWMgaW50IFNob3dOb3RlTGV0dGVyc1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIHNob3dOb3RlTGV0dGVyczsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIEdldCB0aGUgbWFpbiBrZXkgc2lnbmF0dXJlICovXHJcbiAgICAgICAgcHVibGljIEtleVNpZ25hdHVyZSBNYWluS2V5XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gbWFpbmtleTsgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBTZXQgdGhlIHNpemUgb2YgdGhlIG5vdGVzLCBsYXJnZSBvciBzbWFsbC4gIFNtYWxsZXIgbm90ZXMgbWVhbnNcbiAgICAgICAgICogbW9yZSBub3RlcyBwZXIgc3RhZmYuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBTZXROb3RlU2l6ZShib29sIGxhcmdlbm90ZXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAobGFyZ2Vub3RlcylcclxuICAgICAgICAgICAgICAgIExpbmVTcGFjZSA9IDc7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIExpbmVTcGFjZSA9IDU7XHJcblxyXG4gICAgICAgICAgICBTdGFmZkhlaWdodCA9IExpbmVTcGFjZSAqIDQgKyBMaW5lV2lkdGggKiA1O1xyXG4gICAgICAgICAgICBOb3RlSGVpZ2h0ID0gTGluZVNwYWNlICsgTGluZVdpZHRoO1xyXG4gICAgICAgICAgICBOb3RlV2lkdGggPSAzICogTGluZVNwYWNlIC8gMjtcclxuICAgICAgICAgICAgTGV0dGVyRm9udCA9IG5ldyBGb250KFwiQXJpYWxcIiwgOCwgRm9udFN0eWxlLlJlZ3VsYXIpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBEcmF3IHRoZSBTaGVldE11c2ljLlxuICAgICAgICAgKiBTY2FsZSB0aGUgZ3JhcGhpY3MgYnkgdGhlIGN1cnJlbnQgem9vbSBmYWN0b3IuXG4gICAgICAgICAqIEdldCB0aGUgdmVydGljYWwgc3RhcnQgYW5kIGVuZCBwb2ludHMgb2YgdGhlIGNsaXAgYXJlYS5cbiAgICAgICAgICogT25seSBkcmF3IFN0YWZmcyB3aGljaCBsaWUgaW5zaWRlIHRoZSBjbGlwIGFyZWEuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByb3RlY3RlZCAvKm92ZXJyaWRlKi8gdm9pZCBPblBhaW50KFBhaW50RXZlbnRBcmdzIGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBSZWN0YW5nbGUgY2xpcCA9XHJcbiAgICAgICAgICAgICAgbmV3IFJlY3RhbmdsZSgoaW50KShlLkNsaXBSZWN0YW5nbGUuWCAvIHpvb20pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGludCkoZS5DbGlwUmVjdGFuZ2xlLlkgLyB6b29tKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChpbnQpKGUuQ2xpcFJlY3RhbmdsZS5XaWR0aCAvIHpvb20pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGludCkoZS5DbGlwUmVjdGFuZ2xlLkhlaWdodCAvIHpvb20pKTtcclxuXHJcbiAgICAgICAgICAgIEdyYXBoaWNzIGcgPSBlLkdyYXBoaWNzKCk7XHJcbiAgICAgICAgICAgIGcuU2NhbGVUcmFuc2Zvcm0oem9vbSwgem9vbSk7XHJcbiAgICAgICAgICAgIC8qIGcuUGFnZVNjYWxlID0gem9vbTsgKi9cclxuICAgICAgICAgICAgZy5TbW9vdGhpbmdNb2RlID0gU21vb3RoaW5nTW9kZS5BbnRpQWxpYXM7XHJcbiAgICAgICAgICAgIGludCB5cG9zID0gMDtcclxuICAgICAgICAgICAgZm9yZWFjaCAoU3RhZmYgc3RhZmYgaW4gc3RhZmZzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKHlwb3MgKyBzdGFmZi5IZWlnaHQgPCBjbGlwLlkpIHx8ICh5cG9zID4gY2xpcC5ZICsgY2xpcC5IZWlnaHQpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFN0YWZmIGlzIG5vdCBpbiB0aGUgY2xpcCwgZG9uJ3QgbmVlZCB0byBkcmF3IGl0ICovXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oMCwgeXBvcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhZmYuRHJhdyhnLCBjbGlwLCBwZW4sIFNlbGVjdGlvblN0YXJ0UHVsc2UsIFNlbGVjdGlvbkVuZFB1bHNlLCBkZXNlbGVjdGVkU2hhZGVCcnVzaCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oMCwgLXlwb3MpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHlwb3MgKz0gc3RhZmYuSGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGcuU2NhbGVUcmFuc2Zvcm0oMS4wZiAvIHpvb20sIDEuMGYgLyB6b29tKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBXcml0ZSB0aGUgTUlESSBmaWxlbmFtZSBhdCB0aGUgdG9wIG9mIHRoZSBwYWdlICovXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIERyYXdUaXRsZShHcmFwaGljcyBnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW50IGxlZnRtYXJnaW4gPSAyMDtcclxuICAgICAgICAgICAgaW50IHRvcG1hcmdpbiA9IDIwO1xyXG4gICAgICAgICAgICBzdHJpbmcgdGl0bGUgPSBQYXRoLkdldEZpbGVOYW1lKGZpbGVuYW1lKTtcclxuICAgICAgICAgICAgdGl0bGUgPSB0aXRsZS5SZXBsYWNlKFwiLm1pZFwiLCBcIlwiKS5SZXBsYWNlKFwiX1wiLCBcIiBcIik7XHJcbiAgICAgICAgICAgIEZvbnQgZm9udCA9IG5ldyBGb250KFwiQXJpYWxcIiwgMTAsIEZvbnRTdHlsZS5Cb2xkKTtcclxuICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0obGVmdG1hcmdpbiwgdG9wbWFyZ2luKTtcclxuICAgICAgICAgICAgZy5EcmF3U3RyaW5nKHRpdGxlLCBmb250LCBCcnVzaGVzLkJsYWNrLCAwLCAwKTtcclxuICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLWxlZnRtYXJnaW4sIC10b3BtYXJnaW4pO1xyXG4gICAgICAgICAgICBmb250LkRpc3Bvc2UoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm4gdGhlIG51bWJlciBvZiBwYWdlcyBuZWVkZWQgdG8gcHJpbnQgdGhpcyBzaGVldCBtdXNpYy5cbiAgICAgICAgICogQSBzdGFmZiBzaG91bGQgZml0IHdpdGhpbiBhIHNpbmdsZSBwYWdlLCBub3QgYmUgc3BsaXQgYWNyb3NzIHR3byBwYWdlcy5cbiAgICAgICAgICogSWYgdGhlIHNoZWV0IG11c2ljIGhhcyBleGFjdGx5IDIgdHJhY2tzLCB0aGVuIHR3byBzdGFmZnMgc2hvdWxkXG4gICAgICAgICAqIGZpdCB3aXRoaW4gYSBzaW5nbGUgcGFnZSwgYW5kIG5vdCBiZSBzcGxpdCBhY3Jvc3MgdHdvIHBhZ2VzLlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgaW50IEdldFRvdGFsUGFnZXMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW50IG51bSA9IDE7XHJcbiAgICAgICAgICAgIGludCBjdXJyaGVpZ2h0ID0gVGl0bGVIZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICBpZiAobnVtdHJhY2tzID09IDIgJiYgKHN0YWZmcy5Db3VudCAlIDIpID09IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgc3RhZmZzLkNvdW50OyBpICs9IDIpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IGhlaWdodHMgPSBzdGFmZnNbaV0uSGVpZ2h0ICsgc3RhZmZzW2kgKyAxXS5IZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJoZWlnaHQgKyBoZWlnaHRzID4gUGFnZUhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bSsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyaGVpZ2h0ID0gaGVpZ2h0cztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmhlaWdodCArPSBoZWlnaHRzO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKFN0YWZmIHN0YWZmIGluIHN0YWZmcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmhlaWdodCArIHN0YWZmLkhlaWdodCA+IFBhZ2VIZWlnaHQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBudW0rKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmhlaWdodCA9IHN0YWZmLkhlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmhlaWdodCArPSBzdGFmZi5IZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBudW07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogU2hhZGUgYWxsIHRoZSBjaG9yZHMgcGxheWVkIGF0IHRoZSBnaXZlbiBwdWxzZSB0aW1lLlxuICAgICAgICAgKiAgTG9vcCB0aHJvdWdoIGFsbCB0aGUgc3RhZmZzIGFuZCBjYWxsIHN0YWZmLlNoYWRlKCkuXG4gICAgICAgICAqICBJZiBzY3JvbGxHcmFkdWFsbHkgaXMgdHJ1ZSwgc2Nyb2xsIGdyYWR1YWxseSAoc21vb3RoIHNjcm9sbGluZylcbiAgICAgICAgICogIHRvIHRoZSBzaGFkZWQgbm90ZXMuIFJldHVybnMgdGhlIG1pbmltdW0geS1jb29yZGluYXRlIG9mIHRoZSBzaGFkZWQgY2hvcmQgKGZvciBzY3JvbGxpbmcgcHVycG9zZXMpXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBpbnQgU2hhZGVOb3RlcyhpbnQgY3VycmVudFB1bHNlVGltZSwgaW50IHByZXZQdWxzZVRpbWUsIGJvb2wgc2Nyb2xsR3JhZHVhbGx5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgR3JhcGhpY3MgZyA9IENyZWF0ZUdyYXBoaWNzKFwic2hhZGVOb3Rlc1wiKTtcclxuICAgICAgICAgICAgZy5TbW9vdGhpbmdNb2RlID0gU21vb3RoaW5nTW9kZS5BbnRpQWxpYXM7XHJcbiAgICAgICAgICAgIGcuU2NhbGVUcmFuc2Zvcm0oem9vbSwgem9vbSk7XHJcbiAgICAgICAgICAgIGludCB5cG9zID0gMDtcclxuXHJcbiAgICAgICAgICAgIGludCB4X3NoYWRlID0gMDtcclxuICAgICAgICAgICAgaW50IHlfc2hhZGUgPSAwO1xyXG5cclxuICAgICAgICAgICAgaW50IHNoYWRlZFlQb3MgPSAtMTtcclxuICAgICAgICAgICAgZm9yZWFjaCAoU3RhZmYgc3RhZmYgaW4gc3RhZmZzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgwLCB5cG9zKTtcclxuICAgICAgICAgICAgICAgIGlmIChzdGFmZi5TaGFkZU5vdGVzKGcsIHNoYWRlQnJ1c2gsIHBlbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFB1bHNlVGltZSwgcHJldlB1bHNlVGltZSwgcmVmIHhfc2hhZGUpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNoYWRlZFlQb3MgPSBzaGFkZWRZUG9zID09IC0xID8geXBvcyA6IHNoYWRlZFlQb3M7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgwLCAteXBvcyk7XHJcbiAgICAgICAgICAgICAgICB5cG9zICs9IHN0YWZmLkhlaWdodDtcclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50UHVsc2VUaW1lID49IHN0YWZmLkVuZFRpbWUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgeV9zaGFkZSArPSBzdGFmZi5IZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZy5TY2FsZVRyYW5zZm9ybSgxLjBmIC8gem9vbSwgMS4wZiAvIHpvb20pO1xyXG4gICAgICAgICAgICBnLkRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgeF9zaGFkZSA9IChpbnQpKHhfc2hhZGUgKiB6b29tKTtcclxuICAgICAgICAgICAgeV9zaGFkZSAtPSBOb3RlSGVpZ2h0O1xyXG4gICAgICAgICAgICB5X3NoYWRlID0gKGludCkoeV9zaGFkZSAqIHpvb20pO1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudFB1bHNlVGltZSA+PSAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBTY3JvbGxUb1NoYWRlZE5vdGVzKHhfc2hhZGUsIHlfc2hhZGUsIHNjcm9sbEdyYWR1YWxseSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNoYWRlZFlQb3MgPT0gLTEgPyAtMSA6IChpbnQpKHNoYWRlZFlQb3MgKiB6b29tKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBTY3JvbGwgdGhlIHNoZWV0IG11c2ljIHNvIHRoYXQgdGhlIHNoYWRlZCBub3RlcyBhcmUgdmlzaWJsZS5cbiAgICAgICAgICAqIElmIHNjcm9sbEdyYWR1YWxseSBpcyB0cnVlLCBzY3JvbGwgZ3JhZHVhbGx5IChzbW9vdGggc2Nyb2xsaW5nKVxuICAgICAgICAgICogdG8gdGhlIHNoYWRlZCBub3Rlcy5cbiAgICAgICAgICAqL1xyXG4gICAgICAgIHZvaWQgU2Nyb2xsVG9TaGFkZWROb3RlcyhpbnQgeF9zaGFkZSwgaW50IHlfc2hhZGUsIGJvb2wgc2Nyb2xsR3JhZHVhbGx5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgUGFuZWwgc2Nyb2xsdmlldyA9IChQYW5lbCl0aGlzLlBhcmVudDtcclxuICAgICAgICAgICAgUG9pbnQgc2Nyb2xsUG9zID0gc2Nyb2xsdmlldy5BdXRvU2Nyb2xsUG9zaXRpb247XHJcblxyXG4gICAgICAgICAgICAvKiBUaGUgc2Nyb2xsIHBvc2l0aW9uIGlzIGluIG5lZ2F0aXZlIGNvb3JkaW5hdGVzIGZvciBzb21lIHJlYXNvbiAqL1xyXG4gICAgICAgICAgICBzY3JvbGxQb3MuWCA9IC1zY3JvbGxQb3MuWDtcclxuICAgICAgICAgICAgc2Nyb2xsUG9zLlkgPSAtc2Nyb2xsUG9zLlk7XHJcbiAgICAgICAgICAgIFBvaW50IG5ld1BvcyA9IHNjcm9sbFBvcztcclxuXHJcbiAgICAgICAgICAgIGlmIChzY3JvbGxWZXJ0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgc2Nyb2xsRGlzdCA9IChpbnQpKHlfc2hhZGUgLSBzY3JvbGxQb3MuWSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNjcm9sbEdyYWR1YWxseSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2Nyb2xsRGlzdCA+ICh6b29tICogU3RhZmZIZWlnaHQgKiA4KSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsRGlzdCA9IHNjcm9sbERpc3QgLyAyO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHNjcm9sbERpc3QgPiAoTm90ZUhlaWdodCAqIDMgKiB6b29tKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsRGlzdCA9IChpbnQpKE5vdGVIZWlnaHQgKiAzICogem9vbSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBuZXdQb3MgPSBuZXcgUG9pbnQoc2Nyb2xsUG9zLlgsIHNjcm9sbFBvcy5ZICsgc2Nyb2xsRGlzdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgeF92aWV3ID0gc2Nyb2xsUG9zLlggKyA0MCAqIHNjcm9sbHZpZXcuV2lkdGggLyAxMDA7XHJcbiAgICAgICAgICAgICAgICBpbnQgeG1heCA9IHNjcm9sbFBvcy5YICsgNjUgKiBzY3JvbGx2aWV3LldpZHRoIC8gMTAwO1xyXG4gICAgICAgICAgICAgICAgaW50IHNjcm9sbERpc3QgPSB4X3NoYWRlIC0geF92aWV3O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzY3JvbGxHcmFkdWFsbHkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHhfc2hhZGUgPiB4bWF4KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxEaXN0ID0gKHhfc2hhZGUgLSB4X3ZpZXcpIC8gMztcclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh4X3NoYWRlID4geF92aWV3KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxEaXN0ID0gKHhfc2hhZGUgLSB4X3ZpZXcpIC8gNjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBuZXdQb3MgPSBuZXcgUG9pbnQoc2Nyb2xsUG9zLlggKyBzY3JvbGxEaXN0LCBzY3JvbGxQb3MuWSk7XHJcbiAgICAgICAgICAgICAgICBpZiAobmV3UG9zLlggPCAwKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld1Bvcy5YID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzY3JvbGx2aWV3LkF1dG9TY3JvbGxQb3NpdGlvbiA9IG5ld1BvcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBSZXR1cm4gdGhlIHB1bHNlVGltZSBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlbiBwb2ludCBvbiB0aGUgU2hlZXRNdXNpYy5cbiAgICAgICAgICogIEZpcnN0LCBmaW5kIHRoZSBzdGFmZiBjb3JyZXNwb25kaW5nIHRvIHRoZSBwb2ludC5cbiAgICAgICAgICogIFRoZW4sIHdpdGhpbiB0aGUgc3RhZmYsIGZpbmQgdGhlIG5vdGVzL3N5bWJvbHMgY29ycmVzcG9uZGluZyB0byB0aGUgcG9pbnQsXG4gICAgICAgICAqICBhbmQgcmV0dXJuIHRoZSBTdGFydFRpbWUgKHB1bHNlVGltZSkgb2YgdGhlIHN5bWJvbHMuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBpbnQgUHVsc2VUaW1lRm9yUG9pbnQoUG9pbnQgcG9pbnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBQb2ludCBzY2FsZWRQb2ludCA9IG5ldyBQb2ludCgoaW50KShwb2ludC5YIC8gem9vbSksIChpbnQpKHBvaW50LlkgLyB6b29tKSk7XHJcbiAgICAgICAgICAgIGludCB5ID0gMDtcclxuICAgICAgICAgICAgZm9yZWFjaCAoU3RhZmYgc3RhZmYgaW4gc3RhZmZzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2NhbGVkUG9pbnQuWSA+PSB5ICYmIHNjYWxlZFBvaW50LlkgPD0geSArIHN0YWZmLkhlaWdodClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhZmYuUHVsc2VUaW1lRm9yUG9pbnQoc2NhbGVkUG9pbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgeSArPSBzdGFmZi5IZWlnaHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzdHJpbmcgcmVzdWx0ID0gXCJTaGVldE11c2ljIHN0YWZmcz1cIiArIHN0YWZmcy5Db3VudCArIFwiXFxuXCI7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKFN0YWZmIHN0YWZmIGluIHN0YWZmcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHN0YWZmLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzdWx0ICs9IFwiRW5kIFNoZWV0TXVzaWNcXG5cIjtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxuXG59XG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgU29saWRCcnVzaDpCcnVzaFxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBTb2xpZEJydXNoKENvbG9yIGNvbG9yKTpcclxuICAgICAgICAgICAgYmFzZShjb2xvcilcclxuICAgICAgICB7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMSBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIEBjbGFzcyBUaW1lU2lnU3ltYm9sXG4gKiBBIFRpbWVTaWdTeW1ib2wgcmVwcmVzZW50cyB0aGUgdGltZSBzaWduYXR1cmUgYXQgdGhlIGJlZ2lubmluZ1xuICogb2YgdGhlIHN0YWZmLiBXZSB1c2UgcHJlLW1hZGUgaW1hZ2VzIGZvciB0aGUgbnVtYmVycywgaW5zdGVhZCBvZlxuICogZHJhd2luZyBzdHJpbmdzLlxuICovXG5cbnB1YmxpYyBjbGFzcyBUaW1lU2lnU3ltYm9sIDogTXVzaWNTeW1ib2wge1xuICAgIHByaXZhdGUgc3RhdGljIEltYWdlW10gaW1hZ2VzOyAgLyoqIFRoZSBpbWFnZXMgZm9yIGVhY2ggbnVtYmVyICovXG4gICAgcHJpdmF0ZSBpbnQgIG51bWVyYXRvcjsgICAgICAgICAvKiogVGhlIG51bWVyYXRvciAqL1xuICAgIHByaXZhdGUgaW50ICBkZW5vbWluYXRvcjsgICAgICAgLyoqIFRoZSBkZW5vbWluYXRvciAqL1xuICAgIHByaXZhdGUgaW50ICB3aWR0aDsgICAgICAgICAgICAgLyoqIFRoZSB3aWR0aCBpbiBwaXhlbHMgKi9cbiAgICBwcml2YXRlIGJvb2wgY2FuZHJhdzsgICAgICAgICAgIC8qKiBUcnVlIGlmIHdlIGNhbiBkcmF3IHRoZSB0aW1lIHNpZ25hdHVyZSAqL1xuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBUaW1lU2lnU3ltYm9sICovXG4gICAgcHVibGljIFRpbWVTaWdTeW1ib2woaW50IG51bWVyLCBpbnQgZGVub20pIHtcbiAgICAgICAgbnVtZXJhdG9yID0gbnVtZXI7XG4gICAgICAgIGRlbm9taW5hdG9yID0gZGVub207XG4gICAgICAgIExvYWRJbWFnZXMoKTtcbiAgICAgICAgaWYgKG51bWVyID49IDAgJiYgbnVtZXIgPCBpbWFnZXMuTGVuZ3RoICYmIGltYWdlc1tudW1lcl0gIT0gbnVsbCAmJlxuICAgICAgICAgICAgZGVub20gPj0gMCAmJiBkZW5vbSA8IGltYWdlcy5MZW5ndGggJiYgaW1hZ2VzW251bWVyXSAhPSBudWxsKSB7XG4gICAgICAgICAgICBjYW5kcmF3ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNhbmRyYXcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB3aWR0aCA9IE1pbldpZHRoO1xuICAgIH1cblxuICAgIC8qKiBMb2FkIHRoZSBpbWFnZXMgaW50byBtZW1vcnkuICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBMb2FkSW1hZ2VzKCkge1xuICAgICAgICBpZiAoaW1hZ2VzID09IG51bGwpIHtcbiAgICAgICAgICAgIGltYWdlcyA9IG5ldyBJbWFnZVsxM107XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDEzOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpbWFnZXNbaV0gPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW1hZ2VzWzJdID0gbmV3IEJpdG1hcCh0eXBlb2YoVGltZVNpZ1N5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy50d28ucG5nXCIpO1xuICAgICAgICAgICAgaW1hZ2VzWzNdID0gbmV3IEJpdG1hcCh0eXBlb2YoVGltZVNpZ1N5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy50aHJlZS5wbmdcIik7XG4gICAgICAgICAgICBpbWFnZXNbNF0gPSBuZXcgQml0bWFwKHR5cGVvZihUaW1lU2lnU3ltYm9sKSwgXCJSZXNvdXJjZXMuSW1hZ2VzLmZvdXIucG5nXCIpO1xuICAgICAgICAgICAgaW1hZ2VzWzZdID0gbmV3IEJpdG1hcCh0eXBlb2YoVGltZVNpZ1N5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy5zaXgucG5nXCIpO1xuICAgICAgICAgICAgaW1hZ2VzWzhdID0gbmV3IEJpdG1hcCh0eXBlb2YoVGltZVNpZ1N5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy5laWdodC5wbmdcIik7XG4gICAgICAgICAgICBpbWFnZXNbOV0gPSBuZXcgQml0bWFwKHR5cGVvZihUaW1lU2lnU3ltYm9sKSwgXCJSZXNvdXJjZXMuSW1hZ2VzLm5pbmUucG5nXCIpO1xuICAgICAgICAgICAgaW1hZ2VzWzEyXSA9IG5ldyBCaXRtYXAodHlwZW9mKFRpbWVTaWdTeW1ib2wpLCBcIlJlc291cmNlcy5JbWFnZXMudHdlbHZlLnBuZ1wiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIHRpbWUgKGluIHB1bHNlcykgdGhpcyBzeW1ib2wgb2NjdXJzIGF0LiAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgU3RhcnRUaW1lIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIC0xOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbWluaW11bSB3aWR0aCAoaW4gcGl4ZWxzKSBuZWVkZWQgdG8gZHJhdyB0aGlzIHN5bWJvbCAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgTWluV2lkdGgge1xuICAgICAgICBnZXQgeyBpZiAoY2FuZHJhdykgXG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW1hZ2VzWzJdLldpZHRoICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMiAvaW1hZ2VzWzJdLkhlaWdodDtcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEdldC9TZXQgdGhlIHdpZHRoIChpbiBwaXhlbHMpIG9mIHRoaXMgc3ltYm9sLiBUaGUgd2lkdGggaXMgc2V0XG4gICAgICogaW4gU2hlZXRNdXNpYy5BbGlnblN5bWJvbHMoKSB0byB2ZXJ0aWNhbGx5IGFsaWduIHN5bWJvbHMuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBXaWR0aCB7XG4gICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgc2V0IHsgd2lkdGggPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBhYm92ZSB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBBYm92ZVN0YWZmIHsgXG4gICAgICAgIGdldCB7ICByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBiZWxvdyB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBCZWxvd1N0YWZmIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIDA7IH0gXG4gICAgfVxuXG4gICAgLyoqIERyYXcgdGhlIHN5bWJvbC5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgXG4gICAgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIGlmICghY2FuZHJhdylcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybShXaWR0aCAtIE1pbldpZHRoLCAwKTtcbiAgICAgICAgSW1hZ2UgbnVtZXIgPSBpbWFnZXNbbnVtZXJhdG9yXTtcbiAgICAgICAgSW1hZ2UgZGVub20gPSBpbWFnZXNbZGVub21pbmF0b3JdO1xuXG4gICAgICAgIC8qIFNjYWxlIHRoZSBpbWFnZSB3aWR0aCB0byBtYXRjaCB0aGUgaGVpZ2h0ICovXG4gICAgICAgIGludCBpbWdoZWlnaHQgPSBTaGVldE11c2ljLk5vdGVIZWlnaHQgKiAyO1xuICAgICAgICBpbnQgaW1nd2lkdGggPSBudW1lci5XaWR0aCAqIGltZ2hlaWdodCAvIG51bWVyLkhlaWdodDtcbiAgICAgICAgZy5EcmF3SW1hZ2UobnVtZXIsIDAsIHl0b3AsIGltZ3dpZHRoLCBpbWdoZWlnaHQpO1xuICAgICAgICBnLkRyYXdJbWFnZShkZW5vbSwgMCwgeXRvcCArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyLCBpbWd3aWR0aCwgaW1naGVpZ2h0KTtcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShXaWR0aCAtIE1pbldpZHRoKSwgMCk7XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJUaW1lU2lnU3ltYm9sIG51bWVyYXRvcj17MH0gZGVub21pbmF0b3I9ezF9XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWVyYXRvciwgZGVub21pbmF0b3IpO1xuICAgIH1cbn1cblxufVxuXG4iXQp9Cg==
