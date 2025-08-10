# Backend Bugs to Fix

## 1. Team#member? Method SQL Error
**File:** `/app/models/team.rb` (line ~96)
**Current Code:**
```ruby
def member?(admin)
  team_memberships.active.exists?(admin: admin)
end
```

**Problem:** 
The query generates invalid SQL: `"admin"."admin" = $3` which causes:
```
ActiveRecord::StatementInvalid (PG::UndefinedTable: ERROR: missing FROM-clause entry for table "admin"
```

**Fix Required:**
```ruby
def member?(admin)
  team_memberships.active.exists?(admin_id: admin.id)
end
```

**Affected Endpoints:**
- POST `/api/v1/teams/:team_id/wiki_pages`
- POST `/api/v1/teams/:team_id/wiki_categories`
- Any endpoint that uses policies checking team membership

## 2. Similar Issues May Exist In:
- `Team#admin?` method
- `Team#owner?` method
- Any other Team methods that check membership

## Impact
- Wiki pages cannot be created
- Wiki categories cannot be created
- Any action requiring team membership verification fails with 500 error

## Temporary Frontend Workaround
The frontend has been updated to handle these errors gracefully and log them,
but the backend must be fixed for the Wiki functionality to work properly.