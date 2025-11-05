/**
 * Web App endpoint for receiving quiz results and appending to the "Jawaban" sheet.
 * Expected JSON body (example):
 * {
 *   "name": "Budi",
 *   "kelas": "4A",
 *   "nilai_pilihan_ganda": "3/5",
 *   "uraian": ["jawaban 1", "jawaban 2", "jawaban 3"] // or "essayAnswers": [...]
 * }
 */

const SHEET_NAME = 'Jawaban';

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return _json({ ok: false, error: 'No POST body' }, 400);
    }

    const raw = e.postData.contents;
    const data = JSON.parse(raw);

    const name = String(data.name || data.nama || '').trim();
    const kelas = String(data.kelas || '').trim();
    const nilaiPg = String(data.nilai_pilihan_ganda || data.nilaiPG || data.nilai || '').trim();

    // Accept either "uraian" or "essayAnswers" for the array of answers
    const uraianArr = Array.isArray(data.uraian)
      ? data.uraian
      : (Array.isArray(data.essayAnswers) ? data.essayAnswers : []);

    const ss = SpreadsheetApp.getActive();
    let sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) sh = ss.insertSheet(SHEET_NAME);

    // If sheet is empty, add header: Timestamp, Name, Kelas, Nilai_Pilihan_Ganda, Uraian1..N
    if (sh.getLastRow() === 0) {
      const headers = ['Timestamp', 'Name', 'Kelas', 'Nilai_Pilihan_Ganda'];
      for (let i = 0; i < Math.max(uraianArr.length, 1); i++) {
        headers.push(`Uraian${i + 1}`);
      }
      sh.appendRow(headers);
    }

    // Ensure header has enough Uraian columns; if not, add the missing ones
    const headerRange = sh.getRange(1, 1, 1, sh.getLastColumn());
    const headers = headerRange.getValues()[0];
    const currentUraianCount = headers.filter(h => /^Uraian\d+$/i.test(h)).length;
    if (uraianArr.length > currentUraianCount) {
      const missing = uraianArr.length - currentUraianCount;
      const newHeaders = headers.slice();
      for (let i = currentUraianCount; i < currentUraianCount + missing; i++) {
        newHeaders.push(`Uraian${i + 1}`);
      }
      sh.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);
    }

    // Build row
    const timestamp = new Date();
    const row = [timestamp, name, kelas, nilaiPg, ...uraianArr];

    sh.appendRow(row);

    return _json({ ok: true, appended: row.length, rowIndex: sh.getLastRow() }, 200);
  } catch (err) {
    return _json({ ok: false, error: String(err) }, 500);
  }
}

// Optional: simple GET to verify endpoint works
function doGet() {
  return _json({ ok: true, message: 'Web App is up. Use POST with JSON to submit.' }, 200);
}

// Helpers
function _json(obj, status) {
  const out = ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  return out; // Apps Script web apps don’t support custom HTTP status; this is fine for clients
}