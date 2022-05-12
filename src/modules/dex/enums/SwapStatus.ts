export enum SwapStatus {
  IDLE = 0,
  CONFIRMING,
  CONFIRMED,
  SENT,
  RECEIVED,

  // Errors
  CONFIRM_FAILED,
}
