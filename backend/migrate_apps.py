import sys
from sqlalchemy import text
from database import engine

def migrate():
    print("Starting migration...")
    with engine.begin() as conn:
        # 1. Add columns to mm_portal.apps if not exists
        print("Checking/adding columns...")
        columns_to_add = [
            ("application_type", "VARCHAR(50)"),
            ("launch_type", "VARCHAR(50)"),
            ("internal_route", "VARCHAR(255)"),
            ("external_url", "VARCHAR(500)"),
            ("sso_enabled", "BOOLEAN DEFAULT FALSE NOT NULL")
        ]
        
        for col_name, col_type in columns_to_add:
            # Check if column exists
            result = conn.execute(text(f"""
                SELECT COUNT(*) 
                FROM information_schema.columns 
                WHERE table_schema = 'mm_portal' 
                  AND table_name = 'apps' 
                  AND column_name = '{col_name}'
            """))
            exists = result.scalar() > 0
            if not exists:
                print(f"Adding column {col_name}...")
                conn.execute(text(f"ALTER TABLE mm_portal.apps ADD COLUMN {col_name} {col_type}"))
            else:
                print(f"Column {col_name} already exists.")

        # 2. Add or update applications
        print("Upserting application master configurations...")
        apps_data = [
            {
                "id": "wyngs",
                "name": "Wyngs",
                "description": "Internal travel & logistics platform",
                "category_tag": "Internal",
                "icon_name": "🛫",
                "gradient_class": "rgba(124,58,237,0.18)",
                "icon_bg_class": "rgba(124,58,237,0.18)",
                "application_type": "Internal",
                "launch_type": "sso",
                "internal_route": None,
                "external_url": "https://motiveminds.wyngs.pro/app/home",
                "sso_enabled": True,
                "sort_order": 10
            },
            {
                "id": "estimatrix",
                "name": "Estimatrix",
                "description": "Internal estimation and quote generation tool",
                "category_tag": "Internal",
                "icon_name": "📊",
                "gradient_class": "rgba(16,185,129,0.18)",
                "icon_bg_class": "rgba(16,185,129,0.18)",
                "application_type": "Internal",
                "launch_type": "sso",
                "internal_route": None,
                "external_url": "https://estdev.wyngs.pro/",
                "sso_enabled": True,
                "sort_order": 20
            },
            {
                "id": "myra",
                "name": "MyRA",
                "description": "Internal automation and AI assistant",
                "category_tag": "Internal",
                "icon_name": "🤖",
                "gradient_class": "rgba(168,85,247,0.18)",
                "icon_bg_class": "rgba(168,85,247,0.18)",
                "application_type": "Internal",
                "launch_type": "internal",
                "internal_route": "/myra",
                "external_url": None,
                "sso_enabled": False,
                "sort_order": 30
            },
            {
                "id": "mindscript",
                "name": "Mindscript",
                "description": "Enterprise mind mapping and AI brainstorming tool",
                "category_tag": "AI Tool",
                "icon_name": "🧠",
                "gradient_class": "rgba(99,102,241,0.18)",
                "icon_bg_class": "rgba(99,102,241,0.18)",
                "application_type": "AI Tool",
                "launch_type": "internal",
                "internal_route": "/mindscript",
                "external_url": None,
                "sso_enabled": False,
                "sort_order": 40
            },
            {
                "id": "resolve-iq",
                "name": "Resolve IQ",
                "description": "AI-powered ticketing and system diagnostics tool",
                "category_tag": "AI Tool",
                "icon_name": "🧩",
                "gradient_class": "rgba(14,165,233,0.18)",
                "icon_bg_class": "rgba(14,165,233,0.18)",
                "application_type": "AI Tool",
                "launch_type": "internal",
                "internal_route": "/resolve-iq",
                "external_url": None,
                "sso_enabled": False,
                "sort_order": 50
            },
            {
                "id": "expense-management",
                "name": "Expense Management",
                "description": "Visual placeholder for future expense tracking module",
                "category_tag": "Future Module",
                "icon_name": "💰",
                "gradient_class": "rgba(34,197,94,0.18)",
                "icon_bg_class": "rgba(34,197,94,0.18)",
                "application_type": "Future Module",
                "launch_type": "internal",
                "internal_route": "/expense-management",
                "external_url": None,
                "sso_enabled": False,
                "sort_order": 60
            },
            {
                "id": "knowledge-management",
                "name": "Knowledge Management",
                "description": "Visual placeholder for future knowledge sharing system",
                "category_tag": "Future Module",
                "icon_name": "📚",
                "gradient_class": "rgba(168,85,247,0.18)",
                "icon_bg_class": "rgba(168,85,247,0.18)",
                "application_type": "Future Module",
                "launch_type": "internal",
                "internal_route": "/knowledge-management",
                "external_url": None,
                "sso_enabled": False,
                "sort_order": 70
            },
            {
                "id": "idea-tracking",
                "name": "Idea Tracking",
                "description": "Visual placeholder for internal innovation tracker",
                "category_tag": "Future Module",
                "icon_name": "💡",
                "gradient_class": "rgba(250,204,21,0.18)",
                "icon_bg_class": "rgba(250,204,21,0.18)",
                "application_type": "Future Module",
                "launch_type": "internal",
                "internal_route": "/idea-tracking",
                "external_url": None,
                "sso_enabled": False,
                "sort_order": 80
            },
            {
                "id": "keka",
                "name": "Keka",
                "description": "HR payroll and attendance portal",
                "category_tag": "SaaS",
                "icon_name": "🏢",
                "gradient_class": "rgba(56,189,248,0.15)",
                "icon_bg_class": "rgba(56,189,248,0.15)",
                "application_type": "SaaS",
                "launch_type": "sso",
                "internal_route": None,
                "external_url": "https://app.keka.com/Account/Login?ReturnUrl=%2Fconnect%2Fauthorize%2Fcallback%3Fresponse_type%3Dcode%26client_id%3Dkeka-portal%26redirect_uri%3Dhttps%253A%252F%252Fportal.motiveminds.com%252Fauth%252Fcallback",
                "sso_enabled": True,
                "sort_order": 90
            },
            {
                "id": "salesforce",
                "name": "Salesforce",
                "description": "Customer relationship management platform",
                "category_tag": "SaaS",
                "icon_name": "☁️",
                "gradient_class": "rgba(56,189,248,0.15)",
                "icon_bg_class": "rgba(56,189,248,0.15)",
                "application_type": "SaaS",
                "launch_type": "external",
                "internal_route": None,
                "external_url": "https://www.salesforce.com/in/?ir=1",
                "sso_enabled": False,
                "sort_order": 100
            },
            {
                "id": "zohobooks",
                "name": "Zoho Books",
                "description": "Financial accounting software for business",
                "category_tag": "SaaS",
                "icon_name": "📒",
                "gradient_class": "rgba(16,185,129,0.18)",
                "icon_bg_class": "rgba(16,185,129,0.18)",
                "application_type": "SaaS",
                "launch_type": "external",
                "internal_route": None,
                "external_url": "https://books.zoho.com",
                "sso_enabled": False,
                "sort_order": 110
            },
            {
                "id": "admin",
                "name": "Admin Panel",
                "description": "System administrative panel for permissions",
                "category_tag": "Internal",
                "icon_name": "🛡️",
                "gradient_class": "rgba(239,68,68,0.15)",
                "icon_bg_class": "rgba(239,68,68,0.15)",
                "application_type": "Internal",
                "launch_type": "internal",
                "internal_route": "/admin",
                "external_url": None,
                "sso_enabled": False,
                "sort_order": 120
            },
            {
                "id": "gitlab",
                "name": "GitLab",
                "description": "Source code management and CI/CD platform",
                "category_tag": "SaaS",
                "icon_name": "🦊",
                "gradient_class": "rgba(245,158,11,0.18)",
                "icon_bg_class": "rgba(245,158,11,0.18)",
                "application_type": "SaaS",
                "launch_type": "external",
                "internal_route": None,
                "external_url": "https://gitlab.com",
                "sso_enabled": False,
                "sort_order": 130
            }
        ]

        for app in apps_data:
            print(f"Upserting app: {app['id']}...")
            # Check if app exists
            result = conn.execute(text("SELECT COUNT(*) FROM mm_portal.apps WHERE id = :id"), {"id": app["id"]})
            exists = result.scalar() > 0
            if not exists:
                conn.execute(text("""
                    INSERT INTO mm_portal.apps (
                        id, name, description, category_tag, icon_name, gradient_class, icon_bg_class, 
                        application_type, launch_type, internal_route, external_url, sso_enabled, sort_order, is_active
                    ) VALUES (
                        :id, :name, :description, :category_tag, :icon_name, :gradient_class, :icon_bg_class, 
                        :application_type, :launch_type, :internal_route, :external_url, :sso_enabled, :sort_order, true
                    )
                """), app)
            else:
                conn.execute(text("""
                    UPDATE mm_portal.apps SET 
                        name = :name, 
                        description = :description, 
                        category_tag = :category_tag, 
                        icon_name = :icon_name, 
                        gradient_class = :gradient_class, 
                        icon_bg_class = :icon_bg_class, 
                        application_type = :application_type, 
                        launch_type = :launch_type, 
                        internal_route = :internal_route, 
                        external_url = :external_url, 
                        sso_enabled = :sso_enabled, 
                        sort_order = :sort_order
                    WHERE id = :id
                """), app)

        # 3. Grant role permissions to the apps
        print("Checking/granting role permissions...")
        roles_permissions = [
            # Standard Employee Permissions
            ("employee", "wyngs"),
            ("employee", "estimatrix"),
            ("employee", "myra"),
            ("employee", "mindscript"),
            ("employee", "resolve-iq"),
            ("employee", "expense-management"),
            ("employee", "knowledge-management"),
            ("employee", "idea-tracking"),
            ("employee", "keka"),
            ("employee", "salesforce"),
            
            # IT Admin Permissions (all)
            ("it_admin", "wyngs"),
            ("it_admin", "estimatrix"),
            ("it_admin", "myra"),
            ("it_admin", "mindscript"),
            ("it_admin", "resolve-iq"),
            ("it_admin", "expense-management"),
            ("it_admin", "knowledge-management"),
            ("it_admin", "idea-tracking"),
            ("it_admin", "keka"),
            ("it_admin", "salesforce"),
            ("it_admin", "zohobooks"),
            ("it_admin", "gitlab"),
            ("it_admin", "admin")
        ]

        for role_id, app_id in roles_permissions:
            result = conn.execute(text("""
                SELECT COUNT(*) FROM mm_portal.role_app_permissions 
                WHERE role_id = :role_id AND app_id = :app_id
            """), {"role_id": role_id, "app_id": app_id})
            exists = result.scalar() > 0
            if not exists:
                print(f"Granting permission for role {role_id} on app {app_id}...")
                conn.execute(text("""
                    INSERT INTO mm_portal.role_app_permissions (role_id, app_id) 
                    VALUES (:role_id, :app_id)
                """), {"role_id": role_id, "app_id": app_id})

    print("Migration completed successfully!")

if __name__ == "__main__":
    migrate()
