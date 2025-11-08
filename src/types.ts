export type Attendance = "alone" | "partner" | "";
export type MealPreference = "vegan" | "vegetarian" | "meat" | "";

export interface FormData {
  fullName: string;
  attendance: Attendance;
  mealPreference: MealPreference;
  allergies: string;
  hasConfirmedPayment: boolean;
}
