import HttpException from "./HttpExecption.utils.js";
import logger from "./logger.utils.js";

const FORBIDDEN_KEYWORDS = [
  // --- KATEGORI JUDI ONLINE (JUDOL) ---
  'slot', 'gacor', 'zeus', 'maxwin', 'depo', 'wd', 'deposit', 'withdraw', 
  'jackpot', 'jp', 'scatter', 'olympus', 'mahjong', 'betting', 'judol', 
  'judi', 'togel', 'casino', 'poker', 'domino', 'qq', 'bandar', ' Pragmatic',

  // --- KATEGORI KONTEN DEWASA/PORNO ---
  'bokep', 'porn', 'sex', 'ngentot', 'sange', 'vcs', 'openbo', 'bo', 
  'lendir', 'semprot', 'jav', 'hentai', 'pornografi', 'colmek', 'coli', 'VIRAL',

  // --- KATEGORI PENIPUAN/SPAM ---
  'pinjol', 'dana gaib', 'pesugihan', 'investasi bodong', 'crypto scam',
  'hadiah gratis', 'klik link ini', 'menang undian',

  // --- KATEGORI SARA/OFFENSIVE ---
  'anjing', 'babi', 'monyet', 'tolol', 'goblok', 'idiot', 'kontol', 'memek'
];

const URL_REGEX = /https?:\/\/\S+|www\.\S+|\b\w+\.(?:com|net|org|id|gov|edu|me|site|xyz|app|online|io|my\.id)\b/gi;

export const validateCommunityContent = (title: string, content: string) => {
  const combinedText = `${title} ${content}`.toLowerCase();

  // Check for forbidden keywords
  for (const word of FORBIDDEN_KEYWORDS) {
    if (combinedText.includes(word)) {
      logger.warn(`Content validation rejected: forbidden word "${word}" found.`);
      throw new HttpException(400, `Konten mengandung kata terlarang: "${word}".`);
    }
  }

  // Check for links
  if (URL_REGEX.test(combinedText)) {
    logger.warn('Content validation rejected: URL/Link found.');
    throw new HttpException(400, 'Konten tidak diperbolehkan mengandung link atau URL.');
  }
};
