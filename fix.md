Assignment strategy field mismatch
Route validator expects useAIAssignment.
Controller reads useRuleBasedAssignment.
Patch: accept one canonical field, for example assignmentMode with enum manual | rule-based | ai.
Benefit: no adapter hacks in frontend.
Validation error shape inconsistency
Some endpoints return { errors: [...] }.
Others return { success, message, errors }.
Patch: standardize response envelope for all validation errors.
Benefit: one error parser in frontend.
Task list filter parity gap
Frontend sends search, dueDate, riskLevel.
Controller currently applies only status, employeeId, priority.
Patch: implement and validate search, dueDate range, riskLevel, sort fields.
Benefit: enterprise list filtering works server-side at scale.
Identifier consistency
Mixed id and _id returned across task endpoints.
Patch: normalize DTO output to one id field plus optional rawId if needed.
Benefit: removes repetitive frontend fallback mapping.
Template list validation missing includeInactive
Controller supports includeInactive.
Validator does not validate includeInactive.
Patch: add query includeInactive boolean validation.
Benefit: predictable filtering behavior and fewer bad requests.
History feed schema enrichment
Patch: include normalized event payload with eventType, actor, task, summary, meta, createdAt.
Benefit: timeline UI can be deterministic without defensive parsing.
Pagination/sorting standards
Patch: all list endpoints should accept page, limit, sortBy, sortDir with shared helper.
Benefit: consistent data access across templates, history, tasks.
API versioning and contracts
Patch: introduce versioned DTO shapes under /v1 if possible.
Benefit: safe evolution without breaking frontend.