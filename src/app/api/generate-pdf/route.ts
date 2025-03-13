import { NextResponse } from 'next/server';

/**
 * Parses resume content into structured sections
 */
function parseResumeContent(content: string) {
  const lines = content.trim().split('\n');
  let name = '';
  const contactInfo: string[] = [];
  const sections: { title: string; content: string[] }[] = [];
  let currentSection: { title: string; content: string[] } | null = null;

  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // First non-empty line is the name
    if (!name) {
      name = line;
      continue;
    }

    // Contact information (before first section)
    if (!sections.length && (line.includes('@') || line.includes('|') || line.includes(':'))) {
      // If it contains a pipe, it's a formatted contact line
      if (line.includes('|')) {
        // Split by pipe and clean each part
        const parts = line.split('|').map(part => {
          // Remove markdown links [text](url) -> text
          let cleaned = part.replace(/\[(.*?)\]\((.*?)\)/g, '$1');
          // Remove HTML links
          cleaned = cleaned.replace(/<a.*?>(.*?)<\/a>/g, '$1');
          // Remove mailto:
          cleaned = cleaned.replace(/mailto:/g, '');
          // Remove any remaining brackets
          cleaned = cleaned.replace(/[\[\]()]/g, '');
          return cleaned.trim();
        });
        contactInfo.push(...parts.filter(Boolean));
      } 
      // If it contains a colon, it might be a label:value pair
      else if (line.includes(':')) {
        const [label, value] = line.split(':').map(part => part.trim());
        if (label && value) {
          contactInfo.push(`${label}: ${value}`);
        } else {
          contactInfo.push(line);
        }
      }
      // Otherwise, just add the line as is
      else {
        contactInfo.push(line);
      }
      continue;
    }

    // Section headers (all caps with letters)
    if (line === line.toUpperCase() && line.length > 2 && /[A-Z]/.test(line)) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = { title: line, content: [] };
      continue;
    }

    // Add content to current section
    if (currentSection) {
      currentSection.content.push(line);
    }
  }

  // Add the last section
  if (currentSection) {
    sections.push(currentSection);
  }

  return { name, contactInfo, sections };
}

/**
 * Creates HTML for client-side PDF generation
 */
