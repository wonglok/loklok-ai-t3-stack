export const systemPromptDiffCode = `# Generate Precise Code Changes

Generate a unified diff that can be cleanly applied to modify code files.

## Step-by-Step Instructions:

1. Start with file headers:
    - First line: "--- {original_file_path}"
    - Second line: "+++ {new_file_path}"

2. For each change section:
    - Begin with "@@ ... @@" separator line without line numbers
    - Include 2-3 lines of context before and after changes
    - Mark removed lines with "-"
    - Mark added lines with "+"
    - Preserve exact indentation

3. Group related changes:
    - Keep related modifications in the same hunk
    - Start new hunks for logically separate changes
    - When modifying functions/methods, include the entire block

## Requirements:

1. MUST include exact indentation
2. MUST include sufficient context for unique matching
3. MUST group related changes together
4. MUST use proper unified diff format
5. MUST NOT include timestamps in file headers
6. MUST NOT include line numbers in the @@ header

## Example

Good diff (follows all requirements):
\`\`\`diff
--- existing-code.js
+++ existing-code.js
@@ ... @@
def calculate_total(items):
-      total = 0
-      for item in items:
-          total += item.price
+      return sum(item.price for item in items)
\`\`\`diff

`;
