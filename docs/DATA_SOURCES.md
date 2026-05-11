# Data Sources

The curated catalogue. v1 is **single-source** on `data.gov.my` (no third-party feeds).

---

## Portal references

- **Catalogue UI:** [data.gov.my](https://data.gov.my/data-catalogue)
- **Developer docs:** [developer.data.gov.my](https://developer.data.gov.my)
- **Base API:** `https://api.data.gov.my`
- **Catalogue endpoint:** `https://api.data.gov.my/data-catalogue?id=<dataset_id>&limit=N&sort=-date`

The catalogue endpoint redirects (301 → 200), so consumers must follow redirects. The API returns a JSON array of records keyed by `date` (and dataset-specific columns).

---

## Date filtering syntax

`api.data.gov.my` supports date-range filtering with a non-obvious syntax:

```
?date_start=2025-04-01@date
?date_end=2026-05-01@date
```

The `@column` suffix is **required** — naked date params return HTTP 400.

---

## Catalogue (7 categories · 35+ datasets)

### Economy & finance

| `id` | Title | Agency | Frequency | Wired |
|---|---|---|---|---|
| `exchangerates_daily_1700` | Exchange rates (17:00 cut) | BNM | Daily | ✅ |
| `fuelprice` | Fuel prices (RON95/RON97/Diesel) | KPDN | Weekly | ✅ |
| `cpi_headline` | CPI inflation (overall division) | DOSM | Monthly | ✅ |
| `gdp_qtr_nominal` | GDP — abs / YoY / QoQ | DOSM | Quarterly | ✅ |
| `monetary_aggregates` | M1 / M2 / M3 | BNM | Monthly | — |
| `interestrates` | Lending / FD rates | BNM | Monthly | — |
| `trnsc_daily_fpx` | FPX daily transactions | PayNet | Daily | — |
| `payment_instruments` | Cards in circulation | BNM | Monthly | — |

### Transport & mobility

| `id` | Title | Agency | Frequency | Wired |
|---|---|---|---|---|
| `ridership_headline` | Public transport ridership | Prasarana / KTMB | Daily | ✅ |

### Environment & energy

| `id` | Title | Agency | Frequency | Wired |
|---|---|---|---|---|
| `electricity_consumption` | Electricity consumption | ST | Annual | — |
| `electricity_supply` | Generation capacity | ST | Annual | — |
| `electricity_access` | Electricity access | ST | Annual | — |
| `water_consumption` | Water consumption | SPAN | Annual | — |
| `water_access` | Treated water access | SPAN | Annual | — |
| `air_pollution` | PM2.5 / PM10 / NOx / SO2 | DOE | Annual | — |
| `ghg_emissions` | GHG by sector | NRES | Annual | — |
| `forest_reserve_state` | Permanent reserved forest | JPSM | Annual | — |

### Population & society

| `id` | Title | Agency | Frequency | Wired |
|---|---|---|---|---|
| `population_state` | Population by state | DOSM | Annual | ✅ |
| `lfs_month` | Unemployment rate (LFS) | DOSM | Monthly | ✅ |
| `hh_income` | Median / mean income | DOSM | Biennial | — |
| `hies_district` | Income / gini / poverty by district | DOSM | Biennial | — |
| `births_annual_state` | Births by state | DOSM | Annual | — |
| `productivity_qtr` | Labour productivity | DOSM | Quarterly | — |
| `epf_dividend` | EPF annual dividend | EPF | Annual | — |

### Healthcare

| `id` | Title | Agency | Frequency | Wired |
|---|---|---|---|---|
| `hospital_beds` | Hospital beds | MOH | Annual | — |
| `healthcare_staff` | Doctors / nurses by state | MOH | Annual | — |
| `blood_donations` | Daily blood donations | PDN | Daily | — |
| `organ_pledges` | Cumulative organ pledges | MOH | Daily | — |
| `infant_immunisation` | Immunisation coverage | MOH | Annual | — |
| `covid_cases` | COVID-19 cases | MOH | Daily | — |
| `pharmaceutical_products` | Registered products | NPRA | Other | — |

### Public safety

| `id` | Title | Agency | Frequency | Wired |
|---|---|---|---|---|
| `crime_district` | Crime by district / category | PDRM | Annual | — |
| `prisoners_state` | Prison population | JPM | Annual | — |
| `drug_arrests_age` | Drug arrests by age | PDRM | Annual | — |
| `drug_addicts_age` | Drug addicts by age | AADK | Annual | — |
| `drug_addicts_education` | Drug addicts · education | AADK | Annual | — |
| `legal_advisory_services` | Legal aid cases | BBGK | Annual | — |

### Connectivity & tech

| `id` | Title | Agency | Frequency | Wired |
|---|---|---|---|---|
| `cellular_subscribers` | Mobile subscriptions | MCMC | Annual | — |

---

## Verified API response shapes (the wired ones)

These were captured by hitting the live API. Future maintainers: when wiring a new dataset, **always** verify the shape this way before writing the parser.

### `exchangerates_daily_1700`
```json
[
  { "date": "2026-05-11", "rate_type": "buying",  "usd": 3.921, "sgd": 3.0889, ... },
  { "date": "2026-05-11", "rate_type": "middle",  "usd": 3.9235, ... },
  { "date": "2026-05-11", "rate_type": "selling", "usd": 3.926, ... }
]
```
**Note:** each currency is a column; value is "MYR per 1 unit of currency_code".

### `fuelprice`
```json
[
  { "date": "2026-05-07", "series_type": "level",         "ron95": 4.02, "ron97": 4.9, "diesel": 5.17, ... },
  { "date": "2026-05-07", "series_type": "change_weekly", "ron95": 0.05, "ron97": 0.0, "diesel": 0.05, ... }
]
```
Filter `series_type === 'level'` for actual prices; `'change_weekly'` for the weekly deltas.

### `cpi_headline`
```json
[
  { "date": "2026-03-01", "division": "overall", "index": 136.4 },
  { "date": "2026-03-01", "division": "01",      "index": 159.6 },
  ...
]
```
The API returns the **CPI index**, not the inflation rate. To compute YoY: `(latest_overall.index - sameMonth12moAgo.index) / sameMonth12moAgo.index * 100`. Use `division === 'overall'` for headline.

### `gdp_qtr_nominal`
```json
[
  { "date": "2025-10-01", "series": "abs",        "value": 532869.755 },
  { "date": "2025-10-01", "series": "growth_yoy", "value": 6.3 },
  { "date": "2025-10-01", "series": "growth_qoq", "value": 3.0 }
]
```
Three rows per quarter — pivot by `series` to access each metric.

### `ridership_headline`
```json
[{
  "date": "2026-03-31",
  "rail_lrt_ampang": 229303, "rail_lrt_kj": 298449,
  "rail_mrt_kajang": 299830, "rail_mrt_pjy": 196943,
  "rail_monorail": 57715,    "rail_ets": 13030,
  "rail_intercity": 1572,    "rail_komuter": 29692,
  "rail_komuter_utara": 14373, "rail_tebrau": 8426,
  "bus_rkl": 244213, "bus_rkn": 0, "bus_rpn": 47831
}]
```
Flat row with one column per rail / bus system. Sum the `rail_*` columns for total rail; `bus_*` for total bus.

### `lfs_month`
```json
[{
  "date": "2026-02-01", "lf": 17297.6, "p_rate": 70.9, "u_rate": 2.9,
  "ep_ratio": 68.8, "lf_outside": 7102.9, "lf_employed": 16790.9, "lf_unemployed": 506.8
}]
```
`u_rate` is the unemployment percentage; counts (`lf_*`) are in thousands.

### `population_state`
```json
[
  { "date": "2023-01-01", "state": "Johor", "age": "overall_age", "sex": "overall_sex", "ethnicity": "overall_ethnicity", "population": 4100.9 },
  ...
]
```
Granular by (date, state, age, sex, ethnicity). Filter to `age === 'overall_age' && sex === 'overall_sex' && ethnicity === 'overall_ethnicity'` and group by state. `population` is in thousands.

---

## Adding a new dataset

1. **Verify the shape:** `curl -sL "https://api.data.gov.my/data-catalogue?id=<id>&limit=1&sort=-date"`. If you get a 404, the id doesn't exist — check the [catalogue UI](https://data.gov.my/data-catalogue).
2. **Add a query hook** in `src/lib/queries/<dataset>.ts` with typed `<DatasetRow>`, typed view shape (`<DatasetLatest>` / `<DatasetPoint>`), and a `select` parser.
3. **Register it in the catalogue** (`src/features/insights/catalogue.ts`) under the right category, with `wired: true`.
4. **Add a detail component** in `src/features/insights/details.tsx` with a chart, and register it in `DETAIL_BY_ID` in `app/dataset/[id].tsx`.
5. Update this file's table.

---

## Attribution

Every chart screen must surface, at minimum, the dataset's agency + the `asOf` date. The "View on data.gov.my" link goes to `https://data.gov.my/data-catalogue/<id>`.
