export interface User {
  id: string;
  email: string;
  role: "residente" | "supervisor" | "auditor";
}