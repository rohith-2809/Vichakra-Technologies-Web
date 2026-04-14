#!/usr/bin/env bash
# =============================================================================
# Vichakra API — End-to-End Test Script
# Usage:  bash scripts/test_api.sh
# Prereq: Server running on localhost:5000  (npm run dev inside server/)
#         MongoDB running locally
# =============================================================================

BASE="http://localhost:5000/api"
ADMIN_COOKIE="admin_cookies.txt"
CLIENT_COOKIE="client_cookies.txt"

# ── Credentials (must match what was seeded) ──────────────────────────────────
ADMIN_EMAIL="admin@vichakratechnologies.com"
ADMIN_PASS="VichakraAdmin@2026"
CLIENT_EMAIL="arjun.test@mehta.com"
CLIENT_PASS="Client@123"

ADMIN_TOKEN=""
CLIENT_TOKEN=""
CLIENT_ID=""
PROJECT_ID=""
REQS_ID=""
TICKET_ID=""
FEEDBACK_ID=""
FILE_ID=""
STATUS_ID=""
PASS=0
FAIL=0
SKIP=0

# ── Resolve jq (handles Windows winget PATH not refreshed yet) ────────────────
JQ=""
if command -v jq &>/dev/null; then
  JQ="jq"
else
  # Get real Windows username via cmd (works in Git Bash even when $USERNAME is wrong)
  WIN_USER=$(cmd.exe /c "echo %USERNAME%" 2>/dev/null | tr -d '\r\n')
  WINGET_JQ="/c/Users/${WIN_USER}/AppData/Local/Microsoft/WinGet/Packages/jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe/jq.exe"
  if [ -f "$WINGET_JQ" ]; then
    JQ="$WINGET_JQ"
  else
    # Brute-force search under all known user AppData paths
    JQ_FOUND=$(find "/c/Users/${WIN_USER}/AppData/Local/Microsoft/WinGet" -name "jq.exe" 2>/dev/null | head -1)
    [ -n "$JQ_FOUND" ] && JQ="$JQ_FOUND"
  fi
fi

# ── Helpers ──────────────────────────────────────────────────────────────────

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

section() { echo -e "\n${CYAN}${BOLD}━━━ $1 ━━━${RESET}"; }

pass() { echo -e "  ${GREEN}✓${RESET} $1"; ((PASS++)); }
fail() { echo -e "  ${RED}✗${RESET} $1"; ((FAIL++)); }
skip() { echo -e "  ${YELLOW}⊘${RESET} $1 (skipped — dependency missing)"; ((SKIP++)); }
info() { echo -e "  ${YELLOW}→${RESET} $1"; }

# Run curl, return response body; store http code in $HTTP_CODE
req() {
  local METHOD="$1"; shift
  local URL="$1";    shift
  RESPONSE=$(curl -s -w "\n__HTTP__%{http_code}" -X "$METHOD" "$URL" "$@")
  HTTP_CODE=$(echo "$RESPONSE" | grep -o '__HTTP__[0-9]*' | grep -o '[0-9]*')
  BODY=$(echo "$RESPONSE" | sed 's/__HTTP__[0-9]*$//')
}

assert_code() {
  local EXPECTED="$1"; local LABEL="$2"
  if [ "$HTTP_CODE" = "$EXPECTED" ]; then pass "$LABEL (HTTP $HTTP_CODE)";
  else fail "$LABEL — expected HTTP $EXPECTED, got $HTTP_CODE | $(echo $BODY | $JQ -r '.error // empty' 2>/dev/null)"; fi
}

assert_field() {
  local FIELD="$1"; local EXPECTED="$2"; local LABEL="$3"
  local ACTUAL; ACTUAL=$(echo "$BODY" | $JQ -r "$FIELD" 2>/dev/null)
  if [ "$ACTUAL" = "$EXPECTED" ]; then pass "$LABEL";
  else fail "$LABEL — expected '$EXPECTED', got '$ACTUAL'"; fi
}

assert_not_empty() {
  local FIELD="$1"; local LABEL="$2"
  local ACTUAL; ACTUAL=$(echo "$BODY" | $JQ -r "$FIELD" 2>/dev/null)
  if [ -n "$ACTUAL" ] && [ "$ACTUAL" != "null" ]; then pass "$LABEL";
  else fail "$LABEL — field '$FIELD' is empty/null"; fi
}

# =============================================================================

echo -e "\n${BOLD}Vichakra API — End-to-End Test Suite${RESET}"
echo "Base URL : $BASE"
echo "Started  : $(date)"

