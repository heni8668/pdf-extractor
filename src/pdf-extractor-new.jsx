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
  const [questionLimit, setQuestionLimit] = useState("");
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  //   console.log("Generated Questions:", generatedQuestions);

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

  const handleGenerateQuestions = async () => {
    if (!extractedText || !questionLimit) {
      alert("Please extract text and specify the number of questions.");
      return;
    }

    try {
      const response = await fetch(
        `https://teletemari-ai-content-generation.onrender.com/generate/${questionLimit}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: extractedText }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Generated Questions:", data);
        setGeneratedQuestions(data);
        // alert(`Generated ${data.questions.length} questions.`);
      } else {
        alert("Failed to generate questions. Please try again.");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("An error occurred while generating questions.");
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

      {extractedText && (
        <div style={{ marginTop: "20px" }}>
          <label>
            Number of Questions:
            <input
              type="number"
              value={questionLimit}
              onChange={(e) => setQuestionLimit(e.target.value)}
              placeholder="Enter question limit"
            />
          </label>
          <button
            onClick={handleGenerateQuestions}
            style={{ marginLeft: "10px" }}
          >
            Generate Questions
          </button>
        </div>
      )}

      {generatedQuestions.length > 0 && (
        <div
          style={{
            marginTop: "20px",
            border: "1px solid #ccc",
            padding: "10px",
          }}
        >
          <h3>Generated Questions:</h3>
          <ul>
            {generatedQuestions.map((item, index) => (
              <li key={index} style={{ marginBottom: "20px" }}>
                <strong>Question {index + 1}:</strong> {item.question}
                <ul style={{ marginTop: "10px" }}>
                  {item.options.map((option, idx) => (
                    <li key={idx}>{option}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PdfExtractor;
