/**
 * AutoDox AI - Field Matcher & Heuristics Engine
 *
 * Provides privacy-preserving, client-side semantic matching between
 * DOM form input elements and AutoDox Vault attributes.
 */

// Synonym dictionary mapping normalized semantic concepts to aliases & regex patterns
export const SEMANTIC_CATEGORIES = {
  fullName: {
    canonical: 'Full Legal Name',
    aliases: ['fullname', 'full_name', 'name', 'applicant_name', 'candidate_name', 'legal_name', 'your_name', 'client_name', 'employee_name', 'contact_name', 'recipient_name'],
    autocompletes: ['name'],
    regex: /\b(full\s*name|legal\s*name|applicant\s*name|candidate\s*name|your\s*name)\b/i,
    weight: 90
  },
  firstName: {
    canonical: 'First Name',
    aliases: ['firstname', 'first_name', 'fname', 'given_name', 'forename', 'first', 'givenname'],
    autocompletes: ['given-name'],
    regex: /\b(first\s*name|given\s*name|fname|forename)\b/i,
    weight: 95
  },
  lastName: {
    canonical: 'Last Name',
    aliases: ['lastname', 'last_name', 'lname', 'surname', 'family_name', 'last', 'familyname'],
    autocompletes: ['family-name'],
    regex: /\b(last\s*name|surname|family\s*name|lname)\b/i,
    weight: 95
  },
  email: {
    canonical: 'Email Address',
    aliases: ['email', 'e_mail', 'e-mail', 'email_address', 'mail', 'user_email', 'contact_email', 'electronic_mail'],
    autocompletes: ['email'],
    regex: /\b(e[-_]?mail|mail\s*address)\b/i,
    types: ['email'],
    weight: 98
  },
  phone: {
    canonical: 'Phone Number',
    aliases: ['phone', 'phone_number', 'telephone', 'tel', 'mobile', 'cell', 'contact_number', 'phone_no', 'mobile_no', 'cellphone'],
    autocompletes: ['tel', 'tel-national', 'tel-country-code'],
    regex: /\b(phone|mobile|telephone|cell\s*phone|contact\s*no)\b/i,
    types: ['tel'],
    weight: 95
  },
  address: {
    canonical: 'Postal Address',
    aliases: ['address', 'street', 'street_address', 'address_line1', 'address1', 'street_addr', 'residential_address', 'home_address', 'mailing_address'],
    autocompletes: ['address-line1', 'street-address'],
    regex: /\b(address(\s*line\s*1)?|street(\s*address)?|mailing\s*address)\b/i,
    weight: 90
  },
  addressLine2: {
    canonical: 'Address Line 2',
    aliases: ['address_line2', 'address2', 'apt', 'suite', 'unit', 'building', 'floor'],
    autocompletes: ['address-line2'],
    regex: /\b(address\s*line\s*2|apt|suite|unit)\b/i,
    weight: 90
  },
  city: {
    canonical: 'City',
    aliases: ['city', 'town', 'municipality', 'locality', 'suburb'],
    autocompletes: ['address-level2'],
    regex: /\b(city|town|municipality)\b/i,
    weight: 90
  },
  state: {
    canonical: 'State / Province',
    aliases: ['state', 'province', 'region', 'state_province', 'state_code'],
    autocompletes: ['address-level1'],
    regex: /\b(state|province|region)\b/i,
    weight: 85
  },
  zip: {
    canonical: 'Zip / Postal Code',
    aliases: ['zip', 'zipcode', 'zip_code', 'postal', 'postal_code', 'postalcode', 'pincode', 'postcode'],
    autocompletes: ['postal-code'],
    regex: /\b(zip|postal\s*code|pincode|postcode)\b/i,
    weight: 95
  },
  country: {
    canonical: 'Country / Nationality',
    aliases: ['country', 'country_name', 'nationality', 'nation', 'citizenship'],
    autocompletes: ['country', 'country-name'],
    regex: /\b(country|nationality|citizenship)\b/i,
    weight: 85
  },
  docNumber: {
    canonical: 'Document Number',
    aliases: ['docnumber', 'doc_number', 'passport', 'passport_number', 'passport_no', 'id_number', 'national_id', 'ssn', 'tax_id', 'license_no', 'identification_number'],
    autocompletes: ['id', 'ssn'],
    regex: /\b(passport(\s*no|\s*number)?|id\s*number|doc(ument)?\s*number|ssn|license(\s*no)?)\b/i,
    weight: 90
  },
  employer: {
    canonical: 'Employer / Company',
    aliases: ['employer', 'company', 'organization', 'workplace', 'company_name', 'current_employer', 'employer_name', 'firm'],
    autocompletes: ['organization'],
    regex: /\b(employer|company(\s*name)?|organization|workplace)\b/i,
    weight: 90
  },
  jobTitle: {
    canonical: 'Job Title',
    aliases: ['job_title', 'title', 'position', 'role', 'occupation', 'designation', 'current_title'],
    autocompletes: ['organization-title'],
    regex: /\b(job\s*title|position|occupation|designation|current\s*role)\b/i,
    weight: 90
  },
  dob: {
    canonical: 'Date of Birth',
    aliases: ['dob', 'birthdate', 'birth_date', 'date_of_birth', 'bday'],
    autocompletes: ['bday', 'bday-day', 'bday-month', 'bday-year'],
    regex: /\b(date\s*of\s*birth|birth\s*date|dob|bday)\b/i,
    weight: 95
  },
  issueDate: {
    canonical: 'Issue Date',
    aliases: ['issue_date', 'issued_date', 'date_of_issue', 'issued_on'],
    autocompletes: [],
    regex: /\b(issue\s*date|issued\s*(on|date)|date\s*of\s*issue)\b/i,
    weight: 90
  }
};

