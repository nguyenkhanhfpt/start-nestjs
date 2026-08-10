/**
 * Type of a user-point transaction.
 * Extensible: future types (e.g. BONUS, REDEEM) can be appended here without
 * breaking existing consumers, as long as everywhere balances are adjusted
 * explicitly maps the new type to a direction (increase or decrease).
 */
export enum PointTransactionType {
  INCREASE = 'INCREASE',
  DECREASE = 'DECREASE',
}
