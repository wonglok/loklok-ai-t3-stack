export async function getFileOutputFormatting() {
    return /** markdown */ `

## File Output Foramtting

- if you want to create file
[mydearlokloktag action="create-file" file="{file_path_name}" summary="{file_summary}"]
{file_content}
[/mydearlokloktag]

- if you want to remove file
[mydearlokloktag action="remove-file" file="{file_path_name}" summary="{file_summary}"][/mydearlokloktag]

- if you want to update file
[mydearlokloktag action="update-file" file="{file_path_name}" summary="{file_summary}"]
{file_content}
[/mydearlokloktag]

- {file_path_name} is the file path name
- {file_summary} is the overview, purpose and summary of the file_content file
- {file_content} is the file_content of the file

- if there is an existing file, then you can use [mydearlokloktag action="update-file" ...]
- if there is no existing file, then you can [mydearlokloktag action="create-file" ...]
- if you need to remove existing file, then you can [mydearlokloktag action="remove-file" ...]


`;
}
