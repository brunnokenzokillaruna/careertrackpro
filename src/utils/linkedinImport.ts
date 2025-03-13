import { ProfileData } from '@/types/profile';
import JSZip from 'jszip';

/**
 * Parses CSV data from a string
 * @param text CSV text content
 * @returns Array of objects representing CSV rows
 */
export const parseCSV = (text: string): Record<string, string>[] => {
  // Split text into lines
  const lines = text.split('\n');
  
  // Get headers from the first line
  const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
  
  // Parse each line
  const results = [];
  for (let i = 1; i < lines.length; i++) {
    // Skip empty lines
    if (!lines[i].trim()) continue;
    
    const values = parseCSVLine(lines[i]);
    
    if (values.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      results.push(row);
    }
  }
  
  return results;
};

/**
 * Parses a single CSV line, handling quoted values with commas
 */
export const parseCSVLine = (line: string): string[] => {
  const values: string[] = [];
  let currentValue = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      // Toggle quote state
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      // End of value
      values.push(currentValue.trim().replace(/"/g, ''));
      currentValue = '';
    } else {
      // Part of value
      currentValue += char;
    }
  }
  
  // Push the last value
  values.push(currentValue.trim().replace(/"/g, ''));
  
  return values;
};

/**
 * Maps LinkedIn CSV data to ProfileData structure
 * @param files Object containing CSV file contents from LinkedIn export
 * @returns Structured ProfileData object
 */
export const mapLinkedinDataToProfile = (files: Record<string, string>): Partial<ProfileData> => {
  const profileData: Partial<ProfileData> = {
    education: [],
    experience: [],
    skills: [],
    certifications: [],
    languages: []
  };
  
  // Process Profile CSV if exists
  if (files['Profile.csv']) {
    const profileRows = parseCSV(files['Profile.csv']);
    if (profileRows.length > 0) {
      const profile = profileRows[0];
      profileData.fullName = profile['First Name'] + ' ' + profile['Last Name'];
      
      // Use Geo Location for location if available, otherwise fall back to Address
      if (profile['Geo Location']) {
        profileData.location = profile['Geo Location'] || '';
      } else {
        profileData.location = profile['Address'] || '';
      }
      
      profileData.linkedin = profile['Public Profile Url'] || '';
      profileData.summary = profile['Summary'] || '';
    }
  }
  
  // Process Email Addresses CSV if exists
  if (files['Email Addresses.csv']) {
    const emailRows = parseCSV(files['Email Addresses.csv']);
    // Find the primary email address or use the first one
    const primaryEmail = emailRows.find(row => row['Confirmed'] === 'Yes' && row['Primary'] === 'Yes');
    if (primaryEmail) {
      profileData.email = primaryEmail['Email Address'] || '';
    } else if (emailRows.length > 0) {
      profileData.email = emailRows[0]['Email Address'] || '';
    }
  }
  
  // Process Phone Numbers CSV if exists
  if (files['PhoneNumbers.csv']) {
    const phoneRows = parseCSV(files['PhoneNumbers.csv']);
    if (phoneRows.length > 0) {
      // Sort by date if available, otherwise use the last entry (most recent)
      let phoneNumber = '';
      
      // Try to find the most recent phone by date
      if (phoneRows[0]['Updated On']) {
        // Sort by date in descending order (most recent first)
        const sortedPhones = [...phoneRows].sort((a, b) => {
          const dateA = new Date(a['Updated On'] || '');
          const dateB = new Date(b['Updated On'] || '');
          return dateB.getTime() - dateA.getTime();
        });
        
        // Use the most recent phone number
        phoneNumber = sortedPhones[0]['Number'] || '';
      } else {
        // If no date available, use the last entry
        phoneNumber = phoneRows[phoneRows.length - 1]['Number'] || '';
      }
      
      // Format the phone number if needed
      profileData.phone = phoneNumber;
    }
  }
  
  // Skills CSV
  if (files['Skills.csv']) {
    const skillsRows = parseCSV(files['Skills.csv']);
    profileData.skills = skillsRows.map(row => row['Name'] || '').filter(Boolean);
  }
  
  // Education CSV
  if (files['Education.csv']) {
    const educationRows = parseCSV(files['Education.csv']);
    profileData.education = educationRows.map(row => ({
      institution: row['School Name'] || '',
      degree: row['Degree Name'] || '',
      field: row['Field of Study'] || '',
      startDate: row['Start Date'] || '',
      endDate: row['End Date'] || ''
    }));
  }
  
  // Positions (Experience) CSV
  if (files['Positions.csv']) {
    const experienceRows = parseCSV(files['Positions.csv']);
    profileData.experience = experienceRows.map(row => ({
      company: row['Company Name'] || '',
      position: row['Title'] || '',
      location: row['Location'] || '',
      startDate: row['Started On'] || '',
      endDate: row['Finished On'] || 'Present',
      description: row['Description'] || '',
      technologies: '' // LinkedIn doesn't provide technologies, so initialize as empty
    }));
  }
  
  // Certifications CSV
  if (files['Certifications.csv']) {
    const certRows = parseCSV(files['Certifications.csv']);
    profileData.certifications = certRows.map(row => ({
      name: row['Name'] || '',
      issuer: row['Authority'] || '',
      date: row['Started On'] || '',
      url: row['Url'] || '',
      description: ''
    }));
  }
  
  // Languages CSV
  if (files['Languages.csv']) {
    const langRows = parseCSV(files['Languages.csv']);
    profileData.languages = langRows.map(row => row['Name'] || '').filter(Boolean);
  }
  
  return profileData;
};

/**
 * Process a LinkedIn data zip file and extract CSV data
 * @param zipFile The LinkedIn data zip file
 * @returns Promise with the mapped ProfileData
 */
export const processLinkedinZipFile = async (zipFile: File): Promise<Partial<ProfileData>> => {
  try {
    const zip = new JSZip();
    const zipContents = await zip.loadAsync(zipFile);
    const fileContents: Record<string, string> = {};
    
    // Process each file in the zip archive
    const extractPromises = Object.keys(zipContents.files).map(async (filename) => {
      // Skip directories and non-CSV files
      if (zipContents.files[filename].dir || !filename.endsWith('.csv')) {
        return;
      }
      
      // Extract just the filename without path
      const simpleName = filename.split('/').pop() || filename;
      
      // Get content as text
      const content = await zipContents.files[filename].async('text');
      fileContents[simpleName] = content;
    });
    
    await Promise.all(extractPromises);
    
    return mapLinkedinDataToProfile(fileContents);
  } catch (error) {
    console.error('Error processing LinkedIn zip file:', error);
    throw new Error('Failed to process LinkedIn data. Make sure it\'s a valid LinkedIn data export.');
  }
};

/**
 * Process individual CSV files or a zip archive
 * @param files FileList from input
 * @returns Promise with the mapped ProfileData
 */
export const processLinkedinFiles = async (files: FileList): Promise<Partial<ProfileData>> => {
  // If it's a zip file, process it as such
  if (files.length === 1 && files[0].name.endsWith('.zip')) {
    return processLinkedinZipFile(files[0]);
  }
  
  // Otherwise, process individual CSV files
  const fileContents: Record<string, string> = {};
  
  // Read each CSV file
  const readPromises = Array.from(files).map(async (file) => {
    if (file.name.endsWith('.csv')) {
      const content = await file.text();
      // Extract just the filename without path
      const simpleName = file.name.split('/').pop() || file.name;
      fileContents[simpleName] = content;
    }
  });
  
  await Promise.all(readPromises);
  
  return mapLinkedinDataToProfile(fileContents);
}; 