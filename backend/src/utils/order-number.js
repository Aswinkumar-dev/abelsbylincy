const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Random 4-digit suffix
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  
  return `ABL-${year}${month}${day}-${randomSuffix}`;
};

module.exports = {
  generateOrderNumber
};
