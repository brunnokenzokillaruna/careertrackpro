import { ProfileData } from '@/types/profile';

// Month name mappings for different languages
export const monthNameMappings: Record<string, number> = {
  // English
  'january': 1, 'february': 2, 'march': 3, 'april': 4, 'may': 5, 'june': 6,
  'july': 7, 'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12,
  'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'jun': 6,
  'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12,
  // Portuguese
  'janeiro': 1, 'fevereiro': 2, 'março': 3, 'abril': 4, 'maio': 5, 'junho': 6,
  'julho': 7, 'agosto': 8, 'setembro': 9, 'outubro': 10, 'novembro': 11, 'dezembro': 12,
  // French
  'janvier': 1, 'février': 2, 'mars': 3, 'avril': 4, 'mai': 5, 'juin': 6,
  'juillet': 7, 'août': 8, 'septembre': 9, 'octobre': 10, 'novembre': 11, 'décembre': 12
};

// Helper function to parse date strings in various formats
export const parseDateString = (dateStr: string): { year: number, month: number } | null => {
  if (!dateStr) return null;
  
  const lowerDateStr = dateStr.toLowerCase();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  // Check if it's "Present" or similar
  if (lowerDateStr.includes('present') || lowerDateStr.includes('atual') || 
      lowerDateStr.includes('actuel') || lowerDateStr.includes('current')) {
    return { year: currentYear, month: currentMonth };
  }
  
  // Try ISO format: YYYY-MM or YYYY-MM-DD
  const isoMatch = dateStr.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);
  if (isoMatch) {
    const result = { 
      year: parseInt(isoMatch[1]), 
      month: parseInt(isoMatch[2])
    };
    return result;
  }
  
  // Try format with month name: "Month YYYY" or "Month, YYYY"
  for (const [monthName, monthNum] of Object.entries(monthNameMappings)) {
    const monthNameRegex = new RegExp(`${monthName}\\s*[,]?\\s*(\\d{4})`, 'i');
    const monthMatch = lowerDateStr.match(monthNameRegex);
    if (monthMatch) {
      const result = {
        year: parseInt(monthMatch[1]),
        month: monthNum
      };
      return result;
    }
  }
  
  // Try format: "MM/YYYY" or "MM-YYYY"
  const slashMatch = dateStr.match(/^(\d{1,2})[\/\-](\d{4})$/);
  if (slashMatch) {
    const result = {
      year: parseInt(slashMatch[2]),
      month: parseInt(slashMatch[1])
    };
    return result;
  }
  
  // If only year is provided
  const yearMatch = dateStr.match(/^(\d{4})$/);
  if (yearMatch) {
    const result = {
      year: parseInt(yearMatch[1]),
      month: 1 // Default to January if only year is provided
    };
    return result;
  }
  
  // Try to extract month and year in any order
  const monthYearMatch = dateStr.match(/(\d{1,2})[\s\/\-](\d{4})|(\d{4})[\s\/\-](\d{1,2})/);
  if (monthYearMatch) {
    // Check which group matched (month-year or year-month)
    if (monthYearMatch[1] && monthYearMatch[2]) {
      // Format: MM YYYY
      const result = {
        year: parseInt(monthYearMatch[2]),
        month: parseInt(monthYearMatch[1])
      };
      return result;
    } else if (monthYearMatch[3] && monthYearMatch[4]) {
      // Format: YYYY MM
      const result = {
        year: parseInt(monthYearMatch[3]),
        month: parseInt(monthYearMatch[4])
      };
      return result;
    }
  }
  
  return null;
};

// Calculate total experience years from profile data
export const calculateTotalExperienceYears = (profileData: ProfileData): { years: number; months: number } => {
  if (!profileData.experience || profileData.experience.length === 0) {
    return { years: 0, months: 0 };
  }

  let totalMonths = 0;
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Process each experience entry
  profileData.experience.forEach(exp => {
    const startDate = parseDateString(exp.startDate);
    const endDate = parseDateString(exp.endDate) || { year: currentYear, month: currentMonth };

    if (startDate) {
      // Calculate months between start and end dates
      const months = (endDate.year - startDate.year) * 12 + (endDate.month - startDate.month);
      if (months > 0) {
        totalMonths += months;
      }
    }
  });

  // Convert total months to years and months
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  return { years, months };
};

// Calculate experience years for a specific skill
export const getExperienceYearsForSkill = (profileData: ProfileData, skill: string): number => {
  if (!skill || !profileData.experience || profileData.experience.length === 0) {
    return 0;
  }

  const skillLower = skill.toLowerCase();
  let totalMonths = 0;
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Process each experience entry that mentions the skill
  profileData.experience.forEach(exp => {
    // Only check the technologies field, not the description
    const technologies = (exp.technologies || '').toLowerCase();
    
    // Split by comma and trim each technology
    const techList = technologies.split(',').map((tech: string) => tech.trim().toLowerCase());
    
    // Check if the skill is in the technologies list (exact match only)
    // This is more strict to avoid false matches
    const isMatch = techList.some((tech: string) => tech === skillLower);
    
    if (isMatch) {
      const startDate = parseDateString(exp.startDate);
      const endDate = parseDateString(exp.endDate) || { year: currentYear, month: currentMonth };

      if (startDate) {
        // Calculate months between start and end dates
        // Add 1 to include both the start and end months in the calculation
        const months = (endDate.year - startDate.year) * 12 + (endDate.month - startDate.month) + 1;
        if (months > 0) {
          totalMonths += months;
        }
      }
    }
  });

  // If less than 12 months, return the value in months
  if (totalMonths < 12) {
    // Return the exact number of months as a decimal (e.g., 0.25 for 3 months)
    return totalMonths / 12;
  }
  
  // Otherwise, convert total months to years (rounded to nearest 0.5)
  return Math.round(totalMonths / 6) / 2;
};

// Format date for display
export const formatDate = (dateStr: string): string => {
  const parsed = parseDateString(dateStr);
  if (!parsed) return dateStr;
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return `${monthNames[parsed.month - 1]} ${parsed.year}`;
}; 