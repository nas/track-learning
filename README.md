Simple minimal personal learning tracker app.

Uses LLM for adding, updating and searching learning items. Can be used with one running locally or externally via api.

To keep things simple, data is stored and read from AWS S3 json file.

Example file data:
```
[
  {
    "id": "5f696118-149b-46e3-b36e-b92fc7a49634",
    "title": "The Pragmatic Programmer",
    "author": "David Thomas, Andrew Hunt",
    "type": "Book",
    "status": "In Progress",
    "progress": "Chapter 5",
    "startDate": "2025-01-01T10:00:00Z",
    "lastUpdated": "2025-12-28T19:17:32.597Z"
  },
  {
    "id": "5b3ede95-7b2e-4f87-a2c2-f379f039ab50",
    "title": "Blockchain",
    "author": "misc",
    "type": "Article",
    "status": "Archived",
    "progress": "60%",
    "url": "http://example.com",
    "startDate": "2025-12-28T19:19:01.039Z",
    "lastUpdated": "2025-12-29T02:00:59.877Z"
  }
]
```

See .env.example for the bucket, filename and other aws credentials

```
npm install
npm run test
npm run dev
```

## Authentication

The app uses a simple password-based authentication system for single-user access. Set the `AUTH_SECRET` environment variable. The login page prompts for this password to access the application.

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md). 

