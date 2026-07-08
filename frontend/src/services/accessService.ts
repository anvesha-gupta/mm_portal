export interface RolePermissionResponse {
  role_id: string;
  app_id: string;
}

export interface UserAppOverrideResponse {
  id: string;
  user_id: string;
  app_id: string;
  override_type: "grant" | "revoke";
  created_at: string;
}

export interface UserResponse {
  id: string;
  email: string;
  display_name: string;
  role_id: string;
  department?: string;
  title?: string;
  is_active: boolean;
}

export interface AppDefinition {
  id: string;
  name: string;
}

// Complete list of applications in the system
export const ALL_APPS: AppDefinition[] = [
  { id: "wyngs", name: "Wyngs" },
  { id: "estimatrix", name: "Estimatrix" },
  { id: "myra", name: "MyRA" },
  { id: "mindscript", name: "Mindscript" },
  { id: "resolve-iq", name: "Resolve IQ" },
  { id: "expense-management", name: "Expense Management" },
  { id: "knowledge-management", name: "Knowledge Management" },
  { id: "idea-tracking", name: "Idea Tracking" },
  { id: "keka", name: "Keka" },
  { id: "salesforce", name: "Salesforce" },
  { id: "zohobooks", name: "Zoho Books" },
  { id: "admin", name: "Admin Panel" },
  { id: "gitlab", name: "GitLab" },
  { id: "playbench", name: "Playbench" },
  { id: "license-manager", name: "License Manager" },
  { id: "leaderboard", name: "Track Points" },
];

export const ALL_ROLES = [
  { id: "employee", label: "Employee" },
  { id: "finance", label: "Finance" },
  { id: "hr", label: "HR" },
  { id: "admin", label: "IT Admin" },
];

// Initial seed data mapping to default behavior
const DEFAULT_ROLE_PERMISSIONS: RolePermissionResponse[] = [
  // Employee permissions
  { role_id: "employee", app_id: "wyngs" },
  { role_id: "employee", app_id: "keka" },
  { role_id: "employee", app_id: "playbench" },
  { role_id: "employee", app_id: "mindscript" },
  { role_id: "employee", app_id: "resolve-iq" },
  { role_id: "employee", app_id: "myra" },
  { role_id: "employee", app_id: "salesforce" },

  // Finance permissions
  { role_id: "finance", app_id: "wyngs" },
  { role_id: "finance", app_id: "keka" },
  { role_id: "finance", app_id: "playbench" },
  { role_id: "finance", app_id: "zohobooks" },
  { role_id: "finance", app_id: "license-manager" },
  { role_id: "finance", app_id: "estimatrix" },
  { role_id: "finance", app_id: "expense-management" },
  { role_id: "finance", app_id: "salesforce" },

  // HR permissions
  { role_id: "hr", app_id: "wyngs" },
  { role_id: "hr", app_id: "keka" },
  { role_id: "hr", app_id: "playbench" },
  { role_id: "hr", app_id: "knowledge-management" },
  { role_id: "hr", app_id: "idea-tracking" },
  { role_id: "hr", app_id: "leaderboard" },
  { role_id: "hr", app_id: "salesforce" },

  // Admin permissions (all of them)
  ...ALL_APPS.map((app) => ({ role_id: "admin", app_id: app.id })),
];

// Initial mock users seeding from mockData.ts
const INITIAL_USERS: UserResponse[] = [
  {
    id: "EMP001",
    display_name: "John Smith",
    email: "john.smith@motiveminds.com",
    role_id: "employee",
    department: "Engineering",
    title: "Software Engineer",
    is_active: true,
  },
  {
    id: "EMP002",
    display_name: "Sarah Wilson",
    email: "sarah.wilson@motiveminds.com",
    role_id: "hr",
    department: "Human Resources",
    title: "HR Director",
    is_active: true,
  },
  {
    id: "EMP003",
    display_name: "Rahul Patel",
    email: "rahul.patel@motiveminds.com",
    role_id: "finance",
    department: "Finance",
    title: "Finance Controller",
    is_active: true,
  },
  {
    id: "EMP004",
    display_name: "David Lee",
    email: "david.lee@motiveminds.com",
    role_id: "employee",
    department: "Engineering",
    title: "Junior Developer",
    is_active: true,
  },
];

