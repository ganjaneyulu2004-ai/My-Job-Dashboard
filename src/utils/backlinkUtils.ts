export interface AnchorValidationResult {
  hasWarning: boolean;
  warningMessage?: string;
  suggestedAnchor?: string;
}

/**
 * Validates anchor text for typos, duplicate characters, missing spaces, etc.
 */
export function validateAnchorText(anchorText: string): AnchorValidationResult {
  const trimmed = anchorText.trim().replace(/\s+/g, ' ');
  if (!trimmed) return { hasWarning: false };

  const words = trimmed.split(' ');
  const typos: string[] = [];
  const correctedWords: string[] = [];

  const commonFixes: Record<string, string> = {
    'firstt': 'first',
    'ime': 'time',
    'bookking': 'booking',
    'safarii': 'safari',
    'resortt': 'resort',
    'bestt': 'best',
    'schoool': 'school',
    'clinicc': 'clinic',
    'pediatricc': 'pediatric',
    'admissionss': 'admissions',
  };

  words.forEach(word => {
    const lower = word.toLowerCase();

    if (commonFixes[lower]) {
      typos.push(word);
      const fix = commonFixes[lower];
      if (word[0] === word[0].toUpperCase()) {
        correctedWords.push(fix.charAt(0).toUpperCase() + fix.slice(1));
      } else {
        correctedWords.push(fix);
      }
      return;
    }

    // Check 3+ repeated characters (e.g. 'firsttt', 'safariii')
    if (/(.)\1{2,}/.test(lower)) {
      typos.push(word);
      correctedWords.push(word.replace(/(.)\1{2,}/g, '$1$1'));
      return;
    }

    // Check trailing double letters that are common typos (like 'firstt', 'bookking')
    if (/(.)\1$/.test(lower)) {
      const char = lower.slice(-1);
      if (['t', 'k', 'i', 'c', 'p', 'b', 'd', 'g', 'm', 'n', 'u'].includes(char)) {
        typos.push(word);
        correctedWords.push(word.slice(0, -1));
        return;
      }
    }

    correctedWords.push(word);
  });

  if (typos.length > 0) {
    const suggested = correctedWords.join(' ');
    return {
      hasWarning: true,
      warningMessage: `⚠️ Check anchor text for typos: "${typos.join(', ')}"${suggested !== trimmed ? ` (did you mean "${suggested}"?)` : ''}`,
      suggestedAnchor: suggested
    };
  }

  return { hasWarning: false };
}

/**
 * Builds a structured, non-keyword-stuffed SEO blog article in HTML format.
 * - Anchor hyperlink is placed EXACTLY ONCE mid-article.
 * - Everywhere else uses natural variations/synonyms.
 * - Structures article with <h2>, <h3>, <p>, and <ul>/<li>.
 */
