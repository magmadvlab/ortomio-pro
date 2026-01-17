# 🏗️ MULTI-TENANCY ARCHITECTURE DIAGRAM

Diagramma visuale dell'architettura del sistema multi-tenancy.

---

## 📊 ENTITY RELATIONSHIP DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MULTI-TENANCY SYSTEM                        │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  auth.users      │
│  (Supabase)      │
│                  │
│  - id (UUID)     │
│  - email         │
│  - ...           │
└────────┬─────────┘
         │
         │ owner_id
         │
         ▼
┌──────────────────┐         ┌──────────────────┐
│  organizations   │◄────────┤  roles           │
│                  │         │                  │
│  - id            │         │  - id            │
│  - name          │         │  - organization_id│
│  - type          │         │  - name          │
│  - owner_id      │         │  - permissions   │
│  - email         │         │  - is_system     │
│  - phone         │         └────────┬─────────┘
│  - vat_number    │                  │
└────────┬─────────┘                  │ role_id
         │                            │
         │ organization_id            │
         │                            │
         ▼                            ▼
┌──────────────────┐         ┌──────────────────┐
│  organization_   │         │  organization_   │
│  members         │◄────────┤  invitations     │
│                  │         │                  │
│  - id            │         │  - id            │
│  - organization_id│        │  - organization_id│
│  - user_id       │         │  - email         │
│  - role_id       │         │  - role_id       │
│  - status        │         │  - token         │
│  - joined_at     │         │  - expires_at    │
└────────┬─────────┘         │  - status        │
         │                   └──────────────────┘
         │ member_id
         │
         ▼
┌──────────────────┐         ┌──────────────────┐
│  garden_         │         │  gardens         │
│  assignments     │────────►│  (existing)      │
│                  │         │                  │
│  - id            │         │  - id            │
│  - organization_id│        │  - name          │
│  - garden_id     │         │  - user_id       │
│  - member_id     │         │  - ...           │
│  - access_level  │         └──────────────────┘
└──────────────────┘

┌──────────────────┐
│  api_keys        │
│                  │
│  - id            │
│  - user_id       │
│  - organization_id│
│  - service       │
│  - name          │
│  - key_value     │
│  - config        │
│  - is_active     │
│  - usage_count   │
└──────────────────┘
```

---

## 🔐 PERMISSION FLOW

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PERMISSION CHECKING                         │
└─────────────────────────────────────────────────────────────────────┘

User Request
     │
     ▼
┌──────────────────┐
│ Get User's       │
│ Organization     │
│ Membership       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Get Member's     │
│ Role             │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Get Role's       │
│ Permissions      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Check Resource   │
│ & Action         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Check Scope      │
│ (All/Own/        │
│  Assigned/       │
│  Specific)       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ If Assigned:     │
│ Check Garden     │
│ Assignment       │
└────────┬─────────┘
         │
         ▼
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│ ALLOW  │ │ DENY   │
└────────┘ └────────┘
```

---

## 👥 USER ROLES HIERARCHY

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ROLES HIERARCHY                             │
└─────────────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │    OWNER     │
                    │  (Full Access)│
                    └──────┬───────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │    ADMIN    │ │ AGRONOMIST  │ │  OPERATOR   │
    │  (Manage    │ │ (Treatments │ │  (Execute   │
    │  Resources) │ │  & Advice)  │ │   Tasks)    │
    └─────────────┘ └─────────────┘ └──────┬──────┘
                                            │
                                            ▼
                                     ┌─────────────┐
                                     │   VIEWER    │
                                     │ (Read Only) │
                                     └─────────────┘
```

---

## 🌱 GARDEN ASSIGNMENT FLOW

```
┌─────────────────────────────────────────────────────────────────────┐
│                      GARDEN ASSIGNMENT FLOW                         │
└─────────────────────────────────────────────────────────────────────┘

Organization
     │
     ├─── Garden 1 (Campo Nord)
     │         │
     │         ├─── Member A (Full Access)
     │         ├─── Member B (ReadWrite)
     │         └─── Member C (ReadOnly)
     │
     ├─── Garden 2 (Campo Sud)
     │         │
     │         ├─── Member B (Full Access)
     │         └─── Member C (ReadOnly)
     │
     └─── Garden 3 (Oliveto)
               │
               └─── Member A (ReadWrite)

