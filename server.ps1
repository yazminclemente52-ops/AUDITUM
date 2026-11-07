param([int]$Port = 8080)

$root = $PSScriptRoot
$sheetId = "1_2bdHpIZYeXUySb1FLOYHt15__Yqgb3uLsD0afsiBQw"

# ==================== GOOGLE CLOUD SERVICE ACCOUNT OAUTH2 ====================
$credFile = Get-ChildItem -Path $root -Filter "*.json" | Where-Object { 
    $_.Name -like "auditum-calidad-*.json" -or $_.Name -eq "service_account.json"
} | Select-Object -First 1

$global:serviceAccountEmail = ""
$global:projectId = ""
$global:credObj = $null
$global:cachedToken = ""
$global:tokenExpiry = 0

if ($credFile) {
    try {
        $global:credObj = Get-Content -Raw $credFile.FullName | ConvertFrom-Json
        $global:serviceAccountEmail = $global:credObj.client_email
        $global:projectId = $global:credObj.project_id
        Write-Host "GOOGLE_CREDENTIALS_LOADED: $($global:serviceAccountEmail) [Project: $($global:projectId)]"
    } catch {
        Write-Host "WARNING: Failed to parse credentials JSON: $_"
    }
} else {
    Write-Host "WARNING: No service account JSON file found in $root"
}

