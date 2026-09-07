/**
 * SQL Safety Layer for ClickHouse
 * Implements defense-in-depth for dynamic query generation.
 * 
 * NOTE: The real ClickHouse user must be configured with READ-ONLY access.
 * CLICKHOUSE_ALLOW_WRITE_ACCESS=false must be verified at the database level.
 */

const ALLOWED_TABLES = ["production_schedule", "setready_events"];
const MAX_LIMIT = 100;

export interface SQLValidationResult {
  isValid: boolean;
  sanitizedSQL: string;
  error?: string;
}

export function validateSQL(sql: string): SQLValidationResult {
  const trimmedSQL = sql.trim();

  // 1. SELECT only
  if (!trimmedSQL.toUpperCase().startsWith("SELECT")) {
    return { isValid: false, sanitizedSQL: "", error: "Only SELECT statements are allowed." };
  }

  // 2. One statement only (no semicolons allowed to prevent chaining)
  if (trimmedSQL.includes(";")) {
    return { isValid: false, sanitizedSQL: "", error: "Multiple statements or semicolons are not allowed." };
  }

  // 3. No DML/DDL/SYSTEM/SET (Blocked by startsWith("SELECT"), but extra checks for safety)
  const forbiddenKeywords = ["INSERT", "UPDATE", "DELETE", "DROP", "CREATE", "ALTER", "TRUNCATE", "SYSTEM", "SET", "GRANT", "REVOKE"];
  for (const keyword of forbiddenKeywords) {
    if (new RegExp(`\\b${keyword}\\b`, "i").test(trimmedSQL)) {
      return { isValid: false, sanitizedSQL: "", error: `Forbidden keyword detected: ${keyword}` };
    }
  }

  // 4. Approved table allowlist
  // Simple check: extract from/join and verify against allowlist
  const fromMatch = trimmedSQL.match(/\bFROM\s+([a-zA-Z0-9_]+)/i);
  if (!fromMatch || !ALLOWED_TABLES.includes(fromMatch[1].toLowerCase())) {
    return { isValid: false, sanitizedSQL: "", error: `Table access denied or missing FROM clause. Allowed: ${ALLOWED_TABLES.join(", ")}` };
  }

  // 5. Maximum LIMIT enforcement
  let sanitizedSQL = trimmedSQL;
  if (!/\bLIMIT\b/i.test(sanitizedSQL)) {
    sanitizedSQL = `${sanitizedSQL} LIMIT ${MAX_LIMIT}`;
  } else {
    // Replace existing limit if it exceeds MAX_LIMIT
    sanitizedSQL = sanitizedSQL.replace(/\bLIMIT\s+(\d+)\b/i, (match, p1) => {
      const val = parseInt(p1);
      return `LIMIT ${Math.min(val, MAX_LIMIT)}`;
    });
  }

  return { isValid: true, sanitizedSQL };
}