# ── 0. Pre-flight ─────────────────────────────────────────────────────────────
section "0 · Pre-flight"

# Resolve jq
if [ -z "$JQ" ]; then
  fail "jq not found. Open a NEW terminal (PATH needs refresh after winget install) and re-run."
  echo -e "  If jq is still missing: winget install jqlang.jq"
  exit 1
else
  pass "jq found: $JQ"
fi

# Check server is up — give it 3 attempts (sometimes nodemon is still starting)
SERVER_UP=false
for i in 1 2 3; do
  req GET "$BASE/health"
  if [ "$HTTP_CODE" = "200" ]; then SERVER_UP=true; break; fi
  echo -e "  ${YELLOW}→${RESET} Server not ready yet, retrying in 2s… ($i/3)"
  sleep 2
done

if $SERVER_UP; then
  assert_code 200 "Server health check"
  assert_field ".status" "ok" "Health status is 'ok'"
else
  fail "Server unreachable at $BASE — is 'npm run dev' running in server/ ?"
  exit 1
fi

# Create dummy upload file
echo "Vichakra test document content" > /tmp/vt_test.pdf
pass "Dummy test file created"

# Clean up old cookie files
rm -f "$ADMIN_COOKIE" "$CLIENT_COOKIE"

# ── 1. Auth — unauthenticated rejections ──────────────────────────────────────
section "1 · Auth — unauthenticated & role guards"

req GET "$BASE/admin/stats"
assert_code 401 "Admin route rejected without token"

req GET "$BASE/portal/projects"
assert_code 401 "Portal route rejected without token"

req POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"nobody@example.com","password":"wrong"}'
assert_code 401 "Login with unknown credentials returns 401"

req POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email","password":"x"}'
assert_code 400 "Login with invalid email format returns 400"

# ── 2. Admin login ─────────────────────────────────────────────────────────────
section "2 · Admin login"

req POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -c "$ADMIN_COOKIE" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}"

assert_code 200 "Admin login succeeds"
ADMIN_TOKEN=$(echo "$BODY" | $JQ -r '.accessToken')

if [ -n "$ADMIN_TOKEN" ] && [ "$ADMIN_TOKEN" != "null" ]; then
  pass "Access token received"
else
  fail "No access token in response"
  echo -e "\n${RED}Cannot continue without admin token.${RESET}"
  echo "Run:  node scripts/seedAdmin.js \"$ADMIN_PASS\" --reset"
  exit 1
fi

assert_field ".user.role" "admin" "Logged-in user role is 'admin'"
assert_field ".user.isFirstLogin" "false" "Admin isFirstLogin is false"

# ── 3. Auth: get current user & role guard ─────────────────────────────────────
section "3 · Auth — /me & role guard"

req GET "$BASE/auth/me" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
assert_code 200 "GET /auth/me with valid token"
assert_field ".user.email" "$ADMIN_EMAIL" "Current user email correct"

# Admin token rejected on portal routes
req GET "$BASE/portal/projects" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
assert_code 403 "Admin token rejected on portal route (wrong role)"

# ── 4. Dashboard stats ─────────────────────────────────────────────────────────
section "4 · Dashboard stats"

req GET "$BASE/admin/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
assert_code 200 "GET /admin/stats"
assert_not_empty ".totalClients"   "totalClients field present"
assert_not_empty ".activeProjects" "activeProjects field present"
assert_not_empty ".openTickets"    "openTickets field present"

# ── 5. Client CRUD ─────────────────────────────────────────────────────────────
section "5 · Client management"

req POST "$BASE/admin/clients" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Arjun Mehta\",\"email\":\"$CLIENT_EMAIL\",\"password\":\"$CLIENT_PASS\",\"company\":\"Mehta Ventures\",\"phone\":\"+91 98765 43210\",\"industry\":\"E-Commerce\"}"

assert_code 201 "Create client"
CLIENT_ID=$(echo "$BODY" | $JQ -r '.client._id')
assert_not_empty ".client._id" "Client ID returned"
info "Client ID: $CLIENT_ID"

req GET "$BASE/admin/clients" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
assert_code 200 "List clients"

req GET "$BASE/admin/clients/$CLIENT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
assert_code 200 "Get single client"
assert_field ".client.company" "Mehta Ventures" "Client company correct"

# Duplicate email rejected
req POST "$BASE/admin/clients" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Dupe\",\"email\":\"$CLIENT_EMAIL\",\"password\":\"pass1234\"}"
assert_code 400 "Duplicate email rejected"

# ── 6. Project CRUD ────────────────────────────────────────────────────────────
section "6 · Project management"

