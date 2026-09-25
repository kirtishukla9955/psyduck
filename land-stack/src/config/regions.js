const regionData = [
  ["andaman", "Andaman & Nicobar Islands", "AN", [11.7401, 92.6586], 8],
  ["andhrapradesh", "Andhra Pradesh", "AP", [15.9129, 79.7400], 7],
  ["arunachalpradesh", "Arunachal Pradesh", "AR", [28.2180, 94.7278], 7],
  ["assam", "Assam", "AS", [26.2006, 92.9376], 7],
  ["bihar", "Bihar", "BR", [25.0961, 85.3131], 7],
  ["chhattisgarh", "Chhattisgarh", "CG", [21.2787, 81.8661], 7],
  ["chandigarh", "Chandigarh", "CH", [30.7333, 76.7794], 13],
  ["delhi", "Delhi", "DL", [28.7041, 77.1025], 10],
  ["dadraandnagarhaveli", "Dadra & Nagar Haveli and Daman & Diu", "DN", [20.3974, 72.8328], 9],
  ["goa", "Goa", "GA", [15.2993, 74.1240], 9],
  ["gujarat", "Gujarat", "GJ", [22.2587, 71.1924], 7],
  ["himachalpradesh", "Himachal Pradesh", "HP", [31.1048, 77.1734], 8],
  ["haryana", "Haryana", "HR", [29.0588, 76.0856], 8],
  ["jharkhand", "Jharkhand", "JH", [23.6102, 85.2799], 7],
  ["jammuandkashmir", "Jammu & Kashmir", "JK", [33.7782, 76.5762], 7],
  ["karnataka", "Karnataka", "KA", [15.3173, 75.7139], 7],
  ["kerala", "Kerala", "KL", [10.8505, 76.2711], 8],
  ["ladakh", "Ladakh", "LA", [34.1526, 77.5771], 7],
  ["lakshadweep", "Lakshadweep", "LD", [10.5667, 72.6417], 8],
  ["maharashtra", "Maharashtra", "MH", [19.7515, 75.7139], 7],
  ["meghalaya", "Meghalaya", "ML", [25.4670, 91.3662], 8],
  ["manipur", "Manipur", "MN", [24.6637, 93.9063], 8],
  ["madhyapradesh", "Madhya Pradesh", "MP", [22.9734, 78.6569], 7],
  ["mizoram", "Mizoram", "MZ", [23.1645, 92.9376], 8],
  ["nagaland", "Nagaland", "NL", [26.1584, 94.5624], 8],
  ["odisha", "Odisha", "OD", [20.9517, 85.0985], 7],
  ["punjab", "Punjab", "PB", [31.1471, 75.3412], 8],
  ["puducherry", "Puducherry", "PY", [11.9416, 79.8083], 10],
  ["rajasthan", "Rajasthan", "RJ", [27.0238, 74.2179], 6],
  ["sikkim", "Sikkim", "SK", [27.5330, 88.5122], 9],
  ["telangana", "Telangana", "TG", [18.1124, 79.0193], 8],
  ["tamilnadu", "Tamil Nadu", "TN", [11.1271, 78.6569], 7],
  ["tripura", "Tripura", "TR", [23.9408, 91.9882], 9],
  ["uttarakhand", "Uttarakhand", "UK", [30.0668, 79.0193], 8],
  ["uttarpradesh", "Uttar Pradesh", "UP", [26.8467, 80.9462], 7],
  ["westbengal", "West Bengal", "WB", [22.9868, 87.8550], 7],
];

export const REGIONS = Object.fromEntries(
  regionData.map(([key, name, stateCode, center, zoom]) => [
    key,
    {
      key,
      name,
      stateCode,
      center,
      zoom,
      imagery: "satellite",
      labels: [],
    },
  ])
);

export const REGION_LIST = Object.values(REGIONS);

export const DEFAULT_REGION_KEY = "chandigarh";
