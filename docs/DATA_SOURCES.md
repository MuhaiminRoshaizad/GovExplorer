# Data Sources

The curated catalogue. v1 is **single-source** on `data.gov.my` (no third-party feeds).

---

## Portal references

- **Catalogue UI:** [data.gov.my](https://data.gov.my)
- **Developer docs:** [developer.data.gov.my](https://developer.data.gov.my)
- **Base API:** `https://api.data.gov.my`
- **Catalogue endpoint:** `/data-catalogue?id=<dataset_id>&limit=&sort=`
- **GTFS-Realtime:** `/gtfs-realtime/vehicle-position/{prasarana|mybas-johor}`

Every dataset is published by a Malaysian government agency (DOSM, BNM, JKR, JPM, etc.). Cadences vary — see the per-row "Frequency" column.

---

## Curated catalogue (v1.x)

### Economy & finance

| `id` | Title | Agency | Frequency | Used in |
|---|---|---|---|---|
| `exchangerates` | MYR FX rates | BNM | Daily | Today, Insights/Economy |
| `fuelprice` | RON95 / RON97 / Diesel | KPDN | Weekly (Thu) | Insights/Economy |
| `cpi_headline` | CPI inflation headline | DOSM | Monthly | Insights/Economy |
| `gdp_qtr_real_sa` | Real GDP, quarterly | DOSM | Quarterly | Insights/Economy |
| `bnm_reserves` | International reserves | BNM | Bi-monthly | Insights/Economy |

### Transit & mobility

| `id` | Title | Agency | Frequency | Used in |
|---|---|---|---|---|
| `ridership_headline` | Daily public transport ridership | Prasarana | Daily | Today, Insights/Transit |
| `road_accidents_daily` | Road accidents | PDRM | Daily | Insights/Transit |
| `vehicles_active` | Active vehicle registrations | JPJ | Monthly | Insights/Transit |
| `gtfs-rt vehicle-position` | Live vehicle positions | Prasarana / MyBAS | Realtime | v1.2 Map overlay |

### Climate & environment

| `id` | Title | Agency | Frequency | Used in |
|---|---|---|---|---|
| `weather_warning` | Active weather warnings | MetMalaysia | Realtime | Today, Insights/Climate |
| `rainfall_daily` | Daily rainfall | MetMalaysia | Daily | Insights/Climate |
| `aqi_continuous` | AQI by station | DOE | Hourly | Insights/Climate |
| `water_levels_dam` | Reservoir levels | JPS | Daily | Insights/Climate |

### Population & society

| `id` | Title | Agency | Frequency | Used in |
|---|---|---|---|---|
| `population_state` | Population by state | DOSM | Annual | Today, Insights/Society |
| `population_age_sex` | Population pyramid | DOSM | Annual | Insights/Society |
| `lfs_month` | Unemployment rate | DOSM | Monthly | Today, Insights/Society |
| `hies_household_income` | Household income | DOSM | Biennial | Insights/Society |
| `births_state` | Births by state | DOSM | Annual | Insights/Society |

---

## Adding a new dataset

1. Confirm it's on `data.gov.my` and grab its `id` from the catalogue UI.
2. Type the raw response shape in the feature's `api/` folder.
3. Write a query hook with a `select` parser that returns view-shaped data.
4. Add a row to the table above.
5. If it's a recurring fixture (Today / Map state drawer), wire it into the feature.

---

## Attribution

Every screen that displays a number from a dataset must surface, at minimum:
- The dataset's title (or a short label)
- The publishing agency
- The `asOf` date

In small UI, the agency name + date is the floor. Hiding attribution is not acceptable.
