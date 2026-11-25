param(
  [Parameter(Mandatory = $true)][string]$Source,
  [Parameter(Mandatory = $true)][string]$ResDir
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$legacy = @(
  @{ Dir = 'mipmap-mdpi'; Size = 48 },
  @{ Dir = 'mipmap-hdpi'; Size = 72 },
  @{ Dir = 'mipmap-xhdpi'; Size = 96 },
  @{ Dir = 'mipmap-xxhdpi'; Size = 144 },
  @{ Dir = 'mipmap-xxxhdpi'; Size = 192 }
)

$foreground = @(
  @{ Dir = 'mipmap-mdpi'; Size = 108 },
  @{ Dir = 'mipmap-hdpi'; Size = 162 },
  @{ Dir = 'mipmap-xhdpi'; Size = 216 },
  @{ Dir = 'mipmap-xxhdpi'; Size = 324 },
  @{ Dir = 'mipmap-xxxhdpi'; Size = 432 }
)

$src = [System.Drawing.Image]::FromFile((Resolve-Path -LiteralPath $Source))
try {
  $side = [Math]::Min($src.Width, $src.Height)
  $sx = [int](($src.Width - $side) / 2)
  $sy = [int](($src.Height - $side) / 2)
  $srcRect = New-Object System.Drawing.Rectangle($sx, $sy, $side, $side)

  function Save-Icon([string]$dirName, [string]$fileName, [int]$size, [bool]$round, [double]$scale) {
    $targetDir = Join-Path $ResDir $dirName
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null

    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    try {
      $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $g.Clear([System.Drawing.Color]::Transparent)

      if ($round) {
        $clip = New-Object System.Drawing.Drawing2D.GraphicsPath
        $clip.AddEllipse(0, 0, $size, $size)
        $g.SetClip($clip)
        $clip.Dispose()
      }

      $inner = [int][Math]::Round($size * $scale)
      $off = [int](($size - $inner) / 2)
      $dstRect = New-Object System.Drawing.Rectangle($off, $off, $inner, $inner)
      $g.DrawImage($src, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

      $out = Join-Path $targetDir $fileName
      $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
      $g.Dispose()
      $bmp.Dispose()
    }
  }

  foreach ($t in $legacy) {
    Save-Icon $t.Dir 'ic_launcher.png' $t.Size $false 1.0
    Save-Icon $t.Dir 'ic_launcher_round.png' $t.Size $true 1.0
  }
  foreach ($t in $foreground) {
    Save-Icon $t.Dir 'ic_launcher_foreground.png' $t.Size $false 0.66
  }
  Save-Icon '.' 'playstore-icon.png' 512 $false 1.0
}
finally {
  $src.Dispose()
}

Write-Output 'icons: ok'
