$SessionId = "cs_test_a1YT8spKU9A5MKZFSPxclHWQQp0cKwWMz5O83re5ft5I0fnxEo49QqKYur"
$AnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJobWR4eHNkZWVreG1lam5qd2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxOTAzMzcsImV4cCI6MjA3MDc2NjMzN30.N3aDfjRlinKAXN3DMAAy9jGK3j8SsM1V5-zpYE1SRKk"
$SupabaseUrl = "https://bhmdxxsdeekxmejnjwin.supabase.co"
$FunctionUrl = "$SupabaseUrl/functions/v1/stripe-sync?session_id=$SessionId"

Write-Host "Testing stripe-sync function..." -ForegroundColor Cyan
Write-Host "Session ID: $SessionId" -ForegroundColor Yellow
Write-Host ""

$headers = @{
    "apikey" = $AnonKey
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-WebRequest -Uri $FunctionUrl -Method GET -Headers $headers
    Write-Host "SUCCESS! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    Write-Host $response.Content
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        Write-Host "Error Body: $body" -ForegroundColor Red
    }
}

