# Quiz Leaderboard Aggregator

A zero-dependency Java 17 application that polls a quiz API, deduplicates events, aggregates scores, and submits a sorted leaderboard — exactly once.

---

## Approach

```
Poll (×10, 5s gap) → Deduplicate → Aggregate scores → Sort → Submit once
```

1. **Poll** — Call `GET /quiz/messages?regNo=...&poll=0..9` ten times, with a 5-second pause between each call. Transient failures are retried up to 3 times with exponential backoff (2 s → 4 s → 8 s). A poll that fails completely is logged and skipped rather than aborting the whole run.

2. **Deduplicate** — Each event carries a `roundId` and a `participant`. The dedup key is `roundId + "_" + participant`. Before crediting any score, we check a `HashSet<String>`. If the key is already present the event is silently skipped; otherwise it is recorded.

3. **Aggregate** — Scores for accepted events are accumulated in a `HashMap<String, Integer>` keyed by participant name.

4. **Sort** — After all 10 polls, the map is converted to a `List<LeaderboardEntry>` and sorted descending by `totalScore`. Ties are broken alphabetically so the order is always stable.

5. **Submit** — `POST /quiz/submit` is called exactly once with the final leaderboard JSON.

---

## Why deduplication is needed

The same quiz event can appear in multiple polls (the API deliberately replays past events). Counting a duplicate inflates a participant's score and produces a wrong leaderboard total. The `HashSet` is the single source of truth: an event is counted at most once no matter how many polls it appears in.

---

## Data structures

| Structure | Purpose |
|-----------|---------|
| `HashSet<String> seenKeys` | O(1) lookup to detect duplicates across all polls |
| `HashMap<String, Integer> scoreMap` | Running total per participant |
| `List<LeaderboardEntry>` | Sorted final leaderboard (immutable after sort) |

---

## Project layout

```
quiz-leaderboard/
├── src/
│   ├── Main.java                   ← entry point, polling loop
│   ├── api/
│   │   ├── QuizApiClient.java      ← HTTP GET/POST with retry/backoff
│   │   └── JsonParser.java         ← lightweight JSON parser (no external deps)
│   ├── model/
│   │   ├── Event.java
│   │   ├── ApiResponse.java
│   │   └── LeaderboardEntry.java
│   └── service/
│       └── LeaderboardService.java ← dedup + aggregation logic
├── quiz-leaderboard.jar            ← pre-built runnable JAR
└── pom.xml                         ← Maven build (Java 17+)
```

---

## How to run

### Option A — Pre-built JAR (fastest)

```bash
java -jar quiz-leaderboard.jar REG12345
```

Replace `REG12345` with your actual `regNo`. If you omit the argument, the default inside `Main.java` is used.

### Option B — Compile and run from source

```bash
mkdir -p out
javac -d out src/model/*.java src/api/*.java src/service/*.java src/Main.java
java -cp out Main REG12345
```

### Option C — Maven

```bash
mvn package -DskipTests
java -jar target/quiz-leaderboard-1.0.jar REG12345
```

> **Requirements:** Java 17 or later. No other dependencies.

---

## Sample output

```
=== Quiz Leaderboard Aggregator ===
regNo : REG12345
polls : 10  (poll=0..9)
delay : 5s between calls
===================================

[POLL  0/ 9] Fetching …
  [RAW ] {"regNo":"REG12345","setId":"SET_A","pollIndex":0,"events":[...]}
  [DUP ] Skipping duplicate: round1_Alice
[POLL  0/ 9] Events received: 4  |  New (unique): 3
  [SCORES] {Alice=120, Bob=95, Carol=80}

  Waiting 5s …

[POLL  1/ 9] Fetching …
  [RAW ] {"regNo":"REG12345","setId":"SET_A","pollIndex":1,"events":[...]}
[POLL  1/ 9] Events received: 3  |  New (unique): 2
  [SCORES] {Alice=120, Bob=145, Carol=80}
...

=== FINAL LEADERBOARD ===
  #1   Bob                  145
  #2   Alice                120
  #3   Carol                80
  ─────────────────────────────
  TOTAL                       345

[SUBMIT] Posting leaderboard …
[SUBMIT] Payload  : {"regNo":"REG12345","leaderboard":[...]}
[SUBMIT] Computed total: 345
[SUBMIT] HTTP status : 200
[SUBMIT] Response    : {"isCorrect":true,"submittedTotal":345,"expectedTotal":345}
[SUBMIT] isCorrect      : true
[SUBMIT] submittedTotal : 345
[SUBMIT] expectedTotal  : 345

=== Done ===
```

---

## Sanity checklist

- [x] Exactly 10 polls (`poll=0..9`)
- [x] 5-second delay between polls
- [x] Dedup key = `roundId + "_" + participant`
- [x] Only unique events contribute to scores
- [x] Leaderboard sorted descending by `totalScore`
- [x] POST called exactly once at the end
- [x] Transient failures retried with backoff; a fully-failed poll is skipped, not fatal
- [x] Runs end-to-end with a single `java -jar` command
