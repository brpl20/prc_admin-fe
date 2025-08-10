# Backend Fix for Team Model
# File: /app/models/team.rb
# 
# Apply this fix to resolve Wiki 500 errors

# CURRENT BUGGY CODE (line 94):
# def member?(admin)
#   team_memberships.active.exists?(admin: admin)
# end

# FIXED CODE:
def member?(admin)
  team_memberships.active.exists?(admin_id: admin.id)
end

# Also check these methods for similar issues:
# The admin_role method on line 78 looks correct but verify:
def admin_role(admin)
  team_memberships.find_by(admin_id: admin.id)&.role  # Changed from admin: admin
end

# Complete fixed version of the relevant methods:
class Team < ApplicationRecord
  # ... other code ...

  def admin_role(admin)
    team_memberships.find_by(admin_id: admin.id)&.role
  end
  
  def owner?(admin)
    owner_admin_id == admin.id  # More explicit comparison
  end
  
  def main_admin?(admin)
    main_admin_id == admin.id  # More explicit comparison
  end
  
  def admin?(admin)
    owner?(admin) || main_admin?(admin) || admin_role(admin) == 'admin'
  end
  
  def member?(admin)
    team_memberships.active.exists?(admin_id: admin.id)
  end
  
  # ... rest of the code ...
end