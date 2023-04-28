# Web Scraper

A web scraper made using Playwright that scrapes NYU Albert's course evaluations page.

## Getting Started

To get a local instance running, please follow these steps.

### Prerequisites

- Node.js
- npm

### Development

1. Run `npm install`
1. Create a `.env` file if one does not already exist (see [Configuration section](#configuration) for more)
1. Run `npm run dev`

## Configuration

Creating a `.env` file with a valid NYU Albert credentials is required. To create a file, create a copy of `.env.example` and enter a valid username and password pair. These are the credentials the scraper will use to access the course evaluations data.

The scraper can be configured by modifying `src/config.ts`.
| Variable | Description |
| - | - |
| strictMode | If true, the scraper will stop if it encounters courses that don't have any data |
| devMode | If true, the scraper will launch with a headed browser and log additional data |
| terms | If a list of terms is provided, the scraper will only scrape the provided list of terms. Otherwise, it will scrape all terms. |
