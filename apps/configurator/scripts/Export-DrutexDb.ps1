$ErrorActionPreference = "Stop"

$connectionString = "Server=.\CANTOR2019;Database=DRUTEX_DEALER;Integrated Security=True;"
$conn = New-Object System.Data.SqlClient.SqlConnection($connectionString)
$conn.Open()

function Export-Table {
    param([string]$TableName, [string]$OutFile)
    Write-Host "Exporting $TableName to $OutFile..."
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = "SELECT * FROM $TableName"
    $reader = $cmd.ExecuteReader()
    $dt = New-Object System.Data.DataTable
    $dt.Load($reader)
    
    if ($dt.Rows.Count -gt 0) {
        $result = @()
        foreach ($row in $dt.Rows) {
            $obj = @{}
            foreach ($col in $dt.Columns) {
                $val = $row[$col.ColumnName]
                if ($val -is [System.DBNull]) {
                    $obj[$col.ColumnName] = $null
                } else {
                    $obj[$col.ColumnName] = $val
                }
            }
            $result += $obj
        }
        $result | ConvertTo-Json -Depth 10 | Out-File $OutFile -Encoding UTF8
    } else {
        "[]" | Out-File $OutFile -Encoding UTF8
    }
}

# 1. Export all CUSTOM_ tables
Write-Host "Fetching CUSTOM_ tables list..."
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE' AND TABLE_NAME LIKE 'CUSTOM_%'"
$reader = $cmd.ExecuteReader()
$customTables = @()
while ($reader.Read()) {
    $customTables += $reader.GetString(0)
}
$reader.Close()

$customData = @{}
foreach ($table in $customTables) {
    Write-Host "Fetching $table..."
    $cmd2 = $conn.CreateCommand()
    $cmd2.CommandText = "SELECT * FROM $table"
    $r2 = $cmd2.ExecuteReader()
    $dt2 = New-Object System.Data.DataTable
    $dt2.Load($r2)
    
    $tableData = @()
    foreach ($row in $dt2.Rows) {
        $obj = @{}
        foreach ($col in $dt2.Columns) {
            $val = $row[$col.ColumnName]
            if ($val -is [System.DBNull]) {
                $obj[$col.ColumnName] = $null
            } else {
                if ($val -is [System.DateTime]) {
                    $obj[$col.ColumnName] = $val.ToString("yyyy-MM-ddTHH:mm:ss")
                } else {
                    $obj[$col.ColumnName] = $val
                }
            }
        }
        $tableData += $obj
    }
    $customData[$table] = $tableData
}

Write-Host "Saving custom tables to drutex_custom_tables.json..."
$customData | ConvertTo-Json -Depth 10 | Out-File "c:\Users\Shadow\.gemini\antigravity\scratch\fantastic-octo-giggle\scripts\drutex_custom_tables.json" -Encoding UTF8

Export-Table "PREISE" "c:\Users\Shadow\.gemini\antigravity\scratch\fantastic-octo-giggle\scripts\drutex_preise.json"
Export-Table "PREISGRUPPE" "c:\Users\Shadow\.gemini\antigravity\scratch\fantastic-octo-giggle\scripts\drutex_preisgruppe.json"
Export-Table "ARTIKEL" "c:\Users\Shadow\.gemini\antigravity\scratch\fantastic-octo-giggle\scripts\drutex_artikel.json"
Export-Table "ARTPREISE" "c:\Users\Shadow\.gemini\antigravity\scratch\fantastic-octo-giggle\scripts\drutex_artpreise.json"
Export-Table "FARBEN" "c:\Users\Shadow\.gemini\antigravity\scratch\fantastic-octo-giggle\scripts\drutex_farben.json"
Export-Table "TEXTE" "c:\Users\Shadow\.gemini\antigravity\scratch\fantastic-octo-giggle\scripts\drutex_texte.json"

$conn.Close()
Write-Host "Done!"
