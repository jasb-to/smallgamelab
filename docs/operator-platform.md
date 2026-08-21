# Small Game Lab Operator Platform v0

## Scope

Sandbox-only B2B integration experience. No live-money wallet, settlement, or regulated gambling functionality.

## Operator flow

1. Authenticate player session
2. Request player balance
3. Launch a game
4. Record a round
5. Return result
6. Surface analytics

## Current product surfaces

- `/operators` — operator proposition
- `/operators/simulator` — interactive integration simulator
- `/dashboard` — operator console prototype
- `/games/last-stand` — Game 001

## Next engineering layer

- typed API contracts
- mock operator credentials
- deterministic round/session IDs
- event log
- game catalogue records
- operator configuration
- analytics ingestion

The platform remains a simulator until commercial, legal, regulatory and technical requirements for any real-money deployment are separately established.
