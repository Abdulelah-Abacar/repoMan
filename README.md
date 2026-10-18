# RepoMan

RepoMan is an AI-powered repository intelligence and team collaboration platform for software teams. It connects a GitHub repository to an internal knowledge layer, lets teammates ask questions in natural language about the codebase, tracks code evolution through commit summaries, and analyzes meeting recordings into actionable issues and follow-ups.

This README serves as the product overview and PRD for the application. It explains the core problem, product goals, target users, user flows, functional requirements, architecture, and the business logic behind the current implementation.

---

## 1. Product Summary

RepoMan helps engineering teams answer questions like:

- Where should I change the checkout flow?
- What code was affected by a recent deployment?
- What decisions were made in yesterday’s sprint review?
- Which issues were discussed in the client call and what action items came out of it?

Instead of forcing people to search through scattered code, commits, and meeting notes, RepoMan creates a shared project context that combines repository knowledge, commit history, and discussion records into a single system.

The application is designed for:

- engineering teams working inside a GitHub repository
- product managers or technical leads who need visibility into project progress
- startup/lean teams with limited process tooling
- projects where code knowledge needs to be searchable and reusable

---

## 2. Problem Statement

Software teams often lose time because product context is fragmented across multiple tools:

- source code lives in GitHub
- decisions are recorded in meetings and transcripts
- project updates are buried in commit messages or PR conversations
- onboarding new teammates requires manual explanation of architecture and ownership
- teams ask repetitive questions like “where is this feature implemented?” or “what changed in the last sprint?”

This leads to:

- slower product execution
- repeated context switching
- higher onboarding friction
- poor knowledge retention from meetings and code changes
- reduced decision quality when action items are not connected to code

RepoMan solves this by turning codebases and meeting discussions into structured, AI-accessible context.

---

## 3. Product Vision

The long-term vision is to create a practical “engineering memory layer” for a project repository.

RepoMan should eventually behave like a shared intelligence workspace where:

- repository docs and code are indexed and searchable
- teams can ask questions in natural language and get grounded answers with source references
- commit activity becomes understandable and traceable
- meeting recordings become structured decisions and issues
- project knowledge is retained across team members and onboarding cycles

The current version focuses on a strong first layer: repository indexing, AI Q&A, commit intelligence, and meeting analysis.

---

## 4. Target Users

### Primary users

- Software engineers
- Tech leads
- Product managers
- Engineering managers
- Small teams with limited internal tooling

### Personas

#### Engineer

Needs quick answers about implementation details, file ownership, and architecture without reading the entire repo.

#### Product lead

Needs a digest of decisions made in meetings and a link between product discussions and code changes.

#### Team manager

Needs visibility into project health, meeting action items, and the delivery context tied to code commitments.

---

## 5. Core Product Features

### 5.1 Repository linking and project creation

Users create a project by linking a GitHub repository URL and optionally providing a GitHub token and branch name.

The app then:

- validates the repository
- calculates the repository file count
- checks whether the user has enough credits to index it
- stores the project in the database
- indexes the repository content
- generates embeddings for repository files so AI search can work semantically

This creates a project-specific memory of the codebase.

### 5.2 AI-powered repository Q&A

One of the principal features is the ask-a-question workflow.

The product allows a user to ask a natural-language question about a linked repo, such as:

- “Which file manages the auth flow?”
- “Where should I update the homepage UI?”
- “What is the main service used for billing?”

The system:

- pulls relevant source code context from the indexed repository
- passes the question to an AI model
- returns a direct answer grounded in repo content
- shows references to the source files used in the answer
- allows users to save the answer to the project history

This is the most important product differentiator: instead of generic AI chat, the app is grounded in the project repository itself.

### 5.3 Commit intelligence and project timeline

RepoMan polls the repository’s recent commit history and creates summaries for new commits.

It does the following:

- fetches recent GitHub commits
- identifies unprocessed ones
- downloads commit diffs
- summarizes the code change with AI
- stores commit metadata and summary in the database
- renders a commit timeline in the dashboard

This gives a project-level activity log that is easier to understand than raw commit messages.

### 5.4 Meeting upload and issue extraction

Users can upload meeting audio files into a project.

The workflow:

- upload audio or recording file
- save the meeting record in the project
- send the recording to the meeting-processing pipeline
- transcribe and analyze it using speech-to-text and AI summarization
- extract issues/action items and create structured meeting “issues”
- show them in a meeting detail view

The app is designed to turn unstructured meeting content into a manageable backlog of topics and artifacts.

### 5.5 Team project membership and sharing

Projects support multi-user collaboration.

Users can:

- invite teammates via a generated project join link
- view team members associated with a project
- maintain project context across a shared repository

This turns the project into a shared workspace instead of a single-user dashboard.

### 5.6 Billing and credit system

The app includes a credit-based model for repository indexing.

- each indexed file consumes credit
- when a user links a repository, the app estimates file count
- the system checks whether the user has enough credits to index the project
- users can buy additional credits through a Stripe checkout flow

This helps control scaling costs and makes repo indexing a measurable consumption unit.

### 5.7 Project lifecycle management

The app includes a lightweight project lifecycle:

- project creation
- project archival
- project selection across multiple repos
- join flow for invited collaborators

This is essential for teams managing multiple repositories and contexts.

---

## 6. User Flows

### Flow 1: Create a project

1. User signs in.
2. User clicks “Create Project”.
3. User enters project name, GitHub repo URL, branch, and optional token.
4. System counts repository files and computes credits needed.
5. User confirms the indexing task.
6. Application indexes repo files and stores embeddings.
7. Commit polling begins.
8. Project is available in the dashboard.

### Flow 2: Ask repository questions

