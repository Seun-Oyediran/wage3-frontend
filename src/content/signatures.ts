/** A handwritten signature as pen strokes, drawn on by the changelog's Signature component. */
export type SignatureData = {
  width: number;
  height: number;
  /** One path per pen stroke, in drawing order; `length` in the same units. */
  strokes: { d: string; length: number }[];
};

/** Jason's (Kurosawa's) mark. */
export const KUROSAWA_SIGNATURE: SignatureData = {
  width: 100,
  height: 56,
  strokes: [
    { length: 38.1, d: "M14 6 C13.8 8.7 13.5 15.7 13 22 C12.5 28.3 11.3 40.3 11 44" },
    {
      length: 243.3,
      d: "M30 8 C28.0 10.7 20.8 20.8 18 24 C15.2 27.2 12.3 26.0 13 27 C13.7 28.0 19.5 27.8 22 30 C24.5 32.2 26.0 38.0 28 40 C30.0 42.0 32.0 43.3 34 42 C36.0 40.7 38.7 34.7 40 32 C41.3 29.3 41.3 25.3 42 26 C42.7 26.7 42.7 34.7 44 36 C45.3 37.3 48.3 35.7 50 34 C51.7 32.3 53.0 26.0 54 26 C55.0 26.0 54.3 33.3 56 34 C57.7 34.7 61.7 31.7 64 30 C66.3 28.3 68.7 23.7 70 24 C71.3 24.3 70.3 31.0 72 32 C73.7 33.0 77.0 31.0 80 30 C83.0 29.0 87.3 26.0 90 26 C92.7 26.0 95.7 27.7 96 30 C96.3 32.3 96.3 37.3 92 40 C87.7 42.7 78.7 44.7 70 46 C61.3 47.3 48.0 47.8 40 48 C32.0 48.2 25.0 47.2 22 47",
    },
  ],
};
