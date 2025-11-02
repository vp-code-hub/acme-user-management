export interface User {
  id: string | number;
  name: string;
  language: string;
  bio: string;
  version: number;
  editing?: boolean; // Add editing property
}
