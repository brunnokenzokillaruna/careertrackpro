export const formatEducation = (education: any[]) => {
  if (!education || education.length === 0) return 'No education information provided.';
  
  return education.map(edu => {
    const institution = edu.institution || '';
    const degree = edu.degree || '';
    const field = edu.field || '';
    const startDate = edu.startDate || '';
    const endDate = edu.endDate || '';
    
    return `${degree} in ${field}, ${institution} (${startDate}-${endDate})`;
  }).join('\n');
};

export const formatExperience = (experience: any[]) => {
  if (!experience || experience.length === 0) return 'No work experience provided.';
  
  return experience.map(exp => {
    const company = exp.company || '';
    const title = exp.title || '';
    const startDate = exp.startDate || '';
    const endDate = exp.endDate || '';
    const description = exp.description || '';
    
    return `${title} at ${company} (${startDate}-${endDate})\n${description}`;
  }).join('\n\n');
};

export const formatSkills = (skills: string[]) => {
  if (!skills || skills.length === 0) return 'No skills provided.';
  return skills.join(', ');
};

export const formatCertifications = (certifications: any[]) => {
  if (!certifications || certifications.length === 0) return 'No certifications provided.';
  
  return certifications.map(cert => {
    const name = cert.name || '';
    const issuer = cert.issuer || '';
    const date = cert.date || '';
    
    return `${name} - ${issuer} (${date})`;
  }).join('\n');
};

export const formatProjects = (projects: any[]) => {
  if (!projects || projects.length === 0) return 'No projects provided.';
  
  return projects.map(proj => {
    const name = proj.name || '';
    const technologies = proj.technologies || '';
    const description = proj.description || '';
    
    return `${name} (${technologies})\n${description}`;
  }).join('\n\n');
}; 