import {
  BIBLE_BOOKS,
  BIBLE_VERSIONS,
  LUTHERAN_CURATED_PASSAGES,
  BibleBook,
  BibleVerse,
  BibleVersionOption,
} from './bibleData';

export interface ParsedCitation {
  book?: BibleBook;
  chapter?: number;
  verseStart?: number;
  verseEnd?: number;
  rawQuery: string;
  isSpecificVerse: boolean;
}

export interface BibleApiVerseResponse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleApiResponse {
  reference: string;
  verses: BibleApiVerseResponse[];
  text: string;
  translation_id: string;
  translation_name: string;
  translation_note?: string;
}

class BibleService {
  /**
   * Returns all 66 books of the Bible
   */
  getBooks(): BibleBook[] {
    return BIBLE_BOOKS;
  }

  /**
   * Returns available Bible versions
   */
  getVersions(): BibleVersionOption[] {
    return BIBLE_VERSIONS;
  }

  /**
   * Find book by name, abbreviation or USFM code (case & accent insensitive)
   */
  findBook(input: string): BibleBook | undefined {
    if (!input) return undefined;
    const clean = input
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return BIBLE_BOOKS.find((b) => {
      const bName = b.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      const bAbbrev = b.abbrev
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      const bUsfm = b.usfm.toLowerCase();

      // Exact or prefix matches
      if (bUsfm === clean || bAbbrev === clean || bName === clean) return true;
      if (clean.length >= 3 && bName.startsWith(clean)) return true;

      // Handling variations like 'Salmo' vs 'Salmos', 'Joao' vs 'Jo'
      if (clean === 'salmo' && b.id === 'PSA') return true;
      if (clean === 'cantico' && b.id === 'SNG') return true;
      if (clean === 'lamentacao' && b.id === 'LAM') return true;
      if (clean === 'apocalipse' && b.id === 'REV') return true;
      if (clean === 'genesis' && b.id === 'GEN') return true;
      if (clean === 'exodo' && b.id === 'EXO') return true;
      if (clean === 'levitico' && b.id === 'LEV') return true;

      return false;
    });
  }

  /**
   * Parse a citation like "João 3:16", "Sl 23", "Rm 8:28", "JHN.1.NIV", "JHN 1"
   */
  parseCitation(query: string): ParsedCitation {
    const raw = query.trim();

    // Check for Bible.com URL or string like JHN.1.NIV or JHN.1
    const dotMatch = raw.match(/^([A-Za-z0-9]{3})\.(\d+)(?:\.([A-Za-z0-9]+))?$/i);
    if (dotMatch) {
      const book = this.findBook(dotMatch[1]);
      const chapter = parseInt(dotMatch[2], 10);
      return {
        book,
        chapter: !isNaN(chapter) ? chapter : undefined,
        rawQuery: raw,
        isSpecificVerse: false,
      };
    }

    // Pattern like "1 Coríntios 13:4-7", "João 3:16", "Salmo 23", "Rm 8:28"
    // Regex matches: (optional number 1-3) (book name) (chapter) (: (verse) (- (endVerse))?)
    const pattern = /^(\d\s*)?([A-Za-zÀ-ÿ]+)\s*(\d+)?(?:\s*[:,\.]\s*(\d+))?(?:\s*-\s*(\d+))?$/i;
    const match = raw.match(pattern);

    if (match) {
      const prefixNum = match[1] ? match[1].trim() + ' ' : '';
      const bookPart = prefixNum + (match[2] || '');
      const book = this.findBook(bookPart);
      const chapter = match[3] ? parseInt(match[3], 10) : undefined;
      const verseStart = match[4] ? parseInt(match[4], 10) : undefined;
      const verseEnd = match[5] ? parseInt(match[5], 10) : undefined;

      return {
        book,
        chapter,
        verseStart,
        verseEnd,
        rawQuery: raw,
        isSpecificVerse: !!verseStart,
      };
    }

    // If only book name was given
    const bookOnly = this.findBook(raw);
    return {
      book: bookOnly,
      rawQuery: raw,
      isSpecificVerse: false,
    };
  }

  /**
   * Generates YouVersion / Bible.com direct URL
   * Example: https://www.bible.com/pt/bible/129/JHN.1.NVI
   * Or user example: https://www.bible.com/bible/111/JHN.1.NIV
   */
  getBibleComUrl(
    bookUsfm: string = 'JHN',
    chapter: number = 1,
    versionCode: string = 'NVI'
  ): string {
    const v = BIBLE_VERSIONS.find(
      (ver) => ver.code.toUpperCase() === versionCode.toUpperCase() || ver.id === versionCode.toLowerCase()
    ) || BIBLE_VERSIONS[0];

    if (v.lang === 'en') {
      return `https://www.bible.com/bible/${v.bibleComId}/${bookUsfm}.${chapter}.${v.code}`;
    }

    return `https://www.bible.com/pt/bible/${v.bibleComId}/${bookUsfm}.${chapter}.${v.code}`;
  }