export function buildBacklinkArticle(
  websiteName: string,
  targetUrl: string,
  anchorText: string,
  clientName?: string
): string {
  const cleanAnchor = anchorText.trim();
  const cleanUrl = targetUrl.trim();
  const brand = (clientName && clientName !== 'Selected Client') ? clientName.trim() : '';

  const combined = `${cleanAnchor} ${cleanUrl}`.toLowerCase();

  let headline = "";
  let introParagraph = "";
  let section2Title = "";
  let section2Content = "";
  let listTitle = "";
  let listItems: string[] = [];
  let conclusionParagraph = "";

  if (combined.includes('safari') || combined.includes('jungle') || combined.includes('tour') || combined.includes('travel') || combined.includes('resort') || combined.includes('tiger') || combined.includes('wildlife')) {
    headline = `Planning & Experiencing Your Wilderness Journey: A Complete Guide`;
    introParagraph = `Embarking on a wildlife adventure offers an exhilarating connection with nature. Careful preparation, timing, and selecting verified safari accommodations ensure a safe and unforgettable expedition into rich forest habitats.`;

    section2Title = `Essential Insights for Your Expedition`;
    section2Content = `To achieve the best outcomes when organizing your trip, prioritizing expert guide services and comfortable lodging makes all the difference. Travelers planning their initial wilderness excursion can explore dedicated packages and options for <a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${cleanAnchor}</a> to secure verified arrangements and premium stays.`;

    listTitle = `Preparation Checklist & Recommendations`;
    listItems = [
      `Optimal Season Timing: Research peak wildlife sighting months and regional weather patterns.`,
      `Certified Wilderness Trackers: Partner with established local experts${brand ? ` at ${brand}` : ''} for guided safety.`,
      `Essential Gear & Attire: Pack neutral clothing, high-magnification binoculars, and sturdy outdoor gear.`
    ];

    conclusionParagraph = `Whether you are embarking on your first game drive or returning for a new wilderness excursion, working with trusted local specialists elevates every aspect of your safari experience.`;
  } else if (combined.includes('dental') || combined.includes('teeth') || combined.includes('clinic') || combined.includes('health') || combined.includes('doctor') || combined.includes('care') || combined.includes('pediatric') || combined.includes('medical')) {
    headline = `Comprehensive Healthcare & Wellness Guide: What You Need to Know`;
    introParagraph = `Prioritizing specialized medical care and routine clinical evaluations is fundamental to maintaining long-term health and personal confidence. Modern facilities employ advanced clinical techniques tailored for patient comfort.`;

    section2Title = `Selecting Dedicated Clinical Care`;
    section2Content = `When seeking reliable health solutions, evaluating practitioner expertise and clinical safety standards is essential. Patients looking for professional advice can explore specialized services for <a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${cleanAnchor}</a> to connect with leading specialists today.`;

    listTitle = `Patient Care Recommendations`;
    listItems = [
      `Comprehensive Evaluations: Schedule regular health checkups to track vital milestones.`,
      `Verified Medical Practitioners: Consult certified specialists${brand ? ` like ${brand}` : ''} for personalized treatment plans.`,
      `Preventive Wellness Routine: Follow professional health guidance for optimal long-term outcomes.`
    ];

    conclusionParagraph = `Partnering with compassionate medical experts guarantees high treatment standards and lasting peace of mind for you and your family.`;
  } else {
    headline = `Guide to Professional Solutions & Quality Services`;
    introParagraph = `Discovering trusted service providers in today's competitive market requires thorough research, verified credentials, and clear expectations.`;

    section2Title = `Key Considerations for Service Selection`;
    section2Content = `To achieve superior results, it is crucial to focus on service reliability, technical proficiency, and verified customer satisfaction. Individuals seeking quality solutions can visit <a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${cleanAnchor}</a> for complete details and expert consultations.`;

    listTitle = `Service Excellence Checklist`;
    listItems = [
      `Thorough Research: Evaluate verified client reviews and past service portfolios.`,
      `Professional Consultations: Partner with recognized industry leaders${brand ? ` such as ${brand}` : ''} for tailored execution.`,
      `Quality Assurance: Ensure transparent service agreements and clear timelines.`
    ];

    conclusionParagraph = `Working with experienced specialists provides a reliable pathway to achieving your goals efficiently and effectively.`;
  }

  return `<h2>${headline}</h2>

<p>${introParagraph}</p>

<h3>${section2Title}</h3>
<p>${section2Content}</p>

<h3>${listTitle}</h3>
<ul>
${listItems.map(item => `  <li>${item}</li>`).join('\n')}
</ul>

<h3>Final Thoughts</h3>
<p>${conclusionParagraph}</p>`.trim();
}

/**
 * Converts structured HTML article into clean plain text format for fallback clipboard target.
 * Preserves readable link format as "anchor text (URL)".
 */
export function htmlToPlainText(html: string): string {
  let text = html
    .replace(/<h2>(.*?)<\/h2>/gi, '$1\n\n')
    .replace(/<h3>(.*?)<\/h3>/gi, '\n$1\n')
    .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<ul>/gi, '')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<li>(.*?)<\/li>/gi, '• $1\n')
    .replace(/<a [^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, '$2 ($1)')
    .replace(/<[^>]+>/g, '')
    .trim();

  return text;
}

/**
 * Copies article content using Clipboard API with text/html and text/plain MIME types.
 * Pastes as real clickable hyperlinks, bold headings, and bullet points in WordPress, Google Docs, Word!
 */
export async function copyArticleToClipboard(htmlContent: string): Promise<boolean> {
  const plainText = htmlToPlainText(htmlContent);

  try {
    if (navigator.clipboard && typeof window.ClipboardItem !== 'undefined') {
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      const plainBlob = new Blob([plainText], { type: 'text/plain' });
      const item = new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': plainBlob,
      });
      await navigator.clipboard.write([item]);
      return true;
    }
  } catch (err) {
    console.warn('ClipboardItem copy notice, using execCommand fallback:', err);
  }

  // Fallback to execCommand copy for rich text
  try {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.pointerEvents = 'none';
    container.style.opacity = '0';
    container.style.left = '-9999px';
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    const range = document.createRange();
    range.selectNodeContents(container);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    const successful = document.execCommand('copy');
    selection?.removeAllRanges();
    document.body.removeChild(container);
    if (successful) return true;
  } catch (e) {
    // Fallback to text/plain
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(plainText);
      return true;
    }
  } catch (e) {
    //
  }

  return false;
}
