# GovExplorer Data Audit — Malaysia Open-Data API Surface

**Audit date:** 2026-05-09
**Scope:** Everything reachable via `api.data.gov.my`, plus adjacent first-party Malaysian government APIs.

This document is the evidence base for `docs/design.md`'s v1 dataset list. Update it whenever the API surface changes meaningfully.

---

## API surface

`api.data.gov.my` exposes five distinct endpoint families. Auth is **public, no API key, no signup** for all of them.

| Family | Base URL | Format | Cadence | Auth |
|---|---|---|---|---|
| **Data Catalogue** | `https://api.data.gov.my/data-catalogue?id={id}` | JSON | Per-dataset (DAILY → ANNUAL) | None |
| **OpenDOSM Catalogue** | `https://api.data.gov.my/opendosm?id={id}` | JSON | Same shape, DOSM-only | None |
| **Weather (METMalaysia)** | `https://api.data.gov.my/weather/...` | JSON | Daily forecast / event-driven warnings | None |
| **GTFS-Static** | `https://api.data.gov.my/gtfs-static/{agency}` | ZIP (GTFS text files) | Daily (KTMB) / "as required" (Prasarana, BAS.MY) | None |
| **GTFS-Realtime** | `https://api.data.gov.my/gtfs-realtime/vehicle-position/{agency}` | Protobuf | 30-second polling | None |

`data-catalogue` and `opendosm` use the same request grammar and response envelope — effectively two namespaces of the same API.

### Notable absences

| Service | Why missing | What's available |
|---|---|---|
| FX | First-party at data.gov.my does cover daily fixings (`exchangerates_daily_1200`) | Use that. BNM's separate API has Kijang Emas, OPR, etc., but adds a second base URL — not worth it for v1. |
| Prayer times | JAKIM has no public REST API | Community wrapper `api.waktusolat.app` exists. **Skipped per user direction.** |
| Air quality | DOE publishes APIMS via `apims.doe.gov.my` (HTML, no REST) | `aqicn.org` is third-party with token. **Skipped — first-party only.** |
| Water levels / dams | JPS publishes via `publicinfobanjir.water.gov.my` (HTML) | None. **Skipped.** |
| Geocoding | None | None. State picker is manual + `expo-location` if user allows. |
| Tides / marine forecast | METMalaysia API explicitly says "currently unavailable" | None. |
| Sunrise/sunset | Not in METMalaysia API | Compute client-side from coordinates if needed. |

### GTFS-Realtime agency catalogue

| Agency / category | Endpoint suffix |
|---|---|
| KTMB (intercity rail + Komuter) | `/vehicle-position/ktmb` |
| Rapid KL (LRT/MRT/monorail/bus) | `/vehicle-position/prasarana?category=rapid-bus-kl` |
| MRT feeder buses | `/vehicle-position/prasarana?category=rapid-bus-mrtfeeder` |
| Rapid Kuantan | `/vehicle-position/prasarana?category=rapid-bus-kuantan` |
| Rapid Penang | `/vehicle-position/prasarana?category=rapid-bus-penang` |
| BAS.MY (state stage buses) | `/vehicle-position/mybas-{kangar|alor-setar|kota-bharu|...}` (9 cities) |

Trip updates and service alerts are **not yet published** — docs say "in our pipeline for 2026". Penang has known trip-ID mismatches between RT and static feeds.

### Request-query grammar (gotchas)

The portal references "standard filtering operations" but the dedicated `request-query` doc page returned 404. Confirmed working from the `fuelprice` shape:

- `id` — required, the dataset slug
- `limit` — caps row count
- `sort` — column name, prefix `-` for descending

Referenced but **not formally documented** — verify by hitting the API before relying:

- `date_start`, `date_end` (mentioned in passing in docs intro)
- Per-column filters (e.g., `state=Selangor`, mentioned as "filterable columns in the Metadata section")

**Action item:** before building a generic catalogue browser (deferred from v1), confirm exact filter param names by hitting `api.data.gov.my/data-catalogue?id=<some-id>&limit=1` and inspecting envelopes.

---

## Catalogue size

**397 datasets** in `data-catalogue` (counted from `storage.data.gov.my/metrics/dataset_list.csv`, 2026-05-09).

### Categories actually populated

| Category | Approx. count | Cadence skew |
|---|---|---|
| Demography | ~25 | Mostly YEARLY |
| Households | ~20 | YEARLY |
| National Accounts | ~15 | QUARTERLY |
| Education | ~15 | YEARLY |
| Healthcare | ~30 | YEARLY / DAILY (covid, blood) |
| Transportation | ~20 | DAILY (the headline ones) |
| Public Safety | ~15 | YEARLY (crime), MONTHLY (legal advisory) |
| Environment | ~25 | MONTHLY / YEARLY |
| Communications | ~5 | YEARLY |
| Labour Markets | ~20 | MONTHLY / QUARTERLY |
| Financial Markets | ~30 | DAILY (FX) / MONTHLY |
| Prices | ~20 | DAILY (PriceCatcher), WEEKLY (fuel), MONTHLY (CPI/PPI) |
| Public Administration | ~15 | YEARLY |
| Economic Sectors | ~30 | MONTHLY / QUARTERLY |
| Statistical Indicators (SDG) | ~50+ | ANNUAL |

**Cadence distribution (rough):** ANNUAL ~55%, MONTHLY ~20%, QUARTERLY ~10%, DAILY ~10%, WEEKLY ~3%, ad-hoc ~2%. The catalogue is **dominated by annual statistics**; the daily/weekly stuff is the small minority that powers a "feels alive" app.

