# Meetbot

Meeting summarizer agent.

- Shows real-time transcripts of ongoing meeting.
- Generates minutes of meeting post analysis.
- Automatically identifies events mentioned and schedules them on G-calendar
- Semantic search over past meeting along with chat with meeting-context.
- Generate meeting artifacts like summary , action items in a pdf.

## Views

![Auth Page](./assets/auth-view.png "OAuth with Google")

![Home Page](./assets/home-view.png "Home page with todays calendar")

![Meeting Page](./assets/transcript-view.png "Real-time transcript of on-going meeting.")

![Post Meeting Page](./assets/post-meeting-view.png "Actions after meeting ends.")

![Summary Page](./assets/summary-view.png "Meeting summary page.")

![Summary-Events Page](./assets/events-view.png "Automatically identified events from meeting")

![Search Page](./assets/search-view.png "Search past meeting using natural queries")

![Chat Page](./assets/chat-view.png "Chat with a meeting, Generate artifacts.")

![PDF Page](./assets/public-pdf-doc-view.png "cloud-hosted artifacts.")

![Settings Page](./assets/settings-view.png "Choose between multiple models.")

## Run Locally

Clone the project

```bash
  git clone https://link-to-project
```

Go to the project directory

```bash
  cd meetbot
```

Install dependencies - server

```bash
  cd server
```

```bash
  nvm use 22.14.0
```

```bash
  npm install
```

```bash
  export GOOGLE_APPLICATION_CREDENTIALS=/path/to/gcloud-key.json
```

Start the server

```bash
  nodemon index.js
```

Install dependencies - client

```bash
  cd client
```

```bash
  npm install
```

```bash
  npm run dev
```
