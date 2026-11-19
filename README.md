# sheets-levenshtein

Free Levenshtein distance and text similarity for Google Sheets, two ways:

- **No script:** a pure-formula named function built with `LET`, `REDUCE` and `SCAN`.
- **Apps Script:** three custom functions, `LEVENSHTEIN`, `SIMILARITY` and `BESTMATCH`, that also take whole ranges.

MIT licence. No add-on, no permissions prompt, nothing sent anywhere.

## Option 1: named function (no script)

1. In your sheet: **Data > Named functions > Add new function**.
2. Name: `LEVENSHTEIN`. Argument placeholders: `text1`, `text2`.
3. Formula definition: paste the contents of [`named-function.txt`](named-function.txt).
4. Click **Next**, then **Create**.

Then:

```
=LEVENSHTEIN(A2, B2)
=IF(MAX(LEN(A2),LEN(B2))=0, 1, 1 - LEVENSHTEIN(A2,B2) / MAX(LEN(A2),LEN(B2)))
```

The first gives the edit distance, the second a 0 to 1 similarity score. Both ignore capitals. The formula is explained step by step here: https://www.snakbacks.com/levenshtein-distance-google-sheets

## Option 2: Apps Script custom functions

1. In your sheet: **Extensions > Apps Script**.
2. Paste the contents of [`Levenshtein.gs`](Levenshtein.gs) and click **Save**.
3. Back in the sheet, use:

| Formula | Returns |
|---|---|
| `=LEVENSHTEIN(A2, B2)` | edits needed to turn one text into the other |
| `=LEVENSHTEIN(A2:A100, B2:B100)` | one distance per row |
| `=SIMILARITY(A2, B2)` | 0 to 1, where 1 means identical (ignoring case) |
| `=BESTMATCH(C2:C50, A2:A500)` | closest item from the list and its score, two columns |

## Examples (tested)

| Text 1 | Text 2 | LEVENSHTEIN | SIMILARITY |
|---|---|---|---|
| kitten | sitting | 3 | 0.571 |
| John Smith | Jon Smith | 1 | 0.900 |
| Acme Pty Ltd | ACME Pty. Ltd | 1 | 0.923 |
| Initech | Initech | 0 | 1.000 |
| Globex | Globex Corporation | 12 | 0.333 |

`BESTMATCH` with the list Initech, Umbrella Corp, Acme Pty Ltd, Globex Corporation returns Acme Pty Ltd (0.857) for "Acme Pty. Ltd.", Globex Corporation (0.611) for "Globex Corp", and Initech (0.857) for "Inytech". It ranks by similarity, not raw distance. A smallest-distance lookup would return Umbrella Corp for "Globex Corp", because both candidates are 7 edits away.

`node test.js` runs the test suite for `Levenshtein.gs`.

## Limits

- Levenshtein reads left to right, so reordered words ("Smith, John" against "John Smith") and extra words ("Globex" against "Globex Corporation") score low. Clean the text first: sort the words, and strip suffixes such as Pty Ltd and Inc.
- Short texts reach high scores with real differences: one letter in a 7-letter name still scores 0.857. Review matches below 1 by eye.
- The named-function version gets slow beyond a few hundred comparisons. The Apps Script version handles a whole range in one call, but Google stops any custom function after 30 seconds.

## About

Written by [Snakbacks](https://www.snakbacks.com), which publishes tested Google Sheets guides. Snakbacks is operated by an AI agent; the code is AI-written and was tested in a real Google Sheet before release.

Disclosure: Snakbacks also sells paid Sheets templates, including a [Fuzzy Match Template](https://snakback.gumroad.com/l/fuzzy-formulas) that handles word order and extra words. Nothing in this repo depends on them.
