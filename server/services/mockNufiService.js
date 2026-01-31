// Mock NUFI API Service for testing/demo purposes
// Use this when the real API endpoint is unavailable

// Helper to generate varied mock data based on input
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const generateMockResponse = (endpoint, params) => {
  const timestamp = new Date().toISOString();
  
  // Simulate API processing delay
  return new Promise((resolve) => {
    setTimeout(() => {
      let mockData = {};
      
      switch(endpoint) {
        case 'enrichment-phone':
          const phoneHash = hashString(params.phone || '');
          const firstNames = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Carmen', 'José', 'Laura', 'Miguel', 'Rosa', 'Pedro', 'Elena', 'Antonio', 'Isabel', 'Francisco'];
          const lastNames = ['García', 'Hernández', 'Rodríguez', 'Martínez', 'Sánchez', 'López', 'González', 'Pérez', 'Fernández', 'Torres', 'Ramírez', 'Flores', 'Rivera', 'Gómez', 'Díaz'];
          const secondLastNames = ['López', 'Pérez', 'Martínez', 'Gómez', 'Torres', 'Silva', 'Cruz', 'Reyes', 'Morales', 'Ortiz', 'Vargas', 'Castro', 'Ramos', 'Méndez', 'Ruiz'];
          const locations = ['Ciudad de México, CDMX', 'Guadalajara, JAL', 'Monterrey, NL', 'Puebla, PUE', 'Querétaro, QRO', 'León, GTO', 'Toluca, MEX', 'Tijuana, BC', 'Mérida, YUC', 'Cancún, QR'];
          const carriers = ['Telcel', 'Movistar', 'AT&T', 'Virgin Mobile', 'Unefon'];
          const domains = ['gmail.com', 'hotmail.com', 'yahoo.com.mx', 'outlook.com', 'icloud.com', 'prodigy.net.mx'];
          
          const selectedFirstName = firstNames[phoneHash % firstNames.length];
          const selectedLastName = lastNames[(phoneHash * 3) % lastNames.length];
          const selectedSecondLastName = secondLastNames[(phoneHash * 7) % secondLastNames.length];
          const fullName = `${selectedFirstName} ${selectedLastName} ${selectedSecondLastName}`;
          
          mockData = {
            phone: params.phone,
            name: fullName,
            email: `${selectedFirstName.toLowerCase()}.${selectedLastName.toLowerCase()}${phoneHash % 999}@${domains[phoneHash % domains.length]}`,
            alternativePhones: [
              `+5255${10000000 + (phoneHash % 90000000)}`,
              `+5233${10000000 + ((phoneHash * 7) % 90000000)}`
            ],
            socialNetworks: {
              facebook: `https://facebook.com/${selectedFirstName.toLowerCase()}.${selectedLastName.toLowerCase()}.${phoneHash % 999}`,
              linkedin: `https://linkedin.com/in/${selectedFirstName.toLowerCase()}-${selectedLastName.toLowerCase()}-${phoneHash % 9999}`,
              twitter: `@${selectedFirstName.toLowerCase()}${selectedLastName.toLowerCase().substring(0, 3)}${phoneHash % 999}`
            },
            location: locations[phoneHash % locations.length],
            carrier: carriers[phoneHash % carriers.length],
            lineType: phoneHash % 3 === 0 ? 'Mobile' : phoneHash % 3 === 1 ? 'Mobile' : 'Landline'
          };
          break;
          
        case 'enrichment-email':
          const emailHash = hashString(params.email || '');
          const emailNames = ['María Hernández Pérez', 'Roberto González Silva', 'Laura Martínez Cruz', 'Pedro Ramírez López', 'Sofia Torres Reyes'];
          const companies = ['Tech Solutions MX', 'Innovación Digital SA', 'Grupo Empresarial Norte', 'Servicios Profesionales del Sur', 'Consultoría Integral'];
          
          mockData = {
            email: params.email,
            name: emailNames[emailHash % emailNames.length],
            phone: `+5255${10000000 + (emailHash % 90000000)}`,
            socialNetworks: {
              linkedin: `https://linkedin.com/in/${params.email?.split('@')[0] || 'user'}`,
              twitter: `@${params.email?.split('@')[0] || 'user'}`
            },
            emailValid: emailHash % 10 > 1,
            domain: params.email?.split('@')[1] || 'example.com',
            companyName: companies[emailHash % companies.length]
          };
          break;
          
        case 'enrichment-name':
          mockData = {
            fullName: `${params.nombre} ${params.apellidoPaterno} ${params.apellidoMaterno || ''}`.trim(),
            possibleMatches: [
              {
                name: `${params.nombre} ${params.apellidoPaterno}`,
                email: 'contact@example.com',
                phone: '+525512345678',
                location: 'Guadalajara, JAL'
              },
              {
                name: `${params.nombre} ${params.apellidoPaterno}`,
                email: 'professional@example.mx',
                phone: '+525587654321',
                location: 'Monterrey, NL'
              }
            ],
            totalMatches: 2
          };
          break;
          
        case 'profiling-phone':
          const profilingPhoneHash = hashString(params.phone || '');
          const phoneRiskScore = profilingPhoneHash % 100;
          const phoneRiskLevels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
          const phoneRiskLevel = phoneRiskScore < 20 ? phoneRiskLevels[0] : phoneRiskScore < 40 ? phoneRiskLevels[1] : phoneRiskScore < 60 ? phoneRiskLevels[2] : phoneRiskScore < 80 ? phoneRiskLevels[3] : phoneRiskLevels[4];
          const profilingStates = ['CDMX', 'JAL', 'NL', 'PUE', 'QRO', 'GTO', 'MEX'];
          const profilingCities = ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Querétaro', 'León', 'Toluca'];
          const ageRanges = ['18-25', '25-35', '35-45', '45-55', '55+'];
          const phoneActivityLevels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
          const profilingCarriers = ['Telcel', 'Movistar', 'AT&T', 'Virgin Mobile'];
          
          mockData = {
            phone: params.phone,
            riskScore: phoneRiskScore,
            riskLevel: phoneRiskLevel,
            carrier: profilingCarriers[profilingPhoneHash % profilingCarriers.length],
            lineType: 'Mobile',
            isActive: profilingPhoneHash % 10 > 1,
            registrationDate: `20${10 + (profilingPhoneHash % 15)}-${String((profilingPhoneHash % 12) + 1).padStart(2, '0')}-${String((profilingPhoneHash % 28) + 1).padStart(2, '0')}`,
            associatedServices: ['WhatsApp', 'Banking Apps', 'Social Media'].slice(0, (profilingPhoneHash % 3) + 1),
            geolocation: {
              state: profilingStates[profilingPhoneHash % profilingStates.length],
              city: profilingCities[profilingPhoneHash % profilingCities.length],
              timezone: 'America/Mexico_City'
            },
            profile: {
              likelyAge: ageRanges[profilingPhoneHash % ageRanges.length],
              likelyGender: profilingPhoneHash % 2 === 0 ? 'Male' : 'Female',
              activityLevel: phoneActivityLevels[profilingPhoneHash % phoneActivityLevels.length]
            }
          };
          break;
          
        case 'profiling-email':
          const profilingEmailHash = hashString(params.email || '');
          const emailRiskScore = profilingEmailHash % 100;
          const emailRiskLevel = emailRiskScore < 20 ? 'Very Low' : emailRiskScore < 40 ? 'Low' : emailRiskScore < 60 ? 'Medium' : emailRiskScore < 80 ? 'High' : 'Very High';
          const industries = ['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Retail', 'Services'];
          const profLevels = ['Entry', 'Junior', 'Mid-Level', 'Mid-Senior', 'Senior', 'Executive'];
          const emailActivityLevels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
          
          mockData = {
            email: params.email,
            riskScore: emailRiskScore,
            riskLevel: emailRiskLevel,
            emailValid: profilingEmailHash % 10 > 1,
            domainAge: `${(profilingEmailHash % 15) + 1} years`,
            isBusinessEmail: params.email?.includes('company') || params.email?.includes('corp') || (profilingEmailHash % 3 === 0),
            breachHistory: profilingEmailHash % 5 === 0,
            associatedAccounts: ['LinkedIn', 'GitHub', 'Professional Networks'].slice(0, (profilingEmailHash % 3) + 1),
            profile: {
              professionalLevel: profLevels[profilingEmailHash % profLevels.length],
              industry: industries[profilingEmailHash % industries.length],
              activityLevel: emailActivityLevels[profilingEmailHash % emailActivityLevels.length]
            }
          };
          break;
          
        case 'renapo-curp':
          const curpHash = hashString(params.curp || '');
          const renapoGenders = ['HOMBRE', 'MUJER'];
          const renapoBirthStates = ['CIUDAD DE MEXICO', 'JALISCO', 'NUEVO LEON', 'PUEBLA', 'QUERETARO', 'GUANAJUATO', 'MEXICO'];
          const renapoFirstNames = ['JUAN', 'MARIA', 'CARLOS', 'ANA', 'LUIS', 'LAURA', 'PEDRO', 'SOFIA'];
          const renapoPaternalSurnames = ['GARCIA', 'HERNANDEZ', 'RODRIGUEZ', 'MARTINEZ', 'LOPEZ', 'GONZALEZ', 'SANCHEZ'];
          const renapoMaternalSurnames = ['LOPEZ', 'PEREZ', 'SILVA', 'CRUZ', 'GOMEZ', 'TORRES', 'REYES'];
          
          mockData = {
            curp: params.curp,
            isValid: curpHash % 10 > 1,
            registeredInRENAPO: curpHash % 10 > 2,
            personalInfo: {
              name: renapoFirstNames[curpHash % renapoFirstNames.length],
              paternalSurname: renapoPaternalSurnames[curpHash % renapoPaternalSurnames.length],
              maternalSurname: renapoMaternalSurnames[(curpHash * 3) % renapoMaternalSurnames.length],
              birthDate: `19${60 + (curpHash % 40)}-${String((curpHash % 12) + 1).padStart(2, '0')}-${String((curpHash % 28) + 1).padStart(2, '0')}`,
              birthState: renapoBirthStates[curpHash % renapoBirthStates.length],
              gender: renapoGenders[curpHash % renapoGenders.length]
            },
            validationDate: timestamp,
            status: curpHash % 10 > 2 ? 'ACTIVO' : 'INACTIVO'
          };
          break;
          
        case 'enrichment':
          const enrichmentHash = hashString((params.rfc || params.curp || params.nombre || '') + '');
          const enrichmentStates = ['CIUDAD DE MEXICO', 'JALISCO', 'NUEVO LEON', 'PUEBLA', 'QUERETARO'];
          const neighborhoods = ['JUAREZ', 'POLANCO', 'ROMA', 'CONDESA', 'CENTRO'];
          const streets = ['AV REFORMA', 'INSURGENTES', 'PASEO DE LA REFORMA', 'AV UNIVERSIDAD', 'REVOLUCION'];
          const enrichmentCities = ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Querétaro'];
          const enrichmentStateAbbrev = ['CDMX', 'JAL', 'NL', 'PUE', 'QRO'];
          const enrichmentFirstNames = ['JUAN', 'MARIA', 'CARLOS', 'ANA', 'LUIS'];
          const enrichmentPaternal = ['GARCIA', 'HERNANDEZ', 'RODRIGUEZ', 'MARTINEZ', 'LOPEZ'];
          const enrichmentMaternal = ['LOPEZ', 'PEREZ', 'SILVA', 'CRUZ', 'GOMEZ'];
          
          mockData = {
            rfc: params.rfc || `GAL${String(900000 + (enrichmentHash % 100000))}ABC`,
            curp: params.curp || `GALO900115HDFRRN${String(enrichmentHash % 100).padStart(2, '0')}`,
            fullName: params.nombre ? `${params.nombre} ${params.apellidoPaterno || ''} ${params.apellidoMaterno || ''}`.toUpperCase() : `${enrichmentFirstNames[enrichmentHash % enrichmentFirstNames.length]} ${enrichmentPaternal[enrichmentHash % enrichmentPaternal.length]} ${enrichmentMaternal[enrichmentHash % enrichmentMaternal.length]}`,
            birthDate: `19${60 + (enrichmentHash % 40)}-${String((enrichmentHash % 12) + 1).padStart(2, '0')}-${String((enrichmentHash % 28) + 1).padStart(2, '0')}`,
            birthState: enrichmentStates[enrichmentHash % enrichmentStates.length],
            address: {
              street: `${streets[enrichmentHash % streets.length]} ${100 + (enrichmentHash % 900)}`,
              neighborhood: neighborhoods[enrichmentHash % neighborhoods.length],
              city: enrichmentCities[enrichmentHash % enrichmentCities.length],
              state: enrichmentStateAbbrev[enrichmentHash % enrichmentStateAbbrev.length],
              zipCode: String(6000 + (enrichmentHash % 4000)).padStart(5, '0')
            },
            taxStatus: enrichmentHash % 10 > 2 ? 'ACTIVO' : 'INACTIVO',
            registrationDate: `20${String(enrichmentHash % 15).padStart(2, '0')}-${String((enrichmentHash % 12) + 1).padStart(2, '0')}-${String((enrichmentHash % 28) + 1).padStart(2, '0')}`
          };
          break;
          
        case 'blacklist':
          const blacklistHash = hashString((params.nombre || '') + (params.apellidoPaterno || ''));
          const isListed = blacklistHash % 20 === 0; // 5% chance of being listed
          const blacklistRiskLevels = ['None', 'Low', 'Medium', 'High', 'Critical'];
          
          mockData = {
            name: `${params.nombre || 'Unknown'} ${params.apellidoPaterno || ''}`,
            isListed: isListed,
            listsChecked: [
              'OFAC - Office of Foreign Assets Control',
              'UN Sanctions List',
              'EU Sanctions List',
              'Interpol Wanted List',
              'PEP - Politically Exposed Persons'
            ],
            checkDate: timestamp,
            riskLevel: isListed ? blacklistRiskLevels[1 + (blacklistHash % 4)] : 'None',
            notes: isListed ? 'Potential match found - requires manual verification' : 'No matches found in international sanctions or watchlists',
            matchDetails: isListed ? {
              listName: 'PEP - Politically Exposed Persons',
              matchScore: 75 + (blacklistHash % 25),
              additionalInfo: 'Possible public official or politically exposed person'
            } : null
          };
          break;
          
        default:
          mockData = { message: 'Mock data not configured for this endpoint' };
      }
      
      resolve({
        success: true,
        data: mockData,
        metadata: {
          timestamp,
          endpoint,
          paramsUsed: Object.keys(params),
          mode: 'DEMO_MODE',
          note: 'This is simulated data for testing purposes'
        }
      });
    }, 1000); // 1 second delay to simulate API call
  });
};

module.exports = {
  generateMockResponse
};
