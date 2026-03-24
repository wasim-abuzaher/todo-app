---
description: Create a Product Requirements Document from conversation
argument-hint: [output-filename]
---

# Create PRD: Generate Product Requirements Document

## Overview

Generate a comprehensive Product Requirements Document (PRD) based on the current conversation context and requirements discussed. The PRD should be tailored for this React + Vite todo application.

## Output File

Write the PRD to: `$ARGUMENTS` (default: `PRD.md` in project root)

## PRD Structure

Create a well-structured PRD with the following sections. Adapt depth and detail based on available information:

### Required Sections

**1. Executive Summary**
- Concise product overview (2-3 paragraphs)
- Core value proposition
- MVP goal statement

**2. Target Users**
- Primary user personas
- Key user needs and pain points

**3. MVP Scope**
- **In Scope:** Core functionality for MVP (use ✅ checkboxes)
- **Out of Scope:** Features deferred to future phases (use ❌ checkboxes)
- Group by categories (Core Functionality, UI/UX, Data & Storage, Deployment)

**4. User Stories**
- Primary user stories (5-8 stories) in format: "As a [user], I want to [action], so that [benefit]"
- Include concrete examples for each story

**5. Core Architecture & Patterns**
- High-level architecture approach
- Component hierarchy and state management strategy
- Directory structure
- Key design patterns

**6. Features**
- Detailed feature specifications
- Core feature breakdown with acceptance criteria

**7. Technology Stack**
- Frontend technologies with versions (React, Vite, etc.)
- Dependencies and libraries
- Styling approach
- Storage strategy (localStorage, API, etc.)

**8. UI/UX Specification**
- Key screens and layouts
- Interaction patterns
- Responsive design requirements
- Accessibility considerations

**9. Data Model**
- Entity definitions with fields and types
- State shape and management approach
- Storage format

**10. Success Criteria**
- MVP success definition
- Functional requirements (use ✅ checkboxes)
- Quality indicators
- Performance targets

**11. Implementation Phases**
- Break down into 3-4 phases
- Each phase includes: Goal, Deliverables (✅ checkboxes), Validation criteria

**12. Future Considerations**
- Post-MVP enhancements
- Potential integrations
- Advanced features for later phases

**13. Risks & Mitigations**
- 3-5 key risks with specific mitigation strategies

## Instructions

### 1. Extract Requirements
- Review the entire conversation history
- Identify explicit requirements and implicit needs
- Note technical constraints and preferences
- Capture user goals and success criteria

### 2. Synthesize Information
- Organize requirements into appropriate sections
- Fill in reasonable assumptions where details are missing (clearly mark these)
- Maintain consistency across sections
- Ensure technical feasibility within the React + Vite stack

### 3. Write the PRD
- Use clear, professional language
- Include concrete examples and specifics
- Use markdown formatting (headings, lists, code blocks, checkboxes)
- Add code snippets for technical sections where helpful
- Keep Executive Summary concise but comprehensive

### 4. Quality Checks
- ✅ All required sections present
- ✅ User stories have clear benefits
- ✅ MVP scope is realistic and well-defined
- ✅ Technology choices align with existing package.json
- ✅ Implementation phases are actionable
- ✅ Success criteria are measurable
- ✅ Data model supports all described features
- ✅ Consistent terminology throughout

## Style Guidelines

- **Tone:** Professional, clear, action-oriented
- **Format:** Use markdown extensively (headings, lists, code blocks, tables)
- **Checkboxes:** Use ✅ for in-scope items, ❌ for out-of-scope
- **Specificity:** Prefer concrete examples over abstract descriptions
- **Length:** Comprehensive but scannable

## Output Confirmation

After creating the PRD:
1. Confirm the file path where it was written
2. Provide a brief summary of the PRD contents
3. Highlight any assumptions made due to missing information
4. Suggest next steps (e.g., review, refinement, implementation planning)

## Notes

- If critical information is missing, ask clarifying questions before generating
- Adapt section depth based on available details
- Since this is a frontend-focused app, emphasize UI/UX, component architecture, and user experience
- This command contains the complete PRD template structure — no external references needed
