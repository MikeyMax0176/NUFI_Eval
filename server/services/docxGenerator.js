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
  PageBreak,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  TableLayoutType,
  VerticalAlign
} = require('docx');

/**
 * Professional Word Document Generator for Enrichment Reports
 * Creates clean, sanitized dossier-style reports with no vendor branding
 */

// Neutral colors for professional reports
const HEADER_COLOR = '2C3E50';
const TEXT_COLOR = '34495E';
const BACKGROUND_LIGHT = 'F5F5F5';

/**
 * Sanitize content - remove vendor strings, quota/QPS fields, and internal metadata
 */
const sanitizeForDoc = (data, debugMode = false) => {
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
      // Remove internal/metadata fields
      if (key === '@search_pointer' || 
          key === 'search_pointer' || 
          key.endsWith('_md5') || 
          key === '@inferred' ||
          key === '@id' ||
          key === 'brandBlocks') {
        continue;
      }
      
      // Remove quota/QPS fields unless debug mode is enabled
      if (!debugMode && (
          key === 'quota_allotted' ||
          key === 'quota_current' ||
          key === 'quota_reset' ||
          key === 'qps_allotted' ||
          key === 'qps_current' ||
          key.includes('quota') ||
          key.includes('qps'))) {
        continue;
      }
      
      // Remove endpoint reference
      if (key === 'endpoint') {
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
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  } catch {
    return dateString;
  }
};

/**
 * Format datetime with UTC timezone
 */
const formatDateTime = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes} UTC`;
  } catch {
    return dateString;
  }
};

/**
 * Format phone number for display
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.toString().replace(/\D/g, '');
  if (cleaned.length >= 10) {
    // International format with country code
    if (cleaned.length === 12) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
    if (cleaned.length === 11) {
      return `+${cleaned.slice(0, 1)} ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
  }
  return phone;
};

/**
 * Extract selector (phone number) from query data
 */
const extractSelector = (data) => {
  if (data.query && data.query.phones && data.query.phones.length > 0) {
    const phone = data.query.phones[0];
    return phone.number || phone.raw || phone;
  }
  return 'Unknown';
};

/**
 * Extract country code from query data
 */
const extractCountryCode = (data) => {
  if (data.query && data.query.phones && data.query.phones.length > 0) {
    const phone = data.query.phones[0];
    if (phone.country_code) return phone.country_code;
  }
  return '';
};

/**
 * Create document title - just the selector (phone number) and optional subtitle
 */
const createTitle = (selector) => {
  return [
    new Paragraph({
      text: selector,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 100 },
      alignment: AlignmentType.CENTER
    }),
    new Paragraph({
      text: 'Enrichment Report',
      spacing: { after: 400 },
      alignment: AlignmentType.CENTER,
      style: 'Subtitle'
    })
  ];
};

/**
 * Create Query Summary table
 */
