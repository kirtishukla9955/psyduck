import * as turf from '@turf/turf';

const BASE = import.meta.env.BASE_URL;

const cache = {};

const NA = 'Not recorded';

const KNOWN_ZONES = [
  'residential',
  'commercial',
  'agricultural',
  'industrial',
];

function firstValue(...values) {
  return values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ''
  );
}

function normalize(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function areaToSqm(area, unit) {
  const value = Number(area);

  if (!Number.isFinite(value)) return null;

  const u = String(unit ?? '')
    .toLowerCase()
    .replace(/\s+/g, '');

  if (
    u.includes('sqm') ||
    u.includes('m2') ||
    u.includes('squaremeter')
  ) {
    return value;
  }

  if (u.includes('hectare') || u === 'ha') {
    return value * 10000;
  }

  if (u.includes('acre') || u === 'ac') {
    return value * 4046.8564224;
  }

  return value;
}

async function loadJson(path) {
  const response = await fetch(`${BASE}${path}`);

  if (!response.ok) {
    throw new Error(
      `Failed to load ${path}: ${response.status}`
    );
  }

  return response.json();
}

function buildIndexes(records = [], anomalies = []) {
  const recordsByUlpin = {};
  const conflictsByUlpin = {};

  if (Array.isArray(records)) {
    records.forEach((record) => {
      if (record?.ulpin) {
        recordsByUlpin[record.ulpin] = record;
      }
    });
  }

  if (Array.isArray(anomalies)) {
    anomalies.forEach((anomaly) => {
      if (!anomaly?.ulpin) return;

      if (!conflictsByUlpin[anomaly.ulpin]) {
        conflictsByUlpin[anomaly.ulpin] = [];
      }

      conflictsByUlpin[anomaly.ulpin].push(anomaly);
    });
  }

  return {
    recordsByUlpin,
    conflictsByUlpin,
  };
}

function convertParcel(feature, index, indexes) {
  const geometry = feature?.geometry;

  if (
    !geometry ||
    !['Polygon', 'MultiPolygon'].includes(geometry.type)
  ) {
    return null;
  }

  const p = feature.properties || {};

  // Friend's 20K dataset
  const ulpin = firstValue(
    p.ulpin,
    p.ULPIN,
    p.id,
    `UNASSIGNED-${String(index + 1).padStart(3, '0')}`
  );

  const record =
    indexes.recordsByUlpin[ulpin] || {};

  const departments = record.departments || {};
  const revenue = departments.revenue || {};
  const registration = departments.registration || {};
  const survey = departments.survey || {};
  const urban = departments.urban_development || {};

  const identifiers = revenue.identifiers || {};

  const ownerName = firstValue(
    p.ownerName,
    p.owner_name,
    revenue.owner_name
  );

  const khasra = firstValue(
    p.khasraPlotNo,
    p.khasra_plot_no,
    p.khasra_no,
    p.khasraNo,
    p.khata_no,
    identifiers.khasra_no,
    identifiers.khewat_no,
    identifiers.patta_number
  );

  const landUse = firstValue(
    p.landUseCategory,
    p.land_use_category,
    p.land_use,
    revenue.land_use_raw,
    urban.zoning_normalized
  );

  const status = firstValue(
    p.status,
    p.record_status
  );

  let areaSqm = areaToSqm(
    firstValue(
      p.recordedArea,
      p.recorded_area,
      p.area_sqm
    ),
    firstValue(
      p.recordedAreaUnit,
      p.recorded_area_unit,
      p.area_unit
    )
  );

  // If no usable recorded area exists, calculate it
  // from the actual polygon.
  if (areaSqm === null) {
    try {
      areaSqm = turf.area({
        type: 'Feature',
        properties: {},
        geometry,
      });
    } catch {
      areaSqm = 0;
    }
  }

  const zoneRaw = String(
    firstValue(
      landUse,
      p.zone,
      ''
    )
  ).toLowerCase();

  const zone = KNOWN_ZONES.includes(zoneRaw)
    ? zoneRaw
    : zoneRaw || 'unclassified';

  const surveyDate = firstValue(
    p.survey_date,
    p.surveyDate,
    p.last_survey_date,
    survey.survey_date
  );

  const boundarySource = firstValue(
    p.boundary_source,
    p.boundarySource,
    p.survey_agency,
    p.surveyAgency,
    survey.survey_agency,
    '20K cadastral/GIS dataset'
  );

  const registeredOwner = firstValue(
    p.registered_owner,
    p.registeredOwner,
    registration.registered_owner
  );

  const registrationDate = firstValue(
    p.registration_date,
    p.registrationDate,
    registration.registration_date
  );

  const anomalies =
    indexes.conflictsByUlpin[ulpin] || [];

  const disputed =
    String(status ?? '').toLowerCase() === 'disputed' ||
    p.dispute_flag === true ||
    p.disputeFlag === true;

  let conflict = {
    has_conflict: false,
  };

  if (anomalies.length > 0) {
    conflict = {
      has_conflict: true,
      description:
        anomalies[0]?.description ||
        'Conflicting departmental records detected.',
    };
  } else if (disputed) {
    conflict = {
      has_conflict: true,
      description:
        'This parcel is marked as disputed in the dataset.',
    };
  }

  return {
    type: 'Feature',
    geometry,

    properties: {
      ulpin,

      parcel_id:
        firstValue(
          p.parcelId,
          p.parcel_id
        ) || NA,

      state:
        firstValue(
          p.state,
          p.state_name
        ) || NA,

      state_code:
        firstValue(
          p.stateCode,
          p.state_code
        ) || NA,

      district:
        firstValue(
          p.district,
          p.district_name
        ) || NA,

      village:
        firstValue(
          p.village,
          p.village_name
        ) || NA,

      parcel_status:
        status || NA,

      zone,

      area_sqm:
        Math.round(areaSqm * 100) / 100,

      base_layer: {
        last_survey_date:
          surveyDate || NA,

        boundary_source:
          boundarySource,
      },

      essential_layers: {
        record_of_rights: {
          owner_name:
            ownerName || NA,

          khata_no:
            khasra || NA,
        },

        registration: {
          latest_owner_name:
            registeredOwner || NA,

          deed_date:
            registrationDate || NA,
        },

        land_use:
          landUse || NA,

        building_permission:
          firstValue(
            p.building_permission_status,
            urban.building_permission_status
          ) || NA,

        encumbrance:
          firstValue(
            p.encumbrance,
            p.encumbrance_status
          ) || NA,
      },

      additional_layers: {
        utilities: [],

        property_tax_status:
          firstValue(
            p.property_tax_status,
            p.propertyTaxStatus
          ) || NA,

        restriction_zone:
          firstValue(
            p.restriction_zone,
            p.restrictionZone
          ) || null,
      },

      conflict,

      data_source:
        '20K parcel database',
    },
  };
}

function findStateForRegion(index, regionKey) {
  const target = normalize(regionKey);

  // Exact normalized state-name match.
  const exact = index.find((entry) => {
    return (
      normalize(entry.state) === target ||
      normalize(entry.stateName) === target ||
      normalize(entry.name) === target
    );
  });

  if (exact) return exact;

  // Loose match.
  const loose = index.find((entry) => {
    const candidates = [
      entry.state,
      entry.stateName,
      entry.name,
    ];

    return candidates.some((value) => {
      const normalized = normalize(value);

      return (
        normalized.includes(target) ||
        target.includes(normalized)
      );
    });
  });

  return loose || null;
}

async function loadRegion(regionKey) {
  if (cache[regionKey]) {
    return cache[regionKey];
  }

  cache[regionKey] = (async () => {
    try {
      // 1. Load the 36-state index.
      const index = await loadJson(
        'data/parcels_index.json'
      );

      // 2. Find the state corresponding to the
      //    currently selected region.
      const stateEntry =
        findStateForRegion(index, regionKey);

      if (!stateEntry) {
        console.error(
          'No 20K dataset state found for:',
          regionKey
        );

        return {
          type: 'FeatureCollection',
          features: [],
          error: 'STATE_NOT_FOUND',
        };
      }

      console.log(
        `Loading 20K parcels: ${stateEntry.state} (${stateEntry.stateCode})`
      );

      // 3. Load ONLY that state's parcel file.
      const geo = await loadJson(
        `data/parcels/${stateEntry.stateCode}.geojson`
      );

      // 4. Keep your existing records/anomalies data.
      const [records, anomalies] =
        await Promise.all([
          loadJson('data/records.json').catch(() => []),
          loadJson('data/anomalies.json').catch(() => []),
        ]);

      const indexes = buildIndexes(
        records,
        anomalies
      );

      // 5. Convert friend's data into the format
      //    your existing ParcelExplainPanel expects.
      const features = (geo.features || [])
        .map((feature, index) =>
          convertParcel(
            feature,
            index,
            indexes
          )
        )
        .filter(Boolean);

      console.log(
        `Loaded ${features.length} parcels for ${stateEntry.state}`
      );

      return {
        type: 'FeatureCollection',
        features,
        regionKey,
        stateCode: stateEntry.stateCode,
        stateName: stateEntry.state,
      };

    } catch (error) {
      console.error(
        `20K parcel loading failed for ${regionKey}:`,
        error
      );

      return {
        type: 'FeatureCollection',
        features: [],
        error: 'STATIC_DATA_ERROR',
      };
    }
  })();

  return cache[regionKey];
}

export const api = {
  getParcels: async (regionKey = 'chandigarh') => {
    return loadRegion(regionKey);
  },

  getParcelByUlpin: async (ulpin) => {
    const loaded = await Promise.all(
      Object.values(cache)
    );

    for (const collection of loaded) {
      const found = collection?.features?.find(
        (feature) =>
          feature.properties?.ulpin === ulpin
      );

      if (found) {
        return found;
      }
    }

    return null;
  },
};