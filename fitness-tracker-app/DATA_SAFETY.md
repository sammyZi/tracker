# Google Play Data Safety Questionnaire — Stride

This document provides answers for the Google Play Console **Data Safety** form.
Use these answers when filling out the form at:
**Play Console → App content → Data safety**

---

## Overview

| Question | Answer |
|----------|--------|
| Does your app collect or share any user data? | **Yes** |
| Is all user data encrypted in transit? | **Yes** (HTTPS/TLS) |
| Do you provide a way for users to request data deletion? | **Yes** (Account deletion in Settings) |

---

## Data Types Collected

### 1. Location

| Field | Value |
|-------|-------|
| **Approximate location** | Collected |
| **Precise location** | Collected |
| Is this data collected, shared, or both? | **Collected** |
| Is this data processed ephemerally? | No — stored for activity history |
| Is this data required or optional? | **Required** for core activity tracking |
| Purpose | App functionality (route tracking, distance calculation) |

### 2. Personal Info

| Field | Value |
|-------|-------|
| **Name** | Collected (if Google Sign-In) |
| **Email address** | Collected |
| Is this data collected, shared, or both? | **Collected** |
| Is this data processed ephemerally? | No |
| Is this data required or optional? | **Optional** (app works without account) |
| Purpose | Account management, app functionality |

### 3. Health & Fitness

| Field | Value |
|-------|-------|
| **Health info** | Not collected |
| **Fitness info** | Collected (steps, distance, pace, calories) |
| Is this data collected, shared, or both? | **Collected** |
| Is this data processed ephemerally? | No |
| Is this data required or optional? | **Required** — core app functionality |
| Purpose | App functionality |

### 4. App Activity

| Field | Value |
|-------|-------|
| **App interactions** | Collected (settings preferences) |
| Is this data collected, shared, or both? | **Collected** |
| Is this data processed ephemerally? | No |
| Is this data required or optional? | Required |
| Purpose | App functionality |

### 5. Device or other IDs

| Field | Value |
|-------|-------|
| **Device or other IDs** | Not collected |

---

## Data NOT Collected

The following data types are **NOT** collected by Stride:
- Financial info (purchases, credit cards)
- Messages (emails, SMS, chat)
- Photos and videos
- Audio files
- Files and docs
- Calendar
- Contacts
- Web browsing history
- Search history
- Installed apps

---

## Data Sharing

| Question | Answer |
|----------|--------|
| Is any data shared with third parties? | **No** — data is stored in our cloud database (Supabase) and is not shared with or sold to any third party. |
| Is any data used for advertising? | **No** |
| Is any data used for analytics? | **No** — we do not use any third-party analytics SDKs |

---

## Data Handling Practices

| Practice | Status |
|----------|--------|
| Data encrypted in transit | ✅ Yes (TLS/HTTPS) |
| Data encrypted at rest | ✅ Yes (Supabase managed encryption) |
| Users can request data deletion | ✅ Yes (Account deletion in app) |
| Data deletion within 30 days | ✅ Yes |

---

## Families Policy

| Question | Answer |
|----------|--------|
| Is this app directed at children under 13? | **No** |
| Does this app comply with the Families Policy? | N/A — not a children's app |

---

## Notes for Play Console Submission

1. When asked "Does your app collect any of the listed data types?" → select:
   - Location (Approximate + Precise)
   - Personal info (Name, Email)
   - Health and fitness (Fitness info)
   - App activity (App interactions)

2. For each collected type, select:
   - Collected: **Yes**
   - Shared: **No**
   - Purpose: **App functionality**

3. Data retention:
   - Users can delete data via **Settings → Account → Delete Account**
   - Cloud data deleted within **30 days** of account deletion
