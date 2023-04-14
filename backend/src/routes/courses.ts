import { Router } from "express";
import * as fs from "fs";
import * as path from "path";

export const coursesRouter = Router();

function getCourseData(term?: string, school?: string, subject?: string) {
  const files = fs.readdirSync("data/");

  const courseData = files.map((fileName) => {
    const data = path.parse(fileName).name;
    const [term, school, subject] = data.split("_");
    return {
      term,
      school,
      subject,
      fileName,
    };
  });

  const filteredData = courseData.filter((course) => {
    const termMatching = !term || term === course.term;
    const schoolMatching = !school || school === course.school;
    const subjectMatching = !subject || subject === course.subject;
    return termMatching && schoolMatching && subjectMatching;
  });

  return filteredData;
}

coursesRouter.get("/course-list/", (req, res) => {
  const { term, school, subject } = req.body;

  const courseData = getCourseData(term, school, subject);

  const fullCourseData = courseData.flatMap((course) => {
    const { term, school, subject, fileName } = course;
    const coursesData = JSON.parse(
      fs.readFileSync("data/" + fileName, { encoding: "utf8" })
    ).coursesData;

    return coursesData.map((course: any) => {
      return {
        term,
        school,
        subject,
        name: course["metadata"]["Class Description"],
      };
    });
  });

  res.json(fullCourseData);
});

coursesRouter.get("/course-details/", (req, res) => {
  const { term, school, subject, name } = req.body;

  const fileName = `${term}_${school}_${subject}.json`;
  const coursesData = JSON.parse(
    fs.readFileSync("data/" + fileName, { encoding: "utf8" })
  ).coursesData;

  const courseData = coursesData.find((course: any) => {
    return name === course["metadata"]["Class Description"];
  });

  res.send(courseData);
});