Access Levels:
┌──────────────┬─────────┬─────────┬─────────┬─────────┐
│ Level        │ Create  │ Read    │ Update  │ Delete  │
├──────────────┼─────────┼─────────┼─────────┼─────────┤
│ Full         │    ✓    │    ✓    │    ✓    │    ✓    │
│ ReadWrite    │    ✓    │    ✓    │    ✓    │    ✗    │
│ ReadOnly     │    ✗    │    ✓    │    ✗    │    ✗    │
└──────────────┴─────────┴─────────┴─────────┴─────────┘
```

---

## 🔑 API KEYS ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────┐
│                       API KEYS ARCHITECTURE                         │
└─────────────────────────────────────────────────────────────────────┘

User
  │
  ├─── API Key 1 (OpenAI)
  │         │
  │         ├─── Service: OpenAI
  │         ├─── Name: "Account Personale"
  │         ├─── Key: sk-... (encrypted)
  │         ├─── Config: { organization: "org-..." }
  │         ├─── Status: Active
  │         └─── Usage: 150 calls, last used: 2026-01-16
  │
  ├─── API Key 2 (Sentinel Hub)
  │         │
  │         ├─── Service: SentinelHub
  │         ├─── Name: "NDVI Satellite"
  │         ├─── Key: encrypted credentials
  │         ├─── Config: { clientId, clientSecret, instanceId }
  │         ├─── Status: Active
  │         └─── Usage: 45 calls, last used: 2026-01-15
  │
  └─── API Key 3 (Anthropic)
            │
            ├─── Service: Anthropic
            ├─── Name: "Claude Test"
            ├─── Key: sk-ant-... (encrypted)
            ├─── Config: {}
            ├─── Status: Inactive
            └─── Usage: 0 calls, never used

Encryption Flow:
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Plain Key    │───►│ Encrypt      │───►│ Store in DB  │
│ sk-abc123... │    │ (AES-256-GCM)│    │ encrypted... │
└──────────────┘    └──────────────┘    └──────────────┘

Usage Flow:
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Get from DB  │───►│ Decrypt      │───►│ Use in API   │
│ encrypted... │    │ (AES-256-GCM)│    │ sk-abc123... │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## 📧 INVITATION FLOW

```
┌─────────────────────────────────────────────────────────────────────┐
│                        INVITATION FLOW                              │
└─────────────────────────────────────────────────────────────────────┘

Owner/Admin
     │
     │ 1. Create Invitation
     ▼
┌──────────────────┐
│ organization_    │
│ invitations      │
│                  │
│ - email          │
│ - role_id        │
│ - token (UUID)   │
│ - expires_at     │
│ - status: Pending│
└────────┬─────────┘
         │
         │ 2. Send Email
         ▼
┌──────────────────┐
│ Email Service    │
│                  │
│ To: invitee      │
│ Link: /invite/   │
│       {token}    │
└────────┬─────────┘
         │
         │ 3. User Clicks Link
         ▼
┌──────────────────┐
│ Invitation Page  │
│                  │
│ - Show org info  │
│ - Show role      │
│ - Accept/Decline │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│ Accept │ │ Decline│
└───┬────┘ └───┬────┘
    │          │
    │          │ 4. Update Status
    ▼          ▼
┌──────────────────┐
│ Create Member    │
│ OR               │
│ Mark Declined    │
└──────────────────┘
```

---

## 🔄 DATA FLOW EXAMPLE

```
┌─────────────────────────────────────────────────────────────────────┐
│              EXAMPLE: Operator Updates Plant Status                │
└─────────────────────────────────────────────────────────────────────┘

1. Operator Login
   └─► User ID: user-123

2. Get Organizations
   └─► Organization: "Azienda Rossi" (org-456)

3. Get Member Info
   └─► Member ID: member-789
       Role: Operator
       Status: Active

4. Get Assigned Gardens
   └─► Garden: "Campo Nord" (garden-abc)
       Access Level: ReadWrite

5. Request: Update Plant Status
   └─► Resource: plants
       Action: update
       Garden: garden-abc

6. Permission Check
   ├─► Role: Operator
   ├─► Permission: plants.update ✓
   ├─► Scope: Assigned
   └─► Garden Assignment: garden-abc ✓