  /**
   * Searches local curated passages (offline fast search)
   */
  searchLocal(query: string): BibleVerse[] {
    if (!query || !query.trim()) return LUTHERAN_CURATED_PASSAGES;

    const term = query
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    // Check if query matches specific citation
    const parsed = this.parseCitation(query);

    return LUTHERAN_CURATED_PASSAGES.filter((p) => {
      // If parsed has book and chapter
      if (parsed.book && p.bookId === parsed.book.usfm) {
        if (!parsed.chapter || p.chapter === parsed.chapter) {
          return true;
        }
      }

      const bookNorm = p.book.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const ref = `${bookNorm} ${p.chapter}:${p.verse}`.toLowerCase();
      const textNorm = p.text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const themeNorm = (p.theme || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const noteNorm = (p.lutheranNote || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      return (
        ref.includes(term) ||
        textNorm.includes(term) ||
        themeNorm.includes(term) ||
        noteNorm.includes(term) ||
        bookNorm.includes(term)
      );
    });
  }

  /**
   * Online fetch using free public Bible API with Portuguese Almeida translation
   */
  async fetchLiveCitation(query: string): Promise<BibleApiResponse | null> {
    try {
      const clean = query.trim();
      if (!clean) return null;

      // bible-api.com supports format: https://bible-api.com/joao+3:16?translation=almeida
      // Map Portuguese names to English or standard names if needed, or query directly
      const parsed = this.parseCitation(clean);
      let queryRef = clean;

      if (parsed.book && parsed.chapter) {
        let versePart = '';
        if (parsed.verseStart) {
          versePart = `:${parsed.verseStart}`;
          if (parsed.verseEnd) {
            versePart += `-${parsed.verseEnd}`;
          }
        }
        // Use english book name or book USFM for reliable query
        const engNames: Record<string, string> = {
          GEN: 'Genesis',
          EXO: 'Exodus',
          LEV: 'Leviticus',
          NUM: 'Numbers',
          DEU: 'Deuteronomy',
          JOS: 'Joshua',
          JDG: 'Judges',
          RUT: 'Ruth',
          '1SA': '1 Samuel',
          '2SA': '2 Samuel',
          '1KI': '1 Kings',
          '2KI': '2 Kings',
          '1CH': '1 Chronicles',
          '2CH': '2 Chronicles',
          EZR: 'Ezra',
          NEH: 'Nehemiah',
          EST: 'Esther',
          JOB: 'Job',
          PSA: 'Psalms',
          PRO: 'Proverbs',
          ECC: 'Ecclesiastes',
          SNG: 'Song of Solomon',
          ISA: 'Isaiah',
          JER: 'Jeremiah',
          LAM: 'Lamentations',
          EZK: 'Ezekiel',
          DAN: 'Daniel',
          HOS: 'Hosea',
          JOL: 'Joel',
          AMO: 'Amos',
          OBA: 'Obadiah',
          JON: 'Jonah',
          MIC: 'Micah',
          NAM: 'Nahum',
          HAB: 'Habakkuk',
          ZEP: 'Zephaniah',
          HAG: 'Haggai',
          ZEC: 'Zechariah',
          MAL: 'Malachi',
          MAT: 'Matthew',
          MRK: 'Mark',
          LUK: 'Luke',
          JHN: 'John',
          ACT: 'Acts',
          ROM: 'Romans',
          '1CO': '1 Corinthians',
          '2CO': '2 Corinthians',
          GAL: 'Galatians',
          EPH: 'Ephesians',
          PHP: 'Philippians',
          COL: 'Colossians',
          '1TH': '1 Thessalonians',
          '2TH': '2 Thessalonians',
          '1TI': '1 Timothy',
          '2TI': '2 Timothy',
          TIT: 'Titus',
          PHM: 'Philemon',
          HEB: 'Hebrews',
          JAS: 'James',
          '1PE': '1 Peter',
          '2PE': '2 Peter',
          '1JN': '1 John',
          '2JN': '2 John',
          '3JN': '3 John',
          JUD: 'Jude',
          REV: 'Revelation',
        };

        const engBook = engNames[parsed.book.usfm] || parsed.book.name;
        queryRef = `${engBook} ${parsed.chapter}${versePart}`;
      }

      const url = `https://bible-api.com/${encodeURIComponent(queryRef)}?translation=almeida`;
      const res = await fetch(url);
      if (!res.ok) {
        // Fallback without translation param
        const fallbackRes = await fetch(`https://bible-api.com/${encodeURIComponent(queryRef)}`);
        if (fallbackRes.ok) {
          return await fallbackRes.json();
        }
        return null;
      }

      const data: BibleApiResponse = await res.json();
      return data;
    } catch (err) {
      console.warn('Could not fetch online Bible citation:', err);
      return null;
    }
  }
}

export const bibleService = new BibleService();
