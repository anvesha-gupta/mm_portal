import json
from sqlalchemy import text
from database import engine

def migrate():
    print("Starting DML-based apps migration...")
    with engine.begin() as conn:
        # Define the applications configurations
        apps_data = [
            {
                "id": "wyngs",
                "name": "Wyngs",
                "description": "Internal travel & logistics platform",
                "category_tag": "Internal",
                "icon_name": "🛫",
                "gradient_class": "rgba(124,58,237,0.18)",
                "icon_bg_class": "rgba(124,58,237,0.18)",
                "launch_url": "https://motiveminds.wyngs.pro/app/home",
                "sort_order": 10,
                "json_config": {
                    "application_type": "Internal",
                    "launch_type": "sso",
                    "internal_route": None,
                    "external_url": "https://motiveminds.wyngs.pro/app/home",
                    "sso_enabled": True
                }
            },
            {
                "id": "estimatrix",
                "name": "Estimatrix",
                "description": "Internal estimation and quote generation tool",
                "category_tag": "Internal",
                "icon_name": "📊",
                "gradient_class": "rgba(16,185,129,0.18)",
                "icon_bg_class": "rgba(16,185,129,0.18)",
                "launch_url": "https://estdev.wyngs.pro/",
                "sort_order": 20,
                "json_config": {
                    "application_type": "Internal",
                    "launch_type": "sso",
                    "internal_route": None,
                    "external_url": "https://estdev.wyngs.pro/",
                    "sso_enabled": True
                }
            },
            {
                "id": "myra",
                "name": "MyRA",
                "description": "Internal automation and AI assistant",
                "category_tag": "Internal",
                "icon_name": "🤖",
                "gradient_class": "rgba(168,85,247,0.18)",
                "icon_bg_class": "rgba(168,85,247,0.18)",
                "launch_url": "/myra",
                "sort_order": 30,
                "json_config": {
                    "application_type": "Internal",
                    "launch_type": "internal",
                    "internal_route": "/myra",
                    "external_url": None,
                    "sso_enabled": False
                }
            },
            {
                "id": "mindscript",
                "name": "Mindscript",
                "description": "Enterprise mind mapping and AI brainstorming tool",
                "category_tag": "AI Tool",
                "icon_name": "🧠",
                "gradient_class": "rgba(99,102,241,0.18)",
                "icon_bg_class": "rgba(99,102,241,0.18)",
                "launch_url": "/mindscript",
                "sort_order": 40,
                "json_config": {
                    "application_type": "AI Tool",
                    "launch_type": "internal",
                    "internal_route": "/mindscript",
                    "external_url": None,
                    "sso_enabled": False
                }
            },
            {
                "id": "resolve-iq",
                "name": "Resolve IQ",
                "description": "AI-powered ticketing and system diagnostics tool",
                "category_tag": "AI Tool",
                "icon_name": "🧩",
                "gradient_class": "rgba(14,165,233,0.18)",
                "icon_bg_class": "rgba(14,165,233,0.18)",
                "launch_url": "/resolve-iq",
                "sort_order": 50,
                "json_config": {
                    "application_type": "AI Tool",
                    "launch_type": "internal",
                    "internal_route": "/resolve-iq",
                    "external_url": None,
                    "sso_enabled": False
                }
            },
            {
                "id": "expense-management",
                "name": "Expense Management",
                "description": "Visual placeholder for future expense tracking module",
                "category_tag": "Future Module",
                "icon_name": "💰",
                "gradient_class": "rgba(34,197,94,0.18)",
                "icon_bg_class": "rgba(34,197,94,0.18)",
                "launch_url": "/expense-management",
                "sort_order": 60,
                "json_config": {
                    "application_type": "Future Module",
                    "launch_type": "internal",
                    "internal_route": "/expense-management",
                    "external_url": None,
                    "sso_enabled": False
                }
            },
            {
                "id": "knowledge-management",
                "name": "Knowledge Management",
                "description": "Visual placeholder for future knowledge sharing system",
                "category_tag": "Future Module",
                "icon_name": "📚",
                "gradient_class": "rgba(168,85,247,0.18)",
                "icon_bg_class": "rgba(168,85,247,0.18)",
                "launch_url": "/knowledge-management",
                "sort_order": 70,
                "json_config": {
                    "application_type": "Future Module",
                    "launch_type": "internal",
                    "internal_route": "/knowledge-management",
                    "external_url": None,
                    "sso_enabled": False
                }
            },
            {
                "id": "idea-tracking",
                "name": "Idea Tracking",
                "description": "Visual placeholder for internal innovation tracker",
                "category_tag": "Future Module",
                "icon_name": "💡",
                "gradient_class": "rgba(250,204,21,0.18)",
                "icon_bg_class": "rgba(250,204,21,0.18)",
                "launch_url": "/idea-tracking",
                "sort_order": 80,
                "json_config": {
                    "application_type": "Future Module",
                    "launch_type": "internal",
                    "internal_route": "/idea-tracking",
                    "external_url": None,
                    "sso_enabled": False
                }
            },
            {
                "id": "keka",
                "name": "Keka",
                "description": "HR payroll and attendance portal",
                "category_tag": "SaaS",
                "icon_name": "🏢",
                "gradient_class": "rgba(56,189,248,0.15)",
                "icon_bg_class": "rgba(56,189,248,0.15)",
                "launch_url": "https://app.keka.com/Account/Login?ReturnUrl=%2Fconnect%2Fauthorize%2Fcallback%3Fresponse_type%3Dcode%26client_id%3Dkeka-portal%26redirect_uri%3Dhttps%253A%252F%252Fportal.motiveminds.com%252Fauth%252Fcallback",
                "sort_order": 90,
                "json_config": {
                    "application_type": "SaaS",
                    "launch_type": "sso",
                    "internal_route": None,
                    "external_url": "https://app.keka.com/Account/Login?ReturnUrl=%2Fconnect%2Fauthorize%2Fcallback%3Fresponse_type%3Dcode%26client_id%3Dkeka-portal%26redirect_uri%3Dhttps%253A%252F%252Fportal.motiveminds.com%252Fauth%252Fcallback",
                    "sso_enabled": True
                }
            },
            {
                "id": "salesforce",
                "name": "Salesforce",
                "description": "Customer relationship management platform",
                "category_tag": "SaaS",
                "icon_name": "☁️",
                "gradient_class": "rgba(56,189,248,0.15)",
                "icon_bg_class": "rgba(56,189,248,0.15)",
                "launch_url": "https://www.salesforce.com/in/?ir=1",
                "sort_order": 100,
                "json_config": {
                    "application_type": "SaaS",
                    "launch_type": "external",
                    "internal_route": None,
                    "external_url": "https://www.salesforce.com/in/?ir=1",
                    "sso_enabled": False
                }
            },
            {
                "id": "zohobooks",
                "name": "Zoho Books",
                "description": "Financial accounting software for business",
                "category_tag": "SaaS",
                "icon_name": "📒",
                "gradient_class": "rgba(16,185,129,0.18)",
                "icon_bg_class": "rgba(16,185,129,0.18)",
                "launch_url": "https://books.zoho.com",
                "sort_order": 110,
                "json_config": {
                    "application_type": "SaaS",
                    "launch_type": "external",
                    "internal_route": None,
                    "external_url": "https://books.zoho.com",
                    "sso_enabled": False
                }
            },
            {
                "id": "admin",
                "name": "Admin Panel",
                "description": "System administrative panel for permissions",
                "category_tag": "Internal",
                "icon_name": "🛡️",
                "gradient_class": "rgba(239,68,68,0.15)",
                "icon_bg_class": "rgba(239,68,68,0.15)",
                "launch_url": "/admin",
                "sort_order": 120,
                "json_config": {
                    "application_type": "Internal",
                    "launch_type": "internal",
                    "internal_route": "/admin",
                    "external_url": None,
                    "sso_enabled": False
                }
            },
            {
                "id": "gitlab",
                "name": "GitLab",
                "description": "Source code management and CI/CD platform",
                "category_tag": "SaaS",
                "icon_name": "🦊",
                "gradient_class": "rgba(245,158,11,0.18)",
                "icon_bg_class": "rgba(245,158,11,0.18)",
                "launch_url": "https://gitlab.com",
                "sort_order": 130,
                "json_config": {
                    "application_type": "SaaS",
                    "launch_type": "external",
                    "internal_route": None,
                    "external_url": "https://gitlab.com",
                    "sso_enabled": False
                }
            }
        ]

        for app in apps_data:
            print(f"Upserting app: {app['id']}...")
            json_str = json.dumps(app["json_config"])
            # Check if app exists
            result = conn.execute(text("SELECT COUNT(*) FROM mm_portal.apps WHERE id = :id"), {"id": app["id"]})
            exists = result.scalar() > 0
            if not exists:
                conn.execute(text("""
                    INSERT INTO mm_portal.apps (
                        id, name, description, category_tag, icon_name, gradient_class, icon_bg_class, 
                        launch_url, sort_order, is_active, long_description
                    ) VALUES (
                        :id, :name, :description, :category_tag, :icon_name, :gradient_class, :icon_bg_class, 
                        :launch_url, :sort_order, true, :long_description
                    )
                """), {
                    "id": app["id"],
                    "name": app["name"],
                    "description": app["description"],
                    "category_tag": app["category_tag"],
                    "icon_name": app["icon_name"],
                    "gradient_class": app["gradient_class"],
                    "icon_bg_class": app["icon_bg_class"],
                    "launch_url": app["launch_url"],
                    "sort_order": app["sort_order"],
                    "long_description": json_str
                })
            else:
                conn.execute(text("""
                    UPDATE mm_portal.apps SET 
                        name = :name, 
                        description = :description, 
                        category_tag = :category_tag, 
                        icon_name = :icon_name, 
                        gradient_class = :gradient_class, 
                        icon_bg_class = :icon_bg_class, 
                        launch_url = :launch_url, 
                        sort_order = :sort_order,
                        long_description = :long_description
                    WHERE id = :id
                """), {
                    "id": app["id"],
                    "name": app["name"],
                    "description": app["description"],
                    "category_tag": app["category_tag"],
                    "icon_name": app["icon_name"],
                    "gradient_class": app["gradient_class"],
                    "icon_bg_class": app["icon_bg_class"],
                    "launch_url": app["launch_url"],
                    "sort_order": app["sort_order"],
                    "long_description": json_str
                })

        # Grant role permissions to the apps
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
