import fs from 'fs';

const csvPath = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\d6f56583-4b7a-4366-9689-336fd2d23ca9\\cantor_glass_packages_mapping.csv';

const packages = [
  // Double Glazed
  ...['2-18', '2-20', '2-22', '2-24', '2-26', '2-28', '2-30', '2-32', '2-34', '2-36'].map(p => ['Double Glazed (2-Pane)', p, p.split('-')[1] + 'mm', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes']),
  ...['2-38', '2-40'].map(p => ['Double Glazed (2-Pane)', p, p.split('-')[1] + 'mm', 'No', 'No', 'No', 'Yes', 'Yes', 'Yes', 'Yes']),
  
  // Triple Glazed
  ...['3-24', '3-28', '3-30', '3-32', '3-34', '3-36'].map(p => ['Triple Glazed (3-Pane)', p, p.split('-')[1] + 'mm', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes']),
  ...['3-38', '3-40', '3-42', '3-44', '3-46', '3-48'].map(p => ['Triple Glazed (3-Pane)', p, p.split('-')[1] + 'mm', 'No', 'No', 'No', 'Yes', 'Yes', 'Yes', 'Yes']),
  ['Triple Glazed (3-Pane)', '3-50', '50mm', 'No', 'No', 'No', 'No', 'No', 'No', 'Yes'],

  // Quadruple Glazed
  ['Quadruple Glazed (4-Pane)', '4-58', '58mm', 'No', 'No', 'No', 'No', 'No', 'No', 'No'],
  ['Quadruple Glazed (4-Pane)', '4-58BlackLine', '58mm', 'No', 'No', 'No', 'No', 'No', 'No', 'No'],
  ['Quadruple Glazed (4-Pane)', '4-68', '68mm', 'No', 'No', 'No', 'No', 'No', 'No', 'No'],

  // Special Glass up to 36mm
  ['Special Glass', 'B1/16/T6', '~26mm', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes'],
  ['Special Glass', 'FL6/16/T6', '~28mm', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes'],
  ['Special Glass', 'TB1/12/SR9/16/TB1', '~36mm', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes'],

  // Special Glass 38-48mm
  ['Special Glass', '3-40BlackLine', '40mm', 'No', 'No', 'No', 'Yes', 'Yes', 'Yes', 'Yes'],
  ['Special Glass', 'TSR9/16/FL8/16/TSR9', '48mm', 'No', 'No', 'No', 'Yes', 'Yes', 'Yes', 'Yes'],
  ['Special Glass', 'LacGraphite', '48mm', 'No', 'No', 'No', 'Yes', 'Yes', 'Yes', 'Yes'],

  // Special Glass 50mm
  ['Special Glass', '3-50BlackLine', '50mm', 'No', 'No', 'No', 'No', 'No', 'No', 'Yes'],

  // Non-Glazing Panels up to 36mm
  ...['PCW24', 'PVC24', 'ALU22', 'ALU34', 'DRE24', 'DRA_25', 'PCW36', 'PVC36', 'CA100_36', 'DB100_36', 'DB200_36'].map(p => ['Non-Glazing & Decorative Panels', p, p.match(/\\d+/) ? p.match(/\\d+/)[0] + 'mm' : 'varies', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes']),

  // Non-Glazing Panels 40-48mm
  ...['ALU42', 'ALU46', 'PCW48', 'PVC48', 'CA100_48', 'CA200_48', 'DB100_48', 'DB200_48', 'DRE40', 'DRE48'].map(p => ['Non-Glazing & Decorative Panels', p, p.match(/\\d+/) ? p.match(/\\d+/)[0] + 'mm' : 'varies', 'No', 'No', 'No', 'Yes', 'Yes', 'Yes', 'Yes']),

  // Unglazed
  ...['BS18', 'BS20', 'BS22', 'BS24', 'BS26', 'BS28', 'BS30', 'BS32', 'BS34', 'BS36'].map(p => ['Unglazed (Prepared for Glass)', p, p.split('BS')[1] + 'mm', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes']),
  ...['BS38', 'BS40', 'BS42', 'BS44', 'BS46', 'BS48'].map(p => ['Unglazed (Prepared for Glass)', p, p.split('BS')[1] + 'mm', 'No', 'No', 'No', 'Yes', 'Yes', 'Yes', 'Yes']),
  ['Unglazed (Prepared for Glass)', 'BS50', '50mm', 'No', 'No', 'No', 'No', 'No', 'No', 'Yes']
];

let csvContent = 'Package Category,Package Name,Approximate Thickness,IG5,IG5_NL,IGECL,IGP,IGPCL,IGP_NL,BRG\\n';

packages.forEach(row => {
  csvContent += row.join(',') + '\\n';
});

fs.writeFileSync(csvPath, csvContent, 'utf8');
console.log('CSV created at ' + csvPath);
