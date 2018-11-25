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
            ShadeNotes: function (currentPulseTime, prevPulseTime, scrollGradually) {
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
                        staff.ShadeNotes(g, this.shadeBrush, this.pen, currentPulseTime, prevPulseTime, x_shade);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJNaWRpU2hlZXRNdXNpY0JyaWRnZS5qcyIsCiAgInNvdXJjZVJvb3QiOiAiIiwKICAic291cmNlcyI6IFsiQ2xhc3Nlcy9EcmF3aW5nL0ltYWdlLmNzIiwiQ2xhc3Nlcy9SaWZmUGFyc2VyLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL0JydXNoLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL0JydXNoZXMuY3MiLCJDbGFzc2VzL0NsZWZNZWFzdXJlcy5jcyIsIkNsYXNzZXMvRHJhd2luZy9Db2xvci5jcyIsIkNsYXNzZXMvRHJhd2luZy9Db250cm9sLmNzIiwiQ2xhc3Nlcy9JTy9TdHJlYW0uY3MiLCJDbGFzc2VzL0RyYXdpbmcvRm9udC5jcyIsIkNsYXNzZXMvRHJhd2luZy9HcmFwaGljcy5jcyIsIkNsYXNzZXMvS2V5U2lnbmF0dXJlLmNzIiwiQ2xhc3Nlcy9MeXJpY1N5bWJvbC5jcyIsIkNsYXNzZXMvTWlkaUV2ZW50LmNzIiwiQ2xhc3Nlcy9NaWRpRmlsZS5jcyIsIkNsYXNzZXMvTWlkaUZpbGVFeGNlcHRpb24uY3MiLCJDbGFzc2VzL01pZGlGaWxlUmVhZGVyLmNzIiwiQ2xhc3Nlcy9NaWRpTm90ZS5jcyIsIkNsYXNzZXMvTWlkaU9wdGlvbnMuY3MiLCJDbGFzc2VzL01pZGlUcmFjay5jcyIsIkNsYXNzZXMvV2hpdGVOb3RlLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL1BhaW50RXZlbnRBcmdzLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL1BhbmVsLmNzIiwiQ2xhc3Nlcy9JTy9QYXRoLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL1Blbi5jcyIsIkNsYXNzZXMvRHJhd2luZy9Qb2ludC5jcyIsIkNsYXNzZXMvRHJhd2luZy9SZWN0YW5nbGUuY3MiLCJDbGFzc2VzL1N0YWZmLmNzIiwiQ2xhc3Nlcy9TdGVtLmNzIiwiQ2xhc3Nlcy9TeW1ib2xXaWR0aHMuY3MiLCJDbGFzc2VzL1RpbWVTaWduYXR1cmUuY3MiLCJDbGFzc2VzL1RleHQvQVNDSUkuY3MiLCJDbGFzc2VzL1RleHQvRW5jb2RpbmcuY3MiLCJDbGFzc2VzL0FjY2lkU3ltYm9sLmNzIiwiQ2xhc3Nlcy9CYXJTeW1ib2wuY3MiLCJDbGFzc2VzL0RyYXdpbmcvQml0bWFwLmNzIiwiQ2xhc3Nlcy9CbGFua1N5bWJvbC5jcyIsIkNsYXNzZXMvQ2hvcmRTeW1ib2wuY3MiLCJDbGFzc2VzL0NsZWZTeW1ib2wuY3MiLCJDbGFzc2VzL0lPL0ZpbGVTdHJlYW0uY3MiLCJDbGFzc2VzL1BpYW5vLmNzIiwiQ2xhc3Nlcy9SZXN0U3ltYm9sLmNzIiwiQ2xhc3Nlcy9TaGVldE11c2ljLmNzIiwiQ2xhc3Nlcy9EcmF3aW5nL1NvbGlkQnJ1c2guY3MiLCJDbGFzc2VzL1RpbWVTaWdTeW1ib2wuY3MiXSwKICAibmFtZXMiOiBbIiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQW9CZ0JBLE9BQU9BLDBCQUE4Q0E7Ozs7O29CQVFyREEsT0FBT0EsMkJBQStDQTs7Ozs7NEJBakI5Q0EsTUFBV0E7O2dCQUV2QkEsc0JBQXFDQSxNQUFNQSxNQUFNQTs7Ozs7Ozs7Ozs7OzRCQ2U3QkEsUUFBWUEsT0FBV0E7O2dCQUUzQ0EsY0FBY0E7Z0JBQ2RBLGFBQWFBO2dCQUNiQSxZQUFZQTs7Ozs7Z0JBS1pBLFlBQWVBLGtCQUFTQTtnQkFDeEJBLGtCQUFXQSxXQUFNQSxhQUFRQSxVQUFVQTtnQkFDbkNBLE9BQU9BOzs7Ozs7Ozs7OzRCQzdCRUE7O2dCQUVUQSxhQUFRQTs7Ozs7Ozs7Ozs7Ozt3QkNKc0JBLE9BQU9BLElBQUlBLHFCQUFNQTs7Ozs7d0JBQ2pCQSxPQUFPQSxJQUFJQSxxQkFBTUE7Ozs7O3dCQUNiQSxPQUFPQSxJQUFJQSxxQkFBTUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29DQ3FGOUJBOztvQkFDekJBLGNBQWNBO29CQUNkQTtvQkFDQUEsMEJBQXVCQTs7Ozs0QkFDbkJBLGlCQUFTQTs7Ozs7O3FCQUViQSxJQUFJQTt3QkFDQUEsT0FBT0E7MkJBRU5BLElBQUlBLHdCQUFNQSxzQkFBZUE7d0JBQzFCQSxP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b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBOztvQkFFMUJBLE1BQU1BLHlEQUFVQSwrQkFBVkE7b0JBQ05BLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTs7b0JBRTFCQSxNQUFNQSx5REFBVUEsK0JBQVZBO29CQUNOQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7O29C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QkFBS0EsaUNBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7O29CQUUxQkEsTUFBTUEsd0RBQVNBLG1DQUFUQTtvQkFDTkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGlDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBOztvQkFFMUJBLE1BQU1BLHdEQUFTQSxtQ0FBVEE7b0JBQ05BLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxpQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTs7b0JBRTFCQSxNQUFNQSx3REFBU0EsbUNBQVRBO29CQUNOQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7O29CQUUxQkEsTUFBTUEsd0RBQVNBLG1DQUFUQTtvQkFDTkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLDRCQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsZ0NBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSw0QkFBTEEsUUFBMEJBO29CQUMxQkEsdUJBQUtBLGdDQUFMQSxRQUEwQkE7b0JBQzFCQSx1QkFBS0EsNEJBQUxBLFFBQTBCQTtvQkFDMUJBLHVCQUFLQSxnQ0FBTEEsUUFBMEJBOzs7O2lDQW1QR0E7O29CQUM3QkE7OztvQkFHQUEsZ0JBQWtCQTtvQkFDbEJBLEtBQUtBLFdBQVdBLElBQUlBLGFBQWFBO3dCQUM3QkEsaUJBQWlCQSxjQUFNQTt3QkFDdkJBLGdCQUFnQkEsQ0FBQ0E7d0JBQ2pCQSw2QkFBVUEsV0FBVkEsNENBQVVBLFdBQVZBOzs7Ozs7O29CQU9KQTtvQkFDQUE7b0JBQ0FBLDJCQUEyQkE7b0JBQzNCQTs7b0JBRUFBLEtBQUtBLFNBQVNBLFNBQVNBO3dCQUNuQkE7d0JBQ0FBLEtBQUtBLFdBQVdBLFFBQVFBOzRCQUNwQkEsSUFBSUEsK0RBQVVBLEtBQVZBLDREQUFlQSxZQUFNQTtnQ0FDckJBLDZCQUFlQSw2QkFBVUEsR0FBVkE7Ozt3QkFHdkJBLElBQUlBLGNBQWNBOzRCQUNkQSx1QkFBdUJBOzRCQUN2QkEsVUFBVUE7NEJBQ1ZBOzs7O29CQUlSQSxLQUFLQSxTQUFTQSxTQUFTQTt3QkFDbkJBO3dCQUNBQSxLQUFLQSxZQUFXQSxTQUFRQTs0QkFDcEJBLElBQUlBLCtEQUFTQSxLQUFUQSwyREFBY0EsY0FBTUE7Z0NBQ3BCQSwrQkFBZUEsNkJBQVVBLElBQVZBOzs7d0JBR3ZCQSxJQUFJQSxlQUFjQTs0QkFDZEEsdUJBQXVCQTs0QkFDdkJBLFVBQVVBOzRCQUNWQTs7O29CQUdSQSxJQUFJQTt3QkFDQUEsT0FBT0EsSUFBSUEsbUNBQWFBOzt3QkFHeEJBLE9BQU9BLElBQUlBLHNDQUFnQkE7Ozt1Q0ErQkZBO29CQUM3QkEsUUFBUUE7d0JBQ0pBLEtBQUtBOzRCQUFpQkE7d0JBQ3RCQSxLQUFLQTs0QkFBaUJBO3dCQUN0QkEsS0FBS0E7NEJBQWlCQTt3QkFDdEJBLEtBQUtBOzRCQUFpQkE7d0JBQ3RCQSxLQUFLQTs0QkFBaUJBO3dCQUN0QkEsS0FBS0E7NEJBQWlCQTt3QkFDdEJBLEtBQUtBOzRCQUFpQkE7d0JBQ3RCQSxLQUFLQTs0QkFBaUJBO3dCQUN0QkEsS0FBS0E7NEJBQWlCQTt3QkFDdEJBLEtBQUtBOzRCQUFpQkE7d0JBQ3RCQSxLQUFLQTs0QkFBaUJBO3dCQUN0QkEsS0FBS0E7NEJBQWlCQTt3QkFDdEJBOzRCQUFzQkE7Ozs7Ozs7Ozs7Ozs7OzhCQTdqQlZBLFlBQWdCQTs7Z0JBQ2hDQSxJQUFJQSxDQUFDQSxDQUFDQSxvQkFBbUJBO29CQUNyQkEsTUFBTUEsSUFBSUE7O2dCQUVkQSxrQkFBa0JBO2dCQUNsQkEsaUJBQWlCQTs7Z0JBRWpCQTtnQkFDQUEsY0FBU0E7Z0JBQ1RBO2dCQUNBQTs7NEJBSWdCQTs7Z0JBQ2hCQSxrQkFBYUE7Z0JBQ2JBLFFBQVFBO29CQUNKQSxLQUFLQTt3QkFBaUJBO3dCQUFnQkE7b0JBQ3RDQSxLQUFLQTt3QkFBaUJBO3dCQUFnQkE7b0JBQ3RDQSxLQUFLQTt3QkFBaUJBO3dCQUFnQkE7b0JBQ3RDQSxLQUFLQTt3QkFBaUJBO29CQUN0QkEsS0FBS0E7d0JBQWlCQTt3QkFBZ0JBO29CQUN0Q0EsS0FBS0E7d0JBQWlCQTt3QkFBZ0JBO29CQUN0Q0EsS0FBS0E7d0JBQWlCQTt3QkFBZ0JBO29CQUN0Q0EsS0FBS0E7d0JBQWlCQTt3QkFBZ0JBO29CQUN0Q0EsS0FBS0E7d0JBQWlCQTt3QkFBZ0JBO29CQUN0Q0EsS0FBS0E7d0JBQWlCQTt3QkFBZ0JBO29CQUN0Q0EsS0FBS0E7d0JBQWlCQTt3QkFBZ0JBO29CQUN0Q0EsS0FBS0E7d0JBQWlCQTt3QkFBZ0JBO29CQUN0Q0E7d0JBQXNCQTs7O2dCQUcxQkE7Z0JBQ0FBLGNBQVNBO2dCQUNUQTtnQkFDQUE7Ozs7O2dCQWtOQUE7Z0JBQ0FBLElBQUlBO29CQUNBQSxNQUFNQSx3REFBU0EsZ0JBQVRBOztvQkFFTkEsTUFBTUEseURBQVVBLGlCQUFWQTs7O2dCQUVWQSxLQUFLQSxvQkFBb0JBLGFBQWFBLG9CQUFlQTtvQkFDakRBLCtCQUFPQSxZQUFQQSxnQkFBcUJBLHVCQUFJQSxvQ0FBcUJBLGFBQXpCQTs7OztnQkFTekJBLFlBQVlBLFNBQVNBLGlCQUFZQTtnQkFDakNBLGNBQVNBLGtCQUFnQkE7Z0JBQ3pCQSxZQUFPQSxrQkFBZ0JBOztnQkFFdkJBLElBQUlBO29CQUNBQTs7O2dCQUdKQSxrQkFBMEJBO2dCQUMxQkEsZ0JBQXdCQTs7Z0JBRXhCQSxJQUFJQTtvQkFDQUEsY0FBY0EsbUJBQ1ZBLElBQUlBLHlCQUFVQSxnQ0FDZEEsSUFBSUEseUJBQVVBLGdDQUNkQSxJQUFJQSx5QkFBVUEsZ0NBQ2RBLElBQUlBLHlCQUFVQSxnQ0FDZEEsSUFBSUEseUJBQVVBLGdDQUNkQSxJQUFJQSx5QkFBVUE7b0JBRWxCQSxZQUFZQSxtQkFDUkEsSUFBSUEseUJBQVVBLGdDQUNkQSxJQUFJQSx5QkFBVUEsZ0NBQ2RBLElBQUlBLHlCQUFVQSxnQ0FDZEEsSUFBSUEseUJBQVVBLGdDQUNkQSxJQUFJQSx5QkFBVUEsZ0NBQ2RBLElBQUlBLHlCQUFVQTt1QkFHakJBLElBQUlBO29CQUNMQSxjQUFjQSxtQkFDVkEsSUFBSUEseUJBQVVBLGdDQUNkQSxJQUFJQSx5QkFBVUEsZ0NBQ2RBLElBQUlBLHlCQUFVQSxnQ0FDZEEsSUFBSUEseUJBQVVBLGdDQUNkQSxJQUFJQSx5QkFBVUEsZ0NBQ2RBLElBQUlBLHlCQUFVQTtvQkFFbEJBLFlBQVlBLG1CQUNSQSxJQUFJQSx5QkFBVUEsZ0NBQ2RBLElBQUlBLHlCQUFVQSxnQ0FDZEEsSUFBSUEseUJBQVVBLGdDQUNkQSxJQUFJQSx5QkFBVUEsZ0NBQ2RBLElBQUlBLHlCQUFVQSxnQ0FDZEEsSUFBSUEseUJBQVVBOzs7Z0JBSXRCQSxRQUFVQTtnQkFDVkEsSUFBSUE7b0JBQ0FBLElBQUlBOztvQkFFSkEsSUFBSUE7OztnQkFFUkEsS0FBS0EsV0FBV0EsSUFBSUEsT0FBT0E7b0JBQ3ZCQSwrQkFBT0EsR0FBUEEsZ0JBQVlBLElBQUlBLDJCQUFZQSxHQUFHQSwrQkFBWUEsR0FBWkEsZUFBZ0JBO29CQUMvQ0EsNkJBQUtBLEdBQUxBLGNBQVVBLElBQUlBLDJCQUFZQSxHQUFHQSw2QkFBVUEsR0FBVkEsYUFBY0E7OztrQ0FPbkJBO2dCQUM1QkEsSUFBSUEsU0FBUUE7b0JBQ1JBLE9BQU9BOztvQkFFUEEsT0FBT0E7OztxQ0FZWUEsWUFBZ0JBO2dCQUN2Q0EsSUFBSUEsWUFBV0E7b0JBQ1hBO29CQUNBQSxtQkFBY0E7OztnQkFHbEJBLGFBQWVBLCtCQUFPQSxZQUFQQTtnQkFDZkEsSUFBSUEsV0FBVUE7b0JBQ1ZBLCtCQUFPQSxZQUFQQSxnQkFBcUJBO29CQUNyQkEsK0JBQU9BLHdCQUFQQSxnQkFBdUJBO3VCQUV0QkEsSUFBSUEsV0FBVUE7b0JBQ2ZBLCtCQUFPQSxZQUFQQSxnQkFBcUJBO29CQUNyQkEsK0JBQU9BLHdCQUFQQSxnQkFBdUJBO3VCQUV0QkEsSUFBSUEsV0FBVUE7b0JBQ2ZBLCtCQUFPQSxZQUFQQSxnQkFBcUJBO29CQUNyQkEsY0FBY0Esb0NBQXFCQTtvQkFDbkNBLGNBQWNBLG9DQUFxQkE7Ozs7OztvQkFNbkNBLElBQUlBLCtCQUFPQSx3QkFBUEEsa0JBQXdCQSw2QkFBY0EsK0JBQU9BLHdCQUFQQSxrQkFBd0JBLDZCQUM5REEsb0NBQXFCQSxZQUFZQSxvQ0FBcUJBOzt3QkFFdERBLElBQUlBOzRCQUNBQSwrQkFBT0Esd0JBQVBBLGdCQUF1QkE7OzRCQUd2QkEsK0JBQU9BLHdCQUFQQSxnQkFBdUJBOzsyQkFHMUJBLElBQUlBLCtCQUFPQSx3QkFBUEEsa0JBQXdCQSw2QkFBY0Esb0NBQXFCQTt3QkFDaEVBLCtCQUFPQSx3QkFBUEEsZ0JBQXVCQTsyQkFFdEJBLElBQUlBLCtCQUFPQSx3QkFBUEEsa0JBQXdCQSw2QkFBY0Esb0NBQXFCQTt3QkFDaEVBLCtCQUFPQSx3QkFBUEEsZ0JBQXVCQTs7Ozs7Z0JBTS9CQSxPQUFPQTs7b0NBU21CQTtnQkFDMUJBLGdCQUFnQkEsb0NBQXFCQTtnQkFDckNBLGFBQWFBLG1CQUFDQTtnQkFDZEE7O2dCQUVBQTtvQkFDSUE7b0JBQWFBO29CQUNiQTtvQkFDQUE7b0JBQWFBO29CQUNiQTtvQkFBYUE7b0JBQ2JBO29CQUNBQTtvQkFBYUE7b0JBQ2JBO29CQUFhQTs7O2dCQUdqQkE7b0JBQ0lBO29CQUNBQTtvQkFBYUE7b0JBQ2JBO29CQUNBQTtvQkFBYUE7b0JBQ2JBO29CQUFhQTtvQkFDYkE7b0JBQ0FBO29CQUFhQTtvQkFDYkE7OztnQkFHSkEsWUFBY0EsK0JBQU9BLFlBQVBBO2dCQUNkQSxJQUFJQSxVQUFTQTtvQkFDVEEsU0FBU0EsK0JBQVlBLFdBQVpBO3VCQUVSQSxJQUFJQSxVQUFTQTtvQkFDZEEsU0FBU0EsZ0NBQWFBLFdBQWJBO3VCQUVSQSxJQUFJQSxVQUFTQTtvQkFDZEEsU0FBU0EsZ0NBQWFBLFdBQWJBO3VCQUVSQSxJQUFJQSxVQUFTQTtvQkFDZEEsU0FBU0EsZ0NBQWFBLFdBQWJBOzs7Ozs7b0JBTVRBLElBQUlBLG9DQUFxQkE7d0JBQ3JCQSxJQUFJQSwrQkFBT0Esd0JBQVBBLGtCQUF3QkEsZ0NBQ3hCQSwrQkFBT0Esd0JBQVBBLGtCQUF3QkE7OzRCQUV4QkEsSUFBSUE7Z0NBQ0FBLFNBQVNBLCtCQUFZQSxXQUFaQTs7Z0NBR1RBLFNBQVNBLGdDQUFhQSxXQUFiQTs7K0JBR1pBLElBQUlBLCtCQUFPQSx3QkFBUEEsa0JBQXdCQTs0QkFDN0JBLFNBQVNBLGdDQUFhQSxXQUFiQTsrQkFFUkEsSUFBSUEsK0JBQU9BLHdCQUFQQSxrQkFBd0JBOzRCQUM3QkEsU0FBU0EsK0JBQVlBLFdBQVpBOzs7Ozs7OztnQkFRckJBLElBQUlBLG1CQUFhQSxxQ0FBU0EsY0FBYUE7b0JBQ25DQSxTQUFTQTs7Z0JBRWJBLElBQUlBLG1CQUFhQSxxQ0FBU0EsY0FBYUE7b0JBQ25DQSxTQUFTQTs7O2dCQUdiQSxJQUFJQSxzQkFBaUJBLGNBQWFBO29CQUM5QkE7OztnQkFHSkEsT0FBT0EsSUFBSUEseUJBQVVBLFFBQVFBOzs4QkErRGRBO2dCQUNmQSxJQUFJQSxpQkFBZ0JBLG1CQUFjQSxnQkFBZUE7b0JBQzdDQTs7b0JBRUFBOzs7O2dCQUtKQTtvQkFDSUE7b0JBQWFBO29CQUFhQTtvQkFBaUJBO29CQUMzQ0E7b0JBQWlCQTtvQkFBaUJBO29CQUFpQkE7OztnQkFHdkRBO29CQUNJQTtvQkFBYUE7b0JBQWFBO29CQUFhQTtvQkFBYUE7b0JBQ3BEQTtvQkFBYUE7b0JBQWtCQTtvQkFBa0JBO29CQUNqREE7O2dCQUVKQSxJQUFJQTtvQkFDQUEsT0FBT0EsNkJBQVVBLGdCQUFWQTs7b0JBRVBBLE9BQU9BLDhCQUFXQSxpQkFBWEE7Ozs7Z0JBMEJYQSxPQUFPQSx3Q0FBYUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQ3JuQmRBLE9BQU9BOzs7b0JBQ1BBLGlCQUFZQTs7Ozs7b0JBSVpBLE9BQU9BOzs7b0JBQ1BBLFlBQU9BOzs7OztvQkFJUEEsT0FBT0E7OztvQkFDUEEsU0FBSUE7Ozs7O29CQUlKQSxPQUFPQTs7Ozs7NEJBckJFQSxXQUFlQTs7Z0JBQzlCQSxpQkFBaUJBO2dCQUNqQkEsWUFBWUE7Ozs7O2dCQTBCWkEsbUJBQXFCQTtnQkFDckJBLFlBQWNBLG1CQUFjQTtnQkFDNUJBLElBQUlBO29CQUNBQSxTQUFTQTs7Z0JBRWJBLElBQUlBO29CQUNBQSxTQUFTQTs7Z0JBRWJBLElBQUlBO29CQUNBQSxTQUFTQTs7Z0JBRWJBLE9BQU9BLGtCQUFLQTs7O2dCQUtaQSxPQUFPQSx1REFDY0EsMENBQVdBLGtDQUFHQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2dCQ3RCbkNBLGFBQWtCQSxJQUFJQTtnQkFDdEJBLG1CQUFtQkE7Z0JBQ25CQSxtQkFBbUJBO2dCQUNuQkEsc0JBQXNCQTtnQkFDdEJBLG1CQUFtQkE7Z0JBQ25CQSxpQkFBaUJBO2dCQUNqQkEsb0JBQW9CQTtnQkFDcEJBLGtCQUFrQkE7Z0JBQ2xCQSxvQkFBb0JBO2dCQUNwQkEscUJBQXFCQTtnQkFDckJBLHNCQUFzQkE7Z0JBQ3RCQSxvQkFBb0JBO2dCQUNwQkEsc0JBQXNCQTtnQkFDdEJBLG1CQUFtQkE7Z0JBQ25CQSxtQkFBbUJBO2dCQUNuQkEscUJBQXFCQTtnQkFDckJBLGVBQWVBO2dCQUNmQSxtQkFBbUJBO2dCQUNuQkEsb0JBQW9CQTtnQkFDcEJBLGVBQWVBO2dCQUNmQSxPQUFPQTs7K0JBSVFBLEdBQWFBO2dCQUM1QkEsSUFBSUEsZ0JBQWVBO29CQUNmQSxJQUFJQSxnQkFBZUE7d0JBQ2ZBLE9BQU9BLGlCQUFlQTs7d0JBR3RCQSxPQUFPQSxnQkFBY0E7OztvQkFJekJBLE9BQU9BLGdCQUFjQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7K0NDcXBCT0E7O29CQUU1QkEsY0FBY0E7b0JBQ2RBLDBCQUEwQkE7Ozs7NEJBRXRCQSxJQUFJQSxpQkFBZ0JBO2dDQUVoQkE7Ozs7Ozs7cUJBR1JBOzt5Q0FNcUJBLEtBQVNBLEtBQVlBO29CQUUxQ0EsU0FBVUEsQ0FBTUEsQUFBQ0EsQ0FBQ0E7b0JBQ2xCQSxTQUFVQSxDQUFNQSxBQUFDQSxDQUFDQTtvQkFDbEJBLFNBQVVBLENBQU1BLEFBQUNBLENBQUNBO29CQUNsQkEsU0FBVUEsQ0FBTUEsQUFBQ0E7O29CQUVqQkEsSUFBSUE7d0JBRUFBLHVCQUFJQSxRQUFKQSxRQUFjQSxDQUFNQSxBQUFDQTt3QkFDckJBLHVCQUFJQSxvQkFBSkEsUUFBa0JBLENBQU1BLEFBQUNBO3dCQUN6QkEsdUJBQUlBLG9CQUFKQSxRQUFrQkEsQ0FBTUEsQUFBQ0E7d0JBQ3pCQSx1QkFBSUEsb0JBQUpBLFFBQWtCQTt3QkFDbEJBOzJCQUVDQSxJQUFJQTt3QkFFTEEsdUJBQUlBLFFBQUpBLFFBQWNBLENBQU1BLEFBQUNBO3dCQUNyQkEsdUJBQUlBLG9CQUFKQSxRQUFrQkEsQ0FBTUEsQUFBQ0E7d0JBQ3pCQSx1QkFBSUEsb0JBQUpBLFFBQWtCQTt3QkFDbEJBOzJCQUVDQSxJQUFJQTt3QkFFTEEsdUJBQUlBLFFBQUpBLFFBQWNBLENBQU1BLEFBQUNBO3dCQUNyQkEsdUJBQUlBLG9CQUFKQSxRQUFrQkE7d0JBQ2xCQTs7d0JBSUFBLHVCQUFJQSxRQUFKQSxRQUFjQTt3QkFDZEE7OztzQ0FLdUJBLE9BQVdBLE1BQWFBO29CQUVuREEsd0JBQUtBLFFBQUxBLFNBQWVBLENBQU1BLEFBQUNBLENBQUNBO29CQUN2QkEsd0JBQUtBLG9CQUFMQSxTQUFtQkEsQ0FBTUEsQUFBQ0EsQ0FBQ0E7b0JBQzNCQSx3QkFBS0Esb0JBQUxBLFNBQW1CQSxDQUFNQSxBQUFDQSxDQUFDQTtvQkFDM0JBLHdCQUFLQSxvQkFBTEEsU0FBbUJBLENBQU1BLEFBQUNBOzswQ0FJSUE7O29CQUU5QkE7b0JBQ0FBLFVBQWFBO29CQUNiQSwwQkFBNkJBOzs7OzRCQUV6QkEsYUFBT0EsdUNBQWNBLGtCQUFrQkE7NEJBQ3ZDQTs0QkFDQUEsUUFBUUE7Z0NBRUpBLEtBQUtBO29DQUFhQTtvQ0FBVUE7Z0NBQzVCQSxLQUFLQTtvQ0FBY0E7b0NBQVVBO2dDQUM3QkEsS0FBS0E7b0NBQWtCQTtvQ0FBVUE7Z0NBQ2pDQSxLQUFLQTtvQ0FBb0JBO29DQUFVQTtnQ0FDbkNBLEtBQUtBO29DQUFvQkE7b0NBQVVBO2dDQUNuQ0EsS0FBS0E7b0NBQXNCQTtvQ0FBVUE7Z0NBQ3JDQSxLQUFLQTtvQ0FBZ0JBO29DQUFVQTtnQ0FFL0JBLEtBQUtBO2dDQUNMQSxLQUFLQTtvQ0FDREEsYUFBT0EsdUNBQWNBLG1CQUFtQkE7b0NBQ3hDQSxhQUFPQTtvQ0FDUEE7Z0NBQ0pBLEtBQUtBO29DQUNEQTtvQ0FDQUEsYUFBT0EsdUNBQWNBLG1CQUFtQkE7b0NBQ3hDQSxhQUFPQTtvQ0FDUEE7Z0NBQ0pBO29DQUFTQTs7Ozs7OztxQkFHakJBLE9BQU9BOzt1Q0FXQ0EsTUFBYUEsUUFBMEJBLFdBQWVBOztvQkFFOURBO3dCQUVJQSxVQUFhQTs7O3dCQUdiQSxXQUFXQTt3QkFDWEEsc0NBQWNBO3dCQUNkQSxXQUFXQTt3QkFDWEEsa0NBQVNBLENBQU1BLEFBQUNBO3dCQUNoQkEsa0NBQVNBLENBQU1BLEFBQUNBO3dCQUNoQkEsV0FBV0E7d0JBQ1hBO3dCQUNBQSxrQ0FBU0EsQ0FBTUE7d0JBQ2ZBLFdBQVdBO3dCQUNYQSxrQ0FBU0EsQ0FBTUEsQUFBQ0E7d0JBQ2hCQSxrQ0FBU0EsQ0FBTUEsQUFBQ0E7d0JBQ2hCQSxXQUFXQTs7d0JBRVhBLDBCQUFpQ0E7Ozs7O2dDQUc3QkEsV0FBV0E7Z0NBQ1hBLFVBQVVBLHVDQUFlQTtnQ0FDekJBLG1DQUFXQSxLQUFLQTtnQ0FDaEJBLFdBQVdBOztnQ0FFWEEsMkJBQTZCQTs7Ozt3Q0FFekJBLGFBQWFBLHNDQUFjQSxrQkFBa0JBO3dDQUM3Q0EsV0FBV0EsUUFBUUE7O3dDQUVuQkEsSUFBSUEscUJBQW9CQSx1Q0FDcEJBLHFCQUFvQkEsdUNBQ3BCQSxxQkFBb0JBOzRDQUVwQkEsa0NBQVNBOzs0Q0FJVEEsa0NBQVNBLENBQU1BLEFBQUNBLHFCQUFtQkE7O3dDQUV2Q0EsV0FBV0E7O3dDQUVYQSxJQUFJQSxxQkFBb0JBOzRDQUVwQkEsa0NBQVNBOzRDQUNUQSxrQ0FBU0E7NENBQ1RBLFdBQVdBOytDQUVWQSxJQUFJQSxxQkFBb0JBOzRDQUV6QkEsa0NBQVNBOzRDQUNUQSxrQ0FBU0E7NENBQ1RBLFdBQVdBOytDQUVWQSxJQUFJQSxxQkFBb0JBOzRDQUV6QkEsa0NBQVNBOzRDQUNUQSxrQ0FBU0E7NENBQ1RBLFdBQVdBOytDQUVWQSxJQUFJQSxxQkFBb0JBOzRDQUV6QkEsa0NBQVNBOzRDQUNUQSxrQ0FBU0E7NENBQ1RBLFdBQVdBOytDQUVWQSxJQUFJQSxxQkFBb0JBOzRDQUV6QkEsa0NBQVNBOzRDQUNUQSxXQUFXQTsrQ0FFVkEsSUFBSUEscUJBQW9CQTs0Q0FFekJBLGtDQUFTQTs0Q0FDVEEsV0FBV0E7K0NBRVZBLElBQUlBLHFCQUFvQkE7NENBRXpCQSxrQ0FBU0EsQ0FBTUEsQUFBQ0E7NENBQ2hCQSxrQ0FBU0EsQ0FBTUEsQUFBQ0E7NENBQ2hCQSxXQUFXQTsrQ0FFVkEsSUFBSUEscUJBQW9CQTs0Q0FFekJBLGFBQWFBLHNDQUFjQSxtQkFBbUJBOzRDQUM5Q0Esa0JBQVdBLGlCQUFpQkEsS0FBS0EsUUFBUUE7NENBQ3pDQSxXQUFXQSxRQUFRQSxXQUFTQTsrQ0FFM0JBLElBQUlBLHFCQUFvQkE7NENBRXpCQSxjQUFhQSxzQ0FBY0EsbUJBQW1CQTs0Q0FDOUNBLGtCQUFXQSxpQkFBaUJBLEtBQUtBLFNBQVFBOzRDQUN6Q0EsV0FBV0EsUUFBUUEsWUFBU0E7K0NBRTNCQSxJQUFJQSxxQkFBb0JBLHFDQUFhQSxxQkFBb0JBOzRDQUUxREEsa0NBQVNBOzRDQUNUQTs0Q0FDQUEsa0NBQVNBLENBQU1BLEFBQUNBLENBQUNBOzRDQUNqQkEsa0NBQVNBLENBQU1BLEFBQUNBLENBQUNBOzRDQUNqQkEsa0NBQVNBLENBQU1BLEFBQUNBOzRDQUNoQkEsV0FBV0E7K0NBRVZBLElBQUlBLHFCQUFvQkE7NENBRXpCQSxrQ0FBU0E7NENBQ1RBLGNBQWFBLHVDQUFjQSxtQkFBbUJBOzRDQUM5Q0Esa0JBQVdBLGlCQUFpQkEsS0FBS0EsU0FBUUE7NENBQ3pDQSxXQUFXQSxRQUFRQSxZQUFTQTs7Ozs7Ozs7Ozs7Ozt5QkFJeENBO3dCQUNBQTs7Ozs7Ozs0QkFJQUE7Ozs7OzsyQ0FNeUNBOztvQkFFN0NBLGNBQTRCQSxrQkFBb0JBO29CQUNoREEsS0FBS0Esa0JBQWtCQSxXQUFXQSxpQkFBaUJBO3dCQUUvQ0EsaUJBQTZCQSw0QkFBU0EsVUFBVEE7d0JBQzdCQSxnQkFBNEJBLEtBQUlBLG9FQUFnQkE7d0JBQ2hEQSwyQkFBUUEsVUFBUkEsWUFBb0JBO3dCQUNwQkEsMEJBQTZCQTs7OztnQ0FFekJBLGNBQWNBOzs7Ozs7O29CQUd0QkEsT0FBT0E7OzRDQUkrQkE7b0JBRXRDQSxhQUFtQkEsSUFBSUE7b0JBQ3ZCQTtvQkFDQUE7b0JBQ0FBO29CQUNBQSxtQkFBbUJBO29CQUNuQkEsbUJBQW1CQTtvQkFDbkJBO29CQUNBQSxlQUFlQTtvQkFDZkEsT0FBT0E7OytDQVNTQSxXQUEyQkE7O29CQUUzQ0EsMEJBQTZCQTs7Ozs0QkFFekJBLElBQUlBLENBQUNBLHFCQUFvQkEsMEJBQ3JCQSxDQUFDQSxtQkFBa0JBLHdCQUNuQkEsQ0FBQ0Esc0JBQXFCQTs7Z0NBR3RCQSxzQkFBc0JBO2dDQUN0QkE7Ozs7Ozs7cUJBR1JBLGNBQWNBOzs0Q0FTREEsTUFBd0JBOztvQkFFckNBLGNBQTRCQSxrQkFBb0JBO29CQUNoREEsS0FBS0Esa0JBQWtCQSxXQUFXQSxhQUFhQTt3QkFFM0NBLGFBQXlCQSx3QkFBS0EsVUFBTEE7d0JBQ3pCQSxnQkFBNEJBLEtBQUlBLG9FQUFnQkE7d0JBQ2hEQSwyQkFBUUEsVUFBUkEsWUFBb0JBOzt3QkFFcEJBO3dCQUNBQSwwQkFBNkJBOzs7OztnQ0FHekJBLElBQUlBLG1CQUFtQkE7b0NBRW5CQSxJQUFJQSxxQkFBb0JBLHVDQUNwQkEscUJBQW9CQTs7OzJDQUtuQkEsSUFBSUEscUJBQW9CQTt3Q0FFekJBO3dDQUNBQSw0Q0FBb0JBLFdBQVdBOzt3Q0FJL0JBO3dDQUNBQSxjQUFjQTs7dUNBR2pCQSxJQUFJQSxDQUFDQTtvQ0FFTkEsbUJBQW1CQSxDQUFDQSxxQkFBbUJBO29DQUN2Q0EsY0FBY0E7b0NBQ2RBOztvQ0FJQUEsY0FBY0E7Ozs7Ozs7O29CQUkxQkEsT0FBT0E7O3FDQThRREEsUUFBd0JBOztvQkFFOUJBLDBCQUE0QkE7Ozs7NEJBRXhCQSwyQkFBMEJBOzs7O29DQUV0QkEsbUNBQWtCQTs7Ozs7Ozs7Ozs7OztxQ0FPcEJBLFFBQXdCQTs7b0JBRTlCQSwwQkFBNEJBOzs7OzRCQUV4QkEsMkJBQTBCQTs7OztvQ0FFdEJBLDZCQUFlQTtvQ0FDZkEsSUFBSUE7d0NBRUFBOzs7Ozs7Ozs7Ozs7Ozs0Q0FnQkNBLE9BQXNCQSxZQUFnQkEsWUFDdENBLFdBQWVBLFNBQWFBLE1BQWNBOztvQkFHdkRBLFFBQVFBO29CQUNSQSxJQUFJQSxjQUFZQSxtQkFBYUE7d0JBRXpCQSxVQUFVQSxhQUFZQTs7O29CQUcxQkEsT0FBT0EsSUFBSUEsZUFBZUEsY0FBTUEsZUFBZUE7d0JBRTNDQSxJQUFJQSxjQUFNQSxhQUFhQTs0QkFFbkJBOzRCQUNBQTs7d0JBRUpBLElBQUlBLGdCQUFNQSxlQUFlQSxtQkFBYUE7NEJBRWxDQTs0QkFDQUE7O3dCQUVKQSxJQUFJQSxTQUFPQSxjQUFNQTs0QkFFYkEsU0FBT0EsY0FBTUE7O3dCQUVqQkEsSUFBSUEsUUFBTUEsY0FBTUE7NEJBRVpBLFFBQU1BLGNBQU1BOzt3QkFFaEJBOzs7aURBTWNBLE9BQXNCQSxZQUFnQkEsV0FDdENBLE1BQWNBOztvQkFHaENBLFFBQVFBOztvQkFFUkEsT0FBT0EsY0FBTUEsZUFBZUE7d0JBRXhCQTs7O29CQUdKQSxPQUFPQSxJQUFJQSxlQUFlQSxjQUFNQSxpQkFBZ0JBO3dCQUU1Q0EsSUFBSUEsU0FBT0EsY0FBTUE7NEJBRWJBLFNBQU9BLGNBQU1BOzt3QkFFakJBLElBQUlBLFFBQU1BLGNBQU1BOzRCQUVaQSxRQUFNQSxjQUFNQTs7d0JBRWhCQTs7O3NDQVdpQ0EsT0FBaUJBOztvQkFFdERBLFlBQXVCQTtvQkFDdkJBLFlBQVlBOztvQkFFWkEsVUFBZ0JBLElBQUlBO29CQUNwQkEsYUFBbUJBLElBQUlBO29CQUN2QkEsYUFBeUJBLEtBQUlBO29CQUM3QkEsV0FBV0E7b0JBQU1BLFdBQVdBOztvQkFFNUJBLElBQUlBO3dCQUNBQSxPQUFPQTs7O29CQUVYQTtvQkFDQUE7b0JBQ0FBOztvQkFFQUEsMEJBQTBCQTs7Ozs0QkFFdEJBOzs0QkFFQUEsYUFBYUE7NEJBQ2JBLFNBQU9BLFNBQU1BLGVBQVlBLGNBQVdBOzs0QkFFcENBLE9BQU9BLGNBQU1BLHNCQUFzQkE7Z0NBRS9CQTs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFnQkpBLHlDQUFpQkEsT0FBT0EsWUFBWUEsWUFBWUEsZ0JBQWdCQSxjQUMzQ0EsTUFBVUE7NEJBQy9CQSw4Q0FBc0JBLE9BQU9BLFlBQVlBLGdCQUNmQSxXQUFlQTs7NEJBRXpDQSxJQUFJQSxnQkFBWUEscUJBQWVBLFdBQVNBO2dDQUVwQ0EsSUFBSUEsZ0JBQVlBLGdCQUFVQSxXQUFTQTtvQ0FFL0JBLFlBQVlBOztvQ0FJWkEsZUFBZUE7O21DQUdsQkEsSUFBSUEsV0FBT0EscUJBQWVBLFdBQVNBO2dDQUVwQ0EsSUFBSUEsV0FBT0EsZ0JBQVVBLFdBQVNBO29DQUUxQkEsWUFBWUE7O29DQUlaQSxlQUFlQTs7bUNBR2xCQSxJQUFJQSxnQkFBWUE7Z0NBRWpCQSxJQUFJQSxnQkFBWUEsZ0JBQVVBLFdBQVNBO29DQUUvQkEsWUFBWUE7O29DQUlaQSxlQUFlQTs7bUNBR2xCQSxJQUFJQSxXQUFPQTtnQ0FFWkEsSUFBSUEsV0FBT0EsZ0JBQVVBLFdBQVNBO29DQUUxQkEsWUFBWUE7O29DQUlaQSxlQUFlQTs7O2dDQUtuQkEsSUFBSUEsYUFBV0EsZ0JBQVVBLFdBQVNBO29DQUU5QkEsWUFBWUE7O29DQUlaQSxlQUFlQTs7Ozs7Ozs0QkFPdkJBLElBQUlBLFdBQU9BO2dDQUVQQSxXQUFXQTtnQ0FDWEEsVUFBVUE7Ozs7Ozs7O29CQUlsQkEsaUJBQWVBO29CQUNmQSxvQkFBa0JBOztvQkFFbEJBLE9BQU9BOztnREFRa0NBOzs7b0JBR3pDQSxhQUFtQkEsSUFBSUE7O29CQUV2QkEsSUFBSUE7d0JBRUFBLE9BQU9BOzJCQUVOQSxJQUFJQTt3QkFFTEEsWUFBa0JBO3dCQUNsQkEsMEJBQTBCQTs7OztnQ0FFdEJBLGVBQWVBOzs7Ozs7eUJBRW5CQSxPQUFPQTs7O29CQUdYQSxnQkFBa0JBO29CQUNsQkEsZ0JBQWtCQTs7b0JBRWxCQSxLQUFLQSxrQkFBa0JBLFdBQVdBLGNBQWNBO3dCQUU1Q0EsNkJBQVVBLFVBQVZBO3dCQUNBQSw2QkFBVUEsVUFBVkEsY0FBc0JBLGVBQU9BOztvQkFFakNBLGVBQW9CQTtvQkFDcEJBO3dCQUVJQSxpQkFBc0JBO3dCQUN0QkEsa0JBQWtCQTt3QkFDbEJBLEtBQUtBLG1CQUFrQkEsWUFBV0EsY0FBY0E7NEJBRTVDQSxhQUFrQkEsZUFBT0E7NEJBQ3pCQSxJQUFJQSw2QkFBVUEsV0FBVkEsZUFBdUJBLDZCQUFVQSxXQUFWQTtnQ0FFdkJBOzs0QkFFSkEsWUFBZ0JBLHFCQUFZQSw2QkFBVUEsV0FBVkE7NEJBQzVCQSxJQUFJQSxjQUFjQTtnQ0FFZEEsYUFBYUE7Z0NBQ2JBLGNBQWNBO21DQUViQSxJQUFJQSxrQkFBaUJBO2dDQUV0QkEsYUFBYUE7Z0NBQ2JBLGNBQWNBO21DQUViQSxJQUFJQSxvQkFBa0JBLHdCQUF3QkEsZUFBY0E7Z0NBRTdEQSxhQUFhQTtnQ0FDYkEsY0FBY0E7Ozt3QkFHdEJBLElBQUlBLGNBQWNBOzs0QkFHZEE7O3dCQUVKQSw2QkFBVUEsYUFBVkEsNENBQVVBLGFBQVZBO3dCQUNBQSxJQUFJQSxDQUFDQSxZQUFZQSxTQUFTQSxDQUFDQSx1QkFBc0JBLHlCQUM3Q0EsQ0FBQ0Esb0JBQW1CQTs7OzRCQUlwQkEsSUFBSUEsc0JBQXNCQTtnQ0FFdEJBLG9CQUFvQkE7Ozs0QkFLeEJBLGVBQWVBOzRCQUNmQSxXQUFXQTs7OztvQkFJbkJBLE9BQU9BOzs4Q0FZc0NBLFFBQXdCQTs7b0JBRXJFQSxhQUFtQkEsNkNBQXFCQTtvQkFDeENBLGFBQXlCQSxtQ0FBV0EsUUFBUUE7O29CQUU1Q0EsYUFBeUJBLEtBQUlBO29CQUM3QkEsMEJBQTRCQTs7Ozs0QkFFeEJBLElBQUlBLGdCQUFnQkE7Z0NBRWhCQSxnQkFBZ0JBOzs7Ozs7O3FCQUd4QkEsSUFBSUE7d0JBRUFBLGNBQVlBO3dCQUNaQSwyQkFBbUJBOzs7b0JBR3ZCQSxPQUFPQTs7MkNBT3lCQTs7b0JBRWhDQSwwQkFBNEJBOzs7OzRCQUV4QkEsZUFBZUE7NEJBQ2ZBLDJCQUEwQkE7Ozs7b0NBRXRCQSxJQUFJQSxpQkFBaUJBO3dDQUVqQkEsTUFBTUEsSUFBSUE7O29DQUVkQSxXQUFXQTs7Ozs7Ozs7Ozs7OzsyQ0FxQlBBLFFBQXdCQSxVQUFjQTs7O29CQUdsREEsaUJBQXVCQSxLQUFJQTtvQkFDM0JBLDBCQUE0QkE7Ozs7NEJBRXhCQSwyQkFBMEJBOzs7O29DQUV0QkEsZUFBZUE7Ozs7Ozs7Ozs7OztxQkFHdkJBOzs7b0JBR0FBLGVBQWVBLDREQUFlQSxrQkFBa0JBOzs7b0JBR2hEQSxLQUFLQSxXQUFXQSxJQUFJQSw4QkFBc0JBO3dCQUV0Q0EsSUFBSUEscUJBQVdBLGlCQUFTQSxtQkFBV0EsWUFBTUE7NEJBRXJDQSxtQkFBV0EsZUFBU0EsbUJBQVdBOzs7O29CQUl2Q0Esd0NBQWdCQTs7O29CQUdoQkEsMkJBQTRCQTs7Ozs0QkFFeEJBOzs0QkFFQUEsMkJBQTBCQTs7OztvQ0FFdEJBLE9BQU9BLEtBQUlBLG9CQUNKQSxvQkFBaUJBLGlCQUFXQSxtQkFBV0E7d0NBRTFDQTs7O29DQUdKQSxJQUFJQSxrQkFBaUJBLG1CQUFXQSxPQUM1QkEsb0JBQWlCQSxtQkFBV0EsYUFBTUE7O3dDQUdsQ0Esa0JBQWlCQSxtQkFBV0E7Ozs7Ozs7NkJBR3BDQSxvQkFBaUJBOzs7Ozs7OzBDQWVWQSxRQUF3QkE7OztvQkFHbkNBLDBCQUE0QkE7Ozs7NEJBRXhCQSxlQUFvQkE7NEJBQ3BCQSxLQUFLQSxXQUFXQSxJQUFJQSwrQkFBdUJBO2dDQUV2Q0EsWUFBaUJBLG9CQUFZQTtnQ0FDN0JBLElBQUlBLFlBQVlBO29DQUVaQSxXQUFXQTs7OztnQ0FJZkEsWUFBaUJBO2dDQUNqQkEsS0FBS0EsUUFBUUEsYUFBT0EsSUFBSUEsbUJBQW1CQTtvQ0FFdkNBLFFBQVFBLG9CQUFZQTtvQ0FDcEJBLElBQUlBLGtCQUFrQkE7d0NBRWxCQTs7O2dDQUdSQSxrQkFBa0JBLG1CQUFrQkE7O2dDQUVwQ0E7Z0NBQ0FBLElBQUlBLGVBQWVBO29DQUNmQSxNQUFNQTs7b0NBQ0xBLElBQUlBLDBDQUFtQkE7d0NBQ3hCQSxNQUFNQTs7d0NBQ0xBLElBQUlBLDBDQUFtQkE7NENBQ3hCQSxNQUFNQTs7NENBQ0xBLElBQUlBLDBDQUFtQkE7Z0RBQ3hCQSxNQUFNQTs7Ozs7OztnQ0FHVkEsSUFBSUEsTUFBTUE7b0NBRU5BLE1BQU1BOzs7Ozs7O2dDQU9WQSxJQUFJQSxDQUFDQSx1QkFBcUJBLDRCQUFxQkEsb0JBQzNDQSxDQUFDQSxzQkFBcUJBOztvQ0FHdEJBLE1BQU1BOztnQ0FFVkEsaUJBQWlCQTtnQ0FDakJBLElBQUlBLG9CQUFZQSw2QkFBb0JBO29DQUVoQ0EsV0FBV0E7Ozs7Ozs7Ozt5Q0FVYkEsV0FBcUJBOzs7O29CQUkvQkEseUJBQTJCQTtvQkFDM0JBLDBCQUE2QkE7Ozs7NEJBRXpCQSxJQUFJQSxxQkFBb0JBO2dDQUVwQkEsc0NBQW1CQSxnQkFBbkJBLHVCQUFxQ0E7Ozs7Ozs7cUJBRzdDQTs7b0JBRUFBLGFBQXlCQSxLQUFJQTtvQkFDN0JBLDJCQUEwQkE7Ozs7NEJBRXRCQTs0QkFDQUEsMkJBQTRCQTs7OztvQ0FFeEJBLElBQUlBLGlCQUFnQkE7d0NBRWhCQTt3Q0FDQUEsY0FBY0E7Ozs7Ozs7NkJBR3RCQSxJQUFJQSxDQUFDQTtnQ0FFREEsYUFBa0JBLElBQUlBLGdDQUFVQTtnQ0FDaENBLGVBQWNBO2dDQUNkQSxvQkFBbUJBLHNDQUFtQkEsY0FBbkJBO2dDQUNuQkEsV0FBV0E7Ozs7Ozs7cUJBR25CQSxJQUFJQSxvQkFBb0JBO3dCQUVwQkEsMkJBQWlDQTs7OztnQ0FFN0JBLDJCQUE0QkE7Ozs7d0NBRXhCQSxJQUFJQSx1QkFBc0JBOzRDQUV0QkEsZ0JBQWVBOzs7Ozs7Ozs7Ozs7OztvQkFLL0JBLE9BQU9BOzs7Ozs7Ozs7Ozs7Ozs7OztvQkFqOENEQSxPQUFPQTs7Ozs7b0JBTVBBLE9BQU9BOzs7OztvQkFNUEEsT0FBT0E7Ozs7O29CQU1QQSxPQUFPQTs7Ozs7NEJBcUJEQSxNQUFhQTs7Z0JBRXpCQTtnQkFDQUEsSUFBSUEscUNBQXNCQSxNQUFVQTtvQkFFaENBLE9BQU9BLG1CQUFjQTs7O2dCQUd6QkEsV0FBc0JBLElBQUlBLDhCQUFlQTtnQkFDekNBLElBQUlBLFNBQVNBO29CQUNUQTs7Z0JBQ0pBLFdBQU1BLE1BQU1BOzs7O2lDQTdHU0E7Z0JBRXJCQSxJQUFJQSxNQUFNQSx3Q0FBZ0JBLEtBQUtBO29CQUMzQkE7O29CQUNDQSxJQUFJQSxNQUFNQSx1Q0FBZUEsS0FBS0E7d0JBQy9CQTs7d0JBQ0NBLElBQUlBLE1BQU1BLDRDQUFvQkEsS0FBS0E7NEJBQ3BDQTs7NEJBQ0NBLElBQUlBLE1BQU1BLDhDQUFzQkEsS0FBS0E7Z0NBQ3RDQTs7Z0NBQ0NBLElBQUlBLE1BQU1BLDhDQUFzQkEsS0FBS0E7b0NBQ3RDQTs7b0NBQ0NBLElBQUlBLE1BQU1BLGdEQUF3QkEsS0FBS0E7d0NBQ3hDQTs7d0NBQ0NBLElBQUlBLE1BQU1BLDBDQUFrQkEsS0FBS0E7NENBQ2xDQTs7NENBQ0NBLElBQUlBLE9BQU1BO2dEQUNYQTs7Z0RBQ0NBLElBQUlBLE9BQU1BLHVDQUFlQSxPQUFNQTtvREFDaENBOztvREFFQUE7Ozs7Ozs7Ozs7O2dDQUlnQkE7Z0JBRXBCQSxJQUFJQSxPQUFNQTtvQkFDTkE7O29CQUNDQSxJQUFJQSxPQUFNQTt3QkFDWEE7O3dCQUNDQSxJQUFJQSxPQUFNQTs0QkFDWEE7OzRCQUNDQSxJQUFJQSxPQUFNQTtnQ0FDWEE7O2dDQUNDQSxJQUFJQSxPQUFNQTtvQ0FDWEE7O29DQUNDQSxJQUFJQSxPQUFNQTt3Q0FDWEE7O3dDQUNDQSxJQUFJQSxPQUFNQTs0Q0FDWEE7OzRDQUNDQSxJQUFJQSxPQUFNQTtnREFDWEE7O2dEQUNDQSxJQUFJQSxPQUFNQTtvREFDWEE7O29EQUNDQSxJQUFJQSxPQUFNQTt3REFDWEE7O3dEQUNDQSxJQUFJQSxPQUFNQTs0REFDWEE7OzREQUNDQSxJQUFJQSxPQUFNQTtnRUFDWEE7O2dFQUVBQTs7Ozs7Ozs7Ozs7Ozs7cUNBNEJxQkE7Z0JBRXpCQSxlQUFlQSx5Q0FBMEJBO2dCQUN6Q0EsSUFBSUE7b0JBRUFBLE9BQU9BOztnQkFFWEEsT0FBT0EsY0FBY0EsQUFBd0NBLFVBQUNBLE1BQU1BLFFBQVFBO29CQUV4RUEsSUFBSUEsQ0FBQ0EsVUFBVUE7d0JBRVhBLE9BQU9BOzs7b0JBRVZBOztnQkFDTEEsT0FBT0E7OzZCQXlCT0EsTUFBcUJBOztnQkFFbkNBO2dCQUNBQTs7Z0JBRUFBLGdCQUFnQkE7Z0JBQ2hCQSxjQUFTQSxLQUFJQTtnQkFDYkE7O2dCQUVBQSxLQUFLQTtnQkFDTEEsSUFBSUE7b0JBRUFBLE1BQU1BLElBQUlBOztnQkFFZEEsTUFBTUE7Z0JBQ05BLElBQUlBO29CQUVBQSxNQUFNQSxJQUFJQTs7Z0JBRWRBLGlCQUFZQTtnQkFDWkEsaUJBQWlCQTtnQkFDakJBLG1CQUFjQTs7Z0JBRWRBLGNBQVNBLGtCQUFvQkE7Z0JBQzdCQSxLQUFLQSxrQkFBa0JBLFdBQVdBLFlBQVlBO29CQUUxQ0EsK0JBQU9BLFVBQVBBLGdCQUFtQkEsZUFBVUE7b0JBQzdCQSxZQUFrQkEsSUFBSUEsOEJBQVVBLCtCQUFPQSxVQUFQQSxlQUFrQkE7b0JBQ2xEQSxJQUFJQSx5QkFBeUJBLGdCQUFnQkE7d0JBRXpDQSxnQkFBV0E7Ozs7O2dCQUtuQkEsMEJBQTRCQTs7Ozt3QkFFeEJBLFdBQWdCQSxxQkFBWUE7d0JBQzVCQSxJQUFJQSxtQkFBbUJBLG1CQUFpQkE7NEJBRXBDQSxtQkFBbUJBLGtCQUFpQkE7Ozs7Ozs7Ozs7O2dCQU81Q0EsSUFBSUEsMkJBQXFCQSw0Q0FBb0JBO29CQUV6Q0EsY0FBU0Esc0NBQWNBLHdCQUFXQSwrQkFBT0EsK0JBQVBBO29CQUNsQ0E7OztnQkFHSkEsd0NBQWdCQTs7O2dCQUdoQkE7Z0JBQ0FBO2dCQUNBQTtnQkFDQUEsMkJBQWlDQTs7Ozt3QkFFN0JBLDJCQUE2QkE7Ozs7Z0NBRXpCQSxJQUFJQSxxQkFBb0JBLDBDQUFrQkE7b0NBRXRDQSxRQUFRQTs7Z0NBRVpBLElBQUlBLHFCQUFvQkEsa0RBQTBCQTtvQ0FFOUNBLFFBQVFBO29DQUNSQSxRQUFRQTs7Ozs7Ozs7Ozs7OztpQkFJcEJBLElBQUlBO29CQUVBQTs7Z0JBRUpBLElBQUlBO29CQUVBQTtvQkFBV0E7O2dCQUVmQSxlQUFVQSxJQUFJQSw2QkFBY0EsT0FBT0EsT0FBT0Esa0JBQWFBOztpQ0FRekJBO2dCQUU5QkEsYUFBeUJBLEtBQUlBO2dCQUM3QkE7Z0JBQ0FBLFNBQVlBOztnQkFFWkEsSUFBSUE7b0JBRUFBLE1BQU1BLElBQUlBLG9EQUFxQ0E7O2dCQUVuREEsZUFBZUE7Z0JBQ2ZBLGVBQWVBLFlBQVdBOztnQkFFMUJBOztnQkFFQUEsT0FBT0EsbUJBQW1CQTs7Ozs7b0JBTXRCQTtvQkFDQUE7b0JBQ0FBO3dCQUVJQSxjQUFjQTt3QkFDZEEsWUFBWUE7d0JBQ1pBLHlCQUFhQTt3QkFDYkEsWUFBWUE7Ozs7Ozs7NEJBSVpBLE9BQU9BOzs7Ozs7b0JBR1hBLGFBQW1CQSxJQUFJQTtvQkFDdkJBLFdBQVdBO29CQUNYQSxtQkFBbUJBO29CQUNuQkEsbUJBQW1CQTs7b0JBRW5CQSxJQUFJQSxhQUFhQTt3QkFFYkE7d0JBQ0FBLFlBQVlBOzs7Ozs7O29CQU9oQkEsSUFBSUEsYUFBYUEsdUNBQWVBLFlBQVlBO3dCQUV4Q0EsbUJBQW1CQTt3QkFDbkJBLGlCQUFpQkEsQ0FBTUEsQUFBQ0EsY0FBWUE7d0JBQ3BDQSxvQkFBb0JBO3dCQUNwQkEsa0JBQWtCQTsyQkFFakJBLElBQUlBLGFBQWFBLHdDQUFnQkEsWUFBWUE7d0JBRTlDQSxtQkFBbUJBO3dCQUNuQkEsaUJBQWlCQSxDQUFNQSxBQUFDQSxjQUFZQTt3QkFDcENBLG9CQUFvQkE7d0JBQ3BCQSxrQkFBa0JBOzJCQUVqQkEsSUFBSUEsYUFBYUEsNENBQ2JBLFlBQVlBO3dCQUVqQkEsbUJBQW1CQTt3QkFDbkJBLGlCQUFpQkEsQ0FBTUEsQUFBQ0EsY0FBWUE7d0JBQ3BDQSxvQkFBb0JBO3dCQUNwQkEscUJBQXFCQTsyQkFFcEJBLElBQUlBLGFBQWFBLDhDQUNiQSxZQUFZQTt3QkFFakJBLG1CQUFtQkE7d0JBQ25CQSxpQkFBaUJBLENBQU1BLEFBQUNBLGNBQVlBO3dCQUNwQ0Esb0JBQW9CQTt3QkFDcEJBLHNCQUFzQkE7MkJBRXJCQSxJQUFJQSxhQUFhQSw4Q0FDYkEsWUFBWUE7d0JBRWpCQSxtQkFBbUJBO3dCQUNuQkEsaUJBQWlCQSxDQUFNQSxBQUFDQSxjQUFZQTt3QkFDcENBLG9CQUFvQkE7MkJBRW5CQSxJQUFJQSxhQUFhQSxnREFDYkEsWUFBWUE7d0JBRWpCQSxtQkFBbUJBO3dCQUNuQkEsaUJBQWlCQSxDQUFNQSxBQUFDQSxjQUFZQTt3QkFDcENBLHNCQUFzQkE7MkJBRXJCQSxJQUFJQSxhQUFhQSwwQ0FDYkEsWUFBWUE7d0JBRWpCQSxtQkFBbUJBO3dCQUNuQkEsaUJBQWlCQSxDQUFNQSxBQUFDQSxjQUFZQTt3QkFDcENBLG1CQUFtQkE7MkJBRWxCQSxJQUFJQSxjQUFhQTt3QkFFbEJBLG1CQUFtQkE7d0JBQ25CQSxvQkFBb0JBO3dCQUNwQkEsZUFBZUEsZUFBZUE7MkJBRTdCQSxJQUFJQSxjQUFhQTt3QkFFbEJBLG1CQUFtQkE7d0JBQ25CQSxvQkFBb0JBO3dCQUNwQkEsZUFBZUEsZUFBZUE7MkJBRTdCQSxJQUFJQSxjQUFhQTt3QkFFbEJBLG1CQUFtQkE7d0JBQ25CQSxtQkFBbUJBO3dCQUNuQkEsb0JBQW9CQTt3QkFDcEJBLGVBQWVBLGVBQWVBO3dCQUM5QkEsSUFBSUEscUJBQW9CQTs0QkFFcEJBLElBQUlBOzs7O2dDQUtBQSxtQkFBbUJBO2dDQUNuQkEscUJBQXFCQTttQ0FFcEJBLElBQUlBLDBCQUEwQkE7Z0NBRS9CQSxtQkFBbUJBLEFBQU1BO2dDQUN6QkEscUJBQXFCQSxrQkFBTUEsWUFBbUJBOztnQ0FJOUNBLG1CQUFtQkEsQUFBTUE7Z0NBQ3pCQSxxQkFBcUJBLGtCQUFNQSxZQUFtQkE7OytCQUdqREEsSUFBSUEscUJBQW9CQTs0QkFFekJBLElBQUlBO2dDQUVBQSxNQUFNQSxJQUFJQSxpQ0FDUkEsNkJBQTZCQSw2QkFDcEJBOzs0QkFFZkEsZUFBZUEsQ0FBQ0EsQ0FBQ0EsMkRBQXlCQSxDQUFDQSwwREFBd0JBOytCQUVsRUEsSUFBSUEscUJBQW9CQTs7Ozt3QkFPN0JBLE1BQU1BLElBQUlBLGlDQUFrQkEsbUJBQW1CQSxrQkFDbEJBOzs7O2dCQUlyQ0EsT0FBT0E7O21DQTJWYUEsVUFBaUJBO2dCQUVyQ0EsT0FBT0EsYUFBTUEsVUFBVUE7OytCQUdUQSxVQUFpQkE7Z0JBRS9CQTtvQkFFSUE7b0JBQ0FBLFNBQVNBLElBQUlBLDBCQUFXQSxVQUFVQTtvQkFDbENBLGFBQWNBLFdBQU1BLFFBQVFBO29CQUM1QkE7b0JBQ0FBLE9BQU9BOzs7Ozs7O3dCQUlQQTs7Ozs7OzZCQVNVQSxRQUFlQTtnQkFFN0JBLGdCQUE4QkE7Z0JBQzlCQSxJQUFJQSxXQUFXQTtvQkFFWEEsWUFBWUEsMEJBQXFCQTs7Z0JBRXJDQSxPQUFPQSxvQ0FBWUEsUUFBUUEsV0FBV0EsZ0JBQVdBOzs0Q0FZaENBOztnQkFFakJBO2dCQUNBQSxJQUFJQTtvQkFFQUEsT0FBT0EsNEJBQXVCQTs7Ozs7Ozs7O2dCQVNsQ0EsaUJBQWlCQTtnQkFDakJBLGtCQUFvQkEsa0JBQVFBO2dCQUM1QkEsaUJBQW9CQSxrQkFBU0E7Z0JBQzdCQSxLQUFLQSxPQUFPQSxJQUFJQSxZQUFZQTtvQkFFeEJBLCtCQUFZQSxHQUFaQTtvQkFDQUEsOEJBQVdBLEdBQVhBOztnQkFFSkEsS0FBS0Esa0JBQWtCQSxXQUFXQSxtQkFBY0E7b0JBRTVDQSxZQUFrQkEsb0JBQU9BO29CQUN6QkEsZ0JBQWdCQTtvQkFDaEJBLCtCQUFZQSxXQUFaQSxnQkFBeUJBLHVDQUFvQkEsVUFBcEJBO29CQUN6QkEsSUFBSUEsZ0NBQWFBLFVBQWJBO3dCQUVBQSw4QkFBV0EsV0FBWEE7Ozs7Z0JBSVJBLGdCQUE4QkEsd0NBQWdCQTs7O2dCQUc5Q0EsS0FBS0EsbUJBQWtCQSxZQUFXQSxrQkFBa0JBO29CQUVoREEsYUFBbUJBLHlDQUFpQkE7b0JBQ3BDQSw2QkFBVUEsV0FBVkEsc0JBQThCQTs7OztnQkFJbENBLEtBQUtBLG1CQUFrQkEsWUFBV0Esa0JBQWtCQTtvQkFFaERBLDBCQUE2QkEsNkJBQVVBLFdBQVZBOzs7OzRCQUV6QkEsVUFBVUEsc0JBQW9CQTs0QkFDOUJBLElBQUlBO2dDQUNBQTs7NEJBQ0pBLElBQUlBO2dDQUNBQTs7NEJBQ0pBLHFCQUFvQkEsQUFBTUE7NEJBQzFCQSxJQUFJQSxDQUFDQTtnQ0FFREEscUJBQW9CQSxDQUFNQSwrQkFBWUEsV0FBWkE7OzRCQUU5QkEsZ0JBQWVBOzs7Ozs7OztnQkFJdkJBLElBQUlBO29CQUVBQSxZQUFZQSx5Q0FBaUJBLFdBQVdBOzs7O2dCQUk1Q0E7Z0JBQ0FBLEtBQUtBLG1CQUFrQkEsWUFBV0EsbUJBQW1CQTtvQkFFakRBLElBQUlBLDhCQUFXQSxXQUFYQTt3QkFFQUE7OztnQkFHUkEsYUFBMkJBLGtCQUFvQkE7Z0JBQy9DQTtnQkFDQUEsS0FBS0EsbUJBQWtCQSxZQUFXQSxtQkFBbUJBO29CQUVqREEsSUFBSUEsOEJBQVdBLFdBQVhBO3dCQUVBQSwwQkFBT0EsR0FBUEEsV0FBWUEsNkJBQVVBLFdBQVZBO3dCQUNaQTs7O2dCQUdSQSxPQUFPQTs7OENBb0JZQTs7Ozs7Z0JBS25CQSxrQkFBb0JBO2dCQUNwQkEsa0JBQXFCQTtnQkFDckJBLEtBQUtBLFdBQVdBLFFBQVFBO29CQUVwQkEsK0JBQVlBLEdBQVpBO29CQUNBQSwrQkFBWUEsR0FBWkE7O2dCQUVKQSxLQUFLQSxrQkFBa0JBLFdBQVdBLG1CQUFjQTtvQkFFNUNBLFlBQWtCQSxvQkFBT0E7b0JBQ3pCQSxjQUFjQTtvQkFDZEEsK0JBQVlBLFNBQVpBLGdCQUF1QkEsdUNBQW9CQSxVQUFwQkE7b0JBQ3ZCQSxJQUFJQSxnQ0FBYUEsVUFBYkE7d0JBRUFBLCtCQUFZQSxTQUFaQTs7OztnQkFJUkEsZ0JBQThCQSx3Q0FBZ0JBOzs7Z0JBRzlDQSxLQUFLQSxtQkFBa0JBLFlBQVdBLGtCQUFrQkE7b0JBRWhEQSxhQUFtQkEseUNBQWlCQTtvQkFDcENBLDZCQUFVQSxXQUFWQSxzQkFBOEJBOzs7O2dCQUlsQ0EsS0FBS0EsbUJBQWtCQSxZQUFXQSxrQkFBa0JBO29CQUVoREEsMEJBQTZCQSw2QkFBVUEsV0FBVkE7Ozs7NEJBRXpCQSxVQUFVQSxzQkFBb0JBOzRCQUM5QkEsSUFBSUE7Z0NBQ0FBOzs0QkFDSkEsSUFBSUE7Z0NBQ0FBOzs0QkFDSkEscUJBQW9CQSxBQUFNQTs0QkFDMUJBLElBQUlBLENBQUNBLCtCQUFZQSxpQkFBWkE7Z0NBRURBOzs0QkFFSkEsSUFBSUEsQ0FBQ0E7Z0NBRURBLHFCQUFvQkEsQ0FBTUEsK0JBQVlBLGlCQUFaQTs7NEJBRTlCQSxnQkFBZUE7Ozs7Ozs7Z0JBR3ZCQSxJQUFJQTtvQkFFQUEsWUFBWUEseUNBQWlCQSxXQUFXQTs7Z0JBRTVDQSxPQUFPQTs7dUNBTzRCQTtnQkFFbkNBLGdCQUE0QkEsS0FBSUE7O2dCQUVoQ0EsS0FBS0EsZUFBZUEsUUFBUUEsbUJBQWNBO29CQUV0Q0EsSUFBSUEsa0NBQWVBLE9BQWZBO3dCQUVBQSxjQUFjQSxvQkFBT0E7Ozs7Ozs7OztnQkFTN0JBLFdBQXFCQTtnQkFDckJBLElBQUlBLGdCQUFnQkE7b0JBRWhCQSxPQUFPQTs7Z0JBRVhBLHdDQUF5QkEsV0FBV0EseUJBQXlCQTtnQkFDN0RBLHVDQUF3QkEsV0FBV0E7O2dCQUVuQ0EsSUFBSUE7b0JBRUFBLFlBQVlBLDJDQUE0QkEsV0FBV0E7O2dCQUV2REEsSUFBSUE7b0JBRUFBLGtDQUFtQkEsV0FBV0E7O2dCQUVsQ0EsSUFBSUE7b0JBRUFBLGtDQUFtQkEsV0FBV0E7OztnQkFHbENBLE9BQU9BOzs7O2dCQTZqQlBBLGFBQW1CQSxLQUFJQTs7Z0JBRXZCQSx3QkFBd0JBLGtCQUFLQSxBQUFDQSxZQUFZQSxxQkFBZ0JBO2dCQUMxREEsaUJBQWlCQTtnQkFDakJBLGlCQUFpQkE7OztnQkFHakJBLGdCQUFnQkE7Z0JBQ2hCQSwwQkFBNEJBOzs7O3dCQUV4QkEsSUFBSUEsWUFBWUE7NEJBRVpBLFlBQVlBOzs7Ozs7Ozs7Z0JBS3BCQSxlQUFlQSw2REFBMEJBOztnQkFFekNBLDJCQUE0QkE7Ozs7d0JBRXhCQTt3QkFDQUEsMkJBQTBCQTs7OztnQ0FFdEJBLElBQUlBLG1CQUFpQkEsa0JBQVlBO29DQUM3QkE7OztnQ0FFSkEsV0FBV0E7O2dDQUVYQSwwQkFBMEJBLGtCQUFpQkE7OztnQ0FHM0NBLHNCQUFzQkE7Z0NBQ3RCQSxJQUFJQSxzQkFBc0JBO29DQUN0QkE7O2dDQUNKQSxJQUFJQSxzQkFBc0JBO29DQUN0QkE7OztnQ0FFSkEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQTtvQ0FFakJBLFdBQVdBOzs7Ozs7Ozs7Ozs7O2lCQUl2QkE7Z0JBQ0FBLE9BQU9BOzs7O2dCQU1QQTtnQkFDQUEsMEJBQTRCQTs7Ozt3QkFFeEJBLElBQUlBOzRCQUVBQTs7d0JBRUpBLFdBQVdBLG9CQUFZQTt3QkFDdkJBLFlBQVlBLFNBQVNBLE1BQU1BOzs7Ozs7aUJBRS9CQSxPQUFPQTs7OztnQkFNUEEsMEJBQTRCQTs7Ozt3QkFFeEJBLElBQUlBLGdCQUFnQkE7NEJBRWhCQTs7Ozs7OztpQkFHUkE7Ozs7Z0JBS0FBLGFBQWdCQSxzQkFBc0JBLGtDQUE2QkE7Z0JBQ25FQSwyQkFBVUE7Z0JBQ1ZBLDBCQUE0QkE7Ozs7d0JBRXhCQSwyQkFBVUE7Ozs7OztpQkFFZEEsT0FBT0E7Ozs7Ozs7OzRCQ243RFdBLEdBQVVBOztpREFDM0JBLDRCQUFvQkE7Ozs7Ozs7Ozs7OzRCQ3lDUEE7O2dCQUNsQkEsWUFBT0E7Z0JBQ1BBOzs7O2lDQUltQkE7Z0JBQ25CQSxJQUFJQSxzQkFBZUEsZUFBU0E7b0JBQ3hCQSxNQUFNQSxJQUFJQSxzREFBdUNBOzs7O2dCQU1yREE7Z0JBQ0FBLE9BQU9BLDZCQUFLQSxtQkFBTEE7OztnQkFLUEE7Z0JBQ0FBLFFBQVNBLDZCQUFLQSxtQkFBTEE7Z0JBQ1RBO2dCQUNBQSxPQUFPQTs7aUNBSWFBO2dCQUNwQkEsZUFBVUE7Z0JBQ1ZBLGFBQWdCQSxrQkFBU0E7Z0JBQ3pCQSxLQUFLQSxXQUFXQSxJQUFJQSxRQUFRQTtvQkFDeEJBLDBCQUFPQSxHQUFQQSxXQUFZQSw2QkFBS0EsTUFBSUEseUJBQVRBOztnQkFFaEJBLHlDQUFnQkE7Z0JBQ2hCQSxPQUFPQTs7O2dCQUtQQTtnQkFDQUEsUUFBV0EsQ0FBU0EsQUFBRUEsQ0FBQ0EsNkJBQUtBLG1CQUFMQSxvQkFBMkJBLDZCQUFLQSwrQkFBTEE7Z0JBQ2xEQTtnQkFDQUEsT0FBT0E7OztnQkFLUEE7Z0JBQ0FBLFFBQVFBLEFBQUtBLEFBQUVBLENBQUNBLDZCQUFLQSxtQkFBTEEscUJBQTRCQSxDQUFDQSw2QkFBS0EsK0JBQUxBLHFCQUM5QkEsQ0FBQ0EsNkJBQUtBLCtCQUFMQSxvQkFBNkJBLDZCQUFLQSwrQkFBTEE7Z0JBQzdDQTtnQkFDQUEsT0FBT0E7O2lDQUlhQTtnQkFDcEJBLGVBQVVBO2dCQUNWQSxRQUFXQSx1Q0FBOEJBLFdBQU1BLG1CQUFjQTtnQkFDN0RBLHlDQUFnQkE7Z0JBQ2hCQSxPQUFPQTs7O2dCQVFQQTtnQkFDQUE7O2dCQUVBQSxJQUFJQTtnQkFDSkEsU0FBU0EsQ0FBTUEsQUFBQ0E7O2dCQUVoQkEsS0FBS0EsV0FBV0EsT0FBT0E7b0JBQ25CQSxJQUFJQSxDQUFDQTt3QkFDREEsSUFBSUE7d0JBQ0pBLFNBQVNBLHFCQUFNQSxBQUFFQSxjQUFDQSw0QkFBZUEsY0FBQ0E7O3dCQUdsQ0E7OztnQkFHUkEsT0FBT0EsQ0FBS0E7OzRCQUlDQTtnQkFDYkEsZUFBVUE7Z0JBQ1ZBLHlDQUFnQkE7OztnQkFLaEJBLE9BQU9BOzs7Z0JBS1BBLE9BQU9BOzs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JDekdHQSxPQUFPQTs7Ozs7b0JBTVBBLE9BQU9BOzs7b0JBQ1BBLGlCQUFZQTs7Ozs7b0JBS1pBLE9BQU9BLG1CQUFZQTs7Ozs7b0JBS25CQSxPQUFPQTs7O29CQUNQQSxlQUFVQTs7Ozs7b0JBS1ZBLE9BQU9BOzs7b0JBQ1BBLGtCQUFhQTs7Ozs7b0JBS2JBLE9BQU9BOzs7b0JBQ1BBLGdCQUFXQTs7Ozs7b0JBS1hBLE9BQU9BOzs7b0JBQ1BBLGdCQUFXQTs7Ozs7OzRCQWhETEEsSUFBUUEsV0FBZUEsU0FBYUEsWUFBZ0JBLFVBQWNBOztnQkFFOUVBLFVBQVVBO2dCQUNWQSxpQkFBaUJBO2dCQUNqQkEsZUFBZUE7Z0JBQ2ZBLGtCQUFrQkE7Z0JBQ2xCQSxnQkFBZ0JBO2dCQUNoQkEsZ0JBQWdCQTs7OzsrQkErQ0FBO2dCQUVoQkEsZ0JBQVdBLFdBQVVBOzsrQkFNTkEsR0FBWUE7Z0JBRTNCQSxJQUFJQSxnQkFBZUE7b0JBQ2ZBLE9BQU9BLGFBQVdBOztvQkFFbEJBLE9BQU9BLGdCQUFjQTs7OztnQkFNekJBLE9BQU9BLElBQUlBLHdCQUFTQSxTQUFJQSxnQkFBV0EsY0FBU0EsaUJBQVlBLGVBQVVBOzs7Z0JBTWxFQTs7Ozs7Ozs7Ozs7Ozs7Z0JBQ0FBLE9BQU9BLG1GQUNjQSx3Q0FBU0EsMkNBQVlBLHlCQUFNQSxDQUFDQSxtQ0FBUEEsU0FBOEJBLDBDQUFXQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2tDQ2xCeEVBO29CQUNmQSxhQUF1QkEsSUFBSUE7b0JBQzNCQSxLQUFLQSxXQUFXQSxJQUFJQSxlQUFlQTt3QkFDL0JBLElBQUlBOzRCQUNBQTs7d0JBRUpBLGNBQWNBLGtEQUFPQSxHQUFQQTs7b0JBRWxCQSxPQUFPQTs7a0NBR1FBO29CQUNmQSxhQUF1QkEsSUFBSUE7b0JBQzNCQSxLQUFLQSxXQUFXQSxJQUFJQSxlQUFlQTt3QkFDL0JBLElBQUlBOzRCQUNBQTs7d0JBRUpBLGNBQWNBLDBCQUFPQSxHQUFQQTs7b0JBRWxCQSxPQUFPQTs7Z0NBR1FBO29CQUNmQSxhQUF1QkEsSUFBSUE7b0JBQzNCQSxLQUFLQSxXQUFXQSxJQUFJQSxlQUFlQTt3QkFDL0JBLElBQUlBOzRCQUNBQTs7d0JBRUpBLGNBQWNBLHlDQUFjQSwwQkFBT0EsR0FBUEE7O29CQUVoQ0EsT0FBT0E7O3lDQUdpQkE7b0JBQ3hCQSxPQUFPQSxLQUFLQSxZQUFZQSxZQUFZQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OEJBOUVyQkE7O2dCQUNmQSxnQkFBV0E7Z0JBQ1hBLGFBQVFBLGdDQUFpQkE7Z0JBQ3pCQSxnQkFBZ0JBO2dCQUNoQkEsY0FBU0Esa0JBQVNBO2dCQUNsQkEsWUFBUUEsa0JBQVNBO2dCQUNqQkEsbUJBQWNBLGtCQUFRQTtnQkFDdEJBLEtBQUtBLFdBQVdBLElBQUlBLG9CQUFlQTtvQkFDL0JBLCtCQUFPQSxHQUFQQTtvQkFDQUEsNkJBQUtBLEdBQUxBO29CQUNBQSxvQ0FBWUEsR0FBWkEscUJBQWlCQSx3QkFBZ0JBO29CQUNqQ0EsSUFBSUEsK0NBQWdCQTt3QkFDaEJBLCtCQUFPQSxHQUFQQTt3QkFDQUEsNkJBQUtBLEdBQUxBOzs7Z0JBR1JBO2dCQUNBQTtnQkFDQUE7Z0JBQ0FBLElBQUlBO29CQUNBQTs7b0JBR0FBOztnQkFFSkEsdUJBQWtCQTtnQkFDbEJBO2dCQUNBQTtnQkFDQUE7Z0JBQ0FBO2dCQUNBQSxXQUFNQTtnQkFDTkEsWUFBT0E7Z0JBQ1BBLGNBQVNBO2dCQUNUQSxrQkFBYUE7Z0JBQ2JBLG1CQUFjQTtnQkFDZEE7Z0JBQ0FBLGFBQVFBO2dCQUNSQTtnQkFDQUE7Z0JBQ0FBO2dCQUNBQSw2QkFBd0JBLG9DQUFxQkE7Ozs7NkJBMkMvQkE7Z0JBQ2RBLElBQUlBLGdCQUFnQkEsUUFBUUEsd0JBQXVCQTtvQkFDL0NBLEtBQUtBLFdBQVdBLElBQUlBLG9CQUFlQTt3QkFDL0JBLCtCQUFPQSxHQUFQQSxnQkFBWUEsZ0NBQWFBLEdBQWJBOzs7Z0JBR3BCQSxJQUFJQSxjQUFjQSxRQUFRQSxzQkFBcUJBO29CQUMzQ0EsS0FBS0EsWUFBV0EsS0FBSUEsa0JBQWFBO3dCQUM3QkEsNkJBQUtBLElBQUxBLGNBQVVBLDhCQUFXQSxJQUFYQTs7O2dCQUdsQkEsSUFBSUEscUJBQXFCQSxRQUFRQSw2QkFBNEJBO29CQUN6REEsS0FBS0EsWUFBV0EsS0FBSUEseUJBQW9CQTt3QkFDcENBLG9DQUFZQSxJQUFaQSxxQkFBaUJBLHFDQUFrQkEsSUFBbEJBOzs7Z0JBR3pCQSxJQUFJQSxjQUFjQTtvQkFDZEEsWUFBT0EsSUFBSUEsNkJBQWNBLHNCQUFzQkEsd0JBQ3ZDQSxvQkFBb0JBOztnQkFFaENBLDZCQUF3QkE7Z0JBQ3hCQSxrQkFBYUE7Z0JBQ2JBLHFCQUFnQkE7Z0JBQ2hCQSxrQkFBYUE7Z0JBQ2JBLGlCQUFZQTtnQkFDWkEsdUJBQWtCQTtnQkFDbEJBLGlCQUFZQTtnQkFDWkEsV0FBTUE7Z0JBQ05BLHVCQUFrQkE7Z0JBQ2xCQSxJQUFJQSwwQ0FBb0JBO29CQUNwQkEsa0JBQWFBOztnQkFFakJBLElBQUlBLDJDQUFxQkE7b0JBQ3JCQSxtQkFBY0E7O2dCQUVsQkEsSUFBSUEsZ0JBQWdCQTtvQkFDaEJBLGNBQVNBOztnQkFFYkEsb0JBQWVBO2dCQUNmQSwwQkFBcUJBO2dCQUNyQkEsK0JBQTBCQTtnQkFDMUJBLDZCQUF3QkE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JDdEdkQSxPQUFPQTs7Ozs7b0JBS1BBLE9BQU9BOzs7OztvQkFLUEEsT0FBT0E7OztvQkFDUEEsa0JBQWFBOzs7OztvQkFPZkEsSUFBSUEsd0JBQW1CQTt3QkFDbkJBLE9BQU9BLHVEQUFxQkEsaUJBQXJCQTs7d0JBRVBBOzs7Ozs7b0JBTUZBLE9BQU9BOzs7b0JBQ1BBLGNBQVNBOzs7Ozs4QkE5RUZBOztnQkFFYkEsZ0JBQWdCQTtnQkFDaEJBLGFBQVFBLEtBQUlBO2dCQUNaQTs7NEJBTWFBLFFBQXdCQTs7O2dCQUVyQ0EsZ0JBQWdCQTtnQkFDaEJBLGFBQVFBLEtBQUlBLG1FQUFlQTtnQkFDM0JBOztnQkFFQUEsMEJBQTZCQTs7Ozt3QkFFekJBLElBQUlBLHFCQUFvQkEsdUNBQXdCQTs0QkFFNUNBLFdBQWdCQSxJQUFJQSx3Q0FBU0Esc0pBQWlCQSxrQkFBa0JBLGdCQUFnQkEsc0JBQXNCQTs0QkFDdEdBLGFBQVFBOytCQUVQQSxJQUFJQSxxQkFBb0JBLHVDQUF3QkE7NEJBRWpEQSxhQUFRQSxnQkFBZ0JBLG1CQUFtQkE7K0JBRTFDQSxJQUFJQSxxQkFBb0JBOzRCQUV6QkEsYUFBUUEsZ0JBQWdCQSxtQkFBbUJBOytCQUUxQ0EsSUFBSUEscUJBQW9CQTs0QkFFekJBLGtCQUFhQTsrQkFFWkEsSUFBSUEscUJBQW9CQTs0QkFFekJBLGNBQVNBOzs7Ozs7O2lCQUdqQkEsSUFBSUEsd0JBQW1CQTtvQkFFbkJBOztnQkFFSkE7Z0JBQ0FBLElBQUlBLGVBQVVBO29CQUFRQSxhQUFhQTs7Ozs7K0JBcUNuQkE7Z0JBRWhCQSxlQUFVQTs7K0JBTU1BLFNBQWFBLFlBQWdCQTtnQkFFN0NBLEtBQUtBLFFBQVFBLDRCQUFpQkEsUUFBUUE7b0JBRWxDQSxXQUFnQkEsbUJBQU1BO29CQUN0QkEsSUFBSUEsaUJBQWdCQSxXQUFXQSxnQkFBZUEsY0FDMUNBO3dCQUVBQSxhQUFhQTt3QkFDYkE7Ozs7Z0NBTVNBO2dCQUVqQkEsSUFBSUEsZUFBVUE7b0JBRVZBLGNBQVNBLEtBQUlBOztnQkFFakJBLGdCQUFXQTs7OztnQkFNWEEsWUFBa0JBLElBQUlBLGdDQUFVQTtnQkFDaENBLG1CQUFtQkE7Z0JBQ25CQSwwQkFBMEJBOzs7O3dCQUV0QkEsZ0JBQWdCQTs7Ozs7O2lCQUVwQkEsSUFBSUEsZUFBVUE7b0JBRVZBLGVBQWVBLEtBQUlBO29CQUNuQkEsMkJBQXlCQTs7Ozs0QkFFckJBLGlCQUFpQkE7Ozs7Ozs7Z0JBR3pCQSxPQUFPQTs7OztnQkFJUEEsYUFBZ0JBLGtCQUFrQkEsaUNBQTRCQTtnQkFDOURBLDBCQUF1QkE7Ozs7d0JBRW5CQSxTQUFTQSw2QkFBU0E7Ozs7OztpQkFFdEJBO2dCQUNBQSxPQUFPQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQ0M5SVlBLFdBQWVBO29CQUN0Q0EsT0FBT0EsUUFBSUEsa0JBQVlBOztzQ0FJRUE7b0JBQ3pCQSxPQUFPQSxDQUFDQTs7c0NBSWtCQTtvQkFDMUJBLElBQUlBLGNBQWFBLG1DQUNiQSxjQUFhQSxtQ0FDYkEsY0FBYUEsbUNBQ2JBLGNBQWFBLG1DQUNiQSxjQUFhQTs7d0JBRWJBOzt3QkFHQUE7Ozs7Ozs7Ozs7Ozs7Z0JDbER5QkEsT0FBT0EsSUFBSUE7Ozs7Ozs7Ozs7Ozs7O29CQ0RBQSxPQUFPQTs7O29CQUE0QkEsMEJBQXFCQTs7Ozs7OzBDQUQvREEsSUFBSUE7Ozs7Ozs7O3VDQ0FKQTtvQkFBbUJBLE9BQU9BOzs7Ozs7Ozs7Ozs7OzRCQ0loREEsT0FBYUE7O2dCQUVwQkEsYUFBUUE7Z0JBQ1JBLGFBQVFBOzs7Ozs7Ozs7Ozs0QkNKQ0EsR0FBT0E7O2dCQUVoQkEsU0FBSUE7Z0JBQ0pBLFNBQUlBOzs7Ozs7Ozs7Ozs7OzRCQ0RTQSxHQUFPQSxHQUFPQSxPQUFXQTs7Z0JBRXRDQSxTQUFJQTtnQkFDSkEsU0FBSUE7Z0JBQ0pBLGFBQVFBO2dCQUNSQSxjQUFTQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NDeEJ3QzBCQTs7b0JBRW5DQSxJQUFJQSxjQUFjQTt3QkFFZEEsTUFBTUEsSUFBSUE7OztvQkFHZEE7b0JBQ0FBLElBQUlBLENBQUNBLHFDQUFXQSxNQUFVQTt3QkFFdEJBLE1BQU1BLElBQUlBOztvQkFFZEEsT0FBT0EsVUFBSUEsMkNBRUVBLHdCQUNFQSw0QkFBcUJBLE1BQU1BLG1EQUMzQkEsdUNBQXlCQSxNQUFNQSxHQUFjQTs7MENBTXhCQTtvQkFFcENBLGlCQUFpQkEsSUFBSUE7b0JBQ3JCQSxnQkFBZ0JBO29CQUNoQkEsT0FBT0E7O3NDQVNtQkEsTUFBYUE7b0JBRXZDQSxXQUFXQSx1Q0FBeUJBLFNBQVNBO29CQUM3Q0EsSUFBSUEsNkJBQVFBLHNDQUFXQSw2QkFBUUE7d0JBRTNCQSxXQUFTQTt3QkFDVEE7O29CQUVKQSxXQUFTQTtvQkFDVEE7Ozs7Ozs7Ozs7Ozs7Ozs0QkFoQmNBO2dCQUVkQSxZQUFZQTtnQkFDWkEsZ0JBQVdBLHFDQUFXQTtnQkFDdEJBLGdCQUFXQTs7NEJBZUVBO2dCQUViQSxJQUFJQSxxQkFBY0Esc0JBQVdBO29CQUV6QkE7OztnQkFHSkEsV0FBV0EsdUNBQXlCQSxXQUFNQSxlQUFVQTtnQkFDcERBLGlDQUFZQTtnQkFDWkEsV0FBV0EsNEJBQXFCQSxXQUFNQTtnQkFDdENBLGlDQUFZQTs7Z0JBRVpBLElBQUlBLHFCQUFjQSxzQkFBV0E7b0JBRXpCQSxNQUFNQSxJQUFJQSxtQ0FBb0JBLGlFQUF1REEsaUJBQ3JHQSxtREFBMkNBLGdDQUFLQSxzQ0FBb0JBOzs7Z0JBR3hEQSxJQUFJQSw2QkFBUUE7b0JBRVJBLGVBQWVBLHVDQUF5QkEsV0FBTUEsZUFBVUE7b0JBQ3hEQSxlQUFlQSxnQkFBZ0JBLElBQUlBLGdDQUFpQkEsa0JBQVdBLDBDQUFVQSxNQUFNQTtvQkFDL0VBLGlDQUFZQTs7b0JBSVpBLGlCQUFpQkE7b0JBQ2pCQSxJQUFJQSxDQUFDQTt3QkFBZ0JBOztvQkFDckJBLGVBQWVBLGFBQWFBLElBQUlBLGdDQUFpQkEsZUFBVUEsTUFBTUE7b0JBQ2pFQSxpQ0FBWUE7O2dCQUVoQkE7Ozs7Ozs7OzRCQS9IdUJBOztpREFDaEJBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OzBDeUI2Y3dCQSxNQUFnQkEsTUFBVUE7b0JBRXpEQSxPQUFPQSxDQUFDQSxRQUFRQSxhQUFTQSxnQ0FBb0JBLENBQUNBLFdBQU9BLDRCQUFnQkE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQXBZL0RBLE9BQU9BOzs7OztvQkFNUEEsT0FBT0E7Ozs7O29CQU1QQSxPQUFPQTs7Ozs7b0JBU1BBLE9BQU9BOzs7OztvQkFTUEEsT0FBT0E7OztvQkFDUEEsZUFBVUE7Ozs7OzRCQXZEUEEsU0FBMkJBLEtBQzNCQSxTQUNBQSxVQUFjQTs7O2dCQUd2QkEsbUJBQWNBLDRDQUE2QkE7Z0JBQzNDQSxnQkFBZ0JBO2dCQUNoQkEsbUJBQW1CQTtnQkFDbkJBLG9CQUFlQSxDQUFDQSx3QkFBd0JBO2dCQUN4Q0EscUJBQWdCQTtnQkFDaEJBLFdBQVlBLGNBQVNBOztnQkFFckJBLGVBQVVBLElBQUlBLDBCQUFXQTtnQkFDekJBLFlBQU9BLGVBQWVBO2dCQUN0QkEsZUFBZUE7Z0JBQ2ZBLG9CQUFlQTtnQkFDZkE7Z0JBQ0FBO2dCQUNBQTs7OztnQ0EyQ2tCQTs7Z0JBRWxCQSwwQkFBMEJBOzs7O3dCQUV0QkEsSUFBSUE7NEJBRUFBLFFBQWdCQSxZQUFhQTs0QkFDN0JBLE9BQU9BOzs7Ozs7O2lCQUdmQSxPQUFPQTs7OztnQkFTUEE7Z0JBQ0FBOztnQkFFQUEsMEJBQTBCQTs7Ozt3QkFFdEJBLFFBQVFBLFNBQVNBLE9BQU9BO3dCQUN4QkEsUUFBUUEsU0FBU0EsT0FBT0E7Ozs7OztpQkFFNUJBLFFBQVFBLFNBQVNBLE9BQU9BO2dCQUN4QkEsUUFBUUEsU0FBU0EsT0FBT0E7Z0JBQ3hCQSxJQUFJQTtvQkFFQUEsUUFBUUEsU0FBU0EsT0FBT0E7O2dCQUU1QkEsWUFBT0EsU0FBUUE7Z0JBQ2ZBLGNBQVNBLDZEQUE0QkEsa0JBQU9BO2dCQUM1Q0EsSUFBSUEsZUFBVUE7b0JBRVZBOzs7Ozs7Z0JBTUpBLElBQUlBLGtCQUFZQTtvQkFDWkEsNkJBQVVBOzs7c0NBSVVBOztnQkFFeEJBLElBQUlBO29CQUVBQSxhQUFRQTtvQkFDUkE7O2dCQUVKQSxhQUFRQTtnQkFDUkEsMEJBQTBCQTs7Ozt3QkFFdEJBLDJCQUFTQTs7Ozs7Ozs7O2dCQVFiQSxpQkFBWUE7Z0JBQ1pBLElBQUlBO29CQUVBQTs7Z0JBRUpBLGlCQUFZQTtnQkFDWkEsMEJBQTBCQTs7Ozt3QkFFdEJBLElBQUlBLGVBQVVBOzRCQUVWQSxlQUFVQTs7d0JBRWRBLElBQUlBOzRCQUVBQSxRQUFnQkEsWUFBYUE7NEJBQzdCQSxJQUFJQSxlQUFVQTtnQ0FFVkEsZUFBVUE7Ozs7Ozs7Ozs7Z0JBVXRCQSxJQUFJQSxlQUFTQTtvQkFDVEE7OztnQkFFSkEsaUJBQWlCQTtnQkFDakJBO2dCQUNBQTs7Z0JBRUFBLE9BQU9BLElBQUlBO29CQUVQQSxZQUFZQSxxQkFBUUE7b0JBQ3BCQTtvQkFDQUEsMkJBQWNBLHFCQUFRQTtvQkFDdEJBO29CQUNBQSxPQUFPQSxJQUFJQSxzQkFBaUJBLHFCQUFRQSxpQkFBZ0JBO3dCQUVoREEsMkJBQWNBLHFCQUFRQTt3QkFDdEJBOzs7O2dCQUlSQSxpQkFBaUJBLGlCQUFDQSwwQ0FBdUJBLDZCQUFrQkE7Z0JBQzNEQSxJQUFJQSxhQUFhQTtvQkFFYkEsYUFBYUE7O2dCQUVqQkE7Z0JBQ0FBLE9BQU9BLElBQUlBO29CQUVQQSxhQUFZQSxxQkFBUUE7b0JBQ3BCQSxxQkFBUUEsV0FBUkEsc0JBQVFBLFdBQVlBO29CQUNwQkE7b0JBQ0FBLE9BQU9BLElBQUlBLHNCQUFpQkEscUJBQVFBLGlCQUFnQkE7d0JBRWhEQTs7OztpQ0FTVUE7O2dCQUVsQkEsSUFBSUEsZUFBZUE7b0JBRWZBOztnQkFFSkEsY0FBU0EsS0FBSUE7Z0JBQ2JBO2dCQUNBQTtnQkFDQUEsMEJBQThCQTs7Ozt3QkFFMUJBLElBQUlBLGtCQUFrQkE7NEJBRWxCQTs7d0JBRUpBLElBQUlBLGtCQUFrQkE7NEJBRWxCQTs7O3dCQUdKQSxPQUFPQSxjQUFjQSxzQkFDZEEscUJBQVFBLHlCQUF5QkE7NEJBRXBDQSxlQUFRQSxxQkFBUUE7NEJBQ2hCQTs7d0JBRUpBLFVBQVVBO3dCQUNWQSxJQUFJQSxjQUFjQSxzQkFDZEEsQ0FBQ0EsK0JBQVFBOzRCQUVUQSxxQkFBV0E7O3dCQUVmQSxnQkFBV0E7Ozs7OztpQkFFZkEsSUFBSUE7b0JBRUFBLGNBQVNBOzs7a0NBTU9BLEdBQVlBOzs7Z0JBR2hDQSxXQUFXQTtnQkFDWEEsV0FBV0E7O2dCQUVYQSwwQkFBOEJBOzs7O3dCQUUxQkEsYUFBYUEsWUFDQUEsc0NBQ0FBLDhCQUNBQSxTQUFPQSxlQUFTQTs7Ozs7OzswQ0FLTEEsR0FBWUE7Ozs7Z0JBSXhDQSxXQUFXQTtnQkFDWEEsV0FBV0EsYUFBT0E7O2dCQUVsQkEsMEJBQTBCQTs7Ozt3QkFFdEJBLElBQUlBOzRCQUVBQSxjQUFjQSxLQUFJQSw4QkFBY0E7NEJBQ2hDQSxhQUFhQSxLQUFLQSxTQUNMQSxzQ0FDQUEsOEJBQ0FBLFNBQU9BLHNFQUNQQTs7d0JBRWpCQSxlQUFRQTs7Ozs7OztzQ0FRWUEsR0FBWUE7Z0JBRXBDQTtnQkFDQUEsUUFBUUEsYUFBT0E7Z0JBQ2ZBO2dCQUNBQSxLQUFLQSxVQUFVQSxXQUFXQTtvQkFFdEJBLFdBQVdBLEtBQUtBLHNDQUF1QkEsR0FDdkJBLHdCQUFXQTtvQkFDM0JBLFNBQUtBLHlDQUF1QkE7O2dCQUVoQ0EsWUFBWUE7OztvQ0FLVUEsR0FBWUE7Z0JBRWxDQTs7Ozs7Ozs7O2dCQVNBQTtnQkFDQUEsSUFBSUE7b0JBQ0FBLFNBQVNBLGFBQU9BOztvQkFFaEJBOzs7Z0JBRUpBLElBQUlBLGtCQUFZQSxDQUFDQTtvQkFDYkEsT0FBT0EsYUFBT0Esa0JBQUlBOztvQkFFbEJBLE9BQU9BOzs7Z0JBRVhBLFdBQVdBLEtBQUtBLHNDQUF1QkEsUUFDdkJBLHNDQUF1QkE7O2dCQUV2Q0EsV0FBV0EsS0FBS0Esd0JBQVdBLFFBQVFBLHdCQUFXQTs7OzRCQUtqQ0EsR0FBWUEsTUFBZ0JBLEtBQVNBLHFCQUF5QkEsbUJBQXVCQTs7O2dCQUdsR0EsOEJBQXlCQSxHQUFHQSxNQUFNQSxxQkFBcUJBLG1CQUFtQkE7O2dCQUUxRUEsV0FBV0E7OztnQkFHWEEscUJBQXFCQTtnQkFDckJBLGtCQUFhQSxHQUFHQSxLQUFLQTtnQkFDckJBLHFCQUFxQkEsR0FBQ0E7Z0JBQ3RCQSxlQUFRQTs7O2dCQUdSQSwwQkFBMEJBOzs7O3dCQUV0QkEscUJBQXFCQTt3QkFDckJBLE9BQU9BLEdBQUdBLEtBQUtBO3dCQUNmQSxxQkFBcUJBLEdBQUNBO3dCQUN0QkEsZUFBUUE7Ozs7Ozs7Ozs7Ozs7Z0JBU1pBLDJCQUEwQkE7Ozs7d0JBRXRCQSxJQUFJQSxvQ0FBZUEsTUFBTUEsTUFBTUE7NEJBRTNCQSxxQkFBcUJBOzRCQUNyQkEsT0FBT0EsR0FBR0EsS0FBS0E7NEJBQ2ZBLHFCQUFxQkEsR0FBQ0E7O3dCQUUxQkEsZUFBUUE7Ozs7OztpQkFFWkEsb0JBQWVBLEdBQUdBO2dCQUNsQkEsa0JBQWFBLEdBQUdBOztnQkFFaEJBLElBQUlBO29CQUVBQSx3QkFBbUJBLEdBQUdBOztnQkFFMUJBLElBQUlBLGVBQVVBO29CQUVWQSxnQkFBV0EsR0FBR0E7Ozs7Z0RBT2dCQSxHQUFZQSxNQUFnQkEscUJBQXlCQSxtQkFBdUJBOztnQkFFOUdBLElBQUlBO29CQUF3QkE7OztnQkFFNUJBLFdBQVdBO2dCQUNYQTtnQkFDQUEsMEJBQTBCQTs7Ozt3QkFFdEJBLElBQUlBLG9DQUFlQSxNQUFNQSxNQUFNQSxNQUFNQSxDQUFDQSxjQUFjQSx1QkFBdUJBLGNBQWNBOzRCQUVyRkEscUJBQXFCQSxrQkFBVUE7NEJBQy9CQSxnQkFBZ0JBLHVCQUF1QkEscUJBQWFBOzRCQUNwREEscUJBQXFCQSxHQUFDQSxDQUFDQTs0QkFDdkJBOzs0QkFJQUE7O3dCQUVKQSxlQUFRQTs7Ozs7O2lCQUVaQSxJQUFJQTs7b0JBR0FBLHFCQUFxQkEsa0JBQVVBO29CQUMvQkEsZ0JBQWdCQSx1QkFBdUJBLGVBQVFBLFlBQU1BO29CQUNyREEscUJBQXFCQSxHQUFDQSxDQUFDQTs7O2tDQWNSQSxHQUFZQSxZQUF1QkEsS0FDdkNBLGtCQUFzQkEsZUFBbUJBOzs7Z0JBSXhEQSxJQUFJQSxDQUFDQSxpQkFBWUEsaUJBQWlCQSxlQUFVQSxrQkFDeENBLENBQUNBLGlCQUFZQSxvQkFBb0JBLGVBQVVBO29CQUUzQ0E7Ozs7Z0JBSUpBLFdBQVdBOztnQkFFWEEsV0FBbUJBO2dCQUNuQkEsZ0JBQXdCQTtnQkFDeEJBOzs7Ozs7Z0JBTUFBO2dCQUNBQSxLQUFLQSxXQUFXQSxJQUFJQSxvQkFBZUE7b0JBRS9CQSxPQUFPQSxxQkFBUUE7b0JBQ2ZBLElBQUlBO3dCQUVBQSxlQUFRQTt3QkFDUkE7OztvQkFHSkEsWUFBWUE7b0JBQ1pBO29CQUNBQSxJQUFJQSxnQkFBUUEsc0JBQWlCQSwrQkFBUUE7d0JBRWpDQSxNQUFNQSxxQkFBUUE7MkJBRWJBLElBQUlBLGdCQUFRQTt3QkFFYkEsTUFBTUEscUJBQVFBOzt3QkFJZEEsTUFBTUE7Ozs7O29CQUtWQSxJQUFJQSxDQUFDQSxRQUFRQSxrQkFBa0JBLENBQUNBLFFBQVFBO3dCQUVwQ0EsSUFBSUE7NEJBRUFBLFlBQVVBOzs7d0JBR2RBLE9BQU9BOzs7b0JBR1hBLElBQUlBLENBQUNBLFNBQVNBLHFCQUFxQkEsQ0FBQ0EsbUJBQW1CQSxRQUNuREEsQ0FBQ0EsU0FBU0Esa0JBQWtCQSxDQUFDQSxnQkFBZ0JBOzt3QkFHN0NBLFlBQVVBO3dCQUNWQSxPQUFPQTs7OztvQkFJWEEsSUFBSUEsQ0FBQ0EsU0FBU0Esa0JBQWtCQSxDQUFDQSxnQkFBZ0JBO3dCQUU3Q0EscUJBQXFCQSxrQkFBVUE7d0JBQy9CQSx1QkFBdUJBLHdCQUFnQkE7d0JBQ3ZDQSxxQkFBcUJBLEdBQUNBLENBQUNBOzs7O29CQUkzQkEsSUFBSUEsQ0FBQ0EsU0FBU0EscUJBQXFCQSxDQUFDQSxtQkFBbUJBO3dCQUVuREEsWUFBVUE7d0JBQ1ZBLHFCQUFxQkE7d0JBQ3JCQSxnQkFBZ0JBLGtCQUFrQkEsWUFBWUE7d0JBQzlDQSxxQkFBcUJBLEdBQUNBO3dCQUN0QkE7OztvQkFHSkEsZUFBUUE7O2dCQUVaQSxPQUFPQTs7eUNBT2tCQTs7O2dCQUd6QkEsV0FBV0E7Z0JBQ1hBLGdCQUFnQkE7Z0JBQ2hCQSwwQkFBNEJBOzs7O3dCQUV4QkEsWUFBWUE7d0JBQ1pBLElBQUlBLFdBQVdBLFNBQU9BOzRCQUVsQkEsT0FBT0E7O3dCQUVYQSxlQUFRQTs7Ozs7O2lCQUVaQSxPQUFPQTs7OztnQkFLUEEsYUFBZ0JBLGlCQUFnQkE7Z0JBQ2hDQTtnQkFDQUEsMEJBQTBCQTs7Ozt3QkFFdEJBLDJCQUFVQSxXQUFTQTs7Ozs7O2lCQUV2QkE7Z0JBQ0FBLDJCQUEwQkE7Ozs7d0JBRXRCQSwyQkFBVUEsV0FBU0E7Ozs7OztpQkFFdkJBLDJCQUEwQkE7Ozs7d0JBRXRCQSwyQkFBVUEsV0FBU0E7Ozs7OztpQkFFdkJBO2dCQUNBQSxPQUFPQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkN2aUJMQSxPQUFPQTs7O29CQUNQQSxxQkFBZ0JBOzs7OztvQkFLaEJBLE9BQU9BOzs7OztvQkFLUEEsT0FBT0E7Ozs7O29CQUtQQSxPQUFPQTs7Ozs7b0JBT1BBLE9BQU9BOzs7b0JBQ1BBLFdBQU1BOzs7OztvQkFRTkEsT0FBT0E7OztvQkFDUEEsd0JBQW1CQTs7Ozs7b0JBa0ZuQkEsT0FBT0EseUJBQW9CQSxDQUFDQSxhQUFRQTs7Ozs7NEJBekVsQ0EsUUFBa0JBLEtBQ2xCQSxVQUF1QkEsV0FBZUE7OztnQkFFOUNBLFdBQVdBO2dCQUNYQSxjQUFjQTtnQkFDZEEsZ0JBQWdCQTtnQkFDaEJBLGlCQUFpQkE7Z0JBQ2pCQSxvQkFBb0JBO2dCQUNwQkEsSUFBSUEsY0FBYUEsMEJBQU1BO29CQUNuQkEsWUFBT0E7O29CQUVQQSxZQUFPQTs7Z0JBQ1hBLFdBQU1BO2dCQUNOQSxZQUFPQTtnQkFDUEE7Z0JBQ0FBOzs7OztnQkFPQUEsSUFBSUEsbUJBQWFBO29CQUNiQSxRQUFjQTtvQkFDZEEsSUFBSUE7b0JBQ0pBLElBQUlBLGtCQUFZQTt3QkFDWkEsSUFBSUE7MkJBRUhBLElBQUlBLGtCQUFZQTt3QkFDakJBLElBQUlBOztvQkFFUkEsT0FBT0E7dUJBRU5BLElBQUlBLG1CQUFhQTtvQkFDbEJBLFNBQWNBO29CQUNkQSxLQUFJQSxPQUFNQTtvQkFDVkEsSUFBSUEsa0JBQVlBO3dCQUNaQSxLQUFJQSxPQUFNQTsyQkFFVEEsSUFBSUEsa0JBQVlBO3dCQUNqQkEsS0FBSUEsT0FBTUE7O29CQUVkQSxPQUFPQTs7b0JBR1BBLE9BQU9BOzs7dUNBUWFBO2dCQUN4QkEsaUJBQVlBO2dCQUNaQSxJQUFJQSxtQkFBYUEsMEJBQU1BO29CQUNuQkEsWUFBT0E7O29CQUVQQSxZQUFPQTs7Z0JBQ1hBLFdBQU1BOzsrQkFPVUEsTUFBV0E7Z0JBQzNCQSxZQUFZQTtnQkFDWkEscUJBQXFCQTs7NEJBWVJBLEdBQVlBLEtBQVNBLE1BQVVBO2dCQUM1Q0EsSUFBSUEsa0JBQVlBO29CQUNaQTs7O2dCQUVKQSxzQkFBaUJBLEdBQUdBLEtBQUtBLE1BQU1BO2dCQUMvQkEsSUFBSUEsa0JBQVlBLHVDQUNaQSxrQkFBWUEsNkNBQ1pBLGtCQUFZQSxvQ0FDWkEsa0JBQVlBLDBDQUNaQTs7b0JBRUFBOzs7Z0JBR0pBLElBQUlBLGFBQVFBO29CQUNSQSxzQkFBaUJBLEdBQUdBLEtBQUtBLE1BQU1BOztvQkFFL0JBLG1CQUFjQSxHQUFHQSxLQUFLQSxNQUFNQTs7O3dDQU9OQSxHQUFZQSxLQUFTQSxNQUFVQTtnQkFDekRBO2dCQUNBQSxJQUFJQSxjQUFRQTtvQkFDUkEsU0FBU0E7O29CQUVUQSxTQUFTQSxrRUFBeUJBOzs7Z0JBRXRDQSxJQUFJQSxtQkFBYUE7b0JBQ2JBLFNBQVNBLFVBQU9BLDhDQUFjQSxjQUFVQSx3REFDM0JBOztvQkFFYkEsWUFBWUEsUUFBT0EsOENBQWNBLFdBQU9BOztvQkFFeENBLFdBQVdBLEtBQUtBLFFBQVFBLElBQUlBLFFBQVFBO3VCQUVuQ0EsSUFBSUEsbUJBQWFBO29CQUNsQkEsVUFBU0EsVUFBT0EsOENBQWNBLFdBQU9BLHdEQUN4QkE7O29CQUViQSxJQUFJQSxjQUFRQTt3QkFDUkEsTUFBS0EsT0FBS0E7O3dCQUVWQSxNQUFLQSxPQUFLQTs7O29CQUVkQSxhQUFZQSxVQUFPQSw4Q0FBY0EsV0FBT0Esd0RBQ3hCQTs7b0JBRWhCQSxXQUFXQSxLQUFLQSxRQUFRQSxLQUFJQSxRQUFRQTs7O3FDQVFqQkEsR0FBWUEsS0FBU0EsTUFBVUE7O2dCQUV0REE7O2dCQUVBQTtnQkFDQUEsSUFBSUEsY0FBUUE7b0JBQ1JBLFNBQVNBOztvQkFFVEEsU0FBU0Esa0VBQXlCQTs7O2dCQUV0Q0EsSUFBSUEsbUJBQWFBO29CQUNiQSxZQUFZQSxRQUFPQSw4Q0FBY0EsV0FBT0E7OztvQkFHeENBLElBQUlBLGtCQUFZQSxzQ0FDWkEsa0JBQVlBLDRDQUNaQSxrQkFBWUEsdUNBQ1pBLGtCQUFZQSx5Q0FDWkEsa0JBQVlBOzt3QkFFWkEsYUFBYUEsS0FDQUEsUUFBUUEsT0FDUkEsUUFDQUEsVUFBUUEsbUNBQUVBLHNEQUNWQSxXQUFTQSw4REFDVEEsVUFBUUEsK0RBQ1JBLFdBQVNBLHNFQUNUQSxVQUFRQTs7b0JBRXpCQSxpQkFBU0E7O29CQUVUQSxJQUFJQSxrQkFBWUEseUNBQ1pBLGtCQUFZQTs7d0JBRVpBLGFBQWFBLEtBQ0FBLFFBQVFBLE9BQ1JBLFFBQ0FBLFVBQVFBLG1DQUFFQSxzREFDVkEsV0FBU0EsOERBQ1RBLFVBQVFBLCtEQUNSQSxXQUFTQSxzRUFDVEEsVUFBUUE7OztvQkFHekJBLGlCQUFTQTtvQkFDVEEsSUFBSUEsa0JBQVlBO3dCQUNaQSxhQUFhQSxLQUNBQSxRQUFRQSxPQUNSQSxRQUNBQSxVQUFRQSxtQ0FBRUEsc0RBQ1ZBLFdBQVNBLDhEQUNUQSxVQUFRQSwrREFDUkEsV0FBU0Esc0VBQ1RBLFVBQVFBOzs7dUJBS3hCQSxJQUFJQSxtQkFBYUE7b0JBQ2xCQSxhQUFZQSxVQUFPQSw4Q0FBY0EsV0FBS0Esd0RBQzFCQTs7b0JBRVpBLElBQUlBLGtCQUFZQSxzQ0FDWkEsa0JBQVlBLDRDQUNaQSxrQkFBWUEsdUNBQ1pBLGtCQUFZQSx5Q0FDWkEsa0JBQVlBOzt3QkFFWkEsYUFBYUEsS0FDQUEsUUFBUUEsUUFDUkEsUUFDQUEsV0FBUUEsMkNBQ1JBLFdBQVNBLDhEQUNUQSxXQUFRQSwrREFDUkEsV0FBU0EsMkNBQ1RBLGFBQVFBLGdFQUNOQTs7b0JBRW5CQSxtQkFBU0E7O29CQUVUQSxJQUFJQSxrQkFBWUEseUNBQ1pBLGtCQUFZQTs7d0JBRVpBLGFBQWFBLEtBQ0FBLFFBQVFBLFFBQ1JBLFFBQ0FBLFdBQVFBLDJDQUNSQSxXQUFTQSw4REFDVEEsV0FBUUEsK0RBQ1JBLFdBQVNBLDJDQUNUQSxhQUFRQSxnRUFDTkE7OztvQkFHbkJBLG1CQUFTQTtvQkFDVEEsSUFBSUEsa0JBQVlBO3dCQUNaQSxhQUFhQSxLQUNBQSxRQUFRQSxRQUNSQSxRQUNBQSxXQUFRQSwyQ0FDUkEsV0FBU0EsOERBQ1RBLFdBQVFBLCtEQUNSQSxXQUFTQSwyQ0FDVEEsYUFBUUEsZ0VBQ05BOzs7O2dCQUl2QkE7Ozt3Q0FRMEJBLEdBQVlBLEtBQVNBLE1BQVVBO2dCQUN6REEsWUFBWUE7O2dCQUVaQTtnQkFDQUE7O2dCQUVBQSxJQUFJQSxjQUFRQTtvQkFDUkEsU0FBU0E7O29CQUNSQSxJQUFJQSxjQUFRQTt3QkFDYkEsU0FBU0Esa0VBQXlCQTs7OztnQkFFdENBLElBQUlBLG1CQUFhQTtvQkFDYkEsVUFBVUE7O29CQUNUQSxJQUFJQSxtQkFBYUE7d0JBQ2xCQSxVQUFVQSxrRUFBeUJBOzs7OztnQkFHdkNBLElBQUlBLG1CQUFhQTtvQkFDYkEsV0FBV0Esc0JBQWdCQTtvQkFDM0JBLGFBQWFBLFFBQU9BLDhDQUFjQSxXQUFPQTtvQkFDekNBLFdBQVdBLFFBQU9BLDhDQUFjQSxnQkFBWUE7O29CQUU1Q0EsSUFBSUEsa0JBQVlBLHNDQUNaQSxrQkFBWUEsNENBQ1pBLGtCQUFZQSx1Q0FDWkEsa0JBQVlBLHlDQUNaQSxrQkFBWUE7O3dCQUVaQSxXQUFXQSxLQUFLQSxRQUFRQSxRQUFRQSxNQUFNQTs7b0JBRTFDQSxtQkFBVUE7b0JBQ1ZBLGVBQVFBOzs7b0JBR1JBLElBQUlBLGtCQUFZQTt3QkFDWkEsUUFBUUEsUUFBT0E7d0JBQ2ZBLFlBQWVBLENBQUNBLFNBQU9BLHNCQUFnQkEsQ0FBQ0EsU0FBT0E7d0JBQy9DQSxRQUFRQSxrQkFBS0EsQUFBQ0EsUUFBUUEsQ0FBQ0EsTUFBSUEsY0FBUUE7O3dCQUVuQ0EsV0FBV0EsS0FBS0EsR0FBR0EsR0FBR0EsTUFBTUE7OztvQkFHaENBLElBQUlBLGtCQUFZQSx5Q0FDWkEsa0JBQVlBOzt3QkFFWkEsV0FBV0EsS0FBS0EsUUFBUUEsUUFBUUEsTUFBTUE7O29CQUUxQ0EsbUJBQVVBO29CQUNWQSxlQUFRQTs7b0JBRVJBLElBQUlBLGtCQUFZQTt3QkFDWkEsV0FBV0EsS0FBS0EsUUFBUUEsUUFBUUEsTUFBTUE7OztvQkFLMUNBLFlBQVdBLHNCQUFnQkE7b0JBQzNCQSxjQUFhQSxVQUFPQSw4Q0FBY0EsV0FBT0Esd0RBQzVCQTtvQkFDYkEsWUFBV0EsVUFBT0EsOENBQWNBLGdCQUFZQSx3REFDN0JBOztvQkFFZkEsSUFBSUEsa0JBQVlBLHNDQUNaQSxrQkFBWUEsNENBQ1pBLGtCQUFZQSx1Q0FDWkEsa0JBQVlBLHlDQUNaQSxrQkFBWUE7O3dCQUVaQSxXQUFXQSxLQUFLQSxRQUFRQSxTQUFRQSxPQUFNQTs7b0JBRTFDQSxxQkFBVUE7b0JBQ1ZBLGlCQUFRQTs7O29CQUdSQSxJQUFJQSxrQkFBWUE7d0JBQ1pBLFNBQVFBLFNBQU9BO3dCQUNmQSxhQUFlQSxDQUFDQSxVQUFPQSx1QkFBZ0JBLENBQUNBLFVBQU9BO3dCQUMvQ0EsU0FBUUEsa0JBQUtBLEFBQUNBLFNBQVFBLENBQUNBLE9BQUlBLGVBQVFBOzt3QkFFbkNBLFdBQVdBLEtBQUtBLElBQUdBLElBQUdBLE9BQU1BOzs7b0JBR2hDQSxJQUFJQSxrQkFBWUEseUNBQ1pBLGtCQUFZQTs7d0JBRVpBLFdBQVdBLEtBQUtBLFFBQVFBLFNBQVFBLE9BQU1BOztvQkFFMUNBLHFCQUFVQTtvQkFDVkEsaUJBQVFBOztvQkFFUkEsSUFBSUEsa0JBQVlBO3dCQUNaQSxXQUFXQSxLQUFLQSxRQUFRQSxTQUFRQSxPQUFNQTs7O2dCQUc5Q0E7OztnQkFJQUEsT0FBT0EscUJBQWNBLDBIQUVBQSw2R0FBVUEsMENBQVdBLHFCQUFnQkEsd0JBQ3JDQSxxQkFBZ0JBLHdFQUFjQSxxQ0FBTUEsOENBQWVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7MENDOVcxQkE7O29CQUM5Q0EsYUFBNkJBLEtBQUlBOztvQkFFakNBLDBCQUEwQkE7Ozs7NEJBQ3RCQSxZQUFZQTs0QkFDWkEsUUFBUUE7OzRCQUVSQSxJQUFJQTtnQ0FDQUE7bUNBRUNBLElBQUlBLG1CQUFtQkE7Z0NBQ3hCQSxXQUFPQSxPQUFQQSxZQUFPQSxTQUFVQTs7Z0NBR2pCQSxXQUFPQSxPQUFTQTs7Ozs7OztxQkFHeEJBLE9BQU9BOzs7Ozs7Ozs7Ozs7b0JBZ0JEQSxPQUFPQTs7Ozs7NEJBOUVHQSxRQUNBQTs7Ozs7Z0JBR2hCQSxjQUFTQSxrQkFBeUJBO2dCQUNsQ0EsS0FBS0EsZUFBZUEsUUFBUUEsZUFBZUE7b0JBQ3ZDQSwrQkFBT0EsT0FBUEEsZ0JBQWdCQSwyQ0FBZUEsMEJBQU9BLE9BQVBBOztnQkFFbkNBLGlCQUFZQSxLQUFJQTs7O2dCQUdoQkEsMEJBQXFDQTs7Ozt3QkFDakNBLE1BQXFCQTs7OztnQ0FDakJBLElBQUlBLENBQUNBLDJCQUFzQkEsU0FDdkJBLENBQUNBLG1CQUFVQSxRQUFRQSxTQUFLQTs7b0NBRXhCQSxtQkFBVUEsTUFBUUEsU0FBS0E7Ozs7Ozs7Ozs7Ozs7O2dCQUtuQ0EsSUFBSUEsZUFBZUE7b0JBQ2ZBLDJCQUFxQ0E7Ozs7NEJBQ2pDQSxJQUFJQSxVQUFVQTtnQ0FDVkE7OzRCQUVKQSwyQkFBOEJBOzs7O29DQUMxQkEsWUFBWUE7b0NBQ1pBLFlBQVdBO29DQUNYQSxJQUFJQSxDQUFDQSwyQkFBc0JBLFVBQ3ZCQSxDQUFDQSxtQkFBVUEsU0FBUUE7O3dDQUVuQkEsbUJBQVVBLE9BQVFBOzs7Ozs7Ozs7Ozs7Ozs7O2dCQU9sQ0Esa0JBQWFBLGtCQUFTQTtnQkFDdEJBLDhDQUFzQkE7Z0JBQ3RCQSxrQkFBZ0JBOzs7O3FDQTJCS0EsT0FBV0E7Z0JBQ2hDQSxJQUFJQSxDQUFDQSwrQkFBT0EsT0FBUEEsMEJBQTBCQTtvQkFDM0JBLE9BQU9BLG1CQUFVQTs7b0JBRWpCQSxPQUFPQSxxQkFBVUEsU0FBU0EsK0JBQU9BLE9BQVBBLGtCQUFjQTs7Ozs7Ozs7OzJDQ3FCTEE7b0JBQ3ZDQSxJQUFJQSxRQUFPQTt3QkFDUEEsT0FBT0E7O3dCQUNOQSxJQUFJQSxRQUFPQTs0QkFDWkEsT0FBT0E7OzRCQUNOQSxJQUFJQSxRQUFPQTtnQ0FDWkEsT0FBT0E7O2dDQUVQQSxPQUFPQTs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBekdMQSxPQUFPQTs7Ozs7b0JBS1BBLE9BQU9BOzs7OztvQkFLUEEsT0FBT0E7Ozs7O29CQUtQQSxPQUFPQTs7Ozs7b0JBS1BBLE9BQU9BOzs7Ozs0QkFNSUEsV0FBZUEsYUFBaUJBLGFBQWlCQTs7Z0JBQ2xFQSxJQUFJQSxrQkFBa0JBLG9CQUFvQkE7b0JBQ3RDQSxNQUFNQSxJQUFJQTs7OztnQkFJZEEsSUFBSUE7b0JBQ0FBOzs7Z0JBR0pBLGlCQUFpQkE7Z0JBQ2pCQSxtQkFBbUJBO2dCQUNuQkEsbUJBQW1CQTtnQkFDbkJBLGFBQWFBOztnQkFFYkE7Z0JBQ0FBLElBQUlBO29CQUNBQSxPQUFPQTs7b0JBRVBBLE9BQU9BLDZCQUFjQSxDQUFDQTs7O2dCQUUxQkEsZUFBVUEsMEJBQVlBOzs7O2tDQUlKQTtnQkFDbEJBLE9BQU9BLHVCQUFPQTs7dUNBSWtCQTtnQkFDaENBLFlBQVlBOzs7Z0JBZVpBLElBQVNBLFlBQVlBLG9DQUFHQTtvQkFDcEJBLE9BQU9BOztvQkFDTkEsSUFBSUEsWUFBWUEsb0NBQUdBO3dCQUNwQkEsT0FBT0E7O3dCQUNOQSxJQUFJQSxZQUFZQSxvQ0FBR0E7NEJBQ3BCQSxPQUFPQTs7NEJBQ05BLElBQUlBLFlBQVlBLG9DQUFHQTtnQ0FDcEJBLE9BQU9BOztnQ0FDTkEsSUFBSUEsWUFBYUEsbUNBQUVBO29DQUNwQkEsT0FBT0E7O29DQUNOQSxJQUFJQSxZQUFhQSxtQ0FBRUE7d0NBQ3BCQSxPQUFPQTs7d0NBQ05BLElBQUlBLFlBQWFBLG1DQUFFQTs0Q0FDcEJBLE9BQU9BOzs0Q0FDTkEsSUFBSUEsWUFBYUEsbUNBQUVBO2dEQUNwQkEsT0FBT0E7O2dEQUNOQSxJQUFJQSxZQUFhQSxtQ0FBRUE7b0RBQ3BCQSxPQUFPQTs7b0RBRVBBLE9BQU9BOzs7Ozs7Ozs7OztzQ0FrQldBO2dCQUN0QkEsYUFBYUE7Z0JBQ2JBLGdCQUFnQkE7O2dCQUVoQkEsUUFBUUE7b0JBQ0pBLEtBQUtBO3dCQUE0QkEsT0FBT0E7b0JBQ3hDQSxLQUFLQTt3QkFBNEJBLE9BQU9BO29CQUN4Q0EsS0FBS0E7d0JBQTRCQSxPQUFPQTtvQkFDeENBLEtBQUtBO3dCQUE0QkEsT0FBT0Esa0JBQUVBO29CQUMxQ0EsS0FBS0E7d0JBQTRCQSxPQUFPQTtvQkFDeENBLEtBQUtBO3dCQUE0QkEsT0FBT0Esa0JBQUVBO29CQUMxQ0EsS0FBS0E7d0JBQTRCQSxPQUFPQTtvQkFDeENBLEtBQUtBO3dCQUE0QkEsT0FBT0E7b0JBQ3hDQSxLQUFLQTt3QkFBNEJBLE9BQU9BO29CQUN4Q0EsS0FBS0E7d0JBQTRCQSxPQUFPQTtvQkFDeENBO3dCQUFpQ0E7Ozs7Z0JBTXJDQSxPQUFPQSxvRUFDY0EsMENBQVdBLDRDQUFhQSw0Q0FBYUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7cUNWcEYxQkEsSUFBSUEseUJBQVVBO3dDQUNYQSxJQUFJQSx5QkFBVUE7bUNBQ25CQSxJQUFJQSx5QkFBVUE7c0NBQ1hBLElBQUlBLHlCQUFVQTttQ0FDakJBLElBQUlBLHlCQUFVQTs7OzsrQkF1RnBCQSxHQUFhQTtvQkFDckNBLElBQUlBLE9BQU9BO3dCQUNQQSxPQUFPQTs7d0JBRVBBLE9BQU9BOzs7K0JBSWFBLEdBQWFBO29CQUNyQ0EsSUFBSUEsT0FBT0E7d0JBQ1BBLE9BQU9BOzt3QkFFUEEsT0FBT0E7OzsrQkFJYUE7b0JBQ3hCQSxJQUFJQSxTQUFRQTt3QkFDUkEsT0FBT0E7O3dCQUVQQSxPQUFPQTs7O2tDQUlnQkE7b0JBQzNCQSxJQUFJQSxTQUFRQTt3QkFDUkEsT0FBT0E7O3dCQUVQQSxPQUFPQTs7Ozs7Ozs7Ozs7O29CQTVHTEEsT0FBT0E7Ozs7O29CQUtQQSxPQUFPQTs7Ozs7OzRCQUtBQSxRQUFZQTs7Z0JBQ3pCQSxJQUFJQSxDQUFDQSxDQUFDQSxlQUFlQTtvQkFDakJBLE1BQU1BLElBQUlBLHlCQUF5QkEsWUFBWUE7OztnQkFHbkRBLGNBQWNBO2dCQUNkQSxjQUFjQTs7Ozs0QkFNRkE7Z0JBQ1pBLE9BQU9BLGtCQUFDQSxnQkFBU0Esc0JBQWdCQSxDQUFDQSxnQkFBU0E7OzJCQU8xQkE7Z0JBQ2pCQSxVQUFVQSxrQ0FBYUE7Z0JBQ3ZCQSxhQUFPQTtnQkFDUEEsSUFBSUE7b0JBQ0FBOztnQkFFSkEsT0FBT0EsSUFBSUEseUJBQVVBLFNBQVNBOzs7Z0JBb0I5QkE7Z0JBQ0FBLFFBQVFBO29CQUNKQSxLQUFLQTt3QkFBR0EsU0FBU0E7d0JBQWFBO29CQUM5QkEsS0FBS0E7d0JBQUdBLFNBQVNBO3dCQUFhQTtvQkFDOUJBLEtBQUtBO3dCQUFHQSxTQUFTQTt3QkFBYUE7b0JBQzlCQSxLQUFLQTt3QkFBR0EsU0FBU0E7d0JBQWFBO29CQUM5QkEsS0FBS0E7d0JBQUdBLFNBQVNBO3dCQUFhQTtvQkFDOUJBLEtBQUtBO3dCQUFHQSxTQUFTQTt3QkFBYUE7b0JBQzlCQSxLQUFLQTt3QkFBR0EsU0FBU0E7d0JBQWFBO29CQUM5QkE7d0JBQVNBO3dCQUFZQTs7Z0JBRXpCQSxPQUFPQSxrQ0FBbUJBLFFBQVFBOzsrQkFRbkJBLEdBQWFBO2dCQUM1QkEsT0FBT0EsT0FBT0E7OztnQkFzQ2RBOzs7Ozs7Ozs7Z0JBQ0FBLE9BQU9BLHNCQUFFQSxhQUFGQSxhQUFZQTs7Ozs7OztpQ1c3TUtBLE1BQWFBLFlBQWdCQTtnQkFFakRBO2dCQUNBQSxLQUFLQSxXQUFXQSxJQUFJQSxPQUFPQSxJQUFJQSxhQUFhQTtvQkFDeENBLGtEQUFZQSxBQUFNQSx3QkFBS0EsTUFBSUEsa0JBQVRBOztnQkFDdEJBLE9BQU9BOzs7Ozs7Ozs7Ozs7aUNDUGlCQSxJQUFJQTs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JDd0MxQkEsT0FBT0E7Ozs7O29CQVFQQSxPQUFPQTs7Ozs7b0JBS1BBLE9BQU9BLG1DQUFFQTs7Ozs7b0JBT1RBLE9BQU9BOzs7b0JBQ1BBLGFBQVFBOzs7OztvQkFPUkEsT0FBT0E7Ozs7O29CQXFCUEEsT0FBT0E7Ozs7OzRCQTFERUEsT0FBYUEsTUFBZ0JBOzs7Z0JBQzVDQSxhQUFhQTtnQkFDYkEsaUJBQWlCQTtnQkFDakJBLFlBQVlBO2dCQUNaQSxhQUFRQTs7Ozs7Z0JBcUNSQSxXQUFXQSw0REFBY0EsZ0JBQVdBLGlCQUN6QkE7Z0JBQ1hBLElBQUlBLGVBQVNBLDhCQUFlQSxlQUFTQTtvQkFDakNBLGVBQVFBOztvQkFDUEEsSUFBSUEsZUFBU0E7d0JBQ2RBLGVBQVFBLG9DQUFFQTs7OztnQkFFZEEsSUFBSUE7b0JBQ0FBLE9BQU9BLEdBQUNBOztvQkFFUkE7Ozs7Z0JBV0pBLFdBQVdBLGlFQUFpQkEsZ0JBQVdBLGlCQUM1QkEsa0RBQ0FBO2dCQUNYQSxJQUFJQSxlQUFTQSw4QkFBZUEsZUFBU0E7b0JBQ2pDQSxlQUFRQTs7O2dCQUVaQSxJQUFJQTtvQkFDQUEsT0FBT0E7O29CQUVQQTs7OzRCQU1rQkEsR0FBWUEsS0FBU0E7O2dCQUUzQ0EscUJBQXFCQSxlQUFRQTs7O2dCQUc3QkEsWUFBWUEsUUFBT0EsNkRBQWNBLGdCQUFXQSxpQkFDaENBOztnQkFFWkEsSUFBSUEsZUFBU0E7b0JBQ1RBLGVBQVVBLEdBQUdBLEtBQUtBOztvQkFDakJBLElBQUlBLGVBQVNBO3dCQUNkQSxjQUFTQSxHQUFHQSxLQUFLQTs7d0JBQ2hCQSxJQUFJQSxlQUFTQTs0QkFDZEEsaUJBQVlBLEdBQUdBLEtBQUtBOzs7OztnQkFFeEJBLHFCQUFxQkEsR0FBQ0EsQ0FBQ0EsZUFBUUE7O2lDQU1iQSxHQUFZQSxLQUFTQTs7O2dCQUd2Q0EsYUFBYUEsU0FBUUE7Z0JBQ3JCQSxXQUFXQSxTQUFRQSxrQkFBRUE7Z0JBQ3JCQSxRQUFRQTtnQkFDUkE7Z0JBQ0FBLFdBQVdBLEtBQUtBLEdBQUdBLG9CQUFZQSxHQUFHQTtnQkFDbENBLFNBQUtBO2dCQUNMQSxXQUFXQSxLQUFLQSxHQUFHQSxRQUFRQSxHQUFHQTs7O2dCQUc5QkEsYUFBYUEsbUVBQTBCQTtnQkFDdkNBLFdBQVdBLHdDQUF3QkE7Z0JBQ25DQSxTQUFTQSxTQUFRQTtnQkFDakJBLE9BQU9BLFlBQVNBLDRDQUF1QkE7Z0JBQ3ZDQSxZQUFZQTtnQkFDWkEsV0FBV0EsS0FBS0EsUUFBUUEsUUFBUUEsTUFBTUE7Z0JBQ3RDQSxtQkFBVUE7Z0JBQ1ZBLGVBQVFBO2dCQUNSQSxXQUFXQSxLQUFLQSxRQUFRQSxRQUFRQSxNQUFNQTtnQkFDdENBOztnQ0FNaUJBLEdBQVlBLEtBQVNBO2dCQUN0Q0EsUUFBUUE7OztnQkFHUkE7Z0JBQ0FBLFdBQVdBLEtBQUtBLEdBQUdBLFlBQVFBLDZDQUF3QkEsdUVBQ25DQSxHQUFHQSxVQUFRQTs7Ozs7Ozs7Z0JBUTNCQSxhQUFhQSxLQUFLQSxHQUFHQSxVQUFRQSxzRUFDekJBLE1BQUlBLHNFQUF3QkEsVUFBUUEsc0VBQ3BDQSxNQUFJQSwyQ0FBc0JBLFVBQVFBLHNFQUNsQ0EsR0FBR0EsY0FBUUEsNENBQXVCQTs7Z0JBRXRDQSxhQUFhQSxLQUFLQSxHQUFHQSxVQUFRQSxzRUFDekJBLE1BQUlBLHNFQUF3QkEsVUFBUUEsc0VBQ3BDQSxRQUFJQSw0Q0FBdUJBLHNFQUN6QkEsWUFBUUEsdUVBQXlCQSxzRUFDbkNBLEdBQUdBLGNBQVFBLDRDQUF1QkE7OztnQkFHdENBLGFBQWFBLEtBQUtBLEdBQUdBLFVBQVFBLHNFQUN6QkEsTUFBSUEsc0VBQXdCQSxVQUFRQSxzRUFDcENBLFFBQUlBLDRDQUF1QkEsc0VBQzFCQSxZQUFRQSx1RUFBeUJBLHNFQUNsQ0EsR0FBR0EsY0FBUUEsNENBQXVCQTs7OzttQ0FRbEJBLEdBQVlBLEtBQVNBOzs7Z0JBR3pDQSxhQUFhQSxXQUFRQSw0Q0FBdUJBO2dCQUM1Q0EsV0FBV0EsV0FBUUEsNENBQXVCQTtnQkFDMUNBLFFBQVFBO2dCQUNSQTtnQkFDQUEsV0FBV0EsS0FBS0EsR0FBR0EsUUFBUUEsR0FBR0E7Z0JBQzlCQSxTQUFLQSx5Q0FBdUJBO2dCQUM1QkEsU0FBU0EsU0FBUUE7Z0JBQ2pCQSxPQUFPQSxhQUFRQSxrQkFBRUEsNkNBQXVCQSw0Q0FDL0JBO2dCQUNUQSxXQUFXQSxLQUFLQSxHQUFHQSxRQUFRQSxHQUFHQTs7O2dCQUc5QkEsYUFBYUE7Z0JBQ2JBLFdBQVdBLFlBQVNBLDRDQUF1QkE7Z0JBQzNDQSxTQUFTQSxTQUFRQTtnQkFDakJBLE9BQU9BLFlBQVNBLDRDQUF1QkE7Z0JBQ3ZDQSxZQUFZQTtnQkFDWkEsV0FBV0EsS0FBS0EsUUFBUUEsUUFBUUEsTUFBTUE7Z0JBQ3RDQSxtQkFBVUE7Z0JBQ1ZBLGVBQVFBO2dCQUNSQSxXQUFXQSxLQUFLQSxRQUFRQSxRQUFRQSxNQUFNQTtnQkFDdENBOzs7Z0JBSUFBLE9BQU9BLCtFQUVMQSw0RkFBT0EsZ0JBQVdBLHlGQUFNQTs7Ozs7Ozs7Ozs7Ozs7b0JDak1wQkEsT0FBT0E7Ozs7O29CQUtQQSxPQUFPQSxrQkFBSUE7Ozs7O29CQU9YQSxPQUFPQTs7O29CQUNQQSxhQUFRQTs7Ozs7b0JBT1JBOzs7OztvQkFPQUE7Ozs7OzRCQXBDT0E7OztnQkFDYkEsaUJBQWlCQTtnQkFDakJBLGFBQVFBOzs7OzRCQXlDRkEsR0FBWUEsS0FBU0E7Z0JBQzNCQSxRQUFRQTtnQkFDUkEsV0FBV0EsT0FBSUEsK0RBQXlCQTtnQkFDeENBO2dCQUNBQSxXQUFXQSxLQUFLQSxnRUFBd0JBLEdBQ3hCQSxnRUFBd0JBOzs7O2dCQUt4Q0EsT0FBT0EsMERBQ2NBLDBDQUFXQTs7Ozs7Ozs7NEJDNUVsQkEsTUFBV0E7O3FEQUNuQkEsTUFBS0E7Ozs7Ozs7Ozs7Ozs7OztvQkM4QkxBLE9BQU9BOzs7OztvQkFLUEE7Ozs7O29CQU9BQSxPQUFPQTs7O29CQUNQQSxhQUFRQTs7Ozs7b0JBT1JBOzs7OztvQkFPQUE7Ozs7OzRCQXBDU0EsV0FBZUE7OztnQkFDOUJBLGlCQUFpQkE7Z0JBQ2pCQSxhQUFhQTs7Ozs0QkF3Q1NBLEdBQVlBLEtBQVNBOztnQkFHM0NBLE9BQU9BLDREQUNjQSwwQ0FBV0E7Ozs7Ozs7OzswQ0NtRnJCQSxXQUEwQkEsS0FDZkE7O29CQUV0QkEsVUFBVUE7b0JBQ1ZBLGVBQXNCQSxrQkFBYUE7O29CQUVuQ0EsS0FBS0EsV0FBV0EsSUFBSUEsS0FBS0E7d0JBQ3JCQSxXQUFnQkEsa0JBQVVBO3dCQUMxQkEsNEJBQVNBLEdBQVRBLGFBQWNBLElBQUlBO3dCQUNsQkEsNEJBQVNBLEdBQVRBLG9CQUFxQkE7d0JBQ3JCQSw0QkFBU0EsR0FBVEE7d0JBQ0FBLDRCQUFTQSxHQUFUQSx1QkFBd0JBLGlCQUFpQkE7d0JBQ3pDQSw0QkFBU0EsR0FBVEEsc0JBQXVCQSxxQkFBcUJBLGlCQUFlQTt3QkFDM0RBLDRCQUFTQSxHQUFUQSxtQkFBb0JBLGtCQUFrQkEsYUFBYUEsaUNBQWlCQTs7d0JBRXBFQSxJQUFJQSxTQUFTQSxDQUFDQSw0QkFBU0EsR0FBVEEsMEJBQTJCQSw0QkFBU0EsZUFBVEE7Ozs7OzRCQUtyQ0EsSUFBSUEsNEJBQVNBLGVBQVRBO2dDQUNBQSw0QkFBU0EsR0FBVEE7O2dDQUVBQSw0QkFBU0EsR0FBVEE7Ozs0QkFHSkEsNEJBQVNBLEdBQVRBOzs7b0JBR1JBLE9BQU9BOzs4Q0FRUUEsVUFBcUJBOztvQkFDcENBO29CQUNBQSwwQkFBdUJBOzs7OzRCQUNuQkEsSUFBSUEsWUFBV0E7Z0NBQ1hBOzs7Ozs7O3FCQUdSQSxjQUF3QkEsa0JBQWdCQTtvQkFDeENBO29CQUNBQSwyQkFBdUJBOzs7OzRCQUNuQkEsSUFBSUEsYUFBV0E7Z0NBQ1hBLDJCQUFRQSxHQUFSQSxZQUFhQSxJQUFJQSwyQkFBWUEsVUFBU0EsY0FBYUE7Z0NBQ25EQTs7Ozs7OztxQkFHUkEsT0FBT0E7O3lDQVNHQSxRQUFrQkEsS0FBZUE7b0JBQzNDQTtvQkFDQUEsSUFBSUEsU0FBUUE7d0JBQ1JBLFNBQVNBLElBQUlBLHlCQUFVQTs7d0JBRXZCQSxTQUFTQSxJQUFJQSx5QkFBVUE7OztvQkFFM0JBLFdBQVdBLGFBQVlBLFVBQVVBLFlBQVlBO29CQUM3Q0EsSUFBSUE7d0JBQ0FBLE9BQU9BOzt3QkFFUEEsT0FBT0E7Ozt3Q0FPa0JBLFVBQXFCQSxPQUFXQTtvQkFDN0RBLEtBQUtBLFFBQVFBLE9BQU9BLElBQUlBLEtBQUtBO3dCQUN6QkEsSUFBSUEsQ0FBQ0EsNEJBQVNBLEdBQVRBOzRCQUNEQTs7O29CQUdSQTs7eUNBNGRlQSxRQUFzQkEsTUFBb0JBOztvQkFDekRBLGdCQUFnQkE7b0JBQ2hCQSxnQkFBaUJBO29CQUNqQkEsZUFBZ0JBLDBCQUFPQSwyQkFBUEE7b0JBQ2hCQSxJQUFJQSxhQUFhQSxRQUFRQSxZQUFZQTt3QkFDakNBOztvQkFFSkEsY0FBY0EsaUVBQXNCQTtvQkFDcENBLFVBQW1CQTtvQkFDbkJBLFdBQW9CQTs7b0JBRXBCQTtvQkFDQUEsSUFBSUEsdUJBQXNCQSxRQUFPQSw0Q0FDN0JBLFNBQVFBO3dCQUNSQTs7O29CQUdKQSxJQUFJQSxRQUFPQSxxQ0FBc0JBLFFBQU9BLG9DQUNwQ0EsUUFBT0EsMENBQTJCQSxRQUFPQSx1Q0FDekNBLFFBQU9BLDZDQUNQQSxDQUFDQSxRQUFPQSw0Q0FBNkJBLENBQUNBOzt3QkFFdENBOzs7b0JBR0pBLElBQUlBO3dCQUNBQSxJQUFJQSxRQUFPQTs0QkFDUEE7O3dCQUVKQSxrQkFDR0EsQ0FBQ0EsQ0FBQ0Esd0JBQXVCQSwyQkFDeEJBLENBQUNBLHdCQUF1QkEsMkJBQ3hCQSxDQUFDQSx3QkFBdUJBOzt3QkFFNUJBLElBQUlBLENBQUNBOzRCQUNEQTs7O3dCQUdKQSxJQUFJQSx3QkFBdUJBOzs0QkFFdkJBLFdBQVdBOzRCQUNYQSxJQUFJQSxDQUFDQSxrREFBc0JBLFFBQVFBO2dDQUMvQkE7OzsyQkFJUEEsSUFBSUE7d0JBQ0xBLElBQUlBLHdCQUF1QkE7NEJBQ3ZCQTs7d0JBRUpBLG1CQUNFQSxDQUFDQSx3QkFBdUJBLHdCQUF1QkE7d0JBQ2pEQSxJQUFJQSxDQUFDQSxnQkFBZUEsUUFBT0E7NEJBQ3ZCQTs7Ozt3QkFJSkEsWUFBV0E7d0JBQ1hBLElBQUlBLFFBQU9BOzs0QkFFUEEsUUFBT0E7K0JBRU5BLElBQUlBLFFBQU9BOzs0QkFFWkEsUUFBT0E7Ozt3QkFHWEEsSUFBSUEsQ0FBQ0Esa0RBQXNCQSxTQUFRQTs0QkFDL0JBOzsyQkFHSEEsSUFBSUE7d0JBQ0xBLFlBQWFBLENBQUNBLFFBQU9BLHdDQUNQQSxDQUFDQSxRQUFPQSxzQ0FDUEEseUJBQXdCQTt3QkFDdkNBLElBQUlBLENBQUNBOzRCQUNEQTs7Ozt3QkFJSkEsWUFBV0E7d0JBQ1hBLElBQUlBLHlCQUF3QkE7OzRCQUV4QkEsUUFBT0E7O3dCQUVYQSxJQUFJQSxDQUFDQSxrREFBc0JBLFNBQVFBOzRCQUMvQkE7OzJCQUlIQSxJQUFJQTt3QkFDTEEsSUFBSUE7NEJBQ0FBLFlBQVdBOzRCQUNYQSxJQUFJQSxDQUFDQSxrREFBc0JBLFNBQVFBO2dDQUMvQkE7Ozs7O29CQUtaQSwwQkFBOEJBOzs7OzRCQUMxQkEsSUFBSUEsQ0FBQ0Esa0NBQWtCQSx5QkFBaUJBO2dDQUNwQ0E7OzRCQUNKQSxJQUFJQSxjQUFjQTtnQ0FDZEE7OzRCQUNKQSxJQUFJQSx3QkFBdUJBLE9BQU9BLENBQUNBO2dDQUMvQkE7OzRCQUNKQSxJQUFJQTtnQ0FDQUE7Ozs7Ozs7OztvQkFJUkE7b0JBQ0FBLGdCQUFnQkE7b0JBQ2hCQSwyQkFBOEJBOzs7OzRCQUMxQkEsSUFBSUE7Z0NBQ0FBLElBQUlBLGVBQWVBLDBCQUF3QkE7b0NBQ3ZDQTs7Z0NBRUpBO2dDQUNBQSxZQUFZQTs7Ozs7Ozs7O29CQUtwQkEsSUFBSUEsQ0FBQ0E7d0JBQ0RBO3dCQUNBQTt3QkFDQUEsUUFBUUEsQ0FBQ0Esd0JBQXVCQSx5QkFBVUEsZ0JBQWdCQTt3QkFDMURBLFFBQVFBLENBQUNBLHVCQUFzQkEseUJBQVVBLGVBQWVBO3dCQUN4REEsWUFBWUEseUNBQWNBLE9BQU9BLE9BQU9BOzs7O29CQUk1Q0EsSUFBSUEsY0FBYUE7d0JBQ2JBLElBQUlBLFNBQVNBLG1CQUFtQkE7NEJBQzVCQTs7O3dCQUlKQSxJQUFJQSxTQUFTQSxzQkFBc0JBOzRCQUMvQkE7OztvQkFHUkE7O3NDQWlCWUEsUUFBc0JBOztvQkFDbENBLGdCQUFpQkE7b0JBQ2pCQSxlQUFnQkEsMEJBQU9BLDJCQUFQQTs7O29CQUdoQkEsbUJBQW1CQTtvQkFDbkJBLDBCQUE4QkE7Ozs7NEJBQzFCQSxJQUFJQTtnQ0FDQUEsZUFBZUE7Z0NBQ2ZBOzs7Ozs7OztvQkFJUkEsSUFBSUEsaUJBQWdCQTt3QkFDaEJBO3dCQUNBQTt3QkFDQUEsUUFBUUEsQ0FBQ0Esd0JBQXVCQSx5QkFBVUEsZ0JBQWdCQTt3QkFDMURBLFFBQVFBLENBQUNBLHVCQUFzQkEseUJBQVVBLGVBQWVBO3dCQUN4REEsZUFBZUEseUNBQWNBLE9BQU9BLE9BQU9BOztvQkFFL0NBLDJCQUE4QkE7Ozs7NEJBQzFCQSx3QkFBdUJBOzs7Ozs7O29CQUczQkEsSUFBSUE7d0JBQ0FBLDRDQUFpQkE7O3dCQUdqQkEsMENBQWVBOzs7b0JBR25CQSxrQkFBa0JBLFVBQVVBO29CQUM1QkEsS0FBS0EsV0FBV0EsSUFBSUEsZUFBZUE7d0JBQy9CQSwwQkFBT0EsR0FBUEE7Ozs0Q0FVU0E7b0JBQ2JBLGdCQUFpQkE7b0JBQ2pCQSxlQUFnQkE7Ozs7O29CQUtoQkEsSUFBSUEsdUJBQXNCQSw0Q0FDdEJBLHNCQUFxQkE7d0JBQ3JCQSxJQUFJQSx3QkFBdUJBOzRCQUN2QkEsZ0JBQWdCQTs7NEJBR2hCQSxnQkFBZ0JBLGtCQUFrQkE7Ozs7O29CQUsxQ0EsZUFBZUEsU0FBU0EsbUJBQW1CQTtvQkFDM0NBLElBQUlBLHdCQUF1QkE7d0JBQ3ZCQSxJQUFJQSxvREFBY0EsZUFBZUEsZUFBaUJBOzRCQUM5Q0EsZUFBZUEsaUJBQWlCQTs7NEJBRWhDQSxnQkFBZ0JBLGtCQUFrQkE7Ozt3QkFHdENBLElBQUlBLG9EQUFjQSxlQUFlQSxlQUFpQkE7NEJBQzlDQSxlQUFlQSxpQkFBaUJBLG9CQUFDQTs7NEJBRWpDQSxnQkFBZ0JBLGtCQUFrQkEsb0JBQUNBOzs7OzBDQVNoQ0E7O29CQUNYQSxnQkFBaUJBO29CQUNqQkEsZUFBZ0JBLDBCQUFPQSwyQkFBUEE7b0JBQ2hCQSxpQkFBa0JBOztvQkFFbEJBLElBQUlBLHdCQUF1QkE7Ozs7Ozt3QkFNdkJBLFVBQWdCQTt3QkFDaEJBLDBCQUE4QkE7Ozs7Z0NBQzFCQSxNQUFNQSw2QkFBY0EsS0FBS0E7Ozs7Ozt5QkFFN0JBLElBQUlBLDRCQUFPQSxrQkFBaUJBLFNBQVNBOzRCQUNqQ0EsZ0JBQWdCQTs0QkFDaEJBLGlCQUFpQkEsUUFBUUE7NEJBQ3pCQSxlQUFlQSxRQUFRQTsrQkFFdEJBLElBQUlBLDRCQUFPQSxpQkFBZ0JBLFNBQVNBOzRCQUNyQ0EsZ0JBQWdCQSxRQUFRQTs0QkFDeEJBLGlCQUFpQkEsUUFBUUE7NEJBQ3pCQSxlQUFlQTs7NEJBR2ZBLGdCQUFnQkE7NEJBQ2hCQSxpQkFBaUJBOzRCQUNqQkEsZUFBZUE7Ozs7Ozs7O3dCQVNuQkEsYUFBbUJBO3dCQUNuQkEsMkJBQThCQTs7OztnQ0FDMUJBLFNBQVNBLDZCQUFjQSxRQUFRQTs7Ozs7Ozt3QkFHbkNBLElBQUlBLCtCQUFVQSxrQkFBaUJBLGtCQUFrQkE7NEJBQzdDQSxpQkFBaUJBOzRCQUNqQkEsZUFBZUE7K0JBRWRBLElBQUlBLCtCQUFVQSxpQkFBZ0JBLG1CQUFtQkE7NEJBQ2xEQSxpQkFBaUJBOzRCQUNqQkEsZ0JBQWdCQTs7NEJBR2hCQSxnQkFBZ0JBOzRCQUNoQkEsaUJBQWlCQTs0QkFDakJBLGVBQWVBOzs7OztvQkFLdkJBLEtBQUtBLFdBQVdBLElBQUlBLDJCQUFpQkE7d0JBQ2pDQSxXQUFZQSwwQkFBT0EsR0FBUEE7d0JBQ1pBLFdBQVdBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkFsd0JUQSxPQUFPQTs7Ozs7b0JBUVBBLE9BQU9BOzs7OztvQkFLUEEsT0FBT0E7Ozs7O29CQUtQQSxPQUFPQTs7Ozs7b0JBWVRBLElBQUlBLGNBQVNBO3dCQUFRQSxPQUFPQTsyQkFDdkJBLElBQUlBLGNBQVNBO3dCQUFRQSxPQUFPQTsyQkFDNUJBLElBQUlBLHNCQUFpQkE7d0JBQWtCQSxPQUFPQTs7d0JBQzVDQSxPQUFPQTs7Ozs7O29CQVFaQSxPQUFPQTs7O29CQUNQQSxhQUFRQTs7Ozs7b0JBS1JBLE9BQU9BOzs7OztvQkFzQ1BBLE9BQU9BOzs7OztvQkFpQ1BBLE9BQU9BOzs7Ozs0QkF2VEVBLFdBQTBCQSxLQUMxQkEsTUFBb0JBLEdBQVFBOzs7O2dCQUUzQ0EsVUFBVUE7Z0JBQ1ZBOztnQkFFQUE7Z0JBQ0FBLFlBQU9BO2dCQUNQQSxrQkFBYUE7O2dCQUViQSxpQkFBWUE7Z0JBQ1pBLGVBQVVBOztnQkFFVkEsS0FBS0EsT0FBT0EsSUFBSUEsaUJBQWlCQTtvQkFDN0JBLElBQUlBO3dCQUNBQSxJQUFJQSxrQkFBVUEsWUFBWUEsa0JBQVVBOzRCQUNoQ0EsTUFBTUEsSUFBSUE7OztvQkFHbEJBLGVBQVVBLFNBQVNBLGNBQVNBLGtCQUFVQTs7O2dCQUcxQ0EsZ0JBQVdBLDBDQUFlQSxXQUFXQSxLQUFLQTtnQkFDMUNBLG9CQUFlQSw4Q0FBbUJBLGVBQVVBOzs7O2dCQUk1Q0EsV0FBb0JBO2dCQUNwQkEsV0FBb0JBO2dCQUNwQkEsYUFBYUE7Z0JBQ2JBLEtBQUtBLE9BQU9BLElBQUlBLHNCQUFpQkE7b0JBQzdCQSxPQUFPQSxpQ0FBU0EsR0FBVEE7b0JBQ1BBLElBQUlBLFNBQVFBO3dCQUNSQSxTQUFTQTt3QkFDVEE7Ozs7Z0JBSVJBLElBQUlBLFNBQVFBOzs7Ozs7OztvQkFRUkE7b0JBQ0FBLGFBQVFBLElBQUlBLG9CQUFLQSwrREFDQUEsaUNBQVNBLG9CQUFUQSwyQkFDQUEsTUFDQUEsMEJBQ0FBLHdDQUFhQSxrQkFBYUE7O29CQUczQ0EsYUFBUUEsSUFBSUEsb0JBQUtBLGlDQUFTQSxRQUFUQSwyQkFDQUEsaUNBQVNBLGtDQUFUQSwyQkFDQUEsTUFDQUEsd0JBQ0FBLHdDQUFhQSxlQUFVQSxRQUFRQTs7O29CQUtoREEsZ0JBQWdCQSx5Q0FBY0EsK0RBQ0FBLGlDQUFTQSxrQ0FBVEEsMkJBQ0FBOztvQkFFOUJBLGFBQVFBLElBQUlBLG9CQUFLQSwrREFDQUEsaUNBQVNBLGtDQUFUQSwyQkFDQUEsTUFDQUEsV0FDQUEsd0NBQWFBLGtCQUFhQTtvQkFFM0NBLGFBQVFBOzs7O2dCQUlaQSxJQUFJQSxTQUFRQTtvQkFDUkEsYUFBUUE7O2dCQUNaQSxJQUFJQSxTQUFRQTtvQkFDUkEsYUFBUUE7OztnQkFFWkEsYUFBUUE7Ozs7OztnQkE2S1JBLGFBQWFBLG1CQUFFQSx3Q0FBd0JBOztnQkFFdkNBLElBQUlBO29CQUNBQSxtQkFBVUE7b0JBQ1ZBLEtBQUtBLFdBQVdBLElBQUlBLDBCQUFxQkE7d0JBQ3JDQSxZQUFvQkEscUNBQWFBLEdBQWJBO3dCQUNwQkEsV0FBbUJBLHFDQUFhQSxlQUFiQTt3QkFDbkJBLElBQUlBLGdCQUFnQkE7NEJBQ2hCQSxtQkFBVUE7Ozs7Z0JBSXRCQSxJQUFJQSxtQkFBY0EsUUFBUUEsb0NBQThCQTtvQkFDcERBOztnQkFFSkEsT0FBT0E7Ozs7O2dCQWFQQSxjQUFvQkEsaUNBQVVBLGtDQUFWQTs7Ozs7Z0JBS3BCQSxJQUFJQSxjQUFTQTtvQkFDVEEsVUFBVUEsNkJBQWNBLFNBQVNBOztnQkFDckNBLElBQUlBLGNBQVNBO29CQUNUQSxVQUFVQSw2QkFBY0EsU0FBU0E7OztnQkFFckNBLFdBQVdBLDRDQUFhQSw2QkFBY0EsYUFBU0E7Z0JBQy9DQTtnQkFDQUEsSUFBSUE7b0JBQ0FBLFNBQVNBOzs7O2dCQUdiQSwwQkFBK0JBOzs7O3dCQUMzQkEsSUFBSUEsb0JBQW9CQTs0QkFDcEJBLFNBQVNBOzs7Ozs7O2lCQUdqQkEsT0FBT0E7Ozs7O2dCQVlQQSxpQkFBdUJBOzs7OztnQkFLdkJBLElBQUlBLGNBQVNBO29CQUNUQSxhQUFhQSw2QkFBY0EsWUFBWUE7O2dCQUMzQ0EsSUFBSUEsY0FBU0E7b0JBQ1RBLGFBQWFBLDZCQUFjQSxZQUFZQTs7O2dCQUUzQ0EsV0FBV0EsK0RBQWlCQSxnQkFBV0EsYUFDNUJBOztnQkFFWEE7Z0JBQ0FBLElBQUlBO29CQUNBQSxTQUFTQTs7OztnQkFHYkEsMEJBQStCQTs7Ozt3QkFDM0JBLElBQUlBLG9CQUFvQkE7NEJBQ3BCQSxTQUFTQTs7Ozs7OztpQkFHakJBLE9BQU9BOztnQ0FJYUEsWUFBZ0JBO2dCQUNwQ0EsSUFBSUEsb0NBQThCQTtvQkFDOUJBLE9BQU9BLFlBQU9BLFlBQVlBO3VCQUV6QkEsSUFBSUEsb0NBQThCQTtvQkFDbkNBOzs7Ozs7Ozs7Ozs7OztvQkFHQUEsZ0JBQWdCQSxvQ0FBcUJBO29CQUNyQ0EsT0FBT0EsK0JBQVlBLFdBQVpBO3VCQUVOQSxJQUFJQSxvQ0FBOEJBO29CQUNuQ0E7Ozs7Ozs7Ozs7Ozs7O29CQUdBQSxnQkFBZ0JBO29CQUNoQkEsV0FBV0EsOEJBQWNBO29CQUN6QkEsMkJBQWNBO29CQUNkQSxJQUFJQTt3QkFDQUE7O29CQUVKQSxpQkFBZ0JBLG9DQUFxQkE7b0JBQ3JDQSxPQUFPQSxnQ0FBWUEsWUFBWkE7dUJBRU5BLElBQUlBLG9DQUE4QkE7b0JBQ25DQTs7Ozs7Ozs7Ozs7Ozs7b0JBR0FBLGlCQUFnQkEsb0NBQXFCQTtvQkFDckNBLE9BQU9BLHVCQUFJQSxZQUFKQTt1QkFFTkEsSUFBSUEsb0NBQThCQTtvQkFDbkNBOzs7Ozs7Ozs7Ozs7OztvQkFHQUEsaUJBQWdCQTtvQkFDaEJBLFlBQVdBLDhCQUFjQTtvQkFDekJBLDJCQUFjQTtvQkFDZEEsSUFBSUE7d0JBQ0FBOztvQkFFSkEsaUJBQWdCQSxvQ0FBcUJBO29CQUNyQ0EsT0FBT0Esd0JBQUlBLFlBQUpBOztvQkFHUEE7Ozs4QkFLY0EsWUFBZ0JBO2dCQUNsQ0EsZ0JBQWdCQSxvQ0FBcUJBO2dCQUNyQ0EsUUFBT0E7b0JBQ0hBLEtBQUtBO3dCQUFhQTtvQkFDbEJBLEtBQUtBO3dCQUFhQTtvQkFDbEJBLEtBQUtBO3dCQUFhQTtvQkFDbEJBLEtBQUtBO3dCQUFhQTtvQkFDbEJBLEtBQUtBO3dCQUFhQTtvQkFDbEJBLEtBQUtBO3dCQUFhQTtvQkFDbEJBLEtBQUtBO3dCQUFhQTtvQkFDbEJBLEtBQUtBO3dCQUNEQSxJQUFJQSxxQkFBb0JBOzRCQUNwQkE7OzRCQUVBQTs7b0JBQ1JBLEtBQUtBO3dCQUNEQSxJQUFJQSxxQkFBb0JBOzRCQUNwQkE7OzRCQUVBQTs7b0JBQ1JBLEtBQUtBO3dCQUNEQSxJQUFJQSxxQkFBb0JBOzRCQUNwQkE7OzRCQUVBQTs7b0JBQ1JBLEtBQUtBO3dCQUNEQSxJQUFJQSxxQkFBb0JBOzRCQUNwQkE7OzRCQUVBQTs7b0JBQ1JBLEtBQUtBO3dCQUNEQSxJQUFJQSxxQkFBb0JBOzRCQUNwQkE7OzRCQUVBQTs7b0JBQ1JBO3dCQUNJQTs7OzRCQVVjQSxHQUFZQSxLQUFTQTs7Z0JBRTNDQSxxQkFBcUJBLGVBQVFBOzs7Z0JBRzdCQSxlQUFxQkEsNkJBQWNBO2dCQUNuQ0EsV0FBV0EsZUFBVUEsR0FBR0EsS0FBS0E7OztnQkFHN0JBLHFCQUFxQkE7Z0JBQ3JCQSxlQUFVQSxHQUFHQSxLQUFLQSxNQUFNQTtnQkFDeEJBLElBQUlBLG1CQUFjQSxRQUFRQTtvQkFDdEJBLHFCQUFnQkEsR0FBR0EsS0FBS0EsTUFBTUE7Ozs7Z0JBSWxDQSxJQUFJQSxjQUFTQTtvQkFDVEEsZ0JBQVdBLEdBQUdBLEtBQUtBLE1BQU1BOztnQkFDN0JBLElBQUlBLGNBQVNBO29CQUNUQSxnQkFBV0EsR0FBR0EsS0FBS0EsTUFBTUE7OztnQkFFN0JBLHFCQUFxQkEsR0FBQ0E7Z0JBQ3RCQSxxQkFBcUJBLEdBQUNBLENBQUNBLGVBQVFBOztpQ0FTZEEsR0FBWUEsS0FBU0E7O2dCQUN0Q0E7O2dCQUVBQSxXQUFtQkE7Z0JBQ25CQSwwQkFBK0JBOzs7O3dCQUMzQkEsSUFBSUEsUUFBUUEsUUFBUUEsaUJBQWlCQTs0QkFDakNBLGVBQVFBOzt3QkFFWkEscUJBQXFCQTt3QkFDckJBLFlBQVlBLEdBQUdBLEtBQUtBO3dCQUNwQkEscUJBQXFCQSxHQUFDQTt3QkFDdEJBLE9BQU9BOzs7Ozs7aUJBRVhBLElBQUlBLFFBQVFBO29CQUNSQSxlQUFRQTs7Z0JBRVpBLE9BQU9BOztpQ0FPV0EsR0FBWUEsS0FBU0EsTUFBVUE7O2dCQUNqREE7Z0JBQ0FBLDBCQUEwQkE7Ozs7O3dCQUV0QkEsWUFBWUEsUUFBT0EsOENBQWNBLGlCQUNyQkE7O3dCQUVaQSxZQUFZQTt3QkFDWkEsSUFBSUEsQ0FBQ0E7NEJBQ0RBLGlCQUFTQTs7Ozs7O3dCQUtiQSxxQkFBcUJBLFlBQVFBLGdGQUNSQSxZQUFRQSw0Q0FDUkE7d0JBQ3JCQSxrQkFBa0JBOzt3QkFFbEJBLElBQUlBLG1CQUFjQTs0QkFDZEEsWUFBWUEsMEJBQXFCQTs7NEJBR2pDQSxZQUFZQTs7O3dCQUdoQkEsSUFBSUEsa0JBQWlCQSxxQ0FDakJBLGtCQUFpQkEsb0NBQ2pCQSxrQkFBaUJBOzs0QkFFakJBLGNBQWNBLEtBQUtBLG9CQUFDQSxxREFDTkEsb0JBQUNBLHNEQUNEQSxxQ0FDQUE7OzRCQUVkQSxjQUFjQSxLQUFLQSxvQkFBQ0EscURBQ05BLHNCQUFDQSxnRUFDREEscUNBQ0FBOzs0QkFFZEEsY0FBY0EsS0FBS0Esb0JBQUNBLHFEQUNOQSxzQkFBQ0EsZ0VBQ0RBLHFDQUNBQTs7OzRCQUlkQSxZQUFjQTs0QkFDZEEsSUFBSUEsbUNBQWFBO2dDQUNiQSxRQUFRQSxJQUFJQSwwQkFBV0E7OzRCQUUzQkEsY0FBY0EsT0FBT0Esb0JBQUNBLHFEQUNSQSxvQkFBQ0Esc0RBQ0RBLHFDQUNBQTs0QkFDZEEsSUFBSUEsbUNBQWFBO2dDQUNiQTs7Ozt3QkFJUkEsWUFBWUE7d0JBQ1pBLGNBQWNBLEtBQUtBLG9CQUFDQSxxREFDTkEsb0JBQUNBLHNEQUNBQSxxQ0FDQUE7O3dCQUVmQTt3QkFDQUEscUJBQXNCQSxHQUFFQSxDQUFDQSxZQUFRQSx1RkFDWEEsR0FBRUEsQ0FBQ0EsWUFBUUEsNENBQ1JBOzs7d0JBR3pCQSxJQUFJQSxrQkFBaUJBLDBDQUNqQkEsa0JBQWlCQSw2Q0FDakJBLGtCQUFpQkE7OzRCQUVqQkEsY0FBY0EsOEJBQ0FBLFlBQVFBLDRDQUNSQSxzRUFDQUEsVUFBUUE7Ozs7O3dCQUsxQkEsVUFBZ0JBO3dCQUNoQkEsV0FBV0Esb0JBQW9CQTt3QkFDL0JBLFFBQVFBLFFBQU9BOzt3QkFFZkEsSUFBSUE7NEJBQ0FBLEtBQUtBLFdBQVdBLEtBQUtBLE1BQU1BO2dDQUN2QkEsU0FBS0E7Z0NBQ0xBLFdBQVdBLEtBQUtBLFVBQVFBLHNFQUF3QkEsR0FDaENBLFlBQVFBLDRDQUNSQSxzRUFBd0JBOzs7O3dCQUloREEsYUFBbUJBLFFBQVFBO3dCQUMzQkEsSUFBSUEsVUFBT0EsZ0JBQUNBLHdDQUF1QkE7d0JBQ25DQSxPQUFPQSxZQUFZQTt3QkFDbkJBLElBQUlBOzRCQUNBQSxLQUFLQSxZQUFXQSxNQUFLQSxNQUFNQTtnQ0FDdkJBLFNBQUtBO2dDQUNMQSxXQUFXQSxLQUFLQSxVQUFRQSxzRUFBd0JBLEdBQ2hDQSxZQUFRQSw0Q0FDUkEsc0VBQXdCQTs7Ozs7Ozs7Ozs7dUNBWTVCQSxHQUFZQSxLQUFTQSxNQUFVQTs7Z0JBQ3ZEQSxjQUFlQSx3Q0FBYUEsa0JBQWFBO2dCQUN6Q0E7O2dCQUVBQSwwQkFBMEJBOzs7O3dCQUN0QkEsSUFBSUEsQ0FBQ0E7OzRCQUVEQTs7Ozt3QkFJSkEsWUFBWUEsUUFBT0EsOENBQWNBLGlCQUNyQkE7Ozt3QkFHWkEsWUFBWUEsdUNBQXVCQTs7d0JBRW5DQSxJQUFJQSxrQkFBaUJBLDBDQUNqQkEsa0JBQWlCQSw2Q0FDakJBLGtCQUFpQkEsNENBQTZCQTs7NEJBRTlDQSxpQkFBU0E7O3dCQUViQSxhQUFhQSxjQUFTQSxhQUFhQSxpQkFDdEJBLHNDQUNBQSw4QkFDQUEsT0FDQUEsVUFBUUE7Ozs7Ozs7OztnQkEyVXpCQSxhQUFnQkEsMEZBQ2NBLHlGQUFNQSwwQ0FBV0Esd0NBQVNBLHNDQUFPQTtnQkFDL0RBLDBCQUErQkE7Ozs7d0JBQzNCQSwyQkFBVUE7Ozs7OztpQkFFZEEsMkJBQTBCQTs7Ozt3QkFDdEJBLDJCQUFVQSx1RUFDY0EsZ0JBQWdCQSw2R0FBZUE7Ozs7OztpQkFFM0RBLElBQUlBLGNBQVNBO29CQUNUQSwyQkFBVUE7O2dCQUVkQSxJQUFJQSxjQUFTQTtvQkFDVEEsMkJBQVVBOztnQkFFZEEsT0FBT0E7Ozs7Ozs7Ozs7Ozs7O29CQ2grQlBBLElBQUlBLG9DQUFVQTt3QkFDVkEsbUNBQVNBLElBQUlBLHNCQUFPQSxBQUFPQTs7O29CQUUvQkEsSUFBSUEsa0NBQVFBO3dCQUNSQSxpQ0FBT0EsSUFBSUEsc0JBQU9BLEFBQU9BOzs7Ozs7Ozs7Ozs7Ozs7b0JBUXZCQSxPQUFPQTs7Ozs7b0JBTVRBLElBQUlBO3dCQUNBQSxPQUFPQTs7d0JBRVBBLE9BQU9BOzs7Ozs7b0JBUVZBLE9BQU9BOzs7b0JBQ1BBLGFBQVFBOzs7OztvQkFRVEEsSUFBSUEsY0FBUUEsOEJBQWVBLENBQUNBO3dCQUN4QkEsT0FBT0E7O3dCQUVQQTs7Ozs7O29CQVNKQSxJQUFJQSxjQUFRQSw4QkFBZUEsQ0FBQ0E7d0JBQ3hCQSxPQUFPQTs7d0JBQ05BLElBQUlBLGNBQVFBLDhCQUFlQTs0QkFDNUJBLE9BQU9BOzs0QkFFUEE7Ozs7Ozs7NEJBakVNQSxNQUFXQSxXQUFlQTs7O2dCQUN4Q0EsWUFBWUE7Z0JBQ1pBLGlCQUFpQkE7Z0JBQ2pCQSxpQkFBWUE7Z0JBQ1pBO2dCQUNBQSxhQUFRQTs7Ozs0QkFvRUZBLEdBQVlBLEtBQVNBO2dCQUMzQkEscUJBQXFCQSxlQUFRQTtnQkFDN0JBLFFBQVFBO2dCQUNSQTtnQkFDQUE7Ozs7O2dCQUtBQSxJQUFJQSxjQUFRQTtvQkFDUkEsUUFBUUE7b0JBQ1JBLElBQUlBO3dCQUNBQSxTQUFTQSx5Q0FBeUJBOzt3QkFFbENBLFNBQVNBLG9DQUFJQSxtREFBMkJBO3dCQUN4Q0EsSUFBSUEsUUFBT0E7OztvQkFJZkEsUUFBUUE7b0JBQ1JBLElBQUlBO3dCQUNBQSxTQUFTQSx5Q0FBeUJBLG1DQUFFQTs7d0JBRXBDQSxTQUFTQSx5Q0FBeUJBOzs7OztnQkFLMUNBLGVBQWVBLDRDQUFjQSxTQUFTQTtnQkFDdENBLFlBQVlBLFVBQVVBLEdBQUdBLFVBQVVBO2dCQUNuQ0EscUJBQXFCQSxHQUFDQSxDQUFDQSxlQUFRQTs7O2dCQUkvQkEsT0FBT0EsZ0VBQ2NBLHlGQUFNQSxxRUFBV0E7Ozs7Ozs7OzRCQzNJcEJBLFVBQWlCQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztnQkNtRG5DQTtnQkFDQUEsSUFBSUE7O29CQUVBQSxjQUFjQTs7Z0JBRWxCQSxjQUFjQTtnQkFDZEEscUNBQWdCQSxrQkFBS0EsQUFBQ0EsY0FBY0EsQ0FBQ0E7Z0JBQ3JDQSxJQUFJQTtvQkFDQUE7O2dCQUVKQTtnQkFDQUEsbUNBQWNBO2dCQUNkQSxzQ0FBaUJBO2dCQUNqQkEscUNBQWdCQTtnQkFDaEJBLHNDQUFpQkE7O2dCQUVqQkEsYUFBUUEsb0RBQVdBLDREQUFnQkEsa0VBQWdCQSxxQ0FBZ0JBO2dCQUNuRUEsY0FBU0Esb0RBQVdBLDREQUFnQkE7Z0JBQ3BDQSxJQUFJQSx3Q0FBbUJBO29CQUNuQkEsdUNBQWtCQSxtQkFDZEEseUNBQWdCQSwrRUFDaEJBLHlDQUFnQkEsK0VBQ2hCQSxvQkFBRUEsc0NBQWdCQSxxRUFDbEJBLG9CQUFFQSxzQ0FBZ0JBLHFFQUNsQkEsc0JBQUVBLHNDQUFnQkEsK0VBQ2xCQSxzQkFBRUEsc0NBQWdCQSwrRUFDbEJBLG9CQUFFQSxzQ0FBZ0JBLHFFQUNsQkEsb0JBQUVBLHNDQUFnQkEscUVBQ2xCQSxvQkFBRUEsc0NBQWdCQSxxRUFDbEJBLG9CQUFFQSxzQ0FBZ0JBOztnQkFHMUJBLFlBQWNBO2dCQUNkQSxZQUFjQTtnQkFDZEEsWUFBY0E7Z0JBQ2RBLGFBQWVBO2dCQUNmQSxhQUFlQTs7Z0JBRWZBLGdCQUFXQSxJQUFJQSxtQkFBSUE7Z0JBQ25CQSxnQkFBV0EsSUFBSUEsbUJBQUlBO2dCQUNuQkEsZ0JBQVdBLElBQUlBLG1CQUFJQTs7Z0JBRW5CQSxrQkFBYUEsSUFBSUEsMEJBQVdBO2dCQUM1QkEsa0JBQWFBLElBQUlBLDBCQUFXQTtnQkFDNUJBLGtCQUFhQSxJQUFJQSwwQkFBV0E7Z0JBQzVCQSxtQkFBY0EsSUFBSUEsMEJBQVdBO2dCQUM3QkEsdUJBQWtCQTtnQkFDbEJBLGlCQUFZQTs7OzttQ0FRUUEsVUFBbUJBOztnQkFDdkNBLElBQUlBLFlBQVlBO29CQUNaQSxhQUFRQTtvQkFDUkE7b0JBQ0FBOzs7Z0JBR0pBLGFBQXlCQSx5QkFBeUJBO2dCQUNsREEsWUFBa0JBLDZDQUE4QkE7Z0JBQ2hEQSxhQUFRQTs7Z0JBRVJBLHdCQUFtQkE7Ozs7O2dCQUtuQkEsS0FBS0Esa0JBQWtCQSxXQUFXQSxjQUFjQTtvQkFDNUNBLDBCQUEwQkEsZUFBT0E7Ozs7NEJBQzdCQSxlQUFlQTs7Ozs7Ozs7Ozs7O2dCQVF2QkE7Z0JBQ0FBLElBQUlBO29CQUNBQTs7O2dCQUdKQSx1QkFBa0JBO2dCQUNsQkE7O3NDQUl1QkEsSUFBVUE7Z0JBQ2pDQTtnQkFDQUE7Z0JBQ0FBLGtCQUFhQSxJQUFJQSwwQkFBV0E7Z0JBQzVCQSxtQkFBY0EsSUFBSUEsMEJBQVdBOzt5Q0FJRkE7Z0JBQzNCQSxZQUFZQSxtREFBZ0JBOzs7Z0JBRzVCQSxXQUFXQSx3QkFBbUJBO2dCQUM5QkEsV0FBV0EsZUFBVUEsVUFBVUEsT0FBT0E7O2dCQUV0Q0EsV0FBV0Esa0JBQWFBLHFDQUFnQkEsT0FBT0E7Z0JBQy9DQSxXQUFXQSxlQUFVQSxzQkFBWUEsbUJBQVNBO2dCQUMxQ0EsV0FBV0Esd0JBQW1CQTs7O2dCQUc5QkEsV0FBV0EsZUFBVUEsa0JBQUVBLHdDQUFrQkEsa0JBQUVBLHFDQUFlQTtnQkFDMURBLFdBQVdBLGVBQVVBLG9CQUFFQSxrREFBc0JBLG9CQUFFQSwrQ0FBbUJBO2dCQUNsRUEsV0FBV0EsZUFBVUEsb0JBQUVBLGtEQUFzQkEsb0JBQUVBLCtDQUFtQkE7OztnQkFHbEVBLEtBQUtBLFdBQVVBLFFBQVFBO29CQUNuQkEsU0FBU0Esd0RBQWdCQSxHQUFoQkE7b0JBQ1RBLFNBQVNBLHdEQUFnQkEsZUFBaEJBOztvQkFFVEEsV0FBV0EsZUFBVUEsT0FBT0EsSUFBSUE7b0JBQ2hDQSxXQUFXQSxlQUFVQSxPQUFPQSxJQUFJQTtvQkFDaENBLFdBQVdBLGVBQVVBLElBQUlBLHFDQUFnQkEsSUFBSUE7b0JBQzdDQSxXQUFXQSxlQUFVQSxtQkFBU0EsZ0JBQU1BO29CQUNwQ0EsV0FBV0EsZUFBVUEsbUJBQVNBLGdCQUFNQTtvQkFDcENBLFdBQVdBLGVBQVVBLGdCQUFNQSxpREFBa0JBLGdCQUFNQTtvQkFDbkRBLFdBQVdBLGVBQVVBLG1CQUFTQSxnQkFBTUE7b0JBQ3BDQSxXQUFXQSxlQUFVQSxtQkFBU0EsZ0JBQU1BO29CQUNwQ0EsV0FBV0EsZUFBVUEsZ0JBQU1BLGlEQUFrQkEsZ0JBQU1BOzs7O2dCQUl2REEsS0FBS0EsWUFBV0EsS0FBSUEsb0NBQWVBO29CQUMvQkEsSUFBSUE7d0JBQ0FBOztvQkFFSkEsV0FBV0EsZUFBVUEsbUJBQUVBLHFDQUFlQSxxQ0FBZ0JBLG1CQUFFQSxxQ0FBZUE7b0JBQ3ZFQSxXQUFXQTtvQkFDWEEsV0FBV0E7b0JBQ1hBLFdBQVdBLE1BQU1BLHFCQUFFQSwrQ0FBbUJBLGlEQUFrQkEscUJBQUVBLCtDQUFtQkE7b0JBQzdFQSxXQUFXQSxNQUFNQSxxQkFBRUEsK0NBQW1CQSxpREFBa0JBLHFCQUFFQSwrQ0FBbUJBOzs7O21DQU01REE7Z0JBQ3JCQSxLQUFLQSxnQkFBZ0JBLFNBQVNBLGdDQUFXQTtvQkFDckNBLHFCQUFxQkEsc0NBQVNBLHFDQUFnQkE7b0JBQzlDQSx1QkFBa0JBO29CQUNsQkEscUJBQXFCQSxHQUFDQSxDQUFDQSxzQ0FBU0EscUNBQWdCQTs7O3FDQUs3QkE7Z0JBQ3ZCQSxLQUFLQSxnQkFBZ0JBLFNBQVNBLGdDQUFXQTtvQkFDckNBLHFCQUFxQkEsc0NBQVNBLHFDQUFnQkE7b0JBQzlDQSxLQUFLQSxXQUFXQSxRQUFRQTt3QkFDcEJBLFNBQVNBLHdEQUFnQkEsR0FBaEJBO3dCQUNUQSxTQUFTQSx3REFBZ0JBLGVBQWhCQTt3QkFDVEEsZ0JBQWdCQSxpQkFBWUEsT0FBT0Esb0NBQWVBO3dCQUNsREEsZ0JBQWdCQSxpQkFBWUEsZ0JBQU1BLHdDQUFpQkEsc0VBQ25DQSxnREFBaUJBOztvQkFFckNBLHFCQUFxQkEsR0FBQ0EsQ0FBQ0Esc0NBQVNBLHFDQUFnQkE7Ozt1Q0FPM0JBO2dCQUN6QkEsaUJBQWlCQSxrRUFBZ0JBLHFDQUFnQkE7Z0JBQ2pEQSxnQkFBZ0JBLGlCQUFZQSw2QkFBUUEsNkJBQVFBLGVBQWFBLDJEQUFlQTtnQkFDeEVBLGdCQUFnQkEsaUJBQVlBLDZCQUFRQSw2QkFBUUEsa0NBQWFBLHdDQUFpQkE7Z0JBQzFFQSxnQkFBZ0JBLGlCQUFZQSw2QkFBUUEsa0NBQVNBLHlDQUFjQSwyQ0FDL0JBLHdEQUFnQkEsa0JBQVlBO2dCQUN4REEsZ0JBQWdCQSxpQkFBWUEsa0NBQVNBLHlDQUFjQSxrQkFBWUEsNkJBQ25DQSxrQ0FBYUEsd0NBQWlCQTs7Z0JBRTFEQSxXQUFXQSxlQUFVQSxnQ0FBU0Esd0NBQWFBLGtDQUFTQSxrREFDL0JBLGtDQUFTQSx5Q0FBY0Esa0JBQVlBLGtDQUFTQTs7Z0JBRWpFQSxxQkFBcUJBLGdDQUFTQSx3Q0FBYUEsZ0NBQVNBOzs7Z0JBR3BEQSxLQUFLQSxXQUFXQSxJQUFJQSxJQUEyQkE7b0JBQzNDQSxnQkFBZ0JBLGlCQUFZQSxvQkFBRUEsK0NBQWlCQSxpREFDOUJBLGdEQUFpQkE7O2dCQUV0Q0EscUJBQXFCQSxHQUFDQSxDQUFDQSxnQ0FBU0EsK0NBQWNBLEdBQUNBLENBQUNBLGdDQUFTQTs7dUNBSWhDQTtnQkFDekJBOzs7Ozs7Ozs7Z0JBQ0FBOzs7Ozs7Ozs7Z0JBQ0FBO2dCQUNBQSxJQUFJQSx5QkFBbUJBO29CQUNuQkEsUUFBUUE7dUJBRVBBLElBQUlBLHlCQUFtQkE7b0JBQ3hCQSxRQUFRQTs7b0JBR1JBOztnQkFFSkEscUJBQXFCQSxnQ0FBU0Esd0NBQWFBLGdDQUFTQTtnQkFDcERBLEtBQUtBLGdCQUFnQkEsU0FBU0EsZ0NBQVdBO29CQUNyQ0EsS0FBS0EsV0FBV0EsSUFBSUEsb0NBQWVBO3dCQUMvQkEsYUFBYUEseUJBQU1BLEdBQU5BLFNBQVVBLHNDQUF1QkEsOEJBQ2pDQSxrQkFBQ0EseUJBQU9BLHNDQUFnQkEsVUFBS0Esc0NBQWdCQSxxRUFDN0NBLHdDQUFpQkE7OztnQkFHdENBLHFCQUFxQkEsR0FBQ0EsQ0FBQ0EsZ0NBQVNBLCtDQUFjQSxHQUFDQSxDQUFDQSxnQ0FBU0E7OytCQUl6QkE7Z0JBQ2hDQSxRQUFhQTtnQkFDYkEsa0JBQWtCQTtnQkFDbEJBLHFCQUFxQkEsZ0NBQVNBLHdDQUFhQSxnQ0FBU0E7Z0JBQ3BEQSxnQkFBZ0JBLG9DQUNBQSxrRUFBZ0JBLHFDQUFnQkEsaUNBQVdBO2dCQUMzREEsbUJBQWNBO2dCQUNkQSxpQkFBWUE7Z0JBQ1pBLHFCQUFxQkEsR0FBQ0EsQ0FBQ0EsZ0NBQVNBLCtDQUFjQSxHQUFDQSxDQUFDQSxnQ0FBU0E7Z0JBQ3pEQSxxQkFBZ0JBO2dCQUNoQkEsSUFBSUEseUJBQW1CQTtvQkFDbkJBLHFCQUFnQkE7O2dCQUVwQkEsa0JBQWtCQTs7b0NBT0lBLEdBQVlBLFlBQWdCQTtnQkFDbERBLGFBQWFBO2dCQUNiQSxnQkFBZ0JBOztnQkFFaEJBO2dCQUNBQSxJQUFJQSxjQUFjQSxVQUFVQTtvQkFDeEJBOzs7Z0JBRUpBLHFCQUFxQkEsc0NBQVNBLHFDQUFnQkE7Z0JBQzlDQTs7Z0JBRUFBLHVCQUF1QkEsdUNBQWlCQSxDQUFDQTs7O2dCQUd6Q0EsUUFBUUE7b0JBQ1JBO3dCQUNJQTt3QkFDQUEsS0FBS0E7d0JBQ0xBLGdCQUFnQkEsT0FBT0EsT0FBT0EsT0FBS0EsVUFBSUE7d0JBQ3ZDQSxnQkFBZ0JBLE9BQU9BLElBQUlBLGlEQUFrQkEsZ0RBQWlCQTt3QkFDOURBO29CQUNKQTt3QkFDSUEsS0FBS0E7d0JBQ0xBLEtBQUtBO3dCQUNMQSxnQkFBZ0JBLE9BQU9BLE9BQU9BLE9BQUtBLFVBQUlBO3dCQUN2Q0EsSUFBSUEsOEJBQVNBOzRCQUNUQSxnQkFBZ0JBLGlCQUFZQSxnQkFDWkEsd0NBQWlCQSxzRUFDakJBLGdEQUFpQkE7O3dCQUVyQ0E7b0JBQ0pBO3dCQUNJQSxLQUFLQTt3QkFDTEEsS0FBS0E7d0JBQ0xBLEtBQUtBO3dCQUNMQSxnQkFBZ0JBLE9BQU9BLE9BQU9BLE9BQUtBLFVBQUlBO3dCQUN2Q0EsZ0JBQWdCQSxPQUFPQSxJQUFJQSxpREFBa0JBLGdEQUFpQkE7d0JBQzlEQTtvQkFDSkE7d0JBQ0lBLEtBQUtBO3dCQUNMQSxLQUFLQTt3QkFDTEEsZ0JBQWdCQSxPQUFPQSxPQUFPQSxvQ0FBZUE7d0JBQzdDQSxJQUFJQSw4QkFBU0E7NEJBQ1RBLGdCQUFnQkEsaUJBQVlBLGdCQUNaQSx3Q0FBaUJBLHNFQUNqQkEsZ0RBQWlCQTs7d0JBRXJDQTtvQkFDSkE7d0JBQ0lBLEtBQUtBO3dCQUNMQSxLQUFLQTt3QkFDTEEsS0FBS0E7d0JBQ0xBLGdCQUFnQkEsT0FBT0EsT0FBT0EsT0FBS0EsVUFBSUE7d0JBQ3ZDQSxnQkFBZ0JBLE9BQU9BLElBQUlBLGlEQUFrQkEsZ0RBQWlCQTt3QkFDOURBO29CQUNKQTt3QkFDSUEsS0FBS0E7d0JBQ0xBLEtBQUtBO3dCQUNMQSxLQUFLQTt3QkFDTEEsZ0JBQWdCQSxPQUFPQSxPQUFPQSxPQUFLQSxVQUFJQTt3QkFDdkNBLGdCQUFnQkEsT0FBT0EsSUFBSUEsaURBQWtCQSxnREFBaUJBO3dCQUM5REE7b0JBQ0pBO3dCQUNJQSxLQUFLQTt3QkFDTEEsS0FBS0E7d0JBQ0xBLGdCQUFnQkEsT0FBT0EsT0FBT0Esb0NBQWVBO3dCQUM3Q0EsSUFBSUEsOEJBQVNBOzRCQUNUQSxnQkFBZ0JBLGlCQUFZQSxnQkFDWkEsd0NBQWlCQSxzRUFDakJBLGdEQUFpQkE7O3dCQUVyQ0E7b0JBQ0pBO3dCQUNJQSxLQUFLQTt3QkFDTEEsS0FBS0E7d0JBQ0xBLEtBQUtBO3dCQUNMQSxnQkFBZ0JBLE9BQU9BLE9BQU9BLE9BQUtBLFVBQUlBO3dCQUN2Q0EsZ0JBQWdCQSxPQUFPQSxJQUFJQSxpREFBa0JBLGdEQUFpQkE7d0JBQzlEQTtvQkFDSkE7d0JBQ0lBLEtBQUtBO3dCQUNMQSxLQUFLQTt3QkFDTEEsZ0JBQWdCQSxPQUFPQSxPQUFPQSxvQ0FBZUE7d0JBQzdDQSxJQUFJQSw4QkFBU0E7NEJBQ1RBLGdCQUFnQkEsaUJBQVlBLGdCQUNaQSx3Q0FBaUJBLHNFQUNqQkEsZ0RBQWlCQTs7d0JBRXJDQTtvQkFDSkE7d0JBQ0lBLEtBQUtBO3dCQUNMQSxLQUFLQTt3QkFDTEEsS0FBS0E7d0JBQ0xBLGdCQUFnQkEsT0FBT0EsT0FBT0EsT0FBS0EsVUFBSUE7d0JBQ3ZDQSxnQkFBZ0JBLE9BQU9BLElBQUlBLGlEQUFrQkEsZ0RBQWlCQTt3QkFDOURBO29CQUNKQTt3QkFDSUEsS0FBS0E7d0JBQ0xBLEtBQUtBO3dCQUNMQSxnQkFBZ0JBLE9BQU9BLE9BQU9BLG9DQUFlQTt3QkFDN0NBLElBQUlBLDhCQUFTQTs0QkFDVEEsZ0JBQWdCQSxpQkFBWUEsZ0JBQ1pBLHdDQUFpQkEsc0VBQ2pCQSxnREFBaUJBOzt3QkFFckNBO29CQUNKQTt3QkFDSUEsS0FBS0E7d0JBQ0xBLEtBQUtBO3dCQUNMQSxLQUFLQSxvREFBZ0JBO3dCQUNyQkEsZ0JBQWdCQSxPQUFPQSxPQUFPQSxPQUFLQSxVQUFJQTt3QkFDdkNBLGdCQUFnQkEsT0FBT0EsSUFBSUEsaURBQWtCQSxnREFBaUJBO3dCQUM5REE7b0JBQ0pBO3dCQUNJQTs7Z0JBRUpBLHFCQUFxQkEsR0FBQ0EsQ0FBQ0Esc0NBQVNBLHFDQUFnQkE7OzRDQU1uQkE7Z0JBQzdCQTtnQkFDQUEsWUFBWUE7O2dCQUVaQSxPQUFPQSxVQUFRQTtvQkFDWEEsUUFBUUEsaUJBQUNBLFVBQVFBO29CQUNqQkEsSUFBSUEsbUJBQU1BLG9CQUFtQkE7d0JBQ3pCQTs7d0JBQ0NBLElBQUlBLG1CQUFNQSxnQkFBZ0JBOzRCQUMzQkEsT0FBT0E7OzRCQUVQQSxRQUFRQTs7OztnQkFFaEJBLE9BQU9BLGFBQWFBLENBQUNBLG1CQUFNQSxnQ0FBcUJBLG1CQUFNQTtvQkFDbERBOztnQkFFSkEsT0FBT0E7OzhDQU13QkE7Z0JBQy9CQSxZQUFZQSxtQkFBTUE7Z0JBQ2xCQSxVQUFVQSxtQkFBTUE7Z0JBQ2hCQSxZQUFZQSxtQkFBTUE7O2dCQUVsQkEsT0FBT0EsSUFBSUE7b0JBQ1BBLElBQUlBLG1CQUFNQSxlQUFjQTt3QkFDcEJBO3dCQUNBQTs7b0JBRUpBLElBQUlBLG1CQUFNQSxlQUFlQTt3QkFDckJBLE9BQU9BLG1CQUFNQTs7b0JBRWpCQSxNQUFNQSxTQUFTQSxLQUFLQSxtQkFBTUE7b0JBQzFCQTs7Z0JBRUpBLE9BQU9BOztxQ0FRZUE7Z0JBQ3RCQSxZQUFZQSxtQkFBTUE7Z0JBQ2xCQSxVQUFVQSxtQkFBTUE7O2dCQUVoQkEsT0FBT0EsSUFBSUE7b0JBQ1BBLElBQUlBLG1CQUFNQSxlQUFlQTt3QkFDckJBLE9BQU9BLG1CQUFNQTs7b0JBRWpCQSxNQUFNQSxTQUFTQSxLQUFLQSxtQkFBTUE7b0JBQzFCQTs7Z0JBRUpBLE9BQU9BOztrQ0FPWUEsa0JBQXNCQTtnQkFDekNBLElBQUlBLGNBQVNBLFFBQVFBO29CQUNqQkE7O2dCQUVKQSxJQUFJQSxpQkFBWUE7b0JBQ1pBLGdCQUFXQTs7Z0JBRWZBLDhCQUF5QkE7Z0JBQ3pCQSxpQ0FBNEJBLGdDQUFTQSx3Q0FBYUEsZ0NBQVNBOzs7Ozs7Z0JBTTNEQSxzQkFBc0JBLDBCQUFxQkEsa0JBQWdCQTtnQkFDM0RBLEtBQUtBLFFBQVFBLGlCQUFpQkEsSUFBSUEsa0JBQWFBO29CQUMzQ0EsWUFBWUEsbUJBQU1BO29CQUNsQkEsVUFBVUEsbUJBQU1BO29CQUNoQkEsaUJBQWlCQSxtQkFBTUE7b0JBQ3ZCQSxnQkFBZ0JBLG1CQUFjQTtvQkFDOUJBLHFCQUFxQkEsNEJBQXVCQTtvQkFDNUNBLE1BQU1BLFNBQVNBLEtBQUtBO29CQUNwQkEsTUFBTUEsU0FBU0EsS0FBS0EsWUFBUUE7OztvQkFHNUJBLElBQUlBLENBQUNBLFFBQVFBLGtCQUFrQkEsQ0FBQ0EsUUFBUUE7d0JBQ3BDQTs7OztvQkFJSkEsSUFBSUEsQ0FBQ0EsU0FBU0EscUJBQXFCQSxDQUFDQSxtQkFBbUJBLGNBQ25EQSxDQUFDQSxtQkFBbUJBLFFBQ3BCQSxDQUFDQSxTQUFTQSxrQkFBa0JBLENBQUNBLGdCQUFnQkEsY0FDN0NBLENBQUNBLGdCQUFnQkE7d0JBQ2pCQTs7OztvQkFJSkEsSUFBSUEsQ0FBQ0EsU0FBU0EscUJBQXFCQSxDQUFDQSxtQkFBbUJBO3dCQUNuREEsSUFBSUE7NEJBQ0FBLElBQUlBLG1CQUFNQTtnQ0FDTkEsa0JBQWFBLGVBQVVBLFlBQVlBOztnQ0FHbkNBLGtCQUFhQSxlQUFVQSxZQUFZQTs7OzRCQUl2Q0Esa0JBQWFBLGVBQVVBLFlBQVlBOzsyQkFLdENBLElBQUlBLENBQUNBLFNBQVNBLGtCQUFrQkEsQ0FBQ0EsZ0JBQWdCQTt3QkFDbERBLFVBQVVBO3dCQUNWQSxJQUFJQSxhQUFZQSxhQUFZQSxhQUFZQSxhQUFZQTs0QkFDaERBLGtCQUFhQSxlQUFVQSxZQUFZQTs7NEJBR25DQSxrQkFBYUEsZUFBVUEsWUFBWUE7Ozs7Z0JBSS9DQSxpQ0FBNEJBLEdBQUNBLENBQUNBLGdDQUFTQSwrQ0FBY0EsR0FBQ0EsQ0FBQ0EsZ0NBQVNBO2dCQUNoRUEsOEJBQXlCQTs7Ozs7Ozs7Ozs7Ozs7O29CQzVmbkJBLE9BQU9BOzs7OztvQkFPUEEsT0FBT0E7OztvQkFDUEEsYUFBUUE7Ozs7O29CQUtSQSxPQUFPQSxvQkFBSUEsd0NBQ1hBOzs7OztvQkFRQUE7Ozs7O29CQU9BQTs7Ozs7NEJBdkNRQSxPQUFXQTs7O2dCQUN6QkEsaUJBQVlBO2dCQUNaQSxnQkFBV0E7Z0JBQ1hBLGFBQVFBOzs7OzRCQTJDRkEsR0FBWUEsS0FBU0E7O2dCQUUzQkEscUJBQXFCQSxlQUFRQTtnQkFDN0JBLHFCQUFxQkE7O2dCQUVyQkEsSUFBSUEsa0JBQVlBO29CQUNaQSxlQUFVQSxHQUFHQSxLQUFLQTt1QkFFakJBLElBQUlBLGtCQUFZQTtvQkFDakJBLGNBQVNBLEdBQUdBLEtBQUtBO3VCQUVoQkEsSUFBSUEsa0JBQVlBO29CQUNqQkEsaUJBQVlBLEdBQUdBLEtBQUtBO3VCQUVuQkEsSUFBSUEsa0JBQVlBO29CQUNqQkEsZ0JBQVdBLEdBQUdBLEtBQUtBOztnQkFFdkJBLHFCQUFxQkEsb0JBQUNBO2dCQUN0QkEscUJBQXFCQSxHQUFDQSxDQUFDQSxlQUFRQTs7aUNBT2JBLEdBQVlBLEtBQVNBO2dCQUN2Q0EsUUFBUUEsUUFBT0E7O2dCQUVmQSxnQkFBZ0JBLGlDQUFrQkEsR0FDbEJBLHFDQUFzQkE7O2dDQU1yQkEsR0FBWUEsS0FBU0E7Z0JBQ3RDQSxRQUFRQSxVQUFPQSw2Q0FBd0JBOztnQkFFdkNBLGdCQUFnQkEsaUNBQWtCQSxHQUNsQkEscUNBQXNCQTs7bUNBTWxCQSxHQUFZQSxLQUFTQTtnQkFDekNBLGFBQWFBOztnQkFFYkEsUUFBUUEsUUFBT0E7Z0JBQ2ZBO2dCQUNBQSxXQUFXQSxLQUFJQSxtQ0FBRUE7Z0JBQ2pCQTtnQkFDQUEsV0FBV0EsS0FBS0EsR0FBR0EsR0FBR0Esa0JBQVFBLFFBQUlBOztnQkFFbENBLFlBQVlBO2dCQUNaQSxJQUFLQSxVQUFPQTtnQkFDWkEsV0FBV0EsS0FBS0Esa0JBQVFBLEdBQUdBLEdBQUdBLE1BQUlBOztnQkFFbENBO2dCQUNBQSxJQUFJQSxVQUFPQTtnQkFDWEEsV0FBV0EsUUFBUUEsR0FBR0Esa0JBQVFBLE1BQUlBOztnQkFFbENBLFlBQVlBO2dCQUNaQSxJQUFJQTtvQkFDQUEsV0FBV0EsS0FBS0EsTUFBTUEsa0JBQVFBLG1DQUFFQSx1REFDaEJBLDhCQUFLQSxrQkFBUUEsbUNBQUVBOztvQkFHL0JBLFdBQVdBLEtBQUtBLE1BQU1BLE1BQUlBLG1DQUFFQSx1REFDWkEsOEJBQUtBLE1BQUlBLG1DQUFFQTs7O2dCQUcvQkE7Z0JBQ0FBLFdBQVdBLFFBQVFBLFFBQUlBLG1DQUFFQSxpRUFDVEEsa0JBQVVBLE1BQUlBLG1DQUFFQTs7a0NBTWJBLEdBQVlBLEtBQVNBO2dCQUN4Q0EsUUFBUUEsVUFBT0E7Z0JBQ2ZBLGNBQWNBLGlDQUFrQkEsZUFDbEJBLGlEQUF3QkE7Z0JBQ3RDQTtnQkFDQUEsV0FBV0EsS0FBS0Esa0JBQUNBLDREQUEyQkEsUUFBSUEscURBQ2hDQSxtQ0FBRUEsZ0RBQXdCQSxNQUFJQTtnQkFDOUNBLFdBQVdBLEtBQUtBLG1DQUFFQSxnREFBd0JBLE1BQUlBLHNFQUM5QkEsbUNBQUVBLGdEQUF3QkEsTUFBSUE7OztnQkFJOUNBLE9BQU9BLHdFQUNjQSwwQ0FBV0EsNkdBQVVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkN6RnRDQTs7OzttQ0E4Y3dCQTtvQkFFeEJBLE9BQU9BOztpREFjV0EsU0FBMkJBLE1BQzNCQSxZQUFnQkEsY0FDaEJBOztvQkFHbEJBLFFBQVFBO29CQUNSQSxnQkFBZ0JBOztvQkFFaEJBO3dCQUVJQTs7O3dCQUdBQSxPQUFPQSxJQUFJQSxrQkFBZ0JBOzRCQUV2QkEsSUFBSUEsMEJBQVFBO2dDQUVSQSxRQUFnQkEsWUFBYUEsZ0JBQVFBO2dDQUNyQ0EsSUFBSUEsVUFBVUE7b0NBRVZBOzs7NEJBR1JBOzt3QkFFSkEsSUFBSUEsS0FBS0Esa0JBQWdCQTs0QkFFckJBLG9EQUFrQkE7NEJBQ2xCQTs7d0JBRUpBLG9EQUFrQkE7d0JBQ2xCQTt3QkFDQUEsS0FBS0Esb0JBQW9CQSxhQUFhQSxXQUFXQTs0QkFFN0NBOzRCQUNBQSxnQkFBZ0JBLHlCQUFnQkE7NEJBQ2hDQSxPQUFPQSxDQUFDQSxJQUFJQSxrQkFBZ0JBLG9CQUFjQSxDQUFDQSwwQkFBUUE7Z0NBRS9DQSxxQ0FBaUJBLGdCQUFRQTtnQ0FDekJBOzs0QkFFSkEsSUFBSUEsS0FBS0Esa0JBQWdCQTtnQ0FFckJBOzs0QkFFSkEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsMEJBQVFBO2dDQUVWQTtnQ0FDQUE7OzRCQUVKQSxnQ0FBYUEsWUFBYkEsaUJBQTJCQTs0QkFDM0JBLHFDQUFpQkEsZ0JBQVFBOzt3QkFFN0JBLElBQUlBOzRCQUVBQTs7Ozs7OzhDQWFPQSxZQUFnQ0EsTUFDaENBLFdBQWVBOztvQkFFOUJBLG1CQUFxQkEsa0JBQVFBO29CQUM3QkEsYUFBdUJBLGtCQUFnQkE7O29CQUV2Q0EsMEJBQXNDQTs7Ozs0QkFFbENBOzRCQUNBQTtnQ0FFSUE7Z0NBQ0FBLFlBQWFBLGdEQUFzQkEsU0FBU0EsTUFDVEEsWUFDQUEsY0FDSUE7Z0NBQ3ZDQSxJQUFJQSxDQUFDQTtvQ0FFREE7O2dDQUVKQSxLQUFLQSxXQUFXQSxJQUFJQSxXQUFXQTtvQ0FFM0JBLDBCQUFPQSxHQUFQQSxXQUFZQSxZQUFhQSxnQkFBUUEsZ0NBQWFBLEdBQWJBOzs7Z0NBR3JDQSxJQUFJQSx5Q0FBMEJBLFFBQVFBLE1BQU1BO29DQUV4Q0Esc0NBQXVCQSxRQUFRQTtvQ0FDL0JBLGFBQWFBLGlDQUFhQSx1QkFBYkE7O29DQUliQSxhQUFhQTs7Ozs7Ozs7Ozs7Ozs7aURBdUJQQSxZQUFnQ0E7b0JBRWxEQSxJQUFJQSxDQUFDQSx3QkFBdUJBLDJCQUN4QkEsQ0FBQ0Esd0JBQXVCQSwyQkFDeEJBLENBQUNBLHdCQUF1QkE7O3dCQUd4QkEsNkNBQW1CQSxZQUFZQTs7b0JBRW5DQSw2Q0FBbUJBLFlBQVlBO29CQUMvQkEsNkNBQW1CQSxZQUFZQTtvQkFDL0JBLDZDQUFtQkEsWUFBWUE7b0JBQy9CQSw2Q0FBbUJBLFlBQVlBOzs2Q0FLakJBOztvQkFFZEEsY0FBcUJBLElBQUlBLDBCQUFXQTtvQkFDcENBLGFBQWFBO29CQUNiQSxXQUFxQkEsZUFBZUE7b0JBQ3BDQSwwQkFBK0JBOzs7OzRCQUUzQkEsbUJBQVVBOzs7Ozs7cUJBRWRBLE9BQU9BLGFBQVNBOztxQ0E2SlZBOztvQkFFTkE7b0JBQ0FBLGFBQTZCQSxrQkFBc0JBO29CQUNuREEsS0FBS0Esa0JBQWtCQSxXQUFXQSxjQUFjQTt3QkFFNUNBLFlBQWtCQSxlQUFPQTt3QkFDekJBLElBQUlBLGdCQUFnQkE7NEJBRWhCQTs7d0JBRUpBO3dCQUNBQSwwQkFBT0EsVUFBUEEsV0FBbUJBLEtBQUlBO3dCQUN2QkEsMEJBQXlCQTs7OztnQ0FFckJBLFdBQWNBLHNDQUE0QkEsYUFBYUE7Z0NBQ3ZEQSxVQUFrQkEsSUFBSUEsMkJBQVlBLGNBQWNBO2dDQUNoREEsMEJBQU9BLFVBQVBBLGFBQXFCQTs7Ozs7OztvQkFHN0JBLElBQUlBLENBQUNBO3dCQUVEQSxPQUFPQTs7d0JBSVBBLE9BQU9BOzs7NkNBTUdBLFFBQW9CQTs7b0JBRWxDQSwwQkFBd0JBOzs7OzRCQUVwQkEsYUFBMkJBLCtCQUFZQSxhQUFaQTs0QkFDM0JBLGdCQUFnQkE7Ozs7Ozs7dUNBNEZPQTtvQkFFM0JBLElBQUlBO3dCQUNBQTs7d0JBRUFBOzs7b0JBRUpBLHdDQUFjQSwwREFBZ0JBO29CQUM5QkEsdUNBQWFBLHVDQUFZQTtvQkFDekJBLHNDQUFZQSxrQ0FBSUE7b0JBQ2hCQSx1Q0FBYUEsSUFBSUEsZ0NBQWlCQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBbkM1QkEsT0FBT0E7Ozs7O29CQU1QQSxPQUFPQTs7Ozs7b0JBTVBBLE9BQU9BOzs7OztvQkFNUEEsT0FBT0E7Ozs7Ozs0Q0FuNUJ5QkEsSUFBSUEsMEJBQVdBOzs0QkFldkNBLE1BQWVBOzs7Z0JBRTdCQSxVQUFLQSxNQUFNQTs7OEJBR0dBLE1BQWVBLFNBQXFCQTs7O2dCQUVsREEsWUFBS0EsTUFBTUEsU0FBU0E7OzhCQU1OQSxNQUFhQSxPQUFjQTs7O2dCQUV6Q0EsV0FBZ0JBLElBQUlBLHdCQUFTQSxNQUFNQTtnQkFDbkNBLFVBQUtBLE1BQU1BOzs7OzhCQUdFQSxNQUFlQSxTQUFxQkE7O2dCQUVqREE7Z0JBQ0FBLGdCQUFXQTs7Z0JBRVhBLGVBQVVBLGdCQUFnQkEsb0JBQW9CQTtnQkFDOUNBLFdBQU1BLElBQUlBLG1CQUFJQTs7Z0JBRWRBLHNDQUFZQTtnQkFDWkEsa0JBQWFBO2dCQUNiQSx1QkFBa0JBO2dCQUNsQkEsV0FBcUJBO2dCQUNyQkEsSUFBSUEsZ0JBQWdCQTtvQkFFaEJBLE9BQU9BOztnQkFFWEEsSUFBSUEsZ0JBQWVBO29CQUVmQSxlQUFVQSxxQkFBZ0JBOztvQkFJMUJBLGVBQVVBLElBQUlBLGlDQUFhQTs7O2dCQUcvQkEsaUJBQVlBOztnQkFFWkEsZ0JBQWdCQSxrQkFBaUJBOzs7Ozs7OztnQkFRakNBLGNBQThCQSxrQkFBc0JBO2dCQUNwREEsS0FBS0Esa0JBQWtCQSxXQUFXQSxnQkFBV0E7b0JBRXpDQSxZQUFrQkEsZUFBT0E7b0JBQ3pCQSxZQUFxQkEsSUFBSUEsNEJBQWFBLGFBQWFBO29CQUNuREEsYUFBMkJBLGtCQUFhQSxhQUFhQSxjQUFTQSxNQUFNQTtvQkFDcEVBLDJCQUFRQSxVQUFSQSxZQUFvQkEsbUJBQWNBLFFBQVFBLE9BQU9BLE1BQU1BOzs7Z0JBRzNEQSxhQUE2QkE7Z0JBQzdCQSxJQUFJQTtvQkFFQUEsU0FBU0Esb0NBQVVBOzs7O2dCQUl2QkEsYUFBc0JBLElBQUlBLDRCQUFhQSxTQUFTQTtnQkFDaERBLGtCQUFhQSxTQUFTQSxRQUFRQTs7Z0JBRTlCQSxjQUFTQSxrQkFBYUEsU0FBU0EsY0FBU0EsU0FBU0E7Z0JBQ2pEQSxnREFBc0JBLFNBQVNBO2dCQUMvQkEsSUFBSUEsVUFBVUE7b0JBRVZBLDRDQUFrQkEsYUFBUUE7Ozs7OztnQkFNOUJBLDBCQUF3QkE7Ozs7d0JBRXBCQTs7Ozs7OztnQkFHSkEsaUJBQVlBOztnQkFFWkE7OzRCQWFhQSxNQUFlQTtnQkFFNUJBLElBQUlBLFdBQVdBO29CQUVYQSxVQUFVQSxJQUFJQSxrQ0FBWUE7O2dCQUU5QkEsYUFBeUJBLHFCQUFxQkE7Z0JBQzlDQSxZQUFLQSxNQUFNQSxTQUFTQTs7O3VDQU1hQTs7Z0JBRWpDQSxlQUFxQkEsS0FBSUE7Z0JBQ3pCQSwwQkFBNEJBOzs7O3dCQUV4QkEsMkJBQTBCQTs7OztnQ0FFdEJBLGFBQWFBOzs7Ozs7Ozs7Ozs7aUJBR3JCQSxPQUFPQSxrQ0FBbUJBOztvQ0FZQ0EsV0FDQUEsS0FDQUEsTUFDQUE7O2dCQUczQkE7Z0JBQ0FBLGFBQTJCQSxLQUFJQTtnQkFDL0JBLGdCQUEyQkEsS0FBSUE7Z0JBQy9CQSxVQUFVQTs7Z0JBRVZBLE9BQU9BLElBQUlBOztvQkFHUEEsZ0JBQWdCQSxrQkFBVUE7b0JBQzFCQSxXQUFZQSxjQUFjQTs7Ozs7b0JBSzFCQTtvQkFDQUEsY0FBY0Esa0JBQVVBO29CQUN4QkE7b0JBQ0FBLE9BQU9BLElBQUlBLE9BQU9BLGtCQUFVQSxpQkFBZ0JBO3dCQUV4Q0EsY0FBY0Esa0JBQVVBO3dCQUN4QkE7Ozs7OztvQkFNSkEsWUFBb0JBLElBQUlBLDJCQUFZQSxXQUFXQSxLQUFLQSxNQUFNQSxNQUFNQTtvQkFDaEVBLFdBQVdBOzs7Z0JBR2ZBLE9BQU9BOztxQ0FRR0EsUUFBMEJBLE9BQzFCQSxNQUFvQkE7O2dCQUc5QkEsY0FBNEJBLEtBQUlBO2dCQUNoQ0EsVUFBVUEsYUFBUUEsUUFBUUEsTUFBTUE7Z0JBQ2hDQSxVQUFVQSxjQUFTQSxTQUFTQTtnQkFDNUJBLFVBQVVBLG9CQUFlQSxTQUFTQSxPQUFPQTs7Z0JBRXpDQSxPQUFPQTs7K0JBT2VBLFFBQTBCQSxNQUFvQkE7O2dCQUdwRUEsY0FBNEJBLEtBQUlBOztnQkFFaENBLGNBQXdCQSxJQUFJQSw2QkFBY0EsZ0JBQWdCQTtnQkFDMURBLFlBQVlBOzs7Z0JBR1pBOztnQkFFQUE7Z0JBQ0FBLE9BQU9BLElBQUlBO29CQUVQQSxJQUFJQSxlQUFlQSxlQUFPQTt3QkFFdEJBLFlBQVlBLElBQUlBLHlCQUFVQTt3QkFDMUJBLDZCQUFlQTs7d0JBSWZBLFlBQVlBLGVBQU9BO3dCQUNuQkE7Ozs7O2dCQUtSQSxPQUFPQSxjQUFjQTtvQkFFakJBLFlBQVlBLElBQUlBLHlCQUFVQTtvQkFDMUJBLDZCQUFlQTs7OztnQkFJbkJBLFlBQVlBLElBQUlBLHlCQUFVQTtnQkFDMUJBLE9BQU9BOztnQ0FPZ0JBLFNBQTJCQTs7Z0JBRWxEQTs7Z0JBRUFBLGFBQTJCQSxLQUFJQSxzRUFBa0JBOztnQkFFakRBLDBCQUErQkE7Ozs7d0JBRTNCQSxnQkFBZ0JBO3dCQUNoQkEsWUFBcUJBLGNBQVNBLE1BQU1BLFVBQVVBO3dCQUM5Q0EsSUFBSUEsU0FBU0E7NEJBRVRBLDJCQUF5QkE7Ozs7b0NBRXJCQSxXQUFXQTs7Ozs7Ozs7d0JBSW5CQSxXQUFXQTs7O3dCQUdYQSxJQUFJQTs0QkFFQUEsWUFBb0JBLFlBQWFBOzRCQUNqQ0EsV0FBV0EsU0FBU0EsZUFBZUE7OzRCQUluQ0EsV0FBV0EsU0FBU0EsV0FBV0E7Ozs7Ozs7aUJBR3ZDQSxPQUFPQTs7Z0NBT1dBLE1BQW9CQSxPQUFXQTtnQkFFakRBO2dCQUNBQTs7Z0JBRUFBLElBQUlBLFFBQU1BO29CQUNOQSxPQUFPQTs7O2dCQUVYQSxVQUFtQkEscUJBQXFCQSxRQUFNQTtnQkFDOUNBLFFBQVFBO29CQUVKQSxLQUFLQTtvQkFDTEEsS0FBS0E7b0JBQ0xBLEtBQUtBO29CQUNMQSxLQUFLQTt3QkFDREEsS0FBS0EsSUFBSUEsMEJBQVdBLE9BQU9BO3dCQUMzQkEsU0FBU0EsbUJBQW1CQTt3QkFDNUJBLE9BQU9BO29CQUVYQSxLQUFLQTt3QkFDREEsS0FBS0EsSUFBSUEsMEJBQVdBLE9BQU9BO3dCQUMzQkEsS0FBS0EsSUFBSUEsMEJBQVdBLFVBQVFBLHVDQUNSQTt3QkFDcEJBLFNBQVNBLG1CQUFtQkEsSUFBSUE7d0JBQ2hDQSxPQUFPQTtvQkFFWEEsS0FBS0E7d0JBQ0RBLEtBQUtBLElBQUlBLDBCQUFXQSxPQUFPQTt3QkFDM0JBLEtBQUtBLElBQUlBLDBCQUFXQSxVQUFRQSxvQkFDUkE7d0JBQ3BCQSxTQUFTQSxtQkFBbUJBLElBQUlBO3dCQUNoQ0EsT0FBT0E7b0JBRVhBLEtBQUtBO3dCQUNEQSxLQUFLQSxJQUFJQSwwQkFBV0EsT0FBT0E7d0JBQzNCQSxLQUFLQSxJQUFJQSwwQkFBV0EsVUFBUUEsK0NBQ1JBO3dCQUNwQkEsU0FBU0EsbUJBQW1CQSxJQUFJQTt3QkFDaENBLE9BQU9BO29CQUVYQTt3QkFDSUEsT0FBT0E7OztzQ0FZY0EsU0FDQUEsT0FDQUE7OztnQkFHN0JBLGFBQTJCQSxLQUFJQSxzRUFBa0JBO2dCQUNqREEsZUFBZ0JBO2dCQUNoQkEsMEJBQStCQTs7Ozs7d0JBRzNCQSxJQUFJQTs0QkFFQUEsV0FBWUEsY0FBY0E7NEJBQzFCQSxJQUFJQSxTQUFRQTtnQ0FFUkEsV0FBV0EsSUFBSUEsMEJBQVdBLE1BQU1BOzs0QkFFcENBLFdBQVdBOzt3QkFFZkEsV0FBV0E7Ozs7OztpQkFFZkEsT0FBT0E7O29DQXNCT0EsWUFBZ0NBLFFBQXFCQTs7OztnQkFJbkVBLElBQUlBO29CQUVBQSxLQUFLQSxlQUFlQSxRQUFRQSxtQkFBbUJBO3dCQUUzQ0EsY0FBNEJBLDhCQUFXQSxPQUFYQTt3QkFDNUJBLDBCQUE0QkE7Ozs7Z0NBRXhCQSxJQUFJQTtvQ0FFQUEseUJBQWFBOzs7Ozs7Ozs7O2dCQU03QkEsS0FBS0EsZ0JBQWVBLFNBQVFBLG1CQUFtQkE7b0JBRTNDQSxlQUE0QkEsOEJBQVdBLFFBQVhBO29CQUM1QkEsYUFBMkJBLEtBQUlBOztvQkFFL0JBOzs7OztvQkFLQUEsMkJBQXNCQTs7Ozs7OzRCQUlsQkEsT0FBT0EsSUFBSUEsa0JBQWlCQSxDQUFDQSwyQkFBUUEsa0NBQ2pDQSxpQkFBUUEsZ0JBQWdCQTtnQ0FFeEJBLFdBQVdBLGlCQUFRQTtnQ0FDbkJBOzs7NEJBR0pBLElBQUlBLElBQUlBLGtCQUFpQkEsaUJBQVFBLGlCQUFnQkE7O2dDQUc3Q0EsT0FBT0EsSUFBSUEsa0JBQ0pBLGlCQUFRQSxpQkFBZ0JBOztvQ0FHM0JBLFdBQVdBLGlCQUFRQTtvQ0FDbkJBOzs7Z0NBS0pBLFdBQVdBLElBQUlBLDJCQUFZQTs7Ozs7Ozs7Ozs7b0JBT25DQTtvQkFDQUEsT0FBT0EsSUFBSUE7d0JBRVBBLElBQUlBLHlCQUFPQTs0QkFFUEE7NEJBQ0FBOzt3QkFFSkEsYUFBWUEsZUFBT0E7d0JBQ25CQSxZQUFZQSxxQkFBcUJBLFFBQU9BO3dCQUN4Q0EsZUFBT0EsV0FBUEEsZ0JBQU9BLFdBQVlBOzs7d0JBR25CQSxPQUFPQSxJQUFJQSxnQkFBZ0JBLGVBQU9BLGlCQUFnQkE7NEJBRTlDQTs7O29CQUdSQSw4QkFBV0EsUUFBWEEsZUFBb0JBOzs7NENBa0xQQSxTQUEyQkEsWUFDM0JBLEtBQWtCQSxTQUNsQkEsT0FBV0E7Z0JBRTVCQSxrQkFBa0JBLDRDQUFrQkE7Z0JBQ3BDQTtnQkFDQUEsZ0JBQXdCQSxLQUFJQSxnRUFBWUE7O2dCQUV4Q0EsT0FBT0EsYUFBYUE7Ozs7b0JBS2hCQSxlQUFlQTtvQkFDZkEsWUFBWUE7b0JBQ1pBOzs7b0JBR0FBLElBQUlBO3dCQUVBQSxXQUFXQTs7d0JBSVhBOzs7b0JBR0pBLE9BQU9BLFdBQVdBLGlCQUNYQSxVQUFRQSxnQkFBUUEsd0JBQWtCQTs7d0JBR3JDQSxpQkFBU0EsZ0JBQVFBO3dCQUNqQkE7O29CQUVKQTs7Ozs7Ozs7Ozs7Ozs7OztvQkFnQkFBLElBQUlBLGFBQVlBOzsyQkFJWEEsSUFBSUEsaUNBQVFBLHVCQUF3QkEsc0JBQ2hDQSxpQ0FBUUEscUJBQXNCQTs7O3dCQU1uQ0EsaUJBQWlCQSxnQ0FBUUEsaUNBQTBCQTt3QkFDbkRBLE9BQU9BLGlDQUFRQSxxQkFBc0JBLHNCQUM5QkE7NEJBRUhBOzs7b0JBR1JBLFlBQVlBLHdCQUFlQTtvQkFDM0JBLElBQUlBO3dCQUVBQSxRQUFRQTs7b0JBRVpBLFlBQWNBLElBQUlBLHFCQUFNQSxpQkFBaUJBLFlBQVlBLFFBQzdCQSxLQUFLQSxTQUFTQSxPQUFPQTtvQkFDN0NBLGNBQWNBO29CQUNkQSxhQUFhQTs7Z0JBRWpCQSxPQUFPQTs7b0NBdUJFQSxZQUFnQ0EsS0FDaENBLFNBQXFCQTs7O2dCQUc5QkEsa0JBQTRCQSxrQkFBZ0JBO2dCQUM1Q0Esa0JBQWtCQTs7Z0JBRWxCQSxLQUFLQSxlQUFlQSxRQUFRQSxhQUFhQTtvQkFFckNBLGNBQTRCQSw4QkFBV0EsT0FBWEE7b0JBQzVCQSwrQkFBWUEsT0FBWkEsZ0JBQXFCQSwwQkFBcUJBLFNBQVNBLFlBQVlBLEtBQUtBLFNBQVNBLE9BQU9BOzs7O2dCQUl4RkEsMEJBQTZCQTs7Ozt3QkFFekJBLEtBQUtBLFdBQVdBLElBQUlBLHdCQUFnQkE7NEJBRWhDQSxhQUFLQSxhQUFhQSxhQUFLQTs7Ozs7Ozs7O2dCQUsvQkE7Z0JBQ0FBLEtBQUtBLFlBQVdBLEtBQUlBLG9CQUFvQkE7b0JBRXBDQSxJQUFJQSxZQUFZQSwrQkFBWUEsSUFBWkE7d0JBRVpBLFlBQVlBLCtCQUFZQSxJQUFaQTs7O2dCQUdwQkEsYUFBcUJBLEtBQUlBLGdFQUFZQSwwQkFBWUE7Z0JBQ2pEQSxLQUFLQSxZQUFXQSxLQUFJQSxXQUFXQTtvQkFFM0JBLDJCQUE2QkE7Ozs7NEJBRXpCQSxJQUFJQSxLQUFJQTtnQ0FFSkEsV0FBV0EsY0FBS0E7Ozs7Ozs7O2dCQUk1QkEsT0FBT0E7OytCQW1EU0E7O2dCQUVoQkEsWUFBT0E7Z0JBQ1BBO2dCQUNBQTtnQkFDQUEsMEJBQXdCQTs7Ozt3QkFFcEJBLFFBQVFBLFNBQVNBLE9BQU9BLGNBQWNBO3dCQUN0Q0EsVUFBVUEsQ0FBQ0EsZUFBZUE7Ozs7OztpQkFFOUJBLGFBQVFBLGtCQUFLQSxBQUFDQTtnQkFDZEEsY0FBU0EsQ0FBQ0Esa0JBQUtBLFVBQVVBO2dCQUN6QkE7O2lDQUltQkEsV0FBbUJBLFVBQWdCQTtnQkFFdERBLElBQUlBLG1CQUFjQTtvQkFFZEEsa0JBQWFBO29CQUNiQSxLQUFLQSxXQUFXQSxRQUFRQTt3QkFFcEJBLG1DQUFXQSxHQUFYQSxvQkFBZ0JBOzs7Z0JBR3hCQSxJQUFJQSxhQUFhQTtvQkFFYkEsS0FBS0EsWUFBV0EsU0FBUUE7d0JBRXBCQSxtQ0FBV0EsSUFBWEEsb0JBQWdCQSw2QkFBVUEsSUFBVkE7OztvQkFLcEJBLEtBQUtBLFlBQVdBLFNBQVFBO3dCQUVwQkEsbUNBQVdBLElBQVhBLG9CQUFnQkE7OztnQkFHeEJBLElBQUlBLG1CQUFjQTtvQkFFZEE7b0JBQ0FBOztnQkFFSkEsa0JBQWFBLElBQUlBLDBCQUFXQTtnQkFDNUJBLG1CQUFjQSxJQUFJQSwwQkFBV0E7O2lDQUlWQTtnQkFFbkJBLE9BQU9BLG1DQUFXQSxvQ0FBcUJBLFNBQWhDQTs7K0JBa0R5QkE7O2dCQUVoQ0EsV0FDRUEsSUFBSUEseUJBQVVBLGtCQUFLQSxBQUFDQSxvQkFBb0JBLFlBQzFCQSxrQkFBS0EsQUFBQ0Esb0JBQW9CQSxZQUMxQkEsa0JBQUtBLEFBQUNBLHdCQUF3QkEsWUFDOUJBLGtCQUFLQSxBQUFDQSx5QkFBeUJBOztnQkFFL0NBLFFBQWFBO2dCQUNiQSxpQkFBaUJBLFdBQU1BOztnQkFFdkJBLGtCQUFrQkE7Z0JBQ2xCQTtnQkFDQUEsMEJBQXdCQTs7Ozt3QkFFcEJBLElBQUlBLENBQUNBLFNBQU9BLHFCQUFlQSxXQUFXQSxDQUFDQSxPQUFPQSxXQUFTQTs7OzRCQU1uREEsd0JBQXdCQTs0QkFDeEJBLFdBQVdBLEdBQUdBLE1BQU1BLFVBQUtBLDBCQUFxQkEsd0JBQW1CQTs0QkFDakVBLHdCQUF3QkEsR0FBQ0E7Ozt3QkFHN0JBLGVBQVFBOzs7Ozs7aUJBRVpBLGlCQUFpQkEsTUFBT0EsV0FBTUEsTUFBT0E7O2lDQUlsQkE7Z0JBRW5CQTtnQkFDQUE7Z0JBQ0FBLFlBQWVBLGdDQUFpQkE7Z0JBQ2hDQSxRQUFRQTtnQkFDUkEsV0FBWUEsSUFBSUEsaUNBQWtCQTtnQkFDbENBLHFCQUFxQkEsWUFBWUE7Z0JBQ2pDQSxhQUFhQSxPQUFPQSxNQUFNQTtnQkFDMUJBLHFCQUFxQkEsR0FBQ0Esa0JBQVlBLEdBQUNBO2dCQUNuQ0E7Ozs7Z0JBV0FBO2dCQUNBQSxpQkFBaUJBOztnQkFFakJBLElBQUlBLHdCQUFrQkEsQ0FBQ0E7b0JBRW5CQSxLQUFLQSxXQUFXQSxJQUFJQSxtQkFBY0E7d0JBRTlCQSxjQUFjQSxxQkFBT0EsWUFBWUEsb0JBQU9BO3dCQUN4Q0EsSUFBSUEsZUFBYUEsZ0JBQVVBOzRCQUV2QkE7NEJBQ0FBLGFBQWFBOzs0QkFJYkEsMkJBQWNBOzs7O29CQU10QkEsMEJBQXdCQTs7Ozs0QkFFcEJBLElBQUlBLGVBQWFBLHFCQUFlQTtnQ0FFNUJBO2dDQUNBQSxhQUFhQTs7Z0NBSWJBLDJCQUFjQTs7Ozs7Ozs7Z0JBSTFCQSxPQUFPQTs7a0NBUWlCQSxrQkFBc0JBLGVBQW1CQTs7Z0JBRWpFQSxRQUFhQTtnQkFDYkEsa0JBQWtCQTtnQkFDbEJBLGlCQUFpQkEsV0FBTUE7Z0JBQ3ZCQTs7Z0JBRUFBO2dCQUNBQTtnQkFDQUE7O2dCQUVBQSwwQkFBd0JBOzs7O3dCQUVwQkEsd0JBQXdCQTt3QkFDeEJBLGlCQUFpQkEsR0FBR0EsaUJBQVlBLFVBQ2ZBLGtCQUFrQkEsZUFBbUJBO3dCQUN0REEsd0JBQXdCQSxHQUFDQTt3QkFDekJBLGVBQVFBO3dCQUNSQSxJQUFJQSxvQkFBb0JBOzRCQUVwQkEscUJBQVdBOzt3QkFFZkEsSUFBSUEsb0JBQW9CQSxtQkFBbUJBLG9CQUFvQkE7NEJBRTNEQSxtQkFBVUE7Ozs7Ozs7aUJBR2xCQSxpQkFBaUJBLE1BQU9BLFdBQU1BLE1BQU9BO2dCQUNyQ0E7Z0JBQ0FBLFlBQVVBLGtCQUFLQSxBQUFDQSxZQUFVQTtnQkFDMUJBLHFCQUFXQTtnQkFDWEEsVUFBVUEsa0JBQUtBLEFBQUNBLFVBQVVBO2dCQUMxQkEsSUFBSUE7b0JBRUFBLHlCQUFvQkEsV0FBU0EsU0FBU0E7O2dCQUUxQ0EsT0FBT0EsSUFBSUEseUJBQVVBLFdBQVNBLFlBQVlBLGtCQUFLQSxBQUFDQSxTQUFTQTs7MkNBT3BDQSxTQUFhQSxTQUFhQTtnQkFFL0NBLGlCQUFtQkEsQUFBT0E7Z0JBQzFCQSxnQkFBa0JBOzs7Z0JBR2xCQSxjQUFjQSxFQUFDQTtnQkFDZkEsY0FBY0EsRUFBQ0E7Z0JBQ2ZBLGFBQWVBOztnQkFFZkEsSUFBSUE7b0JBRUFBLGlCQUFpQkEsQUFBS0EsQUFBQ0EsWUFBVUE7O29CQUVqQ0EsSUFBSUE7d0JBRUFBLElBQUlBLGFBQWFBLENBQUNBLFlBQU9BOzRCQUNyQkEsYUFBYUE7OzRCQUNaQSxJQUFJQSxhQUFhQSxDQUFDQSwwREFBaUJBO2dDQUNwQ0EsYUFBYUEsa0JBQUtBLEFBQUNBLDBEQUFpQkE7Ozs7b0JBRTVDQSxTQUFTQSxJQUFJQSxxQkFBTUEsYUFBYUEsZ0JBQWNBOztvQkFJOUNBLGFBQWFBLGVBQWNBLG9DQUFLQTtvQkFDaENBLFdBQVdBLGVBQWNBLG9DQUFLQTtvQkFDOUJBLGtCQUFpQkEsV0FBVUE7O29CQUUzQkEsSUFBSUE7d0JBRUFBLElBQUlBLFVBQVVBOzRCQUNWQSxjQUFhQSxpQkFBQ0EsWUFBVUE7OzRCQUN2QkEsSUFBSUEsVUFBVUE7Z0NBQ2ZBLGNBQWFBLGlCQUFDQSxZQUFVQTs7Ozs7b0JBR2hDQSxTQUFTQSxJQUFJQSxxQkFBTUEsZ0JBQWNBLG1CQUFZQTtvQkFDN0NBLElBQUlBO3dCQUVBQTs7O2dCQUdSQSxnQ0FBZ0NBOzt5Q0FRUEE7O2dCQUV6QkEsa0JBQW9CQSxJQUFJQSxxQkFBTUEsa0JBQUtBLEFBQUNBLFVBQVVBLFlBQU9BLGtCQUFLQSxBQUFDQSxVQUFVQTtnQkFDckVBO2dCQUNBQSwwQkFBd0JBOzs7O3dCQUVwQkEsSUFBSUEsaUJBQWlCQSxLQUFLQSxpQkFBaUJBLE1BQUlBOzRCQUUzQ0EsT0FBT0Esd0JBQXdCQTs7d0JBRW5DQSxTQUFLQTs7Ozs7O2lCQUVUQSxPQUFPQTs7OztnQkFLUEEsYUFBZ0JBLHVCQUF1QkE7Z0JBQ3ZDQSwwQkFBd0JBOzs7O3dCQUVwQkEsMkJBQVVBOzs7Ozs7aUJBRWRBO2dCQUNBQSxPQUFPQTs7Ozs7Ozs7NEJDanNDT0E7O3FEQUNUQTs7Ozs7Ozs7Ozs7OztvQkN3Q1RBLElBQUlBLHVDQUFVQTt3QkFDVkEsc0NBQVNBO3dCQUNUQSxLQUFLQSxXQUFXQSxRQUFRQTs0QkFDcEJBLHVEQUFPQSxHQUFQQSx3Q0FBWUE7O3dCQUVoQkEsa0dBQVlBLElBQUlBLHNCQUFPQSxBQUFPQTt3QkFDOUJBLGtHQUFZQSxJQUFJQSxzQkFBT0EsQUFBT0E7d0JBQzlCQSxrR0FBWUEsSUFBSUEsc0JBQU9BLEFBQU9BO3dCQUM5QkEsa0dBQVlBLElBQUlBLHNCQUFPQSxBQUFPQTt3QkFDOUJBLGtHQUFZQSxJQUFJQSxzQkFBT0EsQUFBT0E7d0JBQzlCQSxrR0FBWUEsSUFBSUEsc0JBQU9BLEFBQU9BO3dCQUM5QkEsbUdBQWFBLElBQUlBLHNCQUFPQSxBQUFPQTs7Ozs7Ozs7Ozs7Ozs7b0JBTTdCQSxPQUFPQTs7Ozs7b0JBS1BBLElBQUlBO3dCQUNBQSxPQUFPQSxzSkFBa0JBLDJDQUEyQkE7O3dCQUVwREE7Ozs7OztvQkFRTEEsT0FBT0E7OztvQkFDUEEsYUFBUUE7Ozs7O29CQU9OQTs7Ozs7b0JBT0RBOzs7Ozs0QkFoRVdBLE9BQVdBOzs7Z0JBQzVCQSxpQkFBWUE7Z0JBQ1pBLG1CQUFjQTtnQkFDZEE7Z0JBQ0FBLElBQUlBLGNBQWNBLFFBQVFBLDhDQUFpQkEsdURBQU9BLE9BQVBBLHlDQUFpQkEsUUFDeERBLGNBQWNBLFFBQVFBLDhDQUFpQkEsdURBQU9BLE9BQVBBLHlDQUFpQkE7b0JBQ3hEQTs7b0JBR0FBOztnQkFFSkEsYUFBUUE7Ozs7NEJBNERGQSxHQUFZQSxLQUFTQTtnQkFDM0JBLElBQUlBLENBQUNBO29CQUNEQTs7O2dCQUVKQSxxQkFBcUJBLGVBQVFBO2dCQUM3QkEsWUFBY0EsdURBQU9BLGdCQUFQQTtnQkFDZEEsWUFBY0EsdURBQU9BLGtCQUFQQTs7O2dCQUdkQSxnQkFBZ0JBO2dCQUNoQkEsZUFBZUEsNENBQWNBLFlBQVlBO2dCQUN6Q0EsWUFBWUEsVUFBVUEsTUFBTUEsVUFBVUE7Z0JBQ3RDQSxZQUFZQSxVQUFVQSxTQUFPQSwrREFBeUJBLFVBQVVBO2dCQUNoRUEscUJBQXFCQSxHQUFDQSxDQUFDQSxlQUFRQTs7O2dCQUkvQkEsT0FBT0Esb0VBQ2NBLDBDQUFXQSIsCiAgInNvdXJjZXNDb250ZW50IjogWyJ1c2luZyBCcmlkZ2U7XHJcbnVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBJbWFnZVxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBvYmplY3QgRG9tSW1hZ2U7XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBJbWFnZShUeXBlIHR5cGUsIHN0cmluZyBmaWxlbmFtZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5pbWFnZS5jdG9yXCIsIHRoaXMsIHR5cGUsIGZpbGVuYW1lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBpbnQgV2lkdGhcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdldFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gU2NyaXB0LkNhbGw8aW50PihcImJyaWRnZVV0aWwuaW1hZ2UuZ2V0V2lkdGhcIiwgdGhpcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBpbnQgSGVpZ2h0XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXRcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFNjcmlwdC5DYWxsPGludD4oXCJicmlkZ2VVdGlsLmltYWdlLmdldEhlaWdodFwiLCB0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIC8vYWRhcHRlZCBmcm9tIGh0dHBzOi8vd3d3LmNvZGVwcm9qZWN0LmNvbS9BcnRpY2xlcy8xMDYxMy8lMkZBcnRpY2xlcyUyRjEwNjEzJTJGQy1SSUZGLVBhcnNlclxyXG4gICAgLy9tb2RpZmllZCB0byB1c2UgYnl0ZSBhcnJheSBpbnN0ZWFkIG9mIHN0cmVhbSBzaW5jZSB0aGlzIHdpbGwgYmUgY29tcGlsZWQgdG8gSmF2YXNjcmlwdFxyXG4gICAgcHVibGljIGNsYXNzIFJpZmZQYXJzZXJFeGNlcHRpb24gOiBFeGNlcHRpb25cclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgUmlmZlBhcnNlckV4Y2VwdGlvbihzdHJpbmcgbWVzc2FnZSlcclxuICAgICAgICAgICAgOiBiYXNlKG1lc3NhZ2UpXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNsYXNzIFJpZmZGaWxlSW5mb1xyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBzdHJpbmcgSGVhZGVyIHsgZ2V0OyBzZXQ7IH1cclxuICAgICAgICBwdWJsaWMgc3RyaW5nIEZpbGVUeXBlIHsgZ2V0OyBzZXQ7IH1cclxuICAgICAgICBwdWJsaWMgaW50IEZpbGVTaXplIHsgZ2V0OyBzZXQ7IH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2xhc3MgQm91bmRlZEJ5dGVBcnJheVxyXG4gICAge1xyXG4gICAgICAgIHByaXZhdGUgaW50IG9mZnNldDtcclxuICAgICAgICBwcml2YXRlIGludCBjb3VudDtcclxuICAgICAgICBwcml2YXRlIGJ5dGVbXSBkYXRhO1xyXG4gICAgICAgIHB1YmxpYyBCb3VuZGVkQnl0ZUFycmF5KGludCBvZmZzZXQsIGludCBjb3VudCwgYnl0ZVtdIGRhdGEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm9mZnNldCA9IG9mZnNldDtcclxuICAgICAgICAgICAgdGhpcy5jb3VudCA9IGNvdW50O1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGJ5dGVbXSBHZXREYXRhKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGJ5dGVbXSBzbGljZSA9IG5ldyBieXRlW2NvdW50XTtcclxuICAgICAgICAgICAgQXJyYXkuQ29weShkYXRhLCBvZmZzZXQsIHNsaWNlLCAwLCBjb3VudCk7XHJcbiAgICAgICAgICAgIHJldHVybiBzbGljZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRlbGVnYXRlIHZvaWQgUHJvY2Vzc0VsZW1lbnQoc3RyaW5nIHR5cGUsIGJvb2wgaXNMaXN0LCBCb3VuZGVkQnl0ZUFycmF5IGRhdGEpO1xyXG5cclxuXHJcbiAgICBwdWJsaWMgY2xhc3MgUmlmZlBhcnNlclxyXG4gICAge1xyXG4gICAgICAgIHByaXZhdGUgY29uc3QgaW50IFdvcmRTaXplID0gNDtcclxuICAgICAgICBwcml2YXRlIGNvbnN0IHN0cmluZyBSaWZmNENDID0gXCJSSUZGXCI7XHJcbiAgICAgICAgcHJpdmF0ZSBjb25zdCBzdHJpbmcgUmlmWDRDQyA9IFwiUklGWFwiO1xyXG4gICAgICAgIHByaXZhdGUgY29uc3Qgc3RyaW5nIExpc3Q0Q0MgPSBcIkxJU1RcIjtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBieXRlW10gZGF0YTtcclxuICAgICAgICBwcml2YXRlIGludCBwb3NpdGlvbjtcclxuXHJcbiAgICAgICAgcHVibGljIFJpZmZGaWxlSW5mbyBGaWxlSW5mbyB7IGdldDsgcHJpdmF0ZSBzZXQ7IH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgUmlmZkZpbGVJbmZvIFJlYWRIZWFkZXIoYnl0ZVtdIGRhdGEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5MZW5ndGggPCBXb3JkU2l6ZSAqIDMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBSaWZmUGFyc2VyRXhjZXB0aW9uKFwiUmVhZCBmYWlsZWQuIEZpbGUgdG9vIHNtYWxsP1wiKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3RyaW5nIGhlYWRlcjtcclxuICAgICAgICAgICAgaWYgKCFJc1JpZmZGaWxlKGRhdGEsIG91dCBoZWFkZXIpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUmlmZlBhcnNlckV4Y2VwdGlvbihcIlJlYWQgZmFpbGVkLiBObyBSSUZGIGhlYWRlclwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFJpZmZGaWxlSW5mb1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBIZWFkZXIgPSBoZWFkZXIsXHJcbiAgICAgICAgICAgICAgICBGaWxlU2l6ZSA9IEJpdENvbnZlcnRlci5Ub0ludDMyKGRhdGEsIFdvcmRTaXplKSxcclxuICAgICAgICAgICAgICAgIEZpbGVUeXBlID0gRW5jb2RpbmcuQVNDSUkuR2V0U3RyaW5nKGRhdGEsIFdvcmRTaXplICogMiwgV29yZFNpemUpLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBSaWZmUGFyc2VyKCkgeyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgUmlmZlBhcnNlciBQYXJzZUJ5dGVBcnJheShieXRlW10gZGF0YSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciByaWZmUGFyc2VyID0gbmV3IFJpZmZQYXJzZXIoKTtcclxuICAgICAgICAgICAgcmlmZlBhcnNlci5Jbml0KGRhdGEpO1xyXG4gICAgICAgICAgICByZXR1cm4gcmlmZlBhcnNlcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIEluaXQoYnl0ZVtdIGRhdGEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gICAgICAgICAgICBGaWxlSW5mbyA9IFJlYWRIZWFkZXIoZGF0YSk7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uID0gV29yZFNpemUgKiAzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBib29sIElzUmlmZkZpbGUoYnl0ZVtdIGRhdGEsIG91dCBzdHJpbmcgaGVhZGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIHRlc3QgPSBFbmNvZGluZy5BU0NJSS5HZXRTdHJpbmcoZGF0YSwgMCwgV29yZFNpemUpO1xyXG4gICAgICAgICAgICBpZiAodGVzdCA9PSBSaWZmNENDIHx8IHRlc3QgPT0gUmlmWDRDQylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaGVhZGVyID0gdGVzdDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGhlYWRlciA9IG51bGw7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBib29sIFJlYWQoUHJvY2Vzc0VsZW1lbnQgcHJvY2Vzc0VsZW1lbnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5MZW5ndGggLSBwb3NpdGlvbiA8IFdvcmRTaXplICogMilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgdHlwZSA9IEVuY29kaW5nLkFTQ0lJLkdldFN0cmluZyhkYXRhLCBwb3NpdGlvbiwgV29yZFNpemUpO1xyXG4gICAgICAgICAgICBwb3NpdGlvbiArPSBXb3JkU2l6ZTtcclxuICAgICAgICAgICAgdmFyIHNpemUgPSBCaXRDb252ZXJ0ZXIuVG9JbnQzMihkYXRhLCBwb3NpdGlvbik7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uICs9IFdvcmRTaXplO1xyXG5cclxuICAgICAgICAgICAgaWYgKGRhdGEuTGVuZ3RoIC0gcG9zaXRpb24gPCBzaXplKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUmlmZlBhcnNlckV4Y2VwdGlvbihzdHJpbmcuRm9ybWF0KFwiRWxlbWVudCBzaXplIG1pc21hdGNoIGZvciBlbGVtZW50IHswfSBcIix0eXBlKStcclxuc3RyaW5nLkZvcm1hdChcIm5lZWQgezB9IGJ1dCBoYXZlIG9ubHkgezF9XCIsc2l6ZSxGaWxlSW5mby5GaWxlU2l6ZSAtIHBvc2l0aW9uKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlID09IExpc3Q0Q0MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHZhciBsaXN0VHlwZSA9IEVuY29kaW5nLkFTQ0lJLkdldFN0cmluZyhkYXRhLCBwb3NpdGlvbiwgV29yZFNpemUpO1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc0VsZW1lbnQobGlzdFR5cGUsIHRydWUsIG5ldyBCb3VuZGVkQnl0ZUFycmF5KHBvc2l0aW9uICsgV29yZFNpemUsIHNpemUsIGRhdGEpKTtcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uICs9IHNpemU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGFkZGVkU2l6ZSA9IHNpemU7XHJcbiAgICAgICAgICAgICAgICBpZiAoKHNpemUgJiAxKSAhPSAwKSBwYWRkZWRTaXplKys7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzRWxlbWVudCh0eXBlLCBmYWxzZSwgbmV3IEJvdW5kZWRCeXRlQXJyYXkocG9zaXRpb24sIHNpemUsIGRhdGEpKTtcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uICs9IHBhZGRlZFNpemU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBCcnVzaFxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBDb2xvciBDb2xvcjtcclxuXHJcbiAgICAgICAgcHVibGljIEJydXNoKENvbG9yIGNvbG9yKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQ29sb3IgPSBjb2xvcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIERpc3Bvc2UoKSB7IH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgc3RhdGljIGNsYXNzIEJydXNoZXNcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIEJydXNoIEJsYWNrIHsgZ2V0IHsgcmV0dXJuIG5ldyBCcnVzaChDb2xvci5CbGFjayk7IH0gfVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQnJ1c2ggV2hpdGUgeyBnZXQgeyByZXR1cm4gbmV3IEJydXNoKENvbG9yLldoaXRlKTsgfSB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBCcnVzaCBMaWdodEdyYXkgeyBnZXQgeyByZXR1cm4gbmV3IEJydXNoKENvbG9yLkxpZ2h0R3JheSk7IH0gfVxyXG4gICAgfVxyXG59XHJcbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAwOCBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbi8qKiBAY2xhc3MgQ2xlZk1lYXN1cmVzXG4gKiBUaGUgQ2xlZk1lYXN1cmVzIGNsYXNzIGlzIHVzZWQgdG8gcmVwb3J0IHdoYXQgQ2xlZiAoVHJlYmxlIG9yIEJhc3MpIGFcbiAqIGdpdmVuIG1lYXN1cmUgdXNlcy5cbiAqL1xucHVibGljIGNsYXNzIENsZWZNZWFzdXJlcyB7XG4gICAgcHJpdmF0ZSBMaXN0PENsZWY+IGNsZWZzOyAgLyoqIFRoZSBjbGVmcyB1c2VkIGZvciBlYWNoIG1lYXN1cmUgKGZvciBhIHNpbmdsZSB0cmFjaykgKi9cbiAgICBwcml2YXRlIGludCBtZWFzdXJlOyAgICAgICAvKiogVGhlIGxlbmd0aCBvZiBhIG1lYXN1cmUsIGluIHB1bHNlcyAqL1xuXG4gXG4gICAgLyoqIEdpdmVuIHRoZSBub3RlcyBpbiBhIHRyYWNrLCBjYWxjdWxhdGUgdGhlIGFwcHJvcHJpYXRlIENsZWYgdG8gdXNlXG4gICAgICogZm9yIGVhY2ggbWVhc3VyZS4gIFN0b3JlIHRoZSByZXN1bHQgaW4gdGhlIGNsZWZzIGxpc3QuXG4gICAgICogQHBhcmFtIG5vdGVzICBUaGUgbWlkaSBub3Rlc1xuICAgICAqIEBwYXJhbSBtZWFzdXJlbGVuIFRoZSBsZW5ndGggb2YgYSBtZWFzdXJlLCBpbiBwdWxzZXNcbiAgICAgKi9cbiAgICBwdWJsaWMgQ2xlZk1lYXN1cmVzKExpc3Q8TWlkaU5vdGU+IG5vdGVzLCBpbnQgbWVhc3VyZWxlbikge1xuICAgICAgICBtZWFzdXJlID0gbWVhc3VyZWxlbjtcbiAgICAgICAgQ2xlZiBtYWluY2xlZiA9IE1haW5DbGVmKG5vdGVzKTtcbiAgICAgICAgaW50IG5leHRtZWFzdXJlID0gbWVhc3VyZWxlbjtcbiAgICAgICAgaW50IHBvcyA9IDA7XG4gICAgICAgIENsZWYgY2xlZiA9IG1haW5jbGVmO1xuXG4gICAgICAgIGNsZWZzID0gbmV3IExpc3Q8Q2xlZj4oKTtcblxuICAgICAgICB3aGlsZSAocG9zIDwgbm90ZXMuQ291bnQpIHtcbiAgICAgICAgICAgIC8qIFN1bSBhbGwgdGhlIG5vdGVzIGluIHRoZSBjdXJyZW50IG1lYXN1cmUgKi9cbiAgICAgICAgICAgIGludCBzdW1ub3RlcyA9IDA7XG4gICAgICAgICAgICBpbnQgbm90ZWNvdW50ID0gMDtcbiAgICAgICAgICAgIHdoaWxlIChwb3MgPCBub3Rlcy5Db3VudCAmJiBub3Rlc1twb3NdLlN0YXJ0VGltZSA8IG5leHRtZWFzdXJlKSB7XG4gICAgICAgICAgICAgICAgc3Vtbm90ZXMgKz0gbm90ZXNbcG9zXS5OdW1iZXI7XG4gICAgICAgICAgICAgICAgbm90ZWNvdW50Kys7XG4gICAgICAgICAgICAgICAgcG9zKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm90ZWNvdW50ID09IDApXG4gICAgICAgICAgICAgICAgbm90ZWNvdW50ID0gMTtcblxuICAgICAgICAgICAgLyogQ2FsY3VsYXRlIHRoZSBcImF2ZXJhZ2VcIiBub3RlIGluIHRoZSBtZWFzdXJlICovXG4gICAgICAgICAgICBpbnQgYXZnbm90ZSA9IHN1bW5vdGVzIC8gbm90ZWNvdW50O1xuICAgICAgICAgICAgaWYgKGF2Z25vdGUgPT0gMCkge1xuICAgICAgICAgICAgICAgIC8qIFRoaXMgbWVhc3VyZSBkb2Vzbid0IGNvbnRhaW4gYW55IG5vdGVzLlxuICAgICAgICAgICAgICAgICAqIEtlZXAgdGhlIHByZXZpb3VzIGNsZWYuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChhdmdub3RlID49IFdoaXRlTm90ZS5Cb3R0b21UcmVibGUuTnVtYmVyKCkpIHtcbiAgICAgICAgICAgICAgICBjbGVmID0gQ2xlZi5UcmVibGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChhdmdub3RlIDw9IFdoaXRlTm90ZS5Ub3BCYXNzLk51bWJlcigpKSB7XG4gICAgICAgICAgICAgICAgY2xlZiA9IENsZWYuQmFzcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8qIFRoZSBhdmVyYWdlIG5vdGUgaXMgYmV0d2VlbiBHMyBhbmQgRjQuIFdlIGNhbiB1c2UgZWl0aGVyXG4gICAgICAgICAgICAgICAgICogdGhlIHRyZWJsZSBvciBiYXNzIGNsZWYuICBVc2UgdGhlIFwibWFpblwiIGNsZWYsIHRoZSBjbGVmXG4gICAgICAgICAgICAgICAgICogdGhhdCBhcHBlYXJzIG1vc3QgZm9yIHRoaXMgdHJhY2suXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgY2xlZiA9IG1haW5jbGVmO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbGVmcy5BZGQoY2xlZik7XG4gICAgICAgICAgICBuZXh0bWVhc3VyZSArPSBtZWFzdXJlbGVuO1xuICAgICAgICB9XG4gICAgICAgIGNsZWZzLkFkZChjbGVmKTtcbiAgICB9XG5cbiAgICAvKiogR2l2ZW4gYSB0aW1lIChpbiBwdWxzZXMpLCByZXR1cm4gdGhlIGNsZWYgdXNlZCBmb3IgdGhhdCBtZWFzdXJlLiAqL1xuICAgIHB1YmxpYyBDbGVmIEdldENsZWYoaW50IHN0YXJ0dGltZSkge1xuXG4gICAgICAgIC8qIElmIHRoZSB0aW1lIGV4Y2VlZHMgdGhlIGxhc3QgbWVhc3VyZSwgcmV0dXJuIHRoZSBsYXN0IG1lYXN1cmUgKi9cbiAgICAgICAgaWYgKHN0YXJ0dGltZSAvIG1lYXN1cmUgPj0gY2xlZnMuQ291bnQpIHtcbiAgICAgICAgICAgIHJldHVybiBjbGVmc1sgY2xlZnMuQ291bnQtMSBdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGNsZWZzWyBzdGFydHRpbWUgLyBtZWFzdXJlIF07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogQ2FsY3VsYXRlIHRoZSBiZXN0IGNsZWYgdG8gdXNlIGZvciB0aGUgZ2l2ZW4gbm90ZXMuICBJZiB0aGVcbiAgICAgKiBhdmVyYWdlIG5vdGUgaXMgYmVsb3cgTWlkZGxlIEMsIHVzZSBhIGJhc3MgY2xlZi4gIEVsc2UsIHVzZSBhIHRyZWJsZVxuICAgICAqIGNsZWYuXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgQ2xlZiBNYWluQ2xlZihMaXN0PE1pZGlOb3RlPiBub3Rlcykge1xuICAgICAgICBpbnQgbWlkZGxlQyA9IFdoaXRlTm90ZS5NaWRkbGVDLk51bWJlcigpO1xuICAgICAgICBpbnQgdG90YWwgPSAwO1xuICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBtIGluIG5vdGVzKSB7XG4gICAgICAgICAgICB0b3RhbCArPSBtLk51bWJlcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm90ZXMuQ291bnQgPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIENsZWYuVHJlYmxlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRvdGFsL25vdGVzLkNvdW50ID49IG1pZGRsZUMpIHtcbiAgICAgICAgICAgIHJldHVybiBDbGVmLlRyZWJsZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBDbGVmLkJhc3M7XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxufVxuXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgQ29sb3JcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgaW50IFJlZDtcclxuICAgICAgICBwdWJsaWMgaW50IEdyZWVuO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgQmx1ZTtcclxuICAgICAgICBwdWJsaWMgaW50IEFscGhhO1xyXG5cclxuICAgICAgICBwdWJsaWMgQ29sb3IoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQWxwaGEgPSAyNTU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIENvbG9yIEZyb21BcmdiKGludCByZWQsIGludCBncmVlbiwgaW50IGJsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEZyb21BcmdiKDI1NSwgcmVkLCBncmVlbiwgYmx1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIENvbG9yIEZyb21BcmdiKGludCBhbHBoYSwgaW50IHJlZCwgaW50IGdyZWVuLCBpbnQgYmx1ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ29sb3JcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgQWxwaGEgPSBhbHBoYSxcclxuICAgICAgICAgICAgICAgIFJlZCA9IHJlZCxcclxuICAgICAgICAgICAgICAgIEdyZWVuID0gZ3JlZW4sXHJcbiAgICAgICAgICAgICAgICBCbHVlID0gYmx1ZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBDb2xvciBCbGFjayB7IGdldCB7IHJldHVybiBuZXcgQ29sb3IoKTsgfSB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQ29sb3IgV2hpdGUgeyBnZXQgeyByZXR1cm4gRnJvbUFyZ2IoMjU1LDI1NSwyNTUpOyB9IH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBDb2xvciBMaWdodEdyYXkgeyBnZXQgeyByZXR1cm4gRnJvbUFyZ2IoMHhkMywweGQzLDB4ZDMpOyB9IH1cclxuXHJcbiAgICAgICAgcHVibGljIGludCBSIHsgZ2V0IHsgcmV0dXJuIFJlZDsgfSB9XHJcbiAgICAgICAgcHVibGljIGludCBHIHsgZ2V0IHsgcmV0dXJuIEdyZWVuOyB9IH1cclxuICAgICAgICBwdWJsaWMgaW50IEIgeyBnZXQgeyByZXR1cm4gQmx1ZTsgfSB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBib29sIEVxdWFscyhDb2xvciBjb2xvcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiBSZWQgPT0gY29sb3IuUmVkICYmIEdyZWVuID09IGNvbG9yLkdyZWVuICYmIEJsdWUgPT0gY29sb3IuQmx1ZSAmJiBBbHBoYT09Y29sb3IuQWxwaGE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBDb250cm9sXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIGludCBXaWR0aDtcclxuICAgICAgICBwdWJsaWMgaW50IEhlaWdodDtcclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgSW52YWxpZGF0ZSgpIHsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgR3JhcGhpY3MgQ3JlYXRlR3JhcGhpY3Moc3RyaW5nIG5hbWUpIHsgcmV0dXJuIG5ldyBHcmFwaGljcyhuYW1lKTsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgUGFuZWwgUGFyZW50IHsgZ2V0IHsgcmV0dXJuIG5ldyBQYW5lbCgpOyB9IH1cclxuXHJcbiAgICAgICAgcHVibGljIENvbG9yIEJhY2tDb2xvcjtcclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgU3RyZWFtXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIHZvaWQgV3JpdGUoYnl0ZVtdIGJ1ZmZlciwgaW50IG9mZnNldCwgaW50IGNvdW50KSB7IH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgQ2xvc2UoKSB7IH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgRm9udFxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBzdHJpbmcgTmFtZTtcclxuICAgICAgICBwdWJsaWMgaW50IFNpemU7XHJcbiAgICAgICAgcHVibGljIEZvbnRTdHlsZSBTdHlsZTtcclxuXHJcbiAgICAgICAgcHVibGljIEZvbnQoc3RyaW5nIG5hbWUsIGludCBzaXplLCBGb250U3R5bGUgc3R5bGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBOYW1lID0gbmFtZTtcclxuICAgICAgICAgICAgU2l6ZSA9IHNpemU7XHJcbiAgICAgICAgICAgIFN0eWxlID0gc3R5bGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZmxvYXQgR2V0SGVpZ2h0KCkgeyByZXR1cm4gMDsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBEaXNwb3NlKCkgeyB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgQnJpZGdlO1xyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgR3JhcGhpY3NcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgR3JhcGhpY3Moc3RyaW5nIG5hbWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBOYW1lID0gbmFtZTtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLmluaXRHcmFwaGljc1wiLCB0aGlzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdHJpbmcgTmFtZTtcclxuXHJcbiAgICAgICAgcHVibGljIG9iamVjdCBDb250ZXh0O1xyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBUcmFuc2xhdGVUcmFuc2Zvcm0oaW50IHgsIGludCB5KSB7XHJcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy50cmFuc2xhdGVUcmFuc2Zvcm1cIiwgdGhpcywgeCwgeSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBEcmF3SW1hZ2UoSW1hZ2UgaW1hZ2UsIGludCB4LCBpbnQgeSwgaW50IHdpZHRoLCBpbnQgaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy5kcmF3SW1hZ2VcIiwgdGhpcywgaW1hZ2UsIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgRHJhd1N0cmluZyhzdHJpbmcgdGV4dCwgRm9udCBmb250LCBCcnVzaCBicnVzaCwgaW50IHgsIGludCB5KSB7XHJcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy5kcmF3U3RyaW5nXCIsIHRoaXMsIHRleHQsIGZvbnQsIGJydXNoLCB4LCB5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIERyYXdMaW5lKFBlbiBwZW4sIGludCB4U3RhcnQsIGludCB5U3RhcnQsIGludCB4RW5kLCBpbnQgeUVuZCkge1xyXG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3MuZHJhd0xpbmVcIiwgdGhpcywgcGVuLCB4U3RhcnQsIHlTdGFydCwgeEVuZCwgeUVuZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBEcmF3QmV6aWVyKFBlbiBwZW4sIGludCB4MSwgaW50IHkxLCBpbnQgeDIsIGludCB5MiwgaW50IHgzLCBpbnQgeTMsIGludCB4NCwgaW50IHk0KSB7XHJcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy5kcmF3QmV6aWVyXCIsIHRoaXMsIHBlbiwgeDEsIHkxLCB4MiwgeTIsIHgzLCB5MywgeDQsIHk0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFNjYWxlVHJhbnNmb3JtKGZsb2F0IHgsIGZsb2F0IHkpIHtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLnNjYWxlVHJhbnNmb3JtXCIsIHRoaXMsIHgsIHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgRmlsbFJlY3RhbmdsZShCcnVzaCBicnVzaCwgaW50IHgsIGludCB5LCBpbnQgd2lkdGgsIGludCBoZWlnaHQpIHtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLmZpbGxSZWN0YW5nbGVcIiwgdGhpcywgYnJ1c2gsIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgQ2xlYXJSZWN0YW5nbGUoaW50IHgsIGludCB5LCBpbnQgd2lkdGgsIGludCBoZWlnaHQpIHtcclxuICAgICAgICAgICAgU2NyaXB0LkNhbGwoXCJicmlkZ2VVdGlsLmdyYXBoaWNzLmNsZWFyUmVjdGFuZ2xlXCIsIHRoaXMsIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgRmlsbEVsbGlwc2UoQnJ1c2ggYnJ1c2gsIGludCB4LCBpbnQgeSwgaW50IHdpZHRoLCBpbnQgaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwiYnJpZGdlVXRpbC5ncmFwaGljcy5maWxsRWxsaXBzZVwiLCB0aGlzLCBicnVzaCwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBEcmF3RWxsaXBzZShQZW4gcGVuLCBpbnQgeCwgaW50IHksIGludCB3aWR0aCwgaW50IGhlaWdodCkge1xyXG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3MuZHJhd0VsbGlwc2VcIiwgdGhpcywgcGVuLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFJvdGF0ZVRyYW5zZm9ybShmbG9hdCBhbmdsZURlZykge1xyXG4gICAgICAgICAgICBTY3JpcHQuQ2FsbChcImJyaWRnZVV0aWwuZ3JhcGhpY3Mucm90YXRlVHJhbnNmb3JtXCIsIHRoaXMsIGFuZ2xlRGVnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBTbW9vdGhpbmdNb2RlIFNtb290aGluZ01vZGUgeyBnZXQ7IHNldDsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgUmVjdGFuZ2xlIFZpc2libGVDbGlwQm91bmRzIHsgZ2V0OyBzZXQ7IH1cclxuXHJcbiAgICAgICAgcHVibGljIGZsb2F0IFBhZ2VTY2FsZSB7IGdldDsgc2V0OyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIERpc3Bvc2UoKSB7IH1cclxuICAgIH1cclxufVxyXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTMgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cblxuLyoqIEBjbGFzcyBLZXlTaWduYXR1cmVcbiAqIFRoZSBLZXlTaWduYXR1cmUgY2xhc3MgcmVwcmVzZW50cyBhIGtleSBzaWduYXR1cmUsIGxpa2UgRyBNYWpvclxuICogb3IgQi1mbGF0IE1ham9yLiAgRm9yIHNoZWV0IG11c2ljLCB3ZSBvbmx5IGNhcmUgYWJvdXQgdGhlIG51bWJlclxuICogb2Ygc2hhcnBzIG9yIGZsYXRzIGluIHRoZSBrZXkgc2lnbmF0dXJlLCBub3Qgd2hldGhlciBpdCBpcyBtYWpvclxuICogb3IgbWlub3IuXG4gKlxuICogVGhlIG1haW4gb3BlcmF0aW9ucyBvZiB0aGlzIGNsYXNzIGFyZTpcbiAqIC0gR3Vlc3NpbmcgdGhlIGtleSBzaWduYXR1cmUsIGdpdmVuIHRoZSBub3RlcyBpbiBhIHNvbmcuXG4gKiAtIEdlbmVyYXRpbmcgdGhlIGFjY2lkZW50YWwgc3ltYm9scyBmb3IgdGhlIGtleSBzaWduYXR1cmUuXG4gKiAtIERldGVybWluaW5nIHdoZXRoZXIgYSBwYXJ0aWN1bGFyIG5vdGUgcmVxdWlyZXMgYW4gYWNjaWRlbnRhbFxuICogICBvciBub3QuXG4gKlxuICovXG5cbnB1YmxpYyBjbGFzcyBLZXlTaWduYXR1cmUge1xuICAgIC8qKiBUaGUgbnVtYmVyIG9mIHNoYXJwcyBpbiBlYWNoIGtleSBzaWduYXR1cmUgKi9cbiAgICBwdWJsaWMgY29uc3QgaW50IEMgPSAwO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRyA9IDE7XG4gICAgcHVibGljIGNvbnN0IGludCBEID0gMjtcbiAgICBwdWJsaWMgY29uc3QgaW50IEEgPSAzO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRSA9IDQ7XG4gICAgcHVibGljIGNvbnN0IGludCBCID0gNTtcblxuICAgIC8qKiBUaGUgbnVtYmVyIG9mIGZsYXRzIGluIGVhY2gga2V5IHNpZ25hdHVyZSAqL1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRiA9IDE7XG4gICAgcHVibGljIGNvbnN0IGludCBCZmxhdCA9IDI7XG4gICAgcHVibGljIGNvbnN0IGludCBFZmxhdCA9IDM7XG4gICAgcHVibGljIGNvbnN0IGludCBBZmxhdCA9IDQ7XG4gICAgcHVibGljIGNvbnN0IGludCBEZmxhdCA9IDU7XG4gICAgcHVibGljIGNvbnN0IGludCBHZmxhdCA9IDY7XG5cbiAgICAvKiogVGhlIHR3byBhcnJheXMgYmVsb3cgYXJlIGtleSBtYXBzLiAgVGhleSB0YWtlIGEgbWFqb3Iga2V5XG4gICAgICogKGxpa2UgRyBtYWpvciwgQi1mbGF0IG1ham9yKSBhbmQgYSBub3RlIGluIHRoZSBzY2FsZSwgYW5kXG4gICAgICogcmV0dXJuIHRoZSBBY2NpZGVudGFsIHJlcXVpcmVkIHRvIGRpc3BsYXkgdGhhdCBub3RlIGluIHRoZVxuICAgICAqIGdpdmVuIGtleS4gIEluIGEgbnV0c2hlbCwgdGhlIG1hcCBpc1xuICAgICAqXG4gICAgICogICBtYXBbS2V5XVtOb3RlU2NhbGVdIC0+IEFjY2lkZW50YWxcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBBY2NpZFtdW10gc2hhcnBrZXlzO1xuICAgIHByaXZhdGUgc3RhdGljIEFjY2lkW11bXSBmbGF0a2V5cztcblxuICAgIHByaXZhdGUgaW50IG51bV9mbGF0czsgICAvKiogVGhlIG51bWJlciBvZiBzaGFycHMgaW4gdGhlIGtleSwgMCB0aHJ1IDYgKi9cbiAgICBwcml2YXRlIGludCBudW1fc2hhcnBzOyAgLyoqIFRoZSBudW1iZXIgb2YgZmxhdHMgaW4gdGhlIGtleSwgMCB0aHJ1IDYgKi9cblxuICAgIC8qKiBUaGUgYWNjaWRlbnRhbCBzeW1ib2xzIHRoYXQgZGVub3RlIHRoaXMga2V5LCBpbiBhIHRyZWJsZSBjbGVmICovXG4gICAgcHJpdmF0ZSBBY2NpZFN5bWJvbFtdIHRyZWJsZTtcblxuICAgIC8qKiBUaGUgYWNjaWRlbnRhbCBzeW1ib2xzIHRoYXQgZGVub3RlIHRoaXMga2V5LCBpbiBhIGJhc3MgY2xlZiAqL1xuICAgIHByaXZhdGUgQWNjaWRTeW1ib2xbXSBiYXNzO1xuXG4gICAgLyoqIFRoZSBrZXkgbWFwIGZvciB0aGlzIGtleSBzaWduYXR1cmU6XG4gICAgICogICBrZXltYXBbbm90ZW51bWJlcl0gLT4gQWNjaWRlbnRhbFxuICAgICAqL1xuICAgIHByaXZhdGUgQWNjaWRbXSBrZXltYXA7XG5cbiAgICAvKiogVGhlIG1lYXN1cmUgdXNlZCBpbiB0aGUgcHJldmlvdXMgY2FsbCB0byBHZXRBY2NpZGVudGFsKCkgKi9cbiAgICBwcml2YXRlIGludCBwcmV2bWVhc3VyZTsgXG5cblxuICAgIC8qKiBDcmVhdGUgbmV3IGtleSBzaWduYXR1cmUsIHdpdGggdGhlIGdpdmVuIG51bWJlciBvZlxuICAgICAqIHNoYXJwcyBhbmQgZmxhdHMuICBPbmUgb2YgdGhlIHR3byBtdXN0IGJlIDAsIHlvdSBjYW4ndFxuICAgICAqIGhhdmUgYm90aCBzaGFycHMgYW5kIGZsYXRzIGluIHRoZSBrZXkgc2lnbmF0dXJlLlxuICAgICAqL1xuICAgIHB1YmxpYyBLZXlTaWduYXR1cmUoaW50IG51bV9zaGFycHMsIGludCBudW1fZmxhdHMpIHtcbiAgICAgICAgaWYgKCEobnVtX3NoYXJwcyA9PSAwIHx8IG51bV9mbGF0cyA9PSAwKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFN5c3RlbS5Bcmd1bWVudEV4Y2VwdGlvbihcIkJhZCBLZXlTaWdhdHVyZSBhcmdzXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubnVtX3NoYXJwcyA9IG51bV9zaGFycHM7XG4gICAgICAgIHRoaXMubnVtX2ZsYXRzID0gbnVtX2ZsYXRzO1xuXG4gICAgICAgIENyZWF0ZUFjY2lkZW50YWxNYXBzKCk7XG4gICAgICAgIGtleW1hcCA9IG5ldyBBY2NpZFsxNjBdO1xuICAgICAgICBSZXNldEtleU1hcCgpO1xuICAgICAgICBDcmVhdGVTeW1ib2xzKCk7XG4gICAgfVxuXG4gICAgLyoqIENyZWF0ZSBuZXcga2V5IHNpZ25hdHVyZSwgd2l0aCB0aGUgZ2l2ZW4gbm90ZXNjYWxlLiAgKi9cbiAgICBwdWJsaWMgS2V5U2lnbmF0dXJlKGludCBub3Rlc2NhbGUpIHtcbiAgICAgICAgbnVtX3NoYXJwcyA9IG51bV9mbGF0cyA9IDA7XG4gICAgICAgIHN3aXRjaCAobm90ZXNjYWxlKSB7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5BOiAgICAgbnVtX3NoYXJwcyA9IDM7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQmZsYXQ6IG51bV9mbGF0cyA9IDI7ICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkI6ICAgICBudW1fc2hhcnBzID0gNTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5DOiAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5EZmxhdDogbnVtX2ZsYXRzID0gNTsgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRDogICAgIG51bV9zaGFycHMgPSAyOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkVmbGF0OiBudW1fZmxhdHMgPSAzOyAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5FOiAgICAgbnVtX3NoYXJwcyA9IDQ7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRjogICAgIG51bV9mbGF0cyA9IDE7ICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkdmbGF0OiBudW1fZmxhdHMgPSA2OyAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5HOiAgICAgbnVtX3NoYXJwcyA9IDE7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQWZsYXQ6IG51bV9mbGF0cyA9IDQ7ICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6ICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIENyZWF0ZUFjY2lkZW50YWxNYXBzKCk7XG4gICAgICAgIGtleW1hcCA9IG5ldyBBY2NpZFsxNjBdO1xuICAgICAgICBSZXNldEtleU1hcCgpO1xuICAgICAgICBDcmVhdGVTeW1ib2xzKCk7XG4gICAgfVxuXG5cbiAgICAvKiogSW5paXRhbGl6ZSB0aGUgc2hhcnBrZXlzIGFuZCBmbGF0a2V5cyBtYXBzICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBDcmVhdGVBY2NpZGVudGFsTWFwcygpIHtcbiAgICAgICAgaWYgKHNoYXJwa2V5cyAhPSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuOyBcblxuICAgICAgICBBY2NpZFtdIG1hcDtcbiAgICAgICAgc2hhcnBrZXlzID0gbmV3IEFjY2lkWzhdW107XG4gICAgICAgIGZsYXRrZXlzID0gbmV3IEFjY2lkWzhdW107XG5cbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgICAgICAgIHNoYXJwa2V5c1tpXSA9IG5ldyBBY2NpZFsxMl07XG4gICAgICAgICAgICBmbGF0a2V5c1tpXSA9IG5ldyBBY2NpZFsxMl07XG4gICAgICAgIH1cblxuICAgICAgICBtYXAgPSBzaGFycGtleXNbQ107XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQXNoYXJwIF0gPSBBY2NpZC5GbGF0O1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQ3NoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRCBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Ec2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRnNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Hc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuXG4gICAgICAgIG1hcCA9IHNoYXJwa2V5c1tHXTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Bc2hhcnAgXSA9IEFjY2lkLkZsYXQ7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Dc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Gc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuR3NoYXJwIF0gPSBBY2NpZC5TaGFycDtcblxuICAgICAgICBtYXAgPSBzaGFycGtleXNbRF07XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQXNoYXJwIF0gPSBBY2NpZC5GbGF0O1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQ3NoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Gc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuR3NoYXJwIF0gPSBBY2NpZC5TaGFycDtcblxuICAgICAgICBtYXAgPSBzaGFycGtleXNbQV07XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQXNoYXJwIF0gPSBBY2NpZC5GbGF0O1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQ3NoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Gc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuR3NoYXJwIF0gPSBBY2NpZC5Ob25lO1xuXG4gICAgICAgIG1hcCA9IHNoYXJwa2V5c1tFXTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Bc2hhcnAgXSA9IEFjY2lkLkZsYXQ7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Dc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRHNoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRnNoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkdzaGFycCBdID0gQWNjaWQuTm9uZTtcblxuICAgICAgICBtYXAgPSBzaGFycGtleXNbQl07XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQXNoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQ3NoYXJwIF0gPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRzaGFycCBdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Hc2hhcnAgXSA9IEFjY2lkLk5vbmU7XG5cbiAgICAgICAgLyogRmxhdCBrZXlzICovXG4gICAgICAgIG1hcCA9IGZsYXRrZXlzW0NdO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkFzaGFycCBdID0gQWNjaWQuRmxhdDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkNzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRHNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuR3NoYXJwIF0gPSBBY2NpZC5TaGFycDtcblxuICAgICAgICBtYXAgPSBmbGF0a2V5c1tGXTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Dc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkVmbGF0IF0gID0gQWNjaWQuRmxhdDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQWZsYXQgXSAgPSBBY2NpZC5GbGF0O1xuXG4gICAgICAgIG1hcCA9IGZsYXRrZXlzW0JmbGF0XTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Dc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkVmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkZzaGFycCBdID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQWZsYXQgXSAgPSBBY2NpZC5GbGF0O1xuXG4gICAgICAgIG1hcCA9IGZsYXRrZXlzW0VmbGF0XTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQSBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkIgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EZmxhdCBdICA9IEFjY2lkLkZsYXQ7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkQgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRWZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkYgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRnNoYXJwIF0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BZmxhdCBdICA9IEFjY2lkLk5vbmU7XG5cbiAgICAgICAgbWFwID0gZmxhdGtleXNbQWZsYXRdO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkJmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRCBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5Gc2hhcnAgXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkFmbGF0IF0gID0gQWNjaWQuTm9uZTtcblxuICAgICAgICBtYXAgPSBmbGF0a2V5c1tEZmxhdF07XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkEgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQmZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5CIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkMgXSAgICAgID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRGZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5EIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkVmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRSBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5GIF0gICAgICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkdmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRyBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BZmxhdCBdICA9IEFjY2lkLk5vbmU7XG5cbiAgICAgICAgbWFwID0gZmxhdGtleXNbR2ZsYXRdO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5BIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkJmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5DIF0gICAgICA9IEFjY2lkLk5hdHVyYWw7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkRmbGF0IF0gID0gQWNjaWQuTm9uZTtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRCBdICAgICAgPSBBY2NpZC5OYXR1cmFsO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5FZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkUgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuRiBdICAgICAgPSBBY2NpZC5Ob25lO1xuICAgICAgICBtYXBbIE5vdGVTY2FsZS5HZmxhdCBdICA9IEFjY2lkLk5vbmU7XG4gICAgICAgIG1hcFsgTm90ZVNjYWxlLkcgXSAgICAgID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgbWFwWyBOb3RlU2NhbGUuQWZsYXQgXSAgPSBBY2NpZC5Ob25lO1xuXG5cbiAgICB9XG5cbiAgICAvKiogVGhlIGtleW1hcCB0ZWxscyB3aGF0IGFjY2lkZW50YWwgc3ltYm9sIGlzIG5lZWRlZCBmb3IgZWFjaFxuICAgICAqICBub3RlIGluIHRoZSBzY2FsZS4gIFJlc2V0IHRoZSBrZXltYXAgdG8gdGhlIHZhbHVlcyBvZiB0aGVcbiAgICAgKiAga2V5IHNpZ25hdHVyZS5cbiAgICAgKi9cbiAgICBwcml2YXRlIHZvaWQgUmVzZXRLZXlNYXAoKVxuICAgIHtcbiAgICAgICAgQWNjaWRbXSBrZXk7XG4gICAgICAgIGlmIChudW1fZmxhdHMgPiAwKVxuICAgICAgICAgICAga2V5ID0gZmxhdGtleXNbbnVtX2ZsYXRzXTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAga2V5ID0gc2hhcnBrZXlzW251bV9zaGFycHNdO1xuXG4gICAgICAgIGZvciAoaW50IG5vdGVudW1iZXIgPSAwOyBub3RlbnVtYmVyIDwga2V5bWFwLkxlbmd0aDsgbm90ZW51bWJlcisrKSB7XG4gICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlcl0gPSBrZXlbTm90ZVNjYWxlLkZyb21OdW1iZXIobm90ZW51bWJlcildO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKiogQ3JlYXRlIHRoZSBBY2NpZGVudGFsIHN5bWJvbHMgZm9yIHRoaXMga2V5LCBmb3JcbiAgICAgKiB0aGUgdHJlYmxlIGFuZCBiYXNzIGNsZWZzLlxuICAgICAqL1xuICAgIHByaXZhdGUgdm9pZCBDcmVhdGVTeW1ib2xzKCkge1xuICAgICAgICBpbnQgY291bnQgPSBNYXRoLk1heChudW1fc2hhcnBzLCBudW1fZmxhdHMpO1xuICAgICAgICB0cmVibGUgPSBuZXcgQWNjaWRTeW1ib2xbY291bnRdO1xuICAgICAgICBiYXNzID0gbmV3IEFjY2lkU3ltYm9sW2NvdW50XTtcblxuICAgICAgICBpZiAoY291bnQgPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgV2hpdGVOb3RlW10gdHJlYmxlbm90ZXMgPSBudWxsO1xuICAgICAgICBXaGl0ZU5vdGVbXSBiYXNzbm90ZXMgPSBudWxsO1xuXG4gICAgICAgIGlmIChudW1fc2hhcnBzID4gMCkgIHtcbiAgICAgICAgICAgIHRyZWJsZW5vdGVzID0gbmV3IFdoaXRlTm90ZVtdIHtcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5GLCA1KSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5DLCA1KSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5HLCA1KSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5ELCA1KSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5BLCA2KSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5FLCA1KVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGJhc3Nub3RlcyA9IG5ldyBXaGl0ZU5vdGVbXSB7XG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRiwgMyksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQywgMyksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRywgMyksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRCwgMyksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQSwgNCksXG4gICAgICAgICAgICAgICAgbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRSwgMylcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobnVtX2ZsYXRzID4gMCkge1xuICAgICAgICAgICAgdHJlYmxlbm90ZXMgPSBuZXcgV2hpdGVOb3RlW10ge1xuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkIsIDUpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkUsIDUpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkEsIDUpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkQsIDUpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkcsIDQpLFxuICAgICAgICAgICAgICAgIG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkMsIDUpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgYmFzc25vdGVzID0gbmV3IFdoaXRlTm90ZVtdIHtcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5CLCAzKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5FLCAzKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5BLCAzKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5ELCAzKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5HLCAyKSxcbiAgICAgICAgICAgICAgICBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5DLCAzKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIEFjY2lkIGEgPSBBY2NpZC5Ob25lO1xuICAgICAgICBpZiAobnVtX3NoYXJwcyA+IDApXG4gICAgICAgICAgICBhID0gQWNjaWQuU2hhcnA7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGEgPSBBY2NpZC5GbGF0O1xuXG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgdHJlYmxlW2ldID0gbmV3IEFjY2lkU3ltYm9sKGEsIHRyZWJsZW5vdGVzW2ldLCBDbGVmLlRyZWJsZSk7XG4gICAgICAgICAgICBiYXNzW2ldID0gbmV3IEFjY2lkU3ltYm9sKGEsIGJhc3Nub3Rlc1tpXSwgQ2xlZi5CYXNzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIEFjY2lkZW50YWwgc3ltYm9scyBmb3IgZGlzcGxheWluZyB0aGlzIGtleSBzaWduYXR1cmVcbiAgICAgKiBmb3IgdGhlIGdpdmVuIGNsZWYuXG4gICAgICovXG4gICAgcHVibGljIEFjY2lkU3ltYm9sW10gR2V0U3ltYm9scyhDbGVmIGNsZWYpIHtcbiAgICAgICAgaWYgKGNsZWYgPT0gQ2xlZi5UcmVibGUpXG4gICAgICAgICAgICByZXR1cm4gdHJlYmxlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gYmFzcztcbiAgICB9XG5cbiAgICAvKiogR2l2ZW4gYSBtaWRpIG5vdGUgbnVtYmVyLCByZXR1cm4gdGhlIGFjY2lkZW50YWwgKGlmIGFueSkgXG4gICAgICogdGhhdCBzaG91bGQgYmUgdXNlZCB3aGVuIGRpc3BsYXlpbmcgdGhlIG5vdGUgaW4gdGhpcyBrZXkgc2lnbmF0dXJlLlxuICAgICAqXG4gICAgICogVGhlIGN1cnJlbnQgbWVhc3VyZSBpcyBhbHNvIHJlcXVpcmVkLiAgT25jZSB3ZSByZXR1cm4gYW5cbiAgICAgKiBhY2NpZGVudGFsIGZvciBhIG1lYXN1cmUsIHRoZSBhY2NpZGVudGFsIHJlbWFpbnMgZm9yIHRoZVxuICAgICAqIHJlc3Qgb2YgdGhlIG1lYXN1cmUuIFNvIHdlIG11c3QgdXBkYXRlIHRoZSBjdXJyZW50IGtleW1hcFxuICAgICAqIHdpdGggYW55IG5ldyBhY2NpZGVudGFscyB0aGF0IHdlIHJldHVybi4gIFdoZW4gd2UgbW92ZSB0byBhbm90aGVyXG4gICAgICogbWVhc3VyZSwgd2UgcmVzZXQgdGhlIGtleW1hcCBiYWNrIHRvIHRoZSBrZXkgc2lnbmF0dXJlLlxuICAgICAqL1xuICAgIHB1YmxpYyBBY2NpZCBHZXRBY2NpZGVudGFsKGludCBub3RlbnVtYmVyLCBpbnQgbWVhc3VyZSkge1xuICAgICAgICBpZiAobWVhc3VyZSAhPSBwcmV2bWVhc3VyZSkge1xuICAgICAgICAgICAgUmVzZXRLZXlNYXAoKTtcbiAgICAgICAgICAgIHByZXZtZWFzdXJlID0gbWVhc3VyZTtcbiAgICAgICAgfVxuXG4gICAgICAgIEFjY2lkIHJlc3VsdCA9IGtleW1hcFtub3RlbnVtYmVyXTtcbiAgICAgICAgaWYgKHJlc3VsdCA9PSBBY2NpZC5TaGFycCkge1xuICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXJdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgICAgIGtleW1hcFtub3RlbnVtYmVyLTFdID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChyZXN1bHQgPT0gQWNjaWQuRmxhdCkge1xuICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXJdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgICAgIGtleW1hcFtub3RlbnVtYmVyKzFdID0gQWNjaWQuTmF0dXJhbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChyZXN1bHQgPT0gQWNjaWQuTmF0dXJhbCkge1xuICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXJdID0gQWNjaWQuTm9uZTtcbiAgICAgICAgICAgIGludCBuZXh0a2V5ID0gTm90ZVNjYWxlLkZyb21OdW1iZXIobm90ZW51bWJlcisxKTtcbiAgICAgICAgICAgIGludCBwcmV2a2V5ID0gTm90ZVNjYWxlLkZyb21OdW1iZXIobm90ZW51bWJlci0xKTtcblxuICAgICAgICAgICAgLyogSWYgd2UgaW5zZXJ0IGEgbmF0dXJhbCwgdGhlbiBlaXRoZXI6XG4gICAgICAgICAgICAgKiAtIHRoZSBuZXh0IGtleSBtdXN0IGdvIGJhY2sgdG8gc2hhcnAsXG4gICAgICAgICAgICAgKiAtIHRoZSBwcmV2aW91cyBrZXkgbXVzdCBnbyBiYWNrIHRvIGZsYXQuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlmIChrZXltYXBbbm90ZW51bWJlci0xXSA9PSBBY2NpZC5Ob25lICYmIGtleW1hcFtub3RlbnVtYmVyKzFdID09IEFjY2lkLk5vbmUgJiZcbiAgICAgICAgICAgICAgICBOb3RlU2NhbGUuSXNCbGFja0tleShuZXh0a2V5KSAmJiBOb3RlU2NhbGUuSXNCbGFja0tleShwcmV2a2V5KSApIHtcblxuICAgICAgICAgICAgICAgIGlmIChudW1fZmxhdHMgPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlcisxXSA9IEFjY2lkLlNoYXJwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXItMV0gPSBBY2NpZC5GbGF0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGtleW1hcFtub3RlbnVtYmVyLTFdID09IEFjY2lkLk5vbmUgJiYgTm90ZVNjYWxlLklzQmxhY2tLZXkocHJldmtleSkpIHtcbiAgICAgICAgICAgICAgICBrZXltYXBbbm90ZW51bWJlci0xXSA9IEFjY2lkLkZsYXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChrZXltYXBbbm90ZW51bWJlcisxXSA9PSBBY2NpZC5Ob25lICYmIE5vdGVTY2FsZS5Jc0JsYWNrS2V5KG5leHRrZXkpKSB7XG4gICAgICAgICAgICAgICAga2V5bWFwW25vdGVudW1iZXIrMV0gPSBBY2NpZC5TaGFycDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8qIFNob3VsZG4ndCBnZXQgaGVyZSAqL1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG5cbiAgICAvKiogR2l2ZW4gYSBtaWRpIG5vdGUgbnVtYmVyLCByZXR1cm4gdGhlIHdoaXRlIG5vdGUgKHRoZVxuICAgICAqIG5vbi1zaGFycC9ub24tZmxhdCBub3RlKSB0aGF0IHNob3VsZCBiZSB1c2VkIHdoZW4gZGlzcGxheWluZ1xuICAgICAqIHRoaXMgbm90ZSBpbiB0aGlzIGtleSBzaWduYXR1cmUuICBUaGlzIHNob3VsZCBiZSBjYWxsZWRcbiAgICAgKiBiZWZvcmUgY2FsbGluZyBHZXRBY2NpZGVudGFsKCkuXG4gICAgICovXG4gICAgcHVibGljIFdoaXRlTm90ZSBHZXRXaGl0ZU5vdGUoaW50IG5vdGVudW1iZXIpIHtcbiAgICAgICAgaW50IG5vdGVzY2FsZSA9IE5vdGVTY2FsZS5Gcm9tTnVtYmVyKG5vdGVudW1iZXIpO1xuICAgICAgICBpbnQgb2N0YXZlID0gKG5vdGVudW1iZXIgKyAzKSAvIDEyIC0gMTtcbiAgICAgICAgaW50IGxldHRlciA9IDA7XG5cbiAgICAgICAgaW50W10gd2hvbGVfc2hhcnBzID0geyBcbiAgICAgICAgICAgIFdoaXRlTm90ZS5BLCBXaGl0ZU5vdGUuQSwgXG4gICAgICAgICAgICBXaGl0ZU5vdGUuQiwgXG4gICAgICAgICAgICBXaGl0ZU5vdGUuQywgV2hpdGVOb3RlLkMsXG4gICAgICAgICAgICBXaGl0ZU5vdGUuRCwgV2hpdGVOb3RlLkQsXG4gICAgICAgICAgICBXaGl0ZU5vdGUuRSxcbiAgICAgICAgICAgIFdoaXRlTm90ZS5GLCBXaGl0ZU5vdGUuRixcbiAgICAgICAgICAgIFdoaXRlTm90ZS5HLCBXaGl0ZU5vdGUuR1xuICAgICAgICB9O1xuXG4gICAgICAgIGludFtdIHdob2xlX2ZsYXRzID0ge1xuICAgICAgICAgICAgV2hpdGVOb3RlLkEsIFxuICAgICAgICAgICAgV2hpdGVOb3RlLkIsIFdoaXRlTm90ZS5CLFxuICAgICAgICAgICAgV2hpdGVOb3RlLkMsXG4gICAgICAgICAgICBXaGl0ZU5vdGUuRCwgV2hpdGVOb3RlLkQsXG4gICAgICAgICAgICBXaGl0ZU5vdGUuRSwgV2hpdGVOb3RlLkUsXG4gICAgICAgICAgICBXaGl0ZU5vdGUuRixcbiAgICAgICAgICAgIFdoaXRlTm90ZS5HLCBXaGl0ZU5vdGUuRyxcbiAgICAgICAgICAgIFdoaXRlTm90ZS5BXG4gICAgICAgIH07XG5cbiAgICAgICAgQWNjaWQgYWNjaWQgPSBrZXltYXBbbm90ZW51bWJlcl07XG4gICAgICAgIGlmIChhY2NpZCA9PSBBY2NpZC5GbGF0KSB7XG4gICAgICAgICAgICBsZXR0ZXIgPSB3aG9sZV9mbGF0c1tub3Rlc2NhbGVdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFjY2lkID09IEFjY2lkLlNoYXJwKSB7XG4gICAgICAgICAgICBsZXR0ZXIgPSB3aG9sZV9zaGFycHNbbm90ZXNjYWxlXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhY2NpZCA9PSBBY2NpZC5OYXR1cmFsKSB7XG4gICAgICAgICAgICBsZXR0ZXIgPSB3aG9sZV9zaGFycHNbbm90ZXNjYWxlXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhY2NpZCA9PSBBY2NpZC5Ob25lKSB7XG4gICAgICAgICAgICBsZXR0ZXIgPSB3aG9sZV9zaGFycHNbbm90ZXNjYWxlXTtcblxuICAgICAgICAgICAgLyogSWYgdGhlIG5vdGUgbnVtYmVyIGlzIGEgc2hhcnAvZmxhdCwgYW5kIHRoZXJlJ3Mgbm8gYWNjaWRlbnRhbCxcbiAgICAgICAgICAgICAqIGRldGVybWluZSB0aGUgd2hpdGUgbm90ZSBieSBzZWVpbmcgd2hldGhlciB0aGUgcHJldmlvdXMgb3IgbmV4dCBub3RlXG4gICAgICAgICAgICAgKiBpcyBhIG5hdHVyYWwuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlmIChOb3RlU2NhbGUuSXNCbGFja0tleShub3Rlc2NhbGUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleW1hcFtub3RlbnVtYmVyLTFdID09IEFjY2lkLk5hdHVyYWwgJiYgXG4gICAgICAgICAgICAgICAgICAgIGtleW1hcFtub3RlbnVtYmVyKzFdID09IEFjY2lkLk5hdHVyYWwpIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAobnVtX2ZsYXRzID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0dGVyID0gd2hvbGVfZmxhdHNbbm90ZXNjYWxlXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldHRlciA9IHdob2xlX3NoYXJwc1tub3Rlc2NhbGVdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGtleW1hcFtub3RlbnVtYmVyLTFdID09IEFjY2lkLk5hdHVyYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0dGVyID0gd2hvbGVfc2hhcnBzW25vdGVzY2FsZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGtleW1hcFtub3RlbnVtYmVyKzFdID09IEFjY2lkLk5hdHVyYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0dGVyID0gd2hvbGVfZmxhdHNbbm90ZXNjYWxlXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBUaGUgYWJvdmUgYWxnb3JpdGhtIGRvZXNuJ3QgcXVpdGUgd29yayBmb3IgRy1mbGF0IG1ham9yLlxuICAgICAgICAgKiBIYW5kbGUgaXQgaGVyZS5cbiAgICAgICAgICovXG4gICAgICAgIGlmIChudW1fZmxhdHMgPT0gR2ZsYXQgJiYgbm90ZXNjYWxlID09IE5vdGVTY2FsZS5CKSB7XG4gICAgICAgICAgICBsZXR0ZXIgPSBXaGl0ZU5vdGUuQztcbiAgICAgICAgfVxuICAgICAgICBpZiAobnVtX2ZsYXRzID09IEdmbGF0ICYmIG5vdGVzY2FsZSA9PSBOb3RlU2NhbGUuQmZsYXQpIHtcbiAgICAgICAgICAgIGxldHRlciA9IFdoaXRlTm90ZS5CO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG51bV9mbGF0cyA+IDAgJiYgbm90ZXNjYWxlID09IE5vdGVTY2FsZS5BZmxhdCkge1xuICAgICAgICAgICAgb2N0YXZlKys7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFdoaXRlTm90ZShsZXR0ZXIsIG9jdGF2ZSk7XG4gICAgfVxuXG5cbiAgICAvKiogR3Vlc3MgdGhlIGtleSBzaWduYXR1cmUsIGdpdmVuIHRoZSBtaWRpIG5vdGUgbnVtYmVycyB1c2VkIGluXG4gICAgICogdGhlIHNvbmcuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBLZXlTaWduYXR1cmUgR3Vlc3MoTGlzdDxpbnQ+IG5vdGVzKSB7XG4gICAgICAgIENyZWF0ZUFjY2lkZW50YWxNYXBzKCk7XG5cbiAgICAgICAgLyogR2V0IHRoZSBmcmVxdWVuY3kgY291bnQgb2YgZWFjaCBub3RlIGluIHRoZSAxMi1ub3RlIHNjYWxlICovXG4gICAgICAgIGludFtdIG5vdGVjb3VudCA9IG5ldyBpbnRbMTJdO1xuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IG5vdGVzLkNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGludCBub3RlbnVtYmVyID0gbm90ZXNbaV07XG4gICAgICAgICAgICBpbnQgbm90ZXNjYWxlID0gKG5vdGVudW1iZXIgKyAzKSAlIDEyO1xuICAgICAgICAgICAgbm90ZWNvdW50W25vdGVzY2FsZV0gKz0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIEZvciBlYWNoIGtleSBzaWduYXR1cmUsIGNvdW50IHRoZSB0b3RhbCBudW1iZXIgb2YgYWNjaWRlbnRhbHNcbiAgICAgICAgICogbmVlZGVkIHRvIGRpc3BsYXkgYWxsIHRoZSBub3Rlcy4gIENob29zZSB0aGUga2V5IHNpZ25hdHVyZVxuICAgICAgICAgKiB3aXRoIHRoZSBmZXdlc3QgYWNjaWRlbnRhbHMuXG4gICAgICAgICAqL1xuICAgICAgICBpbnQgYmVzdGtleSA9IDA7XG4gICAgICAgIGJvb2wgaXNfYmVzdF9zaGFycCA9IHRydWU7XG4gICAgICAgIGludCBzbWFsbGVzdF9hY2NpZF9jb3VudCA9IG5vdGVzLkNvdW50O1xuICAgICAgICBpbnQga2V5O1xuXG4gICAgICAgIGZvciAoa2V5ID0gMDsga2V5IDwgNjsga2V5KyspIHtcbiAgICAgICAgICAgIGludCBhY2NpZF9jb3VudCA9IDA7XG4gICAgICAgICAgICBmb3IgKGludCBuID0gMDsgbiA8IDEyOyBuKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoc2hhcnBrZXlzW2tleV1bbl0gIT0gQWNjaWQuTm9uZSkge1xuICAgICAgICAgICAgICAgICAgICBhY2NpZF9jb3VudCArPSBub3RlY291bnRbbl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFjY2lkX2NvdW50IDwgc21hbGxlc3RfYWNjaWRfY291bnQpIHtcbiAgICAgICAgICAgICAgICBzbWFsbGVzdF9hY2NpZF9jb3VudCA9IGFjY2lkX2NvdW50O1xuICAgICAgICAgICAgICAgIGJlc3RrZXkgPSBrZXk7XG4gICAgICAgICAgICAgICAgaXNfYmVzdF9zaGFycCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGtleSA9IDA7IGtleSA8IDc7IGtleSsrKSB7XG4gICAgICAgICAgICBpbnQgYWNjaWRfY291bnQgPSAwO1xuICAgICAgICAgICAgZm9yIChpbnQgbiA9IDA7IG4gPCAxMjsgbisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZsYXRrZXlzW2tleV1bbl0gIT0gQWNjaWQuTm9uZSkge1xuICAgICAgICAgICAgICAgICAgICBhY2NpZF9jb3VudCArPSBub3RlY291bnRbbl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFjY2lkX2NvdW50IDwgc21hbGxlc3RfYWNjaWRfY291bnQpIHtcbiAgICAgICAgICAgICAgICBzbWFsbGVzdF9hY2NpZF9jb3VudCA9IGFjY2lkX2NvdW50O1xuICAgICAgICAgICAgICAgIGJlc3RrZXkgPSBrZXk7XG4gICAgICAgICAgICAgICAgaXNfYmVzdF9zaGFycCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChpc19iZXN0X3NoYXJwKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEtleVNpZ25hdHVyZShiZXN0a2V5LCAwKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgS2V5U2lnbmF0dXJlKDAsIGJlc3RrZXkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0cnVlIGlmIHRoaXMga2V5IHNpZ25hdHVyZSBpcyBlcXVhbCB0byBrZXkgc2lnbmF0dXJlIGsgKi9cbiAgICBwdWJsaWMgYm9vbCBFcXVhbHMoS2V5U2lnbmF0dXJlIGspIHtcbiAgICAgICAgaWYgKGsubnVtX3NoYXJwcyA9PSBudW1fc2hhcnBzICYmIGsubnVtX2ZsYXRzID09IG51bV9mbGF0cylcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyogUmV0dXJuIHRoZSBNYWpvciBLZXkgb2YgdGhpcyBLZXkgU2lnbmF0dXJlICovXG4gICAgcHVibGljIGludCBOb3Rlc2NhbGUoKSB7XG4gICAgICAgIGludFtdIGZsYXRtYWpvciA9IHtcbiAgICAgICAgICAgIE5vdGVTY2FsZS5DLCBOb3RlU2NhbGUuRiwgTm90ZVNjYWxlLkJmbGF0LCBOb3RlU2NhbGUuRWZsYXQsXG4gICAgICAgICAgICBOb3RlU2NhbGUuQWZsYXQsIE5vdGVTY2FsZS5EZmxhdCwgTm90ZVNjYWxlLkdmbGF0LCBOb3RlU2NhbGUuQiBcbiAgICAgICAgfTtcblxuICAgICAgICBpbnRbXSBzaGFycG1ham9yID0ge1xuICAgICAgICAgICAgTm90ZVNjYWxlLkMsIE5vdGVTY2FsZS5HLCBOb3RlU2NhbGUuRCwgTm90ZVNjYWxlLkEsIE5vdGVTY2FsZS5FLFxuICAgICAgICAgICAgTm90ZVNjYWxlLkIsIE5vdGVTY2FsZS5Gc2hhcnAsIE5vdGVTY2FsZS5Dc2hhcnAsIE5vdGVTY2FsZS5Hc2hhcnAsXG4gICAgICAgICAgICBOb3RlU2NhbGUuRHNoYXJwXG4gICAgICAgIH07XG4gICAgICAgIGlmIChudW1fZmxhdHMgPiAwKVxuICAgICAgICAgICAgcmV0dXJuIGZsYXRtYWpvcltudW1fZmxhdHNdO1xuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgcmV0dXJuIHNoYXJwbWFqb3JbbnVtX3NoYXJwc107XG4gICAgfVxuXG4gICAgLyogQ29udmVydCBhIE1ham9yIEtleSBpbnRvIGEgc3RyaW5nICovXG4gICAgcHVibGljIHN0YXRpYyBzdHJpbmcgS2V5VG9TdHJpbmcoaW50IG5vdGVzY2FsZSkge1xuICAgICAgICBzd2l0Y2ggKG5vdGVzY2FsZSkge1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQTogICAgIHJldHVybiBcIkEgbWFqb3IsIEYjIG1pbm9yXCIgO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQmZsYXQ6IHJldHVybiBcIkItZmxhdCBtYWpvciwgRyBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQjogICAgIHJldHVybiBcIkIgbWFqb3IsIEEtZmxhdCBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQzogICAgIHJldHVybiBcIkMgbWFqb3IsIEEgbWlub3JcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkRmbGF0OiByZXR1cm4gXCJELWZsYXQgbWFqb3IsIEItZmxhdCBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRDogICAgIHJldHVybiBcIkQgbWFqb3IsIEIgbWlub3JcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkVmbGF0OiByZXR1cm4gXCJFLWZsYXQgbWFqb3IsIEMgbWlub3JcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkU6ICAgICByZXR1cm4gXCJFIG1ham9yLCBDIyBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRjogICAgIHJldHVybiBcIkYgbWFqb3IsIEQgbWlub3JcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkdmbGF0OiByZXR1cm4gXCJHLWZsYXQgbWFqb3IsIEUtZmxhdCBtaW5vclwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuRzogICAgIHJldHVybiBcIkcgbWFqb3IsIEUgbWlub3JcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkFmbGF0OiByZXR1cm4gXCJBLWZsYXQgbWFqb3IsIEYgbWlub3JcIjtcbiAgICAgICAgICAgIGRlZmF1bHQ6ICAgICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGlzIGtleSBzaWduYXR1cmUuXG4gICAgICogV2Ugb25seSByZXR1cm4gdGhlIG1ham9yIGtleSBzaWduYXR1cmUsIG5vdCB0aGUgbWlub3Igb25lLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBLZXlUb1N0cmluZyggTm90ZXNjYWxlKCkgKTtcbiAgICB9XG5cblxufVxuXG59XG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTIgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIEBjbGFzcyBMeXJpY1N5bWJvbFxuICogIEEgbHlyaWMgY29udGFpbnMgdGhlIGx5cmljIHRvIGRpc3BsYXksIHRoZSBzdGFydCB0aW1lIHRoZSBseXJpYyBvY2N1cnMgYXQsXG4gKiAgdGhlIHRoZSB4LWNvb3JkaW5hdGUgd2hlcmUgaXQgd2lsbCBiZSBkaXNwbGF5ZWQuXG4gKi9cbnB1YmxpYyBjbGFzcyBMeXJpY1N5bWJvbCB7XG4gICAgcHJpdmF0ZSBpbnQgc3RhcnR0aW1lOyAgIC8qKiBUaGUgc3RhcnQgdGltZSwgaW4gcHVsc2VzICovXG4gICAgcHJpdmF0ZSBzdHJpbmcgdGV4dDsgICAgIC8qKiBUaGUgbHlyaWMgdGV4dCAqL1xuICAgIHByaXZhdGUgaW50IHg7ICAgICAgICAgICAvKiogVGhlIHggKGhvcml6b250YWwpIHBvc2l0aW9uIHdpdGhpbiB0aGUgc3RhZmYgKi9cblxuICAgIHB1YmxpYyBMeXJpY1N5bWJvbChpbnQgc3RhcnR0aW1lLCBzdHJpbmcgdGV4dCkge1xuICAgICAgICB0aGlzLnN0YXJ0dGltZSA9IHN0YXJ0dGltZTsgXG4gICAgICAgIHRoaXMudGV4dCA9IHRleHQ7XG4gICAgfVxuICAgICBcbiAgICBwdWJsaWMgaW50IFN0YXJ0VGltZSB7XG4gICAgICAgIGdldCB7IHJldHVybiBzdGFydHRpbWU7IH1cbiAgICAgICAgc2V0IHsgc3RhcnR0aW1lID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RyaW5nIFRleHQge1xuICAgICAgICBnZXQgeyByZXR1cm4gdGV4dDsgfVxuICAgICAgICBzZXQgeyB0ZXh0ID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICBwdWJsaWMgaW50IFgge1xuICAgICAgICBnZXQgeyByZXR1cm4geDsgfVxuICAgICAgICBzZXQgeyB4ID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICBwdWJsaWMgaW50IE1pbldpZHRoIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIG1pbldpZHRoKCk7IH1cbiAgICB9XG5cbiAgICAvKiBSZXR1cm4gdGhlIG1pbmltdW0gd2lkdGggaW4gcGl4ZWxzIG5lZWRlZCB0byBkaXNwbGF5IHRoaXMgbHlyaWMuXG4gICAgICogVGhpcyBpcyBhbiBlc3RpbWF0aW9uLCBub3QgZXhhY3QuXG4gICAgICovXG4gICAgcHJpdmF0ZSBpbnQgbWluV2lkdGgoKSB7IFxuICAgICAgICBmbG9hdCB3aWR0aFBlckNoYXIgPSBTaGVldE11c2ljLkxldHRlckZvbnQuR2V0SGVpZ2h0KCkgKiAyLjBmLzMuMGY7XG4gICAgICAgIGZsb2F0IHdpZHRoID0gdGV4dC5MZW5ndGggKiB3aWR0aFBlckNoYXI7XG4gICAgICAgIGlmICh0ZXh0LkluZGV4T2YoXCJpXCIpID49IDApIHtcbiAgICAgICAgICAgIHdpZHRoIC09IHdpZHRoUGVyQ2hhci8yLjBmO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0ZXh0LkluZGV4T2YoXCJqXCIpID49IDApIHtcbiAgICAgICAgICAgIHdpZHRoIC09IHdpZHRoUGVyQ2hhci8yLjBmO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0ZXh0LkluZGV4T2YoXCJsXCIpID49IDApIHtcbiAgICAgICAgICAgIHdpZHRoIC09IHdpZHRoUGVyQ2hhci8yLjBmO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoaW50KXdpZHRoO1xuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBcbiAgICBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiTHlyaWMgc3RhcnQ9ezB9IHg9ezF9IHRleHQ9ezJ9XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0dGltZSwgeCwgdGV4dCk7XG4gICAgfVxuXG59XG5cblxufVxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDEyIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbi8qKiBAY2xhc3MgTWlkaUV2ZW50XG4gKiBBIE1pZGlFdmVudCByZXByZXNlbnRzIGEgc2luZ2xlIGV2ZW50IChzdWNoIGFzIEV2ZW50Tm90ZU9uKSBpbiB0aGVcbiAqIE1pZGkgZmlsZS4gSXQgaW5jbHVkZXMgdGhlIGRlbHRhIHRpbWUgb2YgdGhlIGV2ZW50LlxuICovXG5wdWJsaWMgY2xhc3MgTWlkaUV2ZW50IDogSUNvbXBhcmVyPE1pZGlFdmVudD4ge1xuXG4gICAgcHVibGljIGludCAgICBEZWx0YVRpbWU7ICAgICAvKiogVGhlIHRpbWUgYmV0d2VlbiB0aGUgcHJldmlvdXMgZXZlbnQgYW5kIHRoaXMgb24gKi9cbiAgICBwdWJsaWMgaW50ICAgIFN0YXJ0VGltZTsgICAgIC8qKiBUaGUgYWJzb2x1dGUgdGltZSB0aGlzIGV2ZW50IG9jY3VycyAqL1xuICAgIHB1YmxpYyBib29sICAgSGFzRXZlbnRmbGFnOyAgLyoqIEZhbHNlIGlmIHRoaXMgaXMgdXNpbmcgdGhlIHByZXZpb3VzIGV2ZW50ZmxhZyAqL1xuICAgIHB1YmxpYyBieXRlICAgRXZlbnRGbGFnOyAgICAgLyoqIE5vdGVPbiwgTm90ZU9mZiwgZXRjLiAgRnVsbCBsaXN0IGlzIGluIGNsYXNzIE1pZGlGaWxlICovXG4gICAgcHVibGljIGJ5dGUgICBDaGFubmVsOyAgICAgICAvKiogVGhlIGNoYW5uZWwgdGhpcyBldmVudCBvY2N1cnMgb24gKi8gXG5cbiAgICBwdWJsaWMgYnl0ZSAgIE5vdGVudW1iZXI7ICAgIC8qKiBUaGUgbm90ZSBudW1iZXIgICovXG4gICAgcHVibGljIGJ5dGUgICBWZWxvY2l0eTsgICAgICAvKiogVGhlIHZvbHVtZSBvZiB0aGUgbm90ZSAqL1xuICAgIHB1YmxpYyBieXRlICAgSW5zdHJ1bWVudDsgICAgLyoqIFRoZSBpbnN0cnVtZW50ICovXG4gICAgcHVibGljIGJ5dGUgICBLZXlQcmVzc3VyZTsgICAvKiogVGhlIGtleSBwcmVzc3VyZSAqL1xuICAgIHB1YmxpYyBieXRlICAgQ2hhblByZXNzdXJlOyAgLyoqIFRoZSBjaGFubmVsIHByZXNzdXJlICovXG4gICAgcHVibGljIGJ5dGUgICBDb250cm9sTnVtOyAgICAvKiogVGhlIGNvbnRyb2xsZXIgbnVtYmVyICovXG4gICAgcHVibGljIGJ5dGUgICBDb250cm9sVmFsdWU7ICAvKiogVGhlIGNvbnRyb2xsZXIgdmFsdWUgKi9cbiAgICBwdWJsaWMgdXNob3J0IFBpdGNoQmVuZDsgICAgIC8qKiBUaGUgcGl0Y2ggYmVuZCB2YWx1ZSAqL1xuICAgIHB1YmxpYyBieXRlICAgTnVtZXJhdG9yOyAgICAgLyoqIFRoZSBudW1lcmF0b3IsIGZvciBUaW1lU2lnbmF0dXJlIG1ldGEgZXZlbnRzICovXG4gICAgcHVibGljIGJ5dGUgICBEZW5vbWluYXRvcjsgICAvKiogVGhlIGRlbm9taW5hdG9yLCBmb3IgVGltZVNpZ25hdHVyZSBtZXRhIGV2ZW50cyAqL1xuICAgIHB1YmxpYyBpbnQgICAgVGVtcG87ICAgICAgICAgLyoqIFRoZSB0ZW1wbywgZm9yIFRlbXBvIG1ldGEgZXZlbnRzICovXG4gICAgcHVibGljIGJ5dGUgICBNZXRhZXZlbnQ7ICAgICAvKiogVGhlIG1ldGFldmVudCwgdXNlZCBpZiBldmVudGZsYWcgaXMgTWV0YUV2ZW50ICovXG4gICAgcHVibGljIGludCAgICBNZXRhbGVuZ3RoOyAgICAvKiogVGhlIG1ldGFldmVudCBsZW5ndGggICovXG4gICAgcHVibGljIGJ5dGVbXSBWYWx1ZTsgICAgICAgICAvKiogVGhlIHJhdyBieXRlIHZhbHVlLCBmb3IgU3lzZXggYW5kIG1ldGEgZXZlbnRzICovXG5cbiAgICBwdWJsaWMgTWlkaUV2ZW50KCkge1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gYSBjb3B5IG9mIHRoaXMgZXZlbnQgKi9cbiAgICBwdWJsaWMgTWlkaUV2ZW50IENsb25lKCkge1xuICAgICAgICBNaWRpRXZlbnQgbWV2ZW50PSBuZXcgTWlkaUV2ZW50KCk7XG4gICAgICAgIG1ldmVudC5EZWx0YVRpbWUgPSBEZWx0YVRpbWU7XG4gICAgICAgIG1ldmVudC5TdGFydFRpbWUgPSBTdGFydFRpbWU7XG4gICAgICAgIG1ldmVudC5IYXNFdmVudGZsYWcgPSBIYXNFdmVudGZsYWc7XG4gICAgICAgIG1ldmVudC5FdmVudEZsYWcgPSBFdmVudEZsYWc7XG4gICAgICAgIG1ldmVudC5DaGFubmVsID0gQ2hhbm5lbDtcbiAgICAgICAgbWV2ZW50Lk5vdGVudW1iZXIgPSBOb3RlbnVtYmVyO1xuICAgICAgICBtZXZlbnQuVmVsb2NpdHkgPSBWZWxvY2l0eTtcbiAgICAgICAgbWV2ZW50Lkluc3RydW1lbnQgPSBJbnN0cnVtZW50O1xuICAgICAgICBtZXZlbnQuS2V5UHJlc3N1cmUgPSBLZXlQcmVzc3VyZTtcbiAgICAgICAgbWV2ZW50LkNoYW5QcmVzc3VyZSA9IENoYW5QcmVzc3VyZTtcbiAgICAgICAgbWV2ZW50LkNvbnRyb2xOdW0gPSBDb250cm9sTnVtO1xuICAgICAgICBtZXZlbnQuQ29udHJvbFZhbHVlID0gQ29udHJvbFZhbHVlO1xuICAgICAgICBtZXZlbnQuUGl0Y2hCZW5kID0gUGl0Y2hCZW5kO1xuICAgICAgICBtZXZlbnQuTnVtZXJhdG9yID0gTnVtZXJhdG9yO1xuICAgICAgICBtZXZlbnQuRGVub21pbmF0b3IgPSBEZW5vbWluYXRvcjtcbiAgICAgICAgbWV2ZW50LlRlbXBvID0gVGVtcG87XG4gICAgICAgIG1ldmVudC5NZXRhZXZlbnQgPSBNZXRhZXZlbnQ7XG4gICAgICAgIG1ldmVudC5NZXRhbGVuZ3RoID0gTWV0YWxlbmd0aDtcbiAgICAgICAgbWV2ZW50LlZhbHVlID0gVmFsdWU7XG4gICAgICAgIHJldHVybiBtZXZlbnQ7XG4gICAgfVxuXG4gICAgLyoqIENvbXBhcmUgdHdvIE1pZGlFdmVudHMgYmFzZWQgb24gdGhlaXIgc3RhcnQgdGltZXMuICovXG4gICAgcHVibGljIGludCBDb21wYXJlKE1pZGlFdmVudCB4LCBNaWRpRXZlbnQgeSkge1xuICAgICAgICBpZiAoeC5TdGFydFRpbWUgPT0geS5TdGFydFRpbWUpIHtcbiAgICAgICAgICAgIGlmICh4LkV2ZW50RmxhZyA9PSB5LkV2ZW50RmxhZykge1xuICAgICAgICAgICAgICAgIHJldHVybiB4Lk5vdGVudW1iZXIgLSB5Lk5vdGVudW1iZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geC5FdmVudEZsYWcgLSB5LkV2ZW50RmxhZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB4LlN0YXJ0VGltZSAtIHkuU3RhcnRUaW1lO1xuICAgICAgICB9XG4gICAgfVxufVxuXG59ICAvKiBFbmQgbmFtZXNwYWNlIE1pZGlTaGVldE11c2ljICovXG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMiBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG5cclxuICAgIC8qIFRoaXMgZmlsZSBjb250YWlucyB0aGUgY2xhc3NlcyBmb3IgcGFyc2luZyBhbmQgbW9kaWZ5aW5nXHJcbiAgICAgKiBNSURJIG11c2ljIGZpbGVzLlxyXG4gICAgICovXHJcblxyXG4gICAgLyogTUlESSBmaWxlIGZvcm1hdC5cclxuICAgICAqXHJcbiAgICAgKiBUaGUgTWlkaSBGaWxlIGZvcm1hdCBpcyBkZXNjcmliZWQgYmVsb3cuICBUaGUgZGVzY3JpcHRpb24gdXNlc1xyXG4gICAgICogdGhlIGZvbGxvd2luZyBhYmJyZXZpYXRpb25zLlxyXG4gICAgICpcclxuICAgICAqIHUxICAgICAtIE9uZSBieXRlXHJcbiAgICAgKiB1MiAgICAgLSBUd28gYnl0ZXMgKGJpZyBlbmRpYW4pXHJcbiAgICAgKiB1NCAgICAgLSBGb3VyIGJ5dGVzIChiaWcgZW5kaWFuKVxyXG4gICAgICogdmFybGVuIC0gQSB2YXJpYWJsZSBsZW5ndGggaW50ZWdlciwgdGhhdCBjYW4gYmUgMSB0byA0IGJ5dGVzLiBUaGUgXHJcbiAgICAgKiAgICAgICAgICBpbnRlZ2VyIGVuZHMgd2hlbiB5b3UgZW5jb3VudGVyIGEgYnl0ZSB0aGF0IGRvZXNuJ3QgaGF2ZSBcclxuICAgICAqICAgICAgICAgIHRoZSA4dGggYml0IHNldCAoYSBieXRlIGxlc3MgdGhhbiAweDgwKS5cclxuICAgICAqIGxlbj8gICAtIFRoZSBsZW5ndGggb2YgdGhlIGRhdGEgZGVwZW5kcyBvbiBzb21lIGNvZGVcclxuICAgICAqICAgICAgICAgIFxyXG4gICAgICpcclxuICAgICAqIFRoZSBNaWRpIGZpbGVzIGJlZ2lucyB3aXRoIHRoZSBtYWluIE1pZGkgaGVhZGVyXHJcbiAgICAgKiB1NCA9IFRoZSBmb3VyIGFzY2lpIGNoYXJhY3RlcnMgJ01UaGQnXHJcbiAgICAgKiB1NCA9IFRoZSBsZW5ndGggb2YgdGhlIE1UaGQgaGVhZGVyID0gNiBieXRlc1xyXG4gICAgICogdTIgPSAwIGlmIHRoZSBmaWxlIGNvbnRhaW5zIGEgc2luZ2xlIHRyYWNrXHJcbiAgICAgKiAgICAgIDEgaWYgdGhlIGZpbGUgY29udGFpbnMgb25lIG9yIG1vcmUgc2ltdWx0YW5lb3VzIHRyYWNrc1xyXG4gICAgICogICAgICAyIGlmIHRoZSBmaWxlIGNvbnRhaW5zIG9uZSBvciBtb3JlIGluZGVwZW5kZW50IHRyYWNrc1xyXG4gICAgICogdTIgPSBudW1iZXIgb2YgdHJhY2tzXHJcbiAgICAgKiB1MiA9IGlmID4gIDAsIHRoZSBudW1iZXIgb2YgcHVsc2VzIHBlciBxdWFydGVyIG5vdGVcclxuICAgICAqICAgICAgaWYgPD0gMCwgdGhlbiA/Pz9cclxuICAgICAqXHJcbiAgICAgKiBOZXh0IGNvbWUgdGhlIGluZGl2aWR1YWwgTWlkaSB0cmFja3MuICBUaGUgdG90YWwgbnVtYmVyIG9mIE1pZGlcclxuICAgICAqIHRyYWNrcyB3YXMgZ2l2ZW4gYWJvdmUsIGluIHRoZSBNVGhkIGhlYWRlci4gIEVhY2ggdHJhY2sgc3RhcnRzXHJcbiAgICAgKiB3aXRoIGEgaGVhZGVyOlxyXG4gICAgICpcclxuICAgICAqIHU0ID0gVGhlIGZvdXIgYXNjaWkgY2hhcmFjdGVycyAnTVRyaydcclxuICAgICAqIHU0ID0gQW1vdW50IG9mIHRyYWNrIGRhdGEsIGluIGJ5dGVzLlxyXG4gICAgICogXHJcbiAgICAgKiBUaGUgdHJhY2sgZGF0YSBjb25zaXN0cyBvZiBhIHNlcmllcyBvZiBNaWRpIGV2ZW50cy4gIEVhY2ggTWlkaSBldmVudFxyXG4gICAgICogaGFzIHRoZSBmb2xsb3dpbmcgZm9ybWF0OlxyXG4gICAgICpcclxuICAgICAqIHZhcmxlbiAgLSBUaGUgdGltZSBiZXR3ZWVuIHRoZSBwcmV2aW91cyBldmVudCBhbmQgdGhpcyBldmVudCwgbWVhc3VyZWRcclxuICAgICAqICAgICAgICAgICBpbiBcInB1bHNlc1wiLiAgVGhlIG51bWJlciBvZiBwdWxzZXMgcGVyIHF1YXJ0ZXIgbm90ZSBpcyBnaXZlblxyXG4gICAgICogICAgICAgICAgIGluIHRoZSBNVGhkIGhlYWRlci5cclxuICAgICAqIHUxICAgICAgLSBUaGUgRXZlbnQgY29kZSwgYWx3YXlzIGJldHdlZSAweDgwIGFuZCAweEZGXHJcbiAgICAgKiBsZW4/ICAgIC0gVGhlIGV2ZW50IGRhdGEuICBUaGUgbGVuZ3RoIG9mIHRoaXMgZGF0YSBpcyBkZXRlcm1pbmVkIGJ5IHRoZVxyXG4gICAgICogICAgICAgICAgIGV2ZW50IGNvZGUuICBUaGUgZmlyc3QgYnl0ZSBvZiB0aGUgZXZlbnQgZGF0YSBpcyBhbHdheXMgPCAweDgwLlxyXG4gICAgICpcclxuICAgICAqIFRoZSBldmVudCBjb2RlIGlzIG9wdGlvbmFsLiAgSWYgdGhlIGV2ZW50IGNvZGUgaXMgbWlzc2luZywgdGhlbiBpdFxyXG4gICAgICogZGVmYXVsdHMgdG8gdGhlIHByZXZpb3VzIGV2ZW50IGNvZGUuICBGb3IgZXhhbXBsZTpcclxuICAgICAqXHJcbiAgICAgKiAgIHZhcmxlbiwgZXZlbnRjb2RlMSwgZXZlbnRkYXRhLFxyXG4gICAgICogICB2YXJsZW4sIGV2ZW50Y29kZTIsIGV2ZW50ZGF0YSxcclxuICAgICAqICAgdmFybGVuLCBldmVudGRhdGEsICAvLyBldmVudGNvZGUgaXMgZXZlbnRjb2RlMlxyXG4gICAgICogICB2YXJsZW4sIGV2ZW50ZGF0YSwgIC8vIGV2ZW50Y29kZSBpcyBldmVudGNvZGUyXHJcbiAgICAgKiAgIHZhcmxlbiwgZXZlbnRjb2RlMywgZXZlbnRkYXRhLFxyXG4gICAgICogICAuLi4uXHJcbiAgICAgKlxyXG4gICAgICogICBIb3cgZG8geW91IGtub3cgaWYgdGhlIGV2ZW50Y29kZSBpcyB0aGVyZSBvciBtaXNzaW5nPyBXZWxsOlxyXG4gICAgICogICAtIEFsbCBldmVudCBjb2RlcyBhcmUgYmV0d2VlbiAweDgwIGFuZCAweEZGXHJcbiAgICAgKiAgIC0gVGhlIGZpcnN0IGJ5dGUgb2YgZXZlbnRkYXRhIGlzIGFsd2F5cyBsZXNzIHRoYW4gMHg4MC5cclxuICAgICAqICAgU28sIGFmdGVyIHRoZSB2YXJsZW4gZGVsdGEgdGltZSwgaWYgdGhlIG5leHQgYnl0ZSBpcyBiZXR3ZWVuIDB4ODBcclxuICAgICAqICAgYW5kIDB4RkYsIGl0cyBhbiBldmVudCBjb2RlLiAgT3RoZXJ3aXNlLCBpdHMgZXZlbnQgZGF0YS5cclxuICAgICAqXHJcbiAgICAgKiBUaGUgRXZlbnQgY29kZXMgYW5kIGV2ZW50IGRhdGEgZm9yIGVhY2ggZXZlbnQgY29kZSBhcmUgc2hvd24gYmVsb3cuXHJcbiAgICAgKlxyXG4gICAgICogQ29kZTogIHUxIC0gMHg4MCB0aHJ1IDB4OEYgLSBOb3RlIE9mZiBldmVudC5cclxuICAgICAqICAgICAgICAgICAgIDB4ODAgaXMgZm9yIGNoYW5uZWwgMSwgMHg4RiBpcyBmb3IgY2hhbm5lbCAxNi5cclxuICAgICAqIERhdGE6ICB1MSAtIFRoZSBub3RlIG51bWJlciwgMC0xMjcuICBNaWRkbGUgQyBpcyA2MCAoMHgzQylcclxuICAgICAqICAgICAgICB1MSAtIFRoZSBub3RlIHZlbG9jaXR5LiAgVGhpcyBzaG91bGQgYmUgMFxyXG4gICAgICogXHJcbiAgICAgKiBDb2RlOiAgdTEgLSAweDkwIHRocnUgMHg5RiAtIE5vdGUgT24gZXZlbnQuXHJcbiAgICAgKiAgICAgICAgICAgICAweDkwIGlzIGZvciBjaGFubmVsIDEsIDB4OUYgaXMgZm9yIGNoYW5uZWwgMTYuXHJcbiAgICAgKiBEYXRhOiAgdTEgLSBUaGUgbm90ZSBudW1iZXIsIDAtMTI3LiAgTWlkZGxlIEMgaXMgNjAgKDB4M0MpXHJcbiAgICAgKiAgICAgICAgdTEgLSBUaGUgbm90ZSB2ZWxvY2l0eSwgZnJvbSAwIChubyBzb3VuZCkgdG8gMTI3IChsb3VkKS5cclxuICAgICAqICAgICAgICAgICAgIEEgdmFsdWUgb2YgMCBpcyBlcXVpdmFsZW50IHRvIGEgTm90ZSBPZmYuXHJcbiAgICAgKlxyXG4gICAgICogQ29kZTogIHUxIC0gMHhBMCB0aHJ1IDB4QUYgLSBLZXkgUHJlc3N1cmVcclxuICAgICAqIERhdGE6ICB1MSAtIFRoZSBub3RlIG51bWJlciwgMC0xMjcuXHJcbiAgICAgKiAgICAgICAgdTEgLSBUaGUgcHJlc3N1cmUuXHJcbiAgICAgKlxyXG4gICAgICogQ29kZTogIHUxIC0gMHhCMCB0aHJ1IDB4QkYgLSBDb250cm9sIENoYW5nZVxyXG4gICAgICogRGF0YTogIHUxIC0gVGhlIGNvbnRyb2xsZXIgbnVtYmVyXHJcbiAgICAgKiAgICAgICAgdTEgLSBUaGUgdmFsdWVcclxuICAgICAqXHJcbiAgICAgKiBDb2RlOiAgdTEgLSAweEMwIHRocnUgMHhDRiAtIFByb2dyYW0gQ2hhbmdlXHJcbiAgICAgKiBEYXRhOiAgdTEgLSBUaGUgcHJvZ3JhbSBudW1iZXIuXHJcbiAgICAgKlxyXG4gICAgICogQ29kZTogIHUxIC0gMHhEMCB0aHJ1IDB4REYgLSBDaGFubmVsIFByZXNzdXJlXHJcbiAgICAgKiAgICAgICAgdTEgLSBUaGUgcHJlc3N1cmUuXHJcbiAgICAgKlxyXG4gICAgICogQ29kZTogIHUxIC0gMHhFMCB0aHJ1IDB4RUYgLSBQaXRjaCBCZW5kXHJcbiAgICAgKiBEYXRhOiAgdTIgLSBTb21lIGRhdGFcclxuICAgICAqXHJcbiAgICAgKiBDb2RlOiAgdTEgICAgIC0gMHhGRiAtIE1ldGEgRXZlbnRcclxuICAgICAqIERhdGE6ICB1MSAgICAgLSBNZXRhY29kZVxyXG4gICAgICogICAgICAgIHZhcmxlbiAtIExlbmd0aCBvZiBtZXRhIGV2ZW50XHJcbiAgICAgKiAgICAgICAgdTFbdmFybGVuXSAtIE1ldGEgZXZlbnQgZGF0YS5cclxuICAgICAqXHJcbiAgICAgKlxyXG4gICAgICogVGhlIE1ldGEgRXZlbnQgY29kZXMgYXJlIGxpc3RlZCBiZWxvdzpcclxuICAgICAqXHJcbiAgICAgKiBNZXRhY29kZTogdTEgICAgICAgICAtIDB4MCAgU2VxdWVuY2UgTnVtYmVyXHJcbiAgICAgKiAgICAgICAgICAgdmFybGVuICAgICAtIDAgb3IgMlxyXG4gICAgICogICAgICAgICAgIHUxW3Zhcmxlbl0gLSBTZXF1ZW5jZSBudW1iZXJcclxuICAgICAqXHJcbiAgICAgKiBNZXRhY29kZTogdTEgICAgICAgICAtIDB4MSAgVGV4dFxyXG4gICAgICogICAgICAgICAgIHZhcmxlbiAgICAgLSBMZW5ndGggb2YgdGV4dFxyXG4gICAgICogICAgICAgICAgIHUxW3Zhcmxlbl0gLSBUZXh0XHJcbiAgICAgKlxyXG4gICAgICogTWV0YWNvZGU6IHUxICAgICAgICAgLSAweDIgIENvcHlyaWdodFxyXG4gICAgICogICAgICAgICAgIHZhcmxlbiAgICAgLSBMZW5ndGggb2YgdGV4dFxyXG4gICAgICogICAgICAgICAgIHUxW3Zhcmxlbl0gLSBUZXh0XHJcbiAgICAgKlxyXG4gICAgICogTWV0YWNvZGU6IHUxICAgICAgICAgLSAweDMgIFRyYWNrIE5hbWVcclxuICAgICAqICAgICAgICAgICB2YXJsZW4gICAgIC0gTGVuZ3RoIG9mIG5hbWVcclxuICAgICAqICAgICAgICAgICB1MVt2YXJsZW5dIC0gVHJhY2sgTmFtZVxyXG4gICAgICpcclxuICAgICAqIE1ldGFjb2RlOiB1MSAgICAgICAgIC0gMHg1OCAgVGltZSBTaWduYXR1cmVcclxuICAgICAqICAgICAgICAgICB2YXJsZW4gICAgIC0gNCBcclxuICAgICAqICAgICAgICAgICB1MSAgICAgICAgIC0gbnVtZXJhdG9yXHJcbiAgICAgKiAgICAgICAgICAgdTEgICAgICAgICAtIGxvZzIoZGVub21pbmF0b3IpXHJcbiAgICAgKiAgICAgICAgICAgdTEgICAgICAgICAtIGNsb2NrcyBpbiBtZXRyb25vbWUgY2xpY2tcclxuICAgICAqICAgICAgICAgICB1MSAgICAgICAgIC0gMzJuZCBub3RlcyBpbiBxdWFydGVyIG5vdGUgKHVzdWFsbHkgOClcclxuICAgICAqXHJcbiAgICAgKiBNZXRhY29kZTogdTEgICAgICAgICAtIDB4NTkgIEtleSBTaWduYXR1cmVcclxuICAgICAqICAgICAgICAgICB2YXJsZW4gICAgIC0gMlxyXG4gICAgICogICAgICAgICAgIHUxICAgICAgICAgLSBpZiA+PSAwLCB0aGVuIG51bWJlciBvZiBzaGFycHNcclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgaWYgPCAwLCB0aGVuIG51bWJlciBvZiBmbGF0cyAqIC0xXHJcbiAgICAgKiAgICAgICAgICAgdTEgICAgICAgICAtIDAgaWYgbWFqb3Iga2V5XHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgIDEgaWYgbWlub3Iga2V5XHJcbiAgICAgKlxyXG4gICAgICogTWV0YWNvZGU6IHUxICAgICAgICAgLSAweDUxICBUZW1wb1xyXG4gICAgICogICAgICAgICAgIHZhcmxlbiAgICAgLSAzICBcclxuICAgICAqICAgICAgICAgICB1MyAgICAgICAgIC0gcXVhcnRlciBub3RlIGxlbmd0aCBpbiBtaWNyb3NlY29uZHNcclxuICAgICAqL1xyXG5cclxuXHJcbiAgICAvKiogQGNsYXNzIE1pZGlGaWxlXG4gICAgICpcbiAgICAgKiBUaGUgTWlkaUZpbGUgY2xhc3MgY29udGFpbnMgdGhlIHBhcnNlZCBkYXRhIGZyb20gdGhlIE1pZGkgRmlsZS5cbiAgICAgKiBJdCBjb250YWluczpcbiAgICAgKiAtIEFsbCB0aGUgdHJhY2tzIGluIHRoZSBtaWRpIGZpbGUsIGluY2x1ZGluZyBhbGwgTWlkaU5vdGVzIHBlciB0cmFjay5cbiAgICAgKiAtIFRoZSB0aW1lIHNpZ25hdHVyZSAoZS5nLiA0LzQsIDMvNCwgNi84KVxuICAgICAqIC0gVGhlIG51bWJlciBvZiBwdWxzZXMgcGVyIHF1YXJ0ZXIgbm90ZS5cbiAgICAgKiAtIFRoZSB0ZW1wbyAobnVtYmVyIG9mIG1pY3Jvc2Vjb25kcyBwZXIgcXVhcnRlciBub3RlKS5cbiAgICAgKlxuICAgICAqIFRoZSBjb25zdHJ1Y3RvciB0YWtlcyBhIGZpbGVuYW1lIGFzIGlucHV0LCBhbmQgdXBvbiByZXR1cm5pbmcsXG4gICAgICogY29udGFpbnMgdGhlIHBhcnNlZCBkYXRhIGZyb20gdGhlIG1pZGkgZmlsZS5cbiAgICAgKlxuICAgICAqIFRoZSBtZXRob2RzIFJlYWRUcmFjaygpIGFuZCBSZWFkTWV0YUV2ZW50KCkgYXJlIGhlbHBlciBmdW5jdGlvbnMgY2FsbGVkXG4gICAgICogYnkgdGhlIGNvbnN0cnVjdG9yIGR1cmluZyB0aGUgcGFyc2luZy5cbiAgICAgKlxuICAgICAqIEFmdGVyIHRoZSBNaWRpRmlsZSBpcyBwYXJzZWQgYW5kIGNyZWF0ZWQsIHRoZSB1c2VyIGNhbiByZXRyaWV2ZSB0aGUgXG4gICAgICogdHJhY2tzIGFuZCBub3RlcyBieSB1c2luZyB0aGUgcHJvcGVydHkgVHJhY2tzIGFuZCBUcmFja3MuTm90ZXMuXG4gICAgICpcbiAgICAgKiBUaGVyZSBhcmUgdHdvIG1ldGhvZHMgZm9yIG1vZGlmeWluZyB0aGUgbWlkaSBkYXRhIGJhc2VkIG9uIHRoZSBtZW51XG4gICAgICogb3B0aW9ucyBzZWxlY3RlZDpcbiAgICAgKlxuICAgICAqIC0gQ2hhbmdlTWlkaU5vdGVzKClcbiAgICAgKiAgIEFwcGx5IHRoZSBtZW51IG9wdGlvbnMgdG8gdGhlIHBhcnNlZCBNaWRpRmlsZS4gIFRoaXMgdXNlcyB0aGUgaGVscGVyIGZ1bmN0aW9uczpcbiAgICAgKiAgICAgU3BsaXRUcmFjaygpXG4gICAgICogICAgIENvbWJpbmVUb1R3b1RyYWNrcygpXG4gICAgICogICAgIFNoaWZ0VGltZSgpXG4gICAgICogICAgIFRyYW5zcG9zZSgpXG4gICAgICogICAgIFJvdW5kU3RhcnRUaW1lcygpXG4gICAgICogICAgIFJvdW5kRHVyYXRpb25zKClcbiAgICAgKlxuICAgICAqIC0gQ2hhbmdlU291bmQoKVxuICAgICAqICAgQXBwbHkgdGhlIG1lbnUgb3B0aW9ucyB0byB0aGUgTUlESSBtdXNpYyBkYXRhLCBhbmQgc2F2ZSB0aGUgbW9kaWZpZWQgbWlkaSBkYXRhIFxuICAgICAqICAgdG8gYSBmaWxlLCBmb3IgcGxheWJhY2suIFxuICAgICAqICAgXG4gICAgICovXHJcblxyXG4gICAgcHVibGljIGNsYXNzIE1pZGlGaWxlXHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSBzdHJpbmcgZmlsZW5hbWU7ICAgICAgICAgIC8qKiBUaGUgTWlkaSBmaWxlIG5hbWUgKi9cclxuICAgICAgICBwcml2YXRlIExpc3Q8TWlkaUV2ZW50PltdIGV2ZW50czsgLyoqIFRoZSByYXcgTWlkaUV2ZW50cywgb25lIGxpc3QgcGVyIHRyYWNrICovXHJcbiAgICAgICAgcHJpdmF0ZSBMaXN0PE1pZGlUcmFjaz4gdHJhY2tzOyAgLyoqIFRoZSB0cmFja3Mgb2YgdGhlIG1pZGlmaWxlIHRoYXQgaGF2ZSBub3RlcyAqL1xyXG4gICAgICAgIHByaXZhdGUgdXNob3J0IHRyYWNrbW9kZTsgICAgICAgICAvKiogMCAoc2luZ2xlIHRyYWNrKSwgMSAoc2ltdWx0YW5lb3VzIHRyYWNrcykgMiAoaW5kZXBlbmRlbnQgdHJhY2tzKSAqL1xyXG4gICAgICAgIHByaXZhdGUgVGltZVNpZ25hdHVyZSB0aW1lc2lnOyAgICAvKiogVGhlIHRpbWUgc2lnbmF0dXJlICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgcXVhcnRlcm5vdGU7ICAgICAgICAgIC8qKiBUaGUgbnVtYmVyIG9mIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgdG90YWxwdWxzZXM7ICAgICAgICAgIC8qKiBUaGUgdG90YWwgbGVuZ3RoIG9mIHRoZSBzb25nLCBpbiBwdWxzZXMgKi9cclxuICAgICAgICBwcml2YXRlIGJvb2wgdHJhY2tQZXJDaGFubmVsOyAgICAgLyoqIFRydWUgaWYgd2UndmUgc3BsaXQgZWFjaCBjaGFubmVsIGludG8gYSB0cmFjayAqL1xyXG5cclxuICAgICAgICAvKiBUaGUgbGlzdCBvZiBNaWRpIEV2ZW50cyAqL1xyXG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgRXZlbnROb3RlT2ZmID0gMHg4MDtcclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IEV2ZW50Tm90ZU9uID0gMHg5MDtcclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IEV2ZW50S2V5UHJlc3N1cmUgPSAweEEwO1xyXG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgRXZlbnRDb250cm9sQ2hhbmdlID0gMHhCMDtcclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IEV2ZW50UHJvZ3JhbUNoYW5nZSA9IDB4QzA7XHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBFdmVudENoYW5uZWxQcmVzc3VyZSA9IDB4RDA7XHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBFdmVudFBpdGNoQmVuZCA9IDB4RTA7XHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBTeXNleEV2ZW50MSA9IDB4RjA7XHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBTeXNleEV2ZW50MiA9IDB4Rjc7XHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnQgPSAweEZGO1xyXG5cclxuICAgICAgICAvKiBUaGUgbGlzdCBvZiBNZXRhIEV2ZW50cyAqL1xyXG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50U2VxdWVuY2UgPSAweDA7XHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRUZXh0ID0gMHgxO1xyXG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50Q29weXJpZ2h0ID0gMHgyO1xyXG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50U2VxdWVuY2VOYW1lID0gMHgzO1xyXG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50SW5zdHJ1bWVudCA9IDB4NDtcclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudEx5cmljID0gMHg1O1xyXG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50TWFya2VyID0gMHg2O1xyXG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgTWV0YUV2ZW50RW5kT2ZUcmFjayA9IDB4MkY7XHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRUZW1wbyA9IDB4NTE7XHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRTTVBURU9mZnNldCA9IDB4NTQ7XHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBNZXRhRXZlbnRUaW1lU2lnbmF0dXJlID0gMHg1ODtcclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IE1ldGFFdmVudEtleVNpZ25hdHVyZSA9IDB4NTk7XHJcblxyXG4gICAgICAgIC8qIFRoZSBQcm9ncmFtIENoYW5nZSBldmVudCBnaXZlcyB0aGUgaW5zdHJ1bWVudCB0aGF0IHNob3VsZFxyXG4gICAgICAgICAqIGJlIHVzZWQgZm9yIGEgcGFydGljdWxhciBjaGFubmVsLiAgVGhlIGZvbGxvd2luZyB0YWJsZVxyXG4gICAgICAgICAqIG1hcHMgZWFjaCBpbnN0cnVtZW50IG51bWJlciAoMCB0aHJ1IDEyOCkgdG8gYW4gaW5zdHJ1bWVudFxyXG4gICAgICAgICAqIG5hbWUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBzdHJpbmdbXSBJbnN0cnVtZW50cyA9IHtcblxuICAgICAgICBcIkFjb3VzdGljIEdyYW5kIFBpYW5vXCIsXG4gICAgICAgIFwiQnJpZ2h0IEFjb3VzdGljIFBpYW5vXCIsXG4gICAgICAgIFwiRWxlY3RyaWMgR3JhbmQgUGlhbm9cIixcbiAgICAgICAgXCJIb25reS10b25rIFBpYW5vXCIsXG4gICAgICAgIFwiRWxlY3RyaWMgUGlhbm8gMVwiLFxuICAgICAgICBcIkVsZWN0cmljIFBpYW5vIDJcIixcbiAgICAgICAgXCJIYXJwc2ljaG9yZFwiLFxuICAgICAgICBcIkNsYXZpXCIsXG4gICAgICAgIFwiQ2VsZXN0YVwiLFxuICAgICAgICBcIkdsb2NrZW5zcGllbFwiLFxuICAgICAgICBcIk11c2ljIEJveFwiLFxuICAgICAgICBcIlZpYnJhcGhvbmVcIixcbiAgICAgICAgXCJNYXJpbWJhXCIsXG4gICAgICAgIFwiWHlsb3Bob25lXCIsXG4gICAgICAgIFwiVHVidWxhciBCZWxsc1wiLFxuICAgICAgICBcIkR1bGNpbWVyXCIsXG4gICAgICAgIFwiRHJhd2JhciBPcmdhblwiLFxuICAgICAgICBcIlBlcmN1c3NpdmUgT3JnYW5cIixcbiAgICAgICAgXCJSb2NrIE9yZ2FuXCIsXG4gICAgICAgIFwiQ2h1cmNoIE9yZ2FuXCIsXG4gICAgICAgIFwiUmVlZCBPcmdhblwiLFxuICAgICAgICBcIkFjY29yZGlvblwiLFxuICAgICAgICBcIkhhcm1vbmljYVwiLFxuICAgICAgICBcIlRhbmdvIEFjY29yZGlvblwiLFxuICAgICAgICBcIkFjb3VzdGljIEd1aXRhciAobnlsb24pXCIsXG4gICAgICAgIFwiQWNvdXN0aWMgR3VpdGFyIChzdGVlbClcIixcbiAgICAgICAgXCJFbGVjdHJpYyBHdWl0YXIgKGphenopXCIsXG4gICAgICAgIFwiRWxlY3RyaWMgR3VpdGFyIChjbGVhbilcIixcbiAgICAgICAgXCJFbGVjdHJpYyBHdWl0YXIgKG11dGVkKVwiLFxuICAgICAgICBcIk92ZXJkcml2ZW4gR3VpdGFyXCIsXG4gICAgICAgIFwiRGlzdG9ydGlvbiBHdWl0YXJcIixcbiAgICAgICAgXCJHdWl0YXIgaGFybW9uaWNzXCIsXG4gICAgICAgIFwiQWNvdXN0aWMgQmFzc1wiLFxuICAgICAgICBcIkVsZWN0cmljIEJhc3MgKGZpbmdlcilcIixcbiAgICAgICAgXCJFbGVjdHJpYyBCYXNzIChwaWNrKVwiLFxuICAgICAgICBcIkZyZXRsZXNzIEJhc3NcIixcbiAgICAgICAgXCJTbGFwIEJhc3MgMVwiLFxuICAgICAgICBcIlNsYXAgQmFzcyAyXCIsXG4gICAgICAgIFwiU3ludGggQmFzcyAxXCIsXG4gICAgICAgIFwiU3ludGggQmFzcyAyXCIsXG4gICAgICAgIFwiVmlvbGluXCIsXG4gICAgICAgIFwiVmlvbGFcIixcbiAgICAgICAgXCJDZWxsb1wiLFxuICAgICAgICBcIkNvbnRyYWJhc3NcIixcbiAgICAgICAgXCJUcmVtb2xvIFN0cmluZ3NcIixcbiAgICAgICAgXCJQaXp6aWNhdG8gU3RyaW5nc1wiLFxuICAgICAgICBcIk9yY2hlc3RyYWwgSGFycFwiLFxuICAgICAgICBcIlRpbXBhbmlcIixcbiAgICAgICAgXCJTdHJpbmcgRW5zZW1ibGUgMVwiLFxuICAgICAgICBcIlN0cmluZyBFbnNlbWJsZSAyXCIsXG4gICAgICAgIFwiU3ludGhTdHJpbmdzIDFcIixcbiAgICAgICAgXCJTeW50aFN0cmluZ3MgMlwiLFxuICAgICAgICBcIkNob2lyIEFhaHNcIixcbiAgICAgICAgXCJWb2ljZSBPb2hzXCIsXG4gICAgICAgIFwiU3ludGggVm9pY2VcIixcbiAgICAgICAgXCJPcmNoZXN0cmEgSGl0XCIsXG4gICAgICAgIFwiVHJ1bXBldFwiLFxuICAgICAgICBcIlRyb21ib25lXCIsXG4gICAgICAgIFwiVHViYVwiLFxuICAgICAgICBcIk11dGVkIFRydW1wZXRcIixcbiAgICAgICAgXCJGcmVuY2ggSG9yblwiLFxuICAgICAgICBcIkJyYXNzIFNlY3Rpb25cIixcbiAgICAgICAgXCJTeW50aEJyYXNzIDFcIixcbiAgICAgICAgXCJTeW50aEJyYXNzIDJcIixcbiAgICAgICAgXCJTb3ByYW5vIFNheFwiLFxuICAgICAgICBcIkFsdG8gU2F4XCIsXG4gICAgICAgIFwiVGVub3IgU2F4XCIsXG4gICAgICAgIFwiQmFyaXRvbmUgU2F4XCIsXG4gICAgICAgIFwiT2JvZVwiLFxuICAgICAgICBcIkVuZ2xpc2ggSG9yblwiLFxuICAgICAgICBcIkJhc3Nvb25cIixcbiAgICAgICAgXCJDbGFyaW5ldFwiLFxuICAgICAgICBcIlBpY2NvbG9cIixcbiAgICAgICAgXCJGbHV0ZVwiLFxuICAgICAgICBcIlJlY29yZGVyXCIsXG4gICAgICAgIFwiUGFuIEZsdXRlXCIsXG4gICAgICAgIFwiQmxvd24gQm90dGxlXCIsXG4gICAgICAgIFwiU2hha3VoYWNoaVwiLFxuICAgICAgICBcIldoaXN0bGVcIixcbiAgICAgICAgXCJPY2FyaW5hXCIsXG4gICAgICAgIFwiTGVhZCAxIChzcXVhcmUpXCIsXG4gICAgICAgIFwiTGVhZCAyIChzYXd0b290aClcIixcbiAgICAgICAgXCJMZWFkIDMgKGNhbGxpb3BlKVwiLFxuICAgICAgICBcIkxlYWQgNCAoY2hpZmYpXCIsXG4gICAgICAgIFwiTGVhZCA1IChjaGFyYW5nKVwiLFxuICAgICAgICBcIkxlYWQgNiAodm9pY2UpXCIsXG4gICAgICAgIFwiTGVhZCA3IChmaWZ0aHMpXCIsXG4gICAgICAgIFwiTGVhZCA4IChiYXNzICsgbGVhZClcIixcbiAgICAgICAgXCJQYWQgMSAobmV3IGFnZSlcIixcbiAgICAgICAgXCJQYWQgMiAod2FybSlcIixcbiAgICAgICAgXCJQYWQgMyAocG9seXN5bnRoKVwiLFxuICAgICAgICBcIlBhZCA0IChjaG9pcilcIixcbiAgICAgICAgXCJQYWQgNSAoYm93ZWQpXCIsXG4gICAgICAgIFwiUGFkIDYgKG1ldGFsbGljKVwiLFxuICAgICAgICBcIlBhZCA3IChoYWxvKVwiLFxuICAgICAgICBcIlBhZCA4IChzd2VlcClcIixcbiAgICAgICAgXCJGWCAxIChyYWluKVwiLFxuICAgICAgICBcIkZYIDIgKHNvdW5kdHJhY2spXCIsXG4gICAgICAgIFwiRlggMyAoY3J5c3RhbClcIixcbiAgICAgICAgXCJGWCA0IChhdG1vc3BoZXJlKVwiLFxuICAgICAgICBcIkZYIDUgKGJyaWdodG5lc3MpXCIsXG4gICAgICAgIFwiRlggNiAoZ29ibGlucylcIixcbiAgICAgICAgXCJGWCA3IChlY2hvZXMpXCIsXG4gICAgICAgIFwiRlggOCAoc2NpLWZpKVwiLFxuICAgICAgICBcIlNpdGFyXCIsXG4gICAgICAgIFwiQmFuam9cIixcbiAgICAgICAgXCJTaGFtaXNlblwiLFxuICAgICAgICBcIktvdG9cIixcbiAgICAgICAgXCJLYWxpbWJhXCIsXG4gICAgICAgIFwiQmFnIHBpcGVcIixcbiAgICAgICAgXCJGaWRkbGVcIixcbiAgICAgICAgXCJTaGFuYWlcIixcbiAgICAgICAgXCJUaW5rbGUgQmVsbFwiLFxuICAgICAgICBcIkFnb2dvXCIsXG4gICAgICAgIFwiU3RlZWwgRHJ1bXNcIixcbiAgICAgICAgXCJXb29kYmxvY2tcIixcbiAgICAgICAgXCJUYWlrbyBEcnVtXCIsXG4gICAgICAgIFwiTWVsb2RpYyBUb21cIixcbiAgICAgICAgXCJTeW50aCBEcnVtXCIsXG4gICAgICAgIFwiUmV2ZXJzZSBDeW1iYWxcIixcbiAgICAgICAgXCJHdWl0YXIgRnJldCBOb2lzZVwiLFxuICAgICAgICBcIkJyZWF0aCBOb2lzZVwiLFxuICAgICAgICBcIlNlYXNob3JlXCIsXG4gICAgICAgIFwiQmlyZCBUd2VldFwiLFxuICAgICAgICBcIlRlbGVwaG9uZSBSaW5nXCIsXG4gICAgICAgIFwiSGVsaWNvcHRlclwiLFxuICAgICAgICBcIkFwcGxhdXNlXCIsXG4gICAgICAgIFwiR3Vuc2hvdFwiLFxuICAgICAgICBcIlBlcmN1c3Npb25cIlxuICAgIH07XHJcbiAgICAgICAgLyogRW5kIEluc3RydW1lbnRzICovXHJcblxyXG4gICAgICAgIC8qKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBNaWRpIGV2ZW50ICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdHJpbmcgRXZlbnROYW1lKGludCBldilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChldiA+PSBFdmVudE5vdGVPZmYgJiYgZXYgPCBFdmVudE5vdGVPZmYgKyAxNilcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIk5vdGVPZmZcIjtcclxuICAgICAgICAgICAgZWxzZSBpZiAoZXYgPj0gRXZlbnROb3RlT24gJiYgZXYgPCBFdmVudE5vdGVPbiArIDE2KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiTm90ZU9uXCI7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ID49IEV2ZW50S2V5UHJlc3N1cmUgJiYgZXYgPCBFdmVudEtleVByZXNzdXJlICsgMTYpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJLZXlQcmVzc3VyZVwiO1xyXG4gICAgICAgICAgICBlbHNlIGlmIChldiA+PSBFdmVudENvbnRyb2xDaGFuZ2UgJiYgZXYgPCBFdmVudENvbnRyb2xDaGFuZ2UgKyAxNilcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIkNvbnRyb2xDaGFuZ2VcIjtcclxuICAgICAgICAgICAgZWxzZSBpZiAoZXYgPj0gRXZlbnRQcm9ncmFtQ2hhbmdlICYmIGV2IDwgRXZlbnRQcm9ncmFtQ2hhbmdlICsgMTYpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJQcm9ncmFtQ2hhbmdlXCI7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ID49IEV2ZW50Q2hhbm5lbFByZXNzdXJlICYmIGV2IDwgRXZlbnRDaGFubmVsUHJlc3N1cmUgKyAxNilcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIkNoYW5uZWxQcmVzc3VyZVwiO1xyXG4gICAgICAgICAgICBlbHNlIGlmIChldiA+PSBFdmVudFBpdGNoQmVuZCAmJiBldiA8IEV2ZW50UGl0Y2hCZW5kICsgMTYpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJQaXRjaEJlbmRcIjtcclxuICAgICAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiTWV0YUV2ZW50XCI7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ID09IFN5c2V4RXZlbnQxIHx8IGV2ID09IFN5c2V4RXZlbnQyKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiU3lzZXhFdmVudFwiO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJVbmtub3duXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWV0YS1ldmVudCAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RyaW5nIE1ldGFOYW1lKGludCBldilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChldiA9PSBNZXRhRXZlbnRTZXF1ZW5jZSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudFNlcXVlbmNlXCI7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ID09IE1ldGFFdmVudFRleHQpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJNZXRhRXZlbnRUZXh0XCI7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ID09IE1ldGFFdmVudENvcHlyaWdodClcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudENvcHlyaWdodFwiO1xyXG4gICAgICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRTZXF1ZW5jZU5hbWUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJNZXRhRXZlbnRTZXF1ZW5jZU5hbWVcIjtcclxuICAgICAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50SW5zdHJ1bWVudClcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudEluc3RydW1lbnRcIjtcclxuICAgICAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50THlyaWMpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJNZXRhRXZlbnRMeXJpY1wiO1xyXG4gICAgICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRNYXJrZXIpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJNZXRhRXZlbnRNYXJrZXJcIjtcclxuICAgICAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50RW5kT2ZUcmFjaylcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudEVuZE9mVHJhY2tcIjtcclxuICAgICAgICAgICAgZWxzZSBpZiAoZXYgPT0gTWV0YUV2ZW50VGVtcG8pXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJNZXRhRXZlbnRUZW1wb1wiO1xyXG4gICAgICAgICAgICBlbHNlIGlmIChldiA9PSBNZXRhRXZlbnRTTVBURU9mZnNldClcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudFNNUFRFT2Zmc2V0XCI7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ID09IE1ldGFFdmVudFRpbWVTaWduYXR1cmUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJNZXRhRXZlbnRUaW1lU2lnbmF0dXJlXCI7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGV2ID09IE1ldGFFdmVudEtleVNpZ25hdHVyZSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIk1ldGFFdmVudEtleVNpZ25hdHVyZVwiO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJVbmtub3duXCI7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIEdldCB0aGUgbGlzdCBvZiB0cmFja3MgKi9cclxuICAgICAgICBwdWJsaWMgTGlzdDxNaWRpVHJhY2s+IFRyYWNrc1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIHRyYWNrczsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIEdldCB0aGUgdGltZSBzaWduYXR1cmUgKi9cclxuICAgICAgICBwdWJsaWMgVGltZVNpZ25hdHVyZSBUaW1lXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gdGltZXNpZzsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIEdldCB0aGUgZmlsZSBuYW1lICovXHJcbiAgICAgICAgcHVibGljIHN0cmluZyBGaWxlTmFtZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIGZpbGVuYW1lOyB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogR2V0IHRoZSB0b3RhbCBsZW5ndGggKGluIHB1bHNlcykgb2YgdGhlIHNvbmcgKi9cclxuICAgICAgICBwdWJsaWMgaW50IFRvdGFsUHVsc2VzXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gdG90YWxwdWxzZXM7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgYnl0ZVtdIFBhcnNlUmlmZkRhdGEoYnl0ZVtdIGRhdGEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgcmlmZkZpbGUgPSBSaWZmUGFyc2VyLlBhcnNlQnl0ZUFycmF5KGRhdGEpO1xyXG4gICAgICAgICAgICBpZiAocmlmZkZpbGUuRmlsZUluZm8uRmlsZVR5cGUgIT0gXCJSTUlEXCIpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHdoaWxlIChyaWZmRmlsZS5SZWFkKChnbG9iYWw6Ok1pZGlTaGVldE11c2ljLlByb2Nlc3NFbGVtZW50KSgodHlwZSwgaXNMaXN0LCBjaHVuaykgPT5cclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFpc0xpc3QgJiYgdHlwZS5Ub0xvd2VyKCkgPT0gXCJkYXRhXCIpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IGNodW5rLkdldERhdGEoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkpKSA7XHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIENyZWF0ZSBhIG5ldyBNaWRpRmlsZSBmcm9tIHRoZSBieXRlW10uICovXHJcbiAgICAgICAgcHVibGljIE1pZGlGaWxlKGJ5dGVbXSBkYXRhLCBzdHJpbmcgdGl0bGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzdHJpbmcgaGVhZGVyO1xyXG4gICAgICAgICAgICBpZiAoUmlmZlBhcnNlci5Jc1JpZmZGaWxlKGRhdGEsIG91dCBoZWFkZXIpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBkYXRhID0gUGFyc2VSaWZmRGF0YShkYXRhKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgTWlkaUZpbGVSZWFkZXIgZmlsZSA9IG5ldyBNaWRpRmlsZVJlYWRlcihkYXRhKTtcclxuICAgICAgICAgICAgaWYgKHRpdGxlID09IG51bGwpXHJcbiAgICAgICAgICAgICAgICB0aXRsZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIHBhcnNlKGZpbGUsIHRpdGxlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBQYXJzZSB0aGUgZ2l2ZW4gTWlkaSBmaWxlLCBhbmQgcmV0dXJuIGFuIGluc3RhbmNlIG9mIHRoaXMgTWlkaUZpbGVcbiAgICAgICAgICogY2xhc3MuICBBZnRlciByZWFkaW5nIHRoZSBtaWRpIGZpbGUsIHRoaXMgb2JqZWN0IHdpbGwgY29udGFpbjpcbiAgICAgICAgICogLSBUaGUgcmF3IGxpc3Qgb2YgbWlkaSBldmVudHNcbiAgICAgICAgICogLSBUaGUgVGltZSBTaWduYXR1cmUgb2YgdGhlIHNvbmdcbiAgICAgICAgICogLSBBbGwgdGhlIHRyYWNrcyBpbiB0aGUgc29uZyB3aGljaCBjb250YWluIG5vdGVzLiBcbiAgICAgICAgICogLSBUaGUgbnVtYmVyLCBzdGFydHRpbWUsIGFuZCBkdXJhdGlvbiBvZiBlYWNoIG5vdGUuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyB2b2lkIHBhcnNlKE1pZGlGaWxlUmVhZGVyIGZpbGUsIHN0cmluZyBmaWxlbmFtZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0cmluZyBpZDtcclxuICAgICAgICAgICAgaW50IGxlbjtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZmlsZW5hbWUgPSBmaWxlbmFtZTtcclxuICAgICAgICAgICAgdHJhY2tzID0gbmV3IExpc3Q8TWlkaVRyYWNrPigpO1xyXG4gICAgICAgICAgICB0cmFja1BlckNoYW5uZWwgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIGlkID0gZmlsZS5SZWFkQXNjaWkoNCk7XHJcbiAgICAgICAgICAgIGlmIChpZCAhPSBcIk1UaGRcIilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1pZGlGaWxlRXhjZXB0aW9uKFwiRG9lc24ndCBzdGFydCB3aXRoIE1UaGRcIiwgMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGVuID0gZmlsZS5SZWFkSW50KCk7XHJcbiAgICAgICAgICAgIGlmIChsZW4gIT0gNilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1pZGlGaWxlRXhjZXB0aW9uKFwiQmFkIE1UaGQgaGVhZGVyXCIsIDQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRyYWNrbW9kZSA9IGZpbGUuUmVhZFNob3J0KCk7XHJcbiAgICAgICAgICAgIGludCBudW1fdHJhY2tzID0gZmlsZS5SZWFkU2hvcnQoKTtcclxuICAgICAgICAgICAgcXVhcnRlcm5vdGUgPSBmaWxlLlJlYWRTaG9ydCgpO1xyXG5cclxuICAgICAgICAgICAgZXZlbnRzID0gbmV3IExpc3Q8TWlkaUV2ZW50PltudW1fdHJhY2tzXTtcclxuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IG51bV90cmFja3M7IHRyYWNrbnVtKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50c1t0cmFja251bV0gPSBSZWFkVHJhY2soZmlsZSk7XHJcbiAgICAgICAgICAgICAgICBNaWRpVHJhY2sgdHJhY2sgPSBuZXcgTWlkaVRyYWNrKGV2ZW50c1t0cmFja251bV0sIHRyYWNrbnVtKTtcclxuICAgICAgICAgICAgICAgIGlmICh0cmFjay5Ob3Rlcy5Db3VudCA+IDAgfHwgdHJhY2suTHlyaWNzICE9IG51bGwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJhY2tzLkFkZCh0cmFjayk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIEdldCB0aGUgbGVuZ3RoIG9mIHRoZSBzb25nIGluIHB1bHNlcyAqL1xyXG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBNaWRpTm90ZSBsYXN0ID0gdHJhY2suTm90ZXNbdHJhY2suTm90ZXMuQ291bnQgLSAxXTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnRvdGFscHVsc2VzIDwgbGFzdC5TdGFydFRpbWUgKyBsYXN0LkR1cmF0aW9uKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG90YWxwdWxzZXMgPSBsYXN0LlN0YXJ0VGltZSArIGxhc3QuRHVyYXRpb247XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIElmIHdlIG9ubHkgaGF2ZSBvbmUgdHJhY2sgd2l0aCBtdWx0aXBsZSBjaGFubmVscywgdGhlbiB0cmVhdFxyXG4gICAgICAgICAgICAgKiBlYWNoIGNoYW5uZWwgYXMgYSBzZXBhcmF0ZSB0cmFjay5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGlmICh0cmFja3MuQ291bnQgPT0gMSAmJiBIYXNNdWx0aXBsZUNoYW5uZWxzKHRyYWNrc1swXSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRyYWNrcyA9IFNwbGl0Q2hhbm5lbHModHJhY2tzWzBdLCBldmVudHNbdHJhY2tzWzBdLk51bWJlcl0pO1xyXG4gICAgICAgICAgICAgICAgdHJhY2tQZXJDaGFubmVsID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgQ2hlY2tTdGFydFRpbWVzKHRyYWNrcyk7XHJcblxyXG4gICAgICAgICAgICAvKiBEZXRlcm1pbmUgdGhlIHRpbWUgc2lnbmF0dXJlICovXHJcbiAgICAgICAgICAgIGludCB0ZW1wbyA9IDA7XHJcbiAgICAgICAgICAgIGludCBudW1lciA9IDA7XHJcbiAgICAgICAgICAgIGludCBkZW5vbSA9IDA7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKExpc3Q8TWlkaUV2ZW50PiBsaXN0IGluIGV2ZW50cylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTWlkaUV2ZW50IG1ldmVudCBpbiBsaXN0KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXZlbnQuTWV0YWV2ZW50ID09IE1ldGFFdmVudFRlbXBvICYmIHRlbXBvID09IDApXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbyA9IG1ldmVudC5UZW1wbztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1ldmVudC5NZXRhZXZlbnQgPT0gTWV0YUV2ZW50VGltZVNpZ25hdHVyZSAmJiBudW1lciA9PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbnVtZXIgPSBtZXZlbnQuTnVtZXJhdG9yO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZW5vbSA9IG1ldmVudC5EZW5vbWluYXRvcjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRlbXBvID09IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRlbXBvID0gNTAwMDAwOyAvKiA1MDAsMDAwIG1pY3Jvc2Vjb25kcyA9IDAuMDUgc2VjICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG51bWVyID09IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG51bWVyID0gNDsgZGVub20gPSA0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRpbWVzaWcgPSBuZXcgVGltZVNpZ25hdHVyZShudW1lciwgZGVub20sIHF1YXJ0ZXJub3RlLCB0ZW1wbyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogUGFyc2UgYSBzaW5nbGUgTWlkaSB0cmFjayBpbnRvIGEgbGlzdCBvZiBNaWRpRXZlbnRzLlxuICAgICAgICAgKiBFbnRlcmluZyB0aGlzIGZ1bmN0aW9uLCB0aGUgZmlsZSBvZmZzZXQgc2hvdWxkIGJlIGF0IHRoZSBzdGFydCBvZlxuICAgICAgICAgKiB0aGUgTVRyayBoZWFkZXIuICBVcG9uIGV4aXRpbmcsIHRoZSBmaWxlIG9mZnNldCBzaG91bGQgYmUgYXQgdGhlXG4gICAgICAgICAqIHN0YXJ0IG9mIHRoZSBuZXh0IE1UcmsgaGVhZGVyLlxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIExpc3Q8TWlkaUV2ZW50PiBSZWFkVHJhY2soTWlkaUZpbGVSZWFkZXIgZmlsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIExpc3Q8TWlkaUV2ZW50PiByZXN1bHQgPSBuZXcgTGlzdDxNaWRpRXZlbnQ+KDIwKTtcclxuICAgICAgICAgICAgaW50IHN0YXJ0dGltZSA9IDA7XHJcbiAgICAgICAgICAgIHN0cmluZyBpZCA9IGZpbGUuUmVhZEFzY2lpKDQpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlkICE9IFwiTVRya1wiKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXCJCYWQgTVRyayBoZWFkZXJcIiwgZmlsZS5HZXRPZmZzZXQoKSAtIDQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGludCB0cmFja2xlbiA9IGZpbGUuUmVhZEludCgpO1xyXG4gICAgICAgICAgICBpbnQgdHJhY2tlbmQgPSB0cmFja2xlbiArIGZpbGUuR2V0T2Zmc2V0KCk7XHJcblxyXG4gICAgICAgICAgICBpbnQgZXZlbnRmbGFnID0gMDtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlIChmaWxlLkdldE9mZnNldCgpIDwgdHJhY2tlbmQpXHJcbiAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgbWlkaSBmaWxlIGlzIHRydW5jYXRlZCBoZXJlLCB3ZSBjYW4gc3RpbGwgcmVjb3Zlci5cclxuICAgICAgICAgICAgICAgIC8vIEp1c3QgcmV0dXJuIHdoYXQgd2UndmUgcGFyc2VkIHNvIGZhci5cclxuXHJcbiAgICAgICAgICAgICAgICBpbnQgc3RhcnRvZmZzZXQsIGRlbHRhdGltZTtcclxuICAgICAgICAgICAgICAgIGJ5dGUgcGVla2V2ZW50O1xyXG4gICAgICAgICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRvZmZzZXQgPSBmaWxlLkdldE9mZnNldCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbHRhdGltZSA9IGZpbGUuUmVhZFZhcmxlbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0dGltZSArPSBkZWx0YXRpbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgcGVla2V2ZW50ID0gZmlsZS5QZWVrKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCAoTWlkaUZpbGVFeGNlcHRpb24gZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIE1pZGlFdmVudCBtZXZlbnQgPSBuZXcgTWlkaUV2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQuQWRkKG1ldmVudCk7XHJcbiAgICAgICAgICAgICAgICBtZXZlbnQuRGVsdGFUaW1lID0gZGVsdGF0aW1lO1xyXG4gICAgICAgICAgICAgICAgbWV2ZW50LlN0YXJ0VGltZSA9IHN0YXJ0dGltZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocGVla2V2ZW50ID49IEV2ZW50Tm90ZU9mZilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuSGFzRXZlbnRmbGFnID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBldmVudGZsYWcgPSBmaWxlLlJlYWRCeXRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ29uc29sZS5Xcml0ZUxpbmUoXCJvZmZzZXQgezB9OiBldmVudCB7MX0gezJ9IHN0YXJ0IHszfSBkZWx0YSB7NH1cIiwgXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICBzdGFydG9mZnNldCwgZXZlbnRmbGFnLCBFdmVudE5hbWUoZXZlbnRmbGFnKSwgXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICBzdGFydHRpbWUsIG1ldmVudC5EZWx0YVRpbWUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChldmVudGZsYWcgPj0gRXZlbnROb3RlT24gJiYgZXZlbnRmbGFnIDwgRXZlbnROb3RlT24gKyAxNilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gRXZlbnROb3RlT247XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkNoYW5uZWwgPSAoYnl0ZSkoZXZlbnRmbGFnIC0gRXZlbnROb3RlT24pO1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5Ob3RlbnVtYmVyID0gZmlsZS5SZWFkQnl0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5WZWxvY2l0eSA9IGZpbGUuUmVhZEJ5dGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGV2ZW50ZmxhZyA+PSBFdmVudE5vdGVPZmYgJiYgZXZlbnRmbGFnIDwgRXZlbnROb3RlT2ZmICsgMTYpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IEV2ZW50Tm90ZU9mZjtcclxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuQ2hhbm5lbCA9IChieXRlKShldmVudGZsYWcgLSBFdmVudE5vdGVPZmYpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5Ob3RlbnVtYmVyID0gZmlsZS5SZWFkQnl0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5WZWxvY2l0eSA9IGZpbGUuUmVhZEJ5dGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGV2ZW50ZmxhZyA+PSBFdmVudEtleVByZXNzdXJlICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBldmVudGZsYWcgPCBFdmVudEtleVByZXNzdXJlICsgMTYpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IEV2ZW50S2V5UHJlc3N1cmU7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkNoYW5uZWwgPSAoYnl0ZSkoZXZlbnRmbGFnIC0gRXZlbnRLZXlQcmVzc3VyZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50Lk5vdGVudW1iZXIgPSBmaWxlLlJlYWRCeXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LktleVByZXNzdXJlID0gZmlsZS5SZWFkQnl0ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZXZlbnRmbGFnID49IEV2ZW50Q29udHJvbENoYW5nZSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRmbGFnIDwgRXZlbnRDb250cm9sQ2hhbmdlICsgMTYpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IEV2ZW50Q29udHJvbENoYW5nZTtcclxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuQ2hhbm5lbCA9IChieXRlKShldmVudGZsYWcgLSBFdmVudENvbnRyb2xDaGFuZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5Db250cm9sTnVtID0gZmlsZS5SZWFkQnl0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5Db250cm9sVmFsdWUgPSBmaWxlLlJlYWRCeXRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChldmVudGZsYWcgPj0gRXZlbnRQcm9ncmFtQ2hhbmdlICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBldmVudGZsYWcgPCBFdmVudFByb2dyYW1DaGFuZ2UgKyAxNilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gRXZlbnRQcm9ncmFtQ2hhbmdlO1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5DaGFubmVsID0gKGJ5dGUpKGV2ZW50ZmxhZyAtIEV2ZW50UHJvZ3JhbUNoYW5nZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50Lkluc3RydW1lbnQgPSBmaWxlLlJlYWRCeXRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChldmVudGZsYWcgPj0gRXZlbnRDaGFubmVsUHJlc3N1cmUgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50ZmxhZyA8IEV2ZW50Q2hhbm5lbFByZXNzdXJlICsgMTYpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IEV2ZW50Q2hhbm5lbFByZXNzdXJlO1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5DaGFubmVsID0gKGJ5dGUpKGV2ZW50ZmxhZyAtIEV2ZW50Q2hhbm5lbFByZXNzdXJlKTtcclxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuQ2hhblByZXNzdXJlID0gZmlsZS5SZWFkQnl0ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZXZlbnRmbGFnID49IEV2ZW50UGl0Y2hCZW5kICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBldmVudGZsYWcgPCBFdmVudFBpdGNoQmVuZCArIDE2KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPSBFdmVudFBpdGNoQmVuZDtcclxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuQ2hhbm5lbCA9IChieXRlKShldmVudGZsYWcgLSBFdmVudFBpdGNoQmVuZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LlBpdGNoQmVuZCA9IGZpbGUuUmVhZFNob3J0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChldmVudGZsYWcgPT0gU3lzZXhFdmVudDEpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IFN5c2V4RXZlbnQxO1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5NZXRhbGVuZ3RoID0gZmlsZS5SZWFkVmFybGVuKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LlZhbHVlID0gZmlsZS5SZWFkQnl0ZXMobWV2ZW50Lk1ldGFsZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZXZlbnRmbGFnID09IFN5c2V4RXZlbnQyKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPSBTeXNleEV2ZW50MjtcclxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuTWV0YWxlbmd0aCA9IGZpbGUuUmVhZFZhcmxlbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5WYWx1ZSA9IGZpbGUuUmVhZEJ5dGVzKG1ldmVudC5NZXRhbGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGV2ZW50ZmxhZyA9PSBNZXRhRXZlbnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkV2ZW50RmxhZyA9IE1ldGFFdmVudDtcclxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuTWV0YWV2ZW50ID0gZmlsZS5SZWFkQnl0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5NZXRhbGVuZ3RoID0gZmlsZS5SZWFkVmFybGVuKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50LlZhbHVlID0gZmlsZS5SZWFkQnl0ZXMobWV2ZW50Lk1ldGFsZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXZlbnQuTWV0YWV2ZW50ID09IE1ldGFFdmVudFRpbWVTaWduYXR1cmUpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWV2ZW50Lk1ldGFsZW5ndGggPCAyKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgXCJNZXRhIEV2ZW50IFRpbWUgU2lnbmF0dXJlIGxlbiA9PSBcIiArIG1ldmVudC5NZXRhbGVuZ3RoICArIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gIFwiICE9IDRcIiwgZmlsZS5HZXRPZmZzZXQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuTnVtZXJhdG9yID0gKGJ5dGUpMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5EZW5vbWluYXRvciA9IChieXRlKTQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50Lk1ldGFsZW5ndGggPj0gMiAmJiBtZXZlbnQuTWV0YWxlbmd0aCA8IDQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5OdW1lcmF0b3IgPSAoYnl0ZSltZXZlbnQuVmFsdWVbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRGVub21pbmF0b3IgPSAoYnl0ZSlTeXN0ZW0uTWF0aC5Qb3coMiwgbWV2ZW50LlZhbHVlWzFdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5OdW1lcmF0b3IgPSAoYnl0ZSltZXZlbnQuVmFsdWVbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRGVub21pbmF0b3IgPSAoYnl0ZSlTeXN0ZW0uTWF0aC5Qb3coMiwgbWV2ZW50LlZhbHVlWzFdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuTWV0YWV2ZW50ID09IE1ldGFFdmVudFRlbXBvKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1ldmVudC5NZXRhbGVuZ3RoICE9IDMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBNaWRpRmlsZUV4Y2VwdGlvbihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJNZXRhIEV2ZW50IFRlbXBvIGxlbiA9PSBcIiArIG1ldmVudC5NZXRhbGVuZ3RoICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgIT0gM1wiLCBmaWxlLkdldE9mZnNldCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuVGVtcG8gPSAoKG1ldmVudC5WYWx1ZVswXSA8PCAxNikgfCAobWV2ZW50LlZhbHVlWzFdIDw8IDgpIHwgbWV2ZW50LlZhbHVlWzJdKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50Lk1ldGFldmVudCA9PSBNZXRhRXZlbnRFbmRPZlRyYWNrKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLyogYnJlYWs7ICAqL1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXCJVbmtub3duIGV2ZW50IFwiICsgbWV2ZW50LkV2ZW50RmxhZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuR2V0T2Zmc2V0KCkgLSAxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGlzIHRyYWNrIGNvbnRhaW5zIG11bHRpcGxlIGNoYW5uZWxzLlxuICAgICAgICAgKiBJZiBhIE1pZGlGaWxlIGNvbnRhaW5zIG9ubHkgb25lIHRyYWNrLCBhbmQgaXQgaGFzIG11bHRpcGxlIGNoYW5uZWxzLFxuICAgICAgICAgKiB0aGVuIHdlIHRyZWF0IGVhY2ggY2hhbm5lbCBhcyBhIHNlcGFyYXRlIHRyYWNrLlxuICAgICAgICAgKi9cclxuICAgICAgICBzdGF0aWMgYm9vbCBIYXNNdWx0aXBsZUNoYW5uZWxzKE1pZGlUcmFjayB0cmFjaylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGludCBjaGFubmVsID0gdHJhY2suTm90ZXNbMF0uQ2hhbm5lbDtcclxuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiB0cmFjay5Ob3RlcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vdGUuQ2hhbm5lbCAhPSBjaGFubmVsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBXcml0ZSBhIHZhcmlhYmxlIGxlbmd0aCBudW1iZXIgdG8gdGhlIGJ1ZmZlciBhdCB0aGUgZ2l2ZW4gb2Zmc2V0LlxuICAgICAgICAgKiBSZXR1cm4gdGhlIG51bWJlciBvZiBieXRlcyB3cml0dGVuLlxuICAgICAgICAgKi9cclxuICAgICAgICBzdGF0aWMgaW50IFZhcmxlblRvQnl0ZXMoaW50IG51bSwgYnl0ZVtdIGJ1ZiwgaW50IG9mZnNldClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGJ5dGUgYjEgPSAoYnl0ZSkoKG51bSA+PiAyMSkgJiAweDdGKTtcclxuICAgICAgICAgICAgYnl0ZSBiMiA9IChieXRlKSgobnVtID4+IDE0KSAmIDB4N0YpO1xyXG4gICAgICAgICAgICBieXRlIGIzID0gKGJ5dGUpKChudW0gPj4gNykgJiAweDdGKTtcclxuICAgICAgICAgICAgYnl0ZSBiNCA9IChieXRlKShudW0gJiAweDdGKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChiMSA+IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGJ1ZltvZmZzZXRdID0gKGJ5dGUpKGIxIHwgMHg4MCk7XHJcbiAgICAgICAgICAgICAgICBidWZbb2Zmc2V0ICsgMV0gPSAoYnl0ZSkoYjIgfCAweDgwKTtcclxuICAgICAgICAgICAgICAgIGJ1ZltvZmZzZXQgKyAyXSA9IChieXRlKShiMyB8IDB4ODApO1xyXG4gICAgICAgICAgICAgICAgYnVmW29mZnNldCArIDNdID0gYjQ7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gNDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChiMiA+IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGJ1ZltvZmZzZXRdID0gKGJ5dGUpKGIyIHwgMHg4MCk7XHJcbiAgICAgICAgICAgICAgICBidWZbb2Zmc2V0ICsgMV0gPSAoYnl0ZSkoYjMgfCAweDgwKTtcclxuICAgICAgICAgICAgICAgIGJ1ZltvZmZzZXQgKyAyXSA9IGI0O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoYjMgPiAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBidWZbb2Zmc2V0XSA9IChieXRlKShiMyB8IDB4ODApO1xyXG4gICAgICAgICAgICAgICAgYnVmW29mZnNldCArIDFdID0gYjQ7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGJ1ZltvZmZzZXRdID0gYjQ7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFdyaXRlIGEgNC1ieXRlIGludGVnZXIgdG8gZGF0YVtvZmZzZXQgOiBvZmZzZXQrNF0gKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIEludFRvQnl0ZXMoaW50IHZhbHVlLCBieXRlW10gZGF0YSwgaW50IG9mZnNldClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGRhdGFbb2Zmc2V0XSA9IChieXRlKSgodmFsdWUgPj4gMjQpICYgMHhGRik7XHJcbiAgICAgICAgICAgIGRhdGFbb2Zmc2V0ICsgMV0gPSAoYnl0ZSkoKHZhbHVlID4+IDE2KSAmIDB4RkYpO1xyXG4gICAgICAgICAgICBkYXRhW29mZnNldCArIDJdID0gKGJ5dGUpKCh2YWx1ZSA+PiA4KSAmIDB4RkYpO1xyXG4gICAgICAgICAgICBkYXRhW29mZnNldCArIDNdID0gKGJ5dGUpKHZhbHVlICYgMHhGRik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogQ2FsY3VsYXRlIHRoZSB0cmFjayBsZW5ndGggKGluIGJ5dGVzKSBnaXZlbiBhIGxpc3Qgb2YgTWlkaSBldmVudHMgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBpbnQgR2V0VHJhY2tMZW5ndGgoTGlzdDxNaWRpRXZlbnQ+IGV2ZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGludCBsZW4gPSAwO1xyXG4gICAgICAgICAgICBieXRlW10gYnVmID0gbmV3IGJ5dGVbMTAyNF07XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBtZXZlbnQgaW4gZXZlbnRzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZW4gKz0gVmFybGVuVG9CeXRlcyhtZXZlbnQuRGVsdGFUaW1lLCBidWYsIDApO1xyXG4gICAgICAgICAgICAgICAgbGVuICs9IDE7ICAvKiBmb3IgZXZlbnRmbGFnICovXHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKG1ldmVudC5FdmVudEZsYWcpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBFdmVudE5vdGVPbjogbGVuICs9IDI7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgRXZlbnROb3RlT2ZmOiBsZW4gKz0gMjsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBFdmVudEtleVByZXNzdXJlOiBsZW4gKz0gMjsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBFdmVudENvbnRyb2xDaGFuZ2U6IGxlbiArPSAyOyBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIEV2ZW50UHJvZ3JhbUNoYW5nZTogbGVuICs9IDE7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgRXZlbnRDaGFubmVsUHJlc3N1cmU6IGxlbiArPSAxOyBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIEV2ZW50UGl0Y2hCZW5kOiBsZW4gKz0gMjsgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgU3lzZXhFdmVudDE6XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBTeXNleEV2ZW50MjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGVuICs9IFZhcmxlblRvQnl0ZXMobWV2ZW50Lk1ldGFsZW5ndGgsIGJ1ZiwgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbiArPSBtZXZlbnQuTWV0YWxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBNZXRhRXZlbnQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbiArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZW4gKz0gVmFybGVuVG9CeXRlcyhtZXZlbnQuTWV0YWxlbmd0aCwgYnVmLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGVuICs9IG1ldmVudC5NZXRhbGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbGVuO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBXcml0ZSB0aGUgZ2l2ZW4gbGlzdCBvZiBNaWRpIGV2ZW50cyB0byBhIHN0cmVhbS9maWxlLlxuICAgICAgICAgKiAgVGhpcyBtZXRob2QgaXMgdXNlZCBmb3Igc291bmQgcGxheWJhY2ssIGZvciBjcmVhdGluZyBuZXcgTWlkaSBmaWxlc1xuICAgICAgICAgKiAgd2l0aCB0aGUgdGVtcG8sIHRyYW5zcG9zZSwgZXRjIGNoYW5nZWQuXG4gICAgICAgICAqXG4gICAgICAgICAqICBSZXR1cm4gdHJ1ZSBvbiBzdWNjZXNzLCBhbmQgZmFsc2Ugb24gZXJyb3IuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGJvb2xcclxuICAgICAgICBXcml0ZUV2ZW50cyhTdHJlYW0gZmlsZSwgTGlzdDxNaWRpRXZlbnQ+W10gZXZlbnRzLCBpbnQgdHJhY2ttb2RlLCBpbnQgcXVhcnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRyeVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBieXRlW10gYnVmID0gbmV3IGJ5dGVbNjU1MzZdO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qIFdyaXRlIHRoZSBNVGhkLCBsZW4gPSA2LCB0cmFjayBtb2RlLCBudW1iZXIgdHJhY2tzLCBxdWFydGVyIG5vdGUgKi9cclxuICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoQVNDSUlFbmNvZGluZy5BU0NJSS5HZXRCeXRlcyhcIk1UaGRcIiksIDAsIDQpO1xyXG4gICAgICAgICAgICAgICAgSW50VG9CeXRlcyg2LCBidWYsIDApO1xyXG4gICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDQpO1xyXG4gICAgICAgICAgICAgICAgYnVmWzBdID0gKGJ5dGUpKHRyYWNrbW9kZSA+PiA4KTtcclxuICAgICAgICAgICAgICAgIGJ1ZlsxXSA9IChieXRlKSh0cmFja21vZGUgJiAweEZGKTtcclxuICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCAyKTtcclxuICAgICAgICAgICAgICAgIGJ1ZlswXSA9IDA7XHJcbiAgICAgICAgICAgICAgICBidWZbMV0gPSAoYnl0ZSlldmVudHMuTGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDIpO1xyXG4gICAgICAgICAgICAgICAgYnVmWzBdID0gKGJ5dGUpKHF1YXJ0ZXIgPj4gOCk7XHJcbiAgICAgICAgICAgICAgICBidWZbMV0gPSAoYnl0ZSkocXVhcnRlciAmIDB4RkYpO1xyXG4gICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDIpO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKExpc3Q8TWlkaUV2ZW50PiBsaXN0IGluIGV2ZW50cylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBXcml0ZSB0aGUgTVRyayBoZWFkZXIgYW5kIHRyYWNrIGxlbmd0aCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoQVNDSUlFbmNvZGluZy5BU0NJSS5HZXRCeXRlcyhcIk1UcmtcIiksIDAsIDQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBsZW4gPSBHZXRUcmFja0xlbmd0aChsaXN0KTtcclxuICAgICAgICAgICAgICAgICAgICBJbnRUb0J5dGVzKGxlbiwgYnVmLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgNCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBtZXZlbnQgaW4gbGlzdClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGludCB2YXJsZW4gPSBWYXJsZW5Ub0J5dGVzKG1ldmVudC5EZWx0YVRpbWUsIGJ1ZiwgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCB2YXJsZW4pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gU3lzZXhFdmVudDEgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPT0gU3lzZXhFdmVudDIgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPT0gTWV0YUV2ZW50KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWZbMF0gPSBtZXZlbnQuRXZlbnRGbGFnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gKGJ5dGUpKG1ldmVudC5FdmVudEZsYWcgKyBtZXZlbnQuQ2hhbm5lbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDEpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnROb3RlT24pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IG1ldmVudC5Ob3RlbnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzFdID0gbWV2ZW50LlZlbG9jaXR5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnROb3RlT2ZmKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWZbMF0gPSBtZXZlbnQuTm90ZW51bWJlcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlsxXSA9IG1ldmVudC5WZWxvY2l0eTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCAyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IEV2ZW50S2V5UHJlc3N1cmUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IG1ldmVudC5Ob3RlbnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzFdID0gbWV2ZW50LktleVByZXNzdXJlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnRDb250cm9sQ2hhbmdlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWZbMF0gPSBtZXZlbnQuQ29udHJvbE51bTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlsxXSA9IG1ldmVudC5Db250cm9sVmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgMik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudFByb2dyYW1DaGFuZ2UpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IG1ldmVudC5JbnN0cnVtZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnRDaGFubmVsUHJlc3N1cmUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IG1ldmVudC5DaGFuUHJlc3N1cmU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBFdmVudFBpdGNoQmVuZClcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gKGJ5dGUpKG1ldmVudC5QaXRjaEJlbmQgPj4gOCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWZbMV0gPSAoYnl0ZSkobWV2ZW50LlBpdGNoQmVuZCAmIDB4RkYpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gU3lzZXhFdmVudDEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludCBvZmZzZXQgPSBWYXJsZW5Ub0J5dGVzKG1ldmVudC5NZXRhbGVuZ3RoLCBidWYsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQXJyYXkuQ29weShtZXZlbnQuVmFsdWUsIDAsIGJ1Ziwgb2Zmc2V0LCBtZXZlbnQuVmFsdWUuTGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuV3JpdGUoYnVmLCAwLCBvZmZzZXQgKyBtZXZlbnQuVmFsdWUuTGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXZlbnQuRXZlbnRGbGFnID09IFN5c2V4RXZlbnQyKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnQgb2Zmc2V0ID0gVmFybGVuVG9CeXRlcyhtZXZlbnQuTWV0YWxlbmd0aCwgYnVmLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LkNvcHkobWV2ZW50LlZhbHVlLCAwLCBidWYsIG9mZnNldCwgbWV2ZW50LlZhbHVlLkxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgb2Zmc2V0ICsgbWV2ZW50LlZhbHVlLkxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBNZXRhRXZlbnQgJiYgbWV2ZW50Lk1ldGFldmVudCA9PSBNZXRhRXZlbnRUZW1wbylcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmWzBdID0gbWV2ZW50Lk1ldGFldmVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlsxXSA9IDM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWZbMl0gPSAoYnl0ZSkoKG1ldmVudC5UZW1wbyA+PiAxNikgJiAweEZGKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlszXSA9IChieXRlKSgobWV2ZW50LlRlbXBvID4+IDgpICYgMHhGRik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWZbNF0gPSAoYnl0ZSkobWV2ZW50LlRlbXBvICYgMHhGRik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLldyaXRlKGJ1ZiwgMCwgNSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBNZXRhRXZlbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZlswXSA9IG1ldmVudC5NZXRhZXZlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnQgb2Zmc2V0ID0gVmFybGVuVG9CeXRlcyhtZXZlbnQuTWV0YWxlbmd0aCwgYnVmLCAxKSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBBcnJheS5Db3B5KG1ldmVudC5WYWx1ZSwgMCwgYnVmLCBvZmZzZXQsIG1ldmVudC5WYWx1ZS5MZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5Xcml0ZShidWYsIDAsIG9mZnNldCArIG1ldmVudC5WYWx1ZS5MZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZmlsZS5DbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKElPRXhjZXB0aW9uIGUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBDbG9uZSB0aGUgbGlzdCBvZiBNaWRpRXZlbnRzICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgTGlzdDxNaWRpRXZlbnQ+W10gQ2xvbmVNaWRpRXZlbnRzKExpc3Q8TWlkaUV2ZW50PltdIG9yaWdsaXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgTGlzdDxNaWRpRXZlbnQ+W10gbmV3bGlzdCA9IG5ldyBMaXN0PE1pZGlFdmVudD5bb3JpZ2xpc3QuTGVuZ3RoXTtcclxuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IG9yaWdsaXN0Lkxlbmd0aDsgdHJhY2tudW0rKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTGlzdDxNaWRpRXZlbnQ+IG9yaWdldmVudHMgPSBvcmlnbGlzdFt0cmFja251bV07XHJcbiAgICAgICAgICAgICAgICBMaXN0PE1pZGlFdmVudD4gbmV3ZXZlbnRzID0gbmV3IExpc3Q8TWlkaUV2ZW50PihvcmlnZXZlbnRzLkNvdW50KTtcclxuICAgICAgICAgICAgICAgIG5ld2xpc3RbdHJhY2tudW1dID0gbmV3ZXZlbnRzO1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTWlkaUV2ZW50IG1ldmVudCBpbiBvcmlnZXZlbnRzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld2V2ZW50cy5BZGQobWV2ZW50LkNsb25lKCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBuZXdsaXN0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIENyZWF0ZSBhIG5ldyBNaWRpIHRlbXBvIGV2ZW50LCB3aXRoIHRoZSBnaXZlbiB0ZW1wbyAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBNaWRpRXZlbnQgQ3JlYXRlVGVtcG9FdmVudChpbnQgdGVtcG8pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBNaWRpRXZlbnQgbWV2ZW50ID0gbmV3IE1pZGlFdmVudCgpO1xyXG4gICAgICAgICAgICBtZXZlbnQuRGVsdGFUaW1lID0gMDtcclxuICAgICAgICAgICAgbWV2ZW50LlN0YXJ0VGltZSA9IDA7XHJcbiAgICAgICAgICAgIG1ldmVudC5IYXNFdmVudGZsYWcgPSB0cnVlO1xyXG4gICAgICAgICAgICBtZXZlbnQuRXZlbnRGbGFnID0gTWV0YUV2ZW50O1xyXG4gICAgICAgICAgICBtZXZlbnQuTWV0YWV2ZW50ID0gTWV0YUV2ZW50VGVtcG87XHJcbiAgICAgICAgICAgIG1ldmVudC5NZXRhbGVuZ3RoID0gMztcclxuICAgICAgICAgICAgbWV2ZW50LlRlbXBvID0gdGVtcG87XHJcbiAgICAgICAgICAgIHJldHVybiBtZXZlbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIFNlYXJjaCB0aGUgZXZlbnRzIGZvciBhIENvbnRyb2xDaGFuZ2UgZXZlbnQgd2l0aCB0aGUgc2FtZVxuICAgICAgICAgKiAgY2hhbm5lbCBhbmQgY29udHJvbCBudW1iZXIuICBJZiBhIG1hdGNoaW5nIGV2ZW50IGlzIGZvdW5kLFxuICAgICAgICAgKiAgIHVwZGF0ZSB0aGUgY29udHJvbCB2YWx1ZS4gIEVsc2UsIGFkZCBhIG5ldyBDb250cm9sQ2hhbmdlIGV2ZW50LlxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkXHJcbiAgICAgICAgVXBkYXRlQ29udHJvbENoYW5nZShMaXN0PE1pZGlFdmVudD4gbmV3ZXZlbnRzLCBNaWRpRXZlbnQgY2hhbmdlRXZlbnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbWV2ZW50IGluIG5ld2V2ZW50cylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKChtZXZlbnQuRXZlbnRGbGFnID09IGNoYW5nZUV2ZW50LkV2ZW50RmxhZykgJiZcclxuICAgICAgICAgICAgICAgICAgICAobWV2ZW50LkNoYW5uZWwgPT0gY2hhbmdlRXZlbnQuQ2hhbm5lbCkgJiZcclxuICAgICAgICAgICAgICAgICAgICAobWV2ZW50LkNvbnRyb2xOdW0gPT0gY2hhbmdlRXZlbnQuQ29udHJvbE51bSkpXHJcbiAgICAgICAgICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5Db250cm9sVmFsdWUgPSBjaGFuZ2VFdmVudC5Db250cm9sVmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG5ld2V2ZW50cy5BZGQoY2hhbmdlRXZlbnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFN0YXJ0IHRoZSBNaWRpIG11c2ljIGF0IHRoZSBnaXZlbiBwYXVzZSB0aW1lIChpbiBwdWxzZXMpLlxuICAgICAgICAgKiAgUmVtb3ZlIGFueSBOb3RlT24vTm90ZU9mZiBldmVudHMgdGhhdCBvY2N1ciBiZWZvcmUgdGhlIHBhdXNlIHRpbWUuXG4gICAgICAgICAqICBGb3Igb3RoZXIgZXZlbnRzLCBjaGFuZ2UgdGhlIGRlbHRhLXRpbWUgdG8gMCBpZiB0aGV5IG9jY3VyXG4gICAgICAgICAqICBiZWZvcmUgdGhlIHBhdXNlIHRpbWUuICBSZXR1cm4gdGhlIG1vZGlmaWVkIE1pZGkgRXZlbnRzLlxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBMaXN0PE1pZGlFdmVudD5bXVxyXG4gICAgICAgIFN0YXJ0QXRQYXVzZVRpbWUoTGlzdDxNaWRpRXZlbnQ+W10gbGlzdCwgaW50IHBhdXNlVGltZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIExpc3Q8TWlkaUV2ZW50PltdIG5ld2xpc3QgPSBuZXcgTGlzdDxNaWRpRXZlbnQ+W2xpc3QuTGVuZ3RoXTtcclxuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IGxpc3QuTGVuZ3RoOyB0cmFja251bSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBMaXN0PE1pZGlFdmVudD4gZXZlbnRzID0gbGlzdFt0cmFja251bV07XHJcbiAgICAgICAgICAgICAgICBMaXN0PE1pZGlFdmVudD4gbmV3ZXZlbnRzID0gbmV3IExpc3Q8TWlkaUV2ZW50PihldmVudHMuQ291bnQpO1xyXG4gICAgICAgICAgICAgICAgbmV3bGlzdFt0cmFja251bV0gPSBuZXdldmVudHM7XHJcblxyXG4gICAgICAgICAgICAgICAgYm9vbCBmb3VuZEV2ZW50QWZ0ZXJQYXVzZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTWlkaUV2ZW50IG1ldmVudCBpbiBldmVudHMpXHJcbiAgICAgICAgICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXZlbnQuU3RhcnRUaW1lIDwgcGF1c2VUaW1lKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnROb3RlT24gfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnROb3RlT2ZmKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogU2tpcCBOb3RlT24vTm90ZU9mZiBldmVudCAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnRDb250cm9sQ2hhbmdlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuRGVsdGFUaW1lID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVwZGF0ZUNvbnRyb2xDaGFuZ2UobmV3ZXZlbnRzLCBtZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkRlbHRhVGltZSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdldmVudHMuQWRkKG1ldmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoIWZvdW5kRXZlbnRBZnRlclBhdXNlKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50LkRlbHRhVGltZSA9IChtZXZlbnQuU3RhcnRUaW1lIC0gcGF1c2VUaW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3ZXZlbnRzLkFkZChtZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZEV2ZW50QWZ0ZXJQYXVzZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld2V2ZW50cy5BZGQobWV2ZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG5ld2xpc3Q7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIFdyaXRlIHRoaXMgTWlkaSBmaWxlIHRvIHRoZSBnaXZlbiBmaWxlbmFtZS5cbiAgICAgICAgICogSWYgb3B0aW9ucyBpcyBub3QgbnVsbCwgYXBwbHkgdGhvc2Ugb3B0aW9ucyB0byB0aGUgbWlkaSBldmVudHNcbiAgICAgICAgICogYmVmb3JlIHBlcmZvcm1pbmcgdGhlIHdyaXRlLlxuICAgICAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgZmlsZSB3YXMgc2F2ZWQgc3VjY2Vzc2Z1bGx5LCBlbHNlIGZhbHNlLlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgYm9vbCBDaGFuZ2VTb3VuZChzdHJpbmcgZGVzdGZpbGUsIE1pZGlPcHRpb25zIG9wdGlvbnMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gV3JpdGUoZGVzdGZpbGUsIG9wdGlvbnMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGJvb2wgV3JpdGUoc3RyaW5nIGRlc3RmaWxlLCBNaWRpT3B0aW9ucyBvcHRpb25zKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIEZpbGVTdHJlYW0gc3RyZWFtO1xyXG4gICAgICAgICAgICAgICAgc3RyZWFtID0gbmV3IEZpbGVTdHJlYW0oZGVzdGZpbGUsIEZpbGVNb2RlLkNyZWF0ZSk7XHJcbiAgICAgICAgICAgICAgICBib29sIHJlc3VsdCA9IFdyaXRlKHN0cmVhbSwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICBzdHJlYW0uQ2xvc2UoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKElPRXhjZXB0aW9uIGUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFdyaXRlIHRoaXMgTWlkaSBmaWxlIHRvIHRoZSBnaXZlbiBzdHJlYW0uXG4gICAgICAgICAqIElmIG9wdGlvbnMgaXMgbm90IG51bGwsIGFwcGx5IHRob3NlIG9wdGlvbnMgdG8gdGhlIG1pZGkgZXZlbnRzXG4gICAgICAgICAqIGJlZm9yZSBwZXJmb3JtaW5nIHRoZSB3cml0ZS5cbiAgICAgICAgICogUmV0dXJuIHRydWUgaWYgdGhlIGZpbGUgd2FzIHNhdmVkIHN1Y2Nlc3NmdWxseSwgZWxzZSBmYWxzZS5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGJvb2wgV3JpdGUoU3RyZWFtIHN0cmVhbSwgTWlkaU9wdGlvbnMgb3B0aW9ucylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIExpc3Q8TWlkaUV2ZW50PltdIG5ld2V2ZW50cyA9IGV2ZW50cztcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMgIT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmV3ZXZlbnRzID0gQXBwbHlPcHRpb25zVG9FdmVudHMob3B0aW9ucyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIFdyaXRlRXZlbnRzKHN0cmVhbSwgbmV3ZXZlbnRzLCB0cmFja21vZGUsIHF1YXJ0ZXJub3RlKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiBBcHBseSB0aGUgZm9sbG93aW5nIHNvdW5kIG9wdGlvbnMgdG8gdGhlIG1pZGkgZXZlbnRzOlxyXG4gICAgICAgICAqIC0gVGhlIHRlbXBvICh0aGUgbWljcm9zZWNvbmRzIHBlciBwdWxzZSlcclxuICAgICAgICAgKiAtIFRoZSBpbnN0cnVtZW50cyBwZXIgdHJhY2tcclxuICAgICAgICAgKiAtIFRoZSBub3RlIG51bWJlciAodHJhbnNwb3NlIHZhbHVlKVxyXG4gICAgICAgICAqIC0gVGhlIHRyYWNrcyB0byBpbmNsdWRlXHJcbiAgICAgICAgICogUmV0dXJuIHRoZSBtb2RpZmllZCBsaXN0IG9mIG1pZGkgZXZlbnRzLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgTGlzdDxNaWRpRXZlbnQ+W11cclxuICAgICAgICBBcHBseU9wdGlvbnNUb0V2ZW50cyhNaWRpT3B0aW9ucyBvcHRpb25zKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW50IGk7XHJcbiAgICAgICAgICAgIGlmICh0cmFja1BlckNoYW5uZWwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBBcHBseU9wdGlvbnNQZXJDaGFubmVsKG9wdGlvbnMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvKiBBIG1pZGlmaWxlIGNhbiBjb250YWluIHRyYWNrcyB3aXRoIG5vdGVzIGFuZCB0cmFja3Mgd2l0aG91dCBub3Rlcy5cclxuICAgICAgICAgICAgICogVGhlIG9wdGlvbnMudHJhY2tzIGFuZCBvcHRpb25zLmluc3RydW1lbnRzIGFyZSBmb3IgdHJhY2tzIHdpdGggbm90ZXMuXHJcbiAgICAgICAgICAgICAqIFNvIHRoZSB0cmFjayBudW1iZXJzIGluICdvcHRpb25zJyBtYXkgbm90IG1hdGNoIGNvcnJlY3RseSBpZiB0aGVcclxuICAgICAgICAgICAgICogbWlkaSBmaWxlIGhhcyB0cmFja3Mgd2l0aG91dCBub3Rlcy4gUmUtY29tcHV0ZSB0aGUgaW5zdHJ1bWVudHMsIGFuZCBcclxuICAgICAgICAgICAgICogdHJhY2tzIHRvIGtlZXAuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBpbnQgbnVtX3RyYWNrcyA9IGV2ZW50cy5MZW5ndGg7XHJcbiAgICAgICAgICAgIGludFtdIGluc3RydW1lbnRzID0gbmV3IGludFtudW1fdHJhY2tzXTtcclxuICAgICAgICAgICAgYm9vbFtdIGtlZXB0cmFja3MgPSBuZXcgYm9vbFtudW1fdHJhY2tzXTtcclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IG51bV90cmFja3M7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW5zdHJ1bWVudHNbaV0gPSAwO1xyXG4gICAgICAgICAgICAgICAga2VlcHRyYWNrc1tpXSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IHRyYWNrcy5Db3VudDsgdHJhY2tudW0rKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTWlkaVRyYWNrIHRyYWNrID0gdHJhY2tzW3RyYWNrbnVtXTtcclxuICAgICAgICAgICAgICAgIGludCByZWFsdHJhY2sgPSB0cmFjay5OdW1iZXI7XHJcbiAgICAgICAgICAgICAgICBpbnN0cnVtZW50c1tyZWFsdHJhY2tdID0gb3B0aW9ucy5pbnN0cnVtZW50c1t0cmFja251bV07XHJcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5tdXRlW3RyYWNrbnVtXSA9PSB0cnVlKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGtlZXB0cmFja3NbcmVhbHRyYWNrXSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBMaXN0PE1pZGlFdmVudD5bXSBuZXdldmVudHMgPSBDbG9uZU1pZGlFdmVudHMoZXZlbnRzKTtcclxuXHJcbiAgICAgICAgICAgIC8qIFNldCB0aGUgdGVtcG8gYXQgdGhlIGJlZ2lubmluZyBvZiBlYWNoIHRyYWNrICovXHJcbiAgICAgICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCBuZXdldmVudHMuTGVuZ3RoOyB0cmFja251bSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBNaWRpRXZlbnQgbWV2ZW50ID0gQ3JlYXRlVGVtcG9FdmVudChvcHRpb25zLnRlbXBvKTtcclxuICAgICAgICAgICAgICAgIG5ld2V2ZW50c1t0cmFja251bV0uSW5zZXJ0KDAsIG1ldmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIENoYW5nZSB0aGUgbm90ZSBudW1iZXIgKHRyYW5zcG9zZSksIGluc3RydW1lbnQsIGFuZCB0ZW1wbyAqL1xyXG4gICAgICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgbmV3ZXZlbnRzLkxlbmd0aDsgdHJhY2tudW0rKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTWlkaUV2ZW50IG1ldmVudCBpbiBuZXdldmVudHNbdHJhY2tudW1dKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBudW0gPSBtZXZlbnQuTm90ZW51bWJlciArIG9wdGlvbnMudHJhbnNwb3NlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChudW0gPCAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBudW0gPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChudW0gPiAxMjcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bSA9IDEyNztcclxuICAgICAgICAgICAgICAgICAgICBtZXZlbnQuTm90ZW51bWJlciA9IChieXRlKW51bTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbnMudXNlRGVmYXVsdEluc3RydW1lbnRzKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50Lkluc3RydW1lbnQgPSAoYnl0ZSlpbnN0cnVtZW50c1t0cmFja251bV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5UZW1wbyA9IG9wdGlvbnMudGVtcG87XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnBhdXNlVGltZSAhPSAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBuZXdldmVudHMgPSBTdGFydEF0UGF1c2VUaW1lKG5ld2V2ZW50cywgb3B0aW9ucy5wYXVzZVRpbWUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvKiBDaGFuZ2UgdGhlIHRyYWNrcyB0byBpbmNsdWRlICovXHJcbiAgICAgICAgICAgIGludCBjb3VudCA9IDA7XHJcbiAgICAgICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCBrZWVwdHJhY2tzLkxlbmd0aDsgdHJhY2tudW0rKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGtlZXB0cmFja3NbdHJhY2tudW1dKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgTGlzdDxNaWRpRXZlbnQ+W10gcmVzdWx0ID0gbmV3IExpc3Q8TWlkaUV2ZW50Pltjb3VudF07XHJcbiAgICAgICAgICAgIGkgPSAwO1xyXG4gICAgICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwga2VlcHRyYWNrcy5MZW5ndGg7IHRyYWNrbnVtKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChrZWVwdHJhY2tzW3RyYWNrbnVtXSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRbaV0gPSBuZXdldmVudHNbdHJhY2tudW1dO1xyXG4gICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyogQXBwbHkgdGhlIGZvbGxvd2luZyBzb3VuZCBvcHRpb25zIHRvIHRoZSBtaWRpIGV2ZW50czpcclxuICAgICAgICAgKiAtIFRoZSB0ZW1wbyAodGhlIG1pY3Jvc2Vjb25kcyBwZXIgcHVsc2UpXHJcbiAgICAgICAgICogLSBUaGUgaW5zdHJ1bWVudHMgcGVyIHRyYWNrXHJcbiAgICAgICAgICogLSBUaGUgbm90ZSBudW1iZXIgKHRyYW5zcG9zZSB2YWx1ZSlcclxuICAgICAgICAgKiAtIFRoZSB0cmFja3MgdG8gaW5jbHVkZVxyXG4gICAgICAgICAqIFJldHVybiB0aGUgbW9kaWZpZWQgbGlzdCBvZiBtaWRpIGV2ZW50cy5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFRoaXMgTWlkaSBmaWxlIG9ubHkgaGFzIG9uZSBhY3R1YWwgdHJhY2ssIGJ1dCB3ZSd2ZSBzcGxpdCB0aGF0XHJcbiAgICAgICAgICogaW50byBtdWx0aXBsZSBmYWtlIHRyYWNrcywgb25lIHBlciBjaGFubmVsLCBhbmQgZGlzcGxheWVkIHRoYXRcclxuICAgICAgICAgKiB0byB0aGUgZW5kLXVzZXIuICBTbyBjaGFuZ2luZyB0aGUgaW5zdHJ1bWVudCwgYW5kIHRyYWNrcyB0b1xyXG4gICAgICAgICAqIGluY2x1ZGUsIGlzIGltcGxlbWVudGVkIGRpZmZlcmVudGx5IHRoYW4gQXBwbHlPcHRpb25zVG9FdmVudHMoKS5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIC0gV2UgY2hhbmdlIHRoZSBpbnN0cnVtZW50IGJhc2VkIG9uIHRoZSBjaGFubmVsLCBub3QgdGhlIHRyYWNrLlxyXG4gICAgICAgICAqIC0gV2UgaW5jbHVkZS9leGNsdWRlIGNoYW5uZWxzLCBub3QgdHJhY2tzLlxyXG4gICAgICAgICAqIC0gV2UgZXhjbHVkZSBhIGNoYW5uZWwgYnkgc2V0dGluZyB0aGUgbm90ZSB2b2x1bWUvdmVsb2NpdHkgdG8gMC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIExpc3Q8TWlkaUV2ZW50PltdXHJcbiAgICAgICAgQXBwbHlPcHRpb25zUGVyQ2hhbm5lbChNaWRpT3B0aW9ucyBvcHRpb25zKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLyogRGV0ZXJtaW5lIHdoaWNoIGNoYW5uZWxzIHRvIGluY2x1ZGUvZXhjbHVkZS5cclxuICAgICAgICAgICAgICogQWxzbywgZGV0ZXJtaW5lIHRoZSBpbnN0cnVtZW50cyBmb3IgZWFjaCBjaGFubmVsLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgaW50W10gaW5zdHJ1bWVudHMgPSBuZXcgaW50WzE2XTtcclxuICAgICAgICAgICAgYm9vbFtdIGtlZXBjaGFubmVsID0gbmV3IGJvb2xbMTZdO1xyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDE2OyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGluc3RydW1lbnRzW2ldID0gMDtcclxuICAgICAgICAgICAgICAgIGtlZXBjaGFubmVsW2ldID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgdHJhY2tzLkNvdW50OyB0cmFja251bSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBNaWRpVHJhY2sgdHJhY2sgPSB0cmFja3NbdHJhY2tudW1dO1xyXG4gICAgICAgICAgICAgICAgaW50IGNoYW5uZWwgPSB0cmFjay5Ob3Rlc1swXS5DaGFubmVsO1xyXG4gICAgICAgICAgICAgICAgaW5zdHJ1bWVudHNbY2hhbm5lbF0gPSBvcHRpb25zLmluc3RydW1lbnRzW3RyYWNrbnVtXTtcclxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLm11dGVbdHJhY2tudW1dID09IHRydWUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAga2VlcGNoYW5uZWxbY2hhbm5lbF0gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgTGlzdDxNaWRpRXZlbnQ+W10gbmV3ZXZlbnRzID0gQ2xvbmVNaWRpRXZlbnRzKGV2ZW50cyk7XHJcblxyXG4gICAgICAgICAgICAvKiBTZXQgdGhlIHRlbXBvIGF0IHRoZSBiZWdpbm5pbmcgb2YgZWFjaCB0cmFjayAqL1xyXG4gICAgICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgbmV3ZXZlbnRzLkxlbmd0aDsgdHJhY2tudW0rKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTWlkaUV2ZW50IG1ldmVudCA9IENyZWF0ZVRlbXBvRXZlbnQob3B0aW9ucy50ZW1wbyk7XHJcbiAgICAgICAgICAgICAgICBuZXdldmVudHNbdHJhY2tudW1dLkluc2VydCgwLCBtZXZlbnQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvKiBDaGFuZ2UgdGhlIG5vdGUgbnVtYmVyICh0cmFuc3Bvc2UpLCBpbnN0cnVtZW50LCBhbmQgdGVtcG8gKi9cclxuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2tudW0gPSAwOyB0cmFja251bSA8IG5ld2V2ZW50cy5MZW5ndGg7IHRyYWNrbnVtKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBtZXZlbnQgaW4gbmV3ZXZlbnRzW3RyYWNrbnVtXSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnQgbnVtID0gbWV2ZW50Lk5vdGVudW1iZXIgKyBvcHRpb25zLnRyYW5zcG9zZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobnVtIDwgMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgbnVtID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobnVtID4gMTI3KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBudW0gPSAxMjc7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV2ZW50Lk5vdGVudW1iZXIgPSAoYnl0ZSludW07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFrZWVwY2hhbm5lbFttZXZlbnQuQ2hhbm5lbF0pXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXZlbnQuVmVsb2NpdHkgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbnMudXNlRGVmYXVsdEluc3RydW1lbnRzKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV2ZW50Lkluc3RydW1lbnQgPSAoYnl0ZSlpbnN0cnVtZW50c1ttZXZlbnQuQ2hhbm5lbF07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIG1ldmVudC5UZW1wbyA9IG9wdGlvbnMudGVtcG87XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMucGF1c2VUaW1lICE9IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG5ld2V2ZW50cyA9IFN0YXJ0QXRQYXVzZVRpbWUobmV3ZXZlbnRzLCBvcHRpb25zLnBhdXNlVGltZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG5ld2V2ZW50cztcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogQXBwbHkgdGhlIGdpdmVuIHNoZWV0IG11c2ljIG9wdGlvbnMgdG8gdGhlIE1pZGlOb3Rlcy5cbiAgICAgICAgICogIFJldHVybiB0aGUgbWlkaSB0cmFja3Mgd2l0aCB0aGUgY2hhbmdlcyBhcHBsaWVkLlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgTGlzdDxNaWRpVHJhY2s+IENoYW5nZU1pZGlOb3RlcyhNaWRpT3B0aW9ucyBvcHRpb25zKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgTGlzdDxNaWRpVHJhY2s+IG5ld3RyYWNrcyA9IG5ldyBMaXN0PE1pZGlUcmFjaz4oKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoaW50IHRyYWNrID0gMDsgdHJhY2sgPCB0cmFja3MuQ291bnQ7IHRyYWNrKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnRyYWNrc1t0cmFja10pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3dHJhY2tzLkFkZCh0cmFja3NbdHJhY2tdLkNsb25lKCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvKiBUbyBtYWtlIHRoZSBzaGVldCBtdXNpYyBsb29rIG5pY2VyLCB3ZSByb3VuZCB0aGUgc3RhcnQgdGltZXNcclxuICAgICAgICAgICAgICogc28gdGhhdCBub3RlcyBjbG9zZSB0b2dldGhlciBhcHBlYXIgYXMgYSBzaW5nbGUgY2hvcmQuICBXZVxyXG4gICAgICAgICAgICAgKiBhbHNvIGV4dGVuZCB0aGUgbm90ZSBkdXJhdGlvbnMsIHNvIHRoYXQgd2UgaGF2ZSBsb25nZXIgbm90ZXNcclxuICAgICAgICAgICAgICogYW5kIGZld2VyIHJlc3Qgc3ltYm9scy5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIFRpbWVTaWduYXR1cmUgdGltZSA9IHRpbWVzaWc7XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnRpbWUgIT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGltZSA9IG9wdGlvbnMudGltZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBNaWRpRmlsZS5Sb3VuZFN0YXJ0VGltZXMobmV3dHJhY2tzLCBvcHRpb25zLmNvbWJpbmVJbnRlcnZhbCwgdGltZXNpZyk7XHJcbiAgICAgICAgICAgIE1pZGlGaWxlLlJvdW5kRHVyYXRpb25zKG5ld3RyYWNrcywgdGltZS5RdWFydGVyKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnR3b1N0YWZmcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmV3dHJhY2tzID0gTWlkaUZpbGUuQ29tYmluZVRvVHdvVHJhY2tzKG5ld3RyYWNrcywgdGltZXNpZy5NZWFzdXJlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5zaGlmdHRpbWUgIT0gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTWlkaUZpbGUuU2hpZnRUaW1lKG5ld3RyYWNrcywgb3B0aW9ucy5zaGlmdHRpbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnRyYW5zcG9zZSAhPSAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBNaWRpRmlsZS5UcmFuc3Bvc2UobmV3dHJhY2tzLCBvcHRpb25zLnRyYW5zcG9zZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBuZXd0cmFja3M7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIFNoaWZ0IHRoZSBzdGFydHRpbWUgb2YgdGhlIG5vdGVzIGJ5IHRoZSBnaXZlbiBhbW91bnQuXG4gICAgICAgICAqIFRoaXMgaXMgdXNlZCBieSB0aGUgU2hpZnQgTm90ZXMgbWVudSB0byBzaGlmdCBub3RlcyBsZWZ0L3JpZ2h0LlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHZvaWRcclxuICAgICAgICBTaGlmdFRpbWUoTGlzdDxNaWRpVHJhY2s+IHRyYWNrcywgaW50IGFtb3VudClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG5vdGUgaW4gdHJhY2suTm90ZXMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm90ZS5TdGFydFRpbWUgKz0gYW1vdW50O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogU2hpZnQgdGhlIG5vdGUga2V5cyB1cC9kb3duIGJ5IHRoZSBnaXZlbiBhbW91bnQgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHZvaWRcclxuICAgICAgICBUcmFuc3Bvc2UoTGlzdDxNaWRpVHJhY2s+IHRyYWNrcywgaW50IGFtb3VudClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG5vdGUgaW4gdHJhY2suTm90ZXMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm90ZS5OdW1iZXIgKz0gYW1vdW50O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChub3RlLk51bWJlciA8IDApXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBub3RlLk51bWJlciA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyogRmluZCB0aGUgaGlnaGVzdCBhbmQgbG93ZXN0IG5vdGVzIHRoYXQgb3ZlcmxhcCB0aGlzIGludGVydmFsIChzdGFydHRpbWUgdG8gZW5kdGltZSkuXHJcbiAgICAgICAgICogVGhpcyBtZXRob2QgaXMgdXNlZCBieSBTcGxpdFRyYWNrIHRvIGRldGVybWluZSB3aGljaCBzdGFmZiAodG9wIG9yIGJvdHRvbSkgYSBub3RlXHJcbiAgICAgICAgICogc2hvdWxkIGdvIHRvLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogRm9yIG1vcmUgYWNjdXJhdGUgU3BsaXRUcmFjaygpIHJlc3VsdHMsIHdlIGxpbWl0IHRoZSBpbnRlcnZhbC9kdXJhdGlvbiBvZiB0aGlzIG5vdGUgXHJcbiAgICAgICAgICogKGFuZCBvdGhlciBub3RlcykgdG8gb25lIG1lYXN1cmUuIFdlIGNhcmUgb25seSBhYm91dCBoaWdoL2xvdyBub3RlcyB0aGF0IGFyZVxyXG4gICAgICAgICAqIHJlYXNvbmFibHkgY2xvc2UgdG8gdGhpcyBub3RlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWRcclxuICAgICAgICBGaW5kSGlnaExvd05vdGVzKExpc3Q8TWlkaU5vdGU+IG5vdGVzLCBpbnQgbWVhc3VyZWxlbiwgaW50IHN0YXJ0aW5kZXgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBpbnQgc3RhcnR0aW1lLCBpbnQgZW5kdGltZSwgcmVmIGludCBoaWdoLCByZWYgaW50IGxvdylcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICBpbnQgaSA9IHN0YXJ0aW5kZXg7XHJcbiAgICAgICAgICAgIGlmIChzdGFydHRpbWUgKyBtZWFzdXJlbGVuIDwgZW5kdGltZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZW5kdGltZSA9IHN0YXJ0dGltZSArIG1lYXN1cmVsZW47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHdoaWxlIChpIDwgbm90ZXMuQ291bnQgJiYgbm90ZXNbaV0uU3RhcnRUaW1lIDwgZW5kdGltZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vdGVzW2ldLkVuZFRpbWUgPCBzdGFydHRpbWUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG5vdGVzW2ldLlN0YXJ0VGltZSArIG1lYXN1cmVsZW4gPCBzdGFydHRpbWUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGhpZ2ggPCBub3Rlc1tpXS5OdW1iZXIpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaGlnaCA9IG5vdGVzW2ldLk51bWJlcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChsb3cgPiBub3Rlc1tpXS5OdW1iZXIpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG93ID0gbm90ZXNbaV0uTnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiBGaW5kIHRoZSBoaWdoZXN0IGFuZCBsb3dlc3Qgbm90ZXMgdGhhdCBzdGFydCBhdCB0aGlzIGV4YWN0IHN0YXJ0IHRpbWUgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkXHJcbiAgICAgICAgRmluZEV4YWN0SGlnaExvd05vdGVzKExpc3Q8TWlkaU5vdGU+IG5vdGVzLCBpbnQgc3RhcnRpbmRleCwgaW50IHN0YXJ0dGltZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmIGludCBoaWdoLCByZWYgaW50IGxvdylcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICBpbnQgaSA9IHN0YXJ0aW5kZXg7XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAobm90ZXNbaV0uU3RhcnRUaW1lIDwgc3RhcnR0aW1lKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHdoaWxlIChpIDwgbm90ZXMuQ291bnQgJiYgbm90ZXNbaV0uU3RhcnRUaW1lID09IHN0YXJ0dGltZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGhpZ2ggPCBub3Rlc1tpXS5OdW1iZXIpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaGlnaCA9IG5vdGVzW2ldLk51bWJlcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChsb3cgPiBub3Rlc1tpXS5OdW1iZXIpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG93ID0gbm90ZXNbaV0uTnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuXHJcblxyXG4gICAgICAgIC8qIFNwbGl0IHRoZSBnaXZlbiBNaWRpVHJhY2sgaW50byB0d28gdHJhY2tzLCB0b3AgYW5kIGJvdHRvbS5cclxuICAgICAgICAgKiBUaGUgaGlnaGVzdCBub3RlcyB3aWxsIGdvIGludG8gdG9wLCB0aGUgbG93ZXN0IGludG8gYm90dG9tLlxyXG4gICAgICAgICAqIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBzcGxpdCBwaWFubyBzb25ncyBpbnRvIGxlZnQtaGFuZCAoYm90dG9tKVxyXG4gICAgICAgICAqIGFuZCByaWdodC1oYW5kICh0b3ApIHRyYWNrcy5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIExpc3Q8TWlkaVRyYWNrPiBTcGxpdFRyYWNrKE1pZGlUcmFjayB0cmFjaywgaW50IG1lYXN1cmVsZW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBMaXN0PE1pZGlOb3RlPiBub3RlcyA9IHRyYWNrLk5vdGVzO1xyXG4gICAgICAgICAgICBpbnQgY291bnQgPSBub3Rlcy5Db3VudDtcclxuXHJcbiAgICAgICAgICAgIE1pZGlUcmFjayB0b3AgPSBuZXcgTWlkaVRyYWNrKDEpO1xyXG4gICAgICAgICAgICBNaWRpVHJhY2sgYm90dG9tID0gbmV3IE1pZGlUcmFjaygyKTtcclxuICAgICAgICAgICAgTGlzdDxNaWRpVHJhY2s+IHJlc3VsdCA9IG5ldyBMaXN0PE1pZGlUcmFjaz4oMik7XHJcbiAgICAgICAgICAgIHJlc3VsdC5BZGQodG9wKTsgcmVzdWx0LkFkZChib3R0b20pO1xyXG5cclxuICAgICAgICAgICAgaWYgKGNvdW50ID09IDApXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICAgICAgICAgICAgaW50IHByZXZoaWdoID0gNzY7IC8qIEU1LCB0b3Agb2YgdHJlYmxlIHN0YWZmICovXHJcbiAgICAgICAgICAgIGludCBwcmV2bG93ID0gNDU7IC8qIEEzLCBib3R0b20gb2YgYmFzcyBzdGFmZiAqL1xyXG4gICAgICAgICAgICBpbnQgc3RhcnRpbmRleCA9IDA7XHJcblxyXG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIG5vdGVzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgaGlnaCwgbG93LCBoaWdoRXhhY3QsIGxvd0V4YWN0O1xyXG5cclxuICAgICAgICAgICAgICAgIGludCBudW1iZXIgPSBub3RlLk51bWJlcjtcclxuICAgICAgICAgICAgICAgIGhpZ2ggPSBsb3cgPSBoaWdoRXhhY3QgPSBsb3dFeGFjdCA9IG51bWJlcjtcclxuXHJcbiAgICAgICAgICAgICAgICB3aGlsZSAobm90ZXNbc3RhcnRpbmRleF0uRW5kVGltZSA8IG5vdGUuU3RhcnRUaW1lKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0aW5kZXgrKztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKiBJJ3ZlIHRyaWVkIHNldmVyYWwgYWxnb3JpdGhtcyBmb3Igc3BsaXR0aW5nIGEgdHJhY2sgaW4gdHdvLFxyXG4gICAgICAgICAgICAgICAgICogYW5kIHRoZSBvbmUgYmVsb3cgc2VlbXMgdG8gd29yayB0aGUgYmVzdDpcclxuICAgICAgICAgICAgICAgICAqIC0gSWYgdGhpcyBub3RlIGlzIG1vcmUgdGhhbiBhbiBvY3RhdmUgZnJvbSB0aGUgaGlnaC9sb3cgbm90ZXNcclxuICAgICAgICAgICAgICAgICAqICAgKHRoYXQgc3RhcnQgZXhhY3RseSBhdCB0aGlzIHN0YXJ0IHRpbWUpLCBjaG9vc2UgdGhlIGNsb3Nlc3Qgb25lLlxyXG4gICAgICAgICAgICAgICAgICogLSBJZiB0aGlzIG5vdGUgaXMgbW9yZSB0aGFuIGFuIG9jdGF2ZSBmcm9tIHRoZSBoaWdoL2xvdyBub3Rlc1xyXG4gICAgICAgICAgICAgICAgICogICAoaW4gdGhpcyBub3RlJ3MgdGltZSBkdXJhdGlvbiksIGNob29zZSB0aGUgY2xvc2VzdCBvbmUuXHJcbiAgICAgICAgICAgICAgICAgKiAtIElmIHRoZSBoaWdoIGFuZCBsb3cgbm90ZXMgKHRoYXQgc3RhcnQgZXhhY3RseSBhdCB0aGlzIHN0YXJ0dGltZSlcclxuICAgICAgICAgICAgICAgICAqICAgYXJlIG1vcmUgdGhhbiBhbiBvY3RhdmUgYXBhcnQsIGNob29zZSB0aGUgY2xvc2VzdCBub3RlLlxyXG4gICAgICAgICAgICAgICAgICogLSBJZiB0aGUgaGlnaCBhbmQgbG93IG5vdGVzICh0aGF0IG92ZXJsYXAgdGhpcyBzdGFydHRpbWUpXHJcbiAgICAgICAgICAgICAgICAgKiAgIGFyZSBtb3JlIHRoYW4gYW4gb2N0YXZlIGFwYXJ0LCBjaG9vc2UgdGhlIGNsb3Nlc3Qgbm90ZS5cclxuICAgICAgICAgICAgICAgICAqIC0gRWxzZSwgbG9vayBhdCB0aGUgcHJldmlvdXMgaGlnaC9sb3cgbm90ZXMgdGhhdCB3ZXJlIG1vcmUgdGhhbiBhbiBcclxuICAgICAgICAgICAgICAgICAqICAgb2N0YXZlIGFwYXJ0LiAgQ2hvb3NlIHRoZSBjbG9zZXNldCBub3RlLlxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBGaW5kSGlnaExvd05vdGVzKG5vdGVzLCBtZWFzdXJlbGVuLCBzdGFydGluZGV4LCBub3RlLlN0YXJ0VGltZSwgbm90ZS5FbmRUaW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWYgaGlnaCwgcmVmIGxvdyk7XHJcbiAgICAgICAgICAgICAgICBGaW5kRXhhY3RIaWdoTG93Tm90ZXMobm90ZXMsIHN0YXJ0aW5kZXgsIG5vdGUuU3RhcnRUaW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZiBoaWdoRXhhY3QsIHJlZiBsb3dFeGFjdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGhpZ2hFeGFjdCAtIG51bWJlciA+IDEyIHx8IG51bWJlciAtIGxvd0V4YWN0ID4gMTIpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhpZ2hFeGFjdCAtIG51bWJlciA8PSBudW1iZXIgLSBsb3dFeGFjdClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcC5BZGROb3RlKG5vdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3R0b20uQWRkTm90ZShub3RlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChoaWdoIC0gbnVtYmVyID4gMTIgfHwgbnVtYmVyIC0gbG93ID4gMTIpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhpZ2ggLSBudW1iZXIgPD0gbnVtYmVyIC0gbG93KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wLkFkZE5vdGUobm90ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdHRvbS5BZGROb3RlKG5vdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGhpZ2hFeGFjdCAtIGxvd0V4YWN0ID4gMTIpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhpZ2hFeGFjdCAtIG51bWJlciA8PSBudW1iZXIgLSBsb3dFeGFjdClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcC5BZGROb3RlKG5vdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3R0b20uQWRkTm90ZShub3RlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChoaWdoIC0gbG93ID4gMTIpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhpZ2ggLSBudW1iZXIgPD0gbnVtYmVyIC0gbG93KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wLkFkZE5vdGUobm90ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdHRvbS5BZGROb3RlKG5vdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJldmhpZ2ggLSBudW1iZXIgPD0gbnVtYmVyIC0gcHJldmxvdylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcC5BZGROb3RlKG5vdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3R0b20uQWRkTm90ZShub3RlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyogVGhlIHByZXZoaWdoL3ByZXZsb3cgYXJlIHNldCB0byB0aGUgbGFzdCBoaWdoL2xvd1xyXG4gICAgICAgICAgICAgICAgICogdGhhdCBhcmUgbW9yZSB0aGFuIGFuIG9jdGF2ZSBhcGFydC5cclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGhpZ2ggLSBsb3cgPiAxMilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBwcmV2aGlnaCA9IGhpZ2g7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldmxvdyA9IGxvdztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdG9wLk5vdGVzLlNvcnQodHJhY2suTm90ZXNbMF0pO1xyXG4gICAgICAgICAgICBib3R0b20uTm90ZXMuU29ydCh0cmFjay5Ob3Rlc1swXSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBDb21iaW5lIHRoZSBub3RlcyBpbiB0aGUgZ2l2ZW4gdHJhY2tzIGludG8gYSBzaW5nbGUgTWlkaVRyYWNrLiBcbiAgICAgICAgICogIFRoZSBpbmRpdmlkdWFsIHRyYWNrcyBhcmUgYWxyZWFkeSBzb3J0ZWQuICBUbyBtZXJnZSB0aGVtLCB3ZVxuICAgICAgICAgKiAgdXNlIGEgbWVyZ2Vzb3J0LWxpa2UgYWxnb3JpdGhtLlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIE1pZGlUcmFjayBDb21iaW5lVG9TaW5nbGVUcmFjayhMaXN0PE1pZGlUcmFjaz4gdHJhY2tzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLyogQWRkIGFsbCBub3RlcyBpbnRvIG9uZSB0cmFjayAqL1xyXG4gICAgICAgICAgICBNaWRpVHJhY2sgcmVzdWx0ID0gbmV3IE1pZGlUcmFjaygxKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0cmFja3MuQ291bnQgPT0gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh0cmFja3MuQ291bnQgPT0gMSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTWlkaVRyYWNrIHRyYWNrID0gdHJhY2tzWzBdO1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiB0cmFjay5Ob3RlcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQuQWRkTm90ZShub3RlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGludFtdIG5vdGVpbmRleCA9IG5ldyBpbnRbNjRdO1xyXG4gICAgICAgICAgICBpbnRbXSBub3RlY291bnQgPSBuZXcgaW50WzY0XTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCB0cmFja3MuQ291bnQ7IHRyYWNrbnVtKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG5vdGVpbmRleFt0cmFja251bV0gPSAwO1xyXG4gICAgICAgICAgICAgICAgbm90ZWNvdW50W3RyYWNrbnVtXSA9IHRyYWNrc1t0cmFja251bV0uTm90ZXMuQ291bnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgTWlkaU5vdGUgcHJldm5vdGUgPSBudWxsO1xyXG4gICAgICAgICAgICB3aGlsZSAodHJ1ZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTWlkaU5vdGUgbG93ZXN0bm90ZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICBpbnQgbG93ZXN0VHJhY2sgPSAtMTtcclxuICAgICAgICAgICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCB0cmFja3MuQ291bnQ7IHRyYWNrbnVtKyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgTWlkaVRyYWNrIHRyYWNrID0gdHJhY2tzW3RyYWNrbnVtXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobm90ZWluZGV4W3RyYWNrbnVtXSA+PSBub3RlY291bnRbdHJhY2tudW1dKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIE1pZGlOb3RlIG5vdGUgPSB0cmFjay5Ob3Rlc1tub3RlaW5kZXhbdHJhY2tudW1dXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobG93ZXN0bm90ZSA9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG93ZXN0bm90ZSA9IG5vdGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvd2VzdFRyYWNrID0gdHJhY2tudW07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG5vdGUuU3RhcnRUaW1lIDwgbG93ZXN0bm90ZS5TdGFydFRpbWUpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb3dlc3Rub3RlID0gbm90ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG93ZXN0VHJhY2sgPSB0cmFja251bTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobm90ZS5TdGFydFRpbWUgPT0gbG93ZXN0bm90ZS5TdGFydFRpbWUgJiYgbm90ZS5OdW1iZXIgPCBsb3dlc3Rub3RlLk51bWJlcilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvd2VzdG5vdGUgPSBub3RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb3dlc3RUcmFjayA9IHRyYWNrbnVtO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChsb3dlc3Rub3RlID09IG51bGwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogV2UndmUgZmluaXNoZWQgdGhlIG1lcmdlICovXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBub3RlaW5kZXhbbG93ZXN0VHJhY2tdKys7XHJcbiAgICAgICAgICAgICAgICBpZiAoKHByZXZub3RlICE9IG51bGwpICYmIChwcmV2bm90ZS5TdGFydFRpbWUgPT0gbG93ZXN0bm90ZS5TdGFydFRpbWUpICYmXHJcbiAgICAgICAgICAgICAgICAgICAgKHByZXZub3RlLk51bWJlciA9PSBsb3dlc3Rub3RlLk51bWJlcikpXHJcbiAgICAgICAgICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8qIERvbid0IGFkZCBkdXBsaWNhdGUgbm90ZXMsIHdpdGggdGhlIHNhbWUgc3RhcnQgdGltZSBhbmQgbnVtYmVyICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvd2VzdG5vdGUuRHVyYXRpb24gPiBwcmV2bm90ZS5EdXJhdGlvbilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZub3RlLkR1cmF0aW9uID0gbG93ZXN0bm90ZS5EdXJhdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LkFkZE5vdGUobG93ZXN0bm90ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldm5vdGUgPSBsb3dlc3Rub3RlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBDb21iaW5lIHRoZSBub3RlcyBpbiBhbGwgdGhlIHRyYWNrcyBnaXZlbiBpbnRvIHR3byBNaWRpVHJhY2tzLFxuICAgICAgICAgKiBhbmQgcmV0dXJuIHRoZW0uXG4gICAgICAgICAqIFxuICAgICAgICAgKiBUaGlzIGZ1bmN0aW9uIGlzIGludGVuZGVkIGZvciBwaWFubyBzb25ncywgd2hlbiB3ZSB3YW50IHRvIGRpc3BsYXlcbiAgICAgICAgICogYSBsZWZ0LWhhbmQgdHJhY2sgYW5kIGEgcmlnaHQtaGFuZCB0cmFjay4gIFRoZSBsb3dlciBub3RlcyBnbyBpbnRvIFxuICAgICAgICAgKiB0aGUgbGVmdC1oYW5kIHRyYWNrLCBhbmQgdGhlIGhpZ2hlciBub3RlcyBnbyBpbnRvIHRoZSByaWdodCBoYW5kIFxuICAgICAgICAgKiB0cmFjay5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBMaXN0PE1pZGlUcmFjaz4gQ29tYmluZVRvVHdvVHJhY2tzKExpc3Q8TWlkaVRyYWNrPiB0cmFja3MsIGludCBtZWFzdXJlbGVuKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgTWlkaVRyYWNrIHNpbmdsZSA9IENvbWJpbmVUb1NpbmdsZVRyYWNrKHRyYWNrcyk7XHJcbiAgICAgICAgICAgIExpc3Q8TWlkaVRyYWNrPiByZXN1bHQgPSBTcGxpdFRyYWNrKHNpbmdsZSwgbWVhc3VyZWxlbik7XHJcblxyXG4gICAgICAgICAgICBMaXN0PE1pZGlFdmVudD4gbHlyaWNzID0gbmV3IExpc3Q8TWlkaUV2ZW50PigpO1xyXG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHJhY2suTHlyaWNzICE9IG51bGwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbHlyaWNzLkFkZFJhbmdlKHRyYWNrLkx5cmljcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGx5cmljcy5Db3VudCA+IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGx5cmljcy5Tb3J0KGx5cmljc1swXSk7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRbMF0uTHlyaWNzID0gbHlyaWNzO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBDaGVjayB0aGF0IHRoZSBNaWRpTm90ZSBzdGFydCB0aW1lcyBhcmUgaW4gaW5jcmVhc2luZyBvcmRlci5cbiAgICAgICAgICogVGhpcyBpcyBmb3IgZGVidWdnaW5nIHB1cnBvc2VzLlxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIENoZWNrU3RhcnRUaW1lcyhMaXN0PE1pZGlUcmFjaz4gdHJhY2tzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHRyYWNrcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IHByZXZ0aW1lID0gLTE7XHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrLk5vdGVzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChub3RlLlN0YXJ0VGltZSA8IHByZXZ0aW1lKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5c3RlbS5Bcmd1bWVudEV4Y2VwdGlvbihcInN0YXJ0IHRpbWVzIG5vdCBpbiBpbmNyZWFzaW5nIG9yZGVyXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBwcmV2dGltZSA9IG5vdGUuU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIEluIE1pZGkgRmlsZXMsIHRpbWUgaXMgbWVhc3VyZWQgaW4gcHVsc2VzLiAgTm90ZXMgdGhhdCBoYXZlXG4gICAgICAgICAqIHB1bHNlIHRpbWVzIHRoYXQgYXJlIGNsb3NlIHRvZ2V0aGVyIChsaWtlIHdpdGhpbiAxMCBwdWxzZXMpXG4gICAgICAgICAqIHdpbGwgc291bmQgbGlrZSB0aGV5J3JlIHRoZSBzYW1lIGNob3JkLiAgV2Ugd2FudCB0byBkcmF3XG4gICAgICAgICAqIHRoZXNlIG5vdGVzIGFzIGEgc2luZ2xlIGNob3JkLCBpdCBtYWtlcyB0aGUgc2hlZXQgbXVzaWMgbXVjaFxuICAgICAgICAgKiBlYXNpZXIgdG8gcmVhZC4gIFdlIGRvbid0IHdhbnQgdG8gZHJhdyBub3RlcyB0aGF0IGFyZSBjbG9zZVxuICAgICAgICAgKiB0b2dldGhlciBhcyB0d28gc2VwYXJhdGUgY2hvcmRzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBUaGUgU3ltYm9sU3BhY2luZyBjbGFzcyBvbmx5IGFsaWducyBub3RlcyB0aGF0IGhhdmUgZXhhY3RseSB0aGUgc2FtZVxuICAgICAgICAgKiBzdGFydCB0aW1lcy4gIE5vdGVzIHdpdGggc2xpZ2h0bHkgZGlmZmVyZW50IHN0YXJ0IHRpbWVzIHdpbGxcbiAgICAgICAgICogYXBwZWFyIGluIHNlcGFyYXRlIHZlcnRpY2FsIGNvbHVtbnMuICBUaGlzIGlzbid0IHdoYXQgd2Ugd2FudC5cbiAgICAgICAgICogV2Ugd2FudCB0byBhbGlnbiBub3RlcyB3aXRoIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgc3RhcnQgdGltZXMuXG4gICAgICAgICAqIFNvLCB0aGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gYXNzaWduIHRoZSBzYW1lIHN0YXJ0dGltZSBmb3Igbm90ZXNcbiAgICAgICAgICogdGhhdCBhcmUgY2xvc2UgdG9nZXRoZXIgKHRpbWV3aXNlKS5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB2b2lkXHJcbiAgICAgICAgUm91bmRTdGFydFRpbWVzKExpc3Q8TWlkaVRyYWNrPiB0cmFja3MsIGludCBtaWxsaXNlYywgVGltZVNpZ25hdHVyZSB0aW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLyogR2V0IGFsbCB0aGUgc3RhcnR0aW1lcyBpbiBhbGwgdHJhY2tzLCBpbiBzb3J0ZWQgb3JkZXIgKi9cclxuICAgICAgICAgICAgTGlzdDxpbnQ+IHN0YXJ0dGltZXMgPSBuZXcgTGlzdDxpbnQ+KCk7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG5vdGUgaW4gdHJhY2suTm90ZXMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnR0aW1lcy5BZGQobm90ZS5TdGFydFRpbWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN0YXJ0dGltZXMuU29ydCgpO1xyXG5cclxuICAgICAgICAgICAgLyogTm90ZXMgd2l0aGluIFwibWlsbGlzZWNcIiBtaWxsaXNlY29uZHMgYXBhcnQgd2lsbCBiZSBjb21iaW5lZC4gKi9cclxuICAgICAgICAgICAgaW50IGludGVydmFsID0gdGltZS5RdWFydGVyICogbWlsbGlzZWMgKiAxMDAwIC8gdGltZS5UZW1wbztcclxuXHJcbiAgICAgICAgICAgIC8qIElmIHR3byBzdGFydHRpbWVzIGFyZSB3aXRoaW4gaW50ZXJ2YWwgbWlsbGlzZWMsIG1ha2UgdGhlbSB0aGUgc2FtZSAqL1xyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHN0YXJ0dGltZXMuQ291bnQgLSAxOyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzdGFydHRpbWVzW2kgKyAxXSAtIHN0YXJ0dGltZXNbaV0gPD0gaW50ZXJ2YWwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnR0aW1lc1tpICsgMV0gPSBzdGFydHRpbWVzW2ldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBDaGVja1N0YXJ0VGltZXModHJhY2tzKTtcclxuXHJcbiAgICAgICAgICAgIC8qIEFkanVzdCB0aGUgbm90ZSBzdGFydHRpbWVzLCBzbyB0aGF0IGl0IG1hdGNoZXMgb25lIG9mIHRoZSBzdGFydHRpbWVzIHZhbHVlcyAqL1xyXG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgaSA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTWlkaU5vdGUgbm90ZSBpbiB0cmFjay5Ob3RlcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaSA8IHN0YXJ0dGltZXMuQ291bnQgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90ZS5TdGFydFRpbWUgLSBpbnRlcnZhbCA+IHN0YXJ0dGltZXNbaV0pXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAobm90ZS5TdGFydFRpbWUgPiBzdGFydHRpbWVzW2ldICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdGUuU3RhcnRUaW1lIC0gc3RhcnR0aW1lc1tpXSA8PSBpbnRlcnZhbClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBub3RlLlN0YXJ0VGltZSA9IHN0YXJ0dGltZXNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdHJhY2suTm90ZXMuU29ydCh0cmFjay5Ob3Rlc1swXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogV2Ugd2FudCBub3RlIGR1cmF0aW9ucyB0byBzcGFuIHVwIHRvIHRoZSBuZXh0IG5vdGUgaW4gZ2VuZXJhbC5cbiAgICAgICAgICogVGhlIHNoZWV0IG11c2ljIGxvb2tzIG5pY2VyIHRoYXQgd2F5LiAgSW4gY29udHJhc3QsIHNoZWV0IG11c2ljXG4gICAgICAgICAqIHdpdGggbG90cyBvZiAxNnRoLzMybmQgbm90ZXMgc2VwYXJhdGVkIGJ5IHNtYWxsIHJlc3RzIGRvZXNuJ3RcbiAgICAgICAgICogbG9vayBhcyBuaWNlLiAgSGF2aW5nIG5pY2UgbG9va2luZyBzaGVldCBtdXNpYyBpcyBtb3JlIGltcG9ydGFudFxuICAgICAgICAgKiB0aGFuIGZhaXRoZnVsbHkgcmVwcmVzZW50aW5nIHRoZSBNaWRpIEZpbGUgZGF0YS5cbiAgICAgICAgICpcbiAgICAgICAgICogVGhlcmVmb3JlLCB0aGlzIGZ1bmN0aW9uIHJvdW5kcyB0aGUgZHVyYXRpb24gb2YgTWlkaU5vdGVzIHVwIHRvXG4gICAgICAgICAqIHRoZSBuZXh0IG5vdGUgd2hlcmUgcG9zc2libGUuXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZFxyXG4gICAgICAgIFJvdW5kRHVyYXRpb25zKExpc3Q8TWlkaVRyYWNrPiB0cmFja3MsIGludCBxdWFydGVybm90ZSlcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBNaWRpTm90ZSBwcmV2Tm90ZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHRyYWNrLk5vdGVzLkNvdW50IC0gMTsgaSsrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIE1pZGlOb3RlIG5vdGUxID0gdHJhY2suTm90ZXNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZOb3RlID09IG51bGwpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2Tm90ZSA9IG5vdGUxO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLyogR2V0IHRoZSBuZXh0IG5vdGUgdGhhdCBoYXMgYSBkaWZmZXJlbnQgc3RhcnQgdGltZSAqL1xyXG4gICAgICAgICAgICAgICAgICAgIE1pZGlOb3RlIG5vdGUyID0gbm90ZTE7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpbnQgaiA9IGkgKyAxOyBqIDwgdHJhY2suTm90ZXMuQ291bnQ7IGorKylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdGUyID0gdHJhY2suTm90ZXNbal07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub3RlMS5TdGFydFRpbWUgPCBub3RlMi5TdGFydFRpbWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGludCBtYXhkdXJhdGlvbiA9IG5vdGUyLlN0YXJ0VGltZSAtIG5vdGUxLlN0YXJ0VGltZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaW50IGR1ciA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHF1YXJ0ZXJub3RlIDw9IG1heGR1cmF0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkdXIgPSBxdWFydGVybm90ZTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChxdWFydGVybm90ZSAvIDIgPD0gbWF4ZHVyYXRpb24pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1ciA9IHF1YXJ0ZXJub3RlIC8gMjtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChxdWFydGVybm90ZSAvIDMgPD0gbWF4ZHVyYXRpb24pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1ciA9IHF1YXJ0ZXJub3RlIC8gMztcclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChxdWFydGVybm90ZSAvIDQgPD0gbWF4ZHVyYXRpb24pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1ciA9IHF1YXJ0ZXJub3RlIC8gNDtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkdXIgPCBub3RlMS5EdXJhdGlvbilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1ciA9IG5vdGUxLkR1cmF0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLyogU3BlY2lhbCBjYXNlOiBJZiB0aGUgcHJldmlvdXMgbm90ZSdzIGR1cmF0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICogbWF0Y2hlcyB0aGlzIG5vdGUncyBkdXJhdGlvbiwgd2UgY2FuIG1ha2UgYSBub3RlcGFpci5cclxuICAgICAgICAgICAgICAgICAgICAgKiBTbyBkb24ndCBleHBhbmQgdGhlIGR1cmF0aW9uIGluIHRoYXQgY2FzZS5cclxuICAgICAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgICAgICBpZiAoKHByZXZOb3RlLlN0YXJ0VGltZSArIHByZXZOb3RlLkR1cmF0aW9uID09IG5vdGUxLlN0YXJ0VGltZSkgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgKHByZXZOb3RlLkR1cmF0aW9uID09IG5vdGUxLkR1cmF0aW9uKSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkdXIgPSBub3RlMS5EdXJhdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbm90ZTEuRHVyYXRpb24gPSBkdXI7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYWNrLk5vdGVzW2kgKyAxXS5TdGFydFRpbWUgIT0gbm90ZTEuU3RhcnRUaW1lKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldk5vdGUgPSBub3RlMTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBTcGxpdCB0aGUgZ2l2ZW4gdHJhY2sgaW50byBtdWx0aXBsZSB0cmFja3MsIHNlcGFyYXRpbmcgZWFjaFxuICAgICAgICAgKiBjaGFubmVsIGludG8gYSBzZXBhcmF0ZSB0cmFjay5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgTGlzdDxNaWRpVHJhY2s+XHJcbiAgICAgICAgU3BsaXRDaGFubmVscyhNaWRpVHJhY2sgb3JpZ3RyYWNrLCBMaXN0PE1pZGlFdmVudD4gZXZlbnRzKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIC8qIEZpbmQgdGhlIGluc3RydW1lbnQgdXNlZCBmb3IgZWFjaCBjaGFubmVsICovXHJcbiAgICAgICAgICAgIGludFtdIGNoYW5uZWxJbnN0cnVtZW50cyA9IG5ldyBpbnRbMTZdO1xyXG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpRXZlbnQgbWV2ZW50IGluIGV2ZW50cylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gRXZlbnRQcm9ncmFtQ2hhbmdlKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYW5uZWxJbnN0cnVtZW50c1ttZXZlbnQuQ2hhbm5lbF0gPSBtZXZlbnQuSW5zdHJ1bWVudDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjaGFubmVsSW5zdHJ1bWVudHNbOV0gPSAxMjg7IC8qIENoYW5uZWwgOSA9IFBlcmN1c3Npb24gKi9cclxuXHJcbiAgICAgICAgICAgIExpc3Q8TWlkaVRyYWNrPiByZXN1bHQgPSBuZXcgTGlzdDxNaWRpVHJhY2s+KCk7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlOb3RlIG5vdGUgaW4gb3JpZ3RyYWNrLk5vdGVzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBib29sIGZvdW5kY2hhbm5lbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTWlkaVRyYWNrIHRyYWNrIGluIHJlc3VsdClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobm90ZS5DaGFubmVsID09IHRyYWNrLk5vdGVzWzBdLkNoYW5uZWwpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZGNoYW5uZWwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFjay5BZGROb3RlKG5vdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghZm91bmRjaGFubmVsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIE1pZGlUcmFjayB0cmFjayA9IG5ldyBNaWRpVHJhY2socmVzdWx0LkNvdW50ICsgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJhY2suQWRkTm90ZShub3RlKTtcclxuICAgICAgICAgICAgICAgICAgICB0cmFjay5JbnN0cnVtZW50ID0gY2hhbm5lbEluc3RydW1lbnRzW25vdGUuQ2hhbm5lbF07XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LkFkZCh0cmFjayk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG9yaWd0cmFjay5MeXJpY3MgIT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTWlkaUV2ZW50IGx5cmljRXZlbnQgaW4gb3JpZ3RyYWNrLkx5cmljcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gcmVzdWx0KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGx5cmljRXZlbnQuQ2hhbm5lbCA9PSB0cmFjay5Ob3Rlc1swXS5DaGFubmVsKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFjay5BZGRMeXJpYyhseXJpY0V2ZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBHdWVzcyB0aGUgbWVhc3VyZSBsZW5ndGguICBXZSBhc3N1bWUgdGhhdCB0aGUgbWVhc3VyZVxuICAgICAgICAgKiBsZW5ndGggbXVzdCBiZSBiZXR3ZWVuIDAuNSBzZWNvbmRzIGFuZCA0IHNlY29uZHMuXG4gICAgICAgICAqIFRha2UgYWxsIHRoZSBub3RlIHN0YXJ0IHRpbWVzIHRoYXQgZmFsbCBiZXR3ZWVuIDAuNSBhbmQgXG4gICAgICAgICAqIDQgc2Vjb25kcywgYW5kIHJldHVybiB0aGUgc3RhcnR0aW1lcy5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIExpc3Q8aW50PlxyXG4gICAgICAgIEd1ZXNzTWVhc3VyZUxlbmd0aCgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBMaXN0PGludD4gcmVzdWx0ID0gbmV3IExpc3Q8aW50PigpO1xyXG5cclxuICAgICAgICAgICAgaW50IHB1bHNlc19wZXJfc2Vjb25kID0gKGludCkoMTAwMDAwMC4wIC8gdGltZXNpZy5UZW1wbyAqIHRpbWVzaWcuUXVhcnRlcik7XHJcbiAgICAgICAgICAgIGludCBtaW5tZWFzdXJlID0gcHVsc2VzX3Blcl9zZWNvbmQgLyAyOyAgLyogVGhlIG1pbmltdW0gbWVhc3VyZSBsZW5ndGggaW4gcHVsc2VzICovXHJcbiAgICAgICAgICAgIGludCBtYXhtZWFzdXJlID0gcHVsc2VzX3Blcl9zZWNvbmQgKiA0OyAgLyogVGhlIG1heGltdW0gbWVhc3VyZSBsZW5ndGggaW4gcHVsc2VzICovXHJcblxyXG4gICAgICAgICAgICAvKiBHZXQgdGhlIHN0YXJ0IHRpbWUgb2YgdGhlIGZpcnN0IG5vdGUgaW4gdGhlIG1pZGkgZmlsZS4gKi9cclxuICAgICAgICAgICAgaW50IGZpcnN0bm90ZSA9IHRpbWVzaWcuTWVhc3VyZSAqIDU7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChmaXJzdG5vdGUgPiB0cmFjay5Ob3Rlc1swXS5TdGFydFRpbWUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlyc3Rub3RlID0gdHJhY2suTm90ZXNbMF0uU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvKiBpbnRlcnZhbCA9IDAuMDYgc2Vjb25kcywgY29udmVydGVkIGludG8gcHVsc2VzICovXHJcbiAgICAgICAgICAgIGludCBpbnRlcnZhbCA9IHRpbWVzaWcuUXVhcnRlciAqIDYwMDAwIC8gdGltZXNpZy5UZW1wbztcclxuXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGludCBwcmV2dGltZSA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrLk5vdGVzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChub3RlLlN0YXJ0VGltZSAtIHByZXZ0aW1lIDw9IGludGVydmFsKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcHJldnRpbWUgPSBub3RlLlN0YXJ0VGltZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaW50IHRpbWVfZnJvbV9maXJzdG5vdGUgPSBub3RlLlN0YXJ0VGltZSAtIGZpcnN0bm90ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLyogUm91bmQgdGhlIHRpbWUgZG93biB0byBhIG11bHRpcGxlIG9mIDQgKi9cclxuICAgICAgICAgICAgICAgICAgICB0aW1lX2Zyb21fZmlyc3Rub3RlID0gdGltZV9mcm9tX2ZpcnN0bm90ZSAvIDQgKiA0O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lX2Zyb21fZmlyc3Rub3RlIDwgbWlubWVhc3VyZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWVfZnJvbV9maXJzdG5vdGUgPiBtYXhtZWFzdXJlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQuQ29udGFpbnModGltZV9mcm9tX2ZpcnN0bm90ZSkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuQWRkKHRpbWVfZnJvbV9maXJzdG5vdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXN1bHQuU29ydCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFJldHVybiB0aGUgbGFzdCBzdGFydCB0aW1lICovXHJcbiAgICAgICAgcHVibGljIGludCBFbmRUaW1lKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGludCBsYXN0U3RhcnQgPSAwO1xyXG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHJhY2suTm90ZXMuQ291bnQgPT0gMClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGludCBsYXN0ID0gdHJhY2suTm90ZXNbdHJhY2suTm90ZXMuQ291bnQgLSAxXS5TdGFydFRpbWU7XHJcbiAgICAgICAgICAgICAgICBsYXN0U3RhcnQgPSBNYXRoLk1heChsYXN0LCBsYXN0U3RhcnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBsYXN0U3RhcnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogUmV0dXJuIHRydWUgaWYgdGhpcyBtaWRpIGZpbGUgaGFzIGx5cmljcyAqL1xyXG4gICAgICAgIHB1YmxpYyBib29sIEhhc0x5cmljcygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHJhY2suTHlyaWNzICE9IG51bGwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzdHJpbmcgcmVzdWx0ID0gXCJNaWRpIEZpbGUgdHJhY2tzPVwiICsgdHJhY2tzLkNvdW50ICsgXCIgcXVhcnRlcj1cIiArIHF1YXJ0ZXJub3RlICsgXCJcXG5cIjtcclxuICAgICAgICAgICAgcmVzdWx0ICs9IFRpbWUuVG9TdHJpbmcoKSArIFwiXFxuXCI7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlUcmFjayB0cmFjayBpbiB0cmFja3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSB0cmFjay5Ub1N0cmluZygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0gIC8qIEVuZCBjbGFzcyBNaWRpRmlsZSAqL1xuXG59ICAvKiBFbmQgbmFtZXNwYWNlIE1pZGlTaGVldE11c2ljICovXG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMiBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogQGNsYXNzIE1pZGlGaWxlRXhjZXB0aW9uXG4gKiBBIE1pZGlGaWxlRXhjZXB0aW9uIGlzIHRocm93biB3aGVuIGFuIGVycm9yIG9jY3Vyc1xuICogd2hpbGUgcGFyc2luZyB0aGUgTWlkaSBGaWxlLiAgVGhlIGNvbnN0cnVjdG9yIHRha2VzXG4gKiB0aGUgZmlsZSBvZmZzZXQgKGluIGJ5dGVzKSB3aGVyZSB0aGUgZXJyb3Igb2NjdXJyZWQsXG4gKiBhbmQgYSBzdHJpbmcgZGVzY3JpYmluZyB0aGUgZXJyb3IuXG4gKi9cbnB1YmxpYyBjbGFzcyBNaWRpRmlsZUV4Y2VwdGlvbiA6IFN5c3RlbS5FeGNlcHRpb24ge1xuICAgIHB1YmxpYyBNaWRpRmlsZUV4Y2VwdGlvbiAoc3RyaW5nIHMsIGludCBvZmZzZXQpIDpcbiAgICAgICAgYmFzZShzICsgXCIgYXQgb2Zmc2V0IFwiICsgb2Zmc2V0KSB7XG4gICAgfVxufVxuXG59XG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMiBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG5cbi8qKiBAY2xhc3MgTWlkaUZpbGVSZWFkZXJcbiAqIFRoZSBNaWRpRmlsZVJlYWRlciBpcyB1c2VkIHRvIHJlYWQgbG93LWxldmVsIGJpbmFyeSBkYXRhIGZyb20gYSBmaWxlLlxuICogVGhpcyBjbGFzcyBjYW4gZG8gdGhlIGZvbGxvd2luZzpcbiAqXG4gKiAtIFBlZWsgYXQgdGhlIG5leHQgYnl0ZSBpbiB0aGUgZmlsZS5cbiAqIC0gUmVhZCBhIGJ5dGVcbiAqIC0gUmVhZCBhIDE2LWJpdCBiaWcgZW5kaWFuIHNob3J0XG4gKiAtIFJlYWQgYSAzMi1iaXQgYmlnIGVuZGlhbiBpbnRcbiAqIC0gUmVhZCBhIGZpeGVkIGxlbmd0aCBhc2NpaSBzdHJpbmcgKG5vdCBudWxsIHRlcm1pbmF0ZWQpXG4gKiAtIFJlYWQgYSBcInZhcmlhYmxlIGxlbmd0aFwiIGludGVnZXIuICBUaGUgZm9ybWF0IG9mIHRoZSB2YXJpYWJsZSBsZW5ndGhcbiAqICAgaW50IGlzIGRlc2NyaWJlZCBhdCB0aGUgdG9wIG9mIHRoaXMgZmlsZS5cbiAqIC0gU2tpcCBhaGVhZCBhIGdpdmVuIG51bWJlciBvZiBieXRlc1xuICogLSBSZXR1cm4gdGhlIGN1cnJlbnQgb2Zmc2V0LlxuICovXG5cbnB1YmxpYyBjbGFzcyBNaWRpRmlsZVJlYWRlciB7XG4gICAgcHJpdmF0ZSBieXRlW10gZGF0YTsgICAgICAgLyoqIFRoZSBlbnRpcmUgbWlkaSBmaWxlIGRhdGEgKi9cbiAgICBwcml2YXRlIGludCBwYXJzZV9vZmZzZXQ7ICAvKiogVGhlIGN1cnJlbnQgb2Zmc2V0IHdoaWxlIHBhcnNpbmcgKi9cblxuICAgIC8qKiBDcmVhdGUgYSBuZXcgTWlkaUZpbGVSZWFkZXIgZm9yIHRoZSBnaXZlbiBmaWxlbmFtZSAqL1xuICAgIC8vcHVibGljIE1pZGlGaWxlUmVhZGVyKHN0cmluZyBmaWxlbmFtZSkge1xuICAgIC8vICAgIEZpbGVJbmZvIGluZm8gPSBuZXcgRmlsZUluZm8oZmlsZW5hbWUpO1xuICAgIC8vICAgIGlmICghaW5mby5FeGlzdHMpIHtcbiAgICAvLyAgICAgICAgdGhyb3cgbmV3IE1pZGlGaWxlRXhjZXB0aW9uKFwiRmlsZSBcIiArIGZpbGVuYW1lICsgXCIgZG9lcyBub3QgZXhpc3RcIiwgMCk7XG4gICAgLy8gICAgfVxuICAgIC8vICAgIGlmIChpbmZvLkxlbmd0aCA9PSAwKSB7XG4gICAgLy8gICAgICAgIHRocm93IG5ldyBNaWRpRmlsZUV4Y2VwdGlvbihcIkZpbGUgXCIgKyBmaWxlbmFtZSArIFwiIGlzIGVtcHR5ICgwIGJ5dGVzKVwiLCAwKTtcbiAgICAvLyAgICB9XG4gICAgLy8gICAgRmlsZVN0cmVhbSBmaWxlID0gRmlsZS5PcGVuKGZpbGVuYW1lLCBGaWxlTW9kZS5PcGVuLCBcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRmlsZUFjY2Vzcy5SZWFkLCBGaWxlU2hhcmUuUmVhZCk7XG5cbiAgICAvLyAgICAvKiBSZWFkIHRoZSBlbnRpcmUgZmlsZSBpbnRvIG1lbW9yeSAqL1xuICAgIC8vICAgIGRhdGEgPSBuZXcgYnl0ZVsgaW5mby5MZW5ndGggXTtcbiAgICAvLyAgICBpbnQgb2Zmc2V0ID0gMDtcbiAgICAvLyAgICBpbnQgbGVuID0gKGludClpbmZvLkxlbmd0aDtcbiAgICAvLyAgICB3aGlsZSAodHJ1ZSkge1xuICAgIC8vICAgICAgICBpZiAob2Zmc2V0ID09IGluZm8uTGVuZ3RoKVxuICAgIC8vICAgICAgICAgICAgYnJlYWs7XG4gICAgLy8gICAgICAgIGludCBuID0gZmlsZS5SZWFkKGRhdGEsIG9mZnNldCwgKGludCkoaW5mby5MZW5ndGggLSBvZmZzZXQpKTtcbiAgICAvLyAgICAgICAgaWYgKG4gPD0gMClcbiAgICAvLyAgICAgICAgICAgIGJyZWFrO1xuICAgIC8vICAgICAgICBvZmZzZXQgKz0gbjtcbiAgICAvLyAgICB9XG4gICAgLy8gICAgcGFyc2Vfb2Zmc2V0ID0gMDtcbiAgICAvLyAgICBmaWxlLkNsb3NlKCk7XG4gICAgLy99XG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IE1pZGlGaWxlUmVhZGVyIGZyb20gdGhlIGdpdmVuIGRhdGEgKi9cbiAgICBwdWJsaWMgTWlkaUZpbGVSZWFkZXIoYnl0ZVtdIGJ5dGVzKSB7XG4gICAgICAgIGRhdGEgPSBieXRlcztcbiAgICAgICAgcGFyc2Vfb2Zmc2V0ID0gMDtcbiAgICB9XG5cbiAgICAvKiogQ2hlY2sgdGhhdCB0aGUgZ2l2ZW4gbnVtYmVyIG9mIGJ5dGVzIGRvZXNuJ3QgZXhjZWVkIHRoZSBmaWxlIHNpemUgKi9cbiAgICBwcml2YXRlIHZvaWQgY2hlY2tSZWFkKGludCBhbW91bnQpIHtcbiAgICAgICAgaWYgKHBhcnNlX29mZnNldCArIGFtb3VudCA+IGRhdGEuTGVuZ3RoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXCJGaWxlIGlzIHRydW5jYXRlZFwiLCBwYXJzZV9vZmZzZXQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFJlYWQgdGhlIG5leHQgYnl0ZSBpbiB0aGUgZmlsZSwgYnV0IGRvbid0IGluY3JlbWVudCB0aGUgcGFyc2Ugb2Zmc2V0ICovXG4gICAgcHVibGljIGJ5dGUgUGVlaygpIHtcbiAgICAgICAgY2hlY2tSZWFkKDEpO1xuICAgICAgICByZXR1cm4gZGF0YVtwYXJzZV9vZmZzZXRdO1xuICAgIH1cblxuICAgIC8qKiBSZWFkIGEgYnl0ZSBmcm9tIHRoZSBmaWxlICovXG4gICAgcHVibGljIGJ5dGUgUmVhZEJ5dGUoKSB7IFxuICAgICAgICBjaGVja1JlYWQoMSk7XG4gICAgICAgIGJ5dGUgeCA9IGRhdGFbcGFyc2Vfb2Zmc2V0XTtcbiAgICAgICAgcGFyc2Vfb2Zmc2V0Kys7XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cblxuICAgIC8qKiBSZWFkIHRoZSBnaXZlbiBudW1iZXIgb2YgYnl0ZXMgZnJvbSB0aGUgZmlsZSAqL1xuICAgIHB1YmxpYyBieXRlW10gUmVhZEJ5dGVzKGludCBhbW91bnQpIHtcbiAgICAgICAgY2hlY2tSZWFkKGFtb3VudCk7XG4gICAgICAgIGJ5dGVbXSByZXN1bHQgPSBuZXcgYnl0ZVthbW91bnRdO1xuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IGFtb3VudDsgaSsrKSB7XG4gICAgICAgICAgICByZXN1bHRbaV0gPSBkYXRhW2kgKyBwYXJzZV9vZmZzZXRdO1xuICAgICAgICB9XG4gICAgICAgIHBhcnNlX29mZnNldCArPSBhbW91bnQ7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqIFJlYWQgYSAxNi1iaXQgc2hvcnQgZnJvbSB0aGUgZmlsZSAqL1xuICAgIHB1YmxpYyB1c2hvcnQgUmVhZFNob3J0KCkge1xuICAgICAgICBjaGVja1JlYWQoMik7XG4gICAgICAgIHVzaG9ydCB4ID0gKHVzaG9ydCkgKCAoZGF0YVtwYXJzZV9vZmZzZXRdIDw8IDgpIHwgZGF0YVtwYXJzZV9vZmZzZXQrMV0gKTtcbiAgICAgICAgcGFyc2Vfb2Zmc2V0ICs9IDI7XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cblxuICAgIC8qKiBSZWFkIGEgMzItYml0IGludCBmcm9tIHRoZSBmaWxlICovXG4gICAgcHVibGljIGludCBSZWFkSW50KCkge1xuICAgICAgICBjaGVja1JlYWQoNCk7XG4gICAgICAgIGludCB4ID0gKGludCkoIChkYXRhW3BhcnNlX29mZnNldF0gPDwgMjQpIHwgKGRhdGFbcGFyc2Vfb2Zmc2V0KzFdIDw8IDE2KSB8XG4gICAgICAgICAgICAgICAgICAgICAgIChkYXRhW3BhcnNlX29mZnNldCsyXSA8PCA4KSB8IGRhdGFbcGFyc2Vfb2Zmc2V0KzNdICk7XG4gICAgICAgIHBhcnNlX29mZnNldCArPSA0O1xuICAgICAgICByZXR1cm4geDtcbiAgICB9XG5cbiAgICAvKiogUmVhZCBhbiBhc2NpaSBzdHJpbmcgd2l0aCB0aGUgZ2l2ZW4gbGVuZ3RoICovXG4gICAgcHVibGljIHN0cmluZyBSZWFkQXNjaWkoaW50IGxlbikge1xuICAgICAgICBjaGVja1JlYWQobGVuKTtcbiAgICAgICAgc3RyaW5nIHMgPSBBU0NJSUVuY29kaW5nLkFTQ0lJLkdldFN0cmluZyhkYXRhLCBwYXJzZV9vZmZzZXQsIGxlbik7XG4gICAgICAgIHBhcnNlX29mZnNldCArPSBsZW47XG4gICAgICAgIHJldHVybiBzO1xuICAgIH1cblxuICAgIC8qKiBSZWFkIGEgdmFyaWFibGUtbGVuZ3RoIGludGVnZXIgKDEgdG8gNCBieXRlcykuIFRoZSBpbnRlZ2VyIGVuZHNcbiAgICAgKiB3aGVuIHlvdSBlbmNvdW50ZXIgYSBieXRlIHRoYXQgZG9lc24ndCBoYXZlIHRoZSA4dGggYml0IHNldFxuICAgICAqIChhIGJ5dGUgbGVzcyB0aGFuIDB4ODApLlxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgUmVhZFZhcmxlbigpIHtcbiAgICAgICAgdWludCByZXN1bHQgPSAwO1xuICAgICAgICBieXRlIGI7XG5cbiAgICAgICAgYiA9IFJlYWRCeXRlKCk7XG4gICAgICAgIHJlc3VsdCA9ICh1aW50KShiICYgMHg3Zik7XG5cbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgICAgICAgIGlmICgoYiAmIDB4ODApICE9IDApIHtcbiAgICAgICAgICAgICAgICBiID0gUmVhZEJ5dGUoKTtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSAodWludCkoIChyZXN1bHQgPDwgNykgKyAoYiAmIDB4N2YpICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKGludClyZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqIFNraXAgb3ZlciB0aGUgZ2l2ZW4gbnVtYmVyIG9mIGJ5dGVzICovIFxuICAgIHB1YmxpYyB2b2lkIFNraXAoaW50IGFtb3VudCkge1xuICAgICAgICBjaGVja1JlYWQoYW1vdW50KTtcbiAgICAgICAgcGFyc2Vfb2Zmc2V0ICs9IGFtb3VudDtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBjdXJyZW50IHBhcnNlIG9mZnNldCAqL1xuICAgIHB1YmxpYyBpbnQgR2V0T2Zmc2V0KCkge1xuICAgICAgICByZXR1cm4gcGFyc2Vfb2Zmc2V0O1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIHJhdyBtaWRpIGZpbGUgYnl0ZSBkYXRhICovXG4gICAgcHVibGljIGJ5dGVbXSBHZXREYXRhKCkge1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG59XG5cbn0gXG5cbiIsIi8qXHJcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDEyIE1hZGhhdiBWYWlkeWFuYXRoYW5cclxuICpcclxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XHJcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cclxuICpcclxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxyXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcclxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcclxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXHJcbiAqL1xyXG5cclxudXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uSU87XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG5cclxuICAgIC8qKiBAY2xhc3MgTWlkaU5vdGVcclxuICAgICAqIEEgTWlkaU5vdGUgY29udGFpbnNcclxuICAgICAqXHJcbiAgICAgKiBzdGFydHRpbWUgLSBUaGUgdGltZSAobWVhc3VyZWQgaW4gcHVsc2VzKSB3aGVuIHRoZSBub3RlIGlzIHByZXNzZWQuXHJcbiAgICAgKiBjaGFubmVsICAgLSBUaGUgY2hhbm5lbCB0aGUgbm90ZSBpcyBmcm9tLiAgVGhpcyBpcyB1c2VkIHdoZW4gbWF0Y2hpbmdcclxuICAgICAqICAgICAgICAgICAgIE5vdGVPZmYgZXZlbnRzIHdpdGggdGhlIGNvcnJlc3BvbmRpbmcgTm90ZU9uIGV2ZW50LlxyXG4gICAgICogICAgICAgICAgICAgVGhlIGNoYW5uZWxzIGZvciB0aGUgTm90ZU9uIGFuZCBOb3RlT2ZmIGV2ZW50cyBtdXN0IGJlXHJcbiAgICAgKiAgICAgICAgICAgICB0aGUgc2FtZS5cclxuICAgICAqIG5vdGVudW1iZXIgLSBUaGUgbm90ZSBudW1iZXIsIGZyb20gMCB0byAxMjcuICBNaWRkbGUgQyBpcyA2MC5cclxuICAgICAqIGR1cmF0aW9uICAtIFRoZSB0aW1lIGR1cmF0aW9uIChtZWFzdXJlZCBpbiBwdWxzZXMpIGFmdGVyIHdoaWNoIHRoZSBcclxuICAgICAqICAgICAgICAgICAgIG5vdGUgaXMgcmVsZWFzZWQuXHJcbiAgICAgKlxyXG4gICAgICogQSBNaWRpTm90ZSBpcyBjcmVhdGVkIHdoZW4gd2UgZW5jb3VudGVyIGEgTm90ZU9mZiBldmVudC4gIFRoZSBkdXJhdGlvblxyXG4gICAgICogaXMgaW5pdGlhbGx5IHVua25vd24gKHNldCB0byAwKS4gIFdoZW4gdGhlIGNvcnJlc3BvbmRpbmcgTm90ZU9mZiBldmVudFxyXG4gICAgICogaXMgZm91bmQsIHRoZSBkdXJhdGlvbiBpcyBzZXQgYnkgdGhlIG1ldGhvZCBOb3RlT2ZmKCkuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjbGFzcyBNaWRpTm90ZSA6IElDb21wYXJlcjxNaWRpTm90ZT5cclxuICAgIHtcclxuICAgICAgICBwcml2YXRlIGludCBpZDsgICAgICAgICAgLyoqIE5vdGUgSUQuIFRoaXMgY2FuIGJlIHVzZWQgdG8ga2VlcCB0cmFjayBvZiBjbG9uZXMgYWZ0ZXIgY2FsbHMgc3VjaCBhcyBNaWRpRmlsZS5DaGFuZ2VNaWRpTm90ZXMgICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgc3RhcnR0aW1lOyAgIC8qKiBUaGUgc3RhcnQgdGltZSwgaW4gcHVsc2VzICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgY2hhbm5lbDsgICAgIC8qKiBUaGUgY2hhbm5lbCAqL1xyXG4gICAgICAgIHByaXZhdGUgaW50IG5vdGVudW1iZXI7ICAvKiogVGhlIG5vdGUsIGZyb20gMCB0byAxMjcuIE1pZGRsZSBDIGlzIDYwICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgZHVyYXRpb247ICAgIC8qKiBUaGUgZHVyYXRpb24sIGluIHB1bHNlcyAqL1xyXG4gICAgICAgIHByaXZhdGUgaW50IHZlbG9jaXR5OyAgICAvKiogVmVsb2NpdHkgb2YgdGhlIG5vdGUsIGZyb20gMCB0byAxMjcgKi9cclxuXHJcblxyXG4gICAgICAgIC8qIENyZWF0ZSBhIG5ldyBNaWRpTm90ZS4gIFRoaXMgaXMgY2FsbGVkIHdoZW4gYSBOb3RlT24gZXZlbnQgaXNcclxuICAgICAgICAgKiBlbmNvdW50ZXJlZCBpbiB0aGUgTWlkaUZpbGUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIE1pZGlOb3RlKGludCBpZCwgaW50IHN0YXJ0dGltZSwgaW50IGNoYW5uZWwsIGludCBub3RlbnVtYmVyLCBpbnQgZHVyYXRpb24sIGludCB2ZWxvY2l0eSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgICAgICAgICAgdGhpcy5zdGFydHRpbWUgPSBzdGFydHRpbWU7XHJcbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbCA9IGNoYW5uZWw7XHJcbiAgICAgICAgICAgIHRoaXMubm90ZW51bWJlciA9IG5vdGVudW1iZXI7XHJcbiAgICAgICAgICAgIHRoaXMuZHVyYXRpb24gPSBkdXJhdGlvbjtcclxuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eSA9IHZlbG9jaXR5O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGludCBJZFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIGlkOyB9XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgcHVibGljIGludCBTdGFydFRpbWVcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdldCB7IHJldHVybiBzdGFydHRpbWU7IH1cclxuICAgICAgICAgICAgc2V0IHsgc3RhcnR0aW1lID0gdmFsdWU7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBpbnQgRW5kVGltZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIHN0YXJ0dGltZSArIGR1cmF0aW9uOyB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgaW50IENoYW5uZWxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdldCB7IHJldHVybiBjaGFubmVsOyB9XHJcbiAgICAgICAgICAgIHNldCB7IGNoYW5uZWwgPSB2YWx1ZTsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGludCBOdW1iZXJcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdldCB7IHJldHVybiBub3RlbnVtYmVyOyB9XHJcbiAgICAgICAgICAgIHNldCB7IG5vdGVudW1iZXIgPSB2YWx1ZTsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGludCBEdXJhdGlvblxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIGR1cmF0aW9uOyB9XHJcbiAgICAgICAgICAgIHNldCB7IGR1cmF0aW9uID0gdmFsdWU7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBpbnQgVmVsb2NpdHlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdldCB7IHJldHVybiB2ZWxvY2l0eTsgfVxyXG4gICAgICAgICAgICBzZXQgeyB2ZWxvY2l0eSA9IHZhbHVlOyB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiBBIE5vdGVPZmYgZXZlbnQgb2NjdXJzIGZvciB0aGlzIG5vdGUgYXQgdGhlIGdpdmVuIHRpbWUuXHJcbiAgICAgICAgICogQ2FsY3VsYXRlIHRoZSBub3RlIGR1cmF0aW9uIGJhc2VkIG9uIHRoZSBub3Rlb2ZmIGV2ZW50LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyB2b2lkIE5vdGVPZmYoaW50IGVuZHRpbWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkdXJhdGlvbiA9IGVuZHRpbWUgLSBzdGFydHRpbWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogQ29tcGFyZSB0d28gTWlkaU5vdGVzIGJhc2VkIG9uIHRoZWlyIHN0YXJ0IHRpbWVzLlxyXG4gICAgICAgICAqICBJZiB0aGUgc3RhcnQgdGltZXMgYXJlIGVxdWFsLCBjb21wYXJlIGJ5IHRoZWlyIG51bWJlcnMuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGludCBDb21wYXJlKE1pZGlOb3RlIHgsIE1pZGlOb3RlIHkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoeC5TdGFydFRpbWUgPT0geS5TdGFydFRpbWUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4geC5OdW1iZXIgLSB5Lk51bWJlcjtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHguU3RhcnRUaW1lIC0geS5TdGFydFRpbWU7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgcHVibGljIE1pZGlOb3RlIENsb25lKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWlkaU5vdGUoaWQsIHN0YXJ0dGltZSwgY2hhbm5lbCwgbm90ZW51bWJlciwgZHVyYXRpb24sIHZlbG9jaXR5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZVxyXG4gICAgICAgIHN0cmluZyBUb1N0cmluZygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzdHJpbmdbXSBzY2FsZSA9IHsgXCJBXCIsIFwiQSNcIiwgXCJCXCIsIFwiQ1wiLCBcIkMjXCIsIFwiRFwiLCBcIkQjXCIsIFwiRVwiLCBcIkZcIiwgXCJGI1wiLCBcIkdcIiwgXCJHI1wiIH07XHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiTWlkaU5vdGUgY2hhbm5lbD17MH0gbnVtYmVyPXsxfSB7Mn0gc3RhcnQ9ezN9IGR1cmF0aW9uPXs0fVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFubmVsLCBub3RlbnVtYmVyLCBzY2FsZVsobm90ZW51bWJlciArIDMpICUgMTJdLCBzdGFydHRpbWUsIGR1cmF0aW9uKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcblxyXG59ICAvKiBFbmQgbmFtZXNwYWNlIE1pZGlTaGVldE11c2ljICovXHJcblxyXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTMgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbi8qKiBAY2xhc3MgTWlkaU9wdGlvbnNcbiAqXG4gKiBUaGUgTWlkaU9wdGlvbnMgY2xhc3MgY29udGFpbnMgdGhlIGF2YWlsYWJsZSBvcHRpb25zIGZvclxuICogbW9kaWZ5aW5nIHRoZSBzaGVldCBtdXNpYyBhbmQgc291bmQuICBUaGVzZSBvcHRpb25zIGFyZVxuICogY29sbGVjdGVkIGZyb20gdGhlIG1lbnUvZGlhbG9nIHNldHRpbmdzLCBhbmQgdGhlbiBhcmUgcGFzc2VkXG4gKiB0byB0aGUgU2hlZXRNdXNpYyBhbmQgTWlkaVBsYXllciBjbGFzc2VzLlxuICovXG5wdWJsaWMgY2xhc3MgTWlkaU9wdGlvbnMge1xuXG4gICAgLy8gVGhlIHBvc3NpYmxlIHZhbHVlcyBmb3Igc2hvd05vdGVMZXR0ZXJzXG4gICAgcHVibGljIGNvbnN0IGludCBOb3RlTmFtZU5vbmUgICAgICAgICAgID0gMDtcbiAgICBwdWJsaWMgY29uc3QgaW50IE5vdGVOYW1lTGV0dGVyICAgICAgICAgPSAxO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTm90ZU5hbWVGaXhlZERvUmVNaSAgICA9IDI7XG4gICAgcHVibGljIGNvbnN0IGludCBOb3RlTmFtZU1vdmFibGVEb1JlTWkgID0gMztcbiAgICBwdWJsaWMgY29uc3QgaW50IE5vdGVOYW1lRml4ZWROdW1iZXIgICAgPSA0O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgTm90ZU5hbWVNb3ZhYmxlTnVtYmVyICA9IDU7XG5cbiAgICAvLyBTaGVldCBNdXNpYyBPcHRpb25zXG4gICAgcHVibGljIHN0cmluZyBmaWxlbmFtZTsgICAgICAgLyoqIFRoZSBmdWxsIE1pZGkgZmlsZW5hbWUgKi9cbiAgICBwdWJsaWMgc3RyaW5nIHRpdGxlOyAgICAgICAgICAvKiogVGhlIE1pZGkgc29uZyB0aXRsZSAqL1xuICAgIHB1YmxpYyBib29sW10gdHJhY2tzOyAgICAgICAgIC8qKiBXaGljaCB0cmFja3MgdG8gZGlzcGxheSAodHJ1ZSA9IGRpc3BsYXkpICovXG4gICAgcHVibGljIGJvb2wgc2Nyb2xsVmVydDsgICAgICAgLyoqIFdoZXRoZXIgdG8gc2Nyb2xsIHZlcnRpY2FsbHkgb3IgaG9yaXpvbnRhbGx5ICovXG4gICAgcHVibGljIGJvb2wgbGFyZ2VOb3RlU2l6ZTsgICAgLyoqIERpc3BsYXkgbGFyZ2Ugb3Igc21hbGwgbm90ZSBzaXplcyAqL1xuICAgIHB1YmxpYyBib29sIHR3b1N0YWZmczsgICAgICAgIC8qKiBDb21iaW5lIHRyYWNrcyBpbnRvIHR3byBzdGFmZnMgPyAqL1xuICAgIHB1YmxpYyBpbnQgc2hvd05vdGVMZXR0ZXJzOyAgICAgLyoqIFNob3cgdGhlIG5hbWUgKEEsIEEjLCBldGMpIG5leHQgdG8gdGhlIG5vdGVzICovXG4gICAgcHVibGljIGJvb2wgc2hvd0x5cmljczsgICAgICAgLyoqIFNob3cgdGhlIGx5cmljcyB1bmRlciBlYWNoIG5vdGUgKi9cbiAgICBwdWJsaWMgYm9vbCBzaG93TWVhc3VyZXM7ICAgICAvKiogU2hvdyB0aGUgbWVhc3VyZSBudW1iZXJzIGZvciBlYWNoIHN0YWZmICovXG4gICAgcHVibGljIGludCBzaGlmdHRpbWU7ICAgICAgICAgLyoqIFNoaWZ0IG5vdGUgc3RhcnR0aW1lcyBieSB0aGUgZ2l2ZW4gYW1vdW50ICovXG4gICAgcHVibGljIGludCB0cmFuc3Bvc2U7ICAgICAgICAgLyoqIFNoaWZ0IG5vdGUga2V5IHVwL2Rvd24gYnkgZ2l2ZW4gYW1vdW50ICovXG4gICAgcHVibGljIGludCBrZXk7ICAgICAgICAgICAgICAgLyoqIFVzZSB0aGUgZ2l2ZW4gS2V5U2lnbmF0dXJlIChub3Rlc2NhbGUpICovXG4gICAgcHVibGljIFRpbWVTaWduYXR1cmUgdGltZTsgICAgLyoqIFVzZSB0aGUgZ2l2ZW4gdGltZSBzaWduYXR1cmUgKi9cbiAgICBwdWJsaWMgaW50IGNvbWJpbmVJbnRlcnZhbDsgICAvKiogQ29tYmluZSBub3RlcyB3aXRoaW4gZ2l2ZW4gdGltZSBpbnRlcnZhbCAobXNlYykgKi9cbiAgICBwdWJsaWMgQ29sb3JbXSBjb2xvcnM7ICAgICAgICAvKiogVGhlIG5vdGUgY29sb3JzIHRvIHVzZSAqL1xuICAgIHB1YmxpYyBDb2xvciBzaGFkZUNvbG9yOyAgICAgIC8qKiBUaGUgY29sb3IgdG8gdXNlIGZvciBzaGFkaW5nLiAqL1xuICAgIHB1YmxpYyBDb2xvciBzaGFkZTJDb2xvcjsgICAgIC8qKiBUaGUgY29sb3IgdG8gdXNlIGZvciBzaGFkaW5nIHRoZSBsZWZ0IGhhbmQgcGlhbm8gKi9cblxuICAgIC8vIFNvdW5kIG9wdGlvbnNcbiAgICBwdWJsaWMgYm9vbCBbXW11dGU7ICAgICAgICAgICAgLyoqIFdoaWNoIHRyYWNrcyB0byBtdXRlICh0cnVlID0gbXV0ZSkgKi9cbiAgICBwdWJsaWMgaW50IHRlbXBvOyAgICAgICAgICAgICAgLyoqIFRoZSB0ZW1wbywgaW4gbWljcm9zZWNvbmRzIHBlciBxdWFydGVyIG5vdGUgKi9cbiAgICBwdWJsaWMgaW50IHBhdXNlVGltZTsgICAgICAgICAgLyoqIFN0YXJ0IHRoZSBtaWRpIG11c2ljIGF0IHRoZSBnaXZlbiBwYXVzZSB0aW1lICovXG4gICAgcHVibGljIGludFtdIGluc3RydW1lbnRzOyAgICAgIC8qKiBUaGUgaW5zdHJ1bWVudHMgdG8gdXNlIHBlciB0cmFjayAqL1xuICAgIHB1YmxpYyBib29sIHVzZURlZmF1bHRJbnN0cnVtZW50czsgIC8qKiBJZiB0cnVlLCBkb24ndCBjaGFuZ2UgaW5zdHJ1bWVudHMgKi9cbiAgICBwdWJsaWMgYm9vbCBwbGF5TWVhc3VyZXNJbkxvb3A7ICAgICAvKiogUGxheSB0aGUgc2VsZWN0ZWQgbWVhc3VyZXMgaW4gYSBsb29wICovXG4gICAgcHVibGljIGludCBwbGF5TWVhc3VyZXNJbkxvb3BTdGFydDsgLyoqIFN0YXJ0IG1lYXN1cmUgdG8gcGxheSBpbiBsb29wICovXG4gICAgcHVibGljIGludCBwbGF5TWVhc3VyZXNJbkxvb3BFbmQ7ICAgLyoqIEVuZCBtZWFzdXJlIHRvIHBsYXkgaW4gbG9vcCAqL1xuXG5cbiAgICBwdWJsaWMgTWlkaU9wdGlvbnMoKSB7XG4gICAgfVxuXG4gICAgcHVibGljIE1pZGlPcHRpb25zKE1pZGlGaWxlIG1pZGlmaWxlKSB7XG4gICAgICAgIGZpbGVuYW1lID0gbWlkaWZpbGUuRmlsZU5hbWU7XG4gICAgICAgIHRpdGxlID0gUGF0aC5HZXRGaWxlTmFtZShtaWRpZmlsZS5GaWxlTmFtZSk7XG4gICAgICAgIGludCBudW10cmFja3MgPSBtaWRpZmlsZS5UcmFja3MuQ291bnQ7XG4gICAgICAgIHRyYWNrcyA9IG5ldyBib29sW251bXRyYWNrc107XG4gICAgICAgIG11dGUgPSAgbmV3IGJvb2xbbnVtdHJhY2tzXTtcbiAgICAgICAgaW5zdHJ1bWVudHMgPSBuZXcgaW50W251bXRyYWNrc107XG4gICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgdHJhY2tzLkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0cmFja3NbaV0gPSB0cnVlO1xuICAgICAgICAgICAgbXV0ZVtpXSA9IGZhbHNlO1xuICAgICAgICAgICAgaW5zdHJ1bWVudHNbaV0gPSBtaWRpZmlsZS5UcmFja3NbaV0uSW5zdHJ1bWVudDtcbiAgICAgICAgICAgIGlmIChtaWRpZmlsZS5UcmFja3NbaV0uSW5zdHJ1bWVudE5hbWUgPT0gXCJQZXJjdXNzaW9uXCIpIHtcbiAgICAgICAgICAgICAgICB0cmFja3NbaV0gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBtdXRlW2ldID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBcbiAgICAgICAgdXNlRGVmYXVsdEluc3RydW1lbnRzID0gdHJ1ZTtcbiAgICAgICAgc2Nyb2xsVmVydCA9IHRydWU7XG4gICAgICAgIGxhcmdlTm90ZVNpemUgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRyYWNrcy5MZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgdHdvU3RhZmZzID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHR3b1N0YWZmcyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHNob3dOb3RlTGV0dGVycyA9IE5vdGVOYW1lTm9uZTtcbiAgICAgICAgc2hvd0x5cmljcyA9IHRydWU7XG4gICAgICAgIHNob3dNZWFzdXJlcyA9IGZhbHNlO1xuICAgICAgICBzaGlmdHRpbWUgPSAwO1xuICAgICAgICB0cmFuc3Bvc2UgPSAwO1xuICAgICAgICBrZXkgPSAtMTtcbiAgICAgICAgdGltZSA9IG1pZGlmaWxlLlRpbWU7XG4gICAgICAgIGNvbG9ycyA9IG51bGw7XG4gICAgICAgIHNoYWRlQ29sb3IgPSBDb2xvci5Gcm9tQXJnYigxMDAsIDUzLCAxMjMsIDI1NSk7XG4gICAgICAgIHNoYWRlMkNvbG9yID0gQ29sb3IuRnJvbUFyZ2IoODAsIDEwMCwgMjUwKTtcbiAgICAgICAgY29tYmluZUludGVydmFsID0gNDA7XG4gICAgICAgIHRlbXBvID0gbWlkaWZpbGUuVGltZS5UZW1wbztcbiAgICAgICAgcGF1c2VUaW1lID0gMDtcbiAgICAgICAgcGxheU1lYXN1cmVzSW5Mb29wID0gZmFsc2U7IFxuICAgICAgICBwbGF5TWVhc3VyZXNJbkxvb3BTdGFydCA9IDA7XG4gICAgICAgIHBsYXlNZWFzdXJlc0luTG9vcEVuZCA9IG1pZGlmaWxlLkVuZFRpbWUoKSAvIG1pZGlmaWxlLlRpbWUuTWVhc3VyZTtcbiAgICB9XG5cbiAgICAvKiBKb2luIHRoZSBhcnJheSBpbnRvIGEgY29tbWEgc2VwYXJhdGVkIHN0cmluZyAqL1xuICAgIHN0YXRpYyBzdHJpbmcgSm9pbihib29sW10gdmFsdWVzKSB7XG4gICAgICAgIFN0cmluZ0J1aWxkZXIgcmVzdWx0ID0gbmV3IFN0cmluZ0J1aWxkZXIoKTtcbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCB2YWx1ZXMuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5BcHBlbmQoXCIsXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0LkFwcGVuZCh2YWx1ZXNbaV0uVG9TdHJpbmcoKSk7IFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQuVG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgc3RyaW5nIEpvaW4oaW50W10gdmFsdWVzKSB7XG4gICAgICAgIFN0cmluZ0J1aWxkZXIgcmVzdWx0ID0gbmV3IFN0cmluZ0J1aWxkZXIoKTtcbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCB2YWx1ZXMuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5BcHBlbmQoXCIsXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0LkFwcGVuZCh2YWx1ZXNbaV0uVG9TdHJpbmcoKSk7IFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQuVG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgc3RyaW5nIEpvaW4oQ29sb3JbXSB2YWx1ZXMpIHtcbiAgICAgICAgU3RyaW5nQnVpbGRlciByZXN1bHQgPSBuZXcgU3RyaW5nQnVpbGRlcigpO1xuICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHZhbHVlcy5MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LkFwcGVuZChcIixcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHQuQXBwZW5kKENvbG9yVG9TdHJpbmcodmFsdWVzW2ldKSk7IFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQuVG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgc3RyaW5nIENvbG9yVG9TdHJpbmcoQ29sb3IgYykge1xuICAgICAgICByZXR1cm4gXCJcIiArIGMuUiArIFwiIFwiICsgYy5HICsgXCIgXCIgKyBjLkI7XG4gICAgfVxuXG4gICAgXG4gICAgLyogTWVyZ2UgaW4gdGhlIHNhdmVkIG9wdGlvbnMgdG8gdGhpcyBNaWRpT3B0aW9ucy4qL1xuICAgIHB1YmxpYyB2b2lkIE1lcmdlKE1pZGlPcHRpb25zIHNhdmVkKSB7XG4gICAgICAgIGlmIChzYXZlZC50cmFja3MgIT0gbnVsbCAmJiBzYXZlZC50cmFja3MuTGVuZ3RoID09IHRyYWNrcy5MZW5ndGgpIHtcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgdHJhY2tzLkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdHJhY2tzW2ldID0gc2F2ZWQudHJhY2tzW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChzYXZlZC5tdXRlICE9IG51bGwgJiYgc2F2ZWQubXV0ZS5MZW5ndGggPT0gbXV0ZS5MZW5ndGgpIHtcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgbXV0ZS5MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIG11dGVbaV0gPSBzYXZlZC5tdXRlW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChzYXZlZC5pbnN0cnVtZW50cyAhPSBudWxsICYmIHNhdmVkLmluc3RydW1lbnRzLkxlbmd0aCA9PSBpbnN0cnVtZW50cy5MZW5ndGgpIHtcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgaW5zdHJ1bWVudHMuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpbnN0cnVtZW50c1tpXSA9IHNhdmVkLmluc3RydW1lbnRzW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChzYXZlZC50aW1lICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRpbWUgPSBuZXcgVGltZVNpZ25hdHVyZShzYXZlZC50aW1lLk51bWVyYXRvciwgc2F2ZWQudGltZS5EZW5vbWluYXRvcixcbiAgICAgICAgICAgICAgICAgICAgc2F2ZWQudGltZS5RdWFydGVyLCBzYXZlZC50aW1lLlRlbXBvKTtcbiAgICAgICAgfVxuICAgICAgICB1c2VEZWZhdWx0SW5zdHJ1bWVudHMgPSBzYXZlZC51c2VEZWZhdWx0SW5zdHJ1bWVudHM7XG4gICAgICAgIHNjcm9sbFZlcnQgPSBzYXZlZC5zY3JvbGxWZXJ0O1xuICAgICAgICBsYXJnZU5vdGVTaXplID0gc2F2ZWQubGFyZ2VOb3RlU2l6ZTtcbiAgICAgICAgc2hvd0x5cmljcyA9IHNhdmVkLnNob3dMeXJpY3M7XG4gICAgICAgIHR3b1N0YWZmcyA9IHNhdmVkLnR3b1N0YWZmcztcbiAgICAgICAgc2hvd05vdGVMZXR0ZXJzID0gc2F2ZWQuc2hvd05vdGVMZXR0ZXJzO1xuICAgICAgICB0cmFuc3Bvc2UgPSBzYXZlZC50cmFuc3Bvc2U7XG4gICAgICAgIGtleSA9IHNhdmVkLmtleTtcbiAgICAgICAgY29tYmluZUludGVydmFsID0gc2F2ZWQuY29tYmluZUludGVydmFsO1xuICAgICAgICBpZiAoc2F2ZWQuc2hhZGVDb2xvciAhPSBDb2xvci5XaGl0ZSkge1xuICAgICAgICAgICAgc2hhZGVDb2xvciA9IHNhdmVkLnNoYWRlQ29sb3I7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNhdmVkLnNoYWRlMkNvbG9yICE9IENvbG9yLldoaXRlKSB7XG4gICAgICAgICAgICBzaGFkZTJDb2xvciA9IHNhdmVkLnNoYWRlMkNvbG9yO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzYXZlZC5jb2xvcnMgIT0gbnVsbCkge1xuICAgICAgICAgICAgY29sb3JzID0gc2F2ZWQuY29sb3JzO1xuICAgICAgICB9XG4gICAgICAgIHNob3dNZWFzdXJlcyA9IHNhdmVkLnNob3dNZWFzdXJlcztcbiAgICAgICAgcGxheU1lYXN1cmVzSW5Mb29wID0gc2F2ZWQucGxheU1lYXN1cmVzSW5Mb29wO1xuICAgICAgICBwbGF5TWVhc3VyZXNJbkxvb3BTdGFydCA9IHNhdmVkLnBsYXlNZWFzdXJlc0luTG9vcFN0YXJ0O1xuICAgICAgICBwbGF5TWVhc3VyZXNJbkxvb3BFbmQgPSBzYXZlZC5wbGF5TWVhc3VyZXNJbkxvb3BFbmQ7XG4gICAgfVxufVxuXG59XG5cblxuIiwiLypcclxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTIgTWFkaGF2IFZhaWR5YW5hdGhhblxyXG4gKlxyXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcclxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxyXG4gKlxyXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXHJcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxyXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxyXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cclxuICovXHJcblxyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5JTztcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcblxyXG4gICAgLyoqIEBjbGFzcyBNaWRpVHJhY2tcclxuICAgICAqIFRoZSBNaWRpVHJhY2sgdGFrZXMgYXMgaW5wdXQgdGhlIHJhdyBNaWRpRXZlbnRzIGZvciB0aGUgdHJhY2ssIGFuZCBnZXRzOlxyXG4gICAgICogLSBUaGUgbGlzdCBvZiBtaWRpIG5vdGVzIGluIHRoZSB0cmFjay5cclxuICAgICAqIC0gVGhlIGZpcnN0IGluc3RydW1lbnQgdXNlZCBpbiB0aGUgdHJhY2suXHJcbiAgICAgKlxyXG4gICAgICogRm9yIGVhY2ggTm90ZU9uIGV2ZW50IGluIHRoZSBtaWRpIGZpbGUsIGEgbmV3IE1pZGlOb3RlIGlzIGNyZWF0ZWRcclxuICAgICAqIGFuZCBhZGRlZCB0byB0aGUgdHJhY2ssIHVzaW5nIHRoZSBBZGROb3RlKCkgbWV0aG9kLlxyXG4gICAgICogXHJcbiAgICAgKiBUaGUgTm90ZU9mZigpIG1ldGhvZCBpcyBjYWxsZWQgd2hlbiBhIE5vdGVPZmYgZXZlbnQgaXMgZW5jb3VudGVyZWQsXHJcbiAgICAgKiBpbiBvcmRlciB0byB1cGRhdGUgdGhlIGR1cmF0aW9uIG9mIHRoZSBNaWRpTm90ZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGNsYXNzIE1pZGlUcmFja1xyXG4gICAge1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGludCBub3RlSWRDb3VudGVyID0gMDsgLyoqIENvdW50ZXIgdXNlZCB0byBnZW5lcmF0ZSB1bmlxdWUgbm90ZSBJRHMgKi9cclxuICAgICAgICBwcml2YXRlIGludCB0cmFja251bTsgICAgICAgICAgICAgLyoqIFRoZSB0cmFjayBudW1iZXIgKi9cclxuICAgICAgICBwcml2YXRlIExpc3Q8TWlkaU5vdGU+IG5vdGVzOyAgICAgLyoqIExpc3Qgb2YgTWlkaSBub3RlcyAqL1xyXG4gICAgICAgIHByaXZhdGUgaW50IGluc3RydW1lbnQ7ICAgICAgICAgICAvKiogSW5zdHJ1bWVudCBmb3IgdGhpcyB0cmFjayAqL1xyXG4gICAgICAgIHByaXZhdGUgTGlzdDxNaWRpRXZlbnQ+IGx5cmljczsgICAvKiogVGhlIGx5cmljcyBpbiB0aGlzIHRyYWNrICovXHJcblxyXG4gICAgICAgIC8qKiBDcmVhdGUgYW4gZW1wdHkgTWlkaVRyYWNrLiAgVXNlZCBieSB0aGUgQ2xvbmUgbWV0aG9kICovXHJcbiAgICAgICAgcHVibGljIE1pZGlUcmFjayhpbnQgdHJhY2tudW0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnRyYWNrbnVtID0gdHJhY2tudW07XHJcbiAgICAgICAgICAgIG5vdGVzID0gbmV3IExpc3Q8TWlkaU5vdGU+KDIwKTtcclxuICAgICAgICAgICAgaW5zdHJ1bWVudCA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogQ3JlYXRlIGEgTWlkaVRyYWNrIGJhc2VkIG9uIHRoZSBNaWRpIGV2ZW50cy4gIEV4dHJhY3QgdGhlIE5vdGVPbi9Ob3RlT2ZmXHJcbiAgICAgICAgICogIGV2ZW50cyB0byBnYXRoZXIgdGhlIGxpc3Qgb2YgTWlkaU5vdGVzLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBNaWRpVHJhY2soTGlzdDxNaWRpRXZlbnQ+IGV2ZW50cywgaW50IHRyYWNrbnVtKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy50cmFja251bSA9IHRyYWNrbnVtO1xyXG4gICAgICAgICAgICBub3RlcyA9IG5ldyBMaXN0PE1pZGlOb3RlPihldmVudHMuQ291bnQpO1xyXG4gICAgICAgICAgICBpbnN0cnVtZW50ID0gMDtcclxuXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBtZXZlbnQgaW4gZXZlbnRzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBNaWRpRmlsZS5FdmVudE5vdGVPbiAmJiBtZXZlbnQuVmVsb2NpdHkgPiAwKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIE1pZGlOb3RlIG5vdGUgPSBuZXcgTWlkaU5vdGUobm90ZUlkQ291bnRlcisrLCBtZXZlbnQuU3RhcnRUaW1lLCBtZXZlbnQuQ2hhbm5lbCwgbWV2ZW50Lk5vdGVudW1iZXIsIDAsIG1ldmVudC5WZWxvY2l0eSk7XHJcbiAgICAgICAgICAgICAgICAgICAgQWRkTm90ZShub3RlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1ldmVudC5FdmVudEZsYWcgPT0gTWlkaUZpbGUuRXZlbnROb3RlT24gJiYgbWV2ZW50LlZlbG9jaXR5ID09IDApXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgTm90ZU9mZihtZXZlbnQuQ2hhbm5lbCwgbWV2ZW50Lk5vdGVudW1iZXIsIG1ldmVudC5TdGFydFRpbWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBNaWRpRmlsZS5FdmVudE5vdGVPZmYpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgTm90ZU9mZihtZXZlbnQuQ2hhbm5lbCwgbWV2ZW50Lk5vdGVudW1iZXIsIG1ldmVudC5TdGFydFRpbWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50LkV2ZW50RmxhZyA9PSBNaWRpRmlsZS5FdmVudFByb2dyYW1DaGFuZ2UpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5zdHJ1bWVudCA9IG1ldmVudC5JbnN0cnVtZW50O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobWV2ZW50Lk1ldGFldmVudCA9PSBNaWRpRmlsZS5NZXRhRXZlbnRMeXJpYylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBBZGRMeXJpYyhtZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChub3Rlcy5Db3VudCA+IDAgJiYgbm90ZXNbMF0uQ2hhbm5lbCA9PSA5KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnN0cnVtZW50ID0gMTI4OyAgLyogUGVyY3Vzc2lvbiAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGludCBseXJpY2NvdW50ID0gMDtcclxuICAgICAgICAgICAgaWYgKGx5cmljcyAhPSBudWxsKSB7IGx5cmljY291bnQgPSBseXJpY3MuQ291bnQ7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBpbnQgTnVtYmVyXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gdHJhY2tudW07IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBMaXN0PE1pZGlOb3RlPiBOb3Rlc1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIG5vdGVzOyB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgaW50IEluc3RydW1lbnRcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdldCB7IHJldHVybiBpbnN0cnVtZW50OyB9XHJcbiAgICAgICAgICAgIHNldCB7IGluc3RydW1lbnQgPSB2YWx1ZTsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0cmluZyBJbnN0cnVtZW50TmFtZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChpbnN0cnVtZW50ID49IDAgJiYgaW5zdHJ1bWVudCA8PSAxMjgpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1pZGlGaWxlLkluc3RydW1lbnRzW2luc3RydW1lbnRdO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgTGlzdDxNaWRpRXZlbnQ+IEx5cmljc1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIGx5cmljczsgfVxyXG4gICAgICAgICAgICBzZXQgeyBseXJpY3MgPSB2YWx1ZTsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIEFkZCBhIE1pZGlOb3RlIHRvIHRoaXMgdHJhY2suICBUaGlzIGlzIGNhbGxlZCBmb3IgZWFjaCBOb3RlT24gZXZlbnQgKi9cclxuICAgICAgICBwdWJsaWMgdm9pZCBBZGROb3RlKE1pZGlOb3RlIG0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBub3Rlcy5BZGQobSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogQSBOb3RlT2ZmIGV2ZW50IG9jY3VyZWQuICBGaW5kIHRoZSBNaWRpTm90ZSBvZiB0aGUgY29ycmVzcG9uZGluZ1xyXG4gICAgICAgICAqIE5vdGVPbiBldmVudCwgYW5kIHVwZGF0ZSB0aGUgZHVyYXRpb24gb2YgdGhlIE1pZGlOb3RlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyB2b2lkIE5vdGVPZmYoaW50IGNoYW5uZWwsIGludCBub3RlbnVtYmVyLCBpbnQgZW5kdGltZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSBub3Rlcy5Db3VudCAtIDE7IGkgPj0gMDsgaS0tKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBNaWRpTm90ZSBub3RlID0gbm90ZXNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAobm90ZS5DaGFubmVsID09IGNoYW5uZWwgJiYgbm90ZS5OdW1iZXIgPT0gbm90ZW51bWJlciAmJlxyXG4gICAgICAgICAgICAgICAgICAgIG5vdGUuRHVyYXRpb24gPT0gMClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBub3RlLk5vdGVPZmYoZW5kdGltZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogQWRkIGEgTHlyaWMgTWlkaUV2ZW50ICovXHJcbiAgICAgICAgcHVibGljIHZvaWQgQWRkTHlyaWMoTWlkaUV2ZW50IG1ldmVudClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChseXJpY3MgPT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbHlyaWNzID0gbmV3IExpc3Q8TWlkaUV2ZW50PigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGx5cmljcy5BZGQobWV2ZW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBSZXR1cm4gYSBkZWVwIGNvcHkgY2xvbmUgb2YgdGhpcyBNaWRpVHJhY2suICovXHJcbiAgICAgICAgcHVibGljIE1pZGlUcmFjayBDbG9uZSgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBNaWRpVHJhY2sgdHJhY2sgPSBuZXcgTWlkaVRyYWNrKE51bWJlcik7XHJcbiAgICAgICAgICAgIHRyYWNrLmluc3RydW1lbnQgPSBpbnN0cnVtZW50O1xyXG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIG5vdGVzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0cmFjay5ub3Rlcy5BZGQobm90ZS5DbG9uZSgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobHlyaWNzICE9IG51bGwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRyYWNrLmx5cmljcyA9IG5ldyBMaXN0PE1pZGlFdmVudD4oKTtcclxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKE1pZGlFdmVudCBldiBpbiBseXJpY3MpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJhY2subHlyaWNzLkFkZChldik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRyYWNrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgc3RyaW5nIFRvU3RyaW5nKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0cmluZyByZXN1bHQgPSBcIlRyYWNrIG51bWJlcj1cIiArIHRyYWNrbnVtICsgXCIgaW5zdHJ1bWVudD1cIiArIGluc3RydW1lbnQgKyBcIlxcblwiO1xyXG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBuIGluIG5vdGVzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgKyBuICsgXCJcXG5cIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXN1bHQgKz0gXCJFbmQgVHJhY2tcXG5cIjtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogRW51bWVyYXRpb24gb2YgdGhlIG5vdGVzIGluIGEgc2NhbGUgKEEsIEEjLCAuLi4gRyMpICovXG5wdWJsaWMgY2xhc3MgTm90ZVNjYWxlIHtcbiAgICBwdWJsaWMgY29uc3QgaW50IEEgICAgICA9IDA7XG4gICAgcHVibGljIGNvbnN0IGludCBBc2hhcnAgPSAxO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQmZsYXQgID0gMTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEIgICAgICA9IDI7XG4gICAgcHVibGljIGNvbnN0IGludCBDICAgICAgPSAzO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQ3NoYXJwID0gNDtcbiAgICBwdWJsaWMgY29uc3QgaW50IERmbGF0ICA9IDQ7XG4gICAgcHVibGljIGNvbnN0IGludCBEICAgICAgPSA1O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRHNoYXJwID0gNjtcbiAgICBwdWJsaWMgY29uc3QgaW50IEVmbGF0ICA9IDY7XG4gICAgcHVibGljIGNvbnN0IGludCBFICAgICAgPSA3O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRiAgICAgID0gODtcbiAgICBwdWJsaWMgY29uc3QgaW50IEZzaGFycCA9IDk7XG4gICAgcHVibGljIGNvbnN0IGludCBHZmxhdCAgPSA5O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRyAgICAgID0gMTA7XG4gICAgcHVibGljIGNvbnN0IGludCBHc2hhcnAgPSAxMTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEFmbGF0ICA9IDExO1xuXG4gICAgLyoqIENvbnZlcnQgYSBub3RlIChBLCBBIywgQiwgZXRjKSBhbmQgb2N0YXZlIGludG8gYVxuICAgICAqIE1pZGkgTm90ZSBudW1iZXIuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBpbnQgVG9OdW1iZXIoaW50IG5vdGVzY2FsZSwgaW50IG9jdGF2ZSkge1xuICAgICAgICByZXR1cm4gOSArIG5vdGVzY2FsZSArIG9jdGF2ZSAqIDEyO1xuICAgIH1cblxuICAgIC8qKiBDb252ZXJ0IGEgTWlkaSBub3RlIG51bWJlciBpbnRvIGEgbm90ZXNjYWxlIChBLCBBIywgQikgKi9cbiAgICBwdWJsaWMgc3RhdGljIGludCBGcm9tTnVtYmVyKGludCBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIChudW1iZXIgKyAzKSAlIDEyO1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdHJ1ZSBpZiB0aGlzIG5vdGVzY2FsZSBudW1iZXIgaXMgYSBibGFjayBrZXkgKi9cbiAgICBwdWJsaWMgc3RhdGljIGJvb2wgSXNCbGFja0tleShpbnQgbm90ZXNjYWxlKSB7XG4gICAgICAgIGlmIChub3Rlc2NhbGUgPT0gQXNoYXJwIHx8XG4gICAgICAgICAgICBub3Rlc2NhbGUgPT0gQ3NoYXJwIHx8XG4gICAgICAgICAgICBub3Rlc2NhbGUgPT0gRHNoYXJwIHx8XG4gICAgICAgICAgICBub3Rlc2NhbGUgPT0gRnNoYXJwIHx8XG4gICAgICAgICAgICBub3Rlc2NhbGUgPT0gR3NoYXJwKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbi8qKiBAY2xhc3MgV2hpdGVOb3RlXG4gKiBUaGUgV2hpdGVOb3RlIGNsYXNzIHJlcHJlc2VudHMgYSB3aGl0ZSBrZXkgbm90ZSwgYSBub24tc2hhcnAsXG4gKiBub24tZmxhdCBub3RlLiAgVG8gZGlzcGxheSBtaWRpIG5vdGVzIGFzIHNoZWV0IG11c2ljLCB0aGUgbm90ZXNcbiAqIG11c3QgYmUgY29udmVydGVkIHRvIHdoaXRlIG5vdGVzIGFuZCBhY2NpZGVudGFscy4gXG4gKlxuICogV2hpdGUgbm90ZXMgY29uc2lzdCBvZiBhIGxldHRlciAoQSB0aHJ1IEcpIGFuZCBhbiBvY3RhdmUgKDAgdGhydSAxMCkuXG4gKiBUaGUgb2N0YXZlIGNoYW5nZXMgZnJvbSBHIHRvIEEuICBBZnRlciBHMiBjb21lcyBBMy4gIE1pZGRsZS1DIGlzIEM0LlxuICpcbiAqIFRoZSBtYWluIG9wZXJhdGlvbnMgYXJlIGNhbGN1bGF0aW5nIGRpc3RhbmNlcyBiZXR3ZWVuIG5vdGVzLCBhbmQgY29tcGFyaW5nIG5vdGVzLlxuICovIFxuXG5wdWJsaWMgY2xhc3MgV2hpdGVOb3RlIDogSUNvbXBhcmVyPFdoaXRlTm90ZT4ge1xuXG4gICAgLyogVGhlIHBvc3NpYmxlIG5vdGUgbGV0dGVycyAqL1xuICAgIHB1YmxpYyBjb25zdCBpbnQgQSA9IDA7XG4gICAgcHVibGljIGNvbnN0IGludCBCID0gMTtcbiAgICBwdWJsaWMgY29uc3QgaW50IEMgPSAyO1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRCA9IDM7XG4gICAgcHVibGljIGNvbnN0IGludCBFID0gNDtcbiAgICBwdWJsaWMgY29uc3QgaW50IEYgPSA1O1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRyA9IDY7XG5cbiAgICAvKiBDb21tb24gd2hpdGUgbm90ZXMgdXNlZCBpbiBjYWxjdWxhdGlvbnMgKi9cbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBUb3BUcmVibGUgPSBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5FLCA1KTtcbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBCb3R0b21UcmVibGUgPSBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5GLCA0KTtcbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBUb3BCYXNzID0gbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuRywgMyk7XG4gICAgcHVibGljIHN0YXRpYyBXaGl0ZU5vdGUgQm90dG9tQmFzcyA9IG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkEsIDMpO1xuICAgIHB1YmxpYyBzdGF0aWMgV2hpdGVOb3RlIE1pZGRsZUMgPSBuZXcgV2hpdGVOb3RlKFdoaXRlTm90ZS5DLCA0KTtcblxuICAgIHByaXZhdGUgaW50IGxldHRlcjsgIC8qIFRoZSBsZXR0ZXIgb2YgdGhlIG5vdGUsIEEgdGhydSBHICovXG4gICAgcHJpdmF0ZSBpbnQgb2N0YXZlOyAgLyogVGhlIG9jdGF2ZSwgMCB0aHJ1IDEwLiAqL1xuXG4gICAgLyogR2V0IHRoZSBsZXR0ZXIgKi9cbiAgICBwdWJsaWMgaW50IExldHRlciB7XG4gICAgICAgIGdldCB7IHJldHVybiBsZXR0ZXI7IH1cbiAgICB9XG5cbiAgICAvKiBHZXQgdGhlIG9jdGF2ZSAqL1xuICAgIHB1YmxpYyBpbnQgT2N0YXZlIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIG9jdGF2ZTsgfVxuICAgIH1cblxuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBub3RlIHdpdGggdGhlIGdpdmVuIGxldHRlciBhbmQgb2N0YXZlLiAqL1xuICAgIHB1YmxpYyBXaGl0ZU5vdGUoaW50IGxldHRlciwgaW50IG9jdGF2ZSkge1xuICAgICAgICBpZiAoIShsZXR0ZXIgPj0gMCAmJiBsZXR0ZXIgPD0gNikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBTeXN0ZW0uQXJndW1lbnRFeGNlcHRpb24oXCJMZXR0ZXIgXCIgKyBsZXR0ZXIgKyBcIiBpcyBpbmNvcnJlY3RcIik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxldHRlciA9IGxldHRlcjtcbiAgICAgICAgdGhpcy5vY3RhdmUgPSBvY3RhdmU7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgZGlzdGFuY2UgKGluIHdoaXRlIG5vdGVzKSBiZXR3ZWVuIHRoaXMgbm90ZVxuICAgICAqIGFuZCBub3RlIHcsIGkuZS4gIHRoaXMgLSB3LiAgRm9yIGV4YW1wbGUsIEM0IC0gQTQgPSAyLFxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgRGlzdChXaGl0ZU5vdGUgdykge1xuICAgICAgICByZXR1cm4gKG9jdGF2ZSAtIHcub2N0YXZlKSAqIDcgKyAobGV0dGVyIC0gdy5sZXR0ZXIpO1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhpcyBub3RlIHBsdXMgdGhlIGdpdmVuIGFtb3VudCAoaW4gd2hpdGUgbm90ZXMpLlxuICAgICAqIFRoZSBhbW91bnQgbWF5IGJlIHBvc2l0aXZlIG9yIG5lZ2F0aXZlLiAgRm9yIGV4YW1wbGUsXG4gICAgICogQTQgKyAyID0gQzQsIGFuZCBDNCArICgtMikgPSBBNC5cbiAgICAgKi9cbiAgICBwdWJsaWMgV2hpdGVOb3RlIEFkZChpbnQgYW1vdW50KSB7XG4gICAgICAgIGludCBudW0gPSBvY3RhdmUgKiA3ICsgbGV0dGVyO1xuICAgICAgICBudW0gKz0gYW1vdW50O1xuICAgICAgICBpZiAobnVtIDwgMCkge1xuICAgICAgICAgICAgbnVtID0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFdoaXRlTm90ZShudW0gJSA3LCBudW0gLyA3KTtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBtaWRpIG5vdGUgbnVtYmVyIGNvcnJlc3BvbmRpbmcgdG8gdGhpcyB3aGl0ZSBub3RlLlxuICAgICAqIFRoZSBtaWRpIG5vdGUgbnVtYmVycyBjb3ZlciBhbGwga2V5cywgaW5jbHVkaW5nIHNoYXJwcy9mbGF0cyxcbiAgICAgKiBzbyBlYWNoIG9jdGF2ZSBpcyAxMiBub3Rlcy4gIE1pZGRsZSBDIChDNCkgaXMgNjAuICBTb21lIGV4YW1wbGVcbiAgICAgKiBudW1iZXJzIGZvciB2YXJpb3VzIG5vdGVzOlxuICAgICAqXG4gICAgICogIEEgMiA9IDMzXG4gICAgICogIEEjMiA9IDM0XG4gICAgICogIEcgMiA9IDQzXG4gICAgICogIEcjMiA9IDQ0IFxuICAgICAqICBBIDMgPSA0NVxuICAgICAqICBBIDQgPSA1N1xuICAgICAqICBBIzQgPSA1OFxuICAgICAqICBCIDQgPSA1OVxuICAgICAqICBDIDQgPSA2MFxuICAgICAqL1xuXG4gICAgcHVibGljIGludCBOdW1iZXIoKSB7XG4gICAgICAgIGludCBvZmZzZXQgPSAwO1xuICAgICAgICBzd2l0Y2ggKGxldHRlcikge1xuICAgICAgICAgICAgY2FzZSBBOiBvZmZzZXQgPSBOb3RlU2NhbGUuQTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEI6IG9mZnNldCA9IE5vdGVTY2FsZS5COyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQzogb2Zmc2V0ID0gTm90ZVNjYWxlLkM7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBEOiBvZmZzZXQgPSBOb3RlU2NhbGUuRDsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEU6IG9mZnNldCA9IE5vdGVTY2FsZS5FOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgRjogb2Zmc2V0ID0gTm90ZVNjYWxlLkY7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBHOiBvZmZzZXQgPSBOb3RlU2NhbGUuRzsgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OiBvZmZzZXQgPSAwOyBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTm90ZVNjYWxlLlRvTnVtYmVyKG9mZnNldCwgb2N0YXZlKTtcbiAgICB9XG5cbiAgICAvKiogQ29tcGFyZSB0aGUgdHdvIG5vdGVzLiAgUmV0dXJuXG4gICAgICogIDwgMCAgaWYgeCBpcyBsZXNzIChsb3dlcikgdGhhbiB5XG4gICAgICogICAgMCAgaWYgeCBpcyBlcXVhbCB0byB5XG4gICAgICogID4gMCAgaWYgeCBpcyBncmVhdGVyIChoaWdoZXIpIHRoYW4geVxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgQ29tcGFyZShXaGl0ZU5vdGUgeCwgV2hpdGVOb3RlIHkpIHtcbiAgICAgICAgcmV0dXJuIHguRGlzdCh5KTtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBoaWdoZXIgbm90ZSwgeCBvciB5ICovXG4gICAgcHVibGljIHN0YXRpYyBXaGl0ZU5vdGUgTWF4KFdoaXRlTm90ZSB4LCBXaGl0ZU5vdGUgeSkge1xuICAgICAgICBpZiAoeC5EaXN0KHkpID4gMClcbiAgICAgICAgICAgIHJldHVybiB4O1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4geTtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBsb3dlciBub3RlLCB4IG9yIHkgKi9cbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBNaW4oV2hpdGVOb3RlIHgsIFdoaXRlTm90ZSB5KSB7XG4gICAgICAgIGlmICh4LkRpc3QoeSkgPCAwKVxuICAgICAgICAgICAgcmV0dXJuIHg7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB5O1xuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIHRvcCBub3RlIGluIHRoZSBzdGFmZiBvZiB0aGUgZ2l2ZW4gY2xlZiAqL1xuICAgIHB1YmxpYyBzdGF0aWMgV2hpdGVOb3RlIFRvcChDbGVmIGNsZWYpIHtcbiAgICAgICAgaWYgKGNsZWYgPT0gQ2xlZi5UcmVibGUpXG4gICAgICAgICAgICByZXR1cm4gVG9wVHJlYmxlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gVG9wQmFzcztcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBib3R0b20gbm90ZSBpbiB0aGUgc3RhZmYgb2YgdGhlIGdpdmVuIGNsZWYgKi9cbiAgICBwdWJsaWMgc3RhdGljIFdoaXRlTm90ZSBCb3R0b20oQ2xlZiBjbGVmKSB7XG4gICAgICAgIGlmIChjbGVmID09IENsZWYuVHJlYmxlKVxuICAgICAgICAgICAgcmV0dXJuIEJvdHRvbVRyZWJsZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIEJvdHRvbUJhc3M7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgc3RyaW5nIDxsZXR0ZXI+PG9jdGF2ZT4gZm9yIHRoaXMgbm90ZS4gKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgXG4gICAgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICBzdHJpbmdbXSBzID0geyBcIkFcIiwgXCJCXCIsIFwiQ1wiLCBcIkRcIiwgXCJFXCIsIFwiRlwiLCBcIkdcIiB9O1xuICAgICAgICByZXR1cm4gc1tsZXR0ZXJdICsgb2N0YXZlO1xuICAgIH1cbn1cblxuXG5cbn1cbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBQYWludEV2ZW50QXJnc1xyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBSZWN0YW5nbGUgQ2xpcFJlY3RhbmdsZSB7IGdldDsgc2V0OyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBHcmFwaGljcyBHcmFwaGljcygpIHsgcmV0dXJuIG5ldyBHcmFwaGljcyhcIm1haW5cIik7IH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgUGFuZWxcclxuICAgIHtcclxuICAgICAgICBwcml2YXRlIFBvaW50IGF1dG9TY3JvbGxQb3NpdGlvbj1uZXcgUG9pbnQoMCwwKTtcclxuICAgICAgICBwdWJsaWMgUG9pbnQgQXV0b1Njcm9sbFBvc2l0aW9uIHsgZ2V0IHsgcmV0dXJuIGF1dG9TY3JvbGxQb3NpdGlvbjsgfSBzZXQgeyBhdXRvU2Nyb2xsUG9zaXRpb24gPSB2YWx1ZTsgfSB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBpbnQgV2lkdGg7XHJcbiAgICAgICAgcHVibGljIGludCBIZWlnaHQ7XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIHN0YXRpYyBjbGFzcyBQYXRoXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBzdHJpbmcgR2V0RmlsZU5hbWUoc3RyaW5nIGZpbGVuYW1lKSB7IHJldHVybiBudWxsOyB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFBlblxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBDb2xvciBDb2xvcjtcclxuICAgICAgICBwdWJsaWMgaW50IFdpZHRoO1xyXG4gICAgICAgIHB1YmxpYyBMaW5lQ2FwIEVuZENhcDtcclxuXHJcbiAgICAgICAgcHVibGljIFBlbihDb2xvciBjb2xvciwgaW50IHdpZHRoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQ29sb3IgPSBjb2xvcjtcclxuICAgICAgICAgICAgV2lkdGggPSB3aWR0aDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFBvaW50XHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIGludCBYO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgWTtcclxuXHJcbiAgICAgICAgcHVibGljIFBvaW50KGludCB4LCBpbnQgeSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFggPSB4O1xyXG4gICAgICAgICAgICBZID0geTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFJlY3RhbmdsZVxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBpbnQgWDtcclxuICAgICAgICBwdWJsaWMgaW50IFk7XHJcbiAgICAgICAgcHVibGljIGludCBXaWR0aDtcclxuICAgICAgICBwdWJsaWMgaW50IEhlaWdodDtcclxuXHJcbiAgICAgICAgcHVibGljIFJlY3RhbmdsZShpbnQgeCwgaW50IHksIGludCB3aWR0aCwgaW50IGhlaWdodClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFggPSB4O1xyXG4gICAgICAgICAgICBZID0geTtcclxuICAgICAgICAgICAgV2lkdGggPSB3aWR0aDtcclxuICAgICAgICAgICAgSGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcblxyXG4gICAgLyogQGNsYXNzIFN0YWZmXHJcbiAgICAgKiBUaGUgU3RhZmYgaXMgdXNlZCB0byBkcmF3IGEgc2luZ2xlIFN0YWZmIChhIHJvdyBvZiBtZWFzdXJlcykgaW4gdGhlIFxyXG4gICAgICogU2hlZXRNdXNpYyBDb250cm9sLiBBIFN0YWZmIG5lZWRzIHRvIGRyYXdcclxuICAgICAqIC0gVGhlIENsZWZcclxuICAgICAqIC0gVGhlIGtleSBzaWduYXR1cmVcclxuICAgICAqIC0gVGhlIGhvcml6b250YWwgbGluZXNcclxuICAgICAqIC0gQSBsaXN0IG9mIE11c2ljU3ltYm9sc1xyXG4gICAgICogLSBUaGUgbGVmdCBhbmQgcmlnaHQgdmVydGljYWwgbGluZXNcclxuICAgICAqXHJcbiAgICAgKiBUaGUgaGVpZ2h0IG9mIHRoZSBTdGFmZiBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBudW1iZXIgb2YgcGl4ZWxzIGVhY2hcclxuICAgICAqIE11c2ljU3ltYm9sIGV4dGVuZHMgYWJvdmUgYW5kIGJlbG93IHRoZSBzdGFmZi5cclxuICAgICAqXHJcbiAgICAgKiBUaGUgdmVydGljYWwgbGluZXMgKGxlZnQgYW5kIHJpZ2h0IHNpZGVzKSBvZiB0aGUgc3RhZmYgYXJlIGpvaW5lZFxyXG4gICAgICogd2l0aCB0aGUgc3RhZmZzIGFib3ZlIGFuZCBiZWxvdyBpdCwgd2l0aCBvbmUgZXhjZXB0aW9uLiAgXHJcbiAgICAgKiBUaGUgbGFzdCB0cmFjayBpcyBub3Qgam9pbmVkIHdpdGggdGhlIGZpcnN0IHRyYWNrLlxyXG4gICAgICovXHJcblxyXG4gICAgcHVibGljIGNsYXNzIFN0YWZmXHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSBMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzOyAgLyoqIFRoZSBtdXNpYyBzeW1ib2xzIGluIHRoaXMgc3RhZmYgKi9cclxuICAgICAgICBwcml2YXRlIExpc3Q8THlyaWNTeW1ib2w+IGx5cmljczsgICAvKiogVGhlIGx5cmljcyB0byBkaXNwbGF5IChjYW4gYmUgbnVsbCkgKi9cclxuICAgICAgICBwcml2YXRlIGludCB5dG9wOyAgICAgICAgICAgICAgICAgICAvKiogVGhlIHkgcGl4ZWwgb2YgdGhlIHRvcCBvZiB0aGUgc3RhZmYgKi9cclxuICAgICAgICBwcml2YXRlIENsZWZTeW1ib2wgY2xlZnN5bTsgICAgICAgICAvKiogVGhlIGxlZnQtc2lkZSBDbGVmIHN5bWJvbCAqL1xyXG4gICAgICAgIHByaXZhdGUgQWNjaWRTeW1ib2xbXSBrZXlzOyAgICAgICAgIC8qKiBUaGUga2V5IHNpZ25hdHVyZSBzeW1ib2xzICovXHJcbiAgICAgICAgcHJpdmF0ZSBib29sIHNob3dNZWFzdXJlczsgICAgICAgICAgLyoqIElmIHRydWUsIHNob3cgdGhlIG1lYXN1cmUgbnVtYmVycyAqL1xyXG4gICAgICAgIHByaXZhdGUgaW50IGtleXNpZ1dpZHRoOyAgICAgICAgICAgIC8qKiBUaGUgd2lkdGggb2YgdGhlIGNsZWYgYW5kIGtleSBzaWduYXR1cmUgKi9cclxuICAgICAgICBwcml2YXRlIGludCB3aWR0aDsgICAgICAgICAgICAgICAgICAvKiogVGhlIHdpZHRoIG9mIHRoZSBzdGFmZiBpbiBwaXhlbHMgKi9cclxuICAgICAgICBwcml2YXRlIGludCBoZWlnaHQ7ICAgICAgICAgICAgICAgICAvKiogVGhlIGhlaWdodCBvZiB0aGUgc3RhZmYgaW4gcGl4ZWxzICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgdHJhY2tudW07ICAgICAgICAgICAgICAgLyoqIFRoZSB0cmFjayB0aGlzIHN0YWZmIHJlcHJlc2VudHMgKi9cclxuICAgICAgICBwcml2YXRlIGludCB0b3RhbHRyYWNrczsgICAgICAgICAgICAvKiogVGhlIHRvdGFsIG51bWJlciBvZiB0cmFja3MgKi9cclxuICAgICAgICBwcml2YXRlIGludCBzdGFydHRpbWU7ICAgICAgICAgICAgICAvKiogVGhlIHRpbWUgKGluIHB1bHNlcykgb2YgZmlyc3Qgc3ltYm9sICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgZW5kdGltZTsgICAgICAgICAgICAgICAgLyoqIFRoZSB0aW1lIChpbiBwdWxzZXMpIG9mIGxhc3Qgc3ltYm9sICovXHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgbWVhc3VyZUxlbmd0aDsgICAgICAgICAgLyoqIFRoZSB0aW1lIChpbiBwdWxzZXMpIG9mIGEgbWVhc3VyZSAqL1xyXG5cclxuICAgICAgICAvKiogQ3JlYXRlIGEgbmV3IHN0YWZmIHdpdGggdGhlIGdpdmVuIGxpc3Qgb2YgbXVzaWMgc3ltYm9scyxcbiAgICAgICAgICogYW5kIHRoZSBnaXZlbiBrZXkgc2lnbmF0dXJlLiAgVGhlIGNsZWYgaXMgZGV0ZXJtaW5lZCBieVxuICAgICAgICAgKiB0aGUgY2xlZiBvZiB0aGUgZmlyc3QgY2hvcmQgc3ltYm9sLiBUaGUgdHJhY2sgbnVtYmVyIGlzIHVzZWRcbiAgICAgICAgICogdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdG8gam9pbiB0aGlzIGxlZnQvcmlnaHQgdmVydGljYWwgc2lkZXNcbiAgICAgICAgICogd2l0aCB0aGUgc3RhZmZzIGFib3ZlIGFuZCBiZWxvdy4gVGhlIFNoZWV0TXVzaWNPcHRpb25zIGFyZSB1c2VkXG4gICAgICAgICAqIHRvIGNoZWNrIHdoZXRoZXIgdG8gZGlzcGxheSBtZWFzdXJlIG51bWJlcnMgb3Igbm90LlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgU3RhZmYoTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scywgS2V5U2lnbmF0dXJlIGtleSxcclxuICAgICAgICAgICAgICAgICAgICAgTWlkaU9wdGlvbnMgb3B0aW9ucyxcclxuICAgICAgICAgICAgICAgICAgICAgaW50IHRyYWNrbnVtLCBpbnQgdG90YWx0cmFja3MpXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICAgICAga2V5c2lnV2lkdGggPSBTaGVldE11c2ljLktleVNpZ25hdHVyZVdpZHRoKGtleSk7XHJcbiAgICAgICAgICAgIHRoaXMudHJhY2tudW0gPSB0cmFja251bTtcclxuICAgICAgICAgICAgdGhpcy50b3RhbHRyYWNrcyA9IHRvdGFsdHJhY2tzO1xyXG4gICAgICAgICAgICBzaG93TWVhc3VyZXMgPSAob3B0aW9ucy5zaG93TWVhc3VyZXMgJiYgdHJhY2tudW0gPT0gMCk7XHJcbiAgICAgICAgICAgIG1lYXN1cmVMZW5ndGggPSBvcHRpb25zLnRpbWUuTWVhc3VyZTtcclxuICAgICAgICAgICAgQ2xlZiBjbGVmID0gRmluZENsZWYoc3ltYm9scyk7XHJcblxyXG4gICAgICAgICAgICBjbGVmc3ltID0gbmV3IENsZWZTeW1ib2woY2xlZiwgMCwgZmFsc2UpO1xyXG4gICAgICAgICAgICBrZXlzID0ga2V5LkdldFN5bWJvbHMoY2xlZik7XHJcbiAgICAgICAgICAgIHRoaXMuc3ltYm9scyA9IHN5bWJvbHM7XHJcbiAgICAgICAgICAgIENhbGN1bGF0ZVdpZHRoKG9wdGlvbnMuc2Nyb2xsVmVydCk7XHJcbiAgICAgICAgICAgIENhbGN1bGF0ZUhlaWdodCgpO1xyXG4gICAgICAgICAgICBDYWxjdWxhdGVTdGFydEVuZFRpbWUoKTtcclxuICAgICAgICAgICAgRnVsbEp1c3RpZnkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBSZXR1cm4gdGhlIHdpZHRoIG9mIHRoZSBzdGFmZiAqL1xyXG4gICAgICAgIHB1YmxpYyBpbnQgV2lkdGhcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdldCB7IHJldHVybiB3aWR0aDsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFJldHVybiB0aGUgaGVpZ2h0IG9mIHRoZSBzdGFmZiAqL1xyXG4gICAgICAgIHB1YmxpYyBpbnQgSGVpZ2h0XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gaGVpZ2h0OyB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogUmV0dXJuIHRoZSB0cmFjayBudW1iZXIgb2YgdGhpcyBzdGFmZiAoc3RhcnRpbmcgZnJvbSAwICovXHJcbiAgICAgICAgcHVibGljIGludCBUcmFja1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIHRyYWNrbnVtOyB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogUmV0dXJuIHRoZSBzdGFydGluZyB0aW1lIG9mIHRoZSBzdGFmZiwgdGhlIHN0YXJ0IHRpbWUgb2ZcbiAgICAgICAgICogIHRoZSBmaXJzdCBzeW1ib2wuICBUaGlzIGlzIHVzZWQgZHVyaW5nIHBsYXliYWNrLCB0byBcbiAgICAgICAgICogIGF1dG9tYXRpY2FsbHkgc2Nyb2xsIHRoZSBtdXNpYyB3aGlsZSBwbGF5aW5nLlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgaW50IFN0YXJ0VGltZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIHN0YXJ0dGltZTsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFJldHVybiB0aGUgZW5kaW5nIHRpbWUgb2YgdGhlIHN0YWZmLCB0aGUgZW5kdGltZSBvZlxuICAgICAgICAgKiAgdGhlIGxhc3Qgc3ltYm9sLiAgVGhpcyBpcyB1c2VkIGR1cmluZyBwbGF5YmFjaywgdG8gXG4gICAgICAgICAqICBhdXRvbWF0aWNhbGx5IHNjcm9sbCB0aGUgbXVzaWMgd2hpbGUgcGxheWluZy5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGludCBFbmRUaW1lXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXQgeyByZXR1cm4gZW5kdGltZTsgfVxyXG4gICAgICAgICAgICBzZXQgeyBlbmR0aW1lID0gdmFsdWU7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBGaW5kIHRoZSBpbml0aWFsIGNsZWYgdG8gdXNlIGZvciB0aGlzIHN0YWZmLiAgVXNlIHRoZSBjbGVmIG9mXG4gICAgICAgICAqIHRoZSBmaXJzdCBDaG9yZFN5bWJvbC5cbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBDbGVmIEZpbmRDbGVmKExpc3Q8TXVzaWNTeW1ib2w+IGxpc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBtIGluIGxpc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChtIGlzIENob3JkU3ltYm9sKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIENob3JkU3ltYm9sIGMgPSAoQ2hvcmRTeW1ib2wpbTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYy5DbGVmO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBDbGVmLlRyZWJsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBDYWxjdWxhdGUgdGhlIGhlaWdodCBvZiB0aGlzIHN0YWZmLiAgRWFjaCBNdXNpY1N5bWJvbCBjb250YWlucyB0aGVcbiAgICAgICAgICogbnVtYmVyIG9mIHBpeGVscyBpdCBuZWVkcyBhYm92ZSBhbmQgYmVsb3cgdGhlIHN0YWZmLiAgR2V0IHRoZSBtYXhpbXVtXG4gICAgICAgICAqIHZhbHVlcyBhYm92ZSBhbmQgYmVsb3cgdGhlIHN0YWZmLlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgdm9pZCBDYWxjdWxhdGVIZWlnaHQoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW50IGFib3ZlID0gMDtcclxuICAgICAgICAgICAgaW50IGJlbG93ID0gMDtcclxuXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHMgaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgYWJvdmUgPSBNYXRoLk1heChhYm92ZSwgcy5BYm92ZVN0YWZmKTtcclxuICAgICAgICAgICAgICAgIGJlbG93ID0gTWF0aC5NYXgoYmVsb3csIHMuQmVsb3dTdGFmZik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYWJvdmUgPSBNYXRoLk1heChhYm92ZSwgY2xlZnN5bS5BYm92ZVN0YWZmKTtcclxuICAgICAgICAgICAgYmVsb3cgPSBNYXRoLk1heChiZWxvdywgY2xlZnN5bS5CZWxvd1N0YWZmKTtcclxuICAgICAgICAgICAgaWYgKHNob3dNZWFzdXJlcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgYWJvdmUgPSBNYXRoLk1heChhYm92ZSwgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgeXRvcCA9IGFib3ZlICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xyXG4gICAgICAgICAgICBoZWlnaHQgPSBTaGVldE11c2ljLk5vdGVIZWlnaHQgKiA1ICsgeXRvcCArIGJlbG93O1xyXG4gICAgICAgICAgICBpZiAobHlyaWNzICE9IG51bGwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGhlaWdodCArPSAxMjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLyogQWRkIHNvbWUgZXh0cmEgdmVydGljYWwgc3BhY2UgYmV0d2VlbiB0aGUgbGFzdCB0cmFja1xyXG4gICAgICAgICAgICAgKiBhbmQgZmlyc3QgdHJhY2suXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBpZiAodHJhY2tudW0gPT0gdG90YWx0cmFja3MgLSAxKVxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ICs9IFNoZWV0TXVzaWMuTm90ZUhlaWdodCAqIDM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogQ2FsY3VsYXRlIHRoZSB3aWR0aCBvZiB0aGlzIHN0YWZmICovXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIENhbGN1bGF0ZVdpZHRoKGJvb2wgc2Nyb2xsVmVydClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChzY3JvbGxWZXJ0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB3aWR0aCA9IFNoZWV0TXVzaWMuUGFnZVdpZHRoO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHdpZHRoID0ga2V5c2lnV2lkdGg7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHMgaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgd2lkdGggKz0gcy5XaWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBDYWxjdWxhdGUgdGhlIHN0YXJ0IGFuZCBlbmQgdGltZSBvZiB0aGlzIHN0YWZmLiAqL1xyXG4gICAgICAgIHByaXZhdGUgdm9pZCBDYWxjdWxhdGVTdGFydEVuZFRpbWUoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3RhcnR0aW1lID0gZW5kdGltZSA9IDA7XHJcbiAgICAgICAgICAgIGlmIChzeW1ib2xzLkNvdW50ID09IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdGFydHRpbWUgPSBzeW1ib2xzWzBdLlN0YXJ0VGltZTtcclxuICAgICAgICAgICAgZm9yZWFjaCAoTXVzaWNTeW1ib2wgbSBpbiBzeW1ib2xzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZW5kdGltZSA8IG0uU3RhcnRUaW1lKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuZHRpbWUgPSBtLlN0YXJ0VGltZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChtIGlzIENob3JkU3ltYm9sKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIENob3JkU3ltYm9sIGMgPSAoQ2hvcmRTeW1ib2wpbTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZW5kdGltZSA8IGMuRW5kVGltZSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZHRpbWUgPSBjLkVuZFRpbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIEZ1bGwtSnVzdGlmeSB0aGUgc3ltYm9scywgc28gdGhhdCB0aGV5IGV4cGFuZCB0byBmaWxsIHRoZSB3aG9sZSBzdGFmZi4gKi9cclxuICAgICAgICBwcml2YXRlIHZvaWQgRnVsbEp1c3RpZnkoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHdpZHRoICE9IFNoZWV0TXVzaWMuUGFnZVdpZHRoKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgaW50IHRvdGFsd2lkdGggPSBrZXlzaWdXaWR0aDtcclxuICAgICAgICAgICAgaW50IHRvdGFsc3ltYm9scyA9IDA7XHJcbiAgICAgICAgICAgIGludCBpID0gMDtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlIChpIDwgc3ltYm9scy5Db3VudClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IHN0YXJ0ID0gc3ltYm9sc1tpXS5TdGFydFRpbWU7XHJcbiAgICAgICAgICAgICAgICB0b3RhbHN5bWJvbHMrKztcclxuICAgICAgICAgICAgICAgIHRvdGFsd2lkdGggKz0gc3ltYm9sc1tpXS5XaWR0aDtcclxuICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgc3ltYm9scy5Db3VudCAmJiBzeW1ib2xzW2ldLlN0YXJ0VGltZSA9PSBzdGFydClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0b3RhbHdpZHRoICs9IHN5bWJvbHNbaV0uV2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpbnQgZXh0cmF3aWR0aCA9IChTaGVldE11c2ljLlBhZ2VXaWR0aCAtIHRvdGFsd2lkdGggLSAxKSAvIHRvdGFsc3ltYm9scztcclxuICAgICAgICAgICAgaWYgKGV4dHJhd2lkdGggPiBTaGVldE11c2ljLk5vdGVIZWlnaHQgKiAyKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBleHRyYXdpZHRoID0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpID0gMDtcclxuICAgICAgICAgICAgd2hpbGUgKGkgPCBzeW1ib2xzLkNvdW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgc3RhcnQgPSBzeW1ib2xzW2ldLlN0YXJ0VGltZTtcclxuICAgICAgICAgICAgICAgIHN5bWJvbHNbaV0uV2lkdGggKz0gZXh0cmF3aWR0aDtcclxuICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgc3ltYm9scy5Db3VudCAmJiBzeW1ib2xzW2ldLlN0YXJ0VGltZSA9PSBzdGFydClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogQWRkIHRoZSBseXJpYyBzeW1ib2xzIHRoYXQgb2NjdXIgd2l0aGluIHRoaXMgc3RhZmYuXG4gICAgICAgICAqICBTZXQgdGhlIHgtcG9zaXRpb24gb2YgdGhlIGx5cmljIHN5bWJvbC4gXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyB2b2lkIEFkZEx5cmljcyhMaXN0PEx5cmljU3ltYm9sPiB0cmFja2x5cmljcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0cmFja2x5cmljcyA9PSBudWxsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbHlyaWNzID0gbmV3IExpc3Q8THlyaWNTeW1ib2w+KCk7XHJcbiAgICAgICAgICAgIGludCB4cG9zID0gMDtcclxuICAgICAgICAgICAgaW50IHN5bWJvbGluZGV4ID0gMDtcclxuICAgICAgICAgICAgZm9yZWFjaCAoTHlyaWNTeW1ib2wgbHlyaWMgaW4gdHJhY2tseXJpY3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChseXJpYy5TdGFydFRpbWUgPCBzdGFydHRpbWUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAobHlyaWMuU3RhcnRUaW1lID4gZW5kdGltZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8qIEdldCB0aGUgeC1wb3NpdGlvbiBvZiB0aGlzIGx5cmljICovXHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoc3ltYm9saW5kZXggPCBzeW1ib2xzLkNvdW50ICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgc3ltYm9sc1tzeW1ib2xpbmRleF0uU3RhcnRUaW1lIDwgbHlyaWMuU3RhcnRUaW1lKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHhwb3MgKz0gc3ltYm9sc1tzeW1ib2xpbmRleF0uV2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgc3ltYm9saW5kZXgrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGx5cmljLlggPSB4cG9zO1xyXG4gICAgICAgICAgICAgICAgaWYgKHN5bWJvbGluZGV4IDwgc3ltYm9scy5Db3VudCAmJlxyXG4gICAgICAgICAgICAgICAgICAgIChzeW1ib2xzW3N5bWJvbGluZGV4XSBpcyBCYXJTeW1ib2wpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGx5cmljLlggKz0gU2hlZXRNdXNpYy5Ob3RlV2lkdGg7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBseXJpY3MuQWRkKGx5cmljKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobHlyaWNzLkNvdW50ID09IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGx5cmljcyA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogRHJhdyB0aGUgbHlyaWNzICovXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIERyYXdMeXJpY3MoR3JhcGhpY3MgZywgUGVuIHBlbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8qIFNraXAgdGhlIGxlZnQgc2lkZSBDbGVmIHN5bWJvbCBhbmQga2V5IHNpZ25hdHVyZSAqL1xyXG4gICAgICAgICAgICBpbnQgeHBvcyA9IGtleXNpZ1dpZHRoO1xyXG4gICAgICAgICAgICBpbnQgeXBvcyA9IGhlaWdodCAtIDEyO1xyXG5cclxuICAgICAgICAgICAgZm9yZWFjaCAoTHlyaWNTeW1ib2wgbHlyaWMgaW4gbHlyaWNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnLkRyYXdTdHJpbmcobHlyaWMuVGV4dCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxldHRlckZvbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQnJ1c2hlcy5CbGFjayxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4cG9zICsgbHlyaWMuWCwgeXBvcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBEcmF3IHRoZSBtZWFzdXJlIG51bWJlcnMgZm9yIGVhY2ggbWVhc3VyZSAqL1xyXG4gICAgICAgIHByaXZhdGUgdm9pZCBEcmF3TWVhc3VyZU51bWJlcnMoR3JhcGhpY3MgZywgUGVuIHBlbilcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICAvKiBTa2lwIHRoZSBsZWZ0IHNpZGUgQ2xlZiBzeW1ib2wgYW5kIGtleSBzaWduYXR1cmUgKi9cclxuICAgICAgICAgICAgaW50IHhwb3MgPSBrZXlzaWdXaWR0aDtcclxuICAgICAgICAgICAgaW50IHlwb3MgPSB5dG9wIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMztcclxuXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHMgaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHMgaXMgQmFyU3ltYm9sKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBtZWFzdXJlID0gMSArIHMuU3RhcnRUaW1lIC8gbWVhc3VyZUxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICBnLkRyYXdTdHJpbmcoXCJcIiArIG1lYXN1cmUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGV0dGVyRm9udCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQnJ1c2hlcy5CbGFjayxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHBvcyArIFNoZWV0TXVzaWMuTm90ZVdpZHRoIC8gMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXBvcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB4cG9zICs9IHMuV2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBEcmF3IHRoZSBseXJpY3MgKi9cclxuXHJcblxyXG4gICAgICAgIC8qKiBEcmF3IHRoZSBmaXZlIGhvcml6b250YWwgbGluZXMgb2YgdGhlIHN0YWZmICovXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIERyYXdIb3JpekxpbmVzKEdyYXBoaWNzIGcsIFBlbiBwZW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbnQgbGluZSA9IDE7XHJcbiAgICAgICAgICAgIGludCB5ID0geXRvcCAtIFNoZWV0TXVzaWMuTGluZVdpZHRoO1xyXG4gICAgICAgICAgICBwZW4uV2lkdGggPSAxO1xyXG4gICAgICAgICAgICBmb3IgKGxpbmUgPSAxOyBsaW5lIDw9IDU7IGxpbmUrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIFNoZWV0TXVzaWMuTGVmdE1hcmdpbiwgeSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aCAtIDEsIHkpO1xyXG4gICAgICAgICAgICAgICAgeSArPSBTaGVldE11c2ljLkxpbmVXaWR0aCArIFNoZWV0TXVzaWMuTGluZVNwYWNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBlbi5Db2xvciA9IENvbG9yLkJsYWNrO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBEcmF3IHRoZSB2ZXJ0aWNhbCBsaW5lcyBhdCB0aGUgZmFyIGxlZnQgYW5kIGZhciByaWdodCBzaWRlcy4gKi9cclxuICAgICAgICBwcml2YXRlIHZvaWQgRHJhd0VuZExpbmVzKEdyYXBoaWNzIGcsIFBlbiBwZW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBwZW4uV2lkdGggPSAxO1xyXG5cclxuICAgICAgICAgICAgLyogRHJhdyB0aGUgdmVydGljYWwgbGluZXMgZnJvbSAwIHRvIHRoZSBoZWlnaHQgb2YgdGhpcyBzdGFmZixcclxuICAgICAgICAgICAgICogaW5jbHVkaW5nIHRoZSBzcGFjZSBhYm92ZSBhbmQgYmVsb3cgdGhlIHN0YWZmLCB3aXRoIHR3byBleGNlcHRpb25zOlxyXG4gICAgICAgICAgICAgKiAtIElmIHRoaXMgaXMgdGhlIGZpcnN0IHRyYWNrLCBkb24ndCBzdGFydCBhYm92ZSB0aGUgc3RhZmYuXHJcbiAgICAgICAgICAgICAqICAgU3RhcnQgZXhhY3RseSBhdCB0aGUgdG9wIG9mIHRoZSBzdGFmZiAoeXRvcCAtIExpbmVXaWR0aClcclxuICAgICAgICAgICAgICogLSBJZiB0aGlzIGlzIHRoZSBsYXN0IHRyYWNrLCBkb24ndCBlbmQgYmVsb3cgdGhlIHN0YWZmLlxyXG4gICAgICAgICAgICAgKiAgIEVuZCBleGFjdGx5IGF0IHRoZSBib3R0b20gb2YgdGhlIHN0YWZmLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgaW50IHlzdGFydCwgeWVuZDtcclxuICAgICAgICAgICAgaWYgKHRyYWNrbnVtID09IDApXHJcbiAgICAgICAgICAgICAgICB5c3RhcnQgPSB5dG9wIC0gU2hlZXRNdXNpYy5MaW5lV2lkdGg7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHlzdGFydCA9IDA7XHJcblxyXG4gICAgICAgICAgICBpZiAodHJhY2tudW0gPT0gKHRvdGFsdHJhY2tzIC0gMSkpXHJcbiAgICAgICAgICAgICAgICB5ZW5kID0geXRvcCArIDQgKiBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHllbmQgPSBoZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgU2hlZXRNdXNpYy5MZWZ0TWFyZ2luLCB5c3RhcnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxlZnRNYXJnaW4sIHllbmQpO1xyXG5cclxuICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHdpZHRoIC0gMSwgeXN0YXJ0LCB3aWR0aCAtIDEsIHllbmQpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBEcmF3IHRoaXMgc3RhZmYuIE9ubHkgZHJhdyB0aGUgc3ltYm9scyBpbnNpZGUgdGhlIGNsaXAgYXJlYSAqL1xyXG4gICAgICAgIHB1YmxpYyB2b2lkIERyYXcoR3JhcGhpY3MgZywgUmVjdGFuZ2xlIGNsaXAsIFBlbiBwZW4sIGludCBzZWxlY3Rpb25TdGFydFB1bHNlLCBpbnQgc2VsZWN0aW9uRW5kUHVsc2UsIEJydXNoIGRlc2VsZWN0ZWRCcnVzaClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8qIFNoYWRlIGFueSBkZXNlbGVjdGVkIGFyZWFzICovXHJcbiAgICAgICAgICAgIFNoYWRlU2VsZWN0aW9uQmFja2dyb3VuZChnLCBjbGlwLCBzZWxlY3Rpb25TdGFydFB1bHNlLCBzZWxlY3Rpb25FbmRQdWxzZSwgZGVzZWxlY3RlZEJydXNoKTtcclxuXHJcbiAgICAgICAgICAgIGludCB4cG9zID0gU2hlZXRNdXNpYy5MZWZ0TWFyZ2luICsgNTtcclxuXHJcbiAgICAgICAgICAgIC8qIERyYXcgdGhlIGxlZnQgc2lkZSBDbGVmIHN5bWJvbCAqL1xyXG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSh4cG9zLCAwKTtcclxuICAgICAgICAgICAgY2xlZnN5bS5EcmF3KGcsIHBlbiwgeXRvcCk7XHJcbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC14cG9zLCAwKTtcclxuICAgICAgICAgICAgeHBvcyArPSBjbGVmc3ltLldpZHRoO1xyXG5cclxuICAgICAgICAgICAgLyogRHJhdyB0aGUga2V5IHNpZ25hdHVyZSAqL1xyXG4gICAgICAgICAgICBmb3JlYWNoIChBY2NpZFN5bWJvbCBhIGluIGtleXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKHhwb3MsIDApO1xyXG4gICAgICAgICAgICAgICAgYS5EcmF3KGcsIHBlbiwgeXRvcCk7XHJcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgteHBvcywgMCk7XHJcbiAgICAgICAgICAgICAgICB4cG9zICs9IGEuV2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIERyYXcgdGhlIGFjdHVhbCBub3RlcywgcmVzdHMsIGJhcnMuICBEcmF3IHRoZSBzeW1ib2xzIG9uZSBcclxuICAgICAgICAgICAgICogYWZ0ZXIgYW5vdGhlciwgdXNpbmcgdGhlIHN5bWJvbCB3aWR0aCB0byBkZXRlcm1pbmUgdGhlXHJcbiAgICAgICAgICAgICAqIHggcG9zaXRpb24gb2YgdGhlIG5leHQgc3ltYm9sLlxyXG4gICAgICAgICAgICAgKlxyXG4gICAgICAgICAgICAgKiBGb3IgZmFzdCBwZXJmb3JtYW5jZSwgb25seSBkcmF3IHN5bWJvbHMgdGhhdCBhcmUgaW4gdGhlIGNsaXAgYXJlYS5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHMgaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKEluc2lkZUNsaXBwaW5nKGNsaXAsIHhwb3MsIHMpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKHhwb3MsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgIHMuRHJhdyhnLCBwZW4sIHl0b3ApO1xyXG4gICAgICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC14cG9zLCAwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHhwb3MgKz0gcy5XaWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBEcmF3SG9yaXpMaW5lcyhnLCBwZW4pO1xyXG4gICAgICAgICAgICBEcmF3RW5kTGluZXMoZywgcGVuKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChzaG93TWVhc3VyZXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIERyYXdNZWFzdXJlTnVtYmVycyhnLCBwZW4pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChseXJpY3MgIT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgRHJhd0x5cmljcyhnLCBwZW4pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIElmIGEgc2VsZWN0aW9uIGhhcyBiZWVuIHNwZWNpZmllZCwgc2hhZGUgYWxsIGFyZWFzIHRoYXQgYXJlbid0IGluIHRoZSBzZWxlY3Rpb25cbiAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHZvaWQgU2hhZGVTZWxlY3Rpb25CYWNrZ3JvdW5kKEdyYXBoaWNzIGcsIFJlY3RhbmdsZSBjbGlwLCBpbnQgc2VsZWN0aW9uU3RhcnRQdWxzZSwgaW50IHNlbGVjdGlvbkVuZFB1bHNlLCBCcnVzaCBkZXNlbGVjdGVkQnJ1c2gpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoc2VsZWN0aW9uRW5kUHVsc2UgPT0gMCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgaW50IHhwb3MgPSBrZXlzaWdXaWR0aDtcclxuICAgICAgICAgICAgYm9vbCBsYXN0U3RhdGVGaWxsID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHMgaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKEluc2lkZUNsaXBwaW5nKGNsaXAsIHhwb3MsIHMpICYmIChzLlN0YXJ0VGltZSA8IHNlbGVjdGlvblN0YXJ0UHVsc2UgfHwgcy5TdGFydFRpbWUgPiBzZWxlY3Rpb25FbmRQdWxzZSkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeHBvcyAtIDIsIC0yKTtcclxuICAgICAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZGVzZWxlY3RlZEJydXNoLCAwLCAwLCBzLldpZHRoICsgNCwgdGhpcy5IZWlnaHQgKyA0KTtcclxuICAgICAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKHhwb3MgLSAyKSwgMik7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFN0YXRlRmlsbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFN0YXRlRmlsbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgeHBvcyArPSBzLldpZHRoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChsYXN0U3RhdGVGaWxsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvL3NoYWRlIHRoZSByZXN0IG9mIHRoZSBzdGFmZiBpZiB0aGUgcHJldmlvdXMgc3ltYm9sIHdhcyBzaGFkZWRcclxuICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKHhwb3MgLSAyLCAtMik7XHJcbiAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZGVzZWxlY3RlZEJydXNoLCAwLCAwLCB3aWR0aCAtIHhwb3MsIHRoaXMuSGVpZ2h0ICsgNCk7XHJcbiAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKHhwb3MgLSAyKSwgMik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGJvb2wgSW5zaWRlQ2xpcHBpbmcoUmVjdGFuZ2xlIGNsaXAsIGludCB4cG9zLCBNdXNpY1N5bWJvbCBzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuICh4cG9zIDw9IGNsaXAuWCArIGNsaXAuV2lkdGggKyA1MCkgJiYgKHhwb3MgKyBzLldpZHRoICsgNTAgPj0gY2xpcC5YKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogU2hhZGUgYWxsIHRoZSBjaG9yZHMgcGxheWVkIGluIHRoZSBnaXZlbiB0aW1lLlxuICAgICAgICAgKiAgVW4tc2hhZGUgYW55IGNob3JkcyBzaGFkZWQgaW4gdGhlIHByZXZpb3VzIHB1bHNlIHRpbWUuXG4gICAgICAgICAqICBTdG9yZSB0aGUgeCBjb29yZGluYXRlIGxvY2F0aW9uIHdoZXJlIHRoZSBzaGFkZSB3YXMgZHJhd24uXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBib29sIFNoYWRlTm90ZXMoR3JhcGhpY3MgZywgU29saWRCcnVzaCBzaGFkZUJydXNoLCBQZW4gcGVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50IGN1cnJlbnRQdWxzZVRpbWUsIGludCBwcmV2UHVsc2VUaW1lLCByZWYgaW50IHhfc2hhZGUpXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgLyogSWYgdGhlcmUncyBub3RoaW5nIHRvIHVuc2hhZGUsIG9yIHNoYWRlLCByZXR1cm4gKi9cclxuICAgICAgICAgICAgaWYgKChzdGFydHRpbWUgPiBwcmV2UHVsc2VUaW1lIHx8IGVuZHRpbWUgPCBwcmV2UHVsc2VUaW1lKSAmJlxyXG4gICAgICAgICAgICAgICAgKHN0YXJ0dGltZSA+IGN1cnJlbnRQdWxzZVRpbWUgfHwgZW5kdGltZSA8IGN1cnJlbnRQdWxzZVRpbWUpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIFNraXAgdGhlIGxlZnQgc2lkZSBDbGVmIHN5bWJvbCBhbmQga2V5IHNpZ25hdHVyZSAqL1xyXG4gICAgICAgICAgICBpbnQgeHBvcyA9IGtleXNpZ1dpZHRoO1xyXG5cclxuICAgICAgICAgICAgTXVzaWNTeW1ib2wgY3VyciA9IG51bGw7XHJcbiAgICAgICAgICAgIENob3JkU3ltYm9sIHByZXZDaG9yZCA9IG51bGw7XHJcbiAgICAgICAgICAgIGludCBwcmV2X3hwb3MgPSAwO1xyXG5cclxuICAgICAgICAgICAgLyogTG9vcCB0aHJvdWdoIHRoZSBzeW1ib2xzLiBcclxuICAgICAgICAgICAgICogVW5zaGFkZSBzeW1ib2xzIHdoZXJlIHN0YXJ0IDw9IHByZXZQdWxzZVRpbWUgPCBlbmRcclxuICAgICAgICAgICAgICogU2hhZGUgc3ltYm9scyB3aGVyZSBzdGFydCA8PSBjdXJyZW50UHVsc2VUaW1lIDwgZW5kXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBib29sIHNoYWRlZE5vdGVGb3VuZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHN5bWJvbHMuQ291bnQ7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY3VyciA9IHN5bWJvbHNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAoY3VyciBpcyBCYXJTeW1ib2wpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgeHBvcyArPSBjdXJyLldpZHRoO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGludCBzdGFydCA9IGN1cnIuU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgaW50IGVuZCA9IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAoaSArIDIgPCBzeW1ib2xzLkNvdW50ICYmIHN5bWJvbHNbaSArIDFdIGlzIEJhclN5bWJvbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBlbmQgPSBzeW1ib2xzW2kgKyAyXS5TdGFydFRpbWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpICsgMSA8IHN5bWJvbHMuQ291bnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gc3ltYm9sc1tpICsgMV0uU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IGVuZHRpbWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIC8qIElmIHdlJ3ZlIHBhc3QgdGhlIHByZXZpb3VzIGFuZCBjdXJyZW50IHRpbWVzLCB3ZSdyZSBkb25lLiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKChzdGFydCA+IHByZXZQdWxzZVRpbWUpICYmIChzdGFydCA+IGN1cnJlbnRQdWxzZVRpbWUpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh4X3NoYWRlID09IDApXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4X3NoYWRlID0geHBvcztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzaGFkZWROb3RlRm91bmQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBJZiBzaGFkZWQgbm90ZXMgYXJlIHRoZSBzYW1lLCB3ZSdyZSBkb25lICovXHJcbiAgICAgICAgICAgICAgICBpZiAoKHN0YXJ0IDw9IGN1cnJlbnRQdWxzZVRpbWUpICYmIChjdXJyZW50UHVsc2VUaW1lIDwgZW5kKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgIChzdGFydCA8PSBwcmV2UHVsc2VUaW1lKSAmJiAocHJldlB1bHNlVGltZSA8IGVuZCkpXHJcbiAgICAgICAgICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHhfc2hhZGUgPSB4cG9zO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzaGFkZWROb3RlRm91bmQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyogSWYgc3ltYm9sIGlzIGluIHRoZSBwcmV2aW91cyB0aW1lLCBkcmF3IGEgd2hpdGUgYmFja2dyb3VuZCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKChzdGFydCA8PSBwcmV2UHVsc2VUaW1lKSAmJiAocHJldlB1bHNlVGltZSA8IGVuZCkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeHBvcyAtIDIsIC0yKTtcclxuICAgICAgICAgICAgICAgICAgICBnLkNsZWFyUmVjdGFuZ2xlKDAsIDAsIGN1cnIuV2lkdGggKyA0LCB0aGlzLkhlaWdodCArIDQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0oeHBvcyAtIDIpLCAyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKiBJZiBzeW1ib2wgaXMgaW4gdGhlIGN1cnJlbnQgdGltZSwgZHJhdyBhIHNoYWRlZCBiYWNrZ3JvdW5kICovXHJcbiAgICAgICAgICAgICAgICBpZiAoKHN0YXJ0IDw9IGN1cnJlbnRQdWxzZVRpbWUpICYmIChjdXJyZW50UHVsc2VUaW1lIDwgZW5kKSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB4X3NoYWRlID0geHBvcztcclxuICAgICAgICAgICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSh4cG9zLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoc2hhZGVCcnVzaCwgMCwgMCwgY3Vyci5XaWR0aCwgdGhpcy5IZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC14cG9zLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICBzaGFkZWROb3RlRm91bmQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHhwb3MgKz0gY3Vyci5XaWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc2hhZGVkTm90ZUZvdW5kO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFJldHVybiB0aGUgcHVsc2UgdGltZSBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlbiBwb2ludC5cbiAgICAgICAgICogIEZpbmQgdGhlIG5vdGVzL3N5bWJvbHMgY29ycmVzcG9uZGluZyB0byB0aGUgeCBwb3NpdGlvbixcbiAgICAgICAgICogIGFuZCByZXR1cm4gdGhlIHN0YXJ0VGltZSAocHVsc2VUaW1lKSBvZiB0aGUgc3ltYm9sLlxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgaW50IFB1bHNlVGltZUZvclBvaW50KFBvaW50IHBvaW50KVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIGludCB4cG9zID0ga2V5c2lnV2lkdGg7XHJcbiAgICAgICAgICAgIGludCBwdWxzZVRpbWUgPSBzdGFydHRpbWU7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHN5bSBpbiBzeW1ib2xzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBwdWxzZVRpbWUgPSBzeW0uU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBvaW50LlggPD0geHBvcyArIHN5bS5XaWR0aClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHVsc2VUaW1lO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgeHBvcyArPSBzeW0uV2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHB1bHNlVGltZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3RyaW5nIHJlc3VsdCA9IFwiU3RhZmYgY2xlZj1cIiArIGNsZWZzeW0uVG9TdHJpbmcoKSArIFwiXFxuXCI7XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSBcIiAgS2V5czpcXG5cIjtcclxuICAgICAgICAgICAgZm9yZWFjaCAoQWNjaWRTeW1ib2wgYSBpbiBrZXlzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gXCIgICAgXCIgKyBhLlRvU3RyaW5nKCkgKyBcIlxcblwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSBcIiAgU3ltYm9sczpcXG5cIjtcclxuICAgICAgICAgICAgZm9yZWFjaCAoTXVzaWNTeW1ib2wgcyBpbiBrZXlzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gXCIgICAgXCIgKyBzLlRvU3RyaW5nKCkgKyBcIlxcblwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIG0gaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IFwiICAgIFwiICsgbS5Ub1N0cmluZygpICsgXCJcXG5cIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXN1bHQgKz0gXCJFbmQgU3RhZmZcXG5cIjtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxufVxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbi8qKiBAY2xhc3MgU3RlbVxuICogVGhlIFN0ZW0gY2xhc3MgaXMgdXNlZCBieSBDaG9yZFN5bWJvbCB0byBkcmF3IHRoZSBzdGVtIHBvcnRpb24gb2ZcbiAqIHRoZSBjaG9yZC4gIFRoZSBzdGVtIGhhcyB0aGUgZm9sbG93aW5nIGZpZWxkczpcbiAqXG4gKiBkdXJhdGlvbiAgLSBUaGUgZHVyYXRpb24gb2YgdGhlIHN0ZW0uXG4gKiBkaXJlY3Rpb24gLSBFaXRoZXIgVXAgb3IgRG93blxuICogc2lkZSAgICAgIC0gRWl0aGVyIGxlZnQgb3IgcmlnaHRcbiAqIHRvcCAgICAgICAtIFRoZSB0b3Btb3N0IG5vdGUgaW4gdGhlIGNob3JkXG4gKiBib3R0b20gICAgLSBUaGUgYm90dG9tbW9zdCBub3RlIGluIHRoZSBjaG9yZFxuICogZW5kICAgICAgIC0gVGhlIG5vdGUgcG9zaXRpb24gd2hlcmUgdGhlIHN0ZW0gZW5kcy4gIFRoaXMgaXMgdXN1YWxseVxuICogICAgICAgICAgICAgc2l4IG5vdGVzIHBhc3QgdGhlIGxhc3Qgbm90ZSBpbiB0aGUgY2hvcmQuICBGb3IgOHRoLzE2dGhcbiAqICAgICAgICAgICAgIG5vdGVzLCB0aGUgc3RlbSBtdXN0IGV4dGVuZCBldmVuIG1vcmUuXG4gKlxuICogVGhlIFNoZWV0TXVzaWMgY2xhc3MgY2FuIGNoYW5nZSB0aGUgZGlyZWN0aW9uIG9mIGEgc3RlbSBhZnRlciBpdFxuICogaGFzIGJlZW4gY3JlYXRlZC4gIFRoZSBzaWRlIGFuZCBlbmQgZmllbGRzIG1heSBhbHNvIGNoYW5nZSBkdWUgdG9cbiAqIHRoZSBkaXJlY3Rpb24gY2hhbmdlLiAgQnV0IG90aGVyIGZpZWxkcyB3aWxsIG5vdCBjaGFuZ2UuXG4gKi9cbiBcbnB1YmxpYyBjbGFzcyBTdGVtIHtcbiAgICBwdWJsaWMgY29uc3QgaW50IFVwID0gICAxOyAgICAgIC8qIFRoZSBzdGVtIHBvaW50cyB1cCAqL1xuICAgIHB1YmxpYyBjb25zdCBpbnQgRG93biA9IDI7ICAgICAgLyogVGhlIHN0ZW0gcG9pbnRzIGRvd24gKi9cbiAgICBwdWJsaWMgY29uc3QgaW50IExlZnRTaWRlID0gMTsgIC8qIFRoZSBzdGVtIGlzIHRvIHRoZSBsZWZ0IG9mIHRoZSBub3RlICovXG4gICAgcHVibGljIGNvbnN0IGludCBSaWdodFNpZGUgPSAyOyAvKiBUaGUgc3RlbSBpcyB0byB0aGUgcmlnaHQgb2YgdGhlIG5vdGUgKi9cblxuICAgIHByaXZhdGUgTm90ZUR1cmF0aW9uIGR1cmF0aW9uOyAvKiogRHVyYXRpb24gb2YgdGhlIHN0ZW0uICovXG4gICAgcHJpdmF0ZSBpbnQgZGlyZWN0aW9uOyAgICAgICAgIC8qKiBVcCwgRG93biwgb3IgTm9uZSAqL1xuICAgIHByaXZhdGUgV2hpdGVOb3RlIHRvcDsgICAgICAgICAvKiogVG9wbW9zdCBub3RlIGluIGNob3JkICovXG4gICAgcHJpdmF0ZSBXaGl0ZU5vdGUgYm90dG9tOyAgICAgIC8qKiBCb3R0b21tb3N0IG5vdGUgaW4gY2hvcmQgKi9cbiAgICBwcml2YXRlIFdoaXRlTm90ZSBlbmQ7ICAgICAgICAgLyoqIExvY2F0aW9uIG9mIGVuZCBvZiB0aGUgc3RlbSAqL1xuICAgIHByaXZhdGUgYm9vbCBub3Rlc292ZXJsYXA7ICAgICAvKiogRG8gdGhlIGNob3JkIG5vdGVzIG92ZXJsYXAgKi9cbiAgICBwcml2YXRlIGludCBzaWRlOyAgICAgICAgICAgICAgLyoqIExlZnQgc2lkZSBvciByaWdodCBzaWRlIG9mIG5vdGUgKi9cblxuICAgIHByaXZhdGUgU3RlbSBwYWlyOyAgICAgICAgICAgICAgLyoqIElmIHBhaXIgIT0gbnVsbCwgdGhpcyBpcyBhIGhvcml6b250YWwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBiZWFtIHN0ZW0gdG8gYW5vdGhlciBjaG9yZCAqL1xuICAgIHByaXZhdGUgaW50IHdpZHRoX3RvX3BhaXI7ICAgICAgLyoqIFRoZSB3aWR0aCAoaW4gcGl4ZWxzKSB0byB0aGUgY2hvcmQgcGFpciAqL1xuICAgIHByaXZhdGUgYm9vbCByZWNlaXZlcl9pbl9wYWlyOyAgLyoqIFRoaXMgc3RlbSBpcyB0aGUgcmVjZWl2ZXIgb2YgYSBob3Jpem9udGFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIGJlYW0gc3RlbSBmcm9tIGFub3RoZXIgY2hvcmQuICovXG5cbiAgICAvKiogR2V0L1NldCB0aGUgZGlyZWN0aW9uIG9mIHRoZSBzdGVtIChVcCBvciBEb3duKSAqL1xuICAgIHB1YmxpYyBpbnQgRGlyZWN0aW9uIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIGRpcmVjdGlvbjsgfVxuICAgICAgICBzZXQgeyBDaGFuZ2VEaXJlY3Rpb24odmFsdWUpOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgZHVyYXRpb24gb2YgdGhlIHN0ZW0gKEVpZ3RoLCBTaXh0ZWVudGgsIFRoaXJ0eVNlY29uZCkgKi9cbiAgICBwdWJsaWMgTm90ZUR1cmF0aW9uIER1cmF0aW9uIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIGR1cmF0aW9uOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgdG9wIG5vdGUgaW4gdGhlIGNob3JkLiBUaGlzIGlzIG5lZWRlZCB0byBkZXRlcm1pbmUgdGhlIHN0ZW0gZGlyZWN0aW9uICovXG4gICAgcHVibGljIFdoaXRlTm90ZSBUb3Age1xuICAgICAgICBnZXQgeyByZXR1cm4gdG9wOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgYm90dG9tIG5vdGUgaW4gdGhlIGNob3JkLiBUaGlzIGlzIG5lZWRlZCB0byBkZXRlcm1pbmUgdGhlIHN0ZW0gZGlyZWN0aW9uICovXG4gICAgcHVibGljIFdoaXRlTm90ZSBCb3R0b20ge1xuICAgICAgICBnZXQgeyByZXR1cm4gYm90dG9tOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldC9TZXQgdGhlIGxvY2F0aW9uIHdoZXJlIHRoZSBzdGVtIGVuZHMuICBUaGlzIGlzIHVzdWFsbHkgc2l4IG5vdGVzXG4gICAgICogcGFzdCB0aGUgbGFzdCBub3RlIGluIHRoZSBjaG9yZC4gU2VlIG1ldGhvZCBDYWxjdWxhdGVFbmQuXG4gICAgICovXG4gICAgcHVibGljIFdoaXRlTm90ZSBFbmQge1xuICAgICAgICBnZXQgeyByZXR1cm4gZW5kOyB9XG4gICAgICAgIHNldCB7IGVuZCA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgLyoqIFNldCB0aGlzIFN0ZW0gdG8gYmUgdGhlIHJlY2VpdmVyIG9mIGEgaG9yaXpvbnRhbCBiZWFtLCBhcyBwYXJ0XG4gICAgICogb2YgYSBjaG9yZCBwYWlyLiAgSW4gRHJhdygpLCBpZiB0aGlzIHN0ZW0gaXMgYSByZWNlaXZlciwgd2VcbiAgICAgKiBkb24ndCBkcmF3IGEgY3Vydnkgc3RlbSwgd2Ugb25seSBkcmF3IHRoZSB2ZXJ0aWNhbCBsaW5lLlxuICAgICAqL1xuICAgIHB1YmxpYyBib29sIFJlY2VpdmVyIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHJlY2VpdmVyX2luX3BhaXI7IH1cbiAgICAgICAgc2V0IHsgcmVjZWl2ZXJfaW5fcGFpciA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBzdGVtLiAgVGhlIHRvcCBub3RlLCBib3R0b20gbm90ZSwgYW5kIGRpcmVjdGlvbiBhcmUgXG4gICAgICogbmVlZGVkIGZvciBkcmF3aW5nIHRoZSB2ZXJ0aWNhbCBsaW5lIG9mIHRoZSBzdGVtLiAgVGhlIGR1cmF0aW9uIGlzIFxuICAgICAqIG5lZWRlZCB0byBkcmF3IHRoZSB0YWlsIG9mIHRoZSBzdGVtLiAgVGhlIG92ZXJsYXAgYm9vbGVhbiBpcyB0cnVlXG4gICAgICogaWYgdGhlIG5vdGVzIGluIHRoZSBjaG9yZCBvdmVybGFwLiAgSWYgdGhlIG5vdGVzIG92ZXJsYXAsIHRoZVxuICAgICAqIHN0ZW0gbXVzdCBiZSBkcmF3biBvbiB0aGUgcmlnaHQgc2lkZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgU3RlbShXaGl0ZU5vdGUgYm90dG9tLCBXaGl0ZU5vdGUgdG9wLCBcbiAgICAgICAgICAgICAgICBOb3RlRHVyYXRpb24gZHVyYXRpb24sIGludCBkaXJlY3Rpb24sIGJvb2wgb3ZlcmxhcCkge1xuXG4gICAgICAgIHRoaXMudG9wID0gdG9wO1xuICAgICAgICB0aGlzLmJvdHRvbSA9IGJvdHRvbTtcbiAgICAgICAgdGhpcy5kdXJhdGlvbiA9IGR1cmF0aW9uO1xuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgICAgICAgdGhpcy5ub3Rlc292ZXJsYXAgPSBvdmVybGFwO1xuICAgICAgICBpZiAoZGlyZWN0aW9uID09IFVwIHx8IG5vdGVzb3ZlcmxhcClcbiAgICAgICAgICAgIHNpZGUgPSBSaWdodFNpZGU7XG4gICAgICAgIGVsc2UgXG4gICAgICAgICAgICBzaWRlID0gTGVmdFNpZGU7XG4gICAgICAgIGVuZCA9IENhbGN1bGF0ZUVuZCgpO1xuICAgICAgICBwYWlyID0gbnVsbDtcbiAgICAgICAgd2lkdGhfdG9fcGFpciA9IDA7XG4gICAgICAgIHJlY2VpdmVyX2luX3BhaXIgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiogQ2FsY3VsYXRlIHRoZSB2ZXJ0aWNhbCBwb3NpdGlvbiAod2hpdGUgbm90ZSBrZXkpIHdoZXJlIFxuICAgICAqIHRoZSBzdGVtIGVuZHMgXG4gICAgICovXG4gICAgcHVibGljIFdoaXRlTm90ZSBDYWxjdWxhdGVFbmQoKSB7XG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT0gVXApIHtcbiAgICAgICAgICAgIFdoaXRlTm90ZSB3ID0gdG9wO1xuICAgICAgICAgICAgdyA9IHcuQWRkKDYpO1xuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGgpIHtcbiAgICAgICAgICAgICAgICB3ID0gdy5BZGQoMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG4gICAgICAgICAgICAgICAgdyA9IHcuQWRkKDQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGlyZWN0aW9uID09IERvd24pIHtcbiAgICAgICAgICAgIFdoaXRlTm90ZSB3ID0gYm90dG9tO1xuICAgICAgICAgICAgdyA9IHcuQWRkKC02KTtcbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uU2l4dGVlbnRoKSB7XG4gICAgICAgICAgICAgICAgdyA9IHcuQWRkKC0yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcbiAgICAgICAgICAgICAgICB3ID0gdy5BZGQoLTQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDsgIC8qIFNob3VsZG4ndCBoYXBwZW4gKi9cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBDaGFuZ2UgdGhlIGRpcmVjdGlvbiBvZiB0aGUgc3RlbS4gIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGJ5IFxuICAgICAqIENob3JkU3ltYm9sLk1ha2VQYWlyKCkuICBXaGVuIHR3byBjaG9yZHMgYXJlIGpvaW5lZCBieSBhIGhvcml6b250YWxcbiAgICAgKiBiZWFtLCB0aGVpciBzdGVtcyBtdXN0IHBvaW50IGluIHRoZSBzYW1lIGRpcmVjdGlvbiAodXAgb3IgZG93bikuXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgQ2hhbmdlRGlyZWN0aW9uKGludCBuZXdkaXJlY3Rpb24pIHtcbiAgICAgICAgZGlyZWN0aW9uID0gbmV3ZGlyZWN0aW9uO1xuICAgICAgICBpZiAoZGlyZWN0aW9uID09IFVwIHx8IG5vdGVzb3ZlcmxhcClcbiAgICAgICAgICAgIHNpZGUgPSBSaWdodFNpZGU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNpZGUgPSBMZWZ0U2lkZTtcbiAgICAgICAgZW5kID0gQ2FsY3VsYXRlRW5kKCk7XG4gICAgfVxuXG4gICAgLyoqIFBhaXIgdGhpcyBzdGVtIHdpdGggYW5vdGhlciBDaG9yZC4gIEluc3RlYWQgb2YgZHJhd2luZyBhIGN1cnZ5IHRhaWwsXG4gICAgICogdGhpcyBzdGVtIHdpbGwgbm93IGhhdmUgdG8gZHJhdyBhIGJlYW0gdG8gdGhlIGdpdmVuIHN0ZW0gcGFpci4gIFRoZVxuICAgICAqIHdpZHRoIChpbiBwaXhlbHMpIHRvIHRoaXMgc3RlbSBwYWlyIGlzIHBhc3NlZCBhcyBhcmd1bWVudC5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBTZXRQYWlyKFN0ZW0gcGFpciwgaW50IHdpZHRoX3RvX3BhaXIpIHtcbiAgICAgICAgdGhpcy5wYWlyID0gcGFpcjtcbiAgICAgICAgdGhpcy53aWR0aF90b19wYWlyID0gd2lkdGhfdG9fcGFpcjtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRydWUgaWYgdGhpcyBTdGVtIGlzIHBhcnQgb2YgYSBob3Jpem9udGFsIGJlYW0uICovXG4gICAgcHVibGljIGJvb2wgaXNCZWFtIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHJlY2VpdmVyX2luX3BhaXIgfHwgKHBhaXIgIT0gbnVsbCk7IH1cbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGlzIHN0ZW0uXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHkgbG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEBwYXJhbSB0b3BzdGFmZiAgVGhlIG5vdGUgYXQgdGhlIHRvcCBvZiB0aGUgc3RhZmYuXG4gICAgICovXG4gICAgcHVibGljIHZvaWQgRHJhdyhHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCwgV2hpdGVOb3RlIHRvcHN0YWZmKSB7XG4gICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uV2hvbGUpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgRHJhd1ZlcnRpY2FsTGluZShnLCBwZW4sIHl0b3AsIHRvcHN0YWZmKTtcbiAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5RdWFydGVyIHx8IFxuICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZFF1YXJ0ZXIgfHwgXG4gICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uSGFsZiB8fFxuICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEhhbGYgfHxcbiAgICAgICAgICAgIHJlY2VpdmVyX2luX3BhaXIpIHtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhaXIgIT0gbnVsbClcbiAgICAgICAgICAgIERyYXdIb3JpekJhclN0ZW0oZywgcGVuLCB5dG9wLCB0b3BzdGFmZik7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIERyYXdDdXJ2eVN0ZW0oZywgcGVuLCB5dG9wLCB0b3BzdGFmZik7XG4gICAgfVxuXG4gICAgLyoqIERyYXcgdGhlIHZlcnRpY2FsIGxpbmUgb2YgdGhlIHN0ZW0gXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHkgbG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEBwYXJhbSB0b3BzdGFmZiAgVGhlIG5vdGUgYXQgdGhlIHRvcCBvZiB0aGUgc3RhZmYuXG4gICAgICovXG4gICAgcHJpdmF0ZSB2b2lkIERyYXdWZXJ0aWNhbExpbmUoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3AsIFdoaXRlTm90ZSB0b3BzdGFmZikge1xuICAgICAgICBpbnQgeHN0YXJ0O1xuICAgICAgICBpZiAoc2lkZSA9PSBMZWZ0U2lkZSlcbiAgICAgICAgICAgIHhzdGFydCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyAxO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB4c3RhcnQgPSBTaGVldE11c2ljLkxpbmVTcGFjZS80ICsgU2hlZXRNdXNpYy5Ob3RlV2lkdGg7XG5cbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PSBVcCkge1xuICAgICAgICAgICAgaW50IHkxID0geXRvcCArIHRvcHN0YWZmLkRpc3QoYm90dG9tKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yIFxuICAgICAgICAgICAgICAgICAgICAgICArIFNoZWV0TXVzaWMuTm90ZUhlaWdodC80O1xuXG4gICAgICAgICAgICBpbnQgeXN0ZW0gPSB5dG9wICsgdG9wc3RhZmYuRGlzdChlbmQpICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG5cbiAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHkxLCB4c3RhcnQsIHlzdGVtKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkaXJlY3Rpb24gPT0gRG93bikge1xuICAgICAgICAgICAgaW50IHkxID0geXRvcCArIHRvcHN0YWZmLkRpc3QodG9wKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yIFxuICAgICAgICAgICAgICAgICAgICAgICArIFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcblxuICAgICAgICAgICAgaWYgKHNpZGUgPT0gTGVmdFNpZGUpXG4gICAgICAgICAgICAgICAgeTEgPSB5MSAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodC80O1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHkxID0geTEgLSBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcblxuICAgICAgICAgICAgaW50IHlzdGVtID0geXRvcCArIHRvcHN0YWZmLkRpc3QoZW5kKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yIFxuICAgICAgICAgICAgICAgICAgICAgICAgICArIFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcblxuICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeTEsIHhzdGFydCwgeXN0ZW0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIERyYXcgYSBjdXJ2eSBzdGVtIHRhaWwuICBUaGlzIGlzIG9ubHkgdXNlZCBmb3Igc2luZ2xlIGNob3Jkcywgbm90IGNob3JkIHBhaXJzLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5IGxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKiBAcGFyYW0gdG9wc3RhZmYgIFRoZSBub3RlIGF0IHRoZSB0b3Agb2YgdGhlIHN0YWZmLlxuICAgICAqL1xuICAgIHByaXZhdGUgdm9pZCBEcmF3Q3VydnlTdGVtKEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wLCBXaGl0ZU5vdGUgdG9wc3RhZmYpIHtcblxuICAgICAgICBwZW4uV2lkdGggPSAyO1xuXG4gICAgICAgIGludCB4c3RhcnQgPSAwO1xuICAgICAgICBpZiAoc2lkZSA9PSBMZWZ0U2lkZSlcbiAgICAgICAgICAgIHhzdGFydCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyAxO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB4c3RhcnQgPSBTaGVldE11c2ljLkxpbmVTcGFjZS80ICsgU2hlZXRNdXNpYy5Ob3RlV2lkdGg7XG5cbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PSBVcCkge1xuICAgICAgICAgICAgaW50IHlzdGVtID0geXRvcCArIHRvcHN0YWZmLkRpc3QoZW5kKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG5cbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRWlnaHRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UcmlwbGV0IHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0JlemllcihwZW4sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIHlzdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSArIDMqU2hlZXRNdXNpYy5MaW5lU3BhY2UvMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UqMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCozKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHlzdGVtICs9IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcblxuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG5cbiAgICAgICAgICAgICAgICBnLkRyYXdCZXppZXIocGVuLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCB5c3RlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gKyAzKlNoZWV0TXVzaWMuTGluZVNwYWNlLzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlKjIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZS8yLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gKyBTaGVldE11c2ljLk5vdGVIZWlnaHQqMyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHlzdGVtICs9IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG4gICAgICAgICAgICAgICAgZy5EcmF3QmV6aWVyKHBlbiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgeXN0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtICsgMypTaGVldE11c2ljLkxpbmVTcGFjZS8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZSoyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gKyBTaGVldE11c2ljLk5vdGVIZWlnaHQqMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBlbHNlIGlmIChkaXJlY3Rpb24gPT0gRG93bikge1xuICAgICAgICAgICAgaW50IHlzdGVtID0geXRvcCArIHRvcHN0YWZmLkRpc3QoZW5kKSpTaGVldE11c2ljLk5vdGVIZWlnaHQvMiArXG4gICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG5cbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRWlnaHRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UcmlwbGV0IHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0JlemllcihwZW4sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIHlzdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZSoyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gLSBTaGVldE11c2ljLk5vdGVIZWlnaHQqMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyIC0gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB5c3RlbSAtPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG5cbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uU2l4dGVlbnRoIHx8XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlRoaXJ0eVNlY29uZCkge1xuXG4gICAgICAgICAgICAgICAgZy5EcmF3QmV6aWVyKHBlbiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgeXN0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlKjIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5c3RlbSAtIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4c3RhcnQgKyBTaGVldE11c2ljLkxpbmVTcGFjZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIgLSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxpbmVTcGFjZS8yKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgeXN0ZW0gLT0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcbiAgICAgICAgICAgICAgICBnLkRyYXdCZXppZXIocGVuLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCB5c3RlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gLSBTaGVldE11c2ljLkxpbmVTcGFjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UqMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlzdGVtIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhzdGFydCArIFNoZWV0TXVzaWMuTGluZVNwYWNlLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeXN0ZW0gLSBTaGVldE11c2ljLk5vdGVIZWlnaHQqMiAtIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICAgICAgcGVuLldpZHRoID0gMTtcblxuICAgIH1cblxuICAgIC8qIERyYXcgYSBob3Jpem9udGFsIGJlYW0gc3RlbSwgY29ubmVjdGluZyB0aGlzIHN0ZW0gd2l0aCB0aGUgU3RlbSBwYWlyLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5IGxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKiBAcGFyYW0gdG9wc3RhZmYgIFRoZSBub3RlIGF0IHRoZSB0b3Agb2YgdGhlIHN0YWZmLlxuICAgICAqL1xuICAgIHByaXZhdGUgdm9pZCBEcmF3SG9yaXpCYXJTdGVtKEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wLCBXaGl0ZU5vdGUgdG9wc3RhZmYpIHtcbiAgICAgICAgcGVuLldpZHRoID0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG5cbiAgICAgICAgaW50IHhzdGFydCA9IDA7XG4gICAgICAgIGludCB4c3RhcnQyID0gMDtcblxuICAgICAgICBpZiAoc2lkZSA9PSBMZWZ0U2lkZSlcbiAgICAgICAgICAgIHhzdGFydCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyAxO1xuICAgICAgICBlbHNlIGlmIChzaWRlID09IFJpZ2h0U2lkZSlcbiAgICAgICAgICAgIHhzdGFydCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyBTaGVldE11c2ljLk5vdGVXaWR0aDtcblxuICAgICAgICBpZiAocGFpci5zaWRlID09IExlZnRTaWRlKVxuICAgICAgICAgICAgeHN0YXJ0MiA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyAxO1xuICAgICAgICBlbHNlIGlmIChwYWlyLnNpZGUgPT0gUmlnaHRTaWRlKVxuICAgICAgICAgICAgeHN0YXJ0MiA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzQgKyBTaGVldE11c2ljLk5vdGVXaWR0aDtcblxuXG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT0gVXApIHtcbiAgICAgICAgICAgIGludCB4ZW5kID0gd2lkdGhfdG9fcGFpciArIHhzdGFydDI7XG4gICAgICAgICAgICBpbnQgeXN0YXJ0ID0geXRvcCArIHRvcHN0YWZmLkRpc3QoZW5kKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICAgICAgaW50IHllbmQgPSB5dG9wICsgdG9wc3RhZmYuRGlzdChwYWlyLmVuZCkgKiBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcblxuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5FaWdodGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoIHx8IFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UcmlwbGV0IHx8IFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG5cbiAgICAgICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5c3RhcnQsIHhlbmQsIHllbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeXN0YXJ0ICs9IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgIHllbmQgKz0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuXG4gICAgICAgICAgICAvKiBBIGRvdHRlZCBlaWdodGggd2lsbCBjb25uZWN0IHRvIGEgMTZ0aCBub3RlLiAqL1xuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGgpIHtcbiAgICAgICAgICAgICAgICBpbnQgeCA9IHhlbmQgLSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICAgICAgZG91YmxlIHNsb3BlID0gKHllbmQgLSB5c3RhcnQpICogMS4wIC8gKHhlbmQgLSB4c3RhcnQpO1xuICAgICAgICAgICAgICAgIGludCB5ID0gKGludCkoc2xvcGUgKiAoeCAtIHhlbmQpICsgeWVuZCk7IFxuXG4gICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHgsIHksIHhlbmQsIHllbmQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHlzdGFydCwgeGVuZCwgeWVuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB5c3RhcnQgKz0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgeWVuZCArPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG4gICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeXN0YXJ0LCB4ZW5kLCB5ZW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaW50IHhlbmQgPSB3aWR0aF90b19wYWlyICsgeHN0YXJ0MjtcbiAgICAgICAgICAgIGludCB5c3RhcnQgPSB5dG9wICsgdG9wc3RhZmYuRGlzdChlbmQpICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgKyBcbiAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICBpbnQgeWVuZCA9IHl0b3AgKyB0b3BzdGFmZi5EaXN0KHBhaXIuZW5kKSAqIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yIFxuICAgICAgICAgICAgICAgICAgICAgICAgICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuXG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkVpZ2h0aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVHJpcGxldCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5TaXh0ZWVudGggfHxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG5cbiAgICAgICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5c3RhcnQsIHhlbmQsIHllbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeXN0YXJ0IC09IFNoZWV0TXVzaWMuTm90ZUhlaWdodDtcbiAgICAgICAgICAgIHllbmQgLT0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuXG4gICAgICAgICAgICAvKiBBIGRvdHRlZCBlaWdodGggd2lsbCBjb25uZWN0IHRvIGEgMTZ0aCBub3RlLiAqL1xuICAgICAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGgpIHtcbiAgICAgICAgICAgICAgICBpbnQgeCA9IHhlbmQgLSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICAgICAgZG91YmxlIHNsb3BlID0gKHllbmQgLSB5c3RhcnQpICogMS4wIC8gKHhlbmQgLSB4c3RhcnQpO1xuICAgICAgICAgICAgICAgIGludCB5ID0gKGludCkoc2xvcGUgKiAoeCAtIHhlbmQpICsgeWVuZCk7IFxuXG4gICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHgsIHksIHhlbmQsIHllbmQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCB8fFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHlzdGFydCwgeGVuZCwgeWVuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB5c3RhcnQgLT0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgeWVuZCAtPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChkdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kKSB7XG4gICAgICAgICAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeXN0YXJ0LCB4ZW5kLCB5ZW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiU3RlbSBkdXJhdGlvbj17MH0gZGlyZWN0aW9uPXsxfSB0b3A9ezJ9IGJvdHRvbT17M30gZW5kPXs0fVwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgb3ZlcmxhcD17NX0gc2lkZT17Nn0gd2lkdGhfdG9fcGFpcj17N30gcmVjZWl2ZXJfaW5fcGFpcj17OH1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHVyYXRpb24sIGRpcmVjdGlvbiwgdG9wLlRvU3RyaW5nKCksIGJvdHRvbS5Ub1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmQuVG9TdHJpbmcoKSwgbm90ZXNvdmVybGFwLCBzaWRlLCB3aWR0aF90b19wYWlyLCByZWNlaXZlcl9pbl9wYWlyKTtcbiAgICB9XG5cbn0gXG5cblxufVxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogQGNsYXNzIFN5bWJvbFdpZHRoc1xuICogVGhlIFN5bWJvbFdpZHRocyBjbGFzcyBpcyB1c2VkIHRvIHZlcnRpY2FsbHkgYWxpZ24gbm90ZXMgaW4gZGlmZmVyZW50XG4gKiB0cmFja3MgdGhhdCBvY2N1ciBhdCB0aGUgc2FtZSB0aW1lICh0aGF0IGhhdmUgdGhlIHNhbWUgc3RhcnR0aW1lKS5cbiAqIFRoaXMgaXMgZG9uZSBieSB0aGUgZm9sbG93aW5nOlxuICogLSBTdG9yZSBhIGxpc3Qgb2YgYWxsIHRoZSBzdGFydCB0aW1lcy5cbiAqIC0gU3RvcmUgdGhlIHdpZHRoIG9mIHN5bWJvbHMgZm9yIGVhY2ggc3RhcnQgdGltZSwgZm9yIGVhY2ggdHJhY2suXG4gKiAtIFN0b3JlIHRoZSBtYXhpbXVtIHdpZHRoIGZvciBlYWNoIHN0YXJ0IHRpbWUsIGFjcm9zcyBhbGwgdHJhY2tzLlxuICogLSBHZXQgdGhlIGV4dHJhIHdpZHRoIG5lZWRlZCBmb3IgZWFjaCB0cmFjayB0byBtYXRjaCB0aGUgbWF4aW11bVxuICogICB3aWR0aCBmb3IgdGhhdCBzdGFydCB0aW1lLlxuICpcbiAqIFNlZSBtZXRob2QgU2hlZXRNdXNpYy5BbGlnblN5bWJvbHMoKSwgd2hpY2ggdXNlcyB0aGlzIGNsYXNzLlxuICovXG5cbnB1YmxpYyBjbGFzcyBTeW1ib2xXaWR0aHMge1xuXG4gICAgLyoqIEFycmF5IG9mIG1hcHMgKHN0YXJ0dGltZSAtPiBzeW1ib2wgd2lkdGgpLCBvbmUgcGVyIHRyYWNrICovXG4gICAgcHJpdmF0ZSBEaWN0aW9uYXJ5PGludCwgaW50PltdIHdpZHRocztcblxuICAgIC8qKiBNYXAgb2Ygc3RhcnR0aW1lIC0+IG1heGltdW0gc3ltYm9sIHdpZHRoICovXG4gICAgcHJpdmF0ZSBEaWN0aW9uYXJ5PGludCwgaW50PiBtYXh3aWR0aHM7XG5cbiAgICAvKiogQW4gYXJyYXkgb2YgYWxsIHRoZSBzdGFydHRpbWVzLCBpbiBhbGwgdHJhY2tzICovXG4gICAgcHJpdmF0ZSBpbnRbXSBzdGFydHRpbWVzO1xuXG5cbiAgICAvKiogSW5pdGlhbGl6ZSB0aGUgc3ltYm9sIHdpZHRoIG1hcHMsIGdpdmVuIGFsbCB0aGUgc3ltYm9scyBpblxuICAgICAqIGFsbCB0aGUgdHJhY2tzLCBwbHVzIHRoZSBseXJpY3MgaW4gYWxsIHRyYWNrcy5cbiAgICAgKi9cbiAgICBwdWJsaWMgU3ltYm9sV2lkdGhzKExpc3Q8TXVzaWNTeW1ib2w+W10gdHJhY2tzLFxuICAgICAgICAgICAgICAgICAgICAgICAgTGlzdDxMeXJpY1N5bWJvbD5bXSB0cmFja2x5cmljcykge1xuXG4gICAgICAgIC8qIEdldCB0aGUgc3ltYm9sIHdpZHRocyBmb3IgYWxsIHRoZSB0cmFja3MgKi9cbiAgICAgICAgd2lkdGhzID0gbmV3IERpY3Rpb25hcnk8aW50LGludD5bIHRyYWNrcy5MZW5ndGggXTtcbiAgICAgICAgZm9yIChpbnQgdHJhY2sgPSAwOyB0cmFjayA8IHRyYWNrcy5MZW5ndGg7IHRyYWNrKyspIHtcbiAgICAgICAgICAgIHdpZHRoc1t0cmFja10gPSBHZXRUcmFja1dpZHRocyh0cmFja3NbdHJhY2tdKTtcbiAgICAgICAgfVxuICAgICAgICBtYXh3aWR0aHMgPSBuZXcgRGljdGlvbmFyeTxpbnQsaW50PigpO1xuXG4gICAgICAgIC8qIENhbGN1bGF0ZSB0aGUgbWF4aW11bSBzeW1ib2wgd2lkdGhzICovXG4gICAgICAgIGZvcmVhY2ggKERpY3Rpb25hcnk8aW50LGludD4gZGljdCBpbiB3aWR0aHMpIHtcbiAgICAgICAgICAgIGZvcmVhY2ggKGludCB0aW1lIGluIGRpY3QuS2V5cykge1xuICAgICAgICAgICAgICAgIGlmICghbWF4d2lkdGhzLkNvbnRhaW5zS2V5KHRpbWUpIHx8XG4gICAgICAgICAgICAgICAgICAgIChtYXh3aWR0aHNbdGltZV0gPCBkaWN0W3RpbWVdKSApIHtcblxuICAgICAgICAgICAgICAgICAgICBtYXh3aWR0aHNbdGltZV0gPSBkaWN0W3RpbWVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0cmFja2x5cmljcyAhPSBudWxsKSB7XG4gICAgICAgICAgICBmb3JlYWNoIChMaXN0PEx5cmljU3ltYm9sPiBseXJpY3MgaW4gdHJhY2tseXJpY3MpIHtcbiAgICAgICAgICAgICAgICBpZiAobHlyaWNzID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKEx5cmljU3ltYm9sIGx5cmljIGluIGx5cmljcykge1xuICAgICAgICAgICAgICAgICAgICBpbnQgd2lkdGggPSBseXJpYy5NaW5XaWR0aDtcbiAgICAgICAgICAgICAgICAgICAgaW50IHRpbWUgPSBseXJpYy5TdGFydFRpbWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICghbWF4d2lkdGhzLkNvbnRhaW5zS2V5KHRpbWUpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAobWF4d2lkdGhzW3RpbWVdIDwgd2lkdGgpICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXh3aWR0aHNbdGltZV0gPSB3aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFN0b3JlIGFsbCB0aGUgc3RhcnQgdGltZXMgdG8gdGhlIHN0YXJ0dGltZSBhcnJheSAqL1xuICAgICAgICBzdGFydHRpbWVzID0gbmV3IGludFsgbWF4d2lkdGhzLktleXMuQ291bnQgXTtcbiAgICAgICAgbWF4d2lkdGhzLktleXMuQ29weVRvKHN0YXJ0dGltZXMsIDApO1xuICAgICAgICBBcnJheS5Tb3J0PGludD4oc3RhcnR0aW1lcyk7XG4gICAgfVxuXG4gICAgLyoqIENyZWF0ZSBhIHRhYmxlIG9mIHRoZSBzeW1ib2wgd2lkdGhzIGZvciBlYWNoIHN0YXJ0dGltZSBpbiB0aGUgdHJhY2suICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgRGljdGlvbmFyeTxpbnQsaW50PiBHZXRUcmFja1dpZHRocyhMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzKSB7XG4gICAgICAgIERpY3Rpb25hcnk8aW50LGludD4gd2lkdGhzID0gbmV3IERpY3Rpb25hcnk8aW50LGludD4oKTtcblxuICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBtIGluIHN5bWJvbHMpIHtcbiAgICAgICAgICAgIGludCBzdGFydCA9IG0uU3RhcnRUaW1lO1xuICAgICAgICAgICAgaW50IHcgPSBtLk1pbldpZHRoO1xuXG4gICAgICAgICAgICBpZiAobSBpcyBCYXJTeW1ib2wpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHdpZHRocy5Db250YWluc0tleShzdGFydCkpIHtcbiAgICAgICAgICAgICAgICB3aWR0aHNbc3RhcnRdICs9IHc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB3aWR0aHNbc3RhcnRdID0gdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gd2lkdGhzO1xuICAgIH1cblxuICAgIC8qKiBHaXZlbiBhIHRyYWNrIGFuZCBhIHN0YXJ0IHRpbWUsIHJldHVybiB0aGUgZXh0cmEgd2lkdGggbmVlZGVkIHNvIHRoYXRcbiAgICAgKiB0aGUgc3ltYm9scyBmb3IgdGhhdCBzdGFydCB0aW1lIGFsaWduIHdpdGggdGhlIG90aGVyIHRyYWNrcy5cbiAgICAgKi9cbiAgICBwdWJsaWMgaW50IEdldEV4dHJhV2lkdGgoaW50IHRyYWNrLCBpbnQgc3RhcnQpIHtcbiAgICAgICAgaWYgKCF3aWR0aHNbdHJhY2tdLkNvbnRhaW5zS2V5KHN0YXJ0KSkge1xuICAgICAgICAgICAgcmV0dXJuIG1heHdpZHRoc1tzdGFydF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbWF4d2lkdGhzW3N0YXJ0XSAtIHdpZHRoc1t0cmFja11bc3RhcnRdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiBhbiBhcnJheSBvZiBhbGwgdGhlIHN0YXJ0IHRpbWVzIGluIGFsbCB0aGUgdHJhY2tzICovXG4gICAgcHVibGljIGludFtdIFN0YXJ0VGltZXMge1xuICAgICAgICBnZXQgeyByZXR1cm4gc3RhcnR0aW1lczsgfVxuICAgIH1cblxuXG5cblxufVxuXG5cbn1cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMSBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIFRoZSBwb3NzaWJsZSBub3RlIGR1cmF0aW9ucyAqL1xucHVibGljIGVudW0gTm90ZUR1cmF0aW9uIHtcbiAgVGhpcnR5U2Vjb25kLCBTaXh0ZWVudGgsIFRyaXBsZXQsIEVpZ2h0aCxcbiAgRG90dGVkRWlnaHRoLCBRdWFydGVyLCBEb3R0ZWRRdWFydGVyLFxuICBIYWxmLCBEb3R0ZWRIYWxmLCBXaG9sZVxufTtcblxuLyoqIEBjbGFzcyBUaW1lU2lnbmF0dXJlXG4gKiBUaGUgVGltZVNpZ25hdHVyZSBjbGFzcyByZXByZXNlbnRzXG4gKiAtIFRoZSB0aW1lIHNpZ25hdHVyZSBvZiB0aGUgc29uZywgc3VjaCBhcyA0LzQsIDMvNCwgb3IgNi84IHRpbWUsIGFuZFxuICogLSBUaGUgbnVtYmVyIG9mIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlXG4gKiAtIFRoZSBudW1iZXIgb2YgbWljcm9zZWNvbmRzIHBlciBxdWFydGVyIG5vdGVcbiAqXG4gKiBJbiBtaWRpIGZpbGVzLCBhbGwgdGltZSBpcyBtZWFzdXJlZCBpbiBcInB1bHNlc1wiLiAgRWFjaCBub3RlIGhhc1xuICogYSBzdGFydCB0aW1lIChtZWFzdXJlZCBpbiBwdWxzZXMpLCBhbmQgYSBkdXJhdGlvbiAobWVhc3VyZWQgaW4gXG4gKiBwdWxzZXMpLiAgVGhpcyBjbGFzcyBpcyB1c2VkIG1haW5seSB0byBjb252ZXJ0IHB1bHNlIGR1cmF0aW9uc1xuICogKGxpa2UgMTIwLCAyNDAsIGV0YykgaW50byBub3RlIGR1cmF0aW9ucyAoaGFsZiwgcXVhcnRlciwgZWlnaHRoLCBldGMpLlxuICovXG5cbnB1YmxpYyBjbGFzcyBUaW1lU2lnbmF0dXJlIHtcbiAgICBwcml2YXRlIGludCBudW1lcmF0b3I7ICAgICAgLyoqIE51bWVyYXRvciBvZiB0aGUgdGltZSBzaWduYXR1cmUgKi9cbiAgICBwcml2YXRlIGludCBkZW5vbWluYXRvcjsgICAgLyoqIERlbm9taW5hdG9yIG9mIHRoZSB0aW1lIHNpZ25hdHVyZSAqL1xuICAgIHByaXZhdGUgaW50IHF1YXJ0ZXJub3RlOyAgICAvKiogTnVtYmVyIG9mIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlICovXG4gICAgcHJpdmF0ZSBpbnQgbWVhc3VyZTsgICAgICAgIC8qKiBOdW1iZXIgb2YgcHVsc2VzIHBlciBtZWFzdXJlICovXG4gICAgcHJpdmF0ZSBpbnQgdGVtcG87ICAgICAgICAgIC8qKiBOdW1iZXIgb2YgbWljcm9zZWNvbmRzIHBlciBxdWFydGVyIG5vdGUgKi9cblxuICAgIC8qKiBHZXQgdGhlIG51bWVyYXRvciBvZiB0aGUgdGltZSBzaWduYXR1cmUgKi9cbiAgICBwdWJsaWMgaW50IE51bWVyYXRvciB7XG4gICAgICAgIGdldCB7IHJldHVybiBudW1lcmF0b3I7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBkZW5vbWluYXRvciBvZiB0aGUgdGltZSBzaWduYXR1cmUgKi9cbiAgICBwdWJsaWMgaW50IERlbm9taW5hdG9yIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIGRlbm9taW5hdG9yOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlICovXG4gICAgcHVibGljIGludCBRdWFydGVyIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHF1YXJ0ZXJub3RlOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHB1bHNlcyBwZXIgbWVhc3VyZSAqL1xuICAgIHB1YmxpYyBpbnQgTWVhc3VyZSB7XG4gICAgICAgIGdldCB7IHJldHVybiBtZWFzdXJlOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIG1pY3Jvc2Vjb25kcyBwZXIgcXVhcnRlciBub3RlICovIFxuICAgIHB1YmxpYyBpbnQgVGVtcG8ge1xuICAgICAgICBnZXQgeyByZXR1cm4gdGVtcG87IH1cbiAgICB9XG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IHRpbWUgc2lnbmF0dXJlLCB3aXRoIHRoZSBnaXZlbiBudW1lcmF0b3IsXG4gICAgICogZGVub21pbmF0b3IsIHB1bHNlcyBwZXIgcXVhcnRlciBub3RlLCBhbmQgdGVtcG8uXG4gICAgICovXG4gICAgcHVibGljIFRpbWVTaWduYXR1cmUoaW50IG51bWVyYXRvciwgaW50IGRlbm9taW5hdG9yLCBpbnQgcXVhcnRlcm5vdGUsIGludCB0ZW1wbykge1xuICAgICAgICBpZiAobnVtZXJhdG9yIDw9IDAgfHwgZGVub21pbmF0b3IgPD0gMCB8fCBxdWFydGVybm90ZSA8PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTWlkaUZpbGVFeGNlcHRpb24oXCJJbnZhbGlkIHRpbWUgc2lnbmF0dXJlXCIsIDApO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogTWlkaSBGaWxlIGdpdmVzIHdyb25nIHRpbWUgc2lnbmF0dXJlIHNvbWV0aW1lcyAqL1xuICAgICAgICBpZiAobnVtZXJhdG9yID09IDUpIHtcbiAgICAgICAgICAgIG51bWVyYXRvciA9IDQ7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm51bWVyYXRvciA9IG51bWVyYXRvcjtcbiAgICAgICAgdGhpcy5kZW5vbWluYXRvciA9IGRlbm9taW5hdG9yO1xuICAgICAgICB0aGlzLnF1YXJ0ZXJub3RlID0gcXVhcnRlcm5vdGU7XG4gICAgICAgIHRoaXMudGVtcG8gPSB0ZW1wbztcblxuICAgICAgICBpbnQgYmVhdDtcbiAgICAgICAgaWYgKGRlbm9taW5hdG9yIDwgNClcbiAgICAgICAgICAgIGJlYXQgPSBxdWFydGVybm90ZSAqIDI7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJlYXQgPSBxdWFydGVybm90ZSAvIChkZW5vbWluYXRvci80KTtcblxuICAgICAgICBtZWFzdXJlID0gbnVtZXJhdG9yICogYmVhdDtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHdoaWNoIG1lYXN1cmUgdGhlIGdpdmVuIHRpbWUgKGluIHB1bHNlcykgYmVsb25ncyB0by4gKi9cbiAgICBwdWJsaWMgaW50IEdldE1lYXN1cmUoaW50IHRpbWUpIHtcbiAgICAgICAgcmV0dXJuIHRpbWUgLyBtZWFzdXJlO1xuICAgIH1cblxuICAgIC8qKiBHaXZlbiBhIGR1cmF0aW9uIGluIHB1bHNlcywgcmV0dXJuIHRoZSBjbG9zZXN0IG5vdGUgZHVyYXRpb24uICovXG4gICAgcHVibGljIE5vdGVEdXJhdGlvbiBHZXROb3RlRHVyYXRpb24oaW50IGR1cmF0aW9uKSB7XG4gICAgICAgIGludCB3aG9sZSA9IHF1YXJ0ZXJub3RlICogNDtcblxuICAgICAgICAvKipcbiAgICAgICAgIDEgICAgICAgPSAzMi8zMlxuICAgICAgICAgMy80ICAgICA9IDI0LzMyXG4gICAgICAgICAxLzIgICAgID0gMTYvMzJcbiAgICAgICAgIDMvOCAgICAgPSAxMi8zMlxuICAgICAgICAgMS80ICAgICA9ICA4LzMyXG4gICAgICAgICAzLzE2ICAgID0gIDYvMzJcbiAgICAgICAgIDEvOCAgICAgPSAgNC8zMiA9ICAgIDgvNjRcbiAgICAgICAgIHRyaXBsZXQgICAgICAgICA9IDUuMzMvNjRcbiAgICAgICAgIDEvMTYgICAgPSAgMi8zMiA9ICAgIDQvNjRcbiAgICAgICAgIDEvMzIgICAgPSAgMS8zMiA9ICAgIDIvNjRcbiAgICAgICAgICoqLyBcblxuICAgICAgICBpZiAgICAgIChkdXJhdGlvbiA+PSAyOCp3aG9sZS8zMilcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uV2hvbGU7XG4gICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID49IDIwKndob2xlLzMyKSBcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uRG90dGVkSGFsZjtcbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPj0gMTQqd2hvbGUvMzIpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLkhhbGY7XG4gICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID49IDEwKndob2xlLzMyKVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5Eb3R0ZWRRdWFydGVyO1xuICAgICAgICBlbHNlIGlmIChkdXJhdGlvbiA+PSAgNyp3aG9sZS8zMilcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uUXVhcnRlcjtcbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPj0gIDUqd2hvbGUvMzIpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aDtcbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPj0gIDYqd2hvbGUvNjQpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLkVpZ2h0aDtcbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPj0gIDUqd2hvbGUvNjQpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLlRyaXBsZXQ7XG4gICAgICAgIGVsc2UgaWYgKGR1cmF0aW9uID49ICAzKndob2xlLzY0KVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5TaXh0ZWVudGg7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kO1xuICAgIH1cblxuICAgIC8qKiBDb252ZXJ0IGEgbm90ZSBkdXJhdGlvbiBpbnRvIGEgc3RlbSBkdXJhdGlvbi4gIERvdHRlZCBkdXJhdGlvbnNcbiAgICAgKiBhcmUgY29udmVydGVkIGludG8gdGhlaXIgbm9uLWRvdHRlZCBlcXVpdmFsZW50cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIE5vdGVEdXJhdGlvbiBHZXRTdGVtRHVyYXRpb24oTm90ZUR1cmF0aW9uIGR1cikge1xuICAgICAgICBpZiAoZHVyID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRIYWxmKVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5IYWxmO1xuICAgICAgICBlbHNlIGlmIChkdXIgPT0gTm90ZUR1cmF0aW9uLkRvdHRlZFF1YXJ0ZXIpXG4gICAgICAgICAgICByZXR1cm4gTm90ZUR1cmF0aW9uLlF1YXJ0ZXI7XG4gICAgICAgIGVsc2UgaWYgKGR1ciA9PSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoKVxuICAgICAgICAgICAgcmV0dXJuIE5vdGVEdXJhdGlvbi5FaWdodGg7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBkdXI7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgdGltZSBwZXJpb2QgKGluIHB1bHNlcykgdGhlIHRoZSBnaXZlbiBkdXJhdGlvbiBzcGFucyAqL1xuICAgIHB1YmxpYyBpbnQgRHVyYXRpb25Ub1RpbWUoTm90ZUR1cmF0aW9uIGR1cikge1xuICAgICAgICBpbnQgZWlnaHRoID0gcXVhcnRlcm5vdGUvMjtcbiAgICAgICAgaW50IHNpeHRlZW50aCA9IGVpZ2h0aC8yO1xuXG4gICAgICAgIHN3aXRjaCAoZHVyKSB7XG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5XaG9sZTogICAgICAgICByZXR1cm4gcXVhcnRlcm5vdGUgKiA0OyBcbiAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkRvdHRlZEhhbGY6ICAgIHJldHVybiBxdWFydGVybm90ZSAqIDM7IFxuICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uSGFsZjogICAgICAgICAgcmV0dXJuIHF1YXJ0ZXJub3RlICogMjsgXG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5Eb3R0ZWRRdWFydGVyOiByZXR1cm4gMyplaWdodGg7IFxuICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uUXVhcnRlcjogICAgICAgcmV0dXJuIHF1YXJ0ZXJub3RlOyBcbiAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aDogIHJldHVybiAzKnNpeHRlZW50aDtcbiAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkVpZ2h0aDogICAgICAgIHJldHVybiBlaWdodGg7XG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5UcmlwbGV0OiAgICAgICByZXR1cm4gcXVhcnRlcm5vdGUvMzsgXG4gICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5TaXh0ZWVudGg6ICAgICByZXR1cm4gc2l4dGVlbnRoO1xuICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uVGhpcnR5U2Vjb25kOiAgcmV0dXJuIHNpeHRlZW50aC8yOyBcbiAgICAgICAgICAgIGRlZmF1bHQ6ICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgb3ZlcnJpZGUgXG4gICAgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gc3RyaW5nLkZvcm1hdChcIlRpbWVTaWduYXR1cmU9ezB9L3sxfSBxdWFydGVyPXsyfSB0ZW1wbz17M31cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtZXJhdG9yLCBkZW5vbWluYXRvciwgcXVhcnRlcm5vdGUsIHRlbXBvKTtcbiAgICB9XG4gICAgXG59XG5cbn1cblxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG51c2luZyBTeXN0ZW0uVGhyZWFkaW5nLlRhc2tzO1xyXG5cclxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljQnJpZGdlLlRleHRcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEFTQ0lJXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIHN0cmluZyBHZXRTdHJpbmcoYnl0ZVtdIGRhdGEsIGludCBzdGFydEluZGV4LCBpbnQgbGVuKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIHRvUmV0dXJuID0gXCJcIjtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW4gJiYgaSA8IGRhdGEuTGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgICAgICB0b1JldHVybiArPSAoY2hhcilkYXRhW2kgKyBzdGFydEluZGV4XTtcclxuICAgICAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY0JyaWRnZS5UZXh0XHJcbntcclxuICAgIHB1YmxpYyBzdGF0aWMgY2xhc3MgRW5jb2RpbmdcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIEFTQ0lJIEFTQ0lJID0gbmV3IEFTQ0lJKCk7XHJcbiAgICB9XHJcbn1cclxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG5cbi8qKiBBY2NpZGVudGFscyAqL1xucHVibGljIGVudW0gQWNjaWQge1xuICAgIE5vbmUsIFNoYXJwLCBGbGF0LCBOYXR1cmFsXG59XG5cbi8qKiBAY2xhc3MgQWNjaWRTeW1ib2xcbiAqIEFuIGFjY2lkZW50YWwgKGFjY2lkKSBzeW1ib2wgcmVwcmVzZW50cyBhIHNoYXJwLCBmbGF0LCBvciBuYXR1cmFsXG4gKiBhY2NpZGVudGFsIHRoYXQgaXMgZGlzcGxheWVkIGF0IGEgc3BlY2lmaWMgcG9zaXRpb24gKG5vdGUgYW5kIGNsZWYpLlxuICovXG5wdWJsaWMgY2xhc3MgQWNjaWRTeW1ib2wgOiBNdXNpY1N5bWJvbCB7XG4gICAgcHJpdmF0ZSBBY2NpZCBhY2NpZDsgICAgICAgICAgLyoqIFRoZSBhY2NpZGVudGFsIChzaGFycCwgZmxhdCwgbmF0dXJhbCkgKi9cbiAgICBwcml2YXRlIFdoaXRlTm90ZSB3aGl0ZW5vdGU7ICAvKiogVGhlIHdoaXRlIG5vdGUgd2hlcmUgdGhlIHN5bWJvbCBvY2N1cnMgKi9cbiAgICBwcml2YXRlIENsZWYgY2xlZjsgICAgICAgICAgICAvKiogV2hpY2ggY2xlZiB0aGUgc3ltYm9scyBpcyBpbiAqL1xuICAgIHByaXZhdGUgaW50IHdpZHRoOyAgICAgICAgICAgIC8qKiBXaWR0aCBvZiBzeW1ib2wgKi9cblxuICAgIC8qKiBcbiAgICAgKiBDcmVhdGUgYSBuZXcgQWNjaWRTeW1ib2wgd2l0aCB0aGUgZ2l2ZW4gYWNjaWRlbnRhbCwgdGhhdCBpc1xuICAgICAqIGRpc3BsYXllZCBhdCB0aGUgZ2l2ZW4gbm90ZSBpbiB0aGUgZ2l2ZW4gY2xlZi5cbiAgICAgKi9cbiAgICBwdWJsaWMgQWNjaWRTeW1ib2woQWNjaWQgYWNjaWQsIFdoaXRlTm90ZSBub3RlLCBDbGVmIGNsZWYpIHtcbiAgICAgICAgdGhpcy5hY2NpZCA9IGFjY2lkO1xuICAgICAgICB0aGlzLndoaXRlbm90ZSA9IG5vdGU7XG4gICAgICAgIHRoaXMuY2xlZiA9IGNsZWY7XG4gICAgICAgIHdpZHRoID0gTWluV2lkdGg7XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0aGUgd2hpdGUgbm90ZSB0aGlzIGFjY2lkZW50YWwgaXMgZGlzcGxheWVkIGF0ICovXG4gICAgcHVibGljIFdoaXRlTm90ZSBOb3RlICB7XG4gICAgICAgIGdldCB7IHJldHVybiB3aGl0ZW5vdGU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSB0aW1lIChpbiBwdWxzZXMpIHRoaXMgc3ltYm9sIG9jY3VycyBhdC5cbiAgICAgKiBOb3QgdXNlZC4gIEluc3RlYWQsIHRoZSBTdGFydFRpbWUgb2YgdGhlIENob3JkU3ltYm9sIGNvbnRhaW5pbmcgdGhpc1xuICAgICAqIEFjY2lkU3ltYm9sIGlzIHVzZWQuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBTdGFydFRpbWUgeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIC0xOyB9ICBcbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBtaW5pbXVtIHdpZHRoIChpbiBwaXhlbHMpIG5lZWRlZCB0byBkcmF3IHRoaXMgc3ltYm9sICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBNaW5XaWR0aCB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gMypTaGVldE11c2ljLk5vdGVIZWlnaHQvMjsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQvU2V0IHRoZSB3aWR0aCAoaW4gcGl4ZWxzKSBvZiB0aGlzIHN5bWJvbC4gVGhlIHdpZHRoIGlzIHNldFxuICAgICAqIGluIFNoZWV0TXVzaWMuQWxpZ25TeW1ib2xzKCkgdG8gdmVydGljYWxseSBhbGlnbiBzeW1ib2xzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgV2lkdGgge1xuICAgICAgICBnZXQgeyByZXR1cm4gd2lkdGg7IH1cbiAgICAgICAgc2V0IHsgd2lkdGggPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBhYm92ZSB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBBYm92ZVN0YWZmIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIEdldEFib3ZlU3RhZmYoKTsgfVxuICAgIH1cblxuICAgIGludCBHZXRBYm92ZVN0YWZmKCkge1xuICAgICAgICBpbnQgZGlzdCA9IFdoaXRlTm90ZS5Ub3AoY2xlZikuRGlzdCh3aGl0ZW5vdGUpICogXG4gICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG4gICAgICAgIGlmIChhY2NpZCA9PSBBY2NpZC5TaGFycCB8fCBhY2NpZCA9PSBBY2NpZC5OYXR1cmFsKVxuICAgICAgICAgICAgZGlzdCAtPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgIGVsc2UgaWYgKGFjY2lkID09IEFjY2lkLkZsYXQpXG4gICAgICAgICAgICBkaXN0IC09IDMqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG5cbiAgICAgICAgaWYgKGRpc3QgPCAwKVxuICAgICAgICAgICAgcmV0dXJuIC1kaXN0O1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYmVsb3cgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQmVsb3dTdGFmZiB7XG4gICAgICAgIGdldCB7IHJldHVybiBHZXRCZWxvd1N0YWZmKCk7IH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGludCBHZXRCZWxvd1N0YWZmKCkge1xuICAgICAgICBpbnQgZGlzdCA9IFdoaXRlTm90ZS5Cb3R0b20oY2xlZikuRGlzdCh3aGl0ZW5vdGUpICogXG4gICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgKyBcbiAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgIGlmIChhY2NpZCA9PSBBY2NpZC5TaGFycCB8fCBhY2NpZCA9PSBBY2NpZC5OYXR1cmFsKSBcbiAgICAgICAgICAgIGRpc3QgKz0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuXG4gICAgICAgIGlmIChkaXN0ID4gMClcbiAgICAgICAgICAgIHJldHVybiBkaXN0O1xuICAgICAgICBlbHNlIFxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgLyoqIERyYXcgdGhlIHN5bWJvbC5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIC8qIEFsaWduIHRoZSBzeW1ib2wgdG8gdGhlIHJpZ2h0ICovXG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKFdpZHRoIC0gTWluV2lkdGgsIDApO1xuXG4gICAgICAgIC8qIFN0b3JlIHRoZSB5LXBpeGVsIHZhbHVlIG9mIHRoZSB0b3Agb2YgdGhlIHdoaXRlbm90ZSBpbiB5bm90ZS4gKi9cbiAgICAgICAgaW50IHlub3RlID0geXRvcCArIFdoaXRlTm90ZS5Ub3AoY2xlZikuRGlzdCh3aGl0ZW5vdGUpICogXG4gICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG4gICAgICAgIGlmIChhY2NpZCA9PSBBY2NpZC5TaGFycClcbiAgICAgICAgICAgIERyYXdTaGFycChnLCBwZW4sIHlub3RlKTtcbiAgICAgICAgZWxzZSBpZiAoYWNjaWQgPT0gQWNjaWQuRmxhdClcbiAgICAgICAgICAgIERyYXdGbGF0KGcsIHBlbiwgeW5vdGUpO1xuICAgICAgICBlbHNlIGlmIChhY2NpZCA9PSBBY2NpZC5OYXR1cmFsKVxuICAgICAgICAgICAgRHJhd05hdHVyYWwoZywgcGVuLCB5bm90ZSk7XG5cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShXaWR0aCAtIE1pbldpZHRoKSwgMCk7XG4gICAgfVxuXG4gICAgLyoqIERyYXcgYSBzaGFycCBzeW1ib2wuIFxuICAgICAqIEBwYXJhbSB5bm90ZSBUaGUgcGl4ZWwgbG9jYXRpb24gb2YgdGhlIHRvcCBvZiB0aGUgYWNjaWRlbnRhbCdzIG5vdGUuIFxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIERyYXdTaGFycChHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeW5vdGUpIHtcblxuICAgICAgICAvKiBEcmF3IHRoZSB0d28gdmVydGljYWwgbGluZXMgKi9cbiAgICAgICAgaW50IHlzdGFydCA9IHlub3RlIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICBpbnQgeWVuZCA9IHlub3RlICsgMipTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgIGludCB4ID0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCB4LCB5c3RhcnQgKyAyLCB4LCB5ZW5kKTtcbiAgICAgICAgeCArPSBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHgsIHlzdGFydCwgeCwgeWVuZCAtIDIpO1xuXG4gICAgICAgIC8qIERyYXcgdGhlIHNsaWdodGx5IHVwd2FyZHMgaG9yaXpvbnRhbCBsaW5lcyAqL1xuICAgICAgICBpbnQgeHN0YXJ0ID0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgLSBTaGVldE11c2ljLk5vdGVIZWlnaHQvNDtcbiAgICAgICAgaW50IHhlbmQgPSBTaGVldE11c2ljLk5vdGVIZWlnaHQgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQvNDtcbiAgICAgICAgeXN0YXJ0ID0geW5vdGUgKyBTaGVldE11c2ljLkxpbmVXaWR0aDtcbiAgICAgICAgeWVuZCA9IHlzdGFydCAtIFNoZWV0TXVzaWMuTGluZVdpZHRoIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvNDtcbiAgICAgICAgcGVuLldpZHRoID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvMjtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHhzdGFydCwgeXN0YXJ0LCB4ZW5kLCB5ZW5kKTtcbiAgICAgICAgeXN0YXJ0ICs9IFNoZWV0TXVzaWMuTGluZVNwYWNlO1xuICAgICAgICB5ZW5kICs9IFNoZWV0TXVzaWMuTGluZVNwYWNlO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5c3RhcnQsIHhlbmQsIHllbmQpO1xuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgIH1cblxuICAgIC8qKiBEcmF3IGEgZmxhdCBzeW1ib2wuXG4gICAgICogQHBhcmFtIHlub3RlIFRoZSBwaXhlbCBsb2NhdGlvbiBvZiB0aGUgdG9wIG9mIHRoZSBhY2NpZGVudGFsJ3Mgbm90ZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3RmxhdChHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeW5vdGUpIHtcbiAgICAgICAgaW50IHggPSBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuXG4gICAgICAgIC8qIERyYXcgdGhlIHZlcnRpY2FsIGxpbmUgKi9cbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHgsIHlub3RlIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0IC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIsXG4gICAgICAgICAgICAgICAgICAgICAgICB4LCB5bm90ZSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCk7XG5cbiAgICAgICAgLyogRHJhdyAzIGJlemllciBjdXJ2ZXMuXG4gICAgICAgICAqIEFsbCAzIGN1cnZlcyBzdGFydCBhbmQgc3RvcCBhdCB0aGUgc2FtZSBwb2ludHMuXG4gICAgICAgICAqIEVhY2ggc3Vic2VxdWVudCBjdXJ2ZSBidWxnZXMgbW9yZSBhbmQgbW9yZSB0b3dhcmRzIFxuICAgICAgICAgKiB0aGUgdG9wcmlnaHQgY29ybmVyLCBtYWtpbmcgdGhlIGN1cnZlIGxvb2sgdGhpY2tlclxuICAgICAgICAgKiB0b3dhcmRzIHRoZSB0b3AtcmlnaHQuXG4gICAgICAgICAqL1xuICAgICAgICBnLkRyYXdCZXppZXIocGVuLCB4LCB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQsXG4gICAgICAgICAgICB4ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMiwgeW5vdGUgLSBTaGVldE11c2ljLkxpbmVTcGFjZS8yLFxuICAgICAgICAgICAgeCArIFNoZWV0TXVzaWMuTGluZVNwYWNlLCB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzMsXG4gICAgICAgICAgICB4LCB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlICsgU2hlZXRNdXNpYy5MaW5lV2lkdGggKyAxKTtcblxuICAgICAgICBnLkRyYXdCZXppZXIocGVuLCB4LCB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQsXG4gICAgICAgICAgICB4ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMiwgeW5vdGUgLSBTaGVldE11c2ljLkxpbmVTcGFjZS8yLFxuICAgICAgICAgICAgeCArIFNoZWV0TXVzaWMuTGluZVNwYWNlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCwgXG4gICAgICAgICAgICAgIHlub3RlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMyAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQsXG4gICAgICAgICAgICB4LCB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlICsgU2hlZXRNdXNpYy5MaW5lV2lkdGggKyAxKTtcblxuXG4gICAgICAgIGcuRHJhd0JlemllcihwZW4sIHgsIHlub3RlICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCxcbiAgICAgICAgICAgIHggKyBTaGVldE11c2ljLkxpbmVTcGFjZS8yLCB5bm90ZSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzIsXG4gICAgICAgICAgICB4ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UgKyBTaGVldE11c2ljLkxpbmVTcGFjZS8yLCBcbiAgICAgICAgICAgICB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlLzMgLSBTaGVldE11c2ljLkxpbmVTcGFjZS8yLFxuICAgICAgICAgICAgeCwgeW5vdGUgKyBTaGVldE11c2ljLkxpbmVTcGFjZSArIFNoZWV0TXVzaWMuTGluZVdpZHRoICsgMSk7XG5cblxuICAgIH1cblxuICAgIC8qKiBEcmF3IGEgbmF0dXJhbCBzeW1ib2wuXG4gICAgICogQHBhcmFtIHlub3RlIFRoZSBwaXhlbCBsb2NhdGlvbiBvZiB0aGUgdG9wIG9mIHRoZSBhY2NpZGVudGFsJ3Mgbm90ZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3TmF0dXJhbChHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeW5vdGUpIHtcblxuICAgICAgICAvKiBEcmF3IHRoZSB0d28gdmVydGljYWwgbGluZXMgKi9cbiAgICAgICAgaW50IHlzdGFydCA9IHlub3RlIC0gU2hlZXRNdXNpYy5MaW5lU3BhY2UgLSBTaGVldE11c2ljLkxpbmVXaWR0aDtcbiAgICAgICAgaW50IHllbmQgPSB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVNwYWNlICsgU2hlZXRNdXNpYy5MaW5lV2lkdGg7XG4gICAgICAgIGludCB4ID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvMjtcbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHgsIHlzdGFydCwgeCwgeWVuZCk7XG4gICAgICAgIHggKz0gU2hlZXRNdXNpYy5MaW5lU3BhY2UgLSBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuICAgICAgICB5c3RhcnQgPSB5bm90ZSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQ7XG4gICAgICAgIHllbmQgPSB5bm90ZSArIDIqU2hlZXRNdXNpYy5MaW5lU3BhY2UgKyBTaGVldE11c2ljLkxpbmVXaWR0aCAtIFxuICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeCwgeXN0YXJ0LCB4LCB5ZW5kKTtcblxuICAgICAgICAvKiBEcmF3IHRoZSBzbGlnaHRseSB1cHdhcmRzIGhvcml6b250YWwgbGluZXMgKi9cbiAgICAgICAgaW50IHhzdGFydCA9IFNoZWV0TXVzaWMuTGluZVNwYWNlLzI7XG4gICAgICAgIGludCB4ZW5kID0geHN0YXJ0ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UgLSBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuICAgICAgICB5c3RhcnQgPSB5bm90ZSArIFNoZWV0TXVzaWMuTGluZVdpZHRoO1xuICAgICAgICB5ZW5kID0geXN0YXJ0IC0gU2hlZXRNdXNpYy5MaW5lV2lkdGggLSBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuICAgICAgICBwZW4uV2lkdGggPSBTaGVldE11c2ljLkxpbmVTcGFjZS8yO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeHN0YXJ0LCB5c3RhcnQsIHhlbmQsIHllbmQpO1xuICAgICAgICB5c3RhcnQgKz0gU2hlZXRNdXNpYy5MaW5lU3BhY2U7XG4gICAgICAgIHllbmQgKz0gU2hlZXRNdXNpYy5MaW5lU3BhY2U7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCB4c3RhcnQsIHlzdGFydCwgeGVuZCwgeWVuZCk7XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXG4gICAgICAgICAgXCJBY2NpZFN5bWJvbCBhY2NpZD17MH0gd2hpdGVub3RlPXsxfSBjbGVmPXsyfSB3aWR0aD17M31cIixcbiAgICAgICAgICBhY2NpZCwgd2hpdGVub3RlLCBjbGVmLCB3aWR0aCk7XG4gICAgfVxuXG59XG5cbn1cblxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cblxuLyoqIEBjbGFzcyBCYXJTeW1ib2xcbiAqIFRoZSBCYXJTeW1ib2wgcmVwcmVzZW50cyB0aGUgdmVydGljYWwgYmFycyB3aGljaCBkZWxpbWl0IG1lYXN1cmVzLlxuICogVGhlIHN0YXJ0dGltZSBvZiB0aGUgc3ltYm9sIGlzIHRoZSBiZWdpbm5pbmcgb2YgdGhlIG5ld1xuICogbWVhc3VyZS5cbiAqL1xucHVibGljIGNsYXNzIEJhclN5bWJvbCA6IE11c2ljU3ltYm9sIHtcbiAgICBwcml2YXRlIGludCBzdGFydHRpbWU7XG4gICAgcHJpdmF0ZSBpbnQgd2lkdGg7XG5cbiAgICAvKiogQ3JlYXRlIGEgQmFyU3ltYm9sLiBUaGUgc3RhcnR0aW1lIHNob3VsZCBiZSB0aGUgYmVnaW5uaW5nIG9mIGEgbWVhc3VyZS4gKi9cbiAgICBwdWJsaWMgQmFyU3ltYm9sKGludCBzdGFydHRpbWUpIHtcbiAgICAgICAgdGhpcy5zdGFydHRpbWUgPSBzdGFydHRpbWU7XG4gICAgICAgIHdpZHRoID0gTWluV2lkdGg7XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgdGltZSAoaW4gcHVsc2VzKSB0aGlzIHN5bWJvbCBvY2N1cnMgYXQuXG4gICAgICogVGhpcyBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgbWVhc3VyZSB0aGlzIHN5bWJvbCBiZWxvbmdzIHRvLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgU3RhcnRUaW1lIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHN0YXJ0dGltZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG1pbmltdW0gd2lkdGggKGluIHBpeGVscykgbmVlZGVkIHRvIGRyYXcgdGhpcyBzeW1ib2wgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IE1pbldpZHRoIHsgXG4gICAgICAgIGdldCB7IHJldHVybiAyICogU2hlZXRNdXNpYy5MaW5lU3BhY2U7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0L1NldCB0aGUgd2lkdGggKGluIHBpeGVscykgb2YgdGhpcyBzeW1ib2wuIFRoZSB3aWR0aCBpcyBzZXRcbiAgICAgKiBpbiBTaGVldE11c2ljLkFsaWduU3ltYm9scygpIHRvIHZlcnRpY2FsbHkgYWxpZ24gc3ltYm9scy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFdpZHRoIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgIHNldCB7IHdpZHRoID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYWJvdmUgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQWJvdmVTdGFmZiB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gMDsgfSBcbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYmVsb3cgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQmVsb3dTdGFmZiB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBEcmF3IGEgdmVydGljYWwgYmFyLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBcbiAgICB2b2lkIERyYXcoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3ApIHtcbiAgICAgICAgaW50IHkgPSB5dG9wO1xuICAgICAgICBpbnQgeWVuZCA9IHkgKyBTaGVldE11c2ljLkxpbmVTcGFjZSo0ICsgU2hlZXRNdXNpYy5MaW5lV2lkdGgqNDtcbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIFNoZWV0TXVzaWMuTm90ZVdpZHRoLzIsIHksIFxuICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlV2lkdGgvMiwgeWVuZCk7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgb3ZlcnJpZGUgc3RyaW5nIFRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gc3RyaW5nLkZvcm1hdChcIkJhclN5bWJvbCBzdGFydHRpbWU9ezB9IHdpZHRoPXsxfVwiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnR0aW1lLCB3aWR0aCk7XG4gICAgfVxufVxuXG5cbn1cblxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEJpdG1hcDpJbWFnZVxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBCaXRtYXAoVHlwZSB0eXBlLCBzdHJpbmcgZmlsZW5hbWUpXHJcbiAgICAgICAgOmJhc2UodHlwZSxmaWxlbmFtZSl7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcbiAgICB9XHJcbn1cclxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG5cbi8qKiBAY2xhc3MgQmxhbmtTeW1ib2wgXG4gKiBUaGUgQmxhbmsgc3ltYm9sIGlzIGEgbXVzaWMgc3ltYm9sIHRoYXQgZG9lc24ndCBkcmF3IGFueXRoaW5nLiAgVGhpc1xuICogc3ltYm9sIGlzIHVzZWQgZm9yIGFsaWdubWVudCBwdXJwb3NlcywgdG8gYWxpZ24gbm90ZXMgaW4gZGlmZmVyZW50IFxuICogc3RhZmZzIHdoaWNoIG9jY3VyIGF0IHRoZSBzYW1lIHRpbWUuXG4gKi9cbnB1YmxpYyBjbGFzcyBCbGFua1N5bWJvbCA6IE11c2ljU3ltYm9sIHtcbiAgICBwcml2YXRlIGludCBzdGFydHRpbWU7IFxuICAgIHByaXZhdGUgaW50IHdpZHRoO1xuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBCbGFua1N5bWJvbCB3aXRoIHRoZSBnaXZlbiBzdGFydHRpbWUgYW5kIHdpZHRoICovXG4gICAgcHVibGljIEJsYW5rU3ltYm9sKGludCBzdGFydHRpbWUsIGludCB3aWR0aCkge1xuICAgICAgICB0aGlzLnN0YXJ0dGltZSA9IHN0YXJ0dGltZTtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIHRpbWUgKGluIHB1bHNlcykgdGhpcyBzeW1ib2wgb2NjdXJzIGF0LlxuICAgICAqIFRoaXMgaXMgdXNlZCB0byBkZXRlcm1pbmUgdGhlIG1lYXN1cmUgdGhpcyBzeW1ib2wgYmVsb25ncyB0by5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFN0YXJ0VGltZSB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gc3RhcnR0aW1lOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbWluaW11bSB3aWR0aCAoaW4gcGl4ZWxzKSBuZWVkZWQgdG8gZHJhdyB0aGlzIHN5bWJvbCAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgTWluV2lkdGgge1xuICAgICAgICBnZXQgeyByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQvU2V0IHRoZSB3aWR0aCAoaW4gcGl4ZWxzKSBvZiB0aGlzIHN5bWJvbC4gVGhlIHdpZHRoIGlzIHNldFxuICAgICAqIGluIFNoZWV0TXVzaWMuQWxpZ25TeW1ib2xzKCkgdG8gdmVydGljYWxseSBhbGlnbiBzeW1ib2xzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgV2lkdGggeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgIHNldCB7IHdpZHRoID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYWJvdmUgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQWJvdmVTdGFmZiB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBiZWxvdyB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBCZWxvd1N0YWZmIHsgXG4gICAgICAgIGdldCB7IHJldHVybiAwOyB9XG4gICAgfVxuXG4gICAgLyoqIERyYXcgbm90aGluZy5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7fVxuXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJCbGFua1N5bWJvbCBzdGFydHRpbWU9ezB9IHdpZHRoPXsxfVwiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnR0aW1lLCB3aWR0aCk7XG4gICAgfVxufVxuXG5cbn1cblxuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTEgTWFkaGF2IFZhaWR5YW5hdGhhblxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxuICpcbiAqICBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqICBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5JTztcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG5cbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpYyB7XG5cbnB1YmxpYyBlbnVtIFN0ZW1EaXIgeyBVcCwgRG93biB9O1xuXG4vKiogQGNsYXNzIE5vdGVEYXRhXG4gKiAgQ29udGFpbnMgZmllbGRzIGZvciBkaXNwbGF5aW5nIGEgc2luZ2xlIG5vdGUgaW4gYSBjaG9yZC5cbiAqL1xucHVibGljIGNsYXNzIE5vdGVEYXRhIHtcbiAgICBwdWJsaWMgaW50IG51bWJlcjsgICAgICAgICAgICAgLyoqIFRoZSBNaWRpIG5vdGUgbnVtYmVyLCB1c2VkIHRvIGRldGVybWluZSB0aGUgY29sb3IgKi9cbiAgICBwdWJsaWMgV2hpdGVOb3RlIHdoaXRlbm90ZTsgICAgLyoqIFRoZSB3aGl0ZSBub3RlIGxvY2F0aW9uIHRvIGRyYXcgKi9cbiAgICBwdWJsaWMgTm90ZUR1cmF0aW9uIGR1cmF0aW9uOyAgLyoqIFRoZSBkdXJhdGlvbiBvZiB0aGUgbm90ZSAqL1xuICAgIHB1YmxpYyBib29sIGxlZnRzaWRlOyAgICAgICAgICAvKiogV2hldGhlciB0byBkcmF3IG5vdGUgdG8gdGhlIGxlZnQgb3IgcmlnaHQgb2YgdGhlIHN0ZW0gKi9cbiAgICBwdWJsaWMgQWNjaWQgYWNjaWQ7ICAgICAgICAgICAgLyoqIFVzZWQgdG8gY3JlYXRlIHRoZSBBY2NpZFN5bWJvbHMgZm9yIHRoZSBjaG9yZCAqL1xufTtcblxuLyoqIEBjbGFzcyBDaG9yZFN5bWJvbFxuICogQSBjaG9yZCBzeW1ib2wgcmVwcmVzZW50cyBhIGdyb3VwIG9mIG5vdGVzIHRoYXQgYXJlIHBsYXllZCBhdCB0aGUgc2FtZVxuICogdGltZS4gIEEgY2hvcmQgaW5jbHVkZXMgdGhlIG5vdGVzLCB0aGUgYWNjaWRlbnRhbCBzeW1ib2xzIGZvciBlYWNoXG4gKiBub3RlLCBhbmQgdGhlIHN0ZW0gKG9yIHN0ZW1zKSB0byB1c2UuICBBIHNpbmdsZSBjaG9yZCBtYXkgaGF2ZSB0d28gXG4gKiBzdGVtcyBpZiB0aGUgbm90ZXMgaGF2ZSBkaWZmZXJlbnQgZHVyYXRpb25zIChlLmcuIGlmIG9uZSBub3RlIGlzIGFcbiAqIHF1YXJ0ZXIgbm90ZSwgYW5kIGFub3RoZXIgaXMgYW4gZWlnaHRoIG5vdGUpLlxuICovXG5wdWJsaWMgY2xhc3MgQ2hvcmRTeW1ib2wgOiBNdXNpY1N5bWJvbCB7XG4gICAgcHJpdmF0ZSBDbGVmIGNsZWY7ICAgICAgICAgICAgIC8qKiBXaGljaCBjbGVmIHRoZSBjaG9yZCBpcyBiZWluZyBkcmF3biBpbiAqL1xuICAgIHByaXZhdGUgaW50IHN0YXJ0dGltZTsgICAgICAgICAvKiogVGhlIHRpbWUgKGluIHB1bHNlcykgdGhlIG5vdGVzIG9jY3VycyBhdCAqL1xuICAgIHByaXZhdGUgaW50IGVuZHRpbWU7ICAgICAgICAgICAvKiogVGhlIHN0YXJ0dGltZSBwbHVzIHRoZSBsb25nZXN0IG5vdGUgZHVyYXRpb24gKi9cbiAgICBwcml2YXRlIE5vdGVEYXRhW10gbm90ZWRhdGE7ICAgLyoqIFRoZSBub3RlcyB0byBkcmF3ICovXG4gICAgcHJpdmF0ZSBBY2NpZFN5bWJvbFtdIGFjY2lkc3ltYm9sczsgICAvKiogVGhlIGFjY2lkZW50YWwgc3ltYm9scyB0byBkcmF3ICovXG4gICAgcHJpdmF0ZSBpbnQgd2lkdGg7ICAgICAgICAgICAgIC8qKiBUaGUgd2lkdGggb2YgdGhlIGNob3JkICovXG4gICAgcHJpdmF0ZSBTdGVtIHN0ZW0xOyAgICAgICAgICAgIC8qKiBUaGUgc3RlbSBvZiB0aGUgY2hvcmQuIENhbiBiZSBudWxsLiAqL1xuICAgIHByaXZhdGUgU3RlbSBzdGVtMjsgICAgICAgICAgICAvKiogVGhlIHNlY29uZCBzdGVtIG9mIHRoZSBjaG9yZC4gQ2FuIGJlIG51bGwgKi9cbiAgICBwcml2YXRlIGJvb2wgaGFzdHdvc3RlbXM7ICAgICAgLyoqIFRydWUgaWYgdGhpcyBjaG9yZCBoYXMgdHdvIHN0ZW1zICovXG4gICAgcHJpdmF0ZSBTaGVldE11c2ljIHNoZWV0bXVzaWM7IC8qKiBVc2VkIHRvIGdldCBjb2xvcnMgYW5kIG90aGVyIG9wdGlvbnMgKi9cblxuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBDaG9yZCBTeW1ib2wgZnJvbSB0aGUgZ2l2ZW4gbGlzdCBvZiBtaWRpIG5vdGVzLlxuICAgICAqIEFsbCB0aGUgbWlkaSBub3RlcyB3aWxsIGhhdmUgdGhlIHNhbWUgc3RhcnQgdGltZS4gIFVzZSB0aGVcbiAgICAgKiBrZXkgc2lnbmF0dXJlIHRvIGdldCB0aGUgd2hpdGUga2V5IGFuZCBhY2NpZGVudGFsIHN5bWJvbCBmb3JcbiAgICAgKiBlYWNoIG5vdGUuICBVc2UgdGhlIHRpbWUgc2lnbmF0dXJlIHRvIGNhbGN1bGF0ZSB0aGUgZHVyYXRpb25cbiAgICAgKiBvZiB0aGUgbm90ZXMuIFVzZSB0aGUgY2xlZiB3aGVuIGRyYXdpbmcgdGhlIGNob3JkLlxuICAgICAqL1xuICAgIHB1YmxpYyBDaG9yZFN5bWJvbChMaXN0PE1pZGlOb3RlPiBtaWRpbm90ZXMsIEtleVNpZ25hdHVyZSBrZXksIFxuICAgICAgICAgICAgICAgICAgICAgICBUaW1lU2lnbmF0dXJlIHRpbWUsIENsZWYgYywgU2hlZXRNdXNpYyBzaGVldCkge1xuXG4gICAgICAgIGludCBsZW4gPSBtaWRpbm90ZXMuQ291bnQ7XG4gICAgICAgIGludCBpO1xuXG4gICAgICAgIGhhc3R3b3N0ZW1zID0gZmFsc2U7XG4gICAgICAgIGNsZWYgPSBjO1xuICAgICAgICBzaGVldG11c2ljID0gc2hlZXQ7XG5cbiAgICAgICAgc3RhcnR0aW1lID0gbWlkaW5vdGVzWzBdLlN0YXJ0VGltZTtcbiAgICAgICAgZW5kdGltZSA9IG1pZGlub3Rlc1swXS5FbmRUaW1lO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBtaWRpbm90ZXMuQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgaWYgKGkgPiAxKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1pZGlub3Rlc1tpXS5OdW1iZXIgPCBtaWRpbm90ZXNbaS0xXS5OdW1iZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5c3RlbS5Bcmd1bWVudEV4Y2VwdGlvbihcIkNob3JkIG5vdGVzIG5vdCBpbiBpbmNyZWFzaW5nIG9yZGVyIGJ5IG51bWJlclwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbmR0aW1lID0gTWF0aC5NYXgoZW5kdGltZSwgbWlkaW5vdGVzW2ldLkVuZFRpbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgbm90ZWRhdGEgPSBDcmVhdGVOb3RlRGF0YShtaWRpbm90ZXMsIGtleSwgdGltZSk7XG4gICAgICAgIGFjY2lkc3ltYm9scyA9IENyZWF0ZUFjY2lkU3ltYm9scyhub3RlZGF0YSwgY2xlZik7XG5cblxuICAgICAgICAvKiBGaW5kIG91dCBob3cgbWFueSBzdGVtcyB3ZSBuZWVkICgxIG9yIDIpICovXG4gICAgICAgIE5vdGVEdXJhdGlvbiBkdXIxID0gbm90ZWRhdGFbMF0uZHVyYXRpb247XG4gICAgICAgIE5vdGVEdXJhdGlvbiBkdXIyID0gZHVyMTtcbiAgICAgICAgaW50IGNoYW5nZSA9IC0xO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbm90ZWRhdGEuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGR1cjIgPSBub3RlZGF0YVtpXS5kdXJhdGlvbjtcbiAgICAgICAgICAgIGlmIChkdXIxICE9IGR1cjIpIHtcbiAgICAgICAgICAgICAgICBjaGFuZ2UgPSBpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGR1cjEgIT0gZHVyMikge1xuICAgICAgICAgICAgLyogV2UgaGF2ZSBub3RlcyB3aXRoIGRpZmZlcmVudCBkdXJhdGlvbnMuICBTbyB3ZSB3aWxsIG5lZWRcbiAgICAgICAgICAgICAqIHR3byBzdGVtcy4gIFRoZSBmaXJzdCBzdGVtIHBvaW50cyBkb3duLCBhbmQgY29udGFpbnMgdGhlXG4gICAgICAgICAgICAgKiBib3R0b20gbm90ZSB1cCB0byB0aGUgbm90ZSB3aXRoIHRoZSBkaWZmZXJlbnQgZHVyYXRpb24uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogVGhlIHNlY29uZCBzdGVtIHBvaW50cyB1cCwgYW5kIGNvbnRhaW5zIHRoZSBub3RlIHdpdGggdGhlXG4gICAgICAgICAgICAgKiBkaWZmZXJlbnQgZHVyYXRpb24gdXAgdG8gdGhlIHRvcCBub3RlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBoYXN0d29zdGVtcyA9IHRydWU7XG4gICAgICAgICAgICBzdGVtMSA9IG5ldyBTdGVtKG5vdGVkYXRhWzBdLndoaXRlbm90ZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGVkYXRhW2NoYW5nZS0xXS53aGl0ZW5vdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR1cjEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdGVtLkRvd24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5vdGVzT3ZlcmxhcChub3RlZGF0YSwgMCwgY2hhbmdlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHN0ZW0yID0gbmV3IFN0ZW0obm90ZWRhdGFbY2hhbmdlXS53aGl0ZW5vdGUsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlZGF0YVtub3RlZGF0YS5MZW5ndGgtMV0ud2hpdGVub3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkdXIyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3RlbS5VcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTm90ZXNPdmVybGFwKG5vdGVkYXRhLCBjaGFuZ2UsIG5vdGVkYXRhLkxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLyogQWxsIG5vdGVzIGhhdmUgdGhlIHNhbWUgZHVyYXRpb24sIHNvIHdlIG9ubHkgbmVlZCBvbmUgc3RlbS4gKi9cbiAgICAgICAgICAgIGludCBkaXJlY3Rpb24gPSBTdGVtRGlyZWN0aW9uKG5vdGVkYXRhWzBdLndoaXRlbm90ZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlZGF0YVtub3RlZGF0YS5MZW5ndGgtMV0ud2hpdGVub3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlZik7XG5cbiAgICAgICAgICAgIHN0ZW0xID0gbmV3IFN0ZW0obm90ZWRhdGFbMF0ud2hpdGVub3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlZGF0YVtub3RlZGF0YS5MZW5ndGgtMV0ud2hpdGVub3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkdXIxLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOb3Rlc092ZXJsYXAobm90ZWRhdGEsIDAsIG5vdGVkYXRhLkxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgc3RlbTIgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogRm9yIHdob2xlIG5vdGVzLCBubyBzdGVtIGlzIGRyYXduLiAqL1xuICAgICAgICBpZiAoZHVyMSA9PSBOb3RlRHVyYXRpb24uV2hvbGUpXG4gICAgICAgICAgICBzdGVtMSA9IG51bGw7XG4gICAgICAgIGlmIChkdXIyID09IE5vdGVEdXJhdGlvbi5XaG9sZSlcbiAgICAgICAgICAgIHN0ZW0yID0gbnVsbDtcblxuICAgICAgICB3aWR0aCA9IE1pbldpZHRoO1xuICAgIH1cblxuXG4gICAgLyoqIEdpdmVuIHRoZSByYXcgbWlkaSBub3RlcyAodGhlIG5vdGUgbnVtYmVyIGFuZCBkdXJhdGlvbiBpbiBwdWxzZXMpLFxuICAgICAqIGNhbGN1bGF0ZSB0aGUgZm9sbG93aW5nIG5vdGUgZGF0YTpcbiAgICAgKiAtIFRoZSB3aGl0ZSBrZXlcbiAgICAgKiAtIFRoZSBhY2NpZGVudGFsIChpZiBhbnkpXG4gICAgICogLSBUaGUgbm90ZSBkdXJhdGlvbiAoaGFsZiwgcXVhcnRlciwgZWlnaHRoLCBldGMpXG4gICAgICogLSBUaGUgc2lkZSBpdCBzaG91bGQgYmUgZHJhd24gKGxlZnQgb3Igc2lkZSlcbiAgICAgKiBCeSBkZWZhdWx0LCBub3RlcyBhcmUgZHJhd24gb24gdGhlIGxlZnQgc2lkZS4gIEhvd2V2ZXIsIGlmIHR3byBub3Rlc1xuICAgICAqIG92ZXJsYXAgKGxpa2UgQSBhbmQgQikgeW91IGNhbm5vdCBkcmF3IHRoZSBuZXh0IG5vdGUgZGlyZWN0bHkgYWJvdmUgaXQuXG4gICAgICogSW5zdGVhZCB5b3UgbXVzdCBzaGlmdCBvbmUgb2YgdGhlIG5vdGVzIHRvIHRoZSByaWdodC5cbiAgICAgKlxuICAgICAqIFRoZSBLZXlTaWduYXR1cmUgaXMgdXNlZCB0byBkZXRlcm1pbmUgdGhlIHdoaXRlIGtleSBhbmQgYWNjaWRlbnRhbC5cbiAgICAgKiBUaGUgVGltZVNpZ25hdHVyZSBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgZHVyYXRpb24uXG4gICAgICovXG4gXG4gICAgcHJpdmF0ZSBzdGF0aWMgTm90ZURhdGFbXSBcbiAgICBDcmVhdGVOb3RlRGF0YShMaXN0PE1pZGlOb3RlPiBtaWRpbm90ZXMsIEtleVNpZ25hdHVyZSBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUaW1lU2lnbmF0dXJlIHRpbWUpIHtcblxuICAgICAgICBpbnQgbGVuID0gbWlkaW5vdGVzLkNvdW50O1xuICAgICAgICBOb3RlRGF0YVtdIG5vdGVkYXRhID0gbmV3IE5vdGVEYXRhW2xlbl07XG5cbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgTWlkaU5vdGUgbWlkaSA9IG1pZGlub3Rlc1tpXTtcbiAgICAgICAgICAgIG5vdGVkYXRhW2ldID0gbmV3IE5vdGVEYXRhKCk7XG4gICAgICAgICAgICBub3RlZGF0YVtpXS5udW1iZXIgPSBtaWRpLk51bWJlcjtcbiAgICAgICAgICAgIG5vdGVkYXRhW2ldLmxlZnRzaWRlID0gdHJ1ZTtcbiAgICAgICAgICAgIG5vdGVkYXRhW2ldLndoaXRlbm90ZSA9IGtleS5HZXRXaGl0ZU5vdGUobWlkaS5OdW1iZXIpO1xuICAgICAgICAgICAgbm90ZWRhdGFbaV0uZHVyYXRpb24gPSB0aW1lLkdldE5vdGVEdXJhdGlvbihtaWRpLkVuZFRpbWUgLSBtaWRpLlN0YXJ0VGltZSk7XG4gICAgICAgICAgICBub3RlZGF0YVtpXS5hY2NpZCA9IGtleS5HZXRBY2NpZGVudGFsKG1pZGkuTnVtYmVyLCBtaWRpLlN0YXJ0VGltZSAvIHRpbWUuTWVhc3VyZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChpID4gMCAmJiAobm90ZWRhdGFbaV0ud2hpdGVub3RlLkRpc3Qobm90ZWRhdGFbaS0xXS53aGl0ZW5vdGUpID09IDEpKSB7XG4gICAgICAgICAgICAgICAgLyogVGhpcyBub3RlIChub3RlZGF0YVtpXSkgb3ZlcmxhcHMgd2l0aCB0aGUgcHJldmlvdXMgbm90ZS5cbiAgICAgICAgICAgICAgICAgKiBDaGFuZ2UgdGhlIHNpZGUgb2YgdGhpcyBub3RlLlxuICAgICAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAgICAgaWYgKG5vdGVkYXRhW2ktMV0ubGVmdHNpZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm90ZWRhdGFbaV0ubGVmdHNpZGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBub3RlZGF0YVtpXS5sZWZ0c2lkZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBub3RlZGF0YVtpXS5sZWZ0c2lkZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vdGVkYXRhO1xuICAgIH1cblxuXG4gICAgLyoqIEdpdmVuIHRoZSBub3RlIGRhdGEgKHRoZSB3aGl0ZSBrZXlzIGFuZCBhY2NpZGVudGFscyksIGNyZWF0ZSBcbiAgICAgKiB0aGUgQWNjaWRlbnRhbCBTeW1ib2xzIGFuZCByZXR1cm4gdGhlbS5cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBBY2NpZFN5bWJvbFtdIFxuICAgIENyZWF0ZUFjY2lkU3ltYm9scyhOb3RlRGF0YVtdIG5vdGVkYXRhLCBDbGVmIGNsZWYpIHtcbiAgICAgICAgaW50IGNvdW50ID0gMDtcbiAgICAgICAgZm9yZWFjaCAoTm90ZURhdGEgbiBpbiBub3RlZGF0YSkge1xuICAgICAgICAgICAgaWYgKG4uYWNjaWQgIT0gQWNjaWQuTm9uZSkge1xuICAgICAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgQWNjaWRTeW1ib2xbXSBzeW1ib2xzID0gbmV3IEFjY2lkU3ltYm9sW2NvdW50XTtcbiAgICAgICAgaW50IGkgPSAwO1xuICAgICAgICBmb3JlYWNoIChOb3RlRGF0YSBuIGluIG5vdGVkYXRhKSB7XG4gICAgICAgICAgICBpZiAobi5hY2NpZCAhPSBBY2NpZC5Ob25lKSB7XG4gICAgICAgICAgICAgICAgc3ltYm9sc1tpXSA9IG5ldyBBY2NpZFN5bWJvbChuLmFjY2lkLCBuLndoaXRlbm90ZSwgY2xlZik7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzeW1ib2xzO1xuICAgIH1cblxuICAgIC8qKiBDYWxjdWxhdGUgdGhlIHN0ZW0gZGlyZWN0aW9uIChVcCBvciBkb3duKSBiYXNlZCBvbiB0aGUgdG9wIGFuZFxuICAgICAqIGJvdHRvbSBub3RlIGluIHRoZSBjaG9yZC4gIElmIHRoZSBhdmVyYWdlIG9mIHRoZSBub3RlcyBpcyBhYm92ZVxuICAgICAqIHRoZSBtaWRkbGUgb2YgdGhlIHN0YWZmLCB0aGUgZGlyZWN0aW9uIGlzIGRvd24uICBFbHNlLCB0aGVcbiAgICAgKiBkaXJlY3Rpb24gaXMgdXAuXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50IFxuICAgIFN0ZW1EaXJlY3Rpb24oV2hpdGVOb3RlIGJvdHRvbSwgV2hpdGVOb3RlIHRvcCwgQ2xlZiBjbGVmKSB7XG4gICAgICAgIFdoaXRlTm90ZSBtaWRkbGU7XG4gICAgICAgIGlmIChjbGVmID09IENsZWYuVHJlYmxlKVxuICAgICAgICAgICAgbWlkZGxlID0gbmV3IFdoaXRlTm90ZShXaGl0ZU5vdGUuQiwgNSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG1pZGRsZSA9IG5ldyBXaGl0ZU5vdGUoV2hpdGVOb3RlLkQsIDMpO1xuXG4gICAgICAgIGludCBkaXN0ID0gbWlkZGxlLkRpc3QoYm90dG9tKSArIG1pZGRsZS5EaXN0KHRvcCk7XG4gICAgICAgIGlmIChkaXN0ID49IDApXG4gICAgICAgICAgICByZXR1cm4gU3RlbS5VcDtcbiAgICAgICAgZWxzZSBcbiAgICAgICAgICAgIHJldHVybiBTdGVtLkRvd247XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB3aGV0aGVyIGFueSBvZiB0aGUgbm90ZXMgaW4gbm90ZWRhdGEgKGJldHdlZW4gc3RhcnQgYW5kXG4gICAgICogZW5kIGluZGV4ZXMpIG92ZXJsYXAuICBUaGlzIGlzIG5lZWRlZCBieSB0aGUgU3RlbSBjbGFzcyB0b1xuICAgICAqIGRldGVybWluZSB0aGUgcG9zaXRpb24gb2YgdGhlIHN0ZW0gKGxlZnQgb3IgcmlnaHQgb2Ygbm90ZXMpLlxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGJvb2wgTm90ZXNPdmVybGFwKE5vdGVEYXRhW10gbm90ZWRhdGEsIGludCBzdGFydCwgaW50IGVuZCkge1xuICAgICAgICBmb3IgKGludCBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgICAgICAgaWYgKCFub3RlZGF0YVtpXS5sZWZ0c2lkZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSB0aW1lIChpbiBwdWxzZXMpIHRoaXMgc3ltYm9sIG9jY3VycyBhdC5cbiAgICAgKiBUaGlzIGlzIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBtZWFzdXJlIHRoaXMgc3ltYm9sIGJlbG9uZ3MgdG8uXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBTdGFydFRpbWUgeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHN0YXJ0dGltZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIGVuZCB0aW1lIChpbiBwdWxzZXMpIG9mIHRoZSBsb25nZXN0IG5vdGUgaW4gdGhlIGNob3JkLlxuICAgICAqIFVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdHdvIGFkamFjZW50IGNob3JkcyBjYW4gYmUgam9pbmVkXG4gICAgICogYnkgYSBzdGVtLlxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgRW5kVGltZSB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gZW5kdGltZTsgfVxuICAgIH1cblxuICAgIC8qKiBSZXR1cm4gdGhlIGNsZWYgdGhpcyBjaG9yZCBpcyBkcmF3biBpbi4gKi9cbiAgICBwdWJsaWMgQ2xlZiBDbGVmIHsgXG4gICAgICAgIGdldCB7IHJldHVybiBjbGVmOyB9XG4gICAgfVxuXG4gICAgLyoqIFJldHVybiB0cnVlIGlmIHRoaXMgY2hvcmQgaGFzIHR3byBzdGVtcyAqL1xuICAgIHB1YmxpYyBib29sIEhhc1R3b1N0ZW1zIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIGhhc3R3b3N0ZW1zOyB9XG4gICAgfVxuXG4gICAgLyogUmV0dXJuIHRoZSBzdGVtIHdpbGwgdGhlIHNtYWxsZXN0IGR1cmF0aW9uLiAgVGhpcyBwcm9wZXJ0eVxuICAgICAqIGlzIHVzZWQgd2hlbiBtYWtpbmcgY2hvcmQgcGFpcnMgKGNob3JkcyBqb2luZWQgYnkgYSBob3Jpem9udGFsXG4gICAgICogYmVhbSBzdGVtKS4gVGhlIHN0ZW0gZHVyYXRpb25zIG11c3QgbWF0Y2ggaW4gb3JkZXIgdG8gbWFrZVxuICAgICAqIGEgY2hvcmQgcGFpci4gIElmIGEgY2hvcmQgaGFzIHR3byBzdGVtcywgd2UgYWx3YXlzIHJldHVyblxuICAgICAqIHRoZSBvbmUgd2l0aCBhIHNtYWxsZXIgZHVyYXRpb24sIGJlY2F1c2UgaXQgaGFzIGEgYmV0dGVyIFxuICAgICAqIGNoYW5jZSBvZiBtYWtpbmcgYSBwYWlyLlxuICAgICAqL1xuICAgIHB1YmxpYyBTdGVtIFN0ZW0ge1xuICAgICAgICBnZXQgeyBcbiAgICAgICAgICAgIGlmIChzdGVtMSA9PSBudWxsKSB7IHJldHVybiBzdGVtMjsgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc3RlbTIgPT0gbnVsbCkgeyByZXR1cm4gc3RlbTE7IH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHN0ZW0xLkR1cmF0aW9uIDwgc3RlbTIuRHVyYXRpb24pIHsgcmV0dXJuIHN0ZW0xOyB9XG4gICAgICAgICAgICBlbHNlIHsgcmV0dXJuIHN0ZW0yOyB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogR2V0L1NldCB0aGUgd2lkdGggKGluIHBpeGVscykgb2YgdGhpcyBzeW1ib2wuIFRoZSB3aWR0aCBpcyBzZXRcbiAgICAgKiBpbiBTaGVldE11c2ljLkFsaWduU3ltYm9scygpIHRvIHZlcnRpY2FsbHkgYWxpZ24gc3ltYm9scy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFdpZHRoIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgIHNldCB7IHdpZHRoID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBtaW5pbXVtIHdpZHRoIChpbiBwaXhlbHMpIG5lZWRlZCB0byBkcmF3IHRoaXMgc3ltYm9sICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBNaW5XaWR0aCB7XG4gICAgICAgIGdldCB7IHJldHVybiBHZXRNaW5XaWR0aCgpOyB9XG4gICAgfVxuXG4gICAgLyogUmV0dXJuIHRoZSBtaW5pbXVtIHdpZHRoIG5lZWRlZCB0byBkaXNwbGF5IHRoaXMgY2hvcmQuXG4gICAgICpcbiAgICAgKiBUaGUgYWNjaWRlbnRhbCBzeW1ib2xzIGNhbiBiZSBkcmF3biBhYm92ZSBvbmUgYW5vdGhlciBhcyBsb25nXG4gICAgICogYXMgdGhleSBkb24ndCBvdmVybGFwICh0aGV5IG11c3QgYmUgYXQgbGVhc3QgNiBub3RlcyBhcGFydCkuXG4gICAgICogSWYgdHdvIGFjY2lkZW50YWwgc3ltYm9scyBkbyBvdmVybGFwLCB0aGUgYWNjaWRlbnRhbCBzeW1ib2xcbiAgICAgKiBvbiB0b3AgbXVzdCBiZSBzaGlmdGVkIHRvIHRoZSByaWdodC4gIFNvIHRoZSB3aWR0aCBuZWVkZWQgZm9yXG4gICAgICogYWNjaWRlbnRhbCBzeW1ib2xzIGRlcGVuZHMgb24gd2hldGhlciB0aGV5IG92ZXJsYXAgb3Igbm90LlxuICAgICAqXG4gICAgICogSWYgd2UgYXJlIGFsc28gZGlzcGxheWluZyB0aGUgbGV0dGVycywgaW5jbHVkZSBleHRyYSB3aWR0aC5cbiAgICAgKi9cbiAgICBpbnQgR2V0TWluV2lkdGgoKSB7XG4gICAgICAgIC8qIFRoZSB3aWR0aCBuZWVkZWQgZm9yIHRoZSBub3RlIGNpcmNsZXMgKi9cbiAgICAgICAgaW50IHJlc3VsdCA9IDIqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjMvNDtcblxuICAgICAgICBpZiAoYWNjaWRzeW1ib2xzLkxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSBhY2NpZHN5bWJvbHNbMF0uTWluV2lkdGg7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMTsgaSA8IGFjY2lkc3ltYm9scy5MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIEFjY2lkU3ltYm9sIGFjY2lkID0gYWNjaWRzeW1ib2xzW2ldO1xuICAgICAgICAgICAgICAgIEFjY2lkU3ltYm9sIHByZXYgPSBhY2NpZHN5bWJvbHNbaS0xXTtcbiAgICAgICAgICAgICAgICBpZiAoYWNjaWQuTm90ZS5EaXN0KHByZXYuTm90ZSkgPCA2KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBhY2NpZC5NaW5XaWR0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNoZWV0bXVzaWMgIT0gbnVsbCAmJiBzaGVldG11c2ljLlNob3dOb3RlTGV0dGVycyAhPSBNaWRpT3B0aW9ucy5Ob3RlTmFtZU5vbmUpIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSA4O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYWJvdmUgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQWJvdmVTdGFmZiB7XG4gICAgICAgIGdldCB7IHJldHVybiBHZXRBYm92ZVN0YWZmKCk7IH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGludCBHZXRBYm92ZVN0YWZmKCkge1xuICAgICAgICAvKiBGaW5kIHRoZSB0b3Btb3N0IG5vdGUgaW4gdGhlIGNob3JkICovXG4gICAgICAgIFdoaXRlTm90ZSB0b3Bub3RlID0gbm90ZWRhdGFbIG5vdGVkYXRhLkxlbmd0aC0xIF0ud2hpdGVub3RlO1xuXG4gICAgICAgIC8qIFRoZSBzdGVtLkVuZCBpcyB0aGUgbm90ZSBwb3NpdGlvbiB3aGVyZSB0aGUgc3RlbSBlbmRzLlxuICAgICAgICAgKiBDaGVjayBpZiB0aGUgc3RlbSBlbmQgaXMgaGlnaGVyIHRoYW4gdGhlIHRvcCBub3RlLlxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKHN0ZW0xICE9IG51bGwpXG4gICAgICAgICAgICB0b3Bub3RlID0gV2hpdGVOb3RlLk1heCh0b3Bub3RlLCBzdGVtMS5FbmQpO1xuICAgICAgICBpZiAoc3RlbTIgIT0gbnVsbClcbiAgICAgICAgICAgIHRvcG5vdGUgPSBXaGl0ZU5vdGUuTWF4KHRvcG5vdGUsIHN0ZW0yLkVuZCk7XG5cbiAgICAgICAgaW50IGRpc3QgPSB0b3Bub3RlLkRpc3QoV2hpdGVOb3RlLlRvcChjbGVmKSkgKiBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcbiAgICAgICAgaW50IHJlc3VsdCA9IDA7XG4gICAgICAgIGlmIChkaXN0ID4gMClcbiAgICAgICAgICAgIHJlc3VsdCA9IGRpc3Q7XG5cbiAgICAgICAgLyogQ2hlY2sgaWYgYW55IGFjY2lkZW50YWwgc3ltYm9scyBleHRlbmQgYWJvdmUgdGhlIHN0YWZmICovXG4gICAgICAgIGZvcmVhY2ggKEFjY2lkU3ltYm9sIHN5bWJvbCBpbiBhY2NpZHN5bWJvbHMpIHtcbiAgICAgICAgICAgIGlmIChzeW1ib2wuQWJvdmVTdGFmZiA+IHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHN5bWJvbC5BYm92ZVN0YWZmO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGJlbG93IHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEJlbG93U3RhZmYge1xuICAgICAgICBnZXQgeyByZXR1cm4gR2V0QmVsb3dTdGFmZigpOyB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbnQgR2V0QmVsb3dTdGFmZigpIHtcbiAgICAgICAgLyogRmluZCB0aGUgYm90dG9tIG5vdGUgaW4gdGhlIGNob3JkICovXG4gICAgICAgIFdoaXRlTm90ZSBib3R0b21ub3RlID0gbm90ZWRhdGFbMF0ud2hpdGVub3RlO1xuXG4gICAgICAgIC8qIFRoZSBzdGVtLkVuZCBpcyB0aGUgbm90ZSBwb3NpdGlvbiB3aGVyZSB0aGUgc3RlbSBlbmRzLlxuICAgICAgICAgKiBDaGVjayBpZiB0aGUgc3RlbSBlbmQgaXMgbG93ZXIgdGhhbiB0aGUgYm90dG9tIG5vdGUuXG4gICAgICAgICAqL1xuICAgICAgICBpZiAoc3RlbTEgIT0gbnVsbClcbiAgICAgICAgICAgIGJvdHRvbW5vdGUgPSBXaGl0ZU5vdGUuTWluKGJvdHRvbW5vdGUsIHN0ZW0xLkVuZCk7XG4gICAgICAgIGlmIChzdGVtMiAhPSBudWxsKVxuICAgICAgICAgICAgYm90dG9tbm90ZSA9IFdoaXRlTm90ZS5NaW4oYm90dG9tbm90ZSwgc3RlbTIuRW5kKTtcblxuICAgICAgICBpbnQgZGlzdCA9IFdoaXRlTm90ZS5Cb3R0b20oY2xlZikuRGlzdChib3R0b21ub3RlKSAqXG4gICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzI7XG5cbiAgICAgICAgaW50IHJlc3VsdCA9IDA7XG4gICAgICAgIGlmIChkaXN0ID4gMClcbiAgICAgICAgICAgIHJlc3VsdCA9IGRpc3Q7XG5cbiAgICAgICAgLyogQ2hlY2sgaWYgYW55IGFjY2lkZW50YWwgc3ltYm9scyBleHRlbmQgYmVsb3cgdGhlIHN0YWZmICovIFxuICAgICAgICBmb3JlYWNoIChBY2NpZFN5bWJvbCBzeW1ib2wgaW4gYWNjaWRzeW1ib2xzKSB7XG4gICAgICAgICAgICBpZiAoc3ltYm9sLkJlbG93U3RhZmYgPiByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBzeW1ib2wuQmVsb3dTdGFmZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG5hbWUgZm9yIHRoaXMgbm90ZSAqL1xuICAgIHByaXZhdGUgc3RyaW5nIE5vdGVOYW1lKGludCBub3RlbnVtYmVyLCBXaGl0ZU5vdGUgd2hpdGVub3RlKSB7XG4gICAgICAgIGlmIChzaGVldG11c2ljLlNob3dOb3RlTGV0dGVycyA9PSBNaWRpT3B0aW9ucy5Ob3RlTmFtZUxldHRlcikge1xuICAgICAgICAgICAgcmV0dXJuIExldHRlcihub3RlbnVtYmVyLCB3aGl0ZW5vdGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHNoZWV0bXVzaWMuU2hvd05vdGVMZXR0ZXJzID09IE1pZGlPcHRpb25zLk5vdGVOYW1lRml4ZWREb1JlTWkpIHtcbiAgICAgICAgICAgIHN0cmluZ1tdIGZpeGVkRG9SZU1pID0ge1xuICAgICAgICAgICAgICAgIFwiTGFcIiwgXCJMaVwiLCBcIlRpXCIsIFwiRG9cIiwgXCJEaVwiLCBcIlJlXCIsIFwiUmlcIiwgXCJNaVwiLCBcIkZhXCIsIFwiRmlcIiwgXCJTb1wiLCBcIlNpXCIgXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaW50IG5vdGVzY2FsZSA9IE5vdGVTY2FsZS5Gcm9tTnVtYmVyKG5vdGVudW1iZXIpO1xuICAgICAgICAgICAgcmV0dXJuIGZpeGVkRG9SZU1pW25vdGVzY2FsZV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc2hlZXRtdXNpYy5TaG93Tm90ZUxldHRlcnMgPT0gTWlkaU9wdGlvbnMuTm90ZU5hbWVNb3ZhYmxlRG9SZU1pKSB7XG4gICAgICAgICAgICBzdHJpbmdbXSBmaXhlZERvUmVNaSA9IHtcbiAgICAgICAgICAgICAgICBcIkxhXCIsIFwiTGlcIiwgXCJUaVwiLCBcIkRvXCIsIFwiRGlcIiwgXCJSZVwiLCBcIlJpXCIsIFwiTWlcIiwgXCJGYVwiLCBcIkZpXCIsIFwiU29cIiwgXCJTaVwiIFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGludCBtYWluc2NhbGUgPSBzaGVldG11c2ljLk1haW5LZXkuTm90ZXNjYWxlKCk7XG4gICAgICAgICAgICBpbnQgZGlmZiA9IE5vdGVTY2FsZS5DIC0gbWFpbnNjYWxlO1xuICAgICAgICAgICAgbm90ZW51bWJlciArPSBkaWZmO1xuICAgICAgICAgICAgaWYgKG5vdGVudW1iZXIgPCAwKSB7XG4gICAgICAgICAgICAgICAgbm90ZW51bWJlciArPSAxMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGludCBub3Rlc2NhbGUgPSBOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyKTtcbiAgICAgICAgICAgIHJldHVybiBmaXhlZERvUmVNaVtub3Rlc2NhbGVdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHNoZWV0bXVzaWMuU2hvd05vdGVMZXR0ZXJzID09IE1pZGlPcHRpb25zLk5vdGVOYW1lRml4ZWROdW1iZXIpIHtcbiAgICAgICAgICAgIHN0cmluZ1tdIG51bSA9IHtcbiAgICAgICAgICAgICAgICBcIjEwXCIsIFwiMTFcIiwgXCIxMlwiLCBcIjFcIiwgXCIyXCIsIFwiM1wiLCBcIjRcIiwgXCI1XCIsIFwiNlwiLCBcIjdcIiwgXCI4XCIsIFwiOVwiIFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGludCBub3Rlc2NhbGUgPSBOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyKTtcbiAgICAgICAgICAgIHJldHVybiBudW1bbm90ZXNjYWxlXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzaGVldG11c2ljLlNob3dOb3RlTGV0dGVycyA9PSBNaWRpT3B0aW9ucy5Ob3RlTmFtZU1vdmFibGVOdW1iZXIpIHtcbiAgICAgICAgICAgIHN0cmluZ1tdIG51bSA9IHtcbiAgICAgICAgICAgICAgICBcIjEwXCIsIFwiMTFcIiwgXCIxMlwiLCBcIjFcIiwgXCIyXCIsIFwiM1wiLCBcIjRcIiwgXCI1XCIsIFwiNlwiLCBcIjdcIiwgXCI4XCIsIFwiOVwiIFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGludCBtYWluc2NhbGUgPSBzaGVldG11c2ljLk1haW5LZXkuTm90ZXNjYWxlKCk7XG4gICAgICAgICAgICBpbnQgZGlmZiA9IE5vdGVTY2FsZS5DIC0gbWFpbnNjYWxlO1xuICAgICAgICAgICAgbm90ZW51bWJlciArPSBkaWZmO1xuICAgICAgICAgICAgaWYgKG5vdGVudW1iZXIgPCAwKSB7XG4gICAgICAgICAgICAgICAgbm90ZW51bWJlciArPSAxMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGludCBub3Rlc2NhbGUgPSBOb3RlU2NhbGUuRnJvbU51bWJlcihub3RlbnVtYmVyKTtcbiAgICAgICAgICAgIHJldHVybiBudW1bbm90ZXNjYWxlXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbGV0dGVyIChBLCBBIywgQmIpIHJlcHJlc2VudGluZyB0aGlzIG5vdGUgKi9cbiAgICBwcml2YXRlIHN0cmluZyBMZXR0ZXIoaW50IG5vdGVudW1iZXIsIFdoaXRlTm90ZSB3aGl0ZW5vdGUpIHtcbiAgICAgICAgaW50IG5vdGVzY2FsZSA9IE5vdGVTY2FsZS5Gcm9tTnVtYmVyKG5vdGVudW1iZXIpO1xuICAgICAgICBzd2l0Y2gobm90ZXNjYWxlKSB7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5BOiByZXR1cm4gXCJBXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5COiByZXR1cm4gXCJCXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5DOiByZXR1cm4gXCJDXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5EOiByZXR1cm4gXCJEXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5FOiByZXR1cm4gXCJFXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5GOiByZXR1cm4gXCJGXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5HOiByZXR1cm4gXCJHXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5Bc2hhcnA6XG4gICAgICAgICAgICAgICAgaWYgKHdoaXRlbm90ZS5MZXR0ZXIgPT0gV2hpdGVOb3RlLkEpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIkEjXCI7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJCYlwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuQ3NoYXJwOlxuICAgICAgICAgICAgICAgIGlmICh3aGl0ZW5vdGUuTGV0dGVyID09IFdoaXRlTm90ZS5DKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJDI1wiO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiRGJcIjtcbiAgICAgICAgICAgIGNhc2UgTm90ZVNjYWxlLkRzaGFycDpcbiAgICAgICAgICAgICAgICBpZiAod2hpdGVub3RlLkxldHRlciA9PSBXaGl0ZU5vdGUuRClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiRCNcIjtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIkViXCI7XG4gICAgICAgICAgICBjYXNlIE5vdGVTY2FsZS5Gc2hhcnA6XG4gICAgICAgICAgICAgICAgaWYgKHdoaXRlbm90ZS5MZXR0ZXIgPT0gV2hpdGVOb3RlLkYpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIkYjXCI7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJHYlwiO1xuICAgICAgICAgICAgY2FzZSBOb3RlU2NhbGUuR3NoYXJwOlxuICAgICAgICAgICAgICAgIGlmICh3aGl0ZW5vdGUuTGV0dGVyID09IFdoaXRlTm90ZS5HKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJHI1wiO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiQWJcIjtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgQ2hvcmQgU3ltYm9sOlxuICAgICAqIC0gRHJhdyB0aGUgYWNjaWRlbnRhbCBzeW1ib2xzLlxuICAgICAqIC0gRHJhdyB0aGUgYmxhY2sgY2lyY2xlIG5vdGVzLlxuICAgICAqIC0gRHJhdyB0aGUgc3RlbXMuXG4gICAgICBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIC8qIEFsaWduIHRoZSBjaG9yZCB0byB0aGUgcmlnaHQgKi9cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oV2lkdGggLSBNaW5XaWR0aCwgMCk7XG5cbiAgICAgICAgLyogRHJhdyB0aGUgYWNjaWRlbnRhbHMuICovXG4gICAgICAgIFdoaXRlTm90ZSB0b3BzdGFmZiA9IFdoaXRlTm90ZS5Ub3AoY2xlZik7XG4gICAgICAgIGludCB4cG9zID0gRHJhd0FjY2lkKGcsIHBlbiwgeXRvcCk7XG5cbiAgICAgICAgLyogRHJhdyB0aGUgbm90ZXMgKi9cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeHBvcywgMCk7XG4gICAgICAgIERyYXdOb3RlcyhnLCBwZW4sIHl0b3AsIHRvcHN0YWZmKTtcbiAgICAgICAgaWYgKHNoZWV0bXVzaWMgIT0gbnVsbCAmJiBzaGVldG11c2ljLlNob3dOb3RlTGV0dGVycyAhPSAwKSB7XG4gICAgICAgICAgICBEcmF3Tm90ZUxldHRlcnMoZywgcGVuLCB5dG9wLCB0b3BzdGFmZik7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBEcmF3IHRoZSBzdGVtcyAqL1xuICAgICAgICBpZiAoc3RlbTEgIT0gbnVsbClcbiAgICAgICAgICAgIHN0ZW0xLkRyYXcoZywgcGVuLCB5dG9wLCB0b3BzdGFmZik7XG4gICAgICAgIGlmIChzdGVtMiAhPSBudWxsKVxuICAgICAgICAgICAgc3RlbTIuRHJhdyhnLCBwZW4sIHl0b3AsIHRvcHN0YWZmKTtcblxuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgteHBvcywgMCk7XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0oV2lkdGggLSBNaW5XaWR0aCksIDApO1xuICAgIH1cblxuICAgIC8qIERyYXcgdGhlIGFjY2lkZW50YWwgc3ltYm9scy4gIElmIHR3byBzeW1ib2xzIG92ZXJsYXAgKGlmIHRoZXlcbiAgICAgKiBhcmUgbGVzcyB0aGFuIDYgbm90ZXMgYXBhcnQpLCB3ZSBjYW5ub3QgZHJhdyB0aGUgc3ltYm9sIGRpcmVjdGx5XG4gICAgICogYWJvdmUgdGhlIHByZXZpb3VzIG9uZS4gIEluc3RlYWQsIHdlIG11c3Qgc2hpZnQgaXQgdG8gdGhlIHJpZ2h0LlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEByZXR1cm4gVGhlIHggcGl4ZWwgd2lkdGggdXNlZCBieSBhbGwgdGhlIGFjY2lkZW50YWxzLlxuICAgICAqL1xuICAgIHB1YmxpYyBpbnQgRHJhd0FjY2lkKEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIGludCB4cG9zID0gMDtcblxuICAgICAgICBBY2NpZFN5bWJvbCBwcmV2ID0gbnVsbDtcbiAgICAgICAgZm9yZWFjaCAoQWNjaWRTeW1ib2wgc3ltYm9sIGluIGFjY2lkc3ltYm9scykge1xuICAgICAgICAgICAgaWYgKHByZXYgIT0gbnVsbCAmJiBzeW1ib2wuTm90ZS5EaXN0KHByZXYuTm90ZSkgPCA2KSB7XG4gICAgICAgICAgICAgICAgeHBvcyArPSBzeW1ib2wuV2lkdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSh4cG9zLCAwKTtcbiAgICAgICAgICAgIHN5bWJvbC5EcmF3KGcsIHBlbiwgeXRvcCk7XG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgteHBvcywgMCk7XG4gICAgICAgICAgICBwcmV2ID0gc3ltYm9sO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcmV2ICE9IG51bGwpIHtcbiAgICAgICAgICAgIHhwb3MgKz0gcHJldi5XaWR0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geHBvcztcbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgYmxhY2sgY2lyY2xlIG5vdGVzLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEBwYXJhbSB0b3BzdGFmZiBUaGUgd2hpdGUgbm90ZSBvZiB0aGUgdG9wIG9mIHRoZSBzdGFmZi5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3Tm90ZXMoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3AsIFdoaXRlTm90ZSB0b3BzdGFmZikge1xuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgICAgICBmb3JlYWNoIChOb3RlRGF0YSBub3RlIGluIG5vdGVkYXRhKSB7XG4gICAgICAgICAgICAvKiBHZXQgdGhlIHgseSBwb3NpdGlvbiB0byBkcmF3IHRoZSBub3RlICovXG4gICAgICAgICAgICBpbnQgeW5vdGUgPSB5dG9wICsgdG9wc3RhZmYuRGlzdChub3RlLndoaXRlbm90ZSkgKiBcbiAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG4gICAgICAgICAgICBpbnQgeG5vdGUgPSBTaGVldE11c2ljLkxpbmVTcGFjZS80O1xuICAgICAgICAgICAgaWYgKCFub3RlLmxlZnRzaWRlKVxuICAgICAgICAgICAgICAgIHhub3RlICs9IFNoZWV0TXVzaWMuTm90ZVdpZHRoO1xuXG4gICAgICAgICAgICAvKiBEcmF3IHJvdGF0ZWQgZWxsaXBzZS4gIFlvdSBtdXN0IGZpcnN0IHRyYW5zbGF0ZSAoMCwwKVxuICAgICAgICAgICAgICogdG8gdGhlIGNlbnRlciBvZiB0aGUgZWxsaXBzZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oeG5vdGUgKyBTaGVldE11c2ljLk5vdGVXaWR0aC8yICsgMSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5bm90ZSAtIFNoZWV0TXVzaWMuTGluZVdpZHRoICsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQvMik7XG4gICAgICAgICAgICBnLlJvdGF0ZVRyYW5zZm9ybSgtNDUpO1xuXG4gICAgICAgICAgICBpZiAoc2hlZXRtdXNpYyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcGVuLkNvbG9yID0gc2hlZXRtdXNpYy5Ob3RlQ29sb3Iobm90ZS5udW1iZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcGVuLkNvbG9yID0gQ29sb3IuQmxhY2s7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChub3RlLmR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5XaG9sZSB8fCBcbiAgICAgICAgICAgICAgICBub3RlLmR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5IYWxmIHx8XG4gICAgICAgICAgICAgICAgbm90ZS5kdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkSGFsZikge1xuXG4gICAgICAgICAgICAgICAgZy5EcmF3RWxsaXBzZShwZW4sIC1TaGVldE11c2ljLk5vdGVXaWR0aC8yLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC1TaGVldE11c2ljLk5vdGVIZWlnaHQvMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZVdpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LTEpO1xuXG4gICAgICAgICAgICAgICAgZy5EcmF3RWxsaXBzZShwZW4sIC1TaGVldE11c2ljLk5vdGVXaWR0aC8yLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC1TaGVldE11c2ljLk5vdGVIZWlnaHQvMiArIDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC0yKTtcblxuICAgICAgICAgICAgICAgIGcuRHJhd0VsbGlwc2UocGVuLCAtU2hlZXRNdXNpYy5Ob3RlV2lkdGgvMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIgKyAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQtMyk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIEJydXNoIGJydXNoID0gQnJ1c2hlcy5CbGFjaztcbiAgICAgICAgICAgICAgICBpZiAocGVuLkNvbG9yICE9IENvbG9yLkJsYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGJydXNoID0gbmV3IFNvbGlkQnJ1c2gocGVuLkNvbG9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZy5GaWxsRWxsaXBzZShicnVzaCwgLVNoZWV0TXVzaWMuTm90ZVdpZHRoLzIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLVNoZWV0TXVzaWMuTm90ZUhlaWdodC8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQtMSk7XG4gICAgICAgICAgICAgICAgaWYgKHBlbi5Db2xvciAhPSBDb2xvci5CbGFjaykge1xuICAgICAgICAgICAgICAgICAgICBicnVzaC5EaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwZW4uQ29sb3IgPSBDb2xvci5CbGFjaztcbiAgICAgICAgICAgIGcuRHJhd0VsbGlwc2UocGVuLCAtU2hlZXRNdXNpYy5Ob3RlV2lkdGgvMiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC1TaGVldE11c2ljLk5vdGVIZWlnaHQvMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZVdpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LTEpO1xuXG4gICAgICAgICAgICBnLlJvdGF0ZVRyYW5zZm9ybSg0NSk7XG4gICAgICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSggLSAoeG5vdGUgKyBTaGVldE11c2ljLk5vdGVXaWR0aC8yICsgMSksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gKHlub3RlIC0gU2hlZXRNdXNpYy5MaW5lV2lkdGggKyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVIZWlnaHQvMikpO1xuXG4gICAgICAgICAgICAvKiBEcmF3IGEgZG90IGlmIHRoaXMgaXMgYSBkb3R0ZWQgZHVyYXRpb24uICovXG4gICAgICAgICAgICBpZiAobm90ZS5kdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkSGFsZiB8fFxuICAgICAgICAgICAgICAgIG5vdGUuZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZFF1YXJ0ZXIgfHxcbiAgICAgICAgICAgICAgICBub3RlLmR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGgpIHtcblxuICAgICAgICAgICAgICAgIGcuRmlsbEVsbGlwc2UoQnJ1c2hlcy5CbGFjaywgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4bm90ZSArIFNoZWV0TXVzaWMuTm90ZVdpZHRoICsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLkxpbmVTcGFjZS8zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeW5vdGUgKyBTaGVldE11c2ljLkxpbmVTcGFjZS8zLCA0LCA0KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBEcmF3IGhvcml6b250YWwgbGluZXMgaWYgbm90ZSBpcyBhYm92ZS9iZWxvdyB0aGUgc3RhZmYgKi9cbiAgICAgICAgICAgIFdoaXRlTm90ZSB0b3AgPSB0b3BzdGFmZi5BZGQoMSk7XG4gICAgICAgICAgICBpbnQgZGlzdCA9IG5vdGUud2hpdGVub3RlLkRpc3QodG9wKTtcbiAgICAgICAgICAgIGludCB5ID0geXRvcCAtIFNoZWV0TXVzaWMuTGluZVdpZHRoO1xuXG4gICAgICAgICAgICBpZiAoZGlzdCA+PSAyKSB7XG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDI7IGkgPD0gZGlzdDsgaSArPSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIHkgLT0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeG5vdGUgLSBTaGVldE11c2ljLkxpbmVTcGFjZS80LCB5LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhub3RlICsgU2hlZXRNdXNpYy5Ob3RlV2lkdGggKyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQsIHkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgV2hpdGVOb3RlIGJvdHRvbSA9IHRvcC5BZGQoLTgpO1xuICAgICAgICAgICAgeSA9IHl0b3AgKyAoU2hlZXRNdXNpYy5MaW5lU3BhY2UgKyBTaGVldE11c2ljLkxpbmVXaWR0aCkgKiA0IC0gMTtcbiAgICAgICAgICAgIGRpc3QgPSBib3R0b20uRGlzdChub3RlLndoaXRlbm90ZSk7XG4gICAgICAgICAgICBpZiAoZGlzdCA+PSAyKSB7XG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDI7IGkgPD0gZGlzdDsgaSs9IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgeSArPSBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4bm90ZSAtIFNoZWV0TXVzaWMuTGluZVNwYWNlLzQsIHksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeG5vdGUgKyBTaGVldE11c2ljLk5vdGVXaWR0aCArIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5MaW5lU3BhY2UvNCwgeSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyogRW5kIGRyYXdpbmcgaG9yaXpvbnRhbCBsaW5lcyAqL1xuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgbm90ZSBsZXR0ZXJzIChBLCBBIywgQmIsIGV0YykgbmV4dCB0byB0aGUgbm90ZSBjaXJjbGVzLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqIEBwYXJhbSB0b3BzdGFmZiBUaGUgd2hpdGUgbm90ZSBvZiB0aGUgdG9wIG9mIHRoZSBzdGFmZi5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3Tm90ZUxldHRlcnMoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3AsIFdoaXRlTm90ZSB0b3BzdGFmZikge1xuICAgICAgICBib29sIG92ZXJsYXAgPSBOb3Rlc092ZXJsYXAobm90ZWRhdGEsIDAsIG5vdGVkYXRhLkxlbmd0aCk7XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG5cbiAgICAgICAgZm9yZWFjaCAoTm90ZURhdGEgbm90ZSBpbiBub3RlZGF0YSkge1xuICAgICAgICAgICAgaWYgKCFub3RlLmxlZnRzaWRlKSB7XG4gICAgICAgICAgICAgICAgLyogVGhlcmUncyBub3QgZW5vdWdodCBwaXhlbCByb29tIHRvIHNob3cgdGhlIGxldHRlciAqL1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBHZXQgdGhlIHgseSBwb3NpdGlvbiB0byBkcmF3IHRoZSBub3RlICovXG4gICAgICAgICAgICBpbnQgeW5vdGUgPSB5dG9wICsgdG9wc3RhZmYuRGlzdChub3RlLndoaXRlbm90ZSkgKiBcbiAgICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuXG4gICAgICAgICAgICAvKiBEcmF3IHRoZSBsZXR0ZXIgdG8gdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIG5vdGUgKi9cbiAgICAgICAgICAgIGludCB4bm90ZSA9IFNoZWV0TXVzaWMuTm90ZVdpZHRoICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvNDtcblxuICAgICAgICAgICAgaWYgKG5vdGUuZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEhhbGYgfHxcbiAgICAgICAgICAgICAgICBub3RlLmR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRRdWFydGVyIHx8XG4gICAgICAgICAgICAgICAgbm90ZS5kdXJhdGlvbiA9PSBOb3RlRHVyYXRpb24uRG90dGVkRWlnaHRoIHx8IG92ZXJsYXApIHtcblxuICAgICAgICAgICAgICAgIHhub3RlICs9IFNoZWV0TXVzaWMuTm90ZVdpZHRoLzI7XG4gICAgICAgICAgICB9IFxuICAgICAgICAgICAgZy5EcmF3U3RyaW5nKE5vdGVOYW1lKG5vdGUubnVtYmVyLCBub3RlLndoaXRlbm90ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5MZXR0ZXJGb250LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICBCcnVzaGVzLkJsYWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHhub3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHlub3RlIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKiogUmV0dXJuIHRydWUgaWYgdGhlIGNob3JkcyBjYW4gYmUgY29ubmVjdGVkLCB3aGVyZSB0aGVpciBzdGVtcyBhcmVcbiAgICAgKiBqb2luZWQgYnkgYSBob3Jpem9udGFsIGJlYW0uIEluIG9yZGVyIHRvIGNyZWF0ZSB0aGUgYmVhbTpcbiAgICAgKlxuICAgICAqIC0gVGhlIGNob3JkcyBtdXN0IGJlIGluIHRoZSBzYW1lIG1lYXN1cmUuXG4gICAgICogLSBUaGUgY2hvcmQgc3RlbXMgc2hvdWxkIG5vdCBiZSBhIGRvdHRlZCBkdXJhdGlvbi5cbiAgICAgKiAtIFRoZSBjaG9yZCBzdGVtcyBtdXN0IGJlIHRoZSBzYW1lIGR1cmF0aW9uLCB3aXRoIG9uZSBleGNlcHRpb25cbiAgICAgKiAgIChEb3R0ZWQgRWlnaHRoIHRvIFNpeHRlZW50aCkuXG4gICAgICogLSBUaGUgc3RlbXMgbXVzdCBhbGwgcG9pbnQgaW4gdGhlIHNhbWUgZGlyZWN0aW9uICh1cCBvciBkb3duKS5cbiAgICAgKiAtIFRoZSBjaG9yZCBjYW5ub3QgYWxyZWFkeSBiZSBwYXJ0IG9mIGEgYmVhbS5cbiAgICAgKlxuICAgICAqIC0gNi1jaG9yZCBiZWFtcyBtdXN0IGJlIDh0aCBub3RlcyBpbiAzLzQsIDYvOCwgb3IgNi80IHRpbWVcbiAgICAgKiAtIDMtY2hvcmQgYmVhbXMgbXVzdCBiZSBlaXRoZXIgdHJpcGxldHMsIG9yIDh0aCBub3RlcyAoMTIvOCB0aW1lIHNpZ25hdHVyZSlcbiAgICAgKiAtIDQtY2hvcmQgYmVhbXMgYXJlIG9rIGZvciAyLzIsIDIvNCBvciA0LzQgdGltZSwgYW55IGR1cmF0aW9uXG4gICAgICogLSA0LWNob3JkIGJlYW1zIGFyZSBvayBmb3Igb3RoZXIgdGltZXMgaWYgdGhlIGR1cmF0aW9uIGlzIDE2dGhcbiAgICAgKiAtIDItY2hvcmQgYmVhbXMgYXJlIG9rIGZvciBhbnkgZHVyYXRpb25cbiAgICAgKlxuICAgICAqIElmIHN0YXJ0UXVhcnRlciBpcyB0cnVlLCB0aGUgZmlyc3Qgbm90ZSBzaG91bGQgc3RhcnQgb24gYSBxdWFydGVyIG5vdGVcbiAgICAgKiAob25seSBhcHBsaWVzIHRvIDItY2hvcmQgYmVhbXMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgXG4gICAgYm9vbCBDYW5DcmVhdGVCZWFtKENob3JkU3ltYm9sW10gY2hvcmRzLCBUaW1lU2lnbmF0dXJlIHRpbWUsIGJvb2wgc3RhcnRRdWFydGVyKSB7XG4gICAgICAgIGludCBudW1DaG9yZHMgPSBjaG9yZHMuTGVuZ3RoO1xuICAgICAgICBTdGVtIGZpcnN0U3RlbSA9IGNob3Jkc1swXS5TdGVtO1xuICAgICAgICBTdGVtIGxhc3RTdGVtID0gY2hvcmRzW2Nob3Jkcy5MZW5ndGgtMV0uU3RlbTtcbiAgICAgICAgaWYgKGZpcnN0U3RlbSA9PSBudWxsIHx8IGxhc3RTdGVtID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpbnQgbWVhc3VyZSA9IGNob3Jkc1swXS5TdGFydFRpbWUgLyB0aW1lLk1lYXN1cmU7XG4gICAgICAgIE5vdGVEdXJhdGlvbiBkdXIgPSBmaXJzdFN0ZW0uRHVyYXRpb247XG4gICAgICAgIE5vdGVEdXJhdGlvbiBkdXIyID0gbGFzdFN0ZW0uRHVyYXRpb247XG5cbiAgICAgICAgYm9vbCBkb3R0ZWQ4X3RvXzE2ID0gZmFsc2U7XG4gICAgICAgIGlmIChjaG9yZHMuTGVuZ3RoID09IDIgJiYgZHVyID09IE5vdGVEdXJhdGlvbi5Eb3R0ZWRFaWdodGggJiZcbiAgICAgICAgICAgIGR1cjIgPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCkge1xuICAgICAgICAgICAgZG90dGVkOF90b18xNiA9IHRydWU7XG4gICAgICAgIH0gXG5cbiAgICAgICAgaWYgKGR1ciA9PSBOb3RlRHVyYXRpb24uV2hvbGUgfHwgZHVyID09IE5vdGVEdXJhdGlvbi5IYWxmIHx8XG4gICAgICAgICAgICBkdXIgPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEhhbGYgfHwgZHVyID09IE5vdGVEdXJhdGlvbi5RdWFydGVyIHx8XG4gICAgICAgICAgICBkdXIgPT0gTm90ZUR1cmF0aW9uLkRvdHRlZFF1YXJ0ZXIgfHxcbiAgICAgICAgICAgIChkdXIgPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCAmJiAhZG90dGVkOF90b18xNikpIHtcblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG51bUNob3JkcyA9PSA2KSB7XG4gICAgICAgICAgICBpZiAoZHVyICE9IE5vdGVEdXJhdGlvbi5FaWdodGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBib29sIGNvcnJlY3RUaW1lID0gXG4gICAgICAgICAgICAgICAoKHRpbWUuTnVtZXJhdG9yID09IDMgJiYgdGltZS5EZW5vbWluYXRvciA9PSA0KSB8fFxuICAgICAgICAgICAgICAgICh0aW1lLk51bWVyYXRvciA9PSA2ICYmIHRpbWUuRGVub21pbmF0b3IgPT0gOCkgfHxcbiAgICAgICAgICAgICAgICAodGltZS5OdW1lcmF0b3IgPT0gNiAmJiB0aW1lLkRlbm9taW5hdG9yID09IDQpICk7XG5cbiAgICAgICAgICAgIGlmICghY29ycmVjdFRpbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aW1lLk51bWVyYXRvciA9PSA2ICYmIHRpbWUuRGVub21pbmF0b3IgPT0gNCkge1xuICAgICAgICAgICAgICAgIC8qIGZpcnN0IGNob3JkIG11c3Qgc3RhcnQgYXQgMXN0IG9yIDR0aCBxdWFydGVyIG5vdGUgKi9cbiAgICAgICAgICAgICAgICBpbnQgYmVhdCA9IHRpbWUuUXVhcnRlciAqIDM7XG4gICAgICAgICAgICAgICAgaWYgKChjaG9yZHNbMF0uU3RhcnRUaW1lICUgYmVhdCkgPiB0aW1lLlF1YXJ0ZXIvNikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChudW1DaG9yZHMgPT0gNCkge1xuICAgICAgICAgICAgaWYgKHRpbWUuTnVtZXJhdG9yID09IDMgJiYgdGltZS5EZW5vbWluYXRvciA9PSA4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYm9vbCBjb3JyZWN0VGltZSA9IFxuICAgICAgICAgICAgICAodGltZS5OdW1lcmF0b3IgPT0gMiB8fCB0aW1lLk51bWVyYXRvciA9PSA0IHx8IHRpbWUuTnVtZXJhdG9yID09IDgpO1xuICAgICAgICAgICAgaWYgKCFjb3JyZWN0VGltZSAmJiBkdXIgIT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogY2hvcmQgbXVzdCBzdGFydCBvbiBxdWFydGVyIG5vdGUgKi9cbiAgICAgICAgICAgIGludCBiZWF0ID0gdGltZS5RdWFydGVyO1xuICAgICAgICAgICAgaWYgKGR1ciA9PSBOb3RlRHVyYXRpb24uRWlnaHRoKSB7XG4gICAgICAgICAgICAgICAgLyogOHRoIG5vdGUgY2hvcmQgbXVzdCBzdGFydCBvbiAxc3Qgb3IgM3JkIHF1YXJ0ZXIgbm90ZSAqL1xuICAgICAgICAgICAgICAgIGJlYXQgPSB0aW1lLlF1YXJ0ZXIgKiAyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZHVyID09IE5vdGVEdXJhdGlvbi5UaGlydHlTZWNvbmQpIHtcbiAgICAgICAgICAgICAgICAvKiAzMm5kIG5vdGUgbXVzdCBzdGFydCBvbiBhbiA4dGggYmVhdCAqL1xuICAgICAgICAgICAgICAgIGJlYXQgPSB0aW1lLlF1YXJ0ZXIgLyAyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoKGNob3Jkc1swXS5TdGFydFRpbWUgJSBiZWF0KSA+IHRpbWUuUXVhcnRlci82KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG51bUNob3JkcyA9PSAzKSB7XG4gICAgICAgICAgICBib29sIHZhbGlkID0gKGR1ciA9PSBOb3RlRHVyYXRpb24uVHJpcGxldCkgfHwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgIChkdXIgPT0gTm90ZUR1cmF0aW9uLkVpZ2h0aCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5OdW1lcmF0b3IgPT0gMTIgJiYgdGltZS5EZW5vbWluYXRvciA9PSA4KTtcbiAgICAgICAgICAgIGlmICghdmFsaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIGNob3JkIG11c3Qgc3RhcnQgb24gcXVhcnRlciBub3RlICovXG4gICAgICAgICAgICBpbnQgYmVhdCA9IHRpbWUuUXVhcnRlcjtcbiAgICAgICAgICAgIGlmICh0aW1lLk51bWVyYXRvciA9PSAxMiAmJiB0aW1lLkRlbm9taW5hdG9yID09IDgpIHtcbiAgICAgICAgICAgICAgICAvKiBJbiAxMi84IHRpbWUsIGNob3JkIG11c3Qgc3RhcnQgb24gMyo4dGggYmVhdCAqL1xuICAgICAgICAgICAgICAgIGJlYXQgPSB0aW1lLlF1YXJ0ZXIvMiAqIDM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoKGNob3Jkc1swXS5TdGFydFRpbWUgJSBiZWF0KSA+IHRpbWUuUXVhcnRlci82KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZWxzZSBpZiAobnVtQ2hvcmRzID09IDIpIHtcbiAgICAgICAgICAgIGlmIChzdGFydFF1YXJ0ZXIpIHtcbiAgICAgICAgICAgICAgICBpbnQgYmVhdCA9IHRpbWUuUXVhcnRlcjtcbiAgICAgICAgICAgICAgICBpZiAoKGNob3Jkc1swXS5TdGFydFRpbWUgJSBiZWF0KSA+IHRpbWUuUXVhcnRlci82KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3JlYWNoIChDaG9yZFN5bWJvbCBjaG9yZCBpbiBjaG9yZHMpIHtcbiAgICAgICAgICAgIGlmICgoY2hvcmQuU3RhcnRUaW1lIC8gdGltZS5NZWFzdXJlKSAhPSBtZWFzdXJlKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmIChjaG9yZC5TdGVtID09IG51bGwpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgaWYgKGNob3JkLlN0ZW0uRHVyYXRpb24gIT0gZHVyICYmICFkb3R0ZWQ4X3RvXzE2KVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmIChjaG9yZC5TdGVtLmlzQmVhbSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBDaGVjayB0aGF0IGFsbCBzdGVtcyBjYW4gcG9pbnQgaW4gc2FtZSBkaXJlY3Rpb24gKi9cbiAgICAgICAgYm9vbCBoYXNUd29TdGVtcyA9IGZhbHNlO1xuICAgICAgICBpbnQgZGlyZWN0aW9uID0gU3RlbS5VcDsgXG4gICAgICAgIGZvcmVhY2ggKENob3JkU3ltYm9sIGNob3JkIGluIGNob3Jkcykge1xuICAgICAgICAgICAgaWYgKGNob3JkLkhhc1R3b1N0ZW1zKSB7XG4gICAgICAgICAgICAgICAgaWYgKGhhc1R3b1N0ZW1zICYmIGNob3JkLlN0ZW0uRGlyZWN0aW9uICE9IGRpcmVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGhhc1R3b1N0ZW1zID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSBjaG9yZC5TdGVtLkRpcmVjdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIEdldCB0aGUgZmluYWwgc3RlbSBkaXJlY3Rpb24gKi9cbiAgICAgICAgaWYgKCFoYXNUd29TdGVtcykge1xuICAgICAgICAgICAgV2hpdGVOb3RlIG5vdGUxO1xuICAgICAgICAgICAgV2hpdGVOb3RlIG5vdGUyO1xuICAgICAgICAgICAgbm90ZTEgPSAoZmlyc3RTdGVtLkRpcmVjdGlvbiA9PSBTdGVtLlVwID8gZmlyc3RTdGVtLlRvcCA6IGZpcnN0U3RlbS5Cb3R0b20pO1xuICAgICAgICAgICAgbm90ZTIgPSAobGFzdFN0ZW0uRGlyZWN0aW9uID09IFN0ZW0uVXAgPyBsYXN0U3RlbS5Ub3AgOiBsYXN0U3RlbS5Cb3R0b20pO1xuICAgICAgICAgICAgZGlyZWN0aW9uID0gU3RlbURpcmVjdGlvbihub3RlMSwgbm90ZTIsIGNob3Jkc1swXS5DbGVmKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIElmIHRoZSBub3RlcyBhcmUgdG9vIGZhciBhcGFydCwgZG9uJ3QgdXNlIGEgYmVhbSAqL1xuICAgICAgICBpZiAoZGlyZWN0aW9uID09IFN0ZW0uVXApIHtcbiAgICAgICAgICAgIGlmIChNYXRoLkFicyhmaXJzdFN0ZW0uVG9wLkRpc3QobGFzdFN0ZW0uVG9wKSkgPj0gMTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoTWF0aC5BYnMoZmlyc3RTdGVtLkJvdHRvbS5EaXN0KGxhc3RTdGVtLkJvdHRvbSkpID49IDExKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuXG4gICAgLyoqIENvbm5lY3QgdGhlIGNob3JkcyB1c2luZyBhIGhvcml6b250YWwgYmVhbS4gXG4gICAgICpcbiAgICAgKiBzcGFjaW5nIGlzIHRoZSBob3Jpem9udGFsIGRpc3RhbmNlIChpbiBwaXhlbHMpIGJldHdlZW4gdGhlIHJpZ2h0IHNpZGUgXG4gICAgICogb2YgdGhlIGZpcnN0IGNob3JkLCBhbmQgdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIGxhc3QgY2hvcmQuXG4gICAgICpcbiAgICAgKiBUbyBtYWtlIHRoZSBiZWFtOlxuICAgICAqIC0gQ2hhbmdlIHRoZSBzdGVtIGRpcmVjdGlvbnMgZm9yIGVhY2ggY2hvcmQsIHNvIHRoZXkgbWF0Y2guXG4gICAgICogLSBJbiB0aGUgZmlyc3QgY2hvcmQsIHBhc3MgdGhlIHN0ZW0gbG9jYXRpb24gb2YgdGhlIGxhc3QgY2hvcmQsIGFuZFxuICAgICAqICAgdGhlIGhvcml6b250YWwgc3BhY2luZyB0byB0aGF0IGxhc3Qgc3RlbS5cbiAgICAgKiAtIE1hcmsgYWxsIGNob3JkcyAoZXhjZXB0IHRoZSBmaXJzdCkgYXMgXCJyZWNlaXZlclwiIHBhaXJzLCBzbyB0aGF0IFxuICAgICAqICAgdGhleSBkb24ndCBkcmF3IGEgY3Vydnkgc3RlbS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIFxuICAgIHZvaWQgQ3JlYXRlQmVhbShDaG9yZFN5bWJvbFtdIGNob3JkcywgaW50IHNwYWNpbmcpIHtcbiAgICAgICAgU3RlbSBmaXJzdFN0ZW0gPSBjaG9yZHNbMF0uU3RlbTtcbiAgICAgICAgU3RlbSBsYXN0U3RlbSA9IGNob3Jkc1tjaG9yZHMuTGVuZ3RoLTFdLlN0ZW07XG5cbiAgICAgICAgLyogQ2FsY3VsYXRlIHRoZSBuZXcgc3RlbSBkaXJlY3Rpb24gKi9cbiAgICAgICAgaW50IG5ld2RpcmVjdGlvbiA9IC0xO1xuICAgICAgICBmb3JlYWNoIChDaG9yZFN5bWJvbCBjaG9yZCBpbiBjaG9yZHMpIHtcbiAgICAgICAgICAgIGlmIChjaG9yZC5IYXNUd29TdGVtcykge1xuICAgICAgICAgICAgICAgIG5ld2RpcmVjdGlvbiA9IGNob3JkLlN0ZW0uRGlyZWN0aW9uO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5ld2RpcmVjdGlvbiA9PSAtMSkge1xuICAgICAgICAgICAgV2hpdGVOb3RlIG5vdGUxO1xuICAgICAgICAgICAgV2hpdGVOb3RlIG5vdGUyO1xuICAgICAgICAgICAgbm90ZTEgPSAoZmlyc3RTdGVtLkRpcmVjdGlvbiA9PSBTdGVtLlVwID8gZmlyc3RTdGVtLlRvcCA6IGZpcnN0U3RlbS5Cb3R0b20pO1xuICAgICAgICAgICAgbm90ZTIgPSAobGFzdFN0ZW0uRGlyZWN0aW9uID09IFN0ZW0uVXAgPyBsYXN0U3RlbS5Ub3AgOiBsYXN0U3RlbS5Cb3R0b20pO1xuICAgICAgICAgICAgbmV3ZGlyZWN0aW9uID0gU3RlbURpcmVjdGlvbihub3RlMSwgbm90ZTIsIGNob3Jkc1swXS5DbGVmKTtcbiAgICAgICAgfVxuICAgICAgICBmb3JlYWNoIChDaG9yZFN5bWJvbCBjaG9yZCBpbiBjaG9yZHMpIHtcbiAgICAgICAgICAgIGNob3JkLlN0ZW0uRGlyZWN0aW9uID0gbmV3ZGlyZWN0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNob3Jkcy5MZW5ndGggPT0gMikge1xuICAgICAgICAgICAgQnJpbmdTdGVtc0Nsb3NlcihjaG9yZHMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgTGluZVVwU3RlbUVuZHMoY2hvcmRzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZpcnN0U3RlbS5TZXRQYWlyKGxhc3RTdGVtLCBzcGFjaW5nKTtcbiAgICAgICAgZm9yIChpbnQgaSA9IDE7IGkgPCBjaG9yZHMuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNob3Jkc1tpXS5TdGVtLlJlY2VpdmVyID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBXZSdyZSBjb25uZWN0aW5nIHRoZSBzdGVtcyBvZiB0d28gY2hvcmRzIHVzaW5nIGEgaG9yaXpvbnRhbCBiZWFtLlxuICAgICAqICBBZGp1c3QgdGhlIHZlcnRpY2FsIGVuZHBvaW50IG9mIHRoZSBzdGVtcywgc28gdGhhdCB0aGV5J3JlIGNsb3NlclxuICAgICAqICB0b2dldGhlci4gIEZvciBhIGRvdHRlZCA4dGggdG8gMTZ0aCBiZWFtLCBpbmNyZWFzZSB0aGUgc3RlbSBvZiB0aGVcbiAgICAgKiAgZG90dGVkIGVpZ2h0aCwgc28gdGhhdCBpdCdzIGFzIGxvbmcgYXMgYSAxNnRoIHN0ZW0uXG4gICAgICovXG4gICAgc3RhdGljIHZvaWRcbiAgICBCcmluZ1N0ZW1zQ2xvc2VyKENob3JkU3ltYm9sW10gY2hvcmRzKSB7XG4gICAgICAgIFN0ZW0gZmlyc3RTdGVtID0gY2hvcmRzWzBdLlN0ZW07XG4gICAgICAgIFN0ZW0gbGFzdFN0ZW0gPSBjaG9yZHNbMV0uU3RlbTtcblxuICAgICAgICAvKiBJZiB3ZSdyZSBjb25uZWN0aW5nIGEgZG90dGVkIDh0aCB0byBhIDE2dGgsIGluY3JlYXNlXG4gICAgICAgICAqIHRoZSBzdGVtIGVuZCBvZiB0aGUgZG90dGVkIGVpZ2h0aC5cbiAgICAgICAgICovXG4gICAgICAgIGlmIChmaXJzdFN0ZW0uRHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aCAmJlxuICAgICAgICAgICAgbGFzdFN0ZW0uRHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlNpeHRlZW50aCkge1xuICAgICAgICAgICAgaWYgKGZpcnN0U3RlbS5EaXJlY3Rpb24gPT0gU3RlbS5VcCkge1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSBmaXJzdFN0ZW0uRW5kLkFkZCgyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSBmaXJzdFN0ZW0uRW5kLkFkZCgtMik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBCcmluZyB0aGUgc3RlbSBlbmRzIGNsb3NlciB0b2dldGhlciAqL1xuICAgICAgICBpbnQgZGlzdGFuY2UgPSBNYXRoLkFicyhmaXJzdFN0ZW0uRW5kLkRpc3QobGFzdFN0ZW0uRW5kKSk7XG4gICAgICAgIGlmIChmaXJzdFN0ZW0uRGlyZWN0aW9uID09IFN0ZW0uVXApIHtcbiAgICAgICAgICAgIGlmIChXaGl0ZU5vdGUuTWF4KGZpcnN0U3RlbS5FbmQsIGxhc3RTdGVtLkVuZCkgPT0gZmlyc3RTdGVtLkVuZClcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSBsYXN0U3RlbS5FbmQuQWRkKGRpc3RhbmNlLzIpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSBmaXJzdFN0ZW0uRW5kLkFkZChkaXN0YW5jZS8yKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChXaGl0ZU5vdGUuTWluKGZpcnN0U3RlbS5FbmQsIGxhc3RTdGVtLkVuZCkgPT0gZmlyc3RTdGVtLkVuZClcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSBsYXN0U3RlbS5FbmQuQWRkKC1kaXN0YW5jZS8yKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmaXJzdFN0ZW0uRW5kID0gZmlyc3RTdGVtLkVuZC5BZGQoLWRpc3RhbmNlLzIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFdlJ3JlIGNvbm5lY3RpbmcgdGhlIHN0ZW1zIG9mIHRocmVlIG9yIG1vcmUgY2hvcmRzIHVzaW5nIGEgaG9yaXpvbnRhbCBiZWFtLlxuICAgICAqICBBZGp1c3QgdGhlIHZlcnRpY2FsIGVuZHBvaW50IG9mIHRoZSBzdGVtcywgc28gdGhhdCB0aGUgbWlkZGxlIGNob3JkIHN0ZW1zXG4gICAgICogIGFyZSB2ZXJ0aWNhbGx5IGluIGJldHdlZW4gdGhlIGZpcnN0IGFuZCBsYXN0IHN0ZW0uXG4gICAgICovXG4gICAgc3RhdGljIHZvaWRcbiAgICBMaW5lVXBTdGVtRW5kcyhDaG9yZFN5bWJvbFtdIGNob3Jkcykge1xuICAgICAgICBTdGVtIGZpcnN0U3RlbSA9IGNob3Jkc1swXS5TdGVtO1xuICAgICAgICBTdGVtIGxhc3RTdGVtID0gY2hvcmRzW2Nob3Jkcy5MZW5ndGgtMV0uU3RlbTtcbiAgICAgICAgU3RlbSBtaWRkbGVTdGVtID0gY2hvcmRzWzFdLlN0ZW07XG5cbiAgICAgICAgaWYgKGZpcnN0U3RlbS5EaXJlY3Rpb24gPT0gU3RlbS5VcCkge1xuICAgICAgICAgICAgLyogRmluZCB0aGUgaGlnaGVzdCBzdGVtLiBUaGUgYmVhbSB3aWxsIGVpdGhlcjpcbiAgICAgICAgICAgICAqIC0gU2xhbnQgZG93bndhcmRzIChmaXJzdCBzdGVtIGlzIGhpZ2hlc3QpXG4gICAgICAgICAgICAgKiAtIFNsYW50IHVwd2FyZHMgKGxhc3Qgc3RlbSBpcyBoaWdoZXN0KVxuICAgICAgICAgICAgICogLSBCZSBzdHJhaWdodCAobWlkZGxlIHN0ZW0gaXMgaGlnaGVzdClcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgV2hpdGVOb3RlIHRvcCA9IGZpcnN0U3RlbS5FbmQ7XG4gICAgICAgICAgICBmb3JlYWNoIChDaG9yZFN5bWJvbCBjaG9yZCBpbiBjaG9yZHMpIHtcbiAgICAgICAgICAgICAgICB0b3AgPSBXaGl0ZU5vdGUuTWF4KHRvcCwgY2hvcmQuU3RlbS5FbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRvcCA9PSBmaXJzdFN0ZW0uRW5kICYmIHRvcC5EaXN0KGxhc3RTdGVtLkVuZCkgPj0gMikge1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSB0b3A7XG4gICAgICAgICAgICAgICAgbWlkZGxlU3RlbS5FbmQgPSB0b3AuQWRkKC0xKTtcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSB0b3AuQWRkKC0yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRvcCA9PSBsYXN0U3RlbS5FbmQgJiYgdG9wLkRpc3QoZmlyc3RTdGVtLkVuZCkgPj0gMikge1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSB0b3AuQWRkKC0yKTtcbiAgICAgICAgICAgICAgICBtaWRkbGVTdGVtLkVuZCA9IHRvcC5BZGQoLTEpO1xuICAgICAgICAgICAgICAgIGxhc3RTdGVtLkVuZCA9IHRvcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSB0b3A7XG4gICAgICAgICAgICAgICAgbWlkZGxlU3RlbS5FbmQgPSB0b3A7XG4gICAgICAgICAgICAgICAgbGFzdFN0ZW0uRW5kID0gdG9wO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLyogRmluZCB0aGUgYm90dG9tbW9zdCBzdGVtLiBUaGUgYmVhbSB3aWxsIGVpdGhlcjpcbiAgICAgICAgICAgICAqIC0gU2xhbnQgdXB3YXJkcyAoZmlyc3Qgc3RlbSBpcyBsb3dlc3QpXG4gICAgICAgICAgICAgKiAtIFNsYW50IGRvd253YXJkcyAobGFzdCBzdGVtIGlzIGxvd2VzdClcbiAgICAgICAgICAgICAqIC0gQmUgc3RyYWlnaHQgKG1pZGRsZSBzdGVtIGlzIGhpZ2hlc3QpXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFdoaXRlTm90ZSBib3R0b20gPSBmaXJzdFN0ZW0uRW5kO1xuICAgICAgICAgICAgZm9yZWFjaCAoQ2hvcmRTeW1ib2wgY2hvcmQgaW4gY2hvcmRzKSB7XG4gICAgICAgICAgICAgICAgYm90dG9tID0gV2hpdGVOb3RlLk1pbihib3R0b20sIGNob3JkLlN0ZW0uRW5kKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGJvdHRvbSA9PSBmaXJzdFN0ZW0uRW5kICYmIGxhc3RTdGVtLkVuZC5EaXN0KGJvdHRvbSkgPj0gMikge1xuICAgICAgICAgICAgICAgIG1pZGRsZVN0ZW0uRW5kID0gYm90dG9tLkFkZCgxKTtcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSBib3R0b20uQWRkKDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoYm90dG9tID09IGxhc3RTdGVtLkVuZCAmJiBmaXJzdFN0ZW0uRW5kLkRpc3QoYm90dG9tKSA+PSAyKSB7XG4gICAgICAgICAgICAgICAgbWlkZGxlU3RlbS5FbmQgPSBib3R0b20uQWRkKDEpO1xuICAgICAgICAgICAgICAgIGZpcnN0U3RlbS5FbmQgPSBib3R0b20uQWRkKDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZmlyc3RTdGVtLkVuZCA9IGJvdHRvbTtcbiAgICAgICAgICAgICAgICBtaWRkbGVTdGVtLkVuZCA9IGJvdHRvbTtcbiAgICAgICAgICAgICAgICBsYXN0U3RlbS5FbmQgPSBib3R0b207XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiBBbGwgbWlkZGxlIHN0ZW1zIGhhdmUgdGhlIHNhbWUgZW5kICovXG4gICAgICAgIGZvciAoaW50IGkgPSAxOyBpIDwgY2hvcmRzLkxlbmd0aC0xOyBpKyspIHtcbiAgICAgICAgICAgIFN0ZW0gc3RlbSA9IGNob3Jkc1tpXS5TdGVtO1xuICAgICAgICAgICAgc3RlbS5FbmQgPSBtaWRkbGVTdGVtLkVuZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHN0cmluZyByZXN1bHQgPSBzdHJpbmcuRm9ybWF0KFwiQ2hvcmRTeW1ib2wgY2xlZj17MH0gc3RhcnQ9ezF9IGVuZD17Mn0gd2lkdGg9ezN9IGhhc3R3b3N0ZW1zPXs0fSBcIiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWYsIFN0YXJ0VGltZSwgRW5kVGltZSwgV2lkdGgsIGhhc3R3b3N0ZW1zKTtcbiAgICAgICAgZm9yZWFjaCAoQWNjaWRTeW1ib2wgc3ltYm9sIGluIGFjY2lkc3ltYm9scykge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHN5bWJvbC5Ub1N0cmluZygpICsgXCIgXCI7XG4gICAgICAgIH1cbiAgICAgICAgZm9yZWFjaCAoTm90ZURhdGEgbm90ZSBpbiBub3RlZGF0YSkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHN0cmluZy5Gb3JtYXQoXCJOb3RlIHdoaXRlbm90ZT17MH0gZHVyYXRpb249ezF9IGxlZnRzaWRlPXsyfSBcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGUud2hpdGVub3RlLCBub3RlLmR1cmF0aW9uLCBub3RlLmxlZnRzaWRlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RlbTEgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHN0ZW0xLlRvU3RyaW5nKCkgKyBcIiBcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RlbTIgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHN0ZW0yLlRvU3RyaW5nKCkgKyBcIiBcIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0OyBcbiAgICB9XG5cbn1cblxuXG59XG5cblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG4vKiogVGhlIHBvc3NpYmxlIGNsZWZzLCBUcmVibGUgb3IgQmFzcyAqL1xucHVibGljIGVudW0gQ2xlZiB7IFRyZWJsZSwgQmFzcyB9O1xuXG4vKiogQGNsYXNzIENsZWZTeW1ib2wgXG4gKiBBIENsZWZTeW1ib2wgcmVwcmVzZW50cyBlaXRoZXIgYSBUcmVibGUgb3IgQmFzcyBDbGVmIGltYWdlLlxuICogVGhlIGNsZWYgY2FuIGJlIGVpdGhlciBub3JtYWwgb3Igc21hbGwgc2l6ZS4gIE5vcm1hbCBzaXplIGlzXG4gKiB1c2VkIGF0IHRoZSBiZWdpbm5pbmcgb2YgYSBuZXcgc3RhZmYsIG9uIHRoZSBsZWZ0IHNpZGUuICBUaGVcbiAqIHNtYWxsIHN5bWJvbHMgYXJlIHVzZWQgdG8gc2hvdyBjbGVmIGNoYW5nZXMgd2l0aGluIGEgc3RhZmYuXG4gKi9cblxucHVibGljIGNsYXNzIENsZWZTeW1ib2wgOiBNdXNpY1N5bWJvbCB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgSW1hZ2UgdHJlYmxlOyAgLyoqIFRoZSB0cmVibGUgY2xlZiBpbWFnZSAqL1xuICAgIHByaXZhdGUgc3RhdGljIEltYWdlIGJhc3M7ICAgIC8qKiBUaGUgYmFzcyBjbGVmIGltYWdlICovXG5cbiAgICBwcml2YXRlIGludCBzdGFydHRpbWU7ICAgICAgICAvKiogU3RhcnQgdGltZSBvZiB0aGUgc3ltYm9sICovXG4gICAgcHJpdmF0ZSBib29sIHNtYWxsc2l6ZTsgICAgICAgLyoqIFRydWUgaWYgdGhpcyBpcyBhIHNtYWxsIGNsZWYsIGZhbHNlIG90aGVyd2lzZSAqL1xuICAgIHByaXZhdGUgQ2xlZiBjbGVmOyAgICAgICAgICAgIC8qKiBUaGUgY2xlZiwgVHJlYmxlIG9yIEJhc3MgKi9cbiAgICBwcml2YXRlIGludCB3aWR0aDtcblxuICAgIC8qKiBDcmVhdGUgYSBuZXcgQ2xlZlN5bWJvbCwgd2l0aCB0aGUgZ2l2ZW4gY2xlZiwgc3RhcnR0aW1lLCBhbmQgc2l6ZSAqL1xuICAgIHB1YmxpYyBDbGVmU3ltYm9sKENsZWYgY2xlZiwgaW50IHN0YXJ0dGltZSwgYm9vbCBzbWFsbCkge1xuICAgICAgICB0aGlzLmNsZWYgPSBjbGVmO1xuICAgICAgICB0aGlzLnN0YXJ0dGltZSA9IHN0YXJ0dGltZTtcbiAgICAgICAgc21hbGxzaXplID0gc21hbGw7XG4gICAgICAgIExvYWRJbWFnZXMoKTtcbiAgICAgICAgd2lkdGggPSBNaW5XaWR0aDtcbiAgICB9XG5cbiAgICAvKiogTG9hZCB0aGUgVHJlYmxlL0Jhc3MgY2xlZiBpbWFnZXMgaW50byBtZW1vcnkuICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBMb2FkSW1hZ2VzKCkge1xuICAgICAgICBpZiAodHJlYmxlID09IG51bGwpXG4gICAgICAgICAgICB0cmVibGUgPSBuZXcgQml0bWFwKHR5cGVvZihDbGVmU3ltYm9sKSwgXCJSZXNvdXJjZXMuSW1hZ2VzLnRyZWJsZS5wbmdcIik7XG5cbiAgICAgICAgaWYgKGJhc3MgPT0gbnVsbClcbiAgICAgICAgICAgIGJhc3MgPSBuZXcgQml0bWFwKHR5cGVvZihDbGVmU3ltYm9sKSwgXCJSZXNvdXJjZXMuSW1hZ2VzLmJhc3MucG5nXCIpO1xuXG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgdGltZSAoaW4gcHVsc2VzKSB0aGlzIHN5bWJvbCBvY2N1cnMgYXQuXG4gICAgICogVGhpcyBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgbWVhc3VyZSB0aGlzIHN5bWJvbCBiZWxvbmdzIHRvLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgU3RhcnRUaW1lIHsgXG4gICAgICAgIGdldCB7IHJldHVybiBzdGFydHRpbWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBtaW5pbXVtIHdpZHRoIChpbiBwaXhlbHMpIG5lZWRlZCB0byBkcmF3IHRoaXMgc3ltYm9sICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBNaW5XaWR0aCB7XG4gICAgICAgIGdldCB7IFxuICAgICAgICAgICAgaWYgKHNtYWxsc2l6ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gU2hlZXRNdXNpYy5Ob3RlV2lkdGggKiAyO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiBTaGVldE11c2ljLk5vdGVXaWR0aCAqIDM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogR2V0L1NldCB0aGUgd2lkdGggKGluIHBpeGVscykgb2YgdGhpcyBzeW1ib2wuIFRoZSB3aWR0aCBpcyBzZXRcbiAgICAgKiBpbiBTaGVldE11c2ljLkFsaWduU3ltYm9scygpIHRvIHZlcnRpY2FsbHkgYWxpZ24gc3ltYm9scy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFdpZHRoIHtcbiAgICAgICBnZXQgeyByZXR1cm4gd2lkdGg7IH1cbiAgICAgICBzZXQgeyB3aWR0aCA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGFib3ZlIHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEFib3ZlU3RhZmYgeyBcbiAgICAgICAgZ2V0IHsgXG4gICAgICAgICAgICBpZiAoY2xlZiA9PSBDbGVmLlRyZWJsZSAmJiAhc21hbGxzaXplKVxuICAgICAgICAgICAgICAgIHJldHVybiBTaGVldE11c2ljLk5vdGVIZWlnaHQgKiAyO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGJlbG93IHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEJlbG93U3RhZmYge1xuICAgICAgICBnZXQge1xuICAgICAgICAgICAgaWYgKGNsZWYgPT0gQ2xlZi5UcmVibGUgJiYgIXNtYWxsc2l6ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMjtcbiAgICAgICAgICAgIGVsc2UgaWYgKGNsZWYgPT0gQ2xlZi5UcmVibGUgJiYgc21hbGxzaXplKVxuICAgICAgICAgICAgICAgIHJldHVybiBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgc3ltYm9sLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBcbiAgICB2b2lkIERyYXcoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3ApIHtcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oV2lkdGggLSBNaW5XaWR0aCwgMCk7XG4gICAgICAgIGludCB5ID0geXRvcDtcbiAgICAgICAgSW1hZ2UgaW1hZ2U7XG4gICAgICAgIGludCBoZWlnaHQ7XG5cbiAgICAgICAgLyogR2V0IHRoZSBpbWFnZSwgaGVpZ2h0LCBhbmQgdG9wIHkgcGl4ZWwsIGRlcGVuZGluZyBvbiB0aGUgY2xlZlxuICAgICAgICAgKiBhbmQgdGhlIGltYWdlIHNpemUuXG4gICAgICAgICAqL1xuICAgICAgICBpZiAoY2xlZiA9PSBDbGVmLlRyZWJsZSkge1xuICAgICAgICAgICAgaW1hZ2UgPSB0cmVibGU7XG4gICAgICAgICAgICBpZiAoc21hbGxzaXplKSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gU2hlZXRNdXNpYy5TdGFmZkhlaWdodCArIFNoZWV0TXVzaWMuU3RhZmZIZWlnaHQvNDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gMyAqIFNoZWV0TXVzaWMuU3RhZmZIZWlnaHQvMiArIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICAgICAgICAgIHkgPSB5dG9wIC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaW1hZ2UgPSBiYXNzO1xuICAgICAgICAgICAgaWYgKHNtYWxsc2l6ZSkge1xuICAgICAgICAgICAgICAgIGhlaWdodCA9IFNoZWV0TXVzaWMuU3RhZmZIZWlnaHQgLSAzKlNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBTaGVldE11c2ljLlN0YWZmSGVpZ2h0IC0gU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyogU2NhbGUgdGhlIGltYWdlIHdpZHRoIHRvIG1hdGNoIHRoZSBoZWlnaHQgKi9cbiAgICAgICAgaW50IGltZ3dpZHRoID0gaW1hZ2UuV2lkdGggKiBoZWlnaHQgLyBpbWFnZS5IZWlnaHQ7XG4gICAgICAgIGcuRHJhd0ltYWdlKGltYWdlLCAwLCB5LCBpbWd3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShXaWR0aCAtIE1pbldpZHRoKSwgMCk7XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJDbGVmU3ltYm9sIGNsZWY9ezB9IHNtYWxsPXsxfSB3aWR0aD17Mn1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlZiwgc21hbGxzaXplLCB3aWR0aCk7XG4gICAgfVxufVxuXG5cbn1cblxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEZpbGVTdHJlYW06U3RyZWFtXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIEZpbGVTdHJlYW0oc3RyaW5nIGZpbGVuYW1lLCBGaWxlTW9kZSBtb2RlKVxyXG4gICAgICAgIHtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwOS0yMDEyIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG5cbi8qKiBAY2xhc3MgUGlhbm9cbiAqXG4gKiBUaGUgUGlhbm8gQ29udHJvbCBpcyB0aGUgcGFuZWwgYXQgdGhlIHRvcCB0aGF0IGRpc3BsYXlzIHRoZVxuICogcGlhbm8sIGFuZCBoaWdobGlnaHRzIHRoZSBwaWFubyBub3RlcyBkdXJpbmcgcGxheWJhY2suXG4gKiBUaGUgbWFpbiBtZXRob2RzIGFyZTpcbiAqXG4gKiBTZXRNaWRpRmlsZSgpIC0gU2V0IHRoZSBNaWRpIGZpbGUgdG8gdXNlIGZvciBzaGFkaW5nLiAgVGhlIE1pZGkgZmlsZVxuICogICAgICAgICAgICAgICAgIGlzIG5lZWRlZCB0byBkZXRlcm1pbmUgd2hpY2ggbm90ZXMgdG8gc2hhZGUuXG4gKlxuICogU2hhZGVOb3RlcygpIC0gU2hhZGUgbm90ZXMgb24gdGhlIHBpYW5vIHRoYXQgb2NjdXIgYXQgYSBnaXZlbiBwdWxzZSB0aW1lLlxuICpcbiAqL1xucHVibGljIGNsYXNzIFBpYW5vIDogQ29udHJvbCB7XG4gICAgcHVibGljIGNvbnN0IGludCBLZXlzUGVyT2N0YXZlID0gNztcbiAgICBwdWJsaWMgY29uc3QgaW50IE1heE9jdGF2ZSA9IDc7XG5cbiAgICBwcml2YXRlIHN0YXRpYyBpbnQgV2hpdGVLZXlXaWR0aDsgIC8qKiBXaWR0aCBvZiBhIHNpbmdsZSB3aGl0ZSBrZXkgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBpbnQgV2hpdGVLZXlIZWlnaHQ7IC8qKiBIZWlnaHQgb2YgYSBzaW5nbGUgd2hpdGUga2V5ICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50IEJsYWNrS2V5V2lkdGg7ICAvKiogV2lkdGggb2YgYSBzaW5nbGUgYmxhY2sga2V5ICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50IEJsYWNrS2V5SGVpZ2h0OyAvKiogSGVpZ2h0IG9mIGEgc2luZ2xlIGJsYWNrIGtleSAqL1xuICAgIHByaXZhdGUgc3RhdGljIGludCBtYXJnaW47ICAgICAgICAgLyoqIFRoZSB0b3AvbGVmdCBtYXJnaW4gdG8gdGhlIHBpYW5vICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50IEJsYWNrQm9yZGVyOyAgICAvKiogVGhlIHdpZHRoIG9mIHRoZSBibGFjayBib3JkZXIgYXJvdW5kIHRoZSBrZXlzICovXG5cbiAgICBwcml2YXRlIHN0YXRpYyBpbnRbXSBibGFja0tleU9mZnNldHM7ICAgLyoqIFRoZSB4IHBpeGxlcyBvZiB0aGUgYmxhY2sga2V5cyAqL1xuXG4gICAgLyogVGhlIGdyYXkxUGVucyBmb3IgZHJhd2luZyBibGFjay9ncmF5IGxpbmVzICovXG4gICAgcHJpdmF0ZSBQZW4gZ3JheTFQZW4sIGdyYXkyUGVuLCBncmF5M1BlbjtcblxuICAgIC8qIFRoZSBicnVzaGVzIGZvciBmaWxsaW5nIHRoZSBrZXlzICovXG4gICAgcHJpdmF0ZSBCcnVzaCBncmF5MUJydXNoLCBncmF5MkJydXNoLCBzaGFkZUJydXNoLCBzaGFkZTJCcnVzaDtcblxuICAgIHByaXZhdGUgYm9vbCB1c2VUd29Db2xvcnM7ICAgICAgICAgICAgICAvKiogSWYgdHJ1ZSwgdXNlIHR3byBjb2xvcnMgZm9yIGhpZ2hsaWdodGluZyAqL1xuICAgIHByaXZhdGUgTGlzdDxNaWRpTm90ZT4gbm90ZXM7ICAgICAgICAgICAvKiogVGhlIE1pZGkgbm90ZXMgZm9yIHNoYWRpbmcgKi9cbiAgICBwcml2YXRlIGludCBtYXhTaGFkZUR1cmF0aW9uOyAgICAgICAgICAgLyoqIFRoZSBtYXhpbXVtIGR1cmF0aW9uIHdlJ2xsIHNoYWRlIGEgbm90ZSBmb3IgKi9cbiAgICBwcml2YXRlIGludCBzaG93Tm90ZUxldHRlcnM7ICAgICAgICAgICAgLyoqIERpc3BsYXkgdGhlIGxldHRlciBmb3IgZWFjaCBwaWFubyBub3RlICovXG4gICAgcHJpdmF0ZSBHcmFwaGljcyBncmFwaGljczsgICAgICAgICAgICAgIC8qKiBUaGUgZ3JhcGhpY3MgZm9yIHNoYWRpbmcgdGhlIG5vdGVzICovXG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IFBpYW5vLiAqL1xuICAgIHB1YmxpYyBQaWFubygpIHtcclxuICAgICAgICBpbnQgc2NyZWVud2lkdGggPSAxMDI0OyAvL1N5c3RlbS5XaW5kb3dzLkZvcm1zLlNjcmVlbi5QcmltYXJ5U2NyZWVuLkJvdW5kcy5XaWR0aDtcbiAgICAgICAgaWYgKHNjcmVlbndpZHRoID49IDMyMDApIHtcbiAgICAgICAgICAgIC8qIExpbnV4L01vbm8gaXMgcmVwb3J0aW5nIHdpZHRoIG9mIDQgc2NyZWVucyAqL1xuICAgICAgICAgICAgc2NyZWVud2lkdGggPSBzY3JlZW53aWR0aCAvIDQ7XG4gICAgICAgIH1cbiAgICAgICAgc2NyZWVud2lkdGggPSBzY3JlZW53aWR0aCAqIDk1LzEwMDtcbiAgICAgICAgV2hpdGVLZXlXaWR0aCA9IChpbnQpKHNjcmVlbndpZHRoIC8gKDIuMCArIEtleXNQZXJPY3RhdmUgKiBNYXhPY3RhdmUpKTtcbiAgICAgICAgaWYgKFdoaXRlS2V5V2lkdGggJSAyICE9IDApIHtcbiAgICAgICAgICAgIFdoaXRlS2V5V2lkdGgtLTtcbiAgICAgICAgfVxuICAgICAgICBtYXJnaW4gPSAwO1xuICAgICAgICBCbGFja0JvcmRlciA9IFdoaXRlS2V5V2lkdGgvMjtcbiAgICAgICAgV2hpdGVLZXlIZWlnaHQgPSBXaGl0ZUtleVdpZHRoICogNTtcbiAgICAgICAgQmxhY2tLZXlXaWR0aCA9IFdoaXRlS2V5V2lkdGggLyAyO1xuICAgICAgICBCbGFja0tleUhlaWdodCA9IFdoaXRlS2V5SGVpZ2h0ICogNSAvIDk7IFxuXG4gICAgICAgIFdpZHRoID0gbWFyZ2luKjIgKyBCbGFja0JvcmRlcioyICsgV2hpdGVLZXlXaWR0aCAqIEtleXNQZXJPY3RhdmUgKiBNYXhPY3RhdmU7XG4gICAgICAgIEhlaWdodCA9IG1hcmdpbioyICsgQmxhY2tCb3JkZXIqMyArIFdoaXRlS2V5SGVpZ2h0O1xuICAgICAgICBpZiAoYmxhY2tLZXlPZmZzZXRzID09IG51bGwpIHtcbiAgICAgICAgICAgIGJsYWNrS2V5T2Zmc2V0cyA9IG5ldyBpbnRbXSB7IFxuICAgICAgICAgICAgICAgIFdoaXRlS2V5V2lkdGggLSBCbGFja0tleVdpZHRoLzIgLSAxLFxuICAgICAgICAgICAgICAgIFdoaXRlS2V5V2lkdGggKyBCbGFja0tleVdpZHRoLzIgLSAxLFxuICAgICAgICAgICAgICAgIDIqV2hpdGVLZXlXaWR0aCAtIEJsYWNrS2V5V2lkdGgvMixcbiAgICAgICAgICAgICAgICAyKldoaXRlS2V5V2lkdGggKyBCbGFja0tleVdpZHRoLzIsXG4gICAgICAgICAgICAgICAgNCpXaGl0ZUtleVdpZHRoIC0gQmxhY2tLZXlXaWR0aC8yIC0gMSxcbiAgICAgICAgICAgICAgICA0KldoaXRlS2V5V2lkdGggKyBCbGFja0tleVdpZHRoLzIgLSAxLFxuICAgICAgICAgICAgICAgIDUqV2hpdGVLZXlXaWR0aCAtIEJsYWNrS2V5V2lkdGgvMixcbiAgICAgICAgICAgICAgICA1KldoaXRlS2V5V2lkdGggKyBCbGFja0tleVdpZHRoLzIsXG4gICAgICAgICAgICAgICAgNipXaGl0ZUtleVdpZHRoIC0gQmxhY2tLZXlXaWR0aC8yLFxuICAgICAgICAgICAgICAgIDYqV2hpdGVLZXlXaWR0aCArIEJsYWNrS2V5V2lkdGgvMlxuICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIENvbG9yIGdyYXkxID0gQ29sb3IuRnJvbUFyZ2IoMTYsIDE2LCAxNik7XG4gICAgICAgIENvbG9yIGdyYXkyID0gQ29sb3IuRnJvbUFyZ2IoOTAsIDkwLCA5MCk7XG4gICAgICAgIENvbG9yIGdyYXkzID0gQ29sb3IuRnJvbUFyZ2IoMjAwLCAyMDAsIDIwMCk7XG4gICAgICAgIENvbG9yIHNoYWRlMSA9IENvbG9yLkZyb21BcmdiKDIxMCwgMjA1LCAyMjApO1xuICAgICAgICBDb2xvciBzaGFkZTIgPSBDb2xvci5Gcm9tQXJnYigxNTAsIDIwMCwgMjIwKTtcblxuICAgICAgICBncmF5MVBlbiA9IG5ldyBQZW4oZ3JheTEsIDEpO1xuICAgICAgICBncmF5MlBlbiA9IG5ldyBQZW4oZ3JheTIsIDEpO1xuICAgICAgICBncmF5M1BlbiA9IG5ldyBQZW4oZ3JheTMsIDEpO1xuXG4gICAgICAgIGdyYXkxQnJ1c2ggPSBuZXcgU29saWRCcnVzaChncmF5MSk7XG4gICAgICAgIGdyYXkyQnJ1c2ggPSBuZXcgU29saWRCcnVzaChncmF5Mik7XG4gICAgICAgIHNoYWRlQnJ1c2ggPSBuZXcgU29saWRCcnVzaChzaGFkZTEpO1xuICAgICAgICBzaGFkZTJCcnVzaCA9IG5ldyBTb2xpZEJydXNoKHNoYWRlMik7XG4gICAgICAgIHNob3dOb3RlTGV0dGVycyA9IE1pZGlPcHRpb25zLk5vdGVOYW1lTm9uZTtcbiAgICAgICAgQmFja0NvbG9yID0gQ29sb3IuTGlnaHRHcmF5O1xuICAgIH1cblxuICAgIC8qKiBTZXQgdGhlIE1pZGlGaWxlIHRvIHVzZS5cbiAgICAgKiAgU2F2ZSB0aGUgbGlzdCBvZiBtaWRpIG5vdGVzLiBFYWNoIG1pZGkgbm90ZSBpbmNsdWRlcyB0aGUgbm90ZSBOdW1iZXIgXG4gICAgICogIGFuZCBTdGFydFRpbWUgKGluIHB1bHNlcyksIHNvIHdlIGtub3cgd2hpY2ggbm90ZXMgdG8gc2hhZGUgZ2l2ZW4gdGhlXG4gICAgICogIGN1cnJlbnQgcHVsc2UgdGltZS5cbiAgICAgKi8gXG4gICAgcHVibGljIHZvaWQgU2V0TWlkaUZpbGUoTWlkaUZpbGUgbWlkaWZpbGUsIE1pZGlPcHRpb25zIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKG1pZGlmaWxlID09IG51bGwpIHtcbiAgICAgICAgICAgIG5vdGVzID0gbnVsbDtcbiAgICAgICAgICAgIHVzZVR3b0NvbG9ycyA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgTGlzdDxNaWRpVHJhY2s+IHRyYWNrcyA9IG1pZGlmaWxlLkNoYW5nZU1pZGlOb3RlcyhvcHRpb25zKTtcbiAgICAgICAgTWlkaVRyYWNrIHRyYWNrID0gTWlkaUZpbGUuQ29tYmluZVRvU2luZ2xlVHJhY2sodHJhY2tzKTtcbiAgICAgICAgbm90ZXMgPSB0cmFjay5Ob3RlcztcblxuICAgICAgICBtYXhTaGFkZUR1cmF0aW9uID0gbWlkaWZpbGUuVGltZS5RdWFydGVyICogMjtcblxuICAgICAgICAvKiBXZSB3YW50IHRvIGtub3cgd2hpY2ggdHJhY2sgdGhlIG5vdGUgY2FtZSBmcm9tLlxuICAgICAgICAgKiBVc2UgdGhlICdjaGFubmVsJyBmaWVsZCB0byBzdG9yZSB0aGUgdHJhY2suXG4gICAgICAgICAqL1xuICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgdHJhY2tzLkNvdW50OyB0cmFja251bSsrKSB7XG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrc1t0cmFja251bV0uTm90ZXMpIHtcbiAgICAgICAgICAgICAgICBub3RlLkNoYW5uZWwgPSB0cmFja251bTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFdoZW4gd2UgaGF2ZSBleGFjdGx5IHR3byB0cmFja3MsIHdlIGFzc3VtZSB0aGlzIGlzIGEgcGlhbm8gc29uZyxcbiAgICAgICAgICogYW5kIHdlIHVzZSBkaWZmZXJlbnQgY29sb3JzIGZvciBoaWdobGlnaHRpbmcgdGhlIGxlZnQgaGFuZCBhbmRcbiAgICAgICAgICogcmlnaHQgaGFuZCBub3Rlcy5cbiAgICAgICAgICovXG4gICAgICAgIHVzZVR3b0NvbG9ycyA9IGZhbHNlO1xuICAgICAgICBpZiAodHJhY2tzLkNvdW50ID09IDIpIHtcbiAgICAgICAgICAgIHVzZVR3b0NvbG9ycyA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBzaG93Tm90ZUxldHRlcnMgPSBvcHRpb25zLnNob3dOb3RlTGV0dGVycztcbiAgICAgICAgdGhpcy5JbnZhbGlkYXRlKCk7XG4gICAgfVxuXG4gICAgLyoqIFNldCB0aGUgY29sb3JzIHRvIHVzZSBmb3Igc2hhZGluZyAqL1xuICAgIHB1YmxpYyB2b2lkIFNldFNoYWRlQ29sb3JzKENvbG9yIGMxLCBDb2xvciBjMikge1xuICAgICAgICBzaGFkZUJydXNoLkRpc3Bvc2UoKTtcbiAgICAgICAgc2hhZGUyQnJ1c2guRGlzcG9zZSgpO1xuICAgICAgICBzaGFkZUJydXNoID0gbmV3IFNvbGlkQnJ1c2goYzEpO1xuICAgICAgICBzaGFkZTJCcnVzaCA9IG5ldyBTb2xpZEJydXNoKGMyKTtcbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgb3V0bGluZSBvZiBhIDEyLW5vdGUgKDcgd2hpdGUgbm90ZSkgcGlhbm8gb2N0YXZlICovXG4gICAgcHJpdmF0ZSB2b2lkIERyYXdPY3RhdmVPdXRsaW5lKEdyYXBoaWNzIGcpIHtcbiAgICAgICAgaW50IHJpZ2h0ID0gV2hpdGVLZXlXaWR0aCAqIEtleXNQZXJPY3RhdmU7XG5cbiAgICAgICAgLy8gRHJhdyB0aGUgYm91bmRpbmcgcmVjdGFuZ2xlLCBmcm9tIEMgdG8gQlxuICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCAwLCAwLCAwLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTFQZW4sIHJpZ2h0LCAwLCByaWdodCwgV2hpdGVLZXlIZWlnaHQpO1xuICAgICAgICAvLyBnLkRyYXdMaW5lKGdyYXkxUGVuLCAwLCAwLCByaWdodCwgMCk7XG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTFQZW4sIDAsIFdoaXRlS2V5SGVpZ2h0LCByaWdodCwgV2hpdGVLZXlIZWlnaHQpO1xuICAgICAgICBnLkRyYXdMaW5lKGdyYXkzUGVuLCByaWdodC0xLCAwLCByaWdodC0xLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIDEsIDAsIDEsIFdoaXRlS2V5SGVpZ2h0KTtcblxuICAgICAgICAvLyBEcmF3IHRoZSBsaW5lIGJldHdlZW4gRSBhbmQgRlxuICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCAzKldoaXRlS2V5V2lkdGgsIDAsIDMqV2hpdGVLZXlXaWR0aCwgV2hpdGVLZXlIZWlnaHQpO1xuICAgICAgICBnLkRyYXdMaW5lKGdyYXkzUGVuLCAzKldoaXRlS2V5V2lkdGggLSAxLCAwLCAzKldoaXRlS2V5V2lkdGggLSAxLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIDMqV2hpdGVLZXlXaWR0aCArIDEsIDAsIDMqV2hpdGVLZXlXaWR0aCArIDEsIFdoaXRlS2V5SGVpZ2h0KTtcblxuICAgICAgICAvLyBEcmF3IHRoZSBzaWRlcy9ib3R0b20gb2YgdGhlIGJsYWNrIGtleXNcbiAgICAgICAgZm9yIChpbnQgaSA9MDsgaSA8IDEwOyBpICs9IDIpIHtcbiAgICAgICAgICAgIGludCB4MSA9IGJsYWNrS2V5T2Zmc2V0c1tpXTtcbiAgICAgICAgICAgIGludCB4MiA9IGJsYWNrS2V5T2Zmc2V0c1tpKzFdO1xuXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCB4MSwgMCwgeDEsIEJsYWNrS2V5SGVpZ2h0KTsgXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCB4MiwgMCwgeDIsIEJsYWNrS2V5SGVpZ2h0KTsgXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCB4MSwgQmxhY2tLZXlIZWlnaHQsIHgyLCBCbGFja0tleUhlaWdodCk7XG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkyUGVuLCB4MS0xLCAwLCB4MS0xLCBCbGFja0tleUhlaWdodCsxKTsgXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkyUGVuLCB4MisxLCAwLCB4MisxLCBCbGFja0tleUhlaWdodCsxKTsgXG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkyUGVuLCB4MS0xLCBCbGFja0tleUhlaWdodCsxLCB4MisxLCBCbGFja0tleUhlaWdodCsxKTtcbiAgICAgICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIHgxLTIsIDAsIHgxLTIsIEJsYWNrS2V5SGVpZ2h0KzIpOyBcbiAgICAgICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIHgyKzIsIDAsIHgyKzIsIEJsYWNrS2V5SGVpZ2h0KzIpOyBcbiAgICAgICAgICAgIGcuRHJhd0xpbmUoZ3JheTNQZW4sIHgxLTIsIEJsYWNrS2V5SGVpZ2h0KzIsIHgyKzIsIEJsYWNrS2V5SGVpZ2h0KzIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRHJhdyB0aGUgYm90dG9tLWhhbGYgb2YgdGhlIHdoaXRlIGtleXNcbiAgICAgICAgZm9yIChpbnQgaSA9IDE7IGkgPCBLZXlzUGVyT2N0YXZlOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpID09IDMpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTsgIC8vIHdlIGRyYXcgdGhlIGxpbmUgYmV0d2VlbiBFIGFuZCBGIGFib3ZlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnLkRyYXdMaW5lKGdyYXkxUGVuLCBpKldoaXRlS2V5V2lkdGgsIEJsYWNrS2V5SGVpZ2h0LCBpKldoaXRlS2V5V2lkdGgsIFdoaXRlS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgIFBlbiBwZW4xID0gZ3JheTJQZW47XG4gICAgICAgICAgICBQZW4gcGVuMiA9IGdyYXkzUGVuO1xuICAgICAgICAgICAgZy5EcmF3TGluZShwZW4xLCBpKldoaXRlS2V5V2lkdGggLSAxLCBCbGFja0tleUhlaWdodCsxLCBpKldoaXRlS2V5V2lkdGggLSAxLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgICAgICBnLkRyYXdMaW5lKHBlbjIsIGkqV2hpdGVLZXlXaWR0aCArIDEsIEJsYWNrS2V5SGVpZ2h0KzEsIGkqV2hpdGVLZXlXaWR0aCArIDEsIFdoaXRlS2V5SGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqIERyYXcgYW4gb3V0bGluZSBvZiB0aGUgcGlhbm8gZm9yIDcgb2N0YXZlcyAqL1xuICAgIHByaXZhdGUgdm9pZCBEcmF3T3V0bGluZShHcmFwaGljcyBnKSB7XG4gICAgICAgIGZvciAoaW50IG9jdGF2ZSA9IDA7IG9jdGF2ZSA8IE1heE9jdGF2ZTsgb2N0YXZlKyspIHtcbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKG9jdGF2ZSAqIFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlLCAwKTtcbiAgICAgICAgICAgIERyYXdPY3RhdmVPdXRsaW5lKGcpO1xuICAgICAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShvY3RhdmUgKiBXaGl0ZUtleVdpZHRoICogS2V5c1Blck9jdGF2ZSksIDApO1xuICAgICAgICB9XG4gICAgfVxuIFxuICAgIC8qIERyYXcgdGhlIEJsYWNrIGtleXMgKi9cbiAgICBwcml2YXRlIHZvaWQgRHJhd0JsYWNrS2V5cyhHcmFwaGljcyBnKSB7XG4gICAgICAgIGZvciAoaW50IG9jdGF2ZSA9IDA7IG9jdGF2ZSA8IE1heE9jdGF2ZTsgb2N0YXZlKyspIHtcbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKG9jdGF2ZSAqIFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlLCAwKTtcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgMTA7IGkgKz0gMikge1xuICAgICAgICAgICAgICAgIGludCB4MSA9IGJsYWNrS2V5T2Zmc2V0c1tpXTtcbiAgICAgICAgICAgICAgICBpbnQgeDIgPSBibGFja0tleU9mZnNldHNbaSsxXTtcbiAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTFCcnVzaCwgeDEsIDAsIEJsYWNrS2V5V2lkdGgsIEJsYWNrS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTJCcnVzaCwgeDErMSwgQmxhY2tLZXlIZWlnaHQgLSBCbGFja0tleUhlaWdodC84LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmxhY2tLZXlXaWR0aC0yLCBCbGFja0tleUhlaWdodC84KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0ob2N0YXZlICogV2hpdGVLZXlXaWR0aCAqIEtleXNQZXJPY3RhdmUpLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qIERyYXcgdGhlIGJsYWNrIGJvcmRlciBhcmVhIHN1cnJvdW5kaW5nIHRoZSBwaWFubyBrZXlzLlxuICAgICAqIEFsc28sIGRyYXcgZ3JheSBvdXRsaW5lcyBhdCB0aGUgYm90dG9tIG9mIHRoZSB3aGl0ZSBrZXlzLlxuICAgICAqL1xuICAgIHByaXZhdGUgdm9pZCBEcmF3QmxhY2tCb3JkZXIoR3JhcGhpY3MgZykge1xuICAgICAgICBpbnQgUGlhbm9XaWR0aCA9IFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlICogTWF4T2N0YXZlO1xuICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTFCcnVzaCwgbWFyZ2luLCBtYXJnaW4sIFBpYW5vV2lkdGggKyBCbGFja0JvcmRlcioyLCBCbGFja0JvcmRlci0yKTtcbiAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkxQnJ1c2gsIG1hcmdpbiwgbWFyZ2luLCBCbGFja0JvcmRlciwgV2hpdGVLZXlIZWlnaHQgKyBCbGFja0JvcmRlciAqIDMpO1xuICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTFCcnVzaCwgbWFyZ2luLCBtYXJnaW4gKyBCbGFja0JvcmRlciArIFdoaXRlS2V5SGVpZ2h0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrQm9yZGVyKjIgKyBQaWFub1dpZHRoLCBCbGFja0JvcmRlcioyKTtcbiAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkxQnJ1c2gsIG1hcmdpbiArIEJsYWNrQm9yZGVyICsgUGlhbm9XaWR0aCwgbWFyZ2luLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrQm9yZGVyLCBXaGl0ZUtleUhlaWdodCArIEJsYWNrQm9yZGVyKjMpO1xuXG4gICAgICAgIGcuRHJhd0xpbmUoZ3JheTJQZW4sIG1hcmdpbiArIEJsYWNrQm9yZGVyLCBtYXJnaW4gKyBCbGFja0JvcmRlciAtMSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbiArIEJsYWNrQm9yZGVyICsgUGlhbm9XaWR0aCwgbWFyZ2luICsgQmxhY2tCb3JkZXIgLTEpO1xuICAgICAgICBcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0obWFyZ2luICsgQmxhY2tCb3JkZXIsIG1hcmdpbiArIEJsYWNrQm9yZGVyKTsgXG5cbiAgICAgICAgLy8gRHJhdyB0aGUgZ3JheSBib3R0b21zIG9mIHRoZSB3aGl0ZSBrZXlzICBcbiAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBLZXlzUGVyT2N0YXZlICogTWF4T2N0YXZlOyBpKyspIHtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShncmF5MkJydXNoLCBpKldoaXRlS2V5V2lkdGgrMSwgV2hpdGVLZXlIZWlnaHQrMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgV2hpdGVLZXlXaWR0aC0yLCBCbGFja0JvcmRlci8yKTtcbiAgICAgICAgfVxuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKG1hcmdpbiArIEJsYWNrQm9yZGVyKSwgLShtYXJnaW4gKyBCbGFja0JvcmRlcikpOyBcbiAgICB9XG5cbiAgICAvKiogRHJhdyB0aGUgbm90ZSBsZXR0ZXJzIHVuZGVybmVhdGggZWFjaCB3aGl0ZSBub3RlICovXG4gICAgcHJpdmF0ZSB2b2lkIERyYXdOb3RlTGV0dGVycyhHcmFwaGljcyBnKSB7XG4gICAgICAgIHN0cmluZ1tdIGxldHRlcnMgPSB7IFwiQ1wiLCBcIkRcIiwgXCJFXCIsIFwiRlwiLCBcIkdcIiwgXCJBXCIsIFwiQlwiIH07XG4gICAgICAgIHN0cmluZ1tdIG51bWJlcnMgPSB7IFwiMVwiLCBcIjNcIiwgXCI1XCIsIFwiNlwiLCBcIjhcIiwgXCIxMFwiLCBcIjEyXCIgfTtcbiAgICAgICAgc3RyaW5nW10gbmFtZXM7XG4gICAgICAgIGlmIChzaG93Tm90ZUxldHRlcnMgPT0gTWlkaU9wdGlvbnMuTm90ZU5hbWVMZXR0ZXIpIHtcbiAgICAgICAgICAgIG5hbWVzID0gbGV0dGVycztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzaG93Tm90ZUxldHRlcnMgPT0gTWlkaU9wdGlvbnMuTm90ZU5hbWVGaXhlZE51bWJlcikge1xuICAgICAgICAgICAgbmFtZXMgPSBudW1iZXJzO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKG1hcmdpbiArIEJsYWNrQm9yZGVyLCBtYXJnaW4gKyBCbGFja0JvcmRlcik7IFxuICAgICAgICBmb3IgKGludCBvY3RhdmUgPSAwOyBvY3RhdmUgPCBNYXhPY3RhdmU7IG9jdGF2ZSsrKSB7XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IEtleXNQZXJPY3RhdmU7IGkrKykge1xuICAgICAgICAgICAgICAgIGcuRHJhd1N0cmluZyhuYW1lc1tpXSwgU2hlZXRNdXNpYy5MZXR0ZXJGb250LCBCcnVzaGVzLldoaXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAob2N0YXZlKktleXNQZXJPY3RhdmUgKyBpKSAqIFdoaXRlS2V5V2lkdGggKyBXaGl0ZUtleVdpZHRoLzMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFdoaXRlS2V5SGVpZ2h0ICsgQmxhY2tCb3JkZXIgKiAzLzQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0obWFyZ2luICsgQmxhY2tCb3JkZXIpLCAtKG1hcmdpbiArIEJsYWNrQm9yZGVyKSk7IFxuICAgIH1cblxuICAgIC8qKiBEcmF3IHRoZSBQaWFuby4gKi9cbiAgICBwcm90ZWN0ZWQgLypvdmVycmlkZSovIHZvaWQgT25QYWludChQYWludEV2ZW50QXJncyBlKSB7XG4gICAgICAgIEdyYXBoaWNzIGcgPSBlLkdyYXBoaWNzKCk7XG4gICAgICAgIGcuU21vb3RoaW5nTW9kZSA9IFNtb290aGluZ01vZGUuTm9uZTtcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0obWFyZ2luICsgQmxhY2tCb3JkZXIsIG1hcmdpbiArIEJsYWNrQm9yZGVyKTsgXG4gICAgICAgIGcuRmlsbFJlY3RhbmdsZShCcnVzaGVzLldoaXRlLCAwLCAwLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlICogTWF4T2N0YXZlLCBXaGl0ZUtleUhlaWdodCk7XG4gICAgICAgIERyYXdCbGFja0tleXMoZyk7XG4gICAgICAgIERyYXdPdXRsaW5lKGcpO1xuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybSgtKG1hcmdpbiArIEJsYWNrQm9yZGVyKSwgLShtYXJnaW4gKyBCbGFja0JvcmRlcikpO1xuICAgICAgICBEcmF3QmxhY2tCb3JkZXIoZyk7XG4gICAgICAgIGlmIChzaG93Tm90ZUxldHRlcnMgIT0gTWlkaU9wdGlvbnMuTm90ZU5hbWVOb25lKSB7XG4gICAgICAgICAgICBEcmF3Tm90ZUxldHRlcnMoZyk7XG4gICAgICAgIH1cbiAgICAgICAgZy5TbW9vdGhpbmdNb2RlID0gU21vb3RoaW5nTW9kZS5BbnRpQWxpYXM7XG4gICAgfVxuXG4gICAgLyogU2hhZGUgdGhlIGdpdmVuIG5vdGUgd2l0aCB0aGUgZ2l2ZW4gYnJ1c2guXG4gICAgICogV2Ugb25seSBkcmF3IG5vdGVzIGZyb20gbm90ZW51bWJlciAyNCB0byA5Ni5cbiAgICAgKiAoTWlkZGxlLUMgaXMgNjApLlxuICAgICAqL1xuICAgIHByaXZhdGUgdm9pZCBTaGFkZU9uZU5vdGUoR3JhcGhpY3MgZywgaW50IG5vdGVudW1iZXIsIEJydXNoIGJydXNoKSB7XG4gICAgICAgIGludCBvY3RhdmUgPSBub3RlbnVtYmVyIC8gMTI7XG4gICAgICAgIGludCBub3Rlc2NhbGUgPSBub3RlbnVtYmVyICUgMTI7XG5cbiAgICAgICAgb2N0YXZlIC09IDI7XG4gICAgICAgIGlmIChvY3RhdmUgPCAwIHx8IG9jdGF2ZSA+PSBNYXhPY3RhdmUpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0ob2N0YXZlICogV2hpdGVLZXlXaWR0aCAqIEtleXNQZXJPY3RhdmUsIDApO1xuICAgICAgICBpbnQgeDEsIHgyLCB4MztcblxuICAgICAgICBpbnQgYm90dG9tSGFsZkhlaWdodCA9IFdoaXRlS2V5SGVpZ2h0IC0gKEJsYWNrS2V5SGVpZ2h0KzMpO1xuXG4gICAgICAgIC8qIG5vdGVzY2FsZSBnb2VzIGZyb20gMCB0byAxMSwgZnJvbSBDIHRvIEIuICovXG4gICAgICAgIHN3aXRjaCAobm90ZXNjYWxlKSB7XG4gICAgICAgIGNhc2UgMDogLyogQyAqL1xuICAgICAgICAgICAgeDEgPSAyO1xuICAgICAgICAgICAgeDIgPSBibGFja0tleU9mZnNldHNbMF0gLSAyO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgMCwgeDIgLSB4MSwgQmxhY2tLZXlIZWlnaHQrMyk7XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgxLCBCbGFja0tleUhlaWdodCszLCBXaGl0ZUtleVdpZHRoLTMsIGJvdHRvbUhhbGZIZWlnaHQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTogLyogQyMgKi9cbiAgICAgICAgICAgIHgxID0gYmxhY2tLZXlPZmZzZXRzWzBdOyBcbiAgICAgICAgICAgIHgyID0gYmxhY2tLZXlPZmZzZXRzWzFdO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgMCwgeDIgLSB4MSwgQmxhY2tLZXlIZWlnaHQpO1xuICAgICAgICAgICAgaWYgKGJydXNoID09IGdyYXkxQnJ1c2gpIHtcbiAgICAgICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoZ3JheTJCcnVzaCwgeDErMSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrS2V5SGVpZ2h0IC0gQmxhY2tLZXlIZWlnaHQvOCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJsYWNrS2V5V2lkdGgtMiwgQmxhY2tLZXlIZWlnaHQvOCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOiAvKiBEICovXG4gICAgICAgICAgICB4MSA9IFdoaXRlS2V5V2lkdGggKyAyO1xuICAgICAgICAgICAgeDIgPSBibGFja0tleU9mZnNldHNbMV0gKyAzO1xuICAgICAgICAgICAgeDMgPSBibGFja0tleU9mZnNldHNbMl0gLSAyOyBcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDIsIDAsIHgzIC0geDIsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6IC8qIEQjICovXG4gICAgICAgICAgICB4MSA9IGJsYWNrS2V5T2Zmc2V0c1syXTsgXG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1szXTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIDAsIEJsYWNrS2V5V2lkdGgsIEJsYWNrS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgIGlmIChicnVzaCA9PSBncmF5MUJydXNoKSB7XG4gICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkyQnJ1c2gsIHgxKzEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleUhlaWdodCAtIEJsYWNrS2V5SGVpZ2h0LzgsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleVdpZHRoLTIsIEJsYWNrS2V5SGVpZ2h0LzgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDogLyogRSAqL1xuICAgICAgICAgICAgeDEgPSBXaGl0ZUtleVdpZHRoICogMiArIDI7XG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1szXSArIDM7IFxuICAgICAgICAgICAgeDMgPSBXaGl0ZUtleVdpZHRoICogMyAtIDE7XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgyLCAwLCB4MyAtIHgyLCBCbGFja0tleUhlaWdodCszKTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIEJsYWNrS2V5SGVpZ2h0KzMsIFdoaXRlS2V5V2lkdGgtMywgYm90dG9tSGFsZkhlaWdodCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1OiAvKiBGICovXG4gICAgICAgICAgICB4MSA9IFdoaXRlS2V5V2lkdGggKiAzICsgMjtcbiAgICAgICAgICAgIHgyID0gYmxhY2tLZXlPZmZzZXRzWzRdIC0gMjsgXG4gICAgICAgICAgICB4MyA9IFdoaXRlS2V5V2lkdGggKiA0IC0gMjtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIDAsIHgyIC0geDEsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY6IC8qIEYjICovXG4gICAgICAgICAgICB4MSA9IGJsYWNrS2V5T2Zmc2V0c1s0XTsgXG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1s1XTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIDAsIEJsYWNrS2V5V2lkdGgsIEJsYWNrS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgIGlmIChicnVzaCA9PSBncmF5MUJydXNoKSB7XG4gICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkyQnJ1c2gsIHgxKzEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleUhlaWdodCAtIEJsYWNrS2V5SGVpZ2h0LzgsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleVdpZHRoLTIsIEJsYWNrS2V5SGVpZ2h0LzgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNzogLyogRyAqL1xuICAgICAgICAgICAgeDEgPSBXaGl0ZUtleVdpZHRoICogNCArIDI7XG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1s1XSArIDM7IFxuICAgICAgICAgICAgeDMgPSBibGFja0tleU9mZnNldHNbNl0gLSAyOyBcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDIsIDAsIHgzIC0geDIsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDg6IC8qIEcjICovXG4gICAgICAgICAgICB4MSA9IGJsYWNrS2V5T2Zmc2V0c1s2XTsgXG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1s3XTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDEsIDAsIEJsYWNrS2V5V2lkdGgsIEJsYWNrS2V5SGVpZ2h0KTtcbiAgICAgICAgICAgIGlmIChicnVzaCA9PSBncmF5MUJydXNoKSB7XG4gICAgICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGdyYXkyQnJ1c2gsIHgxKzEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleUhlaWdodCAtIEJsYWNrS2V5SGVpZ2h0LzgsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCbGFja0tleVdpZHRoLTIsIEJsYWNrS2V5SGVpZ2h0LzgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgOTogLyogQSAqL1xuICAgICAgICAgICAgeDEgPSBXaGl0ZUtleVdpZHRoICogNSArIDI7XG4gICAgICAgICAgICB4MiA9IGJsYWNrS2V5T2Zmc2V0c1s3XSArIDM7IFxuICAgICAgICAgICAgeDMgPSBibGFja0tleU9mZnNldHNbOF0gLSAyOyBcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDIsIDAsIHgzIC0geDIsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEwOiAvKiBBIyAqL1xuICAgICAgICAgICAgeDEgPSBibGFja0tleU9mZnNldHNbOF07IFxuICAgICAgICAgICAgeDIgPSBibGFja0tleU9mZnNldHNbOV07XG4gICAgICAgICAgICBnLkZpbGxSZWN0YW5nbGUoYnJ1c2gsIHgxLCAwLCBCbGFja0tleVdpZHRoLCBCbGFja0tleUhlaWdodCk7XG4gICAgICAgICAgICBpZiAoYnJ1c2ggPT0gZ3JheTFCcnVzaCkge1xuICAgICAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShncmF5MkJydXNoLCB4MSsxLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmxhY2tLZXlIZWlnaHQgLSBCbGFja0tleUhlaWdodC84LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmxhY2tLZXlXaWR0aC0yLCBCbGFja0tleUhlaWdodC84KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDExOiAvKiBCICovXG4gICAgICAgICAgICB4MSA9IFdoaXRlS2V5V2lkdGggKiA2ICsgMjtcbiAgICAgICAgICAgIHgyID0gYmxhY2tLZXlPZmZzZXRzWzldICsgMzsgXG4gICAgICAgICAgICB4MyA9IFdoaXRlS2V5V2lkdGggKiBLZXlzUGVyT2N0YXZlIC0gMTtcbiAgICAgICAgICAgIGcuRmlsbFJlY3RhbmdsZShicnVzaCwgeDIsIDAsIHgzIC0geDIsIEJsYWNrS2V5SGVpZ2h0KzMpO1xuICAgICAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKGJydXNoLCB4MSwgQmxhY2tLZXlIZWlnaHQrMywgV2hpdGVLZXlXaWR0aC0zLCBib3R0b21IYWxmSGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShvY3RhdmUgKiBXaGl0ZUtleVdpZHRoICogS2V5c1Blck9jdGF2ZSksIDApO1xuICAgIH1cblxuICAgIC8qKiBGaW5kIHRoZSBNaWRpTm90ZSB3aXRoIHRoZSBzdGFydFRpbWUgY2xvc2VzdCB0byB0aGUgZ2l2ZW4gdGltZS5cbiAgICAgKiAgUmV0dXJuIHRoZSBpbmRleCBvZiB0aGUgbm90ZS4gIFVzZSBhIGJpbmFyeSBzZWFyY2ggbWV0aG9kLlxuICAgICAqL1xuICAgIHByaXZhdGUgaW50IEZpbmRDbG9zZXN0U3RhcnRUaW1lKGludCBwdWxzZVRpbWUpIHtcbiAgICAgICAgaW50IGxlZnQgPSAwO1xuICAgICAgICBpbnQgcmlnaHQgPSBub3Rlcy5Db3VudC0xO1xuXG4gICAgICAgIHdoaWxlIChyaWdodCAtIGxlZnQgPiAxKSB7XG4gICAgICAgICAgICBpbnQgaSA9IChyaWdodCArIGxlZnQpLzI7XG4gICAgICAgICAgICBpZiAobm90ZXNbbGVmdF0uU3RhcnRUaW1lID09IHB1bHNlVGltZSlcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGVsc2UgaWYgKG5vdGVzW2ldLlN0YXJ0VGltZSA8PSBwdWxzZVRpbWUpXG4gICAgICAgICAgICAgICAgbGVmdCA9IGk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmlnaHQgPSBpO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChsZWZ0ID49IDEgJiYgKG5vdGVzW2xlZnQtMV0uU3RhcnRUaW1lID09IG5vdGVzW2xlZnRdLlN0YXJ0VGltZSkpIHtcbiAgICAgICAgICAgIGxlZnQtLTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGVmdDtcbiAgICB9XG5cbiAgICAvKiogUmV0dXJuIHRoZSBuZXh0IFN0YXJ0VGltZSB0aGF0IG9jY3VycyBhZnRlciB0aGUgTWlkaU5vdGVcbiAgICAgKiAgYXQgb2Zmc2V0IGksIHRoYXQgaXMgYWxzbyBpbiB0aGUgc2FtZSB0cmFjay9jaGFubmVsLlxuICAgICAqL1xuICAgIHByaXZhdGUgaW50IE5leHRTdGFydFRpbWVTYW1lVHJhY2soaW50IGkpIHtcbiAgICAgICAgaW50IHN0YXJ0ID0gbm90ZXNbaV0uU3RhcnRUaW1lO1xuICAgICAgICBpbnQgZW5kID0gbm90ZXNbaV0uRW5kVGltZTtcbiAgICAgICAgaW50IHRyYWNrID0gbm90ZXNbaV0uQ2hhbm5lbDtcblxuICAgICAgICB3aGlsZSAoaSA8IG5vdGVzLkNvdW50KSB7XG4gICAgICAgICAgICBpZiAobm90ZXNbaV0uQ2hhbm5lbCAhPSB0cmFjaykge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChub3Rlc1tpXS5TdGFydFRpbWUgPiBzdGFydCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBub3Rlc1tpXS5TdGFydFRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbmQgPSBNYXRoLk1heChlbmQsIG5vdGVzW2ldLkVuZFRpbWUpO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbmQ7XG4gICAgfVxuXG5cbiAgICAvKiogUmV0dXJuIHRoZSBuZXh0IFN0YXJ0VGltZSB0aGF0IG9jY3VycyBhZnRlciB0aGUgTWlkaU5vdGVcbiAgICAgKiAgYXQgb2Zmc2V0IGkuICBJZiBhbGwgdGhlIHN1YnNlcXVlbnQgbm90ZXMgaGF2ZSB0aGUgc2FtZVxuICAgICAqICBTdGFydFRpbWUsIHRoZW4gcmV0dXJuIHRoZSBsYXJnZXN0IEVuZFRpbWUuXG4gICAgICovXG4gICAgcHJpdmF0ZSBpbnQgTmV4dFN0YXJ0VGltZShpbnQgaSkge1xuICAgICAgICBpbnQgc3RhcnQgPSBub3Rlc1tpXS5TdGFydFRpbWU7XG4gICAgICAgIGludCBlbmQgPSBub3Rlc1tpXS5FbmRUaW1lO1xuXG4gICAgICAgIHdoaWxlIChpIDwgbm90ZXMuQ291bnQpIHtcbiAgICAgICAgICAgIGlmIChub3Rlc1tpXS5TdGFydFRpbWUgPiBzdGFydCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBub3Rlc1tpXS5TdGFydFRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbmQgPSBNYXRoLk1heChlbmQsIG5vdGVzW2ldLkVuZFRpbWUpO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbmQ7XG4gICAgfVxuXG4gICAgLyoqIEZpbmQgdGhlIE1pZGkgbm90ZXMgdGhhdCBvY2N1ciBpbiB0aGUgY3VycmVudCB0aW1lLlxuICAgICAqICBTaGFkZSB0aG9zZSBub3RlcyBvbiB0aGUgcGlhbm8gZGlzcGxheWVkLlxuICAgICAqICBVbi1zaGFkZSB0aGUgdGhvc2Ugbm90ZXMgcGxheWVkIGluIHRoZSBwcmV2aW91cyB0aW1lLlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIFNoYWRlTm90ZXMoaW50IGN1cnJlbnRQdWxzZVRpbWUsIGludCBwcmV2UHVsc2VUaW1lKSB7XG4gICAgICAgIGlmIChub3RlcyA9PSBudWxsIHx8IG5vdGVzLkNvdW50ID09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ3JhcGhpY3MgPT0gbnVsbCkge1xuICAgICAgICAgICAgZ3JhcGhpY3MgPSBDcmVhdGVHcmFwaGljcyhcInNoYWRlTm90ZXNfcGlhbm9cIik7XG4gICAgICAgIH1cbiAgICAgICAgZ3JhcGhpY3MuU21vb3RoaW5nTW9kZSA9IFNtb290aGluZ01vZGUuTm9uZTtcbiAgICAgICAgZ3JhcGhpY3MuVHJhbnNsYXRlVHJhbnNmb3JtKG1hcmdpbiArIEJsYWNrQm9yZGVyLCBtYXJnaW4gKyBCbGFja0JvcmRlcik7XG5cbiAgICAgICAgLyogTG9vcCB0aHJvdWdoIHRoZSBNaWRpIG5vdGVzLlxuICAgICAgICAgKiBVbnNoYWRlIG5vdGVzIHdoZXJlIFN0YXJ0VGltZSA8PSBwcmV2UHVsc2VUaW1lIDwgbmV4dCBTdGFydFRpbWVcbiAgICAgICAgICogU2hhZGUgbm90ZXMgd2hlcmUgU3RhcnRUaW1lIDw9IGN1cnJlbnRQdWxzZVRpbWUgPCBuZXh0IFN0YXJ0VGltZVxuICAgICAgICAgKi9cbiAgICAgICAgaW50IGxhc3RTaGFkZWRJbmRleCA9IEZpbmRDbG9zZXN0U3RhcnRUaW1lKHByZXZQdWxzZVRpbWUgLSBtYXhTaGFkZUR1cmF0aW9uICogMik7XG4gICAgICAgIGZvciAoaW50IGkgPSBsYXN0U2hhZGVkSW5kZXg7IGkgPCBub3Rlcy5Db3VudDsgaSsrKSB7XG4gICAgICAgICAgICBpbnQgc3RhcnQgPSBub3Rlc1tpXS5TdGFydFRpbWU7XG4gICAgICAgICAgICBpbnQgZW5kID0gbm90ZXNbaV0uRW5kVGltZTtcbiAgICAgICAgICAgIGludCBub3RlbnVtYmVyID0gbm90ZXNbaV0uTnVtYmVyO1xuICAgICAgICAgICAgaW50IG5leHRTdGFydCA9IE5leHRTdGFydFRpbWUoaSk7XG4gICAgICAgICAgICBpbnQgbmV4dFN0YXJ0VHJhY2sgPSBOZXh0U3RhcnRUaW1lU2FtZVRyYWNrKGkpO1xuICAgICAgICAgICAgZW5kID0gTWF0aC5NYXgoZW5kLCBuZXh0U3RhcnRUcmFjayk7XG4gICAgICAgICAgICBlbmQgPSBNYXRoLk1pbihlbmQsIHN0YXJ0ICsgbWF4U2hhZGVEdXJhdGlvbi0xKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8qIElmIHdlJ3ZlIHBhc3QgdGhlIHByZXZpb3VzIGFuZCBjdXJyZW50IHRpbWVzLCB3ZSdyZSBkb25lLiAqL1xuICAgICAgICAgICAgaWYgKChzdGFydCA+IHByZXZQdWxzZVRpbWUpICYmIChzdGFydCA+IGN1cnJlbnRQdWxzZVRpbWUpKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIElmIHNoYWRlZCBub3RlcyBhcmUgdGhlIHNhbWUsIHdlJ3JlIGRvbmUgKi9cbiAgICAgICAgICAgIGlmICgoc3RhcnQgPD0gY3VycmVudFB1bHNlVGltZSkgJiYgKGN1cnJlbnRQdWxzZVRpbWUgPCBuZXh0U3RhcnQpICYmXG4gICAgICAgICAgICAgICAgKGN1cnJlbnRQdWxzZVRpbWUgPCBlbmQpICYmIFxuICAgICAgICAgICAgICAgIChzdGFydCA8PSBwcmV2UHVsc2VUaW1lKSAmJiAocHJldlB1bHNlVGltZSA8IG5leHRTdGFydCkgJiZcbiAgICAgICAgICAgICAgICAocHJldlB1bHNlVGltZSA8IGVuZCkpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogSWYgdGhlIG5vdGUgaXMgaW4gdGhlIGN1cnJlbnQgdGltZSwgc2hhZGUgaXQgKi9cbiAgICAgICAgICAgIGlmICgoc3RhcnQgPD0gY3VycmVudFB1bHNlVGltZSkgJiYgKGN1cnJlbnRQdWxzZVRpbWUgPCBlbmQpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHVzZVR3b0NvbG9ycykge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm90ZXNbaV0uQ2hhbm5lbCA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTaGFkZU9uZU5vdGUoZ3JhcGhpY3MsIG5vdGVudW1iZXIsIHNoYWRlMkJydXNoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFNoYWRlT25lTm90ZShncmFwaGljcywgbm90ZW51bWJlciwgc2hhZGVCcnVzaCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIFNoYWRlT25lTm90ZShncmFwaGljcywgbm90ZW51bWJlciwgc2hhZGVCcnVzaCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBJZiB0aGUgbm90ZSBpcyBpbiB0aGUgcHJldmlvdXMgdGltZSwgdW4tc2hhZGUgaXQsIGRyYXcgaXQgd2hpdGUuICovXG4gICAgICAgICAgICBlbHNlIGlmICgoc3RhcnQgPD0gcHJldlB1bHNlVGltZSkgJiYgKHByZXZQdWxzZVRpbWUgPCBlbmQpKSB7XG4gICAgICAgICAgICAgICAgaW50IG51bSA9IG5vdGVudW1iZXIgJSAxMjtcbiAgICAgICAgICAgICAgICBpZiAobnVtID09IDEgfHwgbnVtID09IDMgfHwgbnVtID09IDYgfHwgbnVtID09IDggfHwgbnVtID09IDEwKSB7XG4gICAgICAgICAgICAgICAgICAgIFNoYWRlT25lTm90ZShncmFwaGljcywgbm90ZW51bWJlciwgZ3JheTFCcnVzaCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBTaGFkZU9uZU5vdGUoZ3JhcGhpY3MsIG5vdGVudW1iZXIsIEJydXNoZXMuV2hpdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBncmFwaGljcy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShtYXJnaW4gKyBCbGFja0JvcmRlciksIC0obWFyZ2luICsgQmxhY2tCb3JkZXIpKTtcbiAgICAgICAgZ3JhcGhpY3MuU21vb3RoaW5nTW9kZSA9IFNtb290aGluZ01vZGUuQW50aUFsaWFzO1xuICAgIH1cbn1cblxufVxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDExIE1hZGhhdiBWYWlkeWFuYXRoYW5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqICBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMi5cbiAqXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiAgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uSU87XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xuXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWMge1xuXG5cbi8qIEBjbGFzcyBSZXN0U3ltYm9sXG4gKiBBIFJlc3Qgc3ltYm9sIHJlcHJlc2VudHMgYSByZXN0IC0gd2hvbGUsIGhhbGYsIHF1YXJ0ZXIsIG9yIGVpZ2h0aC5cbiAqIFRoZSBSZXN0IHN5bWJvbCBoYXMgYSBzdGFydHRpbWUgYW5kIGEgZHVyYXRpb24sIGp1c3QgbGlrZSBhIHJlZ3VsYXJcbiAqIG5vdGUuXG4gKi9cbnB1YmxpYyBjbGFzcyBSZXN0U3ltYm9sIDogTXVzaWNTeW1ib2wge1xuICAgIHByaXZhdGUgaW50IHN0YXJ0dGltZTsgICAgICAgICAgLyoqIFRoZSBzdGFydHRpbWUgb2YgdGhlIHJlc3QgKi9cbiAgICBwcml2YXRlIE5vdGVEdXJhdGlvbiBkdXJhdGlvbjsgIC8qKiBUaGUgcmVzdCBkdXJhdGlvbiAoZWlnaHRoLCBxdWFydGVyLCBoYWxmLCB3aG9sZSkgKi9cbiAgICBwcml2YXRlIGludCB3aWR0aDsgICAgICAgICAgICAgIC8qKiBUaGUgd2lkdGggaW4gcGl4ZWxzICovXG5cbiAgICAvKiogQ3JlYXRlIGEgbmV3IHJlc3Qgc3ltYm9sIHdpdGggdGhlIGdpdmVuIHN0YXJ0IHRpbWUgYW5kIGR1cmF0aW9uICovXG4gICAgcHVibGljIFJlc3RTeW1ib2woaW50IHN0YXJ0LCBOb3RlRHVyYXRpb24gZHVyKSB7XG4gICAgICAgIHN0YXJ0dGltZSA9IHN0YXJ0O1xuICAgICAgICBkdXJhdGlvbiA9IGR1cjsgXG4gICAgICAgIHdpZHRoID0gTWluV2lkdGg7XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgdGltZSAoaW4gcHVsc2VzKSB0aGlzIHN5bWJvbCBvY2N1cnMgYXQuXG4gICAgICogVGhpcyBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgbWVhc3VyZSB0aGlzIHN5bWJvbCBiZWxvbmdzIHRvLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgU3RhcnRUaW1lIHsgXG4gICAgICAgIGdldCB7IHJldHVybiBzdGFydHRpbWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0L1NldCB0aGUgd2lkdGggKGluIHBpeGVscykgb2YgdGhpcyBzeW1ib2wuIFRoZSB3aWR0aCBpcyBzZXRcbiAgICAgKiBpbiBTaGVldE11c2ljLkFsaWduU3ltYm9scygpIHRvIHZlcnRpY2FsbHkgYWxpZ24gc3ltYm9scy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IFdpZHRoIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgIHNldCB7IHdpZHRoID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBtaW5pbXVtIHdpZHRoIChpbiBwaXhlbHMpIG5lZWRlZCB0byBkcmF3IHRoaXMgc3ltYm9sICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBNaW5XaWR0aCB7XG4gICAgICAgIGdldCB7IHJldHVybiAyICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICsgXG4gICAgICAgICAgICAgIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbnVtYmVyIG9mIHBpeGVscyB0aGlzIHN5bWJvbCBleHRlbmRzIGFib3ZlIHRoZSBzdGFmZi4gVXNlZFxuICAgICAqICB0byBkZXRlcm1pbmUgdGhlIG1pbmltdW0gaGVpZ2h0IG5lZWRlZCBmb3IgdGhlIHN0YWZmIChTdGFmZi5GaW5kQm91bmRzKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEFib3ZlU3RhZmYgeyBcbiAgICAgICAgZ2V0IHsgcmV0dXJuIDA7IH1cbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoaXMgc3ltYm9sIGV4dGVuZHMgYmVsb3cgdGhlIHN0YWZmLiBVc2VkXG4gICAgICogIHRvIGRldGVybWluZSB0aGUgbWluaW11bSBoZWlnaHQgbmVlZGVkIGZvciB0aGUgc3RhZmYgKFN0YWZmLkZpbmRCb3VuZHMpLlxuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgQmVsb3dTdGFmZiB7IFxuICAgICAgICBnZXQgeyByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBEcmF3IHRoZSBzeW1ib2wuXG4gICAgICogQHBhcmFtIHl0b3AgVGhlIHlsb2NhdGlvbiAoaW4gcGl4ZWxzKSB3aGVyZSB0aGUgdG9wIG9mIHRoZSBzdGFmZiBzdGFydHMuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIFxuICAgIHZvaWQgRHJhdyhHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICAvKiBBbGlnbiB0aGUgcmVzdCBzeW1ib2wgdG8gdGhlIHJpZ2h0ICovXG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKFdpZHRoIC0gTWluV2lkdGgsIDApO1xuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybShTaGVldE11c2ljLk5vdGVIZWlnaHQvMiwgMCk7XG5cbiAgICAgICAgaWYgKGR1cmF0aW9uID09IE5vdGVEdXJhdGlvbi5XaG9sZSkge1xuICAgICAgICAgICAgRHJhd1dob2xlKGcsIHBlbiwgeXRvcCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkhhbGYpIHtcbiAgICAgICAgICAgIERyYXdIYWxmKGcsIHBlbiwgeXRvcCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLlF1YXJ0ZXIpIHtcbiAgICAgICAgICAgIERyYXdRdWFydGVyKGcsIHBlbiwgeXRvcCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZHVyYXRpb24gPT0gTm90ZUR1cmF0aW9uLkVpZ2h0aCkge1xuICAgICAgICAgICAgRHJhd0VpZ2h0aChnLCBwZW4sIHl0b3ApO1xuICAgICAgICB9XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC1TaGVldE11c2ljLk5vdGVIZWlnaHQvMiwgMCk7XG4gICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC0oV2lkdGggLSBNaW5XaWR0aCksIDApO1xuICAgIH1cblxuXG4gICAgLyoqIERyYXcgYSB3aG9sZSByZXN0IHN5bWJvbCwgYSByZWN0YW5nbGUgYmVsb3cgYSBzdGFmZiBsaW5lLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIERyYXdXaG9sZShHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICBpbnQgeSA9IHl0b3AgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQ7XG5cbiAgICAgICAgZy5GaWxsUmVjdGFuZ2xlKEJydXNoZXMuQmxhY2ssIDAsIHksIFxuICAgICAgICAgICAgICAgICAgICAgICAgU2hlZXRNdXNpYy5Ob3RlV2lkdGgsIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yKTtcbiAgICB9XG5cbiAgICAvKiogRHJhdyBhIGhhbGYgcmVzdCBzeW1ib2wsIGEgcmVjdGFuZ2xlIGFib3ZlIGEgc3RhZmYgbGluZS5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3SGFsZihHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICBpbnQgeSA9IHl0b3AgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQvMjtcblxuICAgICAgICBnLkZpbGxSZWN0YW5nbGUoQnJ1c2hlcy5CbGFjaywgMCwgeSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBTaGVldE11c2ljLk5vdGVXaWR0aCwgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzIpO1xuICAgIH1cblxuICAgIC8qKiBEcmF3IGEgcXVhcnRlciByZXN0IHN5bWJvbC5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgdm9pZCBEcmF3UXVhcnRlcihHcmFwaGljcyBnLCBQZW4gcGVuLCBpbnQgeXRvcCkge1xuICAgICAgICBwZW4uRW5kQ2FwID0gTGluZUNhcC5GbGF0O1xuXG4gICAgICAgIGludCB5ID0geXRvcCArIFNoZWV0TXVzaWMuTm90ZUhlaWdodC8yO1xuICAgICAgICBpbnQgeCA9IDI7XG4gICAgICAgIGludCB4ZW5kID0geCArIDIqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzM7XG4gICAgICAgIHBlbi5XaWR0aCA9IDE7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCB4LCB5LCB4ZW5kLTEsIHkgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQtMSk7XG5cbiAgICAgICAgcGVuLldpZHRoID0gU2hlZXRNdXNpYy5MaW5lU3BhY2UvMjtcbiAgICAgICAgeSAgPSB5dG9wICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICsgMTtcbiAgICAgICAgZy5EcmF3TGluZShwZW4sIHhlbmQtMiwgeSwgeCwgeSArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCk7XG5cbiAgICAgICAgcGVuLldpZHRoID0gMTtcbiAgICAgICAgeSA9IHl0b3AgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQqMiAtIDE7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCAwLCB5LCB4ZW5kKzIsIHkgKyBTaGVldE11c2ljLk5vdGVIZWlnaHQpOyBcblxuICAgICAgICBwZW4uV2lkdGggPSBTaGVldE11c2ljLkxpbmVTcGFjZS8yO1xuICAgICAgICBpZiAoU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ID09IDYpIHtcbiAgICAgICAgICAgIGcuRHJhd0xpbmUocGVuLCB4ZW5kLCB5ICsgMSArIDMqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeC8yLCB5ICsgMSArIDMqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgeyAgLyogTm90ZUhlaWdodCA9PSA4ICovXG4gICAgICAgICAgICBnLkRyYXdMaW5lKHBlbiwgeGVuZCwgeSArIDMqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeC8yLCB5ICsgMypTaGVldE11c2ljLk5vdGVIZWlnaHQvNCk7XG4gICAgICAgIH1cblxuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgMCwgeSArIDIqU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0LzMgKyAxLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHhlbmQgLSAxLCB5ICsgMypTaGVldE11c2ljLk5vdGVIZWlnaHQvMik7XG4gICAgfVxuXG4gICAgLyoqIERyYXcgYW4gZWlnaHRoIHJlc3Qgc3ltYm9sLlxuICAgICAqIEBwYXJhbSB5dG9wIFRoZSB5bG9jYXRpb24gKGluIHBpeGVscykgd2hlcmUgdGhlIHRvcCBvZiB0aGUgc3RhZmYgc3RhcnRzLlxuICAgICAqL1xuICAgIHB1YmxpYyB2b2lkIERyYXdFaWdodGgoR3JhcGhpY3MgZywgUGVuIHBlbiwgaW50IHl0b3ApIHtcbiAgICAgICAgaW50IHkgPSB5dG9wICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0IC0gMTtcbiAgICAgICAgZy5GaWxsRWxsaXBzZShCcnVzaGVzLkJsYWNrLCAwLCB5KzEsIFxuICAgICAgICAgICAgICAgICAgICAgIFNoZWV0TXVzaWMuTGluZVNwYWNlLTEsIFNoZWV0TXVzaWMuTGluZVNwYWNlLTEpO1xuICAgICAgICBwZW4uV2lkdGggPSAxO1xuICAgICAgICBnLkRyYXdMaW5lKHBlbiwgKFNoZWV0TXVzaWMuTGluZVNwYWNlLTIpLzIsIHkgKyBTaGVldE11c2ljLkxpbmVTcGFjZS0xLFxuICAgICAgICAgICAgICAgICAgICAgICAgMypTaGVldE11c2ljLkxpbmVTcGFjZS8yLCB5ICsgU2hlZXRNdXNpYy5MaW5lU3BhY2UvMik7XG4gICAgICAgIGcuRHJhd0xpbmUocGVuLCAzKlNoZWV0TXVzaWMuTGluZVNwYWNlLzIsIHkgKyBTaGVldE11c2ljLkxpbmVTcGFjZS8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgMypTaGVldE11c2ljLkxpbmVTcGFjZS80LCB5ICsgU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0KjIpO1xuICAgIH1cblxuICAgIHB1YmxpYyBvdmVycmlkZSBzdHJpbmcgVG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiUmVzdFN5bWJvbCBzdGFydHRpbWU9ezB9IGR1cmF0aW9uPXsxfSB3aWR0aD17Mn1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnR0aW1lLCBkdXJhdGlvbiwgd2lkdGgpO1xuICAgIH1cblxufVxuXG5cbn1cblxuIiwiLypcclxuICogQ29weXJpZ2h0IChjKSAyMDA3LTIwMTIgTWFkaGF2IFZhaWR5YW5hdGhhblxyXG4gKlxyXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcclxuICogIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAyLlxyXG4gKlxyXG4gKiAgVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXHJcbiAqICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxyXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxyXG4gKiAgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cclxuICovXHJcblxyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgTWlkaVNoZWV0TXVzaWNcclxue1xyXG5cclxuXHJcbiAgICAvKiogQGNsYXNzIFNoZWV0TXVzaWNcclxuICAgICAqXHJcbiAgICAgKiBUaGUgU2hlZXRNdXNpYyBDb250cm9sIGlzIHRoZSBtYWluIGNsYXNzIGZvciBkaXNwbGF5aW5nIHRoZSBzaGVldCBtdXNpYy5cclxuICAgICAqIFRoZSBTaGVldE11c2ljIGNsYXNzIGhhcyB0aGUgZm9sbG93aW5nIHB1YmxpYyBtZXRob2RzOlxyXG4gICAgICpcclxuICAgICAqIFNoZWV0TXVzaWMoKVxyXG4gICAgICogICBDcmVhdGUgYSBuZXcgU2hlZXRNdXNpYyBjb250cm9sIGZyb20gdGhlIGdpdmVuIG1pZGkgZmlsZSBhbmQgb3B0aW9ucy5cclxuICAgICAqIFxyXG4gICAgICogU2V0Wm9vbSgpXHJcbiAgICAgKiAgIFNldCB0aGUgem9vbSBsZXZlbCB0byBkaXNwbGF5IHRoZSBzaGVldCBtdXNpYyBhdC5cclxuICAgICAqXHJcbiAgICAgKiBEb1ByaW50KClcclxuICAgICAqICAgUHJpbnQgYSBzaW5nbGUgcGFnZSBvZiBzaGVldCBtdXNpYy5cclxuICAgICAqXHJcbiAgICAgKiBHZXRUb3RhbFBhZ2VzKClcclxuICAgICAqICAgR2V0IHRoZSB0b3RhbCBudW1iZXIgb2Ygc2hlZXQgbXVzaWMgcGFnZXMuXHJcbiAgICAgKlxyXG4gICAgICogT25QYWludCgpXHJcbiAgICAgKiAgIE1ldGhvZCBjYWxsZWQgdG8gZHJhdyB0aGUgU2hlZXRNdWlzY1xyXG4gICAgICpcclxuICAgICAqIFRoZXNlIHB1YmxpYyBtZXRob2RzIGFyZSBjYWxsZWQgZnJvbSB0aGUgTWlkaVNoZWV0TXVzaWMgRm9ybSBXaW5kb3cuXHJcbiAgICAgKlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY2xhc3MgU2hlZXRNdXNpYyA6IENvbnRyb2xcclxuICAgIHtcclxuXHJcbiAgICAgICAgLyogTWVhc3VyZW1lbnRzIHVzZWQgd2hlbiBkcmF3aW5nLiAgQWxsIG1lYXN1cmVtZW50cyBhcmUgaW4gcGl4ZWxzLlxyXG4gICAgICAgICAqIFRoZSB2YWx1ZXMgZGVwZW5kIG9uIHdoZXRoZXIgdGhlIG1lbnUgJ0xhcmdlIE5vdGVzJyBvciAnU21hbGwgTm90ZXMnIGlzIHNlbGVjdGVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgTGluZVdpZHRoID0gMTsgICAgLyoqIFRoZSB3aWR0aCBvZiBhIGxpbmUgKi9cclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IExlZnRNYXJnaW4gPSA0OyAgIC8qKiBUaGUgbGVmdCBtYXJnaW4gKi9cclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IFRpdGxlSGVpZ2h0ID0gMTQ7IC8qKiBUaGUgaGVpZ2h0IGZvciB0aGUgdGl0bGUgb24gdGhlIGZpcnN0IHBhZ2UgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGludCBMaW5lU3BhY2U7ICAgICAgICAvKiogVGhlIHNwYWNlIGJldHdlZW4gbGluZXMgaW4gdGhlIHN0YWZmICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBpbnQgU3RhZmZIZWlnaHQ7ICAgICAgLyoqIFRoZSBoZWlnaHQgYmV0d2VlbiB0aGUgNSBob3Jpem9udGFsIGxpbmVzIG9mIHRoZSBzdGFmZiAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaW50IE5vdGVIZWlnaHQ7ICAgICAgLyoqIFRoZSBoZWlnaHQgb2YgYSB3aG9sZSBub3RlICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBpbnQgTm90ZVdpZHRoOyAgICAgICAvKiogVGhlIHdpZHRoIG9mIGEgd2hvbGUgbm90ZSAqL1xyXG5cclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IFBhZ2VXaWR0aCA9IDgwMDsgICAgLyoqIFRoZSB3aWR0aCBvZiBlYWNoIHBhZ2UgKi9cclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IFBhZ2VIZWlnaHQgPSAxMDUwOyAgLyoqIFRoZSBoZWlnaHQgb2YgZWFjaCBwYWdlICh3aGVuIHByaW50aW5nKSAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgRm9udCBMZXR0ZXJGb250OyAgICAgICAvKiogVGhlIGZvbnQgZm9yIGRyYXdpbmcgdGhlIGxldHRlcnMgKi9cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBMaXN0PFN0YWZmPiBzdGFmZnM7IC8qKiBUaGUgYXJyYXkgb2Ygc3RhZmZzIHRvIGRpc3BsYXkgKGZyb20gdG9wIHRvIGJvdHRvbSkgKi9cclxuICAgICAgICBwcml2YXRlIEtleVNpZ25hdHVyZSBtYWlua2V5OyAvKiogVGhlIG1haW4ga2V5IHNpZ25hdHVyZSAqL1xyXG4gICAgICAgIHByaXZhdGUgaW50IG51bXRyYWNrczsgICAgIC8qKiBUaGUgbnVtYmVyIG9mIHRyYWNrcyAqL1xyXG4gICAgICAgIHByaXZhdGUgZmxvYXQgem9vbTsgICAgICAgICAgLyoqIFRoZSB6b29tIGxldmVsIHRvIGRyYXcgYXQgKDEuMCA9PSAxMDAlKSAqL1xyXG4gICAgICAgIHByaXZhdGUgYm9vbCBzY3JvbGxWZXJ0OyAgICAvKiogV2hldGhlciB0byBzY3JvbGwgdmVydGljYWxseSBvciBob3Jpem9udGFsbHkgKi9cclxuICAgICAgICBwcml2YXRlIHN0cmluZyBmaWxlbmFtZTsgICAgICAvKiogVGhlIG5hbWUgb2YgdGhlIG1pZGkgZmlsZSAqL1xyXG4gICAgICAgIHByaXZhdGUgaW50IHNob3dOb3RlTGV0dGVyczsgICAgLyoqIERpc3BsYXkgdGhlIG5vdGUgbGV0dGVycyAqL1xyXG4gICAgICAgIHByaXZhdGUgQ29sb3JbXSBOb3RlQ29sb3JzOyAgICAgLyoqIFRoZSBub3RlIGNvbG9ycyB0byB1c2UgKi9cclxuICAgICAgICBwcml2YXRlIFNvbGlkQnJ1c2ggc2hhZGVCcnVzaDsgIC8qKiBUaGUgYnJ1c2ggZm9yIHNoYWRpbmcgKi9cclxuICAgICAgICBwcml2YXRlIFNvbGlkQnJ1c2ggc2hhZGUyQnJ1c2g7IC8qKiBUaGUgYnJ1c2ggZm9yIHNoYWRpbmcgbGVmdC1oYW5kIHBpYW5vICovXHJcbiAgICAgICAgcHJpdmF0ZSBTb2xpZEJydXNoIGRlc2VsZWN0ZWRTaGFkZUJydXNoID0gbmV3IFNvbGlkQnJ1c2goQ29sb3IuTGlnaHRHcmF5KTsgLyoqIFRoZSBicnVzaCBmb3Igc2hhZGluZyBkZXNlbGVjdGVkIGFyZWFzICovXHJcbiAgICAgICAgcHJpdmF0ZSBQZW4gcGVuOyAgICAgICAgICAgICAgICAvKiogVGhlIGJsYWNrIHBlbiBmb3IgZHJhd2luZyAqL1xyXG5cclxuICAgICAgICBwdWJsaWMgaW50IFNlbGVjdGlvblN0YXJ0UHVsc2UgeyBnZXQ7IHNldDsgfVxyXG4gICAgICAgIHB1YmxpYyBpbnQgU2VsZWN0aW9uRW5kUHVsc2UgeyBnZXQ7IHNldDsgfVxyXG5cclxuICAgICAgICAvKiogSW5pdGlhbGl6ZSB0aGUgZGVmYXVsdCBub3RlIHNpemVzLiAgKi9cclxuICAgICAgICBzdGF0aWMgU2hlZXRNdXNpYygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTZXROb3RlU2l6ZShmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogQ3JlYXRlIGEgbmV3IFNoZWV0TXVzaWMgY29udHJvbCwgdXNpbmcgdGhlIGdpdmVuIHBhcnNlZCBNaWRpRmlsZS5cclxuICAgICAgICAgKiAgVGhlIG9wdGlvbnMgY2FuIGJlIG51bGwuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIFNoZWV0TXVzaWMoTWlkaUZpbGUgZmlsZSwgTWlkaU9wdGlvbnMgb3B0aW9ucylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGluaXQoZmlsZSwgb3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgU2hlZXRNdXNpYyhNaWRpRmlsZSBmaWxlLCBNaWRpT3B0aW9ucyBvcHRpb25zLCBMaXN0PE1pZGlUcmFjaz4gdHJhY2tzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW5pdChmaWxlLCBvcHRpb25zLCB0cmFja3MpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIENyZWF0ZSBhIG5ldyBTaGVldE11c2ljIGNvbnRyb2wsIHVzaW5nIHRoZSBnaXZlbiByYXcgbWlkaSBieXRlW10gZGF0YS5cclxuICAgICAgICAgKiAgVGhlIG9wdGlvbnMgY2FuIGJlIG51bGwuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIFNoZWV0TXVzaWMoYnl0ZVtdIGRhdGEsIHN0cmluZyB0aXRsZSwgTWlkaU9wdGlvbnMgb3B0aW9ucylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIE1pZGlGaWxlIGZpbGUgPSBuZXcgTWlkaUZpbGUoZGF0YSwgdGl0bGUpO1xyXG4gICAgICAgICAgICBpbml0KGZpbGUsIG9wdGlvbnMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgaW5pdChNaWRpRmlsZSBmaWxlLCBNaWRpT3B0aW9ucyBvcHRpb25zLCBMaXN0PE1pZGlUcmFjaz4gdHJhY2tzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgem9vbSA9IDEuMGY7XHJcbiAgICAgICAgICAgIGZpbGVuYW1lID0gZmlsZS5GaWxlTmFtZTtcclxuXHJcbiAgICAgICAgICAgIFNldENvbG9ycyhvcHRpb25zLmNvbG9ycywgb3B0aW9ucy5zaGFkZUNvbG9yLCBvcHRpb25zLnNoYWRlMkNvbG9yKTtcclxuICAgICAgICAgICAgcGVuID0gbmV3IFBlbihDb2xvci5CbGFjaywgMSk7XHJcblxyXG4gICAgICAgICAgICBTZXROb3RlU2l6ZShvcHRpb25zLmxhcmdlTm90ZVNpemUpO1xyXG4gICAgICAgICAgICBzY3JvbGxWZXJ0ID0gb3B0aW9ucy5zY3JvbGxWZXJ0O1xyXG4gICAgICAgICAgICBzaG93Tm90ZUxldHRlcnMgPSBvcHRpb25zLnNob3dOb3RlTGV0dGVycztcclxuICAgICAgICAgICAgVGltZVNpZ25hdHVyZSB0aW1lID0gZmlsZS5UaW1lO1xyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy50aW1lICE9IG51bGwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRpbWUgPSBvcHRpb25zLnRpbWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMua2V5ID09IC0xKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBtYWlua2V5ID0gR2V0S2V5U2lnbmF0dXJlKHRyYWNrcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBtYWlua2V5ID0gbmV3IEtleVNpZ25hdHVyZShvcHRpb25zLmtleSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG51bXRyYWNrcyA9IHRyYWNrcy5Db3VudDtcclxuXHJcbiAgICAgICAgICAgIGludCBsYXN0U3RhcnQgPSBmaWxlLkVuZFRpbWUoKSArIG9wdGlvbnMuc2hpZnR0aW1lO1xyXG5cclxuICAgICAgICAgICAgLyogQ3JlYXRlIGFsbCB0aGUgbXVzaWMgc3ltYm9scyAobm90ZXMsIHJlc3RzLCB2ZXJ0aWNhbCBiYXJzLCBhbmRcclxuICAgICAgICAgICAgICogY2xlZiBjaGFuZ2VzKS4gIFRoZSBzeW1ib2xzIHZhcmlhYmxlIGNvbnRhaW5zIGEgbGlzdCBvZiBtdXNpYyBcclxuICAgICAgICAgICAgICogc3ltYm9scyBmb3IgZWFjaCB0cmFjay4gIFRoZSBsaXN0IGRvZXMgbm90IGluY2x1ZGUgdGhlIGxlZnQtc2lkZSBcclxuICAgICAgICAgICAgICogQ2xlZiBhbmQga2V5IHNpZ25hdHVyZSBzeW1ib2xzLiAgVGhvc2UgY2FuIG9ubHkgYmUgY2FsY3VsYXRlZCBcclxuICAgICAgICAgICAgICogd2hlbiB3ZSBjcmVhdGUgdGhlIHN0YWZmcy5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIExpc3Q8TXVzaWNTeW1ib2w+W10gc3ltYm9scyA9IG5ldyBMaXN0PE11c2ljU3ltYm9sPltudW10cmFja3NdO1xyXG4gICAgICAgICAgICBmb3IgKGludCB0cmFja251bSA9IDA7IHRyYWNrbnVtIDwgbnVtdHJhY2tzOyB0cmFja251bSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBNaWRpVHJhY2sgdHJhY2sgPSB0cmFja3NbdHJhY2tudW1dO1xyXG4gICAgICAgICAgICAgICAgQ2xlZk1lYXN1cmVzIGNsZWZzID0gbmV3IENsZWZNZWFzdXJlcyh0cmFjay5Ob3RlcywgdGltZS5NZWFzdXJlKTtcclxuICAgICAgICAgICAgICAgIExpc3Q8Q2hvcmRTeW1ib2w+IGNob3JkcyA9IENyZWF0ZUNob3Jkcyh0cmFjay5Ob3RlcywgbWFpbmtleSwgdGltZSwgY2xlZnMpO1xyXG4gICAgICAgICAgICAgICAgc3ltYm9sc1t0cmFja251bV0gPSBDcmVhdGVTeW1ib2xzKGNob3JkcywgY2xlZnMsIHRpbWUsIGxhc3RTdGFydCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIExpc3Q8THlyaWNTeW1ib2w+W10gbHlyaWNzID0gbnVsbDtcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuc2hvd0x5cmljcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbHlyaWNzID0gR2V0THlyaWNzKHRyYWNrcyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qIFZlcnRpY2FsbHkgYWxpZ24gdGhlIG11c2ljIHN5bWJvbHMgKi9cclxuICAgICAgICAgICAgU3ltYm9sV2lkdGhzIHdpZHRocyA9IG5ldyBTeW1ib2xXaWR0aHMoc3ltYm9scywgbHlyaWNzKTtcclxuICAgICAgICAgICAgQWxpZ25TeW1ib2xzKHN5bWJvbHMsIHdpZHRocywgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICBzdGFmZnMgPSBDcmVhdGVTdGFmZnMoc3ltYm9scywgbWFpbmtleSwgb3B0aW9ucywgdGltZS5NZWFzdXJlKTtcclxuICAgICAgICAgICAgQ3JlYXRlQWxsQmVhbWVkQ2hvcmRzKHN5bWJvbHMsIHRpbWUpO1xyXG4gICAgICAgICAgICBpZiAobHlyaWNzICE9IG51bGwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIEFkZEx5cmljc1RvU3RhZmZzKHN0YWZmcywgbHlyaWNzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLyogQWZ0ZXIgbWFraW5nIGNob3JkIHBhaXJzLCB0aGUgc3RlbSBkaXJlY3Rpb25zIGNhbiBjaGFuZ2UsXHJcbiAgICAgICAgICAgICAqIHdoaWNoIGFmZmVjdHMgdGhlIHN0YWZmIGhlaWdodC4gIFJlLWNhbGN1bGF0ZSB0aGUgc3RhZmYgaGVpZ2h0LlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgZm9yZWFjaCAoU3RhZmYgc3RhZmYgaW4gc3RhZmZzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzdGFmZi5DYWxjdWxhdGVIZWlnaHQoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgQmFja0NvbG9yID0gQ29sb3IuV2hpdGU7XHJcblxyXG4gICAgICAgICAgICBTZXRab29tKDEuMGYpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIENyZWF0ZSBhIG5ldyBTaGVldE11c2ljIGNvbnRyb2wuXHJcbiAgICAgICAgICogTWlkaUZpbGUgaXMgdGhlIHBhcnNlZCBtaWRpIGZpbGUgdG8gZGlzcGxheS5cclxuICAgICAgICAgKiBTaGVldE11c2ljIE9wdGlvbnMgYXJlIHRoZSBtZW51IG9wdGlvbnMgdGhhdCB3ZXJlIHNlbGVjdGVkLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogLSBBcHBseSBhbGwgdGhlIE1lbnUgT3B0aW9ucyB0byB0aGUgTWlkaUZpbGUgdHJhY2tzLlxyXG4gICAgICAgICAqIC0gQ2FsY3VsYXRlIHRoZSBrZXkgc2lnbmF0dXJlXHJcbiAgICAgICAgICogLSBGb3IgZWFjaCB0cmFjaywgY3JlYXRlIGEgbGlzdCBvZiBNdXNpY1N5bWJvbHMgKG5vdGVzLCByZXN0cywgYmFycywgZXRjKVxyXG4gICAgICAgICAqIC0gVmVydGljYWxseSBhbGlnbiB0aGUgbXVzaWMgc3ltYm9scyBpbiBhbGwgdGhlIHRyYWNrc1xyXG4gICAgICAgICAqIC0gUGFydGl0aW9uIHRoZSBtdXNpYyBub3RlcyBpbnRvIGhvcml6b250YWwgc3RhZmZzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHZvaWQgaW5pdChNaWRpRmlsZSBmaWxlLCBNaWRpT3B0aW9ucyBvcHRpb25zKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMgPT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IG5ldyBNaWRpT3B0aW9ucyhmaWxlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBMaXN0PE1pZGlUcmFjaz4gdHJhY2tzID0gZmlsZS5DaGFuZ2VNaWRpTm90ZXMob3B0aW9ucyk7XHJcbiAgICAgICAgICAgIGluaXQoZmlsZSwgb3B0aW9ucywgdHJhY2tzKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIEdldCB0aGUgYmVzdCBrZXkgc2lnbmF0dXJlIGdpdmVuIHRoZSBtaWRpIG5vdGVzIGluIGFsbCB0aGUgdHJhY2tzLiAqL1xyXG4gICAgICAgIHByaXZhdGUgS2V5U2lnbmF0dXJlIEdldEtleVNpZ25hdHVyZShMaXN0PE1pZGlUcmFjaz4gdHJhY2tzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgTGlzdDxpbnQ+IG5vdGVudW1zID0gbmV3IExpc3Q8aW50PigpO1xyXG4gICAgICAgICAgICBmb3JlYWNoIChNaWRpVHJhY2sgdHJhY2sgaW4gdHJhY2tzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChNaWRpTm90ZSBub3RlIGluIHRyYWNrLk5vdGVzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vdGVudW1zLkFkZChub3RlLk51bWJlcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIEtleVNpZ25hdHVyZS5HdWVzcyhub3RlbnVtcyk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIENyZWF0ZSB0aGUgY2hvcmQgc3ltYm9scyBmb3IgYSBzaW5nbGUgdHJhY2suXHJcbiAgICAgICAgICogQHBhcmFtIG1pZGlub3RlcyAgVGhlIE1pZGlub3RlcyBpbiB0aGUgdHJhY2suXHJcbiAgICAgICAgICogQHBhcmFtIGtleSAgICAgICAgVGhlIEtleSBTaWduYXR1cmUsIGZvciBkZXRlcm1pbmluZyBzaGFycHMvZmxhdHMuXHJcbiAgICAgICAgICogQHBhcmFtIHRpbWUgICAgICAgVGhlIFRpbWUgU2lnbmF0dXJlLCBmb3IgZGV0ZXJtaW5pbmcgdGhlIG1lYXN1cmVzLlxyXG4gICAgICAgICAqIEBwYXJhbSBjbGVmcyAgICAgIFRoZSBjbGVmcyB0byB1c2UgZm9yIGVhY2ggbWVhc3VyZS5cclxuICAgICAgICAgKiBAcmV0IEFuIGFycmF5IG9mIENob3JkU3ltYm9sc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGVcclxuICAgICAgICBMaXN0PENob3JkU3ltYm9sPiBDcmVhdGVDaG9yZHMoTGlzdDxNaWRpTm90ZT4gbWlkaW5vdGVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBLZXlTaWduYXR1cmUga2V5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUaW1lU2lnbmF0dXJlIHRpbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENsZWZNZWFzdXJlcyBjbGVmcylcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICBpbnQgaSA9IDA7XHJcbiAgICAgICAgICAgIExpc3Q8Q2hvcmRTeW1ib2w+IGNob3JkcyA9IG5ldyBMaXN0PENob3JkU3ltYm9sPigpO1xyXG4gICAgICAgICAgICBMaXN0PE1pZGlOb3RlPiBub3RlZ3JvdXAgPSBuZXcgTGlzdDxNaWRpTm90ZT4oMTIpO1xyXG4gICAgICAgICAgICBpbnQgbGVuID0gbWlkaW5vdGVzLkNvdW50O1xyXG5cclxuICAgICAgICAgICAgd2hpbGUgKGkgPCBsZW4pXHJcbiAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpbnQgc3RhcnR0aW1lID0gbWlkaW5vdGVzW2ldLlN0YXJ0VGltZTtcclxuICAgICAgICAgICAgICAgIENsZWYgY2xlZiA9IGNsZWZzLkdldENsZWYoc3RhcnR0aW1lKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKiBHcm91cCBhbGwgdGhlIG1pZGkgbm90ZXMgd2l0aCB0aGUgc2FtZSBzdGFydCB0aW1lXHJcbiAgICAgICAgICAgICAgICAgKiBpbnRvIHRoZSBub3RlcyBsaXN0LlxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBub3RlZ3JvdXAuQ2xlYXIoKTtcclxuICAgICAgICAgICAgICAgIG5vdGVncm91cC5BZGQobWlkaW5vdGVzW2ldKTtcclxuICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgbGVuICYmIG1pZGlub3Rlc1tpXS5TdGFydFRpbWUgPT0gc3RhcnR0aW1lKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vdGVncm91cC5BZGQobWlkaW5vdGVzW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLyogQ3JlYXRlIGEgc2luZ2xlIGNob3JkIGZyb20gdGhlIGdyb3VwIG9mIG1pZGkgbm90ZXMgd2l0aFxyXG4gICAgICAgICAgICAgICAgICogdGhlIHNhbWUgc3RhcnQgdGltZS5cclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgQ2hvcmRTeW1ib2wgY2hvcmQgPSBuZXcgQ2hvcmRTeW1ib2wobm90ZWdyb3VwLCBrZXksIHRpbWUsIGNsZWYsIHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgY2hvcmRzLkFkZChjaG9yZCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBjaG9yZHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogR2l2ZW4gdGhlIGNob3JkIHN5bWJvbHMgZm9yIGEgdHJhY2ssIGNyZWF0ZSBhIG5ldyBzeW1ib2wgbGlzdFxyXG4gICAgICAgICAqIHRoYXQgY29udGFpbnMgdGhlIGNob3JkIHN5bWJvbHMsIHZlcnRpY2FsIGJhcnMsIHJlc3RzLCBhbmQgY2xlZiBjaGFuZ2VzLlxyXG4gICAgICAgICAqIFJldHVybiBhIGxpc3Qgb2Ygc3ltYm9scyAoQ2hvcmRTeW1ib2wsIEJhclN5bWJvbCwgUmVzdFN5bWJvbCwgQ2xlZlN5bWJvbClcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIExpc3Q8TXVzaWNTeW1ib2w+XHJcbiAgICAgICAgQ3JlYXRlU3ltYm9scyhMaXN0PENob3JkU3ltYm9sPiBjaG9yZHMsIENsZWZNZWFzdXJlcyBjbGVmcyxcclxuICAgICAgICAgICAgICAgICAgICAgIFRpbWVTaWduYXR1cmUgdGltZSwgaW50IGxhc3RTdGFydClcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzID0gbmV3IExpc3Q8TXVzaWNTeW1ib2w+KCk7XHJcbiAgICAgICAgICAgIHN5bWJvbHMgPSBBZGRCYXJzKGNob3JkcywgdGltZSwgbGFzdFN0YXJ0KTtcclxuICAgICAgICAgICAgc3ltYm9scyA9IEFkZFJlc3RzKHN5bWJvbHMsIHRpbWUpO1xyXG4gICAgICAgICAgICBzeW1ib2xzID0gQWRkQ2xlZkNoYW5nZXMoc3ltYm9scywgY2xlZnMsIHRpbWUpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN5bWJvbHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogQWRkIGluIHRoZSB2ZXJ0aWNhbCBiYXJzIGRlbGltaXRpbmcgbWVhc3VyZXMuIFxyXG4gICAgICAgICAqICBBbHNvLCBhZGQgdGhlIHRpbWUgc2lnbmF0dXJlIHN5bWJvbHMuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZVxyXG4gICAgICAgIExpc3Q8TXVzaWNTeW1ib2w+IEFkZEJhcnMoTGlzdDxDaG9yZFN5bWJvbD4gY2hvcmRzLCBUaW1lU2lnbmF0dXJlIHRpbWUsIGludCBsYXN0U3RhcnQpXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scyA9IG5ldyBMaXN0PE11c2ljU3ltYm9sPigpO1xyXG5cclxuICAgICAgICAgICAgVGltZVNpZ1N5bWJvbCB0aW1lc2lnID0gbmV3IFRpbWVTaWdTeW1ib2wodGltZS5OdW1lcmF0b3IsIHRpbWUuRGVub21pbmF0b3IpO1xyXG4gICAgICAgICAgICBzeW1ib2xzLkFkZCh0aW1lc2lnKTtcclxuXHJcbiAgICAgICAgICAgIC8qIFRoZSBzdGFydHRpbWUgb2YgdGhlIGJlZ2lubmluZyBvZiB0aGUgbWVhc3VyZSAqL1xyXG4gICAgICAgICAgICBpbnQgbWVhc3VyZXRpbWUgPSAwO1xyXG5cclxuICAgICAgICAgICAgaW50IGkgPSAwO1xyXG4gICAgICAgICAgICB3aGlsZSAoaSA8IGNob3Jkcy5Db3VudClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1lYXN1cmV0aW1lIDw9IGNob3Jkc1tpXS5TdGFydFRpbWUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3ltYm9scy5BZGQobmV3IEJhclN5bWJvbChtZWFzdXJldGltZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1lYXN1cmV0aW1lICs9IHRpbWUuTWVhc3VyZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzeW1ib2xzLkFkZChjaG9yZHNbaV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLyogS2VlcCBhZGRpbmcgYmFycyB1bnRpbCB0aGUgbGFzdCBTdGFydFRpbWUgKHRoZSBlbmQgb2YgdGhlIHNvbmcpICovXHJcbiAgICAgICAgICAgIHdoaWxlIChtZWFzdXJldGltZSA8IGxhc3RTdGFydClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3ltYm9scy5BZGQobmV3IEJhclN5bWJvbChtZWFzdXJldGltZSkpO1xyXG4gICAgICAgICAgICAgICAgbWVhc3VyZXRpbWUgKz0gdGltZS5NZWFzdXJlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvKiBBZGQgdGhlIGZpbmFsIHZlcnRpY2FsIGJhciB0byB0aGUgbGFzdCBtZWFzdXJlICovXHJcbiAgICAgICAgICAgIHN5bWJvbHMuQWRkKG5ldyBCYXJTeW1ib2wobWVhc3VyZXRpbWUpKTtcclxuICAgICAgICAgICAgcmV0dXJuIHN5bWJvbHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogQWRkIHJlc3Qgc3ltYm9scyBiZXR3ZWVuIG5vdGVzLiAgQWxsIHRpbWVzIGJlbG93IGFyZSBcclxuICAgICAgICAgKiBtZWFzdXJlZCBpbiBwdWxzZXMuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZVxyXG4gICAgICAgIExpc3Q8TXVzaWNTeW1ib2w+IEFkZFJlc3RzKExpc3Q8TXVzaWNTeW1ib2w+IHN5bWJvbHMsIFRpbWVTaWduYXR1cmUgdGltZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGludCBwcmV2dGltZSA9IDA7XHJcblxyXG4gICAgICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiByZXN1bHQgPSBuZXcgTGlzdDxNdXNpY1N5bWJvbD4oc3ltYm9scy5Db3VudCk7XHJcblxyXG4gICAgICAgICAgICBmb3JlYWNoIChNdXNpY1N5bWJvbCBzeW1ib2wgaW4gc3ltYm9scylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IHN0YXJ0dGltZSA9IHN5bWJvbC5TdGFydFRpbWU7XHJcbiAgICAgICAgICAgICAgICBSZXN0U3ltYm9sW10gcmVzdHMgPSBHZXRSZXN0cyh0aW1lLCBwcmV2dGltZSwgc3RhcnR0aW1lKTtcclxuICAgICAgICAgICAgICAgIGlmIChyZXN0cyAhPSBudWxsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcmVhY2ggKFJlc3RTeW1ib2wgciBpbiByZXN0cylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5BZGQocik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJlc3VsdC5BZGQoc3ltYm9sKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvKiBTZXQgcHJldnRpbWUgdG8gdGhlIGVuZCB0aW1lIG9mIHRoZSBsYXN0IG5vdGUvc3ltYm9sLiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHN5bWJvbCBpcyBDaG9yZFN5bWJvbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBDaG9yZFN5bWJvbCBjaG9yZCA9IChDaG9yZFN5bWJvbClzeW1ib2w7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldnRpbWUgPSBNYXRoLk1heChjaG9yZC5FbmRUaW1lLCBwcmV2dGltZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldnRpbWUgPSBNYXRoLk1heChzdGFydHRpbWUsIHByZXZ0aW1lKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFJldHVybiB0aGUgcmVzdCBzeW1ib2xzIG5lZWRlZCB0byBmaWxsIHRoZSB0aW1lIGludGVydmFsIGJldHdlZW5cclxuICAgICAgICAgKiBzdGFydCBhbmQgZW5kLiAgSWYgbm8gcmVzdHMgYXJlIG5lZWRlZCwgcmV0dXJuIG5pbC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlXHJcbiAgICAgICAgUmVzdFN5bWJvbFtdIEdldFJlc3RzKFRpbWVTaWduYXR1cmUgdGltZSwgaW50IHN0YXJ0LCBpbnQgZW5kKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgUmVzdFN5bWJvbFtdIHJlc3VsdDtcclxuICAgICAgICAgICAgUmVzdFN5bWJvbCByMSwgcjI7XHJcblxyXG4gICAgICAgICAgICBpZiAoZW5kIC0gc3RhcnQgPCAwKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgICAgICBOb3RlRHVyYXRpb24gZHVyID0gdGltZS5HZXROb3RlRHVyYXRpb24oZW5kIC0gc3RhcnQpO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGR1cilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uV2hvbGU6XHJcbiAgICAgICAgICAgICAgICBjYXNlIE5vdGVEdXJhdGlvbi5IYWxmOlxyXG4gICAgICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uUXVhcnRlcjpcclxuICAgICAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkVpZ2h0aDpcclxuICAgICAgICAgICAgICAgICAgICByMSA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0LCBkdXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBSZXN0U3ltYm9sW10geyByMSB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uRG90dGVkSGFsZjpcclxuICAgICAgICAgICAgICAgICAgICByMSA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0LCBOb3RlRHVyYXRpb24uSGFsZik7XHJcbiAgICAgICAgICAgICAgICAgICAgcjIgPSBuZXcgUmVzdFN5bWJvbChzdGFydCArIHRpbWUuUXVhcnRlciAqIDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOb3RlRHVyYXRpb24uUXVhcnRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbmV3IFJlc3RTeW1ib2xbXSB7IHIxLCByMiB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSBOb3RlRHVyYXRpb24uRG90dGVkUXVhcnRlcjpcclxuICAgICAgICAgICAgICAgICAgICByMSA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0LCBOb3RlRHVyYXRpb24uUXVhcnRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgcjIgPSBuZXcgUmVzdFN5bWJvbChzdGFydCArIHRpbWUuUXVhcnRlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5vdGVEdXJhdGlvbi5FaWdodGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBSZXN0U3ltYm9sW10geyByMSwgcjIgfTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgTm90ZUR1cmF0aW9uLkRvdHRlZEVpZ2h0aDpcclxuICAgICAgICAgICAgICAgICAgICByMSA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0LCBOb3RlRHVyYXRpb24uRWlnaHRoKTtcclxuICAgICAgICAgICAgICAgICAgICByMiA9IG5ldyBSZXN0U3ltYm9sKHN0YXJ0ICsgdGltZS5RdWFydGVyIC8gMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5vdGVEdXJhdGlvbi5TaXh0ZWVudGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBSZXN0U3ltYm9sW10geyByMSwgcjIgfTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBUaGUgY3VycmVudCBjbGVmIGlzIGFsd2F5cyBzaG93biBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBzdGFmZiwgb25cclxuICAgICAgICAgKiB0aGUgbGVmdCBzaWRlLiAgSG93ZXZlciwgdGhlIGNsZWYgY2FuIGFsc28gY2hhbmdlIGZyb20gbWVhc3VyZSB0byBcclxuICAgICAgICAgKiBtZWFzdXJlLiBXaGVuIGl0IGRvZXMsIGEgQ2xlZiBzeW1ib2wgbXVzdCBiZSBzaG93biB0byBpbmRpY2F0ZSB0aGUgXHJcbiAgICAgICAgICogY2hhbmdlIGluIGNsZWYuICBUaGlzIGZ1bmN0aW9uIGFkZHMgdGhlc2UgQ2xlZiBjaGFuZ2Ugc3ltYm9scy5cclxuICAgICAgICAgKiBUaGlzIGZ1bmN0aW9uIGRvZXMgbm90IGFkZCB0aGUgbWFpbiBDbGVmIFN5bWJvbCB0aGF0IGJlZ2lucyBlYWNoXHJcbiAgICAgICAgICogc3RhZmYuICBUaGF0IGlzIGRvbmUgaW4gdGhlIFN0YWZmKCkgY29udHJ1Y3Rvci5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlXHJcbiAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD4gQWRkQ2xlZkNoYW5nZXMoTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDbGVmTWVhc3VyZXMgY2xlZnMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVGltZVNpZ25hdHVyZSB0aW1lKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIExpc3Q8TXVzaWNTeW1ib2w+IHJlc3VsdCA9IG5ldyBMaXN0PE11c2ljU3ltYm9sPihzeW1ib2xzLkNvdW50KTtcclxuICAgICAgICAgICAgQ2xlZiBwcmV2Y2xlZiA9IGNsZWZzLkdldENsZWYoMCk7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHN5bWJvbCBpbiBzeW1ib2xzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvKiBBIEJhclN5bWJvbCBpbmRpY2F0ZXMgYSBuZXcgbWVhc3VyZSAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHN5bWJvbCBpcyBCYXJTeW1ib2wpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgQ2xlZiBjbGVmID0gY2xlZnMuR2V0Q2xlZihzeW1ib2wuU3RhcnRUaW1lKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2xlZiAhPSBwcmV2Y2xlZilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5BZGQobmV3IENsZWZTeW1ib2woY2xlZiwgc3ltYm9sLlN0YXJ0VGltZSAtIDEsIHRydWUpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldmNsZWYgPSBjbGVmO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmVzdWx0LkFkZChzeW1ib2wpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIE5vdGVzIHdpdGggdGhlIHNhbWUgc3RhcnQgdGltZXMgaW4gZGlmZmVyZW50IHN0YWZmcyBzaG91bGQgYmVcclxuICAgICAgICAgKiB2ZXJ0aWNhbGx5IGFsaWduZWQuICBUaGUgU3ltYm9sV2lkdGhzIGNsYXNzIGlzIHVzZWQgdG8gaGVscCBcclxuICAgICAgICAgKiB2ZXJ0aWNhbGx5IGFsaWduIHN5bWJvbHMuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBGaXJzdCwgZWFjaCB0cmFjayBzaG91bGQgaGF2ZSBhIHN5bWJvbCBmb3IgZXZlcnkgc3RhcnR0aW1lIHRoYXRcclxuICAgICAgICAgKiBhcHBlYXJzIGluIHRoZSBNaWRpIEZpbGUuICBJZiBhIHRyYWNrIGRvZXNuJ3QgaGF2ZSBhIHN5bWJvbCBmb3IgYVxyXG4gICAgICAgICAqIHBhcnRpY3VsYXIgc3RhcnR0aW1lLCB0aGVuIGFkZCBhIFwiYmxhbmtcIiBzeW1ib2wgZm9yIHRoYXQgdGltZS5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIE5leHQsIG1ha2Ugc3VyZSB0aGUgc3ltYm9scyBmb3IgZWFjaCBzdGFydCB0aW1lIGFsbCBoYXZlIHRoZSBzYW1lXHJcbiAgICAgICAgICogd2lkdGgsIGFjcm9zcyBhbGwgdHJhY2tzLiAgVGhlIFN5bWJvbFdpZHRocyBjbGFzcyBzdG9yZXNcclxuICAgICAgICAgKiAtIFRoZSBzeW1ib2wgd2lkdGggZm9yIGVhY2ggc3RhcnR0aW1lLCBmb3IgZWFjaCB0cmFja1xyXG4gICAgICAgICAqIC0gVGhlIG1heGltdW0gc3ltYm9sIHdpZHRoIGZvciBhIGdpdmVuIHN0YXJ0dGltZSwgYWNyb3NzIGFsbCB0cmFja3MuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBUaGUgbWV0aG9kIFN5bWJvbFdpZHRocy5HZXRFeHRyYVdpZHRoKCkgcmV0dXJucyB0aGUgZXh0cmEgd2lkdGhcclxuICAgICAgICAgKiBuZWVkZWQgZm9yIGEgdHJhY2sgdG8gbWF0Y2ggdGhlIG1heGltdW0gc3ltYm9sIHdpZHRoIGZvciBhIGdpdmVuXHJcbiAgICAgICAgICogc3RhcnR0aW1lLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGVcclxuICAgICAgICB2b2lkIEFsaWduU3ltYm9scyhMaXN0PE11c2ljU3ltYm9sPltdIGFsbHN5bWJvbHMsIFN5bWJvbFdpZHRocyB3aWR0aHMsIE1pZGlPcHRpb25zIG9wdGlvbnMpXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgd2Ugc2hvdyBtZWFzdXJlIG51bWJlcnMsIGluY3JlYXNlIGJhciBzeW1ib2wgd2lkdGhcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuc2hvd01lYXN1cmVzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCB0cmFjayA9IDA7IHRyYWNrIDwgYWxsc3ltYm9scy5MZW5ndGg7IHRyYWNrKyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scyA9IGFsbHN5bWJvbHNbdHJhY2tdO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcmVhY2ggKE11c2ljU3ltYm9sIHN5bSBpbiBzeW1ib2xzKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN5bSBpcyBCYXJTeW1ib2wpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN5bS5XaWR0aCArPSBTaGVldE11c2ljLk5vdGVXaWR0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZm9yIChpbnQgdHJhY2sgPSAwOyB0cmFjayA8IGFsbHN5bWJvbHMuTGVuZ3RoOyB0cmFjaysrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzID0gYWxsc3ltYm9sc1t0cmFja107XHJcbiAgICAgICAgICAgICAgICBMaXN0PE11c2ljU3ltYm9sPiByZXN1bHQgPSBuZXcgTGlzdDxNdXNpY1N5bWJvbD4oKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpbnQgaSA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgLyogSWYgYSB0cmFjayBkb2Vzbid0IGhhdmUgYSBzeW1ib2wgZm9yIGEgc3RhcnR0aW1lLFxyXG4gICAgICAgICAgICAgICAgICogYWRkIGEgYmxhbmsgc3ltYm9sLlxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChpbnQgc3RhcnQgaW4gd2lkdGhzLlN0YXJ0VGltZXMpXHJcbiAgICAgICAgICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8qIEJhclN5bWJvbHMgYXJlIG5vdCBpbmNsdWRlZCBpbiB0aGUgU3ltYm9sV2lkdGhzIGNhbGN1bGF0aW9ucyAqL1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgc3ltYm9scy5Db3VudCAmJiAoc3ltYm9sc1tpXSBpcyBCYXJTeW1ib2wpICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN5bWJvbHNbaV0uU3RhcnRUaW1lIDw9IHN0YXJ0KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LkFkZChzeW1ib2xzW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPCBzeW1ib2xzLkNvdW50ICYmIHN5bWJvbHNbaV0uU3RhcnRUaW1lID09IHN0YXJ0KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgc3ltYm9scy5Db3VudCAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ltYm9sc1tpXS5TdGFydFRpbWUgPT0gc3RhcnQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuQWRkKHN5bWJvbHNbaV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5BZGQobmV3IEJsYW5rU3ltYm9sKHN0YXJ0LCAwKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8qIEZvciBlYWNoIHN0YXJ0dGltZSwgaW5jcmVhc2UgdGhlIHN5bWJvbCB3aWR0aCBieVxyXG4gICAgICAgICAgICAgICAgICogU3ltYm9sV2lkdGhzLkdldEV4dHJhV2lkdGgoKS5cclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgaSA9IDA7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoaSA8IHJlc3VsdC5Db3VudClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0W2ldIGlzIEJhclN5bWJvbClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGludCBzdGFydCA9IHJlc3VsdFtpXS5TdGFydFRpbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IGV4dHJhID0gd2lkdGhzLkdldEV4dHJhV2lkdGgodHJhY2ssIHN0YXJ0KTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRbaV0uV2lkdGggKz0gZXh0cmE7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8qIFNraXAgYWxsIHJlbWFpbmluZyBzeW1ib2xzIHdpdGggdGhlIHNhbWUgc3RhcnR0aW1lLiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgcmVzdWx0LkNvdW50ICYmIHJlc3VsdFtpXS5TdGFydFRpbWUgPT0gc3RhcnQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYWxsc3ltYm9sc1t0cmFja10gPSByZXN1bHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGJvb2wgSXNDaG9yZChNdXNpY1N5bWJvbCBzeW1ib2wpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gc3ltYm9sIGlzIENob3JkU3ltYm9sO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBGaW5kIDIsIDMsIDQsIG9yIDYgY2hvcmQgc3ltYm9scyB0aGF0IG9jY3VyIGNvbnNlY3V0aXZlbHkgKHdpdGhvdXQgYW55XHJcbiAgICAgICAgICogIHJlc3RzIG9yIGJhcnMgaW4gYmV0d2VlbikuICBUaGVyZSBjYW4gYmUgQmxhbmtTeW1ib2xzIGluIGJldHdlZW4uXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiAgVGhlIHN0YXJ0SW5kZXggaXMgdGhlIGluZGV4IGluIHRoZSBzeW1ib2xzIHRvIHN0YXJ0IGxvb2tpbmcgZnJvbS5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqICBTdG9yZSB0aGUgaW5kZXhlcyBvZiB0aGUgY29uc2VjdXRpdmUgY2hvcmRzIGluIGNob3JkSW5kZXhlcy5cclxuICAgICAgICAgKiAgU3RvcmUgdGhlIGhvcml6b250YWwgZGlzdGFuY2UgKHBpeGVscykgYmV0d2VlbiB0aGUgZmlyc3QgYW5kIGxhc3QgY2hvcmQuXHJcbiAgICAgICAgICogIElmIHdlIGZhaWxlZCB0byBmaW5kIGNvbnNlY3V0aXZlIGNob3JkcywgcmV0dXJuIGZhbHNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGJvb2xcclxuICAgICAgICBGaW5kQ29uc2VjdXRpdmVDaG9yZHMoTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scywgVGltZVNpZ25hdHVyZSB0aW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnQgc3RhcnRJbmRleCwgaW50W10gY2hvcmRJbmRleGVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWYgaW50IGhvcml6RGlzdGFuY2UpXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgaW50IGkgPSBzdGFydEluZGV4O1xyXG4gICAgICAgICAgICBpbnQgbnVtQ2hvcmRzID0gY2hvcmRJbmRleGVzLkxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlICh0cnVlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBob3JpekRpc3RhbmNlID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICAvKiBGaW5kIHRoZSBzdGFydGluZyBjaG9yZCAqL1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGkgPCBzeW1ib2xzLkNvdW50IC0gbnVtQ2hvcmRzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzeW1ib2xzW2ldIGlzIENob3JkU3ltYm9sKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgQ2hvcmRTeW1ib2wgYyA9IChDaG9yZFN5bWJvbClzeW1ib2xzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYy5TdGVtICE9IG51bGwpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChpID49IHN5bWJvbHMuQ291bnQgLSBudW1DaG9yZHMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hvcmRJbmRleGVzWzBdID0gLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2hvcmRJbmRleGVzWzBdID0gaTtcclxuICAgICAgICAgICAgICAgIGJvb2wgZm91bmRDaG9yZHMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgY2hvcmRJbmRleCA9IDE7IGNob3JkSW5kZXggPCBudW1DaG9yZHM7IGNob3JkSW5kZXgrKylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IHJlbWFpbmluZyA9IG51bUNob3JkcyAtIDEgLSBjaG9yZEluZGV4O1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlICgoaSA8IHN5bWJvbHMuQ291bnQgLSByZW1haW5pbmcpICYmIChzeW1ib2xzW2ldIGlzIEJsYW5rU3ltYm9sKSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvcml6RGlzdGFuY2UgKz0gc3ltYm9sc1tpXS5XaWR0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaSA+PSBzeW1ib2xzLkNvdW50IC0gcmVtYWluaW5nKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIShzeW1ib2xzW2ldIGlzIENob3JkU3ltYm9sKSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kQ2hvcmRzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjaG9yZEluZGV4ZXNbY2hvcmRJbmRleF0gPSBpO1xyXG4gICAgICAgICAgICAgICAgICAgIGhvcml6RGlzdGFuY2UgKz0gc3ltYm9sc1tpXS5XaWR0aDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChmb3VuZENob3JkcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvKiBFbHNlLCBzdGFydCBzZWFyY2hpbmcgYWdhaW4gZnJvbSBpbmRleCBpICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogQ29ubmVjdCBjaG9yZHMgb2YgdGhlIHNhbWUgZHVyYXRpb24gd2l0aCBhIGhvcml6b250YWwgYmVhbS5cclxuICAgICAgICAgKiAgbnVtQ2hvcmRzIGlzIHRoZSBudW1iZXIgb2YgY2hvcmRzIHBlciBiZWFtICgyLCAzLCA0LCBvciA2KS5cclxuICAgICAgICAgKiAgaWYgc3RhcnRCZWF0IGlzIHRydWUsIHRoZSBmaXJzdCBjaG9yZCBtdXN0IHN0YXJ0IG9uIGEgcXVhcnRlciBub3RlIGJlYXQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZFxyXG4gICAgICAgIENyZWF0ZUJlYW1lZENob3JkcyhMaXN0PE11c2ljU3ltYm9sPltdIGFsbHN5bWJvbHMsIFRpbWVTaWduYXR1cmUgdGltZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50IG51bUNob3JkcywgYm9vbCBzdGFydEJlYXQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbnRbXSBjaG9yZEluZGV4ZXMgPSBuZXcgaW50W251bUNob3Jkc107XHJcbiAgICAgICAgICAgIENob3JkU3ltYm9sW10gY2hvcmRzID0gbmV3IENob3JkU3ltYm9sW251bUNob3Jkc107XHJcblxyXG4gICAgICAgICAgICBmb3JlYWNoIChMaXN0PE11c2ljU3ltYm9sPiBzeW1ib2xzIGluIGFsbHN5bWJvbHMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGludCBzdGFydEluZGV4ID0gMDtcclxuICAgICAgICAgICAgICAgIHdoaWxlICh0cnVlKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBob3JpekRpc3RhbmNlID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBib29sIGZvdW5kID0gRmluZENvbnNlY3V0aXZlQ2hvcmRzKHN5bWJvbHMsIHRpbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydEluZGV4LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hvcmRJbmRleGVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmIGhvcml6RGlzdGFuY2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghZm91bmQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBudW1DaG9yZHM7IGkrKylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNob3Jkc1tpXSA9IChDaG9yZFN5bWJvbClzeW1ib2xzW2Nob3JkSW5kZXhlc1tpXV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoQ2hvcmRTeW1ib2wuQ2FuQ3JlYXRlQmVhbShjaG9yZHMsIHRpbWUsIHN0YXJ0QmVhdCkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBDaG9yZFN5bWJvbC5DcmVhdGVCZWFtKGNob3JkcywgaG9yaXpEaXN0YW5jZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0SW5kZXggPSBjaG9yZEluZGV4ZXNbbnVtQ2hvcmRzIC0gMV0gKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydEluZGV4ID0gY2hvcmRJbmRleGVzWzBdICsgMTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8qIFdoYXQgaXMgdGhlIHZhbHVlIG9mIHN0YXJ0SW5kZXggaGVyZT9cclxuICAgICAgICAgICAgICAgICAgICAgKiBJZiB3ZSBjcmVhdGVkIGEgYmVhbSwgd2Ugc3RhcnQgYWZ0ZXIgdGhlIGxhc3QgY2hvcmQuXHJcbiAgICAgICAgICAgICAgICAgICAgICogSWYgd2UgZmFpbGVkIHRvIGNyZWF0ZSBhIGJlYW0sIHdlIHN0YXJ0IGFmdGVyIHRoZSBmaXJzdCBjaG9yZC5cclxuICAgICAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKiBDb25uZWN0IGNob3JkcyBvZiB0aGUgc2FtZSBkdXJhdGlvbiB3aXRoIGEgaG9yaXpvbnRhbCBiZWFtLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogIFdlIGNyZWF0ZSBiZWFtcyBpbiB0aGUgZm9sbG93aW5nIG9yZGVyOlxyXG4gICAgICAgICAqICAtIDYgY29ubmVjdGVkIDh0aCBub3RlIGNob3JkcywgaW4gMy80LCA2LzgsIG9yIDYvNCB0aW1lXHJcbiAgICAgICAgICogIC0gVHJpcGxldHMgdGhhdCBzdGFydCBvbiBxdWFydGVyIG5vdGUgYmVhdHNcclxuICAgICAgICAgKiAgLSAzIGNvbm5lY3RlZCBjaG9yZHMgdGhhdCBzdGFydCBvbiBxdWFydGVyIG5vdGUgYmVhdHMgKDEyLzggdGltZSBvbmx5KVxyXG4gICAgICAgICAqICAtIDQgY29ubmVjdGVkIGNob3JkcyB0aGF0IHN0YXJ0IG9uIHF1YXJ0ZXIgbm90ZSBiZWF0cyAoNC80IG9yIDIvNCB0aW1lIG9ubHkpXHJcbiAgICAgICAgICogIC0gMiBjb25uZWN0ZWQgY2hvcmRzIHRoYXQgc3RhcnQgb24gcXVhcnRlciBub3RlIGJlYXRzXHJcbiAgICAgICAgICogIC0gMiBjb25uZWN0ZWQgY2hvcmRzIHRoYXQgc3RhcnQgb24gYW55IGJlYXRcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkXHJcbiAgICAgICAgQ3JlYXRlQWxsQmVhbWVkQ2hvcmRzKExpc3Q8TXVzaWNTeW1ib2w+W10gYWxsc3ltYm9scywgVGltZVNpZ25hdHVyZSB0aW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCh0aW1lLk51bWVyYXRvciA9PSAzICYmIHRpbWUuRGVub21pbmF0b3IgPT0gNCkgfHxcclxuICAgICAgICAgICAgICAgICh0aW1lLk51bWVyYXRvciA9PSA2ICYmIHRpbWUuRGVub21pbmF0b3IgPT0gOCkgfHxcclxuICAgICAgICAgICAgICAgICh0aW1lLk51bWVyYXRvciA9PSA2ICYmIHRpbWUuRGVub21pbmF0b3IgPT0gNCkpXHJcbiAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICBDcmVhdGVCZWFtZWRDaG9yZHMoYWxsc3ltYm9scywgdGltZSwgNiwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgQ3JlYXRlQmVhbWVkQ2hvcmRzKGFsbHN5bWJvbHMsIHRpbWUsIDMsIHRydWUpO1xyXG4gICAgICAgICAgICBDcmVhdGVCZWFtZWRDaG9yZHMoYWxsc3ltYm9scywgdGltZSwgNCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIENyZWF0ZUJlYW1lZENob3JkcyhhbGxzeW1ib2xzLCB0aW1lLCAyLCB0cnVlKTtcclxuICAgICAgICAgICAgQ3JlYXRlQmVhbWVkQ2hvcmRzKGFsbHN5bWJvbHMsIHRpbWUsIDIsIGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBHZXQgdGhlIHdpZHRoIChpbiBwaXhlbHMpIG5lZWRlZCB0byBkaXNwbGF5IHRoZSBrZXkgc2lnbmF0dXJlICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBpbnRcclxuICAgICAgICBLZXlTaWduYXR1cmVXaWR0aChLZXlTaWduYXR1cmUga2V5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQ2xlZlN5bWJvbCBjbGVmc3ltID0gbmV3IENsZWZTeW1ib2woQ2xlZi5UcmVibGUsIDAsIGZhbHNlKTtcclxuICAgICAgICAgICAgaW50IHJlc3VsdCA9IGNsZWZzeW0uTWluV2lkdGg7XHJcbiAgICAgICAgICAgIEFjY2lkU3ltYm9sW10ga2V5cyA9IGtleS5HZXRTeW1ib2xzKENsZWYuVHJlYmxlKTtcclxuICAgICAgICAgICAgZm9yZWFjaCAoQWNjaWRTeW1ib2wgc3ltYm9sIGluIGtleXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBzeW1ib2wuTWluV2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdCArIFNoZWV0TXVzaWMuTGVmdE1hcmdpbiArIDU7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIEdpdmVuIE11c2ljU3ltYm9scyBmb3IgYSB0cmFjaywgY3JlYXRlIHRoZSBzdGFmZnMgZm9yIHRoYXQgdHJhY2suXHJcbiAgICAgICAgICogIEVhY2ggU3RhZmYgaGFzIGEgbWF4bWltdW0gd2lkdGggb2YgUGFnZVdpZHRoICg4MDAgcGl4ZWxzKS5cclxuICAgICAgICAgKiAgQWxzbywgbWVhc3VyZXMgc2hvdWxkIG5vdCBzcGFuIG11bHRpcGxlIFN0YWZmcy5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIExpc3Q8U3RhZmY+XHJcbiAgICAgICAgQ3JlYXRlU3RhZmZzRm9yVHJhY2soTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scywgaW50IG1lYXN1cmVsZW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgS2V5U2lnbmF0dXJlIGtleSwgTWlkaU9wdGlvbnMgb3B0aW9ucyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnQgdHJhY2ssIGludCB0b3RhbHRyYWNrcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGludCBrZXlzaWdXaWR0aCA9IEtleVNpZ25hdHVyZVdpZHRoKGtleSk7XHJcbiAgICAgICAgICAgIGludCBzdGFydGluZGV4ID0gMDtcclxuICAgICAgICAgICAgTGlzdDxTdGFmZj4gdGhlc3RhZmZzID0gbmV3IExpc3Q8U3RhZmY+KHN5bWJvbHMuQ291bnQgLyA1MCk7XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAoc3RhcnRpbmRleCA8IHN5bWJvbHMuQ291bnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIC8qIHN0YXJ0aW5kZXggaXMgdGhlIGluZGV4IG9mIHRoZSBmaXJzdCBzeW1ib2wgaW4gdGhlIHN0YWZmLlxyXG4gICAgICAgICAgICAgICAgICogZW5kaW5kZXggaXMgdGhlIGluZGV4IG9mIHRoZSBsYXN0IHN5bWJvbCBpbiB0aGUgc3RhZmYuXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGludCBlbmRpbmRleCA9IHN0YXJ0aW5kZXg7XHJcbiAgICAgICAgICAgICAgICBpbnQgd2lkdGggPSBrZXlzaWdXaWR0aDtcclxuICAgICAgICAgICAgICAgIGludCBtYXh3aWR0aDtcclxuXHJcbiAgICAgICAgICAgICAgICAvKiBJZiB3ZSdyZSBzY3JvbGxpbmcgdmVydGljYWxseSwgdGhlIG1heGltdW0gd2lkdGggaXMgUGFnZVdpZHRoLiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHNjcm9sbFZlcnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF4d2lkdGggPSBTaGVldE11c2ljLlBhZ2VXaWR0aDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXh3aWR0aCA9IDIwMDAwMDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGVuZGluZGV4IDwgc3ltYm9scy5Db3VudCAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgIHdpZHRoICsgc3ltYm9sc1tlbmRpbmRleF0uV2lkdGggPCBtYXh3aWR0aClcclxuICAgICAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggKz0gc3ltYm9sc1tlbmRpbmRleF0uV2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5kaW5kZXgrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVuZGluZGV4LS07XHJcblxyXG4gICAgICAgICAgICAgICAgLyogVGhlcmUncyAzIHBvc3NpYmlsaXRpZXMgYXQgdGhpcyBwb2ludDpcclxuICAgICAgICAgICAgICAgICAqIDEuIFdlIGhhdmUgYWxsIHRoZSBzeW1ib2xzIGluIHRoZSB0cmFjay5cclxuICAgICAgICAgICAgICAgICAqICAgIFRoZSBlbmRpbmRleCBzdGF5cyB0aGUgc2FtZS5cclxuICAgICAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAgICAgKiAyLiBXZSBoYXZlIHN5bWJvbHMgZm9yIGxlc3MgdGhhbiBvbmUgbWVhc3VyZS5cclxuICAgICAgICAgICAgICAgICAqICAgIFRoZSBlbmRpbmRleCBzdGF5cyB0aGUgc2FtZS5cclxuICAgICAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAgICAgKiAzLiBXZSBoYXZlIHN5bWJvbHMgZm9yIDEgb3IgbW9yZSBtZWFzdXJlcy5cclxuICAgICAgICAgICAgICAgICAqICAgIFNpbmNlIG1lYXN1cmVzIGNhbm5vdCBzcGFuIG11bHRpcGxlIHN0YWZmcywgd2UgbXVzdFxyXG4gICAgICAgICAgICAgICAgICogICAgbWFrZSBzdXJlIGVuZGluZGV4IGRvZXMgbm90IG9jY3VyIGluIHRoZSBtaWRkbGUgb2YgYVxyXG4gICAgICAgICAgICAgICAgICogICAgbWVhc3VyZS4gIFdlIGNvdW50IGJhY2t3YXJkcyB1bnRpbCB3ZSBjb21lIHRvIHRoZSBlbmRcclxuICAgICAgICAgICAgICAgICAqICAgIG9mIGEgbWVhc3VyZS5cclxuICAgICAgICAgICAgICAgICAqL1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChlbmRpbmRleCA9PSBzeW1ib2xzLkNvdW50IC0gMSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBlbmRpbmRleCBzdGF5cyB0aGUgc2FtZSAqL1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc3ltYm9sc1tzdGFydGluZGV4XS5TdGFydFRpbWUgLyBtZWFzdXJlbGVuID09XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBzeW1ib2xzW2VuZGluZGV4XS5TdGFydFRpbWUgLyBtZWFzdXJlbGVuKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGVuZGluZGV4IHN0YXlzIHRoZSBzYW1lICovXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IGVuZG1lYXN1cmUgPSBzeW1ib2xzW2VuZGluZGV4ICsgMV0uU3RhcnRUaW1lIC8gbWVhc3VyZWxlbjtcclxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoc3ltYm9sc1tlbmRpbmRleF0uU3RhcnRUaW1lIC8gbWVhc3VyZWxlbiA9PVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBlbmRtZWFzdXJlKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kaW5kZXgtLTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpbnQgcmFuZ2UgPSBlbmRpbmRleCArIDEgLSBzdGFydGluZGV4O1xyXG4gICAgICAgICAgICAgICAgaWYgKHNjcm9sbFZlcnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSBTaGVldE11c2ljLlBhZ2VXaWR0aDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFN0YWZmIHN0YWZmID0gbmV3IFN0YWZmKHN5bWJvbHMuR2V0UmFuZ2Uoc3RhcnRpbmRleCwgcmFuZ2UpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5LCBvcHRpb25zLCB0cmFjaywgdG90YWx0cmFja3MpO1xyXG4gICAgICAgICAgICAgICAgdGhlc3RhZmZzLkFkZChzdGFmZik7XHJcbiAgICAgICAgICAgICAgICBzdGFydGluZGV4ID0gZW5kaW5kZXggKyAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGVzdGFmZnM7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIEdpdmVuIGFsbCB0aGUgTXVzaWNTeW1ib2xzIGZvciBldmVyeSB0cmFjaywgY3JlYXRlIHRoZSBzdGFmZnNcclxuICAgICAgICAgKiBmb3IgdGhlIHNoZWV0IG11c2ljLiAgVGhlcmUgYXJlIHR3byBwYXJ0cyB0byB0aGlzOlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogLSBHZXQgdGhlIGxpc3Qgb2Ygc3RhZmZzIGZvciBlYWNoIHRyYWNrLlxyXG4gICAgICAgICAqICAgVGhlIHN0YWZmcyB3aWxsIGJlIHN0b3JlZCBpbiB0cmFja3N0YWZmcyBhczpcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqICAgdHJhY2tzdGFmZnNbMF0gPSB7IFN0YWZmMCwgU3RhZmYxLCBTdGFmZjIsIC4uLiB9IGZvciB0cmFjayAwXHJcbiAgICAgICAgICogICB0cmFja3N0YWZmc1sxXSA9IHsgU3RhZmYwLCBTdGFmZjEsIFN0YWZmMiwgLi4uIH0gZm9yIHRyYWNrIDFcclxuICAgICAgICAgKiAgIHRyYWNrc3RhZmZzWzJdID0geyBTdGFmZjAsIFN0YWZmMSwgU3RhZmYyLCAuLi4gfSBmb3IgdHJhY2sgMlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogLSBTdG9yZSB0aGUgU3RhZmZzIGluIHRoZSBzdGFmZnMgbGlzdCwgYnV0IGludGVybGVhdmUgdGhlXHJcbiAgICAgICAgICogICB0cmFja3MgYXMgZm9sbG93czpcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqICAgc3RhZmZzID0geyBTdGFmZjAgZm9yIHRyYWNrIDAsIFN0YWZmMCBmb3IgdHJhY2sxLCBTdGFmZjAgZm9yIHRyYWNrMixcclxuICAgICAgICAgKiAgICAgICAgICAgICAgU3RhZmYxIGZvciB0cmFjayAwLCBTdGFmZjEgZm9yIHRyYWNrMSwgU3RhZmYxIGZvciB0cmFjazIsXHJcbiAgICAgICAgICogICAgICAgICAgICAgIFN0YWZmMiBmb3IgdHJhY2sgMCwgU3RhZmYyIGZvciB0cmFjazEsIFN0YWZmMiBmb3IgdHJhY2syLFxyXG4gICAgICAgICAqICAgICAgICAgICAgICAuLi4gfSBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIExpc3Q8U3RhZmY+XHJcbiAgICAgICAgQ3JlYXRlU3RhZmZzKExpc3Q8TXVzaWNTeW1ib2w+W10gYWxsc3ltYm9scywgS2V5U2lnbmF0dXJlIGtleSxcclxuICAgICAgICAgICAgICAgICAgICAgTWlkaU9wdGlvbnMgb3B0aW9ucywgaW50IG1lYXN1cmVsZW4pXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgTGlzdDxTdGFmZj5bXSB0cmFja3N0YWZmcyA9IG5ldyBMaXN0PFN0YWZmPlthbGxzeW1ib2xzLkxlbmd0aF07XHJcbiAgICAgICAgICAgIGludCB0b3RhbHRyYWNrcyA9IHRyYWNrc3RhZmZzLkxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIGZvciAoaW50IHRyYWNrID0gMDsgdHJhY2sgPCB0b3RhbHRyYWNrczsgdHJhY2srKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTGlzdDxNdXNpY1N5bWJvbD4gc3ltYm9scyA9IGFsbHN5bWJvbHNbdHJhY2tdO1xyXG4gICAgICAgICAgICAgICAgdHJhY2tzdGFmZnNbdHJhY2tdID0gQ3JlYXRlU3RhZmZzRm9yVHJhY2soc3ltYm9scywgbWVhc3VyZWxlbiwga2V5LCBvcHRpb25zLCB0cmFjaywgdG90YWx0cmFja3MpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvKiBVcGRhdGUgdGhlIEVuZFRpbWUgb2YgZWFjaCBTdGFmZi4gRW5kVGltZSBpcyB1c2VkIGZvciBwbGF5YmFjayAqL1xyXG4gICAgICAgICAgICBmb3JlYWNoIChMaXN0PFN0YWZmPiBsaXN0IGluIHRyYWNrc3RhZmZzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IGxpc3QuQ291bnQgLSAxOyBpKyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGlzdFtpXS5FbmRUaW1lID0gbGlzdFtpICsgMV0uU3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvKiBJbnRlcmxlYXZlIHRoZSBzdGFmZnMgb2YgZWFjaCB0cmFjayBpbnRvIHRoZSByZXN1bHQgYXJyYXkuICovXHJcbiAgICAgICAgICAgIGludCBtYXhzdGFmZnMgPSAwO1xyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHRyYWNrc3RhZmZzLkxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWF4c3RhZmZzIDwgdHJhY2tzdGFmZnNbaV0uQ291bnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF4c3RhZmZzID0gdHJhY2tzdGFmZnNbaV0uQ291bnQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgTGlzdDxTdGFmZj4gcmVzdWx0ID0gbmV3IExpc3Q8U3RhZmY+KG1heHN0YWZmcyAqIHRyYWNrc3RhZmZzLkxlbmd0aCk7XHJcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgbWF4c3RhZmZzOyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKExpc3Q8U3RhZmY+IGxpc3QgaW4gdHJhY2tzdGFmZnMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPCBsaXN0LkNvdW50KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LkFkZChsaXN0W2ldKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBHZXQgdGhlIGx5cmljcyBmb3IgZWFjaCB0cmFjayAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIExpc3Q8THlyaWNTeW1ib2w+W11cclxuICAgICAgICBHZXRMeXJpY3MoTGlzdDxNaWRpVHJhY2s+IHRyYWNrcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGJvb2wgaGFzTHlyaWNzID0gZmFsc2U7XHJcbiAgICAgICAgICAgIExpc3Q8THlyaWNTeW1ib2w+W10gcmVzdWx0ID0gbmV3IExpc3Q8THlyaWNTeW1ib2w+W3RyYWNrcy5Db3VudF07XHJcbiAgICAgICAgICAgIGZvciAoaW50IHRyYWNrbnVtID0gMDsgdHJhY2tudW0gPCB0cmFja3MuQ291bnQ7IHRyYWNrbnVtKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIE1pZGlUcmFjayB0cmFjayA9IHRyYWNrc1t0cmFja251bV07XHJcbiAgICAgICAgICAgICAgICBpZiAodHJhY2suTHlyaWNzID09IG51bGwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBoYXNMeXJpY3MgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0W3RyYWNrbnVtXSA9IG5ldyBMaXN0PEx5cmljU3ltYm9sPigpO1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTWlkaUV2ZW50IGV2IGluIHRyYWNrLkx5cmljcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBTdHJpbmcgdGV4dCA9IFVURjhFbmNvZGluZy5VVEY4LkdldFN0cmluZyhldi5WYWx1ZSwgMCwgZXYuVmFsdWUuTGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgICAgICBMeXJpY1N5bWJvbCBzeW0gPSBuZXcgTHlyaWNTeW1ib2woZXYuU3RhcnRUaW1lLCB0ZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRbdHJhY2tudW1dLkFkZChzeW0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghaGFzTHlyaWNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBBZGQgdGhlIGx5cmljIHN5bWJvbHMgdG8gdGhlIGNvcnJlc3BvbmRpbmcgc3RhZmZzICovXHJcbiAgICAgICAgc3RhdGljIHZvaWRcclxuICAgICAgICBBZGRMeXJpY3NUb1N0YWZmcyhMaXN0PFN0YWZmPiBzdGFmZnMsIExpc3Q8THlyaWNTeW1ib2w+W10gdHJhY2tseXJpY3MpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3JlYWNoIChTdGFmZiBzdGFmZiBpbiBzdGFmZnMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIExpc3Q8THlyaWNTeW1ib2w+IGx5cmljcyA9IHRyYWNrbHlyaWNzW3N0YWZmLlRyYWNrXTtcclxuICAgICAgICAgICAgICAgIHN0YWZmLkFkZEx5cmljcyhseXJpY3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIFNldCB0aGUgem9vbSBsZXZlbCB0byBkaXNwbGF5IGF0ICgxLjAgPT0gMTAwJSkuXHJcbiAgICAgICAgICogUmVjYWxjdWxhdGUgdGhlIFNoZWV0TXVzaWMgd2lkdGggYW5kIGhlaWdodCBiYXNlZCBvbiB0aGVcclxuICAgICAgICAgKiB6b29tIGxldmVsLiAgVGhlbiByZWRyYXcgdGhlIFNoZWV0TXVzaWMuIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyB2b2lkIFNldFpvb20oZmxvYXQgdmFsdWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB6b29tID0gdmFsdWU7XHJcbiAgICAgICAgICAgIGZsb2F0IHdpZHRoID0gMDtcclxuICAgICAgICAgICAgZmxvYXQgaGVpZ2h0ID0gMDtcclxuICAgICAgICAgICAgZm9yZWFjaCAoU3RhZmYgc3RhZmYgaW4gc3RhZmZzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB3aWR0aCA9IE1hdGguTWF4KHdpZHRoLCBzdGFmZi5XaWR0aCAqIHpvb20pO1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ICs9IChzdGFmZi5IZWlnaHQgKiB6b29tKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBXaWR0aCA9IChpbnQpKHdpZHRoICsgMik7XHJcbiAgICAgICAgICAgIEhlaWdodCA9ICgoaW50KWhlaWdodCkgKyBMZWZ0TWFyZ2luO1xyXG4gICAgICAgICAgICB0aGlzLkludmFsaWRhdGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBDaGFuZ2UgdGhlIG5vdGUgY29sb3JzIGZvciB0aGUgc2hlZXQgbXVzaWMsIGFuZCByZWRyYXcuICovXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIFNldENvbG9ycyhDb2xvcltdIG5ld2NvbG9ycywgQ29sb3IgbmV3c2hhZGUsIENvbG9yIG5ld3NoYWRlMilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChOb3RlQ29sb3JzID09IG51bGwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIE5vdGVDb2xvcnMgPSBuZXcgQ29sb3JbMTJdO1xyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCAxMjsgaSsrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIE5vdGVDb2xvcnNbaV0gPSBDb2xvci5CbGFjaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobmV3Y29sb3JzICE9IG51bGwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgMTI7IGkrKylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBOb3RlQ29sb3JzW2ldID0gbmV3Y29sb3JzW2ldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCAxMjsgaSsrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIE5vdGVDb2xvcnNbaV0gPSBDb2xvci5CbGFjaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoc2hhZGVCcnVzaCAhPSBudWxsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzaGFkZUJydXNoLkRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgICAgIHNoYWRlMkJydXNoLkRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzaGFkZUJydXNoID0gbmV3IFNvbGlkQnJ1c2gobmV3c2hhZGUpO1xyXG4gICAgICAgICAgICBzaGFkZTJCcnVzaCA9IG5ldyBTb2xpZEJydXNoKG5ld3NoYWRlMik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogR2V0IHRoZSBjb2xvciBmb3IgYSBnaXZlbiBub3RlIG51bWJlciAqL1xyXG4gICAgICAgIHB1YmxpYyBDb2xvciBOb3RlQ29sb3IoaW50IG51bWJlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiBOb3RlQ29sb3JzW05vdGVTY2FsZS5Gcm9tTnVtYmVyKG51bWJlcildO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIEdldCB0aGUgc2hhZGUgYnJ1c2ggKi9cclxuICAgICAgICBwdWJsaWMgQnJ1c2ggU2hhZGVCcnVzaFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIHNoYWRlQnJ1c2g7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBHZXQgdGhlIHNoYWRlMiBicnVzaCAqL1xyXG4gICAgICAgIHB1YmxpYyBCcnVzaCBTaGFkZTJCcnVzaFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIHNoYWRlMkJydXNoOyB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogR2V0IHdoZXRoZXIgdG8gc2hvdyBub3RlIGxldHRlcnMgb3Igbm90ICovXHJcbiAgICAgICAgcHVibGljIGludCBTaG93Tm90ZUxldHRlcnNcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGdldCB7IHJldHVybiBzaG93Tm90ZUxldHRlcnM7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBHZXQgdGhlIG1haW4ga2V5IHNpZ25hdHVyZSAqL1xyXG4gICAgICAgIHB1YmxpYyBLZXlTaWduYXR1cmUgTWFpbktleVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0IHsgcmV0dXJuIG1haW5rZXk7IH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKiogU2V0IHRoZSBzaXplIG9mIHRoZSBub3RlcywgbGFyZ2Ugb3Igc21hbGwuICBTbWFsbGVyIG5vdGVzIG1lYW5zXHJcbiAgICAgICAgICogbW9yZSBub3RlcyBwZXIgc3RhZmYuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB2b2lkIFNldE5vdGVTaXplKGJvb2wgbGFyZ2Vub3RlcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChsYXJnZW5vdGVzKVxyXG4gICAgICAgICAgICAgICAgTGluZVNwYWNlID0gNztcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgTGluZVNwYWNlID0gNTtcclxuXHJcbiAgICAgICAgICAgIFN0YWZmSGVpZ2h0ID0gTGluZVNwYWNlICogNCArIExpbmVXaWR0aCAqIDU7XHJcbiAgICAgICAgICAgIE5vdGVIZWlnaHQgPSBMaW5lU3BhY2UgKyBMaW5lV2lkdGg7XHJcbiAgICAgICAgICAgIE5vdGVXaWR0aCA9IDMgKiBMaW5lU3BhY2UgLyAyO1xyXG4gICAgICAgICAgICBMZXR0ZXJGb250ID0gbmV3IEZvbnQoXCJBcmlhbFwiLCA4LCBGb250U3R5bGUuUmVndWxhcik7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqIERyYXcgdGhlIFNoZWV0TXVzaWMuXHJcbiAgICAgICAgICogU2NhbGUgdGhlIGdyYXBoaWNzIGJ5IHRoZSBjdXJyZW50IHpvb20gZmFjdG9yLlxyXG4gICAgICAgICAqIEdldCB0aGUgdmVydGljYWwgc3RhcnQgYW5kIGVuZCBwb2ludHMgb2YgdGhlIGNsaXAgYXJlYS5cclxuICAgICAgICAgKiBPbmx5IGRyYXcgU3RhZmZzIHdoaWNoIGxpZSBpbnNpZGUgdGhlIGNsaXAgYXJlYS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwcm90ZWN0ZWQgLypvdmVycmlkZSovIHZvaWQgT25QYWludChQYWludEV2ZW50QXJncyBlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgUmVjdGFuZ2xlIGNsaXAgPVxyXG4gICAgICAgICAgICAgIG5ldyBSZWN0YW5nbGUoKGludCkoZS5DbGlwUmVjdGFuZ2xlLlggLyB6b29tKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChpbnQpKGUuQ2xpcFJlY3RhbmdsZS5ZIC8gem9vbSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoaW50KShlLkNsaXBSZWN0YW5nbGUuV2lkdGggLyB6b29tKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChpbnQpKGUuQ2xpcFJlY3RhbmdsZS5IZWlnaHQgLyB6b29tKSk7XHJcblxyXG4gICAgICAgICAgICBHcmFwaGljcyBnID0gZS5HcmFwaGljcygpO1xyXG4gICAgICAgICAgICBnLlNjYWxlVHJhbnNmb3JtKHpvb20sIHpvb20pO1xyXG4gICAgICAgICAgICAvKiBnLlBhZ2VTY2FsZSA9IHpvb207ICovXHJcbiAgICAgICAgICAgIGcuU21vb3RoaW5nTW9kZSA9IFNtb290aGluZ01vZGUuQW50aUFsaWFzO1xyXG4gICAgICAgICAgICBpbnQgeXBvcyA9IDA7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKFN0YWZmIHN0YWZmIGluIHN0YWZmcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKCh5cG9zICsgc3RhZmYuSGVpZ2h0IDwgY2xpcC5ZKSB8fCAoeXBvcyA+IGNsaXAuWSArIGNsaXAuSGVpZ2h0KSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBTdGFmZiBpcyBub3QgaW4gdGhlIGNsaXAsIGRvbid0IG5lZWQgdG8gZHJhdyBpdCAqL1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKDAsIHlwb3MpO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YWZmLkRyYXcoZywgY2xpcCwgcGVuLCBTZWxlY3Rpb25TdGFydFB1bHNlLCBTZWxlY3Rpb25FbmRQdWxzZSwgZGVzZWxlY3RlZFNoYWRlQnJ1c2gpO1xyXG4gICAgICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKDAsIC15cG9zKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB5cG9zICs9IHN0YWZmLkhlaWdodDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBnLlNjYWxlVHJhbnNmb3JtKDEuMGYgLyB6b29tLCAxLjBmIC8gem9vbSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogV3JpdGUgdGhlIE1JREkgZmlsZW5hbWUgYXQgdGhlIHRvcCBvZiB0aGUgcGFnZSAqL1xyXG4gICAgICAgIHByaXZhdGUgdm9pZCBEcmF3VGl0bGUoR3JhcGhpY3MgZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGludCBsZWZ0bWFyZ2luID0gMjA7XHJcbiAgICAgICAgICAgIGludCB0b3BtYXJnaW4gPSAyMDtcclxuICAgICAgICAgICAgc3RyaW5nIHRpdGxlID0gUGF0aC5HZXRGaWxlTmFtZShmaWxlbmFtZSk7XHJcbiAgICAgICAgICAgIHRpdGxlID0gdGl0bGUuUmVwbGFjZShcIi5taWRcIiwgXCJcIikuUmVwbGFjZShcIl9cIiwgXCIgXCIpO1xyXG4gICAgICAgICAgICBGb250IGZvbnQgPSBuZXcgRm9udChcIkFyaWFsXCIsIDEwLCBGb250U3R5bGUuQm9sZCk7XHJcbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKGxlZnRtYXJnaW4sIHRvcG1hcmdpbik7XHJcbiAgICAgICAgICAgIGcuRHJhd1N0cmluZyh0aXRsZSwgZm9udCwgQnJ1c2hlcy5CbGFjaywgMCwgMCk7XHJcbiAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKC1sZWZ0bWFyZ2luLCAtdG9wbWFyZ2luKTtcclxuICAgICAgICAgICAgZm9udC5EaXNwb3NlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm4gdGhlIG51bWJlciBvZiBwYWdlcyBuZWVkZWQgdG8gcHJpbnQgdGhpcyBzaGVldCBtdXNpYy5cclxuICAgICAgICAgKiBBIHN0YWZmIHNob3VsZCBmaXQgd2l0aGluIGEgc2luZ2xlIHBhZ2UsIG5vdCBiZSBzcGxpdCBhY3Jvc3MgdHdvIHBhZ2VzLlxyXG4gICAgICAgICAqIElmIHRoZSBzaGVldCBtdXNpYyBoYXMgZXhhY3RseSAyIHRyYWNrcywgdGhlbiB0d28gc3RhZmZzIHNob3VsZFxyXG4gICAgICAgICAqIGZpdCB3aXRoaW4gYSBzaW5nbGUgcGFnZSwgYW5kIG5vdCBiZSBzcGxpdCBhY3Jvc3MgdHdvIHBhZ2VzLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBpbnQgR2V0VG90YWxQYWdlcygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbnQgbnVtID0gMTtcclxuICAgICAgICAgICAgaW50IGN1cnJoZWlnaHQgPSBUaXRsZUhlaWdodDtcclxuXHJcbiAgICAgICAgICAgIGlmIChudW10cmFja3MgPT0gMiAmJiAoc3RhZmZzLkNvdW50ICUgMikgPT0gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBzdGFmZnMuQ291bnQ7IGkgKz0gMilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnQgaGVpZ2h0cyA9IHN0YWZmc1tpXS5IZWlnaHQgKyBzdGFmZnNbaSArIDFdLkhlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmhlaWdodCArIGhlaWdodHMgPiBQYWdlSGVpZ2h0KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbnVtKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJoZWlnaHQgPSBoZWlnaHRzO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyaGVpZ2h0ICs9IGhlaWdodHM7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoU3RhZmYgc3RhZmYgaW4gc3RhZmZzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyaGVpZ2h0ICsgc3RhZmYuSGVpZ2h0ID4gUGFnZUhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bSsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyaGVpZ2h0ID0gc3RhZmYuSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyaGVpZ2h0ICs9IHN0YWZmLkhlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG51bTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBTaGFkZSBhbGwgdGhlIGNob3JkcyBwbGF5ZWQgYXQgdGhlIGdpdmVuIHB1bHNlIHRpbWUuXHJcbiAgICAgICAgICogIExvb3AgdGhyb3VnaCBhbGwgdGhlIHN0YWZmcyBhbmQgY2FsbCBzdGFmZi5TaGFkZSgpLlxyXG4gICAgICAgICAqICBJZiBzY3JvbGxHcmFkdWFsbHkgaXMgdHJ1ZSwgc2Nyb2xsIGdyYWR1YWxseSAoc21vb3RoIHNjcm9sbGluZylcclxuICAgICAgICAgKiAgdG8gdGhlIHNoYWRlZCBub3Rlcy4gUmV0dXJucyB0aGUgbWluaW11bSB5LWNvb3JkaW5hdGUgb2YgdGhlIHNoYWRlZCBjaG9yZCAoZm9yIHNjcm9sbGluZyBwdXJwb3NlcylcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgUmVjdGFuZ2xlIFNoYWRlTm90ZXMoaW50IGN1cnJlbnRQdWxzZVRpbWUsIGludCBwcmV2UHVsc2VUaW1lLCBib29sIHNjcm9sbEdyYWR1YWxseSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIEdyYXBoaWNzIGcgPSBDcmVhdGVHcmFwaGljcyhcInNoYWRlTm90ZXNcIik7XHJcbiAgICAgICAgICAgIGcuU21vb3RoaW5nTW9kZSA9IFNtb290aGluZ01vZGUuQW50aUFsaWFzO1xyXG4gICAgICAgICAgICBnLlNjYWxlVHJhbnNmb3JtKHpvb20sIHpvb20pO1xyXG4gICAgICAgICAgICBpbnQgeXBvcyA9IDA7XHJcblxyXG4gICAgICAgICAgICBpbnQgeF9zaGFkZSA9IDA7XHJcbiAgICAgICAgICAgIGludCB5X3NoYWRlID0gMDtcclxuICAgICAgICAgICAgaW50IGhlaWdodCA9IDA7XHJcblxyXG4gICAgICAgICAgICBmb3JlYWNoIChTdGFmZiBzdGFmZiBpbiBzdGFmZnMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKDAsIHlwb3MpO1xyXG4gICAgICAgICAgICAgICAgc3RhZmYuU2hhZGVOb3RlcyhnLCBzaGFkZUJydXNoLCBwZW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRQdWxzZVRpbWUsIHByZXZQdWxzZVRpbWUsIHJlZiB4X3NoYWRlKTtcclxuICAgICAgICAgICAgICAgIGcuVHJhbnNsYXRlVHJhbnNmb3JtKDAsIC15cG9zKTtcclxuICAgICAgICAgICAgICAgIHlwb3MgKz0gc3RhZmYuSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRQdWxzZVRpbWUgPj0gc3RhZmYuRW5kVGltZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB5X3NoYWRlICs9IHN0YWZmLkhlaWdodDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50UHVsc2VUaW1lID49IHN0YWZmLlN0YXJ0VGltZSAmJiBjdXJyZW50UHVsc2VUaW1lIDw9IHN0YWZmLkVuZFRpbWUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ICs9IHN0YWZmLkhlaWdodDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBnLlNjYWxlVHJhbnNmb3JtKDEuMGYgLyB6b29tLCAxLjBmIC8gem9vbSk7XHJcbiAgICAgICAgICAgIGcuRGlzcG9zZSgpO1xyXG4gICAgICAgICAgICB4X3NoYWRlID0gKGludCkoeF9zaGFkZSAqIHpvb20pO1xyXG4gICAgICAgICAgICB5X3NoYWRlIC09IE5vdGVIZWlnaHQ7XHJcbiAgICAgICAgICAgIHlfc2hhZGUgPSAoaW50KSh5X3NoYWRlICogem9vbSk7XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50UHVsc2VUaW1lID49IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFNjcm9sbFRvU2hhZGVkTm90ZXMoeF9zaGFkZSwgeV9zaGFkZSwgc2Nyb2xsR3JhZHVhbGx5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFJlY3RhbmdsZSh4X3NoYWRlLCB5X3NoYWRlLCAwLCAoaW50KShoZWlnaHQgKiB6b29tKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogU2Nyb2xsIHRoZSBzaGVldCBtdXNpYyBzbyB0aGF0IHRoZSBzaGFkZWQgbm90ZXMgYXJlIHZpc2libGUuXHJcbiAgICAgICAgICAqIElmIHNjcm9sbEdyYWR1YWxseSBpcyB0cnVlLCBzY3JvbGwgZ3JhZHVhbGx5IChzbW9vdGggc2Nyb2xsaW5nKVxyXG4gICAgICAgICAgKiB0byB0aGUgc2hhZGVkIG5vdGVzLlxyXG4gICAgICAgICAgKi9cclxuICAgICAgICB2b2lkIFNjcm9sbFRvU2hhZGVkTm90ZXMoaW50IHhfc2hhZGUsIGludCB5X3NoYWRlLCBib29sIHNjcm9sbEdyYWR1YWxseSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFBhbmVsIHNjcm9sbHZpZXcgPSAoUGFuZWwpdGhpcy5QYXJlbnQ7XHJcbiAgICAgICAgICAgIFBvaW50IHNjcm9sbFBvcyA9IHNjcm9sbHZpZXcuQXV0b1Njcm9sbFBvc2l0aW9uO1xyXG5cclxuICAgICAgICAgICAgLyogVGhlIHNjcm9sbCBwb3NpdGlvbiBpcyBpbiBuZWdhdGl2ZSBjb29yZGluYXRlcyBmb3Igc29tZSByZWFzb24gKi9cclxuICAgICAgICAgICAgc2Nyb2xsUG9zLlggPSAtc2Nyb2xsUG9zLlg7XHJcbiAgICAgICAgICAgIHNjcm9sbFBvcy5ZID0gLXNjcm9sbFBvcy5ZO1xyXG4gICAgICAgICAgICBQb2ludCBuZXdQb3MgPSBzY3JvbGxQb3M7XHJcblxyXG4gICAgICAgICAgICBpZiAoc2Nyb2xsVmVydClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IHNjcm9sbERpc3QgPSAoaW50KSh5X3NoYWRlIC0gc2Nyb2xsUG9zLlkpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzY3JvbGxHcmFkdWFsbHkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNjcm9sbERpc3QgPiAoem9vbSAqIFN0YWZmSGVpZ2h0ICogOCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbERpc3QgPSBzY3JvbGxEaXN0IC8gMjtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzY3JvbGxEaXN0ID4gKE5vdGVIZWlnaHQgKiAzICogem9vbSkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbERpc3QgPSAoaW50KShOb3RlSGVpZ2h0ICogMyAqIHpvb20pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbmV3UG9zID0gbmV3IFBvaW50KHNjcm9sbFBvcy5YLCBzY3JvbGxQb3MuWSArIHNjcm9sbERpc3QpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IHhfdmlldyA9IHNjcm9sbFBvcy5YICsgNDAgKiBzY3JvbGx2aWV3LldpZHRoIC8gMTAwO1xyXG4gICAgICAgICAgICAgICAgaW50IHhtYXggPSBzY3JvbGxQb3MuWCArIDY1ICogc2Nyb2xsdmlldy5XaWR0aCAvIDEwMDtcclxuICAgICAgICAgICAgICAgIGludCBzY3JvbGxEaXN0ID0geF9zaGFkZSAtIHhfdmlldztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc2Nyb2xsR3JhZHVhbGx5KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh4X3NoYWRlID4geG1heClcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsRGlzdCA9ICh4X3NoYWRlIC0geF92aWV3KSAvIDM7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoeF9zaGFkZSA+IHhfdmlldylcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsRGlzdCA9ICh4X3NoYWRlIC0geF92aWV3KSAvIDY7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbmV3UG9zID0gbmV3IFBvaW50KHNjcm9sbFBvcy5YICsgc2Nyb2xsRGlzdCwgc2Nyb2xsUG9zLlkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG5ld1Bvcy5YIDwgMClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXdQb3MuWCA9IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2Nyb2xsdmlldy5BdXRvU2Nyb2xsUG9zaXRpb24gPSBuZXdQb3M7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogUmV0dXJuIHRoZSBwdWxzZVRpbWUgY29ycmVzcG9uZGluZyB0byB0aGUgZ2l2ZW4gcG9pbnQgb24gdGhlIFNoZWV0TXVzaWMuXHJcbiAgICAgICAgICogIEZpcnN0LCBmaW5kIHRoZSBzdGFmZiBjb3JyZXNwb25kaW5nIHRvIHRoZSBwb2ludC5cclxuICAgICAgICAgKiAgVGhlbiwgd2l0aGluIHRoZSBzdGFmZiwgZmluZCB0aGUgbm90ZXMvc3ltYm9scyBjb3JyZXNwb25kaW5nIHRvIHRoZSBwb2ludCxcclxuICAgICAgICAgKiAgYW5kIHJldHVybiB0aGUgU3RhcnRUaW1lIChwdWxzZVRpbWUpIG9mIHRoZSBzeW1ib2xzLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBpbnQgUHVsc2VUaW1lRm9yUG9pbnQoUG9pbnQgcG9pbnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBQb2ludCBzY2FsZWRQb2ludCA9IG5ldyBQb2ludCgoaW50KShwb2ludC5YIC8gem9vbSksIChpbnQpKHBvaW50LlkgLyB6b29tKSk7XHJcbiAgICAgICAgICAgIGludCB5ID0gMDtcclxuICAgICAgICAgICAgZm9yZWFjaCAoU3RhZmYgc3RhZmYgaW4gc3RhZmZzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2NhbGVkUG9pbnQuWSA+PSB5ICYmIHNjYWxlZFBvaW50LlkgPD0geSArIHN0YWZmLkhlaWdodClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhZmYuUHVsc2VUaW1lRm9yUG9pbnQoc2NhbGVkUG9pbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgeSArPSBzdGFmZi5IZWlnaHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzdHJpbmcgcmVzdWx0ID0gXCJTaGVldE11c2ljIHN0YWZmcz1cIiArIHN0YWZmcy5Db3VudCArIFwiXFxuXCI7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKFN0YWZmIHN0YWZmIGluIHN0YWZmcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHN0YWZmLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzdWx0ICs9IFwiRW5kIFNoZWV0TXVzaWNcXG5cIjtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBNaWRpU2hlZXRNdXNpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgU29saWRCcnVzaDpCcnVzaFxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBTb2xpZEJydXNoKENvbG9yIGNvbG9yKTpcclxuICAgICAgICAgICAgYmFzZShjb2xvcilcclxuICAgICAgICB7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDctMjAxMSBNYWRoYXYgVmFpZHlhbmF0aGFuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiAgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDIuXG4gKlxuICogIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiAgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKi9cblxudXNpbmcgU3lzdGVtO1xudXNpbmcgU3lzdGVtLklPO1xudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XG51c2luZyBTeXN0ZW0uVGV4dDtcblxubmFtZXNwYWNlIE1pZGlTaGVldE11c2ljIHtcblxuLyoqIEBjbGFzcyBUaW1lU2lnU3ltYm9sXG4gKiBBIFRpbWVTaWdTeW1ib2wgcmVwcmVzZW50cyB0aGUgdGltZSBzaWduYXR1cmUgYXQgdGhlIGJlZ2lubmluZ1xuICogb2YgdGhlIHN0YWZmLiBXZSB1c2UgcHJlLW1hZGUgaW1hZ2VzIGZvciB0aGUgbnVtYmVycywgaW5zdGVhZCBvZlxuICogZHJhd2luZyBzdHJpbmdzLlxuICovXG5cbnB1YmxpYyBjbGFzcyBUaW1lU2lnU3ltYm9sIDogTXVzaWNTeW1ib2wge1xuICAgIHByaXZhdGUgc3RhdGljIEltYWdlW10gaW1hZ2VzOyAgLyoqIFRoZSBpbWFnZXMgZm9yIGVhY2ggbnVtYmVyICovXG4gICAgcHJpdmF0ZSBpbnQgIG51bWVyYXRvcjsgICAgICAgICAvKiogVGhlIG51bWVyYXRvciAqL1xuICAgIHByaXZhdGUgaW50ICBkZW5vbWluYXRvcjsgICAgICAgLyoqIFRoZSBkZW5vbWluYXRvciAqL1xuICAgIHByaXZhdGUgaW50ICB3aWR0aDsgICAgICAgICAgICAgLyoqIFRoZSB3aWR0aCBpbiBwaXhlbHMgKi9cbiAgICBwcml2YXRlIGJvb2wgY2FuZHJhdzsgICAgICAgICAgIC8qKiBUcnVlIGlmIHdlIGNhbiBkcmF3IHRoZSB0aW1lIHNpZ25hdHVyZSAqL1xuXG4gICAgLyoqIENyZWF0ZSBhIG5ldyBUaW1lU2lnU3ltYm9sICovXG4gICAgcHVibGljIFRpbWVTaWdTeW1ib2woaW50IG51bWVyLCBpbnQgZGVub20pIHtcbiAgICAgICAgbnVtZXJhdG9yID0gbnVtZXI7XG4gICAgICAgIGRlbm9taW5hdG9yID0gZGVub207XG4gICAgICAgIExvYWRJbWFnZXMoKTtcbiAgICAgICAgaWYgKG51bWVyID49IDAgJiYgbnVtZXIgPCBpbWFnZXMuTGVuZ3RoICYmIGltYWdlc1tudW1lcl0gIT0gbnVsbCAmJlxuICAgICAgICAgICAgZGVub20gPj0gMCAmJiBkZW5vbSA8IGltYWdlcy5MZW5ndGggJiYgaW1hZ2VzW251bWVyXSAhPSBudWxsKSB7XG4gICAgICAgICAgICBjYW5kcmF3ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNhbmRyYXcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB3aWR0aCA9IE1pbldpZHRoO1xuICAgIH1cblxuICAgIC8qKiBMb2FkIHRoZSBpbWFnZXMgaW50byBtZW1vcnkuICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBMb2FkSW1hZ2VzKCkge1xuICAgICAgICBpZiAoaW1hZ2VzID09IG51bGwpIHtcbiAgICAgICAgICAgIGltYWdlcyA9IG5ldyBJbWFnZVsxM107XG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDEzOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpbWFnZXNbaV0gPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW1hZ2VzWzJdID0gbmV3IEJpdG1hcCh0eXBlb2YoVGltZVNpZ1N5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy50d28ucG5nXCIpO1xuICAgICAgICAgICAgaW1hZ2VzWzNdID0gbmV3IEJpdG1hcCh0eXBlb2YoVGltZVNpZ1N5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy50aHJlZS5wbmdcIik7XG4gICAgICAgICAgICBpbWFnZXNbNF0gPSBuZXcgQml0bWFwKHR5cGVvZihUaW1lU2lnU3ltYm9sKSwgXCJSZXNvdXJjZXMuSW1hZ2VzLmZvdXIucG5nXCIpO1xuICAgICAgICAgICAgaW1hZ2VzWzZdID0gbmV3IEJpdG1hcCh0eXBlb2YoVGltZVNpZ1N5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy5zaXgucG5nXCIpO1xuICAgICAgICAgICAgaW1hZ2VzWzhdID0gbmV3IEJpdG1hcCh0eXBlb2YoVGltZVNpZ1N5bWJvbCksIFwiUmVzb3VyY2VzLkltYWdlcy5laWdodC5wbmdcIik7XG4gICAgICAgICAgICBpbWFnZXNbOV0gPSBuZXcgQml0bWFwKHR5cGVvZihUaW1lU2lnU3ltYm9sKSwgXCJSZXNvdXJjZXMuSW1hZ2VzLm5pbmUucG5nXCIpO1xuICAgICAgICAgICAgaW1hZ2VzWzEyXSA9IG5ldyBCaXRtYXAodHlwZW9mKFRpbWVTaWdTeW1ib2wpLCBcIlJlc291cmNlcy5JbWFnZXMudHdlbHZlLnBuZ1wiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIHRpbWUgKGluIHB1bHNlcykgdGhpcyBzeW1ib2wgb2NjdXJzIGF0LiAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgU3RhcnRUaW1lIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIC0xOyB9XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgbWluaW11bSB3aWR0aCAoaW4gcGl4ZWxzKSBuZWVkZWQgdG8gZHJhdyB0aGlzIHN5bWJvbCAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgTWluV2lkdGgge1xuICAgICAgICBnZXQgeyBpZiAoY2FuZHJhdykgXG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW1hZ2VzWzJdLldpZHRoICogU2hlZXRNdXNpYy5Ob3RlSGVpZ2h0ICogMiAvaW1hZ2VzWzJdLkhlaWdodDtcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEdldC9TZXQgdGhlIHdpZHRoIChpbiBwaXhlbHMpIG9mIHRoaXMgc3ltYm9sLiBUaGUgd2lkdGggaXMgc2V0XG4gICAgICogaW4gU2hlZXRNdXNpYy5BbGlnblN5bWJvbHMoKSB0byB2ZXJ0aWNhbGx5IGFsaWduIHN5bWJvbHMuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBXaWR0aCB7XG4gICAgICAgZ2V0IHsgcmV0dXJuIHdpZHRoOyB9XG4gICAgICAgc2V0IHsgd2lkdGggPSB2YWx1ZTsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBhYm92ZSB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBBYm92ZVN0YWZmIHsgXG4gICAgICAgIGdldCB7ICByZXR1cm4gMDsgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhpcyBzeW1ib2wgZXh0ZW5kcyBiZWxvdyB0aGUgc3RhZmYuIFVzZWRcbiAgICAgKiAgdG8gZGV0ZXJtaW5lIHRoZSBtaW5pbXVtIGhlaWdodCBuZWVkZWQgZm9yIHRoZSBzdGFmZiAoU3RhZmYuRmluZEJvdW5kcykuXG4gICAgICovXG4gICAgcHVibGljIG92ZXJyaWRlIGludCBCZWxvd1N0YWZmIHtcbiAgICAgICAgZ2V0IHsgcmV0dXJuIDA7IH0gXG4gICAgfVxuXG4gICAgLyoqIERyYXcgdGhlIHN5bWJvbC5cbiAgICAgKiBAcGFyYW0geXRvcCBUaGUgeWxvY2F0aW9uIChpbiBwaXhlbHMpIHdoZXJlIHRoZSB0b3Agb2YgdGhlIHN0YWZmIHN0YXJ0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgb3ZlcnJpZGUgXG4gICAgdm9pZCBEcmF3KEdyYXBoaWNzIGcsIFBlbiBwZW4sIGludCB5dG9wKSB7XG4gICAgICAgIGlmICghY2FuZHJhdylcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBnLlRyYW5zbGF0ZVRyYW5zZm9ybShXaWR0aCAtIE1pbldpZHRoLCAwKTtcbiAgICAgICAgSW1hZ2UgbnVtZXIgPSBpbWFnZXNbbnVtZXJhdG9yXTtcbiAgICAgICAgSW1hZ2UgZGVub20gPSBpbWFnZXNbZGVub21pbmF0b3JdO1xuXG4gICAgICAgIC8qIFNjYWxlIHRoZSBpbWFnZSB3aWR0aCB0byBtYXRjaCB0aGUgaGVpZ2h0ICovXG4gICAgICAgIGludCBpbWdoZWlnaHQgPSBTaGVldE11c2ljLk5vdGVIZWlnaHQgKiAyO1xuICAgICAgICBpbnQgaW1nd2lkdGggPSBudW1lci5XaWR0aCAqIGltZ2hlaWdodCAvIG51bWVyLkhlaWdodDtcbiAgICAgICAgZy5EcmF3SW1hZ2UobnVtZXIsIDAsIHl0b3AsIGltZ3dpZHRoLCBpbWdoZWlnaHQpO1xuICAgICAgICBnLkRyYXdJbWFnZShkZW5vbSwgMCwgeXRvcCArIFNoZWV0TXVzaWMuTm90ZUhlaWdodCoyLCBpbWd3aWR0aCwgaW1naGVpZ2h0KTtcbiAgICAgICAgZy5UcmFuc2xhdGVUcmFuc2Zvcm0oLShXaWR0aCAtIE1pbldpZHRoKSwgMCk7XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJUaW1lU2lnU3ltYm9sIG51bWVyYXRvcj17MH0gZGVub21pbmF0b3I9ezF9XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWVyYXRvciwgZGVub21pbmF0b3IpO1xuICAgIH1cbn1cblxufVxuXG4iXQp9Cg==