/**
 * Normalizes a string for lenient matching (lowercased, alphanumeric tokens only)
 */
export function normalizeKey(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .trim()
    .replace(/\s+/g, '_');
}

/**
 * Normalizes text for regex/search comparison
 */
export function normalizeSearchText(text) {
  if (!text || typeof text !== 'string') return '';
  return text.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Finds the semantic concept for a given form field
 */
export function detectFieldConcept(field) {
  const { id = '', name = '', placeholder = '', label = '', ariaLabel = '', autocomplete = '', type = '' } = field;

  const rawTokens = [id, name, placeholder, label, ariaLabel].join(' ').toLowerCase();
  const cleanTokens = normalizeSearchText(rawTokens);
  const normAc = (autocomplete || '').toLowerCase().trim();
  const normType = (type || '').toLowerCase().trim();

  let bestMatch = null;
  let highestScore = 0;

  for (const [conceptKey, config] of Object.entries(SEMANTIC_CATEGORIES)) {
    let score = 0;

    // 1. Direct autocomplete match (very high priority in web forms)
    if (normAc && config.autocompletes.includes(normAc)) {
      score = Math.max(score, 99);
    }

    // 2. Exact HTML input type match (e.g. type="email", type="tel")
    if (config.types && config.types.includes(normType)) {
      score = Math.max(score, 92);
    }

    // 3. Exact regex boundary match
    if (config.regex && config.regex.test(rawTokens)) {
      score = Math.max(score, 88);
    }

    // 4. Exact alias match against normalized name or id
    const normId = normalizeKey(id);
    const normName = normalizeKey(name);
    for (const alias of config.aliases) {
      if (normId === alias || normName === alias) {
        score = Math.max(score, 94);
        break;
      }
      if (normId.includes(alias) || normName.includes(alias)) {
        score = Math.max(score, 82);
      }
    }

    // 5. Keyword in label or placeholder
    const normLabel = normalizeSearchText(label);
    const normPlaceholder = normalizeSearchText(placeholder);
    for (const alias of config.aliases) {
      const aliasWords = alias.replace(/_/g, ' ');
      if (normLabel.includes(aliasWords) || normPlaceholder.includes(aliasWords)) {
        score = Math.max(score, 85);
        break;
      }
    }

    // Disambiguate full name vs first name / last name
    if (conceptKey === 'fullName' && (/\b(first|last|given|family|surname)\b/i.test(rawTokens))) {
      // De-prioritize fullName if first or last is explicitly mentioned
      score = 0;
    }

    if (score > highestScore && score >= 70) {
      highestScore = score;
      bestMatch = {
        conceptKey,
        canonical: config.canonical,
        confidence: score
      };
    }
  }

  return bestMatch;
}

/**
 * Intelligent decomposition:
 * Splits full names into first and last name components
 */
export function decomposeName(fullName) {
  if (!fullName || typeof fullName !== 'string') return { first: '', last: '' };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { first: parts[0], last: '' };
  }
  const first = parts[0];
  const last = parts.slice(1).join(' ');
  return { first, last };
}

/**
 * Splits standard US / International addresses into street, city, state, zip
 */
export function decomposeAddress(fullAddress) {
  if (!fullAddress || typeof fullAddress !== 'string') {
    return { street: '', city: '', state: '', zip: '' };
  }

  // Example: "742 Evergreen Terrace, Springfield, OR 97477" or "742 Evergreen Terrace, Springfield, OR"
  const parts = fullAddress.split(',').map((p) => p.trim());
  let street = parts[0] || '';
  let city = parts[1] || '';
  let state = '';
  let zip = '';

  if (parts[2]) {
    const stateZipParts = parts[2].trim().split(/\s+/);
    if (stateZipParts.length >= 2) {
      state = stateZipParts[0];
      zip = stateZipParts.slice(1).join(' ');
    } else {
      state = parts[2];
    }
  }

  return { street, city, state, zip };
}

