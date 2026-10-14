/**
 * PDF Engine — vector certificate rendering using pdf-lib
 * Runs in both main thread and Web Worker contexts.
 */
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, StandardFonts, PageSizes } from "pdf-lib";
import QRCode from "qrcode";
import type { TemplateConfig } from "@/components/wizard/Step3_TemplateDesigner";
import type { RowAuditResult } from "./preflight";

export interface CertRenderInput {
  recipientName: string;
  courseName: string;
  issueDate: string;
  certificateCode: string;
  verifyUrl: string;
  templateConfig: TemplateConfig;
  auditResult?: RowAuditResult;
  isPaidTier?: boolean;
}

export interface CertRenderOutput {
  pdfBytes: Uint8Array;
  certificateCode: string;
  recipientName: string;
}

// Hex to rgb (0-1 scale)
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return { r, g, b };
}

// Template background colors/styles
const TEMPLATE_STYLES: Record<
  string,
  { bg: string; accent: string; border: string; title: string }
> = {
  "academic-gold": {
    bg: "#fffdf5",
    accent: "#b7791f",
    border: "#d97706",
    title: "Certificate of Completion",
  },
  "corporate-sleek": {
    bg: "#f0f4f8",
    accent: "#1e3a8a",
    border: "#2563eb",
    title: "Certificate of Achievement",
  },
  minimalist: {
    bg: "#ffffff",
    accent: "#374151",
    border: "#9ca3af",
    title: "Certificate of Completion",
  },
  "prestige-geometric": {
    bg: "#ffffff",
    accent: "#0f2847",
    border: "#94a3b8",
    title: "CERTIFICATE OF ACHIEVEMENT",
  },
  custom: {
    bg: "#ffffff",
    accent: "#4f46e5",
    border: "#818cf8",
    title: "Certificate of Achievement",
  },
};

