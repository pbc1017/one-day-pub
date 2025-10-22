import { z } from 'zod';

export const checkAvailabilityResponseSchema = z.object({
  isAvailable: z.boolean(),
});

export const generalSeatSchema = z.object({
  seatId: z.number().int(),
  availableCount: z.number().int().min(0),
  femaleCount: z.number().int().min(0),
  maleCount: z.number().int().min(0),
});

export const getGeneralSeatsResponseSchema = z.object({
  seats: z.array(generalSeatSchema),
});

export const createRegistrationResponseSchema = z.object({
  registrationId: z.string(),
  message: z.string(),
});

export type CheckAvailabilityResponse = z.infer<typeof checkAvailabilityResponseSchema>;
export type GeneralSeat = z.infer<typeof generalSeatSchema>;
export type GetGeneralSeatsResponse = z.infer<typeof getGeneralSeatsResponseSchema>;
export type CreateRegistrationResponse = z.infer<typeof createRegistrationResponseSchema>;
