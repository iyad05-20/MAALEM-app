# Project Structure Reorganization - Decision Questions

**For**: Project Lead / Tech Lead  
**Purpose**: Finalize optimal file placement and folder structure  
**Note**: These decisions will determine the final architecture

---

## Section 1: API Functions & Serverless Code

### Question 1.1: Vercel API Functions Location

**Current**: `frontend/api/` contains serverless functions:
- `api/chat.ts` (Gemini chatbot)
- `api/generate-image.ts` (Cloudflare AI)
- `api/analyze-urgent.ts` (Order analysis)

**Options**:
- **A**: Keep in `frontend/api/` 
  - ✓ Vercel auto-deploys with frontend
  - ✗ Architecturally confusing (backend code in frontend folder)
  
- **B**: Move to `config/api/` with symlink/reference
  - ✓ Cleaner architecture
  - ✗ Requires build process modification
  
- **C**: Move to `config/api/` and update frontend build
  - ✓ Clear separation
  - ✗ More complex deployment setup

**Question**: Which approach should we use?

---

## Section 2: Backend Configuration & Services

### Question 2.1: Firebase/Supabase Configuration Files

**Current**: `frontend/src/services/` contains:
- `firebase.config.ts` (Firebase initialization)
- `supabase.config.ts` (Supabase initialization)
- `auth.service.ts`, `order.service.ts`, etc.

**Options**:
- **A**: Keep everything in `frontend/src/services/`
  - ✓ Works fine, frontend-specific
  - ✗ Config files shouldn't really be in src/

- **B**: Move `*config.ts` to `config/` folder (outside frontend)
  - ✓ Config centralized
  - ✓ Reusable by other projects
  - ✗ Frontend needs to import from parent directory
  - ✗ Services can't live there (frontend-specific)

- **C**: Split: Keep services in frontend, move only config files to `config/`
  - ✓ Best of both worlds
  - ✗ Requires managing imports across folder boundaries

**Question**: Should Firebase/Supabase config be centralized in `config/`? If yes, how should frontend reference it?

---

## Section 3: Firestore & Database Rules

### Question 3.1: Location of Database Rules & Migrations

**Current**: `backend/firebase/rules/firestore.rules` (moved from root)

**Options**:
- **A**: Keep in `backend/` (current structure)
  - ✓ All rules together
  - ✗ Backend folder is otherwise empty

- **B**: Move to `config/firebase/` 
  - ✓ All configuration in one place
  - ✓ Clearer purpose

- **C**: Move to `docs/database/` (alongside RLS policies)
  - ✓ Close to documentation
  - ✗ Not really documentation
  
- **D**: Keep in root as `firestore.rules` (simple)
  - ✓ Easy to find
  - ✗ Root becomes cluttered

**Question**: Where should database rules live for optimal organization?

### Question 3.2: Database Migrations & Schemas

**Current**: Empty folder `backend/migrations/`

**Options**:
- **A**: Keep in `backend/migrations/`
- **B**: Move to `config/migrations/`
- **C**: Move to `docs/database/migrations/`
- **D**: Keep only in version control/deployment platform (not in repo)

**Question**: Where should database migrations be stored and versioned?

---

## Section 4: The Vork Project

### Question 4.1: Vork's Purpose & Future

**Current**: `vork/` is a separate Next.js project at root level, purpose unclear

**Options**:
- **A**: This is an **ACTIVE project** (admin dashboard, analytics, etc.)
  - → Keep at root level but clarify documentation
  - → What does it do?
  
- **B**: This is a **LEGACY/DEPRECATED** project
  - → Move to `archived/vork/` with deprecation note
  - → Mark for deletion in roadmap
  
- **C**: This is an **EXPERIMENTAL** feature
  - → Move to `experiments/vork/` 
  - → Keep until decision made
  
- **D**: This is a **SEPARATE DEPLOYMENT** (different team/product)
  - → Extract to separate repository
  - → Remove from monorepo

**Question**: What is Vork's current status and purpose? (This determines its placement)

### Question 4.2: Vork's Dependencies & Independence

**Current**: Vork has its own `package.json`, not in monorepo workspaces

**Options**:
- **A**: Add Vork to monorepo workspaces (unified dependency management)
  - → `npm install` from root installs for all 3 projects
  
