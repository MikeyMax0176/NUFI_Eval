const { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableCell, 
  TableRow,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  TableOfContents,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  NumberFormat
} = require('docx');

/**
 * Professional Word Document Generator for NUFI API Reports
 * Creates clean, structured .docx files with proper styles, TOC, headers/footers
 */

// Brand colors
const BLG_BLUE = '0066CC';
const TEXT_DARK = '2C3E50';
const TEXT_MEDIUM = '34495E';
const BACKGROUND_LIGHT = 'F8F9FA';

/**
 * Sanitize content - remove duplicates and clean up data
 */
const sanitizeContent = (data) => {
  // Create a deep clone to avoid mutations
  const sanitized = JSON.parse(JSON.stringify(data));
  
  // Recursive function to clean object
  const cleanObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => cleanObject(item));
    }
    
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      // Remove internal fields
      if (key === '@search_pointer' || 
          key === 'search_pointer' || 
          key.endsWith('_md5') || 
          key === '@inferred' ||
          key === '@id') {
        continue;
      }
      
      // Remove duplicate brand blocks
      if (key === 'brandBlocks') {
        continue;
      }
      
      if (value && typeof value === 'object') {
        cleaned[key] = cleanObject(value);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  };
  
  return cleanObject(sanitized);
};

/**
 * Format date consistently
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

/**
 * Format phone number
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return 'N/A';
  const cleaned = phone.toString().replace(/\D/g, '');
  if (cleaned.length === 12) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
};

/**
 * Create cover page with title, MSISDN, metadata
 */
const createCoverPage = (apiName, phoneNumber, metadata = {}) => {
  const timestamp = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return [
    // Title
    new Paragraph({
      text: 'Blueline | Global Technologies',
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
      alignment: AlignmentType.CENTER
    }),
    new Paragraph({
      text: 'ITERATIVE TASKING',
      spacing: { after: 400 },
      alignment: AlignmentType.CENTER,
      style: 'Strong'
    }),
    new Paragraph({
      text: `NUFI API Report: ${apiName}`,
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 400 },
      alignment: AlignmentType.CENTER
    }),
    
    // Phone number if provided
    ...(phoneNumber ? [
      new Paragraph({
        children: [
          new TextRun({
            text: 'MSISDN: ',
            bold: true,
            size: 28
          }),
          new TextRun({
            text: formatPhoneNumber(phoneNumber),
            size: 28,
            color: BLG_BLUE
          })
        ],
        spacing: { after: 300 },
        alignment: AlignmentType.CENTER
      })
    ] : []),
    
    // Metadata
    new Paragraph({
      children: [
        new TextRun({
          text: 'Report Generated: ',
          bold: true
        }),
        new TextRun({
          text: timestamp
        })
      ],
      spacing: { after: 100 },
      alignment: AlignmentType.CENTER
    }),
    
    ...(metadata.caseId ? [
      new Paragraph({
        children: [
          new TextRun({
            text: 'Case ID: ',
            bold: true
          }),
          new TextRun({
            text: metadata.caseId
          })
        ],
        spacing: { after: 100 },
        alignment: AlignmentType.CENTER
      })
    ] : []),
    
    // Classification footer
    new Paragraph({
      text: 'INTERNAL USE ONLY - CONFIDENTIAL',
      spacing: { before: 800 },
      alignment: AlignmentType.CENTER,
      style: 'IntenseQuote'
    }),
    
    // Page break after cover
    new Paragraph({
      children: [new PageBreak()]
    })
  ];
};

/**
 * Create Table of Contents
 */
const createTableOfContents = () => {
  return [
    new Paragraph({
      text: 'Table of Contents',
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 }
    }),
    new TableOfContents('Table of Contents', {
      hyperlink: true,
      headingStyleRange: '1-3'
    }),
    new Paragraph({
      children: [new PageBreak()],
      spacing: { before: 400 }
    })
  ];
};

/**
 * Create metrics table from data
 */
const createMetricsTable = (title, data, columnHeaders = []) => {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return [
      new Paragraph({
        text: `${title}: No data available`,
        italics: true,
        spacing: { after: 200 }
      })
    ];
  }

  const rows = [];
  
  // Add header row
  if (columnHeaders.length > 0) {
    rows.push(
      new TableRow({
        children: columnHeaders.map(header => 
          new TableCell({
            children: [
              new Paragraph({
                text: header,
                bold: true,
                alignment: AlignmentType.CENTER
              })
            ],
            shading: { fill: BACKGROUND_LIGHT }
          })
        ),
        tableHeader: true
      })
    );
  }

  // Add data rows
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      const cells = typeof item === 'object' 
        ? Object.values(item).map(val => String(val || 'N/A'))
        : [String(index + 1), String(item)];
      
      rows.push(
        new TableRow({
          children: cells.map((cell, idx) =>
            new TableCell({
              children: [
                new Paragraph({
                  text: cell,
                  alignment: idx > 0 ? AlignmentType.RIGHT : AlignmentType.LEFT
                })
              ]
            })
          )
        })
      );
    });
  } else if (typeof data === 'object') {
    // Object - convert to key-value rows
    Object.entries(data).forEach(([key, value]) => {
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: key, bold: true })],
              width: { size: 40, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [new Paragraph({ text: String(value || 'N/A') })],
              width: { size: 60, type: WidthType.PERCENTAGE }
            })
          ]
        })
      );
    });
  }

  return [
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 150 }
    }),
    new Table({
      rows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
        left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
        right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' }
      }
    }),
    new Paragraph({ text: '', spacing: { after: 200 } })
  ];
};

