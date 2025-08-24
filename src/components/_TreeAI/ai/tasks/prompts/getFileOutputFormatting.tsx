export async function getFileOutputFormatting() {
    return /** markdown */ `

## File Output Foramtting

- if you want to create file
[TJ_TAG action="create-file" file="{file_path_name}" summary="{file_summary}"]
{file_content}
[/TJ_TAG]

- if you want to remove file
[TJ_TAG action="remove-file" file="{file_path_name}" summary="{file_summary}"][/TJ_TAG]

- if you want to update file
[TJ_TAG action="update-file" file="{file_path_name}" summary="{file_summary}"]
{file_content}
[/TJ_TAG]

- {file_path_name} is the file path name
- {file_content} is the file content of the file, unwwrapping \`\`\`ts or \`\`\`js
- {file_summary} is the overview, purpose and summary of the {file_content}

- if there is an existing file, then you can use [TJ_TAG action="update-file" ...]
- if there is no existing file, then you can [TJ_TAG action="create-file" ...]
- if you need to remove existing file, then you can [TJ_TAG action="remove-file" ...]

Remove files that are orphaned and not used by anything.

`;
}
