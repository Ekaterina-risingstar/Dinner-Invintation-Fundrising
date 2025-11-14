export type Attendance = "alone" | "partner" | "donate" | "";
export type MealPreference = "vegan" | "vegetarian" | "meat" | "";

export interface FormData {
  fullName: string;
  attendance: Attendance;
  mealPreference: MealPreference;
  allergies: string;
  hasConfirmedPayment: boolean;
}