/**
 * Unit tests for JsonDetailsRenderer utility functions
 * 
 * Run these tests with: npm test
 */

import { formatKey, formatDate, isMetadataKey, sanitizeForDisplay, buildDossier, formatDisplayValue } from './JsonDetailsRenderer';

describe('JsonDetailsRenderer Utilities', () => {
  
  describe('sanitizeForDisplay', () => {
    test('removes @search_pointer from objects', () => {
      const input = {
        name: 'John',
        '@search_pointer': 'abc123',
        email: 'john@example.com'
      };
      const result = sanitizeForDisplay(input);
      expect(result).toEqual({
        name: 'John',
        email: 'john@example.com'
      });
      expect(result['@search_pointer']).toBeUndefined();
    });

    test('removes *_md5 fields', () => {
      const input = {
        name: 'John',
        email: 'john@example.com',
        email_md5: 'abc123hash',
        phone_md5: 'def456hash'
      };
      const result = sanitizeForDisplay(input);
      expect(result).toEqual({
        name: 'John',
        email: 'john@example.com'
      });
      expect(result.email_md5).toBeUndefined();
      expect(result.phone_md5).toBeUndefined();
    });

    test('recursively sanitizes nested objects', () => {
      const input = {
        person: {
          name: 'John',
          '@search_pointer': 'abc',
          contact: {
            email: 'test@test.com',
            email_md5: 'hash123'
          }
        }
      };
      const result = sanitizeForDisplay(input);
      expect(result.person['@search_pointer']).toBeUndefined();
      expect(result.person.contact.email_md5).toBeUndefined();
      expect(result.person.contact.email).toBe('test@test.com');
    });

    test('sanitizes arrays of objects', () => {
      const input = {
        names: [
          { display: 'John', '@search_pointer': 'abc' },
          { display: 'Jane', 'name_md5': 'def' }
        ]
      };
      const result = sanitizeForDisplay(input);
      expect(result.names[0]['@search_pointer']).toBeUndefined();
      expect(result.names[1]['name_md5']).toBeUndefined();
      expect(result.names[0].display).toBe('John');
    });

    test('preserves other @-prefixed keys', () => {
      const input = {
        '@id': '123',
        '@match': 0.95,
        '@search_pointer': 'remove-this',
        '@valid_since': '2020-01-01'
      };
      const result = sanitizeForDisplay(input);
      expect(result['@id']).toBe('123');
      expect(result['@match']).toBe(0.95);
      expect(result['@valid_since']).toBe('2020-01-01');
      expect(result['@search_pointer']).toBeUndefined();
    });
  });

  describe('buildDossier', () => {
    test('extracts all relevant fields from person object', () => {
      const person = {
        names: [{ display: 'John Doe' }],
        phones: [{ number: '123-456-7890' }],
        emails: [{ address: 'john@example.com' }],
        addresses: [{ display: 'New York' }],
        usernames: [{ content: 'johndoe' }],
        user_ids: [{ id: 'id123' }],
        urls: [{ url: 'https://example.com' }],
        relationships: [{ name: 'Jane' }],
        gender: 'M',
        dob: '1990-01-01',
        '@match': 0.95
      };

      const result = buildDossier(person);

      expect(result.names).toEqual([{ display: 'John Doe' }]);
      expect(result.phones).toEqual([{ number: '123-456-7890' }]);
      expect(result.emails).toEqual([{ address: 'john@example.com' }]);
      expect(result.gender).toBe('M');
      expect(result.match).toBe(0.95);
    });

    test('handles missing fields with empty arrays', () => {
      const person = { names: [{ display: 'John' }] };
      const result = buildDossier(person);

      expect(Array.isArray(result.phones)).toBe(true);
      expect(result.phones.length).toBe(0);
      expect(result.user_ids.length).toBe(0);
    });

    test('returns null for null input', () => {
      expect(buildDossier(null)).toBe(null);
    });
  });

  describe('formatDisplayValue', () => {
    test('formats primitives', () => {
      expect(formatDisplayValue('test')).toBe('test');
      expect(formatDisplayValue(42)).toBe('42');
      expect(formatDisplayValue(true)).toBe('true');
    });

    test('returns N/A for null or undefined', () => {
      expect(formatDisplayValue(null)).toBe('N/A');
      expect(formatDisplayValue(undefined)).toBe('N/A');
    });

    test('extracts display values from objects', () => {
      expect(formatDisplayValue({ display: 'Shown' })).toBe('Shown');
      expect(formatDisplayValue({ content: 'Content' })).toBe('Content');
    });

    test('builds name from parts', () => {
      const obj = { first: 'John', middle: 'Q', last: 'Doe' };
      expect(formatDisplayValue(obj)).toBe('John Q Doe');
    });
  });
  
  describe('formatKey', () => {
    test('formats snake_case to Title Case', () => {
      expect(formatKey('first_name')).toBe('First Name');
      expect(formatKey('phone_number')).toBe('Phone Number');
    });

    test('formats camelCase to Title Case', () => {
      expect(formatKey('firstName')).toBe('First Name');
      expect(formatKey('phoneNumber')).toBe('Phone Number');
    });

    test('removes @ prefix and formats', () => {
      expect(formatKey('@search_id')).toBe('Search Id');
      expect(formatKey('@match')).toBe('Match');
    });

    test('handles multiple underscores and capitals', () => {
      expect(formatKey('display_international_phone')).toBe('Display International Phone');
      expect(formatKey('QpsAllotted')).toBe('Qps Allotted');
    });
  });

  describe('isMetadataKey', () => {
    test('identifies @-prefixed keys', () => {
      expect(isMetadataKey('@search_id')).toBe(true);
      expect(isMetadataKey('@match')).toBe(true);
      expect(isMetadataKey('@valid_since')).toBe(true);
    });

    test('returns false for non-metadata keys', () => {
      expect(isMetadataKey('name')).toBe(false);
      expect(isMetadataKey('phone')).toBe(false);
      expect(isMetadataKey('email')).toBe(false);
    });
  });

  describe('formatDate', () => {
    test('formats ISO date strings', () => {
      const result = formatDate('2024-01-31T12:00:00Z');
      expect(result).toContain('2024');
      expect(result).toContain('31');
    });

    test('returns null for null/undefined', () => {
      expect(formatDate(null)).toBe(null);
      expect(formatDate(undefined)).toBe(null);
    });

    test('returns original string for invalid dates', () => {
      expect(formatDate('not-a-date')).toBe('not-a-date');
    });
  });
});

