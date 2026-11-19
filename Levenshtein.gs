/**
 * sheets-levenshtein: free Levenshtein distance and similarity for Google Sheets.
 * MIT licence. https://github.com/Snakbacks/sheets-levenshtein
 *
 * Install: Extensions > Apps Script, paste this file, Save. Then use in any cell:
 *   =LEVENSHTEIN(A2, B2)          edits needed to turn one text into the other
 *   =SIMILARITY(A2, B2)           0 to 1 score (1 = identical, ignoring case)
 *   =BESTMATCH(C2:C10, A2:A100)   closest item from a list, with its score
 * LEVENSHTEIN and SIMILARITY accept single cells or whole ranges of the same size.
 */

function lev_(a, b) {
  a = String(a).toLowerCase();
  b = String(b).toLowerCase();
  var m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  var prev = new Array(n + 1), cur = new Array(n + 1), i, j, tmp;
  for (j = 0; j <= n; j++) prev[j] = j;
  for (i = 1; i <= m; i++) {
    cur[0] = i;
    for (j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1,
        prev[j - 1] + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1));
    }
    tmp = prev; prev = cur; cur = tmp;
  }
  return prev[n];
}

function sim_(a, b) {
  a = String(a); b = String(b);
  var len = Math.max(a.length, b.length);
  if (len === 0) return 1;
  return 1 - lev_(a, b) / len;
}

function pairwise_(a, b, fn) {
  var aArr = Array.isArray(a), bArr = Array.isArray(b);
  if (!aArr && !bArr) return fn(a, b);
  var rows = aArr ? a.length : b.length, cols = aArr ? a[0].length : b[0].length;
  if (aArr && bArr && (a.length !== b.length || a[0].length !== b[0].length)) {
    throw new Error('The two ranges must be the same size.');
  }
  var out = [];
  for (var r = 0; r < rows; r++) {
    var row = [];
    for (var c = 0; c < cols; c++) {
      var x = aArr ? a[r][c] : a, y = bArr ? b[r][c] : b;
      row.push(x === '' && y === '' ? '' : fn(x, y));
    }
    out.push(row);
  }
  return out;
}

/**
 * Number of single-character edits (insert, delete, replace) between two texts. Ignores case.
 * @param {string|Array<Array<string>>} text1 A cell or range.
 * @param {string|Array<Array<string>>} text2 A cell or range of the same size.
 * @return The edit distance.
 * @customfunction
 */
function LEVENSHTEIN(text1, text2) {
  return pairwise_(text1, text2, lev_);
}

/**
 * Similarity from 0 to 1: 1 minus the edit distance divided by the longer length. Ignores case.
 * @param {string|Array<Array<string>>} text1 A cell or range.
 * @param {string|Array<Array<string>>} text2 A cell or range of the same size.
 * @return The similarity score.
 * @customfunction
 */
function SIMILARITY(text1, text2) {
  return pairwise_(text1, text2, sim_);
}

/**
 * Closest item in a list for each value, with its similarity score (two columns).
 * @param {string|Array<Array<string>>} values A cell or a column of messy values.
 * @param {Array<Array<string>>} list The clean list to search.
 * @return Best match and score for each value.
 * @customfunction
 */
function BESTMATCH(values, list) {
  var items = [];
  (Array.isArray(list) ? list : [[list]]).forEach(function (r) {
    r.forEach(function (v) { if (v !== '' && v !== null) items.push(String(v)); });
  });
  var vals = Array.isArray(values) ? values : [[values]];
  return vals.map(function (r) {
    var v = r[0];
    if (v === '' || v === null || items.length === 0) return ['', ''];
    var best = '', score = -1;
    for (var k = 0; k < items.length; k++) {
      var s = sim_(v, items[k]);
      if (s > score) { score = s; best = items[k]; }
    }
    return [best, score];
  });
}
