export interface ParsedKeywordsResult {
  success: boolean;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  needPrimaryClarification?: boolean;
  candidates?: string[];
  rawInput: string;
}

/**
 * Natural language AI keyword parser.
 * Extracts primary_keyword and secondary_keywords from free-text user chat messages.
 */
export function parseKeywordsFromNaturalText(userMessage: string): ParsedKeywordsResult {
  const cleanText = userMessage.trim();
  if (!cleanText) {
    return { success: false, rawInput: userMessage };
  }

  // 1. Check for explicit Primary and Secondary declarations using regex
  const primaryMatch = cleanText.match(/(?:primary\s*(?:keyword)?|main\s*(?:keyword)?|focus\s*(?:keyword)?|primary\s*is|main\s*is)\s*[:=]?\s*([^.,;|\n\r]+?)(?=\s*(?:and\s*)?(?:these\s*are\s*)?secondary|secondary\s*[:=]|secondaries|\.|$)/i);
  const secondaryMatch = cleanText.match(/(?:secondary\s*(?:keywords)?|secondaries|other\s*(?:keywords)?|secondary\s*are|secondaries\s*are)\s*[:=]?\s*([^.\n\r]+)/i);

  if (primaryMatch && primaryMatch[1]) {
    const rawPrimary = primaryMatch[1].trim().replace(/^['":\s]+|['":\s]+$/g, '');
    let secondaries: string[] = [];

    if (secondaryMatch && secondaryMatch[1]) {
      const rawSec = secondaryMatch[1].trim().replace(/^['":\s]+|['":\s]+$/g, '');
      secondaries = rawSec
        .split(/[,;\n|]/)
        .map(s => s.trim().replace(/^['":\s]+|['":\s]+$/g, ''))
        .filter(Boolean);
    } else {
      // Extract remaining text as secondaries if secondary label was missing
      const remainder = cleanText.replace(primaryMatch[0], '').replace(/^(?:and|,|\.|\s)+/i, '').trim();
      if (remainder) {
        secondaries = remainder
          .split(/[,;\n|]/)
          .map(s => s.trim().replace(/^['":\s]+|['":\s]+$/g, ''))
          .filter(Boolean);
      }
    }

    if (rawPrimary) {
      return {
        success: true,
        primaryKeyword: rawPrimary,
        secondaryKeywords: secondaries,
        rawInput: userMessage
      };
    }
  }

  // 2. Fallback: Split terms by comma/semicolon/newline
  const terms = cleanText
    .split(/[,;\n|]+/)
    .map(t => t.trim().replace(/^['":\s]+|['":\s]+$/g, ''))
    .filter(Boolean);

  if (terms.length === 1) {
    return {
      success: true,
      primaryKeyword: terms[0],
      secondaryKeywords: [],
      rawInput: userMessage
    };
  }

  if (terms.length > 1) {
    return {
      success: false,
      needPrimaryClarification: true,
      candidates: terms,
      rawInput: userMessage
    };
  }

  return { success: false, rawInput: userMessage };
}