1. User selects a project.
2. User types a natural-language question.
3. System retrieves relevant repository context based on indexed embeddings.
4. AI answer is generated with code references.
5. User can save the answer for future project memory.

### Flow 3: Upload and analyze a meeting

1. User uploads an audio recording.
2. System saves the meeting metadata.
3. Meeting processing pipeline extracts summary and issues.
4. User reviews generated issue cards and meeting details.
5. Team can act on extracted action items.

### Flow 4: Review project activity

1. User opens the dashboard.
2. User sees project URL, team, project invite option, and archive action.
3. User reviews the recent commit activity timeline.
4. User can navigate to meeting details or repository context.

---

## 7. Functional Requirements

### Project management

- Users must be able to create a project tied to a GitHub repository.
- A project must have a name and GitHub URL.
- A project can be archived;
- Users can switch between projects in the sidebar.

### Repository intelligence

- Repositories must be indexed using repo contents.
- Each file should be summarized and embedded for retrieval.
- Questions must be answerable using repository knowledge.
- Answers should be grounded in source references.
- User-generated Q&A should be stored in the project context.

### Meeting analysis

- Meeting audio can be uploaded by project members.
- Uploads should trigger processing asynchronously.
- Meetings should be associated with a project.
- Meeting summaries should generate issue cards with titles, timestamps, and descriptions.
- Users should be able to inspect meeting details and review extracted issues.

### Code activity tracking

- RepoMan must fetch commit history from the GitHub repository.
- New commits should be summarized automatically.
- Commit summaries should be shown in the project dashboard.

### Team collaboration

- Projects should support multiple members.
- Invites should be shareable through a direct project link.
- Team data should be visible in the project dashboard.

### Billing and credits

- User credits must be tracked.
- Repository indexing must be costed based on file count.
- Users must be able to purchase additional credits.

---

## 8. Non-Functional Requirements

### Security and access

- Access should be limited to authenticated users.
- Project operations should be scoped to project ownership or membership.
- Sensitive repository metadata and tokens must be handled carefully.

### Scalability

- Repo indexing should be asynchronous and capable of handling large codebases.
- Embedding generation and repo analysis should be processed in a way that does not block the UI.

### Reliability

- Commit polling and meeting processing should recover gracefully from failures.
- Long-running tasks should be handled with asynchronous processing and status-aware flows.

### User experience

- The dashboard must provide fast navigation between repo intelligence, meetings, and billing.
- AI answers should be readable and supported by code references.

---

## 9. Architecture Overview

The app is built as a modern Next.js application with a full-stack TypeScript setup.

### Frontend

- Next.js app router
- React components with Tailwind styling
- shadcn/ui inspired component library

### Backend and API layer

- tRPC for typed API routes
- Prisma for database access
- PostgreSQL-backed data layer

### Authentication

- Clerk is used for user authentication and session management.

### AI and intelligence layer

- Gemini-based AI summarization and embedding generation
- GitHub repo analysis for indexing
- vector storage via PostgreSQL vector columns for semantic retrieval

### Meeting analysis layer

- uploaded audio is processed and then turned into issue summaries using the project pipeline
- the app integrates with assembly-style transcription and summarization services

### Payments

- Stripe is used for the credit purchase experience

### External services used in the product

- GitHub API
- GitHub repository loader
- AI embedding/summarization model
- audio processing/meeting transcription pipeline
- Stripe checkout

---

## 10. Data model concepts

The product is centered around a few core entities:

- User: authenticated user with credits
- Project: repository-linked workspace
- SourceCodeEmbedding: indexed file content with summary and vector embedding
- Question: saved repo Q&A record
- Commit: GitHub commit metadata and AI-generated summary
- Meeting: uploaded meeting asset tied to a project
- Issue: generated action item or meeting topic extracted from a meeting
- UserToProject: mapping for team membership

This data model supports the product’s core purpose: turning repository content and project activity into a searchable operational memory.

---

## 11. Product rationale

The app is built around a key belief: software teams are not just managing code, they are managing context.

The product aims to reduce the gap between:

- what is happening in the repository
- what was decided in a meeting
- what the team learned over time
- what a new teammate needs to know today

The value is not only AI chat. The larger product value is context memory, retrieval, and team coordination.

---

## 12. Current MVP scope

The current implementation covers the following production-ready MVP capabilities:

- create a repo-backed project
- estimate indexing cost based on repo file count
- index a GitHub repository into project memory
- ask natural-language questions over repository context
- attach code references to AI answers
- save Q&A history
- ingest and summarize recent GitHub commits
- upload meeting audio
- generate meeting issue cards and summaries
- invite and manage project members
- buy credits via Stripe
- archive projects

This is already a meaningful product surface for teams that want code-aware project knowledge and lightweight project intelligence.

---

## 13. Future product direction

The next iteration of the product could expand into:

- semantic code search across multiple repositories
- team-owned knowledge graph linking meetings, tickets, commits, and code
- issue creation from AI summaries into a project backlog
- meeting follow-ups tied directly to relevant code files
- memory search for “what did we decide about this feature?”
- dashboards for PR health, code churn, and delivery risk
- onboarding copilots that answer project-level questions automatically

This would move RepoMan from being a repo assistant to a broader project intelligence platform.

---

## 14. Short product pitch

RepoMan is a repo-aware AI workspace for engineering teams: it connects code, commits, meetings, and project context into a single structured system so teams can understand what they are building and what they decided.

---

## 15. Recommended next step

The product is strong enough to position as an MVP for AI-enabled developer operations and team project intelligence. The next step is to validate the value with a real team workflow: repository onboarding, sprint meeting analysis, and question answering on active codebases.

If this project continues to grow, the app should evolve from a repository assistant into a cross-functional project intelligence platform that connects code, execution, and decisions.