const createQuerySummary = (data) => {
  const selector = extractSelector(data);
  const countryCode = extractCountryCode(data);
  const queryDate = data.query && data.query.timestamp ? formatDate(data.query.timestamp) : formatDate(new Date());
  
  const rows = [
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: 'Queried Phone', bold: true })],
          width: { size: 30, type: WidthType.PERCENTAGE },
          shading: { fill: BACKGROUND_LIGHT }
        }),
        new TableCell({
          children: [new Paragraph({ text: selector })],
          width: { size: 70, type: WidthType.PERCENTAGE }
        })
      ]
    })
  ];
  
  if (countryCode) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'Country Code', bold: true })],
            shading: { fill: BACKGROUND_LIGHT }
          }),
          new TableCell({
            children: [new Paragraph({ text: String(countryCode) })]
          })
        ]
      })
    );
  }
  
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: 'Query Date', bold: true })],
          shading: { fill: BACKGROUND_LIGHT }
        }),
        new TableCell({
          children: [new Paragraph({ text: queryDate })]
        })
      ]
    })
  );
  
  return [
    new Paragraph({
      text: 'Query Summary',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 }
    }),
    new Table({
      rows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
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
 * Create Names table
 */
const createNamesTable = (names) => {
  if (!names || !Array.isArray(names) || names.length === 0) {
    return [];
  }

  const headerRow = new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ text: 'Display Name', bold: true, alignment: AlignmentType.CENTER })],
        width: { size: 20, type: WidthType.PERCENTAGE },
        shading: { fill: BACKGROUND_LIGHT }
      }),
      new TableCell({
        children: [new Paragraph({ text: 'First', bold: true, alignment: AlignmentType.CENTER })],
        width: { size: 15, type: WidthType.PERCENTAGE },
        shading: { fill: BACKGROUND_LIGHT }
      }),
      new TableCell({
        children: [new Paragraph({ text: 'Middle', bold: true, alignment: AlignmentType.CENTER })],
        width: { size: 15, type: WidthType.PERCENTAGE },
        shading: { fill: BACKGROUND_LIGHT }
      }),
      new TableCell({
        children: [new Paragraph({ text: 'Last', bold: true, alignment: AlignmentType.CENTER })],
        width: { size: 15, type: WidthType.PERCENTAGE },
        shading: { fill: BACKGROUND_LIGHT }
      }),
      new TableCell({
        children: [new Paragraph({ text: 'Valid Since', bold: true, alignment: AlignmentType.CENTER })],
        width: { size: 17, type: WidthType.PERCENTAGE },
        shading: { fill: BACKGROUND_LIGHT }
      }),
      new TableCell({
        children: [new Paragraph({ text: 'Last Seen', bold: true, alignment: AlignmentType.CENTER })],
        width: { size: 18, type: WidthType.PERCENTAGE },
        shading: { fill: BACKGROUND_LIGHT }
      })
    ],
    tableHeader: true
  });

  const dataRows = names.map(name => 
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: name.display || '' })]
        }),
        new TableCell({
          children: [new Paragraph({ text: name.first || '' })]
        }),
        new TableCell({
          children: [new Paragraph({ text: name.middle || '' })]
        }),
        new TableCell({
          children: [new Paragraph({ text: name.last || '' })]
        }),
        new TableCell({
          children: [new Paragraph({ text: formatDate(name.valid_since) || '' })]
        }),
        new TableCell({
          children: [new Paragraph({ text: formatDate(name.last_seen) || '' })]
        })
      ]
    })
  );

  return [
    new Paragraph({
      text: 'Names',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 100 }
    }),
    new Table({
      rows: [headerRow, ...dataRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
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
 * Create Phones table
 */
const createPhonesTable = (phones) => {
  if (!phones || !Array.isArray(phones) || phones.length === 0) {
    return [];
  }

  const headerRow = new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ text: 'Phone (Intl)', bold: true, alignment: AlignmentType.CENTER })],
        width: { size: 18, type: WidthType.PERCENTAGE },
        shading: { fill: BACKGROUND_LIGHT }
      }),
      new TableCell({
        children: [new Paragraph({ text: 'Phone (Local)', bold: true, alignment: AlignmentType.CENTER })],
        width: { size: 18, type: WidthType.PERCENTAGE },
        shading: { fill: BACKGROUND_LIGHT }
      }),
      new TableCell({
        children: [new Paragraph({ text: 'Type', bold: true, alignment: AlignmentType.CENTER })],
        width: { size: 12, type: WidthType.PERCENTAGE },
        shading: { fill: BACKGROUND_LIGHT }
      }),
      new TableCell({
        children: [new Paragraph({ text: 'Carrier', bold: true, alignment: AlignmentType.CENTER })],
        width: { size: 16, type: WidthType.PERCENTAGE },
        shading: { fill: BACKGROUND_LIGHT }
      }),
      new TableCell({
        children: [new Paragraph({ text: 'Valid Since', bold: true, alignment: AlignmentType.CENTER })],
        width: { size: 18, type: WidthType.PERCENTAGE },
        shading: { fill: BACKGROUND_LIGHT }
      }),
      new TableCell({
        children: [new Paragraph({ text: 'Last Seen', bold: true, alignment: AlignmentType.CENTER })],
        width: { size: 18, type: WidthType.PERCENTAGE },
        shading: { fill: BACKGROUND_LIGHT }
      })
    ],
    tableHeader: true
  });

  const dataRows = phones.map(phone => 
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: formatPhoneNumber(phone.number) || '' })]
        }),
        new TableCell({
          children: [new Paragraph({ text: phone.display_international || phone.display || '' })]
        }),
        new TableCell({
          children: [new Paragraph({ text: phone.type || '' })]
        }),
        new TableCell({
          children: [new Paragraph({ text: phone.carrier || '' })]
        }),
        new TableCell({
          children: [new Paragraph({ text: formatDate(phone.valid_since) || '' })]
        }),
        new TableCell({
          children: [new Paragraph({ text: formatDate(phone.last_seen) || '' })]
        })
      ]
    })
  );

  return [
    new Paragraph({
      text: 'Phones',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 100 }
    }),
    new Table({
      rows: [headerRow, ...dataRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
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
 * Create Emails table
 */
const createEmailsTable = (emails) => {
  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return [];
  }

  const headerRow = new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ text: 'Email', bold: true, alignment: AlignmentType.CENTER })],
        width: { size: 40, type: WidthType.PERCENTAGE },
        shading: { fill: BACKGROUND_LIGHT }
      }),
      new TableCell({
        children: [new Paragraph({ text: 'Type', bold: true, alignment: AlignmentType.CENTER })],
        width: { size: 15, type: WidthType.PERCENTAGE },
        shading: { fill: BACKGROUND_LIGHT }
      }),
      new TableCell({
        children: [new Paragraph({ text: 'Valid Since', bold: true, alignment: AlignmentType.CENTER })],
        width: { size: 22, type: WidthType.PERCENTAGE },
        shading: { fill: BACKGROUND_LIGHT }
      }),
      new TableCell({
        children: [new Paragraph({ text: 'Last Seen', bold: true, alignment: AlignmentType.CENTER })],
        width: { size: 23, type: WidthType.PERCENTAGE },
        shading: { fill: BACKGROUND_LIGHT }
      })
    ],
    tableHeader: true
  });

  const dataRows = emails.map(email => 
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: email.address || email.email || '' })]
        }),
        new TableCell({
          children: [new Paragraph({ text: email.type || '' })]
        }),
        new TableCell({
          children: [new Paragraph({ text: formatDate(email.valid_since) || '' })]
        }),
        new TableCell({
          children: [new Paragraph({ text: formatDate(email.last_seen) || '' })]
        })
      ]
    })
  );

  return [
    new Paragraph({
      text: 'Emails',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 100 }
    }),
    new Table({
      rows: [headerRow, ...dataRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
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
 * Create Addresses table
 */
const createAddressesTable = (addresses) => {
  if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
    return [];
  }

  const headerRow = new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ text: 'Address (Display)', bold: true, alignment: AlignmentType.CENTER })],
        width: { size: 30, type: WidthType.PERCENTAGE },
        shading: { fill: BACKGROUND_LIGHT }
      }),
      new TableCell({
        children: [new Paragraph({ text: 'City', bold: true, alignment: AlignmentType.CENTER })],
        width: { size: 15, type: WidthType.PERCENTAGE },
        shading: { fill: BACKGROUND_LIGHT }
      }),
      new TableCell({
        children: [new Paragraph({ text: 'State', bold: true, alignment: AlignmentType.CENTER })],
        width: { size: 10, type: WidthType.PERCENTAGE },
        shading: { fill: BACKGROUND_LIGHT }
      }),
      new TableCell({
        children: [new Paragraph({ text: 'Country', bold: true, alignment: AlignmentType.CENTER })],
        width: { size: 10, type: WidthType.PERCENTAGE },
        shading: { fill: BACKGROUND_LIGHT }
      }),
      new TableCell({
        children: [new Paragraph({ text: 'Valid Since', bold: true, alignment: AlignmentType.CENTER })],
        width: { size: 17, type: WidthType.PERCENTAGE },
        shading: { fill: BACKGROUND_LIGHT }
      }),
      new TableCell({
        children: [new Paragraph({ text: 'Last Seen', bold: true, alignment: AlignmentType.CENTER })],
        width: { size: 18, type: WidthType.PERCENTAGE },
        shading: { fill: BACKGROUND_LIGHT }
      })
    ],
    tableHeader: true
  });

  const dataRows = addresses.map(addr => 
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: addr.display || addr.address || '' })]
        }),
        new TableCell({
          children: [new Paragraph({ text: addr.city || '' })]
        }),
        new TableCell({
          children: [new Paragraph({ text: addr.state || '' })]
        }),
        new TableCell({
          children: [new Paragraph({ text: addr.country || '' })]
        }),
        new TableCell({
          children: [new Paragraph({ text: formatDate(addr.valid_since) || '' })]
        }),
        new TableCell({
          children: [new Paragraph({ text: formatDate(addr.last_seen) || '' })]
        })
      ]
    })
  );

  return [
    new Paragraph({
      text: 'Addresses',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 100 }
    }),
    new Table({
      rows: [headerRow, ...dataRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
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
 * Create Demographics section (Gender and Languages)
 */
const createDemographics = (data) => {
  const elements = [];
  
  // Gender
  if (data.gender || (data.genders && data.genders.length > 0)) {
    const gender = data.gender || (data.genders && data.genders[0] ? data.genders[0].content || data.genders[0] : '');
    if (gender) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Gender: ', bold: true }),
            new TextRun({ text: gender.charAt(0).toUpperCase() + gender.slice(1) })
          ],
          spacing: { after: 100 }
        })
      );
    }
  }
  
  // Languages
  if (data.languages && Array.isArray(data.languages) && data.languages.length > 0) {
    const languagesStr = data.languages.map(lang => {
      if (typeof lang === 'string') return lang;
      if (lang.language && lang.region) return `${lang.language} (${lang.region})`;
      if (lang.language) return lang.language;
      return JSON.stringify(lang);
    }).join(', ');
    
    elements.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Languages: ', bold: true }),
          new TextRun({ text: languagesStr })
        ],
        spacing: { after: 100 }
      })
    );
  }
  
  if (elements.length === 0) {
    return [];
  }
  
  return [
    new Paragraph({
      text: 'Demographics',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 100 }
    }),
    ...elements,
    new Paragraph({ text: '', spacing: { after: 200 } })
  ];
};

