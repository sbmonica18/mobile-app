export type User = {
  id: number;
  fullName: string;
  email: string;
  preferredTravelStyle?: string | null;
  preferredTransportMode?: string | null;
  preferredBudgetTier?: string | null;
  avatarUrl?: string | null;
};

export type AuthResponse = {
  accessToken: string;
  tokenType: string;
  user: User;
};

export type ForgotPasswordResponse = {
  message: string;
  resetToken: string | null;
};

export type UpdateProfilePayload = {
  fullName?: string;
  preferredTravelStyle?: string | null;
  preferredTransportMode?: string | null;
  preferredBudgetTier?: string | null;
  avatarUrl?: string | null;
};
