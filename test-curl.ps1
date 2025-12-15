# Test script for stripe-sync function (PowerShell)
# Usage: .\test-curl.ps1 -SessionId "cs_test_..." -AnonKey "your-anon-key"

param(
    [Parameter(Mandatory=$true)]
    [string]$SessionId,
    
    [Parameter(Mandatory=$true)]
    [string]$AnonKey
)

$SupabaseUrl = "https://bhmdxxsdeekxmejnjwin.supabase.co"
$FunctionUrl = "$SupabaseUrl/functions/v1/stripe-sync?session_id=$SessionId"

Write-Host "🧪 Testing stripe-sync function..." -ForegroundColor Cyan
Write-Host "Session ID: $SessionId" -ForegroundColor Yellow
Write-Host "URL: $FunctionUrl" -ForegroundColor Yellow
Write-Host ""

try {
    $headers = @{
        "apikey" = $AnonKey
        "Content-Type" = "application/json"
    }
    
    Write-Host "📡 Sending request..." -ForegroundColor Cyan
    $response = Invoke-WebRequest -Uri $FunctionUrl -Method GET -Headers $headers
    
    Write-Host "✅ Response Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "📥 Response Body:" -ForegroundColor Cyan
    Write-Host $response.Content
    
    # Try to parse JSON
    try {
        $json = $response.Content | ConvertFrom-Json
        Write-Host ""
        Write-Host "📊 Parsed Response:" -ForegroundColor Cyan
        $json | ConvertTo-Json -Depth 10
        
        if ($json.status -eq "accepted" -or $json.ok) {
            Write-Host ""
            Write-Host "🎉 Offer payment sync successful!" -ForegroundColor Green
            if ($json.offerId) {
                Write-Host "Offer ID: $($json.offerId)" -ForegroundColor Green
                Write-Host "Status: $($json.status)" -ForegroundColor Green
            }
        }
    } catch {
        Write-Host "⚠️  Response is not valid JSON" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error Response: $responseBody" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Test complete!" -ForegroundColor Cyan