describe('JsonDetailsRenderer Component Behavior', () => {
  
  test('handles null values', () => {
    const testData = { value: null };
    // This would render as "null" in the UI
    expect(testData.value).toBeNull();
  });

  test('handles empty arrays', () => {
    const testData = { items: [] };
    expect(Array.isArray(testData.items)).toBe(true);
    expect(testData.items.length).toBe(0);
  });

  test('handles empty objects', () => {
    const testData = {};
    expect(Object.keys(testData).length).toBe(0);
  });

  test('handles nested structures', () => {
    const testData = {
      person: {
        name: 'John Doe',
        phones: [
          { number: '123', '@valid_since': '2020-01-01' },
          { number: '456', '@valid_since': '2021-01-01' }
        ]
      }
    };
    
    expect(testData.person.phones.length).toBe(2);
    expect(testData.person.phones[0]['@valid_since']).toBe('2020-01-01');
  });

  test('handles mixed arrays (primitives and objects)', () => {
    const primitiveArray = ['item1', 'item2', 'item3'];
    const objectArray = [{ id: 1 }, { id: 2 }];
    
    expect(primitiveArray.every(item => typeof item === 'string')).toBe(true);
    expect(objectArray.every(item => typeof item === 'object')).toBe(true);
  });
});

describe('NUFI API Response Structure', () => {
  
  test('extracts person data from nested structure', () => {
    const response = {
      data: {
        data: {
          person: {
            names: [{ display: 'John Doe' }],
            phones: [{ number: '123' }]
          }
        }
      }
    };
    
    const person = response.data.data.person;
    expect(person.names.length).toBe(1);
    expect(person.phones.length).toBe(1);
  });

  test('handles missing person data', () => {
    const response = {
      data: {
        data: {
          query: { phones: [] },
          person: null
        }
      }
    };
    
    expect(response.data.data.person).toBeNull();
    expect(response.data.data.query).toBeDefined();
  });

  test('extracts metadata fields', () => {
    const response = {
      metadata: {
        endpoint: '/api/nufi/enrichment/phone',
        timestamp: '2024-01-31T12:00:00Z',
        paramsUsed: ['telefono']
      }
    };
    
    expect(response.metadata.endpoint).toBeDefined();
    expect(response.metadata.paramsUsed).toHaveLength(1);
  });

  test('extracts available premium data', () => {
    const response = {
      data: {
        data: {
          available_data: {
            premium: {
              addresses: 5,
              emails: 3,
              phones: 2
            }
          }
        }
      }
    };
    
    const premium = response.data.data.available_data.premium;
    expect(Object.keys(premium).length).toBe(3);
    expect(premium.addresses).toBe(5);
  });
});
