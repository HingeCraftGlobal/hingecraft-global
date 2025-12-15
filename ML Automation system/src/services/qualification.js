/**
 * Lead Qualification Service
 * Determines template set and sequence based on profile
 */

class QualificationService {
  /**
   * Qualify lead and determine template set
   * @param {Object} contact - Contact data
   * @returns {Object} Qualification result
   */
  qualify(contact) {
    const company = (contact.company || contact.properties?.company || '').toLowerCase();
    const title = (contact.title || contact.properties?.jobtitle || '').toLowerCase();
    const website = (contact.website || contact.properties?.website || '').toLowerCase();
    const email = (contact.email || contact.properties?.email || '').toLowerCase();
    
    let leadType = 'B2B';
    let templateSet = 'set_three_b2b';
    let qualificationScore = 0;
    let indicators = [];
    
    // Student Indicators
    const studentIndicators = [
      'school', 'university', 'college', 'academy', 'education',
      'student', 'teacher', 'professor', 'educator'
    ];
    
    // NGO/Referral Indicators
    const ngoIndicators = [
      'ngo', 'nonprofit', 'non-profit', 'foundation', 'charity',
      'organization', 'association', 'society'
    ];
    
    // B2B Indicators
    const b2bIndicators = [
      'corp', 'corporation', 'inc', 'llc', 'ltd', 'company',
      'business', 'enterprise', 'tech', 'software', 'solutions'
    ];
    
    // Check for Student
    const hasStudentIndicator = studentIndicators.some(ind => 
      company.includes(ind) || title.includes(ind) || website.includes(ind)
    );
    
    if (hasStudentIndicator) {
      leadType = 'Student';
      templateSet = 'set_one_student';
      qualificationScore = 85;
      indicators.push('Student/Education detected');
    }
    
    // Check for NGO
    const hasNgoIndicator = ngoIndicators.some(ind => 
      company.includes(ind) || title.includes(ind) || website.includes(ind)
    );
    
    if (hasNgoIndicator && !hasStudentIndicator) {
      leadType = 'NGO';
      templateSet = 'set_two_referral';
      qualificationScore = 80;
      indicators.push('NGO/Nonprofit detected');
    }
    
    // Check for B2B
    const hasB2bIndicator = b2bIndicators.some(ind => 
      company.includes(ind) || title.includes(ind) || website.includes(ind)
    );
    
    if (hasB2bIndicator && !hasStudentIndicator && !hasNgoIndicator) {
      leadType = 'B2B';
      templateSet = 'set_three_b2b';
      qualificationScore = 75;
      indicators.push('B2B company detected');
    }
    
    // Email domain analysis
    if (email.includes('.edu')) {
      leadType = 'Student';
      templateSet = 'set_one_student';
      qualificationScore = 90;
      indicators.push('Educational email domain (.edu)');
    }
    
    return {
      leadType,
      templateSet,
      qualificationScore,
      indicators,
      qualified: true,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Get sequence steps for template set
   * @param {string} templateSet - Template set name
   * @returns {number} Number of steps
   */
  getSequenceSteps(templateSet) {
    const steps = {
      'set_one_student': 5,
      'set_two_referral': 1,
      'set_three_b2b': 5
    };
    return steps[templateSet] || 5;
  }
}

module.exports = new QualificationService();