/**
 * Create Available Data (Premium Counts) table
 */
const createAvailableDataTable = (data) => {
  const counts = {
    'Addresses': 0,
    'Phones': 0,
    'Emails': 0,
    'Names': 0,
    'Genders': 0,
    'Languages': 0
  };
  
  if (data.addresses && Array.isArray(data.addresses)) counts['Addresses'] = data.addresses.length;
  if (data.phones && Array.isArray(data.phones)) counts['Phones'] = data.phones.length;
  if (data.emails && Array.isArray(data.emails)) counts['Emails'] = data.emails.length;
  if (data.names && Array.isArray(data.names)) counts['Names'] = data.names.length;
  if (data.genders && Array.isArray(data.genders)) counts['Genders'] = data.genders.length;
  else if (data.gender) counts['Genders'] = 1;
  if (data.languages && Array.isArray(data.languages)) counts['Languages'] = data.languages.length;
  
  const rows = [
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: 'Data Type', bold: true, alignment: AlignmentType.CENTER })],
          width: { size: 50, type: WidthType.PERCENTAGE },
          shading: { fill: BACKGROUND_LIGHT }
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Count', bold: true, alignment: AlignmentType.CENTER })],
          width: { size: 50, type: WidthType.PERCENTAGE },
          shading: { fill: BACKGROUND_LIGHT }
        })
      ],
      tableHeader: true
    })
  ];
  
  Object.entries(counts).forEach(([type, count]) => {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: type })]
          }),
          new TableCell({
            children: [new Paragraph({ text: String(count), alignment: AlignmentType.CENTER })]
          })
        ]
      })
    );
  });
  
  return [
    new Paragraph({
      text: 'Available Data',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 100 }
    }),
    new Table({
      rows,
      width: { size: 60, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
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
 * Main document generation function - Creates professional dossier-style report
 */
const generateDocument = async (data, apiName, phoneNumber = null, metadata = {}) => {
  // Sanitize data to remove vendor strings and quota/QPS fields
  const sanitized = sanitizeForDoc(data, metadata.debugMode || false);
  
  // Extract response data - handle both direct and nested structures
  let responseData;
  if (sanitized.data) {
    responseData = sanitized.data;
  } else if (sanitized.results) {
    responseData = sanitized.results;
  } else {
    responseData = sanitized;
  }
  
  // Handle additional nesting: if responseData has {status, message, data: {...}}
  // Extract the inner data object
  if (responseData.data && responseData.status && !responseData.person) {
    responseData = responseData.data;
  }
  
  console.log('[generateDocument] After extraction:', JSON.stringify({
    originalKeys: Object.keys(sanitized),
    responseDataKeys: Object.keys(responseData),
    hasQuery: !!responseData.query,
    hasPerson: !!responseData.person,
    queryKeys: responseData.query ? Object.keys(responseData.query) : [],
    personKeys: responseData.person ? Object.keys(responseData.person) : []
  }, null, 2));
  
  // If data is nested in a 'person' object (NUFI API structure), extract it
  // But keep query and other top-level fields
  if (responseData.person) {
    responseData = {
      ...responseData,
      ...responseData.person,
      // Normalize field names from @-prefixed to regular
      names: responseData.person.names?.map(n => ({
        display: n.display || '',
        first: n.first || '',
        middle: n.middle || '',
        last: n.last || '',
        valid_since: n['@valid_since'] || n.valid_since || '',
        last_seen: n['@last_seen'] || n.last_seen || ''
      })) || [],
      phones: responseData.person.phones?.map(p => ({
        number: p.number || '',
        display: p.display || '',
        display_international: p.display_international || '',
        type: p['@type'] || p.type || '',
        carrier: p.carrier || '',
        valid_since: p['@valid_since'] || p.valid_since || '',
        last_seen: p['@last_seen'] || p.last_seen || ''
      })) || [],
      emails: responseData.person.emails?.map(e => ({
        address: e.address || e.display || '',
        type: e['@type'] || e.type || '',
        valid_since: e['@valid_since'] || e.valid_since || '',
        last_seen: e['@last_seen'] || e.last_seen || ''
      })) || [],
      addresses: responseData.person.addresses?.map(a => ({
        display: a.display || a.address || '',
        city: a.city || '',
        state: a.state || '',
        country: a.country || '',
        valid_since: a['@valid_since'] || a.valid_since || '',
        last_seen: a['@last_seen'] || a.last_seen || ''
      })) || [],
      gender: typeof responseData.person.gender === 'object' ? responseData.person.gender.content : responseData.person.gender,
      languages: responseData.person.languages || []
    };
  }

  // Extract selector (phone number) for title
  const selector = extractSelector(responseData);
  const generatedDateTime = formatDateTime(new Date());

  // Build document sections
  const sections = [];

  // 1. Title
  sections.push(...createTitle(selector));

  // 2. Query Summary
  sections.push(...createQuerySummary(responseData));

  // 3. Identity Summary Header
  sections.push(
    new Paragraph({
      text: 'Identity Summary',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 100 }
    })
  );

  // 4. Names Table
  if (responseData.names && responseData.names.length > 0) {
    sections.push(...createNamesTable(responseData.names));
  }

  // 5. Phones Table
  if (responseData.phones && responseData.phones.length > 0) {
    sections.push(...createPhonesTable(responseData.phones));
  }

  // 6. Emails Table
  if (responseData.emails && responseData.emails.length > 0) {
    sections.push(...createEmailsTable(responseData.emails));
  }

  // 7. Addresses Table
  if (responseData.addresses && responseData.addresses.length > 0) {
    sections.push(...createAddressesTable(responseData.addresses));
  }

  // 8. Demographics (Gender and Languages)
  sections.push(...createDemographics(responseData));

  // 9. Available Data (Premium Counts)
  sections.push(...createAvailableDataTable(responseData));

  // 10. Metadata (Generated timestamp only)
  sections.push(
    new Paragraph({
      text: 'Report Metadata',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Generated: ', bold: true }),
        new TextRun({ text: generatedDateTime })
      ],
      spacing: { after: 100 }
    })
  );

  // Create document
  const doc = new Document({
    creator: 'Enrichment Report Generator',
    title: `Enrichment Report - ${selector}`,
    description: `Enrichment report for ${selector}`,
    styles: {
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          run: {
            font: 'Calibri',
            size: 22 // 11pt
          },
          paragraph: {
            spacing: { before: 0, after: 120, line: 276 } // 1.15 line spacing
          }
        },
        {
          id: 'Subtitle',
          name: 'Subtitle',
          basedOn: 'Normal',
          run: {
            font: 'Calibri',
            size: 24,
            color: TEXT_COLOR
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
              new Table({
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            text: selector,
                            alignment: AlignmentType.LEFT
                          })
                        ],
                        borders: {
                          top: { style: BorderStyle.NONE },
                          bottom: { style: BorderStyle.NONE },
                          left: { style: BorderStyle.NONE },
                          right: { style: BorderStyle.NONE }
                        },
                        width: { size: 50, type: WidthType.PERCENTAGE }
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            text: `Generated: ${generatedDateTime}`,
                            alignment: AlignmentType.RIGHT
                          })
                        ],
                        borders: {
                          top: { style: BorderStyle.NONE },
                          bottom: { style: BorderStyle.NONE },
                          left: { style: BorderStyle.NONE },
                          right: { style: BorderStyle.NONE }
                        },
                        width: { size: 50, type: WidthType.PERCENTAGE }
                      })
                    ]
                  })
                ],
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE }
                }
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
  sanitizeForDoc,
  formatDate,
  formatPhoneNumber
};