req POST "$BASE/admin/projects" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Mehta E-Commerce Platform\",\"description\":\"Full-stack e-commerce\",\"client\":\"$CLIENT_ID\",\"startDate\":\"2026-04-15\",\"endDate\":\"2026-07-31\"}"

assert_code 201 "Create project"
PROJECT_ID=$(echo "$BODY" | $JQ -r '.project._id')
assert_not_empty ".project._id" "Project ID returned"
info "Project ID: $PROJECT_ID"

# Add milestones + demo link + set status active
req PUT "$BASE/admin/projects/$PROJECT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"active","milestones":[{"title":"Requirements","completed":true},{"title":"UI Design","completed":false},{"title":"Development","completed":false},{"title":"QA","completed":false}],"demoLinks":[{"label":"Staging","url":"https://staging.example.com"}],"notes":"Internal note: client prefers teal palette."}'

assert_code 200 "Update project (status + milestones + demo link)"
assert_field ".project.status" "active" "Project status set to active"

# Deactivate client blocked by active project
req DELETE "$BASE/admin/clients/$CLIENT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
assert_code 400 "Deactivate client with active project is blocked"

req GET "$BASE/admin/projects/$PROJECT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
assert_code 200 "Get project by ID"
assert_field ".project.milestones | length" "4" "4 milestones present"

# ── 7. File management ─────────────────────────────────────────────────────────
section "7 · File management"

req POST "$BASE/admin/files/upload" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "file=@/tmp/vt_test.pdf" \
  -F "project=$PROJECT_ID" \
  -F "isPublic=false"

assert_code 201 "Upload file"
FILE_ID=$(echo "$BODY" | $JQ -r '.file._id')
assert_not_empty ".file._id" "File ID returned"
assert_field ".file.isPublic" "false" "File is internal by default"

# Toggle to public
req PATCH "$BASE/admin/files/$FILE_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isPublic":true}'
assert_code 200 "Toggle file to public"
assert_field ".file.isPublic" "true" "File is now public"

# List files for project
req GET "$BASE/admin/files?project=$PROJECT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
assert_code 200 "List project files"

# Reject disallowed file type
echo "fake exe" > /tmp/vt_bad.exe
req POST "$BASE/admin/files/upload" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "file=@/tmp/vt_bad.exe"
assert_code 400 "Upload of disallowed file type rejected"

# ── 8. Status updates ──────────────────────────────────────────────────────────
section "8 · Status updates"

req POST "$BASE/admin/status-updates" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Maintenance window","message":"Brief downtime Sunday 2am-4am IST.","type":"warning"}'
assert_code 201 "Create global status update"
assert_field ".update.project" "null" "Global update has no project (null)"

req POST "$BASE/admin/status-updates" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"UI designs approved\",\"message\":\"Your designs have been signed off. Development begins Monday.\",\"type\":\"success\",\"project\":\"$PROJECT_ID\"}"
assert_code 201 "Create project-specific status update"
STATUS_ID=$(echo "$BODY" | $JQ -r '.update._id')

req GET "$BASE/admin/status-updates" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
assert_code 200 "List status updates"

# Missing required fields
req POST "$BASE/admin/status-updates" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"info"}'
assert_code 400 "Status update without title/message rejected"

# ── 9. Client login ────────────────────────────────────────────────────────────
section "9 · Client login & onboarding"

req POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -c "$CLIENT_COOKIE" \
  -d "{\"email\":\"$CLIENT_EMAIL\",\"password\":\"$CLIENT_PASS\"}"

assert_code 200 "Client login succeeds"
CLIENT_TOKEN=$(echo "$BODY" | $JQ -r '.accessToken')
assert_not_empty ".accessToken" "Client access token received"
assert_field ".user.role" "client" "Logged-in user role is 'client'"
assert_field ".user.isFirstLogin" "true" "isFirstLogin is true on first login"
info "Client token: ${CLIENT_TOKEN:0:20}..."

# Client token rejected on admin routes
req GET "$BASE/admin/stats" \
  -H "Authorization: Bearer $CLIENT_TOKEN"
assert_code 403 "Client token rejected on admin route"

# Complete onboarding
req PATCH "$BASE/portal/onboarding-complete" \
  -H "Authorization: Bearer $CLIENT_TOKEN"
assert_code 200 "Complete onboarding"

req GET "$BASE/auth/me" \
  -H "Authorization: Bearer $CLIENT_TOKEN"
assert_field ".user.isFirstLogin" "false" "isFirstLogin is false after onboarding"

# ── 10. Client portal — projects & updates ─────────────────────────────────────
section "10 · Client portal — projects & status"

