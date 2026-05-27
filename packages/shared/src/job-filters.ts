export interface JobSearchFilters {
  remoteOnly: boolean;
  keywords: string[];
  includeSeniority: string[];
  excludedKeywords: string[];
}

export const defaultJobSearchFilters: JobSearchFilters = {
  remoteOnly: true,
  keywords: ['react', 'typescript', 'node.js', 'full stack', 'frontend'],
  includeSeniority: ['junior', 'semi senior', 'mid-level'],
  excludedKeywords: ['onsite', 'staff', 'principal', 'sr staff']
};
