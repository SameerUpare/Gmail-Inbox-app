Gmail Inbox Scanner is a utility to Scan the gmail inbox and idenitify the number of emails and provide a  form to the user to keep/unsubscribe/delete emails based on the action by the user.
Phase 1 - Phase 1 was essentially about authentication + data fetch + first level aggregation + basic display

Core Concepts Used

OAuth 2.0 Authentication
  Google Identity → OAuth client (client_id, client_secret, redirect_uri)
  Token exchange (auth code → access token & refresh token)
  Secure callback handling
Google Gmail API (Read-only scope)
  gmail.readonly scope for safe access
  Fetching user messages metadata (messages.list, messages.get)
  Extracting headers (From, Subject, Date)
FastAPI Backend
  REST endpoints (/oauth/callback, /jobs/scan, etc.)
  Async request handling
  JSON responses
Data Processing
 Parsing email headers (From → sender, message counts)
 Aggregating senders and message counts
 Generating “Top senders” list
UI/UX Layer

 Frontend polling /jobs/scan → showed “Loading” → then results
 Displaying statistics (counts, charts/lists)
 Version Control & Collaboration
GitHub repo setup (git push, git pull --rebase)
 Merging remote changes before committing new ones
 Error Handling / Debugging
Handling 500 errors during callback
 Fixing FastAPI endpoint mapping (/jobs/scan)
 Logging for debugging token/code issues
 ![CI](https://github.com/Ziggler01/Gmail-Inbox-app/actions/workflows/ci.yml/badge.svg)

📂 Outputs from Phase 1
  OAuth flow working (user can sign in and grant access)
  Message scanning job (/jobs/scan) retrieving Gmail data
  Processed results: sender/message counts, top senders list
  Basic UI feedback: “Loading…” → replaced by actual counts

---

## Phase 5 - Vision Realization & Scaling
Phase 5 brought the application out of its "demo" constraints by implementing heavy, resilient logic capable of churning through thousands of emails. 

### Core Concepts Introduced

**1. Deep Scanning Engine (Continuous Pagination)**
*   Broke the initial 50-thread hardcap.
*   Implemented Google API `nextPageToken` cursor handling in the FastApi backend framework.
*   Added a frontend "Load More Senders" component for infinite scrolling deep into historical inbox data.

**2. True Protocol Unsubscribe**
*   Upgraded the backend scanner to scrape and persist hidden `List-Unsubscribe` headers securely.
*   Implemented live `requests` execution during `POST /plan/execute` to fire physical `HTTP POST/GET` unsubscription signals directly to the promotional company servers before archiving the email.

**3. Global Category Wiping**
*   Created a fast `DELETE /categories/{label}` backend API route.
*   Built "Wipe Clean" UI buttons directly onto the interactive Unread Breakdown modal allowing one-click destruction of System Folders (e.g., *Promotions*, *Updates*).

**4. Rate-Limit Resilience (Batch Networks)**
*   Overhauled `messages.trash` and `messages.modify` execution loops.
*   Instead of firing hundreds of sequential REST requests that trigger `429 Too Many Requests` API blockages, the engine now compiles execution chunks into `BatchHttpRequest` blocks parsing 100 emails concurrently per round-trip.

---

## Project Audit & Status
Following the stabilization of Phase 5, a comprehensive technical and security architecture scan was conducted on the codebase. Check out the [Project Audit Report](./AUDIT_REPORT.md) for details regarding Google API network resilience, frontend CORS stability, and known CI/CD testing gaps (`PYTHONPATH` integration for `.github/workflows`).

