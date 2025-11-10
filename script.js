/* script.js — works with your exact HTML (no HTML changes required) */

/* === CONFIG === */
const Q_COUNT = 30;           // change this if you want more/fewer questions
const TEMPLATE_ID = "question-template";
const MAIN_ID = "main";
const BUTTON_ID = "btn";

/* === Sanitizer === */
function sanitizeField(raw) {
  if (!raw) return "";
  return raw
    .replace(/\u00A0/g, " ")   // NBSP -> space
    .replace(/\r?\n+/g, " ")   // collapse hard newlines into single space
    .replace(/\s{2,}/g, " ")   // collapse repeated spaces
    .trim();
}

/* === Generate question blocks from <template> === */
function generateQuestionBlocks() {
  const template = document.getElementById(TEMPLATE_ID);
  const main = document.getElementById(MAIN_ID);
  if (!template || !main) {
    console.error("Missing template or main container:", TEMPLATE_ID, MAIN_ID);
    return;
  }

  // Clear any existing content in main (defensive)
  main.innerHTML = "";

  for (let i = 1; i <= Q_COUNT; i++) {
    const copy = template.content.cloneNode(true);

    // Find inputs inside clone (supports <input> or <textarea> inside template)
    const inputs = copy.querySelectorAll("input, textarea");

    // Warn if template doesn't contain expected fields
    if (inputs.length < 5) {
      console.warn(`Template expected 5 inputs (question + 4 answers), found ${inputs.length}.`);
    }

    // Assign unique names so we can retrieve values later
    if (inputs[0]) { inputs[0].name = `q${i}`; inputs[0].placeholder = `${i}-Savolni kiriting`; }
    if (inputs[1]) { inputs[1].name = `q${i}a`; }
    if (inputs[2]) { inputs[2].name = `q${i}b`; }
    if (inputs[3]) { inputs[3].name = `q${i}c`; }
    if (inputs[4]) { inputs[4].name = `q${i}d`; }

    main.appendChild(copy);
  }
}

/* === Collect values and export to .docx === */
/* === Collect values and export to .docx === */
async function collectAndExport() {
  // Validate all fields are filled
  const allInputs = document.querySelectorAll('#main input, #main textarea');
  const emptyFields = [];
  
  allInputs.forEach(input => {
    if (!input.value.trim()) {
      emptyFields.push(input);
      input.style.border = '2px solid red'; // Highlight empty fields
    } else {
      input.style.border = ''; // Reset border if filled
    }
  });
  
  if (emptyFields.length > 0) {
    alert(`Iltimos, barcha maydonlarni to'ldiring! (${emptyFields.length} ta bo'sh maydon)`);
    emptyFields[0].focus(); // Focus on first empty field
    return;
  }

  // Sanity: ensure docx + saveAs are available
  if (!window.docx) {
    alert("docx library not found. Make sure docx CDN script is included before script.js.");
    return;
  }
  if (typeof saveAs !== "function") {
    alert("FileSaver (saveAs) not found. Make sure FileSaver CDN is included before script.js.");
    return;
  }

  const { Document, Packer, Paragraph } = window.docx;
  if (!Document || !Packer || !Paragraph) {
    alert("docx exports not available in this docx build.");
    return;
  }

  const paragraphs = [];

  for (let i = 1; i <= Q_COUNT; i++) {
    const qName = `q${i}`;
    const qa = `q${i}a`, qb = `q${i}b`, qc = `q${i}c`, qd = `q${i}d`;

    const qEl = document.getElementsByName(qName)[0];
    const aEl = document.getElementsByName(qa)[0];
    const bEl = document.getElementsByName(qb)[0];
    const cEl = document.getElementsByName(qc)[0];
    const dEl = document.getElementsByName(qd)[0];

    const qText = sanitizeField(qEl ? qEl.value : "");
    const aText = sanitizeField(aEl ? aEl.value : "");
    const bText = sanitizeField(bEl ? bEl.value : "");
    const cText = sanitizeField(cEl ? cEl.value : "");
    const dText = sanitizeField(dEl ? dEl.value : "");

    const { Document, Packer, Paragraph, TextRun } = window.docx;

// Then in your loop where you add the question:
paragraphs.push(new Paragraph({ 
  children: [
    new TextRun("Q: " + qText)
  ]
}));
    paragraphs.push(new Paragraph({ text: aText }));
    paragraphs.push(new Paragraph({ text: bText }));
    paragraphs.push(new Paragraph({ text: cText }));
    paragraphs.push(new Paragraph({ text: dText }));
  }

  const doc = new Document({
    sections: [{ children: paragraphs }]
  });

  try {
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "quiz.docx");
  } catch (err) {
    console.error("Docx export failed:", err);
    alert("Failed to generate Word file. See console for details.");
  }
}

/* === Hook up on DOM ready === */
document.addEventListener("DOMContentLoaded", function () {
  generateQuestionBlocks();

  const btn = document.getElementById(BUTTON_ID);
  if (!btn) {
    console.warn("Download button not found with id:", BUTTON_ID);
    return;
  }
  btn.addEventListener("click", collectAndExport);
});
