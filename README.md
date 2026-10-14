# Certify Studio 🎓

A modern, privacy-first bulk certificate generation & email dispatch platform built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, and **pdf-lib**. Zero recipient data leaves your browser — certificates are compiled client-side with cryptographic SHA-256 verification and QR codes.

![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

- **🚀 6-Step Wizard Workflow**:
  1. **CSV / Excel Ingest**: Upload recipient lists with automatic header detection and validation.
  2. **Smart Field Mapping**: Map names, emails, course titles, and dates with Title Case & trim cleaning.
  3. **Visual Template Designer**: 
     - 5 built-in vector templates (*Academic Gold*, *Corporate Sleek*, *Minimalist*, *Prestige Geometric*, and *Custom*).
     - Full typography customization (fonts, colors, sizes, and offsets).
     - Custom background, logo, and TTF font uploads.
     - Clean Mode & Whiteout overlay for Canva/Figma backgrounds.
  4. **Live Interactive Preview**: Real-time rendering with recipient cycler.
  5. **Preflight Engine**: Audits names, detects overlaps, checks text bounds, and fixes errors automatically.
  6. **Client-Side Vector PDF Generation**: Generates high-res, print-ready PDFs at lightning speed.
- **📧 Built-in Email Dispatch**:
  - Integrated SMTP delivery (Gmail, Outlook, Yahoo, Zoho, or Custom SMTP).
  - Native Gmail App Password support with whitespace stripping.
  - One-click **"Test Login Connection"** tool.
  - Automatic PDF certificate attachments and verification links.
- **🌓 System Theme Alignment**:
  - Automatically matches your Windows/system theme (Dark/Light mode).
  - Quick toggle in header: System 🖥️ / Dark 🌙 / Light ☀️.
- **🔒 Cryptographic Verification**:
  - Real-time SHA-256 tamper-evident hashing.
  - Embedded dynamic verification QR codes linking to `/verify?id=...`.
- **📦 Registry & Batch Operations**:
  - Searchable credential registry with status badges (*Valid*, *Corrected*, *Reissued*, *Revoked*).
  - Bulk ZIP download via streaming `fflate`.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **PDF Engine**: [pdf-lib](https://pdf-lib.js.org/) with `@pdf-lib/fontkit`
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Email Delivery**: [Nodemailer](https://nodemailer.com/)
- **QR Engine**: [qrcode](https://www.npmjs.com/package/qrcode)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.18 or higher)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/certify-studio.git
   cd certify-studio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 📧 Email Configuration (Gmail)

To dispatch certificates via Gmail:
1. Turn on **2-Step Verification** on your Google Account.
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords).
3. Create an app password for **Mail** / **Certify Studio**.
4. Enter your email and the 16-character code in the email dispatch modal.
5. Click **"Test Login Connection"** to verify, then send!

---

## 📄 License

MIT License — Feel free to use and modify for personal or commercial projects.
