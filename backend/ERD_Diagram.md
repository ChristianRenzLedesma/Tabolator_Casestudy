# Tabulator System - Entity Relationship Diagram (ERD)

## Database Overview
The Tabulator System manages competition scoring with multiple entities: categories, criteria, judges, contestants, scores, and events.

## Entity Relationships

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  categories │         │  criteria   │         │   judges    │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ id (PK)     │         │ id (PK)     │         │ id (PK)     │
│ name         │         │ category_id  │◄────────┤ name         │
│ description  │         │ name         │         │ email        │
│ created_at   │         │ description  │         │ phone        │
│ updated_at   │         │ percentage   │         │ pin          │
└─────────────┘         │ min_score    │         │ is_active    │
        │               │ max_score    │         │ created_at   │
        │               │ created_at   │         │ updated_at   │
        │               │ updated_at   │         └─────────────┘
        │               └─────────────┘                  │
        │                        │                        │
        │                        │                        │
        │                        ▼                        ▼
        │               ┌─────────────┐         ┌─────────────┐
        │               │   scores    │         │ contestants │
        │               ├─────────────┤         ├─────────────┤
        │               │ id (PK)     │◄───────│ id (PK)     │
        │               │ contestant_id│         │ name         │
        │               │ judge_id     │         │ contestant_# │
        │               │ criterion_id │         │ age          │
        │               │ score        │         │ gender       │
        │               │ comments     │         │ address      │
        │               │ created_at   │         │ phone        │
        │               │ updated_at   │         │ email        │
        │               └─────────────┘         │ status       │
        │                        │               │ final_score  │
        │                        │               │ rank         │
        │                        │               │ created_at   │
        │                        │               │ updated_at   │
        │                        │               └─────────────┘
        │                        │                        │
        │                        ▼                        │
        │               ┌─────────────┐                 │
        │               │   events    │                 │
        │               ├─────────────┤                 │
        │               │ id (PK)     │                 │
        │               │ name         │                 │
        │               │ description  │                 │
        │               │ event_date   │                 │
        │               │ venue        │                 │
        │               │ status       │                 │
        │               │ created_at   │                 │
        │               │ updated_at   │                 │
        │               └─────────────┘                 │
        │                        │                        │
        │                        ▼                        │
        │               ┌─────────────────┐              │
        │               │event_contestants│              │
        │               ├─────────────────┤              │
        │               │ id (PK)        │              │
        │               │ event_id        │              │
        │               │ contestant_id   │              │
        │               │ registration_   │              │
        │               │ date           │              │
        │               └─────────────────┘              │
        └─────────────────────────────────────────────────┘
