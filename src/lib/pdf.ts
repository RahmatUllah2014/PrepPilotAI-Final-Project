import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker URL using unpkg matching exact installed package version
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  const version = pdfjsLib.version || '6.1.200';
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
}

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
  title: string;
}

export async function extractTextFromPdf(
  file: File,
  onProgress?: (currentPage: number, totalPages: number) => void
): Promise<PdfExtractionResult> {
  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
    throw new Error('Invalid file format. Only PDF files are supported.');
  }

  const MAX_SIZE_MB = 25;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`File size exceeds ${MAX_SIZE_MB}MB limit. Please upload a smaller PDF.`);
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer
    });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    const pageCount = pdf.numPages;

    if (pageCount === 0) {
      throw new Error('PDF file has no pages.');
    }

    for (let i = 1; i <= pageCount; i++) {
      if (onProgress) {
        onProgress(i, pageCount);
      }
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageItems = textContent.items.map((item: any) => item.str).join(' ');
      if (pageItems.trim()) {
        fullText += `\n--- Page ${i} ---\n` + pageItems + '\n';
      }
    }

    const trimmedText = fullText.trim();
    if (!trimmedText) {
      throw new Error('No readable text found in this PDF. It might be a scanned image or empty document.');
    }

    const title = file.name.replace(/\.pdf$/i, '');

    return {
      text: trimmedText,
      pageCount,
      title,
    };
  } catch (err: any) {
    console.error('PDF Extraction Internal Error:', err);
    if (err?.message && err.message.includes('Password')) {
      throw new Error('PDF is password-protected. Please remove the password and try again.');
    }
    if (err?.message && (
      err.message.includes('Invalid file') || 
      err.message.includes('No readable text') || 
      err.message.includes('exceeds') ||
      err.message.includes('password-protected')
    )) {
      throw err;
    }
    throw new Error(`Failed to parse PDF document: ${err?.message || 'Unknown error'}`);
  }
}