7. Execute Update
   └─► Update plant status in garden-abc

8. Log Activity
   └─► Audit log: user-123 updated plant in garden-abc

9. Notify
   └─► Notify owner/admin of update
```

---

## 🎯 PERMISSION MATRIX

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PERMISSION MATRIX                            │
└─────────────────────────────────────────────────────────────────────┘

Resource         │ Owner │ Admin │ Agronomist │ Operator │ Viewer
─────────────────┼───────┼───────┼────────────┼──────────┼────────
gardens          │  ✓✓✓  │  ✓✓✓  │     ✓      │    ✓*    │   ✓*
plants           │  ✓✓✓  │  ✓✓✓  │    ✓✓      │   ✓✓*    │   ✓*
tasks            │  ✓✓✓  │  ✓✓✓  │     ✓      │   ✓✓*    │   ✓*
harvests         │  ✓✓✓  │  ✓✓✓  │     ✓      │   ✓✓*    │   ✓*
treatments       │  ✓✓✓  │  ✓✓✓  │    ✓✓✓     │    ✓*    │   ✓*
irrigation       │  ✓✓✓  │  ✓✓✓  │    ✓✓      │   ✓✓*    │   ✓*
nutrition        │  ✓✓✓  │  ✓✓✓  │    ✓✓✓     │    ✓*    │   ✓*
analytics        │  ✓✓✓  │  ✓✓✓  │     ✓      │    ✓*    │   ✓*
settings         │  ✓✓✓  │   ✗   │     ✗      │    ✗     │   ✗
members          │  ✓✓✓  │  ✓✓   │     ✗      │    ✗     │   ✗
roles            │  ✓✓✓  │   ✓   │     ✗      │    ✗     │   ✗
api_keys         │  ✓✓✓  │   ✗   │     ✗      │    ✗     │   ✗
certifications   │  ✓✓✓  │  ✓✓✓  │    ✓✓      │    ✓*    │   ✓*
prescriptions    │  ✓✓✓  │  ✓✓✓  │    ✓✓✓     │    ✓*    │   ✓*
ndvi             │  ✓✓✓  │  ✓✓✓  │     ✓      │    ✓*    │   ✓*
agronomist       │  ✓✓✓  │  ✓✓✓  │    ✓✓✓     │    ✓*    │   ✓*

Legend:
✓✓✓ = Full Access (Create, Read, Update, Delete)
✓✓  = Read/Write (Create, Read, Update)
✓   = Read Only
✗   = No Access
*   = Only Assigned Resources
```

---

## 🔒 SECURITY LAYERS

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SECURITY LAYERS                             │
└─────────────────────────────────────────────────────────────────────┘

Layer 1: Authentication
┌──────────────────────────────────────────────────────────────────┐
│ Supabase Auth                                                    │
│ - Email/Password                                                 │
│ - OAuth (Google, GitHub, etc.)                                   │
│ - Magic Links                                                    │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
Layer 2: Organization Membership
┌──────────────────────────────────────────────────────────────────┐
│ organization_members                                             │
│ - User must be active member                                     │
│ - Status: Active (not Suspended)                                 │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
Layer 3: Role-Based Access Control (RBAC)
┌──────────────────────────────────────────────────────────────────┐
│ roles & permissions                                              │
│ - Check role permissions                                         │
│ - Validate resource & action                                     │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
Layer 4: Scope-Based Access Control
┌──────────────────────────────────────────────────────────────────┐
│ permission scope                                                 │
│ - All: Access all resources                                      │
│ - Own: Only own resources                                        │
│ - Assigned: Only assigned resources                              │
│ - Specific: Specific resource IDs                                │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
Layer 5: Garden Assignment
┌──────────────────────────────────────────────────────────────────┐
│ garden_assignments                                               │
│ - Check if garden assigned to member                             │
│ - Validate access level (Full/ReadWrite/ReadOnly)                │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
Layer 6: Row Level Security (RLS)
┌──────────────────────────────────────────────────────────────────┐
│ PostgreSQL RLS Policies                                          │
│ - Database-level security                                        │
│ - Automatic filtering of queries                                 │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                         ┌────────┐
                         │ ALLOW  │
                         └────────┘
```

---

**Diagrammi creati per facilitare comprensione architettura sistema** 📊