req GET "$BASE/portal/projects" \
  -H "Authorization: Bearer $CLIENT_TOKEN"
assert_code 200 "Client gets their projects"
assert_field ".projects | length" "1" "Client sees exactly 1 project"
assert_field ".projects[0].status" "active" "Project status is active"

req GET "$BASE/portal/status-updates" \
  -H "Authorization: Bearer $CLIENT_TOKEN"
assert_code 200 "Client gets status updates"
# Should see both global + project-specific
COUNT=$(echo "$BODY" | $JQ '.updates | length')
if [ "$COUNT" -ge 2 ]; then pass "Client sees global + project updates ($COUNT total)";
else fail "Expected ≥2 updates, got $COUNT"; fi

# ── 11. Requirements ───────────────────────────────────────────────────────────
section "11 · Requirements submission"

req POST "$BASE/portal/requirements" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"project\":\"$PROJECT_ID\",\"vision\":\"Build a full-featured e-commerce platform for selling handmade jewelry. Customers browse, filter, cart, and pay online.\",\"targetAudience\":\"Women 20-45 interested in sustainable fashion\",\"goals\":[\"Easy discovery\",\"Mobile checkout\",\"Admin panel\"],\"designPreferences\":{\"style\":\"minimal\",\"colorPreference\":\"Rose gold and white\",\"referenceWebsites\":[\"https://mejuri.com\"]},\"features\":[\"Product catalog\",\"Cart\",\"Stripe\",\"Order tracking\"],\"additionalNotes\":\"Mobile-first is critical.\"}"

assert_code 200 "Save requirements draft"
REQS_ID=$(echo "$BODY" | $JQ -r '.requirements._id')
assert_not_empty ".requirements._id" "Requirements ID returned"
assert_field ".requirements.status" "draft" "Requirements status is draft"
info "Requirements ID: $REQS_ID"

# Submit requirements (locks the form)
req PATCH "$BASE/portal/requirements/$REQS_ID" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"submitted"}'
assert_code 200 "Submit requirements"
assert_field ".requirements.status" "submitted" "Requirements status changed to submitted"

# Try to edit after submit — should be blocked
req PATCH "$BASE/portal/requirements/$REQS_ID" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vision":"Trying to change after submit"}'
assert_code 400 "Editing submitted requirements is blocked"

# Try saving duplicate for same project — should update not duplicate
req POST "$BASE/portal/requirements" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"project\":\"$PROJECT_ID\",\"vision\":\"Another vision\"}"
assert_code 400 "Second submit for same project blocked (already submitted)"

# Admin views requirements
req GET "$BASE/admin/projects/$PROJECT_ID/requirements" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
assert_code 200 "Admin views project requirements"
assert_field ".requirements.status" "submitted" "Admin sees submitted status"
assert_not_empty ".requirements.vision" "Admin sees vision text"

# ── 12. Support tickets ────────────────────────────────────────────────────────
section "12 · Support tickets"

req POST "$BASE/portal/support" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"project\":\"$PROJECT_ID\",\"subject\":\"Can we add a wishlist feature?\",\"message\":\"We'd like customers to save products. Is this in scope?\",\"category\":\"change-request\"}"
assert_code 201 "Create support ticket"
TICKET_ID=$(echo "$BODY" | $JQ -r '.ticket._id')
assert_field ".ticket.status" "open" "New ticket status is open"
info "Ticket ID: $TICKET_ID"

# Missing required fields
req POST "$BASE/portal/support" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category":"general"}'
assert_code 400 "Ticket without subject/message rejected"

req GET "$BASE/portal/support" \
  -H "Authorization: Bearer $CLIENT_TOKEN"
assert_code 200 "Client lists their tickets"
assert_field ".tickets | length" "1" "Client sees 1 ticket"

req GET "$BASE/admin/support" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
assert_code 200 "Admin lists all tickets"

# Admin responds
req PATCH "$BASE/admin/support/$TICKET_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"adminResponse":"Wishlist is scoped for Phase 2. ETA shared by Friday.","status":"resolved"}'
assert_code 200 "Admin responds to ticket"
assert_field ".ticket.status" "resolved" "Ticket status updated to resolved"

# Client sees the response
req GET "$BASE/portal/support" \
  -H "Authorization: Bearer $CLIENT_TOKEN"
assert_field ".tickets[0].status" "resolved" "Client sees resolved ticket"
assert_not_empty ".tickets[0].adminResponse" "Client sees admin response"

# ── 13. Feedback ───────────────────────────────────────────────────────────────
section "13 · Feedback"

