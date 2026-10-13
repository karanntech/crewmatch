import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const femaleFirstNames = [
  "Aarohi", "Isha", "Neha", "Tanvi", "Sanya", "Kavya", "Rhea", "Pooja", "Meera",
  "Ananya", "Riddhi", "Simran", "Diya", "Natasha", "Sneha", "Kritika", "Aditi",
  "Pallavi", "Shreya", "Tara"
];
const maleFirstNames = [
  "Kabir", "Arjun", "Vikram", "Aryan", "Dev", "Rahul", "Nikhil", "Karan",
  "Siddharth", "Varun", "Sameer", "Aditya", "Rishabh", "Gaurav", "Aman",
  "Tarun", "Kunal", "Harsh", "Pranav", "Dhruv"
];
const lastNames = [
  "Sharma", "Verma", "Patel", "Gupta", "Deshmukh", "Kapoor", "Singhal", "Iyer",
  "Nair", "Reddy", "Banerjee", "Bhatia", "Joshi", "Chopra", "Kulkarni",
  "Aggarwal", "Chauhan", "Menon"
];
const cities = [
  "Mumbai", "Bengaluru", "Delhi NCR", "Pune", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad"
];
const colleges = [
  "IIT Delhi", "BITS Pilani", "Delhi University", "St. Xavier's College",
  "IIM Ahmedabad (MBA)", "NIT Trichy", "Symbiosis Pune", "Manipal University",
  "Ashoka University", "NMIMS Mumbai"
];
const degrees = [
  "B.Tech Computer Science", "B.Com (Hons)", "B.A. Economics", "BBA",
  "B.Tech + MBA", "B.Des Product Design", "Chartered Accountant (CA)", "MBBS"
];
const companies = [
  "Google", "Amazon", "McKinsey & Co", "Bain & Company", "Zomato", "Swiggy",
  "HDFC Bank", "Unilever", "Flipkart", "HealthifyMe", "Cred", "Startup Co."
];
const designations = [
  "Product Manager", "Software Engineer", "Consultant", "Data Scientist",
  "Marketing Lead", "Investment Analyst", "Brand Manager", "UX Designer",
  "Operations Lead"
];
const castes = [
  "Brahmin", "Kshatriya", "Vaishya", "Kayastha", "Maratha", "Baniya", "Khatri", "Intercaste Open"
];
const religions = ["Hindu", "Hindu", "Hindu", "Sikh", "Jain", "Christian"];
const diets = ["Vegetarian", "Non-Vegetarian", "Eggetarian", "Jain"];
const triStates = ["Yes", "Yes", "Maybe", "No"];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function cmToFeetInches(cm) {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
}

const candidates = [];

for (let i = 1; i <= 120; i++) {
  const gender = i <= 60 ? "Female" : "Male";
  const firstName = gender === "Female" ? getRandomItem(femaleFirstNames) : getRandomItem(maleFirstNames);
  const lastName = getRandomItem(lastNames);
  const age = getRandomInt(24, 37);
  const birthYear = 2026 - age;
  const birthMonth = String(getRandomInt(1, 12)).padStart(2, "0");
  const birthDay = String(getRandomInt(1, 28)).padStart(2, "0");
  const dateOfBirth = `${birthYear}-${birthMonth}-${birthDay}`;

  const heightCm = gender === "Female" ? getRandomInt(152, 175) : getRandomInt(168, 190);
  const incomeLPA = getRandomInt(12, 65);

  candidates.push({
    id: `cand-${String(i).padStart(3, "0")}`,
    firstName,
    lastName,
    gender,
    dateOfBirth,
    age,
    heightCm,
    heightFormatted: cmToFeetInches(heightCm),
    country: "India",
    city: getRandomItem(cities),
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
    phoneNumber: `+91 ${getRandomInt(90000, 99999)} ${getRandomInt(10000, 99999)}`,
    undergradCollege: getRandomItem(colleges),
    degree: getRandomItem(degrees),
    currentCompany: getRandomItem(companies),
    designation: getRandomItem(designations),
    annualIncomeLPA: incomeLPA,
    incomeFormatted: `₹${incomeLPA} LPA`,
    maritalStatus: "Never Married",
    languagesKnown: ["English", "Hindi", getRandomItem(["Marathi", "Gujarati", "Tamil", "Punjabi", "Bengali"])],
    siblings: getRandomItem(["None (Only child)", "1 younger brother", "1 elder sister", "2 siblings"]),
    caste: getRandomItem(castes),
    religion: getRandomItem(religions),
    wantKids: getRandomItem(triStates),
    openToRelocate: getRandomItem(triStates),
    openToPets: getRandomItem(triStates),
    diet: getRandomItem(diets),
    drinking: getRandomItem(["Never", "Socially", "Regularly"]),
    smoking: getRandomItem(["No", "No", "Occasionally"]),
    manglikStatus: getRandomItem(["Non-Manglik", "Non-Manglik", "Manglik", "Don't Mind / Anshik"]),
    familyValues: getRandomItem(["Traditional", "Moderate", "Liberal"]),
    bio: `Passionate ${getRandomItem(designations).toLowerCase()} who enjoys weekend travel, fitness, and engaging conversations. Looking for an authentic partner with shared values.`,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`
  });
}

const targetPath = path.join(__dirname, "..", "src", "data", "pool-candidates.json");
fs.writeFileSync(targetPath, JSON.stringify(candidates, null, 2));
console.log(`Successfully generated ${candidates.length} dummy profiles at ${targetPath}`);