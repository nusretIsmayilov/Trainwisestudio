import jsPDF from 'jspdf';

export interface WelcomePDFData {
  userName: string;
  userEmail: string;
  goals: string[];
  startDate: string;
  platformName: string;
}

export function generateWelcomePDF(data: WelcomePDFData): jsPDF {
  const doc = new jsPDF();
  
  // Set up colors
  const primaryColor = '#14B8A6'; // Teal
  const secondaryColor = '#64748B'; // Slate
  const textColor = '#1F2937'; // Dark gray
  
  // Add header
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Platform name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(data.platformName, 20, 25);
  
  // Welcome message
  doc.setTextColor(textColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.text(`Welcome to your wellness journey, ${data.userName}!`, 20, 60);
  
  // Date
  doc.setFontSize(12);
  doc.setTextColor(secondaryColor);
  doc.text(`Account created: ${data.startDate}`, 20, 75);
  
  // Goals section
  doc.setFontSize(16);
  doc.setTextColor(textColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Your Wellness Goals', 20, 95);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  let yPosition = 105;
  
  if (data.goals.length > 0) {
    data.goals.forEach((goal, index) => {
      doc.text(`• ${goal}`, 25, yPosition);
      yPosition += 8;
    });
  } else {
    doc.text('• Start your wellness journey', 25, yPosition);
    yPosition += 8;
  }
  
  // Features section
  yPosition += 20;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('What you can do:', 20, yPosition);
  
  yPosition += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  const features = [
    'Track your daily wellness with check-ins',
    'Access personalized programs and content',
    'Connect with certified coaches',
    'Monitor your progress with AI insights',
    'Join a community of wellness enthusiasts'
  ];
  
  features.forEach((feature, index) => {
    doc.text(`• ${feature}`, 25, yPosition);
    yPosition += 8;
  });
  
  // Getting started section
  yPosition += 20;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Getting Started:', 20, yPosition);
  
  yPosition += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  const steps = [
    'Complete your daily check-in to track your wellness',
    'Explore the library for exercises, recipes, and meditation content',
    'Consider connecting with a coach for personalized guidance',
    'Set up your first program to start your journey'
  ];
  
  steps.forEach((step, index) => {
    doc.text(`${index + 1}. ${step}`, 25, yPosition);
    yPosition += 8;
  });
  
  // Footer
  yPosition += 30;
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);
  doc.text('Thank you for choosing Harmony Stride for your wellness journey!', 20, yPosition);
  doc.text('For support, contact us at support@harmonystride.com', 20, yPosition + 8);
  
  return doc;
}

export function downloadWelcomePDF(data: WelcomePDFData): void {
  const pdf = generateWelcomePDF(data);
  const fileName = `Welcome-${data.userName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
}

export function getWelcomePDFBlob(data: WelcomePDFData): Blob {
  const pdf = generateWelcomePDF(data);
  return pdf.output('blob');
}
