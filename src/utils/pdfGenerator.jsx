// PDF Generation for Application Form using jsPDF (loaded via CDN in index.html)

export const generateApplicationPDF = (applicationData) => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');

  const pageW = 210;
  const margin = 15;
  let y = 15;

  const greenDark = [15, 74, 30];
  const green = [26, 107, 46];
  const orange = [224, 123, 26];
  const gold = [200, 168, 0];
  const white = [255, 255, 255];
  const black = [0, 0, 0];

  // Header background
  doc.setFillColor(...greenDark);
  doc.rect(0, 0, pageW, 38, 'F');

  // Gold strip
  doc.setFillColor(...gold);
  doc.rect(0, 38, pageW, 2, 'F');

  // Header text
  doc.setTextColor(...white);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Telangana Tribal Welfare Residential Educational Institutions Society', pageW / 2, 10, { align: 'center' });
  doc.setFontSize(9);
  doc.text('(TGTWREIS) - Government of Telangana', pageW / 2, 17, { align: 'center' });

  doc.setFontSize(13);
  doc.setTextColor(...gold);
  doc.text('TGTWREIS V-CET 2025', pageW / 2, 25, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(...white);
  doc.text('(Entrance Exam into Class VI)', pageW / 2, 31, { align: 'center' });

  // Application No
  doc.setTextColor(...black);
  y = 50;
  doc.setFillColor(240, 249, 244);
  doc.roundedRect(margin, y - 5, pageW - margin * 2, 12, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...green);
  doc.text(`Application No: ${applicationData.applicationNo || 'PENDING'}`, margin + 5, y + 3);
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Submitted: ${new Date().toLocaleDateString('en-IN')}`, pageW - margin - 5, y + 3, { align: 'right' });

  // Photo placeholder
  if (applicationData.photo) {
    try {
      doc.addImage(applicationData.photo, 'JPEG', pageW - margin - 35, 45, 30, 35);
      doc.setDrawColor(...green);
      doc.rect(pageW - margin - 35, 45, 30, 35);
    } catch (e) {
      doc.setDrawColor(...green);
      doc.rect(pageW - margin - 35, 45, 30, 35);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text('Photo', pageW - margin - 35 + 9, 62);
    }
  }

  // Section helper
  const addSection = (title, fields) => {
    y += 10;
    if (y > 255) { doc.addPage(); y = 20; }

    // Section header
    doc.setFillColor(...green);
    doc.roundedRect(margin, y - 5, pageW - margin * 2, 9, 2, 2, 'F');
    doc.setTextColor(...white);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 5, y + 1);
    y += 8;

    // Fields
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    fields.forEach(([label, value]) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...greenDark);
      doc.text(`${String.fromCharCode(9658)} ${label}:`, margin + 3, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      doc.text(value ? String(value) : '—', margin + 70, y);
      // Underline
      doc.setDrawColor(230, 230, 230);
      doc.line(margin + 70, y + 1, pageW - margin, y + 1);
      y += 7;
    });
  };

  y = 68;

  addSection('1. Basic Details', [
    ['Aadhar No', applicationData.aadhaarNo ? `xxxx-xxxx-${applicationData.aadhaarNo.slice(-4)}` : ''],
    ['Candidate Name', applicationData.candidateName],
    ["Father's / Guardian Name", applicationData.fatherName],
    ["Mother's / Guardian Name", applicationData.motherName],
    ['Date of Birth', applicationData.dob],
    ['Gender', applicationData.gender],
    ['Email Address', applicationData.email],
    ['Mobile Number', applicationData.mobileNo],
    ['Identification Type', applicationData.idType],
    ['Identification Number', applicationData.idNumber],
  ]);

  addSection('2. Present Address', [
    ['Country', applicationData.presentCountry || 'India'],
    ['State', applicationData.presentState || 'Telangana'],
    ['District', applicationData.presentDistrict],
    ['Mandal', applicationData.presentMandal],
    ['Village', applicationData.presentVillage],
    ['PIN Code', applicationData.presentPin],
  ]);

  addSection('3. Permanent Address', [
    ['Country', applicationData.permanentCountry || 'India'],
    ['State', applicationData.permanentState || 'Telangana'],
    ['District', applicationData.permanentDistrict],
    ['Mandal', applicationData.permanentMandal],
    ['Village', applicationData.permanentVillage],
    ['PIN Code', applicationData.permanentPin],
  ]);

  addSection('4. Applied For', [
    ['Class', applicationData.appliedClass],
    ['Educational Status', applicationData.educationalStatus],
  ]);

  addSection('5. Community & Caste Details', [
    ['Community', applicationData.community],
    ['Sub Community', applicationData.subCommunity],
    ['Caste', applicationData.caste],
    ['Sub Caste', applicationData.subCaste],
    ['Income Below Threshold', applicationData.incomeBelowThreshold ? 'YES' : 'NO'],
  ]);

  // Signature
  y += 5;
  if (y > 250) { doc.addPage(); y = 20; }
  if (applicationData.signature) {
    try {
      doc.addImage(applicationData.signature, 'PNG', pageW - margin - 45, y, 40, 15);
      doc.setDrawColor(...green);
      doc.rect(pageW - margin - 45, y, 40, 15);
    } catch (e) {}
  }
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Signature of Candidate', pageW - margin - 45, y + 18);

  // Declaration
  y += 25;
  doc.setFillColor(255, 248, 220);
  doc.roundedRect(margin, y, pageW - margin * 2, 22, 3, 3, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(80, 60, 0);
  const declText = 'I hereby declare that all the information furnished above is true to the best of my knowledge. I accept all terms and conditions of the admission process.';
  const lines = doc.splitTextToSize(declText, pageW - margin * 2 - 10);
  doc.text(lines, margin + 5, y + 8);
  y += 30;

  // Footer
  doc.setFillColor(...greenDark);
  doc.rect(0, 285, pageW, 12, 'F');
  doc.setTextColor(...white);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('TTWREIS | Masab Tank, Hyderabad-500028 | admissions@ttwreis.telangana.gov.in | 040-23450678', pageW / 2, 292, { align: 'center' });

  doc.save(`TTWREIS_Application_${applicationData.applicationNo || 'FORM'}.pdf`);
};
