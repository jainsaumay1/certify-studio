export interface Recipient {
  full_name: string;
  email: string;
  course: string;
  date: string;
}

export const DEMO_DATA: Recipient[] = [
  { full_name: "Dr. Bartholomew Alexander Montgomery III", email: "b.montgomery@university.edu", course: "Advanced Asymmetric Cryptography & Blockchain Architecture", date: "2026-10-04" },
  { full_name: "JANE DOE", email: "jane.doe@example.com", course: "Executive Leadership", date: "2026-10-04" },
  { full_name: "Søren Kierkegaard Åberg", email: "soren.aberg@nordic.edu", course: "Data Privacy & GDPR Compliance", date: "2026-10-04" },
  { full_name: "张伟 (Zhang Wei)", email: "zhang.wei@global.cn", course: "Machine Learning Engineering", date: "2026-10-04" },
  { full_name: "Aisha Fatima Al-Hassan", email: "aisha.alhassan@tech.org", course: "Cybersecurity Operations", date: "2026-10-04" },
  { full_name: "Jean-Luc Picard-Smythe", email: "j.picard@starfleet.edu", course: "Quantum Computing Fundamentals", date: "2026-10-04" },
  { full_name: "María José de la Cruz-García", email: "maria.cruz@madrid.es", course: "Biomedical Ethics", date: "2026-10-04" },
  { full_name: "Kenji Sato (佐藤健二)", email: "kenji.sato@tokyo.jp", course: "Full-Stack Web Development", date: "2026-10-04" },
  { full_name: "INVALID_EMAIL_USER", email: "invalid-email-format", course: "DevOps Practices", date: "2026-10-04" },
  { full_name: "MISSING_COURSE_USER", email: "user@test.com", course: "", date: "2026-10-04" },
  { full_name: "Carlos Eduardo Santos", email: "carlos.santos@rio.br", course: "Cloud Architecture", date: "2026-10-04" },
  { full_name: "Fatima Zahra Mansour", email: "fatima.mansour@cairo.eg", course: "Artificial Intelligence Ethics", date: "2026-10-04" },
  { full_name: "Liam O'Connor-Smith", email: "liam.oconnor@dublin.ie", course: "Financial Engineering", date: "2026-10-04" },
  { full_name: "Priya Ananya Patel", email: "priya.patel@mumbai.in", course: "Data Analytics", date: "2026-10-04" },
  { full_name: "Dimitri Ivanovich Popov", email: "dimitri.popov@eurasia.net", course: "Network Security", date: "2026-10-04" },
  { full_name: "Nia Kwesi Mensah", email: "nia.mensah@accra.gh", course: "Public Health Administration", date: "2026-10-04" },
  { full_name: "CHLOE TAYLOR", email: "chloe.taylor@london.uk", course: "Digital Product Design", date: "2026-10-04" },
  { full_name: "Alexej Nikolaevič Tolstoy", email: "alex.tolstoy@literary.org", course: "Software Testing & QA", date: "2026-10-04" },
  { full_name: "Lars Gustafsson", email: "lars.g@stockholm.se", course: "Renewable Energy Technology", date: "2026-10-04" },
  { full_name: "Zoe Kim", email: "zoe.kim@seoul.kr", course: "UI/UX Architecture", date: "2026-10-04" },
];
