export function formatCurrency(cents: number) {
  return new Intl.NumberFormat("es-EC", {
    currency: "USD",
    style: "currency"
  }).format(cents / 100);
}
