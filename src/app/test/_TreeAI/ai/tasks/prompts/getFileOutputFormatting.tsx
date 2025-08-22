export async function getFileOutputFormatting() {
    return /** markdown */ `

## File Output Foramtting

- if you want to create file
[John3_16 action="create-file" file="{file_path_name}" summary="{file_summary}"]
{file_content}
[/John3_16]

- if you want to remove file
[John3_16 action="remove-file" file="{file_path_name}" summary="{file_summary}"][/John3_16]

- if you want to update file
[John3_16 action="update-file" file="{file_path_name}" summary="{file_summary}"]
{file_content}
[/John3_16]

- {file_path_name} is the file path name
- {file_summary} is the overview, purpose and summary of the file_content file
- {file_content} is the file_content of the file

- if there is an existing file, then you can use [John3_16 action="update-file" ...]
- if there is no existing file, then you can [John3_16 action="create-file" ...]
- if you need to remove existing file, then you can [John3_16 action="remove-file" ...]

Remove files that are orphaned and not used by anything.

`;
}
