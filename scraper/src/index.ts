import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

import { Locator, Page, chromium } from "playwright";
import * as fs from "fs";

import assert from "assert";

const DEV_MODE = true;
const STRICT_MODE = true;

const ALBERT_PAGE = "http://albert.nyu.edu/albert_index.html";

interface ScrapingSession {
  page: Page;
  term: string;
  school: string;
  subject: string;
}

interface QuestionData {
  question: string;
  average: number;
}
interface CourseData {
  metadata: Record<string, string>;
  questionSections: {
    title: string;
    questions: QuestionData[];
  }[];
}

interface SubjectData {
  name: string;
  coursesData: CourseData[];
}

// step 1: sign in to albert
async function albertSignIn(session: ScrapingSession) {
  const { page } = session;

  await page.goto(ALBERT_PAGE);

  const { NYU_USERNAME, NYU_PASSWORD } = process.env;
  assert(NYU_USERNAME && NYU_PASSWORD); // credentials must be in env file

  // enter credentials
  log(false, "Signing in to Albert");
  await page.getByRole("link", { name: "Sign in to Albert" }).click();
  await page.getByLabel("NetID (e.g., aqe123)").fill(NYU_USERNAME);
  await page.getByLabel("Password").fill(NYU_PASSWORD);
  await page.getByRole("button", { name: "Login" }).click();

  // wait for DUO mobile login

  // save DUO session
  await page.getByRole("button", { name: "Yes, trust browser" }).click();
}

// step 2: open course evaluations modal
async function openEvaluations(session: ScrapingSession) {
  const { page } = session;

  log(false, "Opening course evaluations modal");
  const response = waitForAlbertResponse(session);
  await page
    .getByRole("link", { name: "Evaluation Published Results" })
    .click();
  await response;
}

// step 3: scrape course evaluations
async function scrapeEvaluations(session: ScrapingSession) {
  const { page } = session;
  const frame = await page.frameLocator('iframe[name="lbFrameContent"]');

  // get list of all terms
  const termsCombobox = frame.getByRole("combobox", {
    name: "*1. Select a Term (required) :",
  });
  const terms = await getComboboxOptions(termsCombobox);
  log(false, `${terms.length} terms: ${terms}`);
  assert(STRICT_MODE && terms.length > 0);

  // scrape each term
  for (const term of terms) {
    // select term
    const response = waitForAlbertResponse(session);
    await termsCombobox.selectOption({ value: term });
    await response;
    session.term = term;

    log(false, `Scraping term: ${term}`);
    await scrapeTerm(session);
  }
}

// step 3.1: scrape course evaluations by term
async function scrapeTerm(session: ScrapingSession) {
  const { page } = session;
  const frame = page.frameLocator('iframe[name="lbFrameContent"]');

  // get list of all schools in current term
  const schoolsCombobox = frame.getByRole("combobox", {
    name: "*2. Select a School (required):",
  });
  const schools = await getComboboxOptions(schoolsCombobox);
  log(false, `${schools.length} schools: ${schools}`);
  assert(STRICT_MODE && schools.length > 0);

  // scrape each school
  for (const school of schools) {
    // TODO: handle scraping global programs
    if (school === "GLOB") continue;

    // select term
    const response = waitForAlbertResponse(session);
    await schoolsCombobox.selectOption({ value: school });
    await response;
    session.school = school;

    log(false, `Scraping school: ${school}`);
    await scrapeSchool(session);
  }
}

// step 3.2: scrape course evaluations by term and school
async function scrapeSchool(session: ScrapingSession) {
  const { page } = session;
  const frame = page.frameLocator('iframe[name="lbFrameContent"]');

  // get list of all schools in current term
  const subjectsCombobox = frame.getByRole("combobox", {
    name: "*3. Select a Subject (required):",
  });
  const subjects = await getComboboxOptions(subjectsCombobox);
  log(false, `${subjects.length} subjects: ${subjects}`);
  assert(STRICT_MODE && subjects.length > 0);

  // scrape each subject
  for (const subject of subjects) {
    // select term
    const response = waitForAlbertResponse(session);
    await subjectsCombobox.selectOption({ value: subject }); // TODO: sometimes fails
    await response;
    session.subject = subject;

    log(false, `Scraping subject: ${subject}`);
    await scrapeSubject(session);
  }
}

