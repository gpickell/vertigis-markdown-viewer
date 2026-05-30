# CLI Examples

CLI blocks get one copy button per command span, while comment lines stay informational.

## Single-line commands

```bash
# Start a static server in the repository root
python -m http.server 4173

# Open the viewer in a browser
start http://localhost:4173/
```

## Multiline commands

Clicking any copied line in the command span copies the whole command when continuation markers are used.

```bash
gh repo clone gpickell/vertigis-markdown-viewer \
  -- --depth=1 \
  --config core.autocrlf=false
```

```powershell
gh repo clone gpickell/vertigis-markdown-viewer `
  -- --depth=1 `
  --config core.autocrlf=false
```

## PowerShell

```powershell
# Serve the repository
python -m http.server 4173

# Confirm the viewer loads
Invoke-WebRequest http://localhost:4173/ | Select-Object -ExpandProperty StatusCode
```

## Notes

Regular code blocks still get whole-block copy buttons and a code-type header:

```json
{
  "overview": "./docs/overview.md",
  "cli": "./docs/cli.md"
}
```

## Related page

Jump back to the [overview page](./overview.md#feature-summary).
