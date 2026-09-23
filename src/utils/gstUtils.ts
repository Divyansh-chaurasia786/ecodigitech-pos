export function getPlaceOfSupplyFromAddress(address?: string, fallback?: string): string {
  if (!address && fallback) return fallback;
  const addr = (address || "").toLowerCase();

  if (
    addr.includes("uttar pradesh") ||
    addr.includes("u.p") ||
    addr.includes("u p") ||
    addr.includes("saharanpur") ||
    addr.includes("noida") ||
    addr.includes("ghaziabad") ||
    addr.includes("lucknow") ||
    addr.includes("kanpur") ||
    addr.includes("prayagraj") ||
    addr.includes("agra") ||
    addr.includes("varanasi") ||
    addr.includes("meerut") ||
    addr.includes("gorakhpur") ||
    addr.includes("bareilly") ||
    addr.includes("aligarh") ||
    addr.includes("moradabad")
  ) {
    return "Uttar Pradesh (09)";
  }
  if (addr.includes("delhi") || addr.includes("new delhi") || addr.includes("dcr")) {
    return "Delhi (07)";
  }
  if (
    addr.includes("haryana") ||
    addr.includes("gurgaon") ||
    addr.includes("gurugram") ||
    addr.includes("faridabad") ||
    addr.includes("panipat") ||
    addr.includes("karnal") ||
    addr.includes("ambala") ||
    addr.includes("hisar")
  ) {
    return "Haryana (06)";
  }
  if (
    addr.includes("punjab") ||
    addr.includes("ludhiana") ||
    addr.includes("amritsar") ||
    addr.includes("jalandhar") ||
    addr.includes("patiala") ||
    addr.includes("bathinda")
  ) {
    return "Punjab (03)";
  }
  if (
    addr.includes("rajasthan") ||
    addr.includes("jaipur") ||
    addr.includes("jodhpur") ||
    addr.includes("udaipur") ||
    addr.includes("kota") ||
    addr.includes("bikaner") ||
    addr.includes("ajmer")
  ) {
    return "Rajasthan (08)";
  }
  if (
    addr.includes("maharashtra") ||
    addr.includes("mumbai") ||
    addr.includes("pune") ||
    addr.includes("nagpur") ||
    addr.includes("thane") ||
    addr.includes("nashik")
  ) {
    return "Maharashtra (27)";
  }
  if (
    addr.includes("gujarat") ||
    addr.includes("ahmedabad") ||
    addr.includes("surat") ||
    addr.includes("vadodara") ||
    addr.includes("rajkot")
  ) {
    return "Gujarat (24)";
  }
  if (
    addr.includes("uttarakhand") ||
    addr.includes("dehradun") ||
    addr.includes("haridwar") ||
    addr.includes("haldwani") ||
    addr.includes("roorkee")
  ) {
    return "Uttarakhand (05)";
  }
  if (addr.includes("himachal") || addr.includes("shimla") || addr.includes("dharamshala") || addr.includes("mandi")) {
    return "Himachal Pradesh (02)";
  }
  if (
    addr.includes("madhya pradesh") ||
    addr.includes("bhopal") ||
    addr.includes("indore") ||
    addr.includes("gwalior") ||
    addr.includes("jabalpur")
  ) {
    return "Madhya Pradesh (23)";
  }
  if (addr.includes("bihar") || addr.includes("patna") || addr.includes("gaya") || addr.includes("muzaffarpur")) {
    return "Bihar (10)";
  }
  if (addr.includes("west bengal") || addr.includes("kolkata") || addr.includes("howrah") || addr.includes("siliguri")) {
    return "West Bengal (19)";
  }
  if (
    addr.includes("karnataka") ||
    addr.includes("bengaluru") ||
    addr.includes("bangalore") ||
    addr.includes("mysore") ||
    addr.includes("hubli")
  ) {
    return "Karnataka (29)";
  }
  if (addr.includes("tamil nadu") || addr.includes("chennai") || addr.includes("coimbatore") || addr.includes("madurai")) {
    return "Tamil Nadu (33)";
  }
  if (addr.includes("telangana") || addr.includes("hyderabad") || addr.includes("warangal")) {
    return "Telangana (36)";
  }
  if (addr.includes("kerala") || addr.includes("kochi") || addr.includes("trivandrum") || addr.includes("calicut")) {
    return "Kerala (32)";
  }
  if (addr.includes("andhra pradesh") || addr.includes("visakhapatnam") || addr.includes("vijayawada")) {
    return "Andhra Pradesh (37)";
  }
  if (addr.includes("chandigarh")) {
    return "Chandigarh (04)";
  }
  if (addr.includes("jammu") || addr.includes("kashmir") || addr.includes("srinagar")) {
    return "Jammu & Kashmir (01)";
  }

  return fallback || "Delhi (07)";
}