/**
 * Maps a single detected form field to the best matching Vault attribute
 *
 * @param {Object} field - DOM field metadata { id, name, placeholder, label, ariaLabel, autocomplete, type }
 * @param {Array} vaultAttributes - Array of { label, key, value, category, docName }
 * @returns {Object|null} Match result
 */
export function matchFieldToVault(field, vaultAttributes = []) {
  if (!field || !Array.isArray(vaultAttributes) || vaultAttributes.length === 0) {
    return null;
  }

  // 1. Detect semantic concept of field
  const detectedConcept = detectFieldConcept(field);
  const fieldLabelNorm = normalizeSearchText(field.label || field.placeholder || field.name || field.id);

  let bestAttribute = null;
  let bestScore = 0;
  let derivedValue = null;

  // Pre-extract full name and address attributes from vault if available
  const fullNameAttr = vaultAttributes.find((a) => {
    const k = normalizeKey(a.key || a.label);
    return k.includes('fullname') || k.includes('full_name') || k === 'name' || /full\s*name/i.test(a.label);
  });

  const addressAttr = vaultAttributes.find((a) => {
    const k = normalizeKey(a.key || a.label);
    return k.includes('address') || /postal\s*address|street/i.test(a.label);
  });

  // Evaluate each vault attribute against this field
  for (const attr of vaultAttributes) {
    if (!attr.value) continue;

    const attrKeyNorm = normalizeKey(attr.key || attr.label);
    const attrLabelNorm = normalizeSearchText(attr.label);
    let currentScore = 0;

    // Case A: Semantic concept match
    if (detectedConcept) {
      const config = SEMANTIC_CATEGORIES[detectedConcept.conceptKey];
      if (config) {
        // Does this vault attribute match the concept?
        const matchesConcept = 
          config.aliases.some((alias) => attrKeyNorm.includes(alias) || attrKeyNorm === alias) ||
          config.regex.test(attrLabelNorm) ||
          normalizeSearchText(config.canonical) === attrLabelNorm;

        if (matchesConcept) {
          currentScore = Math.max(currentScore, detectedConcept.confidence);
        }
      }
    }

    // Case B: Direct lexical match between field identifiers and attribute key/label
    const fieldIdNorm = normalizeKey(field.id);
    const fieldNameNorm = normalizeKey(field.name);

    if (fieldIdNorm === attrKeyNorm || fieldNameNorm === attrKeyNorm) {
      currentScore = Math.max(currentScore, 98);
    } else if (fieldLabelNorm && attrLabelNorm && (fieldLabelNorm === attrLabelNorm || fieldLabelNorm.includes(attrLabelNorm) || attrLabelNorm.includes(fieldLabelNorm))) {
      currentScore = Math.max(currentScore, 90);
    }

    if (currentScore > bestScore) {
      bestScore = currentScore;
      bestAttribute = attr;
      derivedValue = attr.value;
    }
  }

  // Case C: Intelligent Decomposition Fallbacks
  // If no direct match, check if we need First/Last Name from a Full Name attribute
  if ((!bestAttribute || bestScore < 80) && detectedConcept && fullNameAttr) {
    const { first, last } = decomposeName(fullNameAttr.value);

    if (detectedConcept.conceptKey === 'firstName' && first) {
      bestAttribute = fullNameAttr;
      derivedValue = first;
      bestScore = 92;
    } else if (detectedConcept.conceptKey === 'lastName' && last) {
      bestAttribute = fullNameAttr;
      derivedValue = last;
      bestScore = 92;
    }
  }

  // If no direct match, check if we need Street/City/State/Zip from Address attribute
  if ((!bestAttribute || bestScore < 80) && detectedConcept && addressAttr) {
    const { street, city, state, zip } = decomposeAddress(addressAttr.value);

    if (detectedConcept.conceptKey === 'address' && street) {
      bestAttribute = addressAttr;
      derivedValue = street;
      bestScore = 88;
    } else if (detectedConcept.conceptKey === 'city' && city) {
      bestAttribute = addressAttr;
      derivedValue = city;
      bestScore = 88;
    } else if (detectedConcept.conceptKey === 'state' && state) {
      bestAttribute = addressAttr;
      derivedValue = state;
      bestScore = 85;
    } else if (detectedConcept.conceptKey === 'zip' && zip) {
      bestAttribute = addressAttr;
      derivedValue = zip;
      bestScore = 88;
    }
  }

  if (bestScore >= 70 && bestAttribute) {
    return {
      fieldId: field.id,
      fieldName: field.name,
      fieldSelector: field.selector,
      fieldLabel: field.label || field.placeholder || field.name || field.id,
      fieldType: field.type,
      conceptKey: detectedConcept ? detectedConcept.conceptKey : 'custom',
      vaultKey: bestAttribute.key,
      vaultLabel: bestAttribute.label,
      vaultValue: bestAttribute.value,
      valueToFill: derivedValue || bestAttribute.value,
      confidence: bestScore,
      docName: bestAttribute.docName || 'Vault'
    };
  }

  return null;
}
