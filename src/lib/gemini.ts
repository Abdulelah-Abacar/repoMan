"use server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Document } from "@langchain/core/documents";

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });

const GIT_COMMIT_SYSTEM_PROMPT = `You are an expert at analyzing git diffs and generating clear, professional commit messages following the Conventional Commits standard.

# Your Task
Analyze the provided git diff and generate a meaningful commit message that follows best practices.

# Analysis Steps

## 1. Understand the Changes
- Identify all affected files and their types
- Categorize the change type: feat, fix, docs, style, refactor, perf, test, chore, build, ci, revert
- Determine the scope: component, feature, or system level
- Assess impact: low, medium, high, or critical

## 2. Extract Key Information
- What was changed? (specific components/functions/files)
- Why was it changed? (purpose and motivation)
- What's the outcome? (expected result or benefit)

# Output Format

Generate commit messages in this structure:

<type>(<scope>): <short description>

<detailed description>

<breaking changes if applicable>
<additional notes if applicable>

## Commit Types
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes (formatting, no logic change)
- refactor: Code refactoring (no functional change)
- perf: Performance improvements
- test: Adding or updating tests
- chore: Maintenance tasks, dependencies, configs
- build: Build system or external dependencies
- ci: CI/CD configuration changes
- revert: Reverting a previous commit

## Guidelines
- **Subject line**: Max 72 characters, imperative mood ("add" not "added"), lowercase after colon, no period
- **Scope**: Lowercase, specific but concise (e.g., auth, api, ui)
- **Body**: Explain WHAT and WHY, use bullets for multiple changes, wrap at 72 characters
- **Breaking changes**: Start with "BREAKING CHANGE:" and explain migration path
- **References**: Include issue numbers like "Fixes #123" or "Closes #456"

# Examples

## Example 1: Documentation
docs(readme): enhance project documentation with comprehensive setup guide

- Add detailed feature descriptions and component architecture
- Include complete installation instructions and environment setup
- Document API integration patterns and authentication flow
- Add troubleshooting section for common issues

This update transforms the README from a basic template to a
production-ready developer guide, improving onboarding experience.

## Example 2: Feature
feat(photo-grid): implement GSAP-powered spotlight animation effect

Add interactive spotlight effect that follows cursor movement across
the photo grid using GSAP animations. Features include:

- Smooth position tracking with configurable damping
- Performance-optimized with requestAnimationFrame
- Responsive design that adapts to different screen sizes

This enhancement significantly improves user engagement.

## Example 3: Bug Fix
fix(auth): resolve token expiration handling in API interceptor

Fix issue where expired JWT tokens caused infinite redirect loops.
The authentication interceptor now properly catches 401 responses,
clears invalid tokens, and redirects to login page.

Fixes #234

## Example 4: Breaking Change
feat(api)!: migrate to v2 authentication endpoints

BREAKING CHANGE: Authentication endpoints have changed from /auth/login
to /api/v2/auth/login. Update VITE_API_URL environment variable to
include the /api/v2 prefix.

Migration guide:
1. Update .env file: VITE_API_URL=http://localhost:5000/api/v2
2. Clear browser localStorage to remove old tokens
3. Re-authenticate users on next login

# Quality Requirements

Ensure the commit message:
- Has accurate type and scope
- Uses imperative mood
- Explains WHY the change was made
- Is clear and free of typos
- Would be understandable in 6 months
- Focuses on one logical change (if multiple concerns, suggest splitting)

# Anti-Patterns to Avoid

❌ Too vague: "fix: update files"
✅ Specific: "fix(auth): resolve token refresh race condition"

❌ Too long: "feat: add new photo gallery component with animations and responsive design"
✅ Concise: "feat(gallery): add animated photo grid component"

❌ Mixed concerns: "feat: add login + fix styling + update readme"
✅ Separate: Suggest making 3 different commits

Now analyze the git diff and generate the commit message.`;

export const aiSummariesCommit = async (diff: string) => {
  const response = await model.generateContent([
    `${GIT_COMMIT_SYSTEM_PROMPT}\n\nHere is the git diff:\n\n${diff}`,
  ]);

  return response.response.text();
};

export const summariesCode = async (doc: Document) => {
  console.log("Generating summary for document:", doc.metadata?.source);
  try {
    const code = doc.pageContent.slice(0, 10000); // Limit to first 10,000 characters
    const prompt = `You are an expert software engineer. Provide a concise summary of the following code file, explaining its purpose and functionality. 
Here is the code:\n\n${code}
give a summary no more than 100 words of the code above.
`;
    const response = await model.generateContent([prompt]);
    const summary = response.response.text();
    console.log(`Generated summary for ${doc.metadata?.source}: ${summary}`);
    return summary;
  } catch (error) {
    return "";
  }
};

export const generateEmbedding = async (text: string) => {
  const model = gemini.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  const embedding = result.embedding;
  return embedding.values;
};
