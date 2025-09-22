import XLSX from "xlsx";
import fs from "fs";

// Excel file path
const excelFilePath = "data.xlsx";

// Path to save the JSON file
const jsonFilePath = "converted_data.json";

// Read the Excel file
const workbook = XLSX.readFile(excelFilePath);

// Get the name of the first sheet
const sheetName = workbook.SheetNames[0];

// Convert the first sheet to JSON with raw values
const worksheet = workbook.Sheets[sheetName];
const rawData = XLSX.utils.sheet_to_json(worksheet, {
  raw: false, // Set to false to get formatted values, not raw numbers.
  defval: "", // Set a default value for empty cells
});

// Configuration for mapping OTT platform names to Excel column names
const ottPlatformsConfig = {
  Netflix: "netflixUrl",
  "Disney+": "disneyplusUrl",
  Tving: "tvingUrl",
  "Coupang play": "coupangplayUrl",
  Wavve: "wavveUrl",
  Watcha: "watchaUrl",
};

/**
 * Converts a yyyy-mm-dd formatted string to a clean date string.
 * @param {string} dateString The date string from the Excel file.
 * @returns {string | null} The converted date string (YYYY-MM-DD) or null.
 */
function convertToDate(dateString) {
  if (typeof dateString === "string" && dateString.trim() !== "") {
    const parsedDate = new Date(dateString);
    if (!isNaN(parsedDate.getTime())) {
      // Get YYYY-MM-DD from the Date object
      const year = parsedDate.getFullYear();
      const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
      const day = String(parsedDate.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  }
  return null;
}

// Data conversion logic
const contentsData = rawData.map((row) => {
  // ottplatforms data conversion
  const ottplatforms = [];
  for (const platformName in ottPlatformsConfig) {
    const urlKey = ottPlatformsConfig[platformName];
    if (row[urlKey]) {
      ottplatforms.push({ name: platformName, url: row[urlKey] });
    }
  }

  // Convert comma-separated string columns to arrays
  const splitAndTrim = (val) => {
    return val
      ? String(val)
          .split(",")
          .map((item) => item.trim())
      : [];
  };

  // Return the final converted object
  return {
    contentsid: row.contentsid,
    title: row.title,
    release: convertToDate(row.release),
    age: row.age,
    genres: splitAndTrim(row.genres),
    runningtime: row.runningtime,
    countries: splitAndTrim(row.countries),
    directors: splitAndTrim(row.directors),
    actors: splitAndTrim(row.actors),
    overview: row.overview,
    netizenRating: row.netizenRating ?? "",
    imgUrl: row.imgUrl,
    bgUrl: row.bgUrl ?? "",
    youtubeUrl: row.youtubeUrl,
    ottplatforms: ottplatforms,
    feelterTime: splitAndTrim(row.feelterTime),
    feelterPurpose: splitAndTrim(row.feelterPurpose),
    feelterOccasion: splitAndTrim(row.feelterOccasion),
    bestcoment: row.bestcoment ?? "",
    upload: convertToDate(row.upload),
    update: convertToDate(row.update),
  };
});

// Save the converted JSON to a file
try {
  fs.writeFileSync(
    jsonFilePath,
    JSON.stringify(contentsData, null, 2),
    "utf-8"
  );
  console.log(
    `✅ ${excelFilePath} 파일이 성공적으로 ${jsonFilePath}로 변환되었습니다.`
  );
} catch (error) {
  console.error(`🚨 파일 저장 중 오류가 발생했습니다:`, error.message);
  console.error(`권한 문제일 수 있습니다. 터미널 경로와 권한을 확인해주세요.`);
}
