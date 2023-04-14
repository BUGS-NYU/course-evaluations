# Course Evaluations App

An open source app that makes it easier to access NYU Albert's course evaluations data.

## Project Structure

This project has three parts:

1. The web scraper, found in `scraper/`, uses Playwright to scrape data from Albert
1. The backend server, found in `backend/`, serves scraped data through a REST API
1. The frontend application, found in `frontend/`, makes API calls to the backend and serves as a pretty interface to the course evaluations data
