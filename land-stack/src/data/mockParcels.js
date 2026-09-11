// c:/Users/KIRTI/OneDrive/Desktop/psyduck/land-stack/src/data/mockParcels.js

const centerLng = 76.7725;
const centerLat = 30.7335;

// Convert meters to decimal degrees approximation
function mToDeg(dx, dy) {
  const latDeg = dy / 111111;
  const lngDeg = dx / (111111 * Math.cos(centerLat * Math.PI / 180));
  return [lngDeg, latDeg];
}

const zones = ["residential", "commercial", "agricultural", "industrial"];
const owners = ["Ramesh Kumar", "Sunita Devi", "Anil Sharma", "Priya Singh", "Amit Patel"];

// Generate an irregular, adjoining mesh of points
const points = [];
const rows = 5;
const cols = 6;
for (let r = 0; r <= rows; r++) {
  let row = [];
  for (let c = 0; c <= cols; c++) {
    // Base grid size: ~25m x 30m parcels
    let x = c * 25;
    let y = r * 30;
    
    // Add organic jitter to internal vertices to make irregular shapes
    if (r > 0 && r < rows) y += (Math.random() * 8 - 4);
    if (c > 0 && c < cols) x += (Math.random() * 8 - 4);
    
    // Rotate the whole block by ~8 degrees to match underlying street angles
    let angle = 8 * Math.PI / 180;
    let rx = x * Math.cos(angle) - y * Math.sin(angle);
    let ry = x * Math.sin(angle) + y * Math.cos(angle);
    
    // Offset to center the cluster
    rx -= (cols * 25) / 2;
    ry -= (rows * 30) / 2;
    
    row.push(mToDeg(rx, ry));
  }
  points.push(row);
}

const features = [];
let idCounter = 1;

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    // Skip a few to create gaps/alleys or irregular block boundaries
    if ((r === 1 && c === 2) || (r === 3 && c === 4)) continue;

    // Randomly merge two adjacent parcels horizontally to create larger plots
    let isLarge = false;
    let cEnd = c + 1;
    if (c < cols - 1 && Math.random() > 0.75 && !(r === 1 && c + 1 === 2) && !(r === 3 && c + 1 === 4)) {
      isLarge = true;
      cEnd = c + 2;
    }

    const coords = [
      [centerLng + points[r][c][0], centerLat + points[r][c][1]],
      [centerLng + points[r][cEnd][0], centerLat + points[r][cEnd][1]],
      [centerLng + points[r + 1][cEnd][0], centerLat + points[r + 1][cEnd][1]],
      [centerLng + points[r + 1][c][0], centerLat + points[r + 1][c][1]]
    ];
    coords.push([...coords[0]]); // Close the polygon loop

    const area = isLarge ? Math.floor(1000 + Math.random() * 500) : Math.floor(400 + Math.random() * 200);
    const zone = zones[(r + c) % zones.length];
    const isConflict = idCounter % 5 === 0;

    features.push({
      type: "Feature",
      properties: {
        ulpin: `CH-0423-0091-${String(idCounter).padStart(4, '0')}`,
        zone,
        area_sqm: area,
        base_layer: {
          last_survey_date: "2023-08-14",
          boundary_source: "Survey & Settlement Dept."
        },
        essential_layers: {
          record_of_rights: { owner_name: owners[idCounter % owners.length], khata_no: `KH-${2000 + idCounter}` },
          registration: { 
            latest_owner_name: isConflict ? owners[(idCounter + 1) % owners.length] : owners[idCounter % owners.length], 
            deed_date: "2026-03-12" 
          },
          land_use: `${zone.charAt(0).toUpperCase() + zone.slice(1)} - Zone R${r+1}`,
          building_permission: idCounter % 3 === 0 ? "Pending Approval" : "Approved (2022-01-10)",
          encumbrance: idCounter % 4 === 0 ? "Mortgaged to SBI" : "None"
        },
        additional_layers: {
          utilities: ["water", "sewer", ...(idCounter % 2 === 0 ? ["power"] : [])],
          property_tax_status: idCounter % 6 === 0 ? "Pending FY 2025-26" : "Paid FY 2025-26",
          restriction_zone: zone === "agricultural" ? "Green Belt Buffer" : null
        },
        conflict: isConflict ? {
          has_conflict: true,
          type: "owner_name_mismatch",
          description: "RoR owner does not match latest registered deed owner — mutation not filed."
        } : { has_conflict: false }
      },
      geometry: {
        type: "Polygon",
        coordinates: [coords]
      }
    });

    idCounter++;
    if (isLarge) c++; // Skip the next column as it was merged
  }
}

export const mockParcels = {
  type: "FeatureCollection",
  features
};