- **B**: Keep Vork independent (separate deployments)
  - → `npm install` must be run in vork/ directory separately

**Question**: Should Vork be part of the monorepo workspaces or remain completely independent?

---

## Section 5: Environment Variables & Secrets

### Question 5.1: Configuration Management Strategy

**Current**: `.env.example` is in `frontend/` only

**Options**:
- **A**: Keep `.env.example` in each project directory only
  - ✓ Project-specific documentation
  - ✗ Some vars are shared across projects

- **B**: Create root `.env.example` with all vars documented
  - ✓ Single source of truth
  - ✗ Projects might have conflicting var names
  
- **C**: Create `config/.env.example` as master template
  - ✓ All config in one place
  - ✗ Requires copying to each project

- **D**: Document in code only (no example files)
  - ✓ Simpler
  - ✗ Harder for new developers

**Question**: How should environment variables be documented and managed across frontend, backend, and vork?

---

## Section 6: Overall Structure Clarity

### Question 6.1: Proposed New Root Structure

We're considering this new structure:

```
maalem-app/
├── docs/                  # Documentation (no changes)
├── app/                   # OR "frontend/" - Main application
├── config/                # Centralized configuration
│   ├── api/              # Serverless functions
│   ├── firebase/         # Firebase & Firestore rules
│   ├── supabase/         # Supabase configuration
│   └── migrations/       # Database migrations
├── archived/             # OR "experiments/" - Deprecated/experimental
│   └── vork/            # Vork project (if not in use)
└── README.md
```

**Does this structure make sense to you?** Any concerns?

### Question 6.2: Naming Preference

**Should we rename `frontend/` to something else?**

- **A**: Keep as `frontend/` (clear, standard)
- **B**: Rename to `app/` (shorter, common pattern)
- **C**: Rename to `web/` (specific platform)
- **D**: Rename to `client/` (role-based name)

**Question**: What naming convention do you prefer?

---

## Section 7: Backend Conceptual Clarity

### Question 7.1: Is there actual backend code beyond serverless functions?

**Current** `backend/` folder contains:
- Firestore rules
- Serverless API functions
- Configuration files
- Empty migration folder

**Question**: 
- Is there backend code that SHOULD exist but doesn't (e.g., Node.js API server)?
- Do you plan to add a dedicated backend service in the future?
- Is Firebase + Vercel functions the long-term backend strategy?

---

## Section 8: Deployment & Build Process

### Question 8.1: How is the project deployed?

- **Frontend**: Vercel (auto-deploy from Git)
- **Vork**: ??? (Same Vercel? Different platform? Not deployed?)
- **Config/API functions**: ??? (Auto-deployed with frontend?)
- **Database**: Firebase managed (no deployment)

**Question**: Clarify deployment strategy for each component. This affects folder structure decisions.

---

## Section 9: Team & Future Growth

### Question 9.1: Long-term Architecture Decisions

- How many developers will work on this project?
- Will it grow to have multiple frontends (web, mobile, admin)?
- Do you plan to add a traditional backend server eventually?
- Are there multiple teams managing different parts?

**Question**: This helps optimize for scalability and team workflow.

---

## Summary: Quick Reference Decisions Needed

| # | Topic | Key Question |
|---|-------|--------------|
| 1 | API Functions | Keep in frontend/ or move to config/? |
| 2 | Config Files | Centralize in config/ or keep in frontend/src/? |
| 3 | Database Rules | Location: backend/, config/, docs/, or root? |
| 4 | Vork Status | Active, legacy, experimental, or separate repo? |
| 5 | Vork Workspace | Include in monorepo workspaces or keep independent? |
| 6 | Environment Vars | Master template location? |
| 7 | Naming | Keep frontend/ or rename to app/web/client/? |
| 8 | Backend Strategy | Plans for traditional backend server? |
| 9 | Deployment | How is each component deployed? |

---

## Next Steps

Once you answer these questions, I will:

1. ✅ Create the optimal folder structure
2. ✅ Move files to correct locations
3. ✅ Update all import paths
4. ✅ Update build/deploy configs
5. ✅ Verify project still builds
6. ✅ Create clear documentation for the new structure

Please provide answers to guide these decisions.
