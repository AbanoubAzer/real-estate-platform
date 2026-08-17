export function calculateMatchScore(property: any, filters: any): number {
  if (!filters || Object.keys(filters).length === 0) return 100;

  let totalScore = 0;
  let maxPossibleScore = 0;

  // 1. Budget/Payment Plan (30%)
  if (filters.maxPrice || filters.minPrice) {
    maxPossibleScore += 30;
    const propPrice = property.price;
    const min = filters.minPrice ? parseFloat(filters.minPrice) : 0;
    const max = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;

    if (propPrice >= min && propPrice <= max) {
      totalScore += 30; // 100% match
    } else {
      // Partial match if within 15%
      const diff = propPrice > max ? (propPrice - max) / max : (min - propPrice) / min;
      if (diff <= 0.15) {
        totalScore += 30 * (1 - (diff / 0.15)); // Proportional degradation
      }
    }
  }

  // 2. Location (30%)
  if (filters.city || filters.areaLocation) {
    maxPossibleScore += 30;
    let locScore = 0;
    if (filters.city && property.city?.toLowerCase() === filters.city.toLowerCase()) locScore += 15;
    if (filters.areaLocation && property.areaLocation?.toLowerCase() === filters.areaLocation.toLowerCase()) locScore += 15;
    
    // If only one was provided, give full 30 if it matches
    if (filters.city && !filters.areaLocation && locScore === 15) locScore = 30;
    if (!filters.city && filters.areaLocation && locScore === 15) locScore = 30;

    totalScore += locScore;
  }

  // 3. Specs: Bedrooms & Bathrooms (20%)
  if (filters.minBedrooms || filters.minBathrooms) {
    maxPossibleScore += 20;
    let specsScore = 0;
    
    if (filters.minBedrooms && property.bedrooms >= parseInt(filters.minBedrooms)) specsScore += 10;
    if (filters.minBathrooms && property.bathrooms >= parseInt(filters.minBathrooms)) specsScore += 10;

    if (filters.minBedrooms && !filters.minBathrooms && specsScore === 10) specsScore = 20;
    if (!filters.minBedrooms && filters.minBathrooms && specsScore === 10) specsScore = 20;

    totalScore += specsScore;
  }

  // 4. Purpose / Investment Type (20%)
  if (filters.purpose) {
    maxPossibleScore += 20;
    if (property.purpose === filters.purpose) {
      totalScore += 20;
    }
  }

  // Return baseline 50% if no maxPossibleScore to avoid 0/0, else calculate percentage
  if (maxPossibleScore === 0) return 100;
  
  return Math.round((totalScore / maxPossibleScore) * 100);
}