// Initial overrides seed by comparing user's mockData app list with role defaults
// e.g. David Lee doesn't have mindscript, resolve-iq, myra, so they are revoked.
const INITIAL_USER_OVERRIDES: UserAppOverrideResponse[] = [
  {
    id: "override-1",
    user_id: "EMP004",
    app_id: "mindscript",
    override_type: "revoke",
    created_at: new Date().toISOString(),
  },
  {
    id: "override-2",
    user_id: "EMP004",
    app_id: "resolve-iq",
    override_type: "revoke",
    created_at: new Date().toISOString(),
  },
  {
    id: "override-3",
    user_id: "EMP004",
    app_id: "myra",
    override_type: "revoke",
    created_at: new Date().toISOString(),
  },
];

const ROLE_PERM_KEY = "mm_role_permissions";
const USER_OVERRIDE_KEY = "mm_user_overrides";
const USER_KEY = "mm_mock_users";

// Initialize localStorage if empty
function initializeStorage() {
  if (!localStorage.getItem(ROLE_PERM_KEY)) {
    localStorage.setItem(ROLE_PERM_KEY, JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
  }
  if (!localStorage.getItem(USER_OVERRIDE_KEY)) {
    localStorage.setItem(USER_OVERRIDE_KEY, JSON.stringify(INITIAL_USER_OVERRIDES));
  }
  if (!localStorage.getItem(USER_KEY)) {
    localStorage.setItem(USER_KEY, JSON.stringify(INITIAL_USERS));
  }
}

initializeStorage();

export const accessService = {
  /**
   * GET /admin/role-permissions
   * Retrieves all role-application mappings.
   */
  async getRolePermissions(): Promise<RolePermissionResponse[]> {
    initializeStorage();
    const data = localStorage.getItem(ROLE_PERM_KEY);
    return data ? JSON.parse(data) : [];
  },

  /**
   * PUT /admin/role-permissions
   * Updates all role-application mappings.
   */
  async saveRolePermissions(permissions: RolePermissionResponse[]): Promise<void> {
    localStorage.setItem(ROLE_PERM_KEY, JSON.stringify(permissions));
  },

  /**
   * GET /admin/users/{id} (mapped here to search by Employee ID)
   * Fetch a specific employee by ID.
   */
  async getUserByEmployeeId(employeeId: string): Promise<UserResponse | null> {
    initializeStorage();
    const data = localStorage.getItem(USER_KEY);
    const users: UserResponse[] = data ? JSON.parse(data) : [];
    const found = users.find((u) => u.id.toLowerCase() === employeeId.trim().toLowerCase());
    return found || null;
  },

  /**
   * GET /admin/user-overrides/{userId}
   * Retrieves overrides for a specific user.
   */
  async getUserOverrides(userId: string): Promise<UserAppOverrideResponse[]> {
    initializeStorage();
    const data = localStorage.getItem(USER_OVERRIDE_KEY);
    const overrides: UserAppOverrideResponse[] = data ? JSON.parse(data) : [];
    return overrides.filter((o) => o.user_id === userId);
  },

  /**
   * PUT /admin/user-overrides
   * Saves the custom overrides for a user.
   */
  async saveUserOverrides(
    userId: string,
    overrides: { app_id: string; override_type: "grant" | "revoke" }[]
  ): Promise<void> {
    initializeStorage();
    const rawData = localStorage.getItem(USER_OVERRIDE_KEY);
    const allOverrides: UserAppOverrideResponse[] = rawData ? JSON.parse(rawData) : [];

    // Filter out existing overrides for this user
    const restOverrides = allOverrides.filter((o) => o.user_id !== userId);

    // Map new overrides
    const newOverrides: UserAppOverrideResponse[] = overrides.map((o, idx) => ({
      id: `override-${userId}-${o.app_id}-${Date.now()}-${idx}`,
      user_id: userId,
      app_id: o.app_id,
      override_type: o.override_type,
      created_at: new Date().toISOString(),
    }));

    const updatedOverrides = [...restOverrides, ...newOverrides];
    localStorage.setItem(USER_OVERRIDE_KEY, JSON.stringify(updatedOverrides));
  },
};