```

## Table Details

### 1. categories
**Purpose**: Stores competition categories
**Fields**:
- `id` (PK): Auto-increment identifier
- `name`: Category name (unique)
- `description`: Optional description
- `created_at`, `updated_at`: Timestamps

**Sample Data**:
- Talent, Beauty, Intelligence, Poise

### 2. criteria
**Purpose**: Scoring criteria for each category
**Fields**:
- `id` (PK): Auto-increment identifier
- `category_id` (FK): References categories.id
- `name`: Criterion name
- `description`: Optional description
- `percentage`: Weight percentage (should sum to 100% per category)
- `min_score`, `max_score`: Score range
- `created_at`, `updated_at`: Timestamps

**Sample Data**:
- Performance Quality (40%), Originality (30%), Stage Presence (30%)

### 3. judges
**Purpose**: Judge information and authentication
**Fields**:
- `id` (PK): Auto-increment identifier
- `name`: Judge name
- `email`, `phone`: Contact information
- `pin`: Unique 4-digit authentication code
- `is_active`: Active status
- `created_at`, `updated_at`: Timestamps

**Sample Data**:
- Dr. Maria Santos (PIN: 2847), Prof. John Reyes (PIN: 9156)

### 4. contestants
**Purpose**: Contestant information and status tracking
**Fields**:
- `id` (PK): Auto-increment identifier
- `name`: Contestant name
- `contestant_number`: Competition number
- `age`, `gender`: Demographics
- `address`, `phone`, `email`: Contact info
- `status`: Active, Eliminated, Disqualified, Winner
- `final_score`, `rank`: Competition results
- `created_at`, `updated_at`: Timestamps

**Sample Data**:
- Sarah Martinez (Active), Emily Rodriguez (Eliminated), Rachel Kim (Disqualified)

### 5. scores
**Purpose**: Judge scores for contestants
**Fields**:
- `id` (PK): Auto-increment identifier
- `contestant_id` (FK): References contestants.id
- `judge_id` (FK): References judges.id
- `criterion_id` (FK): References criteria.id
- `score`: Actual score given
- `comments`: Optional comments
- `created_at`, `updated_at`: Timestamps

**Business Rules**:
- Each judge can score each contestant only once per criterion
- Score must be within min_score and max_score range
- Unique constraint on (contestant_id, judge_id, criterion_id)

### 6. events
**Purpose**: Competition events/rounds
**Fields**:
- `id` (PK): Auto-increment identifier
- `name`: Event name
- `description`: Event details
- `event_date`: Scheduled date
- `venue`: Event location
- `status`: Upcoming, Ongoing, Completed, Cancelled
- `created_at`, `updated_at`: Timestamps

### 7. event_contestants (Junction Table)
**Purpose**: Links contestants to events (many-to-many)
**Fields**:
- `id` (PK): Auto-increment identifier
- `event_id` (FK): References events.id
- `contestant_id` (FK): References contestants.id
- `registration_date`: When contestant registered

## Relationships Summary

### One-to-Many:
1. **categories → criteria**: One category has many criteria
2. **contestants → scores**: One contestant has many scores
3. **judges → scores**: One judge gives many scores
4. **criteria → scores**: One criterion has many scores
5. **events → event_contestants**: One event has many registrations

### Many-to-Many:
1. **contestants ↔ events**: Through event_contestants junction table

## Key Constraints & Business Rules

### Foreign Key Constraints:
- `criteria.category_id` → `categories.id` (CASCADE DELETE)
- `scores.contestant_id` → `contestants.id` (CASCADE DELETE)
- `scores.judge_id` → `judges.id` (CASCADE DELETE)
- `scores.criterion_id` → `criteria.id` (CASCADE DELETE)
- `event_contestants.event_id` → `events.id` (CASCADE DELETE)
- `event_contestants.contestant_id` → `contestants.id` (CASCADE DELETE)

### Unique Constraints:
- `categories.name`: No duplicate category names
- `judges.pin`: No duplicate PIN codes
- `scores`: One score per (contestant, judge, criterion) combination
- `event_contestants`: One registration per (event, contestant)

### Business Logic:
1. **Criteria Percentages**: Must sum to 100% per category
2. **Score Ranges**: Scores must respect min/max values
3. **Judge PINs**: 4-digit unique codes for authentication
4. **Contestant Status Flow**: Active → Eliminated/Disqualified/Winner
5. **Event Status**: Upcoming → Ongoing → Completed/Cancelled

## Performance Optimizations

### Indexes:
- Primary keys on all tables
- Foreign key indexes for JOIN operations
- Additional indexes on frequently queried fields
- Composite indexes for complex queries

### Views:
- `contestant_scores_summary`: Aggregated scoring data
- `criteria_by_category`: Criteria grouped by category

### Triggers:
- `update_contestant_final_score`: Auto-calculate final scores

## Data Flow Example

1. **Event Creation**: Create event → Register contestants
2. **Setup**: Create categories → Define criteria → Assign judges
3. **Scoring**: Judges score contestants per criterion
4. **Calculation**: System calculates weighted final scores
5. **Results**: Update contestant ranks and status

This ERD provides a robust foundation for competition management with proper normalization, constraints, and scalability.
