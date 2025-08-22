export async function getFileOutputFormatting() {
    return /** markdown */ `

## File Output Foramtting

- if you want to create file
[MyDearTag action="create-file" file="{file_path_name}" summary="{file_summary}"]
{file_content}
[/MyDearTag]

- if you want to remove file
[MyDearTag action="remove-file" file="{file_path_name}" summary="{file_summary}"][/MyDearTag]

- if you want to update file
[MyDearTag action="update-file" file="{file_path_name}" summary="{file_summary}"]
{file_content}
[/MyDearTag]

- {file_path_name} is the file path name
- {file_summary} is the overview, purpose and summary of the file_content file
- {file_content} is the file_content of the file

- if there is an existing file, then you can use [MyDearTag action="update-file" ...]
- if there is no existing file, then you can [MyDearTag action="create-file" ...]
- if you need to remove existing file, then you can [MyDearTag action="remove-file" ...]

Remove any React.js Files that are not used.

`;
}
