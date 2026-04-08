# Cricket Auction Management System - PRD

## Original Problem Statement
Build a web-based Cricket Auction Management System with:
1. Auction Configuration (teams, purse, slots)
2. Team Registration with names and logos
3. Player Entry with role and base price
4. Bidding with validation for purse and slots
5. Live Dashboard showing all teams stats
6. Excel Export with multiple sheets

## User Choices
- **Authentication**: No auth needed (single-user local system)
- **Excel Export**: ExcelJS/openpyxl (backend)
- **Design Theme**: Modern dark theme
- **Player Status**: Only "Sold" and "Unsold"
- **Default Values**: Custom configurable

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Backend**: FastAPI + MongoDB
- **Excel Export**: openpyxl (Python)

## Core Requirements (Static)
1. Configure auction parameters (teams, purse, slots)
2. Register teams with names and optional logos
3. Add players with name, role, base price
4. Sell players with purse/slot validation
5. Mark players as unsold
6. Reset players back to pending
7. Live dashboard with team stats
8. Export to Excel with multiple sheets

## What's Been Implemented (Jan 2026)
- [x] Auction Configuration page with validation
- [x] Team Registration with add/edit/delete
- [x] Player Auction page with role filtering
- [x] Sell dialog with purse/slot validation
- [x] Unsold/Reset player functionality
- [x] Live Dashboard with team cards
- [x] Excel Export (Summary, Master List, Team sheets)
- [x] Modern dark "Performance Pro" theme
- [x] Barlow Condensed + DM Sans fonts
- [x] Role-based color coding

## API Endpoints
- `GET/POST /api/config` - Auction configuration
- `DELETE /api/config/reset` - Reset entire auction
- `GET/POST /api/teams` - Team CRUD
- `GET/PUT/DELETE /api/teams/{id}` - Individual team
- `GET/POST /api/players` - Player CRUD with filters
- `POST /api/players/{id}/sell` - Sell player
- `POST /api/players/{id}/unsold` - Mark unsold
- `POST /api/players/{id}/reset` - Reset to pending
- `GET /api/stats` - Dashboard statistics
- `GET /api/export/excel` - Excel download

## Prioritized Backlog

### P0 (Critical) - Completed
- Auction configuration
- Team registration
- Player entry and bidding
- Purse/slot validation
- Dashboard view
- Excel export

### P1 (Important) - Future
- Bulk player import from CSV/Excel
- Player photo upload
- Auction history/logs
- Undo last transaction

### P2 (Nice to Have)
- Multiple auction sessions
- User authentication
- Team logo upload
- Mobile responsive improvements
- Print-friendly views

## Next Tasks
1. Implement bulk player import feature
2. Add auction activity log
3. Enhanced team card with player photos