# Try feedback before project is delivered
req POST "$BASE/portal/feedback" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"project\":\"$PROJECT_ID\",\"rating\":5,\"communication\":5,\"quality\":4,\"timeliness\":4,\"comments\":\"Great work!\"}"
assert_code 400 "Feedback blocked before project delivery"

# Admin delivers the project
req PUT "$BASE/admin/projects/$PROJECT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"delivered"}'
assert_code 200 "Admin sets project status to delivered"

# Now feedback works
req POST "$BASE/portal/feedback" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"project\":\"$PROJECT_ID\",\"rating\":5,\"communication\":5,\"quality\":4,\"timeliness\":4,\"comments\":\"Excellent work! Very responsive team.\"}"
assert_code 201 "Submit feedback after delivery"
assert_field ".feedback.rating" "5" "Rating saved correctly"

# Duplicate feedback blocked
req POST "$BASE/portal/feedback" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"project\":\"$PROJECT_ID\",\"rating\":3,\"communication\":3,\"quality\":3,\"timeliness\":3}"
assert_code 400 "Duplicate feedback submission blocked"

# Admin views + marks public
req GET "$BASE/admin/feedback" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
assert_code 200 "Admin lists all feedback"
FEEDBACK_ID=$(echo "$BODY" | $JQ -r '.feedback[0]._id')

req PATCH "$BASE/admin/feedback/$FEEDBACK_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isPublic":true}'
assert_code 200 "Admin marks feedback as public"
assert_field ".feedback.isPublic" "true" "Feedback is now public"

# ── 14. Token refresh & logout ─────────────────────────────────────────────────
section "14 · Token refresh & logout"

req GET "$BASE/auth/me" \
  -H "Authorization: Bearer garbage.token.xyz"
assert_code 401 "Garbage token rejected"

# Refresh using httpOnly cookie
req POST "$BASE/auth/refresh" \
  -b "$ADMIN_COOKIE" -c "$ADMIN_COOKIE"
assert_code 200 "Token refresh with valid cookie"
assert_not_empty ".accessToken" "New access token issued on refresh"
NEW_ADMIN_TOKEN=$(echo "$BODY" | $JQ -r '.accessToken')

# Logout
req POST "$BASE/auth/logout" \
  -H "Authorization: Bearer $NEW_ADMIN_TOKEN" \
  -b "$ADMIN_COOKIE" -c "$ADMIN_COOKIE"
assert_code 200 "Logout succeeds"

# Refresh after logout should fail
req POST "$BASE/auth/refresh" \
  -b "$ADMIN_COOKIE"
assert_code 401 "Refresh after logout is rejected"

# ── 15. Security checks ────────────────────────────────────────────────────────
section "15 · Security hardening"

# NoSQL injection in login body
req POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":{"$gt":""},"password":"anything"}'
# Should be 400 (validation) or 401 (sanitized, no match) — NOT 200
if [ "$HTTP_CODE" != "200" ]; then pass "NoSQL injection in login body rejected (HTTP $HTTP_CODE)";
else fail "NoSQL injection returned 200 — sanitization may not be working"; fi

# Check security headers are present
HEADERS=$(curl -sI "$BASE/health" -H "Authorization: Bearer $ADMIN_TOKEN")
if echo "$HEADERS" | grep -qi "x-content-type-options"; then
  pass "Security headers present (helmet active)"
else
  fail "Security headers missing — helmet may not be loaded"
fi

# ── 16. Cleanup ────────────────────────────────────────────────────────────────
section "16 · Cleanup"
rm -f /tmp/vt_test.pdf /tmp/vt_bad.exe "$ADMIN_COOKIE" "$CLIENT_COOKIE"
pass "Temp files and cookie jars removed"

# ── Summary ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BOLD}Test Results${RESET}"
echo -e "  ${GREEN}Passed : $PASS${RESET}"
if [ $FAIL -gt 0 ]; then
  echo -e "  ${RED}Failed : $FAIL${RESET}"
else
  echo -e "  ${GREEN}Failed : $FAIL${RESET}"
fi
if [ $SKIP -gt 0 ]; then
  echo -e "  ${YELLOW}Skipped: $SKIP${RESET}"
fi
TOTAL=$((PASS + FAIL + SKIP))
echo -e "  Total  : $TOTAL"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

if [ $FAIL -eq 0 ]; then
  echo -e "\n${GREEN}${BOLD}All tests passed! ✓${RESET}\n"
  exit 0
else
  echo -e "\n${RED}${BOLD}$FAIL test(s) failed. See output above.${RESET}\n"
  exit 1
fi
