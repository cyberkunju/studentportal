Subject: Complete UI/UX Design Plan & Color Strategy (Light/Dark Theme)

This document outlines the complete visual direction and color implementation strategy for the new University Portal, based on the approved blue monochromatic palette.

1. Design Goals & Core Principles

Our primary goal is a minimalist, aesthetic, and timeless design. The interface must feel clean, professional, and "tech-forward," avoiding any cluttered or overly-colored layouts.

Core Principle: "Color as a Tool, Not Decoration."
We will use the lightest and darkest shades as our canvas. The vibrant blues will be applied intentionally to guide the user's eye, indicate interactivity, and establish hierarchy.

2. The Core Palette Strategy

A. The Brand Palette (Your 5 Colors)

This is our primary palette for branding and interactivity.

| Hex      | Name           | Role                                               |
|----------|----------------|----------------------------------------------------|
| #F2FAFF  | Alice Blue     | Light Mode Canvas (Page BG)                        |
| #001926  | Rich Black     | Dark Mode Canvas (Page BG) & Primary Text          |
| #00A9FF  | Picton Blue    | Primary Action (Buttons, Links, Active States)     |
| #89CFF3  | Baby Blue      | Subtle Tonal Color (Tags, Badges)                  |
| #A0E9FF  | Non-Photo Blue | Highlight (Table Hovers, Subtle BGs)               |

B. The Semantic Palette (Mandatory Additions)

To be "timeless," our UI must be clear. We must use universally understood colors for system feedback. This palette is not for decoration.

| Role    | Hex         | Usage                                                        |
|---------|-------------|--------------------------------------------------------------|
| Success | #00B894     | "Submitted" status, Grade "A+", successful payments.         |
| Warning | #F2C94C     | "Pending" status, "Late" status, "Overdue" badges.           |
| Danger  | #E74C3C     | Grade "F" (Fail), deletion actions, critical errors.         |

3. The Dual-Theme Implementation

This plan is built for a switchable light/dark theme using Tailwind's dark: variant.

| Role                 | Light Mode        | Dark Mode               |
|----------------------|-------------------|--------------------------|
| Page Canvas (BG)     | #F2FAFF           | #001926                 |
| Card / Modal BG      | #FFFFFF           | #0A2939                 |
| Text / Headings      | #001926           | #F2FAFF                 |
| Subtle Text / Borders| Rich Black (40–60%) | Alice Blue (40–60%)  |

4. Global Implementation Plan (All 3 Panels)

Page Background:

bg-alice-blue  
dark:bg-rich-black

Main Sidebar (Nav Menu):

Strategy: The sidebar will be bg-rich-black in both light and dark modes. This creates a strong, stable "frame" for the application and is a timeless, professional choice.

Sidebar Links (Text/Icons):

Default State: text-alice-blue/70 (Slightly transparent)  
Active/Hover State: text-picton-blue (and/or a small bg-picton-blue indicator bar).

Text & Headings:

Main Body Text: text-rich-black | dark:text-alice-blue  
Page Headings: text-rich-black | dark:text-alice-blue (larger/bolder)  
Subtle Text (e.g., "Student ID" label): text-rich-black/60 | dark:text-alice-blue/60

Cards (Glassmorphism Style):

Light Mode: bg-white/80 backdrop-blur border border-rich-black/10  
Dark Mode: bg-[#0A2939]/80 backdrop-blur border border-alice-blue/10

Buttons:

Primary Button ("Save," "Submit," "Filter," "Add New"):

bg-picton-blue text-white  
No change for dark mode.

Secondary Button ("Cancel," "Clear Filters"):

border border-rich-black text-rich-black  
dark:border-alice-blue dark:text-alice-blue

Interactive Elements:

Links:  
text-picton-blue  
No change for dark mode.

Table Row Hover:

bg-non-photo-blue/40  
dark:bg-non-photo-blue/20

Form Inputs (Text Fields, Dropdowns):

bg-white border-rich-black/30  
dark:bg-rich-black dark:border-alice-blue/30 dark:text-alice-blue

Form Input (Focus State):

border-picton-blue ring-2 ring-picton-blue/50  
No change for dark mode.

5. Strategic Application (Panel-Specific)

This is how we apply the Brand and Semantic palettes to specific components.

A. Student Panel

Dashboard Notifications:

New Assignment Badge: bg-picton-blue text-white  
Urgent Deadline Text (e.g., "Due in 24h"): text-warning-orange

3D Virtual ID Card:

Background: A gradient from bg-rich-black to bg-picton-blue.  
Text on Card: text-alice-blue or text-white.

Payments Page (Critical Semantic Use):

"Pay Now" Button: bg-picton-blue text-white  
"Overdue" / "Fine" Badges: bg-warning-orange text-rich-black  
"Download Receipt" Button: bg-baby-blue text-rich-black  

Results Page (SGPA/CGPA):

Grade "A+": text-success-green  
Grade "F" (Fail): text-danger-red

B. Teacher Panel

Assignment Tracking Page:

"Submitted" Status: text-success-green  
"Not Submitted" / "Late" Status: text-warning-orange

Student List Filters:

Active Filter Badges: bg-baby-blue text-rich-black

C. Admin Panel

Dashboard Statistic Cards:

"Total Students" / "Total Teachers": text-picton-blue  
"Pending Fees" / "Revenue at Risk": text-warning-orange

Fee Management Page:

"Send Fee Notice" Button: bg-picton-blue text-white  
"Send Bulk Reminders" Button: bg-warning-orange text-rich-black  
"Overdue" Status in Lists: text-warning-orange
