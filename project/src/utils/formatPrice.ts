export const formatPrice = (price: number, currency: 'PKR' | 'USD' = 'PKR') => {
  if (currency === 'PKR') {
    return `Rs ${price.toLocaleString('en-PK')}`;
  }
  return `$${price.toLocaleString('en-US')}`;
};
