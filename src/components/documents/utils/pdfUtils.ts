import { toast } from 'react-hot-toast';

/**
 * Preprocesses markdown for better HTML conversion
 */
export const preprocessMarkdown = (markdown: string): string => {
  if (!markdown) return '';
  
  try {
    // First, clean up any markdown code block delimiters
    let processed = markdown.replace(/```markdown|```/g, '');
    
    // Split into lines for processing
    const lines = processed.trim().split('\n');
    const processedLines = [];
    
    // Track if we're in the contact info section
    let inContactInfo = false;
    
    // Process each line
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      
      // Skip empty lines but preserve them in output
      if (!line) {
        processedLines.push('');
        continue;
      }
      
      // Skip lines with just the word "markdown"
      if (line.toLowerCase() === 'markdown') {
        continue;
      }
      
      // Check if this is the first line (name)
      if (processedLines.length === 0) {
        // Keep the name as is, just clean any markdown
        line = line.replace(/[#*_]/g, '').trim();
        processedLines.push(line);
        inContactInfo = true;
        continue;
      }
      
      // Handle contact information section (usually after name)
      if (inContactInfo && (line.includes('@') || line.includes('|') || line.includes(':') || 
          line.includes('Phone') || line.includes('Email') || line.includes('Location'))) {
        
        // If it contains a pipe, format it properly
        if (line.includes('|')) {
          const parts = line.split('|').map(part => {
            // Clean each part
            let cleaned = part.trim();
            // Remove markdown links [text](url) -> text
            cleaned = cleaned.replace(/\[(.*?)\]\((.*?)\)/g, '$1');
            // Remove HTML tags
            cleaned = cleaned.replace(/<[^>]*>/g, '');
            // Remove any remaining brackets
            cleaned = cleaned.replace(/[\[\]()]/g, '');
            return cleaned;
          }).filter(Boolean);
          
          // Join with pipes for proper formatting
          line = parts.join(' | ');
        } else {
          // Clean up other contact info lines
          line = line.replace(/\[(.*?)\]\((.*?)\)/g, '$1');
          line = line.replace(/<[^>]*>/g, '');
          line = line.replace(/[\[\]()]/g, '');
        }
        
        processedLines.push(line);
        continue;
      }
      
      // After contact info, we're no longer in that section
      inContactInfo = false;
      
      // Handle section headers (all caps)
      if (line === line.toUpperCase() && line.length > 2 && /[A-Z]/.test(line)) {
        // Remove any markdown formatting from section headers
        line = line.replace(/[#*_]/g, '').trim();
        processedLines.push(line);
        continue;
      }
      
      // Handle bullet points - ensure they start with a dash for consistent parsing
      if (line.startsWith('• ') || line.startsWith('* ')) {
        line = '- ' + line.substring(2);
        processedLines.push(line);
        continue;
      }
      
      // Handle job titles with dates
      if ((line.includes(' | ') || line.includes('|')) && 
          /202[0-4]|201[0-9]|Present/i.test(line)) {
        // Format as "Title | Date" for proper parsing
        const parts = line.split('|').map(part => part.trim());
        line = `${parts[0]} | ${parts[1]}`;
        processedLines.push(line);
        continue;
      }
      
      // Remove heading markers
      line = line.replace(/^#+\s+/, '');
      
      // Remove bold/italic markers
      line = line.replace(/\*\*([^*]+)\*\*/g, '$1');
      line = line.replace(/__([^_]+)__/g, '$1');
      line = line.replace(/_([^_]+)_/g, '$1');
      
      // Remove HTML tags
      line = line.replace(/<[^>]*>/g, '');
      
      // Remove markdown-style links with just the text
      line = line.replace(/\[(.*?)\]\((.*?)\)/g, '$1');
      
      // Remove mailto: prefix
      line = line.replace(/mailto:/g, '');
      
      processedLines.push(line);
    }
    
    return processedLines.join('\n');
  } catch (error) {
    console.error('Error preprocessing markdown:', error);
    return markdown; // Return original content if processing fails
  }
};

/**
 * Generates a PDF from content
 */
export const generatePDF = async (
  content: string, 
  type: 'resume' | 'cover_letter',
  setIsGenerating?: (value: boolean) => void
): Promise<void> => {
  try {
    if (setIsGenerating) {
      setIsGenerating(true);
    }
    
    if (!content) {
      toast.error('No content to download');
      if (setIsGenerating) {
        setIsGenerating(false);
      }
      return;
    }
    
    // Pre-process markdown to improve formatting
    const processedContent = preprocessMarkdown(content);

    // Create a form to submit the data
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/generate-pdf';
    form.target = '_blank'; // Open in a new tab
    form.style.display = 'none';
    
    // Add content field
    const contentField = document.createElement('input');
    contentField.type = 'hidden';
    contentField.name = 'content';
    contentField.value = processedContent;
    form.appendChild(contentField);
    
    // Add type field
    const typeField = document.createElement('input');
    typeField.type = 'hidden';
    typeField.name = 'type';
    typeField.value = type === 'resume' ? 'resume' : 'cover-letter';
    form.appendChild(typeField);
    
    // Add to document, submit, and remove
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    
    console.log(`${type === 'resume' ? 'Resume' : 'Cover letter'} PDF generator opened in a new tab`);
    toast.success(`${type === 'resume' ? 'Resume' : 'Cover letter'} generator opened in a new tab!`);
  } catch (error) {
    console.error(`Error generating PDF:`, error);
    toast.error(`Failed to generate PDF. Please try again.`);
  } finally {
    if (setIsGenerating) {
      setIsGenerating(false);
    }
  }
}; 