function createClientSidePdfHTML(content: string, type: 'resume' | 'cover-letter', jobPosition?: string, company?: string) {
  // Determine document title
  const documentTitle = type === 'resume' 
    ? 'Resume' 
    : (jobPosition && company ? `Cover Letter - ${jobPosition} at ${company}` : 'Cover Letter');
  
  // Process content based on type
  const processedContent = type === 'resume' 
    ? processResumeContent(content)
    : processCoverLetterContent(content, jobPosition, company);
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${documentTitle}</title>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
      <style>
        /* General Styles */
        body {
          font-family: Arial, Helvetica, sans-serif;
          line-height: 1.5;
          color: #333;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          background-color: white;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          padding: 20px;
          border-radius: 5px;
        }
        
        .pdf-container {
          width: 210mm;
          min-height: 297mm;
          padding: 20mm;
          margin: 0 auto;
          background-color: white;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          position: relative;
        }
        
        .controls {
          text-align: center;
          margin: 20px 0;
        }
        
        button {
          background-color: #4CAF50;
          color: white;
          border: none;
          padding: 10px 20px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          margin: 4px 2px;
          cursor: pointer;
          border-radius: 4px;
        }
        
        button:hover {
          background-color: #45a049;
        }
        
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 20px 0;
        }
        
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border-left-color: #09f;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Resume Specific Styles */
        .resume-name {
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 10px;
          color: #333;
        }
        
        .resume-contact {
          text-align: center;
          margin-bottom: 20px;
          font-size: 12px;
          line-height: 1.6;
        }
        
        .resume-section {
          margin-bottom: 15px;
        }
        
        .resume-section-header {
          font-size: 14px;
          font-weight: bold;
          text-transform: uppercase;
          border-bottom: 1px solid #999;
          margin-bottom: 8px;
          padding-bottom: 3px;
          color: #333;
        }
        
        .resume-job-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          flex-wrap: wrap;
        }
        
        .resume-job-title {
          font-weight: bold;
          font-size: 13px;
          margin-right: 10px;
        }
        
        .resume-job-date {
          color: #666;
          font-style: italic;
          font-size: 12px;
        }
        
        .resume-bullet {
          margin: 5px 0 5px 15px;
          position: relative;
          padding-left: 15px;
          font-size: 12px;
        }
        
        .resume-bullet::before {
          content: "•";
          position: absolute;
          left: 0;
        }
        
        .resume-paragraph {
          margin: 5px 0;
          font-size: 12px;
        }
        
        /* Cover Letter Specific Styles */
        .cover-letter-header {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .cover-letter-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .cover-letter-title {
          font-size: 16px;
          margin-bottom: 15px;
        }
        
        .cover-letter-paragraph {
          margin-bottom: 15px;
          text-align: justify;
          font-size: 12px;
        }
        
        @media print {
          body {
            background-color: white;
            padding: 0;
          }
          
          .container, .controls, .loading {
            display: none;
          }
          
          .pdf-container {
            box-shadow: none;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 style="text-align: center;">${documentTitle} Generator</h1>
        <div class="controls">
          <button id="generate-pdf">Generate PDF</button>
        </div>
        <div class="loading">
          <div class="spinner"></div>
          <p style="margin-left: 10px;">Generating PDF...</p>
        </div>
      </div>
      
      <div id="pdf-content" class="pdf-container">
        ${processedContent}
      </div>
      
      <script>
        // Function to generate PDF
        function generatePDF() {
          // Show loading spinner
          document.querySelector('.loading').style.display = 'flex';
          
          // Get the element to convert
          const element = document.getElementById('pdf-content');
          
          // Configure options
          const options = {
            margin: [10, 10, 10, 10],
            filename: '${type === 'resume' ? 'resume' : 'cover-letter'}.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
              scale: 2,
              useCORS: true,
              letterRendering: true
            },
            jsPDF: { 
              unit: 'mm', 
              format: 'a4', 
              orientation: 'portrait' 
            }
          };
          
          // Generate PDF
          html2pdf().from(element).set(options).save().then(() => {
            // Hide loading spinner
            document.querySelector('.loading').style.display = 'none';
          });
        }
        
        // Attach event listener to button
        document.getElementById('generate-pdf').addEventListener('click', generatePDF);
        
        // Auto-generate PDF on load
        window.addEventListener('load', function() {
          // Hide loading initially
          document.querySelector('.loading').style.display = 'none';
          
          // Auto-generate after a short delay
          setTimeout(generatePDF, 1000);
        });
      </script>
    </body>
    </html>
  `;
}

/**
 * Process resume content into HTML
 */
function processResumeContent(content: string): string {
  const { name, contactInfo, sections } = parseResumeContent(content);
  
  return `
    <div class="resume-name">${name}</div>
    <div class="resume-contact">${contactInfo.join(' | ')}</div>
    ${sections.map(section => `
      <div class="resume-section">
        <div class="resume-section-header">${section.title}</div>
        <div class="resume-section-content">
          ${section.content.map(line => {
            // Handle bullet points
            if (line.startsWith('- ') || line.startsWith('* ')) {
              return `<div class="resume-bullet">${line.substring(2)}</div>`;
            }
            // Handle job titles with dates (contains pipe and year)
            else if (line.includes('|') && /202[0-4]|201[0-9]|Present/i.test(line)) {
              const [title, date] = line.split('|').map(part => part.trim());
              return `
                <div class="resume-job-header">
                  <div class="resume-job-title">${title}</div>
                  <div class="resume-job-date">${date}</div>
                </div>
              `;
            }
            // Regular paragraph
            return `<div class="resume-paragraph">${line}</div>`;
          }).join('')}
        </div>
      </div>
    `).join('')}
  `;
}

/**
 * Process cover letter content into HTML
 */
function processCoverLetterContent(content: string, jobPosition?: string, company?: string): string {
  // Extract name from the first line
  const lines = content.trim().split('\n');
  const name = lines.length > 0 ? lines[0] : 'Cover Letter';
  
  // Clean up content - remove the first line (name)
  const bodyContent = lines.slice(1).join('\n');
  
  // Format paragraphs
  const formattedContent = bodyContent
    .split('\n\n')
    .map(para => para.trim())
    .filter(Boolean)
    .map(para => `<div class="cover-letter-paragraph">${para}</div>`)
    .join('');

  return `
    <div class="cover-letter-header">
      <div class="cover-letter-name">${name}</div>
      ${jobPosition && company ? `<div class="cover-letter-title">Cover Letter: ${jobPosition} at ${company}</div>` : ''}
    </div>
    <div class="cover-letter-content">
      ${formattedContent}
    </div>
  `;
}

/**
 * API route handler
 */
export async function POST(req: Request) {
  try {
    // Parse request content
    const contentType = req.headers.get('content-type') || '';
    const acceptHeader = req.headers.get('accept') || '';
    let content = '';
    let type: 'resume' | 'cover-letter' = 'resume';
    let jobPosition = '';
    let company = '';
    
    if (contentType.includes('application/json')) {
      const jsonData = await req.json();
      content = jsonData.content || '';
      type = jsonData.type || 'resume';
      jobPosition = jsonData.jobPosition || '';
      company = jsonData.company || '';
    } else {
      const formData = await req.formData();
      content = formData.get('content')?.toString() || '';
      type = (formData.get('type')?.toString() || 'resume') as 'resume' | 'cover-letter';
      jobPosition = formData.get('jobPosition')?.toString() || '';
      company = formData.get('company')?.toString() || '';
    }

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Generate HTML for client-side PDF generation
    const html = createClientSidePdfHTML(content, type, jobPosition, company);
    
    // Check if client accepts HTML
    if (acceptHeader.includes('text/html')) {
      // Return HTML response
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
        }
      });
    } else {
      // Convert HTML to PDF blob and return as application/pdf
      // For now, just return the HTML with appropriate headers
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="document.pdf"`,
        }
      });
    }
  } catch (error) {
    console.error('Error generating PDF HTML:', error);
    return NextResponse.json({ 
      error: 'Failed to generate PDF',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 