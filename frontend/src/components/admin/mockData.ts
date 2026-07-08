export interface RolePermissions {
  [role: string]: string[];
}

export interface Employee {
  id: string;
  name: string;
  role: "Employee" | "Finance" | "HR" | "IT Admin";
  apps: string[];
}

export const apps = [
  "Wyngs",
  "Keka",
  "Playbench",
  "Mindscript",
  "Resolve IQ",
  "MyRA",
  "Zoho Books",
  "License Manager",
];

export const roles = [
  "Employee",
  "Finance",
  "HR",
  "IT Admin",
];

export const defaultRolePermissions: RolePermissions = {
  Employee: [
    "Wyngs",
    "Keka",
    "Playbench",
    "Mindscript",
    "Resolve IQ",
    "MyRA",
  ],

  Finance: [
    "Wyngs",
    "Keka",
    "Playbench",
    "Zoho Books",
    "License Manager",
  ],

  HR: [
    "Wyngs",
    "Keka",
    "Playbench",
  ],

  "IT Admin": [...apps],
};

export const employees: Employee[] = [
  {
    id: "EMP001",
    name: "John Smith",
    role: "Employee",
    apps: [
      "Wyngs",
      "Keka",
      "Playbench",
      "Mindscript",
      "Resolve IQ",
      "MyRA",
    ],
  },

  {
    id: "EMP002",
    name: "Sarah Wilson",
    role: "HR",
    apps: [
      "Wyngs",
      "Keka",
      "Playbench",
    ],
  },

  {
    id: "EMP003",
    name: "Rahul Patel",
    role: "Finance",
    apps: [
      "Wyngs",
      "Keka",
      "Playbench",
      "Zoho Books",
      "License Manager",
    ],
  },

  {
    id: "EMP004",
    name: "David Lee",
    role: "Employee",
    apps: [
      "Wyngs",
      "Keka",
      "Playbench",
    ],
  },
];