---

## v1 dataset shortlist

Selected for: small payload, mobile-friendly shape, "alive" cadence, broad public interest. See `docs/design.md` for how each fits into the UI.

### Daily (Home indicator strip)

| `id` | Title | Publisher | Notes |
|---|---|---|---|
| `weather/forecast` | Weather forecast | METMalaysia | Location IDs `St001` (state), `Ds001` (district), `Tn001` (town), `Rc001` (recreation), `Dv001` (division) |
| `weather/warning` | Active weather warnings | METMalaysia | Bilingual EN/BM titles. Render only when non-empty. |
| `exchangerates_daily_1200` | Daily exchange rates (12:00 fix) | BNM via data.gov.my | Snapshot per business day |
| `ridership_headline` | Daily public transport ridership | Prasarana | Multi-line time series |

### Weekly

| `id` | Title | Publisher |
|---|---|---|
| `fuelprice` | Petroleum & diesel prices | MOF — *already wired in Plan 01* |

### Daily, presented as monthly trend

| `id` | Title | Why interesting |
|---|---|---|
| `pricecatcher` | KPDN PriceCatcher transactional records | Daily price of eggs, chicken, rice, cooking oil. Strong data-journalism angle. |
| `registration_transactions_car` | Car registrations by make/model | "Most popular car bought in Malaysia" — user explicitly asked for this. Available as Parquet at `storage.data.gov.my/transportation/cars_2026.parquet`. |
| `registration_transactions_motorcycle` | Motorcycle registrations | Same angle for bikes. |
| `blood_donations` | Daily blood donations by ABO/Rh | "Is your blood type in demand right now?" |
| `payment_instruments` | Payment instrument usage | Cards vs e-wallets vs cheques over time. |

### Monthly

| `id` | Title | Publisher |
|---|---|---|
| `cpi_headline` | CPI by 2-digit COICOP division | DOSM |
| `lfs_month` | Monthly principal labour force | DOSM |
| `arrivals` | Monthly arrivals by nationality & sex | Imigresen |
| `air_pollution` | Monthly air pollution rollup | JAS via DOSM |

### Annual / static

| `id` | Title |
|---|---|
| `population_district` | Population by administrative district |
| `crime_district` | Crimes by district & crime type |
| `hh_income_district` | Household income by district |
| `birthday_popularity` | Birthday popularity (id pending live verification) |

### Live transit (GTFS)

| Endpoint | Purpose |
|---|---|
| `gtfs-static/ktmb` | Static routes/stops/trips ZIP for KTMB |
| `gtfs-static/prasarana` | Static for Prasarana (LRT/MRT/monorail/bus) |
| `gtfs-realtime/vehicle-position/ktmb` | Live train positions (protobuf, 30s) |
| `gtfs-realtime/vehicle-position/prasarana?category=rapid-bus-kl` | Live Rapid KL bus positions |
| `gtfs-realtime/vehicle-position/prasarana?category=rapid-bus-mrtfeeder` | MRT feeder bus positions |

---

## Data-quality gotchas

- **Cadence labels are aspirational.** The CSV records *intended* cadence — spot-check actual `last_updated` per dataset before featuring on Home.
- **Response envelope inconsistency unverified.** `fuelprice` returns a JSON array directly (no `{data:[...]}` wrap). Other datasets may wrap differently. Build defensively.
- **Date param names not formally documented.** `date_start`/`date_end` mentioned in passing — verify before generic UI.
- **No documented rate limits.** `developer.data.gov.my/guide/rate-limit` returned 404. Cache aggressively, batch where possible.
- **No documented CORS policy.** RN native networking sidesteps this. If web target is added later, retest.
- **GTFS-RT Penang/Kuantan trip-ID mismatches** are called out in the docs. Don't assume perfect joins.
- **Sabah/Sarawak coverage gaps** are common in DOSM historical demographic series. Spot-check.
- **`covid_cases` is still labelled DAILY** but is post-pandemic. Verify latest row before relying on it.
- **Stale annual datasets:** several "ANNUAL" datasets in the CSV were created in 2023 — verify they've actually refreshed in 2025 before featuring. Likely candidates: `hospital_beds`, `infant_immunisation`, `std_state`.

---

## Sources

- [Malaysia Open API portal — endpoint families](https://developer.data.gov.my/)
- [Data Catalogue API docs](https://developer.data.gov.my/static-api/data-catalogue)
- [OpenDOSM API docs](https://developer.data.gov.my/static-api/opendosm)
- [Weather API docs](https://developer.data.gov.my/realtime-api/weather)
- [GTFS-Static API docs](https://developer.data.gov.my/realtime-api/gtfs-static)
- [GTFS-Realtime API docs](https://developer.data.gov.my/realtime-api/gtfs-realtime)
- [data.gov.my catalogue browse](https://data.gov.my/data-catalogue)
- [Full dataset list CSV](https://storage.data.gov.my/metrics/dataset_list.csv) — 397 rows
- [BNM Open API portal](https://apikijangportal.bnm.gov.my/openapi) — *not used in v1*
- [APIMS — DOE air quality](https://apims.doe.gov.my/aboutapi.html) — *no API; deferred*
- [Public Infobanjir — JPS water levels](https://publicinfobanjir.water.gov.my/main/?lang=en) — *no API; deferred*