function Base64UrlEncode([byte[]]$bytes) {
    [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
}

function Coalesce($val, $defaultVal) {
    if ($val -ne $null -and [string]$val -ne "") { return [string]$val }
    return [string]$defaultVal
}

function Get-GoogleAccessToken {
    if (-not $global:credObj) { return $null }
    
    $now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    if ($global:cachedToken -and $global:tokenExpiry -gt ($now + 120)) {
        return $global:cachedToken
    }

    try {
        $header = @{ alg = "RS256"; typ = "JWT" } | ConvertTo-Json -Compress
        $headerB64 = Base64UrlEncode ([System.Text.Encoding]::UTF8.GetBytes($header))

        $claims = @{
            iss = $global:credObj.client_email
            scope = "https://www.googleapis.com/auth/spreadsheets"
            aud = "https://oauth2.googleapis.com/token"
            exp = $now + 3600
            iat = $now
        } | ConvertTo-Json -Compress
        $claimsB64 = Base64UrlEncode ([System.Text.Encoding]::UTF8.GetBytes($claims))

        $rawSignatureInput = "$headerB64.$claimsB64"
        $signatureInputBytes = [System.Text.Encoding]::UTF8.GetBytes($rawSignatureInput)

        $pem = $global:credObj.private_key
        $cleanKey = $pem -replace "-----BEGIN PRIVATE KEY-----", "" -replace "-----END PRIVATE KEY-----", "" -replace "`r", "" -replace "`n", ""
        $keyBytes = [System.Convert]::FromBase64String($cleanKey)

        $cngKey = [System.Security.Cryptography.CngKey]::Import($keyBytes, [System.Security.Cryptography.CngKeyBlobFormat]::Pkcs8PrivateBlob)
        $rsa = New-Object System.Security.Cryptography.RSACng($cngKey)
        $signatureBytes = $rsa.SignData($signatureInputBytes, [System.Security.Cryptography.HashAlgorithmName]::SHA256, [System.Security.Cryptography.RSASignaturePadding]::Pkcs1)
        $signatureB64 = Base64UrlEncode $signatureBytes

        $jwt = "$rawSignatureInput.$signatureB64"
        $body = @{
            grant_type = "urn:ietf:params:oauth:grant-type:jwt-bearer"
            assertion = $jwt
        }

        $res = Invoke-RestMethod -Uri "https://oauth2.googleapis.com/token" -Method Post -Body $body
        $global:cachedToken = $res.access_token
        $global:tokenExpiry = $now + 3500
        return $global:cachedToken
    } catch {
        Write-Host "ERROR acquiring Google token: $_"
        return $null
    }
}

function Append-SheetRows($range, $rowsArray) {
    $token = Get-GoogleAccessToken
    if (-not $token) { throw "No Google Access Token available" }
    
    $url = "https://sheets.googleapis.com/v4/spreadsheets/$sheetId/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS"
    $rowsJson = ($rowsArray | ForEach-Object { ($_ | ConvertTo-Json -Compress) }) -join ","
    $body = '{"range":"' + $range + '","majorDimension":"ROWS","values":[' + $rowsJson + ']}'
    
    return Invoke-RestMethod -Uri $url -Method Post -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body $body
}

function Update-InspectionRow($idInspeccion, $updatesHash) {
    $token = Get-GoogleAccessToken
    if (-not $token) { return }
    try {
        $getIdsUrl = "https://sheets.googleapis.com/v4/spreadsheets/$sheetId/values/1-TBS_INSPECCIONES!A:A"
        $res = Invoke-RestMethod -Uri $getIdsUrl -Method Get -Headers @{ Authorization = "Bearer $token" }
        $rows = $res.values
        if ($rows) {
            for ($i = 0; $i -lt $rows.Count; $i++) {
                if ($rows[$i][0] -eq $idInspeccion) {
                    $rowNum = $i + 1
                    foreach ($col in $updatesHash.Keys) {
                        $val = $updatesHash[$col]
                        $updateUrl = "https://sheets.googleapis.com/v4/spreadsheets/$sheetId/values/1-TBS_INSPECCIONES!$col$rowNum?valueInputOption=USER_ENTERED"
                        $body = '{"values":[["' + [string]$val + '"]]}'
                        Invoke-RestMethod -Uri $updateUrl -Method Put -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body $body | Out-Null
                    }
                    break
                }
            }
        }
    } catch {
        Write-Host "Warning: Could not update row in 1-TBS_INSPECCIONES: $_"
    }
}

# ==================== HTTP LISTENER ====================
$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "AUDITUM_SERVER_STARTED: $prefix"
} catch {
    $Port = 8080
    $prefix = "http://localhost:$Port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)
    $listener.Start()
    Write-Host "AUDITUM_SERVER_STARTED: $prefix"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # CORS Headers
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
        $response.AddHeader("Cache-Control", "no-cache")

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.OutputStream.Close()
            continue
        }

        $rawPath = $request.Url.LocalPath.TrimStart('/')
        
        # ==================== PRESENCE API (Lucecitas en Vivo) ====================
        if ($rawPath -eq "api/presence/heartbeat" -and $request.HttpMethod -eq "POST") {
            $response.ContentType = "application/json; charset=utf-8"
            try {
                $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
                $reqBody = $reader.ReadToEnd()
                $payload = $reqBody | ConvertFrom-Json
                $nom = [string]$payload.nomina
                if ($nom) {
                    if (-not $global:presenceMap) { $global:presenceMap = @{} }
                    $global:presenceMap[$nom] = @{
                        nomina = [int]$payload.nomina
                        nombre = [string]$payload.nombre
                        rol = [string]$payload.rol
                        turno = [string]$payload.turno
                        status = (Coalesce $payload.status "activo")
                        lastSeen = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
                    }
                }
                $resBytes = [System.Text.Encoding]::UTF8.GetBytes('{"success":true}')
                $response.ContentLength64 = $resBytes.Length
                $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
            } catch {
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes('{"success":false,"error":"' + $_.Exception.Message + '"}')
                $response.StatusCode = 500
                $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            }
            $response.OutputStream.Close()
            continue
        }

        if ($rawPath -eq "api/presence/users") {
            $response.ContentType = "application/json; charset=utf-8"
            if (-not $global:presenceMap) { $global:presenceMap = @{} }
            $nowUnix = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
            $usersArr = @()
            foreach ($key in $global:presenceMap.Keys) {
                $u = $global:presenceMap[$key]
                $diff = $nowUnix - $u.lastSeen
                $st = $u.status
                if ($diff -gt 25 -and $st -ne "desconectado") {
                    $st = "desconectado"
                    $u.status = "desconectado"
                }
                $usersArr += @{
                    nomina = $u.nomina
                    nombre = $u.nombre
                    rol = $u.rol
                    turno = $u.turno
                    status = $st
                    secondsAgo = $diff
                }
            }
            if ($usersArr.Count -eq 0) {
                $resJson = '{"success":true,"users":[]}'
            } elseif ($usersArr.Count -eq 1) {
                $itemJson = $usersArr[0] | ConvertTo-Json -Compress
                $resJson = '{"success":true,"users":[' + $itemJson + ']}'
            } else {
                $resJson = @{ success = $true; users = $usersArr } | ConvertTo-Json -Compress
            }
            $resBytes = [System.Text.Encoding]::UTF8.GetBytes($resJson)
            $response.ContentLength64 = $resBytes.Length
            $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
            $response.OutputStream.Close()
            continue
        }

        # ==================== API ENDPOINTS ====================
        if ($rawPath -eq "api/sheets/status") {
            $response.ContentType = "application/json; charset=utf-8"
            $hasToken = (Get-GoogleAccessToken) -ne $null
            $statusObj = @{
                success = $true
                connected = $hasToken
                serviceAccount = $global:serviceAccountEmail
                projectId = $global:projectId
                spreadsheetId = $sheetId
                api = "Google Sheets API v4 (Service Account)"
            }
            $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes(($statusObj | ConvertTo-Json))
            $response.ContentLength64 = $jsonBytes.Length
            $response.OutputStream.Write($jsonBytes, 0, $jsonBytes.Length)
            $response.OutputStream.Close()
            continue
        }

        if ($rawPath -eq "api/sheets/sync" -and $request.HttpMethod -eq "POST") {
            $response.ContentType = "application/json; charset=utf-8"
            try {
                $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
                $reqBody = $reader.ReadToEnd()
                $payload = $reqBody | ConvertFrom-Json
                $action = $payload.action
                $data = $payload.data
                $nowStr = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")

                Write-Host "API_SYNC_ACTION: $action for $($data.id_inspeccion)"

                switch ($action) {
                    "create_inspection" {
                        # 1. Append a 1-TBS_INSPECCIONES
                        $inspRow = @(
                            $data.id_inspeccion,
                            $nowStr,
                            $data.nomina_creador,
                            $data.numero_parte,
                            $data.modelo,
                            $data.numero_serie,
                            $data.area_ubicacion,
                            (Coalesce $data.estatus "En Proceso"),
                            (Coalesce $data.tiene_faltantes "NO"),
                            (Coalesce $data.descripcion_faltantes ""),
                            "", # fecha_liberacion
                            "", # nomina_liberador
                            (Coalesce $data.url_reporte_pdf ""),
                            "1.0"
                        )
                        Append-SheetRows -range "'1-TBS_INSPECCIONES'!A:A" -rowsArray @(,$inspRow)

                        # 2. Append turno inicial a 2.TBL_TURNOS_DETALLE
                        if ($data.turnos -and $data.turnos.Count -gt 0) {
                            $t0 = $data.turnos[0]
                            $trnRow = @(
                                (Coalesce $t0.id_turno ("TRN-" + (Get-Date -Format "yyyyMMdd-HHmmss"))),
                                $data.id_inspeccion,
                                $t0.nomina_colaborador,
                                $t0.turno,
                                (Coalesce $t0.hora_inicio $nowStr),
                                (Coalesce $t0.hora_fin $nowStr),
                                (Coalesce $t0.tiempo_minutos (Coalesce $t0.minutos 1)),
                                (Coalesce $t0.estatus_entrega "En Proceso"),
                                (Coalesce $t0.notas_traspaso (Coalesce $t0.notas "Inicio de inspección en piso"))
                            )
                            Append-SheetRows -range "'2.TBL_TURNOS_DETALLE'!A:A" -rowsArray @(,$trnRow)
                        }

                        # 3. Append fotos a 3.TBL_EVIDENCIAS_FOTOS
                        $allPhotos = @()
                        if ($data.fotos_producto) { $allPhotos += $data.fotos_producto }
                        if ($data.fotos_defecto) { $allPhotos += $data.fotos_defecto }
                        if ($data.fotos) { $allPhotos += $data.fotos }

                        if ($allPhotos.Count -gt 0) {
                            $photoRows = @()
                            foreach ($p in $allPhotos) {
                                $photoRows += ,@(
                                    (Coalesce $p.id ("FOT-" + (Get-Date -Format "yyyyMMdd-HHmmss"))),
                                    $data.id_inspeccion,
                                    (Coalesce $p.nomina $data.nomina_creador),
                                    (Coalesce $p.tipo "Producto Inspeccionado"),
                                    (Coalesce $p.url "Foto con sello de agua guardada localmente"),
                                    (Coalesce $p.timestamp $nowStr),
                                    (Coalesce $p.descripcion "")
                                )
                            }
                            Append-SheetRows -range "'3.TBL_EVIDENCIAS_FOTOS'!A:A" -rowsArray $photoRows
                        }

                        # 4. Registrar auditoria de creacion
                        $audRow = @(
                            ("AUD-" + (Get-Date -Format "yyyyMMdd-HHmmss")),
                            $data.id_inspeccion,
                            $data.nomina_creador,
                            $nowStr,
                            "Alta Inspección",
                            "N/A",
                            (Coalesce $data.estatus "En Proceso"),
                            "Apertura formal de inspección de calidad en piso"
                        )
                        Append-SheetRows -range "'6.TBL_AUDITORIA'!A:A" -rowsArray @(,$audRow)
                    }

                    "add_shift_record" {
                        $trnRow = @(
                            (Coalesce $data.id_turno ("TRN-" + (Get-Date -Format "yyyyMMdd-HHmmss"))),
                            $data.id_inspeccion,
                            $data.nomina_colaborador,
                            $data.turno,
                            (Coalesce $data.hora_inicio $nowStr),
                            (Coalesce $data.hora_fin $nowStr),
                            (Coalesce $data.tiempo_minutos (Coalesce $data.minutos 1)),
                            (Coalesce $data.estatus_entrega "Pausado por Fin de Turno"),
                            (Coalesce $data.notas_traspaso (Coalesce $data.notas "Traspaso de turno registrado"))
                        )
                        Append-SheetRows -range "'2.TBL_TURNOS_DETALLE'!A:A" -rowsArray @(,$trnRow)

                        # Actualizar estatus y faltantes en 1-TBS_INSPECCIONES
                        $updates = @{}
                        if ($data.nuevo_estatus_inspeccion) { $updates["H"] = $data.nuevo_estatus_inspeccion }
                        if ($data.tiene_faltantes) { $updates["I"] = $data.tiene_faltantes }
                        if ($data.descripcion_faltantes -ne $null) { $updates["J"] = $data.descripcion_faltantes }
                        if ($updates.Count -gt 0) {
                            Update-InspectionRow -idInspeccion $data.id_inspeccion -updatesHash $updates
                        }

                        # Si se adjuntaron fotos en el traspaso, registrarlas en 3.TBL_EVIDENCIAS_FOTOS
                        if ($data.fotos -and $data.fotos.Count -gt 0) {
                            $photoRows = @()
                            foreach ($p in $data.fotos) {
                                $photoRows += ,@(
                                    (Coalesce $p.id ("FOT-" + (Get-Date -Format "yyyyMMdd-HHmmss"))),
                                    $data.id_inspeccion,
                                    (Coalesce $p.nomina $data.nomina_colaborador),
                                    (Coalesce $p.tipo "Defecto"),
                                    (Coalesce $p.url "Foto con sello de agua guardada localmente"),
                                    (Coalesce $p.timestamp $nowStr),
                                    (Coalesce $p.descripcion "")
                                )
                            }
                            Append-SheetRows -range "'3.TBL_EVIDENCIAS_FOTOS'!A:A" -rowsArray $photoRows
                        }

                        $audRow = @(
                            ("AUD-" + (Get-Date -Format "yyyyMMdd-HHmmss")),
                            $data.id_inspeccion,
                            $data.nomina_colaborador,
                            $nowStr,
                            "Traspaso de Turno",
                            "Turno anterior",
                            $data.turno,
                            ("Intervención relevada por nómina " + $data.nomina_colaborador + ". Estatus: " + $data.estatus_entrega + $(if ($data.tiene_faltantes -eq "SI") { " (Con faltantes reportados)" } else { "" }))
                        )
                        Append-SheetRows -range "'6.TBL_AUDITORIA'!A:A" -rowsArray @(,$audRow)
                    }

                    "release_inspection" {
                        # Actualizar estado en 1-TBS_INSPECCIONES
                        Update-InspectionRow -idInspeccion $data.id_inspeccion -updatesHash @{
                            "H" = (Coalesce $data.estatus "Liberado")
                            "K" = $nowStr
                            "L" = [string]$data.nomina_liberador
                        }

                        $audRow = @(
                            ("AUD-" + (Get-Date -Format "yyyyMMdd-HHmmss")),
                            $data.id_inspeccion,
                            $data.nomina_liberador,
                            $nowStr,
                            "Estatus / Liberación",
                            "En Proceso",
                            $data.estatus,
                            (Coalesce $data.justificacion "Liberación o dictamen formal de calidad")
                        )
                        Append-SheetRows -range "'6.TBL_AUDITORIA'!A:A" -rowsArray @(,$audRow)
                    }

                    "update_inspection_with_audit" {
                        $colMap = @{
                            "Numero_Serie" = "F"
                            "Area_Ubicacion" = "G"
                            "Estatus" = "H"
                            "Tiene_Faltantes" = "I"
                            "Descripcion_Faltantes" = "J"
                        }
                        if ($colMap.ContainsKey($data.campo)) {
                            Update-InspectionRow -idInspeccion $data.id_inspeccion -updatesHash @{
                                $colMap[$data.campo] = [string]$data.nuevo
                            }
                        }

                        $audRow = @(
                            ("AUD-" + (Get-Date -Format "yyyyMMdd-HHmmss")),
                            $data.id_inspeccion,
                            $data.nomina_editor,
                            $nowStr,
                            $data.campo,
                            [string](Coalesce $data.anterior ""),
                            [string](Coalesce $data.nuevo ""),
                            (Coalesce $data.motivo "Modificación justificada de registro")
                        )
                        Append-SheetRows -range "'6.TBL_AUDITORIA'!A:A" -rowsArray @(,$audRow)
                    }

                    "supervisor_full_update" {
                        $updates = @{}
                        if ($data.modelo) { $updates["E"] = [string]$data.modelo }
                        if ($data.numero_serie) { $updates["F"] = [string]$data.numero_serie }
                        if ($data.area_ubicacion) { $updates["G"] = [string]$data.area_ubicacion }
                        if ($data.numero_parte) { $updates["D"] = [string]$data.numero_parte }
                        if ($data.tiene_faltantes) { $updates["I"] = [string]$data.tiene_faltantes }
                        if ($data.descripcion_faltantes -ne $null) { $updates["J"] = [string]$data.descripcion_faltantes }
                        if ($data.version_reporte) { $updates["N"] = [string]$data.version_reporte }

                        if ($updates.Count -gt 0) {
                            Update-InspectionRow -idInspeccion $data.id_inspeccion -updatesHash $updates
                        }

                        # Subir fotos adicionales si se adjuntaron
                        if ($data.fotos -and $data.fotos.Count -gt 0) {
                            $photoRows = @()
                            foreach ($p in $data.fotos) {
                                $photoRows += ,@(
                                    (Coalesce $p.id ("FOT-" + (Get-Date -Format "yyyyMMdd-HHmmss"))),
                                    $data.id_inspeccion,
                                    (Coalesce $p.nomina $data.nomina_supervisor),
                                    (Coalesce $p.tipo "Defecto"),
                                    (Coalesce $p.url "Foto añadida por corrección autorizada"),
                                    (Coalesce $p.timestamp $nowStr),
                                    (Coalesce $p.descripcion "")
                                )
                            }
                            Append-SheetRows -range "'3.TBL_EVIDENCIAS_FOTOS'!A:A" -rowsArray $photoRows
                        }

                        # Registrar en TBL_AUDITORIA
                        $audRow = @(
                            ("AUD-" + (Get-Date -Format "yyyyMMdd-HHmmss")),
                            $data.id_inspeccion,
                            $data.nomina_supervisor,
                            $nowStr,
                            "Corrección Supervisor",
                            (Coalesce $data.valores_anteriores "Varios"),
                            (Coalesce $data.valores_nuevos "Actualizado"),
                            (Coalesce $data.motivo "Modificación autorizada por supervisor")
                        )
                        Append-SheetRows -range "'6.TBL_AUDITORIA'!A:A" -rowsArray @(,$audRow)
                    }

                    "unlock_inspection" {
                        $audRow = @(
                            ("AUD-" + (Get-Date -Format "yyyyMMdd-HHmmss")),
                            $data.id_inspeccion,
                            $data.nomina_supervisor,
                            $nowStr,
                            "Desbloqueo de Edición",
                            "Bloqueado",
                            "Desbloqueado para Corrección",
                            (Coalesce $data.motivo "Supervisor otorgó acceso temporal al coordinador para corregir datos o fotos")
                        )
                        Append-SheetRows -range "'6.TBL_AUDITORIA'!A:A" -rowsArray @(,$audRow)
                    }

                    default {
                        $audRow = @(
                            ("AUD-" + (Get-Date -Format "yyyyMMdd-HHmmss")),
                            (Coalesce $data.id_inspeccion "GENERAL"),
                            (Coalesce $data.nomina_editor 9999),
                            $nowStr,
                            $action,
                            "-",
                            "-",
                            "Sincronización API procesada"
                        )
                        Append-SheetRows -range "'6.TBL_AUDITORIA'!A:A" -rowsArray @(,$audRow)
                    }
                }

                $resObj = @{ success = $true; message = "Sincronizado con Google Sheets exitosamente"; action = $action; timestamp = $nowStr }
                $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes(($resObj | ConvertTo-Json))
                $response.StatusCode = 200
                $response.ContentLength64 = $jsonBytes.Length
                $response.OutputStream.Write($jsonBytes, 0, $jsonBytes.Length)
            } catch {
                Write-Host "SYNC_ERROR: $_"
                $errObj = @{ success = $false; error = $_.ToString() }
                $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes(($errObj | ConvertTo-Json))
                $response.StatusCode = 500
                $response.ContentLength64 = $jsonBytes.Length
                $response.OutputStream.Write($jsonBytes, 0, $jsonBytes.Length)
            }
            $response.OutputStream.Close()
            continue
        }

        # ==================== STATIC FILE SERVING ====================
        if ([string]::IsNullOrWhiteSpace($rawPath)) {
            $rawPath = "index.html"
        }

        $filePath = Join-Path $root $rawPath

        if (Test-Path $filePath -PathType Leaf) {
            $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = switch ($extension) {
                ".html" { "text/html; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".svg"  { "image/svg+xml" }
                default { "application/octet-stream" }
            }

            $response.ContentType = $contentType
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }
        $response.OutputStream.Close()
    } catch {
        # Continuar escuchando
    }
}
