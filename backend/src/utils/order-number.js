const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // High-entropy unique suffix (timestamp ms + random 3-digit entropy)
  const entropySuffix = `${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`;
  
  return `ABL-${year}${month}${day}-${entropySuffix}`;
};

module.exports = {
  generateOrderNumber
};