// step 3.3: scrape course evaluations by term, school, and subject
async function scrapeSubject(session: ScrapingSession) {
  const { term, school, subject } = session;
  const { page } = session;
  const frame = page.frameLocator('iframe[name="lbFrameContent"]');

  const path = `data/${term}_${school}_${subject}.json`;

  // we can skip
  if (fs.existsSync(path)) {
    log(false, `Skipping ${subject}`);
    return;
  }

  const data: SubjectData = {
    name: subject,
    coursesData: [],
  };

  const { coursesData } = data;

  // click into courses page
  const coursesResponse = waitForAlbertResponse(session);
  await frame
    .getByRole("button", {
      name: "Click to Search Published Course Evaluation Results",
    })
    .click();
  await coursesResponse;

  // if this element exists, we are in courses page
  await frame.getByText("Filter Results By:").waitFor();
  const courses = await frame.locator(".ps_grid-row").all();
  log(false, `${courses.length} courses`);
  assert(courses.length > 0);

  // scrape every course
  for (const course of courses) {
    // click into evaluations page
    const evaluationsResponse = waitForAlbertResponse(session);
    await course
      .getByRole("button", { name: "Evaluation Results for" })
      .click();
    await evaluationsResponse;

    // if this element exists, we are in evaluations data page
    await frame.getByText("Note: Score range is 1 - 5").waitFor();
    coursesData.push(await scrapeCourse(session));

    // exit evaluations page
    const exitEvaluationsResponse = waitForAlbertResponse(session);
    await frame
      .getByRole("link", { name: "> Return to Class List" })
      .first()
      .click();
    await exitEvaluationsResponse;
  }

  // exit out of courses page
  const exitCoursesResponse = waitForAlbertResponse(session);
  await frame
    .getByRole("link", { name: "Return to Term/School/Subject Selection" })
    .first()
    .click();
  await exitCoursesResponse;

  // save scraped data
  await saveData(path, data);
}

// step 3.4: scrape course evaluations data
async function scrapeCourse(session: ScrapingSession) {
  const { page } = session;
  const frame = page.frameLocator('iframe[name="lbFrameContent"]');

  const data: CourseData = {
    metadata: {},
    questionSections: [],
  };

  const { metadata, questionSections } = data;

  // scrape metadata
  const metadataFields = await frame.locator(".psc_has_value").all();
  for (const field of metadataFields) {
    const label = await field.locator(".ps_box-label").innerText();
    const value = await field.locator(".ps_box-value").innerText();
    metadata[label.slice(0, -1)] = value;
  }

  log(false, `Scraping course: ${metadata["Class Description"]}`);
  assert(metadata["Class Description"] !== undefined);

  const sections = await frame.locator(".ps_box-scrollarea-row").all();
  log(true, `${sections.length} sections of questions`);
  for (const section of sections) {
    // some sections can be empty! e.g. Fall 2022, ENGR-UH 1000 LAB4
    if ((await section.innerHTML()) === "") continue;

    const sectionLink = section.getByRole("link");
    const title = (await sectionLink.innerText()).slice(2); // chop off leading "+"

    const questionResponse = waitForAlbertResponse(session);
    await sectionLink.click();
    await questionResponse;

    // wait for questions to pop up
    await section.getByRole("table").waitFor();

    const questionSection = {
      title,
      questions: [] as QuestionData[],
    };
    const { questions: questionData } = questionSection;

    const questions = await section.getByRole("row").all();
    log(true, `${questions.length} questions`);
    assert(questions.length > 0);

    for (const questionLocator of questions) {
      const question = await questionLocator
        .locator(".psc_has_value > .ps_box-value")
        .first()
        .innerText();
      const average = parseFloat(
        await questionLocator
          .locator(".psc_has_value > .ps_box-value")
          .nth(1)
          .innerText()
      );
      log(true, question, average);
      assert(!Number.isNaN(average));
      questionData.push({ question, average });
    }

    questionSections.push(questionSection);
  }

  return data;
}

function waitForAlbertResponse(session: ScrapingSession) {
  const { page } = session;

  const timeout = 300_000;
  return page.waitForResponse(
    (response) => response.url().includes("NYU_SR.NYU_CEV_PUB_RESULT"),
    { timeout }
  );
}

async function getComboboxOptions(comboboxLocator: Locator) {
  // wait for the combobox to become enabled
  await comboboxLocator.click({ trial: true });

  const options = await comboboxLocator
    .getByRole("option")
    .evaluateAll((options) => {
      return options.map((option) => {
        return option.getAttribute("value");
      });
    });

  // first value is always the default unselected option e.g. "XX"
  return options.filter((option): option is string => option !== null).slice(1);
}

function log(devOnly: boolean, message?: any, ...optionalParams: any[]) {
  if ((devOnly && DEV_MODE) || !devOnly) {
    console.log(message, ...optionalParams);
  }
}

function saveData(path: string, data: SubjectData) {
  fs.writeFileSync(path, JSON.stringify(data, undefined, 2) + "\n");
  log(true, `Saved data to ${path}`);
}

async function main() {
  log(false, "Starting scraper");

  // create current scraping session
  const browser = await chromium.launch({ headless: DEV_MODE ? false : true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const session: ScrapingSession = {
    page,
    term: "missingo",
    school: "missingno",
    subject: "missingo",
  };

  // sign in using user credentials
  await albertSignIn(session);

  // open course evaluations modal
  await openEvaluations(session);

  // wrap in try/catch block to print errors without crashing
  try {
    // start scraping course evaluations
    await scrapeEvaluations(session);
  } catch (e) {
    await page.pause();
    console.error(e);
  }
}

main();