export async function renderCertificate(
  input: CertRenderInput
): Promise<CertRenderOutput> {
  const {
    recipientName,
    courseName,
    issueDate,
    certificateCode,
    verifyUrl,
    templateConfig,
    auditResult,
    isPaidTier = false,
  } = input;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // A4 Landscape
  const [width, height] = PageSizes.A4.slice().reverse() as [number, number];
  const page = pdfDoc.addPage([width, height]);

  const style =
    TEMPLATE_STYLES[templateConfig.templateId] ||
    TEMPLATE_STYLES["academic-gold"];

  const margin = 24;
  const borderColor = hexToRgb(style.border);

  // Custom Background or Fill
  if (templateConfig.customBackgroundData) {
    try {
      const base64 = templateConfig.customBackgroundData.split(",")[1];
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      let bgImage;
      if (templateConfig.customBackgroundData.startsWith("data:image/png")) {
        bgImage = await pdfDoc.embedPng(bytes);
      } else {
        bgImage = await pdfDoc.embedJpg(bytes);
      }
      page.drawImage(bgImage, { x: 0, y: 0, width, height });
    } catch (e) {
      console.warn("Failed to embed custom background", e);
    }
  } else {
    // Background fill
    const bgColor = hexToRgb(style.bg);
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(bgColor.r, bgColor.g, bgColor.b),
    });

    if (templateConfig.templateId === "prestige-geometric") {
      // Draw Navy, Gold, and Slate corner polygons
      const navy = rgb(0.06, 0.16, 0.28);
      const gold = rgb(0.96, 0.65, 0.12);
      const slate = rgb(0.45, 0.55, 0.65);

      // Left geometric wedges
      page.drawSvgPath(`M 0 ${height} L 85 ${height} L 125 ${height * 0.52} L 45 0 L 0 0 Z`, { color: navy });
      page.drawSvgPath(`M 0 ${height * 0.42} L 110 ${height * 0.53} L 75 ${height * 0.60} L 0 ${height * 0.53} Z`, { color: gold });
      page.drawSvgPath(`M 0 ${height} L 50 ${height} L 0 ${height * 0.82} Z`, { color: slate });

      // Right geometric wedges
      page.drawSvgPath(`M ${width} ${height} L ${width} 0 L ${width - 85} 0 L ${width - 125} ${height * 0.48} L ${width - 45} ${height} Z`, { color: navy });
      page.drawSvgPath(`M ${width} ${height * 0.58} L ${width - 110} ${height * 0.47} L ${width - 75} ${height * 0.40} L ${width} ${height * 0.47} Z`, { color: gold });
      page.drawSvgPath(`M ${width} 0 L ${width - 50} 0 L ${width} ${height * 0.18} Z`, { color: slate });

      // Inner double frame
      page.drawRectangle({
        x: 68,
        y: 35,
        width: width - 136,
        height: height - 70,
        borderColor: rgb(0.8, 0.84, 0.88),
        borderWidth: 2,
        color: rgb(1, 1, 1),
      });
      page.drawRectangle({
        x: 74,
        y: 41,
        width: width - 148,
        height: height - 82,
        borderColor: rgb(0.88, 0.91, 0.94),
        borderWidth: 1,
      });
    } else {
      // Decorative border for standard templates
      page.drawRectangle({
        x: margin,
        y: margin,
        width: width - margin * 2,
        height: height - margin * 2,
        borderColor: rgb(borderColor.r, borderColor.g, borderColor.b),
        borderWidth: 3,
        color: undefined,
      });
      page.drawRectangle({
        x: margin + 6,
        y: margin + 6,
        width: width - (margin + 6) * 2,
        height: height - (margin + 6) * 2,
        borderColor: rgb(borderColor.r, borderColor.g, borderColor.b),
        borderWidth: 1,
        color: undefined,
      });
    }
  }

  // Custom Logo
  if (templateConfig.customLogoData) {
    try {
      const base64 = templateConfig.customLogoData.split(",")[1];
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      let logoImage;
      if (templateConfig.customLogoData.startsWith("data:image/png")) {
        logoImage = await pdfDoc.embedPng(bytes);
      } else {
        logoImage = await pdfDoc.embedJpg(bytes);
      }
      const logoDims = logoImage.scale(0.5); // scale down arbitrarily for now, user can adjust in future
      const targetHeight = 60;
      const targetWidth = (logoDims.width / logoDims.height) * targetHeight;
      page.drawImage(logoImage, {
        x: (width - targetWidth) / 2,
        y: height - 80,
        width: targetWidth,
        height: targetHeight,
      });
    } catch (e) {
      console.warn("Failed to embed custom logo", e);
    }
  }

  // Fonts
  let customFont;
  if (templateConfig.customFontData) {
    try {
      const base64 = templateConfig.customFontData.split(",")[1];
      const fontBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      // Subset to keep size small
      customFont = await pdfDoc.embedFont(fontBytes, { subset: true });
    } catch (e) {
      console.warn("Failed to embed custom font", e);
    }
  }

  const boldFont = customFont || await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = customFont || await pdfDoc.embedFont(StandardFonts.Helvetica);
  const italicFont = customFont || await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const accentColor = hexToRgb(style.accent);

  // Title
  if (!templateConfig.isCleanMode) {
    const customTitleColor = templateConfig.titleColor ? hexToRgb(templateConfig.titleColor) : accentColor;
    const titleOffsetY = templateConfig.titleY || 0;

    if (templateConfig.templateId === "prestige-geometric" && !templateConfig.customTitle) {
      const certText = "C E R T I F I C A T E";
      const certSize = templateConfig.titleFontSize || 26;
      const certWidth = boldFont.widthOfTextAtSize(certText, certSize);
      page.drawText(certText, {
        x: (width - certWidth) / 2,
        y: height - 85 - titleOffsetY,
        font: boldFont,
        size: certSize,
        color: templateConfig.titleColor ? rgb(customTitleColor.r, customTitleColor.g, customTitleColor.b) : rgb(0.06, 0.16, 0.28),
      });

      const achText = "OF ACHIEVEMENT";
      const achSize = Math.max(10, Math.round(certSize * 0.5));
      const achWidth = boldFont.widthOfTextAtSize(achText, achSize);
      page.drawText(achText, {
        x: (width - achWidth) / 2,
        y: height - 85 - titleOffsetY - achSize - 6,
        font: boldFont,
        size: achSize,
        color: rgb(0.2, 0.26, 0.35),
      });

      // Accent diamond divider
      const lineLen = 70;
      const divY = height - 85 - titleOffsetY - achSize - 18;
      page.drawLine({
        start: { x: width / 2 - lineLen - 8, y: divY },
        end: { x: width / 2 - 8, y: divY },
        thickness: 1,
        color: rgb(0.96, 0.65, 0.12),
      });
      page.drawSvgPath(`M ${width / 2} ${divY + 3} L ${width / 2 + 4} ${divY} L ${width / 2} ${divY - 3} L ${width / 2 - 4} ${divY} Z`, {
        color: rgb(0.96, 0.65, 0.12),
      });
      page.drawLine({
        start: { x: width / 2 + 8, y: divY },
        end: { x: width / 2 + lineLen + 8, y: divY },
        thickness: 1,
        color: rgb(0.96, 0.65, 0.12),
      });

      const subText = templateConfig.customSubtitle || "This certificate is proudly presented to";
      const subSize = templateConfig.subtitleFontSize || 12;
      const subWidth = italicFont.widthOfTextAtSize(subText, subSize);
      const subCustomCol = templateConfig.subtitleColor ? hexToRgb(templateConfig.subtitleColor) : null;
      page.drawText(subText, {
        x: (width - subWidth) / 2,
        y: divY - subSize - 10,
        font: italicFont,
        size: subSize,
        color: subCustomCol ? rgb(subCustomCol.r, subCustomCol.g, subCustomCol.b) : rgb(0.35, 0.42, 0.5),
      });
    } else {
      const titleText = templateConfig.customTitle || style.title;
      const titleSize = templateConfig.titleFontSize || 22;
      const titleWidth = boldFont.widthOfTextAtSize(titleText, titleSize);
      page.drawText(titleText, {
        x: (width - titleWidth) / 2,
        y: height - 90 - titleOffsetY,
        font: boldFont,
        size: titleSize,
        color: rgb(customTitleColor.r, customTitleColor.g, customTitleColor.b),
      });

      // Divider
      page.drawLine({
        start: { x: width * 0.2, y: height - 90 - titleOffsetY - 18 },
        end: { x: width * 0.8, y: height - 90 - titleOffsetY - 18 },
        thickness: 1.5,
        color: rgb(borderColor.r, borderColor.g, borderColor.b),
      });

      // "This certifies that" / Subtitle
      const subText = templateConfig.customSubtitle || "This certifies that";
      const subSize = templateConfig.subtitleFontSize || 14;
      const subWidth = italicFont.widthOfTextAtSize(subText, subSize);
      const subCustomCol = templateConfig.subtitleColor ? hexToRgb(templateConfig.subtitleColor) : null;
      const subDefaultCol = templateConfig.isDarkModeTemplate ? rgb(0.9, 0.9, 0.9) : rgb(0.4, 0.4, 0.4);

      page.drawText(subText, {
        x: (width - subWidth) / 2,
        y: height - 90 - titleOffsetY - 18 - subSize - 18,
        font: italicFont,
        size: subSize,
        color: subCustomCol ? rgb(subCustomCol.r, subCustomCol.g, subCustomCol.b) : subDefaultCol,
      });
    }
  }

  // Recipient Name — auto-scaled font
  const nameFontSize = auditResult?.resolvedFontSize ?? templateConfig.nameFontSize;
  const displayName = auditResult?.resolvedName ?? recipientName;
  const nameColor = hexToRgb(templateConfig.nameColor);
  const nameWidth = boldFont.widthOfTextAtSize(displayName, nameFontSize);
  
  const baseNameY = height - 148 - nameFontSize - 20;
  const finalNameY = baseNameY - (templateConfig.nameY || 0); // subtract to push down
  
  if (templateConfig.coverOldText) {
    page.drawRectangle({
      x: width * 0.1,
      y: finalNameY - 10,
      width: width * 0.8,
      height: nameFontSize + 30,
      color: rgb(1, 1, 1),
    });
  }

  page.drawText(displayName, {
    x: Math.max(margin + 10, (width - nameWidth) / 2),
    y: finalNameY,
    font: boldFont,
    size: nameFontSize,
    color: rgb(nameColor.r, nameColor.g, nameColor.b),
  });

  if (!templateConfig.isCleanMode) {
    const isPrestige = templateConfig.templateId === "prestige-geometric";
    // Name underline
    page.drawLine({
      start: { x: width * 0.15, y: baseNameY - 8 },
      end: { x: width * 0.85, y: baseNameY - 8 },
      thickness: isPrestige ? 1 : 0.75,
      color: isPrestige ? rgb(0.96, 0.65, 0.12) : rgb(accentColor.r, accentColor.g, accentColor.b),
    });

    // Completion / Body Phrase
    const completedText =
      templateConfig.customBodyPhrase ||
      (isPrestige
        ? "for successfully completing the curriculum and demonstrating mastery in"
        : "has successfully completed");
    const completedSize = templateConfig.bodyPhraseFontSize || (isPrestige ? 11 : 14);
    const completedWidth = regularFont.widthOfTextAtSize(completedText, completedSize);
    const bodyCustomCol = templateConfig.bodyPhraseColor ? hexToRgb(templateConfig.bodyPhraseColor) : null;
    const bodyDefaultCol = templateConfig.isDarkModeTemplate ? rgb(0.9, 0.9, 0.9) : rgb(0.4, 0.4, 0.4);

    page.drawText(completedText, {
      x: (width - completedWidth) / 2,
      y: baseNameY - 34,
      font: regularFont,
      size: completedSize,
      color: bodyCustomCol ? rgb(bodyCustomCol.r, bodyCustomCol.g, bodyCustomCol.b) : bodyDefaultCol,
    });
  }

  // Course Name
  const courseSize = templateConfig.courseFontSize;
  const courseColor = hexToRgb(templateConfig.courseColor);
  const courseWidth = boldFont.widthOfTextAtSize(courseName, courseSize);
  
  const baseCourseY = baseNameY - 36 - courseSize - 16;
  const finalCourseY = baseCourseY - (templateConfig.courseY || 0);

  if (templateConfig.coverOldText) {
    page.drawRectangle({
      x: width * 0.15,
      y: finalCourseY - 5,
      width: width * 0.7,
      height: courseSize + 15,
      color: rgb(1, 1, 1),
    });
  }

  page.drawText(courseName, {
    x: Math.max(margin + 10, (width - courseWidth) / 2),
    y: finalCourseY,
    font: boldFont,
    size: courseSize,
    color: rgb(courseColor.r, courseColor.g, courseColor.b),
  });

  // Issue Date
  const dateSize = templateConfig.dateFontSize;
  const dateColor = hexToRgb(templateConfig.dateColor);
  const datePrefix = templateConfig.datePrefix || "Issued:";
  const dateText = `${datePrefix} ${issueDate}`;
  const dateWidth = regularFont.widthOfTextAtSize(dateText, dateSize);
  
  const baseDateY = baseCourseY - 50;
  const finalDateY = baseDateY - (templateConfig.dateY || 0);
  const staticColor = templateConfig.isDarkModeTemplate ? rgb(0.9, 0.9, 0.9) : rgb(0.4, 0.4, 0.4);

  page.drawText(dateText, {
    x: (width - dateWidth) / 2,
    y: finalDateY,
    font: regularFont,
    size: dateSize,
    color: templateConfig.isDarkModeTemplate ? staticColor : rgb(dateColor.r, dateColor.g, dateColor.b),
  });

  // Certificate ID
  const codeText = `Certificate ID: ${certificateCode}`;
  const codeWidth = regularFont.widthOfTextAtSize(codeText, 10);
  page.drawText(codeText, {
    x: (width - codeWidth) / 2,
    y: margin + 40,
    font: regularFont,
    size: 10,
    color: templateConfig.isDarkModeTemplate ? rgb(0.8, 0.8, 0.8) : rgb(0.5, 0.5, 0.5),
  });

  // Dual Signatures & Center Seal
  const showSignatures =
    templateConfig.showSignatures ?? (templateConfig.templateId === "prestige-geometric");

  if (showSignatures) {
    const leftSigText = templateConfig.leftSignatureTitle || "Authorized Signature";
    const rightSigText = templateConfig.rightSignatureTitle || "Director of Certification";

    // Left Signature
    page.drawLine({
      start: { x: 125, y: 75 },
      end: { x: 265, y: 75 },
      thickness: 1,
      color: rgb(0.4, 0.45, 0.5),
    });
    const sigLabel1Width = regularFont.widthOfTextAtSize(leftSigText, 9);
    page.drawText(leftSigText, {
      x: 125 + (140 - sigLabel1Width) / 2,
      y: 60,
      font: italicFont,
      size: 9,
      color: rgb(0.4, 0.45, 0.5),
    });
    const sigSub1 = "SIGNATURE";
    const sigSub1Width = regularFont.widthOfTextAtSize(sigSub1, 7);
    page.drawText(sigSub1, {
      x: 125 + (140 - sigSub1Width) / 2,
      y: 48,
      font: boldFont,
      size: 7,
      color: rgb(0.65, 0.7, 0.75),
    });

    // Center Gold Medal Seal (if prestige-geometric)
    if (templateConfig.templateId === "prestige-geometric") {
      const sealX = width / 2;
      const sealY = 75;
      // Ribbons
      page.drawSvgPath(`M ${sealX - 8} ${sealY - 5} L ${sealX - 16} ${sealY - 35} L ${sealX - 9} ${sealY - 27} L ${sealX - 2} ${sealY - 35} Z`, {
        color: rgb(0.96, 0.65, 0.12),
      });
      page.drawSvgPath(`M ${sealX + 8} ${sealY - 5} L ${sealX + 2} ${sealY - 35} L ${sealX + 9} ${sealY - 27} L ${sealX + 16} ${sealY - 35} Z`, {
        color: rgb(0.96, 0.65, 0.12),
      });
      // Circles
      page.drawCircle({ x: sealX, y: sealY, size: 24, color: rgb(0.96, 0.65, 0.12) });
      page.drawCircle({ x: sealX, y: sealY, size: 20, color: rgb(0.06, 0.16, 0.28) });
      const awardText = "AWARD";
      const awardWidth = boldFont.widthOfTextAtSize(awardText, 7);
      page.drawText(awardText, {
        x: sealX - awardWidth / 2,
        y: sealY - 3,
        font: boldFont,
        size: 7,
        color: rgb(0.96, 0.65, 0.12),
      });
    }

    // Right Signature
    page.drawLine({
      start: { x: width - 265, y: 75 },
      end: { x: width - 125, y: 75 },
      thickness: 1,
      color: rgb(0.4, 0.45, 0.5),
    });
    const sigLabel2Width = regularFont.widthOfTextAtSize(rightSigText, 9);
    page.drawText(rightSigText, {
      x: width - 265 + (140 - sigLabel2Width) / 2,
      y: 60,
      font: italicFont,
      size: 9,
      color: rgb(0.4, 0.45, 0.5),
    });
    const sigSub2 = "SIGNATURE";
    const sigSub2Width = regularFont.widthOfTextAtSize(sigSub2, 7);
    page.drawText(sigSub2, {
      x: width - 265 + (140 - sigSub2Width) / 2,
      y: 48,
      font: boldFont,
      size: 7,
      color: rgb(0.65, 0.7, 0.75),
    });
  }

  // QR Code
  try {
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 200,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });
    const qrBase64 = qrDataUrl.split(",")[1];
    const qrBytes = Uint8Array.from(atob(qrBase64), (c) => c.charCodeAt(0));
    const qrImage = await pdfDoc.embedPng(qrBytes);
    const qrSize = templateConfig.qrSize;
    page.drawImage(qrImage, {
      x: width - margin - qrSize - 20,
      y: margin + 20,
      width: qrSize,
      height: qrSize,
    });

    // QR label
    const qrLabel = "Scan to verify";
    const qrLabelWidth = regularFont.widthOfTextAtSize(qrLabel, 8);
    page.drawText(qrLabel, {
      x: width - margin - qrSize - 20 + (qrSize - qrLabelWidth) / 2,
      y: margin + 12,
      font: regularFont,
      size: 8,
      color: rgb(0.5, 0.5, 0.5),
    });
  } catch {
    // QR render failure is non-fatal
  }

  // Free tier watermark
  if (!isPaidTier) {
    const wmText = "Issued via Certify Studio Free";
    const wmSize = 9;
    const wmWidth = regularFont.widthOfTextAtSize(wmText, wmSize);
    page.drawText(wmText, {
      x: (width - wmWidth) / 2,
      y: margin + 8,
      font: regularFont,
      size: wmSize,
      color: rgb(0.7, 0.7, 0.7),
    });
  }

  const pdfBytes = await pdfDoc.save();
  return { pdfBytes, certificateCode, recipientName };
}
