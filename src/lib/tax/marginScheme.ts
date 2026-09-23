export interface MarginTaxResult {
  sellingPrice: number;
  purchasePrice: number;
  grossMargin: number;
  taxableValue: number;
  gstRate: number;
  gstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  customerDisplayPrice: number; // Discloses only gross selling price to customer
}

/**
 * Calculates Section 15(5) Refurbished Phone Margin Scheme GST.
 * Taxable Value = max(0, Selling Price - Purchase Price).
 * If Selling Price <= Purchase Price, GST Amount is exactly 0.00.
 * Conceals purchase price and margin from customer invoice output.
 */
export function calculateMarginSchemeTax(
  sellingPrice: number,
  purchasePrice: number,
  gstRate: number = 18.0
): MarginTaxResult {
  const grossMargin = sellingPrice - purchasePrice;
  const taxableValue = Math.max(0, grossMargin);

  if (taxableValue <= 0) {
    return {
      sellingPrice,
      purchasePrice,
      grossMargin,
      taxableValue: 0,
      gstRate,
      gstAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      customerDisplayPrice: sellingPrice,
    };
  }

  // Calculate tax contained in taxable margin
  const baseValue = taxableValue / (1 + gstRate / 100);
  const gstAmount = taxableValue - baseValue;
  const cgstAmount = gstAmount / 2;
  const sgstAmount = gstAmount / 2;

  return {
    sellingPrice,
    purchasePrice,
    grossMargin,
    taxableValue,
    gstRate,
    gstAmount,
    cgstAmount,
    sgstAmount,
    customerDisplayPrice: sellingPrice,
  };
}
