$ErrorActionPreference = "Stop"

$base = "https://localhost:7008/api"
$work = Join-Path $env:TEMP "ProjectM-e2e-$([guid]::NewGuid())"
$bb = Join-Path $work "body.txt"
$st = Join-Path $work "status.txt"
$email = $env:PROJECTM_TEST_EMAIL
$password = $env:PROJECTM_TEST_PASSWORD

if ([string]::IsNullOrWhiteSpace($email) -or [string]::IsNullOrWhiteSpace($password)) {
    throw "Set PROJECTM_TEST_EMAIL and PROJECTM_TEST_PASSWORD before running this script."
}

New-Item -ItemType Directory -Path $work | Out-Null

function Invoke-Post([string]$url, [string]$jsonFile, [string]$tok) {
    curl.exe -k -sS -o $bb -w "%{http_code}" -X POST "$base/$url" -H "Content-Type: application/json" -H "Authorization: Bearer $tok" -d "@$jsonFile" | Set-Content -Path $st -NoNewline -Encoding ASCII
    return (@((Get-Content $st -Raw -Encoding ASCII), (Get-Content $bb -Raw -Encoding UTF8)))
}

function Invoke-Get([string]$url, [string]$tok) {
    curl.exe -k -sS -o $bb -w "%{http_code}" -H "Authorization: Bearer $tok" "$base/$url" | Set-Content -Path $st -NoNewline -Encoding ASCII
    return (@((Get-Content $st -Raw -Encoding ASCII), (Get-Content $bb -Raw -Encoding UTF8)))
}

try {
    # Login
    $loginFile = Join-Path $work "login.json"
    [System.IO.File]::WriteAllText($loginFile, (@{ email = $email; password = $password } | ConvertTo-Json))
    $c, $b = Invoke-Post "Users/login" $loginFile ""
    $lr = $b | ConvertFrom-Json
    $tok = $lr.token
    Write-Host ("LOGIN http=$c email=$($lr.user.email) role=$($lr.user.role) tokenLen=$($tok.Length) refresh=$($lr.RefreshToken -ne $null) exp=$($lr.ExpiresAt)")

    # POST ClientCompany
    $clientCompanyFile = Join-Path $work "client-company.json"
    [System.IO.File]::WriteAllText($clientCompanyFile, '{"userId":9,"companyName":"Acme Corp","address":"123 Main St","city":"Lagos","state":"Lagos","country":"Nigeria","postalCode":"100001","trn":"TRN-001","industry":"Manufacturing"}')
    $c, $b = Invoke-Post "ClientCompanies" $clientCompanyFile $tok
    Write-Host "`nPOST /ClientCompanies http=$c"
    Write-Host $b

    $c, $b = Invoke-Get "ClientCompanies" $tok
    Write-Host "`nGET /ClientCompanies http=$c"
    Write-Host $b

    # POST Repair
    $repairFile = Join-Path $work "repair.json"
    [System.IO.File]::WriteAllText($repairFile, '{"clientId":1,"equipmentName":"Hydraulic Press #4","equipmentSerial":"HP4-2026","issueDescription":"Seal leak on cylinder","priority":"High","notes":"Urgent - production line down"}')
    $c, $b = Invoke-Post "Repairs" $repairFile $tok
    Write-Host "`nPOST /Repairs http=$c"
    Write-Host $b
    $rid = ($b | ConvertFrom-Json).id
    Write-Host "repairId=$rid"

    $c, $b = Invoke-Get "Repairs" $tok
    Write-Host "`nGET /Repairs http=$c"
    Write-Host $b

    # POST PFI
    $pfiFile = Join-Path $work "pfi.json"
    $pfiJson = @{ repairId = $rid; lineItems = @( @{ description = "Cylinder seal 12mm"; quantity = 1; unitPrice = 25000 } ) } |
        ConvertTo-Json -Depth 5
    [System.IO.File]::WriteAllText($pfiFile, $pfiJson)
    $c, $b = Invoke-Post "PFIs" $pfiFile $tok
    Write-Host "`nPOST /PFIs http=$c"
    Write-Host $b

    $c, $b = Invoke-Get "PFIs" $tok
    Write-Host "`nGET /PFIs http=$c"
    Write-Host $b

    $c, $b = Invoke-Get "Repairs/$rid" $tok
    Write-Host "`nGET /Repairs/$rid http=$c"
    Write-Host $b
}
finally {
    Remove-Item -LiteralPath $work -Recurse -Force
}