/**
 * Create analyst assessment callout box
 */
const createAnalystCallout = (content) => {
  return new Paragraph({
    children: [
      new TextRun({
        text: '💡 Analyst Assessment: ',
        bold: true,
        color: BLG_BLUE
      }),
      new TextRun({
        text: content
      })
    ],
    spacing: { before: 200, after: 200 },
    indent: { left: 400 },
    border: {
      left: { style: BorderStyle.SINGLE, size: 20, color: BLG_BLUE }
    },
    shading: { fill: BACKGROUND_LIGHT }
  });
};

/**
 * Render nested object as structured sections
 */
const renderObjectSections = (obj, headingLevel = HeadingLevel.HEADING_2) => {
  if (!obj || typeof obj !== 'object') {
    return [new Paragraph({ text: 'No data available', italics: true })];
  }

  const elements = [];

  for (const [key, value] of Object.entries(obj)) {
    // Skip metadata fields
    if (key === 'metadata' || key.startsWith('@') || key === 'brandBlocks') continue;

    const label = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();

    if (value === null || value === undefined) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${label}: `, bold: true }),
            new TextRun({ text: 'N/A', italics: true, color: '999999' })
          ],
          spacing: { after: 100 }
        })
      );
    } else if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 3) {
      // Large nested object - create subsection
      elements.push(
        new Paragraph({
          text: label,
          heading: headingLevel === HeadingLevel.HEADING_2 ? HeadingLevel.HEADING_3 : HeadingLevel.HEADING_4,
          spacing: { before: 200, after: 100 }
        }),
        ...renderObjectSections(value, HeadingLevel.HEADING_3)
      );
    } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
      // Array of objects - create table
      const columns = Object.keys(value[0]);
      elements.push(...createMetricsTable(label, value, columns));
    } else {
      // Simple value
      const displayValue = Array.isArray(value) 
        ? value.join(', ') 
        : typeof value === 'object' 
          ? JSON.stringify(value, null, 2)
          : String(value);

      elements.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${label}: `, bold: true }),
            new TextRun({ text: displayValue })
          ],
          spacing: { after: 100 }
        })
      );
    }
  }

  return elements;
};

/**
 * Main document generation function
 */
const generateDocument = async (data, apiName, phoneNumber = null, metadata = {}) => {
  const sanitized = sanitizeContent(data);
  
  // Extract response data
  let responseData;
  if (sanitized.data) {
    responseData = sanitized.data;
  } else if (sanitized.results) {
    responseData = sanitized.results;
  } else {
    responseData = sanitized;
  }

  // Build document sections
  const sections = [];

  // 1. Cover Page
  sections.push(...createCoverPage(apiName, phoneNumber, metadata));

  // 2. Table of Contents
  sections.push(...createTableOfContents());

  // 3. Query Information Section
  sections.push(
    new Paragraph({
      text: '1. Query Information',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 150 },
      pageBreakBefore: false
    })
  );

  const queryInfo = {
    'API Endpoint': metadata.endpoint || apiName,
    'Query Timestamp': formatDate(metadata.timestamp),
    'Parameters Used': metadata.paramsUsed ? metadata.paramsUsed.join(', ') : 'N/A',
    ...(phoneNumber && { 'Phone Number': formatPhoneNumber(phoneNumber) })
  };

  sections.push(...createMetricsTable('Query Details', queryInfo));

  // 4. Results Data Section
  sections.push(
    new Paragraph({
      text: '2. Results Data',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 150 },
      pageBreakBefore: true
    })
  );

  sections.push(...renderObjectSections(responseData));

  // 5. Appendices (if any attachments or references)
  if (sanitized.attachments || sanitized.references) {
    sections.push(
      new Paragraph({
        text: 'Appendix A: Supporting Documents',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 150 },
        pageBreakBefore: true
      })
    );
    
    if (sanitized.attachments) {
      sections.push(...renderObjectSections(sanitized.attachments));
    }
    if (sanitized.references) {
      sections.push(...renderObjectSections(sanitized.references));
    }
  }

  // Create document
  const doc = new Document({
    creator: 'Guardian Fusion - Blueline Global Technologies',
    title: `NUFI Report - ${apiName}`,
    description: `Generated report for ${phoneNumber || 'NUFI query'}`,
    styles: {
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          run: {
            font: 'Aptos',
            size: 22 // 11pt
          },
          paragraph: {
            spacing: { before: 0, after: 120, line: 276 } // 1.15 line spacing
          }
        },
        {
          id: 'Strong',
          name: 'Strong',
          basedOn: 'Normal',
          run: {
            bold: true,
            font: 'Aptos',
            size: 24
          }
        }
      ]
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                text: `${apiName} Report ${phoneNumber ? '- ' + formatPhoneNumber(phoneNumber) : ''}`,
                alignment: AlignmentType.CENTER,
                style: 'Normal',
                spacing: { after: 100 }
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    children: ['Page ', PageNumber.CURRENT, ' of ', PageNumber.TOTAL_PAGES]
                  })
                ],
                alignment: AlignmentType.CENTER
              })
            ]
          })
        },
        children: sections
      }
    ]
  });

  // Generate buffer
  const buffer = await Packer.toBuffer(doc);
  return buffer;
};

module.exports = {
  generateDocument,
  sanitizeContent,
  formatDate,
  formatPhoneNumber
};
