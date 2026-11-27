export interface Career {
  id: string;
  title: string;
  category: string;
  summary: string;
  education_path: {
    high_school: string[];
    university: { degree: string; core_skills: string[] };
    workspace: string[];
  };
  salary_by_country: Record<string, {
    currency: string;
    entry: number;
    mid: number;
    senior: number;
  }>;
}
