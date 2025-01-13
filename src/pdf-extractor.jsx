import React, { useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

// Import the worker explicitly using Vite's worker syntax
const workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

// Set the worker source globally for PDF.js
GlobalWorkerOptions.workerSrc = workerSrc;

const PdfExtractor = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pageRange, setPageRange] = useState("");
  const [extractedText, setExtractedText] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(file);
    }
  };

  const extractTextFromPdf = async (pdfFile, pageRange) => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDocument = await getDocument(arrayBuffer).promise;
      const totalPages = pdfDocument.numPages;

      const [startPage, endPage] = pageRange
        .split("-")
        .map((num) => parseInt(num, 10));

      if (startPage < 1 || endPage > totalPages || startPage > endPage) {
        setExtractedText("Invalid page range.");
        return;
      }

      let text = "";
      for (let i = startPage; i <= endPage; i++) {
        const page = await pdfDocument.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(" ");
        text += `Page ${i}:\n${pageText}\n\n`;
      }

      setExtractedText(text);
    } catch (error) {
      console.error("Error extracting text:", error);
      setExtractedText("Failed to extract text.");
    }
  };

  const handleExtractText = () => {
    if (pdfFile && pageRange) {
      extractTextFromPdf(pdfFile, pageRange);
    } else {
      setExtractedText("Please select a file and specify a valid page range.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>PDF Text Extractor</h2>
      <div>
        <label>
          Upload PDF:
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
          />
        </label>
      </div>
      <div>
        <label>
          Page Range (e.g., 1-3):
          <input
            type="text"
            value={pageRange}
            onChange={(e) => setPageRange(e.target.value)}
            placeholder="Enter page range"
          />
        </label>
      </div>
      <button onClick={handleExtractText} style={{ marginTop: "10px" }}>
        Extract Text
      </button>
      {extractedText && (
        <div
          style={{
            marginTop: "20px",
            whiteSpace: "pre-wrap",
            border: "1px solid #ccc",
            padding: "10px",
          }}
        >
          <h3>Extracted Text:</h3>
          <p>{extractedText}</p>
        </div>
      )}
    </div>
  );
};

export default PdfExtractor;
